# Änderungsprotokoll 0.32.0 — „Einen anderen markieren"

**Auftrag 0.32.0 · 14. September 2026 · gebaut auf 0.31.4 · MINOR, mit
Schemaanteil an der DATENBANK und keinem am Austauschformat.**

> **FINGERPRINT DIESER RUNDE: `319d9c8a`** — *gerechnet am gebauten Stand, als
> letztes und hinter der letzten Zeile; achtzehn Dateien, `Doku/` und
> `testbench.js` ausdrücklich nicht darunter.*

> **DER BODEN WAR GEPRÜFT UND NICHT ANGENOMMEN.** *Der Fingerprint `85521c1b`
> stand vor der ersten Zeile aus drei Quellen fest, und die sechs
> Gleichlautsummen von 0.31.4 sind vor dem ersten Handgriff nachgerechnet
> worden — alle sechs Zeichen für Zeichen die des Auftrags.*
>
> | | Einzahl | Mehrzahl |
> |---|---|---|
> | **de** | `0f38b9157739b492` | `bc6542b1f0e28bd6` |
> | **en** | `597dfc60b7a1fa63` | `6558810bf793704a` |
> | **tr** | `a7f3cd4bf8992f90` | `e26a1dca46c545da` |

---

## Drei Stränge, und der dritte war der billigste Augenblick

| | Strang | was daraus geworden ist |
|---|---|---|
| **1** | **Einen anderen markieren** | `@name` als **viertes Stück der Zerlegung**, die Glocke trennt nach Herkunft, ein gelöschter Zugang steht als „Gelöschter Benutzer 7" |
| **2** | **Das fünfzehnte Vokabelwort** | `vocabulary.grade` — „Note" ist keine feste Beschriftung mehr |
| **3** | **Was die Sprachrunden hinterlassen haben** | Punkt 28, 29, 30 und 31 des Sammelblatts sind abgearbeitet — **und Punkt 29 hat einen zwölften Satz nachgeliefert, den der neue Wächter gefunden hat** |

---

## Die Fragetafel, beantwortet

