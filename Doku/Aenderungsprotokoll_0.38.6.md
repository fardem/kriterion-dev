# Änderungsprotokoll 0.38.6 — „Die Lizenz"

**Gebaut am 21. September 2026 auf 0.38.5. Fingerprint `236d515e`, davor `c4185d0a`.**

**Eine Runde, ein Gegenstand.** Der Befund stammt aus BA 8 der 0.38.5: die
README sollte ein Abzeichen für die Lizenz bekommen, und es gab keine Lizenz,
auf die es hätte zeigen können. *Der Befund stand seither als einziger neuer
Punkt im Abschnitt „Was offen bleibt".*

---

## 1. Die Vorgabe

**Der Betreiber am 21. September 2026:** *„lizenz ist openscource kann jeder
sich ein fork machen. ist das MIT lizenz?"*

Damit ist beides gesetzt: **offener Quelltext** und **ein Fork ohne
Erlaubnis**. Die Frage nach MIT ist gemessen beantwortet worden, bevor gebaut
wurde.

---

## 2. Die Messung vor dem Bau

**Gemessen an den 157 Paketen, die `npm install` unter `node_modules` anlegt:**

| Lizenz | Pakete |
|---|---:|
| MIT | 124 |
| ISC | 8 |
| Apache-2.0 | 6 |
| BSD-3-Clause | 4 |
| MIT-0 | 3 |
| BSD-2-Clause | 2 |
| **LGPL-3.0-or-later** | **2** |
| CC0-1.0, 0BSD, BlueOak-1.0.0 | je 1 |
| mit Wahlrecht oder aus mehreren Lizenzen zusammengesetzt | 5 |
| ohne lesbares Feld | 6 |

**Die sechs unmittelbaren Abhängigkeiten:**
`better-sqlite3-multiple-ciphers` 11.10.0 MIT · `express` 4.22.3 MIT ·
`multer` 2.3.0 MIT · `nodemailer` 9.1.1 MIT-0 · `sharp` 0.35.4 Apache-2.0 ·
`jsdom` 30.0.1 MIT.

### Die einzige Stelle, an der MIT nicht die ganze Antwort ist

**`@img/sharp-libvips-linux-x64` und `@img/sharp-libvips-linuxmusl-x64` stehen
unter LGPL-3.0-or-later.** Es sind die vorkompilierten Binärdateien von
libvips, die `sharp` für die Bildableitungen mitbringt.

**Das steht MIT nicht entgegen.** Die LGPL greift bei der **Weitergabe einer
Binärdatei**: ihr Lizenztext muss mitgehen, und die Bibliothek muss austauschbar
bleiben. *Wer Kriterion aus diesem Repository baut, lädt `sharp` selbst über
npm — die Pflicht liegt dann nicht bei Kriterion. Wer ein fertiges Image
weitergibt, gibt libvips mit weiter und hat sie.* **Ein fertiges Image gibt es
nicht: die README lässt jeden aus dem Dockerfile bauen.**

*Eine GPL oder AGPL unter den Abhängigkeiten hätte MIT unmöglich gemacht — sie
greifen auf das ganze Werk durch. Es ist keine da, und ein Wächter hält das
fest.*

---

## 3. Was gebaut ist

### `LICENSE`

Der Text der MIT-Lizenz im Wortlaut, mit dem Urheberrechtsvermerk
`Copyright (c) 2026 Faruk Demirtas (github.com/fardem)`. **21 Zeilen, nichts
daran ist eigener Text** — eine abgewandelte MIT-Lizenz ist keine MIT-Lizenz
mehr, und kein Werkzeug erkennt sie.

### `package.json`

Das Feld `"license": "MIT"` steht jetzt da. *Ohne es gilt ein Paket in jedem
Werkzeug, das Lizenzen einsammelt, als unklar — auch dann, wenn eine `LICENSE`
daneben liegt.*

### Die README

**Ein drittes Abzeichen am Kopf**, in derselben Form wie Node und Docker.
**Ein Abschnitt „Lizenz" am Ende**, mit Sprungmarke im Inhaltsverzeichnis, und
darunter „Die Lizenzen der Abhängigkeiten" mit der Tafel von oben und der
Auskunft über libvips.

> **DAS HANDBUCH BEKOMMT KEINEN ABSCHNITT, ABER EINEN VERWEIS.** Der Kasten am
> Kopf zählt auf, was in der README steht — Installation, Schlüssel, Sichern,
> Reverse Proxy, Datenmodell, Dateien und Videos. **Die Lizenz steht jetzt in
> dieser Aufzählung.**
>
> *Ein eigener Abschnitt wäre eine zweite Erklärung derselben Sache: der
> Prüfstand hält seit 0.34.2 fest, dass keine Überschrift in beiden Dateien
> steht, und der Kasten am Kopf sagt denselben Satz — „jede Sache steht an
> genau einer der beiden Stellen; wo die andere gebraucht wird, steht ein
> Verweis und keine zweite Erklärung".* **Der Auftrag hatte „README und
> Handbuch" vorgesehen; gebaut ist beides, nur im Handbuch als Verweis.**

