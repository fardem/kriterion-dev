// Zaehlt die Wortstuecke in den Bezeichnern des ausgelieferten Codes.
// Kommentare und Zeichenketten werden vorher entfernt -- ein Wort in einem
// Text ist kein Bezeichner.
const fs = require('fs');

function strip(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let prev = '';
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') {
          let depth = 1; i += 2; const start = i;
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') depth--;
            if (depth > 0) i++;
          }
          out += ' ' + src.slice(start, i) + ' '; i++; continue;
        }
        if (src[i] === q) { i++; break; }
        i++;
      }
      out += ' "" '; continue;
    }
    if (c === '/' && /[=(,:[!&|?{;\n]|return|typeof/.test(prev.trim().slice(-6) || '(')) {
      // grobe Erkennung eines regulaeren Ausdrucks
      let j = i + 1, ok = false;
      while (j < n && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '/') { ok = true; break; }
        j++;
      }
      if (ok) { i = j + 1; while (i < n && /[a-z]/.test(src[i])) i++; out += ' /re/ '; continue; }
    }
    out += c; prev = c === '\n' ? '' : prev + c; i++;
  }
  return out;
}

function words(id) {
  return id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_$]/g, ' ').toLowerCase().split(/\s+/).filter(Boolean);
}

module.exports = { strip, words };

if (require.main === module) {
  const files = process.argv.slice(2);
  const ids = new Map();
  for (const f of files) {
    const code = strip(fs.readFileSync(f, 'utf8'));
    for (const m of code.matchAll(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g)) ids.set(m[0], (ids.get(m[0]) || 0) + 1);
  }
  const counts = new Map();
  for (const [id, c] of ids) for (const w of words(id)) counts.set(w, (counts.get(w) || 0) + c);
  const arr = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(arr.map(([w, c]) => c + '\t' + w).join('\n'));
  console.error('Woerter:', arr.length, 'Bezeichner:', ids.size);
}
