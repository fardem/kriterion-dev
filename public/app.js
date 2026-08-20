const app = document.getElementById('app');

/* ================= Grundlagen ================= */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
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
const ICON_SEARCH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`;
const ICON_SYS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>`;
const MARK = (s = 30) => `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 2.8 L12 12 L20.2 7.4"/><path d="M20.2 16.6 L12 12 L20.2 7.4"/><path d="M12 21.2 L12 12 L3.8 16.6"/><path d="M3.8 7.4 L12 12 L3.8 16.6"/></svg>`;

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

/* Erste Einrichtung. Nennt den vorhandenen Bestand mit keinem Wort: die Seite
   steht vor der Anmeldung, dort gilt dieselbe Regel wie fuer den zweiten
   Titel. */
function showSetup(errMsg) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARK(34)}
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
    ${MARK(34)}
    <h1>${esc(TITLE_PUBLIC)}</h1>
    <p class="sub">Bitte anmelden, um fortzufahren.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="lu">Benutzername</label>
      <input class="input" id="lu" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="lp">Passwort</label>
      <input class="input" id="lp" type="password" autocomplete="current-password"></div>
    <button class="btn btn-accent" id="lb">Anmelden</button>
  </div></div>`;
  document.title = TITLE_PUBLIC;

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

// Mehrteiliges Formular schicken. api() sendet JSON und taugt dafuer nicht.
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
    // Faellt die Zeichenkette durch, wird sie gewoehnlicher Text, nicht Link.
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
// Die Schwelle steht GENAU HIER und nirgends sonst.
const mehrereBenutzer = () => BENUTZER_ZAHL > 1;

/* Die beiden Anlegen-Schalter, global und mit Vorgabe an. Der Bildschirm haelt
   sich an dieselbe Regel wie der Server: DER ADMIN KOMMT IMMER DURCH. Bote die
   Oberflaeche die Zeile "+ neu anlegen" trotz ausgeschaltetem Schalter an,
   erzeugte sie zuverlaessig eine Fehlermeldung -- und ein solcher Knopf sieht
   aus wie ein Fehler.
   Aus heisst ausdruecklich NUR: die Zeile zum Anlegen verschwindet. Auswahl
   und Wolke bleiben, denn zuweisen darf immer jeder. */
let TAGS_FREI = true;
let KATEGORIEN_FREI = true;
const darfTagAnlegen = () => ADMIN || TAGS_FREI;
const darfKategorieAnlegen = () => ADMIN || KATEGORIEN_FREI;

async function ladeEinstellungen() {
  EINSTELLUNGEN = await api('GET', '/api/settings');
  if (EINSTELLUNGEN.benutzerZahl) BENUTZER_ZAHL = EINSTELLUNGEN.benutzerZahl;
  if (EINSTELLUNGEN.istAdmin !== undefined) ADMIN = !!EINSTELLUNGEN.istAdmin;
  if (EINSTELLUNGEN.istEigentuemer !== undefined) EIGENTUEMER = !!EINSTELLUNGEN.istEigentuemer;
  if (EINSTELLUNGEN.vokabular) V = { ...V, ...EINSTELLUNGEN.vokabular };
  if (EINSTELLUNGEN.schrift) SCHRIFT = EINSTELLUNGEN.schrift;
  uebernimmBloecke(EINSTELLUNGEN.bloecke);
  if (EINSTELLUNGEN.linkZeilen) LINKZEILEN = EINSTELLUNGEN.linkZeilen;
  if (EINSTELLUNGEN.zeitleiste !== undefined) ZEITLEISTE_AN = EINSTELLUNGEN.zeitleiste !== false;
  if (Array.isArray(EINSTELLUNGEN.suchAnbieter)) SUCHANBIETER = EINSTELLUNGEN.suchAnbieter;
  if (EINSTELLUNGEN.suchNamen) SUCHNAMEN = EINSTELLUNGEN.suchNamen;
  // Der Server leitet beide beim Lesen ab und liefert sie immer; die Vorgabe
  // hier greift nur, wenn die Antwort das Feld gar nicht kennt.
  if (EINSTELLUNGEN.tagsFreiAnlegen !== undefined) TAGS_FREI = EINSTELLUNGEN.tagsFreiAnlegen !== false;
  if (EINSTELLUNGEN.kategorienFreiAnlegen !== undefined)
    KATEGORIEN_FREI = EINSTELLUNGEN.kategorienFreiAnlegen !== false;
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
                      favorit: false, sort: 'updated_desc', ...settings.filters };
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

function visibleItems() {
  const f = state.filters;
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
function route() {
  const h = location.hash || '#/';
  // Die alte Ansicht ist gleich fort; ihre Wolke darf niemand mehr zeichnen.
  wolkeNeuzeichnen = null;
  if (h === '#/system') return renderSystem();
  if (h === '#/compare') return renderCompare();
  const m = h.match(/^#\/item\/(\d+)$/);
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
      <div class="brand">${MARK(28)}
        <div><h1>${esc(TITLE_APP)}</h1><div class="count" id="count"></div></div></div>
      <div class="search-box">
        <span class="ic">${ICON_SEARCH}</span>
        <input class="input" id="q" placeholder="Suchen …" value="${esc(state.search)}">
        <button class="clr" id="qclr" title="Suche leeren" style="display:none">✕</button>
      </div>
      <button class="icon-btn" id="sys" title="Systembereich">${ICON_SYS}</button>
      <button class="btn btn-ghost btn-sm" id="out">Abmelden</button>
      <button class="btn btn-accent" id="new">+ ${esc(V.sacheEinzahl)}</button>
    </div>
    <div class="filters" id="filters"></div>
    <div id="zeitleiste"></div>
    <div id="body"></div>
  </div>`;

  document.getElementById('new').onclick = openCreate;
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
      ${it.photoCount > 1 ? `<div class="photo-count">${it.photoCount} Fotos</div>` : ''}
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

