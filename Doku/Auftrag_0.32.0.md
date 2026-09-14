# Auftrag 0.32.0 — „Der Ruf beim Namen"

**Geschrieben am 14. September 2026 · gebaut auf 0.31.4 · MINOR — die Runde legt
Schlüssel dazu, aber keinen Schemaanteil am Austauschformat.**

> **DIE 31er-STRECKE IST ZU ENDE, und sie hat drei Sprachen auf denselben Stand
> gebracht** — *0.31.0 gegengelesen, 0.31.1 die zersägten Sätze zusammengesetzt,
> 0.31.2 Englisch, 0.31.3 Türkisch, 0.31.4 die Mehrzahlregel dahinter.* **Diese
> Runde ist die erste danach, und sie trägt drei Stränge.**
>
> | | Strang | woher |
> |---|---|---|
> | **1** | **Der Ruf beim Namen** — `@name`, hervorgehoben, mit Glocke | *vom Betreiber bestellt am 12.9.2026; die Glocke soll unterscheiden können (13.9.2026)* |
> | **2** | **Das fünfzehnte Vokabelwort** — „Note" | *entschieden am 13.9.2026* |
> | **3** | **Was die Sprachrunden hinterlassen haben** | *vier Punkte im Sammelblatt, alle gemessen und keiner geraten* |
>
> **WARUM DIE DREI ZUSAMMEN FAHREN und nicht nacheinander:** *Strang 1 und 2
> legen ohnehin Schlüssel in allen drei Sprachdateien an — und Strang 3 besteht
> aus Sätzen, die genau dort fehlen.* **Es ist der billigste Augenblick, den
> diese Funde je haben werden:** *drei Dateien stehen frisch gelesen da, und die
> drei Buchführungen, die jede Änderung benennen wollen, sind gebaut und leer.*

---

## 0. Die Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **KEINE ZWEITE WAHRHEIT NEBEN DER GLOCKE.** *Unterscheiden heißt nicht zweimal zählen: dieselbe Ableitung, nach Herkunft getrennt* | Stolperstein 47; Fahrplan, 0.32.0 |
| **L2** | **DER RUF IST EIN VIERTES STÜCK DER ZERLEGUNG UND KEIN `replace()`.** *Seit 0.18.0 entsteht der Kommentartext als echte Knoten und nie als String. Wer das umdreht, holt Markup in einen Text, der ausdrücklich keines tragen darf* | 0.18.0, `buildCommentNodes()` |
| **L3** | **WAS DIESE RUNDE AN DEN SPRACHDATEIEN ÄNDERT, WIRD BENANNT.** *Drei Buchführungen sind gebaut und leer — die Wortlautprobe gegen `0681d42` (deutsch, 943 Sätze), `EG_CHANGED_AFTER_0312` (englisch), `TR_CHANGED_AFTER_0313` (türkisch).* **Sie werden gefüllt und nicht umgangen** | 0.31.2 Zusage 10, 0.31.3 |
| **L4** | **JEDER WÄCHTER, DER TÜRKISCHEN TEXT LIEST, KOMMT OHNE `\b` AUS.** *Für JavaScript sind `ş`, `ğ`, `ı`, `ç`, `ö`, `ü` keine Wortzeichen — eine Wortgrenze steht dort, wo keine ist, und fehlt, wo eine ist* | **Punkt 31**, die Lehre aus 0.31.3 |
| **L5** | **KEIN NEUER SCHLÜSSEL OHNE ALLE DREI SPRACHEN.** *Die Deckungsprobe verlangt in jeder Datei dieselben Schlüssel in derselben Folge; ein Satz, der nur auf Deutsch dasteht, färbt den Lauf sofort rot* | 0.24.0 |
| **L6** | **EIN VOKABELWORT STEHT NIE ZUSAMMENGESETZT.** *„Erwartungkriterien" hätte kein Fugen-s* | 0.21.0 |
| **L7** | **DIE ZAHL VIERZEHN STEHT AN NEUN STELLEN IM PRÜFSTAND — sie wird an allen zugleich fünfzehn**, oder sie wird an keiner | Stolperstein 47 |

