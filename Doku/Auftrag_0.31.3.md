# Auftrag 0.31.3 — „Türkisch sitzt"

**Geschrieben am 13. September 2026 · gebaut auf 0.31.2 · PATCH, kein
Schemaanteil.**

> **DIE LETZTE DER VIER RUNDEN DER 31er-STRECKE.** *0.31.0 hat die Sprachdateien
> gegengelesen, 0.31.1 hat die zersägten Sätze zusammengesetzt, 0.31.2 hat
> Englisch auf den Stand des Deutschen gebracht.* **Jetzt Türkisch — und es ist
> die schwerste der drei Sprachen**, weil sie die einzige ist, die eine wörtliche
> Übersetzung aus dem Deutschen **grammatikalisch** nicht verzeiht.
>
> *Der Betreiber hat wieder eine Vorlage von Google Gemini mitgebracht —*
> `Doku/I18N_GENERATE_TR.md`, **fünf Stolperfallen** — *und der Zuschnitt ist
> derselbe wie bei 0.31.2:* **die Vorlage ist eine Eingabe neben den Messungen
> und kein Gesetz.** *Diese Runde geht durch alle 1197 türkischen Schlüssel,
> jeden gegen seinen deutschen Satz.*

---

## 0. Die Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **DEUTSCH UND ENGLISCH SIND DIE UNVERÄNDERLICHE BASIS.** *Kein deutscher und kein englischer Wert wird angefasst — auch nicht „nur kurz".* **Was auffällt, geht ins Sammelblatt** | 0.31.2, Leitplanke L1; jetzt gilt sie für zwei Dateien statt für eine |
| **L2** | **ÜBERSETZT WIRD DIE ABSICHT, NICHT DIE WORTSTELLUNG — und im Türkischen heißt das: DAS VERB GEHT ANS ENDE.** *Türkisch ist agglutinierend und SOV. Ein türkischer Satz, der dem deutschen Wort für Wort folgt, ist nicht eine schlechtere Übersetzung, sondern keine* | 0.24.3; die Vorlage nennt es Stolperfalle 1 |
| **L3** | **DIESELBE STIMME, DIESELBE KÜRZE.** *Was auf Deutsch in einem Satz steht, steht auf Türkisch in einem* | Regeln des Betreibers vom 11.9.2026 |
| **L4** | **DIE VERBOTSLISTE WIRD EIN WÄCHTER UND KEIN MERKZETTEL — und er liest WORTSTÄMME und keine ganzen Wörter.** *Türkisch klebt seine Endungen an: „hap" steht als **„haptan"**, „sabit resim" als **„sabit resmi"**. Ein Wächter mit Wortgrenzen findet beide nicht* | 0.31.2, L4 — **hier verschärft, und das ist beim Messen dieses Auftrags gelernt worden** |
| **L5** | **KEIN PLATZ WANDERT — aber seine STELLE im Satz schon.** *`{word}`, `{word2}`, `{n}` heißen gleich und keiner fällt weg; wo sie stehen, entscheidet die türkische Grammatik und nicht die deutsche* | 0.31.1, Regel S12 |
| **L6** | **tr-TR, und die Anführungszeichen sind türkisch.** *`„…“` gibt es in der türkischen Typografie nicht* | 0.24.4, F4; 0.31.0 hat das Paar dort ausdrücklich nur geschlossen und die Frage vertagt |
| **L7** | **DIE MEHRZAHL NACH EINER ZAHL BLEIBT EINZAHL.** *„3 dosya" und nicht „3 dosyalar" — das ist türkische Grammatik und kein Fehler* | **NEU, und sie ist die Gegenleitplanke zu Stolperfalle 2 der Vorlage** |

> **L1 IST DIE TRAGENDE, UND SIE IST BEWEISBAR — mit demselben Werkzeug wie in
> 0.31.1 und 0.31.2.** *Die Gleichlautprobe rechnet je Sprache zwei Prüfsummen;
> die vier von Deutsch und Englisch müssen nach dieser Runde **Zeichen für
> Zeichen dieselben** sein.*
>
> | | vor der Runde |
> |---|---|
> | **de/one** | `7c1fe1a927f158f9` |
> | **de/other** | `0b443d44733cc668` |
> | **en/one** | `2f8e5b3abe58f9fd` |
> | **en/other** | `39489ec6ae18020b` |
>
> **ÄNDERT SICH EINE DER VIER, IST DIE BASIS ANGEFASST WORDEN** — *und das ist in
> dieser Runde kein Handgriff, sondern ein Fehler.* **Für Englisch hält das
> zusätzlich der Vergleichsstand** (`tools/englisch-0312.json`, Tafel
> `EG_CHANGED_AFTER_0312` — leer): *wer dort einen Wert anfasst, ohne ihn zu
> benennen, macht eine zweite Zeile rot.*

