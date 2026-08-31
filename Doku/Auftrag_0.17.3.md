# Auftrag 0.17.3 — „Die Karte zeigt, der Dialog stellt ein"

**Vier Handgriffe aus dem Rundlauf mit 0.17.2**, gemeldet am 31. August 2026
unmittelbar nach dem Einspielen. **Zwei davon sind Nacharbeit an 0.17.2
selbst** — der Deckel geht nach oben mit und nach unten nicht, und der
Mailversand ist zwar geordnet, aber nicht ruhig geworden.

*Der Designvorschlag mit den gezeichneten Kacheln lag als eigene Seite vor; er
ist besprochen, und **Vorschlag A ist gewählt**. Was hier steht, ist die
verbindliche Fassung — die Seite ist es nicht.*

---

## 0. Was vor dem ersten Handgriff zu tun ist

> **0.17.2 IST EINGESPIELT UND IM FELD ZU SEHEN.** Die laufende Instanz meldet
> **`edbd76b6`** — genau den gebauten Wert. *Auf dem Wirt liegt keine Datei, die
> kein Commit trägt (Stolperstein 158).*
>
> **DAS GEHÖRT EINGETRAGEN, BEVOR GEBAUT WIRD:** Änderungsprotokoll 0.17.2
> (Abschnitt 14), Betriebsstand und Fingerprintliste im Projektstand. *Dasselbe
> Vorgehen wie bei 0.17.1: das Papier wird dafür ein zweites Mal angefasst, und
> der Grund steht dort ausdrücklich.*
>
> **WAS AUS 0.17.2 NOCH NICHT AM BILDSCHIRM GESEHEN IST** und mit einem Blick zu
> haben ist: *(a)* die Karte **„Mailversand"** — der GMX-Satz steht **neben** der
> Absenderadresse *(das wird mit Punkt 2 ohnehin umgebaut; der Blick lohnt
> trotzdem, weil er die Ausgangslage belegt)*; *(b)* ein Eintrag, den **genau
> einer** bewertet hat — hinter dem Schnitt steht **keine Klammer**, und beim
> Überfahren nennt der Klartext trotzdem *„aus 1 Stimme"*; *(c)* die **Glocke**
> nach einem eigenen Kommentar — sie muss **still bleiben**.
>
> **DIE DREI HANDGRIFFE ZU 0.17.1 UND DIE DREI ZU 0.17.0 STEHEN WEITERHIN AUS.**
> Der Projektstand führt sie in Abschnitt 8. *Fällt einer durch, ist das ein
> Befund für die nächste Runde.*

**Weiterhin ausstehend, unverändert seit 0.16.0:** der Teilexport ein drittes Mal
mit Mitschrift — **und ein Teil in eine Zweitinstanz eingespielt, nicht in die
laufende** —, sowie beide Netze am echten Wirt. *Beides kostet keine Zeile Code
und ist nur am echten Bestand zu haben.*

---

## Die Nummer: PATCH

**0.17.3.** Abschnitt 5.1 des Projektstands: *„Dritte Zahl (PATCH) nur für
abwärtskompatible Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist
keine PATCH-Runde."*

**Diese Runde bringt keine Funktion.** Vier Handgriffe an Anordnung und Anzeige.
**Die Instanz kann danach nichts, was sie vorher nicht konnte** — auch mit Punkt 2
nicht: der Dialog benutzt den Speicherweg, den es gibt, und die zweite
Bestätigung bleibt, wo sie ist.

> **ZUR ABGRENZUNG:** der **engere Bildausschnitt** und das **wählbare
> Bildformat** gehören weiter zur **Bildablage (0.19.0)**, die **Optikrunde** ist
> **0.20.0**, der **Kommentarschnitt** ist **0.21.x**. *Nichts davon wird hier
> hereingezogen — auch nicht „weil man gerade dran ist".*

---

