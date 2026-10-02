/* Kriterion — Pruefstand: Ersatz fuer ffmpeg. videoproxy.js ruft ihn mit dem Inhalt von KRITERION_TESTBENCH als
   erstem Argument auf. Schalter: qsv=1 Quick Sync kodiert, qsv=2 nur ohne feste Bitrate; ffmpegfail=1 Abbruch,
   ffmpegfail=2 nur auf Weg A; ffmpeghold=<ms> wartet vor dem Schreiben. */
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const [bench = '', ...args] = process.argv.slice(2);
const set = {};
for (const piece of bench.split(':').slice(1)) {
  const [k, v] = piece.split('=');
  if (/^\d+$/.test(v || '')) set[k] = Number(v);
}

const box = (name, body) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(8 + body.length);
  head.write(name, 4, 'latin1');
  return Buffer.concat([head, body]);
};

async function main() {
  if (args.includes('testsrc2=duration=2:size=1920x1080:rate=30')) {
    const fixed = args.includes('-b:v');
    if (set.qsv === 1 || (set.qsv === 2 && !fixed)) {
      process.stderr.write('[AVHWDeviceContext] VAAPI driver: Intel iHD driver for Intel(R) Gen Graphics - 25.2.3 ().\n');
      return 0;
    }
    process.stderr.write('[AVHWDeviceContext] libva: iHD_drv_video.so init failed\nDevice creation failed: -5.\n');
    return 1;
  }
  const input = args[args.indexOf('-i') + 1];
  const output = args[args.length - 1];
  const r = await fetch(input);
  const original = Buffer.from(await r.arrayBuffer());
  if (!r.ok) { process.stderr.write(`${input}: ${r.status}\n`); return 1; }
  const bare = await fetch(new URL('/x', input)).then(a => a.status, () => 0);
  if (set.ffmpeghold) await new Promise(done => setTimeout(done, set.ffmpeghold));
  if (set.ffmpegfail === 1 || (set.ffmpegfail === 2 && args.includes('-hwaccel'))) {
    process.stderr.write('Conversion failed!\n');
    return 1;
  }
  process.stdout.write('out_time_us=500000\nprogress=continue\nout_time_us=1000000\nprogress=end\n');
  // Die Daten nennen SHA-256 des Originals, Umgebung, Antwort ohne Marke, Prioritaet, Verzeichnis und Argumente.
  const hash = crypto.createHash('sha256').update(original).digest('hex');
  const text = `proxy ${hash} env=${Object.keys(process.env).join(',')} bare=${bare} nice=${os.getPriority()} mode=${(fs.statSync('.').mode & 0o777).toString(8)} cwd=${process.cwd()} ${args.join(' ')}\n`;
  fs.writeFileSync(output, Buffer.concat([box('ftyp', Buffer.from('isom\0\0\x02\0isomavc1', 'latin1')),
    box('mdat', Buffer.concat([Buffer.from(text), Buffer.alloc(3000, 7)]))]));
  return 0;
}

main().then(code => process.exit(code), e => { process.stderr.write(String(e && e.message) + '\n'); process.exit(1); });
