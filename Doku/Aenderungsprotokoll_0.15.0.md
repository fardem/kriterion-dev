# Änderungsprotokoll 0.15.0 — „Der Filter und der Stift"

**Version 0.15.0 · gebaut am 29. August 2026 · Fingerprint `8fa66d7d` ·
4347 Prüfungen · 267 Rückbauten in `gegenprobe.js`**

---

**Zwei Befunde aus dem Betrieb, gemeldet am 29. August 2026 nach dem Einspielen
von 0.14.0, beide an derselben Stelle: der Ablehnung.** *Der eine war eine alte
Lücke — es gab nie einen Filter für „abgelehnt", obwohl es das Merkmal seit
jeher gibt. Der andere war eine Nachbesserung an dem, was 0.14.0 gerade gebaut
hatte: die Begründung stand als Aussage da **und** in einem dauernd offenen
Eingabefeld daneben — dieselbe Sache zweimal.* **Keiner von beiden stand im
Fahrplan.**

Beim Bauen des zweiten Punkts kam ein dritter dazu, der niemandem im Betrieb
aufgefallen war, weil er nur eine Rolle trifft: **an `rejected_grund` galt
`nurSelbst` für jedes Schreiben — auch für das Leeren.** Damit konnte ein Admin
eine fremde Begründung weder umschreiben noch **entfernen**, und das
widersprach der Hausregel *„Löschen ja, umschreiben nein"*.

> **DIESE RUNDE IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock,
> keine neue Formatnummer: es bleibt bei **sechs** markierten Blöcken und bei
> **Austauschformat 11**. Die drei Spalten stehen seit 0.14.0; diese Runde
> liest sie und schreibt in eine davon. **DIE SICHERUNG DES DATENVERZEICHNISSES
> IST DESHALB EMPFEHLUNG UND NICHT PFLICHT.** *Pflicht war sie bei 0.14.0, und
> zwar wegen des Migrationsblocks — den gibt es hier nicht.*
> **Keine neue Zeile in der `.env`, keine neue Abhängigkeit, `F_ROUTEN`
> unverändert bei 69.**

> **DIE NUMMER WAR DIE ERSTE ENTSCHEIDUNG DER RUNDE, und sie ist korrigiert
> worden.** Der Auftrag ging als `0.14.1` heraus. Abschnitt 5.1 des
> Projektstands sagt etwas anderes: *„Dritte Zahl (PATCH) nur für
> abwärtskompatible Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist
> keine PATCH-Runde — auch dann nicht, wenn sie klein ist."* **Punkt 1 bringt
> eine Funktion** — nach dem Einspielen kann die Anlage nach „abgelehnt"
> filtern. **Punkt 3 bringt eine zweite** — eine fremde Begründung lässt sich
> entfernen. *Nur Punkt 2 allein wäre PATCH gewesen.* **Also MINOR, also
> 0.15.0 — und der ganze Fahrplan rückt** (Abschnitt 8).

> **DAS RISIKO DIESER RUNDE LAG IN DER RECHTEZEILE, NICHT IN DER ANZEIGE.**
> Punkt 3 nimmt eine Entscheidung aus 0.14.0 zurück, und eine zurückgenommene
> Rechteregel ist die gefährlichste Art von Änderung: sie sieht nach einer
> Erleichterung aus und ist eine Öffnung. **Sie ist deshalb an vier Zugängen
> gefahren und in der Datenbank nachgesehen** — nicht an der Antwort des
> Servers, denn ein 403, nach dem der Text trotzdem weg ist, wäre das
> Schlimmste (Abschnitt 3).

---

## Inhalt