## 1. Der Deckel geht nach oben mit — nach unten nicht

**BEFUND.** *Wörtlich: „Zwölf Einträge sind glaube ich zu viel, lass uns daraus
zehn machen. Und wenn wir nach oben hin einen dynamischen Deckel haben, haben wir
auch einen der nach Minimum geht — wenn nichts oder wenig da ist, macht das
keinen Sinn, dass wir das leer lassen."* **Die Bilder zeigen es an „Anfragen" und
„Zugänge": eine leere und eine fünfzeilige Liste in einer Kachel, die über
tausend Pixel hoch ist.**

> **DIE URSACHE LAG NICHT DORT, WO 0.17.2 SIE GESUCHT HAT — und das gehört
> aufgeschrieben.** Die **Liste** klemmt korrekt: zwei Einträge sind 84 px, eine
> leere Liste ist 0. **Die Kachel klemmt nicht.** `.sys-grid` ist ein Raster, und
> ein Raster zieht jedes Kind auf die Höhe der höchsten Zelle seiner Reihe
> (`align-items` steht von Haus aus auf `stretch`). **Der Leerraum steht unter
> dem Inhalt IN der Kachel, nicht in der Liste** — und genau deshalb hat die
> Messung zu 0.17.2 ihn nicht gesehen: sie hat die Liste gemessen und die Kachel
> übersehen. *Stolperstein 140 hat gegriffen und war trotzdem zu eng gefasst:
> nachgemessen wurde das Falsche.*

**NACHGEMESSEN IN CHROMIUM, Fenster 1600×913, drei Kacheln nebeneinander:**

| Kachel | heute | mit dieser Runde |
|---|---:|---:|
| Liste mit **2** Zeilen | **605 px** | **186 px** |
| Liste **leer** | **605 px** | **136 px** |
| Liste mit **50** Zeilen | 605 px | 521 px *(Liste 419 px = zehn Zeilen, rollt)* |

### GEBAUT WIRD — zwei Zeilen im Stilblatt

1. **`.sys-grid { align-items: start; }`** — *jede Kachel ist so hoch wie ihr
   Inhalt.*
2. **Der Deckel von zwölf auf zehn Zeilen**, und zwar für **beide** Listen:
   * `.manage-list` von `33.5rem` auf **`27.95rem`** *(10 × 41,92 px bei
     Wurzelschrift 15)*
   * `.prot-liste` von `28rem` auf **`23.3rem`** *(10 × 35 px — eine
     `.prot-zeile` trägt keinen Abstand zur nächsten, sondern eine Linie)*

> **ZEHN AUCH FÜRS SICHERHEITSPROTOKOLL, und der Preis steht dazu.** Dort sind
> die Zeilen schmaler, zehn statt zwölf heißt spürbar weniger Protokoll auf einen
> Blick. **Trotzdem eine Regel und nicht zwei:** zwei Zahlen für dieselbe Sache
> sind eine zu viel (Stolperstein 47), und wer die Liste wirklich durchsieht,
> nimmt ohnehin den Filter darüber. *Wenn sich das im Betrieb als falsch
> erweist, ist das ein Befund und keine Katastrophe — es ist eine Zahl im
> Stilblatt.*

**WAS DABEI NICHT VERLORENGEHT, und es gehört benannt:** die Zusage aus 0.17.1,
dass eine Liste die Höhe ihrer Kachel bekommt, **wird gegenstandslos statt
gebrochen** — es gibt keine geschenkte Höhe mehr, die ungenutzt bliebe. *Die
Zeilen `flex: 1 1 <Deckel>`, `min-height: 0` und `max-height: max-content`
bleiben unangetastet:* ohne sie wächst ein Flexkind über seinen Anteil hinaus,
statt zu rollen (Stolperstein 237), und ohne die dritte forderte auch eine kurze
Liste ihre zehn Zeilen.

