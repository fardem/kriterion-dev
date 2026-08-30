# Changelog

Alle beachtenswerten Änderungen an diesem Projekt werden in dieser Datei
festgehalten — kurzgefasst für den Betrieb. Die Einzelheiten je Version stehen
in `Doku/Aenderungsprotokoll_<Version>.md`.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

> **AB 0.10.0 GILT DIESE FORM, DAVOR NICHT.** Die Einträge bis einschließlich
> 0.9.1 stehen so, wie sie geschrieben wurden — mit eigenen Überschriften und
> ohne Datum. *Sie werden nicht umgeschrieben: was einmal draußen war, bleibt,
> wie es war* (Semantic Versioning, Punkt 3). Wo die Form abweicht, ist der
> Eintrag älter und nicht falsch.
>
> **NACHGETRAGEN AM 27. AUGUST 2026: 0.8.6, 0.8.10, 0.8.20 UND 0.8.30.** Diese
> vier Versionen hatten keinen Eintrag, obwohl es für jede ein
> Änderungsprotokoll gibt — *„für jede Version ein Eintrag" ist die Regel, und
> sie war an vier Stellen verletzt.* Für **0.8.5 und alles davor** steht am Ende
> eine Sammelzeile je Version; damals gab es diese Datei noch nicht.
> **Nachgetragen wird in der Form der Nachbarn, nicht in der neuen** — eine
> dritte Form mitten in einer geschlossenen Reihe wäre schlechter als die Lücke.
> *Und ohne Datum, aus demselben Grund: die Nachbarn tragen keines.*
>
> **Die Abschnittsnamen bleiben englisch** — `Added`, `Changed`, `Deprecated`,
> `Removed`, `Fixed`, `Security` —, so wie die deutsche Fassung von Keep a
> Changelog sie führt. *Das ist kein Bruch mit der Sprachregel des Projekts:
> der Maßstab dort ist das Wort, das ein deutschsprachiger Entwickler im
> Gespräch benutzt, und das sind hier diese sechs.* Leere Abschnitte werden
> weggelassen.
>
> **Zwei eigene Abschnitte kommen dahinter und bleiben:** „Was du danach von
> Hand tun musst" und „Was gleich bleibt". Sie sind für einen Betreiber das
> Wertvollste hier, und keine der sechs Arten trägt sie.
>
> **Zurückgezogene Versionen** werden als `## [x.y.z] - JJJJ-MM-TT [YANKED]`
> gekennzeichnet — großgeschrieben, damit ein Mensch es bemerkt.

## [Unreleased]

*Hier wird mitgeschrieben, während gebaut wird. Beim Herausgeben wird daraus
ein Abschnitt mit Nummer und Datum.*

---

## [0.17.1] - 2026-08-30

**Was der Benutzer sieht.** Sechs Handgriffe aus **einem** Rundlauf von Hand,
gemeldet unmittelbar nachdem 0.17.0 gebaut war — **keiner aus dem Fahrplan und
keiner aus dem Sammelblatt.** **Fünf sind Wortlaut und Anordnung, einer ist ein
echter Fehler:** das Video fing im Vollbild ein zweites Mal an.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** **PATCH**, und diesmal ohne
> Streit: *kann die Instanz danach etwas, was sie vorher nicht konnte?* **Nein.**
> Sechs Handgriffe an Wortlaut, Anordnung und einem Fehler. **Auch die
> Umbenennung ist Wortlaut** — und die eine Adresse, die sich dabei ändert, wird
> abwärtskompatibel gehalten.

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. **Die Sicherung des Datenverzeichnisses ist deshalb
> Empfehlung und nicht Pflicht.**

### Changed

- **Aus „Anlage" wird „Instanz" — überall.** *Das Wort trug in dieser Anwendung
  die ganze Installation und passte nicht; englisch wäre das* instance. **692
  Stellen in achtzehn Dateien:** Oberfläche, Meldungen, Kommentare, README,
  Projektstand und Sammelblatt. **Der fünfte Abschnitt des Systembereichs heißt
  damit „Instanz" und liegt unter `#/system/instanz`.** *Die alte Adresse
  `#/system/anlage` wird **still übersetzt**, nicht abgewiesen — sie steht in
  Lesezeichen und in älteren Papieren, und ein Link, der ins Leere führt, ist
  eine Mitteilung ohne Weg.* **Nicht umbenannt sind die abgeschlossenen
  Änderungsprotokolle, die Einträge dieser Datei bis einschließlich 0.17.0, die
  beiden Konzeptpapiere — und fünf Stellen, an denen „Anlage" einen ANHANG
  meint.**
- **Der Text im Kachel „Zugang" sagt, was gilt.** *„Die Adresse ist freiwillig"*
  stimmt nicht, wenn die **Selbstanmeldung** an ist — dann kommt ohne sie keine
  Bestätigungsmail an. **Der Satz und die Marke am Feld richten sich seither
  danach, was gerade gilt.** **Die Vorgabe „mindestens 10 Zeichen" steht jetzt
  am Passwortfeld**, für das sie gilt, und nicht mehr im Absatz unter der
  Adresse. **Und der Weg über den Server steht nur noch beim Eigentümer** — alle
  anderen lesen, dass sie sich an den Admin wenden. *Der Absatz ist dabei kürzer
  geworden.*
- **Die Listen in den Kacheln bekommen die Höhe, die ihre Kachel hergibt**, und
  rollen erst dann, wenn sie wirklich überlaufen. *„Meine Sitzungen" zeigte drei
  von zehn Anmeldungen und blendete einen Rollbalken ein, während die Kachel
  darunter leer stand.* **Eine Regel für alle Listen** — Sitzungen, Tags,
  Kategorien, Kriterien, Zugänge, Anfragen, Papierkorb, Sicherheitsprotokoll.
  **Die einzige Ausnahme ist die Teileliste des Exports**, und ihr Grund steht
  als Satz daneben.
- **Der Mailversand ordnet sich in vier Reihen** — *wer* (Anbieter) · *wohin*
  (Server, Port, Verschlüsselung) · *womit* (Benutzername, Passwort) · *als wer*
  (Absenderadresse). *Sechs Felder standen untereinander, jedes über die volle
  Breite einer Karte, die seit 0.16.0 breit ist.* **Die Absenderadresse steht
  allein**, weil unter ihr zwei eigene Hinweissätze stehen. **Auf dem Telefon
  fällt alles wieder untereinander.** Der Zustandsblock oben bleibt, wie er war.
- **Die beiden Zeitangaben einer Anmeldung stehen rechtsbündig untereinander**,
  links davon der Name. *Nebeneinander waren sie unterschiedlich lang und sahen
  aus wie ein Versehen.* **Der orangene Rahmen der eigenen Anmeldung reicht
  weiterhin bis zum Rand** — er hängt seither an der nachgebenden Namensspalte
  des Rasters statt am Umbruch.

### Fixed

- **Das Video fing im Vollbild ein zweites Mal an.** *Die Lightbox baute sich
  einen eigenen Abspieler und ließ den inneren stehen: zwei Elemente mit
  derselben Quelle, zwei Tonspuren, zwei Stellen im Film.* **Gebaut ist ein
  fliegender Wechsel:** beim Öffnen übernimmt der obere Stelle und Zustand des
  inneren, und der innere **gibt seine Quelle ab** — anhalten allein genügt
  nicht, ein Element mit Quelle lädt weiter. **Beim Schließen geht es denselben
  Weg zurück**, und zwar über denselben Pfad wie das Kreuz, das Blättern und
  Escape. *Für den, der davorsteht, ist es dasselbe Video, nur größer.*

### Was du danach von Hand tun musst

**Nichts.** Keine Sicherungspflicht — diese Version fährt **keinen**
Migrationsblock —, keine neue Zeile in der `.env`, keine neue Abhängigkeit,
niemand wird abgemeldet, **keine Zeile im Protokoll**.

*Die Sicherung schadet trotzdem nie:*

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)   # Empfehlung, nicht Pflicht
```

**Ein Lesezeichen auf `#/system/anlage` bleibt gültig** — es führt an dieselbe
Stelle und wird in der Adresszeile auf `#/system/instanz` nachgezogen.

### Was gleich bleibt

**Das Austauschformat** bleibt bei **11**, **`F_ROUTEN`** bei **69** — keiner
der sechs Punkte braucht eine schreibende Route. **`VORGAENGE`** bleibt bei
**zwanzig**, **`BESTAETIGUNG_ZWECKE`** bei **sieben**, **das Vokabular** bei
**elf**, **die Merkmale** bei **vierzehn**, **die Karten** bei **achtzehn** in
**fünf** Abschnitten, **die Migrationsblöcke** bei **sieben**, **die
persönlichen Schlüssel** bei **acht**. **Keine Karte wechselt ihre Rolle, keine
Route kommt dazu, keine geht weg.** *Die Instanz kann danach nichts, was sie
vorher nicht konnte.*

---

## [0.17.0] - 2026-08-30

**Was dasteht, und was nicht dasteht.** Neun Befunde aus **einem** Rundlauf von
Hand, gemeldet unmittelbar nach dem Einspielen von 0.16.0 — **keiner davon aus
dem Fahrplan und keiner aus dem Sammelblatt.** Einer ist ein Fehler, sieben sind
Verbesserungen, einer nimmt etwas weg. **Dazu ein zehnter, beim Bauen
gefunden:** derselbe blinde Fleck wie der erste, eine Ansicht weiter.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** Der Auftrag ging als `0.16.1` in
> die Besprechung — sieben der acht Punkte betreffen Anzeige und Wortlaut.
> **Ein Punkt kippt es:** sagt die Glockentafel „3 Kommentare · 4 Bewertungen"
> statt „7 neue Beiträge", **kann die Anlage danach etwas, was sie vorher nicht
> konnte** — sie sagt, WAS auf einen wartet. *Eine Runde, die eine Funktion
> bringt, ist keine PATCH-Runde, auch dann nicht, wenn sie klein ist.*

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. **Die Sicherung des Datenverzeichnisses ist deshalb
> Empfehlung und nicht Pflicht** — *bei 0.16.0 war sie Pflicht, und der
> Unterschied ist der Migrationsblock, den es hier nicht gibt.*

### Added

- **Die Glockentafel sagt, WAS neu ist** — „3 Kommentare · 4 Bewertungen" statt
  „7 neue Beiträge". *„Beitrag" war ein Sammelwort, das die Anlage sonst
  nirgends benutzt.* **Bei nur einer Art steht auch nur eine Angabe da**;
  „0 Bewertungen" wäre eine Auskunft über nichts. **Die Auskunft lag längst vor
  und wurde weggeworfen:** die beiden Abfragen sind seit jeher getrennt und
  wurden erst danach zu einer Zahl addiert — *die Aufteilung kostet keine
  zusätzliche Abfrage.* **Der Punkt an der Glocke und die Zahl am Knopf „Offen"
  bleiben, was sie waren.**
- **Jede Zeile der Tafel sagt, von wem** — und zwar **nur zu den Kommentaren**.
  *Ein Kommentar trägt seinen Verfasser am Eintrag ohnehin sichtbar; eine
  Bewertung tut das nicht.* **Wer welche Bewertung abgegeben hat, bleibt
  anonym** — die Liste „Wer hat bewertet" sieht weiterhin nur der Admin. Eine
  Zeile, an der ausschließlich Bewertungen neu sind, trägt deshalb keinen Namen.
- **Der Erklärkasten hinter der Gesamtnote nennt die Vergleichszahl ohne
  Gewichtung** — was käme heraus, wenn alle Kriterien gleich zählten. *Erst der
  Unterschied macht die Gewichtung sichtbar; die Formel allein sagt, WIE
  gerechnet wird, nicht, WAS die Gewichte ändern.* **Stehen alle Gewichte
  auf 1, steht sie gar nicht da**, und **ergeben beide Zahlen dasselbe, sagt der
  Kasten genau das.** *Gerechnet wird sie dort, wo die andere gerechnet wird;
  der Kasten liest sie.*

### Changed

- **Die Glocke meldet Kommentare und Bewertungen von ALLEN**, die eigenen
  eingeschlossen. **Der Satz „Eigene Beiträge stehen nie hier" aus 0.16.0 ist
  damit zurückgenommen.** *Der Grund ist der Betreiber, der **allein** arbeitet:
  ihm meldete eine Glocke, die nur Fremdes zeigt, nie etwas — und die Anzeige,
  die ihm die Auskunft gab, fällt in derselben Runde weg.* **Eine Regel statt
  zwei; eine Ausnahme für den Fall „ein Zugang" wäre selbst wieder eine zweite
  Wahrheit.**
- **Die Anmeldeseite misst ihre Höhe in `dvh` statt in `vh`** — mit `100vh` als
  Rückfall darüber. *Auf dem Telefon ist `vh` die **große** Anzeigefläche, die
  ohne Browserleisten; die Seite war damit höher als das Fenster, und die
  Versionszeile stand unter der Falz.* **Der Abstand war nie die Ursache.**
- **Die Zeile einer Anmeldung in „Meine Sitzungen" bricht immer um**, nicht
  mehr erst auf dem Telefon. *Sie lief seitlich aus der Karte hinaus, und der
  orangene Rahmen der eigenen Anmeldung endete am sichtbaren Ausschnitt.* Die
  Anordnung der umgebrochenen Stücke bleibt dem schmalen Schirm.
- **Die Karte „Mailversand" steht so breit wie ihre drei Nachbarn** im
  Abschnitt „Zugänge". *Vier gleich breite Kacheln sind einfacher zu begründen
  als drei plus ein Rest.*
- **`GET /api/items` trägt je Eintrag drei Angaben statt einer** —
  `neuKommentare`, `neuBewertungen` und `neuVon` an der Stelle von `neuFremd`.
  *Ohne gespeicherten Bezugspunkt fehlen sie gemeinsam und stehen nicht auf 0.*
  **Eine Summe trägt die Antwort ausdrücklich nicht:** sie folgt aus den beiden
  Zahlen und wird in der Oberfläche an einer Stelle gebildet.

### Removed

- **Die Filterpille „Neu seit …" ist gestrichen.** *Zwei Anzeigen für dieselbe
  Frage — was hat sich getan, seit ich zuletzt hier war — sind eine zu viel; die
  Auskunft trägt die Glocke.* **Dazu verletzte sie eine Hausregel:** sie stand
  auch dann da, wenn ihre Zahl null war. Am Knopf „Offen" steht seit 0.16.0 das
  Gegenteil. **Die Filterzeile ist damit um eine Pille kürzer.**
  **Was dabei verlorengeht, gehört gesagt:** die Pille zeigte **jede** Änderung
  an einem Eintrag — auch einen geänderten Titel, eine neue Datei, einen neuen
  Testtag. **Die Glocke tut das nicht;** sie bleibt bei Kommentaren und
  Bewertungen. *Vertretbar, weil eine Titeländerung etwas ist, das jemand **am**
  Eintrag getan hat, und kein Beitrag, der **für** dich daliegt — und weil die
  Übersicht ohnehin nach der letzten Änderung ordnet.*
- **Zwei Erklärtexte haben die Oberfläche verlassen**, ersatzlos: der Satz über
  die **Bibliotheksfassung** in den Kennzahlen und der Block **„Was die Glocke
  nicht verspricht"** in der Tafel. **Beide stehen in der README.** *Eine
  Oberfläche sagt, WAS IST — nicht, warum es so gebaut wurde. Die Vorbehalte
  selbst gelten unverändert.*

### Fixed

- **Die Kriterienliste zerfiel bei genau EINEM Zugang.** Namen und Sternreihen
  standen versetzt statt untereinander: *Name · Sterne · nächster Name.*
  **Die Ursache war ein Raster mit fester Spaltenzahl und einer bedingten
  Zelle** — drei Spalten, aber nur zwei Zellen je Zeile, weil die
  Durchschnittsspalte erst ab zwei Zugängen dasteht. **Die Spaltenzahl folgt
  seither derselben Bedingung wie die Zelle.** *Der Fehler ist älter als
  0.16.0 — das Raster kam mit 0.14.0, die bedingte Zelle gibt es seit 0.8.91;
  sichtbar wurde er erst, als die Gewichtsmarken die Namensspalte breiter
  machten.*
- **Der Erklärkasten hinter der Gesamtnote verwies auf eine Spalte, die es bei
  einem einzigen Zugang nicht gibt.** *„Das sind die Zahlen rechts in den
  Zeilen" meinte die Durchschnittsspalte der Kriterienliste dahinter — und die
  steht dort erst ab zwei Zugängen.* **Der Satz nennt jetzt die Spalte „Note",
  die zum Kasten selbst gehört und in jeder Lage dasteht.** *Derselbe blinde
  Fleck wie darüber, eine Ansicht weiter; gefunden beim Bauen und nicht im
  Betrieb.*

### Was du danach von Hand tun musst

**Nichts.** Keine Sicherungspflicht — diese Version fährt **keinen**
Migrationsblock —, keine neue Zeile in der `.env`, keine neue Abhängigkeit,
niemand wird abgemeldet, **keine Zeile im Protokoll**.

*Die Sicherung schadet trotzdem nie:*

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)   # Empfehlung, nicht Pflicht
```

**Eine gespeicherte Ansicht, die den Filter „Neu seit …" noch trägt, bleibt
lesbar** — er wird übergangen, und der gespeicherte Wert bleibt unangetastet.
*Die Zeilen mit `key = 'zuletztGesehen'` bleiben in `user_settings` stehen und
werden nicht mehr gelesen; es gibt dafür keinen Migrationsblock.*

### Was gleich bleibt

**Das Austauschformat** bleibt bei **11**, **`F_ROUTEN`** bei **69** — keiner
der neun Punkte braucht eine schreibende Route. **`VORGAENGE`** bleibt bei
**zwanzig**, **`BESTAETIGUNG_ZWECKE`** bei **sieben**, **das Vokabular** bei
**elf**, **die Merkmale** bei **vierzehn**, **die Karten** bei **achtzehn** in
**fünf** Abschnitten, **die Migrationsblöcke** bei **sieben**. **Keine Karte
wechselt ihre Rolle.** **Die Rechnung des Gesamtschnitts wird nicht angefasst**
— die Vergleichszahl entsteht in derselben Schleife, die es schon gab.
*Die persönlichen Schlüssel sinken von neun auf **acht**.*

---

## [0.16.0] - 2026-08-29

**Der Systembereich bekommt Abschnitte mit eigener Adresse, die Kopfzeile eine
Glocke, und das Wort „gewichtet" erklärt sich endlich selbst.** Vier Punkte aus
dem Sammelblatt, vier Zeilen aus dessen Teil II und ein Punkt aus dem Betrieb,
der nie darin stand.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.16.0 ist **MINOR**: *kann die
> Anlage danach etwas, was sie vorher nicht konnte?* **Mehrfach ja** — eine
> Einstellung verlinken, sehen, dass andere etwas hinterlassen haben, die
> eigene Gesamtnote nachvollziehen, im Vollbild löschen.

> **DIES IST EINE DATENBANKSTUFE — anders als geplant.** Die Bewertungen
> bekommen mit `gesetzt_am` einen Zeitpunkt; ohne ihn kann die Glocke über
> **fremde Bewertungen** nichts sagen, denn die Tabelle `ratings` trug bis
> 0.15.1 keinen. **Es ist der siebte markierte Migrationsblock. Die Sicherung
> des Datenverzeichnisses ist deshalb PFLICHT und nicht Empfehlung.**
> *Das Austauschformat bleibt trotzdem bei **11**: der Zeitpunkt geht nicht in
> die Exportdatei — die Anlage weiß bei einer eingespielten Bewertung nicht,
> wann sie ursprünglich vergeben wurde, und behauptet es auch nicht.*

### Added

- **Fünf Abschnitte im Systembereich, jeder mit eigener Adresse** —
  `#/system/persoenlich`, `…/bestand`, `…/zugaenge`, `…/datenbank`,
  `…/anlage`. Sie folgen der **Rechteleiter**. **Ohne Adresse ließe sich keine
  Einstellung verlinken und die Zurück-Taste bräche** — das ist der ganze
  Punkt. `#/system` bleibt gültig und löst sich auf den ersten sichtbaren
  Abschnitt auf. **Ein Abschnitt ohne sichtbare Karte erscheint gar nicht**,
  und eine Adresse dorthin fällt auf den ersten sichtbaren zurück; die
  Adresszeile wird dabei nachgezogen. *Auf dem Telefon wird aus der
  Reiterreihe eine Liste — ein Markup, zwei Gestalten.*
