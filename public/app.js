const app = document.getElementById('app');

/* ================= Grundlagen ================= */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
// Kurzform fuer die Filterzeile: "19.08." -- der Platz dort ist eng, und das
// Jahr sagt neben einem Merkzeitpunkt von vorgestern nichts. Den nachlaufenden
// Punkt setzt die deutsche Schreibweise selbst; er wird hier NICHT angehaengt,
// sonst stuende dort "19.08..".
function fmtTagKurz(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
function fmtDay(day) {
  const d = new Date(day + 'T12:00:00');
  return d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function weekday(day) {
  return new Date(day + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'long' });
}
function fmtBytes(b) {
  if (!b) return '0 B';
  const u = ['B','KB','MB','GB'];
  const i = Math.min(Math.floor(Math.log(b)/Math.log(1024)), u.length-1);
  return (b/Math.pow(1024,i)).toFixed(i?1:0).replace('.',',') + ' ' + u[i];
}
const today = () => new Date().toLocaleDateString('sv-SE');

async function api(method, url, body, isForm = false) {
  const opts = { method, credentials: 'same-origin' };
  if (body !== undefined) {
    if (isForm) opts.body = body;
    else { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(body); }
  }
  const res = await fetch(url, opts);
  if (res.status === 401) { showLogin(); throw new Error('Sitzung abgelaufen'); }
  if (!res.ok) {
    let m = `Fehler (${res.status})`;
    try { const j = await res.json(); if (j.error) m = j.error; } catch {}
    throw new Error(m);
  }
  return res.status === 204 ? null : res.json();
}

function toast(msg, isErr = false) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast' + (isErr ? ' err' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

const ICON_PH = `<svg class="ph" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M3.5 17l5-4.5 3.5 3 3-2.5 5.5 4.5"/></svg>`;
// Eine Liste mit Haken -- das Zeichen fuer "was ist noch offen". Es steht
// neben dem Zahnrad und traegt dieselbe Groesse wie dieses.
const ICON_OFFEN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.5l2 2 3-3.5"/><path d="M3.5 13l2 2 3-3.5"/><path d="M3.5 19.5l2 2 3-3.5"/><path d="M12.5 6.5H21"/><path d="M12.5 13H21"/><path d="M12.5 19.5H21"/></svg>`;
const ICON_SEARCH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`;
const ICON_SYS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>`;
/* Die Marke der Anlage. SEIT 0.9.1 EINE AUSGELIEFERTE DATEI statt eines
   eingebauten SVG, und das hat zwei Gruende. Der eine ist die Sache: eine
   Marke gehoert dem Projekt und nicht einer Funktion in app.js -- wer sie
   austauscht, tauscht eine Datei aus und faesst keinen Quelltext an. Der
   andere ist ein Fehler, den sie mitgeschleppt hat: die Klasse `mark` gibt es
   in style.css ZWEIMAL -- einmal fuer die Marke und einmal fuer die kleinen
   Knoepfe am Kommentar (Anpinnen, Bericht, Aufgabe). Die zweite Regel gab der
   Marke einen Rahmen und einen runden Fuellgrund, den niemand gewollt hat.
   SIE HEISST DESHALB JETZT `marke` und traegt nichts von der anderen mit.

   GENOMMEN WIRD DIE DURCHSICHTIGE FASSUNG: die Flaechen, auf denen sie steht,
   sind ohnehin dunkel, und eine mitgelieferte Kachel saesse dort als
   sichtbares Rechteck darauf. marke-hell.svg bringt die Kachel mit und ist
   fuer helle Flaechen gedacht -- gebraucht wird sie in dieser Oberflaeche
   nicht, sie liegt fuer den Druck und fuer fremde Seiten daneben.

   alt="" UND KEIN TITEL: die Marke steht ueberall unmittelbar neben dem Namen
   der Anlage. Ein Vorleseprogramm saegte ihn sonst zweimal. */
const MARK = (s = 30) =>
  `<img class="marke" src="marke-dunkel.svg" width="${s}" height="${s}" alt="">`;

function splitUrl(u) {
  try {
    const x = new URL(u);
    const path = (x.pathname === '/' ? '' : x.pathname) + x.search + x.hash;
    return { dom: x.hostname.replace(/^www\./, ''), path };
  } catch { return { dom: u, path: '' }; }
}

// Sterne-Widget. Skala ist ueberall fest 1-5.
function stars(value, onPick, onReset) {
  const w = document.createElement('span');
  w.className = 'stars';
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i <= value ? ' on' : '');
    s.textContent = '★';
    s.dataset.v = i;
    w.appendChild(s);
  }
  w.addEventListener('mouseover', e => {
    if (!e.target.dataset.v) return;
    const h = +e.target.dataset.v;
    [...w.children].forEach((s, i) => s.classList.toggle('on', i < h));
  });
  w.addEventListener('mouseleave', () => {
    [...w.children].forEach((s, i) => s.classList.toggle('on', i < value));
  });
  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });
  if (onReset) {
    // Auch hier trifft der Doppelklick nur die eigene Zeile.
    w.title = 'Doppelklick setzt meine Bewertung zurück';
    w.addEventListener('dblclick', e => { e.preventDefault(); onReset(); });
  }
  return w;
}

// Mitwachsendes Textfeld. Die Hoehe folgt dem Inhalt, das Feld zeigt also
// immer den ganzen Text. Der Rahmen muss dazugerechnet werden, weil
// box-sizing global auf border-box steht -- sonst bliebe eine Scrollleiste von
// zwei Pixeln stehen. Das Element muss im Dokument haengen, sonst ist
// scrollHeight null. Gibt die Messfunktion zurueck, damit sie sich auch nach
// einem Wechsel des Inhalts von aussen ausloesen laesst.
function autoGrow(el) {
  if (!el) return () => {};
  el.classList.add('ta-auto');
  const fit = () => {
    // Der Zwischenschritt height:auto laesst ein hohes Feld auf zwei Zeilen
    // zusammenfallen. Die Seite wird dadurch kurz viel kuerzer, und der Browser
    // zieht die Bildlaufposition auf das neue Ende nach -- gibt sie danach aber
    // nicht von selbst zurueck. Ergebnis waere ein Sprung nach oben bei jedem
    // Tastendruck. Deshalb Position merken und noch im selben Durchlauf
    // zuruecksetzen, bevor der Browser zeichnet.
    const seite = document.scrollingElement || document.documentElement;
    const vorher = seite ? seite.scrollTop : 0;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + el.offsetHeight - el.clientHeight) + 'px';
    if (seite && seite.scrollTop !== vorher) seite.scrollTop = vorher;
  };
  el.addEventListener('input', fit);
  fit();
  return fit;
}

function confirmBox(title, text, confirmLabel = 'Löschen') {
  return new Promise(resolve => {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal"><h2>${esc(title)}</h2><p>${esc(text)}</p>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Abbrechen</button>
      <button class="btn btn-danger" data-yes>${esc(confirmLabel)}</button></div></div>`;
    document.body.appendChild(bd);
    const done = v => { bd.remove(); resolve(v); };
    bd.querySelector('[data-no]').onclick = () => done(false);
    bd.querySelector('[data-yes]').onclick = () => done(true);
    bd.onclick = e => { if (e.target === bd) done(false); };
    const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey, true); done(false); } };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-yes]').focus();
  });
}

/* DIE ZWEITE BESTAETIGUNG AM BILDSCHIRM.
   Ein eigener Dialog nach dem Muster von confirmBox() -- und ausdruecklich
   KEIN prompt(): dort stuende das Passwort im Klartext auf dem Bildschirm.
   DER GRUND STEHT DANEBEN, und das ist keine Zierde: ein Passwortfeld ohne
   Begruendung sieht aus wie eine Schikane. Wer liest, warum gefragt wird,
   versteht auch, warum es beim naechsten Mal wieder gefragt wird.
   Liefert true, wenn die Freigabe steht -- der Rufer handelt danach. Bei false
   ist entweder abgebrochen worden oder das Passwort war falsch; die Meldung
   steht dann schon. */
const BESTAETIGUNG_GRUND = 'Das trifft die Anlage als Ganzes. Damit eine fremde offene ' +
  'Anmeldung das nicht kann, bestätigst du es mit deinem Passwort.';

function bestaetigungsFeld(titel, was) {
  return new Promise(resolve => {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal"><h2>${esc(titel)}</h2>
      <p>${esc(was)}</p>
      <p class="desc" style="margin:0">${esc(BESTAETIGUNG_GRUND)}</p>
      <div class="field" style="margin:0"><label>Dein Passwort</label>
        <input class="input" id="best-pass" type="password" autocomplete="current-password"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Abbrechen</button>
      <button class="btn btn-accent" data-yes>Bestätigen</button></div></div>`;
    document.body.appendChild(bd);
    const feld = bd.querySelector('#best-pass');
    const done = v => { bd.remove(); resolve(v); };
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = () => done(feld.value);
    bd.onclick = e => { if (e.target === bd) done(null); };
    feld.addEventListener('keydown', e => { if (e.key === 'Enter') done(feld.value); });
    const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey, true); done(null); } };
    document.addEventListener('keydown', onKey, true);
    feld.focus();
  });
}

async function zweiteBestaetigung(zweck, ziel, titel, was) {
  const passwort = await bestaetigungsFeld(titel, was);
  // null heisst abgebrochen -- ein Abbruch, der trotzdem handelt, waere der
  // schlimmere Fehler. Ein LEERES Feld ist keine Bestaetigung, sondern ein
  // falsches Passwort und geht als solches an den Server.
  if (passwort === null) return false;
  try { await api('POST', '/api/bestaetigung', { passwort, zweck, ziel: ziel ?? null }); }
  catch (e) { toast(e.message, true); return false; }
  return true;
}

// Schreibvorgaenge der Reihe nach abarbeiten. Klick und Doppelklick auf
// dieselben Sterne loesen mehrere Aufrufe kurz hintereinander aus; ohne
// Serialisierung kann das Zuruecksetzen vor dem Setzen ankommen.
let queue = Promise.resolve();
const enqueue = fn => (queue = queue.then(fn, fn));

/* ================= Anmeldung ================= */
let TITLE_PUBLIC = 'Kriterion';
let VERSION = '';   // kommt von /api/config, steht auch vor der Anmeldung
let TITLE_APP = 'Kriterion';
let MIN_PASSWORT = 10;   // Vorgabe des Servers, kommt mit /api/config
/* Ob diese Anlage Anfragen annimmt. KOMMT VOM SERVER und wird hier nie
   geraten: die Oberfläche zeigt das Formular, der Server entscheidet über die
   Anfrage. Wer das Feld von Hand auf true setzt, bekommt ein Formular, dessen
   Anfrage an derselben Antwort endet wie jede andere — die Schranke liegt
   nicht hier. */
let REGISTRIERUNG = false;

/* Erste Einrichtung. Nennt den vorhandenen Bestand mit keinem Wort: die Seite
   steht vor der Anmeldung, dort gilt dieselbe Regel wie fuer den zweiten
   Titel. */
function showSetup(errMsg) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}
    <h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Erste Einrichtung — Benutzername und Passwort wählen.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="su">Benutzername</label>
      <input class="input" id="su" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="sp">Passwort</label>
      <input class="input" id="sp" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="sp2">Passwort wiederholen</label>
      <input class="input" id="sp2" type="password" autocomplete="new-password"></div>
    <p class="sub" style="margin:0 0 4px">Mindestens ${MIN_PASSWORT} Zeichen. Über die
      Oberfläche gibt es keine Wiederherstellung.</p>
    <button class="btn btn-accent" id="sb">Einrichten</button>
  </div></div>`;
  document.title = TITLE_PUBLIC;

  const u = document.getElementById('su'), p1 = document.getElementById('sp'),
        p2 = document.getElementById('sp2'), b = document.getElementById('sb');
  const submit = async () => {
    if (!u.value.trim()) return showSetup('Bitte einen Benutzernamen angeben.');
    if (p1.value.length < MIN_PASSWORT)
      return showSetup(`Das Passwort muss mindestens ${MIN_PASSWORT} Zeichen lang sein.`);
    if (p1.value !== p2.value) return showSetup('Die beiden Passwörter stimmen nicht überein.');
    b.disabled = true; b.textContent = 'Einrichten …';
    try {
      const res = await fetch('/api/setup', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u.value, password: p1.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        return showSetup(j.error || 'Einrichtung fehlgeschlagen.');
      }
      location.hash = '#/';
      start();
    } catch { showSetup('Server nicht erreichbar.'); }
  };
  b.onclick = submit;
  [u, p1, p2].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  u.focus();
}

function showLogin(errMsg) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  // Teilt der Seite mit, dass jetzt die Anmeldung steht: nur dort teilen sich
  // Inhalt und Versionszeile die Fensterhoehe.
  document.body.classList.add('anmeldung');
  // Die Anmeldeseite bleibt bei der Vorgabegroesse: der Endpunkt davor liefert
  // nur den oeffentlichen Titel, sonst nichts.
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}
    <h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Bitte anmelden, um fortzufahren.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="lu">Benutzername</label>
      <input class="input" id="lu" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="lp">Passwort</label>
      <input class="input" id="lp" type="password" autocomplete="current-password"></div>
    <button class="btn btn-accent" id="lb">Anmelden</button>
    ${/* DIE SELBSTANMELDUNG, seit 0.9.1 — und sie steht nur da, wenn der
          Server sagt, dass sie an ist. Ein Formular, das ins Leere führt,
          wäre schlimmer als keines: der Anfragende bekäme dieselbe freundliche
          Antwort wie alle und wartete auf eine Mail, die nie kommt.
          KEIN PASSWORTFELD. Der Anfragende gibt Namen und Adresse an, sonst
          nichts — sein Passwort wählt er später über den Einladungslink, und
          zwar erst, wenn ein Admin ihn hereingelassen hat. */''}
    ${REGISTRIERUNG ? `<p class="sub anmeld-trenner">Noch keinen Zugang?</p>
      <button class="btn anmeld-zweitweg" id="l-anfrage">Zugang anfragen</button>` : ''}
  </div></div>`;
  document.title = TITLE_PUBLIC;
  if (REGISTRIERUNG) document.getElementById('l-anfrage').onclick = () => showAnfrage();

  const u = document.getElementById('lu'), p = document.getElementById('lp'), b = document.getElementById('lb');
  const submit = async () => {
    b.disabled = true; b.textContent = 'Anmelden …';
    try {
      const res = await fetch('/api/login', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u.value, password: p.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        showLogin(j.error || 'Anmeldung fehlgeschlagen.');
        return;
      }
      location.hash = '#/';
      start();
    } catch { showLogin('Server nicht erreichbar.'); }
  };
  b.onclick = submit;
  [u, p].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  u.focus();
}

/* Die Selbstanmeldung: das Formular und die Antwort darauf, seit 0.9.1.

   ZWEI FELDER UND KEIN PASSWORT. Wer einen Zugang will, gibt seinen Wunschnamen
   und seine Adresse an — mehr weiß die Anlage zu diesem Zeitpunkt nicht von
   ihm, und mehr braucht sie auch nicht: das Passwort wählt er später selbst
   über den Einladungslink, und den bekommt er erst, wenn ein Admin ihn
   hereingelassen hat.

   DIE ANTWORT KOMMT VOM SERVER UND WIRD HIER NICHT ERFUNDEN. Sie sieht in
   jeder Lage gleich aus — unbekannter Name, bekannter Name, bekannte Adresse,
   Deckel erreicht, Schalter aus —, und diese Seite darf daraus keine zweite
   Auskunft machen. Deshalb steht hier kein „Name bereits vergeben" und kein
   Unterschied im Aussehen; die Meldung wird gezeigt, wie sie ankommt. */
function showAnfrage(errMsg, werte = {}) {
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}
    <h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Zugang anfragen. Ein Admin entscheidet darüber — und vorher bestätigst du
      per E-Mail, dass die Adresse dir gehört.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="an-name">Wunsch-Benutzername</label>
      <input class="input" id="an-name" autocomplete="username" autocapitalize="off"
        spellcheck="false" maxlength="64" value="${esc(werte.name || '')}"></div>
    <div class="field"><label for="an-mail">E-Mail-Adresse</label>
      <input class="input" id="an-mail" type="email" autocomplete="email" autocapitalize="off"
        spellcheck="false" maxlength="254" value="${esc(werte.adresse || '')}"></div>
    <button class="btn btn-accent" id="an-ab">Anfrage abschicken</button>
    <p class="sub" style="margin:14px 0 0"><a href="#" id="an-zurueck">Zurück zur Anmeldung</a></p>
  </div></div>`;
  document.title = TITLE_PUBLIC;
  const n = document.getElementById('an-name'), m = document.getElementById('an-mail'),
        b = document.getElementById('an-ab');
  document.getElementById('an-zurueck').onclick = (e) => { e.preventDefault(); showLogin(); };
  const submit = async () => {
    b.disabled = true; b.textContent = 'Abschicken …';
    try {
      const res = await fetch('/api/registrierung', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n.value, adresse: m.value })
      });
      const j = await res.json().catch(() => ({}));
      /* NUR DIE BREMSE UND DER AUSFALL FÜHREN ZURÜCK INS FORMULAR. Alles
         andere endet auf derselben Dankseite — auch das, was der Server still
         verworfen hat. Die Eingaben bleiben dabei stehen, damit ein zweiter
         Anlauf nach einer 429 nicht am leeren Formular beginnt. */
      if (!res.ok) return showAnfrage(j.error || 'Die Anfrage konnte gerade nicht gestellt werden.',
        { name: n.value, adresse: m.value });
      showAnfrageDank(j.meldung);
    } catch { showAnfrage('Server nicht erreichbar.', { name: n.value, adresse: m.value }); }
  };
  b.onclick = submit;
  [n, m].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  n.focus();
}

// Die Dankseite. DER TEXT KOMMT VOM SERVER, damit es ihn nur einmal gibt --
// eine zweite Ausfertigung hier liefe beim naechsten Wort auseinander.
function showAnfrageDank(meldung) {
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}
    <h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub" id="an-dank">${esc(meldung || '')}</p>
    <p class="sub"><a href="#" id="an-zurueck2">Zurück zur Anmeldung</a></p>
  </div></div>`;
  document.getElementById('an-zurueck2').onclick = (e) => { e.preventDefault(); showLogin(); };
}

/* Der Bestätigungslink aus der Selbstanmeldung.

   ER HAT KEINE PASSWORTKRAFT, und diese Seite ist die bauliche Form davon: sie
   setzt kein Passwort, sie meldet niemanden an, und danach steht man wieder
   auf der Anmeldeseite. Sie schickt genau einen Aufruf ab und zeigt sein
   Ergebnis.

   DER SCHLÜSSEL STEHT IM FRAGMENT (#/bestaetigung/…) und geht damit nie an den
   Server — dieselbe Bauform wie beim Einladungslink. Ein Vorschaudienst, der
   Links im Postfach vorab abruft, holt nur die Seite und bestätigt gerade
   NICHT: der Browser schickt den Schlüssel erst von hier aus im Rumpf. */
async function showBestaetigung(schluessel) {
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}<h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Der Link wird geprüft …</p></div></div>`;
  document.title = TITLE_PUBLIC;
  let res, j = {};
  try {
    res = await fetch('/api/registrierung/bestaetigen', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schluessel })
    });
    j = await res.json().catch(() => ({}));
  } catch {
    /* KEIN NETZ IST KEINE ABSAGE. Wie bei der Einladungsseite bleibt der
       Schlüssel in der Adresse stehen, und ein Neuladen trägt wieder. */
    return zeichne(false, 'Server nicht erreichbar.', true);
  }
  if (!res.ok) return zeichne(false, j.error || 'Dieser Bestätigungslink gilt nicht mehr.',
    res.status !== 400);
  location.hash = '#/';
  zeichne(true, '');

  function zeichne(gut, meldung, nochmal) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${MARK(40)}
      <h1>${esc(TITLE_PUBLIC)}</h1>
      ${gut ? `<p class="sub" id="best-gut"><strong>Danke — deine Adresse ist bestätigt.</strong>
        Die Anfrage liegt jetzt beim Admin. Wird sie freigeschaltet, bekommst du eine zweite
        E-Mail mit dem Link, über den du dein Passwort setzt.</p>`
        : `<div class="login-error">${esc(meldung)}</div>
        ${nochmal ? `<p class="sub">Dein Link ist davon <strong>nicht</strong> betroffen — er gilt
          weiter.</p><button class="btn btn-accent" id="best-neu">Noch einmal versuchen</button>`
          : ''}`}
      <p class="sub" style="margin:14px 0 0"><a href="#" id="best-zurueck">Zur Anmeldung</a></p>
    </div></div>`;
    const neu = document.getElementById('best-neu');
    if (neu) neu.onclick = () => showBestaetigung(schluessel);
    document.getElementById('best-zurueck').onclick = (e) => {
      e.preventDefault(); location.hash = '#/'; showLogin();
    };
  }
}

/* Der Link aus einer Einladung oder einer Rücksetzung.

   EIN ZUSTAND DIESER SEITE, KEINE ZWEITE DATEI. Eine zweite ausgelieferte
   Seite hieße eine zweite Stelle für Kopfzeilen, für die
   Content-Security-Policy und für die Sicherheitsregel der ausgelieferten
   Dateien — drei Stellen, an denen etwas auseinanderlaufen kann, für ein
   Formular mit zwei Feldern.

   DER SCHLÜSSEL STEHT IM FRAGMENT DER ADRESSE (#/einladung/…), und das ist
   der Grund für diese Bauform: ein Fragment geht nie an den Server. Es steht
   damit in keinem Zugriffsprotokoll und in keinem Referrer. Der Browser
   schickt es von hier aus im Rumpf.

   DER NAME KOMMT ERST VOM SERVER, wenn der Link trägt. Vorher steht auf
   dieser Seite nichts über den Zugang — sonst verriete ein geratener Link
   einen Benutzernamen. */
async function showEinladung(schluessel) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(40)}<h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Der Link wird geprüft …</p></div></div>`;
  document.title = TITLE_PUBLIC;

  let stand;
  try {
    const res = await fetch('/api/token/pruefen', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: schluessel })
    });
    stand = await res.json().catch(() => ({}));
    /* EINE VORÜBERGEHENDE ABSAGE DARF DEN SCHLÜSSEL NICHT WEGWERFEN, und das
       ist ein Befund aus dem Betrieb, kein Vorsichtsmaß: bis 0.8.91 leerte
       JEDES `!res.ok` die Adresse — auch die 429 der Anmeldebremse. Wer sich
       vorher ein paarmal beim Anmelden vertippt hatte und danach seinen
       GÜLTIGEN Einladungslink anklickte, sah eine Fehlermeldung, lud neu und
       stand auf der Anmeldeseite: der Link war nie tot, die Adresse war weg.
       Nachgestellt an einem echten Server; der Link galt danach unverändert
       weiter.
       DESHALB WIRD NUR BEI DER ENDGÜLTIGEN ABSAGE GELEERT. Bei allem anderen
       — Bremse, Serverfehler, kein Netz — bleibt der Schlüssel in der Adresse
       stehen, und die Seite bietet an, es noch einmal zu versuchen. Neuladen
       trägt dann ebenfalls wieder.
       400 IST DIE ENDGÜLTIGE: es ist die EINE Absage aus 0.8.80 — abgelaufen,
       verbraucht, erfunden, Zugang gesperrt, Frist verstrichen. In all diesen
       Fällen hilft nur ein neuer Link. */
    if (res.status === 400) {
      location.hash = '#/';
      return showLogin(stand.error || 'Dieser Link gilt nicht mehr.');
    }
    if (!res.ok) return spaeter(stand.error || 'Der Server hat den Link gerade nicht geprüft.');
  } catch { return spaeter('Server nicht erreichbar.'); }

  const min = stand.minPassword || MIN_PASSWORT;
  zeichne();

  /* Die Seite für eine VORÜBERGEHENDE Absage. Sie hält den Schlüssel fest und
     bietet einen zweiten Anlauf an — ohne Neuladen, aber ein Neuladen tut es
     auch, denn die Adresse steht noch. Bewusst KEIN Zeitgeber, der von selbst
     wiederholt: die Bremse antwortet mit einer Wartezeit, und ein Browser,
     der im Sekundentakt nachfragt, hält sie am Leben statt sie ablaufen zu
     lassen. Der Mensch drückt, wenn er so weit ist. */
  function spaeter(meldung) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${MARK(40)}
      <h1>${esc(TITLE_PUBLIC)}</h1>
      <div class="login-error">${esc(meldung)}</div>
      <p class="sub">Dein Link ist davon <strong>nicht</strong> betroffen — er gilt weiter.
        Versuch es gleich noch einmal.</p>
      <button class="btn btn-accent" id="eb-neu">Noch einmal versuchen</button>
    </div></div>`;
    document.getElementById('eb-neu').onclick = () => showEinladung(schluessel);
  }

  function zeichne(errMsg) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${MARK(40)}
      <h1>${esc(TITLE_PUBLIC)}</h1>
      <p class="sub">${stand.ohnePasswort
        ? `Willkommen, <strong>${esc(stand.username)}</strong> — bitte ein Passwort wählen.`
        : `Neues Passwort für <strong>${esc(stand.username)}</strong>.`}</p>
      ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
      <div class="field"><label for="ep">Passwort</label>
        <input class="input" id="ep" type="password" autocomplete="new-password"></div>
      <div class="field"><label for="ep2">Passwort wiederholen</label>
        <input class="input" id="ep2" type="password" autocomplete="new-password"></div>
      ${/* DIE FRIST GEHÖRT AN DIE STELLE, AN DER SIE LÄUFT. Sie beginnt mit
            genau diesem Aufruf — vorher ist nichts geschehen, egal wie lange
            die Mail im Postfach lag. Wer sie hier nicht liest, erfährt sie
            erst an der Absage, und dann ist es zu spät. */''}
      <p class="sub" style="margin:0 0 4px">Mindestens ${min} Zeichen. Dieser Link gilt danach
        nicht mehr, und alle bestehenden Anmeldungen dieses Zugangs werden beendet.
        ${stand.minuten ? `<br><strong>Du hast jetzt ${stand.minuten} Minuten Zeit</strong> —
        neu laden darfst du darin beliebig oft. Danach brauchst du einen neuen Link vom
        Admin.` : ''}</p>
      <button class="btn btn-accent" id="eb">Passwort setzen</button>
    </div></div>`;

    const p1 = document.getElementById('ep'), p2 = document.getElementById('ep2'),
          b = document.getElementById('eb');
    const submit = async () => {
      if (p1.value.length < min) return zeichne(`Das Passwort muss mindestens ${min} Zeichen lang sein.`);
      if (p1.value !== p2.value) return zeichne('Die beiden Passwörter stimmen nicht überein.');
      b.disabled = true; b.textContent = 'Passwort setzen …';
      try {
        const res = await fetch('/api/token/einloesen', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: schluessel, passwort: p1.value })
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          return zeichne(j.error || 'Das Passwort konnte nicht gesetzt werden.');
        }
        // Angemeldet ist man damit schon -- der Server hat den Cookie
        // mitgeschickt. Die Adresse wird geleert: der Link ist verbraucht.
        location.hash = '#/';
        start();
      } catch { zeichne('Server nicht erreichbar.'); }
    };
    b.onclick = submit;
    [p1, p2].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
    p1.focus();
  }
}

/* ================= Blöcke der Detailansicht ================= */
// Reihenfolge und Einklappzustand gelten global, nicht je Eintrag, und liegen
// auf dem Server. Verschoben wird nur innerhalb des jeweiligen Bereichs:
// Kommentare in der schmalen Spalte oder eine Kategorieauswahl über die volle
// Breite wären schlechter als jede Vorgabe.
const BLOCK_VORGABE = {
  seite: ['kategorie', 'tags', 'bewertung'],
  unten: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
let BLOECKE = { seite: [...BLOCK_VORGABE.seite], unten: [...BLOCK_VORGABE.unten], zu: [] };

// Unbekannte Namen fliegen raus, fehlende hängen sich in der Vorgabereihenfolge
// hinten an. So überlebt die Einstellung auch einen später hinzugekommenen Block.
function ordneBereich(gespeichert, vorgabe) {
  const sauber = (Array.isArray(gespeichert) ? gespeichert : []).filter((k, i, a) => vorgabe.includes(k) && a.indexOf(k) === i);
  return [...sauber, ...vorgabe.filter(k => !sauber.includes(k))];
}

function uebernimmBloecke(roh) {
  BLOECKE = {
    seite: ordneBereich(roh && roh.seite, BLOCK_VORGABE.seite),
    unten: ordneBereich(roh && roh.unten, BLOCK_VORGABE.unten),
    zu: (roh && Array.isArray(roh.zu) ? roh.zu : [])
      .filter(k => [...BLOCK_VORGABE.seite, ...BLOCK_VORGABE.unten].includes(k))
  };
}

const speichereBloecke = () =>
  api('PUT', '/api/settings', { bloecke: BLOECKE }).catch(e => toast(e.message, true));

function ordneBloecke() {
  [['seite', 'blocks-seite'], ['unten', 'blocks-unten']].forEach(([bereich, kasten]) => {
    const box = document.getElementById(kasten);
    if (!box) return;
    BLOECKE[bereich].forEach(name => {
      const el = box.querySelector(`[data-block="${name}"]`);
      if (el) box.appendChild(el);       // appendChild verschiebt, kopiert nicht
    });
  });
}

/* Die Zahlen am Kommentarblock. GEBILDET AN EINEM ORT: derselbe Satz steht
   aufgeklappt wie eingeklappt in der Kopfzeile, und zwei Bildungen liefen
   frueher oder spaeter auseinander.

       12 Kommentare, davon 3 Berichte und 5 Aufgaben (2 Erledigt)

   DAVON, nicht Mittelpunkte: die Zahlen dahinter sind TEILMENGEN, keine
   Summanden -- addiert ergaeben sie mehr Kommentare, als es gibt. Die Klammer
   nistet die zweite Ebene ein: das Erledigte steckt IN den Aufgaben, sonst
   schrumpfte die Zahl beim Abhaken.
   Eine Gruppe mit null verschwindet ganz ("davon 0 Berichte" ist keine
   Auskunft), ohne Erledigte faellt die Klammer weg, und ohne Kommentare bleibt
   der Hinweis ganz leer -- wie bei den Links.
   DIE NOTIZ BLEIBT UNGENANNT: sie ist der Zustand ohne Markierung und hat
   weder eigenes Wort noch Knopf noch Kante; wer rechnen will, kommt selbst auf
   sie. DIE ANPINNUNG STEHT NICHT IN DER ZEILE: sie ist die zweite,
   unabhaengige Achse, und zwei Achsen in einer Zeile sind nicht mehr lesbar.
   "Kommentar" ist eine FESTE Beschriftung und kein zwoelftes Vokabelwort --
   anders als Sache und Zeitpunkt verschiebt es sich nicht mit dem Gegenstand. */
function kommentarZahlen(kommentare) {
  const liste = kommentare || [];
  const n = liste.length;
  if (!n) return '';
  const zaehle = (...arten) => liste.filter(c => arten.includes(c.kind)).length;
  const berichte = zaehle('report');
  // Erledigtes zaehlt MIT zu den Aufgaben, nicht daneben.
  const aufgaben = zaehle('task', 'done');
  const fertig = zaehle('done');
  const teile = [];
  if (berichte) teile.push(`${berichte} ${vBericht(berichte)}`);
  if (aufgaben) teile.push(`${aufgaben} ${vAufgabe(aufgaben)}`
    + (fertig ? ` (${fertig} ${V.aufgabeErledigt})` : ''));
  return `${n} ${n === 1 ? 'Kommentar' : 'Kommentare'}`
    + (teile.length ? `, davon ${teile.join(' und ')}` : '');
}

// Kurzfassung des Inhalts für die eingeklappte Kopfzeile.
function blockZusammenfassung(name, item) {
  switch (name) {
    case 'kategorie': return item.category ? item.category.name : 'keine';
    case 'tags': return String(item.tags.length);
    case 'bewertung': return item.avgRating ? '⌀ ' + item.avgRating.toFixed(1).replace('.', ',') : 'keine Wertung';
    case 'beschreibung': {
      const t = (item.description || '').trim().replace(/\s+/g, ' ');
      if (!t) return 'leer';
      return t.length > 40 ? t.slice(0, 40) + ' …' : t;
    }
    case 'testtage': return String(item.testDays.length);
    case 'links': return String(item.links.length);
    case 'dateien': return String((item.attachments || []).length);
    /* Der Kommentarblock traegt seine Zahlen NICHT hier, sondern in seinem
       eigenen Hinweis in der Kopfzeile -- und die steht auch eingeklappt da.
       Beides zugleich waere derselbe Satz zweimal nebeneinander. Das ist die
       ausdruecklich entschiedene Abweichung von den uebrigen Bloecken: sie
       tragen hier eine sehr kurze Kurzfassung, der Kommentarblock den vollen
       Satz an seiner eigenen Stelle. */
    case 'kommentare': return '';
    default: return '';
  }
}

// Wird nach jedem Neuzeichnen aufgerufen und muss deshalb mehrfach ausführbar
// sein: der Testtagblock etwa schreibt seine Kopfzeile jedes Mal neu.
function ruesteBloeckeAus(item) {
  document.querySelectorAll('.block[data-block]').forEach(block => {
    const name = block.dataset.block;
    const kopf = block.querySelector('.block-head');
    if (!kopf) return;

    if (!kopf.querySelector('.bgrip')) {
      const griff = document.createElement('span');
      griff.className = 'bgrip'; griff.textContent = '⣿';
      griff.title = 'Block verschieben';
      const pfeil = document.createElement('span');
      pfeil.className = 'bcaret';
      kopf.prepend(pfeil);
      kopf.prepend(griff);
      const summe = document.createElement('span');
      summe.className = 'bsumme';
      kopf.querySelector('.label').after(summe);
      kopf.classList.add('block-head-x');
    }

    const zu = BLOECKE.zu.includes(name);
    block.classList.toggle('zu', zu);
    kopf.querySelector('.bcaret').textContent = zu ? '▸' : '▾';
    const summe = kopf.querySelector('.bsumme');
    // Eine leere Kurzfassung bleibt leer: "()" waere eine Klammer um nichts.
    const kurz = zu ? blockZusammenfassung(name, item) : '';
    summe.textContent = kurz ? `(${kurz})` : '';

    // Klick auf die Kopfzeile klappt ein und aus. Griff und alles Bedienbare
    // darin sind ausgenommen, sonst löst das Zurücksetzen der Bewertung
    // nebenbei das Einklappen aus.
    kopf.onclick = (e) => {
      if (e.target.closest('button, input, select, a, .bgrip')) return;
      BLOECKE.zu = zu ? BLOECKE.zu.filter(k => k !== name) : [...BLOECKE.zu, name];
      speichereBloecke();
      ruesteBloeckeAus(item);
      // Was eingeklappt war, konnte nicht gemessen werden -- die Wolke im
      // Tagblock hat deshalb keine Zeilenbegrenzung. Jetzt steht sie im
      // Dokument und laesst sich vermessen. Nur beim AUFklappen: beim
      // Einklappen gaebe es wieder nichts zu messen.
      if (name === 'tags' && zu && wolkeNeuzeichnen) wolkeNeuzeichnen();
    };

    if (!block.dataset.ziehbar) {
      block.dataset.ziehbar = '1';
      const bereich = BLOCK_VORGABE.seite.includes(name) ? 'seite' : 'unten';
      makeSortable(block, {
        axis: 'y', selector: '.block[data-block]', handle: '.bgrip',
        onDrop: (kinder) => {
          BLOECKE[bereich] = kinder.map(k => k.dataset.block).filter(Boolean);
          speichereBloecke();
          toast('Anordnung gespeichert');
        }
      });
    }
  });
}

// Versionsnummer. Sie steht einmal im Grundgeruest, ausserhalb von #app --
// damit ist sie auf jeder Ansicht sichtbar, ohne in vier Aufbauten gepflegt
// werden zu muessen. Mittig unter dem Inhalt, damit sie nie etwas verdeckt.
function zeigeVersion() {
  const el = document.getElementById('version');
  if (el) el.textContent = VERSION ? `Kriterion ${VERSION}` : '';
}

/* ================= Bilder in Kommentaren ================= */
// Bilder aus einem Einfuegevorgang holen. Strg+V liefert sie als Dateien im
// Zwischenablage-Objekt; alles, was kein Bild ist, wird uebergangen, damit
// eingefuegter Text weiterhin normal im Feld landet.
function bilderAusZwischenablage(e) {
  const daten = e.clipboardData;
  if (!daten) return [];
  return [...(daten.files || [])].filter(f => f.type.startsWith('image/'));
}

// Dateiauswahl fuer Bilder, ohne dass ein Feld im Aufbau stehen muss.
function waehleBilder(fertig) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.multiple = true;
  inp.onchange = () => { fertig([...inp.files]); inp.remove(); };
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.click();
}

// Multipart-Formular schicken. api() sendet JSON und taugt dafuer nicht.
async function sendeFormular(pfad, formular) {
  const a = await fetch(pfad, { method: 'POST', body: formular, credentials: 'same-origin' });
  const daten = await a.json().catch(() => ({}));
  if (a.status === 401) { showLogin(); throw new Error('Sitzung abgelaufen'); }
  if (!a.ok) throw new Error(daten.error || 'Fehlgeschlagen');
  return daten;
}

/* ================= Fokuspunkt der Vorschau ================= */
// Zwei Prozentwerte als object-position. Zugeschnitten wird nichts: die Datei
// bleibt, wie sie ist, nur das sichtbare Fenster der quadratischen Vorschau
// verschiebt sich. Fehlende Werte (aeltere Fotos) landen in der Mitte.
function fokus(p) {
  // Vorsicht: Number(null) ist 0, nicht NaN -- deshalb erst auf eine Zahl
  // pruefen und nicht bloss umwandeln. Sonst rutscht ein fehlender Wert in
  // die Ecke oben links statt in die Mitte.
  const z = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 50);
  return `${z(p && p.focus_x)}% ${z(p && p.focus_y)}%`;
}

/* ================= Tagwolken ================= */
// Sortierung: hervorgehobene Tags (aktiver Filter bzw. vergebener Tag) immer
// vorn, danach nach Haeufigkeit, bei Gleichstand nach Namen. Sonst rutscht ein
// gerade benutzter Tag beim Aufklappen aus dem Blick.
function sortiereWolke(tags, hervor) {
  return [...tags].sort((a, b) => {
    const ha = hervor.has(a.id) ? 0 : 1, hb = hervor.has(b.id) ? 0 : 1;
    if (ha !== hb) return ha - hb;
    if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count;
    return a.name.localeCompare(b.name, 'de');
  });
}

// Begrenzt die Wolke auf n Zeilen und meldet, ob dabei etwas abgeschnitten
// wurde. n = 0 hebt die Begrenzung auf. Die Zeilenhoehe wird am ersten Element
// gemessen statt geraten -- sie haengt an der eingestellten Schriftgroesse.
const WOLKE_LUECKE = 6;
function begrenzeWolke(box, zeilen) {
  if (!zeilen) { box.style.maxHeight = ''; box.style.overflow = ''; return false; }
  const erste = box.firstElementChild;
  if (!erste) return false;
  const hoehe = erste.offsetHeight || 0;
  // EIN EINGEKLAPPTER BLOCK MISST NULL. Seine Kinder stehen auf
  // display: none, und aus der Hoehe 0 entstuende eine winzige feste
  // maxHeight, die nach dem Aufklappen stehenbliebe -- die Wolke ginge nur
  // halb auf. Also gar nichts setzen und Vorhandenes wegnehmen.
  // ZWEITER WEG NOETIG: das Aufklappen zeichnet die Wolke neu
  // (ruesteBloeckeAus). Dieser Weg haelt die falsche Hoehe fern, jener holt
  // die richtige nach; einer allein laesst je einen Fall stehen.
  if (!hoehe) { box.style.maxHeight = ''; box.style.overflow = ''; return false; }
  box.style.maxHeight = (zeilen * hoehe + (zeilen - 1) * WOLKE_LUECKE) + 'px';
  box.style.overflow = 'hidden';
  return box.scrollHeight > box.clientHeight + 1;
}

// Aufklappzustand der beiden Wolken, absichtlich nur fuer die Sitzung im
// Speicher: er sagt nichts ueber den Bestand aus und gehoert nicht auf den
// Server.
const wolkeOffen = { uebersicht: false, detail: false };

// Wer die Wolke der Detailansicht neu zeichnen kann. Sie laesst sich nur
// messen, wenn ihr Block offen ist -- klappt er auf, muss sie noch einmal
// gezeichnet werden, und das kann nur die Detailansicht selbst.
// Modulweit statt als Ereignis am Dokument: ein Behandler am bleibenden
// Dokument ueberlebte jeden Neuaufbau und muesste von Hand abgeraeumt werden.
// Geleert wird in route(), gesetzt in renderDetail() -- so zeigt sie nie auf
// eine Ansicht, die es nicht mehr gibt.
let wolkeNeuzeichnen = null;

/* ================= Vokabular und Darstellung ================= */
// Die Oberflaeche benennt sich um, die Daten nicht. Alle Texte sind so
// geschrieben, dass weder Beiwort noch Fall vorkommt -- sonst muesste man das
// Geschlecht des eingetragenen Wortes kennen. Merksatz fuer spaetere Texte:
// Plural im Nominativ und Akkusativ ist immer sicher ("die X"), Dativ Plural
// haengt ein -n an ("bei allen Objekten") und Singular zieht Artikel nach sich.
// Beides deshalb meiden.
let V = {
  sacheEinzahl: 'Eintrag', sacheMehrzahl: 'Einträge',
  merkmalJa: 'Getestet', merkmalNein: 'Ungetestet',
  zeitpunktEinzahl: 'Testtag', zeitpunktMehrzahl: 'Testtage',
  berichtEinzahl: 'Bericht', berichtMehrzahl: 'Berichte',
  aufgabeEinzahl: 'Aufgabe', aufgabeMehrzahl: 'Aufgaben',
  aufgabeErledigt: 'Erledigt'
};

// Weiterschaltung des Aufgabenknopfes: Notiz -> Aufgabe -> erledigt -> Notiz.
// Eine Abfolge, kein Entweder-oder -- deshalb ein Knopf statt dreier. Der
// Berichtsknopf bleibt daneben ein gewoehnlicher Umschalter. Aus einem Bericht
// wird beim Druck eine Aufgabe, nicht gleich ein erledigtes Todo.
// Funktionsdeklaration, nicht const: sonst haengt sie nicht am window und der
// Pruefstand kaeme nicht heran.
function aufgabeWeiter(art) {
  return { note: 'task', task: 'done', done: 'note', report: 'task' }[art] || 'task';
}
/* --- Das Gewicht eines Kriteriums: Komma herein, Komma hinaus -------------
   "1,2" und "1.2" ergeben beide 1.2; alles andere ergibt NaN und faellt damit
   beim Server durch gueltigesGewicht(). Auch "" und " " -- EIN LEERES FELD IST
   KEINE NULL. Number('') ergibt in JavaScript 0, und ohne diese Klemme liefe
   ein geloeschtes Feld in eine Absage "muss zwischen 0,2 und 2 sein", die
   niemand verlangt hat.
   Die Spanne selbst steht NICHT hier, sondern nur im Server: zwei Stellen fuer
   dieselbe Grenze liefen auseinander, und die Oberflaeche waere die, die es
   nicht meldet. */
const gewichtAusText = (roh) => {
  const t = String(roh ?? '').trim();
  return t === '' ? NaN : Number(t.replace(',', '.'));
};

/* 1 -> "1", 1.2 -> "1,2", 1.25 -> "1,25". KEINE nachlaufenden Nullen: "1,50"
   sieht nach einer Genauigkeit aus, die es nicht gibt -- und "1,0" nach einer
   Einstellung, wo in Wahrheit die Vorgabe steht.
   .replace('.', ',') ist die Konvention der ganzen Oberflaeche. */
const gewichtText = (g) => String(Math.round(Number(g) * 100) / 100).replace('.', ',');

/* Die Marke hinter einem Kriteriennamen -- ABGELEITET, kein Schalter: bei
   Gewicht 1 steht dort nichts. "×1" an jeder Zeile waere Rauschen ohne
   Aussage, aus demselben Grund, aus dem die Durchschnittsspalte bei einem
   einzigen Zugang entfaellt.
   Ohne diese Anzeige saehe die Kopfzahl schlicht falsch aus: mit Gewichten
   laesst sich das Mittel der Zeilenwerte nicht mehr im Kopf nachrechnen. */
const gewichtMarke = (g) => (Number(g) === 1 || g == null ? '' : '×' + gewichtText(g));

const vSache = (n) => (n === 1 ? V.sacheEinzahl : V.sacheMehrzahl);
const vZeit = (n) => (n === 1 ? V.zeitpunktEinzahl : V.zeitpunktMehrzahl);
const vBericht = (n) => (n === 1 ? V.berichtEinzahl : V.berichtMehrzahl);
const vAufgabe = (n) => (n === 1 ? V.aufgabeEinzahl : V.aufgabeMehrzahl);

/* Aus dem Verfasserobjekt des Servers wird die Beschriftung -- GENAU HIER und
   nirgends sonst, damit die Karte "Zugaenge" und die Beitraege im Eintrag
   nicht auseinanderlaufen koennen; beide rufen diese Funktion.
   Ein Grabstein hat keinen Namen mehr: seine Zeile traegt geloescht-<nr>, und
   was hier entsteht, ist "Geloeschter Benutzer 7". Der gespeicherte Name wird
   nie gezeigt -- das ist der ganze Zweck der stehengebliebenen Zeile.
   null heisst herrenlos: die Zeile hat ihren Verfasser verloren, und das ist
   etwas anderes als ein entfernter Zugang.
   Funktionsdeklaration, nicht const: sonst haengt sie nicht am window und der
   Pruefstand kaeme nicht heran. */
function verfasserName(v) {
  if (!v) return 'Ohne Verfasser';
  return v.geloescht ? `Gelöschter Benutzer ${v.id}` : v.name;
}

let LINKZEILEN = 5;          // sichtbare Zeilen, bevor aufgeklappt wird
let ZEITLEISTE_AN = true;
const LINKZEILEN_STUFEN = [3, 5, 8, 12];

// Suchanbieter fuer Linkzeilen, die keine Adresse sind. %s ist der Platzhalter
// fuer den Suchtext. Die Liste steht ausschliesslich im Server und
// kommt ueber /api/settings -- hier gibt es bewusst KEINE zweite Kopie und
// auch keine eingebaute Vorlage als Rueckfall.
let SUCHANBIETER = [];      // alle neun Plaetze, wie der Server sie liefert
let SUCHNAMEN = 2;          // wie viele Namen unter einer Suchzeile stehen
const SUCHNAMEN_STUFEN = [1, 2, 3, 4];

// Woran eine Suchzeile erkennbar ist: am fehlenden Schema. Der Server setzt es
// bei allem, was wie eine Adresse aussieht -- was ohne dasteht, ist Suchtext.
const istSuche = (text) => !/^https?:\/\//i.test(String(text || ''));

// Zweite Schranke vor dem Oeffnen. Die erste steht im Server beim Speichern;
// eine Vorlage aus der Datenbank ist Eingabe und landet hier in einem
// window.open. Faellt eine durch, faellt dieser Anbieter weg -- still einen
// anderen einzusetzen hiesse, woanders zu suchen als angeschrieben.
function suchvorlageOk(v) {
  return typeof v === 'string' && /^https?:\/\/[^\s]+$/i.test(v) && v.includes('%s');
}

// Die Anbieter unter einer Suchzeile: im Vorrat, Vorlage in Ordnung, Standard
// zuerst -- die Reihenfolge kommt fertig vom Server. Gezaehlt werden ALLE
// Namen, nicht nur die Alternativen: Stufe 1 zeigt damit genau den Standard.
function suchListe() {
  return SUCHANBIETER
    .filter(a => a.aktiv && a.vorhanden && suchvorlageOk(a.vorlage))
    .sort((a, b) => (b.standard ? 1 : 0) - (a.standard ? 1 : 0))
    .slice(0, SUCHNAMEN);
}
// Der Standard ist das Ziel des Zeilenklicks. Faellt er durch die Schranke,
// gibt es keinen -- der Klick meldet das, statt anderswo zu suchen.
const suchStandard = () => suchListe()[0] || null;
const sucheAdresse = (vorlage, text) => vorlage.replace('%s', encodeURIComponent(text));

/* ================= Links im Kommentartext ================= */
// Erkennung und Knotenbau sind getrennt, und das mit Absicht: Schranke 2 kann
// nicht anschlagen, solange Schranke 1 richtig ist -- die beiden verdecken
// einander vollstaendig. Nur weil der Knotenbauer einzeln
// aufrufbar ist, laesst sich ihm im Pruefstand unmittelbar ein javascript:
// vorlegen und die zweite Schranke ueberhaupt gegenpruefen. Beides sind
// Funktionsdeklarationen und haengen deshalb am window.

// Schranke 1. Nur ausdruecklich Geschriebenes gilt: http://, https:// und
// www. ohne Schema. Ein blankes beispiel.de ausdruecklich nicht -- anders als
// in der Linkliste, wo ein Wort zur Suche wird. Deutscher Fliesstext ist voll
// von "z.B." und "usw.", jede Endungsregel produziert dort Fehltreffer.
// javascript: kann hier gar nicht erst passen.
// Der Anfang wird mitgefangen -- weiter unten wird nur noch gefragt, ob nach
// ihm ueberhaupt etwas stehen blieb, nicht noch einmal, ob er erlaubt ist.
// Sonst staende die Schemaentscheidung an zwei Stellen und Schranke 1 wuerde
// sich in der Gegenprobe selbst verdecken.
const KOMMENTAR_LINK = /(https?:\/\/|www\.)\S+/gi;

// Nachlaufende Satzzeichen gehoeren nicht zur Adresse. Bei Klammern mit
// Augenmass: eine schliessende bleibt drin, solange die Adresse eine
// unpaarige oeffnende enthaelt -- sonst zerrisse jedes
// ..._(Begriffsklaerung) mitten in der Adresse.
const LINK_SATZZEICHEN = '.,;:!?"\'»«…';
const LINK_KLAMMERN = { ')': '(', ']': '[' };
const zaehleZeichen = (s, z) => s.split(z).length - 1;

function kuerzeLinkende(adresse) {
  for (;;) {
    const letztes = adresse.slice(-1);
    if (LINK_SATZZEICHEN.includes(letztes)) { adresse = adresse.slice(0, -1); continue; }
    const oeffnend = LINK_KLAMMERN[letztes];
    if (oeffnend && zaehleZeichen(adresse, letztes) > zaehleZeichen(adresse, oeffnend)) {
      adresse = adresse.slice(0, -1); continue;
    }
    return adresse;
  }
}

// Zerlegt den Rohtext in Stuecke: { text } ist gewoehnlicher Text,
// { text, ziel } ein Link. Gearbeitet wird auf dem Rohtext, nicht auf
// maskiertem -- sonst zerrisse ein &amp; jede Abfragezeichenfolge.
function zerlegeKommentartext(roh) {
  const text = String(roh ?? '');
  const stuecke = [];
  let zuletzt = 0, treffer;
  KOMMENTAR_LINK.lastIndex = 0;
  while ((treffer = KOMMENTAR_LINK.exec(text)) !== null) {
    const adresse = kuerzeLinkende(treffer[0]);
    // Nach dem Abschneiden kann ein nacktes "https://" uebrigbleiben. Das ist
    // keine Adresse und wird wieder zu Text. Gefragt wird allein, ob nach dem
    // Anfang noch etwas steht -- ueber das Schema entscheidet das Muster.
    if (adresse.length <= treffer[1].length) continue;
    if (treffer.index > zuletzt) stuecke.push({ text: text.slice(zuletzt, treffer.index) });
    stuecke.push({
      text: adresse,                     // angezeigt wird die Adresse, wie geschrieben
      ziel: /^www\./i.test(adresse) ? 'https://' + adresse : adresse
    });
    zuletzt = treffer.index + adresse.length;
  }
  if (zuletzt < text.length) stuecke.push({ text: text.slice(zuletzt) });
  return stuecke;
}

// Baut echte DOM-Knoten. Kein innerHTML auf diesem Weg: Maskierung ist damit
// nicht "nicht vergessen worden", sondern baulich unmoeglich.
function baueKommentarknoten(stuecke) {
  const teil = document.createDocumentFragment();
  (stuecke || []).forEach(s => {
    const text = String(s?.text ?? '');
    if (!text) return;
    // Schranke 2: unmittelbar vor dem Setzen von href noch einmal pruefen.
    // Faellt der String durch, wird sie gewoehnlicher Text, nicht Link.
    if (s?.ziel && /^https?:\/\//i.test(String(s.ziel))) {
      const a = document.createElement('a');
      a.href = String(s.ziel);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = text;
      teil.appendChild(a);
      return;
    }
    teil.appendChild(document.createTextNode(text));
  });
  return teil;
}

let SCHRIFT = 100;
const SCHRIFT_STUFEN = [80, 90, 100, 110, 120];
// Es wird genau ein Wert gesetzt: das Grundmass am Wurzelelement. Alle
// Schriftgroessen im Stylesheet haengen als rem daran.
function wendeSchriftAn() {
  document.documentElement.style.fontSize = (15 * SCHRIFT / 100).toFixed(2) + 'px';
}

/* ================= Zustand ================= */
const state = {
  items: [], categories: [], tags: [], criteria: [],
  filters: { categoryId: null, tagIds: [], tagMode: 'and', tested: 'all', favorit: false, sort: 'updated_desc' },
  search: '', compare: new Set(),
};

// Die Einstellungen werden einmal beim Start geholt -- auch beim Direkteinstieg
// auf einen Eintrag oder den Systembereich, wo loadAll() gar nicht laeuft.
let EINSTELLUNGEN = null;

// Abgeleitet, nicht eingestellt. BENUTZER_ZAHL entscheidet, ob die
// Durchschnittsspalte ueberhaupt erscheint -- bei genau einem Zugang sagt
// "3,4 · 1" nichts und bleibt weg. ADMIN steuert die Kriterienkarte im
// Systembereich.
// EIGENTUEMER steuert, was in der Karte "Zugaenge"
// bedienbar ist -- Rollen vergeben und der Zugriff auf andere Admins. Der
// Server verweigert beides ohnehin; das Feld erspart der Oberflaeche eine
// zweite Wahrheit darueber, wem die Anlage gehoert.
let BENUTZER_ZAHL = 1;
let ADMIN = true;
let EIGENTUEMER = true;
// Der eigene Name in der Kopfzeile. AUCH BEI EINEM EINZIGEN ZUGANG: das ist
// eine Aussage ueber MICH, nicht ueber andere -- derselbe Grund, aus dem die
// Karte "Zugang" fuer jeden stehenbleibt.
let NAME = '';
// Die Schwelle steht GENAU HIER und nirgends sonst.
const mehrereBenutzer = () => BENUTZER_ZAHL > 1;

/* Der Bezugszeitpunkt fuer "Neu seit ...". EINMAL beim Laden der Seite
   gelesen und dann STEHENGELASSEN, obwohl der Server ihn bei jedem Verlassen
   der Uebersicht weiterstellt. Ohne das waere die Menge nach dem ersten
   geoeffneten Eintrag leer: man saehe sieben Neue und verloere sechs davon
   beim ersten Klick. Der weitergestellte Wert gilt also erst beim naechsten
   Laden der Seite -- ein Besuch ist eine Sitzung am Bildschirm, nicht ein
   Wechsel der Ansicht.
   null heisst "noch nie gesetzt": dann wird der Umschalter gar nicht erst
   angeboten. */
let ZULETZT_GESEHEN = null;

/* Die beiden Anlegen-Schalter, global und mit Vorgabe an. Der Bildschirm haelt
   sich an dieselbe Regel wie der Server: DER ADMIN KOMMT IMMER DURCH. Bote die
   Oberflaeche die Zeile "+ neu anlegen" trotz ausgeschaltetem Schalter an,
   erzeugte sie zuverlaessig eine Fehlermeldung -- und ein solcher Knopf sieht
   aus wie ein Fehler.
   Aus heisst ausdruecklich NUR: die Zeile zum Anlegen verschwindet. Auswahl
   und Wolke bleiben, denn zuweisen darf immer jeder. */
let TAGS_FREI = true;
let KATEGORIEN_FREI = true;
/* Die Frist des Papierkorbs. Sie kommt aus /api/settings und wird hier NICHT
   nachgebaut: die Zahl steht im Server an einer Stelle, und der Löschdialog
   nennt sie jedem — auch dem, der die Karte gar nicht sehen darf. Die 30
   hier ist kein zweiter Wert, sondern der Rückfall für eine Antwort, die das
   Feld nicht kennt. */
let PAPIERKORB_TAGE = 30;
const darfTagAnlegen = () => ADMIN || TAGS_FREI;
const darfKategorieAnlegen = () => ADMIN || KATEGORIEN_FREI;

async function ladeEinstellungen() {
  EINSTELLUNGEN = await api('GET', '/api/settings');
  if (EINSTELLUNGEN.benutzerZahl) BENUTZER_ZAHL = EINSTELLUNGEN.benutzerZahl;
  if (EINSTELLUNGEN.name) NAME = EINSTELLUNGEN.name;
  if (EINSTELLUNGEN.istAdmin !== undefined) ADMIN = !!EINSTELLUNGEN.istAdmin;
  if (EINSTELLUNGEN.istEigentuemer !== undefined) EIGENTUEMER = !!EINSTELLUNGEN.istEigentuemer;
  if (EINSTELLUNGEN.vokabular) V = { ...V, ...EINSTELLUNGEN.vokabular };
  if (EINSTELLUNGEN.schrift) SCHRIFT = EINSTELLUNGEN.schrift;
  uebernimmBloecke(EINSTELLUNGEN.bloecke);
  if (EINSTELLUNGEN.linkZeilen) LINKZEILEN = EINSTELLUNGEN.linkZeilen;
  if (EINSTELLUNGEN.zeitleiste !== undefined) ZEITLEISTE_AN = EINSTELLUNGEN.zeitleiste !== false;
  // Ausdruecklich nur beim ERSTEN Laden. ladeEinstellungen() laeuft nur in
  // start(); ein spaeterer Aufruf duerfte den Bezugszeitpunkt nicht mehr
  // nachziehen, sonst verschwaende die Menge unter dem Zeiger.
  if (EINSTELLUNGEN.zuletztGesehen) ZULETZT_GESEHEN = EINSTELLUNGEN.zuletztGesehen;
  if (Array.isArray(EINSTELLUNGEN.suchAnbieter)) SUCHANBIETER = EINSTELLUNGEN.suchAnbieter;
  if (EINSTELLUNGEN.suchNamen) SUCHNAMEN = EINSTELLUNGEN.suchNamen;
  // Der Server leitet beide beim Lesen ab und liefert sie immer; die Vorgabe
  // hier greift nur, wenn die Antwort das Feld gar nicht kennt.
  if (EINSTELLUNGEN.tagsFreiAnlegen !== undefined) TAGS_FREI = EINSTELLUNGEN.tagsFreiAnlegen !== false;
  if (EINSTELLUNGEN.kategorienFreiAnlegen !== undefined)
    KATEGORIEN_FREI = EINSTELLUNGEN.kategorienFreiAnlegen !== false;
  if (EINSTELLUNGEN.papierkorbTage) PAPIERKORB_TAGE = EINSTELLUNGEN.papierkorbTage;
  wendeSchriftAn();
}

const saveFilters = () => {
  // Die Momentaufnahme mitfuehren. loadAll() laeuft bei jeder Rueckkehr in die
  // Uebersicht und setzt state.filters daraus zurueck -- ohne diese Zeile
  // landet man immer wieder bei der Kombination, die beim Laden der Seite galt.
  if (EINSTELLUNGEN) EINSTELLUNGEN.filters = { ...state.filters };
  api('PUT', '/api/settings', { filters: state.filters }).catch(() => {});
};

async function loadAll() {
  const [items, categories, tags, criteria, titles] = await Promise.all([
    api('GET', '/api/items'), api('GET', '/api/product-categories'), api('GET', '/api/tags'),
    api('GET', '/api/criteria'), api('GET', '/api/titles')
  ]);
  state.items = items; state.categories = categories; state.tags = tags; state.criteria = criteria;
  TITLE_APP = titles.appTitle; TITLE_PUBLIC = titles.publicTitle;
  document.title = TITLE_APP;
  const settings = EINSTELLUNGEN;
  if (settings && settings.filters) {
    state.filters = { categoryId: null, tagIds: [], tagMode: 'and', tested: 'all',
                      favorit: false, neu: false, sort: 'updated_desc', ...settings.filters };
    if (!Array.isArray(state.filters.tagIds)) state.filters.tagIds = [];
    // Aeltere gespeicherte Filter kennen tagMode nicht -- sie bekommen die
    // Vorgabe. Alles ausser 'or' gilt als 'and'.
    if (state.filters.tagMode !== 'or') state.filters.tagMode = 'and';
    // Dasselbe fuer den Favoritenfilter. Ein aelterer gespeicherter Filter
    // kennt das Feld nicht; das Ausbreiten oben setzt es dann NICHT
    // auf die Vorgabe zurueck, sondern laesst es weg -- und `undefined` waere
    // zwar falsch genug fuer die Filterzeile, aber der Knopf zeichnete sich
    // daraus nicht sauber. Deshalb ausdruecklich auf einen Wahrheitswert
    // bringen.
    state.filters.favorit = state.filters.favorit === true;
    // Und dasselbe fuer den neuen Umschalter, aus demselben Grund.
    state.filters.neu = state.filters.neu === true;
  }
}

// Fehlender Wert ist nicht Null: Eintraege ohne Testtage stehen bei den
// Testsortierungen immer am Ende, egal in welche Richtung sortiert wird.
function byTest(a, b, field, dir) {
  const av = a[field], bv = b[field];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  return dir === 'desc' ? bv - av : av - bv;
}

// Traegt ein Eintrag die gewaehlten Tags? Getrennt herausgezogen, weil auch
// die Vorschau der Wolke damit rechnet, welche Tags noch Treffer brachten.
function passtZuTags(item, tagIds, modus) {
  if (!tagIds.length) return true;
  const eigene = new Set((item.tags || []).map(t => t.id));
  return modus === 'or'
    ? tagIds.some(id => eigene.has(id))
    : tagIds.every(id => eigene.has(id));
}

/* Der Parameter ist die Vorschau: die Filterzeile fragt "wie viele blieben
   uebrig, wenn ich DIESEN Umschalter noch druecke" -- dieselbe Frage, die die
   Tagwolke schon fuer ihre gedaempften Tags stellt. Ohne ihn braeuchte die
   Zahl daneben einen zweiten Rechenweg, und zwei Wege fuer dieselbe Menge
   laufen auseinander. */
function visibleItems(filter) {
  const f = filter || state.filters;
  let out = state.items;
  if (f.categoryId != null) out = out.filter(i => i.category && i.category.id === f.categoryId);
  // UND ist die Vorgabe: mit zwei Tags will man fast immer den Schnitt
  // ("gruen UND schwer"), nicht die Vereinigung.
  if (f.tagIds.length) out = out.filter(i => passtZuTags(i, f.tagIds, f.tagMode));
  if (f.tested === 'tested') out = out.filter(i => i.tested);
  else if (f.tested === 'untested') out = out.filter(i => !i.tested);
  // Eigenes Merkmal, eigener Filter -- bewusst NICHT als vierter Wert von
  // `tested`: Favorit und Teststatus sind unabhaengig, und "getestet UND
  // Favorit" muss moeglich bleiben.
  if (f.favorit) out = out.filter(i => i.favorite);
  /* "Neu seit ..." ist ein FILTER, kein zweiter Sortierweg -- persoenlich wie
     der Favorit und aus demselben Grund: die Liste zeigt, wo etwas geschieht,
     nicht wo ICH zuletzt war. Wer daraus eine persoenliche Reihenfolge macht,
     baut eine zweite Wahrheit ueber denselben Bestand.
     Verglichen werden zwei Zeitstempel aus DERSELBEN Quelle -- beide kommen
     als 'JJJJ-MM-TT HH:MM:SS' vom Server, und in diesem Format ist der
     Stringvergleich der Vergleich der Zeiten. Genau wie die Sortierung
     eine Zeile tiefer, die localeCompare auf dieselbe Spalte anwendet.
     OHNE gespeicherten Wert greift er GAR NICHT: beim allerersten Besuch gibt
     es keinen Bezugspunkt, und ein Filter, der dann alles zeigt, erklaert
     sich nicht -- die Filterzeile bietet ihn dort auch nicht an. */
  if (f.neu && ZULETZT_GESEHEN) out = out.filter(i => i.updated_at > ZULETZT_GESEHEN);
  const q = state.search.trim().toLowerCase();
  if (q) out = out.filter(i => (i.searchText || '').includes(q));

  out = [...out].sort((a, b) => {
    // HIER STEHT BEWUSST KEINE Vorsortierung der Favoriten
    // (kein `if (a.favorite !== b.favorite) ...` vor dem switch):
    // sie schluege jede eingestellte Sortierung -- ein Favorit ohne Wertung
    // stuende bei "Bewertung hoch nach niedrig" ganz oben, obwohl er dort ans
    // Ende gehoert. Ein Favorit ist persoenlich und darf die gemeinsame Liste
    // nicht umsortieren. Wer seine Favoriten sammeln will, nimmt den Filter.
    switch (f.sort) {
      case 'updated_asc': return a.updated_at.localeCompare(b.updated_at);
      case 'rating_desc': return (b.avgRating ?? -1) - (a.avgRating ?? -1);
      case 'rating_asc':  return (a.avgRating ?? 99) - (b.avgRating ?? 99);
      case 'title_asc':   return a.title.localeCompare(b.title, 'de');
      case 'tests_desc':  return byTest(a, b, 'testCount', 'desc');
      case 'tests_asc':   return byTest(a, b, 'testCount', 'asc');
      case 'testavg_desc':return byTest(a, b, 'testAvg', 'desc');
      case 'testavg_asc': return byTest(a, b, 'testAvg', 'asc');
      case 'testlast_desc':return byTest(a, b, 'testLast', 'desc');
      case 'testlast_asc': return byTest(a, b, 'testLast', 'asc');
      default: return b.updated_at.localeCompare(a.updated_at);
    }
  });
  return out;
}

/* ================= Wegweiser ================= */
async function start() {
  document.body.classList.remove('anmeldung');
  window.removeEventListener('hashchange', route);
  window.addEventListener('hashchange', route);
  // Vor dem ersten Aufbau: sonst greift die Schriftgroesse erst nach dem
  // zweiten Klick und der Direkteinstieg auf einen Eintrag zeigt das
  // Vorgabevokabular.
  try { await ladeEinstellungen(); }
  catch (e) { if (e.message === 'Sitzung abgelaufen') return; }
  route();
}
/* Welche Ansicht zuletzt stand -- gebraucht wird das fuer genau eine Frage:
   ob die Uebersicht gerade VERLASSEN wird. */
let LETZTE_ANSICHT = null;
/* DER MERKZEITPUNKT WIRD BEIM VERLASSEN GESETZT, NICHT BEIM BETRETEN. Beim
   Betreten waere er wertlos: er stuende dann auf dem Augenblick, in dem man
   hinsieht, und "neu seit" waere immer leer. Beim Verlassen bleibt er
   waehrend des ganzen Besuchs stehen.
   Geschickt wird ein SIGNAL, keine Zeit -- die Uhr des Aufrufers ist eine
   Behauptung; der Server setzt seine eigene ein.
   Wer den Browser schliesst, ohne die Uebersicht zu verlassen, behaelt seinen
   alten Merkzeitpunkt und sieht dieselben Eintraege noch einmal. Das ist die
   richtige Seite des Fehlers: lieber zweimal zeigen als einmal verschlucken. */
const merkeGesehen = () => { api('PUT', '/api/settings', { zuletztGesehen: 1 }).catch(() => {}); };
function route() {
  const h = location.hash || '#/';
  // Die alte Ansicht ist gleich fort; ihre Wolke darf niemand mehr zeichnen.
  wolkeNeuzeichnen = null;
  const m = h.match(/^#\/item\/(\d+)$/);
  const ansicht = h === '#/system' ? 'system' : h === '#/compare' ? 'vergleich'
    : h === '#/offen' ? 'offen' : m ? 'eintrag' : 'liste';
  if (LETZTE_ANSICHT === 'liste' && ansicht !== 'liste') merkeGesehen();
  LETZTE_ANSICHT = ansicht;
  if (ansicht === 'system') return renderSystem();
  if (ansicht === 'vergleich') return renderCompare();
  if (ansicht === 'offen') return renderOffen();
  if (m) return renderDetail(+m[1]);
  return renderList();
}

/* ================= Übersicht ================= */
async function renderList() {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  try { await loadAll(); }
  catch (e) { if (e.message !== 'Sitzung abgelaufen') app.innerHTML = `<div class="shell"><p class="hint">${esc(e.message)}</p></div>`; return; }

  app.innerHTML = `<div class="shell">
    <div class="masthead">
      <div class="brand">${MARK(32)}
        <div><h1>${esc(TITLE_APP)}</h1><div class="count" id="count"></div></div></div>
      <div class="search-box">
        <span class="ic">${ICON_SEARCH}</span>
        <input class="input" id="q" placeholder="Suchen …" value="${esc(state.search)}">
        <button class="clr" id="qclr" title="Suche leeren" style="display:none">✕</button>
      </div>
      <button class="icon-btn" id="offen" title="Offene ${esc(V.aufgabeMehrzahl)}">${ICON_OFFEN}</button>
      <button class="icon-btn" id="sys" title="Systembereich">${ICON_SYS}</button>
      <span class="hint wer" id="wer">Angemeldet als ${esc(NAME)}</span>
      <button class="btn btn-ghost btn-sm" id="out">Abmelden</button>
      <button class="btn btn-accent" id="new">+ ${esc(V.sacheEinzahl)}</button>
    </div>
    <div class="filters" id="filters"></div>
    <div id="zeitleiste"></div>
    <div id="body"></div>
  </div>`;

  document.getElementById('new').onclick = openCreate;
  document.getElementById('offen').onclick = () => { location.hash = '#/offen'; };
  document.getElementById('sys').onclick = () => { location.hash = '#/system'; };
  document.getElementById('out').onclick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    showLogin();
  };
  const q = document.getElementById('q'), qclr = document.getElementById('qclr');
  const syncClr = () => { qclr.style.display = q.value ? 'block' : 'none'; };
  q.oninput = () => { state.search = q.value; syncClr(); drawBody(); };
  qclr.onclick = () => { q.value = ''; state.search = ''; syncClr(); drawBody(); q.focus(); };
  syncClr();

  // "/" springt in die Suche
  document.addEventListener('keydown', listKeys);
  window.addEventListener('hashchange', () => document.removeEventListener('keydown', listKeys), { once: true });

  drawFilters(); drawBody();
}

function listKeys(e) {
  const t = document.activeElement?.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
  if (document.querySelector('.backdrop')) return;
  if (e.key === '/') { e.preventDefault(); document.getElementById('q')?.focus(); }
}

function drawFilters() {
  const box = document.getElementById('filters');
  if (!box) return;
  box.innerHTML = '';
  const f = state.filters;
  const redraw = () => { saveFilters(); drawFilters(); drawBody(); };

  const row = (label) => {
    const r = document.createElement('div');
    r.className = 'frow';
    r.innerHTML = `<span class="eyebrow">${label}</span>`;
    box.appendChild(r);
    return r;
  };

  // Merkmal (Vorgabe: Teststatus). Beschriftung generisch, weil das Wort
  // selbst aus dem Vokabular kommt.
  const r1 = row('Status');
  const g1 = document.createElement('div'); g1.className = 'pills';
  [['all','Alles anzeigen'],['tested',V.merkmalJa],['untested',V.merkmalNein]].forEach(([v,l]) => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.tested === v ? ' on' : '');
    b.textContent = l;
    b.onclick = () => { f.tested = v; redraw(); };
    g1.appendChild(b);
  });
  // Eigener Umschalter, kein vierter Wert der Reihe davor. Die drei oben sind
  // drei Zustaende EINES Merkmals -- genau einer gilt. Der Favorit ist davon
  // unabhaengig und muss sich mit jedem von ihnen kombinieren lassen; als
  // vierter Knopf ginge das nicht, ohne den Teststatus aufzugeben.
  // Die Klasse `pill-sep` setzt ihn optisch ab, damit die Trennung sichtbar
  // ist und niemand ihn fuer den vierten Zustand haelt.
  const bFav = document.createElement('button');
  bFav.className = 'pill pill-sep' + (f.favorit ? ' on' : '');
  bFav.id = 'f-fav';
  bFav.textContent = '★ Favoriten';
  bFav.title = f.favorit ? 'Alle Einträge zeigen' : 'Nur Favoriten zeigen';
  bFav.onclick = () => { f.favorit = !f.favorit; redraw(); };
  g1.appendChild(bFav);

  /* "Neu seit ..." -- derselbe Platz, dasselbe Muster wie der Favorit
     daneben: ein eigener Umschalter, mit allen uebrigen Filtern kombinierbar,
     persoenlich.
     ER ERSCHEINT NUR MIT BEZUGSPUNKT. Beim allerersten Besuch gibt es keinen,
     und ein Filter, der dann alles zeigt, erklaert sich nicht. Bei EINEM
     Zugang erscheint er trotzdem -- anders als "meine / alle" ist er keine
     Aussage ueber andere: auch allein vergisst man, was man zuletzt gesehen
     hat.
     Die Zahl daneben steht wie an der Kategorie in einem <span class="n"> --
     und sie ist die Vorschau auf den eigenen Klick, also die Menge unter ALLEN
     uebrigen Filtern. Eine Gesamtzahl daneben widerspraeche der Liste,
     sobald ein zweiter Filter an ist. */
  if (ZULETZT_GESEHEN) {
    const bNeu = document.createElement('button');
    bNeu.className = 'pill pill-sep' + (f.neu ? ' on' : '');
    bNeu.id = 'f-neu';
    bNeu.innerHTML = `Neu seit ${esc(fmtTagKurz(ZULETZT_GESEHEN))}`
      + `<span class="n">${visibleItems({ ...f, neu: true }).length}</span>`;
    bNeu.title = f.neu ? 'Alle Einträge zeigen'
      : `Nur was sich seit ${fmtDate(ZULETZT_GESEHEN)} getan hat`;
    bNeu.onclick = () => { f.neu = !f.neu; redraw(); };
    g1.appendChild(bNeu);
  }
  r1.appendChild(g1);

  // Kategorie
  const r2 = row('Kategorie');
  const g2 = document.createElement('div'); g2.className = 'pills';
  const all = document.createElement('button');
  all.className = 'pill' + (f.categoryId == null ? ' on' : '');
  all.textContent = 'Alle';
  all.onclick = () => { f.categoryId = null; redraw(); };
  g2.appendChild(all);
  state.categories.forEach(c => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.categoryId === c.id ? ' on' : '');
    b.innerHTML = `${esc(c.name)}<span class="n">${c.usage_count}</span>`;
    b.onclick = () => { f.categoryId = f.categoryId === c.id ? null : c.id; redraw(); };
    g2.appendChild(b);
  });
  r2.appendChild(g2);

  // Tags
  // Nur Tags mit mindestens einem Eintrag: Tags, die ausschliesslich an
  // Testtagen haengen, lieferten hier null Treffer. Die Suche findet sie
  // trotzdem.
  const r3 = row('Tags');

  // Umschalter der Verknuepfung, direkt neben der Beschriftung. Er macht
  // sichtbar, warum ein zweiter Tag das Ergebnis verkleinert statt es zu
  // erweitern -- ohne ihn waere ein leeres Ergebnis raetselhaft. Gedaempft,
  // solange weniger als zwei Tags gewaehlt sind: dann bewirkt er nichts, soll
  // aber auffindbar bleiben, bevor man ihn braucht.
  const modusBox = document.createElement('div');
  modusBox.className = 'tagmode' + (f.tagIds.length > 1 ? '' : ' ruht');
  [['and', 'Und', 'Nur Einträge, die alle gewählten Tags tragen'],
   ['or', 'Oder', 'Einträge, die mindestens einen der gewählten Tags tragen']]
    .forEach(([wert, text, erklaerung]) => {
      const b = document.createElement('button');
      b.className = 'pill pill-mode' + (f.tagMode === wert ? ' on' : '');
      b.textContent = text;
      b.title = erklaerung;
      b.dataset.mode = wert;
      b.onclick = () => { f.tagMode = wert; redraw(); };
      modusBox.appendChild(b);
    });
  r3.appendChild(modusBox);

  const g3 = document.createElement('div'); g3.className = 'pills cloud';
  const filterTags = state.tags.filter(t => t.usage_count > 0);
  if (!filterTags.length) g3.innerHTML = `<span class="hint">noch keine Tags</span>`;
  // Welche Tags brächten null Treffer, wenn man sie zusätzlich anklickt? Nur
  // im UND-Modus eine Frage -- im ODER-Modus erweitert jeder Klick.
  const leerlauf = new Set();
  if (f.tagMode === 'and' && f.tagIds.length) {
    const sichtbar = visibleItems();
    filterTags.forEach(t => {
      if (f.tagIds.includes(t.id)) return;
      if (!sichtbar.some(i => (i.tags || []).some(x => x.id === t.id))) leerlauf.add(t.id);
    });
  }
  sortiereWolke(filterTags, new Set(f.tagIds)).forEach(t => {
    const b = document.createElement('button');
    const gewaehlt = f.tagIds.includes(t.id);
    b.className = 'pill pill-tag' + (gewaehlt ? ' on' : '') + (leerlauf.has(t.id) ? ' leer' : '');
    b.textContent = t.name;
    if (leerlauf.has(t.id)) b.title = 'Zusammen mit der aktuellen Auswahl kein Treffer';
    b.onclick = () => {
      f.tagIds = gewaehlt ? f.tagIds.filter(x => x !== t.id) : [...f.tagIds, t.id];
      redraw();
    };
    g3.appendChild(b);
  });
  r3.appendChild(g3);
  // Eine Zeile, Rest aufklappbar. Der Knopf erscheint nur, wenn wirklich etwas
  // abgeschnitten ist.
  const beschnitten = begrenzeWolke(g3, wolkeOffen.uebersicht ? 0 : 1);
  if (beschnitten || wolkeOffen.uebersicht) {
    const m = document.createElement('button');
    m.className = 'link-btn';
    m.textContent = wolkeOffen.uebersicht ? 'weniger' : 'mehr';
    m.onclick = () => { wolkeOffen.uebersicht = !wolkeOffen.uebersicht; drawFilters(); };
    r3.appendChild(m);
  }
  if (f.tagIds.length) {
    const c = document.createElement('button');
    c.className = 'link-btn'; c.textContent = 'zurücksetzen';
    c.onclick = () => { f.tagIds = []; redraw(); };
    r3.appendChild(c);
  }

  // Sortierung, gruppiert
  const r4 = row('Sortieren');
  const sel = document.createElement('select');
  sel.className = 'select';
  sel.innerHTML = `
    <optgroup label="Änderung">
      <option value="updated_desc">Zuletzt geändert (neu → alt)</option>
      <option value="updated_asc">Zuletzt geändert (alt → neu)</option>
    </optgroup>
    <optgroup label="Bewertung">
      <option value="rating_desc">Bewertung (hoch → niedrig)</option>
      <option value="rating_asc">Bewertung (niedrig → hoch)</option>
      <option value="title_asc">Titel (A → Z)</option>
    </optgroup>
    <optgroup label="Verlauf">
      <option value="tests_desc">${esc(V.zeitpunktMehrzahl)} (viele → wenige)</option>
      <option value="tests_asc">${esc(V.zeitpunktMehrzahl)} (wenige → viele)</option>
      <option value="testavg_desc">Note ⌀ (hoch → niedrig)</option>
      <option value="testavg_asc">Note ⌀ (niedrig → hoch)</option>
      <option value="testlast_desc">Letzte Note (hoch → niedrig)</option>
      <option value="testlast_asc">Letzte Note (niedrig → hoch)</option>
    </optgroup>`;
  sel.value = f.sort;
  sel.onchange = () => { f.sort = sel.value; saveFilters(); drawBody(); };
  r4.appendChild(sel);
}

function drawBody() {
  const body = document.getElementById('body');
  if (!body) return;
  const list = visibleItems();
  const cnt = document.getElementById('count');
  if (cnt) cnt.textContent = `${state.items.length} ${vSache(state.items.length)}` +
    (list.length !== state.items.length ? ` · ${list.length} sichtbar` : '');

  drawZeitleiste(list);
  body.innerHTML = '';
  if (!state.items.length) {
    body.innerHTML = `<div class="empty"><h2>Noch nichts erfasst</h2>
      <p>Oben rechts anlegen — Fotos, Kategorie, Bewertung und ${esc(V.zeitpunktMehrzahl)} folgen danach.</p></div>`;
    return;
  }
  if (!list.length) {
    body.innerHTML = `<div class="empty"><h2>Keine Treffer</h2>
      <p>Nichts passt zu dieser Filter- und Suchkombination.</p></div>`;
    drawCompareBar();
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'grid';
  list.forEach(it => grid.appendChild(card(it)));
  body.appendChild(grid);
  drawCompareBar();
}

/* ================= Zeitleiste der Testtage ================= */
// Ein Punkt je Testtag über einer gemeinsamen Zeitachse. Die Höhe eines
// Punktes ist seine Tagesnote — das trennt Punkte, die auf denselben Tag
// fallen, und zeigt nebenbei, wohin sich die Bewertungen entwickeln.
// Richtet sich nach den gerade sichtbaren Einträgen, folgt also den Filtern.
const ZEITLEISTE_AB = 5;   // darunter sagt das Band nichts und bleibt weg

function zeitleistePunkte(list) {
  const punkte = [];
  for (const it of list)
    for (const d of it.testDays || [])
      // mine kommt vom Server: eigene Punkte werden gefuellt
      // gezeichnet, fremde als Ring. Kein neuer Farbkanal -- Gold bleibt Gold.
      punkte.push({ itemId: it.id, titel: it.title, tag: d.day, note: d.rating, mine: d.mine !== false });
  return punkte.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
}

// Anteil eines Datums an der Gesamtspanne, 0 bis 1. Bei nur einem einzigen
// Datum gibt es keine Spanne — dann in die Mitte.
function zeitAnteil(tag, von, bis) {
  const a = Date.parse(von + 'T00:00:00Z'), b = Date.parse(bis + 'T00:00:00Z');
  if (!(b > a)) return 0.5;
  return (Date.parse(tag + 'T00:00:00Z') - a) / (b - a);
}

function jahresMarken(von, bis) {
  const j1 = Number(von.slice(0, 4)), j2 = Number(bis.slice(0, 4));
  const marken = [];
  for (let j = j1; j <= j2; j++) {
    const tag = j === j1 ? von : `${j}-01-01`;
    marken.push({ jahr: j, anteil: zeitAnteil(tag, von, bis) });
  }
  return marken;
}

function drawZeitleiste(list) {
  const box = document.getElementById('zeitleiste');
  if (!box) return;
  if (!ZEITLEISTE_AN) { box.innerHTML = ''; return; }
  const punkte = zeitleistePunkte(list);
  // Zwei getrennte Bedingungen mit Absicht: die Schwelle ist eine Frage des
  // Nutzens, die leere Menge eine des Rechnens. Wer die Schwelle spaeter
  // aendert, soll nicht ueber punkte[0] stolpern.
  if (!punkte.length || punkte.length < ZEITLEISTE_AB) { box.innerHTML = ''; return; }

  const von = punkte[0].tag, bis = punkte[punkte.length - 1].tag;
  box.innerHTML = `<div class="zl">
      <div class="zl-achse" id="zl-achse"></div>
      <div class="zl-feld" id="zl-feld"></div>
      <div class="zl-jahre" id="zl-jahre"></div>
    </div>`;
  const feld = box.querySelector('#zl-feld');
  const achse = box.querySelector('#zl-achse');

  // Waagerechte Hilfslinien je Notenstufe, die mittlere etwas kräftiger
  for (let note = 1; note <= 5; note++) {
    const l = document.createElement('div');
    l.className = 'zl-linie' + (note === 3 ? ' mitte' : '');
    l.style.bottom = ((note - 1) / 4 * 100) + '%';
    achse.appendChild(l);
  }

  punkte.forEach(p => {
    const d = document.createElement('button');
    d.className = 'zl-punkt' + (p.mine ? '' : ' fremd');
    d.style.left = (zeitAnteil(p.tag, von, bis) * 100) + '%';
    d.style.bottom = ((p.note - 1) / 4 * 100) + '%';
    d.dataset.item = p.itemId;
    d.setAttribute('aria-label', `${p.titel}, ${fmtDay(p.tag)}, Note ${p.note}`);
    d.onclick = () => { location.hash = `#/item/${p.itemId}`; };
    // Eigenes Hinweisfeld statt title: kein Wartezögern, und der Text bleibt
    // lesbar gesetzt. Auf dem Finger gibt es kein Überfahren — dort öffnet die
    // Berührung direkt den Eintrag.
    d.onpointerenter = (e) => { if (e.pointerType !== 'touch') zeigeHinweis(box, d, p); };
    d.onpointerleave = () => versteckeHinweis(box);
    feld.appendChild(d);
  });

  const jahre = box.querySelector('#zl-jahre');
  jahresMarken(von, bis).forEach(m => {
    const s = document.createElement('span');
    s.className = 'zl-jahr';
    s.style.left = (m.anteil * 100) + '%';
    s.textContent = m.jahr;
    jahre.appendChild(s);
  });
}

function zeigeHinweis(box, punkt, p) {
  versteckeHinweis(box);
  const h = document.createElement('div');
  h.className = 'zl-hinweis';
  h.innerHTML = `<strong>${esc(p.titel)}</strong><span>${fmtDay(p.tag)} · Note ${p.note}</span>`;
  h.style.left = punkt.style.left;
  box.querySelector('.zl').appendChild(h);
}
function versteckeHinweis(box) { box.querySelector('.zl-hinweis')?.remove(); }

/* Die Marke auf der Karte, wenn mehr als ein Element dahintersteht. Bei
   gemischtem Bestand stehen beide Zahlen da -- "3 Fotos" allein verschwiege,
   dass auch ein Video dabei ist. Bei reinem Bestand bleibt es beim einen Wort.
   Die beiden Zaehler kommen getrennt aus der Antwort und werden hier nicht
   zusammengerechnet. */
function bestandText(it) {
  const f = it.photoCount || 0, v = it.videoCount || 0;
  if (f + v < 2) return '';
  const teile = [];
  if (f) teile.push(`${f} ${f === 1 ? 'Foto' : 'Fotos'}`);
  if (v) teile.push(`${v} ${v === 1 ? 'Video' : 'Videos'}`);
  return `<div class="photo-count">${teile.join(' · ')}</div>`;
}

function card(it) {
  const a = document.createElement('a');
  a.href = `#/item/${it.id}`;
  a.className = 'card' + (state.compare.has(it.id) ? ' picked' : '') + (it.rejected ? ' rejected' : '');
  const badges = [];
  if (it.rejected) badges.push(`<span class="badge badge-rejected">abgelehnt</span>`);
  if (it.tested) badges.push(`<span class="badge badge-tested">${esc(V.merkmalJa)}</span>`);

  const testLine = it.testCount ? `<div class="card-test">
      <span>${it.testCount} ${esc(vZeit(it.testCount))}</span>
      <span class="sep">·</span><span>⌀ ${it.testAvg.toFixed(1).replace('.', ',')}</span>
      <span class="sep">·</span><span>zuletzt ${it.testLast}</span>
    </div>` : '';

  a.innerHTML = `
    <div class="card-img">
      ${it.mainPhoto ? `<img src="/api/photos/${it.mainPhoto.id}/raw?size=thumb" alt="" loading="lazy"
        style="object-position:${fokus(it.mainPhoto)}">` : ICON_PH}
      ${badges.length ? `<div class="card-badges">${badges.join('')}</div>` : ''}
      ${it.favorite ? `<div class="card-pin" title="Favorit">★</div>` : ''}
      ${istVideo(it.mainPhoto) ? `<div class="card-spielmarke" title="Video">▶</div>` : ''}
      ${bestandText(it)}
    </div>
    <div class="card-body">
      ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
      <h3 class="card-title">${esc(it.title)}</h3>
      ${it.tags.length ? `<div class="card-tags">${it.tags.slice(0,4).map(t => `<span class="chip ro">${esc(t.name)}</span>`).join('')}</div>` : ''}
      ${testLine}
      <div class="card-foot">
        <span class="card-meta-l">
          ${it.avgRating ? `<span class="rating-inline"><span class="dot">★</span>${it.avgRating.toFixed(1).replace('.', ',')}</span>`
                         : `<span class="hint hint-sm">keine Wertung</span>`}
          ${it.linkCount ? `<span class="link-count">${it.linkCount} Links</span>` : ''}
        </span>
        <button class="pick-box${state.compare.has(it.id) ? ' on' : ''}" title="Zum Vergleich auswählen">✓</button>
      </div>
    </div>`;

  a.querySelector('.pick-box').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    state.compare.has(it.id) ? state.compare.delete(it.id) : state.compare.add(it.id);
    drawBody();
  });
  return a;
}

function drawCompareBar() {
  document.querySelector('.cmp-bar')?.remove();
  if (!state.compare.size) return;
  const bar = document.createElement('div');
  bar.className = 'cmp-bar';
  bar.innerHTML = `<span>${state.compare.size} ausgewählt</span>
    <button class="btn btn-sm"${state.compare.size < 2 ? ' disabled' : ''}>Vergleichen</button>
    <button class="btn-x" title="Auswahl aufheben">✕</button>`;
  bar.querySelector('.btn').onclick = () => { if (state.compare.size >= 2) location.hash = '#/compare'; };
  bar.querySelector('.btn-x').onclick = () => { state.compare.clear(); drawBody(); };
  document.body.appendChild(bar);
}

function openCreate() {
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `<div class="modal"><h2>${esc(V.sacheEinzahl)} anlegen</h2>
    <div class="field"><label>Titel</label><input class="input" id="nt" placeholder="Wie soll es heißen?"></div>
    <div class="field"><label>Kurzbeschreibung</label><textarea class="ta" id="nd" placeholder="Worum geht es?"></textarea></div>
    <div class="modal-acts"><button class="btn btn-ghost" id="nc">Abbrechen</button>
    <button class="btn btn-accent" id="ns">Anlegen</button></div></div>`;
  document.body.appendChild(bd);
  const close = () => bd.remove();
  bd.onclick = e => { if (e.target === bd) close(); };
  document.getElementById('nc').onclick = close;
  const save = async () => {
    const title = document.getElementById('nt').value.trim();
    if (!title) return toast('Titel fehlt', true);
    try {
      const it = await api('POST', '/api/items', { title, description: document.getElementById('nd').value.trim() });
      close(); location.hash = `#/item/${it.id}`;
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('ns').onclick = save;
  document.getElementById('nt').addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  document.getElementById('nt').focus();
}

/* ================= Offene Aufgaben quer über alle Einträge ================= */
/* Aufgabenkommentare gibt es seit langem, samt Farbkante und Weiterschaltknopf
   -- sichtbar waren sie aber nur, wenn man ihren Eintrag öffnet. Diese Ansicht
   macht vorhandene Funktionalität erreichbar; sie kann nichts, was der
   Kommentarblock nicht auch könnte.

   SIE LIEST, SIE ORDNET NICHT UM. Die Reihenfolge kommt vom Server und ist
   dieselbe wie in der Übersicht: updated_at des Eintrags absteigend, innerhalb
   des Eintrags die älteste Aufgabe oben.

   DIE ÜBERSCHRIFT KOMMT AUS DEM VOKABULAR. Wer seine Aufgaben „Mängel" nennt,
   liest hier „Offene Mängel" -- eine Ansicht, die daneben „Aufgaben" schriebe,
   wäre falsch beschriftet. Deshalb steht in dieser Funktion kein einziges der
   elf einstellbaren Wörter fest. */
async function renderOffen() {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  let zeilen;
  try { zeilen = await api('GET', '/api/offen'); }
  catch (e) {
    if (e.message !== 'Sitzung abgelaufen')
      app.innerHTML = `<div class="shell"><p class="hint">${esc(e.message)}</p></div>`;
    return;
  }

  /* ANSICHTSZUSTAND IM SPEICHER, KEINE EINSTELLUNG -- wie im Vergleich und aus
     demselben Grund: der Umschalter ist eine Linse auf dieselben Daten und darf
     keine zweite Wahrheit werden.
     VORGABESTELLUNG „alle": die Ansicht beantwortet „was ist noch offen", und
     das beantwortet der Blick über alle.
     Bei genau einem Zugang erscheint der Umschalter nicht -- dann sind beide
     Stellungen dieselbe Menge, und ein Knopf ohne Wirkung sieht aus wie ein
     Fehler. Die Schwelle steht in mehrereBenutzer() wie überall. */
  let nurMeine = false;

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">Offene ${esc(V.aufgabeMehrzahl)}</h1>
    <p class="hint" id="off-hint" style="margin:0 0 ${mehrereBenutzer() ? '10px' : '20px'}"></p>
    ${mehrereBenutzer() ? `<div class="pills" id="off-sicht" style="margin:0 0 20px"></div>` : ''}
    <div id="off-liste"></div>
  </div>`;

  function zeichneSicht() {
    const box = document.getElementById('off-sicht');
    if (!box) return;
    box.innerHTML = '';
    [true, false].forEach(meine => {
      const b = document.createElement('button');
      b.className = 'pill' + (meine === nurMeine ? ' on' : '');
      b.dataset.sicht = meine ? 'meine' : 'alle';
      b.textContent = meine ? 'meine' : 'alle';
      b.onclick = () => { nurMeine = meine; zeichne(); };
      box.appendChild(b);
    });
  }

  /* Der Haken schickt die Art AUSDRÜCKLICH, er schaltet nicht weiter.
     aufgabeWeiter() macht aus einer erledigten Aufgabe eine NOTIZ -- im
     Kommentarblock ist das die gewollte Abfolge, hier wäre es ein Kästchen,
     dessen zweiter Druck die Zeile lautlos aus der Menge nimmt. Zwei
     Bedienelemente, zwei Bedeutungen: dort eine Abfolge, hier ein Zustand.
     Geschrieben wird über PUT /api/comments/:id, die es längst gibt -- es
     entsteht keine neue schreibende Route.
     DIE ZEILE BLEIBT STEHEN, durchgestrichen: eine Zeile, die unter dem Zeiger
     verschwindet, nimmt die Möglichkeit, den Haken gleich wieder wegzunehmen.
     Der Vermerk steht nur hier im Speicher; beim nächsten Aufbau holt die
     Ansicht die Wahrheit wieder vom Server. */
  const setzeHaken = async (z, fertig) => {
    try {
      await api('PUT', `/api/comments/${z.id}`, { kind: fertig ? 'done' : 'task' });
      z.erledigt = fertig;
      zeichne();
    } catch (e) { toast(e.message, true); }
  };

  function zeichne() {
    zeichneSicht();
    const sichtbar = nurMeine ? zeilen.filter(z => z.mine) : zeilen;
    const gruppen = [];
    for (const z of sichtbar) {
      const letzte = gruppen[gruppen.length - 1];
      if (letzte && letzte.id === z.item.id) letzte.zeilen.push(z);
      else gruppen.push({ id: z.item.id, title: z.item.title, zeilen: [z] });
    }

    // Ein leerer Bildschirm ist eine schlechte Antwort. Und die beiden Fälle
    // sind verschieden: gar nichts offen, oder nichts von mir.
    document.getElementById('off-hint').textContent = !sichtbar.length
      ? (zeilen.length ? `Von mir ist nichts offen.`
                       : `Nichts offen — es warten keine ${V.aufgabeMehrzahl}.`)
      : `${sichtbar.length} ${vAufgabe(sichtbar.length)} offen, gruppiert nach `
        + `${V.sacheEinzahl}.`
        + (mehrereBenutzer() ? (nurMeine ? ' Gezeigt werden die eigenen.'
                                         : ' Gezeigt werden alle.') : '');

    const box = document.getElementById('off-liste');
    box.innerHTML = '';
    gruppen.forEach(g => {
      const kasten = document.createElement('div');
      kasten.className = 'off-gruppe';
      kasten.dataset.item = g.id;
      const kopf = document.createElement('a');
      kopf.className = 'off-titel';
      kopf.href = `#/item/${g.id}`;
      kopf.textContent = g.title;
      kasten.appendChild(kopf);

      g.zeilen.forEach(z => {
        const el = document.createElement('div');
        el.className = 'off-zeile' + (z.erledigt ? ' erledigt' : '');
        el.dataset.kommentar = z.id;

        /* EIN BEDIENZEICHEN FOLGT DEM RECHT, NICHT DER ANZEIGE. Die Art eines
           Kommentars darf setzen, wer ihn geschrieben hat, und der Admin --
           dieselbe Regel wie am Kommentar im Eintrag, und sie steht im Server.
           Wo sie nicht gilt, steht hier kein Kästchen; ein Haken, der ein 403
           holt, sähe aus wie ein Fehler. */
        if (z.mine || ADMIN) {
          const haken = document.createElement('button');
          haken.className = 'off-haken';
          haken.textContent = z.erledigt ? '☑' : '☐';
          haken.title = z.erledigt ? 'Wieder öffnen'
                                   : `Auf „${V.aufgabeErledigt}" setzen`;
          haken.onclick = () => setzeHaken(z, !z.erledigt);
          el.appendChild(haken);
        }

        const text = document.createElement('a');
        text.className = 'off-text';
        text.href = `#/item/${g.id}`;
        text.textContent = z.text;
        el.appendChild(text);

        // Verfasser nur ab zwei Zugängen -- bei einem wiederholte der Name nur,
        // wer ohnehin alles geschrieben hat. Dieselbe Schwelle wie überall.
        const wann = document.createElement('span');
        wann.className = 'off-wann';
        wann.textContent = (mehrereBenutzer() ? `${verfasserName(z.verfasser)} · ` : '')
          + fmtDate(z.created_at);
        el.appendChild(wann);

        kasten.appendChild(el);
      });
      box.appendChild(kasten);
    });
  }

  zeichne();
}

/* ================= Vergleich ================= */
async function renderCompare() {
  const ids = [...state.compare];
  if (ids.length < 2) { location.hash = '#/'; return; }
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  let items;
  try { items = await Promise.all(ids.map(id => api('GET', `/api/items/${id}`))); }
  catch (e) { toast(e.message, true); location.hash = '#/'; return; }

  const names = [];
  /* Das Gewicht gehoert dem KRITERIUM, nicht der Spalte: die Kriterienzeilen
     tragen den Namen einmal je Zeile, die Spalten sind die Eintraege. Die
     Marke steht deshalb einmal an der Zeilenbeschriftung und nicht je Spalte.
     Erste Nennung gewinnt, wie beim Namen -- global ist das Gewicht ohnehin
     dasselbe, gleich aus welchem Eintrag die Zeile stammt. */
  const gewichte = new Map();
  items.forEach(i => i.ratings.forEach(r => {
    if (!names.includes(r.name)) { names.push(r.name); gewichte.set(r.name, r.gewicht); }
  }));

  /* ANSICHTSZUSTAND IM SPEICHER, KEINE EINSTELLUNG -- wie linksOffen und
     wolkeOffen. Der Umschalter ist eine Linse auf dieselben Daten und darf
     keine zweite Wahrheit werden; beim naechsten Aufruf steht wieder die
     Vorgabe.
     VORGABESTELLUNG "alle": der Vergleich fragt, wie die Dinge zueinander
     stehen, und das beantwortet der Schnitt ueber alle.
     Bei genau einem Zugang erscheint der Umschalter nicht -- dann sind beide
     Stellungen dieselbe Zahl, und ein Knopf ohne Wirkung sieht aus wie ein
     Fehler. */
  let nurMeine = false;

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">Vergleich</h1>
    <p class="hint" id="cmp-hint" style="margin:0 0 ${mehrereBenutzer() ? '10px' : '20px'}"></p>
    ${mehrereBenutzer() ? `<div class="pills" id="cmp-sicht" style="margin:0 0 20px"></div>` : ''}
    <div class="cmp-grid" id="cg" style="grid-template-columns:repeat(auto-fit,minmax(264px,1fr))"></div>
  </div>`;

  const cg = document.getElementById('cg');

  /* DIE ZAHL FUER "MEINE" BILDET DER KLIENT. Bei einem Bewerter hat jedes
     Kriterium hoechstens eine Stimme -- Stufe 1 des Zweistufenmittels ist also
     der eigene Wert, und Stufe 2 mittelt darueber. Ein zweiter Rechenweg im
     Server waere eine zweite Wahrheit ueber denselben Schnitt.
     EIN ZWEITER RUNDUNGSORT, ABER FUER EINE ANDERE ZAHL -- darin liegt der
     Unterschied zu "gerundet wird genau einmal": jene Regel gilt dem Schnitt
     UEBER ALLE, der weiterhin nur im Server entsteht. Hier wird der EIGENE
     Schnitt gebildet, und auch er wird genau einmal gerundet, am Ende und auf
     dasselbe Zehntel wie drueben.
     Nur Werte ueber null zaehlen, wie ueberall: eine zurueckgesetzte Bewertung
     hinterlaesst eine Zeile mit 0, und die ist keine Stimme.
     DIESELBE FORMEL WIE gesamtSchnitt() IM SERVER, auf die eigene Menge
     angewandt: gewichteter Mittelwert, Nenner nur ueber die Kriterien, die ICH
     bewertet habe. Bliebe diese Stelle ungewichtet, zeigte der Umschalter
     "meine / alle" zwei Zahlen nach zwei verschiedenen Formeln -- und niemand
     koennte sagen, ob ein Unterschied von der anderen Bewertermenge kommt oder
     von der fehlenden Gewichtung. Genau die zweite Wahrheit, die der Absatz
     darueber vermeiden will.
     Ein Kriterium ohne eigenen Wert bringt sein Gewicht NICHT in den Nenner --
     dieselbe Falle wie im Server, hier bezogen auf "von mir bewertet" statt
     auf "von irgendwem bewertet". Sonst laege die eigene Zahl unter der ueber
     alle, ohne dass es an den Werten laege.
     ES SIND UND BLEIBEN GENAU ZWEI RECHENSTELLEN. Die Kachel der Uebersicht
     liest avgRating vom Server, und dabei bleibt es. */
  const eigenerSchnitt = (it) => {
    let zaehler = 0, nenner = 0;
    for (const r of it.ratings) {
      if (r.value > 0) { zaehler += r.value * r.gewicht; nenner += r.gewicht; }
    }
    if (!nenner) return null;
    return Math.round((zaehler / nenner) * 10) / 10;
  };
  // Drei Zahlen, ein Schalter: Kriterienwert, Kopfzahl und Testtagzeile
  // schalten gemeinsam um. Schaltete nur eine, waere es derselbe Widerspruch
  // mit einem Knopf davor.
  const wertVon = (it, name) => {
    const r = it.ratings.find(x => x.name === name);
    if (!r) return 0;
    return nurMeine ? r.value : (r.avg || 0);
  };
  const schnittVon = (it) => (nurMeine ? eigenerSchnitt(it) : it.avgRating);
  const zeitpunkteVon = (it) => (nurMeine
    ? (it.testDays || []).filter(t => t.mine).length
    : (it.testCount || 0));
  const alsZahl = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','));

  function zeichneSicht() {
    const box = document.getElementById('cmp-sicht');
    if (!box) return;
    box.innerHTML = '';
    [true, false].forEach(meine => {
      const b = document.createElement('button');
      b.className = 'pill' + (meine === nurMeine ? ' on' : '');
      b.dataset.sicht = meine ? 'meine' : 'alle';
      b.textContent = meine ? 'meine' : 'alle';
      b.onclick = () => { nurMeine = meine; zeichne(); };
      box.appendChild(b);
    });
  }

  function zeichne() {
    zeichneSicht();
    document.getElementById('cmp-hint').textContent =
      `${items.length} ${vSache(items.length)} gegenübergestellt. `
      + `Bester Wert je Kriterium ist hervorgehoben.`
      + (mehrereBenutzer()
        ? (nurMeine ? ' Gezeigt werden die eigenen Werte.' : ' Gezeigt wird der Schnitt über alle.')
        : '');

    const bestOf = (name) => Math.max(...items.map(o => wertVon(o, name)));
    const bestTest = Math.max(...items.map(zeitpunkteVon));

    cg.innerHTML = '';
    items.forEach(it => {
      const col = document.createElement('div');
      col.className = 'cmp-col';
      const rows = names.map(n => {
        const v = wertVon(it, n);
        const best = v > 0 && v === bestOf(n);
        // Die Marke ×1,5 an der Zeilenbeschriftung, abgeleitet wie ueberall:
        // bei Gewicht 1 steht dort nichts.
        const marke = gewichtMarke(gewichte.get(n));
        return `<div class="cmp-crit"><span class="cn">${esc(n)}${
            marke ? ` <span class="cgew" title="Gewicht im Gesamtschnitt">${esc(marke)}</span>` : ''}</span>
          <span class="${best ? 'cmp-best' : ''}">${v > 0 ? alsZahl(v) + ' / 5' : '–'}</span></div>`;
      }).join('');
      const zahl = zeitpunkteVon(it);
      const testRow = `<div class="cmp-crit" style="border-top:1px solid var(--line);margin-top:6px;padding-top:9px">
        <span class="cn">${esc(V.zeitpunktMehrzahl)}</span>
        <span class="${zahl && zahl === bestTest ? 'cmp-best' : ''}">${zahl || '–'}</span></div>`;
      const schnitt = schnittVon(it);
      col.innerHTML = `
        <div class="cimg">${it.photos[0] ? `<img src="/api/photos/${it.photos[0].id}/raw?size=medium" alt="">` : ''}</div>
        <div class="cbody">
          ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
          <h3>${esc(it.title)}</h3>
          <div class="hint cmp-schnitt" style="margin-bottom:10px">${schnitt ? '★ ' + schnitt.toFixed(1).replace('.', ',') + ' Durchschnitt' : 'keine Wertung'}</div>
          ${rows}${testRow}
          <div style="margin-top:12px"><a href="#/item/${it.id}" class="btn btn-sm" style="width:100%">Öffnen</a></div>
        </div>`;
      cg.appendChild(col);
    });
  }

  zeichne();
}

/* ================= Vollbild ================= */
let lightboxOpen = false;

// Adresse eines Bildes. Fotos am Eintrag haben ein unveraendertes Original,
// Kommentarbilder nicht -- dort ist die gespeicherte Variante schon die
// groesste, und der Zoom entfaellt.
function bildQuelle(p, groesse) {
  if (p.quelle === 'kommentar')
    return `/api/comment-images/${p.id}/raw${groesse === 'thumb' ? '?size=thumb' : ''}`;
  return `/api/photos/${p.id}/raw${groesse ? `?size=${groesse}` : ''}`;
}
// Woran die Oberflaeche ein Video erkennt: an art aus der Antwort, an nichts
// sonst. Kein Raten am ausgelieferten Typ, keine zweite Wahrheit.
const istVideo = (p) => p?.art === 'video';
// Beim Video gehoert der zweite Klick der Abspielsteuerung, nicht dem Zoom.
// Kommentarbilder haben ohnehin kein Original.
const hatOriginal = (p) => p.quelle !== 'kommentar' && !istVideo(p);
// 42 -> "0:42", 130 -> "2:10". Ohne bekannte Dauer steht nichts da.
function dauerText(s) {
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
}

// Nach dem Zoom steht der Bildlauf auf 0/0 -- man sieht die linke obere Ecke
// des Originals statt der Stelle, die man eben noch betrachtet hat. Erwartet
// wird die Mitte. Eigene Funktionsdeklaration, weil der Pruefstand keine
// Massen kennt (jsdom rechnet kein Layout) und ihr die Zahlen deshalb
// unmittelbar vorlegen muss.
function zentriereBuehne(buehne) {
  if (!buehne) return;
  buehne.scrollLeft = Math.max(0, (buehne.scrollWidth - buehne.clientWidth) / 2);
  buehne.scrollTop = Math.max(0, (buehne.scrollHeight - buehne.clientHeight) / 2);
}

function openLightbox(photos, startIdx, title) {
  if (!photos.length) return;
  lightboxOpen = true;
  let i = startIdx, zoomed = false;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lb-top">
      <span class="lb-title">${esc(title || '')}</span>
      <div class="lb-tools">
        <span class="lb-count"></span>
        <button class="lb-btn zoom" title="Auf Originalgröße zoomen">⊕</button>
        <button class="lb-btn close" title="Schließen (Esc)">✕</button>
      </div>
    </div>
    <div class="lb-stage"><img alt="" title="Klick zoomt auf Originalgröße">
      <video class="lb-video" controls playsinline hidden></video></div>
    ${photos.length > 1 ? `<button class="lb-nav prev" title="Vorheriges (←)">‹</button>
                           <button class="lb-nav next" title="Nächstes (→)">›</button>` : ''}
    ${photos.length > 1 ? `<div class="lb-strip"></div>` : ''}`;
  document.body.appendChild(lb);
  document.body.classList.add('lb-open');

  const stage = lb.querySelector('.lb-stage');
  const img = lb.querySelector('.lb-stage img');
  const abspieler = lb.querySelector('.lb-video');
  const strip = lb.querySelector('.lb-strip');

  /* ANHALTEN BEIM BLAETTERN UND BEIM VERLASSEN. Ohne das spielt der Ton
     weiter, waehrend man das naechste Bild ansieht -- und beim Schliessen
     bliebe ein unsichtbares Element am Laufen. Die Quelle wird mit
     abgeraeumt, sonst laedt der Browser weiter. */
  const halteAn = () => {
    if (!abspieler.hidden || abspieler.src) {
      abspieler.pause();
      abspieler.removeAttribute('src');
      abspieler.load();
    }
  };

  // Erst wenn das Original geladen ist, stehen seine Masse fest -- vorher waere
  // scrollWidth noch das der kleinen Variante und die Mitte falsch berechnet.
  img.addEventListener('load', () => { if (zoomed) zentriereBuehne(stage); });

  function setZoom(on) {
    zoomed = on;
    stage.classList.toggle('zoomed', on);
    // Erst beim Zoom wird das unveraenderte Original geladen.
    img.src = bildQuelle(photos[i], on ? '' : 'medium');
  }
  function show() {
    if (i < 0) i = photos.length - 1;
    if (i >= photos.length) i = 0;
    zoomed = false;
    stage.classList.remove('zoomed');
    halteAn();
    const video = istVideo(photos[i]);
    // Statt des Bildes der Abspieler. Kein automatisches Abspielen -- der
    // Klick auf die Steuerung startet, sonst nichts.
    img.hidden = video;
    abspieler.hidden = !video;
    if (video) {
      abspieler.poster = bildQuelle(photos[i], 'medium');
      abspieler.src = bildQuelle(photos[i], '');
    } else {
      img.src = bildQuelle(photos[i], 'medium');
    }
    // Ohne Original kein Zoomknopf -- ein Knopf, der nichts tut, wirkt kaputt.
    lb.querySelector('.zoom').hidden = !hatOriginal(photos[i]);
    img.title = hatOriginal(photos[i]) ? 'Klick zoomt auf Originalgröße' : '';
    lb.querySelector('.lb-count').textContent = `${i + 1} / ${photos.length}`;
    if (strip) {
      [...strip.children].forEach((t, n) => t.classList.toggle('on', n === i));
      strip.children[i]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    }
  }
  if (strip) photos.forEach((p, n) => {
    const t = document.createElement('button');
    t.className = 'lb-thumb' + (istVideo(p) ? ' ist-video' : '');
    t.innerHTML = `<img src="${bildQuelle(p, 'thumb')}" alt="">` +
      (istVideo(p) ? `<span class="spielmarke">▶</span>` : '');
    t.onclick = () => { i = n; show(); };
    strip.appendChild(t);
  });

  const close = () => {
    halteAn();
    lightboxOpen = false;
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('lb-open');
    lb.remove();
  };
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); i--; show(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); i++; show(); }
  }
  document.addEventListener('keydown', onKey, true);

  lb.querySelector('.close').onclick = close;
  lb.querySelector('.zoom').onclick = () => setZoom(!zoomed);
  // Auf dem Finger zoomt erst der zweite Tipp. Ein einzelner Tipp tut nichts --
  // Schliessen waere bei jedem versehentlichen Antippen zu hart, und beim
  // Betrachten tippt man leicht daneben.
  const DOPPELTIPP = 300;
  let letzterTipp = 0;
  img.addEventListener('pointerup', (e) => {
    if (!hatOriginal(photos[i])) return;
    if (e.pointerType !== 'touch') { setZoom(!zoomed); return; }
    const jetzt = Date.now();
    if (jetzt - letzterTipp < DOPPELTIPP) { letzterTipp = 0; setZoom(!zoomed); }
    else letzterTipp = jetzt;
  });
  lb.querySelector('.prev')?.addEventListener('click', () => { i--; show(); });
  lb.querySelector('.next')?.addEventListener('click', () => { i++; show(); });
  stage.addEventListener('click', e => { if (e.target === stage) close(); });

  let sx = 0, sy = 0, moved = false;
  stage.addEventListener('touchstart', e => {
    if (zoomed || e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = true;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (!moved || zoomed) return;
    moved = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { i += dx < 0 ? 1 : -1; show(); }
  }, { passive: true });

  show();
}

/* ================= Ziehen zum Umsortieren ================= */
// Ein Aufruf fuer Vorschaubilder und Linkzeilen. Pointer-Events statt der
// HTML5-Ziehschnittstelle, damit es auch mit dem Finger funktioniert.
// handle: Ziehen beginnt nur an diesem Teil. Ohne Angabe zieht das ganze
// Element, wie bisher bei Fotos, Links und Kriterien.
// Halten, bevor auf dem Finger gezogen wird. Ohne das ist jede Wischbewegung
// ueber einer Liste ein Umsortieren -- man kann dann nicht mehr scrollen und
// muss eine freie Stelle suchen. Mit der Maus bleibt es bei der Schwelle von
// wenigen Pixeln, dort gibt es kein Scrollen mit demselben Zeiger.
const HALTEZEIT = 400;      // Millisekunden, bis der Finger greift
const WISCH_TOLERANZ = 8;   // bewegt er sich vorher weiter, war es Scrollen

function makeSortable(el, { axis = 'x', selector, onClick, onDrop, ignore, handle }) {
  el.addEventListener('pointerdown', e => {
    if (handle && !e.target.closest(handle)) return;
    if (ignore && e.target.closest(ignore)) return;
    const box = el.parentElement;
    const sx = e.clientX, sy = e.clientY;
    const finger = e.pointerType === 'touch';
    let dragging = false;
    // Auf dem Finger erst nach der Haltezeit; mit der Maus sofort.
    let bereit = !finger;
    let halten = null;

    // Solange der Browser das Scrollen noch nicht uebernommen hat, laesst es
    // sich abfangen. Deshalb greift dieser Hoerer erst nach der Haltezeit --
    // vorher soll gescrollt werden duerfen.
    const haltFest = (ev) => { if (dragging) ev.preventDefault(); };

    const aufraeumen = () => {
      clearTimeout(halten);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', abbruch);
      document.removeEventListener('touchmove', haltFest);
    };

    const move = ev => {
      const dist = Math.hypot(ev.clientX - sx, ev.clientY - sy);
      if (!bereit) {
        // Bewegung vor Ablauf der Haltezeit: das war ein Wisch, kein Griff.
        if (dist > WISCH_TOLERANZ) { aufraeumen(); }
        return;
      }
      if (!dragging && dist < (finger ? 0 : 6)) return;
      if (!dragging) { dragging = true; el.classList.add('dragging'); }
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(selector);
      if (over && over !== el && over.parentElement === box) {
        const r = over.getBoundingClientRect();
        const after = axis === 'x'
          ? (ev.clientX - r.left) > r.width / 2
          : (ev.clientY - r.top) > r.height / 2;
        box.insertBefore(el, after ? over.nextSibling : over);
      }
    };

    const abbruch = () => { el.classList.remove('griffbereit', 'dragging'); aufraeumen(); };

    const up = () => {
      const gezogen = dragging;
      el.classList.remove('griffbereit');
      aufraeumen();
      if (!gezogen) { onClick && onClick(); return; }
      el.classList.remove('dragging');
      onDrop && onDrop([...box.children]);
    };

    if (finger) {
      halten = setTimeout(() => {
        bereit = true;
        // Sichtbare Rueckmeldung: von jetzt an haengt die Zeile am Finger.
        el.classList.add('griffbereit');
        if (navigator.vibrate) navigator.vibrate(12);
        document.addEventListener('touchmove', haltFest, { passive: false });
      }, HALTEZEIT);
    }

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', abbruch);
  });
}

/* ================= Verlauf der Tagesnoten ================= */
function sparkline(days) {
  // days kommt absteigend; fuer den Verlauf brauchen wir aufsteigend
  const pts = [...days].reverse();
  if (pts.length < 3) return '';
  const w = 520, h = 46, pad = 5;
  const step = (w - pad * 2) / Math.max(1, pts.length - 1);
  const y = v => h - pad - ((v - 1) / 4) * (h - pad * 2);
  const coords = pts.map((d, i) => [pad + i * step, y(d.rating)]);
  const line = coords.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length-1][0].toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  // Dieselbe Unterscheidung wie in der Zeitleiste ueber dem
  // Kartenraster -- eigene Punkte gefuellt, fremde als Ring. Die Linie selbst
  // laeuft weiter ueber alle: sie ist der Verlauf des Eintrags, nicht der einer
  // Person.
  const dots = coords.map(([x, yy], i) => pts[i].mine === false
    ? `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="2.4" fill="var(--surface)" stroke="var(--gold)" stroke-width="1.4"/>`
    : `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="2.6" fill="var(--gold)"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${area}" fill="var(--accent-dim)"/>
    <path d="${line}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${dots}</svg>`;
}

/* ================= Detailansicht ================= */
async function renderDetail(id) {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  let item, cats, allTags;
  try {
    [item, cats, allTags] = await Promise.all([
      api('GET', `/api/items/${id}`), api('GET', '/api/product-categories'), api('GET', '/api/tags')
    ]);
  } catch (e) {
    if (e.message !== 'Sitzung abgelaufen')
      app.innerHTML = `<div class="shell"><a href="#/" class="back">← Zurück</a><p class="hint">${esc(V.sacheEinzahl)} nicht gefunden.</p></div>`;
    return;
  }
  let idx = 0;
  let ausschnittModus = false;   // Klick setzt dann den Fokuspunkt statt Vollbild zu oeffnen
  let linksOffen = false;        // nur fuer diese Ansicht, nicht auf dem Server

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <div class="detail">
      <div>
        <div class="viewer" id="viewer"></div>
        <div class="thumbs" id="thumbs"></div>
        <label class="drop" id="drop"><input type="file" id="file" accept="image/*,video/*" multiple>
          Fotos und Videos hinzufügen — mehrere möglich, oder mit Strg+V einfügen</label>
        <p class="hint hint-sm" style="margin:8px 2px 0">
          Klick aufs Foto öffnet die Vollbildansicht, am Video der Knopf „Vollbild".
          Blättern mit ← → oder den Pfeilen.
          Das erste Element ist das Hauptbild; Reihenfolge per Ziehen ändern.
          Videos bis 20 MB, als MP4, WebM oder MOV — das Standbild erzeugt der Browser.</p>
      </div>

      <div class="meta-col">
        <div>
          <div class="title-line">
            <input class="title-in" id="title" value="${esc(item.title)}">
            <button class="pin-btn${item.favorite ? ' on' : ''}" id="pin" title="${item.favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}">${item.favorite ? '★' : '☆'}</button>
          </div>
          <div class="hint hint-sm verfasser-zeile" id="ivf" hidden></div>
          <div class="switches" style="margin-top:10px">
            <button class="switch" id="sw-test"><span class="knob"></span><span id="sw-test-t"></span></button>
            <button class="switch" id="sw-rej"><span class="knob"></span><span id="sw-rej-t"></span></button>
          </div>
        </div>

        <div class="blocks" id="blocks-seite">
        <div class="block" data-block="kategorie">
          <div class="block-head"><span class="label">Kategorie</span></div>
          <div class="row-in">
            <select class="select select-sm" id="cat" style="min-width:148px;padding:9px 11px"></select>
            ${darfKategorieAnlegen() ? `<input class="input input-sm" id="newcat" placeholder="+ neue Kategorie" style="padding:8px 11px">
            <button class="btn btn-sm" id="newcat-b">Anlegen</button>` : ''}
          </div>
        </div>

        <div class="block" data-block="tags">
          <div class="block-head"><span class="label">Tags</span></div>
          <div class="chips" id="chips"></div>
          <!-- Diese Liste steht ausserhalb der Eingabezeile: die Tageingabe
               am Testtag benutzt sie, und die bleibt in jedem Fall stehen. -->
          <datalist id="tagsug"></datalist>
          ${darfTagAnlegen() ? `<div class="row-in">
            <input class="input input-sm" id="newtag" list="tagsug" placeholder="Tag eingeben, Enter bestätigt" style="padding:8px 11px">
            <button class="btn btn-sm" id="newtag-b">+ Hinzufügen</button>
          </div>` : ''}
          <div class="wolke-kopf"><span class="hint">Vorhandene Tags — Klick vergibt, erneuter Klick nimmt zurück</span>
            <button class="link-btn" id="tagcloud-more" hidden>mehr</button></div>
          <div class="pills cloud" id="tagcloud"></div>
        </div>

        <div class="block" data-block="bewertung">
          <div class="block-head"><span class="label">Bewertung</span>
            <span class="hint" id="rhead"></span>
            ${ADMIN && mehrereBenutzer() ? `<button class="btn btn-ghost btn-sm" id="rwho">Wer hat bewertet</button>` : ''}
            <button class="btn btn-ghost btn-sm" id="reset-r">Meine Bewertung zurücksetzen</button></div>
          <div id="ratings"></div>
        </div>
        </div>
      </div>
    </div>

    <div class="blocks" id="blocks-unten">

    <div class="block block-wide" data-block="beschreibung">
      <div class="block-head"><span class="label">Beschreibung</span></div>
      <textarea class="ta ta-desc" id="desc" placeholder="Worum geht es hier?">${esc(item.description)}</textarea>
    </div>

    <div class="block block-wide" id="testblock" data-block="testtage"></div>

    <div class="block block-wide" data-block="links">
      <div class="block-head"><span class="label">Links</span><span class="hint" id="lcount"></span></div>
      <div class="link-scroll" id="links"></div>
      <button class="link-more" id="links-more" hidden></button>
      <div class="row-in">
        <input class="input input-sm" id="newlink" placeholder="Adresse oder Suchbegriff, Enter bestätigt" style="padding:9px 11px">
        <button class="btn btn-sm" id="newlink-b">+ Hinzufügen</button>
      </div>
    </div>

    <div class="block block-wide" data-block="dateien">
      <div class="block-head"><span class="label">Dateien</span><span class="hint" id="acount"></span></div>
      <div id="atts"></div>
      <div class="row-in">
        <input type="file" id="afile" multiple hidden>
        <button class="btn btn-sm" id="aadd">+ Dateien anhängen</button>
        <span class="hint">bis 50 MB je Datei, höchstens 20 Stück</span>
      </div>
    </div>

    <div class="block block-wide" data-block="kommentare">
      <div class="block-head"><span class="label">Kommentare</span><span class="hint" id="ccount"></span></div>
      <div class="cmts" id="cmts"></div>
      <div class="cmt-form">
        <textarea class="ta" id="ctext" placeholder="Notiz hinterlassen — Bilder mit Strg+V einfügen …"></textarea>
        <div class="cmt-neu-bilder" id="cneu-imgs"></div>
        <div class="cmt-form-row">
          <span class="marks">
            <button class="mark pin" id="cpin" title="Anpinnen — steht dann ganz oben">📌</button>
            <button class="mark art" id="cart"></button>
            <button class="mark aufg" id="caufg"></button>
          </span>
          <button class="btn btn-sm" id="cimg">+ Bild</button>
          <button class="btn btn-sm btn-accent" id="cadd">Kommentar hinzufügen</button>
        </div>
      </div>
    </div>
    </div>

    <div class="danger-row"><button class="btn btn-danger btn-sm" id="del">${esc(V.sacheEinzahl)} löschen</button></div>
  </div>`;

  /* ---- Fotos ---- */
  function drawViewer() {
    const v = document.getElementById('viewer');
    // Der Betrachter bleibt bei jedem Neuzeichnen dasselbe Element; innerHTML
    // ersetzt nur die Kinder. Zeigerbehandler und Kennzeichnung des
    // Ausschnittmodus haengen aber an ihm selbst und muessen von Hand weg --
    // sonst wirkt der verlassene Modus weiter: der Klick aufs Bild speichert
    // dann einen Ausschnitt, statt das Vollbild zu oeffnen.
    v.onpointerdown = v.onpointermove = v.onpointerup = null;
    v.classList.remove('focus-mode');
    // Beim Blaettern anhalten, bevor das Element verschwindet -- sonst spielt
    // der Ton der abgeraeumten Zeile noch einen Augenblick weiter.
    v.querySelector('video')?.pause();
    const ps = item.photos;
    if (!ps.length) { v.innerHTML = ICON_PH; return; }
    if (idx >= ps.length) idx = 0;
    if (idx < 0) idx = ps.length - 1;
    /* Am Videoplatz steht der Abspieler -- ausser im Ausschnittmodus. Dort
       zeigt der Betrachter das Standbild, denn eingestellt wird die Kachel,
       und die gibt es am Video genauso. Der Rahmen rechnet ausserdem mit den
       natuerlichen Massen eines Bildes. */
    const zeigtVideo = istVideo(ps[idx]) && !ausschnittModus;
    v.innerHTML = (zeigtVideo
        ? `<video controls playsinline preload="metadata"
             poster="/api/photos/${ps[idx].id}/raw?size=medium"
             src="/api/photos/${ps[idx].id}/raw"></video>`
        : `<img src="/api/photos/${ps[idx].id}/raw?size=medium" alt="" title="Für Vollbild klicken">`) + `
      ${idx === 0 ? `<span class="main-flag">Hauptbild</span>` : ''}
      ${/* NUR am Videoplatz. Beim Foto oeffnet der Klick aufs Bild das
           Vollbild; am Video gehoert der Klick der Abspielsteuerung, und ohne
           diesen Knopf gaebe es von einem reinen Videobestand aus gar keinen
           Weg hinein. Ein zweiter Knopf am Foto waere dagegen nur Beiwerk. */''}
      ${zeigtVideo ? `<button class="vfull" title="Vollbild öffnen">Vollbild</button>` : ''}
      <button class="vfocus${ausschnittModus ? ' on' : ''}" title="Bildausschnitt der Vorschau festlegen">Ausschnitt</button>
      ${ps.length > 1 ? `<button class="vnav prev" title="Vorheriges (←)">‹</button>
        <button class="vnav next" title="Nächstes (→)">›</button>
        <span class="vcount">${idx + 1} / ${ps.length}</span>` : ''}`;
    const bild = v.querySelector('img');
    if (bild) bild.onclick = () => { if (!ausschnittModus) openLightbox(item.photos, idx, item.title); };
    v.querySelector('.vfull')?.addEventListener('click',
      () => openLightbox(item.photos, idx, item.title));
    v.querySelector('.vfocus').onclick = () => {
      ausschnittModus = !ausschnittModus;
      drawViewer();
      if (ausschnittModus) toast('Klicken oder ziehen legt den Bildausschnitt fest');
    };
    if (ausschnittModus && bild) ruesteAusschnittAus(v, bild, ps[idx]);
    if (ps.length > 1) {
      v.querySelector('.prev').onclick = () => { idx--; drawViewer(); markThumb(); };
      v.querySelector('.next').onclick = () => { idx++; drawViewer(); markThumb(); };
    }
  }

  // Ausschnitt festlegen. Der Rahmen zeigt, was die quadratische Vorschau
  // spaeter zeigen wird -- ohne ihn muesste man raten.
  function ruesteAusschnittAus(v, bild, foto) {
    v.classList.add('focus-mode');
    const rahmen = document.createElement('div');
    rahmen.className = 'focus-frame';
    v.appendChild(rahmen);

    // Das Bild steht mit object-fit:contain im Betrachter; gerechnet wird auf
    // dem tatsaechlich sichtbaren Rechteck, nicht auf dem Element.
    const flaeche = () => {
      const r = bild.getBoundingClientRect();
      const nb = bild.naturalWidth || 1, nh = bild.naturalHeight || 1;
      const m = Math.min(r.width / nb, r.height / nh);
      const b = nb * m, h = nh * m;
      return { links: r.left + (r.width - b) / 2, oben: r.top + (r.height - h) / 2, breite: b, hoehe: h };
    };

    let fx = Number(foto.focus_x ?? 50), fy = Number(foto.focus_y ?? 50);

    const zeichne = () => {
      const f = flaeche();
      const vr = v.getBoundingClientRect();
      const seite = Math.min(f.breite, f.hoehe);          // der quadratische Ausschnitt
      // object-position: bei 0 % liegt der Ausschnitt am Anfang, bei 100 % am
      // Ende -- der Weg dazwischen ist die Ueberlaenge der laengeren Seite.
      const x = f.links - vr.left + (f.breite - seite) * fx / 100;
      const y = f.oben - vr.top + (f.hoehe - seite) * fy / 100;
      rahmen.style.left = x + 'px';
      rahmen.style.top = y + 'px';
      rahmen.style.width = seite + 'px';
      rahmen.style.height = seite + 'px';
    };
    zeichne();
    if (!bild.complete) bild.onload = zeichne;

    // Aus der Zeigerposition den Fokuspunkt errechnen: der angeklickte Punkt
    // soll in der Mitte des Ausschnitts liegen, soweit das Bild das hergibt.
    const ausPunkt = (e) => {
      const f = flaeche();
      const seite = Math.min(f.breite, f.hoehe);
      const px = e.clientX - f.links, py = e.clientY - f.oben;
      const spielX = f.breite - seite, spielY = f.hoehe - seite;
      fx = spielX > 0 ? Math.min(100, Math.max(0, (px - seite / 2) / spielX * 100)) : 50;
      fy = spielY > 0 ? Math.min(100, Math.max(0, (py - seite / 2) / spielY * 100)) : 50;
      zeichne();
    };

    let zieht = false;
    v.onpointerdown = (e) => {
      if (e.target.closest('.vfocus, .vnav')) return;
      zieht = true; ausPunkt(e);
      v.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    v.onpointermove = (e) => { if (zieht) ausPunkt(e); };
    v.onpointerup = async () => {
      if (!zieht) return;
      zieht = false;
      try {
        item = await api('PUT', `/api/photos/${foto.id}/focus`, { x: fx, y: fy });
        drawThumbs();
        toast('Bildausschnitt gespeichert');
      } catch (e) { toast(e.message, true); }
    };
  }
  const markThumb = () =>
    document.querySelectorAll('#thumbs .thumb').forEach((t, i) => t.classList.toggle('current', i === idx));

  function drawThumbs() {
    const box = document.getElementById('thumbs');
    box.innerHTML = '';
    item.photos.forEach((p, i) => {
      const t = document.createElement('div');
      t.className = 'thumb' + (i === idx ? ' current' : '') + (istVideo(p) ? ' ist-video' : '');
      t.dataset.pid = p.id;
      // Abgeleitet aus art und dauer, kein Schalter: das ▶ in der Ecke und,
      // wenn die Dauer bekannt ist, die Laenge daneben.
      const laenge = istVideo(p) ? dauerText(p.dauer) : '';
      const wort = istVideo(p) ? 'Video' : 'Foto';
      t.innerHTML = `<img src="/api/photos/${p.id}/raw?size=thumb" alt="" style="object-position:${fokus(p)}">` +
        (istVideo(p) ? `<span class="spielmarke">▶</span>` : '') +
        (laenge ? `<span class="dauer">${laenge}</span>` : '') +
        `<span class="num">${i + 1}</span><span class="del" title="${wort} löschen">✕</span>`;
      t.querySelector('.del').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox(`${wort} löschen?`, `Dieses ${wort} wird unwiderruflich entfernt.`)) return;
        try {
          await api('DELETE', `/api/photos/${p.id}`);
          item = await api('GET', `/api/items/${id}`);
          if (idx >= item.photos.length) idx = Math.max(0, item.photos.length - 1);
          drawViewer(); drawThumbs();
        } catch (err) { toast(err.message, true); }
      };
      makeSortable(t, {
        axis: 'x', selector: '.thumb', ignore: '.del',
        onClick: () => { idx = [...t.parentElement.children].indexOf(t); drawViewer(); markThumb(); },
        onDrop: async (children) => {
          const order = children.map(c => +c.dataset.pid);
          const currentId = item.photos[idx]?.id;
          try {
            item = await api('PUT', `/api/items/${id}/photo-order`, { order });
            idx = Math.max(0, item.photos.findIndex(p2 => p2.id === currentId));
            drawViewer(); drawThumbs();
            toast('Reihenfolge gespeichert');
          } catch (err) { toast(err.message, true); }
        }
      });
      box.appendChild(t);
    });
  }

  /* Ein Standbild aus dem gewaehlten Video ziehen -- IM BROWSER, ohne dass der
     Server das Video je oeffnen muesste. Wer es abspielen kann, kann auch ein
     Standbild daraus ziehen; wer nicht, laedt es gar nicht erst hoch. Das ist
     die Entscheidung, an der der ganze Videoweg haengt: kein ffmpeg im Image,
     keine neue Abhaengigkeit, keine Videobibliothek mit eigener
     Angriffsflaeche.
     Die blob:-Adresse am <video> braucht media-src 'self' blob: in der
     Sicherheitsregel der Anwendung -- ohne die Freigabe scheitert das hier
     wortlos. */
  async function standbild(datei, sekunde = 1) {
    const v = document.createElement('video');
    v.preload = 'metadata'; v.muted = true; v.playsInline = true;
    v.src = URL.createObjectURL(datei);
    try {
      await new Promise((ok, fehl) => {
        v.onloadedmetadata = ok;
        v.onerror = () => fehl(new Error('Dieses Video kann der Browser nicht lesen'));
      });
      // Ein Video ohne Bildmasse -- etwa eine reine Tonspur -- ergaebe eine
      // Zeichenflaeche der Groesse null und damit gar kein Standbild.
      if (!v.videoWidth || !v.videoHeight)
        throw new Error('Dieses Video hat kein Bild');
      v.currentTime = Math.min(sekunde, (v.duration || 2) / 2);
      await new Promise((ok, fehl) => {
        v.onseeked = ok;
        v.onerror = () => fehl(new Error('Dieses Video kann der Browser nicht lesen'));
      });
      const c = document.createElement('canvas');
      c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      const bild = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
      if (!bild) throw new Error('Aus diesem Video ließ sich kein Standbild ziehen');
      return { bild, dauer: Math.round(v.duration) || null };
    } finally { URL.revokeObjectURL(v.src); }
  }

  // Fotos gehen gebuendelt in einem Vorgang, Videos einzeln: jedes bringt sein
  // eigenes Standbild mit, und zwei benannte Felder tragen nur ein Paar.
  async function uploadFiles(files) {
    if (!files.length) return;
    const bilder = files.filter(f => !/^video\//.test(f.type));
    const videos = files.filter(f => /^video\//.test(f.type));
    const drop = document.getElementById('drop');
    const old = drop.textContent;
    drop.textContent = 'wird hochgeladen …';
    let fertig = 0;
    try {
      if (bilder.length) {
        const fd = new FormData();
        for (const f of bilder) fd.append('photos', f);
        item = await api('POST', `/api/items/${id}/photos`, fd, true);
        fertig += bilder.length;
      }
      for (const f of videos) {
        drop.textContent = 'Standbild wird erzeugt …';
        const { bild, dauer } = await standbild(f);
        drop.textContent = 'wird hochgeladen …';
        const fd = new FormData();
        fd.append('video', f, f.name);
        fd.append('standbild', bild, 'standbild.jpg');
        if (dauer) fd.append('dauer', String(dauer));
        item = await api('POST', `/api/items/${id}/videos`, fd, true);
        fertig++;
      }
      drawViewer(); drawThumbs();
      if (fertig) toast(`${fertig} ${fertig === 1 ? 'Element' : 'Elemente'} hinzugefügt`);
    } catch (err) {
      toast(err.message, true);
      // Was schon durchging, ist durch -- die Anzeige muss es zeigen.
      if (fertig) { drawViewer(); drawThumbs(); }
    }
    drop.textContent = old;
  }

  document.getElementById('file').onchange = e => { uploadFiles([...e.target.files]); e.target.value = ''; };

  // Bilder aus der Zwischenablage — spart bei Bildschirmfotos den Umweg ueber eine Datei
  const onPaste = (e) => {
    const t = document.activeElement?.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    const files = [...(e.clipboardData?.files || [])].filter(f => /^image\//.test(f.type));
    if (!files.length) return;
    e.preventDefault();
    uploadFiles(files);
  };
  document.addEventListener('paste', onPaste);

  // Ablegen per Maus direkt auf das Feld
  const drop = document.getElementById('drop');
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => uploadFiles([...(e.dataTransfer?.files || [])]
    .filter(f => /^image\//.test(f.type) || /^video\//.test(f.type))));

  // Pfeiltasten blaettern, aber nicht waehrend getippt wird und nicht bei offenem Vollbild
  const keyNav = e => {
    const t = document.activeElement?.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (document.querySelector('.backdrop') || lightboxOpen) return;
    if (!item.photos.length) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); idx--; drawViewer(); markThumb(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); idx++; drawViewer(); markThumb(); }
  };
  document.addEventListener('keydown', keyNav);
  window.addEventListener('hashchange', () => {
    document.removeEventListener('keydown', keyNav);
    document.removeEventListener('paste', onPaste);
  }, { once: true });

  /* ---- Schalter ---- */
  function drawSwitches() {
    const t = document.getElementById('sw-test'), r = document.getElementById('sw-rej');
    const locked = item.testDays.length > 0;
    t.className = 'switch' + (item.tested ? ' on-green' : '') + (locked ? ' locked' : '');
    t.title = locked ? `Solange ${V.zeitpunktMehrzahl} eingetragen sind, lässt sich das nicht zurücknehmen.` : '';
    document.getElementById('sw-test-t').textContent = item.tested ? V.merkmalJa : V.merkmalNein;
    r.className = 'switch' + (item.rejected ? ' on-red' : '');
    document.getElementById('sw-rej-t').textContent = item.rejected ? 'Abgelehnt' : 'Nicht abgelehnt';
  }
  document.getElementById('sw-test').onclick = async () => {
    try { item = await api('PUT', `/api/items/${id}`, { tested: !item.tested }); drawSwitches(); drawTestDays(); }
    catch (e) { toast(e.message, true); }   // Sperre wird serverseitig begruendet
  };
  document.getElementById('sw-rej').onclick = async () => {
    try { item = await api('PUT', `/api/items/${id}`, { rejected: !item.rejected }); drawSwitches(); }
    catch (e) { toast(e.message, true); }
  };
  /* Den Knopf NICHT aus dem Ereignis holen: e.currentTarget ist nur waehrend
     der Zustellung gesetzt und steht nach dem ersten await auf null. Der
     Klick schriebe dann zwar richtig weg, wuerfe aber danach und zeichnete
     den Knopf nie neu. Deshalb zeichnen wie die beiden Schalter
     darueber: nach dem await aus `item`, das der Server gerade frisch
     geliefert hat. */
  function drawPin() {
    const b = document.getElementById('pin');
    if (!b) return;
    b.className = 'pin-btn' + (item.favorite ? ' on' : '');
    b.textContent = item.favorite ? '★' : '☆';
    // Der Ueberfahrtext gehoert mit gezeichnet: er benennt die
    // naechste Handlung, nicht das Merkmal -- bliebe er stehen, boete ein
    // gesetzter Favorit weiterhin "Als Favorit markieren" an.
    b.title = item.favorite ? 'Favorit entfernen' : 'Als Favorit markieren';
  }
  document.getElementById('pin').onclick = async () => {
    try {
      item = await api('PUT', `/api/items/${id}`, { favorite: !item.favorite });
      drawPin();
    } catch (err) { toast(err.message, true); }
  };

  /* ---- Texte ---- */
  const titleEl = document.getElementById('title');
  titleEl.onblur = async () => {
    const v = titleEl.value.trim();
    if (!v || v === item.title) return;
    try { item = await api('PUT', `/api/items/${id}`, { title: v }); toast('Gespeichert'); }
    catch (e) { toast(e.message, true); }
  };
  const descEl = document.getElementById('desc');
  autoGrow(descEl);
  descEl.onblur = async () => {
    if (descEl.value === item.description) return;
    try { item = await api('PUT', `/api/items/${id}`, { description: descEl.value }); toast('Gespeichert'); }
    catch (e) { toast(e.message, true); }
  };

  /* ---- Kategorie ---- */
  /* ---- Wer den Eintrag angelegt hat, und wann ----
     Bei genau einem aktiven Zugang bleibt die Zeile weg -- "Angelegt von mir"
     ist keine Information, und dann ist auch das Datum keine: es steht schon
     in der Sortierung. Abgeleitet aus der Zahl der Zugänge, nicht aus einem
     Schalter; die Schwelle steht in mehrereBenutzer() und nirgends sonst.
     Das Datum ist reine Anzeige, in derselben Form wie am Kommentar --
     zwei Schreibweisen für denselben Zeitpunkt wären eine zu viel.
     `created_at` steht NOT NULL in der Zeile; ein Auffangnetz für den
     fehlenden Wert wäre eines gegen etwas, das es nicht gibt. */
  function drawVerfasser() {
    const el = document.getElementById('ivf');
    if (!el) return;
    el.hidden = !mehrereBenutzer();
    el.textContent = mehrereBenutzer()
      ? `Angelegt von ${verfasserName(item.verfasser)} am ${fmtDate(item.created_at)}` : '';
  }

  function drawCat() {
    const s = document.getElementById('cat');
    s.innerHTML = `<option value="">— keine —</option>` + cats.map(c =>
      `<option value="${c.id}"${item.category && item.category.id === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
    s.onchange = async () => {
      try { item = await api('PUT', `/api/items/${id}`, { productCategoryId: s.value ? +s.value : null }); toast('Kategorie gesetzt'); }
      catch (e) { toast(e.message, true); }
    };
    ruesteBloeckeAus(item);
  }
  const addCat = async () => {
    const el = document.getElementById('newcat');
    const name = el.value.trim();
    if (!name) return;
    try {
      const c = await api('POST', '/api/product-categories', { name });
      item = await api('PUT', `/api/items/${id}`, { productCategoryId: c.id });
      cats = await api('GET', '/api/product-categories');
      el.value = ''; drawCat(); toast('Kategorie gesetzt');
    } catch (e) { toast(e.message, true); }
  };
  // Die Behandler haengen nur an tatsaechlich vorhandenen Elementen: steht der
  // Schalter auf aus, gibt es die Anlegezeile gar nicht.
  const newcatEl = document.getElementById('newcat');
  if (newcatEl) {
    document.getElementById('newcat-b').onclick = addCat;
    newcatEl.addEventListener('keydown', e => { if (e.key === 'Enter') addCat(); });
  }

  /* ---- Tags ---- */
  function drawTags() {
    const box = document.getElementById('chips');
    box.innerHTML = item.tags.length ? '' : `<span class="hint">Noch keine Tags.</span>`;
    item.tags.forEach(t => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.innerHTML = `${esc(t.name)} <button title="Entfernen">✕</button>`;
      c.querySelector('button').onclick = async () => {
        try { item = await api('DELETE', `/api/items/${id}/tags/${t.id}`); drawTags(); }
        catch (e) { toast(e.message, true); }
      };
      box.appendChild(c);
    });
    document.getElementById('tagsug').innerHTML = allTags.map(t => `<option value="${esc(t.name)}">`).join('');
    drawWolke();
    ruesteBloeckeAus(item);
  }

  // Wolke aller vorhandenen Tags. Klick vergibt oder nimmt zurueck -- das ✕ an
  // der Marke oben bleibt daneben bestehen: zwei Wege fuer zwei Absichten,
  // Fehlgriff korrigieren gegen gezieltes Aufraeumen.
  function drawWolke() {
    const box = document.getElementById('tagcloud');
    const mehr = document.getElementById('tagcloud-more');
    if (!box) return;
    const vergeben = new Set(item.tags.map(t => t.id));
    const liste = sortiereWolke(allTags, vergeben);
    box.innerHTML = '';
    if (!liste.length) { box.innerHTML = `<span class="hint">Noch keine Tags angelegt.</span>`; mehr.hidden = true; return; }
    liste.forEach(t => {
      const b = document.createElement('button');
      b.className = 'pill pill-tag' + (vergeben.has(t.id) ? ' on' : '');
      b.innerHTML = `${esc(t.name)}<span class="n">${t.usage_count}</span>`;
      b.title = vergeben.has(t.id) ? 'Tag wieder entfernen' : 'Tag vergeben';
      b.onclick = async () => {
        try {
          item = vergeben.has(t.id)
            ? await api('DELETE', `/api/items/${id}/tags/${t.id}`)
            : await api('POST', `/api/items/${id}/tags`, { name: t.name });
          await loadTagList();
        } catch (e) { toast(e.message, true); }
      };
      box.appendChild(b);
    });
    const beschnitten = begrenzeWolke(box, wolkeOffen.detail ? 0 : 3);
    mehr.hidden = !beschnitten && !wolkeOffen.detail;
    mehr.textContent = wolkeOffen.detail ? 'weniger' : 'mehr';
    mehr.onclick = () => { wolkeOffen.detail = !wolkeOffen.detail; drawWolke(); };
  }

  async function loadTagList() {
    allTags = await api('GET', '/api/tags');
    drawTags(); drawTestDays();
  }

  const addTag = async () => {
    const el = document.getElementById('newtag');
    const name = el.value.trim();
    if (!name) return;
    try {
      item = await api('POST', `/api/items/${id}/tags`, { name });
      el.value = '';
      await loadTagList();
    } catch (e) { toast(e.message, true); }
  };
  const newtagEl = document.getElementById('newtag');
  if (newtagEl) {
    document.getElementById('newtag-b').onclick = addTag;
    newtagEl.addEventListener('keydown', e => { if (e.key === 'Enter') addTag(); });
  }

  /* ---- Bewertung ---- */
  function drawRatings() {
    const box = document.getElementById('ratings');
    // Angelegt wird im Systembereich: ein neues Kriterium erscheint an
    // JEDEM Eintrag, das ist eine redaktionelle Entscheidung und keine
    // Notiz am Eintrag.
    box.innerHTML = item.ratings.length ? ''
      : `<span class="hint">Noch keine Kriterien. Angelegt werden sie im Systembereich.</span>`;
    // Die Kopfzahl neben der Beschriftung: erst je Kriterium ueber alle, dann
    // ueber die Kriterien -- also genau das Mittel der Zahlen, die rechts in
    // den Zeilen stehen. Damit ist sie nachvollziehbar, sobald beide zugleich
    // sichtbar sind.
    const kopf = document.getElementById('rhead');
    /* DAS WORT "gewichtet" IST ABGELEITET, kein Schalter und keine Einstellung
       -- dieselbe Bauform wie die Durchschnittsspalte, die bei einem einzigen
       Zugang entfaellt. Sind alle Gewichte 1, steht dort genau das, was vor
       dieser Version dort stand.
       ABGELEITET AUS DEN BEWERTETEN KRITERIEN, nicht aus allen: ein Kriterium
       mit Gewicht 1,5, das an diesem Eintrag niemand bewertet hat, geht in die
       Rechnung gar nicht ein. Das Wort stuende dann an einer Zahl, an der
       keine Gewichtung stattgefunden hat. */
    const gewichtetGerechnet = item.ratings
      .some(r => (r.value > 0 || r.avg != null) && Number(r.gewicht) !== 1);
    if (kopf) kopf.textContent = item.avgRating
      ? '⌀ ' + item.avgRating.toFixed(1).replace('.', ',') + (gewichtetGerechnet ? ' gewichtet' : '') : '';
    item.ratings.forEach(r => {
      const row = document.createElement('div');
      row.className = 'rrow';
      const n = document.createElement('span');
      n.className = 'rname'; n.textContent = r.name;
      // Die Marke ×1,5 hinter dem Namen. Ohne sie saehe die Kopfzahl falsch
      // aus -- mit Gewichten ist sie aus den Zeilenwerten nicht mehr durch
      // Mitteln nachzuvollziehen. Eigener Knoten statt Text im Namen: der Name
      // ist Eingabe und wird gesetzt, nicht zusammengebaut.
      const marke = gewichtMarke(r.gewicht);
      if (marke) {
        const m = document.createElement('span');
        m.className = 'rgew'; m.textContent = marke;
        m.title = 'Gewicht im Gesamtschnitt';
        n.append(' ', m);
      }
      const acts = document.createElement('div');
      acts.className = 'racts';
      const set = v => enqueue(async () => {
        try { item = await api('PUT', `/api/items/${id}/ratings`, { criterionId: r.criterion_id, value: v }); drawRatings(); }
        catch (err) { toast(err.message, true); }
      });
      const s = stars(r.value, set, () => { set(0); toast(`Meine Bewertung für „${r.name}" zurückgesetzt`); });
      // Kein Loeschkreuz in dieser Zeile. Ein Kriterium zu
      // loeschen wirkt auf ALLE Eintraege und nimmt vergebene Sterne mit -- eine
      // globale Folge, die hier eine Zeigerbreite neben dem Sterne-Widget lag,
      // im Blick auf einen einzelnen Eintrag. Geloescht wird im Systembereich,
      // wo der Verwendungszaehler danebensteht. Dieselbe Begruendung wie beim
      // Sortieren, das aus demselben Grund schon dort liegt.
      acts.append(s);
      // Rechts der Schnitt ueber alle und die Zahl der Bewerter,
      // gedaempft. Die Sterne links bleiben die EIGENE Bewertung -- ein
      // Bedienelement zeigt den Zustand, den es veraendert; zeigten sie den
      // Schnitt, spraenge die Anzeige nach einem Klick auf den vierten Stern
      // auf 3,6, und der Klick wirkte verschluckt.
      // Die Zahl der Bewerter steht bewusst dabei: 4,8 aus einer Stimme heisst
      // etwas anderes als 4,8 aus zwanzig.
      // Bei genau einem Zugang entfaellt die Spalte ganz. Hat niemand bewertet,
      // bleibt sie leer -- neben fuenf leeren Sternen waere "keine Bewertung"
      // dieselbe Aussage zweimal.
      if (mehrereBenutzer()) {
        const a = document.createElement('span');
        a.className = 'ravg';
        a.textContent = r.avg ? `${r.avg.toFixed(1).replace('.', ',')} · ${r.count}` : '';
        acts.append(a);
      }
      row.append(n, acts);
      box.appendChild(row);
      /* HIER STEHT AUSDRÜCKLICH KEINE STIMMENLISTE. Wer welchen Wert vergeben
         hat, ist eine Angabe über einzelne Personen; die Zeile zeigt den
         eigenen Wert und den Schnitt, mehr soll eine Bewertung nicht aussagen.
         Die Liste ruft der Admin über den Knopf im Blockkopf auf. */
    });
    ruesteBloeckeAus(item);
  }
  // Der Ruecksetzer meint ausschliesslich die EIGENEN Werte -- das tut er
  // serverseitig ohnehin, die Beschriftung sagt es dazu.
  // "Alle zurücksetzen" liest sich im Mehrbenutzerbetrieb wie "alle loeschen".
  // Der Wortlaut bleibt bei einem wie bei zehn Zugaengen derselbe: eine
  // Beschriftung, die mit der Zahl der Zugaenge umspringt, waere eine zweite
  // Wahrheit ueber denselben Knopf.
  /* ---- Wer hat bewertet: die Ansicht des Admins ----
     Wer welchen Wert vergeben hat, steht nicht unter der Sternzeile: die
     Angabe geht sonst an jeden. Sie ist eine eigene Ansicht, die der Admin
     ausdrücklich aufruft — und zugleich der LÖSCHWEG für eine fremde
     Bewertung. Ohne diese Ansicht wäre DELETE /api/ratings/:id vom Bildschirm
     aus unerreichbar.
     Der Knopf steht nur beim Admin und erst ab zwei Zugängen: bei einem wäre
     die Liste der eigene Wert ein zweites Mal. Der Server verweigert den Abruf
     ohnehin; ein Knopf, der zuverlässig eine Fehlermeldung erzeugt, sieht aus
     wie ein Fehler. */
  async function zeigeStimmen() {
    let liste;
    try { liste = await api('GET', `/api/items/${id}/stimmen`); }
    catch (e) { return toast(e.message, true); }
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal" id="stimmen-modal"><h2>Wer hat bewertet</h2>
      <p>Diese Liste sieht nur der Admin. Eine fremde Bewertung lässt sich hier
         entfernen — die Note ändert niemand.</p>
      <div class="stimmliste" id="stimmliste"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Schließen</button></div></div>`;
    document.body.appendChild(bd);
    const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
    // NUR DER OBERSTE DIALOG SCHLIESST. Das ✕ hier drin fragt über confirmBox
    // nach, und dann liegen zwei Dialoge übereinander -- ohne diese Frage
    // nähme eine Taste beide zugleich weg.
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
    zeichneStimmen();

    function zeichneStimmen() {
      const box = bd.querySelector('#stimmliste');
      box.innerHTML = '';
      const je = new Map(liste.map(z => [z.criterion_id, z.stimmen]));
      // Reihenfolge und Name kommen aus dem Eintrag: der Endpunkt liefert nur
      // Nummern, Werte und Verfasser. Zwei Quellen für denselben Namen wären
      // zwei Wahrheiten.
      let etwas = false;
      item.ratings.forEach(r => {
        const stimmen = je.get(r.criterion_id) || [];
        // Ein Kriterium ohne Stimme bekommt gar keine Zeile -- eine leere
        // Liste unter einem Namen sagt nichts.
        if (!stimmen.length) return;
        etwas = true;
        const zeile = document.createElement('div');
        zeile.className = 'stimmzeile';
        const n = document.createElement('span');
        n.className = 'rname'; n.textContent = r.name;
        const wer = document.createElement('div');
        wer.className = 'rstimmen';
        stimmen.forEach(st => {
          const s2 = document.createElement('span');
          s2.className = 'rstimme' + (st.mine ? ' meine' : '');
          s2.appendChild(document.createTextNode(`${verfasserName(st.verfasser)} ${st.wert}`));
          /* Das ✕ steht nur am FREMDEN Wert — den eigenen räumt man mit dem
             Doppelklick auf den Stern weg, und zwei Wege für dieselbe Absicht
             wären einer zu viel. Die Note ändert der Admin nicht: es gibt hier
             kein Sterne-Widget an einer fremden Stimme, nur den Weg, sie zu
             entfernen. */
          if (!st.mine) {
            const x = document.createElement('button');
            x.className = 'xdel';
            x.textContent = '✕';
            x.title = 'Diese Bewertung entfernen';
            x.onclick = async () => {
              if (!await confirmBox('Fremde Bewertung entfernen?',
                `Die Bewertung von ${verfasserName(st.verfasser)} für „${r.name}" wird entfernt. ` +
                `Die Note lässt sich nicht ändern, nur löschen.`, 'Entfernen')) return;
              try {
                item = await api('DELETE', `/api/ratings/${st.id}`);
                liste = await api('GET', `/api/items/${id}/stimmen`);
                drawRatings(); zeichneStimmen(); toast('Bewertung entfernt');
              } catch (e) { toast(e.message, true); }
            };
            s2.appendChild(x);
          }
          wer.appendChild(s2);
        });
        zeile.append(n, wer);
        box.appendChild(zeile);
      });
      if (!etwas) box.innerHTML = `<span class="hint">Noch hat niemand bewertet.</span>`;
    }
  }
  // Der Knopf steht nur beim Admin ab zwei Zugängen; ohne ihn gibt es hier
  // nichts anzuhängen.
  const rwhoEl = document.getElementById('rwho');
  if (rwhoEl) rwhoEl.onclick = zeigeStimmen;

  document.getElementById('reset-r').onclick = async () => {
    if (!await confirmBox('Meine Bewertung zurücksetzen?',
      'Meine Sterne werden hier geleert. Fremde Bewertungen und die Kriterien selbst bleiben bestehen.',
      'Zurücksetzen')) return;
    try { item = await api('DELETE', `/api/items/${id}/ratings`); drawRatings(); toast('Meine Bewertung zurückgesetzt'); }
    catch (e) { toast(e.message, true); }
  };

  /* ---- Testtage ---- */
  function drawTestDays() {
    const box = document.getElementById('testblock');
    if (!item.tested) {
      box.innerHTML = `<div class="block-head"><span class="label">${esc(V.zeitpunktMehrzahl)}</span></div>
        <div class="test-locked">Oben „${esc(V.merkmalJa)}" einschalten, um ${esc(V.zeitpunktMehrzahl)} einzutragen.</div>`;
      return;
    }
    const n = item.testDays.length;
    box.innerHTML = `<div class="block-head"><span class="label">${esc(V.zeitpunktMehrzahl)}</span>
        <span class="hint">${n ? `${n} ${esc(vZeit(n))} · ⌀ ${item.testAvg.toFixed(1).replace('.', ',')} · zuletzt ${item.testLast}` : ''}</span></div>
      ${sparkline(item.testDays)}
      <div class="test-scroll" id="tdays"></div>
      <div class="test-add">
        <input type="date" id="tdate" max="${today()}" value="${today()}">
        <span class="hint">Note:</span><span id="tstars"></span>
        <button class="btn btn-sm" id="tadd">+ ${esc(V.zeitpunktEinzahl)} eintragen</button>
      </div>`;

    const list = box.querySelector('#tdays');
    if (!n) list.innerHTML = `<span class="hint">Noch keine ${esc(V.zeitpunktMehrzahl)}. Jede Zeile ist ein Datum mit einer Gesamtnote.</span>`;
    item.testDays.forEach(d => {
      const row = document.createElement('div');
      row.className = 'trow';
      const date = document.createElement('span');
      date.className = 'tdate'; date.textContent = fmtDay(d.day);
      const wd = document.createElement('span');
      wd.className = 'tweek'; wd.textContent = weekday(d.day);
      // Keine Null bei Tagesnoten: ein Testtag hat eine Note oder wird geloescht.
      const s = stars(d.rating, v => enqueue(async () => {
        try { item = await api('PUT', `/api/test-days/${d.id}`, { rating: v }); drawTestDays(); }
        catch (e) { toast(e.message, true); }
      }));
      const x = document.createElement('button');
      x.className = 'xdel'; x.textContent = '✕'; x.title = `${V.zeitpunktEinzahl} löschen`;
      x.onclick = async () => {
        if (!await confirmBox(`${V.zeitpunktEinzahl} löschen?`, `Das Datum ${fmtDay(d.day)} wird entfernt.`)) return;
        try { item = await api('DELETE', `/api/test-days/${d.id}`); drawTestDays(); drawSwitches(); }
        catch (e) { toast(e.message, true); }
      };

      // Tags am Testtag: zwischen Datum und Sternen, derselbe Vorrat wie am
      // Eintrag. Der Filter der Uebersicht greift sie nicht auf, die Suche
      // findet sie trotzdem.
      const tagBox = document.createElement('span');
      tagBox.className = 'ttags';
      (d.tags || []).forEach(t => {
        const c = document.createElement('span');
        c.className = 'chip chip-xs';
        c.innerHTML = `${esc(t.name)}<button title="Tag entfernen">✕</button>`;
        c.querySelector('button').onclick = async () => {
          try { item = await api('DELETE', `/api/test-days/${d.id}/tags/${t.id}`); drawTestDays(); loadTagList(); }
          catch (e) { toast(e.message, true); }
        };
        tagBox.appendChild(c);
      });
      const plus = document.createElement('button');
      plus.className = 'ttag-add'; plus.textContent = '+'; plus.title = 'Tag hinzufügen';
      plus.onclick = () => {
        if (tagBox.querySelector('input')) return;
        const inp = document.createElement('input');
        inp.className = 'input input-sm ttag-in';
        inp.setAttribute('list', 'tagsug');
        inp.placeholder = 'Tag';
        const schliessen = () => inp.remove();
        inp.onkeydown = async (e) => {
          if (e.key === 'Escape') return schliessen();
          if (e.key !== 'Enter') return;
          const name = inp.value.trim();
          if (!name) return schliessen();
          try { item = await api('POST', `/api/test-days/${d.id}/tags`, { name }); drawTestDays(); loadTagList(); }
          catch (e2) { toast(e2.message, true); }
        };
        inp.onblur = () => setTimeout(schliessen, 120);
        tagBox.appendChild(inp);
        inp.focus();
      };
      tagBox.appendChild(plus);

      // Wer den Tag eingetragen hat -- ab zwei Zugängen. Die Zeitleiste
      // unterscheidet weiter über die Füllung; hier steht der Name.
      if (mehrereBenutzer()) {
        const von = document.createElement('span');
        von.className = 'tvon' + (d.mine ? ' meine' : '');
        von.textContent = verfasserName(d.verfasser);
        row.append(date, wd, von, tagBox, s, x);
      } else {
        row.append(date, wd, tagBox, s, x);
      }
      list.appendChild(row);
    });

    let newRating = 4;
    const starBox = box.querySelector('#tstars');
    const drawNewStars = () => {
      starBox.innerHTML = '';
      starBox.appendChild(stars(newRating, v => { newRating = v; drawNewStars(); }));
    };
    drawNewStars();

    box.querySelector('#tadd').onclick = async () => {
      const day = box.querySelector('#tdate').value;
      if (!day) return toast('Bitte ein Datum wählen', true);
      try {
        const res = await api('POST', `/api/items/${id}/test-days`, { day, rating: newRating });
        item = res;
        drawTestDays(); drawSwitches();
        toast(res.replaced ? `Note für den ${fmtDay(day)} ersetzt` : `${V.zeitpunktEinzahl} eingetragen`);
      } catch (e) { toast(e.message, true); }
    };
    ruesteBloeckeAus(item);
  }

  /* ---- Links ---- */
  function drawLinks() {
    const box = document.getElementById('links');
    document.getElementById('lcount').textContent = item.links.length ? `${item.links.length} gespeichert` : '';
    box.innerHTML = '';
    if (!item.links.length) {
      box.innerHTML = `<span class="hint">Noch keine Links. Adressen unten einfügen — ein Wort ohne Adresse wird zur Suche. Die Liste wird bei vielen Zeilen scrollbar.</span>`;
      return;
    }
    item.links.forEach((l, n) => {
      const suche = istSuche(l.url);
      const { dom, path } = splitUrl(l.url);
      // Suchzeile: der Rohtext oben, darunter die Anbieter -- die sind
      // einstellbar, also darf die Zeile nicht verschweigen, wen sie fragt.
      // Rechts steht die Lupe statt des Pfeils; das ist der Platz, an dem eine
      // Zeile in Kriterion ansagt, was ein Klick tut.
      const anbieter = suche ? suchListe() : [];
      const standard = anbieter[0] || null;
      const oben = suche ? l.url : dom;

      /* WANN DER NAME AN DER ZEILE STEHT -- die Regel steht hier und nirgends
         sonst. Zwei Bedingungen, und beide sagen dasselbe: gezeigt wird der
         Name nur, wo er eine Auskunft ist.
         Bei einem einzigen Zugang sagt "von mir" nichts -- dieselbe Schwelle
         wie ueberall, sie steht in mehrereBenutzer().
         Und an einer Zeile, die der Verfasser des Eintrags selbst eingetragen
         hat, wiederholte der Name nur, was oben am Eintrag ohnehin steht. Was
         uebrig bleibt, ist der Fall, um den es geht: jemand anderes hat etwas
         beigesteuert. "Kein Name" heisst bei mehreren Zugaengen also "vom
         Verfasser des Eintrags".
         Verglichen wird ueber die Nummer, nicht ueber den Namen: ein Grabstein
         hat keinen mehr. Fehlt der Verfasser auf beiden Seiten, ist niemand zu
         nennen; fehlt er nur an der Zeile, steht dort "Ohne Verfasser" -- eine
         herrenlose Zeile ist eine Auskunft. */
      const fremdeZeile = (l.verfasser?.id ?? null) !== (item.verfasser?.id ?? null);
      const zeigeVon = mehrereBenutzer() && fremdeZeile;
      // Das Datum steht im Ueberfahrtext, nicht in der Zeile: die Zeile ist auf
      // dem Handy am Anschlag, und der Name ist die Angabe, um die es geht.
      const eingetragen = zeigeVon
        ? `Eingetragen von ${verfasserName(l.verfasser)} am ${fmtDate(l.created_at)}` : '';

      /* DAS LOESCHKREUZ FOLGT DEM RECHT, NICHT DER ANZEIGE: der Server laesst
         den Eintrager und den Admin durch (darfAendern). Beides ist getrennt --
         an der eigenen Zeile steht ein Kreuz ohne Namen, an einer fremden ein
         Name ohne Kreuz, solange man nicht Admin ist.
         `mine` sagt der Server; die Oberflaeche rechnet das nicht aus dem
         Verfasserobjekt zurueck. */
      const darfWeg = l.mine === true || ADMIN;

      const row = document.createElement('div');
      row.className = 'lrow' + (suche ? ' suche' : '');
      row.dataset.lid = l.id;
      const grundText = suche
        ? (standard ? `Suche nach „${l.url}" bei ${standard.name}` : `Suche nach „${l.url}"`)
        : l.url;
      row.title = eingetragen ? `${grundText} · ${eingetragen}` : grundText;
      /* Die zweite Zeile traegt den Pfad (bei einer Suchzeile die
         Anbieternamen) und dahinter den Namen. Beides in EINER Zeile, damit die
         Linkzeile nicht auf drei Hoehen waechst; abgeschnitten wird der Pfad,
         nie der Name.
         DER NAME STEHT IN KLAMMERN UND OHNE TRENNZEICHEN. Ein Trennzeichen
         waere hier an beiden Zeilenarten falsch: in der Suchzeile bedeutet
         " · " bereits "noch ein Anbieter, anklickbar", und ein Strich davor
         sieht aus wie ein abgerissener Satz. Die Klammer sagt von selbst, dass
         hier eine Angabe ueber die Zeile steht und kein weiterer Teil von ihr.
         Sie traegt ausserdem jede Form, die verfasserName() liefert --
         "(chefin)", "(Geloeschter Benutzer 4)", "(Ohne Verfasser)". Ein
         Vorwort wie "von" taete das nicht: "von Ohne Verfasser" ist kein
         Deutsch. */
      const untenLinks = suche ? '<span class="snamen"></span>'
                               : (path ? `<span class="path">${esc(path)}</span>` : '');
      const unten = untenLinks + (zeigeVon
        ? `<span class="lvon">(${esc(verfasserName(l.verfasser))})</span>` : '');
      row.innerHTML = `<span class="grip" title="Zum Sortieren ziehen">⣿</span>
        <span class="lnum">${n + 1}</span>
        <span class="lurl"><span class="dom">${esc(oben)}</span>${
          unten ? `<span class="lunten">${unten}</span>` : ''
        }</span>
        <span class="go">${suche ? ICON_SEARCH : '↗'}</span>
        ${darfWeg ? `<button class="xdel" title="${suche ? 'Sucheintrag entfernen' : 'Link entfernen'}">✕</button>` : ''}`;
      // Die Namen sind Eingabe des Admins und werden als Beschriftung
      // gerendert -- die erste Stelle in der Linkliste, an der das gilt.
      // Deshalb echte Knoten mit textContent statt innerHTML: Maskierung ist
      // damit nicht vergessbar, sondern baulich unmoeglich (wie .cmt-body).
      // Jeder Name ist ausserdem sein eigenes Klickziel und braucht ohnehin
      // einen eigenen Knoten.
      if (suche) {
        const namensBox = row.querySelector('.snamen');
        anbieter.forEach((a, i) => {
          if (i) namensBox.appendChild(document.createTextNode(' · '));
          const s = document.createElement('span');
          s.className = 'sname';
          s.textContent = a.name;
          s.title = `Suche nach „${l.url}" bei ${a.name}`;
          // Ein Klick auf einen Namen sucht bei genau diesem Anbieter. Die
          // Zeile selbst darf dabei nicht mitgehen und nicht ins Ziehen
          // kippen -- .sname steht deshalb im ignore von makeSortable.
          s.onclick = (e) => {
            e.stopPropagation();
            window.open(sucheAdresse(a.vorlage, l.url), '_blank', 'noopener,noreferrer');
          };
          namensBox.appendChild(s);
        });
      }
      // Der Behandler nur dort, wo das Kreuz auch steht -- an einem fehlenden
      // Element risse er den Aufbau der ganzen Liste mit.
      if (darfWeg) row.querySelector('.xdel').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox(suche ? 'Sucheintrag entfernen?' : 'Link entfernen?',
          `${suche ? `„${l.url}"` : dom} wird aus der Liste gelöscht.`, 'Entfernen')) return;
        try { await api('DELETE', `/api/links/${l.id}`); item = await api('GET', `/api/items/${id}`); drawLinks(); }
        catch (err) { toast(err.message, true); }
      };
      // Ganze Zeile oeffnet den Link; Ziehen sortiert um. Unterschieden wird
      // ueber dieselbe Bewegungsschwelle wie bei den Vorschaubildern.
      makeSortable(row, {
        axis: 'y', selector: '.lrow', ignore: '.xdel, .sname',
        onClick: () => {
          if (!suche) return window.open(l.url, '_blank', 'noopener,noreferrer');
          // Ohne gueltigen Standard wird nicht ersatzweise woanders gesucht --
          // die Zeile sagt dann, dass nichts eingestellt ist.
          if (!standard) return toast('Kein gültiger Suchanbieter eingestellt', true);
          window.open(sucheAdresse(standard.vorlage, l.url), '_blank', 'noopener,noreferrer');
        },
        onDrop: async (children) => {
          try {
            item = await api('PUT', `/api/items/${id}/link-order`, { order: children.map(c => +c.dataset.lid) });
            drawLinks(); toast('Reihenfolge gespeichert');
          } catch (err) { toast(err.message, true); }
        }
      });
      box.appendChild(row);
    });
    begrenzeLinks();
    ruesteBloeckeAus(item);
  }

  // Sichtbare Zeilen begrenzen, statt die Liste immer scrollen zu lassen.
  // Die Zeilenhoehe wird an der ersten Zeile gemessen -- sie haengt an der
  // eingestellten Schriftgroesse und laesst sich nicht raten.
  // ABGESCHNITTEN, NICHT SCROLLBAR. Ein eigener Bildlauf faengt auf dem Finger
  // die Wischbewegung ab: wer die Seite herunterzieht und dabei ueber die
  // Liste kommt, scrollt ploetzlich nur noch die Liste. Der Knopf "alle N
  // anzeigen" ist der Weg zum Rest -- damit scrollt am Finger immer die Seite,
  // und die Einstellung "sichtbare Zeilen" behaelt ihren Sinn.
  function begrenzeLinks() {
    const box = document.getElementById('links');
    const knopf = document.getElementById('links-more');
    if (!box || !knopf) return;
    const zeilen = [...box.children];
    const zuViele = zeilen.length > LINKZEILEN;
    if (!zuViele || linksOffen) {
      box.style.maxHeight = '';
      box.style.overflowY = '';
      knopf.hidden = !zuViele;
      knopf.textContent = 'weniger anzeigen';
      knopf.onclick = () => { linksOffen = false; drawLinks(); };
      return;
    }
    const h = zeilen[0]?.offsetHeight || 0;
    const abstand = 5;   // entspricht dem margin-bottom von .lrow
    box.style.maxHeight = (LINKZEILEN * h + (LINKZEILEN - 1) * abstand) + 'px';
    box.style.overflowY = 'hidden';
    knopf.hidden = false;
    knopf.textContent = `alle ${zeilen.length} anzeigen`;
    knopf.onclick = () => { linksOffen = true; drawLinks(); };
  }

  const addLink = async () => {
    const el = document.getElementById('newlink');
    const url = el.value.trim();
    if (!url) return;
    try {
      item = await api('POST', `/api/items/${id}/links`, { url });
      el.value = ''; drawLinks();
      document.getElementById('links').scrollTop = 1e6;
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('newlink-b').onclick = addLink;
  document.getElementById('newlink').addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

  /* ---- Dateien ---- */
  // Welche Vorschau möglich ist, entscheidet der Server (Feld `preview`) --
  // die Oberfläche rät nicht anhand des Dateinamens herum.
  const offeneVorschau = new Set();

  function groesse(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function drawAtts() {
    const box = document.getElementById('atts');
    const liste = item.attachments || [];
    document.getElementById('acount').textContent =
      liste.length ? `${liste.length} · ${groesse(liste.reduce((s2, a) => s2 + a.size, 0))}` : '';
    box.innerHTML = '';
    if (!liste.length) {
      box.innerHTML = `<span class="hint">Noch keine Dateien. Bilder, PDF und Textdateien lassen sich hier ansehen, alles andere wird heruntergeladen.</span>`;
      return;
    }
    liste.forEach(a => {
      const zeile = document.createElement('div');
      zeile.className = 'arow';
      const kannVorschau = a.preview !== 'keine';
      const offen = offeneVorschau.has(a.id);
      zeile.classList.toggle('offen', offen);
      zeile.title = kannVorschau
        ? (offen ? 'Klicken zum Zuklappen' : 'Klicken zum Ansehen')
        : 'Klicken zum Herunterladen';
      /* DIESELBE REGEL WIE AN DER LINKZEILE, und sie steht dort ausfuehrlich:
         der Name nur bei mehreren Zugaengen und nur an einer Zeile, die NICHT
         vom Verfasser des Eintrags stammt. In Klammern, ohne Trennzeichen.
         Er steht hinter der Groesse, nicht hinter dem Dateinamen: rechts stehen
         die Angaben ZUR Datei, links ist ihr Name -- und der darf nicht
         abgeschnitten werden, um Platz fuer eine Nebenangabe zu machen. */
      const fremdeDatei = (a.verfasser?.id ?? null) !== (item.verfasser?.id ?? null);
      const zeigeVon = mehrereBenutzer() && fremdeDatei;
      const hochgeladen = zeigeVon
        ? `Hochgeladen von ${verfasserName(a.verfasser)} am ${fmtDate(a.created_at)}` : '';
      if (hochgeladen) zeile.title = `${zeile.title} · ${hochgeladen}`;
      // Das ✕ folgt dem Recht, nicht der Anzeige -- wie am Link.
      const darfWeg = a.mine === true || ADMIN;

      zeile.innerHTML = `<span class="aicon">${a.preview === 'bild' ? '▣' : a.preview === 'pdf' ? '▤' : a.preview === 'keine' ? '▪' : '▥'}</span>
        <span class="aname">${esc(a.filename)}</span>
        <span class="asize">${groesse(a.size)}</span>
        ${zeigeVon ? `<span class="avon">(${esc(verfasserName(a.verfasser))})</span>` : ''}
        <span class="ago">${kannVorschau ? (offen ? '▾' : '▸') : '↓'}</span>
        <a class="adl" href="/api/attachments/${a.id}/raw" download title="Herunterladen">↓</a>
        ${darfWeg ? `<button class="xdel" title="Datei entfernen">✕</button>` : ''}`;

      // Der Behandler nur dort, wo das Kreuz auch steht.
      if (darfWeg) zeile.querySelector('.xdel').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox('Datei entfernen?', `„${a.filename}" wird unwiderruflich gelöscht.`)) return;
        try { item = await api('DELETE', `/api/attachments/${a.id}`); offeneVorschau.delete(a.id); drawAtts(); }
        catch (e2) { toast(e2.message, true); }
      };

      // Ganze Zeile reagiert, wie bei den Links: was passiert, entscheidet der
      // Dateityp. Was der Server ansehen kann, wird auf- und zugeklappt; alles
      // andere wird heruntergeladen. Das ✕ und der Ladepfeil sind ausgenommen,
      // sonst löste ein Klick darauf beides zugleich aus.
      zeile.onclick = (e) => {
        if (e.target.closest('.xdel, .adl')) return;
        if (!kannVorschau) return zeile.querySelector('.adl')?.click();
        if (offen) offeneVorschau.delete(a.id); else offeneVorschau.add(a.id);
        drawAtts();
      };
      box.appendChild(zeile);

      if (kannVorschau && offen) box.appendChild(baueVorschau(a));
    });
    ruesteBloeckeAus(item);
  }

  function baueVorschau(a) {
    const kasten = document.createElement('div');
    kasten.className = 'apreview';
    if (a.preview === 'bild') {
      // Bilder in einem img-Element: dort wird nichts ausgeführt, und der
      // Server schickt sie mit nosniff und enger Sicherheitsregel.
      kasten.innerHTML = `<img src="/api/attachments/${a.id}/raw?inline=1" alt="${esc(a.filename)}">`;
    } else if (a.preview === 'pdf') {
      // allow-scripts, aber ausdrücklich OHNE allow-same-origin: die
      // eingebauten PDF-Betrachter von Chrome und Edge bestehen selbst aus
      // HTML und JavaScript und bleiben ohne diese Erlaubnis leer. Ohne
      // allow-same-origin liegt das Dokument in einem eigenen, fremden
      // Ursprung und sieht von der Anwendung nichts.
      // Daneben immer der Weg in einen neuen Tab: sollte ein Browser das
      // Einbetten trotzdem verweigern, ist das dann kein Sackgassen-Ergebnis.
      kasten.innerHTML = `<iframe src="/api/attachments/${a.id}/raw?inline=1"
          sandbox="allow-scripts" referrerpolicy="no-referrer" title="${esc(a.filename)}"></iframe>
        <p class="apdf-hint"><span class="hint">Bleibt das Fenster leer, zeigt der Browser PDF nicht eingebettet an.</span>
          <a class="abtn" href="/api/attachments/${a.id}/raw?inline=1" target="_blank" rel="noopener noreferrer">In neuem Tab öffnen</a></p>`;
    } else {
      kasten.innerHTML = `<p class="hint">lädt …</p>`;
      api('GET', `/api/attachments/${a.id}/preview`).then(v => {
        // Als Text in den DOM gesetzt, nie als Datei ausgeliefert: der
        // Browser interpretiert den Inhalt damit überhaupt nicht.
        kasten.innerHTML = '';
        const pre = document.createElement('pre');
        pre.className = 'atext';
        pre.textContent = v.text || '(leer)';
        kasten.appendChild(pre);
        if (v.gekuerzt) {
          const h = document.createElement('p');
          h.className = 'hint';
          h.textContent = 'Vorschau gekürzt — die vollständige Datei über „laden".';
          kasten.appendChild(h);
        }
      }).catch(e => { kasten.innerHTML = `<p class="hint">${esc(e.message)}</p>`; });
    }
    return kasten;
  }

  document.getElementById('aadd').onclick = () => document.getElementById('afile').click();
  document.getElementById('afile').onchange = async (e) => {
    const dateien = [...e.target.files];
    e.target.value = '';
    if (!dateien.length) return;
    const zuGross = dateien.find(f => f.size > 50 * 1024 * 1024);
    if (zuGross) return toast(`„${zuGross.name}" ist größer als 50 MB.`, true);
    const fd = new FormData();
    dateien.forEach(f => fd.append('files', f));
    try {
      toast('Wird hochgeladen …');
      const r = await fetch(`/api/items/${id}/attachments`, { method: 'POST', body: fd, credentials: 'same-origin' });
      const daten = await r.json();
      if (!r.ok) throw new Error(daten.error || 'Fehlgeschlagen');
      item = daten; drawAtts();
      toast(dateien.length === 1 ? 'Datei angehängt' : `${dateien.length} Dateien angehängt`);
    } catch (e2) { toast(e2.message, true); }
  };

  /* ---- Kommentare ---- */
  function drawComments() {
    const box = document.getElementById('cmts');
    // Der Hinweis steht in der Kopfzeile und bleibt damit auch eingeklappt
    // sichtbar -- eingeklappt ist gerade der Moment, in dem man nicht
    // hineinsieht. Gebildet wird er an einem Ort, oben bei kommentarZahlen().
    document.getElementById('ccount').textContent = kommentarZahlen(item.comments);
    box.innerHTML = item.comments.length ? '' : `<span class="hint">Noch keine Kommentare.</span>`;
    item.comments.forEach(c => {
      const bericht = c.kind === 'report', aufgabe = c.kind === 'task',
            erledigt = c.kind === 'done';
      const el = document.createElement('div');
      el.className = 'cmt'
        + (bericht ? ' bericht' : aufgabe ? ' aufgabe' : erledigt ? ' erledigt' : '')
        + (c.pinned ? ' pinned' : '');

      /* FUENF FAELLE, DREI ANTWORTEN -- die Spalten der Rechtetabelle:
         Verfasser, anderer, Admin.
           ✎ Text bearbeiten        nur der Verfasser, auch der Admin nicht
           + Bild anhaengen         desgleichen -- Anhaengen IST Bearbeiten;
                                    wer etwas beizutragen hat, schreibt einen
                                    eigenen Kommentar. Der Knopf steht im
                                    Bearbeitenmodus und faellt mit ✎ baulich
                                    weg; eine zweite Klemme daneben liesse
                                    sich nicht gegenpruefen.
           ✕ Kommentar loeschen     Verfasser oder Admin
           ✕ Bild loeschen          Verfasser oder Admin
           Art und Anpinnung        Verfasser oder Admin
         Der Server sagt mit `mine`, wem die Zeile gehoert -- die Oberflaeche
         rechnet das nicht aus dem Verfasserobjekt zurueck. Bei einem
         Grabstein ginge das gar nicht, der hat keinen Namen mehr. */
      const meins = c.mine === true;
      const verwalten = meins || ADMIN;

      /* DER EINGRIFFSVERMERK NENNT DIE ROLLE, NICHT DIE PERSON -- und dafuer
         braucht es kein Feld in der Antwort. DELETE /api/comment-images/:id
         steht hinter darfAendern (Verfasser ODER Admin), und hochgezaehlt wird
         nur, wenn ein ANDERER als der Verfasser entfernt. Wer beide Klemmen
         passiert, kann also nur der Admin sein; eine herrenlose Zeile laesst
         ohnehin nur ihn durch. Kein Name, kein Zeitpunkt, keine Kette: eine
         Rolle ist keine Person.
         Der Satz ist nur so lange wahr, wie die Klemme dort steht -- eine
         Pruefung am Quelltext bindet die Beschriftung an sie.

         Markierungen links, Bearbeiten und Loeschen rechts. Die Reihenfolge in
         der Liste macht der Server; hier wird nur umgeschaltet. */
      el.innerHTML = `<div class="cmt-head">
          ${verwalten ? `<span class="marks">
            <button class="mark pin${c.pinned ? ' on' : ''}" title="Anpinnen — steht dann ganz oben">📌</button>
            <button class="mark art${bericht ? ' on' : ''}" title="Als ${esc(V.berichtEinzahl)} markieren">${esc(V.berichtEinzahl)}</button>
            <button class="mark aufg${aufgabe ? ' on' : ''}${erledigt ? ' on fertig' : ''}" title="${
              erledigt ? 'Zustand zurücksetzen'
                       : aufgabe ? `Auf „${esc(V.aufgabeErledigt)}" setzen`
                                 : `Als ${esc(V.aufgabeEinzahl)} markieren`
            }">${esc(erledigt ? V.aufgabeErledigt : V.aufgabeEinzahl)}</button>
          </span>` : ''}
          <span class="cmt-when">${mehrereBenutzer()
            ? `<span class="cmt-von">${esc(verfasserName(c.verfasser))}</span> · ` : ''
          }${fmtDate(c.created_at)}${c.updated_at ? ' · bearbeitet' : ''}${
            c.bilderEntfernt ? ` · <span class="cmt-eingriff">${c.bilderEntfernt} ${
              c.bilderEntfernt === 1 ? 'Bild' : 'Bilder'} vom Admin entfernt</span>` : ''}</span>
          <span class="acts">${meins ? `<button class="mact ed" title="Bearbeiten">✎</button>` : ''
            }${verwalten ? `<button class="mact rm" title="Löschen">✕</button>` : ''}</span>
        </div>
        <div class="cmt-body"></div>
        <div class="cmt-imgs"></div>`;

      // Der Text kommt nicht aus der Vorlage, sondern als echte Knoten -- so
      // kann hier gar kein Markup entstehen. Der Bearbeitenmodus weiter unten
      // zeigt weiterhin den Rohtext im Textfeld.
      el.querySelector('.cmt-body')
        .appendChild(baueKommentarknoten(zerlegeKommentartext(c.text)));

      const umschalten = async (feld, wert) => {
        try { item = await api('PUT', `/api/comments/${c.id}`, { [feld]: wert }); drawComments(); }
        catch (e) { toast(e.message, true); }
      };
      // Die Knoepfe stehen nur da, wo sie auch gedrueckt werden duerfen --
      // ein Behandler an einem fehlenden Element risse den Aufbau mit.
      if (verwalten) {
        el.querySelector('.pin').onclick = () => umschalten('pinned', !c.pinned);
        // Die Art ist ein Wert, keine zwei Merkmale: wer Aufgabe drueckt, waehrend
        // Bericht an ist, waehlt Aufgabe -- ein zweiter Druck auf denselben Knopf
        // nimmt sie wieder zurueck auf Notiz.
        el.querySelector('.art').onclick = () => umschalten('kind', bericht ? 'note' : 'report');
        el.querySelector('.aufg').onclick = () => umschalten('kind', aufgabeWeiter(c.kind));
      }

      // Bilder als Kacheln unter dem Text; Klick öffnet das vorhandene Vollbild.
      // Das ✕ nur bei Verfasser oder Admin -- ansehen darf jeder.
      const imgBox = el.querySelector('.cmt-imgs');
      (c.images || []).forEach((b, i) => {
        const k = document.createElement('div');
        k.className = 'cmt-img';
        k.innerHTML = `<img src="/api/comment-images/${b.id}/raw?size=thumb" alt="" loading="lazy">
          ${verwalten ? `<button class="del" title="Bild entfernen">✕</button>` : ''}`;
        k.querySelector('img').onclick = () =>
          openLightbox((c.images || []).map(x => ({ id: x.id, quelle: 'kommentar' })), i, item.title);
        if (verwalten) k.querySelector('.del').onclick = async (e) => {
          e.stopPropagation();
          if (!await confirmBox('Bild entfernen?', 'Dieses Bild wird unwiderruflich gelöscht.')) return;
          try { item = await api('DELETE', `/api/comment-images/${b.id}`); drawComments(); }
          catch (err) { toast(err.message, true); }
        };
        imgBox.appendChild(k);
      });

      if (verwalten) el.querySelector('.rm').onclick = async () => {
        if (!await confirmBox('Kommentar löschen?',
          `Dieser Kommentar wird unwiderruflich entfernt.${(c.images || []).length ? ' Die angehängten Bilder gehen mit.' : ''}`)) return;
        try { await api('DELETE', `/api/comments/${c.id}`); item = await api('GET', `/api/items/${id}`); drawComments(); }
        catch (e) { toast(e.message, true); }
      };

      // Der Bearbeitenmodus haengt am ✎, und das gibt es nur beim Verfasser.
      // Damit faellt auch "+ Bild" weg -- es steht ausschliesslich hier drin.
      if (meins) el.querySelector('.ed').onclick = () => {
        const wrap = document.createElement('div');
        wrap.className = 'cmt-edit';
        wrap.innerHTML = `<textarea class="ta"></textarea>
          <div class="acts"><button class="btn btn-ghost btn-sm addimg">+ Bild</button>
          <button class="btn btn-ghost btn-sm cancel">Abbrechen</button>
          <button class="btn btn-accent btn-sm save">Speichern</button></div>`;
        const ta = wrap.querySelector('textarea');
        ta.value = c.text;
        el.querySelector('.cmt-body').replaceWith(wrap);
        el.querySelector('.acts').style.visibility = 'hidden';
        autoGrow(ta);   // erst nach dem Einhaengen, vorher ist scrollHeight null
        ta.focus();

        // Beim Bearbeiten hat der Kommentar schon eine Id -- Bilder gehen
        // deshalb sofort an den Server, ohne auf das Speichern zu warten.
        const nachreichen = async (dateien) => {
          if (!dateien.length) return;
          const fd = new FormData();
          dateien.forEach(f => fd.append('images', f));
          try {
            item = await sendeFormular(`/api/comments/${c.id}/images`, fd);
            toast(dateien.length === 1 ? 'Bild angehängt' : `${dateien.length} Bilder angehängt`);
            drawComments();
          } catch (e) { toast(e.message, true); }
        };
        wrap.querySelector('.addimg').onclick = () => waehleBilder(nachreichen);
        ta.addEventListener('paste', (e) => {
          const bilder = bilderAusZwischenablage(e);
          if (!bilder.length) return;
          e.preventDefault();
          nachreichen(bilder);
        });

        wrap.querySelector('.cancel').onclick = () => drawComments();
        wrap.querySelector('.save').onclick = async () => {
          const v = ta.value.trim();
          if (!v) return toast('Text fehlt', true);
          try { item = await api('PUT', `/api/comments/${c.id}`, { text: v }); drawComments(); toast('Gespeichert'); }
          catch (e) { toast(e.message, true); }
        };
      };
      box.appendChild(el);
    });
    ruesteBloeckeAus(item);
  }
  /* ---- Neuer Kommentar ---- */
  // Bilder werden hier gesammelt und erst mit dem Absenden geschickt: der
  // Kommentar hat noch keine Id, und bei einem Abbruch entstuende sonst ein
  // leerer Kommentar mit Bildern.
  const fitCtext = autoGrow(document.getElementById('ctext'));
  let neueBilder = [];
  let neuAngepinnt = false, neueArt = 'note';

  function drawNeuMarken() {
    document.getElementById('cpin').classList.toggle('on', neuAngepinnt);
    const art = document.getElementById('cart');
    art.classList.toggle('on', neueArt === 'report');
    art.textContent = V.berichtEinzahl;
    art.title = `Als ${V.berichtEinzahl} markieren`;
    const aufg = document.getElementById('caufg');
    const fertig = neueArt === 'done';
    aufg.classList.toggle('on', neueArt === 'task' || fertig);
    aufg.classList.toggle('fertig', fertig);
    aufg.textContent = fertig ? V.aufgabeErledigt : V.aufgabeEinzahl;
    aufg.title = fertig ? 'Zustand zurücksetzen'
      : neueArt === 'task' ? `Auf „${V.aufgabeErledigt}" setzen`
                           : `Als ${V.aufgabeEinzahl} markieren`;
  }
  function drawNeuBilder() {
    const box = document.getElementById('cneu-imgs');
    box.innerHTML = '';
    neueBilder.forEach((f, i) => {
      const k = document.createElement('div');
      k.className = 'cmt-img';
      const url = URL.createObjectURL(f);
      k.innerHTML = `<img src="${url}" alt=""><button class="del" title="Wieder entfernen">✕</button>`;
      // Die erzeugte Adresse wieder freigeben, sobald das Bild steht.
      k.querySelector('img').onload = () => URL.revokeObjectURL(url);
      k.querySelector('.del').onclick = () => { neueBilder.splice(i, 1); drawNeuBilder(); };
      box.appendChild(k);
    });
  }
  const nimmBilder = (dateien) => {
    const bilder = dateien.filter(f => f.type.startsWith('image/'));
    if (!bilder.length) return;
    if (neueBilder.length + bilder.length > 6) return toast('Höchstens 6 Bilder je Kommentar.', true);
    neueBilder = [...neueBilder, ...bilder];
    drawNeuBilder();
  };
  drawNeuMarken();

  document.getElementById('cpin').onclick = () => { neuAngepinnt = !neuAngepinnt; drawNeuMarken(); };
  document.getElementById('cart').onclick =
    () => { neueArt = neueArt === 'report' ? 'note' : 'report'; drawNeuMarken(); };
  document.getElementById('caufg').onclick =
    () => { neueArt = aufgabeWeiter(neueArt); drawNeuMarken(); };
  document.getElementById('cimg').onclick = () => waehleBilder(nimmBilder);
  document.getElementById('ctext').addEventListener('paste', (e) => {
    const bilder = bilderAusZwischenablage(e);
    if (!bilder.length) return;   // Text weiterhin normal einfügen
    e.preventDefault();
    nimmBilder(bilder);
  });

  document.getElementById('cadd').onclick = async () => {
    const ta = document.getElementById('ctext');
    const v = ta.value.trim();
    if (!v) return toast('Text fehlt', true);
    const fd = new FormData();
    fd.append('text', v);
    fd.append('kind', neueArt);
    fd.append('pinned', neuAngepinnt ? '1' : '0');
    neueBilder.forEach(f => fd.append('images', f));
    try {
      item = await sendeFormular(`/api/items/${id}/comments`, fd);
      ta.value = ''; fitCtext();
      neueBilder = []; neuAngepinnt = false; neueArt = 'note';
      drawNeuBilder(); drawNeuMarken(); drawComments();
    } catch (e) { toast(e.message, true); }
  };

  /* Die Zahlen kommen vom Server, nicht aus dem geladenen Eintrag: nur dort
     lassen sich eigene von fremden Beiträgen trennen, und zwei Quellen für
     dieselbe Aussage wären zwei Wahrheiten.
     Der fremde Teil steht in einem eigenen Satz, weil er das Neue ist — was
     hier verlorengeht, gehört anderen. Ist nichts Fremdes dabei, fehlt der
     Satz; ein Zugang allein sieht den Dialog deshalb wie vorher. */
  document.getElementById('del').onclick = async () => {
    let b;
    try { b = await api('GET', `/api/items/${id}/bestand`); }
    catch (e) { return toast(e.message, true); }

    const zaehl = (n, ein, mehr) => (n ? [`${n} ${n === 1 ? ein : mehr}`] : []);
    // Fotos und Dateien haengen am Eintrag und gehoeren seinem Verfasser. Ein
    // Link kann fremd sein und steht deshalb bei den Beitraegen, nicht hier.
    const inhalt = [
      ...zaehl(b.fotos, 'Foto', 'Fotos'),
      // Eigene Zeile, nicht als Foto getarnt: ein Dialog, der "3 Fotos" sagt
      // und dabei ein Video mit wegwirft, verschweigt genau das, um
      // dessentwillen er dasteht.
      ...zaehl(b.videos, 'Video', 'Videos')
    ];
    const eigen = [
      ...zaehl(b.eigenLinks, 'Link', 'Links'),
      ...zaehl(b.eigenDateien, 'Datei', 'Dateien'),
      ...zaehl(b.eigenKommentare, 'Kommentar', 'Kommentare'),
      ...zaehl(b.eigenBewertungen, 'Bewertung', 'Bewertungen'),
      ...(b.eigenTesttage ? [`${b.eigenTesttage} ${vZeit(b.eigenTesttage)}`] : [])
    ];
    const fremd = [
      ...zaehl(b.fremdLinks, 'Link', 'Links'),
      ...zaehl(b.fremdDateien, 'Datei', 'Dateien'),
      ...zaehl(b.fremdKommentare, 'Kommentar', 'Kommentare'),
      ...zaehl(b.fremdBewertungen, 'Bewertung', 'Bewertungen'),
      ...(b.fremdTesttage ? [`${b.fremdTesttage} ${vZeit(b.fremdTesttage)}`] : [])
    ];

    /* DER DIALOG NENNT ZAHLEN, UND SEIN SCHLUSSSATZ NENNT DEN PAPIERKORB.
       Mit Unwiderruflichkeit lässt er sich nicht mehr begründen — das wäre
       falsch. Die Zahlen sind trotzdem die eigentliche Auskunft: was hier
       verloren geht, gehört anderen. Und wer wiederherstellen darf, steht
       dabei — es ist nicht der, der hier klickt. */
    const saetze = [`„${item.title}" wird gelöscht.`];
    if (inhalt.length) saetze.push(`Dabei gehen ${inhalt.join(', ')} mit.`);
    if (eigen.length) saetze.push(`Dazu ${eigen.join(', ')} von mir.`);
    if (fremd.length) saetze.push(`Und von anderen: ${fremd.join(', ')}.`);
    saetze.push(`Alles davon liegt danach ${PAPIERKORB_TAGE} Tage im Papierkorb; ` +
      `zurückholen kann es der Eigentümer der Anlage.`);

    if (!await confirmBox(`${V.sacheEinzahl} löschen?`, saetze.join(' '))) return;
    try { await api('DELETE', `/api/items/${id}`); state.compare.delete(id); location.hash = '#/'; }
    catch (e) { toast(e.message, true); }
  };

  // Ab hier kann das Aufklappen des Tagblocks die Wolke nachmessen lassen.
  wolkeNeuzeichnen = drawWolke;

  // Gespeicherte Anordnung anwenden, bevor die Blöcke gefüllt werden.
  ordneBloecke();
  drawViewer(); drawThumbs(); drawSwitches(); drawVerfasser(); drawCat(); drawTags();
  drawRatings(); drawTestDays(); drawLinks(); drawAtts(); drawComments();
}

/* ================= Systembereich ================= */
async function renderSystem() {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  let stats, titles, cats, tags, crits, zugang, papierkorb, sicherung, sitzungen, protokoll, mailstand,
      anfragen;
  try {
    /* DIE KENNZAHLEN WERDEN NUR GEHOLT, WENN SIE AUCH ANGEZEIGT WERDEN. Sie
       stehen hinter dem Admin; ein Abruf, der zuverlaessig 403 ergibt, risse
       hier mehr mit als seine eigene Karte -- alle
       Abrufe haengen in EINEM Promise.all, und ein einziger Fehlschlag
       verliesse den Rumpf mit return. Der Systembereich bliebe dann leer,
       auch die Karten, die jedem zustehen.
       Bewusst KEIN catch je Abruf daneben: die Bedingung hier ist die eine
       Stelle, an der die Frage gestellt wird. Ein Auffangnetz darunter
       verdeckte sie in jeder Gegenprobe. Es sind acht Abrufe.
       DER PAPIERKORB UND DIE SICHERUNG GEHEN DENSELBEN WEG: jeder liegt
       hinter der Rolle, hinter der auch seine Karte steht. Und beide werden
       HIER geholt und nicht spaeter nachgeladen -- ein Nachladen liefe als
       herrenlose Zusage weiter, auch wenn das Fenster laengst zu ist.
       DIE EIGENEN ANMELDUNGEN GEHEN DENSELBEN WEG und stehen ohne Bedingung
       daneben: die Karte gehoert jedem, wie "Zugang" auch.
       DAS SICHERHEITSPROTOKOLL EBENSO, hinter dem Eigentuemer -- und HIER und
       nicht spaeter aus der Karte heraus (Stolperstein 118).
       DER MAILVERSAND SEIT 0.9.0 GEHT DENSELBEN WEG, hinter dem EIGENTUEMER:
       der Mailzugang gehoert ihm ganz -- eintragen, einsehen und testen. Der
       Admin erfaehrt den Zustand dort, wo er ihn braucht, naemlich als Feld
       `versand` neben dem Link.
       DIE SELBSTANMELDUNG SEIT 0.9.1 GEHT DENSELBEN WEG, hinter dem ADMIN:
       aus einer Anfrage wird nie etwas anderes als ein Zugang mit der Rolle
       user, und den legt der Admin ohnehin an. Es sind elf Abrufe. */
    [stats, titles, cats, tags, crits, zugang, papierkorb, sicherung, sitzungen, protokoll, mailstand,
     anfragen] = await Promise.all([
      ADMIN ? api('GET', '/api/stats') : null, api('GET', '/api/titles'),
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria'),
      api('GET', '/api/account'), ADMIN ? api('GET', '/api/papierkorb') : null,
      EIGENTUEMER ? api('GET', '/api/sicherung') : null, api('GET', '/api/sessions'),
      EIGENTUEMER ? api('GET', '/api/sicherheitsprotokoll') : null,
      EIGENTUEMER ? api('GET', '/api/mail') : null,
      ADMIN ? api('GET', '/api/anfragen') : null
    ]);
  } catch (e) { if (e.message !== 'Sitzung abgelaufen') toast(e.message, true); return; }
  // Die Frist kommt vom Server, auch hier. Die Karte rechnet sie nicht nach.
  if (papierkorb && papierkorb.tage) PAPIERKORB_TAGE = papierkorb.tage;

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">System</h1>
    <p class="hint" style="margin:0 0 22px">Alles, was den Bestand als Ganzes betrifft.</p>
    <div class="sys-grid">

      ${ADMIN ? `<div class="sys-card">
        <h3>Titel</h3>
        <p class="desc">Der <strong>öffentliche Titel</strong> steht auf der Anmeldeseite und ist für
          jeden sichtbar, der die Adresse aufruft. Der <strong>interne Titel</strong> erscheint erst
          nach der Anmeldung — hier gehört die aussagekräftige Bezeichnung hin.</p>
        <div class="field"><label>Titel vor der Anmeldung</label>
          <input class="input" id="tp" value="${esc(titles.publicTitle)}"></div>
        <div class="field"><label>Titel nach der Anmeldung</label>
          <input class="input" id="ta2" value="${esc(titles.appTitle)}"></div>
        <button class="btn btn-accent btn-sm" id="tsave">Titel speichern</button>
      </div>` : ''}

      <div class="sys-card">
        <h3>Zugang</h3>
        <p class="desc">Benutzername und Passwort für die Anmeldung. Zum Ändern ist das
          bisherige Passwort nötig. Das Passwortfeld leer lassen ändert nur den Namen.
          Danach fallen alle anderen Anmeldungen — diese hier bleibt bestehen.</p>
        <div class="field"><label>Benutzername</label>
          <input class="input" id="acc-user" autocomplete="username" autocapitalize="off"
            spellcheck="false" value="${esc(zugang.username || '')}"></div>
        ${/* DIE EIGENE ADRESSE STEHT HIER UND NICHT IN DER KARTE „ZUGÄNGE“:
              sie gehört dem, der sie hat. Ein Admin, der eine bestehende
              fremde Adresse umschreiben könnte, böge damit den nächsten
              Rücksetzlink des Betroffenen auf ein Postfach seiner Wahl.
              Sie steht hinter dem bisherigen Passwort wie Name und Passwort
              daneben — aus demselben Grund. */''}
        <div class="field"><label>E-Mail-Adresse <span class="hint">(freiwillig)</span></label>
          <input class="input" id="acc-mail" type="email" autocomplete="email"
            autocapitalize="off" spellcheck="false" value="${esc(zugang.email || '')}"
            placeholder="noch keine hinterlegt"></div>
        <div class="field"><label>Bisheriges Passwort</label>
          <input class="input" id="acc-old" type="password" autocomplete="current-password"></div>
        <div class="field"><label>Neues Passwort</label>
          <input class="input" id="acc-new" type="password" autocomplete="new-password"></div>
        <div class="field"><label>Neues Passwort wiederholen</label>
          <input class="input" id="acc-new2" type="password" autocomplete="new-password"></div>
        <p class="desc" style="margin:0 0 10px">Die Adresse ist freiwillig. Sie wird für genau
          zwei Dinge gebraucht: den Einladungs- oder Rücksetzlink per Mail und die Testmail
          im Mailversand. <strong>Ohne sie fehlt nichts</strong> — der Link steht wie immer
          zum Kopieren bereit.
          Mindestens ${MIN_PASSWORT} Zeichen. Über die
          Oberfläche gibt es keine Wiederherstellung; vergessen heißt
          <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>
          auf dem Server.</p>
        <button class="btn btn-accent btn-sm" id="acc-save">Zugang ändern</button>
      </div>

      <div class="sys-card">
        <h3>Meine Sitzungen</h3>
        <p class="desc">Wo dieser Zugang überall angemeldet ist. <strong>Was hier nicht
          steht:</strong> von welchem Gerät. Die Anlage speichert weder Adresse noch
          Browserkennung — das ist so gewollt und bleibt so. Sie kann deshalb
          <strong>diese</strong> Anmeldung von <strong>allen anderen</strong> trennen, und
          mehr braucht der Knopf darunter nicht.</p>
        <div class="manage-list" id="msitzungen"></div>
      </div>

      ${ADMIN ? `<div class="sys-card">
        <h3>Kennzahlen</h3>
        <p class="desc">Umfang des Bestands, Belegung der Datenbank und der Fingerprint
          der laufenden Dateien.</p>
        <div class="kv"><span class="k">${esc(V.sacheMehrzahl)}</span><span class="v">${stats.itemCount}</span></div>
        <div class="kv"><span class="k">Fotos</span><span class="v">${stats.photoCount} · ${fmtBytes(stats.photoBytes)}</span></div>
        <div class="kv"><span class="k">Videos</span><span class="v">${stats.videoCount} · ${fmtBytes(stats.videoBytes)}</span></div>
        <div class="kv"><span class="k">Kommentare</span><span class="v">${stats.commentCount}</span></div>
        <div class="kv"><span class="k">Links</span><span class="v">${stats.linkCount}</span></div>
        <div class="kv"><span class="k">${esc(V.zeitpunktMehrzahl)}</span><span class="v">${stats.testDayCount}</span></div>
          <div class="kv"><span class="k">Dateien</span><span class="v">${stats.attachmentCount} · ${fmtBytes(stats.attachmentBytes)}</span></div>
        ${/* Der Papierkorb steht GETRENNT da, aus demselben Grund wie die Videos:
             sonst wundert sich jemand ueber eine Datenbank, die nach dem
             Aufraeumen groesser ist als vorher. Die Zeile steht UEBER der
             Datenbankgroesse, weil sie ein Teil von ihr ist. */''}
        <div class="kv"><span class="k">Papierkorb</span><span class="v">${stats.papierkorbCount || 0} · ${fmtBytes(stats.papierkorbBytes)}</span></div>
        <div class="kv"><span class="k">Datenbank</span><span class="v">${fmtBytes(stats.dbBytes)}</span></div>
        ${/* Der Fingerprint beantwortet, was die Versionsnummer nicht kann: ob die
             Dateien, die hier laufen, WIRKLICH zusammengehoeren. Nach dem
             Einspielen wird er gegen die Zeile im Aenderungsprotokoll
             gehalten -- stimmt er nicht, ist ein Dateisatz halb eingespielt. */''}
        <div class="kv"><span class="k">Fingerprint</span><span class="v"><code>${esc(stats.fingerprint || '—')}</code></span></div>
        <div style="margin-top:14px">${stats.keyFromEnv
          ? `<div class="ok-box">Der Schlüssel kommt aus der Umgebung. Denk daran: <strong>.env und data/ nicht in dieselbe Sicherung legen</strong> — und ohne den Schlüssel sind die Daten unwiederbringlich verloren.</div>`
          : `<div class="warn-box"><strong>Der Schlüssel liegt neben der Datenbank</strong> (data/encryption.key). Wer das Verzeichnis kopiert, kann alles lesen.
              <p style="margin:9px 0 6px">Für echten Schutz <strong>diesen</strong> Wert in die <code>.env</code> eintragen — keinen neuen erzeugen, sonst sind die vorhandenen Daten nicht mehr lesbar:</p>
              <code class="keyline" id="keyline">ENCRYPTION_KEY=${esc(stats.keyHex || '')}</code>
              <p style="margin:8px 0 0">Danach <code>docker compose up -d</code> und im Protokoll „Schlüssel aus ENCRYPTION_KEY geladen" prüfen — <strong>erst dann</strong> <code>data/encryption.key</code> entfernen.</p>
            </div>`}
        </div>
      </div>` : ''}

      ${/* Export und Import gehoeren dem Eigentuemer, beide Routen stehen hinter
            nurEigentuemer. Die Groessenschaetzung liest aus den Kennzahlen --
            das geht nur auf, weil die Rollen eine LEITER sind: wer Eigentuemer
            ist, ist auch Admin, und dann steht stats. Faellt diese Leiter
            jemals, faellt hier eine Karte auf null. */''}${EIGENTUEMER && mailstand ? `<div class="sys-card">
        <h3>Mailversand</h3>
        ${/* DIE ACHTZEHNTE KARTE, und sie gehört dem EIGENTÜMER — nicht dem
              Admin, obwohl der die Einladungen verschickt. Der SMTP-Server
              sieht jede Mail, und jede trägt einen Link, der ein Passwort
              setzt; ein Admin, der ihn einträgt, böge damit die Rücksetzmail
              des Eigentümers auf einen Server seiner Wahl. Über dem Eigentümer
              steht niemand — die Rollenleiter bleibt heil.
              DAS PASSWORT STEHT HIER NIE: „gesetzt“ oder „nicht gesetzt“, nie
              die Länge, nie der Anfang, nie Sternchen mit der richtigen Zahl.
              Aus jedem davon ließe sich etwas ableiten, und keines hilft dem,
              der die Karte ansieht. */''}
        <p class="desc"><strong>E-Mail ist eine Bequemlichkeit, keine Voraussetzung.</strong>
          Ohne Mailzugang läuft die Anlage vollständig — Einladungs- und Rücksetzlinks stehen
          dann wie bisher im Verwaltungsbereich zum Kopieren. Mit Mailzugang gehen sie
          <em>zusätzlich</em> hinaus; schlägt das fehl, bricht nichts ab.</p>
        <div class="kv"><span class="k">Zustand</span><span class="v">${mailstand.eingerichtet
          ? '<strong class="mail-gut">eingerichtet</strong>'
          : '<strong class="mail-aus">nicht eingerichtet</strong>'}</span></div>
        <div class="kv"><span class="k">Passwort</span><span class="v">${mailstand.passwortGesetzt
          ? 'gesetzt' : 'nicht gesetzt'}</span></div>
        <div class="kv"><span class="k">Öffentliche Adresse</span><span class="v">${mailstand.adresseGesetzt
          ? esc(mailstand.adresse)
          : '<strong class="mail-aus">nicht gesetzt — es wird nicht verschickt</strong>'}</span></div>
        <div class="kv"><span class="k">Zuletzt erfolgreich getestet</span><span class="v">${mailstand.getestetAm
          ? esc(mailstand.getestetAm) : 'noch nie'}</span></div>
        ${mailstand.adresseGesetzt ? '' : `<p class="warn-box" style="margin:10px 0 0">
          <strong>Ohne <code>OEFFENTLICHE_ADRESSE</code> in der <code>.env</code> wird nichts
          verschickt.</strong> Der Server wüsste sonst nicht, worauf der Link zeigen soll —
          und aus dem <code>Host</code>-Kopf darf er es nicht ableiten: über einen gefälschten
          Kopf ließe sich ein Rücksetzlink auf einen fremden Server umbiegen.</p>`}

        <div class="field" style="margin-top:14px"><label for="mail-anbieter">Anbieter</label>
          <select class="input" id="mail-anbieter">
            <option value=""${mailstand.anbieter ? '' : ' selected'}>— kein Versand —</option>
            ${mailstand.anbieterListe.map(a => `<option value="${esc(a.schluessel)}"${
              a.schluessel === mailstand.anbieter ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}
          </select></div>
        ${/* Server, Port und Verschlüsselung stehen für die Vorlagen im
              Quelltext und werden hier nur GEZEIGT. Wechselt ein Anbieter
              morgen den Port, kommt der neue aus der Liste — eine Kopie in
              der Datenbank wäre eingefroren und liefe auseinander. Nur bei
              „Eigener Server“ sind die Felder offen. */''}
        <div class="field"><label for="mail-server">Server</label>
          <input class="input" id="mail-server" value="${esc(mailstand.server || '')}"
            autocapitalize="off" spellcheck="false"></div>
        <div class="row-in">
          <div class="field" style="flex:1"><label for="mail-port">Port</label>
            <input class="input" id="mail-port" type="number" min="1" max="65535"
              value="${mailstand.port || ''}"></div>
          <div class="field" style="flex:1"><label for="mail-sicher">Verschlüsselung</label>
            <select class="input" id="mail-sicher">
              <option value="starttls"${mailstand.sicher ? '' : ' selected'}>STARTTLS (meist 587)</option>
              <option value="tls"${mailstand.sicher ? ' selected' : ''}>TLS von Anfang an (meist 465)</option>
            </select></div>
        </div>
        <div class="field"><label for="mail-benutzer">Benutzername beim Anbieter</label>
          <input class="input" id="mail-benutzer" value="${esc(mailstand.benutzer || '')}"
            autocomplete="off" autocapitalize="off" spellcheck="false"></div>
        <div class="field"><label for="mail-passwort">Passwort beim Anbieter</label>
          <input class="input" id="mail-passwort" type="password" autocomplete="new-password"
            placeholder="${mailstand.passwortGesetzt ? 'gesetzt — leer lassen ändert es nicht' : 'nicht gesetzt'}"></div>
        <div class="field"><label for="mail-absender">Absenderadresse</label>
          <input class="input" id="mail-absender" type="email" value="${esc(mailstand.absender || '')}"
            autocomplete="off" autocapitalize="off" spellcheck="false"></div>

        <p class="desc" id="mail-hinweis">${mailstand.hinweis ? `<strong>${esc(mailstand.hinweis)}</strong><br>` : ''}
          ${esc(mailstand.hinweisImmer)}</p>
        <p class="desc">Immer über den SMTP-Zugang eines Anbieters, nie unmittelbar vom
          Hausanschluss: dort fehlen rDNS und SPF/DKIM, und die Mail landet im besten Fall
          im Spam.</p>
        <div class="row-in">
          <button class="btn btn-accent btn-sm" id="mail-save">Mailzugang speichern</button>
          <button class="btn btn-sm" id="mail-test">Testmail an mich</button>
        </div>
        <p class="desc" style="margin:8px 0 0">Die Testmail geht <strong>ausschließlich an die
          Adresse deines eigenen Zugangs</strong> — es gibt kein Adressfeld daneben, und zwar
          mit Absicht: ein Knopf, der an eine beliebige Adresse schickt, wäre ein offener
          Mailverteiler hinter einer Anmeldung. Antwortet der Mailserver nicht, bricht der
          Versuch nach ${mailstand.sekunden} Sekunden ab.</p>
        <div id="mail-ergebnis"></div>
      </div>` : ''}${EIGENTUEMER ? `<div class="sys-card">
        <h3>Export</h3>
        ${/* DIE ROLLENTEILUNG GEHOERT AN DIE KARTE, nicht nur in die Doku. Wer
             Export und Sicherung nebeneinander sieht, muss ohne Rueckfrage
             wissen, welche er will. Ein Satz je Karte, und er steht hier. */''}
        <p class="desc"><strong>Der Austauschweg</strong> — für Umzug, Archiv und die Weitergabe:
          die Datei überlebt einen Formatwechsel und braucht keinen Schlüssel. Für den Notfall
          ist die Karte <strong>Sicherung</strong> zuständig.</p>
        <p class="desc">Schreibt den gesamten Bestand in eine Datei. Mit Fotos wird sie deutlich
          größer, weil Bilder als Text kodiert werden müssen — rechne mit rund einem Drittel
          Aufschlag auf ${fmtBytes(stats.photoBytes)}.</p>
        <div class="row-in">
          <button class="btn btn-accent btn-sm" id="ex-yes">Mit Fotos (~${fmtBytes(Math.round(stats.photoBytes * 1.34))})</button>
          <button class="btn btn-sm" id="ex-no">Ohne Fotos</button>
        </div>
        <label class="ex-files"><input type="checkbox" id="ex-files">
          Angehängte Dateien mitnehmen (~${fmtBytes(Math.round(stats.attachmentBytes * 1.34))})</label>
        ${/* Eigener Schalter, Vorgabe aus. Ohne ihn bleibt der Platz des Videos
             in der Datei vermerkt, die Datei selbst fehlt -- der Import sagt
             dann, wie viele es waren. Stand ein Video an erster Stelle, wird
             danach das naechste Foto zum Hauptbild. */''}
        <label class="ex-files"><input type="checkbox" id="ex-videos">
          Videos mitnehmen (~${fmtBytes(Math.round(stats.videoBytes * 1.34))})</label>
        ${stats.videoCount ? `<p class="hint hint-sm" style="margin:6px 2px 0">
          Ohne Häkchen bleiben die Videos zurück; die Einträge nennen sie, die Dateien fehlen.</p>` : ''}
      </div>

      <div class="sys-card">
        <h3>Import</h3>
        <p class="desc">Spielt eine zuvor erzeugte Exportdatei wieder ein. Vor dem Start wird
          gefragt, was mit dem vorhandenen Bestand geschehen soll.</p>
        <label class="drop" id="imp-drop"><input type="file" id="imp" accept="application/json,.json">
          Exportdatei auswählen</label>
      </div>

      <div class="sys-card">
        <h3>Sicherung</h3>
        <p class="desc"><strong>Der Sicherungsweg</strong> — eine vollständige, verschlüsselte
          Kopie der Datenbank, samt allem, was der Export nicht mitnimmt. Sie braucht beim
          Schreiben keinen nennenswerten Arbeitsspeicher, überlebt aber keinen Formatwechsel.</p>
        ${/* DER HINWEIS AUF DEN SCHLUESSEL GEHOERT AN DEN KNOPF, nicht in die
             Dokumentation: die Kopie ist ohne .env wertlos. Das ist dieselbe
             Falle, die die README ausfuehrlich beschreibt -- hier steht sie an
             der Stelle, an der jemand sie tatsaechlich tappt. */''}
        <div class="warn-box" style="margin:0 0 14px"><strong>Die Kopie ist verschlüsselt.</strong>
          Ohne den Schlüssel aus der <code>.env</code> lässt sie sich nicht öffnen — und beides
          gehört nicht an denselben Ort.</div>
        <div id="sicherung-box"></div>
      </div>` : ''}

      ${/* DIE KARTE STEHT BEIM ADMIN, GEHANDELT WIRD NUR VOM EIGENTUEMER --
            dieselbe Bauform wie bei "Kategorien", "Tags" und
            "Bewertungskriterien": wer nicht verwalten darf, darf trotzdem
            nachsehen. Sehen ist hier harmlos, denn der Titel eines geloeschten
            Eintrags stand vorher in der Uebersicht, die jeder sieht.
            Zurueckholen dagegen legt Zeilen unter FREMDEM Namen an und liegt
            damit in derselben Rechtezeile wie der Import. */''}${ADMIN ? `<div class="sys-card">
        <h3>Papierkorb</h3>
        <p class="desc">Gelöschte ${esc(V.sacheMehrzahl)} liegen hier <strong>${PAPIERKORB_TAGE} Tage</strong>
          und lassen sich zurückholen; danach fallen sie heraus. Zurück kommt eine
          <strong>neue</strong> Nummer mit demselben Inhalt — Fotos, Videos, Dateien, Kommentare,
          Bewertungen und ${esc(V.zeitpunktMehrzahl)} samt ihren Verfassern.
          ${EIGENTUEMER ? '' : 'Zurückholen und endgültig entfernen kann der Eigentümer der Anlage.'}</p>
        <div class="manage-list" id="mpapierkorb"></div>
      </div>` : ''}

      <div class="sys-card">
        <h3>Kategorien</h3>
        <p class="desc">Umbenennen oder löschen. Beim Löschen bleiben die ${esc(V.sacheMehrzahl)}
          erhalten und haben nur keine Kategorie mehr.</p>
        <div class="manage-list" id="mcats"></div>
        ${ADMIN ? `<p class="desc" style="margin:16px 0 8px">Wer eine <strong>neue</strong> Kategorie
          anlegen darf. Ohne Häkchen bleibt die Auswahl aus dem Vorhandenen für jeden bestehen —
          nur die Zeile „+ neue Kategorie" am ${esc(V.sacheEinzahl)} verschwindet. Der Admin legt
          weiterhin an.</p>
        <label class="ex-files"><input type="checkbox" id="katfrei">
          Neue Kategorien darf jeder anlegen</label>` : ''}
      </div>

      <div class="sys-card">
        <h3>Tags</h3>
        <p class="desc">Umbenennen oder löschen. Ein gelöschter Tag verschwindet überall;
          die ${esc(V.sacheMehrzahl)} selbst bleiben unberührt.</p>
        <div class="manage-list" id="mtags"></div>
        ${ADMIN ? `<p class="desc" style="margin:16px 0 8px">Wer einen <strong>neuen</strong> Tag
          anlegen darf. Ohne Häkchen bleiben Wolke und Vergabe für jeden bestehen — nur die
          Eingabezeile am ${esc(V.sacheEinzahl)} verschwindet. Am ${esc(V.zeitpunktEinzahl)} bleibt
          sie stehen, weil es dort keine Wolke gibt; ein unbekannter Name wird dann abgewiesen.</p>
        <label class="ex-files"><input type="checkbox" id="tagfrei">
          Neue Tags darf jeder anlegen</label>` : ''}
      </div>

      <div class="sys-card">
        <h3>Bewertungskriterien</h3>
        <p class="desc">${ADMIN
          ? `Anlegen, umbenennen, löschen und <strong>per Ziehen sortieren</strong> — mit Maus
             oder Finger. Die Reihenfolge gilt für Detailansicht und Vergleich gleichermaßen.
             Ein neues Kriterium erscheint sofort an allen ${esc(V.sacheMehrzahl)}, ein gelöschtes
             nimmt überall die vergebenen Sterne mit. Die Zahl nennt, an wie vielen
             ${esc(V.sacheMehrzahl)} Sterne vergeben sind.`
          : `Die Kriterienliste pflegt der Admin. Die Reihenfolge gilt für Detailansicht und
             Vergleich gleichermaßen; die Zahl nennt, an wie vielen ${esc(V.sacheMehrzahl)}
             Sterne vergeben sind.`}</p>
        <div class="manage-list" id="mcrits"></div>
        <p class="desc" style="margin:10px 0 0">Das <strong>Gewicht</strong> bestimmt, wie stark ein
          Kriterium in den Gesamtschnitt eingeht. Bei 1 zählen alle gleich. ${ADMIN
            ? `Möglich ist 0,2 bis 2 — die Vorschläge sind nur die häufigsten Werte.`
            : `Eingestellt wird es vom Admin; es gilt für alle.`}
          Der Gesamtschnitt bleibt in jedem Fall zwischen 1 und 5.</p>
        <!-- Ein Textfeld MIT Vorschlagsliste, kein Auswahlfeld: feste Stufen decken 0,2 bis 2 nicht
             ab, und ein Eintrag "anderer Wert ..." waere ein Moduswechsel -- erst waehlen, dann
             tippen, zwei Bedienformen fuer dieselbe Sache. Dasselbe Muster wie die Tageingabe am
             Eintrag (#newtag mit list="tagsug").
             ZWEI VORSCHLAEGE UNTER 1: die Liste ist der einzige Ort, an dem der Bereich unter 1
             ueberhaupt sichtbar wird. Ohne sie bliebe er da und waere nur nicht auffindbar.
             Sie kostet eine Zeile und der Server merkt davon nichts -- alles zwischen 0,2 und 2
             laesst sich ohnehin eintippen. -->
        <datalist id="gewichtsug">
          <option value="0,5"><option value="0,8"><option value="1"><option value="1,2"><option value="1,5">
        </datalist>
        ${ADMIN ? `<div class="row-in" style="margin-top:12px">
          <input class="input input-sm" id="newcrit" placeholder="Neues Kriterium" style="padding:8px 11px">
          <button class="btn btn-sm" id="newcrit-b">+ Anlegen</button>
        </div>` : ''}
      </div>

      ${ADMIN ? `<div class="sys-card breit">
        <h3>Zugänge</h3>
        <p class="desc">Wer sich anmelden darf. <strong>Sperren ist in den meisten Fällen das,
          was man eigentlich will</strong> — die Anmeldung wird abgewiesen, die Beiträge bleiben
          unangetastet stehen.
          ${EIGENTUEMER
            ? `Als Eigentümer der Anlage vergibst du Rollen und kommst auch an andere Admins.`
            : `Rollen vergibt der Eigentümer der Anlage; an einen anderen Admin kommst du nicht.`}</p>
        <div class="manage-list" id="mzugaenge"></div>

        <p class="desc" style="margin:16px 0 8px">Woher der neue Zugang sein Passwort bekommt,
          steht als <strong>Wahl im Formular</strong> — das Feld daneben erscheint nur, wenn es
          auch gilt. Der Weg über den <strong>Link</strong> ist der empfohlene: du erfährst das
          Passwort nie, und der Link gilt sieben Tage und genau einmal.</p>
        <div class="zug-neu">
          <input class="input input-sm" id="zug-name" placeholder="Benutzername"
            autocomplete="off" autocapitalize="off" spellcheck="false">
          ${/* DIE ADRESSE BEIM ANLEGEN, und nur hier: ohne sie hat die
                Einladungsmail keinen Empfänger, und den Zugang gibt es in
                diesem Augenblick noch nicht, also kann sie auch niemand selbst
                eintragen. Ändern darf sie danach allein der Betroffene, unter
                „Zugang“. Freiwillig — ohne sie bleibt alles beim Kopieren. */''}
          <input class="input input-sm" id="zug-mail" type="email" placeholder="E-Mail (freiwillig)"
            autocomplete="off" autocapitalize="off" spellcheck="false">
          <select class="input input-sm" id="zug-art">
            <option value="link">Er wählt sein Passwort selbst</option>
            <option value="passwort">Ich vergebe das erste Passwort</option>
          </select>
          <input class="input input-sm" id="zug-pass" type="password" placeholder="Erstes Passwort"
            autocomplete="new-password" hidden>
          ${EIGENTUEMER ? `<select class="input input-sm" id="zug-rolle">
            <option value="user">Benutzer</option>
            <option value="admin">Admin</option>
            <option value="eigentuemer">Eigentümer</option>
          </select>` : ''}
          <button class="btn btn-accent btn-sm" id="zug-anlegen">+ Anlegen und Link</button>
        </div>
        <div id="zug-link"></div>

        <p class="desc" style="margin:16px 0 0">Passwort vergessen und niemand kommt mehr herein?
          Auf dem Server hilft
          <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>.</p>
      </div>` : ''}

      ${/* DIE NEUNZEHNTE KARTE, seit 0.9.1 — und sie steht beim ADMIN, nicht
            beim Eigentümer: aus einer Anfrage wird nie etwas anderes als ein
            Zugang mit der Rolle „Benutzer“, und den legt der Admin ohnehin an.
            SIE STEHT IMMER, AUCH WENN DIE SELBSTANMELDUNG AUS IST — und das
            ist eine Berichtigung aus dem Betrieb. Zuerst war sie an die
            Bedingung „der Schalter ist an oder es liegen Anfragen" geknüpft;
            der Gedanke dahinter war, keine Karte zu zeigen, die dauerhaft
            „aus, nichts offen" meldet. Er trägt nicht, denn DER SCHALTER STEHT
            IN DIESER KARTE: solange sie fehlt, gibt es keinen Weg, ihn je
            einzuschalten. Eine Bedingung, die ihren eigenen Ausweg verdeckt,
            ist eine Sackgasse.
            SIE BLEIBT TROTZDEM KURZ, wenn es nichts zu sagen gibt: Überschrift,
            ein Satz, der Zustand und der Schalter — die Liste erscheint erst,
            wenn eine Anfrage vorliegt.
            DER SCHALTER LEGT SICH NIE VON SELBST UM: geht der Versand kaputt,
            bleibt er an und die Zeile darunter wird rot. Ein Schalter, der
            sich selbst umlegt, stünde anders da, als der Mensch ihn gestellt
            hat — und niemand wüsste, wann das passiert ist. */''}${
        ADMIN && anfragen ? `<div class="sys-card breit">
        <h3>Anfragen</h3>
        <p class="desc"><strong>Niemand kommt hier herein, ohne dass ein Admin ihn hereinlässt.</strong>
          Ist die Selbstanmeldung an, steht auf der Anmeldeseite ein Formular: Wunschname und
          E-Mail-Adresse, kein Passwort. Wer es abschickt, bekommt zuerst eine Mail und bestätigt
          damit, dass die Adresse ihm gehört — <strong>erst die bestätigte Anfrage erscheint
          hier</strong>. Unbestätigte verfallen nach ${anfragen.stunden} Stunden.
          ${anfragen.an ? '' : '<strong>Zurzeit ist sie aus</strong> — dann legt nur der Admin ' +
            'Zugänge an, und es fehlt nichts.'}</p>
        <div class="kv"><span class="k">Selbstanmeldung</span><span class="v" id="anf-zustand">${
          anfragen.an ? '<strong class="mail-gut">an</strong>' : '<strong class="mail-aus">aus</strong>'
        }</span></div>
        <div class="kv"><span class="k">Offene Anfragen</span><span class="v" id="anf-belegt">${
          anfragen.belegt} von höchstens ${anfragen.deckel}</span></div>
        ${anfragen.an && !anfragen.versandBereit ? `<p class="warn-box" id="anf-kaputt" style="margin:10px 0 0">
          <strong>Der Versand trägt gerade nicht — die Selbstanmeldung bleibt trotzdem an.</strong>
          ${esc(anfragen.versandGrund)} Solange das so ist, bekommt niemand eine Bestätigungsmail,
          und es kann keine Anfrage entstehen. Der Schalter wird deshalb <em>nicht</em> von selbst
          umgelegt: er steht so, wie ihr ihn gestellt habt.</p>` : ''}
        ${!anfragen.an && !anfragen.versandBereit ? `<p class="desc" id="anf-nichtbereit">
          <strong>Einschalten geht erst, wenn der Versand steht.</strong>
          ${esc(anfragen.versandGrund)}</p>` : ''}
        <div class="row-in" style="margin-top:10px">
          <button class="btn btn-sm${anfragen.an ? '' : ' btn-accent'}" id="anf-schalter"${
            !anfragen.an && !anfragen.versandBereit ? ' disabled' : ''}>${
            anfragen.an ? 'Selbstanmeldung ausschalten' : 'Selbstanmeldung einschalten'}</button>
        </div>
        <div class="manage-list" id="manfragen" style="margin-top:14px"></div>
        <div id="anf-link"></div>
        <p class="desc" style="margin:16px 0 0"><strong>Freischalten</strong> legt einen Zugang mit
          der Rolle <strong>Benutzer</strong> an — nie mit einer anderen — und erzeugt den
          Einladungslink, über den der Betreffende sein Passwort selbst setzt.
          <strong>Ablehnen</strong> entfernt die Anfrage; es entsteht kein Zugang, und es geht
          keine Nachricht hinaus.</p>
      </div>` : ''}

      ${/* NUR DER EIGENTUEMER. Die Karte nennt Namen und Vorgaenge ueber andere
            Zugaenge; ein Admin, der sie liest, saehe die Verwaltungsvorgaenge
            des Eigentuemers ueber ihn selbst. Dieselbe Zeile wie Export,
            Import und der Schluesselwert.
            SIE IST KEIN AENDERUNGSVERLAUF, und das steht auch dort: kein
            Eintragstitel, kein Kommentartext, keine Bewertung. */''}${EIGENTUEMER && protokoll ? `<div class="sys-card breit">
        <h3>Sicherheitsprotokoll</h3>
        <p class="desc">Wer Zugang hatte und wer die Anlage als Ganzes angefasst hat.
          <strong>Was hier nicht steht:</strong> was jemand geschrieben oder bewertet hat — das ist
          kein Änderungsverlauf, und das bleibt so. Ebenso wenig Adresse oder Browserkennung:
          die Anlage speichert beides nicht.</p>
        <p class="desc">Die Zeilen bleiben <strong>${protokoll.tage} Tage</strong> stehen und werden
          danach von selbst geräumt. Einen anderen Weg hinaus gibt es nicht — ein Sicherheitsprotokoll,
          das sich wegräumen lässt, wäre keins.</p>
        <div class="prot-liste" id="protokoll-liste"></div>
        <p class="hint hint-sm" id="protokoll-fuss" style="margin:10px 2px 0"></p>
      </div>` : ''}

      <div class="sys-card">
        <h3>Darstellung</h3>
        <p class="desc">Schriftgröße der gesamten Oberfläche. Wirkt sofort und gilt auf jedem
          Gerät. Die Layoutmaße bleiben unverändert — bei sehr großer Schrift wird es an
          manchen Stellen enger.</p>
        <div class="pills" id="fsize"></div>

        <p class="desc" style="margin:16px 0 8px">Die Zeitleiste der ${esc(V.zeitpunktMehrzahl)} über dem
          Kartenraster. Auf kleinen Bildschirmen nimmt sie viel Platz ein.</p>
        <label class="ex-files"><input type="checkbox" id="zlan"> Zeitleiste anzeigen</label>

        <p class="desc" style="margin:16px 0 8px">Anordnung und Einklappzustand der Blöcke in der
          Detailansicht gelten für alle Einträge gemeinsam.</p>
        <button class="btn btn-ghost btn-sm" id="breset">Standardanordnung wiederherstellen</button>
      </div>

      <div class="sys-card">
        <h3>Links</h3>
        <p class="desc">Wie viele Zeilen in der Detailansicht zu sehen sind, bevor
          aufgeklappt werden muss.</p>
        <div class="pills" id="lzeilen"></div>

        <p class="desc sys-teil">Wird in der Linkliste etwas eingetragen, das
          keine Adresse ist, wird daraus eine <strong>Suche</strong>. Gespeichert bleibt der
          Rohtext — ein Anbieterwechsel gilt deshalb rückwirkend für alle vorhandenen
          Suchzeilen. Gefragt wird erst beim Klick, Kriterion selbst ruft niemanden.</p>
        <p class="desc" style="margin:0 0 8px">Wie viele Anbieternamen unter einer Suchzeile
          stehen. Gezählt wird der Startanbieter mit; sind weniger in der Auswahl, stehen
          entsprechend weniger da.</p>
        <div class="pills" id="snamen"></div>
      </div>

      ${ADMIN ? `<div class="sys-card">
        <h3>Suchanbieter</h3>
        <p class="desc">Das Häkchen nimmt einen Anbieter in die Auswahl,
          <strong>Start</strong> macht ihn zum Ziel des Zeilenklicks. Der Startanbieter steht
          unter der Suchzeile immer vorn. Beides gilt für alle — die Zahl der angezeigten
          Namen bestimmt jeder für sich in der Karte „Links".</p>
        <div class="sanb-liste" id="sanbieter"></div>

        <p class="desc sys-teil">Bis zu drei eigene Anbieter. <code>%s</code> steht
          für den Suchtext; erlaubt sind nur <code>http://</code> und <code>https://</code>. Ein
          Platz zählt erst, wenn Name <em>und</em> Vorlage dastehen. Der Name darf bis zu 20
          Zeichen lang sein.</p>
        <div class="sanb-eigen" id="seigene"></div>
        <p class="desc" style="margin:8px 0 0">Foreneigene Suchen sind oft schlecht, gedrosselt
          oder verlangen eine Anmeldung. Zuverlässiger ist eine Suchmaschine, die auf die Domain
          eingeschränkt wird:<br>
          <code>https://www.google.com/search?q=site%3Aforum.beispiel.de+%s</code><br>
          Das <code>%3A</code> muss so dastehen — der Doppelpunkt gehört in die Vorlage, nicht in
          den Suchtext.</p>
      </div>` : ''}

      ${ADMIN ? `<div class="sys-card">
        <h3>Vokabular</h3>
        <p class="desc">Wie die Dinge in der Oberfläche heißen sollen. <strong>Nur die
          Beschriftung ändert sich</strong> — Datenbank und Exportdateien bleiben unberührt,
          ältere Exportdateien lassen sich weiterhin einspielen.</p>
        <div class="vok-grid">
          <div class="field"><label>Sache, Einzahl</label>
            <input class="input input-sm" id="v1" maxlength="40" value="${esc(V.sacheEinzahl)}"></div>
          <div class="field"><label>Sache, Mehrzahl</label>
            <input class="input input-sm" id="v2" maxlength="40" value="${esc(V.sacheMehrzahl)}"></div>
          <div class="field"><label>Merkmal erfüllt</label>
            <input class="input input-sm" id="v3" maxlength="40" value="${esc(V.merkmalJa)}"></div>
          <div class="field"><label>Merkmal nicht erfüllt</label>
            <input class="input input-sm" id="v4" maxlength="40" value="${esc(V.merkmalNein)}"></div>
          <div class="field"><label>Zeitpunkt, Einzahl</label>
            <input class="input input-sm" id="v5" maxlength="40" value="${esc(V.zeitpunktEinzahl)}"></div>
          <div class="field"><label>Zeitpunkt, Mehrzahl</label>
            <input class="input input-sm" id="v6" maxlength="40" value="${esc(V.zeitpunktMehrzahl)}"></div>
          <div class="field"><label>Bericht, Einzahl</label>
            <input class="input input-sm" id="v7" maxlength="40" value="${esc(V.berichtEinzahl)}"></div>
          <div class="field"><label>Bericht, Mehrzahl</label>
            <input class="input input-sm" id="v8" maxlength="40" value="${esc(V.berichtMehrzahl)}"></div>
          <div class="field"><label>Aufgabe, Einzahl</label>
            <input class="input input-sm" id="v9" maxlength="40" value="${esc(V.aufgabeEinzahl)}"></div>
          <div class="field"><label>Aufgabe, Mehrzahl</label>
            <input class="input input-sm" id="v10" maxlength="40" value="${esc(V.aufgabeMehrzahl)}"></div>
          <div class="field"><label>Aufgabe, erledigt</label>
            <input class="input input-sm" id="v11" maxlength="40" value="${esc(V.aufgabeErledigt)}"></div>
        </div>
        <div class="vok-probe" id="vprobe"></div>
        <div class="row-in" style="margin-top:12px">
          <button class="btn btn-accent btn-sm" id="vsave">Vokabular speichern</button>
          <button class="btn btn-ghost btn-sm" id="vreset">Vorgaben</button>
        </div>
      </div>` : ''}

    </div></div>`;

  /* Was eine Karte nicht zeigt, bekommt auch keinen Behandler. EIN Ort fuer
     die Frage: stuende vor jedem Behandler dieselbe Klammer, risse die erste
     vergessene beim Zeichnen fuer einen gewoehnlichen Benutzer den ganzen
     Systembereich mit -- und zwar wortlos, weil der Fehler nach dem Setzen
     von app.innerHTML kaeme. */
  const amElement = (id, tu) => { const el = document.getElementById(id); if (el) tu(el); };

  amElement('tsave', tsave => tsave.onclick = async () => {
    const p = document.getElementById('tp').value.trim();
    const a = document.getElementById('ta2').value.trim();
    try {
      const r = await api('PUT', '/api/titles', { publicTitle: p, appTitle: a });
      TITLE_PUBLIC = r.publicTitle; TITLE_APP = r.appTitle;
      document.title = TITLE_APP;
      toast('Titel gespeichert');
    } catch (e) { toast(e.message, true); }
  });

  document.getElementById('acc-save').onclick = async () => {
    const alt = document.getElementById('acc-old').value;
    const name = document.getElementById('acc-user').value.trim();
    const neu1 = document.getElementById('acc-new').value;
    const neu2 = document.getElementById('acc-new2').value;
    const adresse = document.getElementById('acc-mail').value.trim();
    if (!alt) return toast('Bitte das bisherige Passwort angeben.', true);
    if (!name) return toast('Bitte einen Benutzernamen angeben.', true);
    if (neu1 !== neu2) return toast('Die beiden neuen Passwörter stimmen nicht überein.', true);
    if (neu1 && neu1.length < MIN_PASSWORT)
      return toast(`Das Passwort muss mindestens ${MIN_PASSWORT} Zeichen lang sein.`, true);
    try {
      // Die Adresse geht IMMER mit, auch leer: der Server unterscheidet
      // „nicht angefasst“ (Feld fehlt) von „löschen“ (leer). Das Formular
      // zeigt den heutigen Wert an, also ist ein leeres Feld hier wirklich
      // die Ansage, sie zu entfernen.
      const r = await api('PUT', '/api/account', {
        oldPassword: alt, username: name, newPassword: neu1, email: adresse
      });
      toast(r.passwortGewechselt ? 'Zugang geändert' : 'Zugang gespeichert');
      // Die Kopfzeile nennt den Namen. Ohne diese Zeile stuende dort bis zum
      // naechsten Laden der Seite der alte -- ladeEinstellungen() laeuft nur
      // beim Start.
      NAME = name;
      renderSystem();   // leert die Passwortfelder
    } catch (e) { toast(e.message, true); }
  };

  /* --- Der Mailversand, seit 0.9.0 ---
     NUR FUER DEN EIGENTUEMER; die Karte steht bei allen anderen gar nicht da,
     und die Endpunkte darunter weisen sie ohnehin ab. Die Abfrage auf das
     Element ist deshalb keine Zierde, sondern die Bedingung. */
  const mailAnbieter = document.getElementById('mail-anbieter');
  if (mailAnbieter && mailstand) {
    const feld = (id) => document.getElementById('mail-' + id);
    /* SERVER, PORT UND VERSCHLUESSELUNG GEHOEREN DER VORLAGE, ausser bei
       "eigen". Sie werden gesperrt und nicht versteckt: wer GMX gewaehlt hat,
       soll SEHEN, wohin die Anlage schickt -- ein leeres Feld waere eine
       Auskunft weniger, kein Schutz mehr. */
    const nachVorlage = () => {
      const eigen = mailAnbieter.value === 'eigen';
      const keiner = mailAnbieter.value === '';
      for (const id of ['server', 'port', 'sicher']) feld(id).disabled = !eigen;
      for (const id of ['benutzer', 'passwort', 'absender']) feld(id).disabled = keiner;
      const h = document.getElementById('mail-hinweis');
      if (h) h.hidden = keiner;
    };
    mailAnbieter.onchange = nachVorlage;
    nachVorlage();

    const mailErgebnis = (text, gut) => {
      const box = document.getElementById('mail-ergebnis');
      if (box) box.innerHTML = `<p class="warn-box ${gut ? 'mail-erfolg' : ''}"
        style="margin:10px 0 0">${esc(text)}</p>`;
    };

    document.getElementById('mail-save').onclick = async () => {
      const koerper = {
        anbieter: mailAnbieter.value,
        server: feld('server').value.trim(),
        port: Number(feld('port').value),
        sicher: feld('sicher').value === 'tls',
        benutzer: feld('benutzer').value.trim(),
        // LEER HEISST "unveraendert", nicht "loeschen": sonst muesste das
        // Passwort bei jeder Aenderung am Absender neu getippt werden, und ein
        // Formular, das ein Geheimnis fuer eine Nebensache verlangt, wird
        // irgendwann mit einem falschen Wert gespeichert. Der Server hat
        // dieselbe Regel; hier steht sie nur, weil das Feld hier steht.
        passwort: feld('passwort').value,
        absender: feld('absender').value.trim()
      };
      if (!await zweiteBestaetigung('mail', null, 'Mailzugang setzen',
        'Über diesen Server läuft künftig JEDE Mail dieser Anlage — auch jeder ' +
        'Link, der ein Passwort setzt.')) return;
      try {
        await api('PUT', '/api/mail', koerper);
        toast('Mailzugang gespeichert');
        renderSystem();   // zeichnet den Zustand neu und leert das Passwortfeld
      } catch (e) { toast(e.message, true); }
    };

    document.getElementById('mail-test').onclick = async (e) => {
      /* e.currentTarget IST NACH DEM ERSTEN await NULL (Stolperstein 61) --
         der Knopf wird deshalb VOR dem Ruf festgehalten. */
      const knopf = e.currentTarget;
      knopf.disabled = true; knopf.textContent = 'Wird verschickt …';
      try {
        const r = await api('POST', '/api/mail/test', {});
        mailErgebnis(r.ok
          ? `Die Testmail ist an ${r.an} hinausgegangen. Kommt sie an, steht der Versand.`
          : `Der Versand ist fehlgeschlagen: ${r.grund}`, r.ok);
        if (r.ok) toast('Testmail verschickt');
      } catch (err) { mailErgebnis(err.message, false); }
      knopf.disabled = false; knopf.textContent = 'Testmail an mich';
    };
  }

  /* --- Meine Sitzungen ---
     Gezeichnet wird aus dem, was oben schon geholt wurde -- eine Karte, die
     sich beim Einhaengen selbst nachlaedt, laeuft als herrenlose Zusage
     weiter. Nach einem Beenden holt sitzungenNeu() die Liste noch einmal und
     zeichnet NUR diese Karte: ein Neuaufbau des ganzen Systembereichs leerte
     die Passwortfelder daneben.
     JEDE LESESTELLE IST ABGEFANGEN: fehlt die Antwort oder ein Feld darin,
     soll die Karte etwas sagen und nicht der Lauf abreissen. */
  function zeichneSitzungen(d) {
    const box = document.getElementById('msitzungen');
    if (!box) return;
    const dok = box.ownerDocument;
    const liste = (d && Array.isArray(d.sitzungen)) ? d.sitzungen : null;
    if (!liste) {
      box.innerHTML = `<span class="hint">Die Anmeldungen konnten nicht geladen werden.</span>`;
      return;
    }
    box.innerHTML = '';
    const andere = liste.filter(z => !z.diese).length;
    for (const z of liste) {
      const row = dok.createElement('div');
      row.className = 'mrow sitz' + (z.diese ? ' sitz-ich' : '');
      row.dataset.kennung = z.kennung || '';
      row.innerHTML = `<span class="mname">${z.diese
          ? 'Diese Anmeldung <span class="zug-ich">(hier)</span>' : 'Andere Anmeldung'}</span>
        <span class="sitz-zeit">angemeldet ${esc(fmtDate(z.angemeldetAm))}</span>
        <span class="sitz-zeit">zuletzt gesehen ${esc(fmtDate(z.zuletztGesehen))}</span>`;
      if (!z.diese) {
        const w = dok.createElement('span');
        w.className = 'zug-akt';
        w.innerHTML = `<button class="mact rm sitz-x" title="Diese Anmeldung beenden">✕</button>`;
        row.appendChild(w);
        w.querySelector('.sitz-x').onclick = async () => {
          try { await api('DELETE', `/api/sessions/${z.kennung}`); toast('Anmeldung beendet'); }
          catch (e) { return toast(e.message, true); }
          sitzungenNeu();
        };
      }
      box.appendChild(row);
    }
    /* DIE ZAHL IST DIE AUSKUNFT DIESER KARTE. Wer eine Anmeldung erwartet und
       vier sieht, weiss genug -- und das Heilmittel ist der eine Knopf
       daneben. Steht keine andere da, steht auch kein Knopf: einer, der
       zuverlaessig nichts tut, sieht aus wie ein Fehler. */
    const fuss = dok.createElement('div');
    fuss.className = 'sitz-fuss';
    fuss.innerHTML = andere
      ? `<p class="desc" style="margin:10px 0 8px">${andere === 1
          ? 'Neben dieser steht <strong>eine weitere</strong> Anmeldung.'
          : `Neben dieser stehen <strong>${andere} weitere</strong> Anmeldungen.`}
          Eine Anmeldung läuft nach ${d.tage || 30} Tagen ohne Zugriff von selbst ab.</p>
         <button class="btn btn-sm" id="sitz-alle">Alle anderen beenden</button>`
      : `<p class="desc" style="margin:10px 0 0">Dies ist die <strong>einzige</strong> Anmeldung
          dieses Zugangs.</p>`;
    box.appendChild(fuss);
    const alle = dok.getElementById('sitz-alle');
    if (alle) alle.onclick = async () => {
      if (!confirm(`Alle anderen Anmeldungen dieses Zugangs beenden? Diese hier bleibt bestehen.`)) return;
      try {
        const r = await api('DELETE', '/api/sessions');
        toast(`${r && r.beendet ? r.beendet : 0} Anmeldung(en) beendet`);
      } catch (e) { return toast(e.message, true); }
      sitzungenNeu();
    };
  }
  async function sitzungenNeu() {
    const box = document.getElementById('msitzungen');
    if (!box) return;
    let d;
    try { d = await api('GET', '/api/sessions'); }
    catch (e) {
      if (box.isConnected) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`;
      return;
    }
    if (box.isConnected) zeichneSitzungen(d);
  }
  zeichneSitzungen(sitzungen);

  /* --- Das Sicherheitsprotokoll ---
     Gezeichnet wird aus dem, was oben schon geholt wurde -- dieselbe Bauform
     wie bei den Verwaltungskarten und aus demselben Grund (Stolperstein 118).
     JEDE LESESTELLE IST ABGEFANGEN: fehlt der Gegenstand, bleibt die Karte
     leer und sagt es, statt den Lauf abzureissen. */
  const VORGANGSWORT = {
    'anmeldung.ok': 'Angemeldet',
    'anmeldung.fehl': 'Anmeldung gescheitert',
    'bestaetigung.fehl': 'Bestätigung gescheitert',
    'zugang.neu': 'Zugang angelegt',
    'zugang.rolle': 'Rolle vergeben',
    'zugang.passwort': 'Passwort gesetzt',
    'zugang.weg': 'Zugang entfernt',
    'zugang.selbst': 'Eigener Zugang geändert',
    'link.neu': 'Link erzeugt',
    'link.ein': 'Link eingelöst',
    'export': 'Export gezogen',
    'import': 'Import eingespielt',
    'sicherung': 'Sicherung geschrieben',
    // Seit 0.8.91. Die Zeile nennt, DASS gewechselt wurde, nie WOHIN -- sie
    // traegt weder Ziel noch Merkmal, und der Handelnde ist immer leer:
    // gewechselt wird auf dem Wirt.
    'schluessel': 'Schlüssel gewechselt'
  };
  // Der Status ist der eine Vorgang, dessen Wort am Merkmal haengt: "gesperrt"
  // und "freigegeben" sind zwei verschiedene Aussagen und sollen auch zwei
  // verschiedene Zeilen sein.
  const vorgangsWort = (z) => z.was === 'zugang.status'
    ? (z.merkmal === 'aktiv' ? 'Zugang freigegeben' : 'Zugang gesperrt')
    : (VORGANGSWORT[z.was] || z.was);
  // Was hinter dem Vorgang noch zu sagen ist. Die Rolle beim Rollenwechsel,
  // der Anlass beim Link, die Betriebsart beim Import -- sonst nichts.
  const MERKMALSWORT = {
    user: 'Benutzer', admin: 'Admin', eigentuemer: 'Eigentümer',
    einladung: 'Einladung', ruecksetzung: 'Rücksetzung',
    merge: 'zusammengeführt', replace: 'ersetzend',
    name: 'Name', passwort: 'Passwort', beides: 'Name und Passwort'
  };
  const merkmalsWort = (z) => (z.was === 'zugang.status' ? '' : (MERKMALSWORT[z.merkmal] || ''));

  /* WER GEHANDELT HAT. Eine leere Nummer heisst "über zugang.js auf dem Wirt"
     -- mit genau einer Ausnahme, und die ist am Vorgang zu erkennen: bei einer
     gescheiterten Anmeldung war niemand angemeldet. */
  const protHandelnder = (z) => {
    if (z.wer != null) return verfasserName({ id: z.wer, name: z.werName, geloescht: z.werName == null });
    return z.was === 'anmeldung.fehl' ? '—' : 'über zugang.js auf dem Wirt';
  };
  const protZiel = (z) => {
    if (z.ziel == null) return z.was === 'anmeldung.fehl' ? 'unbekannter Name' : '';
    if (z.ziel === z.wer) return '';
    return verfasserName({ id: z.ziel, name: z.zielName, geloescht: z.zielName == null });
  };

  function zeichneProtokoll(d) {
    const box = document.getElementById('protokoll-liste');
    const fuss = document.getElementById('protokoll-fuss');
    if (!box) return;
    const zeilen = (d && Array.isArray(d.zeilen)) ? d.zeilen : [];
    if (!zeilen.length) {
      box.innerHTML = `<p class="hint">Noch kein Vorgang festgehalten.</p>`;
      if (fuss) fuss.textContent = '';
      return;
    }
    box.innerHTML = '';
    for (const z of zeilen) {
      const zeile = document.createElement('div');
      zeile.className = 'prot-zeile';
      zeile.dataset.was = z.was;
      const wen = protZiel(z), merk = merkmalsWort(z);
      zeile.innerHTML = `<span class="prot-zeit">${esc(fmtDate(z.am))}</span>
        <span class="prot-was">${esc(vorgangsWort(z))}</span>
        <span class="prot-wer">${esc(protHandelnder(z))}</span>
        <span class="prot-ziel">${wen ? '→ ' + esc(wen) : ''}</span>
        <span class="prot-merkmal">${merk ? esc(merk) : ''}</span>`;
      box.appendChild(zeile);
    }
    if (fuss) {
      const gesamt = Number(d.gesamt) || zeilen.length;
      fuss.textContent = gesamt > zeilen.length
        ? `Die ${zeilen.length} jüngsten von ${gesamt} Vorgängen.`
        : `${gesamt} ${gesamt === 1 ? 'Vorgang' : 'Vorgänge'}.`;
    }
  }
  zeichneProtokoll(protokoll);

  // Dateien haben einen eigenen Schalter mit Vorgabe aus: bei 50 MB je Datei
  // waere die Exportdatei sonst schnell unhandlich.
  const mitDateien = () => (document.getElementById('ex-files')?.checked ? '&files=1' : '') +
                           (document.getElementById('ex-videos')?.checked ? '&videos=1' : '');
  /* DER EXPORT BLEIBT EINE NAVIGATION -- die Datei laeuft damit an der Platte
     vorbei statt vollstaendig im Speicher zu stehen. Die zweite Bestaetigung
     steht deshalb DAVOR und nicht darin: sie holt die Freigabe, danach faehrt
     der Browser los. */
  const exportLos = async (mitFotos) => {
    if (!await zweiteBestaetigung('export', null, 'Export bestätigen',
      'Der Export schreibt den gesamten Bestand in eine Datei, die das Haus verlässt — ' +
      'mit allen Fotos, allen Anhängen und den Namen aller Verfasser.')) return;
    window.location = `/api/export?photos=${mitFotos ? 1 : 0}` + mitDateien();
  };
  amElement('ex-yes', b => b.onclick = () => exportLos(true));
  amElement('ex-no', b => b.onclick = () => exportLos(false));

  amElement('imp', imp => imp.onchange = e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) askImport(file);
  });

  /* --- Papierkorb --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde -- dieselbe Bauform
     wie bei den drei Verwaltungskarten. Nach einem Zurueckholen oder einem
     endgueltigen Entfernen holt papierkorbNeu() die Liste noch einmal und
     zeichnet nur DIESE Karte: ein Neuaufbau des ganzen Systembereichs leerte
     die Passwortfelder daneben.
     JEDE LESESTELLE IST ABGEFANGEN: fehlt die Antwort oder ein Feld darin,
     soll die Karte etwas sagen und nicht der Lauf abreissen. */
  async function papierkorbNeu() {
    try { papierkorb = await api('GET', '/api/papierkorb'); }
    catch (e) {
      const box = document.getElementById('mpapierkorb');
      if (box) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`;
      return;
    }
    drawPapierkorb();
  }
  function drawPapierkorb() {
    const box = document.getElementById('mpapierkorb');
    if (!box) return;
    const zeilen = Array.isArray(papierkorb && papierkorb.zeilen) ? papierkorb.zeilen : [];
    box.innerHTML = '';
    if (!zeilen.length) {
      box.innerHTML = `<span class="hint">Keine gelöschten ${esc(V.sacheMehrzahl)}.</span>`;
      return;
    }
    zeilen.forEach(z => {
      const row = document.createElement('div');
      row.className = 'mrow pk';
      row.dataset.pkid = z.id;
      const offen = Number(z.tageOffen);
      const meta = [
        `gelöscht ${fmtDate(z.geloescht_am)} von ${verfasserName(z.loeschender)}`,
        `noch ${offen} ${offen === 1 ? 'Tag' : 'Tage'}`,
        fmtBytes(z.bytes)
      ];
      // Die Knoepfe stehen nur beim Eigentuemer -- der Server verweigert es
      // ohnehin, und ein Knopf, der zuverlaessig eine Fehlermeldung erzeugt,
      // sieht aus wie ein Fehler.
      row.innerHTML = `<span class="mname">${esc(z.titel)}</span>
        ${EIGENTUEMER ? `<button class="mact pk-back" title="Wiederherstellen">↩ Zurückholen</button>
        <button class="mact rm pk-weg" title="Endgültig entfernen">✕</button>` : ''}
        <span class="pk-meta">${esc(meta.join(' · '))}</span>`;
      box.appendChild(row);
      const zurueck = row.querySelector('.pk-back');
      if (zurueck) zurueck.onclick = async () => {
        try {
          const r = await api('POST', `/api/papierkorb/${z.id}/wiederherstellen`);
          // Die unbekannten Verfasser stehen in der Antwort und gehoeren
          // gesagt: sie sind beim Zurueckholen an MICH gefallen.
          const offene = (r && Array.isArray(r.verfasserUnbekannt)) ? r.verfasserUnbekannt : [];
          toast(`„${z.titel}" ist wieder da.` +
            (offene.length ? ` Unbekannte Verfasser mir zugeordnet: ${offene.join(', ')}.` : ''));
          papierkorbNeu();
        } catch (e) { toast(e.message, true); }
      };
      const weg = row.querySelector('.pk-weg');
      if (weg) weg.onclick = async () => {
        if (!await confirmBox('Endgültig entfernen?',
          `„${z.titel}" wird aus dem Papierkorb entfernt. Danach gibt es keinen Rückweg mehr.`,
          'Endgültig entfernen')) return;
        try {
          await api('DELETE', `/api/papierkorb/${z.id}`);
          toast('Endgültig entfernt');
          papierkorbNeu();
        } catch (e) { toast(e.message, true); }
      };
    });
  }
  drawPapierkorb();

  /* --- Sicherung --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde; nach jedem Schreiben
     traegt die Antwort den neuen Stand, und die Karte zeichnet sich daraus neu.
     JEDE LESESTELLE IST ABGEFANGEN: fehlt ein Feld, soll die Karte etwas sagen
     und nicht der Lauf abreissen. */
  function drawSicherung() {
    const box = document.getElementById('sicherung-box');
    if (!box) return;
    const d = sicherung || {};
    if (!d.eingerichtet) {
      box.innerHTML = `<div class="warn-box">${esc(d.grund || 'Es ist kein Sicherungsort eingerichtet.')}</div>`;
      return;
    }
    /* „Letzte Sicherung vor N Tagen" kommt aus dem DATEISYSTEM, nicht aus einem
       Schlüssel in der Datenbank. Der Preis steht hier: ist der Ort nicht
       erreichbar, sagt die Karte GENAU DAS statt einer Zahl — eine Zahl aus
       einem Merker wäre in genau diesem Fall die Lüge. */
    const letzte = d.letzte;
    const stand = d.fehler
      ? `<div class="warn-box" style="margin:0 0 12px">${esc(d.fehler)}</div>`
      : (!d.erreichbar
        ? `<div class="warn-box" style="margin:0 0 12px">Der Zielort ist nicht erreichbar.</div>`
        : (letzte
          ? `<div class="kv"><span class="k">Letzte Sicherung</span><span class="v">vor ${letzte.tageHer} ${letzte.tageHer === 1 ? 'Tag' : 'Tagen'}</span></div>
             <div class="kv"><span class="k">Datei</span><span class="v"><code>${esc(letzte.datei)}</code></span></div>
             <div class="kv"><span class="k">Größe</span><span class="v">${fmtBytes(letzte.bytes)}</span></div>
             <div class="kv"><span class="k">Dateien am Ort</span><span class="v">${d.zahl || 0}${
               d.veraltet ? ` <strong class="sich-alt">· ${d.veraltet} mit dem alten Schlüssel</strong>` : ''}</span></div>`
          : `<p class="desc" style="margin:0 0 12px">An diesem Ort liegt noch keine Sicherung.</p>`));

    /* ZWEI SCHLUESSEL IM UMLAUF — seit 0.8.91. Wurde der Schlüssel gewechselt,
       öffnen sich die Kopien von vorher nur noch mit dem ALTEN. Sie sind nicht
       kaputt; sie brauchen einen anderen Schlüssel als die laufende Anlage.
       DER KASTEN STEHT NUR DA, WENN ER ETWAS ZU SAGEN HAT: ohne Wechsel gibt
       es keine zwei Schlüssel, und eine Warnung, die immer dasteht, liest
       niemand mehr.
       DIE SCHÄRFSTE LAGE BEKOMMT DEN SCHÄRFSTEN SATZ: ist auch die JÜNGSTE
       Kopie älter als der Wechsel, gibt es überhaupt keine, die zur laufenden
       Anlage passt. Das ist etwas anderes als „ein paar alte liegen daneben".
       WO DER ALTE WERT LIEGT, HÄNGT VOM FALL AB — in der `.env` nur dann, wenn
       er von dort kam; im Dateifall steht er nach dem Wechsel nirgends mehr.
       Die Karte weiß das nicht sicher und behauptet es deshalb nicht: sie
       nennt den Weg, der ihn beim Wechsel genannt hat. */
    const wechsel = !d.gewechseltAm ? '' : (
      letzte && letzte.veraltet
        ? `<div class="warn-box" style="margin:0 0 12px"><strong>Keine dieser Kopien passt zum
             heutigen Schlüssel.</strong> Gewechselt wurde am ${esc(fmtDate(d.gewechseltAm))}; auch
             die jüngste Sicherung ist älter. Sie öffnet sich nur mit dem <strong>alten</strong>
             Schlüssel — <code>./schluessel.sh</code> hat ihn beim Wechsel genannt und, wenn er aus
             der <code>.env</code> kam, dort auskommentiert stehen lassen.
             <strong>Sicher jetzt neu</strong>, dann liegt wieder eine Kopie da, die zur laufenden
             Anlage gehört.</div>`
        : (d.veraltet
          ? `<div class="warn-box" style="margin:0 0 12px"><strong>${d.veraltet} ${d.veraltet === 1
               ? 'Kopie stammt' : 'Kopien stammen'} von vor dem Schlüsselwechsel</strong>
               (${esc(fmtDate(d.gewechseltAm))}). ${d.veraltet === 1 ? 'Sie öffnet' : 'Sie öffnen'} sich
               nur mit dem <strong>alten</strong> Schlüssel. <strong>Heb ihn auf</strong> — kam er aus
               der <code>.env</code>, steht er dort auskommentiert; er gehört in den
               Passwortspeicher.</div>`
          : `<div class="ok-box" style="margin:0 0 12px">Der Schlüssel wurde am
               ${esc(fmtDate(d.gewechseltAm))} gewechselt. Alle Kopien an diesem Ort sind
               jünger und passen zum heutigen Schlüssel.</div>`));
    /* ROT ODER GRUEN, und zwar an erster Stelle: die Lage des Sicherungsorts
       ist die Frage, die vor allen anderen steht. Ein Ort im
       Arbeitsverzeichnis ist erlaubt und wird nicht abgewiesen -- er wird
       benannt. Wer hier rot sieht, soll wissen, WARUM, und nicht bloss, DASS.
       Der grüne Fall sagt nicht "alles gut", sondern was daran gut ist:
       sonst liest ihn beim nächsten Umbau niemand mehr. */
    const lage = d.imArbeitsverzeichnis
      ? `<div class="warn-box" id="sich-lage" style="margin:0 0 12px"><strong>Der Sicherungsort liegt im
           Arbeitsverzeichnis.</strong> Dringend empfohlen ist er daneben. Er teilt hier das
           Schicksal des Projektverzeichnisses: beim Einspielen einer neuen Version wird das
           umbenannt, und die Sicherungen wandern mit — der Weg in der README holt sie eigens
           zurück. Ein Fehlgriff am Projektordner nähme Original und Sicherung auf einmal,
           und beide liegen ohnehin auf derselben Platte. Umgestellt wird es in der
           <code>docker-compose.yml</code>; dort steht, wie.</div>`
      : `<div class="ok-box" id="sich-lage" style="margin:0 0 12px">Der Sicherungsort liegt <strong>außerhalb
           des Arbeitsverzeichnisses</strong>. So bleibt er unberührt, wenn das
           Projektverzeichnis beim Einspielen einer neuen Version umbenannt oder ersetzt
           wird.</div>`;
    box.innerHTML = `
      ${lage}
      <div class="field"><label>Zielort</label>
        <p class="desc" style="margin:0 0 6px">Eingerichtet ist <code>${esc(d.wurzel || '')}</code>.
          Darunter lässt sich ein Unterverzeichnis wählen; es muss dort schon liegen —
          angelegt wird keines.</p>
        <input class="input" id="sich-ort" value="${esc(d.ort || '')}" placeholder="(der eingerichtete Ort selbst)"
          autocapitalize="off" spellcheck="false"></div>
      <button class="btn btn-sm" id="sich-ort-save">Zielort speichern</button>
      <div class="sys-teil"></div>
      ${stand}
      ${wechsel}
      <p class="desc" style="margin:0 0 10px">Während die Kopie entsteht, <strong>steht die
        Anlage still</strong> — bei ${fmtBytes(d.dbBytes)} sind das etwa
        ${d.dauerSekunden} Sekunden.</p>
      <button class="btn btn-accent btn-sm" id="sich-los">Jetzt sichern</button>`;

    document.getElementById('sich-ort-save').onclick = async () => {
      const wert = document.getElementById('sich-ort').value;
      try {
        const r = await api('PUT', '/api/sicherung/ort', { ort: wert });
        // gewechseltAm und veraltet wandern MIT: ohne sie verschwaende der
        // Kasten ueber die alten Sicherungen beim ersten Speichern des
        // Zielorts, und die Karte saehe danach harmloser aus als die Lage ist.
        sicherung = { ...sicherung, ort: r.ort, pfad: r.pfad, fehler: null,
                      erreichbar: r.erreichbar, letzte: r.letzte, zahl: r.zahl,
                      gewechseltAm: r.gewechseltAm, veraltet: r.veraltet };
        toast('Zielort gespeichert');
        drawSicherung();
      } catch (e) { toast(e.message, true); }
    };
    /* Der Knopf sperrt sich selbst, solange die Kopie entsteht: VACUUM INTO
       laeuft synchron, die Anlage steht so lange still, und ein zweiter Klick
       stellte sich nur in die Schlange. */
    document.getElementById('sich-los').onclick = async (e) => {
      const knopf = e.currentTarget;
      knopf.disabled = true;
      knopf.textContent = 'Sicherung läuft …';
      try {
        const r = await api('POST', '/api/sicherung');
        sicherung = { ...sicherung, erreichbar: r.erreichbar, letzte: r.letzte, zahl: r.zahl,
                      gewechseltAm: r.gewechseltAm, veraltet: r.veraltet };
        toast(`Sicherung geschrieben: ${r.datei} (${fmtBytes(r.bytes)})`);
        drawSicherung();
      } catch (err) {
        toast(err.message, true);
        knopf.disabled = false;
        knopf.textContent = 'Jetzt sichern';
      }
    };
  }
  drawSicherung();

  /* --- Schriftgröße --- */
  function drawSchrift() {
    const box = document.getElementById('fsize');
    box.innerHTML = '';
    SCHRIFT_STUFEN.forEach(stufe => {
      const b = document.createElement('button');
      b.className = 'pill' + (SCHRIFT === stufe ? ' on' : '');
      b.textContent = stufe + ' %';
      b.onclick = async () => {
        const vorher = SCHRIFT;
        SCHRIFT = stufe;
        wendeSchriftAn();          // sofort sichtbar, auch wenn das Speichern scheitert
        drawSchrift();
        try { await api('PUT', '/api/settings', { schrift: stufe }); toast('Schriftgröße gespeichert'); }
        catch (e) { SCHRIFT = vorher; wendeSchriftAn(); drawSchrift(); toast(e.message, true); }
      };
      box.appendChild(b);
    });
  }
  drawSchrift();

  /* --- Sichtbare Linkzeilen --- */
  function drawLinkZeilen() {
    const box = document.getElementById('lzeilen');
    box.innerHTML = '';
    LINKZEILEN_STUFEN.forEach(n => {
      const b2 = document.createElement('button');
      b2.className = 'pill' + (LINKZEILEN === n ? ' on' : '');
      b2.textContent = n + ' Zeilen';
      b2.onclick = async () => {
        const vorher = LINKZEILEN;
        LINKZEILEN = n;
        drawLinkZeilen();
        try { await api('PUT', '/api/settings', { linkZeilen: n }); toast('Gespeichert'); }
        catch (e) { LINKZEILEN = vorher; drawLinkZeilen(); toast(e.message, true); }
      };
      box.appendChild(b2);
    });
  }
  drawLinkZeilen();

  /* --- Suchanbieter --- */
  // Der Vorrat als Liste von Schluesseln, Standard zuerst -- dieselbe Form,
  // in der der Server sie speichert. Zurueck kommt immer der aufgeraeumte
  // Zustand; gezeichnet wird daraus, nicht aus der eigenen Annahme.
  const vorratListe = () => {
    const std = SUCHANBIETER.find(a => a.aktiv && a.standard);
    const rest = SUCHANBIETER.filter(a => a.aktiv && a !== std).map(a => a.schluessel);
    return std ? [std.schluessel, ...rest] : rest;
  };

  async function sendeAnbieter(koerper, meldung) {
    try {
      const s = await api('PUT', '/api/settings', koerper);
      if (Array.isArray(s.suchAnbieter)) SUCHANBIETER = s.suchAnbieter;
      drawAnbieter(); drawEigene();
      toast(meldung);
    } catch (e) { drawAnbieter(); drawEigene(); toast(e.message, true); }
  }

  function drawAnbieter() {
    const box = document.getElementById('sanbieter');
    if (!box) return;
    box.innerHTML = '';
    SUCHANBIETER.forEach(a => {
      const zeile = document.createElement('div');
      zeile.className = 'sanb' + (a.vorhanden ? '' : ' leer');
      zeile.dataset.k = a.schluessel;
      const hk = document.createElement('input');
      hk.type = 'checkbox';
      hk.checked = !!a.aktiv;
      hk.disabled = !a.vorhanden;
      hk.title = 'In die Auswahl aufnehmen';
      hk.onchange = () => {
        const keys = vorratListe();
        sendeAnbieter({ sucheAktiv: hk.checked ? [...keys, a.schluessel] : keys.filter(k => k !== a.schluessel) },
          'Auswahl gespeichert');
      };
      const st = document.createElement('button');
      st.type = 'button';
      st.className = 'sstart' + (a.standard ? ' on' : '');
      st.textContent = 'Start';
      st.disabled = !a.vorhanden;
      st.title = 'Ziel des Zeilenklicks';
      // Start nimmt zugleich in die Auswahl auf: ein Startanbieter ausserhalb
      // des Vorrats ist ein Zustand, den es nicht geben darf.
      st.onclick = () => sendeAnbieter(
        { sucheAktiv: [a.schluessel, ...vorratListe().filter(k => k !== a.schluessel)] },
        'Startanbieter gespeichert');
      // Der Name kommt aus dem Verwaltungsbereich und ist freier Text --
      // textContent statt innerHTML, damit Maskierung nicht vergessbar ist.
      const nm = document.createElement('span');
      nm.className = 'sanb-name';
      nm.textContent = a.vorhanden ? a.name : '—';
      zeile.append(hk, st, nm);
      box.appendChild(zeile);
    });
  }

  function drawEigene() {
    const box = document.getElementById('seigene');
    if (!box) return;
    box.innerHTML = '';
    SUCHANBIETER.filter(a => a.eigen).forEach((a, i) => {
      const zeile = document.createElement('div');
      zeile.className = 'sanb-slot';
      const nm = document.createElement('input');
      nm.className = 'input input-sm'; nm.id = `se-name-${i + 1}`;
      nm.maxLength = 20; nm.placeholder = 'Name'; nm.value = a.name || '';
      const vl = document.createElement('input');
      vl.className = 'input input-sm'; vl.id = `se-vorlage-${i + 1}`;
      vl.maxLength = 300; vl.placeholder = 'https://forum.beispiel.de/suche?q=%s';
      vl.value = a.vorlage || '';
      const b3 = document.createElement('button');
      b3.className = 'btn btn-sm'; b3.id = `se-b-${i + 1}`;
      b3.textContent = 'Übernehmen';
      b3.onclick = () => sendeEigene();
      zeile.append(nm, vl, b3);
      box.appendChild(zeile);
    });
  }

  // Immer alle drei Plaetze auf einmal: der Server bekommt den ganzen Stand
  // und raeumt danach den Vorrat auf, falls ein Platz geleert wurde.
  function sendeEigene() {
    const liste = [1, 2, 3].map(i => ({
      name: document.getElementById(`se-name-${i}`)?.value || '',
      vorlage: document.getElementById(`se-vorlage-${i}`)?.value || ''
    }));
    return sendeAnbieter({ sucheEigene: liste }, 'Eigene Suchanbieter gespeichert');
  }

  function drawSuchNamen() {
    const box = document.getElementById('snamen');
    if (!box) return;
    box.innerHTML = '';
    SUCHNAMEN_STUFEN.forEach(n => {
      const b3 = document.createElement('button');
      b3.className = 'pill' + (SUCHNAMEN === n ? ' on' : '');
      b3.textContent = n === 1 ? '1 Name' : `${n} Namen`;
      b3.onclick = async () => {
        const vorher = SUCHNAMEN;
        SUCHNAMEN = n;
        drawSuchNamen();
        try { await api('PUT', '/api/settings', { suchNamen: n }); toast('Gespeichert'); }
        catch (e) { SUCHNAMEN = vorher; drawSuchNamen(); toast(e.message, true); }
      };
      box.appendChild(b3);
    });
  }

  drawAnbieter(); drawEigene(); drawSuchNamen();

  /* --- Zeitleiste --- */
  const zl = document.getElementById('zlan');
  zl.checked = ZEITLEISTE_AN;
  zl.onchange = async () => {
    const vorher = ZEITLEISTE_AN;
    ZEITLEISTE_AN = zl.checked;
    try { await api('PUT', '/api/settings', { zeitleiste: ZEITLEISTE_AN }); toast('Gespeichert'); }
    catch (e) { ZEITLEISTE_AN = vorher; zl.checked = vorher; toast(e.message, true); }
  };

  /* --- Die beiden Anlegen-Schalter ---
     Nur der Admin bekommt sie zu sehen; ein Haken, der zuverlaessig 403
     erzeugt, saehe aus wie ein Fehler. EIN Helfer fuer beide: zwei
     gleichlautende Bloecke nebeneinander liefen frueher oder spaeter
     auseinander. Schlaegt das Speichern fehl, geht die Stellung zurueck --
     sonst zeigte der Bildschirm etwas anderes an als der Server haelt. */
  const anlegeSchalter = (id, schluessel, lies, merke) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = lies();
    el.onchange = async () => {
      const vorher = lies();
      merke(el.checked);
      try { await api('PUT', '/api/settings', { [schluessel]: el.checked }); toast('Gespeichert'); }
      catch (e) { merke(vorher); el.checked = vorher; toast(e.message, true); }
    };
  };
  anlegeSchalter('tagfrei', 'tagsFreiAnlegen', () => TAGS_FREI, v => { TAGS_FREI = v; });
  anlegeSchalter('katfrei', 'kategorienFreiAnlegen', () => KATEGORIEN_FREI, v => { KATEGORIEN_FREI = v; });

  amElement('breset', breset => breset.onclick = async () => {
    if (!await confirmBox('Standardanordnung wiederherstellen?',
      'Die Blöcke der Detailansicht kehren in ihre Ausgangsreihenfolge zurück, alle eingeklappten werden wieder geöffnet.',
      'Wiederherstellen')) return;
    BLOECKE = { seite: [...BLOCK_VORGABE.seite], unten: [...BLOCK_VORGABE.unten], zu: [] };
    try { await api('PUT', '/api/settings', { bloecke: BLOECKE }); toast('Standardanordnung wiederhergestellt'); }
    catch (e) { toast(e.message, true); }
  });

  /* --- Vokabular --- */
  // Die Probe zeigt dieselben Textbausteine, die die Oberfläche später
  // benutzt — damit sich Einzahl und Mehrzahl vor dem Speichern prüfen lassen.
  const vFelder = () => ({
    sacheEinzahl: document.getElementById('v1').value,
    sacheMehrzahl: document.getElementById('v2').value,
    merkmalJa: document.getElementById('v3').value,
    merkmalNein: document.getElementById('v4').value,
    zeitpunktEinzahl: document.getElementById('v5').value,
    zeitpunktMehrzahl: document.getElementById('v6').value,
    berichtEinzahl: document.getElementById('v7').value,
    berichtMehrzahl: document.getElementById('v8').value,
    aufgabeEinzahl: document.getElementById('v9').value,
    aufgabeMehrzahl: document.getElementById('v10').value,
    aufgabeErledigt: document.getElementById('v11').value
  });
  function drawProbe() {
    const w = vFelder();
    const s1 = w.sacheEinzahl.trim() || V.sacheEinzahl;
    const sm = w.sacheMehrzahl.trim() || V.sacheMehrzahl;
    const z1 = w.zeitpunktEinzahl.trim() || V.zeitpunktEinzahl;
    const zm = w.zeitpunktMehrzahl.trim() || V.zeitpunktMehrzahl;
    const ja = w.merkmalJa.trim() || V.merkmalJa;
    const nein = w.merkmalNein.trim() || V.merkmalNein;
    const b1 = w.berichtEinzahl.trim() || V.berichtEinzahl;
    const bm = w.berichtMehrzahl.trim() || V.berichtMehrzahl;
    const a1 = w.aufgabeEinzahl.trim() || V.aufgabeEinzahl;
    const am = w.aufgabeMehrzahl.trim() || V.aufgabeMehrzahl;
    const ae = w.aufgabeErledigt.trim() || V.aufgabeErledigt;
    document.getElementById('vprobe').innerHTML =
      `<span class="label">Probe</span>
       <span>+ ${esc(s1)}</span><span>${esc(s1)} löschen?</span><span>7 ${esc(sm)}</span>
       <span>${esc(ja)} / ${esc(nein)}</span>
       <span>1 ${esc(z1)}</span><span>3 ${esc(zm)}</span>
       <span>Als ${esc(b1)} markieren</span><span>2 ${esc(bm)}</span>
       <span>Als ${esc(a1)} markieren</span><span>4 ${esc(am)}</span>
       <span>Auf „${esc(ae)}" setzen</span>`;
  }
  // Die Karte steht nur dem Admin offen; ohne sie gibt es weder Felder noch
  // Probe. Das VOKABULAR SELBST wird trotzdem ausgeliefert -- es ist jede
  // Beschriftung der Oberflaeche. Was hier fehlt, ist die Karte, nicht der Wert.
  ['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11'].forEach(id =>
    amElement(id, feld => feld.addEventListener('input', drawProbe)));
  if (document.getElementById('vprobe')) drawProbe();

  amElement('vsave', vsave => vsave.onclick = async () => {
    try {
      const r = await api('PUT', '/api/settings', { vokabular: vFelder() });
      V = { ...V, ...r.vokabular };
      toast('Vokabular gespeichert');
      renderSystem();          // leere Felder kommen mit der Vorgabe zurück
    } catch (e) { toast(e.message, true); }
  });
  amElement('vreset', vreset => vreset.onclick = async () => {
    if (!await confirmBox('Vorgaben wiederherstellen?',
      'Die elf Wörter werden auf Eintrag/Einträge, Getestet/Ungetestet, Testtag/Testtage, Bericht/Berichte, Aufgabe/Aufgaben und Erledigt zurückgesetzt.',
      'Zurücksetzen')) return;
    try {
      const leer = { sacheEinzahl: '', sacheMehrzahl: '', merkmalJa: '',
                     merkmalNein: '', zeitpunktEinzahl: '', zeitpunktMehrzahl: '',
                     berichtEinzahl: '', berichtMehrzahl: '',
                     aufgabeEinzahl: '', aufgabeMehrzahl: '', aufgabeErledigt: '' };
      const r = await api('PUT', '/api/settings', { vokabular: leer });
      V = { ...V, ...r.vokabular };
      toast('Vorgaben wiederhergestellt');
      renderSystem();
    } catch (e) { toast(e.message, true); }
  });

  /* --- Kategorien, Tags und Kriterien verwalten --- */
  // Dieselbe Liste fuer alle drei. Kriterien haben zusaetzlich einen Griff,
  // weil bei ihnen die Reihenfolge etwas bedeutet.
  const KIND = {
    cat: {
      url: '/api/product-categories', frage: 'Kategorie löschen?',
      warnung: e => `Die Kategorie „${e.name}" wird entfernt. Betroffen: ${e.usage_count} ${vSache(e.usage_count)} — dort fehlt danach nur die Zuordnung.`
    },
    tag: {
      url: '/api/tags', frage: 'Tag löschen?',
      // Beide Verwendungen nennen: sonst wird ein scheinbar ungenutzter Tag
      // entfernt und reisst die Kennzeichnungen an den Testtagen mit.
      zaehler: e => `${e.usage_count} ${vSache(e.usage_count)} · ${e.test_usage_count} ${vZeit(e.test_usage_count)}`,
      warnung: e => `Der Tag „${e.name}" wird überall entfernt. Betroffen: ` +
        `${e.usage_count} ${vSache(e.usage_count)} und ${e.test_usage_count} ${vZeit(e.test_usage_count)}` +
        `${e.test_usage_count ? ' — auch die Kennzeichnungen dort verschwinden.' : '.'}`
    },
    crit: {
      url: '/api/criteria', frage: 'Kriterium löschen?', sortierbar: true,
      // DAS GEWICHTSFELD GEHOERT ALLEIN HIERHER. manage() zeichnet dieselbe
      // Zeile auch fuer Kategorien und Tags, und dort gibt es kein Gewicht --
      // ein Kriterium wiegt im Gesamtschnitt, eine Kategorie rechnet nirgends
      // mit. Die Unterscheidung laeuft ueber diesen Eintrag, wie schon bei
      // `sortierbar` und `zaehler`, und nicht ueber eine Abfrage auf den
      // Kartennamen.
      gewicht: true,
      warnung: e => `„${e.name}" wird überall entfernt, samt vergebener Sterne.`
    }
  };

  function manage(boxId, list, kind) {
    const box = document.getElementById(boxId);
    const art = KIND[kind];
    // Umbenennen und Loeschen gehoeren dem Admin -- bei allen dreien, und bei
    // den Kriterien auch das Sortieren. Fuer andere bleibt die Karte eine
    // LISTE: kein Griff, kein ✎, kein ✕ und kein Anlegefeld. Der Server
    // verweigert es ohnehin; ein Knopf, der eine Fehlermeldung erzeugt, sieht
    // aber aus wie ein Fehler.
    // DIE KARTE SELBST BLEIBT STEHEN, alle drei. Wer nicht verwalten darf,
    // darf trotzdem nachsehen, was es gibt -- die Namen sind die Auswahl, aus
    // der jeder am Eintrag schoepft.
    const darf = ADMIN;
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = `<span class="hint">Noch nichts angelegt.</span>`; return; }
    list.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'mrow' + (art.sortierbar && darf ? ' drag' : '');
      row.dataset.mid = entry.id;
      const url = art.url;
      /* Die Zeile war schon besetzt: Griff, Name, Verwendungszaehler, ✎ und ✕.
         Das Gewichtsfeld steht ZWISCHEN Name und Zaehler -- der Name traegt
         flex:1 und schiebt alles Weitere nach rechts, das Feld sitzt damit an
         der Kante zwischen Beschriftung und Kennzahlen. Rechts der Knoepfe
         waere es zwischen zwei Aktionen geraten, obwohl es keine ist.
         WER NICHT VERWALTEN DARF, SIEHT DAS GEWICHT TROTZDEM -- es erklaert
         die Kopfzahl an jedem Eintrag, und die sieht er ja auch. Nur als Text
         statt als Feld, wie bei Name und Zaehler daneben. */
      const gewFeld = art.gewicht
        ? (darf
          ? `<span class="mgew" title="Gewicht im Gesamtschnitt">×<input class="mgew-feld"
               type="text" inputmode="decimal" list="gewichtsug" aria-label="Gewicht"
               value="${esc(gewichtText(entry.gewicht))}"></span>`
          : `<span class="mgew mgew-fest" title="Gewicht im Gesamtschnitt">×${esc(gewichtText(entry.gewicht))}</span>`)
        : '';
      row.innerHTML = `${art.sortierbar && darf ? `<span class="grip" title="Zum Sortieren ziehen">⣿</span>` : ''}
        <span class="mname">${esc(entry.name)}</span>
        ${gewFeld}
        <span class="mcount">${esc(art.zaehler ? art.zaehler(entry) : `${entry.usage_count} ${vSache(entry.usage_count)}`)}</span>
        ${darf ? `<button class="mact ed" title="Umbenennen">✎</button>
        <button class="mact rm" title="Löschen">✕</button>` : ''}`;
      if (!darf) { box.appendChild(row); return; }
      if (art.sortierbar) {
        // Ziehen wie bei Fotos und Links: Pointer-Events, gleiche Schwelle.
        // Die Knoepfe und das Umbenennfeld bleiben ausgenommen.
        makeSortable(row, {
          axis: 'y', selector: '.mrow', ignore: '.mact, input',
          onDrop: async (children) => {
            try {
              await api('PUT', '/api/criteria/order', { order: children.map(c => +c.dataset.mid) });
              toast('Reihenfolge gespeichert');
              refresh();
            } catch (e) { toast(e.message, true); refresh(); }
          }
        });
      }
      /* NACH EINEM GEWICHTSWECHSEL WIRD DIE LISTE NICHT NEU GEZEICHNET. Das
         ist der Unterschied zum Umbenennen: dort MUSS neu gezeichnet werden,
         weil das ✎ den Namen durch ein Eingabefeld ERSETZT hat und der Zustand
         zurueckgebaut gehoert. Ein Gewichtswechsel ersetzt nichts -- das Feld
         steht dauerhaft da und traegt den neuen Wert bereits. Ein refresh()
         waere hier nicht nur ueberfluessig, sondern schaedlich: ist an
         derselben Zeile gerade ein Umbenennen offen, risse der Neuaufbau es
         weg. Der Verwendungszaehler daneben aendert sich durch ein Gewicht
         ohnehin nicht. */
      const gewEingabe = row.querySelector('.mgew-feld');
      if (gewEingabe) gewEingabe.onchange = async () => {
        const g = gewichtAusText(gewEingabe.value);
        // Ein leeres oder unlesbares Feld schickt GAR NICHTS: wer den Inhalt
        // loescht und wegklickt, hat es sich anders ueberlegt und meint nicht
        // "Gewicht 0".
        if (Number.isNaN(g)) { gewEingabe.value = gewichtText(entry.gewicht); return; }
        try {
          const nun = await api('PUT', `${url}/${entry.id}`, { name: entry.name, gewicht: g });
          // Den Datensatz IN DER LISTE nachziehen statt neu zu laden -- sonst
          // zeigte die naechste Zeichnung wieder den alten Wert.
          entry.gewicht = nun.gewicht;
          // Zeigt die Rundung mit: 1,234 steht danach als 1,23 im Feld. Die
          // Rundung ist damit nicht still.
          gewEingabe.value = gewichtText(nun.gewicht);
          toast('Gewicht gespeichert');
        } catch (e) {
          toast(e.message, true);
          // Kein Wert im Feld, der nicht gespeichert ist.
          gewEingabe.value = gewichtText(entry.gewicht);
        }
      };
      row.querySelector('.ed').onclick = () => {
        const inp = document.createElement('input');
        inp.className = 'medit'; inp.value = entry.name;
        row.querySelector('.mname').replaceWith(inp);
        inp.focus(); inp.select();
        const save = async () => {
          const name = inp.value.trim();
          if (!name || name === entry.name) return refresh();
          try { await api('PUT', `${url}/${entry.id}`, { name }); toast('Umbenannt'); refresh(); }
          catch (e) { toast(e.message, true); refresh(); }
        };
        inp.onblur = save;
        inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') refresh(); };
      };
      row.querySelector('.rm').onclick = async () => {
        if (!await confirmBox(art.frage, art.warnung(entry))) return;
        try { await api('DELETE', `${url}/${entry.id}`); toast('Gelöscht'); refresh(); }
        catch (e) { toast(e.message, true); }
      };
      box.appendChild(row);
    });
  }
  function drawManage() {
    manage('mcats', cats, 'cat');
    manage('mtags', tags, 'tag');
    manage('mcrits', crits, 'crit');
  }
  async function refresh() {
    [cats, tags, crits] = await Promise.all([
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria')
    ]);
    drawManage();
  }
  drawManage();

  /* --- Zugaenge ---
     Was ein Zugang mit sich machen laesst, entscheidet der Server. Die
     Oberflaeche zeigt nur, was dort auch durchkaeme -- ein Knopf, der
     zuverlaessig eine Fehlermeldung erzeugt, sieht aus wie ein Fehler.
     Dieselbe Ueberlegung wie bei der Kriterienkarte. */
  const ROLLENWORT = { user: 'Benutzer', admin: 'Admin', eigentuemer: 'Eigentümer' };
  const STATUSWORT = { aktiv: 'aktiv', gesperrt: 'gesperrt', geloescht: 'gelöscht' };

  /* DIE VOLLSTÄNDIGE ADRESSE BAUT DER BROWSER, nicht der Server. Der Server
     hinter einem Proxy weiß nicht, wie er von außen heißt, und aus dem
     Host-Kopf darf er es nicht ableiten — über einen gefälschten Kopf ließe
     sich ein Link sonst auf einen fremden Server umbiegen. Der Browser des
     Admins steht bereits an der richtigen Adresse. */
  const baueEinladungsAdresse = (schluessel) =>
    `${location.origin}${location.pathname}#/einladung/${schluessel}`;

  /* WER DEN LINK KOPIERT, MUSS AN DIESER STELLE LESEN, WAS ER IN DER HAND
     HÄLT. Der Weitergabeweg ist der Admin selbst — mündlich, per Zettel, per
     Messenger. Damit ist der Link ein Passwortersatz auf Zeit und steht nach
     der Weitergabe in einem fremden Verlauf. Das gehört an den Bildschirm und
     nicht bloß in ein Dokument. */
  /* WOHER DIE ADRESSE KAM, GEHOERT AN DIE STELLE, AN DER DER LINK ENTSTEHT.
     Wer den falschen Fall vor sich hat, soll ihn an dieser Zeile erkennen und
     nicht am toten Link beim Empfaenger. Die Einstellung selbst wird hier nur
     GEZEIGT und nicht gesetzt -- sie steht in der .env, aus demselben Grund
     wie HINTER_PROXY. */
  const linkHerkunft = (d) => d.linkQuelle === 'einstellung'
    ? 'aus der Einstellung <code>OEFFENTLICHE_ADRESSE</code>'
    : 'aus deinem Browser';

  /* WAS DER VERSAND GEMACHT HAT, STEHT NEBEN DEM LINK UND NICHT ANSTELLE VON
     IHM. Das ist die sichtbare Hälfte des Satzes, der über der ganzen Stufe
     steht: E-Mail ist eine Bequemlichkeit, keine Voraussetzung. Schlägt der
     Versand fehl, bricht nichts ab — der Link steht da wie immer, und
     daneben steht, warum nichts hinausging.
     DREI ZUSTÄNDE, DREI FARBEN, und der Grund wird MITGENANNT: „aus“ allein
     deckt drei verschiedene Lagen ab, und ohne den Grund wüsste niemand,
     welche davon gerade gilt. */
  const versandZeile = (d) => {
    /* DIE ADRESSE STEHT HIER NICHT, und das ist kein Versehen: an einem
       BESTEHENDEN Zugang hat sie der Betroffene selbst eingetragen, und ein
       Admin bekommt fremde Postfächer nicht zu sehen — GET /api/users liefert
       sie aus demselben Grund nicht mit. Was der Admin wissen muss, ist, DASS
       die Mail hinausging. */
    if (d.versand === 'ok')
      return `<p class="zug-versand zug-versand-ok">Die Mail ist an die hinterlegte Adresse
        hinausgegangen. Der Link steht trotzdem hier — falls sie nicht ankommt.</p>`;
    if (d.versand === 'fehlgeschlagen')
      return `<p class="zug-versand zug-versand-fehl"><strong>Versand fehlgeschlagen</strong> —
        ${esc(d.versandGrund || 'ohne Angabe')}. Gib den Link von Hand weiter.</p>`;
    if (d.versand === 'aus')
      return `<p class="zug-versand">Es wurde keine Mail verschickt: ${esc(d.versandGrund || '')}
        Gib den Link von Hand weiter.</p>`;
    return '';
  };

  /* EINE FUNKTION, ZWEI RUFER seit 0.9.1 -- das Anlegen in der Karte
     "Zugaenge" und das Freischalten in der Karte "Anfragen". Der Link ist in
     beiden Faellen derselbe Gegenstand mit derselben Warnung daneben; zwei
     Ausfertigungen liefen beim naechsten Satz auseinander. */
  function zeigeLink(d, kasten = 'zug-link') {
    const box = document.getElementById(kasten);
    if (!box || !d || !d.token) return;
    /* DER ANDERE KASTEN WIRD GELEERT, und das ist keine Aufraeumarbeit: die
       Kennungen darin sind feste Namen, und zwei Kaesten nebeneinander
       ergaeben sie doppelt -- getElementById naehme dann den ersten, und der
       Knopf "Kopieren" kopierte den falschen Link. Es steht immer hoechstens
       EIN Link am Bildschirm, und das ist ohnehin richtig so. */
    for (const anderer of ['zug-link', 'anf-link']) {
      if (anderer !== kasten) {
        const k = document.getElementById(anderer);
        if (k) k.innerHTML = '';
      }
    }
    // Der Server gibt den fertigen Link nur heraus, wenn die Einstellung steht.
    // Sonst baut ihn der Browser wie bisher.
    const adresse = d.link || baueEinladungsAdresse(d.token);
    box.innerHTML = `<div class="warn-box zug-linkbox" style="margin:12px 0 0">
      <strong>${d.zweck === 'ruecksetzung' ? 'Link zum Zurücksetzen' : 'Einladungslink'}
      für „${esc(d.username || '')}“ — er wird nur dieses eine Mal angezeigt.</strong>
      Er ist bis dahin ein <strong>Passwortersatz</strong>: wer ihn hat, kommt herein und setzt
      das Passwort. Er gilt <strong>${d.tage || 7} Tage</strong> und <strong>genau einmal</strong>;
      ab dem ersten Öffnen bleiben <strong>${d.minuten || 15} Minuten</strong>, um das Passwort
      zu setzen.
      Nach der Weitergabe steht er in einem fremden Verlauf — gib ihn nur dem, für den er ist.
      <div class="zug-linkzeile"><input class="input input-sm" id="zug-link-feld" readonly
        value="${esc(adresse)}"><button class="btn btn-sm" id="zug-link-kopie">Kopieren</button></div>
      <p class="zug-linkherkunft" id="zug-link-herkunft">Dieser Link zeigt auf
        <code>${esc(new URL(adresse).origin)}</code> — <strong>${linkHerkunft(d)}</strong>.</p>
      ${versandZeile(d)}
    </div>`;
    const feld = document.getElementById('zug-link-feld');
    feld.focus(); feld.select();
    document.getElementById('zug-link-kopie').onclick = () => {
      feld.select();
      // Die Zwischenablage über das Skript ist nicht überall erlaubt; das
      // markierte Feld daneben ist der Weg, der immer trägt.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(adresse).then(() => toast('Link kopiert'),
          () => toast('Bitte von Hand kopieren — der Link ist markiert.', true));
      } else toast('Bitte von Hand kopieren — der Link ist markiert.', true);
    };
  }

  /* Die Warteschlange der Selbstanmeldung, seit 0.9.1. DIESELBE BAUFORM WIE
     zeichneZugaenge(): die Liste kommt vom Server, wird nach jeder Handlung
     neu gezeichnet, und was nach dem await gebraucht wird, wird vorher geholt.
     DIE ANTWORT DER HANDLUNG TRAEGT DIE NEUE LISTE MIT -- die Karte zeichnet
     sich daraus neu und fragt nicht ein zweites Mal nach. Ein Mock, der auf
     ein Loeschen zwar "ok" sagt, aber dieselbe Liste zurueckgibt, faellt damit
     auf (Stolperstein 90). */
  function zeichneAnfragen(stand) {
    const box = document.getElementById('manfragen');
    if (!box || !stand) return;
    const dok = box.ownerDocument;
    const zustand = document.getElementById('anf-zustand');
    if (zustand) zustand.innerHTML = stand.an
      ? '<strong class="mail-gut">an</strong>' : '<strong class="mail-aus">aus</strong>';
    const belegt = document.getElementById('anf-belegt');
    if (belegt) belegt.textContent = `${stand.belegt} von höchstens ${stand.deckel}`;
    const schalter = document.getElementById('anf-schalter');
    if (schalter) {
      schalter.textContent = stand.an ? 'Selbstanmeldung ausschalten' : 'Selbstanmeldung einschalten';
      schalter.disabled = !stand.an && !stand.versandBereit;
    }
    box.innerHTML = '';
    if (!stand.anfragen.length) {
      /* KURZ, ABER NICHT STUMM: wer die Karte ansieht, soll den Unterschied
         zwischen „es liegt nichts vor" und „hier fehlt etwas" sehen. */
      box.innerHTML = stand.an
        ? '<span class="hint">Zurzeit liegt keine bestätigte Anfrage vor.</span>'
        : '';
      return;
    }
    for (const a of stand.anfragen) {
      const row = dok.createElement('div');
      row.className = 'mrow zug';
      row.dataset.mid = a.id;
      /* NAME UND ADRESSE STEHEN HIER, und sie sind Freitext von aussen --
         deshalb geht jedes Feld durch esc(). Es ist die einzige Stelle im
         Systembereich, an der etwas steht, das ein Fremder getippt hat. */
      row.innerHTML = `<span class="mname">${esc(a.username)}</span>
        <span class="zug-rolle">${esc(a.email)}</span>
        <span class="zug-status">gefragt ${esc(fmtDate(a.created_at))}</span>
        <span class="mcount">bestätigt ${esc(fmtDate(a.bestaetigt_am))}</span>`;
      const werkzeug = dok.createElement('span');
      werkzeug.className = 'zug-akt';
      werkzeug.innerHTML =
        `<button class="mact anf-frei" title="Freischalten — legt einen Zugang an">✓</button>
         <button class="mact rm anf-ab" title="Ablehnen — entfernt die Anfrage">✕</button>`;
      row.appendChild(werkzeug);
      werkzeug.querySelector('.anf-frei').onclick = async () => {
        if (!confirm(`„${a.username}“ freischalten? Es entsteht ein Zugang mit der Rolle ` +
          `„Benutzer“, und der Einladungslink geht an ${a.email}.`)) return;
        try {
          const d = await api('POST', `/api/anfragen/${a.id}/frei`);
          toast('Freigeschaltet — der Link steht unten');
          zeigeLink(d, 'anf-link');
          zeichneAnfragen(d);
          zeichneZugaenge();
        } catch (e) { toast(e.message, true); }
      };
      werkzeug.querySelector('.anf-ab').onclick = async () => {
        if (!confirm(`Anfrage von „${a.username}“ ablehnen? Die Zeile wird entfernt; ` +
          `es entsteht kein Zugang, und es geht keine Nachricht hinaus.`)) return;
        try {
          const d = await api('DELETE', `/api/anfragen/${a.id}`);
          toast('Anfrage abgelehnt');
          zeichneAnfragen(d);
        } catch (e) { toast(e.message, true); }
      };
      box.appendChild(row);
    }
  }
  if (anfragen) zeichneAnfragen(anfragen);
  const anfSchalter = document.getElementById('anf-schalter');
  if (anfSchalter) anfSchalter.onclick = async () => {
    // Vor dem await lesen: danach steht am Knopf schon der andere Text.
    const neu = !(anfragen && anfragen.an);
    try {
      const d = await api('PUT', '/api/registrierung/schalter', { an: neu });
      anfragen = d;
      toast(neu ? 'Selbstanmeldung eingeschaltet' : 'Selbstanmeldung ausgeschaltet');
      zeichneAnfragen(d);
      const kaputt = document.getElementById('anf-kaputt');
      if (kaputt && (!d.an || d.versandBereit)) kaputt.remove();
    } catch (e) { toast(e.message, true); }
  };

  async function zeichneZugaenge() {
    const box = document.getElementById('mzugaenge');
    if (!box) return;
    /* Was nach dem await gebraucht wird, wird VORHER geholt -- dieselbe Regel
       wie bei e.currentTarget, nur eine Ebene hoeher: hier
       ist es `document` selbst. Wechselt die Ansicht, waehrend die Liste noch
       unterwegs ist, zeichnete der Rest in eine Seite, die es nicht mehr gibt.
       ownerDocument haengt am Knoten und ueberlebt das; isConnected sagt, ob
       er ueberhaupt noch in der Seite steht. */
    const dok = box.ownerDocument;
    let daten;
    try { daten = await api('GET', '/api/users'); }
    catch (e) { if (box.isConnected) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`; return; }
    if (!box.isConnected) return;
    box.innerHTML = '';
    for (const z of daten.zugaenge) {
      const grabstein = z.status === 'geloescht';
      const selbst = z.id === daten.ich;
      // Genau die Regel des Servers, einmal hier: an einen Admin oder den
      // Eigentuemer kommt nur der Eigentuemer.
      const darf = !grabstein && !selbst && (z.role === 'user' ? true : daten.darfRollen);
      const row = dok.createElement('div');
      row.className = 'mrow zug' + (grabstein ? ' zug-weg' : '') + (z.status === 'gesperrt' ? ' zug-sperr' : '');
      row.dataset.mid = z.id;
      // Dieselbe Beschriftung wie an jedem Beitrag im Eintrag -- eine
      // Funktion, zwei Rufer. Stuende die Bildung des Grabsteinnamens hier ein
      // zweites Mal, liefen die beiden Stellen auseinander.
      /* "Noch kein Passwort" steht NICHT als vierter Zustand in der Datenbank:
         ZUSTAENDE hat drei, und jede Stelle, die status liest, kennt sie. Es
         ist abgeleitet aus dem leeren Hash — genau dem Wert, über den auch die
         Anmeldung entscheidet. Am Grabstein wird es nie angezeigt: der trägt
         denselben leeren Hash, ist aber über status unterschieden. */
      const wartet = !grabstein && z.ohnePasswort;
      row.innerHTML = `<span class="mname">${esc(verfasserName({ id: z.id, name: z.username, geloescht: grabstein }))}${
          selbst ? ' <span class="zug-ich">(du)</span>' : ''}</span>
        <span class="zug-rolle">${esc(ROLLENWORT[z.role] || z.role)}</span>
        <span class="zug-status">${esc(STATUSWORT[z.status] || z.status)}${
          wartet ? ' <span class="zug-wartet">· noch kein Passwort</span>' : ''}</span>
        <span class="mcount">${z.eintraege} ${esc(vSache(z.eintraege))}</span>`;
      if (darf) {
        const werkzeug = dok.createElement('span');
        werkzeug.className = 'zug-akt';
        werkzeug.innerHTML =
          `${daten.darfRollen ? `<select class="input input-sm zug-r">
             <option value="user"${z.role === 'user' ? ' selected' : ''}>Benutzer</option>
             <option value="admin"${z.role === 'admin' ? ' selected' : ''}>Admin</option>
             <option value="eigentuemer"${z.role === 'eigentuemer' ? ' selected' : ''}>Eigentümer</option>
           </select>` : ''}
           <button class="mact zug-s" title="${z.status === 'aktiv' ? 'Sperren' : 'Freigeben'}">${
             z.status === 'aktiv' ? '⃠' : '✓'}</button>
           <button class="mact zug-l" title="${z.ohnePasswort ? 'Einladungslink erzeugen'
             : 'Link zum Zurücksetzen erzeugen'}">🔗</button>
           <button class="mact zug-p" title="Passwort direkt setzen">🔑</button>
           <button class="mact rm zug-x" title="Zugang entfernen">✕</button>`;
        row.appendChild(werkzeug);

        const rolleFeld = werkzeug.querySelector('.zug-r');
        if (rolleFeld) rolleFeld.onchange = async () => {
          // Vor dem ersten await lesen: danach ist das Feld schon neu gezeichnet.
          const neu = rolleFeld.value;
          if (!await zweiteBestaetigung('rolle', z.id, 'Rolle vergeben',
            `„${z.username}“ bekommt die Rolle ${ROLLENWORT[neu] || neu}.`)) { zeichneZugaenge(); return; }
          try { await api('PUT', `/api/users/${z.id}`, { rolle: neu }); toast('Rolle geändert'); }
          catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };

        werkzeug.querySelector('.zug-s').onclick = async () => {
          const neu = z.status === 'aktiv' ? 'gesperrt' : 'aktiv';
          if (neu === 'gesperrt' && !confirm(
            `„${z.username}“ sperren? Die Anmeldung wird abgewiesen und die laufende Sitzung fällt. ` +
            `Alle Beiträge bleiben stehen.`)) return;
          try { await api('PUT', `/api/users/${z.id}`, { status: neu }); toast(neu === 'aktiv' ? 'Freigegeben' : 'Gesperrt'); }
          catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };

        /* BEIDE WEGE BLEIBEN, UND DIE KARTE BEVORZUGT DEN LINK. Das ist kein
           zweiter Weg zur selben Sache: der Link übergibt das RECHT, ein
           Passwort zu setzen, der Schlüssel übergibt ein PASSWORT. Der direkte
           Weg kommt ohne den Browser des anderen aus — für jemanden, der
           danebensteht, ist er der kürzere. */
        werkzeug.querySelector('.zug-l').onclick = async () => {
          const zweck = z.ohnePasswort ? 'einladung' : 'ruecksetzung';
          if (zweck === 'ruecksetzung' && !confirm(
            `Link zum Zurücksetzen für „${z.username}“ erzeugen?\n\n` +
            `Das bisherige Passwort bleibt gültig, bis der Link eingelöst wird. ` +
            `Ein früher erzeugter Link gilt danach nicht mehr.`)) return;
          if (!await zweiteBestaetigung('link', z.id,
            zweck === 'ruecksetzung' ? 'Link zum Zurücksetzen' : 'Einladungslink',
            `Der Link ist ein Passwortersatz auf Zeit für „${z.username}“ — wer ihn hat, ` +
            `kommt herein und setzt das Passwort.`)) return;
          try { zeigeLink(await api('POST', `/api/users/${z.id}/token`, { zweck })); }
          catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };

        werkzeug.querySelector('.zug-p').onclick = async () => {
          const neu = prompt(`Neues Passwort für „${z.username}“ (mindestens ${MIN_PASSWORT} Zeichen) — ` +
            `der direkte Weg ohne Link. Alle Sitzungen dieses Zugangs fallen dabei.`);
          if (neu === null || !neu.trim()) return;
          if (!await zweiteBestaetigung('passwort', z.id, 'Fremdes Passwort setzen',
            `„${z.username}“ bekommt ein neues Passwort, und alle seine Anmeldungen fallen.`)) return;
          try { await api('PUT', `/api/users/${z.id}`, { passwort: neu }); toast('Passwort gesetzt'); }
          catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };

        werkzeug.querySelector('.zug-x').onclick = async () => {
          let b;
          try { b = await api('GET', `/api/users/${z.id}/bestand`); }
          catch (e) { return toast(e.message, true); }
          // Die Zahlen VOR der Entscheidung, wie bei jeder anderen Loeschabfrage
          // im Projekt. Ohne sie wuesste niemand, was das erste Haekchen
          // an fremden Beitraegen mitnimmt.
          const eintraegeWeg = confirm(
            `„${z.username}“ entfernen.\n\n` +
            `Der Zugang wird stillgelegt, der Name wird frei. Seine ${b.eintraege} ${vSache(b.eintraege)} ` +
            `und seine Beiträge bleiben sichtbar und tragen künftig „Gelöschter Benutzer ${z.id}“.\n\n` +
            `OK = seine ${b.eintraege} ${vSache(b.eintraege)} MITLÖSCHEN — samt ${b.fremdKommentare} fremden ` +
            `Kommentaren, ${b.fremdBewertungen} fremden Bewertungen, ${b.fremdTesttage} fremden ` +
            `${vZeit(b.fremdTesttage)}, ${b.fremdLinks} fremden Links und ${b.fremdDateien} fremden ` +
            `Dateien daran.\nAbbrechen = stehen lassen.`);
          const beitraegeWeg = confirm(
            `Und seine Beiträge in fremden ${vSache(2)}?\n\n` +
            `${b.kommentare} Kommentare, ${b.bewertungen} Bewertungen, ${b.testtage} ${vZeit(b.testtage)}, ` +
            `${b.links} Links, ${b.dateien} Dateien.\n\n` +
            `OK = mitlöschen.\nAbbrechen = stehen lassen.`);
          if (!confirm(`„${z.username}“ jetzt entfernen? Das lässt sich nicht rückgängig machen.`)) return;
          if (!await zweiteBestaetigung('entfernen', z.id, 'Zugang entfernen',
            `„${z.username}“ wird stillgelegt; der Name wird frei.`)) return;
          try {
            await api('DELETE', `/api/users/${z.id}?eintraege=${eintraegeWeg ? 1 : 0}&beitraege=${beitraegeWeg ? 1 : 0}`);
            toast('Zugang entfernt');
          } catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };
      }
      box.appendChild(row);
    }
  }
  zeichneZugaenge();

  /* EINE WAHL, EIN KNOPF. Vorher standen hier zwei Knöpfe nebeneinander, und
     die Betriebsart steckte darin, WELCHEN man drückt — man musste beide
     Beschriftungen lesen, um zu wissen, was gleich passiert, und das
     Passwortfeld stand auch dann da, wenn es gar nicht galt.
     Jetzt sagt das Auswahlfeld die Betriebsart, das Passwortfeld erscheint nur
     zu ihr, und der Knopf trägt die Folge im Namen. Ein Feld, das nicht gilt,
     ist kein Feld — und ein Knopf, der zuverlässig etwas anderes tut, als sein
     Nachbar heißt, ist eine Falle.
     DIE VORGABE IST DER LINK: es ist der Weg, bei dem der Admin das Passwort
     nie erfährt. */
  const zugArt = document.getElementById('zug-art');
  const zugAnlegen = document.getElementById('zug-anlegen');
  const zugPass = document.getElementById('zug-pass');

  const zugArtGesetzt = () => {
    if (!zugArt || !zugAnlegen || !zugPass) return;
    const link = zugArt.value === 'link';
    zugPass.hidden = link;
    // Geleert, nicht bloß versteckt: ein Passwort, das man nicht mehr sieht,
    // aber noch mitschickt, wäre die unangenehmste Art von Überraschung.
    if (link) zugPass.value = '';
    zugAnlegen.textContent = link ? '+ Anlegen und Link' : '+ Anlegen';
  };
  if (zugArt) zugArt.onchange = zugArtGesetzt;
  zugArtGesetzt();

  if (zugAnlegen) zugAnlegen.onclick = async () => {
    const nameFeld = document.getElementById('zug-name');
    const mailFeld = document.getElementById('zug-mail');
    const rolleFeld = document.getElementById('zug-rolle');
    const einladen = !zugArt || zugArt.value === 'link';
    const koerper = { username: nameFeld.value.trim() };
    if (mailFeld && mailFeld.value.trim()) koerper.email = mailFeld.value.trim();
    if (einladen) koerper.einladen = true;
    else koerper.passwort = zugPass.value;
    if (rolleFeld) koerper.rolle = rolleFeld.value;
    if (!koerper.username) return toast('Bitte einen Benutzernamen angeben.', true);
    try {
      const d = await api('POST', '/api/users', koerper);
      nameFeld.value = ''; zugPass.value = '';
      if (mailFeld) mailFeld.value = '';
      toast(einladen ? 'Zugang angelegt — der Link steht unten' : 'Zugang angelegt');
      if (einladen) zeigeLink(d);
    } catch (e) { return toast(e.message, true); }
    zeichneZugaenge();
  };

  // Hier wird angelegt, nicht am Eintrag. Das Feld gibt es nur
  // fuer den Admin -- der Server verweigert es allen anderen ohnehin.
  const critFeld = document.getElementById('newcrit');
  if (critFeld) {
    const addCrit = async () => {
      const name = critFeld.value.trim();
      if (!name) return;
      try { await api('POST', '/api/criteria', { name }); critFeld.value = ''; toast('Kriterium angelegt'); refresh(); }
      catch (e) { toast(e.message, true); }
    };
    document.getElementById('newcrit-b').onclick = addCrit;
    critFeld.addEventListener('keydown', e => { if (e.key === 'Enter') addCrit(); });
  }
}

function askImport(file) {
  let info = null;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const j = JSON.parse(reader.result);
      const withPhotos = (j.items || []).some(i => (i.photos || []).some(p => p.data_base64));
      info = { count: (j.items || []).length, date: j.exported_at, title: j.title, withPhotos };
    } catch { info = null; }
    show();
  };
  reader.readAsText(file);

  function show() {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    if (!info) {
      bd.innerHTML = `<div class="modal"><h2>Import nicht möglich</h2>
        <p>Die Datei ließ sich nicht als Export lesen.</p>
        <div class="modal-acts"><button class="btn" data-close>Schließen</button></div></div>`;
      document.body.appendChild(bd);
      bd.querySelector('[data-close]').onclick = () => bd.remove();
      bd.onclick = e => { if (e.target === bd) bd.remove(); };
      return;
    }
    bd.innerHTML = `<div class="modal"><h2>Import</h2>
      <p>Die Datei enthält <strong>${info.count} ${esc(vSache(info.count))}</strong>${info.withPhotos ? ' <strong>mit Fotos</strong>' : ' ohne Fotos'}${info.title ? `, erstellt aus „${esc(info.title)}"` : ''}${info.date ? ` am ${fmtDate(info.date.replace('T',' ').slice(0,19))}` : ''}.</p>
      <p>Was soll mit dem vorhandenen Bestand geschehen?</p>
      <div class="warn-box"><strong>Ersetzen</strong> löscht vorher alles Vorhandene — für die
        Wiederherstellung nach einem Datenverlust.<br><br>
        <strong>Zusammenführen</strong> lässt Vorhandenes stehen und fügt die ${esc(V.sacheMehrzahl)} hinzu —
        um Bestände von einem zweiten Gerät zu übernehmen.</div>
      <div class="modal-acts">
        <button class="btn btn-ghost" data-cancel>Abbrechen</button>
        <button class="btn" data-merge>Zusammenführen</button>
        <button class="btn btn-danger" data-replace>Ersetzen</button>
      </div></div>`;
    document.body.appendChild(bd);
    const close = () => bd.remove();
    bd.querySelector('[data-cancel]').onclick = close;
    bd.onclick = e => { if (e.target === bd) close(); };

    const run = async (mode) => {
      if (mode === 'replace' && !await confirmBox('Wirklich ersetzen?',
        'Der komplette vorhandene Bestand wird vorher gelöscht. Das lässt sich nicht rückgängig machen.', 'Ersetzen')) return;
      if (!await zweiteBestaetigung('import', null, 'Import bestätigen',
        mode === 'replace'
          ? 'Der ersetzende Import löscht den vorhandenen Bestand und legt Einträge, Kommentare und Bewertungen unter fremden Namen an.'
          : 'Der Import legt Einträge, Kommentare und Bewertungen unter fremden Namen an.')) return;
      close();
      const busy = document.createElement('div');
      busy.className = 'backdrop';
      busy.innerHTML = `<div class="modal"><h2>Import läuft …</h2>
        <p>Bei vielen Fotos kann das eine Weile dauern. Bitte das Fenster nicht schließen.</p></div>`;
      document.body.appendChild(busy);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', mode);
      try {
        const r = await api('POST', '/api/import', fd, true);
        busy.remove();
        toast(`${r.items} ${vSache(r.items)}, ${r.photos} Fotos, ${r.videos || 0} Videos, ` +
              `${r.attachments} Dateien übernommen`);
        /* Nicht abbrechen, melden -- und laut genug, dass es auffaellt: fehlt
           ein Video, kann das naechste Foto zum Hauptbild geworden sein. */
        const fehlend = (r.videosOhneDatei || 0) + (r.videosUnlesbar || 0);
        if (fehlend) toast(`${fehlend} Video${fehlend === 1 ? '' : 's'} fehlte in der Datei und ` +
                           `wurde übergangen — steht ein Eintrag jetzt anders da, ist das der Grund.`, true);
        location.hash = '#/';
        if (location.hash === '#/') renderList();
      } catch (e) { busy.remove(); toast(e.message, true); }
    };
    bd.querySelector('[data-merge]').onclick = () => run('merge');
    bd.querySelector('[data-replace]').onclick = () => run('replace');
  }
}

/* ================= Start ================= */
let einrichtungNoetig = false;
(async function boot() {
  try {
    const cfg = await fetch('/api/config', { credentials: 'same-origin' }).then(r => r.json());
    if (cfg && cfg.title) TITLE_PUBLIC = cfg.title;
    if (cfg && cfg.version) VERSION = cfg.version;
    if (cfg && cfg.minPassword) MIN_PASSWORT = cfg.minPassword;
    if (cfg && cfg.setupRequired) einrichtungNoetig = true;
    REGISTRIERUNG = Boolean(cfg && cfg.registrierung);
    zeigeVersion();
  } catch {}
  document.title = TITLE_PUBLIC;
  // Die Einrichtung geht vor: ohne Zugang hilft keine Anmeldemaske.
  if (einrichtungNoetig) return showSetup();
  /* Ein Link aus einer Einladung oder Rücksetzung geht VOR der Anmeldemaske,
     aber NACH der Einrichtung: wer einen bekommen hat, will nicht erst ein
     Passwort eingeben, das er ja gerade nicht kennt. Er geht auch vor der
     Frage nach einer laufenden Anmeldung -- wer den Link aus einem Browser
     öffnet, in dem noch jemand angemeldet ist, meint trotzdem den Link. */
  const einl = (location.hash || '').match(/^#\/einladung\/([0-9a-f]{16,128})$/);
  if (einl) return showEinladung(einl[1]);
  /* Der Bestätigungslink der Selbstanmeldung, seit 0.9.1 — an derselben
     Stelle und aus demselben Grund wie der Einladungslink: wer ihn anklickt,
     meint ihn, auch wenn im Browser noch jemand angemeldet ist. Er wird
     ausdrücklich NICHT vom Schalter abhängig gemacht: wird die Selbstanmeldung
     abgeschaltet, während eine Bestätigung unterwegs ist, soll der Link nicht
     stumm auf der Anmeldeseite enden — der Server sagt dann, was gilt. */
  const best = (location.hash || '').match(/^#\/bestaetigung\/([0-9a-f]{16,128})$/);
  if (best) return showBestaetigung(best[1]);
  try {
    const s = await fetch('/api/session', { credentials: 'same-origin' }).then(r => r.json());
    if (s.authenticated) start(); else showLogin();
  } catch { showLogin('Server nicht erreichbar.'); }
})();
