# Änderungsprotokoll 0.20.1 — „Die Karte listet die Sicherungen"

**PATCH · 3. September 2026 · drei Befunde aus dem Betrieb, unmittelbar nach
dem Einspielen von 0.20.0.** *Angefasst sind `server.js`, `public/app.js`,
`public/style.css`, `pruefung.js`, `gegenprobe.js`, `package.json`,
`package-lock.json` und die Papiere.*

**KEINE DATENBANKSTUFE, KEIN BESTANDSLAUF, KEINE NEUE ROUTE, KEINE NEUE KARTE,
KEINE NEUE AUSGELIEFERTE DATEI.** Austauschformat **12**, `F_ROUTEN` **71**,
neun Zwecke der zweiten Bestätigung, einundzwanzig Vorgänge, zwanzig Karten,
acht Migrationsblöcke, neun ausgelieferte Module. **Auch an `settings` ändert
sich nichts** — dieselben drei Schlüssel, dieselben Grenzen, dieselben
Vorgaben.

> **DIE INSTALLATION KANN DANACH NICHTS, WAS SIE VORHER NICHT KONNTE.** Dieselbe
> Regel, dieselben Knöpfe, dieselben Dateien fallen. **Sie sagt nur mehr — und
> mit weniger Worten.** *Das ist der Maßstab aus Abschnitt 5.1, und er ergibt
> hier PATCH.*

---

## 0.20.0 ist im Feld bestätigt

**Die laufende Installation hat am 3. September 2026 den Fingerprint
`12421721` gemeldet** — genau den Sollwert aus dem Änderungsprotokoll 0.20.0.
*Der Dateisatz auf dem Wirt ist also der, der gemeint war.*

**Der Rundlauf hat drei Befunde gebracht, und alle drei betreffen die
Oberfläche.** *An der Regel selbst, an der Löschroute, an den Grenzen, am
Protokolleintrag und am Anschluss an die Sicherung hat er nichts gefunden.*

---

## Die drei Befunde — wortgleich aus dem Betrieb

> **1.** *„im Kachel möchte ich eine Liste haben mit den Sicherungen … wie alt,
> wann, wie groß und Nummer (jüngste bis neueste), wenn vorhanden bis 5, der
> Rest dann durch einen Scrollbalken ansehbar. Kein Löschen etc. möglich, nur
> sichten."*
>
> **2.** *„Der Text vom GUI muss so kurz wie möglich sein und dennoch muss es
> zu verstehen sein, was gemeint ist."*
>
> **3.** *„Boden und Schere sind Begriffe, die hier nicht benutzt werden. Das
> spricht man hier nicht."*
>
> Und nachgereicht: *„im Fenster ‚Sicherungen' nur Info über die letzte
> Sicherung — und im Fenster ‚alte Sicherung' alle auflisten. Dann aber
> braucht es nicht die vollen Namen, sondern einfach Nummer, Datum, Größe."*

---

## 1. Die Liste — der eigentliche Befund

**Bis 0.20.0 stand die vollständige Liste der Sicherungen nirgends.** Die Karte
„Sicherung" nannte die **jüngste** Kopie mit Name, Datum und Größe, dazu die
**Zahl** der Dateien am Ort; die Karte „Alte Sicherungen" nannte die, die die
Regel **treffen würde**, und die von vor dem Schlüsselwechsel. **Wer wissen
wollte, was überhaupt daliegt, brauchte eine Shell** — und genau das sollte die
Runde 0.20.0 abschaffen.

> **DAS IST EINE HALBE ZUSAGE, UND SIE GEHÖRT BENANNT.** Der Auftrag zu 0.20.0
> verlangte eine **Vorschau** — „die Karte nennt namentlich, welche Dateien die
> Regel treffen würde" —, und die war gebaut. *Sie beantwortet aber die Frage
> „darf ich löschen?" nur zur Hälfte:* **wer das entscheiden will, will sehen,
> WAS DALIEGT**, nicht nur, was fällt.

### Was jetzt dasteht

| | |
|---|---|
| Umfang | **alle** Sicherungen am geprüften Ort |
| Reihenfolge | **jüngste zuerst** |
| Nummer | **#1 ist die jüngste** — dieselbe Richtung, in der die Mindestzahl zählt |
| Je Zeile | Nummer · Datum und Uhrzeit · Alter in Tagen · Größe |
| Marke | `löschen` *(rot — die Regel trifft sie)* oder `alter Schlüssel` *(gedämpft)* |
| Deckel | **fünf** Zeilen, der Rest rollt |
| Bedienung | **keine.** Kein Knopf in einer Zeile |

