# Auftrag 0.28.0 — „Das Telefon bekommt Recht"

**Sieben Befunde am Telefon, dazu das Blättern im Eintrag und das
Startbildzeichen · geschrieben am 11. September 2026 · gebaut auf 0.27.0.**

---

## Was in dieser Runde passiert

**Kriterion ist am Telefon benutzbar, aber es ist dort nicht zu Hause.** *Die
Durchsicht für Telefon und Tablett hat sechs Dinge gemessen und **bewusst
stehen gelassen** — keines davon ist neu entstanden, jedes gab es vorher
genauso.* **Diese Runde holt sie nach.**

**DER SIEBTE BEFUND KOMMT NICHT VON DORT.** *Er ist am 11. September 2026 am
laufenden Gerät entstanden — die Bedienelemente sind am Finger so groß, dass
eine einzige Pillenreihe den halben Schirm nimmt, und die aufgeklappte
Sortierung passt überhaupt nicht darauf.* **Er bekommt keine eigene Runde,
sondern fährt hier mit:** er stellt dieselbe Frage wie die sechs anderen — was
am Telefon nicht aufgeht. *Ausdrücklich so gewollt (Betreiber, 11.9.):* „am
liebsten in ein bestehenden zusammen damit der rundenanzahl nicht so sehr
wächst.“

**DER KERN IST EINE GEMEINSAME KOPFZEILE.** *Eintrag, Systembereich, Offene
Aufgaben und Vergleich tragen heute nur „← Zurück zur Übersicht"
(`public/app.js:4407`, `:4567`, `:5151`, `:8077`).* **Suche, Menü und
„+ Eintrag" gibt es dort nicht** — am Desktop fällt das kaum auf, am Telefon
ist der Weg von einem Eintrag zur Suche **zwei Griffe statt einem**.

**UND AN DIESER KOPFZEILE HÄNGT DER ZWEITE PUNKT.** *Das Blättern im Eintrag —
vor und zurück in der Reihenfolge der Übersicht — braucht einen Ort für seine
zwei Pfeile.* **Ohne die Kopfzeile gäbe es keinen; mit ihr kostet es zwei
Zeichen.** Das ist der einzige Grund, aus dem die beiden Punkte in einer Runde
stehen.

> **DAS BLÄTTERN IST KEIN TELEFONPUNKT, und dieser Auftrag hat es zuerst so
> gerahmt — falsch.** *Berichtigt vom Betreiber am 11. September 2026:* „blättern
> am eintrag gilt nicht nur für das telefon. nur da hast du den einwand
> gebracht das das swipen dort schon für die bilder ist."
>
> **ES IST EIN PUNKT FÜR JEDES GERÄT.** *Am Schirm ist der Weg heute: zurück zur
> Übersicht, die Stelle wiederfinden, den nächsten öffnen — bei einem Rundlauf
> über zehn Einträge zwanzigmal derselbe Weg.* **Nur die GESTENFRAGE ist eine
> des Telefons**, und sie ist der Grund, aus dem der Punkt am 7. September nicht
> durchgewunken wurde. *Er fährt in dieser Runde mit, weil die Kopfzeile hier
> entsteht — nicht, weil er ein Telefonpunkt wäre.*

> **DER WUNSCH ZUM BLÄTTERN KOMMT AUS DEM BETRIEB, 7. September 2026:**
> *„Blättern in der Eintragsansicht durch die Pfeiltasten rechts/links. Also
> zum nächsten Eintrag der vorhergehenden Filter- und Sortieransicht im
> Overview. Ohne dass man immer zurück zur Übersicht muss."*
>
> **ER IST AM 7. SEPTEMBER AUSDRÜCKLICH NICHT DURCHGEWUNKEN WORDEN** — die
> Pfeiltasten sind in dieser Ansicht schon belegt. **Der Betreiber hat die
> Tastenfrage am 8. September entschieden:** *„die Idee mit den Pfeiltasten
> können wir wegnehmen, eventuell mit Bild ab und auf"*, und dazu *„vielleicht
> feine Pfeile an der linken und rechten Seite, oben, was kaum Platz nimmt."*
> **Die Form steht damit; diese Runde baut sie.**

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Am Arbeitsbaum nachgerechnet** *(11. September 2026)* | **`9f6741b5`** |
| **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`9f6741b5`** |
| **Aus der laufenden Installation gemeldet** *(Betreiber, 11. September 2026)* | **`9f6741b5`** |

> **DREI QUELLEN, EIN WERT — UND DIE DRITTE IST DIE STÄRKSTE.** *Sie ist keine
> dritte Rechnung, sondern der Beweis: das Eingespielte ist dasselbe wie das
> Gebaute.* **Zum ersten Mal in dieser Reihe liegt der Fingerprint des
> Vorgängers vor dem Schreiben des nächsten Auftrags bestätigt vor.**

