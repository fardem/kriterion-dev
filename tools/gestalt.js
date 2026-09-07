/* GESTALT: benennt ids, Klassen und Stilblattvariablen um -- und zwar NUR
   dort, wo ein Name wirklich ein Name ist.

   Der Grund fuer den Aufwand: `leer`, `weg`, `offen`, `zu` sind zugleich
   Klassennamen UND deutsche Woerter in Saetzen, Spalten des Bestands und
   Teile von Bezeichnern. Ein blindes Ersetzen traefe alle vier.

   Was als Stelle gilt:
     Stilblatt   `.klasse`, `#id`, `--variable`
     Quelltext   class="…" (auch die Zeichenketten in ${…} darin)
                 classList.add/remove/toggle/contains/replace(…)
                 …className = … (die Zeichenketten der ganzen Zuweisung)
                 querySelector/closest/matches("…")  -- .klasse und #id darin
                 id="…", for="…", aria-controls="…", list="…"
                 getElementById("…"), amElement/atElement("…")                        */
'use strict';

const wortRe = (n) => new RegExp('(?<![A-Za-z0-9_-])' + n.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&') + '(?![A-Za-z0-9_-])', 'g');

function bauRegel(map) {
  const namen = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!namen.length) return null;
  return new RegExp('(?<![A-Za-z0-9_-])(' + namen.map(n => n.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('|') + ')(?![A-Za-z0-9_-])', 'g');
}

/* Ein Zaehler, damit der Aufrufer sieht, wie viel wirklich umgezogen ist. */
function zaehler() { return { n: 0 }; }

function ersetze(text, regel, map, z) {
  if (!regel) return text;
  return text.replace(regel, (m) => { z.n++; return map[m]; });
}

/* --- Stilblatt ---------------------------------------------------------- */
function imStilblatt(css, map, z) {
  let out = css;
  if (map.vars) out = ersetze(out, bauRegel(map.vars), map.vars, z);
  if (map.klassen) {
    const r = bauRegel(map.klassen);
    if (r) out = out.replace(/\.([A-Za-z][\w-]*)/g, (m, n) =>
      Object.prototype.hasOwnProperty.call(map.klassen, n) ? (z.n++, '.' + map.klassen[n]) : m);
  }
  if (map.ids) {
    out = out.replace(/#([A-Za-z][\w-]*)/g, (m, n) =>
      Object.prototype.hasOwnProperty.call(map.ids, n) ? (z.n++, '#' + map.ids[n]) : m);
  }
  if (map.keyframes) out = ersetze(out, bauRegel(map.keyframes), map.keyframes, z);
  return out;
}

/* --- Quelltext ---------------------------------------------------------- */
/* Liest ab `i` (dem Zeichen NACH dem oeffnenden Anfuehrungszeichen) bis zum
   schliessenden -- und zaehlt dabei `${…}` mit, damit ein Anfuehrungszeichen
   IN einem Ausdruck den Wert nicht vorzeitig beendet. */
function bisZu(s, i, schluss) {
  let tiefe = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (c === '$' && s[i + 1] === '{') { tiefe++; i++; continue; }
    if (c === '}' && tiefe > 0) { tiefe--; continue; }
    if (tiefe === 0 && c === schluss) return i;
  }
  return -1;
}

/* Innerhalb eines Klassenwertes ist der rohe Text eine Klassenliste -- und in
   einem `${…}` ist es jede Zeichenkette, aber KEIN Bezeichner: in
   `${potenzial ? ' potenzial' : ''}` ist das erste Wort eine Variable und das
   zweite der Name. */
function klassenWert(wert, map, z) {
  const r = bauRegel(map);
  if (!r) return wert;
  let out = '', roh = '', tiefe = 0;
  const spuel = () => { out += ersetze(roh, r, map, z); roh = ''; };
  for (let i = 0; i < wert.length; i++) {
    const c = wert[i];
    if (tiefe === 0) {
      if (c === '$' && wert[i + 1] === '{') { spuel(); out += '${'; i++; tiefe = 1; continue; }
      roh += c; continue;
    }
    if (c === '{') { tiefe++; out += c; continue; }
    if (c === '}') { tiefe--; out += c; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const e = bisZu(wert, i + 1, c);
      if (e < 0) { out += wert.slice(i); i = wert.length; break; }
      out += c + ersetze(wert.slice(i + 1, e), r, map, z) + c;
      i = e; continue;
    }
    out += c;
  }
  spuel();
  return out;
}

