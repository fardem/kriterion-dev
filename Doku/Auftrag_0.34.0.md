# Auftrag 0.34.0 — „Der Prüfstand bekommt ein Verzeichnis"

**Geschrieben am 15. September 2026, nach 0.33.2. Nicht gebaut.**

`testbench.js` wird in ein Verzeichnis `test/` aufgeteilt, ein Modul je
Sachgebiet, der gemeinsame Rahmen daneben.

Diese Runde ändert **keine Zusicherung**. Sie ändert, wo die Zusicherungen
stehen und wie sie laufen.

---

## 1. Die zwei Befunde, die den Auftrag tragen

### Befund A — der Lauf stirbt am Speicher, nicht an einer Prüfung

Gemessen am 11. September 2026. Zweimal hintereinander derselbe Abbruch:

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

| Minute | Speicher | was läuft |
|---|---|---|
| 0 bis 4½ | 43 bis 91 MB | tausende Prüfungen, und sie kosten nichts |
| ab 4½ | 404 → 974 → 1613 → 1993 → **2133 MB** | gleichmäßig steigend, nie zurück |

**Die Zahl der Prüfungen ist nicht die Ursache.** Der größte Teil des Laufs
bleibt unter 100 MB. Wer Prüfungen löschte, nähme die Schwelle weg und rührte
die Ursache nicht an.

**Die Ursache sind die Browserfenster.** `buildDom()` baut je ein vollständiges
jsdom-Fenster. Ein Teil davon wird mit `w.close()` wieder hergegeben, der
Speicher kommt trotzdem nicht herunter. Rund zehn Megabyte je Fenster, und das
ist die Kurve oben.

**Ein Modul je Sachgebiet läuft als eigener Prozess und gibt seinen Speicher
beim Ende an das Betriebssystem zurück. Eine einzige Datei kann das nicht.**

> **BIS DAHIN STEHT EIN NOTNAGEL IM PRÜFLAUF.**
> `.github/workflows/pruefstand.yml` setzt `NODE_OPTIONS:
> --max-old-space-size=6144`. Er ist dort als Notnagel benannt und zeigt auf
> diese Runde.

### Befund B — der Filter nimmt die Ausgabe weg, nicht die Arbeit

Der Kommentar an `FILTER` in `testbench.js` sagt es selbst:

> *„Der Filter nimmt die AUSGABE weg und nicht die ARBEIT: eine übergangene
> Gruppe kostet dieselbe Zeit wie eine gezeigte."*

`node testbench.js Rechte` läuft heute genauso lange wie ein voller Lauf. **Ein
echter Teillauf ist erst mit der Aufteilung möglich** — er ist nicht ein Filter
vor dem Lauf, sondern die Auswahl der Module, die überhaupt starten.

Das steht seit dem 8. September 2026 so in `Doku/Fehler_und_Ideen.md`:
*„Ein echter Teillauf — 0.34.0 — er IST die Aufteilung in Module und nicht ein
Filter davor."*

---

## 2. Der Ausgangsstand, gemessen am 15. September 2026

| | |
|---|---:|
| `testbench.js` | **56.787 Zeilen**, davon 20.007 Kommentar (35 %) |
| `counterproof.js` | **10.680 Zeilen**, davon 3.210 Kommentar (30 %) |
| Gruppen | **347** |
| Prüfungen | **6865** |
| `buildDom()`-Aufrufe | **210** |
| Server je Lauf | **80** |
| Portbasen | **63** |
| Rückbauten | **998**, davon **14** auf `testbench.js` |
| Laufzeit | rund **300 Sekunden** |

> **DIE ZAHLEN DES FAHRPLANS ZU DIESER RUNDE SIND ÄLTER UND STIMMEN NICHT
> MEHR.** Dort stehen 6497 Prüfungen, 50.210 Zeilen und 196 Browserfenster —
> gemessen am 11. September, also vor 0.33.0, 0.33.1 und 0.33.2. **Vor dem
> Bauen wird der Speicher neu gemessen**, sonst plant die Runde gegen einen
> Stand, den es nicht mehr gibt (`CLAUDE.md`, Abschnitt 4).

---

