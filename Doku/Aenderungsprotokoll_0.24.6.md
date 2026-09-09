# Änderungsprotokoll 0.24.6 — „Der Rückfall sagt, welche Sprache er wirklich zeigt"

**Eine Reparatur an drei Verwaltungskarten · 9. September 2026 · gebaut auf
0.24.5 (`aa85a6ed`).**

**0.24.5 hat die Sprachpille über den drei Verwaltungskarten repariert, und der
Betreiber hat sie am 9. September 2026 am laufenden Programm abgenommen:
„ja es funktioniert."** *Mit einem Nachtrag, und der war ein eigener Befund:*
**sobald für eine Zeile weder die gezeigte noch die Vorgabesprache einen Eintrag
hat, zeigte die Karte den Namen einer dritten Sprache — und behauptete im
Vermerk, es sei die Vorgabesprache.** „Kein Eintrag" stimmte; die genannte
Sprache nicht.

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„Geht es als fallback auf
> deutsch (besser wäre englisch da es ja existiert) aber zeigt an das kein
> eintrag gibt (stimmt) aber sagt das es turkisch (stimmt nicht) anzeigt. Das
> betrifft alle Kacheln dieser drei wofür es keine Eingabe gab. Wenn für alle
> Sprachen Eingaben gab, funktioniert es auch gut."*

**Die Lage, in der es auffällt:** die Vorgabesprache der Installation wird auf
eine Sprache gestellt, **für die es noch nicht überall Einträge gibt** — hier
von Deutsch auf Türkisch. *Deutsch und Englisch sind gepflegt, Türkisch noch
nicht.*

> **UND DIE KARTE MIT DEN GEPFLEGTEN ZEILEN TAT ES RICHTIG.** *Vom Betreiber
> ausdrücklich nachgetragen, mit Bild belegt:* wo für alle drei Sprachen etwas
> eingetragen war, stimmte jede Zelle. **Die richtige Zeile zeigte damit, wo
> die falsche herkam** — und sie steht in dieser Runde als Vergleichszeile im
> Prüfstand.

---

## Die Versionsnummer

**0.24.6 ist ein PATCH-Sprung, und die Runde repariert.** Gewöhnliches SemVer;
die benannte Abweichung von Regel 5.1 ist mit 0.24.4 zu Ende und wird hier
nicht wieder geöffnet.

**Der Funktionswunsch „Potenzial abschaltbar" gehört ausdrücklich NICHT in
diese Runde** — er ist eine Funktion, braucht nach Regel 5.1 eine MINOR-Nummer
und steht im Fahrplan unter 0.25.0. *Der Betreiber hat es am 9. September 2026
so entschieden (F1).*

---

## Die sechs Fragen — vor der ersten Zeile beantwortet

**Zweite Runde unter der Regel aus Abschnitt 11 des Projektstands**, und wieder
ist keine Zeile gefallen, bevor alle sechs beantwortet waren.

| # | Frage | Antwort des Betreibers |
|---|---|---|
| **F1** | Nummer 0.24.6, und nur Reparatur? | **ja, 0.24.6, nur Reparatur** — wie vorgeschlagen; der Potenzialschalter bleibt in 0.25.0 |
| **F2** | Wie lautet die Rückfallkette? | **erste Sprache mit Eintrag** — eingetragen → Vorgabesprache → erste Sprache des Vorrats, die wirklich etwas trägt, in kanonischer Reihenfolge; **und der Vermerk nennt die Sprache, die WIRKLICH dasteht** |
| **F3** | Was ist die Grundzeile nach einem Wechsel der Vorgabesprache? | **kennzeichnen statt behaupten** — an der Ablage ändert sich nichts, aber die Karte behauptet es nicht mehr. **Keine Datenbankstufe** |
| **F4** | Ziehen die Namenstafeln nach? | **ja, aus derselben Antwort** — `PUT /api/settings` trägt sie, `sendLanguages()` nimmt sie an. Kein zweiter Abruf |
| **F5** | Wie weit geht der Prüfstand? | **neun Zellen der zweiten Achse plus die Messung am laufenden Server** |
| **F6** | Augenschein? | **ja, zwei Bilder** — dieselbe Karte vor und nach dem Wechsel der Vorgabesprache |

