# Auftrag 0.25.0 — „Der Name weiß, in welcher Sprache er geschrieben ist"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** 0.24.6 hat den Vermerk unter
den Namen ehrlich gemacht und die Tafeln nachgezogen — der Betreiber hat es am
9. September 2026 eingespielt (`c4c07393`) und **es funktioniert immer noch
nicht richtig.** Der Grund steht seit 0.24.3 in der Datenbank und ist in 0.24.6
ausdrücklich nur beschriftet worden: **die Grundzeile trägt keinen
Sprachvermerk.** Sie zählt immer derjenigen Sprache zu, die *gerade* Vorgabe
ist — und damit ist die Frage „existiert für die Vorgabesprache ein Eintrag?"
nicht wahrheitsgemäß beantwortbar. **Diese Runde gibt dem Namen seine Sprache**
und baut die Kette, die der Betreiber am 9. September 2026 als Flussdiagramm
aufgezeichnet hat — **und zwar für JEDEN Leser und nicht nur in der
Adminkarte.**

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„unabhängig davon welche
> Sprache im persönlichen eingestellt ist.. ist der fallback.. wenn nichts
> eingetragen ist die defaultsprache — wenn auch da nichts eingetragen ist →
> dann die nächste sprache für den es eingetragen wird. Die Pillen darüber sind
> nur für admins zum kontrollieren was in andere sprache eingetragen ist und was
> der user angezeigt bekommt wenn er die sprache ausgewählt hat."*

**Der Befund in einem Satz:** heute kennt **nur die Adminkarte** eine Kette, und
sie hat zwei Schritte; **der normale Leser hat gar keine.** Er bekommt den
Namen seiner Sprache — und sonst den Grundnamen, gleichgültig was in einer
dritten Sprache steht.

Aufsetzend auf **0.24.6, Fingerprint `c4c07393`** — *am 9. September 2026 vom
Betreiber eingespielt und aus der laufenden Installation gemeldet.*

---

## Die acht Fragen — vor der ersten Zeile beantwortet

**Regel aus Abschnitt 11 des Projektstands, dritte Anwendung.** Diesmal sind sie
in zwei Runden gestellt worden, nachdem der Betreiber die Struktur in drei
Entwürfen als Flussdiagramm vorgelegt hatte.

| # | Frage | Antwort des Betreibers |
|---|---|---|
| **F1** | **Kette mit oder ohne Erstellungssprache?** | **mit** — *beantwortet durch F2: die gewählte Migration setzt die Spalte voraus. Der zweistufige Entwurf (Leser → Vorgabe → Platzhalter) ist damit vom Tisch* |
| **F2** | **Was trägt die Migration als Erstellungssprache ein?** | **nichts — und einmal nachfragen.** Die Spalte bleibt leer, die Karte bietet EINEN Knopf zum Zuordnen. *Das System behauptet nie etwas Falsches* |
| **F3** | **Wann steht der rote Rahmen?** | **wenn die gezeigte Sprache lückig ist** — er sagt „hier, jetzt, in dieser Ansicht ist Arbeit"; die Zahlen in den Pillen sagen, wo sonst noch |
| **F4** | **Glocke oder Meldung an der Karte?** | ***„wir nehmen nicht die Glocke, sondern Rahmen"*** — entschieden vor der Fragerunde. *Die Glocke zeigt nach ihrer eigenen Regel nur FREMDE Tätigkeit; der Betreiber, der umschaltet, ist selbst der Handelnde* |
| **F5** | **Wie räumt der Admin einen Eintrag weg?** | **eigenes Zeichen am Feld.** Leer speichern bleibt weiterhin folgenlos |
| **F6** | **Welche Nummer?** | **0.25.0, und der Fahrplan rutscht** — die geplanten kleinen Fehler samt Potenzialschalter werden 0.26.0, alles danach eine Nummer weiter |
| **F7** | **Was reitet mit?** | **`npm audit fix`** *und* **Workflow Weg B** |
| **F8** | **Wie weit geht der Prüfstand, und Augenschein?** | **die volle Tafel plus Migration** · **vier Bilder** |

