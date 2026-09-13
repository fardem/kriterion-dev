# Änderungsprotokoll 0.31.3 — „Türkisch sitzt"

**Auftrag 0.31.3 · 13. September 2026 · gebaut auf 0.31.2 · PATCH, kein
Schemaanteil.**

> **FINGERPRINT DIESER RUNDE: `68cd1c14`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`68cd1c14`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`68cd1c14`** |
> | **Aus der laufenden Installation gemeldet** *(Betreiber)* | *steht aus* |
>
> **ZWEI QUELLEN, EIN WERT — alle achtzehn Einzelwerte gleich.** *Die dritte
> kommt aus dem Feld.* **Die Runde fasst `public/languages/tr.json` und
> `package.json` an; von den achtzehn Dateien des Fingerprints sind das
> genau diese zwei** — *`testbench.js`, `counterproof.js` und `tools/` liegen
> nicht im Image und gehen ihn nichts an.*

---

## Die letzte der vier Runden — und die schwerste der drei Sprachen

**0.31.0 hat die Sprachdateien gegengelesen, 0.31.1 hat die zersägten Sätze
zusammengesetzt, 0.31.2 hat Englisch auf den Stand des Deutschen gebracht.**
*Diese Runde ist durch alle **1197 türkischen Schlüssel** gegangen, jeden gegen
seinen deutschen Satz.*

**TÜRKISCH IST AGGLUTINIEREND UND SOV.** *Ein türkischer Satz, der dem deutschen
Wort für Wort folgt, ist nicht eine schlechtere Übersetzung — er ist keine.* An
genau dieser Sprache ist das Zersägen der Sätze schon einmal zerbrochen
(0.25.4), und genau deshalb gab es 0.31.1.

**DIE VORLAGE KAM WIEDER VON AUSSEN** — `Doku/I18N_GENERATE_TR.md`, von Google
Gemini geschrieben, fünf Stolperfallen. *Zuschnitt wie bei 0.31.2:* **die
Vorlage ist eine Eingabe neben den Messungen und kein Gesetz.**

---

## DAS WICHTIGSTE ERGEBNIS DIESER RUNDE: ZWEI VORSCHLÄGE DER VORLAGE SIND ABGELEHNT

*Und beide Male steht eine **Entscheidung des Betreibers** dagegen, beide Male
ist sie schon ein Wächter im Prüfstand, und beide Male hätte das Befolgen der
Vorlage einen Fehler EINGEBAUT statt einen zu beheben.*

### 1 · Stolperfalle 2 — „die fünf Vokabelmehrzahlen brauchen ihr `-ler`/`-lar`"

**Die Vorlage nennt es einen „fatalen Plural-Bug, der die UI zerstört".** *Der
Auftrag hat den Vorschlag als **BA 6** und **Zusage 9** übernommen.* **BA 6 IST
NICHT GEBAUT**, und der Grund ist gemessen:

| | |
|---|---|
| **Jedes Vokabelwort hat GENAU EINEN Mehrzahlplatz** | *`vocabulary.entryMany`, `dayMany`, `reportMany`, `taskMany`, `ratingMany` — je ein Feld* |
| **Und der wird an ZWEI Orten gelesen** | *hinter einer Zahl (`3 {entryMany}`) und als Wort im Satz (`bütün {entryMany}`)* |
| **GEMESSEN, wie oft eine ZAHL davorsteht** | **18 Stellen im Quelltext** *(`${n} ${vThing(n)}` und seine vier Geschwister)* + **6 Stellen in der Sprachdatei** *(`{length} {thing}`, `{items} {thing}`, `{entries} {thing}`, `{usage_count} {thing}`, `{n} {dayWord}`, `{length} {task}`)* = **24** |
| **Was nach dem Vorschlag dort stünde** | **„3 Öğeler"** — *und das ist kein Türkisch* |

> **DER AUFTRAG WIDERSPRICHT SICH HIER SELBST, und seine eigene Gegenleitplanke
> hat recht.** *L7 — neu in diesem Auftrag — sagt:* **„DIE MEHRZAHL NACH EINER
> ZAHL BLEIBT EINZAHL."** *Zusage 10 hält dasselbe fest.* **BA 6 und L7 können
> nicht beide gebaut werden**; gebaut ist L7.
>
> **UND ES IST NICHT MEINE ENTSCHEIDUNG, SONDERN EINE ALTE:**
>
> | Ort | was dort steht |
> |---|---|
> | **Wörterbuch Türkisch, TR-S4** | *Der Betreiber am 8. September 2026 im Wortlaut:* **„1 Öğe, 4 Öğe, beides geht. Dann ist die Vorgabe für beides halt zwei mal das gleiche."** |
> | **Fehler und Ideen, Punkt 19** | *Der fünfzehnte Vokabelplatz ist* **„abgelehnt, nicht vertagt"** |
> | **Prüfstand, seit 0.24.4** | *`T2: die fuenf Vokabelpaare tragen auf Tuerkisch dasselbe Wort` — mit dem Kommentar:* **„wer eines der fünf Wörter auf eine Mehrzahlform ändert, ändert eine Sprachentscheidung und wird namentlich rot"** |
>
> **WAS DIE VORLAGE NICHT SEHEN KONNTE:** *sie hat die **Sprachdatei** gelesen
> und dort recht — in `tr.json` steht vor `{entryMany}` wirklich nie eine Zahl.
> Die Zahl kommt aus dem **Quelltext**, und den hat sie nicht.*

