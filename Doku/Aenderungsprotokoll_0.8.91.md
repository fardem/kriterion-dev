# Änderungsprotokoll 0.8.91 — „Der Schlüssel lässt sich wechseln"

**Version 0.8.91 · gebaut am 25. August 2026 · keine Stufe des
Mehrbenutzerbetriebs · keine Datenbankstufe**

Diese Runde holt nach, was aus 0.8.90 herausgefallen ist: **Punkt 3, der
Schlüsselwechsel.** Davor stand ein Werkzeugpunkt, der keine ausgelieferte
Datei anfasst — ein Gegenprobentreiber, ein Portversatz und zwei Wächter über
den Prüfstand selbst.

**Die Runde ist in einer anderen Form gebaut worden, als der Auftrag sie
vorsah.** Das ist die wichtigste Zeile dieses Papiers, und sie steht deshalb
oben. Abschnitt 2 begründet sie.

---

## Inhalt

1. [Was gebaut wurde, je Datei](#1-was-gebaut-wurde-je-datei)
2. [Die Abweichung vom Auftrag — der Wechsel gehört auf den Wirt](#2-die-abweichung-vom-auftrag--der-wechsel-gehört-auf-den-wirt)
3. [Die Fragen aus dem Auftrag, beantwortet](#3-die-fragen-aus-dem-auftrag-beantwortet)
4. [Befunde beim Bauen](#4-befunde-beim-bauen)
5. [Der Prüfstand](#5-der-prüfstand)
6. [Gegenprobentabelle](#6-gegenprobentabelle)
7. [Prüfungszahlen](#7-prüfungszahlen)
8. [Was ausdrücklich nicht passiert ist](#8-was-ausdrücklich-nicht-passiert-ist)
9. [Offen geblieben](#9-offen-geblieben)

---

## 1. Was gebaut wurde, je Datei

### `gegenprobe.js` (neu, 387 Zeilen) — W1

Der Gegenprobentreiber. **Die Rückbauten stehen als Liste ganz oben in der
Datei** — dieselbe Bauform wie `F_ROUTEN` im Prüfstand: die Liste **ist** die
Entscheidung, und sie steht dort, wo man sie sucht. Ein Eintrag trägt Nummer,
Name, Datei, gesuchten Text, Ersatz und die erwartete Prüfgruppe.

* **Die Kopie entsteht über `git archive HEAD`**, nicht über `cp`: sie ist
  damit atomar gegen den Arbeitsbaum (Stolperstein 100). `node_modules` wird
  verknüpft statt kopiert — es trägt übersetzte native Anteile und wird von
  keinem Rückbau angefasst.
* **Aufgeräumt wird über `/proc/<pid>/cwd`** und nicht über die Befehlszeile
  (Stolperstein 133). Nach dem Aufräumen wird **nachgesehen**, ob wirklich
  keiner überlebt hat; überlebt einer, steht das in der Tabelle.
* **Ein Rückbau, dessen gesuchter Text nicht GENAU EINMAL vorkommt, bricht ab
  und wird gemeldet.** Keinmal heißt: er griffe ins Leere, und der Lauf bliebe
  grün, ohne dass etwas zurückgebaut worden wäre. Mehrfach heißt: es ist nicht
  entschieden, welche Stelle gemeint ist.
* **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND**, und die Tabelle
  schreibt das so hin: *„STUMM — das ist ein FUND"*.
* **Ein abgerissener Lauf ist etwas anderes als ein stummer.** Der Treiber
  liest die Schlusszeile des Prüflaufs mit; fehlt sie, steht
  *„LAUF ABGERISSEN"* in der Tabelle und nicht „stumm".
* Bis zu **vier Nebenspuren**, die Zahl als Argument; der Versatz je Spur wird
  aus `pruefung.js` gelesen und steht nicht doppelt.
* **Er läuft nicht in `npm test` mit.** Er fährt den vollen Prüflauf je
  Rückbau und gehört an das Ende einer Runde.

### `pruefung.js` (+797/−14 Zeilen) — W2, W3 und die neuen Gruppen

**`PORT_VERSATZ`** wird auf jede Portbasis addiert, auch auf die des
Hauptservers. Ohne die Variable bleibt alles, wie es war.

**Die Zahl ist ausgerechnet, nicht geschätzt** (Stolpersteine 64 und 127):

| | |
|---|---|
| Basen im Lauf | **34** (der Auftrag sagte 29 — nachgezählt sind es 34) |
| Spanne samt Breite | 3900–5959, also **2060** Nummern |
| Kleinster brauchbarer Versatz | **2941** — alles darunter trifft 6000 bzw. 6566/6665–6669/6679/6697 |
| Gewählt | **3000**, vier Spuren, höchste Nummer **14959** |
| Höchste Nummer unter dem flüchtigen Bereich | ja (ab 32768 vergibt der Kern selbst) |

**`PRUEFLAGEN`** vermerkt jede Lage mit eigenem Server: Portbasis, gewählte
Nummer und das Kind. Daran hängen beide Wächter — *es ist eine Liste und kein
Zähler: der Wächter soll sagen, WELCHE Lage liegengeblieben ist.*

Dazu **acht neue Prüfgruppen** und die Erweiterung von „Die Sicherung in der
Oberfläche"; Einzelheiten in Abschnitt 5.

### `schluessel.js` (neu, 311 Zeilen) — der Vorgang

Zwei Befehle, `zeigen` und `wechseln`. Er läuft **im Container**, weil
`PRAGMA rekey` SQLCipher braucht und die Bibliothek dort liegt.

**Erst alle Absagen, bevor irgendetwas geschieht** — eine Absage nach dem
halben Vorgang wäre schlimmer als gar keine Prüfung:

| Lage | Antwort |
|---|---|
| Schlüssel aus der Umgebung, keine `.env` mitgegeben | Absage. *Die Datenbank trüge den neuen Schlüssel, die `.env` den alten, und der nächste Start öffnete nichts mehr.* |
| `--env` im Dateifall | Absage. Eine `.env` hat damit nichts zu tun |
| `.env` ohne aktive Schlüsselzeile, oder mit zwei | Absage. *Welche gemeint ist, entscheidet dieser Befehl nicht* |
| `.env` mit einem **fremden** Wert | Absage. *Das ist nicht die `.env` dieser Anlage — sie zu überschreiben nähme jemandem einen Schlüssel weg* |
| Zu wenig Platz | Absage mit Zahlen. Das Journal wächst auf die Größe der Datenbank |
| Neuer Wert = alter Wert | Absage |

Dann die **Ansage**, und sie nennt beim Namen, was danach anders ist: die alten
Sicherungen, der Verbleib des alten Werts, die rote Markierung in der Karte.
Ohne `--ja` folgt die Rückfrage in der Form von `zugang.js entfernen`.

**Die Ablage wird ERST NACH dem gelungenen Wechsel nachgezogen.** Vorher
geschrieben, stünde dort ein Schlüssel, der zu nichts passt, sobald der Wechsel
scheitert. Scheitert umgekehrt das Schreiben, steht der neue Wert **laut auf
dem Bildschirm** — das ist die eine Stelle, die zum Abschreiben da ist, und der
Merksatz zu Kontrollausgaben nimmt sie ausdrücklich aus.

**Am Ende die Spur:** die Marke `schluesselGewechseltAm` in `settings` und die
Protokollzeile — beides **nach** dem Vorgang, wie überall.

### `schluessel.sh` (neu, 144 Zeilen) — der Ablauf

`zeigen` und `wechseln` auf dem Wirt. Die Reihenfolge ist der ganze Punkt:

1. `.env` sichern — sie ist die kleinste Datei und die, ohne die nichts startet
2. den neuen Wert **hier** erzeugen (`openssl rand -hex 32`) und über die
   **Umgebung** übergeben; so geht er nie über eine Ausgabe
3. `docker compose stop`
4. `cp -a data ../kriterion-data-vor-schluesselwechsel-…`
5. der Wechsel im Wegwerf-Container (`docker compose run --rm --no-deps`),
   mit dem **Projektverzeichnis** als eigener Einhängung unter `/app/wirt`
6. `docker compose up -d`

Scheitert Schritt 5, **bleibt die Anlage angehalten**, und das Skript schreibt
den Rückweg hin. Der laufende Container bekommt die `.env` weiterhin nicht zu
sehen — nur der Wegwerf-Container, nur für die Dauer des Wechsels.

**Eingehängt wird das VERZEICHNIS und nicht die Datei**, und das ist kein
Geschmack: eine Datei-Einhängung hängt am Inode. `schluessel.js` schreibt die
neue `.env` daneben und benennt sie um (Stolperstein 8) — ein Umbenennen
tauscht den Verzeichniseintrag, und die Einhängung bliebe auf der alten Datei
stehen. Auf dem Wirt hätte sich dann **nichts** geändert, während die Datenbank
längst den neuen Schlüssel trüge. **Beim Durchsehen gefunden, nicht im
Betrieb** — Docker läuft in der Umgebung dieser Runde nicht.

### `keys.js` (+100/−2 Zeilen) — die Datei dieser Runde

`erzeugeSchluessel()`, `schreibeSchluesselDatei()`, `findeEnvZeile()` und
`schreibeEnvZeile()`. **Der Server ruft nichts davon** — er liest seinen
Schlüssel beim Start und danach nie wieder. Es steht trotzdem hier: *„woher der
Schlüssel kommt" und „wohin der neue geschrieben wird" sind dieselbe Frage*,
und hier ist es ohne Datenbank prüfbar.

**Nur eine AKTIVE Zeile wird gesucht** (`/^\s*ENCRYPTION_KEY\s*=/`). Eine
auskommentierte ist keine Einstellung, sondern ein Hinweis — in der
`.env.example` stehen **sechs** davon. Geschrieben wird daneben und dann
umbenannt (Stolperstein 8).

**Der alte Wert bleibt auskommentiert stehen**, mit Datum, dem Namen dessen,
der gewechselt hat, und dem Satz, wofür er noch gut ist. *Er ist kein Abfall —
er öffnet jede Sicherung, die vor dem Wechsel entstanden ist.*

### `db.js` (+35/−0 Zeilen)

`wechsleSchluessel(neuHex)`: `journal_mode = DELETE`, `PRAGMA rekey`, zurück
auf `WAL`. **Die Rückschaltung steht im `finally`** — scheitert der Wechsel,
bliebe die Anlage sonst im DELETE-Modus zurück, liefe damit, und niemand sähe
es.

### `auth.js` (+12/−3 Zeilen)

`'schluessel'` als **fünfzehnter** Vorgang. Ohne Merkmal, ohne Ziel, mit
leerem `wer` — gewechselt wird auf dem Wirt. *Ein Handelnder stünde hier nur
als Behauptung, denn wer den Befehl ausführen kann, könnte sie setzen.*

### `server.js` (+48/−6 Zeilen)

`wechselMarke()` liest `schluesselGewechseltAm` und wandelt sie in einen
Zeitpunkt; `letzteSicherung()` hält sie gegen die Änderungszeiten der Dateien
und liefert `gewechseltAm`, `veraltet` und `letzte.veraltet`.

**Verglichen wird in UTC.** Die Marke trägt die Schreibweise der Anlage
(`2026-08-23 19:56:01`), und das angehängte `Z` macht daraus einen eindeutigen
Zeitpunkt — ohne es läse der Rechner sie als Ortszeit, und die Grenze
verschöbe sich um den Zeitzonenabstand.

**Ohne Wechsel ist KEINE Kopie veraltet — und nicht etwa jede.** Ein unlesbarer
Wert gilt als keine Marke. Die Marke steht auch dann in der Antwort, wenn der
Zielort nicht erreichbar ist: *DASS gewechselt wurde, ist eine Aussage über die
Anlage und hängt nicht am Sicherungsort.*

### `public/app.js` (+42/−4 Zeilen)

Drei Lagen in der Karte „Sicherung", und der Kasten steht nur da, wenn er etwas
zu sagen hat:

| Lage | Was die Karte sagt |
|---|---|
| Nie gewechselt | **nichts** — eine Warnung, die immer dasteht, liest niemand mehr |
| Gewechselt, alle Kopien jünger | ein **grüner** Kasten mit dem Datum und dem Grund |
| Gewechselt, einige älter | ein **roter** mit der Zahl und dem Verbleib des alten Werts |
| Gewechselt, auch die jüngste älter | ein **roter** mit dem schärferen Satz und dem nächsten Schritt |

Dazu die Zahl in der Zeile „Dateien am Ort" und `'schluessel'` in der
Vorgangsliste des Sicherheitsprotokolls.

### `public/style.css` (+5/−0 Zeilen)

Eine Regel, `.sich-alt`, die den vorhandenen Rotton nimmt. **Kein neues
Farbschema.**

### `.dockerignore`, `.env.example`, `package.json`

`gegenprobe.js` und `schluessel.sh` gehören nicht ins Image. Die `.env.example`
bekommt einen erklärenden Abschnitt zum Wechsel — **kein neuer Wert.** Version
auf `0.8.91`, `package-lock.json` nachgezogen.

---

## 2. Die Abweichung vom Auftrag — der Wechsel gehört auf den Wirt

**Der Auftrag sah einen Knopf im Systembereich vor**, hinter der zweiten
Bestätigung, mit einem Häkchen für den `.env`-Fall und einem roten Fenster, das
den neuen Wert bis zum nächsten Neustart zum Abschreiben hinlegt. Gebaut ist
`./schluessel.sh wechseln` auf dem Wirt.

**Die Abweichung ist VOR dem Bau angekündigt, begründet und bestätigt worden.**
Zwei Gründe:

**Erstens: der Anlass ist einmalig, nicht wiederkehrend.** Beim Nachsehen, woher
der Wunsch überhaupt kommt, stellte sich heraus: er steht an **genau einer**
Stelle im Repo — als Punkt 3 des Auftrags 0.8.90, und dort lief er in einer
Liste der Wege mit, „die die Anlage als Ganzes treffen". Das Ideenpapier kennt
ihn nicht, das Konzeptpapier nicht, der Changelog nicht, und es gibt keinen
Vorfall in irgendeinem Änderungsprotokoll. **Er ist als Vollständigkeitspunkt
entstanden.**

Der eine echte Anlass steht dagegen im Projektstand, Abschnitt 3: *„der Wert
steht seit dem 13. August in der `.env`, die Datei liegt nur noch als
`encryption.key.abgeloest` daneben."* **Der Wert ist umgezogen, nicht
gewechselt.** Jede Kopie von `data/` aus dieser Zeit öffnet die heutige Datei.
Das ist ein echter Grund — und ein **einmaliger**. SQLCipher-Schlüssel altern
nicht; es gibt keine Ablauffrist und keine Rotationsvorschrift.

*Ein dauerhafter Knopf für ein einmaliges Ereignis — und ausgerechnet der eine,
der bei falscher Handhabung alles verliert — ist ein schlechtes
Tauschgeschäft.*

**Zweitens: ein Knopf könnte die Sache gar nicht zu Ende bringen.** Kommt der
Schlüssel aus der `.env`, kennt die Anlage den neuen Wert, erreicht die Datei
aber nicht — sie ist per `.dockerignore` nicht einmal im Image. Was der Auftrag
dafür vorschlug (Häkchen, rotes Fenster, ein Wert, der bis zum Neustart
abrufbar bleibt), ist **Bauwerk um eine Lücke herum**, die auf dem Wirt gar
nicht existiert: dort liegt die `.env` neben der Datenbank, und beides wird in
einem Zug nachgezogen.

**Ein dritter Grund kam beim Bauen dazu und ist kein Argument, sondern eine
Bedingung:** ein laufender Server hält `katalog.sqlite` im WAL-Modus offen. Der
Wechsel muss auf `DELETE` umschalten — zwei Schreiber an dieser Stelle sind
genau der Zustand, den niemand will. Ein Knopf im laufenden Betrieb hätte auch
darum herumbauen müssen; auf dem Wirt steht die Anlage einfach still.

**Was damit aus dem Auftrag herausfällt:**

| | |
|---|---|
| Karte im Systembereich, Häkchen, rotes Fenster in `/api/stats` | **fällt weg** |
| Neue Route → **`F_ROUTEN` bleibt bei 57** (der Auftrag verlangte 58) | **fällt weg** |
| Zweite Bestätigung als weiterer Weg → `BESTAETIGUNG_ZWECKE` bleibt bei **sechs** | **fällt weg** |
| Ansage der Dauer in Sekunden am Bildschirm | **fällt weg** — die Anlage steht ohnehin |
| Platzprüfung vor dem Wechsel | **bleibt**, im Skript |
| `schluessel` als **fünfzehnter** Vorgang | **bleibt** |
| Marke `schluesselGewechseltAm` in `settings` | **bleibt** |
| Rote Markierung der alten Sicherungen | **bleibt** — der wertvollste Teil, und unabhängig davon, wer den Wechsel auslöst |

**Die Rechtefrage entfällt mit dem Knopf.** *Zugriff auf den Wirt ist die
Berechtigung* — dieselbe Linie wie bei `zugang.js`, und sie ist seit 0.8.90
eine benannte Eigenschaft der Anlage, keine Notlösung.

---

## 3. Die Fragen aus dem Auftrag, beantwortet

### A. Wo stehen die Rückbauten? **In `gegenprobe.js` selbst, als Liste ganz oben.**

Wie vorgeschlagen, und aus dem genannten Grund: dieselbe Bauform wie
`F_ROUTEN` — die Liste **ist** die Entscheidung.

### B. Wie viele Nebenspuren? **Höchstens vier, die Zahl als Argument.**

Wie vorgeschlagen. Vorgabe sind zwei. Gefahren wurde diese Runde mit vier auf
vier Kernen.

### C. Läuft `gegenprobe.js` in `npm test` mit? **Nein.**

Wie vorgeschlagen. Er fährt den vollen Prüflauf je Rückbau; der Prüfstand kennt
ihn nicht.

### D. Was tut die Anlage im `.env`-Fall? **Die Frage stellt sich nicht mehr.**

Sie war an den Knopf gebunden. Auf dem Wirt ist der `.env`-Fall der
**Normalfall** und wird vollständig erledigt: die Zeile wird ersetzt, der alte
Wert bleibt auskommentiert darüber stehen. **Was bleibt, ist die Absage**, wenn
der Wechsel den `.env`-Fall erkennt und die Datei nicht mitbekommen hat — dann
wird gar nicht erst angefangen.

### E. Woher kommt der neue Wert? **`openssl rand -hex 32` auf dem Wirt.**

Im Geist der Vorlage (`crypto.randomBytes(32)`), aber **auf dem Wirt statt im
Container**: so geht er über die **Umgebung** des Kindprozesses und nie über
eine Ausgabe. Ein von Hand eingegebener Schlüssel ist nicht vorgesehen — es
gibt keinen Grund, einen schwachen zu wählen. (`schluessel.js` nimmt
`NEUER_SCHLUESSEL` entgegen und erzeugt selbst einen, wenn keiner kommt.)

### F. Was ist mit den Sicherungen, die schon dastehen? **Alle drei Dinge — und ein vierter Satz.**

Marke, rote Markierung, Nennung vorher: alles gebaut. **Der Auftrag fragte, ob
das reicht. Es reicht knapp, und einer fehlte:** *Kopien von vor dem Wechsel
öffnen sich nur mit dem ALTEN Schlüssel; heb ihn auf.* Ohne den ist die rote
Markierung eine Warnung ohne Handlungsanweisung. Er steht jetzt an vier
Stellen: im Skript, in der `.env` neben dem abgelösten Wert, in der Karte und
in der README.

**Und eine Abstufung ist dazugekommen, die der Auftrag nicht nannte:** ist auch
die **jüngste** Kopie älter als der Wechsel, gibt es überhaupt keine, die zur
laufenden Anlage passt. Das ist eine andere Aussage als „ein paar alte liegen
daneben" und bekommt einen eigenen Satz.

### G. Steht die Anlage dabei still, und fallen die Sitzungen? **Ja und nein — und der Stillstand ist schärfer als geplant.**

Sie steht nicht nur still, sie ist **angehalten**. Das ist keine
Unbequemlichkeit, sondern eine Bedingung (siehe Abschnitt 2). **Die Sitzungen
fallen nicht** — ein Schlüsselwechsel ändert am Passwort nichts.

### H. Was, wenn zu wenig Platz frei ist? **Vorher prüfen, mit Begründung absagen.**

Wie vorgeschlagen, dieselbe Form wie beim Sicherungsort. Gebraucht wird die
Größe der Datenbank plus zehn Prozent; die Absage nennt beide Zahlen. Ist der
freie Platz **nicht ermittelbar**, ist das keine Absage — *eine Absage ohne
Grundlage wäre schlimmer als der Versuch* —, aber es wird gesagt.

### I. Gehört der Wechsel hinter die zweite Bestätigung? **Nein, er läuft auf dem Wirt.**

Siehe Abschnitt 2. `BESTAETIGUNG_ZWECKE` bleibt bei sechs.

### J. Was steht in der Protokollzeile? **`schluessel`, ohne alles.**

Wie vorgeschlagen: fünfzehnter Vorgang, kein Merkmal, kein Ziel, leeres `wer`
(= über den Wirt). **Geprüft am vollständigen Zeileninhalt über alle Spalten
aller Zeilen** — weder der alte noch der neue Wert steht irgendwo.

### K. Bekommt `zugang.js` einen Befehl `schluessel`? **Nein — er bekommt zwei eigene Dateien.**

Wie vorgeschlagen kein Befehl in `zugang.js`: *er hat bisher keine Datei
außerhalb der Datenbank angefasst, und die `.env` zu schreiben wäre ein neuer
Charakter.* Stattdessen `schluessel.sh` und `schluessel.js` — dieselbe Teilung
wie `zugang.js` neben `auth.js`.

**Die Frage des Auftrags, was passiert, wenn die `.env` nicht da ist, wo der
Befehl sie vermutet, ist damit beantwortet:** `schluessel.sh` sieht selbst
nach, ob in der `.env` eine aktive Schlüsselzeile steht, und `schluessel.js`
weist jede `.env` ab, die nicht zur laufenden Datenbank gehört — **bevor**
irgendetwas geschieht.

### L. Die Formatnummer? **Bleibt bei 10 — die Frage ist gestellt und beantwortet.**

Der Schlüssel steht nicht im Austauschformat und wird nie darin stehen.

### M. Ein Migrationsabschnitt im Prüfstand? **Nein — es gibt keinen Block.**

**Ausdrücklich gesagt, damit klar ist, dass die Frage gestellt wurde.** Diese
Runde bringt keine Tabelle und keine Spalte; `schluesselGewechseltAm` ist eine
Zeile in `settings`. Es bleibt bei **fünf** markierten Blöcken. Statt eines
Abschnitts steht die **Probe** da: das Schema nach dem Wechsel ist dasselbe wie
das einer frischen Anlage, und `settings` hat zwei Spalten wie vorher.

### N. Das Konzeptpapier? **Unberührt, und es behält seinen Dateinamen.**

**Ausdrücklich gesagt, statt es stillschweigend zu übergehen.** Diese Runde ist
keine Stufe des Mehrbenutzerbetriebs und rührt an keiner seiner Regeln.

---

## 4. Befunde beim Bauen

### A. Eine Portbasis lag auf einer Nummer, die `fetch()` gar nicht anwählt

**Der Wächter aus W2 wurde am ersten Tag rot** — und er hatte recht. Die Basis
**4000** deckt die Nummern 4000 bis 4059, und **4045** steht auf der Sperrliste
der Fetch-Spezifikation. Nachgestellt statt geglaubt: ein Server auf 4045 läuft,
`fetch` antwortet `bad port`, auf 4046 antwortet er 200.

**Eine von sechzig Ziehungen ließ die Prüflage „Erstanmeldung: frische
Installation" unerreichbar werden** — und der Lauf riss ab, statt eine Prüfung
namentlich rot zu färben. Das ist Stolperstein 127 im Bestand, seit 0.8.90
beschrieben und seither unbemerkt geblieben. Die Basis liegt jetzt auf **5130**
(frei zwischen 5070 und 5200).

*Ein Wächter, der am Tag seiner Entstehung einen Bestandsfehler findet, ist die
beste Begründung für einen Wächter.*

### B. Es sind 34 Portbasen, nicht 29

Der Auftrag sagte 29. Nachgezählt am Quelltext sind es **34** — die Spanne
4000–5959 stimmt. Die Zahl steht jetzt im Prüfstand und wird dort ausdrücklich
geprüft, wie die 57 in `F_ROUTEN`: *eine Prüflage, die still verschwindet,
fällt sonst niemandem auf.*

### C. Neunzehn Basenpaare überlappen — gemeldet, nicht behoben

Die Basen liegen 10 bis 40 Nummern auseinander, jede deckt 60. Das engste Paar
ist **4940/4950**. Das ist Stolperstein 64, und 0.8.90 hat den Fall
ZB/„Meine Sitzungen" schon benannt.

**Vollständig auflösen lässt es sich im vorhandenen Raum nicht:** 34 Basen mal
60 Nummern sind 2040, der Raum 4000–5959 fasst 1960. Der Wächter prüft es
deshalb **nicht** — er wäre am ersten Tag rot, und die Auflösung wäre ein Umbau
und kein Nachtrag. **Der Befund gehört trotzdem hierher**, und er steht unter
„Offen geblieben".

*Der Wächter aus W3 mildert es: solange keine Prüflage ihren Server
zurücklässt, kann eine Überlappung innerhalb eines Laufs niemanden treffen —
die Lagen laufen nacheinander.*

### D. Eine offene Leseverbindung ließ den Wechsel scheitern — Stolperstein 134

Der erste Lauf der neuen Gruppen scheiterte mit **`database is locked`**, und
das Fehlerbild sah aus wie ein Befund am Code. Es war eine Prüflage: der Helfer
`swOeffnetNicht()` öffnete die Datenbank, um zu sehen, ob der alte Schlüssel sie
noch öffnet — und schloss sie im **Erfolgsfall** nicht. Die Verbindung hielt
eine gemeinsame Sperre, und `journal_mode = DELETE` braucht eine
ausschließliche.

*Wo eine Prüfung eine Datenbank öffnet, schließt sie sie auch im Fehlerfall —
`finally`, nicht am Ende des guten Zweiges.*

### E. Der Bestandsvergleich sah die Spur, die der Wechsel selbst hinterlässt — Stolperstein 136

„Der Bestand ist Feld für Feld derselbe" verglich **jede** Tabelle vor und nach
dem Wechsel — und war rot, weil der Wechsel seine Marke in `settings` und seine
Zeile im Sicherheitsprotokoll geschrieben hatte. Beides ist genau so
beabsichtigt.

Der Vergleich nimmt jetzt eine Ausnahmeliste entgegen; die beiden Tabellen werden
**eigens** geprüft. **Beim Abbruch bleibt die Liste leer** — dort darf sich
nichts geändert haben, auch keine Marke, und genau das steht jetzt als eigene
Prüfung da.

### F. `textContent` trägt die Zeilenumbrüche der Vorlage mit — Stolperstein 135

Ein Wächter über einen Satz in der Karte prüfte auf ein einzelnes Leerzeichen;
im gerenderten Text stand dort ein Umbruch samt Einrückung. Die Prüfung fand
ihren eigenen Satz nicht. Gesucht wird jetzt im **gefalteten** Text — sonst
bliebe sie stumm, sobald jemand die Vorlage umbricht.

### G. „Sieben Wege über sechs Routen" war überall falsch — Stolperstein 137

Nachgezählt am Quelltext verlangen **sechs** Wege über **fünf** Routen eine
zweite Bestätigung, nicht sieben über sechs. `BESTAETIGUNG_ZWECKE` hat sechs
Einträge; `zweiteBestaetigung` steht an fünf Routen, `PUT /api/users/:id` trägt
zwei Wege.

Die falsche Zahl stand im Änderungsprotokoll 0.8.90 (Abschnitt J, in der
Überschrift **über** einer sechszeiligen Tabelle und über der eigenen Rechnung
*„die sechs … minus dem Schlüsselwechsel, plus der Link"*), im Projektstand an
vier Stellen und als Kommentar im Prüfstand.

**Berichtigt sind Projektstand, Prüfstand, `auth.js` und README.** Das
Änderungsprotokoll 0.8.90 bleibt stehen, wie es ist — es ist der Bericht jener
Runde, und die Berichtigung gehört hierher.

*Eine Zahl in einem Papier ist eine Behauptung. Wo eine im Prüfstand
festgenagelt werden kann — wie die 57 in `F_ROUTEN` —, gehört sie dorthin.*

### H. Die Versionsnummer stand als Zahl in einer Prüfung

`/api/config` wurde gegen `'0.8.90'` gehalten. Diese Prüfung färbt sich bei
**jeder** Runde rot, ohne je etwas über den Endpunkt zu sagen. Sie liest die
Nummer jetzt aus `package.json` — geprüft ist, dass der Endpunkt **die**
Version trägt, nicht welche.

### I. Der Papierkorb hat keine Spalte `art`

Die Prüflage für den Abbruch legte Bytes in `papierkorb_bytes` und griff dabei
auf Spalten zurück, die es dort nicht gibt (`art`, `name`). Der Lauf brach ab.
*Nachgesehen statt angenommen* — die Tabelle trägt `titel`/`inhalt` bzw.
`nr`/`daten`.

### J. Eine Gegenprobe nahm den ganzen Lauf mit — Stolperstein 138

**Der erste Gegenprobenlauf hat es sofort gefunden**, und es ist der wichtigste
Befund dieser Runde. Der Rückbau *„Die Umschaltung auf DELETE fällt weg"* ließ
den Prüflauf abbrechen statt Prüfungen namentlich rot zu färben:

```
Prueflauf abgebrochen: Cannot read properties of undefined (reading 'value')
```

Die Zeile las die Marke aus `settings` über `…get().value` — und nach einem
**gescheiterten** Wechsel steht sie dort nicht. Das ist Stolperstein 103 in
seiner unangenehmsten Form: **eine Gegenprobe, die den Lauf mitnimmt, sagt
nichts darüber, welche Prüfung den Rückbau bemerkt hätte.**

Diese Gruppen prüfen einen Vorgang, der scheitern **kann** und in den
Gegenproben absichtlich scheitert. Jede zerbrechliche Stelle läuft jetzt über
`swVersuch()` und wird zu einem **roten Punkt** statt zu einem Abriss: das
Öffnen der Datenbank und jede Lesestelle daran, das Lesen der Schlüsseldatei,
die aktive Zeile der `.env`, der Start als eigener Prozess und die Messung der
Dauer vor dem Abbruch. Der Schlag beim Abbruch fällt nach einem festen kurzen
Wert, wenn keine brauchbare Messung herauskam — `sleep NaN` riss den Lauf sonst
an einer Stelle ab, an der die Prüfung darüber längst rot war.

**Zwei Prüfungen haben dabei ihren Gegenstand zurückbekommen** (Stolperstein
81): *„Der ALTE Schlüssel steht in keiner Spalte keiner Zeile"* war an einer
**leeren** Tabelle grün und belegte nichts — sie verlangt jetzt zuerst, dass
überhaupt eine Zeile dasteht. Dasselbe beim Schemavergleich: zwei leere Listen
sind gleich.

**Nachgestellt:** derselbe Rückbau färbt jetzt **18** Prüfungen namentlich rot,
und der Lauf zählt seine 2998 zu Ende.
---

## 5. Der Prüfstand

### Neue Gruppen

| Gruppe | Prüfungen |
|---|---|
| Der Schlüsselwechsel: der Rundlauf | 6 |
| Der Schlüsselwechsel: die Umschaltung des Journals | 5 |
| Der Schlüsselwechsel: der Dateifall und der env-Fall | 18 |
| Der Schlüsselwechsel: kein Schlüssel, wo keiner hingehört | 12 |
| Der Schlüsselwechsel: der Abbruch mittendrin | 6 |
| Der Schlüsselwechsel: zu wenig Platz | 5 |
| Der Schlüsselwechsel: was er nicht anfasst | 6 |
| Die Sicherung: zwei Schlüssel im Umlauf | 9 |
| Die Portbasen und der Versatz | 7 |
| Keine Prüflage lässt ihren Server zurück | 2 |

Dazu **13** Prüfungen in „Die Sicherung in der Oberfläche" für die drei Lagen
des Wechsels und die Einzahl/Mehrzahl der Zählung.

### Was mindestens hineingehört — und wo es steht

| Forderung des Auftrags | Wo |
|---|---|
| Der Rundlauf, Feld für Feld, samt `integrity_check` | „der Rundlauf" |
| Die Journalumschaltung in beide Richtungen, und ein Wechsel **ohne** sie wird namentlich rot | „die Umschaltung des Journals" |
| Der `.env`-Fall und der Dateifall **getrennt** | „der Dateifall und der env-Fall" |
| Der Abbruch: `kill -9` mitten hinein | „der Abbruch mittendrin" |
| Zu wenig Platz: die Absage kommt, die Datei ist unangetastet | „zu wenig Platz" |
| Die alten Sicherungen, in **beiden** Lagen | „zwei Schlüssel im Umlauf" |
| Kein Schlüssel in einer Protokollzeile, über alle Spalten aller Zeilen | „kein Schlüssel, wo keiner hingehört" |
| Und in keiner Kontrollausgabe — was der Start schreibt, wird angesehen | ebenda |
| Die zweite Bestätigung am neuen Weg | **entfällt** — der Wechsel läuft auf dem Wirt (Abschnitt 2) |
| `F_ROUTEN` samt Zahl | unverändert bei **57**, ausdrücklich geprüft |
| Die Karte am Bildschirm | **entfällt** — stattdessen die drei Lagen der Karte „Sicherung" |
| Der Wächter aus W2 rechnet die Portversätze nach | „Die Portbasen und der Versatz" |
| Der Wächter aus W3 | „Keine Prüflage lässt ihren Server zurück" |
| Der Sprachwächter bleibt grün, auch über die Papiere dieser Runde | „Der Sprachwaechter" — er sieht jetzt **zehn** Quelltextdateien an |

### Zwei Lagen, die ihre eigene Voraussetzung prüfen

**Der Abbruch braucht eine Anlage, an der der Wechsel messbar dauert.** Bei 120
Zeilen sind es Millisekunden; die Prüflage baut deshalb rund **60 MB** auf und
**misst** die Dauer an einer Kopie, bevor sie zuschlägt. Ist der Wechsel wider
Erwarten zu schnell, sagt die Prüfung **das** und bleibt nicht still grün
(Stolperstein 81). Gemessen: **1514 ms** an 61,5 MB, geschlagen bei rund 500 ms.

**Die Absage bei zu wenig Platz braucht ein volles Dateisystem.** Eines
herzustellen verlangt das Einhängen eines `tmpfs`, und das darf nicht jeder.
Geht es nicht, wird die Lage **ausdrücklich übersprungen** — mit einer Zeile im
Lauf, in derselben Form wie beim fehlenden `jsdom`. Die **Ansage** des
Platzbedarfs wird dagegen immer geprüft.

### Kein Migrationsabschnitt

**Ausdrücklich:** es gibt keinen Block. Stattdessen steht die Probe selbst da —
das Schema nach dem Wechsel ist dasselbe wie das einer frischen Anlage, und
`settings` hat zwei Spalten wie vorher.

---

## 6. Gegenprobentabelle

**11 Gegenproben, jede in einer eigenen Kopie aus `git archive HEAD`**,
gefahren über `gegenprobe.js` mit vier Nebenspuren.

GEGENPROBENTABELLE_HIER

---

## 7. Prüfungszahlen

| | |
|---|---|
| Vorher (0.8.90) | 2909 |
| Nachher (0.8.91) | **PRUEFZAHL_HIER** |
| Neu | **NEUZAHL_HIER** |
| Gegenproben | **11** |

---

## 8. Was ausdrücklich nicht passiert ist

* **Kein Knopf in der Oberfläche.** Der Wechsel läuft auf dem Wirt — die
  Begründung steht in Abschnitt 2.
* **`F_ROUTEN` bleibt bei 57.** Keine neue Route, keine neue Art.
* **`BESTAETIGUNG_ZWECKE` bleibt bei sechs.** Kein neuer Bestätigungszweck.
* **Die Karten im Systembereich bleiben siebzehn.**
* **Kein Mailversand, keine Selbstanmeldung.** Beides ist Stufe I und bleibt
  bei 0.9.0.
* **Das Verschlüsselungs*modell* bleibt.** Gewechselt wird der Schlüssel, nicht
  das Verfahren: `cipher='sqlcipher'`, die Schlüssellänge und `katalog.sqlite`
  sind unangetastet.
* **Kein zweiter Faktor.** TOTP bleibt auf 0.9.10.
* **Die Formatnummer bleibt bei 10.** Der Schlüssel steht nicht im
  Austauschformat.
* **Keine neue Abhängigkeit.** `PRAGMA rekey` kann die Bibliothek, die schon da
  ist; `fs.statfsSync` ist in Node eingebaut.
* **Kein neuer Vokabeleintrag.** Die elf bleiben elf.
* **Kein Migrationsblock, kein sechster.** Es bleibt bei fünf — keine Tabelle,
  keine Spalte.
* **Der Papierkorb, die Token und die zweite Bestätigung sind nicht umgebaut.**
* **Die Sicherung als Vorgang ist unberührt** — ihre Karte hat nur die rote
  Markierung dazubekommen.
* **Farbschema, Anmeldebremse, `HINTER_PROXY`, `OEFFENTLICHE_ADRESSE`, die
  Content-Security-Policy, die Sortierung der Übersicht und das Austauschformat
  sind nicht angefasst.** Die `docker-compose.yml` ebenfalls nicht.
* **`anhaenge.js` und `zugang.js` sind unberührt geblieben.**
* **Das Konzeptpapier ist unberührt und behält seinen Dateinamen.**

---

## 9. Offen geblieben

* **Neunzehn Basenpaare im Prüfstand überlappen** (Abschnitt 4 C). Der Wächter
  prüft es nicht, weil er am ersten Tag rot wäre und die Auflösung im
  vorhandenen Raum nicht aufgeht. **Wer es auflösen will, braucht entweder
  einen breiteren Raum oder eine schmalere Streuung als sechzig** — und das ist
  ein Umbau, kein Nachtrag.
* **`docker compose run --rm` bei gesetztem `container_name` ist nicht
  nachgestellt.** In der Umgebung, in der diese Runde gebaut wurde, läuft kein
  Docker-Daemon. **Das gehört vor dem ersten echten Wechsel auf dem Server an
  einer Wegwerfanlage geprüft**; `schluessel.sh` nennt den Rückfallweg nicht,
  und er müsste dann nachgetragen werden.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. W1 und W2 mildern das,
  sie beheben es nicht.
* **Der Import hat keine Oberflächenprüfung für die Bestätigung** (aus 0.8.90).
* **`tokens.created_at` wird weiterhin von keinem Code gelesen** (aus 0.8.90).
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird weiterhin bei jedem
  Seitenaufbau abgefragt.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 bleibt offen.
* **„Abgelehnt mit Datum und Begründung"** (Ideenpapier 4.2) bleibt offen.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben.

---

**0.8.91 — Fingerprint `FINGERPRINT_HIER`**
