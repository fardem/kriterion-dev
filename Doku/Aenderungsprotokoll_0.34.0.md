# Änderungsprotokoll 0.34.0 — „Der Prüfstand bekommt ein Verzeichnis"

Gebaut am 15. September 2026, auf 0.33.2. MINOR.

Die Runde ändert keine Zusicherung. Sie ändert, wo die Zusicherungen stehen und
wie sie laufen.

| | vorher | nachher |
|---|---:|---:|
| Prüfungen | 6865 | **6865** |
| Gruppen in der Schlusstafel | 345 | **345** |
| Laufzeit | 356 s | **332 bis 353 s** |
| Spitze des Treiberprozesses | 2842 MB | **85 MB** |
| Spitze über alle Prozesse | 3188 MB | **1379 MB** |
| größter einzelner Prozess | 2842 MB | **1024 MB** |
| Teillauf über ein Modul | 356 s | **14 s** |
| Dateien des Prüfstands | 1 | **20** |
| Zeilen des Prüfstands | 56.787 | 57.655 |

> **FINGERPRINT DIESER RUNDE: `af69ce33`** — der Stand davor war `d6dbb696`.
>
> Er ändert sich an genau einer Stelle: `package.json` trägt die Versionsnummer,
> und die geht von 0.33.2 auf 0.34.0. Kein Byte Anwendungscode ist angefasst.
> Nachgerechnet über dieselben 18 Dateien, die der Handgriff in der README
> nennt: mit der alten Nummer kommt `d6dbb696` heraus, mit der neuen
> `af69ce33`.

---

## 1. Der Befund

Der Prüflauf starb am 11. September 2026 zweimal auf dem Standardläufer, nicht
an einer Prüfung:

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

Der Läufer gibt Node rund 2081 MB Heap. Der Lauf brauchte mehr.

Die Zahl der Prüfungen war nicht die Ursache. Gemessen am 15. September 2026
am Stand vor dem Umzug: die ersten viereinhalb Minuten laufen in unter 100 MB
und erledigen darin die meisten der 6865 Prüfungen. Danach steigt der Speicher
gleichmäßig auf **2842 MB** und fällt nicht zurück.

Die Ursache sind die Browserfenster. `buildDom()` baut je ein vollständiges
jsdom-Fenster. 210 Aufrufe standen in `testbench.js`, 196 davon in `checkUi()`.
Ein Teil der Fenster wird mit `w.close()` zurückgegeben, der Speicher kommt
trotzdem nicht herunter — rund zehn Megabyte je Fenster.

Ein Prozess gibt seinen Speicher beim Ende an das Betriebssystem zurück. Eine
einzige Datei kann das nicht.

---

## 2. Der Aufbau

`testbench.js` ist der Treiber und hat **446 Zeilen**. Er startet je Modul
einen Prozess, sammelt dessen Zahlen ein und schreibt den Schlussblock.

Daneben stehen zwei Rahmen:

- **`test/frame.js`** (1078 Zeilen) — die Zählung, `group()` und `check()`,
  der Schlussblock, die Zeitmessung, die Portbasen, der Start eines Servers,
  der SMTP-Empfänger, die Rufer, das Aufräumen.
- **`test/dom.js`** (2172 Zeilen) — `buildDom()` und die Helfer, die an einem
  jsdom-Fenster arbeiten, dazu drei Leser des Stilblatts.

Zwei Rahmen und nicht einer: nur die Module, die Fenster bauen, brauchen
`test/dom.js`. Der Rest lädt jsdom gar nicht erst.

### Die 17 Module