## 3. Die Leitplanken — vor der ersten Zeile beschlossen

**L1 — Keine Zusicherung fällt weg.** Die Zahl der Prüfungen steht vorher und
nachher gleich. Wird eine Prüfung überflüssig, ist das ein eigener Befund und
kein Nebenprodukt des Umzugs.

**L2 — Kein Prüfungsname ändert sich.** Weder der Text in `check(...)` noch der
in `group(...)`. Die 998 Rückbauten nennen Gruppen namentlich; ein umbenannter
Name macht aus einem greifenden Rückbau einen stummen.

**L3 — Der Gegenprobenlauf ist der Beleg.** Nicht die grüne Zahl. Ein Umzug,
der alle Prüfungen mitnimmt, sie aber vom Gegenstand trennt, bleibt grün und
belegt nichts.

**L4 — Der Fingerprint bleibt unberührt.** Weder `testbench.js` noch die neuen
Module gehören hinein. Zwei Prüfungen halten das heute fest; sie müssen nach
dem Umzug dasselbe halten.

**L5 — Eine Datei je Sachgebiet, nicht je Gruppe.** 347 Module wären keine
Ordnung, sondern dieselbe Unordnung in kleiner.

**L6 — Der Aufrufweg bleibt bestehen.** `npm test` fährt weiter alles.

**L7 — Was zwischen Modulen geteilt wird, steht an genau einer Stelle**
(Stolperstein 47). Zwei Fassungen von `check()` sind zwei Wahrheiten.

**L8 — Die Runde nimmt keinen Code der Anwendung an.** Wer beim Umzug einen
Fehler in `server.js` findet, schreibt ihn auf und baut ihn nicht hier.

---

## 4. Strang 1 — Die Aufteilung

Ein Verzeichnis `test/`, ein Modul je Sachgebiet. Der gemeinsame Rahmen —
`check()`, `group()`, `endBlock()`, `startServer()`, `startFurtherServer()`,
`shortRun()`, `endKind()`, `open()`, die Zeitmessung — liegt daneben und wird
von jedem Modul geladen.

**Der Schnitt folgt den Sachgebieten, die es schon gibt.** Die Gruppennamen
tragen sie: Rechte, Sicherung, Mailversand, Sprache, Export und Import, Bilder,
Videos, der zweite Faktor, die Oberfläche.

**Die Messung sagt, welche Module zuerst dran sind.** Die zehn teuersten
Gruppen eines Laufs tragen rund ein Drittel der Zeit; die teuersten sind heute
„Der Teilexport mit zweitem Faktor", „Der Sprachhelfer und die Ladung",
„Der Export in Teilen" und „Der Schlüsselwechsel: der Abbruch mittendrin".

---

## 5. Strang 2 — Der echte Teillauf

Ein Teillauf startet **nur die Module, die er zeigt**. Gemessen wird er an der
**Zeit**, nicht an der Ausgabe: ein Teillauf über ein Modul muss deutlich
kürzer sein als ein voller Lauf, sonst ist er keiner.

**Die Regel des gefilterten Laufs bleibt:** ein Teillauf ist kein vollständiger
Beleg, und sein Rückgabewert folgt dem Gezeigten. Ein Filter, auf den kein
Modul passt, ist rot und nicht leer.

---

## 6. Strang 3 — Der Speicher

**Vor dem Bauen wird neu gemessen** (siehe Abschnitt 2). Die Messung vom
11. September ist drei Runden alt.

**Nach dem Bauen wird derselbe Weg noch einmal gemessen**, und die Zahl steht
im Änderungsprotokoll. Die Zusage lautet: **der Speicher eines Moduls kommt
nach seinem Ende zurück.**

**Der Notnagel im Workflow fällt, wenn die Messung es trägt** — und nur dann.
Er wird nicht auf Verdacht entfernt.

---

## 7. Was mitzieht, und was dabei bricht

Das ist der Teil, der diese Runde teuer macht. Jeder Punkt ist eine Stelle, die
`testbench.js` **beim Namen** nennt.

