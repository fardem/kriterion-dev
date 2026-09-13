# Auftrag 0.31.2 — „Englisch sitzt"

**Geschrieben am 13. September 2026 · gebaut auf 0.31.1 · PATCH, kein
Schemaanteil.**

> **DIE RUNDE IST BESTELLT WORDEN, ALS 0.31.1 STAND.** *Der Betreiber hat eine
> Vorlage von Google Gemini mitgebracht — `Doku/I18N_GENERATE_EN.md`, vier
> Stolperfallen — und im selben Atemzug gesagt:*
>
> **„gemini ist nicht unser master. du kannst das auch genauso gut."**
>
> *Und dazu:* **„natürlich lade ich dich auch ein, Englisch auf dem gleichen
> Niveau, Deutsch und Tonart, Kürze zu übersetzen."**
>
> **DAMIT IST DER ZUSCHNITT ENTSCHIEDEN.** *Diese Runde arbeitet nicht vier
> Stolperfallen ab. Sie geht durch alle 1197 englischen Schlüssel, jeden gegen
> seinen deutschen Satz — mit demselben Maßstab, den das Deutsche in 0.31.0 und
> 0.31.1 bekommen hat.* **Die Vorlage ist eine Eingabe neben den Messungen und
> kein Gesetz.**

---

## 0. Die Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **DEUTSCH IST DIE UNVERÄNDERLICHE BASIS.** *Kein deutscher Wert wird angefasst — auch nicht „nur kurz", auch nicht, wenn beim Übersetzen auffällt, dass er besser ginge.* **Was auffällt, geht ins Sammelblatt** | Abschnitt 12; Betreiber am 13.9.2026: *„es kann nur für englisch Vorschläge abgeben etc aber nicht mehr am deutsch meckern"* |
| **L2** | **ÜBERSETZT WIRD DIE ABSICHT, NICHT DIE WORTSTELLUNG.** *Ein englischer Satz, der dem deutschen Wort für Wort folgt, ist eine Abschrift und keine Übersetzung* | 0.24.3, dort schon so entschieden |
| **L3** | **DIESELBE STIMME, DIESELBE KÜRZE.** *Was auf Deutsch in einem Satz steht, steht auf Englisch in einem Satz. Stichwort vorn, eine Aussage je Zeile, Herleitung raus, Auswirkung bleibt* | Regeln des Betreibers vom 11.9.2026 |
| **L4** | **DIE BLACKLIST WIRD EIN WÄCHTER UND KEIN MERKZETTEL.** *Eine Verbotsliste in einem Papier verblasst; eine im Prüfstand wird rot* | Stolperfalle 4 der Vorlage, hier zur Leitplanke erhoben |
| **L5** | **KEIN PLATZ WANDERT.** *`{word}`, `{word2}`, `{extra}` heißen gleich und stehen an der Stelle, an der der englische Satz sie braucht — aber keiner fällt weg und keiner kommt dazu* | 0.31.1, Regel S12 |
| **L6** | **en-GB, und zwar durchgehend.** *`_locale` sagt es seit 0.24.3* | 0.24.3, F4 |

> **L1 IST DIE TRAGENDE, UND SIE IST BEWEISBAR — mit demselben Werkzeug wie in
> 0.31.1.** *Die Gleichlautprobe rechnet je Sprache zwei Prüfsummen; die beiden
> deutschen müssen nach dieser Runde **Zeichen für Zeichen dieselben** sein.*
>
> | | vor der Runde |
> |---|---|
> | **de/one** | `bbd86a64161af49e` |
> | **de/other** | `70b5fb78ad2832b1` |
>
> **Ändert sich eine der beiden, ist Deutsch angefasst worden** — *und das ist
> in dieser Runde kein Handgriff, sondern ein Fehler.*

---

## Die Vorlage — Zeile für Zeile nachgemessen