**DIE NUMMER LÄUFT VON DER JÜNGSTEN AN, und das ist keine Geschmacksfrage:**
*damit liest sich „mindestens 3 behalten" unmittelbar an der Liste ab — was
fällt, steht ab Nummer 4.* **Liefe sie andersherum, stünde das Gefährliche
oben und die Mindestzahl wäre von der Liste her nicht mehr nachvollziehbar.**
*Der Rückbau 568 dreht sie um, und die Oberflächengruppe wird rot.*

**KEIN KNOPF IN EINER ZEILE, und das ist entschieden und nicht vergessen.**
*Eine einzelne Kopie per Klick zu löschen wäre die Löschroute mit Dateinamen,
und die schließt Stolperstein 300 aus.* **Die Liste ist eine Auskunft, kein
Bedienfeld.**

**KEIN DATEINAME IN DER ZEILE — und dabei geht nichts verloren.** *Der Name IST
die Zeitmarke (`kriterion-<Datum>-<Uhrzeit>.sqlite`), und die Zeile nennt Datum
und Uhrzeit.* **Die Identifizierung bleibt damit vollständig**, und die Zeile
wird von 44 auf 28 Zeichen kürzer. *Der Auftrag zu 0.20.0 verlangte „namentlich"
— diese Runde ersetzt den Namen durch die Angabe, aus der er besteht. Das gehört
als Abweichung benannt, nicht stillschweigend getan.*

### Der Deckel liegt bei fünf Zeilen und nicht bei zehn

**Die übrigen Listen im Systembereich decken bei zehn Zeilen** (`.manage-list`,
seit 0.17.3). **Diese hier bekommt ihre eigene Regel — `#auf-liste` — und den
Grund dazu:** sie steht **mitten** in ihrer Karte, und unter ihr stehen die
Summenzeile, der Löschknopf und, wenn welche daliegen, die Kopien mit dem alten
Schlüssel samt eigenem Knopf. *Bei zehn Zeilen schöbe ein Ordner mit vierzig
Kopien beides aus dem Blick.*

> **DIESELBE AUSNAHME UND DIESELBE BEGRÜNDUNG WIE BEI `#ex-teil-liste`** — die
> Teileliste des Exports steht ebenfalls mitten in ihrer Karte. *Der Weg über
> die **Nummer** und nicht über `:has()`: welche Zeilen eine Liste trägt, weiß
> das Stilblatt nicht, und ein Wähler, auf den erst seit ein paar Jahren
> Verlass ist, hat diese Installation schon einmal Leerraum gekostet
> (Stolperstein 256).*

**13.98rem SIND FÜNF ZEILEN:** eine `.mrow` misst mit Innenabstand und dem
Abstand zur nächsten **41,92 Pixel**, die Wurzelschrift steht auf 15 —
5 × 41,92 / 15 = 13,973. **In `rem` und nicht in Pixeln**, weil die Oberfläche
ihre Schrift von 80 bis 120 Prozent stellt.

---

## 2. Der Text — was gefallen ist, und was geblieben

**Der Kopftext trägt jetzt zwei Tatsachen und sonst nichts:** *dass es weg ist,
und was überhaupt in Frage kommt.*

> **Entfernt alte Sicherungen am Sicherungsort — unwiderruflich. Gelöscht wird
> nur, was dem Namensschema der Installation entspricht.**

