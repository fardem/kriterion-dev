# Auftrag 0.24.0 — „Das Deutsche wandert in eine eigene Datei"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** Kriterion redet heute
Deutsch, und jedes deutsche Wort steht fest im Quelltext — in `app.js`, in den
Servermeldungen, in den Mails. **In dieser Runde wird jeder dieser Texte aus
dem Code herausgenommen und in EINE Sprachdatei gelegt** — `de.json` unter
`public/sprachen/` (F1, vom Betreiber am 5. September 2026 entschieden). In
der Datei stehen **alle Texte der Oberfläche**, die vorkommen,
je Sache ein Schlüssel; der Code kennt nur noch die Schlüssel. **Die
Anwendung sieht danach genauso aus wie vorher** — das ist die Abnahme. *Was
der Admin und die Benutzer eingetragen haben — Vokabular, Tags, Kriterien,
Kategorien, der Titel, die Einträge — ist keine Oberfläche, sondern Inhalt:
es zieht nicht um und bleibt in der Sprache, in der es eingetragen wurde
(Fragen F3 und F4).* Englisch und die Wahl der Sprache kommen erst mit
Stufe 2.

**Stufe 1 der Mehrsprachigkeit — und davor zwei Befunde aus dem Betrieb am
hellen Schema.** Aufsetzend auf **0.23.0, Fingerprint `92f7a142`** — der Stand
von `main` am 5. September 2026 (`34da9ea`), dazu die Papiere aus `8603d0a`
(der gerückte Fahrplan und das Konzept). **Derselbe Bau läuft am Wirt**, der
Augenschein am Wirt ist also aussagekräftig — und er ist in dieser Runde die
Abnahme.

**Das Konzept steht und ist vollständig:
`Doku/Konzept_Mehrsprachigkeit_0_24_0.md`.** *Dieser Auftrag entscheidet keine
Bauform. Schlüssel, Platzhalter, Mehrzahl, die beiden Helfer, die Fehlerklasse
und die Sprachdatei stehen dort in den Abschnitten 3 bis 7 — hier steht nur,
in welcher Reihenfolge gebaut wird, was dabei nicht verhandelbar ist und woran
die Abnahme hängt.*

> **DIE NUMMER IST ENTSCHIEDEN: 0.24.0.** Der Betreiber hatte die Runde am
> 5. September 2026 zunächst **0.24.1** genannt. *Abschnitt 5.1 des
> Projektstands sagt für eine Runde, nach der die Installation nichts kann,
> was sie vorher nicht konnte, PATCH — und das trifft hier zu. Eine PATCH-Zahl
> setzt aber ihre MINOR-Zahl voraus, und eine 0.24.0 war noch nicht
> herausgegangen.* **Noch am selben Tag entschieden: diese Runde ist die
> 0.24.0** — die erste der Reihe nimmt die MINOR-Zahl der Mehrsprachigkeit,
> auch wenn sie allein noch keine Funktion bringt. *Die Funktion kommt mit
> Stufe 2; welche Nummer die trägt — die nächste freie MINOR-Zahl oder eine
> PATCH-Zahl hinter 0.24.0 —, entscheidet der Betreiber an ihrem Auftrag.*
> **Gebaut wird davon nichts anders.**

---

## Zuerst: acht Fragen, die vor der ersten Zeile geklärt werden

**Kein Bauabschnitt beginnt, bevor die Spalte „Antwort" gefüllt ist.** *Alle
acht sind beantwortet — F1 am 5. September 2026 vorab, F2 bis F8 im Gespräch
beim Start der Runde, am selben Tag.* Die
Fragen werden **beim Start der Runde im Gespräch** gestellt, beantwortet und
hier eingetragen — nicht unterwegs (Abschnitt 12 des Projektstands: *vor dem
Bauen besprechen, Entscheidungen ausdrücklich bestätigen lassen*). Die
Spalte „Vorschlag" ist der Vorschlag dieses Papiers; **entschieden ist
nichts, solange die Antwort fehlt.**

**Sieben von acht sind so entschieden worden, wie dieses Papier sie
vorgeschlagen hat.** *Die eine, die anders ausging, ist F3 — und sie ging
nicht gegen den Vorschlag, sondern über ihn hinaus: der Betreiber hat für
Stufe 2 die Bauform der Karte gleich mitentschieden (eine Karte, ein
Umschalter, und der zuerst angelegte Wortsatz als Rückfall). Für diese Runde
bleibt der Speicher flach, und damit ändert sich an dem, was hier gebaut
wird, nichts.* **Zu F4 sind zwei Schärfungen dazugekommen**, die im Papier
noch nicht standen: Tags sind eine Wolke für alle, und die Kriterien bekommen
in Stufe 2 je Sprache eine Fassung — in der Datenbank. *Beides ist für 0.24.0
folgenlos und steht hier, damit es nicht wieder gefragt wird.*

