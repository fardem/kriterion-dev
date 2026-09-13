# Änderungsprotokoll 0.31.1 — „Deutsch sitzt"

**Auftrag 0.31.1 · 13. September 2026 · gebaut auf 0.31.0 · PATCH, kein
Schemaanteil.**

> **FINGERPRINT DIESER RUNDE: `FINGERPRINT_0311`** — gerechnet am gebauten
> Stand, **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** | **`FINGERPRINT_0311`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`FINGERPRINT_0311`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus* |

---

## Die Runde ist bestellt worden, nachdem sie schon gemessen war

**DER BETREIBER HAT 0.31.0 AM LAUFENDEN SERVER ANGESEHEN** und gesagt: *„gehe
die deutsche sprache sorgfältig durch und mach kein schnellschuss. deutsch muss
sitzen. von dem aus gehen wir in die anderen sprachen."*

**DARAUF SIND ALLE 1254 SCHLÜSSEL GELESEN WORDEN**, jeder gegen seine
Aufrufstelle. *Der Befund: zweihundertelf Bruchstücke in hundertdreißig Zeilen —
Schlüssel, die kein Text sind, sondern eine Naht.*

```
  ${t('card.keyFromSetting')} <code>${name}</code>${t('card.theDot')} …
```

**IM DEUTSCHEN GEHT DAS AUF. IM TÜRKISCHEN NICHT.** *Das hat 0.25.4 einmal
teuer gelernt: dort verneint ein Suffix im Verb und kein eigenes Wörtchen davor,
und aus drei sauber übersetzten Stücken wurde „Bağlantın bundan değil etkilendi"
— kein Satz, sondern Kauderwelsch, und er stand seit 0.24.3 im Programm.*

---

## Die tragende Leitplanke, und sie ist bewiesen

> **DER WORTLAUT ÄNDERT SICH NICHT.** *Was am Bildschirm steht, steht danach
> Zeichen für Zeichen genauso da — in allen drei Sprachen.* **Die Runde fasst
> die ABLAGE der Sätze an, nicht ihren Text.**

**OHNE BEWEIS WÄRE DAS GESCHWÄTZ**, und darum ist das erste Stück dieser Runde
kein Satz, sondern ein Werkzeug.

### `tools/gleichlaut.js` — die Gleichlautprobe

**SIE LIEST DEN GANZEN QUELLTEXT, ersetzt jeden Textruf durch seinen Wert und
rechnet je Sprache zwei Prüfsummen** *(Einzahl und Mehrzahl getrennt — stellte
sie eine Mehrzahl als `{eins|andere}` dar, wäre sie für genau den Handgriff
dieser Runde blind)*. **Sie hängt an keiner Zeilennummer: verschmelzen drei
Schlüssel zu einem, kommt dieselbe Summe heraus.**

| sie wirft weg | warum |
|---|---|
| **Kommentare** | ein neuer Absatz Erklärung ist kein Bildschirmtext |
| **die Helfer selbst** | wer `tMark()` umbaut, ändert nicht, was dasteht |
| **Markup** | **ersatzlos, nicht auf ein Leerzeichen** — ein `</strong>` trennt im Browser keine Wörter |
| **Vorlagenklammern** | drei Rufe nebeneinander tragen drei `${ }`, ein verschmolzener nur eines |
| **Weißraum** | Form, kein Text |

**JEDER DIESER PUNKTE IST AN EINEM FEHLALARM GELERNT WORDEN**, und der erste war
der teuerste: *die Probe meldete einen Verlust am eigenen Kommentar.* **Eine
Probe, die falschen Alarm gibt, wird abgeschaltet — und dann fängt sie auch den
echten Verlust nicht mehr.**

> **UND SIE NENNT, WOFÜR SIE BLIND IST.** *Sie führt den Code nicht aus; sie
> BILDET NACH, was `tH()` und `tMark()` tun SOLLEN.* **Genau deshalb konnte sie
> nicht sehen, dass `tMark()` seine Werte an den Satz reichte, aber nicht an das
> hervorgehobene Wort** — *am Bildschirm stand „Die Zeilen werden nach **{n}**
> Tagen automatisch gelöscht", und diese Probe meldete sechs von sechs Summen
> gleich.* **Der Prüfstand hat es im ersten Lauf gefangen, weil er einen echten
> Server befragt statt einen Quelltext zu lesen.** *Ein Werkzeug, dem jemand mehr
> zutraut, als es kann, ist schlimmer als keines — darum steht der Satz in seinem
> eigenen Kopf.*

