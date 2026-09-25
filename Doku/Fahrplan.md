# Fahrplan

**Der Plan von 0.41.0 bis 0.43.0 · Stand 25. September 2026, 0.41.1 gebaut, Auftrag 0.42.0 erteilt**

*Hier stand vorher „von 0.26.0 bis 1.0 · Stand 9. September 2026": beides ist
überholt — es wird kein 1.0.0 geben, und seither sind dreizehn Runden gebaut.*

**HIER STEHT, WAS EINE NUMMER HAT. SONST NIRGENDS.** *Was noch keine hat, steht
im Sammelblatt `Doku/Fehler_und_Ideen.md`; was gebaut ist, steht im Projektstand
und in seinem Änderungsprotokoll.*

---

## Zwei Papiere, und das ist ab jetzt die ganze Ablage

**Entschieden am 8. September 2026 vom Betreiber:** *„ab jetzt gibt es nur ein
Fehlersammelpapier und einen Fahrplan."*

| Papier | was darin steht |
|---|---|
| `Doku/Fehler_und_Ideen.md` | **was noch keine Nummer hat** — Befunde, Wünsche, Ideen, und was geprüft und abgelehnt ist |
| **`Doku/Fahrplan.md`** *(dieses)* | **was eine Nummer hat** — die geplanten Runden mit ihrem Inhalt |
| `Doku/Projektstand_…md` | **der Stand und die Geschichte** — was gebaut ist, was bindet, und warum der Plan achtmal gerückt ist. *Abschnitt 10 zeigt ab jetzt hierher* |

**Das ist keine dritte Sammelstelle, sondern eine Trennung:** *bisher stand der
Plan in Abschnitt 10 eines Papiers mit vierzehntausend Zeilen, in dem er
zwischen Stand und Geschichte lag. Wer den Plan lesen wollte, las zuerst die
Begründung von acht Rückungen.*

---

## Das Ziel dieser Strecke — in einem Absatz

**Es wird durchgearbeitet, nicht ausgebaut.** Vom Betreiber am 8. September
2026 so gesetzt: *„das Ziel ist, den vorhandenen und den sich jetzt ergebenden
durchzuarbeiten und Fehler zu beheben, dass wir fast bis Code-Effizienz durch
sind. Neue Features werden nur bedingt aufgenommen."*

**Was das für dieses Papier heißt:** jede Runde bis 0.33.0 räumt etwas weg, das
schon dasteht. **Vier neue Funktionen fahren mit**, und jede einzelne ist unten
begründet; alles andere Neue ist entweder abgelehnt oder mit seiner Bedingung
zurückgestellt.

---

## Der Bruch liegt auf 0.33.0 — und das ist der Grund

**Entschieden am 8. September 2026:** die Bereinigung *(bisher 0.28.0)* zieht
auf **0.30.0**. *„Damit der Bruch auch ein Bruch in der Zahl ist."*

> **UND AM 9. SEPTEMBER 2026 EIN ZWEITES MAL GERÜCKT — auf 0.31.0.** *Die
> Sprachrunde hat 0.25.0 bekommen, und alles dahinter ist eine Nummer weiter
> gewandert.* **Der Betreiber hat das ausdrücklich so entschieden**, mit der
> Alternative vor Augen, zwei Runden zusammenzulegen, um den Bruch auf 0.30.0
> zu halten: *die runde Zahl war eine Bequemlichkeit und keine Eigenschaft — die
> Reihenfolge ist die Aussage.* **Was bleibt, ist die Regel darunter:** der
> Bruch kommt NACH der letzten Runde, die das Schema anfassen darf, und vor
> allem, was auf einer festen Struktur aufbaut.

> **UND AM 10. SEPTEMBER 2026 EIN DRITTES MAL — auf 0.32.0.** *Die Sprachdurchsicht
> hat 0.31.0 bekommen.* **Der Betreiber im Wortlaut:** *„bruch ist leider
> zerbrochen"* — die runde Zahl war beim zweiten Rücken schon dahin, und sie
> ein drittes Mal zu schonen hieße, eine Runde an eine Nummer zu hängen statt
> an ihre Stelle in der Reihe. **Die Reihenfolge ist die Aussage, nicht die
> Zahl.**

> **UND EIN VIERTES MAL AM SELBEN TAG — auf 0.33.0, und diesmal auf Wunsch.**
> *Der Betreiber: „Bruch mal auf die 0.33.0 legen.. ist auch ne schöne Zahl 🙂
> wenn das klappt."* **Es klappt, und der Preis ist keiner:** zwischen der
> Sprachdurchsicht und dem Bruch entsteht dabei **0.32.0**, und die bleibt
> ausdrücklich **frei**. *Sie ist kein Versehen und keine Rückkehr zur alten
> Regel der freien Zwischenräume — sie ist EIN Platz an EINER Stelle, und zwar
> an der letzten, an der ein MINOR noch etwas ändern darf, bevor die Struktur
> feststeht.* **Damit ist die Zahl wieder rund und trägt zugleich eine
> Reserve.**

**Es ist eine Entscheidung über die LESBARKEIT der Nummer und nicht über den
Inhalt.** Die Bereinigung wirft zehn Migrationsblöcke weg, schreibt die
Datenbankstruktur fest und sagt zu alten Beständen ab — **ab ihr gibt es keinen
Rückweg.** Eine solche Runde auf einer runden Zehnerzahl ist im Nachhinein
wiederzufinden; auf der 28 ist sie es nicht.

**Zwei Runden rücken mit, weil sie hinter dem Bruch stehen MÜSSEN:** „Der
Prüfstand bekommt ein Verzeichnis" und „Code-Effizienz". *Beide teilen oder
verbessern Code — wer das vor der Bereinigung tut, teilt und verbessert Code,
den sie kurz darauf löscht.*

> **`0.40.0` STÜNDE BEREIT, FALLS ES ENG WIRD.** Der Betreiber hat sie
> ausdrücklich angeboten. **Gebraucht wird sie nach dieser Aufteilung nicht** —
> zwischen hier und dem Bruch liegen fünf Runden, und fünf Runden passen in
> 0.25 bis 0.29. *Sollte eine sechste nötig werden, ist die 0.40.0 der Ausweg
> und nicht das Zusammenquetschen von zweien.*
>
> **DIE SECHSTE IST AM 10. SEPTEMBER 2026 GEKOMMEN — und sie hat NICHT die
> 0.40.0 genommen.** *Die Sprachdurchsicht steht als 0.31.0 unmittelbar vor dem
> Bruch, weil sie inhaltlich dorthin gehört: sie ist die letzte Runde, die den
> Wortlaut der Oberfläche und den Satzbau in `public/app.js` frei umbauen darf.*
> **Eine Nummer weit hinten hätte sie hinter Runden gestellt, die selbst neue
> Sätze anlegen** — und jeder davon nach dem Muster, das diese Runde abschafft.
>
> **DIE RESERVIERUNG IST AM 21. SEPTEMBER 2026 AUFGEHOBEN.** *Die 0.40.0 trägt
> den Umbau von Export und Import, die 0.42.0 und die 0.43.0 den Document
> Server.* **Ein Ausweg wird nicht mehr gebraucht:** die Bereinigung ist am
> 14. September 2026 als 0.33.0 gebaut, und jede Runde davor hat ihre Nummer
> bekommen.

### Die Regel der freien Zwischenräume endet hier — und auch das hat einen Grund

**Seit dem 3. September 2026 blieb zwischen zwei geplanten Runden eine Nummer
frei**, damit ein Einschub aus dem Betrieb Platz findet, ohne den Rest zu
schieben. **Diese Aufteilung belegt 0.25, 0.27, 0.28 und 0.29 lückenlos** und
hebt die Regel damit auf.

**Weil sie sich überlebt hat, und das ist gemessen:** *die letzten vier
Einschübe aus dem Betrieb — 0.24.1, 0.24.2, 0.24.3 und 0.24.4 — haben alle vier
eine **PATCH**-Zahl genommen und keinen freien MINOR-Platz.* **Ein Befund aus
dem Rundlauf ist eine Reparatur, und eine Reparatur hängt an ihrer Runde.**
*Die freien MINOR-Plätze standen für einen Fall bereit, der viermal
hintereinander nicht eingetreten ist.*

> **UND EIN FÜNFTES MAL: 0.24.5.** Der Rundlauf mit 0.24.4 hat einen Befund
> gebracht — *die Sprachpille über den drei Verwaltungskarten zeigte nie die
> Sprache, auf die sie zeigt* —, und er hat wieder eine **PATCH**-Zahl genommen.
> **Er hätte in 0.26.0 gepasst und gehört trotzdem nicht dorthin:** er ist ein
> Fehler in dem, was 0.24.3 und 0.24.4 gebaut haben, und 0.26.0 ist die Runde
> der *kleinen* Fehler mit einer Messung davor. *Was gebaut wurde, steht im
> Änderungsprotokoll 0.24.5.*

---

## Was 0.24.5 an diesem Plan geändert hat — nichts

**Die sechs Befunde von 0.26.0 stehen unverändert.** *Keiner von ihnen ist in
0.24.5 mit weggefallen, und keiner ist dazugekommen:* die Runde hat den
Leseweg der drei Namenskarten repariert und sonst nichts angefasst.

**Was sie mitbringt, ist eine Auskunft und keine Aufgabe:** die Reparatur ist
dem Weg der Kachel „Vokabular" nachgebaut — *alles auf einmal holen, örtlich
umschalten*. **Wer in einer späteren Runde eine weitere Karte mit einem
Sprachumschalter baut, hat damit ein Muster und braucht kein neues.**

---

## Die Tafel

| Version | Name | Was | Schema | Format |
|---|---|---|---|---|
| ~~**0.24.6**~~ | ~~Der Rückfall sagt, welche Sprache er wirklich zeigt~~ | **GEBAUT am 9. September 2026** — Änderungsprotokoll 0.24.6 | nein | — |
| ~~**0.25.0**~~ | ~~Der Name weiß, in welcher Sprache er geschrieben ist~~ | **GEBAUT am 9. September 2026** — Änderungsprotokoll 0.25.0 | **ja** | 14 → 15 |
| ~~**0.25.1**~~ | ~~Jede Kachel zählt ihre eigene Arbeit~~ | **GEBAUT am 10. September 2026** — Änderungsprotokoll 0.25.1 | nein | — |
| ~~**0.26.0**~~ | ~~Die kleinen Fehler fallen — und das Potenzial wird abschaltbar~~ | **GEBAUT am 10. September 2026** — Änderungsprotokoll 0.26.0 | nein | — |
| ~~**0.27.0**~~ | ~~Die wählbare Bildablage~~ | **GEBAUT am 10. September 2026** — Änderungsprotokoll 0.27.0 | nein | — |
| ~~**0.28.0**~~ | ~~Das Telefon bekommt Recht~~ | **GEBAUT am 11. September 2026** — Änderungsprotokoll 0.28.0 | nein | — |
| ~~**0.28.1**~~ | ~~Was 0.28.0 nur halb erledigt hat~~ | **GEBAUT am 11. September 2026** — Änderungsprotokoll 0.28.1. *Acht Befunde vom laufenden Gerät; **keine Funktion**, der Fahrplan rückt nicht* | nein | — |
| ~~**0.29.0**~~ | ~~Worauf man sich verlassen können muss~~ | **GEBAUT am 11. September 2026** — Änderungsprotokoll 0.29.0. *Fünf geplante Punkte und **drei** Befunde aus dem Betrieb; der dritte („Titel" kennt nur A → Z) kam während der Fragerunde herein und fuhr mit, weil die Nummer ohnehin MINOR ist* | **ja** | 15 → 16 |
| ~~**0.30.0**~~ | ~~Der Prüfstand wird schnell, das Telefon wird ruhig~~ | **GEBAUT am 12. September 2026** — Änderungsprotokoll 0.30.0. *Fünf geplante Punkte, vier Befunde vom Telefon und zwei aus dem Nachmessen; **MINOR** allein wegen des Prüfschalters (F1/F2). Der Lauf fällt von 464,4 auf 271,5 Sekunden — 261,3 davon sind die Hebel, 18 kosten die zehn neuen Prüfgruppen der Runde selbst* | nein | — |
| ~~**0.30.1**~~ | ~~Was der Rundlauf mit 0.30.0 gefunden hat~~ | **GEBAUT am 12. September 2026** — Änderungsprotokoll 0.30.1. *Acht Befunde aus dem Rundlauf, sieben davon Oberfläche; **PATCH**, kein Schemaanteil. Die Fragetafel trug vierundzwanzig Fragen — drei davon Rückfragen an einen Satz, und eine Messung hat zwei Annahmen des Auftrags widerlegt* | nein | — |
| ~~**0.30.2**~~ | ~~Die Tagzeile bekommt ihre Breite zurück~~ | **GEBAUT am 12. September 2026** — Änderungsprotokoll 0.30.2. *Ein Befund aus dem Rundlauf mit 0.30.1; **PATCH**, kein Schemaanteil. Die dritte Rasterspalte nahm der Tagwolke bis zu 180 der 366 Pixel — auf Deutsch fiel die Tagzeile von 845 auf 321* | nein | — |
| ~~**0.30.3**~~ | ~~Die zugeklappte Tagzeile füllt, was sie ohnehin kostet~~ | **GEBAUT am 12. September 2026** — Änderungsprotokoll 0.30.3. *Ein Befund aus dem Rundlauf mit 0.30.2; **PATCH**, kein Schemaanteil. Die zugeklappte Zeile ließ fünfunddreißig Pixel leer, weil die Beschriftungsspalte ihre Höhe verlangt und die Wolke daneben nur eine Reihe zeigte — jetzt zwei, und bei wenigen Tags fällt die Anordnung ganz weg* | nein | — |
| ~~**0.31.0**~~ | ~~Die Sprachdateien werden gegengelesen — deutsch~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.0. *Elf Code-Lecks raus (aus allen drei Dateien: 1265 → 1254), neunundvierzig deutsche Texte geschärft, vierunddreißig Anführungszeichen berichtigt (deutsch und türkisch). **MINOR**, kein Schemaanteil. Die Vorlage kam von Google Gemini und ist Zeile für Zeile gegen den Quelltext geprüft worden; das Änderungsprotokoll trägt die Absichtszeilen für 0.31.2 und 0.31.3* | nein | — |
| ~~**0.31.1**~~ | ~~Deutsch sitzt~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.1. *Der Durchgang durch alle 1254 deutschen Schlüssel; **1254 → 1197** in allen drei Dateien: 101 Schlüssel sind gefallen (95 Hälften, die vier Exportgrößen, die zwei ohne Leser), 44 sind neu, 68 haben einen anderen Wortlaut. **PATCH**, kein Schemaanteil.* **Der Wortlaut ändert sich nicht — nur seine Ablage**, und die Gleichlautprobe (`tools/gleichlaut.js`) belegt es. *Zwei Befunde nebenbei: „und", „mehr" und „weniger" standen fest im Quelltext und erschienen in einer englischen Instanz auf Deutsch* | nein | — |
| ~~**0.31.2**~~ | ~~… englisch — „Englisch sitzt“~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.2. *Der Durchgang durch alle 1197 englischen Schlüssel, jeder gegen seinen deutschen Satz: **161** englische Werte sind neu formuliert, 635 Zeichen weniger; kein türkischer Wert ist angefasst und von den deutschen genau zwei — „Zugang anfragen" statt „Zugang beantragen", vom Betreiber während der Runde bestellt. **PATCH**, kein Schemaanteil.* **Die Gleichlautprobe rechnet beides nach** — *die beiden deutschen Prüfsummen dieser Runde stehen im Prüfstand, samt dem Beleg, dass sie ANDERE sind als die von 0.31.1, und samt den zwei bestellten Werten Zeichen für Zeichen.* *Die Verbotsliste der Vorlage ist ein Wächter im Prüfstand geworden (dreizehn Muster), dazu Länge, Satzzahl, Plätze, Entitäten und en-GB: zehn Zusagen, elf Gegenproben.* **Der englische Stand liegt als Vergleichsdatei daneben** *(`tools/englisch-0312.json`)* | nein | — |
| ~~**0.31.3**~~ | ~~… türkisch — „Türkisch sitzt“~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.3. *Der Durchgang durch alle 1197 türkischen Schlüssel, jeder gegen seinen deutschen Satz: **195** Schlüssel neu formuliert (205 Formen, davon 50 nur das Anführungszeichen), `tr.json` ist 1406 Zeichen kürzer und steht bei 90,8 % der deutschen Zeichenzahl. Kein deutscher und kein englischer Wert ist angefasst — vier Prüfsummen der Gleichlautprobe nachgerechnet. **PATCH**, kein Schemaanteil.* **Die Verbotsliste ist ein Wächter geworden, und er liest WORTSTÄMME** — *`\b` taugt für Türkisch nicht: `Ş`, `ş`, `ğ`, `ı`, `ç`, `ö`, `ü` sind für JavaScript keine Wortzeichen, und die Endung klebt an („haptan", „sabit resmi"). Elf Muster, vorher 26 Treffer in 23 Schlüsseln, jetzt keiner.* **ZWEI VORSCHLÄGE DER VORLAGE SIND ABGELEHNT, und beide Male steht eine Entscheidung des Betreibers dagegen:** *die fünf Vokabelmehrzahlen bekommen KEIN `-ler`/`-lar` — der Platz wird an **24 Stellen** hinter einer Zahl gelesen (18 im Quelltext, 6 in der Datei), und dort stünde danach „3 Öğeler" (TR-S4, 8.9.2026; Punkt 19: „abgelehnt, nicht vertagt") —, und „Yedekleme" bleibt „Yedekleme" (10.9.2026, Wächter seit 0.25.1).* *Dreizehn Zusagen, dreizehn Gegenproben (989–1001); der türkische Stand liegt als Vergleichsdatei daneben (`tools/tuerkisch-0313.json`)* | nein | — |
| ~~**0.31.4**~~ | ~~Nach einer Zahl die Einzahl, sonst die Mehrzahl~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.4. *Der Zielkonflikt aus Punkt 32, vom Betreiber am 13.9.2026 entschieden: „an den Stellen wo eine Zahl steht das Wort für Einzahl, für die anderen das Mehrzahlige".* **Eine Sprachdatei sagt seit dieser Runde selbst, welche Form hinter einer Zahl steht** — *der Kopfschlüssel `_afterNumber` neben `_locale` und `_name`; `Intl.PluralRules` kann es nicht wissen, weil sie nach dem WERT der Zahl wählt und das Türkische nach ihrer ANWESENHEIT.* `counted()` **an acht Zählerstellen**; *die fünf türkischen Vokabelmehrzahlen bekommen ihr `-ler`/`-lar` (Öğeler, Test günleri, Raporlar, Görevler, Değerlendirmeler), fünf Sätze bekommen ausdrücklich die Einzahl (nach `her` und vor `sayısı`), drei Krücken aus 0.31.3 fallen weg.* **Für Deutsch und Englisch ändert sich kein Wort** — *beide sagen `plural`, und `counted()` fällt dann Zeichen für Zeichen auf `plural()` zurück; am zweiten Gang der Gleichlautprobe nachgesehen.* **MINOR** *(1197 → 1198 Schlüssel)*. *Elf Zusagen, acht Gegenproben (1002–1009, dazu das umgedrehte 997); drei Wächter haben sich gedreht und keiner ist gelöscht.* **Der Augenschein hat dabei einen Befund gemacht, den kein Muster über eine Datei findet:** *die Vorschau der Karte „Vokabular" setzte die Mehrzahl selbst hinter eine Zahl („7 Öğeler") — ohne `plural()`, ohne `counted()`, als Zahl in einem String. Sie fragt jetzt die Stellungsregel der GEZEIGTEN Sprache, die der Server in seiner Sprachtafel mitschickt; auf Deutsch steht weiter „7 Einträge"* | nein | — |
| ~~**0.32.0**~~ | ~~Einen anderen markieren~~ | **GEBAUT am 14. September 2026** — Änderungsprotokoll 0.32.0. *Drei Stränge in einer Runde.* **`@name` markiert einen Zugang** *(bestellt 12.9.2026)* — *als **viertes Stück der Zerlegung** und nie als `replace()`; gespeichert wird die **Zugangsnummer** in der neuen Verknüpfung `comment_mentions`, weil ein gelöschter Name FREIGEGEBEN wird und sonst auf den Falschen zeigte (F2). **Der eine Schemaschritt der Runde — 27 Tabellen werden 28**, und er fällt hierher, weil der Bruch auf 0.33.0 unmittelbar dahintersteht.* **Die Glocke unterscheidet** *(13.9.2026)*: *eine Zahl, eine geteilte Tafel — **an mich gerichtet · meine {entryMany} · alles andere** —, und sie rechnet EINMAL: `marked` kommt als Teilmenge aus derselben Abfrage (F3, Leitplanke L1).* **„Note" wird das fünfzehnte Vokabelwort** *(`vocabulary.grade`, Karte `v15`; die Sortierbeschriftungen werden artikellos — „Zuletzt: {grade}", „Durchschnitt: {grade}" —, und die Migrationstafel von 0.24.3 bleibt bei vierzehn Zeilen).* **Und Strang 3 räumt vier Punkte des Sammelblatts ab** *(28, 29, 30, 31)*: *die elf deutschen Sätze aus `server.js` bekommen neun Schlüssel in drei Sprachen, die **Restprobe für die Serverdateien** ist gebaut — **und hat im ersten Lauf den ZWÖLFTEN gefunden** („Eigener Server") —, die Zugangsanfrage prüft die FORM an beiden Enden („Form ist öffentlich, Existenz ist es nicht"), und der `yedek`-Wächter kommt ohne `\b` aus — **auch er hat im ersten Lauf einen Wert gefunden, der dreißig Runden lang dastand**. **MINOR** *(1198 → 1215 Schlüssel)*. *Dreizehn Zusagen, **siebzehn Gegenproben (1010–1026)**; drei neue Wächter, und keiner ist gelöscht.* **Der Gegenprobenlauf hat selbst zwei Befunde gemacht:** *1023 blieb **STUMM** — die Restprobe liest den QUELLTEXT von `server.js`, und „Eigener Server" steht in `mail.js` und wird nur durchgereicht; der Prüfstand fragt seither den laufenden Server in drei Sprachen, an beiden Stellen, und 1026 ist die zweite davon. Und 1014 **riss den Lauf ab** statt rot zu werden: zwei Zeilen fassten das fehlende Vokabelfeld ohne `?.` an. Nach beiden Nachbesserungen: **0 STUMM, 0 ABGERISSEN** — und der Prüfstand **7043 von 7043**, Fingerprint `319d9c8a`* | **ja** *(Datenbank)* | — |
| ~~**0.32.1**~~ | ~~Die Endung, das Wort und die Zahl~~ | **GEBAUT am 14. September 2026** — Änderungsprotokoll 0.32.1. *Drei Befunde des Betreibers, und alle drei nehmen eine Bauweise ZURÜCK — die erste schrumpfende Runde seit 0.31.1 (1215 → 1209 Schlüssel, 1017 → 1008 Rückbauten).* **Türkisch braucht am bestimmten Objekt eine Endung** *(„Öğe sil" → „Öğeyi sil"), und sie hängt am Wort, das der Betreiber einträgt.* **Ausrechnen lässt sie sich nicht** — *nachgemessen an der verbreitetsten Bibliothek dafür (affixi): zehn von zwölf richtig, und die beiden falschen sind „Öğe" → „Öğeni" und „Değerlendirme" → „Değerlendirmeni". Sie hängt das `-n-` an jedes vokalendende Wort; nach einem Possessiv richtig, sonst falsch, und aus den Buchstaben ist das nicht zu sehen.* **Also wird umschifft: dreizehn türkische Sätze bauen den Satz so, dass die Endung auf ein FESTES Wort fällt** *(„{entryOne} kaydını sil") — die Krücke, die auch die Fachwelt kennt; i18next führt genau unseren Fall als Issue #1685 und hat ihn ungelöst geschlossen, und Mozilla Fluent löst ihn nur, indem ein Mensch jede Form einträgt.* **Zwei neue Wächter finden den nächsten Fall** *(keine Befehlsform und kein harmonierendes Anhängsel hinter einem Platzhalter).* **Die Zählzeile baut keinen Satz mehr** — *„12 · ⚑3 · ☐3 · ☑2" statt „12 Kommentare, davon …"; gemessen in echtem Chromium passte der Satz am Telefon in KEINER der drei Sprachen (DE −132 px), und jede Form mit Wort lässt sich durch ein längeres eigenes Vokabelwort wieder sprengen. Das Zeichen trägt den Sinn, die Farbe verstärkt ihn nur (G1); der volle Satz steht im `title`. `list.ofWhich` fällt — auf Türkisch war es „, bunun {parts} kadarı", eine Klammer um eine Aufzählung.* **Und „Filter folgt der Sortierung" ist ausgebaut** *(Entscheidung des Betreibers): „Filter zurücksetzen" holte die Vorgabe zurück, die Liste blieb gefiltert, und weil eine Vorgabe nicht mitzählt, verschwand der Rücksetzer gleich mit — eine Sackgasse. Fünf Sätze, `.pill-derived` und siebzehn Rückbauten fallen mit; die Prüfgruppe von 0.21.1 ist umgedreht.* **Dazu fünf Sätze, die ein Vokabelwort fest beim Namen nannten** *(darunter „Note" — ein Versäumnis von 0.32.0 selbst).* **MINOR.** *Zehn Zusagen, acht Gegenproben (1027–1034) — **0 STUMM**; drei neue Wächter. Prüfstand **7017 von 7017**, Fingerprint `24899ab8`* | nein | — |
| ~~**0.33.0**~~ | ~~Bereinigung — der Bruch~~ | **GEBAUT am 14. September 2026** — Änderungsprotokoll 0.33.0. *Und der erste Befund der Runde war der Zähler selbst:* **es waren ACHTZEHN Blöcke und nicht zwölf.** *Die sechs der Sprachrunde 0.24.x trugen ihre Absage im BLOCKKOMMENTAR statt auf einer eigenen Kommentarzeile — das Muster fand sie nicht, und dieses Papier hat die falsche Zahl von ihm übernommen (Stolperstein 156, diesmal am Zähler selbst).* **Alle achtzehn sind gefallen** *(Entscheidung des Betreibers, 14.9.2026: „alles was für die Migration von den Zwischenschritten notwendig war, kann weg")* — **945 Zeilen aus `db.js`** *(die Datei geht von 2145 auf 1474)*, samt zehn Namen im `module.exports`; **die Grenze `db.exec(SCHEMA)` ist nicht verschoben, sie ist fort.** *An ihre Stelle tritt eine Probe auf den Bestand: sie fragt `sqlite_master` und keinen Merker, nennt jede fehlende Spalte samt ihrer Fassung und dem Weg herauf —* **und sie SPERRT NIEMANDEN AUS** *(der erste Entwurf war eine harte Absage; der Betreiber hat sie gekippt: „Es wird nie eine Datenbank, Sicherung oder Exportdatei vor 0.33.0 eingespielt werden")*. **Der umgedrehte Prüfstand hat drei Abbruchstellen gefunden, die der Auftrag nicht kannte** — *die beiden Indizes auf `photos`, der Rückfall und die mitgelieferten Kriterien stürben ohne Klammer an einer fehlenden Spalte, und zwar an einem `db.prepare`, das schon beim VORBEREITEN scheitert: die gekippte Absage als Absturz.* **Dazu der Stempel** *(zwei Zeilen in `settings`; ein gewachsener Bestand bekommt „angelegt mit" NICHT nachgetragen)*, **das Austauschformat 16 → 17** *(die Programmfassung kommt neben die Formatnummer)* **und die eine Abweisung der Runde: eine Datei mit Nummer ≤ 13 kommt nicht mehr herein** *(sie liegt an der DATEI und nicht am START)*. **Die JPEG-Hälfte des Bestandslaufs ist mitgefallen**, und **das Containerprotokoll spricht englisch** *(58 Ansagen in sechs Dateien, samt Restprobe)*. **MINOR** *(1209 → 1208 Schlüssel, 1008 → 990 Rückbauten, Prüfstand 7017 → 6858)*. *Fünfzehn Zusagen, achtzehn Gegenproben (1035–1052); sechsunddreißig alte sind gelöscht und nicht umgedreht — umdrehen ließe sich nur ein Gegenstand, den es gibt.* **Der Gegenprobenlauf hat selbst zwei Befunde gemacht, und beide sitzen an der PRÜFUNG:** *1042 blieb **STUMM** — `assignInventory()` kehrt vor seiner Schleife um, wenn es keinen Eigentümer gibt, und die Prüflage hatte keinen; sie stellt jetzt einen gewachsenen Bestand nach. Und die erste Fassung der umgedrehten Prüfgruppe **RISS den Lauf AB** statt rot zu werden, wenn ein Start nicht hochkam (derselbe Fehler wie an 1014 in 0.32.0). Nach beiden Nachbesserungen: **0 STUMM, 0 ABGERISSEN**. Fingerprint `9083d8c7`* | **ja** *(Datenbank)* | — |
| ~~**0.33.2**~~ | ~~Elf deutsche Sätze und ein roher Schlüssel~~ | **GEBAUT am 15. September 2026** — Änderungsprotokoll 0.33.2. *Der zweite Befund aus dem Betrieb, am selben Tag gemeldet:* **„Backup location: off -- server.backupDirNotSet"** — *ein interner Schlüssel statt eines Satzes.* **Drei Stellen geben Deutsch oder einen Schlüssel aus, und alle drei sind derselbe Fall wie der Anbietername in 0.33.1:** *der Rahmen der Zeile ist englisch, der eingesetzte Wert nicht. Die Sicherungszeile übersetzt ihren Grund jetzt und gibt die Werte mit; die sechs Sätze der PUBLIC_ADDRESS-Probe und die fünf Gründe an `languageSkip` sind englisch.* **UND SIE WAREN KEIN VERSEHEN VON 0.33.0:** *sie standen namentlich in `SERVER_REST_NAMED`, der Liste des erlaubten deutschen Rests, mit der Begründung „sie landen auf dem Bildschirm des Wirts". Seit 0.33.0 spricht dieser Bildschirm englisch — dieselbe Begründung verlangt seither das Gegenteil, und die Ausnahme ist stehengeblieben,* **weil eine benannte Ausnahme aussieht wie eine entschiedene.** *Die Zusage „Der Start sagt es im Protokoll" fragte nach dem rohen Schlüssel und ist umgedreht (Stolperstein 201); drei neue stehen daneben, darunter eine auf die mitgereisten Werte. Die Prüflage dafür läuft auf der Portbasis 4360, die der Server davor freigibt — eine eigene Basis wäre die falsche Antwort, und 0.33.1 ist genau daran einmal hängengeblieben.* **PATCH** *(Prüfstand 6862 → 6865, Rückbauten 994 → 998).* *Vier Gegenproben (1057–1060), **0 STUMM**. Fingerprint `d6dbb696`* | nein | — |
| ~~**0.33.1**~~ | ~~Der Anbietername im Containerprotokoll~~ | **GEBAUT am 15. September 2026** — Änderungsprotokoll 0.33.1. *Ein Befund aus dem Betrieb, gemeldet vom Betreiber aus dem Protokoll der eingespielten 0.33.0:* **„Mail delivery: Eigener Server via smtp.strato.de:587" — deutsch in einer englischen Zeile.** *`mail.js` führt zu jedem Anbieter einen Namen und, wo es einen gibt, einen Schlüssel; die Karte setzt den Schlüssel seit 0.32.0 in der Sprache des Lesers ein, die Protokollzeile nahm den Rohwert.* **Der eigentliche Fund ist aber, warum keine Prüfung ihn gesehen hat:** *die Restprobe 5d liest den QUELLTEXT der Konsolenrufe, und dort stand an jener Stelle eine Einsetzung. Das Deutsche kam erst zur Laufzeit herein — ein Wächter, der Text liest, sieht durch eine Einsetzung nicht hindurch.* **Die Zusage ist umgedreht und nicht gelöscht** *(Stolperstein 201); sie startet einen echten Server und liest, was er wirklich schreibt.* **Dazu `mail.js` in den Sprachwächter** *(13 → 14 Dateien; die Datei trägt 181 deutsche Kommentarzeilen und stand außerhalb jeder Sprachprüfung — beim Aufnehmen sauber, null Treffer)* **und `npm audit fix`** *(zwei mittelschwere Schwachstellen in `qs` über `express`, jetzt null)*. **PATCH** *(Prüfstand 6858 → 6862, Rückbauten 990 → 994).* *Vier Gegenproben (1053–1056), **0 STUMM** — zwei griffen beim ersten Lauf ins Leere, weil der Treiber eine Kopie aus `git archive HEAD` patcht und nicht den Arbeitsstand. Fingerprint `38949534`* | nein | — |
| ~~**0.34.4**~~ | ~~Zwei Funde aus der Messung~~ | **GEBAUT am 16. September 2026** — Änderungsprotokoll 0.34.4. *Zwei Sicherheitsbefunde aus der Messung zur 0.35.0, je wenige Zeilen, vorgezogen vor die Runde (F13).* **Beide sind beim Lesen gefunden worden und nicht, weil etwas rot war** — *der Prüfstand fuhr grün, während beide Lücken offen standen.* **Ein Einladungs- oder Zurücksetzungslink ließ sich zweimal gleichzeitig einlösen** *(`auth.js`, `redeemToken`): zwischen der Frage in `checkToken` und dem Schreiben liegt `await hashPassword`, und scrypt gibt den Event Loop frei — zwei Anfragen im selben Augenblick sahen beide einen freien Link, und am Ende stand das Passwort der zweiten da.* **Der `UPDATE` trägt jetzt `AND used_at IS NULL`**, *`changes` sagt, wer zuerst da war, der Verlierer bekommt `server.linkExpired` — ein vorhandener Schlüssel, keine neue Meldung; die Zeile steht in der Transaktion, die teure Rechnung außerhalb.* **Der Treiber las bis dahin nur die Meldung eines Moduls und nicht seinen Rückgabewert** *(`testbench.js`, `runModule`): stirbt ein Modul zwischen dem Schreiben seiner Zahlen und dem Beenden, liegt eine vollständige grüne Meldung da —* **ein solcher Lauf zählte als bestanden.** **Zehn neue Prüfungen, beide Behebungen gegengeprüft:** *ohne die erste 20 von 22, ohne die zweite 2 von 6 — und der alte Treiber meldet für einen Lauf, dessen Modul mit Rückgabewert 9 gestorben ist, „5 von 5 Prüfungen bestanden — alles in Ordnung".* **Der zweite Beleg braucht eine Probe im Rahmen** *(`TESTBENCH_DIE_AFTER_REPORT` in `test/frame.js`, hinter der Meldung und vor dem Aufräumen); die Gruppe fährt darauf einen Teillauf des Treibers, gefiltert auf eine Gruppe, die nur `test/source.js` trägt — 4,1 s und keine Portnummer.* **Die drei übrigen Sicherheitsbefunde bleiben bei 0.36.0** *— sie sind größer als wenige Zeilen.* **Zwei neue Rückbauten gefahren — 0 stumm**, *jede rot in genau der Gruppe, die ihr Eintrag nennt.* **Mitgefallen: eine Meldung, die den Gegenprobenbericht verfälscht hat** — *die Prüfung nannte die Zeile des Teillaufs im Wortlaut, und `readRun` liest genau dieses Muster als Gesamtzahl des Laufs; der erste Bericht sagte für 1062 „5 von 5 bestanden" statt 6898 von 6903.* **PATCH** *(Prüfstand 6893 → 6903, Gruppen 349 → 350, Rückbauten 998 → 1000). Fingerprint `1f76adac` (davor `ecbbd5fc`)* | nein | — |
| ~~**0.34.3**~~ | ~~Kein Stolpersteinverweis mehr~~ | **GEBAUT am 16. September 2026** — Änderungsprotokoll 0.34.3. *Frage des Betreibers, ob die Runde vollständig sei — und sie war es nicht:* **die Entscheidung „alle weg" war zur Hälfte umgesetzt.** *0.34.1 hat 694 von 1.061 Verweisen weggenommen, nämlich die, die in einem ohnehin gekürzten Kommentar standen;* **367 blieben stehen, und drei Papiere sagten trotzdem „alle".** *Aufgefallen ist es nicht durch eine Prüfung — dasselbe Muster wie bei den Kommentarzahlen vor 0.34.1: eine Zusage ohne Zähler ist von ihrer Erosion nicht zu unterscheiden.* **Jetzt 0**, *346 als Klammer mitten im Satz, 21 als tragender Satzteil von Hand umgeschrieben, 20 allein stehengebliebene Punkte hochgezogen.* **Eine Prüfung hält die Null fest** *(eigene Gruppe, `node testbench.js Stolperstein`, 0,2 s), samt Gegenprobe am Wächter selbst und der einen benannten Ausnahme: `counterproof.js` nennt eine Nummer in seiner Meldung an den Wirt — ein Text und kein Kommentar, und ihn zu ändern hieße, Code zu ändern.* **Die drei falschen Sätze sind berichtigt** *und nennen die Zahl, die 0.34.1 wirklich erreicht hat.* *Mitgefallen: die Metapher `JEDE MESSUNG LÄUFT ÜBER EIN EIGENES AUFFANGNETZ`. Rückbau 368 aus 0.34.2 nachträglich gegengeprüft —* **0 stumm**. **PATCH** *(Prüfstand 6888 → 6893, Gruppen 348 → 349, Rückbauten 998 → 998). Fingerprint `ecbbd5fc` (davor `5ade984f`)* | nein | — |
| ~~**0.34.2**~~ | ~~Die Anleitung bekommt ein eigenes Papier~~ | **GEBAUT am 16. September 2026** — Änderungsprotokoll 0.34.2. *Befund des Betreibers unmittelbar nach 0.34.1:* **58 % der README waren Bedienung** — 1.450 von 2.501 Zeilen, gerichtet an einen Leser, der die Installation schon läuft hat, während die README auf GitHub die Landeseite für den ist, der sie aufsetzen will. **Die Bedienung steht jetzt in `manual-de.md`** *(1.438 Zeilen)*, **die README trägt den Betrieb und die Innenansicht** *(2.501 → 1.091)*. Die Linie ist: **was außerhalb des Browsers passiert, bleibt in der README**, dazu Datenmodell, Dateisicherheit, Kurzvideos und Speicherbedarf, weil sie zum Code gehören. **Kein Satz ist umgeschrieben worden** — dieselben Zeilen an einem anderen Ort; vier Querverweise laufen über die Naht und sind Verweise geblieben, keine zweite Erklärung. **Drei Unterabschnitte hochgestuft** *(Reverse Proxy, Beide Wege zugleich, Gescheiterte Anmeldungen aussperren — sie standen unter „Anmeldung" und betreffen den Server)*. **Ein Wächter hält den Schnitt:** *kein Abschnitt steht in beiden Dateien, jede nennt die andere beim Namen, und beide Listen stehen namentlich da — sechs Bedienabschnitte, zehn Betriebsabschnitte. Das ist die Antwort auf Stolperstein 47, und zwar als Prüfung statt als Vorsatz.* **PATCH** *(Prüfstand 6881 → 6888, Gruppen 347 → 348, Rückbauten 998 → 998 — 368 ist nachgezogen, weil sein Suchtext mit der Bedienung ins Handbuch gewandert ist). Fingerprint `5ade984f` (davor `3cc525dc`)* | nein | — |
| ~~**0.34.1**~~ | ~~Die Kommentare werden knapp~~ | **GEBAUT am 16. September 2026** — Änderungsprotokoll 0.34.1. **14.170 von 73.827 Zeilen sind Kommentar (19,2 %)** — vorher 38.366 von 97.861 (39,2 %). *Die Zielformel des Auftrags war falsch: 0,20 × Gesamtzeilen landet bei 25 %. Gerechnet wird mit* **0,25 × Codezeilen**. *Die Zählart ist dabei festgelegt worden: eine Zeile zählt als Kommentarzeile, sobald sie irgendeinen Kommentarteil trägt.* **Keine Datei liegt über 30 %**, die höchste ist `server.js` mit 26 %; die 30-%-Ausnahme für `images.js` und `batchrun.js` ist nicht gebraucht worden (22 % und 17 %). **Anwendungscode ist nicht angefasst** — die Codeteile jeder geänderten Datei stehen vorher und nachher Byte für Byte gleich. **Drei neue Wächter:** der Namenswächter sieht jetzt den Prüfstand *(21 Dateien neben den 13 ausgelieferten; 131 deutsche Bezeichner waren darin, 13 sind übrig, und die 13 sind Gegenstände von Prüfungen)*, die Ersatztexte der Rückbauten stehen unter einem Wächter, und jede Datei trägt ihre Kommentarzahl samt den beiden bindenden Grenzen. *Fünf Rückbauten hingen an einem gekürzten Kommentar und sind nachgezogen, nicht gelöscht; fünf Gegenproben am fertigen Stand gefahren,* **0 stumm**. **CHANGELOG.md 2.303 → 1.668, README.md 3.244 → 2.500** *(Entscheidung des Betreibers: das Handbuch bleibt, gekürzt wird die Begründung im Satz)*. **PATCH** *(Prüfstand 6865 → 6881, Gruppen 345 → 347, Rückbauten 998 → 998; drei Prüfungsnamen nennen eine Zahl, die über Kommentare geht, und sind mitgezogen — benannte Ausnahme zu Zusage 2). Fingerprint `3cc525dc` (davor `af69ce33`)* | nein | — |
| ~~**0.34.0**~~ | ~~Der Prüfstand bekommt ein Verzeichnis~~ | **GEBAUT am 15. September 2026** — Änderungsprotokoll 0.34.0. Aus `testbench.js` mit 56.787 Zeilen sind 17 Module unter `test/` geworden, dazu zwei Rahmen (`test/frame.js`, `test/dom.js`); `testbench.js` ist der Treiber mit 446 Zeilen und startet je Modul einen Prozess. **Der Speicher des Treibers fällt von 2842 MB auf 85 MB**, der größte einzelne Prozess liegt bei 1024 MB. Der Notnagel im Workflow ist gestrichen: ein voller Lauf mit der Heap-Grenze des Standardläufers (2081 MB) ist grün durchgelaufen. **Der Teillauf startet nur die Module, die er zeigt** — 14 s statt 350 s über ein Modul. Keine Zusicherung ist gefallen: **6865 vorher, 6865 nachher**, Prüfung für Prüfung dieselben, kein Prüfungs- und kein Gruppenname geändert. Der Rundlauf bleibt ein Modul mit 176 Gruppen — seine Gruppen bauen auf einem Bestand auf, ein Schnitt mittendrin wäre ein Neubau (Befund, Abschnitt 4 des Protokolls). Fünfzehn Gegenproben gefahren, **0 stumm**. Fingerprint `af69ce33` (davor `d6dbb696`) — er ändert sich allein durch die Versionsnummer in `package.json`, kein Byte Anwendungscode ist angefasst | nein | — |
| ~~**0.35.0**~~ | ~~Code-Effizienz~~ | **GEBAUT am 17. September 2026** — Änderungsprotokoll 0.35.0. *Auftrag vom 16. September 2026: 101 Befunde von 17 Lesern, 75 halten der Widerlegung stand, 5 davon sind Sicherheitsbefunde und gehen nach 0.36.0 — für die Runde blieben 70 Befunde an 65 Stellen.* **40 Stellen sind gebaut, 24 stehen mit ihrem Grund im Protokoll, eine ist zum Teil gebaut** *(tot 21 von 24, umständlich 8 von 15, langsam 7 von 21, besser 4 von 5)*. **Kein Verhalten ändert sich** — *das ist Zusage 1 und der Grund, warum 24 Stellen nicht gebaut sind; die eine Ausnahme ist die Behebung eines Fehlers.* **Tot: 17 Stellen** *(`GET /api/health`, sieben Exportnamen in `auth.js`, sieben in `attachments.js`, je drei in `mail.js` und `keys.js`, `PNG_MAGIC_HEX`, `ownerId`, tote Zweige in `server.js`, `OLD_SECTIONS` und `state.criteria` in `public/app.js`, `.backup-old` im Stilblatt)* — **und die Sprachdateien tragen keinen toten Schlüssel**, *das war ein Befund und ist jetzt eine Prüfung über alle 1.211.* **Umständlich: 8 von 15** *(`importInto` 373 Zeilen und Tiefe 14 → 228 und 9; `GET /api/backup` Tiefe 18 → 9; `PUT /api/settings` liest aus einer Tafel; `entryAsBundle` übersetzt keine SQL-Texte mehr je Eintrag; `openModal` trägt vier Dialoge, `pillRow` fünf Pillenreihen)*. **Langsam: die Auslieferung geht gezippt hinaus** — *`zlib` gehört zu Node, gezippt wird einmal beim Start, die Fassungen stehen im Arbeitsspeicher und nicht als Datei in `public/`;* **1.001.488 Bytes je vollem Aufruf sind 268.441 geworden.** **Und die Kommentare des Stilblatts sind gekürzt** — *300.472 → 195.090 Bytes, Kommentaranteil 70,5 → 54,5 %,* **keine Regelzeile ist gefallen** *(1.639 vorher wie nachher).* **Besser: vier Stellen, ein Knopf und ein Fehler** — *ein gefangener Fehler ohne Schlüssel geht ins Protokoll, eine ungeeignete Datei beim Hochladen lässt nichts zurück, die Zahl der Suchplätze steht an einer Stelle, zwei deutsche Sätze kommen aus der Sprachdatei — und `GET /api/items/:id/export` hat endlich ein Bedienelement.* **Und ein Befund der Messung war kein toter Code, sondern ein Fehler:** *der Filter des Sicherheitsprotokolls greift seit 0.13.0 nicht — der Server liest `req.query.group`, der Browser schickte `?gruppe=`; im Prüfstand fiel es nicht auf, weil der Mock denselben deutschen Namen las.* **Gebaut ist die Angleichung und der Wächter, der ihn gefunden hätte** *(jeder Abfrageparameter des Browsers hat einen Leser in `server.js`), dazu die erste Prüfung des Filters am echten Server.* **Der Prüfstand wartet auf die Bedingung statt auf eine Dauer** *(`until` in `test/dom.js`, `nextSecond` in `test/frame.js`; 11 von 625 festen Wartezeiten in `test/` sind umgestellt, 614 bleiben als Befund — 59.635 ms werden 47.520).* **Nicht gebaut und begründet:** *vier Schemabefunde (Abschnitt 9 des Auftrags), drei Stellen „langsam im Speicher" (Export, Import, `intoTrash` — alle drei änderten die Antwort oder verlangten einen Umbau von `entryAsBundle`), sieben Stellen, die eine größere Antwort des Servers verlangen, drei „tote", die eine Schemaänderung oder eine neue Formatnummer brauchen, vier im Browser sichtbare, und `server.js:2897`, wo eine bestehende Prüfung ausdrücklich das Gegenteil festhält.* **32 neue Rückbauten gefahren — 0 stumm.** **Der Prüfstand läuft danach 299,4 statt 299,8 Sekunden — Median aus je fünf Läufen, und das ist Rauschen:** *die elf umgestellten Wartezeiten sparen gerechnet 6,3 s, die 80 Serverstarts des Laufs zahlen gemessen 3,3 s für die Kompression beim Start, die im Betrieb nur einmal anfällt.* **MINOR** *(Prüfstand 6903 → 6969, Gruppen 350 → 360, Rückbauten 1000 → 1032). Fingerprint `5297965e` (davor `1f76adac`)* | nein | — |
| ~~**0.35.1**~~ | ~~Drei Sicherheitsbefunde aus der Messung~~ | **GEBAUT am 17. September 2026** — Änderungsprotokoll 0.35.1. *Die drei Befunde der Messung zur 0.35.0, die dort nicht gebaut worden sind. Alle drei sind gebaut.* **1. `keys.js` liest die Schlüsseldatei nicht mehr ungeprüft.** *Gemessen: 64 Hex-Zeichen nimmt SQLCipher als Schlüssel, alles andere als Passwort — eine abgeschnittene Datei meldete deshalb `SQLITE_NOTADB file is not a database`, und wo keine Datenbank lag, legte sie eine neue unter einem Schlüssel an, der sich nicht wiederherstellen lässt.* **Vier Zeilen, dazu eine Gruppe mit vier Schadensformen.** **2. `PUT /api/settings` schreibt in einer Transaktion.** *Gemessen am Stand 0.35.0: 13 Absagen (11 mit 400, 2 mit 403), 14 Schreibstellen, keine Transaktion — elf Absagen standen hinter Schreibstellen. Die Absagen werfen jetzt `Message`, der Wurf nimmt zurück, die Antwort geht außerhalb hinaus. Die beiden Rechteabsagen bleiben draußen: sie stehen vor jeder Zeile Arbeit.* **3. Eine Papierkorbzeile lässt sich nicht zweimal gleichzeitig zurückholen.** *Die Nummer wird vor dem `await` in Anspruch genommen, der Verlierer bekommt 409 mit `server.trashRestoring`. Keine Spalte an `trash`: ab 0.33.0 wird nicht migriert; kein `DELETE` als Anspruch: `trash_bytes` hängt mit `ON DELETE CASCADE` daran.* **An `server.js` 75 neue und 54 entfernte Zeilen** *(ohne Leerraum gezählt; der volle Diff nennt 441 — die Differenz ist die Einrückung des Routenrumpfs).* **PATCH** *(Prüfstand 6969 → 7007, Gruppen 360 → 363, Rückbauten 1032 → 1036, Sprachschlüssel 1.211 → 1.212). Fingerprint `10017d45` (davor `5297965e`)* | nein | — |
| ~~**0.35.2**~~ | ~~Der Einzelexport geht raus~~ | **GEBAUT am 19. September 2026** — Änderungsprotokoll 0.35.2. *Geplant als Aufräumrunde, gebaut mit zehn Bauabschnitten.* **Der Einzelexport ist raus:** *Route, Knopf `#exp1`, Rufer, die Stilregel `.entry-out` und zwei Sprachschlüssel. Dazu der tote `itemId`-Zweig in `exchangeParts()` und `exchangeEnvelopeBytes()` — F2, Entscheidung des Betreibers: mitnehmen; gezählt sind **14** Einsetzungen und nicht 11.* **Zwei Meldungen aus dem Betrieb:** *mehr als 40 Fotos auf einmal kommen jetzt an (der Browser bündelt), und die Absagen der Hochladewege stehen übersetzt statt in den Worten von multer — **vier** neue Schlüssel und nicht einer, weil `server.fileCap` eine Obergrenze je Eintrag nennt, die es bei Fotos nicht gibt. Das Containerprotokoll trägt Zeitstempel: neues Modul `log.js`, 51 Zeilen in sechs Dateien, ISO 8601 mit Versatz aus `TZ`.* **Drei Wächter sehen jetzt, was sie meinen:** *„jede Route hat einen Rufer" (102 Routen, 0 ohne Rufer, **zwei** Ausnahmen statt drei), die Gestaltprobe liest `.id = '…'` als dritte Quelle (sechs deutsche `id` umbenannt), und der Nummernwächter liest `public/style.css` und die SQL-Kommentare des Schemas (15 Verweise gestrichen).* **Dazu:** *der letzte Verweis auf `Doku/` ist fort und ein Wächter hält es fest; Gegenprobe 330 macht rot statt abzureißen, und jeder Rückbau an einer `.js`-Datei muss eine übersetzbare Datei hinterlassen; der Versandgrund reist als Schlüssel (Punkt 34).* **BA 6 (Punkt 33) entfiel:** *nachgemessen ist er seit 0.33.2 gebaut, der Eintrag im Sammelblatt war veraltet.* **`F_ROUTES` bleibt bei 73** — *die Route ist lesend und stand dort nie.* **PATCH** *(Prüfstand 7013 → 7040, Gruppen 364 → 368, Rückbauten 1038 → 1053, Sprachschlüssel 1.212 → 1.214). Fingerprint `0fc33e91` (davor `10017d45`), jetzt über 19 Dateien* | nein | — |
| ~~**0.36.0**~~ | ~~Sicherheit~~ | **GEBAUT am 19. September 2026** — Änderungsprotokoll 0.36.0. *Drei der fünf Lücken der Durchsicht vom 15. September 2026; eine war beim Schreiben des Auftrags von selbst weggefallen, eine gehörte nicht mehr hierher.* **Kein fremdes Formular kommt mehr an eine schreibende Route:** *ein Wächter vor allen Routen verlangt an jeder schreibenden Anfrage die Kopfzeile `x-csrf-token`; **acht offene Routen** stehen namentlich in `CSRF_FREE`, in beide Richtungen geschlossen. Der Token ist aus dem Sitzungstoken abgeleitet (`sha256('csrf:' + token)`) und braucht deshalb keine eigene Zeile; er reist als zweiter Cookie **ohne `HttpOnly`**, der Sitzungscookie bleibt `HttpOnly`. Verglichen wird die Kopfzeile mit dem abgeleiteten Wert und nicht mit dem Cookie daneben. **Ohne Sitzung entscheidet weiter die Anmeldung** — 401 und nicht 403.* **Die Anmeldesperre übersteht einen Neustart:** *neue Tabelle `login_attempts` statt einer `Map` im Arbeitsspeicher, 28 Tabellen werden 29. An der Kurve ändert sich nichts; der Aufräumer läuft beim Start und stündlich und lässt eine laufende Sperre stehen.* **Jede Einsetzung in `innerHTML` geht geführt hinein:** *gemessen sind **172** Zuweisungen in `public/app.js` — 57 ohne Einsetzung, 62 vollständig geführt, **53 mit zusammen 104 ungeführten**. Die 199 der Durchsicht und die 59 des Auftrags gelten beide nicht mehr: diese Messung liest verschachtelte Vorlagen und Fallunterscheidungen mit.* **Nicht eine der 104 trug Benutzertext** — *es waren Nummern, formatierte Zeiten, Adressen und Sätze der eigenen Sprachdatei; Titel, Tags und Kommentare gingen schon vorher durch `esc()`.* **Gebaut sind 35-mal `Number()`, 25-mal `esc()`, 6-mal `tH()` statt `t()`, eine neue Funktion `entryNav()`, fünf umbenannte Träger — und ein Wächter mit einer benannten Ausnahmeliste von 27 Namen, unter denen die verbliebenen 48 Einsetzungen stehen**, in beide Richtungen geschlossen. **`npm audit` färbt den Lauf:** *der Schritt lief nur auf der Werkbank; die Gruppe ruft `npm audit --json`, wird rot bei jeder Meldung und wird ohne Netz übersprungen — und sagt es.* **`F_ROUTES` ist nach `test/frame.js` gezogen**, *weil sie jetzt zwei Wächter lesen: der über den Quelltext und der über die laufende Instanz, der **65 der 73 Routen einzeln anfragt**.* **Neun Rückbauten gefahren — 0 stumm**, *fünf ältere nachgezogen.* **MINOR** *(Prüfstand 7040 → 7064, Gruppen 368 → 372, Rückbauten 1053 → 1062, Sprachschlüssel 1214 → 1215). Fingerprint `88f9dcfb` (davor `0fc33e91`)* | nein | — |
| **0.37.0** | **Die Kommentare werden verdichtet** | **GEBAUT am 19. September 2026** auf 0.36.0. **Drei Griffe an denselben Dateien: jede Versionsnummer heraus, jeden Verweis auf ein Papier heraus, dann verdichten.** *Gemessen am gebauten Stand:* **6.387 Kommentarzeilen in den 24 ausgelieferten Dateien sind 5.259 geworden** — die vierzehn Module von 4.328 auf 3.933, `public/style.css` von 1.574 auf 1.187, die SQL-Kommentare im `SCHEMA`-String von `db.js` von 485 auf 139. **770 Versionsnummern als Herkunftsangabe sind fünf geworden**, und keine der fünf ist eine: zwei SVG-Pfaddaten, ein Datum und zwei Kommentare, die der Prüfstand im Wortlaut verlangt. **281 Papierverweise sind null geworden** — 187 über den Namen, 94 als Abkürzung. **Von 289 Blöcken über drei Zeilen bleiben elf, und alle elf tragen eine Tafel gemessener Werte.** **Gefallen ist ausschließlich Kommentar:** der Codetext ist in jeder ausgelieferten Datei Zeile für Zeile derselbe, die 1.638 Regelzeilen des Stilblatts ebenso. **Ein dritter Wächter ist dazugekommen** — „Kein Papierverweis geht mit hinaus“, über alle 24 ausgelieferten Dateien und fünfzehn Verweisformen, den rohen Text lesend, damit er die SQL-Kommentare sieht. **`tools/comments.js` zählt jetzt das Stilblatt mit.** Fingerprint `144a80c7`, davor `88f9dcfb`. Das Protokoll steht als `Doku/Aenderungsprotokoll_0.37.0.md` | **GEBAUT** | 19.09.2026 |
| ~~**0.38.5**~~ | ~~Zwei Befunde des Betriebs, eine Zusage, zwei Wörter~~ | **GEBAUT am 21. September 2026** auf 0.38.4 — Änderungsprotokoll 0.38.5. *Zehn Bauabschnitte, einer davon vor allen anderen:* **`main` war rot, und keine Änderung am Code hat sie rot gemacht** *— eine Prüflage setzte feste Zeitstempel und maß sie gegen ein mitlaufendes Fenster von dreißig Tagen; die acht Zeitstempel rechnen jetzt gegen die Uhr.* **Drei Annahmen des Auftrags haben der Messung nicht standgehalten, und alle drei waren zu klein:** *die Zusage „die Instanz startet trotzdem" war für* **sechzehn der achtzehn Spalten** *falsch und nicht für eine — 34 Gesuche wurden beim Laden vorbereitet und werden jetzt erst beim ersten Ruf; die beiden abgelegten Wörter standen an* **74 Stellen** *und nicht an achtzehn, weil der Wortfilter auch die Prosa der Papiere liest; und das* **Abzeichen für die Lizenz ist nicht gebaut** *— es gibt keine Lizenz im Repository.* **Der Aufräumer des Prüfstands nahm auf vier Spuren die Reste der anderen mit** *(neun von zwölf roten Spuren vorher, null von zwanzig nachher; `leftovers()` fragt jetzt nach `KRITERION_RUN`).* **Die Rechentabelle rollt auf dem Telefon nicht mehr waagerecht** *(378 → 328 Pixel bei 360 Bildpunkten)*, **die Zählzeile der Meldungstafel steht in Fassung B** *(227,6 → 158,1 Pixel auf Deutsch)*, **README und Handbuch haben ein Inhaltsverzeichnis.** **PATCH** *(1.115 → 1.127 Rückbauten, Prüfstand 7.227 → 7.247). Fingerprint `c4185d0a`* | nein | — |
| ~~**0.38.4**~~ | ~~Vier Befunde, drei Indexe, ein Verzeichnis~~ | **GEBAUT am 21. September 2026** auf 0.38.3 — Änderungsprotokoll 0.38.4. *Siebenundzwanzig Fragen vor der ersten Zeile entschieden; sechs Bauabschnitte, von denen zwei nichts bauen.* **Die drei mitgelieferten Kriterien entstehen im Server statt in `db.js`** *— in der Auslieferungssprache und mit `language` auf dieselbe Sprache; eine bestehende Installation bekommt nichts dazu.* **Ein Verweis auf einen gelöschten Kommentar wird ein Kasten ohne Klickziel** *statt einer rohen Adresse, die einen neuen Tab auf denselben Eintrag öffnete.* **Das Kommentarfeld nennt die Zwischenablage statt Strg+V.** **Drei Indexe kommen dazu:** *`idx_ratings_criterion` (1,4 statt 6,8 ms bei 12.000 Bewertungen), ein deckender Index für die Dateiliste (1,0 statt 226,0 ms) und `length(thumb)` in `idx_photos_tile` (0,7 statt 258,9 ms bei 200 Fotos in 111 MB).* **`F_READ_ROUTES` führt die 30 lesenden Routen** *je mit Pfad, Klemme und einem Satz; ein Wächter hält Liste und Server in beide Richtungen gegeneinander.* ***Und zwei Messungen ohne Bauteil:*** *die Zählzeile der Kachel trägt auf Deutsch 36 Zeichen und 227,6 von 340 Pixeln; der einzelne Stern bleibt draußen, weil 20 von 273 Texten anders aussähen.* | **ja** — drei Indexe | — |
| ~~**0.38.3**~~ | ~~Der Sprung zum Kommentar~~ | **GEBAUT am 20. September 2026** auf 0.38.2 — Änderungsprotokoll 0.38.3. *Befund des Betreibers: der Verweis auf einen Kommentar öffnete den richtigen Eintrag, die Seite stand danach aber am Ende der Liste.* **Die Anzeigereihenfolge ist nicht der Grund:** *die Adresse trägt die Nummer des Kommentars in der Datenbank, die Anzeige sortiert nach angepinnt, Aufgabe, Bericht, Notiz — nachgemessen trifft der Verweis auf Kommentar 1 ihn an Anzeigestelle 9 von 31.* **Der Sprung stand am Ende der ersten Zeichnung und hielt nicht:** *Verweiskästen und Vorschauen von Anhängen kommen danach an und verschieben die Zeile — gemessen 24 Pixel am Bildschirm, 72 am Telefon. Jetzt hält `commentHold()` sie 1600 Millisekunden an ihrem Platz; Rad, Berührung, Zeiger und Taste des Lesers beenden den Halt sofort.* **Ein Verweis in den Eintrag, der offen steht, zeichnet die Ansicht nicht mehr neu:** *der Klick entscheidet nach dem Eintrag statt nach der Adresse, die Seite gleitet zur Zeile, die Adresse zieht über `history.replaceState()` nach; `prefers-reduced-motion: reduce` schaltet das Gleiten ab.* **Dazu zwei Befunde am Nachladen der Verweise:** *ein laufender Ruf galt als Auskunft, weshalb dieselbe Adresse in Beschreibung und Kommentar nur an einer der beiden Stellen zum Kasten wurde; und ein gescheiterter Ruf zeichnete neu und fragte damit sofort wieder.* **Keine Schemaänderung, keine neue Route, kein neuer Schlüssel.** *Zwanzig Prüfungen, sieben Gegenproben (1162–1168), +1.193 Bytes gzip auf 271.199.* Das Protokoll steht als `Doku/Aenderungsprotokoll_0.38.3.md` | **GEBAUT** | 20.09.2026 |
| ~~**0.38.2**~~ | ~~Die Kopfzeile des Kommentars~~ | **GEBAUT am 20. September 2026** auf 0.38.1 — Änderungsprotokoll 0.38.2. *Zwei Wünsche an der Kopfzeile eines Kommentars, dazu zwei der drei Punkte, die 0.38.1 offen gelassen hat.* **Die Kommentarnummer steht ganz rechts, hinter Zitat, Stift und Löschkreuz:** *Discourse, phpBB und XenForo stellen die Beitragsnummer ebenso als letztes Element der Kopfzeile dar, GitHub und Stack Overflow zeigen gar keine und machen den Zeitstempel zum Permalink; in keinem der vier steht sie zwischen zwei Aktionsknöpfen. Das Löschkreuz liegt damit nicht mehr am Rand der Zeile.* **Der Zitatknopf trägt ein gezeichnetes Zeichen** — *`„` war das einzige Schriftzeichen zwischen zwei SVG; ein Rahmen wurde verworfen, weil `button { padding: 0 }` ihn ohne Innenabstand und Eckenradius nicht trägt und Stift und Kreuz dieselben dann auch brauchten.* **Ein Verweiskasten ohne Nummer springt jetzt auch dann, wenn er auf den Eintrag zeigt, in dem er steht** — *die Adresse stand schon am Ziel, der Browser meldete keinen Wechsel.* **Und der Trefferausschnitt zeigt den Suchbegriff, wenn er allein im Ziel eines Links steht** — *geschnitten wird dann der Rohtext samt seiner Marken; ohne Eingriff in den gemeinsamen Kern geht nur eines von beiden.* **Keine Schemaänderung, keine neue Route, kein neuer Schlüssel.** *Acht Prüfungen, fünf Gegenproben (1157–1161), +86 Bytes gzip auf 270.006.* Das Protokoll steht als `Doku/Aenderungsprotokoll_0.38.2.md` | **GEBAUT** | 20.09.2026 |
| ~~**0.38.1**~~ | ~~Sechs Befunde des Betriebs~~ | **GEBAUT am 20. September 2026** auf 0.38.0 — Änderungsprotokoll 0.38.1. *Der Betreiber hat 0.38.0 eingespielt und binnen einer Stunde sechs Stellen gemeldet.* **Die Zwischenablage über eine Adresse im Netz:** *ohne sicheren Kontext gibt der Browser `navigator.clipboard` nicht heraus; jetzt kopiert ein kurzlebiges Feld über `execCommand`, und die drei Meldungen nennen den Grund statt nur „von Hand kopieren".* **Der Leerraum am Rand einer Auswahl bleibt außerhalb der Marken** — *`**  Zeile  **` ist nach der Flankenregel kein Fettdruck; der Code-Abschnitt ist ausgenommen, weil er die Regel nicht kennt.* **Der Stift trägt die Akzentfarbe:** *6,22 : 1 statt 2,95 im dunklen Schema, eine Regel für alle vier Stifte. Rot war gewünscht und misst 4,76 — die Entscheidung fiel nach der Messung.* **Die Kommentarnummer steht rechts, aber außerhalb der Aktionsgruppe** — *in ihr verschwände sie beim Bearbeiten, und ab dem zehnten Kommentar wäre `#10` drei Zeichen in einer Gruppe, die nur zwei zulässt.* **Vor dem Löschkreuz steht eine Zeichenbreite Abstand, am Finger elf Pixel statt zwei.** **Der Verweis springt auch beim zweiten Klick:** *steht die Adresse schon am Ziel, meldet der Browser keinen Wechsel; der Sprung steht jetzt außerhalb des Zeichnens.* **Und jede Adresse dieser Instanz wird eine Marke** — *roh eingefügt wie mit Namen, mit Kommentarnummer wie ohne; ein selbst gesetzter Name gewinnt gegen den Titel, eine fremde Adresse bleibt, wie sie dasteht.* *Zwei Befunde nebenher: keine Prüfung hatte `GET /api/comment-refs` je gerufen, und ein gescheiterter Ruf machte jeden Verweis der Seite bis zum Neuladen zu einem einfachen Link.* **Keine Schemaänderung, keine neue Route, kein neuer Schlüssel.** *Sechs Gegenproben (1151–1156), +1.869 Bytes gzip auf 269.920.* Das Protokoll steht als `Doku/Aenderungsprotokoll_0.38.1.md` | **GEBAUT** | 20.09.2026 |
| ~~**0.38.0**~~ | ~~Auszeichnung in Kommentar und Beschreibung~~ | **GEBAUT am 19. September 2026** auf 0.37.0 — Änderungsprotokoll 0.38.0. *Der Auftrag lief durch: zwölf Bauabschnitte, einundzwanzig Fragen vorab entschieden, zwölf verworfene Wege.* **Es ist kein Editor geworden und keiner genommen:** *das Textfeld bleibt; gebaut sind ein Leser von 412 Zeilen, sein Knotenbau von 96, der Verweis von 65 und ein Menü von 262.* **Die Auszeichnung ist eine Teilmenge von CommonMark — acht Bauformen.** *Gemessen an den 356 Beispielen der Spezifikation zu ihren sechs Abschnitten: 159 werden gezeichnet wie dort, 132 bleiben gewöhnlicher Text, 65 tragen eine Bauform außerhalb der Teilmenge und stehen mit ihrem Grund namentlich in der Prüfung.* **Kursiv trägt den Unterstrich**, und `3*4 und 5*6` bleibt damit Text. **Keine Schemaänderung.** *`tools/markupscan.js` misst, welcher vorhandene Text anders aussähe — an den 1.273 deutschen Sätzen der Sprachdatei und den elf Kommentartexten des Prüfstands: null.* **Der Kern steht zweimal, im Browser und am Server, Zeichen für Zeichen gleich; ein Wächter hält sie gleich und eine gemeinsame Tafel prüft beide.** **Formatnummer 17 → 18, Untergrenze bleibt 14. Eine neue Route `GET /api/comment-refs`.** **Der Wächter über die Abfrageparameter steht danach schärfer da:** *Browseradresse und Anfrage sind getrennt; der Suchbegriff in der Adresse war bis hierher nur durch Zufall grün.* *Gemessen:* **1.585 ausgelieferte Zeilen neu, 24 entfernt; +14.315 Bytes gzip auf 268.051** — *geschätzt waren +22,3 KB.* **Eine zweite Durchsicht hat die Paarung des Lesers linear gemacht und ihr eine dritte Grenze gegeben:** *256 KB Marken brauchen 493 ms statt 26.237, und verschachtelte Auszeichnung endet nach hundert Ebenen statt mit einem `RangeError`.* **Die Doppelung in der README ist mit aufgelöst.** Das Protokoll steht als `Doku/Aenderungsprotokoll_0.38.0.md` | **GEBAUT** | 19.09.2026 |
| ~~**0.38.6**~~ | ~~**Die Lizenz**~~ | **GEBAUT am 21. September 2026** auf 0.38.5 — Änderungsprotokoll 0.38.6. *Befund aus BA 8 der 0.38.5: die README sollte ein Abzeichen für die Lizenz bekommen, und es gab keine Lizenz, auf die es hätte zeigen können.* **Vorgabe des Betreibers: offener Quelltext, ein Fork ohne Erlaubnis — also MIT.** *Gemessen vor dem Bau an den 157 Paketen unter `node_modules`: 124 MIT, 8 ISC, 6 Apache-2.0, 4 BSD-3-Clause, 3 MIT-0, 2 BSD-2-Clause und 2 LGPL-3.0-or-later. Die beiden LGPL sind die vorkompilierte libvips, die `sharp` mitbringt; sie greift erst bei der Weitergabe einer Binärdatei und steht MIT nicht entgegen.* **Gebaut: `LICENSE`, das Feld `license` in `package.json`, ein Abzeichen und ein Abschnitt in der README** — *im Handbuch als Verweis, weil keine Überschrift in beiden Dateien steht.* **Dazu der Abschnitt „Wie dieser Code entstanden ist"** *— das Werkzeug beim Namen und ein Zeitraum statt einer Versionsnummer, die für fast jeden Commit falsch wäre.* **PATCH** *(1.127 → 1.133 Rückbauten, Prüfstand 7.247 → 7.256). Neun neue Prüfungen, darunter eine, die keine Abhängigkeit unter GPL oder AGPL durchlässt. Fingerprint `236d515e`* | nein | — |
| ~~**0.39.0**~~ | ~~**Die Spaltenfolge: `data` ans Ende**~~ | **GEBAUT am 22. September 2026** auf 0.38.6 — Änderungsprotokoll 0.39.0. *Zugeordnet war für diese Nummer die Nebentabelle `photo_derivatives`; gebaut ist die Spaltenfolge.* **In `photos`, `comment_images` und `attachments` steht `data` jetzt am Ende der Zeile.** *SQLite liest eine Zeile von vorn; was hinter einem großen Blob steht, ist nur über dessen Overflow-Kette erreichbar, und die Kachel der Übersicht stand dahinter.* **Gemessen an einer verschlüsselten Prüflage von 500 Fotos und 126,0 MB Originalen: 0,91 ms je Kachel vorher, 0,01 ms nachher**, *bei dreißig Kacheln auf einmal 27,4 gegen 0,28 ms.* **Die Nebentabelle `photo_derivatives` ist ausdrücklich nicht gebaut** — *gemessen 0,009 ms je Kachel mit ihr gegen 0,011 ms mit der Spaltenfolge; **die Differenz beträgt 0,002 ms** und ist einen zweiten Schreibweg, einen zweiten Leseweg, einen Eingriff in Export, Import und Papierkorb und eine Neurechnung aller Ableitungen nicht wert.* **`tools/reorder.js` bringt eine bestehende Datenbank auf die neue Folge** — *ein Aufruf bei angehaltener Instanz, kein Migrationsblock; Indexe und Trigger werden wortgleich wieder angelegt, `VACUUM` gibt den Platz zurück. Gemessen 44,7 ms je MB, Datei 231,7 MB vor und nach dem Lauf.* **Am Code ändert sich keine Zeile.** **MINOR** *(1.133 → 1.137 Rückbauten, Prüfstand 7.256 → 7.276). Ein neues Modul `test/reorder.js` mit einer Gruppe und zwanzig Prüfungen. Fingerprint `2ba1c469`* | **ja** | 22.09.2026 |
| ~~**0.39.1**~~ | ~~**Was für vergangene Prozesse gebaut wurde, geht heraus**~~ | **GEBAUT am 22. September 2026** auf 0.39.0 — Änderungsprotokoll 0.39.1. *Vorgabe des Betreibers: 0.39.0 ist die einzige Fassung, die es öffentlich je geben wird; vor ihr liegt keine, aus der jemand einen Bestand, eine `.env` oder eine Exportdatei mitbrächte.* **Fünf Werkzeuge unter `tools/` sind fort, zusammen 921 Zeilen** — *`reorder.js` nach seinem einen Lauf, dazu `rename.js`, `rename-test.js`, `gestalt.js` und `scan-words.js`. Gemessen vor dem Bau: **null** der sieben Eigennamen steht noch als Bezeichner im Code, die 318 Vorkommen liegen in Kommentaren und Prüfnamen — der Umbenenner hat keinen Gegenstand mehr.* **Die vier deutschen Umgebungsnamen werden nicht mehr gelesen**, *und das ist die einzige Verhaltensänderung der Runde; sie steht im Kasten über dem Changelog-Eintrag.* **`LEGACY_TABLES`, drei `AUTH_*`-Warnungen und jede Versionsnummer aus der Anleitung sind gefallen** — *der Wächter über die Nummern hat sich dabei umgekehrt: er verlangte sechs, jetzt verbietet er jede.* **`lateStatement` und `REQUIRED_COLUMNS` bleiben ausdrücklich** — *der Rückbau hätte 30 Deklarationen und rund 60 Aufrufe in `server.js` gekostet und null Zeilen gebracht; nur der Text des Kastens ist umgeschrieben und verweist auf die Sicherung statt auf eine ältere Version.* **Zwei Fehler nebenbei behoben:** *`.env.example` nannte `./schluessel.sh` statt `keytool.sh`, und das Handbuch trug die Formatnummer 17, während der Server 18 trägt — ein neuer Wächter hält beide gegeneinander.* **PATCH** *(1.137 → 1.133 Rückbauten, Prüfstand 7.276 → 7.256, 1.575 Zeilen entfernt und 150 hinzugekommen). Fingerprint `9d48cbbc`* | nein | 22.09.2026 |
| ~~**0.40.0**~~ | ~~**Export, Import und Papierkorb ohne den Arbeitsspeicher**~~ | **GEBAUT am 22. September 2026** auf 0.39.1 — Änderungsprotokoll 0.40.0. **Der Export schreibt stückweise:** *Kopf, Bündel für Bündel, Schluss — und bei Rückstau wartet er auf `drain`.* **Die RSS-Spitze fällt von +1.125,8 MB auf +314,8 MB**, die Laufzeit von 16,02 s auf 3,95 s — gemessen an 40 Einträgen zu je 6,0 MB, Datei 320,0 MB. **Damit fällt die Absage vor dem Gesamtexport**; `EXCHANGE_MAX` bleibt als Latte je Teil im Teilexport. **Der Import liest die Datei eintragsweise von der Platte** — `diskStorage` in `DATA_DIR/import`, ein `finally` um alles, und der Serverstart leert den Ordner. `IMPORT_MAX` steigt von 900 MB auf 4 GB, und vor dem Hochladen wird der freie Platz geprüft. **Der Papierkorb kopiert die Bytes innerhalb von SQLite** — vier `INSERT … SELECT`, und `entryAsBundle` liest die Blobspalten dafür gar nicht erst. **Die Antwort trägt keine `Content-Length` mehr**, und ein Dialog sagt das vor Export und Import an; er stellt zugleich die drei Wege nebeneinander. Das Austauschformat bleibt **18**, der Inhalt der Datei ist Zeichen für Zeichen derselbe. Fingerprint `7681fc64` (davor `9d48cbbc`) | nein | nein |
| ~~**0.41.0**~~ | ~~**Backup, Videos in Kommentaren und der Prüfstand ohne feste Wartezeiten**~~ | **GEBAUT am 23. September 2026** auf 0.40.0 — Änderungsprotokoll 0.41.0. **Der Prüfstand wartet auf Bedingungen:** *von 619 festen Wartezeiten mit zusammen 47.745 ms am Ausgangsstand bleiben 30 mit 3.045 ms, jede mit einem Kommentar; ein Wächter hält die Zahl genau fest.* **Der volle Lauf fällt von 340,8 auf 288,8 Sekunden** *(Median aus je drei Läufen).* **Videos in Kommentaren** *in der neuen Tabelle `comment_videos`, mit Standbild aus dem Browser und Auslieferung in Ranges;* **ein Download je Foto und Video** *in der Bildansicht.* **Das Wort heißt Backup**, *und neue Installationen bekommen englische Bezeichnungen; eine bestehende behält ihre `docker-compose.yml` und ihren Ordner.* **Die Grenzen beim Hochladen sind einstellbar** *(Foto und Kommentarbild bis 50 MB, Video, Kommentarvideo und Anhang bis 100 MB);* **dazu eine feste Grenze je Eintrag von rund 345 MB.** *Dazu drei Fehler aus dem Betrieb — Hinweisfeld, Formatierleiste, das Cookie nach `BEHIND_PROXY` — und die Hinweise, was Export, Import und Backup enthalten.* **MINOR** *(1.135 → 1.149 Rückbauten, Prüfstand 7.291 → 7.410). Fingerprint `d5aaeb21` (davor `7681fc64`)* | **ja** | 18 → 19 |
| ~~**0.41.1**~~ | ~~**Texte und Kommentare**~~ | **GEBAUT am 25. September 2026** auf 0.41.0 — Änderungsprotokoll 0.41.1. *Kein Verhalten des Servers geändert.* **Die Texte der Oberfläche sind in drei Sprachen mit dem Betreiber abgestimmt:** *ein Satz steht in einem Schlüssel, betonte Wörter als `**Wort**`; 1.258 → 1.186 Schlüssel je Sprache.* **Die Rolle heißt „Eigentümer-Admin“**, *englische IT-Begriffe bleiben englisch.* **README und Handbuch nach Leser getrennt** *(1.318 → 457 und 1.622 → 620 Zeilen).* **Kommentare nach CLAUDE.md gekürzt:** *16.850 → 6.410 Zeilen in 37 Dateien (19,6 % → 8,6 %).* *Vier stumme Gegenproben haben eine Prüfung bekommen.* **PATCH** *(1.149 → 1.141 Rückbauten, Prüfstand 7.410 → 7.362). Fingerprint `dcbfdfb6` (davor `d5aaeb21`)* | nein | nein |
| **0.42.0** | **Dokumente über einen Document Server ansehen** | **GEPLANT am 21. September 2026, Auftrag erteilt am 25. September 2026** (`Doku/Auftrag_0.42.0.md`). Euro-Office oder OnlyOffice zeigt zehn Formate im Eintrag an: `docx`, `doc`, `odt`, `rtf`, `xlsx`, `xls`, `ods`, `pptx`, `ppt`, `odp`. Ohne Document Server bleibt alles, wie es ist. Adressen und Secret stehen in der `.env`, vier Variablen. Der Admin schaltet an und ab, je Benutzer gibt es keinen Schalter. Der Abruf durch den Document Server wird über das JWT im Header geprüft; das Secret ist Pflicht. Die Karte „Dokumente" prüft beide Richtungen der Verbindung. Die README sagt, dass eine angesehene Datei im Zwischenspeicher des Document Servers unverschlüsselt liegt | nein | — |
| **0.43.0** | **Dokumente über den Document Server bearbeiten** | **GEPLANT am 21. September 2026, setzt 0.42.0 voraus.** *Der Rückweg: der Document Server meldet die geänderte Fassung, Kriterion holt sie und schreibt sie nach `attachments.data`.* **Ohne Geheimnis kein Bearbeiten** — *der Rückweg ist ein Schreibweg ohne Cookie und hängt allein an der Unterschrift.* Ändern darf, wer auch löschen darf: Admin oder wer die Datei hochgeladen hat, `mayChange()` unverändert. **Zwei Fragen sind offen:** *ob der Rückweg dieselbe Zeile ersetzt oder eine zweite anlegt, und was geschieht, wenn die Datei zwischen Öffnen und Rückweg gelöscht wurde* | nein | — |
| ~~**1.0.0**~~ | ~~Die Zusage~~ | **GESTRICHEN am 15. September 2026** — Vorgabe des Betreibers: es wird kein 1.0.0 geben, was als 1.0 geplant war ist mit **0.33.0** erreicht. Die zwei offenen Punkte des Eintrags stehen in der Zeile darunter | — | — |
| ~~*ohne Nummer*~~ | ~~**Vorgabewerte und Tastaturbedienung beim Sortieren**~~ | **VORLÄUFIG GESTRICHEN am 21. September 2026:** der Inhalt ist nirgends beschrieben — weder hier noch im Sammelblatt noch im Projektstand steht, welche Vorgabewerte gemeint sind und was die Tastatur beim Sortieren tun soll. *Die Zeile kommt zurück, sobald der Betreiber sagt, was gemeint war.* | — | — |
| ~~*ohne Nummer*~~ | ~~**Die Doppelung in der README auflösen**~~ | **GEBAUT mit 0.38.0 am 19. September 2026.** *Befund aus BA 6 der 0.37.0: zwei Abschnitte der README trugen dieselben drei Sachverhalte — dass eine fehlende Spalte nicht nachgerüstet wird, dass der Kasten jede fehlende Spalte samt altem Namen nennt, und dass die Instanz startet, aber jede Seite scheitert, die eine der Spalten liest.* **Jetzt verweist jeder der beiden auf den anderen:** `README.md`:348 nach unten, `README.md`:464 nach oben. *0.38.5 hat die README danach noch einmal gegliedert.* | nein | — |
| *ohne Nummer* | **`public/style.css` noch einmal ansehen** | Vorgabe des Betreibers vom 17. September 2026 zu **Punkt 42** des Sammelblatts. **Der Kommentaranteil liegt bei 40 Prozent — 1.215 Zeilen von 3.029**, gemessen am gebauten Stand 0.38.3. *Hier stand vorher 54,5 %; das war ein Byteanteil am Stand nach 0.35.0, und 0.37.0 hat die Datei danach noch einmal gekürzt.* Die Datei gehört zu den achtzehn des Fingerprints, eine Runde daran ändert ihn | nein | — |
| ~~*ohne Nummer*~~ | ~~**Drei kleine Punkte, die 0.35.2 ausdrücklich nicht mitnimmt**~~ | **ALLE DREI SIND ZU, die letzten beiden am 21. September 2026.** *Sie standen in `Doku/Auftrag_0.35.2.md` als V3 bis V5.* **Punkt 33** — *am 19. September 2026 geschlossen: schon gebaut.* **Punkt 38** — *GEBAUT mit 0.38.5: die Zählzeile der Meldungstafel steht in Kurzform, deutsch 227,6 → 158,1 px bei 360 CSS-Pixeln.* **Punkt 27** — *GEBAUT mit 0.38.5: `leftovers()` fragt nach `KRITERION_RUN`, neun von zwölf roten Spuren vorher, null von zwanzig nachher.* | nein | — |
| ~~*ohne Nummer*~~ | ~~**`Auffangnetz` und `Grundausstattung` umbenennen**~~ | **Befund aus dem Bau der 0.37.0.** *`CLAUDE.md` führt beide Wörter unter „nicht verwenden".* **Sie stehen als Abschnittsüberschrift in `db.js` und in sieben Namen des Prüfstands.** *Sie in einer Runde zu ersetzen, die etwas anderes tut, hieße den Prüfstand umzubenennen — deshalb eine eigene Runde.* **0.38.0 fasst sie ausdrücklich nicht an** *(Entscheidung des Betreibers vom 19. September 2026)* — **GEBAUT mit 0.38.5.** *Hier stand „Dutzende"; gezählt sind es* **74 Stellen**: *fünf in ausgelieferten Dateien, sieben Namen (ein Gruppenname, vier Prüfungsnamen, ein Rückbauname, ein `expected`), 23 Kommentare im Quelltext und 51 in der Prosa der Papiere — der Wortfilter liest auch `Doku/*.md` und `CHANGELOG.md`.* | **gebaut** | — |
| *danach* | *Große Dateien bis 2 GB* | **ausdrücklich draußen** — siehe unten | ja | — |

---

## 0.24.6 — „Der Rückfall sagt, welche Sprache er wirklich zeigt"

**Ein Nachtrag zu 0.24.5, gemeldet am 9. September 2026 vom laufenden
Programm.** *Die Sprachpille tut, was sie soll — der Betreiber hat es
abgenommen. Der Vermerk darunter tut es nicht, sobald weder die gezeigte noch
die Vorgabesprache einen Eintrag hat.*

**Drei Teile, und sie hängen zusammen:**

| | was | Größe |
|---|---|---|
| **E1** | **Die Namenstafel folgt der Vorgabesprache, die Ablage nicht.** Stellt man die Vorgabe von `en` auf `tr`, trägt `tr` den Text der Grundzeile — den nie jemand auf Türkisch eingegeben hat — und `en` steht leer da, obwohl der Name dort steht. *Kein Fehler von 0.24.5, sondern die Bauform von 0.24.3: die Grundzeile trägt keinen Sprachvermerk. **Neu ist, dass man es sieht.*** | mittel |
| **E2** | **Der Vermerk nennt die Sprache, die er zeigen wollte, nicht die, die er zeigt.** Ist auch für die Vorgabesprache nichts eingetragen, steht der Name aus der Antwort in der **Lesersprache** da — und der Vermerk sagt trotzdem „Vorgabesprache" | klein |
| **E3** | **Die Tafeln werden nach einem Wechsel der Vorgabesprache nicht nachgezogen.** `sendLanguages()` zieht `LANGUAGES` nach, `NAMES_ALL` nicht — die Karte rechnet mit neuer Vorgabe auf alter Tafel. *Derselbe Fehlertyp wie D2 in 0.24.5, eine Stelle weiter* | klein |

**Der Auftrag stand als `Doku/Auftrag_0.24.6.md` *(weggefallen — es liegt immer nur einer im Repo)*, mit sechs Fragen am Kopf.**
**Alle sechs sind am 9. September 2026 vor der ersten Zeile beantwortet worden
— und alle nach dem Vorschlag.**

> ## GEBAUT AM 9. SEPTEMBER 2026
>
> **E2 und E3 sind behoben, E1 ist gekennzeichnet.**
>
> * **Die Rückfallkette hat vier Schritte** (F2): eingetragen → Vorgabesprache →
>   **erste Sprache des Vorrats, die wirklich einen Eintrag hat**, in
>   kanonischer Reihenfolge → und sonst, was hereinkam. *„Besser wäre Englisch,
>   da es ja existiert" — genau das.* **Der Vermerk nennt die Sprache, deren
>   Name wirklich dasteht**, und wo keine einzige etwas trägt, nennt er gar
>   keine.
> * **Die Namenstafeln ziehen nach** (F4): `PUT /api/settings` trägt sie, wenn
>   Vorgabe oder Vorrat sich ändern, `takeNames()` nimmt sie an. Kein zweiter
>   Abruf.
> * **E1 ist gekennzeichnet und nicht behoben** (F3): unter der Pillenreihe
>   steht ein gedämpfter Hinweis, sobald die Vorgabesprache gezeigt wird — was
>   dort steht, ist der Name der Grundzeile.
>
> **WAS DAMIT OFFEN BLEIBT UND EINE NUMMER BRAUCHT:** die Grundzeile trägt
> weiterhin keinen Sprachvermerk. **Der saubere Weg ist eine Spalte `language`
> an `product_categories` und `rating_criteria` samt Migrationsblock** — eine
> Datenbankstufe, und die letzte Runde, die das Schema anfassen darf, ist nach
> dieser Tafel **0.29.0**. *Bis dahin bleibt es bei der Kennzeichnung; sie sagt
> die Wahrheit, sie räumt sie nur nicht auf.*

> **WARUM EINE EIGENE NUMMER UND NICHT 0.26.0:** es ist eine Reparatur an dem,
> was 0.24.5 gebaut hat — **PATCH, gewöhnliches SemVer** —, und 0.26.0 hat eine
> Messung vor sich. *Dieselbe Überlegung wie bei 0.24.5 selbst.*

---

## 0.25.0 — „Der Name weiß, in welcher Sprache er geschrieben ist"

**Aus dem Rundlauf mit 0.24.6, gemeldet am 9. September 2026 vom laufenden
Programm** (`c4c07393`): *es funktioniert immer noch nicht richtig.* Der Grund
steht seit 0.24.3 in der Datenbank und ist in 0.24.6 ausdrücklich nur
beschriftet worden — **die Grundzeile trägt keinen Sprachvermerk** und zählt
immer derjenigen Sprache zu, die *gerade* Vorgabe ist.

**Der Betreiber hat die Struktur in drei Entwürfen als Flussdiagramm vorgelegt.**
Daraus wird gebaut:

| | was |
|---|---|
| **Die Kette** | Lesersprache → Vorgabesprache → **Erstellungssprache** → Platzhalter. **Am Server, für jeden Leser** — heute kennt nur die Adminkarte eine Kette, und sie hat zwei Schritte |
| **Die Datenbankstufe** | eine Spalte `language` an `product_categories` und `rating_criteria`. **Der Migrationsblock trägt NICHTS ein** und die Karte fragt einmal nach — so behauptet das System nie etwas Falsches |
| **Die Adminkarte** | Punkt und Zahl an den Sprachpillen, roter Rahmen bei lückiger Sprache, gedämpfte Zeilen am Rückfall, ein Zeichen zum Räumen — **und dasselbe am Vokabular** |
| **Keine Glocke** | sie zeigt nach ihrer eigenen Regel nur *fremde* Tätigkeit; wer die Vorgabesprache umschaltet, ist selbst der Handelnde. Die Karte „Sprachen" sagt es an Ort und Stelle |
| **Im Beipack** | `npm audit fix` *(nur das Lockfile)* und **Workflow Weg B** *(ein Lauf je Stand statt zwei)* |

**Der Auftrag stand als `Doku/Auftrag_0.25.0.md` *(weggefallen — es liegt immer nur einer im Repo)*, mit acht Fragen am Kopf** —
**alle vor der ersten Zeile beantwortet.** *Er trägt als erster den stehenden
Schlussabschnitt „Wie der nächste Auftrag auszusehen hat".*

> **WARUM MINOR UND WARUM SIE ALLES ANDERE SCHIEBT:** es ist eine
> **Datenbankstufe**, und die nimmt nach Regel 5.1 mindestens eine
> MINOR-Nummer. *Der Betreiber hat am 9. September 2026 entschieden, ihr 0.25.0
> zu geben und den Rest durchrutschen zu lassen* — mit der Alternative vor
> Augen, sie hinter die kleinen Fehler zu stellen. **Das Sprachproblem läuft im
> Feld, die kleinen Fehler nicht.**

> **DER PUNKT 21 DES SAMMELBLATTS IST DAMIT HIER.** *„Die Grundzeile trägt
> keinen Sprachvermerk"* — aufgenommen am 9. September 2026, am selben Tag mit
> einer Nummer versehen. **Er steht deshalb nicht mehr im Sammelblatt**
> (Regel 1 der beiden Papiere).

> ## GEBAUT AM 9. SEPTEMBER 2026
>
> **Alles fünf ist gebaut, und zwei Dinge kamen dazu.**
>
> * **Die Datenbankstufe:** `product_categories.language` und
>   `rating_criteria.language`, `NULL` erlaubt und bedeutend.
>   `migration0250Language()` ist der **zehnte** markierte Block; **er füllt
>   nichts** (F2), meldet sich einmal und ist beim zweiten Start still.
> * **Die Kette steht an genau einem Ort — am Server**, und sie gilt für
>   **jeden** Leser: eingetragen → Vorgabesprache → Erstellungssprache der Zeile
>   → Originaltext. *`nameFallbackChain()` in der Oberfläche ist damit
>   weggefallen; die Karte liest, was der Server ausgerechnet hat.*
>   **`F_ROUTES` steigt 71 → 72** (`PUT /api/names/language`), `baseLanguage()`
>   fällt weg.
> * **Die Karte sagt, wo Arbeit liegt:** Punkt und Zahl an jeder Sprachpille,
>   roter Rahmen an der lückigen Kachel, gedämpfter Name am Rückfall, ein
>   eigenes Zeichen zum Räumen (F5), ein Kasten mit **einem** Knopf für die
>   unbekannte Erstellungssprache — und dasselbe am Vokabular.
> * **Die Ansage steht in der Karte „Sprachen"** und nicht in der Glocke (F4).
> * **Der Beipack ist gefahren:** `npm audit fix` (nur die Lockfile bewegt sich,
>   `express` bleibt bei 4.22.2) und **Weg B** am Workflow.
>
> **UND ZWEI DINGE KAMEN DAZU, DIE IM AUFTRAG NICHT STANDEN:**
> **① Der Import ist ein Anlegeweg wie jeder andere** — ohne die
> Erstellungssprache in der Datei legte er Zeilen ohne Sprachvermerk an. **Das
> Austauschformat steigt deshalb 14 → 15** (`criteriaLanguages`,
> `categoryLanguages`). **② Die Löschung „ein Name, der dem der Grundzeile
> gleicht" ist weggefallen** — seit die Grundzeile eine eigene Sprache trägt,
> ist ein gleicher Name eine Übersetzung.
>
> **Was gebaut wurde, steht im Änderungsprotokoll 0.25.0.** *6312 Zusagen,
> 770 Rückbauten in der Liste; zwanzig neue Gegenproben und acht mitgegangene
> — **drei liefen STUMM und haben drei echte Lücken im Prüfstand aufgedeckt**,
> alle drei geschlossen (768 lief zweimal stumm und hat dabei einen vierten
> Fund gebracht); eine ist weggefallen (753).*
>
> **ZWEI PUNKTE SIND DABEI INS SAMMELBLATT GEGANGEN** *(22 und 23)*: die Kachel
> „Vokabular" trägt auf einer frischen Installation den Rahmen — *so ist es
> bestellt, und die Frage, ob „nicht eingetragen" dort „fehlt" heißen soll,
> gehört dem Betreiber* —, und die drei mitgelieferten Kriterien stehen auf
> Deutsch, während die Auslieferungssprache Englisch ist.

---

## 0.25.1 — „Jede Kachel zählt ihre eigene Arbeit"

**Drei Befunde vom Bildschirm, am Vormittag nach dem Einspielen von 0.25.0**
(`84933c06`, vom Betreiber aus der laufenden Installation bestätigt). *Keiner
davon ist im Quelltext gesucht worden; alle drei hat der Betreiber gesehen,
während er die neue Karte benutzte.*

| | was | Größe |
|---|---|---|
| **A** | **Die Zahl an der Sprachpille war eine Summe über zwei Kacheln.** Die Tafel `crits` trägt beide Kriterienkarten; die Liste filterte nach der Phase, die Zahl darüber nicht — über „Bewertung" und „Potenzial" stand dieselbe Zahl. *Über „Kategorien" stimmte sie nur durch Zufall: eine Tabelle, eine Kachel.* Der rote Rahmen hing an derselben Zahl | mittel |
| **B** | **Der Hinweis unter einem geliehenen Namen wurde abgeschnitten** — aber nur in den Kriterienkarten. Er saß in der Namensspalte, und die teilt sich die Zeile mit Ziehgriff, Gewichtsfeld, ✕, Zähler und zwei Knöpfen. *In der Kategorienkarte, die weder Griff noch Gewicht hat, stand derselbe Satz vollständig da* | klein |
| **C** | **„(nicht eingetragen — es steht Deutsch)" sagte nicht, WAS fehlt.** Jetzt: **„(kein Eintrag in Türkçe — gezeigt wird Deutsch)"** | klein |
| **D** | **„Backup" heißt auf Türkisch `yedekleme`, nicht `yedek`** — 45 Sätze. *Entscheidung des Betreibers, nachdem er zwei Quellen beigebracht hatte* | klein |

> **B WAR BEIM BAUEN BEKANNT UND IST ZUGEDECKT WORDEN.** Der Kommentar dazu
> stand seit 0.24.5 wörtlich im Quelltext, und die Antwort darauf war ein
> `title` am Vermerk. **Ein Zeiger ist keine Reparatur — und am Telefon gibt es
> keinen.**

**Kein Auftragspapier, keine Fragetafel:** drei Befunde aus dem laufenden
Gespräch, zwei Entscheidungen des Betreibers unterwegs *(der Wortlaut und das
türkische Wort)*. **PATCH — keine Spalte, kein Weg, keine Funktion;
`F_ROUTES` bleibt bei 72.**

**AM SELBEN TAG SIND ALLE DREI SPRACHDATEIEN GEGENGELESEN WORDEN** — vom
Betreiber durch ein zweites Modell gegeben. *Das Ergebnis steht als **Punkt 24**
im Sammelblatt und wird ausdrücklich NICHT in dieser Runde gebaut:* es zerfällt
in harte Fehler, Fragen an die Hausstimme und **zwei nachweislich falsche
Diagnosen**. **Der stärkste Fund daraus ist nicht aus der Liste, sondern aus
der Prüfung:** der türkische Verneinungssatz ist wirklich kaputt, weil Türkisch
mit einem Suffix verneint und der Satz im Quelltext um ein eigenes Wort herum
zersägt ist.
---

## 0.26.0 — „Die kleinen Fehler fallen" — und das Potenzial wird abschaltbar

**Sechs Befunde, fünf davon klein, einer mit einer Messung davor.** *Alle sind
gemeldet oder beim Durchsehen gefunden; keiner ist eine neue Funktion.*

| | was | Größe |
|---|---|---|
| **1** | **Nach dem ersten Bild geht die Dateiauswahl nicht mehr auf.** `uploadFiles()` überschreibt den Ablegekasten mit Text und wirft dabei das versteckte Dateifeld mit hinaus. Strg+V geht die ganze Zeit weiter, F5 heilt es — *deshalb ist es nie als Fehler gemeldet worden, sondern als Eigenart.* **Ursache ist eine Zeile** | **eine Zeile** |
| **2** | **Die Sitzungsliste läuft unten aus dem Kasten.** Bei zehn Sitzungen bricht der Satz mitten in der Zeile ab, und **der Knopf „Andere Sitzungen beenden" steht gar nicht mehr da** — erreichbar nur über einen Bildlauf, den von außen niemand als solchen erkennt | klein |
| **3** | **Drei kleine Anzeigefehler** aus dem Augenschein zu 0.22.0: der Eintragstitel wird auf dem Telefon abgeschnitten statt umgebrochen; ein Leerzeichen vor einer Klammer, das aus dem `gap` des Knopfes kommt und nicht aus dem Text; **und die Karte „Bewertung: Kriterien", die dem Benutzer das Gewicht erklärt, das er nicht stellen kann** *(Sprachregel S5 — die halbe Klemme steht seit je, die andere Hälfte fehlt; Einzelheiten im Auftrag 0.26.0)* | klein |
| **4** | **Eine tote Regel im Stilblatt.** `.calc-sum:first-of-type` *(bis 0.24.1 `.rz-summe`)* soll der ersten Summenzeile einen Strich geben, zählt aber DIV-Geschwister — und das erste `div` ist der Kopf. **Die Regel greift nie**; der Strich entsteht heute an anderer Stelle, und niemand hat es gemerkt | eine Zeile |
| **5** | **Der Hinweis an der Zeitleiste läuft am rechten Rand hinaus.** Er steht mittig über seinem Punkt und bricht nicht um. Trifft nur ein schmales Fenster mit Maus — auf dem Finger gibt es ihn gar nicht | eine Zeile |
| **6** | **`ß` und `ss` sind für die Suche zwei verschiedene Dinge.** „ÜBERGROSS" findet „übergroß" nicht. **Mit ausdrücklichem Preis:** in der Gegenrichtung findet „Masse" danach auch „Maße" | eine Zeile, **mit Preis** |

### Und einer, der GEMESSEN worden ist — und dabei verschwand

**Die Übersicht brauchte beim Betreten rund eine Sekunde**, die Einstellungen
mit **zwölf** Abrufen waren blitzschnell. **Die Asymmetrie war der ganze
Befund:** die Übersicht holt fünf Abrufe und dreizehn Kacheln.

> **GEMESSEN AM 10. SEPTEMBER 2026 — UND DER BEFUND IST DABEI WEGGEFALLEN.**
> *Der Betreiber hat drei Mitschnitte aus seinem Browser geliefert und dann
> festgestellt:* **„also auch auf dem mobil ist das gut."**
>
> **Und es ist nichts repariert worden, das es erklären würde.** *Der Vergleich
> mit dem Stand des gemeldeten Befundes (0.22.1, `bc175ce`, 156 Commits
> zurück) zeigt `loadAll()` **zeichengleich**, die Kachelzeile nur umbenannt
> und `max-age=86400` unverändert.*
>
> **ER WIRD BEOBACHTET UND NICHT GEBAUT** — dieselbe Form wie beim angepinnten
> Block. *Die ganze Messung steht im Änderungsprotokoll 0.26.0, Abschnitt BA 5:
> die fünf Abrufe kommen als **304**, parallel, **227 ms** — eine Rundreise;
> die Kacheln gehen auf dem Rückweg **gar nicht** über die Leitung. Wenn die
> Sekunde wiederkommt, fängt die Suche nicht bei null an.*
>
> *Der Auftrag zu 0.26.0 trug sie ebenfalls und ist mit dem Auftrag zu 0.27.0
> weggefallen — es liegt immer nur einer im Repo. **Deshalb zeigt dieser
> Verweis auf das Protokoll und nicht auf den Auftrag:** ein Protokoll bleibt.*
>
> **EINE ZEILE DAVON BLEIBT UND WIRD GEBAUT:** `renderList()` leert den
> Bildschirm, **bevor** es fragt. *Das ist unabhängig davon falsch, wie schnell
> die Antwort kommt.*

> **BEFUND 6 IST NICHT VORHER WEGGEFALLEN — und das ist entschieden worden.**
> 0.24.4 hat die Faltung der Suche angefasst (Befund B8 dort) und `ß`/`ss`
> **ausdrücklich ausgenommen**: es betrifft Deutsch und nicht Türkisch, und
> eine Runde, die schon zwei Fehler an derselben Funktion repariert, nimmt
> keinen dritten mit. *Der Befund bleibt hier — und er ist jetzt billiger:
> die Faltung steht seit 0.24.4 an EINER Stelle (`searchFold()` in `db.js`),
> und beide Hälften der Suche rufen sie.*


### Und eine Funktion dazu — der Potenzialmodus wird abschaltbar

> **GEWÜNSCHT VOM BETREIBER, 9. September 2026 — und er sagt dazu, dass er es
> schon beim Bau von 0.21.0 gemeint hat:** *„#Potenzial kriterien Modus durch
> Admin+Admin(Eigentümer) ein und ausschaltbar machen. Wenn ‚aus' ist, dann darf
> die Box im Eintragsdetails gar nicht zu sehen sein und auch das Sortierfilter
> dafür darf nicht zu sehen sein. Ebenso wenn Potenzial Bewertungen schon
> vorhanden sind dürfen die auch nicht im Overview angezeigt werden und muss
> ausgeblendet werden."*

**Ein Schalter, und er wirkt an fünf Stellen.** *Das ist der ganze Punkt: ein
abgeschalteter Modus, der an einer Stelle doch noch durchscheint, ist kein
abgeschalteter Modus.*

| wo | was verschwindet |
|---|---|
| **Eintrag** | der Sternkasten „Potenzial" — **gar nicht erst gezeichnet**, nicht nur eingeklappt |
| **Sortierung** | die Gruppe `potential_desc` / `potential_asc` im Auswahlfeld der Übersicht |
| **Filter** | die Zeile, die nach „noch nicht eingeschätzt" filtert |
| **Übersicht** | die Kopfzahl **◆** an einem ungetesteten Eintrag — *auch dann, wenn schon Potenzialbewertungen in der Datenbank stehen* |
| **Systembereich** | *offen:* ob die Karte „Potenzial: Kriterien" mitverschwindet oder als Einstellort stehen bleibt |

**Der Schalter gehört in die Datenbank** — dieselbe Ablage wie
`categoriesFreeCreate` und `tagsFreeCreate`, und aus demselben Grund
*(Projektstand, Abschnitt 11: eine Einstellung, die an allen Einträgen aller
Benutzer erscheint, gehört nicht in `user_settings`)*. **Stellen kann ihn der
EIGENTÜMER allein** — die Antwort des Betreibers auf F3 am 10. September 2026,
und sie fällt gegen den Vorschlag des Auftrags. *Ein Admin sieht den Schalter
und kommt nicht daran; die beiden Vorlagen taugen für die Ablage, nicht für die
Klemme.*

**Die vergebenen Sterne bleiben stehen.** *Ausschalten ist Verbergen und nicht
Löschen: wer ihn wieder einschaltet, findet seinen Bestand vor.* **Was der
Server mit `potentialRating` in seinen Antworten macht, ist die eine offene
Frage von Gewicht** — sie ganz wegzulassen wäre sauber und träfe den Export,
den Vergleich und die Einzelansicht mit.

> **WARUM SIE IN 0.26.0 STEHT UND NICHT IN 0.24.6.** *Es ist eine **Funktion**,
> und eine Funktion nimmt nach Regel 5.1 eine MINOR-Nummer; 0.24.6 ist eine
> Reparatur und muss eine PATCH bleiben.* **Der Betreiber hat beides angeboten**
> (*„das auch in 0.24.6 oder zusammen mit den anderen in 0.25.0"*) — **hier
> steht sie, weil die Nummer es verlangt**, und der Name der Runde ist dafür
> erweitert. *Wer sie doch vorziehen will, sagt es; dann rückt sie nach 0.27.0
> und die Reparatur bekommt 0.26.0.*

### Im Beipack — der Prüfstand hängt nur noch an `main`

**Entschieden vom Betreiber am 10. September 2026 und schon gefahren:**
`.github/workflows/pruefstand.yml` hängt an **einem** Ereignis, Push auf
`main`. **Weg B aus 0.25.0 ist damit zurückgenommen** — bei einem einzigen
Ereignis hat die Bedingung am Auftrag nichts mehr zu entscheiden, und sie ist
gefallen. **Der Preis ist genannt:** ein Zweig wird nicht mehr geprüft, bevor
er in `main` steht, und eine Anfrage aus einem fremden Abzug bekommt gar
keinen Lauf. *Die Einzelheiten und die drei mitgegangenen Zusagen stehen im
Auftrag.*

---

## ~~0.27.0 — „Die wählbare Bildablage"~~

> **GEBAUT AM 10. SEPTEMBER 2026.** *Die Einzelheiten stehen im
> Änderungsprotokoll 0.27.0; was hier steht, bleibt als HERLEITUNG stehen und
> nicht als offener Punkt.*
>
> **ZWEI DINGE SIND ANDERS GEKOMMEN, ALS ES HIER STAND, und beide sind
> gemessen:**
> * **`medium` wird NICHT verlustfrei** — die Messung, die der Fahrplan seit
>   dem 2. September verlangt, ist gefahren: `nearLossless` ist an einem Foto
>   **+500,8 %**. Die Frage ist damit beantwortet und fällt weg.
> * **Die Güte der Ableitungen ist neu gesetzt** — `thumb` 82, `medium` 78
>   (WebP-Güte, nicht JPEG-Güte). Die alten Zahlen zu übernehmen hätte `medium`
>   an einem Foto um 49,3 % größer gemacht.

**Unverändert gegenüber dem alten Plan.** Drei Verfahren zur Wahl statt eines
Schalters: **PNG** (keine Rechenzeit), **WebP verlustfrei**, **WebP
verlustbehaftet** für Fotos aus der Zwischenablage.

**Gemessen:** ein 5,21-MB-JPEG wird über „Grafik kopieren" zu 34,79 MB PNG und
liegt heute als 20,42 MB WebP — verlustbehaftet q90 wären es 6,64 MB, **67 %
weniger**. **Bei einem Bildschirmfoto wäre verlustbehaftet dagegen siebenmal
GRÖSSER** — deshalb eine Wahl und keine Regel.

**Die Ableitungen gehen im selben Durchgang auf WebP** — ein Lauf über den
Bestand statt zwei.

---

## ~~0.28.0 — „Das Telefon bekommt Recht"~~ — GEBAUT am 11. September 2026

> **DIESE AUSARBEITUNG BLEIBT ALS HERLEITUNG STEHEN.** *Was gebaut wurde, steht
> im Änderungsprotokoll 0.28.0; hier steht, wie die Runde gedacht war.*
>
> **DREI PUNKTE HABEN SICH BEIM BAUEN GEÄNDERT, und alle drei sind gemessen
> worden statt geglaubt:**
>
> * **Punkt 3 nennt die falsche Zeile.** *Nicht die Anmeldungszeile läuft aus
>   ihrer Karte — sie steht in einem Raster mit `minmax(0, 1fr)` und kann es
>   gar nicht.* **Es ist der Befehl in „Mein Zugang" und in „Kennzahlen":**
>   452 Pixel Inhalt in einem Kasten von 182, gemessen bei 1024 Pixeln
>   Fensterbreite am laufenden Server.
> * **Die Behälterabfrage wurde ausgeweitet** *(Betreiber, 11. September)*: nicht
>   eine Stelle, sondern der ganze Systembereich — nachgemessen sind das drei
>   Gruppen und nicht zehn.
> * **`Bild auf` und `Bild ab` sind gestrichen** *(Betreiber, 11. September)*:
>   „oh ja bei langen koimmentaren braucht man bild ab… das können wir nicht
>   nehmen." **In dieser Runde blättert gar keine Taste den Eintrag**; es bleiben
>   die zwei Pfeile in der Kopfzeile.

**Alles, was bei der Durchsicht für Telefon und Tablett gemessen und bewusst
stehen gelassen wurde — plus die zwei Dinge, die genau dort hingehören.**

| | was |
|---|---|
| **1** | **Eine gemeinsame Kopfzeile für die vier Unteransichten.** Eintrag, System, Offen und Vergleich tragen heute nur „← Zurück"; Suche, Menü und „+ Eintrag" gibt es dort nicht. **Am Telefon ist der Weg von einem Eintrag zur Suche zwei Griffe statt einem** |
| **2** | **Das Blättern im Eintrag** — vor und zurück in der Reihenfolge der Übersicht. *Siehe unten; es hängt an Punkt 1* |
| **3** | **Die Anmeldungszeile läuft bei rund 1024 Pixeln aus ihrer Karte.** Der saubere Weg ist eine **Behälterabfrage** (`@container`): die Karte weiß dann selbst, wie breit sie ist, statt das Fenster zu fragen. *Ein neues Werkzeug im Stilblatt — deshalb ein eigener Schritt und nicht nebenbei* |
| **4** | **Die Erklärung unter dem Ablegefeld redet auf dem Telefon von Dingen, die es dort nicht gibt** — „Klick aufs Foto", „mit Strg+V einfügen", „Blättern mit ← →". Fünf Zeilen, die Hälfte geht ins Leere. **Eine Frage an den Text, nicht an das Stilblatt:** eine Fassung für beide ist besser als zwei mit einer Weiche dazwischen |
| **5** | **Eine Meldung kann auf dem Telefon die Vergleichsleiste verdecken.** Beide sitzen unten. `body:has(…)` löst es |
| **6** | **Ein Startbildzeichen** *(PWA-Manifest)* — siehe unten |
| **7** | **Die Bedienelemente sind am Finger zu groß.** Eine Pillenreihe nimmt den halben Schirm, und die aufgeklappte Sortierung passt gar nicht darauf. *Befund aus dem Betrieb vom 11. September 2026 — siehe unten* |

### Das Blättern im Eintrag — die Form

**Der Wunsch stand seit dem 7. September 2026 und ist bewusst nicht
durchgewunken worden**, weil die Pfeiltasten in dieser Ansicht schon belegt
sind. **Der Betreiber hat die Tastenfrage am 8. September 2026 entschieden:**
*„die Idee mit den Pfeiltasten können wir wegnehmen, eventuell mit Bild ab und
auf"*, und dazu *„vielleicht feine Pfeile an der linken und rechten Seite, oben,
was kaum Platz nimmt."*

**So wird es gebaut:**

* **Zwei feine Pfeile in der neuen Kopfzeile**, links und rechts vom Titel. Am
  Anfang und am Ende der Liste sind sie **gedämpft und nicht anklickbar** — nie
  weg, denn ein Knopf, der verschwindet, verschiebt alles daneben.
* **`Bild auf` und `Bild ab` auf der Tastatur.** *Die Pfeiltasten bleiben, wo
  sie sind — sie blättern in den Bildern, und das ist die häufigere Bewegung.*
* **Am Telefon sind die Pfeile die ganze Antwort**, weil die Kopfzeile aus
  Punkt 1 ohnehin oben klebt. **Ausdrücklich KEINE Wischgeste:** in derselben
  Ansicht wischt schon die Bildreihe, und quer scrollende Kästen gibt es
  daneben auch. *Eine Geste, die mit zwei vorhandenen streitet, ist keine
  Bedienung, sondern ein Glücksspiel.*
* **Die Reihenfolge kommt aus der Übersicht** und ist die, die sie gerade
  zeigt — mit ihrem Filter und ihrer Sortierung. **Wer einen Eintrag direkt
  über seine Adresse aufruft, hat keine Reihenfolge:** dann sind die Pfeile
  gedämpft. *Das ist ehrlicher als eine erfundene Reihenfolge und kostet nichts.*

### Das Startbildzeichen — und warum es doch mitfährt

**Es stand in Teil III des Sammelblatts** *(„für eine Instanz im eigenen Netz
ohne Offline-Anspruch ist der Gewinn das Icon auf dem Startbildschirm und sonst
wenig")*. **Der Satz stimmt — und der Gewinn ist trotzdem genau der, den diese
Runde sucht.**

**Was gebaut wird:** eine `manifest.json` und die Zeile, die darauf zeigt.
**Was NICHT gebaut wird: kein Arbeiter im Hintergrund, keine Offline-Ablage,
kein Zwischenspeicher.** *Ein Zwischenspeicher, der eine alte Fassung
ausliefert, wäre in einer Instanz mit Fingerprint das Gegenteil von hilfreich.*

**Es fährt hier mit und bekommt keine eigene Zeile in der Tafel** — es ist eine
Datei und eine Zeile, und es gehört zu derselben Frage wie alles andere in
dieser Runde.

### Die Dichte am Finger — der Befund vom 11. September 2026

> **AUS DEM BETRIEB, mit drei Aufnahmen vom Telefon:** *„Auf mobil sind die
> Pillen so groß das ein ganzes Display ausfüllt. Genauso ist es im overview
> und wenn ich die sortiert filter aufmache ist die Schrift deutlich größer und
> die liste passt nicht mal in ein Display ohne scrollen. Ein etwas filigranere
> darstellung damit einfache schaltflächen nicht so viel platz wegnehmen und
> auch die liste."*
>
> **UND DIE EINORDNUNG GLEICH MIT DAZU:** *„am liebsten in ein bestehenden
> zusammen damit der rundenanzahl nicht so sehr wächst."* **Deshalb steht er
> hier und nicht in einer eigenen Runde** — er stellt dieselbe Frage wie die
> sechs Punkte darüber.

**NACHGEMESSEN AM 11. September 2026:**

| | am Zeiger | am Finger |
|---|---|---|
| **Pille** | `5px 12px` · **31 px hoch** | `10px 15px` · **41 px hoch** |
| **Auswahlfeld** | `6px 10px` · Schrift **12,45 px** | `9px 12px` · Schrift **16 px** |

**Die Pillen sind der kleinere Teil.** *Zehn Pillen sind auf einem Telefon vier
bis fünf Zeilen, und jede Zeile ist am Finger zehn Pixel höher — fünfzig Pixel,
die nichts zusätzlich zeigen.* **Sie schrumpfen, aber nicht auf das Zeigermaß:
der Finger ist breiter als ein Mauszeiger.**

**Der größere Teil ist die Schrift im Auswahlfeld — und sie ist kein
Gestaltungsfehler.** *Das Stilblatt setzt für den Finger eine Untergrenze von
16 Pixeln auf Eingabefeldern; sie steht gegen das Hineinzoomen von Safari auf
dem iPhone und ist dort richtig.* **Ein `<select>` nimmt aber keinen
Schreibstrich:** es öffnet die Auswahl des Systems, und dort gibt es nichts zu
tippen — also auch nichts, wogegen der Browser hineinzoomen könnte. *Die
Auswahlfelder fahren in einer Regel mit, deren Anlass sie nicht haben, und die
aufgeklappte Liste nimmt die 16 Pixel mit.*

**Die Sortierung hat 13 Einträge in vier bis fünf Gruppen** — mit den
Überschriften sind es 17 bis 18 Zeilen. **Bei 16 Pixeln passt das auf kein
Telefon.**

**WAS NICHT PASSIERT:** *der Symbolknopf behält seine 44 Pixel — das ist die
einzige Zahl, die der Finger-Abschnitt ausdrücklich verspricht. Die
Eingabefelder bleiben ausnahmslos in der Zoomregel. Und es wird **keine
Einstellung für die Dichte**: sie wäre eine zweite Wahrheit über jedes Maß im
Stilblatt.*

**WAS DER PRÜFSTAND DAZU SAGT:** *er hält die Auswahlfelder heute wörtlich in
der Zoomregel fest.* **Diese Zusage wird neu geschrieben und nicht gelöscht** —
sie zerfällt in zwei: was drin sein muss, und was draußen sein muss.
*Stolperstein 201.*

---

## 0.29.0 — „Worauf man sich verlassen können muss"

> **GEBAUT AM 11. SEPTEMBER 2026.** *Die Ausarbeitung darunter bleibt als
> HERLEITUNG stehen — was daraus geworden ist, steht im Änderungsprotokoll
> 0.29.0, und was dabei anders kam als hier gedacht, ebenfalls.* **Drei Angaben
> dieser Ausarbeitung hat die Messung berichtigt** (die dritte Rasterspalte, die
> Breite der Kategorieauswahl, der gekürzte Platzhalter), **und eine ist
> ersetzt worden**: „weicht etwas ab, steht die Karte ohnehin auf Rot" — die
> Instanz kennt keinen Sollwert.
>
> **UND EIN DRITTER BEFUND IST DAZUGEKOMMEN:** *„Titel" sortierte nur von A bis
> Z (Betreiber, 11. September 2026).* Er fuhr mit, weil die Nummer ohnehin
> MINOR ist — und genau das war der Grund, aus dem 0.28.1 ihn liegen lassen
> musste.

**Die letzte Runde, die das Schema anfassen darf.** *Danach kommt der Bruch, und
was danach ein Feld braucht, steht allein gegen eine festgeschriebene
Struktur.* **Deshalb liegen hier die beiden Punkte mit Datenbankanteil.**

> **ZWEI BEFUNDE AUS DEM BETRIEB VON 0.28.1 FAHREN MIT — Punkt 6 und 7**,
> entschieden vom Betreiber am 11. September 2026: *„Ich würde ungern wegen den
> Befunden eine eigene Runde machen und deswegen nachfolgende mit 0.29.0
> kombinieren."*
>
> **DIE NUMMER ÄNDERT SICH DADURCH NICHT.** *0.29.0 ist wegen des
> Fälligkeitsdatums und des Index ohnehin MINOR; zwei Reparaturen an der
> Oberfläche heben sie nicht weiter.* **Der Fahrplan rückt nicht.**

### 1 · Die Sicherung wird zur Probe geöffnet

**Es gibt Sicherungsdateien, die noch nie jemand zurückgespielt hat.** *Eine
Sicherung ohne Probe ist eine Vermutung.*

**Gebaut wird ein Weg, der eine Sicherungsdatei probeweise öffnet, den Bestand
zählt und wieder zumacht — ohne die laufende Datenbank anzufassen.** Die Karte
sagt danach: so viele Einträge, so viele Bilder, so viele Zugänge, dieses Datum.

> **DAS EXPORTIEREN UND EINSPIELEN IST ETWAS ANDERES, und der Betreiber hat es
> geprüft** *(„Importieren und Exportieren habe ich mal probiert")*. **Es ist
> nicht dieselbe Datei.** Der Austausch schreibt eine JSON-Datei nach
> Austauschformat; die Sicherung ist die **verschlüsselte Datenbank selbst**,
> über `VACUUM INTO` erzeugt. *Was für die eine gilt, sagt über die andere
> nichts.* **Genau deshalb ist der Knopf so gebaut, dass die Probe jederzeit
> wiederholbar ist** — nicht als einmaliger Nachweis, sondern als Handgriff.

### 2 · Der Fingerprint sagt, WELCHE Datei abweicht

**Heute sagt er nur, DASS etwas abweicht.** Bei 0.9.1 hat sich dort eine Datei
zu viel gezeigt, und der Handgriff dagegen steht bisher nur in der README.

> **DER BETREIBER HAT EINEN ÜBERFAHRTEXT VORGESCHLAGEN** *(„muss keine extra
> Zeile")* **und nach der Meinung gefragt. Sie lautet: die Zeile ist besser —
> aber nur, wenn sie im Regelfall gar nicht dasteht.**
>
> **Zwei Gründe, und der erste wiegt schwerer:**
> 1. **Ein Überfahrtext ist auf dem Telefon nichts.** Es gibt kein Überfahren.
>    *Und der Ort, an dem man einen abweichenden Fingerprint bemerkt, ist
>    genauso oft das Telefon wie der Rechner.*
> 2. **Der Einwand gegen die Zeile ist ein Einwand gegen eine DAUERHAFTE
>    Zeile** — und die soll es auch nicht geben. **Stimmt alles, steht dort
>    nichts.** Weicht etwas ab, steht die Karte ohnehin auf Rot, und dann ist
>    die Liste der Dateien genau das, was man sucht.
>
> **Also: keine dauerhafte Zeile, kein Überfahrtext, sondern eine Zeile, die es
> nur im Fehlerfall gibt.** *Das ist dieselbe Bauform wie bei den „Alten
> Sicherungen": was nichts zu sagen hat, sagt nichts.*

### 3 · Ein Fälligkeitsdatum an Aufgaben

**Die Aufgabenliste über alle Einträge gibt es seit der Ansicht „Offen"; ein
Datum daran gibt es nicht.** Der Betreiber hat sie angenommen und nach der Form
gefragt.

**So wird sie gebaut:**

* **Ein Datum, keine Uhrzeit.** *Eine Aufgabe in einem Bewertungsarchiv ist an
  einem Tag fällig und nicht um 14:30. Eine Uhrzeit wäre eine Genauigkeit, die
  niemand pflegt — und ein Feld, das niemand pflegt, wird zur zweiten Wahrheit.*
* **Ein Feld an der Aufgabe**, nicht an einer neuen Tabelle: `comments` trägt
  die Aufgaben schon, und ein Datum daneben ist eine Spalte. **Das ist der
  Schemaanteil dieser Runde**, und deshalb liegt sie vor dem Bruch.
* **Freiwillig.** Ohne Datum ist eine Aufgabe genau das, was sie heute ist.
* **In der Ansicht „Offen" sortiert das Datum**, und drei Zustände sind zu
  sehen: **überfällig**, **heute**, **später**. Ohne Datum stehen sie hinten.
* **KEINE Benachrichtigung, kein Wecker, keine Mail.** *Die Glocke ist
  ausdrücklich schlank gebaut und trägt einen Zeitstempel und keine Tabelle. Ein
  Fälligkeitsdatum, das sich meldet, wäre ein zweites Vorhaben und nicht dieses.*
* **Das Austauschformat steigt auf 16** — ein Feld, das im Export fehlt, ist
  beim nächsten Einspielen weg.

### 4 · Die Adresse wird eindeutig

`users.email` hat bewusst **kein** `UNIQUE`: `ALTER TABLE` kann eines nicht
nachrüsten, und die gewanderte und die frisch angelegte Datenbank wären damit
verschieden gebaut. **Der richtige Weg ist ein partieller Index** —

```sql
CREATE UNIQUE INDEX IF NOT EXISTS … ON users(email) WHERE email IS NOT NULL
```

— der auf beiden Wegen gleich wirkt und mehrere Zugänge ohne Adresse zulässt.

> **DER BETREIBER HAT DAS WANN UND WIE ÜBERLASSEN, und die Antwort ist: hier.**
> *Ein Index ist Datenbankarbeit, und nach 0.33.0 steht die Struktur fest.
> Wollte man ihn danach, stünde er allein gegen eine festgeschriebene Struktur —
> genau der Fall, den die Bereinigung ausschließen soll.*

**Die zweite Hälfte ist schon entworfen:** hinter der Anmeldung wird eine
doppelte Adresse klar gesagt („Diese Adresse ist bereits vergeben") — wer das
sieht, ist angemeldet und sieht die Liste ohnehin. **Vor der Anmeldung gilt das
Gegenteil**, dort ist jede unterschiedliche Antwort ein Werkzeug zum
Durchprobieren.

### 6 · Der Umschalter der Tagzeile kostet eine Rasterzeile

> **VOM BETREIBER AM LAUFENDEN 0.28.1 GEMELDET** *(11. September 2026, mit
> Bild)*: „Ehrlich gesagt stört mich noch, dass Tags nun doch nur für Tags eine
> Zeile nimmt. … So nimmt ein Wort eine Zeile Platz und sieht falsch aus."

**ER HAT RECHT, UND DIE URSACHE IST 0.28.1 SELBST.** *Die Filterzeile ist mit
jener Runde ein Raster aus zwei Spalten geworden, und die Verweise am
Zeilenende (`.frow-right`) bekamen darin `grid-column: 1 / -1` — also eine
eigene Rasterzeile.* **Der Umschalter „Tags" ist 46 px breit und steht damit
allein auf einer Zeile von 366.**

**GEMESSEN** *(390 × 844, aufgeklappte Filter, zehn Tags)*:

| | Filterkasten | Kategoriezeile | erste Kachel |
|---|---|---|---|
| **heute, zugeklappt** | 252 px | **75 px** | y = 464 |
| heute, aufgeklappt | 395 px | 75 px | y = 607 |

*Eine Filterzeile ohne solchen Verweis misst 35 px — der Umschalter kostet also
**40 Pixel**, und zwar in jedem Zustand.*

**DER VORSCHLAG DES BETREIBERS — den Umschalter fallen lassen und die Tagzeile
immer zeigen — IST GEMESSEN WORDEN UND KOSTET MEHR, ALS ER SPART:**

| | |
|---|---|
| Tagzeile aufgeklappt | **134 px** |
| Unterschied zugeklappt/aufgeklappt | **143 px** |

*Die Tagzeile belegt im neuen Raster **vier** Zeilen: Beschriftung, der
Und/Oder-Umschalter (er spannt über beide Spalten), die Wolke und die Verweise
„mehr"/„zurücksetzen" (die spannen ebenfalls).* **Der Betreiber hat das selbst
vermutet** *(„ja tags könnte tatsächlich dem widersprechen")* — **und die
Messung gibt ihm recht.**

**WAS STATTDESSEN GEBAUT WIRD: eine DRITTE Rasterspalte für die Verweise am
Zeilenende.** *Dann steht der Umschalter dort, wo er hingehört — am Ende
seiner Zeile — und kostet keine eigene mehr.*

| | Filterkasten | Kategoriezeile | Tagzeile | erste Kachel |
|---|---|---|---|---|
| heute, zugeklappt | 252 px | 75 px | — | y = 464 |
| **drei Spalten, zugeklappt** | **212 px** | **35 px** | — | **y = 424** |
| heute, aufgeklappt | 395 px | 75 px | 134 px | y = 607 |
| **drei Spalten, aufgeklappt** | **316 px** | **35 px** | **94 px** | **y = 527** |

**VIERZIG PIXEL ZUGEKLAPPT, NEUNUNDSIEBZIG AUFGEKLAPPT** — *und der Umschalter
bleibt, weil er weiter 104 Pixel spart.* **Der Befund ist damit gelöst, ohne
dass ein Bedienelement fällt.**

**Offene Entscheidung:** *der Und/Oder-Umschalter der Tags spannt weiterhin
über beide Spalten — 362 px für einen kleinen Schalter. Ob er in die erste
Spalte neben die Beschriftung gehört, ist zu messen, bevor es entschieden wird.*

---

### 7 · Der Anlegeknopf der Kategorie steht verwaist unter seinem Feld

> **VOM BETREIBER AM LAUFENDEN 0.28.1 GEMELDET** *(11. September 2026, mit
> Bild und Skizze)*: „sieht man das Anlegen-Button unten ist und sieht verwaist
> aus. Rechts ist Platz da ohne Sinn." — *und, als Frage nachgereicht:* „das
> Hinzufügen rechts vom Namen zu halten. Würde je eine Zeile sparen?"

**DIE ANTWORT IST JA — für die Kategorie, und sie ist gemessen** *(390 px,
Spalte 366 px)*:

| | Kasten | Zeilen | Auswahl | Feld | Knopf |
|---|---|---|---|---|---|
| **heute** | 161 px | **2** | 148 | 210 | 94 (allein auf Zeile 2) |
| **Skizze: alle drei in einer Zeile** | **110 px** | **1** | 148 | **108** | 94 |
| *ausgeglichen: die Auswahl gibt Breite ab* | 110 px | 1 | 119 | 137 | 94 |
| *„wie Tags": Auswahl oben, Feld + Knopf darunter* | 156 px | 2 | 366 | 264 | 94 |

**EINUNDFÜNFZIG PIXEL UND EINE ZEILE.** *Die vierte Zeile war Claudes
Vorschlag — die Skizze des Betreibers ist besser und spart zehnmal so viel.*

**DIE TAGZEILE IM EINTRAG IST NICHT BETROFFEN:** *ihre Eingabereihe misst
bereits **43 px in einer Zeile** — dort ist nichts zu sparen. „Je eine Zeile"
gilt für die Kategorie.*

**DER PREIS IST DAS NAMENSFELD**, und er ist kleiner, als er aussieht:

> **DER 1f76adac IST HEUTE SCHON ABGESCHNITTEN.** *„Neue Kategorie, Enter"
> braucht 238 px; im heutigen Feld sind 186 px Platz — es fehlen 52.* **Nach
> dem Umbau sind es 84 px** *(bzw. 113 px, wenn die Auswahl Breite abgibt)*.
> **Das Abschneiden ist also nicht neu, sondern älter als dieser Befund** — und
> die eigentliche Abhilfe ist ein **kürzerer Platzhalter**, nicht ein breiteres
> Feld.

**Offene Entscheidungen für die Fragetafel**

| | Frage |
|---|---|
| **a** | Gibt die **Auswahl** Breite ab *(119/137)* oder behält sie ihre 148 *(148/108)*? |
| **b** | Wird der **Platzhalter gekürzt** — „Neue Kategorie" statt „Neue Kategorie, Enter", oder nur „Name"? *Er steht in drei Sprachen* |
| **c** | Gilt dasselbe am **Schreibtisch**, wo die Spalte breiter ist und heute schon alles in eine Zeile passt? *Dort ändert sich nichts — die Regel gehört in den Telefonabschnitt* |

---

### 5 · Ein Abschnitt in der README über die Zustellbarkeit

**Kein Code.** Der Betreiber hat gemeldet, dass Mails ankommen, bei Google aber
**im Spam landen** — und vermutet, es liege daran, dass die Adresse des Servers
und die der Domain auseinandergehen.

> **DIE VERMUTUNG TRIFFT, UND EIN ANDERER VERSANDWEG HILFT NICHT DAGEGEN.**
> *Der Vorschlag „ein Versanddienst über HTTPS statt SMTP" steht seit 0.9.0 im
> Sammelblatt; er ist mit dieser Runde erledigt, aber nicht, indem er gebaut
> wird.*
>
> **Warum:** dass eine Mail im Spam landet, entscheidet nicht der Weg, auf dem
> sie den Server verlässt, sondern **ob die Domain den Absender deckt.** Drei
> Einträge im Namensdienst tun das — **SPF** sagt, wer senden darf, **DKIM**
> unterschreibt jede Mail, **DMARC** sagt, was mit einer undeckten geschehen
> soll. *Ohne sie ist jede Mail von einer fremden Adresse ein Anwärter auf den
> Spamordner, ob über Port 587 oder über eine Schnittstelle.*
>
> **Ein Dienst wie Brevo oder Postmark hilft trotzdem** — aber nicht wegen
> HTTPS, sondern weil er die drei Einträge mitbringt und von Adressen sendet,
> denen die Empfänger schon trauen. **Und genau dieser Dienst lässt sich über
> SMTP ansprechen, was die Instanz heute kann.** *Es wäre also neuer Code für
> etwas, das der vorhandene schon leistet.*
>
> **Was diese Runde tut: die drei Einträge in der README erklären**, mit dem
> Hinweis, dass ein Weiterleitungsdienst der einfachere Weg ist, und dass er
> **keine** neue Betriebsart braucht.

---

## ~~0.30.0 — „Der Prüfstand wird schnell"~~ — GEBAUT

> **GEBAUT AM 12. SEPTEMBER 2026, und die Runde heißt „Der Prüfstand wird
> schnell, das Telefon wird ruhig".** *Der Betreiber hat sie mit vier Befunden
> vom Telefon zusammengelegt: „ich will es wieder kombinieren. und keine runde
> alleine dafür machen."*
>
> **DIE ZAHL, AN DER SIE GEMESSEN IST: 464,4 Sekunden vorher, 271,5 nachher.**
> *Pflicht waren 280, Ziel 250 (F6): die Pflicht ist erfüllt, das Ziel nicht.*
> **Die Hebel haben 203 Sekunden gebracht; die zehn NEUEN Prüfgruppen dieser
> Runde kosten davon 18 wieder** — *45 Prüfungen mehr, und der Handel gehört
> genannt und nicht verrechnet.* **Die Prüfungszahl ist dabei gestiegen und die
> Zahl der Gruppen von 329 auf 339.** *Alles Weitere steht im
> Änderungsprotokoll 0.30.0.*
>
> **DIE HERLEITUNG UNTEN BLEIBT STEHEN**, weil sie die HEBEL erklärt — und
> weil zwei ihrer Vermutungen von der Messung berichtigt worden sind.

**Der Auftrag des Betreibers wörtlich:** *„Optimiere und mach das, was das Bauen
beschleunigt, aber dennoch sicher ist."*

**Die zweite Hälfte des Satzes ist die Auflage dieser Runde:** *keine Prüfung
fällt weg, keine wird abgeschwächt, und ein Lauf sagt hinterher genauso
verlässlich, was er belegt hat.*

| | was | warum es Zeit spart |
|---|---|---|
| **1** | **Die Gegenprobe verwechselt einen Abriss mit einer Störung von außen.** Spur 0 fährt ohne Versatz, also auf denselben Ports wie ein gewöhnlicher `npm test`. Läuft daneben ein Lauf, nimmt er ihr die Ports — und der Bericht meldet **ABGERISSEN**, was wie ein Befund über den Rückbau aussieht. *Genau das ist passiert, und ein `pkill` auf den Namen hat es auf alle vier Spuren ausgedehnt: **neunzehn Rückbauten hintereinander falsch gemeldet.*** **Die Antwort ist klein:** vor dem Start nachsehen, ob jemand horcht, und beim Aufräumen nach **Prozessnummer** greifen statt nach Namen | **spart einen halben Tag Fehlersuche nach einem Fehler, den es nicht gibt** |
| **2** | **Das Wartefenster von zwölf Sekunden** reicht unter Last nicht; der Lauf reißt mit „Zweitserver nicht erreichbar" ab. Größeres Fenster **und** eine Meldung, die sagt, **welcher** Server gemeint ist | spart den Wiederholungslauf |
| **3** | **Ein Lauf, der abgebrochen wird, lässt seine Server stehen.** *Am 8. September 2026 gesehen: sieben verwaiste Server, zweieinhalb Stunden alt, jeder mit seinem Wegwerfverzeichnis.* Der Wächter „Keine Prüflage lässt ihren Server zurück" greift nur beim ordentlichen Ende. **Ein Aufräumer beim Start**, der findet, was ein früherer Lauf liegen gelassen hat | verhindert, dass der nächste Lauf an belegten Ports scheitert |
| **4** | **Der Lauf sagt, wo die Zeit hingeht** — eine Zeit je Gruppe und eine Liste der teuersten am Ende. **Ohne diese Zahl ist jede Beschleunigung geraten** | ist die Voraussetzung für alles Weitere |
| **5** | **Nachprüfen, ob der Lauf bei jedem Push wirklich greift.** *Ein Papier, das zwischen zwei Runden geändert wurde, hat den Zweig schon einmal rot gemacht, ohne dass es jemand bemerkt hat — es lag kein Lauf dazwischen* | fängt Rotes, bevor eine Runde darauf aufsetzt |

### Und jetzt gemessen — ein Lauf mit Zeitstempel je Gruppe, 8. September 2026

> **DIESE ZAHLEN SIND 0.28.1 UND DAMIT ÜBERHOLT.** *Am 12. September 2026 ist derselbe
> Lauf auf **0.29.0** gefahren worden: **446,8 Sekunden, 329 Gruppen, 6662 von 6662 grün.**
> Die vollständige Auswertung steht im **Auftrag 0.30.0** und nicht hier — die Herleitung
> unten bleibt stehen, weil sie die HEBEL erklärt und nicht die Zahlen.*

**435 Sekunden, 304 Gruppen.**
beschleunigt; hier steht die Antwort mit Zahlen statt mit Vermutungen.*

| Thema | Zeit | Anteil |
|---|---|---|
| **Die Anmeldebremse** *(6 Gruppen)* | **93,5 s** | **21 %** |
| **Die Mailfristen** *(10 Gruppen)* | **58,2 s** | **13 %** |
| **Der Export** *(6 Gruppen)* | 40,6 s | 9 % |
| **Der zweite Faktor** *(15 Gruppen)* | 33,9 s | 8 % |
| *223 Gruppen unter einer Sekunde* | *72 s* | *17 %* |

***Die teuerste einzelne Gruppe ist „Der Mailversand: die Frist wird gemessen,
nicht behauptet" mit 48,4 Sekunden — allein sie ist elf Prozent des ganzen
Laufs.***

**Der lange Schwanz ist kein Problem:** 223 der 304 Gruppen liegen unter einer
Sekunde und kosten zusammen 72 s. *Dort ist nichts zu holen, und wer dort sucht,
sucht falsch.*

#### Woran es liegt — und was der Hebel ist

| | Ursache | Hebel |
|---|---|---|
| **1** | **Die Bremse schläft wirklich.** `delay(count) = min((count − 4) × 700, 4000)` ms, und die Route wartet das ab. Sechs Gruppen laufen die Kurve real durch: 0,7 + 1,4 + 2,1 + 2,8 + 3,5 + 4,0 … | **`delay()` ist eine REINE FUNKTION.** Die Kurve an der Funktion belegen — jeden Zählerstand, **null Millisekunden** — und die Verdrahtung genau **einmal** an der Route. ***Der Beleg wird dabei stärker, nicht schwächer:*** die Funktionsprobe deckt jeden Zählerstand ab, der Lauf heute nur die sechs, durch die er zufällig geht. **~80 s** |
| **2** | **Die Fristen werden abgewartet.** `SEND_MS = 20 s`, `GREETING_MS = 7 s`, `CONNECT_MS = 7 s`. Die drei Lagen — stumm, schweigt, tröpfelt — kosten 7 + 20 + 20 s | **Die drei Konstanten aus der Umgebung stellbar machen** und im Lauf auf 300 ms setzen. **Eine Frist ist keine Sicherheitsgrenze** — kurz gestellt belegt sie dieselbe Verdrahtung. *Dazu eine Prüfung, die die Auslieferungswerte 20/7/7 festnagelt.* **~50 s** |
| **3** | **scrypt rechnet 75 ms je Hash** *(gemessen, `N = 16384`)*. Der Lauf startet **76 Server**, legt in jedem Zugänge an und meldet sich an | **Die Kennwerte stellbar machen**, im Lauf `N = 1024`. **Sie stehen ohnehin im gespeicherten Wert mit drin** (`scrypt$N$r$p$…`) — die Formatprüfung bleibt damit gültig. *Dazu eine Prüfung, die `N = 16384` in der Auslieferung festnagelt.* **~25–45 s** |
| **4** | **174 Aufbauten des Dokuments.** Jeder wertet `public/app.js` aus — **605 kB**. jsdom laden allein kostet 648 ms, ein leeres Dokument 98 ms | **Ein Grunddokument einmal bauen**, je Prüfung nur den Unterschied setzen — außer dort, wo die Prüfung den Aufbau selbst belegt. *Der Gewinn ist hier zu messen und nicht zu schätzen* |

> **UND DER GRÖSSTE HEBEL IST NICHT DER LAUF, SONDERN DIE GEGENPROBE.** Sie
> fährt den **ganzen** Prüfstand **einmal je Rückbau**. *Bei 435 s je Lauf und
> vier Spuren kostet eine Gegenprobe über acht Rückbauten eine Viertelstunde;
> über die ganze Liste wäre sie tagelang.* **Jede Sekunde, die der Lauf
> verliert, verliert sie so oft, wie Rückbauten gefahren werden.** *Deshalb
> zahlt sich diese Runde nicht einmal aus, sondern bei jeder folgenden.*

> **WAS AUSDRÜCKLICH NICHT VORGESCHLAGEN WIRD:** **den Lauf parallel fahren.**
> *Das ist genau der Portstreit, an dem die Gegenprobe schon einmal neunzehn
> Rückbauten hintereinander falsch gemeldet hat.* **Und keine Prüfung fällt
> weg** — die Auflage dieser Runde steht oben.

---

> **DER ECHTE TEILLAUF STEHT HIER NICHT — und der Grund ist kein Zögern.**
> `testbench.js` ist **ein** langer Ablauf: die Prüflagen bauen aufeinander auf,
> Server werden einmal gestartet, Bestände nacheinander erzeugt. **Der
> Namensfilter kann deshalb nur die Ausgabe einschränken, nicht die Arbeit.**
>
> ***Ein echter Teillauf IST die Aufteilung in Module*** — und die steht auf
> **0.34.0**, hinter dem Bruch, weil sie sonst Prüfgruppen mit umzieht, die die
> Bereinigung kurz darauf löscht. **Diese Runde legt die Messung hin, mit der
> 0.34.0 weiß, welche Gruppen die Aufteilung zuerst verdienen.**

---

## 0.31.0 — „Die Sprachen werden gegengelesen"

**Aus dem Rundlauf mit 0.25.1, am 10. September 2026.** Der Betreiber hat alle
drei Sprachdateien durch ein zweites Modell gegeben und die Berichte
beigebracht. *Jede Behauptung daraus ist am Quelltext nachgeprüft worden; das
Ergebnis steht als **Punkt 24** im Sammelblatt und zerfiel in vier Gruppen.*
**EINE FÜNFTE IST AM 11. SEPTEMBER 2026 DAZUGEKOMMEN**, aus dem Rundlauf mit
0.27.0 und nicht aus den Berichten: **die Textmenge.**

**SIE STEHT UNMITTELBAR VOR DEM BRUCH, und das hat einen Grund.** Sie ist die
letzte Runde, die den **Wortlaut der Oberfläche** und den **Satzbau in
`public/app.js`** frei umbauen darf. *Jede Runde davor legt neue Sätze an — und
jeder davon nach dem Muster, das diese hier abschafft.* **Wer sie ans Ende
schiebt, lässt vier Runden lang Schulden auflaufen, die er dann größer
abträgt.**

| | was | Größe |
|---|---|---|
| **0** | **EINE SCHULD AUS 0.30.1, am 12. September 2026 hierher gelegt** *(F21 jener Runde)*: **`card.checkUntil` heißt auf Deutsch seit 0.30.1 „Stand von" und auf Englisch und Türkisch noch „Content up to" und „İçerik şu tarihe kadar".** *Die deutsche Entscheidung ist gefallen; die beiden anderen sind hierher gewandert, weil der türkische Satz **nachgestellt** werden will — und das ist hier Satzbau (Gruppe 2) und wäre dort ein Umbau am Aufrufort gewesen.* **Damit sagen drei Dateien eine Runde lang Verschiedenes, und das ist der Preis, den diese Runde einlöst** | klein |
| **1** | **Die harten Fehler.** `entry.tagQuote` hat **in allen drei Dateien** kein schließendes Anführungszeichen und geht unverändert in ein `title`. `card.inDays` und `login.linkValidMinutes` haben keine Mehrzahlform — *„in 1 Tagen", „noch 1 Minuten"*. **36 deutsche Sätze** öffnen mit `„` und schließen mit einem geraden `"`; **65 türkische** tragen das deutsche Zeichenpaar, obwohl Englisch längst `“…”` benutzt | klein, aber viele Stellen |
| **2** | **Der zersägte Satzbau — der eigentliche Ertrag.** Viele Sätze sind in mehrere Schlüssel geteilt und werden im Aufruf zusammengesetzt. *Im Deutschen geht das auf, im Englischen meistens auch.* **Im Türkischen ist es schon schiefgegangen:** `login.yourLinkAffected` + `login.not` + `login.stillValid` setzt die Verneinung als **eigenes Wort** zwischen zwei Hälften — Türkisch verneint mit einem **Suffix im Verb**, und „Bağlantın bundan **değil** etkilendi" ist keine Verneinung, sondern Kauderwelsch. **Das lässt sich nicht in der Datei reparieren, nur im Quelltext** | mittel |
| **3** | **Die Hausstimme.** „Das Haus verlassen", „Sache", „von Hand", „Standbild", „Wie das Gerät", „Note" bei 1 bis 5 Sternen, der Ton der E-Mails. *Das sind bewusste Formulierungen dieses Projekts, in Deutsch **und** Englisch gleich — keine Übersetzungsfehler.* **Ob sie bleiben, entscheidet der Betreiber**, und das sind rund fünfzehn Entscheidungen, von denen jede alle drei Dateien zugleich ändert | offen — hängt an der Fragetafel |
| **4** | **„Pille" und „hap".** Der Hausbegriff für die abgerundeten Filterflächen ist im Türkischen zur **Arzneitablette** geworden. *Er gehört zu Gruppe 3 und steht trotzdem eigens hier: er ist der einzige, bei dem die deutsche Entscheidung schon feststeht — der Begriff bleibt, die Übersetzung nicht* | klein |
| **5** | **Der Erklärbärsaft — neu am 11. September 2026, aus dem Rundlauf mit 0.27.0.** *Der Betreiber über die Texte der neuen Karte:* „an vielen stellen hast du ein schluck erklärbärsaft getrunken … letztlich zählt nur welche auswirkung es hat". **Genannt hat er zwei, und beide stammen aus 0.27.0:** `card.storeCaveat` (die Auflage — vier Teilsätze, darunter die Herleitung über den Kodierer und die Bytes) und `card.derivativesWebp` (die Vorschaubilder — zwei Sätze, der zweite eine Begründung). *Beide sagen, WARUM etwas so ist; gebraucht wird, WAS es bewirkt.* **Es ist dieselbe Sorte Befund wie Gruppe 3, aber die andere Richtung:** dort geht es um die WORTWAHL, hier um die MENGE. *Die Regel steht schon im Projektstand (5.6): eine Oberfläche sagt, WAS IST, nicht warum es so gebaut wurde. Sie ist in 0.27.0 nicht eingehalten worden.* **Die beiden sind der Anfang, nicht die Liste** — die Runde geht alle Karten durch | mittel |
| **6** | ~~Zwei deutsche Wörter sitzen fest im Quelltext~~ — **mit 0.28.1 GEBAUT und am 12. September 2026 nachgesehen.** *`label="Allgemein"` und `label="Verlauf"` holen ihr Wort seit jener Runde aus `list.sortGroupGeneral` und `list.sortGroupHistory` (`public/app.js:4050`).* **EIN DRITTES WORT IST AM 12. SEPTEMBER 2026 AUFGEFALLEN und fährt nicht hier, sondern in 0.30.0:** *„gewichtet" in `public/app.js:7020` — es steht in keiner der drei Sprachdateien, und 0.30.0 hat dieselbe Kopfzeile ohnehin in der Hand.* **Was hier bleibt, ist die WACHE**, die solche Sätze künftig findet: sie liest Werte und nicht Namen und wird in 0.30.0 gebaut *(Zusage 21)* | **erledigt** |

### Das Muster für Gruppe 5 — vom Betreiber am 11. September 2026 geliefert

**Er hat nicht nur den Befund genannt, sondern eine Fassung dazugestellt.** *Sie
steht hier wörtlich, weil sie die Regel besser zeigt als jede Beschreibung der
Regel:*

> **Hinweis zur Komprimierung der Originale:**
>
> * **Verlustbehaftet:** Empfohlen für *Fotos* (Dateigröße sinkt um ca. zwei
>   Drittel). Bei Screenshots oder Textgrafiken führt dies an harten Kanten (wie
>   Schrift) jedoch zu störendem Bildrauschen und oft sogar zu deutlich
>   *größeren* Dateien als verlustfrei.
> * **Globale Auswirkung:** Das System kann den Inhalt von PNGs nicht
>   automatisch analysieren. Die gewählte Einstellung gilt daher einheitlich für
>   alle Uploads.
> * **Vorschaubilder:** Werden hiervon nicht beeinflusst; sie werden zur
>   Optimierung der Ladezeiten immer verlustbehaftet im WebP-Format erzeugt.

**WAS DIESE FASSUNG ANDERS MACHT — drei Dinge, und jedes ist eine eigene Regel:**

| | |
|---|---|
| **1** | **Jeder Punkt trägt ein Stichwort vorn.** *„Verlustbehaftet:", „Globale Auswirkung:", „Vorschaubilder:"* — man findet die Zeile, die einen angeht, ohne den Absatz zu lesen |
| **2** | **Drei Punkte statt zweier Absätze.** *Die heutige Fassung legt Empfehlung, Gegenanzeige und Geltungsbereich in EINEN Fließtext; hier hat jede Aussage ihre Zeile* |
| **3** | **Die Herleitung ist weg, die Auswirkung bleibt.** *Heute steht in der Karte, WARUM der Kodierer mit harten Kanten nicht umgehen kann (VP8 gegen VP8L, die Bitströme). Dort steht, WAS dabei herauskommt: Bildrauschen und größere Dateien* |

> **DIE DRITTE IST DIE EIGENTLICHE.** *Der Betreiber sagt es so:* „letztlich
> zählt nur welche auswirkung es hat." **Die Herleitung gehört in den Quelltext
> und in die Papiere — dort steht sie auch, ausführlich.** *In der Karte ist sie
> Ballast.*

**DIESE DREI REGELN GELTEN FÜR ALLE KARTEN**, nicht nur für die beiden aus
0.27.0. *Die Runde geht sie durch; die beiden sind der Anfang, nicht die Liste.*

> **ZWEI DIAGNOSEN AUS DEN BERICHTEN SIND FALSCH**, und beide Male aus
> demselben Grund: der Bericht sieht die Sprachdatei und nicht den Aufruf.
> *`login.stillValid` ist im Deutschen und Englischen richtig — die Verneinung
> steht dazwischen —, und die türkischen Mehrzahlformen sind kein Versäumnis,
> sondern die Entscheidung des Betreibers vom 8. September 2026 (Punkt 19).*
> **Beide stehen mit Beleg im Sammelblatt**, damit sie nicht in einem Jahr
> wiederkommen.

**Die harten Fehler und der türkische Verneinungssatz müssen nicht warten.**
*Beide sind PATCH-Arbeit und hängen an ihrer Runde, sobald der Betreiber sie
losschickt* — **was hier steht, ist Gruppe 3 mit ihrer Fragetafel.**

**Kein Schemaanteil.** Sie fasst `public/app.js`, `public/style.css` und die drei
Sprachdateien an und keine Tabelle.

---

## 0.31.1 — „Deutsch sitzt"

> **GEBAUT AM 13. SEPTEMBER 2026** — *Änderungsprotokoll 0.31.1.* **1254
> Schlüssel sind 1197 geworden, in allen drei Dateien**, und am Bildschirm hat
> sich kein Zeichen geändert. *Was unten steht, ist der Befund, aus dem der
> Auftrag entstanden ist; was daraus geworden ist, steht im Änderungsprotokoll.*

**Aus dem Rundlauf mit 0.31.0, am 13. September 2026.** Der Betreiber hat die
Runde am laufenden Server angesehen, sieben Befunde gemeldet und die Richtung
vorgegeben: *„gehe die deutsche sprache sorgfältig durch und mach kein
schnellschuss. deutsch muss sitzen. von dem aus gehen wir in die anderen
sprachen."*

**DARAUF IST DIE GANZE DATEI GELESEN WORDEN** — alle 1254 Schlüssel, jeder
gegen seine Aufrufstelle. *Was dabei herauskam, steht unten; es ist mehr, als
die Fragetafel von 0.31.0 vermutet hat, und an einer Stelle ist es ein Fehler
und keine Geschmacksfrage.*

**SIE SCHIEBT ENGLISCH UND TÜRKISCH UM EINE NUMMER.** *Das ist keine
Verzögerung, sondern die billigere Reihenfolge:* **211 der 1254 Schlüssel sind
Bruchstücke, die in dieser Runde verschwinden.** Wer sie vorher übersetzt,
schreibt zweihundert Sätze, die es danach nicht mehr gibt — und das Türkische
ist genau die Sprache, an der das Zersägen schon einmal zerbrochen ist.

### I · Der zersägte Satzbau — gemessen und nicht geschätzt

| | |
|---|---|
| **211 Schlüssel** | von 1254 — jeder sechste |
| **130 Zeilen** | in `public/app.js` |
| **wo** | `card` 171 · `entry` 24 · `list` 8 · `login` 7 · `dialog` 1 — **die Karten tragen es fast allein** |

**Drei Sorten, und keine davon ist Auslegung:**

| | was | Zahl | Beispiel |
|---|---|---|---|
| **1** | fängt mit einem **Satzzeichen** an | **42** | `card.theDot` = *„. Das"* — ein Punkt und ein Artikel als übersetzbarer Schlüssel |
| **2** | ist ein **blosses Füllwort** | **13** | `card.and` = *„und"*, `card.theMasc` = *„Der"*, `card.or` = *„oder"* |
| **3** | fängt klein an **und wird verklebt** | **61** | `card.valid` = *„gültig,"*, `entry.calcOut` = *„heraus."* |

**UND ZEHN WERTE TRAGEN EINE UNPAARIGE KLAMMER.** *Die Klammer öffnet in einem
Schlüssel und schließt in einem anderen:* `card.withPhotos` = „Mit Fotos (~",
`card.forSearchText` = „für den Suchtext (", `card.noBackupDirCard` = „Es ist
kein Sicherungsordner eingerichtet (siehe Karte". **Ein Übersetzer bekommt
einen Satz, der mit einer offenen Klammer endet, und soll raten, was folgt.**

> **DER SCHÄRFSTE FALL IST DAS ANFÜHRUNGSZEICHENPAAR SELBST.**
> `card.forQuote` = **„für „"** und `card.shownOnce` = **„" — wird nur einmal
> angezeigt."** stehen in `public/app.js:11227` um einen Benutzernamen herum.
> *Das öffnende und das schließende Zeichen eines Paares liegen in zwei
> verschiedenen Schlüsseln* — und Englisch schreibt `“…”`, Türkisch wieder
> anders. **Was hier zersägt ist, ist nicht einmal ein Satz, sondern ein
> Satzzeichen.**

**DER WEG IST GEBAUT UND ERPROBT.** *`tMark()` (`public/app.js:106`) trägt seit
0.25.4 genau diesen Fall:* ein ganzer Satz mit `{word}`-Platzhalter, die
Hervorhebung über ein Steuerzeichen eingesetzt. **86 der 106 Nähte sind reine
Auszeichnung und fallen damit ohne einen einzigen neuen Gedanken.** *Die
übrigen zwanzig tragen einen eingesetzten Wert, ein `<code>`-Stück oder blossen
Text und brauchen je einen Platzhalter mehr.*

> **DER DEUTSCHE WORTLAUT ÄNDERT SICH DABEI NICHT UM EIN ZEICHEN.** Es ändert
> sich nur, auf wie viele Schlüssel er verteilt ist. **Abschnitt 12 ist damit
> nicht berührt** — das deutsche Ergebnis bleibt unveränderliche Basis; die
> Runde fasst seine ABLAGE an und nicht seinen Wortlaut.

### II · Zwei Schlüssel führen Programmablauf durch die Sprachdatei — und einer ist ein Fehler

**`entry.reportKind` = „report".** *In `public/app.js` stehen zwei Zeilen
untereinander, und sie machen denselben Vergleich verschieden:*

```
8344    kind.classList.toggle('on', newKind === 'report');
8345    kind.title = newKind === t('entry.reportKind') ? ... : ...;
```

**Zeile 8344 vergleicht den Datenbankwert gegen sich selbst. Zeile 8345
vergleicht ihn gegen einen SPRACHWERT.** *Und `newKind` ist ein reiner
Datenwert:* er startet auf `'note'` (8336), wird zwischen `'report'` und
`'note'` umgeschaltet (8380) und geht als `fd.append('kind', newKind)` an den
Server (8416). **In derselben Funktion stehen fünf weitere Vergleiche — 8343,
8347, 8348, 8352, 8380 — und alle fünf prüfen gegen ein Literal.** *Einer von
sechs läuft durch die Sprachdatei; das ist kein Entwurf, sondern ein
Verrutscher.*

**HEUTE GEHT ES AUF, und genau das ist die Gefahr.** *Der Schlüssel steht in
allen drei Dateien auf „report" — er ist einer von dreizehn, deren Wert sich in
`de`, `en` und `tr` deckt.* **Wer die deutsche Datei liest, sieht ein
englisches Wort ohne erkennbaren Grund und übersetzt es — und die Beschriftung
des Knopfes dreht sich stumm um.** *Der Schlüssel hat keinen Leser; er
existiert nur für diesen einen Vergleich und gehört gelöscht.*

**`dialog.sessionExpired` ist dieselbe Sorte, eine Stufe milder.** *Er wird an
zwei Stellen geworfen (`306`, `1617`) und an sechs zurückverglichen.* **Ein
Sprachwechsel zwischen Wurf und Fang lässt jeden dieser sechs Vergleiche
danebengreifen** — eng, aber echt, und aus demselben Grund falsch: **eine
Verzweigung läuft durch einen Satz, den jemand übersetzen darf.**

### III · Stolperstein 47 — vier Stellen, an denen dieselbe Sache zweimal steht

| | was doppelt steht | wo |
|---|---|---|
| **1** | **Die vierzehn Vorgabewörter.** `card.vocabularyResetHint` zählt sie in Prosa auf — *„Eintrag/Einträge, Getestet/Ungetestet, …"* — und nennt dazu die Zahl „vierzehn". Dieselben vierzehn stehen als Daten unter `vocabulary.*` | eine Vorgabe ändern, und der Hinweis lügt |
| **2** | **Die Höchstgrößen.** `card.mb50` bis `card.mb300` tragen die Zahl als Text; daneben steht im Quelltext `value="52428800"` | `public/app.js:13215` ff. |
| **3** | **Der Grabstein.** `card.nameFreedHint` schreibt *„Gelöschter Benutzer &lt;Nummer&gt;"* von Hand nach — **samt HTML-Entitäten im Wert, in allen drei Dateien** —, obwohl `list.deletedUser` = „Gelöschter Benutzer {id}" danebensteht und `dialog.nameFreedHint` es zwei Zeilen weiter richtig mit `{number}` macht | drei Fassungen einer Beschriftung |
| **4** | **Die Begründung der Exportgrenze.** *„Eine Exportdatei ist ein einziger Text, und der kann nicht größer als {limit} MB werden"* steht wörtlich zweimal (`server.exportTooBig`, `server.entryTooBig`), und `server.exportGrew` gibt für dieselbe Grenze eine **dritte, andere** Begründung: *„da sie im Arbeitsspeicher erzeugt wird"* | drei Meldungen, drei Erklärungen, eine Grenze |

### IV · Die vierzehn Vokabelbeschriftungen folgen drei verschiedenen Regeln

**Sie stehen untereinander in einer Karte, und keine zwei sind nach demselben
Muster gebaut:**

| Regel | Beispiel | was daran nicht geht |
|---|---|---|
| **bar** | `card.itemOne` = *„Einzahl"* | sagt nicht, wovon |
| **Name + Form** | `card.reportOne` = *„Bericht, Einzahl"* | **daneben steht schon „(Vorgabe: Bericht)"** — dasselbe Wort zweimal in einer Zeile. Und wer „Bericht" in „Protokoll" umbenennt, liest weiter „Bericht, Einzahl" |
| **Beschreibung** | `card.dayOne` = *„Zeitpunkt, Einzahl"*, `card.testedYes` = *„Merkmal erfüllt"*, `card.ratingOne` = *„Sterne nach dem Test, Einzahl"* | beschreibt statt zu benennen — und „Zeitpunkt" ist für einen Testtag das falsche Wort |

> **DIE REGEL, DIE FEHLT, IST EINE EINZIGE:** *die Beschriftung benennt das
> FACH, nie das WORT* — denn das Wort ist gerade das, was der Benutzer
> auswechselt, und die Vorgabe steht ohnehin schon daneben.

### V · „Note" bei fünf Sternen

**`entry.gradeLabel` = „Note:" steht in `public/app.js:7582` unmittelbar neben
einem Sternfeld.** *Drei Sachen stoßen sich daran zugleich:*

| | |
|---|---|
| **1** | **Eine deutsche Note läuft andersherum.** Bei einer Schulnote ist die **1** die beste; hier sind **fünf** Sterne das Beste. `server.gradeRange` sagt wörtlich *„Die Note muss zwischen 1 und 5 liegen."* |
| **2** | **Dieselbe Sache heißt zweimal verschieden.** Das Vokabular nennt sie `vocabulary.ratingOne` = *„Bewertung"*; die Detailansicht nennt sie *„Note"* |
| **3** | **Und nur eine der beiden ist umbenennbar.** „Bewertung" ist ein Vokabelwort und lässt sich auswechseln — „Note" steht fest und bleibt stehen, wenn der Benutzer die andere Hälfte umbenennt |

**Das ist die eine offene ENTSCHEIDUNG dieser Runde**, und sie gehört dem
Betreiber: *fällt „Note" ganz weg zugunsten des Vokabelworts, oder bleibt sie
und wird zum Vokabelwort gemacht?*

### VI · Was sauber ist — und ausdrücklich hier steht

**Ein Durchgang, der nur Befunde nennt, sagt nicht, wie weit er gegangen ist.**
*Diese fünf sind geprüft und in Ordnung:*

| | |
|---|---|
| **Platzhalter** | **114 verschiedene, jeder einzelne an seiner Aufrufstelle geliefert** — mit gezählten Klammern über Zeilengrenzen hinweg nachgesehen, **kein einziger Fehlgriff** |
| **Anführungszeichen** | nach 0.31.0 bleibt genau **ein** unpaariges Paar: das zersägte aus Abschnitt I |
| **Anrede** | **kein Siezen** — die sechs Treffer auf „Sie" sind alle die dritte Person Mehrzahl |
| **Zeichen** | **kein gerader Apostroph, kein Bindestrich an Gedankenstrichstelle** |
| **Mehrzahl** | 41 Schlüssel tragen beide Formen; die 18 Werte mit einer Zahl ohne Mehrzahlform sind alle begründet (eingeklammerte Zähler, oder ein Vokabelwort trägt die Form) |

### VII · Und eine Kosmetik, die keine ist

**92 deutsche SCHLÜSSEL tragen die Einrückung des Quelltexts mit sich** —
*93 Werte, weil einer der Schlüssel beide Mehrzahlformen betrifft* —
`"…gelten\n          für alle {entryMany}."` *Am Bildschirm fällt sie nicht auf;
HTML zieht solchen Weißraum zusammen, und keiner dieser Werte landet in einem
Attribut, einem Dialog oder im Server.* **Aber die drei Dateien sind sich darin
längst uneins: Deutsch 93 Werte, Englisch 101, Türkisch 4.** *Nur vier Schlüssel
tragen sie in allen dreien.* **Der türkische Übersetzer hat sie einfach
weggelassen — und nichts ist passiert.** *Damit ist erwiesen, dass sie niemand
braucht; sie ist Rest aus dem Umzug der Sätze ins JSON.*

> **SIE FÄLLT IN DIESER RUNDE MIT**, weil dieselben Zeilen ohnehin angefasst
> werden. **Der Preis steht dazu:** die Wortlautprobe sieht 88 geänderte Werte
> und braucht ihre Buchführung — *das ist der Grund, sie JETZT zu erledigen und
> nicht in einer Runde, die nichts anderes daran tut.*

### VIII · Der Erklärbärsaft — die drei Regeln sind noch nicht angewendet

**0.31.0 hat die beiden genannten Schlüssel angefasst, aber an ihrem INHALT:**
*`card.derivativesWebp` sagte „niemand archiviert sie“ — das war schlicht
falsch, die Vorschaubilder liegen als BLOB in der Datenbank und fahren in jeder
Sicherung mit. `card.storeCaveat` bekam seine Hervorhebung zurück.* **Die drei
Regeln, die der Betreiber am 11. September 2026 mit einer fertigen Fassung
geliefert hat — Stichwort vorn, eine Aussage je Zeile, Herleitung raus — sind
auf KEINE Karte angewendet worden.** *Sie stehen in der Tafel zu 0.31.0 und
warten hier.*

**Regel 3 — die Herleitung ist weg, die Auswirkung bleibt — trifft sechs
Stellen:**

| Schlüssel | die Herleitung, die dort steht |
|---|---|
| `card.storeCaveat` | *„der Kodierer kann mit harten Kanten nichts anfangen“* |
| `card.derivativesWebp` | *„Sie sind bereits verlustbehaftet und lassen sich jederzeit neu erzeugen“* |
| `server.exportTooBig` | *„Eine Exportdatei ist ein einziger Text“* |
| `server.entryTooBig` | **derselbe Satz noch einmal** — siehe Abschnitt III |
| `server.exportGrew` | *„da sie im Arbeitsspeicher erzeugt wird“* — eine **dritte** Begründung für dieselbe Grenze |
| `card.languagesUsersHint` | *„sie lässt sich deshalb nicht aus dem Vorrat nehmen“* |

**Regel 1 und 2 — Stichwort vorn, eine Aussage je Zeile — haben ihren
deutlichsten Fall in `card.resetMailHint`:**

> *„An diese Adresse kann ein Link zum Zurücksetzen des Passworts geschickt
> werden. Ohne Adresse gibt der Admin den Link persönlich weiter. Nach einem
> Passwortwechsel werden alle anderen Sitzungen abgemeldet. Passwort vergessen?
> Ein Admin kann einen Link zum Zurücksetzen erzeugen.“*

**Fünf Aussagen, 307 Zeichen, EIN Absatz** (`public/app.js:9101`) — der längste
Hinweis der ganzen Datei. **Und die letzte Aussage sagt noch einmal, was die
erste schon gesagt hat.** *Wer wissen will, was ein Passwortwechsel mit seinen
Sitzungen macht, liest vier Sätze, die ihn nichts angehen.*

### IX · Und was von Gruppe 3 übrig ist — weniger, als dort steht

**Die Fragetafel von 0.31.0 führt sieben Hauswörter als offene Entscheidungen.
Am 13. September 2026 sind alle sieben im Bestand nachgeschlagen worden, und
das Ergebnis ist ein anderes:**

| Wort | im Deutschen | im Englischen |
|---|---|---|
| **„Das Haus verlassen“** | **weg** — 0.31.0 hat es abgeräumt | **steht noch**: `card.exportPartsHint` sagt *„one file that leaves the house“* |
| **„Sache“** | **weg** | **weg** |
| **„Standbild“** | **weg** — heißt jetzt „Video-Vorschaubild“ | **steht noch**, an **vier** Schlüsseln: `server.stillNoPreview`, `stillNotImage`, `videoNeedsStill`, `videoStill` |
| **„Wie das Gerät“** | **weg** — heißt jetzt „Auto“ | **steht noch**: `card.likeDevice` = *„Like the device“* |
| **„Pille“ / „hap“** | **war nie auf dem Bildschirm** — der Hausbegriff lebt nur in den Kommentaren von `public/app.js` | dort ebenfalls nicht |
| **„von Hand“** | **bleibt** — sechs Stellen, und es ist gewöhnliches Deutsch und kein Bild | — |
| **„Note“** | **offen** — siehe Abschnitt V, und es ist die **einzige** Entscheidung, die hier noch aussteht | — |

> **DAMIT IST GRUPPE 3 NICHT MEHR, WAS SIE WAR.** *Der Fahrplan führt sie als
> „rund fünfzehn Entscheidungen, von denen jede alle drei Dateien zugleich
> ändert“ — tatsächlich sind sie im Deutschen **schon gefallen**, in 0.31.0.*
> **Übrig bleibt EINE deutsche Entscheidung („Note“) und sechs englische
> Schlüssel, die dem Deutschen nachziehen müssen.** *Die sechs sind keine
> Entscheidung mehr, sondern Arbeit — und sie gehören damit in 0.31.2 und nicht
> hierher.*

### X · Drei Befunde vom Augenschein, die noch nicht gebaut sind

**Sie sind am 13. September 2026 mit dem Betreiber Frage für Frage
durchgegangen und entschieden worden.** *Vier Schlüssel, drei Befunde — gebaut
ist keiner davon, weil 0.31.0 zu dem Zeitpunkt schon abgeschlossen war.*

| | Schlüssel | warum |
|---|---|---|
| **1** | `entry.linkInputHint` | **Der Platzhalter passt nicht ins Feld.** *Gemessen am laufenden Server: der Text misst **270 Pixel**, das Feld ist **211** breit — er steht schon heute abgeschnitten da.* Der Nachbar (`entry.tagInputHint`, 193 Pixel) passt auf den Punkt |
| **2** | `login.requestAccessHint` | *Der Betreiber:* „irgendwie kurz formulieren. schlag mal was prägnentes vor“. **Der Satz nennt zwei Schritte in voller Länge, wo einer schon aus dem Wort „bestätigen“ folgt** |
| **3** | `mail.hintAlways` **und** `mail.hintGmx` | **Der GMX-Hinweis steht immer da — auch, wenn GMX gar nicht gewählt ist.** *Der Betreiber:* „z.b. ind er türkei gibt es kein gmx … die dneken sich ja und!“ **Entschieden: der Dauerhinweis wird allgemein, die Anbietersache wandert zum Anbieter** — wo sie ohnehin schon steht und nur erscheint, wenn sie jemanden angeht |

> **DER DRITTE IST DER LEHRREICHE.** *Ein Hinweis, der immer steht, darf nur
> sagen, was immer gilt.* **Sobald er einen Anbieter nennt, ist er für alle
> anderen Rauschen** — und `mail.hintGmx` gibt es bereits, samt der Bedingung,
> unter der er erscheint.

### Was die Runde anfasst

`public/app.js`, die drei Sprachdateien, `tools/keys.json`, der Prüfstand und
die Gegenproben. **Kein Schemaanteil.**

---

## 0.32.0 — „Einen anderen markieren" — **GEBAUT am 14. September 2026**

> **DER ABSCHNITT BLEIBT WÖRTLICH STEHEN.** *Er sagt, was zu bauen war und
> welche Fragen die Runde zu beantworten hatte; WAS daraus geworden ist, steht
> im Änderungsprotokoll 0.32.0.* **Die Antworten in einer Tafel:**
>
> | Frage des Abschnitts | wie sie ausgegangen ist |
> |---|---|
> | **Wer darf markiert werden?** | **Jeder Zugang.** *Die Frage nach der Sichtbarkeit stellt sich nicht: der Bestand ist gemeinsam, es gibt keine Einträge, die ein Zugang nicht sehen dürfte* |
> | **Wie wird getippt?** | **Freier Text mit `@`** — *und der genannte Preis fällt weg: ein Tippfehler zeigt nicht ins Leere, er wird gar nicht erst eine Markierung und bleibt sichtbar gewöhnlicher Text* |
> | **Zeigt die Glocke zwei Zahlen oder eine?** | **Eine Zahl, eine geteilte Tafel** *(F3)* |
> | **Was geschieht bei der Umbenennung?** | **Die Zugangsnummer wird gespeichert** — *ein umbenannter Zugang steht unter seinem HEUTIGEN Namen da* |
> | **Und ein gelöschter Zugang?** | **„Gelöschter Benutzer 7"** — *der Name kommt aus der Nummer, nie aus dem Text* |
> | **Nur die Glocke — oder auch eine Mail?** | **Nur die Glocke** |
> | **Wie sieht die Markierung im Bearbeitenmodus aus?** | **`@bert` bleibt `@bert`** — *dort steht der Rohtext* |
> | **Gilt die Handwahl je Sortierung oder für die Sitzung?** | **Für die Sitzung**, wie bisher — *was die Runde ändert, ist nicht die Regel, sondern dass sie dasteht* |
> | **Sagt die Oberfläche, wie man zurückkommt?** | **Jetzt ja** — *„von Hand gewählt", und der Satz dazu nennt „Filter zurücksetzen"* |
> | **Reicht EIN Wort?** | **Nein** — *es heißt jetzt „folgt der Sortierung: Ungetestet"* |
> | **Was ist mit den gespeicherten Ansichten?** | **Unverändert**: *eine angewandte Ansicht ist eine ausdrückliche Wahl und setzt `STATUS_BY_HAND`, wie ein Klick* |
>
> **UND EINE ENTSCHEIDUNG IST ANDERS AUSGEFALLEN, ALS DER AUFTRAG SIE
> AUFGESCHRIEBEN HAT:** *F2 sagt „SPALTE", und gebaut ist eine
> **Verknüpfung** (`comment_mentions`).* **Der Kern von F2 steht unverändert —
> gespeichert wird die NUMMER und nicht der Name —; was nicht trägt, ist die
> Form:** *ein Kommentar markiert mehrere („@anna @bert schaut mal"), und eine
> Spalte trüge genau einen davon. Dieselbe Bauform wie `item_tags`.*

**BESTELLT AM 12. SEPTEMBER 2026, WÄHREND 0.30.0 GESCHRIEBEN WURDE.**
*Der Betreiber wörtlich:* **„pack bitte ins roadmap, eventuell in den 0.32.0,
das mit dem in kommentaren, berichten und notizen, aufgaben das man ein user
markieren kann mit @username so das er deutlich hervorgehoben wird und auch eine
benachrichtigung in der glocke bekommt."**

**DAS IST GENAU DER FALL, FÜR DEN DIESER PLATZ FREIGEHALTEN WURDE** *(die
Begründung dafür steht unten und bleibt wörtlich stehen)*: **eine Funktion, aus
dem Betrieb bestellt, nach dem Einspielen einer Runde** — *und keine Reparatur,
die an ihrer eigenen Runde hängen müsste.*

### Was gebaut wird

| | |
|---|---|
| **1** | **`@name` in einem Kommentar MARKIERT einen Zugang.** *Die vier Arten sind dieselben, die der Betreiber genannt hat und die die Instanz kennt: **Notiz, Bericht, Aufgabe, erledigte Aufgabe** (`kind`).* **Eine fünfte Stelle gibt es nicht** |
| **2** | **Die Markierung steht deutlich da** — hervorgehoben wie ein Treffer der Suche, aber als eigene Sache erkennbar |
| **3** | **Der Markierte bekommt eine Glocke** — und zwar **er**, nicht jeder |
| **4** | **Ein gelöschter Zugang steht in Klammern** — *„Gelöschter Benutzer 7"; das Programm baut diesen Text schon* |

### Was daran NICHT trivial ist — drei Sachen, und die dritte entscheidet über die Nummer

**ERSTENS: DIE GLOCKE IST HEUTE NICHT PERSÖNLICH.** *Sie zählt, was an einem
Eintrag neu ist, den man sehen darf — `bellNew()` summiert `newComments` und
`newRatings` über alle Einträge (`public/app.js:3040`), und der Bezugspunkt ist
eine persönliche Einstellung (`bellSeen`, `server.js:2613`).* **Eine Markierung ist
etwas anderes: sie gilt EINEM.** *Die Glocke bekommt damit zum ersten Mal eine
zweite Art Eintrag — und die Frage, ob sie zwei Zahlen zeigt oder eine, ist
keine Kleinigkeit.*

**ZWEITENS: DER TEXT WIRD NICHT NACHBEARBEITET.** *Seit 0.18.0 entsteht der
Kommentartext als **echte Knoten** und nie als String —
`buildCommentNodes(splitCommentText(text, term))` (`public/app.js:7979`).* **Die
Markierung ist ein VIERTES Stück dieser Zerlegung** und kein `replace()` über
das Ergebnis. *Wer das umdreht, holt sich Markup in einen Text, der ausdrücklich
keines tragen darf.*

**DRITTENS — UND HIER LIEGT DER HAKEN: WAS PASSIERT, WENN DER ZUGANG WEG IST?**
*Eine Markierung, die als `@bert` im Text steht, trägt einen NAMEN.* **Und ein
gelöschter Name wird FREIGEGEBEN** — *`card.deleteUserHint` sagt es wörtlich:
„der Name wird frei".*

> **DER PREIS IST DAMIT NICHT „ZEIGT AUF NIEMANDEN", SONDERN „ZEIGT AUF DEN
> FALSCHEN".** *Ein zweiter Mensch kann den Namen längst tragen, und niemand
> sieht es.* **Genau deshalb schickt der Server den Grabsteinnamen seit 0.24.4
> nicht mehr hinaus** *(`authorCard()`, `server.js:3816`: „Er ist freigegeben
> und kann laengst einem anderen Menschen gehoeren")*, **und die Oberfläche
> baut aus der NUMMER „Gelöschter Benutzer 7"** *(`authorName()`,
> `public/app.js:2044` → `list.deletedUser`)*.
>
> **EIN WEG OHNE SCHEMA IST GEPRÜFT UND VERWORFEN** *(14. September 2026)*:
> *„Kommentare, die neuer sind als mein Bezugspunkt und meinen Namen tragen"
> wäre eine ABFRAGE und keine Tabelle — dieselbe Bauform, aus der die Glocke
> heute besteht.* **Sie scheitert an zwei Stellen:** *der freigegebene Name
> zeigt auf den Falschen, und „Gelöschter Benutzer 7" ist aus einem Namen gar
> nicht zu bilden — der Schlüssel verlangt die Nummer.*
>
> **ALSO DIE ZUGANGSNUMMER, UND DAS IST EIN SCHEMASCHRITT.** *Er kollidiert mit
> dem, was 0.29.0 angekündigt hat — „Dies ist die letzte Runde, die das Schema
> anfassen darf" —, und **genau deshalb fällt er in 0.32.0**: der Bruch auf
> 0.33.0 steht unmittelbar dahinter, und danach kommt keine Spalte mehr dazu.*
> **Die Bestätigung gehört in die Fragetafel jener Runde** *(F2)*.

### Die Glocke muss unterscheiden können — entschieden am 13. September 2026

> **DER BETREIBER, WÄHREND 0.31.0 DURCHGESPROCHEN WURDE:** *„bitte für 32.0 wo
> der @name dazu kommt soll die glocke diese unterscheidung machen können"*

**DAMIT FÄLLT FRAGE 3 DER TAFEL UNTEN SCHON HIER.** *Die Glocke bekommt die
Unterscheidung — ob als zwei Zahlen am Symbol oder als eine Zahl über einer
geteilten Tafel, entscheidet die Runde; dass unterschieden wird, entscheidet sie
nicht mehr.*

**DER BEFUND, DER DAZU GEFÜHRT HAT, IST GRÖSSER ALS DIE MARKIERUNG — und er ist am 13.
September 2026 am laufenden Stand nachgesehen:** *die Glocke zeigt heute alles,
was im GANZEN Bestand neu ist. `qNewComments` (`server.js:4634`) filtert einzig
auf `user_id IS NOT ?` — das eigene Zutun fällt heraus, sonst nichts.* **Der
Betreiber hat gefragt, warum er die Kommentare anderer überhaupt sieht, und ob
er unterscheiden kann, was unter seinen Einträgen steht und was allgemein neu
ist.** *Er kann es nicht. Der Bestand ist gemeinsam, die Glocke ist es auch, und
der Satz im Fenster sagt das nicht.*

| | was daraus für diese Runde folgt |
|---|---|
| **1** | **Die Markierung ist die eine Hälfte** — `@name` gilt EINEM, und sie gehört sichtbar getrennt von dem, was jeden angeht |
| **2** | **Die andere Hälfte ist schon da und ungetrennt** — was unter MEINEN Einträgen geschieht, steht heute zwischen allem anderen. `items.user_id` trägt den Anleger, die Abfrage nutzt ihn nicht |
| **3** | **Der Satz im Glockenfenster bekommt seinen endgültigen Wortlaut HIER** — *„Neue Kommentare und {ratingMany} anderer Benutzer, seit du diese Liste zuletzt geöffnet hast."* ist sachlich richtig und beantwortet die Frage nicht, die sich der Leser stellt. **0.31.0 hat ihn ausdrücklich stehen lassen**, weil er in dieser Runde ohnehin ersetzt wird — zweimal zu schreiben, was einmal reicht, wäre die teurere Runde |

> **UND DIE WARNUNG WEITER UNTEN GILT UNVERÄNDERT:** *keine zweite Wahrheit neben
> der Glocke (Stolperstein 47).* **Unterscheiden heißt nicht zweimal zählen** —
> dieselbe Ableitung, nach Herkunft getrennt.

### Und „Filter folgt der Sortierung“ wird herausgearbeitet — dazugekommen am 13. September 2026

> **DER BETREIBER, WÄHREND 0.31.0 DURCHGESPROCHEN WURDE:** *„die ‚funktion
> filter folgt der sortierung' herausarbeiten auch ins 0.32.0 nicht mehr in
> 31er"*

**DIE FUNKTION GIBT ES SEIT 0.21.1, UND SIE IST FAST UNSICHTBAR.** *Wer nach
`{ratingOne}` sortiert, fragt „was war gut?" — und das haben nur getestete
Einträge beantwortet; wer nach `{potential}` sortiert, fragt „was mache ich als
Nächstes?", und das fragt sich nur an Ungetesteten.* **Die Sortierung setzt den
Statusfilter deshalb als VORGABE.** *Am 13. September 2026 am Stand
nachgesehen:*

| | wie es heute steht |
|---|---|
| **Die Tafel** | `SORT_STATUS` — `rating_*` → Getestet, `potential_*` → Ungetestet. Jede andere Sortierung fasst den Status nicht an |
| **Die eine Stelle** | `statusOutSort()` (`public/app.js:2458`); Liste und Leiste fragen sie und rechnen nicht je selbst |
| **Was man davon SIEHT** | **ein Wort** — „folgt der Sortierung", neben den Statuspillen und am zugeklappten Schalter. Sonst nichts |
| **Gezählt wird sie nicht** | `filterNumber()` lässt sie ausdrücklich aus: die Farbe der Zahl sagt „du hast etwas eingestellt", und eingestellt hat das niemand |

**DIE HARTE KANTE IST `STATUS_BY_HAND`** *(`public/app.js:2424`)*: **ein einziger
Klick auf eine Statuspille schaltet die Ableitung für die GANZE SITZUNG ab** —
nicht nur für diese eine Sortierung. *Zurück kommt sie allein über „Filter
zurücksetzen" (`public/app.js:4418`), und dass dieser Knopf auch die Automatik
zurückholt, steht nirgends.* **Eine kleine Handlung mit einer großen,
unsichtbaren Folge.**

### Und zwei Befunde aus der Filterzeile — entschieden am 13. September 2026

**Beide stammen aus dem Augenschein zu 0.31.0, und beide sind KEINE Sprache.**
*Sie fahren hier und nicht in der 31er, weil diese Runde die Filterzeile ohnehin
in der Hand hat — zweimal dieselbe Zeile anzufassen wäre die teurere Reihenfolge.*

**1 · „+ Ansicht speichern“ sieht aus wie eine gespeicherte Ansicht.** *Der
Betreiber:* „Ansicht speichern wirkt wie ein auswahl eines gespeicherten
ansicht. den am besten nur als text … nicht als (pillen)schaltfläche“.
**Er hat recht, und der Quelltext sagt warum:** `public/app.js:4363` gibt dem
Knopf `className = 'pill'` und hängt ihn in **dieselbe** Zeile wie die
gespeicherten Ansichten. *Eine Pille neben Pillen liest sich als eine von
ihnen.* **Entschieden: er wird `.link-btn`** (`public/style.css:934`) — *und das
führende „+“ bleibt, denn es ist das einzige Zeichen, das ihn heute schon als
Befehl und nicht als Auswahl ausweist.*

**2 · Der „Mehr“-Aufklapper lohnt sich nicht auf jeder Breite.** *Der Betreiber:*
„wenn dder satz von mehr nur eine einzige satz ist brauchen wir kein mehr
knopf“. **Gemessen am laufenden Server, an allen acht Stellen:**

| | was der Aufklapper spart |
|---|---|
| **am Telefon** | **42 bis 82 Pixel — an allen acht.** Er lohnt sich überall |
| **am Rechner** | **42 bis 62 Pixel an sechs** — und **1 bzw. 21 Pixel an den beiden kurzen** |

> **EIN KNOPF, DER EINEN PIXEL SPART, KOSTET MEHR, ALS ER BRINGT.**
> *Entschieden: der Aufklapper wird breitenabhängig — am Telefon bleibt er
> überall, am Rechner fällt er dort weg, wo der Text ohnehin in eine Zeile
> geht.* **Die Zahl, ab der er sich lohnt, gehört in den Quelltext und nicht in
> die Sprachdatei — sie ist keine Sprache.**

### Und „Note" wird ein Vokabelwort — entschieden am 13. September 2026

**SIE STAND SEIT 0.31.0 OFFEN und ist jetzt entschieden — mit der Nummer
hierher.** *Der Betreiber:* „Mir wäre lieber A, also daraus Vokabel zu machen.
Da das ja je nach nicht eine Note sondern Ergebnis sein kann, Tageswert,
Tagesschnitt, Experiment — was auch immer."

**DER BEFUND, DER SIE AUSGELÖST HAT.** *In der Detailansicht steht im Block
`{dayMany}` (`public/app.js:7627`):*

```
[ Datum ]   Note:  ★ ★ ★ ★ ★   [ Hinzufügen ]
```

| | |
|---|---|
| **1** | **„Note" trägt eine Richtung, und es ist die falsche.** *Eine deutsche Note läuft abwärts — die **1** ist die beste. Sterne laufen aufwärts.* **`server.gradeRange` sagt wörtlich „Die Note muss zwischen 1 und 5 liegen"**, und wer das als Schulnote liest, hält die 5 für fast das Schlechteste. Gemeint ist das Beste |
| **2** | **Es ist die einzige Zahl im Programm ohne Vokabelwort.** *Die Blockkopfzeile nennt `V.dayMany`, der Nachbarblock `V.ratingOne` — beide umbenennbar. „Note:" steht fest in der Sprachdatei. Wer „Testtag" in „Messung" umbenennt, liest weiter „Note:"* |

> **EINE BERICHTIGUNG, DAMIT SIE NICHT WIEDERKOMMT.** *Beim ersten Vortrag ist
> behauptet worden, „Note" und „Bewertung" seien dieselbe Sache unter zwei
> Namen.* **Das ist falsch.** *Es sind zwei Tabellen:* `test_days.rating` ist
> **eine** Zahl für einen ganzen Testtag und heißt „Note"; `ratings.value` ist
> ein Wert **je Kriterium** und trägt das Vokabelwort `ratingOne`
> („Bewertung"). **Sie gehören nicht zusammen.**

### Was es kostet — am Quelltext nachgesehen, nicht geschätzt

**DREI SACHEN, DIE MAN ERWARTEN WÜRDE, FALLEN WEG:**

| | |
|---|---|
| **Schema** | **keins.** Das Vokabular liegt als JSON unter `settings.vocabulary` und nicht als Spalten |
| **Migration** | **keine.** `vocabulary()` (`server.js:2387`) läuft über die Schlüssel der **Sprachdatei** und nicht über das Gespeicherte — ein fünfzehntes Wort erscheint in jeder bestehenden Installation von selbst mit seiner Vorgabe, weil das Gespeicherte dafür keinen Eintrag hat und durchfällt |
| **Austauschformat** | **unberührt.** Der Export trägt das Vokabular gar nicht; `EXCHANGE_FORMAT` bleibt **16** |

**WAS ES WIRKLICH ANFASST:**

| | |
|---|---|
| Sprachdateien | **zwei** Schlüssel je Datei: das Wort und seine Beschriftung in der Vokabelkarte |
| `public/app.js` | `VOCABULARY_FIELDS` bekommt `v15`; **zehn** Schlüssel mit „Note" an **zwölf** Rufen |
| `server.js` | einer — `server.gradeRange` |
| **Der Prüfstand** | **zwölf Zusagen halten die Zahl VIERZEHN fest**, dazu 37 Stellen, die „vierzehn" in Prosa sagen |

> **DIE ZWÖLF SIND DER EIGENTLICHE AUFWAND, und sie werden GEDREHT und nicht
> entfernt.** *0.22.0 hat dieselbe Zahl schon einmal von zwölf auf vierzehn
> gedreht und es ausdrücklich notiert: **„umgedreht mit 0.22.0 und nicht
> gelöscht (Stolperstein 74)"**. Eine Zahl, die still wächst, fällt sonst
> niemandem auf.*

**MEHRZAHLFORM BRAUCHT ES NICHT.** *Alle zehn Stellen stehen im Singular — ein
Wort statt eines Paares, anders als bei den sechs Paaren davor.*

### Die eine Stelle, die dabei umformuliert werden MUSS

**EIN FREIES WORT DULDET KEIN ADJEKTIV VOR SICH.** *Heute steht:*

> `list.sortLast` = **„Letzte Note"**

*Mit einem gewählten Wort wird daraus „Letzt**er** Tageswert", „Letzt**es**
Ergebnis", „Letzt**es** Experiment" — das Geschlecht wechselt mit dem Wort, und
die Sprachdatei kann es nicht wissen.* **Die Sortierbeschriftung wird
artikellos**, etwa „Zuletzt: {wort}".

> **DIESE STELLE GIBT ES SCHON EINMAL, und sie bleibt als Befund stehen:**
> `server.entryTooBig` sagt **„Dieser {entryOne} ist als Datei zu groß"** — wer
> „Eintrag" in „Maschine" umbenennt, liest „Dieser Maschine".
> *Gegengeprüft und NICHT betroffen ist `entry.deleteHint` („Dieses {word} wird
> endgültig gelöscht"): dort stehen nur „Foto" und „Video", beide sächlich und
> beide feste Beschriftungen.*

### Warum hierher und nicht in die 31er

| | |
|---|---|
| **1** | **Es ist keine Sprachpflege, sondern eine Funktion.** *Der Benutzer bekommt ein neues Feld in einer Karte.* **Die 31er-Strecke ist ausdrücklich Sprache** — 0.31.1 spränge von PATCH auf MINOR |
| **2** | **Diese Runde ist ohnehin MINOR und hat Schemaanteil offen.** *Das fünfzehnte Wort kostet hier in Versionsbegriffen **nichts extra*** |
| **3** | **Es muss vor 0.33.0 liegen**, und das tut es. *Nach dem Bruch ist die Struktur festgeschrieben* |
| **4** | **Und es macht 0.31.2 und 0.31.3 keine Doppelarbeit.** *Ein Vokabelwort bringt seine drei Vorgaben immer gleichzeitig mit — es entsteht nichts, was zweimal geschrieben würde* |

**DAMIT HAT 0.31.1 KEINE OFFENE FRAGE MEHR.** *F12 jenes Auftrags ist
gestrichen und zeigt hierher.*

### Was diese Runde daran zu klären hat

| | Frage |
|---|---|
| **1** | **Gilt die Handwahl je SORTIERUNG oder für die ganze Sitzung?** *Heute für die Sitzung. Je Sortierung wäre das, was ein Mensch erwartet — kostet aber einen Merker je Sortierung statt eines einzigen* |
| **2** | **Sagt die Oberfläche, wie man zurückkommt?** *Heute nicht. „Filter zurücksetzen" holt die Automatik mit zurück, und das weiß niemand* |
| **3** | **Reicht EIN Wort?** *„folgt der Sortierung" sagt, DASS abgeleitet wird, aber nicht WAS — dass gerade nur Getestete in der Liste stehen, erfährt man nur, indem man sie zählt* |
| **4** | **Was ist mit den gespeicherten Ansichten?** *Eine Ansicht trägt eine Filterstellung UND eine Sortierung — welche gewinnt beim Anwenden?* |

> **WARUM SIE HIERHER GEHÖRT UND NICHT IN DIE 31er:** *die 31er fassen Wörter an,
> keine Wirkung.* **Was hier ansteht, ist Verhalten** — wann eine Ableitung
> greift, wie lange eine Handwahl gilt und wie man aus ihr herausfindet. *Ein
> Wort daran zu ändern, ohne das Verhalten zu klären, machte die Auskunft
> genauer und die Sache nicht besser.*

### Was die Runde zu entscheiden hat

| | Frage |
|---|---|
| **1** | **Wer darf markiert werden?** *Jeder Zugang — oder nur, wer diesen Eintrag überhaupt sehen darf?* **Eine Markierung auf jemanden, der die Sache nicht sehen darf, ist eine Auskunft über einen Eintrag, den es für ihn nicht gibt** |
| **2** | **Wie wird getippt?** *Freier Text mit `@` — oder eine Auswahl, die beim `@` aufgeht?* **Freier Text bedeutet Tippfehler, die still ins Leere zeigen** |
| **3** | ~~**Zeigt die Glocke ZWEI Zahlen oder eine?**~~ **DASS sie unterscheidet, ist am 13. September 2026 entschieden** *(siehe oben)*. *Offen bleibt nur die FORM: zwei Zahlen am Symbol, oder eine Zahl über einer geteilten Tafel.* **Zwei Zahlen an einem Symbol sind zwei Sachen an einem Ort; eine Zahl über einer getrennten Tafel sagt dasselbe mit einem Zähler** |
| **4** | ~~**Was geschieht bei der Umbenennung?**~~ **AM 14. SEPTEMBER 2026 GEKLÄRT: es wird die ZUGANGSNUMMER gespeichert** *(siehe oben — der gelöschte Name wird freigegeben und zeigt sonst auf den Falschen).* *Die Bestätigung steht als F2 im Auftrag 0.32.0* |
| **4a** | **Und ein gelöschter Zugang?** **„Gelöschter Benutzer 7", in Klammern** *(Betreiber, 14.9.2026)* — *das Programm baut diesen Text seit 0.24.4 aus der Nummer (`list.deletedUser`)* |
| **5** | **Nur die Glocke — oder auch eine Mail?** **Vorschlag: nur die Glocke.** *Der Betreiber hat die Glocke genannt, und eine Mail je Markierung ist eine Entscheidung mit ganz anderen Folgen* |
| **6** | **Wie sieht die Markierung im BEARBEITENMODUS aus?** *Dort steht der Rohtext im Textfeld — `@bert` bleibt `@bert`, und das ist richtig so* |

> **WAS SIE NICHT WERDEN DARF: eine zweite Wahrheit neben der Glocke.**
> *Stolperstein 47 gilt hier besonders, weil zwei Zähler über dieselbe Sache
> genau der Fall sind, den die Glocke schon einmal hatte und der
> zurückgenommen wurde (`public/app.js:3033`).*

**Schemaanteil: OFFEN** *(siehe „drittens")* — **und das ist der Grund, warum
diese Runde vor 0.33.0 steht und nicht danach.**

---

## Warum dieser Platz frei gehalten wurde

> **DER ABSATZ BLEIBT STEHEN, obwohl der Platz jetzt belegt ist.** *Er erklärt,
> warum es ihn gab — und warum ein Befund aus dem Rundlauf ihn NICHT hätte
> belegen dürfen.*

**WARUM ES KEINE RÜCKKEHR ZUR ALTEN REGEL IST.** Bis zum 8. September 2026 blieb
zwischen **je zwei** geplanten Runden eine Nummer frei; diese Regel ist
aufgehoben worden, und der Grund war gemessen: *fünf Einschübe aus dem Betrieb
hintereinander — 0.24.1 bis 0.24.5 — haben alle eine **PATCH**-Zahl genommen und
keinen freien MINOR-Platz.* **Ein Befund aus dem Rundlauf ist eine Reparatur,
und eine Reparatur hängt an ihrer Runde.** *(Die Runden 0.25.1 und 0.25.2 haben
es am 10. September 2026 ein sechstes und siebtes Mal bestätigt.)*

**Was hier stand, war etwas anderes: EIN Platz an EINER Stelle.** Nicht für eine
Reparatur, sondern für das, was aus dem Rundlauf kommt und **mehr** ist als
eine — eine Funktion, ein Befund mit Schemaanteil, eine Runde, die jemand nach
dem Einspielen einer anderen bestellt. **Ab dem Bruch geht das nicht mehr ohne
Weiteres:** er schreibt die Struktur fest und sagt alten Beständen ab.

> **ER IST AM 12. SEPTEMBER 2026 BELEGT WORDEN, vier Tage nachdem er angelegt
> wurde — und genau mit der Sorte Sache, für die er da war.** *Eine Funktion,
> aus dem Betrieb bestellt, mit möglichem Schemaanteil.* **Hätte es ihn nicht
> gegeben, stünde jetzt die Wahl an, den Bruch zum vierten Mal zu verschieben.**

---

## 0.33.0 — „Bereinigung — der Bruch" — **GEBAUT am 14. September 2026**

> **DIE ZAHL WAR FALSCH, UND ZWAR ÜBERALL: ES WAREN ACHTZEHN.** *Dieses Papier
> sagte „zwölf", die Tafel oben sagte „zwölf", und der Prüfstand hielt
> `check('Es gibt genau zwoelf Migrationsfunktionen')` — **alle drei zählten
> dasselbe Muster**, die einzeilige Marke `// MIGRATION 0.21.0 — ENTFAELLT MIT
> 1.0`.* **Die sechs Blöcke der Sprachrunde 0.24.x tragen ihre Absage im
> BLOCKKOMMENTAR**, auf einer eigenen Zeile darunter — *und das Muster fand sie
> nicht.* **Stolperstein 156 in Reinform, nur diesmal war der ZÄHLER der
> Betroffene.** *Der Zähler ist deshalb nicht bloß umgedreht, sondern zuerst
> berichtigt worden: er liest jetzt BEIDE Formen, und die Gegenprobe steht
> gestellt daneben.*

Migrationscode raus — **achtzehn Blöcke, 945 Zeilen** *(`db.js` geht von
2145 auf 1474)* —, die
Datenbankstruktur festgeschrieben, **kein Rückweg auf ältere Fassungen.**
*Ein Bruch — solange die erste Zahl 0 ist, läuft er über MINOR.*

> **UND DIE ABSAGE IST KEINE GEWORDEN.** *Der erste Entwurf ließ die Instanz
> nicht öffnen; der Betreiber hat ihn am 14. September 2026 gekippt.* **Was
> gebaut ist, ist ein HINWEIS:** *ein Kasten im Protokoll, der jede fehlende
> Spalte samt ihrer Fassung nennt — und die Instanz startet trotzdem.* **Eine
> Probe, die sich irren kann, darf niemanden aussperren.** *Die einzige
> Abweisung der Runde liegt an der Exportdatei und nicht am Start.*

> **WAS DER GEBAUTE STAND AUSSERDEM GEBRACHT HAT — und es stand in keinem
> Auftrag:** *die Blöcke wegzunehmen genügt nicht.* **An drei Stellen stirbt der
> Start an einer fehlenden Spalte**, und zwar an einem `db.prepare`, das schon
> beim VORBEREITEN scheitert: *die beiden Indizes auf `photos`, der Rückfall
> (`links.user_id`, `attachments.user_id`) und die mitgelieferten Kriterien
> (`rating_criteria.language`).* **Das wäre die gekippte Absage gewesen — nicht
> als Entscheidung, sondern als Absturz.** *Gefunden hat es der umgedrehte
> Prüfstand, an derselben Prüflage, die bis 0.32.1 den Block belegt hat.*

### Und die JPEG-Vorschaubilder fallen mit — entschieden am 13. September 2026

> **DER BETREIBER:** *„wenn diese funktion nur deswegen existiert weil vorher die
> vorschaubilder mit jpg gemacht wurden und wir nun seit einiger zeit webp
> nutzen muss der code dafür und auch dieser hinweis nach dem … migrationsrunde
> raus"*

**ER HAT RECHT, UND ES IST NACHGESEHEN.** *`images.js:135` sagt es im Klartext:
„BIS 0.26.0 WAREN SIE JPEG". Seit 0.27.0 sind die Vorschaubilder WebP.* **Der
Bestandslauf prüft in `batchrun.js:189`:**

```js
const fresh = (isJpeg(z.thumb) || isJpeg(z.medium))
  ? await makeVariants(z.data, cropFrom(z)) : null;
```

**Diese Hälfte des Knopfes kann nur in einer Installation greifen, die VOR 0.27.0
Fotos hochgeladen hat.** *In einer frischen Instanz ist sie toter Code — und sie
ist damit Migrationsschuld wie ein Migrationsblock, nur ohne Marke.*

**DER KNOPF BEHÄLT SEINE ERSTE HÄLFTE.** *Originale nach einem Wechsel des
Ablageverfahrens umstellen — das ist dauerhaft sinnvoll und fällt nicht.*

| was fällt | wo |
|---|---|
| die `isJpeg`-Abfrage und der zweite Zweig des Laufs | `batchrun.js` |
| der Zähler `derived` und seine Hälfte des Fertigsatzes | `batchrun.js`, `public/app.js` |
| „Ohne PNG bleibt der Knopf bedienbar — die Vorschaubilder bleiben" | `public/app.js`, Prüfstand |
| fünf Sprachschlüssel bzw. ihre zweite Hälfte | `card.catchUpBoth`, `card.catchUpDerivatives`, `card.catchUpAsk`, `card.derivativesAsk`, `card.convertCounts` — **in allen drei Dateien** |

> **UND DER WIDERSPRUCH AN DER KARTE VERSCHWINDET DAMIT VON SELBST.** *Heute
> sagt sie oben „Die Vorschaubilder sind in jedem Fall WebP" und unten
> „Generiert veraltete JPEG-Vorschaubilder neu". Beides stimmt — aber nur, wer
> die Geschichte kennt, sieht keinen Widerspruch, und die Geschichte gehört
> nach Regel 5.6 nicht an den Bildschirm.*
>
> **DIE BEDINGUNG FÜR DAS WEGNEHMEN IST DIESELBE WIE BEI JEDEM
> MIGRATIONSBLOCK:** *jede Installation muss den Lauf EINMAL gefahren haben.
> Wer ihn nie gefahren hat, behält JPEG-Vorschaubilder für immer — sie
> funktionieren weiter, sie sind nur größer.* **Das gehört in die Fragetafel
> jener Runde und ist vor dem Wegnehmen zu klären.**

**0.34.1 — „Die Kommentare werden knapp".** **GEBAUT am 16. September 2026** —
Änderungsprotokoll 0.34.1. Die Tabellen und Zahlen unten sind der Stand **vor**
der Runde und bleiben als solcher stehen; gemessen ist danach
**14.170 von 73.827 Zeilen (19,2 %)** über 34 Dateien.

*(Stand hier bis zum 15. September
2026 als 0.33.x. Mit dem Bauen von 0.34.0 ist eine 0.33.x nicht mehr möglich,
und der Auftrag dazu hieß seit dem 15. September `Doku/Auftrag_0.34.1.md` *(weggefallen — es liegt immer nur einer im Repo)*.
Zwei Papiere über dieselbe Runde dürfen nicht zwei Nummern tragen —
Stolperstein 47.)* **38 % des Quelltextes sind Kommentar.** Was der Code eine Zeile weiter selbst sagt, wird entfernt. Was eine
Entscheidung begründet, wandert vorher in den Projektstand und bleibt als
Verweis stehen. Die Runde läuft nach 0.33.0 und nicht davor: die Bereinigung hat
ganze Blöcke samt ihren Kommentaren entfernt.

**Nachgemessen am 15. September 2026 nach 0.33.2**, mit derselben Funktion,
die der Prüfstand dafür benutzt (`onlyComments`), über die **14** Dateien aus
`LANGUAGE_SOURCES`. **Die Tabelle ist mit 0.34.0 überholt:** `testbench.js`
liegt seit dem Umzug in `test/`, und die Zeilen verteilen sich auf 20 Dateien.
Sie wird zu Beginn von 0.34.1 neu gemessen:

| Datei | Zeilen | davon Kommentar | Anteil |
|---|---:|---:|---:|
| `testbench.js` | 56.787 | 20.007 | 35 % |
| `public/app.js` | 13.985 | 5.468 | 39 % |
| `counterproof.js` | 10.680 | 3.210 | 30 % |
| `server.js` | 9.182 | 4.908 | **53 %** |
| `auth.js` | 1.850 | 874 | 47 % |
| `db.js` | 1.474 | 572 | 39 % |
| `images.js` | 634 | 476 | **75 %** |
| `batchrun.js` | 489 | 310 | **63 %** |
| `mail.js` | 365 | 181 | 50 % |
| `attachments.js` | 364 | 154 | 42 % |
| `keytool.js` | 324 | 70 | 22 % |
| `keys.js` | 275 | 117 | 43 % |
| `usertool.js` | 254 | 51 | 20 % |
| `twofactor.js` | 223 | 106 | 48 % |
| **alle 14** | **96.886** | **36.504** | **38 %** |

> **DIE ERSTE FASSUNG DIESER TABELLE ZÄHLTE DREIZEHN DATEIEN UND WAR DAMIT
> SCHON BEIM SCHREIBEN UNVOLLSTÄNDIG** *(96.241 Zeilen, 36.144 Kommentar).*
> `mail.js` *kam mit 0.33.1 in* `LANGUAGE_SOURCES` — *die Datei stand bis dahin
> außerhalb jeder Sprachprüfung und fehlte deshalb auch in der Messung. Sie
> trägt 365 Zeilen, davon 181 Kommentar.* **Der Rest der Bewegung sind 0.33.1
> und 0.33.2 selbst.**

**Die bisherige Zahl im Plan war 16.281 von 54.822 Zeilen, also 30 %.** Sie
wurde am 31. August 2026 über zwölf Dateien gemessen und stand hier unverändert
über fünf Runden. Seitdem ist das Projekt um 41.419 Zeilen gewachsen, und der
Kommentaranteil ist von 30 % auf 38 % gestiegen. Die beiden Messungen sind nicht
exakt vergleichbar: die alte zählte zwölf Dateien, die neue dreizehn, und welche
zwölf es waren, lässt sich nicht mehr feststellen — die Git-Historie dieses
Repositories reicht nur bis zum 7. September 2026 zurück.

**Die drei Dateien mit dem höchsten Anteil sind `images.js` (75 %),
`batchrun.js` (63 %) und `server.js` (53 %).** Dort fängt die Runde an.

### Zwei Auflagen aus 0.33.1 und 0.33.2

Beide Patches kamen aus dem Betrieb, und beide haben etwas gelernt, das diese
Runde betrifft.

**1. Eine benannte Ausnahme ist keine entschiedene.** 0.33.2 hat elf deutsche
Sätze aus dem Containerprotokoll geholt, die namentlich in `SERVER_REST_NAMED`
standen — mit einer Begründung, die 0.33.0 selbst umgestoßen hatte. Wer beim
Bauen die Liste las, fand zu jedem Eintrag einen Grund und ging weiter.

> **Für diese Runde heißt das:** sie kürzt Kommentare, und Kommentare sind der
> Ort, an dem solche Begründungen stehen. **Ein Kommentar, der eine Ausnahme
> trägt, ist kein Kandidat zum Kürzen, bevor jemand geprüft hat, ob seine
> Voraussetzung noch gilt.** Das ist genau die Art Zeile, die in den
> Projektstand wandert und als Verweis stehen bleibt.

**2. Was eine Textprobe grundsätzlich nicht sehen kann.** 0.33.1 und 0.33.2
haben dieselbe Lücke zweimal getroffen: die Restproben lesen den Quelltext, und
was zur Laufzeit als Wert hereinkommt, sehen sie nicht.

> **Für diese Runde heißt das:** die Wächter, die nach dem Kürzen noch grün
> sind, belegen weniger, als sie zu belegen scheinen. **Wer einen Kommentar
> entfernt, der eine Zusage begründet, prüft am gebauten Stand und nicht an der
> grünen Zahl.**

### Dazu: die Zeilenverweise im Fahrplan stimmen nicht mehr

**Alle 24 Verweise der Form `datei.js:1234` in diesem Dokument zeigen auf die
falsche Zeile** — geprüft am 15. September 2026. Beispiel: `buildDom()` steht
nicht mehr in `testbench.js:27055`, sondern in Zeile 28161.

Die Ursache ist nicht ein Fehler beim Schreiben. Eine Zeilennummer veraltet bei
jeder Runde, die oberhalb der Stelle etwas einfügt. Der Verweis ist damit als
Bauform ungeeignet.

**Vorschlag für diese Runde:** Zeilennummern durch Funktions- oder
Konstantennamen ersetzen (`buildDom()` in `testbench.js` statt
`testbench.js:27055`). Ein Name veraltet erst, wenn die Sache selbst umbenannt
wird, und dann fällt es beim Suchen auf.

**Nicht in dieser Runde geändert:** die 23 übrigen Verweise stehen in
abgeschlossenen Einträgen mit Datum. Ob sie mit umgestellt werden, entscheidet
der Betreiber.

### Dazu in derselben Runde: CHANGELOG.md und README.md

Beide Dateien sind über 33 Versionen mitgewachsen. Sie haben drei Probleme:

1. **Altlasten.** Sie beschreiben Stände, Migrationen und Bauweisen, die es
   nicht mehr gibt. Beispiel: die 18 Migrationsblöcke, die 0.33.0 aus `db.js`
   entfernt hat, kommen in beiden Dateien noch vor.
2. **Länge.** Derselbe Sachverhalt steht an mehreren Stellen. Das CHANGELOG
   erzählt je Version eine Geschichte statt aufzulisten, was sich geändert hat.
3. **Sprache.** Metaphern und Bilder statt der Sache. Wer das Projekt nicht
   kennt, versteht die Texte nicht.

**Zielzustand:**

- **CHANGELOG.md** — je Version eine Liste: was wurde hinzugefügt, geändert,
  entfernt. Keine Erzählung, keine Bewertung. Alte Einträge werden gekürzt,
  nicht gelöscht: Versionsnummer, Datum und Änderung bleiben nachlesbar. Was an
  Begründung erhalten bleiben muss, steht im Änderungsprotokoll der jeweiligen
  Runde und wird von dort verlinkt.
- **README.md** — was das Programm ist, welche Voraussetzungen es hat, wie man
  es installiert, konfiguriert und betreibt. Kein Projektverlauf; der steht im
  Projektstand.

**Sprachregel für alles, was in dieser Runde angefasst wird:** sachliches
Deutsch, normale Fachbegriffe, keine Metaphern, kein Slang, kein Jargon. Die
Regel und die Gegenüberstellung stehen in `CLAUDE.md` im Wurzelverzeichnis
(Vorgabe des Betreibers, 15.9.2026).

**Offene Frage für die Fragetafel jener Runde:** die Eigennamen `Prüfstand`,
`Gegenprobe`, `Rückbau` und `Stolperstein` sind selbst Bilder. Sie stehen in
Dateinamen und in über 6800 Testnamen. Ob sie bleiben oder in einer eigenen
Runde umbenannt werden, ist vor dem Umschreiben zu entscheiden — sonst wird
zweimal geschrieben.

---

## 0.34.0 — „Der Prüfstand bekommt ein Verzeichnis"

> **GEBAUT am 15. September 2026.** Der Abschnitt darunter ist der Plan von
> vorher und bleibt zum Nachlesen stehen. Was gebaut wurde, steht im
> Änderungsprotokoll 0.34.0.
>
> | | Plan | gebaut |
> |---|---|---|
> | Dateien | ein Modul je Sachgebiet | 17 Module, zwei Rahmen, ein Treiber |
> | Prüfungen | bleibt gleich | 6865 → **6865** |
> | Speicher | kommt nach dem Modul zurück | 2842 MB → **85 MB** im Treiber |
> | Teillauf | an der Zeit gemessen | 350 s → **14 s** über ein Modul |
> | Notnagel | fällt, wenn die Messung es trägt | **gestrichen** |
>
> **Die Zahlen im Abschnitt darunter sind die vom 11. September 2026** (6497
> Prüfungen, 50.210 Zeilen, 196 Fenster). Am 15. September, vor dem Bauen,
> waren es **6865 Prüfungen, 56.787 Zeilen und 210 Fenster** — drei Runden
> später. Gemessen wurde die Runde an den neuen Zahlen.

**`testbench.js` ist EINE Datei mit 56.649 Zeilen**, `counterproof.js`
daneben 10.583 *(gemessen am 15. September 2026; der Plan nannte hier bis dahin
über 43.000 und über 7000 — Stand vor 0.33.0)*. **Sie wird aufgeteilt: ein Verzeichnis `test/`, ein Modul je
Sachgebiet**, der Rahmen als gemeinsames Stück daneben.

**NEU IN DIESER FASSUNG DES PLANS:** *die Aufteilung ist ab jetzt nicht nur
Ordnung, sondern der Zweck* — **erst mit ihr gibt es einen Teillauf, der auch
die Arbeit einschränkt und nicht bloß die Ausgabe.** Die Messung aus 0.30.0
sagt, welche Gruppen zuerst dran sind.

**WAS SIE NICHT TUT:** keine Zusicherung fällt weg, keine wird umgeschrieben,
kein Prüfungsname ändert sich — **die Zahl steht vorher und nachher**, und der
Gegenprobenlauf ist der Beleg.

### Der Speicher — gemessen am 11. September 2026, und er ist der Grund

> **DER LAUF IST AUF DEM LÄUFER GESTORBEN, nicht an einer Prüfung.** *Zweimal
> hintereinander derselbe Abbruch:* `FATAL ERROR: Ineffective mark-compacts near
> heap limit`. **Mit derselben Grenze örtlich nachgestellt — dieselbe Stelle.**

**Der Betreiber hat dazu die richtige Frage gestellt:** *„warum überhaupt so ein
riesige prüfung. müsste man da nicht mal aufräumen"* — **und die Messung
antwortet: die Größe ist es nicht.**

| Minute | Speicher | was währenddessen läuft |
|---|---|---|
| **0 bis 4½** | **43 bis 91 MB** | *Tausende Prüfungen — und sie kosten nichts* |
| **ab 4½** | 404 → 974 → 1613 → 1993 → **2133 MB** | *gleichmäßig steigend, und **nie zurück*** |

**DIE ZAHL DER PRÜFUNGEN IST UNSCHULDIG.** *6497 Prüfungen in 50 210 Zeilen — der
größte Teil davon läuft in fünfzig Megabyte.* **Wer hier Prüfungen löschte,
nähme die Schwelle weg und rührte die Ursache nicht an.**

**DIE URSACHE STEHT IN DER ZWEITEN HÄLFTE: 196 vollständige Browserfenster.**
*`buildDom()` (`testbench.js`, am 15. September 2026 in Zeile 28161) baut je ein ganzes Fenster; 184 davon
werden geschlossen — der Speicher kommt trotzdem nicht wieder herunter.* **Rund
zehn Megabyte je Fenster, und das ist genau die Kurve oben.**

**WAS DAS FÜR DIESE RUNDE HEISST:** *die Aufteilung in Module ist nicht mehr nur
Ordnung und nicht mehr nur die Bedingung für den Teillauf* — **sie ist die
Stelle, an der die Fenster einen Besitzer bekommen, der sie auch wieder
hergibt.** *Ein Modul je Sachgebiet läuft als eigener Vorgang und gibt seinen
Speicher beim Ende zurück; eine einzige Datei kann das nicht.*

> **BIS DAHIN STEHT EIN NOTNAGEL IM PRÜFLAUF** *(`.github/workflows/pruefstand.yml`,
> 11. September 2026)*: der Lauf bekommt ausdrücklich die Speichergrenze, die
> die Entwicklungsmaschine ohnehin hat. **Keine Prüfung fällt dafür weg, keine
> Schwelle sinkt.** *Er ist als Notnagel benannt und zeigt auf diese Runde.*

## 0.35.0 — „Code-Effizienz"

Leichen und ineffizienten Code durchgehen und verbessern. **Nach der Bereinigung
und nach der Aufteilung**, damit sie keinen toten Code mitschleppt und in
Modulen arbeiten kann.

## 0.36.0 — „Sicherheit"

Der Betreiber hat am 15. September 2026 gefragt, ob Kriterion von Grund auf
sicher gebaut ist oder ob man hinsehen muss. Die Durchsicht an jenem Tag hat
beides ergeben: der Bau ist sicherheitsbewusst, und es bleiben fünf Punkte.

### Warum die Runde hier steht

- **Nach 0.35.0**, damit die Durchsicht den Code sieht, der bleibt. Eine
  Effizienzrunde schreibt Stellen um; eine Sicherheitsdurchsicht davor wäre
  danach zum Teil ungültig.
- **Nach 0.34.0**, damit die neuen Prüfungen gleich in die Modulstruktur gehen
  und nicht in eine Datei, die danach aufgeteilt wird.
- **Nicht zusammen mit 0.35.0.** Wer Laufzeit und Sicherheit im selben
  Durchgang gegeneinander abwägt, entscheidet im Zweifel für die Laufzeit.

**Der Hebel, wenn es früher sein soll:** BA 4, die Durchsicht der
`innerHTML`-Stellen, hängt an keiner der beiden Runden davor. `public/app.js`
wird von der Aufteilung des Prüfstands nicht berührt. BA 4 lässt sich als
eigener Patch vorziehen, ohne die Reihenfolge zu ändern.

### Was am 15. September 2026 vorgefunden wurde

Die Durchsicht war eine Lesung des Quelltextes. Es wurde nichts ausgeführt und
nichts angegriffen.

| Bereich | Stand |
|---|---|
| Anmeldepflicht | `app.use('/api', auth.requireAuth)` — alle 104 Routen sind standardmäßig zu; darauf 23 `adminOnly`, 16 `ownerOnly`, 8 `entryAuthorOnly` |
| Passwörter | scrypt, 16 Byte Zufallssalz, `timingSafeEqual`, Dummy-Hash gegen Zeitmessung bei unbekanntem Namen |
| Sitzungen | 32 Byte Zufall; Cookie mit `HttpOnly`, `SameSite=Lax`, `Secure` hinter Proxy |
| SQL | durchgehend gebundene Parameter; zusammengesetztes SQL setzt nur feste Literale aus dem Quelltext ein |
| CSP | `script-src 'self'`, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`; `unsafe-inline` nur bei `style-src` |
| Uploads | 30 MB Grenze; Typ über `sharp` am Inhalt geprüft, SVG ausdrücklich ausgeschlossen |
| Auslieferung | `Content-Disposition`, eigene CSP je Typ, Inline nur für eine Positivliste, Typ aus den ersten Bytes |
| Anmeldesperre | ab 5 Versuchen verzögerte Antwort, ab 10 Versuchen 5 Minuten Sperre je IP |
| Datenbank | verschlüsselt (SQLCipher) |

**Das ist der Ausgangspunkt, und er ist gut.** Die Runde baut keinen Schutz von
null auf, sondern schließt Lücken in einem vorhandenen.

### Die Bauabschnitte

| BA | Sache | Warum |
|---|---|---|
| **1** | **CSRF-Token für alle schreibenden Routen** | Der Schutz ruht heute allein auf `SameSite=Lax`. Das deckt POST, PUT und DELETE von fremden Seiten ab, ist aber eine einzige Verteidigungslinie |
| **2** | **Die Anmeldesperre übersteht einen Neustart** | `const attempts = new Map()` liegt im Arbeitsspeicher. Ein Neustart setzt den Zähler zurück, und wer das weiß, wartet darauf. **Braucht eine Tabelle — daher Schema: offen** |
| **3** | **Sperre auch je Benutzername** | Die harte Sperre greift nur je IP. Verteiltes Raten gegen **einen** Namen wird nicht erkannt. Die Einschränkung steht heute schon als Kommentar in `auth.js` |
| **4** | **Die 199 `innerHTML`-Stellen in `public/app.js` einzeln durchgehen** | Es gibt `esc()`, und die CSP fängt viel ab. Ob jede Stelle Benutzertext wirklich durch `esc()` schickt, ist nicht geprüft. **Das ist der größte Posten der Runde** |
| **5** | **Abhängigkeiten regelmäßig prüfen** | Das `npm audit fix` einer früheren Runde war ein Einzelfall. Vorschlag: ein Lauf im vorhandenen Workflow, der bei einem Fund rot wird |

### Was NICHT in dieser Runde liegt

*Hier stand bis 0.35.0, `npm audit` melde zwei mittelschwere Schwachstellen in
`qs` über `express`, und sie gehörten in den nächsten Patch.* **Die Zeile war
beim Schreiben des Auftrags 0.35.0 schon überholt: 0.33.1 hat die beiden mit
`npm audit fix` behoben.** Gemessen am 16. September 2026 auf dem Stand
`5139e1f` — **`npm audit` meldet 0 Schwachstellen** (B2 des Auftrags 0.35.0).
Punkt 5 der Tafel darüber bleibt: geprüft wird bis heute von Hand.

### Offene Fragen für die Fragetafel jener Runde

1. **Wo liegt der CSRF-Token?** Eigenes Cookie plus Kopfzeile, oder im
   Sitzungseintrag in der Datenbank. Die zweite Form kostet eine Abfrage je
   schreibender Anfrage.
2. **Was passiert mit offenen Sitzungen beim Einspielen der Runde?** Ein
   Token, den alte Sitzungen nicht haben, meldet alle ab. Das ist vertretbar,
   muss aber entschieden und angesagt sein.
3. **Wie weit geht BA 4?** Alle 199 Stellen, oder zuerst die, die
   Benutzertext führen. Die Zahl je Art ist vor dem Bau zu messen.
4. **Wird die Sperre je Benutzername zur Auskunft?** Wer „dieser Name ist
   gesperrt" zu sehen bekommt, weiß, dass es den Namen gibt. Die Antwort muss
   gleich aussehen wie bei einem unbekannten Namen.

---

## 0.39.0 — „Die Spaltenfolge: `data` ans Ende"

> **GEBAUT am 22. September 2026** auf 0.38.6. Das Protokoll steht als
> `Doku/Aenderungsprotokoll_0.39.0.md`, der Auftrag als
> `Doku/Auftrag_0.39.0.md`.
>
> **Gebaut ist die Spaltenfolge, nicht die Nebentabelle.** In `photos`,
> `comment_images` und `attachments` steht `data` am Ende der Zeile;
> `trash_bytes` führte sie schon dort. `tools/reorder.js` bringt eine
> bestehende Datenbank auf die neue Folge — ein Aufruf bei angehaltener
> Instanz, kein Migrationsblock.
>
> **Gemessen am fertigen Stand**, verschlüsselte Prüflage von 500 Fotos und
> 126,0 MB Originalen: **0,91 ms je Kachel vorher, 0,01 ms nachher**; über alle
> 500 Kacheln 457,8 gegen 5,76 ms. Die Umschichtung kostet 44,7 ms je MB
> (4.476 ms Umschichten, 5.874 ms `VACUUM` bei 231,7 MB), die Datei ist danach
> genauso groß wie vorher.
>
> **DIE NEBENTABELLE `photo_derivatives` IST NICHT GEBAUT.** Gemessen an einer
> gestellten Lage von 1000 Zeilen: **0,009 ms je Kachel mit ihr gegen 0,011 ms
> mit der Spaltenfolge — eine Differenz von 0,002 ms.** Dafür bräuchte es einen
> zweiten Schreibweg, einen zweiten Leseweg, einen Eingriff in Export, Import
> und Papierkorb und eine Neurechnung aller Ableitungen. Der Abschnitt unten
> steht in der Fassung, in der er geplant war.

---

### Wie es geplant war — „Die Fotokachel in eine Nebentabelle"

**Zugeordnet am 21. September 2026** aus Punkt 39 des Sammelblatts. *Herkunft:
0.35.0, in der Messung vom 16. September 2026. Die Runde 0.35.0 hatte eine
Schemaänderung ausdrücklich ausgeschlossen und ihr dafür eine eigene Nummer
zugesagt.*

**Der Punkt trug vier Befunde, drei davon sind mit 0.38.4 gebaut:** *der Index
auf `ratings.criterion_id`, der deckende Index für `qAttachments` und
`length(thumb)` in `idx_photos_tile`.* **Der vierte ist diese Runde.**

### Die Lage

`photos` (`db.js`:145) führt die Spalten in der Folge `id`, `item_id`,
`mime_type`, `data`, `thumb`, `medium`, `kind`. **Die Kachel steht hinter dem
Original.** SQLite liest eine Zeile von vorn; wer `thumb` will, läuft durch die
Overflow-Kette von `data` und entschlüsselt sie mit. *Bei einem Video sind das
bis zu 20 MB für eine Kachel von rund 200 kB.*

### Gemessen am 21. September 2026: der Umweg kostet, das Zaehlen nicht

**`length(thumb)` liest nur den Record-Kopf und beruehrt den Overflow nie.**
*Gestellte Lage, 200 Zeilen je Gruppe, Kachel immer 20 kB:*

| | Original 4 MB | Original 2 kB |
|---|---:|---:|
| `length(thumb)` | 0,53 ms | 0,62 ms |
| **`thumb` wirklich lesen** | **161,54 ms** | **1,63 ms** |
| `mime_type` *(Spalte vor `data`)* | 0,49 ms | 0,47 ms |

**Damit ist Befund 4 des Punktes 39 widerlegt** — *dass `length(thumb)` nicht
in `idx_photos_tile` steht, kostet nichts: der Ausdruck laeuft ueber den Kopf
und nicht ueber den Wert.* **Ein Index dafuer wird nicht gebaut.**

**Der Umweg kostet nur den, der die Kachel wirklich holt** — die Route, die
die Bytes ausliefert. *An derselben gestellten Lage, 40 Zeilen je Klasse:*

| Groesse des Originals | je Kachel |
|---|---:|
| bis 4 kB | 0,02 ms |
| bis 100 kB | 0,02 ms |
| bis 1 MB | **1,50 ms** |
| ueber 1 MB | **14,8 ms** |

### Am Bestand des Betreibers gemessen — 22. September 2026

**1997 Zeilen, 407,0 MB Originale, 42,5 MB Kacheln, 98,2 MB mittlere.**

| Groesse des Originals | Zeilen | Kachel | mittlere |
|---|---:|---:|---:|
| bis 100 kB | 974 | 0,13 ms | 0,16 ms |
| bis 1 MB | 987 | 0,19 ms | 0,37 ms |
| ueber 1 MB | 36 | **3,41 ms** | **3,83 ms** |

**Ueber den ganzen Bestand sind es 429,0 ms, je Kachel 0,21 ms, bei dreissig
Kacheln auf einmal 6,35 ms.** *Das ist die ganze Ersparnis einer
Uebersichtsseite — neben dem Aufbau der Seite faellt sie nicht auf.*

**Und sie waechst nicht mit dem Bestand:** *die Zeit je Kachel haengt an der
Groesse des Originals davor, nicht an der Zahl der Zeilen. Fuenfzig Prozent
mehr Fotos bringen fuenfzig Prozent mehr Kacheln, jede genauso teuer wie
heute.*

### Die Spaltenfolge tut dasselbe wie eine Nebentabelle

**Gemessen an einer gestellten Lage von 1000 Zeilen, Kachel 21 kB, Verteilung
der Originale wie im Bestand:**

| | je Kachel |
|---|---:|
| heute — `thumb` hinter `data` | 0,095 ms |
| **`thumb` und `medium` VOR `data`** | **0,011 ms** |
| Nebentabelle | 0,009 ms |

**Die Spaltenfolge bringt 95 Prozent dessen, was die Nebentabelle bringt** —
*und sie braucht keinen zweiten Schreibweg, keinen zweiten Leseweg, keinen
Eingriff in Export, Import und Papierkorb, und keine Neurechnung: die Bytes
wandern nur um.* **Am Code aendert sie gar nichts.**

### Der Weg

`photo_derivatives(photo_id PRIMARY KEY, thumb, medium)`. **Die Bauform steht
mit `trash` und `trash_bytes` schon im Repository** — eine Nebentabelle, die
die Blobs eines Vorgangs trägt, ist nichts Neues.

### Was sie teuer macht

**Die Ableitungen müssen umziehen, und das heißt: sie werden neu gerechnet.**
Deshalb gehört eine Sicherung davor, und deshalb ist es eine eigene Runde und
kein Bauabschnitt in einer anderen.

**Erst messen, dann entscheiden:** die Zahlen oben sind an gestellten Prüflagen
gemessen und nicht am laufenden Betrieb.

**Was es anfasst** — `db.js`, `server.js`, `images.js`.

**Schema: ja.**

---

## 0.39.1 — „Was für vergangene Prozesse gebaut wurde, geht heraus"

> **GEBAUT am 22. September 2026** auf 0.39.0. Das Protokoll steht als
> `Doku/Aenderungsprotokoll_0.39.1.md`, der Auftrag als
> `Doku/Auftrag_0.39.1.md`.
>
> **Die Vorgabe:** 0.39.0 ist die einzige Fassung, die es öffentlich je geben
> wird. Vor ihr liegt keine veröffentlichte Version, aus der jemand einen
> Bestand, eine `.env` oder eine Exportdatei mitbrächte.
>
> **Entfernt:** fünf Werkzeuge unter `tools/` (921 Zeilen), `LEGACY_TABLES`,
> die vier deutschen Umgebungsnamen, drei `AUTH_*`-Warnungen und jede
> Versionsnummer aus README und Handbuch. **Netto 1.425 Zeilen weniger.**
>
> **Geblieben:** `lateStatement`, `lateGroup` und `REQUIRED_COLUMNS`. Der
> Rückbau hätte rund 90 Stellen in `server.js` gekostet und null Zeilen
> gebracht.
>
> **Zwei Fehler nebenbei behoben** — ein Verweis auf `./schluessel.sh` statt
> `keytool.sh` in `.env.example`, und die Formatnummer 17 im Handbuch gegen 18
> im Server.

---

## 0.40.0 — „Export, Import und Papierkorb ohne den Arbeitsspeicher"

**GEBAUT am 22. September 2026** auf 0.39.1 — Änderungsprotokoll 0.40.0.
*Alle drei Stellen sind gebaut. Gemessen am fertigen Stand fällt die RSS-Spitze
des Exports von +1.125,8 MB auf +314,8 MB und die Laufzeit von 16,02 s auf 3,95 s; die
Zahlen der Planung darunter stammen aus der Nachstellung vom 22. September und
sind unverändert stehengeblieben.* **Die Spalte „Format" stand in der Tafel auf
`ja` und steht jetzt auf `nein`: die Formatnummer bleibt 18, nur die Form der
Antwort ändert sich.**

**Zugeordnet am 21. September 2026** aus Punkt 40 des Sammelblatts. *Herkunft:
0.35.0, in der Messung vom 16. September 2026. Alle drei Stellen sind in 0.35.0
nicht gebaut worden, weil Zusage 1 jener Runde lautete: kein Verhalten ändert
sich.*

### Drei Stellen

**1. Der Export steht dreimal gleichzeitig im Arbeitsspeicher**
(`server.js`:4251). `entryAsBundle()` erzeugt je Blob einen Base64-String,
`exportEnvelope()` gibt ein Objekt mit allen diesen Strings zurück, `res.json()`
serialisiert das Ganze noch einmal. *Der Weg wäre, den Umschlag stückweise zu
schreiben:* `res.write()` *für den Kopf, je Eintrag ein eigenes*
`JSON.stringify()`, *dann der Schluss.* **Die Antwort trägt dann keine
`Content-Length` mehr**, und das ist der Grund, warum es nicht gebaut ist.

**2. Die Importdatei liegt viermal im Speicher** (`server.js`:4669). `multer`
hält sie als Buffer, `toString('utf8')` macht einen String daraus, `JSON.parse`
legt das Objekt mit allen Base64-Strings an, und `prepared` sammelt die
Ableitungen. *Der Weg wäre* `diskStorage` *und eintragsweises Lesen.* **Das
verlegt die Datei ins Dateisystem und verlangt ein Aufräumen auf jedem
Fehlerweg** — ein Fehler dort verliert Daten.

**3. `intoTrash` führt jedes Blob durch Node** (`server.js`:4722). Beim Löschen
eines Eintrags sammelt `funnelStore()` jedes Blob als Buffer, und erst danach
wird geschrieben. *Der Weg wäre je Trägertabelle eine Anweisung*
`INSERT INTO trash_bytes (trash_id, part, data) SELECT ?, ?, data FROM …`.
**Dafür müsste `entryAsBundle` die Blobspalten gar nicht erst lesen** — und
dieselbe Funktion trägt auch den Export.

### Was der Umbau bringt — nachgestellt und gemessen

**Dieselben Daten, zwei Wege, je ein eigener Prozess.** *40 Einträge zu je
6,0 MB, Datei 320,0 MB. Gemessen synchron an den Stellen, an denen es zählt:
ein Zeitgeber käme während `JSON.stringify` nie dran, der Event Loop steht so
lange.*

| | RSS-Spitze | Laufzeit |
|---|---:|---:|
| alles in einen String — wie heute | **+640,5 MB** | 4,48 s |
| stückweise geschrieben | **+113,2 MB** | 2,37 s |

**Der Speicher fällt um den Faktor 5,7, die Laufzeit fast auf die Hälfte.**
*Und die 113,2 MB hängen am größten Einzeleintrag, nicht am Bestand: sie
wachsen nicht mit.*

> **DAMIT FÄLLT DER ZWANG ZUM TEILEXPORT.** *Ein stückweise geschriebener
> Umschlag baut nie einen String über der Grenze — die Datei darf beliebig groß
> werden.* **Der Teilexport bleibt als Wahl**, für wen kleinere Dateien braucht
> — eine Hochladegrenze, ein Datenträger, eine langsame Verbindung.

### Die Grenze ist nicht vom Arbeitsspeicher abhängig

**`MAX_STRING_LENGTH` misst auf jeder 64-Bit-Maschine dasselbe: 536.870.888
Bytes.** *Sie hängt an der Engine und der Architektur, nicht am
Arbeitsspeicher; eine Instanz mit einem Gigabyte hat dieselbe Zahl wie eine mit
sechzehn.* **Der Server liest sie schon heute bei jedem Start aus der
Umgebung** — insoweit ist sie bereits nachgeführt.

**Was bei einer kleinen Instanz wirklich knapp wird, ist der Arbeitsspeicher**,
und den deckt die Zahl gar nicht ab: der heutige Weg braucht 640,5 MB für eine
Datei von 320 MB, also lange bevor die Grenze in Sicht kommt. *Eine
Warnschwelle, die den freien Speicher mitrechnet, wäre vor dem Umbau ein
Pflaster — nach ihm ist sie nicht mehr nötig.*

*Wer sie dennoch je bauen will: `os.totalmem()` nennt im Container den Speicher
des Wirts und nicht die Grenze des Containers. Die steht in
`/sys/fs/cgroup/memory.max`, und ohne gesetzte Grenze trägt die Datei den
höchsten Wert eines vorzeichenbehafteten 64-Bit-Worts.*

### Der Hinweis vor dem Lauf — Vorgabe des Betreibers vom 22. September 2026

**Vor dem Export und vor dem Import steht ein Dialog**, der ansagt, was kommt:
dass es je nach Bestand und Verbindung dauern kann, **dass es keine
Fortschrittsanzeige gibt** und dass das Fenster offen bleiben muss.

*Damit ist der Grund gelöst, an dem die Runde bisher hing.* **Der stückweise
geschriebene Umschlag trägt keine `Content-Length` mehr, und ohne sie kann der
Browser keinen Balken zeigen.** Der Weg ist nicht, den Balken zu retten,
sondern vorher zu sagen, dass es keinen gibt.

*Der Dialog ist keine Rückfrage mit Ausweg: er hat einen Knopf zum Weitermachen
und einen zum Abbrechen, und er kommt vor jedem Lauf. Ein Häkchen „nicht mehr
zeigen" ist nicht vorgesehen — wer exportiert, tut es selten.*

### Die Auflage

**Eine Messung am laufenden Bestand steht davor.** Die Zahlen aus 0.35.0 sind
gezählt und nicht gestoppt; ob der Umbau sich lohnt, entscheidet der Bestand
des Betreibers und nicht eine gestellte Prüflage. *Das Werkzeug dafür ist
`tools/exportscan.js`.*

### Am Bestand des Betreibers gemessen — 22. September 2026

**Mit `tools/exportscan.js`, 86 Einträge:**

| Träger | Zeilen | roh | als Base64 |
|---|---:|---:|---:|
| Fotos (Original) | 1979 | 331,3 MB | 441,8 MB |
| Kacheln | 1994 | 42,5 MB | 56,7 MB |
| Mittlere Variante | 1994 | 98,4 MB | 131,3 MB |
| Videos | 15 | 85,9 MB | 114,6 MB |
| Anlagen | 20 | 34,6 MB | 46,2 MB |
| Bilder in Kommentaren | 50 | 1,7 MB | 2,3 MB |
| Text | 86 | 20,0 MB | 26,6 MB |

**Der Export in einer Datei geht nicht mehr.** Gegen die Grenze von 460,8 MB:

| Schalterstellung | als Base64 | |
|---|---:|---|
| nur Text | 26,6 MB | passt |
| **mit Fotos — die Vorgabe** | **656,4 MB** | **zu groß um 195,6 MB** |
| mit Fotos und Dateien | 704,8 MB | zu groß um 244,0 MB |
| mit allem, auch Videos | 819,4 MB | zu groß um 358,6 MB |

**Der Teilexport trägt weiter:** *drei Teile in der Vorgabestellung, der größte
298,3 MB. Kein Eintrag passt in keinen Teil — der größte misst 53,6 MB.*

> **WAS AUSFÄLLT, IST DER EXPORT IN EINER DATEI, nicht der Export.** *Die Zahl
> der Teile wächst mit dem Bestand, und beim Wiederherstellen sind sie
> nacheinander einzuspielen.* **Nach dem Umbau ist es wieder eine Datei, bei
> jeder Größe.**

### Was an einer gestellten Lage schon gemessen ist

**`JSON.stringify` über alle Bündel auf einmal kostet ein Vielfaches des
Bauens.** *An 21,1 MB Base64: 364,3 ms gegen 8,0 ms.* **Auf dem Gerät des
Betreibers ist es weit billiger** — *53,6 MB in 85,9 ms gegen 16,9 ms; die
gestellte Lage lief auf langsamerer Hardware.* **Die Laufzeit ist also nicht
der Grund für die Runde. Der Grund ist allein die Grenze.**

*Der Arbeitsspeicher ist nicht verlässlich zu messen: der Aufräumer läuft
dazwischen, und die RSS-Zahl fiel am Bestand sogar negativ aus. Das Werkzeug
nennt sie und deutet sie nicht.*

**Was es anfasst** — `server.js` *(drei Stellen)*, `public/app.js` *(der
Dialog)*, die drei Sprachdateien, `test/roundtrip.js`.

**Schema: nein. Format: ja** — die Antwort des Exports ändert ihre Form.

---

## 0.41.0 — „Backup, Videos in Kommentaren und der Prüfstand ohne feste Wartezeiten"

**GEBAUT am 23. September 2026** auf 0.40.0 — Änderungsprotokoll 0.41.0. *Die
Planung darunter ist unverändert stehengeblieben.*

**Auftrag erteilt am 23. September 2026:** `Doku/Auftrag_0.41.0.md`. Er
entscheidet die offenen Fragen dieses Abschnitts und nimmt eine Vorgabe vom
selben Tag dazu: „In jeder neuen Installation muss jede Bezeichnung vom System
englisch sein. Nur bei bereits angelegten darf es Sicherung heißen." Eine
zweite Vorgabe vom selben Tag macht die Größengrenzen für Bilder und Videos
im Systembereich einstellbar. Bis dahin hieß die Runde
„Der Prüfstand wartet auf eine Bedingung statt auf die Uhr".

**Zugeordnet am 21. September 2026** aus Punkt 41 des Sammelblatts, auf Ansage
des Betreibers: beim nächsten Mal. *Herkunft: 0.35.0.*

### Die Zahl

**In den Modulen unter `test/` standen 625 feste Wartezeiten** der Form
`await new Promise(r => setTimeout(r, N))`, **zusammen 59.635 ms**. Die Module
laufen nacheinander, also liegt jede dieser Millisekunden auf der Laufzeit.

**0.35.0 hat das Werkzeug gebaut und elf Stellen umgestellt:** `until()` in
`test/dom.js` fragt in Fünf-Millisekunden-Schritten und wirft an der Grenze,
`nextSecond()` in `test/frame.js` wartet auf die nächste Sekundengrenze der
Uhr. **614 Stellen bleiben, zusammen 47.520 ms.**

Nachgezählt am 23. September 2026 an `47e8cf6`: **618 Stellen, 47.625 ms, in
13 Modulen.** Die Zahl 614 stammt vom Stand 0.35.0 und war seither nicht
nachgezählt worden.

### Warum es keinen Griff für alle gibt

Sie warten auf das Neuzeichnen eines Fensters, und **jede braucht ihre eigene
Bedingung**. *Ein Versuch ist gemessen und zurückgenommen worden:* `sysSection`
*auf* `.sys-card` *warten zu lassen kehrt zu früh zurück, weil die Karte früher
dasteht als ihr Inhalt.*

### Was der Gewinn wirklich ist

**Höchstens 47,5 Sekunden**, verteilt über sieben Module — und er ist nicht der
ganze Gewinn: die elf umgestellten Stellen haben im vollen Lauf 6,3 Sekunden
gebracht, sichtbar wurde davon nichts, weil derselbe Lauf 3,3 Sekunden für die
Kompression beim Serverstart zahlt.

**Modul für Modul, mit einem vollen Lauf je Modul.**

**Was es anfasst** — `test/ui_*.js`, `test/roundtrip.js`, `test/release_030.js`.

### Der zweite Gegenstand: was eine Exportdatei nicht zurückbringt

**Angesagt vom Betreiber am 22. September 2026**, nach dem Einspielen einer
Exportdatei in eine frische Installation: die Einträge waren da, die Zugänge
und der Mailzugang nicht.

**Das ist so gebaut, und es steht nirgends am Bildschirm.** Die Exportdatei
trägt den Bestand, nicht die Installation. Nicht darin stehen:

| Tabelle | was fehlt |
|---|---|
| `users`, `sessions`, `tokens`, `two_factor` | Zugänge, Passwörter, Sitzungen, Einladungslinks, zweiter Faktor |
| `settings` | der Mailzugang, beide Titel, das Vokabular, die Suchanbieter, die Bildablage, der Sicherungsort |
| `user_settings` | Filter, Schriftgröße, Blöcke, Thema und Sprache je Zugang |
| `security_log`, `login_attempts`, `requests` | Protokoll und Anmeldeversuche |
| `trash`, `trash_bytes` | der Papierkorb |

**Der ersetzende Import löscht drei Tabellen** — `items`,
`product_categories`, `tags` (`server.js`:5360) — und fasst Zugänge und
Einstellungen nicht an. Er kann sie also nicht weggenommen haben; fehlen sie,
hat die Instanz sie nie gehabt.

**Die Folge trifft die Verfasser.** `authorId()` sucht den Zugang über den
NAMEN; findet er ihn nicht, fällt der Beitrag an den Einspielenden. Wer den
Bestand umzieht, legt die Zugänge also vorher mit denselben Benutzernamen an.

### Das Wort heißt Backup

**Vorgabe des Betreibers vom 22. September 2026:** *„such nicht Sicherung,
richtige Begriffe sind: Import, Export, Backup."* **Die drei Wege heißen ab
0.41.0 Export, Import und Backup**, und das deutsche Wort fällt.

**Gemessen am Stand 0.40.0: 57 Werte in `public/languages/de.json`, dazu 107
Treffer in Quelltext und Papieren.**

| | Treffer |
|---|---:|
| `README.md` | 43 |
| `public/app.js` — Kommentare | 17 |
| `manual-de.md` | 16 |
| `server.js` — Kommentare | 13 |
| `docker-compose.example.yml` | 12 |
| `.env.example` | 6 |

> **DIE SCHLÜSSELNAMEN SIND SCHON RICHTIG.** *51 tragen `backup` im Namen —
> `card.backup`, `card.backupWhatHint`, `server.backupDirGone`.* **Angefasst
> wird der deutsche Wortlaut, nicht das Format und nicht die Schnittstelle.**
> *Englisch und Türkisch sagen schon heute `backup` und `yedekleme`: null
> Treffer.*

**Der Wortfilter des Prüfstands bekommt den Eintrag, sobald der Wortlaut
umgestellt ist** — das deutsche Wort gegen `Backup`, wie `Keks` gegen
`Cookie`.

Der Satz zum Backup braucht das Wort als Beschreibung: „eine vollständige
Sicherung der Datenbank". Der Eintrag braucht deshalb eine Ausnahme oder
entfällt; siehe Punkt 48 unten.

### Was dafür zu bauen ist

> **AM ABLAUF WIRD NICHTS GEÄNDERT** — Vorgabe des Betreibers vom 22. September
> 2026: „du brauchst die Funktion nicht verändern, passt schon so." **Gebaut
> werden die Hinweise.** Sie müssen zwei Fragen beantworten: *was sichert man
> womit, und was ist wo drin.*

**Die zwei Sätze, die überall stehen müssen:**

1. **Nur das Backup ist eine vollständige Sicherung der Datenbank.**
2. **Export und Import tragen die Einträge und sonst nichts** — keine Zugänge
   und auch keine Einstellungen von Kriterion.

**Wo sie hingehören:**

| Ort | was heute fehlt |
|---|---|
| Der Dialog vor Export und Import | er stellt seit 0.40.0 die drei Wege nebeneinander, sagt aber nicht, was in keinem davon steckt |
| Die Karte „Export und Import" | `card.exportPurposeHint` nennt Umzug, Archiv und Weitergabe — nicht, was fehlt |
| Die Karte des Backups | `card.backupWhatHint` sagt „auch mit dem, was der Export nicht enthält" — was das ist, steht nirgends |
| **Das Handbuch** | der Abschnitt „Export und Import" zählt Zugänge, Passwörter, Sitzungen, Sicherheitsprotokoll, Papierkorb und persönliche Einstellungen auf; **der Mailzugang und die übrigen Einstellungen fehlen in der Liste** |

**Dazu, als Kleinigkeit am selben Ort:** nach dem Dateiimport nennt die
Oberfläche die Verfasser nicht, die dem Einspielenden zugefallen sind. Die
Antwort trägt `authorUnknown` schon, das Containerprotokoll nennt sie, und
beim Zurückholen aus dem Papierkorb zeigt die Oberfläche sie auch
(`public/app.js`:8608) — nach dem Dateiimport nicht.

### Dazu: sieben Punkte vom 23. September 2026

**Ansage des Betreibers vom 23. September 2026:** „wir nehmen alle Punkte für
0.41.0 auf." Vier davon standen als Punkte 48 bis 51 im Sammelblatt und sind
mit ihrer Ausarbeitung hierher gezogen. Drei kamen am selben Tag dazu und
stehen nur hier.

| | worum es geht | Art | Schema |
|---|---|---|---|
| Punkt 48 | Der Satz zum Backup: „Nur das Backup ist eine vollständige Sicherung der Datenbank." | Wortlaut | nein |
| Punkt 49 | Das Hinweisfeld an der Zeitleiste wird am rechten Rand schmal und hoch | Fehler | nein |
| Punkt 50 | Die Formatierleiste verdeckt bei einem langen Kommentar die Knöpfe | Fehler | nein |
| Punkt 51 | Die Beispieldateien erklären zu viel; zwei Angaben darin sind falsch | Dokumentation | nein |
| neu | Nach dem Umlegen von `BEHIND_PROXY` wird jede schreibende Anfrage abgewiesen | Fehler | nein |
| neu | Ein Download für jedes Bild und jedes Video | Neue Funktion | nein |
| neu | Kurze Videos in Kommentaren | Neue Funktion | **offen** |

#### Nur das Backup ist eine vollständige Sicherung der Datenbank — Punkt 48 des Sammelblatts

**Art: Verbesserung** (Wortlaut) · **Herkunft: 0.40.0**, Betreiber am
23. September 2026 · **Einschätzung: klein** · zugeordnet zu
0.41.0

##### Woher

Vorgabe des Betreibers vom 23. September 2026, beim Lesen des
Fahrplaneintrags zu 0.41.0. Der Satz „Nur das Backup ist ein vollständiges
Backup." ist richtig, auf Deutsch aber besser so:

> **Nur das Backup ist eine vollständige Sicherung der Datenbank.**

Im neuen Satz ist „Backup" der Name und „Sicherung der Datenbank" die
Beschreibung.

##### Was auffiel

Der alte Satz stand zweimal in diesem Fahrplan: in der Zeile 0.41.0 der
Tafel und als Satz 1 unter „Was dafür zu bauen ist". Beide Stellen tragen
seit der Zuordnung den neuen Satz.

Oberfläche, Handbuch und README sagen heute „Kopie der Datenbank". Im
Wortlaut „vollständige, verschlüsselte Kopie der Datenbank" steht es an
**fünf Stellen**:

| Datei | Stelle |
|---|---|
| `public/languages/de.json`:59 | `card.backupWhatHint`, Karte des Backups |
| `public/languages/de.json`:699 | `card.wayBackupHint`, Dialog vor Export und Import |
| `manual-de.md`:1051 | Liste der Karten, Eintrag „Sicherung" |
| `manual-de.md`:1145 | Tabelle der drei Wege im Abschnitt „Export und Import" |
| `README.md`:818 | Abschnitt „Sichern" |

Dieselbe Aussage in anderer Form: `manual-de.md`:124 und :1149,
`README.md`:81.

Vier Prüfungen halten den heutigen Wortlaut fest: `test/source.js`:1577
(Liste der Bildschirmtexte), `test/source.js`:2547 und :2552 (benannte
Ausnahme der Verbotsliste), `test/ui_system.js`:3534 (Karte des Backups).

##### Was es nicht ist

Kein Fehler. Beide Sätze sind richtig. Am Ablauf ändert sich nichts.

##### Offene Entscheidungen

1. **Der Wortfilter.** Der Abschnitt „Das Wort heißt Backup" oben kündigt
   einen Eintrag an: das deutsche Wort gegen `Backup`. Der Filter liest die
   Prosa von `manual-de.md`, `README.md`, `CHANGELOG.md` und `Doku/*.md` und
   würde den neuen Satz dort melden. Der Eintrag braucht eine Ausnahme für
   „der Datenbank" oder entfällt.
2. **Die Verbotsliste der Oberfläche.** `SCREEN_BAN` in `test/dom.js`:1466
   sperrt „Kopie" am Bildschirm schon heute, mit einer Ausnahme:
   `Kopien?\b(?!\s+der\s+Datenbank)`. Nach der Änderung wird diese Ausnahme
   nicht mehr gebraucht. Ein Eintrag für das deutsche Wort bräuchte dieselbe.
3. **Englisch und Türkisch.** Die Vorgabe betrifft den deutschen Wortlaut.
   `en.json` sagt „copy", `tr.json` sagt „kopya".

##### Was es anfasst

`public/languages/de.json` (2 Werte), `manual-de.md` (4 Stellen), `README.md`
(2), `test/source.js`,
`test/ui_system.js`, `test/dom.js`. Keine Route, kein Schema, kein Format.

#### Der Hinweis an der Zeitleiste wird am rechten Rand schmal und hoch — Punkt 49 des Sammelblatts

**Art: Fehler** (Darstellung) · **Herkunft: 0.31.0**, Betreiber am
23. September 2026 · **Einschätzung: klein** · zugeordnet zu 0.41.0

##### Woher

Befund des Betreibers vom 23. September 2026, mit drei Bildschirmfotos. Fährt
die Maus über einen Punkt weit rechts auf der Zeitleiste, wird das
Hinweisfeld sehr schmal und sehr hoch. Datum und Note stehen dann ein Zeichen
je Zeile untereinander (Bild 1 und 2). Bei einem Punkt weiter innen ist die
Darstellung richtig (Bild 3).

##### Was auffiel

`.timeline-hint` (`public/style.css`:1907) ist absolut positioniert.
`showHint()` (`public/app.js`:3962) setzt `left` auf die Lage des Punktes;
eine Breite setzt niemand. Der Browser nimmt als Breite deshalb den Platz
zwischen `left` und dem rechten Rand der Zeitleiste. `translateX(-50%)`
verschiebt das Feld erst danach und gibt ihm keinen Platz zurück.
`overflow-wrap: anywhere` erlaubt den Umbruch nach jedem Zeichen.

Gemessen in Chromium, Zeitleiste 900 px breit, Titel „Sky-Watcher I Star
Adevnturer":

| Punkt bei | Breite | Höhe |
|---:|---:|---:|
| 0 bis 70 % | 210 px | 73 px |
| 80 % | 180 px | 73 px |
| 90 % | 90 px | 147 px |
| 95 % | 45 px | 366 px |
| 100 % | 35 px | 647 px |

Das Feld wird schmaler, sobald rechts vom Punkt weniger als 210 px frei sind.
Bei 900 px sind das die rechten 23 Prozent der Zeitleiste; in einem
schmaleren Fenster ist der Anteil größer. Bild 3 liegt schon in diesem
Bereich: der Titel bricht in zwei Zeilen um, bleibt aber lesbar.

Am linken Rand fehlt die Begrenzung ebenfalls. Bei 0 % ragt das Feld 105 px
links aus der Zeitleiste, bei 10 % 15 px. Gemeldet ist das nicht.

Die Obergrenze `max-width: min(14rem, 46%)` mit `overflow-wrap: anywhere` kam
mit 0.31.0. Vorher trug das Feld `white-space: nowrap` und ragte am rechten
Ende aus der Zeitleiste.

##### Was gebaut werden könnte

`showHint()` misst das Feld nach dem Einfügen und verschiebt es so weit nach
innen, dass es ganz in der Zeitleiste steht. Dafür braucht das Feld eine
Breite, die nicht vom Platz rechts vom Punkt abhängt: `width: max-content`
unter der bestehenden Obergrenze. **Einschätzung von Claude: empfohlen.**
**Draußen üblich: ja** — Floating UI verschiebt ein Hinweisfeld am Rand mit
`shift()` nach innen, ECharts hält es mit `confine` in der Grafik.

##### Offene Entscheidungen

1. Ob der linke Rand mitgenommen wird, obwohl dort nichts gemeldet ist.
   Dieselbe Verschiebung deckt beide Ränder.

##### Was es anfasst

`public/app.js` (`showHint()`), `public/style.css` (`.timeline-hint`),
`test/ui_style.js`:1409 bis :1414 — die Prüfung verlangt die Obergrenze und
den Umbruch; beide bleiben. jsdom rechnet keine Breiten: eine Prüfung der
Lage braucht gesetzte Maße. Keine Route, kein Schema, kein Format.

#### Die Formatierleiste verdeckt bei einem langen Kommentar die Knöpfe — Punkt 50 des Sammelblatts

**Art: Fehler** (Bedienung) · **Herkunft: 0.38.0**, Betreiber am
23. September 2026 · **Einschätzung: klein** · zugeordnet zu 0.41.0

##### Woher

Befund des Betreibers vom 23. September 2026, mit zwei Bildschirmfotos vom
Telefon. Beim Schreiben eines Kommentars steht die Formatierleiste über dem
Feld (Bild 1). Das ist richtig. Bei einem langen Kommentar steht sie an der
Unterkante des Feldes und verdeckt die Knöpfe darunter (Bild 2: „Speichern"
beim Bearbeiten; beim neuen Kommentar „+ Bild").

Vorschlag des Betreibers: die Leiste an der Unterkante des Feldes, oder beim
Scrollen mitlaufend, solange das Feld sichtbar ist — mindestens eine Lösung,
die draußen üblich ist.

##### Was auffiel

`markupMenuPlace()` (`public/app.js`:2452) setzt die Leiste 6 px über die
Oberkante des Feldes. Liegt diese Stelle weniger als 4 px unter dem oberen
Fensterrand, setzt sie die Leiste 6 px unter die Unterkante. Dort stehen die
Knöpfe des Formulars. Die Leiste ist absolut positioniert und liegt mit
`--z-markup-menu` über ihnen.

Aus dem Code gelesen und nicht gemessen:

- Ist das Feld höher als das Fenster und beide Kanten liegen außerhalb, steht
  die Leiste außerhalb des sichtbaren Bereichs.
- Die feste Kopfzeile (`.masthead`, `position: sticky`) ist in die Schwelle
  von 4 px nicht eingerechnet. Liegt die Oberkante des Feldes unter der
  Kopfzeile, steht die Leiste hinter ihr: `--z-markup-menu` ist kleiner als
  `--z-masthead`.

##### Was gebaut werden könnte

Die Leiste steht im Fluss der Seite als Kopfzeile des Feldes, mit
`position: sticky` und `top` in Höhe der festen Kopfzeile. Sie läuft beim
Scrollen mit, solange das Feld sichtbar ist, und bleibt am Ende des Feldes
stehen. Sie verlässt den Bereich des Feldes nicht und kann die Knöpfe darunter
nicht verdecken. Die Lage wird von CSS bestimmt; `markupMenuPlace()` und der
Scroll-Horcher entfallen für das Feld. **Einschätzung von Claude: empfohlen.**

**Draußen üblich: ja.** GitHub und GitLab setzen die Formatierleiste fest über
das Kommentarfeld. Bei langen Texten wächst das Feld nur bis zu einer
Höchsthöhe und rollt dann in sich; die Leiste bleibt sichtbar. Google Docs und
der WordPress-Editor halten die Leiste oben fest, während der Text darunter
rollt. Auf dem Telefon setzen Slack und GitHub Mobile die Leiste über die
Bildschirmtastatur.

Das Menü an einer Auswahl im Lesemodus (Zitieren, Kopieren) bleibt, wie es
ist: es gehört zur Auswahl und nicht zu einem Feld.

##### Offene Entscheidungen

1. Mitlaufend unter der Kopfzeile (Vorschlag oben) oder fest an der
   Unterkante des Feldes. Die Unterkante liegt bei einem langen Kommentar oft
   außerhalb des Fensters.
2. Ob das Feld eine Höchsthöhe bekommt und dann in sich rollt. Das ändert,
   wie ein langer Kommentar sich schreibt, und ist deshalb eine eigene Frage.

##### Was es anfasst

`public/app.js` (`markupMenuPlace()`, `markupMenuShow()`, die Horcher in
`markupMenuSetUp()`), `public/style.css` (`.markup-menu`),
`test/ui_entry.js`:3989 und `test/ui_style.js`:2619 bis :2634 (Lage und
Ebene der Leiste). Keine Route, kein Schema, kein Format.

#### Die Beispieldateien erklären zu viel — Punkt 51 des Sammelblatts

**Art: Verbesserung** (Dokumentation) · **Herkunft: 0.40.0**, Betreiber am
23. September 2026 · **Einschätzung: klein** · zugeordnet zu 0.41.0

##### Woher

Befund des Betreibers vom 23. September 2026. Je Einstellung gehört in die
Beispieldatei: wofür sie da ist, was sie bewirkt und wovon sie abhängt, zum
Beispiel vom Mailversand. Nicht hinein gehören Cookienamen und der genaue
Ablauf. Der Betreiber hat die Blöcke `BEHIND_PROXY` und `PUBLIC_ADDRESS`
selbst gekürzt und dazu gesagt: das ist schon genug, und auch das dürfte
kürzer sein.

##### Was auffiel

| Datei | Zeilen | davon Kommentar | Einstellungen |
|---|---:|---:|---:|
| `.env.example` | 130 | 120 | 3, davon 2 auskommentiert |
| `docker-compose.example.yml` | 44 | 29 | 15 Zeilen |

Kommentarzeilen je Block in `.env.example`: `ENCRYPTION_KEY` 17,
`BEHIND_PROXY` 21, `PUBLIC_ADDRESS` 33, „Was hier bewusst nicht steht" 23,
„Den Schlüssel wechseln" 17. In `docker-compose.example.yml` stehen 20
Kommentarzeilen über der Einhängung des Backups, 5 über `TZ` und 4 über
`BACKUP_DIR`.

Zwei Angaben in `.env.example` sind falsch:

- Zeile 94 nennt `node zugang.js passwort <name>`. Die Datei heißt
  `usertool.js`; `README.md`:280 nennt den richtigen Befehl.
- Zeile 92 und 93 sagen, der Start melde `AUTH_RESET`, `AUTH_USER` und
  `AUTH_PASSWORD`. Diese Warnungen sind mit 0.39.1 entfallen.

##### Was gebaut werden könnte

Je Einstellung höchstens vier Zeilen: wofür, was sie bewirkt, wovon sie
abhängt. Begründungen fallen heraus. Entwurf für die beiden Blöcke des
Betreibers:

```
# BEHIND_PROXY -- steht ein Reverse Proxy davor?
# Leer: Kriterion ist direkt erreichbar (Heimnetz, Port 3100).
# 1: ein Reverse Proxy mit HTTPS steht davor. Kriterion wertet dann dessen
# X-Forwarded-Kopfzeilen aus.
# BEHIND_PROXY=

# PUBLIC_ADDRESS -- die Adresse, unter der Kriterion von aussen erreichbar ist.
# Ohne Mailversand optional. Mit Mailversand Pflicht: ohne sie verschickt
# Kriterion keine Links, und die Selbstanmeldung laesst sich nicht einschalten.
# Hinter einem Reverse Proxy beginnt sie mit https://.
# PUBLIC_ADDRESS=https://kriterion.beispiel.de
```

„Was hier bewusst nicht steht" wird eine Liste mit einer Zeile je Eintrag:
wo Zugang, Port, Ort des Backups und Mailzugang stattdessen eingestellt
werden.

##### Offene Entscheidungen

1. Die Umbenennung in „Backup" (Abschnitt „Das Wort heißt Backup" oben)
   fasst dieselben Zeilen an und kommt im selben Schritt. Die beiden Dateien
   tragen das deutsche Wort 18-mal, `docker-compose.example.yml` 12-mal und
   `.env.example` 6-mal. 9 davon sind Pfade (`kriterion-sicherung`,
   `/app/sicherung`). Offen ist, ob die Pfade mit umbenannt werden: ein
   geänderter Pfad verlegt den Ordner bestehender Installationen.
2. Ob die README die herausfallenden Begründungen aufnimmt oder ob sie
   entfallen.

##### Was es anfasst

`.env.example`, `docker-compose.example.yml`. Die Prüfungen lesen aus der
Compose-Datei nur Einstellungen: Dienstname, `BACKUP_DIR` samt Einhängung
und `TZ` (`test/roundtrip.js`:424, `test/source.js`:3232). Die Wächter gegen
Versionsnummern und Verweise auf `Doku/` lesen beide Dateien mit. Keine
Route, kein Schema, kein Format.

#### Nach dem Umlegen von `BEHIND_PROXY` wird jede schreibende Anfrage abgewiesen

**Art: Fehler** (Anmeldung) · **Herkunft: 0.39.1**, Betreiber am
23. September 2026 · **Einschätzung: klein** · zugeordnet zu 0.41.0

##### Woher

Befund des Betreibers vom 23. September 2026 an seiner zweiten
Testinstallation. Die `.env` trug noch `HINTER_PROXY`. Der Name wird seit
0.39.1 nicht mehr gelesen, und der Reverse Proxy wurde nicht mehr erkannt.
Lesen ging, Schreiben nicht: ein neuer Kommentar endete mit „Die Anfrage wurde
abgewiesen. Bitte die Seite neu laden und noch einmal versuchen."
(`server.deniedOrigin`, `server.js`:651). Neu laden half nicht. Nach dem
Umbenennen in `BEHIND_PROXY` lief die Installation wieder.

##### Was auffiel

Der Server wählt die Namen der beiden Cookies je Anfrage. Über einen
erkannten Proxy mit HTTPS heißen sie `__Host-kriterion_session` und
`__Host-kriterion_csrf`, sonst `kriterion_session` und `kriterion_csrf`
(`auth.js`:58 bis :66). Die Seite liest zuerst `__Host-kriterion_csrf`
(`public/app.js`:186).

Wird der Proxy nicht mehr erkannt, findet der Server die Sitzung unter dem
anderen Namen nicht, und der Benutzer meldet sich neu an. Danach stehen beide
Cookies im Browser. Die Seite schickt den Wert des alten. Er passt nicht zur
neuen Sitzung, und jede schreibende Anfrage bekommt 403. Das alte Cookie
bleibt bis zum Abmelden — `clearCookie()` in `auth.js` löscht alle vier
Namen — oder bis es nach `SESSION_DAYS` abläuft.

Dasselbe geschieht, wenn `BEHIND_PROXY` absichtlich ausgeschaltet wird.
`.env.example`:45 bis :47 nennt dafür nur eine neue Anmeldung.

Aus dem Code gelesen; der Ablauf beim Betreiber passt dazu. Nachgestellt ist
er nicht.

##### Was gebaut werden könnte

Der Wächter vor allen Routen (`server.js`:636) setzt das Cookie gegen fremde
Formulare schon heute nach, wenn es fehlt oder nicht passt (`server.js`:641).
Er löscht dabei zusätzlich das Cookie unter dem anderen Namen (`Max-Age=0`).
Danach hilft auch das Neuladen, das die Meldung empfiehlt. **Einschätzung von
Claude: empfohlen.**

##### Was es anfasst

`server.js` (der Wächter), `auth.js` (die Namen und `clearCookie()`),
`.env.example`, `test/`. Keine Route, kein Schema, kein Format.

#### Ein Download für jedes Bild und jedes Video

**Art: Neue Funktion** · **Herkunft: 0.40.0**, Betreiber am 23. September 2026
· **Einschätzung: klein** · zugeordnet zu 0.41.0

##### Woher

Wunsch des Betreibers vom 23. September 2026: „Ein Downloadbutton für alle
Bilder und Videos."

##### Was heute dasteht

- Anhänge haben einen Download: ein Link mit `download`
  (`public/app.js`:6470).
- Fotos und Videos eines Eintrags und die Bilder eines Kommentars öffnen sich
  in der Bildansicht `openLightbox()` (`public/app.js`:4492). Sie hat Knöpfe
  für Zoom, Löschen und Schließen, keinen für den Download.
- `/api/photos/:id/raw` liefert das Original aus, Videos mit Range.
  `/api/comment-images/:id/raw` liefert das Kommentarbild so aus, wie es beim
  Hochladen neu kodiert wurde; das Original gibt es nicht mehr.
- `photos` hat keine Spalte für den Dateinamen. Der Name kommt aus
  `setImageHeader()` (`attachments.js`:145): `foto-<Nummer>.<Endung>`, bei
  Kommentarbildern `bild-<Nummer>.<Endung>`.

##### Was gebaut werden könnte

Ein Knopf in der Kopfzeile der Bildansicht, als Link mit `download` auf die
Adresse des Originals. Der Server bleibt, wie er ist: das Attribut wirkt bei
Adressen derselben Herkunft. **Einschätzung von Claude: empfohlen.**
**Draußen üblich: ja** — Google Fotos und Nextcloud haben den Download in der
Kopfzeile der Einzelansicht.

##### Offene Entscheidungen

**Entschieden am 23. September 2026:** ein Knopf je Foto und Video, kein
Download für alle. Vorgabe des Betreibers.

1. Ein Knopf je Bild und Video in der Bildansicht, oder zusätzlich „alle
   herunterladen" für einen Eintrag. Das zweite braucht eine Route, die ein
   ZIP schreibt; `package.json` hat dafür keine Abhängigkeit.
2. Der Dateiname: `foto-<Nummer>` wie heute, oder der Titel des Eintrags mit
   laufender Nummer.

##### Was es anfasst

`public/app.js` (`openLightbox()`), `public/style.css` (`.lb-tools`), die drei
Sprachdateien (ein Titel für den Knopf), `test/`. Ohne ZIP: keine Route, kein
Schema, kein Format.

#### Kurze Videos in Kommentaren

**Art: Neue Funktion** · **Herkunft: 0.40.0**, Betreiber am 23. September 2026
· **Einschätzung: mittel** · zugeordnet zu 0.41.0

##### Woher

Wunsch des Betreibers vom 23. September 2026: „kurze Videos auch für die
Kommentare".

> **DAS KONZEPT HAT ES AUSDRÜCKLICH NICHT VORGESCHLAGEN.**
> `Doku/Konzept_Video_und_grosse_Dateien.md`, Abschnitt 16: „Kommentarbilder
> sind bewusst klein und werden neu kodiert. Ein Video dort wäre ein dritter
> Speicherweg für dieselbe Sache." **Der Betreiber hat am 23. September 2026
> anders entschieden.**

##### Was heute dasteht

- `comment_images` (`db.js`:236) hat `filename`, `thumb`, `sort_order`,
  `created_at` und `data`. Eine Spalte für die Art oder die Dauer gibt es
  nicht.
- Jedes Kommentarbild wird beim Hochladen neu kodiert (`encodeAll()`,
  `server.js`:4156). Ein Video ginge dabei nicht durch. Einen Umkodierer gibt
  es nicht; das Konzept schließt `ffmpeg` aus.
- Videos am Eintrag stehen in `photos` mit `kind = 'video'` und `duration`.
  Der Browser schickt ein Standbild mit (`stillFrame`), daraus entsteht die
  Kachel. Die Grenze ist 20 MB (`VIDEO_MAX`, `server.js`:3684), ein Video je
  Hochladen.
- `/api/comment-images/:id/raw` liefert ohne Range aus. Ohne Range lässt sich
  ein Video nicht spulen.
- Der Import kodiert jedes Kommentarbild neu und übergeht ohne Meldung, was er
  nicht lesen kann (`server.js`:5246). Ein Video in einer Exportdatei ginge
  dort heute verloren.

##### Was gebaut werden könnte

Der Weg der Eintragsvideos, auf den Kommentar übertragen: Video und Standbild
zusammen hochladen, den Typ aus den Bytes prüfen, das Standbild wird die
Kachel, ausgeliefert wird mit Range. **Einschätzung von Claude: machbar, aber
der größte Punkt dieser Liste** — er braucht voraussichtlich Schema und
Austauschformat.

##### Offene Entscheidungen

**Entschieden im Auftrag vom 23. September 2026:** eine neue Tabelle
`comment_videos`, höchstens 20 MB je Video, Bilder und Videos zusammen
höchstens sechs je Kommentar, Format 19. Die Begründung steht im Auftrag.

1. **Die Grenze für „kurz".** Größe, Dauer oder beides. Die Einträge nehmen
   20 MB je Video.
2. **Die Spalten.** `kind` und `duration` in `comment_images` heißt Schema:
   ja. Ohne eigene Spalte müsste die Art bei jeder Anzeige aus den ersten
   Bytes gelesen werden.
3. **Das Austauschformat.** Ein Video in der Exportdatei braucht die Art im
   Datensatz, oder der Import erkennt sie aus den Bytes. Mit einem neuen Feld
   steigt das Format von 18 auf 19.
4. **Die Zahl.** Ein Kommentar nimmt heute höchstens sechs Bilder
   (`IMAGE_COUNT`). Offen ist, ob ein Video eines davon ist.
5. **Die Runde.** Alle anderen Punkte in 0.41.0 kommen ohne Schema aus. Dieser
   Punkt kann eine eigene Runde bekommen.

##### Was es anfasst

`db.js` (`comment_images`), `server.js` (Hochladen, Auslieferung mit Range,
Export, Import, Papierkorb), `public/app.js` (Kommentarformular, Anzeige,
Bildansicht), die drei Sprachdateien, `README.md`, `manual-de.md`, `test/`,
`counterproof.js`.

**Schema: ja** — eine neue Tabelle `comment_videos`, entschieden im Auftrag.
**Format: 18 → 19.** Alle anderen Punkte kommen ohne beides aus.

---
## 0.41.1 — „Texte und Kommentare"

> **GEBAUT am 25. September 2026** auf 0.41.0. Das Protokoll steht als
> `Doku/Aenderungsprotokoll_0.41.1.md`. Ohne Auftrag; gebaut in den Pull
> Requests #230 bis #244.
>
> **Geändert:** die Texte der Oberfläche in Deutsch, Englisch und Türkisch,
> README, Handbuch, `.env.example`, `docker-compose.example.yml`, CLAUDE.md
> und die Kommentare in allen 37 Quelltextdateien. Kein Verhalten des Servers,
> kein Schema, Austauschformat 19.

---

## 0.42.0 — „Dokumente über einen Document Server ansehen"

**Beschlossen am 21. September 2026.** Eine Instanz, die einen OnlyOffice
Document Server betreibt, zeigt Bürodateien im Betrachter. **Ohne ihn bleibt
alles, wie es ist.**

> Auftrag erteilt am 25. September 2026: `Doku/Auftrag_0.42.0.md`. Der
> Document Server ist Euro-Office, ein Fork von OnlyOffice mit derselben
> Schnittstelle. Drei Punkte weichen von diesem Abschnitt ab:
>
> - Der Abruf wird über das JWT im Header `Authorization` geprüft, das der
>   Document Server mitschickt. Das einmalige Token in der Adresse entfällt.
> - Das Secret ist Pflicht, auch zum Ansehen.
> - Die Karte prüft zusätzlich, ob der Document Server Kriterion erreicht.
>
> Dazu kommen zehn Formate statt drei, OpenDocument eingeschlossen. Die
> Bedingung „nicht aus dem Netz erreichbar" unter Hürde 4 gilt nicht: der
> Browser lädt den Betrachter vom Document Server, also ist er erreichbar.
> Die Zeilenangaben unten sind der Stand von 0.41.1.

### Was heute dasteht

`previewKind()` (`attachments.js`:58) kennt fünf Arten:

| Endung | heute |
|---|---|
| Bild, PDF, Text | eine richtige Vorschau |
| `.docx` | **nackter Text** — `docxPreview()` (`attachments.js`:220) zieht ihn aus `word/document.xml`, ohne Formatierung, ohne Bilder, ohne Tabellen |
| `.xlsx`, `.pptx`, `.odt` und alles Übrige | **keine** |

### Wie die Einbindung läuft

Drei Teile, alle Standard:

1. Die Seite lädt `api.js` **vom Document Server** und baut den Betrachter.
2. Die Konfiguration nennt eine Adresse, unter der **der Document Server** die
   Datei holt.
3. Beim Ansehen bleibt es dabei. Der Rückweg gehört zu 0.43.0.

### Was entschieden ist

| | |
|---|---|
| **Adresse und Geheimnis** | beide in der `.env` oder der Compose-Datei. **Kein Feld in der Oberfläche** — ein Geheimnis in `settings` reiste im Export mit, und ein Geheimnis, das im Export mitreist, ist verloren |
| **Der Schalter** | an der Karte in den Einstellungen, Klemme `adminOnly`. Er ist ein Betriebsschalter für den Fall, dass es mit dem Document Server Ärger gibt — `ownerOnly` trägt im Haus nur das Scharfe |
| **Je Benutzer** | **kein Schalter.** Es ist keine Wahl zwischen zwei gleichwertigen Wegen: ohne Document Server zeigt eine `.xlsx` gar nichts. Und die Frage ist eine des Betriebs, nicht der Bedienung |
| **Kein Bestätigungsdialog** | wer nicht nein sagen kann, wird nicht gefragt. Stattdessen ein **ruhiger, ständiger Vermerk** am Betrachter: die Datei wird vom Document Server angezeigt |
| **Der Ausweg** | herunterladen, wie heute. Wer eine Datei nicht durch den Document Server schicken will, öffnet sie bei sich |
| **Die Rechte** | `mayChange()` (`server.js`:841) unverändert — Admin oder Verfasser der Datei. **Nicht der Eintragsverfasser:** sonst dürfte er eine fremde Datei bearbeiten, aber nicht löschen |
| **Die heutige Vorschau** | bleibt **genau wie sie ist**, wenn kein Document Server da ist. Die Mehrheit wird keinen betreiben, und für die darf sich nichts verschlechtern |

### Die Karte sagt, was los ist

Die Bauform steht schon: `server.backupDirNotSet` sagt wörtlich, dass der
Ordner in der Compose-Datei eingehängt und dort benannt wird. Die Karte
„Dokumente" braucht **fünf Zustände**, sonst sucht man an der falschen Stelle:

1. Keine Adresse in der `.env` — die Karte nennt den Namen der Zeile.
2. Kein Geheimnis in der `.env` — dasselbe.
3. Eingerichtet, aber vom Admin abgeschaltet.
4. Adresse nicht erreichbar — die Karte nennt die Adresse, die sie versucht hat.
5. Erreichbar, aber das Geheimnis wird abgewiesen.

### Die vier Hürden, nach Kosten geordnet

**1. Die Sicherheitsregel.** `server.js`:311 setzt
`default-src 'self'; script-src 'self'; frame-src 'self'`. Der Document Server
braucht ein **Skript** und einen **Rahmen** von fremder Adresse; `script-src`
und `frame-src` müssen sie aufnehmen. **Das ist die teuerste Zeile der Runde** —
die Regel ist heute so eng, weil sie jede fremde Quelle aussperrt, und das ist
bewusst so gebaut. *`frame-ancestors 'none'` bleibt unberührt: es regelt, wer
Kriterion einrahmen darf, nicht umgekehrt.*

**2. Der Document Server ist nicht angemeldet.** Er holt die Datei mit einem
eigenen Ruf, ohne Cookie. `/api/attachments/:id/raw` (`server.js`:3517) braucht
einen zweiten Weg: ein **kurzlebiges, einmaliges Token in der Adresse**. Die
Bauform gibt es — die Tabelle `tokens` trägt `purpose`, `expires_at` und
`used_at`.

**3. Er muss Kriterion erreichen.** Zwei Container: die Adresse, unter der er
die Datei holt, muss **er** auflösen können — nicht `localhost`, nicht die
Adresse aus dem Browser. Im selben Docker-Netz also der Dienstname. Daran
hängen solche Einbindungen am häufigsten.

**4. Der Klartext im Zwischenspeicher.** Die Datenbank liegt verschlüsselt auf
der Platte. Sobald der Document Server eine Datei holt, **liegt sie im Klartext
in seinem Zwischenspeicher.** Solange beide Container demselben Betreiber
gehören und nicht aus dem Netz erreichbar sind, ist das vertretbar — aber es
ist eine Aussage, die vorher gilt und danach nicht mehr.

> **DIE README MUSS DAS SAGEN, UND ZWAR IN DER RUNDE.** Dort steht heute, dass
> der Bestand verschlüsselt auf der Platte liegt. Mit dem Document Server gilt
> das für jede Datei nicht mehr, die jemand ansieht. Der Satz gehört an die
> Stelle, an der die Verschlüsselung erklärt wird — nicht in eine Fußnote und
> nicht in eine spätere Runde.

### Was ausdrücklich nicht dazugehört

**Das Bearbeiten.** Es steht als 0.43.0. Der Nutzen ist ungleich verteilt: heute
sieht man von einer `.xlsx` gar nichts, von einer `.docx` nackten Text — **das
Ansehen ist der große Sprung, das Bearbeiten der kleine.** Und das Bearbeiten
bringt den Rückweg samt zwei offenen Fragen mit.

### Was es anfasst

`server.js` *(Sicherheitsregel, die Route mit Token, die Karte)* ·
`attachments.js` *(eine sechste Art in `previewKind()`)* · `public/app.js`
*(der Betrachter und der Vermerk)* · `public/style.css` · die drei
Sprachdateien · `.env.example` und `docker-compose.example.yml` · `README.md`.

**Schema: nein.** Die Tabelle `tokens` steht schon.

---

## 0.43.0 — „Dokumente über den Document Server bearbeiten"

**Beschlossen am 21. September 2026.** Setzt 0.42.0 voraus: Sicherheitsregel,
Token-Weg und auflösbare Adresse stehen dann schon.

### Der Unterschied zum Ansehen

Beim Ansehen fließt die Datei in eine Richtung. Beim Bearbeiten kommt ein
Rückweg dazu: der Document Server ruft eine Adresse bei Kriterion, sobald der
Letzte das Dokument geschlossen hat, und nennt darin die Adresse der geänderten
Fassung. Kriterion holt sie und schreibt sie nach `attachments.data`.

### Was daran teuer ist

**1. Der Rückweg ist ein Schreibweg.** Die Route, die der Document Server ruft,
ändert einen Bestand — und sie kommt ohne Cookie. Was sie absichert, ist das
Geheimnis aus der `.env`: der Document Server unterschreibt damit, Kriterion
prüft die Unterschrift. **Ohne Geheimnis kein Bearbeiten.** *Beim Ansehen geht
es auch ohne, solange der Document Server keines verlangt; hier nicht.*

**2. Er muss zurückfinden.** Dieselbe Hürde wie beim Holen, nur andersherum:
die Adresse, die in der Konfiguration steht, muss **der Document Server**
auflösen können.

**3. Wer darf ändern.** `mayChange()` (`server.js`:841) — Admin oder wer die
Datei hochgeladen hat. **Dieselbe Regel wie beim Löschen, und sie bleibt
unverändert.** Wer nicht ändern darf, bekommt den Betrachter ohne Schreibrecht.

### Die zwei offenen Fragen

1. **Ersetzen oder daneben legen?** Schreibt der Rückweg in dieselbe Zeile oder
   legt er eine zweite an? Ersetzen ist einfach und verliert den Stand davor.
   Eine zweite Zeile behält ihn und verdoppelt den Platz — bei bis zu 50 MB je
   Zeile ist das keine Kleinigkeit.
2. **Was, wenn die Datei inzwischen gelöscht ist?** Zwischen dem Öffnen und dem
   Rückweg liegt die ganze Bearbeitungszeit. Fällt die Zeile in dieser Zeit,
   trägt der Rückweg in eine Zeile ein, die es nicht mehr gibt.

### Was es anfasst

`server.js` *(die Rückwegroute und die Prüfung der Unterschrift)* ·
`public/app.js` *(Schreibrecht im Betrachter)* · die drei Sprachdateien ·
`README.md`.

**Schema: nein**, solange der Rückweg ersetzt. Eine zweite Zeile je Fassung
bräuchte eine Spalte.

---
## ~~1.0.0 — „Die Zusage"~~ — gestrichen am 15. September 2026

**Es wird kein 1.0.0 geben.** Vorgabe des Betreibers vom 15. September 2026:
was als 1.0 geplant war, ist mit **0.33.0** erreicht.

Der Eintrag lautete: *„Abwärtskompatibilität wird zugesichert, die öffentliche
Schnittstelle steht fest. Dazu die Vorgabewerte und die Tastaturbedienung beim
Sortieren."*

**Was entfällt:** die Zusage als eigene Runde. Die Nummer hing an einer
Bedingung, die im Projektstand in Abschnitt 5 steht: *„Sobald die Schnittstelle
festliegt, kommt 1.0.0."* Diese Bedingung wird nicht mehr geführt.

**Was nicht entfällt:** die zwei Punkte, die der Eintrag mitgetragen hat — die
Vorgabewerte und die Tastaturbedienung beim Sortieren. Sie stehen jetzt als
eigene Zeile in der Tabelle oben, ohne Nummer und ohne Abhängigkeit.

**Folge für die Begründung von Runden:** „vor 1.0.0" ist kein Argument mehr.
Wo es bisher eine Reihenfolge getragen hat, muss ein anderer Grund stehen. Die
Regel steht in `CLAUDE.md`, Abschnitt 3. Der Eintrag 0.36.0 „Sicherheit" war
zuerst mit „vor 1.0.0" begründet und ist am selben Tag berichtigt worden.

---

## Was ausdrücklich draußen bleibt

### Große Dateien bis 2 GB — *weiter draußen, und der Grund ist genannt*

**Der Betreiber am 8. September 2026:** *„Große Dateien lasse ich immer noch
außen vor, weil ich da noch nicht voll überzeugt bin, dass es gut gelingen
wird."*

**Das Papier bleibt** (`Doku/Konzept_Video_und_grosse_Dateien.md`, Teil II) und
**bekommt keine Nummer.** *Es ist kein Teil dieser Strecke.*

> **BERICHTIGT AM 15. SEPTEMBER 2026.** *Hier stand „Es steht nach 1.0.0".
> Diese Einordnung fällt mit dem gestrichenen 1.0.0-Eintrag weg.* **Der
> Grund, warum Teil II draußen bleibt, ist der Satz des Betreibers darüber und
> nicht eine Versionsnummer.**

### Abgelehnt — geprüft, entschieden, und hier steht warum

| | Entscheidung |
|---|---|
| **Der Suchbereich als Häkchen** | **Abgelehnt** *(8. September 2026)*: „das, wie es heute funktioniert, ist ausreichend" |
| **Zwei Einträge zu einem machen** | **Abgelehnt.** *Der Hinweis beim Anlegen verhindert den zweiten Eintrag, bevor er entsteht — und das ist der Fall, der zählt* |
| **„Entfällt" am einzelnen Kriterium** | **Abgelehnt.** *Gemeint war: heute sieht ein Kriterium, das man noch nicht bewertet hat, genauso aus wie eines, das es an diesem Gegenstand gar nicht gibt — beides ist `0`. Ein Eintrag sieht dadurch für immer unvollständig aus. **Der Betreiber konnte mit dem Punkt nichts anfangen, und das ist die Antwort:** wer den Fall nicht hat, braucht den dritten Zustand nicht* |
| **Sicherungen gepackt ablegen** | **Abgelehnt, bleibt wie es ist.** *Gemessen: eine verschlüsselte Sicherung lässt sich nicht packen — sie ist schon Rauschen* |
| **Ein Versanddienst über HTTPS statt SMTP** | **Abgelehnt** — der Weg ist nicht das Problem, siehe 0.29.0 Punkt 5 |
| **Die Tagwolke füllt den Platz unter „mehr" mit** | **Abgelehnt** *(8. September 2026)*. *Sie brächte 60 px je Zeile ab der zweiten und kostet den Umbau der ganzen Wolke von Flex auf Fließsatz — alle Maße aus 0.13.0 würden neu messbedürftig* |
| **Ein QR-Bild für den zweiten Faktor** | **Abgelehnt.** *Der anklickbare Verweis trägt den Weg auf dem Telefon* |
| **Vorlagen für Einträge · Tags in Mengen bearbeiten · Druckstylesheet** | **Abgelehnt.** *Nützlich, keins davon dringend — und diese Strecke arbeitet ab, was dasteht. Das Umbenennen von Tags kann die Karte „Tags" heute schon* |
| **Ein Admin kann den zweiten Faktor verlangen** | **Abgelehnt** — die Antwort ist nein |
| **Ein echter Teillauf als eigener Punkt** | **Ersetzt** durch 0.34.0, wo er hingehört |

### Zurückgestellt — mit der Bedingung, unter der es wiederkommt

| | Bedingung |
|---|---|
| **Erwähnungen im Kommentar** (`@name`) | **Der Betreiber hat gefragt, warum nicht — und die Idee ist gut. Es scheitert an zwei Dingen, und beide sind größer als die Erwähnung selbst.** *(1)* **Wer wen sehen darf, ist ungeklärt:** `@name` verlangt eine Namensvervollständigung über alle Zugänge, und die Zugangsliste steht heute hinter dem Admin — **eine Erwähnung machte aus ihr eine Auskunft für jeden.** *(2)* **Die Glocke kann kein Ziel tragen:** sie führt einen Zeitstempel und keine Tabelle. „Diese Meldung gilt dir" wäre eine Angabe **je Meldung** — genau die Tabelle, die 0.16.0 ausdrücklich nicht gebaut hat. *Eine Erwähnung ohne Lesestand je Meldung räumt sich beim Öffnen der Tafel selbst mit weg.* **Was sie also wirklich ist: eine eigene MINOR-Runde mit Schemaanteil — und die müsste vor 0.33.0 liegen.** *Sie steht damit nicht auf „nie", sondern auf „nicht in dieser Strecke, es sei denn, sie verdrängt eine der fünf".* |
| **Eine Messung im echten Browser** | **Der Weg ist gefunden** — Chromium über das DevTools-Protokoll, den Client bringt Node seit v22 mit, **keine neue Abhängigkeit.** *Offen ist nicht das Werkzeug, sondern ob es in den Baum gehört: ein Lauf, der einen Browser startet, braucht Chromium auf der Maschine, und die hat nicht jeder.* **Entschieden am 15. September 2026 beim Bauen von 0.34.0: nein.** Die Runde hat keine neue Abhängigkeit aufgenommen. Der Grund ist der Speicher gewesen, und der ist ohne Browser gelöst; ein Lauf, der Chromium startet, verlangt Chromium auf der Maschine, und die hat nicht jeder. Die Frage bleibt offen und steht weiter hier |
| **Der angepinnte Block kann zur Wand werden** | **Beobachten, nicht bauen.** *Wenn es im Betrieb stört, ist die Antwort NICHT eine Einschränkung des Anpinnens, sondern eine zweite Sortierstufe innerhalb des Blocks* |
| **Ein abgerissener Prüflauf von 0.9.1** | **Nicht wegerklärt, sondern nicht wiederholt.** *Wer ihn wiedersieht, schreibt den Lauf vollständig mit* |

---

## Was mit dieser Fassung erledigt ist — ohne Nummer

**Drei Papierpunkte, am 8. September 2026 von Hand gemacht** statt in eine Runde
gelegt:

* **Zweiundvierzig Stellen im Projektstand und fünf im Sammelblatt nannten noch
  `pruefung.js` und `gegenprobe.js`.** Die Dateien heißen seit 0.24.1
  `testbench.js` und `counterproof.js`. *Seit drei Runden offen; jetzt
  umgestellt.* **Das CHANGELOG behält seinen alten Befehl** — es hält fest, was
  zu seiner Zeit getippt wurde.
* **Zwei Konzeptpapiere trugen je einmal „Anlage"** statt „Instanz"; seit 0.17.1
  heißt es überall Instanz, und die beiden Papiere waren damals ausdrücklich
  ausgenommen worden. *Jetzt nachgezogen.*
* **Zwei Dateisätze tragen die Nummer 0.9.1**, und das CHANGELOG sagt jetzt,
  welcher welcher ist: **`cb73399d`** ist das zuerst veröffentlichte,
  **`3cf1b093`** der nachgezogene Satz — **und der gilt.**

---

## Die Auflagen für alles hier

1. **`npm test` grün bei jedem Commit**, und jede neue Prüfung hat ihre
   Gegenprobe **gefahren**. *Eine stumme Gegenprobe ist ein Fund.*
2. **Jede Runde hat einen Auftrag**, und der Auftrag stellt seine Fragen, bevor
   die erste Zeile entsteht.
3. **Papiere und Kommentare bleiben deutsch** *(S9)*, Namen im Code bleiben
   englisch.
4. **Was gebaut ist, steht nicht mehr im Sammelblatt** — es steht im
   Projektstand und im Änderungsprotokoll seiner Runde *(Regel 2 des
   Sammelblatts)*.
5. **Was eine Nummer bekommt, zieht aus dem Sammelblatt hierher** *(Regel 3)*.

---

# Anhang — die Ausarbeitungen

**Fünfzehn ausgearbeitete Punkte sind am 8. September 2026 aus
`Doku/Fehler_und_Ideen.md` hierher gezogen** — nach Regel 3 des Sammelblatts:
*was eine Nummer hat oder entschieden ist, steht nicht dort, sondern hier.*
**Mitsamt ihrer Ausarbeitung**, wie beim Umzug in den Projektstand am
28. August 2026. *Das Sammelblatt trägt seither nur noch, was offen ist.*

> **DIE ÜBERSCHRIFTEN UND NUMMERN SIND DIE DES SAMMELBLATTS GEBLIEBEN.** *Wer
> in einem älteren Papier „Punkt 12 des Sammelblatts" liest, findet ihn hier
> unter derselben Nummer wieder. Eine Umnummerierung machte jeden Verweis der
> letzten zwölf Runden falsch (Stolperstein 201).*


---

## Ausarbeitungen zu 0.24.4 — Türkisch und die Befunde

Diese drei standen im Auftrag `Doku/Auftrag_0.24.4.md` *(weggefallen — es liegt immer nur einer im Repo)* als **B4**, **B6** und
**B7**.

> ## SIE SIND AM 8. SEPTEMBER 2026 GEBAUT WORDEN.
> **Alle drei sind mit 0.24.4 herausgegangen** — was gebaut wurde, steht im
> Änderungsprotokoll 0.24.4. **Die Ausarbeitungen bleiben hier stehen**, weil
> sie die Herleitung tragen und weil ein gelöschter Punkt beim nächsten Mal
> neu aufgeschrieben wird (Stolperstein 201).
>
> **Von Punkt 16 bleibt EINE Hälfte offen:** die **Detailansicht** im
> Papierkorb (Schritt 2 aus Frage F7 des Auftrags). *Gebaut ist Schritt 1 —
> die Zeile nennt jetzt Name, Anleger, Löschdatum und Löschenden.* Ein
> Vorschaubild ist teurer als es aussieht: die Zeilen liegen im Papierkorb als
> Gebilde und nicht mehr in `photos`.

## 15. Der leere Kasten zeigt ein Bildzeichen und sieht aus wie ein Fehler

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.24.4, dort Befund B4. GEBAUT AM SELBEN TAG.** **`emptyState()` setzt kein Zeichen mehr; `ICON_PH` bleibt an seinen drei richtigen Rufern.** *Die Einschätzung unten ist die von vor der Entscheidung und bleibt als Herleitung stehen.*

**Art: Design** · **Einschätzung: empfohlen** — *eine Konstante und vier
Aufrufstellen; die Sache selbst ist eine Zeile* · **Draußen üblich: ja**

### Woher

**Aus dem Betrieb, 8. September 2026**, beim Durchsehen von 0.24.3. Mit zwei
Bildern gemeldet — dem leeren Kommentarkasten und dem leeren Dateikasten.

*Der Punkt ist ÄLTER als 0.24.3 und geht auf **0.22.0** zurück* (Commit
`94689ca`, „Oberfläche 0.22.0"). Die Runde hat ihn weder verursacht noch
angefasst; er ist beim Ansehen der zweiten Sprache aufgefallen.

### Was auffiel

**Ein Eintrag ohne Kommentare zeigt über dem Satz „Noch keine Kommentare." ein
Bildzeichen** — ein Rechteck mit Sonne und Bergen, das übliche Zeichen für
„hier steht ein Bild". **Das liest sich wie ein Bild, das nicht geladen
werden konnte**, und nicht wie ein Kasten, in dem noch nichts steht.

**Dasselbe im Dateikasten** („Noch keine Dateien…"), und aus demselben Grund:

```js
const ICON_PH = `<svg …><rect …/><circle …/><path d="M3.5 17l5-4.5 …"/></svg>`;
const emptyState = (sentence) =>
  `<div class="empty-state">${ICON_PH}<span class="hint">${esc(sentence)}</span></div>`;
```

**`ICON_PH` ist ein BILD1f76adac, und als solcher ist er auch richtig** —
er steht an der Kachel ohne Foto (`drawCards()`) und im Bildstreifen ohne
Bilder (`drawStrip()`). *Dort meint er, was er zeigt.*

**`emptyState()` benutzt ihn für vier Kästen, die mit Bildern nichts zu tun
haben:** Testtage, Links, Dateien und Kommentare. **Ein Zeichen, das an zwei
Stellen etwas anderes bedeutet, ist an einer von beiden falsch** — und hier
bedeutet es „hier fehlt etwas, das da sein sollte" statt „hier ist noch
nichts".

*Die leere Übersicht (`list.nothingYet`, `list.noHits`) benutzt es ebenfalls;
sie ist im Bild nicht gemeldet, hängt aber an derselben Konstante.*

### Was es nicht ist

**Kein Fehler im Sinne von „etwas funktioniert nicht".** Der Kasten ist in
Ordnung, der Satz darunter stimmt, und nichts ist kaputt. **Es ist eine
Falschaussage des Zeichens** — und genau deshalb ein Punkt der Art *Design*
und nicht *Fehler*.

**Auch keine Frage der Sprache.** Er sieht auf Deutsch genauso aus wie auf
Englisch; er ist beim Durchsehen der zweiten Sprache nur aufgefallen, weil man
dabei jede Ansicht einmal ansieht.

### Was gebaut werden könnte

> **Vorschlag von Claude:** `emptyState()` bekommt **sein eigenes Zeichen** und
> lässt `ICON_PH` dort, wo er hingehört. *Naheliegend ist ein leerer Kasten mit
> gestrichelter Kante oder ein Blatt mit Umriss — was „hier ist Platz" sagt und
> nicht „hier fehlt ein Bild".*
>
> **Oder gar kein Zeichen.** Der Satz „Noch keine Kommentare." sagt alles, was
> zu sagen ist; ein Zeichen darüber fügt nichts hinzu und kostet Höhe in einem
> Kasten, der ohnehin nur wartet. *Das ist die kleinere Änderung und die
> ehrlichere: ein Bild, das nichts erklärt, ist Zierde.*
>
> **Zu entscheiden ist das am Auftrag der Runde und nicht hier** — es ist eine
> Geschmacksfrage mit zwei vertretbaren Antworten, und der Betreiber sieht die
> Kästen jeden Tag.

### Was es anfasst

`public/app.js` — die Konstante `emptyState()` und, falls ein eigenes Zeichen
kommt, eine neue Konstante daneben. `public/style.css` — die Klasse
`.empty-state`, falls die Höhe sich ändert. **Kein Server, kein Schema, keine
Sprachdatei** *(der Satz bleibt, wie er ist).*

---

## 16. Der Papierkorb — ein Zeichen als Quelltext, und eine Zeile ohne Ordnung

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.24.4, dort Befund B6. TEIL A UND SCHRITT 1 VON TEIL B SIND AM SELBEN TAG GEBAUT.** **Die Detailansicht bleibt offen.** *Teil A (das Zeichen im Satz) als Fehler, Teil B (die Zeile des Papierkorbs) als Schritt 1.* *Die Detailansicht ist ausdrücklich eine eigene Runde.*

**Art: Fehler (A) und Design (B)** · **Einschätzung: A empfohlen** — *eine
Zeile, und sie nimmt einen sichtbaren Schaden weg* · **B: am Auftrag zu
entscheiden** · **Draußen üblich: ja**

### Woher

**Aus dem Betrieb, 8. September 2026**, beim Durchsehen von 0.24.3, mit Bild
gemeldet. *Beide Teile sind ÄLTER als 0.24.3 — die Runde hat sie weder
verursacht noch angefasst.*

---

### A · Das Wiederherstellen-Zeichen steht als Quelltext in der Zeile

**Was zu sehen ist:** in der Karte „Papierkorb" steht unter dem Namen des
Eintrags eine Zeile

```
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="current…
```

— **der Quelltext des Zeichens, abgeschnitten am Kastenrand.** Das Zeichen
selbst fehlt, und die Zeile sieht aus, als sei etwas kaputt.

**Die Ursache steht in einer Zeile und ist eine Regel, die richtig ist:**

```js
${tH('card.restoreIcon', { restoreIcon: ICON_RESTORE })}
```

**`tH()` maskiert die eingesetzten Werte — ausdrücklich und mit Absicht.** Der
SATZ kommt aus der Sprachdatei und trägt kein HTML; der WERT kommt vom
Benutzer oder aus dem Vokabular und wird maskiert (Stolperstein 18 in
Dateiform, Konzept 4.2). **Ein Zeichen durch diesen Weg zu schicken heißt, es
als Text auszugeben** — und genau das geschieht.

**Verursacht hat es 0.24.0**, beim Umzug der Sätze in die Sprachdatei: aus dem
gebauten `${ICON} Wiederherstellen` wurde ein Satz mit Platzhalter
(`"{restoreIcon} Wiederherstellen"`), und der Platzhalter ist ein Wert.
*0.24.1 hat die Stelle nur umbenannt, 0.24.3 sie nicht angefasst.*

**ES IST DIE EINZIGE STELLE.** Nachgezählt am Quelltext: kein zweites `ICON_`
geht durch `t()` oder `tH()`.

> **Vorschlag von Claude:** das Zeichen aus dem Satz herausnehmen und daneben
> stellen — `${ICON_RESTORE} ${tH('card.restore')}`. **Der Schlüssel
> `card.restoreIcon` fällt damit weg**, und die Sprachdatei verliert einen
> Platzhalter, den kein Übersetzer je füllen könnte. *Ein Zeichen ist kein
> Wort und gehört nicht in einen Satz, den man übersetzt.*
>
> **Und ein Wächter gehört dazu:** kein `ICON_` durch `t()` oder `tH()`. Er
> ist eine Zeile über den Quelltext und hätte diesen Fund seit 0.24.0
> gehalten.

---

### B · Die Zeile sagt zu wenig, um etwas entscheiden zu können

**Was der Betreiber sagt:** *„Darstellung von Papierkorb komisch. Besser wäre
Eintragsname, Eintrags-Einträger und Datum, vielleicht ein kleiner Thumb vom
Hauptbild wenn noch Platz da ist — oder wenn man drauf klickt als
Detailansicht. Da muss ein sinnvoller Workflow her."*

**Was heute dasteht:** der Titel, zwei Knöpfe und eine graue Zeile
*„gelöscht 08.09.2026, 10:36 von erika · noch 30 Tage · 12,2 MB"*.

**Woran das hakt:** die Zeile beantwortet „**wann** ist es weg" und „**wie
groß**" — aber nicht die Frage, die vor dem Wiederherstellen steht: **„ist das
der Eintrag, den ich meine?"** *Bei einem Eintrag namens „Testeintrag" ist das
egal; bei zwanzig gelöschten Einträgen mit ähnlichen Namen ist es die einzige
Frage.*

**Was fehlt, in der Reihenfolge des Betreibers:** wer den Eintrag ANGELEGT hat
(heute steht nur, wer ihn gelöscht hat), sein Datum — und ein Bild.

> **Zu klären am Auftrag der Runde, nicht hier:**
> * **Kachel oder Detailansicht?** Ein kleines Vorschaubild je Zeile ist die
>   kleinere Änderung; eine Detailansicht auf Klick ist der „sinnvolle
>   Workflow", nach dem der Betreiber fragt — und sie ist eine neue Ansicht.
> * **Was liefert der Server?** `GET /api/trash` gibt heute Titel, Zeitpunkt,
>   Löschenden, Frist und Bytes. **Anleger und Hauptbild sind nicht dabei** —
>   *und ein Vorschaubild aus dem Papierkorb ist keine Kleinigkeit: die Zeilen
>   liegen im Papierkorb als Gebilde und nicht mehr in `photos`.*
> * **Wie viel Papierkorb will man sehen?** Die Karte ist eine Liste zum
>   Aufräumen und keine zweite Übersicht. *Wer sie zur Übersicht ausbaut, baut
>   die Übersicht ein zweites Mal — und zwei Orte für dieselbe Frage sind einer
>   zu viel (Stolperstein 47).*

### Was es anfasst

**A:** `public/app.js` (eine Zeile), `public/languages/de.json` und `en.json`
(ein Schlüssel fällt), `testbench.js` (ein Wächter dazu). **Kein Server.**
**B:** `server.js` (`GET /api/trash` wächst), `public/app.js`,
`public/style.css` — **und je nach Antwort auf „Kachel oder Detailansicht"
auch eine neue Route.**

---

## 17. Kategorien und Tags lassen sich in ihrer Karte nicht anlegen

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.24.4, dort Befund B7. GEBAUT AM SELBEN TAG — samt `POST /api/tags`, ohne Rollenfrage im Kopf und mit der Klemme im Rumpf; `F_ROUTES` steht seither auf 71.** *Und eine Annahme unten ist inzwischen widerlegt: `POST /api/tags` gibt es NICHT — für die Karte „Tags" ist eine Route mehr zu bauen. Der Text ist an der Stelle richtiggestellt.*

**Art: Verbesserung** · **Einschätzung: empfohlen** — *die Bauform steht schon,
zweimal, in der Karte daneben* · **Draußen üblich: ja**

### Woher

**Aus dem Betrieb, 8. September 2026**, beim Durchsehen von 0.24.3, mit Bild
gemeldet. *Älter als 0.24.3 — die Runde hat die Karte nur um eine Sprachzeile
erweitert.*

### Was auffiel

**Die Karte „Kategorien" kann umbenennen und löschen — aber nichts anlegen.**
Ihr Satz sagt es selbst: *„Umbenennen oder löschen. Beim Löschen bleiben die
Einträge erhalten und haben nur keine Kategorie mehr."* **Die Karte „Tags"
ebenso.**

**Die beiden Kriterienkarten daneben können es:** ein Feld, ein Knopf
„Anlegen", fertig.

```js
<input class="input input-sm" id="${k.field}" placeholder="…">
<button class="btn btn-sm" id="${k.button}">${tH('entry.create')}</button>
```

**Was der Betreiber will:** *„Der Admin sollte hier jederzeit was anlegen
können, ähnlich wie bei Bewertung: Kriterien und Potenzial: Kriterien."*

### Was es nicht ist

**Kein Fehler.** Kategorien und Tags entstehen heute **am Eintrag** — dort
steht ein Feld, und der Schalter „Neue Kategorien darf jeder anlegen"
entscheidet, wer es sieht. *Der Weg existiert also; er ist nur nicht dort, wo
man ihn beim Verwalten sucht.*

**Und es ist kein Rechtethema.** Die Klemme am Schalter steht, und die Karte
müsste nichts DÜRFEN, was der Server nicht schon erlaubt.

> **NACHGEZÄHLT AM 8. SEPTEMBER 2026, und die erste Fassung dieses Punktes lag
> daneben:** hier stand, `POST /api/product-categories` und `POST /api/tags`
> gäbe es beide längst. **Für Kategorien stimmt es. Für Tags nicht.**
>
> | | was dasteht |
> |---|---|
> | Kategorien | **`POST /api/product-categories`** — der Weg steht, es fehlt allein das Feld |
> | Tags | `/api/tags` kennt **GET, PUT, DELETE** und sonst nichts. Angelegt wird ein Tag heute **nur am Eintrag** (`POST /api/items/:id/tags`) oder beim Import |
>
> **Für Tags ist also eine Route mehr zu bauen als ein Eingabefeld** — und sie
> trägt dieselbe Klemme, die am Eintrag schon hängt
> (`mayCreate(req, 'tagsFreeCreate')`). *Die Begründung dafür steht im
> Quelltext und gilt unverändert: Nachschlagen und Anlegen sind zwei Schritte,
> weil die Klemme dazwischen gehört — „ein gemeinsamer Helfer trüge die Klemme
> in seinem eigenen Rumpf, und dann ließe sie sich nirgends gegenprüfen".*

### Was gebaut werden könnte

> **Vorschlag von Claude:** dieselbe Zeile wie an den Kriterienkarten, unter
> die Liste. **`manageList()` zeichnet ohnehin alle drei Karten**, und
> `MANAGE_KIND` trägt schon die Unterschiede je Karte (`sortable`, `counter`,
> `weight`, `perLanguage`) — *ein Eintrag `create` daneben, und das Feld steht
> an allen dreien oder an keiner, ohne eine Abfrage auf den Kartennamen.*
>
> **Zwei Fragen gehören an den Auftrag und nicht hierher:**
> * **In welcher Sprache legt man an?** Die Karte hat seit 0.24.3 einen
>   Umschalter. *Ein neues Kategorie in einer zweiten Sprache anzulegen ergibt
>   keinen Sinn — die Grundzeile ist die erste Fassung.* Naheliegend: das Feld
>   legt IMMER die Grundzeile an, und der Umschalter fasst es nicht an. **Das
>   ist dieselbe Regel wie beim Umbenennen ohne Sprachangabe** (0.24.3,
>   Bauabschnitt 6a) und sollte deshalb auch so heißen.
> * **Was ist mit dem Schalter „darf jeder anlegen"?** Er entscheidet über den
>   Weg AM EINTRAG. *Ein Admin darf ohnehin; das Feld in der Karte hängt an
>   `ADMIN` und nicht am Schalter.*

### Was es anfasst

`public/app.js` — `cardCategories()`, `cardTags()`, `MANAGE_KIND` und
`manageList()`. **Kein Schema.** *Für Kategorien auch kein Server: der Weg
steht.* **Für Tags eine Route mehr** — `POST /api/tags`, hinter `ADMIN`, über
die vorhandenen `findTag()` und `createTag()` und mit der Klemme aus dem
Kasten oben. Die Sprachdatei bekommt zwei Platzhaltertexte für die Felder.

---


---

## Ausarbeitungen zu 0.26.0 — die kleinen Fehler

## 11. Drei kleine Anzeigefehler aus dem Augenschein zu 0.22.0

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.26.0, Gruppe A.**

**Aufgefallen am 4. September 2026 beim Augenschein zu 0.22.0** — beim
Durchsehen von 64 Bildschirmfotos je Rolle und je Schirm. **Alle drei sind
älter als jene Runde und stehen so auch in 0.21.1**; sie sind dort ausdrücklich
als „Zeilen fürs Sammelblatt, keine für diese Runde" abgelegt worden, und
0.22.1 hat sie nicht mitgenommen (Entscheidung des Betreibers beim Start).

> **Art: Fehler** (drei kleine) · **Claude: empfohlen** — *zwei davon sind je
> eine Zeile im Stilblatt.*
> **Draußen üblich:** ein Titel, der auf dem Telefon umbricht, statt
> abgeschnitten zu werden; keine Leerzeichen vor einer Klammer.

### Was auffiel

1. **Der Eintragstitel wird auf dem Telefon rechts abgeschnitten statt
   umgebrochen.** *Ein langer Titel ist damit auf dem Gerät, an dem man ihn am
   ehesten sucht, nicht zu lesen.*
2. **„Mit Fotos (~ 301,5 KB )" trägt ein Leerzeichen vor der Klammer** — es
   kommt vom `gap` des `.btn`, nicht aus dem Text. *Die Klammer sieht dadurch
   aus, als fehlte etwas darin.*
3. **Die Karte „Bewertung: Kriterien" erklärt dem Benutzer das Gewicht, das er
   nicht stellen kann.** *Der Satz liest sich als Erklärung der Marke `×1`, die
   er sieht — und beschreibt einen Knopf, den nur der Admin hat.* Das ist
   Sprachregel S5 („ein Text, den nur die Rolle darüber braucht, gehört hinter
   deren Klemme", Stolperstein 315) an einer Stelle, die 0.22.0 übersehen hat.

### Was es nicht ist

**Keine Funktion und keine Regel** — dreimal Anzeige. *Punkt 3 ist eine
Textstelle, die beim Wörterbuch von 0.22.0 durchgerutscht ist; er gehört
inhaltlich zu jener Runde und nicht zu einer neuen Idee.*

### Was es anfasst

`public/style.css` (Punkt 1 und 2), `public/app.js` (Punkt 3), Prüfungen,
Gegenproben. **Kein Schema, keine Route, kein Vokabelwort.**

---

## 12. Die Übersicht braucht beim Betreten rund eine Sekunde

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.26.0, aber die Runde MISST ZUERST.** *Eine Sekunde „fühlt sich langsam an" ist keine Zahl; je nachdem, ob die Zeit im Warten auf die Bilder, im Zeichnen oder im Rechnen davor liegt, ist die Reparatur eine ganz andere.*

**Art: Fehler · Einschätzung: empfohlen, aber eine Beobachtung fehlt · Draußen üblich: ja**

### Woher

**Aus dem Betrieb, 5. September 2026.** Am Telefon über Mobilfunk gegen einen
entfernten Wirt, 0.22.1 · `15c9b736`. Der Betreiber hat es gemeldet und die
Beobachtung auf Nachfrage geschärft: *„overview → Einstellung → overview →
Eintrag → overview. All das hat beim Lademoment zu overview eine Zeit von ca.
1 Sekunde. Lademoment von overview weg ist blitzschnell."*

**Und ausdrücklich auch dann, wenn man sich in Sekunden durchklickt** — nicht
nur nach längerer Pause. Damit ist jeder Zwischenspeicher noch warm.

### Was auffiel

**Die Asymmetrie ist der ganze Befund, und sie zeigt in eine Richtung:**

| Ansicht | Abrufe | Bilder | Gefühl |
|---|---|---|---|
| Einstellungen | **zwölf**, darunter `/api/stats` | **0** | blitzschnell |
| Eintrag | drei | 1 (`medium`) | blitzschnell |
| **Übersicht** | fünf | **13 × 45 kB = 585 kB** | **≈ 1 Sekunde** |

**Zwölf Abrufe sind schnell, fünf sind langsam.** Die Zahl der Abrufe erklärt
es also nicht, und die Leitung allein auch nicht — `/api/stats` rechnet dabei
sogar die Exportgröße über 375 MB aus. **Die einzige Größe, die dem Symptom
folgt, ist die Bildmenge.**

### Was es nicht ist

**ES IST NICHT DER SERVER. Das ist gemessen und braucht kein zweites Mal
gemessen zu werden.** Nachgebaut wurde eine verschlüsselte Datenbank mit den
Kennzahlen des Betreibers — 13 Einträge, 89 Fotos, 42 Kommentare, 25 Links,
11 Testtage, **333,5 MB** —, der echte Server dagegen gestartet und jede Route
einzeln gemessen:

| | kalt | warm | Größe |
|---|---|---|---|
| `/api/items` | **17 ms** | 7 ms | 8,7 kB |
| `/api/product-categories` | 4 ms | 2 ms | — |
| `/api/tags` | 2 ms | 2 ms | — |
| `/api/criteria` | 2 ms | 2 ms | 403 B |
| `/api/titles` | 3 ms | 2 ms | 66 B |
| **die fünf aus `loadAll()`** | **≈ 28 ms** | ≈ 15 ms | **≈ 9 kB** |
| eine Kachel, `?size=thumb` | 30 ms | 7 ms | 45 kB |

**Der Server trägt im schlimmsten Fall rund 120 ms bei.**

**ES IST AUCH NICHT `length(thumb)`.** *Der Verdacht lag nahe: der Ausdruck
sprengt den deckenden Index `idx_photos_kachel`, und Stolperstein 279
beschreibt genau diesen Fehlertyp mit 1338 ms.* **Nachgemessen am Datenzuschnitt
des Betreibers** — der fünfmal größere Zeilen hat als die Meßbank von 0.19.5
(3,85 MB gegen 0,73 MB je Zeile):

```
OHNE length(thumb)   SCAN photos USING COVERING INDEX   0,8 ms
MIT  length(thumb)   SCAN photos USING INDEX            2,0 ms
```

**Die Zusage von 0.19.5 hält:** neun Spalten weiter aus dem Index, nur die
Länge aus dem Satzkopf. *Auch daß `data` (3,5 MB) in der Spaltenfolge VOR
`thumb` steht, kostet nichts — eine Kachel auszuliefern dauert 7 ms warm.*

**ES IST AUCH KEINE ZU GROSSE KACHEL.** 512 px kurze Kante; das Telefon zeigt
zwei Spalten à rund 180 CSS-Punkte, bei dreifacher Pixeldichte also 540
Gerätepunkte. **Die 512 sind eher knapp als üppig** — da ist nichts zu holen.

### Was gebaut werden könnte

* **(a) Nicht leeren, bevor Ersatz da ist.** `renderList()` setzt in
  `public/app.js:2590` `app.innerHTML = "Lädt …"` und wartet **erst danach** auf
  `loadAll()`. **Der Bildschirm ist leer, bevor überhaupt gefragt wird.** Egal
  woher die Sekunde kommt — der Benutzer sieht sie als weiße Fläche.
  *Kleinster Eingriff, größte Wirkung auf das Gefühl, und er hilft in jedem
  Fall.* **Und er ändert keine einzige Zahl.**
* **(b) Sofort aus `state.alle` zeichnen, dann nachladen.** Der Bestand liegt
  beim Verlassen des Eintrags noch im Speicher. *Das Blatt begründet an anderer
  Stelle selbst, warum er liegenbleibt: „damit das LEEREN der Suche keine
  Anfrage kostet — ohne ihn wäre die häufigste Handhabung der Suche die
  teuerste."* **Derselbe Gedanke ist auf den Rückweg in die Übersicht nie
  angewandt worden, und der ist häufiger.** *Hat einen Preis:* hat jemand
  anders inzwischen etwas angelegt, steht kurz der alte Stand da — das ist mit
  der Glocke abzugleichen und keine Kleinigkeit.
* **(c) Weniger als fünf Abrufe.** Kategorien, Kriterien und Titel ändern sich
  selten. *Nach der Messung der kleinste Gewinn von den dreien — die fünf
  zusammen sind 28 ms.*

### Offene Entscheidungen

**EINE BEOBACHTUNG FEHLT, UND OHNE SIE IST DIE URSACHE NICHT BEWIESEN.** Sie
passiert im Browser des Betreibers und ist von außen nicht meßbar: im
Netzwerk-Reiter (F12), **„Cache deaktivieren" AUS**, von einem Eintrag zurück
in die Übersicht, und bei den Bild-Abrufen ablesen:

| steht dort … | dann |
|---|---|
| **eine echte Zeit** | der Zwischenspeicher greift nicht — **das wäre der eigentliche Fehler**, und er ist zu suchen. Die Kachel trägt `Cache-Control: private, max-age=86400`, der Browser dürfte gar nicht erst fragen |
| **„(disk cache)" / „(memory cache)"** | die Übertragung ist es nicht — dann bleibt der Neuaufbau, und **(a)** ist die ganze Antwort |

**Am großen Bestand mit mehr als 60 Einträgen ist es noch nicht geprüft.** Dort
wären es rund 2,7 MB Kacheln statt 585 kB — wenn die Übertragung die Ursache
ist, muß es dort deutlich schlimmer sein, und das ist zugleich die Gegenprobe.

### Was es anfasst

**`public/app.js`, `renderList()`** — für (a) zwei Zeilen, für (b) die
Zeichenfolge beim Betreten. **Kein Server, kein Schema, keine Route.**

**Was dagegen spricht:** nichts klemmt, und **(b)** kauft Geschwindigkeit mit
Aktualität. *Wer nur (a) baut, hat den ehrlichsten Gewinn: er macht nichts
schneller, aber er hört auf, den Bildschirm ohne Not zu leeren.*

---

## 13. Zwei Fehler aus dem Rundlauf mit 0.24.2

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.26.0, beide Hälften.**

**Art: Fehler** (zwei) · **Einschätzung: empfohlen** — *der zweite ist eine
einzige Zeile, und er nimmt einen Weg ganz weg* · **Draußen üblich: ja**

### Woher

**Aus dem Betrieb, 7. September 2026**, unmittelbar nach dem Einspielen von
0.24.2 (`ae0084d8`). Der erste ist mit Bild gemeldet.

*Beide sind ÄLTER als 0.24.2 — die Runde hat sie weder verursacht noch
angefasst. Sie sind beim Durchsehen aufgefallen.*

---

### A · Die Sitzungsliste läuft unten aus dem Kasten

**Was zu sehen ist:** die Karte „Meine Sitzungen" zeigt zehn Sitzungen, und
darunter bricht der Satz *„Außer dieser gibt es 9 weitere Sitzungen. Eine
Sitzung läuft…"* mitten in der Zeile ab. **Der Knopf „Andere Sitzungen
beenden" steht gar nicht mehr da** — man kommt an ihn nur noch über einen
Bildlauf, der von außen nicht als solcher zu erkennen ist.

**Die Ursache steht im Stilblatt, und sie ist dort sogar ausgerechnet:**

```
#msessions { max-height: 55.23rem; }
```

Der Kommentar daneben sagt, woraus die Zahl kommt — *„55.23rem SIND ZEHN
SITZUNGSZEILEN UND DIE FUSSZEILE: 10 × 72,55 = 725,5, dazu die 102,88 der
`.session-foot`, die INNERHALB der Liste steht"*. **Gemessen wurde auf einem
breiten Schirm.** Auf einem schmalen ist eine Sitzungszeile höher als 72,55
Pixel, und damit passen zehn Zeilen samt Fußzeile nicht mehr unter den Deckel.
Die Fußzeile ist die, die herausfällt — sie steht als letztes Kind **in** der
rollenden Liste (`box.appendChild(foot)` in `drawSessions()`).

**Was der Betreiber will:** *„die zu vielen Einträge in ein Scrollbalken
unterbringen, und der Kopf sowie Fuß darf nicht aus dem Kasten heraus gehen."*

> **Vorschlag von Claude:** die Fußzeile **aus** `#msessions` heraus und als
> Geschwister daneben in die Karte. Dann deckelt der Deckel nur noch die
> Zeilen, die Liste rollt, und Kopf wie Fuß stehen immer da. **Das Maß wird
> damit wieder das, was es sagt** — zehn Zeilen, ohne die Fußzeile
> hineinzurechnen —, und der Grund, aus dem sie 0.17.3 hineingerechnet wurde
> (*„sonst müsste man an zehn Sitzungen vorbeirollen, um den Knopf darunter zu
> sehen"*), fällt weg: außerhalb der rollenden Liste ist der Knopf ohne Rollen
> zu sehen.

*Zu klären wäre nur noch, ob dieselbe Bauform für die anderen sechs Listen mit
`.manage-list` gilt — die haben heute keine Fußzeile, und eine Regel, die
nirgends sonst greift, gehört an die eine Liste und nicht in die gemeinsame.*

---

### B · Nach dem ersten Bild öffnet die Dateiauswahl nicht mehr

**Was zu sehen ist:** ein Bild über „Datei hochladen" in einen Eintrag
einfügen; danach ein zweites — **die Dateiauswahl geht nicht mehr auf.** Erst
nach F5 geht es wieder. **STRG+V funktioniert die ganze Zeit.**

**Die Ursache ist EINE Zeile** — `public/app.js`, in `uploadFiles()`:

```
const drop = document.getElementById('drop');
const old = drop.textContent;
drop.textContent = t('entry.uploading');
```

`drop` ist das `<label class="drop" id="drop">`, und **in ihm steht das
Eingabefeld**:

```
<label class="drop" id="drop"><input type="file" id="file" accept="…" multiple>
  Hinweistext</label>
```

`textContent` zu setzen wirft **alle Kinder** des Labels weg — den Hinweistext
*und das Eingabefeld*. Am Ende setzt `drop.textContent = old` nur den Text
zurück; **das Feld kommt nicht wieder.** Ein Label ohne Feld hat nichts zu
öffnen, und der `onchange`, der an das alte Feld gebunden war, hängt an einem
Element, das nicht mehr im Baum steht.

**Und genau daraus folgt, warum STRG+V weiter geht:** der Einfügeweg hängt als
Zuhörer am `document` und braucht das Feld überhaupt nicht.

> **Vorschlag von Claude:** den Hinweistext in ein eigenes `<span>` legen und
> nur dessen Text tauschen. **Nicht** `innerHTML` neu setzen — dann wäre der
> `onchange` wieder weg, nur eine Ebene später.

**Schwere:** der Weg „mehrere Bilder nacheinander per Datei einfügen" ist damit
ganz hin, und niemand kommt von selbst darauf, dass F5 hilft. *Der Fehler ist
so alt wie die Fortschrittsmeldung im Ablagefeld.*

---

## 19. Der fünfzehnte Vokabelplatz — „Mehrzahl nach einer Zahl"

> **ABGELEHNT AM 8. SEPTEMBER 2026 — er bekommt keine Nummer.** *„Nein, es
> wird keine Felder für mehrzahlige Angaben auf Türkisch geben. 1 Öğe, 4 Öğe,
> beides geht. Dann ist die Vorgabe für beides halt zwei mal das gleiche."*
> **Der Punkt hat einen halben Tag hier gestanden und ist am selben Tag
> entschieden worden.** *Die Herleitung samt Messung bleibt in
> `Doku/Fehler_und_Ideen.md`, Teil I, Punkt 19 — mit demselben Kasten.*

**„3 Öğeler" stand in der türkischen Kopfzeile, und türkisch ist „3 öğe".**
Die vierzehn Vokabelwörter haben je **einen** Mehrzahlplatz; Türkisch bräuchte
**zwei** — die Einzahl hinter einer Zahl (30 Stellen), die Mehrzahl im Satz
(27 Schlüssel) und an der Beschriftung (5 Stellen). *Kein Wort macht beides
richtig.*

**GEBAUT IST STATTDESSEN, NOCH IN 0.24.4: beide Formen tragen dasselbe Wort.**
Die Zählerstellen stehen damit richtig, **zwölf Sätze in `tr.json` sind dafür
umgeschrieben**, und der Preis steht benannt an fünf Beschriftungen.
***Ausdrücklich keine Regel im Quelltext*** — das wäre genau das, was 0.24.0
bis 0.24.4 abgebaut haben; **die Datei sagt es, und der Code weiß von Türkisch
nichts.** *Die Regel dazu steht als TR-S4 im türkischen Wörterbuch.*

---

## 18. Die Suche findet „übergroß" nicht, wenn man „ÜBERGROSS" eingibt

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.26.0.** *0.24.4 hat die Faltung angefasst und diesen Fall ausdrücklich ausgenommen: er betrifft Deutsch und nicht Türkisch.* **Er ist seither billiger:** die Faltung steht an EINER Stelle (`searchFold()` in `db.js`), beide Hälften der Suche rufen sie, und sie nimmt keine Sprache entgegen — *eine Zeile mehr darin, und der Fall ist erledigt.*

**Art: Fehler** · **Einschätzung: empfohlen** — *aber nicht kostenlos: die
Gleichsetzung trifft in der Gegenrichtung „Masse" und „Maße" mit* · **Draußen
üblich: ja, so gut wie überall**

### Woher

**Beim Nachmessen für 0.24.4 aufgefallen**, am 8. September 2026, als die
Faltung der Suche für Türkisch durchgerechnet wurde. **Niemand hat es
gemeldet** — es ist über all die Runden nur niemandem aufgefallen, weil man
selten in Großbuchstaben sucht. *Herkunft: so alt wie `kkl()`.*

### Was auffiel

**`ß` und `ss` sind für die Suche zwei verschiedene Dinge.**

| im Bestand steht | gesucht wird | heute |
|---|---|---|
| `Stichsäge übergroß` | `übergroß` | **Treffer** |
| `Stichsäge übergroß` | `ÜBERGROSS` | **kein Treffer** |
| `Grüße` | `GRÜSSE` | **kein Treffer** |
| `Grüße` | `GRÜßE` | Treffer |

**Der Grund ist keine Nachlässigkeit, sondern Unicode:** `'ÜBERGROSS'
.toLowerCase()` ist `'übergross'` — mit zwei s. Im Bestand steht `übergroß`
mit `ß`. **Die Faltung ist richtig; es gibt nur kein Kleinbuchstaben-`ß`, das
aus `SS` zurückkäme.** *Und aus `ß` ein `ss` zu machen ginge — dann fände man
aber „Maße" auch bei der Eingabe „Masse", und das sind zwei Wörter.*

### Was es nicht ist

**Kein Türkisch-Thema.** Es betrifft Deutsch, es betrifft nur Deutsch, und es
ist beim Messen für einen ganz anderen Befund mitgefallen.

**Und keine Folge von 0.24.3.** *Die Runde hat an der Faltung nichts geändert;
der Fall ist genauso alt wie die Suche selbst.*

### Was gebaut werden könnte

> **Vorschlag von Claude:** **`ß` und `ss` in der Faltung gleichsetzen** — auf
> beiden Seiten, in derselben Funktion, in der die Groß- und Kleinschreibung
> schon fällt.
>
> **Der Preis steht sofort daneben und gehört genannt:** damit findet
> „Masse" auch „Maße", „Busse" auch „Buße" und „Rasse" auch „Raße". *Das ist
> kein Nebeneffekt, sondern genau dieselbe Gleichsetzung, nur in der anderen
> Richtung gelesen.*
>
> **Für eine SUCHE ist das die richtige Seite des Irrtums:** wer sucht, will
> lieber eine Zeile zu viel sehen als eine zu wenig. **Für einen VERGLEICH
> wäre es falsch** — zwei Kategorien „Masse" und „Maße" wären danach dieselbe.
> *Die Faltung der Suche und der Vergleich der Namen sind zwei Funktionen und
> müssen es bleiben; heute sind sie es auch.*
>
> **Wer das nicht will, lässt es** — und dann steht hier wenigstens, dass es
> bekannt ist und warum es so bleibt.

### Was es anfasst

**Eine Zeile in einer Funktion** — dieselbe, die 0.24.4 für die vier i ohnehin
anfasst *(Befund B8 im Auftrag 0.24.4)*. **Kein Schema, keine Route, keine
Sprachdatei.** *Wenn es je gebaut wird, dann in derselben Runde wie B8 oder gar
nicht — zwei Runden hintereinander an derselben Zeile sind eine zu viel.*

> **AUSDRÜCKLICH NICHT TEIL VON 0.24.4.** Der Auftrag nennt ihn und grenzt ihn
> ab. *Nach Regel 1 dieses Blatts trägt er trotzdem keine Nummer: er ist
> gesammelt, nicht zugeordnet.*

---


---

## Ausarbeitungen zu 0.27.0 — die wählbare Bildablage

> **BEIDE PUNKTE SIND AM 10. SEPTEMBER 2026 GEBAUT.** *Sie bleiben als
> Herleitung stehen — die Messungen und die Abwägung, aus der die Runde
> entstanden ist, stehen sonst nirgends.* **Was daraus geworden ist, steht im
> Änderungsprotokoll 0.27.0.**

## ~~5. Die Ableitungen auf WebP — was von Punkt 15 liegen geblieben ist~~

> **GEBAUT — 0.27.0, im selben Durchgang wie die wählbare Bildablage:** ein Lauf über den Bestand statt zwei. **Die Frage, ob `medium` verlustfrei werden soll, ist gemessen und mit NEIN beantwortet.**

> **STAND 2. SEPTEMBER 2026: er hat eine Nummer bekommen.** Die Ableitungen
> gehen in **0.22.0** mit *(bis zum 3. September 2026 als 0.21.0 geführt;
> gerückt, weil Punkt 8 die 0.20.0 bekommen hat)* — in derselben Runde, die
> über die Verfahren der Bildablage entscheidet. *Ein Durchgang über den
> Bestand statt zwei.*
> **DER GRUND, WARUM ER DRÄNGT, IST MIT 0.19.4 EIN ANDERER GEWORDEN.** Bis
> dahin lautete er: die Vorschaukachel rechnet ihr Bild ohnehin hoch, und was
> man dabei sieht, ist ein JPEG q84. **Das Hochrechnen ist mit 0.19.4 weg** —
> *geblieben ist, dass die Ableitungen JPEG sind, und das ist jetzt der ganze
> Punkt.* **Und sie sind seither größer:** der `thumb` trägt das 3,06fache an
> Bytes eines 16:9-Bildes, und genau daran wäre ein sparsameres Verfahren mehr
> wert als vorher.

**Ausgelöst von 0.19.0** — *und der Punkt steht hier, weil sein GRUND sich mit
jener Runde geändert hat.*

> **Art: Verbesserung** · **Claude: später** — es berührt die Auslieferung und
> ist nicht gemessen.
> **Draußen üblich:** Ableitungen in WebP oder AVIF sind der Normalfall; das
> ist gerade die Stelle, an der draußen umkodiert wird.

### Woher

Aus Punkt 15 (die Bildablage), Teil (b). Er stand dort als *„später, wenn Platz
wirklich knapp wird"*.

### Warum der Grund jetzt ein anderer ist

**Bis 0.19.0 waren die Ableitungen die kleinere Hälfte** — 71,1 MB gegen 497,7
MB Originale, und die Ersparnis wäre eine ohne Not gewesen. **Nach 0.19.0
schrumpfen die Originale auf rund 162 MB, und die Ableitungen bleiben bei 71,1
MB: sie sind damit die größere Hälfte.**

**Und ein zweiter Befund ist dazugekommen.** `medium` ist **JPEG q84** und damit
verlustbehaftet — es franst an Text genauso aus wie die verlustbehafteten
WebP-Stufen. **Was man in der Anwendung anschaut, ist die Ableitung und nicht
das Original.** *0.19.0 macht das Archiv unversehrt und lässt die Anzeige, wie
sie ist. Das ist vertretbar, aber es ist eine halbe Antwort.*

### Warum er trotzdem liegen bleibt

**Es berührt die Auslieferung** (`setzeBildHeader`) und damit einen zweiten Weg
— 0.19.0 fasst nur die Ablage an. **Und die Frage, ob `medium` ebenfalls
`nearLossless` werden sollte, ist NICHT gemessen**; sie braucht einen eigenen
Lauf, nicht eine Vermutung im Vorbeigehen. *Eine Ersparnis, die man nicht
gemessen hat, ist eine Vermutung — dieselbe Regel, an der 0.19.0 selbst hängt.*

### Was es anfasst

`makeVariants()`, `kodiereKommentarBild()`, die Auslieferung, das Nachrüsten
beim Start, Prüfungen, Gegenproben, README. **Kein Schema.**

---

## ~~6. Fotos aus der Zwischenablage — die Ablage soll wählbar werden~~

> **GEBAUT — 0.27.0.**

**Art:** Funktion · **Claude:** empfohlen, mit einer Auflage · **Draußen üblich:**
ja, jede Fotoverwaltung lässt das Ablageverfahren wählen.

### Woher

Aus dem Betrieb, **2. September 2026**: ein JPEG von 5 MB, im Browser über
„Grafik kopieren" genommen und in Kriterion eingefügt, liegt danach als **12 MB**
in der Datenbank. Gemeldet als Verdacht auf einen Fehler in 0.19.0.

### Was gemessen wurde

Die Kette hat **drei** Glieder, und Kriterion sitzt am dritten:

| | |
|---|---|
| das Original im Netz | **5,21 MB** JPEG |
| was die Zwischenablage liefert | **34,79 MB** PNG |
| was Kriterion daraus macht | **20,42 MB** WebP `nearLossless` |
| was verlustbehaftet q90 daraus würde | **6,64 MB** — 67 % weniger |

**Die Zwischenablage trägt keine Datei, sondern Bildpunkte.** Der Browser legt
sie als PNG ab — verlustfrei, aus den *dekodierten* Bildpunkten des JPEG,
Kompressionsspuren eingeschlossen. **Kriterion bläht also nichts auf; es
verkleinert um 41 %, nur von einer Zahl aus, die es vorher nicht gab.**

### Was es NICHT ist

**Keine fehlende Größenprüfung.** `legeBildAb()` nimmt das WebP nur, wenn es
kleiner ist als das, was hereinkam — die Regel gibt es, sie ist als Rückbau 433
bewacht, und sie hat hier richtig entschieden: **das PNG war der große Brocken.**
Achtzehn Laborversuche quer durch Palette, Text, Graustufen, Alpha und 1×1
zeigen: **PNG gewinnt nie über die Größe.**

### Was gebaut werden könnte

**Drei Verfahren zur Wahl**, statt eines Schalters:

* **PNG** — keine Rechenzeit, größte Ablage
* **WebP verlustfrei** (`nearLossless` 60) — heutiges Verhalten
* **WebP verlustbehaftet** — für Fotos; gemessen 67 % kleiner

Und wenn PNG abgewählt wird, bietet die Kachel an, den Bestand nachzuziehen.

### Die Auflage, und sie ist der Grund für „mit einer Auflage"

**Verlustbehaftet darf keine Regel werden, sondern nur eine Wahl.** Gemessen an
einem Bildschirmfoto mit Text ist WebP q90 **rund siebenmal GRÖSSER** als
`nearLossless` — 0,09 gegen 0,01 MB, weil der verlustbehaftete Bitstrom mit
harten Kanten nichts anfangen kann. **Die Entscheidung von 0.19.0 war für
diesen Bestand richtig und bleibt die Vorgabe.**

*Die Rechtfertigung für den verlustbehafteten Weg trägt außerdem nur bei einem
Bild aus der Zwischenablage: dort ist der Verlust schon passiert, bevor
Kriterion es sieht. Bei einem hochgeladenen PNG wäre dasselbe Argument falsch —
und aus den Bytes sind die beiden nicht zu unterscheiden.*

### Der billigste Weg steht gar nicht im Quelltext

**„Bild speichern unter" und dann hochladen: 5,21 MB, kein Generationsverlust,
kein Kodierer, keine Entscheidung.** Kriterion fasst JPEG nicht an. Ein Hinweis
an der Einfügestelle wäre deutlich billiger als jede Wahl — *das spricht nicht
gegen die Wahl, gehört aber in die Abwägung.*

### Was es anfasst

`legeBildAb()`, die Kachel „Bildablage" (ab 0.19.1 eine eigene), der
Umstellungslauf, die zweite Bestätigung. **Kein Schema.**

> **EINGETRAGEN ALS 0.22.0** *(bis zum 3. September 2026 als 0.21.0 geführt;
> gerückt, weil Punkt 8 die 0.20.0 bekommen hat)*, zusammen mit den Ableitungen
> aus Punkt 5.

---


---

## Ausarbeitungen zu 0.28.0 — das Telefon

## 14. Blättern im Eintrag — vor und zurück in der Reihenfolge der Übersicht

> **ENTSCHIEDEN AM 8. SEPTEMBER 2026 — 0.28.0, und die Form steht.** *Der Kopf unten sagt noch „NOCH ZU BESPRECHEN" — das war der Stand vom 7. September und bleibt als Herleitung stehen.* **Entschieden ist:** feine Pfeile in der neuen gemeinsamen Kopfzeile, `Bild auf` und `Bild ab` auf der Tastatur, **die Pfeiltasten bleiben bei den Bildern**, und **keine Wischgeste** — in derselben Ansicht wischt schon die Bildreihe.

> **UND MIT 0.28.1 AM 11. SEPTEMBER 2026 UMGESTELLT — der Ort, nicht die
> Sache.** *Der Betreiber hat die Pfeile am Gerät gesehen:* „aber eintrag
> blättern pfeile da weis ich nicht. was hältst du den wenn wir die von da
> neben dem status machen. dann etwas breiter?" **Zwei Pfeile links und rechts
> von etwas behaupten, das Dazwischenliegende zu blättern — und dazwischen
> stand der Name der Installation.** *Sie stehen seither am **Fuß** des
> Eintrags, breit und mit Wort („‹ Voriger", „Nächster ›").* **Die Tastatur und
> die fehlende Wischgeste bleiben, wie sie hier stehen.**

**Art: Funktion · Einschätzung: NOCH ZU BESPRECHEN — der Wunsch steht,
die Form nicht · Draußen üblich: ja**

> **AM 7. SEPTEMBER 2026 AUSDRÜCKLICH OFFEN GELASSEN.** *Der Punkt ist an
> diesem Tag zunächst als entschieden aufgeschrieben und vom Betreiber noch am
> selben Tag zurückgenommen worden:* **er wird besprochen, bevor er festgelegt
> wird.** *Was feststeht, ist der Wunsch — nicht, wie er gebaut wird und in
> welcher Runde.*
>
> **Und der Grund, ihn nicht durchzuwinken, steht drei Absätze weiter unten:**
> die Pfeiltasten sind in dieser Ansicht bereits belegt. *Eine Funktion, die
> eine vorhandene ersetzt, ist keine Ergänzung — sie ist ein Tausch, und über
> einen Tausch entscheidet man nicht nebenbei.*

### Woher

**Aus dem Betrieb, 7. September 2026:** *„Blättern in der Eintragsansicht durch
die Pfeiltasten rechts/links. Also zum nächsten Eintrag der vorhergehenden
Filter- und Sortieransicht im Overview. Ohne dass man immer zurück zur
Übersicht muss."*

### Was es ist

**Der Eintrag bekommt ein Vor und ein Zurück**, und die Reihenfolge ist
**genau die der Übersicht, aus der man gekommen ist** — nach dem Filter und
der Sortierung, die dort gerade gelten. Wer in der Übersicht „ungetestet, nach
Potenzial" stehen hat und den dritten Eintrag öffnet, kommt mit einem Griff
zum vierten dieser Liste.

*Der heutige Weg ist: zurück zur Übersicht, dort die Stelle wiederfinden, den
nächsten öffnen. Bei einem Rundlauf über zehn Einträge ist das zwanzigmal
hin und her.*

### Drei Fragen — sie sind der Stoff der Besprechung

**1 · Die Pfeiltasten sind schon belegt.** In der Eintragsansicht blättern
`ArrowLeft` und `ArrowRight` heute durch die **Vorschaubilder** des Eintrags
(`public/app.js`, und im Vollbild noch einmal). *Zwei Bedeutungen für eine
Taste gibt es nicht.* Also: **Knöpfe am linken und rechten Rand** und die
Tasten bleiben bei den Bildern? Oder die Tasten wechseln den Eintrag und die
Bilder bekommen einen anderen Griff? **Der Betreiber hat „Pfeiltasten rechts
links" geschrieben — das kann beides heißen, und es wird besprochen.**

**2 · Woher kommt die Reihenfolge?** Sie lebt heute in der Übersicht
(`state.items` samt Filter und Sortierung) und nur dort. **Ein Eintrag, den
jemand über ein Lesezeichen oder einen Link öffnet, hat keine** — dann gibt es
kein Vor und kein Zurück. *Entweder die Pfeile fehlen dort, oder die Ansicht
holt die Reihenfolge nach.* **Die Reihenfolge gehört nicht auf den Server:**
sie ist die Stellung eines Bildschirms, keine Eigenschaft des Bestands.

**3 · Was, wenn der Bestand sich unter der Liste ändert?** Wer mit dem Filter
„ungetestet" blättert und den Eintrag dabei auf „getestet" setzt, fällt aus
seiner eigenen Liste heraus. *Die Reihenfolge einmal beim Betreten festhalten
und dabei bleiben — oder mitziehen?* **Ein Blättern, das einem unter der Hand
umsortiert wird, ist schlimmer als keines.**

**Und am Telefon:** Wischgeste oder nur die Knöpfe? *Wischen kollidiert mit dem
Bildstreifen, der dort schon gewischt wird.*

### Draußen üblich

**Ja, durchweg.** Jede Galerie, jedes Ticketsystem und jede Bilderverwaltung
hat „vorheriger / nächster **in dieser Ansicht**" — und alle merken sich die
Liste beim Betreten, statt sie neu zu rechnen.

---


---

## Geprüft und abgelehnt — die Ausarbeitung bleibt trotzdem stehen

Der Betreiber hat sie am 8. September 2026 abgelehnt. **Die Ausarbeitung wird nicht gelöscht:** *eine Ablehnung ohne die Überlegung, die zu ihr geführt hat, ist beim nächsten Mal keine Ablehnung mehr, sondern eine Erinnerungslücke.*

## 1. „Entfällt" am einzelnen Kriterium — mit Vorbehalt

> **ABGELEHNT AM 8. SEPTEMBER 2026.** *„Kann mit dem Punkt nicht viel anfangen."* **Wer den Fall nicht hat — ein Kriterium, das es an diesem Gegenstand gar nicht gibt —, braucht den dritten Zustand nicht.**

**Keine Version hat ihn ausgelöst** — die Lücke steckt in der Bauform der
Kriterien und ist so alt wie sie.

> **Art: Neue Funktion** · **Claude: nicht empfohlen** — `ratings` hat je Benutzer eine Zeile.
> **Draußen üblich:** „nicht zutreffend" wird durchweg **am Gegenstand**
> geführt und nicht an der Stimme des Bewertenden — bei Umfragewerkzeugen ist
> es eine Eigenschaft der Frage, nicht der Antwort. *Genau daran scheitert der
> Punkt hier: die Bewertung hängt am Benutzer.*

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 4.7), Stand 0.8.6, und
**dort schon mit Vorbehalt aufgenommen**.

### Was auffiel

`value = 0` bedeutet heute „nicht bewertet". Es bedeutet aber auch **„gibt es
hier nicht"** — ein Kriterium „Akkulaufzeit" an einem Gegenstand ohne Akku.
Zwei verschiedene Aussagen, ein Wert. Nach der Doktrin der Instanz: eine zweite
Wahrheit.

Praktisch führt das dazu, dass ein vollständig beurteilter Eintrag
**unvollständig aussieht**, und im Vergleich steht eine Lücke, die man nicht
von „noch nicht drangewesen" unterscheiden kann.

### Was es nicht ist

**Kein Rechenfehler.** Rechnerisch fällt ein Kriterium mit `value = 0` schon
heute aus beiden Schnitten heraus — man **sieht** es nur nicht. Es ist also
eine Frage der Anzeige und der Aussage, nicht des Ergebnisses.

**Und wahrscheinlich gar nicht die richtige Frage.** Sie stellt sich nur bei
**gemischten Beständen** — also genau dort, wo die Antwort eigentlich „eine
Instanz ist ein Sachgebiet" heißt (Projektstand, Abschnitt 10, vorgemerkt für
1.0). *Wer beides baut, baut die Ausnahme zur Regel.*

### Was gebaut werden könnte

Ein dritter Zustand am Sterne-Bedienelement, erreichbar über denselben
Doppelklick, der heute zurücksetzt: **leer → entfällt → leer.** In der Zeile
steht dann „—" statt der Sterne, und das Kriterium fällt sichtbar aus beiden
Schnitten heraus.

### Offene Entscheidungen

* **Wie wird „entfällt" gespeichert?** `value = -1` ist billig und schmuggelt
  eine Bedeutung in eine Zahl. Eine eigene Spalte ist ehrlich und kostet einen
  Migrationsblock. *Wenn überhaupt, dann die Spalte.*
* **Wer darf es setzen — und das ist der Haken?** Das Kriterium gehört dem
  Admin, die Bewertung dem Verfasser: `ratings` hat **je Benutzer eine Zeile je
  Kriterium** (`UNIQUE(item_id, criterion_id, user_id)`). **„Entfällt" ist aber
  eine Aussage über den Gegenstand und nicht über den Bewertenden** — ein Akku,
  den es nicht gibt, gibt es für alle nicht. In eine Zeile je Benutzer gelegt,
  könnte A „entfällt" sagen und B vier Sterne. *Das ist genau die zweite
  Wahrheit, die der Punkt beseitigen wollte.* **Am Eintrag gelegt ist es
  richtig — und dann gehört es nicht zur Bewertung, sondern daneben.**
* **Was zeigt das Austauschformat?** Ein dritter Zustand ist ein Feld mehr, und
  ein alter Import muss ihn als „nicht bewertet" lesen können.

### Was es anfasst

Das am häufigsten benutzte Bedienelement der Anwendung, die Detailansicht, den
Vergleich, das Austauschformat — und **das Schema**, sobald die Frage oben
beantwortet ist.

**Was dagegen spricht — und das ist hier der eigentliche Inhalt des Punktes:**
**Er verkompliziert das am häufigsten benutzte Bedienelement, um eine Frage zu
beantworten, die sich nur in einem Bestand stellt, den die Instanz gar nicht
haben soll.**

**Empfehlung: zurückstellen, bis es im Betrieb tatsächlich vermisst wird.** Er
steht hier, weil er die logische Lücke ist — nicht, weil er gebaut werden
sollte. *Ein Sammelblatt, das nur die guten Ideen kennt, verliert die Begründung
für die verworfenen.*

---

## 2. Zwei Einträge zu einem machen

> **ABGELEHNT AM 8. SEPTEMBER 2026.** *Der Hinweis beim Anlegen verhindert den zweiten Eintrag, bevor er entsteht, und das ist der Fall, der zählt.*

**Nötig geworden mit 0.11.0** — dort ist es aus der Runde herausgenommen worden.

> **Art: Neue Funktion** · **Claude: später** — erst, wenn wirklich Doppel dastehen.
> **Draußen üblich:** Zusammenführen gilt überall als **unumkehrbarer
> Verwaltungseingriff** — nur für Admins, mit Sicherung davor und einem
> Protokolleintrag danach (Jira, Bugzilla, Discourse, MediaWiki). Und alle
> geben dem Verlierer einen Grabstein, statt ihn spurlos zu entfernen.

### Woher

Der Fahrplan nannte **Doppelerkennung und Zusammenführen in einer Zeile**. Beim
Zählen im Schema, **27. August 2026**, hat sich gezeigt, dass es zwei Vorhaben
sind. Gebaut wurde das erste, das zweite ist herausgefallen — *entschieden, nicht
vergessen* (Änderungsprotokoll 0.11.0, Abweichung zum Auftrag).

### Was auffiel

**Seit 0.11.0 sagt die Instanz beim Anlegen, dass es den Gegenstand schon gibt.
Sie kann aber nichts dagegen tun, wenn er doch zweimal dasteht.** Ein Hinweis
ohne Heilmittel.

### Was es nicht ist

**Kein Fehler und keine Lücke in 0.11.0.** Der Hinweis verhindert den zweiten
Eintrag, **bevor** er entsteht, und das ist der Fall, der zählt. Was fehlt, ist
die Reparatur für die Fälle davor.

**Und es ist ausdrücklich keine kleine Ergänzung.** Es wäre **der erste Eingriff
der Instanz, der Zeilen zwischen zwei Eltern verschiebt** — unumkehrbar. An einem
Eintrag hängen **acht** Tabellen.

### Was gebaut werden könnte

**a) Die vier Eindeutigkeitsschranken, die dabei brechen** — gezählt im Schema,
nicht geschätzt (der Auftrag rechnete mit zweien):

| Tabelle | Schranke | wann sie bricht |
|---|---|---|
| `ratings` | `UNIQUE(item_id, criterion_id, user_id)` | derselbe Mensch hat dasselbe Kriterium an beiden bewertet |
| `test_days` | `UNIQUE(item_id, day, user_id)` | derselbe Mensch am selben Tag an beiden |
| `item_tags` | `PRIMARY KEY (item_id, tag_id)` | **beide tragen denselben Tag** |
| `item_pins` | `PRIMARY KEY (user_id, item_id)` | derselbe Mensch hat beide als Favorit |

**`item_tags` ist dabei der Normalfall und nicht der Randfall:** zwei Einträge,
die denselben Gegenstand beschreiben, tragen fast immer dieselben Tags. Ein
schlichtes `UPDATE … SET item_id = ?` läuft dort **beim ersten echten
Doppeleintrag** auf einen Constraint-Fehler.

**b) Eine eigene Route** — `F_ROUTEN` **69 → 70**, Art `nurAdmin` und
`zweitbestaetigt` —, **ein Vorgang im Sicherheitsprotokoll** (`VORGAENGE`
**20 → 21**) und **eine Sicherung des Datenverzeichnisses als Pflicht**, nicht
als Empfehlung.

### Offene Entscheidungen

* **Was geschieht mit dem Papierkorb?** Er serialisiert einen Eintrag *samt
  allem, was daran hängt*. Nach dem Zusammenführen hängt am Verlierer **nichts**
  mehr — die Wiederherstellung gäbe eine leere Hülle zurück. *Das ist schlechter
  als gar kein Papierkorbeintrag, weil es aussieht wie eine Rettung und keine
  ist.* Entweder der Verlierer wandert **vor** dem Verschieben in den
  Papierkorb, oder der Weg sagt ausdrücklich, dass es keinen Rückweg gibt.
* **Was passiert bei einer brechenden Schranke — überspringen oder abbrechen?**
  Überspringen heißt: der Tag ist schon da, die Zeile fällt weg. Abbrechen
  heißt: der Normalfall geht nie durch. *Bei `item_tags` und `item_pins` ist
  Überspringen richtig; bei `ratings` und `test_days` ist es eine Aussage über
  einen Menschen und gehört ihm gezeigt.*
* **Wer gewinnt bei Titel, Beschreibung, Kategorie und Merkmalen?** Der ältere
  Eintrag, der neuere, oder wählt der Admin je Feld?
* **Darf der Verfasser zusammenführen oder nur der Admin?** Der Eingriff trifft
  auch fremde Zeilen — *das spricht für `nurAdmin`, wie oben angesetzt.*

### Was es anfasst

Acht Tabellen, eine neue Route mit zwei Klemmen, das Sicherheitsprotokoll, den
Papierkorb, die Oberfläche, Prüfungen und Gegenproben. **Kein Schema** — es
bewegt vorhandene Zeilen, es legt keine neuen Spalten an.

**Was dagegen spricht:** nichts ist kaputt, und der Hinweis aus 0.11.0 trägt den
Alltag. **Dagegen spricht aber nicht, dass es teuer ist** — es ist teuer, und
genau deshalb ist es eine eigene Runde und kein Anhängsel.

---

## 3. Der QR-Encoder für den zweiten Faktor

> **ABGELEHNT AM 8. SEPTEMBER 2026.** *Der anklickbare Verweis trägt den Weg dort, wo er gebraucht wird — auf dem Telefon.*

**Nötig geworden mit 0.10.0** — dort ist er vor dem Bau herausgenommen worden.

> **Art: Neue Funktion** · **Claude: nicht empfohlen** — der abtippbare Schlüssel trägt den Weg.
> **Draußen üblich:** **Niemand schreibt einen QR-Encoder selbst.** Es wird
> ausnahmslos eine Bibliothek genommen (`qrcode`, `qrcode-generator`) — und
> genau deshalb kommt die Frage nach dem eigenen Dekoder draußen gar nicht erst
> auf. *Hier ist sie die ganze Rechnung.*

### Woher

Aus der Runde „Zwei-Faktor", **0.10.0**. *Herausgenommen mit Begründung und
Maßen, nicht vergessen* (Änderungsprotokoll 0.10.0, Abweichung A).

### Was auffiel

**Google Authenticator kennt zwei Wege hinein:** einen Code scannen oder den
Base32-Schlüssel von Hand eintippen. **Der zweite ist der Weg, an dem Menschen
aufgeben** — zweiunddreißig Zeichen auf einem Telefon.

Heute steht der Schlüssel in **Vierergruppen** auf dem Bildschirm, daneben die
`otpauth://`-Zeile als anklickbarer Verweis. *Auf einem Telefon öffnet der die
App unmittelbar — das trägt den Weg, aber nur dort.* Wer am Rechner sitzt und
das Telefon in der Hand hat, tippt.

### Was es nicht ist

**Keine Auslassung und keine Abkürzung.** Ohne Bibliothek heißt ein QR-Encoder:
Reed-Solomon über GF(256), Kapazitäts- und Blocktabellen je Version und
Fehlerkorrekturstufe, Findemuster, Taktlinien, Alignment, Format- und
Versionsbits, acht Masken mit Bewertung — mehrere hundert Zeilen.

**Teuer ist dabei nicht das Bauen, sondern der Beweis.** Die Zusage „dieselbe
Zeichenfolge ergibt weltweit dieselbe Matrix" braucht ohne Bibliothek einen
eigenen **Dekoder** im Prüfstand, also die doppelte Arbeit. *Er war damit der
einzige Teil der Runde ohne begrenzten Prüfaufwand.*

### Was gebaut werden könnte

Der Encoder selbst, dazu der Dekoder im Prüfstand. **Gemessen statt geschätzt:**
die `otpauth://`-Zeile ist **100 Zeichen** bei `Kriterion/erika`, **117** bei
`Bewertungskatalog/chefin` und **203** bei einem langen Instanz- und
Zugangsnamen. Im Bytemodus heißt das **Version 5 bis 8**.

### Offene Entscheidungen

* **Was geschieht, wenn ein langer Titel über die Kapazität hinauswächst?**
  *Die Antwort sollte sein: der Code fällt weg, und der Schlüssel steht allein
  da* — nicht: ein abgeschnittener Code, den ein Telefon annimmt und der ein
  falsches Geheimnis trägt.
* **Eine Bibliothek statt Eigenbau?** Sie nähme den Dekoder und den halben
  Aufwand — und stünde gegen „keine Abhängigkeit, die niemand liest". *Die Frage
  ist nicht beantwortet, sie ist nur bisher nicht gestellt worden.*
* **Wo steht der Code — nur beim Einschalten oder auch danach?** Danach hieße:
  das Geheimnis liegt erneut auf dem Bildschirm.

### Was es anfasst

Die Karte „Zugang" im Systembereich, den Einschaltweg des zweiten Faktors, den
Prüfstand (Encoder **und** Dekoder). **Kein Schema, keine Route, kein
Austauschformat.**

**Was dagegen spricht:** **der abtippbare Schlüssel trägt den Weg auch ohne
ihn.** Es ist Bequemlichkeit, gemessen an mehreren hundert Zeilen mit doppelter
Prüflast — und diese Rechnung hat 0.10.0 schon einmal verloren.

---

## 4. Der Suchbereich als Häkchen — was von Punkt 1 liegen geblieben ist

> **ABGELEHNT AM 8. SEPTEMBER 2026.** *„Das, wie es heute funktioniert, ist ausreichend."*

**Aufgefallen mit derselben Meldung wie der Trefferkontext** — 27. August 2026,
unmittelbar nach dem Einspielen der Suche im Server.

> **Art: Neue Funktion** · **Claude: später** — *nicht aus Zeitmangel, sondern
> weil die Frage jetzt anders aussieht.*
> **Draußen üblich:** der Suchbereich als Häkchen hinter „Erweitert" ist der
> Normalfall.

### Woher

Er stand als Teil **(b)** in Punkt 1 dieses Blatts („Die Suche schärfen") und
ist mit ihm in den Fahrplan gegangen. **Die Runde 0.18.0 hat (a) und (c)
gebaut und ihn ausdrücklich liegen gelassen**; damit steht er wieder hier, und
zwar allein.

### Was gemeint ist

Titel, Beschreibung, Kategorie, Tags, Links und Kommentare einzeln an- und
abwählbar. **Verengend**, Vorgabe **alle an** — also genau das heutige
Verhalten —, und hinter einem Schalter „Erweitert", damit der einfache Fall ein
Feld bleibt. **Der Bereich gehörte in die gespeicherte Ansicht**, sonst zeigte
eine Ansicht „Bosch, nur Titel" beim Anklicken etwas anderes als beim
Speichern; eine alte Ansicht **ohne** das Feld müsste „alle Quellen" heißen und
nicht „keine".

### Warum er liegen bleibt

**Er ist eine zweite Bedienfläche neben einer Suche, die heute ein Feld ist.**
Wer sie überfrachtet, macht den einfachen Fall teurer, um den seltenen billiger
zu machen.

**Und er war erst zu beurteilen, wenn der Trefferkontext steht.** *Genau das ist
jetzt der Fall — die Frage lautet deshalb nicht mehr „wollen wir Häkchen",
sondern: **beantwortet die Zeile „Link: …" die Frage schon?*** Wer eine Suche
absetzt und an jeder Kachel liest, warum sie dort steht, braucht womöglich kein
Häkchen mehr, um Links auszuschließen — er sieht auf einen Blick, welche Treffer
ihn nichts angehen.

**Das ist eine Entscheidung mit Begründung und keine Verschiebung.** *Wieder
aufgemacht wird sie, wenn aus dem Betrieb die Meldung kommt, dass die Zeile
nicht reicht — und dann mit einem Beispiel, an dem man das sehen kann.*

### Was es anfasst

Die Suchroute (ein Parameter für den Bereich), die Filterzeile, die
gespeicherten Ansichten, Prüfungen, Gegenproben, README. **Kein Schema.**

---

## 9. Sicherungen gepackt ablegen — und die Liste zieht um

> **ABGELEHNT AM 8. SEPTEMBER 2026 — (a) und (b) bleiben, wie es ist.** *Teil (c) ist schon mit 0.20.1 gebaut. Gemessen: eine verschlüsselte Sicherung lässt sich nicht packen.*

**Aus dem Betrieb, 3. September 2026**, unmittelbar während 0.20.0 gebaut
wurde.

> **Art: Neue Funktion** · **Claude: nicht empfohlen in der gewünschten Form** —
> *und der Grund ist gemessen, nicht vermutet:* **eine verschlüsselte Sicherung
> lässt sich nicht packen.**
> **Draußen üblich:** ja, praktisch jede Sicherungslösung packt — *aber sie
> packt VOR dem Verschlüsseln, nicht danach.* Genau darin liegt der Unterschied.

### Woher

Wortgleich aus dem Betrieb: *„Wenn eine Sicherung angelegt wird, werden sie
gepackt gelagert. Im Pack-Archiv haben sie noch den Original-Namen. Der Name,
wie er jetzt für das nackte Archiv festgelegt wird, wird für die gepackte Datei
verwendet."* Dazu zwei weitere Wünsche: **die einzelne Auflistung der
Sicherungen soll nicht mehr oben bei „Sicherung erstellen" stehen, sondern in
der neuen Karte**, und sie soll **je Sicherung nennen, wann sie entstand und
wie groß das gepackte Archiv ist.** Und die Frage: **welches Packverfahren —
Zip, RAR, tar oder etwas anderes?**

### Was gemessen wurde

**An zwei nachgebauten Datenbanken mit identischem Inhalt, je rund 60 MB,
`VACUUM INTO` wie im Betrieb** *(Node 22, `zlib` aus dem Standard — also ohne
neue Abhängigkeit)*:

| Verfahren | verschlüsselt *(wie Kriterion)* | unverschlüsselt *(Vergleich)* |
|---|---|---|
| gzip −6 | **100,0 %** · 1693 ms | **0,5 %** · 173 ms |
| gzip −1 | **100,0 %** · 1564 ms | 0,9 % · 58 ms |
| zstd −3 | **100,0 %** · 97 ms | **0,1 %** · 21 ms |
| zstd −1 | **100,0 %** · 82 ms | 0,1 % · 13 ms |
| brotli −11 | **100,0 %** · 59.915 ms | 0,1 % · 9405 ms |
| brotli −4 | **100,0 %** · 315 ms | 0,1 % · 76 ms |

**Derselbe Inhalt, einmal verschlüsselt und einmal nicht: 100,0 % gegen 0,1 %.**
*gzip macht die verschlüsselte Datei sogar um wenige Kilobyte **größer**.*

### Was auffiel — und warum es so ist

**SQLCipher verschlüsselt jede Seite einzeln mit AES-256 und eigenem IV.** Das
Ergebnis ist von Zufall statistisch nicht zu unterscheiden, und **in Zufall
findet kein Packer eine Wiederholung.** *Nur die ersten 16 Bytes der Datei sind
Klartext — das Salz.* **Ein Packer kann daran nichts gewinnen, egal welcher.**

**Und der zweite Grund kommt dazu:** selbst *unverschlüsselt* wäre der Gewinn
an dieser Datenbank klein — **rund 570 der 620 MB sind Bildbytes, und die sind
als WebP oder JPEG schon gepackt.** Die 0,1 % in der Tabelle stehen für einen
nachgebauten Bestand aus reinem Text; der echte liegt weit darüber.

### Was es nicht ist

**Kein Fehler.** Und **kein Widerspruch zur Erwartung des Betreibers** — die
Erwartung ist völlig richtig, sie gilt nur für die Reihenfolge *packen, dann
verschlüsseln*, und die hat `VACUUM INTO` nicht: es schreibt die Kopie
**verschlüsselt** heraus, in einem Zug.

### Was gebaut werden könnte — drei Wege, und zwei davon sind teuer

**a) EIN CONTAINER OHNE KOMPRESSION — nur für den Namen.** `tar` ohne Packer
oder `zip` mit „stored". **Bringt null Bytes**, erfüllt aber den Wunsch nach
*einem* Archiv, das den Originalnamen innen trägt. *Kostet: eine zweite volle
Kopie auf der Platte während des Schreibens, und einen Handgriff mehr beim
Wiederherstellen.* **Ehrlich benannt ist das eine Verpackung und keine
Ersparnis.**

**b) PACKEN VOR DEM VERSCHLÜSSELN — der einzige Weg, der wirklich spart.**
`VACUUM INTO` in eine **unverschlüsselte** Zwischendatei, packen, mit eigenem
Schlüssel verschlüsseln. **Drei harte Kosten:** die Zwischendatei liegt
**unverschlüsselt** auf der Platte — genau das, was die ganze Bauform
verhindert; es entsteht ein **eigenes Dateiformat** mit eigenem
Wiederherstellungsweg *(die README beschreibt heute „Datei zurückkopieren, Ende")*;
und die Schlüsselverwaltung bekommt einen zweiten Ort. *Der Gewinn wäre bei
diesem Bestand trotzdem klein — siehe oben.*

**c) DIE LISTE UMZIEHEN UND JE KOPIE DATUM UND GRÖSSE NENNEN.** **Das ist der
Teil des Wunsches, der billig ist und etwas bringt** — und **die Hälfte davon
steht seit 0.20.0 schon da:** die Karte „Alte Sicherungen" listet die Kopien,
die die Regel treffen würde, mit **Datum, Alter und Größe**, und die veralteten
getrennt daneben. **Was fehlt, ist die vollständige Liste** — heute nennt die
Karte „Sicherung" nur die **jüngste** Kopie und die **Zahl** der Dateien am Ort.
*Das ist eine Zeichenfrage, kein Format und keine Route: `sicherungsListe()`
liefert die vollständige Liste bereits.*

### Empfehlung

**(c) bauen, (a) nur wenn der Betreiber die Verpackung ausdrücklich will, (b)
nicht.** *Und wenn je gepackt wird, dann mit **zstd** und nicht mit Zip, RAR
oder gzip:* es steckt seit Node 22.15 in `zlib` und braucht damit **keine neue
Abhängigkeit**, es ist in der Messung **zwanzigmal schneller als gzip** bei
gleichem oder besserem Ergebnis, und brotli ist auf höchster Stufe mit fast
einer Minute je Sicherung unbrauchbar. **RAR fällt ohnehin aus:** der Packer ist
unfrei und wäre eine Fremdbinärdatei im Image.

### Was es anfasst

Für **(c)**: `drawSicherung()` bzw. die Karte „Alte Sicherungen" in
`public/app.js` und ein Feld mehr in `GET /api/sicherung` — **lesend, also kein
Eintrag in `F_ROUTEN`.** Für **(a)** und **(b)** zusätzlich `POST /api/sicherung`,
den Wiederherstellungsweg in der README und `SICHERUNG_MUSTER`. **Kein Schema
in keinem der drei Fälle.**

> **TEIL (c) IST MIT 0.20.1 GEBAUT** — noch am Tag, an dem dieser Punkt
> entstanden ist. Die Karte „Alte Sicherungen" listet ab jetzt **alle**
> Sicherungen mit **Nummer, Datum, Alter und Größe**, jüngste zuerst, Deckel bei
> fünf Zeilen; die Karte „Sicherung" sagt dafür nur noch etwas über die
> **letzte**. *Was gebaut wurde, steht im Änderungsprotokoll 0.20.1.* **Er ist
> in einer Runde mitgefahren, die ohnehin an der Karte gearbeitet hat** — genau
> wie es hier stand.
>
> **(a) UND (b) BLEIBEN OHNE NUMMER.** Der Betreiber hat 0.22.0 vorgeschlagen;
> **die Zahl ist vergeben** — dort steht die wählbare Bildablage (Punkt 6 samt
> den Ableitungen aus Punkt 5). *Nach Regel 3 dieses Blatts wird hier gesammelt
> und später in einem Zug zugeordnet; die Nummer entscheidet der Betreiber.*
> **Und der Kern des Punktes bleibt, wie die Messung ihn gefunden hat: eine
> verschlüsselte Sicherung lässt sich nicht packen.**

