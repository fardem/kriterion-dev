# Änderungsprotokoll 0.12.0 — „Telefon und Tablett"

**Version 0.12.0 · gebaut am 28. August 2026 · die dritte Runde nach dem
Stufenplan, die dritte unter Semantic Versioning · KEINE Datenbankstufe, kein
Migrationsblock**

**Die Oberfläche fühlt sich auf dem Telefon wie eine Anwendung an und nicht mehr
wie eine breite Seite, die man schmal gemacht hat.**

**Der Satz, unter dem alles steht: es bleibt EINE Anlage.** Kein zweiter Aufbau,
keine Weiche nach der Kennung des Browsers, keine Handy-Adresse. Was sich
ändert, entscheidet der Browser anhand von zwei Fragen — und die beiden werden
nirgends vermischt: **die Breite entscheidet über das Layout, der Zeiger über
die Größe der Ziele.** *Wer die Zielgröße an die Breite hängt, lässt das Tablett
im Querformat leer ausgehen: es ist breit und wird trotzdem mit dem Finger
bedient.*

**Und der zweite Satz trägt genauso: am Schreibtisch ändert sich nichts.** Das
ist nachgemessen und nicht behauptet — die Übersicht ist bei 1100, 1280 und 1440
Pixeln **Pixel für Pixel dieselbe** wie vor der Runde. Die eine gewollte
Abweichung sind zwei Pixel im Kommentarblock; sie steht in Abschnitt 3 als
Befund C. Alles Übrige, was der Vergleich fand, waren Zeitstempel zweier Läufe.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.0 ist **MINOR**, weil
Funktionen dazukommen — das Menü, der Filterschalter, das Wischen am
Bildbereich. **Weggenommen wird nichts:** kein Bedienelement verschwindet,
keines bekommt eine neue Bedeutung, und was auf dem Telefon hinter das
Menüzeichen wandert, steht am Schreibtisch weiter da, wo es stand. *Das
Datenverzeichnis, das Austauschformat (Nummer 10), die Schlüssel in der `.env`
und die Werkzeuge auf dem Wirt sind alle vier unberührt.* **Keine
Datenbankstufe, keine neue Abhängigkeit, keine neue `.env`-Zeile, keine neue
Route.**

**Diese Runde hatte kein Auftragspapier.** Der Auftrag war ein Satz im
Gespräch — sinngemäß: *die Gestaltung für Mobil durchgehen; Kriterion wirkt dort
unbeholfen; die Kommentare stehen gegenüber dem Bildbereich anders groß da und
tragen dickere Rahmen; oben nehmen die Knöpfe zu viel Platz, eventuell ein
Hamburgermenü; es muss sich wie eine Handy-App anfühlen; das Tablett nicht
vergessen; und die normale Webansicht darf sich nicht verschlechtern.* **Es gibt
deshalb keinen Abschnitt „Die Fragen aus dem Auftrag, beantwortet"** — es gab
keine. Was statt dessen als Prüfung der Zusagen gilt, steht in Abschnitt 5.

**IM FELD BESTÄTIGT.** Die Runde ist eingespielt, und die laufende Anlage meldet
**`192734a2`** — denselben Wert, den der Branch misst. *Damit gibt es keinen
Befund wie bei 0.9.1, wo sich eine Datei zu viel auf dem Wirt gezeigt hat
(Stolperstein 158).*

**0.12.0 — Fingerprint `192734a2`.** ZULETZT gebildet, nach der letzten Änderung
an einer ausgelieferten Datei — die Versionsnummer in der `package.json`
eingeschlossen, denn der Server lädt sie und sie zählt damit mit. *Er musste
sich bewegen: drei Dateien in `public/` sind andere geworden.* Gemessen wurde er
zweimal, vor und nach dem Heben der Nummer: bei 0.11.0-Stand `f4a16249`, nach
dem Heben `192734a2`. **Die zweite Zahl ist die gültige.**

---

## Inhalt

