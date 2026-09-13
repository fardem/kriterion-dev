# Fahrplan

**Der Plan von 0.26.0 bis 1.0 · Stand 9. September 2026, nach dem Bauen von
0.25.0**

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
> *Die 0.40.0 bleibt reserviert und ist weiterhin der Ausweg, falls es ein
> siebtes Mal eng wird.*

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
| ~~**0.31.0**~~ | ~~Die Sprachdateien werden gegengelesen — deutsch~~ | **GEBAUT am 13. September 2026** — Änderungsprotokoll 0.31.0. *Elf Code-Lecks raus (aus allen drei Dateien: 1265 → 1254), neunundvierzig deutsche Texte geschärft, vierunddreißig Anführungszeichen berichtigt (deutsch und türkisch). **MINOR**, kein Schemaanteil. Die Vorlage kam von Google Gemini und ist Zeile für Zeile gegen den Quelltext geprüft worden; das Änderungsprotokoll trägt die Absichtszeilen für 0.31.1 und 0.31.2* | nein | — |
| **0.31.1** | **… englisch** | `en.json` übersetzt die ABSICHT der deutschen Sätze, nicht ihre Wörter. *Heute steht dort „files that leaves the house“* | nein | — |
| **0.31.2** | **… türkisch** | `tr.json` ebenso. *Heute steht dort „hap“ — die Tablette — für die Filterpille* | nein | — |
| **0.32.0** | **Der Ruf beim Namen** | `@name` in Notiz, Bericht und Aufgabe — hervorgehoben, und der Genannte bekommt eine Glocke *(bestellt 12.9.2026)* | **offen** | — |
| **0.33.0** | **Bereinigung — der Bruch** | **elf** Migrationsblöcke raus *(0.27.0 hat den elften gebracht)*, Struktur festgeschrieben, **kein Rückweg** | **ja** | — |
| **0.33.x** | **Die Kommentare werden knapp** | 16.281 von 54.822 Zeilen sind Kommentar | nein | — |
| **0.34.0** | **Der Prüfstand bekommt ein Verzeichnis** | `testbench.js` in Module — **und damit erst der echte Teillauf** | nein | — |
| **0.35.0** | **Code-Effizienz** | Leichen und ineffizienter Code | offen | — |
| **1.0.0** | **Die Zusage** | Abwärtskompatibilität zugesichert, Schnittstelle steht fest | — | — |
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

> **DER PLATZHALTER IST HEUTE SCHON ABGESCHNITTEN.** *„Neue Kategorie, Enter"
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

## 0.32.0 — „Der Ruf beim Namen"

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
| **1** | **`@name` in einem Kommentar nennt einen Zugang.** *Die vier Arten sind dieselben, die der Betreiber genannt hat und die die Instanz kennt: **Notiz, Bericht, Aufgabe, erledigte Aufgabe** (`kind`).* **Eine fünfte Stelle gibt es nicht** |
| **2** | **Der Ruf steht deutlich da** — hervorgehoben wie ein Treffer der Suche, aber als eigene Sache erkennbar |
| **3** | **Der Genannte bekommt eine Glocke** — und zwar **er**, nicht jeder |

### Was daran NICHT trivial ist — drei Sachen, und die dritte entscheidet über die Nummer

**ERSTENS: DIE GLOCKE IST HEUTE NICHT PERSÖNLICH.** *Sie zählt, was an einem
Eintrag neu ist, den man sehen darf — `bellNew()` summiert `newComments` und
`newRatings` über alle Einträge (`public/app.js:3040`), und der Bezugspunkt ist
eine persönliche Einstellung (`bellSeen`, `server.js:2613`).* **Ein Ruf ist
etwas anderes: er gilt EINEM.** *Die Glocke bekommt damit zum ersten Mal eine
zweite Art Eintrag — und die Frage, ob sie zwei Zahlen zeigt oder eine, ist
keine Kleinigkeit.*

**ZWEITENS: DER TEXT WIRD NICHT NACHBEARBEITET.** *Seit 0.18.0 entsteht der
Kommentartext als **echte Knoten** und nie als String —
`buildCommentNodes(splitCommentText(text, term))` (`public/app.js:7979`).* **Der
Ruf ist ein VIERTES Stück dieser Zerlegung** und kein `replace()` über das
Ergebnis. *Wer das umdreht, holt sich Markup in einen Text, der ausdrücklich
keines tragen darf.*

**DRITTENS — UND HIER LIEGT DER HAKEN: WAS PASSIERT BEI EINER UMBENENNUNG?**
*Ein Ruf, der als `@bert` im Text steht, zeigt nach der Umbenennung auf
niemanden mehr.* **Wer das abfangen will, muss die ZUGANGSNUMMER speichern und
nicht den Namen — und das ist ein Schemaschritt.**

