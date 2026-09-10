# Änderungsprotokoll 0.25.0 — „Der Name weiß, in welcher Sprache er geschrieben ist"

**Eine Datenbankstufe, eine Kette und zwei Anzeigen · 9. September 2026 ·
gebaut auf 0.24.6 (`c4c07393`).**

> **FINGERPRINT DIESER RUNDE: `84933c06`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**. *Er steht hier, damit
> die Installation sich daran messen lässt: Einstellungen → Datenbank →
> Kennzahlen. Weicht er ab, liegt ein halb eingespielter Dateisatz vor.*
>
> **DER VON 0.24.6 IST `c4c07393`** — am 9. September 2026 vom Betreiber
> eingespielt und aus der laufenden Installation gemeldet, **und am gemergten
> Stand `a86e5aa` nachgerechnet**: ein Server aus `git archive a86e5aa` meldet
> denselben Wert. *Zwei Quellen, ein Wert.*

**0.24.6 hat den Vermerk unter den Namen ehrlich gemacht — und der Betreiber
hat am 9. September 2026 gemeldet: es funktioniert immer noch nicht richtig.**
Der Grund stand seit 0.24.3 in der Datenbank und ist in 0.24.6 ausdrücklich nur
beschriftet worden: **die Grundzeile trug keinen Sprachvermerk.** Sie zählte
immer derjenigen Sprache zu, die *gerade* Vorgabe war — und damit war die Frage
„existiert für die Vorgabesprache ein Eintrag?" nicht wahrheitsgemäß
beantwortbar.

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„unabhängig davon welche
> Sprache im persönlichen eingestellt ist.. ist der fallback.. wenn nichts
> eingetragen ist die defaultsprache — wenn auch da nichts eingetragen ist →
> dann die nächste sprache für den es eingetragen wird. Die Pillen darüber sind
> nur für admins zum kontrollieren was in andere sprache eingetragen ist und was
> der user angezeigt bekommt wenn er die sprache ausgewählt hat."*

**Diese Runde gibt dem Namen seine Sprache** — und baut die Kette **für jeden
Leser und nicht nur in der Adminkarte.**

---

## Die Versionsnummer

**0.25.0 ist ein MINOR-Sprung, und Regel 5.1 lässt hier gar nichts anderes zu:**
die Runde legt **zwei Spalten in der Datenbank** an und bringt **einen neuen
Weg** (`PUT /api/names/language`). *Eine Datenbankstufe oder eine Funktion ist
mindestens MINOR; eine Reparatur ist PATCH.* Beides steht hier nebeneinander,
und die Datenbankstufe entscheidet.

**Der Fahrplan rutscht dafür** *(F6)*: die geplanten kleinen Fehler samt
Potenzialschalter werden 0.26.0, und alles danach eine Nummer weiter, bis
0.29.0 → 0.30.0. **Der Bruch bleibt die letzte Nummer vor 1.0.**

---

## Die acht Fragen — vor der ersten Zeile beantwortet

**Regel aus Abschnitt 11 des Projektstands, dritte Anwendung.** Diesmal in zwei
Runden gestellt, nachdem der Betreiber die Struktur in drei Entwürfen als
Flussdiagramm vorgelegt hatte.

| # | Frage | Antwort des Betreibers |
|---|---|---|
| **F1** | Kette mit oder ohne Erstellungssprache? | **mit** — beantwortet durch F2: die gewählte Migration setzt die Spalte voraus |
| **F2** | Was trägt die Migration als Erstellungssprache ein? | **nichts — und einmal nachfragen.** Die Spalte bleibt leer, die Karte bietet EINEN Knopf |
| **F3** | Wann steht der rote Rahmen? | **wenn die gezeigte Sprache lückig ist** — er sagt „hier, jetzt, in dieser Ansicht ist Arbeit" |
| **F4** | Glocke oder Meldung an der Karte? | ***„wir nehmen nicht die Glocke, sondern Rahmen"*** — die Glocke zeigt nur FREMDE Tätigkeit |
| **F5** | Wie räumt der Admin einen Eintrag weg? | **eigenes Zeichen am Feld.** Leer speichern bleibt folgenlos |
| **F6** | Welche Nummer? | **0.25.0, und der Fahrplan rutscht** |
| **F7** | Was reitet mit? | **`npm audit fix`** *und* **Workflow Weg B** |
| **F8** | Wie weit geht der Prüfstand, und Augenschein? | **die volle Tafel plus Migration** · **vier Bilder** |

**Dazu drei Vorgaben vor der Fragerunde:** Rahmen an **allen** Kacheln mit
fehlenden Zellen, **auch am Vokabular** · fehlende Zellen **gedämpft markiert** ·
Pillen **mit Punkt und Zahl**.

**Alle acht sind nach dem Vorschlag ausgefallen** — und das war in dieser Runde
keine Selbstverständlichkeit: F1 ist erst durch F2 entschieden worden, und der
zweistufige Entwurf (Leser → Vorgabe → Platzhalter) war damit vom Tisch.

---

