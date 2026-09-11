# Änderungsprotokoll 0.28.0 — „Das Telefon bekommt Recht"

**Sieben Befunde, eine gemeinsame Kopfzeile und zwei neue Funktionen · gebaut
am 11. September 2026 auf 0.27.0 (`9f6741b5`).**

> **FINGERPRINT DIESER RUNDE: `8b205f42`** — gerechnet am fertigen Stand,
> **vor dem Einspielen**.
>
> **AUS ZWEI QUELLEN, und die zweite ist eine eigene Rechnung und keine
> Abschrift:**
>
> | Quelle | Wert |
> |---|---|
> | Aus dem **Server selbst** gelesen — frisches Datenverzeichnis, über `/api/stats` befragt | **`8b205f42`** |
> | Am Arbeitsbaum nachgerechnet — **dieselben achtzehn Dateien**, die der Handgriff in der README nennt, mit eigenem Code über dieselbe Vorschrift | **`8b205f42`** |
>
> **ER HAT WÄHREND DIESER RUNDE EINMAL GEWECHSELT — wegen VIER ZEILEN:**
>
> | | |
> |---|---|
> | `22be889d` | der Stand, wie er nach dem Bauen dalag |
> | **`8b205f42`** | nachdem `ordered` aus `entryNeighbours()` gefallen ist |
>
> *`entryNeighbours()` gab ein Feld `ordered` zurück, das **niemand liest**:
> „keine Reihenfolge" und „am Rand der Reihenfolge" sehen beide genau so aus,
> wie sie aussehen sollen — zwei gedämpfte Pfeile beziehungsweise einer.*
> **Ein Feld ohne Leser bleibt nicht stehen (Stolperstein 47)**, und dass es
> beim Gegenlesen des eigenen Diffs aufgefallen ist und nicht im Betrieb, ist
> der Sinn dieses Gegenlesens. *Die Gegenprobe 832 ist mitgezogen worden.*
>
> **DIE DRITTE QUELLE FEHLT NOCH, und das steht hier als offener Punkt und
> nicht als Fußnote:** *0.28.0 ist gebaut und **nicht eingespielt**. Erst die
> Meldung aus der laufenden Installation belegt, dass das Eingespielte dasselbe
> ist wie das Gebaute.* **Bis dahin gilt: zwei Rechnungen, ein Wert.**
>
> **DIE PAPIERE ZÄHLEN NICHT MIT.** *Der Fingerprint geht über die achtzehn
> Dateien, die der Server lädt und ausliefert — nicht über `Doku/`, nicht über
> `CHANGELOG.md`, nicht über die README.* **`package.json` zählt mit**, und
> damit hat die Versionsnummer selbst ihn zuletzt bewegt.

> **DIE FRAGETAFEL IST VOR DER ERSTEN ZEILE BEANTWORTET WORDEN**, und das ist
> die Nachricht, mit der dieses Papier anfängt. *In 0.27.0 ist Regel 11 des
> Projektstands gebrochen worden — die Tafel wurde nach dem Bauen durchgegangen,
> und es hat drei Anläufe an einem einzigen Satz gekostet.* **Diese Runde hat
> gewartet.**
>
> **SIEBZEHN FRAGEN, SIEBZEHN ANTWORTEN, vom Betreiber am 11. September 2026
> entschieden.** *Vierzehn fielen wie vorgeschlagen. Drei nicht:*
>
> | | |
> |---|---|
> | **F4** | **ausgeweitet.** *Nicht eine Stelle bekommt die Behälterabfrage, sondern der ganze Systembereich* |
> | **F8** | **berichtigt.** *Der Auftrag nannte die falsche Einstellung — es gibt ZWEI Titel* |
> | **F12** | **entfallen.** *Die Frage setzte eine Taste voraus, und die ist gestrichen worden* |

---

## Was der Auftrag anders sagte als der Quelltext

> **DIESER AUFTRAG VERLANGT ES SELBST:** *„das Papier wird gegen den Quelltext
> geprüft, nicht geglaubt."* **Vier seiner Angaben haben dem nicht standgehalten,
> und die erste hätte eine Zusage erzeugt, die gar nicht grün werden kann.**

