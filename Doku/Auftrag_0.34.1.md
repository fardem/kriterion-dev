# Auftrag 0.34.1 — „Die Kommentare werden knapp"

Geschrieben am 15. September 2026. Nicht gebaut. Läuft nach 0.34.0.

**38 % des Quelltextes sind Kommentar. Ziel: 20 % über alles.**

---

## 1. Die Regel

**Ein Kommentar sagt, WAS PASSIERT.**

- Keine Erzählung.
- Keine Historie, außer sie ist zweckdienlich.
- Stichpunkte statt Fließtext, wo es geht.
- Kein Fettdruck in jedem zweiten Satz.

### geht

- was der Code eine Zeile weiter selbst sagt
- die Herleitung, die schon im Änderungsprotokoll steht
- die Erzählung „bis 0.14.0 hieß das anders"
- dieselbe Begründung an drei Stellen
- Fließtext, wo drei Stichpunkte reichen

### bleibt

- was eine **Entscheidung** trägt: warum so und nicht anders
- ein **Stolpersteinverweis**
- eine **nachgemessene Zahl**, die nirgends sonst steht
- eine **Zusage an den Prüfstand**

### zwei Klemmen

1. **Nichts wird gestrichen, was nicht vorher woanders steht.** Die einzige
   Aufzeichnung einer Entscheidung wandert erst in den Projektstand, bleibt als
   Verweis stehen, und darf dann kurz werden.
2. **Ein Kommentar, der eine AUSNAHME trägt, wird nachgeprüft, nicht gekürzt.**
   Grund: 0.33.2. Elf deutsche Sätze standen als benannte Ausnahme da, mit einer
   Begründung, die 0.33.0 selbst umgestoßen hatte. Gekürzt hätte das niemand
   gemerkt.

---

## 2. Die Zahlen

| | |
|---|---|
| Ziel über alles | **20 %**, bindend |
| Richtwert je Datei | **20 %** |
| Ausnahme | bis **30 %**, nur kleine Dateien, muss anderswo bezahlt werden |
| Umfang | alle Dateien, dazu `CHANGELOG.md` und `README.md` |

`testbench.js` stellt 61 % des Quelltextes ohne Kommentare. Bei 30 %
verbrauchte sie 15.763 Zeilen — mehr als das ganze Budget. **Sie liegt bei
20 % oder darunter.** Nach 0.34.0 gilt das für die Summe der Module in `test/`.

### Stand am 15. September 2026

| Datei | Zeilen | Kommentar | Anteil | Ziel | kürzen |
|---|---:|---:|---:|---:|---:|
| `testbench.js` | 56.787 | 20.007 | 35 % | 9.195 | −10.812 |
| `public/app.js` | 13.985 | 5.468 | 39 % | 2.129 | −3.339 |
| `counterproof.js` | 10.680 | 3.210 | 30 % | 1.868 | −1.342 |
| `server.js` | 9.182 | 4.908 | 53 % | 1.068 | −3.840 |
| `auth.js` | 1.850 | 874 | 47 % | 244 | −630 |
| `db.js` | 1.474 | 572 | 39 % | 226 | −346 |
| `images.js` | 634 | 476 | 75 % | 40 | −436 |
| `batchrun.js` | 489 | 310 | 63 % | 45 | −265 |
| `mail.js` | 365 | 181 | 50 % | 46 | −135 |
| `attachments.js` | 364 | 154 | 42 % | 52 | −102 |
| `keytool.js` | 324 | 70 | 22 % | 64 | −6 |
| `keys.js` | 275 | 117 | 43 % | 40 | −77 |
| `usertool.js` | 254 | 51 | 20 % | 51 | 0 |
| `twofactor.js` | 223 | 106 | 48 % | 29 | −77 |
| **alle 14** | **96.886** | **36.504** | **38 %** | **15.097** | **−21.407** |

- Quelltext danach: rund **75.500 Zeilen**.
- `usertool.js` ist am Ziel, `keytool.js` 6 Zeilen darüber. Beleg, dass 20 %
  erreichbar sind.
- **Die Tabelle oben ist der Stand vom 15. September 2026 VOR dem Umzug** und
  bleibt als solcher stehen. `testbench.js` gibt es so nicht mehr.

### Nachgemessen am 15. September 2026, nach 0.34.0

Über 33 Dateien: die 20 des Prüfstands, `counterproof.js` und die zwölf
ausgelieferten. Gemessen mit `tools/segments.js`, also demselben Zerleger, den
die Wächter benutzen.