> **DER STAND VOR DER RUNDE, gemessen am 14. September 2026** *(`node tools/gleichlaut.js`)*:
>
> | | Einzahl | Mehrzahl |
> |---|---|---|
> | **de** | `0f38b9157739b492` | `bc6542b1f0e28bd6` |
> | **en** | `597dfc60b7a1fa63` | `6558810bf793704a` |
> | **tr** | `a7f3cd4bf8992f90` | `e26a1dca46c545da` |
>
> **ALLE SECHS ÄNDERN SICH IN DIESER RUNDE — und das ist der Unterschied zu
> 0.31.2 und 0.31.3.** *Dort war die Unveränderlichkeit die Zusage; hier ist es
> die BUCHFÜHRUNG: jede Änderung steht namentlich in ihrer Tafel, und was nicht
> darin steht, ist ein Fund.* **1198 Schlüssel je Datei** *(seit 0.31.4, mit
> `_afterNumber`)* — *diese Runde legt dazu, sie räumt nicht.*

---

## Strang 1 — Der Ruf beim Namen

**WAS GEBAUT WIRD, STEHT IM FAHRPLAN** *(Abschnitt „0.32.0 — Der Ruf beim
Namen")*, und es wird hier nicht abgeschrieben. **Was dieser Auftrag dazulegt,
sind die drei Entscheidungen, die der Fahrplan ausdrücklich dieser Runde
überlässt** — *sie stehen unten in der Fragetafel (F2, F3, F4)*:

| | die Sache | warum sie hier entschieden wird |
|---|---|---|
| **1** | **Spalte oder Ableitung** | *Ein Ruf, der als `@bert` im Text steht, zeigt nach einer Umbenennung auf niemanden. Wer das abfangen will, speichert die ZUGANGSNUMMER — und das ist ein Schemaschritt.* **0.29.0 hat angekündigt, die letzte Runde am Schema zu sein; der Bruch auf 0.33.0 steht dahinter.** *Fällt die Entscheidung nicht hier, fällt sie gar nicht mehr* |
| **2** | **Wie die Glocke unterscheidet** | *Zwei Zahlen am Symbol oder eine Zahl über einer geteilten Tafel.* **Dass unterschieden wird, ist entschieden** *(Betreiber, 13.9.2026)* |
| **3** | **Der Satz im Glockenfenster** | *0.31.0 hat ihn ausdrücklich stehen lassen, weil diese Runde ihn ohnehin ersetzt.* **Er bekommt hier seinen endgültigen Wortlaut — in allen drei Sprachen** |

> **UND DER BEFUND HINTER DER GLOCKE IST GRÖSSER ALS DER RUF:** *sie zeigt heute
> alles, was im ganzen Bestand neu ist; `qNewComments` filtert einzig auf
> `user_id IS NOT ?`.* **Was unter MEINEN Einträgen geschieht, steht zwischen
> allem anderen** — *`items.user_id` trägt den Anleger, die Abfrage nutzt ihn
> nicht.*

---

## Strang 2 — Das fünfzehnte Vokabelwort

**„NOTE" IST DIE EINZIGE ZAHL IM PROGRAMM OHNE VOKABELWORT** *(Fahrplan,
entschieden am 13.9.2026)*. **Am 14. September 2026 nachgemessen:**

| | gemessen |
|---|---|
| **Wie viele Schlüssel das Wort tragen** | **zehn**, in allen drei Sprachen: `entry.grade` · `entry.gradeLabel` · `entry.calcGradeWeight` · `entry.gradeReplaced` · `list.sortAvg` · `list.lastGrade` · `list.gradeLong` · `list.gradeShort` · `list.sortLast` · `server.gradeRange` |
| **Ob es eine Mehrzahl braucht** | **Nein.** *Kein einziger deutscher Wert schreibt „Noten" — das Wort steht überall in der Einzahl.* **Es wird EIN Wort wie `potential` und kein Paar** |
| **Wie die Karte es aufnimmt** | `VOCABULARY_FIELDS` in `public/app.js` trägt `v1` bis `v14`; **das neue ist `v15`** |
| **Wo die Vierzehn festgeschrieben steht** | **neun Prüfungen** *(`testbench.js` 2818, 2847, 5916, 18703, 20148, 20325, 31468, 50361, 50636)* — *dazu fünf Stellen in der README und drei Kommentare in `public/app.js`* |
| **Was NICHT mitwächst** | **`VOCABULARY_FIELDS_0243` in `db.js`.** *Diese Tafel übersetzt die ALTEN deutschen Namen von 0.24.3 (`sacheEinzahl` → `entryOne`); „Note" hatte nie einen solchen Namen.* **Eine fünfzehnte Zeile dort wäre eine erfundene Vergangenheit** |