## Was ein Mensch davon sieht

**Vorher:** Karte „Kategorien", Pille **Türkçe**, drei Zeilen. Unter jedem Namen
ein Vermerk, der irgendeine Sprache nennt; welche, hing davon ab, was gerade
Vorgabe war. Ein Wechsel der Vorgabesprache verschob den ganzen Bestand der
Grundnamen von einer Tafel auf die andere. **Und der gewöhnliche Benutzer
bekam gar keine Kette:** wer Türkisch las, sah bei einer Zeile mit Deutsch und
Englisch nie das Englische.

**Nachher:**

* **Jeder Name sagt, in welcher Sprache er geschrieben ist.** Der Vermerk nennt
  sie, gleichgültig was gerade Vorgabe ist.
* **Die Kette gilt für jeden Leser** — angemeldet wie nicht, Admin wie
  gewöhnlicher Benutzer: eingetragen → Vorgabesprache → Erstellungssprache der
  Zeile → Originaltext.
* **Die Pillenreihe sagt, wo Arbeit liegt:** ein Punkt `●` an einer
  vollständigen Sprache, sonst die **Zahl** der fehlenden Zellen.
* **Die Kachel bekommt einen roten Rahmen**, solange der **gezeigten** Sprache
  etwas fehlt — an allen drei Namenskarten und an der Kachel „Vokabular".
* **Ein geliehener Name steht blass und kursiv da**, mit dem Vermerk darunter.
* **Ein eigenes Zeichen neben dem Namen räumt einen Eintrag weg**, mit
  Rückfrage — *ein Radierer und nicht das Kreuz daneben: das löscht die ZEILE.*
  Der Originaltext lässt sich nicht räumen — er ist der Name der Zeile.
* **Solange Zeilen ohne Sprachangabe liegen, fragt die Karte einmal nach:**
  ein Kasten mit Zahl und **einem** Knopf — *„37 Namen ohne Sprachangabe — alle
  als Deutsch eintragen"*.
* **Nach einem Wechsel der Vorgabesprache sagt die Karte „Sprachen" an Ort und
  Stelle**, was der neuen Sprache fehlt. **Keine Glocke.**

> **UND EINES SIEHT MAN AUF EINER FRISCHEN INSTALLATION SOFORT: die Kachel
> „Vokabular" trägt den Rahmen.** Die vierzehn Wörter sind dort für keine
> Sprache eingetragen — es gilt die Vorgabe der Sprachdatei —, und die Vorgabe
> des Betreibers lautet „Rahmen an ALLEN Kacheln mit fehlenden Zellen, auch am
> Vokabular". *Das ist so gebaut, wie es bestellt ist; die Kehrseite steht hier,
> damit sie nicht als Fehler gemeldet wird, und als Punkt im Sammelblatt.*

---

## Der Befund — drei Teile

### A1 · Die Grundzeile hatte keine Sprache

```sql
product_categories( name TEXT NOT NULL UNIQUE COLLATE NOCASE, … )
rating_criteria   ( name TEXT NOT NULL UNIQUE, … )
```

`baseLanguage()` schrieb diese Zeile derjenigen Sprache zu, die **gerade**
Vorgabe war. **Am laufenden Server gemessen** (0.24.6, E1): stellt man die
Vorgabe von `de` auf `tr`, trug `tr` danach den deutschen Text, und `de` stand
leer da. *Kein Datenverlust — eine falsche Zuordnung.*