| | das Papier sagte | was gemessen wurde |
|---|---|---|
| **B1** | **„`F_ROUTES` geht von 72 auf 73"** *(F9, BA 6, Zusage 15)* | **Die Zahl bleibt 72.** *`F_ROUTES` (`testbench.js:16039`) führt ausschließlich SCHREIBENDE Routen; `writingRoutes()` sammelt `app.post(`, `app.put(` und `app.delete(` ein und sonst nichts.* **`GET /api/manifest.json` ist lesend und taucht dort nie auf.** *Nachgezählt: 72 schreibende Routen, vorher 30 lesende, jetzt 31 — und für die lesenden führt der Prüfstand überhaupt kein Verzeichnis.* **Zusage 15 ist ersetzt worden und lautet jetzt: die Zahl steht unverändert auf 72** |
| **B2** | **„die Anmeldungszeile läuft aus ihrer Karte"** *(Befund 3)* | **Sie kann es nicht.** *`.mrow.session` steht in einem Raster mit `minmax(0, 1fr)`; der Kommentar darüber begründet genau das.* **Auch die Protokollzeile ist es nicht** — *ihre Karte trägt `.wide` und misst bei 1024 px Fenster 988 px.* **Es ist der BEFEHL in „Mein Zugang" und in „Kennzahlen"**: `docker compose exec kriterion node usertool.js …` misst **452 px** und steht in einem Kasten von **182 px** — *270 Pixel außerhalb, und `overflow-x: auto` lässt den Kasten seitlich rollen.* **Das Symptom stand richtig im Papier, der Name der Zeile nicht** |
| **B3** | **„13 Einträge in vier bis fünf Gruppen"** *(Befund 7)* | **Drei bis vier Gruppen, elf bis dreizehn Einträge.** *Die Potenzialgruppe steht nur bei eingeschaltetem Modus da.* Die 17 Zeilen im Höchstfall stimmen |
| **B4** | **„genau die VIER Dinge"** *(Zusage 2)* | **Im Eintrag sind es sechs** *(die zwei Blätterpfeile kommen dazu)*, **in den drei anderen Unteransichten vier.** Die Zusage nennt jetzt beide Fälle |

> **UND EINE ENTSCHEIDUNG, DIE DAS PAPIER ÜBERHOLT HAT.** *Der Betreiber am
> 11. September 2026:* **„oh ja bei langen koimmentaren braucht man bild ab…
> das können wir nicht nehmen."** *`Bild auf` und `Bild ab` sind damit
> gestrichen; in dieser Runde blättert **gar keine Taste** den Eintrag.*
> **Es bleiben die zwei Pfeile in der Kopfzeile**, und Zusage 7 hat sich
> umgedreht: sie prüft jetzt, dass **keine** Taste greift.

---

## Die Versionsnummer

**0.28.0 — MINOR, Regel 5.1.**

**Zwei Funktionen kommen dazu:** *von einem Eintrag zum nächsten blättern, und
sich als Anwendung auf einen Startbildschirm legen.* **Beides kann die
Installation danach und konnte es vorher nicht.**

**Die sieben Befunde allein wären ein PATCH.** *Sie reparieren, was schiefsteht,
und geben nichts dazu.* **Das Schema ist nicht angefasst worden**, das
Austauschformat bleibt bei **15**, es bleibt bei **elf** Migrationsblöcken.

---

## BA 1 — die gemeinsame Kopfzeile

**Fünf Zeilen sind gefallen**, und es waren fünf und nicht vier: die vier
Unteransichten und der Fehlerweg des Eintrags.

```js
<a href="#/" class="back">${tH('list.backToList')}</a>
```

*`renderOpen()`, `renderCompare()`, `renderDetail()` — zweimal, Haupt- und
Fehlerweg — und `renderSystem()`.* **An ihrer Stelle steht ein Aufruf:
`${subhead()}` und dahinter `wireSubhead()`.**

**SIE IST DIESELBE KOPFZEILE WIE IN DER ÜBERSICHT UND KEINE ZWEITE.** *Der
Aufbau trägt `class="masthead subhead"` und innen `.mast-rest` — also dasselbe
Stilblatt und damit dieselben zwei Gestalten: auf dem breiten Schirm stehen die
Knöpfe in der Reihe, auf dem Telefon wandern sie hinter das Menüzeichen
(0.12.0).*

> **ES WÄRE DER GRÖSSERE FEHLER GEWESEN, HIER EIN EIGENES MENÜ ZU BAUEN**, das
> auf jeder Breite eine Tafel bleibt. *Dann führte der Weg in den Systembereich
> in der Übersicht über einen Knopf und im Eintrag über ein Zeichen — zwei
> Bedienungen für dasselbe Ziel, je nachdem, wo man steht.* **Stolperstein 47
> in Bedienform.**