function imQuelltext(src, map, z) {
  const rk = bauRegel(map.klassen || {}), ri = bauRegel(map.ids || {});
  let out = '';
  for (let i = 0; i < src.length; i++) {
    /* class="…" / class='…' */
    let m = /^class\s*=\s*(["'])/.exec(src.slice(i, i + 12));
    if (m && rk) {
      const q = m[1], start = i + m[0].length, e = bisZu(src, start, q);
      if (e > 0) { out += m[0] + klassenWert(src.slice(start, e), map.klassen, z) + q; i = e; continue; }
    }
    /* id="…", for="…", aria-controls="…", list="…" */
    m = /^(id|for|aria-controls|aria-labelledby|list)\s*=\s*(["'])/.exec(src.slice(i, i + 24));
    if (m && ri) {
      const q = m[2], start = i + m[0].length, e = bisZu(src, start, q);
      if (e > 0) { out += m[0] + ersetze(src.slice(start, e), ri, map.ids, z) + q; i = e; continue; }
    }
    out += src[i];
  }
  src = out;

  /* classList.…(…) */
  if (rk) src = src.replace(/\.classList\.(add|remove|toggle|contains|replace)\(([^)]*)\)/g, (m, was, arg) => {
    const grenze = (was === 'toggle' || was === 'contains') ? 1 : (was === 'replace' ? 2 : 99);
    let k = 0;
    const neu = arg.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, (s, q, inhalt) =>
      (k++ < grenze) ? q + ersetze(inhalt, rk, map.klassen, z) + q : s);
    return '.classList.' + was + '(' + neu + ')';
  });

  /* …className = … bis zum Semikolon */
  if (rk) src = src.replace(/\.className\s*(\+?=)(?![=>])\s*([^;\n]*(?:\n(?!\s*(?:\}|const |let |var |return ))[^;\n]*)*)/g,
    (m, op, region) => '.className ' + op + ' ' + region.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,
      (s, q, inhalt) => q + ersetze(inhalt, rk, map.klassen, z) + q));

  /* querySelector / closest / matches */
  src = src.replace(/\.(querySelector|querySelectorAll|closest|matches)\(\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/g,
    (m, was, q, sel) => {
      let neu = sel;
      if (rk) neu = neu.replace(/\.([A-Za-z][\w-]*)/g, (x, n) =>
        Object.prototype.hasOwnProperty.call(map.klassen || {}, n) ? (z.n++, '.' + map.klassen[n]) : x);
      neu = neu.replace(/#([A-Za-z][\w-]*)/g, (x, n) =>
        Object.prototype.hasOwnProperty.call(map.ids || {}, n) ? (z.n++, '#' + map.ids[n]) : x);
      return '.' + was + '(' + q + neu + q;
    });

  /* …id = "…"  -- eine im Code gesetzte id */
  /* NUR EINE ZUWEISUNG, KEIN VERGLEICH: `tag.id === id` ist kein Setzen einer
     id, und `.id =` allein sieht beides gleich. */
  if (ri) src = src.replace(/\.id\s*=(?![=>])\s*([^;\n]*)/g,
    (m, region) => '.id = ' + region.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,
      (t, q, inhalt) => q + ersetze(inhalt, ri, map.ids, z) + q));

  /* setAttribute("id"|"for"|"aria-controls", "…") */
  if (ri) src = src.replace(/setAttribute\(\s*(['"`])(id|for|aria-controls|aria-labelledby|list)\1\s*,\s*(['"`])((?:\\.|(?!\3)[^\\])*)\3/g,
    (m, q1, was, q2, wert) => `setAttribute(${q1}${was}${q1}, ${q2}${ersetze(wert, ri, map.ids, z)}${q2}`);

  /* getElementById("…"), amElement("…") */
  if (ri) src = src.replace(/\b(getElementById|amElement|atElement)\(\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/g,
    (m, was, q, id) => was + '(' + q + ersetze(id, ri, map.ids, z) + q);

  return src;
}

module.exports = { imStilblatt, imQuelltext, zaehler, wortRe };

/* --- Proben ---------------------------------------------------------------
   `node tools/gestalt.js --proben` -- sie stehen hier und nicht in einer
   zweiten Datei, weil eine Probe, die man suchen muss, keine ist. */
if (require.main === module && process.argv[2] === '--proben') {
  const map = {
    ids: { wer: 'who', offen: 'open', 'se-name': 'engine-name' },
    klassen: { potenzial: 'potential', anmeldung: 'login', leer: 'blank', weg: 'remove',
               'off-zeile': 'open-row', erledigt: 'done' },
    vars: { '--schleier': '--scrim' },
  };
  const proben = [
    ['Klasse im Aufruf', "document.body.classList.add('anmeldung');",
     "document.body.classList.add('login');"],
    ['Wert des Bestands bleibt', "auth.log('anmeldung.fehl', { wer: null });",
     "auth.log('anmeldung.fehl', { wer: null });"],
    ['Zuweisung mit Bedingung', "el.className = 'off-zeile' + (z.erledigt ? ' erledigt' : '');",
     "el.className = 'open-row' + (z.erledigt ? ' done' : '');"],
    ['Name im Ausdruck, Variable nicht',
     '`<span class="rating-inline${potenzial ? \' potenzial\' : \'\'}">`',
     '`<span class="rating-inline${potenzial ? \' potential\' : \'\'}">`'],
    ['id und Klasse nebeneinander', '`<span class="hint wer" id="wer">x</span>`',
     '`<span class="hint wer" id="who">x</span>`'],
    ['Auswahl', "e.target.closest('.leer, .weg')", "e.target.closest('.blank, .remove')"],
    ['Zweites Wort bleibt Wert', "z.classList.toggle('leer', n === 0)",
     "z.classList.toggle('blank', n === 0)"],
    ['Eine id im Code gesetzt', "nm.id = 'se-name';", "nm.id = 'engine-name';"],
    ['Ein Vergleich ist keine Zuweisung', "if (tag.id === id && el.className === 'leer') x();",
     "if (tag.id === id && el.className === 'leer') x();"],
  ];
  let gut = 0;
  for (const [name, ein, soll] of proben) {
    const z = zaehler();
    const ist = imQuelltext(ein, map, z);
    if (ist === soll) gut++;
    else console.log('GESCHEITERT: ' + name + '\n  ist:  ' + ist + '\n  soll: ' + soll);
  }
  const zc = zaehler();
  const css = imStilblatt('.leer { color: red; } #wer { top: 0; } a { background: var(--schleier); }', map, zc);
  const sollCss = '.blank { color: red; } #who { top: 0; } a { background: var(--scrim); }';
  if (css === sollCss) gut++; else console.log('GESCHEITERT: Stilblatt\n  ist:  ' + css);
  console.log(`${gut} von ${proben.length + 1} Proben bestanden`);
  process.exit(gut === proben.length + 1 ? 0 : 1);
}