| Datei | Zeilen | Kommentar | Anteil | Ziel 20 % |
|---|---:|---:|---:|---:|
| `test/roundtrip.js` | 21.858 | 6.488 | 30 % | 4.372 |
| `public/app.js` | 13.986 | 6.279 | **45 %** | 2.797 |
| `server.js` | 9.183 | 4.908 | **53 %** | 1.837 |
| `counterproof.js` | 10.689 | 3.219 | 30 % | 2.138 |
| `test/source.js` | 3.813 | 2.046 | **54 %** | 763 |
| `test/ui_style.js` | 3.428 | 1.314 | 38 % | 686 |
| `test/ui_system.js` | 4.505 | 1.245 | 28 % | 901 |
| `test/release_031.js` | 2.447 | 1.181 | **48 %** | 489 |
| `test/ui_overview.js` | 3.378 | 1.119 | 33 % | 676 |
| `test/dom.js` | 2.172 | 983 | **45 %** | 434 |
| `test/ui_export.js` | 2.528 | 969 | 38 % | 506 |
| `test/ui_entry.js` | 3.658 | 926 | 25 % | 732 |
| **alle 33** | **97.805** | **37.538** | **38 %** | **19.561** |

**Zu kürzen für 20 %: 17.977 Zeilen.**

Der Anteil über alles ist derselbe geblieben — 38 % vorher, 38 % nachher. Der
Umzug hat weder Kommentare weggenommen noch welche hinzugefügt, die ins Gewicht
fielen; er hat sie nur auf 20 Dateien verteilt. Die absolute Zahl steigt von
36.504 auf 37.538, weil 0.34.0 seine eigenen Entscheidungen begründet hat und
weil jede der 20 Dateien einen Kopf trägt.

**Die fünf teuersten Dateien stellen 22.940 der 37.538 Zeilen.** Dort liegt die
Runde.

---

## 3. Der Befund aus 0.34.0 — der Namenswächter sieht den Prüfstand nicht

Nachgetragen am 15. September 2026, nach dem Bauen von 0.34.0.

Der Wächter „Der Quelltext spricht Englisch" liest eine feste Liste von **13
ausgelieferten Dateien**:

```js
const SHIPPED = ['server.js', 'auth.js', 'db.js', 'mail.js', 'keys.js',
  'attachments.js', 'images.js', 'batchrun.js', 'usertool.js', 'twofactor.js',
  'keytool.js', 'public/app.js', 'public/theme.js'];
```

`testbench.js` steht nicht darauf, `counterproof.js` nicht, `test/` erst recht
nicht. **Regel S9 gilt für den ganzen Code** — 0.24.1 hat 678 Bezeichner allein
im Prüfstand umbenannt —, aber seit jener Runde hält keine Prüfung die Regel
dort fest.

Aufgefallen ist es daran, dass 0.34.0 seine 19 neuen Dateien zuerst deutsch
benannt hat: `rahmen.js`, `rundlauf.js`, `oberflaeche_*.js`. **17 von 19
Dateinamen waren deutsch, und der Lauf blieb grün.** Der Betreiber hat es beim
Lesen gefunden, nicht der Prüfstand. Umbenannt ist es; der blinde Fleck ist
geblieben.

Derselbe Fall wie `mail.js` in 0.33.1: eine Datei außerhalb jedes
Wächterblicks, und gefunden nicht durch eine Prüfung, sondern durch einen
Menschen.

**Was diese Runde damit zu tun hat:** sie nagelt ohnehin Zahlen je Datei fest
und geht dafür durch jede Datei des Projekts. Die Liste des Namenswächters
gehört in derselben Runde nachgezogen — der Prüfstand liest dann seine eigenen
Dateien mit.

**Zu klären ist dabei:** die Liste heißt `SHIPPED`, und der Prüfstand wird
nicht ausgeliefert. Entweder bekommt der Wächter eine zweite Liste neben der
ersten, oder die erste wird umbenannt. Eine Liste, deren Name etwas anderes
sagt als ihr Inhalt, ist der Anfang des nächsten blinden Flecks.

---

## 4. Der Beleg

Heute bewacht **eine** Zeile die Kommentare:

```js
check('Und aus ihnen bleiben mehr als tausend Kommentarzeilen uebrig',
  languageCommentRows > 1000, `${languageCommentRows} Zeilen`);
```

Bei 36.504 Zeilen könnte man 35.500 löschen und bliebe grün.

**Die Runde nagelt die Zahl je Datei fest**, wie bei den Rückbauten (998) und
den Sprachdateien (14):

- eine Zahl je Datei
- eine Zahl über alles, mit Anteil
- beide als `check`

Damit fällt jede spätere Erosion auf — und jedes Anwachsen.

---

## 5. CHANGELOG und README

Drei Probleme in beiden:

- **Altlasten** — Stände und Bauweisen, die es nicht mehr gibt. Beispiel: die
  18 Migrationsblöcke aus `db.js`.
- **Länge** — derselbe Sachverhalt an mehreren Stellen.
- **Sprache** — Metaphern statt der Sache (`CLAUDE.md`, Abschnitt 1).

**Zielzustand:**

- **CHANGELOG** — je Version eine Liste: hinzugefügt, geändert, entfernt. Alte
  Einträge werden gekürzt, nicht gelöscht. Begründungen bleiben im
  Änderungsprotokoll und werden verlinkt.