| Modul | Zeilen | Gruppen | Sekunden | Spitze |
|---|---:|---:|---:|---:|
| `test/roundtrip.js` | 21.854 | 176 | 108 | 463 MB |
| `test/source.js` | 3.813 | 8 | 6 | 175 MB |
| `test/ui_overview.js` | 3.378 | 19 | 24 | 521 MB |
| `test/ui_entry.js` | 3.658 | 17 | 14 | 421 MB |
| `test/ui_system.js` | 4.505 | 22 | 33 | 791 MB |
| `test/ui_inventory.js` | 1.738 | 11 | 14 | 337 MB |
| `test/ui_export.js` | 2.528 | 14 | 39 | 1024 MB |
| `test/ui_style.js` | 3.428 | 20 | 15 | 480 MB |
| `test/ui_translator.js` | 590 | 3 | 24 | 215 MB |
| `test/ui_language.js` | 1.751 | 9 | 16 | 291 MB |
| `test/firstlogin.js` | 211 | 5 | 3 | 93 MB |
| `test/batchrun.js` | 604 | 1 | 4 | 170 MB |
| `test/keychange.js` | 549 | 7 | 14 | 819 MB |
| `test/release_029.js` | 416 | 5 | 2 | 97 MB |
| `test/release_030.js` | 1.326 | 16 | 15 | 258 MB |
| `test/release_031.js` | 2.447 | 5 | 3 | 185 MB |
| `test/selfcheck.js` | 1.183 | 5 | 3 | 93 MB |

343 Gruppen liegen in Modulen, 4 im Treiber — zwei davon gehören zur
Selbstprobe des Rahmens und laufen nur mit `TESTBENCH_PROBE`.

### Woher die Namen kommen

S9 gilt auch hier: jeder Name im Code ist englisch, jeder Kommentar bleibt
deutsch. Die Dateinamen kommen aus dem Namenswörterbuch des Projekts, wo es ein
Wortpaar gibt — `rahmen → frame`, `quelltext → source`, `oberflaeche → ui`,
`bestand → inventory`, `stil → style` —, sonst aus den Funktionsnamen, die
0.24.1 schon englisch gemacht hat: `checkFirstLogin` → `firstlogin.js`,
`checkBatchRun` → `batchrun.js`, `checkKeyChange` → `keychange.js`.

Der erste Anlauf hatte deutsche Namen. Siehe Befund 4.

### Der Quelltext ist Zeile für Zeile umgezogen

Jedes Modul hat denselben Aufbau:

```js
const H = require('./frame.js');

async function run() {
  const { fs, path, group, check, … } = H;
  … der Abschnitt, unverändert …
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
```

Der Rumpf steht in einer Funktion, und die Namen des Rahmens werden dort
hereingeholt. Damit ist jede umgezogene Zeile Zeichen für Zeichen dieselbe
geblieben — auch `__dirname` und `require`, die im Modul auf das
Wurzelverzeichnis zeigen. Das ist die Voraussetzung dafür, dass die Suchtexte
der 998 Rückbauten weiter greifen.

---

## 3. Die Fragetafel

| Nr | Antwort |
|---|---|
| **F1** | Ein Prozess je Modul. Nur der gibt den Speicher zurück. |
| **F2** | 17 Module, geschnitten an den Nähten, die die Datei schon hatte. |
| **F3** | Zwei Rahmen: `test/frame.js` allgemein, `test/dom.js` für die Fenster. |
| **F4** | Jedes Modul schreibt seine Zahlen in eine Datei, deren Weg in `TESTBENCH_REPORT` steht. Der Treiber summiert. Ein Modul ohne Meldung ist ein roter Punkt und kein leerer Lauf. |
| **F5** | Je Modul wird gemessen, welche Server offen blieben; der Treiber hält die Zusage über alle zusammen. |
| **F6** | Die Module laufen nacheinander. Damit bleiben alle 63 Portbasen, wie sie sind, und die Spanne wächst nicht. |
| **F7** | Die 14 Rückbauten zeigen auf ihre neuen Dateien. Ihre Suchtexte sind unverändert. |
| **F8** | `foreignServer()` erkennt zusätzlich `test/<name>.js`. |
| **F9** | `node testbench.js <Filter>` bleibt. Zusätzlich läuft jedes Modul allein: `node test/source.js`. |
| **F10** | Der Notnagel fällt. Siehe Abschnitt 6. |
| **F11** | Keine Messung im echten Browser. Keine neue Abhängigkeit. Die Frage bleibt offen und steht weiter in `Doku/Fehler_und_Ideen.md`. |
| **F12** | `counterproof.js` wird nicht aufgeteilt. |
| **F13** | Der Projektstand wird nicht mitgeführt. 0.34.1 kürzt die Kommentare danach. |

---

## 4. Warum der Rundlauf ein Modul bleibt