**Was sie trägt** *(F1)*: **Zurück · ‹ Marke › · Suchfeld · Menü.**
**Was sie nicht trägt:** keinen Zähler *(er zählt die Übersicht)*, kein
„+ Eintrag" *(das Menü hat den Weg)*, keine Glocke *(sie ist eine Auskunft über
den Bestand)*.

**DER RÜCKWEG IST EIN ZEICHEN GEWORDEN UND HAT SEINEN SATZ BEHALTEN.**
*`list.backToList` fällt nicht — der Knopf trägt ihn als Titel, Pfeilglyphe und
alles. Ein zweiter, kürzerer Satz für dieselbe Handlung wäre eine zweite
Wahrheit gewesen.*

### Das Suchfeld ist eine Tür

**Gesucht wird in der Übersicht, weil dort der Bestand steht.** *Zwei Wege
führen hinüber, und beide enden an derselben Stelle: ein Tipp auf das Feld
springt sofort — der häufige Fall am Telefon —, und wer mit der Tabtaste
herkommt und tippt, nimmt den ersten Buchstaben mit.* **Der Schreibstrich steht
danach im Feld der Übersicht, mit dem Zeiger am Ende.**

*Ohne diese Übergabe wäre der Sprung ein Griff und das Tippen ein zweiter —
also genau die zwei Griffe, die diese Runde wegnimmt.*

**DIE TABTASTE ALLEIN SPRINGT NICHT.** *Ein Fokus, der die Ansicht wechselt,
machte das Durchtabben der Kopfzeile unbenutzbar.*

### Zwei Funde aus dem Augenschein

> **BEIDE SIND ERST AM GERÄT AUFGEFALLEN und nicht im Quelltext.**

**ERSTENS: der Rückweg und der Blätterpfeil trugen dasselbe Zeichen.** *Zwei
gleiche Winkel, vierzig Pixel nebeneinander, zwei völlig verschiedene Ziele.*
**Der Rückweg hat einen Pfeil mit Schaft bekommen** — *und er steht ohnehin
schon im Satz: `list.backToList` beginnt mit „←" und nicht mit „‹".*

**ZWEITENS: die beiden Pfeile wurden am Telefon auf 28 Pixel gequetscht.**
*Gemessen bei 390 px Fensterbreite: als Flexkinder gaben sie nach, während der
Titel seine volle Länge behielt.* **Jetzt gibt der Titel nach** — `flex-shrink: 0`
an Zeichen und Pfeilen, `min-width: 0` samt Ellipse am Titel. **Nachgemessen:
44 × 44.**

---

## BA 2 — das Blättern im Eintrag

**Die Reihenfolge kommt aus `state.items`** *(F2)* — *was die Übersicht zuletzt
gezeigt hat, mit ihrem Filter und ihrer Sortierung.* **Sie hält genau so lange
wie die Sitzung im Browser.**

| Lage | was die Pfeile tun |
|---|---|
| **Mitte der Liste** | beide aktiv |
| **erster Eintrag** | zurück **gedämpft**, weiter aktiv |
| **letzter Eintrag** | zurück aktiv, weiter **gedämpft** |
| **Direkteinstieg über die Adresse, oder neu geladen** | **beide gedämpft** |
| **Eintrag steht nicht im eingestellten Filter** | **beide gedämpft** |

**SIE VERSCHWINDEN NICHT, SIE WERDEN GEDÄMPFT.** *Ein Pfeil, der am Rand der
Liste wegfiele, schöbe den Titel daneben um seine Breite — und der Titel
wanderte beim Blättern hin und her.*

**KEIN SPEICHERN UND KEINE NACHFRAGE AM SERVER.** *Eine erfundene Reihenfolge
sähe aktiv aus und führte in eine Liste, die niemand vor sich hat.*

**DER BEGRIFF FÄHRT MIT.** *Wer mit einem gesuchten Begriff in einen Eintrag
gegangen ist, blättert durch die Treffer; die Adresse behält ihr `?q=`.*

### Keine Taste, und das ist die Änderung gegenüber dem Auftrag

**`Bild auf` und `Bild ab` sind gestrichen** *(Betreiber, 11. September 2026)*.
*Der Eintrag ist die Ansicht mit dem längsten Inhalt — ihr das Rollen mit der
Tastatur zu nehmen, kostet mehr als das Blättern einbringt.*