| # | Frage | Antwort |
|---|---|---|
| **F1** | Die Nummer? | **0.32.0, MINOR** |
| **F2** | Spalte oder Ableitung? | **Gespeichert, nicht abgeleitet — die ZUGANGSNUMMER.** *Als VERKNÜPFUNG und nicht als Spalte: ein Kommentar markiert mehrere („@anna @bert schaut mal"), eine Spalte trüge genau einen davon. Der Kern von F2 ist „gespeichert statt abgeleitet", und der steht* |
| **F3** | Wie unterscheidet die Glocke? | **Eine Zahl, eine geteilte Tafel** — drei Abschnitte: **An mich gerichtet · Meine {entryMany} · Alles andere** |
| **F4** | Der Satz im Glockenfenster? | **Ersetzt, in allen drei Sprachen** — und `list.otherUser` fällt dabei ganz |
| **F5** | Wie heißt das fünfzehnte Wort? | **`vocabulary.grade`**, Beschriftung **`card.grade`** („Sterne am Zeitpunkt"), Karte **`v15`** |
| **F6** | Kommen die elf Sätze mit? | **Ja — neun neue Schlüssel für elf Sätze.** *Zwei sind Wiederholungen: `mail.noAccount` stand schon da, `server.noPublicAddress` deckt zwei Stellen* |
| **F7** | Und der Wächter dazu? | **Ja — und er hat noch in derselben Runde den ZWÖLFTEN gefunden** |
| **F8** | Die Dankseite bei leerem Formular? | **Ja** — Browser und Server prüfen die FORM |
| **F9** | Die fünf Funde aus Punkt 28? | **Ja, alle fünf** |
| **F10** | Der `yedek`-Wächter? | **Ja** — ohne `\b`, und die allgemeine Zeile dazu ist selbst ein Wächter |
| **F11** | Die drei mitgelieferten Kriterien? | **Nicht gebaut** — sie bleiben, wie F12 |
| **F12** | `'Ohne Titel'`? | **Bleibt** — ein gespeicherter WERT, keine Beschriftung |
| **F13** | Steigt das Austauschformat mit? | **Nein, es bleibt 16** — bestätigt |

---

## Strang 1 · Die Markierung — ein viertes Stück und keine Nachbearbeitung

**SEIT 0.18.0 ENTSTEHT DER KOMMENTARTEXT ALS ECHTE KNOTEN UND NIE ALS STRING**
*(`buildCommentNodes(splitCommentText(text, term))`)*. **Leitplanke L2 hat
verlangt, dass die Markierung ein VIERTES Stück dieser Zerlegung wird** — und
genau das ist sie: `splitAtMention()` steht zwischen der Linksuche und der
Suchhervorhebung, und `pieceNode()` macht daraus ein `<span class="mention">`
über `textContent`. **Kein `replace()` über das Ergebnis, an keiner Stelle.**

### Der Server löst auf, nicht der Browser

| | |
|---|---|
| **Wann** | **beim SCHREIBEN** — `setMentions()` läuft am Anlegen, am Ändern des Textes und am Import |
| **Womit** | einer Namenstafel, klein geschrieben mit der **Vergleichssprache** — sonst wären „İstanbul" und „istanbul" für den einen derselbe Zugang und für den anderen zwei |
| **Was gespeichert wird** | **die Nummer** in `comment_mentions`, daneben der `handle`, wie er im Rohtext steht |
| **Was angezeigt wird** | **immer der Name aus der NUMMER** — ein gelöschter Zugang steht als „Gelöschter Benutzer 7", ein umbenannter unter seinem HEUTIGEN Namen |

> **WARUM DIE NUMMER UND NICHT DER NAME — der Befund, der F2 gekippt hat:** *ein
> gelöschter Name wird FREIGEGEBEN* (`card.deleteUserHint`: „der Name wird
> frei"). **Eine Markierung, die nur `@bert` im Text trägt, zeigt danach nicht
> auf niemanden, sondern auf DEN FALSCHEN** — *ein zweiter Mensch kann den Namen
> längst tragen, und niemand sieht es.* **Dazu kommt: „Gelöschter Benutzer 7"
> ist aus einem Namen gar nicht zu bilden** — `list.deletedUser` verlangt die
> Nummer.

### Was ein Tippfehler tut — und warum das die Antwort auf „freier Text" ist

**DER FAHRPLAN HAT DEN PREIS BENANNT:** *„Freier Text bedeutet Tippfehler, die
still ins Leere zeigen."* **Sie zeigen nicht ins Leere.** *`@bret` steht in
keiner Namenstafel, wird gar nicht erst eine Markierung, bleibt gewöhnlicher
Text* — **und genau daran SIEHT man, dass der Griff danebengegangen ist: an der
fehlenden Hervorhebung.**

| gemessen am Muster | |
|---|---|
| `@bert schau mal` | **eine Markierung** |
| `hallo @bert.` | **eine** — der Punkt am Satzende gehört nicht zum Namen |
| `bert@beispiel.de` | **keine** — vor dem `@` steht ein Namenszeichen, das ist eine Adresse |
| `@şeyma und @Ünal` | **zwei** — das Muster liest Unicode-Buchstaben und **kommt ohne `\b` aus** (L4) |
| ein Name mit Leerzeichen | **gar nicht markierbar**, und das steht im Quelltext — ein halb erratener Name wäre schlimmer als keiner |

---

## Strang 1 · Die Glocke rechnet einmal und trennt nach Herkunft

**LEITPLANKE L1: KEINE ZWEITE WAHRHEIT NEBEN DER GLOCKE.** *Unterscheiden heißt
nicht zweimal zählen.* **Die Abfrage ist deshalb EINE Spalte breiter geworden
und nicht zu zwei Abfragen:**

```sql
SELECT c.item_id, c.user_id, COUNT(*) AS n,
       SUM(CASE WHEN m.comment_id IS NULL THEN 0 ELSE 1 END) AS marked
  FROM comments c
  LEFT JOIN comment_mentions m ON m.comment_id = c.id AND m.user_id = ?
 WHERE c.created_at > ? AND c.user_id IS NOT ?
 GROUP BY c.item_id, c.user_id
```

> **DER JOIN STEHT IN DER `ON`-BEDINGUNG UND NICHT IM `WHERE`.** *Im `WHERE`
> machte er aus dem `LEFT JOIN` einen `INNER` — die Abfrage lieferte dann nur
> noch die markierten Kommentare, und die Glocke verlöre alles andere.*

**`marked` IST EINE TEILMENGE VON `n` UND KEINE ZAHL DANEBEN.** *Am Bildschirm
steht „3 Kommentare, davon 1 an mich gerichtet"; eine Summe der beiden bildet
niemand.* **`bellNew()` bleibt die eine Zahl der Glocke.**

### Die Tafel, dreigeteilt

| Abschnitt | wer dort steht |
|---|---|
| **An mich gerichtet** | jeder Eintrag, unter dem ein neuer Kommentar **mich** markiert |
| **Meine {entryMany}** | was unter Einträgen geschieht, die **mir gehören** |
| **Alles andere** | der Rest — was der Bestand gemeinsam hat |

> **EINE ZEILE STEHT IN GENAU EINEM ABSCHNITT**, *und zwar im stärksten, der auf
> sie zutrifft.* **Eine Zeile in zwei Abschnitten wäre dieselbe Sache an zwei
> Orten** — *und die Zahlen liefen auseinander.*

**UND DIE UNTERSCHEIDUNG „unter MEINEN Einträgen" WAR DER GRÖSSERE BEFUND.**
*Der Betreiber hat am 13. September 2026 gefragt, warum er die Kommentare
anderer überhaupt sieht und ob er unterscheiden kann, was unter seinen
Einträgen steht.* **Er konnte es nicht:** `items.user_id` trägt den Anleger, und
die Antwort der Übersicht nannte ihn nicht. **Sie tut es jetzt — als Ja/Nein
(`it.mine`) und nicht als Nummer**, *wie am Kommentar, an der Linkzeile und am
Anhang: eine nackte Zugangsnummer geht aus keiner Antwort hinaus.*

---

## Strang 2 · Das fünfzehnte Vokabelwort

**„NOTE" WAR DIE EINZIGE ZAHL IM PROGRAMM OHNE VOKABELWORT.** *Der Blockkopf
darüber nennt `V.dayMany`, der Nachbarblock `V.ratingOne` — beide umbenennbar;
dazwischen stand ein festes Wort.*

| | |
|---|---|
| **Schlüssel** | `vocabulary.grade` — **ein Wort und kein Paar**, wie `potential`: kein deutscher Wert schreibt „Noten" |
| **Beschriftung** | `card.grade` = **„Sterne am Zeitpunkt"** — dieselbe Bauform wie „Sterne vor dem Test" und „Sterne nach dem Test" |
| **Karte** | `v15` |
| **Zehn Schlüssel tragen das Wort** | `entry.grade` · `entry.gradeLabel` · `entry.calcGradeWeight` · `entry.gradeReplaced` · `list.sortAvg` · `list.lastGrade` · `list.gradeLong` · `list.gradeShort` · `list.sortLast` · `server.gradeRange` |
| **Was NICHT mitwächst** | **`VOCABULARY_FIELDS_0243` in `db.js` — sie bleibt bei vierzehn.** *Die Tafel übersetzt die ALTEN deutschen Namen von 0.24.3; „Note" hatte nie einen solchen. Eine fünfzehnte Zeile wäre eine erfundene Vergangenheit* |

### Zwei Beschriftungen mussten dabei umformuliert werden

**EIN FREIES WORT DULDET KEIN ADJEKTIV VOR SICH.** *Aus „**Letzte** Note" würde
mit einem gewählten Wort „Letzt**er** Tageswert", „Letzt**es** Ergebnis" — das
Geschlecht wechselt mit dem Wort, und die Sprachdatei kann es nicht wissen.*

| | vorher | jetzt |
|---|---|---|
| `list.sortLast` | „Letzte Note" | **„Zuletzt: {grade}"** |
| `list.sortAvg` | „Durchschnittsnote" | **„Durchschnitt: {grade}"** |

> **BEI `list.sortAvg` KOMMT EIN ZWEITER GRUND DAZU, und er ist der härtere:
> „Durchschnittsnote" ist ein ZUSAMMENGESETZTES Wort.** *Leitplanke L6 verbietet
> das seit 0.21.0 — „Erwartungkriterien" hätte kein Fugen-s.*

### Die Zahl vierzehn wird an allen Stellen zugleich fünfzehn

**LEITPLANKE L7: sie wird an allen zugleich fünfzehn, oder sie wird an keiner.**

| wo | |
|---|---|
| **Prüfstand** | **neun Prüfungen** auf die Zahl, dazu die Vokabelkarte (`v15`), die Vollständigkeitsansage und die Tafel der Beschriftungen |
| **README** | fünf Stellen |
| **`public/app.js`** | vier Kommentare an der Vokabelkarte, dazu fünf Aussagen im Präsens |
| **`server.js`** | sechs Aussagen im Präsens |
| **`db.js`** | **bleibt bei vierzehn** — und sagt jetzt ausdrücklich, warum |

---

## Strang 3 · Was die Sprachrunden hinterlassen haben

### Punkt 29 · Elf Sätze — und der zwölfte, den der Wächter gefunden hat

**NEUN SCHLÜSSEL FÜR ELF SÄTZE.** *Zwei sind Wiederholungen: „Es ist kein
Mailzugang eingerichtet." stand bereits als `mail.noAccount`, und der
PUBLIC_ADDRESS-Satz deckt zwei Stellen (`deliveryReady()` und
`sendTokenLink()`).*

| wo | wie viele | was daraus wurde |
|---|---|---|
| `deliveryReady()` | 3 | gibt jetzt einen **Schlüssel** zurück (`{ ok, key }`); `deliveryWhy()` ist die eine Stelle, die daraus einen Satz macht |
| `sendTokenLink()` | 3 | bekommt die Sprache des **Lesers** gereicht — der Grund steht in der Karte des Admins, der BRIEF geht weiter in der Sprache des Empfängers |
| `REQUEST_ANSWER` | 1 | ist eine **Funktion** geworden: Byte für Byte dieselbe Antwort für jede Lage, nur in der Sprache dessen, der sie liest |
| Die Vorschau des Aufräumens | 4 | **drei davon sind Mehrzahlpaare geworden** — bis 0.31.4 baute `cleanupPreview()` die Mehrzahl selbst (`=== 1 ? 'Sicherung' : 'Sicherungen'`) |

> **UND DER ZWÖLFTE: „Eigener Server".** *Er stand fest in der Anbieterliste von
> `mail.js` und erschien in der Auswahl des Mailzugangs UND in der Zeile der
> Karte „Mailversand" — auf Englisch und Türkisch deutsch.* **Gefunden hat ihn
> die Restprobe, die F7 verlangt hat, noch in derselben Runde.** *Der Auftrag
> hatte geschrieben: „Ohne sie ist der zwölfte eine Frage der Zeit." Sie war es
> nicht einmal eine Runde lang.*
>
> **DIE FÜNF ANDEREN ANBIETER BLEIBEN, WIE SIE SIND:** *„GMX", „Gmail",
> „Strato" sind MARKEN und heißen in jeder Sprache so.* `nameKey` steht deshalb
> **neben** `name` und ersetzt es nicht.

### Die Restprobe für `server.js` — der Wächter, der gefehlt hat

**FÜR `public/app.js` GIBT ES SIE SEIT 0.24.0; FÜR DIE DREI SERVERDATEIEN GAB ES
KEINE.** *Der Wächter von 0.24.0 las nur, was hinter `error:` stand — und alle
elf standen woanders.*

| | |
|---|---|
| **Was sie liest** | jedes Stück in Anführungszeichen und jedes Textstück einer Vorlage **zwischen zwei `${…}`-Stellen** (Punkt 26) |
| **Was vorher weggeschnitten wird** | `console.log/warn/error` und `db.prepare` — **mit gezählten Klammern und nicht bis zum Zeilenende**: eine Meldung kann über drei Zeilen gehen |
| **Wonach sie fragt** | **nach der SPRACHE und nicht nach einer Liste** — trägt der übrige Text ein deutsches Wortstück? Ein Wächter, der eine Liste vergleicht, ließe den dreizehnten genauso durch |
| **Was übrig bleibt** | **vier Sorten, alle benannt**: Programmierfehler (`throw new Error`), der Bildschirm des Wirts (die PUBLIC_ADDRESS-Prüfung landet in `console.warn`), alte deutsche Namen aus der `.env`, und gespeicherte Werte samt Bezeichnern |

> **DIE GRENZE IST NICHT DIE SPRACHE, SONDERN DER LESER.** *`[Kriterion] …` im
> Containerprotokoll liest der Betreiber und kein Benutzer.*

### Punkt 30 · Form ist öffentlich, Existenz ist es nicht

**DIESER SATZ STEHT JETZT ZWEIMAL IM QUELLTEXT** — *im Browser und im Server*,
**und das ist der eigentliche Bauabschnitt.** *Ohne ihn nimmt die nächste Runde
die Gleichheit der Antwort für eine Umständlichkeit und baut sie weg.*

| | |
|---|---|
| **Was jetzt abgewiesen wird** | leerer Name, leere Adresse, Zeichenfolge ohne `@` — **an keinem davon ist eine Zeile der Datenbank beteiligt** |
| **Was unverändert gleich bleibt** | ob der Name frei war, ob er vergeben war, ob die Adresse schon an einem Zugang hängt, ob der Deckel erreicht ist, ob der Schalter aus ist |
| **Was sich am Bestand ändert** | **nichts.** `createRequest()` verwarf die leere Eingabe schon vorher still; **falsch war nur die Auskunft** |

> **DIE PRÜFUNG STEHT AN BEIDEN ENDEN.** *Eine Prüfung nur im Browser ist eine
> Bitte.* **Das Muster der Adresse steht dafür Zeichen für Zeichen zweimal da**
> — *in `mail.js` und in `public/app.js` —, und der Prüfstand hält beide Zeilen
> gegeneinander.*

### Punkt 28 · Die fünf deutschen Funde

| # | vorher | jetzt |
|---|---|---|
| **1** | `card.restartHint` zitierte „**Schlüssel** aus ENCRYPTION_KEY geladen" | **„Schluessel …"** — so, wie `keys.js` die Zeile wirklich schreibt. *Der Prüfstand hält jetzt beide Seiten gegeneinander* |
| **2** | `server.deniedOwnUser` schickte an eine Karte „Zugang" | **„Mein Konto"** — so heißt sie |
| **3** | `server.ruleKeep` nannte das Feld „Immer behalten" | **„Mindestens behalten"** — wie die Karte es beschriftet |
| **4** | `server.ruleDays` nannte es „Erst löschen ab" | **„Löschen ab Alter"** |
| **5** | `card.itemOne` = „Einzahl", ohne ihre Sache | **„Das Bewertete, Einzahl"** — wie die fünf anderen Paare |

> **BEI 3 UND 4 FOLGT DEUTSCH DER OBERFLÄCHE UND NICHT DEM WORTLAUT** — *dieselbe
> Entscheidung, die auf der englischen Seite in 0.31.2 schon gefallen ist.*

### Punkt 31 · Der `yedek`-Wächter, und die allgemeine Zeile dahinter

```js
// vorher:  /\byedek(ler|leri|le|tir)?\b/i
const YEDEK_STEM = /(?<![\p{L}])yede[kğ](?!leme)[\p{L}]*/iu;
```

| | |
|---|---|
| **Die Konsonantenerweichung** | `yedeğe`, `yedeği`, `yedeğin` — **der alte Wächter suchte ein `k` und fand das `ğ` nicht** |
| **Die Wortgrenze selbst** | für JavaScript sind `ş`, `ğ`, `ı`, `ç`, `ö`, `ü` **keine Wortzeichen**: hinter `yedeğ` steht eine Grenze, wo keine ist |
| **Und die allgemeine Zeile** | **kein Wächter über türkischen Text arbeitet mit `\b`** — und das ist selbst ein Wächter geworden: er liest die `/…/`-Literale von `testbench.js` und `counterproof.js` **über die Zerlegung aus `tools/segments.js`**, damit ein zitiertes Muster in einem Kommentar keinen Fehlalarm gibt |
| **Die eine Ausnahme** | `/\bŞey\b/` — *sie steht in der Zeile, die ZEIGT, dass die Wortgrenze versagt.* **Ein Gegenbeispiel ist kein Wächter** |

---

## Was die Runde an der Filterzeile tut

### „Filter folgt der Sortierung" wird herausgearbeitet

| | vorher | jetzt |
|---|---|---|
| **Das Wort neben den Statuspillen** | „folgt der Sortierung" | **„folgt der Sortierung: Ungetestet"** — es sagt jetzt auch, WAS abgeleitet wird |
| **Die harte Kante `STATUS_BY_HAND`** | **stand nirgends** | **„von Hand gewählt"**, mit einem Satz, der die Sitzung und den Weg zurück nennt |
| **Der eingeklappte Schalter** | sagte dasselbe wie die Pillenzeile | **sagt weiter dasselbe** — an beiden Orten, beide Lagen |

> **EIN UNSICHTBARER AUTOMATISMUS IST EIN FEHLER** *(Regel 4 aus 0.21.1)* —
> **und seine unsichtbare ABSCHALTUNG ist derselbe Fehler von der anderen
> Seite.** *Ein einziger Klick auf eine Statuspille schaltete die Ableitung für
> die GANZE Sitzung ab, zurück kam sie allein über „Filter zurücksetzen", und
> beides wusste niemand.*

**DIE HANDWAHL GILT WEITER FÜR DIE SITZUNG UND NICHT JE SORTIERUNG** *(Frage 1
des Fahrplans)*: **ein Merker statt eines je Sortierung.** *Was die Runde ändert,
ist nicht die Regel, sondern dass sie dasteht.*

### Zwei Befunde aus der Filterzeile

| | |
|---|---|
| **„+ Ansicht speichern"** | **ist `.link-btn` statt `.pill`** — *eine Pille neben Pillen liest sich als eine von ihnen.* **Das führende „+" bleibt**: es ist das einzige Zeichen, das ihn als Befehl und nicht als Auswahl ausweist |
| **Der „Mehr"-Aufklapper** | **wird breitenabhängig.** *Am Telefon bleibt er überall, am Rechner fällt er weg, wo der Text ohnehin in eine Zeile geht* |

**UND DIE ZAHL, AB DER ER SICH LOHNT, IST NACHGEMESSEN UND NICHT GESCHÄTZT** —
*am 14. September 2026 an allen acht Stellen im Browser:*

| | was der Aufklapper spart |
|---|---|
| **am Telefon** *(390 px)* | **67 bis 107 Bildpunkte an allen acht.** Er lohnt sich überall |
| **am Rechner** *(1280 px)* | **46 bis 87 an sieben** — und **26 an einer**, und 26 ist genau eine Zeile |

> **DER ERSTE ENTWURF DIESER RUNDE HAT ES MIT EINER ZEICHENZAHL VERSUCHT — und
> daran gelernt.** *Die acht Texte messen 140 bis 239 Zeichen, und die
> KÜRZESTEN sind nicht die, die sich am wenigsten lohnen:* **es kommt auf die
> Breite der KARTE an**, *und die schmale trägt denselben Satz in doppelt so
> vielen Zeilen.* **Eine Zeichenzahl hätte die falschen zwei erwischt.**
>
> **GEMESSEN WIRD DESHALB AM GEZEICHNETEN** *(`trimMore()`, nach dem Zeichnen)*
> — **dieselbe Bauform wie bei der Tagwolke**, *wo der Knopf „mehr" auch erst
> eingeblendet wird, wenn gemessen ist, dass es etwas aufzuklappen gibt.* **Die
> Schranke ist die Zeilenhöhe des Inhalts selbst und keine Zahl aus dem
> Quelltext.**

---

## Der Prüfstand — dreizehn Zusagen, jede mit ihrer Gegenprobe

| | Zusage | wo sie steht |
|---|---|---|
| **1** | Die Glocke rechnet EINMAL | Gruppe „Einen anderen markieren" |
| **2** | Die Markierung entsteht als Knoten und nie als String | Gruppe „Der Kommentartext" |
| **3** | Die Markierung gilt EINEM | Gruppe „Einen anderen markieren" |
| **4** | Der Grabsteinname geht auch hier nicht hinaus | dieselbe Gruppe, dazu die Oberfläche |
| **5** | Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge | Deckungsprobe, **1215** |
| **6** | Es sind fünfzehn Vokabelwörter — und die Migrationstafel von 0.24.3 hat weiterhin vierzehn Zeilen | elf Stellen |
| **7** | Kein Vokabelwort steht zusammengesetzt | **neu gebaut**, über alle drei Dateien |
| **8** | Kein fester deutscher Satz in den Serverdateien erreicht den Bildschirm | **die Restprobe, neu gebaut** |
| **9** | Die Zugangsanfrage weist eine leere Form ab — und sonst nichts | Gruppe „Die Selbstanmeldung" |
| **10** | Jede Änderung an den drei Sprachdateien steht in ihrer Tafel | Wortlautprobe · `EG_CHANGED_AFTER_0312` · `TR_CHANGED_AFTER_0313` |
| **11** | Kein Wächter über türkischen Text arbeitet mit `\b` | **neu gebaut**, über die Muster von `testbench.js` und `counterproof.js` |
| **12** | Die Verbotslisten der drei Sprachen bleiben leer | die drei Sprachgruppen |
| **13** | „Filter folgt der Sortierung" ist sichtbar, und `STATUS_BY_HAND` sagt, was es tut | Gruppe „Die Sortierung gibt den Status vor" |

**VIERZEHN GEGENPROBEN — 1010 bis 1023.** *Je eine für jede Zusage, und drei
dazu: die Migrationstafel von 0.24.3, die Schwester der Gegenprobe 787, die
Punkt 31 verlangt hat, und der zwölfte deutsche Satz.*

---

## Was die Runde gefunden hat

**ZWEI WÄCHTER, DIE DIESE RUNDE GEBAUT HAT, HABEN IM ERSTEN LAUF ETWAS
GEFUNDEN** — *und das ist der eigentliche Beleg dafür, dass sie greifen.*

| | |
|---|---|
| **Der zwölfte deutsche Satz** | **„Eigener Server"** in der Anbieterliste von `mail.js` — *er erschien in der Auswahl des Mailzugangs und in der Zeile der Karte „Mailversand", auf Englisch und Türkisch deutsch.* **Die Restprobe hat ihn gefunden; gebaut** |
| **Der `yedeği`-Wert** | `card.checkForeign` trug auf Türkisch „bu uygulamanın **yedeği** değil" — *die Konsonantenerweichung, die der Wächter von 0.25.1 dreißig Runden lang nicht sah.* **Der berichtigte Stamm hat ihn gefunden; gebaut** |
| **Die Startzeile des Sicherungsorts** | `[Kriterion] Sicherungsort: aus — server.backupDirNotSet` — *ein SCHLÜSSEL im Containerprotokoll statt eines Satzes.* **Nicht gebaut** — *es ist kein Bildschirmtext; steht als Punkt 33 im Sammelblatt* |
| **Die Startzeile des Sicherungsorts** | `[Kriterion] Sicherungsort: aus — server.backupDirNotSet` — *ein SCHLÜSSEL im Containerprotokoll statt eines Satzes.* **Nicht gebaut** — *es ist kein Bildschirmtext; steht als Punkt 33 im Sammelblatt* |
| **Der Grund eines gescheiterten Versands** | *steht in der Sprache des EMPFÄNGERS und wird vom ADMIN gelesen.* **Nicht gebaut** — *es ist kein fester Satz, sondern ein übersetzter in der Sprache des Falschen; Punkt 34* |
| **Gegenprobe 330 zerbricht `public/app.js`** | *sie meldet ABGERISSEN statt ROT, und zwar schon vor dieser Runde.* **Nicht gebaut** — *sie gehört dem Gegenprobentreiber; Punkt 35. Alle 1014 Rückbauten sind dafür einmal von Hand nachgerechnet: **sie ist die einzige*** |

---

## Der eine Schemaschritt

```sql
CREATE TABLE IF NOT EXISTS comment_mentions (
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  handle     TEXT NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);
```

| | |
|---|---|
| **Siebenundzwanzig Tabellen werden achtundzwanzig** | *umgedreht und nicht gelöscht — eine Tabelle, die still dazukommt, fällt sonst niemandem auf* |
| **Kein Migrationsblock** | `CREATE TABLE IF NOT EXISTS` **legt eine fehlende TABELLE bei jedem Start an**; *nur eine fehlende SPALTE an einer vorhandenen Tabelle bräuchte einen (Stolperstein 13)* |
| **Warum hier und nicht später** | *0.29.0 hat angekündigt, die letzte Runde am Schema zu sein — und **genau deshalb fällt er hierher**: der Bruch auf 0.33.0 steht unmittelbar dahinter, und danach kommt nichts mehr dazu* |
| **Das Austauschformat bleibt 16** | *eine Zugangsnummer bedeutet in einer fremden Instanz etwas anderes. Die Markierung reist als `@bert` im Kommentartext, und der Import löst sie dort neu auf (F13)* |

> **`handle` IST NICHT DIE WAHRHEIT, SONDERN DER ORT.** *Er sagt, WIE die
> Markierung im Rohtext geschrieben steht — nur damit findet die Zerlegung sie
> wieder.* **Was angezeigt wird, kommt immer aus der Nummer** *(Leitplanke L9)*.

---

## Was ausdrücklich NICHT gebaut wurde

- **Kein Schritt am Austauschformat** — *es bleibt 16 (F13, bestätigt).*
- **Keine zweite Glocke, keine zweite Zahl am Zeichen** — *unterscheiden heißt trennen, nicht verdoppeln.*
- **Keine Mail bei einer Markierung** — *der Betreiber hat die Glocke genannt.*
- **Keine Auswahl, die beim `@` aufgeht** — *freier Text, und der Tippfehler bleibt sichtbar Text.*
- **Die drei mitgelieferten Kriterien und `'Ohne Titel'`** — *sie bleiben (F11, F12): ein gespeicherter Wert gehört dem Bestand, und wer ihn umbenennt, benennt fremde Daten um.*
- **`VOCABULARY_FIELDS_0243` in `db.js`** — *bleibt bei vierzehn Zeilen; „Note" hatte nie einen deutschen Namen.*
- **Die Handwahl je Sortierung** — *ein Merker bleibt ein Merker; was die Runde ändert, ist nicht die Regel, sondern dass sie dasteht.*

---

## Und eine Entscheidung ist anders ausgefallen, als der Auftrag sie aufgeschrieben hat

**F2 SAGT „SPALTE".** *Gebaut ist eine **Verknüpfung**.*

> **DER KERN VON F2 STEHT UNVERÄNDERT:** *gespeichert wird die **Nummer** und
> nicht der Name — das ist die Entscheidung, und der Befund vom 14. September
> 2026 trägt sie.* **Was nicht trägt, ist die FORM:** *ein Kommentar markiert
> mehrere („@anna @bert schaut mal"), und eine Spalte trüge genau einen davon.*
> **Ein zweiter Name, der still verschwindet, wäre ein Fehler, den niemand
> sieht** — und genau die Sorte Fehler, gegen die F2 argumentiert.
>
> *Gebaut ist deshalb dieselbe Bauform wie `item_tags`: zwei Nummern, ein
> zusammengesetzter Schlüssel.* **Der Schemaschritt ist damit derselbe, den F2
> meint** — *eine Tabelle statt einer Ableitung —, nur in der Form, die die
> Sache verlangt. Der Fahrplan sagt es an seiner Stelle ebenfalls so: „wäre eine
> ABFRAGE und keine Tabelle".*

---

## Die sechs Gleichlautsummen — und warum sie sich diesmal alle bewegen

> **DORT WAR DIE UNVERÄNDERLICHKEIT DIE ZUSAGE, HIER IST ES DIE BUCHFÜHRUNG.**
> *0.31.2 und 0.31.3 haben versprochen, die jeweils anderen Sprachen nicht
> anzufassen, und die Summen belegten es. Diese Runde fasst alle drei an — also
> steht jede Änderung namentlich in ihrer Tafel, und was nicht darin steht, ist
> ein Fund (Leitplanke L3, Zusage 10).*

| | vor der Runde | danach |
|---|---|---|
| **de/one** | `0f38b9157739b492` | `1d5ff81dda51392a` |
| **de/other** | `bc6542b1f0e28bd6` | `642d3a9967e12f42` |
| **en/one** | `597dfc60b7a1fa63` | `66de41e32bb706d9` |
| **en/other** | `6558810bf793704a` | `55936a4de6cb5b6d` |
| **tr/one** | `a7f3cd4bf8992f90` | `d66b8778279f5ec1` |
| **tr/other** | `e26a1dca46c545da` | `245369c1748d81d4` |

**DIE SUMMEN BLEIBEN TROTZDEM STEHEN UND WERDEN NICHT ABGESCHAFFT.** *Sie sind
der zweite Blick auf dieselbe Frage:* **wer einen Wert ändert, ohne ihn in
seine Tafel zu schreiben, fällt an den Tafeln auf; wer QUELLTEXT ändert, der
Bildschirmtext erzeugt, fällt nur hier auf.**

### Die drei Tafeln

| | Einträge | was sie sagt |
|---|---|---|
| **Wortlautprobe gegen `0681d42`** | **dreizehn neu** *(`WORDING_CHANGED_0320`)*, **achtzehn neue Schlüssel**, **einer gefallen** | *was NICHT darin steht, ist Zeichen für Zeichen der Stand von damals — **929 Sätze*** |
| **`EG_CHANGED_AFTER_0312`** | **35** | *jeder englische Wert, der vom Stand von 0.31.2 abweicht, mit seiner Runde und seinem Grund* |
| **`TR_CHANGED_AFTER_0313`** | **48** | *dasselbe für Türkisch — **und der 48. ist ein Fund dieser Runde*** (`card.checkForeign`) |

---

## Die Zahlen

| | vorher | jetzt |
|---|---|---|
| **Schlüssel je Sprachdatei** | 1198 | **1215** *(+18, −1)* |
| **Flach gezählt (Namen und Zweige)** | 1280 | **1303** |
| **Mehrzahlformen** | 82 | **88** *(drei neue Paare — die Gründe der Aufräumvorschau)* |
| **Vokabelnamen** | 14 | **15** |
| **Tabellen der Datenbank** | 27 | **28** |
| **Austauschformat** | 16 | **16** |
| **Rückbauten** | 1000 | **1014** |

---

## Wo die Runde vom Auftrag abweicht — vollständig

| | |
|---|---|
| **F2 sagt „Spalte", gebaut ist eine Verknüpfung** | *begründet oben; der Kern — die NUMMER statt des Namens — steht unverändert* |
| **Punkt 28, Fund 5: die Beschriftung heißt nicht „Eintrag, Einzahl"** | *sondern **„Das Bewertete, Einzahl"**. Der Grund der alten Zusage gilt weiter: eine Vokabelbeschriftung nennt nie ihr eigenes Vorgabewort — „Bericht, Einzahl" neben „(Vorgabe: Bericht)" war genau der Fehler, den 0.31.1 abgeräumt hat* |
| **Die vier abgearbeiteten Punkte bleiben als Überschrift im Sammelblatt stehen** | *Regel 2 dort sagt „nicht einmal als erledigte Zeile"; 0.31.4 hat Punkt 32 trotzdem stehen lassen, und diese Runde folgt dem.* **Der Grund ist neu und gehört gesagt:** *der QUELLTEXT zitiert die Punkte unter ihrer Nummer („Punkt 29 des Sammelblatts"), an zehn Stellen. Eine Nummer, die ins Leere zeigt, ist schlimmer als eine durchgestrichene Zeile* |
