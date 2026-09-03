# Auftrag 0.20.0 — „Alte Sicherungen aufräumen — ohne Shell"

**Vorher: Version 0.19.6 · Fingerprint `109cd457` (gebaut am 3. September 2026,
im Feld noch nicht bestätigt) · 5246 Prüfungen · 535 Rückbauten (höchste Nummer
543) · 298 Stolpersteine · `F_ROUTEN` 70 · acht Zwecke der zweiten Bestätigung ·
acht Migrationsblöcke · Austauschformat 12 · neunzehn Karten im Systembereich ·
neun ausgelieferte Module**

---

> **DER BEFUND, WORTGLEICH AUS DEM BETRIEB — 2. September 2026, unmittelbar
> nach dem Einspielen von 0.19.3:** *„wie löscht man ohne Shell zu nutzen alte
> Sicherungen?"*
>
> **DIE ANTWORT LAUTET HEUTE: gar nicht.** `POST /api/sicherung` legt eine
> Datei `kriterion-<Zeitmarke>.sqlite` ab, die Karte zeigt seit 0.16.0 die
> jüngste Kopie, ihre Zahl und wie viele davon vor dem letzten Schlüsselwechsel
> entstanden sind — **wegräumen lässt sich nichts.** Dafür braucht es eine
> Shell auf dem Wirt, und genau die soll ein Betreiber für den Alltag nicht
> brauchen.
>
> **UND JEDE KOPIE IST SO GROSS WIE DIE GANZE DATENBANK.** Bei rund 570 MB
> Bildbestand ist die zehnte Sicherung ein halbes Dutzend Gigabyte.

**DIESE RUNDE BAUT EINE HÄLFTE FERTIG, DIE VON ANFANG AN FEHLT.** Es ist kein
Fehler und keine falsche Zusage: Kriterion schreibt Sicherungen und hat nie
behauptet, welche zu entfernen. *Ein Wunsch, der als Fehler abgeheftet wird,
drängelt sich in die falsche Runde.*

**DIE AUSARBEITUNG STEHT IM PROJEKTSTAND, ABSCHNITT 10a.** Dieser Auftrag
beantwortet die fünf Entscheidungen, die dort ausdrücklich offen gelassen sind
— sie stehen in Abschnitt 1 —, und sagt, was gebaut wird.

---

## Die Nummer: MINOR

**Der Maßstab aus Abschnitt 5.1: kann die Installation danach etwas, was sie
vorher nicht konnte?** Sie kann — **alte Sicherungen entfernen, ohne dass
jemand eine Shell öffnet.** Dazu kommt eine neue schreibende Route
(`F_ROUTEN` **70 → 71**) und ein **neunter** Zweck der zweiten Bestätigung.

**Kein Schema, kein Migrationsblock, kein neues Austauschformat, kein
Bestandslauf, keine neue ausgelieferte Datei, keine neue Abhängigkeit.** Die
beiden Werte der Regel gehören in `settings` — *Abschnitt 11: eine Einstellung,
die dem Betreiber gehört, gehört in die Datenbank und nicht in die `.env`.*

---

## 1. Die fünf Entscheidungen — beantwortet