**Alle sechs sind nach dem Vorschlag ausgefallen.** *Das ist keine
Selbstverständlichkeit und war es in 0.24.5 auch nicht: dort hat F3 eine Frage
beantwortet, die im Papier gar nicht stand.*

---

## Was ein Mensch davon sieht

**Vorher:** Karte „Kategorien", Pille **Türkçe**, drei Zeilen — unter jedem
Namen steht *„(nicht eingetragen — es steht Türkçe)"*, während der Name selbst
deutsch ist (`1_Datenträger_de`, `KI_de`, `Product_de`). Dasselbe an beiden
Kriterienkarten.

**Nachher:**

* **Der Vermerk nennt die Sprache, deren Name wirklich dasteht.** Ist für die
  Vorgabesprache nichts eingetragen, wird die nächste Sprache des Vorrats
  genommen, die etwas trägt — *„besser wäre Englisch, da es ja existiert"*, und
  der Vermerk sagt „English".
* **Trägt keine einzige Sprache etwas, nennt der Vermerk keine.** Er sagt nur
  noch *„(nicht eingetragen)"*. Eine genannte Sprache, die nicht stimmt, ist
  schlimmer als keine.
* **Unter der Sprachzeile steht ein Hinweis, sobald die Vorgabesprache gezeigt
  wird:** was dort steht, ist der Name der Grundzeile — gleichgültig, in
  welcher Sprache er eingetragen wurde.
* **Nach einem Wechsel der Vorgabesprache stimmen die drei Karten sofort**,
  ohne Neuladen.
* **Das Gewicht eines Kriteriums zu ändern benennt nichts mehr um** — das ist
  der Befund, den der Auftrag nicht kannte.

---

## Der Befund — drei Teile, und sie hängen zusammen

### E1 · Die Tafel folgt der Vorgabesprache, die Ablage nicht

**Gemessen am laufenden Server**, 9. September 2026. Eine Kategorie mit dem
Namen `Product_en` in der Grundzeile und `Product_de` als deutscher
Übersetzung; die Vorgabe der Installation ist `en`:

```
VORHER  (Vorgabe en):  {"de":{"1":"Product_de"},"en":{"1":"Product_en"},"tr":{}}
NACHHER (Vorgabe tr):  {"de":{"1":"Product_de"},"en":{},              "tr":{"1":"Product_en"}}
```

***Türkisch trägt danach einen Eintrag, den nie jemand auf Türkisch eingegeben
hat, und Englisch steht leer da, obwohl der Name dort steht.***

**Der Grund ist kein Fehler von 0.24.5, sondern die Bauform von 0.24.3:** die
Grundzeile trägt keinen Sprachvermerk, und `baseLanguage()` schreibt sie
derjenigen Sprache zu, die *gerade* Vorgabe ist. **Neu ist nur, dass man es
jetzt sieht** — bis 0.24.4 hat niemand die Tafel je zu Gesicht bekommen.

### E2 · Der Vermerk nannte die Sprache, die er zeigen wollte

Am Quelltext ablesbar, `namesFrom()` in `public/app.js`, Stand 0.24.5:

```js
const back = fallback[z.id];
return { ...z, name: back !== undefined ? back : z.name, nameFallback: base };
```

**War auch für die Vorgabesprache nichts eingetragen, fiel der NAME auf
`z.name` zurück** — die Antwort des Servers in der Sprache des **Lesers** —
**und der VERMERK sagte trotzdem `base`.** *Zwei Angaben in derselben Zeile,
aus zwei verschiedenen Quellen, und sie widersprachen sich.*

### E3 · Die Tafel wurde nach einem Wechsel der Vorgabesprache nicht nachgezogen

`sendLanguages()` nahm `LANGUAGES` aus der Antwort an und zeichnete neu —
**`NAMES_ALL` blieb, wie es war.** Danach rechnete die Karte mit der **neuen**
Vorgabesprache auf der **alten** Tafel, und in dieser Lage ist E2 nicht die
Ausnahme, sondern der Normalfall.

> **DAS IST DERSELBE FEHLERTYP WIE D2 DER RUNDE 0.24.5** — ein Zustand im
> Browser, den jemand nachziehen muss, und eine Stelle, an der es niemand tut.
> *0.24.5 hat den Zwischenspeicher abgeschafft und die Tafel an zwei Stellen
> nachgezogen (Start und `adminNew`). **Die dritte Stelle war übersehen
> worden.*** Diese Runde zieht sie nach.

