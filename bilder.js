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
                                  legeBildAb() weiter unten), dazu `medium`
                                  und `thumb` als JPEG
     Bild im Kommentar            NUR `medium` und `thumb` --
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
/* ---- DIE ABLEITUNGSREGEL FOLGT DER ANZEIGEREGEL -- 0.19.4 ----

   DER FEHLER, DER SEIT DEM ERSTEN TAG DA WAR: `thumb` war 400 Bildpunkte auf
   der LANGEN Kante. Jede Stelle, die ein `thumb` zeigt, schneidet es mit
   `object-fit: cover` zu -- und wer einschneidet, braucht die KURZE Kante
   gross genug. Ein 16:9-Bildschirmfoto lag damit als 400 x 225 in der
   Tabelle, und die Kachel zog die 225 auf ihre Breite hoch. Immer, auf jedem
   Geraet, ohne dass irgendetwas rot wurde.

   NACHGESEHEN IM STYLESHEET, und es ist eine Regel und kein Einzelfall:
     object-fit: cover     Kachel der Uebersicht (.card-img img), Streifen am
                           Eintrag (.thumb img), Kommentarbild (.cmt-img img),
                           Streifen im Vollbild (.lb-thumb img)  -> KURZE Kante
     object-fit: contain   Betrachter am Eintrag (.viewer img), Buehne im
                           Vollbild (.lb-stage img)              -> LANGE Kante
   `thumb` wird ausschliesslich mit `cover` gezeigt, `medium` ausschliesslich
   mit `contain`. DESHALB AENDERT SICH `thumb` UND `medium` AUSDRUECKLICH
   NICHT: 1600 auf der langen Kante ist fuer `contain` genau richtig, und wer
   beide Ableitungen „der Ordnung halber" gleich behandelt, macht `medium`
   schlechter und die Datenbank groesser.

   WARUM 512 UND NICHT 400 ODER 640. Gemessen in Chromium am Stylesheet
   dieses Stands: die breiteste Kachel ist 299 CSS-Bildpunkte (`.shell` hoert
   bei 1300 px auf, fuenf Spalten passen nie hinein) -- auf einem
   2x-Bildschirm sind das 598 Geraetepunkte, auf einem Telefon bei 390 px
   Fensterbreite und dPR 3 sind es 513. Und was es kostet, ist reine
   Geometrie: der Byte-Faktor IST auf 3 % genau der Bildpunkt-Faktor, also
   (lange/kurze Kante) im Quadrat. An 108 16:9-Bildschirmfotos gemessen kostet
   400 das 3,06fache, 512 das 5,05fache und 640 das 7,78fache des heutigen
   `thumb`. 512 deckt das Telefon ganz und laesst am 2x-Desktop 1,17fach
   uebrig -- gegen heute 2,66fach; 640 kaufte diese letzten 17 % mit der
   Haelfte mehr an Bytes, und die reisen in jeder Sicherung mit.

   DIE TAFEL TRAEGT DIE UNTERSCHEIDUNG UND KEIN `if` IN DER SCHLEIFE. Jede
   Ableitung nennt eine KISTE: `kurz` ist, worauf die kurze Kante gebracht
   wird, `lang` der Deckel auf der langen. Was zuerst greift, gewinnt --
   `fit: 'inside'` auf dieser Kiste rechnet genau das aus. Bei `medium` sind
   beide Zahlen gleich, und damit greift immer der Deckel: das ist das
   Verhalten bis 0.19.3, Bild fuer Bild dasselbe.

   DER DECKEL IST DER EIGENTLICHE BAUPUNKT, denn ohne ihn kennt die kurze
   Kante keine obere Grenze fuer die lange. Ein Bildschirmfoto ueber zwei
   Monitore (7680 x 1080) ergaebe bei kurzer Kante 512 ein `thumb` von
   3641 x 512 -- 1864k Bildpunkte gegen 466k eines gewoehnlichen 16:9-`thumb`
   und mehr als dessen `medium` mit 1440k. Aus der Ableitung, die klein sein
   soll, wuerde die groesste der Tabelle.
   WARUM DER DECKEL 1280 HEISST, und beide Grenzen sind gemessen: 21:9 ist
   das breiteste gewoehnliche Bildschirmformat und ergibt 1214 bzw. 1223 px
   -- ein Deckel von 1200 schnitte es schon an, 1280 laesst es unberuehrt.
   Nach oben faellt ein 32:9-Foto bei 1280 auf 1280 x 360 = 461k und liegt
   damit genau auf dem Mass eines 16:9-`thumb` (466k); bei 1600 waere es mit
   720k noch das 1,55fache.
   UND ES WIRD NICHT GESCHNITTEN, SONDERN SKALIERT. Der Ausschnitt entsteht
   im Browser aus dem Fokuspunkt (`ausschnitt()` in public/app.js); ein am
   Server beschnittenes `thumb` naehme dem Fokuspunkt seine Flaeche, und der
   eingestellte Ausschnitt zeigte danach etwas anderes. Deshalb faellt bei
   einem Panorama die KURZE Kante unter 512 -- das Bild wird kleiner, nicht
   enger. */