### Der Abschnitt „Wie dieser Code entstanden ist“

**Drei Zeilen, vor der Lizenz.** *Entstehung und Lizenz sind zwei Sachen: die
eine sagt, woher der Code kommt, die andere, was man damit darf.* Er nennt das
Werkzeug, den Zeitraum und die Grenze: **Idee, Konzept und die Entscheidung,
was gebaut wird, kommen von Faruk Demirtas.**

> **DORT STAND ZUERST „vom Betreiber“, und das war mehrdeutig.** *Die README
> duzt ihren Leser und nennt ihn den, der Kriterion betreibt — im selben Satz
> war aber der Urheber gemeint. Jetzt steht der Name da, mit dem Account als
> Adresse.*

> **STATT EINER VERSIONSNUMMER STEHT EIN ZEITRAUM DA — Vorgabe des
> Betreibers.** *Eine Nummer wäre für fast jeden Commit falsch: Claude Code
> wird laufend erneuert, und über die Runden waren es mehrere Fassungen.*
> **Der Zeitraum gibt denselben Bereich, ohne falsch zu werden.**

**„August bis September 2026" ist gemessen:** *das älteste Datum in den Papieren
ist der 21. August 2026, das älteste Änderungsprotokoll trägt den 26. August.*
**Die Git-Historie beginnt erst am 10. September 2026** — *das Repository ist
später angelegt worden als die Arbeit.*

*Der Wächter fordert die **Form** des Zeitraums und nicht den Monat: „Monat bis
Monat Jahr". Wer weiterbaut, zieht den Endmonat nach; der Prüfstand hält ihn
nicht auf, wenn er es vergisst.*

---

## 4. Der Prüfstand

**Neun neue Prüfungen in einer eigenen Gruppe, „Die Lizenz geht mit hinaus".**

| | was sie hält |
|---|---|
| 1 | `LICENSE` nennt MIT in der ersten Zeile |
| 2 | und trägt einen Urheberrechtsvermerk mit Jahr |
| 3 | und den Haftungsausschluss — der Teil, den ein Kürzen zuerst trifft |
| 4 | `package.json` trägt dieselbe Lizenz |
| 5 | die README trägt das Abzeichen |
| 6 | und einen eigenen Abschnitt |
| 7 | und nennt die LGPL der Bildbibliothek beim Namen |
| 8 | und sagt, wie der Code entstanden ist |
| 9 | **keine Abhängigkeit steht unter GPL oder AGPL** |

**Die neunte liest `node_modules` und prüft gegen die Außenwelt**, nicht gegen
einen Rückbau: eine neue Abhängigkeit mit der falschen Lizenz fällt beim
nächsten Lauf auf. *Sie lässt LGPL durch und fängt GPL-2, GPL-3 und jede Form
von AGPL.*

### Sechs Gegenproben

`1193` die erste Zeile der `LICENSE` nennt die Lizenz nicht mehr ·
`1194` der Haftungsausschluss fällt · `1195` `package.json` trägt kein
Lizenzfeld mehr · `1196` das Abzeichen fällt aus der README ·
`1197` die README nennt die LGPL-Pakete nicht mehr ·
`1198` der Transparenzvermerk fällt aus der README.

**Für die neunte Prüfung gibt es keine Gegenprobe:** der Treiber verknüpft
`node_modules`, statt es zu kopieren — ein Rückbau dort träfe den laufenden
Bestand.

---

## 5. Die Zahlen

| | vorher | jetzt |
|---|---:|---:|
| Prüfungen | 7.247 | **7.256** |
| Rückbauten | 1.127 | **1.133** |
| Dateien, die `tools/publish.js` hinausgibt | 69 | **70** |
| Dateien, über die die drei Wächter lesen | 23 · 24 · 24 | **24 · 25 · 25** |

**`LICENSE` steht in allen drei Wächterlisten** — „Keine Versionsnummer als
Herkunft", „Kein Verweis auf Doku/ geht mit hinaus" und „Kein Papierverweis
geht mit hinaus". *Der MIT-Text trägt nichts davon, und genau deshalb gehört
eine Latte darüber: eine ausgelieferte Datei ohne Wächter ist die Lücke, durch
die es später hineinkommt.*

---

## 6. Was offen bleibt

**Nichts aus dieser Runde.** Die Entscheidungen des Betreibers vom selben Tag
sind in den Papieren nachgezogen:

| | |
|---|---|
| Die Strichstärke des Löschkreuzes | **abgelehnt**, bleibt bei 1.8 |
| Der Trefferausschnitt im Ziel eines Links | **nicht weiter behandeln**, erst wenn etwas Negatives auffällt |
| Der Halt nach einem Sprung *(1600 ms)* | dasselbe |
| Der Sprung ans Seitenende in Chromium | dasselbe |