---

## Bauabschnitt 1 — die zweite Achse, nachgestellt

**Die Tafel von 0.24.5 hatte eine Achse: die Sprache des Lesers × die Pille.
Sie bekommt eine zweite — die Vorgabesprache.**

**Gewechselt wird in der Karte und nicht im Aufbau**, und das ist der Punkt:
die drei Vorgabesprachen werden erreicht, wie der Betreiber sie erreicht hat —
mit dem Knopf **„Standard"** in der Karte „Sprachen", im laufenden Programm.
*Eine Prüflage, die jede Vorgabesprache frisch aufsetzt, sähe E3 nie: er hängt
daran, dass `NAMES_ALL` nach dem Wechsel stehenbleibt, während `LANGUAGES`
nachzieht.*

**Der Bestand:** eine Zeile **ohne jede Übersetzung** — sie steht nur in der
Grundzeile — und eine, die in **allen drei Sprachen** gepflegt ist. Die zweite
ist die Vergleichszeile des Betreibers. *Ohne sie belegte die Tafel die Hälfte
nicht: eine Prüflage, die überall rot ist, hat womöglich nur den Prüfstand
falsch aufgesetzt.*

**Gemessen am fertigen Prüfstand gegen den Stand von 0.24.5: siebzehn der
neunundvierzig Zusagen sind rot**, und **fünf der neun Zellen** sind darunter —
(Deutsch, Deutsch), (English, Deutsch), (English, English), (Türkçe, Deutsch)
und (Türkçe, Türkçe). *Die Zelle „Vorgabe Türkçe, Pille Türkçe" zeigte dabei
genau das Bild aus dem Feld:*

```
steht: {"name":"Grundname","mark":"(nicht eingetragen — es steht Türkçe)"}
soll:  Name "Grundname", Vermerk (keiner)
```

> **VIER DER NEUN ZELLEN WAREN VON ANFANG AN GRÜN, und das ist kein Mangel,
> sondern der Maßstab.** *Der Betreiber hat es selbst gesagt: „Wenn für alle
> Sprachen Eingaben gab, funktioniert es auch gut."* **Eine Tafel, die überall
> rot ist, hat womöglich nur den Prüfstand falsch aufgesetzt; eine, die genau
> dort rot ist, wo der Befund es sagt, misst die Sache.**

**Dazu vier eigene Prüflagen für die Kette:** der dritte Schritt, die Klammer
ohne Sprachnamen, die kanonische Reihenfolge und die Klemme gegen den Vorrat.
Alle vier waren rot.

> **EIN BEFUND AM PRÜFSTAND SELBST, beim Nachstellen gefunden:** der Mock in
> `buildDom()` übersprang Übersetzungen für die Vorgabesprache
> (`code !== base`) — mit der Begründung, `writeName()` lege für sie gar keine
> Zeile an. **Das stimmt, solange die Vorgabesprache nie wechselt.** Wer eine
> türkische Übersetzung einträgt und *danach* Türkisch zur Vorgabe macht, hat
> genau so eine Zeile, und `namesAll()` am Server setzt sie über die
> Grundzeile. **`namesTableMock()` ist jetzt Zeile für Zeile dieselbe Rechnung**
> (Stolperstein 90). *Keine Prüflage von 0.24.5 ändert sich dadurch — keine
> von ihnen gibt eine Übersetzung für die Vorgabesprache mit.*

---

## Bauabschnitt 2 — die Reparatur

### Die Kette bekommt einen dritten Schritt (E2, F2)

`namesFrom()` in `public/app.js`:

```js
const nameFallbackChain = (shownCode) => {
  const base = baseNamesLanguage();
  const pool = LANGUAGES.filter(a => a.active).map(a => a.code);
  return [base, ...pool].filter((code, i, all) =>
    code !== shownCode && all.indexOf(code) === i);
};
```

**Vier Schritte statt drei:**

1. was für die **gezeigte** Sprache eingetragen ist,
2. sonst die **Vorgabesprache** — ihre Tafel trägt den Namen der Grundzeile,
3. sonst die **erste Sprache des Vorrats**, die wirklich einen Eintrag hat,
4. und sonst, was hereinkam.