**Der Vorgänger im Überblick:** 0.27.0 · **6497 Prüfungen** · **815
Rückbauten** · `F_ROUTES` = **72** · Austauschformat `EXCHANGE_FORMAT` = **15**
· **elf** markierte Migrationsblöcke · **neunzehn** Karten.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **DIE SPALTE „VORSCHLAG VON CLAUDE" IST EIN VORSCHLAG UND KEINE ANTWORT.**
> *Gebaut wird erst, wenn jede Frage beantwortet und in diesem Papier
> eingetragen ist* (Projektstand, Abschnitt 11).
>
> **IN 0.27.0 IST DIESE REGEL GEBROCHEN WORDEN** — die Tafel wurde nach dem
> Bauen durchgegangen. *Neun der zehn Antworten fielen wie vorgeschlagen, eine
> nicht; es hat trotzdem drei Anläufe an einem einzigen Satz gekostet.*
> **Diese Runde wartet.**
>
> **SIE HAT GEWARTET, UND DIE TAFEL IST BEANTWORTET** — *vom Betreiber am
> 11. September 2026, vor der ersten geänderten Zeile.* **Vierzehn der
> siebzehn Antworten fielen wie vorgeschlagen; drei nicht:** *F4 wurde
> ausgeweitet, F8 auf die andere Einstellung berichtigt, F12 entfiel, weil
> der Betreiber die Taste gestrichen hat.* **Dazu kamen vier Berichtigungen
> aus dem Quelltext — sie stehen im Abschnitt darunter.**

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Was trägt die gemeinsame Kopfzeile?** *Die Übersicht hat heute Marke, Zähler, Suchfeld, Glocke, Menü und „+ Eintrag" (`masthead`, `public/app.js:3178`).* **Alles davon in vier Unteransichten wäre viel** | **Vier Dinge: Zurück, Marke, Suchfeld, Menü.** *Kein Zähler (er zählt die Übersicht, nicht die Ansicht), kein „+ Eintrag" (wer einen Eintrag liest, legt selten einen an — und das Menü hat den Weg), keine Glocke (sie ist eine Auskunft über den Bestand und gehört dorthin, wo der Bestand steht).* **Die Suche springt zur Übersicht und setzt den Begriff** — sie sucht nicht in der Unteransicht |**Wie vorgeschlagen — und die zwei Blätterpfeile flankieren die Marke.** *Zurück · ‹ Marke › · Suchfeld · Menü.* **Kein Zähler, kein „+ Eintrag", keine Glocke.** *Die Pfeile stehen nur im Eintrag — im Systembereich, in den offenen Aufgaben und im Vergleich gibt es nichts zu blättern; dort trägt die Kopfzeile vier Dinge statt sechs.* **Beantwortet vom Betreiber am 11. September 2026** |
| **F2** | **Woher kommt die Reihenfolge beim Blättern, und wie lange hält sie?** *`state.items` (`public/app.js:2349`) lebt im Browser und überlebt einen Wechsel der Ansicht — aber keinen Neustart und keinen Direkteinstieg über die Adresse* | **Aus `state.items`, und sie hält genau so lange wie die Sitzung im Browser.** *Wer einen Eintrag über seine Adresse aufruft oder neu lädt, hat keine Reihenfolge — dann sind die Pfeile **gedämpft und nicht anklickbar**.* **Das ist ehrlicher als eine erfundene Reihenfolge und kostet nichts.** Ausdrücklich **kein Speichern** der Reihenfolge und **keine Nachfrage am Server** |**Wie vorgeschlagen.** *Aus `state.items`, und sie hält genau so lange wie die Sitzung im Browser.* **Kein Speichern, kein `sessionStorage`, keine Nachfrage am Server** — der Direkteinstieg über die Adresse zeigt beide Pfeile gedämpft. **Beantwortet am 11. September 2026** |
| **F3** | **Was, wenn sich der Bestand ändert, während man blättert?** *Ein gelöschter Eintrag, ein neuer Testtag, eine geänderte Sortierung* | **Nichts.** *Die Reihenfolge ist die des letzten Zeichnens der Übersicht und wird nicht nachgezogen.* **Führt ein Pfeil auf einen Eintrag, den es nicht mehr gibt, sagt die Ansicht das** — dieselbe Antwort wie heute beim Direkteinstieg auf eine tote Nummer |**Wie vorgeschlagen: nichts.** *Kein Überspringen gelöschter Einträge — ein Klick, der manchmal einen und manchmal drei Schritte macht, erklärt sich nicht.* **Die tote Nummer bekommt dieselbe Meldung wie heute** (`server.entryUnknown`). **Beantwortet am 11. September 2026** |
| **F4** | **Die Behälterabfrage (`@container`) — nur für die eine Zeile oder gleich breiter?** *Das Stilblatt kennt heute **17** Fensterabfragen und **null** Behälterabfragen* | **Nur für die eine Zeile, und der Rest bleibt.** *Ein neues Werkzeug führt man an einer Stelle ein und sieht es sich an; siebzehn Abfragen umzubauen wäre eine eigene Runde mit eigener Gegenprobe.* **Der Satz „hier ist das Werkzeug, hier ist sein erster Einsatz" gehört in den Kopf des Stilblatts** |**NICHT wie vorgeschlagen — der Betreiber will den ganzen Systembereich** *(11. September 2026)*. **Nachgemessen, und es ist kleiner als es klingt: DREI Gruppen, nicht zehn.** *`.log-list`/`.log-row`/`.log-time` (fünf Regeln), `.vocabulary-grid`, und die Reihe des Mailversands — alle drei hängen an der Breite der KARTE.* **Was ausdrücklich NICHT umgestellt wird, weil es dann falsch wäre:** `.sys-grid` *(wieviele Spalten auf den SCHIRM passen — ein Behälter kann sich nicht selbst fragen)*, `.sys-card` am Telefon *(die Seite wird zur Telefonseite)*, alles im Finger-Abschnitt *(eine Frage an den ZEIGER)*, `max-height: 62dvh` *(die HÖHE des Fensters)*. **Jede Regel, die stehenbleibt, bekommt den Satz daneben, warum sie eine Fensterfrage bleibt** |
| **F5** | **Der Text unter dem Ablegefeld — der Fahrplan nennt ihn überholt?** *Er spricht von „fünf Zeilen, die Hälfte geht ins Leere". **Nachgesehen: es sind drei Sätze, und genau EINER nennt etwas, das es am Telefon nicht gibt** (`entry.addMediaHint`: „oder mit Strg+V einfügen")* | **Der Punkt schrumpft auf einen Halbsatz, und das steht so im Protokoll.** *0.22.0 hat die fünf Sätze auf einen gekürzt, 0.27.0 einen zweiten dazugestellt.* **Zu tun bleibt: „mit Strg+V einfügen" gilt am Telefon nicht.** Eine Fassung für beide, keine Weiche |**Wie vorgeschlagen.** *„oder mit Strg+V einfügen" fällt; übrig bleibt „Fotos und Videos hinzufügen — mehrere möglich".* **Eine Fassung für beide Geräte, keine Weiche, kein zweiter Schlüssel.** *Das Einfügen selbst bleibt — es wird nur nicht mehr angesagt.* **Beantwortet am 11. September 2026** |
| **F6** | **Die Meldung über der Vergleichsleiste** *(`.toast` bei `bottom: 22px`, `.cmp-bar` bei `bottom: 20px` — beide unten)*. Das Sammelblatt sagt **„später — der Aufwand steht nicht im Verhältnis"** | **Gebaut, und zwar weil er jetzt billig ist.** *Die Runde fasst das Stilblatt ohnehin an und führt mit `@container` ein neues Werkzeug ein; `body:has(.cmp-bar)` ist eine Zeile.* **Wer ihn weiter liegen lässt, muss ihn beim nächsten Mal wieder bewerten** |**Wie vorgeschlagen: jetzt gebaut.** *`body:has(.cmp-bar)` hebt die Meldung an, solange die Vergleichsleiste dasteht.* **Beantwortet am 11. September 2026** |
| **F7** | **Das Startbildzeichen: welche Größen, welcher Name, welche Farbe?** | **Eine `manifest.json`, das vorhandene `favicon.svg` als Zeichen, `name` aus dem Titel der Installation, `theme_color` aus `--bg`.** *Kein zweites Bildformat: eine SVG trägt vom 16-Pixel-Tab bis zum Startbildschirm.* **Ausdrücklich kein Arbeiter im Hintergrund und kein Zwischenspeicher** — ein Zwischenspeicher, der eine alte Fassung ausliefert, wäre in einer Instanz mit Fingerprint das Gegenteil von hilfreich |**Wie vorgeschlagen, und die drei offenen Stücke sind entschieden:** *`favicon.svg` als einziges Zeichen — kein zweites Bildformat, keine PNG daneben. `theme_color` und `background_color` nehmen das DUNKLE `--bg` (`#0e1012`), weil Dunkel die Vorgabe ist und derselbe Wert schon in `index.html` steht. `display: standalone`.* **Kein Arbeiter im Hintergrund, kein Zwischenspeicher.** **Beantwortet am 11. September 2026** |
| **F8** | **Der Titel der Installation ist eine EINSTELLUNG** *(`title_app`)* — eine `manifest.json` als feste Datei kann ihn nicht tragen | **Der Server liefert sie, nicht die Platte.** *Eine Route mehr oder eine vorhandene erweitern — siehe F9.* **Eine feste Datei mit „Kriterion" darin wäre eine zweite Wahrheit über den Namen der Installation** |**BERICHTIGT — der Auftrag nennt die falsche Einstellung.** *Es gibt ZWEI Titel:* `title_public` *(Vorgabe „Bewertungskatalog") steht schon heute vor der Anmeldung in `/api/config`;* `title_app` *(Vorgabe „Model Bewertungen") ist der Name in der Kopfzeile und kommt erst NACH der Anmeldung über `/api/settings`.* **Das Manifest trägt `title_public`** — *entschieden vom Betreiber am 11. September 2026.* **Damit kommt keine neue Offenlegung dazu:** der Kommentar an `/api/config` sagt ausdrücklich „die Liste bleibt abgeschlossen — was hier auftaucht, sieht jeder, der die Adresse kennt", und `title_public` steht ohnehin schon darin |
| **F9** | **Wird ein neuer Weg gebraucht?** `F_ROUTES` steht bei **72** | **Ja, genau einer: `GET /api/manifest.json`** *(oder `/manifest.json`)*. **`F_ROUTES` geht auf 73.** *Sie ist lesend und braucht keine Anmeldung — der Browser holt sie, bevor jemand angemeldet ist. Sie trägt den Titel, der ohnehin schon vor der Anmeldung in `/api/config` steht, und sonst nichts* |**Ja, genau einer: `GET /api/manifest.json`** — *lesend, ohne Anmeldung, der Browser holt sie bevor jemand angemeldet ist.* **ABER: `F_ROUTES` GEHT NICHT AUF 73, UND KANN ES GAR NICHT.** *`F_ROUTES` (`testbench.js:16039`) ist die Liste der SCHREIBENDEN Routen; `writingRoutes()` (`:16243`) sammelt ausschließlich `app.post(`, `app.put(`, `app.delete(` ein.* **Eine lesende Route taucht dort überhaupt nicht auf — die Zahl bleibt 72.** *Nachgezählt am 11. September 2026: 72 schreibende und 30 lesende Routen im Server; für die lesenden führt der Prüfstand kein Verzeichnis.* **Die neue Route wird stattdessen durch drei eigene Zusagen festgenagelt** *(Titel DIESER Installation, ohne Anmeldung erreichbar, kein `service worker` im Quelltext).* **Das Verzeichnis der lesenden Routen ist eine echte Lücke und gehört auf das Sammelblatt — nicht in diese Runde** |
| **F10** | **Die vier Unteransichten haben eigene Prüflagen. Wie viel wächst der Prüfstand?** | **Geschätzt fünfzig bis achtzig Zusagen**, und das ist die teuerste Hälfte der Runde. *Die Kopfzeile muss in allen vier Ansichten geprüft werden, das Blättern in vier Lagen (Anfang, Mitte, Ende, ohne Reihenfolge), dazu Tastatur und das Manifest.* **Die Zahl steht im Protokoll, nicht hier** |**Geschätzt wurden rund 45 bis 60; gefahren werden 73** *(6497 → 6570)*. **Die Schätzung lag zu niedrig, und der Grund sind die Schleifen:** *im Quelltext stehen 65 neue `check(`-Zeilen, aber die vier Unteransichten werden mit je zwei Zusagen durchgegangen und die drei Sprachen mit je drei.* **Es fielen weg:** `Bild auf`/`Bild ab` *(die Taste ist gestrichen)* und die `F_ROUTES`-Zahl *(B1)*. **Es kamen dazu:** drei Behälterabfragen statt einer *(F4)*, und **vier Zusagen mussten neu geschrieben werden, weil sie Kommentare mitlasen statt den Gegenstand** |
| **F11** | **Die Nummer: 0.28.0 als MINOR — richtig?** | **Ja, MINOR.** *Die Installation kann danach etwas, was sie vorher nicht konnte: von einem Eintrag zum nächsten blättern, und sich als Anwendung auf einen Startbildschirm legen.* **Das sind zwei Funktionen; die sechs Befunde allein wären ein PATCH** |**Ja, MINOR.** *Bestätigt vom Betreiber am 11. September 2026.* **Zwei Funktionen kommen dazu**, die sieben Befunde allein wären ein PATCH |
| **F12** | **Soll der FOKUS entscheiden, worauf die Pfeiltasten wirken?** *Vorschlag des Betreibers (11.9.): ein angewähltes Bild zieht den Fokus, dann blättern die Pfeile in den Bildern; ist der Fokus woanders, wechseln sie den Eintrag* | **Nein — und das ist eine Empfehlung gegen den Vorschlag.** *Dieselbe Taste täte dann zwei verschiedene Dinge, und WELCHES sie tut, hängt an einem Zustand, den man vor dem Drücken nicht sieht.* **Das ist ein verdeckter Modus, und es ist genau die Bauform, die dieses Projekt sonst überall vermeidet** (Stolperstein 47, in Bedienform). *Draussen wird es auch nicht so gemacht: wo zwei Reihen ineinanderliegen, bekommt die INNERE die Handlung AM Bild (Wischen, Pfeile auf dem Bild) und die ÄUSSERE eine eigene Bedienung DANEBEN — Google Photos, Lightroom, jede Bildergalerie.* **Die Entscheidung vom 8. September ist genau diese Aufteilung** und bleibt: Pfeiltasten bei den Bildern, `Bild auf`/`Bild ab` am Eintrag, dazu die zwei Pfeile in der Kopfzeile. **Eine Taste, eine Bedeutung** |**ENTFÄLLT.** *Die Frage setzte voraus, daß eine Taste den Eintrag blättert.* **Der Betreiber hat `Bild auf`/`Bild ab` am 11. September 2026 gestrichen** — *„oh ja bei langen koimmentaren braucht man bild ab… das können wir nicht nehmen"* — **und in dieser Runde blättert ÜBERHAUPT KEINE Taste den Eintrag.** *`←` und `→` bleiben ungeteilt bei den Bildern; es gibt nichts umzuschalten.* **Die Empfehlung gegen den verdeckten Modus bleibt trotzdem stehen** — sie gilt für jede spätere Runde, die eine Taste nachliefert |
| **F13** | **Soll sich das Blättern abschalten lassen?** *Der Betreiber (11.9.): „falls mir der platz den es wegnimmt zu viel wird … es sei denn du hast eine geniale lösung"* | **Erst ansehen, dann entscheiden — und der Platz ist die Antwort.** *Die Pfeile kosten **keine** eigene Zeile: sie sitzen in der Kopfzeile, die diese Runde ohnehin baut, links und rechts vom Titel. Es ist genau der Vorschlag des Betreibers vom 8. September — „feine Pfeile an der linken und rechten Seite, oben, was kaum Platz nimmt."* **Höhe kommt keine dazu.** Deshalb: **ohne Schalter bauen, ansehen, und den Schalter nachliefern, wenn er nach dem Ansehen noch gewollt ist.** *Ein Schalter, den niemand braucht, ist eine Einstellung, die fuer immer gepflegt werden muss — und die Karte hätte danach einen Schalter für zwei Zeichen* |**Wie vorgeschlagen: ohne Schalter bauen, ansehen, danach entscheiden.** *Bestätigt vom Betreiber am 11. September 2026.* **Höhe kommt keine dazu** — die Pfeile sitzen in der Kopfzeile, die diese Runde ohnehin baut |
| **F14** | **Wie viel kleiner wird die Pille am Finger?** *Heute `10px 15px` (41 px hoch) gegen `5px 12px` am Zeiger (31 px)* | **`7px 13px` — 35 px, und damit über dem Zeigermaß.** *Die Reihe verliert je Zeile sechs Pixel; bei fünf Zeilen sind das dreißig.* **Nicht auf das Zeigermaß zurück:** der Finger ist breiter als ein Mauszeiger, und diese Runde nimmt ihm nicht weg, was er gebraucht hat. *Der Und/Oder-Umschalter daneben (`.pill-mode`) bleibt kleiner als die Pillen — das Verhältnis stimmt heute und soll stimmen bleiben* |**Wie vorgeschlagen — und der Umschalter muß mit.** *`.pill` geht auf `7px 13px` (35 px).* **NACHGERECHNET: `.pill-mode` stünde dann bei `7px 12px` GENAU SO HOCH wie die Pille** — *der Satz „er bleibt kleiner als die Pillen daneben" wäre nicht mehr wahr.* **Also geht `.pill-mode` auf `5px 11px`** *(31 px, vier Pixel niedriger statt null, und weiter über seinem Zeigermaß `3px 9px`)*. **Entschieden vom Betreiber am 11. September 2026** |
| **F15** | **Fallen die Auswahlfelder aus der Zoomregel?** *Sie stehen bei `style.css:3388` mit den Eingabefeldern zusammen unter `font-size: max(16px, 1rem)`* | **Ja — `.select`, `.select-sm` und `.mrow.user select.user-role-sel`.** *Ein Auswahlfeld nimmt keinen Schreibstrich: es öffnet die Auswahl des Systems, und der Browser hat dort nichts, wogegen er hineinzoomen könnte.* **Die Eingabefelder bleiben ausnahmslos drin.** *Die Zusage bei `testbench.js:1893` wird **neu geschrieben und nicht gelöscht**: sie prüft künftig beides — Eingabefelder drin, Auswahlfelder draußen* |**Wie vorgeschlagen.** *`.select`, `.select-sm` und `.mrow.user select.user-role-sel` fallen aus der Zoomregel; die Eingabefelder bleiben ausnahmslos drin.* **Die Zusage bei `testbench.js:1893` wird neu geschrieben und nicht gelöscht** *(Stolperstein 201)*. **Und eine Einschränkung, die gemessen sein will:** *der Betreiber hat am 11. September 2026 bestätigt, daß die drei Aufnahmen von einem Android-Gerät mit Chrome stammen.* **Dort erbt die aufgeklappte Liste die Schriftgröße des Feldes, und die Maßnahme wirkt vollständig** — *auf einem iPhone zeichnet iOS die Liste mit der Schrift des SYSTEMS; dort würde nur das Feld kleiner, nicht die Liste. Das gehört in den Augenschein und nicht in eine Zusage* |
| **F16** | **Und das Datumsfeld?** *`.test-add input[type=date]` steht in derselben Zeile, öffnet am Telefon aber ebenfalls eine Auswahl des Systems* | **Es bleibt drin.** *Ein Datumsfeld trägt den Schreibstrich, den ein `<select>` nicht hat — auf dem Schreibtisch immer, auf manchen Telefonen auch.* **Im Zweifel für die Regel:** das Feld ist eines von wenigen und steht an einer Stelle, die Pillenreihe steht überall |**Wie vorgeschlagen: es bleibt drin.** *Bestätigt vom Betreiber am 11. September 2026.* **Im Zweifel für die Regel** |
| **F17** | **Wird die Dichte eine Einstellung?** *Der Betreiber wünscht „eine etwas filigranere darstellung“ — das ließe sich auch schaltbar bauen* | **Nein.** *Eine Dichte-Einstellung wäre eine zweite Wahrheit über jedes Maß im Stilblatt und müsste für immer mitgepflegt werden* (Stolperstein 47). **Ein Maß, das stimmt, braucht keinen Schalter** — und wenn es nach dem Augenschein nicht stimmt, wird es geändert und nicht verdoppelt. *Dieselbe Antwort wie F13, aus demselben Grund* |**Wie vorgeschlagen: nein.** *Bestätigt vom Betreiber am 11. September 2026.* **Ein Maß, das stimmt, braucht keinen Schalter** — und wenn es nach dem Augenschein nicht stimmt, wird die ZAHL geändert und nicht verdoppelt |

---

## Was der Quelltext anders zeigt als dieses Papier

> **DIESER AUFTRAG VERLANGT ES SELBST:** *„das Papier wird gegen den Quelltext
> geprüft, nicht geglaubt."* **Vier Stellen halten dem nicht stand.** *Die
> Herleitung bleibt unten stehen, wo sie steht; was gilt, steht hier.*

| | das Papier sagt | der Quelltext zeigt |
|---|---|---|
| **B1** | **„`F_ROUTES` geht von 72 auf 73"** *(F9, BA 6, Zusage 15)* | **Die Zahl bleibt 72, und 73 kann gar nicht kommen.** *`F_ROUTES` (`testbench.js:16039`) führt ausschließlich SCHREIBENDE Routen; `writingRoutes()` (`:16243`) sammelt nur `app.post(`, `app.put(`, `app.delete(`.* **`GET /api/manifest.json` ist lesend und taucht dort nie auf.** *Nachgezählt: 72 schreibende, 30 lesende Routen — für die lesenden gibt es kein Verzeichnis.* **Zusage 15 wird ersetzt** |
| **B2** | **„die Anmeldungszeile läuft aus ihrer Karte"** *(Befund 3, Überschrift)* | **Die Anmeldungszeile kann das nicht.** *`.mrow.session` (`style.css:2370`) steht in einem Raster mit `minmax(0, 1fr)`, und der Kommentar darüber begründet genau das: „Das Raster kann gar nicht erst breiter werden."* **Was läuft, ist das SICHERHEITSPROTOKOLL:** *`.log-list` (`:2301`) trägt fünf Spalten über `display: contents` und bricht erst bei 700 px FENSTERbreite um — während die Karte bei 1024 px Fenster über `minmax(260px, 1fr)` schon auf rund 260 bis 330 px steht.* **Der Rumpf des Befundes und Zusage 9 sagen es richtig; nur die Überschrift nicht** |
| **B3** | **„Die Sortierung hat 13 Einträge in vier bis fünf Gruppen"** *(Befund 7)* | **Es sind drei bis vier Gruppen und elf bis dreizehn Einträge.** *Die Potenzialgruppe steht nur bei eingeschaltetem Modus da (`app.js:3815`).* **Die 17 Zeilen im Höchstfall stimmen** |
| **B4** | **„Sie trägt genau die VIER Dinge aus F1"** *(Zusage 2)* | **Mit den zwei Blätterpfeilen sind es im Eintrag sechs.** *In den drei anderen Unteransichten bleiben es vier — dort gibt es nichts zu blättern.* **Die Zusage nennt künftig beide Fälle namentlich** |

> **UND EINE ENTSCHEIDUNG, DIE DAS PAPIER ÜBERHOLT:** *der Betreiber hat am
> 11. September 2026 `Bild auf`/`Bild ab` gestrichen* — **„oh ja bei langen
> koimmentaren braucht man bild ab… das können wir nicht nehmen."** *In dieser
> Runde blättert ÜBERHAUPT KEINE Taste den Eintrag; es bleiben die zwei Pfeile
> in der Kopfzeile.* **Damit entfällt F12, und Zusage 7 dreht sich um.**

---

## Der Befund

### 1 — die vier Unteransichten haben keine Kopfzeile

**Die Stelle:** `renderDetail()` (`public/app.js:5109`), `renderSystem()`
(`:8028`), `renderOpen()` (`:4386`), `renderCompare()` (`:4524`). **Alle vier
beginnen mit derselben Zeile:**

```js
<a href="#/" class="back">${tH('list.backToList')}</a>
```

**Fünfmal steht sie im Quelltext** — die fünfte ist der Fehlerweg im Eintrag
(`:5143`), wenn die Nummer nicht aufgeht.

**WAS DIE ÜBERSICHT DAGEGEN HAT** (`masthead`, `:3178`): Marke mit Titel,
Zählzeile, Suchfeld mit Löschknopf, und in `mast-rest` Glocke, Menü und
„+ Eintrag". **Am Telefon wandern die letzten drei hinter ein Zeichen** — das
ist seit 0.22.0 gebaut und bleibt.

> **DER UMBAU BERÜHRT VIER AUFBAUTEN UND IHRE PRÜFLAGEN**, und genau deshalb
> steht er als eigene Runde und nicht als Nebensache. *Das Sammelblatt sagt
> es seit der Durchsicht so: „Eine gemeinsame Kopfzeile für alle vier wäre der
> Umbau."*

### 2 — das Blättern hat keinen Ort und keine Taste

**Es gibt heute keinen Weg von einem Eintrag zum nächsten — auf keinem
Gerät.** *Zurück zur Übersicht, die Stelle wiederfinden, den nächsten öffnen.*
**Bei einem Rundlauf über zehn Einträge ist das zwanzigmal derselbe Weg.**

**DIE PFEILTASTEN SIND BELEGT** — sie blättern in den Bildern des Eintrags, und
das ist die häufigere Bewegung. **Entschieden am 8. September: `Bild auf` und
`Bild ab`**, dazu zwei feine Pfeile in der neuen Kopfzeile.

#### Zwei Reihen liegen ineinander — und darum geht die ganze Bedienfrage

**Im Eintrag gibt es ZWEI Folgen, und beide wollen „vor" und „zurück":** die
**Bilder** dieses Eintrags und die **Einträge** der Übersicht. *Jede Bedienung,
die beiden dieselbe Geste oder dieselbe Taste gibt, muss raten, welche gemeint
ist.*

**DRAUSSEN WIRD DAS ÜBERALL GLEICH GELÖST, und die Regel ist einfach:**

| | die INNERE Reihe (Bilder) | die ÄUSSERE Reihe (Einträge) |
|---|---|---|
| **Bedienung** | **AM Bild** — wischen, Pfeile auf dem Bild, Punktreihe darunter | **DANEBEN** — eigene Knöpfe, eigene Taste, eigene Richtung |
| Instagram *(Beitrag mit mehreren Bildern)* | quer wischen auf dem Bild | längs scrollen — eine ganz andere Richtung |
| Google Photos, Lightroom | Pfeiltasten im Betrachter | `Esc` zurück ins Raster |
| Stories, TikTok | — | Tippen auf die linke/rechte Kante |

> **DER BETREIBER HAT NACH INSTAGRAM GEFRAGT** — *„bei instagram, ist es so dass
> wenn man von der bildkante meist mittig an den kanten das macht dann wechselt
> der eintrag".* **Das ist die Bedienung der STORIES und nicht die des
> Beitrags-Stroms.** *Im Strom wechselt quer wischen das BILD und längs
> scrollen den BEITRAG — zwei Richtungen, zwei Reihen.* **Die Kantenzonen
> gehören zu einer Ansicht, die gar keine zweite Reihe hat.**
> *(Aus der Kenntnis der üblichen Muster; hier nicht am Gerät nachgesehen.)*

**KRITERION HAT DIE LÄNGSRICHTUNG NICHT FREI** — dort scrollt die Seite. *Also
bleibt für die äussere Reihe nur eine eigene Bedienung daneben, und genau die
ist am 8. September entschieden worden:* **zwei Pfeile in der Kopfzeile, `Bild
auf`/`Bild ab` auf der Tastatur.**

**WARUM NICHT DER FOKUS ENTSCHEIDET** *(F12, der Vorschlag des Betreibers vom
11. September)*: **eine Taste, die je nach unsichtbarem Zustand zwei
verschiedene Dinge tut, ist ein verdeckter Modus.** *Man sieht vor dem
Drücken nicht, welcher gilt — und die häufigste Bedienung wäre „erst drücken,
dann merken, dass man im falschen Modus war".* **Es ist Stolperstein 47 in
Bedienform: eine Aussage, zwei Bedeutungen.**

**DIE REIHENFOLGE LIEGT SCHON DA:** `state.items` (`:2349`) ist, was die
Übersicht zuletzt gezeigt hat — mit ihrem Filter und ihrer Sortierung.
*Sie überlebt einen Wechsel der Ansicht, weil `state` auf Modulebene steht.*
**Sie überlebt kein Neuladen** — und das ist F2.

### 3 — die Anmeldungszeile läuft aus ihrer Karte

**Bei rund 1024 Pixeln Fensterbreite** ist die Karte des Systembereichs gerade
schmal genug, dass eine Zeile des Protokolls seitlich scrollt. **Die Seite
läuft nicht über — es scrollt der Kasten**, und das war vor der Durchsicht
genauso.

**DER SAUBERE WEG IST EINE BEHÄLTERABFRAGE**, nicht eine Fensterabfrage: *die
Karte weiß dann selbst, wie breit sie ist, statt das Fenster zu fragen.* **Das
Stilblatt kennt heute 17 `@media` und kein einziges `@container`** — nachgezählt,
nicht geschätzt.

### 4 — der Text unter dem Ablegefeld, und er ist kleiner als gedacht

> **DAS PAPIER SAGT ETWAS ANDERES ALS DER QUELLTEXT, und der Quelltext hat
> recht.** *Der Fahrplan führt seit der Durchsicht: „Fünf Zeilen, die Hälfte
> geht ins Leere — ‚Klick aufs Foto', ‚mit Strg+V einfügen', ‚Blättern mit
> ← →'."* **Nachgesehen am 11. September 2026: es sind drei Sätze, und genau
> einer nennt etwas, das es am Telefon nicht gibt.**

| | |
|---|---|
| `entry.addMediaHint` | „Fotos und Videos hinzufügen — mehrere möglich, **oder mit Strg+V einfügen**" |
| `entry.photoOrderHint` | „Das erste Foto ist das Hauptbild — Reihenfolge per Ziehen. Videos bis 20 MB (MP4, WebM, MOV)." |
| `entry.clipboardLarger` | „Das Einfügen über die Zwischenablage führt zu erheblich größeren Dateien." |

**0.22.0 hat die fünf Sätze auf einen gekürzt** (Anlage F), **0.27.0 hat einen
zweiten dazugestellt.** *„Klick aufs Foto" und „Blättern mit ← →" stehen dort
seit 0.22.0 nicht mehr.* **Übrig bleibt ein Halbsatz**, und der Punkt schrumpft
entsprechend. **Er fällt nicht weg** — ein Halbsatz, der am Telefon ins Leere
geht, ist immer noch einer.

### 5 — die Meldung kann die Vergleichsleiste verdecken

**Beide sitzen unten:** `.toast` bei `bottom: calc(22px + env(safe-area-inset-bottom))`
(`public/style.css:2575`), `.cmp-bar` bei `bottom: 20px` (`:1658`). **Die
Meldung liegt darüber.**

*Sie steht 2,6 Sekunden, die Leiste nur, solange etwas ausgewählt ist — der
Fall ist selten und wieder vorbei, bevor man ihn benennen kann.* **Das
Sammelblatt sagt deshalb „später".** *Diese Runde fasst das Stilblatt ohnehin
an; siehe F6.*

### 6 — es gibt kein Manifest

**Nachgesehen:** weder `public/manifest.json` noch eine `<link rel="manifest">`
in `public/index.html`. *Die Seite trägt `viewport-fit=cover`, `theme-color`,
`color-scheme` und ein SVG-Zeichen — alles, was ein Manifest braucht, steht
schon da; es fehlt die Datei, die es zusammenfasst.*

**DER GEWINN IST DAS ZEICHEN AUF DEM STARTBILDSCHIRM UND SONST WENIG** — so
steht es in Teil III des Sammelblatts, und der Satz stimmt. **Genau dieser
Gewinn ist der, den diese Runde sucht.**

### 7 — die Bedienelemente am Finger, und ein Auswahlfeld, das nie zoomt

> **DER BEFUND KOMMT AUS DEM BETRIEB, 11. September 2026, mit drei Aufnahmen
> vom Telefon:** *„Auf mobil sind die Pillen so groß das ein ganzes Display
> ausfüllt. Genauso ist es im overview und wenn ich die sortiert filter
> aufmache ist die Schrift deutlich größer und die liste passt nicht mal in ein
> Display ohne scrollen. Ein etwas filigranere darstellung damit einfache
> schaltflächen nicht so viel platz wegnehmen und auch die liste. das eine
> einzige liste de gesamten platz im displan nimm ist schon verschwendung."*
>
> **ER IST DER EINZIGE BEFUND DIESER RUNDE, DER NICHT AUS DER DURCHSICHT
> KOMMT.** *Die sechs davor lagen seit dem 7. September auf dem Sammelblatt;
> dieser ist am 11. September am laufenden Gerät entstanden.* **Er steht hier
> und bekommt keine eigene Runde** — es ist dieselbe Frage wie die anderen
> sechs: was am Telefon nicht aufgeht.

**NACHGEMESSEN UND NICHT GESCHÄTZT.** *Das Grundmaß steht am Wurzelelement
(`public/style.css:474`), die Zeilenhöhe 1,55 in `body`; jede Zahl unten ist
daraus gerechnet.*

| | am Zeiger | am Finger | Unterschied |
|---|---|---|---|
| **Pille** *(`style.css:805` · `:3246`)* | `5px 12px` · **31 px** hoch | `10px 15px` · **41 px** hoch | **+10 px hoch, +6 px breit** — *je Pille* |
| **Auswahlfeld** *(`:869` · `:3259` · `:3388`)* | `6px 10px` · Schrift **12,45 px** · rund **33 px** hoch | `9px 12px` · Schrift **16 px** · rund **45 px** hoch | **+28,5 % Schrift, +12 px hoch** |

**DIE PILLEN STEHEN IN EINER REIHE, DIE UMBRICHT** — `.pills` mit `gap: 6px`
(`:787`). *Jede Zeile ist am Finger zehn Pixel höher als am Zeiger.* **Fünf
Zeilen sind 229 statt 179 Pixel** *(5 × 41 + 4 × 6 gegen 5 × 31 + 4 × 6)* —
fünfzig Pixel, die nichts zusätzlich zeigen.

**DAS AUSWAHLFELD IST DER GRÖSSERE PUNKT — und es ist kein Gestaltungsfehler,
sondern eine Regel, die zu weit greift.** *Die Zeile bei `:3388` setzt
`font-size: max(16px, 1rem)`. Sie steht gegen das Hineinzoomen von Safari auf
dem iPhone, und für Eingabefelder ist sie richtig: wer in ein Feld unter 16
Pixeln tippt, sitzt danach in einer Seite, die anderthalbmal zu groß ist.*

**EIN `<select>` NIMMT KEINEN SCHREIBSTRICH.** *Es öffnet die Auswahl des
Systems; es gibt dort nichts zu tippen und folglich nichts, wogegen der Browser
hineinzoomen könnte.* **Die Auswahlfelder fahren in einer Regel mit, deren
Anlass sie nicht haben** — und die Liste, die das System aufklappt, nimmt die 16
Pixel mit. *Das ist die Schrift, die der Betreiber „deutlich größer" nennt.*

**DIE SORTIERUNG HAT 13 EINTRÄGE IN VIER BIS FÜNF GRUPPEN**
(`public/app.js:3796`) — *mit den Gruppenüberschriften sind es 17 bis 18
Zeilen.* **Bei 16 Pixeln passt das auf kein Telefon**, und genau das steht im
Befund.

> **DER PRÜFSTAND HÄLT DIE AUSWAHLFELDER IN DIESER REGEL FEST.**
> *`testbench.js:1893` prüft den Wähler wörtlich:*
> `.input, .input-sm, .ta, .select, .select-sm`.
>
> **WER SIE HERAUSNIMMT, MUSS DIESE ZUSAGE NEU SCHREIBEN UND NICHT LÖSCHEN.**
> *Sie hat weiter einen Sinn, nur einen engeren: die Eingabefelder drin, die
> Auswahlfelder draußen — beides namentlich.* **Das ist Stolperstein 201 in
> Prüfstandsform.**

**UND EINE ZAHL, DIE NICHT FÄLLT: der Finger-Abschnitt setzt genau EIN Maß von
44 Pixeln** — `.icon-btn` (`:3245`). *Die Pillen erreichen es weder vorher (31)
noch nachher (41); der Abschnitt macht sie größer, er verspricht ihnen keine
44.* **Das Maß des Symbolknopfs bleibt unangetastet.**

> **NEBENBEI GEFUNDEN UND NICHT HIER GEBAUT:** *zwei Gruppenüberschriften der
> Sortierung stehen fest auf Deutsch im Quelltext* — `label="Allgemein"`
> (`public/app.js:3807`) und `label="Verlauf"` (`:3823`). **Die beiden anderen
> Gruppen holen ihr Wort aus dem Vokabular; diese zwei nicht.**
>
> **SIE STEHEN IM FAHRPLAN BEI 0.31.0 ALS GRUPPE 6** — der Runde, die sich die
> Übersetzungen ansieht. *Sie hier mitzunehmen hieße, eine Sprachfrage in einer
> Stilblattrunde zu beantworten.*

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 1** | **Die gemeinsame Kopfzeile** — ein Aufbau, vier Rufer. *Zurück, Marke, Suchfeld, Menü (F1).* Sie klebt am Telefon oben, wie die der Übersicht | **Die fünf Zeilen `<a href="#/" class="back">` fallen** — vier Ansichten und der Fehlerweg. *`list.backToList` bleibt als Satz: die Kopfzeile trägt ihn weiter* |
| **BA 2** | **Das Blättern im Eintrag** — zwei Pfeile in der Kopfzeile, links und rechts von der Marke, die Reihenfolge aus `state.items`. **KEINE TASTE** *(Betreiber, 11. September 2026)* | *nichts fällt. **Die Pfeiltasten bleiben ungeteilt bei den Bildern**, und `Bild auf`/`Bild ab` bleiben beim Rollen der Seite — bei langen Kommentaren wird `Bild ab` gebraucht* |
| **BA 3** | **Die Behälterabfragen im Systembereich** *(F4, ausgeweitet vom Betreiber)* — `container-type: inline-size` an `.sys-card`, und DREI Gruppen wechseln: `.log-list`/`.log-row`/`.log-time`, `.vocabulary-grid`, die Reihe des Mailversands | *keine Regel fällt; drei Fensterabfragen werden Behälterabfragen. **Was NICHT wechselt, weil es dann falsch wäre, steht namentlich im Protokoll mit Grund:** `.sys-grid` (eine Frage an den Schirm), `.sys-card` am Telefon (die Seite wird zur Telefonseite), der ganze Finger-Abschnitt (eine Frage an den Zeiger), `max-height: 62dvh` (die Höhe des Fensters)* |
| **BA 4** | **Der Halbsatz am Ablegefeld** *(F5)* — eine Fassung, die am Telefon und am Schirm gilt | **`entry.addMediaHint` ändert seinen Wortlaut in allen drei Sprachen.** *Der Schlüssel bleibt* |
| **BA 5** | **Die Meldung weicht der Vergleichsleiste** *(F6)* — `body:has(.cmp-bar)` hebt den Toast an | *nichts fällt* |
| **BA 6** | **Das Startbildzeichen** — `GET /api/manifest.json` am Server *(F8, F9)*, `<link rel="manifest">` in `index.html`. *Name aus `title_public`, Zeichen `favicon.svg`, Farbe das dunkle `--bg`, `display: standalone`* | *nichts fällt. **`F_ROUTES` BLEIBT BEI 72** — die Route ist lesend und steht in dieser Liste gar nicht (B1). Die neue Route wird durch drei eigene Zusagen festgenagelt* |
| **BA 7** | **Die Dichte am Finger** *(F14–F17)* — `.pill` auf `7px 13px`, **`.pill-mode` auf `5px 11px`** *(sonst stünde der Umschalter genau so hoch wie die Pille, F14)*, und die **Auswahlfelder fallen aus der Zoomregel** | **Keine Regel fällt weg.** *Die Zusage bei `testbench.js:1893` wird **neu geschrieben** und nicht gelöscht (Stolperstein 201).* **`.icon-btn` behält seine 44 Pixel** |

> **DAS SCHEMA WIRD NICHT ANGEFASST. Das Austauschformat bleibt bei 15. Es
> kommt kein Migrationsblock dazu — es bleibt bei elf.** *Die letzte Runde, die
> das Schema anfassen darf, ist 0.29.0.*

---

## Die Nummer und ihre Begründung

**0.28.0 ist ein MINOR — Regel 5.1.**

**Zwei Funktionen kommen dazu:** *von einem Eintrag zum nächsten blättern, und
sich als Anwendung auf einen Startbildschirm legen.* **Beides kann die
Installation danach, und vorher konnte sie es nicht.**

**Die sieben Befunde allein wären ein PATCH** — sie reparieren, was schiefsteht,
und geben nichts dazu. *Sie fahren mit, weil sie dieselbe Frage haben: was am
Telefon nicht aufgeht.*

**Der Fahrplan rückt nicht.** *0.29.0 bis 0.35.0 stehen, wo sie stehen; 0.32.0
bleibt frei, der Bruch bleibt auf 0.33.0.*

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 825.** *Ein STUMM ist ein Fund und kein Versehen.*

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | **Alle vier Unteransichten tragen dieselbe Kopfzeile** — an allen vieren geprüft, nicht an einer | eine Ansicht auf die alte Zeile zurück |
| **2** | Sie trägt im Eintrag **genau diese sechs** und in den drei anderen Unteransichten **genau diese vier** — beide Sätze namentlich, nicht gezählt *(B4)* | ein siebtes danebenstellen · die Pfeile in den Vergleich mitnehmen |
| **3** | **Die Suche darin springt zur Übersicht** und setzt den Begriff | sie in der Unteransicht suchen lassen |
| **4** | **Die Pfeile blättern in der Reihenfolge der Übersicht** — mit ihrem Filter und ihrer Sortierung | die ungefilterte Liste nehmen |
| **5** | **Am Anfang und am Ende sind sie gedämpft und nicht anklickbar** — und sie sind **da** | sie verschwinden lassen *(das verschiebt alles daneben)* |
| **6** | **Ohne Reihenfolge sind beide gedämpft** — Direkteinstieg über die Adresse | eine Reihenfolge erfinden |
| **7** | **KEINE Taste blättert den Eintrag** — weder die Pfeiltasten noch `Bild auf`/`Bild ab`. *Die Pfeiltasten bleiben bei den Bildern, `Bild ab` beim Rollen der Seite* | eine Taste anhängen *(dieselbe Gegenprobe deckt beide Fälle)* |
| **8** | **Keine Wischgeste** — in derselben Ansicht wischt schon die Bildreihe | eine anhängen |
| **9** | **Die Zeile des Sicherheitsprotokolls bleibt bei 1024 px in ihrer Karte** — an der KARTE gemessen, nicht am Fenster *(B2)* | die Behälterabfrage gegen eine Fensterabfrage tauschen |
| **10** | **Der Halbsatz am Ablegefeld gilt am Telefon** — in allen drei Sprachen | „Strg+V" wieder hineinschreiben |
| **11** | **Die Meldung verdeckt die Vergleichsleiste nicht** — beide gleichzeitig sichtbar | die Regel abschalten |
| **12** | **`GET /api/manifest.json` liefert den Titel DIESER Installation** — nicht „Kriterion" | einen festen Namen hineinschreiben |
| **13** | **Sie ist ohne Anmeldung erreichbar** — der Browser holt sie vorher | sie hinter die Anmeldung hängen |
| **14** | **Kein Arbeiter im Hintergrund, kein Zwischenspeicher** — am Quelltext geprüft | einen `service worker` registrieren |
| **15** | **`F_ROUTES` steht unverändert auf 72** — die neue Route ist lesend und gehört nicht hinein *(B1)* | eine schreibende Route dazunehmen, ohne sie einzutragen |
| **16** | **Die Pille ist am Finger kleiner als heute UND größer als am Zeiger** — beide Maße stehen in der Zusage | eines der beiden Maße weglassen *(dann wäre auch das Zeigermaß grün)* |
| **17** | **`.icon-btn` misst am Finger weiter 44 Pixel** — unangetastet | es mitschrumpfen lassen |
| **18** | **Die Eingabefelder stehen ausnahmslos in der Zoomregel** — namentlich, nicht gezählt | eines herausnehmen |
| **19** | **Die Auswahlfelder stehen NICHT mehr darin** — namentlich, und der Grund steht im Stilblatt daneben | `.select` wieder hineinschreiben |
| **20** | **Die Untergrenze steht weiter in einer Funktion** und nicht als blanke Zahl | sie als blanke Zahl schreiben |

> **DIE VIER UNTERANSICHTEN WERDEN EINZELN GEPRÜFT UND NICHT STELLVERTRETEND.**
> *Eine Zusage, die nur an `renderDetail()` hängt, bliebe grün, wenn
> `renderCompare()` seine alte Zeile behält — und genau das ist der Fehler, den
> ein Umbau über vier Aufbauten macht.*

> **EINE ZUSAGE, DIE NUR ZÄHLT, SIEHT KEINEN TAUSCH.** *Zusage 2 nennt die vier
> Dinge namentlich und zählt sie nicht — Zusage 18 und 19 aus demselben Grund.*

> **ZUSAGE 18 UND 19 ERSETZEN EINE VORHANDENE UND LÖSCHEN SIE NICHT.**
> *`testbench.js:1893` prüft heute `.input, .input-sm, .ta, .select, .select-sm`
> in einem Stück.* **Sie zerfällt in zwei: was drin sein muss und was draußen
> sein muss.** *Eine Zusage, die mit ihrem Gegenstand verschwindet, hat den
> Gegenstand nie geprüft* (Stolperstein 201).

---

## Der Augenschein

**Diese Runde ändert, wie die Anwendung sich ANFÜHLT — das gehört bedient und
nicht gerechnet:**

| | Lage |
|---|---|
| **1** | Von einem Eintrag zur **Suche**, am Telefon — vorher zwei Griffe, nachher einer |
| **2** | **Durch zehn Einträge blättern** mit den zwei Pfeilen. *Und `Bild ab` in einem langen Eintrag: es rollt die Seite, wie es soll* |
| **3** | Der **erste und der letzte** Eintrag der Liste — der gedämpfte Pfeil steht da und rührt sich nicht |
| **4** | Ein Eintrag über seine **Adresse** aufgerufen — beide Pfeile gedämpft |
| **5** | Die **Bildreihe** im selben Eintrag — die Pfeiltasten tun weiterhin, was sie taten |
| **6** | Das **Protokoll** bei 1024 px, am Fenster gezogen |
| **7** | Eine **Meldung** bei gefüllter Vergleichsleiste, am Telefon |
| **8** | Die Anwendung **auf den Startbildschirm gelegt** — Zeichen, Name, Farbe |
| **9** | Die neue Kopfzeile in **allen drei Sprachen** |
| **10** | Die **Pillenreihe** der Übersicht am Telefon — vorher und nachher, bei gleicher Zahl Pillen |
| **11** | Die **Sortierung** am Telefon aufgeklappt — passt die Liste jetzt auf den Schirm? |
| **13** | Die **Anmeldungszeile** und das **Sicherheitsprotokoll** bei 1024 px — *dieselbe Karte, zwei verschiedene Zeilen; nur eine der beiden war je der Befund (B2)* |
| **12** | Ein **Eingabefeld** am iPhone antippen — die Seite zoomt weiterhin nicht. *Das ist der Augenschein, der die Zoomregel deckt: sie bleibt für die Felder, für die sie gedacht war* |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Eine Wischgeste zum Blättern** | *in derselben Ansicht wischt schon die Bildreihe, und quer scrollende Kästen gibt es daneben auch.* **Eine Geste, die mit zwei vorhandenen streitet, ist keine Bedienung, sondern ein Glücksspiel** |
| **Tippzonen an den Bildkanten** *(wie in Stories)* | *sie gehören zu einer Ansicht mit EINER Reihe.* **Hier lägen sie auf dem Bild — also auf der inneren Reihe — und hätten genau den Streit, den die Wischgeste auch hätte** |
| **Ein Modus, den der Fokus umschaltet** | *dieselbe Taste, zwei Bedeutungen, und welche gilt, sieht man nicht* (F12) |
| **Die Pfeiltasten umwidmen** | *sie blättern in den Bildern, und das ist die häufigere Bewegung* (entschieden 8. September 2026) |
| **ÜBERHAUPT EINE TASTE zum Blättern** | *`Bild auf`/`Bild ab` war der Ersatz für die Pfeiltasten und ist am 11. September 2026 gestrichen worden:* **„oh ja bei langen koimmentaren braucht man bild ab… das können wir nicht nehmen."** *Der Eintrag ist die Ansicht mit dem längsten Inhalt — ihr das Rollen mit der Tastatur zu nehmen, kostet mehr als das Blättern einbringt.* **Es bleiben die zwei Pfeile in der Kopfzeile; eine Taste läßt sich jederzeit nachliefern** |
| **Ein Arbeiter im Hintergrund, Offline-Ablage, Zwischenspeicher** | *ein Zwischenspeicher, der eine alte Fassung ausliefert, wäre in einer Instanz mit Fingerprint das Gegenteil von hilfreich* |
| **Das Speichern der Reihenfolge am Server** | *sie ist Ansichtszustand und keine Einstellung.* **Eine gespeicherte Reihenfolge wäre beim nächsten Öffnen eine Behauptung über eine Übersicht, die niemand mehr sieht** |
| **Die siebzehn Fensterabfragen INSGESAMT auf Behälterabfragen umbauen** | *F4 ist vom Betreiber auf den Systembereich ausgeweitet worden — das sind DREI Gruppen und nicht siebzehn.* **Alles außerhalb der `.sys-card` bleibt, wie es ist**, und die vier Regeln IM Systembereich, die eine Frage an den Schirm, an den Zeiger oder an die Höhe stellen, bleiben ausdrücklich Fensterabfragen |
| **„+ Eintrag" und die Glocke in der neuen Kopfzeile** | *wer einen Eintrag liest, legt selten einen an; die Glocke ist eine Auskunft über den Bestand* (F1). **Beides steht weiter in der Übersicht** |
| **Eine Einstellung für die Dichte** | *sie wäre eine zweite Wahrheit über jedes Maß im Stilblatt und müsste für immer mitgepflegt werden* (F17). **Ein Maß, das stimmt, braucht keinen Schalter** |
| **Die Eingabefelder aus der Zoomregel nehmen** | *dort ist sie richtig — ein Eingabefeld nimmt den Schreibstrich, und Safari zoomt* (F15). **Nur die Auswahlfelder fallen heraus** |
| **Die Maße des Finger-Abschnitts insgesamt aufräumen** | *er setzt heute rund zwanzig Maße.* **Angefasst werden die Pille und die Auswahlfelder**, weil zu ihnen ein Befund vorliegt — die übrigen bleiben, bis auch zu ihnen einer vorliegt |
| **Das Maß des Symbolknopfs** | *44 Pixel sind die einzige Zahl, die der Finger-Abschnitt ausdrücklich verspricht, und der Prüfstand hält sie* (`testbench.js:1882`) |
| **Die deutschen Gruppenüberschriften der Sortierung** | *sie gehören in die Runde für die Übersetzungen und stehen dafür auf dem Sammelblatt.* **Eine Sprachfrage wird nicht in einer Stilblattrunde beantwortet** |
| **Ein zweites Bildformat für das Startbildzeichen** | *eine SVG trägt vom 16-Pixel-Tab bis zum Startbildschirm* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.28.0.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_28_0.md` | `git mv`, **Revision 80** — dazu die neue Kopfzeile in Abschnitt 5. ***Nicht* `F_ROUTES` 73:** die Zahl bleibt bei 72, siehe Berichtigung B1 |
| `Doku/Fahrplan.md` | die Zeile 0.28.0 wird durchgestrichen; **die Ausarbeitungen bleiben als Herleitung** |
| `Doku/Fehler_und_Ideen.md` | die vier Punkte aus „Aus der Durchsicht für Telefon und Tablett" fallen heraus *(Regel 2)* |
| `Doku/Auftrag_0.27.0.md` | **fällt mit diesem Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **ja** — die neue Kopfzeile, das Blättern und das Startbildzeichen |

---

## WIE DER NÄCHSTE AUFTRAG AUSZUSEHEN HAT

> **Ab 0.25.0 trägt jeder Auftrag diesen Abschnitt.** *Entschieden vom
> Betreiber am 9. September 2026: „das muss immer in jedem Auftrag drin
> stehen … um dir beim Bauen Arbeit zu sparen, ohne dass wir unsicherer oder
> schlechter werden."* **Er beschreibt die FORM, nicht den Inhalt** — der
> Inhalt kommt aus dem Rundlauf.

**Am Kopf**

1. **Ein Absatz „was in dieser Runde passiert"**, mit dem Wortlaut des
   Betreibers, wenn der Befund aus dem Feld kommt.
2. **Der Fingerprint des Vorgängers**, aus **zwei** Quellen bestätigt: aus der
   laufenden Installation gemeldet **und** am gebauten Stand gerechnet.
   *Fehlt eine der beiden, steht das dort — als offener Punkt und nicht als
   Fußnote.*
3. **Die Fragetafel** mit einer Spalte „Vorschlag von Claude". **Die Spalte ist
   ein Vorschlag und keine Antwort.** *Gebaut wird erst, wenn jede Frage
   beantwortet und im Papier eingetragen ist* (Abschnitt 11 des Projektstands).
   **UND ZWAR VOR DER ERSTEN ZEILE** — am 10. September 2026 ist nach dem Bauen
   beantwortet worden, und das hat an einem einzigen Satz drei Anläufe
   gekostet.

**Im Rumpf**

4. **Der Befund**, in nummerierten Teilen, jeder mit der Stelle im Quelltext
   oder einer **Messung am laufenden Server**. *Vermutungen werden als solche
   benannt.* **Und das Papier wird gegen den Quelltext geprüft, nicht
   geglaubt** — in 0.27.0 und in 0.28.0 hat der Fahrplan je einen Punkt
   getragen, den der Quelltext anders zeigt.
5. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
6. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.*

**Am Fuß**

7. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.**
8. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
9. **Was ausdrücklich NICHT gebaut wird.**
10. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`, Revision),
    Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
