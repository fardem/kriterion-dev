# Änderungsprotokoll 0.24.3 — „Die zweite Sprache"

**Stufe 2 der Mehrsprachigkeit · 8. September 2026 · gebaut auf 0.24.2
(`0d5bcbd`) · Fingerprint dieser Runde `ceb8d26a`.**

*Der erste Stand dieser Runde trug `80f90ee5` und ist am 8. September 2026 im Feld angesehen worden — genau der Sollwert. Er hat fünf Befunde gebracht; vier davon sind 0.24.4, der fünfte steht als Nachtrag weiter unten und hat den Fingerprint noch einmal bewegt.*

**Bis 0.24.2 sprach Kriterion Deutsch aus einer Datei. Ab 0.24.3 spricht es
Englisch aus einer zweiten — und jeder Zugang wählt selbst, welche er liest.**
Der Wechsel wirkt ohne Neuladen, gilt je Benutzer und nicht je Installation,
und wer nichts einstellt, bekommt, was sein Browser verlangt.

*Diese Runde legt dem Bestand nichts Neues hinein, was ein Mensch einträgt —
keine Einträge, keine Kommentare, keine Kriterien. Sie bringt eine zweite
Fassung von allem, was schon dasteht.*

---

## Die Versionsnummer ist eine benannte Abweichung

**0.24.3 ist ein PATCH-Sprung, und die Runde ist keine Reparatur.** Nach der
Regel des Projektstands (5.1, SemVer) gehörte sie auf 0.25.0: sie bringt eine
Funktion, die es vorher nicht gab, erweitert das Austauschformat auf 14, legt
zwei Tabellen an und ändert das Verhalten einer frischen Installation. *Keine
neue Route: die sieben neuen Einstellungen gehen alle über `PUT
/api/settings`, und `F_ROUTES` steht unverändert auf 70.*

**Der Betreiber hat am 7. September 2026 anders entschieden** *(Frage F1 des
Auftrags)*: *„0.24.3, da DIESE RUNDE HAUPTSÄCHLICH GEMACHT wurde, um die
englische Sprache hier reinzubringen. Sie ist damit ein Teil der 24er, genauso
wie Türkisch, das später kommt."*

**Die 24er-Reihe ist EIN Vorhaben in vier Schritten** — 0.24.0 die Maschine,
0.24.1 die englischen Namen, 0.24.2 die gespeicherten Formen, 0.24.3 die zweite
Sprache, 0.24.4 die dritte. *Eine Nummer, die dieses Vorhaben mitten im Satz
teilt, sagt weniger über die Runde aus als eine, die es zusammenhält.* Die
Abweichung steht als solche im Projektstand (Regel S10) und ist keine
stillschweigende Ausnahme.

---

## Die zwölf Fragen sind vor der ersten Zeile beantwortet

**Der Auftrag stellte neun Fragen; drei kamen im Gespräch dazu (F8a, F8b,
F8c).** Alle zwölf sind vom Betreiber am 7. September 2026 entschieden und
standen im Papier, bevor eine Zeile Code entstand. **Zwei gingen gegen den
Vorschlag dieses Papiers:**

| | Frage | Vorschlag | Entscheidung |
|---|---|---|---|
| **F1** | Welche Nummer? | 0.25.0 *(SemVer)* | **0.24.3** — die Runde gehört zur 24er-Reihe |
| **F7** | Ziehen die Reste aus 0.24.1 mit? | nur, was mit einem Wert der Sprachdatei umzieht | **alles, auch was in der Datenbank steht** |

*Die übrigen zehn folgten dem Vorschlag: Bestand behält Deutsch (F2),
Vokabular je Sprache mit Rückfall (F3), `en-GB` als Locale (F4), der Betreiber
liest selbst gegen (F5), der Dateiname wird geprüft und der Inhalt nicht (F6),
Kategorien und Kriterien bekommen eine Namenstabelle daneben (F8, F8a, F8b),
alle Sprachfassungen im Export (F8c), eine neue Karte „Sprachen" (F9).*

---

## Was ein Mensch davon sieht

* **Eine Sprachzeile in „Darstellung"** — jeder Zugang wählt seine Sprache,
  und der Wechsel wirkt sofort, ohne Neuladen und ohne dass der andere am
  selben Bildschirm etwas davon merkt.