- **README** — was das Programm ist, Voraussetzungen, Installation,
  Konfiguration, Betrieb. Kein Projektverlauf.

**Der Maßstab für beide: lesen, wissen, verstehen.**

- Kein Erklärbär, kein Jargon, keine Nebenschauplätze.
- Ein technisches System wird sachlich beschrieben, nicht erklärt.
- Wer die README liest, soll danach das Programm betreiben können — nicht
  seine Geschichte kennen.

Keine Prozentzahl für beide. Sie sind Prosa, hier zählt die Regel.

---

## 6. Fragetafel

| Nr | Frage |
|---|---|
| **F1** | Welche Datei nutzt die 30-Prozent-Ausnahme, und wer bezahlt sie? *Vorschlag: `images.js` und `batchrun.js`, bezahlt aus `server.js`.* |
| **F2** | Wieviel wandert in den Projektstand? Wächst er um mehrere tausend Zeilen — ist das der gewünschte Zustand? |
| **F3** | Ein Durchgang oder mehrere? *Vorschlag: Datei für Datei, nach jedem Schritt ein voller Lauf.* |
| **F4** | Die Kommentarblöcke der 998 Rückbauten sind Zusagen und bleiben — als Stichpunkte. Bestätigen? |
| **F5** | Rund 300 Stolpersteinverweise sind feste Grundlast. Mitgezählt? |
| **F6** | Kommentare, die 0.34.0 gerade erst schreibt: gleich in knapper Form? |
| **F7** | Bekommt der Namenswächter eine zweite Liste neben `SHIPPED`, oder wird `SHIPPED` umbenannt? *Siehe Abschnitt 3.* |
| **F8** | Zählt die Namensprobe über den Prüfstand die 110 benannten deutschen Bezeichner mit, die 0.24.1 stehengelassen hat — und stehen sie dann namentlich da wie dort? |

---

## 7. Bauabschnitte

| BA | Inhalt | Umfang |
|---|---|---:|
| **0** | Messen am Stand nach 0.34.0 | — |
| **1** | Zahl je Datei im Prüfstand festnageln, **vor** dem Kürzen | — |
| **1a** | Den Namenswächter auf den Prüfstand ausdehnen (Abschnitt 3, F7 und F8) | — |
| **2** | Kleine Dateien: `twofactor`, `keys`, `mail`, `attachments`, `images`, `batchrun`, `keytool` | −1.098 |
| **3** | `server.js`, `auth.js`, `db.js` | −4.816 |
| **4** | `public/app.js` | −3.339 |
| **5** | Module des Prüfstands und `counterproof.js` | −12.154 |
| **6** | `CHANGELOG.md` und `README.md` | — |
| **7** | Zahlen neu festnageln, auf dem fertigen Stand | — |
| **8** | Papiere: CHANGELOG, Fahrplan, Änderungsprotokoll, Projektstand | — |

---

## 8. Zusagen an den Prüfstand

1. Die Zahl der Prüfungen steht vorher und nachher gleich.
2. Kein Prüfungsname und kein Gruppenname ändert sich.
3. Gegenprobenlauf vollständig, **0 stumm**. Ein Rückbau, dessen Suchtext in
   einem gekürzten Kommentar stand, wird nachgezogen, nicht gelöscht.
4. Anteil über alles **≤ 20 %**, als `check`.
5. Keine Datei über **30 %**.
6. Jede Datei hat ihre eigene Zahl.
6a. Der Namenswächter sieht den Prüfstand. Ein deutscher Dateiname unter
   `test/` macht namentlich eine Prüfung rot.
7. Der Fingerprint ändert sich — erwartet.

---

## 9. Nicht gebaut wird

- **Keine Zeile Anwendungscode** — nichts, was Kriterion tut, ändert sich.
  Keine Route, keine Abfrage, kein Feld, kein Schema, kein Austauschformat,
  keine Schwelle. Jede Anweisung in `server.js`, `auth.js`, `db.js`,
  `public/app.js` und den übrigen ausgelieferten Dateien steht hinterher Zeichen
  für Zeichen da, wo sie vorher stand. Was dort fällt, sind Kommentarzeilen —
  deshalb ändert sich der Fingerprint (Abschnitt 8, Punkt 7).
- **Der Prüfstand ist davon ausgenommen, und zwar ausdrücklich.** Die Zahl je
  Datei (BA 1) und der Namenswächter über `test/` (BA 1a) sind neue
  `check`-Zeilen. Ohne sie hätte die Runde keinen Beleg: eine Kürzung, die
  niemand nachhält, ist von einer Erosion nicht zu unterscheiden.
- Kein Stolpersteinverweis fällt.
- Keine Zusage an den Prüfstand fällt, auch nicht ihre Begründung.
- Kein Kommentar fällt, dessen Voraussetzung nicht geprüft ist.
- **Keine Quote wird gegen die Regel erzwungen.** Kommt eine Datei mit der Regel
  nicht auf 20 %, ist das ein Befund und wird aufgeschrieben.
