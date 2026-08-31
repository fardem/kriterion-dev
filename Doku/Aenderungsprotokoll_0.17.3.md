# Änderungsprotokoll 0.17.3 — „Die Karte zeigt, der Dialog stellt ein"

**Version 0.17.3 · gebaut am 31. August 2026 · Fingerprint `ebd36b66` ·
4805 Prüfungen · 380 Rückbauten in `gegenprobe.js`**

---

**Vier Handgriffe aus dem Rundlauf mit 0.17.2.** Gemeldet am 31. August 2026,
unmittelbar nach dem Einspielen — **mit Bildern vom laufenden Betrieb.** *Der
Prüfstand war beim Start grün: 4747 von 4747.* **Zwei der vier Punkte sind
Nacharbeit an 0.17.2 selbst:** der Deckel geht nach oben mit und nach unten
nicht, und der Mailversand ist zwar geordnet, aber nicht ruhig geworden.

> **DIE NUMMER: PATCH.** *Projektstand 5.1: „Dritte Zahl (PATCH) nur für
> abwärtskompatible Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist
> keine PATCH-Runde."* **Diese Runde bringt keine Funktion** — vier Handgriffe
> an Anordnung und Anzeige. **Die Instanz kann danach nichts, was sie vorher
> nicht konnte**, auch mit Punkt 2 nicht: der Dialog benutzt den Speicherweg,
> den es gibt, und die zweite Bestätigung bleibt, wo sie ist.

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. Kein einziger der vier Punkte fasst Daten an.
> **DIE SICHERUNG DES DATENVERZEICHNISSES IST DESHALB EMPFEHLUNG UND NICHT
> PFLICHT.**

**ALLE VIER PUNKTE SIND GEBAUT.** Keiner ist herausgefallen, keiner ist
verschoben.

---

## Inhalt