**ALLE EINUNDZWANZIG ZITATE STIMMEN.** *Jeder genannte Schlüssel existiert, und
jeder liest sich genau so, wie die Vorlage ihn wiedergibt.* **Das ist die gute
Nachricht und dieselbe wie bei `I18N_CLEANUP_DE.md`.**

| | die Vorlage sagt | gemessen |
|---|---|---|
| **Stolperfalle 1** *(Platzhalter)* | *„Größtes Risiko!"* | **Kein Risiko mehr, sondern eine gehaltene Zusage.** *Die Plätze stehen in allen drei Dateien schon gleich — **0 Abweichungen** —, und seit 0.31.1 hält das ein Wächter.* **Die Vorlage konnte das nicht wissen; ihr Punkt bleibt trotzdem richtig** — der Satzbau muss den Platz tragen können |
| **Stolperfalle 2** *(Ballast)* | fünf Schlüssel | **Sieben.** *Es fehlen `card.vocabularyResetHint` (Englisch ist **2,5×** so lang), `card.fontSizeHint` und `server.entryTooBig`* |
| **Stolperfalle 3** *(Metaphern)* | sechs Beispiele | **Richtig, und alle sechs sind da** |
| **Stolperfalle 4** *(Blacklist)* | dreizehn Zeilen | **36 Treffer in 33 Schlüsseln.** *Eine Zeile hat **null** Treffer: die US-Schreibung. Kein Befund — bleibt als Leitplanke, ist aber keine Arbeit* |

**UND WAS DIE VORLAGE NICHT SIEHT, weil sie den Bestand nicht messen kann:**

| | |
|---|---|
| **Sechs englische Werte tragen MEHR SÄTZE als ihr deutscher** | *`card.derivativesWebp` · `card.fontSizeHint` · `card.resetMailHint` · `card.storeCaveat` · `server.exportGrew` · `server.exportTooBig`* |
| **Eine HTML-Entität steht noch in einem englischen Wert** | *0.31.1 hat sie ausdrücklich nur auf Deutsch herausgenommen — Zusage 8 jener Runde war eine Runde lang bewusst halb* |
| **Vier englische Werte tragen einen Zeilenumbruch** | *und das sind die vier Briefe, wo er ein Absatz ist. Kein Befund* |
| **Kein englischer Wert trägt die Einrückung des Quelltexts** | *0.31.1 hat sie in allen drei Dateien genommen* |

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

| # | Frage | Vorschlag |
|---|---|---|
| **F1** | **Die Nummer?** | **0.31.2, PATCH.** *Es ändert sich nur Text in `en.json`; die Installation kann danach nichts, was sie vorher nicht konnte* |
| **F2** | **Wer ist der Leser?** | **Der Betreiber selbst** — *wie bei 0.24.3 (F5) und 0.24.4 (F2).* **Zu bestätigen** |
| **F3** | **„Auto" — oder „System default"?** | **„Auto".** *Die deutsche Karte sagt „Auto", und der Wert benennt dieselbe Sache. „System default" beschreibt das Verhalten, statt es zu benennen, und ist doppelt so lang.* **Die Vorlage lässt beides zu; hier wird entschieden** |
| **F4** | **Ändert sich die Zahl der Schlüssel?** | **Nein. 1197 bleibt 1197.** *Diese Runde formuliert, sie räumt nicht* |
| **F5** | **Was ist mit der letzten HTML-Entität?** | **Sie fällt.** *0.31.1 hat den Grund benannt: eine Entität in einem Wert verlangt vom Übersetzer, Maskierung zu kennen. Was dort für Deutsch galt, gilt hier für Englisch* |
| **F6** | **Die vier Briefe — „Nobody reads replies"?** | **Wird „This inbox is not monitored."** *Ein Transaktionsbrief ist keine Plauderei. Das ist ein TEXT am Bildschirm des Empfängers und braucht deshalb die Zustimmung des Betreibers* |
| **F7** | **Dürfen englische Sätze KÜRZER werden als ihre deutschen?** | **Ja, und oft sollen sie es.** *Englisch braucht für dieselbe Aussage regelmäßig weniger Zeichen als Deutsch. Eine Zusage „gleich lang" wäre falsch; geprüft wird die andere Richtung — deutlich LÄNGER ist ein Befund* |
| **F8** | **Was wird aus der Vorlage nach der Runde?** | **Sie bleibt liegen**, *wie `I18N_CLEANUP_DE.md`: sie ist der Gegenstand, gegen den geprüft wurde, und 0.31.3 liest sie für Türkisch noch einmal* |
| **F9** | **Gibt es eine Wortlautprobe für Englisch?** | **Nein, und das ist eine Entscheidung.** *Die deutsche hält den Stand einer ABNAHME fest (0681d42). Für Englisch gibt es keine solche Abnahme — diese Runde IST sie.* **Was sie stattdessen bekommt: eine Abdruckdatei am Ende, gegen die 0.31.3 und alles danach prüfen kann** |

