/* ================= images.js — EINE WAHRHEIT UEBER DIE BILDABLAGE =================

   WARUM ES DIESE DATEI GIBT, und der Grund ist nicht Ordnung. Seit 0.19.3
   faehrt der Bestandslauf in einem EIGENEN THREAD (batchrun.js), und der
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
   batchrun.js, und beide setzen dieselbe Zahl. Eine Zeile hier setzte sie
   ein drittes Mal und aenderte je nach Ladereihenfolge etwas anderes. */
const sharp = require('sharp');

/* ================= Bildableitungen =================
   DIE INSTANZ HAT ZWEI BILDWEGE, UND SIE SPEICHERN VERSCHIEDEN. Das ist keine
   Nachlaessigkeit, sondern eine Entscheidung; sie steht hier, weil sie sonst
   nur im Quelltext beider Wege zu finden waere:

     Weg                          was in der Datenbank landet
     ---------------------------  ------------------------------------------
     Foto am Eintrag (photos)     DAS ORIGINAL (ein PNG in dem Verfahren,
                                  das der Eigentuemer gewaehlt hat -- siehe
                                  storeImage() weiter unten), dazu `medium`
                                  und `thumb` als WebP
     Bild im Kommentar            NUR `medium` und `thumb` --
     (comment_images)             KEIN ORIGINAL

   WARUM DAS KOMMENTARBILD KEINS BEKOMMT, und es bleibt dabei: am Eintrag hat
   das Original einen Zweck -- das Vollbild zeigt es. Im Kommentar gibt es kein
   Vollbild in diesem Sinn, und die meisten Bilder fallen genau dort an. Ein
   Original je Kommentarbild vergroesserte die Datenbank an der Stelle, an der
   sie ohnehin am schnellsten waechst, und niemand saehe es je an.

   WAS DARAUS FOLGT UND GEMESSEN IST: das Kommentarbild summiert sich beim
   wiederholten Ein- und Ausspielen, denn der Import kodiert das gespeicherte
   Bild erneut (kein Original, aus dem er neu rechnen koennte). Die Zahlen
   dazu wurden an JPEG gemessen: MAE 0,06 nach einer Runde, 0,10 nach sechs --
   es laeuft aus statt davonzulaufen, und die ERSTE Kodierung kostet mit 1,89
   ohnehin ein Vielfaches davon. MIT 0.27.0 IST ES WEBP, und die Richtung
   aendert sich dadurch nicht: es bleibt ein verlustbehafteter Bitstrom, der
   ein zweites Mal ueber dieselben Bildpunkte geht. Am Foto passiert das nicht: dort schreibt der Import das
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
   Ableitung nennt eine KISTE: `short` ist, worauf die kurze Kante gebracht
   wird, `long` der Deckel auf der langen. Was zuerst greift, gewinnt --
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
   ES WIRD GESCHNITTEN, UND ZWAR SEIT 0.19.5 -- DIESER SATZ STAND HIER
   ANDERSHERUM. Bis 0.19.4 hiess er: „es wird nicht geschnitten, sondern
   skaliert", mit der Begruendung, ein am Server beschnittenes `thumb` naehme
   dem Fokuspunkt seine Flaeche. DIE BEGRUENDUNG WAR RICHTIG UND IST ES NICHT
   MEHR: sie galt, solange der Browser den Ausschnitt aus dem ganzen `thumb`
   zog. Seit 0.19.5 tut er das nicht mehr -- der Zuschnitt faellt dort weg und
   entsteht hier. Wer nur eine der beiden Haelften baut, schneidet zweimal.
   Der Satz ist NICHT geloescht, sondern umgedreht, mit Datum und Grund
   (Stolperstein 201).

   DIE KACHEL WIRD ZUGESCHNITTEN, NICHT GEZOGEN. `focus_x`, `focus_y` und `zoom`
   sind damit kein Auftrag mehr an den Browser, sondern das REZEPT fuer diese
   Ableitung. Das Original bleibt unangetastet; die drei Zahlen sagen, wie neu
   zu schneiden ist, und deshalb bleibt der Ausschnitt jederzeit aenderbar.
   WAS ES BRINGT, IN QUELLPUNKTEN JE ANZEIGEPUNKT auf der 299 px breiten
   Kachel: bei `zoom` 100 gaben beide Wege 1,71x; bei `zoom` 235 gab der alte
   0,73x -- also 1,37fach HOCHGEZOGEN --, der zugeschnittene gibt 5,88x, und zwar
   unabhaengig davon, wie eng gezogen wird.

   DER DECKEL AUF DER LANGEN KANTE GILT NUR NOCH FUER DIE UNGESCHNITTENE
   ABLEITUNG. Eine zugeschnittene Kachel ist quadratisch -- da kann keine Kante
   davonlaufen. Die 1280 stehen trotzdem in der Tafel, denn `makeVariants()`
   wird auch ohne Zuschnitt gerufen (der Bestandslauf an einer Zeile ohne
   lesbare Masse, und jeder kuenftige Rufer).
   `medium` WIRD NICHT GESCHNITTEN, und das steht als `crops: false` in
   der Tafel und nicht als `if` in der Schleife: es wird mit `object-fit:
   contain` gezeigt, also GANZ, und der Editor zeichnet den Rahmen darauf.
   Ein geschnittenes `medium` naehme dem Editor seine Vorlage. */
