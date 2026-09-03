# Änderungsprotokoll 0.20.0 — „Alte Sicherungen aufräumen — ohne Shell"

**MINOR · 3. September 2026 · ein Wunsch aus dem Betrieb vom 2. September,
Punkt 8 des Sammelblatts.** *Angefasst sind `server.js`, `auth.js`,
`public/app.js`, `pruefung.js`, `gegenprobe.js`, `package.json`,
`package-lock.json` und die Papiere.*

**KEINE DATENBANKSTUFE UND KEIN BESTANDSLAUF** — kein Migrationsblock, keine
Schemaänderung, kein neuer Index, kein neues Austauschformat, keine neue
ausgelieferte Datei, keine neue Abhängigkeit. Austauschformat **12**, acht
Migrationsblöcke, neun ausgelieferte Module.

**WAS SICH BEWEGT:** `F_ROUTEN` **70 → 71**, die Zwecke der zweiten Bestätigung
**acht → neun**, die Vorgänge im Sicherheitsprotokoll **zwanzig →
einundzwanzig**, die Karten im Systembereich **neunzehn → zwanzig**.

> **DREI ZEILEN IN `settings`, SONST NICHTS AN DER DATENBANK.**
> `sicherungAufraeumen`, `sicherungBehalten` und `sicherungTage` — **und sie
> entstehen erst, wenn jemand sie setzt:** abgeleitet beim Lesen, ohne
> Migrationscode. Was nicht dasteht, gilt als Vorgabe (**3**, **30**) und der
> Schalter als **aus**. **Beim ersten Start nach dem Einspielen geschieht
> nichts von selbst** — es gibt keinen Bestandslauf und keine Zeitsteuerung.

---

## Der Befund aus dem Betrieb — wortgleich

> *„wie löscht man ohne Shell zu nutzen alte Sicherungen?"*

**Die Antwort lautete: gar nicht.** `POST /api/sicherung` legte eine Datei
`kriterion-<Zeitmarke>.sqlite` im Sicherungsordner ab; die Karte zeigte seit
0.16.0 die **jüngste** Kopie, ihre **Zahl** und wie viele davon **vor dem
letzten Schlüsselwechsel** entstanden sind. **Wegräumen ließ sich nichts** —
dafür brauchte es eine Shell auf dem Wirt, und genau die soll ein Betreiber für
den Alltag nicht brauchen.

**Und jede Kopie ist so groß wie die ganze Datenbank.** Bei rund 570 MB
Bildbestand ist die zehnte Sicherung ein halbes Dutzend Gigabyte.

> **ES WAR KEIN FEHLER.** Kriterion hat Sicherungen geschrieben und nie
> behauptet, welche zu entfernen — **es fehlte eine Hälfte, die von Anfang an
> nicht gebaut wurde.** *Ein Wunsch, der als Fehler abgeheftet wird, drängelt
> sich in die falsche Runde.*

---

## 1. Die fünf Entscheidungen — beantwortet, mit ihrer Begründung

**Die Ausarbeitung in Abschnitt 10a des Projektstands hatte fünf Fragen
ausdrücklich offen gelassen.** Sie sind mit dem Auftrag der Runde beantwortet;
hier stehen sie mit dem Grund, aus dem sie so entschieden sind — *und mit dem,
was beim Bauen daraus geworden ist.*

### 1. Sind N und X einstellbar oder fest?

**EINSTELLBAR, MIT ENGEN GRENZEN: N von 1 bis 20, X von 7 bis 365. Vorgabe
N = 3, X = 30.**

*Der Grund für „einstellbar": ein Betreiber mit 60 GB freiem Platz und einer
Datenbank von 600 MB will andere Zahlen als einer mit einem Gigabyte.* **Der
Grund für die engen Grenzen ist ein anderer, und er wiegt schwerer: ein Feld, in
das jemand 0 schreiben kann, ist eine Falle** — ein Boden von 0 hieße „alles
darf fallen", und eine Schere von 0 Tagen hieße „auch die von heute".

> **DIE GRENZEN STEHEN AM SERVER UND NICHT NUR IM EINGABEFELD.** `min` und `max`
> stehen an den beiden Feldern — *sie sind eine Bitte, keine Klemme.* Geprüft
> wird in `pruefeRegelwert()`, und zwar auf **drei** Wegen: beim Speichern
> (`PUT /api/settings`), beim Rechnen der Vorschau (`GET /api/sicherung`) und
> **beim Lesen der Regel** vor dem Löschen. *Der dritte ist der, an dem es
> darauf ankommt: ein von Hand in die Tabelle geschriebener Wert außerhalb der
> Spanne fällt auf die Vorgabe zurück und weitet die Regel nicht.*

**Was daraus zusätzlich folgte:** `null`, `"drei"` und `30.5` werden
**abgewiesen** und nicht stillschweigend gerundet. *Eine Zahl, die der Server
anders liest, als sie eingetippt wurde, ist schlimmer als eine Absage.*

### 2. Löschen oder Papierkorb?

**LÖSCHEN. Und die Vorschau ist der Ersatz für den Papierkorb.**

