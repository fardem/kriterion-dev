# Auftrag 0.22.1 — „Der Ausschnitt bedient sich wie ein Ausschnitt, und die Kopfzahl steht einmal da"

**Vorher: der Stand, auf dem diese Runde aufsetzt.** *Seine Versionsnummer, sein Fingerprint,
die Zahl der Prüfungen, der Rückbauten (samt höchster Nummer), der Stolpersteine, `F_ROUTEN`,
die Zwecke der zweiten Bestätigung, die Migrationsblöcke, das Austauschformat, die Karten in
den Einstellungen und die ausgelieferten Module stehen im Änderungsprotokoll 0.22.0* — **und
werden von dort übernommen, beim Start des Chats, nicht beim Schreiben dieses Auftrags.**

**Gebaut wird gegen `0.22.0`, Fingerprint `fd292332`** — im Feld seit dem 4. September 2026.

> **WAS DIESE RUNDE AN DEN ZAHLEN ÄNDERT:**
>
> | | diese Runde |
> |---|---|
> | Schema | **nein** — keine Spalte, kein Migrationsblock, kein Bestandslauf |
> | Austauschformat | **unverändert** (13) |
> | `F_ROUTEN` | **unverändert** (70) — es kommt keine Route dazu und es fällt keine weg; **eine bekommt eine Klemme** (Bauabschnitt 3) |
> | Zwecke der zweiten Bestätigung | unverändert |
> | Karten in den Einstellungen | **21, unverändert** |
> | Vokabelwörter · persönliche Schlüssel | **14 · 9, unverändert** |
> | ausgelieferte Module | **9, unverändert** — `db.js`, `mail.js`, `bilder.js`, `bestandslauf.js` sind nicht angefasst |
> | Prüfstand, Rückbauten, Stolpersteine | wachsen — **ab der jeweils nächsten freien Nummer** *(Prüfungen **5661**, Rückbau **642**, Stolperstein **318**, Stand 0.22.0)* |
>
> **Angefasst werden `public/app.js`, `public/style.css` und `server.js`** — dazu `pruefung.js`,
> `gegenprobe.js` und die Papiere. *Bauabschnitt 1 und 2 sind reine Browserarbeit; allein
> Bauabschnitt 3 greift in den Server, und zwar an genau einer Stelle.*

---

## Woher die drei Befunde kommen

**Aus dem Rundlauf von Hand nach 0.22.0**, am 5. September 2026, am laufenden Server mit
Fingerprint `fd292332`, mit Bild. *Dieselbe Herkunft wie 0.21.1 nach 0.21.0, 0.20.1 nach 0.20.0
und 0.17.1 nach 0.17.0: die Runde ist eingespielt, und der erste Mensch, der sie bedient,
findet, was kein Prüflauf findet.* **Keiner der drei Punkte stand je im Sammelblatt, und keiner
im Fahrplan.**

* **Befund 1 ist ein Fehler in einer Bedienform, die 0.22.0 selbst gebaut hat** (Entscheidung
  E9, Bauabschnitt 5.2): das Rechteck.
* **Befund 2 ist älter als 0.22.0** und steht seit 0.21.0 so da. *Im Augenschein zu 0.22.0 ist
  er nicht aufgefallen, weil dort auf die Sternzeile gesehen wurde und nicht auf den Kopf des
  zugeklappten Kastens.*
* **Befund 3 ist eine Frage an die Regel aus 0.21.0** und keine Anzeige: an einem ungetesteten
  Eintrag steht ein Kasten, in dem nichts zu tun ist.

---

## Worum es geht, in vier Sätzen

**Das Rechteck aus 0.22.0 kennt genau zwei Gesten — Klick und Ziehen —, und das Ziehen setzt in
jedem Fall einen neuen Ausschnitt: es gibt kein Schieben und kein Ändern der Weite an einer
Ecke.** Wer den vorhandenen Rahmen anfasst, um ihn zu verschieben, zieht damit einen neuen auf,
und Lage und Weite ändern sich in derselben Bewegung — **zwei Größen auf einen Griff, und
deshalb keine davon zuverlässig.** **Der Kopf des zugeklappten Bewertungskastens zeigt dieselbe
Zahl zweimal**, einmal in Klammern und einmal mit dem Wort „gewichtet" — *zwei Anzeigen
derselben Zahl sind eine Frage und keine Auskunft, und die Frage lautet „ist das meine oder die
von allen".* **Und an einem ungetesteten Eintrag steht der Bewertungskasten da, obwohl vor dem
Test nicht bewertet wird** — er nimmt Platz und lädt zu etwas ein, was die Instanz seit 0.21.0
gar nicht meint.

