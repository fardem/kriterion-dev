# Auftrag 0.24.4 — „Türkisch, und die Kacheln sagen die Wahrheit"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** Seit 0.24.3 spricht
Kriterion zwei Sprachen, und jeder Zugang wählt seine. **In dieser Runde kommt
die dritte** — `tr.json` neben `de.json` und `en.json`, Stufe 3 der
Mehrsprachigkeit und das Ende der 24er-Reihe. **Und sie räumt auf, was der
erste Rundlauf mit zwei Sprachen zutage gefördert hat:** *sieben Befunde, von
denen der schwerste heißt — **was für eine Sprache eingetragen worden ist,
erscheint in dieser Sprache nicht.*** **Dazu ein achter, den nicht das Feld
gemeldet, sondern das Messen für Türkisch gefunden hat:** *die Suche faltet auf
beiden Seiten verschieden, und dieselbe Suche gibt zwei Lesern zwei Antworten.*

**Die Maschine steht.** Das Verzeichnis ist die Liste, `localeOf(req)` fragt
drei Quellen, das Vokabular und die Namen liegen je Sprache, und drei Klammern
sorgen dafür, dass keine hineingelegte Datei den Server umbringt. **Eine dritte
Datei ins Verzeichnis zu legen genügt, damit sie überall zur Wahl steht** —
das ist die Zusage aus 0.24.3, und diese Runde ist ihre Probe.

Aufsetzend auf **0.24.3, Fingerprint `ceb8d26a`.**

> **DIE BEFUNDE SIND KEIN ANHANG.** Sie sind gleichrangig mit Türkisch, und
> **zwei von ihnen müssen VOR der dritten Datei repariert sein**: solange die
> Kacheln beim Umschalten die falsche Sprache zeigen, lässt sich eine dritte
> Sprache gar nicht pflegen. *Wer erst übersetzt und dann repariert, trägt
> vierzehn türkische Wörter in ein Feld ein, das sie in den deutschen Satz
> schreibt.*

---

## Zuerst: die Fragen, die vor der ersten Zeile zu klären sind

*Wie in 0.24.3: erst antworten, dann bauen. Jede Antwort wird in dieses Papier
eingetragen, bevor die erste Zeile entsteht.*