1. [Der Deckel geht nach unten mit](#1-der-deckel-geht-nach-unten-mit)
2. [Der Mailversand: die Karte zeigt, der Dialog stellt ein](#2-der-mailversand-die-karte-zeigt-der-dialog-stellt-ein)
3. [Der Erklärkasten rollt nicht mehr](#3-der-erklärkasten-rollt-nicht-mehr)
4. [Die Filterleiste bekommt ihren Rücksetzer](#4-die-filterleiste-bekommt-ihren-rücksetzer)
5. [Die Entscheidungen dieser Runde](#5-die-entscheidungen-dieser-runde)
6. [Abweichungen vom Auftrag](#6-abweichungen-vom-auftrag)
7. [Was je Datei geändert wurde](#7-was-je-datei-geändert-wurde)
8. [Der Prüfstand](#8-der-prüfstand)
9. [Gegenproben](#9-gegenproben)
10. [Neue Stolpersteine](#10-neue-stolpersteine)
11. [Die Zahlen](#11-die-zahlen)
12. [Was ausdrücklich nicht passiert ist](#12-was-ausdrücklich-nicht-passiert-ist)
13. [Offen geblieben](#13-offen-geblieben)

---

## 1. Der Deckel geht nach unten mit

> ## ⚠️ BERICHTIGT IN 0.17.4 — DIESER PUNKT WAR FALSCH
>
> **Dieser Abschnitt bleibt stehen, wie er geschrieben wurde.** Er ist der
> Beleg dafür, wie eine Begründung aussieht, die sich liest wie eine Messung
> und keine war — *eine zurückgenommene Entscheidung, die verschwindet, kommt
> wieder (Stolperstein 201).* **Was daran nicht stimmt, steht hier, und es sind
> zwei Dinge:**
>
> **ERSTENS: DIE URSACHE.** *„Der Leerraum stand unter dem Inhalt IN der
> Kachel"* — **das war nicht so.** Nachgemessen in Chromium bei 1600×913 stand
> unter **keiner** Liste Luft: `Höhe` war gleich `scrollHeight`, an allen
> sieben Kacheln des Abschnitts „Bestand". `max-height: max-content` tat genau
> das, was es sollte. **Der Befund, aus dem der Satz stammt, kam außerdem von
> „Anfragen" und „Zugänge" — und beide tragen `.breit`, also
> `grid-column: 1 / -1`. Eine solche Kachel steht immer allein in ihrer Reihe;
> `align-items` kann sie gar nicht erreichen.** *Die Zeile konnte den gemeldeten
> Leerraum nie verursacht haben und hat ihn folglich auch nicht weggenommen.*
>
> **ZWEITENS: DIE MESSUNG DARUNTER IST NICHT GEMESSEN.** Die Tabelle
> *„NACHGEMESSEN IN CHROMIUM, Fenster 1600×913"* mit 605 → 186 → 136 Pixeln
> **ist aus dem Auftrag übernommen und nicht nachgerechnet worden.** Chromium
> stand die ganze Zeit zur Verfügung. *Das ist der schwerere der beiden Fehler:
> beim ersten war die Erklärung falsch, beim zweiten der Beleg.* **Die Regel
> dazu steht als Stolperstein 252.**
>
> **WAS DIE ZEILE STATTDESSEN ANGERICHTET HAT.** `align-items: start` hat die
> gleiche Höhe aufgehoben, die vorher da war. Der Abschnitt „Bestand" stand
> danach als Treppe von **206 bis 909 Pixeln** da, „Persönlich" als
> **1055 / 470 / 389**. *Genau das hat der Betreiber am Bild gesehen und
> gemeldet: „der Rest ist schlechter geworden."*
>
> **DER DECKEL VON ZEHN ZEILEN BLEIBT** — er war richtig und ist es geblieben.
> **Das Sicherheitsprotokoll bekommt in 0.17.4 fünfzehn**, weil eine
> `.prot-zeile` etwas anderes ist als eine `.mrow`. *Der Satz „trotzdem eine
> Regel und nicht zwei" weiter unten in diesem Abschnitt ist damit ebenfalls
> zurückgenommen.*
>
> **→ Die Regel, die gemeint war, steht in
> [Änderungsprotokoll 0.17.4](Aenderungsprotokoll_0.17.4.md), Abschnitt 1.**

**BEFUND.** *Wörtlich: „Zwölf Einträge sind glaube ich zu viel, lass uns daraus
zehn machen. Und wenn wir nach oben hin einen dynamischen Deckel haben, haben
wir auch einen der nach Minimum geht — wenn nichts oder wenig da ist, macht das
keinen Sinn, dass wir das leer lassen."* **Die Bilder zeigen es an „Anfragen"
und „Zugänge": eine leere und eine fünfzeilige Liste in einer Kachel, die über
tausend Pixel hoch ist.**

### DIE URSACHE LAG NICHT DORT, WO 0.17.2 SIE GESUCHT HAT

**Die Liste klemmt korrekt.** Zwei Einträge sind 84 px, eine leere Liste ist 0 —
beides in Chromium nachgemessen, und beides stimmt.

**Die Kachel klemmt nicht.** `.sys-grid` ist ein Raster, und ein Raster zieht
jedes Kind auf die Höhe der höchsten Zelle seiner Reihe: `align-items` steht von
Haus aus auf `stretch`. **Der Leerraum stand deshalb unter dem Inhalt IN der
Kachel und nicht in der Liste** — und genau deshalb hat die Messung zu 0.17.2
ihn nicht gesehen: *sie hat die Liste gemessen und die Kachel übersehen.*

> **STOLPERSTEIN 140 HAT GEGRIFFEN UND WAR TROTZDEM ZU ENG GEFASST.**
> „Nachmessen statt annehmen" sagt nichts darüber, WORAN gemessen wird. **Die
> Regel dazu steht jetzt als Stolperstein 246** — und sie lautet: erst den
> Kasten benennen, dessen Höhe erklärt werden soll, dann messen. *Stimmt die
> gemessene Zahl und der Befund steht trotzdem, ist der gemessene Kasten der
> falsche.*

### GEBAUT — zwei Zeilen im Stilblatt

1. **`.sys-grid { align-items: start }`** — jede Kachel ist so hoch wie ihr
   Inhalt.
2. **Der Deckel von zwölf auf zehn Zeilen**, und zwar für **beide** Listen:
   * `.manage-list` von `33.5rem` auf **`27.95rem`** *(10 × 41,92 px bei
     Wurzelschrift 15)*
   * `.prot-liste` von `28rem` auf **`23.3rem`** *(10 × 35 px — eine
     `.prot-zeile` trägt keinen Abstand zur nächsten, sondern eine Linie)*

**NACHGEMESSEN IN CHROMIUM, Fenster 1600×913, drei Kacheln nebeneinander:**

| Kachel | vorher | nachher |
|---|---:|---:|
| Liste mit **2** Zeilen | **605 px** | **186 px** |
| Liste **leer** | **605 px** | **136 px** |
| Liste mit **50** Zeilen | 605 px | 521 px *(Liste 419 px = zehn Zeilen, rollt)* |

**ZEHN AUCH FÜRS SICHERHEITSPROTOKOLL, und der Preis steht im Stilblatt dazu.**
Dort sind die Zeilen schmaler; zehn statt zwölf heißt spürbar weniger Protokoll
auf einen Blick. **Trotzdem eine Regel und nicht zwei** — zwei Zahlen für
dieselbe Sache sind eine zu viel (Stolperstein 47), und wer die Liste wirklich
durchsieht, nimmt ohnehin den Filter darüber.

**WAS DABEI NICHT VERLORENGEHT.** Die Zusage aus 0.17.1, dass eine Liste die
Höhe ihrer Kachel bekommt, **wird gegenstandslos statt gebrochen** — es gibt
keine geschenkte Höhe mehr, die ungenutzt bliebe. *Die Zeilen
`flex: 1 1 <Deckel>`, `min-height: 0` und `max-height: max-content` sind
unangetastet:* ohne die ersten beiden wächst ein Flexkind über seinen Anteil
hinaus, statt zu rollen (Stolperstein 237), und ohne die dritte forderte auch
eine kurze Liste ihre zehn Zeilen.

**AUF DEM TELEFON ÄNDERT SICH NICHTS.** Dort steht jede Kachel allein in ihrer
Zeile, und der Deckel hängt am Fenstermaß (`62dvh`). **Die Ausnahme
`#ex-teil-liste` bleibt ebenfalls, wie sie ist.**

**AM PRÜFSTAND** ist die Regel im Stilblatt belegt — **die Wirkung nicht**:
jsdom rechnet kein Layout. *Die gemessenen Zahlen stehen deshalb hier und nicht
in einer Prüfung, die sie nicht messen kann (Stolperstein 223).*

---

## 2. Der Mailversand: die Karte zeigt, der Dialog stellt ein

**BEFUND.** *Wörtlich: „Mailversand sieht so hässlich aus. So durcheinander.
Eventuell, wo die Eingabe über eine extra Maske gemacht wird und man in diesem
Fenster nur auswählen kann, ob eigener Server oder ein voreingestellter."*

**WORAN ES LAG, LÄSST SICH BENENNEN: es waren vier Rhythmen in einer Karte.**
Neun Bedienelemente teilten sich vier verschiedene Spaltenaufteilungen — `1fr`,
`3fr 1fr 2fr`, `1fr 1fr`, `1fr 2fr` —, und dazwischen standen vier Erklärsätze:
zwei **neben** einem Feld, zwei über die volle Breite. *Das Auge fand keine
Spalte.* Dazu die Reihe „Anbieter": ein Feld auf einem Drittel, daneben zwei
Drittel Leere mit einem Strich darin.

### GEBAUT — Vorschlag A

**DIE KARTE IST EINE ZUSTANDSKARTE WIE IHRE NACHBARN.** Kein Raster, kein Feld,
kein Erklärsatz neben einer Sache:

| Zeile | Inhalt |
|---|---|
| Zustand | `eingerichtet` / `nicht eingerichtet` |
| Anbieter | `GMX · mail.gmx.net:587 · STARTTLS` — **eine** Zeile |
| Absender | die Absenderadresse |
| Öffentliche Adresse | unverändert |
| Zuletzt erfolgreich getestet | unverändert |

Darunter **zwei Knöpfe**: **„Mailzugang einrichten"** *(nicht eingerichtet)*
beziehungsweise **„Mailzugang ändern"** *(eingerichtet)* — und **„Testmail an
mich"**. **Der Satz zur Testmail steht darunter**, der **Einleitungsabsatz
bleibt**, wie er war.

**DIE ZEILE „PASSWORT" IST WEGGEFALLEN**, und das steht hier, weil es eine
Wegnahme ist: sie beantwortete dieselbe Frage wie „Zustand" eine Zeile darüber —
*ein Zugang ist nur dann eingerichtet, wenn ein Passwort gesetzt ist.* **Die
Zusage, dass das Passwort nie dasteht, gilt unverändert**: nie der Wert, nie die
Länge, nie der Anfang, nie Sternchen mit der richtigen Zahl. Der Dialog sagt es
am Feld selbst, im Platzhalter.

**DER DIALOG TRÄGT EINEN RHYTHMUS — eine Spalte, Beschriftung über dem Feld:**

1. **Anbieter** *(Auswahl)*. **Darunter, nicht daneben:** der Hinweis, der zu
   genau diesem Anbieter gehört, und er wechselt mit der Auswahl.
2. **Bei einem voreingestellten Anbieter:** Server, Port und Verschlüsselung als
   **eine gelesene Zeile** — `mail.gmx.net · 587 · STARTTLS` —, kein Feld.
3. **Bei „Eigener Server":** dieselben drei als **Felder**, und **hier** steht
   der Satz *„Immer über den SMTP-Zugang eines Anbieters, nie unmittelbar vom
   Hausanschluss"* — dort, wo er gilt, und sonst nirgends.
4. **Benutzername beim Anbieter**, **Passwort beim Anbieter** *(„gesetzt — leer
   lassen ändert es nicht" als Platzhalter)*.
5. **Absenderadresse**, darunter ihr Hinweis.
6. **Abbrechen · Speichern.**

**AUS NEUN FELDERN WERDEN DREI**, für jeden, der einen der fünf voreingestellten
Anbieter nimmt.

> **DIE ZWEITE BESTÄTIGUNG BLEIBT, WO SIE IST — nachgesehen und nicht
> angenommen.** `mail` ist einer der **sieben** Zwecke in
> `BESTAETIGUNG_ZWECKE`, `PUT /api/mail` trägt weiterhin
> `zweiteBestaetigungNoetig('mail')`, und der Dialog ruft `zweiteBestaetigung()`
> genau wie die Karte vorher. *Ein Dialog, der eine Schranke abkürzt, weil er
> selbst schon ein Dialog ist, wäre der stillste Verlust dieser Runde.*
> **Bricht die Bestätigung ab, bleibt der Dialog stehen** — das Eingetippte wäre
> sonst weg, und ein Anbieterpasswort tippt niemand gern zweimal. *Der
> Prüfstand fährt beide Ausgänge.*

**DIE ANBIETERLISTE IST UNANGETASTET** — fünf Vorlagen und „Eigener Server", wie
sie in `mail.js` stehen. **Sie trägt seit dieser Runde je Eintrag mehr mit:**
Server, Port, Verschlüsselung und den Hinweis. *Das ist keine zweite Liste,
sondern dieselbe: der Dialog wechselt mit der Auswahl beides, und ein Ruf an den
Server je Auswahl wäre eine Anfrage für eine Angabe, die im Quelltext steht.*
**Die Hinweise kommen weiterhin vom Server** — zwei Ausfertigungen liefen
auseinander, sobald ein Anbieter dazukommt (Stolperstein 102). *Aus der Liste
kommt kein Geheimnis heraus; der Prüfstand sieht ausdrücklich nach.*

**WAS NICHT PASSIERT IST:** keine neue Route (`F_ROUTEN` bleibt **69**), keine
neue Karte und keine weniger (achtzehn in fünf Abschnitten), kein neues Feld und
kein neuer Wert im Bestand.

---

## 3. Der Erklärkasten rollt nicht mehr

**BEFUND.** *Wörtlich: „Das gewichtet-Fenster nimmt zu viel Platz weg. Die
Tabelle etwas mit weniger Zeilenabstand, sodass kein Scrollbalken kommt bei
meiner Auflösung."*

Bei sieben Kriterien trug der Kasten **zwölf Tabellenzeilen** und darunter
**drei Absätze**; er lief über `88dvh` hinaus und rollte.

### GEBAUT

1. **`.rz > span { padding: 6px 0 }` → `3px 0`.** *Zwölf Zeilen sparen damit
   rund 72 px.*
2. **`.rechnung-modal { max-width: 540px }` → `620px`.** *Der Fließtext bricht
   seltener um; die Tabelle hat vier Spalten und verträgt die Breite.*
3. **Aus drei Absätzen werden zwei.**

> **IM DESIGNVORSCHLAG STAND, ZWEI DER DREI ABSÄTZE WIEDERHOLTEN DIE TABELLE.
> Das ist beim Nachlesen nicht haltbar, und der Auftrag hat es ausdrücklich
> berichtigt, statt es stillschweigend anders zu bauen.** **Wiederholt wird
> genau EINE Angabe** — die Rechnung `Summe ÷ Teiler = Ergebnis` steht als
> Summe, Teiler und Ergebnis schon in der Tabelle. **Alles andere trägt etwas,
> das dort nicht steht.** *Daraus ist Stolperstein 248 geworden.*

* **Absatz „Teiler":** *„Der Teiler zählt nur die Kriterien, die auch bewertet
  sind"* **bleibt** — das ist an der Zahl nicht abzulesen. **Der Nachsatz geht:**
  *„— sonst zöge es die Zahl nach unten, ohne dass es an den Werten läge"* ist
  eine Begründung, warum es so gebaut ist (Projektstand 5.6), und die gehört
  nicht in einen Kasten, den man beim Lesen einer Note öffnet.
* **Absatz zur Gewichtung bleibt unverändert.** Er ist der Punkt des ganzen
  Kastens und die einzige Stelle des Kastens, an der diese Runde kein Wort
  geändert hat.
* **Absatz „Gerundet":** die **ausgeschriebene Rechnung geht** *(sie steht in
  der Tabelle)*. **Es bleiben zwei Aussagen**, in einer Zeile: dass genau einmal
  gerundet wird, und dass die Zahlen oben für die Anzeige gekürzt sind. **Der
  Verweis auf „Bewertungskriterien" bleibt** — er sagt, wo man es ändert.

*Gerechnet ergibt das rund 590 px statt rund 800 — bei 900 px Fensterhöhe kein
Rollbalken mehr.* **Gerechnet, nicht gemessen**, und das steht hier so
ausdrücklich da, wie der Auftrag es verlangt hat.

---

## 4. Die Filterleiste bekommt ihren Rücksetzer

**BEFUND.** *Wörtlich: „Hier auf der Oberfläche fehlt das Filter-zurücksetzen.
Oder finde ich den gerade nicht?"* — **Er war nicht zu finden, weil es ihn nicht
gab.** Ein *„zurücksetzen"* gab es genau **einmal**, in der **Tag-Zeile**, und
auch dort nur, solange mindestens ein Tag gewählt war.

### GEBAUT

* **„Filter zurücksetzen" rechts in der Sortierzeile**, neben „+ Ansicht
  speichern" — dort, wo er gesucht wurde. *Das Stilblatt schiebt ihn mit
  `margin-left: auto` an den Rand; die Pillen der Sortierzeile wachsen nicht von
  selbst, anders als die Wolke der Tagzeile.*
* **Er steht nur da, wenn wirklich etwas gesetzt ist, und nennt die Zahl:**
  *„Filter zurücksetzen (3)"*. *Ein Knopf, der nichts zu tun hat, ist dieselbe
  Auskunft über nichts wie eine Null am Zähler „Offen".*
* **DIE ZAHL KOMMT AUS `filterZahl()` — und aus nichts anderem.** Dieselbe
  Funktion, die den Schalter über den Filtern trägt, mit denselben Regeln: die
  Sortierung zählt nicht mit, drei Kategorien zählen als **ein** Filter, jeder
  Tag einzeln. **Der Prüfstand hält beide Orte gegeneinander** — er vergleicht
  die Beschriftung des Knopfes mit der des Schalters. *Eine zweite Zählung
  daneben wäre eine zweite Wahrheit (Stolperstein 47).*
* **Zurückgesetzt wird auf `FILTER_VORGABE`**, und der Weg dorthin ist
  `filterNormal()` — derselbe wie beim Anwenden einer gespeicherten Ansicht.
  *Eine zweite Stelle, die eine Filterstellung zurechtrückt, liefe
  auseinander.*

> **ZWEI ABGRENZUNGEN, und beide sind gebaut, wie der Auftrag sie gesetzt hat:**
>
> **Die Suche wird NICHT mitgeräumt.** Sie hat ihr eigenes ✕ im Suchfeld, und
> `filterZahl()` zählt sie nicht mit. *Ein Knopf, der „(3)" sagt und vier Dinge
> wegnimmt, sagt die Unwahrheit.* **Die Sortierung ebenfalls nicht** — aus
> demselben Grund. *Sie steht in `FILTER_VORGABE`, wird beim Zurücksetzen aber
> mitgegeben und nicht überschrieben; der Prüfstand liest danach beides, den
> Zustand im hinausgehenden Rumpf und das Auswahlfeld.*
>
> **Eine gespeicherte Ansicht wird nicht angetastet.** *Zurücksetzen heißt „zeig
> mir alles", nicht „vergiss, was ich mir gemerkt habe".* Der Prüfstand sieht
> nach, dass nach dem Klick kein Schreibvorgang mit `ansichten` hinausgeht.

**Der Filterstand fährt wie immer über `PUT /api/settings` hinaus** — dieselbe
Route, die jeder Klick auf eine Pille schon benutzt. **Keine neue Route**, und
der Prüfstand sieht nach, dass nach dem Klick **keine andere** geschrieben wird.

---

## 5. Die Entscheidungen dieser Runde

**Die Zeile an der Kachel und nicht an der Liste.** *Die Liste klemmte korrekt;
sie zu ändern hätte den Befund nicht berührt.* **`align-items: start` steht am
Raster** — eine Zeile für alle achtzehn Karten in fünf Abschnitten, statt einer
Ausnahme je Kachel.

**Zehn Zeilen auch fürs Sicherheitsprotokoll, obwohl es dort weh tut.** *Zwei
Zahlen für dieselbe Sache sind eine zu viel.* **Der Preis steht im Stilblatt
daneben**, damit die nächste Runde nicht rätselt, ob es Absicht war.

**Die Zeile „Passwort" fällt aus der Karte.** *Der Auftrag führt sie in seiner
Tabelle nicht auf, und die Prüfung dazu ist umgeschrieben statt gestrichen:* die
Karte muss jetzt belegen, dass sie **keine** Zeile „Passwort" trägt, und der
Dialog, dass der Platzhalter am Feld dasteht. **Die Zusage ist dieselbe, der Ort
ein anderer.**

**Die Anbieterliste trägt je Eintrag mehr mit.** *Der Auftrag sagt zweierlei:
„die Anbieterliste wird nicht angefasst" und „die Hinweise kommen weiterhin vom
Server".* **Beides zusammen geht nur so:** die Liste der Anbieter ist
unverändert — fünf Vorlagen und „Eigener Server" —, aber jeder Eintrag bringt
mit, was der Dialog beim Wechseln braucht. *Die Alternative wäre eine zweite
Hinweisliste in `app.js` gewesen, und genau die verbietet Stolperstein 102.*

**Der Dialog bleibt bei einem Abbruch der Bestätigung stehen.** *Der Auftrag
sagt „nach dem Speichern schließt der Dialog"; über den Abbruch sagt er
nichts.* **Ein Dialog, der bei abgebrochener Bestätigung mit zuklappt, wirft das
Eingetippte weg** — und ein Anbieterpasswort tippt niemand gern zweimal.

**Acht Rückbauten sind weggefallen statt mitgezogen.** *Sonst zieht diese
Instanz Rückbauten mit (Stolperstein 201), wenn eine Runde die Zeile umbaut, auf
die sie zeigen.* **Hier geht das nicht:** 343, 344, 345 und 358 bis 362 bauten
die **vier Reihen** des Mailversands zurück, und genau diese Anordnung ist der
Befund dieser Runde gewesen. *Ein Rückbau auf etwas, das es nicht mehr gibt, hat
keinen Ort mehr.* **Neun neue treten an ihre Stelle**, am Dialog und an der
Zustandskarte — und eine Prüfung sieht ausdrücklich nach, dass die sechs
Stilblattregeln der vier Reihen wirklich verschwunden sind.

**Die Prüfgruppe „Der Mailversand ordnet sich — 0.17.1" ist gestrichen, und an
ihrer Stelle steht ein Satz.** *Sie prüfte die vier Reihen; mit ihnen verliert
sie ihren Gegenstand.* **Der Satz im Prüfstand sagt, was sie geprüft hat, warum
sie weg ist und wo ihre Nachfolgerinnen stehen** — damit die Anordnung nicht in
zwei Runden als „gute Idee" wiederkommt (Stolperstein 201).

**„Added" im Changelog, PATCH in der Nummer.** *Der Filterrücksetzer ist ein
neuer Knopf und steht deshalb unter `Added` — ein Betreiber sieht ihn, und ein
Changelog, der ihn unter `Changed` versteckte, wäre unehrlich.* **Die Nummer
bleibt trotzdem PATCH:** zurücksetzen ließ sich vorher auch, Pille für Pille;
der Knopf ist eine Abkürzung und keine Fähigkeit. *Der Auftrag hat den Punkt
gekannt und die Runde trotzdem als PATCH gesetzt.*

---

## 6. Abweichungen vom Auftrag

**Es gibt genau eine, und sie betrifft die Zählweise der Absätze.**

**DER AUFTRAG SAGT: „Aus drei Absätzen werden zwei" — und beschreibt darunter
drei Absätze, die alle drei bleiben sollen.** *Wörtlich: der Absatz „Teiler"
bleibt (ohne seinen Nachsatz), der Absatz zur Gewichtung bleibt unverändert, und
beim Absatz „Gerundet" bleiben zwei Aussagen „in einer Zeile" samt dem Verweis
auf „Bewertungskriterien".* **Beides zugleich geht nicht:** drei Absätze, die
alle drei bleiben, sind drei.

**GEBAUT IST DIE ÜBERSCHRIFT, nicht die Aufzählung** — zwei Absätze unter der
Tabelle. **Zusammengelegt sind „Teiler" und „Gerundet"**: beide sagen, wie aus
den Zeilen darüber EINE Zahl wird, und beide sind nach dem Kürzen ein bis zwei
Zeilen lang. **Der Absatz zur Gewichtung steht unverändert daneben** und rückt
dadurch an die letzte Stelle, ohne dass ein Wort an ihm geändert wäre.

*Die Alternative wäre gewesen, drei Absätze stehenzulassen und die Überschrift
zu übergehen. Der gerechnete Höhengewinn wäre derselbe; die Anweisung war
trotzdem ausdrücklich.*

**Alles Übrige ist gebaut, wie es dasteht** — die Kachelhöhe, die beiden
Deckelzahlen, die fünf Zeilen der Zustandskarte, die sechs Punkte des Dialogs,
die beiden Zahlen im Stilblatt des Erklärkastens, der Rücksetzer samt seinen
zwei Abgrenzungen.

---

## 7. Was je Datei geändert wurde

| Datei | was |
|---|---|
| `public/style.css` | `align-items: start` am `.sys-grid` samt Begründung; die beiden Deckelzahlen (`27.95rem`, `23.3rem`) und ihre Kommentare; die **sechs** Regeln der vier Mailreihen weg, an ihrer Stelle ein Satz und drei neue Regeln für den Dialog (`.mail-dialog`, `.mail-hinweis`, `.mail-fest`); `.rz > span` auf `3px`, `.rechnung-modal` auf `620px`; `.frow-rechts-weit` |
| `public/app.js` | die Karte „Mailversand" als Zustandskarte samt `mailAnbieterZeile()`; der neue `mailDialog()`; `ruesteMailversandAus()` verdrahtet den Knopf statt der Felder; zwei Absätze statt drei im Erklärkasten; der Filterrücksetzer in `drawFilters()` |
| `mail.js` | `fuerDieAuswahl()` — die Anbieterliste samt Hinweis und den drei festen Werten je Eintrag; im Export ergänzt |
| `server.js` | `anbieterListe` liest `mail.fuerDieAuswahl()` statt einer eigenen Zuordnung |
| `README.md` | der Mailversand in seiner neuen Gestalt (Karte und Dialog getrennt), der Deckel bei **zehn** Zeilen samt der berichtigten Zusage zur Kachelhöhe, der Filterrücksetzer. **Weiterhin genau sechs Versionsnummern** |
| `pruefung.js` | die Kartengruppe umgeschrieben, zwei neue Gruppen (Dialog, Stilblatt), die Gruppe „Der Mailversand ordnet sich — 0.17.1" gestrichen und durch einen Satz ersetzt; neue Gruppe für den Filterrücksetzer; `MAIL_ANBIETER_MOCK` um Hinweis und feste Werte ergänzt; die Zahl der Rückbauten auf 380 |
| `gegenprobe.js` | zwanzig neue Rückbauten (369–388), **acht gestrichen** (343–345, 358–362), vier vorhandene mitgezogen (339, 340, 355, 356) |
| `package.json`, `package-lock.json` | Version **0.17.3**, an allen drei Stellen |
| `Doku/Projektstand_Kriterion_0_17_2.md` → `_0_17_3.md` | **`git mv`.** Kopf (Revision 43), der Satz zur Runde, Betriebsstand, **Abschnitt 5.6 berichtigt** (Kachelhöhe, Mailversand, Erklärkasten, Filterleiste), **Stolpersteine 246–250**, Prüfstand (Zahlen, beide Tabellen, Fingerprintliste), Abschnitt 8, Versionsgeschichte, Abschnitt 10 und 10a auf **GEBAUT**. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `CHANGELOG.md` | der Eintrag `[0.17.3] - 2026-08-31`, **ohne Kasten darüber** |
| `Doku/Aenderungsprotokoll_0.17.2.md` | der Feldbeleg zu jener Runde (Fingerprint `edbd76b6`), nachgetragen **vor** dem Bauen |
| `Doku/Aenderungsprotokoll_0.17.3.md` | dieses Papier |
| `Doku/Fehler_und_Ideen.md` | die Zeile der Runde auf **GEBAUT** |

---

## 8. Der Prüfstand

**4805 von 4805 bestanden — 4747 waren es vorher, also 58 neue netto.**

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Der Dialog „Mailzugang einrichten“ — 0.17.3** *(neu)* | — | **36** | eine Spalte statt vier Rastern, der Hinweis **unter** seiner Sache und wechselnd mit der Auswahl, die gelesene Zeile statt dreier gesperrter Felder, der Satz zum Hausanschluss nur bei „Eigener Server", die zweite Bestätigung samt Abbruch |
| **Der Ruecksetzer fuer die Filterleiste — 0.17.3** *(neu)* | — | **22** | er steht nur bei gesetztem Filter, nennt die Zahl aus `filterZahl()` und **dieselbe** wie der Schalter, räumt Suche, Sortierung und gespeicherte Ansicht **nicht** mit |
| **Der Mailversand im Stilblatt — 0.17.3** *(neu)* | — | **6** | die drei Regeln des Dialogs — und dass die sechs Regeln der vier Reihen wirklich weg sind |
| Die Kachel ist so hoch wie ihr Inhalt — 0.17.1, berichtigt in 0.17.3 | 21 | **25** | `align-items: start` am Raster, außerhalb jeder Medienabfrage, und der Deckel bei **genau zehn** Zeilen für beide Listen |
| Der Mailzugang: wer ihn setzen darf | 14 | **21** | die Anbieterliste trägt je Eintrag Server, Port, Verschlüsselung und Hinweis — und kein Geheimnis |
| Die Rechnung hinter der Kopfzahl | 47 | **53** | zwei Absätze statt drei, keine zweite Rechnung, der Teiler bleibt — und die beiden Zahlen im Stilblatt |
| Die Karte „Mailversand“ | 33 | **30** | fünf Zeilen, kein Feld, zwei Knöpfe mit dem richtigen Wort |
| Der Mailversand ordnet sich — 0.17.1 | 20 | **—** | **gestrichen**: sie prüfte die vier Reihen |
| **zusammen** | | | **+58** |

> **EINE GRUPPE IST GESCHRUMPFT UND EINE GANZ WEGGEFALLEN, und beides gehört
> benannt.** *„Die Karte „Mailversand“"* verliert drei Prüfungen an den Dialog —
> dieselben Zusagen, ein anderer Ort. *„Der Mailversand ordnet sich — 0.17.1"*
> ist gestrichen; **an ihrer Stelle steht ein Satz im Prüfstand**, und die Gruppe
> „Der Mailversand im Stilblatt" sieht ausdrücklich nach, dass ihre sechs Regeln
> wirklich verschwunden sind. *Eine Regel ohne Wähler im Markup fällt sonst
> niemandem auf.*

**WAS DER PRÜFSTAND AUSDRÜCKLICH NICHT BELEGEN KANN:**

- **Keine Höhe.** jsdom rechnet kein Layout — ob eine Kachel wirklich auf 186 px
  fällt, ist nur am Bildschirm zu sehen. **Belegt ist die Regel im Stilblatt**,
  und die gemessenen Zahlen stehen in diesem Papier (Stolperstein 223).
- **Keine Breite.** Dass der Erklärkasten bei 620 px seltener umbricht, ist
  gerechnet und nicht gemessen.
- **Kein Rollbalken.** Ob der Kasten bei 900 px Fensterhöhe wirklich ohne
  auskommt, gehört an den Wirt (Abschnitt 13).

---

## 9. Gegenproben

**24 GEFAHREN, 0 STUMM.** *Zwanzig neue (369–388) und die vier vorhandenen, die
diese Runde mitgezogen hat (339, 340, 355, 356).* **Jeder einzelne hat mindestens
eine Prüfung namentlich rot gemacht** — ein Rückbau, der keine rot macht, wäre
ein Fund und kein Erfolg.

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" IST DIE
> SELBSTPROBE UND KEIN BEFUND.** Sie wird bei **jedem** gefahrenen Rückbau rot,
> denn er hat seinen Suchtext gerade ersetzt; der Leser in `gegenprobe.js`
> rechnet sie deshalb heraus, wenn er „stumm" meldet (Stolperstein 213).

| # | Rückbau | Namentlich rot |
|---|---|---|
| 339 | Die Liste bekommt ihre feste Hoehe zurueck | 7 Prüfungen, darunter „.manage-list traegt keine feste Hoehe mehr" (2 Gruppen) |
| 340 | Die Liste verliert die Zeile, an der es sonst scheitert | „.prot-liste darf dafuer unter seinen Inhalt schrumpfen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 355 | Die Liste fordert wieder so viele Zeilen, wie sie hat | „.manage-list fordert seinen Deckel in rem und nicht in Pixeln", „.manage-list fordert genau zehn Zeilen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 356 | Das Sicherheitsprotokoll fordert wieder alle seine Zeilen | „.prot-liste fordert seinen Deckel in rem und nicht in Pixeln", „.prot-liste fordert genau zehn Zeilen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 369 | Das Kachelraster streckt seine Kinder wieder | „Das Kachelraster streckt seine Kinder nicht mehr", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 370 | Die Liste fordert wieder zwoelf Zeilen | „.manage-list fordert genau zehn Zeilen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 371 | Das Sicherheitsprotokoll deckelt wieder bei zwoelf Zeilen | „.prot-liste fordert genau zehn Zeilen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 372 | Die Karte bekommt ihre Passwortzeile zurueck | „Sie ist eine Zustandskarte mit fuenf Zeilen", „Die Karte traegt keine Zeile „Passwort" mehr" |
| 373 | Die Anbieterzeile nennt wieder nur den Namen | „Die Anbieterzeile nennt Name, Server mit Port und Verschluesselung", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 374 | Der Knopf heisst wieder „Mailzugang speichern" | 4 Prüfungen, darunter „Darunter stehen genau zwei Knoepfe" (3 Gruppen) |
| 375 | Der Anbieterhinweis wechselt nicht mehr mit der Auswahl | „Und seinen eigenen Hinweis", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 376 | Die gelesene Zeile steht auch bei „Eigener Server" | „Und die gelesene Zeile verschwindet dafuer", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 377 | Der Dialog kuerzt die zweite Bestaetigung ab | 5 Prüfungen, darunter „Vor dem Speichern steht die zweite Bestaetigung" (2 Gruppen) |
| 378 | Die Anbieterliste kommt wieder ohne Hinweise und feste Werte | 5 Prüfungen, darunter „Jeder Eintrag traegt Server, Port und Verschluesselung" (2 Gruppen) |
| 379 | Der Hinweis rueckt nicht mehr an seine Sache heran | „Der Hinweis rueckt an die Sache heran, die er erklaert", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 380 | Die Felder im Dialog tragen wieder ihren zweiten Abstand | „Und die Felder darin tragen keinen zweiten Abstand", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 381 | Die Zeilen der Rechnung ruecken wieder auseinander | „Die Zeilen der Rechnung ruecken enger zusammen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 382 | Der Erklaerkasten wird wieder schmal | „Und der Kasten selbst wird breiter", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 383 | Die ausgeschriebene Rechnung steht wieder unter der Tabelle | „Die Rechnung steht nicht ein zweites Mal unter der Tabelle", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 384 | Der Filterruecksetzer steht immer da | „Ohne gesetzten Filter steht kein Ruecksetzer da", „Und danach ist der Ruecksetzer selbst wieder weg", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 385 | Der Filterruecksetzer nennt seine Zahl nicht mehr | „Und er nennt die Zahl", „Bei einem einzigen Tag nennt der Knopf die Eins", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 386 | Der Filterruecksetzer raeumt die Sortierung mit | „Die Sortierung bleibt, wo sie war", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 387 | Der Filterruecksetzer raeumt die Suche mit | „Eine Sekunde vor Ablauf traegt der Link noch", „Der Suchbegriff bleibt ebenfalls stehen" |
| 388 | Der Filterruecksetzer steht nicht mehr am rechten Rand | „Das Stilblatt schiebt ihn an den rechten Rand", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |

> **EINE ZEILE IN DER TABELLE GEHÖRT ERKLÄRT: Rückbau 387.** Neben der
> erwarteten Zeile *„Der Suchbegriff bleibt ebenfalls stehen"* ist dort
> *„Eine Sekunde vor Ablauf trägt der Link noch"* rot geworden — **eine
> Zeitprobe mit einem zu engen Fenster**, dieselbe, die schon beim Schreiben der
> Papiere zu 0.17.2 einmal rot war. *Sie setzt den Ablauf auf `+1 seconds` und
> ruft dann; auf einer Maschine, die nebenher drei Gegenproben fährt, reicht
> diese eine Sekunde nicht.* **Mit dem Rückbau hat sie nichts zu tun**, und der
> volle Lauf auf ruhiger Maschine ist an dieser Stelle grün — 4805 von 4805.
> *Angefasst ist sie nicht: das gehört in eine Runde, die sich das vornimmt.*

---

## 10. Neue Stolpersteine

**Fünf, und sie zählen bei 246 weiter** — 245 war vergeben. *Der volle Wortlaut
steht im Projektstand, Abschnitt 6.*

| Nr. | Kernsatz |
|---|---|
| **246** | **Wer eine Höhe nachmisst, muss zuerst sagen, WELCHES Element sie trägt.** Stolperstein 140 hat gegriffen und war trotzdem zu eng: „nachmessen statt annehmen" sagt nichts darüber, WORAN gemessen wird. *Stimmt die Zahl und der Befund steht trotzdem, ist der gemessene Kasten der falsche.* |
| **247** | **Ein gesperrtes Feld ist keine Anzeige — es sieht aus wie eines, das gleich aufgeht.** 0.17.1 hatte recht mit „wer GMX gewählt hat, soll SEHEN, wohin geschickt wird"; das Mittel trug nicht. *Was gezeigt und nicht eingestellt wird, ist eine Zeile und kein Feld.* |
| **248** | **Eine Behauptung aus einem Vorschlag gehört nachgelesen, bevor sie gebaut wird** — auch dann, wenn der Vorschlag besprochen und angenommen ist. *Ein angenommener Vorschlag ist eine Entscheidung über die Richtung und keine über den Bestand.* |
| **249** | **Eine Umbenennung über einen ganzen Block trifft auch Teilwörter.** `rListe` → `rAnbListe` machte aus `anbieterListe` ein `anbieterAnbListe`; `every` auf einer leeren Liste ist wahr, und zwei Prüfungen waren aus dem falschen Grund grün. |
| **250** | **Im Prüfstand ist eine Konstante, die weiter unten steht, eine tote Zone — und der Lauf reißt ab, statt rot zu werden.** *Prüfungen am DOM stehen bei ihrer Gruppe, Prüfungen am Stilblatt hinter der Stelle, an der das Stilblatt gelesen wird.* |

> **ZWEI DAVON HAT DAS BAUEN SELBST GELIEFERT — 249 und 250.** *Beide haben je
> einen vollen Prüflauf gekostet, und beide stehen deshalb hier: ein Fehler, der
> fünfeinhalb Minuten kostet, ist billiger als einer, der beim nächsten Mal
> wieder passiert.*

---

## 11. Die Zahlen

| | vorher (0.17.2) | nachher (0.17.3) |
|---|---|---|
| Prüfungen | 4747 | **4805** |
| Rückbauten in `gegenprobe.js` | 368 | **380** |
| Stolpersteine | 245 | **250** |
| Routen (`F_ROUTEN`) | 69 | **69** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 18 in 5 Abschnitten | **18 in 5 Abschnitten** |
| persönliche Schlüssel | 8 | **8** |
| markierte Migrationsblöcke | 7 | **7** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Versionsnummern in der README | 6 | **6** |
| Fingerprint | `edbd76b6` | **`ebd36b66`** |

---

## 12. Was ausdrücklich nicht passiert ist

- **Keine neue Route.** `F_ROUTEN` bleibt bei **69** — der Speicherweg des
  Mailzugangs und die Testmail sind dieselben, und der Filterstand fährt über
  `PUT /api/settings` hinaus wie jeder Klick auf eine Pille.
- **Keine neue Karte, keine Karte weniger.** Achtzehn in fünf Abschnitten.
- **Kein neues Feld, kein neuer Wert im Bestand.** Der Dialog stellt dasselbe
  ein wie die Karte vorher; `mailzugang` bleibt **ein** Schlüssel in `settings`.
- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.** Sieben
  markierte Blöcke, Austauschformat **11**.
- **Keine neue Abhängigkeit**, auch nicht für den Prüfstand.
- **Die zweite Bestätigung ist nicht angefasst.** Sieben Zwecke, und `mail` ist
  weiterhin einer davon.
- **Die Anbieterliste ist nicht angefasst** — fünf Vorlagen und „Eigener
  Server", in derselben Folge wie vorher. *Der Prüfstand zählt sie.*
- **Der engere Bildausschnitt und das wählbare Bildformat sind nicht
  hereingezogen worden** — sie gehören zur Bildablage (0.19.0). **Die
  Optikrunde ist 0.20.0**, der Kommentarschnitt **0.21.x**.
- **Das Konzeptpapier und das Videopapier sind nicht angefasst.**
- **Keine Tags gesetzt**, kein Tag-Push.

---

## 13. Offen geblieben

**DIESE RUNDE IST IM FELD NOCH NICHT BESTÄTIGT.** *Der Fingerprint steht —
`ebd36b66` —, die Instanz hat ihn noch nicht gemeldet.* **Nach dem
Einspielen gehört ein Blick in Systembereich → Datenbank → Kennzahlen:** steht
dort ein anderer Wert, liegt auf dem Wirt eine Datei, die kein Commit trägt
(Stolperstein 158).

### Die vier Handgriffe, die diese Runde im Feld belegen

1. **Der Abschnitt „Zugänge" auf einem breiten Schirm.** **Keine Kachel steht
   mehr leer** — eine leere Liste macht eine kurze Kachel, und die Nachbarin
   daneben zieht sie nicht mehr auf. *Im selben Blick der Abschnitt „Bestand":
   die Tagliste deckelt bei **zehn** Zeilen und rollt.* **Das ist der
   eigentliche Punkt und in jsdom nicht zu sehen.**
2. **„Mailzugang ändern" drücken.** Der Dialog kommt; bei einer Vorlage stehen
   Server, Port und Verschlüsselung als **eine gelesene Zeile** da und nicht als
   drei Felder, der Hinweis wechselt mit der Auswahl, und **Speichern fragt nach
   dem Passwort** — bei eingeschaltetem zweitem Faktor zusätzlich nach einem
   Code.
3. **Einen Eintrag mit sieben Kriterien öffnen und auf die Gesamtnote klicken.**
   **Kein Rollbalken.** *Die 590 px sind gerechnet; hier werden sie gesehen.*
4. **Einen Filter setzen.** Der Rücksetzer erscheint **mit der richtigen Zahl**,
   und ein Klick räumt die Filter weg, ohne den Suchbegriff oder die Sortierung
   anzufassen.

### Was aus den Runden davor weiterhin aussteht

- **Drei der fünf Handgriffe zu 0.17.2** — die Karte „Meine Sitzungen" auf dem
  Telefon, ein Eintrag mit genau einer Stimme, und die stille Glocke nach einem
  eigenen Kommentar. *Der Blick auf die Karte „Mailversand" aus jener Runde ist
  mit dieser hinfällig geworden: die Karte gibt es in jener Gestalt nicht mehr.*
- **Die drei Handgriffe zu 0.17.1** (Kachel „Zugang" als gewöhnlicher Benutzer,
  das Video im Vollbild, das Lesezeichen auf `#/system/anlage`).
- **Die drei Handgriffe zu 0.17.0** (Kriterienliste bei einem einzigen Zugang,
  Glockentafel, Versionszeile auf dem Telefon).
- **Der volle Gegenprobenlauf** über alle 380 Rückbauten — bei rund fünfeinhalb
  Minuten je Lauf etwa fünfunddreißig Stunden, in vier Nebenspuren rund neun.
- **Die Migrationsblöcke 0.14.0 und 0.16.0** am echten Bestand.
- **Der Teilexport ein drittes Mal mit Mitschrift** — und **ein Teil in eine
  Zweitinstanz eingespielt, nicht in die laufende** —, sowie **beide Netze am
  echten Wirt.** *Unverändert offen seit 0.16.0; beides kostet keine Zeile Code
  und ist nur am echten Bestand zu haben.*

*Alles Weitere steht im Projektstand, Abschnitt 8.*