*Für eine 600-MB-Datei wäre ein Papierkorb sinnlos — der Platz ist ja der
Grund.* **Kriterion hat einen Papierkorb für Einträge, und er kostet dort
nichts:** eine gelöschte Zeile liegt in einer Nebentabelle. **Eine gelöschte
Sicherung in einen Papierkorb zu schieben hieße, sie zu behalten.**

> **DARAUS FOLGT EINE AUFLAGE, UND SIE IST GEBAUT: wo es keinen Papierkorb
> geben kann, muss die Oberfläche VORHER sagen, was fällt.** Namentlich, mit
> Datum, Alter und Größe. *Ohne Vorschau ist es eine Wette.*

### 3. Läuft die Regel auch nach einer gescheiterten Sicherung?

**NEIN — und das ist die wichtigste Zeile der Runde.**

*Sonst räumt die Installation genau in dem Augenblick auf, in dem sie keine
neue Kopie zustande bringt.* **Aufgeräumt wird ausschließlich im Anschluss an
eine Sicherung, die gelungen ist.**

> **GEBAUT IST DAS ALS BAUFORM UND NICHT ALS SORGFALT.** Der Aufruf steht am
> **Ende** von `POST /api/sicherung`, nach dem `rename` und nach `statSync` — an
> dem einen Augenblick, in dem feststeht, dass eine frische, vollständige Kopie
> da ist. **Jeder Fehlerausgang der Route liegt davor** (`return
> res.status(400)` für die Ortsprüfung, `409` für die belegte Sekunde, `500` für
> das gescheiterte `VACUUM INTO`). *Es genügt also, den Aufruf ans Ende zu
> setzen — und genau deshalb steht der Satz im Quelltext daneben: wer ihn je
> nach vorn zieht, hebt die Entscheidung auf.*

**Belegt ist es zweifach**, und beides gehört zusammen:

* **Am Verhalten:** die Sicherung wird **deterministisch** zum Scheitern
  gebracht — die Route bildet den Dateinamen aus Datum und Uhrzeit auf die
  Sekunde, und liegt dort schon eine Datei, antwortet sie mit **409**. Die
  Prüflage legt die Namen der **nächsten vier Sekunden** vor; damit trifft es
  die Route in jedem Fall, ohne dass der Lauf auf eine Sekundengrenze warten
  müsste. **Der Ordner bleibt dabei schreibbar** — ein Aufräumen vor dem
  Fehlerausgang könnte dort also sehr wohl löschen.
* **Und daran, dass es nicht einmal versucht wurde:** `entferneSicherungen()`
  meldet jede Datei, die es nicht wegbekommt, ins Containerprotokoll. **Steht
  im neuen Teil des Protokolls nichts davon, ist der Aufruf gar nicht
  gelaufen.** *Ohne diese Zeile wäre „es liegt noch alles da" auch dann wahr,
  wenn das Löschen nur gescheitert ist.*

### 4. Was, wenn im Ordner fremde Dateien liegen?

**ANGEFASST WIRD AUSSCHLIESSLICH, WAS AUF `SICHERUNG_MUSTER` PASST**
(`/^kriterion-.+\.sqlite$/`), **nur im geprüften Ordner, nie in
Unterverzeichnissen, und nur, was `lstatSync` als reguläre Datei meldet.**

| Klemme | Was sie hält |
|---|---|
| `SICHERUNG_MUSTER` | `notizen.txt` fällt heraus, `kriterion-alt.sqlite.bak` fällt heraus — und angefangene Kopien (`*.wird`) ohnehin |
| `readdirSync` ohne Tiefe | ein **Unterverzeichnis** wird nicht betreten |
| `lstatSync().isFile()` | **ein Symlink ist keine Sicherung** |
| `pruefeOrt()` | derselbe Weg wie beim Schreiben: Positivliste zuerst, `realpathSync` danach |
| `path.basename()` + Muster, unmittelbar vor dem `unlink` | die Klemme an der Stelle, an der der Fehler wehtut |

> **`lstatSync` STATT `statSync` IST EINE ÄNDERUNG AN VORHANDENEM CODE, und sie
> gehört benannt.** `letzteSicherung()` fragte bis 0.19.6 mit `statSync` — das
> **folgt** dem Verweis und meldet die Datei am anderen Ende als regulär. *Für
> das Zählen und für „letzte Sicherung vor N Tagen" war das folgenlos; für das
> Löschen ist es der Unterschied zwischen „ein Symlink im Ordner" und „eine
> Datei irgendwo auf dem Wirt".* **Die Prüflage legt den Verweis eigens an und
> lässt ihn aus der Wurzel herausführen** — und sein Ziel ist **eigens alt**,
> sonst deckte ihn der Boden der Regel und der Fehler bliebe stumm.

**Die zweite Prüfung desselben Namens ist keine Verdopplung.** Die Namen kommen
heute aus `sicherungsListe()` und sind dort längst geprüft; **die zweite Klemme
in `entferneSicherungen()` gilt für den nächsten Rufer.** *Am Verhalten allein
ist sie deshalb stumm — rot wird sie über den Wächter am Quelltext, und das ist
hier die richtige Stelle.*

### 5. Zählt der Boden alle Kopien oder nur die brauchbaren?

**NUR DIE NACH DEM SCHLÜSSELWECHSEL.**

*Drei Kopien, von denen zwei vor dem Wechsel entstanden sind, sind in Wahrheit
eine.* **Bei dieser Lage wird dann gar nichts gelöscht — das ist die sichere
Seite.**

