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

**Vorher 5374, nachher 5403 — 29 neue, keine weggefallen.**

| Gruppe | vorher | nachher | Wofür |
|---|---|---|---|
| **Die Karte „Alte Sicherungen" in der Oberfläche** | 34 | **51** | Die Liste: alle Sicherungen, die Zahl in der Überschrift, **die Nummern von der jüngsten an**, Datum/Alter/Größe je Zeile, **kein Dateiname**, **kein Knopf in einer Zeile**, die Marken an den richtigen Zeilen, **keine Zeile mit beiden Marken**, der Deckel als Regel im Stilblatt samt Rechnung — dazu die kurzen Texte **und die sechs Verneinungen** |
| **Alte Sicherungen aufräumen: der echte Ordner** | 56 | **65** | **das Feld `dateien` der echten Antwort** — neun Zusagen, nachgerüstet nach dem stummen Rückbau 568 (Abschnitt 5a) |
| **Die Sicherung in der Oberfläche** | 52 | **52** | eine **umgedrehte** Zusage statt einer gelöschten |
| **Die Gegenproben greifen** | 17 | **20** | **ein abgerissener Lauf muss sagen, warum** — nachträglich, aus der eigenen Arbeit dieser Runde (Abschnitt 5b) |
| **zusammen** | **5374** | **5403** | **+29** |

> **DER DECKEL WIRD AN DER REGEL IM STILBLATT GEPRÜFT UND NICHT AN EINER
> GERECHNETEN HÖHE.** *jsdom rechnet kein Layout — eine Prüfung auf
> `offsetHeight` wäre hier immer null und damit trivial wahr.* **Geprüft wird
> deshalb, dass die Liste die Nummer `auf-liste` trägt, dass die Regel im
> Stilblatt steht — und dass die Rechnung dahinter dort aufgeschrieben ist.**
> *Die dritte Zeile ist die, die den Wert vor dem nächsten Umbau schützt.*

---

## 5a. Der stumme Rückbau 568 — und was er gefunden hat

**Rückbau 568 dreht die Nummerierung in `server.js` um:** aus `nr: i + 1`
(jüngste ist 1) wird `nr: dateien.length - i` (älteste ist 1). **Und keine
einzige Prüfung wurde rot.**

> **EINE GEGENPROBE, DIE KEINE PRÜFUNG ROT MACHT, SAGT NICHT „DER CODE IST
> RICHTIG", SONDERN „HIER PRÜFT NIEMAND."**

**Der Grund ist Stolperstein 102 in Reinform.** Die Oberflächengruppe prüft die
Nummern — *„Die Nummern laufen von der jüngsten zur ältesten"* — aber sie
prüft sie **am Mock**, und der rechnet `nr` selbst. **Die echte Antwort des
Servers sah niemand an.** *Das Feld `dateien` war damit vollständig ungeprüft:
sieben Angaben je Eintrag, und keine einzige Zusage darauf.*