**Die Folge für die Kette:** Schritt 2 („existiert die Vorgabesprache?") fand
immer etwas, auch wenn nie jemand etwas eingetragen hatte. **Schritt 3 kam
deshalb nie dran.**

### A2 · Der normale Leser hatte gar keine Kette

```js
const qCategoryNames = db.prepare(
  'SELECT category_id AS id, name FROM category_names WHERE language = ?');
```

**Eine Sprache, sonst nichts** — und was fehlte, behielt den Grundnamen. Das
sind **zwei Schritte**, und der dritte existierte seit 0.24.6 ausschließlich im
Browser des Admins (`nameFallbackChain()` in `public/app.js`).

*Das ist die Hälfte des Befunds, die im Auftrag 0.24.6 nicht stand.*

### A3 · Die Karte sagte nicht, wo Arbeit liegt

Die Pillenreihe zeigte drei Sprachen und **keinen Zustand**. Wer wissen wollte,
ob für Türkisch noch etwas fehlt, drückte die Pille und las zwanzig Zeilen
durch.

---

## Die Kette — der Sollwert dieser Runde

```
[Leser ruft eine Liste auf]
        │
   ┌────▼──────────────────────────────┐   JA
   │ 1. Eintrag in der Lesersprache?   ├────────► zeigen, ohne Vermerk
   └────┬──────────────────────────────┘
        │ NEIN
   ┌────▼──────────────────────────────┐   JA
   │ 2. Eintrag in der Vorgabesprache? ├────────► zeigen + Vermerk (Sprache)
   └────┬──────────────────────────────┘
        │ NEIN
   ┌────▼──────────────────────────────┐   JA
   │ 3. Eintrag in der ERSTELLUNGS-    ├────────► zeigen + Vermerk (Sprache)
   │    sprache der Zeile?             │
   └────┬──────────────────────────────┘
        │ NEIN
   ┌────▼──────────────────────────────┐
   │ 4. Originaltext, Sprache unbekannt│  ← Klammer, kein Weg
   └───────────────────────────────────┘
```

**SCHRITT 4 IST IM NORMALFALL UNERREICHBAR, und das ist Absicht.** `name` ist
`NOT NULL` — in ihrer Erstellungssprache trägt jede Zeile per Definition einen
Text. *Erreichbar ist er in genau einer Lage: eine Zeile, deren
Erstellungssprache niemand kennt — der Bestand nach der Migration, vor dem
Zuordnen.* **Dann steht der Grundname da, und der Vermerk sagt „Originaltext —
Sprache unbekannt".** Ein Platzhalter, der einen Namen verschluckt, machte eine
Liste unbedienbar.

**DIE KETTE STEHT AN GENAU EINEM ORT: am Server.** Die Karte rechnet nicht mit,
sondern liest, was der Auflöser für jede Sprache ausgerechnet hat. *Eine Kette
an zwei Orten läuft auseinander — das ist Stolperstein 47 in Reinform, und
diese Reihe hat ihn zweimal bezahlt.*

---

## Bauabschnitt 1 — die Datenbankstufe

```sql
ALTER TABLE product_categories ADD COLUMN language TEXT;
ALTER TABLE rating_criteria    ADD COLUMN language TEXT;
```

* **`NULL` ist erlaubt und bedeutet etwas:** *„in welcher Sprache dieser Name
  geschrieben ist, weiß niemand"*. Das ist der Zustand des Bestands nach dem
  Einspielen, und er ist ehrlich.
* **Der Migrationsblock füllt NICHTS** *(F2)*. `migration0250Language()` steht
  in `db.js` neben den neun anderen, ist **Pflicht**, läuft beim ersten Start
  und meldet die Zahl der Namen, die auf die Nachfrage warten. **Zweimal
  starten ist still.**
* **Neu angelegte Zeilen bekommen ihre Sprache sofort** — die mitgeschickte,
  sonst die des Rufers. *Ab dieser Runde entsteht keine Zeile mehr ohne
  Sprachvermerk.*
* **Die drei mitgelieferten Kriterien tragen `de`** — sie sind deutsch, und ab
  jetzt sagen sie es auch.

**Es ist der zehnte markierte Block**, und der einzige, dessen Funktionsname
nicht nur aus Ziffern besteht. *Der Wächter, der sie zählt, hat das gemerkt und
liest seither aus den MARKEN heraus, welche Funktion es geben muss.*

---

## Bauabschnitt 2 — die Kette am Server

**Ein Auflöser, und zwar genau einer.** `chainFor(row, entered, locale, std)`
bekommt eine Zeile und die Sprache des Lesers und gibt zurück: *welcher Name*,
*aus welcher Sprache* (`from`), *ist es ein Rückfall*.

* `categoryNames(locale)` / `criterionNames(locale)` **holen nicht mehr eine
  Sprache**, sondern geben die Kette — eine Abfrage, die nur eine Sprache holt,
  kann sie nicht.
* **`named()` reicht den Vermerk mit hinaus** (`nameFallback`), und zwar an
  **jeden** Leser. *Wer ihn zeigt, entscheidet die Oberfläche.*
* `namesAll()` gibt je Sprache **`{ name, from }`** — was ein Leser dieser
  Sprache sähe UND woher es kommt. `from === <Spalte>` heißt „hier ist wirklich
  etwas eingetragen"; genau das zählt die Karte an ihren Pillen.
* `writeName()` benennt die **Grundzeile** um, wenn die geschickte Sprache die
  **Erstellungssprache der Zeile** ist — nicht mehr, wenn sie die Vorgabe ist.
* `namedLanguage(req, rowLanguage)` meint ohne Angabe **die Zeile selbst**.
* **`localeOf(req)` bleibt unangetastet**, wie in 0.24.5 und 0.24.6.
* **Die Sortierung bleibt am Grundnamen** (`ORDER BY name COLLATE NOCASE`).

**Ein neuer Weg, und er ist gezählt:** `PUT /api/names/language` ordnet die
unbekannte Erstellungssprache in einem Griff zu. **`F_ROUTES` steigt 71 → 72.**
*Er gehört dem Admin, trägt eine Sprache, schreibt in beide Tabellen und nur
dort, wo `language IS NULL` — und gibt die beiden frischen Tafeln in derselben
Antwort zurück.*

### Was in diesem Abschnitt WEGFÄLLT

* **`baseLanguage()`** — sie beantwortete „in welcher Sprache ist dieser Name
  geschrieben" mit „in der, die gerade Vorgabe ist". Das ist Befund A1 in einer
  Zeile. Die Antwort steht seither an der Zeile; für den zweiten Schritt der
  Kette steht `languageDefault()` da, wo sie immer stand.
* **Die Löschung „ein Name, der dem der Grundzeile gleicht"** in `writeName()`.
  Sie war richtig, solange die Grundzeile „die Vorgabesprache" hieß. Seit die
  Grundzeile eine eigene Sprache trägt, ist ein gleicher Name eine Übersetzung:
  *„Material" heißt auf Deutsch und auf Englisch dasselbe Wort.* Weggeräumt
  sähe die Karte eine Lücke, wo keine ist — und die Zahl an der Pille zählte
  sie mit. **Weggeräumt wird seither mit dem Zeichen am Feld.**

---

## Bauabschnitt 3 — die Adminkarte

```
┌──────────────────────────────────────────────────┐ ← roter Rahmen (F3)
│ Kategorien                                       │
│ [ Deutsch ● ]  [ English 2 ]  [ Türkçe 12 ]      │
│                                                  │
│   Werkzeug                            2 Einträge │
│   Material                            0 Einträge │
│   1_Datenträger_de                ⌫   0 Einträge │ ← gedämpft, kursiv
│   (nicht eingetragen — es steht Deutsch)         │
└──────────────────────────────────────────────────┘
```

| was | wie |
|---|---|
| **Pille, vollständig** | Punkt `●` hinter dem Namen, gedämpft |
| **Pille, lückig** | die **Zahl** der fehlenden Zellen |
| **Gewählte Pille** | bleibt orange **gefüllt**; Punkt und Zahl stehen gedämpft **darin** |
| **Roter Rahmen** | um die Kachel, solange **die gezeigte Sprache** lückig ist *(F3)* |
| **Gedämpfte Zeile** | jeder Rückfall: Name blass und kursiv (`.mname.back`), darunter der Vermerk |
| **Zeichen am Feld** | *„Eintrag entfernen"*, mit Rückfrage. **Leer speichern bleibt folgenlos** *(F5)* |
| **Nach dem Umschalten** | die Karte „Sprachen" sagt es an Ort und Stelle. **Keine Glocke** *(F4)* |
| **Unbekannte Sprache** | ein Kasten mit Zahl und **einem** Knopf, an der Karte „Kategorien" |

**DER AUFTRAG ZEICHNET EIN ✕, GEBAUT IST EIN RADIERER** — und das ist die
Antwort auf F5 („eigenes Zeichen am Feld") beim Wort genommen: *das Kreuz
daneben löscht die ZEILE samt allem, was an ihr hängt; dieses hier räumt einen
NAMEN weg, und die Zeile bleibt.* Zwei Griffe in einer Zeile brauchen zwei
Zeichen. Es steht nur, wo für die gezeigte Sprache wirklich etwas eingetragen
ist **und** die Zeile es nicht selbst trägt.

**Der Kasten mit dem einen Knopf steht an der Karte „Kategorien" und nur dort**,
obwohl der Knopf beide Tabellen schreibt: es ist EINE Frage an den ganzen
Bestand, und drei Knöpfe nebeneinander wären drei Gelegenheiten, verschiedene
Antworten zu geben. *Die Zahl zählt deshalb über beide Tafeln.*

### Was in diesem Abschnitt WEGFÄLLT

* **`nameFallbackChain()`** in `public/app.js` — die Kette steht am Server.
* **`card.namesBaseRow`** *(drei Sprachdateien)* — der Hinweis *„hier steht der
  Name der Grundzeile, gleichgültig in welcher Sprache"* **wird mit der Spalte
  falsch.** Er war die Beschriftung eines Zustands, den diese Runde beseitigt.
* **`card.nameFallbackNone`** *(drei Sprachdateien)* — *„(nicht eingetragen)"*.
  Die Lage, für die er stand, gibt es nicht mehr: wo alle drei Schritte
  vorbeigehen, steht der **Originaltext**, und der Satz dafür heißt
  `card.nameOriginal`.

*Beide werden namentlich abgezogen, wie `card.restoreIcon` in 0.24.4 — und ein
Wächter hält fest, dass sie in KEINER der drei Dateien mehr stehen.*

---

## Bauabschnitt 4 — das Vokabular bekommt dasselbe

**Vorgabe des Betreibers:** *„Das gilt natürlich auch für Vokabular."*

Punkt und Zahl an den Pillen, roter Rahmen bei lückiger Sprache, gedämpft
markierte leere Felder. **An der Kette dort ändert sich nichts** — die vierzehn
Wörter kennen keine Grundzeile, ihre Tafeln tragen je Sprache nur Eingetragenes,
und der Rückfall auf die Vorgabe der Sprachdatei bleibt, wie er ist. *Es ist
eine Frage der Darstellung und nicht der Ablage.*

---

## Bauabschnitt 5 — der Beipack *(F7)*

**① `npm audit fix`** — gefahren und nachgemessen: `multer` 2.2.0 → 2.3.0,
`nodemailer` 9.0.5 → 9.1.1, `sharp` 0.35.3 → 0.35.4, `body-parser` 1.20.6 →
1.20.8, **alle innerhalb der schon deklarierten Bereiche.** `package.json`
bleibt Zeichen für Zeichen dieselbe (bis auf die Versionsnummer der Runde
selbst); geändert wird allein `package-lock.json`. `express` bleibt bei 4.22.2.
**Der Schritt „Bekannte Lücken" ist danach grün** (Austrittscode 0; die zwei
verbleibenden `qs`-Meldungen sind „mittel" und liegen unter der Schwelle).

> **`express` 5 gehört NICHT in diese Runde.** Die zwei `qs`-Meldungen brauchen
> einen Hauptversionssprung mit geänderter Routen- und Fehlerbehandlung. *Steht
> als offener Punkt im Sammelblatt.*

**② Workflow Weg B** — `.github/workflows/pruefstand.yml`:

```yaml
jobs:
  pruefen:
    if: >-
      github.event_name != 'pull_request'
      || github.event.pull_request.head.repo.full_name != github.repository
```

**Push wird immer geprüft; der Lauf der Anfrage entfällt für Anfragen aus
demselben Repo.** Ergebnis: **ein Lauf je Stand statt zwei.** Die Anfrage zeigt
das Häkchen trotzdem, weil Prüfergebnisse an der Commit-Kennung hängen.

> **DER GRUND IST SEIT DEM 9. SEPTEMBER 2026 EIN ANDERER.** Das Repository ist
> **öffentlich**, und damit sind die Standardläufer bei GitHub **unbegrenzt
> kostenlos**. **Weg B bleibt trotzdem:** *zwei Läufe am selben Stand sagen
> dasselbe zweimal*, und der zweite belegt eine halbe Viertelstunde Rechenzeit
> für eine Antwort, die schon dasteht. **Es ist ab jetzt eine Frage der Ordnung
> und nicht des Geldes.**

---

## Ein Befund, den der Auftrag nicht kannte: der Import ist ein Anlegeweg

**Diese Runde sagt zu, dass ab jetzt keine Zeile mehr ohne Sprachvermerk
entsteht.** Der Import legt Kategorien und Kriterien an — und hätte sie mit
`language IS NULL` angelegt, in einer Instanz, die eben erst zugeordnet hat.

**Deshalb reist die Erstellungssprache mit der Datei: Formatnummer 14 → 15.**
Zwei Felder neben `criteriaWeights` und `criteriaPhase`, in derselben Bauform:

```json
"criteriaLanguages": { "Verarbeitung": "de" },
"categoryLanguages": { "Werkzeug": "de" }
```

**Nur was eine Sprache hat, taucht auf** — dieselbe Regel wie „nur Abweichungen"
bei den Gewichten. **Eine Datei der Nummer 14 und älter trägt die Felder nicht;
dann bleibt die Sprache unbekannt, und die Karte fragt einmal nach.** *Ein
vorhandenes Kriterium behält seine Sprache, so wie es sein Gewicht behält.*

**Und der Import übergeht einen Namen, der dem der Grundzeile gleicht, nicht
mehr** — dieselbe Änderung wie in `writeName()` und aus demselben Grund.

---

## Der Prüfstand — was er hält *(F8)*

**`npm test` grün: 6312 Zusagen** *(0.24.6: 6219)*. Neu in dieser Runde:

1. **DIE TAFEL DER KETTE, AM LAUFENDEN SERVER** — Gruppe „Die Kette am Server —
   0.25.0". **Drei Lesersprachen × drei Vorgabesprachen × vier Bestandslagen =
   36 Zellen**, jede mit dem Namen **und** der Sprache, aus der er stammt, als
   Sollwert. Die vier Lagen: *nur Erstellungssprache · Erstellung + eine
   Übersetzung · alle drei · Erstellungssprache unbekannt.* **Jeder der vier
   Schritte kommt darin vor.** *Sie läuft am Server und nicht im
   Browsernachbau: der Befund dieser Runde ist, dass der Server keine Kette
   hatte.* Dazu: der gewöhnliche Zugang bekommt **dieselbe** Kette (und
   weiterhin keine Tafel), die Sortierung ist für jeden Leser dieselbe, und der
   eine Griff für die unbekannte Sprache — er schreibt, er fasst nur `NULL` an,
   ein zweiter Griff findet nichts mehr, eine Sprache ohne Datei wird
   abgewiesen, und ein gewöhnlicher Zugang kommt nicht heran.
2. **DIE DATENBANKSTUFE MIT GEGENPROBE** — Gruppe „Die Datenbankstufe 0.25.0".
   Ein Bestand aus 0.24.6 (beide Spalten von Hand entfernt) hinein, die Spalten
   heraus; **der Block füllt nichts**, er **meldet sich**, und **der zweite
   Start ist still**. Dazu: eine frische Datenbank trägt die Spalte aus der DDL,
   und die drei mitgelieferten Kriterien tragen ihre Sprache.
3. **DIE KARTE** — Gruppe „Die Karte sagt, wo Arbeit liegt — 0.25.0". Die neun
   Zellen der zweiten Achse **mit umgekehrtem Sollwert** (die Grundzeile
   wandert nicht mehr), Punkt und Zahl je Pille, der Rahmen bei lückiger und
   **nicht** bei vollständiger Sprache, die Dämpfung am Rückfall, das Zeichen
   zum Räumen (es steht nur, wo etwas eingetragen ist; es räumt wirklich; die
   Zahl steigt danach um eins; die Zeile fällt auf die Kette zurück; die
   Rückfrage nennt die Sprache), der Kasten für die
   unbekannte Sprache mit **einem** Knopf, und die Ansage nach dem Umschalten —
   *und dass sie nicht dasteht, wenn nichts fehlt.*
4. **DIE KACHEL „VOKABULAR"** mit denselben vier Zusagen.
5. **DER BEIPACK** — ein Wächter, dass `package.json` dieselben fünf Bereiche
   nennt und nur die Lockfile sich bewegt hat (mit den vier Ständen
   namentlich), dass `express` bei 4 bleibt, und einer am Workflow, dass die
   Bedingung dasteht **und** der Lauf weiter an beiden Ereignissen hängt.

**Die 27 Zellen von 0.24.5, die neun der Vergleichsgruppe und die neun der
zweiten Achse sind grün geblieben** — die zweite Achse mit dem Sollwert dieser
Runde.

### Was am Prüfstand NAMENTLICH gefallen ist

| Zusage | warum |
|---|---|
| *„Die Tafel der Vorgabesprache kommt aus der Grundzeile"* | heißt jetzt *„Die Tafel der **Erstellungssprache**…"* — dieselbe Frage, die richtige Antwort |
| *„Und wo nichts eingetragen ist, steht auch nichts"* | die Zelle steht jetzt da und **sagt**, woher sie kommt (`from`) — der Rückfall ist eine Stufe früher gewandert |
| *„Messung: nach dem Wechsel trägt Türkisch einen Eintrag, den niemand türkisch eingegeben hat"* | **das ist der reparierte Befund.** Dieselbe Messung, umgekehrter Sollwert |
| *„Eine Übersetzung, die der Grundzeile gleicht, wird geräumt"* | die Regel ist weggefallen (Bauabschnitt 2). An ihre Stelle treten drei Zeilen zum Räumen am laufenden Server |
| *„Der Hinweis auf die Grundzeile"* (zwei Zellen der Achse) | `card.namesBaseRow` gibt es nicht mehr |
| *Die Kettenproben im Browsernachbau* (dritter Schritt, Reihenfolge, Vorrat) | die Kette steht am Server; sie sind dorthin gewandert und dort **größer** geworden (36 statt 3 Zellen) |

---

## Die Gegenproben

**Zwanzig neue, 760 bis 779** — drei an der Datenbankstufe, sieben an der Kette
am Server, acht an der Karte, zwei am Vokabular. **Alle gefahren** — dazu die
acht mitgegangenen, deren SACHE sich geändert hat: **dreiunddreißig Läufe** in
drei Durchgängen.

| | |
|---|---|
| **23 haben rot gemacht** | von einem Punkt (761, 762, 766, 774, 776) bis sechsundzwanzig (763 — eine Zeile ohne Sprachvermerk trifft die ganze Kettentafel) |
| **3 liefen STUMM** | **764, 767, 768 — und alle drei hatten recht.** *Jede war eine echte Lücke im Prüfstand, und alle drei sind geschlossen.* **768 lief zweimal stumm** — der zweite Durchgang hat den vierten Fund gebracht |
| **1 riss den Lauf ab** | **760** — der Rückbau selbst war falsch gewählt; er zielt seither auf eine Stelle, die den Server stehen lässt |

**DIE DREI STUMMEN SIND DER ERTRAG DIESER GEGENPROBEN.** Ohne sie wären drei
Zusagen dieser Runde ungeprüft geblieben: dass eine neue Zeile die Sprache des
**Rufers** bekommt (in jeder Prüflage fielen Rufer und Vorgabe zusammen), dass
die Exportdatei die Erstellungssprache **mitnimmt**, und dass der Import sie
**mit anlegt**. *Fünf Zusagen sind dafür dazugekommen, und die vier Rückbauten
sind noch einmal gefahren worden.*

> **UND DER ZWEITE DURCHGANG HAT NOCH EINEN GEFUNDEN.** 768 lief **wieder
> STUMM** — er baute die Erstellungssprache der **Kategorien** zurück, und die
> neue Zusage maß sie am **Kriterium**. *Zwei Tabellen, zwei Wege: ein
> Kriterium entsteht beim Import aus der Kriterienliste, eine Kategorie
> ausschließlich dadurch, dass ein Eintrag sie nennt.* **Jetzt gibt es zwei
> Rückbauten (768 und 779) und zwei Zusagen** — und die Liste steht bei **770**.
>
> **BEIDE SIND GEFAHREN, UND BEIDE MACHEN ROT.** 768 nimmt *„Und der Import
> legt sie mit an — 0.25.0"* mit, 779 *„Und dasselbe an der Kategorie —
> 0.25.0"*; je 6310 von 6312. **Kein STUMM mehr** — der dritte Durchgang ist
> der erste, der nichts mehr findet.

**Elf sind mitgegangen** statt gelöscht zu werden *(Stolperstein 201)*, und
sie zerfallen in zwei Gruppen. **Drei tragen nur einen neuen Suchtext und
dieselbe Aussage:** 233 und 448 (Formatnummer 15 statt 14), 579 (`c.language`
steht jetzt mit in der Abfrage) — *sie sind nicht noch einmal gefahren worden,
weil sich an dem, was sie wegnehmen, nichts geändert hat.* **Acht nehmen etwas
ANDERES weg als vorher, und die sind gefahren:** 717 (aus der gelöschten
Übersetzung wird die Frage, welche Zeile ein Umbenennen trifft), 739 (die Tafel
trägt Name **und** Herkunft), 749 bis 752 (die Kette steht am Server) und
754/755 (aus dem Kartenhinweis wird der rote Rahmen).

**Einer ist weggefallen und nicht mitgegangen: 753** — *„Die Kette nimmt auch
Sprachen außerhalb des Vorrats"*. Er hat keinen Ort mehr: **die Kette läuft
nicht mehr über den Vorrat**, sondern über drei benannte Schritte — die Sprache
des Lesers (`localeOf` klemmt sie), die Vorgabe der Installation (die *ist* im
Vorrat, an zwei Stellen erzwungen) und die Erstellungssprache der Zeile (die
ist der Originaltext und keine Wahl). *Ein Rückbau auf etwas, das es nicht mehr
gibt, lässt sich nicht mitnehmen.*

**Die Liste steht damit bei 770.**

---

## Der Augenschein — vier Bilder *(F8)*

**Ein echter Server, ein echter Browser, kein Nachbau.** Der Bestand ist der,
den ein Betreiber nach dem Einspielen vorfindet: vier Kategorien, deutsch
angelegt, eine davon in allen drei Sprachen, eine nur auf Englisch übersetzt —
**und danach fällt die Sprachangabe aller Zeilen weg**, genau wie bei einem
Bestand aus 0.24.6.

| Bild | was darauf zu sehen ist |
|---|---|
| **1 · vor dem Zuordnen** | roter Rahmen, Pillen `Deutsch 4 · English 2 · Türkçe 3`, der Kasten *„9 Namen ohne Sprachangabe"* mit **einem** Knopf, jede Zeile blass und kursiv mit *„(Originaltext — Sprache unbekannt)"* |
| **2 · nach dem Zuordnen** | der Kasten ist weg, **`Deutsch ●`**, kein Rahmen mehr, jede Zeile aufrecht und ohne Vermerk |
| **3 · lückige Sprache** | Pille **Türkçe 3** gewählt, roter Rahmen, drei gedämpfte Zeilen mit Vermerk — und an der einen Zeile mit türkischem Eintrag (*Alet*) das Zeichen zum Räumen |
| **4 · Vokabular** | dieselbe Gestalt an der Kachel „Vokabular": `Deutsch 14 · English 14 · Türkçe 14`, roter Rahmen, jedes leere Feld gedämpft und gestrichelt |

**Bild 4 ist zugleich der Beleg für den offenen Punkt weiter unten:** auf einer
Installation, an der niemand eigene Vokabeln eingetragen hat, ist das der
Zustand von Anfang an.

---

## Stolpersteine dieser Runde

**EIN FREMDER SERVER MUSS NICHT DEN PORT BELEGEN — ER MUSS NUR ANTWORTEN.**
*Die stehende Regel des Auftrags, und diese Runde hat sie zweimal bezahlt.* Der
erste gerechnete Fingerprint und der erste Augenschein kamen von einem Server,
der auf `/api/config` antwortete wie der eigene — **einer Gegenprobe, die
gerade auf derselben Portnummer lief** (Basis plus Versatz je Nebenspur). *Der
Fingerprint stand schon in zwei Papieren, bevor es auffiel.* **Erkannt hat es
die Einrichtung:** `POST /api/setup` antwortete mit *„Die Einrichtung ist
bereits abgeschlossen"*. **Beide Werkzeuge sehen seither nach** — wer nicht
einrichten kann, ist nicht der eigene Server —, und der Fingerprint ist auf
einer Nummer weit oberhalb aller Prüflagen nachgerechnet.

***Und derselbe Stolperstein noch einmal, andersherum:*** der abgestürzte
erste Augenschein hat seinen Server nicht beendet, und der
Gegenprobentreiber **hat sich geweigert loszufahren**, mit Nummer, Pfad und dem
Befehl zum Beenden daneben. *Der Wächter aus 0.24.6 hat genau das getan, wofür
er gebaut ist.*

**EIN HALB NACHGERÜSTETER BESTAND KOMMT GAR NICHT MEHR HOCH.** Rückbau 760 hat
im ersten Entwurf nur EINE der beiden Spalten nachgerüstet — und der ganze Lauf
riss ab, nach fünfzehn Sekunden: `qCriteria` fragt `c.language`, und das
Vorbereiten der Abfrage scheitert beim Start. **Ein abgerissener Rückbau belegt
nichts** *(Stolperstein 161)*. Er zielt seither auf die **Meldung** des Blocks
— dieselbe Stelle, und der Lauf bleibt stehen.

**DREI STUMME GEGENPROBEN, DREI ECHTE LÜCKEN.** 764 (die Sprache des Rufers),
767 (der Export) und 768 (der Import) haben nichts rot gemacht — *und alle drei
hatten recht*: der Prüfstand fragte an keiner Stelle nach, ob eine neue Zeile
die Sprache des RUFERS bekommt (in den Prüflagen fallen Ruferschluss und
Vorgabe zusammen), und die beiden neuen Felder der Datei prüfte niemand.
**Alle drei Lücken sind geschlossen**, und die Rückbauten danach rot.

**EIN WÄCHTER, DER FUNKTIONSNAMEN ZÄHLT, ZÄHLT NICHT DIE BLÖCKE.** Die Zahl der
Migrationsblöcke stand auf neun, gemessen an `function migration0?\d+\(` — und
`migration0250Language` trägt seinen Gegenstand im Namen. **Der zehnte Block
wäre stumm durchgegangen.** *Der Wächter liest seither aus den MARKEN heraus,
welche Funktion es geben muss.* Stolperstein 156 in einer neuen Gestalt:
gezählt wird, was gemeint ist, nicht was dasteht.

**EINE ZAHL IN EINER PILLE IST TEXT, UND `textContent` GIBT BEIDES.** Mit Punkt
und Zahl hieß die Pille plötzlich `Deutsch14`, und **jede Prüflage, die eine
Pille an ihrem Namen sucht, fand sie nicht mehr** — eine davon riss den Lauf ab.
*Der Name ist der erste Textknoten, das Merkmal steht in einem eigenen
Element;* seither gibt es dafür zwei Leser (`pillName`, `pillMark`) an einer
Stelle statt acht Griffen in `textContent`.

**EIN RÜCKBAU, DER KEINEN ORT MEHR HAT, GEHT NICHT MIT.** 753 baute die Klemme
gegen den Vorrat zurück — und die Kette läuft seit dieser Runde gar nicht mehr
über den Vorrat. *Mitnehmen ließ er sich nicht; er ist weggefallen, mit
Begründung.* **Sieben andere sind mitgegangen** statt gelöscht zu werden.

---

## Was ausdrücklich NICHT gebaut wurde

* **Kein `express` 5.** Hauptversionssprung, eigener Punkt im Sammelblatt.
* **Keine Glocke** *(F4)*.
* **Keine Änderung an `localeOf(req)`** — die Reihenfolge der drei Quellen gilt
  weiter für Meldungen.
* **Keine Änderung an der Sortierung.** Sie bleibt am Grundnamen.
* **Kein Zwang beim Umschalten.** Der Betreiber darf die Vorgabesprache auf
  eine lückige Sprache stellen; die Karte sagt es ihm, und die Kette hält die
  Liste lesbar.
* **Kein Rückschreiben in der Migration** *(F2)*.

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.0.md` | **neu** — dieses Blatt |
| `Doku/Projektstand_Kriterion_0_25_0.md` | `git mv` von `…_0_24_6.md`, **Revision 73** |
| `Doku/Fahrplan.md` | die Runde ist durchgestrichen und trägt ihren „GEBAUT"-Block; die Umnummerierung stand schon (0.29.0 hebt das Austauschformat jetzt 15 → 16, die Bereinigung wirft **zehn** Blöcke weg) |
| `Doku/Fehler_und_Ideen.md` | **Punkt 22 und 23 kommen hinzu** (der Rahmen am Vokabular, die deutschen Grundkriterien); Punkt 21 nennt jetzt 72 Wege und sagt, was 0.25.0 gehoben hat |
| `CHANGELOG.md` | der Eintrag 0.25.0 mit Kasten — **Sicherung vor dem Einspielen** und die eine Nachfrage danach |
| `README.md` | die Kette als Tafel, Punkt, Zahl und Rahmen, das Zeichen zum Räumen — **ohne Versionsnummer**, wie die Regel es verlangt |
| `package.json` · `package-lock.json` | 0.24.6 → 0.25.0; die Lockfile trägt außerdem die vier gehobenen Stände |

---

## Offen geblieben

* **Die Kachel „Vokabular" trägt auf einer frischen Installation den Rahmen** —
  vierzehn Wörter, für keine Sprache eingetragen. Gebaut wie bestellt; ob
  „nicht eingetragen" dort wirklich „fehlt" heißen soll, ist eine Frage an den
  Betreiber und steht im Sammelblatt.
* **Die drei mitgelieferten Kriterien stehen auf Deutsch**, auch auf einer
  frisch englisch eingerichteten Installation — seit dieser Runde sagen sie es,
  und die Karte zeigt es. *Steht im Sammelblatt.*
* **`express` 5** *(Sammelblatt)*.