**Diese Runde legt keine Angabe an und rechnet keine Zahl anders:** `focus_x`, `focus_y` und
`zoom` bleiben, wie sie sind, und kein Durchschnitt ändert seinen Wert.

---

## Bauabschnitt 1 — der Ausschnitt bedient sich wie ein Ausschnitt

### 1.1 Was heute geschieht — gelesen, nicht vermutet

In `public/app.js`, `ruesteAusschnittAus()`:

* `v.onpointerdown` nimmt **die ganze Betrachterfläche** an (ausgenommen `.vfocus, .vnav,
  .vzoom`) und merkt sich den Punkt.
* `v.onpointermove` macht daraus **ab sechs Bildpunkten Weg** ein Rechteck und ruft
  `ausRechteck(start, e)` — **bei jedem Zwischenschritt neu**: die längere Kante des
  aufgezogenen Rechtecks wird die Kante des Ausschnitts, daraus folgt `zoom`, aus der linken
  oberen Ecke folgen `focus_x` und `focus_y`.
* `v.onpointerup` speichert; **unter sechs Bildpunkten war es ein Klick**, und `ausPunkt(e)`
  setzt den Fokuspunkt **mittig** auf die angeklickte Stelle.
* **Der Rahmen selbst ist nicht anfassbar:** `.focus-frame` steht auf `pointer-events: none`
  (`public/style.css`).

**Die beiden Wege schließen einander im Quelltext aus — es läuft nichts doppelt, und es ist
kein Wettlauf.** *Was als „beides gleichzeitig" auffällt, ist etwas anderes und Schlimmeres:*
**innerhalb EINER Geste ändern sich Lage und Weite immer zusammen, und eine Berührung im
vorhandenen Rahmen wirft ihn weg, statt ihn anzufassen.** Jedes Ausschnittwerkzeug, das jemand
schon einmal bedient hat, trennt genau das.

### 1.2 Die vier Gesten, und sie sind der ganze Bauabschnitt

| Wo die Berührung anfängt | Was die Bewegung tut | Was sich ändert |
|---|---|---|
| **außerhalb des Rahmens** | zieht einen **neuen** Rahmen auf; der alte ist damit fort | `zoom`, `focus_x`, `focus_y` |
| **im Rahmen** | **schiebt** ihn | **nur** `focus_x`, `focus_y` — die Weite bleibt |
| **auf einer Ecke** | zieht ihn **von dieser Ecke aus** größer oder kleiner; die gegenüberliegende Ecke bleibt liegen | `zoom`, und `focus_x`/`focus_y` so weit, wie die feste Ecke es verlangt |
| **Klick ohne Weg** | siehe Entscheidung **E1** | — |

### 1.3 Was dabei nicht verhandelbar ist

1. **Der Ausschnitt ist und bleibt ein Quadrat.** Die Kachel ist quadratisch, und gespeichert
   werden drei Zahlen: Punkt und Weite. *Es gibt kein Feld für ein Seitenverhältnis, und diese
   Runde legt keines an.* **An einer Ecke folgt die Kante der längeren der beiden Strecken** —
   wie heute in `ausRechteck()`.
2. **Der Rahmen zeigt weiter genau das Quadrat, das der Server ausschneidet.** Die Rechnung
   steht seit 0.19.5 in `zuschnittKiste()`, der Server fährt sie ein zweites Mal, und der
   Prüfstand hält beide gegeneinander (Stolperstein 293). **An dieser Funktion wird nichts
   geändert.**