| | Frage aus 10a | **Entscheidung** |
|---|---|---|
| **1** | Sind N und X einstellbar oder fest? | **Einstellbar, mit engen Grenzen: N von 1 bis 20, X von 7 bis 365.** Vorgabe **N = 3**, **X = 30**. *Ein Feld, in das jemand 0 schreiben kann, ist eine Falle — die Grenzen stehen am Server und nicht nur im Eingabefeld.* |
| **2** | Löschen oder Papierkorb? | **Löschen.** *Für eine 600-MB-Datei wäre ein Papierkorb sinnlos — der Platz ist ja der Grund.* **Die Vorschau ist der Ersatz für den Papierkorb.** |
| **3** | Läuft die Regel auch nach einer gescheiterten Sicherung? | **Nein — und das ist die wichtigste Zeile des Auftrags.** Aufgeräumt wird ausschließlich im Anschluss an eine Sicherung, **die gelungen ist**. *Sonst räumt die Installation genau in dem Augenblick auf, in dem sie keine neue Kopie zustande bringt.* |
| **4** | Was, wenn im Ordner fremde Dateien liegen? | **Angefasst wird ausschließlich, was auf `SICHERUNG_MUSTER` passt** (`/^kriterion-.+\.sqlite$/`), **nur im geprüften Ordner, nie in Unterverzeichnissen, und nur, was `lstatSync` als reguläre Datei meldet** — ein Symlink ist keine Sicherung. |
| **5** | Zählt der Boden alle Kopien oder nur die brauchbaren? | **Nur die nach dem Schlüsselwechsel.** *Drei Kopien, von denen zwei vor dem Wechsel entstanden sind, sind in Wahrheit eine.* Bei dieser Lage wird dann gar nichts gelöscht — **das ist die sichere Seite.** |

---

## 2. Die Regel — zwei Bedingungen, und beide müssen zutreffen

> **Gelöscht wird eine Kopie nur, wenn sie BEIDES ist:
> nicht unter den N jüngsten UND älter als X Tage.**

**Warum beide und nicht eine:**

| nur „älter als 30 Tage" | nur „die letzten 3" |
|---|---|
| Eine Installation, an der ein halbes Jahr nicht gesichert wurde, verliert **alle** Kopien auf einen Schlag — genau dann, wenn sie die einzigen sind. | Wer an einem Nachmittag viermal auf den Knopf drückt, wirft die Kopie vom Vormonat weg, obwohl nichts alt ist. |

**Die Zahl ist der Boden, das Alter ist die Schere.** *Eine Kopie fällt nur,
wenn sie entbehrlich **und** alt ist.*

**DIE REGEL STEHT AN GENAU EINER STELLE** — einer reinen Funktion, die eine
Dateiliste und die beiden Werte bekommt und die zu löschenden Namen liefert.
*Die Vorschau und das Löschen rufen dieselbe; zwei Fassungen wären zwei
Wahrheiten darüber, was gleich passiert (Stolperstein 47), und die Vorschau
verlöre genau das, wofür es sie gibt.*

**DIE HÄLFTE DER ARBEIT LIEGT SCHON DA.** `letzteSicherung()` liest den Ordner,
prüft jeden Namen gegen `SICHERUNG_MUSTER`, holt Größe und Zeitpunkt und
sortiert nach Alter — **die Regel ist ein Filter über genau dieser Liste.**
*Was fehlt, ist das Löschen, die Vorschau und die Bedienung.* **Die Liste wird
dabei nicht ein zweites Mal aufgebaut**: was `letzteSicherung()` heute
zusammensucht und wieder wegwirft, wird herausgezogen, damit beide es nutzen.

**DAS ALTER KOMMT AUS `mtimeMs` UND NICHT AUS DEM DATEINAMEN.** *Der Name trägt
zwar eine Zeitmarke, aber er ist von außen gestaltbar; die Angabe des
Dateisystems ist es nicht.* **Angefangene Kopien (`*.wird`) fallen ohnehin aus
dem Muster** — sie werden in dieser Runde nicht angefasst (Abschnitt 7).

---

## 3. Die Vorschau — bevor irgendetwas geschieht

**Die Karte „Sicherung" nennt namentlich, welche Dateien die Regel treffen
würde, mit Datum und Größe, und was das an Platz freigäbe.** *Ohne Vorschau ist
es eine Wette.*

- **Sie steht immer da**, auch wenn der Schalter aus ist — sie ist die Auskunft
  darüber, was die Regel bei den eingestellten Werten bedeutet.
