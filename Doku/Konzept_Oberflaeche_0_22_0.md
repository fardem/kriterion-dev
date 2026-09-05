# Konzept — „Die Oberfläche wird ruhiger"

**Moderner, aufgeräumter, verständlich — dieselben Funktionen, dieselben Farben, andere
Worte.** Arbeitstitel der Runde: *0.22.0*, die Nummer steht so im Fahrplan (Projektstand,
Abschnitt 10) und ist vorläufig.
*Stand: 4. September 2026. Erhoben gegen Kriterion 0.21.0, **nachgezogen auf 0.21.1**
(Fingerprint `2295870b`, im Feld seit dem 4. September 2026). Die Zeilenangaben zu
`public/app.js` und `public/style.css` sind auf diesen Stand gerechnet und am Wortlaut
nachgeprüft; sie bleiben Orientierung und keine Zusage. **Die Texte, die 0.21.1 neu gebracht
hat, sind geprüft und stehen in der Anlage, Abschnitt C1.** Der zugehörige Auftrag ist aus
diesem Papier geschrieben worden (`Doku/Auftrag_0.22.0.md`) und **mit dem Auftrag zu
0.22.1 weggefallen** — es liegt immer nur einer im Repo; was gebaut wurde, steht im
Änderungsprotokoll 0.22.0.*