3. **Die Kante rastet weiter auf die Fünferstufen des Schiebers** — beide Wege zeigen dieselbe
   Zahl (0.22.0, E9). *Die angefasste Ecke sitzt danach genau, die Weite springt um bis zu eine
   halbe Stufe. Das ist heute so, es ist gewollt, und es bleibt so.*
4. **Der Schieber bleibt** (0.22.0, E9) — für den Finger und für die Feinarbeit.
5. **Ein Speicherweg für alle Gesten.** `speichere()` bleibt die einzige Stelle und läuft
   **einmal je abgeschlossener Geste**. *Zwei Aufrufstellen wären zwei Wahrheiten darüber, was
   gerade gespeichert wurde.* **Eine Berührung, die nichts geändert hat, speichert nicht.**
6. **`.focus-frame` bleibt auf `pointer-events: none`.** Der Rahmen legt einen Schleier über die
   ganze Fläche (`box-shadow: 0 0 0 9999px`); nähme er Zeigerereignisse an, finge er sie
   überall. **Welche Geste gilt, wird an den Koordinaten entschieden und nicht am
   Ereignisziel.**
7. **Und diese Entscheidung gehört in eine eigene Funktion, die ohne Zeiger prüfbar ist** —
   *dieselbe Bauform wie `zuschnittKiste()` und aus demselben Grund: was der Prüfstand nur über
   ein Zeigerereignis erreicht, prüft er nicht.* Sie bekommt die Rahmenlage und einen Punkt und
   antwortet mit der Geste; **mehr weiß sie nicht, und mehr braucht sie nicht.**

### 1.4 Der Zeiger sagt vorher, was geschehen wird

Heute steht die ganze Fläche auf `cursor: crosshair` (`.viewer.focus-mode`). **Ab dieser Runde
sagt der Zeiger, welche der vier Gesten unter ihm liegt:** `crosshair` außerhalb, `move` im
Rahmen, `nwse-resize` und `nesw-resize` an den Ecken. *Das ist die Gestaltungsregel aus 0.22.0
— eine Antwort auf jede Berührung — an der einzigen Stelle der Oberfläche, an der drei
verschiedene Dinge unter demselben Zeiger liegen.*

### 1.5 Und die Meldung stimmt danach nicht mehr

`toast('Klicken oder ziehen legt den Bildausschnitt fest')` beschreibt den Stand von 0.22.0.
**Sie wird neu geschrieben — ein Satz, nach den Sprachregeln S1 bis S7 aus dem Projektstand,
Abschnitt 5.6.**

---

## Bauabschnitt 2 — die Kopfzahl steht einmal da, und sie sagt, wessen sie ist

### 2.1 Der Befund, belegt

Der Kopf des Bewertungskastens trägt **zwei** Zahlen, sobald der Kasten zugeklappt ist:

* **`(⌀ 2,1)`** — die Kurzfassung des eingeklappten Blocks aus `blockZusammenfassung()`,
  gezeichnet in `.bsumme`. Sie steht **nur zugeklappt** da.
* **`⌀ 2,1 gewichtet`** — die Kopfzahl als Knopf (`.gew-auf`), der die Rechnung öffnet. Sie
  steht **immer** da.

**Beide lesen dasselbe Feld — `item.avgRating` —, und beide formatieren es mit `toFixed(1)`.
Sie können sich nicht unterscheiden: es ist zweimal dieselbe Zahl, und die eine trägt ein Wort,
das die andere nicht trägt.** *Wer zwei Zahlen nebeneinander sieht, schließt daraus, dass sie
zwei Dinge meinen.* Im Potenzialkasten steht dasselbe mit `item.potenzialRating`.

**Die Antwort auf die Frage, die dabei entsteht:** `avgRating` ist der Durchschnitt **über
alle, die bewertet haben** — in zwei Schritten: erst je Kriterium über alle Stimmen, dann über
die Kriterien, jedes mit seinem Gewicht (`server.js`, `schnitteJeKriterium()` und
`gesamtSchnitt()`). **Die eigenen Sterne sind die Sternzeile links** — sie zeigt den Zustand,
den sie verändert; **die Zahl rechts in der Zeile (`⌀ 3,8 (4)`) ist der Schnitt dieses einen
Kriteriums über alle.**