**ZUSAGE 9 STEHT DESHALB UMGEKEHRT IM PRÜFSTAND** — *die fünf Paare tragen
dasselbe Wort, und die Messung der 24 Stellen steht als eigene Zeile daneben.*
**Wäre die Zahl null, wäre die Vorlage im Recht und diese Zusage falsch.**
*Gegenprobe **997** baut den Vorschlag der Vorlage ein und macht zwei Wachen
zugleich rot.*

### 2 · Stolperfalle 5.2 — „`Yedek` ist natürlicher als `Yedekleme`"

**Der Betreiber am 10. September 2026, nach zwei Quellen und einer Rückfrage:**

> **„immer nur das wort yedekleme"**

*Der Wächter dazu steht seit **0.25.1** im Prüfstand* (`Kein alleinstehendes
„yedek" mehr`), *und die Gegenprobe 787 hält ihn.* **Kein einziges `Yedekleme`
ist zu `Yedek` geworden** — auch `card.backupNow` bleibt „Şimdi yedekleme yap"
und wird nicht „Şimdi yedekle": *das `yedekle` des Vorschlags fiele in genau
dieses Muster.*

> **EIN FUND DABEI, UND ER IST EIN LECK IM ALTEN WÄCHTER:** *`card.neverSameBackup`
> schrieb* **„asla aynı yedeğe koyma"** *— ein alleinstehendes `yedek` im Dativ.
> Der Wächter von 0.25.1 sucht `\byedek(ler|leri|le|tir)?\b`, und durch die
> **Konsonantenerweichung** heißt der Stamm dort `yedeğ` — er hat es nie gesehen.*
> **Der Wert ist berichtigt** *(„asla aynı yedeklemeye koyma")*; **das Loch im
> Wächter steht als Punkt 31 im Sammelblatt** und wird nicht in dieser Runde
> geflickt — es ist der Wächter einer anderen Runde.

---

## Die tragende Leitplanke: ZWEI unveränderliche Basen, und beide nachgerechnet

> **DEUTSCH UND ENGLISCH SIND DIE UNVERÄNDERLICHE BASIS (L1).** *Kein deutscher
> und kein englischer Wert ist angefasst worden — auch nicht „nur kurz", auch
> nicht da, wo beim Übersetzen auffiel, dass er besser ginge.*

**NACHGERECHNET UND NICHT BEHAUPTET.** *Die Gleichlautprobe aus 0.31.1 setzt
jeden Textruf im Quelltext durch seinen Wert und rechnet je Sprache zwei
Prüfsummen:*

| | vor der Runde | nach der Runde |
|---|---|---|
| **de/one** | `7c1fe1a927f158f9` | **`7c1fe1a927f158f9`** *(gleich)* |
| **de/other** | `0b443d44733cc668` | **`0b443d44733cc668`** *(gleich)* |
| **en/one** | `2f8e5b3abe58f9fd` | **`2f8e5b3abe58f9fd`** *(gleich)* |
| **en/other** | `39489ec6ae18020b` | **`39489ec6ae18020b`** *(gleich)* |
| **tr/one** | `5fec71b10c0dfa3c` | **`982dbdef208b62e3`** |
| **tr/other** | `18b07eda589b5120` | **`73a0c9117b20dad6`** |

> **DIE VIER ZAHLEN DES AUFTRAGS STIMMEN ALLE VIER** — *zum ersten Mal in dieser
> Strecke; 0.31.2 musste zwei berichtigen.*
>
> **UND DIE TÜRKISCHEN STEHEN IN BEIDEN RICHTUNGEN IM PRÜFSTAND:** *der Stand
> VOR dieser Runde darf nicht zurückkommen, und der danach muss dastehen.* Ohne
> den ersten wäre „die Runde hat Türkisch angefasst" eine Behauptung; ohne den
> zweiten könnte jemand die Datei zurückdrehen, und niemand sähe es.

**FÜR ENGLISCH HÄLT ZUSÄTZLICH DER VERGLEICHSSTAND VON 0.31.2** *(`tools/englisch-0312.json`)* —
**alle 1197 Werte Zeichen für Zeichen gleich**, Tafel `EG_CHANGED_AFTER_0312` leer.

---

## Was gebaut ist — in Zahlen

| | vorher | nachher |
|---|---|---|
| **Schlüssel** | 1197 | **1197** *(F6 gehalten)* |
| **Geänderte Schlüssel** | — | **195** *(205 Formen)* |
| **davon nur das Anführungszeichen** | — | **50 Formen** |
| **wirklich neu formuliert** | — | **155 Formen** |
| **Zeichen in `tr.json`** | 43 927 | **42 521** *(−1419)* |
| **Verhältnis zum Deutschen** | 93,8 % | **90,8 %** |
| **Werte über 1,15× ab 40 Zeichen** | **44** | **0** |
| **Werte mit mehr Sätzen als ihr deutscher** | **6** | **0** |
| **Treffer der Verbotsliste** | **26 in 23 Schlüsseln** | **0** |
| **Werte mit deutschen Anführungszeichen** | **67** | **0** |
| **Umgestellt auf `“…”`** | — | **68 Schlüssel, 69 Formen** *(zwei mehr als gemessen: `server.ruleDays` und `server.ruleKeep` zitieren seit dieser Runde die Feldbeschriftungen und haben dabei Anführungszeichen bekommen)* |
| **HTML-Entitäten** | **1** | **0** |
| **siz-Formen** | **1** | **0** |
| **`Şu:` am Satzanfang** | **4** | **0** |

### Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **Die Verbotsliste ist ein Wächter geworden** — *elf Muster, und **er liest Wortstämme**: der Wortanfang ist gebunden, die Endung frei* | **11 Muster** |
| **BA 2** | **Die Anführungszeichen** — `„…“` wurde `“…”` | **68 Schlüssel, 69 Formen** |
| **BA 3** | **Der Grammatik-Kollaps** — die vier „Şu:", die Wortdopplung, das Verb an seinen Platz | *siehe unten* |
| **BA 4** | **Der Ballast** — Werte über 1,15× | **44 → 0** |
| **BA 5** | **Die Metaphern** | **alle gefallen** |
| **BA 6** | **NICHT GEBAUT** — *der Grund steht ganz oben* | **0** |
| **BA 7** | **Die letzte HTML-Entität** | **1** |
| **BA 8** | **Die vier Briefe** — Ton und Schluss *(F5)* | **4** |
| **BA 9** | **DER DURCHGANG** — alle 1197 Schlüssel | **1197** |
| **BA 10** | **Prüfstand, Gegenproben, Vergleichsstand, Papiere** | |

---

## Der Grammatik-Kollaps — was wirklich dastand

**DIE VORLAGE NANNTE VIER UNFÄLLE. GEMESSEN SIND ES MEHR**, und die schlimmsten
davon hat sie nicht gesehen: *ein türkischer Satz, der die deutsche Wortstellung
kopiert, liest sich nicht holprig — er sagt etwas anderes oder gar nichts.*

| Schlüssel | vorher | jetzt |
|---|---|---|
| `entry.weightsWhere` | „Ağırlıkları Ayarlar › Veriler › altında ayarlarsın **{word} girer**." | **„Ağırlıkları Ayarlar › Veriler › {word} altında ayarlarsın."** |
| `card.logKeepsHint` | „**Satırlar şuna göre sıralanır:** {word} otomatik olarak silinir …" | **„Satırlar {word} sonra kendiliğinden silinir; elle silme yoktur."** |
| `card.sessionIdleHint` | „… geçen **şu süreden sonra** {days} gün **sonra** kendiliğinden düşer." | **„Bir oturum, erişimsiz {days} gün sonra kendiliğinden düşer."** |
| `card.shownOnceHint` | „**Şunu yapacak:** {word} gösterildi." | **„{word} gösterilir."** |
| `card.lockedOutCard` | „Artık kimse giremiyorsa, **şu kişi** {word} parolayı sunucuda **sıfırla**." | **„Artık kimse giremiyorsa, {word} parolayı sunucuda sıfırlayabilir."** |
| `card.potentialStarsHint` | „Yıldızlar **{word} testten önce**: …" | **„Testten {word} yıldızlar: …"** |
| `entry.avgAllHint` | „… **Bu sayının nasıl**" *(der Satz brach ab)* | **„… Bu sayı nasıl oluşuyor"** |
| `card.exportPasswordHint` | „parolan bir kez**{extra}** istenir" *(der Einschub saß hinter „einmal")* | **„parolan{extra} bir kez istenir"** |
| `entry.calcNoChange` | „… **şu çıkardı: {word} çıkar**." | **„… ağırlıksız da yuvarlamadan sonra {word} çıkar."** |
| `card.linkListHint` | „… her şey **şu sayılır: {word} sayılır**; …" | **„… adres olmayan girdiler {word} sayılır; …"** |
| `entry.calcHowAvg` | „⌀ **nasıl** {word} **oluştuğu**" | **„⌀ {word} değerinin nasıl hesaplandığı"** |