`test/roundtrip.js` hat 21.854 Zeilen und 176 Gruppen. Das ist kein Sachgebiet,
und es ist trotzdem ein Modul.

Seine Gruppen bauen aufeinander auf. Sie arbeiten an **einem** Bestand: die
Instanz wird eingerichtet, angemeldet, gefüllt, und jede Gruppe danach greift
auf das, was die Gruppen davor angelegt haben. Ein Schnitt mittendrin verschöbe
die Zusagen auf einen anderen Bestand. Das wäre kein Umzug, sondern ein Neubau —
und Leitplanke L3 sagt dazu: ein Umzug, der alle Prüfungen mitnimmt, sie aber
vom Gegenstand trennt, bleibt grün und belegt nichts.

Gemessen hat der Rundlauf **463 MB** Spitze und **108 Sekunden**. Er ist weder
das Speicherproblem noch der teuerste Teil. Herausgelöst sind aus ihm die
Blöcke, die keinen Hauptserver anfassen: die Wächter über den Quelltext
(`test/source.js`) und der Prüfstand über sich selbst
(`test/selfcheck.js`).

**Befund für eine spätere Runde:** ein echter Teillauf über „Rechte" oder
„Papierkorb" kostet weiterhin die Zeit des Rundlaufs, weil diese Gruppen dort
liegen. Ihn weiter zu schneiden heißt, je Sachgebiet einen eigenen Bestand
aufzubauen. Das ist eine eigene Runde und gehört nicht in einen Umzug.

---

## 5. Der Teillauf

Bis 0.33.2 nahm der Filter die Ausgabe weg und nicht die Arbeit. Seit dieser
Runde liest der Treiber die Gruppennamen aus dem Quelltext jedes Moduls und
startet nur die Module, auf die der Filter passt.

Gemessen am 15. September 2026:

| Aufruf | Zeit | Module |
|---|---:|---:|
| `node testbench.js` | 350 s | 17 |
| `node testbench.js Schluesselwechsel` | **14 s** | 1 |
| `node testbench.js Papierkorb` | 153 s | 2 |
| `node testbench.js Gibtesnicht` | 0 s, Rückgabewert **1** | 0 |

Die Laufzeit des vollen Laufs ist damit nicht schneller geworden. Sechs
Messungen nach dem Umzug liegen zwischen **332 und 353 Sekunden**, die Messung
davor bei 356. Das Starten von 17 Prozessen kostet etwa so viel, wie das
Aufräumen zwischen ihnen einspart. Die Runde hatte den Speicher zum Gegenstand
und nicht die Zeit.

Die Regel des gefilterten Laufs bleibt: er sagt ausdrücklich, dass er gefiltert
war, und ein Filter ohne Treffer ist rot und nicht leer.

Neu ist eine Zeile im Schlussblock. Die Klammer „(n Prüfungen)" zählt nur, was
wirklich gelaufen ist; die Prüfungen eines nicht gestarteten Moduls hat niemand
gezählt. Deshalb steht daneben, wie viele Module ausgeblieben sind:

```
  7 von 345 Gruppen gezeigt, 338 uebergangen (0 Pruefungen).
  16 Module sind gar nicht erst gestartet — ihre Pruefungen sind in der
  Zahl oben NICHT enthalten.
```

Die beiden letzten Gruppen — „Die Portbasen und der Versatz" und „Keine
Prüflage lässt ihren Server zurück" — rechnen über alle Module. In einem
Teillauf hat niemand alle Module gefahren. Sie stehen dort trotzdem in der
Ausgabe und sagen, warum sie nichts rechnen. Ohne das wäre jeder Teillauf ein
Fehlalarm, und ein Fehlalarm wird nach dem dritten Mal überlesen.

---

## 6. Der Speicher, und warum der Notnagel fällt

Gemessen wurde zweimal am selben Weg: `node testbench.js`, die Spitze des
Treiberprozesses und die Summe über alle Prozesse, alle drei Sekunden
abgelesen.

| | vorher | nachher |
|---|---:|---:|
| Treiberprozess | **2842 MB** | **85 MB** |
| alle Prozesse zusammen | 3188 MB | 1379 MB |
| größter einzelner Prozess | 2842 MB | **1024 MB** (`ui_export`) |