/* ---- DIE ABLEITUNGEN SIND WEBP -- 0.27.0 ----

   BIS 0.26.0 WAREN SIE JPEG, und der Grund, das zu aendern, hat sich mit
   0.19.0 umgedreht. Bis dahin waren sie die kleinere Haelfte des Bestands --
   71,1 MB gegen 497,7 MB Originale. Nach 0.19.0 schrumpfen die Originale auf
   rund 162 MB, und die Ableitungen bleiben bei 71,1 MB: sie sind damit die
   GROESSERE Haelfte. Und `medium` ist das, was man in der Anwendung ansieht --
   nicht das Original.

   DIE ZAHLEN SIND NEU GESETZT UND NICHT UEBERNOMMEN, und das ist der ganze
   Punkt an dieser Stelle: `q` hiess bis 0.26.0 JPEG-Guete und heisst jetzt
   WebP-Guete. Dieselbe Zahl bedeutet in den beiden Verfahren NICHT dasselbe.
   Wer 78 und 84 stehen liesse, machte `medium` an einem Foto um die HAELFTE
   groesser als vorher -- gemessen +49,3 %.

   GEMESSEN AM 10. SEPTEMBER 2026, an drei selbstgebauten Bildarten (ein Foto
   mit Verlauf und Koernung, ein Bildschirmfoto mit Text, eine
   Strichzeichnung), je gegen die verlustfreie Fassung DERSELBEN Ableitung.
   Gesucht war die Zahl, die in KEINER Bildart schlechter ist als heute --
   weder in Bytes noch in der Abweichung:

     medium    Bytes gegen JPEG q84        mittlere Abweichung (heute)
     WebP q76  -21 % / -30 % / -33 %       3,02 (2,97) / 0,69 (1,03) / 0,66 (1,32)
     WebP q78   -9 % / -27 % / -30 %       2,91 (2,97) / 0,63 (1,03) / 0,60 (1,32)  <-
     WebP q80   +1 % / -25 % / -28 %       2,79 (2,97) / 0,59 (1,03) / 0,55 (1,32)

   BEI 78 KREUZEN SICH DIE KURVEN: es ist die hoechste Guete, bei der auch das
   FOTO noch kleiner wird. Bei 80 waechst es wieder -- und ein Verfahren, das
   eine Bildart teurer macht, ist keine Ersparnis, sondern eine Verschiebung.

     thumb     Bytes gegen JPEG q78        mittlere Abweichung (heute)
     WebP q82  -52 % / -5 % / -6 %         1,39 (1,35) / 0,88 (2,56) / 1,14 (3,03)  <-
     WebP q84  -45 % / -2 % / -1 %         1,39 (1,35) / 0,83 (2,56) / 1,05 (3,03)
     WebP q86  -31 % / +2 % / +4 %         1,37 (1,35) / 0,75 (2,56) / 0,96 (3,03)

   82 UND NICHT 84, weil die Marge bleiben soll: bei 84 liegt das
   Bildschirmfoto nur noch 2 % unter heute, bei 86 darueber. Und der `thumb`
   ist die Ableitung, die man am haeufigsten sieht -- an Text und Strich ist er
   bei 82 mehr als doppelt so genau wie das heutige JPEG (0,88 gegen 2,56).

   DAS FOTO IST DIE EINE AUSNAHME, UND SIE GEHOERT GENANNT: seine Abweichung
   steigt von 1,35 auf 1,39 -- vier Hundertstel einer Stufe von 255, waehrend
   die Kachel um mehr als die Haelfte schrumpft. Das ist der Tausch, und er
   steht hier, damit ihn niemand fuer uebersehen haelt.

   `effort` STEHT AUF 4 WIE BEI DER ABLAGE. Es ist dieselbe Zahl an derselben
   Bibliothek, und zwei verschiedene Werte in einer Datei muesste man
   erklaeren koennen. */