| Gefallen ist | Warum |
|---|---|
| *„Jede Kopie ist so groß wie die ganze Datenbank."* | Eine Begründung dafür, dass es die Karte gibt. Wer sie öffnet, hat sich schon entschieden |
| *„ohne Shell auf dem Wirt"* | Sagt etwas über die Vorgängerversion, nicht über den Knopf |
| *„eine fremde Datei im Ordner bleibt liegen"* | **Steckt in der Zeile darüber:** wenn nur das Namensschema gelöscht wird, bleibt alles andere liegen. *Aus dem Betrieb: „fremde Dateien müssen nicht gesagt werden, wenn man sagt, dass nur Dateien mit dem vom System vorgegebenen Namen entsprechen"* |
| *„Er steht auf aus, und das ist Absicht: eine gelöschte Sicherung holt nichts zurück."* | **Dass es Absicht ist, interessiert niemanden** — es muss nur zu verstehen sein, was der Haken tut. Geblieben ist: *„Ohne Häkchen nur auf Knopfdruck."* |
| *„Aufgeräumt wird nur im Anschluss an eine Sicherung, die gelungen ist — schlägt sie fehl, bleibt jede Kopie liegen."* | Eine Zusage über einen Fall, den der Betreiber nicht herstellt. **Sie gilt unverändert und steht im Projektstand und am Quelltext** — am Bildschirm nicht |
| *„Zwei Bedingungen, und beide müssen zutreffen … Die Zahl ist der Boden, das Alter die Schere."* | Der Satz erklärte die Regel ein zweites Mal. **Die beiden Felder erklären sich jetzt selbst**, und das Altersfeld nennt die **lebende** Mindestzahl |
| *„Vorgabe 3"* / *„Vorgabe 30"* | **Die Vorgabe steht im Feld.** Sie ein zweites Mal zu nennen sagt nichts dazu |

**Und die Beschriftungen sagen, was das Feld tut:**

| vorher | jetzt |
|---|---|
| „Immer behalten" · *„Die jüngsten Kopien fasst die Regel nie an — der Boden. 1 bis 20, Vorgabe 3."* | **„Mindestens behalten"** · *„So viele Sicherungen bleiben immer liegen. 1 bis 20."* |
| „Erst löschen ab" · *„So alt muss eine Kopie mindestens sein — die Schere, in Tagen. 7 bis 365, Vorgabe 30."* | **„Löschen ab Alter (Tage)"** · *„Erst danach darf eine Sicherung gelöscht werden — und nur, wenn mehr als 3 liegen. 7 bis 365."* |

> **DIE „3" IM ZWEITEN SATZ IST LEBENDIG** — sie kommt aus dem Feld darüber und
> nicht aus dem Text. *Damit sagt das Altersfeld die zweite Bedingung, ohne sie
> zu erklären: wer die Mindestzahl auf 5 stellt, liest dort „wenn mehr als 5
> liegen".*

**DIE VERNEINUNGEN SIND GEPRÜFT UND NICHT NUR DIE ZUSAGEN.** *Eine Karte, die
den kurzen UND den langen Satz trägt, ist nicht kürzer geworden.* **Der
Prüfstand hält deshalb fest, dass „das ist Absicht", „holt nichts zurück",
„fremde Datei", „Vorgabe", „Boden" und „Schere" am Bildschirm nicht mehr
auftauchen** (Stolperstein 156: zwei Zeilen sagen zusammen, was eine allein
nicht sagen kann).

---

## 3. „Boden" und „Schere" — wo sie bleiben und wo nicht

**Sie sind Bilder DIESES PROJEKTS und kein Bildschirmtext.** *Aus dem Betrieb:
„das spricht man hier nicht."*

**Sie bleiben** im Projektstand (Abschnitt 5.3), in **Stolperstein 299** und in
den Kommentaren an `regelTreffer()` — *dort tragen sie die Begründung, warum
die Regel zwei Bedingungen hat, und die ist der Kern der Runde 0.20.0.*

**Sie gehen** von der Karte, aus den Feldbeschriftungen und aus der README.
*Dieselbe Trennlinie wie in Abschnitt 5.6: **eine Oberfläche sagt, WAS IST —
nicht, warum es so gebaut wurde.*** Und dieselbe wie beim Sprachwächter, nur
andersherum: der zielt auf übersetzte Lehnwörter im Quelltext, hier geht es um
eigene Bilder im Bildschirmtext.

---

## 4. Die Karte „Sicherung" — nur noch die letzte Sicherung

**Die Zeile *„Dateien am Ort"* ist heraus.** Sie nannte die Zahl der Kopien und,
nach einem Schlüsselwechsel, wie viele davon mit dem alten Schlüssel liegen.