> **DIE VIER „Şu:" WAREN NUR DIE SICHTBARE SPITZE.** *Dieselbe Verlegenheit
> steckte in `şunla:`, `şunlar var:`, `şudur:`, `şu kadar`, `şuraya:` und
> `şu karta bak:` — **zwölf weitere Stellen**, an denen der Übersetzer nicht
> wusste, wohin mit einem deutschen Artikel oder einer deutschen Präposition,
> und einen Doppelpunkt davorgesetzt hat.* **Sie sind alle gefallen.**

### Und acht Sätze waren schlicht falsch

*Keine Liste hätte sie gemeldet — sie sind beim Lesen aufgefallen:*

| Schlüssel | was dastand |
|---|---|
| `card.adminOnlyCategory` · `card.adminOnlyTag` | *die deutsche Hälfte* **„Mit Häkchen legt jeder neue Kategorien an"** *fehlte ganz — der türkische Satz sagte nur, was OHNE Häkchen gilt* |
| `card.languagesFileAfter` | **„yeniden kurmadan"** *(ohne Neuinstallation)* statt **„nach einem Neustart"* — *und „ohne eine Zeile Programm" und „(z. B. de-DE)" fehlten* |
| `mail.hintAlways` | *der **allgemeine** Hinweis nannte **GMX** namentlich* |
| `mail.hintGmx` | *die zweite Hälfte fehlte* („und sendet nicht unter einer fremden Absenderadresse") |
| `server.targetNotNumber` | **„Her hedef bir numaradır."** *(„Jedes Ziel IST eine Zahl") statt* **„… muss eine Zahl sein"** — *eine Fehlermeldung, die keine war* |
| `card.emailsDoubledHint` | **„uygulama adresi benzersiz tutamaz"** *(„die Anwendung kann die Adresse nicht eindeutig halten") — Subjekt und Objekt vertauscht* |
| `entry.avgOf` | **„{votes} oydan {average} ortalama"** *— `{votes}` trägt schon „3 Değerlendirme", also stand da „3 Değerlendirme oydan"* |
| `card.restoreViaBackup` | *der Anschlusssatz ergab mit seinem Vordersatz* **„Eksiksiz bir geri dönmek için doğru yol yedeklemedir"** *— grammatisch unmöglich* |