**AUF DEM TELEFON ÄNDERT SICH NICHTS.** Dort steht jede Kachel allein in ihrer
Zeile, und der Deckel hängt am Fenstermaß (`62dvh`). **Die Ausnahme
`#ex-teil-liste` bleibt ebenfalls, wie sie ist.**

**AM PRÜFSTAND** ist die Regel im Stilblatt zu belegen — **die Wirkung nicht**:
jsdom rechnet kein Layout. *Die gemessenen Zahlen gehören ins
Änderungsprotokoll, nicht in eine Prüfung, die sie nicht messen kann
(Stolperstein 223).*

---

## 2. Der Mailversand: die Karte zeigt, der Dialog stellt ein

**BEFUND.** *Wörtlich: „Mailversand sieht so hässlich aus. So durcheinander.
Eventuell, wo die Eingabe über eine extra Maske gemacht wird und man in diesem
Fenster nur auswählen kann, ob eigener Server oder ein voreingestellter."*

**WORAN ES LIEGT, LÄSST SICH BENENNEN: es sind vier Rhythmen in einer Karte.**
Neun Bedienelemente teilen sich vier verschiedene Spaltenaufteilungen — `1fr`,
`3fr 1fr 2fr`, `1fr 1fr`, `1fr 2fr` —, und dazwischen stehen vier Erklärsätze:
zwei **neben** einem Feld, zwei über die volle Breite. *Das Auge findet keine
Spalte.* Dazu die Reihe „Anbieter": ein Feld auf einem Drittel, daneben zwei
Drittel Leere mit einem Strich darin, der wie ein Fehler aussieht.

### GEBAUT WIRD — Vorschlag A

**DIE KARTE WIRD EINE ZUSTANDSKARTE WIE IHRE NACHBARN.** Kein Raster, kein Feld,
kein Erklärsatz neben einer Sache:

| Zeile | Inhalt |
|---|---|
| Zustand | `eingerichtet` / `nicht eingerichtet` |
| Anbieter | `Eigener Server · smtp.beispiel.de:587 · STARTTLS` — **eine** Zeile |
| Absender | die Absenderadresse |
| Öffentliche Adresse | unverändert |
| Zuletzt erfolgreich getestet | unverändert |

Darunter **zwei Knöpfe**: **„Mailzugang einrichten"** *(nicht eingerichtet)*
beziehungsweise **„Mailzugang ändern"** *(eingerichtet)* — und **„Testmail an
mich"**. **Der Satz zur Testmail bleibt** und steht darunter; er nennt eine
Folge, die man kennen muss. **Der Einleitungsabsatz bleibt**, wie er ist.

**DER DIALOG TRÄGT EINEN RHYTHMUS — eine Spalte, Beschriftung über dem Feld:**

1. **Anbieter** *(Auswahl)*. **Darunter, nicht daneben:** der Hinweis, der zu
   genau diesem Anbieter gehört, und er wechselt mit der Auswahl.
2. **Bei einem voreingestellten Anbieter:** Server, Port und Verschlüsselung als
   **eine gelesene Zeile** — `mail.gmx.net · 587 · STARTTLS` —, kein Feld. *Die
   Werte stehen fest; drei Felder für drei feste Werte sind drei Felder zu viel.*
3. **Bei „Eigener Server":** dieselben drei als **Felder**, und **hier** steht
   der Satz *„Immer über den SMTP-Zugang eines Anbieters, nie unmittelbar vom
   Hausanschluss"* — dort, wo er gilt, und sonst nirgends.