> **UND DIE VERALTETEN FASST DIE REGEL ÜBERHAUPT NICHT AN.** Sie sind nicht
> entbehrlich, sondern **etwas anderes**: wer den alten Schlüssel noch hat,
> kommt an sie heran, und wer ihn nicht mehr hat, hat ohnehin nichts verloren.
> **Eine automatische Regel entfernt Überflüssiges, nicht Fremdes.**
> *Wegräumen lassen sie sich über denselben Knopf — aber **ausdrücklich und
> getrennt**, mit eigener Zahl, eigener Summe und eigenem Knopf in der Karte.*

---

## 2. Die Regel — zwei Bedingungen, an genau einer Stelle

> **Gelöscht wird eine Kopie nur, wenn sie BEIDES ist:
> nicht unter den N jüngsten UND älter als X Tage.**

| nur „älter als 30 Tage" | nur „die letzten 3" |
|---|---|
| Eine Installation, an der ein halbes Jahr nicht gesichert wurde, verliert **alle** Kopien auf einen Schlag — genau dann, wenn sie die einzigen sind. | Wer an einem Nachmittag viermal auf den Knopf drückt, wirft die Kopie vom Vormonat weg, obwohl nichts alt ist. |

**Die Zahl ist der Boden, das Alter ist die Schere.** *Eine Kopie fällt nur,
wenn sie entbehrlich **und** alt ist.*

```js
function regelTreffer(dateien, behalten, tage, jetzt, wechselMs) {
  const brauchbar = dateien
    .filter(d => wechselMs == null || d.zeit >= wechselMs)
    .sort((a, b) => b.zeit - a.zeit);
  const grenze = jetzt - tage * TAG_MS;
  //          der Boden                    die Schere
  return brauchbar.slice(behalten).filter(d => d.zeit < grenze);
}
```

**Drei Eigenschaften dieser Funktion sind Absicht:**

1. **Sie steht genau einmal.** Vorschau und Löschen rufen dieselbe. *Zwei
   Fassungen wären zwei Wahrheiten darüber, was gleich passiert (Stolperstein
   47) — und die Vorschau verlöre genau das, wofür es sie gibt.*
2. **Sie berührt weder Uhr noch Dateisystem.** `jetzt` und `wechselMs` kommen
   als Argument herein. *Nur so ist sie an einer **Tafel** prüfbar; eine
   Prüfung, die auf echte dreißig Tage wartet, gibt es nicht.*
3. **Sie sortiert selbst und lässt die hereingegebene Liste in Ruhe.** *Käme
   sie ungeordnet herein und zählte den Boden von vorn, träfe sie die falschen
   — und mit einer bereits sortierten Liste fiele das nie auf.*

**DAS ALTER KOMMT AUS `mtimeMs` UND NICHT AUS DEM DATEINAMEN.** *Der Name trägt
zwar eine Zeitmarke, aber er ist von außen gestaltbar; die Angabe des
Dateisystems ist es nicht.* **Die Prüflage legt dafür zwei Dateien an, deren
Namen absichtlich lügen** — eine mit dem Namen von heute und dem Alter von 200
Tagen, und eine mit dem Namen von 2020 und dem Alter von null. *Die erste fällt,
die zweite nicht.*

### Die halbe Arbeit lag schon da

`letzteSicherung()` las den Ordner bereits, prüfte jeden Namen gegen
`SICHERUNG_MUSTER`, holte Größe und Zeitpunkt und sortierte nach Alter — **und
warf die Liste danach weg.** Sie ist zu **`sicherungsListe()`**
herausgezogen; **die Liste wird nicht ein zweites Mal aufgebaut.**

---

## 3. Was gebaut wurde — je Datei

| Datei | Was |
|---|---|
| `server.js` | **`sicherungsListe()`** aus `letzteSicherung()` herausgezogen, `statSync` → **`lstatSync`**. **`regelTreffer()`** — die Regel als reine Funktion. **`pruefeRegelwert()`** — eine Stelle für beide Spannen. **`aufraeumStand()`** — der eingestellte Stand, abgeleitet beim Lesen. **`aufraeumVorschau()`** — Treffer, Bytes, Grund, und die veralteten getrennt. **`entferneSicherungen()`** — Muster und `basename` unmittelbar vor dem `unlink`, ein Fehlschlag hält den Rest nicht auf. **`protokolliereEntfernt()`** — eine Zeile je Kopie. `GET /api/sicherung` trägt `aufraeumen` und nimmt `?behalten=`/`?tage=` an *(lesend, kein Eintrag in `F_ROUTEN`)*. **`POST /api/sicherung/aufraeumen`** — die einundsiebzigste schreibende Route. Der Aufruf am Ende von `POST /api/sicherung`, in eigenem `try`. Drei Schlüssel in `EIGENTUEMER_SCHLUESSEL`, Prüfung und Schreibweg in `PUT /api/settings` |
| `auth.js` | `BESTAETIGUNG_ZWECKE` acht → **neun** (`'sicherung'`). `VORGAENGE` zwanzig → **einundzwanzig** (`'sicherung.weg'`), und derselbe Vorgang in `PROTOKOLL_GRUPPEN.bestand`. **`MERKMALE` bleibt bei vierzehn** |
| `public/app.js` | Die **zwanzigste Karte** `aufraeumen` in `SYS_KARTEN`, hinter `sicherung`, `EIGENTUEMER`. **`karteAufraeumen()`** und **`drawAufraeumen()`**: Schalter, zwei Zahlenfelder, Vorschau mit dem gemeinsamen Deckel der Systemlisten, die veralteten getrennt, zwei Knöpfe hinter der zweiten Bestätigung. Wort für `sicherung.weg` im Sicherheitsprotokoll und im Hilfstext der Gruppe „Bestand". **Eine Zeile in `ruesteSicherungAus()`**: hat der Anschluss wirklich etwas weggeräumt, wird der ganze Bereich neu gezeichnet |
| `pruefung.js` | Vier neue Gruppen (**128 Prüfungen**), die vier mitgezogenen Zahlen, der Mock für die Vorschau und den Löschweg |
| `gegenprobe.js` | **Dreiundzwanzig neue Rückbauten** (544 bis 566), **einer nachgezogen** (437) |
| `package.json`, `package-lock.json` | Version **0.20.0** |
| Papiere | Projektstand *(umbenannt auf `_0_20_0`)*, `CHANGELOG.md`, `README.md`, `Doku/Fehler_und_Ideen.md`, dieses Protokoll |