const VARIANTS = {
  thumb:  { short: 512,  long: 1280, q: 82, crops: true  },
  medium: { short: 1600, long: 1600, q: 78, crops: false }
};

/* DIE GUETE EINER ABLEITUNG STEHT AN GENAU EINER STELLE -- auch fuer das
   Kommentarbild. `encodeCommentImage()` in server.js hat eine eigene
   GEOMETRIE (400 und 1600, ohne Zuschnitt), aber es ist dieselbe Frage nach
   dem Verfahren; zwei Tafeln darueber liefen beim naechsten Anfassen
   auseinander (Stolperstein 47). Es ruft deshalb hier ab, statt eine Zahl
   abzuschreiben. */
const variantWebp = (q) => ({ quality: q, effort: 4 });

/* ---- DIE EINE RECHNUNG FUER DEN AUSSCHNITT -- 0.19.5 ----

   SIE STEHT ZWEIMAL, UND DAS IST DER PUNKT. Der Browser muss den Rahmen im
   Editor live zeichnen, der Server muss die Kachel erzeugen, und zwischen
   beiden liegt HTTP -- eine gemeinsame Fassung gibt es nicht. Also steht sie
   auf jeder Seite in GENAU EINER Funktion (`cropSpecBox()` hier und
   dieselbe in public/app.js) und nicht verstreut, UND DER PRUEFSTAND HAELT
   BEIDE GEGENEINANDER: dieselben drei Werte, dieselben Masse, beide
   Rechnungen, ein Vergleich. Ohne diese Zusage laufen sie beim naechsten
   Anfassen auseinander, und niemand merkt es -- die Kachel zeigt ja ein Bild,
   nur das falsche (Stolperstein 293).

   DIE WERTE SIND MASSSTABSFREI, und genau deshalb geht es ueberhaupt:
   `focus_x` und `focus_y` sind Prozent mit einer Nachkommastelle, `zoom` ist
   Prozent von 100 bis 400. DER SERVER BRAUCHT DIE GROESSE DER VORSCHAU IM
   EDITOR GAR NICHT ZU KENNEN.

   GERECHNET WIRD OHNE RUNDUNG. Der Browser braucht Bruchteile eines
   Bildpunkts, um den Rahmen ruckelfrei zu ziehen; der Server rundet erst
   dort, wo `sharp` ganze Zahlen verlangt (siehe cropRectOf()). Wer hier
   rundete, machte den Vergleich der beiden Seiten unscharf -- und eine
   Zusage, die auf ein Bildpunkt genau gilt, ist keine. */
function cropSpecBox(width, height, fx, fy, zoom) {
  const side = Math.min(width, height);   // was die Kachel bei zoom 100 zeigt
  const tight = side * 100 / zoom;          // was sie beim eingestellten Zoom zeigt
  return { links: fx / 100 * (width - tight), top: fy / 100 * (height - tight), edge: tight };
}

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
function rotatedSize(m) {
  const rotated = m && m.orientation >= 5;
  return { width: rotated ? m.height : m.width, height: rotated ? m.width : m.height };
}
const isLandscape = (m) => {
  const { width, height } = rotatedSize(m);
  return !(height > width);
};