- **Eine Glocke in der Kopfzeile, mit einem Punkt, und die Zahl der offenen
  Aufgaben am Knopf „Offen".** Die Glocke meldet **fremde Kommentare und
  fremde Bewertungen** seit dem letzten Öffnen ihrer Tafel; **jede Zeile der
  Tafel führt zu ihrem Eintrag**. *Ein Punkt für ein Ereignis, eine Zahl für
  einen Zustand — die beiden Zeichen werden nirgends vertauscht.* **Beide
  Zahlen reisen mit einer Antwort mit, die die Übersicht ohnehin holt**; es
  gibt keinen zusätzlichen Abruf je Seitenaufbau. Was sie **nicht** verspricht,
  steht in der Tafel selbst und in der README.
- **Ein Klick auf die Zahl im Bewertungsblock öffnet die Rechnung dieses
  Eintrags** — Kriterium, Note, Gewicht, Produkt, Summe, Teiler, Ergebnis.
  **Kein erfundenes Beispiel, sondern die eigenen Werte.** *Der Kasten **liest**
  die vorhandene Rechnung; er rechnet sie nicht nach.*
- **Die Kennzahlen nennen Version und Verfahren** — Verschlüsselung
  `sqlcipher`, Schlüssel
  **256 Bit roh**, Journal **WAL**, Passwörter **scrypt**, aus der geöffneten
  Datenbank abgelesen. **Paketversionen ausdrücklich nicht.**
- **Ein Papierkorb in der Vollbildansicht**, mit **derselben Klemme und
  derselben Rückfrage** wie über dem großen Bild darunter. Er steht abgesetzt
  und vor dem Schließenkreuz.
- **Die Bewertungen tragen einen Zeitpunkt** (`ratings.gesetzt_am`). Zeilen
  von vor 0.16.0 und eingespielte Bewertungen tragen **keinen** und bleiben der
  Glocke unsichtbar — was die Anlage nicht weiß, behauptet sie nicht.
- **Der Prüfstand misst die Länge der Funktionen je Datei und nennt sie.**
  **Er weist nichts ab**: eine harte Grenze wäre eine Zusicherung, die bei der
  ersten ehrlichen Ausnahme abgeschaltet wird. Rot werden darf, **welche**
  Funktion die längste ist — dieselbe Linie wie bei `F_ROUTEN`.

### Changed

- **Export und Import stehen in EINER Karte** — sie meinen dieselbe Datei.
  **Aber nicht gleichrangig:** der Export liest, der Import ersetzt Bestand.
  Die zerstörende Hälfte steht unter einem Trennstrich, mit kleinerer
  Überschrift und leiserer Zeichnung; **die zweite Bestätigung bleibt, wo sie
  war**. **Damit sind es achtzehn Karten statt neunzehn.**
- **`renderSystem()` ist von 2.466 auf 79 Zeilen geschrumpft.** Die achtzehn
  Karten stehen als **Tabelle** mit je einer Zeile: wohin sie gehört, woran sie
  hängt, wie sie aussieht, was sie ausrüstet. *Kein Framework, keine
  Build-Kette — die Antwort auf die Größe sind kleinere Funktionen.* **Keine
  Karte wechselt dabei ihre Rechteklemme.**
- **`GET /api/items/:id` liefert den Rechenweg des Gesamtschnitts mit** —
  aus derselben Schleife, die die Zahl erzeugt. **Die Übersicht bekommt ihn
  nicht:** tausend Einträge trügen tausend Aufstellungen für eine Zahl, die
  niemand aufklappt.
- **`GET /api/items` trägt zwei neue Zahlen je Eintrag** — `offeneAufgaben`
  und, sobald ein Bezugspunkt gespeichert ist, `neuFremd`. *Ohne Bezugspunkt
  fehlt das Feld ganz und steht nicht auf 0: „nichts Neues" und „es gibt keinen
  Bezugspunkt" sind zwei verschiedene Aussagen.*

### Fixed

- **`node gegenprobe.js 2 256` fuhr neben Rückbau 256 auch die 83 mit**, weil
  der Filter Nummer **oder** Namensteil prüfte und „SHA-256 statt SHA-1" die
  Zeichenfolge 256 trägt. **Der Beifang war stumm und verfälschte damit die
  Gegenprobentabelle.** Seither gilt: **greift ein Argument als Nummer, gilt
  nur die Nummer.**

### Was du danach von Hand tun musst

**Die Sicherung des Datenverzeichnisses ist Pflicht** — diese Version fährt
einen Migrationsblock:

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)
```

Danach wie immer einspielen. Beim ersten Start meldet das Protokoll
`ratings um gesetzt_am ergaenzt (Migration auf 0.16.0)` samt der Zahl der
vorhandenen Bewertungen. **Sonst nichts:** keine neue Zeile in der `.env`,
keine neue Abhängigkeit, niemand wird abgemeldet.

*Die Glocke erscheint erst, nachdem die Übersicht einmal verlassen wurde* —
vorher gibt es keinen Bezugspunkt, und eine Glocke, die beim ersten Blick für
den ganzen Bestand läutet, wäre keine Auskunft.

### Was gleich bleibt

**Das Austauschformat** bleibt bei **11** — der Zeitpunkt an der Bewertung geht
nicht mit hinaus. **`F_ROUTEN`** bleibt bei **69**: der Bezugspunkt der Glocke
läuft über `PUT /api/settings`, es kommt keine schreibende Route dazu.
**`VORGAENGE`** bleibt bei **zwanzig**, **`BESTAETIGUNG_ZWECKE`** bei
**sieben**, **das Vokabular** bei **elf**, **die Merkmale** bei **vierzehn**.
**Keine Karte wechselt ihre Rolle** — was der Admin sah, sieht der Admin, was
dem Eigentümer gehörte, gehört ihm. **Die Rechnung des Gesamtschnitts wird
nicht angefasst**: sie steht weiter an einer Stelle, der Kasten liest sie nur.

---

## [0.15.1] - 2026-08-29

**`hidden` wirkt wieder.** An einem Eintrag, der **nicht** abgelehnt war,
standen die Aussage zur Ablehnung und ihr Eingabefeld trotzdem da — beide mit
gesetztem `hidden`. **Befund aus dem Betrieb, gemeldet kurz nach dem Einspielen
von 0.15.0.**

> **DIE URSACHE LAG IM STILBLATT, NICHT IN DER OBERFLÄCHE — und sie ist älter
> als 0.15.0.** Der Browser blendet `hidden` über `[hidden] { display: none }`
> in **seinem** Stylesheet aus, und **jede** eigene `display`-Regel schlägt die.
> `.row-in` tut das seit jeher; das Eingabefeld war damit nie versteckt, auch
> nicht in 0.14.0. *Gemessen in Chromium: 72,9 px standen an jedem nicht
> abgelehnten Eintrag für nichts.*

> **PATCH.** Die Anlage kann danach nichts, was sie vorher nicht konnte — sie
> tut endlich, was sie versprochen hatte. **Kein Schema, keine Route, keine
> Rechteänderung, Austauschformat unverändert 11.**

### Fixed

- **`hidden` versteckt wieder, überall.** Eine Regel ganz oben im Stilblatt —
  `[hidden] { display: none !important; }` — stellt die Vorgabe des Browsers
  wieder her. **Sie ist die einzige Stelle im ganzen Stilblatt mit einem
  `!important`**, und sie ersetzt zwei örtliche Notlösungen, die dasselbe
  Problem zweimal an ihrer jeweiligen Stelle gelöst hatten. *Was versteckt ist,
  nimmt seither auch keinen Platz mehr.*
- **Die Aussage zur Ablehnung steht nur noch an abgelehnten Einträgen.** Wo der
  Ablehnungsknopf nie gedrückt wurde, steht nichts.

### Changed

- **Das Eingabefeld für die Begründung erscheint, solange abgelehnt ist und
  KEIN Grund dasteht** — und darüber hinaus dann, wenn man es über den Text
  oder das ✎ aufmacht. **Nie beides zugleich mit der Aussage.** *Bis 0.15.0
  hing das an einem einzelnen Klick: ein frisch geladener Eintrag ohne Grund
  zeigte das Feld deshalb nicht, und nach dem Entfernen des Grundes kam es
  nicht von selbst zurück. Jetzt wird es aus dem Zustand gerechnet und stimmt
  nach jedem Neuzeichnen.*
- **Wird ein Eintrag mit vorhandener Begründung erneut abgelehnt, bleibt das
  Feld zu** — die alte Begründung steht dann in der Aussage und lässt sich über
  das ✎ ändern. *Sie geht nicht verloren, sie steht nur woanders.*

### Was du danach von Hand tun musst

**Nichts.** Keine Sicherungspflicht, keine neue Zeile in der `.env`, keine neue
Abhängigkeit, niemand wird abgemeldet, kein Blick ins Protokoll nötig.

### Was gleich bleibt

**Alles außer der Anzeige.** Das Austauschformat bleibt bei **11**, die
markierten Migrationsblöcke bei **sechs**, **`F_ROUTEN`** bei **69**,
**`VORGAENGE`** bei **zwanzig**, **die Karten im Systembereich** bei
**neunzehn**, **das Vokabular** bei **elf**. **Der Filter „abgelehnt" aus
0.15.0 ist unberührt**, ebenso die Rechte an der Begründung.

---

## [0.15.0] - 2026-08-29

**Die Übersicht filtert nach „abgelehnt", und die Begründung kommt zur Ruhe.**
Zwei Befunde aus dem Betrieb, beide an derselben Stelle — der eine eine alte
Lücke, der andere eine Nachbesserung an dem, was 0.14.0 gerade gebaut hatte.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.15.0 ist **MINOR**, obwohl der
> Auftrag als `0.14.1` herausging: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Zweimal ja** — nach „abgelehnt" filtern, und eine fremde
> Begründung entfernen. *Nur der Ruhezustand der Begründung allein wäre PATCH
> gewesen.* **Der Fahrplan rückt entsprechend nach oben.**

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock,
> **Austauschformat unverändert 11**. **Die Sicherung des Datenverzeichnisses
> ist deshalb Empfehlung und nicht Pflicht** — Pflicht war sie bei 0.14.0, und
> zwar wegen des Migrationsblocks. *Wer von einer Fassung vor 0.14.0 kommt,
> sichert trotzdem: der Sprung führt über jene Datenbankstufe hinweg.*

### Added

- **Ein Filter für „abgelehnt" in der Statuszeile** — *Alle · Abgelehnt · Nicht
  abgelehnt*, als eigene Gruppe hinter der Beschriftung „Ablehnung".
  **Kombinierbar mit dem Teststatus:** man lehnt ab, ohne zu testen, und man
  lehnt nach dem Test ab, und beides muss zusammen einstellbar bleiben. *Drei
  Zustände und kein einfacher Umschalter — gebraucht wird auch die
  Gegenrichtung, „zeig mir alles außer dem Verworfenen".* Er zählt in der
  Filterzahl eigens mit.
- **Ein ✎ und ein ✕ an der Begründung einer Ablehnung.** Das ✎ öffnet das Feld
  wieder — **nur für den, der die Begründung getroffen hat**; das ✕ entfernt sie
  nach Rückfrage. **Dieselbe Bauform, dieselben Zeichen wie am Kommentar.**
- **Eine fremde Begründung lässt sich entfernen** — von jedem, der den Eintrag
  ändern darf, also auch vom Admin (siehe *Security*).

### Changed

- **Die Begründung steht im Ruhezustand als Aussage da, nicht in einem dauernd
  offenen Feld.** Bis 0.14.0 stand beides nebeneinander und sagte dieselbe Sache
  zweimal. **Beim Einschalten des Merkmals öffnet sich das Feld weiterhin sofort
  und der Zeiger steht darin** — das war der Sinn der Zusage aus 0.14.0 —,
  danach schließt es sich. Enter und das Verlassen des Feldes speichern,
  **Escape verwirft**.
- **Der Grund ist hervorgehoben** und nicht mehr im selben Grau wie „Angelegt
  von … am …". *Datum und Name bleiben grau — sie sind eine Verfasserangabe und
  keine Aussage über die Sache.* **Keine neue Farbe:** das Rot des Schalters.
- **`GET /api/items/:id` liefert zwei neue Angaben** — `mine` am Eintrag und
  `rejectedMine` an der Begründung. *Die Oberfläche kennt ihren Namen und
  nirgends ihre Nummer; sie soll das nicht zurückrechnen müssen.* **Die nackten
  Nummern gehen weiterhin nicht hinaus.**

### Security

- **„Löschen ja, umschreiben nein" gilt an der Begründung jetzt GANZ.** In
  0.14.0 lief auch das **Leeren** über `nurSelbst` — damit konnte ein Admin eine
  fremde Begründung weder umschreiben noch entfernen, **strenger als überall
  sonst im Haus und ohne dass es je entschieden worden wäre.** Seither gilt:
  **umschreiben** darf nur, wer die Begründung getroffen hat; **entfernen** darf,
  wer den Eintrag ändern darf. *Beim Entfernen bleiben Datum und Verfasser
  stehen, und wer entfernt, wird nicht ihr Verfasser — er darf danach also auch
  keine neue hinschreiben.*

### Was du danach von Hand tun musst

**Nichts.** Keine Sicherungspflicht (dies ist keine Datenbankstufe), keine neue
Zeile in der `.env`, keine neue Abhängigkeit, niemand wird abgemeldet, kein
Blick ins Protokoll nötig.

*Wer von einer Fassung **vor 0.14.0** kommt, sichert vor dem Einspielen — dann
läuft der Migrationsblock von 0.14.0 mit:*

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)
```

### Was gleich bleibt

**Gespeicherte Ansichten** bleiben lesbar: eine Ansicht aus 0.14.0 kennt den
neuen Filterschlüssel nicht und fällt auf „Alle" zurück. **Das Austauschformat**
bleibt bei **11**, **die markierten Migrationsblöcke** bei **sechs**,
**`F_ROUTEN`** bei **69**, **`VORGAENGE`** bei **zwanzig** — das Entfernen einer
Begründung bekommt **keine** Zeile im Sicherheitsprotokoll —,
**`BESTAETIGUNG_ZWECKE`** bei **sieben**, **die Karten im Systembereich** bei
**neunzehn**, **das Vokabular** bei **elf**. **Die Kachelansicht** zeigt die
Marke „abgelehnt" wie bisher und keinen Grund. **„Getestet"** bekommt weiterhin
nichts davon: es ist ein Zustand und keine Entscheidung.

---

## [0.14.0] - 2026-08-29

**Das Häkchen „abgelehnt" ist zu einer Aussage geworden** — mit **Datum**,
**Grund** und **Verfasser**. Damit hält die Anlage auch ihr Ergebnis fest und
nicht bloß den Weg dorthin.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.14.0 ist **MINOR**, und die
> Frage dahinter ist die übliche: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Ja** — festhalten, wann, warum und von wem abgelehnt wurde.
> **Keine neue Zeile in der `.env`, keine neue Abhängigkeit.**

> **DIES IST EINE DATENBANKSTUFE.** Drei neue Spalten an `items`,
> **Migrationsblock `MIGRATION 0.14.0`** — der sechste, und der erste seit
> 0.8.50 —, **Austauschformat von 10 auf 11**. **DIE SICHERUNG DES
> DATENVERZEICHNISSES IST VOR DEM EINSPIELEN PFLICHT UND NICHT EMPFEHLUNG.**

### Added

- **`items` bekommt drei Spalten:** `rejected_at` (wann), `rejected_grund`
  (warum, eine Zeile Text) und `rejected_von` (wer). **`rejected` selbst bleibt,
  wie es ist** — das vorhandene Merkmal bekommt, was ihm fehlt, und kein
  zweites daneben.
- **Beim Einschalten von „abgelehnt" erscheint ein Feld für den Grund** — offen
  im Dialog, nicht hinter einem Aufklappen. **Freiwillig**, eine Zeile,
  höchstens 200 Zeichen; gespeichert wird beim Verlassen des Feldes oder mit
  Enter.
- **Die Marke liest sich als Satz:** *„Abgelehnt am 14.03.2026, 09:12 von Anna
  — Lieferzeit über 6 Monate."* **Jedes der drei darf fehlen**, und die Zeile
  setzt sich aus dem zusammen, was bekannt ist. Ein entfernter Zugang erscheint
  als „Gelöschter Benutzer 7". Ist gar nichts bekannt, bleibt die Zeile weg —
  sie sagte sonst dasselbe wie der Schalter darüber.
- **Der Migrationsblock rüstet die drei Spalten in einem bestehenden Bestand
  nach**, fragt jede **einzeln** ab und legt alle drei `ALTER TABLE` in **eine**
  Transaktion. **Er trägt in vorhandene Ablehnungen nichts ein**: diese Anlage
  weiß nicht, wann und von wem sie getroffen wurden.

### Changed

- **Die Begründung einer Ablehnung darf nur umschreiben, wer sie getroffen
  hat** — auch der Admin nicht, und auch nicht der Verfasser des Eintrags.
  **Zurücknehmen darf das Merkmal weiterhin, wer den Eintrag ändern darf.**
  *Das ist eine Verschärfung: bis 0.13.2 galt an diesen Feldern durchweg
  „Verfasser oder Admin".*
- **Beim Zurücknehmen wird nichts gelöscht.** Datum, Grund und Verfasser bleiben
  stehen; lehnt jemand denselben Eintrag später wieder ab, steht die alte
  Begründung als Vorschlag im Feld.
- **Das Austauschformat steht auf 11.** Die drei Felder gehen mit hinaus und
  wieder hinein; der Ablehnende wandert als **Name** hinaus, nie als
  Zugangsnummer.
- **Die Sternreihen der Kriterienliste beginnen an derselben Stelle** — auch in
  Zeilen ohne Bewertung und neben einer langen Stimmenzahl. Gemessen bei 80 /
  100 / 120 % Schrift: **11,6 / 27,5 / 43,3 px Versatz vorher, 0,0 px nachher.**

### Fixed

- **Ein fremder Cookie mit einem Prozentzeichen im Wert sperrte einen Browser
  aus.** `parseCookies()` rief `decodeURIComponent()` auf **jeden** Wert des
  `Cookie:`-Kopfes — und der Kopf trägt **alle** Cookies des Hosts, nicht nur
  die dieser Anlage. Der `URIError` wurde zu einer **500**, bei **jeder**
  geschützten Anfrage, bis jemand den Cookie von Hand löschte. *Der Fehler war
  älter als jede Runde dieses Jahres.* Jetzt fällt ein Wert, der sich nicht
  dekodieren lässt, **einzeln** heraus — der eigene, gültige Cookie daneben
  kommt an.

### Security

- **Die Begründung einer Ablehnung ist eine fremde Aussage und wird wie eine
  behandelt.** *„Löschen ja, umschreiben nein"* gilt jetzt auch hier: ein Admin
  kann eine fremde Ablehnung zurücknehmen, aber ihren Text nicht unter dem Namen
  eines anderen ändern.

### Was du danach von Hand tun musst