> **UND DIE RICHTUNG IST DER GRUND, NICHT DIE UMBENENNBARKEIT.** *Eine deutsche
> Note läuft abwärts — die **1** ist die beste; Sterne laufen aufwärts.*
> **`server.gradeRange` sagt wörtlich „Die Note muss zwischen 1 und 5 liegen"**,
> und wer das als Schulnote liest, hält die 5 für fast das Schlechteste. *Gemeint
> ist das Beste.*

---

## Strang 3 — Was die Sprachrunden hinterlassen haben

**VIER PUNKTE, UND JEDER IST GEMESSEN UND NICHT GERATEN.** *Sie stehen im
Sammelblatt (`Doku/Fehler_und_Ideen.md`) und sind am 14. September 2026 am
heutigen Stand nachgesehen — alle vier stehen noch so da.*

### Punkt 29 · Elf deutsche Sätze aus `server.js` stehen auf jeder Oberfläche

**NACHGEZÄHLT: ES SIND WEITER ELF**, und jeder erreicht den Bildschirm:

| wo | wie viele | wer sie liest |
|---|---|---|
| **`deliveryReady()`** | **3** | die Karte „Users" und die Warnung über dem Registrierungsschalter |
| **`sendTokenLink()`** | **3** | `card.passLinkByHandEnd` — *„{reason}. Pass the link on manually."* |
| **`REQUEST_ANSWER`** | **1** | **jeder, der sich auf der Anmeldeseite meldet** — vor jeder Anmeldung, in jeder Sprache |
| **Die Vorschau des Aufräumens** | **4** | die Karte „Sicherung" |

> **DER SCHLIMMSTE IST DER EINE AUS `REQUEST_ANSWER`:** *er steht auf der
> ANMELDESEITE, wo die Instanz ihre Vorgabesprache spricht.* **Eine englische
> Installation antwortet einem englischen Interessenten auf Deutsch** — *im
> ersten Satz, den sie ihm überhaupt sagt.*

**UND DER WÄCHTER FEHLT, DER SIE GEFANGEN HÄTTE.** *Für `public/app.js` gibt es
die Restprobe seit 0.24.0; für `server.js` gibt es keine.* **Ohne sie ist der
zwölfte eine Frage der Zeit** — *und Punkt 26 sagt dazu, dass die Restprobe
Vorlagen nicht an ihren `${…}`-Stellen zerlegt: was in einer Vorlage steckt,
sieht sie bis heute nicht.*

### Punkt 30 · Die Dankseite kommt auch bei leerem Formular

**DIE EINE ANTWORT FÜR ALLE LAGEN IST EINE SICHERHEITSEIGENSCHAFT** *(sonst wäre
das Formular ein Werkzeug zum Durchprobieren — es steht ohne Passwort davor)*.
**Aber ein leeres Formular fragt nichts ab.**

> **DIE GRENZE, UND SIE GEHÖRT IN EINEN SATZ IM QUELLTEXT:** **Form ist
> öffentlich, Existenz ist es nicht.** *Ohne diesen Satz nimmt die nächste Runde
> die Gleichheit der Antwort für eine Umständlichkeit und baut sie weg.*

