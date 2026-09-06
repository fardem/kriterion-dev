#!/usr/bin/env node
/* DER UMBENENNER DIESER RUNDE -- und "sicher" heisst: er fasst nur Code an.
   Zeichenketten, Vorlagentexte, regulaere Ausdruecke und Kommentare werden
   vorher ausgesondert (tools/segments.js); ein Name in einem Text bleibt
   stehen.

   ER ARBEITET AUF WORTGRENZEN und nie auf Teilstuecken: `wert` ersetzt nicht
   die Haelfte von `wertung`. Er sieht dazu einen ganzen Bezeichner an und
   nicht eine Zeichenfolge darin.

   UND ER HAT EINE PROBE, DIE JEDE ANWENDUNG BEGLEITET: die Vielfachmenge
   aller Zeichenketten der Datei ist vorher und nachher DIESELBE. Genau diese
   Probe hat in 0.24.0 den einen Fehlgriff gefangen, bei dem aus
   getElementById('sw-test-t') ein 'sw-test-schalter' wurde. Auf dem Weg
   zurueck -- beim Umbenennen eines Textes -- gilt sie andersherum: dann sind
   die BEZEICHNER vorher und nachher dieselben.

   DREI ARTEN, EINEN NAMEN ZU AENDERN:
     ident    -- ein Bezeichner im Code
     string   -- eine ganze Zeichenkette ('karte.titelSpeichern')
     instring -- ein Wort INNERHALB von Zeichenketten (eine Klasse in einer
                 Vorlage, eine id in getElementById)
   Jede davon gibt es einzeln und als Stapel (batch) aus einer JSON-Datei. */

const fs = require('fs');
const path = require('path');
const { zerlege, zusammen, texte, CODE, TEXT } = require('./segments.js');

const IDENT = /[A-Za-z_$][A-Za-z0-9_$]*/g;

// --- Bezeichner ------------------------------------------------------------
function ersetzeIdent(src, datei, map, opt = {}) {
  const teile = zerlege(src, datei);
  const vorher = texte(teile);
  let treffer = 0;
  const von = opt.vonZeile || 0, bis = opt.bisZeile || Infinity;
  let zeile = 1;
  for (const t of teile) {
    const anfangsZeile = zeile;
    zeile += (t.wert.match(/\n/g) || []).length;
    if (t.art !== CODE) continue;
    if (zeile < von || anfangsZeile > bis) continue;
    t.wert = t.wert.replace(IDENT, (m, i, s) => {
      if (!Object.prototype.hasOwnProperty.call(map, m)) return m;
      // Die Zeile des einzelnen Treffers, nicht die des ganzen Stuecks: ein
      // Stueck Code kann ueber hundert Zeilen gehen.
      const zeileHier = anfangsZeile + (s.slice(0, i).match(/\n/g) || []).length;
      if (zeileHier < von || zeileHier > bis) return m;
      // Nach einem Punkt steht eine Eigenschaft; sie zieht mit, ausser wenn
      // ausdruecklich anders verlangt.
      if (opt.ohneEigenschaften && /\.\s*$/.test(s.slice(Math.max(0, i - 2), i))) return m;
      // Ein Schluessel in `{ name: … }` zieht mit; `{ name }` auch.
      treffer++; return map[m];
    });
  }
  const neu = zusammen(teile);
  const nachher = texte(zerlege(neu, datei));
  probeGleich(vorher, nachher, 'Zeichenketten', datei);
  return { text: neu, treffer };
}

// --- ganze Zeichenketten ---------------------------------------------------
function ersetzeString(src, datei, map) {
  const teile = zerlege(src, datei);
  const vorher = bezeichner(teile);
  let treffer = 0;
  for (const t of teile) {
    if (t.art !== TEXT) continue;
    const q = t.wert[0];
    if (q !== '"' && q !== "'" && q !== '`') {
      // Ein festes Stueck einer Vorlage: der ganze Text muss passen
      if (Object.prototype.hasOwnProperty.call(map, t.wert)) { t.wert = map[t.wert]; treffer++; }
      continue;
    }
    const inhalt = t.wert.slice(1, -1);
    if (Object.prototype.hasOwnProperty.call(map, inhalt)) { t.wert = q + map[inhalt] + q; treffer++; }
  }
  const neu = zusammen(teile);
  probeGleich(vorher, bezeichner(zerlege(neu, datei)), 'Bezeichner', datei);
  return { text: neu, treffer };
}