| # | Frage | Vorschlag | Antwort |
|---|---|---|---|
| **F1** | **Wie heißt die Sprachdatei, und in welcher Form?** Der Betreiber hat `de.lang` genannt; das Konzept schlägt `de.json` vor (E1) | **`de.json`** — Node und Browser lesen JSON ohne eine Zeile Code; Mehrzahlformen sind Objekte; jeder Editor kennt die Form. *`de.lang` ginge auch:* eine Zeile `schluessel=Text` je Text, ein eigener Leser von rund dreißig Zeilen, die Mehrzahl als zwei Schlüssel (`x.eins`, `x.andere`), und kein Editor hebt sie hervor. **Die Kennung `de` bleibt in beiden Fällen** (ISO 639-1, nicht `deu` oder `ger`) | **`de.json`** — entschieden am 5. September 2026 |
| **F2** | **Wo liegt sie?** | **`public/sprachen/`** — beide Seiten lesen dieselbe Datei, der Fingerprint deckt sie von selbst ab, keine neue Route (Konzept 3.3) | **`public/sprachen/`** — entschieden am 5. September 2026 |
| **F3** | **Was wird aus dem Vokabular — den vierzehn Wörtern, die der Admin umbenennt?** Der Betreiber: *es muss in der Sprache bleiben, die der Admin eingestellt hat, auch wenn ein Benutzer die Oberfläche umschaltet* | **Das Vokabular folgt der Installation, nicht dem Benutzer.** Es gibt **einen** Satz von vierzehn Wörtern je Installation; seine Vorgaben kommen aus der Sprachdatei der **Installationssprache** (in dieser Runde `de.json`), die Überschreibungen des Admins bleiben, wie sie sind. *In einer englischen Oberfläche (Stufe 2) steht dann weiter das Wort, das der Admin gewählt hat — wie der Titel der Installation: es sind die Namen der Sache, keine Texte der Oberfläche.* Das Konzept hatte in E9 ein Vokabular je Sprache vorgeschlagen; **der Betreiber hat es in Frage gestellt, und dieser Auftrag folgt ihm** | **Es folgt der Installation — in dieser Runde.** Die **Vorgaben** kommen aus `de.json` unter `vokabular.*`; der gespeicherte Schlüssel `vokabular` **bleibt flach**, ein Satz von vierzehn Wörtern, wie heute. *Der Betreiber hat dazu die Bauform für Stufe 2 entschieden: **eine** Karte, die je nach eingestellter Sprache den passenden Wortsatz zeigt — kein zweiter Ort —, und wo für eine Sprache noch nichts eingetragen ist, **steht der zuerst angelegte Satz da statt nichts**. Gebaut wird das in Stufe 2; ein flacher Altwert gilt dort als `de`. In dieser Runde ändert sich am Speicher nichts* — entschieden am 5. September 2026 |
| **F4** | **Tags, Kriterien, Kategorien, der Titel, die Einträge, Kommentare — bleiben so?** | **Ja, unverändert.** Inhalt, eingetragen von Menschen, in ihrer Sprache; kein Umzug, keine Übersetzung, in keiner Stufe (E11). *Bestätigen, damit es nie wieder gefragt wird* | **Ja — alles bleibt Inhalt in der Datenbank, und in dieser Runde zieht nichts davon um.** *Zwei Schärfungen des Betreibers: **Tags sind eine Wolke für alle** — sie gehören keiner Sprache, sondern allen Benutzern zugleich; und **die Kriterien bekommen in Stufe 2 je Sprache eine Fassung — in der Datenbank, nicht in der Sprachdatei.** Kategorien, Titel, Einträge und Kommentare nie.* Für 0.24.0 heißt beides dasselbe: kein Umzug, keine Übersetzung, kein Bestandslauf — entschieden am 5. September 2026 |
| **F5** | **Was zählt als Text der Oberfläche?** | **Alles, was ein Mensch am Bildschirm oder in einer Mail liest:** `app.js`, die `error`-Meldungen des Servers, was `auth.js` als Fehler wirft, die vier Briefe samt Betreff. **Nicht:** Konsole, `zugang.js`, `schluessel.js`, Kommentare, Papiere, Prüfstand — die bleiben Deutsch (Konzept, Abschnitt 0) | **Wie vorgeschlagen: was ein Mensch am Bildschirm oder in einer Mail liest** — entschieden am 5. September 2026 |
| **F6** | **Wie heißen die Schlüssel in der Datei?** | **Deutsch, nach der Sache, mit Namensraum** — `dialog.fotoLoeschen.frage`, nicht der Satz selbst und nicht `t17` (E2) | **Deutsch, nach der Sache, mit Namensraum** — entschieden am 5. September 2026 |
| **F7** | **Die Zeitleiste im hellen Schema — welche Werte?** (Bauabschnitt 0.1) | **`#b9c2cb` · `#9aa5b0` · `--muted`** — 1,54 · 2,13 · 4,62 gegen den Grund; das dunkle Schema bleibt. *Am Wirt mit echten Punkten ansehen* | **`#b9c2cb` · `#9aa5b0` · `--muted`** — entschieden am 5. September 2026; **am Wirt zu bestätigen (B1)** |
| **F8** | **Der Umschalter der Tagzeile — wo, und wie heißt er?** (Bauabschnitt 0.2) | **Rechts in der Kategoriezeile, „Tags" mit Zahl** — der Vorschlag des Betreibers, geschärft nach S1. *Dazu am Wirt nachstellen, warum die Tags nach dem Klick nicht erschienen* | **Rechts in der Kategoriezeile, „Tags" mit Zahl** — entschieden am 5. September 2026; **am gebauten Stand am Wirt zu bestätigen (B2)** |

**Was nicht gefragt wird, weil es entschieden ist:** die Nummer (0.24.0, der
Kasten oben), die Reihenfolge der Bauabschnitte, und die technischen
Entscheidungen A1 bis A3 sowie die des Konzepts, die unten stehen. *Sie werden
beim Start genannt und nicht neu verhandelt — es sei denn, der Betreiber
will.*

---

## Woher

**Der Fahrplan hat die Mehrsprachigkeit am 5. September 2026 auf 0.24.0
vorgezogen**, und das Konzept ist am selben Tag geschrieben worden. Es
empfiehlt in E12, Stufe 1 und Stufe 2 zusammen herauszugeben. **Der Betreiber
hat anders entschieden, noch am selben Tag: Stufe 1 geht zuerst und allein.**

Der Grund trägt: Stufe 1 ist **die größte Runde des Projekts nach Zeilen und
die unsichtbarste nach Wirkung** (Konzept, Stufe 1). Wer sie allein
herausgibt, hat einen Stand, an dem sich genau eine Sache beweisen lässt —
*nichts sieht anders aus, und kein Text steht mehr im Quelltext* — bevor die
Wahl der Sprache irgendetwas daran verdeckt.

**Was das Konzept mitbringt und dieser Auftrag voraussetzt:**

1. **Die Arbeitsmenge ist gezählt** (Konzept, Abschnitt 2): rund 1.800
   lesbare Bausteine in `app.js`, 125 Meldungen in `server.js`, rund 40 in
   `auth.js`, 55 Zeilen in `mail.js`, 52 Mehrzahlstellen, acht Format-Helfer.
2. **Die Bauform ist entschieden** (E1 bis E4, E9 zur Hälfte, E10, E11):
   JSON unter `public/sprachen/`, deutsche Schlüssel nach der Sache,
   benannte Platzhalter, Mehrzahl als Objekt, `t()`/`tH()` im Browser,
   `t(sprache, …)` im Server, `Meldung` statt `Error` in `auth.js`.
3. **Die Wächter sind benannt** (Konzept, Abschnitt 9): drei lesen um, sieben
   kommen dazu.

---

## Worum es geht, in vier Sätzen

**Jeder Text, den ein Mensch am Bildschirm oder in einer Mail liest, verlässt
`public/app.js`, `server.js`, `auth.js` und `mail.js` und steht als Schlüssel
in der Sprachdatei** (`public/sprachen/de.json`, F1). Der Quelltext ruft
`t()` und sonst nichts. **Die Anwendung sieht danach genauso aus wie vorher**
— dasselbe Wort an derselben Stelle, derselbe Umbruch. **Keine Wahl, keine
zweite Sprache, kein Schema, keine Route, keine Abhängigkeit, kein
Bestandslauf** — die Wahl kommt mit Stufe 2.

| | zieht um in die Sprachdatei | bleibt, wo es ist |
|---|---|---|
| **Oberfläche** (`app.js`) | jede Beschriftung, jeder Knopf, Tooltip, Platzhalter, Toast, Dialog, jede Fehlermeldung — rund 1.800 Bausteine | Zeichen (`⌀`, `·`, `→`), Adressen, Selektoren, Bezeichner |
| **Server** | die `error`-Meldungen, was `auth.js` als Fehler wirft, die zwei Sätze des Fehler-Handlers | Konsolenmeldungen für den Betreiber, Programmierfehler ohne Bildschirm |
| **Mails** | die vier Briefe samt Betreff | — |
| **Vokabular** | nur die **Vorgaben** der vierzehn Wörter (heute zweimal im Code) | die Wörter, die der Admin gesetzt hat — **sie folgen der Installation, nicht dem Benutzer** (F3) |
| **Inhalt** | — | Tags, Kriterien, Kategorien, Titel, Einträge, Kommentare — in der Sprache, in der sie eingetragen wurden (F4) |
| **Projekt** | — | Kommentare, Papiere, Prüfstand, Werkzeuge — Deutsch |