**Die Pfeiltasten bleiben ungeteilt bei den Bildern**, und damit ist F12
gegenstandslos geworden: *es gibt nichts umzuschalten.* **Die Empfehlung gegen
den verdeckten Modus steht trotzdem im Auftrag** — sie gilt für jede spätere
Runde, die eine Taste nachliefert.

---

## BA 3 — die Behälterabfragen

**Das erste `container-type` dieses Stilblatts**, und es ist ausgeweitet worden:
*der Betreiber wollte nicht eine Stelle, sondern den ganzen Systembereich.*

**NACHGEMESSEN SIND ES DREI GRUPPEN UND NICHT ZEHN** — *jede Regel des
Systembereichs ist durchgesehen worden, die in einer Fensterabfrage stand:*

| Regel | umgestellt? | warum |
|---|---|---|
| `.log-list` / `.log-row` / `.log-time` | **ja** | die Zeile hängt an der Breite der **Karte** |
| `.vocabulary-grid` | **ja** | zwei Spalten Formularfelder in einer schmalen Karte |
| `.server-row code` | **ja** *(neu)* | der Befehl aus Befund 3 |
| `.sys-grid` | **nein** | wieviele Spalten auf den **Schirm** passen. *Ein Behälter kann sich nicht selbst fragen, wie breit er ist* |
| `.sys-card` am Telefon | **nein** | das ist die **Seite**, die zur Telefonseite wird, nicht die Karte, die schmal wird |
| der ganze Abschnitt `pointer: coarse` | **nein** | eine Frage an den **Zeiger**. *Ein Tablett im Querformat ist breit UND wird mit dem Finger bedient* |
| `max-height: 62dvh` | **nein** | die **Höhe** des Fensters |

**DIE MESSUNG, DIE DIE VERKEHRUNG ZEIGT** *(Chromium, 11. September 2026, am
laufenden Server)*:

| Fenster | schmale Karte | breite Karte *(`.wide`)* |
|---|---|---|
| 1440 px | **405 px** | 1252 px |
| 1280 px | **399 px** | — |
| 1024 px | **320 px** | 988 px |
| 768 px | **359 px** | — |
| 700 px | *eine Spalte* | **664 px** |

**UNTER 700 PIXELN FENSTER KLAPPTE DIE PROTOKOLLZEILE IN ZWEI SPALTEN — und
das ist genau die Breite, bei der ihre Karte mit 664 px am BREITESTEN ist.**
*Umgekehrt stand sie bei 1024 px Fenster in fünf Spalten, obwohl die schmalen
Karten dort auf 320 px sitzen.* **Sie klappte um, weil das Fenster schmal wurde,
nicht weil die Karte es war.**

**DIE ZWEI GRENZEN SIND GEMESSEN UND NICHT GESETZT:**

| | Grenze | wie gemessen |
|---|---|---|
| `.log-list` | **420 px Kartenbreite** | bis dahin hält die Zeile ihre fünf Spalten auf **einer** Zeilenhöhe (20 px); darunter bricht sie um und wird 40 px, unter 300 px dann 60 |
| `.server-row code` | **560 px Kartenbreite** | der Befehl misst 452 px, der Knopf daneben und sein Abstand rund 100 |

### Ein Fehler, den erst der Prüfstand gefunden hat

> **DIE BEHÄLTERABFRAGEN STANDEN ZUERST VOR DEN GRUNDREGELN — und wirkten damit
> überhaupt nicht.** *`@container` hebt das Gewicht eines Wählers nicht an:
> `.log-list` in einer Behälterabfrage wiegt genau so viel wie `.log-list`
> daneben, und bei gleichem Gewicht gewinnt die SPÄTERE Zeile.*
>
> **NACHGEMESSEN IN CHROMIUM:** *bei 320 px Kartenbreite stand `.log-list`
> trotzdem auf `display: grid`.* **Eine Regel ohne Wirkung sieht aus wie eine
> Regel** — *im Bild war nichts zu sehen; gemeldet hat es der Prüflauf, weil
> fünf bestehende Zusagen plötzlich die Behälterabfrage lasen statt der
> Grundregel.*
>
> **SIE STEHEN JETZT BEI DEN FENSTERABFRAGEN:** *alles, was eine Grundregel
> überschreibt, steht hinter ihr.* **Nachgemessen: 420 → `block`, 421 → `grid`;
> 560 → umbrechen, 561 → eine Zeile.**