const VARIANTS = {
  thumb:  { kurz: 512,  lang: 1280, q: 78 },
  medium: { kurz: 1600, lang: 1600, q: 84 }
};

/* WELCHE KANTE DIE KURZE IST, SAGT NUR DAS BILD SELBST -- und der Kopf sagt
   es nicht allein. `metadata()` liefert die Masse SO, WIE SIE IN DER DATEI
   STEHEN; `.rotate()` in der Ableitung dreht danach nach dem EXIF-Vermerk,
   und die Ausrichtungen 5 bis 8 vertauschen dabei Breite und Hoehe.
   Nachgemessen an einem 600 x 1200 mit Ausrichtung 6: `metadata()` meldet
   600 x 1200, `.rotate()` liefert 1200 x 600. Wer den Vermerk nicht
   mitzaehlt, legt die Kiste hochkant an ein Bild, das quer herauskommt --
   und bekommt eine Ableitung mit 1280 auf der kurzen Kante.
   `{ autoOrient: true }` HILFT DAGEGEN NICHT: sharp 0.35.3 meldet damit
   ebenfalls 600 x 1200. Nachgesehen, nicht angenommen. */
const istQuer = (m) => {
  const gedreht = m && m.orientation >= 5;
  const breite = gedreht ? m.height : m.width;
  const hoehe  = gedreht ? m.width  : m.height;
  return !(hoehe > breite);
};

/* DER KOPF WIRD EINMAL GELESEN UND NICHT JE ABLEITUNG. Er kostet gemessen
   0,23 bis 0,27 ms an einem kleinen JPEG -- sharp liest dafuer den Kopf und
   dekodiert das Bild nicht.
   UND WENN ER SICH NICHT LESEN LAESST, GILT QUER. Die Kiste ist dann 1280
   breit und 512 hoch; ein hochkantes Bild bekaeme darin 512 auf der LANGEN
   Kante -- also die alte Regel mit der neuen Zahl, und nicht etwa eine
   ueberdimensionierte Ableitung. Wenn schon daneben, dann nach unten. */
async function makeVariants(buf) {
  const out = {};
  let quer = true;
  try { quer = istQuer(await sharp(buf, { failOn: 'none' }).metadata()); } catch {}
  for (const [name, v] of Object.entries(VARIANTS)) {
    try {
      out[name] = await sharp(buf, { failOn: 'none' }).rotate()
        .resize(quer ? v.lang : v.kurz, quer ? v.kurz : v.lang,
                { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: v.q, mozjpeg: true }).toBuffer();
    } catch { out[name] = null; }
  }
  return out;
}

/* ---- WELCHE ZEILE DER BESTANDSLAUF ANFASST ----

   DIE ZEILE SAGT ES SELBST, UND ZWAR DER `thumb`. Ein Merker in der Datenbank
   waere eine Schemaaenderung und ausserdem eine zweite Wahrheit ueber
   dieselbe Sache (Stolperstein 47): die Ableitung liegt ja da, und sie traegt
   ihre Geometrie im Kopf. Gelesen werden dafuer 10 kB `thumb` und nicht eine
   halbe Megabyte Original.

   400 STEHT HIER, WEIL ES DIE ALTE REGEL WAR. Die Zahl beschreibt keinen
   Zustand, den diese Fassung herstellt, sondern einen, den sie vorfindet --
   deshalb steht sie NICHT in `VARIANTS`, wo sie wie eine dritte Einstellung
   aussaehe. Sie faellt mit der Bereinigung weg, wie jeder andere
   Migrationsschritt auch.

   WARUM AUF DIE LANGE KANTE GEZIELT WIRD UND NICHT AUF DIE KURZE.
   `fit: 'inside'` legt die begrenzende Kante EXAKT auf ihr Mass -- nachgemessen
   an 1919x1080, 1366x768, 3441x1440, 1000x999 und 7680x1080: die lange Kante
   des alten `thumb` ist in jedem Fall genau 400. Die kurze dagegen ist jedes
   Mal eine andere Zahl, und ein „kurze Kante unter 512" faenge auch die zwei
   Faelle, in denen die NEUE Regel bewusst darunter bleibt:
     - das kleine Bild. `withoutEnlargement` vergroessert nie; ein Original
       mit 300 x 200 bleibt 300 x 200 -- unter beiden Regeln dasselbe.
     - das Panorama. Bei 32:9 greift der Deckel, und die kurze Kante faellt
       auf 360.
   Beide traegen die lange Kante NICHT auf 400 (300 bzw. 1280) und bleiben so
   von selbst draussen. DIE ABFRAGE IST DAMIT EIN FESTPUNKT: was der Lauf
   angefasst hat, faellt danach nicht wieder in seine Auswahl.

   DER EINE FALL, IN DEM SIE ES NICHT IST, und er gehoert hierher und nicht in
   eine Fussnote: ein Original, dessen lange Kante GENAU 400 ist. Sein `thumb`
   sieht aus wie ein alter, ist aber schon der neue -- beide Regeln liefern
   dafuer dasselbe Bild. Der Lauf leitet ihn bei jedem Start erneut ab, stellt
   fest, dass sich die Masse nicht geaendert haben, schreibt nicht und zaehlt
   ihn nicht mit (siehe bestandslauf.js). Es kostet ein kleines Bild je Start,
   und aufloesen liesse es sich nur mit genau dem Merker, der ausgeschlossen
   ist. */