**Neun Zusagen sind nachgerüstet, an der ECHTEN Antwort** (Gruppe „Alte
Sicherungen aufräumen: der echte Ordner", 56 → 65):

1. Die Antwort trägt die **vollständige** Liste — sieben Einträge bei sieben
   Kopien im Ordner.
2. Die **Nummern laufen von 1 bis 7**.
3. **Nummer 1 ist die jüngste** *(sie ist 0 Tage alt, die letzte 200)*.
4. Die **Reihenfolge** ist wirklich nach Alter geordnet und nicht zufällig.
5. **Je Eintrag** Datum, Alter und Größe, jedes in seiner Form.
6. Die Marke **`faellt`** steht an genau den Kopien, die die **Trefferliste**
   daneben nennt. *Zwei Felder über dieselbe Frage dürfen sich nicht
   widersprechen (Stolperstein 47).*
7. **Ohne Schlüsselwechsel** trägt keine die Marke `veraltet`.
8. **Der Dateiname steht in der Antwort**, auch wenn die Karte ihn nicht zeigt
   — *er ist die einzige Angabe, an der sich ein Eintrag über zwei Abrufe
   hinweg wiedererkennen lässt.*
9. **Nichts Fremdes** steht in der Liste — `notizen.txt`,
   `kriterion-alt.sqlite.bak`, das Unterverzeichnis und der Symlink nicht.

**Danach wird 568 namentlich rot**, an Zusage 2. *Nachgefahren und belegt —
wenn auch erst im zweiten Anlauf: der erste riss ab, und das ist Abschnitt 5b.*

> **DAS IST DER ZWEITE FUND DIESER RUNDENFOLGE, DEN DIE GEGENPROBE GEMACHT HAT
> UND NICHT DER PRÜFSTAND** — der erste war 561 in 0.20.0, der den Lauf abriss.
> *Beide Male hat der Prüfstand grün gemeldet, und beide Male war das falsch.
> Genau dafür gibt es die Gegenprobe.*

---

## 5b. Der abgerissene Lauf — und was er über das Werkzeug gesagt hat

**Rückbau 568 wurde nach dem Nachrüsten der neun Zusagen ein zweites Mal
gefahren, allein. Er wurde namentlich rot — und der Lauf riss nach 79 Sekunden
ab.** *Der Bericht dazu, vollständig:*

```
**568 — Die Nummern laufen von der aeltesten zur juengsten** (server.js, Spur 0, 79s)
  LAUF ABGERISSEN: Rückgabewert 1
  ── Alte Sicherungen aufraeumen: der echte Ordner
     ✗ Die Nummern laufen von 1 bis 7
```

**„Rückgabewert 1" ist keine Auskunft.** *Ein abgerissener Lauf und ein stummer
Rückbau sehen in der Tabelle beinahe gleich aus, und die Tabelle unterscheidet
sie seit jeher — aber sie sagt beim Abriss nicht, WORAN er lag.*

### Was nachgestellt und was belegt ist

**Belegt: der Rückbau selbst reißt den Lauf nicht ab.** *Ein voller Lauf mit
angewandtem 568 in einer eigenen Kopie:* **5398 von 5400 bestanden** — genau
die beiden erwarteten roten Punkte (*„Die Nummern laufen von 1 bis 7"* und die
Selbstprobe „Jeder Suchtext kommt in seiner Datei genau einmal vor", die bei
**jedem** gefahrenen Rückbau rot wird). *Der Lauf blieb ganz.*

**Belegt: die Unterschrift.** *Nachgestellt in einer eigenen kleinen Probe — ein
`listen()` auf eine belegte Nummer, ohne `on('error')`:* **Rückgabewert 1, die
bereits gedruckte Ausgabe steht, die Meldung liegt auf stderr, und die Zeile
„Prüflauf abgebrochen: …" fehlt.** *Genau das Bild, das der Treiber als
„Rückgabewert 1" gemeldet hat.*

**Wahrscheinlich, aber NICHT belegt: eine Portkollision am SMTP-Empfänger.**
*Er ist der einzige Horchposten im Prozess selbst — `pruefung.js` hat genau ein
`.listen(` —, seine Nummern werden **gezählt statt gewürfelt**, und ein
Empfänger horcht vom Öffnen bis zum Ende des Laufs.* **Zwei Läufe auf derselben
Maschine mit demselben `PORT_VERSATZ` nehmen sich also zwangsläufig dieselben
Nummern**, sobald beide so weit sind — und ein `listen()` ohne `on('error')`
ist genau der zweite Weg von oben. **Gemessen am vollen Lauf: der erste
Empfänger geht nach 82 Sekunden auf — der Abriss kam nach 79.** *Zu eben dieser
Zeit lief auf derselben Maschine ein zweiter voller Lauf: die Nachmessung der
Gruppenzahlen zu 0.20.0.*

**Was fehlt, um daraus einen Befund zu machen:** *ob jener zweite Lauf einen
Versatz trug.* **Seine Ausgabe druckt die Nummern nicht, und die Kopie ist
weg** — deshalb steht hier „wahrscheinlich" und nicht „war es".

> **DIESE ZAHL STAND ZWISCHENDURCH FALSCH IM ENTWURF.** *Der erste Versuch, sie
> zu messen, las die Ausgabe durch eine Röhre — und Node schiebt seine Ausgabe
> dorthin gebündelt, sodass alle Gruppen denselben Zeitpunkt trugen: 330
> Sekunden, und die Kollision wäre damit ausgeschlossen gewesen.* **Gemessen
> ist sie jetzt an der Datei, in die der Lauf schreibt** — 82 Sekunden. *Eine
> Messung, die den Gegenstand verändert, ist keine (Stolperstein 137).*

> **DARAUS FOLGT EINE BETRIEBSREGEL, ganz gleich ob es diesmal so war: zwei
> Prüfläufe zugleich auf derselben Maschine brauchen verschiedene
> `PORT_VERSATZ`.** *Der Gegenprobentreiber hält sich von selbst daran — jede
> Nebenspur bekommt ihren eigenen. Wer daneben von Hand einen zweiten Lauf
> startet, setzt ihn selbst.*

**NICHT ERMITTELT: die Ursache selbst.** *Und das ist der eigentliche Befund
dieser Runde: die Ursache stand in der eingefangenen Ausgabe — der Treiber
fängt stdout **und** stderr ein —, er hat sie nicht gedruckt, und die Kopie ist
beim Aufräumen weg. Sie ist nicht mehr feststellbar.*

> **EIN ABBRUCH, DESSEN GRUND EINGEFANGEN UND DANN NICHT GEDRUCKT WIRD, IST
> SCHLIMMER ALS EINER OHNE GRUND** (Stolperstein 301). *Er sieht aus wie ein
> Befund und ist eine Sackgasse.*

### Was daraufhin gebaut ist

**`leseLauf()` hebt die letzten zwanzig nichtleeren Zeilen auf, und der Bericht
druckt sie unter die Abrisszeile.** *Zwei Wege enden ohne Schlussblock, und nur
einer schreibt eine Zeile, die der Leser kennt:* der äußere Fang schreibt
*„Prüflauf abgebrochen: …"*; **ein unbehandeltes Ereignis außerhalb der
abgewarteten Kette schreibt davon nichts** — Node legt Meldung und Aufrufweg
auf stderr und geht mit 1. *Für diesen zweiten Weg sind die letzten Zeilen die
einzige Auskunft.*

**Drei Zusagen dazu** in der Gruppe „Die Gegenproben greifen" (17 → 20), **an
gestellten Ausgaben in Millisekunden statt in Minuten** — dieselbe Bauform wie
bei den drei Zusagen über „stumm" daneben. **Die dritte misst an der ECHTEN
Ausgabe der echten Berichtsfunktion und nicht am Quelltext:** *ein Suchmuster
über den Quelltext bliebe grün, wenn die Schleife zwar dasteht, aber über die
falsche Liste läuft.*

**Zwei Rückbauten darüber, und beide gehören zusammen:** **W15** nimmt das
**Drucken** weg, **W16** das **Aufheben**. *Fiele nur das Drucken weg, stünde
der Grund im Ergebnis und niemand sähe ihn — genau die Lage, in der 568 seinen
Abriss unerklärt ließ.*

**Was der Bericht jetzt an derselben Stelle sagt** — *an einer GESTELLTEN
Ausgabe, denn die echte von damals ist weg; die Fehlermeldung darin ist ein
Beispiel und nicht der ermittelte Grund:*

```
**568 — Ein Rueckbau** (server.js, Spur 0, 79s)
  LAUF ABGERISSEN: Rückgabewert 1
     │ ── Alte Sicherungen aufraeumen: der echte Ordner
     │   ✓ Sieben Kopien liegen im Ordner
     │   ✗ Die Nummern laufen von 1 bis 7
     │ node:events:497
     │       throw er;
     │ Error: listen EADDRINUSE: address already in use 127.0.0.1:6110
```

> **DAS IST EINE WERKZEUGRUNDE UND KEINE VERSIONSRUNDE.** *`gegenprobe.js` und
> `pruefung.js` werden nicht ausgeliefert und gehen in keinen Fingerprint ein —
> `c67a13f9` steht unverändert.* **Nur das Werkzeug lernt dazu.**

---

### Der Gegenprobenlauf

**Acht Rückbauten gefahren, in drei Läufen — und der eine, der beim ersten Mal
STUMM war, ist der Fund dieser Runde (Abschnitt 5a).** *Jeder gefahrene
Rückbau macht zusätzlich die Selbstprobe „Jeder Suchtext kommt in seiner Datei
genau einmal vor" rot — die Kopie trägt ja den ersetzten Text; sie ist in der
Spalte „rot" nicht mitgezählt.*

**Lauf 1 — die sechs an der Karte**, vier Nebenspuren, am Stand **5391**
*(vor dem Nachrüsten der neun Zusagen aus Abschnitt 5a)*:

| Nr | Was zurückgebaut wird | rot | Die Zeile, auf die es ankommt |
|---|---|---|---|
| **563** | Eine Änderung am Feld rechnet die Vorschau **nicht** neu | **2** | *„Eine Änderung am Feld fragt den Stand neu am Server"* — **nachgezogen**, weil die Karte seit dieser Runde die ganze Liste neu zeichnet und nicht nur die Trefferzahl |
| **565** | Der Knopf ist auch **ohne Treffer** bedienbar | **1** | *„Und der Knopf ist dann nicht bedienbar"* — **nachgezogen** auf den neuen Knopftext |
| **566** | Die Sicherungsliste bekommt **keinen Deckel** | **1** | *„Die Liste trägt ihren eigenen Deckel von fünf Zeilen"* — **in eine andere Datei nachgezogen**: der Deckel ist seit dieser Runde eine Regel in `public/style.css` und keine Klasse im Markup |
| **567** | Die Karte **listet die Sicherungen nicht mehr** | **7** | *„Die Karte listet ALLE Sicherungen"* und die ganze Liste dahinter — **der Rückbau auf den eigentlichen Befund dieser Runde** |
| **568** | Die Nummern laufen **von der ältesten zur jüngsten** | **STUMM** | **DAS IST DER FUND** — siehe Abschnitt 5a. *Die Nummern wurden am Mock geprüft, und der rechnet sie selbst; die echte Antwort sah niemand an* |
| **569** | Die Zeilen sagen nicht mehr, **welche gelöscht wird** | **2** | *„Die Zeilen, die die Regel trifft, sind markiert"* — die Marke `löschen` ist die einzige Stelle, an der die Liste die Regel zeigt |

**Lauf 2 — 568 allein**, nach dem Nachrüsten der neun Zusagen, am Stand
**5400**: **namentlich rot an „Die Nummern laufen von 1 bis 7" — und der Lauf
riss nach 79 Sekunden ab.** *Das ist Abschnitt 5b.*

**Lauf 3 — 568 noch einmal und die beiden neuen**, drei Nebenspuren, am Stand
**5403** *(nach dem Bau aus Abschnitt 5b)*:

| Nr | Was zurückgebaut wird | rot | Die Zeile, auf die es ankommt |
|---|---|---|---|
| **568** | Die Nummern laufen **von der ältesten zur jüngsten** | **1** | *„Die Nummern laufen von 1 bis 7"* — **5401 von 5403, 452 Sekunden, der Lauf blieb ganz.** *Damit ist der Fund aus Lauf 1 geschlossen und der Abriss aus Lauf 2 nicht wiederaufgetreten* |
| **W15** | Der Bericht **druckt** die letzten Zeilen eines Abrisses nicht mehr | **1** | *„Und der Bericht druckt sie unter den Abriss"* |
| **W16** | Der Leser **hebt** die letzten Zeilen gar nicht erst auf | **2** | *„Und er hebt die letzten Zeilen auf, damit der Grund lesbar bleibt"* **und** *„Und der Bericht druckt sie unter den Abriss"* — beide, denn ohne Aufheben ist auch nichts zu drucken |

**Keiner der acht war beim letzten Anlauf stumm.**

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

- **DIE URSACHE DES ABRISSES VON 79 SEKUNDEN IST NICHT ERMITTELT** und wird es
  auch nicht mehr: sie stand in der eingefangenen Ausgabe, der Treiber hat sie
  nicht gedruckt, und die Kopie ist weg (Abschnitt 5b). *Der Verdacht steht dort
  und ist begründet — eine Portkollision am SMTP-Empfänger, dessen Nummern
  gezählt statt gewürfelt werden —, aber er ist nicht belegt.* **Was gebaut ist,
  ist nicht die Erklärung, sondern die Vorkehrung: der nächste Abriss erklärt
  sich selbst.** *Tritt er wieder auf, steht der Grund in der Tabelle, und dann
  gehört er hierher zurück.*
- **DER FELDBELEG ZU 0.20.0 IST NICHT VOLLSTÄNDIG GEFAHREN.** *Der Fingerprint
  ist bestätigt, und die Karte ist gesehen — aber die beiden Handgriffe, auf
  die es am meisten ankommt, fehlen:* **eine eigene Datei in den
  Sicherungsordner legen, den Knopf drücken und nachsehen, dass sie liegen
  bleibt** — und die **Zeile im Sicherheitsprotokoll**, eine je entfernter
  Kopie, ohne Dateinamen. *Der Prüfstand belegt beides an einem echten Ordner;
  der Beleg vom Wirt fehlt.*

---

## 0.20.1 — Fingerprint `c67a13f9`

**ZULETZT GEBILDET**, nach der letzten Änderung an einer ausgelieferten Datei —
die Versionsnummer in `package.json` eingeschlossen, und `package-lock.json`
trägt sie ein zweites Mal. **`public/` gehört dazu** (Stolperstein 158).

**Nachgerechnet über denselben Weg, den `GET /api/stats` geht** — die Dateien
aus `require.cache`, `bestandslauf.js` und alles unter `public/`, SHA-256, die
ersten acht Stellen: `c67a13f9` bei Version `0.20.1`.

> **DIE WERKZEUGRUNDE DANACH HAT IHN NICHT BEWEGT.** *Der Bericht über einen
> abgerissenen Lauf (Abschnitt 5b) fasst `gegenprobe.js` und `pruefung.js` an;
> beide werden nicht ausgeliefert, stehen per `.dockerignore` außerhalb des
> Images und gehen in keinen Fingerprint ein.* **Nachgerechnet und unverändert.**

> **IM FELD NOCH NICHT BESTÄTIGT.** *Der Sollwert steht hier; die Meldung von
> der laufenden Installation über `GET /api/stats` steht aus.* **Zusammen mit
> ihr gehören die beiden Handgriffe nachgeholt, die schon zu 0.20.0 offen
> geblieben sind** (Abschnitt 6): eine eigene Datei in den Sicherungsordner
> legen und nachsehen, dass sie liegen bleibt — und die Zeilen im
> Sicherheitsprotokoll, eine je entfernter Kopie.
