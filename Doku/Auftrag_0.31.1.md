# Auftrag 0.31.1 — „Deutsch sitzt"

**Geschrieben am 13. September 2026 · gebaut auf 0.31.0 · PATCH, kein
Schemaanteil.**

> **DIE RUNDE IST BESTELLT WORDEN, NACHDEM SIE SCHON GEMESSEN WAR.** *Der
> Betreiber hat 0.31.0 am laufenden Server angesehen, sieben Befunde gemeldet
> und gesagt:* **„gehe die deutsche sprache sorgfältig durch und mach kein
> schnellschuss. deutsch muss sitzen. von dem aus gehen wir in die anderen
> sprachen."**
>
> **Darauf sind alle 1254 Schlüssel gelesen worden**, jeder gegen seine
> Aufrufstelle. *Der Befund steht im Fahrplan unter 0.31.1, in zehn
> Abschnitten. Dieser Auftrag baut ihn.*

---

## 0. Die sechs Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **DER WORTLAUT ÄNDERT SICH NICHT.** *Was am Bildschirm steht, steht danach Zeichen für Zeichen genauso da — in allen drei Sprachen.* **Die Runde fasst die ABLAGE der Sätze an, nicht ihren Text** | Abschnitt 12 |
| **L2** | **Ein Schlüssel trägt einen ganzen Satzteil**, nie ein Wort ohne seinen Satz. *Die Hervorhebung sitzt als `{word}` DARIN — wo, entscheidet die Sprache* | 0.25.4 |
| **L3** | **Englisch und Türkisch werden MECHANISCH mitgezogen.** *Ihre Hälften werden in genau der Reihenfolge verklebt, in der der Quelltext sie verklebt hat.* **Kein Mensch formuliert dort etwas neu** — das ist 0.31.2 und 0.31.3 | L1 |
| **L4** | **Ein Schlüssel ohne Leser ist kein Text.** *Was nur da ist, um verglichen zu werden, gehört in den Quelltext* | 0.31.0, L1 jener Runde |
| **L5** | **Eine Beschriftung nennt das FACH, nie das WORT.** *Sonst steht das Wort zweimal da — und das eine davon ist gerade das, was der Benutzer auswechselt* | Befund IV |
| **L6** | **Keine Zahl steht zweimal.** *Weder Prosa neben Daten noch Text neben `value=`* | Stolperstein 47 |

> **L1 IST DIE TRAGENDE, UND SIE IST BEWEISBAR.** *Die Runde nimmt vor dem
> ersten Handgriff eine **Gleichlautprobe**: der ganze Quelltext wird gelesen,
> jeder Textruf durch seinen Wert ersetzt, Markup und Weißraum geworfen, und
> über das Ergebnis läuft eine Prüfsumme — je Sprache eine.*
>
> | | vor der Runde |
> |---|---|
> | **de** | `e236b270ec3fb632` · 613 357 Zeichen |
> | **en** | `762a3ba7476cad7e` · 609 590 Zeichen |
> | **tr** | `2d8aeb40e481c6eb` · 611 405 Zeichen |
>
> **Verschmelzen drei Schlüssel zu einem, muss dieselbe Summe herauskommen.**
> *Kommt sie nicht heraus, ist beim Verkleben Text verlorengegangen — und das
> fällt auf, bevor es jemand sieht.* **Die Ausnahmen sind gezählt und
> benannt:** die vier Wortbefunde aus BA 6 ändern den Text absichtlich, und nur
> sie.

---

## Die Fragetafel — vor der ersten Zeile beantwortet