Die Zusage der Runde lautete: der Speicher eines Moduls kommt nach seinem Ende
zurück. Sie ist eingehalten. Der Treiber liegt über den ganzen Lauf bei 85 MB,
und kein Modul reicht an die Grenze des Standardläufers heran.

Der Notnagel in `.github/workflows/pruefstand.yml`
(`NODE_OPTIONS: --max-old-space-size=6144`) ist gestrichen. Er fällt nicht auf
Verdacht: ein vollständiger Lauf **mit** der Heap-Grenze des Standardläufers
(`--max-old-space-size=2081`) ist durchgelaufen, 6865 von 6865 Prüfungen, in
353 Sekunden.

Bei 1024 MB wurde ein Punkt rot. Die Reserve ist also vorhanden, aber nicht
beliebig.

---

## 7. Was mitgezogen ist

**`counterproof.js`.** `offsetLevel()` und `portSpan()` lesen `OFFSET_LEVEL`,
`PORT_SPAN_FROM` und `PORT_SPAN_TO` jetzt aus `test/frame.js`. Fehlt die
Zeile, bricht der Treiber ab — das war schon so und bleibt so.

**`foreignServer()`.** Das Muster erkennt zusätzlich ein Modul unter `test/`:

```js
/(^|\/)(server\.js|testbench\.js|test\/[a-z0-9_]+\.js)$/
```

Ein liegengebliebenes `node test/roundtrip.js` belegt genauso Ports wie ein
liegengebliebenes `testbench.js`. Die Zusage, die dieses Muster zitiert, und
der Rückbau 605, der es zurückbaut, sind mitgezogen.

**Die 14 Rückbauten auf `testbench.js`.** Sie zeigen auf ihre neuen Dateien:

| Rückbau | neue Datei |
|---|---|
| 121, W13, W14, 1056 | `test/source.js` |
| 299 | `test/selfcheck.js` |
| W2 | `test/firstlogin.js` |
| W5, W6, 896, 897, 898, 899 | `test/frame.js` |
| 907 | `test/release_030.js` |
| 1020 | `test/ui_overview.js` |

Kein Suchtext ist geändert worden. Das ist der Grund für den Aufbau aus
Abschnitt 2.

**Die Wächter, die „den Prüfstand" lesen.** Drei Stellen lasen bisher
`testbench.js` als eine Datei. Sie lesen jetzt alle Dateien des Prüfstands über
`benchFiles()` — eine Liste an einer Stelle statt drei nebeneinander:

- die Zahl der Stellen, die einen Server starten (weiterhin **5**),
- der Sprachwächter über die Kommentare,
- der Wächter über türkische Wortgrenzen,
- die Auskunft über die längsten Funktionen je Datei.

**`.dockerignore`** nennt jetzt auch `test`. Die Module gehen nicht ins Image.

**`FINGERPRINT_BASE`** steht im Rahmen statt mitten im Ablauf. Der Treiber
rechnet damit nach, der Rundlauf startet damit seine Server.

---

## 8. Die Befunde

**Befund 1 — die Zahl der Sprachdateien ist festgenagelt, die der Module nicht.**
`LANGUAGE_SOURCES` zählt 14 Dateien, und die Prüfung „Der Sprachwächter sieht
alle vierzehn Quelltextdateien an" nagelt die Zahl namentlich fest. Die Module
kommen über `benchFiles()` dazu, also über das Verzeichnis und nicht über
eine Liste. Damit sieht der Wächter sie — aber eine Zahl, die eine still
verschwundene Datei auffallen ließe, gibt es für sie nicht. Eine Zahl je Datei
zu setzen ist Gegenstand von 0.34.1, Abschnitt 4.

**Befund 2 — der Teillauf über den Rundlauf kostet weiterhin den Rundlauf.**
Siehe Abschnitt 4.

**Befund 3 — `keychange` braucht 819 MB und baut kein einziges Fenster.**
Der Schlüsselwechsel kopiert Datenbanken. Damit ist er nach
`ui_export` (1024 MB) das zweitteuerste Modul, ohne dass jsdom im
Spiel wäre. Gemessen, nicht untersucht; hier war nur der Umzug Gegenstand.