// --- Woerter innerhalb von Zeichenketten -----------------------------------
function ersetzeInString(src, datei, map, opt = {}) {
  const teile = zerlege(src, datei);
  const vorher = bezeichner(teile);
  let treffer = 0;
  const woerter = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!woerter.length) return { text: src, treffer: 0 };
  const re = new RegExp('(?<![A-Za-z0-9_$-])(' + woerter.map(esc).join('|') + ')(?![A-Za-z0-9_$-])', 'g');
  for (const t of teile) {
    if (t.art !== TEXT && !(opt.auchCode && t.art === CODE)) continue;
    t.wert = t.wert.replace(re, (m) => { treffer++; return map[m]; });
  }
  const neu = zusammen(teile);
  if (!opt.auchCode) probeGleich(vorher, bezeichner(zerlege(neu, datei)), 'Bezeichner', datei);
  return { text: neu, treffer };
}

// --- Probe -----------------------------------------------------------------
function bezeichner(teile) {
  const m = new Map();
  for (const t of teile) if (t.art === CODE) for (const w of (t.wert.match(IDENT) || [])) m.set(w, (m.get(w) || 0) + 1);
  return m;
}
function probeGleich(a, b, was, datei) {
  const fehlt = [];
  for (const [k, v] of a) if ((b.get(k) || 0) !== v) fehlt.push(`${k}: ${v} → ${b.get(k) || 0}`);
  for (const [k, v] of b) if (!a.has(k)) fehlt.push(`${k}: 0 → ${v}`);
  if (fehlt.length) {
    throw new Error(`PROBE GESCHEITERT in ${datei}: die ${was} sind nicht mehr dieselben\n  ` +
      fehlt.slice(0, 20).join('\n  ') + (fehlt.length > 20 ? `\n  … und ${fehlt.length - 20} weitere` : ''));
  }
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- Anwendung -------------------------------------------------------------
function wende(datei, art, map, opt = {}) {
  const src = fs.readFileSync(datei, 'utf8');
  const f = art === 'ident' ? ersetzeIdent : art === 'string' ? ersetzeString : ersetzeInString;
  const { text, treffer } = f(src, datei, map, opt);
  if (!opt.probe) fs.writeFileSync(datei, text);
  return treffer;
}

if (require.main === module) {
  const [art, ...rest] = process.argv.slice(2);
  const opt = {};
  const args = [];
  for (const a of rest) {
    if (a === '--probe') opt.probe = true;
    else if (a.startsWith('--von=')) opt.vonZeile = +a.slice(6);
    else if (a.startsWith('--bis=')) opt.bisZeile = +a.slice(6);
    else if (a === '--ohne-eigenschaften') opt.ohneEigenschaften = true;
    else if (a === '--auch-code') opt.auchCode = true;
    else args.push(a);
  }
  if (art === 'batch') {
    const plan = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    let gesamt = 0;
    for (const schritt of plan) {
      const t = wende(schritt.datei, schritt.art, schritt.map, { ...opt, ...schritt.opt });
      gesamt += t;
      console.log(`${schritt.datei}: ${schritt.art} — ${t} Treffer (${Object.keys(schritt.map).length} Namen)`);
    }
    console.log('gesamt:', gesamt);
  } else {
    const [datei, von, nach] = args;
    if (!datei || !von || !nach) { console.error('rename.js ident|string|instring <datei> <von> <nach>'); process.exit(2); }
    const t = wende(datei, art, { [von]: nach }, opt);
    console.log(`${datei}: ${von} → ${nach} — ${t} Treffer`);
    if (!t) process.exit(1);
  }
}

module.exports = { ersetzeIdent, ersetzeString, ersetzeInString, wende, bezeichner, probeGleich };
