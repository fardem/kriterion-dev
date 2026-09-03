const app = document.getElementById('app');

/* ================= Grundlagen ================= */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
/* HIER STAND BIS 0.17.0 fmtTagKurz() -- die Kurzform „19.08." fuer die
   Beschriftung der Pille „Neu seit ...". Die Pille ist gestrichen, und die
   Funktion hatte danach genau keinen Rufer mehr. Eine Funktion, die niemand
   ruft, ist kein Vorrat, sondern eine Frage an den Naechsten. */
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

/* WIE GROSS DIE EXPORTDATEI WIRD -- gerechnet aus den Teilen, die der Server
   in `stats.export` liefert. Der Umschlag faellt IMMER an: ein Export "ohne
   Fotos" ist nicht null Bytes gross, und eine Anzeige, die das behauptet,
   waere die falsche Beruhigung.
   Der Videoschalter haengt am Fotoschalter -- genau wie am Server, wo die
   Fotoliste ohne ihn gar nicht erst gebaut wird. Ohne diese Bindung naennte
   die Karte eine Zahl, die kein Knopf erzeugen kann. */
function exportSumme(ex, s) {
  if (!ex) return 0;
  return (ex.umschlag || 0)
    + (s.mitFotos ? (ex.fotos || 0) : 0)
    + (s.mitFotos && s.mitVideos ? (ex.videos || 0) : 0)
    + (s.mitDateien ? (ex.anhaenge || 0) + (ex.kommentarbilder || 0) : 0);
}
// Alles eingeschaltet -- die Zahl fuer die Kennzahlen, wo kein Schalter steht.
const exportGesamt = (stats) => exportSumme(stats && stats.export,
  { mitFotos: true, mitDateien: true, mitVideos: true });

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
/* DREI STRICHE. Es gibt kein besseres Zeichen fuer "hier ist noch mehr" --
   nicht weil es gut waere, sondern weil es jeder kennt. Es steht NUR auf dem
   schmalen Schirm; das entscheidet das Stylesheet, nicht diese Zeile.
   Dieselbe Strichstaerke und dasselbe viewBox wie die beiden Nachbarn in der
   Kopfzeile -- sie sollen wie ein Satz aussehen und nicht wie drei Herkuenfte. */
const ICON_MENUE = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`;
/* DIE DREI ZEICHEN AM BILDBEREICH. Sie ersetzen die Woerter "Ausschnitt" und
   "Vollbild" -- und der Papierkorb ist neu.
   WARUM ZEICHEN UND NICHT WOERTER: sie liegen AUF dem Bild und nicht daneben.
   Ein Wort dort verdeckt Bildflaeche in der Breite des laengsten Wortes, und
   es zwang die Instanz zu einer ausgerechneten Zahl -- der Vollbildknopf sass
   auf `right: 92px`, und das waren die 92 Pixel, die "Ausschnitt" bei 100
   Prozent Schrift misst. Bei 120 Prozent schoben sich die beiden uebereinander.
   Drei gleich grosse Quadrate in einer Reihe brauchen diese Zahl nicht.
   DER AUSSCHNITT IST DAS ZEICHEN, DAS JEDES FOTOPROGRAMM DAFUER FUEHRT: zwei
   ineinandergeschobene rechte Winkel. Es ist nicht huebscher als ein Wort, es
   ist bekannt -- und das ist bei einem Zeichen der ganze Punkt.
   ALLE DREI IN DERSELBEN STRICHSTAERKE UND DEMSELBEN viewBox wie die Zeichen
   der Kopfzeile. Sie sollen wie ein Satz aussehen und nicht wie drei
   Herkuenfte. */
const ICON_AUSSCHNITT = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v13a2 2 0 0 0 2 2h13"/><path d="M2 7h13a2 2 0 0 1 2 2v13"/></svg>`;
const ICON_VOLLBILD = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H3v6"/><path d="M15 21h6v-6"/><path d="M21 9V3h-6"/><path d="M3 15v6h6"/></svg>`;
const ICON_PAPIERKORB = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l.9 12.6A1.5 1.5 0 0 0 8.9 21h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
const ICON_SEARCH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`;
/* DIE GLOCKE. Kein Zeichen erklaert sich von selbst, aber dieses ist draussen
   so fest belegt wie das Zahnrad fuer Einstellungen -- und die Kopfzeile
   traegt ohnehin an jedem Knopf seinen Titel. */
const ICON_GLOCKE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8.5a6 6 0 1 0-12 0c0 5.2-2 6.5-2 6.5h16s-2-1.3-2-6.5"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/></svg>`;
const ICON_SYS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>`;
/* Die Marke der Instanz. EINE AUSGELIEFERTE DATEI statt eines eingebauten
   SVG: eine Marke gehoert dem Projekt und nicht einer Funktion in app.js --
   wer sie austauscht, tauscht eine Datei aus und fasst keinen Quelltext an.
   Die Klasse heisst `marke` und nicht `mark`: `mark` gibt es in style.css
   bereits fuer die kleinen Knoepfe am Kommentar.

   GENOMMEN WIRD DIE DURCHSICHTIGE FASSUNG -- die Flaechen, auf denen sie
   steht, sind ohnehin dunkel. favicon.svg bringt die Kachel mit und ist fuer
   fremde Flaechen gedacht: Reiter, Lesezeichen, helle Seite. ZWEI DATEIEN,
   NICHT DREI.

   alt="" UND KEIN TITEL: die Marke steht ueberall unmittelbar neben dem Namen
   der Instanz -- ein Vorleseprogramm saegte ihn sonst zweimal.

   DAS viewBox DER DURCHSICHTIGEN FASSUNG UMSCHLIESST DIE FARBE UND NICHT DIE
   KACHEL (`6.5 4.5 19 23`): bei stroke-width 3 und stroke-linecap round
   traegt die Farbe eine halbe Strichbreite ueber die Zeichnung hinaus. Damit
   ist die angegebene Hoehe die gezeichnete Hoehe. favicon.svg behaelt
   0 0 32 32 samt Kachel -- ein Kachelsymbol braucht seinen Rand.

   DIE WIRKLICHE GROESSE STEHT IM CSS, IN rem: die Instanz stellt die Schrift
   von 80 bis 120 Prozent. Die Attribute hier halten nur das Seitenverhaeltnis
   und den Platz, bis das Stylesheet greift. */
const MARK = (s = 30) =>
  `<img class="marke" src="marke-dunkel.svg" width="${Math.round(s * 19 / 23)}" height="${s}" alt="">`;

/* DIE MARKENZEILE DER ANMELDESEITEN: Marke UND Name in EINER Zeile, erst das
   Zeichen, dann das Wort -- dieselbe Anordnung wie `.brand` in der Kopfzeile
   des angemeldeten Bereichs. Uebereinander gestapelt las sich das Paar als
   zwei Dinge; nebeneinander ist es eines.

   SIE STEHT EINMAL HIER UND WIRD NEUNMAL GERUFEN (Stolperstein 145).

   SIE MISST SICH AM WORT UND NICHT AN DER LEEREN FLAECHE DARUEBER: so hoch
   wie der Text daneben, gemessen an dessen Zeilenhoehe. Die Zahl steht im
   CSS, damit sie der eingestellten Schriftgroesse folgt; 36 hier ist der
   Platzhalter bis dahin. */
const MARKENZEILE = () =>
  `<div class="login-marke">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;

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

// Mitwachsendes Textfeld. Der Rahmen muss dazugerechnet werden, weil
// box-sizing global auf border-box steht -- sonst bliebe eine Scrollleiste von
// zwei Pixeln stehen. Das Element muss im Dokument haengen, sonst ist
// scrollHeight null. Gibt die Messfunktion zurueck.
function autoGrow(el) {
  if (!el) return () => {};
  el.classList.add('ta-auto');
  const fit = () => {
    // Der Zwischenschritt height:auto laesst ein hohes Feld auf zwei Zeilen
    // zusammenfallen; der Browser zieht die Bildlaufposition auf das neue Ende
    // nach und gibt sie nicht von selbst zurueck -- Ergebnis waere ein Sprung
    // bei jedem Tastendruck. Deshalb Position merken und noch im selben
    // Durchlauf zuruecksetzen.
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

/* EIN NAME WIRD GEFRAGT -- nach dem Muster von confirmBox() und ausdruecklich
   KEIN prompt(): das steht am oberen Rand des Fensters, sieht in keinem
   Browser wie diese Instanz aus und laesst sich nicht beschriften.
   Liefert den getrimmten Namen oder null bei Abbruch. Ein leerer Name ist ein
   Abbruch: eine Ansicht ohne Namen liesse sich nicht wiederfinden. */
function nameBox(title, text, vorgabe = '', okLabel = 'Speichern', maxLaenge = 40) {
  return new Promise(resolve => {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal"><h2>${esc(title)}</h2><p class="hint">${esc(text)}</p>
      <div class="field"><input class="input" id="nb-name" maxlength="${maxLaenge}"
        value="${esc(vorgabe)}" placeholder="Name der Ansicht"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Abbrechen</button>
      <button class="btn btn-accent" data-yes>${esc(okLabel)}</button></div></div>`;
    document.body.appendChild(bd);
    const feld = bd.querySelector('#nb-name');
    const done = v => { document.removeEventListener('keydown', onKey, true); bd.remove(); resolve(v); };
    const nimm = () => { const w = feld.value.trim(); done(w || null); };
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = nimm;
    bd.onclick = e => { if (e.target === bd) done(null); };
    const onKey = e => {
      if (e.key === 'Escape') done(null);
      else if (e.key === 'Enter' && document.activeElement === feld) nimm();
    };
    document.addEventListener('keydown', onKey, true);
    feld.focus(); feld.select();
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
const BESTAETIGUNG_GRUND = 'Das trifft die ganze Anwendung — deshalb bestätigst du es mit ' +
  'deinem Passwort.';

/* STEHT HIER EIN ZWEITES FELD -- aber nur bei Zugaengen, die einen
   zweiten Faktor eingeschaltet haben. Wer ihn nicht will, sieht denselben
   Dialog wie vor dieser Runde.
   DIE FRAGE, OB DAS FELD DASTEHT, KOMMT VOM SERVER (`zweifaktor` aus
   GET /api/settings) und wird hier nie geraten. Ohne sie muesste der Dialog
   den ersten Versuch absichtlich scheitern lassen, um zu erfahren, dass ein
   Code fehlt -- und schriebe dabei bei JEDEM Vorgang eine Zeile
   'bestaetigung.fehl' ins Sicherheitsprotokoll. */
function passwortFenster(titel, was, grund, mitCode) {
  return new Promise(resolve => {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal"><h2>${esc(titel)}</h2>
      <p>${esc(was)}</p>
      ${grund ? `<p class="desc" style="margin:0">${esc(grund)}</p>` : ''}
      <div class="field" style="margin:0"><label>Dein Passwort</label>
        <input class="input" id="best-pass" type="password" autocomplete="current-password"></div>
      ${/* DAS FELD NENNT DAS VERFAHREN UND NICHT DAS GERAET. "Code aus deiner
           App" war zweimal falsch: es fragt nach der Herkunft statt nach der
           Sache, und es stimmt fuer die Haelfte der Faelle nicht -- hier traegt
           auch ein Wiederherstellungscode, und der kommt von einem Zettel.
           EIN FELD FUER BEIDE FORMEN, wie an der Anmeldung: der Server sieht
           der Eingabe an, was gemeint ist (istCodeform gegen istWiederform).
           Deshalb darf die Beschriftung keine von beiden ausschliessen. */''}
      ${mitCode ? `<div class="field" style="margin:10px 0 0"><label>Code des zweiten Faktors</label>
        <input class="input" id="best-code" inputmode="text" autocomplete="one-time-code"
          autocapitalize="characters" spellcheck="false" maxlength="16"></div>` : ''}
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Abbrechen</button>
      <button class="btn btn-accent" data-yes>Bestätigen</button></div></div>`;
    document.body.appendChild(bd);
    const feld = bd.querySelector('#best-pass');
    const codeFeld = bd.querySelector('#best-code');
    const wert = () => ({ passwort: feld.value, ...(codeFeld ? { code: codeFeld.value } : {}) });
    const done = v => { bd.remove(); resolve(v); };
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = () => done(wert());
    bd.onclick = e => { if (e.target === bd) done(null); };
    for (const el of [feld, codeFeld]) {
      if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') done(wert()); });
    }
    const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey, true); done(null); } };
    document.addEventListener('keydown', onKey, true);
    feld.focus();
  });
}

/* Das Fenster der ZWEITEN BESTAETIGUNG. Ob das Codefeld dasteht, entscheidet
   ZWEIFAKTOR und damit der Server -- die Oberflaeche raet es nie.
   DER ZUSATZSATZ STEHT NUR DA, WENN DAS FELD DASTEHT: ein Grund fuer eine
   Frage, die gar nicht gestellt wird, waere Verwirrung ohne Gegenwert. */
const bestaetigungsFeld = (titel, was) => passwortFenster(titel, was,
  BESTAETIGUNG_GRUND + (ZWEIFAKTOR
    ? ' Weil in deinem Profil ein zweiter Faktor eingeschaltet ist, gehört sein Code dazu. ' +
      'Hast du ihn nicht zur Hand, trägt auch ein Wiederherstellungscode.'
    : ''), ZWEIFAKTOR);

/* Dasselbe Fenster fuer die vier Wege des zweiten Faktors selbst, .
   ES HAT EINEN EIGENEN NAMEN UND KEINEN SCHALTER AN bestaetigungsFeld: dort
   haengt das Codefeld an ZWEIFAKTOR, hier am WEG. Beim Einschalten gibt es noch
   keinen Code zu fragen, beim Ausschalten gehoert er dazu -- und beide Male ist
   ZWEIFAKTOR die falsche Auskunft darueber.
   OHNE BESTAETIGUNG_GRUND: der steht fuer "das trifft die Instanz als Ganzes",
   und das trifft hier nicht zu -- es geht um den eigenen Zugang. Der Grund
   kommt deshalb je Weg von der Aufrufstelle. */
const bestaetigungsFeldFrei = (titel, was, mitCode) =>
  passwortFenster(titel, was, '', mitCode === true);

/* EINE ABFRAGE, EINE ANFRAGE, MEHRERE FREIGABEN. Ein Bestand, der in fuenf
   Teilen hinausgeht, braucht fuenf Freigaben -- eine Freigabe wird verbraucht,
   und fuenf mit demselben Ziel waeren EINE; der Schluessel ist Sitzung, Zweck
   und Ziel.
   ALLE ZIELE IN EINER ANFRAGE, und das ist die ganze Sache: ein Code des
   zweiten Faktors gilt GENAU EINMAL. Wer dieselbe Eingabe n-mal an den Server
   schickt, bekommt einmal 200 und n-1 mal "Der Code stimmt nicht" -- richtig
   gemeldet und trotzdem irrefuehrend, denn der Code war richtig und
   verbraucht. Fuer das Passwort gilt das nicht: es laeuft gegen einen Hash und
   laesst sich beliebig oft vergleichen. Der Unterschied ist die Stelle, an der
   ein n-facher Aufruf kippt.
   NEBENHER FAELLT DAMIT DREIERLEI WEG: n-1 Zeilen 'bestaetigung.fehl' ueber
   den Eigentuemer selbst, n-1 Fehlschlaege in der Anmeldebremse (bei elf
   Teilen griff die harte Sperre), und der verbrannte Wiederherstellungscode.
   WAS BLEIBT: das Laden eines Teils verbraucht genau eine Freigabe. Was
   zusammengefasst wird, ist die ABFRAGE und nicht die Schranke. */
async function zweiteBestaetigungMehrfach(zweck, ziele, titel, was) {
  const eingabe = await bestaetigungsFeld(titel, was);
  if (eingabe === null) return false;
  try { await api('POST', '/api/bestaetigung', { ...eingabe, zweck, ziele }); }
  catch (e) { toast(e.message, true); return false; }
  return true;
}

async function zweiteBestaetigung(zweck, ziel, titel, was) {
  const eingabe = await bestaetigungsFeld(titel, was);
  // null heisst abgebrochen -- ein Abbruch, der trotzdem handelt, waere der
  // schlimmere Fehler. Ein LEERES Feld ist keine Bestaetigung, sondern ein
  // falsches Passwort und geht als solches an den Server.
  if (eingabe === null) return false;
  try { await api('POST', '/api/bestaetigung', { ...eingabe, zweck, ziel: ziel ?? null }); }
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
/* Ob diese Instanz Anfragen annimmt. KOMMT VOM SERVER und wird hier nie
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
    ${MARKENZEILE()}
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
    ${MARKENZEILE()}
    <p class="sub">Bitte anmelden, um fortzufahren.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="lu">Benutzername</label>
      <input class="input" id="lu" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="lp">Passwort</label>
      <input class="input" id="lp" type="password" autocomplete="current-password"></div>
    <button class="btn btn-accent" id="lb">Anmelden</button>
    ${/* DIE SELBSTANMELDUNG — sie steht nur da, wenn der
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
      const j = await res.json().catch(() => ({}));
      /* DER ZWEITE SCHRITT, . Der Server hat KEINEN Cookie
         geschickt — es gibt noch keine Sitzung, und diese Seite hält auch
         keine halbe: sie hält nur den Ausweis, den sie gleich wieder
         hergibt. */
      if (j.zweifaktor) return showZweiterFaktor(j.ausweis);
      location.hash = '#/';
      start();
    } catch { showLogin('Server nicht erreichbar.'); }
  };
  b.onclick = submit;
  [u, p].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  u.focus();
}

/* Der zweite Schritt der Anmeldung.

   ES IST EINE SEITE UND KEIN ZUSTAND. Der Ausweis liegt in einer Variablen
   dieser Funktion und sonst nirgends — nicht im Speicher des Browsers, nicht
   in der Adresse. Wer neu lädt, steht wieder an der Anmeldung.

   EIN FELD FÜR BEIDE FORMEN: sechs Ziffern aus der App oder ein
   Wiederherstellungscode — der Server sieht der Eingabe an, was gemeint ist.

   DIE ABSAGE KOMMT VOM SERVER UND WIRD HIER NICHT ERFUNDEN. */
function showZweiterFaktor(ausweis, errMsg) {
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARKENZEILE()}
    <p class="sub">Noch der zweite Faktor.</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    ${/* Nicht "Sechsstelliger Code": hier traegt auch ein Wiederherstellungscode,
         und der hat zehn Zeichen. Die Beschriftung nennt deshalb das Verfahren,
         die Zeile darunter nennt den zweiten Weg. */''}
    <div class="field"><label for="zf-code">Code des zweiten Faktors</label>
      <input class="input" id="zf-code" inputmode="text" autocomplete="one-time-code"
        autocapitalize="characters" spellcheck="false" maxlength="16"></div>
    <button class="btn btn-accent" id="zf-ab">Anmelden</button>
    <p class="sub" style="margin:14px 0 0">Telefon nicht zur Hand? Hier trägt auch einer
      deiner <strong>Wiederherstellungscodes</strong> — jeder von ihnen genau einmal.</p>
  </div></div>`;
  document.title = TITLE_PUBLIC;
  const c = document.getElementById('zf-code'), b = document.getElementById('zf-ab');
  const submit = async () => {
    b.disabled = true; b.textContent = 'Anmelden …';
    try {
      const res = await fetch('/api/login/zwei', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ausweis, code: c.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        /* DER SERVER ENTSCHEIDET, OB ES HIER WEITERGEHT — an einem FELD und
           nicht an einem Statuscode: liegt der Absage ein frischer Ausweis
           bei, war der Code falsch und ein zweiter Anlauf steht offen. Liegt
           keiner bei (abgelaufene Anmeldung, Zugang inzwischen gesperrt, die
           Bremse), ist hier nichts mehr zu holen und der Mensch gehört zurück
           an den Anfang.
           DEN ALTEN AUSWEIS WEITERZUVERWENDEN WÄRE FALSCH: er ist verbraucht,
           auch nach einer Absage. */
        if (j.ausweis) return showZweiterFaktor(j.ausweis, j.error || 'Der Code stimmt nicht.');
        return showLogin(j.error || 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.');
      }
      location.hash = '#/';
      start();
    } catch { showZweiterFaktor(ausweis, 'Server nicht erreichbar.'); }
  };
  b.onclick = submit;
  c.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  c.focus();
}

/* Die Selbstanmeldung: das Formular und die Antwort darauf.

   ZWEI FELDER UND KEIN PASSWORT. Das Passwort wählt der Anfragende später
   selbst über den Einladungslink, und den bekommt er erst, wenn ein Admin ihn
   hereingelassen hat.

   DIE ANTWORT KOMMT VOM SERVER UND WIRD HIER NICHT ERFUNDEN: sie sieht in
   jeder Lage gleich aus, und diese Seite darf daraus keine zweite Auskunft
   machen — kein „Name bereits vergeben", kein Unterschied im Aussehen. */
function showAnfrage(errMsg, werte = {}) {
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARKENZEILE()}
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
    ${MARKENZEILE()}
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
    ${MARKENZEILE()}
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
      ${MARKENZEILE()}
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

   EIN ZUSTAND DIESER SEITE, KEINE ZWEITE DATEI: eine zweite ausgelieferte
   Seite hieße eine zweite Stelle für Kopfzeilen, für die
   Content-Security-Policy und für die Sicherheitsregel.

   DER SCHLÜSSEL STEHT IM FRAGMENT DER ADRESSE (#/einladung/…), und das ist
   der Grund für diese Bauform: ein Fragment geht nie an den Server und steht
   damit in keinem Zugriffsprotokoll und in keinem Referrer.

   DER NAME KOMMT ERST VOM SERVER, wenn der Link trägt — sonst verriete ein
   geratener Link einen Benutzernamen. */
async function showEinladung(schluessel) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('anmeldung');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${MARKENZEILE()}
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
    /* EINE VORÜBERGEHENDE ABSAGE DARF DEN SCHLÜSSEL NICHT WEGWERFEN. Leerte
       JEDES `!res.ok` die Adresse, träfe es auch die 429 der Anmeldebremse:
       wer sich vorher beim Anmelden vertippt hat und danach seinen GÜLTIGEN
       Einladungslink anklickt, sähe eine Fehlermeldung, lüde neu und stünde
       auf der Anmeldeseite -- der Link war nie tot, die Adresse war weg.
       DESHALB WIRD NUR BEI DER ENDGÜLTIGEN ABSAGE GELEERT. Bei allem anderen
       -- Bremse, Serverfehler, kein Netz -- bleibt der Schlüssel in der
       Adresse stehen.
       400 IST DIE ENDGÜLTIGE: die EINE Absage für abgelaufen, verbraucht,
       erfunden, Zugang gesperrt, Frist verstrichen. */
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
      ${MARKENZEILE()}
      <div class="login-error">${esc(meldung)}</div>
      <p class="sub">Dein Link ist davon <strong>nicht</strong> betroffen — er gilt weiter.
        Versuch es gleich noch einmal.</p>
      <button class="btn btn-accent" id="eb-neu">Noch einmal versuchen</button>
    </div></div>`;
    document.getElementById('eb-neu').onclick = () => showEinladung(schluessel);
  }

  function zeichne(errMsg) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${MARKENZEILE()}
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
        const j = await res.json().catch(() => ({}));
        /* DER ZWEITE FAKTOR WIRD AUCH HIER VERLANGT, — sonst wäre
           der Rücksetzlink der Weg daran vorbei. Das Passwort IST gesetzt und
           der Link verbraucht; was noch aussteht, ist die Anmeldung. Deshalb
           wird die Adresse auch hier geleert. */
        if (j.zweifaktor) { location.hash = '#/'; return showZweiterFaktor(j.ausweis); }
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
   aufgeklappt wie eingeklappt in der Kopfzeile.

       12 Kommentare, davon 3 Berichte und 5 Aufgaben (3 offen, 2 Erledigt)

   DAVON, nicht Mittelpunkte: die Zahlen dahinter sind TEILMENGEN, keine
   Summanden. Die Klammer nistet die zweite Ebene ein -- das Erledigte steckt
   IN den Aufgaben, sonst schrumpfte die Zahl beim Abhaken.
   DIE OFFENEN STEHEN VORAN, denn danach wird im Alltag gefragt. Sie werden
   ABGEZOGEN und nicht gezaehlt: `aufgaben - fertig` kann nicht von der Summe
   abweichen, eine zweite Zaehlung ueber `kind = 'task'` schon.
   DIE KLAMMER ERSCHEINT NUR, WENN ETWAS ERLEDIGT IST. Sonst stuende dort
   "5 Aufgaben (5 offen)" -- eine Zahl, die nichts hinzufuegt, weil die davor
   schon dasselbe sagt.
   Eine Gruppe mit null verschwindet ganz, und ohne Kommentare bleibt der
   Hinweis leer.
   DIE NOTIZ BLEIBT UNGENANNT: sie ist der Zustand ohne Markierung.
   DIE ANPINNUNG STEHT NICHT IN DER ZEILE: sie ist die zweite, unabhaengige
   Achse, und zwei Achsen in einer Zeile sind nicht mehr lesbar.
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
    + (fertig ? ` (${aufgaben - fertig} offen, ${fertig} ${V.aufgabeErledigt})` : ''));
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
/* DIE VERSIONSZEILE, und das Zeichen davor ist ein Aufruf und kein zweites
   Bild: MARK() liefert dieselbe durchsichtige Fassung, die auf allen neun
   Anmeldeseiten steht (Stolperstein 145).
   `alt=""` STECKT IN MARK() -- das Zeichen steht unmittelbar neben dem Namen
   der Instanz, und ein Vorleseprogramm saegte ihn sonst zweimal.
   DIE GROESSE STEHT IM STYLESHEET UND IN em: diese Zeile laeuft auf 0,67rem,
   und die Instanz stellt die Schrift von 80 bis 120 Prozent. Eine feste
   Pixelzahl bliebe bei jeder anderen Einstellung stehen, waehrend die Schrift
   daneben mitwaechst.
   Der Name geht durch esc(): er kommt zwar aus dem eigenen package.json und
   nicht von aussen, aber innerHTML ist innerHTML. */
function zeigeVersion() {
  const el = document.getElementById('version');
  if (!el) return;
  el.innerHTML = VERSION ? `${MARK()}<span>Kriterion ${esc(VERSION)}</span>` : '';
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

/* ================= Der Ausschnitt der Vorschau =================
   DREI WERTE ALS EIN STIL. Zugeschnitten wird nichts: die Datei bleibt, wie
   sie ist. Die beiden Prozentwerte verschieben das sichtbare Fenster der
   quadratischen Vorschau (object-position), der dritte zieht es enger.
   FEHLENDE WERTE (aeltere Fotos, eine Antwort ohne das Feld) landen in der
   Mitte und auf dem weitesten Ausschnitt -- also genau dort, wo sie bis
   0.18.1 immer lagen.

   DER ZOOM GEHT ALS EIGENSCHAFT `--zoom` HINAUS UND NICHT ALS transform.
   Der Grund steht im Stylesheet: `.card:hover .card-img img` skaliert die
   Kachel beim Ueberfahren um 1,03. Ein transform HIER waere ein Inline-Stil
   und schluege jede Regel von dort -- der zugezogene Ausschnitt naehme der
   Uebersicht ihre Bewegung weg, und zwar nur an den Kacheln, an denen jemand
   den Ausschnitt eingestellt hat. Als Eigenschaft rechnet das Stylesheet
   beides zusammen.

   UND DER VERGROESSERUNGSPUNKT GEHT MIT, seit 0.19.1. `transform-origin` steht
   auf DEMSELBEN Punkt wie `object-position`. Ohne ihn verankert `scale()` in
   der Mitte: man saehe erst den object-position-Ausschnitt und DAVON nochmal
   den mittigen Teil, und je enger man zieht, desto weiter sind die Raender
   weg. GEMESSEN IN ECHTEM CHROMIUM (Kachel 313 x 313, Zoom 250 %, Fokuspunkt
   in eine Ecke): von der gewaehlten Bildecke war in allen vier Richtungen
   0,0 % zu sehen; mit `transform-origin` sind es 30,7 % oben und 15,4 % unten.
   Das ist Stolperstein 276.

   ER DARF MIT HINAUS, DER ZOOM NICHT: `transform-origin` IST KEIN `transform`
   und schlaegt deshalb die Ueberfahrregel nicht (Stolperstein 272). Gerechnet
   wird der Zoom weiter im Stilblatt.

   EINE FUNKTION UND NICHT ZWEI: `fokus()` hiess sie bis 0.18.1 und lieferte
   nur die object-position. Zwei Funktionen -- eine fuer den Punkt, eine fuer
   die Weite -- waeren zwei Wahrheiten ueber denselben Ausschnitt, und die
   Aufrufstelle, die die zweite vergisst, saehe von aussen richtig aus. */
function ausschnitt(p) {
  // Vorsicht: Number(null) ist 0, nicht NaN -- deshalb erst auf eine Zahl
  // pruefen und nicht bloss umwandeln. Sonst rutscht ein fehlender Wert in
  // die Ecke oben links statt in die Mitte.
  const z = (v, vorgabe) => (typeof v === 'number' && Number.isFinite(v) ? v : vorgabe);
  // EIN Wertepaar, zweimal ausgegeben -- nicht zweimal gerechnet. Zwei
  // Rechenwege liefen frueher oder spaeter auseinander, und dann zoege die
  // Vergroesserung an einem anderen Punkt als der Ausschnitt.
  const x = z(p && p.focus_x, 50), y = z(p && p.focus_y, 50);
  return `object-position:${x}% ${y}%;transform-origin:${x}% ${y}%;` +
         `--zoom:${z(p && p.zoom, 100) / 100}`;
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
  // EIN EINGEKLAPPTER BLOCK MISST NULL: seine Kinder stehen auf
  // display: none, und aus der Hoehe 0 entstuende eine feste maxHeight, die
  // nach dem Aufklappen stehenbliebe. Also gar nichts setzen.
  // ZWEITER WEG NOETIG: das Aufklappen zeichnet die Wolke neu -- dieser Weg
  // haelt die falsche Hoehe fern, jener holt die richtige nach.
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
// messen, wenn ihr Block offen ist. Modulweit statt als Ereignis am Dokument:
// ein Behandler am bleibenden Dokument ueberlebte jeden Neuaufbau. Geleert in
// route(), gesetzt in renderDetail().
let wolkeNeuzeichnen = null;

/* ================= Vokabular und Darstellung ================= */
// Die Oberflaeche benennt sich um, die Daten nicht. Alle Texte sind so
// geschrieben, dass weder Beiwort noch Fall vorkommt -- sonst muesste man das
// Geschlecht des eingetragenen Wortes kennen. Merksatz: Plural im Nominativ
// und Akkusativ ist immer sicher; Dativ Plural und Singular meiden.
let V = {
  sacheEinzahl: 'Eintrag', sacheMehrzahl: 'Einträge',
  merkmalJa: 'Getestet', merkmalNein: 'Ungetestet',
  zeitpunktEinzahl: 'Testtag', zeitpunktMehrzahl: 'Testtage',
  berichtEinzahl: 'Bericht', berichtMehrzahl: 'Berichte',
  aufgabeEinzahl: 'Aufgabe', aufgabeMehrzahl: 'Aufgaben',
  aufgabeErledigt: 'Erledigt'
};

// Weiterschaltung des Aufgabenknopfes: Notiz -> Aufgabe -> erledigt -> Notiz.
// Eine Abfolge, kein Entweder-oder -- deshalb ein Knopf statt dreier.
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
// nicht anschlagen, solange Schranke 1 richtig ist. Nur weil der Knotenbauer
// einzeln aufrufbar ist, laesst sich ihm im Pruefstand ein javascript:
// vorlegen und die zweite Schranke ueberhaupt gegenpruefen.

// Schranke 1. Nur ausdruecklich Geschriebenes gilt: http://, https:// und
// www. ohne Schema. Ein blankes beispiel.de ausdruecklich nicht -- deutscher
// Fliesstext ist voll von "z.B." und "usw.", jede Endungsregel produziert dort
// Fehltreffer. javascript: kann hier gar nicht erst passen.
// Der Anfang wird mitgefangen: weiter unten wird nur noch gefragt, ob nach ihm
// etwas stehen blieb -- sonst staende die Schemaentscheidung an zwei Stellen.
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

/* ---- DIE HERVORHEBUNG, ALS DRITTES STUECK -- 0.18.0 --------------------
   BIS 0.17.5 KANNTE DIE ZERLEGUNG ZWEI STUECKE: gewoehnlichen Text und einen
   Link. Seit 0.18.0 gibt es ein drittes -- die Fundstelle des Suchbegriffs.

   SIE ENTSTEHT IN DER ZERLEGUNG UND NICHT HINTERHER. Wer das fertige Ergebnis
   nachbearbeitet, muss dafuer wieder in Strings denken -- maskieren,
   `<mark>` hineinschreiben, wieder als Markup einsetzen --, und genau dort
   entsteht der Fehler, den 0.5.4 zugemacht hat. Hier entsteht kein einziges
   Zeichen Markup: das Stueck sagt nur, DASS es eine Fundstelle ist, und der
   Knotenbauer macht daraus ein Element mit textContent.

   DER BEGRIFF WIRD GENOMMEN, WIE ER GETIPPT UND GETRIMMT IST -- dieselbe
   Klemme wie im Server (volltextBegriff), und gesucht wird mit indexOf und
   nicht mit einem Muster: aus einem Suchbegriff ein regulaeres Ausdrucksmuster
   zu bauen hiesse, jedes Sonderzeichen darin maskieren zu muessen. Ein
   eingegebenes `.` faende sonst jedes Zeichen -- derselbe Fehler wie LIKE
   gegen instr() im Server, nur im Browser.

   VERGLICHEN WIRD KLEINGESCHRIEBEN, angezeigt der Originaltext: wer "bella"
   tippt, will "Bellavista" markiert sehen und nicht "bella" daruntergelegt.

   DIE UEBRIGEN ANGABEN EINES STUECKS REISEN MIT (`rest`). Damit zerfaellt auch
   eine Adresse, in der der Begriff steht, in mehrere Stuecke MIT demselben
   Ziel -- der Knotenbauer setzt sie danach wieder zu EINEM Link zusammen. */
function zerlegeAmBegriff(text, begriff, rest = {}) {
  const t = String(text ?? '');
  const b = String(begriff ?? '');
  if (!t) return [];
  if (!b) return [{ text: t, ...rest }];
  const klein = t.toLowerCase(), kleinB = b.toLowerCase();
  const stuecke = [];
  let von = 0;
  for (;;) {
    const i = klein.indexOf(kleinB, von);
    if (i < 0) break;
    if (i > von) stuecke.push({ text: t.slice(von, i), ...rest });
    stuecke.push({ text: t.slice(i, i + b.length), ...rest, treffer: true });
    von = i + b.length;
  }
  if (von < t.length) stuecke.push({ text: t.slice(von), ...rest });
  return stuecke;
}

// Zerlegt den Rohtext in Stuecke: { text } ist gewoehnlicher Text,
// { text, ziel } ein Link, { text, treffer } eine Fundstelle des Suchbegriffs.
// Gearbeitet wird auf dem Rohtext, nicht auf maskiertem -- sonst zerrisse ein
// &amp; jede Abfragezeichenfolge.
// DIE LINKS WERDEN ZUERST GESUCHT UND DER BEGRIFF DANACH: umgekehrt zerschnitte
// eine Fundstelle die Adresse, bevor sie ueberhaupt als eine erkannt waere.
function zerlegeKommentartext(roh, begriff) {
  const text = String(roh ?? '');
  const stuecke = [];
  const nimm = (t, rest) => { for (const s of zerlegeAmBegriff(t, begriff, rest)) stuecke.push(s); };
  let zuletzt = 0, treffer;
  KOMMENTAR_LINK.lastIndex = 0;
  while ((treffer = KOMMENTAR_LINK.exec(text)) !== null) {
    const adresse = kuerzeLinkende(treffer[0]);
    // Nach dem Abschneiden kann ein nacktes "https://" uebrigbleiben. Das ist
    // keine Adresse und wird wieder zu Text. Gefragt wird allein, ob nach dem
    // Anfang noch etwas steht -- ueber das Schema entscheidet das Muster.
    if (adresse.length <= treffer[1].length) continue;
    if (treffer.index > zuletzt) nimm(text.slice(zuletzt, treffer.index), {});
    nimm(adresse, {
      // angezeigt wird die Adresse, wie geschrieben
      ziel: /^www\./i.test(adresse) ? 'https://' + adresse : adresse
    });
    zuletzt = treffer.index + adresse.length;
  }
  if (zuletzt < text.length) nimm(text.slice(zuletzt), {});
  return stuecke;
}

/* Ein Stueck als Knoten. EINE FUNDSTELLE WIRD ZU <mark>, alles andere zu
   gewoehnlichem Text -- in beiden Faellen ueber textContent. Markup kann auf
   diesem Weg gar nicht entstehen, und das ist der ganze Punkt: die Zusage aus
   0.5.4 haengt nicht daran, dass jemand das Maskieren nicht vergisst. */
function stueckKnoten(s) {
  const text = String(s?.text ?? '');
  if (!s?.treffer) return document.createTextNode(text);
  const m = document.createElement('mark');
  m.textContent = text;
  return m;
}

// Baut echte DOM-Knoten. Kein innerHTML auf diesem Weg: Maskierung ist damit
// nicht "nicht vergessen worden", sondern baulich unmoeglich.
function baueKommentarknoten(stuecke) {
  const teil = document.createDocumentFragment();
  // Leere Stuecke fallen vorher heraus, damit weiter unten keine Abfrage auf
  // "" mitten in der Zusammenfassung eines Links steht.
  const liste = (stuecke || []).filter(s => String(s?.text ?? '') !== '');
  for (let i = 0; i < liste.length; i++) {
    const s = liste[i];
    // Schranke 2: unmittelbar vor dem Setzen von href noch einmal pruefen.
    // Faellt der String durch, wird sie gewoehnlicher Text, nicht Link.
    if (s.ziel && /^https?:\/\//i.test(String(s.ziel))) {
      const a = document.createElement('a');
      a.href = String(s.ziel);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      /* EINE ADRESSE BLEIBT EIN LINK, AUCH WENN DER BEGRIFF MITTEN DARIN
         STEHT. Die Zerlegung liefert sie dann als mehrere Stuecke mit
         DEMSELBEN Ziel; hier werden sie in EINEN Anker gefuellt. Drei Anker
         nebeneinander waeren drei Links auf dieselbe Adresse -- fuer ein
         Vorleseprogramm drei Ziele statt einem, und beim Kopieren drei
         Stuecke statt einer Adresse. */
      let j = i;
      while (j < liste.length && String(liste[j].ziel ?? '') === String(s.ziel))
        a.appendChild(stueckKnoten(liste[j++]));
      i = j - 1;
      teil.appendChild(a);
      continue;
    }
    teil.appendChild(stueckKnoten(s));
  }
  return teil;
}

/* DIE HERVORHEBUNG FUER JEDEN TEXT OHNE LINKS -- Titel, Kategorie, Tag,
   Kontextzeile, Linkadresse. Denselben Weg geht der Kommentartext, nur mit
   der Linkzerlegung davor: ein Knotenbauer und nicht zwei. */
const hebeHervor = (text, begriff) =>
  baueKommentarknoten(zerlegeAmBegriff(String(text ?? ''), begriff));

/* DEN INHALT EINES ELEMENTS DURCH HERVORGEHOBENE KNOTEN ERSETZEN. Ohne
   Begriff wird gar nichts angefasst -- ohne Suche gibt es nichts
   hervorzuheben, und ein unnoetig neu gebauter Knoten waere Arbeit ohne
   Wirkung. Ein fehlendes Element ist kein Fehler: die Kategorie steht nicht
   an jeder Kachel. */
function hebeImKnoten(el, text, begriff) {
  if (!el || !begriff) return;
  el.replaceChildren(hebeHervor(text, begriff));
}

let SCHRIFT = 100;
const SCHRIFT_STUFEN = [80, 90, 100, 110, 120];
// Es wird genau ein Wert gesetzt: das Grundmass am Wurzelelement. Alle
// Schriftgroessen im Stylesheet haengen als rem daran.
function wendeSchriftAn() {
  document.documentElement.style.fontSize = (15 * SCHRIFT / 100).toFixed(2) + 'px';
}

/* DER SCHMALE SCHIRM, ALS FRAGE AN DEN BROWSER.
   SIE STEHT WOERTLICH SO AUCH IM STYLESHEET, und das ist die einzige Stelle
   in der ganzen Instanz, an der eine Bedingung zweimal geschrieben steht. Es
   geht nicht anders: das Stylesheet entscheidet, WAS zu sehen ist, und die
   Oberflaeche muss wissen, ob die Filter beim Aufbau eingeklappt anfangen
   sollen -- eine Frage, die nur der Browser beantworten kann. Wer eine der
   beiden Zahlen aendert, aendert die andere mit; im Stylesheet steht dieselbe
   Zeile unter der Ueberschrift "DAS TELEFON".
   WARUM ZWEI BEDINGUNGEN: ein Telefon quer ist 850 bis 930 Pixel breit und
   keine 500 hoch. Nach der Breite allein waere es ein Tablett. */
const SCHMAL = '(max-width: 700px), (max-height: 500px) and (max-width: 960px)';
const istSchmal = () => !!(window.matchMedia && window.matchMedia(SCHMAL).matches);

/* ================= Zustand ================= */
/* DIE VORGABESTELLUNG DER FILTER STEHT GENAU EINMAL -- sonst laufen die
   Abschriften auseinander, sobald jemand einen Filter ergaenzt. */
/* "Ohne Kategorie" ist ein WERT DIESER LISTE und kein Sonderfall daneben --
   deshalb steht er in derselben Auswahl wie jede Kategorie und laesst sich mit
   ihnen zusammen anklicken. Ein Wort und keine Nummer: Nummern sind
   Kategorienummern, und eine erfundene (0 oder -1) waere irgendwann eine echte.
   ER STEHT IM GESPEICHERTEN JSON und muss deshalb stabil bleiben. */
const KATEGORIE_OHNE = 'ohne';
/* SEIT 0.13.0 EINE LISTE UND KEINE EINZELNE NUMMER. Der Filter traegt mehrere
   Kategorien zugleich, und die Verknuepfung ist ein ODER -- nie ein UND:
   `product_category_id` ist EINE Spalte, ein Eintrag traegt also genau eine
   Kategorie, und "Datentraeger UND Produkt" waere garantiert leer. */
/* `neu` STEHT HIER SEIT 0.17.0 NICHT MEHR. Die Pille „Neu seit ..." ist
   gestrichen; ihre Auskunft traegt die Glocke. Eine gespeicherte Ansicht aus
   0.11.0 kann den Schluessel noch tragen -- filterNormal() uebergeht ihn. */
const FILTER_VORGABE = { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                         abgelehnt: 'all', favorit: false,
                         sort: 'updated_desc' };
const state = {
  items: [], categories: [], tags: [], criteria: [],
  filters: { ...FILTER_VORGABE },
  search: '', compare: new Set(),
  /* SUCHT DER SERVER, und daraus folgen vier Felder.
     `alle` ist der ungefilterte Bestand aus dem letzten loadAll(). Er bleibt
     liegen, damit das LEEREN der Suche keine Anfrage kostet -- ohne ihn waere
     die haeufigste Handhabung der Suche (tippen, wieder loeschen) die
     teuerste. `items` ist, was gerade gezeigt wird: entweder `alle` oder die
     Antwort auf einen Suchbegriff.
     `bestand` ist die Zahl des GANZEN Bestands fuer die Zaehlzeile. Ohne sie
     stuende dort waehrend einer Suche die Trefferzahl als Gesamtzahl -- "3
     Sachen · 3 sichtbar", und der Bestand von 300 waere verschwunden.
     `suchLaeuft` und `suchFehler` sind Ansichtszustand und keine Einstellung:
     beim naechsten Aufruf steht wieder die Vorgabe. */
  alle: [], bestand: 0, suchLaeuft: false, suchFehler: false,
};

// Die Einstellungen werden einmal beim Start geholt -- auch beim Direkteinstieg
// auf einen Eintrag oder den Systembereich, wo loadAll() gar nicht laeuft.
let EINSTELLUNGEN = null;

// Abgeleitet, nicht eingestellt. BENUTZER_ZAHL entscheidet, ob die
// Durchschnittsspalte ueberhaupt erscheint; ADMIN steuert die Kriterienkarte,
// EIGENTUEMER, was in der Karte "Zugaenge" bedienbar ist. Der Server
// verweigert beides ohnehin -- die Felder ersparen der Oberflaeche eine zweite
// Wahrheit darueber, wem die Instanz gehoert.
let BENUTZER_ZAHL = 1;
let ADMIN = true;
let EIGENTUEMER = true;
// Der eigene Name in der Kopfzeile. AUCH BEI EINEM EINZIGEN ZUGANG: das ist
// eine Aussage ueber MICH, nicht ueber andere -- derselbe Grund, aus dem die
// Karte "Zugang" fuer jeden stehenbleibt.
let NAME = '';
// Die Schwelle steht GENAU HIER und nirgends sonst.
const mehrereBenutzer = () => BENUTZER_ZAHL > 1;

/* DER BEZUGSPUNKT DER GLOCKE, und seit 0.17.0 der EINZIGE. Bis dahin stand ein
   zweiter daneben: `zuletztGesehen` trug die Pille „Neu seit ..." und fiel beim
   Verlassen der Uebersicht, dieser hier faellt erst, wenn die Tafel WIRKLICH
   geoeffnet wurde. Zwei Anzeigen fuer dieselbe Frage -- was hat sich getan,
   seit ich zuletzt hier war -- sind eine zu viel; die Pille ist gestrichen,
   und ihr Merker mit ihr.
   null heisst „noch nie gesetzt": dann gibt es keine Glocke. Alles fuer neu zu
   erklaeren waere eine Behauptung, und der erste Blick in die Uebersicht
   laeutete fuer den ganzen Bestand. Gesetzt wird er beim ersten Verlassen der
   Uebersicht; von da an ist er der Strich, hinter dem gezaehlt wird. */
let GLOCKE_GESEHEN = null;

/* Die beiden Anlegen-Schalter, global und mit Vorgabe an. Der Bildschirm haelt
   sich an dieselbe Regel wie der Server: DER ADMIN KOMMT IMMER DURCH. Bote die
   Oberflaeche die Zeile "+ neu anlegen" trotz ausgeschaltetem Schalter an,
   erzeugte sie zuverlaessig eine Fehlermeldung -- und ein solcher Knopf sieht
   aus wie ein Fehler.
   Aus heisst ausdruecklich NUR: die Zeile zum Anlegen verschwindet. Auswahl
   und Wolke bleiben, denn zuweisen darf immer jeder. */
let TAGS_FREI = true;
let KATEGORIEN_FREI = true;
/* WANDELT DIESE INSTANZ ANKOMMENDE PNG UM? Vorgabe an, wie im Server. Der Wert
   entscheidet hier NICHTS -- die Umwandlung geschieht im Server, und der liest
   seine eigene Einstellung. Er sagt der Karte nur, wo der Haken steht; die
   Schranke liegt nicht hier. */
let BILDER_UMWANDELN = true;
/* Ob DIESER Zugang einen zweiten Faktor traegt, . KOMMT VOM SERVER
   und wird hier nie geraten: die Oberflaeche entscheidet damit nur, ob das
   Bestaetigungsfenster ein zweites Feld zeigt. Wer den Wert von Hand auf false
   setzt, bekommt ein Fenster ohne Codefeld -- und der Server weist die
   Bestaetigung ab. Die Schranke liegt nicht hier. */
let ZWEIFAKTOR = false;
/* Die Frist des Papierkorbs. Sie kommt aus /api/settings und wird hier NICHT
   nachgebaut: die Zahl steht im Server an einer Stelle, und der Löschdialog
   nennt sie jedem — auch dem, der die Karte gar nicht sehen darf. Die 30
   hier ist kein zweiter Wert, sondern der Rückfall für eine Antwort, die das
   Feld nicht kennt. */
let PAPIERKORB_TAGE = 30;
/* DIE GESPEICHERTEN ANSICHTEN, . Persoenlich, wie die eine gemerkte
   Filterstellung daneben -- und sie ERSETZEN diese nicht: `filters` bleibt die
   zuletzt benutzte Stellung und wird weiter bei jeder Aenderung
   ueberschrieben. Eine Ansicht wird nur auf Zuruf angewandt.
   DER DECKEL KOMMT VOM SERVER. Er steht dort an einer Stelle und wird hier
   nicht nachgebaut; die 8 ist der Rueckfall fuer eine Antwort, die das Feld
   nicht kennt. */
let ANSICHTEN = [];
let ANSICHTEN_DECKEL = 8;
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
  if (Array.isArray(EINSTELLUNGEN.ansichten)) ANSICHTEN = EINSTELLUNGEN.ansichten;
  if (EINSTELLUNGEN.ansichtenDeckel) ANSICHTEN_DECKEL = EINSTELLUNGEN.ansichtenDeckel;
  // Ausdruecklich nur beim ERSTEN Laden. ladeEinstellungen() laeuft nur in
  // start(); ein spaeterer Aufruf duerfte den Bezugszeitpunkt nicht mehr
  // nachziehen, sonst verschwaende die Menge unter dem Zeiger.
  if (EINSTELLUNGEN.glockeGesehen) GLOCKE_GESEHEN = EINSTELLUNGEN.glockeGesehen;
  if (Array.isArray(EINSTELLUNGEN.suchAnbieter)) SUCHANBIETER = EINSTELLUNGEN.suchAnbieter;
  if (EINSTELLUNGEN.suchNamen) SUCHNAMEN = EINSTELLUNGEN.suchNamen;
  // Der Server leitet beide beim Lesen ab und liefert sie immer; die Vorgabe
  // hier greift nur, wenn die Antwort das Feld gar nicht kennt.
  if (EINSTELLUNGEN.tagsFreiAnlegen !== undefined) TAGS_FREI = EINSTELLUNGEN.tagsFreiAnlegen !== false;
  if (EINSTELLUNGEN.kategorienFreiAnlegen !== undefined)
    KATEGORIEN_FREI = EINSTELLUNGEN.kategorienFreiAnlegen !== false;
  if (EINSTELLUNGEN.bilderUmwandeln !== undefined)
    BILDER_UMWANDELN = EINSTELLUNGEN.bilderUmwandeln !== false;
  if (EINSTELLUNGEN.papierkorbTage) PAPIERKORB_TAGE = EINSTELLUNGEN.papierkorbTage;
  ZWEIFAKTOR = EINSTELLUNGEN.zweifaktor === true;
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
  /* DER UNGEFILTERTE BESTAND KOMMT HIER UND NUR HIER. `alle` ist die Quelle,
     `items` das, was gezeigt wird -- beim Betreten der Uebersicht dasselbe.
     Stand vorher ein Suchbegriff im Feld, wird er gleich darunter neu gefragt;
     bis die Antwort da ist, steht der ganze Bestand da und nicht nichts. */
  /* `alle` und `items` zeigen hier auf DASSELBE Feld, und das ist gewollt: eine
     Kopie von tausend Objekten waere Arbeit fuer nichts. Es traegt nur, solange
     niemand `state.items` an der Stelle veraendert -- gefiltert und sortiert
     wird ueber Kopien (`[...out].sort(...)` in visibleItems), und ein push oder
     splice darauf gibt es nirgends. Wer je eines einbaut, veraendert damit auch
     den ungefilterten Bestand. */
  state.alle = items; state.items = items; state.bestand = items.length;
  state.suchFehler = false;
  state.categories = categories; state.tags = tags; state.criteria = criteria;
  TITLE_APP = titles.appTitle; TITLE_PUBLIC = titles.publicTitle;
  document.title = TITLE_APP;
  const settings = EINSTELLUNGEN;
  if (settings && settings.filters) state.filters = filterNormal(settings.filters);
}

/* EINE GESPEICHERTE FILTERSTELLUNG WIRD BEIM ANWENDEN ZURECHTGERUECKT, nicht
   beim Speichern. Sie kommt aus zwei Quellen -- der gemerkten Stellung und
   einer gespeicherten Ansicht -- und beide gehen durch DIESEN Weg.

   ERSTENS DIE FEHLENDEN FELDER: das Ausbreiten setzt ein fehlendes Feld nicht
   auf die Vorgabe zurueck, es laesst es weg -- und `undefined` zeichnete den
   Knopf nicht sauber.

   ZWEITENS DIE NUMMERN, DIE ES NICHT MEHR GIBT. JSON kennt keine Kaskade:
   eine geloeschte Kategorie bleibt als Nummer stehen und filterte danach auf
   etwas, das niemand mehr hat -- die Liste waere leer, und nichts sagte
   warum. UEBERGANGEN, NICHT ZURUECKGESCHRIEBEN: der gespeicherte Wert bleibt,
   wie er ist. Ein Lesevorgang, der die Ansicht eines Menschen
   umschreibt, ist schlimmer als eine Nummer, die ins Leere zeigt. */
function filterNormal(roh) {
  const f = { ...FILTER_VORGABE, ...(roh && typeof roh === 'object' ? roh : {}) };
  f.tagIds = (Array.isArray(f.tagIds) ? f.tagIds : []).filter(id => state.tags.some(t => t.id === id));
  /* DIE UEBERSETZUNG DER ALTEN FORM, an genau dieser einen Stelle. Vor 0.13.0
     stand in einer gespeicherten Ansicht EIN Kategoriewert (`categoryId`).
     Ohne diese Zeilen verloeren alle vorhandenen Ansichten ihre Kategorie --
     still und ohne Meldung, weil das Ausbreiten oben ein unbekanntes Feld
     einfach stehenlaesst und `categoryIds` auf der leeren Vorgabe bliebe.
     HIER UND NICHT AN JEDER LESESTELLE: filterNormal ist der Ort, an dem eine
     gespeicherte Stellung zurechtgerueckt wird; ein zweiter Weg daneben liefe
     auseinander.
     DER GESPEICHERTE WERT WIRD NICHT ZURUECKGESCHRIEBEN -- gelesen wird er
     uebersetzt, in der Ablage bleibt er, wie er ist. Dieselbe Linie wie bei
     den Nummern, die es nicht mehr gibt: ein Lesevorgang, der die Ansicht
     eines Menschen umschreibt, ist schlimmer als ein alter Wert. */
  if (!Array.isArray(f.categoryIds))
    f.categoryIds = f.categoryId != null ? [f.categoryId] : [];
  else if (f.categoryId != null && !f.categoryIds.length) f.categoryIds = [f.categoryId];
  // Das alte Feld faellt aus der zurechtgerueckten Stellung heraus: sie wird
  // Zeichen fuer Zeichen mit der aktuellen verglichen (welche Ansicht gerade
  // gilt), und ein mitgeschlepptes Feld liesse jede alte Ansicht als "nicht
  // aktiv" erscheinen, obwohl sie genau das zeigt, was sie zeigen soll.
  delete f.categoryId;
  /* NUMMERN, DIE ES NICHT MEHR GIBT, FALLEN WEG -- und der Rest bleibt stehen.
     Bis 0.12.4 fiel eine Ansicht mit geloeschter Kategorie ganz auf "Alle"
     zurueck; mit einer Liste faellt sie auf den REST zurueck, und das ist der
     bessere Ausgang: von drei gewaehlten Kategorien soll eine geloeschte nicht
     die beiden anderen mitnehmen.
     "Ohne" BLEIBT IMMER STEHEN: es ist kein Kategoriewert und trotzdem
     gueltig. */
  f.categoryIds = [...new Set(f.categoryIds)].filter(v =>
    v === KATEGORIE_OHNE || state.categories.some(c => c.id === v));
  if (f.tagMode !== 'or') f.tagMode = 'and';
  f.favorit = f.favorit === true;
  /* DER SCHLUESSEL EINER GESTRICHENEN PILLE FAELLT HERAUS -- 0.17.0. Eine
     gespeicherte Ansicht aus 0.11.0 kann `neu` noch tragen; sie muss ihn
     UEBERGEHEN statt daran zu scheitern. Dieselbe Regel wie beim Schluessel
     `abgelehnt`, den 0.15.0 hinzugefuegt hat, nur andersherum.
     UND ER MUSS WIRKLICH HERAUSFALLEN: die zurechtgerueckte Stellung wird
     Zeichen fuer Zeichen mit der aktuellen verglichen (welche Ansicht gerade
     gilt), und ein mitgeschlepptes Feld liesse jede alte Ansicht als „nicht
     aktiv" erscheinen -- dieselbe Ueberlegung wie bei `categoryId` darueber.
     DER GESPEICHERTE WERT BLEIBT, WIE ER IST: gelesen wird er uebergangen, in
     der Ablage steht er weiter. Ein Lesevorgang, der die Ansicht eines
     Menschen umschreibt, ist schlimmer als ein alter Wert. */
  delete f.neu;
  return f;
}

/* ================= Die Suche fragt den Server =================
   JEDER TASTENDRUCK IST EINE ANFRAGE UEBER DAS NETZ. Drei Vorkehrungen
   gehoeren dazu, und alle drei sind gebaut und nicht gehofft.

   ERSTENS DER DEBOUNCE: 220 ms, ab dem ERSTEN Zeichen. Eine Mindestzahl an
   Zeichen waere die eine Wegnahme, die diese Runde nicht machen darf -- ein
   einzelnes Zeichen fand vorher, also findet es weiter. 220 ms liegen ueber
   dem Tastenabstand eines schnellen Schreibers (er fasst damit die meisten
   Anschlaege zusammen) und unter der Schwelle, an der Tippen zu haken
   beginnt. DAS LEEREN LAEUFT OHNE Debounce und ohne Anfrage: der ungefilterte
   Bestand liegt in state.alle.

   ZWEITENS DIE REIHENFOLGE. Zwei Anfragen koennen sich ueberholen; die
   Antwort auf "bo" darf die auf "bosch" nicht ueberschreiben. Jede Anfrage
   bekommt eine laufende Nummer, und nur die jeweils hoechste darf schreiben.
   Ohne diese Nummer zeigte die Liste gelegentlich das Ergebnis eines
   Suchbegriffs, der nicht mehr im Feld steht -- selten, unerklaerlich und
   nicht nachstellbar.

   DRITTENS DER RUECKFALL. Vorher KONNTE die Suche nicht scheitern, jetzt
   schon. Scheitert sie, bleibt stehen, was da ist, und die Zaehlzeile sagt es
   einmal. EINE ERSATZSUCHE IM BROWSER GIBT ES AUSDRUECKLICH NICHT: sie haette
   die Kommentare nicht und faende damit weniger -- zwei Antworten auf
   dieselbe Frage, und die schlechtere ohne Kennzeichen. */
const SUCH_VERZOEGERUNG = 220;
let suchUhr = null;
let suchLauf = 0;

/* Das Kreuz zum Leeren steht nur da, wenn etwas zu leeren ist. Der Helfer
   liest das FELD und nicht state.search: er wird auch gerufen, nachdem eine
   gespeicherte Ansicht das Feld gesetzt hat, und dann ist das Feld die
   Wahrheit. */
function syncSuchknopf() {
  const q = document.getElementById('q'), c = document.getElementById('qclr');
  if (q && c) c.style.display = q.value ? 'block' : 'none';
}

/* Der Begriff wird genau so zugeschnitten wie im Server: aussen getrimmt.
   Kleingeschrieben wird dort -- die Anfrage traegt, was der Mensch getippt
   hat, und der Vergleich ist an einer Stelle. */
async function sucheAusfuehren() {
  const begriff = state.search.trim();
  const lauf = ++suchLauf;
  if (!begriff) {
    // Ohne Begriff ist der ganze Bestand die Antwort, und der liegt schon da.
    state.items = state.alle;
    state.suchLaeuft = false; state.suchFehler = false;
    drawFilters(); drawBody();
    return;
  }
  state.suchLaeuft = true;
  drawBody();
  try {
    const treffer = await api('GET', `/api/items?q=${encodeURIComponent(begriff)}`);
    if (lauf !== suchLauf) return;          // eine neuere Anfrage ist unterwegs
    state.items = treffer;
    state.suchLaeuft = false; state.suchFehler = false;
  } catch (e) {
    if (lauf !== suchLauf) return;
    if (e.message === 'Sitzung abgelaufen') return;   // die Anmeldeseite kommt
    // Stehen bleibt, was da ist. Die Zaehlzeile sagt es.
    state.suchLaeuft = false; state.suchFehler = true;
  }
  drawFilters(); drawBody();
}

/* ================= Die gespeicherten Ansichten =================
   EINE ANSICHT IST EINE FILTERSTELLUNG SAMT SUCHBEGRIFF, unter einem Namen.
   Der Begriff gehoert dazu -- eine Ansicht "Bosch, ungetestet" ist ohne ihn
   die halbe Ansicht.

   SIE STEHEN IN DER FILTERZEILE UND NICHT IN EINER EIGENEN KARTE: wer eine
   Ansicht sucht, sucht sie dort, wo die Filter stehen.

   PERSOENLICH, ueber PUT /api/settings wie `filters`. DIE GANZE LISTE WIRD
   GESCHICKT, nicht ein einzelner Eintrag -- es ist ein Schluessel mit einem
   Wert. */

// Was gerade eingestellt ist, als Ansicht -- ohne den Namen, der kommt vom
// Menschen.
const ansichtAusZustand = () => ({ filters: { ...state.filters }, q: state.search.trim() });

/* GESCHICKT UND DANN ERST UEBERNOMMEN. Der Deckel und die Namensgleichheit
   entscheidet der Server; scheitert es dort, bleibt die oertliche Liste, wie
   sie war, und die Meldung steht da. Die umgekehrte Reihenfolge zeigte eine
   Ansicht, die es nicht gibt. */
async function ansichtenSchicken(liste) {
  try {
    await api('PUT', '/api/settings', { ansichten: liste });
    ANSICHTEN = liste;
    if (EINSTELLUNGEN) EINSTELLUNGEN.ansichten = liste;
    return true;
  } catch (e) { toast(e.message, true); return false; }
}

async function ansichtSpeichern() {
  if (ANSICHTEN.length >= ANSICHTEN_DECKEL)
    return toast(`Mehr als ${ANSICHTEN_DECKEL} Ansichten gibt es nicht.`, true);
  const name = await nameBox('Ansicht speichern',
    'Filter und Suchbegriff werden unter diesem Namen gemerkt.', '', 'Speichern');
  if (!name) return;
  // Derselbe Vergleich wie im Server, und aus demselben Grund: der Name ist
  // das Einzige, woran ein Mensch zwei Ansichten auseinanderhaelt.
  if (ANSICHTEN.some(a => a.name.toLowerCase() === name.toLowerCase()))
    return toast(`„${name}" gibt es schon.`, true);
  if (await ansichtenSchicken([...ANSICHTEN, { name, ...ansichtAusZustand() }])) {
    toast('Gespeichert');
    drawFilters();
  }
}

async function ansichtLoeschen(name) {
  if (!await confirmBox('Ansicht löschen?', `„${name}" wird aus der Liste entfernt.`)) return;
  if (await ansichtenSchicken(ANSICHTEN.filter(a => a.name !== name))) drawFilters();
}

/* ANGEWANDT WIRD OERTLICH UND SOFORT. Die Stellung geht durch filterNormal()
   -- dort werden geloeschte Kategorien und Tags uebergangen, statt auf etwas
   zu filtern, das niemand mehr hat. Der Begriff geht in das Feld UND in den
   Zustand: stuende er nur im Zustand, zeigte das Feld daneben etwas anderes.
   GESUCHT WIRD OHNE Debounce: es ist ein Klick und kein Tippen. */
function ansichtAnwenden(a) {
  state.filters = filterNormal(a.filters);
  state.search = typeof a.q === 'string' ? a.q : '';
  const feld = document.getElementById('q');
  if (feld) feld.value = state.search;
  syncSuchknopf();
  saveFilters();
  if (suchUhr) { clearTimeout(suchUhr); suchUhr = null; }
  sucheAusfuehren();
}

// Der Debounce. Beim Leeren sofort -- dort ist keine Anfrage im Spiel.
function sucheAngestossen() {
  if (suchUhr) clearTimeout(suchUhr);
  if (!state.search.trim()) { suchUhr = null; sucheAusfuehren(); return; }
  suchUhr = setTimeout(() => { suchUhr = null; sucheAusfuehren(); }, SUCH_VERZOEGERUNG);
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
  /* EIN ODER UEBER DIE GEWAEHLTEN KATEGORIEN, niemals ein UND: ein Eintrag
     traegt genau eine Kategorie, ein Schnitt waere also immer leer. Gebaut
     wird die Vereinigung -- beide Gruppen zugleich in der Liste.
     "OHNE" IST EIN WERT DIESER LISTE: ein Eintrag ohne Kategorie war ueber
     keine einzelne Kategorie erreichbar, und die Zahlen verrieten die Luecke,
     ohne sie zeigen zu koennen. */
  if (f.categoryIds.length) out = out.filter(i =>
    f.categoryIds.includes(i.category ? i.category.id : KATEGORIE_OHNE));
  // UND ist die Vorgabe: mit zwei Tags will man fast immer den Schnitt
  // ("gruen UND schwer"), nicht die Vereinigung.
  if (f.tagIds.length) out = out.filter(i => passtZuTags(i, f.tagIds, f.tagMode));
  if (f.tested === 'tested') out = out.filter(i => i.tested);
  else if (f.tested === 'untested') out = out.filter(i => !i.tested);
  /* DIE ABLEHNUNG IST EIN EIGENES MERKMAL und deshalb eine eigene Dreiergruppe
     -- kein vierter Wert von `tested`. Man lehnt ab, OHNE zu testen, und man
     lehnt NACH dem Test ab; beide Merkmale muessen sich kreuzen lassen, und als
     vierter Wert waere "getestet UND abgelehnt" nicht mehr einstellbar.
     DREI ZUSTAENDE UND KEIN UMSCHALTER wie beim Favoriten daneben: ein
     Umschalter kann nur "zeig mir die abgelehnten". Gebraucht wird auch die
     Gegenrichtung -- "zeig mir alles ausser dem Verworfenen" --, und die ist
     der haeufigere Griff.
     JEDER ANDERE WERT GILT ALS "all", genau wie eine Zeile hoeher: eine
     gespeicherte Ansicht aus einer aelteren Fassung kennt den Schluessel nicht,
     und ein unbekannter Wert darf nichts wegnehmen. */
  if (f.abgelehnt === 'ja') out = out.filter(i => i.rejected);
  else if (f.abgelehnt === 'nein') out = out.filter(i => !i.rejected);
  // Eigenes Merkmal, eigener Filter -- bewusst NICHT als vierter Wert von
  // `tested`: Favorit und Teststatus sind unabhaengig, und "getestet UND
  // Favorit" muss moeglich bleiben.
  if (f.favorit) out = out.filter(i => i.favorite);
  /* HIER STEHT SEIT 0.17.0 KEIN FILTER „Neu seit ..." MEHR. Die Auskunft --
     was hat sich getan, seit ich zuletzt hier war -- traegt die Glocke; zwei
     Anzeigen fuer dieselbe Frage sind eine zu viel. WAS DABEI VERLORENGEHT,
     gehoert daneben: die Pille zeigte JEDE Aenderung an einem Eintrag, auch
     einen geaenderten Titel, eine neue Datei, einen neuen Testtag. Die Glocke
     bleibt bei Kommentaren und Bewertungen.
     TRAGBAR IST DAS, weil eine Titelaenderung etwas ist, das jemand AM Eintrag
     getan hat, und kein Beitrag, der FUER dich daliegt -- und weil die Liste
     ohnehin nach updated_at ordnet: was sich zuletzt getan hat, steht oben. */
  /* HIER WIRD NICHT GESUCHT: das macht GET /api/items?q=..., und
     `state.items` traegt bereits nur noch die Treffer. Eine zweite Suche hier
     waere eine zweite Wahrheit ueber dieselbe Menge. Die uebrigen Filter
     bleiben oertlich -- sie rechnen mit Feldern, die die Antwort ohnehin
     traegt, und kosten keine Anfrage. */

  out = [...out].sort((a, b) => {
    // HIER STEHT BEWUSST KEINE Vorsortierung der Favoriten: sie schluege jede
    // eingestellte Sortierung -- ein Favorit ohne Wertung stuende bei
    // "Bewertung hoch nach niedrig" ganz oben. Ein Favorit ist persoenlich und
    // darf die gemeinsame Liste nicht umsortieren.
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
/* DER BEZUGSPUNKT DER GLOCKE ENTSTEHT BEIM ERSTEN VERLASSEN DER UEBERSICHT.
   Ohne ihn gibt es keine Glocke, und ohne Glocke gaebe es keinen Weg, ihn je zu
   setzen -- eine Bedingung, die ihren eigenen Ausweg verdeckt. Danach faellt er
   NUR noch beim Oeffnen der Tafel: wer sie gesehen hat, hat sie gesehen.
   GENAU EIN RUF, UND NUR EINMAL. Bis 0.17.0 ging bei jedem Verlassen der
   Uebersicht ein Ruf hinaus -- er stellte `zuletztGesehen` fuer die Pille
   „Neu seit ..." nach. Die Pille ist gestrichen, und mit ihr der Merker; was
   bleibt, ist der eine Ruf, der die Glocke ueberhaupt erst moeglich macht.
   UND AUSDRUECKLICH KEIN RUF BEIM BETRETEN: was beim Betreten der Uebersicht
   hinausginge, ginge bei jedem Seitenaufbau hinaus. */
const merkeGesehen = () => {
  if (GLOCKE_GESEHEN) return;
  GLOCKE_GESEHEN = true;
  api('PUT', '/api/settings', { glockeGesehen: 1 }).catch(() => {});
};
/* ================= Der Suchbegriff in der Adresse -- 0.18.0 =================
   BIS 0.17.5 LEBTE DER BEGRIFF NUR IN state.search. Wer einen Treffer oeffnete
   und neu lud, verlor ihn -- und mit ihm die Hervorhebung. Ein Eintrag, der
   beim ersten Blick markierte Stellen hat und nach F5 keine mehr, sieht aus
   wie ein Fehler.

   DAS MUSTER IST VERANKERT UND BLEIBT ES. `#/item/12x` darf nicht treffen,
   und `#/item/12` ohne Begriff bleibt gueltig -- jedes Lesezeichen von gestern
   fuehrt dorthin, wohin es immer fuehrte. Dieselbe Bauform wie SYS_MUSTER,
   das seit 0.16.0 genau das fuer den Systembereich tut.

   GELESEN WIRD MIT URLSearchParams UND NICHT MIT EINEM ZWEITEN MUSTER: das
   Entschluesseln der Prozentzeichen steht damit an einer Stelle, und ein
   Parameter, den diese Fassung nicht kennt, wirft die Adresse nicht um.
   Ein `?q=` ohne Wert ist dasselbe wie kein `?q=` -- "keine Suche". */
const EINTRAG_MUSTER = /^#\/item\/(\d+)(?:\?(.*))?$/;
const eintragAdresse = (id, begriff) =>
  `#/item/${id}` + (begriff ? `?q=${encodeURIComponent(begriff)}` : '');
const begriffAusAdresse = (frage) => {
  try { return new URLSearchParams(frage || '').get('q') || ''; }
  catch { return ''; }
};

function route() {
  const h = location.hash || '#/';
  // Die alte Ansicht ist gleich fort; ihre Wolke darf niemand mehr zeichnen.
  wolkeNeuzeichnen = null;
  const m = h.match(EINTRAG_MUSTER);
  /* DER SYSTEMBEREICH HAT SEIT 0.16.0 FUENF ADRESSEN STATT EINER --
     `#/system` und `#/system/<abschnitt>`. Welcher Abschnitt gemeint ist,
     liest renderSystem() selbst aus der Adresse; hier steht nur, DASS es der
     Systembereich ist. Sonst muesste der Abschnitt zweimal bestimmt werden,
     und die beiden Stellen liefen auseinander.
     `#/systemisch` DARF NICHT TREFFEN: das Muster ist verankert und verlangt
     hinter „system" entweder nichts oder einen Schraegstrich. */
  const ansicht = SYS_MUSTER.test(h) ? 'system' : h === '#/compare' ? 'vergleich'
    : h === '#/offen' ? 'offen' : m ? 'eintrag' : 'liste';
  if (LETZTE_ANSICHT === 'liste' && ansicht !== 'liste') merkeGesehen();
  LETZTE_ANSICHT = ansicht;
  if (ansicht === 'system') return renderSystem();
  if (ansicht === 'vergleich') return renderCompare();
  if (ansicht === 'offen') return renderOffen();
  if (m) return renderDetail(+m[1], begriffAusAdresse(m[2]));
  return renderList();
}

/* ================= Die Glocke und der Zähler „Offen" =================
   BEIDE ZAHLEN KOMMEN AUS DER LISTE, DIE DIE UEBERSICHT OHNEHIN HOLT. Kein
   eigener Weg, der bei jedem Seitenaufbau gefragt wird -- genau daran ist der
   Zaehler „Offen 7" in 0.8.60 gescheitert, und genau das ist hier beantwortet.
   GERECHNET WIRD AUS `state.alle` UND NICHT AUS `state.items`: die Zahlen
   gelten dem BESTAND und nicht der gerade eingestellten Filterung. Ein Filter,
   der die Glocke stumm schaltet, waere eine Falle -- man saehe nichts und
   wuesste nicht, warum.
   DIE GLOCKE TRAEGT DEN PUNKT, DER KNOPF „OFFEN" DIE ZAHL. Das ist keine
   Laune: eine Zahl beschreibt einen ZUSTAND (so viele Aufgaben stehen offen),
   ein Punkt meldet ein EREIGNIS (seit deinem letzten Blick ist etwas
   dazugekommen). Die beiden Zeichen werden nirgends vertauscht.
   WAS DIE GLOCKE NICHT LEISTET, steht in der README: sie rechnet beim Aufbau
   der Uebersicht nach und nicht laufend.
   SIE MELDET SEIT 0.17.2 WIEDER NUR FREMDE BEITRAEGE. 0.17.0 nahm die eigenen
   dazu, damit sie einem Betreiber, der allein arbeitet, ueberhaupt etwas
   meldet; das ist zurueckgenommen. Eine Glocke ist eine Nachricht von jemand
   anderem, und ueber die eigene Hand braucht niemand eine. Bei einem einzigen
   Zugang bleibt sie deshalb still -- die gewollte Folge und kein Mangel. */
/* DIE SUMME ENTSTEHT AN GENAU EINER STELLE. Der Server liefert zwei Zahlen und
   keine Summe: eine Summe neben ihren Teilen waere eine zweite Wahrheit ueber
   dieselbe Sache (Stolperstein 47), und die Glocke zaehlte sie eines Tages
   doppelt. */
const neuAn = (i) => (Number(i.neuKommentare) || 0) + (Number(i.neuBewertungen) || 0);
const glockeNeu = () => (state.alle || []).reduce((n, i) => n + neuAn(i), 0);
const offeneGesamt = () => (state.alle || []).reduce((n, i) => n + (Number(i.offeneAufgaben) || 0), 0);

/* WAS DORT NEU IST, IN WORTEN -- 0.17.0. „7 neue Beitraege" liess offen, ob
   das Kommentare sind oder Bewertungen; „Beitrag" ist ein Sammelwort, das die
   Instanz sonst nirgends benutzt.
   NUR WAS ES GIBT: bei einer Art steht auch nur eine Angabe da. „0
   Bewertungen" waere eine Auskunft ueber nichts -- dieselbe Regel wie die
   fehlende Null am Knopf „Offen".
   EIN- UND MEHRZAHL AUSGESCHRIEBEN: „1 Kommentare" ist der Fehler, den eine
   feste Endung macht. Die beiden Woerter stehen NICHT im Vokabular: dort geht
   es um die Sache, den Bericht, die Aufgabe und den Zeitpunkt -- Kommentar und
   Bewertung heissen in dieser Instanz ueberall so. */
const neuWorte = (i) => {
  const k = Number(i.neuKommentare) || 0, b = Number(i.neuBewertungen) || 0;
  return [k ? `${k} ${k === 1 ? 'Kommentar' : 'Kommentare'}` : '',
          b ? `${b} ${b === 1 ? 'Bewertung' : 'Bewertungen'}` : ''].filter(Boolean).join(' · ');
};

/* VON WEM -- 0.17.0. Wer an einem Eintrag war, gehoert neben die Zahl: „3
   Kommentare" allein sagt nicht, ob dort einer dreimal oder drei je einmal
   geschrieben haben. Der eigene Name kann seit 0.17.2 nicht darunter sein --
   der Server schickt ihn gar nicht erst mit.
   DIE NAMEN KOMMEN AUS DEN KOMMENTAREN UND NICHT AUS DEN BEWERTUNGEN -- der
   Server liefert sie gar nicht anders. Wer welche Bewertung abgegeben hat, ist
   eine Angabe ueber einzelne Personen und steht in keiner Antwort, die jeder
   bekommt. Eine Zeile mit ausschliesslich neuen Bewertungen traegt deshalb
   keinen Namen, und das ist kein Mangel, sondern dieselbe Regel wie am Eintrag
   selbst.
   „von Anna", „von Anna und Bert", „von Anna, Bert und Carla": so heisst eine
   Aufzaehlung im Deutschen. Kommas bis zum Schluss lesen sich wie eine Liste
   von Dingen, nicht von Menschen.
   SORTIERT NACH DEM ANGEZEIGTEN NAMEN und nicht nach der Zugangsnummer -- die
   Nummer sieht niemand, und zwei Tafeln nacheinander sollen dieselbe Reihe
   zeigen. Der Name entsteht ueber verfasserName() wie ueberall sonst. */
const neuVonWorte = (i) => {
  const namen = (Array.isArray(i.neuVon) ? i.neuVon : [])
    .map(verfasserName).sort((a, b) => String(a).localeCompare(String(b), 'de'));
  if (!namen.length) return '';
  return 'von ' + (namen.length === 1 ? namen[0]
    : `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`);
};

function zeichneKopfzahlen() {
  const offen = offeneGesamt();
  /* KEINE NULL AM KNOPF. „Offen 0" ist eine Auskunft ueber nichts und stuende
     dauerhaft da -- dieselbe Ueberlegung wie bei der Marke ×1 an einem
     Kriterium. Ohne offene Aufgaben traegt der Knopf nur sein Zeichen. */
  amElement('offen-zahl', el => {
    el.textContent = offen ? String(offen) : '';
    el.hidden = !offen;
  });
  amElement('offen', b => b.title = offen
    ? `${offen} offene ${offen === 1 ? V.aufgabeEinzahl : V.aufgabeMehrzahl}`
    : `Offene ${V.aufgabeMehrzahl}`);
  const neu = glockeNeu();
  /* EINE ZAHL IM TITEL, EIN PUNKT AM KNOPF. Der Titel bleibt EINE Zahl, auch
     seit die Tafel zwei nennt: er beantwortet „gibt es etwas", die Tafel
     beantwortet „was". Eine Aufzaehlung im Titel machte aus einem Hinweis eine
     Liste. */
  amElement('glocke-punkt', el => { el.hidden = !neu; });
  amElement('glocke', b => b.title = neu
    ? `${neu} seit deinem letzten Blick — Klick zeigt, wo`
    : 'Nichts Neues seit deinem letzten Blick');
}

/* DIE TAFEL. Sie ist die zweite Haelfte der Glocke und nicht ihr Beiwerk:
   eine Meldung, die man nicht anspringen kann, ist eine Mitteilung ohne Weg.
   JEDE ZEILE FUEHRT ZU IHREM EINTRAG.
   DAS OEFFNEN SETZT ALLES AUF GESEHEN. Es ist die bewusste Grenze der
   schlanken Fassung: ein Lesestand je Meldung braeuchte eine Tabelle, und die
   gibt es hier nicht.
   BIS 0.17.0 STAND DAS IN DER TAFEL SELBST, als Block „Was die Glocke nicht
   verspricht". Er ist ersatzlos gestrichen und steht nur noch in der README:
   eine Oberflaeche sagt, WAS IST, nicht, warum sie so gebaut ist
   (Projektstand 5.6). Die Grenze gilt unveraendert -- gestrichen ist ihre
   Begruendung an der Oberflaeche, nicht die Grenze. */
function zeigeGlockentafel() {
  /* SORTIERT NACH DER SUMME und nicht nach einem der beiden Teile: ein Eintrag
     mit vier neuen Bewertungen stuende sonst unter einem mit einem Kommentar. */
  const zeilen = (state.alle || []).filter(i => neuAn(i) > 0)
    .slice().sort((a, b) => (neuAn(b) - neuAn(a)) || String(a.title).localeCompare(String(b.title)));
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `<div class="modal glockentafel" id="glocken-modal"><h2>Neu seit deinem letzten Blick</h2>
    <p>Was seit deinem letzten Blick in diese Tafel dazugekommen ist — Kommentare und
      Bewertungen <strong>von den anderen</strong>.</p>
    <div class="manage-list" id="glocken-liste"></div>
    <div class="modal-acts"><button class="btn btn-ghost" data-no>Schließen</button></div></div>`;
  document.body.appendChild(bd);
  const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => {
    if (e.key !== 'Escape') return;
    if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
    zu();
  };
  document.addEventListener('keydown', onKey, true);
  bd.querySelector('[data-no]').onclick = zu;
  bd.onclick = e => { if (e.target === bd) zu(); };

  const box = bd.querySelector('#glocken-liste');
  if (!zeilen.length) {
    box.innerHTML = `<span class="hint">Nichts Neues.</span>`;
  } else for (const it of zeilen) {
    /* EIN LINK UND KEIN KNOPF: er traegt eine Adresse, laesst sich kopieren
       und in einem neuen Fenster oeffnen. Geschlossen wird die Tafel trotzdem
       von Hand -- ein Wechsel der Ansicht raeumt sie nicht mit weg. */
    const a = document.createElement('a');
    a.className = 'mrow glocken-zeile';
    a.href = `#/item/${it.id}`;
    a.dataset.mid = String(it.id);
    /* DREI STUECKE: der Titel, WAS dort neu ist, und VON WEM. Die dritte
       Angabe steht in einer eigenen Zeile darunter -- oben, worum es geht,
       darunter, wer: dieselbe Aufteilung wie an der Zeile einer Anmeldung.
       ALLE DREI WERDEN GESETZT UND NICHT ZUSAMMENGEBAUT: Titel und Namen sind
       freier Text. */
    a.innerHTML = `<span class="mname"></span><span class="mcount"></span>
      <span class="glocken-von"></span>`;
    a.querySelector('.mname').textContent = it.title;
    a.querySelector('.mcount').textContent = neuWorte(it);
    a.querySelector('.glocken-von').textContent = neuVonWorte(it);
    a.onclick = () => zu();
    box.appendChild(a);
  }

  /* DER STRICH WIRD BEIM OEFFNEN NACHGEZOGEN, nicht beim Schliessen: wer die
     Tafel gesehen hat, hat sie gesehen. Und die Zahlen im Speicher gehen im
     selben Zug auf null -- sonst stuende der Punkt bis zum naechsten Laden
     weiter da und behauptete etwas, das nicht mehr gilt. */
  api('PUT', '/api/settings', { glockeGesehen: 1 }).catch(() => {});
  /* NUR WAS DASTEHT, WIRD ZURUECKGESETZT -- und nichts angelegt. Ohne
     Bezugspunkt gibt es die Felder gar nicht, und wer sie hier auf 0 setzte,
     machte aus „es gibt keinen Bezugspunkt" ein „nichts Neues". */
  for (const it of (state.alle || [])) {
    if (it.neuKommentare) it.neuKommentare = 0;
    if (it.neuBewertungen) it.neuBewertungen = 0;
    if (it.neuVon) it.neuVon = [];
  }
  zeichneKopfzahlen();
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
      ${/* DIE VIER, DIE AUF DEM TELEFON HINTER DAS ZEICHEN WANDERN, stehen in
           einem eigenen Behaelter -- und sie stehen dort AUCH auf dem breiten
           Schirm. Der Behaelter traegt dann `display: contents` und ist fuer
           das Layout gar nicht da: seine Kinder sitzen unmittelbar in der
           Kopfzeile, mit deren Abstaenden, in derselben Reihenfolge wie vor
           dieser Runde.
           EIN MARKUP, ZWEI GESTALTEN. Die Knoepfe beim Drehen des Geraets
           umzuhaengen waere der andere Weg gewesen, und er waere der
           schlechtere: jeder verschobene Knoten verliert seine Zusagen, und
           es gibt keinen Ort, an dem sich das einmal richtig machen liesse.
           WER ANGEMELDET IST, STEHT WEITERHIN UNMITTELBAR VOR DEM ABMELDEN.
           Das ist keine Formsache: die Angabe erklaert den Knopf daneben, und
           getrennt erklaerte sie nichts mehr. */''}
      <div class="mast-rest" id="mast-rest">
        ${/* DIE GLOCKE STEHT IN DEMSELBEN BEHAELTER wie die beiden anderen
             Zeichenknoepfe -- und damit wandert sie auf dem Telefon ohne ein
             einziges Zutun in die Tafel: ein Markup, zwei Gestalten (0.12.0).
             Eine Glocke nur am Desktop waere eine Weiche nach Geraet.
             SIE HEISST SEIT 0.17.0 „Neu seit deinem letzten Blick" UND NICHT
             MEHR „Neu von anderen". Der Name bleibt, auch seit sie mit 0.17.2
             wieder nur Fremdes meldet: er sagt, WORAUF sich die Auskunft
             bezieht -- auf den letzten Blick -- und nicht, wer geschrieben
             hat. Das steht in der Tafel.
             SIE STEHT NUR DA, WENN ES EINEN BEZUGSPUNKT GIBT. Vor dem ersten
             Aufbau der Uebersicht weiss die Instanz nicht, was jemand schon
             gesehen hat -- eine Glocke, die dann alles meldet, laeutete beim
             ersten Blick fuer den ganzen Bestand. Dieselbe Lage und dieselbe
             Antwort wie bei „Neu seit meinem letzten Besuch".
             DER PUNKT IST EIN EIGENER KNOTEN und kein Text im Knopf: er wird
             beim Zeichnen ein- und ausgeblendet, ohne dass das Zeichen daneben
             neu gebaut wird. */''}
        ${GLOCKE_GESEHEN ? `<button class="icon-btn glocke" id="glocke" title="Neu seit deinem letzten Blick"
          aria-label="Neu seit deinem letzten Blick">${ICON_GLOCKE}<span class="glocke-punkt" id="glocke-punkt" hidden></span><span class="mast-wort">Neu seit deinem letzten Blick</span></button>` : ''}
        <button class="icon-btn" id="offen" title="Offene ${esc(V.aufgabeMehrzahl)}">${ICON_OFFEN}<span class="offen-zahl" id="offen-zahl" hidden></span><span class="mast-wort">Offene ${esc(V.aufgabeMehrzahl)}</span></button>
        <button class="icon-btn" id="sys" title="Systembereich">${ICON_SYS}<span class="mast-wort">Systembereich</span></button>
        <span class="hint wer" id="wer">Angemeldet als ${esc(NAME)}</span>
        <button class="btn btn-ghost btn-sm" id="out">Abmelden</button>
      </div>
      <button class="btn btn-accent" id="new">+ ${esc(V.sacheEinzahl)}</button>
      ${/* Das Zeichen steht IM Markup hinter dem Anlegen-Knopf, damit es auf
           dem Telefon rechts aussen sitzt -- dort, wo ein Menuezeichen
           hingehoert. Auf dem breiten Schirm ist es unsichtbar, die Stelle im
           Markup fuer die Tastatur aber trotzdem die letzte, und das ist
           richtig: es fuehrt nirgendwohin, was nicht schon dasteht. */''}
      <button class="icon-btn mast-menue" id="menue" aria-expanded="false"
        aria-controls="mast-rest" aria-label="Menü öffnen" title="Menü">${ICON_MENUE}</button>
    </div>
    ${/* Nur auf dem schmalen Schirm sichtbar. Die Zahl daneben nennt die
         Filter, die gerade greifen -- ohne sie waere eine eingeklappte
         Filterreihe eine Liste, die aus unerfindlichem Grund weniger zeigt. */''}
    <button class="btn btn-sm filter-schalter" id="filter-auf"
      aria-expanded="true" aria-controls="filters">Filter<span class="fz" id="filter-zahl"></span></button>
    <div class="filters" id="filters"></div>
    <div id="zeitleiste"></div>
    <div id="body"></div>
  </div>`;

  document.getElementById('new').onclick = openCreate;
  document.getElementById('offen').onclick = () => { location.hash = '#/offen'; };
  amElement('glocke', b => b.onclick = zeigeGlockentafel);
  zeichneKopfzahlen();
  document.getElementById('sys').onclick = () => { location.hash = '#/system'; };
  document.getElementById('out').onclick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    showLogin();
  };
  const q = document.getElementById('q'), qclr = document.getElementById('qclr');
  // Getippt wird oertlich, gesucht ueber den Debounce. Das Leeren geht ohne
  // Anfrage durch -- der ungefilterte Bestand liegt in state.alle.
  q.oninput = () => { state.search = q.value; syncSuchknopf(); sucheAngestossen(); };
  qclr.onclick = () => { q.value = ''; state.search = ''; syncSuchknopf(); sucheAngestossen(); q.focus(); };
  syncSuchknopf();

  /* ---- Die Tafel hinter dem Menuezeichen ----
     Sie wird ueber EINE Klasse geoeffnet und geschlossen; ob sie ueberhaupt
     eine Tafel ist oder als vier Knoepfe in der Kopfzeile steht, entscheidet
     allein das Stylesheet. Die Oberflaeche weiss davon nichts und muss es
     auch nicht wissen -- deshalb gibt es hier keine Abfrage der Fensterbreite
     und nichts, was beim Drehen des Geraets nachgezogen werden muesste.
     aria-expanded wird mitgefuehrt, weil das Zeichen sonst ein Knopf ohne
     Auskunft waere: ein Vorleseprogramm saehe drei Striche und keinen
     Zustand. */
  const menue = document.getElementById('menue');
  const tafel = document.getElementById('mast-rest');
  const menueStellen = (auf) => {
    tafel.classList.toggle('offen', auf);
    menue.setAttribute('aria-expanded', auf ? 'true' : 'false');
    menue.setAttribute('aria-label', auf ? 'Menü schließen' : 'Menü öffnen');
  };
  menue.onclick = () => menueStellen(!tafel.classList.contains('offen'));

  /* EIN KLICK DANEBEN SCHLIESST, UND ESCAPE AUCH. Beides haengt am Dokument
     und nicht an der Tafel: eine Tafel, die sich nur ueber ihren eigenen
     Knopf schliessen laesst, steht im Weg, sobald man sie versehentlich
     geoeffnet hat -- und das passiert auf einem Telefon staendig.
     Der Klick auf das Zeichen selbst faellt heraus, sonst schloesse der
     Behandler hier die Tafel im selben Zug wieder zu, in dem der Knopf sie
     geoeffnet hat.
     BEIDE WERDEN BEIM VERLASSEN DER ANSICHT ABGERAEUMT. app.innerHTML nimmt
     die Elemente weg, die Zusagen am Dokument bleiben sonst liegen und
     sammeln sich mit jedem Aufruf der Uebersicht. */
  const menueDaneben = (e) => {
    if (e.target.closest('#menue') || e.target.closest('#mast-rest')) return;
    menueStellen(false);
  };
  const menueTaste = (e) => { if (e.key === 'Escape') menueStellen(false); };
  document.addEventListener('click', menueDaneben);
  document.addEventListener('keydown', menueTaste);

  /* ---- Der Schalter ueber den Filtern ----
     AUF DEM SCHMALEN SCHIRM FANGEN DIE FILTER EINGEKLAPPT AN. Vier Reihen mit
     Beschriftungen und Pillen fuellten dort den ganzen ersten Bildschirm,
     bevor der erste Eintrag zu sehen war -- und die Uebersicht ist die Liste,
     nicht ihre Einstellung.
     GEFRAGT WIRD DIESELBE BEDINGUNG WIE IM STYLESHEET (siehe SCHMAL): der
     Schalter ist dort und nur dort sichtbar, wo hier eingeklappt wird. Ohne
     die Frage saesse ein breites Fenster vor eingeklappten Filtern und
     haette keinen sichtbaren Knopf, sie zu oeffnen. */
  const filterKasten = document.getElementById('filters');
  if (istSchmal()) filterKasten.classList.add('zu');
  document.getElementById('filter-auf').onclick = () => {
    const warZu = filterKasten.classList.contains('zu');
    filterKasten.classList.toggle('zu');
    /* BEIM AUFKLAPPEN WIRD NEU GEZEICHNET, beim Einklappen nicht.
       Der Grund steht bei begrenzeWolke(): die Tagwolke wird auf eine Zeile
       begrenzt, und die Zeilenhoehe wird an der ERSTEN Marke GEMESSEN statt
       geraten -- sie haengt an der eingestellten Schriftgroesse. Ein
       eingeklappter Kasten misst null, und begrenzeWolke() steigt dann
       ausdruecklich aus, ohne etwas zu setzen. Waere die Wolke also beim
       Aufbau der Ansicht hinter einem eingeklappten Filterbereich gezeichnet
       worden, staende sie nach dem Aufklappen unbegrenzt da: alle Marken auf
       einmal, und der Knopf "mehr" fehlte.
       DAS IST DERSELBE ZWEITE WEG, den das Einklappen eines Blocks in der
       Detailansicht ueber wolkeNeuzeichnen geht -- dieselbe Falle, dieselbe
       Antwort. Beim Einklappen gibt es nichts zu messen und nichts zu holen. */
    if (warZu) drawFilters();
    else zeichneFilterSchalter();
  };

  // "/" springt in die Suche
  document.addEventListener('keydown', listKeys);
  window.addEventListener('hashchange', () => {
    document.removeEventListener('keydown', listKeys);
    document.removeEventListener('click', menueDaneben);
    document.removeEventListener('keydown', menueTaste);
  }, { once: true });

  drawFilters(); drawBody();
  /* STAND SCHON EIN BEGRIFF IM FELD, wird er jetzt gefragt. Der Begriff
     ueberlebt den Weg in einen Eintrag und zurueck (state.search), die
     Trefferliste tut das nicht -- loadAll() hat gerade den ganzen Bestand
     gesetzt. Ohne diese Zeile stuende im Feld ein Begriff und daneben die
     ungefilterte Liste. */
  if (state.search.trim()) sucheAusfuehren();
}

function listKeys(e) {
  const t = document.activeElement?.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
  if (document.querySelector('.backdrop')) return;
  if (e.key === '/') { e.preventDefault(); document.getElementById('q')?.focus(); }
}

/* WIE VIELE FILTER GERADE GREIFEN. Gezaehlt wird gegen FILTER_VORGABE und
   nicht gegen eine zweite Liste -- die Vorgabe steht genau einmal, und wer
   dort einen Filter ergaenzt, ergaenzt ihn hier mit.
   DIE SORTIERUNG ZAEHLT AUSDRUECKLICH NICHT MIT. Die Zahl beantwortet die
   eine Frage, die ein eingeklappter Filterbereich aufwirft: "warum sehe ich
   nicht alles?" Eine andere Reihenfolge nimmt nichts weg, sie ordnet nur --
   sie mitzuzaehlen hiesse, eine Vollstaendigkeit in Frage zu stellen, die
   gar nicht angetastet ist.
   Jeder gewaehlte Tag zaehlt einzeln: zwei Tags verkleinern die Menge
   zweimal, und genau das soll die Zahl sagen. */
function filterZahl() {
  const f = state.filters, v = FILTER_VORGABE;
  let n = 0;
  if (f.tested !== v.tested) n++;
  // Die Ablehnung zaehlt EIGENS mit und nicht mit dem Teststatus zusammen: sie
  // ist ein zweites Merkmal, und beide zugleich verkleinern die Menge zweimal.
  if (f.abgelehnt !== v.abgelehnt) n++;
  if (f.favorit) n++;
  /* DREI GEWAEHLTE KATEGORIEN ZAEHLEN ALS EIN FILTER und nicht als drei --
     anders als die Tags eine Zeile tiefer, und der Unterschied ist die
     Verknuepfung. Jeder zusaetzliche Tag verkleinert die Menge (UND), jede
     zusaetzliche Kategorie vergroessert sie (ODER). Die Zahl beantwortet die
     eine Frage "warum sehe ich nicht alles?"; eine Drei fuer etwas, das die
     Liste gerade WEITER macht, gaebe darauf die falsche Antwort. */
  if (f.categoryIds.length) n++;
  n += f.tagIds.length;
  return n;
}

/* Der Schalter ueber den Filtern. Er wird bei jedem Neuzeichnen nachgefuehrt,
   weil sich die Zahl mit jedem Klick auf eine Pille aendert -- und weil der
   Schalter eingeklappt sonst eine veraltete Zahl truege, also genau dann
   falsch waere, wenn er als einziger noch etwas sagt. */
function zeichneFilterSchalter() {
  const knopf = document.getElementById('filter-auf');
  const box = document.getElementById('filters');
  if (!knopf || !box) return;
  const n = filterZahl();
  const zu = box.classList.contains('zu');
  knopf.querySelector('.fz').textContent = n ? `· ${n} aktiv` : '';
  knopf.classList.toggle('aktiv', n > 0);
  knopf.setAttribute('aria-expanded', zu ? 'false' : 'true');
  knopf.title = zu ? 'Filter zeigen' : 'Filter einklappen';
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
  /* EINE ZWEITE BESCHRIFTUNG IN DERSELBEN ZEILE -- und sie ist das Gegenstueck
     zur ersten und keine Ueberschrift ueber dem, was dahinter steht. Deshalb
     ohne die Beschriftungsspalte (`min-width`) und mit einem Abstand davor:
     die erste haelt die Spalte, die zweite laeuft mit. */
  const zweiteBeschriftung = (zeile, text) => {
    const e = document.createElement('span');
    e.className = 'eyebrow eyebrow-mit';
    e.textContent = text;
    zeile.appendChild(e);
    return e;
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
  // Eigener Umschalter, kein vierter Wert der Reihe davor: die drei oben sind
  // drei Zustaende EINES Merkmals, der Favorit ist davon unabhaengig und muss
  // sich mit jedem kombinieren lassen. `pill-sep` setzt ihn optisch ab.
  const bFav = document.createElement('button');
  bFav.className = 'pill pill-sep' + (f.favorit ? ' on' : '');
  bFav.id = 'f-fav';
  bFav.textContent = '★ Favoriten';
  bFav.title = f.favorit ? 'Alle Einträge zeigen' : 'Nur Favoriten zeigen';
  bFav.onclick = () => { f.favorit = !f.favorit; redraw(); };
  g1.appendChild(bFav);

  /* HIER STAND BIS 0.17.0 DIE PILLE „Neu seit ...". Sie ist gestrichen: ihre
     Auskunft -- was hat sich getan, seit ich zuletzt hier war -- traegt die
     Glocke, und zwei Anzeigen fuer dieselbe Frage sind eine zu viel.
     DAZU EINE HAUSREGEL, DIE SIE VERLETZTE: sie stand auch dann da, wenn ihre
     Zahl null war, nur gedaempft. Am Knopf „Offen" steht seit 0.16.0 das
     Gegenteil -- „Offen 0" waere eine Auskunft ueber nichts. Dieselbe Sache
     darf nicht zwei Verhalten haben (Stolperstein 47, im Kleinen).
     DIE FILTERZEILE IST DAMIT UM EINE PILLE KUERZER -- die Fortsetzung von
     0.13.0, wo sie 75 px flacher wurde. */
  r1.appendChild(g1);

  /* ---- Die Ablehnung: ZWEITE GRUPPE DERSELBEN ZEILE ----
     KEINE EIGENE ZEILE. Die Zeile heisst "Status", und die Ablehnung ist einer
     -- eine zweite Zeile gaebe von der in 0.13.0 gewonnenen Hoehe wieder etwas
     her, fuer dieselbe Sache. Abgesetzt wird sie wie "Ansichten" hinter
     "Sortieren": mit der zweiten Beschriftung, die keine Beschriftungsspalte
     haelt.
     DIE ZEILE TRAEGT DAMIT ACHT PILLEN und darf bei grosser Schrift umbrechen
     -- `flex-wrap: wrap` steht seit 0.13.1 an `.pills`, und der Umbruch ist
     hier erlaubt und kein Fehler.
     "Alle" HEISST DIE ERSTE PILLE und nicht "Alles anzeigen" wie in der Gruppe
     davor: dort ist es die Aussage ueber die ganze Liste, hier nur ueber dieses
     eine Merkmal -- die Kategoriezeile nennt denselben Zustand aus demselben
     Grund "Alle". */
  zweiteBeschriftung(r1, 'Ablehnung');
  const g1b = document.createElement('div');
  g1b.className = 'pills'; g1b.id = 'f-abgelehnt';
  [['all','Alle'],['ja','Abgelehnt'],['nein','Nicht abgelehnt']].forEach(([v,l]) => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.abgelehnt === v ? ' on' : '');
    b.textContent = l;
    b.onclick = () => { f.abgelehnt = v; redraw(); };
    g1b.appendChild(b);
  });
  r1.appendChild(g1b);

  /* ---- Kategorie ----
     MEHRERE ZUGLEICH, UND ES IST EIN ODER. Die Zeile bekommt deshalb
     ausdruecklich KEIN Und/Oder wie die Tagzeile darunter: bei den Tags ist die
     Wahl echt, weil ein Eintrag viele Tags traegt; hier gibt es nur Oder, denn
     `product_category_id` ist eine einzelne Spalte. Ein Umschalter, dessen eine
     Haelfte garantiert null Treffer liefert, ist schlimmer als keiner -- und er
     ist auch nicht dadurch zu retten, dass man ihn daempft.
     "ALLE" BLEIBT EINE PILLE, obwohl die Tagzeile stattdessen "zuruecksetzen"
     am rechten Ende traegt. Der Unterschied ist nicht Nachlaessigkeit, sondern
     der Ort: die Kategorien sind eine kurze, geschlossene, immer sichtbare
     Liste, in der "alles" ein nennbarer Zustand ist und seinen festen Platz
     behaelt. Die Tagwolke ist offen und lang; ein dauernd hervorgehobenes
     "Alle" an ihrem Anfang laese sich als Tag. Und "zuruecksetzen" kaeme und
     ginge, waehrend "Alle" immer an derselben Stelle steht. */
  const r2 = row('Kategorie');
  const g2 = document.createElement('div'); g2.className = 'pills';
  // Ein Klick auf einen Wert nimmt ihn dazu oder wieder heraus -- dieselbe
  // Handhabung wie bei den Tags, und die Zeile verhaelt sich damit wie jene.
  const katUm = (wert) => {
    f.categoryIds = f.categoryIds.includes(wert)
      ? f.categoryIds.filter(x => x !== wert) : [...f.categoryIds, wert];
    redraw();
  };
  const all = document.createElement('button');
  all.className = 'pill' + (f.categoryIds.length ? '' : ' on');
  all.textContent = 'Alle';
  all.onclick = () => { f.categoryIds = []; redraw(); };
  g2.appendChild(all);
  state.categories.forEach(c => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.categoryIds.includes(c.id) ? ' on' : '');
    b.innerHTML = `${esc(c.name)}<span class="n">${c.usage_count}</span>`;
    b.onclick = () => katUm(c.id);
    g2.appendChild(b);
  });
  /* "OHNE" AM ENDE DER ZEILE, mit eigener Zahl. Der Anlass: der Kopf sagte 12
     Eintraege, die Kategorien 1 + 9 = 10 -- zwei Eintraege waren ueber keine
     einzelne Kategorie erreichbar. Die Zahlen verrieten die Luecke, zu sehen
     bekam man sie trotzdem nicht.
     DIE ZAHL RECHNET DER BROWSER, wie die an der Glocke -- state.alle traegt
     den ganzen Bestand, der Server wird dafuer nicht gefragt. Und sie
     zaehlt ueber den GANZEN Bestand wie die usage_count der Kategorien daneben:
     zwei Zahlen in einer Zeile muessen dasselbe meinen.
     SIE STEHT NUR DA, WENN ES SIE GIBT -- eine Pille mit garantierter Null
     waere ein Bedienelement fuer nichts. Ist sie einmal gewaehlt und faellt der
     letzte Eintrag ohne Kategorie weg, bleibt sie stehen: sonst verschwaende
     der eigene Filter unter der Hand. */
  const ohneZahl = state.alle.filter(i => !i.category).length;
  if (ohneZahl || f.categoryIds.includes(KATEGORIE_OHNE)) {
    const b = document.createElement('button');
    b.className = 'pill pill-sep' + (f.categoryIds.includes(KATEGORIE_OHNE) ? ' on' : '');
    b.id = 'f-kat-ohne';
    b.innerHTML = `Ohne<span class="n">${ohneZahl}</span>`;
    b.title = 'Einträge, die keiner Kategorie zugeordnet sind';
    b.onclick = () => katUm(KATEGORIE_OHNE);
    g2.appendChild(b);
  }
  r2.appendChild(g2);

  // Tags
  // Nur Tags mit mindestens einem Eintrag: Tags, die ausschliesslich an
  // Testtagen haengen, lieferten hier null Treffer. Die Suche findet sie
  // trotzdem.
  const r3 = row('Tags');

  // Umschalter der Verknuepfung, direkt neben der Beschriftung: er macht
  // sichtbar, warum ein zweiter Tag das Ergebnis verkleinert. Gedaempft,
  // solange weniger als zwei Tags gewaehlt sind.
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
  /* DIE BEIDEN VERWEISE STEHEN HINTER DER WOLKE, als gewoehnliche Geschwister
     -- und seit 0.13.0 ist das wieder die natuerliche Reihenfolge: "mehr"
     gehoert hinter das, was es aufklappt.
     WARUM DAS FRUEHER NICHT GING: der Kasten trug `margin-left: auto`. Eine
     selbsttaetige Aussenkante frisst den gesamten freien Platz der ersten
     Zeile -- die Wolke KANN daneben nicht stehen, sie rutscht immer darunter,
     und die Tagzeile kostete zwei Zeilen statt einer. Jetzt ist die Wolke ein
     Flex-Element (`flex: 1 1 0`, `min-width: 0`) und nimmt den Platz, der
     uebrig ist; die Verweise stehen daneben.
     DER PREIS IST BEKANNT UND ANGENOMMEN: die Wolke verliert rund 230 px, also
     etwa drei sichtbare Tags. "mehr" faengt sie -- und die erste Zeile war
     vorher zu drei Vierteln leer.
     GEMESSEN WIRD DIE WOLKE VORHER: begrenzeWolke() braucht sie im Dokument,
     und ob "mehr" ueberhaupt dasteht, haengt an seiner Antwort.
     ZUSAMMEN IN EINEM KASTEN und nicht zwei einzelne Geschwister: die beiden
     gehoeren zusammen und sollen bei einem Umbruch nicht auseinanderfallen.
     KEIN AUSGERECHNETER FREIRAUM. Die Wolke wird beschnitten (`max-height`,
     `overflow: hidden`), ein Verweis IN ihr wuerde mitabgeschnitten -- und
     eine feste Breite daneben ist genau der Fehler, an dem 0.12.1 schon einmal
     hing (`right: 92px`, Befund A). Die Instanz stellt die Schrift von 80 bis
     120 Prozent; jede ausgerechnete Breite kann dabei nur falsch werden. */
  const rechts = document.createElement('div');
  rechts.className = 'frow-rechts';
  if (beschnitten || wolkeOffen.uebersicht) {
    const m = document.createElement('button');
    m.className = 'link-btn';
    m.textContent = wolkeOffen.uebersicht ? 'weniger' : 'mehr';
    m.onclick = () => { wolkeOffen.uebersicht = !wolkeOffen.uebersicht; drawFilters(); };
    rechts.appendChild(m);
  }
  if (f.tagIds.length) {
    const c = document.createElement('button');
    c.className = 'link-btn'; c.textContent = 'zurücksetzen';
    c.onclick = () => { f.tagIds = []; redraw(); };
    rechts.appendChild(c);
  }
  // Ein leerer Kasten bliebe als Flex-Element stehen und naehme der Wolke
  // eine Luecke weg.
  if (rechts.childElementCount) r3.appendChild(rechts);

  /* SORTIEREN UND ANSICHTEN TEILEN SICH EINE ZEILE -- gemessen brauchen sie
     322 und 237 px von 1232, sie passen mit Abstand.
     DER SCHLIMMSTE FALL IST HARMLOS: stehen einmal acht gespeicherte Ansichten
     da (ANSICHTEN_DECKEL), bricht die Zeile um und sieht aus wie vorher. Nichts
     wird abgeschnitten, nichts geht verloren. */
  const r4 = row('Sortieren');
  const sel = document.createElement('select');
  // Eine Kennung wie am Favoritenknopf daneben: ohne sie liesse sich die
  // Sortierung nur ueber ihre Klasse ansprechen, und die tragen alle
  // Auswahlfelder der Instanz.
  sel.id = 'f-sort';
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

  /* ---- Die gespeicherten Ansichten ----
     GANZ UNTEN UND NICHT GANZ OBEN: sie sind die Zusammenfassung der Zeilen
     darueber, und man liest sie, nachdem man weiss, was einstellbar ist.
     Die Zeile steht auch LEER da, mit dem Knopf zum Speichern -- ohne ihn
     erfuehre niemand, dass es Ansichten gibt.
     SEIT 0.13.0 IN DERSELBEN ZEILE WIE DIE SORTIERUNG: sie ist dieselbe Sorte
     Bedienung -- was gezeigt wird, aendert sie nicht -- und beide brauchten je
     eine ganze Zeile fuer ein Auswahlfeld und ein paar Pillen. */
  const r5 = r4;
  zweiteBeschriftung(r5, 'Ansichten');
  const g5 = document.createElement('div'); g5.className = 'pills';
  /* WELCHE ANSICHT GERADE GILT, wird verglichen und nicht gemerkt: ein
     gemerkter Zeiger auf "die aktive Ansicht" liefe auseinander, sobald jemand
     einen Filter von Hand verstellt. Verglichen wird die zurechtgerueckte
     Stellung samt Begriff -- sonst gaelte eine Ansicht mit einer geloeschten
     Kategorie nie als aktiv, obwohl sie genau das zeigt, was sie zeigen kann. */
  const jetzt = JSON.stringify({ filters: filterNormal(state.filters), q: state.search.trim() });
  ANSICHTEN.forEach(a => {
    const b = document.createElement('button');
    const gleich = JSON.stringify({ filters: filterNormal(a.filters),
                                    q: typeof a.q === 'string' ? a.q.trim() : '' }) === jetzt;
    b.className = 'pill' + (gleich ? ' on' : '');
    b.innerHTML = `<span>${esc(a.name)}</span><span class="an-weg" title="Ansicht löschen">✕</span>`;
    b.onclick = () => ansichtAnwenden(a);
    // Das Kreuz liegt IM Knopf und muss deshalb den Klick anhalten -- sonst
    // wuerde die Ansicht im selben Zug angewandt und geloescht.
    b.querySelector('.an-weg').onclick = e => {
      e.preventDefault(); e.stopPropagation(); ansichtLoeschen(a.name);
    };
    g5.appendChild(b);
  });
  if (ANSICHTEN.length < ANSICHTEN_DECKEL) {
    const bNeu = document.createElement('button');
    bNeu.className = 'pill' + (ANSICHTEN.length ? ' pill-sep' : '');
    bNeu.id = 'ansicht-neu';
    bNeu.textContent = '+ Ansicht speichern';
    bNeu.title = 'Filter und Suchbegriff unter einem Namen merken';
    bNeu.onclick = ansichtSpeichern;
    g5.appendChild(bNeu);
  } else {
    // Der Deckel wird GESAGT und nicht durch einen fehlenden Knopf angedeutet:
    // ein Knopf, der einfach nicht mehr da ist, sieht aus wie ein Fehler.
    const hin = document.createElement('span');
    hin.className = 'hint hint-sm';
    hin.textContent = `${ANSICHTEN_DECKEL} sind das Höchste — eine löschen, dann geht die nächste.`;
    g5.appendChild(hin);
  }
  r5.appendChild(g5);

  /* ---- DER RUECKSETZER FUER DIE FILTERLEISTE — 0.17.3 ----
     ER STAND BIS HIERHER NIRGENDS. Ein „zurücksetzen" gab es genau EINMAL, in
     der Tagzeile weiter oben, und auch dort nur, solange mindestens ein Tag
     gewaehlt war. Fuer die Leiste als Ganzes gab es keinen -- gesucht wurde er
     hier, in der Sortierzeile neben „+ Ansicht speichern".
     ER STEHT NUR DA, WENN WIRKLICH ETWAS GESETZT IST, und nennt die Zahl. Ein
     Knopf, der nichts zu tun hat, ist dieselbe Auskunft ueber nichts wie eine
     Null am Zaehler „Offen".
     DIE ZAHL KOMMT AUS filterZahl() UND AUS NICHTS ANDEREM -- dieselbe
     Funktion, die den Schalter ueber den Filtern traegt, mit denselben Regeln:
     drei Kategorien zaehlen als EIN Filter, jeder Tag einzeln. Eine zweite
     Zaehlung daneben waere eine zweite Wahrheit (Stolperstein 47).
     WAS ER NICHT MITRAEUMT, UND BEIDES AUS DEMSELBEN GRUND: die SUCHE -- sie
     hat ihr eigenes ✕ im Suchfeld, und filterZahl() zaehlt sie nicht mit --
     und die SORTIERUNG. Ein Knopf, der „(3)" sagt und vier Dinge wegnimmt,
     sagt die Unwahrheit.
     EINE GESPEICHERTE ANSICHT WIRD NICHT ANGETASTET: zuruecksetzen heisst
     „zeig mir alles", nicht „vergiss, was ich mir gemerkt habe". */
  const filterGesetzt = filterZahl();
  if (filterGesetzt) {
    const rechts5 = document.createElement('div');
    rechts5.className = 'frow-rechts frow-rechts-weit';
    const bZurueck = document.createElement('button');
    bZurueck.className = 'link-btn';
    bZurueck.id = 'filter-zurueck';
    bZurueck.textContent = `Filter zurücksetzen (${filterGesetzt})`;
    bZurueck.title = 'Alle Filter auf „alles zeigen" — Suchbegriff und Sortierung bleiben stehen';
    bZurueck.onclick = () => {
      /* ZURUECKGESETZT WIRD AUF FILTER_VORGABE und sonst nichts -- und der Weg
         dorthin ist filterNormal(), derselbe wie beim Anwenden einer
         gespeicherten Ansicht. Eine zweite Stelle, die eine Filterstellung
         zurechtrueckt, liefe auseinander.
         DIE SORTIERUNG WIRD MITGEGEBEN UND NICHT ZURUECKGESETZT, obwohl sie in
         der Vorgabe steht: sie zaehlt auch nicht mit. */
      state.filters = filterNormal({ sort: state.filters.sort });
      redraw();
    };
    rechts5.appendChild(bZurueck);
    r5.appendChild(rechts5);
  }

  // Ganz zum Schluss, wenn state.filters steht: der Schalter nennt die Zahl
  // der greifenden Filter, und die aendert sich mit jedem Klick auf eine
  // Pille. Er steht ausserhalb von #filters und ueberlebt das Neuzeichnen.
  zeichneFilterSchalter();
}

function drawBody() {
  const body = document.getElementById('body');
  if (!body) return;
  const list = visibleItems();
  /* DIE ZAEHLZEILE NENNT DEN GANZEN BESTAND, nicht die Trefferzahl der Suche:
     `state.bestand` und nicht `state.items.length`. Waehrend einer Suche traegt
     `items` nur die Treffer, und "3 Sachen" waere dann eine falsche Auskunft
     ueber den Bestand.
     UND SIE IST DER ORT FUER DEN ZUSTAND DER SUCHE. Ein eigener Kasten daneben
     waere ein zweiter Platz fuer dieselbe Auskunft; hier steht sie da, wo
     ohnehin die Zahlen stehen. */
  const cnt = document.getElementById('count');
  if (cnt) {
    let z = `${state.bestand} ${vSache(state.bestand)}` +
      (list.length !== state.bestand ? ` · ${list.length} sichtbar` : '');
    if (state.suchLaeuft) z += ' · sucht …';
    else if (state.suchFehler) z += ' · Suche nicht erreichbar, gezeigt wird der letzte Stand';
    cnt.textContent = z;
  }

  drawZeitleiste(list);
  body.innerHTML = '';
  // GEFRAGT WIRD DER BESTAND UND NICHT DIE GEZEIGTE MENGE: eine Suche ohne
  // Treffer ist kein leerer Bestand, und "Noch nichts erfasst" waere dort die
  // falsche Auskunft. Die Absage darunter ist die richtige.
  if (!state.bestand) {
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
  /* WAEHREND DIE SUCHE LAEUFT, BLEIBT DIE ALTE LISTE STEHEN und wird nur
     gedaempft. Eine Liste, die zwischen zwei Tastendruecken leer wird, ist
     schlechter als eine, die einen Augenblick alt ist. */
  grid.className = 'grid' + (state.suchLaeuft ? ' sucht' : '');
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
  const marken = jahresMarken(von, bis);
  marken.forEach(m => {
    const s = document.createElement('span');
    s.className = 'zl-jahr';
    s.style.left = (m.anteil * 100) + '%';
    s.textContent = m.jahr;
    jahre.appendChild(s);
  });

  /* NUR SO VIELE JAHRESZAHLEN, WIE NEBENEINANDER PASSEN.
     Eine Marke je Jahr ist auf einem breiten Schirm richtig und auf einem
     Telefon eine graue Wand: "2026" misst in der Festbreitenschrift rund 23
     Pixel, die Achse ist dort 330 breit -- ab vierzehn Jahren stehen die
     Zahlen uebereinander und keine einzige ist mehr zu lesen. Zwoelf lesbare
     Jahreszahlen sagen mehr als dreissig unlesbare.
     GEMESSEN, NICHT GERATEN: die Breite einer Zahl haengt an der
     eingestellten Schriftgroesse (80 bis 120 Prozent). Deshalb werden erst
     alle gebaut, dann wird die erste vermessen und dann wird ausgeduennt --
     dasselbe Vorgehen wie in begrenzeWolke(), und aus demselben Grund.
     Der Zwischenraum von einer halben Zahlbreite gehoert dazu: zwei
     Jahreszahlen, die einander beruehren, sind eine achtstellige Zahl.
     AUSGEDUENNT WIRD NUR DIE BESCHRIFTUNG. Die Punkte stehen alle da, wo sie
     stehen -- an der Achse selbst aendert sich nichts, nur an ihrer
     Beschriftung. Und bei einer Achse, die nichts zu verbergen hat (weniger
     Jahre als Platz), ist der Schritt 1 und diese Rechnung folgenlos. */
  const zahlBreite = jahre.firstElementChild ? jahre.firstElementChild.offsetWidth : 0;
  const achsenBreite = jahre.clientWidth;
  if (zahlBreite && achsenBreite && marken.length > 1) {
    const passt = Math.max(1, Math.floor(achsenBreite / (zahlBreite * 1.5)));
    const schritt = Math.ceil(marken.length / passt);
    if (schritt > 1)
      [...jahre.children].forEach((el, i) => { if (i % schritt) el.remove(); });
  }
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

/* ================= Der Trefferkontext an der Kachel -- 0.18.0 =================
   WARUM EIN EINTRAG IN DER TREFFERLISTE STEHT. Eine Suche nach "ella" findet
   auch "eurobella" -- unter anderem in einer Linkadresse. Der Treffer ist
   richtig; ohne diese Zeile ist er nur nicht nachvollziehbar, weil die Kachel
   nicht sagt, WO das Wort steht.

   DIE ZEILE STEHT NUR DA, SOLANGE EINE SUCHE LAEUFT. Ohne Begriff traegt die
   Antwort das Feld gar nicht, und die Kachel ist dann Pixel fuer Pixel die
   von vorher.

   WELCHE QUELLE GENANNT WIRD, ENTSCHEIDET DER SERVER -- an einer Stelle und in
   einer festen Folge (VOLLTEXT_QUELLEN). Hier steht nur, wie sie HEISST.
   "Tag am Testtag" heisst je nach eingestelltem Vokabular anders; deshalb
   sind es Funktionen und keine Strings, die einmal beim Laden
   festgelegt wuerden. */
const FUND_WORTE = {
  beschreibung: () => 'Beschreibung',
  kommentar: () => 'Kommentar',
  link: () => 'Link',
  testtag: () => `Tag am ${V.zeitpunktEinzahl}`,
  tag: () => 'Tag',
  kategorie: () => 'Kategorie',
  titel: () => 'Titel'
};
/* EINE UNBEKANNTE QUELLE HEISST "Fundstelle" UND FAELLT NICHT AUS DER ZEILE.
   Ein Server, der eine achte Quelle kennt, und eine Oberflaeche, die sie noch
   nicht kennt, sind derselbe Fall wie eine alte Oberflaeche an einer neuen
   Antwort: die Zeile sagt dann weniger, aber sie luegt nicht und sie
   verschwindet nicht. */
const fundWort = (quelle) => (FUND_WORTE[quelle] || (() => 'Fundstelle'))();

/* DIE VOLLE AUSSAGE STEHT IM UEBERFAHRTEXT. In der Zeile selbst ist kein
   Platz dafuer: die schmalste Kachel ist 240 px breit, und "und 2 weitere
   Stellen" nimmt dort mehr Raum ein als der Ausschnitt, den sie begleitet
   (gemessen, siehe Aenderungsprotokoll 0.18.0). Die Zahl steht deshalb kurz
   in der Zeile und ausgeschrieben darueber. */
const fundUeberfahrt = (f) => `Gefunden in: ${fundWort(f.quelle)}` + (
  f.weitere === 1 ? ' und 1 weitere Stelle'
  : f.weitere > 1 ? ` und ${f.weitere} weitere Stellen` : '');

function card(it) {
  const a = document.createElement('a');
  /* DER BEGRIFF WANDERT IN DIE ADRESSE DER KACHEL. Wer einen Treffer oeffnet
     und neu laedt, behaelt damit die Hervorhebung -- ein Eintrag, der beim
     ersten Blick markierte Stellen hat und nach F5 keine mehr, saehe aus wie
     ein Fehler. Ohne Suche bleibt es bei der Adresse von vorher. */
  const begriff = state.search.trim();
  a.href = eintragAdresse(it.id, begriff);
  a.className = 'card' + (state.compare.has(it.id) ? ' picked' : '') + (it.rejected ? ' rejected' : '');
  const badges = [];
  if (it.rejected) badges.push(`<span class="badge badge-rejected">abgelehnt</span>`);
  if (it.tested) badges.push(`<span class="badge badge-tested">${esc(V.merkmalJa)}</span>`);

  const testLine = it.testCount ? `<div class="card-test">
      <span>${it.testCount} ${esc(vZeit(it.testCount))}</span>
      <span class="sep">·</span><span>⌀ ${it.testAvg.toFixed(1).replace('.', ',')}</span>
      <span class="sep">·</span><span>zuletzt ${it.testLast}</span>
    </div>` : '';

  /* DIE ZEILE STEHT UNTER DEM TITEL UND UEBER DEN TAGS -- bei dem, was sie
     erklaert, und nicht am Fuss bei den Zahlen.
     DER AUSSCHNITT BLEIBT IN DER VORLAGE LEER. Er kann aus einem Kommentar
     stammen, und fuer Kommentartext gilt seit 0.5.4: er kommt nie ueber
     innerHTML in die Seite (Projektstand 5.6). Gefuellt wird er weiter unten
     mit echten Knoten -- mit Hervorhebung, wenn ein Begriff da ist, und ohne,
     wenn nicht. */
  const f = it.fundstelle;
  const fundZeile = f ? `<div class="card-fund" title="${esc(fundUeberfahrt(f))}">
        <span class="fund-quelle">${esc(fundWort(f.quelle))}:</span><span
          class="fund-text"></span>${f.weitere ? `<span class="fund-mehr">+${f.weitere}</span>` : ''}
      </div>` : '';

  a.innerHTML = `
    <div class="card-img">
      ${it.mainPhoto ? `<img src="/api/photos/${it.mainPhoto.id}/raw?size=thumb" alt="" loading="lazy"
        style="${ausschnitt(it.mainPhoto)}">` : ICON_PH}
      ${badges.length ? `<div class="card-badges">${badges.join('')}</div>` : ''}
      ${it.favorite ? `<div class="card-pin" title="Favorit">★</div>` : ''}
      ${istVideo(it.mainPhoto) ? `<div class="card-spielmarke" title="Video">▶</div>` : ''}
      ${bestandText(it)}
    </div>
    <div class="card-body">
      ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
      <h3 class="card-title">${esc(it.title)}</h3>
      ${fundZeile}
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

  if (f) a.querySelector('.fund-text').replaceChildren(hebeHervor(f.text, begriff));
  /* DIE HERVORHEBUNG GILT DORT, WO GESUCHT WURDE -- und die Kachel zeigt drei
     der sieben Quellen: Titel, Kategorie und die ersten vier Tags. Der Rest
     steht in der Zeile darueber.
     ERSETZT WIRD DER FERTIGE TEXTKNOTEN, nicht die Vorlage umgebaut: `esc()`
     hat den Text schon richtig hineingeschrieben, und ohne Begriff bleibt er
     unangetastet stehen. */
  hebeImKnoten(a.querySelector('.card-title'), it.title, begriff);
  if (it.category) hebeImKnoten(a.querySelector('.card-cat'), it.category.name, begriff);
  if (begriff) [...a.querySelectorAll('.card-tags .chip')]
    .forEach((chip, i) => hebeImKnoten(chip, it.tags[i].name, begriff));

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

/* ================= Doppelte Eintraege beim Anlegen =================
   Bei vier Zugaengen und dreihundert Eintraegen legt der zweite Mensch
   dieselbe Maschine ein zweites Mal an -- eine Sache, zwei Wahrheiten.

   EINE ZEILE, KEIN DIALOG. Sie blockiert nichts und verlangt keine
   Entscheidung: sie sagt nur, was schon da ist, mit Sprungmarken dorthin.

   KEINE ROUTE: die Titel des ganzen Bestands liegen ohnehin im Browser.
   GEFRAGT WIRD state.alle UND NICHT state.items -- waehrend einer Suche
   traegt `items` nur die Treffer, und dann fiele der Doppeleintrag genau dann
   nicht auf, wenn man ihn beim Suchen nicht gefunden hat.

   VERGLICHEN WIRD UEBER VIERERGRUPPEN: zwei Titel gelten als aehnlich, wenn
   sie eine Folge von vier Zeichen teilen -- Schreibung und Sonderzeichen
   vorher weggeraeumt. Vier, weil "GSR" und "18V" allein zu viel faenden und
   weil jede laengere gemeinsame Folge eine Vierergruppe enthaelt.
   TRIGRAMME ODER LEVENSHTEIN BRAUCHT ES NICHT: Titel sind kurz. */
const AEHNLICH_FENSTER = 4;
const AEHNLICH_ZEIGE = 5;

// Kleinbuchstaben, Ziffern und Buchstaben mit Zeichen darauf bleiben; alles
// andere faellt weg. "Bosch GSR 18V-60" wird zu "boschgsr18v60".
const titelKern = (t) => String(t || '').toLowerCase().replace(/[^0-9a-zäöüßàáâãèéêëìíîïòóôõùúûñç]+/g, '');

function aehnlicheEintraege(titel) {
  const kern = titelKern(titel);
  if (kern.length < AEHNLICH_FENSTER) return [];
  const fenster = [];
  for (let i = 0; i + AEHNLICH_FENSTER <= kern.length; i++)
    fenster.push(kern.slice(i, i + AEHNLICH_FENSTER));
  const treffer = [];
  for (const it of state.alle) {
    const k = titelKern(it.title);
    if (k.length < AEHNLICH_FENSTER) continue;
    if (fenster.some(f => k.includes(f))) treffer.push(it);
    if (treffer.length >= AEHNLICH_ZEIGE) break;
  }
  return treffer;
}

function openCreate() {
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `<div class="modal"><h2>${esc(V.sacheEinzahl)} anlegen</h2>
    <div class="field"><label>Titel</label><input class="input" id="nt" placeholder="Wie soll es heißen?">
      <div class="hint hint-sm aehnlich" id="nt-aehnlich"></div></div>
    <div class="field"><label>Kurzbeschreibung</label><textarea class="ta" id="nd" placeholder="Worum geht es?"></textarea></div>
    <div class="modal-acts"><button class="btn btn-ghost" id="nc">Abbrechen</button>
    <button class="btn btn-accent" id="ns">Anlegen</button></div></div>`;
  document.body.appendChild(bd);
  const close = () => bd.remove();
  bd.onclick = e => { if (e.target === bd) close(); };
  document.getElementById('nc').onclick = close;
  const nt = document.getElementById('nt');
  const zeile = document.getElementById('nt-aehnlich');
  // Die Zeile wird bei jedem Anschlag neu gebildet. Sie rechnet oertlich und
  // braucht deshalb keinen Debounce -- bei dreihundert Titeln sind es
  // dreihundert includes() auf einer Handvoll Vierergruppen.
  const zeichneAehnlich = () => {
    const treffer = aehnlicheEintraege(nt.value);
    if (!treffer.length) { zeile.innerHTML = ''; return; }
    // Die Sprungmarken schliessen den Dialog: ein offener Kasten ueber dem
    // Eintrag, zu dem man gerade gesprungen ist, waere im Weg.
    zeile.innerHTML = 'Ähnlich: ' + treffer
      .map(it => `<a href="#/item/${it.id}" data-zu>${esc(it.title)}</a>`).join(', ');
    zeile.querySelectorAll('[data-zu]').forEach(a => { a.onclick = () => close(); });
  };
  nt.addEventListener('input', zeichneAehnlich);
  const save = async () => {
    const title = nt.value.trim();
    if (!title) return toast('Titel fehlt', true);
    try {
      const it = await api('POST', '/api/items', { title, description: document.getElementById('nd').value.trim() });
      close(); location.hash = `#/item/${it.id}`;
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('ns').onclick = save;
  nt.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  nt.focus();
}

/* ================= Offene Aufgaben quer über alle Einträge ================= */
/* Diese Ansicht macht vorhandene Funktionalität erreichbar: Aufgaben samt
   Farbkante und Weiterschaltknopf gibt es im Kommentarblock, sichtbar waren
   sie aber nur im geöffneten Eintrag.

   SIE LIEST, SIE ORDNET NICHT UM. Die Reihenfolge kommt vom Server und ist
   dieselbe wie in der Übersicht.

   DIE ÜBERSCHRIFT KOMMT AUS DEM VOKABULAR: wer seine Aufgaben „Mängel" nennt,
   liest hier „Offene Mängel". Deshalb steht in dieser Funktion kein einziges
   der elf einstellbaren Wörter fest. */
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
     angewandt: gewichteter Mittelwert, Nenner nur ueber die Kriterien, die
     ICH bewertet habe. Ungewichtet zeigte der Umschalter "meine / alle" zwei
     Zahlen nach zwei verschiedenen Formeln.
     Ein Kriterium ohne eigenen Wert bringt sein Gewicht NICHT in den Nenner
     -- sonst laege die eigene Zahl unter der ueber alle, ohne dass es an den
     Werten laege.
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

// Nach dem Zoom steht der Bildlauf auf 0/0 -- man saehe die linke obere Ecke
// statt der Stelle, die man eben betrachtet hat. Eigene Funktionsdeklaration,
// weil jsdom kein Layout rechnet und der Pruefstand ihr die Zahlen deshalb
// unmittelbar vorlegen muss.
function zentriereBuehne(buehne) {
  if (!buehne) return;
  buehne.scrollLeft = Math.max(0, (buehne.scrollWidth - buehne.clientWidth) / 2);
  buehne.scrollTop = Math.max(0, (buehne.scrollHeight - buehne.clientHeight) / 2);
}

/* `loeschen` IST FREIWILLIG UND ENTSCHEIDET UEBER DEN PAPIERKORB IM VOLLBILD.
   Wer keinen mitgibt, bekommt keinen -- die Kommentarbilder etwa werden am
   Kommentar entfernt und nicht hier.
   DIE KLEMME WIRD NICHT NEU ERFUNDEN: der Rufer gibt genau die Funktion
   mit, die auch der Papierkorb ueber dem grossen Bild ruft -- samt Rueckfrage,
   samt Route, samt Neuzeichnen der Ansicht darunter. Eine zweite Loeschstelle
   waere eine zweite Gelegenheit, die Rueckfrage zu vergessen.
   SIE LIEFERT `true`, WENN WIRKLICH GELOESCHT WURDE. Ohne diese Antwort
   muesste das Vollbild raten, ob es sein Bild aus der Liste nehmen darf --
   und naehme es auch dann heraus, wenn der Mensch die Rueckfrage abgebrochen
   hat.
   `innen` IST FREIWILLIG UND LIEFERT DEN INNEREN ABSPIELER. Es ist eine
   FUNKTION und kein Element: der Betrachter darunter zeichnet sich beim
   Loeschen neu, und ein gemerktes Element zeigte danach auf einen Knoten, den
   es nicht mehr gibt. Wer keinen mitgibt -- die Kommentarbilder etwa --
   bekommt keinen Wechsel; dort gibt es auch nichts zu uebernehmen. */
function openLightbox(photos, startIdx, title, loeschen, innen) {
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
        ${/* DER PAPIERKORB STEHT ABGESETZT, mit einer groesseren Luecke davor
             -- dieselbe Ueberlegung wie ueber dem grossen Bild darunter: die
             Knoepfe davor stellen etwas ein, dieser hier nimmt etwas weg.
             UND ER STEHT NICHT NEBEN DEM SCHLIESSEN. Zwei Kreuze
             nebeneinander, von denen eines die Ansicht zumacht und das andere
             das Bild vernichtet, waeren die gefaehrlichste Nachbarschaft der
             Instanz. Deshalb traegt er das Papierkorbzeichen und steht vor dem
             Schliessen, nicht daneben. */''}
        ${loeschen ? `<button class="lb-btn weg" title="Löschen">${ICON_PAPIERKORB}</button>` : ''}
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

  /* ---- DER FLIEGENDE WECHSEL ----
     DAS VOLLBILD IST DERSELBE FILM, NUR GROESSER. Bis 0.17.0 baute es sich
     seinen eigenen Abspieler und liess den inneren stehen, wo er war: zwei
     Elemente mit derselben Quelle, zwei Tonspuren, zwei Stellen im Film.
     Also wird uebergeben. Der hier uebernimmt Stelle und Zustand des inneren,
     und der innere GIBT SEINE QUELLE AB -- anhalten allein genuegt nicht: ein
     Element mit Quelle laedt weiter, und es bliebe ein zweiter Abspieler.
     DIE PROBE IST DIE QUELLE UND NICHT DIE NUMMER. Nur wenn der innere
     wirklich dieses Video traegt, gehoert ihm die Stelle -- steht dort ein
     anderes Bild oder gar nichts, wird nichts uebernommen und nichts
     angehalten.
     DIE LEERE QUELLE IST DAS ERKENNUNGSZEICHEN FUER DEN RUECKWEG: leer ist
     nur der, dem wir sie genommen haben. */
  const innerer = () => (typeof innen === 'function' ? innen() : null) || null;
  let uebergabe = null;
  {
    const el = innerer();
    const quelle = istVideo(photos[i]) ? bildQuelle(photos[i], '') : null;
    if (el && quelle && el.getAttribute('src') === quelle) {
      uebergabe = { quelle, stelle: el.currentTime || 0, lief: !el.paused, offen: true };
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
  }

  /* ANHALTEN BEIM BLAETTERN UND BEIM VERLASSEN. Ohne das spielt der Ton
     weiter, waehrend man das naechste Bild ansieht -- und beim Schliessen
     bliebe ein unsichtbares Element am Laufen. Die Quelle wird mit
     abgeraeumt, sonst laedt der Browser weiter.
     UND HIER WIRD DIE STELLE MITGENOMMEN, BEVOR SIE FAELLT: nach dem
     removeAttribute steht sie nicht mehr da. Das gilt fuers Blaettern wie
     fuers Schliessen -- beide gehen durch diese eine Stelle, und deshalb
     braucht der Rueckweg keine zweite. */
  const halteAn = () => {
    if (!abspieler.hidden || abspieler.src) {
      if (uebergabe && abspieler.getAttribute('src') === uebergabe.quelle) {
        uebergabe.stelle = abspieler.currentTime || 0;
        uebergabe.lief = !abspieler.paused;
      }
      abspieler.pause();
      abspieler.removeAttribute('src');
      abspieler.load();
    }
  };

  /* ZURUECK GEHT ES DENSELBEN WEG -- Quelle und Stelle wandern an den inneren
     Abspieler zurueck. ABER NUR, WENN ER NOCH DERSELBE IST: Loeschen aus dem
     Vollbild zeichnet den Betrachter darunter neu, und der neue traegt schon
     seine eigene Quelle. Sie zu ueberschreiben hiesse, ihn auf eine Adresse zu
     setzen, die es vielleicht gar nicht mehr gibt. */
  const gibZurueck = () => {
    if (!uebergabe) return;
    const el = innerer();
    if (!el || el.getAttribute('src')) return;
    el.src = uebergabe.quelle;
    el.currentTime = uebergabe.stelle;
    if (uebergabe.lief) el.play()?.catch?.(() => {});
    uebergabe = null;
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
      /* DIE UEBERNOMMENE STELLE GILT EINMAL, beim Oeffnen. Wer im Vollbild
         weiterblaettert und zurueckkommt, faengt vorn an -- so wie jedes
         andere Video dort auch.
         VOR DEM LADEN GESETZT IST currentTime die "default playback start
         position": der Browser merkt sich die Zahl und springt hin, sobald er
         die Masse kennt. Ein Warten auf loadedmetadata braucht es dafuer
         nicht. */
      if (uebergabe && uebergabe.offen && abspieler.getAttribute('src') === uebergabe.quelle) {
        uebergabe.offen = false;
        abspieler.currentTime = uebergabe.stelle;
        if (uebergabe.lief) abspieler.play()?.catch?.(() => {});
      }
    } else {
      img.src = bildQuelle(photos[i], 'medium');
    }
    // Ohne Original kein Zoomknopf -- ein Knopf, der nichts tut, wirkt kaputt.
    lb.querySelector('.zoom').hidden = !hatOriginal(photos[i]);
    img.title = hatOriginal(photos[i]) ? 'Klick zoomt auf Originalgröße' : '';
    lb.querySelector('.lb-count').textContent = `${i + 1} / ${photos.length}`;
    /* BLEIBT NUR EINES UEBRIG, VERSCHWINDEN PFEILE UND STREIFEN. Beim Oeffnen
       entscheidet die Zahl, OB es sie gibt; danach kann Loeschen sie
       ueberfluessig machen, und ein Pfeil, der auf dasselbe Bild zeigt, sieht
       aus wie ein kaputter Knopf. */
    lb.querySelectorAll('.lb-nav').forEach(k => { k.hidden = photos.length < 2; });
    if (strip) {
      strip.hidden = photos.length < 2;
      [...strip.children].forEach((t, n) => t.classList.toggle('on', n === i));
      strip.children[i]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    }
  }
  /* EIGENE FUNKTION UND NICHT EINE SCHLEIFE BEIM OEFFNEN: nach einem Loeschen
     stimmt der Streifen sonst nicht mehr -- er zeigte das entfernte Bild
     weiter, und der Klick darauf fuehrte auf eine Nummer, die es nicht gibt. */
  function baueStreifen() {
    if (!strip) return;
    strip.innerHTML = '';
    photos.forEach((p, n) => {
      const t = document.createElement('button');
      t.className = 'lb-thumb' + (istVideo(p) ? ' ist-video' : '');
      t.innerHTML = `<img src="${bildQuelle(p, 'thumb')}" alt="">` +
        (istVideo(p) ? `<span class="spielmarke">▶</span>` : '');
      t.onclick = () => { i = n; show(); };
      strip.appendChild(t);
    });
  }
  baueStreifen();

  const close = () => {
    halteAn();
    gibZurueck();
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
  /* GELOESCHT WIRD, WAS MAN ANSIEHT -- dieselbe Regel wie ueber dem grossen
     Bild darunter, und dort steht sie ausfuehrlich begruendet. Die Rueckfrage
     stellt der Rufer; hier wird nur nachgezogen, was danach uebrig ist.
     WAR ES DAS LETZTE BILD, GEHT DAS VOLLBILD ZU. Ein leeres Vollbild mit
     „0 / 0" waere die Ansicht eines Nichts. */
  lb.querySelector('.weg')?.addEventListener('click', async () => {
    const weg = photos[i];
    if (!await loeschen(weg)) return;
    /* WAS GELOESCHT IST, WANDERT NICHT ZURUECK. Der Betrachter darunter hat
       sich beim Loeschen bereits neu gezeichnet; eine Quelle, die es nicht
       mehr gibt, darf ihm hier nicht noch einmal untergeschoben werden. */
    if (uebergabe && bildQuelle(weg, '') === uebergabe.quelle) uebergabe = null;
    photos.splice(i, 1);
    if (!photos.length) { close(); return; }
    baueStreifen();
    show();
  });
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
// handle: Ziehen beginnt nur an diesem Teil.
// Halten, bevor auf dem Finger gezogen wird -- ohne das ist jede Wischbewegung
// ueber einer Liste ein Umsortieren. Mit der Maus bleibt es bei der Schwelle
// von wenigen Pixeln.
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
async function renderDetail(id, begriffAdresse) {
  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND -- und danach
     stehen beide gleich. Aus der Adresse kommt er nach einem Neuladen und aus
     einem weitergegebenen Link; aus dem Zustand kommt er auf jedem Weg in
     einen Eintrag, den die Kachel nicht gebaut hat -- die Glockentafel, die
     Zeitleiste, die offenen Aufgaben, der Vergleich.
     EINE STELLE UND NICHT SECHS: die Adresse hier nachzuziehen ist derselbe
     Griff wie am Ende von renderSystem(), und er greift fuer jeden dieser
     Wege. Wer stattdessen an jedem Absender den Begriff anhaengte, haette ihn
     ab dem naechsten Absender vergessen.
     replaceState UND NICHT location.hash: der Begriff ist kein anderer Ort,
     sondern dieselbe Ansicht mit einer Angabe mehr. Ein Eintrag im Verlauf je
     Buchstabe machte die Zurueck-Taste unbrauchbar, und ein gesetzter Hash
     loeste ein zweites Zeichnen aus. */
  const begriff = (begriffAdresse || state.search).trim();
  if (begriff) state.search = begriff;
  const gewollt = eintragAdresse(id, begriff);
  if (location.hash !== gewollt &&
      typeof history !== 'undefined' && typeof history.replaceState === 'function')
    history.replaceState(null, '', gewollt);
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
          Gelöscht wird mit dem Papierkorb über dem Bild.
          Videos bis 20 MB, als MP4, WebM oder MOV — das Standbild erzeugt der Browser.</p>
      </div>

      <div class="meta-col">
        ${/* DER TITELBEREICH TRAEGT SEIT DIESER RUNDE EINEN NAMEN, und der
             Name ist der ganze Zweck: auf einem Telefon steht er VOR dem
             Bild. Ohne Klasse liesse er sich nicht ansprechen, und ohne
             Ansprache muesste die Reihenfolge in app.js entschieden werden --
             also von einem Aufbau, der die Fensterbreite gar nicht kennt.
             WARUM DER TITEL NACH VORN GEHOERT: einspaltig steht sonst zuerst
             das Bild, dann die Vorschaubilder, dann das Feld zum Hochladen
             und dann sechs Zeilen Erklaerung dazu -- und erst danach erfaehrt
             man, WELCHE Sache man da eigentlich ansieht. Auf einem breiten
             Schirm faellt das nicht auf, weil beides nebeneinander steht.
             Auf dem breiten Schirm aendert die Klasse nichts: sie traegt
             dort keine einzige Regel. */''}
        <div class="titel-kopf">
          <div class="title-line">
            <input class="title-in" id="title" value="${esc(item.title)}">
            <button class="pin-btn${item.favorite ? ' on' : ''}" id="pin" title="${item.favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}">${item.favorite ? '★' : '☆'}</button>
          </div>
          <div class="hint hint-sm verfasser-zeile" id="ivf" hidden></div>
          <div class="switches" style="margin-top:10px">
            <button class="switch" id="sw-test"><span class="knob"></span><span id="sw-test-t"></span></button>
            <button class="switch" id="sw-rej"><span class="knob"></span><span id="sw-rej-t"></span></button>
          </div>
          ${/* DIE MARKE „abgelehnt" WIRD ZUR AUSSAGE, und eine Aussage traegt
               in dieser Instanz ihren Verfasser: „Abgelehnt am 14.03.2026,
               09:12 von Anna — Lieferzeit über 6 Monate."
               EIGENE ZEILE UNTER DEM SCHALTER, nicht Text IM Schalter: der
               Knopf traegt den Zustand, den er umlegt, und ein Satz darin
               risse ihn bei 120 Prozent Schrift ueber die Zeile. Dieselbe
               Bauform und dieselbe Klasse wie „Angelegt von … am …" darueber.
               DAS FELD STEHT BEIM EINSCHALTEN OFFEN UND SCHLIESST SICH
               DANACH. Offen beim Einschalten, weil ein Feld, das man erst
               suchen muss, leer bleibt; geschlossen danach, weil die Aussage
               daneben schon dasteht -- ein dauernd offenes Feld sagte
               dieselbe Sache ein zweites Mal. Zurueck kommt es ueber den Text
               oder ueber das ✎, und beides gibt es nur fuer den, der die
               Begruendung getroffen hat.
               Beide sind versteckt, solange nicht abgelehnt ist. */''}
          <div class="hint hint-sm verfasser-zeile rej-aussage" id="rej-marke" hidden></div>
          <div class="row-in rej-grund" id="rej-grund-zeile" hidden>
            <input class="input input-sm" id="rej-grund" maxlength="200"
                   placeholder="Warum abgelehnt? (freiwillig)" style="padding:8px 11px">
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
      ${/* DER SPRUNGKNOPF, und er ist ein Sprung und kein zweites Formular.
           Das vorhandene traegt Bilder-Einfuegen, Anpinnen, Art-Umschalter und
           Mitwachsen; ein zweites davon im Dialog waeren zwei Wahrheiten ueber
           dasselbe Formular, und die eine wuerde irgendwann vergessen.
           ER SITZT IM KOPF, WEIL DAS FORMULAR UNTEN SITZT: bei vierzig
           Kommentaren ist der Weg dorthin weit, und auf dem Telefon steht die
           Liste einspaltig und ist damit noch laenger.
           ALS BUTTON UND NICHT ALS VERWEIS -- kopf.onclick nimmt jeden Klick
           auf ein `button` aus, und ohne das klappte der Sprung den Block im
           selben Atemzug ein. */''}
      <div class="block-head"><span class="label">Kommentare</span><span class="hint" id="ccount"></span>
        <button class="link-btn" id="cjump" title="Zum Schreibfeld springen">+ Kommentar</button></div>
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
  /* ---- Ein Foto oder Video entfernen ----
     EINE FUNKTION, ZWEI RUFER: der Papierkorb ueber dem grossen Bild und der
     im Vollbild. Die Rueckfrage, die Route und das Neuzeichnen stehen damit an
     EINER Stelle; zwei Ausfertigungen waeren zwei Gelegenheiten, die
     Rueckfrage zu vergessen -- und ein Loeschknopf ohne Rueckfrage waere der
     gefaehrlichste Knopf der Instanz.
     SIE LIEFERT, OB WIRKLICH GELOESCHT WURDE. Das Vollbild braucht die
     Antwort, um sein Bild aus der eigenen Liste zu nehmen; ein abgebrochenes
     Loeschen darf dort nichts verschwinden lassen. */
  async function loescheFoto(foto) {
    if (!foto) return false;
    const wort = istVideo(foto) ? 'Video' : 'Foto';
    if (!await confirmBox(`${wort} löschen?`, `Dieses ${wort} wird unwiderruflich entfernt.`)) return false;
    try {
      await api('DELETE', `/api/photos/${foto.id}`);
      item = await api('GET', `/api/items/${id}`);
      if (idx >= item.photos.length) idx = Math.max(0, item.photos.length - 1);
      drawViewer(); drawThumbs();
      return true;
    } catch (err) { toast(err.message, true); return false; }
  }

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
      ${/* EINE REIHE UND NICHT DREI AUSGERECHNETE ABSTAENDE. Die Knoepfe
           standen vorher einzeln am rechten Rand, und der Vollbildknopf trug
           dafuer die Zahl 92 -- die Breite des Wortes "Ausschnitt" bei 100
           Prozent Schrift. Bei 120 Prozent schoben sie sich uebereinander.
           Eine Flexreihe braucht die Zahl nicht.
           DER VOLLBILDKNOPF NUR AM VIDEOPLATZ. Beim Foto oeffnet der Klick
           aufs Bild das Vollbild; am Video gehoert der Klick der
           Abspielsteuerung, und ohne diesen Knopf kaeme man von einem reinen
           Videobestand aus gar nicht hinein.
           DER PAPIERKORB STEHT ABGESETZT, mit einer groesseren Luecke davor.
           Dieselbe Ueberlegung wie beim Favoritenfilter in der Filterzeile:
           die beiden davor stellen etwas ein, dieser hier nimmt etwas weg.
           Ohne den Abstand liest er sich als dritte Einstellung. */''}
      <div class="vtools${ausschnittModus ? ' offen' : ''}">
        <button class="vfocus${ausschnittModus ? ' on' : ''}" title="Bildausschnitt der Vorschau festlegen"
          aria-label="Bildausschnitt der Vorschau festlegen">${ICON_AUSSCHNITT}</button>
        ${zeigtVideo ? `<button class="vfull" title="Vollbild öffnen" aria-label="Vollbild öffnen">${ICON_VOLLBILD}</button>` : ''}
        <button class="vweg" title="${istVideo(ps[idx]) ? 'Video' : 'Foto'} löschen"
          aria-label="${istVideo(ps[idx]) ? 'Video' : 'Foto'} löschen">${ICON_PAPIERKORB}</button>
      </div>
      ${/* DER SCHIEBER STEHT NUR IM AUSSCHNITTMODUS, und er steht IM
           BETRACHTER und nicht in einer eigenen Bedienflaeche daneben: der
           Ausschnitt wird an einem Ort eingestellt, nicht an zweien.
           EIN SCHIEBER UND KEIN MAUSRAD: ein Rad gaebe es auf dem Telefon
           nicht, und die Bedienung waere dann geraeteabhaengig -- genau das,
           was die Kachelreihe seit 0.12.0 vermeidet. */''}
      ${ausschnittModus && !zeigtVideo ? `<div class="vzoom">
        <label for="vzoom-schieber">Näher</label>
        <input type="range" id="vzoom-schieber" min="100" max="400" step="5"
          value="${Number(ps[idx].zoom) || 100}" aria-label="Wie eng der Ausschnitt sitzt">
        <span class="vzoom-wert" id="vzoom-wert">${Math.round(Number(ps[idx].zoom) || 100)} %</span>
      </div>` : ''}
      ${ps.length > 1 ? `<button class="vnav prev" title="Vorheriges (←)">‹</button>
        <button class="vnav next" title="Nächstes (→)">›</button>
        <span class="vcount">${idx + 1} / ${ps.length}</span>` : ''}`;
    const bild = v.querySelector('img');
    /* DAS VOLLBILD BEKOMMT DENSELBEN PAPIERKORB -- eine Funktion, zwei Rufer.
       Eine EIGENE Liste geht mit: das Vollbild nimmt sein geloeschtes Bild
       selbst heraus, waehrend hier unten `item` frisch vom Server kommt.
       Beide Listen zeigen danach dasselbe, aber keine haengt an der anderen.
       UND ES BEKOMMT DEN INNEREN ABSPIELER -- als Funktion, nicht als
       Element: `drawViewer()` baut den Betrachter beim Loeschen und beim
       Blaettern neu auf, und ein gemerkter Knoten waere danach ein Waisenkind.
       Ohne diese Mitgabe liefen zwei Abspieler nebeneinander. */
    const innererAbspieler = () => v.querySelector('video');
    if (bild) bild.onclick = () => {
      if (!ausschnittModus)
        openLightbox([...item.photos], idx, item.title, loescheFoto, innererAbspieler);
    };
    v.querySelector('.vfull')?.addEventListener('click',
      () => openLightbox([...item.photos], idx, item.title, loescheFoto, innererAbspieler));
    v.querySelector('.vfocus').onclick = () => {
      ausschnittModus = !ausschnittModus;
      drawViewer();
      if (ausschnittModus) toast('Klicken oder ziehen legt den Bildausschnitt fest');
    };
    /* GELOESCHT WIRD AM GROSSEN BILD, und das ist der Kern dieser Aenderung.
       Vorher sass ein Kreuz auf jeder Vorschaukachel. Auf dem Finger stand es
       dauerhaft da und war 27 Pixel gross -- auf einer Kachel von 62 Pixeln
       ein Fuenftel der Flaeche, und zwar genau in der Ecke, auf der der Daumen
       aufsetzt, wenn er ueber die Reihe wischt. Die Reihe las sich damit nicht
       mehr als vier Bilder, sondern als vier Loeschknoepfe.
       DIE VORSCHAUREIHE TRAEGT DESHALB AUF DEM FINGER KEINE ZERSTOERUNG MEHR
       (das entscheidet das Stylesheet). Sie behaelt genau zwei Aufgaben, und
       beide sind harmlos: antippen zeigt, langes Druecken verschiebt.
       Hier dagegen ist das Bild gross und der Zaehler daneben sagt, welches es
       ist -- man loescht, was man ansieht. Dasselbe Bild, das eine Kamera
       zeigt, wenn man dort den Papierkorb drueckt. */
    v.querySelector('.vweg').onclick = () => loescheFoto(ps[idx]);
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
    /* DIE WEITE WIRD HIER GEMERKT UND NICHT AM foto GELESEN. Nach dem
       Speichern kommt `item` frisch vom Server, `foto` zeigt aber weiter auf
       die alte Liste -- der Betrachter wird dabei absichtlich nicht neu
       gezeichnet, sonst spraenge der Ausschnittmodus bei jedem Zug zu. */
    let zoom = Number(foto.zoom ?? 100) || 100;

    /* WIE GROSS DER SICHTBARE AUSSCHNITT IST UND WIE WEIT ER WANDERN KANN.
       BEIDES AN EINER STELLE, seit 0.19.1 -- vorher rechnete `zeichne()` die
       Lage des Rahmens und `ausPunkt()` den Spielraum, und die beiden liefen
       auseinander.

       DER BEFUND, DER DAZU GEFUEHRT HAT: an einem fast quadratischen Bild
       liess sich der Ausschnitt WAAGERECHT GAR NICHT verschieben und senkrecht
       kaum. Der Grund stand hier: der Spielraum war `breite - seite`, also
       allein die Ueberlaenge der laengeren Seite -- bei 542 x 568 Bildpunkten
       sind das 0 waagerecht und 26 senkrecht. DER ZOOM KAM DARIN NICHT VOR,
       und genau er macht den sichtbaren Ausschnitt kleiner und damit den
       Spielraum groesser.

       DIE RECHNUNG, UND SIE IST DIE DER KACHEL:
         die Kachel ist quadratisch und zeigt mit `object-fit: cover` die
         kurze Seite ganz -- `seite`;
         `transform: scale(z)` verkuerzt das Sichtbare auf `seite / z` -- `eng`;
         `object-position: X%` und `transform-origin: X%` zusammen legen diesen
         Ausschnitt linear auf den Weg `breite - eng`.
       Nachgerechnet: der sichtbare Bereich in Bildpunkten beginnt bei
       `(X/100) * (breite - eng)` und ist `eng` breit. BEI zoom = 100 IST
       `eng === seite`, und die Rechnung ist Zeichen fuer Zeichen die alte --
       diese Runde nimmt also nichts weg, sie ergaenzt den Zoom.

       WARUM DAS OHNE `transform-origin` GAR NICHT GINGE: mit ihm folgt der
       Vergroesserungspunkt dem eingestellten Punkt, ohne ihn saesse er in der
       Mitte. Beide Haelften gehoeren zusammen -- die eine ohne die andere
       zeigt etwas anderes als die Kachel (Stolperstein 276). */
    const masse = () => {
      const f = flaeche();
      const seite = Math.min(f.breite, f.hoehe);   // was die Kachel bei zoom 100 zeigt
      const eng = seite * 100 / zoom;              // was sie beim eingestellten Zoom zeigt
      return { f, seite, eng, spielX: f.breite - eng, spielY: f.hoehe - eng };
    };

    const zeichne = () => {
      const { f, eng, spielX, spielY } = masse();
      const vr = v.getBoundingClientRect();
      rahmen.style.left = (f.links - vr.left + spielX * fx / 100) + 'px';
      rahmen.style.top = (f.oben - vr.top + spielY * fy / 100) + 'px';
      rahmen.style.width = eng + 'px';
      rahmen.style.height = eng + 'px';
    };
    zeichne();
    if (!bild.complete) bild.onload = zeichne;

    // Aus der Zeigerposition den Fokuspunkt errechnen: der angeklickte Punkt
    // soll in der Mitte des Ausschnitts liegen, soweit das Bild das hergibt.
    const ausPunkt = (e) => {
      const { f, eng, spielX, spielY } = masse();
      const px = e.clientX - f.links, py = e.clientY - f.oben;
      /* GERECHNET WIRD MIT DEMSELBEN `eng` WIE OBEN. Stuende hier `seite`,
         landete der Zeiger nicht in der Mitte des Rahmens, den er gerade
         zieht -- und der Sprung waere umso groesser, je enger der Ausschnitt.
         BLEIBT KEIN SPIELRAUM, IST 50 DIE EINZIGE EHRLICHE ANTWORT: ein Bild,
         von dem die Kachel alles zeigt, hat keine Wahl zu treffen. */
      fx = spielX > 0 ? Math.min(100, Math.max(0, (px - eng / 2) / spielX * 100)) : 50;
      fy = spielY > 0 ? Math.min(100, Math.max(0, (py - eng / 2) / spielY * 100)) : 50;
      zeichne();
    };

    let zieht = false;
    v.onpointerdown = (e) => {
      // Der Schieber gehoert nicht zur Flaeche, auf der gezogen wird -- ohne
      // ihn in dieser Liste setzte jeder Griff an den Schieber zugleich den
      // Fokuspunkt auf die Stelle, an der der Schieber steht.
      if (e.target.closest('.vfocus, .vnav, .vzoom')) return;
      zieht = true; ausPunkt(e);
      v.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    v.onpointermove = (e) => { if (zieht) ausPunkt(e); };
    /* EIN SPEICHERWEG FUER BEIDE BEDIENUNGEN. Ziehen und Schieben setzen
       denselben Ausschnitt und gehen deshalb durch dieselbe Zusage -- zwei
       Aufrufstellen mit zwei Meldungen waeren zwei Wahrheiten darueber, was
       gerade gespeichert wurde. */
    const speichere = async () => {
      try {
        item = await api('PUT', `/api/photos/${foto.id}/focus`, { x: fx, y: fy, zoom });
        drawThumbs();
        toast('Bildausschnitt gespeichert');
      } catch (e) { toast(e.message, true); }
    };
    v.onpointerup = () => {
      if (!zieht) return;
      zieht = false;
      speichere();
    };

    /* DER SCHIEBER: `input` zeichnet mit, `change` speichert. Beim Ziehen des
       Fokuspunkts ist es dieselbe Teilung -- die Bewegung ist sichtbar, die
       Schreibung geschieht einmal am Ende. Ein Aufruf je Zwischenschritt
       schickte bei einem Zug ueber die ganze Leiter sechzig Anfragen. */
    const schieber = v.querySelector('#vzoom-schieber');
    if (schieber) {
      const wert = v.querySelector('#vzoom-wert');
      schieber.oninput = () => {
        zoom = Number(schieber.value) || 100;
        if (wert) wert.textContent = `${Math.round(zoom)} %`;
        zeichne();
      };
      schieber.onchange = speichere;
    }
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
      t.innerHTML = `<img src="/api/photos/${p.id}/raw?size=thumb" alt="" style="${ausschnitt(p)}">` +
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

  /* WISCHEN BLAETTERT, wie im Vollbild und mit denselben Massen (45 Pixel
     waagerecht, und waagerecht muss deutlicher sein als senkrecht). Auf einem
     Telefon ist der Wisch die Bewegung, die man ohne Nachdenken macht.
     DIE PFEILE BLEIBEN TROTZDEM STEHEN -- sie sind seit dieser Runde auch auf
     dem Finger sichtbar (siehe `@media (hover: none)` am `.vnav` im
     Stylesheet). Der Wisch ist der bequeme Weg, der Pfeil der auffindbare;
     eine Geste, die man nur durch Zufall entdeckt, ist keine Bedienung.
     DIE ZUSAGEN HAENGEN AM BETRACHTER SELBST UND WERDEN GENAU EINMAL
     GEGEBEN. drawViewer() ersetzt bei jedem Blaettern nur die KINDER von
     #viewer; stuenden sie dort, kaeme mit jedem Bild ein weiteres Paar dazu,
     und nach dem dritten Wisch spraenge die Ansicht um drei Bilder weiter.
     Aus demselben Grund raeumt drawViewer() seine eigenen Zeigerbehandler von
     Hand ab -- die hier sind die Ausnahme, weil sie nie ersetzt werden.
     NICHT IM AUSSCHNITTMODUS: dort zieht der Finger den Rahmen des
     Bildausschnitts, und ein Blaettern mittendrin verwuerfe die Einstellung.
     passive: true, weil nichts verhindert wird: war der Wisch senkrecht
     gemeint, scrollt die Seite weiter, als waere nichts gewesen. */
  const buehne = document.getElementById('viewer');
  const WISCH_WEG = 45;
  let wischX = 0, wischY = 0, wischt = false;
  buehne.addEventListener('touchstart', e => {
    if (ausschnittModus || e.touches.length !== 1 || item.photos.length < 2) return;
    /* NICHT AUF DEM ABSPIELER. Der steht als Kind im Bildbereich und bringt
       seine eigene Steuerung mit -- Beruehrungen darauf steigen bis hierher
       auf. Ohne diese Zeile ist jedes Ziehen am Schieberegler des Videos
       zugleich ein Wisch: man will an eine andere Stelle im Film und landet
       im naechsten Bild. Der Wisch gilt dem Blaettern zwischen Bildern, und
       die Steuerung eines Videos ist kein Bild. */
    if (e.target.closest('video')) return;
    wischX = e.touches[0].clientX; wischY = e.touches[0].clientY; wischt = true;
  }, { passive: true });
  buehne.addEventListener('touchend', e => {
    if (!wischt || ausschnittModus) return;
    wischt = false;
    const dx = e.changedTouches[0].clientX - wischX;
    const dy = e.changedTouches[0].clientY - wischY;
    if (Math.abs(dx) > WISCH_WEG && Math.abs(dx) > Math.abs(dy)) {
      idx += dx < 0 ? 1 : -1;
      drawViewer(); markThumb();
    }
  }, { passive: true });

  /* ---- Schalter ---- */
  function drawSwitches() {
    const t = document.getElementById('sw-test'), r = document.getElementById('sw-rej');
    const locked = item.testDays.length > 0;
    t.className = 'switch' + (item.tested ? ' on-green' : '') + (locked ? ' locked' : '');
    t.title = locked ? `Solange ${V.zeitpunktMehrzahl} eingetragen sind, lässt sich das nicht zurücknehmen.` : '';
    document.getElementById('sw-test-t').textContent = item.tested ? V.merkmalJa : V.merkmalNein;
    r.className = 'switch' + (item.rejected ? ' on-red' : '');
    document.getElementById('sw-rej-t').textContent = item.rejected ? 'Abgelehnt' : 'Nicht abgelehnt';
    drawAblehnung();
  }

  /* DIE AUSSAGE ZUR ABLEHNUNG -- Datum, Verfasser und Grund, und JEDES DER
     DREI DARF FEHLEN. Eine Ablehnung aus einer Instanz vor 0.14.0 hat keines
     davon; ein Grund ist freiwillig; und ein Zugang kann entfernt worden sein.
     Zusammengesetzt wird deshalb aus dem, was DA ist, und nicht aus einer
     Vorlage mit Luecken.
     STEHT GAR NICHTS DA, BLEIBT DIE ZEILE WEG: „Abgelehnt" allein saende
     dasselbe wie der Schalter darueber -- dieselbe Aussage zweimal.
     AM GRABSTEIN STEHT KEIN NAME: verfasserName() macht daraus „Gelöschter
     Benutzer 7", und die Abbildung von der Nummer auf den Namen ist eine
     Stelle und kein zweiter Weg. Ein Verfasserobjekt, das gar nicht da ist,
     laesst das „von" weg -- „von Ohne Verfasser" waere eine Behauptung ueber
     jemanden, den diese Instanz nicht kennt.
     Das Datum in derselben Schreibweise wie ueberall sonst (fmtDate); zwei
     Schreibweisen fuer denselben Zeitpunkt waeren eine zu viel.
     BEI GENAU EINEM ZUGANG FAELLT DER NAME WEG, wie an jeder anderen
     Verfasserangabe: es gibt nur einen, und "von pruefer" saende nichts.
     DATUM UND GRUND BLEIBEN dabei stehen -- sie sind der INHALT der
     Entscheidung und keine Angabe ueber eine Person. Deshalb faellt hier der
     Name weg und nicht die ganze Zeile. */
  /* OB JEMAND DAS FELD AUSDRUECKLICH GEOEFFNET HAT, ist Ansichtszustand und
     gehoert deshalb hierher und nicht in `item`: der Server weiss nichts davon,
     und eine Antwort, die es mitbraechte, waere eine Auskunft ueber ein
     Fenster.
     ES IST NUR DIE HAELFTE DER FRAGE, SEIT 0.15.1. Ob das Feld dasteht, haengt
     am ZUSTAND und nicht an einem Klick: es steht offen, solange abgelehnt ist
     und KEIN Grund dasteht -- und darueber hinaus dann, wenn jemand es ueber
     den Text oder das ✎ aufgemacht hat. Damit kommt es nach dem Entfernen des
     Grundes von selbst zurueck, und ein neu geladener Eintrag ohne Grund
     zeigt es ebenso. */
  let grundOffen = false;

  function drawAblehnung() {
    const marke = document.getElementById('rej-marke');
    const zeile = document.getElementById('rej-grund-zeile');
    const feld = document.getElementById('rej-grund');
    if (!marke || !zeile || !feld) return;

    /* WER WAS DARF, KOMMT VOM SERVER UND WIRD NICHT ZURUECKGERECHNET -- diese
       Seite kennt ihren NAMEN (`NAME`), nicht ihre Nummer, und aus einem
       Grabstein liesse sich ohnehin nichts holen. Geliefert werden zwei
       Tatsachen, gerechnet wird hier, und zwar genau wie am Kommentar:
         `darf`      spiegelt darfAendern am EINTRAG. Ohne ihn kommt gar kein
                     Schreiben an `rejectedGrund` durch die erste Klemme.
         `meins`     UMSCHREIBEN -- nur wer die Begruendung getroffen hat, und
                     nur, solange er den Eintrag auch aendern darf.
         `verwalten` ENTFERNEN -- "Loeschen ja, umschreiben nein": das ist
                     dieselbe Klemme wie am Eintrag und deshalb `darf`.
       HERRENLOS IST EIN EIGENER FALL: eine Ablehnung aus einer Instanz vor
       0.14.0 hat keinen Verfasser. Der Server laesst dort jeden schreiben, der
       den Eintrag aendern darf -- ohne diesen Zweig gaebe es hier keinen Weg
       hinein, und die Zusage des Servers liefe ins Leere. `rejectedVerfasser`
       ist GENAU DANN null, wenn die Spalte leer ist: ein Grabstein steht
       weiter in der Verfasserkarte und kommt als Objekt ohne Namen. */
    const darf = item.mine === true || ADMIN;
    const meins = darf && (item.rejectedMine === true || !item.rejectedVerfasser);
    const verwalten = darf;
    const grund = (item.rejected_grund || '').trim();

    /* WANN DAS FELD DASTEHT -- die Regel aus dem Betrieb, 29. August 2026:
       ABGELEHNT UND KEIN GRUND. Das ist der Zustand, in dem etwas fehlt, und
       nur dort gehoert eine Eingabe hin. Ein Eintrag, an dem niemand den
       Ablehnungsknopf gedrueckt hat, braucht sie gar nicht -- sie naehme
       umsonst Platz (gemessen: 72,9 px).
       UND DARUEBER HINAUS AUF WUNSCH: wer den Text oder das ✎ anklickt, macht
       sie auf, um einen vorhandenen Grund zu aendern. Das ist `grundOffen`.
       EIN FELD, DAS NIEMAND FUELLEN DARF, STEHT NIE OFFEN. */
    const offen = item.rejected && meins && (!grund || grundOffen);
    if (!offen) grundOffen = false;
    zeile.hidden = !offen;
    // Der Vorschlag zum Ueberschreiben: beim Oeffnen steht die alte
    // Begruendung im Feld. Waehrend getippt wird, NICHT ueberschreiben --
    // drawSwitches() laeuft auch nach dem Speichern des Grundes.
    if (offen && document.activeElement !== feld) feld.value = item.rejected_grund || '';

    const teile = [];
    if (item.rejected_at) teile.push(`am ${fmtDate(item.rejected_at)}`);
    if (item.rejectedVerfasser && mehrereBenutzer())
      teile.push(`von ${verfasserName(item.rejectedVerfasser)}`);
    const kopf = teile.length ? `Abgelehnt ${teile.join(' ')}` : '';

    /* DAS ✎ STEHT AUCH OHNE BEGRUENDUNG DA. Ohne Text gibt es nichts
       anzuklicken, und ohne das Zeichen gaebe es dann gar keinen Weg mehr in
       das Feld -- der Schalter steht ja schon auf "abgelehnt".
       DAS ✕ NUR MIT BEGRUENDUNG: ein Papierkorb an einem leeren Feld boete
       an, nichts zu entfernen. */
    const zeigeStift = item.rejected && meins;
    const zeigeWeg = item.rejected && verwalten && !!grund;
    /* WAEHREND GESCHRIEBEN WIRD, TRITT DIE AUSSAGE ZURUECK: das Feld IST in
       diesem Augenblick die Aussage, und beides nebeneinander waere genau die
       Doppelung, die dieser Ruhezustand aufloest. Der Kommentar macht es
       genauso -- sein Text weicht dem Textfeld. */
    marke.hidden = !item.rejected || offen || (!kopf && !grund && !zeigeStift);
    marke.innerHTML = '';
    const text = document.createElement('span');
    text.className = 'rej-text';
    if (kopf) text.appendChild(document.createTextNode(grund ? `${kopf} — ` : kopf));
    if (grund) {
      /* DER GRUND IST DIE ENTSCHEIDUNG UND BEKOMMT DAS ROT DES SCHALTERS;
         Datum und Name bleiben grau. Sie sind eine Verfasserangabe wie
         „Angelegt von … am …" und keine Aussage ueber die Sache -- und ein
         ganzer Satz in Rot naehme dem Grund die Hervorhebung wieder weg. */
      const w = document.createElement('span');
      w.className = 'rej-warum' + (meins ? ' klick' : '');
      w.textContent = grund;
      if (meins) { w.title = 'Begründung ändern'; w.onclick = oeffneGrund; }
      text.appendChild(w);
    }
    marke.appendChild(text);

    // Dieselbe Bauform, dieselben Klassen, dieselben Zeichen wie am Kommentar.
    // Eine zweite Bauform fuer dasselbe waere eine zweite Wahrheit.
    const acts = document.createElement('span');
    acts.className = 'acts';
    if (zeigeStift) {
      const b = document.createElement('button');
      b.className = 'mact ed'; b.textContent = '✎';
      b.title = grund ? 'Begründung ändern' : 'Begründung schreiben';
      b.onclick = oeffneGrund;
      acts.appendChild(b);
    }
    if (zeigeWeg) {
      const b = document.createElement('button');
      b.className = 'mact rm'; b.textContent = '✕';
      b.title = 'Begründung entfernen';
      b.onclick = entferneGrund;
      acts.appendChild(b);
    }
    marke.appendChild(acts);
  }

  /* AUSDRUECKLICH AUFMACHEN -- fuer den einen Fall, den die Regel nicht schon
     abdeckt: es steht ein Grund da, und er soll geaendert werden. Ohne Grund
     ist das Feld ohnehin offen, und dieser Weg fuehrt dann nur den Zeiger
     hinein. */
  function oeffneGrund() {
    grundOffen = true;
    drawAblehnung();
    const feld = document.getElementById('rej-grund');
    if (feld) feld.focus();
  }

  /* DAS ENTFERNEN GEHT ALS LEERER GRUND HINAUS, und der Server macht daraus
     ein Entfernen: leer nach grundText() heisst wegnehmen und laeuft ueber
     darfAendern, alles andere ueber nurSelbst.
     DATUM UND VERFASSER BLEIBEN STEHEN -- „Abgelehnt am 14.03.2026 von Anna"
     ist weiterhin wahr, nur der Grund fehlt. Deshalb wird hier auch NICHT das
     Merkmal zurueckgenommen; das ist der Schalter darueber und eine andere
     Handlung.
     GEFRAGT WIRD VORHER: die Angabe ist danach nirgends wiederherzustellen. */
  async function entferneGrund() {
    if (!await confirmBox('Begründung entfernen?',
      'Der Text wird unwiderruflich entfernt. Datum und Verfasser der Ablehnung bleiben stehen.',
      'Entfernen')) return;
    try {
      item = await api('PUT', `/api/items/${id}`, { rejectedGrund: '' });
      grundOffen = false; drawSwitches(); toast('Begründung entfernt');
    } catch (e) { toast(e.message, true); }
  }
  document.getElementById('sw-test').onclick = async () => {
    try { item = await api('PUT', `/api/items/${id}`, { tested: !item.tested }); drawSwitches(); drawTestDays(); }
    catch (e) { toast(e.message, true); }   // Sperre wird serverseitig begruendet
  };
  document.getElementById('sw-rej').onclick = async () => {
    /* BEIM EINSCHALTEN GEHT DIE ALTE BEGRUENDUNG MIT HINAUS. Der Server
       schreibt die drei Angaben zusammen: eine neue Entscheidung bekommt
       neues Datum, neuen Namen und den Text, der im Rumpf steht. Ohne dieses
       Feld faenge jede erneute Ablehnung mit einer leeren Zeile an -- und die
       Angabe, die beim Zuruecknehmen ausdruecklich stehen geblieben ist, waere
       damit doch weg. Sie steht anschliessend im Feld und laesst sich
       ueberschreiben; das ist der Vorschlag und keine Uebernahme im Stillen.
       BEIM AUSSCHALTEN GEHT NUR DAS MERKMAL HINAUS: die drei Angaben bleiben,
       wo sie sind. */
    const rumpf = item.rejected
      ? { rejected: false }
      : { rejected: true, rejectedGrund: item.rejected_grund || '' };
    try {
      item = await api('PUT', `/api/items/${id}`, rumpf);
      /* BEIM EINSCHALTEN STEHT DAS FELD OFFEN, WENN KEIN GRUND DASTEHT -- und
         das entscheidet seit 0.15.1 die Regel in drawAblehnung() und nicht
         dieser Klick. Hier wird deshalb NICHTS aufgeklappt, sondern nur der
         Zeiger hineingesetzt, wenn es ohnehin dasteht: ein Feld, das man erst
         suchen muss, bleibt leer.
         WIRD EIN EINTRAG MIT VORHANDENEM GRUND ERNEUT ABGELEHNT, bleibt es zu
         -- der Grund steht dann in der Aussage und laesst sich ueber das ✎
         aendern. Er ist nicht verloren, er steht nur woanders.
         BEIM AUSSCHALTEN VERSCHWINDEN BEIDE: es gibt nichts mehr zu begruenden,
         und die Angaben bleiben trotzdem in der Zeile stehen. */
      grundOffen = false;
      drawSwitches();
      const f = document.getElementById('rej-grund');
      if (f && !document.getElementById('rej-grund-zeile').hidden) f.focus();
    }
    catch (e) { toast(e.message, true); }
  };
  /* Der Grund wird beim Verlassen des Feldes gespeichert, wie Titel und
     Beschreibung daneben -- und mit Enter, weil es eine EINZELNE Zeile ist
     und dort kein Zeilenumbruch im Weg steht.
     UNVERAENDERT WIRD NICHT GESCHICKT: sonst schoebe jedes Anklicken den
     Eintrag ueber updated_at in jeder Uebersicht nach oben.
     UND DANACH SCHLIESST SICH DAS FELD, in jedem Ausgang: die Aussage tritt
     wieder an seine Stelle. Auch nach einer Absage -- der Text steht dann
     wieder da, wie er in der Zeile steht, und die Meldung sagt, warum. */
  {
    const feld = document.getElementById('rej-grund');
    const speichere = async () => {
      const v = feld.value.trim();
      if (v !== (item.rejected_grund || '')) {
        try { item = await api('PUT', `/api/items/${id}`, { rejectedGrund: v }); toast('Gespeichert'); }
        catch (e) { toast(e.message, true); feld.value = item.rejected_grund || ''; }
      }
      grundOffen = false;
      drawSwitches();
    };
    feld.onblur = speichere;
    /* ESCAPE SETZT DAS FELD ZURUECK, BEVOR ES SCHLIESST -- und die Reihenfolge
       ist der ganze Punkt: das Schliessen nimmt dem Feld den Zeiger, das
       loest onblur aus, und speichere() vergliche sonst den getippten Text
       mit dem gespeicherten und schriebe genau das weg, was gerade verworfen
       werden sollte. */
    feld.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); feld.blur(); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        feld.value = item.rejected_grund || '';
        grundOffen = false;
        drawAblehnung();
      }
    });
  }
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
    /* DER KASTEN IST DAS RASTER, nicht die einzelne Zeile: eine Spalte kann
       sich nur dann an ihrer breitesten Zelle ausrichten, wenn alle Zellen im
       SELBEN Raster liegen. Die Klasse steht hier und nicht im Aufbau
       darueber, damit sie neben dem Kasten steht, den sie meint.
       UND DIE SPALTENZAHL FOLGT DEM ZUSTAND: bei genau einem Zugang gibt es
       die Durchschnittszelle nicht, also hat das Raster auch nur zwei
       Spalten. Beide Entscheidungen haengen an DERSELBEN Bedingung -- sie
       steht einmal hier und wird unten wiederverwendet, statt ein zweites Mal
       gefragt zu werden (Stolperstein 47). Mit drei Spalten und zwei Zellen
       ruecken die Zeilen gegeneinander, und die Liste zerfaellt. */
    const mitSchnitt = mehrereBenutzer();
    box.className = 'rlist' + (mitSchnitt ? '' : ' ohne-schnitt');
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
    /* DIE KOPFZAHL IST SEIT 0.16.0 EIN KNOPF, und er fuehrt zur eigenen
       Rechnung dieses Eintrags. „⌀ 4,2 gewichtet" war zwar richtig, hat sich
       aber nirgends erklaert -- auch nicht in der Karte, in der die Gewichte
       eingestellt werden.
       DER GANZE AUSDRUCK IST DER KNOPF, nicht nur das Wort „gewichtet". Sonst
       gaebe es die Erklaerung ausgerechnet dort nicht, wo alle Gewichte 1 sind
       -- und die zwei Schritte hinter dem ⌀ (erst je Kriterium, dann darueber)
       sind auch ohne Gewichte nicht selbstverstaendlich.
       OHNE ZAHL KEIN KNOPF: an einem Eintrag ohne Bewertung gaebe es nichts zu
       erklaeren, und ein Knopf, der ein leeres Fenster oeffnet, ist einer zu
       viel. */
    if (kopf) {
      kopf.textContent = '';
      if (item.avgRating) {
        const b = document.createElement('button');
        b.className = 'link-btn gew-auf';
        b.id = 'gew-auf';
        b.textContent = '⌀ ' + item.avgRating.toFixed(1).replace('.', ',') +
          (gewichtetGerechnet ? ' gewichtet' : '');
        b.title = 'Wie diese Zahl zustande kommt';
        b.onclick = zeigeRechnung;
        kopf.appendChild(b);
      }
    }
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
      // Die Zahl der Bewerter steht dabei, sobald es ETWAS ZU UNTERSCHEIDEN
      // gibt: 4,8 aus zwei Stimmen heisst etwas anderes als 4,8 aus zwanzig.
      // BEI EINER EINZIGEN STIMME STEHT SIE NICHT DA -- die Eins beantwortet
      // keine Frage, die jemand hat. Bis 0.17.1 stand sie auch dort, und die
      // Begruendung lautete "4,8 aus einer Stimme heisst etwas anderes als 4,8
      // aus zwanzig". Das stimmt, sagt aber nichts darueber, ob die Zahl DORT
      // gebraucht wird: der Vergleich beginnt bei zwei.
      // Bei genau einem Zugang entfaellt die Spalte ganz. Hat niemand bewertet,
      // bleibt sie leer -- neben fuenf leeren Sternen waere "keine Bewertung"
      // dieselbe Aussage zweimal.
      row.append(n, acts);
      /* DIE DURCHSCHNITTSSPALTE IST EINE RASTERZELLE UND HAENGT DESHALB AN DER
         ZEILE, nicht in .racts. Nur so kann sich das Raster an der breitesten
         Zahl der ganzen Liste ausrichten -- steckte sie in .racts, waere sie
         wieder nur so breit wie ihr eigener Inhalt, und die Sterne stuenden
         Zeile fuer Zeile woanders.
         DIESELBE BEDINGUNG WIE OBEN AM RASTER, und zwar buchstaeblich
         dieselbe: `mitSchnitt` entscheidet ueber die Spalte UND ueber die
         Zelle. Zwei getrennte Abfragen waeren zwei Wahrheiten, und die eine
         liesse sich aendern, ohne dass die andere mitginge. */
      if (mitSchnitt) {
        const a = document.createElement('span');
        a.className = 'ravg';
        /* DIESELBE FORM WIE DIE KOPFZAHL DARUEBER, die bereits "⌀ 4,2
           gewichtet" schreibt: das ⌀ ist die Hausform, die Klammer sagt
           "so viele Stimmen". Der Mittelpunkt davor sagte weder das eine
           noch das andere -- er trennte nur zwei Zahlen, die verschiedene
           Dinge meinen.
           DER KLARTEXT GEHOERT DAZU: ein Symbol allein liest kein
           Vorleseprogramm vor, und "⌀ 4,2 (3)" bliebe fuer den, der es
           vorgelesen bekommt, eine Folge von Zeichen. */
        if (r.avg) {
          const stimmen = `${r.count} ${r.count === 1 ? 'Stimme' : 'Stimmen'}`;
          const schnitt = r.avg.toFixed(1).replace('.', ',');
          /* DIE KLAMMER ERST AB ZWEI. Sie sagt "so viele Stimmen" und
             beantwortet damit die Frage, wie schwer der Schnitt wiegt -- bei
             einer einzigen gibt es diese Frage nicht.
             DER TITEL BLEIBT VOLLSTAENDIG: wer die Zahl doch braucht, bekommt
             sie beim Ueberfahren und ueber das Vorleseprogramm. Was hier
             wegfaellt, ist die Zahl auf dem Bildschirm und nicht die Auskunft. */
          a.textContent = r.count > 1 ? `⌀ ${schnitt} (${r.count})` : `⌀ ${schnitt}`;
          a.title = `Durchschnitt ${schnitt} aus ${stimmen}`;
        } else a.textContent = '';
        row.append(a);
      }
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
  /* ---- Die eigene Rechnung hinter der Kopfzahl -- 0.16.0 ----
     DER KASTEN LIEST DIE VORHANDENE RECHNUNG, ER RECHNET NICHT NACH. Zaehler,
     Nenner und das ungerundete Ergebnis kommen aus `rechenweg`, und der
     entsteht im Server IN gesamtSchnitt() -- also in derselben Schleife, die
     die Zahl erzeugt. Ein zweiter Rechenweg fuer die Anzeige waere genau die
     zweite Wahrheit, die diese Instanz nirgends duldet: die beiden liefen
     frueher oder spaeter auseinander, und zwar unbemerkt.
     KEIN ALLGEMEINES BEISPIEL, SONDERN DIESER EINTRAG. Ein erfundenes
     Rechenbeispiel liest niemand zweimal; die eigene Rechnung schon.
     DIE NAMEN KOMMEN AUS `ratings` UND NICHT AUS DEM RECHENWEG: der traegt
     Nummern, Werte und Gewichte. Zwei Quellen fuer denselben Namen waeren zwei
     Wahrheiten -- dieselbe Ueberlegung wie bei „Wer hat bewertet". */
  const gewZahl = (n) => {
    const z = Math.round(Number(n) * 100) / 100;
    return (Number.isFinite(z) ? z : 0).toString().replace('.', ',');
  };

  function zeigeRechnung() {
    const weg = item.rechenweg;
    // Ohne Aufstellung kein Kasten. Sie fehlt nur, wenn nichts bewertet ist --
    // dann steht aber auch keine Kopfzahl da, an der man klicken koennte.
    if (!weg || !Array.isArray(weg.zeilen) || !weg.zeilen.length)
      return toast('Für diesen Eintrag gibt es noch keine Rechnung.', true);
    const namen = new Map(item.ratings.map(r => [r.criterion_id, r.name]));
    const mitGewicht = weg.zeilen.some(z => Number(z.gewicht) !== 1);
    /* OB DIE GEWICHTUNG UEBERHAUPT ETWAS AENDERT. Verglichen werden die beiden
       ANGEZEIGTEN Zahlen und nicht die ungerundeten: der Kasten sagt etwas
       ueber das, was dasteht. Zwei Rechnungen, die sich erst in der dritten
       Stelle unterscheiden, ergeben am Bildschirm dieselbe Zahl -- und dann
       ist „hier steht 3,7 statt 3,7" keine Auskunft. */
    const gleicheZahl = Number(weg.gleichErgebnis) === Number(weg.ergebnis);
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal rechnung-modal" id="rechnung-modal">
      <h2>Wie ⌀ ${esc(gewZahl(weg.ergebnis))} zustande kommt</h2>
      ${/* DER VERWEIS ZEIGT IN DEN KASTEN UND NICHT AUS IHM HINAUS. Hier stand
           bis 0.17.0 „die Zahlen rechts in den Zeilen" -- gemeint war die
           Durchschnittsspalte der Kriterienliste dahinter, und die gibt es bei
           genau EINEM Zugang gar nicht. Derselbe blinde Fleck wie in Punkt 1
           dieser Runde, eine Ansicht weiter: ein Satz zeigte auf eine Spalte,
           die nicht in jeder Lage dasteht.
           DIE SPALTE „NOTE" STEHT DAGEGEN IMMER DA -- sie gehoert dem Kasten
           selbst, gleich unter diesem Satz. Ein Verweis auf das, was der Kasten
           mitbringt, braucht keine Bedingung; eine Bedingung waere eine zweite
           Wahrheit ueber die Zahl der Zugaenge (Stolperstein 47). */''}
      <p>Die Zahl entsteht in <strong>zwei Schritten</strong>. Zuerst wird je Kriterium der
        Schnitt über alle Bewertungen gebildet — das sind die Zahlen in der Spalte
        <strong>Note</strong>.
        Dann wird über diese Schnitte gemittelt${mitGewicht
          ? ', und zwar <strong>gewichtet</strong>: jeder Schnitt zählt mit dem Gewicht seines Kriteriums'
          : '. Alle Gewichte stehen hier auf 1, also zählt jedes Kriterium gleich'}.</p>
      <div class="rechnung" id="rechnung">
        <div class="rz rz-kopf"><span>Kriterium</span><span>Note</span><span>Gewicht</span><span>Produkt</span></div>
        ${weg.zeilen.map(z => `<div class="rz" data-krit="${Number(z.criterionId)}">
          <span class="rz-name">${esc(namen.get(z.criterionId) || '—')}</span>
          <span>${esc(gewZahl(z.schnitt))}</span>
          <span>× ${esc(gewZahl(z.gewicht))}</span>
          <span>${esc(gewZahl(z.produkt))}</span></div>`).join('')}
        <div class="rz rz-summe"><span>Summe der Produkte</span><span></span><span></span>
          <span id="rz-summe">${esc(gewZahl(weg.summe))}</span></div>
        <div class="rz rz-summe"><span>Teiler — Summe der Gewichte</span><span></span><span></span>
          <span id="rz-teiler">${esc(gewZahl(weg.teiler))}</span></div>
        <div class="rz rz-ergebnis"><span>Ergebnis</span><span></span><span></span>
          <span id="rz-ergebnis">⌀ ${esc(gewZahl(weg.ergebnis))}</span></div>
        ${/* DIE VERGLEICHSZAHL -- 0.17.0. Die Formel stand Zeile fuer Zeile da
             und liess trotzdem offen, WOFUER die Gewichte gut sind. Erst der
             Unterschied macht die Gewichtung sichtbar.
             OHNE GEWICHTUNG STEHT SIE GAR NICHT DA: sind alle Gewichte 1, ist
             sie dieselbe Zahl wie darueber, und zweimal dasselbe hinzuschreiben
             ist keine Auskunft.
             VIER ZELLEN WIE JEDE ANDERE ZEILE. Das Raster hat vier Spalten;
             eine Zeile mit dreien schoebe alles darunter um eine weiter --
             genau der Fehler, den Punkt 1 derselben Runde behebt.
             UND SIE WIRD GELESEN, NICHT GERECHNET (Stolperstein 217): sie
             entsteht in gesamtSchnitt(), in derselben Schleife wie die Zahl
             darueber. */''}
        ${mitGewicht ? `<div class="rz rz-gleich"><span>Ohne Gewichte — jedes Kriterium gleich</span>
          <span></span><span></span>
          <span id="rz-gleich">⌀ ${esc(gewZahl(weg.gleichErgebnis))}</span></div>` : ''}
      </div>
      ${/* ZWEI ABSAETZE UNTER DER TABELLE UND NICHT DREI -- 0.17.3. Bei sieben
           Kriterien lief der Kasten ueber `88dvh` hinaus und rollte.
           WAS WIRKLICH DOPPELT DASTAND, WAR GENAU EINE ANGABE: die
           ausgeschriebene Rechnung „Summe ÷ Teiler = Ergebnis". Sie steht als
           Summe, Teiler und Ergebnis schon in der Tabelle darueber, und die
           Zwischenzahl vor dem Runden trug nichts, was der Satz nicht auch so
           sagt. Alles andere trug etwas, das in der Tabelle NICHT steht, und
           ist deshalb geblieben.
           WEGGEFALLEN IST AUSSERDEM DIE BEGRUENDUNG ZUM TEILER -- „sonst zoege
           es die Zahl nach unten": WARUM es so gebaut ist, steht im
           Projektstand und nicht in einem Kasten, den man beim Lesen einer Note
           oeffnet.
           DER TEILER BLEIBT DER PUNKT, AN DEM SICH DIE MEISTEN VERRECHNEN, und
           steht deshalb vorn. Die Rundung steht daneben und nicht in einem
           eigenen Absatz: beides sagt, wie aus den Zeilen darueber EINE Zahl
           wird. */''}
      <p>Der <strong>Teiler zählt nur die Kriterien, die auch bewertet sind</strong>. Ein
        Kriterium, an dem niemand Sterne vergeben hat, geht gar nicht ein.
        <strong>Gerundet wird genau einmal</strong>, ganz am Ende — die Zahlen oben sind für
        die Anzeige auf zwei Stellen gekürzt, gerechnet wird ungekürzt.
        Die Gewichte stellt der Admin im Systembereich unter <strong>Bewertungskriterien</strong> ein.</p>
      ${/* WAS DIE GEWICHTUNG AENDERT, IN EINEM SATZ. Sind beide Zahlen gleich,
           steht genau das da -- zweimal dieselbe Zahl hinzuschreiben waere
           eine Auskunft ueber nichts.
           DIESER ABSATZ IST DER PUNKT DES GANZEN KASTENS und deshalb der
           einzige, an dem 0.17.3 kein Wort geaendert hat. */''}
      ${mitGewicht ? (gleicheZahl
        ? `<p id="rz-gleich-satz"><strong>An dieser Zahl ändert die Gewichtung nichts.</strong>
            Zählte jedes Kriterium gleich, käme dieselbe
            <strong>⌀ ${esc(gewZahl(weg.ergebnis))}</strong> heraus — die Gewichte wirken,
            das Ergebnis fällt nach dem Runden trotzdem gleich aus.</p>`
        : `<p id="rz-gleich-satz">Zählte jedes Kriterium <strong>gleich</strong>, stünde hier
            <strong>⌀ ${esc(gewZahl(weg.gleichErgebnis))}</strong> statt
            <strong>⌀ ${esc(gewZahl(weg.ergebnis))}</strong>.
            <strong>Das ist der Unterschied, den die Gewichtung macht.</strong></p>`) : ''}
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Schließen</button></div></div>`;
    document.body.appendChild(bd);
    const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
    /* Escape schliesst nur den OBERSTEN Dialog -- dieselbe Regel wie bei
       „Wer hat bewertet" und den Grabsteinen. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
  }

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
      /* IN DER LINKLISTE WIRD DIE ADRESSE HERVORGEHOBEN UND NICHT DER
         ANZEIGENAME -- 0.18.0. Gesucht wurde in `links.url`; ein
         hervorgehobener Anbietername, in dem der Begriff gar nicht steht,
         waere eine Falschaussage. Hervorgehoben werden deshalb `.dom` und
         `.path` -- die beiden Stuecke, in die splitUrl() die Adresse zerlegt
         -- und ausdruecklich nicht `.snamen`.
         Bei einer Suchzeile steht oben der Rohtext, und der IST hier die
         Adresse: gesucht hat SQLite in derselben Spalte. */
      hebeImKnoten(row.querySelector('.dom'), oben, begriff);
      if (!suche && path) hebeImKnoten(row.querySelector('.path'), path, begriff);

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
         braucht es kein Feld in der Antwort: DELETE /api/comment-images/:id
         steht hinter darfAendern, und hochgezaehlt wird nur, wenn ein ANDERER
         als der Verfasser entfernt. Wer beide Klemmen passiert, kann nur der
         Admin sein. Kein Name, kein Zeitpunkt, keine Kette.
         Der Satz ist nur so lange wahr, wie die Klemme dort steht -- eine
         Pruefung am Quelltext bindet die Beschriftung an sie. */
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

      /* Der Text kommt nicht aus der Vorlage, sondern als echte Knoten -- so
         kann hier gar kein Markup entstehen. Der Bearbeitenmodus weiter unten
         zeigt weiterhin den Rohtext im Textfeld.
         DIE HERVORHEBUNG GEHT DENSELBEN WEG -- 0.18.0. Sie ist ein drittes
         Stueck der Zerlegung und kein Nachbearbeiten des Ergebnisses: aus
         `<mark>` wird hier ein Element mit textContent und niemals ein
         String. Ohne Begriff aendert sich an dieser Zeile nichts. */
      el.querySelector('.cmt-body')
        .appendChild(baueKommentarknoten(zerlegeKommentartext(c.text, begriff)));

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

  /* Der Sprung ans Schreibfeld. ZUERST AUFKLAPPEN, DANN SPRINGEN: ein
     eingeklappter Block stellt seine Kinder auf display: none, und ein Sprung
     auf ein unsichtbares Feld landete irgendwo. Der Zustand geht denselben Weg
     wie beim Klick auf die Kopfzeile -- gespeichert und neu ausgeruestet, nicht
     an der Klasse vorbei umgeschaltet.
     scrollIntoView VOR focus(): focus() rollt von sich aus hart an den Rand,
     die weiche Bewegung davor gibt dem Feld seinen Platz in der Mitte. */
  document.getElementById('cjump').onclick = () => {
    if (BLOECKE.zu.includes('kommentare')) {
      BLOECKE.zu = BLOECKE.zu.filter(k => k !== 'kommentare');
      speichereBloecke();
      ruesteBloeckeAus(item);
    }
    const feld = document.getElementById('ctext');
    if (!feld) return;
    feld.scrollIntoView({ behavior: 'smooth', block: 'center' });
    feld.focus({ preventScroll: true });
  };
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
      `zurückholen kann es der Eigentümer dieser Installation.`);

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

/* ================= Der Systembereich =================
   ACHTZEHN KARTEN IN FUENF ABSCHNITTEN, JEDER MIT EIGENER ADRESSE.

   BIS 0.15.1 STANDEN ALLE KARTEN IN EINER REIHE, und renderSystem() war mit
   2.466 Zeilen die laengste Funktion der Instanz. Beides hing zusammen: eine
   Seite ohne Abschnitte braucht keine Aufteilung im Quelltext, und eine
   Funktion, die alles zeichnet, laesst sich nicht abschnittsweise rufen.

   DIE AUFTEILUNG STEHT DESHALB ALS TABELLE UND NICHT ALS VERZWEIGUNG. Je
   Karte eine Zeile: wohin sie gehoert, woran sie haengt, wie sie aussieht,
   was sie ausruestet. Damit ist die Zuordnung ABLESBAR -- und der Pruefstand
   kann sie nachzaehlen, statt sie im Markup zu suchen.

   DIE KLEMME IST EIN FELD UND KEINE KLAMMER. Vorher stand vor jeder Karte ein
   `${ADMIN ? ...}` im Markup; jetzt steht sie in `sichtbar`. Das ist derselbe
   Wert an einer Stelle, an der man ihn ansehen kann: kein Zugang bekommt
   danach eine Karte, die ihm vorher verwehrt war, und keiner verliert eine.

   EINE KARTE, DIE NICHT GEZEICHNET WIRD, BEKOMMT AUCH KEINEN BEHANDLER --
   `ausruesten` laeuft nur fuer die Karten, die wirklich dastehen. Das ist
   nicht Sparsamkeit, sondern die Bedingung: die Behandler greifen mit
   getElementById auf ihre Felder zu, und ein Griff ins Leere risse den ganzen
   Systembereich mit (Stolperstein 211). Vorher hing dieselbe Frage an EINER
   Klammer (`amElement`); jetzt haengt sie an der Tabelle. */

/* DIE FUENF ABSCHNITTE, IN DER REIHENFOLGE DER RECHTELEITER: was jedem
   gehoert, steht vorn; was nur der Eigentuemer sieht, steht hinten.
   "Installation" traegt heute genau eine Karte. Das ist kein Versehen: der
   oeffentliche Titel ist die einzige Einstellung, die die INSTALLATION als
   Ganzes nach aussen beschreibt, und sie gehoert weder zum Bestand noch zu den
   Zugaengen. Ein Abschnitt mit einer Karte ist ehrlicher als eine Karte am
   falschen Platz.
   ER HEISST SEIT 0.19.1 "Installation" und hiess bis 0.17.0 "Anlage", bis
   0.19.1 "Instanz". EINWORTIG WIE SEINE VIER NACHBARN -- "Kriterion Installation" stuende quer in der Reihe, zumal
   ueberall daneben schon Kriterion draufsteht. Und NICHT "von Kriterion",
   weil `title_app` einstellbar ist: wer seinen Bestand "Produktliste" nennt,
   laese sonst eine Meldung ueber "Kriterion" und muesste erst ueberlegen, was
   gemeint ist. */
const SYS_ABSCHNITTE = [
  { schluessel: 'persoenlich',  name: 'Persönlich' },
  { schluessel: 'bestand',      name: 'Bestand' },
  { schluessel: 'zugaenge',     name: 'Zugänge' },
  { schluessel: 'datenbank',    name: 'Datenbank' },
  { schluessel: 'installation', name: 'Installation' }
];

/* DIE ADRESSE IST DIE EINE WAHRHEIT UEBER DEN OFFENEN ABSCHNITT. Kein
   gemerkter Zustand daneben: ein zweiter Merker waere eine zweite Wahrheit,
   und beim naechsten Aufruf staende die Frage, welche gilt.
   `#/system` OHNE ABSCHNITT BLEIBT GUELTIG -- es ist die Adresse, die der
   Knopf in der Kopfzeile setzt und die in aelteren Papieren steht. Sie loest
   sich auf den ersten sichtbaren Abschnitt auf. */
const SYS_MUSTER = /^#\/system(?:\/([a-z]+))?$/;
const sysAdresse = (schluessel) => `#/system/${schluessel}`;

/* DIE UEBERSETZUNG ALTER ABSCHNITTSADRESSEN IST IN 0.19.2 ABGEBAUT WORDEN,
   und der Grund ist eine Entscheidung des Betreibers und keine Nachlaessigkeit.

   WAS HIER STAND: eine Tafel `SYS_ALTE_ABSCHNITTE`, die `#/system/anlage`
   (bis 0.17.0) und `#/system/instanz` (bis 0.19.1) still auf `installation`
   uebersetzte -- damit ein Lesezeichen oder ein Link aus einer Mail nicht ins
   Leere fuehrt.

   WARUM SIE WEG IST: dieser Fall tritt hier nicht ein. Die Anlage hat EINEN
   Zugang; es gibt keine fremden Lesezeichen und keine verschickten Links auf
   einen Abschnitt des Systembereichs. **Eine Tafel, die einen Fall abfaengt,
   den es nicht gibt, ist Aufwand ohne Gegenwert** -- sie will gepflegt,
   geprueft und bei jeder weiteren Umbenennung nachgezogen werden.

   WAS STATTDESSEN GESCHIEHT: eine unbekannte Adresse faellt auf den ersten
   sichtbaren Abschnitt zurueck -- derselbe Weg, den `#/system/scheune` schon
   immer nimmt. Kein Fehler, keine leere Seite, nur ein anderer Ort.

   WER SIE WIEDER BRAUCHT, BRAUCHT SIE ALS TAFEL UND NICHT ALS VERZWEIGUNG:
   `{ alt: 'neu', … }`, einmal nachgeschlagen und nicht verkettet. Der Satz
   steht hier, weil das die Falle war, die 0.19.1 beinahe gestellt haette --
   `{ anlage: 'instanz', instanz: 'installation' }` haette den aeltesten Link
   auf einen Schluessel geschickt, den es nicht mehr gibt. */

/* Was eine Karte nicht zeigt, bekommt auch keinen Behandler. EIN Ort fuer die
   Frage nach einem fehlenden Element: stuende vor jedem Behandler dieselbe
   Klammer, risse die erste vergessene den ganzen Systembereich mit -- und
   zwar wortlos, weil der Fehler nach dem Setzen von app.innerHTML kaeme. */
const amElement = (id, tu) => { const el = document.getElementById(id); if (el) tu(el); };


/* ---- DIE NEUNZEHN KARTEN ----
   `sichtbar` ist die Klemme, `markup` das Aussehen, `ausruesten` die
   Behandler. Eine Karte ohne Behandler laesst `ausruesten` weg, und eine leere
   Funktion daneben waere eine Zeile, die behauptet, es gaebe dort etwas zu tun.
   "Kennzahlen" ist wieder die einzige ohne: sie zeigt nur Zahlen.
   NEUNZEHN SEIT 0.19.1, vorher achtzehn. Die Bildablage hat "Kennzahlen"
   verlassen und eine eigene bekommen -- nicht, weil etwas dazugekommen waere,
   sondern weil die Karte darunter zu gross geworden war. 0.19.0 hat sie
   ausdruecklich HINEINgesetzt und "es bleibt bei achtzehn Karten" dazu
   geschrieben; das war fuer zwei Zeilen und einen Schalter richtig und ist es
   fuer fuenf Formatzeilen, einen Schalter mit Erlaeuterung, einen Knopf, eine
   Fortschrittszeile und eine Meldung nicht mehr. */
const SYS_KARTEN = [
  { schluessel: 'zugang',       abschnitt: 'persoenlich', sichtbar: () => true,
    markup: karteZugang,       ausruesten: ruesteZugangAus },
  { schluessel: 'sitzungen',    abschnitt: 'persoenlich', sichtbar: () => true,
    markup: karteSitzungen,    ausruesten: ruesteSitzungenAus },
  { schluessel: 'darstellung',  abschnitt: 'persoenlich', sichtbar: () => true,
    markup: karteDarstellung,  ausruesten: ruesteDarstellungAus },

  { schluessel: 'kategorien',   abschnitt: 'bestand', sichtbar: () => true,
    markup: karteKategorien,   ausruesten: ruesteKategorienAus },
  { schluessel: 'tags',         abschnitt: 'bestand', sichtbar: () => true,
    markup: karteTags,         ausruesten: ruesteTagsAus },
  { schluessel: 'kriterien',    abschnitt: 'bestand', sichtbar: () => true,
    markup: karteKriterien,    ausruesten: ruesteKriterienAus },
  { schluessel: 'vokabular',    abschnitt: 'bestand', sichtbar: () => ADMIN,
    markup: karteVokabular,    ausruesten: ruesteVokabularAus },
  { schluessel: 'links',        abschnitt: 'bestand', sichtbar: () => true,
    markup: karteLinks,        ausruesten: ruesteLinksAus },
  { schluessel: 'suchanbieter', abschnitt: 'bestand', sichtbar: () => ADMIN,
    markup: karteSuchanbieter, ausruesten: ruesteSuchanbieterAus },
  { schluessel: 'papierkorb',   abschnitt: 'bestand', sichtbar: () => ADMIN,
    markup: kartePapierkorb,   ausruesten: ruestePapierkorbAus },

  { schluessel: 'zugaenge',     abschnitt: 'zugaenge', sichtbar: () => ADMIN,
    markup: karteZugaenge,     ausruesten: ruesteZugaengeAus },
  { schluessel: 'anfragen',     abschnitt: 'zugaenge', sichtbar: (g) => ADMIN && !!g.anfragen,
    markup: karteAnfragen,     ausruesten: ruesteAnfragenAus },
  { schluessel: 'protokoll',    abschnitt: 'zugaenge', sichtbar: (g) => EIGENTUEMER && !!g.protokoll,
    markup: karteProtokoll,    ausruesten: ruesteProtokollAus },
  { schluessel: 'mailversand',  abschnitt: 'zugaenge', sichtbar: (g) => EIGENTUEMER && !!g.mailstand,
    markup: karteMailversand,  ausruesten: ruesteMailversandAus },

  { schluessel: 'kennzahlen',   abschnitt: 'datenbank', sichtbar: () => ADMIN,
    markup: karteKennzahlen },
  { schluessel: 'bildablage',   abschnitt: 'datenbank', sichtbar: () => ADMIN,
    markup: karteBildablage,   ausruesten: ruesteBildablageAus },
  { schluessel: 'sicherung',    abschnitt: 'datenbank', sichtbar: () => EIGENTUEMER,
    markup: karteSicherung,    ausruesten: ruesteSicherungAus },
  { schluessel: 'export',       abschnitt: 'datenbank', sichtbar: () => EIGENTUEMER,
    markup: karteExport,       ausruesten: ruesteExportAus },

  { schluessel: 'titel',        abschnitt: 'installation', sichtbar: () => ADMIN,
    markup: karteTitel,        ausruesten: ruesteTitelAus }
];

/* WELCHE ABSCHNITTE FUER DIESEN ZUGANG ETWAS ZU ZEIGEN HABEN. Ein Abschnitt
   ohne sichtbare Karte erscheint gar nicht -- ein leerer Reiter waere
   schlechter als keiner: er verspricht etwas und haelt es nie.
   ZWEI BLEIBEN IMMER: "Persoenlich" und "Bestand" tragen Karten ohne Klemme.
   Die Liste kann deshalb nicht leer werden, und der Rueckfall unten greift
   nie ins Leere. */
function sysSichtbareAbschnitte(geholt) {
  return SYS_ABSCHNITTE.filter(a =>
    SYS_KARTEN.some(k => k.abschnitt === a.schluessel && k.sichtbar(geholt)));
}


async function renderSystem() {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">lädt …</p></div>`;
  const geholt = {};
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
       ALLE UEBRIGEN GEHEN DENSELBEN WEG: jeder Abruf liegt hinter der Rolle,
       hinter der auch seine Karte steht -- Papierkorb beim Admin, Sicherung,
       Sicherheitsprotokoll und Mailversand beim Eigentuemer, Anmeldungen und
       Zugang bei jedem, die Selbstanmeldung beim Admin. Und alle werden HIER
       geholt und nicht spaeter nachgeladen: ein Nachladen liefe als herrenlose
       Zusage weiter, auch wenn das Fenster laengst zu ist (Stolperstein 118).
       Es sind elf Abrufe. */
    [geholt.stats, geholt.titles, geholt.cats, geholt.tags, geholt.crits, geholt.zugang,
     geholt.papierkorb, geholt.sicherung, geholt.sitzungen, geholt.protokoll,
     geholt.mailstand, geholt.anfragen] = await Promise.all([
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
  if (geholt.papierkorb && geholt.papierkorb.tage) PAPIERKORB_TAGE = geholt.papierkorb.tage;

  /* WELCHER ABSCHNITT OFFEN IST, ENTSCHEIDET DIE ADRESSE -- und wenn die auf
     einen zeigt, den es fuer diesen Zugang nicht gibt, faellt sie auf den
     ersten sichtbaren zurueck. Ins Leere zeigen darf sie nicht: wer den Link
     eines Admins bekommt und ihn als gewoehnlicher Benutzer oeffnet, saehe
     sonst eine leere Seite. */
  const sichtbare = sysSichtbareAbschnitte(geholt);
  const ausDerAdresse = (SYS_MUSTER.exec(location.hash || '') || [])[1] || '';
  const gewuenscht = ausDerAdresse;
  const offen = sichtbare.find(a => a.schluessel === gewuenscht) || sichtbare[0];
  const karten = SYS_KARTEN.filter(k => k.abschnitt === offen.schluessel && k.sichtbar(geholt));

  app.innerHTML = `<div class="shell">
    <a href="#/" class="back">← Zurück zur Übersicht</a>
    <h1 class="page-title">System</h1>
    <p class="hint" style="margin:0 0 16px">Alles, was den Bestand als Ganzes betrifft.</p>
    ${/* EIN MARKUP, ZWEI GESTALTEN -- dieselbe Bauform wie das Menue der
         Kopfzeile aus 0.12.0. Auf dem breiten Schirm eine Reihe Reiter, auf
         dem Telefon eine Liste, die in den Abschnitt hinein fuehrt. Kein
         Verschieben von Knoten, keine Weiche nach Geraet.
         ES SIND LINKS UND KEINE KNOEPFE. Ein Reiter, der eine Adresse hat,
         laesst sich kopieren, in einem neuen Fenster oeffnen und mit der
         Zurueck-Taste verlassen -- ein Knopf koennte davon nichts. */''}
    <nav class="sys-reiter" aria-label="Abschnitte des Systembereichs">
      ${sichtbare.map(a => `<a class="sys-reiter-k${a === offen ? ' on' : ''}"
        href="${sysAdresse(a.schluessel)}" data-abschnitt="${esc(a.schluessel)}"${
        a === offen ? ' aria-current="page"' : ''}>${esc(a.name)}</a>`).join('')}
    </nav>
    <div class="sys-grid">
      ${karten.map(k => k.markup(geholt)).join('\n')}
    </div></div>`;

  for (const k of karten) if (k.ausruesten) k.ausruesten(geholt);

  /* DIE ADRESSE WIRD NACHGEZOGEN, NICHT DIE ANSICHT VERBOGEN. Stuende in der
     Adresse weiter "datenbank", waehrend "Persoenlich" dasteht, gaebe es zwei
     Aussagen ueber denselben Zustand -- und die kopierte Adresse fuehrte den
     naechsten wieder woandershin.
     replaceState UND NICHT location.hash: ein neuer Eintrag im Verlauf machte
     die Zurueck-Taste unbrauchbar (zurueck fuehrte auf dieselbe Seite), und
     ein gesetzter Hash loeste ein zweites Zeichnen aus. replaceState loest
     kein hashchange aus -- genau deshalb steht es hier. */
  if (location.hash !== sysAdresse(offen.schluessel) &&
      typeof history !== 'undefined' && typeof history.replaceState === 'function')
    history.replaceState(null, '', sysAdresse(offen.schluessel));
}


/* ---- Karte „Titel" — Abschnitt „Installation" ---- */
function karteTitel(geholt) {
  const { titles } = geholt;
  return `<div class="sys-card">
        <h3>Titel</h3>
        <p class="desc">Der <strong>öffentliche Titel</strong> steht auf der Anmeldeseite und ist für
          jeden sichtbar, der die Adresse aufruft. Der <strong>interne Titel</strong> erscheint erst
          nach der Anmeldung — hier gehört die aussagekräftige Bezeichnung hin.</p>
        <div class="field"><label>Titel vor der Anmeldung</label>
          <input class="input" id="tp" value="${esc(titles.publicTitle)}"></div>
        <div class="field"><label>Titel nach der Anmeldung</label>
          <input class="input" id="ta2" value="${esc(titles.appTitle)}"></div>
        <button class="btn btn-accent btn-sm" id="tsave">Titel speichern</button>
      </div>`;
}
function ruesteTitelAus() {
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
}


/* ---- Karte „Zugang" — Abschnitt „Persönlich" ---- */
/* ZWEI KLEMMEN, UND BEIDE SITZEN HIER -- an derselben Stelle wie die Karte
   selbst und nicht an einer zweiten Abfrage daneben (Stolperstein 47).
   ERSTENS DIE SELBSTANMELDUNG. Ist sie an, ist die Adresse keine
   Bequemlichkeit mehr: ohne sie kommt keine Bestätigungsmail an. Der Satz
   RICHTET SICH DANACH, WAS GERADE GILT, statt eine Lage zu behaupten.
   Gelesen wird `REGISTRIERUNG` -- derselbe Merker, aus dem die Anmeldeseite
   ihr Formular baut. Ein zweiter Abruf daneben wäre eine zweite Wahrheit, und
   die läuft auseinander, sobald jemand den Schalter umlegt.
   ZWEITENS DIE ROLLE. Der Befehl auf dem Wirt steht nur beim Eigentümer: er
   ist der Einzige, der in der Regel auch am Server sitzt. Wer dort nicht
   hinkommt, dem nützt der Befehl nichts — er ist für ihn eine Auskunft über
   den Betrieb und kein Weg. Für ihn steht dort der Satz, der wirklich hilft.
   WAS HILFT DEM, DER DAVORSTEHT — und was erzählt ihm nur, wie es gebaut ist?
   Eine Oberfläche sagt, WAS IST (Projektstand 5.6). */
function karteZugang(geholt) {
  const { zugang } = geholt;
  return `<div class="sys-card">
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
        <div class="field"><label>E-Mail-Adresse <span class="hint">${
          REGISTRIERUNG ? '(wird gebraucht)' : '(freiwillig)'}</span></label>
          <input class="input" id="acc-mail" type="email" autocomplete="email"
            autocapitalize="off" spellcheck="false" value="${esc(zugang.email || '')}"
            placeholder="noch keine hinterlegt"></div>
        <div class="field"><label>Bisheriges Passwort</label>
          <input class="input" id="acc-old" type="password" autocomplete="current-password"></div>
        ${/* DIE VORGABE STEHT AM FELD, FÜR DAS SIE GILT. „Mindestens 10
              Zeichen“ stand bis 0.17.0 im Absatz unter der ADRESSE — dort
              gehört sie nicht hin, und wer sie dort las, hielt sie für eine
              Vorgabe an die Adresse. */''}
        <div class="field"><label>Neues Passwort
          <span class="hint">(mindestens ${MIN_PASSWORT} Zeichen)</span></label>
          <input class="input" id="acc-new" type="password" autocomplete="new-password"></div>
        <div class="field"><label>Neues Passwort wiederholen</label>
          <input class="input" id="acc-new2" type="password" autocomplete="new-password"></div>
        <p class="desc" style="margin:0 0 10px">${REGISTRIERUNG
          ? `<strong>Die Adresse wird gebraucht</strong>, solange die Selbstanmeldung an ist:
             ohne sie kommt keine Bestätigungsmail an. Sie trägt außerdem den Einladungs- oder
             Rücksetzlink und die Testmail im Mailversand.`
          : `Wird für den Einladungs- oder Rücksetzlink per Mail gebraucht und für die Testmail
             im Mailversand. <strong>Ohne sie steht der Link wie immer zum Kopieren bereit.</strong>`}
          Über die Oberfläche gibt es keine Wiederherstellung; ${EIGENTUEMER
            ? `vergessen heißt
               <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>
               auf dem Server.`
            : `wer sein Passwort vergessen hat, <strong>wendet sich an den Admin</strong>.`}</p>
        <button class="btn btn-accent btn-sm" id="acc-save">Zugang ändern</button>

        ${/* DER ZWEITE FAKTOR STEHT IN DIESER KARTE UND BEKOMMT KEINE EIGENE
              — es bleibt bei neunzehn. Hier stehen Name, Passwort
              und Adresse; wer seinen Zugang sichern will, sucht ihn dort, wo
              sein Zugang steht. Eine zwanzigste Karte fände nur, wer schon
              weiß, dass es sie gibt.
              DER ZUSTAND STEHT OHNE KLICK DA — „an seit …“ oder „aus“, dazu
              die Zahl der übrigen Wiederherstellungscodes. Er kommt aus
              GET /api/account, das diese Karte ohnehin holt; ein Knopf, den
              man erst drücken muss, um zu sehen, ob der Zugang gesichert ist,
              wäre keine Auskunft. */''}
        <div class="zf-block" id="zf-block"></div>
      </div>`;
}
function ruesteZugangAus(geholt) {
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
  zeichneZweifaktor(geholt.zugang.zweifaktor);
}

  /* --- Der zweite Faktor in der Karte „Zugang“ ---
     DIESELBE BAUFORM WIE zeichneAnfragen(): der Stand kommt vom Server, die
     Karte zeichnet sich nach jeder Handlung aus der ANTWORT der Handlung neu
     und fragt nicht ein zweites Mal nach. Ein Server, der auf ein Einschalten
     zwar „ok“ sagt, aber denselben Stand zurückgibt, fällt damit auf
     (Stolperstein 90).
     DER ANGEZEIGTE ZUSTAND KOMMT AUS DER ANTWORT UND WIRD HIER NIE GERATEN —
     „an“, der Zeitpunkt und die Zahl der übrigen Codes stehen alle im Feld
     `zweifaktor` von GET /api/account (Stolperstein 102). */
  function zeichneZweifaktor(stand) {
    const box = document.getElementById('zf-block');
    if (!box || !stand) return;
    box.innerHTML = stand.an ? `
      <div class="zf-zustand zf-an">
        <strong>Zweiter Faktor: an</strong> — seit ${esc(String(stand.seit || '').slice(0, 10))}.
        Beim Anmelden fragt die Installation zusätzlich nach dem Code des zweiten Faktors.
        <div class="zf-codestand">Wiederherstellungscodes:
          <strong>noch ${stand.codesOffen} von ${stand.codesGesamt}</strong>${stand.codesOffen <= 2
            ? ' — <strong>das wird knapp.</strong> Hol dir neue, solange du noch hereinkommst.' : ''}</div>
      </div>
      <div class="row-in" style="margin-top:10px">
        <button class="btn btn-sm" id="zf-neue">Neue Wiederherstellungscodes</button>
        <button class="btn btn-ghost btn-sm" id="zf-aus">Zweiten Faktor ausschalten</button>
      </div>` : `
      <div class="zf-zustand zf-aus"><strong>Zweiter Faktor: aus</strong> — zum Anmelden
        genügt dein Passwort.</div>
      <p class="desc" style="margin:8px 0 10px">Mit zweitem Faktor fragt diese Installation beim
        Anmelden zusätzlich nach einem sechsstelligen Code aus einer App auf deinem Telefon
        (Google Authenticator, Aegis, 1Password, iOS-Passwörter). Der Code entsteht
        <strong>ohne Netz</strong> und ist alle 30 Sekunden ein anderer.
        <strong>Freiwillig</strong> — und niemand außer dir kann ihn ein- oder ausschalten.</p>
      <button class="btn btn-sm" id="zf-an">Zweiten Faktor einschalten</button>`;

    /* Das Passwort wird an ALLEN Wegen verlangt, auch am Einschalten. Beim
       Ausschalten leuchtet das ein; beim EINSCHALTEN ist es der weniger
       offensichtliche und genauso wichtige Fall — eine übernommene offene
       Anmeldung könnte sonst einen zweiten Faktor auf ein FREMDES Telefon
       legen und dich damit aussperren. */
    const frag = (titel, was, mitCode) => bestaetigungsFeldFrei(titel, was, mitCode);

    amElement('zf-an', b => b.onclick = async () => {
      const e = await frag('Zweiten Faktor einschalten',
        'Zum Anfangen brauchst du dein bisheriges Passwort.', false);
      if (e === null) return;
      try { zeigeGeheimnis(await api('POST', '/api/zweifaktor/start', { passwort: e.passwort })); }
      catch (err) { toast(err.message, true); }
    });

    amElement('zf-neue', b => b.onclick = async () => {
      const e = await frag('Neue Wiederherstellungscodes',
        'Die bisherigen verfallen dabei alle — auch die noch unbenutzten.', true);
      if (e === null) return;
      try {
        const r = await api('POST', '/api/zweifaktor/codes', e);
        zeichneZweifaktor(r);
        zeigeWiederCodes(r.codes);
        toast('Neue Wiederherstellungscodes');
      } catch (err) { toast(err.message, true); }
    });

    amElement('zf-aus', b => b.onclick = async () => {
      const e = await frag('Zweiten Faktor ausschalten',
        'Danach genügt zum Anmelden wieder dein Passwort allein. Die Wiederherstellungscodes ' +
        'fallen mit weg.', true);
      if (e === null) return;
      try {
        zeichneZweifaktor(await api('DELETE', '/api/zweifaktor', e));
        ZWEIFAKTOR = false;
        toast('Zweiter Faktor ausgeschaltet');
      } catch (err) { toast(err.message, true); }
    });
  }

  /* Schritt eins am Bildschirm: der Schlüssel steht da, und zwar in
     VIERERGRUPPEN — zweiunddreißig Zeichen am Stück sind der Weg, an dem
     Menschen aufgeben. Daneben die `otpauth://`-Zeile als Link: auf einem
     Telefon öffnet der die App unmittelbar.
     DER SCHLÜSSEL IST DIE ZUSAGE, DER LINK IST DIE BEQUEMLICHKEIT. Deshalb
     steht der abtippbare Wert oben und groß, nicht der Link. */
  function zeigeGeheimnis(d) {
    const box = document.getElementById('zf-block');
    if (!box) return;
    box.innerHTML = `
      <div class="warn-box zf-einrichten">
        <strong>Schritt 1 — diesen Schlüssel in deine App eintragen.</strong>
        Er wird <strong>nur dieses eine Mal</strong> angezeigt; danach gibt ihn die Installation
        nie wieder heraus, auch dir nicht.
        <div class="zf-schluessel" id="zf-geheim">${esc(d.gruppen)}</div>
        <div class="row-in" style="margin:8px 0 0">
          <button class="btn btn-sm" id="zf-kopie">Schlüssel kopieren</button>
          <a class="btn btn-sm" id="zf-zeile" href="${esc(d.zeile)}">In der App öffnen</a>
        </div>
        <p class="desc" style="margin:10px 0 0">Am Telefon führt der Knopf rechts unmittelbar
          in die App. Am Rechner trägst du den Schlüssel von Hand ein — die Leerzeichen
          gehören nicht dazu.</p>
      </div>
      <div class="field" style="margin:12px 0 0"><label for="zf-probe">Schritt 2 — den
        ${d.ziffern}-stelligen Code aus der App eintragen</label>
        <input class="input" id="zf-probe" inputmode="numeric" autocomplete="one-time-code"
          spellcheck="false" maxlength="6"></div>
      <p class="desc" style="margin:0 0 10px">Erst damit ist der zweite Faktor eingeschaltet —
        so ist belegt, dass deine App wirklich dasselbe rechnet.</p>
      <div class="row-in">
        <button class="btn btn-accent btn-sm" id="zf-fertig">Einschalten</button>
        <button class="btn btn-ghost btn-sm" id="zf-abbruch">Abbrechen</button>
      </div>`;
    const feld = document.getElementById('zf-probe');
    document.getElementById('zf-kopie').onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(d.geheim).then(() => toast('Schlüssel kopiert'),
          () => toast('Bitte von Hand abtippen.', true));
      } else toast('Bitte von Hand abtippen.', true);
    };
    document.getElementById('zf-abbruch').onclick = () => renderSystem();
    document.getElementById('zf-fertig').onclick = async () => {
      const e = await bestaetigungsFeldFrei('Zweiten Faktor einschalten',
        'Zum Einschalten noch einmal dein Passwort.', false);
      if (e === null) return;
      try {
        const r = await api('POST', '/api/zweifaktor/an', { passwort: e.passwort, code: feld.value });
        zeichneZweifaktor(r);
        zeigeWiederCodes(r.codes);
        ZWEIFAKTOR = true;
        toast('Zweiter Faktor eingeschaltet');
      } catch (err) { toast(err.message, true); }
    };
    feld.focus();
  }

  /* DIE WIEDERHERSTELLUNGSCODES WERDEN GENAU EINMAL GEZEIGT, und der Bildschirm
     sagt es an derselben Stelle — mit demselben Ernst wie beim Einladungslink,
     und im selben Kasten. Sie kommen danach nicht wieder: in der Datenbank
     steht nur ihr SHA-256. */
  function zeigeWiederCodes(codes) {
    const box = document.getElementById('zf-block');
    if (!box || !Array.isArray(codes)) return;
    const kasten = document.createElement('div');
    kasten.className = 'warn-box zf-codes';
    kasten.id = 'zf-codes';
    kasten.innerHTML = `<strong>Deine ${codes.length} Wiederherstellungscodes — sie werden
      nur dieses eine Mal angezeigt.</strong>
      Schreib sie auf und leg sie dorthin, wo dein Telefon <strong>nicht</strong> liegt.
      Jeder von ihnen trägt <strong>genau einmal</strong> und ersetzt dabei den Code aus der App.
      <div class="zf-codeliste">${codes.map(c => `<span>${esc(c)}</span>`).join('')}</div>
      <p class="desc" style="margin:8px 0 0">Sind sie alle verbraucht und das Telefon weg,
        hilft nur noch <code>docker compose exec kriterion node zugang.js zweifaktor
        &lt;name&gt;</code> auf dem Server.</p>`;
    box.appendChild(kasten);
  }


/* ---- Karte „Meine Sitzungen" — Abschnitt „Persönlich" ---- */
function karteSitzungen() {
  return `<div class="sys-card">
        <h3>Meine Sitzungen</h3>
        <p class="desc">Wo dieser Zugang überall angemeldet ist. <strong>Was hier nicht
          steht:</strong> von welchem Gerät. Die Installation speichert weder Adresse noch
          Browserkennung — das ist so gewollt und bleibt so. Sie kann deshalb
          <strong>diese</strong> Anmeldung von <strong>allen anderen</strong> trennen, und
          mehr braucht der Knopf darunter nicht.</p>
        <div class="manage-list" id="msitzungen"></div>
      </div>`;
}
function ruesteSitzungenAus(geholt) {
  zeichneSitzungen(geholt.sitzungen);
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


/* ---- Karte „Darstellung" — Abschnitt „Persönlich" ---- */
function karteDarstellung() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteDarstellungAus() {
  drawSchrift();
  /* --- Zeitleiste --- */
  const zl = document.getElementById('zlan');
  zl.checked = ZEITLEISTE_AN;
  zl.onchange = async () => {
    const vorher = ZEITLEISTE_AN;
    ZEITLEISTE_AN = zl.checked;
    try { await api('PUT', '/api/settings', { zeitleiste: ZEITLEISTE_AN }); toast('Gespeichert'); }
    catch (e) { ZEITLEISTE_AN = vorher; zl.checked = vorher; toast(e.message, true); }
  };
  amElement('breset', breset => breset.onclick = async () => {
    if (!await confirmBox('Standardanordnung wiederherstellen?',
      'Die Blöcke der Detailansicht kehren in ihre Ausgangsreihenfolge zurück, alle eingeklappten werden wieder geöffnet.',
      'Wiederherstellen')) return;
    BLOECKE = { seite: [...BLOCK_VORGABE.seite], unten: [...BLOCK_VORGABE.unten], zu: [] };
    try { await api('PUT', '/api/settings', { bloecke: BLOECKE }); toast('Standardanordnung wiederhergestellt'); }
    catch (e) { toast(e.message, true); }
  });
}

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


/* ---- Karte „Kategorien" — Abschnitt „Bestand" ---- */
function karteKategorien() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteKategorienAus(geholt) {
  verwaltungsListe('mcats', geholt.cats, 'cat', geholt);
  anlegeSchalter('katfrei', 'kategorienFreiAnlegen', () => KATEGORIEN_FREI, v => { KATEGORIEN_FREI = v; });
}

/* ---- Karte „Tags" — Abschnitt „Bestand" ---- */
function karteTags() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteTagsAus(geholt) {
  verwaltungsListe('mtags', geholt.tags, 'tag', geholt);
  anlegeSchalter('tagfrei', 'tagsFreiAnlegen', () => TAGS_FREI, v => { TAGS_FREI = v; });
}

/* ---- Karte „Bewertungskriterien" — Abschnitt „Bestand" ---- */
function karteKriterien() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteKriterienAus(geholt) {
  verwaltungsListe('mcrits', geholt.crits, 'crit', geholt);
  // Hier wird angelegt, nicht am Eintrag. Das Feld gibt es nur
  // fuer den Admin -- der Server verweigert es allen anderen ohnehin.
  const critFeld = document.getElementById('newcrit');
  if (critFeld) {
    const addCrit = async () => {
      const name = critFeld.value.trim();
      if (!name) return;
      try { await api('POST', '/api/criteria', { name }); critFeld.value = ''; toast('Kriterium angelegt'); verwaltungNeu(geholt); }
      catch (e) { toast(e.message, true); }
    };
    document.getElementById('newcrit-b').onclick = addCrit;
    critFeld.addEventListener('keydown', e => { if (e.key === 'Enter') addCrit(); });
  }
}

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


  /* --- Kategorien, Tags und Kriterien verwalten --- */
  // Dieselbe Liste fuer alle drei. Kriterien haben zusaetzlich einen Griff,
  // weil bei ihnen die Reihenfolge etwas bedeutet.
  const VERWALTUNGSART = {
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
      // DAS GEWICHTSFELD GEHOERT ALLEIN HIERHER. verwaltungsListe() zeichnet dieselbe
      // Zeile auch fuer Kategorien und Tags, und dort gibt es kein Gewicht --
      // ein Kriterium wiegt im Gesamtschnitt, eine Kategorie rechnet nirgends
      // mit. Die Unterscheidung laeuft ueber diesen Eintrag, wie schon bei
      // `sortierbar` und `zaehler`, und nicht ueber eine Abfrage auf den
      // Kartennamen.
      gewicht: true,
      warnung: e => `„${e.name}" wird überall entfernt, samt vergebener Sterne.`
    }
  };

  function verwaltungsListe(boxId, list, kind, geholt) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const art = VERWALTUNGSART[kind];
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
              verwaltungNeu(geholt);
            } catch (e) { toast(e.message, true); verwaltungNeu(geholt); }
          }
        });
      }
      /* NACH EINEM GEWICHTSWECHSEL WIRD DIE LISTE NICHT NEU GEZEICHNET. Das
         ist der Unterschied zum Umbenennen: dort MUSS neu gezeichnet werden,
         weil das ✎ den Namen durch ein Eingabefeld ERSETZT hat und der Zustand
         zurueckgebaut gehoert. Ein Gewichtswechsel ersetzt nichts -- das Feld
         steht dauerhaft da und traegt den neuen Wert bereits. Ein verwaltungNeu()
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
          if (!name || name === entry.name) return verwaltungNeu(geholt);
          try { await api('PUT', `${url}/${entry.id}`, { name }); toast('Umbenannt'); verwaltungNeu(geholt); }
          catch (e) { toast(e.message, true); verwaltungNeu(geholt); }
        };
        inp.onblur = save;
        inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') verwaltungNeu(geholt); };
      };
      row.querySelector('.rm').onclick = async () => {
        if (!await confirmBox(art.frage, art.warnung(entry))) return;
        try { await api('DELETE', `${url}/${entry.id}`); toast('Gelöscht'); verwaltungNeu(geholt); }
        catch (e) { toast(e.message, true); }
      };
      box.appendChild(row);
    });
  }
  function zeichneVerwaltung(geholt) {
    verwaltungsListe('mcats', geholt.cats, 'cat', geholt);
    verwaltungsListe('mtags', geholt.tags, 'tag', geholt);
    verwaltungsListe('mcrits', geholt.crits, 'crit', geholt);
  }
  async function verwaltungNeu(geholt) {
    [geholt.cats, geholt.tags, geholt.crits] = await Promise.all([
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria')
    ]);
    zeichneVerwaltung(geholt);
  }


/* ---- Karte „Vokabular" — Abschnitt „Bestand" ---- */
function karteVokabular() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteVokabularAus() {
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
}


/* ---- Karte „Links" — Abschnitt „Bestand" ---- */
function karteLinks() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteLinksAus() {
  drawLinkZeilen();
  drawSuchNamen();
}

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


/* ---- Karte „Suchanbieter" — Abschnitt „Bestand" ---- */
function karteSuchanbieter() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteSuchanbieterAus() {
  drawAnbieter();
  drawEigene();
}

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


/* ---- Karte „Papierkorb" — Abschnitt „Bestand" ---- */
function kartePapierkorb() {
  return `<div class="sys-card">
        <h3>Papierkorb</h3>
        <p class="desc">Gelöschte ${esc(V.sacheMehrzahl)} liegen hier <strong>${PAPIERKORB_TAGE} Tage</strong>
          und lassen sich zurückholen; danach fallen sie heraus. Zurück kommt eine
          <strong>neue</strong> Nummer mit demselben Inhalt — Fotos, Videos, Dateien, Kommentare,
          Bewertungen und ${esc(V.zeitpunktMehrzahl)} samt ihren Verfassern.
          ${EIGENTUEMER ? '' : 'Zurückholen und endgültig entfernen kann der Eigentümer dieser Installation.'}</p>
        <div class="manage-list" id="mpapierkorb"></div>
      </div>`;
}
function ruestePapierkorbAus(geholt) {
  drawPapierkorb(geholt);
}

  /* --- Papierkorb --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde -- dieselbe Bauform
     wie bei den drei Verwaltungskarten. Nach einem Zurueckholen oder einem
     endgueltigen Entfernen holt papierkorbNeu() die Liste noch einmal und
     zeichnet nur DIESE Karte: ein Neuaufbau des ganzen Systembereichs leerte
     die Passwortfelder daneben.
     JEDE LESESTELLE IST ABGEFANGEN: fehlt die Antwort oder ein Feld darin,
     soll die Karte etwas sagen und nicht der Lauf abreissen. */
  async function papierkorbNeu(geholt) {
    try { geholt.papierkorb = await api('GET', '/api/papierkorb'); }
    catch (e) {
      const box = document.getElementById('mpapierkorb');
      if (box) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`;
      return;
    }
    drawPapierkorb(geholt);
  }
  function drawPapierkorb(geholt) {
    const box = document.getElementById('mpapierkorb');
    if (!box) return;
    const zeilen = Array.isArray(geholt.papierkorb && geholt.papierkorb.zeilen) ? geholt.papierkorb.zeilen : [];
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
          papierkorbNeu(geholt);
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
          papierkorbNeu(geholt);
        } catch (e) { toast(e.message, true); }
      };
    });
  }


/* ---- Karte „Zugänge" — Abschnitt „Zugänge" ---- */
function karteZugaenge() {
  return `<div class="sys-card breit">
        <h3>Zugänge</h3>
        <p class="desc">Wer sich anmelden darf. <strong>Sperren ist in den meisten Fällen das,
          was man eigentlich will</strong> — die Anmeldung wird abgewiesen, die Beiträge bleiben
          unangetastet stehen, und der Name bleibt vergeben.
          ${EIGENTUEMER
            ? `Als Eigentümer dieser Installation vergibst du Rollen und kommst auch an andere Admins.`
            : `Rollen vergibt der Eigentümer dieser Installation; an einen anderen Admin kommst du nicht.`}</p>
        <div class="manage-list" id="mzugaenge"></div>
        ${/* DER KNOPF ZU DEN GRABSTEINEN. Die Zeile steht leer da, solange
             nichts geloescht wurde -- gefuellt wird sie von
             zeichneGrabsteinKnopf(), sobald die Liste vom Server da ist. */''}
        <div class="row-in" id="zug-weg-zeile" style="margin-top:8px"></div>

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

        ${/* DIESELBE KLEMME WIE IN DER KARTE „ZUGANG“, und aus demselben
              Grund: der Befehl läuft auf dem Wirt, und dort sitzt in der Regel
              der Eigentümer. Ein Admin, der nicht Eigentümer ist, verwaltet
              Zugänge über diese Karte und kommt an den Server nicht heran —
              ihm hilft der Name dessen, der es kann. */''}
        <p class="desc" style="margin:16px 0 0">Passwort vergessen und niemand kommt mehr herein?
          ${EIGENTUEMER
            ? `Auf dem Server hilft
               <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>.`
            : `Der <strong>Eigentümer</strong> kommt am Server daran; über die Oberfläche gibt
               es diesen Weg nicht.`}</p>
      </div>`;
}
function ruesteZugaengeAus() {
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

}

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

  /* EINE FUNKTION, ZWEI RUFER -- das Anlegen in der Karte
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
    /* GRABSTEINE STEHEN NICHT MEHR ZWISCHEN DEN LEBENDEN. Sie sind kein
       Zugang, den man verwalten kann -- kein Werkzeug, keine Rolle, kein
       Passwort --, und sie wachsen mit jeder Löschung. Sie stehen deshalb in
       einem eigenen Fenster; das Vorbild ist "Wer hat bewertet".
       DIE ERKENNUNG BLEIBT DIE EINE: `status === 'geloescht'`. Kein zweiter
       Test am Namen -- der geht gar nicht hinaus.
       DER SERVER GIBT SIE WEITERHIN MIT. Getrennt wird in der Oberfläche; die
       Antwort der Route bleibt, wie sie ist. */
    zugGrabsteine = daten.zugaenge.filter(z => z.status === 'geloescht');
    for (const z of daten.zugaenge.filter(z => z.status !== 'geloescht')) {
      const selbst = z.id === daten.ich;
      // Genau die Regel des Servers, einmal hier: an einen Admin oder den
      // Eigentuemer kommt nur der Eigentuemer.
      const darf = !selbst && (z.role === 'user' ? true : daten.darfRollen);
      const row = dok.createElement('div');
      row.className = 'mrow zug' + (z.status === 'gesperrt' ? ' zug-sperr' : '');
      row.dataset.mid = z.id;
      // Dieselbe Beschriftung wie an jedem Beitrag im Eintrag -- eine
      // Funktion, zwei Rufer. Stuende die Bildung des Grabsteinnamens hier ein
      // zweites Mal, liefen die beiden Stellen auseinander.
      /* "Noch kein Passwort" steht NICHT als vierter Zustand in der Datenbank:
         ZUSTAENDE hat drei, und jede Stelle, die status liest, kennt sie. Es
         ist abgeleitet aus dem leeren Hash — genau dem Wert, über den auch die
         Anmeldung entscheidet. Am Grabstein kann es gar nicht mehr erscheinen:
         der steht seit 0.13.0 in einem eigenen Fenster, und dort trägt keine
         Zeile diese Angabe. */
      const wartet = z.ohnePasswort;
      row.innerHTML = `<span class="mname">${esc(verfasserName({ id: z.id, name: z.username, geloescht: false }))}${
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
          /* DER SATZ, DER DEN UMKEHRBAREN WEG NENNT. Bis 0.12.4 sagte der
             Dialog, dass es nicht rückgängig zu machen ist und dass der Name
             frei wird -- er sagte NICHT, dass es daneben einen Weg gibt, der
             beides nicht tut. Die Rückholfrist ist zur Hälfte längst gebaut,
             sie heißt nur anders: sperren.
             ER STEHT AN BEIDEN STELLEN, hier und im Passwortfenster darunter --
             zwei aufeinanderfolgende Fenster, die Verschiedenes sagen, sind
             schlimmer als eines. */
          if (!confirm(`„${z.username}“ jetzt entfernen? Das lässt sich nicht rückgängig machen.\n\n` +
            `Nur vorübergehend aussperren? Dann sperren statt entfernen — das ist umkehrbar, ` +
            `und der Name bleibt.`)) return;
          if (!await zweiteBestaetigung('entfernen', z.id, 'Zugang entfernen',
            `„${z.username}“ wird stillgelegt; der Name wird frei. Nur vorübergehend aussperren? ` +
            `Dann sperren statt entfernen — das ist umkehrbar, und der Name bleibt.`)) return;
          try {
            await api('DELETE', `/api/users/${z.id}?eintraege=${eintraegeWeg ? 1 : 0}&beitraege=${beitraegeWeg ? 1 : 0}`);
            toast('Zugang entfernt');
          } catch (e) { toast(e.message, true); }
          zeichneZugaenge();
        };
      }
      box.appendChild(row);
    }
    if (!daten.zugaenge.some(z => z.status !== 'geloescht'))
      box.innerHTML = `<span class="hint">Kein Zugang.</span>`;
    zeichneGrabsteinKnopf();
  }

  /* --- Gelöschte Zugänge, im eigenen Fenster ---
     REINE OBERFLÄCHE. Das Vorbild steht im Projekt: der Dialog "Wer hat
     bewertet" -- Hintergrund, Fenster, ein erklärender Satz, eine Liste, ein
     Knopf zum Schließen.
     DER KNOPF STEHT NUR DA, WENN ES ETWAS ZU ZEIGEN GIBT. Ein Knopf, der ein
     leeres Fenster öffnet, ist ein Knopf zu viel; die Zahl daneben sagt schon,
     was darin steht. */
  let zugGrabsteine = [];
  function zeichneGrabsteinKnopf() {
    const zeile = document.getElementById('zug-weg-zeile');
    if (!zeile) return;
    zeile.innerHTML = '';
    if (!zugGrabsteine.length) return;
    const n = zugGrabsteine.length;
    const b = zeile.ownerDocument.createElement('button');
    b.className = 'btn btn-ghost btn-sm';
    b.id = 'zug-weg-auf';
    b.textContent = `Gelöschte Zugänge (${n})`;
    b.title = 'Die Grabsteine der entfernten Zugänge ansehen';
    b.onclick = zeigeGrabsteine;
    zeile.appendChild(b);
  }

  function zeigeGrabsteine() {
    const dok = document;
    const bd = dok.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal" id="grabstein-modal"><h2>Gelöschte Zugänge</h2>
      <p>Ein entfernter Zugang wird zum <strong>Grabstein</strong>: der Name ist frei geworden,
      und was er geschrieben hat, trägt seither „Gelöschter Benutzer &lt;Nummer&gt;“.
      <strong>Der ursprüngliche Name steht hier nicht</strong> — die Installation bewahrt ihn nirgends
      auf, denn der Grabstein IST das Löschen. Zurückholen lässt sich ein Zugang nicht;
      <strong>sperren</strong> ist der umkehrbare Weg.</p>
      <div class="manage-list" id="grabsteinliste"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Schließen</button></div></div>`;
    dok.body.appendChild(bd);
    const zu = () => { bd.remove(); dok.removeEventListener('keydown', onKey, true); };
    /* Escape schliesst nur den OBERSTEN Dialog -- dieselbe Regel wie bei
       "Wer hat bewertet": aus diesem Fenster heraus geht keiner auf, aber ein
       Horcher, der jeden Hintergrund schliesst, waere eine Falle fuer den
       naechsten, der einen dazubaut. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...dok.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    dok.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
    const box = bd.querySelector('#grabsteinliste');
    if (!zugGrabsteine.length) {
      box.innerHTML = `<span class="hint">Es wurde noch kein Zugang entfernt.</span>`;
      return;
    }
    for (const z of zugGrabsteine) {
      const row = dok.createElement('div');
      row.className = 'mrow zug zug-weg';
      row.dataset.mid = z.id;
      // Dieselbe Beschriftung wie ueberall: eine Funktion, zwei Rufer. Stuende
      // die Bildung des Grabsteinnamens hier ein zweites Mal, liefen die
      // Stellen auseinander.
      row.innerHTML = `<span class="mname">${esc(verfasserName({ id: z.id, name: z.username, geloescht: true }))}</span>
        <span class="zug-status">${esc(STATUSWORT.geloescht)}</span>
        <span class="mcount">${z.eintraege} ${esc(vSache(z.eintraege))}</span>`;
      box.appendChild(row);
    }
  }


/* ---- Karte „Anfragen" — Abschnitt „Zugänge" ---- */
function karteAnfragen(geholt) {
  const { anfragen } = geholt;
  return `<div class="sys-card breit">
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
      </div>`;
}
function ruesteAnfragenAus(geholt) {
  zeichneAnfragen(geholt.anfragen);
  const anfSchalter = document.getElementById('anf-schalter');
  if (anfSchalter) anfSchalter.onclick = async () => {
    // Vor dem await lesen: danach steht am Knopf schon der andere Text.
    const neu = !(geholt.anfragen && geholt.anfragen.an);
    try {
      const d = await api('PUT', '/api/registrierung/schalter', { an: neu });
      geholt.anfragen = d;
      /* DER EINE MERKER ZIEHT MIT. `REGISTRIERUNG` kommt beim Start aus
         /api/config und traegt die Anmeldeseite; seit 0.17.1 haengt auch der
         Satz in der Karte „Zugang“ daran. Bliebe er hier stehen, saehe der
         Admin, der eben umgelegt hat, einen Abschnitt weiter noch die alte
         Lage -- eine zweite Wahrheit, und zwar die falsche. */
      REGISTRIERUNG = !!d.an;
      toast(neu ? 'Selbstanmeldung eingeschaltet' : 'Selbstanmeldung ausgeschaltet');
      zeichneAnfragen(d);
      const kaputt = document.getElementById('anf-kaputt');
      if (kaputt && (!d.an || d.versandBereit)) kaputt.remove();
    } catch (e) { toast(e.message, true); }
  };
}

  /* Die Warteschlange der Selbstanmeldung, . DIESELBE BAUFORM WIE
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


/* ---- Karte „Sicherheitsprotokoll" — Abschnitt „Zugänge" ---- */
function karteProtokoll(geholt) {
  const { protokoll } = geholt;
  return `<div class="sys-card breit">
        <h3>Sicherheitsprotokoll</h3>
        <p class="desc">Wer Zugang hatte und wer diese Installation als Ganzes angefasst hat.
          <strong>Was hier nicht steht:</strong> was jemand geschrieben oder bewertet hat — das ist
          kein Änderungsverlauf, und das bleibt so. Ebenso wenig Adresse oder Browserkennung:
          die Installation speichert beides nicht.</p>
        <p class="desc">Die Zeilen bleiben <strong>${protokoll.tage} Tage</strong> stehen und werden
          danach von selbst geräumt. Einen anderen Weg hinaus gibt es nicht — ein Sicherheitsprotokoll,
          das sich wegräumen lässt, wäre keins.</p>
        ${/* DIE FILTERLEISTE. Sie steht VOR der Liste, wie jede Filterreihe in
             dieser Instanz -- man waehlt, bevor man liest. Gezeichnet wird sie
             aus einer geschlossenen Liste; die Auswahl geht an den Server,
             denn die Liste darunter traegt nur die hundert juengsten Zeilen. */''}
        <div class="pills" id="protokoll-filter" style="margin:0 0 12px"></div>
        <div class="prot-liste" id="protokoll-liste"></div>
        <p class="hint hint-sm" id="protokoll-fuss" style="margin:10px 2px 0"></p>
      </div>`;
}
function ruesteProtokollAus(geholt) {
  // Beim Zeichnen steht wieder "Alle" -- Ansichtszustand, keine Einstellung.
  protokollGruppe = '';
  zeichneProtokoll(geholt.protokoll);
}

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
    /* DIE FUENF, DIE BIS 0.12.4 FEHLTEN. Sie fielen auf den Rueckfall `|| z.was`
       und standen als roher Schluessel am Bildschirm -- "anfrage.frei" statt
       eines Wortes. Zwanzig Vorgaenge und vierzehn Woerter: der Filter dieser
       Runde macht die Luecke unuebersehbar, gefehlt hat sie seit 0.9.1 und
       0.10.0. */
    'anfrage.frei': 'Anfrage freigegeben',
    'anfrage.ab': 'Anfrage abgelehnt',
    'zweifaktor.an': 'Zweiter Faktor eingeschaltet',
    'zweifaktor.aus': 'Zweiter Faktor ausgeschaltet',
    'zweifaktor.wieder': 'Wiederherstellungscode verbraucht',
    'export': 'Export gezogen',
    'import': 'Import eingespielt',
    'sicherung': 'Sicherung geschrieben',
    // Die Zeile nennt, DASS gewechselt wurde, nie WOHIN -- sie
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
  /* EIN MERKMAL OHNE WORT VERSCHWINDET SPURLOS -- merkmalsWort() faellt still
     auf den leeren String zurueck, und genau deshalb ist bis 0.12.4 niemandem
     aufgefallen, dass Woerter fehlten.
     'teil' KAM MIT 0.13.0 DAZU: ohne das Wort waere ein Teilexport von einem
     vollen nicht zu unterscheiden -- und das war der Grund, aus dem er
     ueberhaupt ein Merkmal traegt.
     'adresse' FEHLTE seit 0.9.1, und 'beides' war seither falsch beschriftet:
     es heisst am Server "mehr als eines" und kann Name, Passwort und Adresse
     in jeder Mischung meinen -- "Name und Passwort" behauptete zwei bestimmte.
     'aktiv' UND 'gesperrt' STEHEN HIER AUSDRUECKLICH NICHT: ihr Wort traegt
     schon der Vorgang ("Zugang gesperrt" / "Zugang freigegeben"), und zweimal
     dasselbe in einer Zeile ist eines zu viel. Ein Waechter im Pruefstand
     nimmt genau diese beiden aus und verlangt fuer jedes uebrige ein Wort. */
  const MERKMALSWORT = {
    user: 'Benutzer', admin: 'Admin', eigentuemer: 'Eigentümer',
    einladung: 'Einladung', ruecksetzung: 'Rücksetzung',
    merge: 'zusammengeführt', replace: 'ersetzend',
    name: 'Name', passwort: 'Passwort', adresse: 'Adresse',
    beides: 'mehreres', teil: 'in Teilen'
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

  /* DIE ANSICHTEN DES PROTOKOLLS. Die Schluessel kommen aus auth.js
     (PROTOKOLL_GRUPPEN), die Woerter stehen hier -- dieselbe Teilung wie bei
     den Vorgaengen selbst.
     "GESCHEITERT" HEISST NICHT "gescheiterte Anmeldungen": die Gruppe traegt
     auch die gescheiterte zweite Bestaetigung, und beide sagen dasselbe --
     jemand konnte an der Tuer nicht belegen, wer er ist. Ein Name, der nur die
     Haelfte nennt, waere falsch. */
  const PROTOKOLL_ANSICHT = [
    ['', 'Alle'],
    ['gescheitert', 'Gescheitert'],
    ['anmeldungen', 'Anmeldungen'],
    ['zugaenge', 'Zugänge'],
    ['zweifaktor', 'Zweiter Faktor'],
    ['bestand', 'Bestand']
  ];
  const PROTOKOLL_ANSICHT_HILFE = {
    '': 'Alle Vorgänge, die jüngsten zuerst',
    gescheitert: 'Gescheiterte Anmeldungen und gescheiterte Bestätigungen',
    anmeldungen: 'Gelungene Anmeldungen',
    zugaenge: 'Angelegt, gesperrt, entfernt, Rollen, Links und Anfragen',
    zweifaktor: 'Ein- und ausgeschaltet, verbrauchte Wiederherstellungscodes',
    bestand: 'Export, Import, Sicherung und Schlüsselwechsel'
  };
  // Welche Ansicht gerade gilt. Ansichtszustand und keine Einstellung: beim
  // naechsten Aufruf steht wieder "Alle", wie beim Umschalter "meine / alle".
  let protokollGruppe = '';

  /* DER SPRUNG ZUM ZUGANG. Er klappt nichts auf -- die Karte "Zugaenge" steht
     im selben Bereich -- und hebt die Zeile kurz hervor, damit man sie in
     einer langen Liste wiederfindet.
     WER DAS PROTOKOLL SIEHT, IST EIGENTUEMER UND DAMIT IMMER AUCH ADMIN: die
     Karte "Zugaenge" ist also da. Trotzdem abgefangen -- zeichneZugaenge()
     laedt fuer sich, und beim allerersten Aufbau kann die Zeile noch fehlen.
     Ein stiller Klick, der nichts tut, waere der schlechtere Ausgang.
     scrollIntoView MIT `?.`: jsdom kennt es nicht, und ein Prueflauf, der an
     einer Anzeigefunktion abreisst, faerbt keine Pruefung rot (Stolperstein 138). */
  function springeZuZugang(id) {
    const zeile = document.querySelector(`#mzugaenge .mrow[data-mid="${Number(id) || 0}"]`);
    if (!zeile) return toast('Diesen Zugang gibt es in der Liste nicht mehr.', true);
    zeile.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    zeile.classList.add('mrow-blitz');
    setTimeout(() => zeile.classList.remove('mrow-blitz'), 1600);
  }

  /* EIN NAME WIRD ZUM KNOPF, wenn er eine Nummer hat -- und nur dann.
     "unbekannter Name" hat keine: er ist der getippte Name eines Versuchs, der
     an keinen Zugang traf, und es gaebe nichts, wohin er springen koennte. Ein
     Knopf, der ins Leere fuehrt, ist schlimmer als Text. */
  const protNamensFeld = (dok, klasse, text, id, davor = '') => {
    const feld = dok.createElement('span');
    feld.className = klasse;
    if (!text) return feld;
    // Der Pfeil steht VOR dem Knopf und nicht in ihm: er gehoert der Zeile und
    // ist kein Teil des Namens, auf den man klickt.
    if (davor) feld.appendChild(dok.createTextNode(davor));
    if (id == null) { feld.appendChild(dok.createTextNode(text)); return feld; }
    const b = dok.createElement('button');
    b.className = 'link-btn prot-sprung';
    b.dataset.mid = String(id);
    b.textContent = text;
    b.title = 'Zu diesem Zugang springen';
    b.onclick = () => springeZuZugang(id);
    feld.appendChild(b);
    return feld;
  };

  function zeichneProtokollFilter(d) {
    const box = document.getElementById('protokoll-filter');
    if (!box) return;
    const zahlen = (d && d.zahlen && typeof d.zahlen === 'object') ? d.zahlen : {};
    box.innerHTML = '';
    for (const [schluessel, wort] of PROTOKOLL_ANSICHT) {
      const b = document.createElement('button');
      const n = Number(zahlen[schluessel || 'alle']) || 0;
      /* GEDAEMPFT BEI NULL, wie jede Pille in dieser Lage (Stolperstein 47):
         eine Ansicht ohne Zeilen fuehrt garantiert auf eine leere Liste.
         Anklickbar bleibt sie -- man sieht nur vorher, dass nichts kommt. */
      const leer = n === 0 && protokollGruppe !== schluessel;
      b.className = 'pill' + (protokollGruppe === schluessel ? ' on' : '') + (leer ? ' leer' : '');
      b.dataset.gruppe = schluessel;
      b.innerHTML = `${esc(wort)}<span class="n">${n}</span>`;
      b.title = PROTOKOLL_ANSICHT_HILFE[schluessel] || '';
      b.onclick = () => protokollNeu(schluessel);
      box.appendChild(b);
    }
  }

  /* NACHGELADEN WIRD BEIM KLICK, und zwar NUR diese Karte -- dieselbe Bauform
     wie sitzungenNeu() und papierkorbNeu(). Ein Neuaufbau des ganzen
     Systembereichs leerte die Passwortfelder daneben.
     GEFRAGT WIRD DER SERVER UND NICHT DIE GEHOLTEN HUNDERT ZEILEN: der Filter
     soll die hundert juengsten DIESER Art zeigen und nicht die dieser Art unter
     den hundert juengsten aller Arten. Genau das war der Befund. */
  async function protokollNeu(gruppe) {
    protokollGruppe = gruppe || '';
    let d;
    try {
      d = await api('GET', '/api/sicherheitsprotokoll' +
        (protokollGruppe ? `?gruppe=${encodeURIComponent(protokollGruppe)}` : ''));
    } catch (e) {
      const box = document.getElementById('protokoll-liste');
      if (box) box.innerHTML = `<p class="hint">${esc(e.message)}</p>`;
      return;
    }
    zeichneProtokoll(d);
  }

  function zeichneProtokoll(d) {
    const box = document.getElementById('protokoll-liste');
    const fuss = document.getElementById('protokoll-fuss');
    if (!box) return;
    const dok = box.ownerDocument;
    zeichneProtokollFilter(d);
    const zeilen = (d && Array.isArray(d.zeilen)) ? d.zeilen : [];
    if (!zeilen.length) {
      /* ZWEI LEERE FAELLE, ZWEI SAETZE. "Noch kein Vorgang festgehalten" waere
         unter einem Filter eine Falschaussage: es gibt Vorgaenge, nur keinen
         dieser Art. */
      box.innerHTML = protokollGruppe
        ? `<p class="hint">Kein Vorgang dieser Art in den letzten ${esc(String(d && d.tage || ''))} Tagen.</p>`
        : `<p class="hint">Noch kein Vorgang festgehalten.</p>`;
      if (fuss) fuss.textContent = '';
      return;
    }
    box.innerHTML = '';
    for (const z of zeilen) {
      const zeile = dok.createElement('div');
      zeile.className = 'prot-zeile';
      zeile.dataset.was = z.was;
      const wen = protZiel(z), merk = merkmalsWort(z);
      const zeit = dok.createElement('span');
      zeit.className = 'prot-zeit'; zeit.textContent = fmtDate(z.am);
      const was = dok.createElement('span');
      was.className = 'prot-was'; was.textContent = vorgangsWort(z);
      zeile.appendChild(zeit); zeile.appendChild(was);
      // Der Handelnde ist anklickbar, wenn er eine Nummer hat -- "—" und
      // "ueber zugang.js auf dem Wirt" haben keine.
      zeile.appendChild(protNamensFeld(dok, 'prot-wer', protHandelnder(z),
        z.wer != null ? z.wer : null));
      zeile.appendChild(protNamensFeld(dok, 'prot-ziel', wen,
        z.ziel != null ? z.ziel : null, '→ '));
      const mfeld = dok.createElement('span');
      mfeld.className = 'prot-merkmal'; mfeld.textContent = merk || '';
      zeile.appendChild(mfeld);
      box.appendChild(zeile);
    }
    if (fuss) {
      const gesamt = Number(d.gesamt) || zeilen.length;
      const art = protokollGruppe ? ' dieser Art' : '';
      fuss.textContent = gesamt > zeilen.length
        ? `Die ${zeilen.length} jüngsten von ${gesamt} Vorgängen${art}.`
        : `${gesamt} ${gesamt === 1 ? 'Vorgang' : 'Vorgänge'}${art}.`;
    }
  }


/* ---- Karte „Mailversand" — Abschnitt „Zugänge" ---- */
function karteMailversand(geholt) {
  const { mailstand } = geholt;
  /* `.breit` WIE DIE DREI NACHBARN. Seit 0.16.0 stehen „Zugaenge",
     „Anfragen", „Sicherheitsprotokoll" und „Mailversand" im selben Abschnitt;
     die ersten drei nehmen die volle Breite, und die vierte wirkte daneben wie
     ein Rest. Vier gleich breite Kacheln sind einfacher zu begruenden als drei
     plus ein Rest -- und seit 0.17.3 traegt sie die Breite mit ihrer laengsten
     Zeile, „Eigener Server · smtp.beispiel.de:587 · STARTTLS", statt mit
     Feldern. */
  return `<div class="sys-card breit">
        <h3>Mailversand</h3>
        ${/* DIE ACHTZEHNTE KARTE, und sie gehört dem EIGENTÜMER — nicht dem
              Admin, obwohl der die Einladungen verschickt. Der SMTP-Server
              sieht jede Mail, und jede trägt einen Link, der ein Passwort
              setzt; ein Admin, der ihn einträgt, böge damit die Rücksetzmail
              des Eigentümers auf einen Server seiner Wahl. Über dem Eigentümer
              steht niemand — die Rollenleiter bleibt heil.
              DAS PASSWORT STEHT HIER NIE — nie der Wert, nie die Länge, nie
              der Anfang, nie Sternchen mit der richtigen Zahl. Aus jedem davon
              ließe sich etwas ableiten, und keines hilft dem, der die Karte
              ansieht. Bis 0.17.2 stand hier wenigstens „gesetzt" oder „nicht
              gesetzt"; die Zeile ist weg, weil sie dieselbe Frage beantwortete
              wie „Zustand" — der Dialog sagt es jetzt am Feld selbst. */''}
        <p class="desc"><strong>E-Mail ist eine Bequemlichkeit, keine Voraussetzung.</strong>
          Ohne Mailzugang läuft die Installation vollständig — Einladungs- und Rücksetzlinks stehen
          dann wie bisher im Verwaltungsbereich zum Kopieren. Mit Mailzugang gehen sie
          <em>zusätzlich</em> hinaus; schlägt das fehl, bricht nichts ab.</p>
        <div class="kv"><span class="k">Zustand</span><span class="v">${mailstand.eingerichtet
          ? '<strong class="mail-gut">eingerichtet</strong>'
          : '<strong class="mail-aus">nicht eingerichtet</strong>'}</span></div>
        ${/* ---- DIE KARTE ZEIGT, DER DIALOG STELLT EIN — 0.17.3 ----
              BIS 0.17.2 STANDEN HIER NEUN BEDIENELEMENTE in vier verschiedenen
              Spaltenaufteilungen, und dazwischen vier Erklärsätze: zwei NEBEN
              einem Feld, zwei über die volle Breite. Das Auge fand keine
              Spalte. Die Reihe „Anbieter" war der sichtbarste Teil davon: ein
              Feld auf einem Drittel, daneben zwei Drittel Leere mit einem
              Strich darin.
              JETZT IST SIE EINE ZUSTANDSKARTE WIE IHRE NACHBARN — fünf Zeilen,
              zwei Knöpfe, ein Satz. Was eingestellt wird, stellt der Dialog
              ein, und der trägt EINEN Rhythmus.
              KEINE ZEILE „PASSWORT" MEHR: sie beantwortete dieselbe Frage wie
              „Zustand" eine Zeile darüber — ein Zugang ist nur dann
              eingerichtet, wenn ein Passwort gesetzt ist. Der Dialog sagt es
              am Feld selbst. DASS DAS PASSWORT NIE DASTEHT, gilt unverändert:
              nie der Wert, nie die Länge, nie Sternchen mit der richtigen
              Zahl. */''}
        <div class="kv"><span class="k">Anbieter</span><span class="v">${mailAnbieterZeile(mailstand)}</span></div>
        <div class="kv"><span class="k">Absender</span><span class="v">${mailstand.absender
          ? esc(mailstand.absender)
          : '<strong class="mail-aus">nicht gesetzt</strong>'}</span></div>
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
        ${/* ZWEI KNÖPFE, und der erste sagt, was er tut: einrichten, wenn noch
              nichts steht, ändern, wenn etwas steht. „Speichern" hieß er bis
              0.17.2 — an einer Karte, in der die Felder schon dastanden. Ein
              Knopf, der einen Dialog öffnet, verspricht mit „Speichern" einen
              Vorgang, den er gar nicht auslöst.
              DER SATZ ZUR TESTMAIL STEHT DARUNTER und nicht daneben: er nennt
              eine Folge, die man kennen muss, bevor man drückt. */''}
        <div class="row-in" style="margin-top:14px">
          <button class="btn btn-accent btn-sm" id="mail-einrichten">Mailzugang ${
            mailstand.eingerichtet ? 'ändern' : 'einrichten'}</button>
          <button class="btn btn-sm" id="mail-test">Testmail an mich</button>
        </div>
        <p class="desc" style="margin:10px 0 0">Die Testmail geht <strong>ausschließlich an die
          Adresse deines eigenen Zugangs</strong>. Antwortet der Mailserver nicht, bricht der
          Versuch nach ${mailstand.sekunden} Sekunden ab.</p>
        <div id="mail-ergebnis"></div>
      </div>`;
}

/* DIE ANBIETERZEILE DER KARTE: Name · Server:Port · Verschlüsselung, in EINER
   Zeile — „Eigener Server · smtp.beispiel.de:587 · STARTTLS".
   OHNE ANBIETER STEHT DA, DASS KEINER GEWÄHLT IST, und nicht nichts: eine
   leere Zelle sieht aus wie eine Auskunft, die nicht geladen hat.
   BEI „Eigener Server" OHNE EINGETRAGENEN SERVER steht nur der Name. Ein
   „:0" oder ein nacktes „:587" wäre eine Angabe über etwas, das gar nicht
   eingetragen ist. */
function mailAnbieterZeile(m) {
  if (!m.anbieter) return '<strong class="mail-aus">noch keiner gewählt</strong>';
  const teile = [esc(m.anbieterName || m.anbieter)];
  if (m.server && m.port) {
    teile.push(`${esc(m.server)}:${m.port}`);
    teile.push(m.sicher ? 'TLS von Anfang an' : 'STARTTLS');
  }
  return teile.join(' · ');
}

/* ---- Der Dialog „Mailzugang einrichten" — 0.17.3 ----
   EINE SPALTE, BESCHRIFTUNG ÜBER DEM FELD, HINWEIS UNTER SEINER SACHE. Das ist
   der ganze Umbau, und er hat einen Satz: die Karte zeigt, der Dialog stellt
   ein.
   AUS NEUN FELDERN WERDEN DREI für jeden, der eine der fünf Vorlagen nimmt.
   Server, Port und Verschlüsselung stehen dann als GELESENE Zeile da und nicht
   als drei gesperrte Felder: die Werte stehen fest, und ein gesperrtes Feld
   sieht aus wie eines, das gleich aufgeht. Bei „Eigener Server" sind es
   Felder, und DORT steht auch der Satz zum Hausanschluss — dort, wo er gilt,
   und sonst nirgends.
   DER SPEICHERWEG IST DERSELBE WIE VORHER, und das ist die harte Klemme dieses
   Umbaus: `mail` ist einer der sieben Zwecke in BESTAETIGUNG_ZWECKE, und die
   zweite Bestätigung bleibt, wo sie ist — Passwort, und bei eingeschaltetem
   zweitem Faktor ein Code. Ein Dialog, der eine Schranke abkürzt, weil er
   selbst schon ein Dialog ist, wäre der stillste Verlust dieser Runde.
   BRICHT DIE BESTÄTIGUNG AB, BLEIBT DER DIALOG STEHEN: sonst wäre das
   Eingetippte weg, und ein Anbieterpasswort tippt niemand gern zweimal.
   LIEFERT true, wenn wirklich gespeichert wurde — der Rufer zeichnet dann neu. */
function mailDialog(mailstand) {
  return new Promise(resolve => {
    const liste = Array.isArray(mailstand.anbieterListe) ? mailstand.anbieterListe : [];
    const vorlage = (schluessel) => liste.find(a => a.schluessel === schluessel) || null;
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal mail-dialog" id="mail-dialog">
      <h2>Mailzugang ${mailstand.eingerichtet ? 'ändern' : 'einrichten'}</h2>
      <div class="field"><label for="mail-anbieter">Anbieter</label>
        <select class="input" id="mail-anbieter">
          <option value=""${mailstand.anbieter ? '' : ' selected'}>— kein Versand —</option>
          ${liste.map(a => `<option value="${esc(a.schluessel)}"${
            a.schluessel === mailstand.anbieter ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}
        </select></div>
      ${/* DER HINWEIS ZUM GEWÄHLTEN ANBIETER — DARUNTER, NICHT DANEBEN, und er
            wechselt mit der Auswahl. Er kommt vom Server: zwei Ausfertigungen
            derselben Hinweise liefen auseinander, sobald ein Anbieter
            dazukommt (Stolperstein 102). */''}
      <p class="desc mail-hinweis" id="mail-anbieter-hinweis"></p>
      ${/* DIE FESTEN WERTE EINER VORLAGE — GELESEN UND NICHT EINGESTELLT. Sie
            stehen im Quelltext des Servers; wechselt ein Anbieter morgen den
            Port, kommt der neue von dort. Drei Felder für drei feste Werte
            wären drei Felder zu viel. */''}
      <div class="field" id="mail-fest-feld"><label>Server, Port und Verschlüsselung</label>
        <div class="mail-fest" id="mail-fest"></div></div>
      <div id="mail-eigen">
        <div class="field"><label for="mail-server">Server</label>
          <input class="input" id="mail-server" value="${esc(mailstand.server || '')}"
            autocapitalize="off" spellcheck="false"></div>
        <div class="field"><label for="mail-port">Port</label>
          <input class="input" id="mail-port" type="number" min="1" max="65535"
            value="${mailstand.port || ''}"></div>
        <div class="field"><label for="mail-sicher">Verschlüsselung</label>
          <select class="input" id="mail-sicher">
            <option value="starttls"${mailstand.sicher ? '' : ' selected'}>STARTTLS (meist 587)</option>
            <option value="tls"${mailstand.sicher ? ' selected' : ''}>TLS von Anfang an (meist 465)</option>
          </select></div>
        <p class="desc mail-hinweis">Immer über den SMTP-Zugang eines Anbieters, nie unmittelbar
          vom Hausanschluss: dort fehlen rDNS und SPF/DKIM, und die Mail landet im besten Fall
          im Spam.</p>
      </div>
      <div class="field"><label for="mail-benutzer">Benutzername beim Anbieter</label>
        <input class="input" id="mail-benutzer" value="${esc(mailstand.benutzer || '')}"
          autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <div class="field"><label for="mail-passwort">Passwort beim Anbieter</label>
        <input class="input" id="mail-passwort" type="password" autocomplete="new-password"
          placeholder="${mailstand.passwortGesetzt
            ? 'gesetzt — leer lassen ändert es nicht' : 'nicht gesetzt'}"></div>
      <div class="field"><label for="mail-absender">Absenderadresse</label>
        <input class="input" id="mail-absender" type="email" value="${esc(mailstand.absender || '')}"
          autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <p class="desc mail-hinweis" id="mail-absender-hinweis">${esc(mailstand.hinweisImmer)}</p>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>Abbrechen</button>
        <button class="btn btn-accent" id="mail-save">Speichern</button></div></div>`;
    document.body.appendChild(bd);
    const feld = (id) => bd.querySelector('#mail-' + id);
    const auswahl = feld('anbieter');
    const hinweis = bd.querySelector('#mail-anbieter-hinweis');
    const festFeld = bd.querySelector('#mail-fest-feld');
    const eigenBox = bd.querySelector('#mail-eigen');
    const absenderHinweis = bd.querySelector('#mail-absender-hinweis');

    /* WAS DIE AUSWAHL UMSTELLT, an EINER Stelle. Drei Fälle und nicht zwei:
       eine Vorlage (feste Zeile), „Eigener Server" (Felder) und „kein
       Versand" — dort gibt es weder das eine noch das andere, und auch die
       drei Felder darunter haben nichts zu tragen. */
    const nachAuswahl = () => {
      const v = vorlage(auswahl.value);
      const eigen = auswahl.value === 'eigen';
      hinweis.textContent = v && v.hinweis ? v.hinweis : '';
      hinweis.hidden = !(v && v.hinweis);
      festFeld.hidden = !v || eigen;
      if (v && !eigen) bd.querySelector('#mail-fest').textContent =
        `${v.server} · ${v.port} · ${v.sicher ? 'TLS von Anfang an' : 'STARTTLS'}`;
      eigenBox.hidden = !eigen;
      for (const id of ['benutzer', 'passwort', 'absender']) feld(id).disabled = !v;
      absenderHinweis.hidden = !v;
    };
    auswahl.onchange = nachAuswahl;
    nachAuswahl();

    const fertig = (v) => {
      document.removeEventListener('keydown', onKey, true); bd.remove(); resolve(v);
    };
    /* Escape schliesst nur den OBERSTEN Dialog -- steht die zweite
       Bestaetigung darueber, gehoert die Taste ihr. Dieselbe Regel wie am
       Erklaerkasten und an den Grabsteinen. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      fertig(false);
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = () => fertig(false);
    bd.onclick = e => { if (e.target === bd) fertig(false); };

    bd.querySelector('#mail-save').onclick = async () => {
      const koerper = {
        anbieter: auswahl.value,
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
        'Über diesen Server läuft künftig JEDE Mail dieser Installation — auch jeder ' +
        'Link, der ein Passwort setzt.')) return;
      try {
        await api('PUT', '/api/mail', koerper);
        toast('Mailzugang gespeichert');
        fertig(true);
      } catch (e) { toast(e.message, true); }
    };
    auswahl.focus();
  });
}
function ruesteMailversandAus(geholt) {
  /* NUR FUER DEN EIGENTUEMER; die Klemme steht in SYS_KARTEN, und die
     Endpunkte darunter weisen jeden anderen ohnehin ab. Die Abfrage auf das
     Element bleibt trotzdem stehen: sie ist der Schutz davor, dass ein
     Behandler ins Leere greift, wenn die Karte einmal woanders steht
     (Stolperstein 211). */
  const { mailstand } = geholt;
  const mailKnopf = document.getElementById('mail-einrichten');
  if (mailKnopf && mailstand) {
    /* DER DIALOG BEKOMMT DEN ZUSTAND MIT, den die Karte ohnehin schon hat --
       kein zweiter Ruf an den Server fuer dieselbe Auskunft (Stolperstein 145).
       NEU GEZEICHNET WIRD NUR, WENN WIRKLICH GESPEICHERT WURDE. renderSystem()
       nach einem Abbruch waere ein Neuaufbau fuer nichts. */
    mailKnopf.onclick = async () => {
      if (await mailDialog(mailstand)) renderSystem();
    };

    const mailErgebnis = (text, gut) => {
      const box = document.getElementById('mail-ergebnis');
      if (box) box.innerHTML = `<p class="warn-box ${gut ? 'mail-erfolg' : ''}"
        style="margin:10px 0 0">${esc(text)}</p>`;
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
}


/* ---- Die Bildablage in der Karte „Kennzahlen" ----
   DIE NAMEN UND DIE REIHENFOLGE STEHEN AN EINER STELLE. Die Schluessel kommen
   aus /api/stats, wo sie an den ERSTEN BYTES erkannt werden -- nicht am
   gemeldeten Typ. Was der Server nicht einordnen kann, faellt in 'anderes';
   die Zeile erscheint nur, wenn es wirklich etwas gibt, und dann ist sie ein
   Befund und keine Verzierung. */
const BILDFORMATE = [
  { schluessel: 'png',     name: 'PNG',     hinweis: 'werden umgestellt' },
  { schluessel: 'jpeg',    name: 'JPEG',    hinweis: 'bleiben unangetastet' },
  { schluessel: 'webp',    name: 'WebP',    hinweis: 'liegen schon so' },
  { schluessel: 'gif',     name: 'GIF',     hinweis: 'bleiben unangetastet' },
  { schluessel: 'anderes', name: 'Anderes', hinweis: '' }
];

/* Die Fortschrittszeile. EIN Ort fuer den Satz, den drei Zustaende brauchen --
   laeuft, fertig, nie gelaufen --, sonst stuenden drei Formulierungen
   nebeneinander und wuerden bei der naechsten Aenderung drei verschiedene. */
function umstellungsZeile(u) {
  if (!u) return '';
  if (u.laeuft)
    return `<p class="hint hint-sm" style="margin:8px 2px 0" id="bild-lauf">Umstellung läuft — ` +
           `${u.erledigt} von ${u.gesamt} …</p>`;
  return `<p class="hint hint-sm" style="margin:8px 2px 0" id="bild-lauf">Umstellung fertig: ` +
         `${u.umgestellt} von ${u.gesamt} umgestellt` +
         (u.geblieben ? `, ${u.geblieben} blieben PNG` : '') +
         (u.gespart > 0 ? ` — ${fmtBytes(u.gespart)} gespart` : '') + `.</p>`;
}

/* Die zweite Fortschrittszeile — 0.19.4, fuer das Nachziehen der Geometrie.
   EINE EIGENE UND KEINE GETEILTE: die beiden Laeufe zaehlen verschiedene
   Dinge (umgestellt/geblieben gegen nachgezogen/geprueft), und eine Zeile,
   die beides ausdruecken soll, sagt am Ende von beidem die Haelfte.
   SIE STEHT NUR DA, WENN ES ETWAS ZU SAGEN GIBT. Der Lauf faehrt bei JEDEM
   Start; nach dem ersten Durchgang findet er nichts mehr und meldet
   „0 nachgezogen". Eine Zeile darueber staende von da an fuer immer in der
   Karte und erklaerte einen Vorgang, den niemand angestossen hat. */
function geometrieZeile(g) {
  if (!g) return '';
  if (g.laeuft)
    return `<p class="hint hint-sm" style="margin:8px 2px 0" id="geo-lauf">Vorschaubilder ` +
           `werden nachgezogen — ${g.erledigt} von ${g.gesamt} …</p>`;
  if (!g.nachgezogen && !g.uebersprungen) return '';
  return `<p class="hint hint-sm" style="margin:8px 2px 0" id="geo-lauf">Vorschaubilder ` +
         `nachgezogen: ${g.nachgezogen} von ${g.geprueft} geprüften` +
         (g.uebersprungen ? `, ${g.uebersprungen} übersprungen` : '') +
         (g.zugenommen > 0 ? ` — ${fmtBytes(g.zugenommen)} mehr` : '') + `.</p>`;
}

/* ---- Karte „Kennzahlen" — Abschnitt „Datenbank" ----
   OHNE BEHANDLER, WIEDER. In 0.19.0 trug sie einen -- der Schalter und der
   Knopf der Bildablage sassen darin. Sie sind in 0.19.1 in eine eigene Karte
   gezogen (siehe karteBildablage()), und was hier bleibt, sind Zahlen. Eine
   leere ausruesten-Funktion daneben waere eine Zeile, die behauptet, es gaebe
   hier etwas zu tun. */
function karteKennzahlen(geholt) {
  const { stats } = geholt;
  return `<div class="sys-card">
        <h3>Kennzahlen</h3>
        <p class="desc">Umfang des Bestands, Belegung der Datenbank, Version und Fingerprint
          der laufenden Dateien — und ganz unten die Verfahren, mit denen gearbeitet wird.</p>
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
        ${/* Kommentarbilder standen bisher in keiner Zeile, obwohl sie als Blob
             in derselben Datei liegen wie Fotos und Anhaenge. Wer sich fragt,
             wovon die Datenbank so gross ist, soll die Antwort vollstaendig
             finden und nicht bei einem Rest stehenbleiben. */''}
        <div class="kv"><span class="k">Kommentarbilder</span><span class="v">${stats.commentImageCount || 0} · ${fmtBytes(stats.commentImageBytes)}</span></div>
        <div class="kv"><span class="k">Papierkorb</span><span class="v">${stats.papierkorbCount || 0} · ${fmtBytes(stats.papierkorbBytes)}</span></div>
        <div class="kv"><span class="k">Datenbank</span><span class="v">${fmtBytes(stats.dbBytes)}</span></div>
        ${/* DIE ZWEITE GROESSENANGABE, und sie beantwortet eine andere Frage als
             die Zeile darueber. Die Datenbankgroesse sagt, wie viel Platz die
             Instanz auf der Platte braucht; sie traegt Indizes, das
             Sicherheitsprotokoll und freie Seiten aus Geloeschtem. Die
             Exportgroesse sagt, wie gross die Datei wird, die das Haus
             verlaesst -- Base64 statt Bytes, dafuer ohne alles, was nicht
             mitgeht. Die beiden Zahlen sind darum verschieden, und dass die
             obere die untere ueberschreiten kann, ist kein Fehler.
             ALLES EINGERECHNET: Fotos, Videos, Dateien, Kommentarbilder. Am
             Knopf steht darunter, was die eingeschalteten Schalter davon
             wirklich mitnehmen. */''}
        ${exportGesamt(stats) ? `<div class="kv"><span class="k">Export, alles</span><span class="v">≈ ${fmtBytes(exportGesamt(stats))}</span></div>` : ''}
        ${/* Der Fingerprint beantwortet, was die Versionsnummer nicht kann: ob die
             Dateien, die hier laufen, WIRKLICH zusammengehoeren. Nach dem
             Einspielen wird er gegen die Zeile im Aenderungsprotokoll
             gehalten -- stimmt er nicht, ist ein Dateisatz halb eingespielt. */''}
        ${/* DIE VERSION STAND IN DER ANTWORT SCHON IMMER, gezeigt hat die Karte
             sie nie -- sie lief nur in die Fusszeile. Sie gehoert neben den
             Fingerprint: die Version sagt, WELCHER Stand laufen SOLL, der
             Fingerprint, ob die Dateien dazu wirklich zusammengehoeren. Wer
             nach dem Einspielen nachsieht, braucht beide, und zwar
             nebeneinander. */''}
        <div class="kv"><span class="k">Version</span><span class="v">${esc(stats.version || '—')}</span></div>
        <div class="kv"><span class="k">Fingerprint</span><span class="v"><code>${esc(stats.fingerprint || '—')}</code></span></div>
        <div style="margin-top:14px">${stats.keyFromEnv
          ? `<div class="ok-box">Der Schlüssel kommt aus der Umgebung. Denk daran: <strong>.env und data/ nicht in dieselbe Sicherung legen</strong> — und ohne den Schlüssel sind die Daten unwiederbringlich verloren.</div>`
          : `<div class="warn-box"><strong>Der Schlüssel liegt neben der Datenbank</strong> (data/encryption.key). Wer das Verzeichnis kopiert, kann alles lesen.
              <p style="margin:9px 0 6px">Für echten Schutz <strong>diesen</strong> Wert in die <code>.env</code> eintragen — keinen neuen erzeugen, sonst sind die vorhandenen Daten nicht mehr lesbar:</p>
              <code class="keyline" id="keyline">ENCRYPTION_KEY=${esc(stats.keyHex || '')}</code>
              <p style="margin:8px 0 0">Danach <code>docker compose up -d</code> und im Protokoll „Schlüssel aus ENCRYPTION_KEY geladen" prüfen — <strong>erst dann</strong> <code>data/encryption.key</code> entfernen.</p>
            </div>`}
        </div>
        ${/* ---- DIE VERFAHREN ----
             AUS DEM BETRIEB: „was benutzt ihr eigentlich?" Die Antwort stand
             im Quelltext und sonst nirgends. Sie gehoert hierher, denn wer
             eine Instanz selbst betreibt, traegt auch die Entscheidung, ob ihm
             die Verfahren genuegen.
             VERFAHREN JA, PAKETVERSIONEN NEIN. Ein Verfahrensname sagt, WIE
             gerechnet wird; eine Bibliotheksversion sagt, WELCHE Luecke passt.
             Version und Fingerprint darueber sagen nichts ueber eine fremde
             Bibliothek und bleiben, wo sie sind.
             DIESE BEGRUENDUNG STAND BIS 0.17.0 AUCH IN DER KARTE, als Satz
             unter den vier Zeilen. Sie steht jetzt nur noch hier und in der
             README: eine Oberflaeche sagt, WAS IST, nicht, warum es so gebaut
             wurde (Projektstand 5.6). Die REGEL gilt unveraendert -- was hier
             faellt, ist der Satz, nicht der Vorbehalt.
             GELESEN UND NICHT BEHAUPTET: die Zeilen kommen aus db.js, das die
             geoeffnete Datei selbst fragt. Eine Kopie hier liefe beim naechsten
             Wechsel auseinander. */''}
        ${stats.verfahren ? `<div class="sys-teil"></div>
        <h4 class="sys-unter">Verfahren</h4>
        ${/* SIE HEISST „Verschlüsselung" UND NICHT „Datenbank": eine Zeile mit
             dieser Beschriftung steht in derselben Karte schon — die
             Belegung auf der Platte. Zwei Zeilen mit demselben Wort in einer
             Karte sind eine zu viel, und beim Ablesen greift man die
             falsche. */''}
        <div class="kv"><span class="k">Verschlüsselung</span><span class="v">${esc(stats.verfahren.cipher || '—')}</span></div>
        <div class="kv"><span class="k">Schlüssel</span><span class="v">${
          stats.verfahren.schluesselBits ? `${stats.verfahren.schluesselBits} Bit roh` : '—'}</span></div>
        <div class="kv"><span class="k">Journal</span><span class="v">${esc(stats.verfahren.journal || '—')}</span></div>
        <div class="kv"><span class="k">Passwörter</span><span class="v">${esc(stats.verfahren.passwoerter || '—')}</span></div>
        <p class="desc" style="margin:10px 0 0">Der Schlüssel geht <strong>roh</strong> in die
          Datenbank (<code>PRAGMA key = x'…'</code>) — ohne Ableitung, weil er kein Passwort ist,
          sondern schon 256 Zufallsbits trägt.</p>` : ''}
      </div>`;
}

/* ---- Karte „Bildablage" — Abschnitt „Datenbank" ----
   SIE HAT DIE KARTE „Kennzahlen" VERLASSEN, und der Grund ist gewachsen und
   nicht erfunden. In 0.19.0 stand hier ausdruecklich „es bleibt bei achtzehn
   Karten", und der Abschnitt war zwei Zeilen und ein Schalter gross. Inzwischen
   traegt er zwei bis fuenf Formatzeilen, einen Schalter mit Erlaeuterung, einen
   Knopf, eine Fortschrittszeile und eine Meldung -- DIE KARTE WAR ZU GROSS
   GEWORDEN, und das ist im Feld aufgefallen. Damit sind es NEUNZEHN Karten.

   ES IST KEINE NEUE FUNKTION: dieselben Zahlen, derselbe Schalter, derselbe
   Knopf, nur an einem eigenen Platz. Deshalb bleibt die Nummer dieser Runde
   ein PATCH.

   SIE STEHT NEBEN „Kennzahlen" IM ABSCHNITT „Datenbank" -- die Aufstellung
   sagt, wovon die Datenbank so gross ist, und der Knopf daneben sagt, ob er
   noch etwas zu tun hat.

   SICHTBAR FUER JEDEN ADMIN, wie „Kennzahlen": die Zahlen sind eine Auskunft
   ueber den Bestand. DIE BEIDEN BEDIENELEMENTE STEHEN HINTER EIGENTUEMER --
   der Schalter bestimmt, wie die ganze Installation ablegt, und der Server
   weist einen Admin ohne diese Rolle ohnehin ab.

   DIE ZEILE FUER JEDES FORMAT NUR, WENN ES DAS FORMAT GIBT. Eine Installation
   ohne ein einziges GIF soll keine GIF-Zeile mit einer Null tragen -- eine
   Null ist eine Aussage, und sie lenkt von den Zahlen ab, um die es geht.
   LIEGT UEBERHAUPT KEIN BILD DA, sagt die Karte GENAU DAS und verschwindet
   nicht: eine Karte, die je nach Bestand da ist oder nicht, liesse den
   Systembereich unter der Hand die Gestalt wechseln. */
function karteBildablage(geholt) {
  const stats = geholt.stats || {};
  const bf = stats.bildFormate || {};
  const zeilen = BILDFORMATE.filter(f => bf[f.schluessel] && bf[f.schluessel].anzahl);
  const png = bf.png ? bf.png.anzahl : 0;
  // Solange einer laeuft, ist der Knopf tot: der Server sagt dem zweiten Ruf
  // ohnehin ab, und ein Knopf, der zuverlaessig eine Absage erzeugt, sieht aus
  // wie ein Fehler.
  const laeuft = !!(stats.umstellung && stats.umstellung.laeuft);
  return `<div class="sys-card">
        <h3>Bildablage</h3>
        <p class="desc">Die <strong>Originale</strong> der Fotos am
          ${esc(V.sacheEinzahl)}, nach Format. Die beiden Ableitungen sind immer JPEG und
          stehen hier nicht: die kleine misst 512 px auf der <em>kurzen</em> Kante, weil die
          Kachel quadratisch zuschneidet, die große 1600 px auf der <em>langen</em>.</p>
        ${zeilen.length ? zeilen.map(f => {
          const z = bf[f.schluessel];
          return `<div class="kv"><span class="k">${f.name}${
            f.hinweis ? ` <span class="zusatz">— ${f.hinweis}</span>` : ''
          }</span><span class="v">${z.anzahl} · ${fmtBytes(z.bytes)}</span></div>`;
        }).join('') : `<p class="hint hint-sm" style="margin:2px 2px 0">Es liegt noch kein Foto am
          ${esc(V.sacheEinzahl)}.</p>`}
        ${EIGENTUEMER ? `
        <label class="ex-files" style="margin-top:10px"><input type="checkbox" id="bild-umwandeln">
          PNG-Originale beim Hereinkommen umwandeln</label>
        ${/* WAS DER SCHALTER TUT, UND WAS ER NICHT TUT. Der Satz nennt beides:
             ein eingefügtes Bildschirmfoto liegt danach als WebP da, und die
             Güte bleibt dabei erhalten. Ohne Häkchen bleibt jedes PNG
             byte-genau, wie es hereinkam. */''}
        <p class="hint hint-sm" style="margin:6px 2px 0">Ein mit Strg+V eingefügtes
          Bildschirmfoto kommt als PNG herein und wird als WebP abgelegt — rund zwei Drittel
          kleiner, ohne sichtbaren Verlust. JPEG, GIF und vorhandenes WebP bleiben unberührt.
          Ohne Häkchen bleibt jedes PNG byte-genau so liegen, wie es ankam.</p>
        <div class="row-in" style="margin-top:10px">
          <button class="btn btn-sm" id="bild-um"${png && !laeuft ? '' : ' disabled'}>Alle PNG nach WebP umstellen</button>
        </div>
        ${png || laeuft ? '' : `<p class="hint hint-sm" style="margin:6px 2px 0">Es liegt kein PNG-Original mehr da.</p>`}
        ${umstellungsZeile(stats.umstellung)}
        ${geometrieZeile(stats.geometrie)}` : ''}
      </div>`;
}


/* WAS DIE UHR VERFOLGEN KANN -- eine Tafel und keine zweite Uhr.
   SEIT 0.19.4 GIBT ES ZWEI LAEUFE, UND SIE KOENNEN SICH UEBERSCHNEIDEN: das
   Nachziehen faengt 1500 ms nach dem Start an, und wer in genau diesem
   Augenblick den Umstellungsknopf drueckt, hat beide. Eine zweite Uhr fragte
   /api/stats ein zweites Mal ab -- genau die Selbstblockade, die 0.19.1
   gemessen hat.
   JEDE ZEILE HAT IHREN EIGENEN SATZ, weil die beiden Laeufe verschiedene
   Dinge zaehlen. Was sie teilen, ist der Takt und die Abfrage. */
const BESTANDSLAEUFE = [
  { feld: 'umstellung', id: 'bild-lauf',
    text: (u) => `Umstellung läuft — ${u.erledigt} von ${u.gesamt} …`,
    fertig: 'Die Bildumstellung ist fertig' },
  { feld: 'geometrie', id: 'geo-lauf',
    text: (g) => `Vorschaubilder werden nachgezogen — ${g.erledigt} von ${g.gesamt} …`,
    fertig: 'Die Vorschaubilder sind nachgezogen' }
];

/* DIE UHR, DIE DEN LAEUFEN ZUSIEHT. Sie steht ausserhalb der Karte, weil es
   genau EINE geben darf: zwei Uhren auf denselben Lauf fragten doppelt und
   meldeten unabhaengig voneinander „fertig".
   UND SIE HAELT AN, SOBALD KEINE ZEILE MEHR DASTEHT. Ohne diese Frage
   liefe sie als herrenlose Zusage weiter, auch wenn der Systembereich laengst
   verlassen ist (Stolperstein 118).
   GEMELDET WIRD NUR, WAS DIESE UHR HAT LAUFEN SEHEN. `unterwegs` sammelt die
   Laeufe, die sie waehrend ihrer Lebenszeit als laufend gesehen hat; nur
   deren Ende ist eine Nachricht wert. Ohne diese Merkliste truege ein Lauf,
   der schon vor dem Oeffnen der Karte fertig war, bei jedem Takt seine
   Fertigmeldung — er steht ja mit `laeuft: false` in der Antwort. */
let bestandsUhr = null;
function verfolgeBestandslauf() {
  if (bestandsUhr) return;
  const unterwegs = new Set();
  const halt = () => { clearInterval(bestandsUhr); bestandsUhr = null; };
  bestandsUhr = setInterval(async () => {
    if (!BESTANDSLAEUFE.some(l => document.getElementById(l.id))) return halt();
    let s;
    // Ein Fehlschlag haelt an, statt im Sekundentakt weiterzufragen: wer die
    // Sitzung verloren hat, bekommt sonst eine Meldung je Umlauf.
    try { s = await api('GET', '/api/stats'); } catch { return halt(); }
    const fertig = [];
    for (const l of BESTANDSLAEUFE) {
      const zeile = document.getElementById(l.id), stand = s[l.feld];
      if (!zeile || !stand) continue;
      if (stand.laeuft) { zeile.textContent = l.text(stand); unterwegs.add(l.feld); }
      else if (unterwegs.delete(l.feld)) fertig.push(l.fertig);
    }
    if (unterwegs.size) return;
    halt();
    /* FERTIG HEISST: DIE GANZE KARTE NEU. Die Aufstellung nach Format ist
       jetzt eine andere, und nur die Fortschrittszeile nachzuziehen hiesse,
       zwei Staende nebeneinander stehen zu lassen -- unten „fertig", darueber
       die alte PNG-Zahl. */
    for (const t of fertig) toast(t);
    if (fertig.length) renderSystem();
  }, 1500);
}

function ruesteBildablageAus(geholt) {
  /* DERSELBE HELFER WIE BEI DEN BEIDEN ANLEGEN-SCHALTERN. Er nimmt die
     Stellung bei einem Fehlschlag zurueck -- sonst zeigte der Bildschirm
     etwas anderes an, als der Server haelt. */
  anlegeSchalter('bild-umwandeln', 'bilderUmwandeln',
    () => BILDER_UMWANDELN, v => { BILDER_UMWANDELN = v; });

  amElement('bild-um', (knopf) => {
    knopf.onclick = async () => {
      const bf = (geholt.stats && geholt.stats.bildFormate) || {};
      const png = bf.png || { anzahl: 0, bytes: 0 };
      /* DER DIALOG SAGT ES VORHER UND BESCHOENIGT NICHTS: wie viele Bilder,
         wie viel Platz, dass die PNG-Fassung danach nicht mehr da ist, und
         dass die Sicherung des Datenverzeichnisses die einzige Rueckfahrkarte
         ist. „Unwiderruflich" ist hier richtig und nicht wie beim Loeschen
         falsch -- fuer Bildbytes gibt es keinen Papierkorb.
         ER STEHT IM BESTAETIGUNGSFENSTER und nicht als eigener Dialog davor:
         zwei Fenster hintereinander liest niemand, und das zweite traegt
         ohnehin die schwerere Frage. */
      /* DER DIALOG SAGT DREI DINGE UND SONST NICHTS: was geschieht, was danach
         weg ist, und dass es dauern kann. ER IST IN 0.19.1 GEKUERZT WORDEN --
         die erste Fassung sagte dasselbe zweimal („nahezu verlustfrei" und
         „die Bilder bleiben, wie sie aussehen") und erklaerte nebenher, WOHER
         die fehlende Zeitangabe kommt. Ein Dialog wird gelesen, bevor jemand
         etwas Unwiderrufliches tut; jeder Satz, den er zu viel traegt, kostet
         die Aufmerksamkeit fuer die uebrigen.
         UND WIE LANGE ES DAUERT, STEHT OHNE ZAHL DA. Der Server kennt sie
         nicht: gemessen 394 ms je Bild auf der Maschine, an der das
         nachgefahren wurde, gegen 5,3 s je Bild im Feld -- FAKTOR DREIZEHN.
         Eine Schaetzung waere auf der einen Maschine beruhigend falsch und auf
         der anderen erschreckend falsch. Fehlt eine Zahl, steht das
         ausdruecklich da (Stolperstein 252).
         KEINE RESTLAUFZEIT IN DER FORTSCHRITTSZEILE, aus demselben Grund: sie
         waere aus dem gemessenen Takt zwar ehrlich zu rechnen, aber sie kostet
         eine Anzeige, die bei jedem Umlauf springt. */
      const ok = await zweiteBestaetigung('bilder', null, 'Bildablage umstellen',
        `${png.anzahl} PNG-Original${png.anzahl === 1 ? '' : 'e'} ` +
        `(${fmtBytes(png.bytes)}) ${png.anzahl === 1 ? 'wird' : 'werden'} nahezu verlustfrei ` +
        `zu WebP umgewandelt und ersetzt — erwartet rund ` +
        `${fmtBytes(Math.round(png.bytes * 0.37))}. Zurück führt nur eine Sicherung des ` +
        `Datenverzeichnisses, die vorher angelegt wurde. ` +
        `Wie lange das dauert, lässt sich nicht vorhersagen — plane ein Zeitfenster ein, ` +
        `das den Betrieb am wenigsten stört (je nach Größe des Bestands bis zu Stunden).`);
      if (!ok) return;
      try { await api('POST', '/api/bilder/umstellen', {}); }
      catch (e) { return toast(e.message, true); }
      /* NEU ZEICHNEN STATT DIE ZEILE VON HAND EINZUSETZEN: die Antwort auf
         /api/stats traegt den Lauf jetzt, die Karte baut sich daraus auf, und
         ruesteKennzahlenAus() haengt die Uhr gleich unten selbst an. Ein
         zweiter Weg, dieselbe Zeile zu erzeugen, liefe frueher oder spaeter
         von der Karte weg. */
      renderSystem();
    };
  });

  // Laeuft beim Oeffnen der Karte schon einer -- weil jemand sie neu geladen
  // hat, von woanders zurueckkommt oder der Server gerade erst angefangen hat
  // --, wird weitergezaehlt. Seit 0.19.4 gilt das fuer beide Laeufe.
  if (geholt.stats && BESTANDSLAEUFE.some(l => geholt.stats[l.feld] && geholt.stats[l.feld].laeuft))
    verfolgeBestandslauf();
}


/* ---- Karte „Sicherung" — Abschnitt „Datenbank" ---- */
function karteSicherung() {
  return `<div class="sys-card">
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
      </div>`;
}
function ruesteSicherungAus(geholt) {
  drawSicherung(geholt);
}

  /* --- Sicherung --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde; nach jedem Schreiben
     traegt die Antwort den neuen Stand, und die Karte zeichnet sich daraus neu.
     JEDE LESESTELLE IST ABGEFANGEN: fehlt ein Feld, soll die Karte etwas sagen
     und nicht der Lauf abreissen. */
  function drawSicherung(geholt) {
    const box = document.getElementById('sicherung-box');
    if (!box) return;
    const d = geholt.sicherung || {};
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

    /* ZWEI SCHLUESSEL IM UMLAUF — . Wurde der Schlüssel gewechselt,
       öffnen sich die Kopien von vorher nur noch mit dem ALTEN. Sie sind nicht
       kaputt; sie brauchen einen anderen Schlüssel als die laufende Instanz.
       DER KASTEN STEHT NUR DA, WENN ER ETWAS ZU SAGEN HAT: ohne Wechsel gibt
       es keine zwei Schlüssel, und eine Warnung, die immer dasteht, liest
       niemand mehr.
       DIE SCHÄRFSTE LAGE BEKOMMT DEN SCHÄRFSTEN SATZ: ist auch die JÜNGSTE
       Kopie älter als der Wechsel, gibt es überhaupt keine, die zur laufenden
       Instanz passt. Das ist etwas anderes als „ein paar alte liegen daneben".
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
             Installation gehört.</div>`
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
        Installation still</strong> — bei ${fmtBytes(d.dbBytes)} sind das etwa
        ${d.dauerSekunden} Sekunden.</p>
      <button class="btn btn-accent btn-sm" id="sich-los">Jetzt sichern</button>`;

    document.getElementById('sich-ort-save').onclick = async () => {
      const wert = document.getElementById('sich-ort').value;
      try {
        const r = await api('PUT', '/api/sicherung/ort', { ort: wert });
        // gewechseltAm und veraltet wandern MIT: ohne sie verschwaende der
        // Kasten ueber die alten Sicherungen beim ersten Speichern des
        // Zielorts, und die Karte saehe danach harmloser aus als die Lage ist.
        geholt.sicherung = { ...geholt.sicherung, ort: r.ort, pfad: r.pfad, fehler: null,
                      erreichbar: r.erreichbar, letzte: r.letzte, zahl: r.zahl,
                      gewechseltAm: r.gewechseltAm, veraltet: r.veraltet };
        toast('Zielort gespeichert');
        drawSicherung(geholt);
      } catch (e) { toast(e.message, true); }
    };
    /* Der Knopf sperrt sich selbst, solange die Kopie entsteht: VACUUM INTO
       laeuft synchron, die Instanz steht so lange still, und ein zweiter Klick
       stellte sich nur in die Schlange. */
    document.getElementById('sich-los').onclick = async (e) => {
      const knopf = e.currentTarget;
      knopf.disabled = true;
      knopf.textContent = 'Sicherung läuft …';
      try {
        const r = await api('POST', '/api/sicherung');
        geholt.sicherung = { ...geholt.sicherung, erreichbar: r.erreichbar, letzte: r.letzte, zahl: r.zahl,
                      gewechseltAm: r.gewechseltAm, veraltet: r.veraltet };
        toast(`Sicherung geschrieben: ${r.datei} (${fmtBytes(r.bytes)})`);
        drawSicherung(geholt);
      } catch (err) {
        toast(err.message, true);
        knopf.disabled = false;
        knopf.textContent = 'Jetzt sichern';
      }
    };
  }


/* ---- Karte „Export und Import" — Abschnitt „Datenbank" ---- */
function karteExport(geholt) {
  const { stats } = geholt;
  return `<div class="sys-card">
        <h3>Export und Import</h3>
        ${/* DIE ROLLENTEILUNG GEHOERT AN DIE KARTE, nicht nur in die Doku. Wer
             Export und Sicherung nebeneinander sieht, muss ohne Rueckfrage
             wissen, welche er will. Ein Satz je Karte, und er steht hier. */''}
        <p class="desc"><strong>Der Austauschweg</strong> — für Umzug, Archiv und die Weitergabe:
          die Datei überlebt einen Formatwechsel und braucht keinen Schlüssel. Für den Notfall
          ist die Karte <strong>Sicherung</strong> zuständig.</p>
        <p class="desc">Schreibt den gesamten Bestand in eine Datei. Mit Fotos wird sie deutlich
          größer, weil Bilder als Text kodiert werden müssen — rechne mit rund einem Drittel
          Aufschlag auf ${fmtBytes(stats.photoBytes)}.</p>
        ${/* DIE ZAHLEN AN DEN KNOEPFEN SIND LEBENDIG. Sie standen bisher fest im
             Text und rechneten dabei jede fuer sich -- die Haekchen darunter
             aenderten die Datei, aber keine Zahl. Wer beide Haekchen setzte,
             fand nirgends, was dabei herauskommt.
             GERECHNET WIRD AN EINER STELLE, in exportSumme(); die Warnung
             darunter liest dieselbe Zahl. Zwei Rechenwege naennten frueher oder
             spaeter zwei Groessen fuer dieselbe Datei. */''}
        <div class="row-in">
          <button class="btn btn-accent btn-sm" id="ex-yes">Mit Fotos (~<span id="ex-gr-yes">…</span>)</button>
          <button class="btn btn-sm" id="ex-no">Ohne Fotos (~<span id="ex-gr-no">…</span>)</button>
        </div>
        <label class="ex-files"><input type="checkbox" id="ex-files">
          Angehängte Dateien mitnehmen (+${fmtBytes((stats.export?.anhaenge || 0) + (stats.export?.kommentarbilder || 0))})</label>
        ${/* Eigener Schalter, Vorgabe aus. Ohne ihn bleibt der Platz des Videos
             in der Datei vermerkt, die Datei selbst fehlt -- der Import sagt
             dann, wie viele es waren. Stand ein Video an erster Stelle, wird
             danach das naechste Foto zum Hauptbild. */''}
        <label class="ex-files"><input type="checkbox" id="ex-videos">
          Videos mitnehmen (+${fmtBytes(stats.export?.videos || 0)})</label>
        ${stats.videoCount ? `<p class="hint hint-sm" style="margin:6px 2px 0">
          Ohne Häkchen bleiben die Videos zurück; die Einträge nennen sie, die Dateien fehlen.</p>` : ''}
        ${/* DER HINWEIS STEHT VOR DEM KNOPF UND NICHT HINTER DEM ABBRUCH. Ein
             Export, der nach zwei Minuten mit einem Speicherfehler aufgibt,
             sieht aus wie ein kaputtes Programm; er ist aber eine erreichte
             Grenze, und der Unterschied liegt allein darin, ob die Instanz es
             vorher sagt.
             GEWARNT WIRD, VERWEIGERT NICHT. Die Zahl ist eine Schaetzung, und
             eine Schaetzung darf niemandem den Export wegnehmen, dessen Datei
             am Ende doch gepasst haette. Wer die Grenze wirklich reisst,
             bekommt sie von der Route gesagt -- mit derselben Rechnung. */''}
        <div id="ex-warn"></div>
        ${/* DER WEG, WENN DIE EINE DATEI NICHT GEHT. Er steht IMMER da und
             nicht erst hinter der Warnung: wer seine Teile auf einen
             Datentraeger bringen oder durch eine Hochladegrenze schieben will,
             braucht sie auch unterhalb des Schwellwerts.
             DIE TEILGROESSE IST WAEHLBAR, NACH OBEN ABER GEDECKELT: oberhalb
             des Warnwerts baute die Instanz Teile, vor denen sie im selben
             Atemzug warnt. */''}
        <div class="ex-teile">
          <div class="row-in" style="align-items:baseline">
            <button class="btn btn-sm" id="ex-plan">In Teilen exportieren</button>
            <label class="hint hint-sm" style="display:flex;align-items:baseline;gap:6px">
              höchstens
              <select class="input input-sm" id="ex-ziel" style="width:auto">
                <option value="52428800">50 MB</option>
                <option value="104857600">100 MB</option>
                <option value="209715200">200 MB</option>
                <option value="314572800" selected>300 MB</option>
              </select>
              je Datei
            </label>
          </div>
          <div id="ex-plan-out"></div>
        </div>
        ${/* ---- DER IMPORT STEHT IN DERSELBEN KARTE UND EINE STUFE TIEFER ----
             ZUSAMMENGELEGT, WEIL SIE DASSELBE MEINEN: die eine Datei geht
             hinaus, dieselbe Datei kommt herein. Getrennt standen sie als
             Karte 6 und 7 nebeneinander, und wer die eine suchte, las erst
             die andere.
             ABER NICHT GLEICHRANGIG. Der Export LIEST, der Import ERSETZT
             BESTAND -- die zerstoerende Haelfte darf durch das Zusammenlegen
             nicht einen Klick naeher ruecken. Sie steht deshalb unter einem
             Trennstrich, mit eigener, kleinerer Ueberschrift und in der
             leisen Bauform des Ablagefeldes. Die zweite Bestaetigung bleibt,
             wo sie war: in askImport(). */''}
        <div class="sys-teil"></div>
        <h4 class="sys-unter">Import</h4>
        <p class="desc">Spielt eine zuvor erzeugte Exportdatei wieder ein. <strong>Der Export
          liest, der Import schreibt</strong> — je nach Betriebsart führt er zusammen oder
          <strong>ersetzt den vorhandenen Bestand</strong>. Gefragt wird vor dem Start, und
          danach ein zweites Mal nach dem Passwort.</p>
        <label class="drop drop-leise" id="imp-drop"><input type="file" id="imp" accept="application/json,.json">
          Exportdatei auswählen</label>
      </div>`;
}
function ruesteExportAus(geholt) {
  amElement('ex-yes', b => b.onclick = () => exportLos(true));
  amElement('ex-no', b => b.onclick = () => exportLos(false));
  for (const id of ['ex-files', 'ex-videos'])
    amElement(id, e => e.addEventListener('change', () => exportZahlen(geholt)));
  exportZahlen(geholt);
  amElement('ex-plan', b => b.onclick = zeichneTeilplan);
  // Aendert sich ein Schalter oder die Teilgroesse, gilt der gezeichnete Plan
  // nicht mehr -- ein stehengebliebener Plan naennte falsche Grenzen.
  for (const id of ['ex-files', 'ex-videos', 'ex-ziel'])
    amElement(id, e => e.addEventListener('change', () => {
      const kasten = document.getElementById('ex-plan-out');
      if (kasten) kasten.innerHTML = '';
    }));
  amElement('imp', imp => imp.onchange = e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) askImport(file, geholt.stats && geholt.stats.export);
  });
}

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

  /* DIE GROESSEN AN DEN KNOEPFEN, und sie folgen den Haekchen. Gerufen wird
     einmal beim Zeichnen und danach bei jeder Aenderung -- eine Zahl, die nur
     beim Aufbau stimmt, ist schlimmer als keine.
     GEWARNT WIRD FUER DIE ZAHL, DIE GROESSER IST: die beiden Knoepfe stehen
     nebeneinander, und ein Hinweis, der nur fuer einen von ihnen gilt, muss
     sagen, fuer welchen. Deshalb nennt er den Fall beim Namen. */
  function exportZahlen(geholt) {
    /* `stats` bleibt null, wer nicht Admin ist. Die Karte steht zwar hinter
       dem Eigentuemer und der ist immer auch Admin -- aber die Rollenleiter
       ist eine Annahme ueber eine ANDERE Stelle, und diese Zeile traegt sie
       nicht. */
    const ex = geholt.stats && geholt.stats.export;
    if (!ex) return;
    const schalter = {
      mitDateien: !!document.getElementById('ex-files')?.checked,
      mitVideos: !!document.getElementById('ex-videos')?.checked
    };
    const mit = exportSumme(ex, { ...schalter, mitFotos: true });
    const ohne = exportSumme(ex, { ...schalter, mitFotos: false });
    amElement('ex-gr-yes', e => e.textContent = fmtBytes(mit));
    amElement('ex-gr-no', e => e.textContent = fmtBytes(ohne));
    amElement('ex-warn', kasten => {
      if (mit <= ex.warnAb) { kasten.innerHTML = ''; return; }
      // „Auch ohne Fotos" ist der schlimmere Fall und gehoert deshalb gesagt:
      // wer ihn hat, kommt mit dem zweiten Knopf nicht davon.
      const auchOhne = ohne > ex.warnAb;
      kasten.innerHTML = `<div class="warn-box" style="margin:12px 0 0">
        <strong>Export mit Fotos: rund ${esc(fmtBytes(mit))}.</strong>
        Eine Exportdatei ist ein einziger Text, und der kann nicht größer als
        ${esc(fmtBytes(ex.string))} werden — ${auchOhne
          ? `auch ohne Fotos bleiben noch rund ${esc(fmtBytes(ohne))}.`
          : `ohne Fotos bleiben rund ${esc(fmtBytes(ohne))}.`}
        <p style="margin:9px 0 0"><strong>Der Weg dafür steht darunter: „In Teilen
        exportieren".</strong> Jeder Teil ist eine vollständige Exportdatei, und der Import
        nimmt sie mit „Zusammenführen" wieder auf. Für eine Kopie zum Zurückspielen ist
        die Karte <strong>Sicherung</strong> der kürzere Weg.</p>
        <p style="margin:9px 0 0"><strong>Der Knopf oben bleibt trotzdem</strong> — die Zahl
        ist eine Schätzung, und wer weiß, was er tut, soll es versuchen dürfen.</p></div>`;
    });
  }

  /* ---- Der Export in Teilen ----
     JEDER TEIL IST EINE VOLLSTAENDIGE EXPORTDATEI. Der Import nimmt sie mit
     „Zusammenführen" wieder auf, ohne dass an ihm eine Zeile geaendert wurde --
     genau deshalb gibt es hier kein neues Format und keinen zweiten Leser.
     GESCHNITTEN WIRD AM SERVER und nicht hier: dort liegen die Groessen, und
     eine zweite Rechnung in der Oberflaeche liefe irgendwann auseinander. */
  const teilSchalter = () => `photos=1` + mitDateien();
  async function zeichneTeilplan() {
    const kasten = document.getElementById('ex-plan-out');
    if (!kasten) return;
    const ziel = document.getElementById('ex-ziel')?.value || '';
    kasten.innerHTML = `<p class="hint hint-sm" style="margin:10px 2px 0">Wird gerechnet …</p>`;
    let plan;
    try { plan = await api('GET', `/api/export/plan?${teilSchalter()}&ziel=${encodeURIComponent(ziel)}`); }
    catch (e) { kasten.innerHTML = `<p class="hint hint-sm">${esc(e.message)}</p>`; return; }

    const n = (plan.teile || []).length;
    if (!n && !(plan.zuGross || []).length) {
      kasten.innerHTML = `<p class="hint hint-sm" style="margin:10px 2px 0">Es gibt nichts zu exportieren.</p>`;
      return;
    }
    /* EIN EINTRAG, DER FUER SICH ALLEIN ZU GROSS IST, WIRD BEIM NAMEN GENANNT
       und nicht stillschweigend uebergangen. Ein stiller Verlust waere der
       schlimmere Ausgang -- wer ihn sieht, weiss, dass er die Videos abwaehlen
       oder diesen einen Eintrag von Hand behandeln muss. */
    const zuGross = (plan.zuGross || []).length ? `<div class="warn-box" style="margin:10px 0 0">
      <strong>${plan.zuGross.length} ${plan.zuGross.length === 1 ? esc(V.sacheEinzahl) : esc(V.sacheMehrzahl)}
      ${plan.zuGross.length === 1 ? 'passt' : 'passen'} in keinen Teil</strong> — schon für sich allein
      über der Grenze von ${esc(fmtBytes(plan.string))}. Sie fehlen in jeder Datei:
      <ul style="margin:6px 0 0 18px">${plan.zuGross.map(z =>
        `<li>${esc(z.titel)} — ${esc(fmtBytes(z.bytes))}</li>`).join('')}</ul>
      <p style="margin:8px 0 0">Ohne das Häkchen an den Videos werden sie meist klein genug.</p></div>` : '';

    kasten.innerHTML = `${zuGross}
      ${n ? `<p class="desc" style="margin:10px 0 6px"><strong>${n} ${n === 1 ? 'Teil' : 'Teile'}</strong>,
        je höchstens ${esc(fmtBytes(plan.zielGroesse))}. <strong>Jeder Teil ist eine vollständige
        Exportdatei</strong> — geschnitten wird zwischen ${esc(V.sacheMehrzahl)}, nie mitten hinein.</p>
      <div class="manage-list" id="ex-teil-liste">${plan.teile.map(t => `
        <div class="mrow">
          <span class="mname">Teil ${t.nr} — ${t.anzahl} ${t.anzahl === 1 ? esc(V.sacheEinzahl) : esc(V.sacheMehrzahl)}</span>
          <button class="mact ex-teil-lad" data-nr="${t.nr}" data-von="${t.von}" data-bis="${t.bis}"
            disabled>↓ Laden</button>
          <span class="pk-meta">${esc(fmtBytes(t.bytes))}</span>
        </div>`).join('')}</div>
      ${/* DER KNOPF NENNT DIE HANDLUNG UND NICHT DIE MECHANIK. "Alle n Teile
           freigeben" war das Wort aus dem Maschinenraum -- aus dem Betrieb kam
           die Frage "was ist mit freigeben gemeint?" zurueck. Derselbe Fehler
           wie "Code aus deiner App" in 0.12.3.
           WAS EIN MENSCH WISSEN MUSS, sind zwei Dinge: dass EINMAL gefragt
           wird, und dass er danach JEDEN TEIL SELBST laedt. Beides steht am
           Knopf; der Satz darueber sagt, warum ueberhaupt gefragt wird. */''}
      <p class="hint hint-sm" style="margin:10px 2px 6px">Ein Export nimmt den Bestand
        mit aus dem Haus. Deshalb fragt die Installation einmal nach deinem Passwort${ZWEIFAKTOR
          ? ' und dem Code deines zweiten Faktors' : ''} — danach lädst du jeden Teil selbst.</p>
      <div class="row-in"><button class="btn btn-accent btn-sm" id="ex-frei">
        Einmal bestätigen, dann ${n === 1 ? 'den Teil' : `alle ${n} Teile`} laden</button></div>
      ${/* DER EINSPIELWEG GEHOERT AN DIE KARTE UND NICHT IN DIE DOKUMENTATION.
           Wer fuenf Dateien vor sich hat, muss ohne Nachschlagen wissen, in
           welcher Reihenfolge und mit welchem Knopf sie hineingehen. */''}
      <p class="hint hint-sm" style="margin:10px 2px 0"><strong>Zum Einspielen:</strong>
        Teil 1 mit <strong>Ersetzen</strong>, alle übrigen der Reihe nach mit
        <strong>Zusammenführen</strong>. Nur zum Weitergeben einzelner
        ${esc(V.sacheMehrzahl)} genügt der Teil, der sie enthält.</p>` : ''}`;

    /* GEFRAGT WIRD EINMAL, GEPRUEFT WIRD JE TEIL. Ohne das muesste das Passwort
       je Datei getippt werden -- bei fünf Teilen fünfmal. */
    amElement('ex-frei', b => b.onclick = async () => {
      const ok = await zweiteBestaetigungMehrfach('export', plan.teile.map(t => t.nr),
        'Export bestätigen',
        `Der Export schreibt den gesamten Bestand in ${n} ${n === 1 ? 'Datei' : 'Dateien'}, die das Haus ` +
        `verlassen — mit allen Fotos, allen Anhängen und den Namen aller Verfasser.`);
      if (!ok) return;
      b.disabled = true;
      b.textContent = 'Bestätigt — jetzt jeden Teil laden';
      kasten.querySelectorAll('.ex-teil-lad').forEach(k => { k.disabled = false; });
    });

    /* JEDER KNOPF GILT GENAU EINMAL, weil die Freigabe verbraucht wird. Das
       steht am Knopf und nicht in einer Fehlermeldung danach: ein zweiter
       Klick bekaeme sonst eine 403, die wie ein Fehler aussieht. */
    kasten.querySelectorAll('.ex-teil-lad').forEach(k => {
      k.onclick = () => {
        window.location = `/api/export?${teilSchalter()}` +
          `&von=${k.dataset.von}&bis=${k.dataset.bis}&teil=${k.dataset.nr}&teile=${n}`;
        k.disabled = true;
        k.textContent = '✓ geladen';
      };
    });
  }


/* DER BILLIGERE DER BEIDEN FAELLE: beim Import steht die Groesse VOR dem
   Einlesen fest. Der Export muss sie schaetzen, hier steht sie an der Datei.
   UND SIE GEHOERT VOR DAS EINLESEN, nicht dahinter: readAsText() macht aus
   der Datei EINEN String, und ueber Nodes wie ueber V8s Stringgrenze bricht
   das ab -- der Dialog sagte danach "Die Datei ließ sich nicht als Export
   lesen", und das ist die falsche Auskunft. Sie klingt nach einer kaputten
   Datei; in Wahrheit ist sie zu gross.
   GEWARNT WIRD, VERWEIGERT NICHT -- dieselbe Regel wie am Export. */
async function importGroesseGeprueft(file, grenzen) {
  const warnAb = grenzen && grenzen.warnAb;
  if (!warnAb || file.size <= warnAb) return true;
  const grenze = grenzen.string;
  return confirmBox('Diese Datei ist sehr groß',
    `Die Datei misst ${fmtBytes(file.size)}. Zum Einspielen wird sie als ein einziger Text ` +
    `gelesen, und der kann nicht größer als ${fmtBytes(grenze)} werden — darüber bricht der ` +
    `Import ab, ohne etwas zu ändern. Für eine vollständige Wiederherstellung ist die ` +
    `Sicherung der richtige Weg.`,
    'Trotzdem versuchen');
}

function askImport(file, grenzen) {
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
  // Erst fragen, dann lesen. Andersherum stuende der Browser schon minutenlang
  // an der Datei, bevor die Warnung ueberhaupt erscheinen koennte.
  importGroesseGeprueft(file, grenzen).then(weiter => { if (weiter) reader.readAsText(file); });

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
  /* Der Bestätigungslink der Selbstanmeldung, — an derselben
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