**Und das steht nirgends.** Der Erklärkasten hinter der Kopfzahl sagt „erst der Durchschnitt je
Kriterium, dann der Durchschnitt darüber" — **er sagt an keiner Stelle, über wen.**

### 2.2 Was gebaut wird

1. **Die Kopfzahl steht genau einmal da.** Solange der Kasten eine Kopfzahl hat, hat er keine
   Kurzfassung; hat er keine Kopfzahl, trägt die Kurzfassung ihren Satz („noch nicht bewertet"
   bzw. „noch nicht eingeschätzt"). *Damit bleibt beides erhalten: die Zahl steht auch
   zugeklappt da, und der leere Kasten sagt zugeklappt, dass er leer ist.*
   **Die Regel dafür ist keine neue:** der Kommentarblock trägt seine Zahlen aus genau diesem
   Grund nicht in der Kurzfassung, und die Begründung steht seit 0.21.0 im Quelltext — *beides
   zugleich wäre derselbe Satz zweimal nebeneinander.* **Sie galt für die beiden Sternkästen
   nicht, und das ist der ganze Fehler.**
2. **Die Zahl sagt, wessen sie ist** — siehe Entscheidung **E5**.

---

## Bauabschnitt 3 — vor dem Test wird nicht bewertet, und der Kasten steht auch nicht da

### 3.1 Der Befund

**Seit 0.21.0 gilt: ungetestet heißt Potenzial, getestet heißt Bewertung.** Die Regel steht in
`zuNachZustand()`, und sie klappt den jeweils anderen Kasten **zu**. **Zugeklappt heißt aber
sichtbar:** an einem ungetesteten Eintrag steht der Bewertungskasten mit Kopfzeile, Griff,
Pfeil und Kopfzahl da, nimmt eine Zeile Platz — und ein Klick öffnet ihn und lässt Sterne
vergeben. *Der Satz aus dem Konzept zu 0.21.0 lautet „vor dem Test schätzt man, nach dem Test
bewertet man". Die Oberfläche sagt ihn leise und lässt zugleich das Gegenteil zu.*

### 3.2 Was gebaut wird

1. **An einem ungetesteten Eintrag gibt es den Bewertungskasten nicht** — nicht zugeklappt,
   sondern **gar nicht**, und er nimmt keinen Platz. *`[hidden] { display: none !important }`
   steht seit 0.15.1 einmal ganz oben im Stilblatt; der Block wird darüber ausgeblendet und
   nicht aus dem Dokument genommen, damit `#rhead` und `#ratings` bleiben, wo sie sind.*
2. **Die Ausnahme aus 0.21.0 bleibt** — siehe Entscheidung **E6**: trägt ein ungetesteter
   Eintrag aus alten Zeiten schon Bewertungssterne, steht der Kasten da. *Vorhandene Daten
   schlagen die Regel; nichts wird vor jemandem versteckt, der es eingetragen hat.* Die Prüfung
   dafür gibt es bereits (`hatSterne(item, 'nachher')`), und sie wird nicht neu geschrieben.
3. **Was der Bildschirm nicht anbietet, weist der Server ab.** `PUT /api/items/:id/ratings`
   nimmt heute jeden Wert für jedes Kriterium an und fragt weder nach der Phase noch nach
   `tested`. **Ab dieser Runde weist er einen Wert größer null auf ein Kriterium der Phase
   `nachher` an einem ungetesteten Eintrag ab**, mit einer deutschen Meldung.
   **`value: 0` bleibt immer offen** — *Wegnehmen muss man dürfen, sonst säße ein Stern an einem
   Eintrag fest, dessen Kasten man nicht mehr sieht.*
   *Die Route bleibt dieselbe, `F_ROUTEN` bleibt bei 70: eine Klemme ist keine neue Route.*
4. **Der Zustandswechsel bleibt, wie er ist.** „Getestet" einschalten zeigt den Kasten,
   ausschalten versteckt ihn wieder; **gelöscht wird dabei nichts**, und `BLICK.clear()` beim
   Umlegen des Schalters bleibt stehen.
5. **Die gespeicherte Blockreihenfolge bleibt unangetastet.** Ein versteckter Block wird nicht
   aus `BLOECKE` genommen und beim Verschieben der Blöcke nicht mitgezählt — *sonst verlöre ein
   Eintrag beim Umschalten von „getestet" die Anordnung, die für alle Einträge gilt.*

---

## Die offenen Entscheidungen — sechs, mit Empfehlung

| | Frage | Empfehlung | Was dagegen spricht |
|---|---|---|---|
| **E1** | Was tut ein **Klick ohne Weg**? Heute setzt er den Fokuspunkt mittig. | **Außerhalb des Rahmens: den Punkt setzen wie bisher. Innerhalb: nichts.** *Ein Griff in den Rahmen, der sich nicht bewegt, ist ein misslungener Griff — und der darf nichts verändern. Außerhalb bleibt der Klick der schnelle Weg, den es seit 0.19.x gibt und auf den das Telefon baut.* | zwei Bedeutungen für dieselbe Geste, je nachdem, wo sie anfängt |
| **E2** | Nur die **vier Ecken**, oder auch die Kanten? | **Nur die vier Ecken.** *Der Ausschnitt ist ein Quadrat: eine Kante zieht nur eine Achse, die andere müsste die Instanz dazuerfinden — der Rahmen rutschte dabei seitlich weg, und niemand hätte das verlangt.* | wer eine Kante fasst, greift ins Leere und muss die Ecke suchen |
| **E3** | Wie groß ist die **Greifzone**, und was macht der **Finger**? | **12 Bildpunkte nach innen ab der Ecke. Auf dem Finger nur Schieben; die Weite bleibt beim Schieber** (0.22.0, E9). *Eine Ecke von 12 px trifft keine Fingerkuppe, und ein zweiter Weg, der auf dem Telefon nicht funktioniert, ist schlechter als keiner.* | auf dem Tablett mit Stift wäre die Ecke brauchbar und steht trotzdem nicht zur Verfügung |
| **E4** | Welche der beiden Zahlen im Kopf **fällt**? | **Die Kurzfassung fällt, solange eine Kopfzahl dasteht.** *Die Kopfzahl trägt das Wort „gewichtet" und ist der Knopf zur Rechnung — sie ist die reichere von beiden. Die Kurzfassung behält den Fall ohne Zahl.* | die Kurzfassung ist die Form, die alle anderen Blöcke tragen; die Sternkästen weichen davon ab |
| **E5** | Sagt die Zahl, **wessen** sie ist — und wo? | **An zwei Stellen: im Titel des Knopfes und als Halbsatz im Erklärkasten.** *Der Titel steht beim Überfahren und im Vorleseprogramm; der Erklärkasten ist der Ort, an dem die Zahl erklärt wird, und er erklärt sie heute nur zur Hälfte.* **Beide Male ohne Bedingung auf die Zahl der Zugänge** — eine Instanz mit einem einzigen Zugang bekäme sonst einen anderen Satz über dieselbe Rechnung (Stolperstein 47). | zwei Sätze mehr in einer Runde, die 0.22.0 gerade leer geräumt hat |
| **E6** | Was ist mit einem **ungetesteten Eintrag, der schon Bewertungssterne trägt**? | **Der Kasten steht da, offen, wie heute.** *Die Ausnahme ist seit 0.21.0 aufgeschrieben und begründet: vorhandene Daten schlagen die Regel. Ohne sie wären vergebene Sterne unsichtbar UND unerreichbar.* | die Regel „ungetestet heißt kein Bewertungskasten" gilt dann nicht ausnahmslos, und der Bestand entscheidet über die Anzeige |

**Dazu eine siebte Frage, die keine Bauentscheidung ist, sondern eine über die Nummer:**

> **E7 — bleibt es bei PATCH?** **Empfehlung: ja.** *Es kommt keine Funktion dazu, keine Route,
> keine Spalte, keine Karte und kein Vokabelwort; keine gespeicherte Zahl ändert sich.*
> **Aber Bauabschnitt 3 nimmt etwas weg** — an einem ungetesteten Eintrag lässt sich nicht mehr
> bewerten —, und das gehört **fett in den Changelog**, wie die geänderte Menge in 0.21.1.
> *Der Fahrplan rückt dadurch nicht: 0.22.1 ist eine PATCH-Zahl hinter einer gebauten Runde und
> nimmt niemandem seinen Platz. Die nächste eingeschobene MINOR-Runde nimmt weiterhin 0.25.0.*

---

## Was ausdrücklich NICHT gebaut wird

* **Kein Seitenverhältnis, kein rechteckiger Ausschnitt, keine zweite Kachelform.** Die Kachel
  ist quadratisch, und drei Zahlen beschreiben den Ausschnitt vollständig.
* **Keine Änderung an `zuschnittKiste()`** — und damit keine an der Rechnung, die der Server ein
  zweites Mal fährt.
* **Kein Rückgängig für den Ausschnitt, keine Vorschau der Kachel neben dem Rahmen, kein
  Raster, kein Fadenkreuz.** *Der Rahmen zeigt bereits genau das Ergebnis.*
* **Keine neue Farbe, kein helles Farbschema** — das ist 0.23.0.
* **Keine Änderung an der Rechnung selbst.** Bauabschnitt 2 ändert, **was dasteht**, nicht,
  **was gerechnet wird**.
* **Kein Sammel-Zurücksetzen zurück** und kein neuer Weg zu einer fremden Bewertung.
* **Keine Sprachdatei, keine Umbenennung, kein Vokabelwort.**
* **Keine Karte, kein Umzug einer Karte, keine neue Einstellung.** *Ob der Bewertungskasten an
  einem ungetesteten Eintrag steht, ist eine Regel und keine persönliche Wahl — sonst stünde die
  Frage „warum sehe ich das nicht" an einer Stelle, an der niemand sie sucht.*

---

## Der Prüfstand — was er halten muss

**Alle vorhandenen Gruppen bleiben grün.** Wo eine Zusage an einem Wortlaut hängt, der sich
ändert, **wird sie umgedreht und nicht gelöscht** (Stolperstein 74). *Betroffen sind mindestens
die Zusagen zum Ausschnittmodus, zur Kurzfassung der Blöcke und zum Verhalten der beiden
Sternkästen am Zustand des Eintrags.*

**Neu zu belegen ist mindestens:**

1. **Die Gestenentscheidung, ohne Zeiger.** Vier gestellte Lagen gegen einen gestellten Rahmen:
   außen, innen, jede der vier Ecken, und die Ecke bei einem Rahmen, der so klein ist, dass die
   Greifzonen einander berühren. *Diese Prüfung erreicht die Funktion unmittelbar und nicht über
   ein Ereignis.*
2. **Schieben ändert die Weite nicht** — **am gesendeten Rumpf geprüft, nicht an der Anzeige:**
   `zoom` ist vorher und nachher dieselbe Zahl.
3. **Die feste Ecke bleibt liegen.** Nach dem Ziehen an einer Ecke steht die gegenüberliegende —
   innerhalb der Fünferrastung — an derselben Stelle.
4. **Nichts verlässt das Bild:** keine Geste bringt `focus_x` oder `focus_y` aus `[0, 100]` oder
   `zoom` aus `[100, 400]`.
5. **Ein Griff ohne Bewegung speichert nicht** — gezählt an den Aufrufen von `speichere()`.
6. **Die Kopfzahl steht genau einmal.** Zugeklappt und mit Zahl: keine Kurzfassung. Zugeklappt
   und ohne Zahl: die Kurzfassung mit ihrem Satz. **Für beide Kästen geprüft.**
7. **Ungetestet heißt kein Bewertungskasten** — und **er nimmt keinen Platz**; **mit vorhandenen
   Sternen steht er da** (E6); **„Getestet" umlegen zeigt und versteckt ihn**, ohne dass Sterne
   verlorengehen.
8. **Der Server weist ab:** `PUT` mit `value > 0` auf ein Kriterium der Phase `nachher` an einem
   ungetesteten Eintrag wird abgewiesen; **`value: 0` geht durch**; ein Kriterium der Phase
   `vorher` geht durch. **Je Rolle geprüft, nicht nur als Admin.**
9. **`zuschnittKiste()` unverändert:** die vorhandene Prüfung Browser gegen Server bleibt grün.

**Rückbauten ab 642**, für jede neue Regel mindestens einer — darunter: **die Greifzone
weggenommen**, **Schieben ändert den Zoom mit**, **die feste Ecke wandert**, **die Kurzfassung
kommt zurück**, **der Server nimmt die Bewertung am ungetesteten Eintrag wieder an**.
**Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein 161) — *erst das Objekt, dann
sein Inhalt* (Stolperstein 311), und das gilt nach 0.22.0 ausdrücklich auch für einen Rückbau,
der einen Weg wieder gangbar macht (Stolperstein 317).

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der Sprachwächter läuft mit.
* **Keine neue Abhängigkeit, keine Binärdatei, keine neue Datei, kein neues Modul.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.** *Die 12 Bildpunkte der
  Greifzone sind eine Vorgabe und werden am gebauten Stand nachgemessen.*