4. **Benutzername beim Anbieter**, **Passwort beim Anbieter**
   *(„gesetzt — leer lassen ändert es nicht" bleibt als Platzhalter)*.
5. **Absenderadresse**, darunter ihr Hinweis.
6. **Abbrechen · Speichern.** Nach dem Speichern schließt der Dialog, und die
   Karte zeigt den neuen Zustand.

**AUS NEUN FELDERN WERDEN DREI**, für jeden, der einen der fünf voreingestellten
Anbieter nimmt.

> **DIE ZWEITE BESTÄTIGUNG BLEIBT, WO SIE IST — das ist die harte Klemme dieses
> Punktes.** `mail` ist einer der **sieben** Zwecke in `BESTAETIGUNG_ZWECKE`.
> **Speichern im Dialog geht denselben Weg wie heute:** Passwort, und bei
> eingeschaltetem zweitem Faktor ein Code. *Ein Dialog, der eine Schranke
> abkürzt, weil er selbst schon ein Dialog ist, wäre der stillste Rückschritt
> dieser Runde.* **Nachzusehen, nicht anzunehmen.**

**WAS AUSDRÜCKLICH NICHT PASSIERT:**

* **Keine neue Route.** `F_ROUTEN` bleibt bei **69** — der Speicherweg und die
  Testmail sind dieselben.
* **Keine neue Karte, keine Karte weniger.** Achtzehn in fünf Abschnitten.
* **Kein neues Feld, kein neuer Wert im Bestand.** Der Dialog stellt dasselbe
  ein wie die Karte heute.
* **Die Anbieterliste wird nicht angefasst** — fünf Vorlagen und „Eigener
  Server", wie sie in `mail.js` stehen. *Die Hinweise kommen weiterhin vom
  Server; zwei Ausfertigungen liefen auseinander.*

---

## 3. Der Erklärkasten zur Gewichtung rollt

**BEFUND.** *Wörtlich: „Das gewichtet-Fenster nimmt zu viel Platz weg. Die
Tabelle etwas mit weniger Zeilenabstand, sodass kein Scrollbalken kommt bei
meiner Auflösung."*

Bei sieben Kriterien trägt der Kasten **zwölf Tabellenzeilen** und darunter
**drei Absätze**; er läuft über `88dvh` hinaus und rollt.

### GEBAUT WIRD

1. **`.rz > span { padding: 6px 0 }` → `3px 0`.** *Zwölf Zeilen sparen damit rund
   72 px.*
2. **`.rechnung-modal { max-width: 540px }` → `620px`.** *Der Fließtext bricht
   seltener um; die Tabelle hat vier Spalten und verträgt die Breite.*
3. **Aus drei Absätzen werden zwei** — und hier ist eine Behauptung aus dem
   Designvorschlag zu berichtigen:

> **IM VORSCHLAG STAND, ZWEI DER DREI ABSÄTZE WIEDERHOLTEN DIE TABELLE. Das ist
> beim Nachlesen nicht haltbar**, und der Auftrag sagt es, statt es
> stillschweigend anders zu bauen. **Wiederholt wird genau EINE Angabe** — die
> Rechnung `24,75 ÷ 8,25 = 3` steht als Summe, Teiler und Ergebnis schon in der
> Tabelle. **Alles andere trägt etwas, das dort nicht steht.**

* **Absatz „Teiler":** *„Der Teiler zählt nur die Kriterien, die auch bewertet
  sind"* **bleibt** — das ist an `8,25` nicht abzulesen. **Der Nachsatz geht:**
  *„— sonst zöge es die Zahl nach unten, ohne dass es an den Werten läge"* ist
  eine Begründung, warum es so gebaut ist (Abschnitt 5.6).
* **Absatz zur Gewichtung bleibt unverändert.** Er ist der Punkt des ganzen
  Kastens.
* **Absatz „Gerundet":** die **ausgeschriebene Rechnung geht** *(sie steht in der
  Tabelle)*. **Es bleiben zwei Aussagen**, in einer Zeile: dass genau einmal
  gerundet wird, und dass die Zahlen oben für die Anzeige gekürzt sind. **Der
  Verweis auf „Bewertungskriterien" bleibt** — er sagt, wo man es ändert.