### Und zwei Wörter standen für zwei verschiedene Sachen

| | |
|---|---|
| `list.notEstimatedYet` **und** `list.notRatedYet` | *beide hießen* **„henüz değerlendirilmedi"** *— das Deutsche trennt „noch nicht eingeschätzt" (Potenzial) von „noch nicht bewertet".* **Jetzt „henüz tahmin edilmedi" und „henüz değerlendirilmedi"** *(Regel S3, eine Sache, ein Wort)* |
| `card.reportOne`/`reportMany`, `card.taskOne`/`taskMany`/`taskDone` | *die Beschriftungen der Vokabelkarte nannten das **Wort** („Rapor, çoğul") statt der **Sache** („Kommentar zum Festhalten, Mehrzahl").* **Jetzt „Kayda geçen yorum" und „Yapılacak yorum"** — *wie `card.dayOne` es immer schon machte* |

---

## Die Anrede — und was die vier Briefe daraus machen

**GEMESSEN: 78 türkische Werte sprechen den Benutzer vertraut an (sen), GENAU
EINER höflich** — `card.emailsDoubledHint` („değiştirin ya da boşaltın").
*Das Deutsche duzt in 44 Werten.* **F4 entscheidet: sen, durchgehend**, und
damit fällt der eine Ausreißer in die Reihe.

> **DIE VORLAGE SCHLUG FÜR DIE BRIEFE „Bu iletiye yanıt vermeyiniz" VOR — das
> ist die siz-Form und bräche F4.** *Das Deutsche redet an dieser Stelle
> niemanden an („Antworten darauf liest niemand"), also tut es das Türkische
> auch nicht:*
>
> **„Bu ileti otomatik olarak gönderilmiştir; yanıtlar okunmaz."**
>
> *Und „Buna gelen yanıtları kimse okumaz" — was vorher dastand — ist derselbe
> Kneipenton wie das englische „Nobody reads replies", das 0.31.2 gestrichen
> hat.* **Die Zeile steht namentlich im Prüfstand**, weil sie die Entscheidung
> IST.

**EIN ZWEITER BRIEFFUND:** *`mail.invite.body` sagte* **„Bu bağlantıya sahip
olan içeri girer"** *(„wer diesen Link hat, kommt herein") — Kneipenton und
Verbotswort zugleich.* **Jetzt: „… hesabına erişir".** *Und `mail.confirm.body`
erklärte den Bestätigungslink mit* **„yalnızca ‚evet, bu benim' der"** — *eine
Erfindung; das Deutsche sagt „er bestätigt nur, dass die Adresse dir gehört".*

---

## Die Fragetafel — wie sie beantwortet ist

| # | Frage | Antwort |
|---|---|---|
| **F1** | Die Nummer? | **0.31.3, PATCH** — *es ändert sich nur Text in `tr.json`* |
| **F2** | Wer ist der Leser? | **Der Betreiber selbst** *(0.24.4, F2: „das bin ich")* — **die Durchsicht steht aus** |
| **F3** | `“…”` oder `"…"`? | **`“…”`** — *68 Schlüssel, 69 Formen* |
| **F4** | sen oder siz? | **sen, durchgehend** — *der eine Ausreißer ist gefallen* |
| **F5** | Und in den vier Briefen? | **Unpersönlich** — *„Bu ileti otomatik olarak gönderilmiştir; yanıtlar okunmaz."; der Vorschlag der Vorlage („vermeyiniz") ist die siz-Form und bräche F4* |
| **F6** | Ändert sich die Zahl der Schlüssel? | **Nein. 1197 bleibt 1197** |
| **F7** | Die letzte HTML-Entität? | **Gefallen** |
| **F8** | Darf Türkisch länger werden? | **Bis 1,15× ab 40 Zeichen** — *vorher 44 Werte darüber, jetzt keiner* |
| **F9** | Das türkische Wörterbuch — `Parola` oder `Şifre`? | **NACHGEMESSEN, NICHT ENTSCHIEDEN.** *`Parola` steht 63-mal für das Passwort, `Şifre` dafür kein einziges Mal; die Vorkommen von `şifreleme` und `şifresiz` meinen die **Verschlüsselung** und sind ein anderes Wort.* **Die Frage bleibt beim Betreiber — das Wörterbuch sagt das ausdrücklich —, aber sie hat jetzt einen Preis:** *wer `Şifre` wählt, führt zwei heute getrennte Sachen unter einem Wort zusammen (S3). Die Messung steht im Wörterbuch* |
| **F10** | Eine Wortlautprobe für Türkisch? | **Nein — ein Vergleichsstand**, `tools/tuerkisch-0313.json`, Tafel leer |
| **F11** | Was wird aus der Vorlage? | **Sie bleibt liegen** — *sie ist der Gegenstand, gegen den geprüft wurde* |

---

## Die Verbotsliste ist ein Wächter geworden — und er liest Wortstämme

**ELF MUSTER, JEDES MIT SEINEM GRUND. Gemessen waren es vor der Runde 26 Treffer
in 23 Schlüsseln, jetzt sind es null.**

| Muster | warum | Treffer |
|---|---|---|
| `hap` | *Kopfschmerztablette; CSS-Jargon für einen Knopf* | 1 |
| `evden çık` | *wörtlich „das Haus verlassend"* | 2 |
| `sabit res` | *Standbild aus dem Schnittraum* | 4 |
| `Şey` | *Slang für die Codevariable `$thing`* | 2 |
| `cihaz gibi` | *klingt nach einer Geräteeigenschaft* | 2 |
| `Çalışma ` | *der deutsche „Lauf" als Person* | 3 |
| `yanında dur` | *Dateien stehen nicht nebeneinander* | 2 |
| `son görülme` | *wörtlich aus „last seen"* | 1 |
| `içeri gir` | *Kneipenton für den Zugang* | 1 |
| `kimse okum` | *zu flapsig für einen Transaktionsbrief* | 4 |
| `Şu:` | *der deutsche Artikel als „Dieses da:"* | 4 |

> ## DIE LEHRE, DIE LEITPLANKE L4 VERSCHÄRFT HAT — und sie ist beim Messen dieses Auftrags entstanden
>
> **`\b` TAUGT FÜR TÜRKISCH NICHT.** *Für JavaScript sind `Ş`, `ş`, `ğ`, `ı`,
> `ç`, `ö` und `ü` **keine Wortzeichen**. Zwischen einem Leerzeichen und einem
> „Ş" steht damit **gar keine Wortgrenze** — `/\bŞey\b/` findet „Şey, tekil"
> **nicht**.*
>
> **UND DIE ENDUNG KLEBT AN:** *„hap" steht in der Datei als* **„haptan"**,
> *„sabit resim" als* **„sabit resmi"**. *Ein Wortleser findet beide nicht.*
>
> **DER WÄCHTER BINDET DESHALB NUR DEN WORTANFANG**, mit einem Blick zurück
> (`(?<![\p{L}\p{N}_])`), *und lässt die Endung frei.* **Die erste Messung
> dieses Auftrags — mit `\b` — übersah fünf von 26 Treffern und meldete „Şey"
> mit null.** *Die Gegenprobe **992** setzt genau „haptan" zurück und nicht
> „hap": ein Wächter mit Wortgrenze bliebe dort grün.*
>
> **DASSELBE GILT FÜR DEN SATZZÄHLER.** *Die türkischen Abkürzungen `örn.` und
> `vb.` müssen vor dem Zählen herausfallen — und `\börn\.` findet nichts, weil
> `ö` kein Wortzeichen ist. Derselbe Fehlgriff, dieselbe Stelle, dieselbe
> Lösung.*

---

## Die Zusagen und ihre Gegenproben

**DREIZEHN ZUSAGEN, und jede hat ihre Gegenprobe (989 bis 1001) — jede
gefahren.**

| # | Zusage | Gegenprobe |
|---|---|---|
| **1** | Deutsch und Englisch unangetastet, Türkisch angefasst | **989** *(ein englischer Wert ändert sich)* |
| **2** | 1197 Schlüssel, dieselbe Folge, dieselbe Gestalt | **990** *(ein Mehrzahlpaar wird ein Satz)* |
| **3** | jeder Platzhalter steht gleich | **991** *(ein Platz fällt weg)* |
| **4** | kein Wort der Verbotsliste | **992** *(„haptan" — mit Endung)* |
| **5** | türkische Anführungszeichen, paarweise | **993** *(ein deutsches kommt zurück)* |
| **6** | kein Wert mehr als 1,15× ab 40 Zeichen | **994** *(länger, ohne Satz mehr)* |
| **7** | kein Wert mehr Sätze als sein deutscher | **995** *(Gedankenstrich wird Punkt)* |
| **8** | keine HTML-Entität | **996** |
| **9** | die fünf Vokabelpaare tragen dasselbe Wort | **997** *(der Vorschlag der Vorlage)* |
| **10** | keine Mehrzahl hinter einer Zahl | **998** *(„{n} yedeklemeler")* |
| **11** | die Anrede ist durchgehend sen | **999** *(die siz-Form kommt zurück)* |
| **12** | keine Einrückung des Quelltexts | **1000** |
| **13** | der Vergleichsstand liegt daneben | **1001** *(er weicht ab)* |

> **ZWEI VON IHNEN MACHEN ABSICHTLICH AUCH EINEN ÄLTEREN WÄCHTER ROT:** *989
> fällt zugleich in „Englisch sitzt — 0.31.2" (Englisch ist jetzt Basis für zwei
> Runden), 997 in die Vokabelprobe von 0.24.4.* **Zwei Wachen über dieselbe
> Zusage dürfen sich nicht widersprechen.**

**DREI ZEILEN HALTEN AUSSERDEM, WAS SCHON GRÜN WAR** — *damit es grün bleibt,
während 155 Formen neu geschrieben werden:* `lütfen` *steht in keinem Wert*
(TR-S2, „Bitte" steht 21-mal in `de.json`), *die Plätze stehen alle gleich, und
die vier Briefe tragen ihre Leerzeilen.*

---

## Was nicht gebaut ist

- **Kein deutscher und kein englischer Wert ist angefasst.** *Nachgerechnet, vier Prüfsummen.*
- **BA 6 nicht** — *der Grund steht oben und ist gemessen.*
- **`Yedekleme` bleibt `Yedekleme`** — *Entscheidung des Betreibers vom 10.9.2026, Wächter seit 0.25.1.*
- **Keine Anordnung, kein Schemaanteil.** *Austauschformat bleibt 16, `F_ROUTES` bleibt 73.*
- **Kein Schlüssel fällt und keiner kommt dazu.** *1197 bleibt 1197.*
- **Die elf deutschen Sätze aus `server.js`** *(Punkt 29)* **sind nicht übersetzt** — *sie brauchen neue Schlüssel in allen drei Dateien.*
- **Das Loch im `yedek`-Wächter ist nicht geflickt** *(Punkt 31)* — *er gehört einer anderen Runde.*

---

## Drei Kommentare im Prüfstand sind berichtigt

**SIE ZEIGTEN AUF DIE FALSCHE RUNDE**, und zwar alle drei aus demselben Grund:
*ihre Nummern stammen aus der Zeit vor 0.31.1, als die Strecke drei Runden hatte
statt vier.*

| Ort | stand da | heißt jetzt |
|---|---|---|
| **0.31.0, Zusage 4** | *„Dass das Paar dort am Ende `“…”` heißen muss, ist die Sache von **0.31.2**"* | **0.31.3** — *und dort ist es entschieden und gebaut* |
| **0.31.0, Gruppenkopf** | *„Englisch ist 0.31.1, Türkisch **0.31.2**"* | **0.31.2 und 0.31.3** |
| **0.31.0, Zusage 8** | *„`en.json` trägt „leaves the house" und `tr.json` „hap" **bis heute**"* | *beide sind gefallen — 0.31.2 und 0.31.3; die Zeile fragt weiter nur Deutsch, denn sie ist die Wache über die **Quelle*** |

> *Der Auftrag hat den ersten der drei ausdrücklich verlangt. Die beiden anderen
> sind derselbe Fehler an derselben Gruppe — ein Kommentar, der auf die falsche
> Runde zeigt, ist schlimmer als keiner: er sieht wie Buchführung aus.*

---

## Der Prüflauf und die Gegenproben

**DER PRÜFSTAND IST GRÜN: 6951 von 6951, kein einziger roter Punkt.**

> **DREI ROTE PUNKTE HAT DER ERSTE LAUF GEMELDET, und alle drei waren meine:**
>
> | | |
> |---|---|
> | **Die Selbstprobe der Anrede** | *`tgPolite.test('yanıt vermeyiniz')` war falsch — die türkische Grammatik schiebt zwischen Vokal und Endung ein* **`y`** *ein: „vermeyiniz" ist `verme` + **y** + `iniz`. Der Wächter fand damit ausgerechnet die Form der VORLAGE nicht, und genau die ist der Grund für F5.* **Eine Selbstprobe, die ihren eigenen Leser prüft, hat hier verdient, wofür sie da ist** |
> | **Die Zahl der Rückbauten** | *979 waren es, 992 sind es* |
> | **Ein Suchtext griff ins Leere** | *Gegenprobe **793** sucht `entry.tagQuote` mit dem **deutschen** Anführungszeichenpaar — und BA 2 hat es türkisch gemacht. Die Zeile meldete sie mit Datei und null Treffern.* **Der Suchtext ist mitgezogen** |
>
> *Die erweiterte Verbliste der Anrede — siebenundzwanzig Verben statt
> zweiundzwanzig, mit `yap`, `et`, `ver`, `bul`, `iste` — ist danach gegen alle
> 1197 Werte gehalten worden: kein einziger richtiger Satz wird gemeldet.*

**DIE DREIZEHN GEGENPROBEN SIND GEFAHREN** — *989 bis 1001, jede hat ihre
erwartete Gruppe rot gemacht, **0 STUMM**.*

---

## Der Augenschein — und der Fund, den kein Muster über eine Datei machen kann

**EIN ECHTER BROWSER, EINE ECHTE INSTANZ, DIE OBERFLÄCHE AUF `tr-TR`.** *Liste,
Detailansicht, Anmeldeseite und alle fünf Abschnitte der Einstellungen,
durchgesehen auf drei Dinge:* **kein offener Platzhalter, kein fehlender
Schlüssel (`⟦…⟧`), kein Fehler in der Browserkonsole.** *Ergebnis:* **keiner
von dreien.**

> **UND EIN VIERTER FUND, DEN NUR DER AUGENSCHEIN MACHEN KONNTE:** *auf der
> Karte „Sayılar" stand* **„3 yorumlar"** *statt „3 yorum".*
>
> **IN DER SPRACHDATEI IST DIE ZUSAGE GEHALTEN** — *kein einziger Wert schreibt
> „{n} …lar", und Zusage 10 rechnet das nach.* **Am Bildschirm steht sie
> trotzdem**, *weil `countWord(n, einzahl, mehrzahl)` im QUELLTEXT eine Zahl vor
> ein Wort setzt, das aus **zwei** Schlüsseln kommt:*
>
> ```js
> ...countWord(b.comments, t('dialog.comment'), t('dialog.comments')),
> ```
>
> **FÜNF PAARE, ELF STELLEN** — *`yorum`/`yorumlar`, `bağlantı`/`bağlantılar`,
> `dosya`/`dosyalar`, `Fotoğraf`/`Fotoğraflar`, `Video`/`Videolar`.*
> **Das sechste Paar an derselben Stelle ist richtig**, *weil es ein
> VOKABELPAAR ist und die Entscheidung vom 8. September 2026 dort schon
> gegriffen hat — der beste Beleg dafür, dass die fünf eine Lücke sind und
> keine zweite Meinung.*
>
> **DIESE RUNDE ÄNDERT SIE NICHT**, *denn dieselben fünf Schlüssel stehen als
> Blocküberschrift über ihren Listen („YORUMLAR", „DOSYALAR", „BAĞLANTILAR"),
> und dort ist die Mehrzahl richtig.* **Es ist derselbe Zielkonflikt wie bei den
> Vokabelwörtern, und den entscheidet der Betreiber** — *der Punkt liegt ihm als
> **Punkt 32** im Sammelblatt vor, mit drei Wegen und einem Vorschlag.*
>
> **GEZÄHLT WIRD ER TROTZDEM: Zusage 10 hat seit dieser Runde eine zweite
> Hälfte** — *die elf Stellen stehen als Zahl im Prüfstand, das richtige
> Vokabelpaar daneben. Wird eines der fünf nachgezogen, fällt es auf; wer ein
> sechstes hinzufügt, auch.*

**EIN HANDGRIFF OHNE ZIELKONFLIKT IST GEMACHT:** *`dialog.links` stand als*
**„Bağlantılar"** *mit großem B da, während `dialog.files` und
`dialog.comments` klein geschrieben sind — mitten im Satz las sich das als „3
Bağlantılar".* **Jetzt „bağlantılar"** *(TR-S1; die Blocküberschrift setzt das
Stilblatt ohnehin in Großbuchstaben).*

---

## Die Nachlese: der Betreiber hat die Regel diktiert, und drei Stellen sind nachgezogen

**AM 13. SEPTEMBER 2026, nach dem ersten Durchgang, hat der Betreiber die Regel
im Wortlaut hingeschrieben:**

> **„Öğeler wird dann verwendet wenn man ohne Zahl sagen möchte, dass das
> Mehrzahl [ist]: *o öğeleri sileceğim* — *üç öğeyi sileceğim*, *orada üç öğe
> var*, *orada öğeler var*."**

**NACHRECHERCHIERT, UND SIE STIMMT AUF JEDER EBENE:**

| Quelle | Befund |
|---|---|
| **TDK** *(Türk Dil Kurumu)* | *„Sayı sıfatının peşinden gelen isim çoğul eki almaz"* — nach einem Zahlwort kein `-ler`/`-lar`; dasselbe nach `çok`, `birkaç`, `kaç` |
| **Göksel & Kerslake**, *Turkish: A Comprehensive Grammar* | dieselbe Regel, **eine Ausnahme**: geschlossene, „wohlbekannte" Gruppen und Eigennamen — *Kırk Haramiler*, *Yedi Cüceler*. Für eine Oberfläche ohne Belang |
| **Sağ**, *The semantics of Turkish numeral constructions* | formal: *„Turkish numerals strictly reject co-occurrence with plural nouns."* Der nackte Singular ist **zahlneutral** — deshalb ist er ohne Zahl richtig und mit Zahl zwingend |
| **Unicode CLDR** | für genau diesen Fall: *„1 elma", „123 elma" — but when the number is omitted, „elmalar"* |

> ## WAS DIE RECHERCHE ÜBER DIE ANGABE HINAUS BRINGT — und es ist die Wurzel beider offenen Punkte
>
> **`Intl.PluralRules('tr').select(n)` WÄHLT NACH DEM WERT VON `n`. Die
> türkische Regel hängt nicht am Wert, sondern an der STELLUNG** — *steht ein
> Zahlwort davor oder nicht.* `select(3)` gibt `other`, und das ist als
> CLDR-Kategorie richtig, heißt im Türkischen aber **nicht** „hänge `-lar` an".
> **Die Auskunft, die der Code bräuchte, sieht die Schnittstelle nie.**

### Nachgemessen, wo der eine Mehrzahlplatz gelesen wird

| | Stellen |
|---|---|
| **mit Zahl davor** *(„3 öğe")* | **25** — 18 im Quelltext, 7 in der Datei |
| **ohne Zahl** *(„öğeler")* | **34** — 28 Sätze, 6 bloße Beschriftungen |

**DAMIT IST DIE ZAHLLOSE SEITE HEUTE IN DER MEHRHEIT — 2026 stand es
umgekehrt.** *Die 28 Sätze lesen sich trotzdem nicht falsch: 0.24.4 hat zwölf
davon eigens um die Einzahl herum umgeschrieben, und an den übrigen verlangt das
Türkische die Einzahl ohnehin — nach* `her` *und* `kaç`, *in der Verneinung und
im generischen Satz.* **Rund neunzehn der achtundzwanzig wären mit „öğeler"
FALSCH.**

### Drei Stellen sind nachgezogen

*Die, an denen die Einzahl weder verlangt noch zahlneutral war, sondern
schlicht schwach:*

| Schlüssel | vorher | jetzt |
|---|---|---|
| `list.openTasks` *(Seitentitel über der Liste)* | „Açık **Görev**" | **„Açık {taskMany} listesi"** |
| `list.noCategory` *(Titel der Filterpille)* | „Kategorisiz **Öğe**" | **„Kategorisiz {entryMany} listesi"** |
| `list.newCommentsHint` | „Yeni **yorumlar** ve Değerlendirme" *(erstes Glied Mehrzahl, zweites Einzahl)* | **„Yeni yorum ve {ratingMany} …"** *(beide zahlneutral, die Reihung ist eben)* |

> **DER HANDGRIFF IST DERSELBE, DEN 0.24.4 ZWÖLFMAL GEMACHT HAT:** *ein festes
> Kopfwort neben dem Platzhalter trägt, was der Platzhalter nicht tragen darf.*
> **`listesi` ist dabei mit Absicht gewählt und nicht `kayıtları`:** *es trägt
> jedes Vokabelwort des Betreibers — „Açık Model listesi", „Kategorisiz Kayıt
> listesi" —, während `kayıtları` bei einem Betreiber, der sein Wort „Kayıt"
> nennt, „Kayıt kayıtları" ergäbe.* **An der T1-Probe mit drei Vokalen
> nachgesehen.**

### Zwei Stellen bleiben — und jede hat ihren Grund

| | |
|---|---|
| **`card.timelineHint`** *(„{dayMany} zaman çizgisi")* | **kein Befund, mein Fehlurteil.** *`X zaman çizgisi` ist eine Substantivkette, und in ihr steht das erste Glied im Türkischen IMMER in der Einzahl — „Test günü zaman çizgisi" ist richtig* |
| **Die sechs bloßen Beschriftungen im Quelltext** *(„TEST GÜNÜ" über der Liste)* | **die Datei kann sie nicht beheben.** *Dort steht das Vokabelwort nackt, ohne Nachbarn, an den sich ein Kopfwort hängen ließe. Sie brauchen einen Platz je Stellung — Punkt 32, Weg B* |

---

## Der türkische Stand liegt als Vergleichsdatei daneben

**`tools/tuerkisch-0313.json`, erzeugt von `tools/tuerkischstand.js`** — *1197
Schlüssel, jeder mit seinem Wert, in der Folge der Datei.*

*Für Deutsch gibt es eine Abnahme (0681d42), für Englisch den Vergleichsstand
von 0.31.2 — für Türkisch ist **diese** Runde beides (F10).* **Die Tafel
`TR_CHANGED_AFTER_0313` ist leer:** solange sie das ist, muss jeder türkische
Wert Zeichen für Zeichen der dieser Runde sein. *Einen Vergleichsstand still
nachzuziehen ist damit ein roter Punkt.*
