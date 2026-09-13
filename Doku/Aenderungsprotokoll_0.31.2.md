# Änderungsprotokoll 0.31.2 — „Englisch sitzt"

**Auftrag 0.31.2 · 13. September 2026 · gebaut auf 0.31.1 · PATCH, kein
Schemaanteil.**

> **FINGERPRINT DIESER RUNDE: `0745f9bd`** — gerechnet am gebauten Stand, **als
> letztes und hinter der letzten Zeile**. *Zweimal ist er in dieser Runde noch
> gefallen, nachdem er schon dastand: `69ff6248` mit dem Nahtfund
> (`card.applyLower` heißt jetzt „instead." statt „apply."), `f75618a2` mit den
> zwei bestellten deutschen Werten.* **Genau dafür steht er zuletzt.**
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`0745f9bd`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`0745f9bd`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus* |
>
> **ZWEI QUELLEN, EIN WERT** — *alle achtzehn Einzelwerte gleich.* **Die dritte
> kommt aus dem Feld, sobald der Betreiber eingespielt hat.**

---

## Die Runde ist eine Einladung gewesen und keine Abarbeitung

**DER BETREIBER HAT EINE VORLAGE VON GOOGLE GEMINI MITGEBRACHT** —
`Doku/I18N_GENERATE_EN.md`, vier Stolperfallen — *und im selben Atemzug gesagt:*

> **„gemini ist nicht unser master. du kannst das auch genauso gut."**
>
> **„natürlich lade ich dich auch ein, Englisch auf dem gleichen Niveau,
> Deutsch und Tonart, Kürze zu übersetzen."**

**DAMIT WAR DER ZUSCHNITT ENTSCHIEDEN.** *Diese Runde hat nicht vier
Stolperfallen abgearbeitet. Sie ist durch alle 1197 englischen Schlüssel
gegangen, jeden gegen seinen deutschen Satz — mit demselben Maßstab, den das
Deutsche in 0.31.0 und 0.31.1 bekommen hat.* **Die Vorlage war eine Eingabe
neben den Messungen und kein Gesetz.**

---

## Die tragende Leitplanke, und sie hat eine Ausnahme mit Namen

> **DEUTSCH IST DIE UNVERÄNDERLICHE BASIS.** *Kein deutscher Wert ist von MIR
> angefasst worden — auch nicht „nur kurz", auch nicht da, wo beim Übersetzen
> auffiel, dass er besser ginge.* **Was auffiel, steht im Sammelblatt**
> (`Fehler und Ideen`, Punkt 28) — *fünf Funde, und alle fünf sind beim
> ÜBERSETZEN aufgefallen und nicht beim Lesen des Deutschen.*

**UND ZWEI DEUTSCHE WERTE HAT DER BETREIBER WÄHREND DER RUNDE BESTELLT.** *Am
13. September 2026, als der Prüfstand schon grün war:* **„vorne beim login statt
‚Zugang beantragen' lieber ‚Zugang anfragen'".** *Die Frage, ob das in diese
Runde gehört oder in die nächste, ist ihm gestellt worden — mit dem Preis
daneben —, und er hat entschieden:* **jetzt.**

| Schlüssel | vorher | jetzt |
|---|---|---|
| `login.requestAccess` | „Zugang beantragen" | **„Zugang anfragen"** |
| `login.requestAccessHint` | „**Zugang beantragen.** Du bestätigst deine Adresse per Mail …" | **„Zugang anfragen.** …" |