11. **Dieser Abschnitt selbst.**

**Und die stehenden Regeln, die keine Runde neu verhandelt**

* **GEBAUT UND GEPRÜFT WIRD ÖRTLICH, GEPUSHT WIRD AUF ANSAGE.** *Entschieden
  vom Betreiber am 10. September 2026: das Repository ist privat und wird nur
  um einen Push herum öffentlich, damit die Läufer nichts kosten.* **Bis zum
  Wort des Betreibers weiß GitHub von nichts.**
* **KEIN WIRTSNAME, KEINE ADRESSE, KEINE MAILADRESSE DES BETREIBERS IN EINEM
  PAPIER.** **Was er schickt, wird mit seinen ZAHLEN zitiert und nicht mit
  seiner Herkunft.**
* **DER FINGERPRINT WIRD VOR DEM EINSPIELEN GERECHNET** und steht im
  Änderungsprotokoll. *Er deckt `node_modules` NICHT ab.* **Und er hängt an
  jeder Datei der Liste — auch an einem Kommentar:** in 0.27.0 hat er viermal
  gewechselt, dreimal wegen eines einzigen Satzes und einmal wegen eines
  nachgetragenen Kommentars.
* **DIE NUMMER GEHÖRT ANS ENDE DER RUNDE — aber der Code darf nicht vorher
  hinaus.**