- **Trifft die Regel nichts, sagt sie das** und nennt den Grund in einem
  halben Satz: *„Alle 3 Kopien sind unter den jüngsten 3."* / *„Die älteste ist
  12 Tage alt."* **Eine leere Liste ohne Erklärung sieht aus wie ein Fehler.**
- **Kopien von vor dem Schlüsselwechsel stehen getrennt**, mit ihrer eigenen
  Zahl und Summe — *sie sind nicht entbehrlich, sondern etwas anderes.*
- Die Werte N und X sind in derselben Karte einstellbar; **jede Änderung
  rechnet die Vorschau neu**, ohne dass etwas gelöscht wird.

---

## 4. Der Schalter steht auf AUS, und der Knopf steht daneben

**a) DER SCHALTER — Vorgabe AUS.** *Das ist die Abweichung von
`bilderUmwandeln`, und sie hat einen Grund:* eine umgewandelte PNG-Datei holt
der Knopf in der Gegenrichtung zurück — **eine gelöschte Sicherung holt nichts
zurück.** **Was nicht umkehrbar ist, wird nicht stillschweigend eingeschaltet.**
Steht er an, wendet die Installation die Regel **im Anschluss an jede gelungene
Sicherung** an.

**b) DER KNOPF — die Regel einmal anwenden**, für den, der nicht dauerhaft
einschalten will. **Hinter der zweiten Bestätigung**, wie jeder Vorgang, der
Bytes unwiderruflich entfernt. *Neuer Zweck `'sicherung'` in
`auth.BESTAETIGUNG_ZWECKE` — acht werden neun.*

**c) UND EIN ZWEITER WEG FÜR DIE VERALTETEN KOPIEN**, ausdrücklich und getrennt:
er räumt **alle** Kopien von vor dem Schlüsselwechsel weg und **nichts sonst**.
*Ebenfalls hinter der zweiten Bestätigung, und niemals nebenbei: eine
automatische Regel entfernt Überflüssiges, nicht Fremdes.*

**Beide Wege gehen durch dieselbe Route, unterschieden durch ein Feld im
Rumpf** — `{ art: 'regel' }` oder `{ art: 'veraltet' }`. *Zwei Routen für
dasselbe Löschen wären zwei Stellen, an denen die Pfadprüfung stehen muss.*

---

## 5. Die Route — und die Regel, die sie sicher macht

**`POST /api/sicherung/aufraeumen`**, `nurEigentuemer`, Eintrag in `F_ROUTEN`
(**70 → 71**). *Schreibend, also gehört sie hinein — Abschnitt 11.*

> ### **DIE ROUTE NIMMT KEINE DATEINAMEN ENTGEGEN. NIE.**
>
> **Sie bekommt die Art und sonst nichts; welche Dateien fallen, rechnet der
> Server im selben Augenblick selbst aus.** *Eine Löschroute, der man sagen
> kann, WAS sie löschen soll, ist die gefährlichste Route der Anwendung — und
> sie wäre es auch dann, wenn heute jeder Name geprüft würde: die Prüfung
> stünde einen Handgriff davon entfernt, vergessen zu werden.*
>
> **Der Preis ist benannt und angenommen:** zwischen Vorschau und Knopfdruck
> kann sich der Ordner geändert haben, und dann fällt etwas anderes als
> angezeigt. **Die Antwort nennt deshalb, was WIRKLICH gelöscht wurde**, und
> die Karte zeichnet sich daraus neu.

**Der Ordner kommt aus `getSetting('sicherungOrt')` und geht durch
`pruefeOrt()`** — dieselbe Prüfung wie beim Schreiben, dieselbe Funktion, kein
zweites Mal hingeschrieben. *Abschnitt 11: wer an einen angegebenen Ort
schreibt, prüft den aufgelösten Pfad; Positivliste zuerst, `realpathSync`
danach.* **Gelöscht wird über `path.join(geprüfterOrdner, basename(name))`**,
und jeder Name wird unmittelbar davor noch einmal gegen `SICHERUNG_MUSTER`
gehalten. *Zwei Prüfungen desselben Namens sind hier keine Verdopplung, sondern
die Klemme an der Stelle, an der der Fehler wehtut.*