> **WAS DIESES PAPIER IST UND WAS NICHT.** Es ist die Ausarbeitung der Idee, die seit dem
> 30. August 2026 im Projektstand steht (Abschnitt 10a, „Die Oberfläche wird ruhiger"),
> zusammen mit Punkt 10 des Sammelblatts (der Bildstreifen) und der Zeile aus dem Fahrplan
> (der Ausschnitt als Rechteck). **Dazu kommt, was der Betreiber am 4. September 2026
> verlangt hat: alle Bildschirmtexte aus Sicht dreier Rollen — Benutzer, Admin, Eigentümer —
> auf Verständlichkeit, Kürze und richtiges IT-Deutsch prüfen.** Es ist kein Auftrag: es
> legt fest, *was* gebaut wird und *warum*, und nennt die Entscheidungen, die der Auftrag
> treffen muss. Es ändert nichts am Quelltext.

---

## 0. Wie dieses Papier entstanden ist

**Gelesen wurde alles, was ein Mensch am Bildschirm sieht.** `public/app.js` (9 990 Zeilen)
in sieben Abschnitten, dazu die Meldungen, die der Server an den Browser schickt
(`server.js`, `auth.js`, `mail.js`), und das Stilblatt `public/style.css` (3 343 Zeilen).
Gezählt wurden dabei **rund 1 000 sichtbare Texte** (Beschriftungen, Knöpfe, Hinweise,
Tooltips, Meldungen, Dialoge) und **rund 175 Servermeldungen**. *Die Zählung ist eine
Handzählung je Abschnitt und auf Zehner gerundet.*

**Angesehen wurde die Oberfläche an einem Beispielbestand**, nicht nur im Quelltext: eine
Wegwerf-Installation mit neun Einträgen, drei Zugängen (Eigentümer, Admin, Benutzer),
Kriterien in beiden Sternkästen, Testtagen, Kommentaren aller Arten, Links und Suchzeilen —
fotografiert auf einem breiten Bildschirm (1600 px) und einem Telefon (Pixel 7), je Rolle.
*Die Fotos liegen dem Betreiber vor; ins Repo gehören sie nicht (keine Binärdateien).*

**Die Gemini-Fassung (`fardem/kriterium-Gemini`) wurde daneben gelegt und angesehen — als
Anregung, nicht als Vorlage.** Was sie an Optik mehr hat, steht schon im Projektstand
(Abschnitt 10a) mit Begründung auf der Ablehnungsliste: Milchglas, Verläufe, glühende Sterne,
ein schwebendes Fußdock mit Versionsnummer und Schlossabzeichen. *Übernommen wird davon
nichts; übernommen wird die Frage, die sie stellt: warum wirkt dieselbe Anwendung dort einen
Hauch lebendiger?* Die Antwort steht in Abschnitt 6.

**Drei Maßstäbe hat der Betreiber vorgegeben, und sie gelten für jeden Text in diesem Papier:**

1. **Verständlich für jemanden, der Kriterion nicht kennt und nicht programmieren kann.**
   Kurz. Der Benutzerbereich so kurz wie möglich, Admin und Eigentümer dürfen fachlicher sein.
2. **IT-Deutsch, wie es in Deutschland gesprochen wird.** Englische Fachwörter werden nicht
   eingedeutscht: Login, Link, Tag, Upload, Download, Server, Browser, Cookie, Token, PDF,
   SMTP, Thread. **Verboten sind Wörter, die zwar im Duden stehen, aber in Deutschland nicht
   für diese Sache benutzt werden** — der Betreiber nennt `Faden` für Thread, `Boden` für einen
   Mindestwert, `Schere` für eine Grenze. *Der Prüfstand kennt diese Regel schon: der
   Sprachwächter (`pruefung.js`, Gruppe „Der Sprachwächter") verbietet `Keks`, `Umstieg`,
   `Zeichenkette` und `Faden` in Kommentaren und Papieren — er liest aber die Bildschirmtexte
   nicht. Abschnitt 10 sagt, wie sich das ändert.*
3. **Kein Ton wie unter Programmierkollegen.** Keine Absprachen, keine Begründungen aus dem
   Bauen, keine Anspielungen auf frühere Fassungen. Der Text sagt, was ist und was der Klick
   tut. *Diese Regel steht seit 0.17.0 im Projektstand, Abschnitt 5.6 — „eine Oberfläche sagt,
   WAS IST, nicht, warum sie so gebaut wurde" — und ist dort mit zwei Stellen eingelöst und
   mit zwölf weiteren ausdrücklich liegen geblieben (Sammelblatt, Teil II). Diese Runde löst
   sie ein.*

---

## 1. Worum es geht

Kriterion ist sachlich, dunkel, ohne Zierrat — und das ist richtig. Aber drei Dinge stehen
einem Menschen, der die Anwendung zum ersten Mal öffnet, im Weg. Keines davon ist ein Fehler
im Sinne des Sammelblatts: nichts klemmt, nichts rechnet falsch. **Alle drei sind Fragen der
Form, und Form ist, was ein Neuling zuerst sieht.**

### Erster Befund: sie bewegt sich an den falschen Stellen

**Das Stilblatt kann mehr, als es zeigt.** Kacheln heben sich beim Überfahren um drei Pixel
und werfen einen Schatten (`.card:hover`, `style.css` Z. 506), ihr Bild wächst um drei
Prozent, jede Kachel blendet sich beim Aufbau ein; der Fokusring ist eigen und orange
(`:focus-visible`, Z. 161); 48 Übergänge laufen über eine gemeinsame Kurve (`--ease`).
**Die Übersicht ist also gar nicht unbewegt** — der Eindruck aus dem Projektstand („nichts
hebt sich, nichts antwortet auf einen Zeiger") stimmt für die Kacheln nicht mehr.

**Er stimmt für alles andere.** Die Zeilen in den Listen des Systembereichs (`.mrow`) geben
beim Überfahren nichts zurück; Reiter, Blockköpfe und Pillen antworten nur mit einer
Randfarbe; die gerade gespeicherte Karte sieht aus wie vorher; die Glocke erscheint, ohne dass
man es merkt. **Und an zwei Stellen bewegt sich zu viel, gegen die eigene Regel:** die
Kopfzeile trägt heute Milchglas (`backdrop-filter: blur(10px)`, Z. 309), der Hintergrund jedes
Dialogs auch (`blur(3px)`, Z. 1848) — genau das, was der Projektstand in seiner Tabelle „Was es
ausdrücklich NICHT wird" ablehnt, *weil es auf dem Telefon Leistung kostet und Text unruhig
macht.* Die Regel steht, die Kopfzeile bricht sie.

**Und die Schrift, die am meisten gelesen wird, ist die kleinste.** Jeder Block der
Detailansicht und jede Beschriftung im Systembereich trägt seine Überschrift als
`.label` — Monospace, 0,7 rem, Großbuchstaben, gesperrt, in der blassesten Grauabstufung
(`--faint`, Z. 811). *Das ist die Schrift, mit der ein Neuling sich orientiert: „Kategorie",
„Tags", „Bewertung", „Testtage". Sie ist auf einem Telefon bei 100 % Schrift rund neun Pixel
hoch.*

### Zweiter Befund: sie redet wie unter Kollegen

**Von rund 1 000 sichtbaren Texten sind etwa 230 auffällig**, dazu rund 20 der 175
Servermeldungen. Nicht falsch — auffällig nach den drei Maßstäben oben. Die Verteilung sagt,
wo das Problem sitzt:

| Bereich | sichtbare Texte | auffällig | sieht der Benutzer |
|---|---|---|---|
| vor der Anmeldung (Einrichtung, Login, zweiter Faktor, Einladung) | ≈ 80 | 17 | ja |
| Übersicht mit Filterleiste, Offen, Vergleich, Vollbild | ≈ 130 | 29 | ja |
| Blöcke, Glocke, gespeicherte Ansichten | ≈ 50 | 12 | ja |
| Eintrag (Detailansicht) | ≈ 210 | 48 | ja |
| Systembereich: Persönlich, Bestand, Zugänge | ≈ 270 | 58 | zur Hälfte |
| Systembereich: Anfragen, Protokoll, Mail, Datenbank | ≈ 280 | 65 | **nein** |
| Servermeldungen (Toasts) | ≈ 175 | ≈ 20 | ja |
| *neu aus 0.21.1: die Vorgabe des Statusfilters* | *5* | *2* | *ja* |

**Vier Muster kommen immer wieder:**

* **Kunstdeutsch, das niemand spricht.** „Hier *trägt* auch ein Wiederherstellungscode"
  (gilt), „alle anderen Anmeldungen *fallen*" (werden beendet), „Neu seit deinem letzten
  *Blick*", „Klick zeigt, wo", „in diese *Tafel*", „der *Grabstein* IST das Löschen", „über
  `zugang.js` auf dem *Wirt*", „der *Sicherungsweg*", „der *Austauschweg*", „eine Datei, die
  das *Haus verlässt*", „TLS *von Anfang an*", „*Ableitungen*", „*nachgezogen*", „beim
  *Hereinkommen*", „*Probe*" für eine Vorschau, „*Näher*" für den Zoom.
* **Der Bauprozess auf dem Bildschirm.** „Das ist so gewollt und bleibt so" (Meine
  Sitzungen), „ein Sicherheitsprotokoll, das sich wegräumen lässt, wäre keins", „das Feld
  daneben erscheint nur, wenn es auch gilt", „Gespeichert bleibt der Rohtext", „Der Knopf oben
  bleibt trotzdem — wer weiß, was er tut, soll es versuchen dürfen", „das Standbild erzeugt
  der Browser", „Der Schlüssel geht roh in die Datenbank (`PRAGMA key = x'…'`)". **Und vier
  Server-Befehle im Bildschirmtext** (`docker compose exec kriterion node zugang.js …`), einer
  davon **für jeden Benutzer sichtbar**, obwohl kein Benutzer je eine Shell auf dem Server hat
  (`app.js` Z. 7020).
* **Drei Wörter für eine Sache.** Das eigene Konto heißt „Zugang", die anderen Personen
  heißen „Zugang", „Benutzer" und „Grabstein"; eine Sitzung heißt in derselben Karte „Sitzung"
  und „Anmeldung"; die Sicherung heißt „Sicherung" und „Kopie", ihr Ordner „Sicherungsort",
  „Zielort" und „Ort"; das Umwandeln heißt „umwandeln", „umstellen" und „Bildumstellung"; der
  Durchschnitt heißt „⌀", „Schnitt", „Gesamtschnitt", „Durchschnitt" und „gemittelt"; das
  Löschen heißt in neun Dialogen wechselnd „löschen" im Titel und „entfernen" im Satz — oder
  umgekehrt. *Jedes zweite Wort zwingt den Leser zu der Frage, ob dasselbe gemeint ist.*
* **Erklärt wird, was der Leser nicht ändern kann.** Der Benutzer liest auf der Karte
  „Kategorien" *„Umbenennen oder löschen"*, darf aber beides nicht. Er liest im
  Rechnungsdialog *„Die Gewichte stellt der Admin im Systembereich ein"*, kommt aber nicht
  dorthin. Er liest unter dem Bildfeld fünf Sätze über Vollbild, Blättern, Hauptbild,
  Papierkorb und Videoformate — an jedem Eintrag, jedes Mal.

### Dritter Befund: sie ist nicht überall aufgeräumt

**Der Systembereich ist ein Handbuch, das in Karten zerschnitten wurde.** Einundzwanzig
Karten tragen zusammen **rund 2 500 Wörter Erklärtext** (gezählt aus den Erklärabsätzen, auf
Hunderter gerundet) — die Karte „Zugänge" allein rund 300, der Warnkasten zur Exportgröße 80,
die Einleitung der Karte „Anfragen" 65. Die Karten sind deshalb ungleich hoch, und weil eine
Reihe so hoch ist wie ihre höchste Karte (Regel seit 0.17.4), steht unter der Kategorienliste
eine halbe Kachel Leere. *Der Text macht die Lücke, nicht das Raster.*

**Die Filterleiste der Übersicht stellt dem Neuling auf einmal alles hin:** sieben Pillen in
der ersten Zeile („Alles anzeigen", „Getestet", „Ungetestet", „★ Favoriten" und daneben
„Ablehnung: Alle, Abgelehnt, Nicht abgelehnt"), eine Kategoriezeile, eine Tagwolke mit
Und/Oder-Umschalter, „mehr" und „zurücksetzen", ein Auswahlfeld mit 13 Sortierungen in drei
Gruppen, die gespeicherten Ansichten, „+ Ansicht speichern" und „Filter zurücksetzen (n)".
Drei Pillen heißen „Alle" in zwei Schreibweisen, zwei Knöpfe heißen „zurücksetzen" mit
verschiedener Reichweite. *Dass die Leiste auf dem Telefon eingeklappt beginnt, sagt es
schon.*

**Und ein Dialog sagt das Gegenteil von dem, was er tut.** Wer einen Benutzer löscht, sieht
vier Fenster hintereinander; in den ersten beiden heißt „Abbrechen" nicht „abbrechen", sondern
„seine Einträge behalten und trotzdem weiter löschen" (`app.js` Z. 8210–8228). Ein fremdes
Passwort wird über das rohe Browserfenster `prompt()` abgefragt und dabei im Klartext gezeigt
(Z. 8199). **Das sind die zwei Stellen dieses Papiers, die keine Formfrage sind.**

---

## 2. Die Idee in drei Sätzen

**Ein Stilblatt, das auf jede Berührung leise antwortet und sonst schweigt** — Hover und Fokus
überall gleich, Schatten statt Milchglas, lesbare Überschriften, farbige Marken für Rolle und
Zustand, Bewegung nur an zwei Stellen, die etwas melden. **Ein Wörterbuch mit einem Wort je
Sache**, in dem IT-Deutsch das Maß ist und jedes Wort einmal entschieden wird — für den
Bildschirm, die Servermeldungen und die README zugleich. **Und ein Grundsatz für jeden Text:
er sagt in einem Satz, was ist und was der Klick tut; was er nicht ändern kann, wird ihm nicht
erklärt, und warum etwas so gebaut ist, steht in der Anleitung.** Keine Funktion fällt weg,
keine Farbe kommt dazu, kein Schema, keine Route, keine Abhängigkeit.

---

## 3. Was der Benutzer sieht — je Rolle

Kriterion kennt drei Rollen, und die Oberfläche zeigt jeder eine andere Menge. **Die
Textregeln sind deshalb je Rolle verschieden streng:** der Benutzer bekommt den kürzesten
Text, der Admin darf Fachwörter lesen, der Eigentümer auch Server-Handgriffe — aber jeder in
IT-Deutsch und ohne Kumpelton.

### 3.1 Der Benutzer

**Anmeldung.** Sieht fast aus wie heute — die Seite ist schon ruhig. Der zweite Faktor
verliert seine drei Kunstwörter („trägt", „trifft", „Noch der zweite Faktor.") und heißt
„Zwei-Faktor-Code"; die Einladungsseite sagt in zwei Sätzen, was zu tun ist, statt in vier
(„neu laden darfst du darin beliebig oft" fällt weg). Aus „Zugang anfragen" wird „Zugang
beantragen".

**Übersicht.** Die Kopfzeile ist deckend und wirft beim Rollen einen Schatten; kein Milchglas
mehr. Die Glocke heißt „Neuigkeiten" und schwillt einmal kurz an, wenn etwas Neues da ist.
Der Zahnrad-Knopf heißt „Einstellungen" *(Entscheidung E1)*. Die Filterleiste hat dieselben
Knöpfe wie heute, aber eine Sprache: überall „Alle", „Tags zurücksetzen" statt
„zurücksetzen", die Sortierung in Gruppen, die sagen, was sie sortieren („Allgemein",
„Bewertung", „Potenzial", „Testverlauf"), „Durchschnittsnote" statt „Note ⌀". Die Kacheln
bleiben, wie sie sind — nur „1 Links" wird „1 Link", „zuletzt 4" wird „letzte Note 4", „keine
Sterne" wird „noch nicht eingeschätzt".

**Eintrag.** Die Blocküberschriften sind lesbar (größer, heller). Der Bildstreifen unter dem
Hauptbild füllt die Breite — die Kacheln stehen als Raster ohne toten Rest rechts, und ihre
Größe stellt jeder für sich ein, wie die Schriftgröße *(Punkt 10 des Sammelblatts)*. Der
Absatz mit fünf Sätzen unter dem Bildfeld ist weg; was er sagte, steht an den Knöpfen selbst.
Der Bildausschnitt lässt sich als Rechteck aufziehen *(Fahrplanzeile)*. Jeder Löschdialog
folgt einer Form: Titel „Foto löschen?", ein Satz, Knopf „Löschen"; „entfernen" sagt nur
noch, was aus einer Liste genommen wird. Der Dialog „Wie diese Zahl zustande kommt" schrumpft
von 150 auf rund 50 Wörter und verliert den Admin-Satz, den der Benutzer nicht braucht. Die
Tooltips sagen den Rückweg („Nicht mehr anpinnen"), der Zoom heißt „Zoom".

**Einstellungen (heute „Systembereich").** Der Benutzer sieht zwei Reiter, „Persönlich" und
„Bestand". Die Karte „Zugang" heißt „Mein Konto"; ihre Erklärung ist ein Satz; **der
Server-Befehl für vergessene Passwörter steht nicht mehr dort** — stattdessen: „Passwort
vergessen? Der Admin kann es zurücksetzen." „Meine Sitzungen" sagt überall „Sitzung" und
nicht mehr „das ist so gewollt und bleibt so". Die Karten „Kategorien" und „Tags" erklären
dem Benutzer nicht das Umbenennen, das er nicht darf, sondern zeigen die Liste mit dem Satz
„Ändern kann sie der Admin". Die Karte „Links" sagt in einem Satz, wozu die Suchzeilen sind.

### 3.2 Der Admin

**Dasselbe wie der Benutzer**, dazu die Reiter „Benutzer" *(heute „Zugänge", Entscheidung E2)*,
„Datenbank" und „Installation".

**Benutzerverwaltung.** In der Liste steht die Rolle nicht mehr als graues Wort, sondern als
Marke — Eigentümer gefüllt, Admin umrandet, Benutzer neutral — und der Zustand als Punkt:
grün aktiv, gedämpft gesperrt, orange eingeladen. Die Knöpfe heißen „Sperren" und
„Entsperren" (statt „Freigeben"). **Das Löschen eines Benutzers ist ein einziges Fenster**
mit zwei Häkchen („Seine 5 Einträge mitlöschen", „Seine Beiträge in fremden Einträgen
mitlöschen") und zwei Knöpfen: „Abbrechen" bricht ab, „Benutzer löschen" löscht. Ein fremdes
Passwort wird in einem eigenen Fenster mit Passwortfeld vergeben, nicht im
Browser-`prompt()`. Die „Grabsteine" heißen „Gelöschte Benutzer". Die Anfragen-Karte sagt in
drei Sätzen, was die Registrierung *(Entscheidung E3)* tut.

**Datenbank.** „Kennzahlen" bleibt eine Zahlentafel; der Satz mit der SQL-Anweisung fällt,
„256 Bit roh" wird „256 Bit (Zufallsschlüssel)", „Journal" bekommt sein „(SQLite)". **Der
Kasten mit dem Klartextschlüssel wird nur dem Eigentümer gezeigt** *(Rollenbefund R1: heute
sieht ihn jeder Admin, obwohl Sicherung und Export dem Eigentümer vorbehalten sind).* Die
Karte „Bildablage" heißt „Bildformate", ihr Schalter „PNG-Fotos beim Upload in WebP
umwandeln", und es heißt überall „umwandeln", nie „umstellen".

### 3.3 Der Eigentümer

**Alles wie der Admin**, dazu Sicherheitsprotokoll, Mailversand, Sicherung, Alte Sicherungen,
Export und Import. **Hier darf es fachlich sein** — SMTP, STARTTLS, `.env`, `SICHERUNG_DIR`
sind die richtigen Wörter für den, der den Server betreibt. Aber auch hier gilt: ein Satz an
der Karte, die Folgen hinter „Mehr", das Warum in der README.

**Die Server-Handgriffe bekommen einen eigenen Ort:** einen gekennzeichneten Kasten „Auf dem
Server", den nur der Eigentümer sieht, mit dem Befehl in Schreibmaschinenschrift und einem
Satz davor — statt Befehlen mitten im Fließtext. *Das ist die einzige Stelle, an der
`docker compose …` am Bildschirm stehen darf.* Warnkästen bleiben, wo sie eine Handlung
verlangen (der Schlüssel liegt neben der Datenbank; kein Sicherungsordner eingerichtet) —
kürzer, und ohne den Satz, warum der Server das nicht selbst ableiten darf.

**Die Metaphern gehen:** „Sicherungsweg" → „Sicherung", „Austauschweg" → „Export", „die das
Haus verlässt" → „unverschlüsselt", „Hausanschluss" → „eigener Internetanschluss", „TLS von
Anfang an" → „SSL/TLS", „auf dem Wirt" → „per Kommandozeile am Server", „Kopie" →
„Sicherung", „Zielort" → „Sicherungsordner". Der Filterknopf „Bestand" im Sicherheitsprotokoll
heißt „Datenbank", weil er die Karten des Reiters „Datenbank" meint.

---

## 4. Die Regeln

### 4.1 Gestaltung — acht Regeln, und die ersten drei sind alt

**G1 · Farben behalten ihre Bedeutung, und es kommt keine dazu.** Gold ist Bewertung und
Anheftung, Orange ist Art und Bedienung, Grün ist erledigt und getestet, Blau ist die Aufgabe,
Rot ist das Zerstören (Projektstand 5.6; `style.css` Z. 11–40). **Rollen- und Zustandsmarken
werden deshalb aus Form gebaut, nicht aus Farbe:** gefüllt, umrandet, neutral — und ein Punkt
in Grün, Grau oder Orange, wo diese Farben ohnehin schon „aktiv", „zurückgenommen" und
„wartet auf Bedienung" bedeuten. *Ein Blau für den Admin wäre eine zweite Bedeutung für die
Farbe der Aufgabe.*

**G2 · Bewegung antwortet, sie unterhält nicht.** Alles, was man anfassen kann, gibt beim
Überfahren dieselbe leise Antwort: Rand oder Hintergrund eine Stufe heller, 150 ms, die
vorhandene Kurve `--ease`. Kacheln heben sich um zwei Pixel (heute drei). **Von selbst bewegen
sich genau zwei Dinge:** die Glocke, wenn Neues erscheint (einmal, 300 ms), und der Rand der
Karte, die gerade gespeichert wurde (einmal, 400 ms, Grün). `prefers-reduced-motion` schaltet
weiterhin alles ab (Z. 1891).

**G3 · Kein Milchglas — auch nicht dort, wo es heute steht.** Die Kopfzeile wird deckend
(`--bg`) und setzt sich beim Rollen mit einem Schatten ab (`--sh-sm`, Klasse ab acht Pixel
Rollweg); der Dialoghintergrund bleibt ein dunkler Schleier ohne `blur`. *Das ist die Regel
aus Abschnitt 10a, eingelöst an den zwei Stellen, die sie heute brechen.*

**G4 · Ein Maßsystem.** Abstände in Vielfachen von 4 px (4, 8, 12, 16, 24); die drei Radien
und drei Schatten des Stilblatts bleiben (`--r-sm`, `--r`, `--r-lg`; `--sh-sm`, `--sh`,
`--sh-lg`) und werden nur noch über ihre Variablen benutzt — kein weiterer fester Wert. Die
Umbruchpunkte (700, 860, 1024 px und die Querlage) bleiben, wie sie sind.

**G5 · Fokus ist überall sichtbar.** Der eigene Fokusring (2 px Orange, 2 px Abstand) bleibt
die eine Regel; die vier Stellen, die `outline: none` setzen (Z. 255, 770, 802, 1475), behalten
ihren Schein aus `--accent-dim` — das ist derselbe Ring in anderer Form. *Neu ist hier nichts;
die Regel wird aufgeschrieben, damit die nächste Runde sie nicht verliert.*

**G6 · Lesbarkeit vor Zierde.** Die Beschriftung `.label` wächst von 0,7 auf 0,8 rem und von
`--faint` auf `--muted`; die Zähler in den Blockköpfen („3 Kommentare") stehen in `--text-2`.
Der Erklärtext `.desc` einer Karte ist ein Satz. **Kein Text unter 0,78 rem, den jemand lesen
muss, um zu bedienen.** *Tooltips und Datumszeilen dürfen kleiner bleiben; sie ergänzen.*

**G7 · Der Bildstreifen nutzt die Breite, und seine Größe ist eine Einstellung.** Die
Telefonfassung (`grid` mit `minmax(60px, 1fr)`, Z. 3315) wird auf alle Schirme gezogen; die
Mindestgröße kommt aus einer Variablen, die eine Einstellung setzt — persönlich je Zugang,
feste Stufen, **ein Wert für alle Geräte**, dieselbe Maschine wie die Schriftgröße
(`getUserSetting`, `PUT /api/settings`). Obergrenze 150 px, weil dort die Reserve des
gespeicherten Vorschaubilds endet (Sammelblatt, Punkt 10). Kein Bestandslauf.

**G8 · Der Ausschnitt wird als Rechteck gezogen.** Heute setzt ein Klick den Punkt und ein
Schieber die Weite; das Rechteck sagt beides in einer Geste. Es ist eine Bedienform und kein
neues Feld: `focus_x`, `focus_y` und `zoom` bleiben, der Schieber bleibt als zweiter Weg für
Finger und Feinarbeit *(Entscheidung E9)*.

### 4.2 Sprache — sieben Regeln für jeden Text am Bildschirm

**S1 · Ein Text sagt, was ist und was der Klick tut.** Nicht, warum es so gebaut wurde; nicht,
was eine frühere Fassung tat; nicht, was der Entwickler dabei bedacht hat. *Die Probe: Steht
im Satz ein „weil", ein „deshalb", ein „so gewollt", ein „wie bisher" — dann gehört er in die
README.* Eine fachliche Warnung ist erlaubt; eine Folge, die man kennen muss, um zu
entscheiden, auch (Sammelblatt, Teil II, die drei Grenzfälle).

**S2 · IT-Deutsch.** Der Maßstab ist das Wort, das ein deutschsprachiger Anwender im Gespräch
sagt — Login, Link, Tag, Upload, Download, Backup und Sicherung, Reset, Screenshot, App, Code,
Server, SMTP. **Verboten am Bildschirm sind Übertragungen, die nur im Duden stehen:** die
Liste steht in 4.3 und wächst in den Prüfstand (Abschnitt 10). *Die Bilder des Projekts —
Stolperstein, Gegenprobe, Klemme, Wächter, Deckel, Pille, Kiste — bleiben in den Papieren und
Kommentaren; auf den Bildschirm gehören sie nicht.*

**S3 · Eine Sache, ein Wort.** Das Wörterbuch in 4.3 legt es fest. Wer einen Text schreibt,
schlägt nach; wer ein zweites Wort braucht, ändert das Wörterbuch und alle Stellen.

**S4 · Kurz, mit Maß.** Kartenbeschreibung: ein Satz, höchstens 20 Wörter. Tooltip: höchstens
acht Wörter. Toast: höchstens fünf. Dialogtext: höchstens zwei Sätze. Fehlermeldung: was nicht
ging und — wenn es einen gibt — der nächste Schritt („Der Link gilt nicht mehr. Bitte beim
Admin einen neuen anfordern."). **Der Benutzerbereich hält diese Maße immer; Admin und
Eigentümer dürfen sie hinter „Mehr" überschreiten.**

**S5 · Erklärt wird nur, was der Leser tun kann.** Was hinter seiner Rolle liegt, sieht er
nicht — weder den Knopf noch die Erklärung dazu. Server-Befehle stehen ausschließlich im
Kasten „Auf dem Server" (nur Eigentümer) oder in der README. *Kategorien und Tags: der
Benutzer sieht die Liste und einen Satz, der Admin die Werkzeuge.*

**S6 · Die Vokabelregel bleibt, und sie gilt überall.** Vokabelwörter (`V`) stehen ohne Artikel
und Beiwort; **vier Tooltips der Filterleiste tragen heute ein hart geschriebenes „Einträge"**
(Z. 2656, 2773, 2790, 2791) und der Tooltip der Aufgaben ein „1 offene Aufgabe" (Z. 2249) — beides
wird über `V` gebaut. **Ab dieser Runde gilt sie auch für „Bewertung": es wird das 13. und 14. Vokabelwort**
*(E14; was daran hängt, steht in 9.4)* — damit fällt jedes hart geschriebene „Bewertung" und
„Bewertungen" weg. **Und kein Vokabelwort wird in ein zusammengesetztes Wort verbaut:** aus
„Bewertungskriterien" wird „Bewertung: Kriterien", wie schon bei „Potenzial: Kriterien".

**S7 · Dialoge folgen einer Form.** Titel: Verb, Objekt, Fragezeichen („Foto löschen?"). Ein
Satz darunter. Der Knopf wiederholt das Verb („Löschen"). **„Abbrechen" bricht immer ab —
ohne Ausnahme.** Löschen heißt: die Daten sind danach weg (endgültig, oder im Papierkorb, und
der Satz sagt, welches). Entfernen heißt: etwas wird aus einer Liste oder Zuordnung genommen,
die Sache selbst bleibt (Tag vom Eintrag, Sitzung beenden). Kein Dialog läuft mehr über
`confirm()` oder `prompt()` des Browsers; alle gehen durch `confirmBox`, `nameBox` und
`passwortFenster` — die stehen schon da (`app.js` Z. 234–395).

### 4.3 Das Wörterbuch

**Ein Wort je Sache, für Bildschirm, Servermeldungen und README zugleich.** Die Spalte
„statt" nennt, was heute nebeneinander steht. Wo eine Zeile mit *E* markiert ist, muss der
Auftrag entscheiden (Abschnitt 9); die Empfehlung steht in der Zeile.

| Sache | Wort am Bildschirm | statt (heute) | Bemerkung |
|---|---|---|---|
| das eigene Konto | **Mein Konto** (Karte), sonst „dein Konto" | Zugang, Profil, „dieser Zugang" | *E2* — „Konto" ist das Wort, das jedes Betriebssystem und jeder Dienst benutzt |
| eine andere Person mit Zugang | **Benutzer** | Zugang, Grabstein, „der Betreffende" | *E2* — die Rolle „Benutzer" bleibt daneben bestehen; der Zusammenhang trennt („Rolle: Benutzer") |
| die Rollen | **Benutzer · Admin · Eigentümer** | — | unverändert; „Eigentümer dieser Installation" nur, wo die Abgrenzung nötig ist |
| der Vorgang des Anmeldens | **Anmelden / Anmeldung, Abmelden** | Login (nur im Code) | unverändert; Knopf „Anmelden", Seite „Anmeldung" |
| ein angemeldeter Browser/Gerät | **Sitzung** | Anmeldung, „Diese Anmeldung (hier)" | „Sitzung abgelaufen", „Diese Sitzung", „Alle anderen Sitzungen beenden" |
| Sitzungen enden | **werden beendet / abgemeldet** | „fallen", „fällt" | Kunstdeutsch geht ganz |
| das Passwort neu setzen | **Passwort zurücksetzen**, der Link heißt **Link zum Zurücksetzen** | Rücksetzlink, Passwortersatz, „direkter Weg" | „Reset-Link" wäre ebenso IT-Deutsch; ein Wort wählen |
| der Link für neue Benutzer | **Einladungslink** | — | unverändert; Knopf „+ Anlegen und Link erzeugen" |
| der zweite Faktor | **Zweiter Faktor**, der Code **Zwei-Faktor-Code**, die App **Authenticator-App**, die Ersatzcodes **Wiederherstellungscodes** | „Code des zweiten Faktors", „Telefon" als Gerät, „Schlüssel" | „Handy" statt „Telefon" im Fließtext |
| sich selbst einen Zugang wünschen | **Registrierung** (Schalter „Registrierung erlauben"), die Bitte heißt **Anfrage**, das Verb **beantragen** | Selbstanmeldung, „Zugang anfragen", „Wunsch-Benutzername" | *E3* — „Selbstanmeldung" versteht man, „Registrierung" kennt jeder |
| einen Benutzer aussperren / wieder hereinlassen | **Sperren / Entsperren** | Freigeben, Freigegeben | „Freischalten" bleibt allein den Anfragen |
| eine Anfrage annehmen | **Freischalten / Ablehnen** | „Anfrage freigegeben" (Protokoll) | im Protokoll „Anfrage freigeschaltet" |
| Daten endgültig oder in den Papierkorb geben | **Löschen** | entfernen, stillgelegt, „Zurück führt nichts", „danach gibt es keinen Rückweg" | Satz sagt „endgültig" oder „30 Tage im Papierkorb"; Rückgängig-Formel überall gleich: „Das lässt sich nicht rückgängig machen." |
| etwas aus einer Liste oder Zuordnung nehmen | **Entfernen** | löschen, zurücknehmen, „wieder entfernen" | Tag vom Eintrag, Bewertung eines anderen, Link aus der Liste |
| aus dem Papierkorb zurück | **Wiederherstellen** | Zurückholen, „ist wieder da" | Knopf und Tooltip gleich |
| aus dem Papierkorb endgültig | **Endgültig löschen** | Endgültig entfernen, „fallen sie heraus" | — |
| speichern | Knopf **Speichern**, Meldung **Gespeichert** | „Zugang ändern", „gemerkt", „gesetzt", „geändert", Stille | ein Muster für alle Felder; wo ein Feld still speichert, sagt der Toast trotzdem „Gespeichert" |
| der Mittelwert | **Durchschnitt**, als Zahl **⌀ 4,2** | Schnitt, Gesamtschnitt, gemittelt, „Note ⌀" | das Zeichen nur vor der Zahl, nie als Wort |
| Sterne je Kriterium | **Bewertung / Bewertungen** — **ab dieser Runde Vokabelwort** (`bewertungEinzahl`, `bewertungMehrzahl`), nie in ein zusammengesetztes Wort verbaut; die Sterne einer einzelnen Person **Bewertung von …** | Wertung, Sterne, Wert, Stimme | *E5, E14* — „Stimmen" (Knopf) wird „Wer hat bewertet"; „noch nicht bewertet" statt „keine Wertung"/„keine Sterne"; die Karte heißt **„Bewertung: Kriterien"** wie ihre Nachbarin „Potenzial: Kriterien" |
| die Zahl am Testtag | **Note** | Gesamtnote, Tagesnote | unverändert |
| Sterne vor dem Test | **Potenzial** (Vokabelwort) | — | unverändert; „noch nicht eingeschätzt" statt „keine Sterne" |
| das Bild am Eintrag | **Foto**, bewegt **Video**, beides zusammen **Fotos und Videos** | Element, Bild | „Bild" bleibt allein den Kommentarbildern („+ Bild") |
| die kleine Fassung eines Bildes | **Vorschaubild** | Ableitung, Standbild (am Video), thumb | „Vorschaubild des Videos" |
| eine hochgeladene Datei am Eintrag | **Datei** | Anhang, Anlage (nur Code) | unverändert |
| den Ausschnitt der Kachel festlegen | **Bildausschnitt**, die Weite **Zoom** | „Näher", „Wie eng der Ausschnitt sitzt" | — |
| die Kopie der Datenbank | **Sicherung**, der Ort **Sicherungsordner** | Kopie, Sicherungsweg, Sicherungsort, Zielort, Ort, Arbeits-/Projektverzeichnis | „Backup" darf im Erklärtext einmal in Klammern stehen („Sicherung (Backup)") |
| der Weg über eine Datei | **Export / Import**, die Datei **Exportdatei**, gestückelt **in Teilen** | Austauschweg, Betriebsart, „gezogen" | „Modus" statt „Betriebsart"; im Protokoll „Export erstellt" |
| PNG zu WebP machen | **umwandeln / Umwandlung** | umstellen, Umstellung, Bildumstellung | Karte heißt **Bildformate** statt „Bildablage" (*E6*) |
| Vorschaubilder neu rechnen | **erneuern** | nachziehen, nachgezogen | — |
| das Textprotokoll des Servers | **Server-Log** | Protokoll | „Protokoll" bleibt allein dem Sicherheitsprotokoll |
| die Seite hinter dem Zahnrad | **Einstellungen** | Systembereich, System, Verwaltungsbereich | *E1* — Reiter: Persönlich · Bestand · Benutzer · Datenbank · Installation |
| die Glocke | **Neuigkeiten** | „Neu seit deinem letzten Blick", „Tafel" | Tooltip „3 Neuigkeiten von anderen" / „Keine Neuigkeiten" |
| ein Schlagwort | **Tag** | — | unverändert (englisch); am Testtag immer mit Namen: „Tag „schnell" entfernen", damit „Tag" und „Testtag" nicht zusammenfallen |
| die Dienste hinter einer Suchzeile | **Suchmaschine(n)** | Suchanbieter, Anbieter, Startanbieter, Vorlage | *E7* — „Standard" statt „Start"; „Such-URL" statt „Vorlage" |
| Pflicht und Kür an Feldern | **(erforderlich) / (optional)** | „(wird gebraucht)", „(freiwillig)" | — |
| der Zustand „nichts eingeschränkt" | **Alle** | Alles anzeigen, alle | in allen Filtergruppen gleich geschrieben |
| die Anwendung als Handelnde | **Kriterion** oder Passiv | „die Installation fragt/speichert/gibt heraus" | „Installation" bleibt als Wort für die eine laufende Kopie („diese Installation") |
| die Umgebungsvariable | **Server-Einstellung `NAME`** | „aus der Umgebung", „in der .env" allein | der Name in Schreibmaschinenschrift, davor das Wort |
| die Vorschau im Vokabular | **Vorschau** | Probe | — |
| die Vorgabewerte | **Auf Vorgaben zurücksetzen** (Knopf) | „Vorgaben" | Verb an jeden Knopf |
| Sekunden/Byte-Einheiten, Datum | wie heute (`fmtDate`, `fmtBytes`) | ein ISO-Datum an einer Stelle (Z. 6700) | das eine Datum geht durch `fmtDate` |

**Wörter, die den Bildschirm verlassen — die Verbotsliste dieser Runde.** *Sie ergänzt die
Liste des Sprachwächters (Abschnitt 10) und gilt nur für Texte, die ein Mensch am Bildschirm
liest; in Kommentaren und Papieren bleiben die Bilder des Projekts erlaubt.*

> trägt / trifft (für gilt) · fallen / fällt / fallen weg / fallen heraus (für enden) ·
> Blick (für Besuch) · Tafel (für Fenster, Liste) · Grabstein · Wirt · Sicherungsweg ·
> Austauschweg · das Haus verlässt · Hausanschluss · TLS von Anfang an · Ableitung(en) ·
> nachziehen / nachgezogen · beim Hereinkommen · liegen (für gespeichert sein) · Probe (für
> Vorschau) · Näher (für Zoom) · Element (für Foto/Video) · Betriebsart (für Modus) ·
> Rohtext · Rechnung (für Berechnung) · Zustand zurücksetzen · Kasten (Servermeldung zur
> Phase eines Kriteriums) · Passwortspeicher (für Passwort-Manager) · Umgebung (für
> Umgebungsvariable) · gezogen (für erstellt) · steht / steht nicht (für funktioniert) ·
> Stück (für Dateien) · Boden · Schere · Deckel · Pille · Kiste · Klemme · Wächter ·
> Stolperstein · Rückbau · Bestandslauf · Fingerprint ohne Erklärung · Migrationsblock ·
> Austauschformat · jede Routen- oder Spaltenbezeichnung · jede Versionsnummer außer in den
> Kennzahlen und der Fußzeile

### 4.4 Funktion bleibt — die Regel, an der die Runde gemessen wird

**Jedes Bedienelement, das es heute gibt, gibt es nach dieser Runde noch — an derselben
Stelle oder eine Ebene tiefer, nie weg.** „Eine Ebene tiefer" heißt: hinter einem „Mehr", in
einem eigenen Fenster statt vier Browserfenstern, in einem Kasten „Auf dem Server" statt im
Fließtext. **Verschwinden dürfen genau fünf Dinge:** Erklärtext (er zieht in die README oder
hinter „Mehr"), doppelte Leerzustände (zwei fast gleiche Sätze untereinander), die rohen
Browserfenster `confirm()`/`prompt()` (ersetzt durch die eigenen Dialoge), das Milchglas —
**und der Knopf „Eintrag löschen" bei dem, der nicht löschen darf** *(E10; für ihn war er nie
eine Funktion, sondern eine Fehlermeldung auf Vorrat)*.

**Und einiges wird ausdrücklich nicht angefasst**, weil es Entscheidungen früherer Runden
sind, die nichts mit Form zu tun haben:

* die Bedeutung der Farben (5.6) und die Stapelordnung (`--z-…`, Z. 44–103);
* die Regel, dass eine Reihe von Karten so hoch ist wie ihre höchste Karte, und die
  Deckel der Listen (0.17.2 bis 0.17.5, 0.18.1) — *drei Runden Lehrgeld; die Karten werden
  gleichmäßiger, weil ihr Text kürzer wird, nicht weil das Raster anders rechnet;*
* die Umbruchpunkte und die gemessenen Kachelmaße (240 / 200 / 150 px);
* „ein Markup, zwei Gestalten" — keine Weiche nach Gerät, auch nicht für die Zeitleiste;
* die Rechte, die Routen, die Namen der Einstellungen in `/api/settings`, das Vokabular als
  Maschine, das Austauschformat;
* die Versionszeile im Fuß (0.12.3) — sie bleibt, klein, wie sie ist.

**Wie das geprüft wird:** Der Auftrag verlangt eine Zählung der Bedienelemente je Ansicht und
je Karte, vorher und nachher, als Tabelle im Änderungsprotokoll — Knöpfe, Felder, Häkchen,
Auswahlen, Pillen. *Eine Zahl, die kleiner wird, braucht eine Zeile, die sagt, wohin das
Element gezogen ist.* Und die vorhandenen Prüfgruppen zu Filtern, Ansichten, Blöcken, Dialogen
und Rollen bleiben grün; wo eine Zusage sich durch ein neues Wort ändert, wird sie umgedreht
und nicht gelöscht (Stolperstein 74).

### 4.5 Erklärtexte — drei Ebenen

**Ebene 1, an der Karte: ein Satz.** Was die Karte tut. „Alle Benutzer dieser Installation."
„Sterne vor dem Test: Welche Idee ist als Nächstes dran?"

**Ebene 2, hinter „Mehr": die Folgen.** Ein Aufklapper unter dem Satz — kein Tooltip, weil
ein Finger nicht überfahren kann — mit dem, was man wissen muss, um zu entscheiden: „Sperren
statt löschen: Ein gesperrter Benutzer kann sich nicht anmelden, seine Beiträge bleiben."
*Immer eingeklappt beim Aufbau; keine neue Einstellung dafür.*

**Ebene 3, in der README: das Warum und die Handgriffe.** Warum ein Sicherheitsprotokoll sich
nicht löschen lässt, warum der Server die öffentliche Adresse nicht aus dem Host-Header
nimmt, wie man ein Passwort auf dem Server zurücksetzt. *Die README hat für jedes dieser
Themen schon einen Abschnitt; die Karte darf ihn nennen („siehe Anleitung, ‚Der Schlüssel'"),
nicht wiederholen.*

**Warnkästen bleiben, wenn sie eine Handlung verlangen** — und nur dann. Der Kasten „Der
Schlüssel liegt neben der Datenbank" ist ein solcher: er sagt, was zu tun ist. Der Kasten
„Ohne OEFFENTLICHE_ADRESSE wird nichts verschickt — der Server wüsste sonst nicht …" ist zur
Hälfte einer: der erste Satz bleibt, der zweite geht in die README.

---

## 5. Die Befunde je Bereich — kurz

*Die vollständige Liste mit Zeile, heutigem Text, Befund und Vorschlag steht in der Anlage
(`Doku/Konzept_Oberflaeche_0_22_0_Anlage.md`). Hier steht, was den Bereich prägt.*

### 5.1 Vor der Anmeldung — sauber, mit drei Kunstwörtern

Rund 80 Texte, 17 auffällig, kein Entwicklerwort erreicht den Bildschirm. Der Bereich ist
schon nahe an dem, was diese Runde will. **Zu tun:** „trägt" und „trifft" (dreimal, immer am
zweiten Faktor), „Noch der zweite Faktor.", „Zugang anfragen", der Einladungshinweis mit 38
Wörtern und dem Satz „neu laden darfst du darin beliebig oft", und die Wahl zwischen „Sitzung"
und „Anmeldung", die hier beginnt und sich durch die ganze Anwendung zieht.

### 5.2 Übersicht — überladen, sonst gutes IT-Deutsch

Rund 130 Texte, 29 auffällig. Echte Fehler: „1 Links", „zuletzt 4" ohne Bezugswort (es ist
die letzte Note), „keine Sterne" als Hinweis auf eine fehlende Einschätzung, ein Tooltip, der
beim Abwählen weiter „auswählen" sagt, und vier hart geschriebene „Einträge", die die
Umbenennung des Betreibers unterlaufen. Ton: „Neu seit deinem letzten Blick", „8 sind das
Höchste — eine löschen, dann geht die nächste", „Schnitt über alle". **Und die Leiste selbst:**
sieben Pillen in der ersten Zeile, dreimal „Alle" in zwei Schreibweisen, zwei „zurücksetzen",
13 Sortierungen — die Vorschläge stehen in 6.3.

### 5.3 Eintrag — Uneinheitlichkeit statt Unverständlichkeit

Rund 210 Texte, 48 auffällig. Kunstdeutsch nur am Zoom („Näher"). Dafür das Hauptmuster der
ganzen Anwendung in Reinform: **dieselbe Handlung heißt entfernen, zurücknehmen und wieder
entfernen; dasselbe Ding heißt Foto, Bild und Element; neun Löschdialoge mischen „löschen" im
Titel mit „entfernen" im Satz oder umgekehrt.** Zwei Texte sagen etwas Falsches: der
Leerhinweis der Links verspricht eine Liste, die „scrollbar" wird (der Quelltext schneidet ab
und bietet „alle N anzeigen"), die Textvorschau verweist auf einen Knopf „laden", den es nicht
gibt. Der Dialog „Wie diese Zahl zustande kommt" ist mit rund 150 Wörtern der längste Text im
Benutzerbereich und trägt einen Satz für den Admin, den jeder liest. Der Absatz unter dem
Bildfeld erklärt an jedem Eintrag fünf Dinge, die an den Knöpfen stehen.

### 5.4 Glocke, Offen, Vergleich — ein Name fehlt

Die Glocke hat keinen Namen am Bildschirm — nur Umschreibungen („seit deinem letzten Blick",
„in diese Tafel", „Klick zeigt, wo"). **Sie heißt „Neuigkeiten"**, und die vier
zusammenhängenden Texte (Tooltip mit Zahl, Tooltip ohne, Fenstertitel, Einleitungssatz)
werden zusammen umgestellt. Die Umschalter „meine / alle" sind die einzigen kleingeschriebenen
Pillen der Anwendung.

### 5.5 Einstellungen für alle: Persönlich und Bestand — der Benutzer liest, was er nicht darf

Von den 58 auffälligen Stellen des ersten Systemabschnitts sieht der Benutzer 25. **Die
schwersten:** ein Server-Befehl an den Wiederherstellungscodes, den jeder Benutzer liest
(Z. 6836); „das ist so gewollt und bleibt so" (Meine Sitzungen); die Karten „Kategorien" und
„Tags", die dem Benutzer das Umbenennen erklären, das er nicht darf; die Karte „Zugang", die
das eigene Konto meint, einen Buchstaben neben dem Reiter „Zugänge", der alle anderen meint;
Sitzung und Anmeldung im Wechsel innerhalb einer Karte; „fallen" für Sitzungen, „trägt" für
Codes, „Probe" für die Vorschau, „Vorgaben" als Knopf ohne Verb; die abstrakten Feldnamen des
Vokabulars („Sache, Einzahl", „Merkmal erfüllt"), die die Vorgabe nicht nennen.

### 5.6 Einstellungen für Admin und Eigentümer — das Handbuch in Karten

Rund 280 Texte im zweiten Abschnitt, 65 auffällig — dazu die 33 Stellen des ersten Abschnitts, die nur Admin und Eigentümer sehen. Zusammen rund 2 500 Wörter Erklärtext. **Hier sitzen die
Programmierkollegen-Absprachen:** „der Grabstein IST das Löschen", „ein Sicherheitsprotokoll,
das sich wegräumen lässt, wäre keins", „das Feld daneben erscheint nur, wenn es auch gilt",
„Gespeichert bleibt der Rohtext", „Der Knopf oben bleibt trotzdem — wer weiß, was er tut",
„Welche es sind, rechnet der Server im Augenblick des Löschens noch einmal aus", „ohne
Ableitung, weil er kein Passwort ist". **Und die Metaphern:** Sicherungsweg, Austauschweg,
das Haus verlässt, Hausanschluss, Wirt, TLS von Anfang an, Ableitungen, nachgezogen,
hereinkommen. **Zwei Befunde sind mehr als Form:** der Löschdialog für Benutzer mit vier
Fenstern, in denen „Abbrechen" zweimal „behalten und weiter löschen" heißt, und das
`prompt()`, das ein fremdes Passwort im Klartext zeigt. **Ein Rollenbefund:** die Karte
„Kennzahlen" zeigt jedem Admin den Klartextschlüssel `ENCRYPTION_KEY=…`, obwohl Sicherung,
Export und Schlüsselwechsel dem Eigentümer vorbehalten sind.

### 5.7 Servermeldungen — meist gut, mit einem Telegrammstil

Rund 175 Meldungen, etwa 20 auffällig. „Nicht gefunden" steht zwanzigmal und sagt nie, was
nicht gefunden wurde — als Toast nach einem Klick ist das dürftig, aber verständlich. Der
Telegrammstil („Name fehlt", „Text fehlt", „Titel fehlt", „Tag-Name fehlt") wird ein Satz
(„Bitte einen Namen eingeben."). Kunstdeutsch und Innenwerte an einer Stelle: „Der Kasten muss
„vorher" oder „nachher" sein." (Z. 2228, 2262) — das sind die Werte einer Spalte, die kein
Benutzer je sieht. „Ungültiger Fokuspunkt" (3889), „Diesen Zweck gibt es nicht." (1184), „Im
Server ist etwas schiefgegangen." (6593), „nicht vorgesehen" (3933, 4361) und „Der Admin kann
ihn wieder freigeben." (630) bekommen ihre Wörter aus 4.3.

---

## 6. Die Gestaltung im Einzelnen

### 6.1 Die Kennwerte — heute und soll

| Element | heute (`style.css`) | soll |
|---|---|---|
| Kopfzeile (`.masthead`, Z. 305) | klebt; Verlauf auf `--bg` plus `backdrop-filter: blur(10px)` | deckend `--bg`, Linie darunter; ab 8 px Rollweg Klasse `gerollt` mit `--sh-sm`; kein `blur` |
| Dialoghintergrund (`.backdrop`, Z. 1830) | Schleier 74 % plus `blur(3px)` | Schleier 78 %, kein `blur` |
| Kachel beim Überfahren (`.card:hover`, Z. 506) | −3 px, `--sh`, Bild ×1,03 | −2 px, `--sh`, Bild ×1,02 |
| Listenzeile (`.mrow`, `.trow`, `.arow`) beim Überfahren | keine Antwort (nur `.lrow` hat eine) | Hintergrund `--surface-3`, 150 ms — dieselbe Regel für alle vier |
| Pille beim Überfahren (`.pill:hover`, Z. 407) | Rand `--accent-line` | Rand plus Hintergrund `--accent-dim`; die gewählte Pille bleibt gefüllt |
| Fokusring (`:focus-visible`, Z. 161) | 2 px `--accent`, 2 px Abstand | unverändert — aufgeschrieben als Regel G5 |
| Übergänge (48 Stellen) | 0,10 bis 0,40 s, eine Kurve | Farbe und Rand 150 ms, Bewegung 180 ms, Bild 300 ms; eine Kurve |
| Blockkopf (`.label`, Z. 811) | Monospace 0,7 rem, `--faint` | Monospace 0,8 rem, `--muted`; Zähler in `--text-2` |
| Kartenbeschreibung (`.desc`, Z. 1285) | 0,87 rem, mehrere Absätze | 0,87 rem, ein Satz, Rest hinter „Mehr" |
| Rolle und Zustand in der Benutzerliste | graue Wörter „Eigentümer", „aktiv" | Marke: Eigentümer gefüllt (`--accent-dim`, Rand `--accent-line`), Admin umrandet, Benutzer neutral; Punkt: aktiv `--green`, gesperrt `--faint`, eingeladen `--accent` |
| Glocke (`.glocke-punkt`) | Punkt erscheint | Punkt schwillt einmal an (300 ms) und bleibt |
| gespeicherte Karte | Toast „Gespeichert" | Toast bleibt; der Kartenrand leuchtet einmal `--green-dim` (400 ms) |
| Bildstreifen (`.thumbs`, Z. 727 / 3315) | breit: `flex`, 62 × 62 px fest; Telefon: Raster `minmax(60px, 1fr)` | überall Raster `minmax(var(--streifen), 1fr)`, `aspect-ratio: 1/1`; `--streifen` aus der Einstellung |
| Bildausschnitt (`.viewer.focus-mode`) | Klick setzt Punkt, Schieber setzt Weite | Rechteck aufziehen setzt beides; Schieber bleibt |
| Zeitleiste (`#zeitleiste`) | Kasten mit Rand und Hintergrund | ohne Rand, nur Linien und Punkte; Höhe wie heute |
| Filterleiste (`.filters`) | 4 Zeilen | 4 Zeilen, ein Wortlaut (6.3) |
| Systemkarten (`.sys-grid`) | Reihenhöhe = höchste Karte; Karten 200 bis 1 100 px hoch | Regel bleibt; Karten werden gleichmäßiger, weil der Text auf einen Satz fällt |
| Versionszeile im Fuß | 0,7 rem, `--faint` | unverändert |

**Was das an Zeilen kostet, grob geschätzt:** rund 40 Regeln im Stilblatt geändert oder neu
(Kopfzeile, Hover-Familie, Marken, Blockkopf, Bildstreifen, Zeitleiste), zwei Klassen und ein
Rollwächter mit drei Zeilen in `app.js`, eine Stufenliste und eine Einstellung für den
Bildstreifen. *Die Textänderungen sind die eigentliche Arbeit: rund 250 Stellen.*

### 6.2 Die Kopfzeile

Deckend, mit Linie; beim Rollen ein Schatten, der sagt: hier ist etwas darunter. Die Knöpfe
bleiben, wo sie sind — Suche, Neuigkeiten, Offen, Einstellungen, „Angemeldet als", Abmelden,
„+ Eintrag" —, „ein Markup, zwei Gestalten" bleibt (auf dem Telefon wandern vier davon ins
Menü). **Neu ist nur, was fehlt:** das Milchglas.

### 6.3 Die Filterleiste

**Vorschlag A — gleiche Knöpfe, eine Sprache (empfohlen, ohne Verhaltensänderung):**

* Zeile Status: **Alle · Getestet · Ungetestet · ★ Favoriten**, daneben die Gruppe
  **Abgelehnt: Alle · Ja · Nein** — oder, wenn „Ja/Nein" zu knapp ist, wie heute „Abgelehnt ·
  Nicht abgelehnt" unter der Beschriftung „Ablehnung". *(E8 entscheidet.)*
* Zeile Kategorie: **Alle · … · Ohne** — unverändert bis auf „Alle".
* Zeile Tags: **Und / Oder** bleibt (mit den Tooltips aus `V`), rechts „mehr" und **„Tags
  zurücksetzen"**.
* Zeile Sortieren: Gruppen **Allgemein** (Zuletzt geändert, Titel), **Bewertung**,
  **Potenzial**, **Testverlauf** (Testtage, Durchschnittsnote, Letzte Note). Daneben
  **Ansichten** wie heute.
* Die Zahl am Rücksetzer bleibt („Filter zurücksetzen (3)").

**BESCHLOSSEN IST A PLUS EIN AUFKLAPPER FÜR DIE TAGZEILE — und sonst nichts (E8, am Bild
entschieden).** Die Statuszeile behält ihre Ablehnungsgruppe: *drei schmale Pillen gewinnen
beim Verstecken fast nichts, und „abgelehnt" ist ein Filter, den man im Blick haben will.*
**Hinter „Weitere Filter" wandert allein die Tagzeile** — sie ist die Zeile, die den Platz
kostet: Umschalter, bis zu drei Zeilen Marken, „mehr" und „Tags zurücksetzen".

Sichtbar bleiben damit **Status (mit Ablehnung) · Kategorie · Sortieren · Ansichten**, und die
Leiste ist im Regelfall drei Zeilen statt vier.

> **ZWEI REGELN GEHÖREN DAZU, UND KEINE IST VERHANDELBAR.**
>
> **Greift ein Tagfilter, steht der Kasten beim Aufbau offen.** *Ein Filter, der die Liste
> kürzt und dabei unsichtbar ist, ist ein Fehler und kein Aufräumen* — dieselbe Überlegung
> wie beim abgeleiteten Statusfilter aus 0.21.1, eine Ansicht weiter.
>
> **`filterZahl()` zählt ihn weiter mit.** Die Zahl am Rücksetzer beantwortet die Frage
> *„warum sehe ich nicht alles?"*, und ein zugeklappter Tagfilter ist darauf die wichtigste
> Antwort.

**Die Kopplung aus 0.21.1 (die Sortierung gibt den Statusfilter vor) ist davon unberührt** und
wird beim Bau von 0.22.0 vorgefunden.

### 6.4 Die Kacheln

Bleiben, wie sie sind: quadratisches Bild, Marken oben links, Zähler unten rechts, Kategorie
in Orange, Titel, Tags, Testzeile, Sternzahl, Häkchen. **Nur der Wortlaut ändert sich** („1
Link", „letzte Note 4", „noch nicht eingeschätzt") **und das Heben wird um einen Pixel
leiser.** Die Kachelmaße sind gemessen (0.18.0, 0.19.4) und werden nicht angefasst.

### 6.5 Der Eintrag

**Blöcke.** Der Blockkopf ist lesbar (G6). Griff, Pfeil und Zähler bleiben. Ziehen, Einklappen
und die gespeicherte Anordnung bleiben, wie sie sind.

**Bilder.** Der Streifen unter dem Hauptbild ist ein Raster ohne toten Rest; die Kachelgröße
steht als Regler neben der Schriftgröße: **60 · 80 · 100 · 120 · 150 px**, Vorgabe 80. *Die
Stufen sind ein Vorschlag (E11); die Obergrenze 150 ist keine Geschmacksfrage (G7).* Der
Absatz unter dem Bildfeld fällt; das Bildfeld selbst sagt „Fotos und Videos hinzufügen —
Klick, Ziehen oder Strg+V", und ein Satz darunter: „Das erste Foto ist das Hauptbild —
Reihenfolge per Ziehen." Der Ausschnitt lässt sich als Rechteck ziehen (G8).

**Sternkästen.** Baulich unverändert aus 0.21.0; die Wörter ändern sich: „Wer hat bewertet"
statt „Stimmen" *(E5)*, „noch nicht bewertet / eingeschätzt" statt „keine Wertung / keine
Sterne", der Rechnungsdialog auf ein Drittel gekürzt und ohne den Admin-Satz für Benutzer.
**Und der Kopf des Kastens trägt ab jetzt ein Vokabelwort** *(E14)* — wer „Bewertung" in
„Ergebnis" umbenennt, sieht es dort, in der Sortierung, im Vergleich und auf der Kachel.

**Dialoge.** Alle nach S7. Der Knopf „Eintrag löschen" erscheint nur für die, die es dürfen
*(E10)* — heute steht er für jeden da, und der Server sagt Nein.

### 6.5a Die Sternzeile — der Rücksetzknopf steht zu nah am fünften Stern

> **AUS DEM BETRIEB AM 4. SEPTEMBER 2026, an der laufenden Installation gemeldet.** *Wortlaut:
> „der × zum Löschen ist zu nah am Stern, man denkt man klickt da auf den letzten Stern und
> dann löscht man die Bewertung."* **Der Befund ist nachgemessen und er stimmt.**

**Zwischen dem fünften Stern und dem × liegen zwei Pixel** — `.stars { gap: 2px }`
(`style.css` Z. 835). Damit steht der am häufigsten geklickte Knopf der ganzen Anwendung
unmittelbar neben dem, der die Zeile leert. **Und der Klick ist folgenlos zu machen: kein
Dialog, keine Meldung mit Weg zurück** — die eigenen Sterne dieser Zeile sind weg.

*Es ist keine Nachlässigkeit, sondern die Kehrseite einer richtigen Entscheidung.* 0.21.0 hat
den langen Knopf „Meine Bewertung zurücksetzen" und den versteckten Doppelklick durch **ein**
sichtbares Zeichen ersetzt, und es an die eigenen Sterne gesetzt, damit das Wort „meine"
überflüssig wird: *das × steht an MEINEN Sternen, also sind es meine.* **Der Gedanke trägt
weiter — nur der Abstand nicht.**

**Beschlossen ist (E15, E16):**

* **Der Knopf wandert ganz nach rechts, hinter die Durchschnittszahl.** Größtmöglicher
  Abstand zum fünften Stern; ein Fehlklick ist damit praktisch ausgeschlossen.
* **Er wird ein eigener runder Knopf** (26 px, gedämpft, beim Überfahren `--red-dim` als
  Fläche und `--red` als Farbe) **mit dem Zeichen ↺** — er sieht damit nicht mehr wie ein
  sechster Stern aus, und das Zeichen sagt „zurücksetzen" und nicht „löschen" *(zum Wort siehe
  4.3: meine Sterne werden **entfernt**, nicht gelöscht)*.
* **Die Meldung bekommt einen Knopf „Rückgängig"**: *„Sterne bei „Qualität" entfernt ·
  Rückgängig"*. Ein Klick schreibt den alten Wert zurück.

**Drei Dinge muss der Auftrag dabei beachten — alle drei am Quelltext von 0.21.0 geprüft:**

**(1) Der Knopf gehört in eine eigene Rasterspalte, nicht in die Zelle der Zahl.** `.rlist`
ist ein Raster (`1fr auto auto`), und die Zahlenspalte hat eine gemessene Mindestbreite, damit
die Sterne aller Zeilen auf einer Linie beginnen (0.21.0). **Steht der Knopf IN dieser Zelle,
wandert die Zahl, sobald eine Zeile keinen Knopf trägt** — genau der Sprung, den 0.21.0
abgeschafft hat. Also **vier Spalten** (`1fr auto auto auto`), und der Knopf behält seinen
Platz auch dort, wo er unsichtbar ist (`visibility`, wie heute).

**(2) Bei einem einzigen Zugang gibt es die Zahlenspalte gar nicht** — `drawRatings()` hängt
sie dann nicht an, und `.rlist.ohne-schnitt` rechnet mit zwei Spalten. **Dort steht der Knopf
also wieder unmittelbar neben den Sternen, und der ganze Befund wäre nicht behoben.** Für
diesen Fall gilt: **mindestens 12 px Abstand zu den Sternen**, aus der Rasterlücke oder aus
dem Innenabstand des Knopfes.

**(3) Neben der Durchschnittszahl kann der Knopf missverstanden werden** — als lösche er die
Bewertungen der anderen. *Genau deshalb saß er 0.21.0 an den eigenen Sternen.* Dagegen hilft
dreierlei, und alle drei gehören dazu: **die Zahl bleibt rechtsbündig und gedämpft** (sie ist
Auskunft), **der Knopf steht sichtbar abgesetzt dahinter** (eigene Spalte, runde Hoverfläche),
**und sein Hinweistext sagt es aus:** *„Meine Sterne entfernen"*. **Der Hinweistext ist hier
keine Zierde, sondern die Auflösung der Zweideutigkeit** — er stand schon in der Anlage als
Befund (Füllwort „hier"), und aus demselben Grund darf das Wort „Meine" nicht fallen.

**Die Rückgängig-Meldung, technisch:** Das Zurücksetzen ist heute ein `PUT
/api/items/:id/ratings` mit `value: 0` — **das Zurückschreiben ist derselbe Ruf mit dem alten
Wert.** Keine neue Route, kein neues Feld, kein Schema. Was dazukommt, ist ein **Knopf in der
Meldung**: `toast()` trägt heute nur Text. *Die Erweiterung ist klein und wird zunächst an
genau einer Stelle benutzt — der Auftrag entscheidet, ob sie allgemein gebaut wird oder eng.*

> **UND EINE GRENZE:** „Rückgängig" schreibt **den eigenen alten Wert** zurück und sonst
> nichts. Es ist kein Verlauf und keine Wiederherstellung — es ist die Umkehr genau des einen
> Klicks, der die Meldung ausgelöst hat. *Verschwindet die Meldung, ist der Weg zurück das
> erneute Setzen der Sterne, wie heute.*

### 6.6 Die Einstellungen (Systembereich)

**Jede Karte hat dieselbe Anatomie:** Titel — ein Satz — „Mehr" (wenn es mehr zu sagen gibt)
— Inhalt — Knöpfe unten links. Warnkästen nur, wo eine Handlung verlangt wird. Der Kasten
„Auf dem Server" (nur Eigentümer) hat eine eigene, ruhige Form: Monospace-Zeile mit
Kopierknopf, ein Satz davor.

**Persönlich:** Mein Konto · Meine Sitzungen · Darstellung (Schriftgröße, Bildstreifen,
Zeitleiste, Blockanordnung). **Bestand:** Kategorien · Tags · **Bewertung: Kriterien** *(heute
„Bewertungskriterien" — umbenannt, weil ein Vokabelwort nicht in ein zusammengesetztes Wort
verbaut wird, E14)* · Potenzial: Kriterien · Vokabular (Admin) · Links · Suchmaschinen (Admin)
· Papierkorb (Admin).
**Benutzer** (Admin): Benutzer · Anfragen · Sicherheitsprotokoll (E) · Mailversand (E).
**Datenbank** (Admin): Kennzahlen · Bildformate · Sicherung (E) · Alte Sicherungen (E) ·
Export und Import (E). **Installation** (Admin): Titel. *Einundzwanzig Karten wie heute; kein
Umzug einer Karte zwischen Reitern.*

**Die Benutzerliste** trägt die Marken aus 6.1. **Der Löschdialog** ist ein Fenster mit zwei
Häkchen und zwei Knöpfen. **Das fremde Passwort** wird in einem eigenen Fenster mit
Passwortfeld gesetzt. **Die Vokabularkarte** nennt in jedem Feldnamen die Vorgabe („Sache,
Einzahl — Vorgabe: Eintrag"), heißt ihre Vorschau „Vorschau" **und bekommt zwei Felder dazu:
„Bewertung, Einzahl" und „Bewertung, Mehrzahl"** *(E14)* — damit sind es vierzehn.

### 6.7 Marken für Rolle und Zustand

| | Eigentümer | Admin | Benutzer |
|---|---|---|---|
| Marke | gefüllt `--accent-dim`, Rand `--accent-line`, Text `--accent-hi` | Rand `--accent-line`, Text `--text-2` | Rand `--line`, Text `--muted` |

| Zustand | Punkt | Zeile |
|---|---|---|
| aktiv | `--green` | normal |
| gesperrt | `--faint` | Name gedämpft (wie „abgelehnt" auf der Kachel) |
| eingeladen, Passwort noch nicht gesetzt | `--accent` | normal, Tooltip „Einladung offen" |

*Keine neue Farbe: Grün heißt schon „positiv abgeschlossen", Orange „wartet auf Bedienung",
das gedämpfte Grau „zurückgenommen". Dieselben Marken stehen im Sicherheitsprotokoll hinter
den Rollenwörtern.*

### 6.8 Bewegung — die vollständige Liste

1. Überfahren: Rand oder Hintergrund eine Stufe heller, 150 ms — Knöpfe, Pillen, Kacheln,
   Listenzeilen, Reiter, Blockköpfe, Links.
2. Kachel: dazu −2 px und Schatten, 180 ms.
3. Dialog: einblenden 180 ms (heute 240), Schleier 150 ms.
4. Toast: wie heute (`pop`, 2,6 s).
5. Glocke: Punkt schwillt einmal an, 300 ms, wenn er erscheint.
6. Gespeicherte Karte: Rand leuchtet einmal grün, 400 ms.
7. Kachel-Einblenden beim Aufbau (`fade`): bleibt.

**Sonst nichts.** Kein Pulsieren, kein Glühen, kein Verlauf, keine Parallaxe, kein
Skelettbild. `prefers-reduced-motion` nimmt alles weg.

---

## 7. Neue Ideen — über die Liste des Projektstands hinaus

**Die Liste aus Abschnitt 10a ist vom 30. August; hier steht, was beim Ansehen der Fotos
dazugekommen ist.** Jede Idee trägt eine Empfehlung und einen Preis. *Keine davon ist
beschlossen — das ist die Speisekarte, aus der der Auftrag bestellt.*

| Nr. | Idee | Was es bringt | Was es kostet | Regeln | Empfehlung |
|---|---|---|---|---|---|
| **N1** | **Ein Zeichensatz statt Emoji und Schriftzeichen.** Die Zeilenaktionen sind heute ✎, ✕, ↩, ☐/☑, ★/☆ und das Emoji 📌 — jedes System zeichnet sie anders, das Emoji bunt. Die Anwendung hat schon eigene SVG-Zeichen (Suche, Glocke, Zahnrad, Papierkorb, Ausschnitt, Vollbild) mit einer Strichstärke; die übrigen kommen dazu. | Die Oberfläche sieht auf jedem Gerät gleich aus; kein farbiger Fremdkörper mehr am Kommentar. **Das ist der größte einzelne Schritt zu „modern" ohne eine Regel zu berühren.** | rund zehn Zeichen zeichnen (24-px-Raster, Strich 1,8), zwei Dutzend Stellen in `app.js` | keine neue Farbe; „Zeilenaktionen sind Zeichen, nicht Text" (README) bleibt erfüllt | **ja** |
| **N2** | **Tabellarische Ziffern** (`font-variant-numeric: tabular-nums`) in Listen, Kennzahlen und Sternspalten. | Zahlen stehen untereinander bündig; die Durchschnittsspalte springt nicht mehr um Bruchteile | eine Zeile im Stilblatt je Liste | — | **ja** |
| **N3** | **Leere Zustände mit dem vorhandenen Bildzeichen.** „Noch nichts erfasst", „Keine Treffer", „Noch keine Kommentare" bekommen das graue Platzhalterzeichen (`ICON_PH`) über dem Satz. | Ein leerer Bereich sieht gewollt aus, nicht kaputt | eine Klasse, ein Zeichen | Bewegung: keine | **ja, klein** |
| **N4** | **Punkt in der Statuspille** („● Getestet"). | — | — | — | **entfällt — gibt es schon** (`.switch` im Kopf des Eintrags; beim Fotografieren gesehen) |
| **N5** | **Marke „Hauptbild" und Zähler „1 / 2" am großen Bild.** | — | — | — | **entfällt — gibt es schon**; die Gemini-Fassung hat beides von hier |
| **N6** | **Helles Farbschema (Light Mode)**, umschaltbar oder nach `prefers-color-scheme`. Kriterion ist heute nur dunkel (`color-scheme: dark`, `theme-color #0e1012`). | Das eine Merkmal, das Nutzer am Tag und am Tablett zuerst vermissen | jede Farbentscheidung ein zweites Mal (rund 30 Variablen), die Bedeutungsfarben auf hellem Grund neu abstimmen, `theme-color` je Schema, alle Fotos mit neuem Kontrast prüfen, eine Einstellung | „keine neue Farbe" gilt je Schema; eine Einstellung mehr | **BESCHLOSSEN: eigene Runde nach 0.22.0** |
| **N7** | **Übersicht der Tastenkürzel** (`?` öffnet ein Fenster: `/` Suche, ← → Blättern, Esc schließen). | Wer mit der Tastatur arbeitet, findet, was schon da ist | ein Fenster, 20 Zeilen | — | optional |
| **N8** | **Seitenleiste statt Reiter in den Einstellungen** (breiter Schirm links die fünf Abschnitte, Telefon wie heute eine Liste). | Sieht aus wie jede moderne Einstellungsseite | die Kartenbreite sinkt von drei auf zwei Spalten; die Deckelmaße der Listen (0.17.x) müssen neu gemessen werden | „ein Markup, zwei Gestalten" bliebe möglich | **nein** — Preis ohne Not |
| **N9** | **Karten ohne Rand, nur Fläche und Schatten.** | Flacher, moderner Eindruck | auf `#16191c` gegen `#0e1012` ist die Fläche allein kaum zu sehen; die Rahmen tragen heute die Lesbarkeit | Kontrast | **nein** — stattdessen der Rand eine Stufe leiser (`--line-2`) an ruhigen Karten *(E12)* |
| **N10** | **Filterleiste in einem Kasten** (Gemini-Fassung: alle Filterzeilen in einer umrandeten Fläche). | Die Leiste liest sich als ein Werkzeug | ein Kasten mehr über dem Raster; die Übersicht wird höher, nicht ruhiger | — | **nein** |
| **N11** | **Kompakte Listenansicht** neben dem Kachelraster (Titel, Kategorie, Sterne, Testtage in einer Zeile). | Bei zweihundert Einträgen schneller als Kacheln | eine zweite Ansicht, eine Einstellung, jede Sortierung und jeder Filter zweimal geprüft | — | **nicht in dieser Runde** — das ist eine Funktion, keine Form; Sammelblatt |
| **N12** | **Eine Farbe je Kategorie.** | Schnellere Orientierung im Raster | eine neue Farbfamilie | **bricht G1** | **nein** |

**Zusammengefasst kommen aus dieser Tafel drei kleine Dinge in die Runde** (N1 bis N3), **eine
große in den Fahrplan** (N6), **zwei erwiesen sich beim Fotografieren als schon vorhanden** (N4,
N5 — *ein Grund mehr, jede Idee am laufenden Stand zu prüfen, bevor sie in einen Auftrag geht*),
**und der Rest bleibt hier stehen, damit er nicht in einem halben Jahr als neue Idee wiederkommt.**

---

## 8. Was andere machen — und was verworfen ist

**Kurz nachgesehen, wie Anwendungen mit demselben Zuschnitt — selbst gehostet, im Browser,
dunkel — mit denselben Fragen umgehen.**

* **Rollen als Marken.** Nextcloud, Gitea und GitHub zeigen Rollen und Zustände in Listen
  als kleine umrandete Marken, nicht als graue Wörter; die Farbe trägt den Zustand
  (aktiv/gesperrt), die Form die Rolle. *Deshalb 6.7 — Form für die Rolle, Punkt für den
  Zustand.*
* **Bewegung.** Die Gestaltungsregeln von Apple und Google sagen dasselbe in zwei Sprachen:
  Bewegung soll eine Antwort sein, kein Schmuck; Übergänge zwischen 100 und 300 ms; wer
  Bewegung abgeschaltet hat, bekommt keine. *Deshalb G2 und 6.8.*
* **Fokus.** Die WCAG 2.2 verlangt einen sichtbaren Fokus (2.4.7) und einen, der nicht
  verdeckt wird (2.4.11). *Kriterion hat ihn; G5 schreibt ihn fest.*
* **Wörter.** Der deutsche Stilführer von Microsoft trennt „löschen" (delete: die Daten sind
  weg) von „entfernen" (remove: aus einer Liste nehmen), sagt „Konto", „Benutzer", „Sitzung",
  „Anmelden", „erforderlich/optional" — und übersetzt Link, Tag, Upload, Download, Cookie,
  Backup nicht. *Deshalb S7 und das Wörterbuch.* Windows sagt „Sicherung" für Backup; beides
  ist IT-Deutsch, Kriterion bleibt bei „Sicherung".
* **Vorschaubilder.** Bildverwaltungen (Lightroom, Immich) führen die Kachelgröße als eine
  Einstellung der Ansicht, nicht je Gerät. *Deshalb G7 mit einem Wert für alle Geräte.*
* **Erklärtexte.** Einstellungsseiten von Nextcloud, Home Assistant und GitHub tragen je
  Einstellung einen Satz, dahinter ein Fragezeichen oder „Mehr erfahren"; das Handbuch ist ein
  Link. *Deshalb 4.5.*

**Verworfen — und warum.** *Die ersten sechs stehen seit dem 30. August im Projektstand; sie
werden hier wiederholt, weil dieses Papier sie sonst zu übersehen scheint.*

| was | warum nicht |
|---|---|
| Pulsierender Punkt für „AES-GCM 256-Bit", Schlossabzeichen | Eine Oberfläche sagt, was ist — nicht, wie sie gebaut ist (5.6). Ein Abzeichen für ein Chiffrierverfahren ist Werbung |
| Versionsnummer in einem Fußdock | dieselbe Regel; die kleine Versionszeile (0.12.3) genügt und bleibt |
| Milchglas (`backdrop-filter`) | kostet auf dem Telefon Leistung, macht Text unruhig — **und wird in dieser Runde an den zwei Stellen entfernt, an denen es heute steht** |
| Verläufe an Knöpfen | eine Farbe ist eine Aussage; ein Verlauf sind zwei; und Orange ist Bedienung, nicht Zierde |
| Leuchtende Sterne | Gold ist schon die Auszeichnung; ein Glühen wäre ein zweiter Kanal für dieselbe Aussage |
| Schwebendes Fußdock | unten sitzt auf dem Telefon die Vergleichsleiste |
| Ein Framework im Frontend, eine Icon-Schrift, Schriften von einem CDN | keine Build-Kette, keine 400 Pakete, läuft ohne Internet (Sammelblatt, Teil III); die SVG-Zeichen aus N1 liegen im Quelltext |
| Eine Hilfeseite in der Anwendung | eine zweite Wahrheit neben der README; die „Mehr"-Aufklapper tragen die Folgen, die README das Warum |
| Eine Einführungstour beim ersten Start | ein Bestand mit neun Karten und drei Knöpfen braucht keine; die leeren Zustände (N3) sagen, was zu tun ist |
| Ein „Kompaktmodus" als Einstellung | eine Einstellung für etwas, das eine Regel sein sollte (Abstände); die Kacheln sind gemessen |
| Die Zeitleiste auf dem Telefon von selbst einklappen | eine Weiche nach Gerät (0.12.0); die Einstellung „Zeitleiste anzeigen" gibt es schon, je Zugang |
| Routen, Einstellungsschlüssel oder Spaltennamen umbenennen, weil der Bildschirm ein anderes Wort bekommt | der Bildschirm ist eine Beschriftung; darunter ändert sich nichts (Vokabular-Grundsatz) |
| Ein Spinner oder Skelettbild beim Laden | „Kein Ladebalken und kein Kreisel" — die Zählzeile sagt schon „sucht …" (0.12.3) |

---

## 9. Grenzen und Offenes

### 9.1 Die Entscheidungen — gestellt und beantwortet

> **BESCHLOSSEN AM 4. SEPTEMBER 2026, im Gespräch mit dem Betreiber.** *E15 und E16 sind
> dabei aus einem Befund aus dem Betrieb entstanden, der während der Besprechung kam — der
> Rücksetzknopf der Sternzeile (6.5a).* Die Spalte
> „beschlossen" trägt die Antwort; wo sie leer ist, steht die Frage noch offen. *Die
> Empfehlung bleibt daneben stehen, auch wo anders entschieden wurde — eine Entscheidung ohne
> die verworfene Möglichkeit daneben ist in einem halben Jahr nicht mehr nachvollziehbar.*

| Nr. | beschlossen |
|---|---|
| **E1** | **„Einstellungen"** — der Bereich hinter dem Zahnrad wird umbenannt; Bildschirm und README ziehen mit, ältere Änderungsprotokolle bleiben, wie sie sind |
| **E2** | **„Mein Konto" / „Benutzer"** — die eigene Karte heißt „Mein Konto", Reiter und Karte der Verwaltung heißen „Benutzer"; die Rolle heißt weiterhin „Benutzer" |
| **E3** | **„Registrierung"** — Schalter „Registrierung erlauben", auf der Anmeldeseite „Zugang beantragen", die eingegangene Bitte bleibt „Anfrage" |
| **E4** | **eine Runde, drei Bauabschnitte** — Stilblatt · Wörterbuch und Texte · Bildstreifen und Ausschnitt |
| **E5** | **„Wer hat bewertet"** statt „Stimmen" — im Kopf beider Sternkästen und als Fenstertitel |
| **E6** | **„Bildformate"** statt „Bildablage" — der Name der Runde 0.19.0 im Projektstand bleibt davon unberührt |
| **E7** | **„Suchmaschinen"** statt „Suchanbieter", **„Standard"** statt „Start", **„Such-URL"** statt „Vorlage" |
| **E8** | **Vorschlag B mit einer Änderung: die Ablehnungsgruppe bleibt, wo sie heute steht** — in der Statuszeile. Hinter „Weitere Filter" wandert **nur die Tagzeile**; sie ist die Zeile, die den Platz kostet, und die Ablehnung ist mit drei Knöpfen schmal. *Am Bild entschieden (`filterleiste_varianten.png`).* **Zwei Regeln gehören dazu:** greift ein Tagfilter, steht der Kasten beim Aufbau offen — ein unsichtbarer Filter, der greift, ist ein Fehler —, und `filterZahl()` zählt ihn weiter mit |
| **E9** | **Rechteck und Schieber** — das Rechteck ist der schnelle Weg mit der Maus, der Schieber bleibt für den Finger und die Feinarbeit |
| **E10** | **Der Knopf „Eintrag löschen" erscheint nur für die, die löschen dürfen** — Verfasser und Admin. *Die einzige Stelle, an der für eine Rolle ein sichtbares Element verschwindet; es war für sie nie eine Funktion, sondern eine Fehlermeldung auf Vorrat.* |
| **E11** | **Bildstreifen: 60 · 80 · 100 · 120 · 150 px, Vorgabe 80** — fünf Stufen wie bei der Schriftgröße; 150 px ist die Grenze der Auflösung des gespeicherten Vorschaubilds |
| **E12** | **Ja, leiserer Rand an ruhigen Karten** (`--line-2`) — **am gebauten Stand anzusehen und zurückzunehmen, wenn er nicht trägt.** Das gehört in den Augenschein des Auftrags |
| **E13** | **Der Kasten mit dem Schlüssel im Klartext gehört dem Eigentümer.** Der Admin sieht stattdessen einen Satz: der Schlüssel liegt noch neben der Datenbank, und der Eigentümer sollte das ändern |
| **E14** | **„Bewertung" wird Vokabelwort — als Paar: `bewertungEinzahl` und `bewertungMehrzahl`, das 13. und 14. Wort.** *Gegen die Empfehlung dieses Papiers entschieden, und mit gutem Grund: „Potenzial" ist umbenennbar, sein Gegenstück nicht — eine Schieflage, die bei jedem Umbenennen sichtbar wird.* **Was daran hängt, steht in 9.4.** |
| **E15** | **Der Rücksetzknopf der Sternzeile wandert ganz nach rechts, hinter die Durchschnittszahl** — und wird ein eigener runder Knopf mit Hoverfläche statt eines Zeichens in der Sternreihe. *Am Bild entschieden (`sternzeile_varianten.png`).* **Was dabei zu beachten ist, steht in 6.5a.** |
| **E16** | **Ein Fehlklick ist reparierbar: die Meldung trägt „Rückgängig".** Nach dem Zurücksetzen steht unten „Sterne bei „Qualität" entfernt · Rückgängig"; ein Klick schreibt den alten Wert zurück |
| **N6** | **Das helle Farbschema bekommt eine eigene Runde nach 0.22.0.** *Am 4. September 2026 in den Fahrplan eingetragen: **0.23.0, „Die Oberfläche wird hell"** — die erste der freien Nummern, und es ist nichts gerückt. Die Ausarbeitung steht im Projektstand, Abschnitt 10a.* |

**Und hier stehen die Fragen, wie sie gestellt wurden — mit Empfehlung und Gegenrede.** *Sie
bleiben stehen, auch wo anders entschieden wurde: eine Entscheidung ohne die Möglichkeit, die
sie verworfen hat, ist in einem halben Jahr nicht mehr zu beurteilen (Stolperstein 201).*

| Nr. | Frage | Empfehlung | Was dagegen spricht |
|---|---|---|---|
| **E1** | Heißt der Bereich hinter dem Zahnrad weiter „Systembereich" oder „Einstellungen"? | **Einstellungen** — der Benutzer sieht dort nur sein Konto, seine Sitzungen, seine Darstellung und den Bestand; „System" verspricht ihm etwas, das er nicht bekommt | rund 700 Stellen in den Papieren sagen „Systembereich" (wie 0.17.1 „Anlage → Instanz"); die Umbenennung gilt für Bildschirm und README, die alten Protokolle bleiben, wie sie sind (Stolperstein 201) |
| **E2** | „Zugang" oder „Benutzer" und „Mein Konto"? | **Benutzer / Mein Konto** — ein Wort für die Person, eins für das eigene Konto; „Zugang" neben „Zugänge" ist ein Buchstabe Unterschied für zwei Dinge | „Zugang" steht in der README („Rollen und Zugänge"), im Sicherheitsprotokoll („Zugang angelegt") und in den Papieren; dieselbe Reichweite wie E1 |
| **E3** | „Selbstanmeldung" oder „Registrierung"? | **Registrierung** — das Wort, das jede Webseite benutzt | „Selbstanmeldung" ist verständlich und seit 0.9.x in allen Papieren |
| **E4** | Kommen alle Texte in eine Runde, oder werden Benutzerbereich (0.22.0) und Admin/Eigentümer-Texte (0.22.1) getrennt? | **eine Runde, drei Bauabschnitte** (Stilblatt · Wörterbuch und Texte · Bildstreifen und Ausschnitt) — ein Wörterbuch, das zur Hälfte gilt, erzeugt genau die zwei Wörter je Sache, die es beseitigen soll | die Runde wird die größte Textrunde des Projekts (rund 250 Stellen); zwei Runden wären je überschaubar |
| **E5** | Heißt der Admin-Knopf am Sternkasten weiter „Stimmen"? | **„Wer hat bewertet"** — so hieß er bis 0.21.0, und das Wort „Stimme" kommt sonst nirgends vor | „Stimmen" ist ein Wort und passt in beide Kastenköpfe; 0.21.0 hat es bewusst so gesetzt |
| **E6** | Heißt die Karte weiter „Bildablage"? | **„Bildformate"** — die Karte zählt Formate und wandelt um | „Bildablage" steht im Projektstand als Name der Runde 0.19.0 |
| **E7** | „Suchanbieter" oder „Suchmaschinen"? | **„Suchmaschinen"** — das Alltagswort; „Standard" statt „Start" | ein eigener Anbieter kann ein Forum sein, keine Suchmaschine |
| **E8** | Filterleiste: Vorschlag A (eine Sprache) oder B (dazu „Weitere Filter")? | **A jetzt, B beobachten** — B versteckt Filter, und ein versteckter Filter, der greift, braucht eine Regel mehr | die erste Zeile behält sieben Pillen |
| **E9** | Bleibt der Schieber neben dem Rechteck-Ausschnitt? | **ja** — für den Finger und für die Feinarbeit; das Rechteck ist der schnelle Weg | zwei Wege für eine Sache |
| **E10** | Wird der Knopf „Eintrag löschen" für die ausgeblendet, die es nicht dürfen? | **ja** — der Server sagt ohnehin Nein; ein Knopf, der nie geht, ist kein Knopf | „Funktion bleibt" — hier fällt für den Benutzer ein sichtbares Element, das für ihn nie eine Funktion war |
| **E11** | Stufen des Bildstreifens? | **60 · 80 · 100 · 120 · 150 px, Vorgabe 80** | die Vorgabe könnte auch 100 sein; das entscheidet der Blick auf den gebauten Stand (Punkt 10: „(a) zuerst bauen und dann fragen") |
| **E12** | Karten mit leiserem Rand (`--line-2`) an ruhigen Stellen (Systemkarten, Blöcke)? | **ja, versuchen — am gebauten Stand entscheiden** | Kontrast auf schlechten Bildschirmen |
| **E13** | Der Klartextschlüssel in den Kennzahlen nur für den Eigentümer? | **ja** | ein Admin, der die Installation einrichtet, brauchte ihn — dann macht ihn der Eigentümer zum Eigentümer |
| **E14** | Wird „Bewertung" das dreizehnte Vokabelwort, weil „Potenzial" eines ist? | **nicht in dieser Runde** — es ist eine Funktion, kein Text; drei Stellen sind hart geschrieben und bleiben es | die Schieflage bleibt sichtbar |

### 9.2 Was diese Runde nicht löst

* **Mehrsprachigkeit (Fahrplan 0.28.0).** Sie kommt nach dieser Runde und wegen ihr: wer
  Texte ordnet und je Sache ein Wort hat, zieht sie später in eine Sprachdatei, ohne sie
  zweimal anzufassen. *Diese Runde legt keine Sprachdatei an.*
* **Das helle Farbschema (N6).** **Eingetragen als 0.23.0, „Die Oberfläche wird hell"** —
  ausgearbeitet im Projektstand, Abschnitt 10a. *Sie braucht die Gestaltungsregeln, die diese
  Runde aufschreibt: ein zweites Schema ist nur zu bauen, wenn feststeht, was jede Farbe
  bedeutet.*
* **Die Listenansicht (N11), Fälligkeitsdaten an Aufgaben, die Wortgrenzensuche** — Sammelblatt.
* **Die Kommentare im Quelltext** („Die Kommentare werden knapp", 0.26.x) — dort liegt der
  Ursprung des Kumpeltons, und dort bleibt er, bis die Bereinigung sie schneidet. *Diese
  Runde fasst keinen Kommentar an, der nicht an einem geänderten Text hängt.*

### 9.3 Risiken

* **Der Prüfstand kennt die Texte.** `pruefung.js` sucht Wortlaute („Meine Sitzungen" elfmal,
  „Alles anzeigen" viermal, „Angemeldet als" dreimal), und die Rückbauten in `gegenprobe.js`
  suchen Quelltextzeilen mit Texten darin. **Jede Umbenennung zieht Prüfungen und Rückbauten
  mit** (Stolperstein 201: mitziehen, nicht löschen). *Das ist die eigentliche Arbeit hinter
  den 250 Stellen und der Grund, warum eine Textrunde nicht „nur Text" ist.*
* **Zwei Wörter je Sache während des Baus.** Wer das Wörterbuch abschnittsweise anwendet,
  hat dazwischen einen Stand, der beides sagt. *Deshalb E4: ein Wörterbuch, ein Durchgang.*
* **Die README.** Sie beschreibt Bedienung und Systembereich mit den heutigen Wörtern; die
  Abschnitte „Bedienung", „Rollen und Zugänge", „Vokabular", „Sichern" ziehen mit. *Wer die
  README vergisst, hat das Handbuch in einer anderen Sprache als die Anwendung.*
* **Geschmack.** Ob zwei Pixel besser sind als drei, ob 0,8 rem reicht, ob der leisere Rand
  trägt — das entscheidet der Blick auf den gebauten Stand, nicht das Papier. *Der Auftrag
  sollte deshalb einen Augenschein je Ansicht und je Rolle verlangen, bevor die Papiere
  geschrieben werden.*

---

### 9.4 Was an E14 hängt — „Bewertung" wird Vokabelwort

**Der Betreiber hat gegen die Empfehlung dieses Papiers entschieden, und der Grund trägt:**
seit 0.21.0 ist „Potenzial" umbenennbar und sein Gegenstück nicht. *Wer „Potenzial" in
„Wunsch" ändert, liest daneben weiter „Bewertung" — die Schieflage fällt genau dem auf, der
die Umbenennung überhaupt benutzt.* **Damit bekommt diese Runde einen kleinen Funktionsteil.
Er ist hier vollständig aufgeschrieben, damit der Auftrag ihn nicht unterschätzt.**

**Es sind zwei Wörter, nicht eines.** „Bewertung" kommt in beiden Zahlformen vor —
*„3 Kommentare · 2 Bewertungen"*, *„Die Bewertung von X"* —, und die Vokabelregel verlangt für
jede Form ein eigenes Feld, wie bei `sacheEinzahl`/`sacheMehrzahl`. **Also
`bewertungEinzahl` (Vorgabe „Bewertung") und `bewertungMehrzahl` (Vorgabe „Bewertungen"), das
13. und 14. Wort.** *Gezählt im Quelltext von 0.21.0: 61 Vorkommen von „Bewertung" in
`public/app.js`, davon 19 in der Mehrzahl.*

**Die Karte wird umbenannt.** Ein Vokabelwort wird nie in ein zusammengesetztes Wort verbaut —
*„Wunschkriterien" ginge, „Ergebniskriterien" auch, aber „Erwartungkriterien" nicht; das
Fugen-s kennt der Quelltext nicht* (die Regel steht seit 0.21.0 im Quelltext des Servers).
**Aus „Bewertungskriterien" wird deshalb „Bewertung: Kriterien"**, genau wie die Nachbarkarte
„Potenzial: Kriterien" heißt. *Dieselbe Regel trifft die Sortiergruppe und die
Vergleichszeile; beide tragen das Wort ohnehin schon allein.*

**Was es NICHT anfasst — am Quelltext von 0.21.0 nachgesehen:**

| | |
|---|---|
| Schema, Migrationsblock, Bestandslauf | **nein** — das Vokabular liegt in `settings`, nicht in einer Tabelle mit Spalten |
| `F_ROUTEN` | **unverändert** — `PUT /api/settings` säubert über `Object.keys(VOKABULAR_VORGABE)`; ein neues Wort läuft dort ohne eine weitere Zeile mit (der Quelltext sagt das ausdrücklich, seit 0.21.0) |
| Austauschformat | **bleibt 13** — die Exportroute nimmt das Vokabular nicht mit. *Beim Bauen zu bestätigen: `/api/export` schreibt Bestand und Kriterien, nicht die Einstellungen.* |
| die Rechnung, die Sterne, die beiden Durchschnitte | unberührt — es ändert sich eine **Beschriftung**, sonst nichts |

**Was zu tun ist, in der Reihenfolge des Bauens:**

1. `VOKABULAR_VORGABE` in `server.js` (heute zwölf Einträge) bekommt die zwei Wörter, mit dem
   Kommentar, der schon bei `potenzial` steht: *wird nirgends zu einem Wort verbaut.*
2. `V` in `public/app.js` bekommt sie ebenfalls — **die Liste dort ist die Vorgabe vor dem
   ersten Abruf und keine zweite Wahrheit; wer ein Wort vergisst, sieht das Feld in der
   Vokabularkarte leer** (genau das ist beim Bauen von 0.21.0 mit `potenzial` passiert und
   steht als Warnung im Quelltext).
3. Die Vokabularkarte bekommt zwei Felder — vierzehn statt zwölf — und die Probe unter den
   Feldern zeigt sie mit.
4. Die 61 Stellen in `public/app.js` gehen über `V`; dabei ist jeder Satz auf die
   Vokabelregel zu prüfen: **kein Artikel, kein Beiwort davor, kein Dativ Plural.** *Sätze wie
   „Meine Bewertung zurücksetzen" gibt es seit 0.21.0 nicht mehr; „3 Bewertungen" und
   „Bewertung von Anna" sind sicher.*
5. Die Karte heißt „Bewertung: Kriterien"; der Kartenschlüssel im Quelltext (`kriterien`)
   bleibt, wie er ist — **ein Bildschirmtext benennt keine Adresse um.**
6. Der Prüfstand: die Gruppe, die das Vokabular prüft, zählt heute die Wörter; **die Zahl
   wird zur Zahl 14 und ist ausdrücklich zu prüfen** (dieselbe Überlegung wie bei der
   Routenzahl in `F_ROUTEN`). Dazu ein Rückbau, der eines der zwei Wörter vergisst — er muss
   rot werden.

**Der Preis, ehrlich benannt:** rund 60 zusätzliche Textstellen, zwei Felder mehr in einer
Karte, ein Kartenname, der in README und Papieren nachzuziehen ist — und die Runde ist damit
nicht mehr reine Form und Sprache. *Sie bleibt trotzdem eine MINOR-Runde ohne Schema, ohne
Route und ohne Bestandslauf.*

---

## 10. Für den, der es baut

**Alles in einem Satz:** Ein Stilblatt mit rund 40 geänderten Regeln (Kopfzeile ohne
Milchglas, eine Hover-Familie, Marken, lesbare Blockköpfe, Bildstreifen als Raster, leisere
Zeitleiste), zwei Klassen und ein Rollwächter in `app.js`, eine Einstellung `streifen` auf
derselben Maschine wie `schrift`, das Rechteck im Betrachter, rund 250 Textstellen nach einem
Wörterbuch, **zwei neue Vokabelwörter für „Bewertung"**, acht Dialoge auf die eigenen Fenster
umgestellt, und ein Wächter im Prüfstand, der die Bildschirmtexte liest. Kein Schema, keine
Route, keine Abhängigkeit, kein Bestandslauf.

### Der Stand, auf dem die Runde aufsetzt

**0.21.1, Fingerprint `2295870b`, im Feld seit dem 4. September 2026.** *Die Zahlen dieses
Stands — Prüfungen, Rückbauten, Stolpersteine, `F_ROUTEN`, Migrationsblöcke, Austauschformat,
Karten, Module — stehen im Änderungsprotokoll 0.21.1 und werden von dort übernommen, beim
Start des Chats und nicht beim Schreiben dieses Papiers.*

> **WAS 0.21.1 FÜR DIESE RUNDE BEDEUTET.** Sie hat `drawFilters()` angefasst und dabei die
> Statuszeile um eine zweite Beschriftung und eine dritte Pillenform erweitert — **genau die
> Zeile, die E8 umbaut.** *Kein Widerspruch: E8 nimmt die Tagzeile heraus und lässt die
> Statuszeile stehen; die Vorgabe aus der Sortierung bleibt, wie 0.21.1 sie gebaut hat.*
> **Die fünf neuen Texte sind geprüft** (Anlage C1): drei ohne Befund, zwei zu kürzen, und der
> Rücksetzer sagt seit 0.21.1 nicht mehr die ganze Wahrheit.

### Was die Runde an den Zahlen ändert

| | diese Runde |
|---|---|
| Schema | **nein** — keine Spalte, kein Migrationsblock |
| Austauschformat | **unverändert** (13) |
| `F_ROUTEN` | **unverändert** — die Einstellung `streifen` reist auf `PUT /api/settings` mit, wie `schrift` |
| Zwecke der zweiten Bestätigung | unverändert |
| Karten in den Einstellungen | **21, unverändert** — nur Titel und Texte |
| ausgelieferte Module | unverändert |
| Vokabular | **12 → 14 Wörter** (E14): `bewertungEinzahl`, `bewertungMehrzahl` |
| Prüfstand, Rückbauten, Stolpersteine | wachsen ab der jeweils nächsten freien Nummer *(Stand nach 0.21.1 nachsehen)* |

### Die Reihenfolge

1. **Das Wörterbuch beschließen** — im Chat, vor der ersten Zeile; E1 bis E14 beantworten.
2. **Das Stilblatt** (6.1 bis 6.8, N1 bis N3): Kopfzeile, Hover-Familie, Blockköpfe, Marken,
   Zeitleiste, Zeichen. Augenschein je Ansicht auf 1600 px und einem Telefon.
3. **Die zwei Vokabelwörter zuerst** (E14, 9.4): `VOKABULAR_VORGABE`, `V`, die Karte, die
   Umbenennung der Kriterienkarte — **vor** dem Textdurchgang, damit die Texte gleich in
   ihrer Endfassung entstehen und nicht zweimal angefasst werden.
4. **Die Texte**, Bereich für Bereich in der Reihenfolge der Anlage (A bis H), je Bereich
   mit Blick durch alle drei Rollen. Dabei die Prüfungen und Rückbauten mitziehen.
5. **Die Dialoge**: acht Stellen mit `confirm()`/`prompt()` auf `confirmBox`, `nameBox`,
   `passwortFenster` — und das eine neue Fenster für das Löschen eines Benutzers.
6. **Der Bildstreifen** (G7), **das Rechteck** (G8) und **die Sternzeile** (6.5a) — die
   vierte Rasterspalte, der Knopf, die Meldung mit „Rückgängig".
7. **Der Prüfstand** (unten), **der Gegenprobenlauf**, **die Papiere**.

### Der Prüfstand — was er halten muss

* **Alle vorhandenen Gruppen bleiben grün**; Zusagen, die an einem Wortlaut hängen, werden
  umgedreht, nicht gelöscht (Stolperstein 74).
* **Neu: der Bildschirmtext-Wächter.** Der Sprachwächter liest heute Kommentare und Papiere
  (`nurKommentare`, `nurProsa`); ein zweiter Durchgang liest **die Texte in Anführungszeichen
  und Backticks von `app.js`** (also gerade das, was der erste wegwirft) und die
  `error:`-Texte der Serverdateien — gegen die Verbotsliste aus 4.3. *Bezeichner wie
  `zuschnittKiste` sind kein Text und werden nicht gelesen; die Liste des ersten Wächters
  bleibt, wie sie ist (Stolperstein: „ein Wächter, der jedes zweite Wort anmeckert, wird
  abgeschaltet").*
* **Neu: kein `backdrop-filter` im Stilblatt** — eine Regelprüfung wie die zu `[hidden]`
  (0.15.1), damit das Milchglas nicht zurückkommt.
* **Neu: kein `confirm(` und kein `prompt(` in `app.js`** — dieselbe Bauform.
* **Neu: Server-Befehle nur im Kasten.** `docker compose` und `zugang.js` kommen in `app.js`
  nur innerhalb des Eigentümer-Kastens vor — gezählt, nicht gesucht.
* **Neu: die Zählung der Bedienelemente** je Ansicht und Rolle, vorher und nachher, als
  Tabelle im Änderungsprotokoll (4.4).
* **Neu: die Einstellung `streifen`** — gültige Stufen, Rückfall auf die Vorgabe, Rückbau,
  der eine ungültige Stufe durchlässt und rot wird.
* **Neu: die Sternzeile** (6.5a). Der Knopf steht in seiner eigenen Spalte; **die Sterne aller
  Zeilen beginnen an derselben Stelle, auch wenn eine Zeile keinen Knopf trägt** — dieselbe
  Zusage wie in 0.21.0, nur eine Spalte weiter. Und: **bei einem einzigen Zugang** hat der
  Knopf trotzdem seinen Abstand. **Rückgängig schreibt den alten Wert zurück** — am gesendeten
  Rumpf zu prüfen, nicht an der Anzeige. **Ein Rückbau, der den Knopf wieder neben den fünften
  Stern setzt**, muss rot werden.
* **Rückbauten**: für jede neue Regel mindestens einer, und einer, der das Milchglas wieder
  einsetzt.

### Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere; der Sprachwächter läuft
  mit. **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt** — die Pixelmaße aus
  6.1 sind Vorgaben, die am gebauten Stand nachgemessen werden.
* **Der Vokabular-Grundsatz gilt für jedes neue Wort:** ohne Artikel, ohne Beiwort vor einem
  Vokabelwort (S6).
* **Neue Stolpersteine ab der nächsten freien Nummer.** Kandidaten aus diesem Papier:
  *Eine Regel, die im Papier steht und im Stilblatt gebrochen wird, ist keine Regel — der
  Prüfstand muss sie kennen* (das Milchglas). *Ein Text, den nur die Rolle darüber braucht,
  gehört hinter deren Klemme* (der Server-Befehl für jeden Benutzer). *„Abbrechen" bricht
  ab* (der Löschdialog).
* **Der Gegenprobenlauf gehört vor das Schreiben der Papiere.**

### Die Dokumente

* `Doku/Aenderungsprotokoll_0.22.0.md`: was gebaut wurde je Datei, **das beschlossene
  Wörterbuch mit den Entscheidungen E1 bis E14 und ihrer Begründung**, die Tabelle der
  Bedienelemente vorher/nachher, die Kennwerte des Stilblatts gemessen, die umgedrehten
  Zusagen, neue Stolpersteine, Gegenprobentabelle, Prüfungszahlen vorher/nachher.
* **Projektstand 5.6** bekommt die Gestaltungsregeln G1 bis G8 und die Sprachregeln S1 bis
  S7 als geschriebene Regel — *sonst läuft es beim nächsten Mal wieder auseinander* (so
  steht es schon in 10a).
* **README**: die Abschnitte, deren Wörter sich ändern (E1 bis E3, E5 bis E7), der Absatz zum
  Bildstreifen unter „Bedienung", der Absatz zum Rechteck; und die Server-Handgriffe, die vom
  Bildschirm hierher ziehen, bekommen einen eigenen Abschnitt „Auf dem Server".
* **`CHANGELOG.md`** in der Form ab 0.17.2 — **ohne Kasten**, es ist keine Datenbankstufe; mit
  einem Satz zu den zwei Dingen, die ein Betreiber merkt: die Wörter sind andere, und der
  Bildstreifen ist einstellbar.
* **Das Sammelblatt**: Punkt 10 wandert in die Runde; die zwölf liegen gebliebenen Sätze aus
  Teil II („Dieselbe Art Satz …") sind mit dieser Runde erledigt und werden dort so vermerkt.
* **Dieses Papier bleibt liegen**, wie `Konzept_Potenzial.md` — als Herleitung. Die Anlage
  fällt mit dem Änderungsprotokoll weg oder bleibt als Nachweis; das entscheidet der
  Betreiber beim Schreiben der Papiere.

---

## Quellen

* Projektstand Kriterion 0.21.1, Abschnitt 5.6 (Anzeige und Bedienung), Abschnitt 10a
  („Die Oberfläche wird ruhiger", mit der Tabelle des Verworfenen), Abschnitt 10 (Fahrplan).
* Sammelblatt `Doku/Fehler_und_Ideen.md`, Punkt 10 (Der Bildstreifen im Eintrag) und Teil II
  („Dieselbe Art Satz wie in Punkt 2 von 0.17.0 steht an zwölf weiteren Stellen").
* `pruefung.js`, Gruppe „Der Sprachwächter" — die Wortliste und die Begründung, warum sie
  kurz bleibt.
* WCAG 2.2, Erfolgskriterien 2.4.7 (Focus Visible) und 2.4.11 (Focus Not Obscured):
  https://www.w3.org/TR/WCAG22/
* MDN, `prefers-reduced-motion`:
  https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion
* Microsoft, deutscher Stilführer und Terminologie (löschen/entfernen, Konto, Sitzung):
  https://learn.microsoft.com/de-de/globalization/reference/microsoft-style-guides
* Apple Human Interface Guidelines, Motion; Google Material Design, Motion — beide: Bewegung
  als Antwort, 100–300 ms, Rücksicht auf abgeschaltete Bewegung:
  https://developer.apple.com/design/human-interface-guidelines/motion ·
  https://m3.material.io/styles/motion/overview