**KEINE neue ausgelieferte Datei, kein `public/style.css`.** *Die Vorschauliste
trägt `.manage-list` und `.mrow` — dieselben Klassen wie jede Liste im
Systembereich, und damit denselben Deckel von zehn Zeilen (seit 0.17.3). Eine
eigene Zahl daneben wäre eine zweite Wahrheit über dasselbe Maß.*

---

## 4. Die Sicherheitsregel der Löschroute

> ### **DIE ROUTE NIMMT KEINE DATEINAMEN ENTGEGEN. NIE.**

**Sie bekommt die Art und sonst nichts** — `{ art: 'regel' }` oder
`{ art: 'veraltet' }`; **welche Dateien fallen, rechnet der Server im selben
Augenblick selbst aus.**

*Eine Löschroute, der man sagen kann, WAS sie löschen soll, ist die
gefährlichste Route der Anwendung — und sie wäre es auch dann, wenn heute jeder
Name geprüft würde: **die Prüfung stünde einen Handgriff davon entfernt,
vergessen zu werden.*** **Der Ausweg ist baulich und nicht sorgfältig.**

**Der Preis ist benannt und angenommen:** zwischen Vorschau und Knopfdruck kann
sich der Ordner geändert haben, und dann fällt etwas anderes als angezeigt.
**Die Antwort nennt deshalb, was WIRKLICH gelöscht wurde**, und die Karte
zeichnet sich daraus neu.

**Belegt ist die Zusage doppelt:**

* **Am Verhalten:** ein Rumpf mit `datei: "../../etc/passwd"`, `dateien:
  ["notizen.txt"]`, `ordner: "/etc"` und `name: "<die jüngste Kopie>"` ändert
  am Ergebnis **nichts** — es fallen genau die drei, die die Regel nennt.
* **Am Quelltext:** im Rumpf der Route steht `req.body` **genau einmal**, und
  zwar als `req.body?.art`. *Ein zweiter Zugriff wäre die Stelle, an der ein
  Dateiname hereinkäme.*

**Zwei Wege, eine Route.** *Zwei Routen für dasselbe Löschen wären zwei Stellen,
an denen die Pfadprüfung stehen muss.*

### Das Protokoll: eine Zeile je entfernter Kopie

**Die ZAHL der entfernten Kopien gehört ins Sicherheitsprotokoll — eine Spalte
dafür gibt es aber nicht.** `wer` und `ziel` sind Benutzernummern mit
Fremdschlüssel, `merkmal` ist eine geschlossene Liste **ohne Ziffern**, und
Freitext gibt es in dieser Tabelle ausdrücklich nicht. *Eine neue Spalte wäre
ein Schemaschritt, und diese Runde ist ausdrücklich keiner.*

> **DAMIT IST DIE ZAHL DIE ZEILENZAHL: vier entfernte Kopien sind vier Zeilen.**
> Das ist keine Notlösung, sondern dieselbe Aussage in der Form, die die Tabelle
> trägt — **und die einzige, die sich hinterher wirklich zählen lässt.**

**Kein Dateiname, kein Pfad, keine Bytes.** *Das Protokoll hält Vorgänge fest,
keine Orte auf dem Wirt — dieselbe Regel wie beim `sicherung`-Eintrag daneben.*
**Die freigegebenen Bytes stehen in der Antwort und in der Zeile im
Containerprotokoll**, und `MERKMALE` bleibt bei vierzehn.

---

## 5. Die Karte — und warum sie eine eigene ist

**IM SYSTEMBEREICH, ABSCHNITT „DATENBANK", UNMITTELBAR HINTER „SICHERUNG",
`EIGENTUEMER`.**