* **Eine Sprachzeile unter der Anmeldemaske** — dort steht noch kein Konto, aus
  dem sich etwas lesen ließe. Die Wahl merkt sich der Browser
  (`kriterion.language`), und beim nächsten Öffnen steht sie wieder da.
* **Eine neue Karte „Sprachen"** im Abschnitt „Installation", beim Eigentümer:
  die Vorgabesprache der Installation und der Vorrat, aus dem ein Benutzer
  wählen darf. *Was der Eigentümer nicht freigibt, taucht nirgends auf — auch
  nicht vor der Anmeldung.*
* **Ein Umschalter über dem Vokabular** und über den beiden Kriterienlisten
  und der Kategorienliste: der Eigentümer pflegt die Wörter und Namen je
  Sprache, während die Oberfläche in seiner eigenen bleibt.
* **Wer nichts einstellt, bekommt, was sein Browser verlangt.** `Accept-Language`
  ist die zweite von drei Quellen; die dritte ist die Vorgabe der Installation.

**Und was ein Mensch NICHT sieht:** ein Bestand, der auf 0.24.3 hochkommt,
spricht am nächsten Morgen weiter Deutsch. Eine frisch eingerichtete
Installation startet auf Englisch. *Das ist F2, und es ist der einzige Punkt
dieser Runde, an dem sich Bestand und Neuinstallation unterscheiden.*

---

## Die Maschine — was gebaut wurde

### Das Verzeichnis ist die Liste

`public/languages/` wird beim Start gelesen, und **jede `.json` darin ist eine
Sprache**. Es gibt keine zweite Liste daneben, die man pflegen müsste — wer
eine Datei dazulegt, hat eine Sprache dazugelegt.

**Damit kann eine Datei vom Eigentümer kommen und nicht mehr nur aus dem
Image — und dann trägt sie vielleicht Unfug.** Drei Klammern, und keine wirft:

| Was dasteht | Was geschieht |
|---|---|
| kaputtes JSON | die Datei zählt nicht, der Grund steht namentlich im Protokoll |
| `_locale`, die `Intl` nicht kennt | dasselbe — geprüft wird an `Intl.PluralRules` und nicht an einem Muster |
| ein Dateiname, der keine Sprachkennung ist | dasselbe — geprüft wird der NAME, nicht der Inhalt *(F6)* |
| die Pflichtdatei `en.json` fehlt | der Server startet trotzdem und sagt, worauf der Rückfall jetzt zeigt |

*Bis 0.24.2 warf `readLanguages()` an drei dieser Stellen. Das war vertretbar,
solange die Dateien aus dem Image kamen: seit das Verzeichnis die Liste ist,
kann eine Instanz an einer hineingelegten Datei sterben — und dann kommt
niemand mehr an die Oberfläche, über die man sie wieder entfernen würde.*

### Drei Quellen, eine Reihenfolge

`localeOf(req)` fragt in dieser Folge:

1. **der persönliche Schlüssel** `language` in `user_settings` — sofern er im
   Vorrat steht,
2. **`Accept-Language`** samt q-Gewichten; `de-AT` zählt als `de`,
3. **die Vorgabesprache der Installation.**

*Jede der drei wird gegen den VORRAT gehalten und nicht gegen das Verzeichnis:
was der Eigentümer gesperrt hat, kommt auch über einen Kopf nicht herein.*

### Zwei Schlüssel und nicht einer

`languageDefault` trägt die Vorgabe, `languageOn` den Vorrat. **Eine einzelne
Liste könnte „Vorgabe Deutsch, Vorrat alles" gar nicht ausdrücken.** Fehlt
`languageOn`, sind ALLE Sprachen im Vorrat — anders als bei den Suchmaschinen,
wo ein leerer Vorrat abgewiesen wird: Sprachen kommen mit dem Programm.

**Die Vorgabe ist immer im Vorrat.** Wer sie herausnimmt, bekommt sie
zurückgelegt statt eine Absage: der Eigentümer hat eine Absicht geäußert, und
die lässt sich erfüllen, ohne die Klemme zu brechen.

### Das Vokabular folgt dem Leser

Die vierzehn Wörter liegen **je Sprache**, mit zwei Rückfällen in dieser Folge:
was für DIESE Sprache eingetragen ist, sonst der ZUERST angelegte Satz, sonst
die Vorgabe aus der Sprachdatei des Lesers.

*„Zuerst angelegt" ist die erste Sprache im gespeicherten Objekt — JSON behält
die Einfügereihenfolge, und geschrieben wird immer über das vorhandene Objekt.
Ein zweiter Merker daneben wäre eine zweite Wahrheit.*