/* ================= Vergleich ================= */
async function renderCompare() {
  const ids = [...state.compare];
  if (ids.length < 2) { location.hash = '#/'; return; }
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  let items;
  try { items = await Promise.all(ids.map(id => api('GET', `/api/items/${id}`))); }
  catch (e) { toast(e.message, true); location.hash = '#/'; return; }

  const names = [];
  items.forEach(i => i.ratings.forEach(r => { if (!names.includes(r.name)) names.push(r.name); }));

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">Vergleich</h1>
    <p class="hint" style="margin:0 0 20px">${items.length} ${esc(vSache(items.length))} gegenübergestellt. Bester Wert je Kriterium ist hervorgehoben.</p>
    <div class="cmp-grid" id="cg" style="grid-template-columns:repeat(auto-fit,minmax(264px,1fr))"></div>
  </div>`;

  const cg = document.getElementById('cg');
  const bestOf = (name) => Math.max(...items.map(o => { const r = o.ratings.find(x => x.name === name); return r ? r.value : 0; }));
  const bestTest = Math.max(...items.map(o => o.testCount || 0));

  items.forEach(it => {
    const col = document.createElement('div');
    col.className = 'cmp-col';
    const rows = names.map(n => {
      const r = it.ratings.find(x => x.name === n);
      const v = r ? r.value : 0;
      const best = v > 0 && v === bestOf(n);
      return `<div class="cmp-crit"><span class="cn">${esc(n)}</span>
        <span class="${best ? 'cmp-best' : ''}">${v > 0 ? v + ' / 5' : '–'}</span></div>`;
    }).join('');
    const testRow = `<div class="cmp-crit" style="border-top:1px solid var(--line);margin-top:6px;padding-top:9px">
      <span class="cn">${esc(V.zeitpunktMehrzahl)}</span>
      <span class="${it.testCount && it.testCount === bestTest ? 'cmp-best' : ''}">${it.testCount || '–'}</span></div>`;
    col.innerHTML = `
      <div class="cimg">${it.photos[0] ? `<img src="/api/photos/${it.photos[0].id}/raw?size=medium" alt="">` : ''}</div>
      <div class="cbody">
        ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
        <h3>${esc(it.title)}</h3>
        <div class="hint" style="margin-bottom:10px">${it.avgRating ? '★ ' + it.avgRating.toFixed(1).replace('.', ',') + ' Durchschnitt' : 'keine Wertung'}</div>
        ${rows}${testRow}
        <div style="margin-top:12px"><a href="#/item/${it.id}" class="btn btn-sm" style="width:100%">Öffnen</a></div>
      </div>`;
    cg.appendChild(col);
  });
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
const hatOriginal = (p) => p.quelle !== 'kommentar';

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
    <div class="lb-stage"><img alt="" title="Klick zoomt auf Originalgröße"></div>
    ${photos.length > 1 ? `<button class="lb-nav prev" title="Vorheriges (←)">‹</button>
                           <button class="lb-nav next" title="Nächstes (→)">›</button>` : ''}
    ${photos.length > 1 ? `<div class="lb-strip"></div>` : ''}`;
  document.body.appendChild(lb);
  document.body.classList.add('lb-open');

  const stage = lb.querySelector('.lb-stage');
  const img = lb.querySelector('.lb-stage img');
  const strip = lb.querySelector('.lb-strip');

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
    img.src = bildQuelle(photos[i], 'medium');
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
    t.className = 'lb-thumb';
    t.innerHTML = `<img src="${bildQuelle(p, 'thumb')}" alt="">`;
    t.onclick = () => { i = n; show(); };
    strip.appendChild(t);
  });

  const close = () => {
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
        <label class="drop" id="drop"><input type="file" id="file" accept="image/*" multiple>
          Fotos hinzufügen — mehrere möglich, oder mit Strg+V einfügen</label>
        <p class="hint hint-sm" style="margin:8px 2px 0">
          Klick aufs Foto öffnet die Vollbildansicht. Blättern mit ← → oder den Pfeilen.
          Das erste Foto ist das Hauptbild; Reihenfolge per Ziehen ändern.</p>
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
    const ps = item.photos;
    if (!ps.length) { v.innerHTML = ICON_PH; return; }
    if (idx >= ps.length) idx = 0;
    if (idx < 0) idx = ps.length - 1;
    v.innerHTML = `<img src="/api/photos/${ps[idx].id}/raw?size=medium" alt="" title="Für Vollbild klicken">
      ${idx === 0 ? `<span class="main-flag">Hauptbild</span>` : ''}
      <button class="vfocus${ausschnittModus ? ' on' : ''}" title="Bildausschnitt der Vorschau festlegen">Ausschnitt</button>
      ${ps.length > 1 ? `<button class="vnav prev" title="Vorheriges (←)">‹</button>
        <button class="vnav next" title="Nächstes (→)">›</button>
        <span class="vcount">${idx + 1} / ${ps.length}</span>` : ''}`;
    const bild = v.querySelector('img');
    bild.onclick = () => { if (!ausschnittModus) openLightbox(item.photos, idx, item.title); };
    v.querySelector('.vfocus').onclick = () => {
      ausschnittModus = !ausschnittModus;
      drawViewer();
      if (ausschnittModus) toast('Klicken oder ziehen legt den Bildausschnitt fest');
    };
    if (ausschnittModus) ruesteAusschnittAus(v, bild, ps[idx]);
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
      t.className = 'thumb' + (i === idx ? ' current' : '');
      t.dataset.pid = p.id;
      t.innerHTML = `<img src="/api/photos/${p.id}/raw?size=thumb" alt="" style="object-position:${fokus(p)}"><span class="num">${i + 1}</span><span class="del" title="Foto löschen">✕</span>`;
      t.querySelector('.del').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox('Foto löschen?', 'Dieses Foto wird unwiderruflich entfernt.')) return;
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

  async function uploadFiles(files) {
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append('photos', f);
    const drop = document.getElementById('drop');
    const old = drop.textContent;
    drop.textContent = 'wird hochgeladen …';
    try {
      item = await api('POST', `/api/items/${id}/photos`, fd, true);
      drawViewer(); drawThumbs();
      toast(`${files.length} Foto${files.length === 1 ? '' : 's'} hinzugefügt`);
    } catch (err) { toast(err.message, true); }
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
  drop.addEventListener('drop', e => uploadFiles([...(e.dataTransfer?.files || [])].filter(f => /^image\//.test(f.type))));

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
  /* ---- Wer den Eintrag angelegt hat ----
     Bei genau einem aktiven Zugang bleibt die Zeile weg -- "Angelegt von mir"
     ist keine Information. Abgeleitet aus der Zahl der Zugänge, nicht aus
     einem Schalter; die Schwelle steht in mehrereBenutzer() und nirgends
     sonst. */
  function drawVerfasser() {
    const el = document.getElementById('ivf');
    if (!el) return;
    el.hidden = !mehrereBenutzer();
    el.textContent = mehrereBenutzer() ? `Angelegt von ${verfasserName(item.verfasser)}` : '';
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
    if (kopf) kopf.textContent = item.avgRating
      ? '⌀ ' + item.avgRating.toFixed(1).replace('.', ',') : '';
    item.ratings.forEach(r => {
      const row = document.createElement('div');
      row.className = 'rrow';
      const n = document.createElement('span');
      n.className = 'rname'; n.textContent = r.name;
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

      /* Wer welchen Wert vergeben hat. Erst ab zwei Zugängen: bei einem wäre
         die Zeile der eigene Wert ein zweites Mal, direkt neben den Sternen.
         Das ✕ steht nur am FREMDEN Wert und nur beim Admin — den eigenen
         räumt man mit dem Doppelklick auf den Stern weg, und ein Knopf, der
         zuverlässig eine Fehlermeldung erzeugt, sieht aus wie ein Fehler.
         Die Note ändert der Admin nicht: es gibt hier kein Sterne-Widget an
         einer fremden Stimme, sondern nur den Weg, sie zu entfernen. */
      if (!mehrereBenutzer() || !(r.stimmen || []).length) return;
      const liste = document.createElement('div');
      liste.className = 'rstimmen';
      r.stimmen.forEach(st => {
        const s2 = document.createElement('span');
        s2.className = 'rstimme' + (st.mine ? ' meine' : '');
        s2.appendChild(document.createTextNode(`${verfasserName(st.verfasser)} ${st.wert}`));
        if (ADMIN && !st.mine) {
          const x = document.createElement('button');
          x.className = 'xdel';
          x.textContent = '✕';
          x.title = 'Diese Bewertung entfernen';
          x.onclick = async () => {
            if (!await confirmBox('Fremde Bewertung entfernen?',
              `Die Bewertung von ${verfasserName(st.verfasser)} für „${r.name}" wird entfernt. ` +
              `Die Note lässt sich nicht ändern, nur löschen.`, 'Entfernen')) return;
            try { item = await api('DELETE', `/api/ratings/${st.id}`); drawRatings(); toast('Bewertung entfernt'); }
            catch (e) { toast(e.message, true); }
          };
          s2.appendChild(x);
        }
        liste.appendChild(s2);
      });
      box.appendChild(liste);
    });
    ruesteBloeckeAus(item);
  }
  // Der Ruecksetzer meint ausschliesslich die EIGENEN Werte -- das tut er
  // serverseitig ohnehin, die Beschriftung sagt es dazu.
  // "Alle zurücksetzen" liest sich im Mehrbenutzerbetrieb wie "alle loeschen".
  // Der Wortlaut bleibt bei einem wie bei zehn Zugaengen derselbe: eine
  // Beschriftung, die mit der Zahl der Zugaenge umspringt, waere eine zweite
  // Wahrheit ueber denselben Knopf.
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
      const row = document.createElement('div');
      row.className = 'lrow' + (suche ? ' suche' : '');
      row.dataset.lid = l.id;
      row.title = suche
        ? (standard ? `Suche nach „${l.url}" bei ${standard.name}` : `Suche nach „${l.url}"`)
        : l.url;
      row.innerHTML = `<span class="grip" title="Zum Sortieren ziehen">⣿</span>
        <span class="lnum">${n + 1}</span>
        <span class="lurl"><span class="dom">${esc(oben)}</span>${
          suche ? '<span class="snamen"></span>' : (path ? `<span class="path">${esc(path)}</span>` : '')
        }</span>
        <span class="go">${suche ? ICON_SEARCH : '↗'}</span>
        <button class="xdel" title="${suche ? 'Sucheintrag entfernen' : 'Link entfernen'}">✕</button>`;
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
      row.querySelector('.xdel').onclick = async (e) => {
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
    box.style.overflowY = 'auto';
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
      zeile.innerHTML = `<span class="aicon">${a.preview === 'bild' ? '▣' : a.preview === 'pdf' ? '▤' : a.preview === 'keine' ? '▪' : '▥'}</span>
        <span class="aname">${esc(a.filename)}</span>
        <span class="asize">${groesse(a.size)}</span>
        <span class="ago">${kannVorschau ? (offen ? '▾' : '▸') : '↓'}</span>
        <a class="adl" href="/api/attachments/${a.id}/raw" download title="Herunterladen">↓</a>
        <button class="xdel" title="Datei entfernen">✕</button>`;

      zeile.querySelector('.xdel').onclick = async (e) => {
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
    const inhalt = [
      ...zaehl(b.fotos, 'Foto', 'Fotos'),
      ...zaehl(b.links, 'Link', 'Links'),
      ...zaehl(b.dateien, 'Datei', 'Dateien')
    ];
    const eigen = [
      ...zaehl(b.eigenKommentare, 'Kommentar', 'Kommentare'),
      ...zaehl(b.eigenBewertungen, 'Bewertung', 'Bewertungen'),
      ...(b.eigenTesttage ? [`${b.eigenTesttage} ${vZeit(b.eigenTesttage)}`] : [])
    ];
    const fremd = [
      ...zaehl(b.fremdKommentare, 'Kommentar', 'Kommentare'),
      ...zaehl(b.fremdBewertungen, 'Bewertung', 'Bewertungen'),
      ...(b.fremdTesttage ? [`${b.fremdTesttage} ${vZeit(b.fremdTesttage)}`] : [])
    ];

    const saetze = [`„${item.title}" wird unwiderruflich entfernt.`];
    if (inhalt.length) saetze.push(`Dabei gehen ${inhalt.join(', ')} verloren.`);
    if (eigen.length) saetze.push(`Dazu ${eigen.join(', ')} von mir.`);
    if (fremd.length) saetze.push(`Und von anderen: ${fremd.join(', ')}.`);

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
  let stats, titles, cats, tags, crits, zugang;
  try {
    [stats, titles, cats, tags, crits, zugang] = await Promise.all([
      api('GET', '/api/stats'), api('GET', '/api/titles'),
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria'),
      api('GET', '/api/account')
    ]);
  } catch (e) { if (e.message !== 'Sitzung abgelaufen') toast(e.message, true); return; }

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">System</h1>
    <p class="hint" style="margin:0 0 22px">Alles, was den Bestand als Ganzes betrifft.</p>
    <div class="sys-grid">

      <div class="sys-card">
        <h3>Titel</h3>
        <p class="desc">Der <strong>öffentliche Titel</strong> steht auf der Anmeldeseite und ist für
          jeden sichtbar, der die Adresse aufruft. Der <strong>interne Titel</strong> erscheint erst
          nach der Anmeldung — hier gehört die aussagekräftige Bezeichnung hin.</p>
        <div class="field"><label>Titel vor der Anmeldung</label>
          <input class="input" id="tp" value="${esc(titles.publicTitle)}"></div>
        <div class="field"><label>Titel nach der Anmeldung</label>
          <input class="input" id="ta2" value="${esc(titles.appTitle)}"></div>
        <button class="btn btn-accent btn-sm" id="tsave">Titel speichern</button>
      </div>

      <div class="sys-card">
        <h3>Zugang</h3>
        <p class="desc">Benutzername und Passwort für die Anmeldung. Zum Ändern ist das
          bisherige Passwort nötig. Das Passwortfeld leer lassen ändert nur den Namen.
          Danach fallen alle anderen Anmeldungen — diese hier bleibt bestehen.</p>
        <div class="field"><label>Benutzername</label>
          <input class="input" id="acc-user" autocomplete="username" autocapitalize="off"
            spellcheck="false" value="${esc(zugang.username || '')}"></div>
        <div class="field"><label>Bisheriges Passwort</label>
          <input class="input" id="acc-old" type="password" autocomplete="current-password"></div>
        <div class="field"><label>Neues Passwort</label>
          <input class="input" id="acc-new" type="password" autocomplete="new-password"></div>
        <div class="field"><label>Neues Passwort wiederholen</label>
          <input class="input" id="acc-new2" type="password" autocomplete="new-password"></div>
        <p class="desc" style="margin:0 0 10px">Mindestens ${MIN_PASSWORT} Zeichen. Über die
          Oberfläche gibt es keine Wiederherstellung; vergessen heißt
          <code>AUTH_RESET=1</code> am Server.</p>
        <button class="btn btn-accent btn-sm" id="acc-save">Zugang ändern</button>
      </div>

      <div class="sys-card">
        <h3>Kennzahlen</h3>
        <p class="desc">Umfang des Bestands und Belegung der Datenbank.</p>
        <div class="kv"><span class="k">${esc(V.sacheMehrzahl)}</span><span class="v">${stats.itemCount}</span></div>
        <div class="kv"><span class="k">Fotos</span><span class="v">${stats.photoCount} · ${fmtBytes(stats.photoBytes)}</span></div>
        <div class="kv"><span class="k">Kommentare</span><span class="v">${stats.commentCount}</span></div>
        <div class="kv"><span class="k">Links</span><span class="v">${stats.linkCount}</span></div>
        <div class="kv"><span class="k">${esc(V.zeitpunktMehrzahl)}</span><span class="v">${stats.testDayCount}</span></div>
          <div class="kv"><span class="k">Dateien</span><span class="v">${stats.attachmentCount} · ${fmtBytes(stats.attachmentBytes)}</span></div>
        <div class="kv"><span class="k">Datenbank</span><span class="v">${fmtBytes(stats.dbBytes)}</span></div>
        <div style="margin-top:14px">${stats.keyFromEnv
          ? `<div class="ok-box">Der Schlüssel kommt aus der Umgebung. Denk daran: <strong>.env und data/ nicht ins selbe Backup legen</strong> — und ohne den Schlüssel sind die Daten unwiederbringlich verloren.</div>`
          : `<div class="warn-box"><strong>Der Schlüssel liegt neben der Datenbank</strong> (data/encryption.key). Wer das Verzeichnis kopiert, kann alles lesen.
              <p style="margin:9px 0 6px">Für echten Schutz <strong>diesen</strong> Wert in die <code>.env</code> eintragen — keinen neuen erzeugen, sonst sind die vorhandenen Daten nicht mehr lesbar:</p>
              <code class="keyline" id="keyline">ENCRYPTION_KEY=${esc(stats.keyHex || '')}</code>
              <p style="margin:8px 0 0">Danach <code>docker compose up -d</code> und im Protokoll „Schlüssel aus ENCRYPTION_KEY geladen" prüfen — <strong>erst dann</strong> <code>data/encryption.key</code> entfernen.</p>
            </div>`}
        </div>
      </div>

      <div class="sys-card">
        <h3>Export</h3>
        <p class="desc">Sichert den gesamten Bestand als eine Datei. Mit Fotos wird sie deutlich
          größer, weil Bilder als Text kodiert werden müssen — rechne mit rund einem Drittel
          Aufschlag auf ${fmtBytes(stats.photoBytes)}.</p>
        <div class="row-in">
          <button class="btn btn-accent btn-sm" id="ex-yes">Mit Fotos (~${fmtBytes(Math.round(stats.photoBytes * 1.34))})</button>
          <button class="btn btn-sm" id="ex-no">Ohne Fotos</button>
        </div>
        <label class="ex-files"><input type="checkbox" id="ex-files">
          Angehängte Dateien mitnehmen (~${fmtBytes(Math.round(stats.attachmentBytes * 1.34))})</label>
      </div>

      <div class="sys-card">
        <h3>Import</h3>
        <p class="desc">Spielt eine zuvor erzeugte Exportdatei wieder ein. Vor dem Start wird
          gefragt, was mit dem vorhandenen Bestand geschehen soll.</p>
        <label class="drop" id="imp-drop"><input type="file" id="imp" accept="application/json,.json">
          Exportdatei auswählen</label>
      </div>

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
        ${ADMIN ? `<div class="row-in" style="margin-top:12px">
          <input class="input input-sm" id="newcrit" placeholder="Neues Kriterium" style="padding:8px 11px">
          <button class="btn btn-sm" id="newcrit-b">+ Anlegen</button>
        </div>` : ''}
      </div>

      ${ADMIN ? `<div class="sys-card">
        <h3>Zugänge</h3>
        <p class="desc">Wer sich anmelden darf. <strong>Sperren ist in den meisten Fällen das,
          was man eigentlich will</strong> — die Anmeldung wird abgewiesen, die Beiträge bleiben
          unangetastet stehen.
          ${EIGENTUEMER
            ? `Als Eigentümer der Anlage vergibst du Rollen und kommst auch an andere Admins.`
            : `Rollen vergibt der Eigentümer der Anlage; an einen anderen Admin kommst du nicht.`}</p>
        <div class="manage-list" id="mzugaenge"></div>

        <p class="desc" style="margin:16px 0 8px">Ein neuer Zugang bekommt sein erstes Passwort
          hier und kann es danach selbst ändern. Mindestens ${MIN_PASSWORT} Zeichen.</p>
        <div class="zug-neu">
          <input class="input input-sm" id="zug-name" placeholder="Benutzername"
            autocomplete="off" autocapitalize="off" spellcheck="false">
          <input class="input input-sm" id="zug-pass" type="password" placeholder="Erstes Passwort"
            autocomplete="new-password">
          ${EIGENTUEMER ? `<select class="input input-sm" id="zug-rolle">
            <option value="user">Benutzer</option>
            <option value="admin">Admin</option>
            <option value="eigentuemer">Eigentümer</option>
          </select>` : ''}
          <button class="btn btn-sm" id="zug-anlegen">+ Anlegen</button>
        </div>

        <p class="desc" style="margin:16px 0 0">Passwort vergessen und niemand kommt mehr herein?
          Auf dem Server hilft
          <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>.</p>
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

        <p class="desc" style="margin:16px 0 8px">Wird in der Linkliste etwas eingetragen, das
          keine Adresse ist, wird daraus eine <strong>Suche</strong>. Gespeichert bleibt der
          Rohtext — ein Anbieterwechsel gilt deshalb rückwirkend für alle vorhandenen
          Suchzeilen. Gefragt wird erst beim Klick, Kriterion selbst ruft niemanden.</p>
        <p class="desc" style="margin:0 0 8px">Das Häkchen nimmt einen Anbieter in die Auswahl,
          <strong>Start</strong> macht ihn zum Ziel des Zeilenklicks. Der Startanbieter steht
          unter der Suchzeile immer vorn.</p>
        <div class="sanb-liste" id="sanbieter"></div>

        <p class="desc" style="margin:16px 0 8px">Bis zu drei eigene Anbieter. <code>%s</code> steht
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

        <p class="desc" style="margin:16px 0 8px">Wie viele Anbieternamen unter einer Suchzeile
          stehen. Gezählt wird der Startanbieter mit; sind weniger in der Auswahl, stehen
          entsprechend weniger da.</p>
        <div class="pills" id="snamen"></div>
      </div>

      <div class="sys-card">
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
      </div>

    </div></div>`;

  document.getElementById('tsave').onclick = async () => {
    const p = document.getElementById('tp').value.trim();
    const a = document.getElementById('ta2').value.trim();
    try {
      const r = await api('PUT', '/api/titles', { publicTitle: p, appTitle: a });
      TITLE_PUBLIC = r.publicTitle; TITLE_APP = r.appTitle;
      document.title = TITLE_APP;
      toast('Titel gespeichert');
    } catch (e) { toast(e.message, true); }
  };

  document.getElementById('acc-save').onclick = async () => {
    const alt = document.getElementById('acc-old').value;
    const name = document.getElementById('acc-user').value.trim();
    const neu1 = document.getElementById('acc-new').value;
    const neu2 = document.getElementById('acc-new2').value;
    if (!alt) return toast('Bitte das bisherige Passwort angeben.', true);
    if (!name) return toast('Bitte einen Benutzernamen angeben.', true);
    if (neu1 !== neu2) return toast('Die beiden neuen Passwörter stimmen nicht überein.', true);
    if (neu1 && neu1.length < MIN_PASSWORT)
      return toast(`Das Passwort muss mindestens ${MIN_PASSWORT} Zeichen lang sein.`, true);
    try {
      const r = await api('PUT', '/api/account', {
        oldPassword: alt, username: name, newPassword: neu1
      });
      toast(r.passwortGewechselt ? 'Zugang geändert' : 'Benutzername geändert');
      renderSystem();   // leert die Passwortfelder
    } catch (e) { toast(e.message, true); }
  };

  // Dateien haben einen eigenen Schalter mit Vorgabe aus: bei 50 MB je Datei
  // waere die Exportdatei sonst schnell unhandlich.
  const mitDateien = () => (document.getElementById('ex-files').checked ? '&files=1' : '');
  document.getElementById('ex-yes').onclick = () => { window.location = '/api/export?photos=1' + mitDateien(); };
  document.getElementById('ex-no').onclick = () => { window.location = '/api/export?photos=0' + mitDateien(); };

  document.getElementById('imp').onchange = e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) askImport(file);
  };

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

  document.getElementById('breset').onclick = async () => {
    if (!await confirmBox('Standardanordnung wiederherstellen?',
      'Die Blöcke der Detailansicht kehren in ihre Ausgangsreihenfolge zurück, alle eingeklappten werden wieder geöffnet.',
      'Wiederherstellen')) return;
    BLOECKE = { seite: [...BLOCK_VORGABE.seite], unten: [...BLOCK_VORGABE.unten], zu: [] };
    try { await api('PUT', '/api/settings', { bloecke: BLOECKE }); toast('Standardanordnung wiederhergestellt'); }
    catch (e) { toast(e.message, true); }
  };

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
  ['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11'].forEach(id =>
    document.getElementById(id).addEventListener('input', drawProbe));
  drawProbe();

  document.getElementById('vsave').onclick = async () => {
    try {
      const r = await api('PUT', '/api/settings', { vokabular: vFelder() });
      V = { ...V, ...r.vokabular };
      toast('Vokabular gespeichert');
      renderSystem();          // leere Felder kommen mit der Vorgabe zurück
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('vreset').onclick = async () => {
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
  };

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
      warnung: e => `„${e.name}" wird überall entfernt, samt vergebener Sterne.`
    }
  };

  function manage(boxId, list, kind) {
    const box = document.getElementById(boxId);
    const art = KIND[kind];
    // Die Kriterien gehoeren dem Admin, alle vier Wege. Fuer
    // andere bleibt die Karte eine Liste -- kein Griff, kein ✎, kein ✕ und
    // kein Anlegefeld. Der Server verweigert es ohnehin; ein Knopf, der eine
    // Fehlermeldung erzeugt, sieht aber aus wie ein Fehler.
    const darf = kind !== 'crit' || ADMIN;
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = `<span class="hint">Noch nichts angelegt.</span>`; return; }
    list.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'mrow' + (art.sortierbar && darf ? ' drag' : '');
      row.dataset.mid = entry.id;
      const url = art.url;
      row.innerHTML = `${art.sortierbar && darf ? `<span class="grip" title="Zum Sortieren ziehen">⣿</span>` : ''}
        <span class="mname">${esc(entry.name)}</span>
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
      row.innerHTML = `<span class="mname">${esc(verfasserName({ id: z.id, name: z.username, geloescht: grabstein }))}${
          selbst ? ' <span class="zug-ich">(du)</span>' : ''}</span>
        <span class="zug-rolle">${esc(ROLLENWORT[z.role] || z.role)}</span>
        <span class="zug-status">${esc(STATUSWORT[z.status] || z.status)}</span>
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
           <button class="mact zug-p" title="Passwort zurücksetzen">🔑</button>
           <button class="mact rm zug-x" title="Zugang entfernen">✕</button>`;
        row.appendChild(werkzeug);

        const rolleFeld = werkzeug.querySelector('.zug-r');
        if (rolleFeld) rolleFeld.onchange = async () => {
          // Vor dem ersten await lesen: danach ist das Feld schon neu gezeichnet.
          const neu = rolleFeld.value;
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

        werkzeug.querySelector('.zug-p').onclick = async () => {
          const neu = prompt(`Neues Passwort für „${z.username}“ (mindestens ${MIN_PASSWORT} Zeichen). ` +
            `Alle Sitzungen dieses Zugangs fallen dabei.`);
          if (neu === null || !neu.trim()) return;
          try { await api('PUT', `/api/users/${z.id}`, { passwort: neu }); toast('Passwort gesetzt'); }
          catch (e) { toast(e.message, true); }
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
            `Kommentaren, ${b.fremdBewertungen} fremden Bewertungen und ${b.fremdTesttage} fremden ` +
            `${vZeit(b.fremdTesttage)} daran.\nAbbrechen = stehen lassen.`);
          const beitraegeWeg = confirm(
            `Und seine Beiträge in fremden ${vSache(2)}?\n\n` +
            `${b.kommentare} Kommentare, ${b.bewertungen} Bewertungen, ${b.testtage} ${vZeit(b.testtage)}.\n\n` +
            `OK = mitlöschen.\nAbbrechen = stehen lassen.`);
          if (!confirm(`„${z.username}“ jetzt entfernen? Das lässt sich nicht rückgängig machen.`)) return;
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

  const zugAnlegen = document.getElementById('zug-anlegen');
  if (zugAnlegen) zugAnlegen.onclick = async () => {
    const nameFeld = document.getElementById('zug-name');
    const passFeld = document.getElementById('zug-pass');
    const rolleFeld = document.getElementById('zug-rolle');
    const koerper = { username: nameFeld.value.trim(), passwort: passFeld.value };
    if (rolleFeld) koerper.rolle = rolleFeld.value;
    if (!koerper.username) return toast('Bitte einen Benutzernamen angeben.', true);
    try {
      await api('POST', '/api/users', koerper);
      nameFeld.value = ''; passFeld.value = '';
      toast('Zugang angelegt');
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
        toast(`${r.items} ${vSache(r.items)}, ${r.photos} Fotos, ${r.attachments} Dateien übernommen`);
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
    zeigeVersion();
  } catch {}
  document.title = TITLE_PUBLIC;
  // Die Einrichtung geht vor: ohne Zugang hilft keine Anmeldemaske.
  if (einrichtungNoetig) return showSetup();
  try {
    const s = await fetch('/api/session', { credentials: 'same-origin' }).then(r => r.json());
    if (s.authenticated) start(); else showLogin();
  } catch { showLogin('Server nicht erreichbar.'); }
})();