**GEPRÜFT WURDE ZUERST, OB ES IN DIE VORHANDENE KARTE PASST — es passt nicht.**
*Nachgesehen, nicht vermutet:* die Karte „Sicherung" trägt bis zu **drei**
Zustandskästen (Ortlage rot/grün, veraltete Kopien, kein passender Schlüssel),
**vier** Kennzahlzeilen, das Feld für den Zielort mit eigenem Knopf und den
Sicherungsknopf; ihre Zeichenfunktion ist mit rund 140 Zeilen die längste des
Abschnitts. **Dazu kämen ein Schalter, zwei Zahlenfelder, eine Dateiliste mit
Datum und Größe und zwei weitere Knöpfe.**

> **UND DER ZWEITE GRUND WIEGT SCHWERER ALS DER ERSTE: EIN LÖSCHKNOPF GEHÖRT
> NICHT UNTER DEN SICHERUNGSKNOPF.** Die beiden Vorgänge sind gegenläufig — der
> eine legt eine Kopie an, der andere wirft welche weg — und sie stünden
> untereinander in derselben Kachel. *Die Verwechslung wäre nicht
> wiedergutzumachen.*

**Das Projekt hat diese Frage schon einmal so entschieden:** in 0.19.1 bekam die
Bildablage eine eigene Kachel, *„weil die Karte Kennzahlen zu groß geworden
war"*. **Hier gilt derselbe Satz, und der zweite kommt dazu.**

### Was auf der Karte steht

| Teil | Wie |
|---|---|
| **Die Regel in einem Satz** | steht **vor** dem Schalter: wer ihn umlegt, soll wissen, was er einschaltet |
| **Der Schalter** | Vorgabe **aus**, mit dem Grund daneben — *eine gelöschte Sicherung holt nichts zurück* — und der Zusage, dass nach einer gescheiterten Sicherung nichts geschieht |
| **„Immer behalten"** | 1 bis 20, Vorgabe 3. *Der Boden* |
| **„Erst löschen ab"** | 7 bis 365 Tage, Vorgabe 30. *Die Schere* |
| **Die Vorschau** | steht **immer** da, auch bei ausgeschaltetem Schalter; namentlich, mit Datum, Alter und Größe, und was frei würde. Trifft die Regel nichts, **nennt sie den Grund** |
| **Die veralteten Kopien** | **getrennt**, mit eigener Zahl, eigener Summe und eigenem Knopf |
| **Zwei Knöpfe** | „Regel jetzt anwenden" und „*n* veraltete Kopien entfernen" — beide hinter der zweiten Bestätigung |

**DIE FELDER HEISSEN IM KLARTEXT UND NICHT „N" UND „X".** *Wer die Karte
öffnet, hat den Auftrag der Runde nicht gelesen.*

**ZWEI EREIGNISSE AN DEMSELBEN FELD, und sie tun zwei verschiedene Dinge:**
`input` rechnet die **Vorschau** neu — **am Server, mit den Werten aus der
Abfrage**, und gespeichert wird dabei nichts; `change` **speichert** den Wert
(beim Verlassen des Feldes oder mit der Eingabetaste). *Ein eigener
Speicherknopf wäre ein dritter Knopf auf einer Karte, die mit zwei auskommt.*

> **DIE KARTE RECHNET DIE REGEL NICHT SELBST NACH.** Sie schickt die beiden
> Werte an `GET /api/sicherung` und zeichnet, was zurückkommt. *Eine zweite
> Fassung der Regel im Browser wäre eine zweite Wahrheit darüber, was gleich
> passiert.* **Und nur die jüngste Antwort zählt:** wer schnell tippt, hat
> mehrere Abrufe unterwegs, und sie können in beliebiger Reihenfolge ankommen —
> *dieselbe Überlegung wie bei der Wache aus 0.19.6.*

**UND DIE KARTE „SICHERUNG" BLEIBT, WIE SIE IST.** Kein Verweis, kein zweiter
Schalter, keine zweite Zahl. *Sie sagt weiterhin, wie viele Dateien am Ort
liegen — diese Zeile ist die Brücke zwischen beiden Karten und stand schon da.*

> **EINE EINZIGE ZEILE IST DOCH AN IHREM BEHANDLER DAZUGEKOMMEN, und sie
> gehört benannt:** hat der Anschluss nach einer Sicherung wirklich etwas
> weggeräumt, wird **der ganze Bereich** neu gezeichnet statt nur dieser Karte.
> *Sonst stünde daneben eine Vorschau auf Dateien, die es nicht mehr gibt —
> genau die zweite Wahrheit, gegen die diese Runde gebaut ist. Dieselbe Bauform
> wie bei der Bildumstellung. **Gezeichnet wird dabei dasselbe** — die Karte
> „Sicherung" trägt Zeile für Zeile, was sie vorher trug.*

---

## 6. Was der Prüfstand dazu sagt

**Vorher 5246, nachher 5374 — 128 neue, keine weggefallen.**

