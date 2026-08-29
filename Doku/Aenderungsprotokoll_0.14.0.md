# Änderungsprotokoll 0.14.0 — „Die Entscheidung wird mitgeschrieben"

**Version 0.14.0 · gebaut am 29. August 2026 · Fingerprint `ca8bcf31` ·
4262 Prüfungen · 249 Rückbauten in `gegenprobe.js`**

---

**Das Häkchen „abgelehnt" ist zu einer Aussage geworden** — mit **Datum**,
**Grund** und **Verfasser**. Damit hält die Anlage endlich auch ihr Ergebnis
fest, nicht bloß den Weg dorthin. *Dazu zwei Befunde aus dem Betrieb, die
nichts damit zu tun haben und trotzdem mitgefahren sind: ein kaputter
Cookiewert sperrte einen Browser aus, und die Sternreihen der Kriterienliste
standen nicht auf einer Linie.*

> **DIESE RUNDE IST EINE DATENBANKSTUFE.** Sie fasst das Schema an: drei neue
> Spalten an `items`, **Migrationsblock `MIGRATION 0.14.0`** — der **sechste**,
> und der erste seit 0.8.50 —, **Austauschformat von 10 auf 11**.
> **DIE SICHERUNG DES DATENVERZEICHNISSES IST VOR DEM EINSPIELEN PFLICHT UND
> NICHT EMPFEHLUNG.** Bei den letzten fünf Runden stand dort „Empfehlung"; bei
> einem Migrationsblock ist das falsch.

> **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.14.0 ist **MINOR**, und die
> Frage dahinter ist die übliche: *kann die Anlage danach etwas, was sie vorher
> nicht konnte?* **Ja** — festhalten, wann, warum und von wem abgelehnt wurde.
> Das ist keine Fehlerbereinigung, sondern eine Fähigkeit, die es vorher nicht
> gab. **Keine neue Zeile in der `.env`, keine neue Abhängigkeit, `F_ROUTEN`
> unverändert bei 69.**

> **DAS RISIKO DIESER RUNDE LAG NICHT IN DER FUNKTION, SONDERN IM
> MIGRATIONSBLOCK.** Die Funktion selbst ist klein: drei Spalten, ein Feld im
> Dialog, eine Zeile an der Marke. Der Block, der die Spalten in eine
> bestehende Datenbank nachrüstet, ist der Teil, bei dem ein Fehler Daten
> kostet. **Er ist an einer nachgebauten Datenbank aus 0.13.2 gefahren, einmal
> ganz, einmal je Spalte einzeln und zweimal hintereinander** — und dabei hat
> sich eine Antwort ergeben, die noch in keinem Papier stand (Abschnitt 3).

---

## Inhalt