| # | Stelle | Was passiert |
|---|---|---|
| **1** | **14 Rückbauten patchen `testbench.js`** *(121, 299, W2, W5, W6, W13, W14, 896–899, 907, 1020, 1056)* | Ihr `file` und ihr `search` zeigen auf eine Datei, die es so nicht mehr gibt |
| **2** | **`counterproof.js` liest `const OFFSET_LEVEL = <Zahl>;` aus `testbench.js`** | Fehlt die Zeile, **bricht der Treiber ab**, statt auf einen Vorgabewert zu fallen — so ist es gebaut |
| **3** | **`foreignServer()` erkennt fremde Prozesse an `/(^\|\/)(server\|testbench)\.js$/`** | Ein Modul heißt `test/rechte.js` und passt nicht. **Der Treiber sähe die eigenen Prozesse nicht mehr** — und eine falsche Tabelle ist schlimmer als gar keine |
| **4** | **Alle 998 Rückbauten nennen eine erwartete Gruppe** | Die Gruppen wandern in Module. Der Treiber muss sie weiter finden |
| **5** | **`testbench.js` liest sich selbst an zwölf Stellen** | Darunter: `pbStarts` zählt `spawn(process.execPath, ['server.js'])` **im eigenen Quelltext**; der Fingerprint-Ausschluss; die Weitergabe des Filters an ein Kind; die Zeitprobe, die `node testbench.js` startet |
| **6** | **`LANGUAGE_SOURCES` führt `testbench.js` und `counterproof.js`** | Die Liste zählt 14 Dateien, und eine Prüfung nagelt die Zahl fest |
| **7** | **Die Restproben 5c und 5d lesen feste Dateilisten** | Sie prüfen `server.js`, `auth.js`, `mail.js` und die sechs ausgelieferten Dateien — nicht den Prüfstand. **Sie sind nicht betroffen, und das gehört nachgesehen statt angenommen** |
| **8** | **63 Portbasen, Spanne kleiner als der Versatz (3500)** | Module als eigene Prozesse brauchen eine Regel, wie sie Basen bekommen, ohne die Spanne zu sprengen. 0.33.1 ist an genau dieser Regel einmal hängengeblieben |
| **9** | **Die Schlussgruppe „Keine Prüflage lässt ihren Server zurück"** | Sie zählt `CASES` über den **ganzen** Lauf. Bei getrennten Prozessen gibt es kein gemeinsames `CASES` mehr |
| **10** | **Die Zeittafel** | `TIMES` ist lauflokal. Über Module hinweg muss sie zusammengetragen werden, sonst verliert der volle Lauf seine Schlusstafel |
| **11** | **Die Gesamtzahl der Prüfungen** | Sie entsteht heute in einem Prozess. Bei Modulen müssen die Teilzahlen zusammenkommen — und L1 verlangt, dass die Summe gleich bleibt |

---

## 8. Die Fragetafel — vor der ersten Zeile zu beantworten

| Nr | Frage |
|---|---|
| **F1** | **Ein Prozess je Modul, oder ein Prozess mit mehreren Modulen?** Nur der erste gibt den Speicher zurück. Der zweite ist billiger im Start. |
| **F2** | **Wie viele Module, und woran geschnitten?** Vorschlag: den vorhandenen Sachgebieten folgen, keine neue Ordnung erfinden. |
| **F3** | **Wo liegt der gemeinsame Rahmen?** `test/rahmen.js` oder eine Datei je Sorte (Server, Datenbank, Oberfläche). |
| **F4** | **Wie kommen die Teilzahlen zusammen?** Jedes Modul meldet seine Zahl; wer summiert, und was passiert, wenn ein Modul gar nicht startet? |
| **F5** | **Wie wird „kein Server bleibt zurück" über Module hinweg gehalten?** Je Modul, oder einmal am Ende über alle? |
| **F6** | **Wie bekommen Module ihre Portbasen?** Die Spanne aller Basen muss unter dem Versatz bleiben. |
| **F7** | **Was wird aus den 14 Rückbauten auf `testbench.js`?** Sie zeigen auf neue Dateien — und jeder umgezogene Suchtext ist eine Stelle, an der ein Rückbau still ins Leere greifen kann. |
| **F8** | **Welches Muster erkennt `foreignServer()` nach dem Umzug?** |
| **F9** | **Bleibt `node testbench.js <Filter>` als Aufrufform?** Oder heißt es künftig `node test/rechte.js`? |
| **F10** | **Fällt der Notnagel im Workflow in dieser Runde?** Nur, wenn die Messung danach es trägt. |
| **F11** | **Eine Messung im echten Browser** — *zurückgestellt, und `Doku/Fehler_und_Ideen.md` sagt ausdrücklich: **entschieden wird es beim Auftrag von 0.34.0.*** Die Frage von 0.15.1 ist unbeantwortet: *wie viele Zusagen der Oberfläche stehen nur in jsdom und nicht im Browser?* **Sie kostet eine Abhängigkeit.** Die Antwort gehört hierher, auch wenn sie „nein" lautet. |
| **F12** | **Wird `counterproof.js` mit aufgeteilt?** 10.680 Zeilen, aber ohne das Speicherproblem: der Treiber startet je Rückbau einen eigenen Prozess. |
| **F13** | **Wird `Doku/Projektstand` beim Umzug mitgeführt?** Die Kommentare der Module tragen Begründungen; 0.33.x will sie kürzen. **Die Reihenfolge der beiden Runden ist zu klären.** |