*Der Betreiber hat diesen Punkt selbst hierher verortet („das muss vermutlich in
die 32'er").*

### Punkt 28 · Fünf deutsche Funde aus dem englischen Durchgang

**ALLE FÜNF STEHEN NOCH SO DA** *(am 14.9.2026 nachgesehen)*:

| # | Fund |
|---|---|
| **1** | `card.restartHint` zitiert eine Logzeile, die es so nicht gibt — *„**Schlüssel** aus ENCRYPTION_KEY geladen" gegen `keys.js`: „**Schluessel** …"* |
| **2** | `server.deniedOwnUser` schickt an eine Karte „Zugang", die es nicht gibt — *sie heißt „Mein Konto"* |
| **3** | Ein Feld mit zwei Namen — *„Mindestens behalten" gegen „Immer behalten"* |
| **4** | Und das Feld daneben ebenso — *„Löschen ab Alter" gegen „Erst löschen ab"* |
| **5** | Die Vokabelkarte trägt zwei Bauformen — *fünf Beschriftungen nennen die Sache und dann die Zahl („Zeitpunkt, Einzahl"), eine nur die Zahl („Einzahl")* |

> **FUND 5 GEHÖRT ZU STRANG 2:** *wer ein fünfzehntes Wort in die Karte legt,
> entscheidet dabei ohnehin, wie eine Beschriftung dort aussieht.* **Und auf
> Englisch ist an den Funden 3 und 4 schon entschieden worden**, der Oberfläche
> zu folgen statt dem Wortlaut *(„Keep at least", „Delete when older than", in
> Anführungszeichen)* — **das Deutsche zieht hier nach oder widerspricht
> ausdrücklich.**

### Punkt 31 · Der `yedek`-Wächter sieht die Konsonantenerweichung nicht

**`/\byedek(ler|leri|le|tir)?\b/` FINDET `yedeğe` NICHT** — *türkisch erweicht den
Auslaut vor einer Vokalendung, und der Wächter sucht ein `k`.* **Ein Wert stand
dreißig Runden lang so da.** *Der Wert ist in 0.31.3 berichtigt; das Loch im
Wächter ist es nicht.*

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

| # | Frage | Vorschlag |
|---|---|---|
| **F1** | **Die Nummer?** | **0.32.0, MINOR.** *Die Installation kann danach etwas, was sie vorher nicht konnte* |
| **F2** | **Der Ruf: Spalte oder Ableitung?** | **Ableitung, keine Spalte.** *„Kommentare, die neuer sind als mein Bezugspunkt und meinen Namen rufen" ist eine ABFRAGE — dieselbe Bauform, aus der die Glocke heute schon besteht. **Der Preis ist die Umbenennung:** ein Ruf auf einen umbenannten Zugang zeigt danach auf niemanden.* **Zu bestätigen — nach 0.33.0 kommt keine Spalte mehr dazu** |
| **F3** | **Wie unterscheidet die Glocke?** | **Eine Zahl, eine geteilte Tafel.** *Zwei Zahlen am Symbol wären zwei Wahrheiten am selben Ort (L1); die Tafel darunter trennt nach Herkunft: **an mich gerichtet** · **unter meinen {entryMany}** · **alles andere*** |
| **F4** | **Der Satz im Glockenfenster?** | *Er wird ersetzt und in allen drei Sprachen neu geschrieben — Wortlaut nach F3* |
| **F5** | **Wie heißt das fünfzehnte Vokabelwort im Schlüssel?** | **`vocabulary.grade`** *(ein Wort, kein Paar)*, **Beschriftung `card.grade`**, **Karte `v15`** |
| **F6** | **Kommen die elf deutschen Sätze aus `server.js` mit?** | **Ja — alle elf, in allen drei Sprachen.** *Die Runde legt ohnehin Schlüssel an, und die drei Dateien stehen frisch gelesen da. **Erst messen, welche Sätze schon einen Schlüssel haben** — „Es ist kein Mailzugang eingerichtet." steht bereits als `mail.noAccount`* |
| **F7** | **Und der Wächter dazu?** | **Ja.** *Eine Restprobe für `server.js`, und sie zerlegt Vorlagen an ihren `${…}`-Stellen (Punkt 26). **Ohne den Wächter ist der zwölfte Satz eine Frage der Zeit*** |
| **F8** | **Die Dankseite bei leerem Formular?** | **Ja** — *Browser und Server prüfen die FORM, die Gleichheit der Antwort bleibt für alles andere* |
| **F9** | **Die fünf deutschen Funde aus Punkt 28?** | **Ja** — *fünf Werte; die Buchführung der Wortlautprobe fasst die Runde ohnehin an* |
| **F10** | **Der `yedek`-Wächter und die Wortgrenzen?** | **Ja** — *`testbench.js` und `counterproof.js`; die Gegenprobe 787 bekommt ihre Schwester* |
| **F11** | **Die drei mitgelieferten Kriterien auf Deutsch** *(Punkt 23)* | **Vorschlag: NUR für neue Installationen**, nicht als Migration — *ein gespeicherter Wert gehört dem Bestand, und wer ihn umbenennt, benennt fremde Daten um.* **Zu entscheiden** |
| **F12** | **`'Ohne Titel'` beim Import ohne Titel** | **Vorschlag: bleibt.** *Es ist ein gespeicherter WERT und keine Beschriftung — dieselbe Lage wie bei den Kriterien. **Wer es mitnimmt, muss sagen, in welcher Sprache ein Import spricht, der nachts ohne Benutzer läuft*** |

---

## Die Bauabschnitte

| | was | Umfang |
|---|---|---|
| **BA 1** | **Die Glocke wird persönlich** — *die Ableitung trennt nach Herkunft, die Tafel zeigt es, und es gibt weiterhin EINE Rechnung* | F3 |
| **BA 2** | **Der Ruf** — `@name` als viertes Stück der Zerlegung, hervorgehoben, und der Genannte bekommt seine Zeile in der Tafel | F2 |
| **BA 3** | **Das fünfzehnte Vokabelwort** — zehn Schlüssel, die Karte, die neun Prüfungen, die README | Strang 2 |
| **BA 4** | **Die elf Sätze aus `server.js`** — Schlüssel in drei Sprachen, und die Mehrzahlformen dort, wo eine Zahl davorsteht | F6 |
| **BA 5** | **Die Restprobe für `server.js`** — *und sie zerlegt Vorlagen an ihren Einsetzstellen* | F7 |
| **BA 6** | **Die Plausibilitätsprüfung der Zugangsanfrage** — *Form ist öffentlich, Existenz ist es nicht* | F8 |
| **BA 7** | **Die fünf deutschen Funde** — *und auf Englisch und Türkisch ziehen die Sätze mit, wo sie dieselbe Sache nennen* | F9 |
| **BA 8** | **Der `yedek`-Wächter, ohne `\b`** — *und die allgemeine Zeile dazu: kein Wächter über türkischen Text arbeitet mit Wortgrenzen* | F10 |
| **BA 9** | **„Filter folgt der Sortierung" wird herausgearbeitet** — *samt der harten Kante `STATUS_BY_HAND`: ein Klick schaltet die Ableitung für die ganze Sitzung ab, und das steht nirgends* | Fahrplan |
| **BA 10** | **Die zwei Befunde aus der Filterzeile** — *„+ Ansicht speichern" wird Text statt Pille; der „Mehr"-Aufklapper wird breitenabhängig* | Fahrplan, entschieden |
| **BA 11** | **Prüfstand, Gegenproben, Papiere, Augenschein, Fingerprint** | |

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Die Glocke rechnet EINMAL.** *Die getrennten Zahlen kommen aus derselben Ableitung; keine zweite Abfrage, keine zweite Wahrheit* |
| **2** | **Der Ruf entsteht als Knoten und nie als String** — *kein `replace()` über das Ergebnis der Zerlegung* |
| **3** | **Der Ruf gilt EINEM** — *wer nicht gerufen ist, bekommt seine Glocke davon nicht* |
| **4** | **Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge und derselben Gestalt** — *die neue Zahl steht an EINER Stelle* |
| **5** | **Es sind fünfzehn Vokabelwörter** — *an allen neun Stellen, und die Migrationstafel von 0.24.3 hat weiterhin vierzehn Zeilen* |
| **6** | **Kein Vokabelwort steht zusammengesetzt** |
| **7** | **Kein fester deutscher Satz in `server.js` erreicht mehr den Bildschirm** — *und die Restprobe dafür zerlegt Vorlagen* |
| **8** | **Die Zugangsanfrage weist eine leere Form ab — und sonst nichts.** *Die Antwort bleibt für jede ausgefüllte Form dieselbe* |
| **9** | **Jede Änderung an den drei Sprachdateien steht in ihrer Tafel** — *Wortlautprobe, `EG_CHANGED_AFTER_0312`, `TR_CHANGED_AFTER_0313`* |
| **10** | **Kein Wächter über türkischen Text arbeitet mit `\b`** — *und `yedeğe` wird gefunden* |
| **11** | **Die Verbotslisten der drei Sprachen bleiben leer** — *dreizehn Muster englisch, elf türkisch, und die deutschen Wächter dazu* |
| **12** | **„Filter folgt der Sortierung" ist sichtbar, und `STATUS_BY_HAND` sagt, was es tut** |

**Jede Zusage bekommt ihre Gegenprobe, und jede wird GEFAHREN.** *Eine stumme
ist ein Fund — 0.31.2 hat es mit elf bestätigt, 0.31.3 mit dreizehn, 0.31.4 mit
zwölf, und jedes Mal `0 STUMM`.*

---

## Was ausdrücklich NICHT gebaut wird

- **Kein Schemaanteil am Austauschformat.** *Es bleibt 16.* **Ob der Ruf eine SPALTE bekommt, entscheidet F2** — *und das ist die einzige Stelle, an der diese Runde das Schema überhaupt berühren könnte.*
- **Keine zweite Glocke.** *Unterscheiden heißt trennen, nicht verdoppeln.*
- **Kein türkischer und kein englischer Satz wird umformuliert, der nicht zu einem der Stränge gehört.** *0.31.2 und 0.31.3 sind abgenommen; ihre Vergleichsstände sind der Beweis, und diese Runde fasst sie nur da an, wo sie etwas dazulegt.*
- **Die drei mitgelieferten Kriterien und `'Ohne Titel'`** — *nur, wenn F11 und F12 es sagen.*