1. [Der kaputte Cookiewert — und warum er mitgefahren ist](#1-der-kaputte-cookiewert--und-warum-er-mitgefahren-ist)
2. [Drei Spalten und der Migrationsblock](#2-drei-spalten-und-der-migrationsblock)
3. [Was SQLite bei `ADD COLUMN … REFERENCES` wirklich tut](#3-was-sqlite-bei-add-column--references-wirklich-tut)
4. [Der Grund wird eingegeben und angezeigt](#4-der-grund-wird-eingegeben-und-angezeigt)
5. [Die Klemme an der Begründung](#5-die-klemme-an-der-begründung)
6. [Das Austauschformat geht auf 11](#6-das-austauschformat-geht-auf-11)
7. [Die Sternreihe steht auf einer Linie](#7-die-sternreihe-steht-auf-einer-linie)
8. [Die fünf Entscheidungen](#8-die-fünf-entscheidungen)
9. [Was je Datei geändert wurde](#9-was-je-datei-geändert-wurde)
10. [Der Prüfstand](#10-der-prüfstand)
11. [Gegenproben](#11-gegenproben)
12. [Neue Stolpersteine](#12-neue-stolpersteine)
13. [Die Zahlen](#13-die-zahlen)
14. [Was ausdrücklich nicht passiert ist](#14-was-ausdrücklich-nicht-passiert-ist)
15. [Nachlese: die beiden Feldbelege](#15-nachlese-die-beiden-feldbelege)
16. [Offen geblieben](#16-offen-geblieben)

---

## 1. Der kaputte Cookiewert — und warum er mitgefahren ist

**Der Befund stammt aus dem Gegenlesen zu 0.13.0 und ist älter als jede Runde
dieses Jahres.** `parseCookies()` in `auth.js` rief `decodeURIComponent()` auf
**jeden** Wert:

```
Cookie: kriterion_session=%   →   URIError: URI malformed
```

**Die Funktion sieht ALLE Cookies des Hosts an, nicht nur die eigenen.** Ein
fremder Cookie mit einem `%` im Wert genügte — gesetzt von irgendeiner anderen
Anwendung auf demselben Namen oder von Hand. `requireAuth` ruft die Funktion
bei **jeder geschützten Anfrage**; der Fehler-Handler machte daraus eine
**500**, und dieser eine Browser kam nicht mehr herein, bis jemand den Cookie
löschte. *Die Zeile stammt aus Commit `158b6d9` und ist von 0.13.0 bis 0.13.2
nicht berührt worden.*

**Gebaut ist die kleine Fassung:** die Schleife überspringt einen Wert, der
sich nicht dekodieren lässt, statt abzubrechen. **Der Name bleibt roh, der Wert
wird versucht** — ein Cookie, dessen Wert nicht dekodierbar ist, ist für diese
Anlage kein Cookie. **Und er fällt einzeln heraus, nicht als ganzer Kopf:**
neben dem kaputten steht der eigene, gültige, und genau der soll ankommen.

**Was ausdrücklich NICHT gebaut ist:** ein eigener Fehlerpfad, eine Meldung an
den Benutzer, eine Zeile im Sicherheitsprotokoll. *Ein fremder Cookie ist kein
Vorgang dieser Anlage.*

### Die Entscheidung: mitfahren statt 0.13.3

**Gefragt war, ob dieser Punkt als eigene PATCH-Runde vorab hinausgeht.** Er
ist mitgefahren, aus drei Gründen:

1. **Er wäre nicht früher draußen gewesen.** Der Weg auf den Wirt führt über
   den Merge des Arbeitsbranches, und dieser Chat entwickelt auf **genau
   einem** Branch. Eine 0.13.3 hätte denselben Merge gebraucht wie 0.14.0 und
   wäre im selben Augenblick angekommen — der Gewinn des Vorziehens („ein
   ausgesperrter Browser wartet sonst eine ganze MINOR-Runde") wäre hier
   keiner gewesen.
2. **Der Papierweg hätte sich verdoppelt.** Eigenes Änderungsprotokoll,
   Umbenennung des Projektstands auf `0_13_3`, CHANGELOG-Eintrag, README,
   Fingerprint — und danach dasselbe noch einmal für 0.14.0. Drei Zeilen Code
   gegen zwei volle Papierwege.
3. **Der Fahrplan sagt „keine Beifracht", und das meint Umfang.** Punkt 1
   fasst weder Schema noch Format noch Oberfläche an; er ist drei Zeilen in
   einer Funktion. Er ist Beifracht im Wortsinn, aber keine, die die
   Schema-Runde belastet.

*Dagegen sprach nur eines, und es ist ehrlich zu nennen: ein Fehler in der
Verfügbarkeit hätte einen eigenen, sichtbaren Eintrag verdient. Er hat ihn
stattdessen hier — als erster Abschnitt und nicht als Fußnote.*

### Die Prüflage

**Eine Prüflage mit einem gültigen Cookie belegt nichts.** Sie trägt deshalb
**einen zweiten Cookie mit kaputtem Wert neben dem gültigen** — und zwar in
**beiden Reihenfolgen**, denn der kaputte darf den gültigen weder überholen
noch verdecken. Dazu die Gegenlage: ein kaputter Wert am **eigenen**
Cookienamen liefert **401** und nicht 500 — er wird übergangen, nicht
angenommen. *Und dass der gestellte Wert wirklich unlesbar ist, sagt
`decodeURIComponent` selbst und nicht der Server (Befund B aus 0.12.0).*

---

## 2. Drei Spalten und der Migrationsblock

An `items` sind dazugekommen:

| Spalte | Typ | Bedeutung |
|---|---|---|
| `rejected_at` | `TEXT` | **wann** abgelehnt wurde |
| `rejected_grund` | `TEXT` | **warum**, eine Zeile Text |
| `rejected_von` | `INTEGER REFERENCES users(id) ON DELETE SET NULL` | **wer** es entschieden hat |

**`rejected` selbst bleibt, wie es ist.** *Ein zweites Feld „Ergebnis" daneben
wären zwei Wahrheiten über dieselbe Sache (Stolperstein 47). Das vorhandene
Merkmal bekommt, was ihm fehlt — mehr nicht.*

**Alle drei sind nullbar, und das ist keine Bequemlichkeit:** eine Ablehnung
aus einer Anlage vor 0.14.0 kennt weder Datum noch Verfasser, und ein
erfundener Wert wäre schlimmer als ein leerer. Ein Grund ist außerdem
freiwillig.

**`rejected_von` steht auf `ON DELETE SET NULL` wie die sechs vorhandenen
Träger** (Stolperstein 54) — **damit sind es sieben solche Spalten am Bestand.**
*Genau gesagt bleiben es sechs TRÄGER: `items`, `comments`, `test_days`,
`ratings`, `links` und `attachments` sind Zeilen, die jemandem gehören.
`rejected_von` ist keine Eigentumsangabe, sondern der Name unter einer
Entscheidung an einer Zeile, die schon einen Verfasser hat.* Ein entfernter
Zugang nimmt die Entscheidung nicht mit, nur seinen Namen davon; im Normalfall
bleibt er als **Grabstein** stehen, und die Marke zeigt dann „Gelöschter
Benutzer 7".

### Die Bauform des Blocks

**Die DDL bleibt der Ort der Wahrheit** (`db.js`), und die Spalten brauchen
trotzdem einen Migrationsblock: `CREATE TABLE IF NOT EXISTS` rührt eine
vorhandene Tabelle nicht an (Stolperstein 13). Der Block trägt die Marke
`// MIGRATION 0.14.0 — ENTFAELLT MIT 1.0` wie seine fünf Vorgänger. **Damit
sind es sechs.**

* **Jede Spalte wird EINZELN gefragt**, nicht der Block als Ganzes. Ein Block,
  der beim Vorhandensein der ersten Spalte zurückkehrt, ließe die zweite und
  dritte für immer fehlen.
* **Alle drei `ALTER TABLE` laufen in EINER `db.transaction()`.** Ohne sie
  überlebt bei einem Abbruch die erste Spalte und die übrigen fehlen.
* *Die Transaktion verhindert den Riss, die Einzelabfrage überlebt ihn — nur
  das Zweite hilft gegen einen Riss, der in einer früheren Version entstanden
  ist* (Stolperstein 108).

**KEIN nachgeschobenes UPDATE, und das ist entschieden und nicht vergessen.**
Eine Ablehnung aus einem Bestand vor dieser Version hat kein Datum, keinen
Grund und keinen Verfasser — **diese Anlage weiß sie nicht.** Jeder gesetzte
Wert wäre erfunden, und *„abgelehnt am Tag der Einspielung von dem, der
eingespielt hat"* wäre die schlimmste Erfindung von allen: sie sähe aus wie
eine echte Angabe. Die drei bleiben leer, und die Marke zeigt dann genau so
viel, wie bekannt ist.

**Was der Block ins Protokoll schreibt:**

```
[Kriterion] items um rejected_at, rejected_grund und rejected_von ergaenzt
(Migration auf 0.14.0); 1 bereits abgelehnte Eintrag steht ohne Datum, Grund
und Verfasser da.
```

*Die Zahl am Ende ist keine Zierde: sie sagt dem Betreiber, wie viele
Ablehnungen in seinem Bestand von nun an sichtbar unvollständig dastehen.*

**Das Auffangnetz `ordneBestandZu()` fasst `rejected_von` ausdrücklich NICHT
an.** Dort geht es um `user_id` und um die Frage, wem eine herrenlose Zeile
gehört. `rejected_von` ist keine Eigentumsangabe, sondern der Name unter einer
Entscheidung — sie dem Eigentümer zuzuschieben setzte seinen Namen unter eine
fremde Aussage. *Ein Wächter im Prüfstand hält das fest.*

---

## 3. Was SQLite bei `ADD COLUMN … REFERENCES` wirklich tut

**Stolperstein 105 stellt für die Vorgabe eine Frage, die für den
Fremdschlüssel selbst offen war:** verhält sich ein `REFERENCES` in einem
`ALTER TABLE … ADD COLUMN` wie eines in der DDL? **Nachgemessen, nicht
abgeschrieben** — an der verschlüsselten Datenbank, über eine geschlossene und
wieder geöffnete Verbindung, SQLite 3.49.2:

| Frage | Antwort |
|---|---|
| Geht `ADD COLUMN … REFERENCES … ON DELETE SET NULL` ohne Vorgabe? | **ja** |
| Steht der Schlüssel danach in `PRAGMA foreign_key_list`? | **ja**, mit `on_delete: SET NULL` |
| Greift `ON DELETE SET NULL` beim Löschen des Ziels? | **ja** |
| Auch über eine neue Verbindung hinweg? | **ja**, `foreign_key_check` bleibt leer |
| Wird eine Nummer abgewiesen, die es nicht gibt? | **ja**, `FOREIGN KEY constraint failed` |
| Steht die Definition im gespeicherten Schematext? | **ja** — SQLite hängt sie an das `CREATE TABLE` an |

**Die kurze Antwort lautet: ja, er verhält sich wie einer aus der DDL.** Der
Prüfstand vergleicht deshalb nicht den Text, sondern das **Verhalten** der
migrierten Anlage gegen das der frischen — und beide sind gleich
(Stolperstein 106).

### Und dabei ist etwas Neues aufgefallen

**Stolperstein 105 sagt, `ADD COLUMN … REFERENCES` mit einer Vorgabe ungleich
NULL werde abgewiesen. Das stimmt — aber nur, solange die Tabelle Zeilen
hat.** Nachgemessen:

| Lage | `ALTER TABLE t ADD COLUMN v INTEGER NOT NULL DEFAULT 0 REFERENCES users(id)` |
|---|---|
| Tabelle **leer** | **geht durch** — der Fremdschlüssel steht danach korrekt in `foreign_key_list` |
| Tabelle mit **einer** Zeile | `Cannot add a REFERENCES column with non-NULL default value` |
| Zeile eingefügt und wieder gelöscht | **geht durch** — es zählt der aktuelle Bestand, nicht die Geschichte |

**Das ist eine Falle mit Ansage** und der Grund, warum die Prüflagen dieser
Runde **mit Einträgen** arbeiten und nicht mit einer leeren Tabelle: *eine
Migration, die nur an einer leeren Tabelle gefahren wird, ist gar nicht
gefahren.* Sie ist als **Stolperstein 202** aufgenommen und im Prüfstand
festgehalten — beide Lagen, nebeneinander.

*Für den Block dieser Runde ändert es nichts: `rejected_von` trägt keine
Vorgabe, und deshalb geht es in jedem Fall.*

---

## 4. Der Grund wird eingegeben und angezeigt

**Vorher** saß „abgelehnt" als Schalter in der Detailansicht (`sw-rej-t`) und
schickte unmittelbar `PUT /api/items/:id` mit `{ rejected: … }`.

**Jetzt:**

* **Beim Einschalten erscheint ein Feld für den Grund** — offen im Dialog,
  nicht hinter einem Aufklappen. *Ein Feld, das man erst suchen muss, bleibt
  leer.* Gespeichert wird beim Verlassen des Feldes und mit Enter, wie Titel
  und Beschreibung daneben; **unverändert wird nichts geschickt**, sonst schöbe
  jedes Anklicken den Eintrag über `updated_at` in jeder Übersicht nach oben.
* **Die Marke ist eine Aussage:** *„Abgelehnt am 14.03.2026, 09:12 von Anna —
  Lieferzeit über 6 Monate."* Sie steht als eigene Zeile unter dem Schalter,
  in derselben Form und mit derselben Klasse wie „Angelegt von … am …".
  *Ein Satz IM Knopf risse ihn bei 120 Prozent Schrift über die Zeile.*
* **Jedes der drei darf fehlen, und die Zeile setzt sich aus dem zusammen, was
  da ist.** Ohne Datum und ohne Namen steht der Grund allein da; „von Ohne
  Verfasser" steht ausdrücklich nicht dabei — das wäre eine Behauptung über
  jemanden, den diese Anlage nicht kennt.
* **Ist gar nichts bekannt, bleibt die Zeile weg.** Sie sagte sonst
  „Abgelehnt" — dasselbe, was der Schalter darüber schon sagt.
* **Am Grabstein steht kein Name**, sondern „Gelöschter Benutzer 7". Die
  Abbildung von der Nummer auf den Namen ist eine Stelle (`verfasserName`) und
  kein zweiter Weg.
* **Bei genau einem Zugang fällt der Name weg** — wie an jeder anderen
  Verfasserangabe: es gibt nur einen, und „von pruefer" sagt nichts. **Datum und
  Grund bleiben dabei stehen**; sie sind der *Inhalt* der Entscheidung und keine
  Angabe über eine Person. *Deshalb fällt hier der Name weg und nicht die ganze
  Zeile — sonst verlöre eine Anlage mit einem Zugang genau das, wofür diese
  Runde gebaut ist.*
* **In der Kachelansicht bleibt die Marke, wie sie war.** Die Übersicht trägt
  weiterhin `abgelehnt` und **keine** der drei Angaben. *`rejected_von` MUSS
  dort weg und nicht nur darf: es wäre eine nackte Zugangsnummer in einer
  Antwort an jeden.*

**Der Text ist eine Zeile, und das wird durchgesetzt:** Weißraum eingeebnet,
außen getrimmt, bei **200 Zeichen** gekappt (`GRUND_LAENGE`, dieselbe Zahl wie
am Suchbegriff einer gespeicherten Ansicht). *Das Einebnen ist der Punkt: ein
eingefügter Absatz risse die Marke.*

---

## 5. Die Klemme an der Begründung

**Vorher** stand `rejected` in `NUR_VERFASSER_FELDER` und lief damit über
`darfAendern` — **Verfasser oder Admin**. Wer die Begründung hinschreibt, ist
also nicht zwingend der Verfasser des Eintrags.

**Die Regel lautet jetzt: zurücknehmen darf das Merkmal, wer den Eintrag
ändern darf; umschreiben darf die Begründung nur, wer sie getroffen hat.** Das
ist `nurSelbst` — *„Löschen ja, umschreiben nein"* —, angewandt auf ein Feld,
das nicht dem Verfasser des **Eintrags** gehört, sondern dem der
**Entscheidung**. **Es ist eine Verschärfung gegenüber 0.13.2.**

**Die Klemme hat zwei Hälften, und beide sind nötig:**

* **grob:** `rejectedGrund` steht in `NUR_VERFASSER_FELDER` — an die Begründung
  kommt überhaupt nur, wer den Eintrag ändern darf.
* **fein:** im Rumpf der Route entscheidet `nurSelbst(req, it.rejected_von)`.

*Ohne die grobe Hälfte könnte jeder Angemeldete an einem Eintrag, dessen
Ablehnung noch keinen Verfasser trägt, eine Begründung hinsetzen.*

**Zwei Fälle kommen durch, und beide sind keine fremde Aussage:**

1. **Wer gerade ablehnt**, schreibt seine eigene Begründung — er wird in
   diesem Zug `rejected_von`.
2. **Steht gar kein Verfasser da**, gibt es auch keine fremde Aussage. Das ist
   der Fall einer Ablehnung aus einer Anlage vor 0.14.0. **Ohne diesen Zweig
   bekäme so eine Ablehnung nie eine Begründung**, denn `nurSelbst(null)` ist
   für jeden falsch (Stolperstein 204).

**Der Weg über Aus und wieder Ein bleibt offen, und das ist dieselbe Regel und
kein Loch:** eine fremde Entscheidung **zurücknehmen** darf, wer den Eintrag
ändern darf. Wer sie danach neu trifft, trifft eine **eigene** — mit eigenem
Datum, eigenem Namen und eigenem Text.

### Die Prüflage braucht vier Zugänge, nicht zwei

*Mit zwei ließe sich „Verfasser des Eintrags" von „Verfasser der Begründung"
gar nicht unterscheiden, und jede Prüfung darauf bliebe grün, auch wenn überall
`darfAendern` stünde.*

| Zugang | Rolle | Wofür er dasteht |
|---|---|---|
| **anna** | Eigentümerin (und damit Admin) | der Admin, der **weder** den Eintrag geschrieben **noch** die Begründung getroffen hat |
| **bert** | Benutzer | **Verfasser des Eintrags** — darf ihn ändern und die Begründung trotzdem nicht umschreiben |
| **carla** | Admin | **die Ablehnende** — Verfasserin der Begründung |
| **dora** | Benutzerin | die Fremde |

**Zu jeder Verweigerung gehört der Erfolgsfall daneben und die Nachschau in der
Datenbank.** *Ein 403, nach dem der Text trotzdem umgeschrieben ist, wäre das
Schlimmste.*

### Stolperstein 201: welche vorhandene Prüfung hielt die alte Regel fest?

**Nachgesehen, nicht angenommen: keine.** `rejected_grund` gab es vor dieser
Runde nicht, also konnte auch keine Prüfung eine Entscheidung darüber
festhalten. Was es gab, war eine Zeile, die den **Umfang** von `items`
festschrieb — *„items trägt unverändert genau seine zehn Spalten"* aus der
Papierkorbrunde. **Sie hat getan, wofür sie dasteht**, ist rot geworden und
nachgezogen: dreizehn Spalten, und eine zweite Zeile daneben sagt jetzt
ausdrücklich, dass keine davon ein **Zustand** neben dem Papierkorb ist.

---

## 6. Das Austauschformat geht auf 11

`AUSTAUSCH_FORMAT` steht auf **11**. Die drei neuen Felder gehen mit hinaus und
wieder hinein:

```json
"rejected_at": "2026-03-14 09:12:00",
"rejected_grund": "Lieferzeit über 6 Monate",
"rejected_author": "carla"
```

* **`rejected_author` wandert als NAME hinaus, nicht als Nummer** — über
  dieselbe Karte wie jeder andere Verfasser in dieser Datei
  (`verfasserNamen()`). *Eine Zugangsnummer bedeutet in einer fremden Anlage
  etwas anderes.*
* **Ein fehlender Name bleibt beim Einspielen leer und fällt ausdrücklich
  NICHT an den Einspielenden.** `verfasser()` tut das mit gutem Grund — eine
  Zeile ohne Verfasser wäre herrenlos —, doch hier gibt es die Zeile auch ohne:
  ein Eintrag, den niemand abgelehnt hat, hat keinen Ablehnenden. *Wer hier
  zurückfiele, machte aus **jedem** eingespielten Eintrag eine Ablehnung durch
  den Einspielenden.* Ein **genannter, aber unbekannter** Name fällt dagegen
  sehr wohl an ihn und wird in der Antwort genannt — dieselbe Regel wie überall
  sonst.
* **Die drei gehen auch mit, wenn `rejected` falsch ist.** Beim Zurücknehmen
  löscht der Server sie nicht, und eine Datei, die sie dann wegließe, nähme dem
  Ziel genau die Angabe, die die Quelle noch hat.
* **Eine Datei der Nummer 10 bleibt einspielbar** — dieselbe Zusage wie bei
  jedem Formatsprung davor. Die drei Felder fehlen dann und bleiben leer.
  *Entschieden wird über das Vorhandensein der Felder und nicht über die
  Nummer; die Nummer ist in diesem Format eine Aussage und keine Bedingung.*

**Der Rundlauf ist geprüft, Feld für Feld:** hinaus aus der einen Anlage,
hinein in eine **zweite**, in der es `carla` ebenfalls gibt — und dort kommen
Datum, Grund und der Name wieder heraus. *Ein Format, dessen Rundlauf nicht
geprüft ist, ist eine Behauptung.*

---

## 7. Die Sternreihe steht auf einer Linie

**Befund aus dem Betrieb vom 29. August 2026.** In der Kriterienliste eines
Eintrags steht rechts die eigene Sternreihe und daneben der Schnitt,
`⌀ 3,0 (2)`. **Eine Zeile, die noch niemand bewertet hat, trug dort nichts —
und ihre Sterne rutschten dadurch nach rechts.**

**Die Ursache stand seit langem im Stilblatt:**

```css
.rrow .ravg { … min-width: 52px; text-align: right; }
```

*Der Kommentar darüber sagte sogar, wozu die Zahl da war: „Feste
Mindestbreite: sonst wackelt die Sternreihe, sobald eine Zeile keine Zahl
hat."* **Die Absicht war richtig, die Zahl war zu klein** — und sie war eine
feste Pixelzahl in einer Anlage, die ihre Schrift von 80 bis 120 Prozent
stellt. *Dasselbe Muster wie Befund A aus 0.12.1 (`right: 92px`) und wie die
Ausrichtung, die 0.13.1 in Ordnung gebracht hat.*

### Nachgemessen in Chromium 141, drei Schriftgrößen

**Vier Kriterienzeilen: zwei mit gleich langer Zahl, eine ohne Zahl, eine mit
`⌀ 5,0 (128)`.** Gemessen wurde der linke Rand der Sternreihe, an einem 520 px
breiten Kasten mit dem echten Stilblatt.

> **DIE ABSOLUTEN WERTE UNTERSCHEIDEN SICH VON DENEN IM AUFTRAG, DIE
> UNTERSCHIEDE NICHT.** Dort war der Kasten breiter, also liegt die ganze Reihe
> weiter rechts. **Was zählt, ist der Abstand zwischen den Zeilen** — und der
> stimmt Zahl für Zahl: 0 px bei 80 %, 13,0 px bei 100 % und 26,0 px bei 120 %
> zwischen der leeren Zeile und `⌀ 3,0 (2)`, und 14,5 px bei 100 % zwischen
> `⌀ 3,0 (2)` und `⌀ 5,0 (128)`. *Der Befund ist damit unabhängig
> nachgestellt und nicht abgeschrieben.*

| Schrift | Zeile mit `⌀ 3,0 (2)` | Zeile **ohne** Zahl | Zeile mit `⌀ 5,0 (128)` | Spanne |
|---|---|---|---|---|
| 80 % | 386,5 px | 386,5 px | 374,9 px | **11,6 px** |
| 100 % | 357,3 px | 370,3 px | 342,8 px | **27,5 px** |
| 120 % | 328,2 px | 354,2 px | 310,9 px | **43,3 px** |

**Bei 80 Prozent stimmte die leere Zeile zufällig** — dort ist der Text genau
52 px breit; **die lange Zahl wich trotzdem ab.** *Die Zahl war einmal richtig
und wuchs seither auseinander.*

**Nachher, dieselbe Lage, dieselben drei Schriftgrößen:**

| Schrift | alle vier Zeilen | Spanne |
|---|---|---|
| 80 % | 374,9 px | **0,0 px** |
| 100 % | 342,8 px | **0,0 px** |
| 120 % | 310,9 px | **0,0 px** |

### Der Weg: das Raster, nicht die größere Zahl

**Entschieden wurde (b) — der ganze Block wird EIN Raster.** *Begründung in
Abschnitt 8.*

```css
.rlist { display: grid; grid-template-columns: 1fr auto auto; }
.rrow  { display: contents; }
.rrow > * { padding: 9px 0; border-bottom: 1px solid var(--line-2); }
.rrow:last-of-type > * { border-bottom: none; }
```

**Im Stilblatt steht an der Zahlenspalte keine Breite mehr, und es kann auch
keine mehr hin.**

**Der Preis war die Trennlinie**, und er ist bezahlt: eine Zeile mit
`display: contents` ist kein Kasten mehr und kann keine tragen. Sie wird jetzt
an den **Zellen** gezogen — **ohne Spaltenabstand am Raster**, denn ein `gap`
risse die Linie in Stücke; der Abstand sitzt als Innenabstand **in** den
Zellen. **Und ohne `align-items: center` am Raster**: zentrierte Zellen wären
unterschiedlich hoch, und die drei Linienstücke lägen auf drei Höhen.
*Nachgemessen: Lücken zwischen den Zellen 0 px, gleiche Unterkante bei allen
drei, Sternmitte 0,5 px neben der Zeilenmitte (Glyphenmaß, nicht Layout).*

**Die Durchschnittsspalte hängt dafür an der Zeile statt in `.racts`.** Nur so
ist sie eine Rasterzelle; in `.racts` wäre sie wieder nur so breit wie ihr
eigener Inhalt.

### Der Blick daneben — nachgesehen und verneint

**Dieselbe Spalte gibt es in der Ansicht „Wer hat bewertet" und im Vergleich
(`.cmp-crit`). Das Muster steht dort NICHT**, und das ist gemessen und nicht
angenommen:

* **Vergleich:** die Werte stehen rechtsbündig am Rand (`space-between`); ihre
  rechten Kanten liegen bei allen Zeilen auf **derselben** Stelle (300 px in
  der Messlage, alle drei Schriftgrößen). Es steht nichts rechts von ihnen, das
  geschoben werden könnte, und keine feste Breite im Stilblatt.
* **„Wer hat bewertet":** dort gibt es **gar keine** Durchschnittsspalte — der
  Name steht als Block über den Stimmen. Null `.ravg`-Zellen in der Prüflage.

*Ein Wächter im Prüfstand hält beides fest, damit aus dem „nicht nötig" nicht
irgendwann ein „vergessen" wird.*

**Was NICHT gebaut ist:** ein Text wie „noch keine Bewertung" in der leeren
Spalte. *Neben fünf leeren Sternen wäre das dieselbe Aussage zweimal.*

---

## 8. Die fünf Entscheidungen

> **DER AUFTRAG NENNT SIE AN ZWEI STELLEN VERSCHIEDEN — „vier" in der
> Schlussliste, „DIE FÜNF ENTSCHEIDUNGEN" in der Überschrift darüber.**
> Beantwortet sind hier **fünf**: die vier zur Ablehnung und die aus Punkt 6.
> *Eine Antwort zu viel ist billiger als eine zu wenig.*

### (1) `rejected_grund` beim Zurücknehmen: **behalten**

**Beim Ausschalten wird nichts gelöscht** — Datum, Grund und Verfasser bleiben
in der Zeile stehen. *Eine Angabe, die niemand wiederherstellen kann, wird
nicht weggeworfen, nur weil ein Schalter umgelegt wird.*

**Und daraus folgt der zweite Teil, der nicht in der Frage stand, aber aus ihr
folgt: die drei Angaben werden ZUSAMMEN geschrieben.** Beim Einschalten setzt
der Server alle drei — Datum auf jetzt, Verfasser auf den Handelnden, Grund auf
das, was im Rumpf steht; **fehlt er dort, wird er leer.** *Sonst trüge die neue
Entscheidung den Satz einer anderen Person unter neuem Namen — genau das, was
die Klemme aus Abschnitt 5 verhindern soll.* **Die Oberfläche schickt die alte
Begründung beim Einschalten deshalb mit**, und sie steht danach im Feld zum
Überschreiben: *das ist der Vorschlag, und keine Übernahme im Stillen.*

### (2) Der Grund ist **freiwillig**

**Ein Pflichtfeld erzieht, ein freiwilliges bleibt leer** — beides stimmt. Den
Ausschlag gibt, was ein Pflichtfeld wirklich erzeugt: „x", „—", „keine
Angabe". *Das sieht aus wie eine Angabe und ist keine, und es ist schlimmer als
ein leeres Feld, weil es sich nicht mehr von einer echten unterscheiden lässt.*
**Eine Ablehnung ohne Grund ist außerdem immer noch eine Entscheidung, die es
wert ist, datiert und unterschrieben zu werden.** Dafür steht das Feld offen im
Dialog und nicht hinter einem Aufklappen.

### (3) Keine Zeile im Sicherheitsprotokoll

**`VORGAENGE` bleibt bei zwanzig.** Der Vorgang wäre zulässig, der Text nicht —
und trotzdem kommt auch der Vorgang nicht hinein. **Drei Gründe:**

1. **Jeder der zwanzig betrifft einen Zugang, eine Anmeldung oder die Anlage
   als Ganzes.** Kein einziger betrifft den **Inhalt** eines Eintrags. Ein
   `eintrag.abgelehnt` wäre der erste — und danach wäre schwer zu begründen,
   warum nicht auch `eintrag.neu`, `kommentar.neu`, `bewertung`. *Das Protokoll
   würde zum Tätigkeitsjournal, und das ist ein anderes Instrument.*
2. **Die Entscheidung schreibt sich seit dieser Runde selbst mit** — mit Datum
   und Verfasser, in der Zeile, zu der sie gehört. Eine zweite Aufzeichnung
   daneben wären zwei Wahrheiten über dieselbe Sache.
3. **Das Protokoll vergisst, die Zeile nicht.** `PROTOKOLL_TAGE` steht auf 180,
   `PROTOKOLL_GRENZE` auf 100 je Ansicht. Eine Ablehnung von vor zwei Jahren
   steht am Eintrag — im Protokoll stünde sie längst nicht mehr.

*Jede neue Zeile in dieser Liste ist eine Entscheidung für immer. Diese hier
wird nicht getroffen.*

### (4) `F_ROUTEN` bleibt bei **69**

**Geprüft, nicht angenommen.** Die drei Felder reisen auf `PUT /api/items/:id`
mit — einer Route, die seit jeher in der Liste steht, mit der Art `im Rumpf`.
**Keine neue schreibende Route, keine neue lesende:** was hinausgeht, geht über
`GET /api/items/:id`, das es längst gibt. *Der Wächter über den Quelltext
zählt weiterhin 69 gefundene gegen 69 erwartete.*

### (5) Punkt 6: **das Raster (b)**, nicht die Mindestbreite in `ch`

**Vier Gründe, und der vierte ist der Ausschlag:**

1. **(a) bliebe eine Zahl.** Das Muster — eine feste Zahl in einer Anlage, die
   ihre Schrift skaliert — wäre nicht aufgelöst, nur besser eingestellt.
2. **`ch` misst die Ziffer Null.** Die breiteste Zelle beginnt mit `⌀`, und
   dass dieses Zeichen aus der Festbreitenschrift kommt, ist nicht garantiert —
   fällt es auf eine Proportionalschrift zurück, ist die `ch`-Rechnung wieder
   falsch. *Derselbe Fehler, eine Schicht tiefer.*
3. **(a) bricht bei vierstelliger Stimmenzahl wieder.** Das steht schon im
   Auftrag.
4. **(a) behebt die zweite Hälfte des Befundes überhaupt nicht.** Eine
   Mindestbreite hebt nur den Boden; eine Zeile mit `⌀ 5,0 (128)` schiebt ihre
   Sterne weiterhin nach links — bei 100 Prozent um 14,5 px. **Die Zusage „alle
   Sternreihen beginnen an derselben Stelle" wäre mit (a) nicht eingehalten,
   sondern nur weniger oft verletzt.**

*Der Preis — die neu zu ziehende Trennlinie — ist bezahlt und in Abschnitt 7
beschrieben.*

---

## 9. Was je Datei geändert wurde

### `auth.js`

* `parseCookies()` überspringt einen Wert, der sich nicht dekodieren lässt,
  statt abzubrechen. **Drei Zeilen**, dazu der Kommentar, der sagt, warum die
  Funktion alle Cookies des Hosts sieht und warum ein einzelner Wert den ganzen
  Kopf nicht zu Fall bringen darf.

### `db.js`

* **DDL:** `items` bekommt `rejected_at`, `rejected_grund` und `rejected_von`.
* **Neu:** `migration0140()` samt Marke `MIGRATION 0.14.0 — ENTFAELLT MIT 1.0`
  und Aufruf; die Funktion steht in `module.exports` wie ihre fünf Vorgänger.
* `ordneBestandZu()` **unverändert** — `rejected_von` gehört nicht hinein.

### `server.js`

* `detail()` liefert `rejected_at`, `rejected_grund` und `rejectedVerfasser`
  (Objekt, nie die Nummer); `rejected_von` wird aus der Antwort entfernt.
* `GET /api/items` entfernt alle drei aus jeder Zeile der Übersicht.
* `NUR_VERFASSER_FELDER` bekommt `rejectedGrund` — die grobe Hälfte der Klemme.
* `PUT /api/items/:id`: die feine Klemme (`nurSelbst` auf `rejected_von`) und
  das Schreiben der drei Angaben; das Datum kommt aus `datetime('now')`.
* **Neu:** `GRUND_LAENGE` (200) und `grundText()`.
* `AUSTAUSCH_FORMAT` von 10 auf **11**; `eintragAlsPaket()` schreibt die drei
  Felder, der Import liest sie und löst `rejected_author` über `verfasser()`
  auf — mit dem Sonderfall „fehlender Name bleibt leer".

### `public/app.js`

* Detailansicht: die Zeile `#rej-marke` und die Zeile `#rej-grund-zeile` mit
  dem Eingabefeld.
* **Neu:** `drawAblehnung()` — setzt die Aussage zusammen aus dem, was da ist.
* Der Schalter schickt beim Einschalten die alte Begründung mit, beim
  Ausschalten nur das Merkmal.
* Bei genau einem Zugang fällt der Name aus der Aussage — Datum und Grund
  bleiben (`mehrereBenutzer()`).
* Das Feld speichert beim Verlassen und mit Enter; unverändert schickt es
  nichts.
* Kriterienliste: der Kasten bekommt `rlist`, die Durchschnittsspalte hängt an
  der Zeile statt in `.racts`.

### `public/style.css`

* `.rej-grund` — die Zeile für den Grund.
* `.verfasser-zeile` — der Kommentar nennt jetzt auch die Aussage an der Marke.
* `.rlist`, `.rrow`, `.rrow > *`, `.rrow .ravg` — das Raster und die neu
  gezogene Trennlinie; die Mindestbreite ist weg.

### `pruefung.js`

* **Fünf neue Gruppen** (Abschnitt 10), dazu die Erweiterung von `baueDom()`
  um `ablehnung` und die Angleichung des Mocks an den echten Server.
* **Nachgezogene Zahlen:** fünf → sechs Migrationsblöcke und
  Migrationsfunktionen, zehn → dreizehn Spalten an `items`, Formatnummer 10 →
  11 an vier Stellen, 56 → 58 Portbasen, 218 → 249 Rückbauten.

### `gegenprobe.js`

* **Einunddreißig neue Rückbauten** (217–247), je Punkt der Runde.

### Papiere

* `Doku/Aenderungsprotokoll_0.14.0.md` — dieses Blatt.
* `Doku/Projektstand_Kriterion_0_13_2.md` → `..._0_14_0.md`, nachgezogen.
* `Doku/Fehler_und_Ideen.md` — Wegweiser: 0.14.0 ist gebaut.
* `README.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`.

---

## 10. Der Prüfstand

**4131 vorher, 4262 nachher — 131 neue Prüfungen.** **Fünf** neue Gruppen mit
zusammen **126** davon; die übrigen fünf stehen in vorhandenen Gruppen (*„keine
der dreizehn Spalten ist ein Zustand neben dem Papierkorb"*, *„zu jedem
markierten Block gehört eine Funktion"* und die drei zum Rundlauf durch den
Papierkorb).

| neue Gruppe | Prüfungen |
|---|---|
| Der kaputte Cookiewert — 0.14.0 | 7 |
| MIGRATION 0.14.0 — ENTFAELLT MIT 1.0 | 30 |
| Die Entscheidung wird mitgeschrieben — 0.14.0 | 45 |
| Die Aussage an der Marke — 0.14.0 | 26 |
| Die Sternreihe steht auf einer Linie — 0.14.0 | 18 |
| **zusammen** | **126** |


### `Der kaputte Cookiewert — 0.14.0`

Zwei Cookies in einem Kopf, in beiden Reihenfolgen; die Gegenlage mit dem
kaputten Wert am eigenen Namen (401 statt 500); ein Prozentzeichen im **Namen**
ist gar kein Fall; und keine Zeile im Sicherheitsprotokoll.

### `MIGRATION 0.14.0 — ENTFAELLT MIT 1.0`

Eine nachgebaute Datenbank aus 0.13.2 — **mit Einträgen, davon einer
abgelehnt**. Der Block wird gefahren: einmal ganz, **je Spalte einzeln**
(dreimal, mit den beiden anderen vorhanden) und **zweimal hintereinander**.
Danach: die Zeilen sind da, die drei Spalten sind leer, `rejected` ist
unangetastet, der zweite Lauf ist stumm. Dazu die Gegenlage der frischen
Anlage, der Wächter über den Quelltext (kein `UPDATE`, drei Einzelabfragen,
eine Transaktion, `ordneBestandZu()` kennt `rejected_von` nicht) und die
Fremdschlüsselprobe **am Verhalten** — migriert gegen frisch. **Und die beiden
Lagen zu Stolperstein 202**, leere Tabelle gegen Tabelle mit Zeilen.

### `Die Entscheidung wird mitgeschrieben — 0.14.0`

Vier Zugänge auf einem eigenen Server. Ablehnen mit Begründung; Datum und
Verfasser kommen **nicht** aus dem Rumpf; Name statt Nummer in der Antwort;
die Übersicht trägt die Marke und sonst nichts. Die Klemme gegen den fremden
Admin, den Eintragsverfasser und die Fremde — jedes Mal **mit Nachschau in der
Datenbank**. Zurücknehmen durch den Eintragsverfasser, ohne dass etwas gelöscht
wird. Neu ablehnen macht den Handelnden zum Verfasser. Der Bestand ohne
Verfasser. Der Zuschnitt des Textes. Der **Rundlauf** durch das Format in eine
zweite Anlage. Eine Datei der Nummer 10. Und der Grabstein.

### `Die Aussage an der Marke — 0.14.0`

Sechs Lagen in jsdom: nicht abgelehnt, vollständig, Grabstein, ohne Datum und
Namen, gar nichts bekannt, und freier Text mit `<b>` darin. Dazu die Klicks:
Ausschalten schickt nur das Merkmal, Einschalten nimmt die alte Begründung
mit, das Feld speichert beim Verlassen — und ein unverändertes Feld schickt
gar nichts. Und die Kachel bleibt, wie sie war.

### `Die Sternreihe steht auf einer Linie — 0.14.0`

Erst der Gegenstand: drei Zeilen, davon **eine ohne Bewertung** und **eine mit
dreistelliger Stimmenzahl** — *eine Prüflage, in der alle Zahlen gleich lang
sind, kann den Fehler gar nicht tragen.* Dann der Aufbau (Rasterklasse am
Kasten, drei direkte Kinder je Zeile, die Zahl **nicht** mehr in `.racts`), die
Regeln im Stilblatt (Raster über drei Spalten, `display: contents`, **keine
Breite** an der Zahlenspalte, kein Spaltenabstand), die neu gezogene
Trennlinie — und der Blick auf Vergleich und Stimmliste.

### Nachgezogen in vorhandenen Gruppen

**Der Papierkorb trägt jetzt eine begründete Ablehnung.** Sein Rundlauf läuft
über **denselben** Weg wie der Import (`spieleEin()`), also müssen Datum, Grund
und Ablehnender ihn überstehen — **abgelehnt hat dort `bert`, wiederhergestellt
wird von `anna`**: fiele der Name auf den Einspielenden zurück, fiele es nur so
auf. *Und davor steht die Zeile, die den Ausgangsstand belegt — ohne sie
verglichen die drei darunter null mit null.*

**Der Wächter über die Spalten von `items` ist nachgezogen** (zehn → dreizehn)
und hat dabei einen Nachbarn bekommen: *keine der dreizehn ist ein Zustand
neben dem Papierkorb.* **Er hat getan, wofür er dasteht** — er ist rot geworden,
als die drei Spalten dazukamen.

### Der Mock zieht mit

**`baueDom()` bekommt `ablehnung`**, und die Antwort trägt die drei Felder
**immer** — leer, wenn nichts dasteht. *Ein Mock, der sie weglässt, machte
„fehlt" von „leer" ununterscheidbar (Stolperstein 102).* **Und `PUT
/api/items/1` schreibt die drei Angaben jetzt so zusammen wie der echte
Server**; ein Mock, der den Rumpf durchreichte, legte ein Feld in die Antwort,
das der Server nie liefert (Stolperstein 90).

**Die zweite Kriterienzeile trägt jetzt 128 Stimmen statt 2** — und die
Stimmliste ist wirklich so lang, statt nur die Zahl hochzusetzen.

---

## 11. Gegenproben

**Vorher: 218 Rückbauten. Nachher: 249.**

**Der volle Lauf über alle 249 ist NICHT gefahren.** Er steht damit seit neun
Runden aus; die Begründung steht in Abschnitt 16.

**Gefahren sind die einunddreißig dieser Runde**, in vier Nebenspuren —
**keine einzige blieb stumm**:

| # | Rückbau | Namentlich rot |
|---|---|---|
| 217 | Ein kaputter Cookiewert bricht wieder den ganzen Kopf ab | 4 Prüfungen, darunter „Ein kaputter Cookie VOR dem eigenen sperrt nicht aus" (2 Gruppen) |
| 218 | Ein kaputter Wert nimmt den ganzen Cookiekopf mit | „Ein kaputter Cookie VOR dem eigenen sperrt nicht aus", „Und einer DAHINTER ebenso wenig", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 219 | Der Migrationsblock laeuft gar nicht mehr | 16 Prüfungen, darunter „Die Migration ergaenzt alle drei Spalten im Bestand" (Gruppe „MIGRATION 0.14.0 — ENTFAELLT MIT 1.0") |
| 220 | Der Migrationsblock fragt nur noch die erste Spalte ab | 5 Prüfungen, darunter „Die Migration ruestet rejected_grund einzeln nach" (2 Gruppen) |
| 221 | Die drei ALTER TABLE laufen nicht mehr in einer Transaktion | „Und die drei ALTER TABLE laufen in EINER Transaktion", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 222 | Die Migration traegt erfundene Angaben in den Bestand | 6 Prüfungen, darunter „Und alle drei Spalten stehen leer -- auch am abgelehnten Eintrag" (Gruppe „MIGRATION 0.14.0 — ENTFAELLT MIT 1.0") |
| 223 | Die nachgeruestete Spalte bekommt keinen Fremdschluessel | 5 Prüfungen, darunter „Migrierte und frische Anlage verhalten sich am Fremdschluessel gleich" (2 Gruppen) |
| 224 | Die drei Spalten stehen nicht mehr in der DDL | „items traegt genau seine dreizehn Spalten", „Eine frische Anlage traegt alle drei Spalten ohne Migration", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 225 | An der Begruendung gilt wieder darfAendern statt nurSelbst | 6 Prüfungen, darunter „Ein Admin, der weder Eintrag noch Begruendung geschrieben hat, wird abgewiesen" (2 Gruppen) |
| 226 | Die Begruendung faellt aus den Verfasserfeldern heraus | 7 Prüfungen, darunter „Eine Fremde traegt auch dort nichts nach" (2 Gruppen) |
| 227 | Eine Ablehnung ohne Verfasser laesst sich nicht mehr begruenden | 6 Prüfungen, darunter „Wer den Eintrag aendern darf, traegt die fehlende Begruendung nach" (2 Gruppen) |
| 228 | Ein neues Ablehnen uebernimmt den fremden Satz | 4 Prüfungen, darunter „Und die drei Angaben stehen zusammen in der Zeile" (2 Gruppen) |
| 229 | Das Ablehnungsdatum kommt aus dem Rumpf statt vom Server | 4 Prüfungen, darunter „Ein Datum aus dem Rumpf wird nicht angenommen" (3 Gruppen) |
| 230 | Der Ablehnende geht als nackte Nummer hinaus | 10 Prüfungen, darunter „Der Ausgangsstand trug wirklich eine begruendete Ablehnung" (4 Gruppen) |
| 231 | Die Uebersicht schickt Grund und Nummer mit hinaus | „Aber keine der drei Angaben", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 232 | Die Begruendung wird weder eingeebnet noch gekappt | 4 Prüfungen, darunter „Der Text wird auf eine Zeile eingeebnet und getrimmt" (2 Gruppen) |
| 233 | Die Formatnummer bleibt auf 10 | 6 Prüfungen, darunter „Die Formatnummer steht auf 11" (6 Gruppen) |
| 234 | Der Ablehnende wandert als Nummer statt als Name hinaus | 4 Prüfungen, darunter „Die Datei traegt Datum, Grund und den NAMEN des Ablehnenden" (2 Gruppen) |
| 235 | Die drei Angaben gehen gar nicht erst in die Datei | 8 Prüfungen, darunter „Datum und Grund der Ablehnung ebenso" (4 Gruppen) |
| 236 | Ein fehlender Ablehnender faellt an den Einspielenden | „Die Marke kommt mit, die drei Felder bleiben leer", „Und der Ablehnende faellt nicht an den Einspielenden", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 237 | Die Zahlenspalte bekommt ihre feste Mindestbreite zurueck | „Die Zahlenspalte traegt keine Mindestbreite mehr", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 238 | Aus dem Raster wird wieder eine Reihe einzelner Zeilen | „Die Kriterienliste ist ein Raster ueber drei Spalten", „Die Zeile ist kein eigener Kasten mehr, sondern gibt ihre Zellen frei", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 239 | Die Kriterienliste bekommt ihre Rasterklasse nicht | „Der Kasten der Kriterienliste traegt das Raster", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 240 | Die Zahl steckt wieder in den Sternen statt im Raster | „Jede Zeile haengt Name, Sterne und Zahl als drei direkte Kinder", „Die Zahl steckt ausdruecklich NICHT mehr in den Sternen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 241 | Die Trennlinie wird wieder an der Zeile gezogen | „Die Trennlinie wird an den Zellen gezogen, nicht an der Zeile", „Und die letzte Zeile bekommt keine", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 242 | Die Marke sagt wieder nur „Abgelehnt" | 15 Prüfungen, darunter „Die Marke wird zur Aussage: wann, von wem und warum" (2 Gruppen) |
| 243 | Die Aussage verliert ihren Verfasser | 4 Prüfungen, darunter „Die Marke wird zur Aussage: wann, von wem und warum" (2 Gruppen) |
| 244 | Der Vorschlag zum Ueberschreiben geht verloren | „Ein Einschalten nimmt die alte Begruendung als Vorschlag mit", „Und sie steht danach im Feld zum Ueberschreiben", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 245 | Das Feld fuer den Grund erscheint nicht | „Das Feld fuer den Grund steht offen da", „Das Feld steht trotzdem offen, damit sich etwas nachtragen laesst", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 246 | Die Aussage steht auch da, wenn sie nichts sagt | „Ist gar nichts bekannt, bleibt die Zeile weg", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 247 | Der Name steht auch bei einem einzigen Zugang da | „Bei einem einzigen Zugang steht der Name nicht dabei", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |

> **SECHS ZEILEN SIND NACHGEFAHREN**, weil ihr Gegenstand oder ihre Prüfungen
> sich nach dem ersten Lauf noch einmal geändert haben: **243** (die Zeile, die
> er zurückbaut, hat den Zusatz `mehrereBenutzer()` bekommen), **247** (neu
> dazu), **235**, **230** und **242** (die Prüfungen zum Papierkorb und zum
> einzelnen Zugang sind erst danach dazugekommen) und **229** — siehe den ersten
> Fund darunter. **247 ist danach ein drittes Mal gefahren**, nachdem der zweite
> Fund seine Prüflage in Ordnung gebracht hatte. *Jede dieser Zeilen steht mit
> dem Ergebnis ihres letzten Laufs da, nicht mit dem des ersten.*

### Der Fund: Rückbau 229 war stumm

**Rückbau 229 legt das Ablehnungsdatum zurück in den Rumpf** — und hat im
ersten Lauf **keine einzige Prüfung dieser Runde** rot gemacht. Rot wurde nur
*„Jeder Suchtext kommt in seiner Datei genau einmal vor"*, und der schlägt bei
**jedem** Rückbau an, weil der Rückbau seinen eigenen Suchtext ersetzt. **In der
Sache war er stumm, und ein stummer Rückbau ist ein Fund.**

**Der Grund:** der Server schreibt `rejected_at` **nur beim Einschalten**. Die
Prüfung schickte ihr Datum an einer Anfrage mit, die das Merkmal gar nicht
umlegte — sie lief an der geänderten Zeile vorbei und wäre grün geblieben,
gleich was dort stand.

**Jetzt schaltet sie aus und wieder ein** und schickt das Datum am Einschalten
mit. **Dazu die zweite Hälfte**, ohne die auch die Verneinung nichts belegte:
der Server setzt wirklich die jetzige Zeit — *und der Maßstab dafür wird
ausgerechnet und nicht vom Prüfling geholt (Befund B aus 0.12.0).* Und ein
nachgetragener Grund rührt das Datum weiterhin nicht an.

*Damit ist der Zweck des Treibers an einer Zeile dieser Runde eingelöst: eine
grüne Prüfung belegt nichts, solange niemand gezeigt hat, dass sie auch rot
werden kann.*

### Der zweite Fund: eine Prüflage bekam ihre Zahl nie zu sehen

**Und der zweite kam nicht von der Gegenprobe, sondern vom Schlusslauf** — und
das ist die Lehre daran. `amLage()` in der Gruppe „Die Aussage an der Marke"
nahm den zweiten Parameter **gar nicht an**: die Lage mit *einem* Zugang lief
mit **drei**, und die Prüfung *„Bei einem einzigen Zugang steht der Name nicht
dabei"* war rot, **ohne dass am Code etwas falsch war**.

**Die Gegenprobe konnte das nicht finden.** Rückbau 247 meldete diese Prüfung
als rot — richtig, sie *war* rot, nur eben schon vorher. *Ein Rückbau kann eine
Prüfung nicht röter machen, als sie schon ist; er sieht nur, WAS rot ist, nicht
seit wann.* **Erst der volle Lauf gegen den fertigen Stand hat es gezeigt** —
genau dafür steht die Auflage, dass er ein letztes Mal gegen genau diesen Stand
läuft. **Rückbau 247 ist danach neu gefahren** und macht die Prüfung jetzt
wirklich rot.

---

## 12. Neue Stolpersteine

**Die Zählung setzt bei 202 fort — 201 ist vergeben.**

**202. `ALTER TABLE … ADD COLUMN … REFERENCES` mit Vorgabe geht an einer
LEEREN Tabelle durch.** Nachgestellt an SQLite 3.49.2: die Absage aus
Stolperstein 105 („Cannot add a REFERENCES column with non-NULL default
value") hängt daran, ob die Tabelle **Zeilen hat** — nicht daran, ob sie je
welche hatte. Leer geht dieselbe Anweisung durch, und der Fremdschlüssel steht
danach korrekt da. *Daraus folgt die Bauform jeder Migrationsprüflage: eine
Migration, die nur an einer leeren Tabelle gefahren wird, ist gar nicht
gefahren — das ist Stolperstein 189 für den Migrationsblock.*

**203. Drei Angaben zu EINER Entscheidung werden zusammen geschrieben oder gar
nicht.** Datum, Grund und Verfasser einer Ablehnung sind ein Satz. Wer sie
einzeln setzt, bekommt einen Zustand, den es in der Wirklichkeit nicht gibt:
den Satz der einen Person unter dem Namen der anderen, mit dem Datum einer
dritten Handlung. *Die Klemme, die das Umschreiben verbietet, hilft dagegen
nichts — sie sieht nur, WER schreibt, nicht WAS zusammengehört.*

**204. `nurSelbst` auf ein Feld, dessen Verfasser leer sein kann, sperrt für
immer.** `nurSelbst(null)` ist für jeden falsch. Eine Klemme auf einen
Verfasser, den ein Migrationsblock **nicht** nachtragen kann, braucht deshalb
den Zweig „steht noch keiner da, dann wird es der, der schreibt" — sonst
bleibt der Bestand aus der Vorversion für immer unbearbeitbar. *Und die grobe
Klemme davor ist dann nicht optional: ohne sie stünde das Feld jedem offen.*

**205. `display: contents` nimmt der Zeile ihren Kasten — und jede Regel, die
daran hing.** Ein Raster über mehrere Zeilen braucht Zellen im **selben**
Raster; die Zeile dazwischen muss verschwinden. Mit ihr verschwindet alles, was
am Zeilenkasten hing: Rahmen, Hintergrund, Innenabstand, Trennlinie. *Sie neu
zu ziehen ist kein Nacharbeiten, sondern Teil des Umbaus — und die Zellen
müssen dafür ohne Spaltenabstand aneinanderstoßen und gestreckt sein, sonst
wird aus einer Linie eine gestrichelte auf drei Höhen.*

**206. Ein Rückbau kann eine Prüfung nicht röter machen, als sie schon ist.**
Die Gegenprobe meldet, WAS rot wird — nicht, **seit wann**. Eine Prüfung, die
schon ohne den Rückbau rot war, steht in seiner Tabelle wie ein Beleg da und ist
keiner. *Genau so ist eine Prüflage dieser Runde durchgerutscht: der Aufbau nahm
einen Parameter nicht an, die Lage lief mit der falschen Zahl, und die Prüfung
war rot, ohne dass am Code etwas falsch war.* **Nur der volle Lauf gegen den
fertigen Stand findet das** — deshalb steht er am Ende jeder Runde, und deshalb
ersetzt keine Gegenprobe ihn.

**207. Ein Wächter, der „keine Zahl" verlangt, trifft auch die Zahlen, die
bleiben dürfen.** Die Regel dieser Runde lautet „keine feste **Breite** mehr an
der Zahlenspalte". Als `!/\d+px/` geschrieben, färbte sie sich am
**Innenabstand** — der bleiben soll und muss, denn das Stilblatt sagt selbst:
„Layoutmaße bleiben absichtlich in Pixeln". *Der Maßstab muss die Eigenschaft
benennen, nicht die Schreibweise.*

---

## 13. Die Zahlen

| | vorher (0.13.2) | nachher (0.14.0) |
|---|---|---|
| Prüfungen | 4131 | **4262** |
| Rückbauten in `gegenprobe.js` | 218 | **249** |
| Markierte Migrationsblöcke | 5 | **6** |
| Austauschformat | 10 | **11** |
| Spalten an `items` | 10 | **13** |
| Spalten mit `ON DELETE SET NULL` auf `users` am Bestand | 6 | **7** |
| Stolpersteine | 201 | **207** |
| `F_ROUTEN` | 69 | **69** |
| Vorgänge im Sicherheitsprotokoll | 20 | **20** |
| Merkmale im Sicherheitsprotokoll | 14 | **14** |
| Zwecke der zweiten Bestätigung | 7 | **7** |
| Karten im Systembereich | 19 | **19** |
| Vokabulareinträge | 11 | **11** |
| Portbasen im Prüfstand | 56 | **58** |
| Laufzeit `npm test` | ~5 min 36 s | **~5 min 45 s** |

**Laufzeitabhängigkeiten unverändert:** `better-sqlite3-multiple-ciphers`,
`express`, `multer`, `nodemailer`, `sharp`. **Entwicklungsabhängigkeit
unverändert:** `jsdom`. **Keine neue, nicht eine.**

---

## 14. Was ausdrücklich nicht passiert ist

* **KEIN dreiwertiger Zustand** *offen / genommen / verworfen*. `rejected`
  müsste weg, jeder Filter und das Austauschformat müssten mit — und
  „genommen" ist bei einem Bewertungsarchiv nicht die Gegenfrage zu
  „abgelehnt".
* **KEIN `tested_at` und kein Grund an „getestet".** *„Getestet" ist ein
  Zustand und keine Entscheidung.*
* **KEINE Begründung und kein Vorgang im Sicherheitsprotokoll** (Abschnitt 8).
* **KEINE Adressliste für `X-Forwarded-For`.** Sie ist die zweite Hälfte von
  Punkt 2 aus 0.13.0 und gehört in eine eigene Runde.
* **KEIN Fließsatz an der Tagwolke.** Zurückgestellt in 0.13.1, mit Rechnung,
  in `Doku/Fehler_und_Ideen.md`, Teil II.
* **KEIN Text „noch keine Bewertung"** in der leeren Durchschnittsspalte.
* **Das Konzeptpapier und das Videopapier sind nicht angefasst.**

---

## 15. Nachlese: die beiden Feldbelege

**Beide stehen weiterhin aus.** Sie kosten keine Zeile Code und gehören hierher,
sobald sie gefahren sind:

1. **Der Teilexport am echten Bestand (0.12.4, offen seit dem 28. August).**
   Systembereich → Export → *In Teilen exportieren*, 300 MB. Wie viele Teile,
   und stimmen die Dateigrößen ungefähr mit der Ansage? Dann alle Teile
   bestätigen und laden — **mit eingeschaltetem zweitem Faktor** —, danach
   nachsehen, dass im Sicherheitsprotokoll **keine** Zeile `bestaetigung.fehl`
   steht. *Und der Handgriff, der wirklich zählt: einen Teil in eine
   **Zweitanlage** einspielen, nicht in die laufende.*
2. **Beide Netze am echten Wirt (0.13.0, offen seit dem 28. August).** Über
   HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
   `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

**Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**

**Was in dieser Runde dagegen belegt ist: der Fingerprint der laufenden
Anlage.** Sie meldet `15188676` — derselbe Wert, den der Arbeitsbaum vor dem
ersten Handgriff getragen hat. *Damit steht fest, dass auf dem Wirt der Stand
lag, den dieser Auftrag voraussetzt; die Datei zu viel aus Stolperstein 158 gab
es diesmal nicht.*

---

## 16. Offen geblieben

* **Der volle Gegenprobenlauf steht seit neun Runden aus.** 249 Rückbauten zu
  je einem vollen Prüflauf sind bei 5 min 45 s je Lauf rund **23,9 Stunden**
  hintereinander, in vier Nebenspuren rund sechs. **Er ist auch in dieser Runde
  nicht gefahren**, und die Gründe sind zu nennen, weil gerade für eine
  Schema-Runde mehr dafür sprach als sonst:
  * **Er lässt sich nicht neben dem Bauen fahren.** `gegenprobe.js` zieht seine
    Kopie aus `git archive HEAD`; ein Commit mitten im Lauf verschöbe die
    Grundlage, und die Suchtexte der späteren Rückbauten träfen ins Leere.
  * **Sein Gegenstand wäre der alte Stand gewesen.** Vor dem Bau gibt es den
    Migrationsblock nicht — also gerade den Ort, an dem eine Gegenprobe am
    meisten wert wäre.
  * **Gefahren ist stattdessen, was diese Runde gebaut hat:** alle
    einunddreißig neuen Rückbauten, vollständig.
* **Die Tags `v0.12.3` bis `v0.14.0`** warten weiter auf den Merge des
  Arbeitsbranches. *Der Grund ist geklärt und liegt nicht bei GitHub: der
  Git-Proxy der Arbeitsumgebung weist `POST /git-receive-pack` mit
  `refs/tags/*` mit 403 ab, ohne dass GitHub die Anfrage je sieht.*
* **Die beiden Feldbelege** aus Abschnitt 15.
* **Die Adressliste für `X-Forwarded-For`** — die zweite Hälfte von Punkt 2 aus
  0.13.0.
* **Unverändert offen aus 0.13.1/0.13.2:** der Fließsatz an der Tagwolke, mit
  Rechnung in `Doku/Fehler_und_Ideen.md`, Teil II.