1. [Der Filter für „abgelehnt"](#1-der-filter-für-abgelehnt)
2. [Die Begründung kommt zur Ruhe](#2-die-begründung-kommt-zur-ruhe)
3. [Der Papierkorb — und die Klemme, die dafür fehlte](#3-der-papierkorb--und-die-klemme-die-dafür-fehlte)
4. [Zwei Angaben nach Hausmuster](#4-zwei-angaben-nach-hausmuster)
5. [Die Hervorhebung](#5-die-hervorhebung)
6. [Was je Datei geändert wurde](#6-was-je-datei-geändert-wurde)
7. [Der Prüfstand](#7-der-prüfstand)
8. [Die fünf Entscheidungen](#8-die-fünf-entscheidungen)
9. [Gegenproben](#9-gegenproben)
10. [Neue Stolpersteine](#10-neue-stolpersteine)
11. [Die Zahlen](#11-die-zahlen)
12. [Was ausdrücklich nicht passiert ist](#12-was-ausdrücklich-nicht-passiert-ist)
13. [Nachlese: die beiden Feldbelege](#13-nachlese-die-beiden-feldbelege)
14. [Offen geblieben](#14-offen-geblieben)

---

## 1. Der Filter für „abgelehnt"

**Der Befund.** Die Filterleiste trug in der Zeile **STATUS**: *Alles anzeigen ·
Getestet · Ungetestet · ★ Favoriten · Neu seit 29.08.* — **und keinen Filter für
„abgelehnt"**. *Es war keine Lücke von 0.14.0, sondern eine alte: das Merkmal
gibt es seit jeher, und es fiel erst jetzt auf, weil die Ablehnung seit 0.14.0
etwas zu sagen hat.*

**Gebaut sind drei Zustände in einer eigenen Gruppe** — *Alle · Abgelehnt ·
Nicht abgelehnt* —, und die Bauform ist der ganze Punkt:

* **Kein vierter Wert der Reihe davor.** Der Quelltext sagt es beim Favoriten
  schon: *„Eigener Umschalter, kein vierter Wert der Reihe davor: die drei oben
  sind drei Zustände EINES Merkmals."* **Teststatus und Ablehnung sind zwei
  Merkmale** — man lehnt ab, ohne zu testen, und man lehnt nach dem Test ab.
  *Als vierter Knopf wäre „getestet UND abgelehnt" nicht mehr einstellbar
  gewesen, und genau das ist die Frage, die dieser Filter beantworten soll.*
* **Drei Zustände und kein Umschalter wie ★ Favoriten.** Ein Umschalter kann nur
  *„zeig mir die abgelehnten"*. Gebraucht wird auch die Gegenrichtung — *„zeig
  mir alles außer dem Verworfenen"* —, und die ist vermutlich der häufigere
  Griff.

**Der Filter ist reine Oberfläche.** `GET /api/items` liefert `rejected` an
jeder Zeile, und der Server sieht `filters` als undurchschautes Objekt.
**Keine Route, keine Spalte, kein Eintrag in `F_ROUTEN`.**

**Vier Stellen in `public/app.js`:**

| Stelle | was dazukam |
|---|---|
| `FILTER_VORGABE` | `abgelehnt: 'all'` |
| `visibleItems()` | zwei Zeilen, hinter dem Teststatus |
| `filterZahl()` | eine Zeile — **er zählt eigens mit** |
| `drawFilters()` | `zweiteBeschriftung(r1, 'Ablehnung')` und eine zweite Pillengruppe |

**`'all'` heißt bei beiden Gruppen dasselbe Wort, und das ist Absicht.** Der
Teststatus kennt `'all' | 'tested' | 'untested'`, die Ablehnung
`'all' | 'ja' | 'nein'`. *Ein Wort für „kein Filter" über beide Gruppen hinweg
ist eine Stelle weniger, an der man sich vertun kann.*

**JEDER ANDERE WERT GILT ALS „all"**, genau wie beim Teststatus eine Zeile
höher: eine gespeicherte Ansicht aus 0.14.0 kennt den Schlüssel gar nicht und
fällt über `filterNormal()` auf die Vorgabe zurück. *Das war die Zusage; sie ist
geprüft und nicht geglaubt — samt einem verbogenen Wert, der nichts wegnimmt.*

**Der Platz: zweite Gruppe in der Statuszeile, keine eigene Zeile.** 0.13.0 hat
die Filterleiste von 229 auf 154 px gebracht; eine eigene Zeile gäbe einen Teil
davon zurück. **Abgesetzt wird sie mit `zweiteBeschriftung()`** — dasselbe
Werkzeug, mit dem „Ansichten" hinter „Sortieren" steht. *Der Preis: die Zeile
trägt jetzt acht Pillen und zwei Beschriftungen und darf bei großer Schrift
umbrechen — `flex-wrap: wrap` steht seit 0.13.1 an `.pills`, und der Umbruch ist
erlaubt.*

**Die erste Pille heißt „Alle" und nicht „Alles anzeigen"** wie in der Gruppe
davor. *Dort ist es die Aussage über die ganze Liste, hier nur über dieses eine
Merkmal — die Kategoriezeile nennt denselben Zustand aus demselben Grund
„Alle".*

---

## 2. Die Begründung kommt zur Ruhe

**Der Befund, in einem Bild.** Am Eintrag stand:

```
● Getestet    ● Abgelehnt
Abgelehnt am 29.08.2026, 13:17 — Zu ruhig :)
┌──────────────────────────────────────────┐
│ Zu ruhig :)                              │
└──────────────────────────────────────────┘
```

**Dieselbe Aussage zweimal**, und das Eingabefeld stand dauerhaft offen.

**Der Fehler lag bei der Umsetzung und nicht beim Auftrag.** Der Auftrag zu
0.14.0 verlangte *„offen im Dialog und nicht hinter einem Aufklappen"* — **das
galt der Eingabe**, damit ein Feld, das man erst suchen muss, nicht leer bleibt.
Gebaut wurde daraus „das Feld steht immer offen". *Daraus ist Stolperstein 208
geworden.*

**Gebaut ist der Ruhezustand:**

* **Das Feld verschwindet nach der Eingabe.** Was bleibt, ist die Aussage.
* **Zurück kommt es auf Klick — auf den Text oder auf ein ✎** —, und nur für
  den, der die Begründung getroffen hat.
* **Ein ✕ daneben entfernt sie**, nach Rückfrage (Abschnitt 3).
* **Beim Einschalten des Merkmals steht das Feld sofort offen, und der Zeiger
  steht darin.** *Das war der Sinn der Zusage aus 0.14.0 und bleibt.* Danach
  schließt es sich.
* **Ohne Begründung gibt es keinen Text zum Anklicken** — dann steht das ✎
  allein da, sonst gäbe es keinen Weg mehr hinein.
* **Während geschrieben wird, tritt die Aussage zurück.** *Das Feld IST in
  diesem Augenblick die Aussage; beides nebeneinander wäre genau die Doppelung,
  die dieser Ruhezustand auflöst.* Der Kommentar macht es genauso — sein Text
  weicht dem Textfeld.

**Das Muster ist nicht neu erfunden.** Der Kommentar trägt `.acts` mit
`.mact ed` (✎) und `.mact rm` (✕), und der Bearbeitenmodus hängt am ✎.
**Dieselbe Bauform, dieselben Klassen, dieselben Zeichen.** *Eine zweite
Bauform für dasselbe wäre eine zweite Wahrheit.* **Und wie am Kommentarkopf
stehen die Zeichen immer da** und erscheinen nicht erst beim Überfahren: die
Zeile ist einzeilig, und auf einem Finger gibt es kein Überfahren.

**Ob das Feld offen steht, ist Ansichtszustand** (`grundOffen` in `renderDetail()`)
**und steht deshalb nicht in `item`.** *Der Server weiß nichts davon, und eine
Antwort, die es mitbrächte, wäre eine Auskunft über ein Fenster.*

**Escape verwirft, und die Reihenfolge ist der ganze Punkt.** Das Schließen
nimmt dem Feld den Zeiger, das löst `onblur` aus, und `speichere()` verglich
sonst den getippten Text mit dem gespeicherten und schriebe genau das weg, was
gerade verworfen werden sollte. **Der Wert wird deshalb VOR dem Schließen
zurückgesetzt.** *Daraus ist Stolperstein 209 geworden.*

**Enter speichert und schließt, Verlassen des Feldes ebenso — auch nach einer
Absage.** *Der Text steht dann wieder da, wie er in der Zeile steht, und die
Meldung sagt, warum. Ein 403 ist hier ohnehin ein Wettlauf und kein normaler
Weg: wer nicht schreiben darf, bekommt das ✎ gar nicht zu sehen.*

---

## 3. Der Papierkorb — und die Klemme, die dafür fehlte

**Hier lag eine Lücke in 0.14.0, und sie war gegen die eigene Hausregel.**
*„Löschen ja, umschreiben nein"* heißt am Kommentar: den **Text** ändert nur der
Verfasser, **entfernen** darf auch der Admin. **An `rejected_grund` galt
`nurSelbst` für jedes Schreiben** — damit konnte ein Admin eine fremde
Begründung weder umschreiben noch entfernen. *Das war strenger als überall sonst
im Haus, und zwar ohne dass es je entschieden worden wäre; 0.14.0 hat die Regel
nur zur Hälfte umgesetzt.*

**Gebaut ist eine Fallunterscheidung im Rumpf, keine zweite Klemme daneben:**

```js
const schaltetEin   = b.rejected !== undefined && !!b.rejected && !it.rejected;
const entferntGrund = b.rejectedGrund !== undefined && !grundText(b.rejectedGrund);
if (b.rejectedGrund !== undefined && !schaltetEin && !entferntGrund &&
    it.rejected_von != null && !nurSelbst(req, it.rejected_von))
  return res.status(403).json({ error: VERWEIGERT_SELBST });
```

**Was „entfernen" heißt, entscheidet `grundText()` und nicht der rohe
Rumpfwert.** Ein Rumpf aus lauter Leerraum ist nach dem Einebnen leer und damit
ein Entfernen. *Ein zweiter Maßstab daneben liefe mit dem ersten auseinander —
und die Prüfung darauf ist eine eigene Zeile: läuft die Unterscheidung am rohen
String, fällt der Admin dort auf 403.*

**Die Klemme für das Entfernen ist `darfAendern`, und sie war schon da:**
`rejectedGrund` steht in `NUR_VERFASSER_FELDER`, und die Zeile davor lässt das
Feld nur passieren, wer den Eintrag ändern darf. **Hier bleibt deshalb nur, den
strengeren Fall zu überspringen.**

**Beim Entfernen bleiben Datum und Verfasser stehen.** *„Abgelehnt am 14.03.2026
von Anna" ist weiterhin wahr; nur der Grund fehlt.* **Und das Merkmal selbst
wird nicht zurückgenommen** — das ist der Schalter darüber und eine andere
Handlung.

**Wer entfernt, wird nicht Verfasser.** Der Nachtragezweig setzte `rejected_von`,
wo keiner steht — das ist der Fall einer Ablehnung aus einer Anlage vor 0.14.0.
**Ein leeres Feld hat aber keinen Verfasser**, und wer es leert, hat nichts
geschrieben. *Ohne diese Unterscheidung machte ein Entfernen an einer solchen
Ablehnung den Entfernenden zum Verfasser einer Begründung, die es gar nicht
gibt.*

**Und die Folge, die genannt gehört:** bleibt `rejected_von` stehen, darf Anna
danach eine neue Begründung schreiben — **der Admin, der gelöscht hat, dagegen
nicht.** *Das ist „Löschen ja, umschreiben nein" in Reinform und kein Versehen.*

**Der Papierkorb fragt vorher.** Die Angabe ist danach nirgends
wiederherzustellen; die Frage nennt ausdrücklich, was **nicht** verschwindet:
*„Der Text wird unwiderruflich entfernt. Datum und Verfasser der Ablehnung
bleiben stehen."*

**Stolperstein 201 ist abgearbeitet.** Die Gruppe „Die Entscheidung wird
mitgeschrieben — 0.14.0" ist Zeile für Zeile durchgesehen worden: **alle
vorhandenen Absagen schicken Text** (*„Umgeschrieben von …"*, *„Von der
Fremden"*, *„Doch nicht"*) und bleiben damit gültig — sie treffen den
Umschreibfall, den die Runde nicht anrührt. **Keine einzige musste geändert
werden**, und das ist nachgesehen und nicht angenommen worden.

---

## 4. Zwei Angaben nach Hausmuster

**Die Oberfläche konnte nicht wissen, ob sie schreiben darf.** Sie kennt ihren
**Namen** (`NAME`) und nirgends ihre **Nummer** — und aus einem Grabstein ließe
sich ohnehin nichts zurückrechnen, er hat keinen Namen mehr. Der Kommentar löst
das seit jeher mit `mine` vom Server; hier fehlte das Gegenstück.

**Gebaut sind zwei Angaben in `detail()`:**

```js
it.mine        = it.user_id === benutzerId;
it.rejectedMine = it.rejected_von != null && it.rejected_von === benutzerId;
```

**Es sind ausdrücklich zwei und nicht eine:** wer abgelehnt hat, muss nicht der
sein, dem der Eintrag gehört. **An `rejectedMine` hängt der Stift, an `mine`
zusammen mit dem Adminrecht der Papierkorb** — und das ist genau die Rechnung
aus dem Server:

| Zeichen | Oberfläche | Server |
|---|---|---|
| ✎ umschreiben | `darf && (rejectedMine \|\| kein Ablehnender)` | `darfAendern` **und** `nurSelbst(rejected_von)` |
| ✕ entfernen | `darf` = `mine \|\| ADMIN` | `darfAendern` |

**KEINE RECHTEAUSKUNFT** („darfst du schreiben?"). *Die Klemme steht im Server,
und eine zweite Antwort daneben liefe mit ihr auseinander, sobald jemand nur
eine Seite ändert. Geliefert werden die zwei Tatsachen, gerechnet wird oben —
dieselbe Linie wie am Kommentar.*

**Ohne Ablehnenden ist `rejectedMine` `false` und nicht `null`.** *Eine
Begründung, die niemandem gehört, gehört auch mir nicht.*

**Der herrenlose Fall ist ein eigener Zweig in der Oberfläche**, und er musste
sein: eine Ablehnung aus einer Anlage vor 0.14.0 hat keinen Verfasser, der
Server lässt dort jeden schreiben, der den Eintrag ändern darf — **ohne den
Zweig gäbe es auf dem Bildschirm keinen Weg hinein, und die Zusage des Servers
liefe ins Leere.** *`rejectedVerfasser` ist genau dann `null`, wenn die Spalte
leer ist: ein Grabstein steht weiter in der Verfasserkarte und kommt als Objekt
ohne Namen. Der Fall ist damit von der Oberfläche aus sauber zu erkennen.*

**Die nackte Nummer geht weiterhin nicht hinaus** — weder `user_id` noch
`rejected_von`. *Sonst wäre die Angabe daneben überflüssig und die Oberfläche
rechnete doch wieder zurück.*

---

## 5. Die Hervorhebung

**Der Befund war, dass die Aussage nicht hervorgehoben ist.** Sie stand in
`.hint hint-sm verfasser-zeile` — gedämpftes Grau, dieselbe Farbe wie „Angelegt
von … am …". **Die Marke daneben ist rot.** *Eine Entscheidung, die den Eintrag
verwirft, las sich wie eine Randnotiz.*

**Entschieden habe ich es, und hier ist die Begründung.**

**Hervorgehoben ist der GRUND, nicht die ganze Zeile.** Er trägt `--red`; Datum
und Name bleiben grau. *Sie sind eine Verfasserangabe wie „Angelegt von … am …"
und keine Aussage über die Sache; färbt man sie mit, nimmt man dem Grund die
Hervorhebung wieder weg.*

**Dazu ein Strich links in `rgba(240,85,92,.42)`** — dieselben 42 Prozent, die
der Rand des Schalters darüber trägt. **Er bindet die Aussage sichtbar an die
rote Marke**, ohne eine zweite Farbe einzuführen.

**Keine gefüllte Fläche.** *Ein zweiter roter Block direkt unter dem Schalter
stritte mit ihm um dieselbe Aufmerksamkeit; zwei rote Blöcke übereinander sagen
weniger als einer mit einer Linie darunter.*

**Keine neue Farbe, und das ist belegt und nicht behauptet.** Der Prüfstand
sieht jeden ausgeschriebenen Rotwert dieser Gruppe im übrigen Stilblatt nach —
er muss dort mindestens noch einmal vorkommen — und prüft zusätzlich, dass jeder
benutzte Vorgabewert (`--red`, `--red-dim`, `--accent`, `--accent-dim`,
`--faint`, `--ease`) im Stilblatt wirklich gesetzt ist. *Ein `var()` auf einen
Namen, den es nicht gibt, fällt lautlos auf „keine Farbe" zurück und sähe aus
wie Absicht.*

**`align-items: baseline` und nicht `center`:** bricht der Grund auf einem
schmalen Schirm um, sollen die Zeichen rechts an der **ersten** Zeile stehen und
nicht in der Mitte des Blocks.

**NACHGEMESSEN IN CHROMIUM, nicht in jsdom** — dort ist jede Breite null, und
eine Probe, die dort misst, wäre grün über nichts (dieselbe Lage wie bei der
Sternreihe in 0.14.0). Gemessen wurde an einer Seite, die das echte
`public/style.css` einbindet:

| | gemessen |
|---|---|
| Strich links an der Aussage | `2px solid rgba(240, 85, 92, 0.42)` |
| Rand des Schalters darüber | `rgba(240, 85, 92, 0.42)` — **bitgleich** |
| Farbe des Grundes | `rgb(240, 85, 92)` |
| Schriftfarbe des Schalters | `rgb(240, 85, 92)` — **bitgleich** |
| Farbe von Datum und Name | `rgb(97, 106, 115)` (`--faint`) |
| Abstand der Zeichen zum rechten Rand | **0,0 px** |

**Und die Umbruchlage, bei 120 Prozent Schrift auf 300 px Breite:** der Grund
läuft auf **vier** Zeilen, die Zeichen ✎ und ✕ stehen weiterhin auf der
**ersten** — und die Zeile bleibt **2 px innerhalb** ihres Kastens; die Seite
bekommt keinen waagerechten Bildlauf. *Das ist der Grund für `baseline`: mit
`center` säßen sie in der Mitte eines vierzeiligen Blocks.*

---

## 6. Was je Datei geändert wurde

### `server.js` — zwei Stellen

* **`detail()`** liefert zwei neue Angaben: `it.mine` und `it.rejectedMine`.
  *Die Reihenfolge im Quelltext ist bewusst so: `rejectedMine` wird **vor**
  `rejectedVerfasser` gerechnet, damit die beiden Zeilen
  `it.rejectedVerfasser = …` und `delete it.rejected_von;` nebeneinander stehen
  bleiben — Rückbau 230 greift genau dort an und wäre sonst auf zwei getrennte
  Fundstellen zerfallen.*
* **`PUT /api/items/:id`** bekommt `entferntGrund` und damit die
  Fallunterscheidung in der vorhandenen Klemme, dazu die Ergänzung im
  Schreibzweig: `if (it.rejected_von == null && !entferntGrund)`.
  *Der lange Kommentar über der Klemme sagt jetzt „drei Fälle kommen durch"
  statt „zwei" und nennt die zurückgenommene Entscheidung ausdrücklich — eine
  Auflage aus den Bauregeln: **fachliche Warnung ja, Entstehungsgeschichte nein
  — außer dort, wo eine zurückgenommene Entscheidung sonst wiederkäme.***

**`GRUND_LAENGE`, `grundText()`, `NUR_VERFASSER_FELDER`, `F_ROUTEN` und das
Austauschformat sind unberührt.**

### `public/app.js` — sechs Stellen

| Stelle | was |
|---|---|
| `FILTER_VORGABE` | `abgelehnt: 'all'` |
| `visibleItems()` | zwei Zeilen für den neuen Filter |
| `filterZahl()` | eine Zeile — er zählt eigens mit |
| `drawFilters()` | zweite Beschriftung „Ablehnung" und die Pillengruppe `#f-abgelehnt` |
| Aufbau des Eintrags | `#rej-marke` bekommt die Klasse `rej-aussage` |
| `drawAblehnung()` | neu geschrieben: Ruhezustand, Rechte, Zeichen |
| `oeffneGrund()` / `entferneGrund()` | neu |
| Schalter `sw-rej`, `speichere()`, Escape | Feld öffnet und schließt sich |

**Der Satz wird als Knoten gebaut und nicht als `innerHTML` gesetzt** — der
Grund geht durch `textContent`, und die Prüfung dazu steht seit 0.14.0 in der
Gruppe „Die Aussage an der Marke".

### `public/style.css` — eine neue Gruppe

`.rej-aussage` samt `.rej-text`, `.rej-warum`, `.rej-warum.klick`, `.acts` und
`.mact` — dazu ein Eintrag in der `touch-action`-Zeile der Telefonansicht.
*Die Kommentare an `.verfasser-zeile` und `.rej-grund` sind nachgezogen: sie
sagten „steht offen unter dem Schalter", was seit dieser Runde nur noch für die
Eingabe gilt.*

### `pruefung.js`

Zwei neue Gruppen in der Oberflächenprüfung, eine neue am Server. **`baueDom()`
bekommt den Schalter `eintragMeins`** und liefert `mine` und `rejectedMine` an
der Beispielantwort — **gerechnet wie der echte Server** und nicht fest gesetzt
(Stolperstein 102). **Der PUT-Mock schreibt `rejectedMine` mit** und macht beim
Entfernen ausdrücklich **niemanden** zum Verfasser — sonst verdeckte er genau
den Unterschied, den Abschnitt 3 baut (Stolperstein 90).

**Und die Gruppe von 0.14.0 ist nachgezogen** (Stolperstein 201): die
Prüfungen, die *„das Feld steht offen da"* festhielten, prüfen jetzt den
Ruhezustand; die Vergleiche auf `#rej-marke`.textContent lesen die neue Spanne
`.rej-text`, weil die Zeile inzwischen auch die Zeichen ✎ und ✕ trägt.
**Keine ist gelöscht**, über jeder steht, warum sie sich geändert hat.

### `gegenprobe.js`

**Achtzehn neue Rückbauten** (250–267), **zwei nachgezogene** (245 und 246 —
ihre Zeilen haben sich geändert) und **einer repariert** (227 — die Klemme hat
eine Bedingung mehr). *Nachgesehen wird das nicht von Hand: der Prüfstand prüft
für jeden Rückbau, dass sein Suchtext in seiner Datei genau einmal vorkommt.*

### Papiere

`README.md`, `CHANGELOG.md`, `Doku/Projektstand_Kriterion_0_15_0.md`
(umbenannt aus `_0_14_0`, Revision 37), `Doku/Fehler_und_Ideen.md`,
`package.json`, `package-lock.json` und dieses Protokoll.

**Das Sammelblatt ist an zwei Stellen angefasst:** die Wegweisertabelle am
Anfang von Teil I bekommt die Zeile zu dieser Runde und die drei gerückten
Nummern *(0.15.0 → 0.16.0, 0.16.0 → 0.17.0, 0.17.0 → 0.18.0, jede mit dem
Vermerk „war …")*, und **Teil II bekommt eine Zeile** — den Befund am
Rückbaufilter von `gegenprobe.js` (Abschnitt 12). *Die sechs Querverweise
innerhalb des Blattes, die eine gerückte Nummer nannten, sind mitgezogen; ein
Verweis auf „Fahrplan 0.15.0, Die Glocke" zeigte sonst auf diese Runde hier.*

**Konzeptpapier und Videopapier sind nicht angefasst und nicht umbenannt.**

**`Doku/Auftrag_0.15.0.md` wird beim Schreiben des nächsten Auftrags entfernt** —
es liegt immer nur einer im Repo.

---

## 7. Der Prüfstand

**Stand: 4347 von 4347 bestanden** — **85 neue Prüfungen** in drei neuen
Gruppen; **86 in den Gruppen, eine weggefallen** (siehe Kasten).

| neue Gruppe (0.15.0) | Prüfungen |
|---|---|
| Entfernen darf auch der Admin — 0.15.0 | 21 |
| Der Filter „abgelehnt" — 0.15.0 | 23 |
| Die Begründung kommt zur Ruhe — 0.15.0 | 42 |
| **zusammen** | **86** |

*Dazu ist eine Zahl in einer vorhandenen Gruppe nachgezogen: 249 → 267
Rückbauten.*

> **EINE PRÜFUNG AUS 0.14.0 IST WEGGEFALLEN, und das gehört hingeschrieben.**
> *„Und es trägt die vorhandene Begründung als Vorschlag"* prüfte den Inhalt des
> Feldes **im Ruhezustand** — den es seit dieser Runde nicht mehr gibt. **Die
> Sache selbst ist nicht ungeprüft:** dass beim Öffnen die alte Begründung im
> Feld steht, steht jetzt in der Gruppe von 0.15.0 (*„Ein Klick auf den Text
> öffnet das Feld"* prüft `value` mit). *Vier weitere Zeilen der Gruppe „Die
> Aussage an der Marke — 0.14.0" haben sich geändert, weil sie die
> zurückgenommene Entscheidung festhielten — über jeder steht, warum
> (Stolperstein 201).*

**Die Frage, die an jede neue Gruppe gehört: welcher Schalter bleibt hier
durchweg aus, und trägt er etwas zur Sache bei?** In dieser Runde waren es
**zwei**, und beide tragen:

* **`rejectedMine`** — eine Gruppe, die nur den Ablehnenden fährt, belegt nichts
  über den fremden Admin, den fremden Benutzer und den Fall ohne Begründung.
  **Alle vier Lagen sind gebaut.**
* **`mine` am Eintrag** — und der war der schwierigere. In den ersten drei Lagen
  ist er durchweg `false` (der Beispieleintrag gehört bert, die Fragende ist
  chefin). **Ohne eine vierte Lage, in der der Verfasser des Eintrags selbst
  hinsieht — ohne Adminrolle und ohne die Ablehnung getroffen zu haben —, wäre
  der Schalter nie eingeschaltet worden** und die Prüfungen blieben grün, gleich
  was `mine` bewirkte. *Dafür hat `baueDom()` den Parameter `eintragMeins`
  bekommen.*

**Und die Prüflage muss die Sache tragen können** (Stolperstein 189): der
Filterbestand hat **alle vier** Kombinationen aus Teststatus und Ablehnung —
getestet+abgelehnt, getestet+nicht, ungetestet+abgelehnt, ungetestet+nicht.
*Eine Lage, in der jeder abgelehnte auch getestet ist, könnte „kombinierbar" gar
nicht belegen: beide Filter lieferten dieselbe Menge.* **Die Gegenprobe dazu
steht als eigene Zeile daneben** — die beiden Filter treffen einzeln wirklich
verschiedene Mengen.

**Am Server wird in die DATENBANK gesehen und nicht in die Antwort.** *Ein 403,
nach dem der Text trotzdem weg ist, wäre das Schlimmste; ein 200, nach dem er
noch dasteht, das Zweitschlimmste.* Zu jeder Verweigerung steht der Erfolgsfall
daneben.

**Die Klicks sind wirklich zugestellt** (Stolperstein 61): `MouseEvent` und
`KeyboardEvent` an den echten Knoten, nicht der Behandler von Hand aufgerufen.
*Auch das Nein im Bestätigungsfenster ist gefahren — ohne es bliebe die Frage
eine Frage, die nichts entscheidet.*

### Und einmal ganz durch, gegen einen echten Server

**Der Prüfstand fährt die Oberfläche gegen einen Mock.** Er kann damit nicht
zeigen, dass Mock und Server dasselbe sagen — genau das ist der Grund für
Stolperstein 90. **Deshalb sind die drei Handgriffe dieser Runde zusätzlich an
einem echten Server in Chromium gefahren**, mit vier Einträgen, zwei Zugängen
und ohne Mock:

**Erstens, der Filter.** Alle vier Kombinationen angelegt, dann geklickt:
„Abgelehnt" lässt genau die zwei abgelehnten stehen, „Nicht abgelehnt" genau
die zwei anderen, und **„Getestet" dazu genau einen**. Die Zahl am
eingeklappten Schalter geht dabei von `· 1 aktiv` auf `· 2 aktiv` — **zwei
Merkmale zählen zweimal.** Beide Beschriftungen stehen in derselben Zeile:
*Status* und *Ablehnung*.

**Und die Zeile ist nicht gewachsen: 0,0 px.** Gemessen bei 1360 px Fenster —
die Filterleiste ist mit der neuen Gruppe **148,2 px** hoch; nimmt man Gruppe
und zweite Beschriftung im laufenden Fenster wieder heraus, sind es **dieselben
148,2 px** bei **vier** Zeilen. *Das ist der Beleg für die zweite Entscheidung:
eine eigene Zeile hätte etwas gekostet, diese Bauform kostet nichts.*

**Zweitens, die Begründung.** Im Ruhezustand steht *„Abgelehnt am 29.08.2026,
13:45 von bert — Lieferzeit über 6 Monate"* und das Feld ist **zu**. Klick auf
den Text: Feld offen, alter Text darin, Zeiger darin, Aussage tritt zurück.
**Escape:** Feld zu, alter Text steht wieder da, **nichts geschickt**. Über das
✎ wieder auf, *„Preis zu hoch"* getippt, Enter: Feld zu, neue Aussage — **und
`GET /api/items/1` sagt `rejected_grund: "Preis zu hoch"`.**

**Drittens, der Admin.** Angemeldet als *anna* (Eigentümerin, weder Verfasserin
des Eintrags noch der Begründung): sie sieht `mine: false`, `rejectedMine:
false` — **kein ✎, der Text nicht anklickbar, aber das ✕ da.** Die Rückfrage
nennt, was bleibt. Nach dem Ja: Grund weg, **„Abgelehnt am 29.08.2026, 13:45
von bert" steht weiter da**, der Schalter weiter auf „Abgelehnt", `rejected_at`
und `rejected_von` unverändert. **Und danach steht auch für sie kein ✎ mehr** —
schreiben darf sie nicht; ein `PUT` mit neuem Text kommt als **403 „Das ändert
nur, wer es geschrieben hat."** zurück, und die Spalte bleibt leer.
*Oberfläche und Server sagen dasselbe, und zwar ohne dass die eine die andere
fragt.*

---

## 8. Die fünf Entscheidungen

**Erstens: die Nummer ist 0.15.0, und der Fahrplan rückt.**
Der Auftrag ging als `0.14.1` heraus. **Zwei der drei Punkte bringen
Funktionen** — der Filter und das Entfernen —, und Abschnitt 5.1 sagt: *„Eine
Runde, die eine Funktion bringt, ist keine PATCH-Runde."* **Also MINOR.**
*Nur Punkt 2 allein wäre PATCH gewesen.* **Was das für den Fahrplan heißt, ist
hingeschrieben und nicht still vollzogen:**

| bisher | künftig | Runde |
|---|---|---|
| — | **0.15.0** | **Der Filter und der Stift** *(diese Runde)* |
| 0.15.0 | **0.16.0** | Der Systembereich, die Glocke und die Auskunft |
| 0.16.0 | **0.17.0** | Die Suche wird nachvollziehbar |
| 0.17.0 | **0.18.0** | Bereinigung — der Bruch |

*Die Bereinigung ist damit zum dritten Mal umnummeriert; sie ist kein einziges
Mal verschoben worden, weil jemand sie später wollte — die Nummer war vorgemerkt
und nicht vergeben.* **Die harte Bindung des Fahrplans bleibt eingelöst:** der
sechste Migrationsblock existiert seit 0.14.0, und die Bereinigung kann ihn
wegräumen, gleich unter welcher Nummer sie läuft.

**Zweitens: der neue Filter steht als zweite Gruppe in der Statuszeile und
bekommt keine eigene Zeile.** Die Zeile heißt „Status", und die Ablehnung ist
einer. *Der Preis: acht Pillen und zwei Beschriftungen in einer Zeile, die bei
großer Schrift umbrechen darf — das ist erlaubt und kein Fehler.* **Der Gewinn
ist gemessen und nicht geschätzt: 0,0 px** — die Filterleiste ist mit der neuen
Gruppe genauso hoch wie ohne sie (Abschnitt 7).

**Drittens: die Oberfläche bekommt zwei Angaben nach Hausmuster** — `mine` am
Eintrag und `rejectedMine` an der Begründung — **und keine Rechteauskunft.**
*Eine Antwort auf „darfst du schreiben?" wäre eine zweite Wahrheit über eine
Klemme, die im Server schon steht, und liefe mit ihr auseinander, sobald jemand
nur eine Seite ändert.* **Zwei Tatsachen hinaus, gerechnet wird oben** — genau
wie am Kommentar.

**Viertens: beim Entfernen bleiben Datum und Verfasser stehen.**
*„Abgelehnt am 14.03.2026 von Anna" ist weiterhin wahr; nur der Grund fehlt.*
**Und die Folge ist gewollt und kein Versehen:** bleibt `rejected_von` stehen,
darf Anna danach eine neue Begründung schreiben, der Admin nicht.

**Fünftens: die Hervorhebung** — meine Entscheidung, Begründung in Abschnitt 5.
**Der Grund in `--red`, ein Strich links in `rgba(240,85,92,.42)`, Datum und
Name weiter grau, keine gefüllte Fläche und keine neue Farbe.**

---

## 9. Gegenproben

**Vorher: 249 Rückbauten. Nachher: 267.**

**Der volle Lauf über alle 267 ist NICHT gefahren.** Er steht damit seit zehn
Runden aus; die Begründung steht in Abschnitt 14.

**Gefahren sind die achtzehn dieser Runde**, in vier Nebenspuren —
GEGENPROBE_ERGEBNIS:

GEGENPROBE_TABELLE

**Zwei vorhandene Rückbauten sind nachgezogen und einer repariert**
(Stolperstein 201 und, für das Reparieren, Stolperstein 192):

* **245** *(„Das Feld für den Grund erscheint nicht")* — die Zeile
  `zeile.hidden = !item.rejected;` gibt es nicht mehr; das Feld hängt seit
  0.15.0 an `grundOffen`. **Der Rückbau trifft dieselbe Sache an ihrer neuen
  Zeile**, und seine erwartete Gruppe ist jetzt die von 0.15.0.
* **246** *(„Die Aussage steht auch da, wenn sie nichts sagt")* — dieselbe
  Sache: die Bedingung an `marke.hidden` ist gewachsen.
* **227** *(„Eine Ablehnung ohne Verfasser lässt sich nicht mehr begründen")* —
  die Klemme trägt seit dieser Runde `!entferntGrund` als zusätzliche
  Bedingung; der Suchtext greift ohne die Ergänzung ins Leere.

*Nachgesehen wird das nicht von Hand:* der Prüfstand rechnet bei jedem Lauf
nach, dass **jeder** Rückbau in seiner Datei genau einmal greift. **Ohne diese
Zeile sähe ein Rückbau, der ins Leere greift, aus wie einer, der nichts
bewirkt** — und fiele erst beim vollen Lauf auf, der Stunden dauert.

**Und eine bauliche Entscheidung ist deswegen im Quelltext getroffen worden:**
`detail()` rechnet `rejectedMine` **vor** `rejectedVerfasser`, damit die beiden
Zeilen, die Rückbau 230 zusammen wegnimmt, nebeneinander stehen bleiben.
*Sonst wäre ein vorhandener Rückbau an einer Stelle zerfallen, an der sich
nichts Fachliches geändert hat.*

---

## 10. Neue Stolpersteine

**208. Eine Zusage, die einer HANDLUNG gilt, wird zum Fehler, sobald man sie auf
den RUHEZUSTAND anwendet.** Der Auftrag zu 0.14.0 verlangte *„das Feld für den
Grund steht offen im Dialog und nicht hinter einem Aufklappen"* — gemeint war
die **Eingabe**, damit ein Feld, das man erst suchen muss, nicht leer bleibt.
Umgesetzt wurde „das Feld steht immer offen", und damit stand die Aussage neben
ihrem eigenen Eingabefeld: **dieselbe Sache zweimal.** *Der Fehler lag bei der
Umsetzung und nicht beim Auftrag.* **Die Frage dazu: gilt diese Zusage dem
Augenblick, in dem jemand etwas tut, oder dem Bild, das danach dasteht?**

**209. Wer ein Feld schließt, das den Zeiger hat, löst `blur` aus — und damit
jeden Behandler, der daran hängt.** Beim Verwerfen mit Escape muss der Wert
**vor** dem Schließen zurückgesetzt werden; sonst vergleicht der Speicherweg den
getippten Text mit dem gespeicherten und schreibt genau das weg, was gerade
verworfen werden sollte. *Die Reihenfolge ist der ganze Punkt, nicht der
Handgriff.*

**210. Ein Papierkorb an einem Feld, das jemandem gehört, hat ZWEI Klemmen und
nicht eine.** Wer den Text **umschreiben** darf, ist nicht dieselbe Menge wie
der, der ihn **entfernen** darf — „Löschen ja, umschreiben nein" heißt genau
das. **Die Oberfläche braucht deshalb zwei Angaben vom Server**
(`rejectedMine` für den Stift, `mine` für den Papierkorb) und nicht eine.
*Wer nur eine liefert, baut entweder einen Knopf, der 403 kassiert, oder
versteckt einen, der erlaubt wäre.*

**211. Eine Prüfung, die nach einem Element greift, das ihr eigener Rückbau
wegnimmt, REISST DEN GANZEN LAUF AB statt rot zu werden.** *Und dieser
Stolperstein ist nicht ausgedacht — er kommt aus der Gegenprobe dieser Runde
und ist ihr eigentlicher Fund.* **Rückbau 264** entfernt die Rückfrage vor dem
Löschen; damit steht das Bestätigungsfenster gar nicht da, und
`fenster.querySelector('[data-yes]')` warf einen TypeError. **Die beiden
Prüfungen davor wurden richtig rot — der Abriss kam danach**, und die
Gegenprobe meldete 264 als *„nicht auswertbar"* statt als greifend. *Ein
abgerissener Lauf belegt gar nichts, und im Betrieb fällt die ganze Prüfung aus
statt einer Gruppe.* **Jeder Griff auf ein Element, das ein denkbarer Rückbau
wegnehmen kann, wird abgesichert** — `?.` kostet nichts und hält den Lauf ganz.

**212. jsdom führt Folgewirkungen nicht aus — wer sie nicht selbst auslöst,
prüft die halbe Kette.** *Der zweite Fund aus der Gegenprobe, und der
schwerere.* Ein echter Browser nimmt einem Element, das versteckt wird, den
Zeiger und löst damit `blur` aus; **jsdom tut das nicht.** Die Prüfung auf
„Escape verwirft" sah deshalb nur, dass das Feld zugeht — nicht, dass der
verworfene Text nicht doch noch vom Speicherweg abgeholt wird. **Rückbau 265,
der genau das Zurücksetzen wegnimmt, blieb daran STUMM.** *Was der Browser von
selbst tut, wird in der Prüflage ausdrücklich ausgelöst* — die Gruppe wirft den
`blur` jetzt selbst und prüft dazu, dass der verworfene Text wirklich aus dem
Feld verschwunden ist.

**213. Ein Werkzeug, dessen Erfolgsmeldung den eigenen Fund nicht sehen kann,
ist schlimmer als keines.** `gegenprobe.js` nannte einen Rückbau „STUMM", wenn
**kein** Punkt rot wurde — aber die Selbstprobe *„Jeder Suchtext kommt in seiner
Datei genau einmal vor"* wird bei **jedem** gefahrenen Rückbau rot, denn er hat
seinen Suchtext gerade ersetzt. **Damit war `rot.length` nie null, und die
Schlusszeile „0 STUMM" war eine Auskunft über nichts.** *Gefunden wurde 265
beim Lesen der Tabelle von Hand — die Meldung darüber sagte das Gegenteil.*
**Die Frage an jede Erfolgsmeldung: gibt es einen Zustand, in dem sie gar nicht
anschlagen KANN?**

---

## 11. Die Zahlen

| | vorher (0.14.0) | nachher (0.15.0) |
|---|---|---|
| Prüfungen | 4262 | **4347** |
| Rückbauten in `gegenprobe.js` | 249 | **267** |
| Stolpersteine | 207 | **213** |
| Markierte Migrationsblöcke | 6 | **6** |
| Austauschformat | 11 | **11** |
| Spalten an `items` | 13 | **13** |
| `F_ROUTEN` | 69 | **69** |
| Vorgänge im Sicherheitsprotokoll | 20 | **20** |
| Merkmale im Sicherheitsprotokoll | 14 | **14** |
| Zwecke der zweiten Bestätigung | 7 | **7** |
| Karten im Systembereich | 19 | **19** |
| Vokabulareinträge | 11 | **11** |
| Portbasen im Prüfstand | 58 | **58** |
| Laufzeit `npm test` | ~5 min 45 s | **~6 min 29 s** |

**Laufzeitabhängigkeiten unverändert:** `better-sqlite3-multiple-ciphers`,
`express`, `multer`, `nodemailer`, `sharp`. **Entwicklungsabhängigkeit
unverändert:** `jsdom`. **Keine neue, nicht eine.**

---

## 12. Was ausdrücklich nicht passiert ist

* **KEIN Schema, kein Migrationsblock, keine neue Formatnummer.** Die drei
  Spalten stehen seit 0.14.0. *Es bleibt bei sechs markierten Blöcken und bei
  Format 11.*
* **KEIN Eingriffsvermerk an der Begründung.** Der Kommentar trägt *„2 Bilder
  vom Admin entfernt"*; das Gegenstück hier wäre eine **Spalte**, also Schema,
  also eine Datenbankstufe für eine Randnotiz. *Wer wissen will, ob eine
  Begründung dastand, sieht in seine Exportdatei.*
* **KEIN Vokabulareintrag für „abgelehnt".** Es bleibt bei **elf**. „Getestet"
  hat einen, weil das Wort je Anlage ein anderes ist — *ein Ablehnen ist ein
  Ablehnen*, und ein zwölfter Eintrag kostete rund 45 Textstellen für nichts.
* **KEIN Filter für „hat eine Begründung".** Er klingt naheliegend und wäre ein
  vierter Zustand in einer Gruppe, die drei hat.
* **KEINE Änderung an der Kachelansicht.** Sie trägt die Marke „abgelehnt" und
  keinen Grund — *ein Grund gehört an den Eintrag und nicht in eine
  Kachelreihe.* Der Prüfstand hält es fest.
* **KEIN `tested_at` und kein Grund an „getestet".** Unverändert aus 0.14.0:
  *„getestet" ist ein Zustand und keine Entscheidung.*
* **KEINE Adressliste für `X-Forwarded-For`.** Zweite Hälfte von Punkt 2 aus
  0.13.0, eigene Runde.
* **KEIN Fließsatz an der Tagwolke.** Zurückgestellt in 0.13.1, mit Rechnung, im
  Sammelblatt.
* **KEINE neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
* **`F_ROUTEN` bleibt bei 69**, und das ist nachgezählt und nicht angenommen:
  diese Runde bringt keine schreibende Route.

---

## 13. Nachlese: die beiden Feldbelege

**Beide stehen weiterhin aus.** Sie kosten keine Zeile Code und sind nur am
echten Bestand zu haben:

1. **Der Teilexport am echten Bestand** (0.12.4, offen seit dem 28. August).
   Systembereich → Export → *In Teilen exportieren*, 300 MB. **Wie viele Teile,
   und stimmen die Dateigrößen ungefähr mit der Ansage?** Dann alle Teile
   bestätigen und laden — **mit eingeschaltetem zweitem Faktor** —, und danach
   nachsehen, dass im Sicherheitsprotokoll **keine** Zeile `bestaetigung.fehl`
   steht. *Und der eine Handgriff, der wirklich zählt: einen Teil in eine
   **Zweitanlage** einspielen, nicht in die laufende.*
2. **Beide Netze am echten Wirt** (0.13.0, offen seit dem 28. August). Über
   HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
   `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

**Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**

---

## 14. Offen geblieben

* **Der volle Gegenprobenlauf steht weiterhin aus** — jetzt über **267**
  Rückbauten. *Er ist seit zehn Runden nicht ganz gefahren.* **Die Rechnung ist
  unverändert:** 267 Rückbauten zu je einem vollen Prüflauf sind rund
  **26 Stunden** hintereinander, in vier Nebenspuren rund sieben. **Und eine
  Auflage aus 0.14.0 gilt weiter:** er lässt sich **nicht neben dem Bauen**
  fahren — `gegenprobe.js` zieht seine Kopie aus `git archive HEAD`, und ein
  Commit mitten im Lauf verschiebt die Grundlage. *Gefahren sind die dieser
  Runde, einzeln und vollständig (Abschnitt 9).*
* **Die Tags `v0.12.3` bis `v0.15.0` sind nicht geschoben.** Es ist **kein**
  Problem der GitHub-Rechte: der Git-Proxy der Arbeitsumgebung weist
  `POST /git-receive-pack` mit `refs/tags/*` mit **403 ohne einen einzigen
  GitHub-Header** ab — GitHub sieht die Anfrage nie. **Sie warten auf den Merge
  des Arbeitsbranches**; die Befehle stehen im Projektstand, Abschnitt 8.
* **Der Filter „hat eine Begründung"** ist nicht gebaut und steht auch nicht auf
  einer Liste — er wäre ein vierter Zustand in einer Gruppe, die drei hat.
* **Ein Eingriffsvermerk an der Begründung** — wie der am Kommentar — bliebe
  eine Spalte und damit eine Datenbankstufe. *Wenn er je gebaut wird, dann im
  Zug einer Runde, die das Schema ohnehin anfasst.*
* **EIN BEFUND AM WERKZEUG, und er steht als Zeile im Sammelblatt, Teil II.**
  Der Rückbaufilter von `gegenprobe.js` prüft `nr === Argument` **oder**
  `name.includes(Argument)` — `node gegenprobe.js 256` fährt deshalb auch
  Rückbau **83** („SHA-256 statt SHA-1"). *In dieser Runde ohne Schaden: der
  zusätzliche Lauf war grün und kostete eine Nebenspur.* **Der Fehler ist
  stumm**, und die Wirkung kann in beide Richtungen gehen — wer eine Nummer
  meint, bekommt mehr, als er wollte, und rechnet die Gegenprobentabelle danach
  falsch zusammen. *Nicht in dieser Runde behoben: es ist eine Änderung am
  Werkzeug mitten in einem Lauf, der das Werkzeug benutzt.*
