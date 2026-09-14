# Auftrag 0.31.4 — „Nach einer Zahl die Einzahl, sonst die Mehrzahl"

**Geschrieben am 13. September 2026 · gebaut auf 0.31.3 · MINOR, kein
Schemaanteil am Austauschformat.**

> **DER BETREIBER HAT ENTSCHIEDEN, und zwar die Sache und nicht die
> Formulierung.** *Am 13. September 2026, nachdem 0.31.3 ihm Punkt 32 mit drei
> Wegen vorgelegt hatte:*
>
> **„Dann machen da so das an den Stellen wo ein Zahl steht das Wort für
> Einzahlig kommt für die anderen der Mehrzlige und dort trage ich dann z. B.
> Ögeler ein"** — *im Wortlaut.*
>
> *Das ist **Weg B** aus Punkt 32: ein Platz je Stellung. Und die gute
> Nachricht, die beim Messen herausgekommen ist:* **die beiden Plätze gibt es
> schon.** *Jedes Vokabelwort hat `…One` und `…Many`, jedes Wortpaar aus Punkt
> 32 hat Einzahl und Mehrzahl. Was fehlt, ist nicht ein Platz — es ist die
> Auskunft, WELCHEN der beiden eine Stelle mit Zahl davor nehmen muss.*

---

## 0. Die Leitplanken

| # | Regel | woher |
|---|---|---|
| **L1** | **DIE REGEL GEHÖRT DER SPRACHE UND NICHT DEM CODE.** *Der Kommentar an `plural()` sagt es seit 0.24.0 selbst: „Der Vergleich wäre die deutsche Regel, festgeschrieben im Code; die Regel gehört aber der Sprache (Konzept 4.3)."* **Also steht sie in der Sprachdatei** | Konzept 4.3; `public/app.js`, `plural()` |
| **L2** | **`Intl.PluralRules` KANN ES NICHT WISSEN.** *Sie wählt nach dem **Wert** von `n`; das Türkische wählt nach der **Stellung** — steht eine Zahl davor oder nicht. `select(3)` ist `other`, und das heißt im Türkischen nicht „hänge `-lar` an"* | 0.31.3, nachrecherchiert |
| **L3** | **DEUTSCH UND ENGLISCH ÄNDERN SICH NICHT — kein Zeichen.** *Die vier Prüfsummen der Gleichlautprobe bleiben, wie sie sind* | 0.31.2 L1, 0.31.3 L1 |
| **L4** | **KEIN SATZ WIRD UMGESCHRIEBEN, DER NUR WEGEN DER EINZAHL SO DASTEHT.** *0.24.4 hat zwölf türkische Sätze eigens um die Einzahl herum gebaut. Sie bleiben in dieser Runde stehen und werden nachgesehen, nicht nachgezogen* | 0.24.4, TR-S4 |
| **L5** | **KEINE ENDUNG AN EINEM PLATZHALTER.** *Gilt weiter und unverändert* | 0.24.4, TR-S3 |

---

## Die Messung, auf der das steht

