# Veröffentlichen

**Wie aus diesem Entwicklungsrepository der öffentliche Stand wird.**

Hier steht alles, was dafür gebraucht wird. Wer veröffentlichen will, liest
diese Seite und sonst nichts.

---

## 1. Die Lage

Es gibt zwei Repositories.

| | |
|---|---|
| **Entwicklung** — `fardem/kriterion-dev` | **privat.** Volle Commit-Historie, `Doku/`, `CLAUDE.md`. Hier wird gebaut |
| **Öffentlich** — ein eigenes Repository | **öffentlich.** Ein Commit je Version, kein `Doku/`, keine Entwicklungshistorie |

**Der Prüfstand geht mit.** `test/`, `testbench.js`, `counterproof.js` und
`tools/` liegen im öffentlichen Repository. Ohne sie könnte niemand
nachprüfen, was README und Handbuch zusagen — und `tools/` wird vom Prüfstand
geladen (`tools/segments.js`, `tools/comments.js`, `tools/gleichlaut.js`).

**Weggelassen wird nur, was ins Leere zeigt oder nur hier gilt:**

```
Doku/                      der ganze Ordner
CLAUDE.md                  die Hausordnung dieses Repositories
tools/dictionary-doc.js    schreibt nach Doku/
tools/publish.js           das Werkzeug selbst
```

Die Liste steht in `tools/publish.js` und nirgends sonst.

---

## 2. Einmalig: das öffentliche Repository anlegen

**Als leeres, eigenständiges Repository. Niemals als Fork.**

Ein Fork auf GitHub teilt sich ein Objektnetz mit dem Ursprung: ein Commit
bleibt dort über seine Prüfsumme erreichbar, auch wenn er in keinem Zweig
steht. Bei einem Fork wäre die private Historie also nicht wirklich privat.

1. Auf GitHub ein **neues** Repository anlegen, ohne README, ohne Lizenz,
   ohne `.gitignore` — es muss leer sein.
2. Die Gegenstelle hier eintragen:

```bash
git remote add publish git@github.com:<konto>/<name>.git
```

---

## 3. Je Veröffentlichung

### Schritt 1 — der Stand muss stehen

```bash
npm test
```

Muss vollständig grün sein. Alles muss committet sein; das Werkzeug bricht bei
einem unsauberen Arbeitsbaum ab. Das ist Absicht: sonst ginge ein Stand
hinaus, den der Prüfstand nie gesehen hat.

### Schritt 2 — trocken ansehen

```bash
node tools/publish.js --trocken
```

Schreibt nichts. Meldet, was hinausginge:

```
  Version        0.35.1
  Ausgangszweig  main
  Fingerprint    0fc33e91   (ueber 19 Dateien)
  Hinaus gehen   67 Dateien, 1.234.567 Bytes
  Weggelassen    Doku, CLAUDE.md, tools/dictionary-doc.js, tools/publish.js
  Zweig publish  neu — der erste Commit hat KEINEN Elternteil

  Kein Verweis auf Doku/ geht mit hinaus.
```

**Die letzte Zeile ist die wichtigste.** Nennt eine Datei, die hinausgeht,
einen Pfad unter `Doku/`, zeigt dieser Verweis im öffentlichen Repository auf
nichts. Dann erst die Verweise beheben, dann weiter.

**Der Prüfstand ist davon ausgenommen.** Er behandelt das Fehlen des Ordners
und muss ihn dafür nennen; `test/roundtrip.js` legt sogar `Doku/Neu.md` an, um
zu belegen, dass eine Datei dort den Fingerprint nicht berührt.

**Der Fingerprint muss der der Version sein.** Er steht im Änderungsprotokoll
der Runde und — für den, der drüben nachsieht — im Eintrag der Version im
`CHANGELOG.md`. Weicht er ab, ist eine der neunzehn Dateien nicht die
erwartete.

### Schritt 3 — den Zweig herstellen

```bash
node tools/publish.js
```

Legt den Zweig `publish` an oder führt ihn fort. **Der Arbeitsbaum wird nicht
angefasst** — du stehst danach auf demselben Zweig wie vorher. Das Werkzeug
baut den Commit über einen eigenen Index, ohne etwas auszuchecken.