**Dazu drei Vorgaben, die der Betreiber vor der Fragerunde gesetzt hat:**
Rahmen an **allen** Kacheln mit fehlenden Zellen, **auch am Vokabular** ·
fehlende Zellen **gedämpft markiert** · Pillen **mit Punkt und Zahl**.

---

## Der Befund — warum 0.24.6 nicht gereicht hat

### A1 · Die Grundzeile hat keine Sprache

```sql
product_categories( name TEXT NOT NULL UNIQUE COLLATE NOCASE, … )
rating_criteria   ( name TEXT NOT NULL UNIQUE, … )
```

`baseLanguage()` schreibt diese Zeile derjenigen Sprache zu, die **gerade**
Vorgabe ist. **Am laufenden Server gemessen** (0.24.6, Abschnitt E1): stellt man
die Vorgabe von `en` auf `tr`, trägt `tr` danach den englischen Text, und `en`
steht leer da. *Kein Datenverlust — eine falsche Zuordnung.*

**Die Folge für die Kette:** Schritt 2 („existiert die Vorgabesprache?") findet
immer etwas, auch wenn nie jemand etwas eingetragen hat. **Schritt 3 kommt
deshalb nie dran** — und genau das sieht der Betreiber am Bildschirm.

### A2 · Der normale Leser hat gar keine Kette

```js
const qCategoryNames = db.prepare(
  'SELECT category_id AS id, name FROM category_names WHERE language = ?');
```

**Eine Sprache, sonst nichts** — und was fehlt, behält den Grundnamen. Das sind
**zwei Schritte**, und der dritte existiert seit 0.24.6 ausschließlich im
Browser des Admins (`nameFallbackChain()` in `public/app.js`). **Ein Benutzer,
der Türkisch liest, bekommt bei einer Zeile mit Deutsch und Englisch nie das
Englische zu sehen.**

*Das ist die Hälfte des Befunds, die im Auftrag 0.24.6 nicht stand — sie ist
beim Nachlesen für diese Runde gefunden worden.*

### A3 · Die Karte sagt nicht, wo Arbeit liegt

Die Pillenreihe zeigt drei Sprachen und **keinen Zustand**. Wer wissen will, ob
für Türkisch noch etwas fehlt, drückt die Pille und liest zwanzig Zeilen durch.
*Der Betreiber hat dafür die Lösung mitgeliefert: Punkt und Zahl an der Pille,
Rahmen an der Kachel, Dämpfung an der Zeile.*

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
   │ 4. Platzhalter                    │  ← Klammer, kein Weg
   └───────────────────────────────────┘
```

**SCHRITT 4 IST UNERREICHBAR, und das ist Absicht.** `name` ist `NOT NULL` — in
ihrer Erstellungssprache trägt jede Zeile per Definition einen Text. *Er wird
trotzdem gebaut: eine Zeile mit unbekannter Erstellungssprache (nach der
Migration, vor dem Zuordnen) fällt sonst ins Leere.* **In diesem einen Fall
zeigt Schritt 4 den Grundnamen mit dem Vermerk „Originaltext — Sprache
unbekannt".** Ein Platzhalter, der einen Namen verschluckt, macht eine Liste
unbedienbar; drei Zeilen, die alle „(Vorgabe)" heißen, sind nicht
auseinanderzuhalten.

**DIE KETTE GILT ÜBERALL.** Server wie Karte, angemeldet wie nicht, Admin wie
gewöhnlicher Benutzer. *Eine Kette an zwei Orten läuft auseinander — das ist
Stolperstein 47 in Reinform, und diese Runde hat ihn zweimal bezahlt.*

---

## Bauabschnitt 1 — die Datenbankstufe

**Zwei Spalten, ein Migrationsblock, kein Rückschreiben.**

```sql
ALTER TABLE product_categories ADD COLUMN language TEXT;
ALTER TABLE rating_criteria    ADD COLUMN language TEXT;
```

* **`NULL` erlaubt und bedeutet etwas:** *„in welcher Sprache dieser Name
  geschrieben ist, weiß niemand"*. Das ist der Zustand des Bestands nach dem
  Einspielen, und er ist ehrlich.
* **Der Migrationsblock füllt NICHTS.** *(F2)* Er legt die Spalten an und
  meldet sich, wie die neun vor ihm.
* **Neu angelegte Zeilen bekommen ihre Sprache sofort** — die des Rufers
  beziehungsweise die mitgeschickte. *Ab dieser Runde entsteht keine Zeile mehr
  ohne Sprachvermerk.*

**Der Migrationsblock heißt `migration0250Language()` und steht in `db.js`**,
neben den neun anderen. Er ist **Pflicht** und läuft beim ersten Start.

---

## Bauabschnitt 2 — die Kette am Server

**Ein Auflöser, und zwar genau einer.** Er bekommt eine Zeile und die Sprache
des Lesers und gibt zurück: *welcher Name*, *aus welcher Sprache*, *ist es ein
Rückfall*.

* `categoryNames(locale)` / `criterionNames(locale)` in ihrer heutigen Form
  **fallen weg** — eine Abfrage, die nur eine Sprache holt, kann die Kette nicht.
* `namesAll()` schreibt den Grundnamen **der Sprache der Zeile** zu, nicht der
  gerade eingestellten Vorgabe. *Zeilen ohne Sprache stehen in keiner Tafel —
  sie sind der Originaltext und keine Übersetzung.*
* `writeName()` benennt die **Grundzeile** um, wenn die geschickte Sprache die
  **Erstellungssprache der Zeile** ist — nicht mehr, wenn sie die Vorgabe ist.
* **`localeOf(req)` bleibt unangetastet**, wie in 0.24.5 und 0.24.6.
* **Die Sortierung bleibt am Grundnamen** (`ORDER BY name COLLATE NOCASE`) —
  zwei Leser sähen sonst zwei Reihenfolgen. *Das ist die Entscheidung aus
  0.24.3 und wird hier nicht aufgemacht.*

**Ein neuer Weg, und er wird gezählt:** das Zuordnen der unbekannten
Erstellungssprache in einem Griff. `F_ROUTES` steigt **71 → 72**. *Er gehört
dem Admin und trägt eine Sprache; er schreibt in beide Tabellen und nur dort,
wo `language IS NULL`.*

---

## Bauabschnitt 3 — die Adminkarte

```
┌──────────────────────────────────────────────────┐ ← roter Rahmen (F3)
│ Kategorien                                       │
│ [ Deutsch ● ]  [ English 2 ]  [ Türkçe 12 ]      │
│                                                  │
│   Werkzeug                            2 Einträge │
│   Material                            0 Einträge │
│   1_Datenträger_de                ✕   0 Einträge │ ← gedämpft, kursiv
│   (nicht eingetragen — es steht Deutsch)         │
└──────────────────────────────────────────────────┘
```

| was | wie |
|---|---|
| **Pille, vollständig** | Punkt `●` hinter dem Namen |
| **Pille, lückig** | die **Zahl** der fehlenden Zellen — *sie sagt, ob es ein Handgriff oder ein Nachmittag ist* |
| **Gewählte Pille** | bleibt orange **gefüllt** wie heute; Punkt und Zahl stehen gedämpft **darin**. *Zwei Aussagen, zwei Merkmale — sonst verlöre die Karte ihre Auswahlanzeige* |
| **Roter Rahmen** | um die Kachel, solange **die gezeigte Sprache** lückig ist *(F3)* |
| **Gedämpfte Zeile** | jeder Rückfall: Name blass und kursiv, darunter der Vermerk wie seit 0.24.5 |
| **✕ am Feld** | *„Eintrag entfernen"*, mit Rückfrage. **Leer speichern bleibt folgenlos** *(F5)* |
| **Nach dem Umschalten** | die Karte „Sprachen" sagt es an Ort und Stelle: *„Türkçe ist jetzt Vorgabesprache — 12 Namen und 8 Vokabelwörter fehlen."* **Keine Glocke** *(F4)* |
| **Unbekannte Sprache** | solange Zeilen ohne Sprachvermerk liegen: ein Feld mit Zahl und **einem** Knopf — *„37 Namen ohne Sprachangabe — alle als ⟨Sprache⟩ eintragen"* |

**Was wieder herausfällt:** `card.namesBaseRow` aus 0.24.6 — der Hinweis *„hier
steht der Name der Grundzeile, gleichgültig in welcher Sprache"* **wird mit der
Spalte falsch.** Er war die Beschriftung eines Zustands, den diese Runde
beseitigt. *Ein Satz weniger in drei Sprachdateien; er wird namentlich abgezogen,
wie `card.restoreIcon` in 0.24.4.*

---

## Bauabschnitt 4 — das Vokabular bekommt dasselbe

**Vorgabe des Betreibers:** *„Das gilt natürlich auch für Vokabular."*

Punkt und Zahl an den Pillen, roter Rahmen bei lückiger Sprache, gedämpfte
Felder. **An der Kette dort ändert sich nichts** — die vierzehn Wörter kennen
keine Grundzeile, ihre Tafeln tragen je Sprache nur Eingetragenes, und der
Rückfall auf die Vorgabe der Sprachdatei bleibt, wie er ist. *Es ist eine
Frage der Darstellung und nicht der Ablage.*

---

## Bauabschnitt 5 — der Beipack *(F7)*

**① `npm audit fix`** — nachgemessen in einer Kopie: hebt `multer` 2.2.0 → 2.3.0,
`nodemailer` 9.0.5 → 9.1.1, `sharp` 0.35.3 → 0.35.4, `body-parser` 1.20.6 →
1.20.8, **alle innerhalb der schon deklarierten Bereiche.** `package.json`
bleibt Zeichen für Zeichen dieselbe; geändert wird allein `package-lock.json`.
`express` bleibt bei 4.22.2. **Danach ist der Schritt „Bekannte Lücken" grün**
(Austrittscode 0; die zwei verbleibenden `qs`-Meldungen sind „mittel" und
liegen unter der Schwelle).

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

**Push wird immer geprüft, der Lauf der Anfrage entfällt für Anfragen aus
demselben Repo.** Ergebnis: **ein Lauf je Stand statt zwei.** Ein Commit ohne
Anfrage wird weiterhin geprüft; die Anfrage zeigt das Häkchen trotzdem, weil
Prüfergebnisse an der Commit-Kennung hängen. *Gemessen an 0.24.6: drei Läufe
und rund 24 Minuten je Runde werden zwei Läufe und rund 16.*

---

## Der Prüfstand — was er halten muss *(F8)*

1. **`npm test` grün**, jede neue Prüfung mit **gefahrener** Gegenprobe.
2. **DIE TAFEL DER KETTE, AM SERVER.** Drei Lesersprachen × drei
   Vorgabesprachen × vier Bestandslagen (*nur Erstellungssprache · Erstellung +
   eine Übersetzung · alle drei · Erstellungssprache unbekannt*). **Jede Zelle
   mit dem Namen UND der Sprache, aus der er stammt, als Sollwert.**
   *Sie läuft am laufenden Server und nicht im Browsernachbau: der Befund
   dieser Runde ist, dass der Server keine Kette hat.*
3. **Der Migrationsblock mit Gegenprobe.** Ein Bestand aus 0.24.6 hinein, die
   Spalten heraus — und **zweimal starten ist still**, wie bei den neun davor.
4. **Die Karte:** Punkt und Zahl je Pille, Rahmen bei lückiger Sprache und
   **nicht** bei vollständiger, gedämpfte Zeile am Rückfall, ✕ räumt wirklich
   und die Zahl steigt danach um eins.
5. **Die Kachel „Vokabular"** mit denselben vier Zusagen.
6. **Die 27 Zellen von 0.24.5, die 49 von 0.24.6 und die neun der
   Vergleichsgruppe bleiben grün** — soweit sie nach dem Umbau noch dieselbe
   Sache prüfen. *Was fällt, fällt NAMENTLICH und mit Begründung im Protokoll.*
7. **Der Beipack:** ein Wächter, dass `package.json` unverändert ist und nur die
   Sperrdatei sich bewegt hat; ein Wächter am Workflow, dass die Bedingung
   dasteht.

**Der Augenschein: vier Bilder** *(F8)* — die Karte vor dem Zuordnen, nach dem
Zuordnen, mit rotem Rahmen auf einer lückigen Sprache, und die Kachel
„Vokabular" mit denselben Zahlen.

---

## Was ausdrücklich NICHT gebaut wird

* **Kein `express` 5.** Hauptversionssprung, eigener Punkt im Sammelblatt.
* **Keine Glocke** *(F4)*.
* **Keine Änderung an `localeOf(req)`** — die Reihenfolge der drei Quellen gilt
  weiter für Meldungen.
* **Keine Änderung an der Sortierung.** Sie bleibt am Grundnamen.
* **Kein Zwang beim Umschalten.** Der Betreiber darf die Vorgabesprache auf eine
  lückige Sprache stellen; die Karte sagt es ihm, und die Kette hält die Liste
  lesbar. *Ein Umschalter, der erst nach zwanzig Übersetzungen greift, wäre
  schlimmer als der Zustand, den er verhindern soll.*

---

## Die Dokumente

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.0.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_25_0.md` | `git mv`, **Revision 73** |
| `Doku/Fahrplan.md` | die Runde — **und die Umnummerierung:** alt 0.25.0 → 0.26.0, alt 0.26.0 → 0.27.0, und so fort bis 0.29.0 → 0.30.0 *(F6)* |
| `Doku/Fehler_und_Ideen.md` | **Punkt 21 fällt heraus** (er ist gebaut) · **`express` 5 kommt hinein** |
| `CHANGELOG.md` · `package.json` · `package-lock.json` · `README.md` | die Nummer und die Kette |

---

## WIE DER NÄCHSTE AUFTRAG AUSZUSEHEN HAT

> **Ab dieser Runde trägt jeder Auftrag diesen Abschnitt.** *Entschieden vom
> Betreiber am 9. September 2026: „das muss immer in jedem Auftrag drin
> stehen … um dir beim Bauen Arbeit zu sparen, ohne dass wir unsicherer oder
> schlechter werden."* **Er beschreibt die FORM, nicht den Inhalt** — der
> Inhalt kommt aus dem Rundlauf.

**Am Kopf**

1. **Ein Absatz „was in dieser Runde passiert"**, mit dem Wortlaut des
   Betreibers, wenn der Befund aus dem Feld kommt.
2. **Der Fingerprint des Vorgängers**, aus **zwei** Quellen bestätigt: aus der
   laufenden Installation gemeldet **und** am gemergten Stand nachgerechnet.
3. **Die Fragetafel** mit einer Spalte „Vorschlag von Claude". **Die Spalte ist
   ein Vorschlag und keine Antwort.** *Gebaut wird erst, wenn jede Frage
   beantwortet und im Papier eingetragen ist* (Abschnitt 11 des Projektstands).

**Im Rumpf**

4. **Der Befund**, in nummerierten Teilen, jeder mit der Stelle im Quelltext
   oder einer **Messung am laufenden Server**. *Vermutungen werden als solche
   benannt.*
5. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
6. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.*

**Am Fuß**

7. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.**
8. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
9. **Was ausdrücklich NICHT gebaut wird.**
10. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`, Revision),
    Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
11. **Dieser Abschnitt selbst.**

**Und die stehenden Regeln, die keine Runde neu verhandelt**

* **GITHUB, WEG B.** Ein Lauf je Stand. **Ein Push je Runde**, nicht vier —
  `cancel-in-progress` fängt nur ab, was sich überholt, nicht was nacheinander
  fertig läuft. *Jede Doppelung geht auf die Minuten des Betreibers.*
* **DER FINGERPRINT WIRD VOR DEM EINSPIELEN GERECHNET** und steht im
  Änderungsprotokoll, damit die Installation sich daran messen kann. *Er deckt
  `node_modules` NICHT ab — eine Hebung von Abhängigkeiten bewegt ihn nicht,
  und das gehört dann ausdrücklich ins CHANGELOG.*
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — das ist Stolperstein 47,
  und er hat diese Reihe schon dreimal gekostet.
* **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90). *Eine
  Vereinfachung im Mock hält genau so lange, wie die Vereinfachung stimmt.*
* **`group()` SETZT EINE ÜBERSCHRIFT UND KEINE KLAMMER.** Eine neue Gruppe
  gehört ans Ende ihres Bereichs, sonst zieht sie fremde Prüfungen unter ihren
  Namen.
* **EIN FREMDER SERVER MUSS NICHT DEN PORT BELEGEN — ER MUSS NUR ANTWORTEN.**
  Jede Prüflage am laufenden Server sieht vorher nach.