> **DAMIT FÄLLT EINE ZUSAGE DES AUFTRAGS ZU 0.20.0, und sie fällt mit Grund.**
> Dort stand: *„Sie sagt weiterhin, wie viele Dateien am Ort liegen — diese
> Zeile ist die Brücke zwischen beiden Karten und steht schon da."* **Die
> Brücke ist überflüssig geworden:** die Nachbarkarte trägt jetzt die
> vollständige Liste, und dieselbe Auskunft an zwei Stellen ist eine zu viel
> (Stolperstein 47). *Aus dem Betrieb: „im Fenster ‚Sicherungen' nur Info über
> die letzte Sicherung."*

**DER KASTEN ZUM SCHLÜSSELWECHSEL BLEIBT.** *Er ist keine Auflistung, sondern
die Warnung, dass ein alter Schlüssel noch gebraucht wird* — und in seiner
schärfsten Lage (*„Keine dieser Kopien passt zum heutigen Schlüssel"*) sagt er
etwas über die **jüngste** Kopie. **Ihn zu streichen hieße, eine Warnung aus
0.8.91 wegzunehmen, um Text zu sparen.**

**Und die Prüfung darauf wird UMGEDREHT statt gelöscht** (Stolperstein 74): sie
hieß *„Die Zeile ‚Dateien am Ort' nennt die alten eigens"* und heißt jetzt
*„Die Zeile ‚Dateien am Ort' steht nicht mehr in dieser Karte"*.

---

## 5. Was der Prüfstand dazu sagt

**Vorher 5374, nachher 5391 — 17 neue, keine weggefallen.**

| Gruppe | vorher | nachher | Wofür |
|---|---|---|---|
| **Die Karte „Alte Sicherungen" in der Oberfläche** | 20 | **37** | Die Liste: alle Sicherungen, die Zahl in der Überschrift, **die Nummern von der jüngsten an**, Datum/Alter/Größe je Zeile, **kein Dateiname**, **kein Knopf in einer Zeile**, die Marken an den richtigen Zeilen, **keine Zeile mit beiden Marken**, der Deckel als Regel im Stilblatt samt Rechnung — dazu die kurzen Texte **und die sechs Verneinungen** |
| **Die Sicherung in der Oberfläche** | 52 | **52** | eine **umgedrehte** Zusage statt einer gelöschten |
| **zusammen** | **5374** | **5391** | **+17** |

> **DER DECKEL WIRD AN DER REGEL IM STILBLATT GEPRÜFT UND NICHT AN EINER
> GERECHNETEN HÖHE.** *jsdom rechnet kein Layout — eine Prüfung auf
> `offsetHeight` wäre hier immer null und damit trivial wahr.* **Geprüft wird
> deshalb, dass die Liste die Nummer `auf-liste` trägt, dass die Regel im
> Stilblatt steht — und dass die Rechnung dahinter dort aufgeschrieben ist.**
> *Die dritte Zeile ist die, die den Wert vor dem nächsten Umbau schützt.*

### Der Gegenprobenlauf

GEGENPROBENTABELLE_0_20_1

---

## 6. Was offen geblieben ist

**Unverändert das aus 0.20.0:**

- **Angefangene Kopien (`*.wird`)** bleiben liegen.
- **Eine einzelne Kopie per Klick löschen** — bewusst nicht gebaut, und diese
  Runde bestätigt es: die Liste ist ausdrücklich **nur zum Ansehen**.
- **Punkt 9 des Sammelblatts** — Sicherungen gepackt ablegen. *In der
  gewünschten Form gemessen und nicht empfohlen: eine mit SQLCipher
  verschlüsselte Datei lässt sich nicht packen (100,0 % gegen 0,1 % bei
  gleichem Inhalt unverschlüsselt).* **Sein Teil (c) — „die Liste umziehen und
  je Kopie Datum und Größe nennen" — ist mit dieser Runde gebaut.**

**Und neu offen:**

- **DER FELDBELEG ZU 0.20.0 IST NICHT VOLLSTÄNDIG GEFAHREN.** *Der Fingerprint
  ist bestätigt, und die Karte ist gesehen — aber die beiden Handgriffe, auf
  die es am meisten ankommt, fehlen:* **eine eigene Datei in den
  Sicherungsordner legen, den Knopf drücken und nachsehen, dass sie liegen
  bleibt** — und die **Zeile im Sicherheitsprotokoll**, eine je entfernter
  Kopie, ohne Dateinamen. *Der Prüfstand belegt beides an einem echten Ordner;
  der Beleg vom Wirt fehlt.*

---

FINGERPRINTZEILE_0_20_1
