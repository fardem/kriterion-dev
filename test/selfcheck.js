/* Kriterion — Pruefstand: der Pruefstand ueber sich selbst
 *
 * Die Gegenproben greifen, die Laenge der Funktionen wird gemessen, das
 * Skript auf dem Wirt ist ausfuehrbar, die berichtigten Behauptungen stehen
 * nirgends mehr, und die Compose-Datei wird nicht ueberschrieben.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/frame.js.
 */
const H = require('./frame.js');

async function run() {
  const {
   fs, path, execFileSync, attachments, sharp, segment, CODE, COMMENT, REGEX,
   readmeFlat, __dirname, require, group, check, equal, PORT, open,
   benchFiles
  } = H;
  /* Dieses Modul ruft den Hauptserver. Es startet ihn fuer sich --
     siehe mainServerReady() in test/frame.js. */
  await H.mainServerReady();

  /* ================= Die Gegenproben greifen — 0.13.0 ==================
     EIN RUECKBAU, DER INS LEERE GREIFT, SIEHT AUS WIE EINER, DER NICHTS
     BEWIRKT. counterproof.js meldet das zwar -- aber erst im vollen Lauf, und
     der dauert bei 197 Rueckbauten ueber zwanzig Stunden und steht seit fuenf
     Runden aus. In dieser Zeit sind DREI Suchtexte still veraltet: die
     Markenzeile trug 34 statt 36, und die Absage am Export bekam mit 0.12.4
     ein `!alsTeil` davor. Drei Rueckbauten, die nichts mehr belegten.
     DIESE GRUPPE ERSETZT DEN LAUF NICHT -- sie sagt nichts darueber, ob ein
     Rueckbau eine Pruefung ROT macht. Sie sagt nur, dass er ueberhaupt noch
     etwas anfasst, und das kostet Millisekunden statt Stunden.
     DIE LISTE KOMMT UEBER require UND NICHT UEBER EINEN REGEX: counterproof.js
     gibt sie seit 0.13.0 heraus und faehrt nur beim direkten Aufruf los. Ein
     zweiter Leser daneben liefe irgendwann auseinander. */
  group('Die Gegenproben greifen');

  const gpList = require('./counterproof').REGRESSIONS;
  /* DIE ZAHL AUSDRUECKLICH, wie bei F_ROUTES und den Listen aus auth.js
     (Stolperstein 137): eine Zahl in einem Papier ist eine Behauptung, eine
     Zahl im Pruefstand ist ein Beleg. In 0.12.4 stand "195" in den Papieren,
     gezaehlt waren es 193 -- 184 plus neun. */
  // 300 SEIT 0.16.0, vorher 271: neunundzwanzig neue an den Abschnitten des
  // Systembereichs, an der zusammengelegten Karte, am Erklaerkasten der
  // Gewichtung, an der Glocke samt Zeitpunkt an der Bewertung, an den
  // Verfahren in den Kennzahlen, am Papierkorb im Vollbild und an den beiden
  // Werkzeugen (Groessenmessung und Nummernfilter).
  // 333 SEIT 0.17.0: dreiunddreissig neue am Raster der Kriterienliste, an den
  // beiden Massen vom echten Geraet, an der Vergleichszahl ohne Gewichte, an
  // der aufgeteilten Glockentafel, an der gestrichenen Pille und an den zwei
  // Erklaertexten, die die Oberflaeche verlassen haben. ZEHN vorhandene sind
  // MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 143, 208, 238,
  // 239, 252, 282, 283, 285, 286 und 291 zeigten auf Zeilen, die diese Runde
  // umgebaut hat -- ein Rueckbau, der ins Leere greift, ist stumm und
  // verfaelscht die Tabelle (Stolperstein 192).
  // 353 SEIT 0.17.1: zwanzig neue zu den sechs Handgriffen -- fuenf am
  // Zugangstext, vier an der Kachelhoehe, drei am Mailversand, zwei an der
  // Umbenennung, zwei an der Sitzungszeile und vier am fliegenden Wechsel im
  // Vollbild. EINER IST MITGEGANGEN statt geloescht zu werden (Stolperstein
  // 201): 305 zielte auf den Umbruch der Anmeldezeile, den es nicht mehr gibt,
  // und zielt jetzt auf die nachgebende Namensspalte -- dieselbe Zusage, ein
  // anderer Weg dorthin.
  // 368 SEIT 0.17.2: fuenfzehn neue -- einer an der Sitzungszeile, drei am
  // Deckel der Listen, sechs am fertig geordneten Mailversand, einer an der
  // Klammer hinter dem Schnitt, drei an der Glocke und einer an der README,
  // die keine Versionsgeschichte mehr erzaehlt. SIEBEN VORHANDENE SIND
  // MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 286, 305, 321,
  // 339, 340, 348 und 349 zeigten auf Zeilen, die diese Runde umgebaut hat --
  // 286 zum zweiten Mal. Ein Rueckbau, der ins Leere greift, ist stumm und
  // verfaelscht die Tabelle (Stolperstein 192).
  // DREI DER FUENFZEHN SIND STUMM GEBLIEBEN und haben je eine Luecke im
  // Pruefstand aufgedeckt: die weissraumempfindliche Verneinung am Mailsatz,
  // die fehlende Lage fuer die EIGENE Bewertung und der ungeprueffte
  // Einleitungssatz der Glockentafel. Alle drei sind geschlossen; die
  // Rueckbauten bleiben, wo sie sind.
  // 380 SEIT 0.17.3: zwanzig neue -- drei an der Kachelhoehe und dem Deckel von
  // zehn Zeilen, neun am umgebauten Mailversand, drei am Erklaerkasten und
  // fuenf am Filterruecksetzer. ACHT SIND WEGGEFALLEN und nicht mitgegangen,
  // und das ist der Unterschied zu den Runden davor: 343, 344, 345 und 358 bis
  // 362 bauten die VIER REIHEN des Mailversands zurueck, und genau diese
  // Anordnung ist der Befund dieser Runde gewesen. Ein Rueckbau auf etwas, das
  // es nicht mehr gibt, laesst sich nicht mitnehmen -- er hat keinen Ort mehr.
  // Was an ihre Stelle tritt, sind die neun am Dialog und an der Zustandskarte.
  // 385 SEIT 0.17.4: fuenf neue -- drei an der leeren Liste (das Mass der
  // Bedienzeile, das eigene Mass des Protokolls und die Vorgabemarge, die sie
  // nicht mittraegt), einer an der Liste im Fenster, die keinen Deckel traegt,
  // und einer am Wachstum, mit dem eine Liste mehr nutzt als sie fordert. VIER
  // VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein 201):
  // 340, 356 und 371 zeigen auf den Deckel des Sicherheitsprotokolls, der von
  // zehn auf fuenfzehn Zeilen gestiegen ist, und 369 KEHRT SICH UM -- er hat
  // in 0.17.3 das `align-items: start` weggenommen und setzt es jetzt wieder,
  // weil die Zeile ein Fehler war. Ein zurueckgenommener Beschluss laesst eine
  // Spur zurueck, sonst kommt er wieder (Stolperstein 201).
  // 389 SEIT 0.17.5: vier neue am Raster des Protokolls -- die Spalten an der
  // Liste, die Zeile ohne eigenen Kasten, die Unterkante als Ausrichtung und
  // das Telefon, das die Zeile wieder fuer sich stellt. NEUN VORHANDENE SIND
  // MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 339, 340, 355,
  // 356, 370, 371, 390, 391 und 392 zeigten auf die Deckelzeilen, die diese
  // Runde umgebaut hat. 391 IST DABEI UMGEDREHT -- er baute die Nutzung ueber
  // den Deckel hinaus zurueck, und jetzt setzt er das Schluesselwort wieder,
  // an dem die Runde gescheitert ist.
  // 422 SEIT 0.18.1: einer neu am Deckel der Sitzungsliste -- er traegt die
  // Nummer 430, weil die Nummern bis 429 vergeben sind; die ZAHL der Rueckbauten
  // und die HOECHSTE Nummer sind nicht dasselbe. ZWEI VORHANDENE
  // SIND MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 389 und 392
  // zeigten auf die leere Message, die jetzt zwei Zeilen hoch ist -- sie bauen
  // deshalb auf EINE Zeile zurueck und nicht mehr auf null.
  /* 450 SEIT 0.19.0: achtundzwanzig neue, ab Nummer 431 -- zwoelf an der
     Bildablage, sieben am engeren Ausschnitt, neun an der Oberflaeche dazu.
     EINER IST MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 233
     nahm der Exportdatei ihre Formatnummer und zeigte auf die 11; er zeigt
     jetzt auf die 12 und bleibt derselbe Fund.
     UND DIE ZAHL 429 IM STOLPERSTEIN 269 WAR FALSCH: nachgezaehlt sind es 422
     Eintraege, davon 419 mit Nummer, und die hoechste war 430. Der Stolperstein
     ueber falsche Zahlen trug selbst eine. */
  /* 472 SEIT 0.19.1: zweiundzwanzig neue, ab Nummer 459 -- vier an der
     Bestandskarte (die beiden materialisierten Abfragen, die Aufteilung aus
     mime_type, die Tafel der Zuordnung), zwei am Vergroesserungspunkt, drei an
     der Stapelordnung, vier an der eigenen Kachel der Bildablage, zwei am
     Dauerhinweis im Dialog, zwei an der Threadzahl von sharp, einer am
     Bildschirmtext, zwei an der Compose-Datei, einer an der Berichtigung im
     Quelltext -- und einer am Pruefstand selbst (W13, die Sprachliste).
     DIE ZAEHLUNG DER NEUEN IST 21 + 1: die W-Nummern gehoeren zur Zahl der
     Rueckbauten, aber nicht zur Reihe ab 459.
     VIER VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 44 und 377 zeigten auf Bildschirmtexte, die jetzt „dieser
     Installation" sagen; 346 auf die Tafel der alten Adressen, die eine zweite
     Zeile bekommen hat; 347 auf den Abschnitt, der jetzt „Installation"
     heisst. Ein Rueckbau, der ins Leere greift, ist stumm und verfaelscht die
     Tabelle (Stolperstein 192). */
  /* 481 SEIT 0.19.2: ELF neue, ab Nummer 480 -- einer am Index, einer an
     seiner Lage hinter der Migration, einer an der Gleichheit, einer an der
     zweiten Exportfrage, zwei am Spielraum des Ausschnitts, einer am
     gekuerzten Dialog, einer an der abgebauten Uebersetzung (487) und DREI an
     der Uebersicht (488 bis 490: der deckende Index, eine fehlende Spalte
     darin, und die Frage je Eintrag statt einmal).
     SECHS VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 455, 472 und 473 zeigten auf die beiden Dialogtexte, 460 und 461 auf
     die umgebaute Aufteilung, 479 auf die Berichtigung im Quelltext.
     UND ZWEI SIND WEGGEFALLEN, nicht mitgegangen -- 346 und 459 bauten die
     Tafel der alten Abschnittsadressen zurueck, und genau die ist in dieser
     Runde abgebaut worden. **Ein Rueckbau auf etwas, das es nicht mehr gibt,
     laesst sich nicht mitnehmen: er hat keinen Ort mehr.** An ihre Stelle
     tritt 487, der die Tafel WIEDER EINBAUT -- dieselbe Sache, andersherum. */
  /* 497 SEIT 0.19.3: SECHZEHN neue, fuenfzehn ab Nummer 491 -- acht am Bestandslauf im
     eigenen Thread (die Message je Zeile, ihr Empfaenger, der Schluessel in
     workerData, der Abschluss, der stille Fehler, die Datei im Fingerprint,
     die Threadzahl von sharp und der wiederholte Schluesselhinweis), sechs an
     der Uebersicht (zweimal die verlorene zweite Ordnung, die fehlende
     Linkzahl, die gebuendelte Fassung mit einer Spalte zu viel, die wieder
     vollen Testtage und `t.*` statt der Spaltenliste) und einer am
     Bildschirmtext -- dazu W14 am Pruefstand selbst, der Dateiliste des
     Sprachwaechters. DIE ZAEHLUNG DER NEUEN IST 15 + 1: die W-Nummern gehoeren
     zur Zahl der Rueckbauten, aber nicht zur Reihe ab 491.
     ACHT VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 431 bis 435 und 458 zeigten auf die Umwandlung, die jetzt in
     images.js steht -- derselbe Fund, andere Datei; 136 und 137 auf die Zeile
     der Testtage in der Uebersichtsschleife, die jetzt anders lautet.
     KEINER IST WEGGEFALLEN: diese Runde hat nichts abgebaut, sie hat
     verschoben. */
  /* 514 SEIT 0.19.4: SIEBZEHN neue, alle in der Reihe ab 506 -- sieben an der
     Geometrie selbst (die kurze Kante, der Deckel, `medium`, der EXIF-Vermerk,
     der ungelesene Kopf, die Erkennung an der falschen Kante und der
     unlesbare `thumb`), vier am Lauf (jede Zeile statt der faelligen, die
     leere Ableitung, die Message je Zeile und die Seiten, die er nicht
     freigibt), zwei am Server (die gebrochene Kette und die verengte Auswahl)
     und vier an der Oberflaeche (die Fortschrittszeile, ihre Gegenlage, die
     Uhr und die Angabe in der Karte).
     EINER IST ERWARTET STUMM, und er steht ausdruecklich mit dieser Angabe da
     (516): die Wirkung von reclaim() ist eine Dateigroesse, und die waechst in
     dieser Runde ohnehin. Es ist ein offener Punkt und keine Formalie.
     FUENF VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 439, 440, 492 und 495 zeigten auf den Stand der Umstellung, der
     jetzt je Aufgabe steht; 491 zeigte auf die Message je Zeile, und dieselben
     zwei Zeilen stehen seit dieser Runde in einer zweiten Schleife -- sein
     Suchtext haette danach zweimal gepasst und der Rueckbau waere abgebrochen.
     KEINER IST WEGGEFALLEN. */
  /* 532 SEIT 0.19.5: ACHTZEHN neue, alle in der Reihe ab 523 -- sechs am
     Erzeugen selbst (die Tafel schneidet nicht mehr, `medium` wird
     mitgeschnitten, die gespeicherten statt der gedrehten Masse, die Kiste
     ohne Klammer am Rand, das Hochrechnen auf die Zielkante und der Lauf ohne
     Zuschnitt), vier an den Rufern (Hochladen, Einspielen, Videovorlage und
     die fehlende vierte Aufgabe), drei an der Route (sie schneidet nicht, sie
     wartet nicht, die Message reist nicht zurueck), drei an der Fassung (die
     Spalte, die Adresse) und der Rechnung im Browser, und einer, der den
     CSS-Zuschnitt ZURUECKHOLT -- damit auch die zweite Haelfte der Runde eine
     Gegenprobe hat -- und einer (540) an der Fortschrittszeile, die seit
     dieser Runde in BEIDE Richtungen zeigen muss.
     ELF VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 446 zeigte auf den eingespielten Ausschnitt, 483 auf die Masse im
     Editor, 506 bis 508, 510, 511, 513, 514, 516 bis 518 und 522 auf Zeilen,
     die diese Runde umgebaut hat.
     VIER SIND DABEI IN EINE ANDERE DATEI GEWANDERT, und das ist der
     bemerkenswerte Teil: 449, 453, 464 und 465 bauten den Zuschnitt IM
     BROWSER zurueck -- den gibt es nicht mehr. Sie zeigen jetzt auf die
     Stelle, die ihn ERSETZT hat (images.js und batchrun.js), und tragen
     dieselbe Zusage wie vorher. 453 kehrt sich dabei um: er hat die Zeile aus
     dem Stilblatt genommen und setzt sie jetzt WIEDER -- ein zurueckgenommener
     Beschluss laesst eine Spur zurueck, sonst kommt er wieder.
     KEINER IST WEGGEFALLEN. */
  /* 535 SEIT 0.19.6: DREI neue, 541 bis 543 -- zwei nehmen je einer
     Zeichenfunktion die Wache weg (Streifen und Betrachter), und der dritte
     nimmt nicht die Wache, sondern DAS, WAS SIE BEWACHT: der Streifen zeichnet
     gar keine Kachel mehr. Ohne ihn bliebe gruen, wer die Wache zum
     Ausschalter macht -- eine Zusage „keine rote Message" ist an einer
     Funktion, die nichts tut, trivial wahr (Stolperstein 298).
     SECHS VORHANDENE SIND MITGEGANGEN statt geloescht zu werden (Stolperstein
     201): 516, 517, 532, 533, 534 und 535 zeigten auf Zeilen, in denen das
     Wort „backen" stand -- die Zeilen gibt es unveraendert, nur heissen sie
     jetzt anders. KEINER IST WEGGEFALLEN. */
  /* 558 SEIT 0.20.0: DREIUNDZWANZIG neue, 544 bis 566. Die beiden ersten sind
     die wichtigsten der ganzen Runde -- sie nehmen der Regel je EINE ihrer
     zwei Bedingungen weg (544 den Boden, 545 die Schere), und jede einzelne
     ist ausgerechnet in der Lage falsch, in der sie gebraucht wird
     (Stolperstein 299). Dazu 546, der die Musterpruefung an der KONSTANTEN
     nimmt und damit an beiden Stellen zugleich -- nur so faellt die fremde
     Datei im Sicherungsordner wirklich --, 551, der nach einer GESCHEITERTEN
     Sicherung doch aufraeumt, und 552, der aus einer gelungenen Sicherung eine
     rote Message macht (Stolperstein 298).
     ZWEI SIND AUSDRUECKLICH AUF DEN QUELLTEXTWAECHTER GEMUENZT (547 und 549):
     die zweite Musterpruefung und das zweite `lstatSync` stehen absichtlich
     doppelt da, und am Verhalten allein waeren sie stumm, solange die erste
     Stelle heil ist. Das gehoert benannt und nicht als Fund gelesen.
     EINER IST MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 437
     zeigte auf EIGENTUEMER_SCHLUESSEL, und die Liste traegt seit dieser Runde
     vier Schluessel statt einem. Er nimmt weiterhin genau `convertImages`
     heraus. KEINER IST WEGGEFALLEN. */
  /* 561 SEIT 0.20.1: DREI neue, 567 bis 569 -- die Liste faellt ganz weg, die
     Nummern laufen andersherum, und die Marke „loeschen" faellt von der Zeile.
     DREI SIND MITGEGANGEN statt geloescht zu werden (Stolperstein 201): 563 und
     565 zeigten auf Zeilen, die diese Runde umgebaut hat, und **566 ist dabei in
     eine andere Datei gewandert** -- der Deckel der Liste ist seit 0.20.1 eine
     Regel im Stilblatt und keine Klasse im Markup. Seine Zusage ist dieselbe
     geblieben. KEINER IST WEGGEFALLEN. */
  /* 599 SEIT 0.21.0: sechsunddreissig neue (570 bis 605) fuer die beiden
     Sternkaesten, die Sternzeile und die weggenommene Route. Keiner ist
     weggefallen; fuenf sind mitgegangen statt geloescht (Stolperstein 201).
     VIER DAVON SIND NACHTRAEGE AUS DER GEGENPROBE SELBST:
     602 und 603 nehmen die Phase aus dem SELECT der beiden Schnittabfragen --
     die Runde hatte dort nur den Griff ans GROUP BY (570 und 571), und der
     ist am Verhalten stumm; die Zusage, an der alles haengt, war ohne
     Rueckbau. 604 und 605 gehoeren dem Waechter ueber fremde Server, den
     derselbe Lauf noetig gemacht hat. */
  /* 617 SEIT 0.21.1: ACHTZEHN neue (606 bis 623) fuer die eine Aenderung dieser
     Runde -- die Sortierung gibt den Statusfilter vor. Keiner ist weggefallen,
     und KEINER MUSSTE MITGEHEN: die Runde fasst drawFilters() an mehreren
     Stellen an, aber keine davon war der Suchtext eines vorhandenen Rueckbaus.
     Nachgesehen wurde ausdruecklich an 384 bis 388, die auf den Ruecksetzer
     zeigen, und an 254, der auf die zweite Beschriftung der Statuszeile zeigt
     -- 387 greift weiter, weil sein Suchtext bei `redraw()` beginnt und die
     neue Zeile darueber steht (Stolperstein 201).
     ZWEI TRAGEN DENSELBEN SUCHTEXT (613 und 614, beide an `sel.onchange`) und
     sind trotzdem zwei: der eine schreibt die Ableitung in die gespeicherte
     Stellung, der andere laesst die Leiste beim Wechsel der Sortierung stehen.
     Verschiedene Zusagen, verschiedene rote Punkte.
     UND EINER IST MITGEGANGEN STATT GELOESCHT ZU WERDEN (Stolperstein 201):
     612 zeigte auf den Rumpf von statusAusSortierung(), und der ist beim
     Haerten des Tabellenzugriffs eine Zeile kuerzer geworden.
     613 IST DER, DEN DER AUFTRAG AUSDRUECKLICH VERLANGT: er schreibt die
     Ableitung IN state.filters. Ohne ihn waere Regel 3 nicht baulich, sondern
     behauptet. */
  /* 676 SEIT 0.24.0: siebenundzwanzig neue -- sieben (658 bis 664) fuer die
     beiden Befunde aus Bauabschnitt 0, zehn (665 bis 674) fuer den
     Sprachhelfer und die Ladung aus Bauabschnitt 1 und zehn (675 bis 684) fuer
     die Serverseite aus Bauabschnitt 2. Dreissig sind mitgegangen
     (Stolperstein 201): zwoelf, deren Suchtext eine lokale Variable `t` trug,
     und achtzehn, deren Satz aus dem Quelltext in die Sprachdatei gezogen ist
     -- sie suchen ihn jetzt dort.
     DIE SIEBEN AUS BAUABSCHNITT 0: vier fuer den Umschalter der Tagzeile
     (0.2) und drei fuer die drei Werte der Zeitleiste (0.1). Zwoelf sind mitgegangen (Stolperstein
     201): ihre Suchtexte trugen eine lokale Variable `t`, und der Name gehoert
     seit dieser Runde dem Sprachhelfer.
     DIE SIEBEN AUS BAUABSCHNITT 0: vier fuer den Umschalter der Tagzeile
     (0.2) und drei fuer die drei Werte der Zeitleiste (0.1). Zwei sind mitgegangen (Stolperstein 201): 636, dessen
     Suchtext auf die Zeile zeigte, die den Aufklapper oeffnete -- die Regel
     dahinter ist dieselbe geblieben, nur traegt sie jetzt ein Knopf --, und
     637, dessen erwartete Gruppe umbenannt wurde.
     DAVOR 649 SEIT 0.22.1: vierzehn neue (642 bis 655) -- zehn fuer die fuenf Gesten
     am Bildausschnitt, zwei fuer die Kopfzahl, zwei fuer den Bewertungskasten
     vor dem Test. Der letzte, 655, ist AUS DER GEGENPROBE ENTSTANDEN: sie hat
     gezeigt, dass die Rastung ueber den Deckel springen kann.
     ZWEI SIND MITGEGANGEN (Stolperstein 201): 330, dessen Suchtext auf den
     Satz im Erklaerkasten zeigt, und 646, dessen Zeile sich beim Beheben
     genau jenes Fundes verschoben hat.
     DAVOR 635 SEIT 0.22.0: achtzehn neue (624 bis 641) -- eines je neuer Regel
     des Pruefstands und eines, das das Milchglas wieder einsetzt; einundvierzig
     vorhandene sind damals mitgegangen.
     UND 685 SEIT 0.24.0: neun neue (685 bis 693) -- eines je Waechter der
     Sprachdatei, dazu zwei fuer die Rueckfallprobe, die in zwei Gruppen
     zuhause ist. Sechsundzwanzig vorhandene sind mitgezogen, sechs davon
     zeigen jetzt auf public/languages/de.json statt auf den Quelltext.
     UND 693 SEIT 0.24.1: acht neue (694 bis 701) -- sechs JE WAECHTER der
     Runde „Der Quelltext spricht Englisch". Jedes holt an genau einer Stelle
     einen deutschen Namen zurueck -- einen Bezeichner, einen Schluessel, eine
     Adresse, eine Klasse, einen Satz, eine angehaengte Ziffer. Ein Waechter,
     der nie rot wird, ist eine Behauptung und keine Zusage. Das siebte (700)
     gehoert nicht zu ihnen: es haelt einen Befund aus dem Betrieb vom
     7. September 2026 fest -- die Vorschaukachel im Eintrag, die den
     Sprachhelfer nach ihrem Vater fragte, und das achte (701) einen zweiten
     vom selben Tag: den zugeklappten Linkblock, der die letzten Zeilen zeigte
     statt der ersten.
     UND 701 SEIT 0.24.2: acht neue (702 bis 709) fuer die eine Gruppe, die
     die gespeicherten Formen prueft. Sie nehmen der Migration je ein Stueck
     weg -- einen Schluessel, ein Paar, die Klammer um die Liste, die Regel
     bei zwei Namen, die Stille des zweiten Laufs -- und einer legt ihr einen
     Wert unter, den sie NICHT anfassen darf. Acht Rueckbauten fuer eine
     Gruppe sind viel; sie ist auch die einzige der Runde, und ein
     Migrationsblock, den nichts rot macht, ist eine Behauptung ueber einen
     Bestand, den man nicht mehr zurueckholt.
     UND 725 SEIT 0.24.3: VIERUNDZWANZIG neue (710 bis 733) fuer die fuenf
     Gruppen dieser Runde -- vier an den Klammern am Sprachverzeichnis
     (kaputtes JSON, unbrauchbare Locale, der Dateiname, die Meldung selbst),
     drei am Vorrat (die Wahl je Benutzer, und die Vorgabe darin ZWEIMAL --
     einmal je Haelfte der doppelten Klemme), sechs am
     Rueckfall der Namen (die Sprache ohne Angabe, die geraeumte gleiche
     Uebersetzung, die Namenstabelle, der Leseweg der Kategorien und die
     beiden Wege der Datei), acht am zweiten Migrationsblock und drei an der
     Vorgabesprache des Bestands.
     ACHT FUER EINEN MIGRATIONSBLOCK, WIE EINE RUNDE ZUVOR, und der letzte
     davon ist die Gegenlage: er laesst den Block nach den BLOCKNAMEN
     greifen, die deutsch bleiben sollen. Ein Block, der zu viel tut,
     richtet denselben Schaden an wie einer, der zu wenig tut. */
  /* 728 SEIT 0.24.4: drei kommen dazu, und zwei davon zielen auf die beiden Haelften
     desselben Befunds (B8). Der eine haengt die NADEL wieder an eine Locale,
     der andere laesst die vier i wieder auseinanderfallen.
     GEMESSEN, NICHT BEHAUPTET -- und die Messung hat eine Erwartung
     berichtigt: bei BEIDEN werden die T3-Probe und die Faltungsprobe rot, die
     Zwei-Leser-Probe bei KEINEM. Der Grund ist die Rufstelle: sie reicht seit
     0.24.4 gar keine Sprache mehr herein, und die zurueckgebaute Zeile nimmt
     deshalb die Locale der INSTALLATION statt der des Lesers -- fuer alle
     dieselbe, nur die falsche. **Der Waechter fuer „zwei Leser, eine
     Antwort" haengt damit an der Rufstelle und nicht an der Funktion**, und
     das ist eine Auskunft, die kein Papier hatte.
     UND EIN DRITTER FUER B9: der Sprachwechsel des Lesers wirft die Antwort
     wieder weg. Er trifft nur die ZWEITE Haelfte der Sprachprobe -- die
     Oberflaeche wechselt weiter, die vierzehn Woerter nicht.
     740 SEIT 0.24.5: zwoelf fuer EINE Reparatur, und das ist keine
     Uebertreibung. Der Befund hatte drei Wege (D1, D2, D3), die Reparatur hat
     zwei Enden -- Server und Karte --, und die Haelfte der neuen Zusagen ist
     eine ABWESENHEIT: kein Zwischenspeicher, kein Nachholen, kein fuenfter
     Wert an api(). Eine Abwesenheit laesst sich nur belegen, indem man sie
     probeweise zurueckholt.
     IHRE NUMMERN SIND 737 BIS 748 UND NICHT 733 BIS 744: 733 bis 736 sind mit
     0.24.4 vergeben und stehen in der Liste bei ihrer Sache, nicht hinten. Wer
     am Ende der Liste weiterzaehlt, ohne die hoechste Nummer zu suchen, vergibt
     eine zweimal -- und zwei Rueckbauten mit derselben Nummer sind in der
     Tafel des Treibers nicht mehr auseinanderzuhalten.
     751 SEIT 0.24.6: elf neue (749 bis 759) fuer die drei Teile dieser Runde
     -- fuenf an der Kette (dritter Schritt, genannte Sprache, Klammer,
     Reihenfolge, Vorrat), zwei am Kartenhinweis (er faellt weg, er steht
     ueberall), drei am Nachziehen der Tafeln (die Karte, der Server, die
     Bedingung daneben) und einer am Gewichtsfeld -- dem Befund, den der
     Auftrag nicht kannte. ZWEI SIND MITGEGANGEN statt geloescht zu werden
     (Stolperstein 201): 744 zeigte auf `table[namesLanguage()]`, das jetzt
     eine Zeile darueber steht, und 745 auf den Vermerk, der seit dieser Runde
     zwei Saetze kennt.
     UND EINER IST IM GEFAHRENEN LAUF BERICHTIGT WORDEN: 755 tauschte im SATZ
     des Kartenhinweises eine Sprache gegen eine andere -- und weil der Satz
     nur gezeichnet wird, WENN die beiden gleich sind, war der Rueckbau ein
     Nichts. **Er lief STUMM**; er zielt seither auf die BEDINGUNG.
     770 SEIT 0.25.0: zwanzig neue (760 bis 779) fuer die fuenf
     Bauabschnitte -- drei an der Datenbankstufe (nur eine Spalte, gefuellt
     statt nachgefragt, die Grundausstattung ohne Sprache), sechs an der Kette
     am Server (die neue Zeile ohne Vermerk, die Sprache des Rufers, der eine
     Griff als Umschreiber, das ✕ am Originaltext, Export und Import), acht an
     der Karte (Punkt und Zahl, die Zahl selbst, die Daempfung, das Zeichen an
     jeder Zeile, sein Rumpf, der Kasten, die Ansage, das Nachziehen der
     Pillenreihen) und zwei am Vokabular (Pille und Feld). DER SIEBTE AN DER
     KETTE (779) IST NACHGEWACHSEN: 768 baute im ersten Anlauf nur die
     KATEGORIEN zurueck und lief STUMM, weil die Zusage darueber am KRITERIUM
     gemessen wurde -- zwei Tabellen, zwei Wege, zwei Rueckbauten.
     EINER IST WEGGEFALLEN und nicht mitgegangen: 753 („die Kette nimmt auch
     Sprachen ausserhalb des Vorrats") hat keinen Ort mehr -- die Kette laeuft
     seit dieser Runde nicht mehr ueber den Vorrat, sondern ueber drei benannte
     Schritte. Ein Rueckbau auf etwas, das es nicht mehr gibt, laesst sich
     nicht mitnehmen.
     ELF SIND MITGEGANGEN statt geloescht zu werden (Stolperstein 201), und sie
     zerfallen in zwei Gruppen. DREI tragen nur einen neuen Suchtext und
     dieselbe Aussage: 233 und 448 (die Formatnummer steht auf 15), 579 (die
     Abfrage traegt `c.language`). ACHT nehmen etwas ANDERES weg als vorher:
     717 (aus der geloeschten Uebersetzung wird die Frage, welche Zeile ein
     Umbenennen trifft), 739 (die Tafel traegt jetzt Name UND Herkunft), 749
     bis 752 (die Kette steht am Server) und 754/755 (aus dem Kartenhinweis
     wird der rote Rahmen) -- diese acht sind gefahren.
     778 SEIT 0.25.1: acht neue (780 bis 787) fuer die drei Befunde des
     Betreibers vom 10. September 2026 -- vier an der Zahl und am Rahmen (die
     Zahl selbst, der Rahmen, und je einer an den ZWEI Stellen, an denen die
     Pillenreihe entsteht), zwei am Vermerk (der Kasten, der Umbruch), einer am
     Wortlaut und einer am tuerkischen Wort fuer „Backup".
     FUENF SIND DABEI MITGEGANGEN (Stolperstein 201): 754 und 755 (der Rahmen
     liest die Auswahl der Kachel mit), 770 (`namesMissing()` hat einen dritten
     Wert), 771 (der Namenskasten ist weg) und 597 -- der zielte auf den
     Phasenfilter der zweiten Kriterienkarte, und den gibt es als eigenen
     Ausdruck nicht mehr: Liste und Pillenreihe teilen sich seit 0.25.1
     `critRows()`, und genau darauf zielt er jetzt.
     781 SEIT 0.25.2: drei neue (788 bis 790) fuer die beiden Befunde des
     Betreibers an einer TUERKISCHEN Oberflaeche -- einer am Stempel des
     Servers, der in der Karte mitreiste, und zwei am Gleichlauf der vier
     Umschalter (schreiben und lesen sind zwei Richtungen, und der Fehler
     hatte genau eine davon).
     782 SEIT 0.25.3: einer (791) fuer den Befund am Vokabelraster -- er nimmt
     beide Zeilen der Reparatur auf einmal, weil sie EINE Zusage sind: ohne die
     Spalte gibt es keine Unterkante, und ohne die Unterkante nuetzt die Spalte
     nichts.
     785 SEIT 0.25.4: drei neue (792 bis 794) fuer die drei harten Sprachfehler
     -- das tuerkische Stueck wieder ein Woertchen statt eines Verbs, das
     Anfuehrungszeichen am Tagzeichen wieder offen, und der Zaehlwert wieder
     unter einem fremden Namen gereicht. ZWEI VON DREI GREIFEN AN EINER
     SPRACHDATEI und nicht am Quelltext, und das ist hier richtig: dort sass
     der Fehler. Ein Rueckbau, der nur Programmzeilen kennt, kann einen
     Sprachfehler nicht stellen.
     801 SEIT 0.26.0, BA 1 BIS 4 UND BA 6: sechzehn neue (795 bis 810). Sieben
     an den kleinen Befunden -- zwei am Dateifeld, das `textContent` mit dem
     Hinweistext hinauswarf (Traeger und Fortschritt sind zwei Richtungen),
     einer an der Fusszeile der Sitzungen, einer am Eintragstitel, zwei am
     Ausfuhrknopf (die Flexkinder UND der Satz, der die Klammer aufmacht --
     der eine greift am Quelltext, der andere an einer Sprachdatei), einer am
     Gewichtssatz hinter der Adminklemme. Drei an den Einzeilern: die tote
     Stilblattregel, der Hinweis an der Zeitleiste, `ss` und `ß`. Und sechs am
     Potenzialmodus -- vier an den Stellen der Oberflaeche und zwei am Server,
     einer davon an der Klemme (Eigentuemer statt Admin, F3) und einer daran,
     dass die Antwort den Stand des Schalters ueberhaupt nennt.
     802 SEIT 0.26.0, BA 5: einer (811) daran, dass `renderList()` den
     Bildschirm wieder leert, bevor jemand gefragt hat. ER NIMMT NUR DIE
     BEDINGUNG und laesst die Zuweisung stehen: eine Zuweisung, die ganz
     fehlte, waere ein ANDERER Fehler -- kein Platzhalter beim ersten
     Betreten -- und ein Rueckbau soll den alten Zustand herstellen und
     keinen dritten.
     803 SEIT 0.26.0, BEIPACK: einer (812) daran, dass der Lauf wieder nur an
     `main` haengt. ER NIMMT DEN ZWEIGFILTER UND LAESST DEN KNOPF STEHEN --
     zwei Ereignisse bleiben es damit, und genau darauf zielt er: die Zusage
     hat bis zum 10. September nur GEZAEHLT, und eine zaehlende Zusage bliebe
     hier stumm.
     814 SEIT 0.27.0: ELF neue, 813 bis 823, und jeder faehrt gegen GENAU EINE
     der elf Zusagen des Auftrags -- der vierte Wert, die Rechtezeile, die
     Vorgabe, die gelesene Wahl, die Groessenpruefung, das Format der
     Ableitungen, die zweite Haelfte des Bestandslaufs, der Lauf am
     Umschalten, die Auflage in der Karte, die Richtung der Migration und der
     alte Schluessel.
     815 SEIT DEM NACHTRAG ZU F7: der zwoelfte (824) nimmt den Satz an der
     Einfuegestelle aus der Zeile, in der er GEZEICHNET wird -- und nicht aus
     der Sprachdatei. Ein Satz, der dort steht und nirgends erscheint, ist
     genau der Fall, den diese Gegenprobe finden soll; 485 ist an derselben
     Bauform STUMM geblieben. Der Betreiber hat F7 am 10. September 2026
     ausdruecklich entschieden -- „behalten, aber kuerzer" --, und eine
     entschiedene Sache bekommt eine Zusage.
     DIE NEUNZEHN ALTEN DIESER SACHE STEHEN NICHT ZWEIMAL DA (431 bis 435,
     454 bis 462, 493, 506 bis 508, 522 bis 524, 810): sie sind MITGEGANGEN
     und zeigen auf die Zeilen, die dieselbe Sache jetzt tragen (Stolperstein
     201). Ein zweiter Rueckbau daneben waere eine zweite Wahrheit ueber
     denselben Fund. */
  /* 815 + 29 = 844 -- die Gegenproben von 0.28.0, nummeriert von 825 bis 853.
     SIE SIND DIE TEUERSTE HAELFTE DER RUNDE, und die Zahl steht hier
     ausdruecklich: eine Gegenprobe, die still verschwindet, nimmt eine Zusage
     mit, die niemand mehr belegt. */
  /* 844 + 15 = 859 -- die Gegenproben von 0.28.1, nummeriert von 854 bis 868.
     FUENFZEHN UND NICHT SIEBZEHN: die Zusagen 4 bis 8 (die Kopfzeile, das
     Blaettern, das Suchfeld) sind mit 0.28.0 gekommen und haben ihre
     Rueckbauten seither. Diese Runde hat sie UMGEDREHT und nicht neu gemacht,
     und ein zweiter Rueckbau auf dieselbe Zeile belegte nichts, was der erste
     nicht schon belegt. Zusage 17 haelt das Wegeverzeichnis mit den seinen.
     FUENF VON IHNEN ZIEHEN MIT (613, 614, 806, 833, 835): sie zeigen auf die
     Zeilen, die dieselbe Sache jetzt tragen (Stolperstein 201). */
  /* 859 WURDEN 885 -- 0.29.0, und die sechsundzwanzig neuen tragen die
     Nummern 869 bis 894: je einer fuer die Sicherungsprobe, den Fingerprint,
     das Faelligkeitsdatum, den partiellen Index, die beiden Bildschirmbefunde
     und „Titel" in beide Richtungen. Vier vorhandene sind MITGEZOGEN und nicht
     ersetzt worden (233, 448, 806, 866), einer hat den Gegenstand gewechselt
     (858: dirOf() ist gefallen, er zielt jetzt auf `start`). */
  /* 885 WURDEN 906 -- 0.30.0, und die EINUNDZWANZIG neuen tragen die Nummern
     895 bis 915: je einer fuer den Portblick, das Wartefenster und seine
     Meldung, den Aufraeumer, die Schlusstafel, die Kurve der Anmeldebremse und
     ihre Verdrahtung, die vier Klammern des Pruefschalters, die beiden festen
     deutschen Woerter und die Wache darueber, die zweite Einteilung, die vier
     Farben, das Datum an der erledigten Aufgabe, die Luft der Vokabelkarte,
     die Klammer von C1a, die Zahl am gefallenen Umschalter und den langen
     Knopf.
     FUENF VORHANDENE SIND NACHGEZOGEN und nicht ersetzt worden (604, 605, 636,
     658, 889): ihre Suchtexte standen nach dieser Runde nicht mehr da. Ein
     Rueckbau, dessen Suchtext fehlt, ist ein Fund ueber die LISTE -- in 0.29.0
     waren es fuenf, in dieser Runde wieder.
     605 HAT DABEI DEN GEGENSTAND GEWECHSELT, ohne die Sache zu wechseln: er
     setzt jetzt den NAMEN zurueck, der von 0.21.0 bis 0.30.0 im Waechter
     stand, statt ihn zu halbieren -- und macht damit zwei Zusagen rot statt
     einer. */
  /* 933 WURDEN 942 -- 0.30.3, und die NEUN neuen tragen die Nummern 943 bis
     951: je einer fuer die Zahl der Wolkenreihen, ihre Geltung am
     Schreibtisch, die beiden Ausgaenge der Bedingung ueber `tags-deep`, den
     Abstand in der Rechnung des Reihenzaehlers, seine eigene Messung, seinen
     Blick auf das Abgeschnittene und die beiden Regeln, die ohne Traeger
     wieder immer gaelten.
     DREI VORHANDENE SIND NACHGEZOGEN und nicht ersetzt worden (916, 935, 936):
     die drei Regeln der Tagzeile nennen seit dieser Runde ihren Traeger, und
     die Suchtexte sind mitgewandert. */
  /* 942 WURDEN 954 -- 0.31.0, und die ZWOELF neuen tragen die Nummern 952 bis
     963: je einer fuer die elf Zusagen der Runde, und zwei fuer die zweite,
     weil sie zwei Haelften hat (der Wert im Skript und der Abstand im
     Stilblatt).
     JEDER NIMMT GENAU EINE SACHE ZURUECK. Einer, der zwei Zusagen zugleich
     traefe, saehe in der Tabelle aus wie ein starker Beleg und waere in
     Wahrheit einer, der nicht sagt, welche von beiden ihn gefangen hat.
     FUENF VORHANDENE SIND NACHGEZOGEN und nicht ersetzt worden (66, 472, 485,
     821, 825): ihre Suchtexte standen nach dieser Runde nicht mehr da -- vier
     davon, weil der Satz ein anderer ist, und 825, weil der Abstand jetzt aus
     einer Klasse kommt. Ein Rueckbau, dessen Suchtext fehlt, ist ein Fund
     ueber die LISTE. */
  /* 954 WURDEN 968 MIT 0.31.1: vierzehn neue fuer die elf Zusagen jener Runde
     -- Zusage 2 bekommt drei, weil sie drei Sorten Bruchstueck verbietet und
     ein Rueckbau je Sorte sagt, welche gefangen hat.
     UND SECHZEHN VORHANDENE SIND NACHGEZOGEN (30, 315, 317, 330, 363, 367,
     383, 505, 540, 628, 639, 688, 794, 799, 800, 821, 963): ihre Suchtexte
     standen nach dem Verschmelzen nicht mehr da. Die Zeile darunter hat sie
     alle sechzehn gemeldet -- sie ist damit selbst der Beleg dafuer, dass ein
     Rueckbau, der ins Leere greift, auffaellt. */
  /* UND 968 WURDEN 979 MIT 0.31.2: zehn neue, einer je Zusage jener Runde --
     und ein elfter, weil Zusage 1 nach der Bestellung des Betreibers ZWEI
     Haelften hat: „kein deutscher Wert ist angefasst" (978) und „genau diese
     zwei sind es auf Bestellung" (988). Eine Ausnahme ohne Gegenprobe ist eine
     Behauptung.
     KEINE VORHANDENE MUSSTE NACHGEZOGEN WERDEN, und das ist eine Aussage ueber
     die Runde und nicht ueber die Liste: 0.31.1 hat sechzehn Suchtexte
     gebrochen, weil sie die ABLAGE der deutschen Saetze angefasst hat -- diese
     hier fasst nur englische WERTE an, und die stehen in keinem Suchtext eines
     aelteren Rueckbaus. Der eine, der einen englischen Wert traf, war meiner
     eigenen (983): sein Suchtext ist mit dem Satz nachgezogen, den der
     Pruefstand in derselben Stunde gemeldet hat. */
  /* UND 979 WURDEN 992 MIT 0.31.3: dreizehn neue, einer je Zusage jener Runde
     (989 bis 1001). EINE VORHANDENE MUSSTE NACHGEZOGEN WERDEN -- 793: sie sucht
     `entry.tagQuote` mit dem DEUTSCHEN Anfuehrungszeichenpaar, und 0.31.3 hat
     es in `tr.json` zu `“…”` gemacht. Die Zeile darunter hat sie gemeldet, mit
     Datei und null Treffern -- wieder der Beleg, dass ein Rueckbau, der ins
     Leere greift, auffaellt. */
  /* UND 992 WURDEN 1000 MIT 0.31.4: acht neue (1002 bis 1009), und DREI
     vorhandene sind nachgezogen -- 689 (`plural` wurde `counted`), 994 (der
     Satz traegt jetzt die Einzahlform) und 997, das sich mit seiner Zusage
     GEDREHT hat: es nimmt die Mehrzahl weg, statt sie einzubauen.
     DREI DER ACHT HAT DER AUGENSCHEIN VERDIENT und kein Muster ueber eine
     Datei: 1007 haengt die Kruecke „listesi" wieder hinter das Vokabelwort
     (das verstoesst gegen keine Verbotsliste und gegen keinen Platzhalter),
     1008 setzt die Zahl wieder vor die Mehrzahl in der Vorschau der
     Vokabelkarte (eine Zahl in einem String, ohne `plural()` und ohne
     `counted()`), und 1009 laesst dieselbe Vorschau die Sprache DES LESERS
     fragen statt der gezeigten -- der feinste der drei, weil er fuer einen
     tuerkischen Leser gar nichts aendert. */
  /* UND 1000 WURDEN 1017 MIT 0.32.0: siebzehn neue (1010 bis 1026), und ACHT
     vorhandene sind nachgezogen -- 01, 04, 31, 44 und 378 (die Serverdateien
     tragen ihre Saetze jetzt als Schluessel), 286 und 321 (die Glockenabfrage
     ist eine Spalte breiter), 292, 315, 417, 617 und 621 (die Tafel ist
     geteilt, der Kommentartext hat ein viertes Stueck, das Wort neben den
     Statuspillen nennt seinen Wert) sowie 679, 961, 962, 972 und 992 (die
     berichtigten Werte der Sprachdateien).
     DREIZEHN DER VIERZEHN GEHOEREN JE EINER ZUSAGE DER RUNDE; die vierzehnte
     ist die SCHWESTER der Gegenprobe 787, die Punkt 31 ausdruecklich verlangt
     hat: sie setzt „Son yedekleme" auf „Son yedeğe" statt auf „Son yedek" --
     und war bis 0.31.4 STUMM, weil der Waechter ein `k` suchte.
     UND ZWEI DAZU FUER DEN AUFKLAPPER (1024, 1025): er fragt die Breite nicht
     mehr, und die Messung laeuft gar nicht mehr.
     UND EINER NACHGEREICHT (1026), weil 1023 STUMM BLIEB. 1023 nimmt die
     Uebersetzung des Anbieternamens aus der AUSWAHLLISTE, und es wurde kein
     Punkt rot: die Restprobe liest den Quelltext von server.js, und der Name
     steht in mail.js. Der Pruefstand fragt seither den laufenden Server in
     drei Sprachen -- und 1026 nimmt dieselbe Uebersetzung an der ZWEITEN
     Stelle weg, in der Anzeige dessen, was eingerichtet ist. Macht SIEBZEHN
     neue und 1017 im Ganzen. */
  /* UND 1017 WURDEN 1008 MIT 0.32.1 -- ZUM ERSTEN MAL WENIGER, und das gehoert
     zu einer Runde, die etwas AUSBAUT:
       −17  606 bis 623, 807 und 1022 bauten die Filterableitung zurueck. Sie
            greifen ins Leere, seit es die Ableitung nicht mehr gibt, und ein
            Rueckbau, der ins Leere greift, ist wertlos -- die Selbstprobe
            „jeder Suchtext kommt genau einmal vor" haette sie gemeldet.
            GELOESCHT UND NICHT UMGEDREHT: was sie zurueckbauten, existiert
            nicht mehr; umdrehen liesse sich nur ein Gegenstand, den es gibt.
            Was sie belegt haben, steht als Absatz in app.js bei
            `statusEffective` -- dort ist es nachlesbar, und dort gehoert es
            hin (Stolperstein 74 im Geist, nicht im Buchstaben).
       +8   1027 bis 1034 bauen sie WIEDER EIN -- und das ist die richtige
            Richtung fuer einen Ausbau: nicht „nimm weg, was da ist", sondern
            „bring zurueck, was weg sein soll". Dazu die Zaehlzeile (Wort
            statt Zahl, Farbe ohne Zeichen, Satz statt Aufzaehlung) und die
            drei Sprachfunde (die tuerkische Endung, die Fragepartikel, das
            fest eingebaute Vokabelwort). */
  /* UND 1008 WURDEN 990 MIT 0.33.0 -- zum zweiten Mal weniger, und diesmal
     ist das Wegnehmen die Sache selbst:
       −36  219 bis 223, 447, 580, 581, 702 bis 709, 720 bis 730, 760 bis 762,
            819, 822, 823, 882, 883 und 1015 bauten Migrationsbloecke zurueck.
            Es gibt sie nicht mehr, und ein Rueckbau, der ins Leere greift,
            ist wertlos -- die Selbstprobe „jeder Suchtext kommt genau einmal
            vor" hat sie namentlich gemeldet.
            GELOESCHT UND NICHT UMGEDREHT, aus demselben Grund wie die
            siebzehn in 0.32.1: umdrehen liesse sich nur ein Gegenstand, den
            es gibt. Was sie belegt haben, steht jetzt in der Gruppe „Der
            Hinweis auf einen unvollstaendigen Bestand" -- an DERSELBEN
            Prueflage, nur mit der umgekehrten Zusage.
       +18  1035 bis 1052 bauen WIEDER EIN, was diese Runde ausgebaut hat:
            den Hinweis samt seiner Probe, die weiche Klammer um die beiden
            Indizes, die beiden Abfragen, die eine fehlende Spalte
            uebergehen, die Abweisung zu alter Dateien, die Programmfassung in
            der Exportdatei, den Stempel der Datenbank, die JPEG-Haelfte des
            Bestandslaufs und zwei deutsche Konsolenansagen.
            DAS IST DIE RICHTUNG FUER EINE RUNDE, DIE WEGNIMMT: nicht „nimm
            weg, was da ist", sondern „bring zurueck, was weg sein soll" --
            und wenn davon keine Pruefung rot wird, ist der Hinweis nicht
            belegt (Frage F11).
       +4  1057 bis 1060 — 0.33.2, der zweite Befund aus dem Betrieb. Sie
            schreiben den rohen Schluessel in die Sicherungszeile zurueck,
            nehmen dem Grund seine Werte, und machen je einen der elf Saetze
            wieder deutsch, die diese Runde uebersetzt hat.
       +4  1053 bis 1056 — 0.33.1, ein Befund aus dem Betrieb. Sie bringen den
            rohen Anbieternamen ins Protokoll zurueck, jagen umgekehrt auch
            eine Marke durch den Schluessel, nehmen den englischen Namen aus
            der Sprachdatei und werfen mail.js wieder aus dem Sprachwaechter.
            ZWEI VON IHNEN HABEN BEIM ERSTEN LAUF INS LEERE GEGRIFFEN, und der
            Grund gehoert hierher: der Treiber patcht eine Kopie aus
            `git archive HEAD` und nicht den Arbeitsstand. Wer einen Rueckbau
            auf eine Zeile setzt, die noch nicht committet ist, bekommt
            „RUECKBAU GESCHEITERT" und keinen Fund. */
  check(`Es sind genau 998 Rueckbauten`, gpList.length === 998, `${gpList.length}`);
  const gpTwice = gpList.map(r => r.nr).filter((n, i, a) => a.indexOf(n) !== i);
  check('Und keine Nummer steht zweimal', gpTwice.length === 0, gpTwice.join(' '));
  /* JEDER GREIFT: der Suchtext kommt in seiner Datei GENAU EINMAL vor. Keinmal
     heisst veraltet, mehrfach heisst mehrdeutig -- beides macht den Rueckbau
     wertlos, und beides faellt hier auf, nicht erst nach zwanzig Stunden. */
  const gpFail = [];
  for (const r of gpList) {
    const file = path.join(__dirname, r.file);
    if (!fs.existsSync(file)) { gpFail.push(`${r.nr}: ${r.file} gibt es nicht`); continue; }
    if (r.copy) continue;
    const n = fs.readFileSync(file, 'utf8').split(r.search).length - 1;
    if (n !== 1) gpFail.push(`${r.nr} (${r.file}): ${n} Treffer`);
  }
  check('Jeder Suchtext kommt in seiner Datei genau einmal vor',
    gpFail.length === 0, gpFail.join(' · '));
  // Ein Ersatz, der dem Suchtext gleicht, baut nichts zurueck -- die Kopie
  // waere wortgleich mit dem Kopf des Zweiges, und alles bliebe gruen.
  const gpEqual = gpList.filter(r => r.search !== undefined && r.search === r.replacement);
  check('Und kein Ersatz ist mit seinem Suchtext wortgleich',
    gpEqual.length === 0, gpEqual.map(r => r.nr).join(' '));
  // Jeder Eintrag traegt entweder eine Textersetzung ODER eine Kopie, nie
  // beides und nie keines von beiden.
  const gpForm = gpList.filter(r =>
    (r.copy === undefined) === (r.search === undefined || r.replacement === undefined));
  check('Jeder Rueckbau traegt entweder Suche und Ersatz oder eine Kopie',
    gpForm.length === 0, gpForm.map(r => r.nr).join(' '));
  // Und er nennt die Gruppe, in der die roten Punkte erwartet werden. Sie ist
  // eine Notiz und keine Bedingung -- aber eine fehlende waere eine Zeile
  // weniger beim Deuten der Tabelle.
  const gpWithoutExpected = gpList.filter(r => !r.expected || !r.name);
  check('Und jeder nennt Name und erwartete Gruppe',
    gpWithoutExpected.length === 0, gpWithoutExpected.map(r => r.nr).join(' '));

  /* ---- DIE MELDUNG „STUMM" MUSS EINEN STUMMEN RUECKBAU AUCH SEHEN KOENNEN.
     DER BEFUND, DER DIESE DREI ZEILEN AUSGELOEST HAT: die Pruefung „Jeder
     Suchtext kommt in seiner Datei genau einmal vor" -- die eine Zeile
     hoeher -- wird bei JEDEM gefahrenen Rueckbau rot, denn er hat seinen
     Suchtext gerade ersetzt. Zaehlt die Tabelle einfach alle roten Punkte,
     ist `red.length` nie null, und „0 STUMM" ist eine Auskunft ueber nichts.
     Genau daran ist Rueckbau 265 in 0.15.0 durchgerutscht (Stolperstein 213).
     GEPRUEFT WIRD AN GESTELLTEN AUSGABEN und nicht am laufenden Werkzeug: ein
     Gegenprobenlauf dauert Minuten, diese drei Zeilen Millisekunden. ---- */
  const gpRead = require('./counterproof').readRun;
  check('Der Leser der Gegenprobe ist von aussen erreichbar',
    typeof gpRead === 'function', typeof gpRead);
  const gpOnlySelf = gpRead([
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  4346 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Ein Lauf, der NUR die Selbstprobe rot macht, gilt als stumm',
    gpOnlySelf.red.length === 1 && gpOnlySelf.byContentRed.length === 0,
    JSON.stringify([gpOnlySelf.red.length, gpOnlySelf.byContentRed.length]));
  /* DIE GEGENLAGE, sonst belegt die Zeile darueber nichts: dieselbe Selbstprobe
     mit EINER inhaltlichen Zeile daneben gilt sehr wohl als greifend. */
  const gpIncludingContent = gpRead([
    '── Die Begruendung kommt zur Ruhe — 0.15.0 ─────',
    '  ✗ Escape schliesst das Feld, ohne etwas zu schicken',
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  4345 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Und einer mit einer inhaltlichen Zeile daneben nicht',
    gpIncludingContent.red.length === 2 && gpIncludingContent.byContentRed.length === 1 &&
    gpIncludingContent.byContentRed[0].group === 'Die Begruendung kommt zur Ruhe — 0.15.0',
    JSON.stringify(gpIncludingContent.byContentRed));
  /* UND DIE DRITTE LAGE, an der es bis 0.16.0 falsch stand: eine ANDERE rote
     Zeile IN der Gruppe „Die Gegenproben greifen". Ausgeblendet gehoert die
     eine Selbstprobe und nicht die ganze Gruppe -- sonst faellt jeder Rueckbau
     durch, dessen eigene Zusagen ausgerechnet dort stehen.
     GENAU DAS IST RUECKBAU 300 PASSIERT: er machte „Eine Nummer als Argument
     greift NICHT in die Namen hinein" sauber rot und wurde als STUMM
     gemeldet. Ein zu grober Filter macht aus einem Beleg einen Fund. */
  const gpOwnGroup = gpRead([
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  ✗ Eine Nummer als Argument greift NICHT in die Namen hinein',
    '  4345 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Eine ANDERE rote Zeile derselben Gruppe zaehlt sehr wohl',
    gpOwnGroup.red.length === 2 && gpOwnGroup.byContentRed.length === 1 &&
    gpOwnGroup.byContentRed[0].name === 'Eine Nummer als Argument greift NICHT in die Namen hinein',
    JSON.stringify(gpOwnGroup.byContentRed));

  /* ---- EIN ABGERISSENER LAUF MUSS SAGEN, WARUM -- 0.20.1.
     DER BEFUND: Rueckbau 568 riss beim ersten Anlauf nach 79 Sekunden ab, und
     der Bericht sagte „Rueckgabewert 1" -- eine Zahl ohne jede Auskunft. Der
     Grund lag in der eingefangenen Ausgabe (der Treiber faengt stdout UND
     stderr ein), gedruckt hat er ihn nicht, und die Kopie ist beim Aufraeumen
     weg. Damit war die Ursache nicht mehr feststellbar: eine Stunde Suche, an
     deren Ende kein Befund stand, sondern nur die Gewissheit, dass das
     Werkzeug ihn weggeworfen hatte (Stolperstein 301).
     ZWEI WEGE ENDEN OHNE SCHLUSSBLOCK, und nur EINER schreibt eine Zeile, die
     der Leser kennt: der aeussere Fang druckt „Prueflauf abgebrochen: ...".
     Ein unbehandeltes Ereignis ausserhalb der abgewarteten Kette druckt davon
     nichts -- Node legt Message und Aufrufweg auf stderr und geht mit 1.
     Fuer diesen zweiten Weg ist der Schwanz die einzige Auskunft. ---- */
  const gpTeardown = gpRead([
    '── Alte Sicherungen aufraeumen: der echte Ordner ─────',
    '  ✓ Sieben Kopien liegen im Ordner',
    '  ✗ Die Nummern laufen von 1 bis 7',
    'node:events:497',
    '      throw er;',
    'Error: listen EADDRINUSE: address already in use 127.0.0.1:6110'
  ].join('\n'));
  check('Ein Lauf ohne Schlussblock gilt als abgerissen',
    gpTeardown.ranThrough === false && gpTeardown.teardown === null,
    JSON.stringify([gpTeardown.ranThrough, gpTeardown.teardown]));
  check('Und er hebt die letzten Zeilen auf, damit der Grund lesbar bleibt',
    gpTeardown.tail?.includes('Error: listen EADDRINUSE: address already in use 127.0.0.1:6110'),
    JSON.stringify(gpTeardown.tail));
  /* UND DER BERICHT MUSS SIE AUCH DRUCKEN. Ein Schwanz, den nur der Leser
     kennt, hilft niemandem: gelesen wird die Tabelle. Gemessen wird deshalb an
     der ECHTEN Ausgabe der echten Berichtsfunktion und nicht am Quelltext --
     ein Suchmuster ueber den Quelltext bliebe gruen, wenn die Schleife zwar
     dasteht, aber ueber die falsche Liste laeuft. */
  const gpTable = require('./counterproof').writeTable;
  const printed = [];
  const realLog = console.log;
  console.log = (...parts) => printed.push(parts.join(' '));
  try {
    gpTable([{ nr: '568', name: 'Ein Rueckbau', file: 'server.js', trace: 0,
                 seconds: 79, code: 1, ...gpTeardown }]);
  } finally { console.log = realLog; }
  check('Und der Bericht druckt sie unter den Abriss',
    printed.some(z => z.includes('LAUF ABGERISSEN')) &&
    printed.some(z => z.includes('EADDRINUSE')),
    JSON.stringify(printed.filter(z => /ABGERISSEN|│/.test(z))));

  /* ---- WELCHES ARGUMENT WELCHEN RUECKBAU MEINT -- 0.16.0.
     DER BEFUND: `node counterproof.js 2 256` fuhr neben Rueckbau 256 auch die 83
     mit, denn deren Name „SHA-256 statt SHA-1" traegt die Zeichenfolge 256.
     Der Beifang war STUMM und verfaelschte damit die Gegenprobentabelle -- ein
     Rueckbau ohne roten Punkt, den niemand angefordert hatte.
     GEPRUEFT WIRD AN GESTELLTEN FAELLEN und nicht an einem Lauf: die Frage ist
     eine Frage an die Regel, und die Regel steht als eigene Funktion da. Ein
     Lauf beantwortete dieselbe Frage in Minuten. ---- */
  const gpMatches = require('./counterproof').matchesRegression;
  check('Die Regel, welches Argument welchen Rueckbau meint, ist von aussen erreichbar',
    typeof gpMatches === 'function', typeof gpMatches);
  const gpCase = { nr: '83', name: 'SHA-256 statt SHA-1' };
  check('Eine Nummer als Argument greift NICHT in die Namen hinein',
    gpMatches(gpCase, '256') === false, JSON.stringify(gpMatches(gpCase, '256')));
  /* DIE GEGENLAGE, sonst belegte die Zeile darueber nichts: dieselbe Nummer an
     ihrem eigenen Rueckbau greift sehr wohl -- die Regel darf nicht einfach
     alles abweisen, was aus Ziffern besteht (Stolperstein 189). */
  check('Und dieselbe Nummer greift an ihrem eigenen Rueckbau',
    gpMatches({ nr: '256', name: 'Ein anderer Rueckbau' }, '256') === true,
    JSON.stringify(gpMatches({ nr: '256', name: 'Ein anderer Rueckbau' }, '256')));
  // Der Weg ueber den Namen bleibt, solange das Argument kein reiner Zahlwert
  // ist: wer nach Text sucht, schreibt Text.
  check('Ein Text als Argument greift weiterhin in die Namen',
    gpMatches(gpCase, 'sha') === true && gpMatches(gpCase, 'SHA-256') === true,
    JSON.stringify([gpMatches(gpCase, 'sha'), gpMatches(gpCase, 'SHA-256')]));
  // Die Wortnummern sind keine reinen Ziffernfolgen und gehen deshalb weiter
  // ueber beide Wege -- sonst waeren W2, W5 und W6 unerreichbar geworden.
  check('Und die Wortnummern bleiben erreichbar',
    gpMatches({ nr: 'W2', name: 'Eine Portbasis' }, 'W2') === true &&
    gpMatches({ nr: 'W2', name: 'Eine Portbasis' }, 'w2') === true,
    'W2 / w2');
  /* UND DIE PROBE AN DER ECHTEN LISTE. Erst nachsehen, ob es die beiden
     Rueckbauten ueberhaupt gibt -- eine Probe an einer leeren Menge bliebe
     gruen, ohne etwas zu belegen (Stolperstein 81). */
  const gp256 = gpList.find(r => r.nr === '256');
  const gp83 = gpList.find(r => r.nr === '83');
  check('Die beiden Rueckbauten des Befundes stehen in der Liste',
    !!gp256 && !!gp83 && /256/.test(gp83.name),
    `${gp256 ? gp256.nr : '—'} / ${gp83 ? gp83.name : '—'}`);
  if (gp256 && gp83) {
    const gpHit = gpList.filter(r => gpMatches(r, '256')).map(r => r.nr);
    check('Das Argument 256 waehlt an der echten Liste genau einen Rueckbau',
      gpHit.length === 1 && gpHit[0] === '256', gpHit.join(' '));
  }

  /* ---- KEIN FREMDER SERVER, BEVOR DIE GEGENPROBEN LOSFAHREN -- 0.21.0 ----
     DER BEFUND: sieben Server aus abgebrochenen Laeufen hingen noch an den
     Ports 6180 bis 6242, mitten im Fenster der Mailgruppe. Spur 0 faehrt ohne
     Versatz und lief gegen sie. Zwei Rueckbauten bekamen dadurch rote Punkte
     IM MAILVERSAND -- und einer davon (570) hatte in seiner EIGENEN Gruppe
     keinen einzigen. Die Tabelle zeigte ihn trotzdem als „2 rot" und damit als
     Beleg. SIE HAT IN DIE GEFAEHRLICHE RICHTUNG GELOGEN: ein stummer Rueckbau
     sah aus wie ein greifender.
     GEPRUEFT WIRD AM LAUFENDEN PRUEFLAUF SELBST -- er IST ein solcher Prozess,
     und damit hat diese Zeile einen Gegenstand und ist nicht die Frage, ob
     eine leere Liste leer ist (Stolperstein 81). */
  const gpForeign = require('./counterproof').foreignServer;
  check('Die Suche nach fremden Servern ist von aussen erreichbar',
    typeof gpForeign === 'function', typeof gpForeign);
  const gpFound = typeof gpForeign === 'function' ? gpForeign() : [];
  /* DER GEGENSTAND SIND DIE SERVER DIESES LAUFS. Der Hauptserver steht die
     ganze Zeit da -- damit hat diese Zeile etwas zu finden und ist nicht die
     Frage, ob eine leere Liste leer ist (Stolperstein 81). */
  const gpOwn = gpFound.find(f => f.script === 'server.js' && f.wo === __dirname);
  check('Und sie findet die laufenden Server dieses Laufs',
    Boolean(gpOwn), `${gpFound.length} gefunden: ` +
    gpFound.map(f => `${f.pid}:${f.script}`).slice(0, 6).join(' '));
  /* UND SIE SAGT, WO EINER LIEGT UND AUF WELCHEM PORT. Ohne diese Angaben
     muesste der Leser raten, welches Fenster belegt ist -- und genau das
     Raten hat in dieser Runde zwei Stunden gekostet. */
  check('Und sie nennt zu jedem Fund Verzeichnis und Port',
    Boolean(gpOwn) && gpOwn.wo === __dirname && /^\d+$/.test(gpOwn.port || ''),
    JSON.stringify(gpOwn));
  /* SICH SELBST MELDET SIE NICHT. Der Treiber ist kein fremder Server -- ohne
     diese Zeile braeche er an sich selbst ab und faende nie einen Rueckbau. */
  check('Und sich selbst meldet sie nicht',
    !gpFound.some(f => f.pid === process.pid),
    `eigene Nummer ${process.pid}, gefunden ${gpFound.map(f => f.pid).join(' ')}`);
  /* DER TREIBER RUFT SIE AUCH -- und geht, statt zu warnen. Am Verhalten
     waere das von hier aus nicht zu sehen: haupt() laeuft nur beim direkten
     Aufruf, und ein zweiter Gegenprobenlauf aus dem Prueflauf heraus waere
     genau der Unfug, gegen den diese Zeile gebaut ist. Also der Quelltext --
     dieselbe Bauform wie beim zweiten Musterwaechter von 0.20.0. */
  const gpSource = fs.readFileSync(path.join(__dirname, 'counterproof.js'), 'utf8');
  const gpOneLine = gpSource.replace(/\s+/g, ' ');
  /* SEIT 0.30.0 SIND ES ZWEI BLICKE (F7): der ueber die Befehlszeile und der
     ueber die Ports. Sie finden VERSCHIEDENES -- der erste auch einen Server,
     der gerade erst startet und noch nicht horcht; der zweite auch einen,
     dessen Befehlszeile nichts verraet. Abgebrochen wird, sobald EINER von
     beiden etwas sieht. */
  check('Der Treiber sieht vor dem ersten Rueckbau nach und bricht ab',
    gpOneLine.includes('const foreign = foreignServer(); const busy = foreignPort(foreign.map(f => f.port)); if (foreign.length || busy.length) {') &&
    /if \(foreign\.length \|\| busy\.length\) \{[\s\S]{0,1400}?process\.exit\(1\);/.test(gpSource) &&
    gpSource.indexOf('const foreign = foreignServer();') <
      gpSource.indexOf('await runAll(list, traces, level)'),
    (gpOneLine.match(/const foreign = foreignServer\(\)[^;]*/) || ['(nicht gefunden)'])[0]);
  /* UND SIE SUCHT NACH BEIDEN NAMEN. Ein liegengebliebener PRUEFLAUF belegt
     genauso Ports wie ein liegengebliebener Server -- er startet ja welche.
     HIER STAND BIS 0.30.0 `pruefung.js`, UND DAS WAR DER FEHLER. Diese Zeile
     hat ihn nicht gefunden, weil sie denselben Namen abgeschrieben hat, den
     der Ausdruck trug: eine Zusage, die ihren Gegenstand ZITIERT, prueft sich
     selbst. Sie bleibt trotzdem stehen -- ein Tippfehler im Namen soll auch
     dann auffallen, wenn gerade kein Prozess laeuft --, und der ECHTE Beleg
     steht seit dieser Runde in „Der Waechter erkennt den Prueflauf": dort
     wird ein ECHTER Prozess gestartet und wiedergefunden (Zusage 1). */
  check('Und sie sucht nach beiden Namen -- Server wie Prueflauf',
    gpSource.includes('const script = parts.find(t => /(^|\\/)(server\\.js|testbench\\.js|test\\/[a-z0-9_]+\\.js)$/.test(t));'),
    (gpSource.match(/const script = parts\.find[^\n]*/g) || ['(nicht gefunden)']).pop());
  /* UND `pruefung.js` STEHT IN KEINER ZEILE CODE MEHR. Ein Ausdruck, der einen
     Namen sucht, den es nicht gibt, ist derselbe Fall wie ein Feld ohne Leser.
     GELESEN WIRD DER CODE UND NICHT DER KOMMENTAR -- dieselbe Ueberlegung wie
     bei `twoWays` in 0.28.1: der Absatz darueber ERZAEHLT von dem Namen, und
     ein Waechter, der ihn mitliest, zwaenge dazu, die Begruendung zu loeschen.
     Genau diese Begruendung ist die Lehre dieser Runde. */
  const gpCode = gpSource.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  check('Und der Name, den es nie gab, steht in keiner Zeile Code mehr',
    !/pruefung\.js/.test(gpCode), 'pruefung.js steht noch im Code von counterproof.js');

  /* ================= Die Ersatztexte der Rueckbauten — 0.34.1 =============
     Ein Suchtext, der nicht mehr passt, faellt sofort auf: der Rueckbau
     bricht ab und wird gemeldet. Ein Ersatztext, der nicht mehr passt, faellt
     nicht auf, solange irgendetwas rot wird. Bei W2 und W5 sind die alten
     Namen nach der Umbenennung in 0.34.0 stehengeblieben; W2 brach beim Laden
     ab, und die Gegenprobe meldete trotzdem Erfolg.
     Zwei Fassungen: die erste liest alle Ersatztexte gegen alle Woerter des
     Projekts, die zweite die Rueckbauten auf Pruefstandsdateien gegen ihre
     Zieldatei. Die zweite ist die schaerfere und deshalb nur dort moeglich:
     ein Rueckbau auf eine ausgelieferte Datei fuehrt absichtlich Namen ein,
     die es heute nicht mehr gibt. */
  group('Die Ersatztexte der Rueckbauten — 0.34.1');

  const rpWord = /[A-Za-z_$][A-Za-z0-9_$]*/g;
  const rpFiles = (() => {
    const found = [];
    (function walk(where) {
      for (const e of fs.readdirSync(where, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'data') continue;
        const p = path.join(where, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|html)$/.test(e.name)) found.push(p);
      }
    })(__dirname);
    return found;
  })();
  const rpAllWords = new Set();
  for (const f of rpFiles)
    for (const m of fs.readFileSync(f, 'utf8').matchAll(rpWord)) rpAllWords.add(m[0]);
  check('Der Waechter sieht die Woerter des ganzen Projekts',
    rpFiles.length >= 40 && rpAllWords.size > 20000,
    `${rpFiles.length} Dateien, ${rpAllWords.size} verschiedene Woerter`);

  const rpUnknown = [];
  for (const r of gpList) {
    if (!r.replacement) continue;
    const miss = [...new Set([...r.replacement.matchAll(rpWord)].map(m => m[0]))]
      .filter(n => !rpAllWords.has(n));
    if (miss.length) rpUnknown.push(`${r.nr} ${r.file}: ${miss.join(' ')}`);
  }
  check('Kein Ersatztext nennt ein Wort, das es im Projekt nirgends gibt',
    rpUnknown.length === 0, rpUnknown.slice(0, 6).join(' · '));

  /* Die schaerfere Fassung. Gelesen wird nur CODE: ein Name in einem Text ist
     keine Benennung. Der Rahmen und das Fenster zaehlen mit, weil jedes Modul
     seine Namen von dort bekommt; der Suchtext zaehlt mit, weil der Rueckbau
     ihn gerade ersetzt. */
  const rpCodeNames = (text, file) => {
    const found = new Set();
    for (const part of segment(text, file))
      if (part.kind === CODE)
        for (const m of part.value.matchAll(rpWord)) found.add(m[0]);
    return found;
  };
  const rpBuiltIn = new Set([...Object.getOwnPropertyNames(Array.prototype),
    ...Object.getOwnPropertyNames(String.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
    ...Object.getOwnPropertyNames(Promise.prototype)]);
  const rpBench = new Set([...benchFiles(), 'counterproof.js']);
  const rpFrame = new Set([
    ...rpCodeNames(fs.readFileSync(path.join(__dirname, 'test', 'frame.js'), 'utf8'), 'test/frame.js'),
    ...rpCodeNames(fs.readFileSync(path.join(__dirname, 'test', 'dom.js'), 'utf8'), 'test/dom.js')]);
  const rpStrange = [];
  let rpChecked = 0;
  for (const r of gpList) {
    if (!r.replacement || !rpBench.has(r.file)) continue;
    rpChecked++;
    const here = rpCodeNames(fs.readFileSync(path.join(__dirname, ...r.file.split('/')), 'utf8'), r.file);
    const searched = rpCodeNames(r.search || '', r.file);
    const miss = [...rpCodeNames(r.replacement, r.file)]
      .filter(n => !here.has(n) && !rpFrame.has(n) && !searched.has(n)
        && !rpBuiltIn.has(n) && !(n in globalThis));
    if (miss.length) rpStrange.push(`${r.nr} ${r.file}: ${miss.join(' ')}`);
  }
  check('Der Waechter sieht die Rueckbauten auf Pruefstandsdateien',
    rpChecked === 19, `${rpChecked} Rueckbauten`);
  check('Und jeder ihrer Namen steht in der Zieldatei, im Rahmen oder im Suchtext',
    rpStrange.length === 0, rpStrange.slice(0, 6).join(' · '));

  /* Und der Waechter wuerde den Fall von W2 wirklich melden. Der alte Name
     steht hier in Stuecken: ganz geschrieben stuende er in dieser Datei, und
     der Waechter faende seine eigene Gegenprobe. */
  const rpGone = 'const B = ' + 'starte' + 'WeiterenServer(' + 'frisch' + 'Dir, {}, 4000);';
  const rpToday = 'const B = start' + 'FurtherServer(fresh' + 'Dir, {}, 4000);';
  const rpKnown = (line) => [...line.matchAll(rpWord)].map(m => m[0]).every(n => rpAllWords.has(n));
  check('Der Leser wuerde einen alten Namen im Ersatztext melden',
    !rpKnown(rpGone) && rpKnown(rpToday),
    `alt: ${rpKnown(rpGone)} · heute: ${rpKnown(rpToday)}`);

  /* ================= Die Kommentare je Datei — 0.34.1 ====================
     Bis 0.34.0 bewachte eine Zeile die Kommentare: mehr als tausend ueber acht
     Dateien. Bei 38.000 Zeilen liessen sich 37.000 loeschen, und der Lauf
     bliebe gruen. Hier steht die Zahl je Datei.
     GEZAEHLT WIRD IN tools/comments.js: das Werkzeug beim Bauen und der
     Waechter im Lauf lesen dieselbe Funktion.
     EINGETRAGEN WIRD SIE AUCH VON DORT -- `node tools/comments.js --write`
     schreibt beide Listen. Von Hand nachgezaehlt stimmte sie nie. */
  group('Die Kommentare je Datei — 0.34.1');
  {
    const crAll = require('./tools/comments.js').measureAll();
    const COMMENT_ROWS = [
      ['testbench.js', 224],
      ['test/batchrun.js', 238],
      ['test/dom.js', 985],
      ['test/firstlogin.js', 47],
      ['test/frame.js', 555],
      ['test/keychange.js', 138],
      ['test/release_029.js', 133],
      ['test/release_030.js', 471],
      ['test/release_031.js', 1208],
      ['test/roundtrip.js', 6549],
      ['test/selfcheck.js', 869],
      ['test/source.js', 2087],
      ['test/ui_entry.js', 929],
      ['test/ui_export.js', 971],
      ['test/ui_inventory.js', 531],
      ['test/ui_language.js', 716],
      ['test/ui_overview.js', 1148],
      ['test/ui_style.js', 1318],
      ['test/ui_system.js', 1245],
      ['test/ui_translator.js', 250],
      ['counterproof.js', 3229],
      ['server.js', 5128],
      ['auth.js', 911],
      ['db.js', 272],
      ['mail.js', 72],
      ['keys.js', 45],
      ['attachments.js', 66],
      ['images.js', 37],
      ['batchrun.js', 57],
      ['usertool.js', 51],
      ['twofactor.js', 47],
      ['keytool.js', 55],
      ['public/app.js', 6419],
      ['public/theme.js', 5],
    ];
    const COMMENT_TOTAL = { comment: 37006, code: 59651 };
    check('Der Waechter sieht alle vierunddreissig Dateien',
      crAll.each.length === 34 && COMMENT_ROWS.length === 34,
      `${crAll.each.length} gemessen, ${COMMENT_ROWS.length} genannt`);
    const crWrong = [];
    for (let i = 0; i < COMMENT_ROWS.length; i++) {
      const [name, rows] = COMMENT_ROWS[i];
      const here = crAll.each[i];
      if (!here || here.file !== name || here.comment !== rows)
        crWrong.push(`${name}: ${rows} genannt, ${here ? here.comment : '—'} gezaehlt`);
    }
    check('Und jede traegt die Zahl, die hier steht',
      crWrong.length === 0, crWrong.slice(0, 8).join(' · '));
    check('Und die Zahl ueber alles steht ebenso',
      crAll.comment === COMMENT_TOTAL.comment && crAll.code === COMMENT_TOTAL.code,
      `${crAll.comment} Kommentar (${COMMENT_TOTAL.comment} genannt), ` +
      `${crAll.code} Code (${COMMENT_TOTAL.code} genannt), ${crAll.share.toFixed(1)} Prozent`);
  }

  /* ================= Die Groesse der Funktionen — 0.16.0 ================
     SIE MISST, SIE WEIST NICHT AB. Eine harte Grenze („keine Funktion ueber
     500 Zeilen") waere eine Zusicherung, die bei der ersten ehrlichen Ausnahme
     abgeschaltet wird -- und eine abgeschaltete Pruefung ist schlechter als
     keine. Gemessen und GENANNT wird die laengste Funktion je Datei; rot wird
     sie davon nicht.
     ROT WERDEN DARF EINE BEHAUPTUNG. Dieselbe Linie wie bei F_ROUTES und den
     271 Rueckbauten: welche Funktion die laengste einer Datei IST, steht in
     den Papieren dieser Runde -- und wenn eine andere sie ueberholt, soll das
     auffallen und nicht in einer Zahl untergehen, die niemand liest.
     Die LAENGE steht ausdruecklich nicht in der Bedingung: sie aendert sich mit
     jedem Kommentar, und eine Pruefung, die bei jeder Zeile rot wird, wird
     angepasst statt gelesen.

     WAS GEMESSEN WIRD: Funktionen auf der aeussersten Ebene -- das ist die
     Einheit, um die es geht. Eine Hilfsfunktion INNERHALB einer langen
     Funktion macht diese nicht kuerzer, sie steht in ihrer Zahl mit drin.
     WIE GEMESSEN WIRD: an der Einrueckung null. Dieser Quelltext schreibt jede
     aeussere Funktion an den linken Rand und schliesst sie mit einer Zeile,
     die nur aus `}` oder `};` besteht. Das ist keine Annahme ueber JavaScript,
     sondern eine ueber DIESEN Quelltext -- und sie wird gleich an einer
     gestellten Vorlage nachgesehen, damit das Werkzeug seinen eigenen Fund
     auch sehen kann (Stolperstein 213). */
  group('Die Groesse der Funktionen wird gemessen');

  function functionLengths(source) {
    const rows = String(source).split('\n');
    const found = [];
    let open = null;
    for (let i = 0; i < rows.length; i++) {
      const z = rows[i];
      if (!open) {
        const m = z.match(/^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/);
        if (m) { open = { name: m[1], from: i }; continue; }
        // Auch die Pfeilform am linken Rand, solange ihr Rumpf geklammert ist.
        const a = z.match(/^const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(?[^)]*\)?\s*=>\s*\{$/);
        if (a) { open = { name: a[1], from: i }; continue; }
      } else if (z === '}' || z === '};') {
        found.push({ name: open.name, from: open.from + 1, rows: i - open.from + 1 });
        open = null;
      }
    }
    return found.sort((a, b) => b.rows - a.rows || a.name.localeCompare(b.name));
  }

  /* ---- DAS WERKZEUG AN EINER GESTELLTEN VORLAGE ----
     Ohne diese vier Zeilen koennte functionLengths() die leere Liste liefern
     und alles darunter bliebe gruen -- eine Erfolgsmeldung, die ihren eigenen
     Fund nicht sehen kann, ist schlimmer als keine (Stolperstein 213). */
  const flProbe = [
    'function eins() {',                 // 3 Zeilen
    '  return 1;',
    '}',
    '',
    'const zwei = (a) => {',             // 5 Zeilen
    '  if (a) {',
    '    return 2;',
    '  }',
    '};',
    '',
    'async function drei() {',           // 2 Zeilen
    '}'
  ].join('\n');
  const flMeasured = functionLengths(flProbe);
  check('Das Werkzeug findet die Funktionen der gestellten Vorlage',
    equal(flMeasured.map(f => f.name), ['zwei', 'eins', 'drei']),
    JSON.stringify(flMeasured.map(f => `${f.name}:${f.rows}`)));
  check('Und es zaehlt ihre Zeilen richtig',
    equal(flMeasured.map(f => f.rows), [5, 3, 2]),
    JSON.stringify(flMeasured.map(f => f.rows)));
  // Die Gegenlage: eine Datei ohne Funktion liefert die leere Liste und keinen
  // Fehler -- das Stilblatt ist genau so eine.
  check('Und eine Vorlage ohne Funktion liefert die leere Liste',
    functionLengths('.a { color: red; }\n').length === 0);

  /* ---- DIE MESSUNG AN DEN AUSGELIEFERTEN DATEIEN ----
     GENANNT, NICHT GEPRUEFT: der Block darunter ist eine Auskunft. Er steht im
     Prueflauf, damit die Zahlen beim Bauen vor Augen sind und nicht erst beim
     Schreiben der Papiere gesucht werden muessen. */
  const flFiles = ['public/app.js', 'server.js', 'auth.js', 'db.js', 'attachments.js',
                     'twofactor.js', 'usertool.js', 'keytool.js', 'mail.js', 'keys.js',
                     ...benchFiles(), 'counterproof.js'];
  const flStatus = new Map();
  console.log('');
  console.log('  ── Die laengsten Funktionen je Datei ──────────────────────');
  for (const name of flFiles) {
    const filePath = path.join(__dirname, name);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, 'utf8');
    const list = functionLengths(source);
    flStatus.set(name, { list, rows: source.split('\n').length });
    const peak = list.slice(0, 3)
      .map(f => `${f.name} ${f.rows}`).join(' · ') || '—';
    console.log(`     ${name.padEnd(16)} ${String(source.split('\n').length).padStart(6)} Zeilen` +
                `  ·  ${String(list.length).padStart(3)} Funktionen  ·  ${peak}`);
  }
  console.log('  ──────────────────────────────────────────────────────────');

  /* ---- UND DIE BEHAUPTUNG, DIE ROT WERDEN DARF ----
     ERST DAS VORHANDENSEIN, DANN DIE EIGENSCHAFT (Stolperstein 81): eine
     Messung, die gar nichts gefunden hat, liefert `undefined` -- und jede
     Aussage darueber waere entweder wahr oder unfalsifizierbar. */
  const flLongest = (file) => (flStatus.get(file)?.list || [])[0];
  check('Die Messung findet in public/app.js ueberhaupt Funktionen',
    (flStatus.get('public/app.js')?.list || []).length > 50,
    `${(flStatus.get('public/app.js')?.list || []).length} gefunden`);
  check('Und in server.js ebenso',
    (flStatus.get('server.js')?.list || []).length > 30,
    `${(flStatus.get('server.js')?.list || []).length} gefunden`);
  /* DIE BEHAUPTUNG DIESER RUNDE. Bis 0.15.1 war es renderSystem() mit 2.466
     Zeilen; seit 0.16.0 steht sie bei 79, und die laengste ist renderDetail().
     Wer eine Funktion so weit wachsen laesst, dass sie renderDetail() ueberholt,
     soll es hier erfahren -- und die Zeile dann bewusst umschreiben, nicht
     wegnehmen (Stolperstein 74). */
  check('Die laengste Funktion in public/app.js heisst renderDetail',
    flLongest('public/app.js')?.name === 'renderDetail',
    `${flLongest('public/app.js')?.name} mit ${flLongest('public/app.js')?.rows} Zeilen`);
  check('Und die laengste in server.js heisst importInto',
    flLongest('server.js')?.name === 'importInto',
    `${flLongest('server.js')?.name} mit ${flLongest('server.js')?.rows} Zeilen`);
  /* UND DASS renderSystem() WIRKLICH ZERFALLEN IST. Das ist die Zusage dieser
     Runde, und sie waere ohne diese Zeile nur eine Behauptung im Protokoll.
     EINE OBERGRENZE MIT LUFT, keine Punktzahl: 79 gemessen, 300 verlangt --
     die Zeile faellt nicht bei jedem Kommentar um, sie faellt, wenn jemand
     wieder anfaengt, alles in EINE Funktion zu schreiben. */
  const flSystem = (flStatus.get('public/app.js')?.list || []).find(f => f.name === 'renderSystem');
  check('renderSystem() steht ueberhaupt noch in public/app.js', !!flSystem,
    'die Funktion gibt es nicht mehr');
  check('Und sie ist unter 300 Zeilen geblieben',
    !!flSystem && flSystem.rows < 300, `${flSystem?.rows} Zeilen`);

  group('Das Skript auf dem Wirt ist ausfuehrbar');

  /* ZWEI HAELFTEN, DIE ZUSAMMENGEHOEREN -- dieselbe Bauform wie beim
     Sicherungsort (Einhaengung und Variable).
     BEFUND AUS DEM BETRIEB: keytool.sh traegt im Repo den Modus 100755,
     kam auf dem Wirt aber ohne das Ausfuehrungsrecht an. Der Einspielweg packt
     das ZIP mit `python3 -m zipfile -e` aus, und das stellt KEINE Rechte
     wieder her -- unzip dagegen schon. Nachgestellt statt geglaubt.
     Deshalb wird BEIDES gehalten: das Recht an der Datei UND die chmod-Zeile
     im Einspielweg. Faellt eine der beiden weg, antwortet ./keytool.sh auf
     dem Wirt mit "Keine Berechtigung" (Stolperstein 140). */
  {
    const hostScripts = ['keytool.sh'];
    check('Der Lauf kennt das Skript auf dem Wirt',
      hostScripts.every(n => fs.existsSync(path.join(__dirname, n))),
      hostScripts.join(' · '));
    const withoutRight = hostScripts.filter(n => {
      try { return (fs.statSync(path.join(__dirname, n)).mode & 0o111) === 0; }
      catch { return true; }
    });
    check('Es traegt das Ausfuehrungsrecht',
      withoutRight.length === 0, `ohne Recht: ${withoutRight.join(' · ') || '—'}`);
    /* Und die zweite Haelfte: der Einspielweg in der README zieht es nach.
       Ohne sie steht das Recht zwar im Repo, kommt auf dem Wirt aber nicht an. */
    const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    check('Der Einspielweg in der README zieht das Recht nach',
      /chmod \+x kriterion\/keytool\.sh/.test(readme),
      'die Zeile "chmod +x kriterion/keytool.sh" fehlt');
    check('Und er sagt, warum sie noetig ist',
      /python3 -m zipfile -e[\s\S]{0,200}?Ausführungsrecht/.test(readme),
      'der Grund steht nicht daneben');
  }

  group('Die berichtigten Behauptungen stehen nirgends mehr');

  /* DREI BERICHTIGUNGEN AUS 0.19.1, und sie sind der Grund, warum es dieses
     Projekt gibt: es standen zwei falsche Messungen und ein widerlegter Satz
     im Quelltext und im Aenderungsprotokoll.
       a) `hex(substr(data,1,8))` hole die ersten Bytes, „ohne das Blob zu
          lesen" -- FALSCH, gemessen 657 ms an 205 MB, das 0,87-fache der
          Obergrenze.
       b) ein GROUP BY ueber 606 MB Bilddaten koste 3.235 ms kalt und 2.990 ms
          warm -- EINE MESSUNG, DIE ES NICHT GEGEBEN HABEN KANN; nachgemessen
          sind es bei 205 MB schon 919 ms.
       c) der Fall, dass ein PNG als WebP groesser waere, komme „am echten
          Bestand vor" -- WIDERLEGT: 679 von 679 umgestellt, keines geblieben.
     EIN WAECHTER UND KEIN VORSATZ. Ohne ihn wandert derselbe Satz beim
     naechsten Abschreiben zurueck -- genau so ist er aus dem Auftrag zu 0.19.0
     in den Quelltext gekommen.
     GESUCHT WIRD IN DEN AUSGELIEFERTEN DATEIEN UND IN DEN PAPIEREN, aber
     ausdruecklich NICHT im Aenderungsprotokoll dieser Runde und nicht im
     laufenden Auftrag: dort MUESSEN die alten Saetze zitiert stehen, sonst
     stuende die Berichtigung ohne ihren Gegenstand da. */
  {
    const corrected = [
      ['ohne das Blob zu lesen', 'die Behauptung ueber substr()'],
      ['3.235', 'die Messung, die es nicht gegeben haben kann'],
      ['2.990', 'die Messung, die es nicht gegeben haben kann'],
      ['kommt am echten Bestand vor', 'der widerlegte Satz zu Rueckbau 433'],
      ['kommt am ECHTEN Bestand vor', 'der widerlegte Satz zu Rueckbau 433']
    ];
    const searched = ['server.js', 'public/app.js', 'counterproof.js', 'README.md',
                        'CHANGELOG.md', 'Doku/Aenderungsprotokoll_0.19.0.md'];
    const matched = [];
    for (const file of searched) {
      const full = path.join(__dirname, ...file.split('/'));
      if (!fs.existsSync(full)) { matched.push(`${file}: gibt es nicht`); continue; }
      const text = fs.readFileSync(full, 'utf8');
      for (const [sentence, event] of corrected)
        if (text.includes(sentence)) matched.push(`${file}: ${event} („${sentence}")`);
    }
    /* ERST DAS VORHANDENSEIN DES GEGENSTANDS (Stolperstein 81): ein Waechter,
       der auf null Dateien laeuft, ist gruen und belegt nichts. */
    check('Der Waechter sieht alle sechs Dateien an',
      searched.every(d => fs.existsSync(path.join(__dirname, ...d.split('/')))),
      searched.filter(d => !fs.existsSync(path.join(__dirname, ...d.split('/')))).join(' · '));
    check('Keine der drei berichtigten Behauptungen steht noch irgendwo',
      matched.length === 0, matched.join(' · '));
    /* UND DIE BERICHTIGUNGEN STEHEN WIRKLICH DA. Ein Satz, der bloss
       verschwindet, ist geloescht und nicht berichtigt (Stolperstein 201) --
       gesucht wird deshalb nach dem, was an seine Stelle getreten ist. */
    const serverText = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('Stattdessen steht im Server, dass substr() das Blob sehr wohl liest',
      /substr\(\) AUF EINEM BLOB LIEST DAS BLOB/.test(serverText),
      'die Berichtigung fehlt');
    /* UND DIE NACHGEFAHRENE MESSUNG STEHT MIT IHREM GEGENSTAND DANEBEN --
       Zeilenzahl und Groesse der Datei, an der sie entstanden ist. Eine
       Messung ohne ihren Gegenstand laesst sich nicht widerlegen und deshalb
       auch nicht glauben (Stolperstein 280). */
    check('Und die nachgefahrene Messung mit ihrer Datenbankgroesse daneben',
      /400 ZEILEN A 512 kB \(312 MB\)/.test(serverText) && /1338,8 ms/.test(serverText),
      'die nachgefahrene Messung fehlt');
    const gpText = fs.readFileSync(path.join(__dirname, 'counterproof.js'), 'utf8');
    /* RUECKBAU 433 BLEIBT UND BLEIBT ALS STUMM ERWARTET -- er bewacht das
       Vorhandensein der Regel, auch wo er ihre Wirkung nicht zeigen kann.
       Berichtigt wird nur seine BEGRUENDUNG. */
    const rb433 = require('./counterproof').REGRESSIONS.find(r => r.nr === '433');
    check('Rueckbau 433 steht weiter in der Liste und weiter als STUMM erwartet',
      !!rb433 && /STUMM/.test(rb433.expected), JSON.stringify(rb433 && rb433.expected));
    check('Und seine Begruendung nennt jetzt die achtzehn Versuche und den echten Bestand',
      /achtzehn Laborversuche/.test(gpText) && /679 von 679/.test(gpText),
      'die berichtigte Begruendung fehlt');
  }

  group('Die Compose-Datei wird nicht ueberschrieben');

  /* DER BEFUND AUS DEM BETRIEB: `.env.example` liegt im Repo und `.env` in der
     .gitignore -- sauber. `docker-compose.yml` lag im Repo und stand in KEINER
     Ignorierliste. Wer das ZIP von GitHub ueber seinen Ordner entpackt, verlor
     damit seine angepasste Datei: den Port, die Einhaengung des
     Sicherungsorts, den Containernamen. IM FELD PASSIERT.
     GEBAUT WURDE GENAU DAS MUSTER, DAS `.env` SCHON HAT -- eine Vorlage im
     Repo, die Arbeitsdatei ignoriert, und ein Pflichtschritt in der README.
     DER STOPP KOMMT GESCHENKT: ohne Compose-Datei bricht `docker compose up`
     von sich aus ab („no configuration file provided: not found"). Karg, aber
     es haelt an -- ein zusaetzliches Startskript ist ausdruecklich NICHT
     gebaut worden.
     GEPRUEFT WERDEN ALLE DREI HAELFTEN ZUSAMMEN: eine Vorlage ohne
     Ignorierliste wird wieder ueberschrieben, eine Ignorierliste ohne
     Pflichtschritt laesst den Betreiber ohne Datei dastehen. */
  {
    const ignored = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8')
      .split('\n').map(z => z.trim());
    check('Die Vorlage liegt im Repo',
      fs.existsSync(path.join(__dirname, 'docker-compose.example.yml')),
      'docker-compose.example.yml fehlt');
    /* UND DIE ALTE LIEGT NICHT MEHR DANEBEN. Zwei Dateien mit fast demselben
       Namen liessen offen, welche gilt -- und die verfolgte waere wieder die,
       die ueberschrieben wird. Geprueft wird an der ABLAGE und nicht am
       Arbeitsbaum: wer sie sich beim Einrichten anlegt, soll sie behalten.

       GEFRAGT WIRD GIT, UND ZWAR NUR DORT, WO ES EIN GIT GIBT -- 0.19.3.
       EINE GEGENPROBENKOPIE HAT KEINES: sie entsteht ueber `git archive HEAD`
       und traegt kein `.git`. Der ungeschuetzte Aufruf WARF dort, und weil er
       vor jeder Zusicherung steht, RISS ER DEN GANZEN LAUF AB, statt eine
       Pruefung rot zu faerben (Stolpersteine 103 und 161). **Damit war JEDE
       Gegenprobe seit 0.19.1 unauswertbar** -- gefunden hat es der erste
       Gegenprobenlauf seither, in dieser Runde. *0.19.2 hat keinen gefahren;
       deshalb ist es dort nicht aufgefallen.*
       STATT DER FRAGE STEHT DANN IHRE VORAUSSETZUNG DA und nicht ein gruener
       Punkt ohne Gegenstand: dass es hier wirklich keine Ablage gibt. So
       bleibt die Zahl der Pruefungen dieselbe, und stillschweigend
       uebersprungen wird nichts. */
    const store = (() => {
      try {
        return String(execFileSync('git', ['ls-files'],
          { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }))
          .split('\n').map(z => z.trim());
      } catch { return null; }
    })();
    if (store)
      check('Und die Arbeitsdatei ist nicht mehr verfolgt',
        !store.includes('docker-compose.yml') &&
        store.includes('docker-compose.example.yml'),
        store.filter(z => /^docker-compose/.test(z)).join(' · ') || '(keine)');
    else
      check('Und die Ablage laesst sich hier nicht befragen — eine Kopie ohne .git',
        !fs.existsSync(path.join(__dirname, '.git')),
        'git ls-files ist gescheitert, obwohl ein .git danebensteht');
    check('Die Arbeitsdatei steht in der .gitignore',
      ignored.includes('docker-compose.yml'), ignored.join(' · '));
    /* DIESELBE ZEILE FUER `.env` STEHT DANEBEN -- ohne sie bliebe die Zusage
       darueber auch dann gruen, wenn jemand das Muster nur zur Haelfte
       uebernaehme (Stolperstein 81). Es ist das Muster und keine Ausnahme. */
    check('Und `.env` steht weiterhin daneben',
      ignored.includes('.env'), ignored.join(' · '));
    /* DER PFLICHTSCHRITT IN DER README, in derselben Form wie bei `.env`:
       einmal im Weg ueber git, einmal im Weg ueber das ZIP -- wer nur einen
       der beiden liest, muss ihn trotzdem finden. */
    /* DREIMAL, UND JEDES MAL AUS EINEM ANDEREN GRUND: einmal im Weg ueber git,
       einmal im Weg ueber das ZIP -- wer nur einen der beiden liest, muss ihn
       trotzdem finden --, und einmal im Pflichtsatz darunter. */
    const copyRows = (readmeFlat.match(/cp docker-compose\.example\.yml docker-compose\.yml/g) || []);
    check('Die README nennt den Kopierschritt in beiden Einspielwegen und im Pflichtsatz',
      copyRows.length === 3, `${copyRows.length} Nennungen`);
    check('Und sagt ausdruecklich, dass er Pflicht ist',
      /Der Schritt `cp docker-compose\.example\.yml docker-compose\.yml` ist Pflicht/
        .test(readmeFlat),
      'der Pflichtsatz fehlt');
    /* UND SIE SAGT, WAS OHNE IHN GESCHIEHT. Ein Pflichtschritt ohne Folge
       liest sich wie eine Empfehlung. */
    check('Und was ohne ihn geschieht',
      /no configuration file provided/.test(readmeFlat),
      'die Absage von docker compose steht nicht daneben');
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