**Was `unlink` nicht schafft, hält den Rest nicht auf.** Eine Datei, die
zwischen Auflisten und Löschen verschwindet oder sich sperrt, wird gezählt und
gemeldet — **die Antwort sagt „4 entfernt, 1 nicht"**, und der Grund steht im
Protokoll des Containers, nicht in der Antwort. *Fester Text wie überall bei
einem Fehler des Servers.*

---

## 6. Der Anschluss an die Sicherung — und das Protokoll

**Der Aufruf steht am Ende von `POST /api/sicherung`, NACH dem `rename` und
nach `statSync`** — an dem einen Augenblick, in dem feststeht, dass eine
frische, vollständige Kopie da ist. **Schlägt die Sicherung fehl, wird nicht
aufgeräumt** (Entscheidung 3). *Der Weg dorthin verlässt die Route vorher über
`return res.status(500)` — es genügt also, den Aufruf ans Ende zu setzen; das
ist keine Nachlässigkeit, sondern gehört im Quelltext benannt.*

**Und das Aufräumen darf die Sicherung nicht mitreißen.** Wer eine gelungene
Kopie mit einem Fehler beantwortet, macht aus einem geglückten Vorgang eine
rote Meldung — **genau der Fehler aus 0.19.6** (Stolperstein 298). *Der Aufruf
steht deshalb in seinem eigenen `try`, und was er meldet, ist eine Angabe
NEBEN der Sicherung, kein Ersatz für sie.*

**Jede Löschung geht ins Sicherheitsprotokoll:** neuer Vorgang
**`'sicherung.weg'`** in `auth.VORGAENGE` und in der Gruppe `bestand`, mit der
**Zahl** der entfernten Kopien. *Kein Freitext, kein Dateiname, kein Pfad —
das Protokoll hält Vorgänge fest, keine Orte auf dem Wirt (dieselbe Regel wie
beim `sicherung`-Eintrag daneben).* **Die freigegebenen Bytes gehören nicht in
die Tabelle**, sondern in die Antwort und die Zeile im Containerprotokoll:
`MERKMALE` ist eine geschlossene Liste und bleibt bei dreizehn.

---

## 7. Was ausdrücklich NICHT gebaut wird

- **KEINE ZEITSTEUERUNG.** Kriterion hat keinen Scheduler und bekommt für diese
  eine Sache keinen. *Aufgeräumt wird im Anschluss an eine Sicherung oder auf
  Knopfdruck — sonst nie.*
- **KEIN AUFRÄUMEN VON `*.wird`-DATEIEN.** Eine angefangene Kopie entsteht nur,
  wenn der Server mitten im `VACUUM INTO` stirbt; sie fällt aus
  `SICHERUNG_MUSTER`, und eine Regel, die zwei Muster kennt, ist zwei Regeln.
  *Der Fall gehört benannt und bleibt offen.*
- **KEIN LÖSCHEN EINZELNER KOPIEN PER KLICK.** Das wäre die Route mit
  Dateinamen, die Abschnitt 5 ausschließt. *Wer eine bestimmte Kopie loswerden
  will, hat die Shell — und diese Runde ändert daran nichts.*
- **KEIN VERSCHIEBEN, KEIN AUSLAGERN, KEIN ZWEITER ORT.** Ein „Archiv" wäre
  eine zweite Ortsprüfung und eine zweite Wahrheit über den Sicherungsort.
- **NICHTS AN `VACUUM INTO` SELBST.** Der Schreibweg bleibt Zeile für Zeile,
  wie er ist.

---

## 8. Was der Prüfstand belegen muss