---

## Die Vorlage — Zeile für Zeile nachgemessen

**ALLE ZITATE STIMMEN.** *Jeder genannte Schlüssel existiert, und jeder liest
sich genau so, wie die Vorlage ihn wiedergibt* — **dieselbe gute Nachricht wie
bei den beiden Vorlagen davor.**

| | die Vorlage sagt | gemessen |
|---|---|---|
| **Stolperfalle 1** *(Grammatik-Kollaps)* | vier Unfälle | **Vier stimmen, und es sind mehr:** *das holprige „**Şu:**" steht in **vier** Werten und nicht in zwei — dazu `card.searchDomainTip` und `card.weightExplainHint`.* **Die Wortdopplung von `card.linkListHint` („sayılır … sayılır") ist gemessen und steht so da** |
| **Stolperfalle 2** *(Plural-Bug)* | fünf Vokabeln | **Alle fünf stimmen: `entryOne`/`entryMany`, `dayOne`/`dayMany`, `ratingOne`/`ratingMany`, `reportOne`/`reportMany`, `taskOne`/`taskMany` tragen je denselben Wert.** *Und die Begründung stimmt auch: sie stehen an Stellen OHNE Zahl davor („Bütün {entryMany} …", „Açık {taskMany}")* |
| **Stolperfalle 3** *(Romane)* | fünf Schlüssel | **Vierundvierzig Werte sind mehr als 1,15× so lang wie ihr deutscher** *(von 370, die überhaupt ab 40 Zeichen messen)*. **Die fünf genannten sind die schlimmsten**, `card.vocabularyResetHint` mit **2,84×** an der Spitze |
| **Stolperfalle 4** *(Blacklist)* | zehn Zeilen | **26 Treffer in 23 Schlüsseln** — *und die deutschen Anführungszeichen kommen mit **67 Werten** obendrauf* |
| **Stolperfalle 5** *(UI-Begriffe)* | drei Punkte | **Alle drei stimmen.** *„Cihaz gibi" steht zweimal (`card.likeDevice` und der Satz in `card.themeHint`), „Yedekleme" als Substantiv durchgehend, „son görülme" einmal* |

### Was die Vorlage nicht sehen konnte