**In der kanonischen Reihenfolge des Vorrats**, nicht in der der Tafel: die
Reihenfolge einer Antwort ist keine Aussage. **Und nur aus dem Vorrat** — was
der Eigentümer nicht freigegeben hat, pflegt er auch nicht, und ein Rückfall
darauf zeigte einen Namen aus einer Sprache, die es in dieser Installation
nicht gibt. *Dieselbe Klemme wie bei `namesLanguage()`.*

**Schritt 4 ist die Klammer und kein Weg** — die Tafel der Vorgabesprache kommt
aus den Grundzeilen, und die tragen einen Namen (`NOT NULL`). Sie steht
trotzdem da: ohne sie stünde bei einer Tafel, die eine Zeile nicht kennt, gar
nichts, und ein leerer Name sähe aus wie „nichts angelegt".

**Der Vermerk trägt jetzt zwei Gestalten in EINEM Feld:** `nameFallback` ist
entweder die **Kennung** der Sprache, deren Name wirklich dasteht, oder `true`
— *„es steht ein Rückfall da, und ich kann keine Sprache dafür nennen"*. Der
zweite Fall bekommt einen eigenen Satz **ohne** Sprachnamen
(`card.nameFallbackNone`). *Ein zweites Kennzeichen daneben wäre eine zweite
Aussage über dieselbe Sache gewesen, und die beiden liefen auseinander.*

> **BEIDE SCHLÜSSEL STEHEN WÖRTLICH IM AUFRUF und nicht als Variable.** Das ist
> keine Umständlichkeit, sondern die Bedingung eines Wächters: der Prüfstand
> liest die Aufrufe von `t()` am Quelltext und hält dagegen, dass jeder
> Platzhalter eines Satzes auch gereicht wird. **Ein Schlüssel in einer
> Variablen ist für ihn kein Aufruf** — `{language}` bliebe danach wörtlich am
> Bildschirm stehen, und niemand sähe es. *Der erste Entwurf hat den Wächter
> rot gemacht; er hatte recht.*

### Die Karte sagt, was die Vorgabesprache trägt (E1, F3)

`drawNameLanguages()` hängt unter die Pillenreihe einen gedämpften Satz, sobald
die gezeigte Sprache die Vorgabesprache ist:

> *Türkçe ist die Vorgabesprache: hier steht der Name der Grundzeile —
> gleichgültig, in welcher Sprache er eingetragen wurde.*

**Er steht an der Pillenreihe und nicht an jeder Zeile:** es ist eine Aussage
über die **Tafel** und nicht über eine einzelne Zeile — und an jeder Zeile
stünde derselbe Satz zwanzigmal untereinander. **Und nur, solange die
Vorgabesprache gezeigt wird**: ein Hinweis, der immer dasteht, sagt nichts
mehr.

**An der Ablage ändert sich nichts.** *Der saubere Weg — eine Spalte `language`
an den Grundzeilen samt Migrationsblock — ist eine Datenbankstufe und eine
eigene Runde (F3).*

### Die Tafeln ziehen nach (E3, F4)

**Am Server**, `PUT /api/settings`: die Bedingung steht jetzt einmal als
`languagesTouched` und trägt beides — das Schreiben und die Antwort.

```js
...(isAdmin(req) && languagesTouched
  ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),
```

**Nur wenn die Sprachfrage berührt war:** dieser Weg schreibt auch Filter,
Ansichten und vierzehn Vokabelwörter, und keiner dieser Rufer braucht zwei
Namenstafeln in der Antwort. **Und nur für den Admin**, an derselben einen
Klemme wie beim Lesen (F3 der Runde 0.24.5).

**An der Karte**, `sendLanguages()`: ein `takeNames(s)` neben dem
`LANGUAGES = s.languages`. *Dieselbe Zeile wie `takeVocabulary()` beim
Sprachwechsel des Lesers — kein zweiter Abruf, kein Zwischenspeicher, der
gepflegt werden muss.*

**`F_ROUTES` steigt nicht:** es sind zwei Felder mehr in einer Antwort, die es
längst gibt, und kein neuer Weg.

---

## Ein Befund, den der Auftrag nicht kannte — das Gewicht benennt um

**Gefunden beim Gegenlesen des eigenen Diffs**, nachgestellt und repariert.
*Dieselbe Stelle im Ablauf wie in 0.24.5, wo `drawAdmin()` an `namesFrom()`
vorbeilas — auch dort stand der Befund nicht im Auftrag.*