**EINE SICHERUNG DES DATENVERZEICHNISSES, VOR DEM EINSPIELEN — PFLICHT.** Diese
Version ist eine Datenbankstufe; ohne die Kopie gibt es keinen Rückweg.

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)
```

**Danach: nichts.** Keine neue Zeile in der `.env`, keine neue Abhängigkeit,
niemand wird abgemeldet. Der Migrationsblock läuft beim ersten Start von selbst.

**EIN BLICK INS PROTOKOLL GEHÖRT DAZU** (`docker compose logs kriterion`). Dort
steht **einmalig**:

```
[Kriterion] items um rejected_at, rejected_grund und rejected_von ergaenzt
(Migration auf 0.14.0); <n> bereits abgelehnte Eintraege stehen ohne Datum,
Grund und Verfasser da.
```

*Die Zahl sagt, wie viele Ablehnungen im Bestand von nun an sichtbar
unvollständig dastehen — das ist gewollt und keine Panne.* **Beim zweiten Start
steht die Zeile nicht mehr da.**

### Was gleich bleibt

**Der Import** liest weiterhin jede ältere Datei: **eine Datei der Formatnummer
10 und älter lässt sich unverändert einspielen**, die drei neuen Felder bleiben
dann leer. **`rejected` selbst** ist unverändert — jeder Filter, jede Kachel und
jede gespeicherte Ansicht arbeiten weiter wie bisher. **„Getestet" bekommt
nichts davon**: es ist ein Zustand und keine Entscheidung. **`F_ROUTEN`** bleibt
bei 69, **`VORGAENGE`** bei zwanzig — das Ablehnen bekommt **keine** Zeile im
Sicherheitsprotokoll —, **`BESTAETIGUNG_ZWECKE`** bei sieben, **die Karten im
Systembereich** bei neunzehn, **das Vokabular** bei elf. **Die Kachelansicht**
zeigt die Marke „abgelehnt" wie bisher und keinen Grund.

---

## [0.13.2] - 2026-08-29

**Der Rahmen eines angepinnten Kommentars schließt jetzt wirklich.** Eine
angepinnte **Notiz** stand in drei goldenen Kanten und einer grauen da — die
linke blieb auf dem Grundwert. *Das Stilblatt sagte seit 0.12.3 das Gegenteil;
der Code tat es nie.*

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.2 ist **PATCH**: eine Kante
> bekommt die Farbe, die sie laut geltender Entscheidung seit 0.12.3 haben
> sollte. **Keine neue Fähigkeit, keine geänderte Bedienung, kein anderes
> Ergebnis.** Kein Schema, kein Migrationsblock, keine neue Formatnummer, keine
> neue Zeile in der `.env`, keine neue Abhängigkeit.

### Fixed

- **Angepinnt heißt jetzt: alle vier Kanten in einer Farbe.** Bei einer
  angepinnten **Notiz** ist der ganze Rahmen golden; bei **Bericht**,
  **Aufgabe** und **Erledigt** nehmen alle vier Kanten die Farbe der Art an,
  und die linke bleibt die dicke Linie, an der man die Art erkennt.
- Nachgemessen im Browser an der angepinnten Notiz: oben
  `rgba(255,197,49,.52)`, links **`rgb(38,44,51)`** — der graue Grundwert.
  Jetzt tragen beide dieselbe Farbe.

### Changed

- `.cmt.pinned` färbt mit **`border-color`** alle vier Kanten statt drei
  einzelner. **Die drei Art-Regeln holen sich ihre linke Kante ausdrücklich
  zurück** — `.cmt.bericht` und `.cmt.pinned` tragen beide zwei Klassen, und
  bei gleicher Spezifität gewinnt die spätere Regel. *Ohne die Wiederholung
  bekäme ein angepinnter Bericht eine goldene linke Kante neben drei orangen —
  genau die zwei Farben an einem Kasten, die 0.12.3 abgeschafft hat.*

### Was du danach von Hand tun musst

**Nichts.** Kein Schema, keine Migration, keine neue Zeile in der `.env`, keine
neue Abhängigkeit. **Niemand wird abgemeldet**, kein Kommentar ändert sich.

### Was gleich bleibt

**Alles außer der einen Kante.** Breiten, Abstände und Textanfänge sind
unverändert: die linke Kante einer Art bleibt **3 px**, die einer Notiz **1 px**,
und der Innenabstand gleicht den Unterschied weiterhin aus (10 + 3 = 12 + 1), so
dass die Zeilenanfänge in einer gemischten Liste auf einer Linie stehen.
**`F_ROUTEN`** bleibt bei 69, **das Austauschformat** bei **10**.

---

## [0.13.1] - 2026-08-29

**Die Beschriftungen der Filterleiste stehen wieder neben dem, was sie
beschriften.** Bei aufgeklappter Tagwolke sanken „TAGS", der Und/Oder-Umschalter
und „weniger" in die **Mitte** des Blocks und standen dort neben nichts.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.1 ist **PATCH**, und die
> Frage dahinter ist die übliche: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Nein.** Eine Zeile im Stilblatt richtet aus, was falsch
> ausgerichtet war — keine neue Fähigkeit, keine geänderte Bedienung, kein
> anderes Ergebnis. **Kein Schema, kein Migrationsblock, keine neue
> Formatnummer, keine neue Zeile in der `.env`, keine neue Abhängigkeit.**

### Fixed

- **Beschriftung, Und/Oder-Umschalter und die Verweise „mehr" / „weniger" /
  „zurücksetzen" stehen auf Höhe der ersten Zeile** ihres Inhalts statt in der
  Mitte des ganzen Blocks. Sichtbar wurde es an der **aufgeklappten Tagwolke**;
  dieselbe Ursache traf die **Kategoriezeile**, sobald sie bei großer Schrift
  umbricht.
- Gemessen in Chromium bei 1359 px: die Beschriftung stand **32 px** zu tief bei
  80 Prozent Schrift, **36 px** bei 100, **59 px** bei 120. Danach bleibt der
  Rest **unter einem Pixel** (0,4 / −0,8 / 0,0 px).

### Changed

- `.frow` richtet sich an der **Grundlinie** aus statt an der Mitte
  (`align-items: baseline`). **Ausgerechnet wird dabei nichts** — kein
  Innenabstand, keine Pixelzahl: die Schriftlinie der Beschriftung liegt auf der
  Schriftlinie der ersten Pillenzeile, und das gilt bei jeder der fünf
  Schriftgrößen von 80 bis 120 Prozent.

### Was du danach von Hand tun musst

**Nichts.** Kein Schema, keine Migration, keine neue Zeile in der `.env`, keine
neue Abhängigkeit. **Niemand wird abgemeldet**, und keine gespeicherte Ansicht
ändert sich.

### Was gleich bleibt

**Alles außer der Ausrichtung.** Die Filterleiste ist **genauso hoch wie
vorher** — nachgemessen: 154 px, 178 px bis zum ersten Eintrag, die Tagwolke
1023 px breit mit 14 von 22 sichtbaren Tags, dieselben Zahlen wie in 0.13.0.
**Auf dem schmalen Schirm ändert sich gar nichts**: dort ordnet die Zeile ohnehin
in einer Spalte an. **`F_ROUTEN`** bleibt bei 69, **`BESTAETIGUNG_ZWECKE`** bei
sieben, **das Austauschformat** bei **10**.

> **NICHT GEBAUT, UND ZWAR ABSICHTLICH:** die Tagwolke füllt ab der zweiten
> Zeile **weiterhin nicht** den Platz unter „mehr" / „weniger". Das wäre nur
> über Fließsatz zu haben — die Wolke müsste ihre Bauform wechseln, und
> `begrenzeWolke()` müsste mit. **Im Regelzustand brächte es nichts**, denn
> eingeklappt ist die Wolke eine Zeile hoch, und das ist genau die Zeile, neben
> der der Verweis ohnehin steht. Steht in `Doku/Fehler_und_Ideen.md`.

---

## [0.13.0] - 2026-08-28

**Die Anlage ist über zwei Netze zugleich erreichbar** — über HTTPS hinter dem
Proxy **und** über `http://<server-ip>:3100` im Heimnetz, mit derselben
Einstellung und ohne Handgriff dazwischen.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.0 ist **MINOR**, und die
> Frage dahinter ist die übliche: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Ja** — über zwei Netze zugleich erreichbar sein. Das ist
> keine Fehlerbereinigung, sondern eine Fähigkeit, die es vorher nicht gab.
> **Kein Schema, kein Migrationsblock, keine neue Formatnummer, keine neue
> Zeile in der `.env`, keine neue Abhängigkeit.**

### Added

- **Zwei Cookienamen statt einem, entschieden je Anfrage.** Über den Proxy
  gilt weiterhin `__Host-kriterion_session` samt `Secure` und HSTS, über das
  Heimnetz `kriterion_session` ohne beides. **Gelesen wird je Anfrage genau
  ein Name** — ein Klartextcookie gilt auf der HTTPS-Seite nicht, sonst wäre
  das Präfix `__Host-` wertlos.
- **Ein Filter am Sicherheitsprotokoll**, sechs Ansichten mit je ihrer Zahl:
  Alle, **Gescheitert**, Anmeldungen, Zugänge, Zweiter Faktor, Bestand. Die
  Auswahl geht an den Server — mit ihr sind es die hundert jüngsten **dieser
  Art** statt der hundert jüngsten aller Arten.
- **Die Namen im Protokoll sind anklickbar** und springen zur Zeile in der
  Karte „Zugänge". „unbekannter Name" bleibt Text — es gäbe nichts, wohin er
  springen könnte.
- **Gelöschte Zugänge stehen in einem eigenen Fenster**, hinter einem Knopf,
  der ihre Zahl nennt. Die Liste der Zugänge zeigt nur noch die lebenden.
- **Die Kategoriezeile trägt mehrere Kategorien zugleich**, und „Ohne
  Kategorie" ist eine Pille mit eigener Zahl. Es ist ein ODER — ein Eintrag
  trägt genau eine Kategorie, ein UND wäre garantiert leer.

### Changed

- **Der Löschdialog nennt den umkehrbaren Weg:** *„Nur vorübergehend
  aussperren? Dann sperren statt entfernen — das ist umkehrbar, und der Name
  bleibt."* Der Satz steht in der letzten Rückfrage und im Passwortfenster
  dahinter.
- **`HINTER_PROXY` bündelt nur noch zwei Wirkungen statt fünf:** ob die Köpfe
  des Proxys überhaupt angesehen werden, und die Startwarnung bei `http://` in
  `OEFFENTLICHE_ADRESSE`. Cookiename, `Secure` und HSTS entscheidet die
  einzelne Anfrage.
- **Die Filterleiste ist 75 px flacher** — bei 1359 px Fenster **229 px
  vorher, 154 px nachher**, gemessen und nicht geschätzt. Die Tagzeile braucht
  eine Zeile statt zwei, Sortieren und Ansichten teilen sich eine.
- **Der Knopf am Teilexport sagt, was er tut:** „Einmal bestätigen, dann alle
  n Teile laden" statt „Alle n Teile freigeben".
- **„Neu seit …" mit null Treffern wird gedämpft**, wie ein Tag in derselben
  Lage.
- **Abmelden räumt beide Cookienamen weg** und beendet beide Sitzungen dieses
  Browsers.

### Removed

- **Der Handgriff „Wenn der Proxy ausfällt" ist aus der README entfernt.** Er
  ist gegenstandslos geworden: fällt der Proxy aus, geht
  `http://<server-ip>:3100` von selbst — ohne `.env`, ohne Neustart, ohne
  Mensch am Wirt.

### Fixed

- **Der Export in Teilen ging mit eingeschaltetem zweitem Faktor seit 0.12.4
  überhaupt nicht.** Der Knopf schickte denselben Code einmal je Teil an den
  Server; ein Code des zweiten Faktors gilt **genau einmal**, also ging Teil 1
  durch und alle weiteren bekamen „Der Code stimmt nicht". **Die Meldung war
  wahr und trotzdem irreführend** — der Code war richtig, er war verbraucht.
  *Wer 0.12.4 im Einsatz hat und den Weg nie gebraucht hat, war trotzdem
  betroffen: der Fehler trat bei jedem Versuch auf.* Jetzt trägt eine Anfrage
  alle Teilnummern, und der Code wird einmal verbraucht. **Nebenher fallen die
  Fehlalarme im eigenen Sicherheitsprotokoll weg, die Treffer in der
  Anmeldebremse (bei elf Teilen griff die harte Sperre) und der verbrannte
  Wiederherstellungscode.**
- **Ein Teilexport stand seit 0.12.4 in keiner einzigen Protokollzeile.** Er
  schrieb `teil 1/5` in eine Spalte, die nur Werte aus einer geschlossenen
  Liste annimmt — und die ganze Zeile fiel weg, nicht bloß das Merkmal.
- **Fünf Vorgänge standen als roher Schlüssel am Bildschirm** —
  `anfrage.frei`, `anfrage.ab` und die drei zum zweiten Faktor hatten kein
  deutsches Wort. Dazu fehlte „Adresse" unter den Merkmalen, und „beides" hieß
  fälschlich „Name und Passwort".

### Security

- **Der Heimnetzweg bekommt einen eigenen Cookienamen und nicht denselben mit
  bedingtem `Secure`.** Ein Name ohne `Secure`, der auch auf der HTTPS-Seite
  gälte, ließe sich aus dem eigenen Netz über eine verbogene
  Klartextverbindung setzen — genau dagegen gibt es das Präfix `__Host-`.
- **HSTS gilt nur auf dem HTTPS-Weg.** Ginge der Kopf auf dem Heimnetzweg mit,
  bestünde der Browser danach auf HTTPS und fände an Port 3100 keines.

### Was du danach von Hand tun musst

**Nichts.** Kein Schema, keine Migration, keine neue Zeile in der `.env`, keine
neue Abhängigkeit.

**ZWEI DINGE ZUM WISSEN:**

1. **Das Umlegen von `HINTER_PROXY` meldet weiterhin alle einmalig ab, die
   über HTTPS kommen** — ihr Cookiename wird dann nicht mehr gelesen. Kein
   Datenverlust, nur eine neue Anmeldung. *Für den Heimnetzweg gilt das nicht
   mehr; er war vorher ohnehin nicht erreichbar.*
2. **Das Einspielen dieser Version meldet niemanden ab.** Wer über HTTPS
   angemeldet ist, bleibt es.

**Und so geht der Teilexport mit eingeschaltetem zweitem Faktor:**

1. Systembereich → **Export** → *In Teilen exportieren*, Teilgröße wählen.
2. **Einmal bestätigen** — Passwort und **ein** Code.
3. Jeden Teil einzeln laden.

### Was gleich bleibt

**Das Austauschformat** bleibt bei **10**, ältere Dateien lassen sich
weiterhin einspielen. **Der Import** ist Zeile für Zeile derselbe. **Die
gespeicherten Ansichten** gelten weiter: eine Ansicht mit einer einzelnen
Kategorie wird beim Einlesen übersetzt, der gespeicherte Wert bleibt
unangetastet. **`F_ROUTEN`** bleibt bei 69, **`BESTAETIGUNG_ZWECKE`** bei
sieben, **die Karten im Systembereich** bei neunzehn. **Das
Sicherheitsprotokoll** trägt weiterhin weder Name noch Adresse — die Anlage
speichert beides nicht.

---

## [0.12.4] - 2026-08-28

**Der Export geht in Teilen** — die Antwort auf das, was 0.12.3 gemessen hat:
**760 MB gegen Nodes Grenze von 512 MB.** Der Knopf sagte seither sauber ab und
lieferte nichts mehr; jetzt liefert er wieder.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.4 ist **PATCH**, und die
> Frage dahinter ist eine echte: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Streng genommen ja** — einen Bestand über 512 MB ausführen.
> **Gezählt wird sie trotzdem als Fehlerbereinigung**, weil die Fähigkeit nicht
> neu ist, sondern zurückkommt: der Export war der Austauschweg, seit es ihn
> gibt, und er ist an einer Grenze ausgefallen, die niemand gezogen hat.
> *Der Fahrplan sieht für genau diesen Fall die Zeile „0.12.x —
> Fehlerbereinigung und Verbesserungen, die nächste freie PATCH-Zahl" vor.*
> **Kein Schema, kein neues Austauschformat, keine neue `.env`-Zeile, keine
> neue Abhängigkeit.**

> **WARUM TEILE UND NICHT EIN STROM.** Ein gestreamter Export hätte nur den Weg
> **hinaus** gelöst. Der Import liest die Datei über `readAsText()` im Browser
> und `buffer.toString('utf8')` am Server — **beides ein einziger String, und
> damit dieselbe Grenze in der Gegenrichtung.** Eine gestreamte Datei könnte
> diese Anlage nicht wieder einspielen. **Teile lösen beide Richtungen**, und
> zwar ohne ein neues Format und ohne einen zweiten Leser.

### Added

- **„In Teilen exportieren" an der Exportkarte.** Die Anlage rechnet aus, wie
  viele Teile es braucht, und zeigt jeden mit Nummer, Anzahl und Größe.
  **Jeder Teil ist eine vollständige Exportdatei** — derselbe Umschlag,
  dieselbe Formatnummer **10**, nur weniger Einträge darin. **Geschnitten wird
  zwischen Einträgen, nie mitten hinein.**
- **Die Teilgröße ist wählbar**, 50 bis 300 MB. Nach oben gedeckelt: darüber
  baute die Anlage Teile, vor denen sie im selben Atemzug warnt.
- **Ein Eintrag, der schon für sich allein über der Grenze liegt, wird
  namentlich genannt** statt still übergangen — *ein stiller Verlust wäre der
  schlimmere Ausgang.* Ohne das Häkchen an den Videos wird er meist klein genug.

### Changed

- **Das Passwort wird einmal gefragt und je Teil geprüft.** Zusammengefasst
  wird die Eingabe und nicht die Prüfung: jede Freigabe geht einzeln an den
  Server, und **eine Freigabe für Teil 1 lässt Teil 2 nicht durch.**
- **Der Hinweis ab 300 MB nennt jetzt den Weg, der hilft**, statt nur zu sagen,
  was nicht geht.

### Was du danach von Hand tun musst

**Nichts.** Kein Schema, keine Migration, keine neue Zeile in der `.env`, keine
neue Abhängigkeit.

**Und so geht ein Bestand hinaus, der zu groß für eine Datei ist:**

1. Systembereich → **Export** → *In Teilen exportieren*, Teilgröße wählen.
2. **Alle Teile freigeben** — einmal das Passwort (und den zweiten Faktor).
3. Jeden Teil einzeln laden. Der Dateiname trägt seine Nummer.
4. Zum Einspielen: **Teil 1 mit „Ersetzen", alle übrigen der Reihe nach mit
   „Zusammenführen".**

### Was gleich bleibt

**Der Import** — Zeile für Zeile derselbe. Er weiß von Teilen nichts und muss
es auch nicht: er sieht n gewöhnliche Exportdateien. **Das Austauschformat**
bleibt bei **10**, ältere Dateien lassen sich weiterhin einspielen. **Der volle
Export ohne Teilangabe** läuft unverändert wie in 0.12.3. **Die Sicherung über
`VACUUM INTO`** ist unangetastet und bleibt für eine Kopie zum Zurückspielen
der kürzere Weg — ein Griff statt n.

---

## [0.12.3] - 2026-08-28

**Der Export sagt, wie groß er wird, bevor er versucht wird** — und neun
Kleinigkeiten an der Oberfläche, die bei der Durchsicht vom 28. August
aufgefallen sind, sind richtiggestellt.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.3 ist **PATCH**: die Anlage
> kann danach nichts, was sie vorher nicht konnte. Der Export exportiert
> weiterhin; er bricht nur nicht mehr wortlos ab. Die neun Anzeigepunkte nehmen
> nichts weg und legen nichts an. **Keine neue Route, keine Datenbankstufe,
> keine neue Abhängigkeit, keine neue Zeile in der `.env`.**
> *Die Kennzahlen bekommen eine Zahl, die es vorher nicht gab — das ist eine
> Anzeige über vorhandene Daten und keine neue Fähigkeit.*

> **GEMESSEN AM 28. AUGUST 2026, AN DER LAUFENDEN ANLAGE: 760 MB.** Damit ist
> die Frage beantwortet, die dieser Punkt seit 0.8.6 offenließ — **der Export
> war kaputt, und niemand hat es bemerkt, weil ihn niemand gebraucht hat.**
> Nicht „hätte irgendwann"; er brach ab, sobald jemand den Knopf drückte.
> *Die Schätzung aus der Dateigröße lag mit rund 880 MB zu hoch, wie erwartet:
> die Datei trägt Indizes, das Sicherheitsprotokoll und freie Seiten aus
> Gelöschtem, und die Vorschaubilder gehen gar nicht mit in den Export.*
> **Was diese Version daran ändert, ist die Ansage und nicht die Grenze.** Der
> Export bleibt bei diesem Bestand unbenutzbar — er sagt es jetzt in einem Satz,
> statt nach zwei Minuten mit einem Speicherfehler abzubrechen. **Für eine
> vollständige Kopie ist die Karte „Sicherung" der Weg.** *Dass der
> Austauschweg damit für diesen Bestand ausfällt, ist ein offener Punkt und
> keine Lösung — siehe Änderungsprotokoll 0.12.3, „Offen geblieben".*

### Added

- **Die Kennzahlen nennen die erwartete Exportgröße** neben der Größe der
  Datenbank. Zwei Fragen, zwei Zahlen: die eine sagt, wie viel Platz die Anlage
  auf der Platte braucht, die andere, wie groß die Datei wird, die das Haus
  verlässt. Dass die erste die zweite überschreiten kann, ist kein Fehler.
