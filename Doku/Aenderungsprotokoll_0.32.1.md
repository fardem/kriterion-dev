# Änderungsprotokoll 0.32.1 — „Die Endung, das Wort und die Zahl"

**Drei Befunde des Betreibers · 14. September 2026 · gebaut auf 0.32.0 · MINOR,
kein Schemaanteil an der Datenbank und keiner am Austauschformat.**

> **FINGERPRINT DIESER RUNDE: `24899ab8`** — *gerechnet am gebauten Stand, als
> letztes und hinter der letzten Zeile; achtzehn Dateien, `Doku/` und
> `testbench.js` ausdrücklich nicht darunter.* **Der Stand davor war
> `319d9c8a`.**

> **DIE RUNDE SCHRUMPFT, UND DAS IST IHR VORZEICHEN.** *Sie nimmt eine Bauweise
> zurück statt eine hinzuzufügen: sechs Schlüssel fallen, neun Rückbauten
> fallen, eine ganze Prüfgruppe dreht sich um.* **1215 → 1209 Schlüssel,
> 1017 → 1008 Rückbauten.**

---

## Drei Befunde, und alle drei kamen von außen

| | Befund | was daraus wurde |
|---|---|---|
| **1** | *„Unter dem Eintrag steht auf Türkisch* **„Öğe sil"**. *Richtig wäre* **„Öğeyi sil"**.*"* | **Dreizehn türkische Werte umschifft** — und zwei Wächter, die den nächsten Fall finden |
| **2** | *„Was ist hier passiert?* **Bu bir raporu kadarı?**"* *(Bildschirmfoto der Zählzeile)* | **Die Zählzeile baut keinen Satz mehr** — Zahl und Zeichen, `list.ofWhich` fällt |
| **3** | *„Filter zurücksetzen bringt doch wieder die Vorwahl.* **Raus mit dieser Funktion.**"* | **„Filter folgt der Sortierung" ist ausgebaut** — fünf Schlüssel und siebzehn Rückbauten fallen mit |

---

## Strang 1 · Die türkische Endung am Vokabelwort

### Der Befund war ein Einzelfall, die Ursache nicht

„Öğe sil" heißt „lösche **ein** Eintrag". Der Knopf steht aber unter **diesem
einen**, und ein bestimmtes Objekt trägt im Türkischen die Endung `-(y)I`:
**„Öğeyi sil"**.

> **DER ÜBERSETZER HAT DIE REGEL GEKANNT.** *Jedes* **feste** *Substantiv der
> Datei steht korrekt im Akkusativ:* „Dosyayı sil", „Resmi sil", „Kullanıcıyı
> sil", „Görünümü sil", „Anahtarı kopyala", „Menüyü aç", „Filtreleri sıfırla".
> **Sie fehlte ausschließlich dort, wo ein PLATZHALTER steht** — *und das ist
> keine Nachlässigkeit, sondern eine Unmöglichkeit: die Endung hängt am Wort,
> das der Betreiber einträgt, und ein fester Satz kann nur eine tragen.*

### Ausrechnen lässt sie sich nicht — gemessen, nicht vermutet

| Wort | Akkusativ | welche Regel greift |
|---|---|---|
| **Öğe** | Öğe**yi** | endet auf Vokal → Bindekonsonant *y* |
| **Rapor** | Rapor**u** | Konsonant, letzter Vokal *o* |
| **Görev** | Görev**i** | letzter Vokal *e* |
| **Test günü** | Test gün**ünü** | trägt schon ein Possessiv → Bindekonsonant **n** |
| **Not** | Not**u** | einsilbiges Lehnwort — **keine** Erweichung *t → d* |