1. [Was gebaut wurde, je Datei](#1-was-gebaut-wurde-je-datei)
2. [Die tragende Entscheidung: zwei Achsen und drei Umbruchpunkte](#2-die-tragende-entscheidung-zwei-achsen-und-drei-umbruchpunkte)
3. [Befunde beim Bauen](#3-befunde-beim-bauen)
4. [Eigene Fehler, im Bauen gefunden und behoben](#4-eigene-fehler-im-bauen-gefunden-und-behoben)
5. [Der Prüfstand](#5-der-prüfstand)
6. [Prüfungszahlen](#6-prüfungszahlen)
7. [Was ausdrücklich nicht passiert ist](#7-was-ausdrücklich-nicht-passiert-ist)
8. [Offen geblieben](#8-offen-geblieben)

---

## 1. Was gebaut wurde, je Datei

### `public/style.css` — der Schwerpunkt der Runde

**Ein neuer Abschnitt am Ende, „DER SCHMALE SCHIRM", und ein Dutzend
Ergänzungen im Bestand.** Von den 1337 Zeilen vor der Runde ist **keine
gelöscht** worden; die vorhandenen Regeln sind an sieben Stellen ergänzt und an
zwei Stellen berichtigt (Abschnitt 3, Befunde A und C).

**Die Staffel der Umbruchpunkte — drei Stellen, mehr nicht:**

| Breite | Was dort passiert |
|---|---|
| **1024 px** | Tablett: Seitenrand 24 → 18 px, Kartenraster 240 → 200 px Mindestbreite, Systemraster 300 → 260 px |
| **860 px** | *vorhanden seit langem:* die Detailansicht wird einspaltig |
| **700 px** | Telefon: alles Weitere |

**Die Telefonregel trägt zwei Bedingungen mit einem ODER:**
`(max-width: 700px), (max-height: 500px) and (max-width: 960px)`. Die zweite ist
das quer gehaltene Telefon — 850 bis 930 Pixel breit und keine 500 hoch. *Nach
der Breite allein wäre es ein Tablett und bekäme eine Kopfzeile, die ein Drittel
der Höhe frisst, die es gar nicht hat.* Die Deckelung bei 960 hält ein Tablett
im Querformat (1024 und mehr) davon fern; **sie steht nie allein**, und der
Prüfstand hält genau das fest.

**Eine vierte Zahl ist verschwunden.** Die Zeile des Sicherheitsprotokolls brach
bei 620 px um — eine eigene Stelle neben den dreien. Zwischen 620 und 700 stand
sie damit noch fünfspaltig, während die Karte um sie herum längst umgebrochen
war. Sie trägt jetzt dieselbe Bedingung wie alles Übrige.

**Der Zeiger, nicht die Breite, entscheidet über die Zielgrößen.** Ein eigener
Abschnitt `@media (pointer: coarse)` hebt die Innenabstände von Knöpfen, Pillen,
Marken, Kreuzen und Sternen auf ein Richtmaß von **44 Pixeln in jeder
Richtung** — *das ist keine gegriffene Zahl, sondern die Breite einer
Fingerkuppe auf dem Glas.* **Erreicht wird sie über den Innenabstand, nicht über
die Schrift:** ein größer gesetzter Knopf trägt lautere Schrift, und laut soll
nichts werden. Die Schriftgrößen bleiben, wo sie stehen. **Ein Zeigegerät sieht
davon nichts** — `pointer` fragt nach dem Hauptzeiger, und ein Rechner mit
Berührungsbildschirm und Maus meldet `fine`.

**Drei Selektoren stehen darin ausgeschrieben, obwohl eine Sammelregel sie zu
decken schien** — `.rstimme .xdel`, `.chip-xs` und `.mrow.zug select.zug-r`.
*Eine Medienregel ändert am Gewicht eines Selektors nichts:* zwei Klassen
schlagen eine, auch in einer Medienregel. Ohne die drei Zeilen wären das Kreuz
an einer fremden Stimme (18 px), die Marke am Testtag und das Rollenfeld in der
Zugangsliste (20 px) die einzigen Ziele der Anlage geblieben, die der
Fingerabschnitt verfehlt.

**Kein Hineinzoomen beim Tippen.** Ein Eingabefeld unter 16 Pixeln lässt Safari
auf dem iPhone die **ganze Seite** heranzoomen, sobald es den Fokus bekommt —
und wieder heraus tut sie es nicht von selbst. Dagegen gibt es genau zwei
Mittel: die Seite gegen Zoomen sperren (das nimmt jedem, der schlecht sieht, das
letzte Hilfsmittel — kommt nicht in Frage) oder die Felder groß genug setzen.
**Es steht als `max(...)` und nicht als blanke Pixelzahl:** die Anlage stellt die
Schrift von 80 bis 120 Prozent, und ab 107 Prozent wächst das Feld mit der
Einstellung weiter. *Wer klein stellt, bekommt hier nicht ganz, was er wollte —
aber eine Seite, die bei jedem Tastendruck springt, hat er noch weniger
gewollt.* **Es ist die einzige Stelle, an der eine Pixelzahl in einer
Schriftgröße vorkommt**, und sie steht als Untergrenze in einer Funktion: eine
blanke Zahl wäre ein zweites Grundmaß neben dem am Wurzelelement, und der
Prüfstand zählt genau das nach.

**Die Kästen — der Kern der Beschwerde.** Auf 390 Pixeln lagen zwischen dem
Bildschirmrand und dem ersten Buchstaben eines Kommentars **fünf Kanten und drei
verschiedene Eckenradien**:

```
|  Seitenrand 24  |  Rahmen 1  |  Innen 17  |  Rahmen 1  |  Innen 12
|  ... hier steht der Text, 280 von 390 Pixeln ...
```

Der Bildbereich saß am Seitenrand, die Kommentarkarte **36 Pixel weiter innen** —
und das Auge sieht zwei Ordnungen, wo eine gemeint war. **Die Antwort ist nicht,
die Rahmen dünner zu machen, sondern eine Ebene wegzunehmen:** auf dem Telefon
ist ein Block kein Kasten mehr, sondern ein **Abschnitt** — ein Trennstrich
darüber, ein Titel, der Inhalt. Damit bleibt genau **eine** Kastenebene übrig,
und die steht auf voller Breite, bündig unter dem Bild. Dasselbe gilt für die
Karten des Systembereichs. *Das ist kein neuer Gedanke, es ist der vorhandene:
ein Merkmal, ein Zeichen.*

**Und alles, was danach in derselben Flucht steht, rundet mit einem Radius** —
genommen wird der größere (11 px), denn der Bildbereich ist das Stück, an dem
sich alles ausrichtet. **Ausgenommen sind `.keyline` und `.zf-schluessel`:** die
beiden liegen *innerhalb* eines Hinweiskastens und sind Einsätze, keine Kästen
in der Flucht.

**Weiter im Stylesheet:** das Blatt von unten für Dialoge (`dvh` statt `vh`, mit
`vh` als Rückfall davor), die Vergleichsleiste über die volle Breite, die
Aussparung des Geräts an Kopfzeile, Vollbild, Meldung, Versionszeile und
Seitenrand, kein Aufblitzen beim Berühren, keine Wartezeit vor dem Klick
(`touch-action: manipulation`, **ausgenommen das Vollbild** — dort *ist* der
zweite Tipp eine Bedeutung), und ein eigener Block gegen hängengebliebene
Überfahrzustände.

### `public/app.js`

- **`ICON_MENUE`** — drei Striche, in derselben Strichstärke und demselben
  `viewBox` wie die beiden Nachbarn in der Kopfzeile.
- **`SCHMAL` und `istSchmal()`** — die Bedingung des schmalen Schirms als
  Zeichenfolge und als Frage an den Browser. **Sie steht wörtlich so auch im
  Stylesheet, und das ist die einzige Stelle der Anlage, an der eine Bedingung
  zweimal geschrieben steht.** Es geht nicht anders: das Stylesheet entscheidet,
  *was* zu sehen ist, die Oberfläche muss wissen, ob die Filter eingeklappt
  anfangen. **Der Prüfstand ist die Klammer darum** und vergleicht die beiden.
- **Die Kopfzeile** bekommt einen Behälter `#mast-rest` um vier Kinder — Offen,
  System, „Angemeldet als …", Abmelden — und dahinter das Menüzeichen. **Ein
  Markup, zwei Gestalten:** am breiten Schirm trägt der Behälter
  `display: contents` und ist für das Layout gar nicht da. *Die Knöpfe beim
  Drehen des Geräts umzuhängen wäre der andere Weg gewesen und der schlechtere:
  jeder verschobene Knoten verliert seine Zusagen.* **„Angemeldet als …" steht
  weiterhin unmittelbar vor dem Abmelden** — die Angabe erklärt den Knopf
  daneben, und getrennt erklärte sie nichts mehr.
- **Das Menü** öffnet über eine Klasse, schließt beim Klick daneben und mit
  Escape, führt `aria-expanded` und `aria-label` mit. Beide Zusagen am Dokument
  werden beim Verlassen der Ansicht abgeräumt.
- **`filterZahl()` und `zeichneFilterSchalter()`** — gezählt wird gegen
  `FILTER_VORGABE` und nicht gegen eine zweite Liste. **Die Sortierung zählt
  ausdrücklich nicht mit:** sie nimmt nichts weg, sie ordnet nur.
- **Der Filterschalter** klappt die vier Filterreihen weg; **eingeklappt
  angefangen wird nur auf dem Telefon**. Beim **Auf**klappen wird neu
  gezeichnet — der Grund steht bei `begrenzeWolke()`: ein eingeklappter Kasten
  misst null, die Wolke bliebe sonst unbegrenzt und der Knopf „mehr" fehlte.
  *Derselbe zweite Weg, den das Einklappen eines Blocks über `wolkeNeuzeichnen`
  geht.*
- **Wischen am Bildbereich** blättert, mit denselben Maßen wie im Vollbild. Die
  Zusagen hängen am Betrachter selbst und werden **genau einmal** gegeben —
  `drawViewer()` ersetzt nur die Kinder, und ein Paar je Bild hieße: nach dem
  dritten Wisch springt die Ansicht um drei Bilder weiter. **Nicht auf dem
  Abspieler** und nicht im Ausschnittmodus.
- **Der Titelbereich der Detailansicht heißt `.titel-kopf`** — ohne Namen ließe
  er sich nicht ansprechen, und ohne Ansprache müsste die Reihenfolge in app.js
  entschieden werden, also von einem Aufbau, der die Fensterbreite gar nicht
  kennt.
- **Die Jahreszahlen der Zeitleiste werden ausgedünnt**, wenn sie nicht
  nebeneinander passen. **Gemessen, nicht geraten:** erst alle bauen, dann die
  erste vermessen, dann ausdünnen — dasselbe Vorgehen wie in `begrenzeWolke()`,
  denn die Breite einer Zahl hängt an der eingestellten Schriftgröße.
  *Ausgedünnt wird nur die Beschriftung; die Punkte stehen alle da, wo sie
  stehen.*

### `public/index.html`

`viewport-fit=cover` und `theme-color`. **Die beiden gehören zusammen mit dem
Stylesheet:** ohne `viewport-fit=cover` liefert `env(safe-area-inset-*)` in
jedem Browser null, und wer Sicherheitsabstände schreibt, ohne die Fläche zu
bekommen, schreibt tote Regeln. Die Farbe ist `--bg` und keine zweite Wahrheit —
ein Meta-Element kann keine CSS-Variable lesen, **deshalb vergleicht der
Prüfstand die beiden Werte.**

### `pruefung.js`

Eine neue Gruppe **„Handy und Tablett: die Staffel der Umbruchpunkte"** (21
Zusicherungen) und zwölf weitere in der vorhandenen Gruppe
„Mehrbenutzer-Anzeigen in der Oberfläche", die das Menü und den Filterschalter
im gebauten DOM bedienen. **33 neue Prüfungen, 3815 werden 3848.**

### `gegenprobe.js`

**Sechs neue Rückbauten** (`158` bis `163`), auf die tragenden neuen Zusagen
gerichtet. *Sie sind nicht der volle Lauf über alle 165 — was sie decken und was
nicht, steht in Abschnitt 5.*

### Die Papiere

- **`README.md`** — der Abschnitt „Auf dem Handy" heißt jetzt „Auf dem Handy
  und auf dem Tablett" und ist neu geschrieben.
- **`CHANGELOG.md`** — der Eintrag `[0.12.0]` nach der Form von 0.11.0, samt
  beiden eigenen Abschnitten und dem Vergleichsverweis.
- **`Doku/Fehler_und_Ideen.md`** — sechs Punkte aus der Durchsicht, die
  **bewusst stehen geblieben** sind (Teil II, „Aus der Durchsicht für Telefon
  und Tablett").
- **Der Projektstand** ist umbenannt auf `Projektstand_Kriterion_0_12_0.md` und
  auf **Revision 28** nachgezogen: Kopf, Abschnitt 2 (Betriebsstand,
  Fingerprint- und Prüfungstabelle, Migrationstabelle), Abschnitt 4 (ein neuer
  Unterabschnitt „Telefon und Tablett"), Abschnitt 6 (**Stolpersteine 173 bis
  176**), Abschnitt 7 (Stand und Rundentabelle), Abschnitt 8 (Tags, Rundläufe,
  Fingerprints, die Verengung der Gegenprobe, die fehlende Layoutprobe),
  Abschnitt 9 (0.12.0 ausführlich, 0.11.0 auf einen Absatz gekürzt) und
  Abschnitt 10 (der Fahrplan).
  **Abschnitt 5 ist unberührt** — ausdrücklich, siehe Abschnitt 7.
- **`package.json` und `package-lock.json`** auf 0.12.0.

**IM FAHRPLAN STAND 0.12.0 SCHON — für die Bereinigung von Code und
Datenbankstruktur.** Sie heißt jetzt **0.13.0**. *Die Nummer war vorgemerkt und
nicht vergeben, und dazwischen ist eine Runde gebaut worden, die Funktionen
bringt und damit nach der eigenen Regel MINOR ist.* **Umnummeriert ist sie
sichtbar und nicht still:** im Fahrplan steht ein eigener Kasten darüber, und
Abschnitt 5 nennt bei der Absage an alte Datenbanken beide Zahlen.

---

## 2. Die tragende Entscheidung: zwei Achsen und drei Umbruchpunkte

**Sie ist die einzige Entscheidung dieser Runde, die etwas festlegt, und sie
steht deshalb hier und nicht nur im Kommentar.**

> **Die Breite entscheidet über das Layout. Der Zeiger entscheidet über die
> Größe der Ziele.**

Wie viele Spalten ein Raster trägt, ob die Kopfzeile umbricht, ob ein Kasten
seinen Rahmen behält — das hängt am Platz und an sonst nichts; ein Tablett am
Standfuß und ein kleines Fenster auf dem Schreibtisch sind derselbe Fall. Wie
groß ein Knopf sein muss, hängt daran, **womit** gezielt wird.

**Wo sie sich kreuzen, steht es ausdrücklich da.** Es gibt genau eine solche
Stelle: die eingeklappte Kopfzeile greift bei
`(max-width: 1024px) and (pointer: coarse)` — ein Tablett im Hochformat ist 834
Pixel breit und wird mit dem Finger bedient; die Kopfzeile brauchte dort mit
Fingermaßen über 900 Pixel und brach um, wobei „+ Eintrag" allein in einer
zweiten Zeile weit links saß: **es sah kaputt aus.** *Ein Fenster von 1024 Pixeln
auf einem Schreibtisch meldet `pointer: fine` und behält die Kopfzeile, die es
vorher hatte.*

**Was auf dem Tablett anders bleibt als auf dem Telefon:** die Suche steht
weiterhin in derselben Zeile (sie passt), die Filter fangen aufgeklappt an (es
ist Platz da), und die Blöcke behalten ihre Kästen. **Eingeklappt wird dort nur,
was sonst umbräche.**

---

## 3. Befunde beim Bauen

*Drei Fehler, die es vor dieser Runde schon gab und die beim Messen aufgefallen
sind. Alle drei sind mitbehoben.*

### Befund A — die Vergleichsleiste stand nicht mittig

`.cmp-bar` hing an `left: 50%` mit `transform: translateX(-50%)`, und daneben
stand `animation: rise .26s var(--ease) both`. **`rise` endet auf
`transform: none`, und `animation-fill-mode: both` lässt diesen Wert nach dem
Ablauf stehen.** Eine laufende Bewegung schlägt in der Rangfolge jede
gewöhnliche Zeile — die Verschiebung um die halbe eigene Breite war damit ab der
260. Millisekunde weg, und die Leiste saß mit ihrer **linken Kante** in der
Mitte des Fensters. *Auf einem breiten Schirm sah das nach Absicht aus; auf einem
schmalen lief sie rechts hinaus.*

**Behoben, indem die Mitte ins Layout wandert** — `left: 0; right: 0;
margin: 0 auto` — und nicht in eine Eigenschaft, die sich die Bewegung teilt.
`rise` bewegt seither nur noch, wozu es gedacht ist.

**Es ist ein Fehler auf jedem Schirm gewesen, nicht nur auf dem Telefon.** Er
steht deshalb unter *Fixed* im CHANGELOG und nicht unter *Changed*.

### Befund B — der Systembereich lief auf dem Telefon rechts aus dem Bild

Die einspaltige Rasterspalte stand auf `1fr`. **`1fr` ist die Kurzform von
`minmax(auto, 1fr)`**, und `auto` als Untergrenze heißt: die Spalte darf nie
schmaler werden als der schmalste unteilbare Inhalt, den *irgendeine* Karte
darin trägt. **Eine** Karte mit einer langen Verwaltungszeile zog die Spalte auf
**404 Pixel** — in einem Fenster von 390. Weil alle Karten in derselben Spalte
stehen, wurden **alle** 404 breit. Der Browser erweitert daraufhin still den
sichtbaren Bereich (**gemessen: `innerWidth` 421 statt 390**), und die
Erklärungstexte standen mitten im Wort angeschnitten da.

**Behoben mit `minmax(0, 1fr)`.** Die ausdrückliche Untergrenze null nimmt der
Spalte dieses Vetorecht; was dann wirklich zu breit ist, läuft in seiner eigenen
Zeile über und lässt sich dort beheben, statt die ganze Seite mitzuziehen.

**DER BEFUND IST NUR AUFGEFALLEN, WEIL DIE MESSUNG FALSCH WAR.** Die erste
Überlaufprobe verglich gegen `window.innerWidth` — und der war ja schon
erweitert. **Sie meldete deshalb „sauber", während die Seite sichtbar
angeschnitten war.** Erst der Vergleich gegen die *angeforderte* Fensterbreite
brachte es heraus. *Eine Probe, die ihren Maßstab vom Prüfling bezieht, kann
nicht scheitern.* Das ist Stolperstein 81 in einer neuen Fassung und steht
deshalb hier so ausführlich.

### Befund C — ein Kommentar mit Art verschob seinen Text um zwei Pixel

`.cmt.bericht`, `.cmt.aufgabe` und `.cmt.erledigt` tragen links 3 statt 1 Pixel;
`box-sizing` steht global auf `border-box`, der Rand wächst also nach innen. **In
einer gemischten Liste standen die Zeilenanfänge abwechselnd auf zwei Linien.**
Bei einem einzelnen Kasten fällt das nicht auf — in einer Liste aus Notizen,
Berichten und Aufgaben ist es genau die Unruhe, die man sieht, ohne sie benennen
zu können.

**Behoben über den Innenabstand: 10 + 3 = 12 + 1.** Die Kante bleibt 3 Pixel
breit — sie ist das Merkmal, sie soll auffallen; nur der Text bleibt, wo er ist.
**Das ist die einzige Stelle, an der sich am Schreibtisch etwas ändert.**

---

## 4. Eigene Fehler, im Bauen gefunden und behoben

*Sie stehen hier, weil sie beim nächsten Mal wieder passieren, wenn niemand sie
aufgeschrieben hat.*

**a) Die ausgewählte Karte verlor auf dem Finger ihren Rahmen.** Die neue Regel
`@media (hover: none) { .card:hover { … border-color: var(--line) } }` und
`.card.picked` wiegen beide zwei Klassen; bei gleichem Gewicht gewinnt die
spätere Zeile, und das war die neue. **Das Kästchen stand auf orange, die Karte
sah aus wie jede andere.** Behoben mit `:not(.picked)`. *Gefunden am Bildschirm
und nicht am Quelltext — im Stylesheet war nichts zu sehen.*

**b) Der Wisch am Bildbereich fing die Abspielsteuerung ab.** Der Abspieler
steht als Kind im Bildbereich, und Berührungen darauf steigen bis zum Behälter
auf: **jedes Ziehen am Schieberegler des Videos war zugleich ein Wisch.** Man
wollte an eine andere Stelle im Film und landete im nächsten Bild. Behoben mit
einer Zeile, die Berührungen auf einem `video` ausnimmt.

**c) Der Prüfstand fiel zweimal über Kommentartext.** Zwei Prüfungen lesen den
**rohen** Text des Stylesheets und nehmen Kommentare nicht aus: „Nur noch eine
feste Schriftgröße" und die Suche nach der Einblendregel der Löschkreuze.
**Beide Male hat ein Kommentar von mir die Prüfung scheitern lassen, nicht eine
Regel** — einmal die ausgeschriebene Pixelangabe in einer Begründung, einmal ein
ausgeschriebener Selektor, der weiter oben in der Datei stand als die Regel
selbst. *Beide Stellen tragen jetzt einen Satz, der sagt, warum dort nichts
ausgeschrieben steht.* **Der Prüfstand hatte in beiden Fällen recht.**

**d) Eine Bearbeitungsgruppe ist an einer Zusicherung gescheitert und wurde
deshalb gar nicht geschrieben** — die Datei blieb unverändert, und `istSchmal`
war zur Laufzeit nicht definiert. Aufgefallen ist es erst im Browser, nicht am
Quelltext. *Der Prüflauf hätte es auch gefunden; der Browser war schneller.*

---

## 5. Der Prüfstand

**33 neue Zusicherungen.** Die tragenden:

- **Die Bedingung des schmalen Schirms steht in CSS und in app.js — die Prüfung
  vergleicht die beiden wörtlich.** *Laufen sie auseinander, klappt die Anlage
  Filter ein, deren Schalter gar nicht dasteht: eine Liste, die ohne sichtbaren
  Grund weniger zeigt.*
- **Es gibt genau drei Umbruchpunkte, dazu die Deckelung für quer** — gezählt
  wird in den **Bedingungen der Medienregeln** und nicht im ganzen Stylesheet.
  *Der erste Anlauf dieser Prüfung hat genau das verwechselt und acht Zahlen
  gefunden, wo vier stehen: `max-width` steht auch an gewöhnlichen Regeln.*
  Und: **960 steht nie allein.**
- **Die Grundstellung der neuen Bauteile steht VOR den Medienregeln.** Gleiches
  Gewicht, spätere Zeile gewinnt — dahinter griffe die Medienregel nie, und das
  Menü wäre auf dem Telefon dauerhaft unsichtbar.
- **`viewport-fit=cover` und `env(safe-area-inset-*)` gehören zusammen**, und
  **`theme-color` ist `--bg`** — Wert gegen Wert verglichen.
- **Der Block verliert auf dem Telefon seinen Rahmen**, die Systemkarte ebenso,
  und **die Spalte des Systembereichs darf auf null schrumpfen** (Befund B).
- **Was an `:hover` hängt, hat sein Gegenstück** — für `.vnav`, `.vfocus` und
  `.thumb .del`, die es vorher nicht hatten.
- **Der angehobene Zustand der Karte bleibt auf dem Finger nicht hängen.**
- **Die Vergleichsleiste steht wirklich mittig** (Befund A): `margin: 0 auto`
  ist da, `transform: translateX` nicht mehr.
- **Im gebauten DOM:** das Menüzeichen, der Behälter mit genau den vier Kindern
  in genau dieser Reihenfolge, die zwei mitgeführten Wörter, das Öffnen, das
  Schließen beim Klick daneben — und am Filterschalter, dass die Zahl der
  Filterstellung folgt.

### Die Gegenprobe — sechs Rückbauten, und was sie NICHT decken

**Ein Rückbau, der keine einzige Prüfung rot macht, ist ein Fund und kein
Erfolg.** Sechs sind gefahren, auf die tragenden neuen Zusagen gerichtet —
**keiner blieb stumm:**

| Nr. | Was zurückgebaut wird | Namentlich rot |
|---|---|---|
| 158 | `minmax(0, 1fr)` wird wieder `1fr` | „Die Spalte des Systembereichs darf auf null schrumpfen" |
| 159 | die Bedingung in `app.js` läuft von der im Stylesheet weg | „Und das Stylesheet benutzt wörtlich dieselbe" |
| 160 | der Behälter des Menüs steht auch am breiten Schirm im Weg | „Der Behälter des Menues ist auf dem breiten Schirm nicht da" **und** „Und seine Grundstellung steht VOR der Medienregel" |
| 161 | `viewport-fit=cover` fällt weg | „Die Seite bekommt die ganze Fläche, Aussparung eingeschlossen" |
| 162 | der Blätterpfeil verschwindet auf dem Finger wieder | „Ohne Überfahren ist .vnav sichtbar" |
| 163 | der Name des Angemeldeten rutscht hinter das Abmelden | „Sie steht unmittelbar vor dem Knopf zum Abmelden" **und** „Darin stehen Offen, System, der Name und das Abmelden — in dieser Reihenfolge" |

**UND EINER MUSSTE UMGEBAUT WERDEN, weil sein erster Anlauf den Lauf abgerissen
hat.** Rückbau 163 nahm zuerst dem Menüzeichen seine Kennung. Damit gab
`document.getElementById('menue')` null zurück und `menue.onclick = …` warf —
**bevor eine einzige Zusicherung lief.** Die ganze Prüflage fiel zusammen, und
der Bericht meldete „ABGERISSEN" statt eine Zeile rot zu färben. *Eine
abgerissene Gegenprobe belegt nichts* (Stolpersteine 138, 161 und 170): sie
sagt nicht, ob die Zusage geprüft ist, sie sagt nur, dass niemand mehr
weiterzählen konnte.
**Er greift jetzt da, wo die Zusicherung hinsieht** — er vertauscht in der
Tafel zwei Kinder. Das wirft nichts und trifft zwei Zusagen auf einmal, darunter
die ältere Zeile, dass die Angabe unmittelbar vor dem Knopf steht, den sie
erklärt.

**WAS SIE AUSDRÜCKLICH NICHT DECKEN, und das gehört genauso hierher:**

- **Der volle Lauf über alle 165 Rückbauten ist nicht gefahren.** Er fährt den
  ganzen Prüflauf je Rückbau und hätte in der Arbeitsumgebung Stunden gebraucht.
  *Das ist eine Verengung gegenüber 0.11.0 (34 Gegenproben), und sie steht
  auch in Abschnitt 8 des Projektstands.*
- **Keine Zusage über das LAYOUT ist gegengeprüft**, denn keine ist geprüft: der
  Prüflauf rechnet auf `jsdom` kein Layout. Was am Stylesheet geprüft wird, ist
  *dass eine Regel dasteht* — nicht, dass sie trägt. **Ein Rückbau kann davon
  nicht mehr belegen als die Prüfung selbst.**
- **Das Nachzeichnen der Filter beim Aufklappen hat keine Prüfung** und damit
  auch keinen Rückbau. *Es lässt sich ohne Layout nicht belegen: die Wolke misst
  ihre erste Marke, und in `jsdom` misst sie null.* Es steht als Punkt in
  Abschnitt 8.

**Dazu eine Messung, die nicht im Prüfstand steht und stehen sollte:** sieben
Fenstergrößen im echten Browser (390, 360, 852 × 393, 834, 1024 mit Finger, 1024
und 1440 mit Maus) auf vier Ansichten — **kein waagerechter Überlauf und keine
stille Erweiterung des sichtbaren Bereichs.** Und der Pixelvergleich der
Breitbildansicht gegen den Stand vor der Runde. *Beides braucht einen Browser
mit Layoutberechnung; der Prüfstand läuft auf jsdom und kann es nicht. Es steht
als Punkt in Abschnitt 8.*

---

## 6. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen | 3815 | **3848** |
| Rückbauten | 159 | **165** |
| `F_ROUTEN` | 69 | **69** |
| Vorgänge | zwanzig | **zwanzig** |
| Merkmale | dreizehn | **dreizehn** |
| Bestätigungszwecke | sieben | **sieben** |
| Karten im Systembereich | neunzehn | **neunzehn** |
| Formatnummer | 10 | **10** |
| Vokabular | elf | **elf** |
| persönliche Schlüssel | acht | **acht** |

**Keine neue Abhängigkeit, keine neue `.env`-Zeile, keine neue Route, keine
Datenbankstufe.** *Diese Runde fasst den Server nicht an: `server.js`, `db.js`,
`auth.js`, `keys.js`, `mail.js`, `anhaenge.js`, `zweifaktor.js` und `zugang.js`
sind unverändert. Die einzige Datei außerhalb von `public/` und den Papieren,
die sich bewegt, ist `pruefung.js` — und `package.json` samt Lockfile für die
Nummer.*

---

## 7. Was ausdrücklich nicht passiert ist

- **Keine zweite Oberfläche und kein zweiter Aufbau.** Es gibt keine
  `renderListMobil()`, keine Weiche nach der Kennung des Browsers und keine
  Handy-Adresse.
- **Kein Framework und kein Baulauf.** Es bleibt bei Vanilla-JS und einem
  Stylesheet.
- **Keine neue Farbe.** Der Abschnitt kommt mit `--accent`, `--gold`, `--blue`,
  `--green`, `--red` und den Graustufen aus.
- **Kein Manifest und kein Apple-Touch-Icon.** Beides brauchte neue Dateien —
  ein Manifest zusätzlich PNG-Symbole —, und der Gewinn wäre der
  Startbildschirm. *Zwei Dateien, nicht vier.*
- **Abschnitt 5 des Projektstands ist unberührt.** Die zwei Achsen sind eine
  **Bauweise dieser Runde und keine Festschreibung** — sie stehen hier und im
  Stylesheet, nicht unter den Entscheidungen, die nicht rückgängig gemacht
  werden sollen. *Ausdrücklich so entschieden.*
- **Die Unteransichten haben weiterhin keine Kopfzeile.** Eine gemeinsame für
  Eintrag, System, Offen und Vergleich berührte vier Aufbauten und deren
  Prüflagen — das ist eine eigene Runde. Steht im Sammelblatt.

---

## 8. Offen geblieben

*Alles davon steht im Sammelblatt (`Doku/Fehler_und_Ideen.md`, Teil II,
„Aus der Durchsicht für Telefon und Tablett") und ist dort begründet.*

1. **Die Zeile einer Anmeldung läuft bei rund 1024 Pixeln aus ihrer Karte** —
   vorbestehend, die Seite läuft nicht über, es scrollt der Kasten. Der saubere
   Weg ist eine **Behälterabfrage** (`@container`) statt einer Fensterabfrage.
2. **Eine Meldung kann auf dem Telefon die Vergleichsleiste verdecken.**
3. **Der Knopf „Vollbild" am Video sitzt auf einer ausgerechneten Textbreite**
   (`right: 92px`) und schiebt sich bei 120 Prozent Schrift über den Nachbarn.
4. **Der Hinweis an der Zeitleiste kann auf schmalem Schirm hinauslaufen** — nur
   mit Maus, auf dem Finger gibt es ihn gar nicht.
5. **Die Erklärung unter dem Ablegefeld spricht von „Klick" und „Strg+V".** Eine
   Fassung, die für beide gilt, wäre besser als zwei mit einer Weiche dazwischen.
6. **Eine Layoutprobe im Prüfstand.** Die Messung aus Abschnitt 5 lief von Hand
   in einem echten Browser. *Sie gehört in den Prüflauf — und dafür braucht er
   etwas, das Layout rechnet.*
7. **Das Nachzeichnen der Filter beim Aufklappen hat keine Prüfung** — es hängt
   an einer gemessenen Zeilenhöhe, und `jsdom` misst null. Es geht mit Punkt 6.
8. **Der volle Gegenprobenlauf über alle 165 Rückbauten** gehört nachgeholt, wo
   Zeit dafür ist.