* **Der Augenschein gehört zur Runde und nicht ans Ende:** je Bauabschnitt ein Blick auf einen
  breiten Schirm und ein Telefon, und je Rolle einer. **Für den Ausschnitt heißt das: an einem
  hohen, einem breiten und einem fast quadratischen Bild** — *der Spielraum ist auf jeder dieser
  Formen ein anderer, und genau daran ist 0.19.1 hängengeblieben.*
* **Neue Stolpersteine ab 318.** Kandidaten:
  - *Eine Bedienform, die zwei Größen auf einen Griff legt, hat keine davon* (das Rechteck).
  - *Ein Rahmen, den man sieht und nicht anfassen kann, ist ein Bild und kein Bedienelement.*
  - *Zwei Anzeigen derselben Zahl an einer Kopfzeile sind eine Frage, keine Auskunft* — **die
    Regel stand seit 0.21.0 am Kommentarblock im Quelltext und galt für die Sternkästen nicht.**
  - *Was der Bildschirm nicht anbietet, muss der Server abweisen — sonst ist es keine Regel,
    sondern eine Gewohnheit.*
* **VOR DEM GEGENPROBENLAUF: kein fremder Server** (Stolperstein 310). **Und der Gegenprobenlauf
  gehört vor das Schreiben der Papiere.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll geschnittene Commits
  mit deutschen Meldungen** — *bei dieser Runde sind vier bis fünf Schnitte richtig: der
  Ausschnitt, die Kopfzahl, der Bewertungskasten am ungetesteten Eintrag samt Serverklemme, der
  Prüfstand mit den Rückbauten, die Papiere.*
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft ein letztes Mal
  gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.22.1.md`** liegt im Branch: was gebaut wurde je Datei, die sechs
  Entscheidungen mit ihrer Begründung, **die vier Gesten als Tabelle**, die gemessenen Maße, was
  umgedreht statt gelöscht wurde, neue Stolpersteine, die Gegenprobentabelle, Prüfungszahlen und
  Rückbauten vorher/nachher *(vorher jeweils aus dem Protokoll 0.22.0)*, Offengebliebenes — **und
  was im Augenschein zurückgenommen wurde.**
* Die Zeile „0.22.1 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT gebildet**, nach
  der letzten Änderung an einer ausgelieferten Datei — die Versionsnummer in `package.json`
  eingeschlossen, **und `package-lock.json` trägt sie an zwei Stellen ein zweites Mal.**
  **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** *Kein Migrationsblock, keine
  Spalte, kein Bestandslauf.* **Der Rückweg auf 0.22.0 ist offen:** eine ältere Fassung zeigt den
  Bewertungskasten am ungetesteten Eintrag wieder und nimmt dort auch wieder Sterne an; **die
  Daten sind dieselben.** **Nach dem Einspielen im Browser einmal hart neu laden.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat, nicht in den
  Dokumenten.** Darunter: **einen Ausschnitt aufziehen, schieben und an einer Ecke ändern**
  *(drei Gesten, drei Ergebnisse, ein Speichern je Geste)*, **einen zugeklappten Sternkasten
  ansehen** *(eine Zahl, nicht zwei)*, **einen ungetesteten Eintrag öffnen** *(kein
  Bewertungskasten, keine Lücke)* und **„Getestet" umlegen** *(der Kasten kommt und geht, die
  Sterne bleiben)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_22_1`), und **alle Verweise sind
  nachzuziehen.** Kopf, Betriebsstand, **Abschnitt 5.6 (Anzeige und Bedienung)**, Stolpersteine,
  Prüfstand, Versionsgeschichte, Fahrplan, offene Betriebspunkte.