---

## BA 4 — der Halbsatz am Ablegefeld

**`entry.addMediaHint` verliert seinen Halbsatz, in allen drei Sprachen.**
*Der Schlüssel bleibt.*

| | vorher | nachher |
|---|---|---|
| **de** | „Fotos und Videos hinzufügen — mehrere möglich, **oder mit Strg+V einfügen**" | „Fotos und Videos hinzufügen — mehrere möglich" |
| **en** | „Add photos and videos — several at a time, **or paste with Ctrl+V**" | „Add photos and videos — several at a time" |
| **tr** | „Fotoğraf ve video ekle — birden fazla olabilir **ya da Ctrl+V ile yapıştır**" | „Fotoğraf ve video ekle — birden fazla olabilir" |

**Das Einfügen selbst bleibt** — *es wird nur nicht mehr angesagt.* **Eine
Fassung für beide Geräte und keine Weiche:** *zwei Fassungen wären ein zweiter
Schlüssel in drei Sprachen und eine Abfrage nach dem Gerät, die von da an
mitgepflegt werden müsste.*

> **NEBENBEI GEFUNDEN UND NICHT HIER GEBAUT:** *`entry.commentPlaceholder`
> nennt ebenfalls Strg+V — „Kommentar schreiben — Bilder mit Strg+V einfügen …".*
> **Derselbe Befund, dieselbe Antwort, aber ein anderer Ort.** *Der Auftrag hat
> drei Sätze unter dem Ablegefeld gezählt und genau einen benannt; eine Runde
> wird nicht nebenbei breiter gemacht.* **Er steht auf dem Sammelblatt.**

---

## BA 5 — die Meldung weicht der Vergleichsleiste

**Beide saßen unten:** *die Meldung bei 22 px, die Leiste bei 20.* **Die Meldung
liegt höher im Stapel und deckte die Leiste zu.**

**GEMESSEN IN CHROMIUM:** *die Leiste misst **54 px** am Zeiger und **60 px** am
Finger, die Meldung 43; sie überdeckten einander vollständig.*

```css
body:has(.cmp-bar) .toast { bottom: calc(90px + env(safe-area-inset-bottom)); }
```

**90 IST EINE SUMME UND KEINE RUNDE ZAHL:** *20 px steht die Leiste über dem
Rand, 60 px ist sie hoch — der Finger-Fall, der größere von beiden —, 10 px Luft
bleiben dazwischen.* **Ein Wert für beide Zeiger:** *eine Weiche nach Gerät wären
zwei Wahrheiten über denselben Abstand.*

---

## BA 6 — das Startbildzeichen

**Eine lesende Route: `GET /api/manifest.json`.** *Offen, ohne Anmeldung — der
Browser holt das Manifest nach der Regel ohne Anmeldedaten; hinter der Anmeldung
wäre es für ihn schlicht nicht da.*

**SIE TRÄGT `title_public` UND NICHT `title_app`** *(F8, berichtigt)*. *Es gibt
zwei Titel: `title_app` ist der Name IN der angemeldeten Anwendung, `title_public`
der, den die Anmeldeseite schon vor der Anmeldung zeigt.* **Mit `title_app`
hätte diese Route eine Angabe offengelegt, die bisher hinter der Anmeldung
stand** — *und der Kommentar an `/api/config` sagt ausdrücklich: „die Liste
bleibt abgeschlossen, was hier auftaucht, sieht jeder, der die Adresse kennt."*

| | |
|---|---|
| `name`, `short_name` | aus `title_public` |
| `start_url`, `scope` | `/` |
| `display` | `standalone` |
| `theme_color`, `background_color` | `#0e1012` — *das dunkle `--bg`, derselbe Wert wie in `index.html`* |
| `icons` | **eine** SVG: `favicon.svg`, `any maskable` |

**KEIN ZWEITES BILDFORMAT.** *Eine SVG trägt vom 16-Pixel-Tab bis zum
Startbildschirm.*
**KEIN ARBEITER IM HINTERGRUND, KEIN ZWISCHENSPEICHER.** *Ein Zwischenspeicher,
der eine alte Fassung ausliefert, wäre in einer Instanz mit Fingerprint das
Gegenteil von hilfreich.*

### Und sie setzt den ausgelieferten Typ nicht selbst