| # | Frage | Antwort |
|---|---|---|
| **F1** | **Ändert sich englischer oder türkischer TEXT?** | **Nein.** *Ihre Hälften werden verklebt, nicht übersetzt. Die Gleichlautprobe hält es fest* |
| **F2** | **Werden dabei Schlüssel WENIGER?** | **Kaum, und darum geht es nicht.** *Bei `A <strong>B</strong> C` verschmelzen A und C; B bleibt als Wortschlüssel stehen.* **Der Gewinn ist, dass ein Satz als Satz dasteht** — mit der Hervorhebung an der Stelle, die die Sprache bestimmt, statt an der, die der Quelltext erzwingt |
| **F3** | **Was wird aus `entry.reportKind`?** | **Er fällt.** *`public/app.js:8345` vergleicht gegen `'report'` wie die fünf Vergleiche daneben. Der Schlüssel hat keinen Leser* |
| **F4** | **Und aus `dialog.sessionExpired`?** | **Er fällt auch.** *Achtmal steht er da, achtmal nur als Vergleich; geworfen wird er unmittelbar nach `showLogin()`, und jede Fangstelle unterdrückt ihn.* **Der Text „Sitzung abgelaufen" erreicht keinen Bildschirm.** An seine Stelle tritt ein Merkmal im Quelltext. *`server.sessionExpired` ist ein anderer Schlüssel, wird wirklich angezeigt und bleibt* |
| **F5** | **Nach welcher Regel heißen die vierzehn Vokabelfelder?** | **Nach L5: das Fach, nie das Wort.** *„Einzahl" und „Mehrzahl" für das Ding selbst; für die übrigen das, was das Wort BEZEICHNET — und die Vorgabe steht ohnehin schon daneben* |
| **F6** | **Und `card.vocabularyResetHint`, der alle vierzehn aufzählt?** | **Die Aufzählung fällt.** *Sie ist eine zweite Abschrift der Daten und veraltet beim ersten geänderten Vorgabewort. Der Satz sagt, WAS geschieht; die Wörter stehen in derselben Karte darüber* |
| **F7** | **Gehören `card.mb50` bis `mb300` in eine Sprachdatei?** | **Nein.** *„50 MB" lautet in allen drei Dateien gleich, und die Zahl steht daneben schon als `value="52428800"`.* **Sie werden im Quelltext aus dem Wert gerechnet** — eine Zahl und eine Einheit sind keine Sprache |
| **F8** | **Was ist mit `&lt;Nummer&gt;` in `card.nameFreedHint`?** | **Raus.** *Eine HTML-Entität in einem Wert verlangt vom Übersetzer, Maskierung zu kennen. Der Satz nennt den Grabstein künftig ohne nachgebaute spitze Klammern* |
| **F9** | **Wie steht es mit der dreifachen Begründung der Exportgrenze?** | **Einmal, und als Auswirkung.** *`server.exportTooBig` und `server.entryTooBig` sagten wörtlich dasselbe, `server.exportGrew` etwas Drittes über denselben Sachverhalt.* **Was zählt, ist: die Grenze ist erreicht, und die Sicherung kennt sie nicht** |
| **F10** | **Und `card.resetMailHint` mit seinen fünf Aussagen?** | **Er wird geteilt.** *Fünf Aussagen in 307 Zeichen in einem Absatz, und die letzte sagt noch einmal, was die erste gesagt hat.* **Die Wiederholung fällt, der Rest bekommt seine Zeile** — nach den drei Regeln des Betreibers vom 11. September |
| **F11** | **Fällt der Weißraum aus den 92 Schlüsseln mit?** | **Ja.** *Dieselben Zeilen werden ohnehin angefasst, und Türkisch trägt ihn bei vier von 92 — er ist erwiesenermaßen entbehrlich.* **Die Wortlautprobe bekommt ihre Buchführung dafür** |
| ~~**F12**~~ | ~~**„Note" bei fünf Sternen?**~~ | **ENTSCHIEDEN AM 13. SEPTEMBER 2026 — und sie fährt NICHT hier.** *Der Betreiber:* „Mir wäre lieber A, also daraus Vokabel zu machen. Da das ja je nach nicht eine Note sondern Ergebnis sein kann, Tageswert, Tagesschnitt, Experiment — was auch immer." **„Note" wird das fünfzehnte Vokabelwort, und das ist eine FUNKTION und keine Sprachpflege** — sie spränge diese Runde von PATCH auf MINOR. *Sie steht im Fahrplan unter **0.32.0**, mit ihrer Kostenrechnung: kein Schema, keine Migration, kein Formatwechsel — aber zwölf Zusagen des Prüfstands, die die Zahl vierzehn festhalten.* **DAMIT HAT DIESE RUNDE KEINE OFFENE FRAGE MEHR** |

---

## Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **Das Muster von 0.25.4 auf die reinen Auszeichnungen** — `A <strong>B</strong> C` wird ein Satz mit `{word}` | **44 Stellen**, davon 18 dreiteilig |
| **BA 2** | **Die Ketten** — Zeilen mit mehr als einer Hervorhebung, die in zwei Sätze zerfallen. *`public/app.js:8890` trägt fünf Schlüssel und ist in Wahrheit zwei Sätze* | rund 20 Zeilen |
| **BA 3** | **Die Bruchstücke ohne Auszeichnung** — Satzzeichenanfänge, Füllwörter, offene Klammern | **42 + 13 + 10** |
| **BA 4** | **Die beiden Schlüssel ohne Leser** — `entry.reportKind`, `dialog.sessionExpired` | 2 Schlüssel, 10 Zeilen |
| **BA 5** | **Stolperstein 47** — die vierzehn Vorgabewörter, die vier Größen, der Grabstein, die Exportgrenze | 4 Stellen |
| **BA 6** | **Die vier Wortbefunde und die vierzehn Beschriftungen** — die einzigen Stellen, an denen sich TEXT ändert | 18 Schlüssel |
| **BA 7** | **Der Erklärbärsaft** — sechs Herleitungen, und `card.resetMailHint` wird geteilt | 7 Stellen |
| **BA 8** | **Der Weißraum** — 92 Schlüssel verlieren die Einrückung des Quelltexts | 92 Schlüssel |

> **DIE REIHENFOLGE IST NICHT BELIEBIG.** *BA 8 kommt zuletzt, weil jeder
> vorherige Abschnitt Werte anfasst und sonst doppelt gearbeitet würde. BA 6
> kommt spät, weil es der einzige Abschnitt ist, den die Gleichlautprobe nicht
> deckt — was sich dort ändert, muss einzeln benannt sein.*

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Die Gleichlautprobe.** *Der gerenderte Text ist in allen drei Sprachen derselbe wie vor der Runde — bis auf die benannten Stellen aus BA 6* |
| **2** | **Kein Schlüssel ist mehr ein blosses Füllwort.** *Kein Wert beginnt mit einem Satzzeichen, keiner ist ein einzelnes Funktionswort, keiner trägt eine unpaarige Klammer* |
| **3** | **Kein Programmablauf läuft durch die Sprachdatei.** *Kein `===` und kein `!==` steht neben einem `t(`-Ruf* |
| **4** | **Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge** |
| **5** | **Jeder `{word}`-Platzhalter hat seinen `tMark()`-Ruf** — und jeder `tMark()`-Ruf einen Wert mit `{word}` darin |
| **6** | **Die vierzehn Vokabelbeschriftungen nennen kein Vorgabewort.** *Keine von ihnen enthält den Wert, den sie setzt* |
| **7** | **Keine Zahl steht zweimal.** *Die vier Größen kommen aus ihrem `value`, und `card.vocabularyResetHint` zählt nichts mehr auf* |
| **8** | **Kein Wert trägt eine HTML-Entität** |
| **9** | **Kein Wert trägt einen Zeilenumbruch oder zwei Leerzeichen** — in keiner der drei Dateien |
| **10** | **Kein Eintrag der Umbenennungstafel zeigt ins Leere** *(`tools/keys.json`)*. *Sie ist die Deutsch-nach-Englisch-Tafel aus 0.8.x und kein Verzeichnis der Wanderungen; 0.31.0 hat die elf ersatzlos gestrichenen Schlüssel daraus ENTFERNT.* **Hier ist es anders: ein verschmolzener Schlüssel hat einen Nachfolger**, und der alte deutsche Name zeigt ab jetzt auf ihn |
| **11** | **Die Wortlautprobe ist vollständig nachgeführt** — jede Wegnahme, jede Änderung mit ihrer Begründung |

**Jede Zusage bekommt ihre Gegenprobe, und jede wird GEFAHREN.** *Eine stumme
ist ein Fund — 0.31.0 hat das teuer gelernt.*

---

## Was ausdrücklich NICHT gebaut wird

- **Kein englischer und kein türkischer Satz wird neu formuliert.** *Das sind
  0.31.2 und 0.31.3, und sie haben es nach dieser Runde leichter: sie
  übersetzen ganze Sätze statt Bruchstücke.*
- **„Note" bleibt stehen** — sie wird in **0.32.0** das fünfzehnte Vokabelwort *(F12, dort entschieden)*.
- **Keine Anordnung wird angefasst.** *Diese Runde fasst Sätze an, keine
  Oberfläche.*
- **Die Papiere behalten ihre Anführungszeichen.** *Dass sie dieselbe
  Angewohnheit tragen wie die Sprachdateien vor 0.31.0 — `„…"` mit geradem
  Schlusszeichen, im Fahrplan 173-mal — ist gesehen und ausdrücklich
  zurückgestellt: es ist gewachsene Hauskonvention und keine Oberfläche.*