**Der Schreibweg verlangt einen Namen** (`server.nameMissing`), ein
Gewichtswechsel schickt also einen mit. Bis 0.24.5 schickte er `entry.name`
**ohne Sprachangabe** — und ohne Angabe meint der Server die **Grundzeile**
(`namedLanguage()`).

> **WER AUF DER PILLE „ENGLISH" EIN GEWICHT VERSTELLTE, BENANNTE DAMIT DIE
> GRUNDZEILE IN DEN ENGLISCHEN NAMEN UM.** *Der deutsche Name war weg — im
> Export, in der Sortierung und für jeden anderen Leser.* **Niemand hat einen
> Namen angefasst, und trotzdem stand danach ein anderer da.**

**Nachgestellt**, mit der Reparatur von Hand zurückgebaut:

```
✗ Und die Grundzeile heisst danach immer noch, wie sie hiess
      "First"
```

*Sie hieß „Zuerst".*

**Die Angabe ist die Sprache, aus deren Tafel der Name stammt** — und nicht die
der Pille. Bei einem Rückfall steht in `entry.name` der Name einer **anderen**
Sprache, und mit der Pille als Angabe machte das Speichern aus dem Rückfall
einen **Eintrag**: *derselbe Fehler wie B2 der Runde 0.24.4, an einem Feld, das
gar keinen Namen ändern will.* `nameFallback` sagt genau das — die Kennung der
Tafel, aus der der Name kommt, oder `true`, wenn es keine gibt; dann ist es die
Antwort des Servers, und die trägt den Namen der Grundzeile.

**So geschrieben ändert der Gewichtswechsel keinen Namen:** er schreibt
denselben Wert an dieselbe Stelle zurück.

> **WARUM ER TROTZDEM IN DIESE RUNDE GEHÖRT, obwohl er nicht im Auftrag
> steht:** *die Kette dieser Runde hätte ihn schlimmer gemacht.* Bis 0.24.5 war
> der Rückfall **immer** der Name der Grundzeile — zurückgeschrieben war er ein
> Nichts. **Mit dem dritten Schritt kann in `entry.name` jetzt die Übersetzung
> einer dritten Sprache stehen**, und die wäre in die Grundzeile gewandert.
> *Eine Reparatur, die einen vorhandenen Fehler schärft, ist ohne ihn nicht
> fertig.*

---

## Bauabschnitt 3 — der Prüfstand

**Die neue Gruppe „Die Vorgabesprache als zweite Achse — 0.24.6"** hält
neunundvierzig Zusagen:

| was | wie viele |
|---|---|
| **Die neun Zellen** — drei Vorgabesprachen × drei Pillen, an einer Zeile ohne Übersetzung; jede mit dem Namen **und** der genannten Sprache als Sollwert | 9 |
| **Der Kartenhinweis** — er steht genau dann da, wenn die Vorgabesprache gezeigt wird, und sonst nicht | 9 |
| **Die Vergleichszeile** — die in allen drei Sprachen gepflegte Zeile, an jeder Zelle mitgelesen | 9 |
| **Der Aufbau je Vorgabesprache** — der Knopf „Standard" steht da, und der Rumpf nennt wirklich die neue Vorgabe | 6 |
| **Die Kette** — dritter Schritt, genannte Sprache, Klammer ohne Sprachnamen, Aufbau | 4 |
| **Die Reihenfolge** — tragen zwei Sprachen etwas, gewinnt die erste des Vorrats | 1 |
| **Der Vorrat** — eine Sprache außerhalb trägt den Rückfall nicht (mit Aufbau) | 2 |
| **Kein zweiter Abruf** — der Wechsel holt die Tafeln nicht nach | 1 |
| **Die Zählprobe** — es waren wirklich neun Zellen | 1 |
| **Das Gewicht benennt nichts um** — der Rumpf nennt die Sprache, der Bestand bleibt, das Gewicht kommt an; dazu dieselbe Frage an einer Zeile mit Rückfall | 7 |

**Dazu neun Zusagen am laufenden Server**, in der Gruppe „Die Namenstafeln je
Sprache": die Messung aus E1 (Türkisch trägt danach den Grundzeilennamen,
Deutsch steht leer, und was wirklich eingetragen ist, wandert nicht), die
Antwort des Wechsels mit beiden Tafeln und dem neuen Stand, `languages`
weiterhin daneben, ein Schreiben **ohne** Sprachfrage ohne Tafeln, und die
Klemme `isAdmin(req)` am Quelltext.

