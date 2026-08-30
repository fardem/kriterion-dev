# Änderungsprotokoll 0.17.0 — „Was dasteht, und was nicht dasteht"

**Version 0.17.0 · gebaut am 30. August 2026 · Fingerprint `e7f35b0e` ·
4630 Prüfungen · 333 Rückbauten in `gegenprobe.js`**

---

**Neun Befunde aus EINEM Rundlauf von Hand.** Gemeldet am 30. August 2026,
unmittelbar nachdem 0.16.0 eingespielt und ihr Fingerprint `aa76c352` im Feld
bestätigt war. **Der Prüfstand war zu diesem Zeitpunkt grün — 4523 von 4523.**
*Einer ist ein Fehler, sieben sind Verbesserungen, einer nimmt etwas weg — und
**kein einziger** von ihnen stand im Fahrplan oder im Sammelblatt, bevor jemand
die Anlage benutzt hat.* **Ein zehnter ist beim Bauen dazugekommen** (Abschnitt
5a): derselbe blinde Fleck wie der erste, eine Ansicht weiter, gefunden durch
dieselbe Frage.

> **DIE NUMMER WAR DIE ERSTE ENTSCHEIDUNG DER RUNDE.** Der Auftrag ging als
> `0.16.1` in die Besprechung — sieben der acht Punkte betreffen Anzeige und
> Wortlaut. **Punkt 3 kippt es:** sagt die Glockentafel „3 Kommentare ·
> 4 Bewertungen" statt „7 neue Beiträge", **kann die Anlage danach etwas, was
> sie vorher nicht konnte** — sie sagt, WAS auf einen wartet.
> *Projektstand 5.1: „Dritte Zahl (PATCH) nur für abwärtskompatible
> Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist keine
> PATCH-Runde — auch dann nicht, wenn sie klein ist."*
> **Das war die zweite Runde, in der diese Frage fällig war, und beide Male ist
> sie gleich ausgefallen** — 0.15.0 ging als `0.14.1` in die Besprechung und
> wurde gehoben. *Eine Regel, die man beim zweiten Mal wieder anwendet, ist
> eine Regel.* **Der Fahrplan rückt entsprechend: Suche auf 0.18.0,
> Bereinigung auf 0.19.0.**

> **DIES IST KEINE DATENBANKSTUFE — und der Unterschied zu 0.16.0 gehört
> benannt.** Kein Schema, kein Migrationsblock, keine neue Formatnummer: es
> bleibt bei **sieben** markierten Blöcken und beim Austauschformat **11**.
> Punkt 3 und Punkt 5 lesen beide nur, was ohnehin dasteht. **DIE SICHERUNG DES
> DATENVERZEICHNISSES IST DESHALB EMPFEHLUNG UND NICHT PFLICHT** — *bei 0.16.0
> war sie Pflicht, und zwar wegen des siebten Migrationsblocks; den gibt es
> hier nicht. Wer den Unterschied nicht ausspricht, lässt einen Betreiber über
> beides hinweglesen.*

**ALLE NEUN PUNKTE SIND GEBAUT.** *Der Auftrag nannte eine Reihenfolge des
Schnitts — zuerst Punkt 5, dann Punkt 3, dann die Kartenbreite aus Punkt 4;
gebraucht wurde sie nicht.*

---

## Inhalt