**Die gespeicherte Form wird beim LESEN gedeutet und nicht umgeschrieben:** ein
flaches Objekt ist der Satz der Vorgabesprache. *Dieselbe Regel im Schreibweg —
ein flacher Rumpf meint die Sprache des Aufrufers.*

### Kriterien und Kategorien: eine Tabelle daneben

Zwei neue Tabellen, `criterion_names` und `category_names`, jede mit
`(id, language, name)` und `ON DELETE CASCADE`.

**Die Grundzeile bleibt, wie sie ist.** `ratings.criterion_id` und
`items.product_category_id` werden nicht angefasst — eine Übersetzung ist eine
Zeile daneben und keine zweite Sache. Wo keine steht, steht der Name der
Vorgabesprache; ein leerer Name wäre hier das Naheliegende und das Falsche.

**Ohne Sprachangabe meint jeder Schreibweg die GRUNDZEILE.** *Das ist die
wichtigste Zeile dieses Bauabschnitts.* Die naheliegende Wahl wäre „die Sprache
des Lesers" — sie trägt nicht: ein Admin, der die Oberfläche auf Deutsch liest,
während die Installation Englisch vorgibt, legte damit bei JEDEM Umbenennen
eine deutsche Übersetzung an und ließe den englischen Namen stehen. **Er hätte
umbenannt und nichts geändert.**

**Eine Übersetzung, die der Grundzeile gleicht, wird geräumt und nicht
gespeichert:** zwei gleiche Namen in zwei Tabellen wären zwei Wahrheiten über
dasselbe Wort, und beim nächsten Umbenennen wanderte die eine mit, die andere
nicht.

---

## Drei Migrationsblöcke — und einer davon ist die Entscheidung F7