| # | Frage | Vorschlag von Claude |
|---|---|---|
| **F1** | **Bleibt es bei der Nummer 0.24.4?** Die Runde bringt eine Funktion (Türkisch) und wäre nach 5.1 MINOR. Die benannte Abweichung aus 0.24.3 deckt die 24er-Reihe ausdrücklich mit ab — *und endet mit ihr.* | **Ja, 0.24.4.** Es ist der letzte Schritt desselben Vorhabens, und die Abweichung ist dafür geschrieben worden. **Ab 0.25.0 gilt 5.1 wieder ohne Ausnahme** |
| **F2** | **Wer liest Türkisch gegen?** (E14). *Ohne Leser geht `tr.json` nicht heraus — das steht seit dem Konzept so, und für Englisch hat der Betreiber selbst gegengelesen.* | **Der Betreiber benennt eine Person.** *Claude kann das Wörterbuch bauen und die fünf Regeln halten; ob ein Satz sich türkisch LIEST, sagt nur jemand, der die Sprache spricht* |
| **F3** | **`Parola` oder `Şifre` für „Passwort"?** *Microsoft und Apple sagen `Parola`, Google sagt `Şifre` — beide sind üblich.* | **`Parola`**, aber **mit dem Leser aus F2 zu bestätigen**: es steht an der Anmeldemaske, und das ist der erste Satz, den ein Mensch liest |
| **F4** | **Kommt Türkisch in den VORRAT oder liegt die Datei nur da?** *Der Eigentümer kann sie in der Karte „Sprachen" freigeben — die Frage ist, was die Auslieferung tut.* | **Alles im Vorrat, wie heute.** `languageOn` ist ohne Eintrag „alle", und eine Datei, die niemand wählen kann, wäre eine Datei ohne Zweck |
| **F5** | **T3 in der DATENBANK: welche Faltung gilt für die Suche?** *Nachgemessen, nicht vermutet: die **Nadel** faltet `fulltextTerm()` mit `toLocaleLowerCase(localeOf(req))` — **mit der Sprache des LESERS**; der **Heuhaufen** faltet `kkl()` mit blankem `toLowerCase()` — **ohne jede Sprache**. Die beiden Hälften folgen schon heute zwei verschiedenen Regeln; mit Deutsch und Englisch fällt es nicht auf, mit Türkisch sofort. Siehe **B8**.* | **Eine Faltung, ohne Sprache, auf BEIDEN Seiten — und die vier i werden eins.** *`İ ı I i` fallen auf `i`; deutscher und englischer Bestand ändert sich dabei um kein Zeichen (`ı` und `İ` kommen dort nicht vor).* **Damit bleibt `deterministic` verdient** — eine Faltung, die an der Sprache des Lesers hängt, wäre es nicht, und ein Index darüber wäre falsch, sobald jemand umschaltet. *Gemessen: von neun gewöhnlichen türkischen Suchfällen gehen heute **fünf ins Leere**, mit der einen Faltung **keiner**.* Die Suche folgt damit derselben Regel wie der Namensvergleich seit 0.24.3: **eine Regel für alle, die der Installation** |
| **F6** | **Der Umschalter der Kacheln (Befund 1): reparieren oder umbauen?** *Er merkt sich die Sprache in einer Modulvariablen und zeichnet über `renderSystem()` neu — dabei geht die Bildlaufstellung verloren und die Karte zeigt die falsche Sprache.* | **Reparieren, nicht umbauen.** Die Bauform ist richtig; **es ist ein Fehler in ihr und keine falsche Bauform.** *Ein Umbau auf „Sprache steht in der Adresse" wäre eine zweite Wahrheit über „was steht da gerade" — genau das hat 0.24.3 ausdrücklich verworfen* |
| **F7** | **Der Papierkorb (Befund 6 B): Kachel oder Detailansicht?** *Der Betreiber wünscht Name, Anleger, Datum, vielleicht ein Vorschaubild — „da muss ein sinnvoller Workflow her".* | **Erst die Zeile, dann die Ansicht.** Schritt 1: `GET /api/trash` liefert Anleger und Anlagedatum, die Zeile zeigt sie. Schritt 2 *(eigene Runde)*: die Detailansicht. **Ein Vorschaubild ist teurer als es aussieht** — die Zeilen liegen im Papierkorb als Gebilde und nicht mehr in `photos` |
| **F8** | **Das leere Zeichen (Befund 4): eigenes Zeichen oder gar keines?** | **Gar keines.** Der Satz „Noch keine Kommentare." sagt alles; ein Bild darüber erklärt nichts und kostet Höhe. *Wenn doch eines: ein gestrichelter Rahmen, nie ein Bildplatzhalter* |
| **F9** | **Anlegen in „Kategorien" und „Tags" (Befund 7): in welcher Sprache?** | **Immer die Grundzeile**, und der Umschalter fasst es nicht an — *dieselbe Regel wie beim Umbenennen ohne Sprachangabe (0.24.3, Bauabschnitt 6a). Eine Kategorie, die es nur auf Türkisch gibt, wäre eine Kategorie, die der Rest der Installation nicht kennt* |
| **F10** | **Werden ALLE acht Befunde in dieser Runde erledigt, oder nur die Fehler?** | **Alle acht.** *Vier sind Einzeiler, zwei hängen an derselben Ursache, der siebte ist eine Zeile in einer Karte, die es zweimal daneben schon gibt — und der achte muss ohnehin fallen, bevor T3 sich prüfen lässt. Was liegen bleibt, kommt in einem halben Jahr als „warum ist das noch so?" zurück* |

---

## Die Befunde aus dem Rundlauf mit 0.24.3

**Gemeldet vom Betreiber am 8. September 2026**, unmittelbar nach dem
Einspielen von `80f90ee5`, teils mit Bild. **Der fünfte der ursprünglichen
fünf ist noch in 0.24.3 erledigt worden** (die Sprachzeile unter der
Anmeldemaske); *hier stehen die übrigen, dazu drei, die beim Weitertesten
dazugekommen sind — und als achter einer, den niemand gemeldet hat: er ist
beim Nachmessen für T3 aufgefallen und steht seit 0.24.3 in der Auslieferung.*

### B1 · Der Umschalter der Kacheln zeigt die falsche Sprache — **mit Bild belegt**