* **EINE OBERFLÄCHE SAGT, WAS IST — NICHT, WARUM ES SO GEBAUT WURDE**
  (Projektstand 5.6). *Am 11. September 2026 hat der Betreiber es an zwei
  Texten aus 0.27.0 benannt: „an vielen stellen hast du ein schluck
  erklärbärsaft getrunken … letztlich zählt nur welche auswirkung es hat."*
  **Die Herleitung gehört in den Quelltext und in die Papiere, nicht in die
  Karte.**
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — Stolperstein 47.
* **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90).
* **`group()` SETZT EINE ÜBERSCHRIFT UND KEINE KLAMMER.**
* **EIN FREMDER SERVER MUSS NICHT DEN PORT BELEGEN — ER MUSS NUR ANTWORTEN.**
  *Nach einem abgebrochenen Lauf bleiben verwaiste Server stehen; sie sind vor
  dem nächsten abzuräumen.*
* **GEGENPROBEN GEHEN MIT, STATT GELÖSCHT ZU WERDEN** (Stolperstein 201).
* **EINE GEGENPROBE LÄUFT GEGEN `git archive HEAD`** — *erst committen, dann
  fahren.*
* **EINE GEGENPROBE PRÜFT DIE ZUSAGE, NICHT DEN PRÜFFALL.** *In 0.27.0 blieb
  eine STUMM, weil das Prüfbild die Regel gar nicht auslösen konnte.* **Wer
  eine Gegenprobe schreibt, sucht zuerst den Fall, in dem die Regel greift.**
