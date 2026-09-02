/* ================= bilder.js — EINE WAHRHEIT UEBER DIE BILDABLAGE =================

   WARUM ES DIESE DATEI GIBT, und der Grund ist nicht Ordnung. Seit 0.19.3
   faehrt der Bestandslauf in einem EIGENEN THREAD (bestandslauf.js), und der
   braucht dieselbe Umwandlung wie der Anfrageweg. Zwei Fassungen derselben
   Ableitung liefen frueher oder spaeter auseinander -- und zwar unbemerkt,
   denn beide saehen richtig aus (Stolperstein 47). Also gibt es sie genau
   einmal, und beide Wege rufen dieselbe.

   ES STEHT NICHT MEHR IN server.js UND IST TROTZDEM DASSELBE: server.js
   requiret diese Datei und ruft dieselben Funktionen wie bisher. Nichts an
   ihrem Verhalten hat sich mit dem Umzug geaendert; wo eine Zeile anders
   lautet als vorher, steht der Grund daneben.

   WAS HIER NICHT STEHT: sharp.concurrency(). Wie viele Threads sich libvips
   nehmen darf, ist eine Frage an den PROZESS und nicht an die Ableitung --
   der Haupt-Thread setzt sie in server.js, der Bestandslauf in
   bestandslauf.js, und beide setzen dieselbe Zahl. Eine Zeile hier setzte sie
   ein drittes Mal und aenderte je nach Ladereihenfolge etwas anderes. */
const sharp = require('sharp');

/* ================= Bildableitungen =================
   DIE INSTANZ HAT ZWEI BILDWEGE, UND SIE SPEICHERN VERSCHIEDEN. Das ist keine
   Nachlaessigkeit, sondern eine Entscheidung; sie steht hier, weil sie sonst
   nur im Quelltext beider Wege zu finden waere:

     Weg                          was in der Datenbank landet
     ---------------------------  ------------------------------------------
     Foto am Eintrag (photos)     DAS ORIGINAL (ein PNG als WebP, siehe
                                  legeBildAb() weiter unten), dazu 1600px-
                                  und 400px-JPEG
     Bild im Kommentar            NUR 1600px- und 400px-JPEG --
     (comment_images)             KEIN ORIGINAL

   WARUM DAS KOMMENTARBILD KEINS BEKOMMT, und es bleibt dabei: am Eintrag hat
   das Original einen Zweck -- das Vollbild zeigt es. Im Kommentar gibt es kein
   Vollbild in diesem Sinn, und die meisten Bilder fallen genau dort an. Ein
   Original je Kommentarbild vergroesserte die Datenbank an der Stelle, an der
   sie ohnehin am schnellsten waechst, und niemand saehe es je an.

   WAS DARAUS FOLGT UND GEMESSEN IST: das Kommentarbild summiert sich beim
   wiederholten Ein- und Ausspielen, denn der Import kodiert das gespeicherte
   JPEG erneut als JPEG (kein Original, aus dem er neu rechnen koennte). Die
   Zahlen dazu: MAE 0,06 nach einer Runde, 0,10 nach sechs -- es laeuft aus
   statt davonzulaufen, und die ERSTE Kodierung kostet mit 1,89 ohnehin ein
   Vielfaches davon. Am Foto passiert das nicht: dort schreibt der Import das
   Original byte-genau zurueck und rechnet thumb/medium neu daraus.
   KEIN HANDLUNGSBEDARF -- aber wer es entdeckt, soll die Zahlen daneben
   finden und es nicht fuer schlimmer halten, als es ist. */
const VARIANTS = { thumb: { px: 400, q: 78 }, medium: { px: 1600, q: 84 } };
async function makeVariants(buf) {
  const out = {};
  for (const [name, v] of Object.entries(VARIANTS)) {
    try {
      out[name] = await sharp(buf, { failOn: 'none' }).rotate()
        .resize(v.px, v.px, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: v.q, mozjpeg: true }).toBuffer();
    } catch { out[name] = null; }
  }
  return out;
}

