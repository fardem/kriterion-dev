/* Das Containerprotokoll: Zeitstempel und Name an einer Stelle. ISO 8601 mit
   Versatz aus TZ -- ohne TZ steht +00:00 da, und die Zeile sagt damit selbst,
   welche Uhr gemeint ist. Die GESPEICHERTEN Zeiten folgen TZ nicht:
   Sicherheitsprotokoll, Sicherungsnamen und exported_at bleiben UTC, weil sie
   zwischen Installationen verglichen werden. `logLine` und nicht `log`, weil
   auth.js unter `log()` das Sicherheitsprotokoll fuehrt. */

const NAME = '[Kriterion]';

function stamp(at = new Date()) {
  const two = (n) => String(n).padStart(2, '0');
  // getTimezoneOffset() zaehlt nach Westen, ISO 8601 nach Osten.
  const off = -at.getTimezoneOffset();
  const sign = off < 0 ? '-' : '+';
  const away = Math.abs(off);
  return `${at.getFullYear()}-${two(at.getMonth() + 1)}-${two(at.getDate())}` +
         `T${two(at.getHours())}:${two(at.getMinutes())}:${two(at.getSeconds())}` +
         `${sign}${two(Math.floor(away / 60))}:${two(away % 60)}`;
}

const logLine = (...parts) => console.log(stamp(), NAME, ...parts);
const logWarn = (...parts) => console.warn(stamp(), NAME, ...parts);
const logFail = (...parts) => console.error(stamp(), NAME, ...parts);

module.exports = { stamp, logLine, logWarn, logFail, NAME };