| Gruppe | Prüfungen | Wofür |
|---|---|---|
| **Die Aufräumregel an der Tafel** | **16** | Die **echte** Regel: `regelTreffer()` wird aus `server.js` **herausgeschnitten und gelaufen** — von Klammer zu Klammer mit `indexOf`, dieselbe Bauform wie bei `F_ROUTEN`, und `TAG_MS` wird mitgeschnitten statt ein zweites Mal getippt. **Sieben Lagen**, dazu die Gegenlage darüber, der Fall ohne Wechsel, die **scharfe Grenze der Schere**, der **Boden von eins** und die **ungeordnete Liste** |
| **Alte Sicherungen aufräumen: der echte Ordner** | **72** | Sieben Kopien, `fs.utimesSync` setzt das Alter, zwei Namen lügen absichtlich. Vier Dinge daneben, die nicht angefasst werden dürfen — **alle vier alt**. Vorschau, Grenzen, Rechte, zweite Bestätigung, der Rumpf mit Dateinamen, das Protokoll, die veralteten Kopien |
| **Alte Sicherungen aufräumen: der Anschluss an die Sicherung** | **20** | Beide Hälften des Schalters, die **deterministisch gescheiterte** Sicherung, und **fünf Zusagen am Quelltext** |
| **Die Karte „Alte Sicherungen" in der Oberfläche** | **20** | Schalter auf aus, Vorgaben und Grenzen an den Feldern, die Vorschau namentlich, der Deckel, der Grund, die veralteten getrennt, die Vorschau rechnet am Server neu, der Knopf hinter der Bestätigung |

**Die vier mitgezogenen Zahlen** stehen dort, wo sie schon standen: `F_ROUTEN`
**71**, die Zwecke **neun** *(der neunte heißt `sicherung`)*, die Vorgänge
**einundzwanzig** *(`sicherung.weg`)*, die Karten **zwanzig** — **und „Alte
Sicherungen" steht unmittelbar hinter „Sicherung"**, namentlich geprüft.

> **WARUM DIE REGEL AN EINER TAFEL GEPRÜFT WIRD UND NICHT AN EINEM ORDNER.**
> Sie bekommt `jetzt` und die Marke des Wechsels als Argument — *also braucht
> sie weder Uhr noch Dateisystem, und sieben Lagen kosten sieben Zeilen statt
> sieben Verzeichnisse.* **Der Ordner kommt daneben und mit eigenen Zusagen:**
> dass die Regel den richtigen Ordner liest, dass sie **nur** ihn liest, und
> dass die genannten Dateien danach wirklich weg sind. *Beides zusammen, keines
> anstelle des anderen.*

### Der Gegenprobenlauf — vierundzwanzig gefahren, KEINER stumm

**Gefahren sind die dreiundzwanzig neuen und der eine nachgezogene (437), in
vier Nebenspuren.** *Jeder Rückbau macht zusätzlich die Selbstprobe „Jeder
Suchtext kommt in seiner Datei genau einmal vor" rot — die Kopie trägt ja den
ersetzten Text; diese Zeile ist in der Spalte „rot" nicht mitgezählt.*