/* ================= Die Ablage des Originals =================
   679 VON 1032 BILDERN LAGEN ALS PNG IM ORIGINAL -- 435,7 MB von 568,9 MB des
   ganzen Bildbestands. Es sind Bildschirmfotos: der Browser legt die
   Zwischenablage als PNG ab, und der Server hat sie unveraendert gespeichert.
   Als WebP im Verfahren `nearLossless` werden daraus 161,9 MB.

   UND DIE VORHERSAGE HAT GEHALTEN. Der Lauf ist am echten Bestand gefahren:
   679 von 679 umgestellt, 272,1 MB gespart -- die umgestellten Bilder belegen
   danach 435,7 - 272,1 = 163,6 MB gegen vorhergesagte 161,9 MB, ABWEICHUNG
   1,0 %. Eine Messung, die sich bestaetigt, ist so berichtenswert wie eine,
   die es nicht tut.

   DIESER ABSATZ IST AUSDRUECKLICH KEINE ENTSTEHUNGSGESCHICHTE, sondern eine
   zurueckgenommene Entscheidung, die sonst wiederkaeme (Stolperstein 201):
   Fahrplan und Sammelblatt fuehrten bis zum 1. September 2026 den Satz „das
   Original wird nicht angefasst" -- so halten es Immich, Nextcloud Photos und
   Piwigo, und fuer eine KAMERAAUFNAHME ist das richtig. Dieser Bestand
   besteht zu 92 % aus Bildschirmfotos; ein Bildschirmfoto hat kein Negativ
   und ist selbst schon eine Ableitung.

   WARUM `nearLossless` UND NICHT `quality`. WebP hat zwei Bitstroeme: VP8
   (verlustbehaftet) und VP8L (verlustfrei). `quality: 90…100` faehrt den
   ersten und franst an harten Kanten aus -- gemessen beschaedigt `quality: 100`
   DIESELBEN elf von hundert Bildern mit DERSELBEN Abweichung wie `quality: 90`;
   eine hoehere Guete aendert daran nichts, es ist eine Frage des Verfahrens.
   `nearLossless` faehrt den zweiten: es glaettet vor dem verlustfreien
   Kodieren dort, wo man es nicht sieht. `quality` steuert dabei NICHT die
   Bildguete, sondern wie stark geglaettet wird.

   WARUM 60. Der Gewinn viertelt sich mit jedem Schritt (34,2 → 20,5 → 6,9 →
   1,4 MB), die groesste Abweichung verdoppelt sich (1 → 2 → 4 → 8 von 255).
   Bei 60 kreuzen sich die Kurven. Und `nearLossless` 60 schlaegt das rein
   Verlustfreie deutlich: 161,9 gegen 216,6 MB.

   WER DIE ABWAEGUNG ANDERS TRIFFT, setzt hier `nearLossless: true` mit
   `quality: 100` (dann wird gar nicht geglaettet) und zahlt 55 MB. Beides ist
   vertretbar; entschieden ist 60. */
const WEBP_ABLAGE = { nearLossless: true, quality: 60, effort: 4 };

/* DIE ERKENNUNG GEHT UEBER DIE ERSTEN ACHT BYTES, nicht ueber den gemeldeten
   Typ: ein Byte-Vergleich kostet nichts, und er glaubt dem Browser nicht auf
   sein Wort. Dieselbe Haltung wie bei der Auslieferung, die den Kopf ebenfalls
   aus den Bytes setzt. Der String daneben ist DERSELBE Wert in der Form,
   in der SQLite ihn liefert (hex(substr(data,1,8))) -- eine zweite Stelle mit
   einer zweiten Schreibweise liefe auseinander. */
const PNG_MAGIE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_MAGIE_HEX = PNG_MAGIE.toString('hex').toUpperCase();
const istPNG = (buf) =>
  Buffer.isBuffer(buf) && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIE);

/* WAS WIRKLICH IN photos.data GEHT. Ein PNG wird ein WebP, alles andere bleibt,
   wie es ist.

   JPEG, GIF UND VORHANDENES WEBP WERDEN NICHT ANGEFASST, und jedes aus einem
   eigenen Grund:
     JPEG  eine Neukodierung waere verlustbehaftet, und die Ausrichtung haengt
           an den EXIF-Daten, die makeVariants() ueber .rotate() liest.
     GIF   sharp liest ohne `animated: true` nur die erste Seite. Eine
           Umwandlung verloere die Bewegung, und zwar still.
     WebP  ist schon da, wo es hinsoll.
   BMP steht gar nicht zur Frage: RASTER_FORMATE fuehrt es nicht, der Upload
   wird abgewiesen.

   DER RUECKFALL IST NICHT ZIERDE. WebP kann hoechstens 16383 px je Kante --
   bei 16384 wirft sharp „Processed image is too large for the WebP format".
   Und ein PNG, das nach der Umwandlung GROESSER waere, bleibt PNG; gemessen
   kommt das vor. In beiden Faellen liegt danach die unveraenderte Vorlage da.

   `mime_type` MUSS MITGEZOGEN WERDEN. Sonst laege WebP unter dem Namen
   `image/png` in der Tabelle, und der naechste Export truege die Luege weiter.
   (Die Auslieferung selbst faellt darauf nicht herein -- sie liest die
   ersten Bytes --, aber eine falsche Spalte bleibt eine falsche Spalte.)

   AUSDRUECKLICH OHNE `failOn: 'none'`, anders als makeVariants(): eine
   Vorlage, an der sharp etwas zu beanstanden hat, soll hier NICHT halb
   umgewandelt werden. Sie faellt in den Rueckfall und bleibt unberuehrt --
   bei einer Ableitung ist ein Rest besser als nichts, beim Original nicht. */
async function legeBildAb(buf, gemeldeterTyp) {
  if (!istPNG(buf)) return { data: buf, mime: gemeldeterTyp, umgewandelt: false };
  try {
    const webp = await sharp(buf).webp(WEBP_ABLAGE).toBuffer();
    if (webp.length < buf.length)
      return { data: webp, mime: 'image/webp', umgewandelt: true };
  } catch (e) {
    // Laut ins Protokoll, still in der Antwort: das Bild ist gespeichert, nur
    // eben als PNG. Wer es wissen will, sieht es an der Formatzeile der Karte.
    console.error('[Kriterion] PNG blieb PNG:', e.message);
  }
  return { data: buf, mime: gemeldeterTyp, umgewandelt: false };
}

module.exports = { VARIANTS, makeVariants, WEBP_ABLAGE,
                   PNG_MAGIE, PNG_MAGIE_HEX, istPNG, legeBildAb };