/* ---- DIE FALLE, UND SIE IST GEMESSEN -- 0.19.5 ----

   `extract()` RECHNET IN DEN GEDREHTEN MASSEN, `metadata()` MELDET DIE
   GESPEICHERTEN. Das ist Stolperstein 288 an einer zweiten Stelle -- und
   diesmal wirft es nicht einmal, sondern schneidet daneben.
   NACHGEMESSEN an einem 4032 x 3024 mit EXIF-Ausrichtung 6:

     metadata()                        : 4032x3024, orientation 6
     sharp(x).rotate().metadata()      : 4032x3024  <- die EINGANGSmasse
     das von .rotate() ERZEUGTE Bild   : 3024x4032
     Marke, die im gespeicherten Bild oben links lag, nach dem Drehen also
     oben RECHTS -- gesucht mit `zoom` 400 in drei Ecken:
       fx=100 fy=0   (oben rechts) -> gefunden, Mittelwert R171 G11 B11
       fx=0   fy=0   (oben links)  -> nicht dort (R30 G30 B30)
       fx=100 fy=100 (unten rechts)-> nicht dort (R30 G30 B30)

   UND SHARP SAGT ES NICHT VON SELBST: `metadata()` NACH `.rotate()` im selben
   Rohr meldet weiterhin die Eingangsmasse. Die gedrehten Masse gibt es nur
   ueber den EXIF-Vermerk oder ueber ein fertig erzeugtes Bild -- und das
   waere ein zweiter Durchgang durch die ganze Vorlage.

   Wer die Kiste aus `metadata().width/height` baut, schneidet an der falschen
   Stelle -- und bei 3024 Breite laege ein `left` von 3500 sogar AUSSERHALB,
   was `sharp` mit einem Fehler quittiert. ES TRIFFT DEN ECHTEN BESTAND: die
   fuenfzehn Fotos des Sky-Watcher liegen genau so.

   GERUNDET WIRD ERST HIER, und zwar in dieser Reihenfolge: erst die Kante,
   dann die Ecke gegen die Kante. `sharp` verlangt ganze Zahlen und wirft,
   wenn die Kiste auch nur einen Bildpunkt ueber den Rand ragt; ein Zuschnitt,
   der an der Ecke des Bildes sitzt (fx = 100), landet nach dem Runden genau
   dort. Die beiden Klammern sind deshalb keine Vorsicht, sondern die Zusage.
   EIN Zuschnitt OHNE MASSE GIBT null ZURUECK und keine Kiste auf gut Glueck:
   ohne die Masse der Vorlage ist jede Ecke geraten, und eine geratene Kachel
   ist schlechter als eine ungeschnittene. */
function cropRectOf(size, cropSpec) {
  if (!size || !cropSpec) return null;
  const { width, height } = rotatedSize(size);
  if (!width || !height) return null;
  const k = cropSpecBox(width, height, cropSpec.fx, cropSpec.fy, cropSpec.zoom);
  if (!Number.isFinite(k.edge) || !Number.isFinite(k.links) || !Number.isFinite(k.top)) return null;
  const edge = Math.max(1, Math.min(width, height, Math.round(k.edge)));
  return { left:  Math.max(0, Math.min(width - edge, Math.round(k.links))),
           top:   Math.max(0, Math.min(height  - edge, Math.round(k.top))),
           width: edge, height: edge };
}

/* DER KOPF WIRD EINMAL GELESEN UND NICHT JE ABLEITUNG. Er kostet gemessen
   0,23 bis 0,27 ms an einem kleinen JPEG -- sharp liest dafuer den Kopf und
   dekodiert das Bild nicht.
   UND WENN ER SICH NICHT LESEN LAESST, GILT QUER. Die Kiste ist dann 1280
   breit und 512 hoch; ein hochkantes Bild bekaeme darin 512 auf der LANGEN
   Kante -- also die alte Regel mit der neuen Zahl, und nicht etwa eine
   ueberdimensionierte Ableitung. Wenn schon daneben, dann nach unten. */
/* DER ZUSCHNITT IST EIN ARGUMENT UND KEIN ZWEITER WEG -- 0.19.5. Ist er
   gesetzt (`{ fx, fy, zoom }`), wird `thumb` daraus geschnitten; ist er es
   nicht, bleibt alles wie in 0.19.4. Eine zweite Ableitungsfunktion daneben
   waere eine zweite Wahrheit ueber dieselbe Sache (Stolperstein 47) -- es ist
   dieselbe Funktion mit einem Argument mehr.
   OHNE ZUSCHNITT RUFEN heisst: das Kommentarbild (es hat weder Fokuspunkt
   noch Zoom) und jede Zeile, deren Masse sich nicht lesen lassen.

   `withoutEnlargement` BLEIBT, und das ist ausdruecklich entschieden. Ist der
   ausgeschnittene Bereich kleiner als die Zielkante -- kleines Original,
   enger Ausschnitt --, wird NICHT hochgerechnet: es kostete Bytes und truege
   keinen einzigen Bildpunkt mehr, der Browser zieht es beim Anzeigen ohnehin
   auf, und das Ergebnis ist Bildpunkt fuer Bildpunkt dasselbe. */