**Was zu sehen ist:** die Kachel „Vokabular" steht auf **Deutsch** (die Pille
ist orange), die Beschriftungen nennen die deutschen Vorgaben *(„Sache,
Einzahl (Vorgabe: Eintrag)")* — **und in den Feldern stehen die englischen
Werte** (`Entry_eng`, `Entries_eng`, …), samt der Vorschau darunter.
***Schalterstellung und Inhalt widersprechen sich sichtbar an einer Karte.***

**Es betrifft nicht nur das Vokabular:** derselbe Umschalter steht über den
Kategorien und über beiden Kriterienlisten.

**Der Verdacht steht am Quelltext:**

```js
const vocabularyLanguage = () =>
  (VOCABULARY_SHOWN && VOCABULARIES[VOCABULARY_SHOWN]) ? VOCABULARY_SHOWN : LANGUAGE;
```

**Fällt der Ausdruck auf `LANGUAGE` zurück, sieht ein Klick aus wie ein Knopf,
der nichts tut** — und die Pille zeigt trotzdem die geklickte Sprache, weil
sie aus derselben Funktion gezeichnet wird. *`namesLanguage()` daneben ist
gleich gebaut.*

> **DIE RUNDE STELLT IHN ZUERST NACH.** Ein Verdacht ist keine Ursache, und
> zwei Reparaturen an einer Ursache wären eine zu viel.

### B2 · Ein eingetragenes Wort kommt in seiner Sprache nicht an — **der schwerste**

Kachel auf Englisch, ein englisches Wort eingetragen, gespeichert — **und
danach steht auf einer englischen Oberfläche trotzdem nicht das eingetragene
Wort da.**

***Die Zusage, um die es geht, ist einfach:*** *egal, wie der Schalter der
Oberfläche steht — **was für eine Sprache eingetragen worden ist, muss in
dieser Sprache erscheinen.*** Es geht ausdrücklich **nicht** um die Wörter,
für die nichts eingetragen ist; dort bleibt der Rückfall aus F3 der Runde
0.24.3 (*„lieber ein Wort in der falschen Sprache als gar keines"*).

**B1 und B2 könnten derselbe Befund sein:** greift der Umschalter nicht, meint
`vocabularyBody()` beim Speichern die Sprache des **Lesers** —

```js
const vocabularyBody = (words) => ({ [vocabularyLanguage()]: words });
```

— und das englische Wort landete im deutschen Satz. **Nachstellen entscheidet
das, nicht Lesen.**

### B3 · Die Stelle springt beim Umschalten

Wer den Umschalter drückt, landet **oben auf der Seite** statt dort, wo er
war: `renderSystem()` baut `app.innerHTML` neu, und damit ist die
Bildlaufstellung weg. *Bei vierzehn Vokabelfeldern heißt das: nach jedem
Umschalten erst wieder hinunterrollen.*

**Gehört in dieselbe Reparatur wie B1** — es ist derselbe Weg.

### B4 · Der Hinweis „Vorgabe: …" zeigt immer die des Lesers

Unter jedem der vierzehn Felder steht die Vorgabe der **Sprachdatei des
Lesers**, auch wenn die Karte auf eine andere Sprache geschaltet ist:
`vocabularyDefault()` liest `TEXTS`. *Wer auf Deutsch liest und Türkisch
pflegt, bekommt deutsche Vorgaben zu türkischen Feldern.*

### B5 · Zwei deutsche Wörter stehen fest im Quelltext

| wo | was |
|---|---|
| `drawLinks()`, der zugeklappte Linkkasten | `` `alle ${rows.length} anzeigen` `` |
| `drawFilters()`, die Filterzeile | `` `${n} aktiv` `` |

**Beide sind keine Sätze und deshalb durch jeden Wächter der Runde 0.24.3
gefallen** — der Bildschirmtext-Wächter prüft die Verbotsliste und nicht die
Sprache. *Auf Englisch stehen sie heute deutsch da; auf Türkisch fielen sie
noch mehr auf.*

> **UND EIN WÄCHTER GEHÖRT DAZU**, sonst kommt der dritte im nächsten Jahr:
> *kein Text in `app.js` außerhalb von `t()`/`tH()` trägt ein deutsches
> Wortstück* — dieselbe Bauform wie die Restprobe, nur schärfer.

### B6 · Der Papierkorb — ein Zeichen als Quelltext, und eine Zeile ohne Ordnung

**(A) Fehler.** Der Wiederherstellen-Knopf zeigt seinen SVG-Quelltext als
Text:

```js
${tH('card.restoreIcon', { restoreIcon: ICON_RESTORE })}
```

**`tH()` maskiert die eingesetzten Werte — mit Absicht** (Stolperstein 18 in
Dateiform). **Verursacht hat es 0.24.0**, beim Umzug der Sätze: aus
`${ICON} Wiederherstellen` wurde ein Satz mit Platzhalter, und ein Platzhalter
ist ein Wert. **Es ist die einzige Stelle** — nachgezählt geht kein zweites
`ICON_` durch `t()` oder `tH()`.

**(B) Design.** Die Zeile beantwortet „wann ist es weg" und „wie groß", aber
nicht die Frage vor dem Wiederherstellen: **„ist das der Eintrag, den ich
meine?"** *Siehe F7.*

### B7 · Kategorien und Tags lassen sich in ihrer Karte nicht anlegen

Die beiden Kriterienkarten daneben können es — ein Feld, ein Knopf.

**Und die beiden Hälften liegen verschieden:**

| | was dasteht |
|---|---|
| Kategorien | **`POST /api/product-categories` steht längst.** *Der Weg ist nur nicht dort, wo man ihn beim Verwalten sucht — es fehlt allein das Feld* |
| Tags | **Es gibt keinen Weg, einen Tag für sich anzulegen.** `/api/tags` kennt GET, PUT und DELETE; angelegt wird ein Tag heute **nur AM EINTRAG** (`POST /api/items/:id/tags`) oder beim Import |

**Für Tags ist also eine Zeile mehr zu bauen als ein Eingabefeld** — und sie
trägt dieselbe Klemme, die am Eintrag schon hängt: *einen vorhandenen Tag
vergibt jeder, ein neuer Name hängt an `mayCreate(req, 'tagsFreeCreate')`.*
**Die Begründung dafür steht im Quelltext** und gilt hier unverändert: „Ein
gemeinsamer Helfer trüge die Klemme in seinem eigenen Rumpf, und dann ließe
sie sich nirgends gegenprüfen." *Die Karte gehört dem Eigentümer — die Klemme
gehört trotzdem geprüft, sonst ist sie beim nächsten Weg wieder weg.*

### B8 · Zwei Hälften der Suche, zwei Regeln — **am Quelltext gemessen**

**Nicht aus dem Feld gemeldet, sondern beim Vorbereiten von T3 gefunden.**
Die Suche faltet auf beiden Seiten Groß- auf Kleinschreibung — **aber nicht
mit derselben Regel:**

| Hälfte | wo | wie |
|---|---|---|
| **Die Nadel** (der eingegebene Begriff) | `fulltextTerm()` | `toLocaleLowerCase(localeTag(localeOf(req)))` — **mit der Sprache des Lesers** |
| **Der Heuhaufen** (der Bestand) | `kkl()`, in SQL eingehängt | `String(s).toLowerCase()` — **ohne jede Sprache** |

**Mit Deutsch und Englisch fällt das nicht auf**: beide falten `I` nach `i`.
**Auf Türkisch fällt es sofort auf**, denn dort ist `'I'.toLocaleLowerCase('tr')`
das punktlose `ı` — und im Bestand steht das gepunktete `i`.

**Gemessen an einem Bestand aus `Istanbul`, `İstanbul`, `Işık`, `ışık`:**

| gesucht | Leser auf de/en | Leser auf tr |
|---|---|---|
| `ISTANBUL` | findet `Istanbul` | **findet nichts** |
| `Istanbul` | findet `Istanbul` | **findet nichts** |
| `IŞIK` | **findet nichts** | findet `ışık` |

***Dieselbe Suche, derselbe Bestand, dieselbe Installation — zwei Antworten.***

**WANN GENAU DAS ZUSCHLÄGT, gehört dazugesagt:** heute noch nicht. `localeOf()`
klemmt gegen den Vorrat, und der Vorrat ist das Verzeichnis — **ohne `tr.json`
kann niemand auf Türkisch stehen.** *Der Fehler liegt fertig da und wartet auf
die Datei, die diese Runde hineinlegt.* **Er ist damit kein Grund, Türkisch zu
verschieben, sondern der Grund, ihn davor zu reparieren.**

**Die zweite Hälfte dagegen schlägt schon heute zu**, und die braucht keine
dritte Sprachdatei: von neun gewöhnlichen türkischen Suchfällen gehen **fünf
ins Leere** — `İstanbul` wird von `istanbul` nicht gefunden, `Iğdır` nicht von
`ığdır`, `Işık` nicht von `ışık`. *Dafür genügt ein türkischer Name in einem
deutschen Bestand, und den tippt jemand am ersten Tag.* **Das ist kein
Türkisch-Sonderfall, sondern die Folge davon, dass das Lateinische zwei i kennt
und Unicode vier.**

**Der Vorschlag steht in F5:** **eine Faltung, ohne Sprache, auf beiden
Seiten**, und die vier i fallen auf eines —

```js
String(s).toLowerCase().replace(/\u0307/g, '').replace(/ı/g, 'i')
```

*Gemessen: **vierzehn von fünfzehn** Fällen treffen danach, deutsche und
englische eingeschlossen. Der eine, der nicht trifft (`ÜBERGROSS` gegen
`übergroß`), trifft **heute auch nicht** — das ist die Sache mit `ß` und `ss`
und gehört nicht in diese Runde.*

> **UND ES IST EIN BESTANDSFEHLER, KEIN NEUER.** Die auseinanderlaufende
> Faltung steht in der ausgelieferten `0.24.3`; die zweite Hälfte ist so alt
> wie `kkl()`. *Eingetragen ist er hier, weil er beim Messen für T3 aufgefallen
> ist — nicht, weil ihn jemand gemeldet hätte.* **Ein Befund aus dem
> Vorbereiten zählt genauso wie einer aus dem Betrieb.**

---

## Woher — was schon dasteht und nicht noch einmal gebaut wird

| | Stand nach 0.24.3 |
|---|---|
| Das Verzeichnis ist die Liste | **gebaut** (S10). Eine dritte Datei genügt |
| Drei Klammern gegen unbrauchbare Dateien | **gebaut** — kaputtes JSON, unbrauchbare `_locale`, falscher Dateiname |
| `localeOf(req)`, drei Quellen, gegen den Vorrat | **gebaut** |
| Vorgabe und Vorrat (`languageDefault`, `languageOn`) | **gebaut**, Karte „Sprachen" |
| Vokabular je Sprache, mit zwei Rückfällen | **gebaut** — *und Gegenstand von B1/B2* |
| Kriterien und Kategorien je Sprache | **gebaut**, zwei Tabellen daneben |
| `Intl` für Datum, Zahl, Wochentag, Sortierung | **gebaut** über `_locale` |
| Der Vergleich läuft über die Vorgabesprache | **gebaut** (T3, halb) — *`compareLocale()`: zweimal erklärt (Server, Oberfläche), an sieben Stellen gerufen, einmal an `auth.js` gereicht* |
| Austauschformat 14, alle Sprachfassungen | **gebaut** |
| Mehrzahl über `Intl.PluralRules` | **gebaut** — *und Türkisch kennt sehr wohl **beide** Formen, `one` und `other`. Nachgemessen, nicht angenommen: `Intl.PluralRules('tr').select(1)` ist `one`* |

**Was Türkisch NICHT kostet** *(Konzept S3.3)*: Datum, Uhrzeit,
Dezimalzeichen und Schriftkette sind dieselben wie auf Deutsch; `ğ ş ç ı İ`
liegen in jeder Schrift der Kette. **Die Locale ist `tr-TR`, und sonst ändert
sich nichts.**

---

## Bauabschnitt 1 — die Befunde zuerst, und B1 zuerst von allen

**WARUM VOR TÜRKISCH:** solange die Kacheln beim Umschalten die falsche
Sprache zeigen und in die falsche schreiben, **lässt sich eine dritte Sprache
gar nicht pflegen.** *Wer erst übersetzt, trägt vierzehn türkische Wörter in
ein Feld ein, das sie in den deutschen Satz schreibt — und merkt es an
derselben Kachel nicht.*

1. **B1 nachstellen**, in jsdom und am laufenden Server: Kachel umschalten,
   Feldinhalt lesen, Rumpf des `PUT` mitschreiben. **Der Prüfstand hält den
   Fall fest, bevor eine Zeile repariert wird** — sonst ist die Reparatur
   eine Behauptung.
2. **B1 und B2 reparieren** — *vermutlich eine Ursache, das sagt der Lauf.*
3. **B3**: die Bildlaufstellung überlebt das Umschalten.
4. **B4**: der Vorgabehinweis folgt der Kachel und nicht dem Leser.
5. **B8**: **eine Faltung für beide Hälften der Suche** *(F5)*. **Der Fall wird
   zuerst nachgestellt und erst dann repariert.** `fulltextTerm()` und `kkl()`
   rufen danach **dieselbe Funktion**, und sie nimmt keine Sprache entgegen.
   *`deterministic` steht schon an `kkl()`; nach der Reparatur ist es auch
   verdient.*

   > **DIE BEIDEN HÄLFTEN STELLEN SICH VERSCHIEDEN NACH, und das gehört
   > dazugesagt.** Die **zweite** braucht gar nichts Neues: ein türkischer Name
   > in einem deutschen Bestand, gesucht in Kleinschreibung — der Fall steht
   > heute rot. Die **erste** braucht **eine dritte Sprache im Vorrat**, denn
   > ohne sie kann kein Zugang auf Türkisch stehen; mit Deutsch und Englisch
   > allein fällt `I` in beiden Sprachen auf `i`, und die Probe bliebe stumm.
   >
   > **Der Prüfstand legt sich die Datei selbst hin** — er kann es seit 0.24.3
   > (die Fremddatei-Probe tut nichts anderes), und **das Verzeichnis IST die
   > Liste** (S10). *Damit ist diese Probe nebenbei der Beleg für die Zusage
   > aus 0.24.3: eine Datei hineinlegen genügt.* **Kein Grund, den Befund
   > hinter Bauabschnitt 2 zu schieben.**

**Zusicherung des Abschnitts:** *egal, wie die Oberfläche steht — was für eine
Sprache eingetragen wurde, steht in dieser Sprache da, der Umschalter zeigt,
was er zeigt, und **zwei Leser derselben Installation bekommen auf dieselbe
Suche dieselbe Antwort.***

> **B8 GEHÖRT HIERHIN UND NICHT ZU TÜRKISCH.** Er ist ein Bestandsfehler, und
> er wäre auch dann zu reparieren, wenn `tr.json` nie käme. *Er steht nur
> deshalb in dieser Runde, weil Türkisch ihn sichtbar macht — und **T3 lässt
> sich vor ihm nicht prüfen.***

---

## Bauabschnitt 2 — `tr.json`

**Das Wörterbuch zuerst, wie in 0.24.3** *(`Doku/Woerterbuch_Tuerkisch_0_24_4.md`)*,
eingecheckt **bevor der erste Satz übersetzt wird**, und mit dem Leser aus F2
abgestimmt. Die Tafel aus dem Konzept (S3.2) ist der Entwurf, nicht das
Ergebnis.

**1204 Schlüssel, dieselbe Liste und dieselbe Reihenfolge** wie `de.json` und
`en.json`. Der Kopf trägt `_locale: "tr-TR"` und `_name: "Türkçe"`.

> **ZWEI ZAHLEN, UND BEIDE SIND WAHR.** Die Datei trägt **1204 oberste
> Einträge**; flach gerechnet — jede Mehrzahlform als eigener Schlüssel —
> sind es **1272**. *Der Prüfstand nagelt die flache Zahl fest
> (`1272 / 68 / 14`), das Papier nennt die oberste.* **Wer die beiden
> verwechselt, sucht eine Stunde nach 68 fehlenden Sätzen.**

**Die fünf Regeln, und jede mit ihrer Probe:**

| | Regel | Probe |
|---|---|---|
| **T1** | **Keine Endung an einem Platzhalter.** `„{entryOne}" öğesi silinsin mi?` statt `{entryOne}'yi sil?` | Das Vokabelwort auf **Model**, **Kutu**, **Kayıt** stellen — *derselbe Satz bleibt an allen dreien richtig.* **Drei Wörter, drei Vokale, eine Prüfung** |
| **T2** | **Nach einer Zahl steht die Einzahl.** „3 yorum", nicht „3 yorumlar" | **Beide Formen werden gefüllt und beide tragen dasselbe Nomen.** *`Intl.PluralRules('tr')` kennt `one` UND `other` — wer nur `other` schreibt, reißt ein Loch in die Deckungsprobe.* Geprüft an „1 yorum" und „3 yorum": **derselbe Wortstamm, kein -ler/-lar.** Die Mehrzahl mit -ler/-lar steht nur als Titel |
| **T3** | **İ und ı.** Suche, Vergleich und Sortierung | **Setzt B8 voraus** — mit der heutigen Faltung ist diese Probe nicht zu bestehen, und das ist kein Türkisch-Problem, sondern der Befund. Danach: „İstanbul" als „istanbul", als „ISTANBUL" und als „İSTANBUL" gefunden, „Iğdır" als „ığdır" — **und dasselbe Ergebnis für einen Leser auf Deutsch wie für einen auf Türkisch.** Sortiert wird über `Intl.Collator` und nicht über die Faltung: „ılık" < „irmik" < „İzmir" *(nachgemessen)* |
| **T4** | **Länge.** Türkische Sätze sind länger bei weniger Wörtern | Der Augenschein an den zwanzig dichtesten Stellen, **am Telefon** — *derselbe Punkt, der in 0.24.3 als benannte Abweichung offen geblieben ist* |
| **T5** | **Der Apostroph.** „Kriterion'a", „3'te" | Die Sätze werden so gebaut, dass **weder der Titel noch eine Zahl eine Endung braucht**. Wo es nicht anders geht: **in der Datei, nie im Code** |

---

## Bauabschnitt 3 — die übrigen Befunde

5. **B5**: die beiden festen Wörter in die Sprachdatei — **und der Wächter
   dazu.**
6. **B6 A**: das Zeichen aus dem Satz heraus. `card.restoreIcon` fällt weg;
   **ein Zeichen ist kein Wort und gehört nicht in einen Satz, den man
   übersetzt.** *Und ein Wächter: kein `ICON_` durch `t()` oder `tH()`.*
7. **B6 B**: `GET /api/trash` trägt Anleger und Anlagedatum, die Zeile zeigt
   sie *(Schritt 1 aus F7)*.
8. **B7**: das Anlegefeld in „Kategorien" und „Tags" — über `MANAGE_KIND`,
   nicht über eine Abfrage auf den Kartennamen. **Für Tags dazu der Weg
   selbst** (`POST /api/tags`, Eigentümer, mit der Klemme aus B7) — *er
   ruft `findTag()` und `createTag()`, die beide schon dastehen, und legt
   sich nicht daneben eine dritte Art, einen Tag anzulegen.*
9. **B4 der Runde 0.24.3**: das leere Zeichen *(F8)*.

---

## Bauabschnitt 4 — der Prüfstand

**Neu, jeder mit gefahrener Gegenprobe:**

| Wächter | Zusicherung |
|---|---|
| **Umschalterprobe** | die Kachel zeigt die Sprache, auf der sie steht — an allen vier Kacheln |
| **Eintragsprobe** | was für eine Sprache eingetragen wurde, kommt in dieser Sprache heraus. **Am laufenden Server und nicht am Quelltext** |
| **Stellungsprobe** | die Bildlaufstellung überlebt das Umschalten |
| **Vorgabeprobe** | der Hinweis „Vorgabe: …" folgt der Kachel |
| **Restprobe, verschärft** | kein Text außerhalb von `t()`/`tH()` trägt ein deutsches Wortstück |
| **Zeichenprobe** | kein `ICON_` geht durch `t()` oder `tH()` |
| **T1-Probe** | drei Vokabelwörter, drei Vokale, derselbe Satz bleibt richtig |
| **Faltungsprobe** | **Nadel und Heuhaufen falten mit derselben Funktion**, und sie nimmt keine Sprache entgegen — *am Quelltext UND am laufenden Server* |
| **Zwei-Leser-Probe** | zwei Zugänge, zwei Sprachen, derselbe Bestand, dieselbe Eingabe — **dieselbe Trefferliste** |
| **T3-Probe** | „İstanbul" wird als „istanbul" und als „ISTANBUL" gefunden; „Iğdır" als „ığdır"; die Sortierung stimmt |
| **Deckungsprobe für `tr.json`** | dieselben Schlüssel wie `de.json` |

**Die Zahlen, die festgenagelt werden:** **drei** Sprachdateien, **1204**
oberste Schlüssel je Datei *(flach **1272**, davon **68** Mehrzahlformen und
**14** Vokabelnamen)*, `EXCHANGE_FORMAT` **14** *(unverändert)*, **27**
Tabellen *(unverändert)*, **sechs** Felder in `/api/config` *(unverändert)*.
**Und eine neue:** die Zahl der Wege unter `/api/tags` geht von **drei** auf
**vier**.

---

## Was ausdrücklich NICHT gebaut wird

* **Keine vierte Sprache.** Mit Türkisch endet die Reihe.
* **Keine übersetzten Inhalte.** Wie in 0.24.3.
* **Kein Rechts-nach-links.** *Türkisch braucht es nicht; die Frage bleibt
  offen und steht hier, damit sie niemand für erledigt hält.*
* **Keine Detailansicht im Papierkorb** — *Schritt 2 aus F7 ist eine eigene
  Runde.*
* **Kein Umbau des Umschalters auf die Adresse** *(F6)*.
* **Keine Region je Sprache.** `tr-TR` ist die Locale in der Datei, nicht ein
  zweiter Dateiname.
* **Kein `ß` gegen `ss` in der Suche.** *Beim Messen für B8 mitgefallen:
  „ÜBERGROSS" findet „übergroß" nicht — heute nicht und nachher nicht. Es ist
  ein eigener Fall, er betrifft Deutsch und nicht Türkisch, und er gehört
  nicht in eine Runde, die schon zwei Fehler an derselben Funktion repariert.*
  **Er steht in `Doku/Fehler_und_Ideen.md`, nicht hier.**

---

## Der Prüfstand — was er halten muss

1. **`npm test` grün**, und jede neue Prüfung hat ihre Gegenprobe **gefahren**.
2. **B1 ist NACHGESTELLT, bevor er repariert wird** — der Fall steht im
   Prüfstand, rot, und wird durch die Reparatur grün.
3. **Drei Zugänge, drei Sprachen, gleichzeitig** — und keiner sieht etwas vom
   anderen.
4. **T1 an drei Vokalen**, T2 an „1 yorum" und „3 yorum", T3 an „İstanbul" —
   **und T3 von zwei Lesern verschiedener Sprache mit demselben Ergebnis.**
5. **Ein Export, wieder eingespielt, trägt alle drei Sprachfassungen.**
6. **Der Augenschein an den zwanzig dichtesten Stellen, in DREI Sprachen, am
   Telefon** — *der Punkt, der in 0.24.3 offen geblieben ist.*
7. **Ein Bestand von `ceb8d26a` läuft an** — und die vierzehn eingetragenen
   Vokabeln stehen danach da, in ihrer Sprache.

---

## Bauregeln

* **Zuerst die zehn Fragen** — gestellt, beantwortet, eingetragen.
* **Dann das türkische Wörterbuch**, mit dem Leser aus F2, bevor ein Satz
  übersetzt wird.
* **B1 vor `tr.json`.** *Eine Kachel, die in die falsche Sprache schreibt,
  macht aus jeder Übersetzung eine zweite Fehlersuche.*
* **Die Bauabschnitte in dieser Reihenfolge**, jeder ein eigener Commit mit
  grünem Prüfstand.
* **Die Gegenprobe wird gefahren, nicht nur geschrieben.** *In 0.24.3 waren
  drei stumm, und jede stumme war ein Fund — eine davon dreimal
  hintereinander.*

---

## Die Dokumente

| Datei | was |
|---|---|
| `public/languages/tr.json` | **neu** — 1204 oberste Schlüssel, flach 1272 |
| `Doku/Woerterbuch_Tuerkisch_0_24_4.md` | **neu** — vor dem ersten übersetzten Satz |
| `Doku/Aenderungsprotokoll_0.24.4.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_4.md` | `git mv`, Revision 70 — **T1 bis T5 als Regeln S11**, und das Ende der benannten Abweichung von 5.1 |
| `Doku/Konzept_Mehrsprachigkeit_0_24_0.md` | der Nachtrag zu Stufe 3 |
| `Doku/Fehler_und_Ideen.md` | die Punkte 15, 16 und 17 ziehen fort *(Regel 3: was eine Nummer hat, steht im Fahrplan)* |
| `CHANGELOG.md` · `package.json` · `README.md` | 0.24.4 |

---

## Was danach offen bleibt

* **Die Detailansicht im Papierkorb** *(Schritt 2 aus F7)*.
* **Rechts-nach-links** — die Bauform lässt es zu, geprüft ist es nicht.
* **Die Region je Sprache** (`de-AT` neben `de-DE`).
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und
  `gegenprobe.js` nennen** — Papierarbeit aus 0.24.1, seit drei Runden offen.
* **`0.25.0` ist frei** und die erste Nummer nach dem Ende der Abweichung.