> **DER GRUND IST GEMESSEN UND KEINE GESCHMACKSFRAGE:** *das ganze Wortfeld sagt
> in **allen drei Sprachen** „Anfrage" — `login.sendRequest` („Anfrage
> abschicken" · „Send request" · „Başvuruyu gönder"), `card.openRequests`,
> `card.requestedAt`, `login.requestFailed`.* **Dieses eine Label war der
> Ausreißer.** *An `en.json` und `tr.json` war deshalb nichts zu tun: „request"
> IST die Anfrage (der Antrag wäre „application"), und `başvuru` ebenso — so hat
> der Betreiber es auch entschieden.*
>
> **UND DAS CHANGELOG HAT DEN KNOPF SCHON BEI SEINER EINFÜHRUNG SO GENANNT.**
> *0.11.0, 27. August 2026: „Ein zweiter Knopf auf der Anmeldeseite — **‚Zugang
> anfragen'**."* **Das Papier sagte „anfragen", der Bildschirm sagte
> „beantragen", und keine Runde dazwischen hat es gemerkt** — *der beste Beleg
> dafür, dass diese Bestellung eine Berichtigung ist und keine Geschmacksfrage.*

**DIE GLEICHLAUTPROBE RECHNET BEIDES NACH**, und der Prüfstand fährt sie seit
dieser Runde selbst — **drei Zeilen statt einer:** *die Summen dieser Runde, der
Beleg, dass sie ANDERE sind als die von 0.31.1, und die beiden bestellten Werte
Zeichen für Zeichen.*

| | vor der Runde | nach der Runde |
|---|---|---|
| **de/one** | `91b86c5affcba789` | **`7c1fe1a927f158f9`** *(zwei bestellte Werte)* |
| **de/other** | `07fc3ccdc8a27a03` | **`0b443d44733cc668`** *(dieselben zwei)* |
| **en/one** | `45fa40be3b0b6145` | `2f8e5b3abe58f9fd` |
| **en/other** | `24f9083c0610df9d` | `39489ec6ae18020b` |

> **EINE ZUSAGE MIT EINER AUSNAHME OHNE NAMEN WÄRE EIN LECK.** *Darum steht die
> Ausnahme im Code (`DE_ORDERED_0312`) und nicht in einer Fußnote: der Lauf
> prüft, dass **genau diese zwei** Werte so dastehen — und dass sonst kein
> deutscher anders ist als der Stand von 0681d42 (**943 Sätze**, Wortlautprobe).*

> **UND DIE GEGENRICHTUNG STEHT ALS EIGENE ZEILE IM PRÜFSTAND:** *die beiden
> englischen Summen müssen ANDERE sein.* **Hielte Zusage 1, ohne dass sich
> Englisch bewegt, hätte die Runde nichts getan** — *eine Zusage, die auch bei
> Nichtstun grün ist, belegt nichts.*

### Der Auftrag nennt zwei andere Zahlen, und sie sind nicht nachzumessen

**IM AUFTRAG STEHEN `bbd86a64161af49e` UND `70b5fb78ad2832b1`.** *Am gebauten
Stand von 0.31.1 rechnet das Werkzeug sie nicht — weder am Arbeitsbaum noch an
einer frischen Kopie von HEAD (`git archive`), und an `public/app.js` und den
drei Sprachdateien hat zwischen 0.31.1 und dieser Runde niemand etwas
geändert.* **Was die Runde halten kann, ist der GEMESSENE Stand**, und der steht
oben und im Prüfstand.

> **DAS IST KEINE SPITZFINDIGKEIT.** *Eine Zusage auf eine Zahl, die niemand
> nachrechnen kann, ist keine Zusage — sie ist eine Abschrift. Die beiden Zahlen
> hier stehen im Code (`DE_UNTOUCHED`), damit jeder Lauf sie prüft, statt dass
> ein Papier sie behauptet.*

---

## Die Vorlage, Zeile für Zeile nachgemessen

**ALLE EINUNDZWANZIG ZITATE STIMMEN.** *Jeder genannte Schlüssel existierte, und
jeder las sich genau so, wie die Vorlage ihn wiedergab* — **dieselbe gute
Nachricht wie bei `I18N_CLEANUP_DE.md` in 0.31.0.**

| | die Vorlage sagt | gemessen |
|---|---|---|
| **Stolperfalle 1** *(Platzhalter)* | *„Größtes Risiko!"* | **Kein Risiko, sondern eine gehaltene Zusage** — *die Plätze standen in allen drei Dateien schon gleich, **0 Abweichungen**, und seit 0.31.1 hält das ein Wächter.* **Ihr Punkt bleibt trotzdem richtig, und zwar mehr, als sie wusste:** *der Satzbau muss den Platz tragen können — daran sind in dieser Runde fünf englische Sätze gescheitert, und dazu eine NAHT über drei Schlüssel (siehe unten)* |
| **Stolperfalle 2** *(Ballast)* | fünf Schlüssel | **Sieben** — *es fehlten `card.vocabularyResetHint` (Englisch war **2,5×** so lang), `card.fontSizeHint` und `server.entryTooBig`* |
| **Stolperfalle 3** *(Metaphern)* | sechs Beispiele | **Alle sechs waren da, und alle sechs sind weg** |
| **Stolperfalle 4** *(Blacklist)* | dreizehn Zeilen | **52 Treffer in 46 Schlüsseln** — *mehr als die 36 des Auftrags, weil der Wächter die MUSTER prüft und nicht die Beispielsätze: `whoever` traf neunmal, `posts` siebenmal, `sits` achtmal* |

**UND DIE US-SCHREIBUNG, die vierzehnte Zeile der Vorlage, hatte NULL Treffer.**
*Sie ist deshalb keine Arbeit dieser Runde, sondern Zusage 8: sechzehn Paare,
jedes mit seiner britischen Seite, damit es dabei bleibt.*

---

## Die sieben Bauabschnitte

| | was | Ergebnis |
|---|---|---|
| **BA 1** | **Die Blacklist wird ein Wächter** — *zuerst gebaut, damit er beim Bauen schon rot steht* | **13 Muster**, jedes mit seinem Grund; dazu die neun übrigen Zusagen. **29 Prüfungen** |
| **BA 2** | **Der Ballast** — sieben Werte, länger als ihr deutscher | **7**, und `card.vocabularyResetHint` fiel von 160 auf 51 Zeichen |
| **BA 3** | **Die alten Metaphern** — was die Blacklist fand | **46 Schlüssel**, 52 Treffer |
| **BA 4** | **Die letzte HTML-Entität** | **1** — *`&lt;number&gt;` ist weg; 0.31.1 hatte sie ausdrücklich nur auf Deutsch genommen* |
| **BA 5** | **Die vier Briefe** | **4** — *„This inbox is not monitored." (F6), und der Einladungsbrief warnt, statt zu plaudern* |
| **BA 6** | **DER DURCHGANG** — alle 1197 Schlüssel, jeder gegen seinen deutschen Satz | **161 Schlüssel neu formuliert** (169 Formen); *darin die acht schlicht falschen Sätze, die keine Liste gemeldet hätte* |
| **BA 7** | **Prüfstand, Gegenproben, Papiere, Augenschein, Fingerprint** | **zehn Zusagen, elf Gegenproben, 6905 grüne Punkte** |

### Die Zahlen

| | vorher | nachher |
|---|---|---|
| **Schlüssel je Sprachdatei** | 1197 | **1197** — *diese Runde formuliert, sie räumt nicht* |
| **Englische Werte geändert** | | **161 Schlüssel, 169 Formen** |
| *davon `card.`* | | **97** |
| *davon `server.`* | | **31** |
| *davon `login.` · `entry.` · `mail.` · `dialog.` · `list.`* | | **11 · 8 · 7 · 5 · 2** |
| **Zeichen in `en.json`** | 42 537 | **41 902** — *635 weniger* |
| **Englisch im Verhältnis zum Deutschen** | 90,8 % | **89,4 %** |
| **Treffer der Verbotsliste** | 52 in 46 Schlüsseln | **0** |
| **Werte länger als ihr deutscher** *(ab 40 Zeichen, über 1,15×)* | 7 | **0** |
| **Werte mit mehr Sätzen als ihr deutscher** | 6 | **0** |
| **HTML-Entitäten** | 1 | **0** |
| **„Bitte" im Deutschen / „please" im Englischen** | 28 / 0 | **28 / 28** |
| **Deutsche Werte geändert** | | **2** — *beide auf Bestellung, beide namentlich im Prüfstand* |

---

## Acht englische Sätze waren schlicht falsch

**KEINE VERBOTSLISTE HÄTTE SIE GEMELDET, und keine Längenmessung.** *Sie sind
aufgefallen, weil jeder Satz einmal neben seinem deutschen gestanden hat — und
das ist der eigentliche Ertrag von BA 6.*

| | was dastand | was es heißen muss |
|---|---|---|
| **1** | „The rows are **sorted by** {word} deleted automatically" | *gelöscht wird nach {word}, nicht sortiert* — **„The rows are deleted automatically after {word}"** |
| **2** | „Before the export your password is **asked for**{extra} **asked for**" | *einmal reicht* — **„Before the export your password{extra} is asked for once"** |
| **3** | „For a backup, the card {word2} **simpler**." | *ohne „is"* — **„For a backup the card {word2} is simpler."** |
| **4** | „You set the weights under Settings › Inventory › {word} **in**." | *das „in" ist das deutsche „ein" von „einstellen"* |
| **5** | „Besides this one **there are** {word} session." | *Einzahl* — **„there is {word} session"** |
| **6** | „Every target **is** a number." | *„muss eine Zahl sein" ist eine Regel und keine Feststellung* |
| **7** | „**Configured is** {word}." | *Wortstellung aus dem Deutschen* — **„{word} is configured."** |
| **8** | „They **will** {word} **shown**." | *und gemeint war EIN Schlüssel, nicht mehrere* — **„It is shown {word}."** |

> **DAZU ZWEI, DIE ETWAS ANDERES SAGTEN ALS DAS DEUTSCHE.** *`mail.hintAlways`
> nannte **GMX**, wo das Deutsche „viele Anbieter" sagt — und der GMX-Hinweis
> selbst ließ seine zweite Hälfte weg.* **`mail.confirm.body` erfand einen
> Satz:** *„it only says „yes, that is me"" stand für „er bestätigt nur, dass die
> Adresse dir gehört".*

### Und eine Naht, die auf Englisch nicht aufgeht

**SIE IST DER NEUNTE FUND, und sie steht hier gesondert, weil kein einzelner
Wert falsch war.** *Drei Schlüssel und ein `<code>` bilden EINEN Satz:*

```
de:  «Der Schlüssel liegt weiterhin im Datenbankverzeichnis» «(data/encryption.key).
     Der Eigentümer sollte ihn in die Server-Einstellung» ENCRYPTION_KEY «übernehmen.»
en:  «The key is still in the database directory» «(data/encryption.key). The owner
     should move it into the server setting» ENCRYPTION_KEY «apply.»
```

**IM DEUTSCHEN GEHT DAS AUF, WEIL DAS VERB AM ENDE STEHT.** *Im Englischen steht
es vorn — und das Schlussstück fiel als „apply." hinter den Schlüsselnamen.*
**`card.applyLower` heißt jetzt „instead."**, und der Satz liest sich zusammen:
*„The owner should move it into the server setting ENCRYPTION_KEY instead."*

> **GEFUNDEN AN ALLEN NÄHTEN AUF EINMAL UND NICHT AN DIESER EINEN.** *Fünfzehn
> Zeilen in `public/app.js` setzen zwei oder mehr Textrufe in EINE Vorlage; sie
> sind mit ihren englischen Werten gerendert und gelesen worden.* **Die übrigen
> vierzehn gehen auf** — *und `server.js`, `auth.js` und `mail.js` tragen keine
> einzige solche Zeile.*

---

## Eine Stelle, an der Englisch dem Deutschen NICHT folgt

**`server.ruleKeep` UND `server.ruleDays` ZITIEREN DIE BESCHRIFTUNG, DIE WIRKLICH
AN DEM FELD STEHT** — *„Keep at least" und „Delete when older than", jeweils in
Anführungszeichen.* **Im Deutschen heißen dieselben Felder in der Karte anders
als in ihrer Fehlermeldung** (*„Mindestens behalten" gegen „Immer behalten",
„Löschen ab Alter" gegen „Erst löschen ab"*) — **und diesen Bruch mitzuübersetzen
hieße, dem Benutzer beim Suchen zuzusehen.**

> *Die beiden deutschen Stellen stehen als Fund 3 und 4 im Sammelblatt. **Auf
> Englisch ist entschieden worden, der OBERFLÄCHE zu folgen und nicht dem
> Wortlaut** — die einzige Stelle der Runde, wo das vorkommt, und sie steht
> deshalb hier namentlich.*

---

## Was beim Bauen schiefgegangen ist

**FÜNF FEHLER, UND JEDER IST VON EINER WACHE GEFANGEN WORDEN, BEVOR IHN JEMAND
GESEHEN HAT.** *Sie stehen hier, weil sie beim nächsten Mal wieder passieren.*

| | was | wer es gefangen hat |
|---|---|---|
| **1** | **DIE RUNDE HAT IHR EIGENES WORT VERBOTEN.** *Der Auftrag nennt die Vergleichsdatei anders — `Abdruckdatei` —, und ich habe das Wort in drei Kommentarzeilen übernommen* | **der Sprachwächter** — *`Abdruck` steht auf seiner Liste, dort heißt es Fingerprint. Er meldete Datei und Zeilennummer; die Sache heißt jetzt **Vergleichsstand**, und das zitierte Wort steht in Backticks* |
| **2** | **MEIN ERSTER ENGLISCHER SATZ NAHM EINER PRÜFUNG IHR SUCHWORT.** *`card.blocksHint` hieß bei mir „Block order and collapsed state apply to all {entryMany}." — die Sprachprobe des Lesers (0.24.4, B9) sucht den Hinweis über `/Blöcke|blocks/i` und fand ihn nicht* | **der Prüfstand, zwei rote Punkte im ersten vollen Lauf.** *Geändert habe ich den SATZ und nicht die Probe: „The order of the blocks and their collapsed state apply to all {entryMany}." — eine Probe, die man der eigenen Formulierung anpasst, belegt nichts mehr* |
| **3** | **ZUSAGE 6 WURDE AN MEINEM EIGENEN SATZ ROT.** *Meine erste Fassung von `card.fileTooBig` war 72 Zeichen lang, die Decke liegt bei 70* | **der eigene Wächter, im selben Lauf.** *Die Naht ist jetzt dort geteilt, wo das Deutsche sie teilt — der englische Satz läuft über beide Schlüssel und liest sich zusammengesetzt richtig* |
| **4** | **DIE VORLAGE HAT IHREN EIGENEN SATZ ZU LANG VORGESCHLAGEN.** *Ihr Vorschlag für `entry.calcIfEqual` lag bei 1,20×, mein erster Nachbau bei 1,17×* | **derselbe Wächter.** *„statt" wurde „, not" und nicht „instead of" — damit 1,08×* |
| **5** | **UND DASSELBE WORT EIN ZWEITES MAL** — *diesmal nicht im Kommentar, sondern in DIESEM Papier: die Zeile über Fehler 1 nannte `Abdruckdatei` ohne Backticks* | **derselbe Sprachwächter, und er hat es während der Gegenprobenläufe getan.** *Alle zehn Läufe zeigten „Die Dokumente ebenso" rot — nicht wegen ihres Rückbaus, sondern wegen meines Papiers. **Ein Wächter, der Code und Prosa mit derselben Liste liest, fängt auch den Autor.*** |

> **UND EINE MESSUNG HAT ZWEI STELLEN GEFUNDEN, DIE KEIN LESEN GEFUNDEN HÄTTE.**
> *Nachdem alle „Bitte"-Sätze übersetzt waren, habe ich gezählt statt geglaubt:
> **28 deutsche Werte tragen „bitte", englische trugen „please" nur 26 Mal**.*
> **Die beiden Fehlenden waren `card.codesRunningOut` und `dialog.twoFactorOn`**
> — *zwei Fortsetzungsstücke, die beim Durchgang genau deshalb durchgelaufen
> sind: sie sind kein Satz, sondern ein halber.*

---

## Was die Wachen dieser Runde halten

| | Zusage | wie sie geprüft wird |
|---|---|---|
| **1** | **Deutsch ist unangetastet — außer den zwei bestellten Werten** | *die Gleichlautprobe wird GEFAHREN; **drei Zeilen**: die Summen dieser Runde, der Beleg, dass sie ANDERE sind als die von 0.31.1, und die zwei Werte Zeichen für Zeichen (`DE_ORDERED_0312`). Dazu die Gegenrichtung — die englischen Summen müssen ANDERE sein* |
| **2** | **Gleich viele Schlüssel, dieselbe Folge, dieselbe Gestalt** | **1197**, und **ein Mehrzahlpaar bleibt eines** — *die Deckungsprobe sähe das nicht; am Bildschirm stünde „1 vocabulary words"* |
| **3** | **Jeder Platzhalter steht gleich** | beide Richtungen, auf Englisch eingegrenzt |
| **4** | **Kein englischer Wert trägt ein Wort der Verbotsliste** | **13 Muster**, jedes mit Grund — *und zwei Zeilen prüfen den LESER selbst: er findet die alten Sätze, und er färbt sich an `{thing}` nicht* |
| **5** | **Keine HTML-Entität** | *die Zusage, die 0.31.1 bewusst halb gelassen hat, ist ganz* |
| **6** | **Kein Wert ab 40 Zeichen ist mehr als 1,15× so lang wie sein deutscher** | *nur in EINE Richtung (F7): kürzer darf er, länger nicht. Unter 40 Zeichen gar nicht — „vor" wird „before" und ist doppelt so lang* |
| **7** | **Nicht mehr Sätze als der deutsche** | *die Abkürzungen fallen vorher heraus, namentlich — „z. B." zählte sonst als zwei Satzenden* |
| **8** | **en-GB, keine US-Schreibung** | **16 Paare**, jedes mit seiner britischen Seite — *eine Regel „kein -ize" hätte `size` gemeldet* |
| **9** | **Kein Weißraum aus dem Quelltext** | *und ein Umbruch nur in den vier Briefen; dazu: jeder Brief trägt seine Leerzeilen* |
| **10** | **Der englische Stand liegt als Vergleichsdatei daneben** | `tools/englisch-0312.json`, erzeugt von `tools/englischstand.js` — *und die Tafel `EG_CHANGED_AFTER_0312` ist LEER: wer Englisch anfasst, benennt es* |

**ZUSAGE 10 IST DIE, DIE ÜBER DIESE RUNDE HINAUSREICHT.** *Für Deutsch gibt es
eine Abnahme (0681d42) und die Wortlautprobe hält sie; für Englisch gab es keine
— **diese Runde IST sie** (F9). Was sie hinterlässt, ist ein Stand, gegen den
0.31.3 und alles danach prüfen kann.* **Einen Vergleichsstand still nachzuziehen
ist damit keine Möglichkeit mehr, sondern ein roter Punkt.**

---

## Elf Gegenproben für zehn Zusagen

**EINE PRÜFUNG, DIE GRÜN IST, BELEGT NICHTS, solange niemand gezeigt hat, dass
sie auch rot werden kann.** *Jede Zusage bekommt einen Rückbau in einer
`git archive`-Kopie; festgehalten wird, WELCHE Prüfungen daraufhin namentlich rot
werden.* **Ein Rückbau, der keine einzige rot macht, ist ein FUND.**

**ZUSAGE 1 BEKOMMT ZWEI, seit der Betreiber zwei Werte bestellt hat:** *„kein
deutscher Wert ist von mir angefasst" (**978**) und „genau diese zwei sind es auf
Bestellung" (**988**).* **Eine Ausnahme ohne Gegenprobe ist eine Behauptung** —
*sie kann still verschwinden, und niemand merkt es.*

**DIE ERSTEN ZEHN SIND GEFAHREN — drei Nebenspuren, je Rückbau ein voller
Prüflauf, `0 STUMM`.** *Jeder hat SEINE Zusage namentlich rot gemacht.*

| Nr. | was zurückgebaut wird | für Zusage | was namentlich rot wurde |
|---|---|---|---|
| **978** | ein deutscher Wert ändert sich | 1 | *„Und die beiden deutschen sind die von 0.31.1"* — **dazu die Wortlautprobe und vier Zeilen der Systembereichsprobe**, weil der Rückbau eine Kartenbeschriftung umbenennt |
| **979** | ein englisches Mehrzahlpaar wird ein einzelner Satz | 2 | *„Und jeder englische Wert hat die Gestalt seines deutschen"* — dazu Zusage 3, denn die verschmolzene Einzahl verliert ihren Platz |
| **980** | ein englischer Wert verliert einen Platzhalter | 3 | *„Zusage 3 …"* — **und die Platzhalterprobe von 0.24.0**: zwei Wachen über eine Zusage, und sie widersprechen sich nicht |
| **981** | ein englischer Wert trägt wieder ein Wort der Verbotsliste | 4 | *„Zusage 4: kein englischer Wert trägt ein Wort der Verbotsliste"* |
| **982** | ein englischer Wert trägt wieder eine HTML-Entität | 5 | *„Zusage 5: kein englischer Wert trägt eine HTML-Entität"* |
| **983** | ein englischer Satz wird wieder deutlich länger als sein deutscher | 6 | *„Zusage 6: … mehr als 1.15x so lang …"* |
| **984** | ein englischer Wert trägt einen Satz mehr | 7 | *„Zusage 7: … mehr Sätze als sein deutscher"* — **und Zusage 6 bleibt grün**, genau wie geplant: der Rückbau ist ein Zeichen kürzer |
| **985** | ein englischer Wert trägt eine US-Schreibung | 8 | *„Zusage 8: … US-Schreibung — en-GB steht in `_locale`"* |
| **986** | ein englischer Wert trägt wieder die Einrückung des Quelltexts | 9 | **beide Zeilen der Zusage** — dazu die Zwillingszeile aus 0.31.1, die alle drei Dateien prüft |
| **987** | der Vergleichsstand weicht von `en.json` ab, ohne benannt zu sein | 10 | *„Und jeder englische Wert ist Zeichen für Zeichen der des Vergleichsstands — außer den benannten"* |
| **988** | das Label heißt wieder „Zugang beantragen" | 1 *(zweite Hälfte)* | **drei Wachen zugleich, und das ist hier die Sache selbst:** *die Prüfsummen dieser Runde, die Tafel `DE_ORDERED_0312` und — weil die Ausnahme der Bildschirmverbotsliste mit dem Satz gewandert ist — das Verbot von „Zugang" für Konto* |

### Drei Zeilen standen in JEDEM Lauf rot, und keine davon ist der Rückbau

| | was | warum |
|---|---|---|
| **1** | **„Die Dokumente ebenso"** *(Sprachwächter)* | **MEIN EIGENES PAPIER.** *Das Änderungsprotokoll trug „`Abdruck`" ohne Backticks, während die Gegenproben liefen — dieselbe Wache, die schon meine Kommentarzeilen gemeldet hatte, meldete nun den Text darüber.* **Sie stand also VOR jedem Rückbau schon rot**, und das ist beim Lesen der Tabelle zu wissen |
| **2** | **„Jeder Suchtext kommt in seiner Datei genau einmal vor"** | *der Rückbau ersetzt in der Kopie genau diesen Suchtext — die Zeile ist damit die Spur des Eingriffs und kein Befund* |
| **3** | **Der Aufräumer des Prüfstands** *(bei 983 und 984)* | *Punkt 27 im Sammelblatt: er flackert auf mehreren Spuren, „rund die Hälfte, gleich welche Spurenzahl". Hier zweimal von zehn* |

> **DASS DIESE DREI DASTEHEN, IST KEIN MANGEL DES TREIBERS, SONDERN SEIN
> ENTWURF:** *er meldet, was WIRKLICH rot wurde, und nicht, was jemand erwartet
> hat.* **Ein Treiber, der nur die erwartete Zeile zeigte, hätte den Fund am
> eigenen Papier verschluckt.**

> **JEDER GREIFT IN DIE DATEN UND NICHT IN DEN WÄCHTER**, und jeder ist so klein
> geschnitten, dass er SEINE Zusage meldet und möglichst keine zweite: *der
> Längenrückbau fügt keinen Satz hinzu, der Satzrückbau macht aus einem
> Gedankenstrich einen Punkt und bleibt dabei gleich lang.* **Ein Rückbau, der
> drei Zeilen zugleich rot macht, sagt nicht, welche gefangen hat.**

> *Nummer **987** ist der einzige, der nicht in eine Sprachdatei greift, sondern
> in die Vergleichsdatei: es geht dort um die Buchführung selbst.*

---

## Der Augenschein — am laufenden Server, in echtem Chromium

**Gefahren am 13. September 2026** *(Chromium 141.0.7390.37, 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`, `locale: en-GB`)* — **neun Ansichten,
jedes `<details>` aufgeklappt, alles auf Englisch.**

> **ER FRAGT ETWAS ANDERES ALS DER VON 0.31.1.** *Jene Runde hat die ABLAGE der
> Sätze angefasst und wollte belegen, dass sich am Bildschirm nichts ändert.*
> **Diese Runde hat die Sätze selbst angefasst** — *also lautet die Frage: steht
> das Neue wirklich da, ist das Alte wirklich weg, und spricht die Oberfläche
> durchgehend Englisch?*

**ZWEI LAGEN SIND DAFÜR EIGENS HERGESTELLT WORDEN:** *der Sicherungsordner liegt
IM Projektordner (sonst zeichnet die Karte den roten Kasten nicht), und ein
Eintrag steht im Bestand (sonst gibt es keine Kachel und keine Detailansicht).*

| gefragt | Ergebnis |
|---|---|
| **Ein offener Platzhalter irgendwo?** *(gesucht wird das MUSTER `{name}`, keine Liste)* | **keiner** |
| **Ein Wort der Verbotsliste am Bildschirm?** *(dieselben dreizehn Muster wie im Prüfstand, Plätze vorher herausgenommen)* | **keines** |
| **Stehen die neuen Sätze wirklich da?** *(neunundzwanzig Marken, von „Thumbnails: always WebP" bis „as per BCP 47 (e.g. de-DE)")* | **siebenundzwanzig von neunundzwanzig** |
| **Ist das Alte wirklich weg?** *(neunzehn Marken: „leaves the house", „Like the device", „pills", „still image", „Thing, singular", „Backup written", „sits next to", „by hand", „already current", „Whoever has", „posts stay", „The run converts", „nobody archives", „yes, that is me", „asked for asked for", „sorted by", „Weight in.", „User name" …)* | **keine einzige steht noch da** |

> **DIE ZWEI UNGESEHENEN SIND KEIN BEFUND, SONDERN DIE GRENZE DER PROBE.**
> *„Clicking one of the three buttons sets the filter." steht nur in einer
> Instanz mit mehr als einem Benutzer, und „As of" erst, nachdem eine Sicherung
> geprüft wurde.* **Beide fährt der Prüfstand in seinen eigenen Gruppen.**

---

## Ein Fund, und er ist größer als diese Runde

**DER AUGENSCHEIN HAT AUF EINER ENGLISCHEN OBERFLÄCHE DEUTSCHEN TEXT GEFUNDEN**
— *in der Karte „Users", unter dem Registrierungsschalter:*

```
Switching it on is only possible once mail delivery is set up.
Es ist kein Mailzugang eingerichtet. Das macht der Eigentümer dieser Installation.
```

**ER STEHT NICHT IN EINER SPRACHDATEI, SONDERN FEST IN `server.js`.** *Nachgezählt
sind es **elf Sätze**, und jeder von ihnen erreicht den Bildschirm:*

| wo | wie viele | wer sie liest |
|---|---|---|
| **`deliveryReady()`** — warum diese Instanz nicht verschicken kann | **3** | die Karte „Users" *(genau der gefundene Satz)* und die Warnung darüber |
| **`sendTokenLink()`** — warum ein Link nicht hinausging | **3** | `card.passLinkByHandEnd` — *„{reason}. Pass the link on manually."* |
| **`REQUEST_ANSWER`** — die Antwort auf eine Zugangsanfrage | **1** | **jeder, der sich auf der Anmeldeseite meldet**, vor jeder Anmeldung |
| **Die Vorschau des Aufräumens** — warum gerade nichts fällt | **4** | die Karte „Sicherung" |

> **DAS IST DIESELBE SORTE BEFUND WIE DIE ZWEI VON 0.31.1** *(„3 entries **und**
> 2 test days", „2,1 MB **weniger**")* — **nur größer:** *dort waren es zwei
> Bindewörter, hier sind es elf ganze Sätze.*

**WARUM SIE IN DIESER RUNDE NICHT REPARIERT WERDEN:** *jeder dieser Sätze
braucht einen Schlüssel in **allen drei** Sprachdateien, und der Auftrag
schließt das ausdrücklich aus* (**F4: „1197 bleibt 1197"**, und Leitplanke L1
verbietet jeden Handgriff an `de.json`). **Eine Runde, die ihre eigene Zusage
bricht, um einen Fund mitzunehmen, ist keine Reparatur, sondern ein zweiter
Fund.** *Sie stehen als **Punkt 29** im Sammelblatt, mit Ort, Zahl und Leser.*

> **UND EIN ZWÖLFTER, DER KEIN TEXT DER OBERFLÄCHE IST:** *ein Import ohne Titel
> legt den Eintrag unter `'Ohne Titel'` an — das ist ein gespeicherter WERT und
> keine Beschriftung, und es ist damit die gleiche Lage wie bei den drei
> mitgelieferten Kriterien (Punkt 23).*

---

## Was diese Runde NICHT gebaut hat

| | |
|---|---|
| **Kein türkischer Wert ist angefasst** | *Türkisch ist 0.31.3* |
| **Und kein deutscher außer den zwei bestellten** | *die fünf Funde aus Punkt 28 warten weiter auf eine Runde, die Deutsch anfassen darf; `tr.json` und `en.json` brauchten für die Bestellung nichts* |
| **Kein Schlüssel ist gefallen und keiner neu** | **1197 bleibt 1197** |
| **Keine Anordnung, kein Schemaanteil** | *Austauschformat bleibt 16, `F_ROUTES` bleibt 73* |
| **„Note" bleibt stehen** | *sie wird in **0.32.0** das fünfzehnte Vokabelwort; auf Englisch heißt sie weiterhin „score"* |
| **Keine Wortlautprobe für Englisch** | *die deutsche hält den Stand einer ABNAHME fest; für Englisch gibt es keine — statt ihrer liegt der Vergleichsstand daneben (F9)* |

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.** *Wer eine englische Instanz betreibt, sieht nach dem
Einspielen andere Sätze — und keine andere Funktion.*

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.31.2.md`** | *bleibt liegen, bis der Auftrag zu 0.31.3 kommt — es liegt immer nur einer im Repo* |
| **`Doku/I18N_GENERATE_EN.md`** | **bleibt liegen** — *die Vorlage ist der Gegenstand, gegen den geprüft wurde; 0.31.3 liest sie für Türkisch noch einmal* |
| **`Doku/Aenderungsprotokoll_0.31.2.md`** | dieses Papier |
| **`Doku/Projektstand_Kriterion_0_31_2.md`** | `git mv`, **Revision 89** |
| **`Doku/Fahrplan.md`** | die Zeile 0.31.2 durchgestrichen; **die geplanten Runden rücken nicht** |
| **`Doku/Fehler_und_Ideen.md`** | **Punkt 28** — das Sammelblatt der Runde, fünf deutsche Funde |
| **`tools/englischstand.js`** · **`tools/englisch-0312.json`** | **neu** — der Vergleichsstand und sein Werkzeug |
| **`public/languages/en.json`** | 161 Schlüssel neu formuliert |
| **`public/languages/de.json`** | **zwei Werte** — „Zugang anfragen", auf Bestellung des Betreibers |
| **`testbench.js`** · **`counterproof.js`** | zehn Zusagen, zehn Rückbauten |
| **`CHANGELOG.md`** | ein Eintrag 0.31.2 |
| **`package.json`, `package-lock.json`** | 0.31.2 |