async function makeVariants(buf, cropSpec) {
  const out = {};
  let size = null;
  try { size = await sharp(buf, { failOn: 'none' }).metadata(); } catch {}
  const landscape = size ? isLandscape(size) : true;
  const cropRect = cropRectOf(size, cropSpec);
  for (const [name, v] of Object.entries(VARIANTS)) {
    try {
      /* DIE TAFEL ENTSCHEIDET, OB GESCHNITTEN WIRD (`crops`), UND DIE
         KISTE FOLGT DARAUS: der Zuschnitt ist quadratisch, also traegt die
         Kiste zweimal die kurze Kante. Eine Verzweigung auf den NAMEN der
         Ableitung stuende als zweite Wahrheit neben der Tafel. */
      const raw = sharp(buf, { failOn: 'none' }).rotate();
      const cropped = v.crops && cropRect;
      out[name] = await (cropped ? raw.extract(cropRect) : raw)
        .resize(cropped ? v.short : (landscape ? v.long : v.short),
                cropped ? v.short : (landscape ? v.short : v.long),
                { fit: 'inside', withoutEnlargement: true })
        .webp(variantWebp(v.q)).toBuffer();
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

   DIE FRAGE HAT SICH MIT 0.19.5 GEAENDERT, UND ZWAR AUF EINE EINZIGE.
   Bis 0.19.4 hiess sie: „traegt die lange Kante genau 400?" -- die alte
   Regel. Sie reicht nicht mehr: eine Zeile mit `zoom = 235` und einer 512er
   kurzen Kante traegt die Geometrie aus 0.19.4 und braucht trotzdem einen
   Schnitt. AB JETZT LAUTET SIE: IST DIE KACHEL QUADRATISCH?

   WARUM DAS DIE RICHTIGE FRAGE IST, IN EINEM SATZ: eine zugeschnittene Kachel IST
   quadratisch -- der Zuschnitt ist ein Quadrat, und `fit: 'inside'` auf eine
   quadratische Kiste laesst sie eines. Eine ungeschnittene ist es nur, wenn
   die Vorlage es war. „Zugeschnitten" und „quadratisch" fallen damit zusammen, und
   zwar OHNE Merkerspalte.

   UND SIE IST EIN FESTPUNKT, ohne die Ausnahme, die 0.19.4 noch hatte
   (Stolperstein 290). Was der Lauf erzeugt, ist quadratisch und faellt nicht
   wieder in seine Auswahl -- auch dann nicht, wenn die Kante unter 512 bleibt:
     - das kleine Original. 300 x 200 mit `zoom` 235 ergibt eine 85er Kachel.
       Quadratisch, also fertig.
     - das Panorama. 7680 x 1080 bei `zoom` 100 ergibt 512 x 512.
     - der enge Ausschnitt an einer kleinen Vorlage. Dasselbe.
   Die alte Regel haette hier „Zielkante nicht erreicht" gesagt und bei jedem
   Start neu abgeleitet. „Quadratisch" sagt es nicht.

   DIE ALTE REGEL IST DAMIT MIT ENTHALTEN und steht nicht daneben: ein `thumb`
   aus 0.19.3 misst 400 x 225 und ist nicht quadratisch. Eine Instanz, die von
   0.19.3 unmittelbar auf 0.19.5 geht, wird in EINEM Durchgang richtig.

   DER EINE FALL, DEN SIE NICHT SIEHT, und er gehoert hierher und nicht in
   eine Fussnote: EINE QUADRATISCHE VORLAGE. Ihr ungeschnittener `thumb` ist
   512 x 512 und damit von einem zugeschnittenen nicht zu unterscheiden. Bei
   `zoom = 100` macht das nichts -- beide Wege liefern dasselbe Bild. Bei
   `zoom > 100` bleibt ihre Kachel weich, bis jemand ihren Ausschnitt das
   naechste Mal speichert; dann schneidet die Route sie (server.js). Der Preis,
   das zu erkennen, waere ein Kopf-Lesen des ORIGINALS je Zeile und Start --
   die 275-ms-Klasse aus 0.19.4 --, und der Fall kommt im Bestand nicht vor:
   unter 89 Fotos ist kein quadratisches.

   EIN NICHT LESBARER `thumb` GILT ALS UNGESCHNITTEN, und das ist eine
   Entscheidung und keine Nachlaessigkeit. Die Ableitung wird nicht aus dem
   `thumb` gerechnet, sondern aus dem ORIGINAL -- wer die Frage nicht
   beantworten kann, verliert also nichts, wenn er neu ableitet, und gewinnt
   eine Zeile zurueck, die sonst niemand repariert: das Nachruesten sucht
   `thumb IS NULL` und sieht einen kaputten `thumb` nicht an.
   WAS ES KOSTET, WENN AUCH DIE VORLAGE KAPUTT IST: die Zeile wird bei jedem
   Start erneut versucht, kommt leer zurueck und wird uebersprungen. Das ist
   eine Zeile, deren Bild ohnehin niemand mehr anzeigen kann.

   ZWEI AUSGAENGE AUF EINE REGEL, ABER NICHT ZWEI REGELN: `hasNoCropSpec`
   ist die Regel ohne sharp -- der Pruefstand haelt sie gegen Masse, die er
   selbst hinschreibt, und braucht dafuer kein Bild. `isUncropped` liest
   den Kopf und ruft sie. */
function hasNoCropSpec(size) {
  if (!size || !size.width || !size.height) return true;
  return size.width !== size.height;
}

async function isUncropped(thumb) {
  try { return hasNoCropSpec(await sharp(thumb, { failOn: 'none' }).metadata()); }
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

/* ---- UND SEIT 0.27.0 IST ES EINE WAHL UND KEINE REGEL ----

   DIE WAHL GAB ES ZUR HAELFTE SCHON. Seit 0.19.0 stand in der Karte ein
   Haekchen `convertImages`: aus hiess „ein PNG bleibt ein PNG", an hiess
   „`nearLossless` 60, wenn es kleiner ist". Zwei der drei Verfahren standen
   damit da; diese Runde macht aus dem Ja/Nein einen Wert aus dreien.

   DAS DRITTE IST NEU, UND ES KOMMT AUS DEM BETRIEB (2. September 2026): ein
   JPEG von 5,21 MB, im Browser ueber „Grafik kopieren" genommen und hier
   eingefuegt, liegt danach als 20,42 MB in der Datenbank. DAS IST KEIN
   FEHLER -- die Zwischenablage traegt keine Datei, sondern Bildpunkte, und
   der Browser legt sie als PNG von 34,79 MB ab. Kriterion verkleinert um
   41 %, nur von einer Zahl aus, die es vorher nicht gab. Verlustbehaftet q90
   waeren es 6,64 MB: 67 % weniger.

   UND DIE AUFLAGE IST DER GRUND, WARUM ES EINE WAHL BLEIBT UND KEINE REGEL
   WIRD. An einem Bildschirmfoto mit Text ist derselbe verlustbehaftete Weg
   GROESSER als der verlustfreie -- gemeldet siebenmal, hier am 10. September
   2026 an einem selbstgebauten Bildschirmfoto mit ELFMAL nachgemessen
   (149 gegen 13 kB). Der verlustbehaftete Bitstrom (VP8) kann mit harten
   Kanten nichts anfangen; der verlustfreie (VP8L) kann genau das. An der
   Strichzeichnung ist es Faktor 1,2, am Foto umgekehrt 0,4.
   DIE ENTSCHEIDUNG VON 0.19.0 WAR FUER DIESEN BESTAND RICHTIG und bleibt die
   Vorgabe -- 92 % davon sind Bildschirmfotos.

   WARUM q90 UND NICHT WENIGER: es ist die Stufe, an der die Messung des
   Betriebs haengt (6,64 MB, 67 %). Eine andere Zahl hier machte die Aussage
   der Karte unwahr, ohne dass jemand nachrechnete.

   AUS DEN BYTES SIND ZWISCHENABLAGE UND HOCHGELADENES PNG NICHT ZU
   UNTERSCHEIDEN, und deshalb behandelt diese Tafel beide gleich (F6). Eine
   Weiche, die den Weg des Bildes RAET, waere eine zweite Wahrheit ueber
   dieselbe Frage. Was das Verfahren kann und was nicht, sagt die Karte beim
   Einschalten.

   `null` HEISST „NICHT UMKODIEREN" UND IST KEIN FEHLENDER EINTRAG. Der
   Schluessel steht in der Tafel, damit die Frage „kennt sie ihn?" und die
   Frage „was tut sie damit?" dieselbe Tafel haben -- ein Verfahren, das nur
   als `if` im Rumpf vorkaeme, liesse sich von aussen nicht aufzaehlen, und
   genau das braucht die Karte. */
const IMAGE_STORES = {
  'png':           null,
  'webp-lossless': { nearLossless: true, quality: 60, effort: 4 },
  'webp-lossy':    { quality: 90, effort: 4 }
};

/* DIE VORGABE IST DAS HEUTIGE VERHALTEN (F2). Eine Runde, die eine Wahl
   einfuehrt, darf die bisherige Antwort nicht nebenbei aendern -- die Messung
   von 0.19.0 gilt unveraendert. */
const IMAGE_STORE_DEFAULT = 'webp-lossless';

/* GEPRUEFT WIRD GEGEN DIE TAFEL UND NICHT GEGEN EINE ZWEITE LISTE. Was hier
   nicht steht, ist kein Verfahren -- weder aus einer Einstellungszeile noch
   aus einer Anfrage. */
const isImageStore = (v) => typeof v === 'string' &&
  Object.prototype.hasOwnProperty.call(IMAGE_STORES, v);

/* DIE ERKENNUNG GEHT UEBER DIE ERSTEN ACHT BYTES, nicht ueber den gemeldeten
   Typ: ein Byte-Vergleich kostet nichts, und er glaubt dem Browser nicht auf
   sein Wort. Dieselbe Haltung wie bei der Auslieferung, die den Kopf ebenfalls
   aus den Bytes setzt. Der String daneben ist DERSELBE Wert in der Form,
   in der SQLite ihn liefert (hex(substr(data,1,8))) -- eine zweite Stelle mit
   einer zweiten Schreibweise liefe auseinander. */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_MAGIC_HEX = PNG_MAGIC.toString('hex').toUpperCase();
const isPng = (buf) =>
  Buffer.isBuffer(buf) && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC);

/* WAS WIRKLICH IN photos.data GEHT. Ein PNG geht durch das GEWAEHLTE
   Verfahren, alles andere bleibt, wie es ist.

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
   bei einer Ableitung ist ein Rest besser als nichts, beim Original nicht.

   DAS VERFAHREN IST EIN ARGUMENT UND KEINE KENNTNIS -- 0.27.0. Bis 0.26.0
   wusste diese Funktion, wie abgelegt wird, und der Rufer wusste, OB. Das
   ging, solange es zwei Stellungen gab: `convertImages() ? storeImage(...) :
   {…}` am Aufrufer war die zweite Haelfte derselben Wahl. Bei DREI Werten
   ginge das nicht mehr auf -- der Aufrufer muesste zwei davon kennen und der
   Rumpf den dritten. Also kommt die ganze Wahl herein.

   EIN UNBEKANNTES VERFAHREN FAELLT AUF DIE VORGABE, und das ist kein
   Durchwinken: die Klemme sitzt an der schreibenden Route (PUT
   /api/settings), wo ein vierter Wert eine ABSAGE bekommt. Hier steht die
   Lesestelle, und die hat es mit einer Einstellungszeile zu tun, die eine
   aeltere Fassung geschrieben haben kann. Sie soll dann ablegen wie eine
   frische Installation und nicht gar nicht ablegen.

   DIE GROESSENPRUEFUNG GILT IN JEDEM VERFAHREN, AUCH IM VERLUSTBEHAFTETEN.
   Sie ist Rueckbau 433, und sie steht hier ausserhalb der Verzweigung: wer
   sie fuer einen Weg abschaltete, machte aus einer Wahl eine Wette. Gemessen
   an achtzehn Laborversuchen quer durch Palette, Text, Graustufen, Alpha und
   1x1 gewinnt PNG nie ueber die Groesse -- und trotzdem bleibt die Frage
   gestellt, denn „nie" ist eine Messung und keine Zusicherung des Kodierers.
   AM VERLUSTBEHAFTETEN WEG IST SIE SOGAR SCHAERFER GEBRAUCHT ALS AM ANDEREN:
   an einem Bildschirmfoto mit Text liegt q90 gemessen ueber dem PNG-Umfang
   derselben Vorlage, wenn die Vorlage wenig Farben traegt. */
async function storeImage(buf, reportedType, store) {
  const recipe = IMAGE_STORES[isImageStore(store) ? store : IMAGE_STORE_DEFAULT];
  // Das Verfahren „PNG" hat kein Rezept -- es ist die Abwesenheit einer
  // Umkodierung und nicht eine Umkodierung mit anderen Zahlen.
  if (!recipe || !isPng(buf)) return { data: buf, mime: reportedType, converted: false };
  try {
    const webp = await sharp(buf).webp(recipe).toBuffer();
    if (webp.length < buf.length)
      return { data: webp, mime: 'image/webp', converted: true };
  } catch (e) {
    // Laut ins Protokoll, still in der Antwort: das Bild ist gespeichert, nur
    // eben als PNG. Wer es wissen will, sieht es an der Formatzeile der Karte.
    console.error('[Kriterion] PNG blieb PNG:', e.message);
  }
  return { data: buf, mime: reportedType, converted: false };
}

/* AUSGEGEBEN WIRD, WAS GERUFEN WIRD, UND SONST NICHTS. `VARIANTS`,
   `WEBP_STORE` und `PNG_MAGIC` sind die Werte, mit denen die Funktionen hier
   arbeiten -- ausserhalb ruft sie niemand, und eine Ausgabe ohne Empfaenger
   ist eine Zeile, die beim naechsten Lesen erklaert werden muss.
   `ALTE_THUMB_KANTE` IST MIT 0.19.5 WEGGEFALLEN: die 400 beschrieb den
   Zustand, den 0.19.4 vorfand, und die neue Frage kommt ohne sie aus.
   `isUncropped` UND `hasNoCropSpec` SEIT 0.19.5 (bis dahin hiessen
   sie `istAlteAbleitung` und `traegtAlteGeometrie` und stellten die alte
   Frage): der Bestandslauf fragt mit der ersten je Zeile, ob ihre Kachel noch
   ungeschnitten ist. Die zweite ist dieselbe Regel OHNE sharp -- der
   Pruefstand haelt sie gegen Masse, die er selbst hinschreibt, und braucht
   dafuer kein Bild. Zwei Ausgaenge auf eine Regel, aber nicht zwei Regeln:
   die erste ruft die zweite.
   `cropSpecBox` STEHT DABEI, WEIL SIE ZWEIMAL GEBRAUCHT WIRD: hier von
   cropRectOf(), und der Pruefstand haelt sie gegen die gleichnamige
   Funktion in public/app.js. Ohne diesen Ausgang waere die Zusage aus dem
   Kopf dieser Datei nicht nachpruefbar (Stolperstein 293).
   `PNG_MAGIC_HEX` STEHT DAGEGEN DABEI: server.js braucht dieselbe Byte-Folge
   in der Schreibweise, in der SQLite sie liefert (hex(substr(data,1,8))), und
   eine zweite Stelle mit einer zweiten Schreibweise liefe auseinander. */
/* `IMAGE_STORES`, `IMAGE_STORE_DEFAULT` UND `isImageStore` GEHEN SEIT 0.27.0
   HINAUS, und das ist der Bruch mit dem Absatz darueber -- mit Grund: die
   Wahl hat ausserhalb dieser Datei drei Empfaenger, und alle drei stellen
   dieselbe Frage. server.js liest die Einstellungszeile und weist einen
   vierten Wert ab, die Karte zaehlt die Verfahren auf, und der Bestandslauf
   legt mit demselben Verfahren ab wie der Anfrageweg. Jede zweite Aufzaehlung
   davon liefe auseinander (Stolperstein 47).
   `WEBP_STORE` IST DABEI WEGGEFALLEN und heisst jetzt `IMAGE_STORES` mit drei
   Zeilen: ein Name in der Einzahl fuer eine Tafel mit drei Eintraegen waere
   der Rest der alten Frage.
   `VARIANTS` UND `variantWebp` BLEIBEN DRINNEN -- fast: `VARIANTS.thumb.q`
   und `VARIANTS.medium.q` braucht `encodeCommentImage()` in server.js, damit
   die Guete einer Ableitung an genau EINER Stelle steht. Die Tafel geht
   deshalb mit hinaus, `variantWebp` nicht: wer die Zahl hat, baut sich das
   Rezept nicht selbst zusammen -- er ruft die Ableitung. */
module.exports = { makeVariants, VARIANTS, PNG_MAGIC_HEX, isPng, storeImage,
                   IMAGE_STORES, IMAGE_STORE_DEFAULT, isImageStore,
                   isUncropped, hasNoCropSpec, cropSpecBox };