> **EIN WÄCHTER IM PRÜFSTAND HÄLT `server.js` FREI VON JEDER TYPANGABE** — *der
> ausgelieferte Typ soll nie aus der Datenbank kommen können.* **Der erste
> Anlauf hat ihn rot gemacht**, weil die Route ihren Manifesttyp selbst setzte.
>
> **GEMESSEN STATT GELOCKERT** *(Chromium, über `Page.getAppManifest`)*: *mit dem
> Typ, den `res.json` von selbst setzt, liest der Browser das Manifest
> **fehlerfrei** — keine Meldung, der Name kommt an.* **Der genauere Typ hätte
> nichts gebracht, was diese Instanz nicht schon hat** — *und eine Ausnahme in
> einem Wächter ist der Anfang seines Endes.*

**`F_ROUTES` BLEIBT BEI 72** *(B1)*. **Die lesenden Routen gehen von 30 auf 31**,
und für sie gibt es kein Verzeichnis — *das steht als eigener Punkt auf dem
Sammelblatt und ist älter als diese Runde.*

---

## BA 7 — die Dichte am Finger

**GERECHNET UND NICHT GERATEN.** *Das Grundmaß steht am Wurzelelement (15 px),
die Zeilenhöhe 1,55 im `body`; die Pille trägt 0,83 rem — also 21 px Zeile.*

| | am Zeiger | am Finger vorher | am Finger jetzt |
|---|---|---|---|
| **`.pill`** | `5px 12px` · **31 px** | `10px 15px` · **41 px** | **`7px 13px` · 35 px** |
| **`.pill-mode`** | `3px 9px` | `7px 12px` | **`5px 11px`** |
| **`.icon-btn`** | 36 px | **44 px** | **44 px — unangetastet** |

**Die Reihe gewinnt sechs Pixel je Zeile.** *Bei fünf Zeilen sind das dreißig.*

**NICHT ZURÜCK AUF DAS ZEIGERMASS:** *ein Finger ist breiter als ein Mauszeiger,
und diese Runde nimmt ihm nicht weg, was er gebraucht hat.* **Der Befund lautete
„filigraner" und nicht „wie am Schreibtisch".**

> **DER UND/ODER-UMSCHALTER MUSSTE MITGEHEN, und das stand nicht im Auftrag.**
> *Bei `7px 12px` hätte er nach dem Schrumpfen der Pille **genau so hoch**
> gestanden wie sie — gleiche senkrechte Polsterung, ein Pixel Unterschied in
> der Breite.* **Der Satz „er bleibt kleiner als die Pillen daneben" wäre damit
> nicht mehr wahr gewesen.** *Vier Pixel niedriger sagt weiter, was er ist; null
> Pixel sagten es nicht mehr.*

### Die Auswahlfelder fallen aus der Zoomregel

**Drei Wähler namentlich:** `.select`, `.select-sm` und
`.mrow.user select.user-role-sel`.

**DER GRUND IST NICHT GESTALTUNG, SONDERN DER ANLASS DER REGEL SELBST.** *Sie
steht gegen das Hineinzoomen beim **Tippen**. Ein `<select>` nimmt keinen
Schreibstrich — es öffnet die Auswahl des Systems, es gibt dort nichts zu
tippen, und folglich nichts, wogegen der Browser hineinzoomen könnte.* **Die
Auswahlfelder fuhren in einer Regel mit, deren Anlass sie nicht haben.**

**NACHGEMESSEN AM TELEFON (390 px, `pointer: coarse`):**

| | vorher | jetzt |
|---|---|---|
| Auswahlfeld, Schrift | **16 px** | **12,45 px** |
| Auswahlfeld, Höhe | rund 45 px | **37 px** |

**GEMESSEN AUF ANDROID MIT CHROME** *(vom Betreiber am 11. September 2026
bestätigt)*, *und dort erbt die aufgeklappte Liste die Schriftgröße des Feldes.*
**Auf einem iPhone zeichnet iOS die Auswahl mit der Schrift des SYSTEMS** —
*dort wird das Feld kleiner und die Liste nicht.* **Der Gewinn hängt am Gerät;
die Regel ist auf beiden richtig.** *Das gehört in den Augenschein und nicht in
eine Zusage.*

**DAS DATUMSFELD BLEIBT DRIN** *(F16)*: *es trägt einen Schreibstrich, den ein
`<select>` nicht hat.* **Die Eingabefelder bleiben ausnahmslos drin.**