const ALTE_THUMB_KANTE = 400;
function traegtAlteGeometrie(masse) {
  if (!masse || !masse.width || !masse.height) return false;
  return Math.max(masse.width, masse.height) === ALTE_THUMB_KANTE &&
         Math.min(masse.width, masse.height) < VARIANTS.thumb.kurz;
}

/* DIE FRAGE AN EINEN GESPEICHERTEN `thumb`, und sie steht HIER und nicht im
   Bestandslauf: was die Geometrie einer Ableitung ist, weiss diese Datei --
   dieselbe Ueberlegung, aus der makeVariants() nach 0.19.3 hierher gezogen
   ist. Eine zweite Fassung im Thread liefe frueher oder spaeter auseinander.

   EIN NICHT LESBARER `thumb` GILT ALS ALT, und das ist eine Entscheidung und
   keine Nachlaessigkeit. Die Ableitung wird nicht aus dem `thumb` gerechnet,
   sondern aus dem ORIGINAL -- wer die Frage nicht beantworten kann, verliert
   also nichts, wenn er sie neu ableitet, und gewinnt eine Zeile zurueck, die
   sonst niemand repariert: das Nachruesten sucht `thumb IS NULL` und sieht
   einen kaputten `thumb` nicht an.
   WAS ES KOSTET, WENN AUCH DAS ORIGINAL KAPUTT IST: die Zeile wird bei jedem
   Start erneut versucht, kommt leer zurueck und wird uebersprungen. Das ist
   eine Zeile, deren Bild ohnehin niemand mehr anzeigen kann -- die Instanz
   hat dann ein groesseres Problem als einen Lauf, der es einmal je Start
   bemerkt. */
async function istAlteAbleitung(thumb) {
  try { return traegtAlteGeometrie(await sharp(thumb, { failOn: 'none' }).metadata()); }
  catch { return true; }
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

/* AUSGEGEBEN WIRD, WAS GERUFEN WIRD, UND SONST NICHTS. `VARIANTS`,
   `WEBP_ABLAGE`, `PNG_MAGIE` und `ALTE_THUMB_KANTE` sind die Werte, mit denen
   die Funktionen hier arbeiten -- ausserhalb ruft sie niemand, und eine
   Ausgabe ohne Empfaenger ist eine Zeile, die beim naechsten Lesen erklaert
   werden muss.
   `istAlteAbleitung` UND `traegtAlteGeometrie` SEIT 0.19.4: der Bestandslauf
   fragt mit der ersten je Zeile, ob sie noch die Geometrie bis 0.19.3 traegt.
   Die zweite ist dieselbe Regel OHNE sharp -- der Pruefstand haelt sie gegen
   Masse, die er selbst hinschreibt, und braucht dafuer kein Bild. Zwei
   Ausgaenge auf eine Regel, aber nicht zwei Regeln: die erste ruft die
   zweite.
   `PNG_MAGIE_HEX` STEHT DAGEGEN DABEI: server.js braucht dieselbe Byte-Folge
   in der Schreibweise, in der SQLite sie liefert (hex(substr(data,1,8))), und
   eine zweite Stelle mit einer zweiten Schreibweise liefe auseinander. */
module.exports = { makeVariants, PNG_MAGIE_HEX, istPNG, legeBildAb,
                   istAlteAbleitung, traegtAlteGeometrie };