**Die 27 Zellen von 0.24.5 und die neun der Kachel „Vokabular" sind grün
geblieben** — vorher wie nachher.

> **UND DIE GRUPPE STEHT AN EINER ANDEREN STELLE ALS ZUERST.** *Sie war
> unmittelbar hinter die Gruppe von 0.24.5 gesetzt — und hat damit zehn
> Prüfungen unter ihre Überschrift gezogen, die dort schon lagen und zu 0.24.5
> gehören.* **`group()` setzt eine Überschrift und keine Klammer:** was danach
> kommt, gehört dazu, bis die nächste ruft. *Aufgefallen beim Nachzählen —
> zweiundfünfzig gemeldete gegen zweiundvierzig gezählte.* Die Gruppe steht
> jetzt hinter jenen zehn.

**Zwei Wächter haben mitgezogen:**

* **Die Zahl der Sätze je Sprachdatei: 1278 → 1280.** Zwei Sätze sind
  dazugekommen (`card.nameFallbackNone`, `card.namesBaseRow`), beide in einer
  eigenen Liste `WORDING_NEW_0246` — die Listen sind die Buchführung darüber,
  welche Runde welchen Satz gebracht hat.
* **Die Umschalterprobe zählt jetzt Pillen und nicht Kinder.** Seit dieser
  Runde liegt im Kasten der drei Namenskarten außer den Pillen auch der
  Kartenhinweis; `children` zählte ihn mit, und aus drei Sprachen wurden vier.
  *Was diese Zeile fragt, sind die Sprachen.*

---

## Die Gegenproben

**Elf neue (749 bis 759), zwei mitgegangen — und einer ist im gefahrenen Lauf
berichtigt worden.**

*Drei Nebenspuren im ersten Lauf, zwei im zweiten; Versatz 3500 je Spur, jede
Kopie aus `git archive HEAD`.*

| Nr | was zurückgebaut wird | rot |
|---|---|---|
| **744** | Die Karte liest die Namenstafel nicht mehr *(mitgegangen: der Suchtext steht seit dieser Runde eine Zeile höher)* | **45** |
| **745** | Der Vermerk am Rückfall fällt weg *(mitgegangen: der Vermerk kennt seit dieser Runde zwei Sätze)* | **4** |
| **749** | Die Kette bricht nach der Vorgabesprache ab | **2** |
| **750** | Der Vermerk nennt wieder die Vorgabesprache | **2** |
| **751** | Die Klammer behauptet wieder eine Sprache | **2** |
| **752** | Die Kette läuft in der umgekehrten Reihenfolge | **16** |
| **753** | Die Kette nimmt auch Sprachen außerhalb des Vorrats | **1** |
| **754** | Der Hinweis auf die Grundzeile fällt weg | **3** |
| **755** | Der Hinweis auf die Grundzeile steht an jeder Pille | **6** |
| **756** | Der Wechsel der Vorgabesprache zieht die Tafeln nicht nach | **8** |
| **757** | Die Antwort des Wechsels trägt die Namenstafeln nicht *(server.js)* | **3** |
| **758** | Jede Antwort des Schreibwegs trägt die Namenstafeln *(server.js)* | **2** |
| **759** | Der Gewichtswechsel schickt den Namen ohne Sprache | **3** |

> **EINER LIEF STUMM, UND DAS IST EIN FUND — 755.** *Die erste Fassung tauschte
> im SATZ des Kartenhinweises `baseNamesLanguage()` gegen `namesLanguage()` —
> sauber zu lesen und ein Nichts:* **der Satz wird nur gezeichnet, WENN die
> beiden gleich sind.** Der Rückbau hat also genau denselben Text erzeugt und
> keinen einzigen Punkt rot gemacht. **Er zielt seither auf die BEDINGUNG**,
> nicht auf den Text — *ein Rückbau muss die Stelle treffen, die die Zusage
> trägt.*

> **UND EINE ZAHL SAGT MEHR ALS IHRE GRÖSSE — 752 mit sechzehn roten Punkten.**
> Die umgekehrte Reihenfolge trifft nicht nur die eine Reihenfolgeprobe: sie
> dreht in jeder Zelle der zweiten Achse den Rückfall auf eine andere Sprache.
> *Eine Kette, deren Ordnung niemand festhält, ist keine Kette.*