**`migration0243Language()`** schreibt einem BESTAND die Vorgabesprache `de`
ausdrücklich in die Ablage. *Ein abgeleiteter Wert („kein Eintrag UND es gibt
Zugänge, also Deutsch") trägt nicht: eine frisch auf Englisch eingerichtete
Installation hat im Augenblick der Einrichtung noch keinen Zugang und danach
einen — sie kippte in genau dem Augenblick auf Deutsch, in dem der erste Mensch
sein Konto anlegt.*

**`migration0243Stored()`** ist der zweite Block dieser Runde, und er steht
gegen den Vorschlag des Auftrags da. **Der Betreiber hat F7 mit „alles, auch
die Datenbank" entschieden**, und damit fällt der deutsche Rest aus 0.24.1
ganz:

| in der Ablage | heißt jetzt | wo |
|---|---|---|
| `sicher` | `secure` | `settings.mailzugang` |
| `seite` · `unten` · `zu` | `side` · `bottom` · `closed` | `user_settings.blocks` |
| `favorit` | `favorite` | `user_settings.filters` **und in jeder gespeicherten Ansicht** |
| `potenzial_desc` · `potenzial_asc` | `potential_desc` · `potential_asc` | dieselben beiden Orte |
| die **vierzehn** Vokabelnamen | `sacheEinzahl` → `entryOne` und so fort | `settings.vocabulary`, **auf beiden Stufen** |

**Das Vokabular ist der teure Fall.** `vocabulary()` läuft über die VORGABEN
und liest zu jedem Namen den gespeicherten Wert. Trägt die Ablage
`sacheEinzahl` und der Quelltext fragt nach `entryOne`, fällt JEDES der
vierzehn Wörter auf die Vorgabe zurück: **aus „Maschine" wird wieder
„Eintrag", still, an jeder Beschriftung zugleich.** Kein Fehler, keine Meldung
— nur ein Bestand, der über Nacht wieder Vorgabe spricht.

*Beide Stufen werden angesehen: die flache Form bis 0.24.2 und die Form je
Sprache seit Bauabschnitt 6 dieser Runde. Wer nur eine ansieht, migriert den
einen Bestand und den anderen nicht.*

**Die Tafel steht als Zeichenfolgen-Paare und nicht als Eigenschaftsnamen.**
`SHAPES_0242` eine Runde davor schreibt `{ vorlage: 'template' }` — und genau
dafür braucht der Prüfstand seither eine Ausnahmeliste (`OLD_STORED_NAMES`),
weil `vorlage` dort ein deutscher BEZEICHNER ist. Ein Paar `['seite', 'side']`
sagt dasselbe und ist eine Zeichenfolge: *eine Übersetzungstafel muss nennen
dürfen, was sie übersetzt, ohne es zu HEISSEN.*

**Alle drei Blöcke sind wiederholbar und im Normalfall stumm** — gefragt wird
die Zeile selbst und nicht ein Merker.

---

## Sieben Funde, die der Umbau aufgedeckt hat

**Alle sieben lagen seit 0.24.1 im Quelltext und waren stumm.** Der Umbenenner
von 0.24.1 fasst ausschließlich CODE-Abschnitte an; wo derselbe Name zusätzlich
in einer Zeichenfolge stand, lief er auseinander — und keine Prüfung sah es,
weil beide Seiten für sich richtig aussahen.

| | Was stumm war | Was am Bildschirm geschah |
|---|---|---|
| 1 | `sortBlocks()` griff auf `BLOCKS['seite']` | die Detailansicht warf beim Zeichnen |
| 2 | `VOCABULARY_FIELDS` trug die deutschen Vokabelnamen, `drawPreview()` las die englischen | die Probe der Karte „Vokabular" warf |
| 3 | `MANAGE_KIND.tag` hieß `date` — der Umbenenner hielt „tag" (Schlagwort) für „Tag" | die Karte „Tags" warf beim Zeichnen; dasselbe an sieben Stellen der Tagwolke |
| 4 | `SORT_STATUS` las `potential_desc`, die Auswahlliste schrieb `potenzial_desc` | die Statusvorgabe der Sortierung griff seit 0.24.1 nicht |
| 5 | `batchState('umstellung')` traf die Abbildung `{ conversion, geometry }` nicht mehr | die Bildumstellung meldete `null` statt ihres Standes |
| 6 | `FINDING_WORDS` kannte vier Quellnamen nicht mehr | fünf von sieben Trefferzeilen hießen „Fundstelle" |
| 7 | `document.documentElement.long` — `lang` war als Wort übersetzt worden | `<html lang>` stand seit 0.24.1 auf gar nichts |

*Der siebte ist der teuerste: `lang` am Wurzelelement ist das, woran ein
Vorleser, eine Silbentrennung und eine Rechtschreibprüfung die Sprache
erkennen. Er stand ein Jahr lang falsch, ohne dass irgendetwas rot wurde.*

**Und zwei deutsche Wörter, die seit 0.24.0 fest im Quelltext standen** und
kein Wächter fing, weil sie keine Sätze sind: „geladen" am Teil-Knopf des
Exports und „ am" vor dem Datum der Exportdatei. *Ein englischer Leser hätte
beide gesehen.* Beide sind jetzt Schlüssel.

---

## Nachtrag vom 8. September 2026 — die Sprachzeile unter der Anmeldemaske ist gestrichen

**Der Betreiber hat die Runde eingespielt, angesehen und entschieden: unter
der Anmeldemaske braucht es keinen Umschalter.** *„Nur Defaultsprache als
Anzeige im Login reicht. Keine Umschaltung."*

**Gebaut war sie in Bauabschnitt 3**, nach E6 des Konzepts: eine Pillenreihe
unter der Maske, die nur das Gedächtnis des Geräts schreibt. **Sie fällt
ganz** — und mit ihr zwei Dinge, die nur für sie da waren:

| | war | ist |
|---|---|---|
| `kriterion.language` im Gedächtnis des Browsers | wurde bei jeder Sprachwahl geschrieben und vor der Anmeldung gelesen | **fällt weg** — es hatte genau einen Leser |
| `languages` in `GET /api/config` | der Vorrat, gegen den das Gedächtnis geklemmt wurde | **fällt weg** — sechs Felder statt sieben |

*Ein gespeicherter Wert ohne Leser ist eine zweite Wahrheit über etwas, das
niemand mehr fragt, und eine Antwort trägt kein Feld, das niemand liest.
Deshalb fällt beides ganz und nicht nur sein Leseweg.*

**Was die Anmeldeseite jetzt spricht: die Vorgabesprache der Installation, und
sonst nichts.** *Wer angemeldet ist, liest in seiner Sprache — sie steht am
Zugang und gilt auf jedem Gerät, an dem er sich anmeldet.*

**Der Wächter über `/api/config` hat dabei etwas dazugelernt.** Er las den
Vorrat aus der Antwort vor der Anmeldung; die gibt es nicht mehr. **Er
richtet die Instanz mit den drei unbrauchbaren Dateien jetzt ein und fragt
dahinter** — und belegt damit nebenbei etwas, wonach vorher niemand gefragt
hatte: *dass eine Installation mit kaputtem JSON, unbrauchbarer `_locale` und
einem falschen Dateinamen im Sprachverzeichnis sich überhaupt einrichten
lässt.*

---

## Fünf Befunde aus dem ersten Rundlauf — vier davon sind 0.24.4

**Der Betreiber hat den Stand `80f90ee5` am 8. September 2026 eingespielt und
angesehen.** Der fünfte Befund ist noch in dieser Runde erledigt (die
Sprachzeile unter der Anmeldemaske, siehe den Nachtrag darüber); **die
übrigen vier stehen im Fahrplan bei 0.24.4** und sind hier genannt, damit sie
nicht zwischen den Papieren verlorengehen. *Keiner von ihnen ist
nachgestellt.*

**(1) Der Umschalter in den Karten „Vokabular", „Kategorien" und „Kriterien"
greift nicht.** Wer auf Deutsch liest und die englischen Wörter pflegen will,
sieht nach dem Umschalten weiter die deutschen — erst ein Hin- und
Herschalten zeigt sie richtig. **Wer auf Englisch liest, kommt mit dem
Umschalter gar nicht mehr auf Deutsch.**

**(2) Ein eingetragenes Wort kommt in seiner Sprache nicht an — der schwerste
der vier.** Kachel auf Englisch, ein englisches Wort eingetragen, gespeichert
— und danach steht auf einer englischen Oberfläche trotzdem nicht das
eingetragene Wort da. ***Die Zusage ist einfach: egal, wie der Schalter der
Oberfläche steht, muss in einer Sprache erscheinen, was für sie eingetragen
worden ist.*** *Es geht ausdrücklich nicht um die Wörter, für die nichts
eingetragen ist — dort ist der Rückfall aus F3 gewollt und bleibt.*

> **(1) UND (2) KÖNNTEN DERSELBE BEFUND SEIN.** Greift der Umschalter nicht,
> dann meint `vocabularyBody()` beim Speichern die Sprache des **Lesers** und
> nicht die eingestellte — das englische Wort landete dann im deutschen Satz.
> *0.24.4 stellt deshalb zuerst nach und baut dann; zwei Reparaturen an einer
> Ursache wären eine zu viel.*

**(3) Zwei deutsche Wörter stehen fest im Quelltext** und sind damit auch auf
Englisch deutsch: „alle N anzeigen" am zugeklappten Linkkasten und „N aktiv"
an der Filterzeile. *Beide sind keine Sätze und deshalb durch jeden Wächter
dieser Runde gefallen — der Bildschirmtext-Wächter prüft die Verbotsliste und
nicht die Sprache.*

**(4) Der Hinweis „Vorgabe: …" unter den vierzehn Vokabelfeldern zeigt immer
die Vorgabe des Lesers**, auch wenn die Karte auf eine andere Sprache
geschaltet ist. *Am Quelltext gesehen: `vocabularyDefault()` liest `TEXTS`,
und das ist die Datei des Lesers.*

*Der Betreiber prüft weiter; es kann mehr dazukommen.*

---

## Was diese Runde ausdrücklich NICHT tut

* **Kein Türkisch.** `tr.json` ist 0.24.4.
* **Keine übersetzten Inhalte** — Einträge, Kommentare, Tags, der Titel.
  *Kategorien und Kriterien sind ausgenommen (F8, F8a, F8b), aber auch dort
  übersetzt nichts von selbst: der Eigentümer trägt die zweite Fassung ein, und
  wo er es nicht tut, steht die erste.*
* **Keine Bibliothek.** Vierzig Zeilen gegen 40 kB.
* **Kein HTML in Sprachtexten.**
* **Kein Rechts-nach-links.** Die Bauform verbaut es nicht; das Stilblatt ist
  dafür nicht geprüft, *und das steht hier, damit es niemand für erledigt hält.*
* **Keine Region je Sprache** (`de-AT` neben `de-DE`). Die Bauform lässt sie
  zu, gebaut wird sie nicht.
* **Keine Umgestaltung.** Was beim Übersetzen als zu lang auffiel, bleibt zu
  lang und steht im Sammelblatt.
* **Die Blocknamen bleiben deutsch.** `kategorie`, `beschreibung`, `testtage`,
  `kommentare`, `bewertung`, `potenzial`, `dateien`, `links`, `tags` — die
  Entscheidung F7 nennt die BEREICHE, nicht die Blöcke darin. *Sie stehen als
  Gegenlage im Prüfstand: der Migrationsblock darf sie nicht anfassen.*

---

## Die Gegenproben sind gefahren — und drei waren ein Fund

**Vierundzwanzig Rückbauten, 710 bis 733**, je einer für ein Stück der neuen
Wächter. *Eine Prüfung, die grün ist, belegt nichts, solange niemand gezeigt
hat, dass sie auch rot werden kann.*

| # | Rückbau | Namentlich rot |
|---|---|---|
| 710 | kaputtes JSON nimmt den Server wieder mit | **7** |
| 711 | eine unbrauchbare `_locale` ebenso | **6** |
| 712 | der Dateiname wird nicht mehr geprüft | 3 |
| 713 | die übergangene Datei wird nicht mehr genannt | **STUMM — ein Fund** |
| 714 | ein Benutzer darf wieder jede Sprache setzen | **6** |
| 715 | die Vorgabesprache fällt beim SCHREIBEN aus dem Vorrat | **DREIMAL STUMM — drei Funde**, dann **2** |
| 716 | ohne Angabe gilt wieder die Sprache des Lesers | **5** |
| 717 | eine Übersetzung, die der Grundzeile gleicht, bleibt stehen | 1 |
| 718 | die Namenstabelle hängt nicht mehr an ihrer Grundzeile | 1 |
| 719 | die zweite Namenstabelle gibt es nicht mehr | **ABGERISSEN — ein Fund** |
| 720 | das Vokabular fehlt in der Tafel der gespeicherten Namen | **5** |
| 721 | der Block sieht nur die obere Stufe an | 1 |
| 722 | die gespeicherten Ansichten bleiben deutsch | 1 |
| 723 | die beiden Sortierwerte ziehen nicht mit | 2 |
| 724 | der Einklappzustand der Blöcke bleibt liegen | 3 |
| 725 | der Block meldet sich auch beim zweiten Start | 1 |
| 726 | bei zwei Namen gewinnt wieder der alte | 1 |
| 727 | der Block greift nach den Blocknamen, die deutsch bleiben sollen | 1 |
| 728 | der Bestand bekommt keine Vorgabesprache geschrieben | **4** |
| 729 | auch eine frische Installation bekommt sie geschrieben | 2 |
| 730 | der Block schreibt bei jedem Start neu | 2 |
| 731 | der Export nimmt die Sprachfassungen nicht mit | **4** |
| 732 | der Import legt sie nicht wieder hinein | 3 |
| 733 | die Vorgabesprache fällt beim LESEN aus dem Vorrat | 2 |

**Die drei Funde sagen drei verschiedene Dinge, und keiner davon ist „der
Wächter taugt nichts":**

**713 war stumm, weil der Rückbau nichts zurückgebaut hat.** Der Ersatz lautete
`(file, why) => why && false || console.error(…)` — und `||` wertet die rechte
Seite aus, sobald die linke falsch ist. **Die Meldung lief weiter.** *Ein
Rückbau, der ins Leere greift, sieht aus wie ein Wächter, der nichts hält, und
ist das Gegenteil davon.*

**715 war DREIMAL stumm, und jedes Mal aus einem anderen Grund. Der Rückbau
hat dreimal etwas über den Wächter gesagt und keinmal etwas über den Bau.**

***Erster Anlauf: die Klemme steht zweimal.*** `writeLanguages()` legt die
Vorgabesprache beim SCHREIBEN in den Vorrat zurück, `languagePool()` beim
LESEN. Der Rückbau nahm die schreibende weg — **die lesende fing ihn auf.**

***Zweiter Anlauf: dieselbe Doppelung, andere Richtung.*** Er nahm die lesende
weg — **die schreibende fing ihn auf.** *Die Doppelung ist mit Absicht gebaut
und richtig: die gespeicherte Ablage kann älter sein als das Verzeichnis, und
ein Eigentümer, der sich selbst aussperrt, kommt an keine Karte mehr, über die
er es richten würde.* **Der Fehler lag im Wächter:** er sah die Doppelung nur
als Ganzes und konnte über keine ihrer Hälften etwas sagen. *Also bekam jede
Hälfte ihre eigene Zeile — die schreibende an der Zeile in der Ablage, die
lesende an einem Vorrat, der am Schreibweg vorbei hineingelegt wird.*

***Dritter Anlauf: die richtige Zeile an der falschen Stelle.*** Die neue
Zeile für die schreibende Hälfte stand am ENDE der Gruppe — hinter einem
späteren `PUT`, der `en` ausdrücklich mitschickte. **Sie war grün, ohne dass
die Klemme irgendetwas getan hätte.** *Ein Wächter über eine Klemme muss dort
stehen, wo sie greift; eine Zeile, die dieselbe Sache prüft, sagt an zwei
verschiedenen Stellen zwei verschiedene Dinge.* Sie steht jetzt unmittelbar
hinter dem `PUT`, das die Vorgabe weglässt — **und im vierten Lauf ist 715
namentlich rot: zwei Zeilen, beide in ihrer Gruppe.**

*Drei Läufe zu je siebeneinhalb Minuten für einen Wächter, der von Anfang an
grün war. Genau dafür ist die Regel da: **eine stumme Gegenprobe ist ein
Fund**, und dreimal stumm heißt dreimal etwas gelernt.*

**719 riss den Lauf ab, statt rot zu werden.** Der Rückbau nahm die Tabelle
`category_names` weg — und eine vorbereitete Abfrage auf eine Tabelle, die es
nicht gibt, nimmt den Server schon beim Hochkommen mit. **Der Lauf endete nach
einer Sekunde und sagte über den Wächter nichts.** *Ein Rückbau muss die Sache
brechen, nicht den Lauf; er zielt jetzt auf den LESEWEG der Kategorienamen und
lässt den Server stehen.*

**Alle drei sind repariert und nachgefahren, und jeder ist jetzt namentlich
rot.** Dazu sind sieben weitere dazugekommen: drei an der Vorgabesprache des
Bestands (728 bis 730), zwei an den Sprachfassungen in der Exportdatei (731,
732), einer an der zweiten Hälfte der doppelten Klemme (733) — und 727 als
Gegenlage: er lässt den Migrationsblock nach den Blocknamen greifen, die
deutsch bleiben sollen. *Ein Block, der zu viel tut, richtet denselben
Schaden an wie einer, der zu wenig tut.*

**Alle vierundzwanzig sind gefahren, und jede ist namentlich rot.** *Keine
Prüfung dieser Runde steht als Behauptung da.*

---

## Zwei Punkte der Abnahme sind NICHT gefahren — und das steht hier

**Der Auftrag zählt elf Punkte auf, die der Prüfstand halten muss. Neun sind
gefahren, zwei nicht** — und sie stehen hier als benannte Abweichung und nicht
als stillschweigende Auslassung.

**Punkt 11 — der Augenschein an den zwanzig dichtesten Stellen, in beiden
Sprachen, am Telefon.** *Er lässt sich nicht maschinell fahren: er verlangt ein
Auge an einem echten Gerät.* **Was stattdessen gefahren ist:** der Prüfstand
misst jede Zeile in jsdom und hält die Umbruchpunkte fest; die Deckungsprobe
sichert, dass kein Schlüssel fehlt, und die Rückfallprobe, dass in keiner
Ansicht ein `⟦…⟧` steht. **Was er nicht sagt: ob ein englischer Satz an einer
Stelle zu lang ist, an der der deutsche gerade noch passte.** *Das gehört an
den Betreiber, und es ist genau der Punkt, für den F5 ihn als Gegenleser
benannt hat.*

**Punkt 7 und 8 — der Lauf gegen einen ECHTEN Bestand von `ae0084d8`.** *Dieser
Bestand liegt auf dem Wirt und nicht hier.* **Was stattdessen gefahren ist:**
ein GESTELLTER Altbestand, gebaut nach dem, WAS DIESE RUNDE ANFASST und nicht
danach, was leicht zu füllen ist (Stolperstein 325) — vierzehn eigene Vokabeln,
ein Mailzugang mit `sicher`, geschobene Blöcke mit Einklappzustand, ein Filter
mit `favorit` und einer Potenzialsortierung, zwei gespeicherte Ansichten mit
demselben Filter darin, ein Kriterium mit Bewertung und eine Kategorie an einem
Eintrag. **Nach dem Lauf steht alles da, und der zweite Lauf ist stumm.**
*Was der gestellte Bestand nicht sein kann: eine Instanz, in der über Wochen
gearbeitet wurde. Er ist die Klasse und nicht der Fall.*

**Beide bleiben offen, bis der Betreiber sie fährt.** *Ein Auftrag, dessen
Abnahme zu elf Neunteln erfüllt ist, sagt das — er rechnet nicht auf.*

---

## Was diese Runde an den Zahlen ändert

| | 0.24.2 | 0.24.3 |
|---|---|---|
| Sprachdateien | 1 | **2** *(`de.json`, `en.json`)* |
| Schlüssel je Datei | 1191 | **1204** *(+13, davon 2 für die beiden deutschen Wörter im Quelltext)* |
| Prüfungen | 5920 | **6019** (+99) |
| Rückbauten | 701 | **725** *(vierundzwanzig neue, 710 bis 733)* |
| Tabellen | 25 | **27** *(`criterion_names`, `category_names`)* |
| Austauschformat | 13 | **14** |
| `PERSONAL_KEYS` | 10 | **11** *(`language`)* |
| `OWNER_KEYS` | 4 | **6** *(`languageDefault`, `languageOn`)* |
| Felder in `/api/config` | 5 | **6** |
| Karten im Systembereich | 21 | **22** *(„Sprachen")* |
| Deutsche Bezeichner im Code | 116, alle benannt | **12, alle benannt** |
| `WAITING_FOR_STAGE_TWO` | 104 | **fällt weg** |
| Zeilen `server.js` | 7055 | **7711** |
| Zeilen `public/app.js` | 11018 | **11479** |
| Zeilen `db.js` | 1509 | **1769** |
| Zeilen `testbench.js` | 43943 | **44808** |
| Zeilen `counterproof.js` | 7213 | **7358** |
| Zeilen `public/style.css` | 3907 | **unverändert** |

---

## Die Dateien

* **`public/languages/en.json`** — neu, 1204 Schlüssel, dieselbe Liste und
  dieselbe Reihenfolge wie `de.json`.
* **`public/languages/de.json`** — die Platzhalternamen, die Mehrzahlformen
  (`one`/`other`) und die vierzehn Vokabelnamen sind englisch, der Kopf trägt
  `_locale` und `_name`, und zwei Schlüssel sind dazugekommen.
* **`server.js`** — `readLanguages()` samt drei Klammern, `localeOf(req)`,
  `languagePool()`, `writeLanguages()`, das Vokabular je Sprache, die beiden
  Namenstabellen, `EXCHANGE_FORMAT` 14.
* **`public/app.js`** — das Laden zweier Sprachen, die drei Pillenreihen, die
  Karte „Sprachen", die Umschalter über Vokabular, Kriterien und Kategorien.
* **`db.js`** — die beiden Tabellen und die beiden Migrationsblöcke der Runde.
* **`auth.js`** — `setCompareLocale()` neben `setTranslator()`.
* **`tools/placeholders-0243.json`** — neu: 89 Platzhalternamen, deutsch nach
  englisch, damit die Wortlautprobe den Satz und nicht den Namen vergleicht.
* **`tools/dictionary.json`, `tools/segments.js`, `tools/rename.js`** — die
  letzten deutschen Feldnamen der Werkzeuge (`grund` → `reason`, `art` → `kind`).
* **`testbench.js`** — drei neue Gruppen, die Namensprobe ohne
  `WAITING_FOR_STAGE_TWO`, ein `Accept-Language`-Umschlag um `fetch()`.
* **`counterproof.js`** — vierundzwanzig Rückbauten, 710 bis 733.
* **`Doku/Woerterbuch_Englisch_0_24_3.md`** — neu: die englische Fassung des
  Namenswörterbuchs, eingecheckt vor dem ersten übersetzten Satz.
* **`Doku/Auftrag_0.24.3.md`** — die zwölf Fragen mit ihren Antworten.
* **`README.md`** — ein Abschnitt „Sprache": die Wahl je Zugang, der Vorrat,
  und wie man eine eigene Sprachdatei dazulegt. *Im Auftrag nicht vorgesehen
  und beim Bauen dazugekommen: ein Betreiber, der die Anleitung liest, muss von
  einer sichtbaren Funktion darin erfahren.*
* **`package.json`, `package-lock.json`, `CHANGELOG.md`,
  `Doku/Projektstand_Kriterion_0_24_3.md`, `Doku/Konzept_Mehrsprachigkeit_0_24_0.md`
  (Nachtrag), `Doku/Fehler_und_Ideen.md`.**