---

## Was gebaut ist

### Die beiden Helfer

```js
const tMark  = (key, wordKey, values) => …   // EIN Stück, und es ist ein Schlüssel
const tMarks = (key, parts, values)   => …   // MEHRERE Stücke, und sie sind Werte
```

**`tMark()` GIBT SEINE WERTE SEIT DIESER RUNDE AN BEIDE** — an den Satz UND an
das hervorgehobene Wort. *Der dritte Parameter ist neu und optional; alle Rufe
von 0.25.4 bis 0.31.0 bleiben unverändert gültig.*

**`tMarks()` IST GANZ NEU**, und zwar aus zwei Gründen in einem Werkzeug: *ein
Satz nennt drei Beispiele* (der Kriterien-Tipp hebt „Wunsch", „Nutzen" und
„Machbarkeit" hervor — bis hierher der Grund, ihn in SECHS Schlüssel zu zersägen,
von denen einer `(Gewicht 1,5),` hieß), *und an siebenundzwanzig Stellen ist das
Stück kein Schlüssel, sondern ein Wert* — ein Benutzername, eine Zahl, ein
Mehrzahlsatz mit eigenem Argument.

**DIE AUSZEICHNUNG LÄUFT NIE DURCH DEN MASKIERENDEN WEG.** *Beide gehen über ein
Steuerzeichen; wer hier einen Wert vom Benutzer einsetzen wollte, müsste die
Zeile ändern, und dann fällt es auf.*

### Die acht Bauabschnitte

| | was | Ergebnis |
|---|---|---|
| **BA 1** | **Das Muster von 0.25.4 auf die reinen Auszeichnungen** | **32 zersägte Sätze** werden ganze Sätze |
| **BA 2** | **Die Ketten** — Zeilen mit mehr als einer Hervorhebung | **6**, jede von Hand entworfen; der Titelsatz zerfällt in zwei |
| **BA 3** | **Die Bruchstücke ohne Auszeichnung** | **Satzzeichenanfänge, Füllwörter, offene Klammern** |
| **BA 4** | **Die beiden Schlüssel ohne Leser** | `entry.reportKind`, `dialog.sessionExpired` |
| **BA 5** | **Stolperstein 47** an vier Stellen | die vier Größen, die vierzehn Vorgabewörter, der Grabstein, die Exportgrenze |
| **BA 6** | **Die drei Befunde vom Augenschein und fünf Beschriftungen** | die einzigen Stellen, an denen sich TEXT ändert |
| **BA 7** | **Der Erklärbärsaft** | vier Karten, `card.resetMailHint` von 277 auf 199 Zeichen |
| **BA 8** | **Der Weißraum** | 92 Schlüssel verlieren die Einrückung des Quelltexts |

### Die Zahlen

| | vorher | nachher |
|---|---|---|
| **Schlüssel je Sprachdatei** | 1254 | **1197** |
| *davon gefallen* | | **101** *(Hälften, die jetzt in ihrem Satz stehen)* |
| *davon neu* | | **44** *(ein verschmolzener Satz bekommt oft einen neuen Namen)* |
| *davon anderer Wortlaut* | | **68** |
| **Bruchstücke** | 211 | **23 benannte**, und jedes ist eines mit Grund |

---

## Zwei Befunde, und beide sind älter als die Runde

**DEUTSCH STAND FEST IM QUELLTEXT — an zwei Stellen, und beide sind beim Bauen
von BA 3 aufgefallen.**

| Stelle | was in einer englischen Instanz dastand |
|---|---|
| **Die Tagwarnung** | *„The tag „Reise" is removed everywhere. Affected: 3 entries **und** 2 test days"* — das Bindewort stand fest zwischen zwei `t()`-Rufen |
| **Die Vorschaubildzeile** | *„Thumbnails renewed: 7 of 12 checked — 2,1 MB **weniger**."* — `d > 0 ? 'mehr' : 'weniger'` |