> **UND 753 MIT EINEM EINZIGEN.** Die Klemme gegen den Vorrat hat genau eine
> Prüflage, und das ist richtig so: **sie ist eine Klemme und kein Verhalten.**
> *Ein Rückbau, der einen einzigen Punkt trifft, ist der schärfste — er sagt,
> dass genau diese Zeile genau diese Zusage trägt.*

**Gefahren in zwei Läufen: zwölf am 9. September 2026 (`1d243d2`), danach die
berichtigte 755 und die neue 759 (`d0dd9c3`).** *Der zweite Lauf meldet
**0 STUMM**; im ersten war 755 der eine Fund.* **Die Rückbauten von 744 bis 758
sind zwischen den beiden Läufen nicht angefasst worden** — verschoben wurde nur
die Gruppe innerhalb von `testbench.js`, ohne dass eine einzige Zusage sich
geändert hätte.

---

## Der Augenschein — drei Bilder, ein Wechsel

**Gefahren am 9. September 2026 an einem eigenen Server**, mit dem Bestand des
Befunds: drei Kategorien mit deutschem Namen und englischer Übersetzung, **ohne
Türkisch** — und eine vierte, für die alle drei gepflegt sind.

| Bild | Lage | was dasteht |
|---|---|---|
| **1** | Vorgabe **Deutsch**, Pille **Türkçe** | `1_Datenträger_de`, `KI_de`, `Product_de`, jeweils mit *„(nicht eingetragen — es steht Deutsch)"*. **Die vierte Zeile trägt `Her yerde_tr` und keinen Vermerk** |
| **2** | Vorgabe **Türkçe**, Pille **Türkçe** *(nach dem Wechsel, ohne Neuladen)* | dieselben drei Namen — **ohne Vermerk**, denn sie sind jetzt die Einträge der türkischen Tafel. Darüber steht der Hinweis: *„Türkçe ist die Vorgabesprache: hier steht der Name der Grundzeile — gleichgültig, in welcher Sprache er eingetragen wurde."* |
| **3** | Vorgabe **Türkçe**, Pille **Deutsch** | alle vier Zeilen mit *„(nicht eingetragen — es steht Türkçe)"* — **und das stimmt jetzt**: nach dem Wechsel steht in der deutschen Tafel wirklich nichts mehr |

**Das ist E1 am Bildschirm, und die Karte behauptet nichts mehr.** *Bild 2 ist
die Lage, um die es geht: unter der Pille „Türkçe" stehen drei deutsche Namen,
und darüber steht, warum.*

> **WAS DER AUGENSCHEIN NICHT ZEIGT UND WAS DER BETREIBER WISSEN SOLL:** der
> Wunsch aus dem Befund — *„besser wäre Englisch, da es ja existiert"* — greift
> **nur dort, wo die Vorgabesprache wirklich nichts trägt.** Nach einem Wechsel
> auf Türkisch trägt die türkische Tafel die Grundzeilen, und damit ist für sie
> etwas eingetragen; der dritte Schritt der Kette kommt gar nicht erst dran.
> **Der Vermerk lügt nicht mehr, und der Hinweis sagt, woran es liegt** — *aber
> Englisch steht dort erst, wenn die Grundzeile ihren eigenen Sprachvermerk
> hat.* **Das ist E1, und es ist die nächste Runde.**

> **UND DER AUGENSCHEIN HAT WIEDER ETWAS GEFUNDEN — diesmal an sich selbst.**
> Zwei Läufe zeigten zwei verschiedene Bilder für dieselbe Lage. *Die Ursache
> war kein Fehler im Programm, sondern ein Server aus einem abgebrochenen Lauf,
> der den Port noch hielt* — er antwortete auf `/api/config` wie der eigene und
> trug die Vorgabesprache von damals. **Die Prüflage sieht jetzt nach, ob auf
> ihrem Port schon jemand antwortet, und bricht ab, statt zu messen.**
> *Stolperstein 139 in einer Gestalt, die man nicht sieht: nicht ein belegter
> Port, sondern ein antwortender.*

---

## Was ausdrücklich nicht gebaut wurde

* **Keine Datenbankstufe.** Eine Spalte `language` an den Grundzeilen wäre der
  saubere Weg für E1 und ist eine eigene Runde *(F3)*.
