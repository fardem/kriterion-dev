/* ZERLEGT EINE DATEI IN IHRE ARTEN VON INHALT -- Code, Zeichenkette, Vorlage,
   Kommentar, regulaerer Ausdruck. Der Umbenenner faellt damit nie in einen
   Text; die Probe zaehlt damit die Texte vor und nach dem Umbenennen.

   ES IST KEIN PARSER, und es gibt sich auch nicht dafuer aus: es unterscheidet
   die vier Arten und sonst nichts. Fuer den einen Zweck -- "fass nur Code an"
   -- genuegt das, und die Probe faengt, was es falsch macht. */

const CODE = 'code', TEXT = 'text', KOMMENTAR = 'kommentar', REGEX = 'regex';

// Vor einem regulaeren Ausdruck steht nie ein Wert. Steht dort einer, ist der
// Schraegstrich eine Division.
function wertDavor(code) {
  const t = code.replace(/\s+$/, '');
  if (!t) return false;
  const c = t[t.length - 1];
  if (c === ')' || c === ']' || c === '}') return true;
  if (/[\w$]/.test(c)) {
    const wort = (t.match(/[\w$]+$/) || [''])[0];
    return !['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
      'case', 'do', 'else', 'yield', 'await'].includes(wort);
  }
  return false;
}

/* Die Zerlegung einer JS-Datei. Eine Vorlage (`…${…}…`) wird aufgebrochen:
   ihre festen Stuecke sind Text, ihre Ausdruecke sind Code. */
function zerlegeJs(src) {
  const teile = [];
  let i = 0, kind = CODE, start = 0;
  const stapel = [];               // offene ${…} in Vorlagen
  const schiebe = (bis, a) => { if (bis > start) teile.push({ kind: a, wert: src.slice(start, bis) }); start = bis; };
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      schiebe(i, CODE);
      while (i < src.length && src[i] !== '\n') i++;
      schiebe(i, KOMMENTAR); continue;
    }
    if (c === '/' && d === '*') {
      schiebe(i, CODE); i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i = Math.min(i + 2, src.length);
      schiebe(i, KOMMENTAR); continue;
    }
    if (c === '"' || c === "'") {
      schiebe(i, CODE); const q = c; i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        i++;
      }
      schiebe(i, TEXT); continue;
    }
    if (c === '`') {
      schiebe(i, CODE); i++; stapel.push('vorlage');
      // Der feste Teil bis zum naechsten ${ oder zum Ende
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '`') { i++; stapel.pop(); break; }
        if (src[i] === '$' && src[i + 1] === '{') {
          schiebe(i, TEXT); i += 2; schiebe(i, CODE);
          let tiefe = 1;
          // Der Ausdruck wird rekursiv gelesen: er kann selbst Texte tragen
          const innen = leseAusdruck(src, i, tiefe);
          for (const t of innen.teile) teile.push(t);
          i = innen.ende; start = i;
          continue;
        }
        i++;
      }
      schiebe(i, TEXT); continue;
    }
    if (c === '/' && !wertDavor(src.slice(Math.max(0, start), i))) {
      // Ein regulaerer Ausdruck endet auf derselben Zeile
      let j = i + 1, klasse = false, ok = false;
      while (j < src.length && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') klasse = true;
        else if (src[j] === ']') klasse = false;
        else if (src[j] === '/' && !klasse) { ok = true; break; }
        j++;
      }
      if (ok) {
        schiebe(i, CODE); i = j + 1;
        while (i < src.length && /[a-z]/.test(src[i])) i++;
        schiebe(i, REGEX); continue;
      }
    }
    i++;
  }
  schiebe(src.length, kind);
  return teile;
}

// Der Ausdruck in einer Vorlage. Gibt seine eigenen Teile zurueck.
function leseAusdruck(src, i, tiefe) {
  const anfang = i;
  while (i < src.length && tiefe > 0) {
    const c = src[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '{') { tiefe++; i++; continue; }
    if (c === '}') { tiefe--; if (tiefe === 0) break; i++; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      let inVorlage = q === '`';
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (inVorlage && src[i] === '$' && src[i + 1] === '{') {
          const r = leseAusdruck(src, i + 2, 1); i = r.ende; continue;
        }
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    /* AUCH IN EINEM AUSDRUCK STEHT EIN REGULAERER AUSDRUCK. Ohne diese Zeile
       las `replace(/"/g, '')` das Anfuehrungszeichen IM Muster als Anfang
       einer Zeichenkette -- und von da an lief die ganze Datei um eine Art
       verschoben weiter: Code galt als Text. Der Umbenenner fasste ihn
       daraufhin nicht mehr an (er fasst nur Code an), und ein Werkzeug, das
       in Texten sucht, fasste ihn doppelt an. Beides ist beim Umbenennen der
       Spalten aufgefallen. */
    if (c === '/' && !wertDavor(src.slice(anfang, i))) {
      let j = i + 1, klasse = false, ok = false;
      while (j < src.length && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') klasse = true;
        else if (src[j] === ']') klasse = false;
        else if (src[j] === '/' && !klasse) { ok = true; j++; break; }
        j++;
      }
      if (ok) { while (j < src.length && /[a-z]/.test(src[j])) j++; i = j; continue; }
    }
    i++;
  }
  const stueck = src.slice(anfang, i);
  const teile = zerlegeJs(stueck);
  teile.push({ kind: CODE, wert: '}' });
  return { teile, ende: i + 1 };
}

/* Die Zerlegung einer CSS-Datei: Kommentar und Zeichenkette, sonst Code. */
function zerlegeCss(src) {
  const teile = []; let i = 0, start = 0;
  const schiebe = (bis, a) => { if (bis > start) teile.push({ kind: a, wert: src.slice(start, bis) }); start = bis; };
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') {
      schiebe(i, CODE); i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i = Math.min(i + 2, src.length); schiebe(i, KOMMENTAR); continue;
    }
    if (c === '"' || c === "'") {
      schiebe(i, CODE); const q = c; i++;
      while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === q) { i++; break; } i++; }
      schiebe(i, TEXT); continue;
    }
    i++;
  }
  schiebe(src.length, CODE);
  return teile;
}

/* Die Zerlegung einer HTML-Datei: Kommentar, sonst Code. Die Attributwerte
   bleiben Code -- eine Klasse steht dort und will umbenannt werden. */
function zerlegeHtml(src) {
  const teile = []; let i = 0, start = 0;
  const schiebe = (bis, a) => { if (bis > start) teile.push({ kind: a, wert: src.slice(start, bis) }); start = bis; };
  while (i < src.length) {
    if (src.startsWith('<!--', i)) {
      schiebe(i, CODE); i += 4;
      while (i < src.length && !src.startsWith('-->', i)) i++;
      i = Math.min(i + 3, src.length); schiebe(i, KOMMENTAR); continue;
    }
    i++;
  }
  schiebe(src.length, CODE);
  return teile;
}

function zerlege(src, datei) {
  if (/\.css$/.test(datei)) return zerlegeCss(src);
  if (/\.html?$/.test(datei)) return zerlegeHtml(src);
  return zerlegeJs(src);
}

const zusammen = (teile) => teile.map(t => t.wert).join('');

// Die Vielfachmenge aller Texte -- die Probe des Umbenenners.
function texte(teile) {
  const m = new Map();
  for (const t of teile) if (t.kind === TEXT) m.set(t.wert, (m.get(t.wert) || 0) + 1);
  return m;
}

module.exports = { zerlege, zerlegeJs, zerlegeCss, zerlegeHtml, zusammen, texte, CODE, TEXT, KOMMENTAR, REGEX };