| | |
|---|---|
| **DIE ANREDE IST FAST EINHEITLICH — und der eine Ausreißer ist messbar** | *78 türkische Werte sprechen den Benutzer vertraut an (sen-Formen), **genau einer** höflich:* `card.emailsDoubledHint` *(„değiştirin ya da boşaltın").* **Das Deutsche sagt in 46 Werten „du"** — *die türkische Datei folgt ihm also, bis auf diese eine Stelle* |
| **DIE MEHRZAHL NACH EINER ZAHL IST HEUTE ÜBERALL RICHTIG** | *kein einziger Wert schreibt „{n} … -ler/-lar". **28 Mehrzahlpaare tragen in beiden Formen denselben Satz — und das ist korrektes Türkisch**, nicht der Plural-Bug.* **Dreizehn Paare unterscheiden, und dort steht keine Zahl vor dem Wort** |
| **Eine HTML-Entität steht noch in einem türkischen Wert** | *`card.nameFreedHint` schreibt „Silinen kullanıcı **&lt;numara&gt;**" nach — dieselbe Stelle wie auf Deutsch (0.31.1) und auf Englisch (0.31.2)* |
| **Sechs türkische Werte tragen MEHR SÄTZE als ihr deutscher** | *und es sind genau die sechs, die auf Englisch auch zu viele hatten: `card.derivativesWebp` · `card.fontSizeHint` · `card.resetMailHint` · `card.storeCaveat` · `server.exportGrew` · `server.exportTooBig`* |
| **Die Plätze stehen schon gleich** | *0 Abweichungen gegen `de.json` — seit 0.31.1 hält das ein Wächter* |
| **Kein türkischer Wert trägt die Einrückung des Quelltexts** | *ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist* |
| **Neun türkische Werte sind mit dem deutschen identisch — und das ist KEIN Befund** | *`card.port`, `card.px`, `card.storePng`, `card.webp`, `list.brand`, `list.dirAZ`, `list.dirZA`, `list.menu`, `list.video`* — **„Menü", „Video", „PNG", „A → Z" heißen auf Türkisch so.** *Sie stehen hier, damit die Runde sie nicht aus Fleiß anfasst* |
| **Türkisch ist heute schon kürzer als Deutsch** | *43 927 gegen 46 852 Zeichen — 93,8 %. **Der Ballast steckt also nicht in der Masse, sondern in einzelnen Karten*** |

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

| # | Frage | Vorschlag |
|---|---|---|
| **F1** | **Die Nummer?** | **0.31.3, PATCH.** *Es ändert sich nur Text in `tr.json`* |
| **F2** | **Wer ist der Leser?** | **Der Betreiber selbst** — *so hat er 0.24.4 (F2) beantwortet: „das bin ich".* **Zu bestätigen** |
| **F3** | **Die Anführungszeichen: `“…”` oder `"…"`?** | **`“…”`.** *0.31.0 hat das Paar in `tr.json` nur geschlossen und ausdrücklich vermerkt, dass es am Ende `“…”` heißen muss. Die Vorlage lässt beides zu; hier wird entschieden.* **67 Werte** |
| **F4** | **Die Anrede: sen oder siz?** | **sen — durchgehend, wie heute in 78 Werten.** *Das Deutsche sagt „du"; eine Oberfläche, die zwischen vertraut und höflich wechselt, liest sich wie zwei Programme.* **Damit fällt `card.emailsDoubledHint` in die Reihe** |
| **F5** | **Und in den vier Briefen?** | **Unpersönlich statt höflich.** *Die Vorlage schlägt „Bu iletiye yanıt vermeyiniz" vor — das ist die siz-Form und bricht F4. Das Deutsche redet an dieser Stelle niemanden an („Antworten darauf liest niemand"), also tut es das Türkische auch nicht:* **„Bu ileti otomatik olarak gönderilmiştir; yanıtlar okunmaz."** *Ein TEXT am Bildschirm des Empfängers — braucht die Zustimmung des Betreibers* |
| **F6** | **Ändert sich die Zahl der Schlüssel?** | **Nein. 1197 bleibt 1197** |
| **F7** | **Was ist mit der letzten HTML-Entität?** | **Sie fällt** — *derselbe Grund wie in 0.31.1 und 0.31.2: eine Entität in einem Wert verlangt vom Übersetzer, Maskierung zu kennen* |
| **F8** | **Darf Türkisch länger werden als Deutsch?** | **Bis 1,15× ab 40 Zeichen, wie bei Englisch.** *Türkisch spart durch Endungen und zahlt bei Höflichkeitsformen; 93,8 % im Ganzen zeigt, dass die Decke hält.* **Vierundvierzig Werte liegen heute darüber** |
| **F9** | **Das türkische Wörterbuch?** | **Es kommt mit.** *`Doku/Woerterbuch_Tuerkisch_0_24_4.md` liegt seit 0.24.4 da, und die offene Frage jener Runde (F3: **`Parola` gegen `Şifre`**) steht noch. Wer 1197 Sätze liest, entscheidet sie unterwegs* — **zu bestätigen** |
| **F10** | **Gibt es eine Wortlautprobe für Türkisch?** | **Nein — einen Vergleichsstand, wie Englisch ihn bekommen hat.** *`tools/tuerkisch-0313.json`, erzeugt von einem Werkzeug daneben, mit leerer Änderungstafel* |
| **F11** | **Was wird aus der Vorlage nach der Runde?** | **Sie bleibt liegen** — *wie die beiden davor: sie ist der Gegenstand, gegen den geprüft wurde* |

---

## Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **Die Verbotsliste wird ein Wächter** — *zuerst, damit er beim Bauen schon rot steht. **Er liest Wortstämme** (L4) und bekommt drei türkische Zeilen dazu: das Anführungszeichenpaar, die Mehrzahl nach einer Zahl und die Anrede* | **11 Muster**, 26 Treffer |
| **BA 2** | **Die Anführungszeichen** — `„…“` wird `“…”` | **67 Werte** |
| **BA 3** | **Der Grammatik-Kollaps** — die vier „Şu:", die Wortdopplung, das Verb an seinen Platz | **mindestens 6 Schlüssel**, und der Durchgang findet die übrigen |
| **BA 4** | **Der Ballast** — Werte über 1,15× | **44** |
| **BA 5** | **Die Metaphern** — „hap", „evden çıkan", „sabit resim", „Şey", „Cihaz gibi", „Çalışma", „yanında duruyor", „son görülme", „içeri girer" | **23 Schlüssel** |
| **BA 6** | **Das Vokabular** — die fünf Mehrzahlwörter bekommen ihr `-ler`/`-lar` | **5** |
| **BA 7** | **Die letzte HTML-Entität** | **1** |
| **BA 8** | **Die vier Briefe** — Ton und Schluss, *nach F5* | **4** |
| **BA 9** | **DER DURCHGANG** — alle 1197 Schlüssel, jeder gegen seinen deutschen Satz. *Das ist der eigentliche Auftrag; BA 1 bis 8 sind das, was schon vor dem Lesen feststand* | **1197** |
| **BA 10** | **Prüfstand, Gegenproben, Papiere, Augenschein auf Türkisch, Fingerprint** | |

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Deutsch und Englisch sind unangetastet.** *Die vier Prüfsummen der Gleichlautprobe sind Zeichen für Zeichen dieselben — und die beiden türkischen sind ANDERE* |
| **2** | **Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge und derselben Gestalt** — 1197, *und ein Mehrzahlpaar bleibt eines* |
| **3** | **Jeder Platzhalter steht in allen drei Dateien gleich** |
| **4** | **Kein türkischer Wert trägt ein Wort der Verbotsliste** — *elf Muster, jedes mit seinem Grund, **und jedes liest Stämme**: der Wächter muss „haptan" und „sabit resmi" finden* |
| **5** | **Kein türkischer Wert trägt ein deutsches Anführungszeichen** — *und keinen geraden Ersatz: `“…”`, paarweise geschlossen* |
| **6** | **Kein türkischer Wert ist deutlich länger als sein deutscher** — *kürzer darf er* |
| **7** | **Kein türkischer Wert trägt mehr Sätze als sein deutscher** |
| **8** | **Kein türkischer Wert trägt eine HTML-Entität** |
| **9** | **Die fünf Vokabelmehrzahlen sind andere als ihre Einzahlen** — *namentlich, und die Einzahlen bleiben, wie sie sind* |
| **10** | **Keine Mehrzahl steht hinter einer Zahl** — *„{n} dosya", nie „{n} dosyalar"; die Zusage gilt für beide Formen jedes Paares* |
| **11** | **Die Anrede ist durchgehend dieselbe** — *sen (F4); eine siz-Form ist ein Fund* |
| **12** | **Kein türkischer Wert trägt die Einrückung des Quelltexts** — *ein Umbruch steht nur in den vier Briefen* |
| **13** | **Der türkische Stand liegt als Vergleichsdatei daneben** — *mit leerer Änderungstafel, wie bei Englisch* |

**Jede Zusage bekommt ihre Gegenprobe, und jede wird GEFAHREN.** *Eine stumme
ist ein Fund — 0.31.0 hat das teuer gelernt, 0.31.1 hat es mit vierzehn
Gegenproben bestätigt, 0.31.2 mit elf und `0 STUMM`.*

> **ZWEI WÄCHTER ÄLTERER RUNDEN STEHEN DABEI, und einer von beiden ist schon
> nachgemessen — das gehört vor die erste Zeile:**
>
> | Wächter | was wirklich passiert |
> |---|---|
> | **0.31.0, Zusage 4** *(„kein Text der drei Dateien mischt `„` mit einem geraden `\"`")* | **Sie bricht NICHT.** *Sie fängt nur die MISCHUNG, und `“…”` ist keine — die zweite Zeile daneben zählt ausdrücklich nur DEUTSCHE Texte mit `„…“`.* **Aber ihr Kommentar ist falsch:** *dort steht „Dass das Paar dort am Ende `“…”` heissen muss, ist die Sache von **0.31.2**" — die Nummer stammt aus der Zeit vor 0.31.1, und gemeint ist DIESE Runde. Der Kommentar wird berichtigt* |
> | **Der Bildschirmtext-Wächter** *(0.22.0)* | *er liest die Werte der Sprachdateien gegen eine Verbotsliste deutscher Begriffe. Eine türkische Umformulierung, die einen deutschen Begriff zitiert, fällt dort auf — das ist erwünscht und keine Hürde* |

---

## Was ausdrücklich NICHT gebaut wird

- **Kein deutscher und kein englischer Wert wird angefasst.** *Was auffällt, geht ins Sammelblatt — dort warten schon die fünf deutschen Funde aus 0.31.2 (Punkt 28) und die elf deutschen Sätze aus `server.js` (Punkt 29).*
- **Keine Anordnung, kein Schemaanteil.** *Austauschformat bleibt 16, `F_ROUTES` bleibt 73.*
- **Kein Schlüssel fällt und keiner kommt dazu.** *Diese Runde formuliert.*
- **Die elf deutschen Sätze aus `server.js` werden NICHT übersetzt** *(Punkt 29)* — **sie brauchen neue Schlüssel in allen drei Dateien, und F6 hält die Zahl bei 1197.** *Sie sind die eigene Runde, die danach kommt.*
- **„Note" bleibt stehen** — *sie wird in **0.32.0** das fünfzehnte Vokabelwort.*