1. [Das Raster der Kriterienliste](#1-das-raster-der-kriterienliste)
2. [Zwei Erklärtexte verlassen die Oberfläche](#2-zwei-erklärtexte-verlassen-die-oberfläche)
3. [Die Glockentafel sagt, was neu ist](#3-die-glockentafel-sagt-was-neu-ist)
4. [Drei Maße vom echten Gerät](#4-drei-maße-vom-echten-gerät)
5. [Die Vergleichszahl ohne Gewichtung](#5-die-vergleichszahl-ohne-gewichtung)
   · [5a. Der Verweis im Erklärkasten — ein zehnter Befund](#5a-der-verweis-im-erklärkasten--ein-zehnter-befund)
6. [Die Glocke ersetzt die Pille](#6-die-glocke-ersetzt-die-pille)
7. [Die Entscheidungen dieser Runde](#7-die-entscheidungen-dieser-runde)
8. [Was je Datei geändert wurde](#8-was-je-datei-geändert-wurde)
9. [Der Prüfstand](#9-der-prüfstand)
10. [Gegenproben](#10-gegenproben)
11. [Neue Stolpersteine](#11-neue-stolpersteine)
12. [Die Zahlen](#12-die-zahlen)
13. [Was ausdrücklich nicht passiert ist](#13-was-ausdrücklich-nicht-passiert-ist)
14. [Offen geblieben](#14-offen-geblieben)

---

## 1. Das Raster der Kriterienliste

**Der einzige Fehler der Runde, und der einzige Punkt, der nicht fallen
durfte.**

**Befund aus dem Betrieb:** an einem Eintrag mit drei Kriterien standen Namen
und Sternreihen nicht untereinander, sondern versetzt — *Name · Sterne ·
nächster Name / Sterne · übernächster Name · Sterne.*

**DIE URSACHE, vollständig.** `.rlist` war ein Raster mit **drei** Spalten
(`1fr auto auto`), `.rrow` ist `display: contents`. Die Durchschnittsspalte
hängt `drawRatings()` aber nur an, **wenn `mehrereBenutzer()` gilt**. Bei einem
einzigen Zugang liefert jede Zeile damit **zwei** Zellen in ein
Dreispaltenraster, und die Selbstanordnung schiebt alles um eine Spalte weiter.

**SIE IST ÄLTER ALS 0.16.0.** Das Raster kam mit **0.14.0**, die bedingte
Spalte gibt es seit **0.8.91**. **Sichtbar geworden ist sie erst, als die
Gewichtsmarken `×1,25` (0.8.40, in der Liste seit 0.16.0) die Namensspalte
breiter machten.** *Die richtige Zuordnung ist hier mehr wert als der Fehler
selbst: wer sie 0.16.0 zuschriebe, suchte beim nächsten Mal an der falschen
Stelle* (Stolperstein 216).

**GEBAUT:** die Spaltenzahl folgt dem Zustand. Eine Klasse am Kasten, die bei
einem Zugang auf `1fr auto` geht —

```js
const mitSchnitt = mehrereBenutzer();
box.className = 'rlist' + (mitSchnitt ? '' : ' ohne-schnitt');
…
if (mitSchnitt) { /* die Durchschnittszelle */ }
```

```css
.rlist { display: grid; grid-template-columns: 1fr auto auto; }
.rlist.ohne-schnitt { grid-template-columns: 1fr auto; }
```

**`mitSchnitt` steht EINMAL und wird zweimal gelesen.** *Ein zweiter Aufruf von
`mehrereBenutzer()` an der Zelle wäre zwei Wahrheiten über dieselbe Frage
(Stolperstein 47) — und die eine ließe sich ändern, ohne dass die andere
mitginge. Genau so ist der Fehler entstanden.*

### Der eigentliche Befund: keine Prüfung konnte ihn sehen

**Die Gegenlage mit einem einzigen Zugang gab es** — `eEinzeln` zeichnet die
Kriterienliste seit 0.8.91 mit `benutzerZahl: 1`. Sie trug **genau zwei
Zusagen**: *„Bei einem einzigen Zugang bleibt die Spalte weg"* und *„Die
Sternzeilen stehen trotzdem vollständig da"* — und **beide waren im kaputten
Zustand grün**. Die Zelle war weg, richtig gefragt; die Spalte, in die sie
gehörte, blieb stehen, nie gefragt. Alle übrigen Prüflagen der Kriterienliste
fuhren mit `benutzerZahl: 3`, also in dem Fall, in dem die dritte Zelle da ist
und das Raster aufgeht. *Der Auftrag zu 0.16.0 hatte die Falle sogar benannt —
„eine Lage mit einem einzigen Zugang kann über die Glocke nichts belegen" — und
niemand hat sie auf die Kriterienliste angewandt.*

**Die neue Gruppe prüft deshalb mehr als den Fehler:** sie zählt die **Zellen
je Zeile** als echte Kindknoten aus dem Aufbau und die **Spalten** aus der
Regel im Stilblatt, die auf genau diese Klassen zutrifft, und hält fest, dass
beide Zahlen zusammenpassen — **in BEIDEN Lagen**. *Eine Prüfung, die nur den
einen Fall ansähe, wäre dieselbe Blindheit mit umgekehrtem Vorzeichen.*
**Sie liest ausdrücklich nicht bloß die Klasse** (Stolperstein 223): ein
Rückbau, der die Klasse setzt und die Regel wegnimmt, wird trotzdem rot — dafür
gibt es die beiden Rückbauten 301 und 302.

---

## 2. Zwei Erklärtexte verlassen die Oberfläche

**Zweimal derselbe Fehler:** eine Begründung, die in ein Papier gehört, ist in
die Anlage gerutscht.

| wo | was |
|---|---|
| **Kennzahlen, „Verfahren"** | *„Welche Fassung welcher Bibliothek das rechnet, steht hier nicht: das wäre die Angabe, nach der jemand sucht, der eine Lücke ausnutzen will."* |
| **Glockentafel** | *„Was die Glocke nicht verspricht"* — drei Sätze plus Überschrift über den Zeitpunkt der Berechnung, den fehlenden Lesestand je Meldung und Bewertungen von vor 0.16.0 |

**Beide sind ersatzlos gestrichen.** *Die Vorbehalte selbst gelten unverändert
— gestrichen ist ihre Begründung an der Oberfläche.*

> **DER AUFTRAG SAGTE „SIE STEHEN IN DER README BEREITS, WORT FÜR WORT", UND
> DAS IST FÜR DEN ERSTEN NICHT GANZ RICHTIG.** Nachgesehen vor dem Streichen:
> die README trägt die **Sache** an beiden Stellen (Zeile 1360 ff. und
> 1560 ff.), beim Satz über die Bibliotheksfassung aber in **anderen Worten** —
> *„Welche Fassung welcher Bibliothek das rechnet, steht dort ausdrücklich
> nicht. Ein Verfahrensname sagt, wie gerechnet wird; eine Versionsnummer sagt,
> welche Lücke passt."* **Der Halbsatz mit der „Lücke, die jemand ausnutzen
> will" steht dort nicht.** *Das ist ein Befund und kein Hindernis: die Aussage
> ist vollständig da, der Wortlaut ist es nicht — und der Auftrag verlangte
> ausdrücklich, das vorher nachzusehen.*

**GEBAUT:**

* Der Satz in `karteKennzahlen()` fällt; **der erste Satz desselben Absatzes
  bleibt** (*„Der Schlüssel geht roh in die Datenbank … sondern schon 256
  Zufallsbits trägt"*) — er sagt, WAS IST. *Wer den ganzen Absatz nähme, nähme
  mehr als beauftragt und risse dabei den ternären Ausdruck auf.*
* Der `<p class="hint hint-sm">` in `zeigeGlockentafel()` fällt ganz.
* **Drei Kommentare, die auf die gestrichenen Texte zeigten, sind nachgezogen**
  — sie behaupteten, die Auskunft stehe „in der Tafel selbst". *Was aus der
  Prüfung fällt, muss auch aus dem Kommentar* (Stolperstein 199, andersherum).

**DIE REGEL DAHINTER STEHT JETZT IM PROJEKTSTAND, ABSCHNITT 5.6:** *eine
Oberfläche sagt, WAS IST — nicht, warum es so gebaut wurde.* **Der deutlichste
Fall ist eine Versionsnummer in einem Dialog:** für den, der davorsteht, ohne
Bedeutung, und in einem Jahr falsch. **Nach dieser Runde steht keine einzige
mehr in der ausgelieferten Oberfläche** (nachgesehen über `public/app.js`,
kommentarbereinigt, und `public/index.html`).

**Die Prüfungen sind mitgenommen und nicht gelöscht** (Stolperstein 201): aus
*„die Tafel sagt, was sie nicht verspricht"* ist *„die Tafel begründet sich
nicht mehr selbst"* geworden, mit dem Grund darüber — **und daneben steht die
Zeile, dass die Auskunft dafür in der README steht.** *Ein Text, der aus der
Anlage fällt und nirgends sonst steht, ist verloren und nicht umgezogen
(Stolperstein 81).*


### Die Auftragsfrage: steht dieselbe Art Satz noch woanders?

**Ja — an zwölf weiteren Stellen in `public/app.js`.** *Der Auftrag verlangte
ausdrücklich nachsehen und aufschreiben, nicht beheben.* Gesucht wurde
systematisch: Quelltext kommentarbereinigt, dann über die sichtbaren Texte
gefiltert nach *weil · wäre · sonst · deshalb · denn · mit Absicht · gewollt ·
bleibt so*.

*Die Zeilennummern gelten dem Stand **0.17.0**; wer sie später sucht, sucht
den Wortlaut und nicht die Zahl.*

| Zeile | Karte / Ort | Wortlaut (gekürzt) |
|---:|---|---|
| 4614 | Erklärkasten | „geht gar nicht ein — **sonst zöge es die Zahl nach unten**, ohne dass es an den Werten läge" |
| 5950 | Meine Sitzungen | „speichert weder Adresse noch Browserkennung — **das ist so gewollt und bleibt so**" |
| 6128 | Tags | „Am Zeitpunkt bleibt sie stehen, **weil es dort keine Wolke gibt**" |
| 6481 | Links | „Gespeichert bleibt der Rohtext — ein Anbieterwechsel **gilt deshalb rückwirkend**" |
| 7141 | Gelöschte Zugänge | „die Anlage bewahrt ihn nirgends auf, **denn der Grabstein IST das Löschen**" |
| 7199 | Anfragen | „**Der Schalter wird deshalb nicht von selbst umgelegt**: er steht so, wie ihr ihn gestellt habt" |
| 7314 | Sicherheitsprotokoll | „das ist **kein Änderungsverlauf, und das bleibt so**" |
| 7318 | Sicherheitsprotokoll | „**ein Sicherheitsprotokoll, das sich wegräumen lässt, wäre keins**" |
| 7605 | Mailversand | „über einen gefälschten Kopf **ließe sich ein Rücksetzlink auf einen fremden Server umbiegen**" |
| 7653 | Mailversand | „und zwar **mit Absicht: ein Knopf, der an eine beliebige Adresse schickt, wäre ein offener Mailverteiler** hinter einer Anmeldung" |
| 7820 | Kennzahlen | „ohne Ableitung, **weil er kein Passwort ist**, sondern schon 256 Zufallsbits trägt" |
| 7992 | Export | „deutlich größer, **weil Bilder als Text kodiert werden müssen** — rechne mit rund einem Drittel Aufschlag" |

**DREI DAVON SIND GRENZFÄLLE UND MÖGLICHERWEISE GAR KEIN BEFUND:** 7605 und
7653 sind **fachliche Warnungen** — die Auflage lässt sie ausdrücklich zu —,
und 7992 trägt eine **Handlungsanweisung** („rechne mit einem Drittel
Aufschlag"). *Der Unterschied ist die Frage, die der Satz beantwortet: „was
passiert, wenn ich das tue" ja — „warum haben wir das so gebaut" nein.*

**DIE KLARSTEN FÄLLE SIND 7318 UND 7653** — beide ein Konjunktiv über eine
hypothetische andere Bauweise, wortgleich in der Machart mit dem gerade
gestrichenen Satz.

**UND EINE IRONIE, die mitgeschrieben gehört:** **7820 ist der Satz, der von
Punkt 2 stehenbleibt** — und er begründet selbst („ohne Ableitung, **weil** er
kein Passwort ist"). *Er sagt zwar auch, was ist; scharf ist die Grenze dort
nicht, und der Auftrag zieht sie an dieser Stelle nicht.*

**Keine dieser zwölf Stellen ist in dieser Runde angefasst worden.** Sie stehen
als Zeile im Sammelblatt, Teil II.

---

## 3. Die Glockentafel sagt, was neu ist

**Befund:** in der Tafel stand je Eintrag „**7 neue Beiträge**" — und offen
blieb, ob das Kommentare sind, Bewertungen oder offene Aufgaben. *„Beitrag" ist
ein Sammelwort, das die Anlage sonst nirgends benutzt.*

**DIE AUSKUNFT LAG BEREITS VOR UND WURDE WEGGEWORFEN.** `server.js` fragt
`qNeueKommentare` und `qNeueBewertungen` seit 0.16.0 **getrennt** ab und
addierte beide in derselben Schleife zu einer Zahl.

**GEBAUT — server.js:** aus `neuFremd` werden zwei Zahlen und eine Liste.

```js
if (bezug) it.neuKommentare  = neuKommJe.get(it.id) || 0;
if (bezug) it.neuBewertungen = neuBewJe.get(it.id) || 0;
if (bezug) it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => verfasserAus(karte, uid));
```

**KEINE ZUSÄTZLICHE ABFRAGE.** Die beiden Gruppenabfragen gruppieren seither
nach `item_id, user_id` statt nur nach `item_id` — **dieselbe eine Abfrage, nur
eine Spalte breiter.**

**UND KEINE SUMME AN DER ANTWORT.** *Sie folgt aus den beiden Zahlen; eine
Summe neben ihren Teilen wäre eine zweite Wahrheit über dieselbe Sache
(Stolperstein 47) — und die Glocke summiert über ALLE Einträge, wäre also einen
Handgriff davon entfernt, doppelt zu zählen.* **Gebildet wird sie in der
Oberfläche, an genau einer Stelle:**

```js
const neuAn = (i) => (Number(i.neuKommentare) || 0) + (Number(i.neuBewertungen) || 0);
```

**Die drei Angaben stehen oder fehlen GEMEINSAM.** *Ohne gespeicherten
Bezugspunkt fehlen sie ganz und stehen nicht auf 0 — „nichts Neues" und „es
gibt keinen Bezugspunkt" sind zwei verschiedene Aussagen. Eine Antwort mit nur
einer davon wäre eine dritte Lage, die niemand kennt.*

**GEBAUT — die Zeile der Tafel:**

```
Titel                                    3 Kommentare · 4 Bewertungen
von bert und carla
```

**Bei nur einer Art steht auch nur eine Angabe da** — „0 Bewertungen" wäre eine
Auskunft über nichts, **dieselbe Regel wie die fehlende Null am Knopf „Offen"**.
**Ein- und Mehrzahl sind ausgeschrieben** („1 Kommentar", nicht „1 Kommentare").
**Sortiert wird nach der SUMME** — ein Eintrag mit vier neuen Bewertungen stünde
sonst unter einem mit einem Kommentar.

**DIE ZAHL AM KNOPF „OFFEN" BLEIBT EINE ZAHL**, und der Titel der Glocke
ebenfalls: *er beantwortet „gibt es etwas", die Tafel beantwortet „was".* Eine
Aufzählung im Titel machte aus einem Hinweis eine Liste.

---

## 4. Drei Maße vom echten Gerät

**Alle drei sind in jsdom nicht zu messen — dort ist jede Breite und jede Höhe
null.** Geprüft wird deshalb an beiden Enden: dass der Aufbau die Gegenstände
wirklich trägt, und dass am Stilblatt die Regel dazu hängt.

### a) Die Versionszeile stand auf dem Telefon unter der Falz

*(Samsung S21 5G.)* **Die Ursache ist die Einheit, nicht der Abstand:**
`body.anmeldung` trug `min-height: 100vh`, und **`vh` ist auf dem Telefon die
GROSSE Anzeigefläche** — die ohne Browserleisten, also die, die man nicht
sieht. Die Seite war damit höher als das Fenster. *Der Abstand ist seit 0.15.x
zweimal verkleinert worden und war nie die Ursache; die Karte ist mittig
gesetzt, einen festen oberen Abstand gibt es gar nicht.*

```css
body.anmeldung { … min-height: 100vh; min-height: 100dvh; }
```

**Der Rückfall steht DAVOR und nicht dahinter:** ein Browser, der `dvh` nicht
kennt, überliest die zweite Zeile und behält die erste. *Dieselbe Bauform wie
`max-height: 62vh; max-height: 62dvh` an den Listen, seit 0.12.0.*

> **ABWEICHUNG VOM AUFTRAG, ausdrücklich:** `.login-screen` trägt dieselbe
> Höhe und ist im Auftrag nicht genannt. **Sie ist mitgeändert worden.**
> *Die Regel an `body.anmeldung` hebt sie zwar auf, solange die Kennzeichnung
> am `body` steht — aber zwei Stellen mit derselben Aussage dürfen nicht zwei
> Einheiten tragen (Stolperstein 47).*

### b) Der orangene Rahmen der eigenen Anmeldung reichte nicht bis zum Rand

`.manage-list` trägt `overflow-y: auto` — **und damit steht `overflow-x` nach
der CSS-Regel ebenfalls auf `auto`**, ohne dass es jemand hingeschrieben hätte.
Die Zeile ist breiter als der Kasten (`.sitz-zeit` trägt `flex-shrink: 0` an
**zwei** Zeitangaben), also entsteht ein Bildlauf zur Seite; die Zeile ist aber
nur so breit wie der **sichtbare** Ausschnitt, und ihr Rahmen endet dort.

**GEBAUT: das Umbrechen, und zwar IMMER.** `.mrow.sitz { flex-wrap: wrap;
row-gap: 2px; }` steht seither außerhalb jeder Medienabfrage. **Die ANORDNUNG
der umgebrochenen Stücke bleibt dem schmalen Schirm** (`order`, `flex` an
`.mname`, `.zug-akt`, `.sitz-zeit`) — *sie ist eine Anordnung und keine Frage
des Umbruchs.*

*Der andere Weg (`min-width: max-content`) beließe den seitlichen Bildlauf, und
der ist auf dem Telefon schwer zu treffen.*

> **DER BEFUND IST KEIN REINER TELEFONBEFUND, und das gehört gesagt:** „Meine
> Sitzungen" ist eine **schmale** Kachel (`minmax(300px, 1fr)`). Zwei
> nicht nachgebende Zeitangaben laufen auch am Desktop aus 300 Pixeln heraus.
> *Deshalb ist „gilt künftig immer" die richtige Antwort und nicht bloß die
> bequeme — sonst sperrt sie jemand später wieder in eine Medienabfrage ein.*

### c) Die Karte „Mailversand" stand schmal unter drei breiten

Seit 0.16.0 stehen „Zugänge", „Anfragen", „Sicherheitsprotokoll" und
„Mailversand" im selben Abschnitt; die ersten drei trugen `.breit`, die vierte
wirkte wie ein Rest. **Sie bekommt ebenfalls `.breit`.**

> **DAMIT ÄNDERT SICH DIE REGEL, und das ist der eigentliche Punkt.** Bis
> 0.16.0 hieß sie: *breit ist eine Karte genau dann, wenn sie eine Liste mit
> vielen Spalten je Zeile trägt.* **„Mailversand" trägt keine Liste, sondern
> Eingabefelder** — die alte Regel erklärte ihren eigenen vierten Fall nicht
> mehr. **Seit 0.17.0 lautet sie: alle Kacheln EINES Abschnitts sind gleich
> breit.** *Vier gleich breite Kacheln sind einfacher zu begründen als drei
> plus ein Rest.* Die Prüfung nennt seither **vier** namentlich und hält
> zusätzlich fest, dass **keine schmale** mehr im Abschnitt steht.

---

## 5. Die Vergleichszahl ohne Gewichtung

**Befund:** die Formel steht Zeile für Zeile da, und trotzdem bleibt offen,
wofür die Gewichte gut sind. **Es fehlte die Vergleichszahl: was käme heraus,
wenn alle Kriterien gleich zählten?**

**GEBAUT — server.js, in `gesamtSchnitt()`, in DERSELBEN Schleife:**

```js
let gleichZaehler = 0;
for (const z of karte.values()) { … gleichZaehler += z.schnitt; … }
if (rechenweg) Object.assign(rechenweg, { …,
  gleichSumme: gleichZaehler, gleichTeiler: zeilen.length,
  gleichRoh: zeilen.length ? gleichZaehler / zeilen.length : null,
  gleichErgebnis: zeilen.length ? Math.round((gleichZaehler / zeilen.length) * 10) / 10 : null });
```

**DER KASTEN LIEST SIE, ER RECHNET SIE NICHT** (Stolperstein 217). *Eine zweite
Rechenstelle im Browser wäre genau das, was 0.16.0 vermieden hat.*
**Ihr Teiler ist die Zahl der BEWERTETEN Kriterien** — sonst verglichen sich
zwei Rechnungen über verschiedene Mengen, und der Unterschied sähe nach
Gewichtung aus, wo er keiner ist.

**Gerundet wird auch bei ihr genau einmal.** *Sie hat keine Zahl über sich, an
der sie hängen könnte, und wird deshalb schon im `Object.assign` gerundet —
`ergebnis` dagegen kommt über `avgRating`. Das sieht nach einer
Unregelmäßigkeit aus und ist keine.*

**IM KASTEN:** eine Zeile `.rz-gleich` unter dem Ergebnis, **mit vier Zellen
wie jede andere Zeile des Vierspaltenrasters** — *eine mit dreien schöbe alles
darunter um eine Spalte weiter, also genau der Fehler, den Punkt 1 derselben
Runde behebt* —, dazu ein Satz, der den Unterschied benennt.

* **Ohne Gewichtung steht sie gar nicht da.** Stehen alle Gewichte auf 1, ist
  sie dieselbe Zahl wie darüber; *zweimal dasselbe hinzuschreiben ist keine
  Auskunft.* **Der Kasten selbst geht weiterhin auf** — er erklärt die zwei
  Schritte, und das ist auch ohne Gewichte nicht selbstverständlich.
* **Sind beide Zahlen gleich, sagt der Kasten das:** *„An dieser Zahl ändert
  die Gewichtung nichts."* **Verglichen werden die beiden ANGEZEIGTEN Zahlen**,
  nicht die ungerundeten — der Kasten sagt etwas über das, was dasteht.

> **DIE PRÜFLAGE MUSS DEN UNTERSCHIED HERSTELLEN KÖNNEN** (Stolpersteine 189
> und 224), **und sie prüft das selbst.** Am Server: Optik 3,0 ×2 · Haptik 3,0
> ×1 · Preis 5,0 ×0,3 → gewichtet **3,2**, ungewichtet **3,7**. Am Bildschirm:
> der Rechenweg der Prüflage nennt `ergebnis: 3` und `gleichErgebnis: 4`, und
> **beide sind ausdrücklich NICHT der Quotient ihrer eigenen Zeilen** — rechnete
> die Oberfläche nach, stünde 3,7 bzw. 3,8 da, und genau daran fällt es auf
> (Stolperstein 102). *Taugt eine der Lagen eines Tages nicht mehr, wird die
> Zeile über sie selbst rot, statt die Zusage darunter stumm werden zu lassen.*


---

## 5a. Der Verweis im Erklärkasten — ein zehnter Befund

> **DIESER PUNKT STAND NICHT IM AUFTRAG.** Er ist beim Bauen von Punkt 5
> aufgefallen, und zwar durch **dieselbe Frage, die Punkt 1 verlangt**: *was
> sieht ein Betreiber, der allein arbeitet?* **Er ist gebaut und nicht bloß
> aufgeschrieben** — anders als die zwölf Erklärsätze aus Punkt 2, denn dies
> ist kein Stilbefund, sondern ein Satz, der auf etwas zeigt, das nicht da ist.
> *Wer die Runde enger schneiden will, nimmt ihn mit einem Commit wieder
> heraus; er hängt an keiner anderen Änderung.*

**Befund.** Der Erklärkasten hinter der Gesamtnote sagte seit 0.16.0:

> *„Zuerst wird je Kriterium der Schnitt über alle Bewertungen gebildet — **das
> sind die Zahlen rechts in den Zeilen**."*

**Gemeint war die Durchschnittsspalte der Kriterienliste DAHINTER.** Bei genau
**einem** Zugang gibt es sie nicht — *bis 0.16.0 stand dort das Trümmerbild aus
Punkt 1, seit dieser Runde steht dort gar nichts.* **Der Satz zeigte also auf
eine Spalte, die für einen Betreiber, der allein arbeitet, nie dastand.**

**GEBAUT — nicht mit einer Bedingung, sondern mit einem anderen Bezugspunkt:**
aus *„das sind die Zahlen rechts in den Zeilen"* wird *„das sind die Zahlen in
der Spalte **Note**"*.

**Die Spalte „Note" gehört dem Kasten selbst** und steht drei Zeilen unter dem
Satz, in jeder Lage. *Eine Bedingung `mehrereBenutzer()` wäre eine zweite
Wahrheit über die Zahl der Zugänge gewesen (Stolperstein 47) — ein Verweis auf
das, was im selben Kasten steht, braucht keine.* **Und er ist obendrein
genauer:** in der Liste steht die Zahl nur rechts, im Kasten heißt die Spalte,
wie sie heißt.

**AM PRÜFSTAND:** drei Zusagen in der bestehenden Lage — der Kasten trägt die
Spalte, der Satz nennt sie, und er nennt die Liste dahinter nicht mehr — **und
eine eigene Lage mit einem einzigen Zugang.** Sie prüft zuerst, dass die Spalte
dahinter dort wirklich fehlt, und dann, dass der Kasten trotzdem aufgeht und
auf seine eigene zeigt. *Ohne diese Lage wäre die Zusage wieder nur eine
Aussage über den Mehrbenutzerbetrieb — Stolperstein 227, zwei Stunden später.*
**Rückbau 330** schreibt den alten Satz zurück.

**Als Stolperstein 232 festgehalten.**

---

## 6. Die Glocke ersetzt die Pille

**Der größte Punkt der Runde, und der einzige, der etwas WEGNIMMT.**

**Entscheidung des Betreibers, 30. August 2026.** Zwei Anzeigen für dieselbe
Frage — *was hat sich getan, seit ich zuletzt hier war* — sind eine zu viel.
**Dazu eine Hausregel, die die Pille verletzte:** sie stand auch dann da, wenn
ihre Zahl **null** war — gedämpft, aber da. *Am Knopf „Offen" steht seit 0.16.0
wörtlich das Gegenteil: „Ohne offene Aufgaben steht dort keine Null."*
**Dieselbe Sache darf nicht zwei Verhalten haben** (Stolperstein 47, im
Kleinen).

### Die vier Punkte, die vor dem Streichen zu beantworten waren

| was die Pille konnte | wie es ausgegangen ist |
|---|---|
| **1. Sie war ein FILTER** auf der Liste, kombinierbar, mit Trefferzahl | **Der Filter fällt weg.** Die Glocke ist eine Tafel, die man wieder verlässt; ein Filter wandert nicht mit. *Die Filterzeile ist damit um eine Pille kürzer — sieben statt acht in der Statuszeile, die Fortsetzung von 0.13.0.* |
| **2. Sie zeigte JEDE Änderung** (`updated_at`) | **Der Verlust bleibt.** Die Glocke bleibt bei Kommentaren und Bewertungen. *Vertretbar, weil eine Titeländerung etwas ist, das jemand **am** Eintrag getan hat, und kein Beitrag, der **für** dich daliegt — und weil die Übersicht ohnehin nach `updated_at` ordnet.* **Wäre der Verlust doch spürbar, ist das ein Befund für eine spätere Runde und kein Grund, die Pille zurückzuholen.** |
| **3. Sie hatte einen ANDEREN Bezugspunkt** (`zuletztGesehen` statt `glockeGesehen`) | **Es bleiben nicht zwei Merker, sondern einer.** `zuletztGesehen` fällt weg; **die persönlichen Schlüssel sinken von neun auf acht — nachgezählt, nicht angenommen.** *Vorhandene Zeilen in `user_settings` bleiben stehen und werden nicht mehr gelesen; kein Migrationsblock.* |
| **4. Sie arbeitete bei EINEM Zugang, die Glocke nicht** | **Die Glocke wird vollständig.** Sie meldet Kommentare und Bewertungen **von ALLEN** seit dem letzten Blick. *Eine Regel statt zwei — keine Sonderbehandlung für den Fall „ein Zugang", denn die wäre selbst wieder eine zweite Wahrheit.* **Der Satz aus 0.16.0 — „Eigene Beiträge stehen nie hier" — ist damit zurückgenommen**, und dieser Vermerk gehört dazu (Stolperstein 201). |

### Die Abweichung: „von wem" gilt nur den Kommentaren

**Der Auftrag verlangt, die Tafel sage bei jeder Zeile dazu, VON WEM.** Die
Zeile zählt Kommentare **und Bewertungen**.

> **DAS WIDERSPRICHT EINER STEHENDEN ENTSCHEIDUNG.** *Sammelblatt, Teil III
> („Geprüft und bewusst nicht vorgeschlagen"):* **„Eine Glocke, die nennt, WER
> bewertet hat. Sie hebelte die Entscheidung aus, dass eine einzelne Bewertung
> anonym bleibt … Die Zahl ja, der Name nie."** *Und im Quelltext steht es
> daneben: `GET /api/items/:id/stimmen` trägt `nurAdmin`, weil „wer wie
> bewertet hat, eine Angabe über einzelne Personen ist".*
>
> **STÜNDE AN EINEM EINTRAG NUR EINE NEUE BEWERTUNG UND EIN NAME, WÜSSTE JEDER
> GEWÖHNLICHE BENUTZER, WER BEWERTET HAT** — und zwar an der Stelle, an der es
> am wenigsten auffällt.
>
> **GEBAUT IST DESHALB DIE FASSUNG, DIE WENIGER PREISGIBT:** `neuVon` wird
> ausschließlich aus `qNeueKommentare` gespeist. **Eine Zeile, an der
> ausschließlich Bewertungen neu sind, trägt keinen Namen.**
> *Ein Kommentar trägt seinen Verfasser am Eintrag ohnehin sichtbar; eine
> Bewertung tut das nicht.* **Das ist keine Ausnahme, sondern dieselbe Regel:
> die Tafel zeigt genau das, was der Eintrag selbst zeigt.**
>
> **Die Zusage steht an beiden Enden im Prüfstand** — am Server („der Bewerter
> steht ausdrücklich nicht bei den Verfassern", dazu die schärfere Lage mit
> einem Eintrag, an dem NUR eine fremde Bewertung neu ist) und an der
> Oberfläche („kein Name steht neben einer reinen Bewertungszeile").
> **Als Stolperstein 230 festgehalten.**

### Was gebaut ist

**`server.js`**

* `qNeueKommentare` / `qNeueBewertungen` verlieren die Bedingung
  `IFNULL(user_id, -1) != ?` und gruppieren nach `item_id, user_id`.
* `PERSOENLICHE_SCHLUESSEL`: neun → **acht**, `zuletztGesehen` fällt.
* Der Getter, die Zeile in `GET /api/settings` und der Schreibweg in
  `PUT /api/settings` fallen mit. **Der Vermerk bleibt als Kommentar stehen** —
  eine zurückgenommene Entscheidung kommt sonst wieder.

**`public/app.js`**

* `ZULETZT_GESEHEN` fällt, `GLOCKE_GESEHEN` bleibt als einziger Merker.
* Die Pille in `drawFilters()` fällt; `f.neu` fällt aus `FILTER_VORGABE` und
  aus `filterZahl()`; `visibleItems()` filtert nicht mehr danach.
* **`filterNormal()` bekommt `delete f.neu`** — eine gespeicherte Ansicht aus
  0.11.0 kann den Schlüssel noch tragen und muss ihn **übergehen** statt daran
  zu scheitern. *Dieselbe Regel wie beim Schlüssel `abgelehnt` in 0.15.0, nur
  andersherum.* **Er muss wirklich herausfallen:** die zurechtgerückte Stellung
  wird Zeichen für Zeichen mit der aktuellen verglichen, und ein
  mitgeschlepptes Feld ließe jede alte Ansicht als „nicht aktiv" erscheinen —
  dieselbe Falle, vor der der Kommentar an `delete f.categoryId` warnt.
  **Der gespeicherte Wert wird nicht zurückgeschrieben.**
* `merkeGesehen()` schickt jetzt **genau einen** Ruf und nur beim ersten
  Verlassen: `if (GLOCKE_GESEHEN) return;`
* **`fmtTagKurz()` ist entfernt** — die Funktion hatte nach dem Streichen der
  Pille keinen Rufer mehr. *Eine Funktion, die niemand ruft, ist kein Vorrat,
  sondern eine Frage an den Nächsten.* Der Vermerk steht an ihrer Stelle.
* Der Knopf heißt „Neu seit deinem letzten Blick" statt „Neu von anderen" —
  in `title`, `aria-label` und im Menüwort auf dem Telefon.

**`auth.js:737` IST EIN FALSCHER FREUND und ist NICHT angefasst:**
`zuletztGesehen: z.last_seen` heißt genauso und ist etwas völlig anderes — die
Zeit in der Liste „Meine Sitzungen". *Ein Suchen-und-Ersetzen über das ganze
Repo hätte die Karte zerstört.*

### Die Prüfungen sind mitgenommen, nicht gelöscht

**Rund dreißig Zusagen hingen an der Pille.** Sie sind **umgedreht** worden:
was sie KONNTE, muss jetzt nachweislich weg sein. Über jeder steht, warum sie
sich geändert hat (Stolperstein 201).

| war | ist |
|---|---|
| Gruppe „Neu seit: der Filter in der Uebersicht" (20 Aufrufstellen) | Gruppe **„Die gestrichene Pille ‚Neu seit …' — 0.17.0"** (14): die Pille ist fort, ihre Beschriftung ebenso, die Statuszeile trägt **sieben statt acht** Pillen, eine gespeicherte Stellung mit `neu` bleibt lesbar und nimmt nichts weg, und die übrigen drei Filter arbeiten unverändert |
| Gruppe „Neu seit: der Merkzeitpunkt" (10 Aufrufstellen) | Gruppe **„Der Bezugspunkt der Glocke in der Oberflaeche"** (10): dieselben Zusagen an derselben Bauform — beim Verlassen und nicht beim Betreten, als Signal und nicht als Uhrzeit, nicht bei jedem Filterklick —, dazu die neue: **genau ein Ruf, und danach keiner mehr** |
| Gruppe „Neu seit: die Sekunde am Rand" | **„Der Bezugspunkt: die Sekunde am Rand"** — gemessen wird jetzt am **Kommentar** statt an `updated_at` des Eintrags, denn genau das ist der Unterschied, um den die Runde die Pille abgelöst hat |
| „Neu seit … mit null Treffern wird gedämpft" | **die Regel galt nie der Pille allein** — sie gilt seit 0.13.0 **jeder** Pille. Belegt wird sie jetzt an einem **Tag** in derselben Lage, und die Regel im Stilblatt wird ausdrücklich daraufhin angesehen, dass sie NICHT nur für Tags gilt |
| „Der eigene zählt ausdrücklich nicht" | **„Der eigene zählt seit 0.17.0 mit"** — die zurückgenommene Entscheidung steht als Zusage da, statt zu verschwinden |
| „Das Verlassen schickt den Merkzeitpunkt" · „nur der Merkzeitpunkt fährt hinaus" | **„Der Ruf trägt genau ein Feld und sonst nichts"** · **„Mit vorhandenem Bezugspunkt fährt beim Verlassen nichts mehr hinaus"** |


---

## 7. Die Entscheidungen dieser Runde

| Frage | Entscheidung | Grund |
|---|---|---|
| **MINOR oder PATCH?** | **MINOR — 0.17.0** | Punkt 3 bringt eine Funktion: die Anlage sagt danach, WAS auf einen wartet. *Projektstand 5.1. Zum zweiten Mal dieselbe Frage, zum zweiten Mal dieselbe Antwort.* |
| **Woher kommt die Spaltenzahl des Rasters?** | aus **`mitSchnitt`**, derselben Größe, die über die Zelle entscheidet | eine zweite Ableitung wäre zwei Wahrheiten, und die eine ließe sich ändern, ohne dass die andere mitginge (Stolperstein 47) |
| **Ganzer Absatz oder nur der Satz?** *(Punkt 2, Kennzahlen)* | **nur der Satz** | der erste Satz sagt, WAS IST, und bleibt. *Wer den Absatz nähme, nähme mehr als beauftragt.* |
| **Wie heißen die neuen Felder?** | **`neuKommentare`, `neuBewertungen`, `neuVon`** — `neuFremd` entfällt | „fremd" wird durch Punkt 6 sachlich falsch. *Die neuen Namen sagen, WAS gezählt wurde, nicht von wem — sie überleben beide Ausgänge von Punkt 6.* |
| **Summe an der Antwort?** | **nein** | sie folgt aus den Teilen; eine Summe daneben wäre eine zweite Wahrheit, und die Glocke summiert über alle Einträge |
| **Wandert der Filter mit in die Glocke?** | **nein, er fällt weg** | *„Beides ist vertretbar, aber es muss dastehen, welches von beidem gilt."* Die Glocke ist eine Tafel, die man wieder verlässt. |
| **Ein Merker oder zwei?** | **einer** — `glockeGesehen` | mit der Pille fällt die zweite Frage weg, für die es den zweiten Merker gab |
| **„Von wem" auch zu Bewertungen?** | **nein, nur zu Kommentaren** | Sammelblatt, Teil III: *„Die Zahl ja, der Name nie."* **Abweichung vom Auftrag, in Richtung weniger Preisgabe** (Stolperstein 230) |
| **`.login-screen` mitändern?** | **ja** | dieselbe Aussage an zwei Stellen darf nicht zwei Einheiten tragen. **Abweichung vom Auftrag, ausdrücklich** |
| **`fmtTagKurz()` stehenlassen?** | **nein, entfernt** | die Funktion hatte keinen Rufer mehr |
| **Alle vier Kacheln des Abschnitts breit?** | **ja** | vier gleich breite Kacheln sind einfacher zu begründen als drei plus ein Rest — und die alte Regel erklärte ihren eigenen vierten Fall nicht mehr |
| **Der Verweis im Erklärkasten: Bedingung oder anderer Bezugspunkt?** | **anderer Bezugspunkt** — der Kasten nennt seine eigene Spalte „Note" | eine Bedingung wäre eine zweite Wahrheit über die Zahl der Zugänge (Stolperstein 47); die eigene Spalte steht in jeder Lage da. **Zehnter Befund, nicht im Auftrag** |
| **Zeilen mit `key = 'zuletztGesehen'` löschen?** | **nein** | kein Schema, kein Migrationsblock in dieser Runde; eine Migration, die persönliche Zeilen löscht, wäre teurer als die Zeilen selbst |

---

## 8. Was je Datei geändert wurde

| Datei | was |
|---|---|
| `public/app.js` | **Punkt 1:** `mitSchnitt` in `drawRatings()`, einmal gebildet, zweimal gelesen. **Punkt 2:** der Satz in `karteKennzahlen()` und der `<p class="hint hint-sm">` in `zeigeGlockentafel()` gestrichen, drei Kommentare nachgezogen. **Punkt 3+6:** neu `neuAn()`, `neuWorte()`, `neuVonWorte()`; `glockeNeu()` liest die beiden Zahlen; `zeigeGlockentafel()` baut drei Stücke je Zeile und trägt eine neue Überschrift; der Knopf heißt anders. **Punkt 4c:** `karteMailversand()` bekommt `.breit`. **Punkt 5:** `zeigeRechnung()` bekommt `gleicheZahl`, die Zeile `.rz-gleich` und den Satz darunter. **Punkt 6:** `ZULETZT_GESEHEN`, die Pille, `f.neu` in `FILTER_VORGABE`/`filterZahl()`/`visibleItems()` und `fmtTagKurz()` entfernt; `filterNormal()` bekommt `delete f.neu`; `merkeGesehen()` schickt genau einen Ruf. **Punkt 5a:** der Satz im Erklärkasten nennt die eigene Spalte „Note" statt „die Zahlen rechts in den Zeilen". |
| `public/style.css` | `.rlist.ohne-schnitt` (Punkt 1); `100dvh` mit Rückfall an `body.anmeldung` **und** `.login-screen`, `.mrow.sitz` aus der Medienabfrage heraus (Punkt 4); `.rz-gleich` (Punkt 5); `.mrow.glocken-zeile` und `.glocken-zeile .glocken-von` (Punkt 3+6). *Dazu zwei Kommentare nachgezogen, die die gestrichene Pille noch als vorhanden führten.* |
| `server.js` | `gesamtSchnitt()` rechnet die Vergleichszahl in derselben Schleife mit (Punkt 5); `qNeueKommentare`/`qNeueBewertungen` gruppieren nach Eintrag **und** Verfasser und lassen die Bedingung „nur fremde" fallen; `GET /api/items` trägt drei Angaben statt einer; `PERSOENLICHE_SCHLUESSEL` neun → acht, `zuletztGesehen` samt Getter und Schreibweg entfernt, der Vermerk bleibt. |
| `pruefung.js` | Vier neue Gruppen; neue Zusagen in vier vorhandenen; rund dreißig Zusagen an die Pille **umgedreht** statt gelöscht; die Mock-Lage kennt `neuKommentare`/`neuBewertungen`/`neuVon` und `rechenwegGleich`; neu die Helfer `rasterSpalten()`, `ohneMedien` und `liesmichText`; die Zahl der Rückbauten und der persönlichen Schlüssel nachgezogen; neu die Zusage, dass die Version im Lockfile an **beiden** Stellen steht; `rasterSpalten()` wählt nach **Spezifität** statt nach Platz und prüft das an sich selbst; die Zusage zum Spaltenabstand fragt nach dem **Wähler** statt nach `rzRegeln[1]`; die 0.14.0-Zusage über drei Spalten ist auf die **allgemeine** Regel eingegrenzt (Stolperstein 201); dazu die vier Zusagen zu Punkt 5a. |
| `gegenprobe.js` | **33 neue (301–333)**; **zehn vorhandene nachgezogen** (143, 208, 238, 239, 252, 282, 283, 285, 286, 291), einer davon (286) **umgedreht**, einer (238) in zwei zerlegt. *329 schließt die letzte blinde Stelle der neuen Gruppe — die Zelle löst sich von der Bedingung, während die Klasse bleibt, die Gegenrichtung zu 301; 330 gehört zu Punkt 5a.* |
| `README.md` | Der Erklärkasten bekommt die Vergleichszahl; „Die Glocke und der Zähler ‚Offen'" ist umgeschrieben (von allen, was neu ist, von wem, und was verlorengeht); die Pille aus der Filterliste und aus der Kopfzeile der Tabelle entfernt; acht statt neun persönliche Schlüssel. |
| `CHANGELOG.md` | Eintrag `0.17.0` in der Form der Nachbarn, samt „Was du danach von Hand tun musst" (**Sicherung ist Empfehlung**) und dem Vergleichsverweis am Ende. |
| `Doku/Projektstand_Kriterion_0_16_0.md` → `_0_17_0.md` | **`git mv`.** Kopf (Revision 40), Betriebsstand samt Einspielweg, die Einstellungstabelle, die Filterleiste, **Abschnitt 5.6 mit der neuen Regel**, die Glocke in 5.6, **Stolpersteine 226–235**, Prüfstand, Versionsgeschichte, Abschnitt 8, Abschnitt 10 und 10a. *Kein anderes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo; die Nennungen in älteren Änderungsprotokollen meinen ihre eigene Version und bleiben.* |
| `Doku/Fehler_und_Ideen.md` | Wegweiser auf **GEBAUT**; der Kasten in Teil II sagt, dass nichts zurückgekommen ist; **drei neue Zeilen** (die zwölf Erklärsätze, die tote Regel `.rz-summe:first-of-type`, und in Teil II unter „Am Prüfstand" der Werkzeugbefund an `gegenprobe.js`); der Vermerk an der zurückgenommenen Zeile in Teil III; zwei Fahrplanverweise von 0.17.0 auf 0.18.0 nachgezogen. |
| `db.js`, `auth.js`, `mail.js`, `anhaenge.js`, `keys.js`, `zugang.js`, `schluessel.js`, `zweifaktor.js` | **unverändert.** |


---

## 9. Der Prüfstand

**4630 von 4630 bestanden — 4523 waren es vorher, also 107 neue netto.**

**Vier neue Gruppen mit zusammen 59 Prüfungen:**

| neue Gruppe | Prüfungen |
|---|---|
| Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0 | 19 |
| Zwei Masse vom echten Geraet — 0.17.0 | 16 |
| Die gestrichene Pille „Neu seit …" — 0.17.0 | 14 |
| Der Bezugspunkt der Glocke in der Oberflaeche | 10 |
| **zusammen** | **59** |

**ZWEI GRUPPEN SIND DABEI AUFGELÖST WORDEN, NICHT GELÖSCHT.** „Neu seit: der
Filter in der Uebersicht" und „Neu seit: der Merkzeitpunkt" prüften eine Pille,
die es nicht mehr gibt; ihre Zusagen stehen umgedreht in den beiden neuen
Gruppen. *Deshalb ist die Zahl der neuen Gruppen vier und die Zahl der neuen
Prüfungen netto 107 und nicht 59 plus alles.*

**Die übrigen stehen in vorhandenen Gruppen:**

| vorhandene Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| Die Glocke in der Kopfzeile | 22 | **51** | die getrennten Zahlen, Ein- und Mehrzahl, die Namen, die Sortierung nach der Summe, die Lage mit **einem** Zugang, die Regel im Stilblatt |
| Die Rechnung hinter der Kopfzahl | 18 | **47** | die Vergleichszahl, die Lage ohne Gewichtung, die Lage mit gleichen Zahlen; der Verweis auf die eigene Spalte samt einer Lage mit **einem** Zugang (Punkt 5a); die **gelesene** Spaltenzahl des Kastens an jeder Zeile; und die Regel `.rz-gleich > span` mit ihren vier Zusagen |
| Die Glocke: was mit der Liste mitreist | 17 | **25** | drei Angaben statt einer, beide Richtungen der Aufteilung, der Bewerter ohne Namen |
| Der Rechenweg reist mit | 8 | **14** | die Vergleichszahl am Server samt Selbstprobe der Lage |
| Der Papierkorb in der Oberflaeche | 50 | **53** | die Kennzahlen begründen den Vorbehalt nicht mehr, und die README trägt ihn |
| Der Systembereich nach Rolle | 66 | **67** | vier breite Kacheln statt drei, und keine schmale mehr im Abschnitt |
| Persoenliche Einstellungen | — | **43** | acht statt neun Schlüssel, `zuletztGesehen` steht in keiner Zeile Code mehr, der Vermerk bleibt |
| Der Bezugspunkt: die Sekunde am Rand | — | **4** | dieselbe Zusage, gemessen am Kommentar statt an `updated_at` |

**Zahlen in vorhandenen Gruppen nachgezogen:** 300 → **333** Rückbauten, neun →
**acht** persönliche Schlüssel, fünf statt sechs Zeilen beim zweiten Zugang.

**EINE ZUSAGE AUS 0.14.0 IST MITGEGANGEN** (Stolperstein 201): *„Die
Kriterienliste ist ein Raster über drei Spalten"* heißt jetzt *„Die **allgemeine
Regel** der Kriterienliste ist ein Raster über drei Spalten"*. **Ab dieser Runde
war der alte Wortlaut die halbe Wahrheit** — bei genau einem Zugang sind es
zwei. *Die Zahl der Prüfungen ändert sich dadurch nicht; die Aussage schon.*

> **DREI NEUE HELFER IM PRÜFSTAND, und einer davon hat sich beim Bauen als
> Falle erwiesen.**
>
> * **`rasterSpalten(klassen)`** liest aus dem Stilblatt, wie viele Spuren ein
>   Kasten mit genau diesen Klassen hätte. **Der erste Anlauf las gar nichts**
>   — ein Ausdruck mit einem Anker DAVOR frisst die schließende Klammer der
>   vorigen Regel auf und überspringt damit jede zweite; dazu tragen
>   Kommentare selbst Klammern und Punkte. *Er lieferte für beide
>   Klassenstellungen 0, und der Rückbau daneben hätte trotzdem „greifend"
>   gemeldet.* **Jetzt: Kommentare weg, dann von Klammer zu Klammer schneiden**
>   (Stolperstein 228). **Und der zweite Anlauf hatte noch einen Fehler:** er
>   nahm die **letzte** passende Regel, und der Kommentar daneben behauptete,
>   beide Regeln hätten dieselbe Spezifität. *Haben sie nicht — `.rlist` trägt
>   eine Klasse, `.rlist.ohne-schnitt` zwei; die Zahl stimmte aus dem falschen
>   Grund, und wer die beiden umstellte, bekäme wortlos die falsche.*
>   **Jetzt gewinnt die spezifischere, bei Gleichstand die spätere**
>   (Stolperstein 233). **Drei Zeilen prüfen den Leser selbst** — er muss für
>   beide Stellungen etwas finden, die beiden unterscheiden, und die gelieferte
>   Zahl muss nachweislich aus der **zweiklassigen** Regel stammen.
> * **`ohneMedien`** schneidet die Medienabfragen aus dem Stilblatt, damit
>   „gilt auf jedem Schirm" von „gilt unterhalb eines Umbruchpunkts"
>   unterscheidbar wird. *Auch er prüft sich selbst: er muss wirklich etwas
>   wegnehmen und wirklich etwas stehenlassen.*
> * **`liesmichText`** hält die README als einen String bereit. *Gebraucht
>   überall dort, wo ein Text die Oberfläche verlässt: was aus der Anlage
>   fällt und nirgends sonst steht, ist verloren und nicht umgezogen.*


---

## 10. Gegenproben

**300 → 333 Rückbauten.** Die **33 neuen (301–333)** decken die Zusagen dieser
Runde ab: die Spaltenzahl des Rasters und die Regel dazu, die beiden Maße vom
echten Gerät, die Kartenbreite, die Vergleichszahl in beiden Richtungen (fällt
weg / rechnet die Gewichte doch mit / wird nicht gerundet / wird im Browser
nachgerechnet), die aufgeteilte Glockentafel samt Null und Mehrzahl, die Namen
und ihre Aufzählung, die gestrichene Pille, den einen Ruf beim Verlassen — und
**zwei, die die gestrichenen Erklärtexte wieder hinschreiben.** *Ein
gestrichener Text lässt sich nur zurückbauen, indem man ihn wieder hinschreibt.*

**DIE BEIDEN LETZTEN SIND SPÄTER DAZUGEKOMMEN, BEIM NACHSEHEN.** **329** ist die
**Gegenrichtung zu 301**: dort fällt die *Klasse* weg und das Raster bleibt bei
drei Spalten, hier bleibt die Klasse und die **Zelle** löst sich von der
Bedingung — drei Zellen in zwei Spalten. *Ohne ihn belegte nichts, dass die neue
Gruppe Zellen **gegen** Spalten hält und nicht bloß eine Klasse liest
(Stolperstein 223) — und das ist genau die Zusage, für die es die Gruppe gibt.*
**330** gehört zum zehnten Befund (Abschnitt 5a) und schreibt den alten Satz im
Erklärkasten zurück.

**UND DREI, DIE EINE LÜCKE IN DIESER RUNDE SELBST SCHLIESSEN.** *Die Zusage
„die Vergleichszeile trägt vier Zellen wie jede andere" hatte die **Vier in die
Prüfung getippt** — das Raster des Erklärkastens steht mit
`grid-template-columns: 1fr auto auto auto` im Stilblatt und wurde nirgends
gelesen.* **Das ist wörtlich der Fehler aus Punkt 1, in der Prüfung zu Punkt 5**
(Stolperstein 47/223): wer die Spaltenzahl des Kastens änderte, bekäme eine
grüne Zusage über ein zerfallenes Raster. **Die Zahl wird jetzt gelesen wie an
der Kriterienliste**, und geprüft wird sie an **jeder** Zeile des Kastens.
**331** nimmt dem Raster eine Spalte, **333** der Zeile eine Zelle — *beide
Richtungen, weil eine allein die andere nicht belegt.*
**Dazu 332:** die Regel `.rz-gleich > span` machte im Kommentar **vier**
Zusagen — gedämpft, ohne fetten Schnitt, ein Strich darüber, keine neue Farbe —
und **keine einzige stand in einer Prüfung** (Stolperstein 199). *Sie stehen
jetzt dort, samt der Gegenprobe, dass die Zeile darüber den fetten Schnitt
wirklich trägt (Stolperstein 81).*

**ZEHN VORHANDENE ZEIGTEN AUF ZEILEN, DIE DIESE RUNDE UMGEBAUT HAT** — sie sind
**mitgenommen und nicht gelöscht** (Stolperstein 201). *Ein Rückbau, der ins
Leere greift, ist stumm und verfälscht die Tabelle* (Stolperstein 192).
**Aufgefallen sind sie beim Zählen und nicht beim Lauf:** die Selbstprobe
„jeder Suchtext kommt in seiner Datei genau einmal vor" wurde rot.

| Nr. | war | ist |
|---|---|---|
| **143** | zählte die persönlichen Schlüssel mit `zuletztGesehen` | zählt sie ohne ihn |
| **208** | zielte auf die Dämpfung der Pille „Neu seit …" | zielt auf dieselbe Regel **am Tag** — sie galt nie der Pille allein |
| **238** | ein Zweizeiler über `.rlist` **und** `.rrow` | nur noch `.rlist`; zwischen beiden steht jetzt die neue Regel. **Die zweite Hälfte hat mit 307 ihren eigenen bekommen** — zwei Rückbauten statt einem, und beide zeigen auf eine Zeile, die es gibt |
| **239** | `box.className = 'rlist';` | die Zeile setzt jetzt auch die Klasse für den einen Zugang |
| **252** | zielte auf `abgelehnt: 'all', favorit: false, neu: false,` | `neu` steht nicht mehr in der Vorgabe |
| **282** | zielte auf den einzeiligen `Object.assign` des Rechenwegs | er ist vier Zeilen lang geworden |
| **283** | dieselbe Zeile wie 143 | mit der Zeile davor eindeutig gemacht |
| **285** | `if (bezug) it.neuFremd = …` | `if (bezug) it.neuKommentare = …`; **314 ist dazugekommen** für die Verfasser — die drei Angaben stehen oder fehlen gemeinsam |
| **286** | nahm die Bedingung „nur fremde" **weg** | **UMGEDREHT:** er baut sie **wieder ein**. *Die Entscheidung ist zurückgenommen, der Rückbau bleibt — er muss jetzt in die andere Richtung rot machen.* |
| **291** | `api('PUT', … { glockeGesehen: 1 })` | dieselbe Zeile steht seither **zweimal**; die Zeile davor macht ihn wieder eindeutig |

**DIE TABELLE DER ACHTUNDZWANZIG NEUEN — aus `gegenprobe.js`, nicht
abgeschrieben:**

| Nr. | Datei | was zurückgebaut wird |
|---|---|---|
| **301** | `public/app.js` | Die Spaltenzahl folgt dem Zustand nicht mehr |
| **302** | `public/style.css` | Die Regel fuer den einen Zugang faellt aus dem Stilblatt |
| **303** | `public/style.css` | Die Anmeldeseite misst die Hoehe wieder in vh |
| **304** | `public/style.css` | Der Rueckfall 100vh steht hinter dem dvh statt davor |
| **305** | `public/style.css` | Die Anmeldezeile bricht wieder nur auf dem Telefon um |
| **306** | `public/app.js` | Die Karte „Mailversand" verliert ihre Breite wieder |
| **307** | `public/style.css` | Aus den Rasterzellen wird wieder eine eigene Zeile |
| **308** | `server.js` | Die Vergleichszahl faellt aus dem Rechenweg |
| **309** | `server.js` | Die Vergleichszahl rechnet die Gewichte doch wieder ein |
| **310** | `server.js` | Die Vergleichszahl wird ungerundet ausgeliefert |
| **311** | `public/app.js` | Der Erklaerkasten laesst die Vergleichszahl weg |
| **312** | `public/app.js` | Die Vergleichszahl steht auch ohne jede Gewichtung da |
| **313** | `public/app.js` | Der Kasten rechnet die Vergleichszahl selbst nach |
| **314** | `server.js` | Die Verfasser stehen auch ohne Bezugspunkt an jedem Eintrag |
| **315** | `public/app.js` | Die Tafel zaehlt Kommentare und Bewertungen wieder zusammen |
| **316** | `public/app.js` | Die Tafel schreibt auch die Null hin |
| **317** | `public/app.js` | Die Tafel schreibt die Mehrzahl auch bei einem Kommentar |
| **318** | `server.js` | Der Server legt beide Zahlen wieder in eine Kiste |
| **319** | `public/app.js` | Die Tafel ordnet nach den Kommentaren statt nach der Summe |
| **320** | `public/app.js` | Die Tafel sagt nicht mehr, von wem etwas kommt |
| **321** | `server.js` | Die Abfrage gruppiert nicht mehr nach Verfasser |
| **322** | `public/app.js` | Die Namen werden mit Kommas bis zum Schluss aufgezaehlt |
| **323** | `public/app.js` | Der Schluessel der gestrichenen Pille bleibt in der Stellung stehen |
| **324** | `public/app.js` | Der Bezugspunkt faellt bei jedem Verlassen der Uebersicht |
| **325** | `public/style.css` | Die Zeile der Glockentafel bricht nicht mehr um |
| **326** | `public/style.css` | Die Angabe „von wem" bekommt keine eigene Zeile |
| **327** | `public/app.js` | Die Kennzahlen begruenden den Vorbehalt wieder an der Oberflaeche |
| **328** | `public/app.js` | Die Glockentafel begruendet sich wieder selbst |
| **329** | `public/app.js` | Die Durchschnittszelle haengt nicht mehr an derselben Bedingung |
| **330** | `public/app.js` | Der Erklaerkasten verweist wieder auf die Spalte dahinter |
| **331** | `public/style.css` | Das Raster des Erklaerkastens verliert eine Spalte |
| **332** | `public/style.css` | Die Vergleichszeile wird dem Ergebnis gleichgestellt |
| **333** | `public/app.js` | Die Vergleichszeile bekommt eine Zelle zu wenig |

### Der Lauf — GEGENPROBENLAUF_PLATZHALTER


---

## 11. Neue Stolpersteine

**226 bis 235.** Ausführlich stehen sie im Projektstand, Abschnitt 6; hier je
ein Satz:

* **226 — Ein Raster mit fester Spaltenzahl und einer BEDINGTEN Zelle zerfällt
  in dem Fall, den keine Prüflage fährt.** Die Spaltenzahl folgt derselben
  Bedingung wie die Zelle, nicht einer zweiten daneben.
* **227 — Die Gegenlage mit einem einzigen Zugang gab es; sie trug zwei
  Zusagen, und beide waren im kaputten Zustand grün.** Wer nur nachsieht, was
  fehlt, erfährt nichts darüber, ob das Übriggebliebene noch zusammenpasst.
* **228 — Ein Regex mit einem Anker DAVOR frisst den Anker auf und überspringt
  jede zweite Regel.** Dazu tragen Kommentare selbst Klammern. *Ein Leser, der
  nichts liest, ist schlimmer als keiner: er sieht aus wie einer.*
* **229 — Ein Rückbau, der an einem KOMMENTAR hängt, greift ins Leere, sobald
  jemand den Kommentar besser schreibt.** Der Anker gehört an den Gegenstand.
* **230 — Ein Auftrag kann einer stehenden Entscheidung widersprechen, ohne
  dass es jemandem auffällt.** *Wer einen Auftrag ausführt, liest Teil III des
  Sammelblatts mit — dort steht, was schon einmal geprüft und verworfen wurde.*
* **231 — Ein gewöhnlicher Prüflauf neben einer laufenden Gegenprobe reißt
  deren Spur 0 ab, und ein `pkill` auf den Namen trifft alle Spuren.** Ein
  ABGERISSEN ist erst dann ein Befund, wenn der Lauf allein auf der Maschine
  war.
* **232 — Ein Satz, der auf etwas ANDERES in der Oberfläche zeigt, erbt dessen
  Bedingungen.** „Die Zahlen rechts in den Zeilen" meinte eine Spalte, die es
  bei einem einzigen Zugang nicht gibt. *Die Antwort ist kein neuer Schalter,
  sondern ein Bezugspunkt, der immer dasteht.*
* **233 — Ein Leser, der die Kaskade nach dem PLATZ entscheidet, gibt die
  richtige Zahl aus dem falschen Grund.** Spezifischer schlägt später — und
  gefragt wird nach dem Wähler, nicht nach dem Platz in der Trefferliste.
* **234 — Dieselbe Runde, die eine getippte Spaltenzahl behoben hat, hat eine
  zweite getippt: in der Prüfung, die sie dafür geschrieben hat.** *Eine Lehre
  wandert nicht von selbst; wer sie zieht, sucht am selben Tag die anderen
  Stellen, an denen dieselbe Zahl zweimal steht.*
* **235 — Ein Rückbau, der ein ZWEITES Netz wegnimmt, bleibt stumm.** Die
  Eindeutigkeit der Verfasser kommt aus dem `GROUP BY` und nicht aus der Menge
  darunter. *Der Anker gehört an die tragende Zusage.*

---

## 12. Die Zahlen

| | vorher (0.16.0) | nachher (0.17.0) |
|---|---|---|
| Prüfungen | 4523 | **4630** |
| Rückbauten | 300 | **333** |
| persönliche Schlüssel | 9 | **8** |
| Pillen in der Statuszeile | 8 | **7** |
| breite Karten im Abschnitt „Zugänge" | 3 von 4 | **4 von 4** |
| Karten im Systembereich | 18 | **18** |
| Abschnitte im Systembereich | 5 | **5** |
| markierte Migrationsblöcke | 7 | **7** |
| `F_ROUTEN` | 69 | **69** |
| Austauschformat | 11 | **11** |
| Vorgänge im Sicherheitsprotokoll | 20 | **20** |
| Merkmale | 14 | **14** |
| Zwecke der zweiten Bestätigung | 7 | **7** |
| Vokabulareinträge | 11 | **11** |
| Abhängigkeiten (`npm ls --omit=dev`) | 122 Pfade | **122 Pfade** |

**Jede Zahl ist nachgezählt und nicht angenommen** — `F_ROUTEN` über die
Selbstprobe im Prüfstand, die Rückbauten über `require('./gegenprobe')`, die
Migrationsblöcke über die Marken in `db.js`, die persönlichen Schlüssel über
die Liste in `server.js`.

> **EINE BERICHTIGUNG ZUM AUFTRAG: die Formatnummer steht NICHT in `db.js`.**
> Sie steht in `server.js` als `AUSTAUSCH_FORMAT`, an genau einer Stelle, und
> sie ist unverändert **11**. *Das gehört hier hin, sonst sucht sie beim
> nächsten Mal wieder jemand in der falschen Datei.*

---

## 13. Was ausdrücklich nicht passiert ist

**Der Auftrag hat mehreres ausgeschlossen. Keines davon ist gebaut:**

* **kein Schema, kein Migrationsblock, keine neue Formatnummer** — `db.js` ist
  Zeile für Zeile unverändert;
* **keine neue Abhängigkeit**, auch keine für den Prüfstand;
* **keine neue schreibende Route** — `F_ROUTEN` bleibt bei 69, nachgezählt;
* **kein Tag gesetzt und kein Push eines Tags versucht** — die Entscheidung vom
  30. August 2026 steht im Projektstand, Abschnitt 8. *Die einzige Wirkung
  bleibt, dass die Vergleichsverweise am Ende von `CHANGELOG.md` ins Leere
  zeigen; der Eintrag ist trotzdem geschrieben, er ist Teil der Form.*
* **die Pille ist nicht halb gestrichen** — Filter, Merker, Vorgabewert,
  Zählung, Beschriftung und der Helfer dahinter sind gemeinsam gefallen;
* **`auth.js:737` ist nicht angefasst** — `zuletztGesehen` heißt dort etwas
  anderes;
* **die zwölf übrigen Erklärsätze sind nicht behoben** — nachgesehen und
  aufgeschrieben, wie beauftragt;
* **die tote Regel `.rz-summe:first-of-type` ist nicht behoben** — sie gehört
  zu keinem der neun Punkte und steht als Zeile im Sammelblatt.

**Und was sonst noch nicht angefasst wurde, obwohl es naheliegt:**
`renderDetail()` mit inzwischen über 2000 Zeilen. *Dieselbe Antwort wie in
0.16.0: ein Umbau dieser Größe braucht eine eigene Runde.*


---

## 14. Offen geblieben

### Die drei Handgriffe, die diese Runde im Feld belegen

**Alle drei sind Maße oder Anzeigen und in jsdom nicht zu messen.** Am
Prüfstand ist belegt, was sich dort belegen lässt — der Aufbau und die Regel im
Stilblatt. **Am Wirt fehlt:**

1. **Einen Eintrag mit mehreren Kriterien an einer Anlage mit EINEM Zugang
   ansehen** und nachzählen, dass Namen und Sternreihen untereinander stehen.
   *Und im selben Zug auf die Gesamtnote klicken: der Erklärkasten muss auf die
   Spalte **Note** verweisen, die in ihm selbst steht — das ist der zehnte
   Befund aus Abschnitt 5a.*
2. **Die Glockentafel öffnen** und lesen, **was** neu ist — „3 Kommentare ·
   4 Bewertungen" statt „7 neue Beiträge" — und dass darunter steht, von wem.
   *Mit einem zweiten Zugang dazu: an einer Zeile mit ausschließlich neuen
   Bewertungen steht KEIN Name.*
3. **Die Anmeldeseite auf dem Telefon aufrufen**, ohne zu scrollen — die
   Versionszeile muss dastehen. *Der Befund kam vom Samsung S21 5G.*

*Dazu, wenn sich die Gelegenheit ergibt: die Karte „Mailversand" im Abschnitt
„Zugänge" steht jetzt so breit wie ihre drei Nachbarn, und der orangene Rahmen
der eigenen Anmeldung muss bis zum Rand reichen.*

### Die Nachlese aus Abschnitt 0 des Auftrags

**Sie steht weiterhin aus — beides kostet keine Zeile Code und ist nur am
echten Bestand zu haben:**

1. **DER TEILEXPORT, ein drittes Mal und mit Mitschrift.** *Der erste Lauf
   machte Probleme, der zweite lief gut — offen ist, ob beim ersten der Weg
   eingehalten war: Teil 1 mit „Ersetzen", **alle übrigen mit
   „Zusammenführen"**. Ein geglückter zweiter Lauf ist kein Freispruch für den
   ersten.* **Mitzuschreiben:** wie viele Teile bei 300 MB, **eine** Eingabe des
   zweiten Faktors, wie viele geladene Dateien, **welcher Teil mit welchem
   Verfahren** eingespielt wurde — und danach, dass **keine** Zeile
   `bestaetigung.fehl` im Sicherheitsprotokoll steht. **Der Weg dorthin heißt
   seit 0.16.0: Systembereich → Datenbank → Export.** *Und der eine Handgriff,
   der wirklich zählt: einen Teil in eine **Zweitanlage** einspielen, nicht in
   die laufende.*
2. **BEIDE NETZE AM ECHTEN WIRT** (0.13.0). Über HTTPS anmelden und angemeldet
   bleiben; **im selben Browser** über `http://<server-ip>:3100` anmelden und
   ebenso angemeldet bleiben.

### Der volle Gegenprobenlauf

**Er steht seit dreizehn Runden aus.** 333 Rückbauten zu je einem vollen
Prüflauf sind bei rund fünfeinhalb Minuten je Lauf etwa **dreißig Stunden**
hintereinander, in vier Nebenspuren rund acht. **Er lässt sich nicht neben dem
Bauen fahren** — `gegenprobe.js` zieht seine Kopie aus `git archive HEAD`, und
ein Commit mitten im Lauf verschiebt die Grundlage. *Was in dieser Runde
gefahren wurde, steht in Abschnitt 10.*

### Befunde, die diese Runde erzeugt und nicht behoben hat

1. **Dieselbe Art Satz wie in Punkt 2 steht an zwölf weiteren Stellen** in
   `public/app.js` — die Liste mit Zeilennummer und Wortlaut steht in
   Abschnitt 2. **Drei davon sind Grenzfälle** (fachliche Warnung, Folge mit
   Handlungsanweisung) und möglicherweise gar kein Befund. *Als Zeile im
   Sammelblatt, Teil II.*
2. **`.rz-summe:first-of-type > span { border-top: … }` kann nie greifen.**
   `:first-of-type` zählt DIV-Geschwister, und das erste `div` in `.rechnung`
   ist `.rz-kopf`. **Eine tote Regel aus 0.16.0**, beim Bau der Vergleichszahl
   aufgefallen. *Ein PATCH-Kandidat; als Zeile im Sammelblatt.*
3. **`mitGewicht` und `gewichtetGerechnet` sind zwei Ableitungen derselben
   Frage** — „ist gewichtet gerechnet worden". Die eine liest `weg.zeilen`, die
   andere `item.ratings`. *Sie stimmen heute überein, weil beide nur die
   bewerteten Kriterien ansehen; es sind trotzdem zwei Stellen
   (Stolperstein 47, im Kleinen). Kein Fund für diese Runde, aber ein Satz
   wert, damit es beim nächsten Griff auffällt.*
4. **Der Satz „sie stehen in der README bereits, Wort für Wort" trifft für den
   ersten der beiden gestrichenen Texte nicht ganz** — die README trägt die
   Aussage in anderen Worten. *Einzelheiten in Abschnitt 2.*
   *Und der Auftrag ist an einer zweiten Stelle mit sich uneins:* er zählt im
   Kopf **neun** Befunde und spricht im Rumpf dreimal von **„den acht
   Punkten"** (Zeilen 72, 435, 477). **Beides ist auflösbar** — acht kleine
   plus Punkt 6 —, aber es steht nicht da; die Papiere haben sich durchgehend
   für **neun** entschieden.
5. **`gegenprobe.js` kann einen Abriss nicht von einer Störung von außen
   unterscheiden.** Spur 0 fährt ohne Versatz, also auf denselben Portbasen wie
   ein gewöhnlicher `npm test`. *In dieser Runde lief ein Prüflauf daneben, nahm
   ihr die Ports — und ein anschließendes `pkill` auf den Namen dehnte es auf
   alle vier Spuren aus; die verwaisten Server blieben stehen und nahmen der
   nächsten Runde die Ports, bis **neunzehn** Rückbauten hintereinander
   „ABGERISSEN" meldeten, ohne dass am Rückbau etwas war. Der Lauf ist deshalb
   ganz von vorn gefahren worden; was in Abschnitt 10 steht, ist der saubere
   Lauf.* **Die Antwort wäre klein** — vor dem Start nachsehen, ob auf den
   Portbasen schon jemand horcht, und beim Aufräumen nach Prozessnummer statt
   nach Namen greifen. *Als Zeile im Sammelblatt, Teil II, „Am Prüfstand"; die
   Lehre steht als Stolperstein 231.*

---

**Und der Satz, der zu dieser Runde gehört:** *ein Fehler, den keine der 4523
grünen Prüfungen sehen konnte, ist beim ersten Rundlauf von Hand aufgefallen.
Die Zahl der Prüfungen sagt nichts über Abdeckung — das tut allein die Frage,
welche Lage sie fahren.*