**DIE REGEL IST EINE REINE FUNKTION — SIE WIRD AN EINER TAFEL GEPRÜFT, NICHT AN
EINEM ORDNER.** *Sieben Lagen mindestens:* nichts da · weniger als N Kopien ·
genau N · mehr als N, aber alle jung · mehr als N und die ältesten alt · alle
alt, aber unter dem Boden · **N Kopien, von denen welche vor dem
Schlüsselwechsel liegen** (Entscheidung 5 — hier darf nichts fallen).

**UND DER ORDNER WIRD ECHT ANGELEGT.** Wegwerfverzeichnis, echte Dateien,
**`fs.utimesSync` setzt das Alter** — *eine Prüfung, die auf echte dreißig Tage
wartet, gibt es nicht.* Belegt wird an ihm:

1. **Was die Regel nennt, ist danach weg** — und **alles andere ist noch da**,
   namentlich nachgesehen.
2. **Eine fremde Datei im Ordner (`notizen.txt`, `kriterion-alt.sqlite.bak`)
   überlebt jeden Lauf.** *Ohne diese Zeile belegt die Runde nichts über die
   gefährlichste Frage, die sie stellt.*
3. **Ein Unterverzeichnis wird nicht betreten**, und ein Symlink, der auf eine
   Datei außerhalb zeigt, wird nicht angefasst.
4. **Die Route nimmt keinen Dateinamen an** — *ein Rumpf mit `datei:
   "../../etc/passwd"` ändert am Ergebnis nichts;* die Zusage steht am
   Verhalten und zusätzlich am Quelltext.
5. **Nach einer gescheiterten Sicherung wird nicht aufgeräumt** (Entscheidung 3).
6. **Ohne zweite Bestätigung antwortet die Route mit 403**, und der Zweck heißt
   in der Absage beim Namen.
7. **Ein gewöhnlicher Admin bekommt die Route nicht** — `nurEigentuemer`.
8. **Der Protokolleintrag steht da, mit Zahl und ohne Dateinamen.**
9. **Die Vorschau und das Löschen sagen dasselbe** — dieselbe Funktion, an
   derselben Lage gegeneinander gehalten.
10. **Die Grenzen halten am Server**: N = 0, X = 3, N = 999, `"drei"`, `null`
    werden abgewiesen, und zwar bevor irgendetwas gelöscht wird.

**In der Oberfläche:** die Karte zeigt die Vorschau, der Schalter steht bei
einer frischen Installation **auf AUS**, die beiden Felder tragen die Vorgaben,
und der Knopf ist ohne Bestätigung nicht bedienbar.

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der
  Sprachwächter läuft mit.
* **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
* **Neue Stolpersteine ab 299.** Kandidaten aus der Sache selbst:
  - *Eine Löschregel braucht zwei Bedingungen; jede einzelne ist in genau der
    Lage falsch, in der sie gebraucht wird.*
  - *Eine Route, der man sagen kann, was sie löschen soll, ist auch mit Prüfung
    die gefährlichste der Anwendung — die Prüfung steht einen Handgriff davon
    entfernt, vergessen zu werden.*
* **Neue Rückbauten ab 544**, für jeden gebauten Punkt mindestens einer.
  **Darunter zwingend: einer, der die zweite Bedingung der Regel wegnimmt**
  (nur Alter), **einer, der den Boden wegnimmt** (nur Zahl), **einer, der die
  Musterprüfung wegnimmt** — *er muss die fremde Datei fallen lassen und
  namentlich rot werden* —, und **einer, der nach der gescheiterten Sicherung
  doch aufräumt.** *Ein Rückbau, der den Lauf abreißt, belegt nichts*
  (Stolperstein 161).
* **Rückbauten mitgehen lassen, nicht löschen** (Stolperstein 201), wo ihr
  Suchtext sich verschiebt — betroffen ist mindestens, was auf `letzteSicherung()`
  und `POST /api/sicherung` zeigt.
* **Der Prüfstand wächst von 5246**, die Rückbauliste von **535** (höchste
  Nummer 543).