---

## 9. Die Bauabschnitte

| BA | Inhalt |
|---|---|
| **0** | **Messen, bevor gebaut wird.** Speicherkurve, Laufzeit, Gruppenzeiten am heutigen Stand. Ohne diese Zahl ist die Runde nicht nachweisbar. |
| **1** | **Der gemeinsame Rahmen** wird herausgelöst und bekommt seine eigene Datei. Noch kein Modul zieht um; der Lauf bleibt grün und die Zahl gleich. |
| **2** | **Das erste Modul zieht um** — ein kleines, mit wenigen Servern. Es ist die Vorlage für alle anderen. |
| **3** | **Die übrigen Module ziehen um**, Sachgebiet für Sachgebiet. Nach jedem Schritt ein voller Lauf. |
| **4** | **Der Treiber der Gegenproben wird nachgezogen** — `OFFSET_LEVEL`, `foreignServer()`, die 14 Rückbauten, die erwarteten Gruppen. |
| **5** | **Der Teillauf** wird gebaut und **an der Zeit gemessen**, nicht an der Ausgabe. |
| **6** | **Der Speicher wird noch einmal gemessen.** Fällt der Notnagel, fällt er hier. |
| **7** | **Die Papiere** — CHANGELOG, Fahrplan, Änderungsprotokoll 0.34.0, Projektstand. |

---

## 10. Der Prüfstand — was er halten muss

1. **Die Zahl der Prüfungen steht vorher und nachher gleich.** Sie wird vor dem
   ersten Umzug notiert.
2. **Kein Prüfungsname und kein Gruppenname ändert sich.**
3. **Der volle Lauf bleibt ein Lauf** — eine Zahl, eine Zeittafel, ein
   Rückgabewert.
4. **Ein Teillauf über ein Modul ist messbar kürzer** als ein voller Lauf.
5. **Kein Modul lässt einen Server zurück**, und das wird über alle Module
   hinweg belegt.
6. **Der Speicher eines beendeten Moduls ist zurück.** Gemessen, nicht
   behauptet.
7. **Der Gegenprobenlauf läuft vollständig durch**, und die Zahl der stummen
   Rückbauten ist null.
8. **Weder der Prüfstand noch seine Module stehen im Fingerprint.**

---

## 11. Was ausdrücklich NICHT gebaut wird

- **Keine Prüfung wird gelöscht**, auch keine, die langsam ist.
- **Keine Schwelle sinkt.**
- **Kein Code der Anwendung wird angefasst.** Befunde werden aufgeschrieben.
- **`counterproof.js` wird nicht aufgeteilt**, solange F12 nicht anders
  entschieden ist.
- **Keine neue Abhängigkeit**, solange F11 nicht anders entschieden ist.
- **Die Kommentare werden nicht gekürzt.** Das ist 0.33.x, und die Reihenfolge
  ist Gegenstand von F13.