| | Stellen |
|---|---|
| **Vokabelwort mit Zahl davor** *(„3 öğe")* | **25** — 18 im Quelltext, 7 in der Datei |
| **Vokabelwort ohne Zahl** *(„öğeler")* | **34** — 28 Sätze, 6 bloße Beschriftungen |
| **Wortpaare aus Punkt 32 mit Zahl davor** *(„3 yorumlar" — heute falsch)* | **11** in 5 Paaren |

**Von den 28 Sätzen verlangen rund neunzehn die Einzahl ohnehin** — *nach `her`,
nach `kaç`, in der Verneinung, im generischen Satz.* **Die bleiben unberührt
(L4); sie lesen sich mit „Öğeler" nicht besser, sondern falsch.**

---

## Die Fragetafel

| # | Frage | Vorschlag |
|---|---|---|
| **F1** | **Die Nummer?** | **0.31.4, MINOR.** *Ein Schlüssel kommt in alle drei Dateien; `LANG_KEY_COUNT` steigt von 1197 auf 1198* |
| **F2** | **Wie heißt der neue Schlüssel?** | **`_afterNumber`**, neben `_locale` und `_name`. *Werte: `"one"` (nach einer Zahl die Einzahl) oder `"plural"` (die Zahl wählt, wie bisher).* `de`/`en`: **`"plural"`** · `tr`: **`"one"`** |
| **F3** | **Was, wenn eine Sprachdatei ihn nicht hat?** | **`"plural"`** — *das heutige Verhalten. Eine fremde vierte Datei (0.24.0: „wer eine weitere hineinlegt, hat eine Sprache mehr") darf daran nicht scheitern* |
| **F4** | **Welche Werte bekommen ihre Mehrzahl?** | **Die fünf Vokabelmehrzahlen** *(`entryMany`, `dayMany`, `reportMany`, `taskMany`, `ratingMany`)* — **als VORGABE in `tr.json`.** *Was der Betreiber stattdessen einträgt, steht in der Datenbank; er hat „Öğeler" angekündigt* |
| **F5** | **Und die fünf Wortpaare aus Punkt 32?** | **Sie bleiben, wie sie sind** — *„yorum"/„yorumlar" ist schon richtig. Sie waren nur an der falschen Stelle gelesen, und genau das behebt diese Runde* |
| **F6** | **Was wird aus Zusage 9 von 0.31.3?** | **Sie dreht sich um, und diesmal ist es kein Streit:** *bis 0.31.3 mussten die fünf Paare GLEICH sein, weil ein Platz zwei Stellen tragen musste. Ab jetzt müssen sie VERSCHIEDEN sein* |
| **F7** | **Und der Wächter von 0.24.4 (T2)?** | **Er dreht sich mit.** *Sein Kommentar trägt die Entscheidung vom 8.9.2026 — sie wird nicht gelöscht, sondern fortgeschrieben: dieselbe Regel, neuer Mechanismus* |
| **F8** | **Woran zeigt sich, dass es wirklich stimmt?** | **Am gerenderten Bildschirmtext und nicht an der Datei.** *Die Runde braucht eine Probe, die die Zählerstellen AUSFÜLLT und nachsieht, dass dort kein `-ler`/`-lar` steht* |

---

## Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **`_afterNumber` in die drei Sprachdateien** — *`de`/`en`: `"plural"`, `tr`: `"one"`* | **3** |
| **BA 2** | **`counted()` im Quelltext** — *eine Funktion neben `plural()`: liest `_afterNumber` und nimmt bei `"one"` immer die Einzahl. **Sie ersetzt `plural()` nur dort, wo eine ZAHL davorsteht** — in `vThing`/`vTime`/`vReport`/`vTask`/`vRating` und in den beiden `countWord`-Helfern* | **7 Stellen** |
| **BA 3** | **Die fünf Vokabelmehrzahlen bekommen ihr `-ler`/`-lar`** — *in `tr.json`, als Vorgabe* | **5** |
| **BA 3b** | **JEDER SATZ WÄHLT SEINE FORM — und das ist der eigentliche Handgriff.** *Die achtundzwanzig zahllosen Stellen sind NICHT gleich: sechs verlangen die Einzahl, auch ohne Zahl davor* | **~6 + 3** |
| **BA 4** | **Die Wächter drehen mit** — *0.24.4 T2, 0.31.3 Zusage 9 und Zusage 10; `LANG_KEY_COUNT` 1197 → 1198* | |
| **BA 5** | **Die Probe am gerenderten Text** *(F8)* — *jede Zählerstelle ausgefüllt, kein `-ler`/`-lar` dahinter; und die Gegenrichtung: die zahllosen Stellen tragen sehr wohl eines* | |
| **BA 6** | **Augenschein auf Türkisch** — *derselbe Weg wie in 0.31.3: echter Browser, echte Instanz* | |
| **BA 7** | **Gegenproben, Papiere, Fingerprint** | |

---

## BA 3b im Einzelnen — die sechs, die die Einzahl verlangen

**GEMESSEN, indem die Mehrzahlform eingesetzt und der Satz gelesen wurde:**

| Schlüssel | mit „Öğeler" | warum die Einzahl |
|---|---|---|
| `card.blocksHint` | „**her Öğeler** için" | `her` verlangt im Türkischen immer die Einzahl |
| `card.orderAppliesNote` | „**her Öğeler** üzerinde" | dasselbe |
| `card.criteriaAdminHint` | „yıldız verilen **Öğeler sayısı**" | `sayısı` („die Zahl der …") verlangt die Einzahl |
| `card.criteriaOrderHint` | dasselbe | dasselbe |
| `list.showAll` | „Bütün **Öğeler** listesini" | Substantivkette — das erste Glied steht in der Einzahl |
| `card.partOrderHint` | „Tek tek **Öğeler** vermek" | *(Grenzfall; „tek tek öğeler" geht auch — beim Bauen entscheiden)* |

**Sie bekommen `{…One}` statt `{…Many}`** — *der Satz wählt seine Form, nicht der
Code. Das ist L1 an der zweiten Stelle.*

> **UND DREI HANDGRIFFE AUS 0.31.3 FALLEN WIEDER WEG**, *weil sie die Krücke
> waren, die dieser Mechanismus ersetzt:*
>
> | Schlüssel | 0.31.3 | 0.31.4 |
> |---|---|---|
> | `list.openTasks` | „Açık {taskMany} **listesi**" | **„Açık {taskMany}"** → *„Açık Görevler"* |
> | `list.noCategory` | „Kategorisiz {entryMany} **listesi**" | **„Kategorisiz {entryMany}"** → *„Kategorisiz Öğeler"* |
> | `list.newCommentsHint` | „Yeni **yorum** ve {ratingMany}" | **„Yeni yorumlar ve {ratingMany}"** → *beide Glieder Mehrzahl* |
>
> *0.31.3 hat sie um die Einzahl herum gebaut, weil es nichts Besseres gab. Jetzt
> gibt es etwas Besseres, und die Krücke geht.*

---

## Die Zusage, die sich dafür öffnen muss

**ZUSAGE 3 VON 0.31.3 — „jeder Platzhalter des deutschen Satzes steht auch im
türkischen" — WÜRDE BA 3b ROT MACHEN.** *Deutsch schreibt „für alle
{entryMany}", Türkisch muss „her {entryOne} için" schreiben.*

> **SIE WIRD GEÖFFNET, ABER NUR UM EINEN SPALT:** *die beiden Formen EINES
> Vokabelworts gelten als derselbe Platz* — `entryOne` ↔ `entryMany`,
> `dayOne` ↔ `dayMany`, und so für alle fünf Paare. **Alles andere bleibt, wie
> es ist: ein `{bytes}`, das fehlt, ist weiter ein roter Punkt.**
>
> *Der Grund steht in der Sprache: welche Form ein Satz braucht, entscheidet
> seine Grammatik, und die ist je Sprache eine andere. Genau dafür gibt es zwei
> Plätze.*

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Deutsch und Englisch sind unangetastet** — *die vier Prüfsummen Zeichen für Zeichen dieselben* |
| **2** | **Jede der drei Dateien nennt `_afterNumber`, und der Wert ist einer der beiden erlaubten** — *`de`/`en` sagen `plural`, `tr` sagt `one`* |
| **3** | **Eine Datei ohne den Schlüssel fällt auf `plural`** — *und das ist geprüft und nicht behauptet* |
| **4** | **Die fünf Vokabelpaare tragen auf Türkisch jetzt VERSCHIEDENE Wörter** — *namentlich, und die Mehrzahl endet auf `-ler`/`-lar`* |
| **5** | **Hinter einer Zahl steht am BILDSCHIRM keine Mehrzahl** — *jede der 25 + 11 Stellen ausgefüllt und nachgesehen* |
| **6** | **Ohne Zahl steht sehr wohl eine** — *die Gegenrichtung; ohne sie wäre die Runde grün, wenn man alle Mehrzahlen löschte* |
| **7** | **`counted()` liest die Datei und nicht die Locale** — *keine Liste von Sprachkennungen im Code (L1)* |
| **8** | **1198 Schlüssel in allen drei Dateien, dieselbe Folge, dieselbe Gestalt** |
| **9** | **Die zwölf Sätze, die 0.24.4 um die Einzahl herum gebaut hat, sind unverändert** *(L4)* |
| **10** | **Ein Platzhalter darf nur innerhalb SEINES Vokabelpaares wechseln** — *`{entryOne}` für `{entryMany}` ja, `{bytes}` für `{n}` nein* |
| **11** | **Jeder Satz, der `her` oder `sayısı` trägt, steht mit der Einzahlform da** — *namentlich, damit BA 3b nicht beim nächsten Handgriff zurückfällt* |

---

## Was ausdrücklich NICHT gebaut wird

- **Kein fünfzehnter Vokabelplatz.** *Punkt 19 bleibt abgelehnt — er ist auch nicht nötig: die beiden Plätze gibt es schon.*
- **Kein deutscher und kein englischer Wert wird angefasst.**
- **Keine Liste von Sprachen im Code.** *Die Datei sagt es (L1).*
- **Die sechs bloßen Beschriftungen im Quelltext** *(„TEST GÜNÜ" über der Liste)* **werden nicht umgebaut** — *sie lesen ab jetzt von selbst richtig, weil sie `…Many` nehmen und das jetzt „Test günleri" heißt.*
- **Die zwölf Sätze aus 0.24.4 werden nicht umgeschrieben** *(L4).*