**Befund 4 — die neuen Dateien hatten zuerst deutsche Namen, und kein Wächter
hat es gemerkt.** 17 von 19 Dateinamen und neun neue Bezeichner waren deutsch —
gegen S9 und gegen die Regel in `CLAUDE.md`, dass neue Begriffe dieser Art nicht
erfunden werden. Aufgefallen ist es dem Betreiber beim Lesen, nicht dem
Prüfstand. Der Grund: der Namenswächter liest eine feste Liste von **13
ausgelieferten Dateien**; `testbench.js` steht nicht darauf, `test/` erst recht
nicht. Derselbe Fall wie `mail.js` in 0.33.1 — eine Datei außerhalb jedes
Wächterblicks. Umbenannt ist es, **der Wächter sieht den Prüfstand weiterhin
nicht.** Entschieden vom Betreiber am selben Tag: das wird hier nicht mehr
nachgezogen, sondern in 0.34.1 — die Runde geht ohnehin durch jede Datei. Der
Befund steht dort als Abschnitt 3, mit zwei Fragen (F7, F8), einem
Bauabschnitt (1a) und einer Zusage (6a).

**Befund 5 — ein fehlendes `await` hat erst der Umzug sichtbar gemacht.**
`test/ui_translator.js` beendete den Server der Fremddateilage mit
`endKind(ffKind);` — ohne `await`. Die Zeile steht seit 0.24.3 so da. In einer
einzigen Datei fiel sie nie auf: zwischen ihr und der Schlussprüfung lagen
Minuten, und das Kind war längst beendet. Seit dem Umzug endet das Modul
unmittelbar danach, die Meldung an den Treiber wird sofort genommen, und der
Server steht darin als offen. **Die Zusage „Und jeder einzelne von ihnen ist
beendet" wurde rot** — nicht immer, sondern je nachdem, wie der Zeitpunkt fiel.

Der Umzug hat den Fehler nicht gemacht, er hat ihn aufgedeckt. Dieselbe Sorte
Zeile steht noch an einer zweiten Stelle (`test/roundtrip.js`, drei `stop()`
vor der letzten Gruppe); beide tragen jetzt `await`.

---

## 9. Der Gegenprobenlauf

Gefahren am 15. September 2026, vier Nebenspuren, über die fünfzehn Rückbauten,
die den Prüfstand selbst zurückbauen — die vierzehn auf `testbench.js` und der
605, der das Muster von `foreignServer()` betrifft.

**15 gefahren, 0 stumm, 0 abgerissen.** Jeder macht namentlich Prüfungen rot:

| Rückbau | Datei | rot |
|---|---|---:|
| 121 | `test/source.js` | 3 |
| 299 | `test/selfcheck.js` | 10 |
| 605 | `counterproof.js` | 5 |
| W13, W14, 1056 | `test/source.js` | 4, 2, 2 |
| W2 | `test/firstlogin.js` | 3 |
| W5, W6, 896, 897, 898, 899 | `test/frame.js` | 3, 2, 2, 2, 2, 5 |
| 907 | `test/release_030.js` | 3 |
| 1020 | `test/ui_overview.js` | 6 |

W2 ist dabei der Beleg für einen neuen Weg: der Rückbau macht das Modul
`erstanmeldung` unbrauchbar, und der Treiber meldet das als roten Punkt —
„Das Modul erstanmeldung ist abgebrochen: starteWeiterenServer is not defined".
Ein Modul, das nicht startet, läuft nicht als leerer Lauf durch.

Die übrigen 983 Rückbauten sind nicht gefahren worden. Sie fassen Dateien an,
die diese Runde nicht berührt hat.

---

## 10. Was ausdrücklich nicht gebaut wurde

- Keine Prüfung gelöscht. 6865 vorher, 6865 nachher, Prüfung für Prüfung
  dieselben.
- Kein Prüfungsname und kein Gruppenname geändert.
- Keine Schwelle gesenkt.
- Kein Code der Anwendung angefasst. Der Fingerprint geht von `d6dbb696` auf
  `af69ce33`, und der einzige Grund ist die Versionsnummer in `package.json`.
- `counterproof.js` nicht aufgeteilt.
- Keine neue Abhängigkeit.
- Die Kommentare nicht gekürzt. Das ist 0.34.1.