**Davor, als Bauabschnitt 0, zwei Befunde aus dem Betrieb am
hellen Schema** — die Zeitleiste ohne sichtbare Linien und Jahreszahlen, und
der Aufklapper „Weitere Filter", der Platz kostet statt spart. *Sie fahren
mit, weil sie klein sind und am selben Stand aufgefallen sind; der
Augenschein von Stufe 1 gilt dann gegen den Stand NACH ihnen.*

---

## Bauabschnitt 0 — zwei Befunde aus dem Betrieb am hellen Schema

**Beide gemeldet am 5. September 2026 vom Betreiber, am Wirt, 0.23.0
`92f7a142`, helles Schema — mit Bild.** Keiner stand im Sammelblatt und
keiner im Fahrplan; sie gehen unmittelbar in diesen Auftrag, wie die Befunde
zu 0.21.1 und 0.22.1. **Sie werden zuerst gebaut und als eigener Commit
eingecheckt**, damit der Vergleich „nichts sieht anders aus" für Stufe 1
einen festen Stand hat.

### 0.1 Die Zeitleiste — Linien und Jahreszahlen sind im hellen Schema nicht zu sehen

**Der Befund:** *„Linien 0 bis 5 und Jahreszahlen sind nicht sichtbar."* Auf
dem Bild stehen die Punkte frei in der Luft, die Achse ist eine Ahnung, die
Jahreszahlen sind hellgrau und winzig.

**Die Ursache ist gemessen, nicht geraten.** Die Zeitleiste liegt seit 0.22.0
ohne Kasten **auf dem Grund der Seite** (`--bg`), nicht auf einer Karte
(`style.css:2393`). Ihre fünf Hilfslinien je Notenstufe (1 bis 5, die dritte
kräftiger — `drawZeitleiste()`, `app.js:3487`) und der Strich der Jahresachse
tragen `--line-2`, die mittlere `--line`, die Jahreszahlen `--faint` bei
0,63 rem (`style.css:2400–2418`). **Das Farbkonzept hat diese Paarungen nie
gemessen — es hat „Rand auf der Karte" gemessen, und die Zeitleiste hat keine
Karte.** Gegen `--bg`:

| | dunkel `#0e1012` | **hell `#eaedf1`** |
|---|---|---|
| Hilfslinie und Jahresachse, `--line-2` | 1,22 : 1 | **1,02 : 1** — unsichtbar |
| mittlere Linie, `--line` | 1,35 : 1 | **1,24 : 1** |
| Jahreszahl, `--faint` | 3,47 : 1 | 3,46 : 1 — *aber bei 0,63 rem Festbreite, und `--faint` ist laut Farbkonzept nie tragender Text* |

*Im dunklen Schema tragen dieselben Werte, weil eine hellere Linie auf
Schwarz mehr hergibt als eine dunklere auf Hellgrau — die Zahl ist ähnlich,
das Auge sieht anders. Das ist die Lücke im Farbkonzept, und sie gehört
dorthin nachgetragen (Abschnitt 4.1, die Paarungen gegen den Grund).*

**Was gebaut wird — drei eigene Werte, damit das dunkle Schema unberührt
bleibt:**

```
                  dunkel (heute, bleibt)     hell (neu)              auf --bg hell
--zl-linie        = var(--line-2)            #b9c2cb (= --line-hover)  1,54 : 1
--zl-mitte        = var(--line)              #9aa5b0                    2,13 : 1
--zl-jahr         = var(--faint)             = var(--muted) #616b75     4,62 : 1
```

`.zl-linie`, `.zl-linie.mitte`, `.zl-jahre` (der `border-top`) und `.zl-jahr`
lesen diese drei statt der allgemeinen Randfarben. **Der Schwebehinweis
(`.zl-hinweis`) und die Punkte bleiben, wie sie sind** — sie liegen auf
`--surface-2` bzw. in Gold und tragen.

**Was dabei nicht verhandelbar ist:**

* **Das dunkle Schema ändert keinen Bildpunkt** — die drei Variablen tragen im
  `:root`-Block genau die heutigen Werte. *Dieselbe Regel wie in 0.23.0: wer
  es „nebenbei verbessert", hat den Auftrag verlassen.*
* **Die Latte im hellen Schema:** Hilfslinie ≥ 1,5, mittlere ≥ 2,0,
  Jahreszahl ≥ 4,5 gegen `--bg` — **gerechnet im Prüfstand mit dem
  Rechenweg aus 0.23.0**, nicht abgeschrieben. Die drei Werte oben sind der
  Vorschlag; **bestätigt werden sie am Wirt, am hellen Bildschirm, mit echten
  Punkten (B1).**
* **Keine feste Farbe im Stilblatt** — der Wächter aus 0.23.0 (keine
  Farbliterale außerhalb der `:root`-Blöcke) bleibt grün; die neuen Werte
  stehen in den Blöcken.

### 0.2 Der Aufklapper „Weitere Filter" — er kostet Platz, statt ihn zu sparen

**Der Befund:** *„Weitere Filter sollte Platz sparen, indem die Tags
einklappen — aber diesen Platz hat jetzt dieser Knopf genommen. Wenn die Tags
zusätzlich eingeblendet werden, braucht es mehr Platz als vorher."*

**Die Ursache steht im Aufbau.** Der Aufklapper ist ein `<details>` mit einer
`<summary>` als Zusammenfassung (`app.js:3134–3138`, `style.css:739–749`,
E8 der Runde 0.22.0). **Die Zusammenfassung ist ein Block und belegt eine
eigene Zeile** — zwischen der Kategoriezeile und der Sortierzeile steht
„› Weitere Filter" als Zeile für sich. Zugeklappt spart das gegenüber der
alten, immer sichtbaren Tagzeile nur den Unterschied zwischen einer
Beschriftungszeile und einer Tagzeile; **aufgeklappt stehen Zusammenfassung
UND Tagzeile da — eine Zeile mehr als vor 0.22.0.** *E8 wollte die Zeile
sparen, die den Platz kostet; gebaut wurde eine Zeile, die den Platz kostet,
und die andere dahinter.*

**Was der Betreiber vorschlägt, und was dieser Auftrag daraus macht:** der
Umschalter **an das rechte Ende der Kategoriezeile** — dort, wo in der
Sortierzeile „Filter zurücksetzen (1)" steht, in derselben Bauform
(`link-btn` mit Winkel, `margin-left: auto`). Zugeklappt ist die Tagzeile
**ganz** weg, aufgeklappt erscheint sie als gewöhnliche `.frow` mit der
Beschriftung „Tags" darunter — **keine eigene Zeile für den Umschalter, in
keinem der beiden Zustände.** Auf dem Telefon bricht der Umschalter unter die
Kategoriepillen; das kostet dort eine kurze Zeile, zugeklappt wie
aufgeklappt, und immer noch weniger als heute.