*Gerechnet ergibt das rund 590 px statt rund 800 — bei 900 px Fensterhöhe kein
Rollbalken mehr. **Gerechnet, nicht gemessen:** wer es baut, misst es nach.*

---

## 4. Es gibt keinen Rücksetzer für die Filter

**BEFUND.** *Wörtlich: „Hier auf der Oberfläche fehlt das Filter-zurücksetzen.
Oder finde ich den gerade nicht?"* — **Er ist nicht zu finden, weil es ihn nicht
gibt.** Nachgesehen: ein *„zurücksetzen"* gibt es genau **einmal**, in der
**Tag-Zeile**, und auch dort nur, solange mindestens ein Tag gewählt ist. **Für
die Filterleiste als Ganzes gibt es keinen.**

### GEBAUT WIRD

* **„Filter zurücksetzen" rechts in der Sortierzeile**, neben „+ Ansicht
  speichern" — dort, wo er gesucht wurde.
* **Er steht nur da, wenn wirklich etwas gesetzt ist, und nennt die Zahl:**
  *„Filter zurücksetzen (3)"*. *Ein Knopf, der nichts zu tun hat, ist dieselbe
  Auskunft über nichts wie eine Null am Zähler „Offen".*
* **DIE ZAHL KOMMT AUS `filterZahl()` — und aus nichts anderem.** Die Funktion
  gibt es, sie trägt den Schalter auf dem Telefon, und **ihre Regeln sind bereits
  entschieden**: die Sortierung zählt nicht mit *(„eine andere Reihenfolge nimmt
  nichts weg, sie ordnet nur")*, drei Kategorien zählen als **ein** Filter, jeder
  Tag einzeln. **Eine zweite Zählung daneben wäre eine zweite Wahrheit**
  (Stolperstein 47).
* **Zurückgesetzt wird auf `FILTER_VORGABE`** und sonst nichts.

> **ZWEI ABGRENZUNGEN, und beide berichtigen den Designvorschlag:**
>
> **Die Suche wird NICHT mitgeräumt.** Sie hat ihr eigenes ✕ im Suchfeld, und
> `filterZahl()` zählt sie nicht mit. *Ein Knopf, der „(3)" sagt und vier Dinge
> wegnimmt, sagt die Unwahrheit.* **Die Sortierung ebenfalls nicht** — aus
> demselben Grund, aus dem sie nicht mitgezählt wird.
>
> **Eine gespeicherte Ansicht wird nicht angetastet.** *Zurücksetzen heißt „zeig
> mir alles", nicht „vergiss, was ich mir gemerkt habe".*

**Der Filterstand fährt wie immer über `PUT /api/settings` hinaus** — dieselbe
Route, die jeder Klick auf eine Pille schon benutzt. **Keine neue Route.**

---

## Bauregeln

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; **„Desktop"** und nicht
  „Schreibtisch"; die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch nicht für den Prüfstand.
* **Keine Zugangsdaten im Gespräch.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
  **Und keine echten Adressen in Papieren oder Beispielen** — die Karte
  „Mailversand" wird umgebaut, ihre Werte gehören nicht ins Repo.
* **KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE FORMATNUMMER.** Es bleibt bei
  **sieben** markierten Blöcken und bei **Austauschformat 11**. *Kommt deine
  Durchsicht zu einem anderen Ergebnis, ist das ein Grund anzuhalten und zu
  fragen, nicht stillschweigend abzuweichen.*
* **Die Sicherung des Datenverzeichnisses ist Empfehlung und nicht Pflicht** —
  keine Datenbankstufe. **Im Changelog steht dann kein Kasten über den
  Änderungen**, und das ist die ganze Aussage.
* **`F_ROUTEN` bleibt bei 69**, **`BESTAETIGUNG_ZWECKE` bei sieben**, **achtzehn
  Karten in fünf Abschnitten**, **acht persönliche Schlüssel**. **Nachzählen,
  nicht annehmen.**
* **Kommentare sind zeitlos.** Eine fachliche Warnung ja, eine Entstehungs-
  geschichte nein — **außer dort, wo eine zurückgenommene Entscheidung sonst
  wiederkäme** (Stolperstein 201).
* **Neue Stolpersteine zählen bei 246 weiter.** 245 ist vergeben.
* **TAGS WERDEN NICHT MEHR GESETZT** — kein Tag, kein Tag-Push.
* **Die Frage an jede Gruppe bleibt:** *was sieht jemand, der das Projekt nicht
  gebaut hat?* — **das ist die Frage aus Stolperstein 245, und sie gilt in dieser
  Runde für jede Zeile, die die Oberfläche neu bekommt.**

### Zu den Agenten — rationell und nicht ängstlich

1. **Nie gegen einen wandernden Arbeitsbaum.** Ein Nachlauf gehört gegen einen
   festgeschriebenen Commit.
2. **Nie neben einem laufenden Prüflauf oder einer Gegenprobe.** Spur 0 der
   Gegenprobe fährt **ohne Portversatz**, also auf denselben Portbasen wie
   `npm test`.
3. **Einer mit einer scharfen Frage schlägt sechzehn mit einer weichen.**

**Und aufgeräumt wird nach Prozessnummer, nie nach Namen.** *In 0.17.2 hat ein
Prüfserver aus einem früheren Lauf auf Port 3988 überlebt und wurde erst beim
Nachsehen gefunden.*

### Wenn in Chromium gemessen wird

**Das Fenster gehört mit angegeben.** *In 0.17.2 ist eine Messung unbemerkt in
Telefonbreite gelaufen — dort galt `62vh` statt des Deckels, und die Zahl war
richtig gemessen und beantwortete die falsche Frage.* **`--window-size` setzen
und die Größe in die Notiz schreiben.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst.** *Brichst du doch einen ab,
  räum die Server auf und sag es.*
* **`Doku/Aenderungsprotokoll_0.17.3.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 246**), die Gegenprobentabelle **aus `gegenprobe.js`**,
  Prüfungszahlen vorher/nachher (**vorher: 4747**), Rückbauten vorher/nachher
  (**vorher: 368**), Offengebliebenes.
* **DIE FELDBELEGE ZU 0.17.2 GEHÖREN EINGETRAGEN** — Fingerprint `edbd76b6` im
  Änderungsprotokoll 0.17.2, im Betriebsstand und in der Fingerprintliste.
* Die Zeile „0.17.3 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat,
  nicht in den Dokumenten.** Darunter: **den Abschnitt „Zugänge" öffnen** *(keine
  Kachel steht mehr leer)*, **„Mailzugang ändern" drücken** *(der Dialog kommt,
  Speichern fragt nach dem Passwort)*, **einen Eintrag mit sieben Kriterien
  öffnen und auf die Gesamtnote klicken** *(kein Rollbalken)* und **einen Filter
  setzen** *(der Rücksetzer erscheint mit der richtigen Zahl)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_17_3`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Abschnitt 10 und 10a** — **und Abschnitt 5.6**, in dem
  die Regel zur Kachelhöhe steht: *sie ist mit dieser Runde zu berichtigen, nicht
  zu löschen* (Stolperstein 201).
* **Die README** bekommt den Mailversand in seiner neuen Gestalt, den Deckel bei
  **zehn** Zeilen und den Filterrücksetzer. *Und weiterhin gilt: die Nummer bleibt
  nur, wo sie eine Handlung bestimmt — es sind sechs, und ein Wächter hält die
  Zahl fest.*
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile, **und keinen Kasten darüber** —
  diese Runde verlangt vor dem Einspielen nichts.
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**
* **`Doku/Auftrag_0.17.2.md` fällt weg.** *Es liegt immer nur einer im Repo.*

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg. **Trag 0.17.3 dort ein, wenn
> die Runde steht.**