* **Abschnitt 5.6 bekommt die vier Gesten als geschriebene Regel** und den Satz, dass die
  Kopfzahl an einer Kopfzeile genau einmal steht. *Sonst läuft es beim nächsten Mal wieder
  auseinander — genau dafür ist der Abschnitt in 0.22.0 angelegt worden.*
* **Der Fahrplan:** 0.22.1 wandert in die Versionsgeschichte, **und es rückt nichts.** 0.23.0
  („Die Oberfläche wird hell") bleibt die nächste geplante Runde und **braucht vor ihrem Auftrag
  ihr eigenes Farbkonzept** (`Doku/Farbkonzept_0_23_0.md`, noch nicht geschrieben).
* **README:** der Absatz zum Rechteck unter „Bedienung" — **er beschreibt jetzt vier Gesten** —,
  und der Satz zum Bewertungskasten am ungetesteten Eintrag.
* **`CHANGELOG.md`** in der gewohnten Form, **ohne Kasten** (keine Datenbankstufe), mit einer
  **fetten `Changed`-Zeile** für die Wegnahme aus Bauabschnitt 3 und einem Satz zu dem, was ein
  Betreiber merkt: *der Ausschnitt lässt sich schieben und an den Ecken ändern, die Kopfzahl
  steht einmal da, und an ungetesteten Einträgen gibt es keinen Bewertungskasten mehr.*
* **Das Sammelblatt:** die **drei Zeilen aus dem Augenschein zu 0.22.0** (der Eintragstitel wird
  auf dem Telefon abgeschnitten; das Leerzeichen vor der Klammer in „Mit Fotos (~ 301,5 KB )";
  der Gewichtssatz in „Bewertung: Kriterien" für den Benutzer) **stehen weiter aus und werden
  dort eingetragen, wenn sie nicht mitgehen** — siehe die Liste unten.
* **Der vorige Auftrag fällt mit diesem Auftrag weg** — *es liegt immer nur einer im Repo.*
  **Dieser hier fällt weg, wenn der nächste geschrieben wird.**

---

## Was danach offen bleibt

* **Die drei Zeilen aus dem Augenschein zu 0.22.0**, alle drei älter als jene Runde: der
  Eintragstitel wird auf dem Telefon rechts abgeschnitten statt umgebrochen; die Knöpfe „Mit
  Fotos (~ 301,5 KB )" tragen durch den `gap` des `.btn` ein Leerzeichen vor der Klammer; die
  Karte „Bewertung: Kriterien" erklärt dem Benutzer das Gewicht, das er nicht stellen kann.
  *Zwei davon sind je eine Zeile im Stilblatt.* **Ob sie mitgehen, entscheidet der Betreiber beim
  Start des Chats — dieser Auftrag rechnet nicht mit ihnen.**
* **Das helle Farbschema — 0.23.0**, mit dem Farbkonzept davor.
* **Die Mehrsprachigkeit** (0.28.0).
* **Die beiden Handgriffe aus 0.20.0** — eine eigene Datei in den Sicherungsordner legen, und
  die Zeile im Sicherheitsprotokoll je entfernter Kopie. *Sie stehen seit 0.20.1 in dieser
  Liste.*
* **Der volle Gegenprobenlauf** über alle Rückbauten — weiter ausstehend, und seit 0.22.0
  (Stolperstein 317) erstmals sauber fahrbar.
* **Die Papiere sagen weiterhin „Systembereich"**, wo sie Geschichte erzählen — rund 700 Stellen.
* **Die Ideen, die stehen geblieben sind:** die Übersicht der Tastenkürzel (N7), die kompakte
  Listenansicht (N11), die Verlaufs-Sortierungen.