- **Kommentarbilder haben eine eigene Zeile in den Kennzahlen.** Sie liegen als
  Blob in derselben Datei wie Fotos und Anhänge und fehlten ausgerechnet in der
  Aufstellung, die erklären soll, wovon die Datenbank so groß ist.
- **Ein Hinweis an der Exportkarte ab 300 MB**, mit Verweis auf die Sicherung
  als den anderen Weg. **Gewarnt wird, verweigert nicht** — die Zahl ist eine
  Schätzung, und wer weiß, was er tut, soll es versuchen dürfen. *Genannt wird
  im Hinweis die Zahl, bei der es wirklich kippt: 512 MB, Nodes Grenze für einen
  einzelnen Text.*
- **Der Import fragt vor dem Einlesen nach**, wenn die Datei sehr groß ist.
  Dort steht die Größe ja vorher fest.
- **Ein Sprungknopf `+ Kommentar`** im Kopf des Kommentarblocks. Bei vierzig
  Kommentaren ist der Weg ans Formular unter der Liste weit.

### Changed

- **Ein angepinnter Kommentar trägt nur noch eine Farbe.** Bisher galt: linke
  Kante in der Farbe der Art, die drei übrigen in Gold — ein angepinnter
  Bericht war damit orange **und** gold. Künftig nehmen die drei übrigen Kanten
  dieselbe Farbe an wie die linke; Gold bleibt der angepinnten Notiz, die keine
  eigene Farbe hat. **Erkennbar bleibt die Anpinnung am 📌 und daran, dass
  Angepinntes oben steht.** *Keine Breite und kein Innenabstand ändern sich.*
- **Am Kriterium steht `⌀ 4,2 (3)` statt `4,2 · 3`** — dieselbe Form, die die
  Kopfzahl darüber schon spricht, dazu der Klartext für Vorleseprogramme.
- **Die Kopfzeile der Kommentare nennt die offenen Aufgaben:**
  `5 Aufgaben (3 offen, 2 erledigt)`. Die Klammer erscheint nur, wenn überhaupt
  etwas erledigt ist.
- **„mehr" und „zurücksetzen" stehen am rechten Ende der Tags-Zeile** statt
  darunter. Sie kosteten dort so viel Platz wie eine ganze Reihe Tags — auf der
  Eintragsseite war dieselbe Sache längst so gebaut.
- **Das Zeichen der Anlage steht vor der Versionszeile**, und der Abstand
  darunter fällt auf der Anmeldeseite kleiner aus. *Ein Telefonbefund; am
  Desktop bleibt es, wie es war.*
- **Die Frage nach dem zweiten Faktor nennt das Verfahren und nicht das Gerät.**
  Aus „Code aus deiner App" wird „Code des zweiten Faktors". **Dasselbe Feld
  nimmt auch einen Wiederherstellungscode entgegen**, und der kommt von einem
  Zettel — die alte Beschriftung war für die Hälfte der Fälle falsch. Im
  Bestätigungsfenster steht der zweite Weg jetzt auch daneben; bisher stand er
  dort nirgends.
- **Die Kachelliste zeichnet nur noch, was zu sehen ist** (`content-visibility`).
  Gemessen an 1000 Kacheln in Chromium: **auf dem Telefon fällt die Aufbauzeit
  von 397 auf 168 ms**, am Desktop ändert sich im Rauschen nichts. *Kein
  Nachladen beim Rollen und kein Blättern — beides zerschnitte die Suche oder
  führte einen Zustand ein, den jeder Filter zurücksetzen müsste.*

### Fixed

- **Ein zu großer Export bricht nicht mehr wortlos ab.** Die Route rechnet ihre
  Größe aus, **bevor** sie zu bauen anfängt, und sagt mit einer lesbaren Meldung
  ab, statt nach zwei Minuten mit `RangeError: Invalid string length` in einen
  Serverfehler zu laufen. *Ein Knopf, der so abbricht, sieht aus wie ein
  kaputtes Programm; er ist aber eine erreichte Grenze — der Unterschied liegt
  allein darin, ob die Anlage es vorher sagt.*
- **Die Zahlen an den Exportknöpfen folgen den Häkchen.** Bisher standen dort
  feste Werte aus dem Aufbau: wer Dateien und Videos ankreuzte, fand nirgends,
  was dabei herauskommt.
- **Die Schätzung zählt, was der Export wirklich schreibt.** Die Vorschaubilder
  (`photos.thumb`, `comment_images.thumb`) gehen nie mit in die Datei; eine
  Summe über alle Blob-Spalten fiele zu hoch aus, und eine Warnung, die zu früh
  kommt, wird weggeklickt.

### Was du danach von Hand tun musst

**Nichts.** Kein Schema, keine Migration, keine neue Zeile in der `.env`, keine
neue Abhängigkeit. Einspielen wie in der README beschrieben, danach den
Fingerprint in den Kennzahlen gegen die Zeile im Änderungsprotokoll halten.

*Wer die CrowdSec-Zeile oder die Protokollrotation aus der README übernehmen
will, tut das von Hand in seiner eigenen `docker-compose.yml` — die Anlage
ändert dafür nichts.*

### Was gleich bleibt

**Das Austauschformat** — Formatnummer **10**, unverändert; ältere Exportdateien
lassen sich weiterhin einspielen und diese Version schreibt weiterhin dasselbe.
**Das Schema**, Zeile für Zeile. **Die Rechtezeile**: Export und Import gehören
weiterhin allein dem Eigentümer. **Der Sicherungsweg** über `VACUUM INTO` ist
unangetastet — und er ist für große Bestände der richtige. **Der Export als
Strom wurde ausdrücklich nicht gebaut**: er ist ein Umbau an einer Stelle, die
nachweislich funktioniert, und die Sicherung ist seit 0.8.70 ohnehin der
Hauptweg.

---

## [0.12.2] - 2026-08-28

**Die Vorschaureihe unter dem Bild füllt auf dem Telefon die Breite** — sie hörte
rechts früher auf als der Bildbereich darüber. *Zweiter Befund aus dem Betrieb,
am selben Tag und am selben Gerät wie der erste.*

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.2 ist **PATCH**: eine
> Kachelreihe, die die Breite nicht ausnutzt, ist ein Fehler und kein fehlendes
> Bedienelement. **Es kommt nichts hinzu, was vorher nicht ging**, es
> verschwindet nichts, und keine Bedienung ändert ihre Bedeutung.
> *0.12.1 war schon vergeben — die Zahl wird nicht zweimal benutzt.*

> **AM SCHREIBTISCH ÄNDERT SICH NICHTS, UND DAS IST NACHGEMESSEN.** Die
> Eintragsseite ist bei 1100, 1280 und 1440 Pixeln **Pixel für Pixel dieselbe**
> wie unter 0.12.1. Was der Vergleich sonst fand, waren zwei Zeitstempel und ein
> Zähler zwischen zwei Läufen.

### Fixed

- **Die Vorschaureihe ließ auf dem Telefon einen Streifen rechts leer.** Die
  Kachel misst 62 Pixel fest, und in einem umbrechenden Kasten ist die
  Spaltenzahl damit eine Treppe über der Fensterbreite: was nicht mehr
  hineinpasst, bleibt als Rest liegen. **Auf einem 360 Pixel breiten Telefon
  scheiterte die fünfte Kachel an ZWEI Pixeln** — fünf brauchen 338, der Kasten
  misst 336 —, und übrig blieben **67 leere Pixel, ein Fünftel der Breite.**
  Der Bildbereich darüber reicht bis an beide Kanten; die Reihe darunter hörte
  vorher auf, und genau das sah man.
  **Jetzt zählt ein Raster die Spalten selbst aus und verteilt den Rest in die
  Spalten.** Links und rechts steht danach derselbe Rand — der Seitenrand der
  Seite und sonst nichts. Gemessen mit zwölf Fotos:

  | Kasten | vorher | nachher | Rest rechts |
  |---|---|---|---|
  | 336 px *(Fenster 360)* | 4+4+4 zu 62 | **5+5+2 zu 61,6** | 67 → **0** |
  | 366 px *(Fenster 390)* | 5+5+2 zu 62 | **5+5+2 zu 67,6** | 28 → **0** |
  | 388 px *(Fenster 412)* | 5+5+2 zu 62 | **5+5+2 zu 72,0** | 50 → **0** |
  | 404 px *(Fenster 428)* | 5+5+2 zu 62 | **6+6 zu 61,5** | 66 → **0** |

  *Bei 428 Pixeln fällt dadurch eine ganze Zeile weg.* Die Kachel wächst also
  mit dem Schirm, statt fest zu stehen — **beides zusammen ist der Punkt: mehr
  Kacheln, wo sie hineinpassen, und größere, wo nicht.**

### Changed

- **Die Kachel gibt auf dem Telefon ihre festen Maße ab und hält das Quadrat
  über das Seitenverhältnis.** Sobald die Breite gerechnet wird, muss die Höhe
  ihr folgen; eine feste Höhe von 62 neben einer Breite von 72 wäre ein
  liegendes Rechteck.

### Was gleich bleibt

**Alles am Schreibtisch** — dort behält die Kachel ihre festen 62 Pixel und die
Reihe ihren bisherigen Umbruch. **Das Umsortieren per Ziehen bleibt, wie es
war**, mit dem langen Druck auf dem Finger; von Hand im echten Browser geprüft,
bei 360, 390 und 1440 Pixeln, mit Finger und mit Maus, und die neue Reihenfolge
übersteht das Neuladen. **Das Löschkreuz steht unverändert am Zeigegerät auf der
Kachel und auf dem Berührungsbildschirm nirgends** — dort wird am großen Bild
gelöscht, seit 0.12.1.

---

## [0.12.1] - 2026-08-28

**Gelöscht wird am großen Bild und nicht mehr an der Vorschaukachel** — ein
Befund aus dem Betrieb, am Tag nach 0.12.0 auf einem echten Telefon gefunden.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.1 ist **PATCH**, weil
> **nichts hinzukommt, was vorher nicht ging**. Löschen konnte man ein Foto
> schon vorher; es steht jetzt an einer Stelle, an der man es nicht aus
> Versehen trifft. **Keine neue Fähigkeit, keine neue Route, keine
> Datenbankstufe, keine neue Abhängigkeit.** *Der Server ist unberührt.*

> **DAS KREUZ AN DER KACHEL VERSCHWINDET NUR AUF DEM BERÜHRUNGSBILDSCHIRM.**
> Am Zeigegerät bleibt es, wo es war — dort gibt es kein Danebentippen, und ein
> Klick aus der Reihe heraus ist der kürzere Weg. *Das ist der eine Punkt, an
> dem sich die beiden Geräte in der Bedienung wirklich unterscheiden.*

### Changed

- **Die Knöpfe am Bildbereich stehen in einer Reihe oben rechts und tragen
  Zeichen statt Wörter:** Ausschnitt (die zwei ineinandergeschobenen Winkel, wie
  in jedem Fotoprogramm), beim Video Vollbild — und **abgesetzt davon der
  Papierkorb**. Der Abstand ist nicht Zierde: die beiden davor stellen etwas
  ein, der dritte nimmt etwas weg. *Dieselben 14 Pixel wie beim Favoritenfilter
  in der Filterzeile.* **Auf beiden Geräten dieselbe Reihe an derselben Stelle;
  verschieden sind nur Größe und Sichtbarkeit** — am Schreibtisch klein und beim
  Überfahren, auf dem Finger dauerhaft und 44 Pixel je Knopf.
- **Auf dem Berührungsbildschirm trägt die Vorschaukachel kein Löschkreuz
  mehr.** Sie kann dort noch antippen und, nach kurzem Halten, verschieben —
  **der lange Druck bleibt unverändert das Umsortieren.**

### Fixed

- **Das Löschkreuz auf der Vorschaukachel lag auf dem Weg des Daumens.** Mit
  Fingermaßen maß es 27 Pixel auf einer Kachel von 62 — ein Fünftel der Fläche,
  und zwar in der Ecke, auf der der Daumen aufsetzt, wenn er über die Reihe
  wischt. Wer ein Bild auswählen wollte, bekam die Rückfrage zum Löschen.
  **Im Feld gefunden, nicht am Schreibtisch.**