**Die Beschriftung wird „Tags", nicht „Weitere Filter".** Hinter dem
Umschalter steht allein die Tagzeile (E8: *„nur die Tagzeile"*), und ein Text
sagt, was der Klick tut (S1). *„Weitere Filter" verspricht mehr, als
dahinter liegt — und der Betreiber hat es selbst so gelesen: „Weitere
Tag-Filter".* Dazu die Zahl der greifenden Tagfilter, wenn es welche gibt:
„Tags (2)".

**Die beiden Regeln aus 0.22.0 bleiben, wörtlich:** greift ein Tagfilter,
steht die Tagzeile beim Aufbau **offen** — ein Filter, der die Liste kürzt
und unsichtbar ist, ist ein Fehler; und `filterZahl()` zählt ihn weiter mit.
`WEITERE_FILTER_OFFEN` (`app.js:1452`) bleibt der Merker für die Dauer der
Sitzung.

**„… und blendet zusätzlich nicht die Tags ein."** Der Prüfstand hält das
Öffnen im jsdom für richtig (Gruppe „Der Aufklapper „Weitere Filter" —
0.22.0", `pruefung.js:40939`). **Am Wirt nachstellen, bevor gebaut wird**
(Abschnitt 12 des Projektstands: erst nachstellen, dann behaupten): zeigt der
Wirt nach dem Klick keine Tags, ist es entweder ein Fall, den der Prüfstand
nicht stellt — kein Tag mit `usage_count > 0`, dann steht dort „Noch keine
Tags" —, oder ein Stilblattfehler im hellen Schema. **Beides gehört in diesen
Abschnitt, und was es war, steht im Änderungsprotokoll.**

**Was dabei nicht verhandelbar ist:**

* **Kein `<details>` mehr, sondern ein Knopf mit `aria-expanded`** — die
  Zusammenfassung eines `<details>` lässt sich nicht in eine fremde Zeile
  setzen. Zustand und Tastatur trägt der Knopf (Enter, Leertaste, Fokusring).
* **Die Tagzeile bleibt eine `.frow` wie ihre Nachbarn**, mit Beschriftung,
  Und/Oder-Umschalter, Wolke, „mehr" und „Tags zurücksetzen" — daran ändert
  sich nichts.
* **Die Alternative, wenn der Betreiber den Umschalter lieber links will:**
  die Beschriftung der Tagzeile selbst wird der Umschalter — „› TAGS"
  zugeklappt in der Beschriftungsspalte, „⌄ TAGS Und Oder …" aufgeklappt in
  derselben Zeile. *Kostet zugeklappt eine Beschriftungszeile, aufgeklappt
  nichts; hält die Spalte der Beschriftungen bündig.* **Entschieden wird am
  gebauten Stand am Wirt (B2); gebaut wird zuerst der Vorschlag des
  Betreibers.**

### 0.3 Der Prüfstand in diesem Abschnitt

* **Die drei Paarungen der Zeitleiste gegen `--bg` im hellen Block,
  gerechnet** — Hilfslinie ≥ 1,5, mittlere ≥ 2,0, Jahreszahl ≥ 4,5 —, und
  **die drei Werte im dunklen Block sind die heutigen** (`--line-2`, `--line`,
  `--faint`).
* **Die Gruppe „Der Aufklapper „Weitere Filter" — 0.22.0" zieht mit:** der
  Umschalter steht in der Kategoriezeile, trägt „Tags" und `aria-expanded`;
  zugeklappt gibt es keine `.frow` mit der Beschriftung „Tags"; aufgeklappt
  eine, mit Und/Oder und Wolke; mit greifendem Tagfilter steht sie beim Aufbau
  offen; `filterZahl()` zählt ihn. **Die Zusicherung `tagName === 'DETAILS'`
  fällt — und wird nicht gelöscht, sondern zur Zusicherung über den Knopf.**
* **Je Prüfung eine Gegenprobe.**

---

## Bauabschnitt 1 — der Helfer und die Ladung

**KLEIN, UND ZUERST.** Alles Weitere hängt daran; er wird fertig, bevor der
erste Text umzieht.

### 1.1 Was gebaut wird

* **`public/sprachen/de.json`** mit dem Kopf `"_locale": "de-DE"` und genau
  drei Schlüsseln: der Rückfallsatz von `api()` (*„Der Server meldet einen
  Fehler ({status})."*, `app.js:57`) und die zwei Sätze des Fehler-Handlers
  (`server.js:6677`). *Drei, damit der Weg von der Datei bis zum Bildschirm
  und bis in die Antwort des Servers einmal ganz durchläuft.*
* **Im Browser:** `t()` und `tH()` wie im Konzept, Abschnitt 4.4 — `SPRACHE`,
  `TEXTE`, `LOCALE` (aus `_locale`), der Rückfall auf `⟦schluessel⟧`. **Die
  Ladung in `boot()`** (`app.js:10801`), **parallel zu `/api/config` und vor
  dem ersten Zeichnen.** *Scheitert die Ladung, zeigt `boot()` einen einzigen
  festen Satz — „Die Sprachdatei fehlt." — und hält an. Das ist der eine
  erlaubte Text im Code, und er steht auf der Restliste (Bauabschnitt 5).*
* **Im Server:** alle `public/sprachen/*.json` beim Start gelesen; fehlt
  `de.json`, startet der Server nicht. `t(sprache, schluessel, werte)` mit
  derselben Mehrzahl- und Platzhalterregel wie im Browser. `spracheVon(req)`
  **liefert in dieser Runde immer `de`** — die Funktion steht, damit Stufe 2
  nur ihre Quellen einhängt. **Die Klasse `Meldung`** (Schlüssel, Werte,
  Status) und **der Fehler-Handler, der sie übersetzt** und in `error` legt.
* **`api()`** liest seinen Rückfallsatz über `t()`.

### 1.2 Was dabei nicht verhandelbar ist

* **Ein Text ist ein String oder ein Objekt `{ eins, andere }` — sonst
  nichts.** Kein Feld, das der Helfer nicht kennt.
* **Der Helfer setzt Werte ein und maskiert sie in `tH()`; den Text selbst
  maskiert er nie.** Der Text kommt aus der Datei und enthält kein HTML
  (Konzept 4.2) — **der Prüfstand hält fest, dass kein Wert in `de.json` ein
  `<` oder `>` trägt.**
* **In Attributen wird der ganze Text maskiert:** `title="${esc(t('…'))}"`,
  ebenso `placeholder` und `aria-label`. *Die Texte des Projekts tragen den
  geraden Anführungsstrich am Ende eines Zitats (`„Getestet"`), und der
  sprengt ein Attribut.*
* **Die Mehrzahl wählt `Intl.PluralRules(LOCALE)`**, nicht `n === 1`. Im
  Server dieselbe Klasse, mit der Locale der jeweiligen Sprache.
* **Der Rückfall auf Deutsch ist in dieser Runde leer** — es gibt nur
  Deutsch. Er wird trotzdem jetzt gebaut und mit einer Prüfung belegt, nicht
  in Stufe 2 nachgeholt.

### 1.3 Der Prüfstand kommt in diesem Abschnitt dazu und nicht später

**Eine Gruppe an gestellten Texten:** Platzhalter, Vokabelplatzhalter aus
`V`, Mehrzahl mit `n = 0`, `1`, `2`; `tH()` maskiert einen Wert mit `<`;
ein fehlender Schlüssel liefert `⟦…⟧`; eine `Meldung` läuft durch den
Fehler-Handler und kommt als `error` mit übersetztem Satz und richtigem
Status heraus; `boot()` zeichnet nichts, bevor die Datei da ist. **Je Prüfung
eine Gegenprobe.**

---

## Bauabschnitt 2 — die Serverseite: `server.js`, `auth.js`, `mail.js`

**Die kleinere Hälfte, mit den meisten Mehrzahlformen — und die, die der
Prüfstand heute schon liest.**

### 2.1 Was gebaut wird

* **`server.js`:** jedes Literal hinter `error:` wird `t(spracheVon(req),
  'server.…', {…})`. Die **25 Meldungen mit Vokabelwort** benutzen die
  Platzhalter `{sache}`, `{sacheMehrzahl}`, `{merkmalJa}` … (die vierzehn
  Namen aus `V`); die **sechs Mehrzahlstellen** werden Objekte mit zwei
  ganzen Sätzen — das Beispiel steht im Konzept, 4.3 (`server.js:3594`).
  Dazu die beiden `new Error` mit Status 400 (`:215`, `:3758`) als `Meldung`,
  und `zahl()` (`:2247`) liest die Locale der Sprache statt `replace`.
* **`auth.js`:** die rund vierzig `throw new Error('…')` mit deutschem Satz
  werden `throw new Meldung('anmeldung.…', {…})`; `ZWEITER_FAKTOR_ABSAGE`
  (`:1424`) wird ein Schlüssel; **der Adressprüfer (`:112–120`) gibt
  Schlüssel statt Sätze zurück**, und die Karte, die ihn zeigt, übersetzt.
  *Was `new Error` bleibt, ist ein Programmierfehler ohne Bildschirm — und die
  Liste dieser Stellen steht namentlich im Prüfstand.*
* **`mail.js`:** die vier Briefe bekommen `sprache` als Parameter (in dieser
  Runde immer `de`); jede Zeile ist ein Feld eines Schlüssels je Brief;
  **die vier Betreffzeilen ziehen von `server.js` (`:110`, `:162`, `:1502`)
  in die Datei** und werden in `mail.js` gebaut, der Titel der Installation
  bleibt Platzhalter. Dazu `HINWEISE`, `HINWEIS_IMMER` (`:50–56`) und die drei
  Absagen (`:245`, `:246`, `:255`) — **sie stehen am Bildschirm und ziehen
  mit.**
* **Die Vokabelvorgaben:** `VOKABULAR_VORGABE` (`server.js:1619`) fällt weg,
  `vokabular()` liest die Vorgabe aus der Sprachdatei der **Installation**
  unter `vokabular.*` — in dieser Runde `de.json`. **Der gespeicherte
  Schlüssel `vokabular` bleibt, wie er ist:** ein Satz Wörter je Installation,
  vom Admin gesetzt, unabhängig davon, welche Sprache ein Benutzer später
  wählt (F3). *Kein Objekt je Sprache — anders als das Konzept in E9
  vorschlug.*
* **Was aus `bilder.js`, `bestandslauf.js` und `anhaenge.js` als Fehler bis
  zum Browser gelangt, wird beim Umzug gezählt und mitgenommen** — das
  Konzept hat dort keinen Bildschirmtext gefunden; ein Fund ist ein Fund.

### 2.2 Was dabei nicht verhandelbar ist

* **Kein Wort ändert sich.** Jeder Satz zieht so um, wie er dasteht — mit
  seinem Komma, seinem Anführungszeichen, seinem Punkt. *Wer beim Umzug einen
  Text verbessern will, schreibt ihn auf die Liste für eine eigene Runde
  (Abschnitt „Was danach offen bleibt").* **Sonst stimmt weder der
  Augenschein noch eine der 312 Zusicherungen mehr.**
* **Kein Satz wird aus Stücken gebaut.** Wo heute `${n === 1 ? 'ist' :
  'sind'}` steht, stehen künftig zwei ganze Sätze in der Datei.
* **`spracheVon(req)` kennt in dieser Runde keine Quelle.** Kein
  `Accept-Language`, kein Benutzerschlüssel, kein Eintrag in `/api/config` —
  **die fünf Felder dort bleiben fünf.**

### 2.3 Der Prüfstand in diesem Abschnitt

**Der Servertext-Wächter (`servertexteVon`, `pruefung.js:24451`) dreht sich
um:** er findet **null** Literale hinter `error:` in `server.js` und
`auth.js` und **null** deutsche Sätze in `throw new Error` in `auth.js`; die
Untergrenze „mehr als hundert Meldungen" (`:15406`) zählt fortan die
`server.*`- und `anmeldung.*`-Schlüssel in `de.json`. **Die Gruppe „Vokabular
in den Servermeldungen" läuft unverändert weiter** — sie liest die Antwort,
nicht den Quelltext.

---

## Bauabschnitt 3 — die Oberfläche: `public/app.js`

**DAS IST DER BROCKEN.** Rund 1.800 Bausteine, 167 `innerHTML`-Vorlagen,
102 `textContent`, 107 Tooltips, 172 Toasts, 25 Dialoge, 46 Mehrzahlstellen.

### 3.1 In dieser Reihenfolge, Ansicht für Ansicht

1. **Anmeldung und Einrichtung** — `showLogin()` (`:621`), die Einrichtung,
   die drei Token-Seiten (`#/einladung`, `#/passwort`, `#/bestaetigung`).
2. **Kopfzeile und Liste** — Filterleiste, Sortierzeile, Kacheln,
   Suchzeile und Trefferkontext, die Glocke.
3. **Der Eintrag** — Blöcke, beide Sternkästen, Fotos und Betrachter,
   Testtage, Aufgaben, Kommentare, Links, Dateien.
4. **Die Dialoge** — `confirmBox`, `nameBox`, `passwortFenster`,
   `neuesPasswortFenster`, `benutzerLoeschenFenster`, samt Titel, Satz und
   Knopf nach S7.
5. **Einstellungen, Karte für Karte** — einundzwanzig Karten, darunter
   „Vokabular" (die Beschriftungen aus `VOK_FELDER`, `:8237`; „Vorgabe: …"
   liest `TEXTE.vokabular`) und „Darstellung" (`THEMA_NAMEN`, `:1775`).
6. **Toasts, Neuigkeiten, relative Zeiten** — *„vor 1 Tag / vor N Tagen"*
   (`:10279`), *„noch N Tage"* (`:8541`), `zaehl()` (`:514`, `:7036`) und die
   fünf Vokabelzähler (`:1522–1526`) als Mehrzahlobjekte.

**Nach jeder Ansicht:** der Prüfstand grün, **und die Ansicht am Wirt neben
dem Stand davor** — dasselbe Wort an derselben Stelle, oder es ist ein Fund.

### 3.2 Was dabei nicht verhandelbar ist

* **Kein Wort ändert sich** (2.2 gilt hier wörtlich).
* **Im Inhalt `tH()`, in Attributen `esc(t())`, in `textContent`, `title =`
  und `placeholder =` das nackte `t()`.** Drei Formen, keine vierte.
* **Die Vokabelwörter kommen aus `V` wie heute** — nur die Vorgabe von `V`
  kommt aus `TEXTE.vokabular` statt aus `VOK_VORGABE` (`:8228`), das wegfällt.
  *Stolperstein 47 wird damit an dieser Stelle eingelöst: eine Vorgabe, ein
  Ort.*
* **Zeichen sind keine Texte:** `⌀`, `·`, `→`, `—`, `%`, Zahlen, Adressen,
  Selektoren und Bezeichner bleiben, wo sie sind, und stehen auf der
  Restliste.
* **Kein Text wird zusammengesetzt, kein Vokabelwort verbaut** (S6). Wo eine
  Vorlage heute `'Foto ' + n` schreibt, steht künftig ein Schlüssel mit `{n}`.

### 3.3 Der Prüfstand in diesem Abschnitt

**Der Bildschirmtext-Wächter (`bildschirmtexteVon`, `pruefung.js:24388`)
liest ab hier `de.json` statt `app.js`:** jeder Wert der Datei gegen
`BILDSCHIRM_VERBOT` (`:24481`), das unverändert bleibt; die Untergrenze „mehr
als achthundert lesbare Texte" (`:15402`) gilt für die Datei. **Und über
`app.js` läuft er weiter — mit einer Obergrenze:** die Restprobe
(Bauabschnitt 5).

---

## Bauabschnitt 4 — die Format-Helfer und `<html lang>`

### 4.1 Was gebaut wird

* **`fmtDate`, `fmtDay`, `weekday`** (`app.js:9`, `:17`, `:20`) lesen
  `LOCALE` statt `'de-DE'`. `today()` (`:28`, `'sv-SE'`) **bleibt** — ein
  Trick für `JJJJ-MM-TT`, kein Datum für Menschen.
* **Ein Helfer `zahl(n, stellen)`** über `Intl.NumberFormat(LOCALE)` ersetzt
  die elf `.replace('.', ',')` in `app.js`; im Server dasselbe für `zahl()`
  (`server.js:2247`). **Mit `useGrouping: false`** — sonst stünde in „1.234"
  plötzlich ein Punkt, und der Augenschein wäre nicht mehr derselbe.
* **`localeCompare(…, 'de')`** (`:1419`, `:2412`, `:2571`) liest `LOCALE`;
  die drei ohne Locale bekommen eine, **wo sie Sprache vergleichen** — der
  Vergleich zweier ISO-Zeitstempel (`:2401`) bleibt ohne.
* **`toLowerCase()`** wird `toLocaleLowerCase(LOCALE)` **nur dort, wo Sprache
  verglichen wird** — Suche und Sortierung. *MIME-Typen (`formatAusMime`,
  `server.js:329`), Schlüssel und Adressen bleiben `toLowerCase()`; wer die
  anfasst, hat T3 aus dem Konzept falsch verstanden.*
* **`document.documentElement.lang`** setzt `boot()` aus `SPRACHE`. Das
  Attribut in `index.html` bleibt `de`.

### 4.2 Was dabei nicht verhandelbar ist

* **Für `de-DE` liefert jeder Helfer Zeichen für Zeichen, was er heute
  liefert.** Der Prüfstand hält es an je drei Werten je Helfer fest —
  gegen den heutigen Ausdruck, nicht gegen eine neue Erwartung.
* **`gewichtAusText`** (`:1503`) nimmt weiter `1,2` und `1.2`.

---

## Bauabschnitt 5 — der Prüfstand, die Rückbauten, die Reste

### 5.1 Was gebaut wird

**Die sieben Wächter aus dem Konzept, Abschnitt 9**, jeder mit seiner
Gegenprobe in `gegenprobe.js`:

| Wächter | hält fest |
|---|---|
| **Deckungsprobe** | jede Datei unter `public/sprachen/` hat exakt die Schlüssel von `de.json` (ohne `_hinweis`, mit `_locale`). *In dieser Runde prüft sie eine Datei gegen sich selbst — sie wird jetzt gebaut, damit Stufe 2 sie vorfindet* |
| **Verwendungsprobe** | jeder Schlüssel aus `de.json` wird im Code gerufen (`t('…'`, `tH('…'`, `t(sprache, '…'`, `new Meldung('…'`); jeder gerufene existiert |
| **Platzhalterprobe** | je Schlüssel dieselbe Menge `{…}` in jeder Datei; Vokabelplatzhalter nur aus den vierzehn Namen |
| **Mehrzahlprobe** | jedes Objekt trägt `eins` und `andere`; im Code steht kein `=== 1 ?` mehr, das zwei Strings wählt |
| **Restprobe** | der Tokenizer findet in `app.js` **weniger als 60** lesbare Texte, und sie stehen **namentlich** in einer Liste im Prüfstand — Zeichen, Bezeichner, der eine Satz aus 1.1. *Die Schwelle ist ein Vorschlag des Konzepts; die Zahl, die beim Bauen herauskommt, wird festgenagelt* |
| **Rückfallprobe** | kein `⟦` im DOM irgendeiner Ansicht — der jsdom-Durchgang über Anmeldung, Liste, Eintrag, Einstellungen (`sysDurchgang`) sucht das Zeichen |
| **Formatprobe** | `_locale` steht in jeder Datei und `Intl.DateTimeFormat.supportedLocalesOf` kennt sie; `fmtDate`, `zahl` und `weekday` liefern für `de-DE` den heutigen Ausdruck |

**Dazu, im Bestand:**

* **Der jsdom-Rahmen** (`baueDom`, `w.fetch` ab `pruefung.js:23523`) liefert
  `/sprachen/de.json` **aus der echten Datei** — die 312 Zusicherungen mit
  deutschem Text bleiben, wie sie sind, und laufen weiter auf Deutsch.
* **Die 28 Rückbauten**, deren `suche` einen deutschen Satz im Quelltext
  trifft, suchen ihn in `public/sprachen/de.json` — **mitgezogen, nicht
  gelöscht** (Stolperstein 201). *`gegenprobe.js` kopiert über `git archive
  HEAD`: die Datei muss eingecheckt sein, bevor ein Rückbau sie sieht.*
* **Die Dateilisten der Wächter über ausgelieferte Dateien** bekommen
  `public/sprachen/de.json` dazu, wo sie Text lesen — der Wächter gegen den
  alten Namen (`GEPRUEFT`, `pruefung.js:668`) zuerst. **`COOKIE_DATEIEN` (7)
  und `SPRACH_QUELLEN` (13) ändern sich nicht** — es kommt keine
  Quelltextdatei dazu; `t()` lebt in `app.js` und `server.js`.
* **Die Zahlen, die festgenagelt werden:** Sprachdateien = **1**; Reste in
  `app.js` **< 60** (die gemessene Zahl daneben); Schlüssel in `de.json`
  (die gemessene Zahl); `PERSOENLICHE_SCHLUESSEL` = **10, unverändert**;
  die Felder von `/api/config` = **5, unverändert**; `F_ROUTEN` = **70,
  unverändert**.

### 5.2 Was dabei nicht verhandelbar ist

* **Keine Prüfung wird gelöscht, weil sie deutschen Text sucht.** Sie sucht
  ihn danach an der richtigen Stelle.
* **Jede neue Prüfung hat ihre Gegenprobe, und die wird gefahren** — eine
  stumme Gegenprobe ist ein Fund (Abschnitt 12 des Projektstands).

---

## Die Entscheidungen

**Die des Konzepts, die diese Runde trägt** — sie stehen dort in Abschnitt 10
mit Begründung; hier nur, welche greifen:

| # | | in dieser Runde |
|---|---|---|
| **E1** | JSON, ISO-639-1, `public/sprachen/de.json` | **ja** |
| **E2** | deutsche Schlüssel nach der Sache, benannte Platzhalter | **ja** |
| **E3** | Mehrzahl als Objekt, `Intl.PluralRules`, der ganze Satz wechselt | **ja** |
| **E4** | keine Bibliothek — `t()`/`tH()` in vierzig Zeilen, beide Seiten | **ja** |
| **E9** | Vokabelvorgaben in der Sprachdatei | **ja, die Vorgaben — aber das Vokabular folgt der Installation, nicht dem Benutzer (F3)**; das Objekt je Sprache aus dem Konzept kommt nicht |
| **E10** | `_locale` im Kopf, `Intl` statt `replace`, `toLocaleLowerCase` | **ja** |
| **E11** | was nicht übersetzt wird | **ja** |
| E5 bis E8 | Wahl, Anmeldeseite, Serverquellen, Mails je Empfänger | **nein — Stufe 2**; `spracheVon(req)` liefert `de` |
| E12 | die Nummern der Stufen | **vom Betreiber entschieden: Stufe 1 allein, als 0.24.0** — siehe den Kasten am Kopf; Stufe 2 und 3 offen |
| E13, E14 | Englisch, Leser | **nein — Stufe 2 und 3** |

**Zwei zu den Befunden aus Bauabschnitt 0 — offen, bis der Betreiber sie am
Wirt bestätigt (sie sind F7 und F8 der Fragen am Kopf):**

| # | Frage | Empfehlung |
|---|---|---|
| **B1** | Die Werte der Zeitleiste im hellen Schema? | **`#b9c2cb` · `#9aa5b0` · `--muted`** (1,54 · 2,13 · 4,62 gegen `--bg`) — am Wirt mit echten Punkten bestätigen; das dunkle Schema bleibt (0.1) |
| **B2** | Wo sitzt der Umschalter der Tagzeile, und wie heißt er? | **Rechts in der Kategoriezeile, „Tags" mit Zahl** — der Vorschlag des Betreibers, geschärft nach S1; Alternative: die Beschriftung der Tagzeile als Umschalter (0.2). Am gebauten Stand entscheiden |

**Und drei, die erst beim Schreiben dieses Auftrags aufgekommen sind:**

| # | Frage | Entscheidung |
|---|---|---|
| **A1** | Was passiert, wenn `de.json` im Browser nicht lädt? | **Ein fester Satz, und `boot()` hält an.** Der eine erlaubte Text im Code (1.1) |
| **A2** | Text in Attributen? | **Der ganze Text maskiert: `esc(t())`** — wegen des geraden Anführungsstrichs am Zitatende (1.2) |
| **A3** | `Intl.NumberFormat` gruppiert Tausender | **`useGrouping: false`** — der Augenschein bleibt (4.1) |

**Keine davon ist beim Bauen noch offen.** Wer eine aufmacht, macht sie im
Konzept auf und nicht im Quelltext.

---

## Was ausdrücklich NICHT gebaut wird

* **Keine zweite Sprache und keine Wahl.** Kein Schlüssel `sprache`, keine
  Pille in „Darstellung", keine Zeile unter der Anmeldemaske, kein
  `Accept-Language`, kein sechstes Feld in `/api/config`. *Alles Stufe 2.*
* **Kein Wort anders.** Weder verbessert noch gekürzt noch vereinheitlicht.
  *Wer beim Umzug einen Text ändert, hat den Auftrag verlassen — und die
  Abnahme (dasselbe Wort an derselben Stelle) gleich mit.* **Die eine
  Ausnahme ist Bauabschnitt 0:** „Weitere Filter" wird „Tags" — vor dem
  Umzug, als eigener Commit, mit den Prüfungen, die mitziehen.
* **Kein `_hinweis`** — Übersetzerhinweise kommen mit der ersten Übersetzung,
  nicht vorher.
* **Keine Übersetzung von Kommentaren, Papieren, Konsole, Werkzeugen,
  Prüfstand.** Die Sprache des Projekts bleibt Deutsch.
* **Keine Bibliothek, keine neue Route, kein Schema, kein Bestandslauf, kein
  Migrationsblock, keine neue Quelltextdatei.**
* **Kein Umbau der Karte „Vokabular"** außer der Herkunft der Vorgabe.
* **Keine Änderung an `style.css` außer den Zeilen aus Bauabschnitt 0;
  `index.html` und `thema.js` bleiben unberührt.** *Ein Text ist kein Stil.*
* **Keine weiteren Befunde am hellen Schema „nebenbei".** Was beim Bauen
  auffällt, kommt ins Änderungsprotokoll und ins Sammelblatt — nicht in
  diesen Auftrag.

---

## Der Prüfstand — was er halten muss

0. **Bauabschnitt 0:** die drei Paarungen der Zeitleiste gegen `--bg` hell
   gerechnet über der Latte, die dunklen Werte unverändert; der Umschalter der
   Tagzeile in der Kategoriezeile mit „Tags" und `aria-expanded`, die Tagzeile
   zugeklappt weg und aufgeklappt da, mit greifendem Tagfilter offen.
1. **`de.json` liegt unter `public/sprachen/`, trägt `_locale: "de-DE"`, und
   jeder Wert ist ein String oder ein Objekt `{ eins, andere }`.** Kein Wert
   trägt `<` oder `>`.
2. **Der Tokenizer findet in `app.js` weniger als 60 lesbare Texte, und die
   Liste steht namentlich da** (Restprobe).
3. **Null Literale hinter `error:` in `server.js` und `auth.js`; null deutsche
   Sätze in `throw new Error` in `auth.js`; null Literale in den vier
   Briefen und Betreffzeilen.**
4. **Deckungs-, Verwendungs-, Platzhalter-, Mehrzahl-, Rückfall- und
   Formatprobe grün — und ihre Gegenproben rot.**
5. **`BILDSCHIRM_VERBOT` läuft über `de.json` und findet nichts.**
6. **Die Format-Helfer liefern für `de-DE` den heutigen Ausdruck** — je drei
   Werte je Helfer gegen den Stand `92f7a142`.
7. **Eine `Meldung` aus `auth.js` kommt als `error` mit Satz und Status
   heraus** — an einem Zugang, einer Anmeldung, einem zweiten Faktor.
8. **`PERSOENLICHE_SCHLUESSEL` = 10, `/api/config` = 5 Felder, `F_ROUTEN` =
   70** — unverändert, und der Prüfstand sagt es weiter.
9. **Der Fingerprint deckt `public/sprachen/de.json` ab** — eine Änderung
   an der Datei ändert ihn (die Prüfung ab `pruefung.js:890` bekommt den
   Fall dazu).
10. **Kein `⟦` in irgendeinem DOM des jsdom-Durchgangs.**
11. **`npm test` grün, und jede der neuen Prüfungen hat ihre Gegenprobe in
    `gegenprobe.js` gefahren.**

---

## Bauregeln

* **Zuerst die acht Fragen am Kopf** — gestellt, beantwortet, eingetragen.
  *Ein Bauabschnitt, der vor der Antwort anfängt, baut gegen eine Vermutung.*
* **Die sechs Bauabschnitte in dieser Reihenfolge, 0 bis 5**, und jeder ein
  eigener Commit („0.24.0 Bauabschnitt n: …"), mit grünem Prüfstand.
  **Abschnitt 0 ist eingecheckt und am Wirt gesehen, bevor Abschnitt 1
  anfängt** — sein Stand ist der Vergleichsstand für „nichts sieht anders
  aus". **Abschnitt 1 ist fertig, bevor der erste Satz umzieht.**
* **Innerhalb von Abschnitt 3 je Ansicht ein Commit** — ein halb umgezogener
  Stand ist erlaubt, solange der Prüfstand grün ist und die Ansicht am Wirt
  dieselbe; **eine halb umgezogene Ansicht nicht.**
* **Wer einen Text findet, den das Konzept nicht zählt, trägt ihn nach** —
  in das Konzept (Abschnitt 2) und in das Änderungsprotokoll, mit Zahl. *Die
  Zahlen sind gezählt, nicht geschätzt; eine mehr ist ein Fund und kein
  Fehler (Stolperstein 137).*
* **Kein Wort anders.** Die Regel steht dreimal in diesem Auftrag, weil sie
  die Abnahme ist.
* **Deutsch in Kommentar und Oberfläche** (S1 bis S7, Abschnitt 12 des
  Projektstands); die Gestaltungsregeln G1 bis G12 gelten unverändert.
* **Erst nachstellen, dann behaupten** — `Intl.PluralRules('de-DE').select(0)`
  ist `other`, nicht `one`; wer das nicht weiß, schreibt „0 Kommentar".

---

## Die Dokumente

* **`Doku/Konzept_Mehrsprachigkeit_0_24_0.md`** — steht; beim Bauen nur
  ergänzt (Funde nach den Bauregeln, die gemessenen Zahlen), nicht
  umgeschrieben. **E12 trägt seit dem 5. September 2026 die Entscheidung des
  Betreibers.**
* **`Doku/Aenderungsprotokoll_0.24.0.md`** — neu, am Ende: was wirklich
  umgezogen ist, mit den Zahlen, die herauskamen; was auf der Restliste steht
  und warum; welche Texte beim Umzug als Fund aufgefallen sind, ohne geändert
  zu werden — **und die beiden Befunde aus Bauabschnitt 0**, mit dem, was am
  Wirt nachgestellt wurde, und den bestätigten Werten.
* **`Doku/Farbkonzept_0_23_0.md`** — ein Nachtrag an Abschnitt 4.1: die
  Paarungen der Zeitleiste gegen den Grund, gemessen, mit den Werten aus B1.
  *Das Papier wird nicht umgeschrieben; die Lücke wird benannt.*
* **`Doku/Fehler_und_Ideen.md`** — die Wegweisertafel bekommt am Ende die
  Zeile zu 0.24.0 mit dem Vermerk, dass die beiden Befunde **nie** dort
  standen (wie bei 0.21.1 und 0.22.1).
* **`CHANGELOG.md`** — der Eintrag zur Version. **Kein Kasten darüber:** ein
  Betreiber hat nichts zu tun, und er sieht nichts.
* **`Doku/Projektstand_…`** — `git mv` auf die Nummer; Kopf, Betriebsstand,
  Abschnitt 8 (die Zahlen des Prüfstands), der Fahrplan (Stufe 1 gebaut),
  Abschnitt 10a (der Wegweiser bleibt, Stufe 1 als gebaut vermerkt),
  Versionsgeschichte. **Dazu eine Sprachregel S8 in Abschnitt 5.6:** *Text ist
  Daten — kein Text der Oberfläche steht im Quelltext; wer einen braucht,
  legt einen Schlüssel an.* Der Prüfstand hält sie (Restprobe).
* **`README.md`** — nur, wenn ein Betreiber etwas Neues sieht. *In dieser
  Runde: nichts.* Ein Satz zum Ordner `public/sprachen/` gehört dorthin,
  sobald Stufe 2 die Wahl bringt.
* **`package.json`** — `0.24.0`.
* **Dieser Auftrag fällt mit dem nächsten weg** — es liegt immer nur einer
  im Repo.

---

## Was danach offen bleibt

* **Stufe 2 — Englisch.** Die Wahl je Zugang, die Vorgabe der Installation,
  die Zeile unter der Anmeldemaske, `spracheVon(req)` mit seinen drei
  Quellen, die Mails je Empfänger, `_hinweis` — und das englische
  Wörterbuch, beschlossen vor der ersten Zeile (Konzept, S2.1). *Ob das
  Vokabular dann je Sprache Vorgaben braucht, hängt an F3: folgt es der
  Installation, braucht es keine.*
* **Stufe 3 — Türkisch.**
* **Die Liste der Texte, die beim Umzug aufgefallen sind** — ein Satz, der
  gegen S1 verstößt, ein Wort, das zweimal vorkommt, ein Tooltip über acht
  Wörtern. **Sie werden in dieser Runde nicht geändert**; sie stehen im
  Änderungsprotokoll und gehen ins Sammelblatt, wenn sie eine Runde
  brauchen.
* **Die Ladezeit der Sprachdatei** — gemessen am Wirt, nicht geschätzt
  (Konzept, Abschnitt 11). *Wenn sie stört, ist sie ein Befund für Stufe 2
  und keine Überraschung.*
* **Die Nummern von Stufe 2 und 3** — am Auftrag zu Stufe 2 zu entscheiden:
  die nächste freie MINOR-Zahl (heute 0.25.0) oder eine PATCH-Zahl hinter
  0.24.0. *Eine zweite Sprache bringt eine Funktion; Abschnitt 5.1 sagt dazu
  MINOR.*