> **DIE ZUSAGE BEI `testbench.js:1893` IST NEU GESCHRIEBEN UND NICHT GELÖSCHT**
> *(Stolperstein 201)*. *Sie verlangte `.input, .input-sm, .ta, .select, .select-sm`
> in einem Stück.* **Sie ist in zwei zerfallen:** was drin sein muss und was
> draußen sein muss — *beides namentlich und nicht gezählt.* **Eine Zusage, die
> mit ihrem Gegenstand verschwindet, hat den Gegenstand nie geprüft.**

---

## Der Prüfstand

**61 neue Zusagen** — *aus 6509 werden **6570**, und alle 6570 sind grün.*
Verteilt auf drei Gruppen:

| Gruppe | was sie deckt |
|---|---|
| **Handy und Tablett: die Staffel der Umbruchpunkte** *(erweitert)* | die Zoomregel in beide Richtungen, die Dichte am Finger, die Meldung, die Behälterabfragen |
| **Die gemeinsame Kopfzeile und das Blättern — 0.28.0** *(neu)* | die vier Unteransichten **einzeln**, der Fehlerweg, was die Kopfzeile trägt und was nicht, die Reihenfolge, die Taste, der Halbsatz in drei Sprachen |
| **Das Startbildzeichen — 0.28.0** *(neu)* | die Route am **laufenden Server**, der Titel dieser Installation, kein Arbeiter im Hintergrund |

> **DIE VIER UNTERANSICHTEN WERDEN EINZELN GEPRÜFT UND NICHT STELLVERTRETEND.**
> *Jede Funktion wird für sich aus dem Quelltext geschnitten; eine Zusage, die
> nur an `renderDetail()` hinge, bliebe grün, wenn `renderCompare()` seine alte
> Zeile behielte.*

### Vier Zusagen dieser Runde waren zuerst falsch gebaut

> **UND ALLE VIER AUS DEMSELBEN GRUND: sie lasen KOMMENTARE mit.**
>
> *Der Absatz über einer Regel erklärt, warum etwas herausgenommen wurde, und
> nennt es dabei namentlich. Eine Zusage, die den rohen Text ansieht, findet
> `.select` dort wieder — und bleibt rot, obwohl der Wähler stimmt.*
>
> **SIE HÄTTE AUCH IN DIE ANDERE RICHTUNG GEHEN KÖNNEN:** *wäre die Erklärung
> eines Tages umformuliert worden, wäre die Zusage still grün geworden, ohne
> dass sich am Stilblatt etwas geändert hätte.* **Eine Zusage liest den
> Gegenstand und nicht den Absatz darüber.**
>
> **ZWEI BESTEHENDE WÄCHTER LÖSEN DASSELBE ANDERS**, und diese Runde hat sich
> ihnen angeschlossen: *der Zoomabsatz im Stilblatt und die Typangabe in
> `server.js` schreiben das verbotene Wort in ihrem eigenen Kommentar
> **nirgends aus**.*

### Die Gegenproben — 825 bis 853

**29 Rückbauten**, aus 815 werden **844**. *Jeder nimmt genau eine Zusage ins
Visier.*

| | Bauabschnitt | Rückbauten |
|---|---|---|
| **BA 1** | die Kopfzeile | **825–830** — der Vergleich behält seine alte Zeile · der Fehlerweg bleibt ohne Kopfzeile · die Glocke wandert hinein · sie wird eine zweite Kopfzeile · die Suche springt nicht · der Schreibstrich landet nirgends |
| **BA 2** | das Blättern | **831–836** — die ungefilterte Liste · eine erfundene Reihenfolge · der gedämpfte Pfeil verschwindet · die Reihenfolge wird abgelegt · eine Taste blättert doch · der Begriff fällt aus der Adresse |
| **BA 3** | die Behälterabfragen | **837–839** — zurück auf eine Fensterabfrage · die Karte ist kein Behälter mehr · der Befehl rollt wieder |
| **BA 4** | der Halbsatz | **840** — „Strg+V" wieder hinein, **auf Englisch**: eine Zusage, die nur Deutsch ansieht, bliebe grün |
| **BA 5** | die Meldung | **841–842** — die Regel abschalten · ein Hub, der kleiner ist als die Leiste |
| **BA 6** | das Startbildzeichen | **843–846** — ein fester Name · hinter die Anmeldung · ein Arbeiter im Hintergrund · die Seite verweist nicht mehr darauf |
| **BA 7** | die Dichte | **847–853** — zurück auf das Zeigermaß · der Umschalter bleibt stehen · der Symbolknopf schrumpft mit · `.select` wieder hinein · ein Eingabefeld heraus · das Datumsfeld heraus · die Untergrenze als blanke Zahl |