| Nr | Was zurückgebaut wird | rot | Die Zeile, auf die es ankommt |
|---|---|---|---|
| **544** | Die Regel kennt **nur das Alter** — der Boden fällt weg | **5** | *„Die Regel bei alle alt, aber unter dem Boden: nichts fällt"* und *„Der Boden von eins lässt die jüngste stehen, auch wenn sie alt ist"* |
| **545** | Die Regel kennt **nur die Zahl** — die Schere fällt weg | **12** | *„Die Regel bei mehr als N, aber alle jung: nichts fällt"*, *„Genau X Tage alt fällt nicht"* — und im Ordner fällt danach die Kopie von vorgestern |
| **546** | Die **Musterprüfung** fällt weg (an der Konstanten, also an beiden Stellen zugleich) | **15** | *„`notizen.txt` überlebt den Lauf"* und *„`kriterion-alt.sqlite.bak` überlebt den Lauf"* — **die gefährlichste Frage der Runde, namentlich rot.** *Und eine Zeile aus 0.8.70 schlägt mit an: „Eine liegengebliebene Arbeitsdatei zählt nicht als Sicherung"* |
| **547** | Die **zweite** Musterprüfung, unmittelbar vor dem `unlink` | **1** | *„Und das Entfernen prüft jeden Namen unmittelbar davor noch einmal"* — **am Verhalten stumm und deshalb am Quelltext geprüft**; die Namen kommen heute aus `sicherungsListe()` und sind dort längst geprüft |
| **548** | Die **Liste** folgt dem Symlink (`statSync` statt `lstatSync`) | **7** | *„Die Vorschau nennt genau die drei Kopien"* — der Verweis steht danach in der Vorschau |
| **549** | Das **Entfernen** folgt dem Symlink | **1** | *„Und es fragt mit `lstatSync` statt mit `statSync`"* — dieselbe Lage wie 547, dieselbe Begründung |
| **550** | Der Boden zählt die **veralteten** Kopien mit | **3** | *„Die Regel bei N Kopien, von denen zwei vor dem Schlüsselwechsel liegen: nichts fällt"* — **Entscheidung 5** |
| **551** | Nach der **gescheiterten** Sicherung wird doch aufgeräumt | **3** | *„Nach einer gescheiterten Sicherung wird nicht aufgeräumt"* — **Entscheidung 3, die wichtigste Zeile der Runde** |
| **552** | Das Aufräumen **reißt die gelungene Sicherung mit** | **3** | *„Und die Antwort bleibt die einer gelungenen Sicherung"* und *„Und hinter ihm steht kein Fehlerausgang mehr"* — Stolperstein 298 in derselben Gestalt |
| **553** | Der Schalter steht bei einer frischen Installation auf **AN** | **3** | *„Der Schalter steht bei einer frischen Installation auf AUS"* und *„Bei ausgeschaltetem Schalter räumt die Sicherung nichts weg"* |
| **554** | Die **Grenzen** halten nicht mehr am Server | **14** | dreizehn Absagen fallen weg, und *„die eingestellten Werte stehen unverändert auf 3 und 30"* wird rot |
| **555** | Die **Vorschau** rechnet mit einem anderen Boden als das Löschen | **1** | *„Mit Boden 5 treffen es nur noch zwei Kopien"* — zwei Wahrheiten über dasselbe |
| **556** | Die Löschroute nimmt einen **Dateinamen** aus dem Rumpf | **7** | *„Ein Rumpf mit Dateinamen ändert am Ergebnis nichts"* **und** *„Die Löschroute liest aus dem Rumpf genau ein Feld"* — Verhalten und Quelltext zugleich |
| **557** | Das Aufräumen läuft **ohne zweite Bestätigung** | **7** | *„Ohne zweite Bestätigung antwortet die Route mit 403"* — **und ein Wächter aus einer anderen Gruppe schlägt mit an:** *„Jede zweitbestätigte Route ruft die Bestätigung wirklich"* |
| **558** | Die Route fällt auf **`nurAdmin`** | **1** | *„Jede Route mit benanntem Wächter trägt ihn in der Routenzeile"* — `F_ROUTEN` kennt die Art, und die stimmt danach nicht mehr |
| **559** | Die entfernten Kopien stehen in **keinem Protokoll** mehr | **1** | *„Das Protokoll trägt eine Zeile je entfernter Kopie"* |
| **560** | `sicherung.weg` steht in **keiner Gruppe** des Filters | **1** | *„Jeder Vorgang steht in genau einer Gruppe des Filters"* |
| **561** | Die **Karte** fällt aus dem Systembereich | **38** | *„Und es sind wirklich zwanzig"* und die ganze Oberflächengruppe. **Dieser Rückbau hat den Lauf beim ersten Mal ABGERISSEN** — siehe unten |
| **562** | Die Karte steht schon beim **Admin** | **1** | *„Die Karte „Alte Sicherungen" steht nur beim Eigentümer"* |
| **563** | Eine Änderung am Feld rechnet die Vorschau **nicht** neu | **2** | *„Eine Änderung am Feld fragt die Vorschau neu am Server"* |
| **564** | Die Karte schickt die **Dateinamen** mit | **1** | *„Und der Rumpf trägt genau ein Feld, und das ist die Art"* |
| **565** | Der Knopf ist auch **ohne Treffer** bedienbar | **1** | *„Und der Knopf ist dann nicht bedienbar"* |
| **566** | Die Vorschauliste bekommt **keinen Deckel** | **2** | *„Die Liste trägt den gemeinsamen Deckel der Systemlisten"* |
| **437** | *(nachgezogen)* Der Schalter der Bildablage ist nur noch Adminsache | **3** | unverändert dieselben drei Zeilen wie vor der Runde — **der Suchtext ist mitgegangen, die Zusage nicht** |

> **VIERUNDZWANZIG GEFAHREN, KEINER STUMM.** *Und das ist bei einer Runde mit
> so vielen Rückbauten nicht selbstverständlich: elf Gegenproben ohne einen
> einzigen stummen sahen in 0.8.91 nach einem guten Ergebnis aus, und sieben
> nachgereichte brachten zwei stumme.*

> **EIN FUND, UND ER BETRIFFT DEN PRÜFSTAND SELBST: RÜCKBAU 561 HAT DEN LAUF
> ABGERISSEN.** Er nimmt die Karte aus `SYS_KARTEN`; **vier Zeilen der
> Oberflächenprüflage griffen danach auf `null`** —
> `getElementById('auf-los').dispatchEvent(…)` — und der Lauf endete mit
> *„Cannot read properties of null"* statt mit roten Punkten. **Ein Rückbau,
> der den Lauf abreißt, belegt nichts** (Stolperstein 161), und eine Prüflage,
> die einen Knoten erwartet und nicht bekommt, soll das **sehen** statt daran
> zu zerbrechen (Stolperstein 103). *Jeder Griff auf einen Knoten der Karte ist
> jetzt abgefangen; **nachgefahren wurde 561 danach eigens, und er faltet 38
> Prüfungen rot auf** — der Lauf bleibt dabei ganz.* **Gefunden hat das nicht
> der Prüfstand, sondern die Gegenprobe** — genau dafür gibt es sie.

---

## 7. Neue Stolpersteine — 299 und 300

**299. EINE LÖSCHREGEL BRAUCHT ZWEI BEDINGUNGEN; JEDE EINZELNE IST IN GENAU DER
LAGE FALSCH, IN DER SIE GEBRAUCHT WIRD.** *Der Fehler ist nicht, die falsche
Bedingung zu wählen; der Fehler ist, sich für **eine** zu entscheiden.* Beide
Rückbauten dazu (544 und 545) nehmen je eine weg, und beide sind rot.