- **Der Knopf „Vollbild" am Video saß auf einer ausgerechneten Textbreite**
  (`right: 92px` — die Breite des Wortes „Ausschnitt" bei 100 Prozent Schrift).
  Die Anlage stellt die Schrift von 80 bis 120 Prozent, und bei 120 schoben sich
  die beiden Knöpfe übereinander. Eine Reihe braucht die Zahl nicht.
- **Das Feld zum Hochladen stand auf dem Telefon dauerhaft so da, als zöge
  gerade jemand eine Datei darüber.** Sein Überfahrzustand ist buchstäblich
  derselbe wie sein Arbeitszustand — beide in einer Regel —, und auf dem Finger
  bleibt ein Überfahren hängen. Die eine Rückmeldung, die es zu geben hat, sagte
  damit nichts mehr.

### Was du danach von Hand tun musst

Nichts. Es ändert sich nur die Oberfläche; Datenbank, Austauschformat, die
Schlüssel in der `.env` und die Werkzeuge auf dem Wirt sind unberührt.

### Was gleich bleibt

**Der lange Druck auf einer Vorschaukachel greift und verschiebt**, wie seit
0.12.0. **Am Schreibtisch bleibt jeder Weg, den es gab** — das Kreuz an der
Kachel eingeschlossen; der Papierkorb am großen Bild kommt daneben. Was die
beiden Knöpfe des Bildbereichs tun, ist unverändert; sie heißen nur nicht mehr
in Wörtern, sondern zeigen es. *Ihre Beschriftung steht weiterhin da — im
`title` und als `aria-label`.*

---

## [0.12.0] - 2026-08-28

**Die Oberfläche auf Telefon und Tablett — sie fühlt sich jetzt wie eine
Anwendung an und nicht wie eine breite Seite, die man schmal gemacht hat.**

> **AM SCHREIBTISCH ÄNDERT SICH NICHTS.** Nachgemessen und nicht behauptet: die
> Übersicht ist bei 1100, 1280 und 1440 Pixeln **Pixel für Pixel dieselbe** wie
> vorher. Auf der Detailseite gibt es genau **eine** gewollte Abweichung — die
> zwei Pixel unter *Fixed*, erste Zeile. Es gibt keine zweite Oberfläche, keinen
> zweiten Aufbau und keine Weiche nach der Kennung des Browsers.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.0 ist **MINOR**, weil
> Funktionen dazukommen — ein Menü, ein Schalter über den Filtern, das Wischen
> am Bildbereich. **Weggenommen wird nichts:** kein Bedienelement verschwindet,
> keines bekommt eine neue Bedeutung, und was auf dem Telefon hinter das
> Menüzeichen wandert, steht am Schreibtisch weiter da, wo es stand.
> *Das Datenverzeichnis, das Austauschformat (Nummer 10), die Schlüssel in der
> `.env` und die Werkzeuge auf dem Wirt sind alle vier unberührt.* **Keine
> Datenbankstufe, keine neue Abhängigkeit, keine neue `.env`-Zeile, keine neue
> Route.**

### Added

- **Ein Menü hinter drei Strichen** in der Kopfzeile. Dahinter liegen offene
  Aufgaben, Systembereich, wer angemeldet ist und das Abmelden. Draußen bleiben
  die Suche (auf einem kleinen Bildschirm das wichtigste Bedienelement) und
  „+ Eintrag" (der eine Weg, auf dem etwas Neues hereinkommt). Es schließt sich
  beim Klick daneben und mit Escape. **Es gibt dasselbe Markup für beide
  Gestalten:** auf dem breiten Schirm ist der Behälter für das Layout gar nicht
  da, seine vier Kinder stehen unmittelbar in der Kopfzeile wie bisher.
  *Das Menü bekommt auch ein Tablett, das mit dem Finger bedient wird — dort
  passt die Kopfzeile mit Fingermaßen sonst nicht in eine Zeile.*
- **Ein Schalter über den Filtern**, der die vier Filterreihen wegklappt und
  **die Zahl der greifenden Filter nennt**. Auf dem Telefon fangen sie
  eingeklappt an, auf dem Tablett offen. Die Sortierung zählt nicht mit: sie
  nimmt nichts weg.
- **Wischen blättert am Bildbereich** eines Eintrags, wie im Vollbild und mit
  denselben Maßen. Die Pfeile bleiben trotzdem stehen.
- **Die Aussparung des Geräts wird mitgerechnet** — Kopfzeile, Vollbild,
  Meldungen, Vergleichsleiste und der Seitenrand. Dazu `viewport-fit=cover`
  in der `index.html`.
- **Die Leiste des Browsers nimmt die Farbe der Anlage** (`theme-color`).

### Changed

- **Auf dem Telefon ist ein Block kein Kasten mehr, sondern ein Abschnitt** —
  ein Trennstrich darüber, ein Titel, der Inhalt. Damit bleibt genau **eine**
  Kastenebene übrig, und die steht bündig unter dem Bild darüber. Vorher lagen
  zwischen Bildschirmrand und erstem Buchstaben fünf Kanten und drei
  Eckenradien; die Kommentarkarte saß 36 Pixel weiter innen als der Bildbereich.
  *Dasselbe gilt für die Karten des Systembereichs.* Alles, was danach in
  derselben Flucht steht, rundet mit **einem** Radius.
- **Der Titel des Eintrags steht auf dem Telefon vor dem Bild.** Einspaltig kam
  sonst zuerst das Foto, dann die Vorschaubilder, dann das Feld zum Hochladen
  und sechs Zeilen Erklärung — und erst danach erfuhr man, welche Sache man
  ansieht.
- **Zwei Karten nebeneinander** in der Übersicht statt einer über die volle
  Breite. Unter 334 Pixeln Fensterbreite fällt es von selbst auf eine zurück.
  Auf dem Tablett sind es drei bis vier statt zwei.
- **Dialoge steigen von unten auf** und liegen am unteren Rand an; die Knöpfe
  stehen untereinander über die volle Breite, der eigentliche Vorgang oben.
  Sie messen an der wirklich sichtbaren Fensterhöhe (`dvh`) und nicht an der
  mitsamt Adressleiste.
- **Der Kommentarkopf steht auf dem Telefon in zwei Zeilen**: oben Verfasser,
  Zeitpunkt und die beiden Zeichen für Bearbeiten und Löschen, darunter die drei
  Umschalter. In einer Zeile brach der Zeitpunkt mitten im Datum um.
- **Berührungsziele richten sich nach dem Zeiger und nicht nach der Breite.**
  Ein Tablett im Querformat ist breit *und* wird mit dem Finger bedient. Knöpfe,
  Pillen, Sterne, Kreuze und die Punkte der Zeitleiste fallen unter
  `pointer: coarse` größer aus; ein Zeigegerät sieht davon nichts.
- **Eingabefelder fallen unter dem Finger nicht unter 16 Pixel.** Darunter zoomt
  Safari auf dem iPhone beim Antippen die ganze Seite heran und wieder heraus
  tut sie es nicht von selbst. *Wer die Schrift auf 80 Prozent stellt, bekommt
  hier deshalb nicht ganz, was er wollte.*
- **Die Jahreszahlen der Zeitleiste werden ausgedünnt**, wenn sie nicht
  nebeneinander passen. Gemessen, nicht geraten — die Breite einer Zahl hängt an
  der eingestellten Schriftgröße.
- **Der Seitenrand ist auf dem Telefon 12 statt 24 Pixel.** 24 sind dort zwölf
  Prozent der Breite, und sie stehen leer.
- Das Sicherheitsprotokoll bricht unter derselben Bedingung um wie alles Übrige;
  die eigene vierte Zahl (620 px) ist verschwunden. **Es gibt jetzt genau drei
  Umbruchpunkte: 1024, 860 und 700.**

### Fixed

- **Ein Kommentar mit Art (Bericht, Aufgabe, Erledigt) verschob seinen Text um
  zwei Pixel.** Die farbige Kante links ist 3 statt 1 Pixel breit und wächst bei
  `border-box` nach innen; in einer gemischten Liste standen die Zeilenanfänge
  abwechselnd auf zwei Linien. *Das ist die eine Stelle, an der sich am
  Schreibtisch etwas ändert — und zwar zum Richtigen.*
- **Die Vergleichsleiste stand nicht mittig.** Sie hing an
  `transform: translateX(-50%)`, und daneben stand `animation: rise … both`;
  `rise` endet auf `transform: none`, und eine laufende Bewegung schlägt in der
  Rangfolge jede gewöhnliche Zeile. Nach 260 Millisekunden saß die Leiste also
  mit ihrer **linken Kante** in der Mitte des Fensters.
- **Der Systembereich lief auf dem Telefon rechts aus dem Bild.** Die einspaltige
  Rasterspalte stand auf `1fr` — kurz für `minmax(auto, 1fr)` —, und `auto`
  ließ eine einzige lange Verwaltungszeile die Spalte auf 404 Pixel ziehen, in
  einem Fenster von 390. Der Browser erweiterte daraufhin still den sichtbaren
  Bereich (gemessen: 421), und die Erklärungstexte standen mitten im Wort
  angeschnitten da.
- **Blätterpfeil, Ausschnittknopf und das Kreuz am Vorschaubild waren auf dem
  Telefon unsichtbar** — sie hingen an `:hover`, und das gibt es dort nicht. Von
  einem Eintrag mit mehreren Fotos sah man das erste und hatte keinen Weg zum
  zweiten.
- **Der angehobene Zustand einer Karte blieb auf dem Finger hängen.** Ein Tipp
  setzt `:hover`, und niemand nimmt ihn wieder weg; wer aus dem Eintrag
  zurückkam, sah eine Liste, in der genau eine Kachel schief stand.
- **Die Zeile einer Anmeldung lief auf dem Telefon aus der Karte hinaus.**
- **Reihen, die nicht umbrechen durften, brechen jetzt um:** die Knopfreihe unter
  dem Kommentarfeld, die Kopfzeile eines Blocks, die Kennzahlenzeile der Karte.
  Bei der Karte fallen dabei die Trennpunkte weg — ein Mittelpunkt am Zeilenende
  trennt nichts mehr.
- **Der graublaue Kasten, den Android bei jeder Berührung aufblitzen lässt**,
  bleibt weg. Jeder Knopf dieser Anlage färbt sich selbst.
- **Kein Warten mehr vor dem Klick** (`touch-action: manipulation`). Ausgenommen
  ist das Vollbild: dort *ist* der zweite Tipp eine Bedeutung.
- Das Vollbild reicht die Wischbewegung nicht mehr an die Seite dahinter weiter.
- Die Vorschaureihe im Vollbild lässt sich bis zum ersten Bild scrollen.
- Der lange Druck zum Umsortieren markiert keinen Text mehr.

### Was du danach von Hand tun musst

Nichts. Es ändert sich nur die Oberfläche; Datenbank, Austauschformat, die
Schlüssel in der `.env` und die Werkzeuge auf dem Wirt sind unberührt.

### Was gleich bleibt

**Alles am Schreibtisch.** Dazu jede Bedienung, jeder Weg und jede Beschriftung:
kein Bedienelement ist verschwunden, keines hat eine neue Bedeutung bekommen.
Das Menü auf dem Telefon führt genau die vier Wege, die vorher in der Kopfzeile
standen — an derselben Stelle im Markup und in derselben Reihenfolge.

---

## [0.11.0] - 2026-08-27

**Die Suche zieht vom Browser auf den Server, wer oft dasselbe sucht, kann es
sich merken — und wer denselben Gegenstand zweimal anlegt, erfährt es beim
Tippen.**

> **DIE SUCHE FINDET AB DIESER VERSION DASSELBE WIE VORHER. Sie fragt nur den
> Server statt den Browser.** Dieselben sieben Quellen, dieselbe
> Schreibungsblindheit bis in die Umlaute, dieselben Treffer ab einem einzigen
> Zeichen, und ein Prozentzeichen bleibt ein Prozentzeichen. Was sich ändert,
> ist die Antwortgröße: die Übersicht ist um **73 Prozent** leichter geworden.

### Added

- **Volltextsuche im Server**, über `GET /api/items?q=…`. Gesucht wird in
  **sieben Quellen**: Titel, Beschreibung, Name der Kategorie, Tags am Eintrag,
  Tags an Testtagen, Adressen der Links und **sämtliche Kommentartexte**.
- **Gespeicherte Ansichten** — bis zu **acht** benannte Filterstellungen je
  Zugang, in der Filterzeile. Eine Ansicht merkt sich die ganze Stellung
  **samt Suchbegriff**: eine Ansicht „Bosch, ungetestet" wäre ohne ihn die
  halbe Ansicht. Sie sind **persönlich**; ein anderer Zugang sieht sie nicht.
  *Die eine gemerkte Stellung von bisher bleibt daneben, was sie war — die
  zuletzt benutzte.*
- **Ein Hinweis auf doppelte Einträge beim Anlegen.** Wer einen Titel tippt,
  sieht darunter eine Zeile *„Ähnlich: …"* mit Sprungmarken zu dem, was schon
  da ist. **Sie blockiert nichts und fragt nichts nach.** Verglichen wird über
  vier Zeichen, ohne Rücksicht auf Groß- und Kleinschreibung und Sonderzeichen.

### Changed

- **Die Übersicht ist deutlich leichter geworden.** Gemessen an einem echten
  Bestand von 1000 Einträgen mit je vier Kommentaren: **2,50 MB → 0,52 MB**,
  **110 ms → 93 ms**. Bei 300 Einträgen 0,75 MB → 0,16 MB.
- **Die Suche fragt den Server frühestens 220 ms nach dem letzten Anschlag** —
  drei schnelle Anschläge sind eine Anfrage, nicht drei. **Ab dem ersten
  Zeichen**, wie bisher. *Während sie unterwegs ist, bleibt die alte Liste
  gedämpft stehen; scheitert sie, bleibt sie stehen und die Zählzeile sagt es.
  Das Leeren der Suche kostet keine Anfrage.*
- **`GET /api/items` liefert `testDays` nur noch, wenn die Zeitleiste
  eingeschaltet ist.** Die Kachelzahlen sind davon unberührt.
- **Die Marke trägt den Akzent statt Gold, und sie steht so hoch wie der Text
  daneben.** Das ist eine Rücknahme aus 0.10.0 und ausdrücklich gewollt: in der
  Kopfzeile standen zwei warme Farben nebeneinander, die nichts voneinander
  wussten. *Gold bleibt die Farbe der Bewertung — die Marke ist nicht die
  Bewertung, sie ist die Anlage.* Geändert sind **zwei Dateien in `public/`**:
  `marke-dunkel.svg` und `favicon.svg`. **Der Reiter des Browsers zeigt die
  alte Marke unter Umständen noch eine Weile** — das ist ein
  zwischengespeicherter Stand und keine kaputte Anlage.
- **Die Liste bereitet zwei Abfragen einmal vor statt je Eintrag.** An 1000
  Einträgen: 24,2 ms → 11,5 ms.

### Removed

- **`searchText` steht nicht mehr in der Antwort von `GET /api/items`.** Das
  Feld war ein je Eintrag zusammengesetzter Suchtext und machte **73 Prozent**
  der Antwort aus; gesucht wird jetzt im Server. *Es ist KEINE Datei entfernt
  worden — es bleibt beim Einspielen also nichts liegen.*

### Fixed

- **Eine gemerkte Filterstellung, die auf eine gelöschte Kategorie oder einen
  gelöschten Tag zeigte, ließ die Übersicht leer aussehen.** Die Nummer wird
  jetzt beim Anwenden übergangen. *Übergangen, nicht zurückgeschrieben: der
  gespeicherte Wert bleibt, wie er ist.*
- **Eine Beschriftung im Prüfstand nannte 64 schreibende Routen, wo 69 geprüft
  wurden.** Wäre die Zeile rot geworden, hätte sie die falsche Zahl genannt.

### Was du danach von Hand tun musst

1. **Einspielen wie immer** — das Verzeichnis **ersetzen**, nicht darüber
   entpacken.
2. **Das Datenverzeichnis muss nicht gesichert werden.** *0.11.0 ist **keine
   Datenbankstufe**:* es kommt keine Tabelle und keine Spalte dazu, und es
   läuft kein Migrationscode. Eine Kopie vor dem Einspielen schadet trotzdem
   nie.
3. **Es kommt keine neue `.env`-Zeile dazu**, die `docker-compose.yml` ist
   unberührt, und es gibt nichts einzustellen.
4. **Wer im Reiter des Browsers noch die alte Marke sieht**, sieht einen
   zwischengespeicherten Stand. Ein harter Neuladen (Strg+Umschalt+R) räumt ihn
   weg; von selbst tut es der Browser auch, nur später.

### Was gleich bleibt

- **Die Suche findet dasselbe wie vorher.** Dieselben sieben Quellen, dieselbe
  Schreibungsblindheit bis in die Umlaute, dieselben Treffer ab einem einzigen
  Zeichen. **Ein Prozentzeichen und ein Unterstrich sind Text und keine
  Wildcards** — und man kann beide auch suchen.
- **Kein FTS5 und kein Suchindex.** Die eingebaute SQLite könnte es; der
  Trigramm-Index kostete an 1000 Einträgen aber 5,17 MB bei 1,75 MB Nettotext,
  bräuchte eine Auffrischung an sieben Schreibstellen — und eine Abfrage mit
  einem oder zwei Zeichen fände dort **still gar nichts**.
- **Keine neue Abhängigkeit, nicht eine.**
- **Kein Schema, keine Migration.** Es bleibt bei **fünf** markierten
  Migrationsblöcken.
- **69 schreibende Routen.** Die Suche ist lesend; die Ansichten gehen über
  `PUT /api/settings`, das es längst gibt.
- **Der Suchbegriff kommt nicht ins Sicherheitsprotokoll.** Es bleibt bei
  **zwanzig** Vorgängen und **dreizehn** Merkmalen.
- **Die Suche bekommt keine eigene Bremse** — sie steht hinter der Anmeldung,
  und die Anmeldebremse verteidigt gegen Fremde.
- **Die Ansichten stehen bei den Filtern**, nicht in einer eigenen Karte: der
  Systembereich behält seine **neunzehn** Karten.
- Das Austauschformat behält seine Nummer **10**, das Vokabular seine **elf**
  Wörter, `BESTAETIGUNG_ZWECKE` seine **sieben** Zwecke.

---

## [0.10.0] - 2026-08-26

**Wer will, sichert seinen Zugang mit einem zweiten Faktor — einem Code aus
einer App auf dem Telefon, der ohne Netz entsteht und alle dreißig Sekunden
ein anderer ist.**

> **WER DEN ZWEITEN FAKTOR NICHT EINSCHALTET, MERKT VON DIESER VERSION
> NICHTS.** Er ist freiwillig und steht je Zugang; ab Werk ist er aus. Die
> Anmeldung, die Einladungslinks, die zweite Bestätigung — alles bleibt Zug um
> Zug, wie es war. Es fehlt keine Funktion.

### Added

- **Ein zweiter Faktor über TOTP, in der Karte „Zugang".** Dort steht ohne
  Klick, ob er an oder aus ist, seit wann, und wie viele
  Wiederherstellungscodes noch übrig sind. Einschalten geht in zwei Schritten:
  der Schlüssel wird in **Vierergruppen** angezeigt (daneben ein Verweis, der
  auf dem Telefon die App unmittelbar öffnet), und erst ein gültiger Code aus
  der App schaltet wirklich ein. So ist belegt, dass die App dasselbe rechnet —
  ein Einschalten ohne diesen Beleg wäre ein Zugang, den niemand mehr öffnet.
- **Acht Wiederherstellungscodes**, genau einmal angezeigt, jeder genau einmal
  gültig. Sie ersetzen den Code aus der App und sind für den Fall da, dass das
  Telefon weg ist. **Gehen die letzten zur Neige, gibt die Karte neue aus** —
  hinter Passwort und einem gültigen Code.
- **Der Weg zurück, wenn der Proxy ausfällt**, steht im README unter „Wenn der
  Proxy ausfällt". Mit `HINTER_PROXY=1` kommt über `http://<server-ip>:3100`
  niemand mehr herein — der Cookie trägt `Secure`, der Browser verwirft ihn.
  *Die Anmeldung sieht dabei aus, als klappte sie:* der Server antwortet mit
  200, erst der Browser wirft den Cookie weg, ohne Meldung. **Am Verhalten
  ändert sich nichts, es ist jetzt nur aufgeschrieben** — samt dem Handgriff,
  der eine Minute dauert.
- **Die Anmeldung wird zweistufig**, aber nur für Zugänge mit zweitem Faktor:
  erst Passwort, dann Code. Ein Tippfehler kostet dabei nicht das Passwort —
  die Seite bleibt stehen und nimmt einen zweiten Anlauf.
- **`node zugang.js zweifaktor <name>` auf dem Wirt** schaltet einen zweiten
  Faktor **aus**. Der Notweg für den Fall, dass Telefon und Codes weg sind.
  *Einschalten geht von dort ausdrücklich nicht: dazu muss das Geheimnis auf
  das Telefon des Betroffenen, und wer es für ihn erzeugte, sperrte ihn aus.*
  `node zugang.js liste` bekommt dafür eine Spalte **2FA**.

### Changed

- **Der Einladungs- und Rücksetzlink meldet nicht mehr unmittelbar an**, wenn
  am Zugang ein zweiter Faktor hängt: nach dem Setzen des Passworts wird der
  Code verlangt. **Für Zugänge ohne zweiten Faktor ändert sich nichts.**
- **Die zweite Bestätigung fragt zusätzlich den Code** — ebenfalls nur bei
  Zugängen, die ihn eingeschaltet haben. Sie verteidigt gegen eine übernommene
  offene Anmeldung, und genau dort trägt ein zweiter Faktor am meisten.
- **Versionsnummern folgen ab dieser Version [Semantic Versioning
  2.0.0](https://semver.org/lang/de/)**, dieses Changelog [Keep a Changelog
  1.1.0](https://keepachangelog.com/de/1.1.0/). Die Zehnerschritte des alten
  Schemas entfallen: eine Nacharbeitsrunde bekommt die nächste PATCH-Zahl statt
  einer freigehaltenen Nummer. **Der Plan ist entsprechend umnummeriert** — aus
  0.9.10 wird diese 0.10.0, aus 0.9.20 wird 0.11.0, und die Zusage der
  Abwärtskompatibilität liegt auf 1.0.0. *Herausgeben lässt sich die Anlage
  davon unabhängig mit jeder Nummer.* Einzelheiten im Projektstand, Abschnitt 5
  und Abschnitt 10.
  **0.10.0 ist MINOR, weil eine neue Funktion dazukommt und die vorhandene
  Schnittstelle unangetastet bleibt** — Datenverzeichnis, Austauschformat,
  `.env` und die Werkzeuge auf dem Wirt.
- **Diese Datei heißt `CHANGELOG.md` und liegt im Wurzelverzeichnis**, nicht
  mehr `Doku/Changelog.md`. So findet sie, wer das Paket auspackt, ohne in
  `Doku/` zu suchen.
- **Die Versionen bekommen ab hier lückenlos einen Git-Tag, und zwar mit `v`.**
  Vierzehn gibt es schon (`0.8.3` bis `v0.8.91`) — aber die Reihe bricht nach
  0.8.91 ab, und die Schreibweise wechselt: die älteren ohne `v`, die beiden
  jüngsten mit. **`v0.10.0` steht auf dem Commit, der herausgeht**, in der
  Schreibweise der beiden jüngsten. Rückwirkend wird nichts getaggt und nichts
  umbenannt; für die Versionen davor bleibt das Änderungsprotokoll das Ziel.

### Security

- **Der Rücksetzlink war der Weg am zweiten Faktor vorbei, und er ist
  geschlossen.** Ein Admin kann für einen fremden Zugang einen Link erzeugen —
  hätte er ihn selbst geöffnet, wäre er angemeldet gewesen, ohne je einen Code
  zu brauchen. *Gefunden beim Bauen, nicht im Betrieb; ohne zweiten Faktor gab
  es daran nichts zu schließen.*
- **Sperren und Freigeben streift einen fremden zweiten Faktor nicht ab.** Das
  Sperren räumt Sitzungen und offene Links; der zweite Faktor bleibt stehen —
  sonst wäre „sperren und wieder freigeben" der Weg an der Rollenleiter vorbei.
- **Die Anmeldebremse greift am zweiten Schritt**, mit unangetasteten
  Kennwerten. Sechs Ziffern sind eine Million; ungebremst wäre das kein Faktor,
  sondern eine Verzögerung.
- **Die Auskunft „dieser Zugang hat einen zweiten Faktor" kommt erst nach
  richtigem Passwort.** Bei falschem Passwort sieht die Antwort aus wie immer,
  Byte für Byte — sonst wäre die Anmeldeseite ein Werkzeug zum Durchprobieren
  von Namen.
- **Das Geheimnis kommt aus keiner Antwort heraus, sobald es bestätigt ist** —
  auch nicht an den Eigentümer. Die Karte sagt „an" oder „aus", nie den Wert.

### Was du danach von Hand tun musst

1. **Das Datenverzeichnis sichern — PFLICHT.** 0.10.0 ist eine Datenbankstufe:
   es kommen **zwei Tabellen** dazu (`zweifaktor`, `zweifaktor_codes`). Sie
   legen sich beim ersten Start selbst an; eine Kopie davor ist trotzdem der
   Weg zurück.
2. **Einspielen wie immer** — das Verzeichnis **ersetzen**, nicht darüber
   entpacken. *Eine Datei zu viel verschiebt den Fingerprint genauso wie eine
   fehlende.*
3. **Nichts weiter.** Es kommt **keine neue `.env`-Zeile** dazu, die
   `docker-compose.yml` ist unberührt, und es gibt nichts einzustellen: wer den
   zweiten Faktor will, schaltet ihn selbst in der Karte „Zugang" ein.
4. *Wer ihn einschaltet:* **die acht Wiederherstellungscodes aufschreiben und
   dorthin legen, wo das Telefon nicht liegt.** Sie kommen nicht wieder.

### Was gleich bleibt

- **Ohne zweiten Faktor ist die Anlage vollständig** — dieselbe Linie wie beim
  Mailversand und bei der Selbstanmeldung.
- **Keine neue Abhängigkeit, nicht eine.** TOTP ist HMAC-SHA1 über einen
  Zähler, und Node kann das seit jeher.
- **Es wird nichts verschickt.** Kein Code per Mail, kein Code per SMS — der
  zweite Faktor entsteht auf dem Telefon, aus einem Geheimnis und der Uhr.
- **Kein Admin schaltet ihn für jemanden ein oder aus.** Nur der Betroffene
  selbst — oder `zugang.js` auf dem Wirt.
- **Die Anmeldebremse behält ihre Kennwerte**, der Tokenweg aus 0.8.80 seine
  Fristen, das Austauschformat seine Nummer **10**, das Vokabular seine elf
  Wörter, der Systembereich seine **neunzehn** Karten.
- **Fünf markierte Migrationsblöcke**, unverändert.

---

## 0.9.1 — Stufe I₂: die Selbstanmeldung

**Wer einen Zugang haben will, kann von selbst danach fragen — und niemand
kommt dadurch herein, ohne dass ein Admin ihn hereinlässt.** Das ist
der Satz, unter dem diese Version steht, und er ist keine Einstellung: es gibt
keine Betriebsart, in der ein geklickter Link allein freischaltet.

> **Und die Anlage läuft ohne all das vollständig.** Der Schalter steht ab Werk
> auf **aus**; dann legt eben nur der Admin Zugänge an, genau wie bisher. Es
> fehlt keine Funktion, und wer die Selbstanmeldung nicht will, merkt von dieser
> Version nichts.

### Neu

- **Ein zweiter Knopf auf der Anmeldeseite — „Zugang anfragen".** Er steht
  unter „Anmelden", in derselben Größe, mit der Frage „Noch keinen Zugang?"
  darüber — **ruhiger gehalten als der Anmeldeknopf**, damit klar bleibt,
  welcher der gewöhnliche Weg ist. Das Formular dahinter hat zwei Felder, Wunschname und
  E-Mail-Adresse, **kein Passwortfeld**. Beides erscheint nur, wenn die
  Selbstanmeldung eingeschaltet ist.
- **Eine Bestätigungsmail davor (Double Opt-in).** Wer das Formular abschickt,
  bekommt zuerst eine Mail mit einem kurzen Link. **Der Link öffnet keinen
  Zugang und setzt kein Passwort** — er sagt nur „ja, das bin ich", und er
  belegt damit, dass die Adresse dem Anfragenden gehört. Er gilt **24 Stunden**.
  Ohne diesen Schritt könnte jeder eine **fremde** Adresse in deine Liste
  schreiben.
- **Die Karte „Anfragen" im Systembereich, für Admins.** Dort steht der
  Schalter, der Stand gegen den Deckel und die Liste der **bestätigten**
  Anfragen mit Name, Adresse und beiden Zeitpunkten — je Zeile
  **Freischalten** oder **Ablehnen**. Unbestätigte Anfragen erscheinen dort
  **nie** und verfallen nach 24 Stunden. **Die Karte steht immer da**, auch
  solange die Selbstanmeldung aus ist — in ihr sitzt schließlich der Schalter.
- **Freischalten legt einen Zugang mit der Rolle „Benutzer" an** — nie mit
  einer anderen — und erzeugt den Einladungslink, über den der Betreffende sein
  Passwort selbst setzt. Der Weg dahinter ist der bekannte aus 0.8.80,
  unverändert: sieben Tage, genau einmal, ab dem ersten Öffnen fünfzehn Minuten.
- **Ablehnen entfernt die Anfrage.** Es entsteht kein Zugang, und es geht
  **keine** Nachricht hinaus — Benachrichtigungsmails gibt es in dieser Anlage
  nicht.
- **Zwei neue Zeilen im Sicherheitsprotokoll** — Freischaltung und Ablehnung,
  beide **ohne** den Namen des Anfragenden.

### Was du danach von Hand tun musst

- **Nichts** — solange du die Selbstanmeldung nicht willst. Sie ist aus.
- **Willst du sie:** im Systembereich die Karte **„Anfragen"** aufsuchen und
  dort einschalten. Das geht erst, wenn **zwei** Dinge stehen:
  - ein **Mailzugang**, mit dem eine **Testmail wirklich durchgekommen** ist
    (Karte „Mailversand", nur für den Eigentümer der Anlage), und
  - **`OEFFENTLICHE_ADRESSE`** in der `.env` — sonst wüsste der Server nicht,
    worauf der Bestätigungslink zeigen soll. *Die Testmail allein genügt als
    Beleg nicht: sie enthält gar keinen Link.*

  Fehlt eines von beiden, sagt die Karte, was fehlt, und der Knopf bleibt
  gesperrt.
- **Die Sicherung des Datenverzeichnisses vor dem Einspielen ist PFLICHT** —
  diese Version bringt eine neue Tabelle mit.
- **Keine neue Zeile in der `.env`**, und die `docker-compose.yml` ist
  unberührt.

### Was gleich bleibt

- **Der Admin entscheidet, immer.** Kein Betrieb, in dem der geklickte Link
  allein hereinlässt.
- **Die Antwort auf eine Anfrage sieht immer gleich aus** — ob der Name frei
  war, ob er vergeben ist, ob die Adresse schon an einem Zugang hängt, ob
  gerade zwanzig Anfragen offen sind oder ob der Schalter aus ist. Sonst wäre
  das Formular ein bequemes Werkzeug, Namen und Adressen durchzuprobieren.
- **Höchstens zwanzig offene Anfragen**, und je Adresse höchstens eine. Die
  einundzwanzigste wird still verworfen.
- **Dieselbe Anmeldebremse wie an der Anmeldung**, an beiden neuen Wegen vor
  der Anmeldung.
- **Ausschalten geht immer.** Und geht der Versand später kaputt, **bleibt der
  Schalter an** — die Karte sagt es rot, statt sich stillschweigend umzulegen.
- **Der Tokenweg aus 0.8.80 ist unverändert**, und der Mailversand aus 0.9.0
  ebenso — es kommt nur ein dritter Anlass für eine Mail dazu.
- **Reiner Text, kein HTML, keine Zählpixel**, auch in der Bestätigungsmail.
- **Die Exportdatei behält ihr Format** (unverändert 10).
- **Keine neue Abhängigkeit, nicht eine.**

### Wenn du eine Bestätigungsmail bekommst, ohne etwas angefragt zu haben

**Dann ist nichts zu tun.** Ohne den Klick geschieht gar nichts, und die
Anfrage verfällt von selbst. Die Mail sagt das auch — und sie sagt ausdrücklich,
dass ihr Link keinen Zugang öffnet und kein Passwort setzt.

### Nachgezogen nach dem Einspielen

Aus dem Betrieb heraus, ohne neue Versionsnummer — **wer 0.9.1 schon fährt,
holt sich das mit dem nächsten Einspielen**:

- **Die Karte „Anfragen" steht dem Admin jetzt immer.** Sie war an die
  Bedingung geknüpft, dass die Selbstanmeldung an ist oder Anfragen vorliegen —
  und der Schalter sitzt in ihr. Frisch eingespielt war sie damit nicht zu
  erreichen.
- **Der Weg zur Anfrage ist ein Knopf** und nicht mehr ein Verweis in der
  Fußzeile. Er wurde übersehen.
- **Marke und Name stehen auf der Anmeldeseite nebeneinander** statt
  übereinander — erst das Zeichen, dann „Kriterion", so wie in der Kopfzeile
  nach der Anmeldung auch.
- **Der Strich über „Zugang anfragen" ist weg.** Er lag quer durch eine Karte,
  die sonst keine Linie kennt. Getrennt wird jetzt mit Abstand, und der Knopf
  trägt dafür selbst eine ganz leichte Färbung — dieselbe Farbe wie „Anmelden",
  nur leise.
- **Eine Grafikdatei weniger.** `marke-hell.svg` war Byte für Byte
  `favicon.svg`; sie ist entfernt.

> **ACHTUNG BEIM EINSPIELEN: diese Version NIMMT eine Datei WEG.** Wer über den
> vorhandenen Ordner auspackt, statt ihn wie im README zu ersetzen, hat
> `public/marke-hell.svg` danach immer noch liegen. Die Anlage läuft damit
> einwandfrei — **aber der Fingerprint ist ein anderer**, weil er über alles
> unter `public/` geht. Steht in der Karte „Kennzahlen" nicht `3cf1b093`, ist
> das der erste Ort zum Nachsehen: Datei löschen und
> `docker compose up -d --build`.

---

## 0.9.0 — Der Server verschickt selbst

**Einladungs- und Rücksetzlinks gehen ab jetzt per Mail hinaus — und wer keinen
Mailzugang einträgt, verliert nichts: die Links stehen weiter zum Kopieren da.**
Das ist die tragende Zusage dieser Version und keine Nebenbemerkung. Eine Anlage
ohne Mailzugang läuft nach dem Einspielen **genau so vollständig** wie vorher.

> **Was sich wirklich ändert, ist die Betriebsart.** Bis 0.8.91 hat die Anlage
> nur auf Anfragen geantwortet. Ab dieser Version baut sie von sich aus eine
> Verbindung zu einem fremden Server auf — ausgehend, zu genau einem Server,
> den du selbst einträgst. Kein Empfang, kein offener Port, kein Abholen.

### Neu

- **Der Mailzugang, in der Karte „Mailversand" im Systembereich.** Anbieter
  auswählen (GMX, Web.de, Gmail, Strato, IONOS oder „Eigener Server"),
  Benutzername, Passwort und Absenderadresse eintragen, fertig. Server, Port
  und Verschlüsselung füllt die Vorlage.
- **Die Karte gehört dem Eigentümer, ganz** — eintragen, einsehen und die
  Testmail auslösen. Ein Admin kommt an keines davon, und der Grund ist die
  Rollenleiter: der SMTP-Server sieht **jede** Mail, und jede trägt einen Link,
  der ein Passwort setzt. Dürfte ein Admin ihn eintragen, liefe die Rücksetzmail
  des Eigentümers über einen Server seiner Wahl.
- **Ein Testmail-Knopf — an die eigene Adresse und nirgendwo sonst.** Es gibt
  kein Adressfeld daneben, und das ist Absicht: ein Knopf, der an eine beliebige
  Adresse schickt, wäre ein offener Mailverteiler hinter einer Anmeldung.
- **Ein Adressfeld am Zugang.** Beim Anlegen kannst du eine E-Mail-Adresse
  mitgeben — sonst hätte die Einladung keinen Empfänger. **Ändern darf sie
  danach allein der Betreffende selbst**, im Systembereich unter „Zugang", hinter
  seinem bisherigen Passwort. Sie ist überall **freiwillig**.
- **Eine zweite Frist am Link: ab dem ersten Öffnen bleiben fünfzehn Minuten.**
  Die sieben Tage sind die Frist fürs *Lesen der Mail*; solange niemand geöffnet
  hat, läuft nichts. Ab dem ersten Öffnen ist der Link erwiesenermaßen
  angekommen — und hat in einem fremden Postfach nichts mehr verloren.
  **Innerhalb der fünfzehn Minuten darfst du beliebig oft öffnen und neu laden.**

### Behoben

- **Ein gültiger Einladungslink konnte tot aussehen.** Wer sich vorher ein
  paarmal beim Anmelden vertippt hatte, lief beim Klick auf seinen Link in die
  Anmeldebremse — und die Oberfläche warf den Schlüssel daraufhin aus der
  Adresse. Nach dem Neuladen stand man auf der Anmeldeseite, und der Link schien
  verbraucht. **Er war es nie.** Jetzt bleibt der Schlüssel bei einer
  vorübergehenden Absage stehen, und die Seite bietet einen zweiten Anlauf an.

### Was du danach von Hand tun musst

- **Nichts** — solange du keine Mail willst. Ohne Mailzugang bleibt alles, wie
  es war.
- **Willst du Mail:** `OEFFENTLICHE_ADRESSE` in die `.env` eintragen (ohne sie
  wird nicht verschickt), dann die Karte „Mailversand" ausfüllen und die
  **Testmail** drücken. Dafür brauchst du eine Adresse an deinem eigenen Zugang.
- **Drei Stolpersteine beim Anbieter**, an denen die meisten Versuche
  scheitern: **Gmail** verlangt Zwei-Faktor und ein **App-Passwort**; **GMX**
  und **Web.de** verlangen, den Versand über fremde Programme im Konto erst
  **freizuschalten**; und **die Absenderadresse muss zum Konto gehören**.

### Was gleich bleibt

- **Der Tokenweg aus 0.8.80 im Übrigen unverändert:** sieben Tage, genau einmal
  gültig, beim Einlösen fallen alle übrigen offenen Links und alle Sitzungen,
  Mindestwert zehn Zeichen, **eine** Absage für alle Fälle.
- **Der Link steht immer zum Kopieren da** — auch wenn der Versand gelingt,
  und erst recht, wenn er fehlschlägt. Dann steht daneben, was schiefging.
- **Keine Benachrichtigungsmails.** Es gibt genau **zwei** Anlässe für eine
  Mail: den Tokenlink und die Testmail. Nicht „jemand hat kommentiert", nicht
  „etwas ist offen".
- **Reiner Text.** Kein HTML, keine Bilder, keine Zählpixel, keine Anhänge.
- **Die Exportdatei behält ihr Format** (unverändert 10) — ein Mailzugang steht
  nicht darin, und die Exportdatei trägt überhaupt keine Einstellungen.
- **Die Datenbank bekommt weder Tabelle noch Spalte.** Diese Version ist
  **keine** Datenbankstufe; der Mailzugang liegt in `settings`, und
  `users.email` gibt es seit 0.6.0.
- **Es kommt keine neue Zeile in die `.env`.** `OEFFENTLICHE_ADRESSE` gibt es
  seit 0.8.90.

### Beim Einspielen

- **Wie immer: `docker compose down`, Daten kopieren, ZIP auspacken, `.env`
  zurück, `up -d --build`.** Nichts an der `docker-compose.yml`.
- **Eine neue Laufzeitabhängigkeit — die erste seit Langem:** `nodemailer`.
  MIT-0, **ohne eigene Abhängigkeiten**, 776 KB; der Baum wächst um genau ein
  Paket. Das `--build` holt sie mit.
- **Die Selbstanmeldung ist noch nicht dabei.** Sie ist die zweite Hälfte dieser
  Stufe und kommt als 0.9.1 — Formular vor der Anmeldung, Bestätigungsmail,
  Warteschlange beim Admin, Freischaltung.

---

## 0.8.91 — Der Schlüssel lässt sich wechseln

**Der Schlüssel der Datenbank lässt sich wechseln, ohne die Anlage neu
aufzusetzen — und die Anlage sagt vorher, was danach von Hand zu tun ist.**
Bisher galt: ein einmal gesetzter Schlüssel bleibt für immer. Wer ihn versehentlich
weitergegeben hatte — etwa, weil er eine Weile als `data/encryption.key` neben der
Datenbank lag und jemand das Verzeichnis kopiert hat —, konnte nichts dagegen
tun. Das ändert sich.

> **Lies das hier bitte ganz, bevor du den Wechsel fährst.** Er ist der
> einzige Vorgang im ganzen Projekt, bei dem ein Fehler **alle Daten**
> kostet. Wer ihn drückt, muss vorher wissen, was er danach von Hand tun muss.

### Neu

- **Der Schlüsselwechsel — auf dem Wirt, nicht in der Oberfläche.** Im
  Projektverzeichnis:

  ```bash
  ./schluessel.sh zeigen       # Lage ansehen, ändert nichts
  ./schluessel.sh wechseln     # anhalten, sichern, wechseln, starten
  ```

  Das Skript sichert erst die `.env`, hält die Anlage an, sichert das
  Datenverzeichnis, wechselt den Schlüssel und trägt den neuen Wert dorthin
  ein, **woher der alte kam**: in die `.env` oder in `data/encryption.key`.
  Danach startet es die Anlage wieder.
- **Der alte Wert geht nicht verloren.** In der `.env` bleibt er
  **auskommentiert** über der neuen Zeile stehen — mit Datum, mit dem Namen
  dessen, der gewechselt hat, und mit dem Satz, wofür er noch gut ist. **Alles
  andere in der `.env` bleibt unangetastet**, Zeichen für Zeichen.
- **Die Karte „Sicherung" markiert die alten Kopien.** Ab einem Wechsel sind
  **zwei Schlüssel im Umlauf**: jede Sicherung von vorher öffnet sich nur noch
  mit dem alten. Die Karte zählt sie und markiert sie rot. Ist auch die
  **jüngste** Kopie älter als der Wechsel, sagt sie das deutlicher — dann passt
  überhaupt keine zum heutigen Schlüssel, und es gehört sofort neu gesichert.
- **Eine Zeile im Sicherheitsprotokoll.** „Schlüssel gewechselt", ohne
  Handelnden, ohne Ziel, ohne Merkmal. **Sie nennt, DASS gewechselt wurde, nie
  WOHIN** — ein Schlüssel steht in keiner Protokollzeile.

### Was du danach von Hand tun musst

- **Den alten Wert in den Passwortspeicher übernehmen**, bevor du die
  auskommentierte Zeile aus der `.env` entfernst. **Er ist der einzige
  Schlüssel zu allen Sicherungen, die vor dem Wechsel entstanden sind.**
- **Neu sichern.** Erst danach liegt wieder eine Kopie da, die zur laufenden
  Anlage gehört.
- **Und wie immer:** `.env` und `data/` gehören nicht in dieselbe Ablage.

### Was gleich bleibt

- **Gewechselt wird der Schlüssel, nicht das Verfahren.** SQLCipher bleibt, die
  Schlüssellänge bleibt, der Dateiname bleibt, das Schema bleibt.
- **Niemand wird abgemeldet.** Der Datenbankschlüssel hängt an keinem Passwort;
  offene Sitzungen laufen weiter.
- **Am Eintrag ändert sich gar nichts.** Schreiben, bewerten, kommentieren,
  Fotos und Dateien: alles wie bisher.
- **Die Exportdatei behält ihr Format** (unverändert 10). Ein Schlüssel steht
  nicht darin, und ein JSON-Export braucht auch keinen — er ist damit der
  einzige Rückweg, der von der Schlüsselverwaltung nichts wissen muss.
- **Es kommt keine neue Einstellung dazu** und keine neue Abhängigkeit.
- **Die Datenbank bekommt weder Tabelle noch Spalte.** Diese Version ist
  **keine** Datenbankstufe.

### Beim Einspielen

- **Wie immer: `docker compose down`, Daten kopieren, ZIP auspacken, `.env`
  zurück, `up -d --build`.** Nichts an der `docker-compose.yml`.
- **Die Sicherung des Datenverzeichnisses ist PFLICHT — und beim
  Schlüsselwechsel ein zweites Mal.** Beim Einspielen wie immer; vor jedem
  Wechsel noch einmal, **und die `.env` dazu**. Das Skript legt beides selbst
  an, aber eine Sicherung neben dem Original ist keine.
- **PROBIER DEN WECHSEL AN EINER WEGWERFANLAGE AUS.** Ein leeres Verzeichnis,
  ein `docker compose up -d`, ein paar Einträge, dann `./schluessel.sh
  wechseln` — und danach nachsehen, ob sie wieder aufgeht. Erst dann an der
  echten.
- **Bricht der Wechsel ab, ist das folgenlos:** die Datenbank behält ihren
  bisherigen Schlüssel, es entsteht kein halber Zustand. Reicht der Platz
  nicht, sagt das Skript vorher ab und rührt nichts an.

---

## 0.8.90 — Schwere Eingriffe

**Wer die Anlage als Ganzes anfasst, gibt sein Passwort noch einmal ein — und
was dabei geschieht, steht hinterher nachlesbar da.** Bisher genügte eine offene
Anmeldung, um einen Zugang zu entfernen, eine Rolle zu vergeben oder den ganzen
Bestand zu exportieren. Wer einen Bildschirm unbeaufsichtigt stehen lässt,
lässt damit die ganze Anlage offen. Das ändert sich.

### Neu

- **Die zweite Bestätigung.** Vor dem **Export**, dem **Import**, dem
  **Vergeben einer Rolle**, dem **Setzen eines fremden Passworts**, dem
  **Erzeugen eines Links** und dem **Entfernen eines Zugangs** fragt Kriterion
  nach deinem eigenen Passwort — in einem Fenster, das daneben schreibt, warum
  es fragt. Die Bestätigung gilt **genau einmal** und nur für die eine
  Handlung: wer drei Zugänge nacheinander entfernt, tippt dreimal.
- **Das Sicherheitsprotokoll.** Eine neue Karte im Systembereich, **nur für den
  Eigentümer**. Sie hält fest, wer Zugang hatte und wer die Anlage als Ganzes
  angefasst hat: Anmeldungen (gelungene und gescheiterte), angelegte,
  gesperrte, freigegebene und entfernte Zugänge, vergebene Rollen, gesetzte
  Passwörter, erzeugte und eingelöste Links, Export, Import und Sicherung. Die
  Zeilen bleiben **180 Tage** stehen und werden danach von selbst geräumt.
- **`OEFFENTLICHE_ADRESSE` in der `.env` — optional.** Den Einladungslink baut
  bisher der Browser aus der Adresse, an der du gerade stehst. Wer über
  `http://192.168.1.50:3100` arbeitet und einen Link nach draußen gibt, gibt
  einen Link ins Leere. Ist die Zeile gesetzt, baut der Server den Link; der
  Kasten sagt darunter, **woher** die Adresse kam.

### Was gleich bleibt

- **Sperren, Freigeben und Anlegen fragen nicht nach.** Sperren ist umkehrbar,
  und ein neuer Zugang nimmt niemandem etwas. Auch am eigenen Zugang ändert
  sich nichts — dort war das bisherige Passwort ohnehin schon Pflicht.
- **Am Eintrag ändert sich gar nichts.** Schreiben, bewerten, kommentieren,
  Fotos und Dateien: alles wie bisher.
- **Das Protokoll ist kein Änderungsverlauf.** Es steht nicht darin, was jemand
  geschrieben, bewertet oder geändert hat — nur, wer die *Anlage* angefasst
  hat. Und es speichert weiterhin **weder IP-Adresse noch Browserkennung**.
- **Es wird nichts verschickt.** Kriterion baut weiterhin keine Verbindung nach
  außen auf. Mailversand kommt in einer späteren Version.
- **Ohne die neue `.env`-Zeile läuft alles wie bisher.** Sie ist optional und
  leer als Vorgabe.
- Export, Import, Papierkorb, Sicherung, Rollen und Rechte arbeiten
  unverändert. Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Die Sicherung des Datenverzeichnisses ist PFLICHT.** Die Datenbank bekommt
  eine neue Tabelle; ein Downgrade auf eine ältere Version ist damit keine
  reine Dateikopie mehr. Auf Knopfdruck geht es auch — **aber die Kopie ist
  verschlüsselt und ohne die `.env` wertlos**, also beides sichern und
  ausdrücklich **nicht** in dieselbe Ablage legen.
- **Sonst nichts.** Keine Änderung an der `docker-compose.yml`, keine neue
  Abhängigkeit. Die Tabelle legt sich beim ersten Start selbst an.
- **Wenn du die öffentliche Adresse setzen willst**, trag sie in die `.env` ein
  und erzeuge den Container neu:
  `OEFFENTLICHE_ADRESSE=https://kriterion.beispiel.de`. Ein Tippfehler bricht
  den Start **nicht** ab — er wird im Protokoll gemeldet, und der bisherige Weg
  trägt weiter.
- **Halte dein eigenes Passwort bereit.** Es wird ab jetzt vor jedem schweren
  Weg gefragt. Wer es nicht mehr weiß, ändert es vorher unter „Zugang".

---

## 0.8.80 — Einladung, Rücksetzung, Sitzungen

**Das Passwort gehört dem, der es benutzt.** Bisher legte der Admin einen
Zugang mit einem ersten Passwort an und musste es weitersagen — er kannte es
also, und der neue Benutzer musste es hinterher selbst ändern, wenn ihm das
unangenehm war. Jetzt bekommt er stattdessen einen **Link** und wählt sein
Passwort selbst.

### Neu

- **Zugang anlegen mit Link.** In der Karte „Zugänge" steht beim Anlegen ein
  **Auswahlfeld**: *„Er wählt sein Passwort selbst"* (die Vorgabe) oder *„Ich
  vergebe das erste Passwort"*. Bei der ersten Wahl gibt es gar kein
  Passwortfeld — der Zugang entsteht **ohne** Passwort, und du bekommst einen
  Link. Wer ihn öffnet, wählt sein Passwort selbst und ist danach gleich
  angemeldet.
- **Passwort zurücksetzen mit Link.** Dasselbe für einen vorhandenen Zugang:
  das Kettenglied 🔗 an der Zeile erzeugt einen Link. Das bisherige Passwort
  gilt weiter, bis er eingelöst wird.
- **Der Link gilt sieben Tage und genau einmal.** Beim Einlösen werden alle
  bestehenden Anmeldungen dieses Zugangs beendet, und alle anderen noch
  offenen Links dazu verfallen.
- **„Meine Sitzungen".** Eine neue Karte im Systembereich — für **jeden**, auch
  ohne Rolle. Sie zeigt, wo dieser Zugang überall angemeldet ist, markiert die
  aktuelle Anmeldung und hat einen Knopf „alle anderen beenden". Ein Admin
  sieht dort **nur seine eigenen**, nie fremde.

### Was gleich bleibt

- **Der direkte Weg bleibt.** Der Admin kann weiterhin ein Passwort setzen und
  es sagen — der Schlüssel 🔑 steht neben dem Kettenglied. Das ist der kürzere
  Weg, wenn der andere danebensteht.
- **Der Notweg auf dem Server bleibt unverändert:**
  `docker compose exec kriterion node zugang.js passwort <name>`.
- **Es wird nichts verschickt.** Kriterion baut weiterhin **keine** Verbindung
  nach außen auf: den Link kopiert der Admin und gibt ihn weiter. Mailversand
  kommt in einer späteren Version.
- **Es wird nichts zusätzlich gespeichert.** „Meine Sitzungen" kennt **kein
  Gerät** — weder IP-Adresse noch Browserkennung werden erfasst, wie bisher
  auch nicht. Die Karte sagt das offen.
- Export, Import, Papierkorb, Sicherung, Rollen und Rechte arbeiten
  unverändert. Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Die Sicherung des Datenverzeichnisses ist PFLICHT.** Die Datenbank bekommt
  eine neue Tabelle; ein Downgrade auf eine ältere Version ist damit keine
  reine Dateikopie mehr. Seit 0.8.70 geht das auch auf Knopfdruck — **aber die
  Kopie ist verschlüsselt und ohne die `.env` wertlos**, also beides sichern
  und ausdrücklich **nicht** in dieselbe Ablage legen.
- **Sonst nichts.** Keine neue Einstellung, keine Änderung an der
  `docker-compose.yml` oder der `.env`, keine neue Abhängigkeit. Die Tabelle
  legt sich beim ersten Start selbst an.
- **Ein Hinweis für den Fall eines Downgrades:** ein Zugang, der über einen
  Link angelegt und noch **nicht** eingelöst wurde, hat kein Passwort. Eine
  ältere Version kann ihm keinen neuen Link geben — dort hilft nur
  `node zugang.js passwort <name>` auf dem Server.
- **Der Link ist ein Passwortersatz auf Zeit.** Wer ihn weitergibt, gibt für
  sieben Tage den Zugang weiter. Er steht danach in dem Verlauf, über den er
  verschickt wurde — nur dem geben, für den er ist. Die Oberfläche sagt das an
  der Stelle, an der er kopiert wird.

---

## 0.8.71 — Der Sicherungsort zieht um

**Eine Berichtigungsrunde, keine Stufe.** Der Sicherungsort lag bisher eine
Ebene über dem Projektverzeichnis und legte dort einen zweiten Ordner an. Das
hielt die Übersicht nicht — und die sichere Lage war es nur solange, wie
niemand sie hinterfragte.

### Neu

- **Der Sicherungsort liegt jetzt im Projektverzeichnis** (`kriterion-sicherung`
  neben `data`). Ein Ordner weniger eine Ebene höher.
- **Die Karte „Sicherung" sagt, wie er liegt.** Ein **roter** Kasten, wenn er
  im Projektverzeichnis liegt, mit dem Grund daneben; ein **grüner**, wenn er
  außerhalb liegt. Abgewiesen wird keine der beiden Lagen — eine Sicherung am
  falschen Ort ist besser als keine.
- **Wer die sichere Lage will, stellt zwei Zeilen in der `docker-compose.yml`
  um.** Wie, steht dort und in der README.

### Was gleich bleibt

- Alles andere. Kein Schema, keine neue Formatnummer, keine neue Route, keine
  neue Abhängigkeit. Der Papierkorb, die Sicherung selbst und ihr Zielort in
  der Oberfläche arbeiten unverändert.

### Beim Einspielen

- **Der Einspielweg hat eine Zeile mehr bekommen** — sie holt vorhandene
  Sicherungen aus dem umbenannten Ordner zurück. Ohne sie bleiben sie in
  `kriterion-alt` liegen. Steht der Sicherungsort außerhalb, ist die Zeile
  wirkungslos und stört nicht.
- **Die neue `docker-compose.yml` muss mit eingespielt werden** — sie trägt die
  geänderte Einhängung und die geänderte Variable. Beide gehören zusammen.
- Kein Pflicht-Sicherungspunkt: die Datenbank wird nicht angefasst.

---

## 0.8.70 — Sicherung und Papierkorb

**Zwei Wege zurück, die es bisher nicht gab.** Ein gelöschter Eintrag war
endgültig weg — samt allem, was andere daran geschrieben hatten. Und eine
Sicherung der Anlage entstand nur von Hand auf dem Server.

### Neu

- **Der Papierkorb.** Ein gelöschter Eintrag liegt **dreißig Tage** dort und
  lässt sich zurückholen — mit Fotos, Videos, Dateien, Kommentaren,
  Bewertungen und Testtagen, jeweils samt Verfasser. Die Karte im Systembereich
  zeigt, was drin liegt, wer gelöscht hat und wie lange es noch bleibt.
- **Sehen darf den Papierkorb der Admin, zurückholen der Eigentümer der
  Anlage.** Zurückholen legt Beiträge unter fremdem Namen wieder an; das ist
  dieselbe Sache wie ein Import und liegt deshalb in derselben Hand.
- **Der Löschdialog sagt es vorher.** Er nennt weiterhin, was am Eintrag hängt
  und was davon anderen gehört — und dazu jetzt, dass alles davon dreißig Tage
  im Papierkorb liegt.
- **Sicherung auf Knopfdruck.** Eine neue Karte im Systembereich erzeugt eine
  vollständige, verschlüsselte Kopie der Datenbank — ohne den Server anhalten
  zu müssen. Sie sagt vorher, wie lange es dauert, und zeigt, wann zuletzt
  gesichert wurde.
- **Der Zielort liegt außerhalb des Projektordners** und wird in der
  `docker-compose.yml` eingehängt; in der Oberfläche lässt sich darunter ein
  Unterverzeichnis wählen. Jede Sicherung bekommt einen eigenen Namen mit Datum
  und Uhrzeit — eine Sicherung überschreibt nie die vorige.
- **Einen einzelnen Eintrag als Datei ziehen.** Dieselbe Form wie der volle
  Export, nur mit einem Eintrag.
- **Die Kennzahlen weisen den Papierkorb getrennt aus** — sonst wundert man
  sich über eine Datenbank, die nach dem Aufräumen größer ist als vorher.

### Was gleich bleibt

- **Gelöscht ist gelöscht.** Ein gelöschter Eintrag verschwindet aus Übersicht,
  Suche und Filtern wie bisher; er liegt nur zusätzlich noch als Paket im
  Papierkorb. An der Bedienung ändert sich sonst nichts.
- **Die Exportdatei behält ihr Format.** Eine Datei aus 0.8.50 oder 0.8.60
  lässt sich unverändert einspielen, und eine Datei aus 0.8.70 auch dort wieder.
- **Der Export bleibt, wie er war**, samt seiner Häkchen für Dateien und
  Videos. Er ist der Weg für Umzug und Archiv; die neue Sicherung ist der Weg
  für den Notfall. Ein Satz auf jeder der beiden Karten sagt, welche man will.
- **Zwei Löschwege füllen den Papierkorb nicht:** einen Zugang mitsamt seinen
  Einträgen zu entfernen, und ein Import, der den Bestand *ersetzt*. Beides ist
  eine Ansage über die ganze Anlage, kein einzelner Fehlgriff.
- **Zwei Kleinigkeiten kommen beim Zurückholen nicht mit:** Favoritensterne
  **anderer** Benutzer und der Vermerk über entfernte Kommentarbilder.

### Beim Einspielen

- **Die Sicherung des Verzeichnisses `data` ist wieder Pflicht.** Diese Version
  fasst die Datenbank an; ein Downgrade auf 0.8.60 ist keine reine Dateikopie
  mehr. In 0.8.60 war das anders.
- **Die neue `docker-compose.yml` gehört mit eingespielt.** Sie hängt den
  Sicherungsort ein (`../kriterion-sicherung`) und benennt ihn. Ohne sie bleibt
  die Karte „Sicherung" aus und sagt das — sie schreibt nicht still irgendwohin.
- **Der Sicherungsort gehört nicht dorthin, wo auch die `.env` liegt.** Die
  Kopie ist verschlüsselt; wer den Schlüssel danebenlegt, hebt die
  Verschlüsselung auf.
- **Die Anlage steht still, während eine Sicherung entsteht** — bei einer
  Datenbank von einem Gigabyte etwa eine halbe Minute. Die Karte nennt die
  erwartete Dauer, bevor man drückt.
- Sonst nichts Besonderes: keine neuen Einstellungen, keine geänderte
  Bedienung, kein neues Wort im Vokabular.

---

## 0.8.60 — Was ist offen, was ist neu

**Zwei Dinge, die es längst gibt, werden auffindbar.** Aufgabenkommentare
waren nur zu sehen, wenn man ihren Eintrag öffnete — bei zwanzig Einträgen
hieß das zwanzigmal klicken. Und wer nach ein paar Tagen wiederkam, sah zwar,
dass sich etwas getan hatte, aber nicht mehr, was davon neu war.

### Neu

- **Die Ansicht „Offen"** — ein neuer Knopf in der Kopfzeile, neben dem
  Zahnrad. Sie zeigt alle nicht erledigten Aufgaben aus allen Einträgen auf
  einem Bildschirm, gruppiert nach Eintrag, mit Verfasser und Datum. Ein Klick
  führt in den Eintrag.
- **Abhaken geht direkt dort.** Die Zeile bleibt danach durchgestrichen
  stehen, damit sich der Haken gleich wieder wegnehmen lässt; beim nächsten
  Aufruf ist sie fort. Wer abhaken darf, ist unverändert: der Verfasser des
  Kommentars und der Admin.
- **Ein Umschalter „meine / alle"** ab zwei Zugängen — bei einem einzigen
  Zugang wären beide Stellungen dieselbe Liste.
- **Der Filter „Neu seit …"** in der Filterzeile, neben „★ Favoriten", mit der
  Zahl daneben. Er zeigt, was sich seit dem letzten Besuch getan hat, und
  lässt sich mit Status, Kategorie und Tags frei kombinieren.
- **Der Bezugspunkt ist persönlich** und wird beim Verlassen der Übersicht
  gesetzt — während man hinsieht, bleibt die Liste also stehen. Beim
  allerersten Besuch erscheint der Filter noch nicht: es gibt dann nichts, mit
  dem sich vergleichen ließe.

### Was gleich bleibt

- **Die Reihenfolge der Übersicht ändert sich nicht.** Beide Neuerungen sind
  Filter — die Liste zeigt weiter für alle gleich, wo zuletzt etwas geschehen
  ist, und niemand bekommt eine eigene Sortierung.
- **Am Kommentarblock im Eintrag ändert sich nichts.** Farbkante,
  Weiterschaltknopf und Reihenfolge bleiben, wie sie waren; die neue Ansicht
  kann nichts, was der Eintrag nicht auch könnte.
- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr
  Format. Eine Datei aus 0.8.50 lässt sich unverändert einspielen.
- **Wer eigene Wörter eingestellt hat**, liest sie auch hier: heißen die
  Aufgaben „Mängel", steht über der Ansicht „Offene Mängel".

### Beim Einspielen

- **Nichts Besonderes.** Diese Version fasst die Datenbank nicht an; die
  Sicherung des Verzeichnisses `data` ist eine Empfehlung, keine Pflicht — und
  der Weg zurück auf 0.8.50 ist wieder eine reine Dateikopie.
- Der Filter „Neu seit …" erscheint erst beim **zweiten** Besuch der
  Übersicht. Das ist kein Fehler: vorher gibt es keinen Bezugspunkt.
- Intern heißt der `Abdruck` in der Kennzahlenkarte jetzt **Fingerprint** —
  dieselbe Zahl, das gebräuchlichere Wort.

---

## 0.8.50 — Kurzvideos am Fotoplatz

**Ein kurzes Video gehört in dieselbe Reihe wie die Fotos.** Bis dahin blieb
nur der Umweg über einen Anhang, der heruntergeladen statt abgespielt wurde.

### Neu

- **Videos bis 20 MB liegen bei den Fotos.** Dasselbe Feld zum Hinzufügen,
  dieselbe Reihenfolge, dasselbe Ziehen zum Umsortieren. Steht ein Video
  vorn, ist sein Standbild das Hauptbild des Eintrags.
- **MP4, WebM und MOV** — also auch das Format, das jedes iPhone liefert.
  Entschieden wird nach dem Inhalt der Datei, nicht nach ihrem Namen.
- **Das Standbild erzeugt der Browser beim Hochladen.** Es erscheint auf der
  Karte und in der Vorschauleiste, mit einem ▶ in der Ecke und der Länge
  daneben. Wer ein Video nicht abspielen kann, kann es auch nicht hochladen —
  ein Videoplatz, der nicht abspielt, wäre ein kaputter Platz.
- **Abgespielt wird im Eintrag und im Vollbild**, mit der gewohnten Steuerung
  des Browsers und mit Springen im Video. Nichts spielt von selbst los.
- **Der Löschdialog und die Kennzahlen nennen Videos getrennt.** Ein Dialog,
  der „3 Fotos" sagt und dabei ein Video mit wegwirft, verschwiege genau das,
  worum es geht.
- **Export und Import nehmen Videos mit** — über einen eigenen Schalter,
  Vorgabe aus.

### Was gleich bleibt

- **Fotos bleiben in jeder Hinsicht, wie sie waren.** Anzeige, Reihenfolge,
  Bildausschnitt, Auslieferung — kein Handgriff daran.
- **Ein Video liegt wie alles andere in der verschlüsselten Datenbank.** Die
  Sicherung des Verzeichnisses `data` deckt es mit ab, ohne Zutun.
- **Wer den Eintrag ändern darf, darf Videos hinzufügen und entfernen** —
  dieselbe Regel wie beim Foto, kein neues Recht.
- Größere Dateien gehören weiterhin an den Anhang. Für Videos jenseits von
  20 MB ist ein eigener Bauabschnitt vorgesehen.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `photos um art und dauer ergaenzt (Migration auf 0.8.50)`. Danach steht jedes
  vorhandene Foto auf der Art „bild"; an der Anzeige ändert sich nichts.
- **Das Austauschformat steht jetzt auf 10.** Ältere Exportdateien lassen sich
  weiterhin einspielen.
- **Der Videoschalter beim Export ist mit Absicht aus.** Ohne ihn nennt die
  Datei die Videos, enthält sie aber nicht; beim Einspielen sagt die Meldung,
  wie viele gefehlt haben. Wer eine vollständige Sicherung braucht, sichert
  das Verzeichnis `data` — nicht die Exportdatei.

---

## 0.8.40 — Gewichtete Bewertungskriterien

**Nicht jedes Kriterium wiegt gleich.** Bisher zählte „Optische Erscheinung"
genauso viel wie „Verarbeitungsqualität". Ab dieser Version lässt sich das
einstellen.

### Neu

- **Jedes Bewertungskriterium bekommt ein Gewicht.** Im Systembereich, in der
  Karte „Bewertungskriterien", steht neben jedem Kriterium ein Feld:
  **0,2 bis 2**, Vorgabe **1**. Vorgeschlagen werden `0,5 · 0,8 · 1 · 1,2 ·
  1,5`, alles dazwischen lässt sich eintippen. Kommazahlen wie gewohnt mit
  Komma — ein eingefügter Punkt wird ebenfalls gelesen.
- **Der Gesamtschnitt rechnet mit.** Ein Kriterium mit Gewicht 1,5 zieht die
  Zahl am Eintrag anderthalbmal so stark. Das wirkt überall dort, wo die Zahl
  auftaucht: in der Kachel der Übersicht, in der Sortierung „Bewertung", in
  der Detailansicht und im Vergleich.
- **Man sieht, dass gewichtet gerechnet wurde.** Weicht ein Gewicht von 1 ab,
  steht `×1,5` hinter dem Kriteriennamen — am Eintrag und im Vergleich —, und
  im Blockkopf steht das Wort „gewichtet" neben der Zahl. Ohne diese Anzeige
  ließe sich die Kopfzahl nicht mehr nachvollziehen.
- **Export und Import nehmen die Gewichte mit.** Beim Einspielen in eine
  bestehende Anlage bleiben die dort eingestellten Gewichte unangetastet — der
  Import bringt Bestand mit, keine Einstellungen.

### Was gleich bleibt

- **Solange alle Gewichte auf 1 stehen, ist jede angezeigte Zahl exakt die
  von vorher.** Das Einspielen dieser Version verändert keine Bewertung und
  keine Reihenfolge in der Übersicht.
- **Und es ist umkehrbar:** wer alle Gewichte auf 1 zurückstellt, hat wieder
  genau den alten Stand. Es geht dabei nichts verloren.
- **Ein Eintrag bleibt immer zwischen 1 und 5** — bei jeder Kombination von
  Gewichten. Das ergibt sich aus der Rechenart, es ist keine Deckelung.
- Die Skala bleibt 1 bis 5, die Sterne bleiben die eigene Bewertung, und der
  Durchschnitt eines einzelnen Kriteriums bleibt ungewichtet.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `rating_criteria um gewicht ergaenzt (Migration auf 0.8.40)`. Danach steht
  jedes vorhandene Kriterium auf Gewicht 1.
- **Das Austauschformat steht jetzt auf 9.** Ältere Exportdateien lassen sich
  weiterhin einspielen; eine neue Datei in einer älteren Anlage verliert nur
  die Gewichte, sonst nichts.
- Die Gewichte stellt der **Admin** ein. Sie gelten für alle — eine
  persönliche Einstellung wäre eine zweite Wahrheit über denselben Eintrag.

---

## 0.8.31 — Dateien bekommen einen Verfasser

**Wer eine Datei anhängt, dem gehört sie.** Bis dahin durfte nur der Verfasser
eines Eintrags Dateien anhängen.

- **Hochladen darf jeder.** Löschen darf, wer die Datei hochgeladen hat — oder
  der Admin.
- **Ab zwei Zugängen steht der Name an fremden Dateizeilen**, in Klammern
  hinter der Größe. An den eigenen steht nichts; er stünde nur im Weg.
- Export und Import tragen den Namen mit (**Austauschformat 8**).

**Beim Einspielen:** auch diese Version fasst die Datenbank an — `data`
vorher sichern. Beim ersten Start meldet das Protokoll einmalig
`attachments um user_id ergaenzt`; vorhandene Dateien fallen dabei dem
Verfasser ihres Eintrags zu.


---

## 0.8.30 — Die Linkliste bekommt einen Verfasser

**Wer einen Link einträgt, dem gehört die Zeile.** Bis dahin durfte nur der
Verfasser eines Eintrags Links eintragen, sortieren und löschen — dieselbe
Klemme wie für Titel und Beschreibung.

### Neu

- **Eintragen darf jeder.** Löschen darf, wer die Zeile eingetragen hat — oder
  der Admin. Das ✕ steht nur dort, wo es auch gedrückt werden darf.
- **Ab zwei Zugängen steht der Name an fremden Linkzeilen**, in Klammern hinter
  Pfad bzw. Anbieternamen: `(chefin)`. **An den eigenen steht nichts** — er
  stünde nur im Weg. *Daraus folgt ein Satz, den man kennen muss: „kein Name"
  heißt bei mehreren Zugängen „vom Verfasser des Eintrags".* Das Datum steht im
  Überfahrtext.
- **Beide Löschdialoge zählen die Links jetzt mit** — der am Eintrag getrennt
  nach eigen und fremd, der am Zugang als eigene Zeile. *Eine Zahl im Dialog,
  die nichts bewirkt, wäre schlimmer als keine:* „Zugang entfernen" mit dem
  Häkchen *seine Beiträge löschen* räumt die Links seitdem wirklich mit weg.
- Export und Import tragen den Namen mit (**Austauschformat 7**).

### Was gleich bleibt

- **Das Umsortieren der Linkliste bleibt beim Verfasser des Eintrags** — die
  Reihenfolge ändert keine Aussage und lässt sich zurücknehmen; dieselbe
  Überlegung wie beim Anpinnen eines Kommentars.
- **Ein gelöschter Link bekommt keinen Vermerk.** Er ist eine ganze Aussage, die
  geht, kein Loch in einer bleibenden — der Eingriffsvermerk am Kommentar bleibt
  auf den einen Fall begrenzt, für den er beschlossen wurde.
- **Fotos bleiben, wo sie sind.** Sie gehören zum Eintrag selbst: das erste Foto
  ist das Hauptbild und damit sein Gesicht in der Übersicht.
- Ältere Exportdateien lassen sich weiterhin einspielen; ein Link aus einer
  Datei der Formatnummer 6 fällt an den **Verfasser des Eintrags**.

### Beim Einspielen

- **Diese Version fasst die Datenbank an — `data` vorher sichern.** Es ist die
  erste Datenbankstufe seit 0.8.3; ohne die Sicherung gibt es keinen Weg zurück
  auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `links um user_id ergaenzt (Migration auf 0.8.30)`. **Vorhandene Links fallen
  dabei dem Verfasser ihres Eintrags zu** — nicht dem Eigentümer der Anlage:
  bis dahin *waren* die Links eines Eintrags die Sache seines Verfassers.
- **Das Austauschformat steht jetzt auf 7.**

---

## 0.8.20 — Die Schotten dicht

**Eine Runde, die nichts Neues kann und mehrere Löcher schließt.** Sie ändert an
der Bedienung nichts — aber sie ändert, was die Anlage einem Aufrufer glaubt.

### Neu

- **Am Fotoplatz entscheidet ab jetzt der Inhalt, nicht die Angabe.** Beim
  Hochladen wird abgewiesen, was **kein Rasterbild ist** — auch dann, wenn es
  sich als Bild ausgibt; beim Ausliefern bestimmen die **ersten Bytes** den Typ.
  *Bis dahin wurde der beim Hochladen gemeldete Typ aus der Datenbank wieder
  ausgeliefert, und eine SVG-Datei besteht die Prüfung `image/…` anstandslos —
  wer ihre Adresse direkt öffnete, bekam Skript im Ursprung der Anwendung.*
- **Die Anwendung selbst bekommt eine `Content-Security-Policy`** — eine zweite
  Verteidigung für denselben Fehler, und sie ist billig, weil die Oberfläche
  nichts von außen nachlädt.
- **`HINTER_PROXY` in der `.env` — neu und optional.** Sie ist ein Ja/Nein und
  entscheidet über **fünf** Dinge auf einmal: ob `X-Forwarded-For` geglaubt
  wird, den Cookienamen, `Secure` am Cookie, `Strict-Transport-Security` und den
  Hinweis in der README. *Ohne sie wird der Kopf nicht einmal angesehen.*
- **Der Container ist sichtbar gesund oder nicht.** Das Image trägt einen
  `HEALTHCHECK`; `docker compose ps` zeigt `healthy`. *Vorher wusste Docker nur,
  dass der Prozess läuft — ein Container in einer Neustartschleife sah von außen
  gesund aus.*
- **Ein Fehler-Handler nach Rang und sauberes Herunterfahren.** Eine Absage aus
  Absicht sieht anders aus als eine Panne, und `docker compose down` schließt
  die Datenbank ordentlich statt sie abzuschneiden.
- Ein **Index auf `sessions.user_id`** — er rüstet sich bei jedem Start selbst
  nach und ist deshalb **keine** Migration.

### Was gleich bleibt

- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr Format.
- **An der Bedienung ändert sich nichts.** Die Oberfläche ist an keiner Stelle
  angefasst worden — die Sicherheitsregel ist so geschnitten, dass sie zu ihr
  passt, nicht umgekehrt.
- **Vorhandene Fotos bleiben vorhanden.** `photos.mime_type` wird weiter
  geschrieben und angezeigt; sie ist ab jetzt eine **Anzeige, keine
  Ausliefergrundlage**.
- **Bei Anhängen wird weiterhin bewusst nicht gefiltert** — eine Positivliste
  wäre dort durch Umbenennen zu umgehen und wiegte in falscher Sicherheit. Die
  Auslieferungsregeln bleiben, wie sie sind.

### Beim Einspielen

- **Nichts Besonderes.** Keine Datenbankstufe, keine neue Abhängigkeit; die
  Sicherung von `data` ist Empfehlung.
- **`HINTER_PROXY` bleibt leer, solange kein Reverse Proxy davorsteht.** Wer sie
  setzt, muss zweierlei wissen: **es meldet alle einmalig ab** (der Cookiename
  wechselt), und **die Anmeldung geht danach nur noch über HTTPS** — ein
  direkter Aufruf von `http://<server-ip>:3100` käme nicht mehr herein.
- **Eine SVG, die vor dieser Version als Foto hereingekommen ist, wird ab jetzt
  heruntergeladen statt angezeigt.** Das ist gewollt: sie ist eine Webseite und
  keine Grafik. Der Eintrag bleibt unangetastet.
- Der Start meldet ab jetzt die Betriebsart: `Hinter Proxy: an` oder
  `Hinter Proxy: aus`.

---

## 0.8.10 — Werkzeug

**Eine Runde für den Bau, nicht für die Anlage.** Sie beantwortet die Frage, die
sich nach jedem Einspielen stellt: *läuft wirklich der neue Dateisatz?*

### Neu

- **Der Fingerprint in der Karte „Kennzahlen".** Ein Wert über **alles**, was
  der Server lädt und ausliefert. Stimmt er mit dem der Version überein, ist die
  Kopie vollständig; stimmt er nicht, war sie es nicht oder es wurde nicht neu
  gebaut. *Bis dahin gab es dafür nur eine Textstelle je Version, die man von
  Hand suchen musste.* **Er schlägt in beide Richtungen aus** — bei einer Datei
  zu wenig wie bei einer zu viel.
- **Der Bau ist wiederholbar.** `package-lock.json` liegt jetzt im Repo, und das
  Image baut mit `npm ci` statt `npm install`. *Ohne den Wechsel läge die Datei
  da und würde beim Bauen übergangen — ein Merker, der nichts bewirkt.*
- **`sharp` auf 0.35.3, das Image auf Node 22.**
- **Der Prüfstand lässt sich in Gruppen aufrufen und läuft bei jedem Push.**

### Was gleich bleibt

- **An der Anlage ändert sich nichts** — keine Rolle, kein Recht, kein
  Endpunkt, kein Schema, keine neue Einstellung. Die einzige sichtbare Änderung
  ist die eine Zeile im Systembereich.
- Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Wie immer, und das `--build` ist diesmal wichtiger als sonst:** es holt die
  festgeschriebenen Abhängigkeiten und das neue Node-Image.
- **Keine Sicherungspflicht** — die Datenbank wird nicht angefasst.
- **Danach lohnt der erste Blick auf den Fingerprint.** Er steht in der Karte
  „Kennzahlen" und über `curl -s -b cookies.txt .../api/stats`; der erwartete
  Wert steht im Änderungsprotokoll jeder Version.

---

## 0.8.6 — Berichtigungen aus dem Betrieb

**Fünf Dinge, die beim Ansehen der vorigen Version aufgefallen sind.** Kein
Schema, keine neue Route.

### Neu

- **Wer welchen Wert vergeben hat, sieht nur noch der Admin.** Die Sternzeile
  zeigt den **eigenen Wert und den Schnitt** — mehr soll eine Bewertung nicht
  aussagen. Die Namensliste ruft der Admin über den Knopf **„Wer hat bewertet"**
  im Blockkopf auf; dort entfernt er auch eine fremde Bewertung. **Die Note
  ändert er nicht.** *Der Knopf erscheint erst ab zwei Zugängen — bei einem wäre
  die Ansicht der eigene Wert ein zweites Mal.*
- **Die Linkliste wird abgeschnitten statt scrollbar.** Auf dem Finger scrollt
  damit immer die Seite; der Weg zum Rest ist der Knopf „alle N anzeigen", den
  es längst gibt.
- **Die Lücke im Kartenraster ist weg.** Die breite Kachel „Zugänge" ließ je nach
  Fensterbreite eine Lücke davor; das Raster zieht jetzt eine nachfolgende
  schmale Karte selbst hinein.
- **In der Kopfzeile steht, wer angemeldet ist** — neben „Abmelden", und **auch
  bei einem einzigen Zugang**: das ist eine Aussage über einen selbst, nicht
  über andere.
- **„Angelegt von" nennt auch das Datum**, in derselben Form wie die Kopfzeile
  eines Kommentars.

### Was gleich bleibt

- **Der Schnitt und die Zahl der Bewerter bleiben für jeden sichtbar** — sie
  sind keine Aussage über eine Person.
- **Am Löschweg für eine fremde Bewertung ändert sich nichts**; er ist nur
  mitgewandert. *Wäre die Liste ersatzlos verschwunden, wäre er vom Bildschirm
  aus unerreichbar geworden — die neue Ansicht ist deshalb kein Zusatz, sondern
  die Bedingung.*
- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr Format.

### Beim Einspielen

- **Nichts Besonderes.** Keine Datenbankstufe, keine neue Einstellung, keine
  neue Abhängigkeit.

---

## Ältere Versionen — 0.8.5 und davor

**Für diese Versionen gab es noch kein Changelog.** *Sie werden hier nicht
nacherzählt: die Nummern stehen vollständig im Projektstand, Abschnitt 9, und
was von ihnen als Regel weitergilt, in Abschnitt 5.* Die Zeile je Version ist
die folgende — **damit keine Version ohne Eintrag bleibt**:

| Version | Was |
|---|---|
| **0.8.5** | Der Systembereich lernt die Rechte: dreizehn Karten nach Rolle, Kennzahlen nur noch für den Admin, Karte „Links" in zwei geschnitten |
| **0.8.4** | Eingriffsvermerk nennt die Rolle, „bearbeitet" an den Bildwegen des Verfassers, Zahlen am Kommentarblock, die beiden Anlegen-Schalter für Tags und Kategorien, Umschalter „meine/alle" im Vergleich |
| **0.8.3** | Eingriffsvermerk am Kommentar (Datenbankstufe), Kennzeichnung eigener Kommentare, blaue Aufgabenmarke, Tagwolke klappt ganz auf |
| **0.8.2** | Verfassernamen an Eintrag, Kommentar, Testtag und Bewertung; Löschdialog am Eintrag mit Zahlen; eine fremde Bewertung lässt sich löschen |
| **0.8.1** | Bereinigung: aller Migrationscode entfernt, Schema als vollständige DDL. **Ab hier wird eine Datenbank aus 0.8.0 oder neuer vorausgesetzt** |
| **0.8.0** | Karte „Zugänge", drei Rollen als Leiter, Sperren, Anmeldebremse je Name, **Löschen entwertet statt zu löschen**, `zugang.js` auf dem Wirt statt `AUTH_RESET` |
| **0.7.2** | Rechteschicht serverseitig an jedem schreibenden Endpunkt; Export und Import nur für den Eigentümer |
| **0.7.1** | Export und Import tragen Verfassernamen (Austauschformat 6) |
| **0.7.0** | Eigene Sterne neben Schnitt und Bewerterzahl, zweistufiger Gesamtschnitt, Kriterien nur noch im Systembereich |
| **0.6.6** | Am Eintrag heißt es „Favorit"; er sortiert nicht mehr vor und bekommt einen eigenen Filter |
| **0.6.5** | Persönliche Einstellungen: Filterwahl, Schriftgröße, Blockanordnung und drei weitere gehören ab jetzt dem Einzelnen |
| **0.6.4** | Berichtigung: der Favoriten-Knopf zeichnete sich nach dem Klick nicht neu |
| **0.6.3** | Der Favorit steht je Benutzer; Anheften rührt das Änderungsdatum nicht mehr an |
| **0.6.2** | Zwei Leute am selben Datum sind zwei Testtage; jeder hat seine eigene Bewertungszeile |
| **0.6.1** | Eintrag, Kommentar und Testtag bekommen einen Verfasser |
| **0.6.0** | Grundlage des Mehrbenutzerbetriebs: Rolle, Adresse, Status und letzte Anmeldung am Zugang |
| **0.5.11** | Mehrere Suchanbieter je Suchzeile |
| **0.5.10** | Umbenennung auf „Kriterion", ohne jede Funktionsänderung |
| **0.5.9** | Erledigt-Zustand für Aufgaben |
| **0.5.8** | Kriterien werden nur noch im Systembereich gelöscht |
| **0.5.7** | Dritte Kommentarart: Aufgabe |
| **0.5.6** | Zoom im Vollbild startet in der Mitte |
| **0.5.5** | Kennzeichnung von Art und Anheftung am Kommentar |
| **0.5.4** | Links im Kommentartext sind anklickbar |
| **0.5.3** | Eine Suchzeile, die keine Adresse ist, führt zum Suchanbieter |
| **0.5.2** | Innerhalb jeder Kommentargruppe steht das Älteste oben |
| **0.5.1** | Der Ausschnitt-Modus ließ sich nicht verlassen |
| **0.5.0** | Erstanmeldung; der Zugang liegt als Hash in der Datenbank statt in der Umgebung |
| **0.4.10** | Versionsnummer auf der Anmeldeseite |
| **0.4.9** | Sprung beim Bearbeiten der Beschreibung behoben |
| **0.4.8** | Handy-Paket, zweiter Teil; die Filterwahl sprang beim Zurückgehen zurück |
| **0.4.7** | Handy-Paket: Ziehen erst nach Halten, Zeilenaktionen als Zeichen, Schriftskala 80–120 |
| **4.5** | Und/Oder-Verknüpfung der Tagfilter |
| **4.4.2** | Dateizeilen reagieren als Ganzes auf einen Klick |
| **4.4.1** | PDF-Vorschau blieb leer, Löschkreuz war unsichtbar |
| **4.4** | Anhänge am Eintrag |
| **4.3** | Tags an Testtagen, Zeitleiste, Blöcke anordnen, Tagwolken aufklappbar |
| **4.2** | Schriftgröße einstellbar, anpassbares Vokabular |
| **4.1** | Bewertungskriterien pflegen, mitwachsende Felder, Prüfstand |

*Alles davor — 4.0 und älter — ist nicht mehr dokumentiert und wird nicht mehr
berücksichtigt: eine Datenbank aus jener Zeit lässt sich seit 0.8.1 ohnehin
nicht mehr übernehmen.*

---

<!-- DIE VERGLEICHSVERWEISE. Sie hängen an den Git-Tags. Ältere Tags gibt es
     zwar (0.8.3 bis v0.8.91), aber die Reihe ist lückenhaft und die
     Schreibweise uneinheitlich — verlässlich verlinkbar ist sie erst ab
     0.10.0. Ab 0.11.0 steht deshalb ein echter Vergleich; für alles vor
     0.10.0 bleibt das Änderungsprotokoll in `Doku/` das Ziel.
     `v0.10.0` liegt am Remote und trägt. ACHTUNG: ab `v0.11.0` fehlen sie alle
     am Remote; solange das so ist, zeigen die Verweise darunter ins Leere.
     SEIT DEM 30. AUGUST 2026 IST ENTSCHIEDEN, DASS KEINE TAGS MEHR GESETZT
     WERDEN -- weder die ausstehenden noch kuenftige (Projektstand,
     Abschnitt 8). Die Verweise bleiben trotzdem stehen: sie sind Teil der Form
     dieser Datei, und wer die Tags eines Tages doch setzt, findet sie fertig
     vor. Die Versionen sind ueber diese Datei, die Aenderungsprotokolle und
     den Fingerprint eindeutig bestimmt.
     DER GRUND IST SEIT 0.12.4 BEKANNT UND WAR VORHER FALSCH NOTIERT: es ist
     KEIN Problem der GitHub-Rechte. Der Git-Proxy der Arbeitsumgebung, in der
     Claude laeuft, weist `POST /git-receive-pack` mit `refs/tags/*` mit 403
     ab -- ohne einen einzigen GitHub-Header, GitHub sieht die Anfrage nie.
     `refs/heads/*` geht durch dieselbe Route ohne weiteres durch.
     Die Tags muessen deshalb vom Rechner des Betreibers gesetzt werden; die
     Befehle stehen im Projektstand, Abschnitt 8. -->
[0.10.0]: https://github.com/fardem/kriterion/releases/tag/v0.10.0
[0.11.0]: https://github.com/fardem/kriterion/compare/v0.10.0...v0.11.0
[0.12.0]: https://github.com/fardem/kriterion/compare/v0.11.0...v0.12.0
[0.12.1]: https://github.com/fardem/kriterion/compare/v0.12.0...v0.12.1
[0.12.2]: https://github.com/fardem/kriterion/compare/v0.12.1...v0.12.2
[0.12.3]: https://github.com/fardem/kriterion/compare/v0.12.2...v0.12.3
[0.12.4]: https://github.com/fardem/kriterion/compare/v0.12.3...v0.12.4
[0.13.0]: https://github.com/fardem/kriterion/compare/v0.12.4...v0.13.0
[0.13.1]: https://github.com/fardem/kriterion/compare/v0.13.0...v0.13.1
[0.13.2]: https://github.com/fardem/kriterion/compare/v0.13.1...v0.13.2
[0.14.0]: https://github.com/fardem/kriterion/compare/v0.13.2...v0.14.0
[0.15.0]: https://github.com/fardem/kriterion/compare/v0.14.0...v0.15.0
[0.15.1]: https://github.com/fardem/kriterion/compare/v0.15.0...v0.15.1
[0.16.0]: https://github.com/fardem/kriterion/compare/v0.15.1...v0.16.0
[0.17.0]: https://github.com/fardem/kriterion/compare/v0.16.0...v0.17.0
[0.17.1]: https://github.com/fardem/kriterion/compare/v0.17.0...v0.17.1