Der **erste** Commit auf `publish` hat keinen Elternteil und trägt damit keine
Historie. Jeder weitere hängt am vorigen: das öffentliche Repository bekommt
**einen Commit je Version**.

### Schritt 4 — nachsehen

```bash
git log --format=%P -1 publish
```

Beim **ersten Mal muss die Ausgabe leer sein** — kein Elternteil, also keine
Historie. Später steht dort die Prüfsumme der vorigen Version, und genau eine.

```bash
git ls-tree -r --name-only publish
```

Datei für Datei, was hinausgeht. Kein `Doku/`, kein `CLAUDE.md`.

```bash
git log --oneline publish
```

Eine Zeile je Version, sonst nichts.

### Schritt 5 — pushen

```bash
git push publish publish:main
```

**Immer diesen einen Zweig ausdrücklich.** Nie `--all`, nie `--mirror`, nie
`--tags` ungeprüft — damit ginge die Entwicklungshistorie mit hinaus.

Beim ersten Mal nimmt das leere Repository den Zweig als `main` an. Später
hängt der neue Commit am vorigen, also genügt derselbe Befehl.

---

## 4. Was danach im öffentlichen Repository zu tun ist

**Das Changelog.** Das Werkzeug schreibt es nicht: was zwischen zwei
Versionen für einen Betreiber wichtig war, kann kein Werkzeug wissen. Das
öffentliche Changelog fasst zusammen, was zwischen den großen Versionen
geschehen ist — nicht jede Patchnummer, und ohne Verweise auf `Doku/`.

**Die Abnahme.** Klonen, bauen, starten, Kennzahlen aufrufen:

```bash
git clone <gegenstelle> /tmp/abnahme && cd /tmp/abnahme
npm ci && npm test
```

Steht dort dieselbe Zahl Prüfungen wie hier und derselbe Fingerprint, ist der
veröffentlichte Stand der geprüfte.

---

## 5. Was das Werkzeug nicht tut

**Es pusht nicht.** Ein Werkzeug, das von selbst in ein öffentliches
Repository schreibt, kann von selbst etwas hinauslassen. Es bereitet vor,
rechnet nach und hält an.

**Es schreibt kein Changelog.**

**Es ändert `package.json` nicht.** Solange der Prüfstand mitgeht, bleibt die
Datei unverändert, und der Fingerprint des öffentlichen Standes ist derselbe
wie der des privaten. Fällt der Prüfstand einmal weg, muss das `test`-Skript
raus, und dann ändert sich der Fingerprint — er ist dann je Repository ein
anderer und gehört in beide Papiere.

---

## 6. Wenn etwas schiefgeht

| | |
|---|---|
| **Abbruch „der Arbeitsbaum ist nicht sauber"** | committen oder wegräumen, dann erneut |
| **Der Fingerprint stimmt nicht** | eine der neunzehn Dateien weicht ab. Die Einzelprüfsummen stehen in der README, Abschnitt über den Fingerprint |
| **Verweise auf `Doku/` gehen mit** | beheben, bevor gepusht wird — sonst steht im öffentlichen Repository ein Pfad, den es dort nicht gibt |
| **Zu viel gepusht** | der Push lässt sich nicht zurücknehmen. Das öffentliche Repository löschen und neu anlegen; die Prüfsummen bleiben sonst über die GitHub-Schnittstelle erreichbar |
| **Der Zweig `publish` ist verkorkst** | `git branch -D publish` und Schritt 3 erneut. Ist schon gepusht worden, gilt die Zeile darüber |

---

## 7. Der Grund für den eigenen Index

Der naheliegende Weg wäre `git checkout --orphan publish`. Er tut dasselbe,
fasst aber den Arbeitsbaum an: die Dateien bleiben stehen, der Index wird
übernommen, und wer danach abbricht, steht auf einem halben Stand.

Das Werkzeug baut den Commit stattdessen über einen eigenen Index in einem
Wegwerfverzeichnis: `read-tree`, `rm --cached`, `write-tree`, `commit-tree`,
`update-ref`. Nichts davon berührt den Arbeitsbaum. Bricht es mittendrin ab,
ist nichts geschehen.