**JETZT TRÄGT JEDE SPRACHE DEN GANZEN SATZ**, und die Bindung mit ihm. *Der
Schlusspunkt gehört ebenfalls dem Satz statt der Zeile.* **Das sind die einzigen
beiden Stellen der Runde, an denen sich `en.json` und `tr.json` inhaltlich
ändern** — alles andere dort ist mechanisch verklebt.

> **UND EIN DRITTER, AUS BA 3 SELBST:** *der Importdialog lieh sich
> `card.withPhotos` vom Exportknopf.* **Dort lautet der Wert „Mit Fotos (~" —
> mit einer offenen Klammer, die der Quelltext am Knopf schließt.** *Im Dialog
> schloss sie niemand, und es stand „Die Datei enthält **12 Einträge Mit Fotos
> (~**, erstellt aus …".* **Das Gegenstück „ ohne Fotos" gab es längst als
> eigenen Schlüssel; jetzt gibt es beide.**

---

## Was die Wachen dieser Runde halten

| | Zusage | wie sie geprüft wird |
|---|---|---|
| **1** | **Die Gleichlautprobe liegt als Werkzeug daneben** | *und sie nennt ihre eigene Blindstelle* |
| **2** | **Kein Schlüssel ist mehr ein bloßes Bruchstück** | **drei Sorten, drei Zeilen** — Satzzeichenanfang, Füllwort, unpaarige Klammer |
| **3** | **Kein Programmablauf läuft durch die Sprachdatei** | kein `===` neben einem `t(`-Ruf — *das Muster, nicht die beiden Namen* |
| **4** | **Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge** | **1197**, und die Zahl steht an EINER Stelle |
| **5** | **Jeder `{word}` hat seinen Ruf, jeder Ruf seinen `{word}`** | beide Richtungen; die zweite ist die wichtigere |
| **6** | **Keine Vokabelbeschriftung nennt ihr eigenes Vorgabewort** | *sonst steht das Wort zweimal da — und das eine ist gerade das, was der Benutzer auswechselt* |
| **7** | **Keine Zahl steht zweimal** | die vier Größen kommen aus ihrem `value` |
| **8** | **Kein DEUTSCHER Wert trägt eine HTML-Entität** | *en/tr tragen sie noch — sie herauszunehmen hieße, ihre Sätze neu zu formulieren, und das ist 0.31.2 und 0.31.3* |
| **9** | **Kein Wert trägt die Einrückung des Quelltexts** | *in keiner der drei Dateien; ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist* |
| **10** | **Kein Eintrag der Umbenennungstafel zeigt auf einen Schlüssel DIESER Runde** | **33 umgehängt** |
| **11** | **Die Wortlautprobe ist vollständig nachgeführt** | drei Listen, und jede sagt, welche Runde was getan hat |

### Zusage 2 hieß zuerst etwas Gröberes

**„KEIN WERT FÄNGT MIT EINEM SATZZEICHEN AN" HÄTTE „— keine —" AUS EINER
AUSWAHLLISTE EINKASSIERT** und den Nachsatz eines Satzes gleich mit. *Sie sagt
jetzt, was sie meint, und die Ausnahmen stehen NAMENTLICH da:*

| Sorte | was sie ist | wie viele |
|---|---|---|
| **Anschlussstück** | füllt einen **benannten Platz** eines anderen Satzes. *Wo sein Trenner sitzt, entscheidet dann der SATZ und nicht der Quelltext* | **12** |
| **Eigenständige Beschriftung** | ein Bedienelement und kein Satzteil: *Eintrag einer Auswahlliste, Filterknopf, Zustandswort einer Kennzeile, Bindewort einer Aufzählung* | **11** |

**DAS ANSCHLUSSSTÜCK WIRD NACHGEPRÜFT UND NICHT GEGLAUBT:** *der Elternsatz muss
den Platz wirklich tragen, und der Ruf muss das Stück wirklich dort einsetzen.*
**Fällt der Platz weg, fällt die Ausnahme mit ihm.** *Und die Tafel ist in beide
Richtungen geschlossen — was nicht darin steht, ist ein Fund, und was darin steht
und keines mehr ist, fällt genauso auf.* **Eine Ausnahmeliste, die nur in eine
Richtung prüft, wächst.**

---

## Die Wortlautprobe — und was sie an sich selbst gefunden hat

**SIE HÄLT DIE DEUTSCHE DATEI GEGEN DEN STAND DER ABNAHME VON 0.24.0**
(`0681d42`), Satz für Satz. *Diese Runde hat ihr drei Listen hinzugefügt:*

| Liste | | warum eine EIGENE Liste |
|---|---|---|
| `WORDING_NEW_0311` | **44 Schlüssel** | *der Stand von damals kennt sie nicht* |
| `WORDING_GONE_TEXT_0311` | **98 Wortlaute** | *die Hälften; ihr Schlüssel ist gefallen, also steht ihr TEXT da und nicht ihr Name* |
| `WORDING_CHANGED_0311` | **68 Schlüssel** | *sie behalten ihren Namen und bekommen einen anderen Wortlaut* |

> **UND SIE HAT EINEN RECHENFEHLER IN SICH SELBST GEMELDET.** *Sie zog die
> Abzugslisten vom ROHEN Stand ab und zog erst danach den Weißraum zusammen — ein
> Satz, der in der Datei von damals eine Einrückung trug, ließ sich mit seinem
> zusammengezogenen Wortlaut nicht abziehen und blieb stumm stehen.* **Bei elf
> Einträgen fiel das nicht auf; bei achtundneunzig standen zweiunddreißig falsch
> da.** *Jetzt wird auf BEIDEN Seiten erst zusammengezogen und dann abgezogen.*

**UND ZUM ERSTEN MAL SIND IHRE BEIDEN ZAHLEN VERSCHIEDEN: 145 damals gegen 143
heute.** *„E-Mail ist optional." und „und" gab es in der Datei SCHON, unter einem
anderen Schlüssel — der neue Wortlaut ist kein neuer Satz, sondern ein ZWEITES
Vorkommen, und eine Liste mit `includes` kann das nicht sehen.* **Dasselbe ist
0.28.1 mit „Titel" passiert und 0.29.0 mit „Name"; dort glich ein Mehrzahlpaar
aus 0.25.4 die Rechnung auf der anderen Seite aus.** *Hier gleicht sie nichts
aus — und darum stehen zwei Zahlen da statt einer geschönten.*

> **DIE EIGENTLICHE ABNAHME IST DIE ZEILE DARUNTER:**
> **neunhundertvierundvierzig Sätze, Zeichen für Zeichen der Stand von
> `0681d42`** — *Sätze, die niemand angefasst hat.*

---

## Was beim Bauen schiefgegangen ist

**VIER FEHLER, UND JEDER IST VON EINER WACHE GEFANGEN WORDEN, BEVOR IHN JEMAND
GESEHEN HAT.** *Sie stehen hier, weil sie beim nächsten Mal wieder passieren.*

| | was | wer es gefangen hat |
|---|---|---|
| **1** | **BA 8 ZERSTÖRTE DIE VIER BRIEFE.** *Mein Weißraumschnitt nahm die `\n\n` der Absätze mit; jede Mail wäre als eine Wand Text angekommen* | **der Prüfstand** — *und MEIN EIGENER BEWEIS WAR SCHULD: ich hatte `app.js` und `server.js` auf weißraumtreue Stellen durchgesehen, aber die Briefe gehen durch `mail.js`* |
| **2** | **EIN NAMENSZUSAMMENSTOSS LÖSCHTE EINEN DIALOGTEXT.** *Der verschmolzenen Zustandszeile gab ich den Namen `card.twoFactorOffHint` — und den trug schon der Bestätigungsdialog* | **die Gleichlautprobe.** *Seither gilt: ein neuer Name darf nur dann schon dastehen, wenn er EINE DER BEIDEN HÄLFTEN ist* |
| **3** | **`tMark()` REICHTE SEINE WERTE NUR DEM SATZ.** *Am Bildschirm stand „nach **{n}** Tagen"* | **der Prüfstand, im ersten Lauf.** *Die Gleichlautprobe war blind dafür — sie bildet das GEMEINTE nach* |
| **4** | **ZWEIMAL HABE ICH DIE HAUSREGELN SELBST GEBROCHEN:** *deutsche Bezeichner in `tMarks()` (`marken/namen/satz/stuecke`) und das verbotene Wort „tragen" in `card.nameFreedHint`* | **der Englischwächter und der Sprachwächter** *(Auflage 3)* |
| **5** | **STOLPERSTEIN 47 RICHTIG GESEHEN, FALSCH GEBAUT.** *Die Schlüsselzahl stand an zwei Stellen; ich habe sie zu EINER Konstante zusammengezogen — und sie in die eine der beiden Gruppen gelegt.* **`check0311()` ist eine eigene Funktion: der ganze Lauf riss mit „LANG_KEY_COUNT is not defined" ab**, und ein abgerissener Lauf belegt nichts *(Stolpersteine 138, 161 und 170)* | **vier Gegenproben zugleich**, jede als `ABGERISSEN`. *Genau dafür ist diese Meldung da — sie unterscheidet „die Zusage hat gehalten" von „es hat gar nichts stattgefunden"* |

> **UND EINE BERICHTIGUNG MEINER EIGENEN AUSKUNFT AN DEN BETREIBER.** *Ich hatte
> gesagt, „Note" und „Bewertung" seien dasselbe.* **Das stimmt nicht:
> `test_days.rating` ist EINE Zahl je Testtag, `ratings.value` eine je Kriterium.
> Zwei Tabellen.** *Die Berichtigung steht im Fahrplan, damit sie nicht
> wiederkommt.*

---

## Ein Fund, der nicht in dieser Runde repariert wird

**NEUNUNDDREISSIG EINTRÄGE DER UMBENENNUNGSTAFEL ZEIGTEN SCHON VOR DIESER RUNDE
INS LEERE** *(`tools/keys.json`, aus 0.24 bis 0.30 — darunter `login.not`,
`list.sortAvgDesc` und die vierzehn deutschen Vokabelnamen)*. **Sie bleiben
stehen und sind gezählt.** *Einen Nachfolger zu raten wäre schlimmer als die
Lücke: die Tafel übersetzt den alten deutschen Namen, und ein falsches Ziel
schickt den Rufer an die falsche Zeile.* **Die dreiunddreißig, die DIESE Runde
gebrochen hat, zeigen wieder auf ihren Nachfolger.**

---

## Was diese Runde NICHT gebaut hat

| | |
|---|---|
| **Kein englischer und kein türkischer Satz ist neu formuliert** | *ihre Hälften sind MECHANISCH verklebt, in genau der Reihenfolge, in der der Quelltext sie verklebt hat. Ausnahme sind die zwei Stellen, an denen Deutsch im Quelltext stand* |
| **„Note" bleibt stehen** | *sie wird in **0.32.0** das fünfzehnte Vokabelwort — kein Schema, keine Migration, kein Formatwechsel, aber zwölf Zusagen halten die Zahl vierzehn fest* |
| **Keine Anordnung ist angefasst** | *diese Runde fasst Sätze an, keine Oberfläche* |
| **Kein Schemaanteil** | *Austauschformat bleibt 16, `F_ROUTES` bleibt 73* |

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.**

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.31.1.md`** | sechs Leitplanken, zwölf Fragen, acht Bauabschnitte, elf Zusagen |
| **`Doku/Aenderungsprotokoll_0.31.1.md`** | dieses Papier |
| **`Doku/Projektstand_Kriterion_0_31_1.md`** | `git mv`, **Revision 88** |
| **`Doku/Fahrplan.md`** | die Zeile 0.31.1 durchgestrichen; **die geplanten Runden rücken nicht** |
| **`Doku/Fehler_und_Ideen.md`** | Punkt 24 nachgezogen |
| **`tools/gleichlaut.js`** | **neu** — das Werkzeug dieser Runde |
| **`CHANGELOG.md`** | ein Eintrag 0.31.1 |
| **`package.json`, `package-lock.json`** | 0.31.1 |