---

## Der Augenschein

**Am laufenden Server bedient, nicht gerechnet** *(Chromium, 11. September 2026)*:

| | Lage | Befund |
|---|---|---|
| **1** | Kopfzeile in allen vier Unteransichten | **alle vier** tragen sie, mit genau den benannten Stücken; die alte Zeile ist nirgends mehr da |
| **2** | Durch drei Einträge blättern | Reihenfolge **2 → 3 → 1**, wie die Übersicht sie zeigte |
| **3** | Erster und letzter Eintrag | der jeweilige Pfeil **gedämpft und da** |
| **4** | Eintrag über die Adresse, neu geladen | **beide gedämpft** |
| **5** | Mit Suchbegriff blättern | Treffer **2 → 1**, Eintrag 3 übersprungen; `?q=a` bleibt in der Adresse |
| **6** | Tipp auf das Suchfeld der Unteransicht | springt zu `#/`, Schreibstrich steht in `#q`, Begriff erhalten |
| **7** | `Bild ab`, `Bild auf`, `←`, `→` im Eintrag | Adresse **unverändert** — keine Taste blättert |
| **8** | Die Pillenreihe am Telefon | Pille **35 px** statt 41 |
| **9** | Die Sortierung am Telefon | Schrift **12,45 px** statt 16 — die Liste passt |
| **10** | Der Symbolknopf am Finger | **44 × 44** |
| **11** | Die Kopfzeile am Telefon | **123 px** im Eintrag gegen **124 px** in der Übersicht — *keine Höhe dazu* |
| **12** | Die Seite am Telefon | läuft **nicht** seitlich |
| **13** | Das Manifest im Browser | `Page.getAppManifest`: **keine Fehler**, Name „Werkstatt Nord" — der Titel der Probeinstallation |

---

## Was ausdrücklich NICHT gebaut wurde

| | warum |
|---|---|
| **Eine Taste zum Blättern** | *`Bild auf`/`Bild ab` war der Ersatz für die Pfeiltasten und ist am 11. September gestrichen worden* |
| **Eine Wischgeste, Tippzonen an den Bildkanten** | *in derselben Ansicht wischt schon die Bildreihe* |
| **Ein Modus, den der Fokus umschaltet** | *dieselbe Taste, zwei Bedeutungen — F12, jetzt gegenstandslos* |
| **Das Speichern der Reihenfolge** | *sie ist Ansichtszustand und keine Einstellung* |
| **Ein Arbeiter im Hintergrund, Offline-Ablage** | *ein Zwischenspeicher, der eine alte Fassung ausliefert* |
| **Ein zweites Bildformat für das Zeichen** | *eine SVG trägt vom 16-Pixel-Tab bis zum Startbildschirm* |
| **Ein Schalter für das Blättern oder für die Dichte** | *F13 und F17 — ein Maß, das stimmt, braucht keinen Schalter* |
| **Die Eingabefelder aus der Zoomregel** | *dort ist sie richtig* |
| **`entry.commentPlaceholder`** | *derselbe Befund, anderer Ort — er steht auf dem Sammelblatt* |
| **Ein Verzeichnis der lesenden Routen** | *eine echte Lücke, aber älter als diese Runde — auf dem Sammelblatt* |
| **Die deutschen Gruppenüberschriften der Sortierung** | *eine Sprachfrage gehört in die Runde für die Übersetzungen* |
| **Die siebzehn Fensterabfragen insgesamt** | *drei Gruppen im Systembereich, und vier Regeln bleiben ausdrücklich Fensterfragen* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.28.0.md` | **neu** — dieses Papier |
| `Doku/Projektstand_Kriterion_0_28_0.md` | `git mv`, **Revision 80** |
| `Doku/Auftrag_0.28.0.md` | die Fragetafel **beantwortet**, dazu vier Berichtigungen |
| `Doku/Fahrplan.md` | 0.28.0 durchgestrichen; die Ausarbeitung bleibt als Herleitung |
| `Doku/Fehler_und_Ideen.md` | die vier Punkte der Durchsicht **fallen**; zwei neue kommen dazu |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | die Kopfzeile, das Blättern, das Startbildzeichen |