**Geprüft an der verbreitetsten Bibliothek dafür** ([affixi](https://github.com/CanPacis/affixi), TypeScript),
installiert und gegen unser eigenes Vokabular gefahren:

```
  ✗   Öğe              -> Öğeni              (richtig: Öğeyi)
  ok  Test günü        -> Test gününü
  ok  Rapor            -> Raporu
  ✗   Değerlendirme    -> Değerlendirmeni    (richtig: Değerlendirmeyi)
  ok  Not              -> Notu
  ok  Kitap            -> Kitabı
                                   10 von 12 richtig, 2 falsch
```

> **SIE SCHEITERT AN „Öğe" — an genau dem Wort, das der Befund nannte.** *Der
> Grund steht in ihrem Quelltext,* `lib/main.js:446`*:*
> ```js
> case Case.Accusative:
>   if (sounds.vowels.includes(letter)) { infix = 'n'; }
> ```
> *Sie hängt das* **-n-** *an jedes vokalendende Wort. Nach einem Possessiv ist
> das richtig (*„Test gün**ü**" → „Test gün**ünü**"*), bei einem schlichten
> Substantiv falsch.* **Ob ein vokalendendes Wort ein Possessiv trägt, steht
> nicht in den Buchstaben** — *und deshalb kann es keine Bibliothek wissen.*

*Die zweite JavaScript-Bibliothek dieser Art* ([Turkish.js](https://www.npmjs.com/package/turkish))
*ist seit neun Jahren nicht angefasst und lässt sich nicht einmal mehr laden.*

### Was die Fachwelt stattdessen macht

| Weg | wer ihn geht | warum nicht |
|---|---|---|
| **Satz nicht zusammensetzen** | [i18next](https://www.i18next.com/principles/best-practices), [Localization Blog](https://localization.blog/2022/05/16/i18n-best-practices-keep-it-together/) | *Genau unser Fall steht als* [Issue #1685](https://github.com/i18next/i18next/issues/1685) *dort — wörtlich mit* „Yorumlar seç" *statt* „Yorumları seç"*.* **Als *stale* markiert, geschlossen ohne Lösung** |
| **Formen eintragen** | [Mozilla Fluent](https://hacks.mozilla.org/2019/04/fluent-1-0-a-localization-system-for-natural-sounding-translations/) — Terme mit Fallvarianten | *rechnet nichts aus; ein Mensch trägt jede Form ein.* **Ein drittes Feld je Vokabelwort — vom Betreiber abgelehnt** |
| **Morphologie im Code** | [MediaWiki `{{GRAMMAR:}}`](https://translatewiki.net/wiki/Grammar) | *läuft auf einer kuratierten Wortmenge, nicht auf freier Eingabe* |
| **Fall im Format** | [CLDR `grammaticalFeatures.xml`](https://github.com/unicode-org/cldr/blob/main/common/supplemental/grammaticalFeatures.xml), [ICU MessageFormat 2](https://unicode-org.github.io/icu/userguide/format_parse/messages/mf2.html) | *CLDR nur für **Maßeinheiten**; MF2 nennt Flexion als Ziel und liefert sie nicht* |
| **Generisches Kopfwort** | Microsoft Turkish Style Guide, Lokalisierungspraxis | ← **das ist der gebaute Weg** |

### Gebaut ist das Kopfwort — dreizehn Stellen

| Schlüssel | vorher | jetzt |
|---|---|---|
| `entry.deleteEntry` | `{entryOne} sil` | **`{entryOne} kaydını sil`** |
| `entry.deleteDay` | `{dayOne} sil` | **`{dayOne} kaydını sil`** |
| `card.potentialModeLabel` | `“{potential}” aç` | **`“{potential}” modunu aç`** |
| `entry.deleteWord` | `{word} sil` | **geteilt** in `entry.deletePhoto` („Fotoğrafı sil") und `entry.deleteVideo` („Videoyu sil") |
| `list.bellMine` | `Benim {entryMany}` | **`Bana ait {entryMany}`** |
| `list.newCommentsHint` | `… senin {entryMany} …` | **`… sana ait {entryMany} …`** |
| `server.criterionKindFixed` | `{potential} mı yoksa …` | **`ya “{potential}” ya da “{ratingOne}” kutusuna aittir`** |
| `login.noPhoneHint` | `{word} de girebilirsin` | **`Bunun yerine {word} girebilirsin`** |
| `entry.alsoGoes` | `{what} da birlikte gider.` | **`Bunlar da birlikte gider: {what}.`** |
| `dialog.postsOfOthers` | `“{name}” katkılarını …` | **`“{name}” kullanıcısının katkılarını …`** |
| `card.linkHolderUser` | `“{username}” parolasını` | **`“{username}” kullanıcısının parolasını`** |
| `card.rejectRequestAsk` | `“{username}” başvurusu` | **`“{username}” kullanıcısının başvurusu`** |
| `card.createdFrom` | `“{title}” öğesinden` | **`“{title}” kaydından`** |

> **DAS TEILEN VON `entry.deleteWord` IST KEINE AUSNAHME, sondern die Praxis
> der Datei selbst:** `entry.deleteFile` *steht schon als* „Dosyayı sil" *und*
> `entry.deleteImage` *als* „Resmi sil" — *beide fest, beide richtig. Der
> Platzhalter trug genau zwei Wörter, und die brauchen zwei verschiedene
> Endungen (*`-ı` *und* `-yu`*).*

### Und zwei Wächter, die den nächsten Fall finden

| Wächter | was er sieht |
|---|---|
| **Kein türkischer Befehl hinter einem Platzhalter** | `{entryOne} sil` fällt auf, `{entryOne} kaydını sil` nicht. *Dreiundzwanzig Befehlsformen namentlich;* `çıkar` *steht ausdrücklich nicht darin — es heißt im Haus „ergibt sich" und nicht „nimm heraus"* |
| **Kein harmonierendes Anhängsel hinter einem Platzhalter** | `{potential} mı` und `{word} de` fallen auf. *Die Fragepartikel und das Klitikon richten sich nach dem letzten Vokal davor — und der ist bei einem Platzhalter unbekannt* |

**Eine benannte Ausnahme:** `card.confirmOnce` *(„Bir kez onayla, sonra {word}
yükle") — der Platzhalter trägt dort* `card.partOrAll`*, und **das** steht schon
im Akkusativ („parçayı"). Die Endung ist da, sie steht nur im eingesetzten Stück.*

---

## Strang 2 · Vokabelwörter, die fest im Satz standen

**Fünf Schlüssel, und es traf alle drei Sprachen** — der deutsche Satz selbst
trug das Wort:

| Schlüssel | stand da | jetzt |
|---|---|---|
| `entry.noDaysYet` | „… Datum und **Note** eintragen" | **`{grade}`** — *ein Versäumnis von 0.32.0 selbst* |
| `server.ratingBeforeTest` | „dieser **Eintrag** steht auf **„ungetestet**"" | **„hier steht „`{testedNo}`""** |
| `server.deniedEntry` | „Diesen **Eintrag** ändert nur …" | **„Ändern darf nur, wer es angelegt hat …"** |
| `card.potentialModeHint` | „… im **Eintrag**, in der Sortierung …" | **„… in der Detailansicht …"** |
| `entry.dueHint` | „Fälligkeitsdatum der **Aufgabe**" | **„Fälligkeitsdatum"** |

> ### UND HIER IST DER VORSCHLAG UNTERWEGS KORRIGIERT WORDEN
>
> **Der erste Entwurf wollte überall den Platzhalter einsetzen** — `{entryOne}`
> statt „Eintrag". **Das hätte im Deutschen genau denselben Fehler eingebaut,
> den es im Türkischen abräumt:** „Diesen `{entryOne}`" ist richtig für
> „Eintrag" *(maskulin)* und falsch für „Bewertung" *(feminin)* — **der
> deutsche Artikel ist dasselbe Problem wie die türkische Endung**, nur an
> einer anderen Stelle des Wortes.
>
> **Also wird der Platzhalter nur dort eingesetzt, wo kein Artikel davorsteht**
> *(`{grade}` nach „und", `{testedNo}` in Anführungszeichen)*; **an den drei
> übrigen Stellen fällt das Wort ersatzlos weg.** *Ein Satz ohne das Wort ist
> besser als einer mit dem falschen Artikel davor.*

**Ein dritter Wächter hält das fest:** kein Wert einer Sprachdatei enthält ein
Vokabelwort derselben Datei — *gelesen werden die Vorgaben unter `vocabulary.`
und nicht eine abgeschriebene Liste (Stolperstein 47)*. Vierundzwanzig benannte
Ausnahmen, jede mit ihrem Grund; **zwei davon tragen ihre Sprache mit sich**
(`en/error.serverStatus` — „the server **reports**" ist das Verb;
`tr/server.ratingBeforeTest` — „**değerlendirme** yapılmaz" ebenso).

---

## Strang 3 · Die Zählzeile — Zahl und Zeichen statt Satz

### Der Befund war ein Satz, der auf Türkisch keiner ist

```
   4 yorum, bunun 1 Rapor kadarı
```

`list.ofWhich` hieß `, bunun {parts} kadarı`. **Drei Fehler in vier Wörtern:**

1. **`kadar` ist das falsche Wort** — es heißt „so viel davon", eine
   *Mengenangabe*. Das deutsche „davon" meint hier „darunter".
2. **`bunun` ist Einzahl** — gemeint sind die vier Kommentare.
3. **Der Kopf steht HINTER dem Platzhalter und klammert ihn ein.** `{parts}`
   ist eine Aufzählung, die zur Laufzeit beliebig lang wird:
   > `4 yorum, bunun 1 Rapor ve 2 Görev (1 açık) kadarı`

### Und die Zeile passte ohnehin nicht — gemessen in echtem Chromium

*Kopfzeile `.label` + 10 px Lücke + `.hint`, mit `public/style.css`, bei
390 px Fenster = **358 px nutzbar**:*

| | DE | EN | TR |
|---|---|---|---|
| **der Satz, schlimmster Fall** | **490 ✗** | **435 ✗** | **401 ✗** |
| Aufzählung mit `·`, Wort behalten | 429 ✗ | 360 ✗ | 323 ✓ |
| ohne das Wort „Kommentare" | 341 ✓ | 287 ✓ | 277 ✓ |
| …**mit längeren eigenen Vokabeln** | **390 ✗** | 343 ✓ | 296 ✓ |
| **Zahl + Zeichen** | **202 ✓** | **184 ✓** | **184 ✓** |

> **JEDE FORM, DIE DAS VOKABELWORT ZEIGT, LÄSST SICH VOM VOKABULAR SELBST
> SPRENGEN.** *„Berichte" → „Protokolle" und „Aufgaben" → „Arbeitsaufträge",
> und die kürzeste Wortvariante reißt wieder.* **Nur eine Form ohne Wort ist
> gegen Umbenennen sicher.**

### Gebaut ist

```
YORUMLAR                          12 · ⚑3 · ☐3 · ☑2
```

| | | Farbe |
|---|---|---|
| **⚑** | Bericht | `--accent` — dieselbe wie `.cmt.report` |
| **☐** | offene Aufgabe | `--blue` — wie `.cmt.task` |
| **☑** | erledigt | `--green` — wie `.cmt.done` |
| **@** | an mich gerichtet *(Glockentafel)* | `--blue` — wie `.mention` seit 0.32.0 |

**Das Zeichen trägt den Sinn, die Farbe verstärkt ihn nur** — Gestaltungsregel
**G1**: *„Rollen- und Zustandsmarken werden aus* **Form** *gebaut, nicht aus
Farbe."* **Der volle Satz steht im `title`**, und zwar als Aufzählung mit
Mittelpunkten: „12 Kommentare · 3 Berichte · 5 Aufgaben (3 offen)". *Eine
Aufzählung aus „Zahl + Wort" braucht in keiner der drei Sprachen eine Fuge, ein
„davon" schon.*

> ### WARUM KEIN PLUSZEICHEN — das war der erste Vorschlag des Betreibers
>
> **Die Zahlen ergeben nicht die Summe, und ein Pluszeichen behauptete das
> Gegenteil.** *Es gibt* **vier** *Kommentararten; die* **Notiz** *wird nicht
> genannt — sie ist der Zustand ohne Markierung.* Vier Kommentare können 1
> Bericht und 3 Notizen sein; **„4 (1)" wäre eine Rechnung, die nicht
> aufgeht.** *In der Glockentafel ist es noch härter: die Markierung ist eine*
> **Teilmenge** *und kann zugleich ein Bericht sein.*
>
> **Und eine nackte farbige Zahl bricht G1:** *wer farbfehlsichtig ist, liest
> „4 (3+5)" und weiß nichts; ein Vorleseprogramm sagt „vier Klammer auf drei
> plus fünf".*

**Drei Schlüssel fallen dabei:** `list.ofWhich`, `list.and` *(das Bindewort
hatte danach keinen Rufer mehr)* und der Platz `{of}` in `list.commentCount` —
**der steht damit wieder Zeichen für Zeichen so da wie bei der Abnahme.**

---

## Strang 4 · „Filter folgt der Sortierung" ist ausgebaut

### Es war eine Sackgasse, keine Geschmacksfrage

```
SORT_STATUS = { rating_*: 'tested',  potential_*: 'untested' }
```

1. „Filter zurücksetzen" setzte `STATUS_BY_HAND = false` — **ausdrücklich, mit
   Begründung**: er heißt ja „zurücksetzen".
2. Damit griff die Ableitung wieder: Sortierung **Bewertung** → Status
   **getestet**. Die Pille stand angewählt da, die Liste war gefiltert.
3. Aber `filterNumber()` zählte die Ableitung **nicht** als gesetzten Filter —
   die Ruhestellung war ja genau sie. **Also verschwand der Knopf „Filter
   zurücksetzen".**

> **Es war gefiltert, es sah gefiltert aus, und es gab keinen Weg mehr heraus**
> *außer einer Sortierung, die man gar nicht wechseln wollte.* **Der Kommentar
> an `statusIdle()` behauptete sogar, dieser Weg zurück sei der eine, den es
> gibt.** *Er war es nicht mehr, sobald die Ruhestellung selbst filterte.*

### Was gefallen ist

| | |
|---|---|
| **Quelltext** | `SORT_STATUS`, `STATUS_BY_HAND`, `defaultClosed()`, `statusOutSort()`, `statusIdle()` — `statusEffective(f)` ist jetzt **`f.tested`** |
| **Sprachdateien** | `list.followsSort`, `list.statusByHand`, `list.byHandHint`, `list.pillHint`, `list.sortDefaultHint` *(fünf Sätze, davon zwei erst in 0.32.0 entstanden)* |
| **Stilblatt** | `.pill-derived` samt Hover, und `#f-status-from` aus zwei Rasterregeln |
| **Rückbauten** | **siebzehn** — 606 bis 623, 807 und 1022 |
| **Prüfstand** | die Gruppe „Die Sortierung gibt den Status vor — 0.21.1" ist **umgedreht** |

> **`statusEffective` BLEIBT ALS NAME STEHEN**, *obwohl es jetzt nur noch ein
> Feld liest. Die Liste und die Leiste fragen weiter DIESELBE Stelle — zwei
> Rechenwege für dieselbe Frage liefen schon einmal auseinander (Stolperstein
> 47), und eine Funktion, die heute schlicht ist, ist der billigste Schutz
> davor, dass morgen wieder zwei daraus werden.*

**Und `filterNumber()` misst wieder gegen die Vorgabe** — dieselbe Zeile wie
vor 0.21.1: *was nicht `all` ist, hat jemand gesetzt, und was jemand gesetzt
hat, lässt sich zurücksetzen.*

---

## Der Prüfstand — zehn Zusagen

| | Zusage | wo sie steht |
|---|---|---|
| **1** | Kein türkischer Befehl steht unmittelbar hinter einem Platzhalter | **neu gebaut** — Gruppe „Endungen, Wörter und Zahlen" |
| **2** | Kein harmonierendes Anhängsel steht hinter einem Platzhalter | **neu gebaut**, dieselbe Gruppe |
| **3** | Kein Vokabelwort steht fest in einem Satz — in keiner der drei Sprachen | **neu gebaut**, dieselbe Gruppe |
| **4** | Die Kurzform der Zählzeile trägt kein Wort, nur Zahlen und Zeichen | Gruppe „Der Kommentarblock zählt" |
| **5** | Jede Zahl nennt ihre Art als Datenfeld, und jedes Zeichen ist ein SVG | dieselbe Gruppe — **G1** |
| **6** | Die Kurzform behauptet keine Summe — kein Pluszeichen | dieselbe Gruppe |
| **7** | Der Statusfilter ist das, was dasteht | Gruppe „Die Sortierung gibt den Status NICHT mehr vor" |
| **8** | „Filter zurücksetzen" führt wirklich zurück — keine Sackgasse | dieselbe Gruppe, **mit gefahrenem Weg** |
| **9** | Kein Rest der Ableitung im Quelltext, im Stilblatt, in den Sprachdateien | dieselbe Gruppe |
| **10** | Die drei Dateien tragen gleich viele Schlüssel, in derselben Folge | Deckungsprobe, **1209** |

**ACHT GEGENPROBEN — 1027 bis 1034**, *und alle acht bauen WIEDER EIN, was
diese Runde ausgebaut hat.* **Das ist die richtige Richtung für einen Ausbau:**
*nicht „nimm weg, was da ist", sondern „bring zurück, was weg sein soll".*

---

## Die sechs Gleichlautsummen

| | vor der Runde | danach |
|---|---|---|
| **de/one** | `1d5ff81dda51392a` | `6ff26921e11674ff` |
| **de/other** | `642d3a9967e12f42` | `e1428e2484415619` |
| **en/one** | `66de41e32bb706d9` | `97f89e94bcb911f2` |
| **en/other** | `55936a4de6cb5b6d` | `81d826369839a242` |
| **tr/one** | `d66b8778279f5ec1` | `f3a2034e18783412` |
| **tr/other** | `245369c1748d81d4` | `5ef5cbd1132e5562` |

*Alle sechs bewegen sich: die Runde fasst alle drei Dateien an* **und** *den
Quelltext, aus dem die Probe liest.*

---

## Die Zahlen

| | vorher | jetzt |
|---|---|---|
| **Schlüssel je Sprachdatei** | 1215 | **1209** *(+2, −8)* |
| **Flach gezählt (Namen und Zweige)** | 1303 | **1297** |
| **Mehrzahlformen** | 88 | **88** |
| **Vokabelnamen** | 15 | **15** |
| **Tabellen der Datenbank** | 28 | **28** |
| **Austauschformat** | 16 | **16** |
| **Rückbauten** | 1017 | **1008** *(+8, −17)* |

---

## Wo die Runde von ihrem eigenen Vorschlag abweicht

| | |
|---|---|
| **Strang 2 setzt den Platzhalter nur an zwei von fünf Stellen ein** | *begründet oben: „Diesen `{entryOne}`" ist der deutsche Artikel-Fehler und damit derselbe wie die türkische Endung. An den drei übrigen Stellen fällt das Wort ersatzlos weg* |
| **Siebzehn Rückbauten sind gelöscht und nicht umgedreht** | *Stolperstein 74 verlangt „umdrehen statt löschen" — umdrehen lässt sich aber nur ein Gegenstand, den es gibt. Was sie belegt haben, steht als Absatz in `app.js` bei `statusEffective`* |
| **Die Kurzform zeigt das Vokabelwort gar nicht mehr** | *das ist der Preis dafür, dass sie sich nicht sprengen lässt. Das Wort steht im `title` und geht damit an Mauszeiger und Vorleseprogramm* |


---

## Die Gegenproben sind gefahren — 0 STUMM

**ACHT GEGEN DEN GEBAUTEN STAND** *(`git archive HEAD`, drei Nebenspuren)* —
**und alle acht bauen WIEDER EIN, was diese Runde ausgebaut hat.**

| Rückbau | rot | wo |
|---|---|---|
| **1027** *(der Statusfilter folgt wieder der Sortierung)* | **21** | *neun Gruppen — die teuerste der Runde* |
| **1028** *(die Filterzahl misst wieder gegen eine Ruhestellung)* | 6 | *„Und er zählt als EIN gesetzter Filter"* |
| **1029** *(die Zählzeile setzt wieder ein Wort neben die Zahl)* | 11 | *„Die Kurzform trägt kein Vokabelwort"* |
| **1030** *(die Zahl trägt nur noch Farbe, kein Zeichen)* | 5 | *„Jedes Zeichen ist ein SVG" — **G1*** |
| **1031** *(der Hinweis wird wieder ein Satz)* | **22** | *sieben Gruppen* |
| **1032** *(der türkische Löschbefehl hängt wieder am Platzhalter)* | 4 | *„Kein türkischer Befehl hinter einem Platzhalter"* |
| **1033** *(die türkische Fragepartikel hängt wieder am Platzhalter)* | 3 | *„Kein harmonierendes Anhängsel hinter einem Platzhalter"* |
| **1034** *(das fünfzehnte Vokabelwort steht wieder fest im Satz)* | 8 | *„Kein Vokabelwort steht fest in einem Satz"* |

**0 STUMM · 0 ABGERISSEN.**

> **1027 IST DIE TEUERSTE, und das ist die Sache selbst:** *die Ableitung
> greift in neun Gruppen, von den Favoriten über den Potenzialmodus bis zu den
> Gleichlautsummen. Genau deshalb ließ sie sich nicht „ein bisschen"
> abschalten — sie musste ganz heraus.*

---

## Der Augenschein — echtes Chromium, drei Sprachen

| | Kurzform | `title` |
|---|---|---|
| **de @ 1280 px** | `6 · ⚑1 · ☐1 · ☑1` | „6 Kommentare · 1 Bericht · 2 Aufgaben (1 offen)" |
| **tr @ 390 px** | `6 · ⚑1 · ☐1 · ☑1` | „6 yorum · 1 Rapor · 2 Görev (1 açık)" |
| **en @ 390 px** | `6 · ⚑1 · ☐1 · ☑1` | „6 comments · 1 Report · 2 Tasks (1 open)" |

**Drei SVG-Zeichen, drei `data-kind`-Felder, drei Farben** —
`rgb(255,122,26)` · `rgb(77,157,224)` · `rgb(63,211,154)`. **116 Bildpunkte
breit** *(von 358 nutzbaren am Telefon).* **Keine abgeleitete Pille, kein
Vermerk „folgt der Sortierung", kein Fehler im Serverprotokoll.**

**DER PRÜFSTAND IST GRÜN: 7017 von 7017, kein einziger roter Punkt.**