---

## Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **Die Blacklist wird ein Wächter** — *zuerst, damit er beim Bauen schon rot steht und nicht erst am Ende* | 13 Zeilen, **36 Treffer** |
| **BA 2** | **Der Ballast** — sieben Schlüssel, deren englischer Wert länger ist als der deutsche | **7** |
| **BA 3** | **Die alten Metaphern** — was die Blacklist findet | **33 Schlüssel** |
| **BA 4** | **Die letzte HTML-Entität** | **1** |
| **BA 5** | **Die vier Briefe** — Ton und Anrede, *nach F6* | **4** |
| **BA 6** | **DER DURCHGANG** — alle 1197 Schlüssel, jeder gegen seinen deutschen Satz. *Das ist der eigentliche Auftrag; BA 1 bis 5 sind das, was schon vor dem Lesen feststand* | **1197** |
| **BA 7** | **Prüfstand, Gegenproben, Papiere, Augenschein auf Englisch, Fingerprint** | |

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Deutsch ist unangetastet.** *Die beiden deutschen Prüfsummen der Gleichlautprobe sind Zeichen für Zeichen dieselben* |
| **2** | **Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge** — 1197 |
| **3** | **Jeder Platzhalter steht in allen drei Dateien gleich** — *keiner fällt weg, keiner kommt dazu* |
| **4** | **Kein englischer Wert trägt ein Wort der Blacklist** — *dreizehn Muster, und jedes mit seinem Grund* |
| **5** | **Kein englischer Wert trägt eine HTML-Entität** |
| **6** | **Kein englischer Wert ist deutlich länger als sein deutscher** — *kürzer darf er, länger nicht (F7)* |
| **7** | **Kein englischer Wert trägt mehr Sätze als sein deutscher** |
| **8** | **en-GB: keine US-Schreibung** — *heute schon grün, und das soll so bleiben* |
| **9** | **Kein englischer Wert trägt die Einrückung des Quelltexts** — *ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist* |
| **10** | **Der englische Stand liegt als Abdruckdatei daneben** — *damit die nächste Runde prüfen kann, was sie anfasst* |

**Jede Zusage bekommt ihre Gegenprobe, und jede wird GEFAHREN.** *Eine stumme
ist ein Fund — 0.31.0 hat das teuer gelernt, 0.31.1 hat es mit vierzehn
Gegenproben und `0 STUMM` bestätigt.*

---

## Was ausdrücklich NICHT gebaut wird

- **Kein deutscher und kein türkischer Wert wird angefasst.** *Türkisch ist 0.31.3.*
- **Keine Anordnung, kein Schemaanteil.** *Austauschformat bleibt 16, `F_ROUTES` bleibt 73.*
- **Kein Schlüssel fällt und keiner kommt dazu.** *Diese Runde formuliert.*
- **„Note" bleibt stehen** — *sie wird in **0.32.0** das fünfzehnte Vokabelwort.*