* **`F_ROUTEN` 70 → 71**, die Zahl steht im Prüfstand ausdrücklich und wird
  dort mitgezogen. *Die Zeile „aktuell 69 Routen" in Abschnitt 11 des
  Projektstands ist veraltet und gehört bei dieser Gelegenheit berichtigt.*
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft
  ein letztes Mal gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.20.0.md`** liegt im Branch: was gebaut wurde je
  Datei, **die fünf Entscheidungen mit ihrer Begründung**, die Sicherheitsregel
  der Löschroute, neue Stolpersteine (**ab 299**), die Gegenprobentabelle,
  Prüfungszahlen vorher/nachher (**vorher: 5246**), Rückbauten vorher/nachher
  (**vorher: 535, höchste Nummer 543**), Offengebliebenes.
* Die Zeile „0.20.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** *Zwei Werte in
  `settings`, sonst nichts an der Datenbank.* **Und kein Bestandslauf: beim
  ersten Start nach dem Einspielen geschieht nichts von selbst.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: **`ls -la` im Sicherungsordner vor
  und nach dem Knopfdruck**, eine **fremde Datei**, die dort absichtlich liegt
  und liegen bleibt, und die **Zeile im Sicherheitsprotokoll**.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_20_0`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, offene Betriebspunkte, Fahrplan.
* **ABSCHNITT 10a VERLIERT SEINEN 0.20.0-EINTRAG** — er ist dann gebaut und
  steht in Abschnitt 9. *Was von ihm als Regel weitergilt (die zwei
  Bedingungen, der Schalter auf AUS, die Route ohne Dateinamen), gehört in
  Abschnitt 5.*
* **DER FAHRPLAN RÜCKT NICHT.** 0.20.0 ist die Zahl, die dieser Punkt am
  3. September 2026 bekommen hat; **0.21.0 bis 0.30.0 bleiben, wo sie stehen.**
* **ABSCHNITT 11 BEKOMMT DIE BERICHTIGUNG** der Routenzahl (69 → 71) und, wenn
  die Löschroute eine Regel hinterlässt, die für künftige Routen bindet, deren
  Zeile.
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2 — **mit Kasten**:
  *es kommt ein Schalter dazu, der Dateien entfernt, und der Betreiber muss
  wissen, dass er auf AUS steht.*
* **DIE README WIRD ANGEFASST**, und zwar an zwei Stellen — *nachgesehen, nicht
  vermutet:* die Kartenbeschreibung in der Kartenliste (heute: Zielort, letzte
  Sicherung, Dauer, rote Markierung der alten Kopien) und der Abschnitt
  **„Sichern"** (heute: `VACUUM INTO`, Dauer, Stillstand, alter Schlüssel).
  **Beide sagen bisher nichts darüber, was mit einer Kopie geschieht, wenn die
  nächste entsteht — weil bisher nichts geschah.** *Keine neue Datei, also kein
  neuer Eintrag im Fingerprint-Handgriff.*
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**
* **`Doku/Auftrag_0.19.5.md` fällt mit diesem Auftrag weg** — *es liegt immer
  nur einer im Repo.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

---

## Was danach offen bleibt

- **Angefangene Kopien (`*.wird`)** bleiben liegen (Abschnitt 7).
- **Eine einzelne Kopie per Klick löschen** — bewusst nicht gebaut, mit
  Begründung.
- **Die übrigen Zeichenwege der Detailansicht** tragen die Wache aus 0.19.6
  nicht *(aus 0.19.6, Abschnitt 8 des Projektstands)*.
- **Die Übersicht kann eine Fassung zu alt sein**, wenn man während des
  Speicherns eines Ausschnitts wechselt *(aus 0.19.6)*.
- **`reclaim()` hat weiterhin keine greifende Gegenprobe** *(aus 0.19.3)*.
- **Der volle Gegenprobenlauf** über alle Rückbauten — rund vierzig Stunden.