* **`localeOf(req)` ist unangetastet** — wie in 0.24.5. Die Reihenfolge der
  drei Quellen gilt weiterhin für Meldungen.
* **Nichts am Vokabular.** Es ist von allen dreien nicht betroffen: seine
  Tafeln tragen je Sprache nur Eingetragenes und kennen keine Grundzeile. *Es
  läuft als Vergleichsgruppe mit und ist grün geblieben.*
* **Der Funktionswunsch „Potenzial abschaltbar"** *(F1)* — er steht im Fahrplan
  unter 0.25.0.
* **Nichts an der README-Nummer.** *Die Datei trägt keine Versionsnummer* — sie
  verweist für „was eine Version mitbringt" auf das `CHANGELOG.md`. **Was in ihr
  geändert wurde, ist die Beschreibung des Rückfalls** und der neue Kasten zur
  Vorgabesprache.

---

## Stolpersteine dieser Runde

**Der Wächter über die Platzhalter liest den Quelltext, nicht den Lauf.** Der
erste Entwurf hat den Schlüssel des Vermerks in eine Variable gelegt
(`t(fallbackWording, { language })`) — sauber zu lesen und für den Wächter kein
Aufruf. *Er hat es gemeldet, und er hatte recht: ein Satz, dessen Platzhalter
niemand füllt, steht wörtlich am Bildschirm.* **Beide Schlüssel stehen jetzt
wörtlich da.**

**Ein Kasten, in dem plötzlich mehr liegt als vorher, bricht jede Zählung
darüber.** Der Kartenhinweis liegt im selben Kasten wie die Pillen — richtig
so, denn `box.innerHTML = ''` räumt ihn beim Neuzeichnen mit weg. **Die
Zählungen darüber mussten mitziehen**, und zwar von `children` auf `.pill`:
*was sie fragen, sind die Sprachen und nicht die Knoten.*

**Eine Überschrift ist keine Klammer.** `group()` im Prüfstand setzt eine
Überschrift; alles, was danach kommt, zählt dazu, bis die nächste ruft. **Eine
neue Gruppe unmittelbar hinter eine alte zu setzen, nimmt der alten die
Prüfungen weg, die zwischen ihr und der nächsten Überschrift lagen** — hier
zehn Stück. *Aufgefallen ist es beim Nachzählen und nicht an einem roten Punkt:
die Summe stimmte, nur stand sie an der falschen Stelle.*

**Ein Mock, der eine Vereinfachung trägt, hält genau so lange, wie die
Vereinfachung stimmt.** `namesTableMock()` übersprang Übersetzungen für die
Vorgabesprache — richtig, solange die Vorgabesprache nie wechselt, und diese
Runde handelt von nichts anderem als ihrem Wechsel. *Stolperstein 90 in einer
Gestalt, die erst eine Runde später sichtbar wird.*

**Ein Rückbau, der denselben Text erzeugt, ist kein Rückbau.** 755 tauschte im
Satz des Kartenhinweises eine Sprache gegen eine andere — und der Satz wird nur
gezeichnet, wenn die beiden gleich sind. **Er lief STUMM.** *Der Lauf hat es
gemeldet, und genau dafür ist die STUMM-Meldung da: eine Gegenprobe, die nichts
rot macht, prüft nichts.*

**Ein fremder Server muss nicht den Port belegen — er muss nur antworten.** Der
erste Augenschein dieser Runde zeigte in zwei Läufen zwei verschiedene Bilder
für dieselbe Lage. *Die Ursache war ein Server aus einem abgebrochenen Lauf,
der auf `/api/config` genauso antwortete wie der eigene und die Vorgabesprache
von damals trug.* **Die Prüflage sieht jetzt vorher nach.** *Stolperstein 139
in einer Gestalt, in der der Port frei aussieht.*

---

## Was danach offen bleibt

**E1 ist gekennzeichnet und nicht behoben.** Die Grundzeile trägt weiterhin
keinen Sprachvermerk, und ein Wechsel der Vorgabesprache verschiebt weiterhin
den ganzen Bestand dieser Namen von einer Tafel auf die andere. **Was fällt,
ist die Behauptung** — die Karte sagt jetzt, was dort steht. *Der saubere Weg
ist eine Spalte `language` an `product_categories` und `rating_criteria` samt
Migrationsblock; er gehört in eine eigene Runde und steht als Vorschlag im
Fahrplan.*