> **UND EIN SCHEMASCHRITT KOLLIDIERT MIT DEM, WAS 0.29.0 ANGEKÜNDIGT HAT:**
> *„Dies ist die letzte Runde, die das Schema anfassen darf."* **Der Bruch auf
> 0.33.0 steht unmittelbar dahinter.**
>
> **ES GIBT EINEN WEG OHNE SCHEMA, und er ist zu prüfen, bevor die Runde
> anfängt:** *`bellSeen` ist ein Zeitstempel je Zugang, `comments` trägt
> `created_at` und den Text.* **„Kommentare, die neuer sind als mein Bezugspunkt
> und meinen Namen rufen" ist eine ABFRAGE und keine Tabelle** — *dieselbe
> Bauform, aus der die Glocke heute schon besteht: abgeleitet, nicht
> gespeichert.* **Dann kostet der Ruf keine Spalte, und die Umbenennung ist der
> Preis dafür.**
>
> **DIE ENTSCHEIDUNG GEHÖRT IN DIE FRAGETAFEL JENER RUNDE und nicht hierher.**
> *Hier steht nur, dass sie ansteht — und dass sie VOR 0.33.0 fällt, weil
> danach keine Spalte mehr dazukommt.*

### Was die Runde zu entscheiden hat

| | Frage |
|---|---|
| **1** | **Wer darf gerufen werden?** *Jeder Zugang — oder nur, wer diesen Eintrag überhaupt sehen darf?* **Ein Ruf an jemanden, der die Sache nicht sehen darf, ist eine Auskunft über einen Eintrag, den es für ihn nicht gibt** |
| **2** | **Wie wird getippt?** *Freier Text mit `@` — oder eine Auswahl, die beim `@` aufgeht?* **Freier Text bedeutet Tippfehler, die still ins Leere rufen** |
| **3** | **Zeigt die Glocke ZWEI Zahlen** *(„neu" und „genannt")* **oder eine?** *Zwei Zahlen an einem Symbol sind zwei Sachen an einem Ort; eine Zahl verwischt den Unterschied, den der Betreiber gerade will* |
| **4** | **Was geschieht bei der Umbenennung?** *(siehe oben — der einzige Punkt mit möglichem Schemaanteil)* |
| **5** | **Nur die Glocke — oder auch eine Mail?** **Vorschlag: nur die Glocke.** *Der Betreiber hat die Glocke genannt, und eine Mail je Ruf ist eine Entscheidung mit ganz anderen Folgen* |
| **6** | **Wie sieht der Ruf im BEARBEITENMODUS aus?** *Dort steht der Rohtext im Textfeld — `@bert` bleibt `@bert`, und das ist richtig so* |

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

## 0.33.0 — „Bereinigung — der Bruch"

**Unverändert gegenüber dem alten Plan; neu ist allein die Nummer.**

Migrationscode raus — **zehn Blöcke** (der zehnte ist mit 0.25.0 dazugekommen) —, die Datenbankstruktur festgeschrieben,
**Absage an zu alte Datenbanken. Ab hier gibt es keinen Rückweg auf ältere
Fassungen.** *Ein Bruch — solange die erste Zahl 0 ist, läuft er über MINOR.*

**0.33.x — „Die Kommentare werden knapp".** Fast dreißig Prozent des Quelltextes
sind Kommentar. **Was das Offensichtliche wiederholt, geht; was eine
ENTSCHEIDUNG trägt, wandert vorher in den Projektstand und bleibt als Zeiger
stehen.** *Nach der Bereinigung und nicht davor — sie löscht ganze Blöcke samt
ihren Kommentaren, und wer vorher schneidet, schneidet zweimal.*

---

## 0.34.0 — „Der Prüfstand bekommt ein Verzeichnis"

**`testbench.js` ist EINE Datei mit über 43.000 Zeilen**, `counterproof.js`
daneben über 7000. **Sie wird aufgeteilt: ein Verzeichnis `test/`, ein Modul je
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
*`buildDom()` (`testbench.js:27055`) baut je ein ganzes Fenster; 184 davon
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

## 1.0.0 — „Die Zusage"

Abwärtskompatibilität wird zugesichert, die öffentliche Schnittstelle steht
fest. Dazu die Vorgabewerte und die Tastaturbedienung beim Sortieren.

---

## Was ausdrücklich draußen bleibt

### Große Dateien bis 2 GB — *weiter draußen, und der Grund ist genannt*

**Der Betreiber am 8. September 2026:** *„Große Dateien lasse ich immer noch
außen vor, weil ich da noch nicht voll überzeugt bin, dass es gut gelingen
wird."*

**Das Papier bleibt** (`Doku/Konzept_Video_und_grosse_Dateien.md`, Teil II) und
**bekommt keine Nummer.** *Es steht nach 1.0.0 und ist damit kein Teil dieser
Strecke.*

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
| **Eine Messung im echten Browser** | **Der Weg ist gefunden** — Chromium über das DevTools-Protokoll, den Client bringt Node seit v22 mit, **keine neue Abhängigkeit.** *Offen ist nicht das Werkzeug, sondern ob es in den Baum gehört: ein Lauf, der einen Browser startet, braucht Chromium auf der Maschine, und die hat nicht jeder.* **Entschieden wird es beim Auftrag von 0.34.0**, wo der Prüfstand ohnehin auf den Tisch kommt |
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

**`ICON_PH` ist ein BILDPLATZHALTER, und als solcher ist er auch richtig** —
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