**300. EINE ROUTE, DER MAN SAGEN KANN, WAS SIE LÖSCHEN SOLL, IST AUCH MIT
PRÜFUNG DIE GEFÄHRLICHSTE DER ANWENDUNG.** *Nicht, weil die Prüfung heute
fehlte — sondern weil sie einen Handgriff davon entfernt steht, vergessen zu
werden.* **Der Ausweg ist baulich:** die Route bekommt die Art, nicht die Namen.
**Und die zweite Prüfung desselben Namens unmittelbar vor dem `unlink` ist keine
Verdopplung**, sondern die Klemme an der Stelle, an der der Fehler wehtut.

---

## 8. Zwei Zahlen der Ausarbeitung, berichtigt

**`MERKMALE` STEHT BEI VIERZEHN UND NICHT BEI DREIZEHN.** Der Auftrag schrieb
*„`MERKMALE` ist eine geschlossene Liste und bleibt bei dreizehn"* — sie ist mit
0.13.0 auf vierzehn gewachsen (`teil`). **Die Aussage der Zeile stimmt trotzdem:
sie bleibt, wo sie ist**, nur eben bei vierzehn. *Der Prüfstand hat sie die
ganze Zeit richtig geprüft — genau dafür steht die Zahl dort und nicht nur im
Papier (Stolperstein 137).*

**DIE ZEILE „AKTUELL 69 ROUTEN" IN ABSCHNITT 11 DES PROJEKTSTANDS WAR ZWEI
RUNDEN ALT.** 0.19.0 brachte sie auf 70, 0.20.0 auf 71. **Sie ist mit dieser
Runde berichtigt.** *Dieselbe Lehre, andersherum: eine Zahl, die nur in einem
Papier steht, läuft weg — und der Prüfstand hat sie nie gedeckt, weil er `F_ROUTEN`
liest und nicht den Projektstand.*

---

## 9. Was ausdrücklich NICHT gebaut ist

- **KEINE ZEITSTEUERUNG.** Kriterion hat keinen Scheduler und bekommt für diese
  eine Sache keinen. *Aufgeräumt wird im Anschluss an eine Sicherung oder auf
  Knopfdruck — sonst nie.*
- **KEIN AUFRÄUMEN VON `*.wird`-DATEIEN.** Eine angefangene Kopie entsteht nur,
  wenn der Server mitten im `VACUUM INTO` stirbt; sie fällt aus
  `SICHERUNG_MUSTER`, und **eine Regel, die zwei Muster kennt, ist zwei
  Regeln.** *Was dabei baulich schon wahr ist: eine halbfertige Kopie trägt NIE
  den endgültigen Namen und kann deshalb selbst dann nicht als fertige
  Sicherung gelesen werden, wenn niemand sie wegräumt.*
- **KEIN LÖSCHEN EINZELNER KOPIEN PER KLICK.** Das wäre die Route mit
  Dateinamen, die Stolperstein 300 ausschließt.
- **KEIN VERSCHIEBEN, KEIN AUSLAGERN, KEIN ZWEITER ORT.** Ein „Archiv" wäre
  eine zweite Ortsprüfung und eine zweite Wahrheit über den Sicherungsort.
- **NICHTS AN `VACUUM INTO` SELBST.** Der Schreibweg bleibt Zeile für Zeile,
  wie er ist.

---

## 10. Was offen geblieben ist

- **Angefangene Kopien (`*.wird`)** bleiben liegen (Abschnitt 9).
- **Eine einzelne Kopie per Klick löschen** — bewusst nicht gebaut, mit
  Begründung.
- **Wie viel Platz die Regel im echten Bestand freigibt, ist nicht gemessen.**
  *Die Rechnung ist trivial — jede Kopie ist so groß wie die Datenbank —, aber
  wie viele Kopien am Wirt liegen und wie alt sie sind, weiß nur die laufende
  Installation.* **Die Vorschau in der Karte ist genau die Antwort darauf.**
- **Die vollständige Liste der Kopien steht nirgends.** *Die Karte „Sicherung"
  nennt die jüngste und die Zahl, die Karte „Alte Sicherungen" die, die fallen
  würden.* **Ein Betreiberwunsch vom 3. September zielt darauf** — er steht als
  **Punkt 9** im Sammelblatt, samt der Messung, dass eine **verschlüsselte**
  Sicherung sich nicht packen lässt.
- **Die übrigen Zeichenwege der Detailansicht** tragen die Wache aus 0.19.6
  nicht *(aus 0.19.6)*.
- **Die Übersicht kann eine Fassung zu alt sein**, wenn man während des
  Speicherns eines Ausschnitts wechselt *(aus 0.19.5)*.
- **`reclaim()` hat weiterhin keine greifende Gegenprobe** *(aus 0.19.3)*.
- **Der volle Gegenprobenlauf** über alle 558 Rückbauten — rund vierzig Stunden.

---

## 0.20.0 — Fingerprint `12421721`

**ZULETZT GEBILDET**, nach der letzten Änderung an einer ausgelieferten Datei —
die Versionsnummer in `package.json` eingeschlossen, und `package-lock.json`
trägt sie ein zweites Mal. **`public/` gehört dazu** (Stolperstein 158).

**Abgeholt von einer laufenden Instanz** über `GET /api/stats` und nicht
nachgerechnet: `12421721` bei Version `0.20.0`.

> **IM FELD NOCH NICHT BESTÄTIGT.** Der Sollwert steht hier; was die laufende
> Installation meldet, gehört daneben, sobald sie es gemeldet hat.
