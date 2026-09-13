# Änderungsprotokoll 0.31.4 — „Nach einer Zahl die Einzahl, sonst die Mehrzahl"

**Auftrag 0.31.4 · 13. September 2026 · gebaut auf 0.31.3 · MINOR, kein
Schemaanteil am Austauschformat.**

> **FINGERPRINT DIESER RUNDE: `85521c1b`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`85521c1b`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`85521c1b`** |
> | **Aus der laufenden Installation gemeldet** *(Betreiber)* | *steht aus* |

---

## Die Runde löst einen Zielkonflikt auf, den 0.31.3 gemessen hat

**0.31.3 HAT IHN GEMESSEN UND VORGELEGT** *(Fehler und Ideen, Punkt 32; drei
Wege, ein Vorschlag)*. **Der Betreiber hat entschieden, am 13. September 2026:**

> **„Dann machen da so das an den Stellen wo ein Zahl steht das Wort für
> Einzahlig kommt für die anderen der Mehrzlige und dort trage ich dann z. B.
> Ögeler ein"** — *im Wortlaut, wie er es geschrieben hat.*

*Das ist Weg B: ein Platz je Stellung.* **Und die beiden Plätze gab es
schon** — *jedes Vokabelwort hat `…One` und `…Many`. Was fehlte, war nicht ein
Platz, sondern die Auskunft, WELCHEN eine Stelle mit Zahl davor nehmen muss.*

### Die Regel, nachrecherchiert

| Quelle | Befund |
|---|---|
| **TDK** *(Türk Dil Kurumu)* | *„Sayı sıfatının peşinden gelen isim çoğul eki almaz"* — nach einem Zahlwort kein `-ler`/`-lar`; ebenso nach `çok`, `birkaç`, `kaç` |
| **Göksel & Kerslake**, *Turkish: A Comprehensive Grammar* | dieselbe Regel; **Ausnahme** nur bei Eigennamen und geschlossenen Gruppen — *Kırk Haramiler*, *Yedi Cüceler* |
| **Sağ**, *The semantics of Turkish numeral constructions* | *„Turkish numerals strictly reject co-occurrence with plural nouns."* Der nackte Singular ist **zahlneutral** |
| **Unicode CLDR** | *„1 elma", „123 elma" — but when the number is omitted, „elmalar"* |

> ## WARUM DER CODE ES NICHT VON ALLEIN WISSEN KANN — und das ist der Kern der Runde
>
> **`Intl.PluralRules('tr').select(n)` WÄHLT NACH DEM WERT VON `n`.** *Die
> türkische Regel hängt nicht am Wert, sondern an der **Stellung**: steht ein
> Zahlwort davor oder nicht.* `select(3)` gibt `other` — **als CLDR-Kategorie
> richtig, im Türkischen aber kein Auftrag, `-lar` anzuhängen.**
>
> **DIE AUSKUNFT, DIE DER CODE BRÄUCHTE, SIEHT DIE SCHNITTSTELLE NIE.**

---

## Der Mechanismus: die Datei sagt es, nicht der Code

**DAS IST KEINE ERFINDUNG DIESER RUNDE.** *Der Kommentar an `plural()` sagt es
seit 0.24.0 selbst:* **„Der Vergleich wäre die deutsche Regel, festgeschrieben
im Code; die Regel gehört aber der Sprache (Konzept 4.3)."**

```json
"_afterNumber": "one",      // tr.json  — hinter einer Zahl die Einzahl
"_afterNumber": "plural",   // de.json, en.json — die Zahl wählt, wie bisher
```

```js
function counted(n, one, other) {
  return AFTER_NUMBER === 'one' ? one : plural(n, one, other);
}
```

| | |
|---|---|
| **Wo `counted()` gilt** | **acht Stellen** — *die fünf Vokabelzähler (`vThing`, `vTime`, `vReport`, `vTask`, `vRating`), die beiden `countWord`-Helfer und `entry.added`* |
| **Wo `plural()` bleibt** | **zwei** — *der Rückfall in `counted()` selbst und das **Verb** in `card.aloneOverLimit` („passt"/„passen"). Die Stellungsregel gilt dem Nomen hinter der Zahl, nicht dem Verb* |
| **Fehlt der Schlüssel** | **`plural`** — *das Verhalten von vorher. 0.24.0 hat versprochen: „wer eine weitere Datei hineinlegt, hat eine Sprache mehr — ohne eine Zeile Programm." Eine Datei, die an einem fehlenden `_afterNumber` zerbräche, nähme das zurück* |

> **`entry.added` IST BEIM BAUEN ÜBERSEHEN WORDEN**, *und der Wächter hat sie
> gefunden:* `{count} {what} eklendi` *setzt das Wort unmittelbar hinter die
> Zahl.* **Die Zeile, die sie gefunden hat, steht als Zusage 5 im Prüfstand —
> und Gegenprobe 1004 hält sie.**

---

## Deutsch und Englisch: es kann sich nicht negativ auswirken

> **DIE FORDERUNG DES BETREIBERS, im Wortlaut:** *„Das darf sich bei deutsch und
> englisch nicht negativ auswirken."*

**SIE IST DURCH DIE BAUFORM ERFÜLLT UND NICHT DURCH SORGFALT.** *Bei
`_afterNumber: "plural"` fällt `counted()` auf `plural()` zurück — derselbe Ruf,
dieselben Argumente, dasselbe Wort. Für Deutsch und Englisch ist die Runde ein
anderer Weg zu demselben Ergebnis.*

**NACHGESEHEN UND NICHT BEHAUPTET.** *Der zweite Gang der Gleichlautprobe sagt,
welche Wörter den Bildschirm verlassen und welche dazukommen:*

```
de/one    raus 1 · rein 6
   RAUS  plural(finished,
   REIN  AFTER_NUMBER 'plural'; counted(n, other); data._afterNumber counted(finished,
```

**AUSSCHLIESSLICH QUELLTEXTWÖRTER. KEIN EINZIGER BILDSCHIRMTEXT.** *Dasselbe
Bild bei `de/other`, `en/one` und `en/other`.*

| | |
|---|---|
| **Die sechs Prüfsummen sind trotzdem andere** | *die Probe liest den **ganzen** Quelltext, und diese Runde baut in `app.js`. Sie warnt davor selbst: „SIE SIEHT AUCH QUELLTEXT … das ist kein Mangel, sondern der Preis dafür, dass sie NICHT unterscheiden kann, was ein Mensch sieht"* |
| **Die Werte halten zwei ältere Wachen** | *die **Wortlautprobe** hält `de.json` gegen die Abnahme von 0681d42, der **Vergleichsstand** `tools/englisch-0312.json` hält alle englischen Werte Zeichen für Zeichen* |
| **Und der Prüfstand sagt es namentlich** | *Zusage 1 der neuen Gruppe prüft, dass `de` und `en` `plural` sagen — und dass die zehn deutschen Vokabelformen Zeichen für Zeichen dastehen* |

---

## Was sich am Bildschirm ändert

### Hinter einer Zahl — vorher falsch, jetzt richtig

| vorher | jetzt |
|---|---|
| „3 **yorumlar**" | **„3 yorum"** |
| „3 **dosyalar**" | **„3 dosya"** |
| „3 **bağlantılar**" | **„3 bağlantı"** |
| „3 **Fotoğraflar**" | **„3 Fotoğraf"** |
| „3 **Videolar**" | **„3 Video"** |
| „3 Öğe" *(richtig, aber um den Preis der Mehrzahl)* | **„3 Öğe"** *(richtig, und ohne Preis)* |

### Ohne Zahl — vorher schwach, jetzt richtig

| vorher | jetzt |
|---|---|
| „Açık **Görev**" | **„Açık Görevler"** |
| „Kategorisiz **Öğe**" | **„Kategorisiz Öğeler"** |
| „**TEST GÜNÜ**" *(über der Liste)* | **„TEST GÜNLERİ"** |
| „Yeni yorumlar ve **Değerlendirme**" | **„… ve Değerlendirmeler"** |
| „Silinen **Öğe** burada … kalır" | **„Silinen Öğeler burada … kalır"** |

**Die fünf Vokabelvorgaben:** `Öğeler` · `Test günleri` · `Raporlar` ·
`Görevler` · `Değerlendirmeler`.

### Und fünf Sätze bekommen ausdrücklich die EINZAHL

**AUCH OHNE ZAHL DAVOR** — *weil ihre Grammatik sie verlangt:*

| Schlüssel | Grund |
|---|---|
| `card.blocksHint` · `card.orderAppliesNote` | **`her`** verlangt im Türkischen immer die Einzahl — *„her öğeler için" ist falsch* |
| `card.criteriaAdminHint` · `card.criteriaOrderHint` | **`sayısı`** („die Zahl der …") verlangt die Einzahl |
| `list.showAll` | **Substantivkette** — das erste Glied steht in der Einzahl |

> **UND DREI HANDGRIFFE AUS 0.31.3 FALLEN WIEDER WEG** — *sie waren die Krücke,
> die dieser Mechanismus ersetzt:* `list.openTasks`, `list.noCategory` *(das
> angehängte „listesi")* *und die heruntergezogene erste Hälfte von*
> `list.newCommentsHint`. **Eine Krücke, die man wegnehmen kann, war eine.**

---

## Die Zusage, die sich dafür öffnen musste

**ZUSAGE 3 VON 0.31.3 — „jeder Platzhalter des deutschen Satzes steht auch im
türkischen" — HÄTTE DIE FÜNF SÄTZE ROT GEMACHT.** *Deutsch schreibt „für alle
{entryMany}", Türkisch muss „her {entryOne} için" schreiben.*

> **SIE IST UM EINEN SPALT GEÖFFNET:** *die beiden Formen **eines**
> Vokabelworts gelten als derselbe Platz.* **Alles andere bleibt: ein `{bytes}`,
> das fehlt, ist weiter ein roter Punkt — und `{entryOne}` gegen `{dayMany}`
> auch.** *Eine eigene Zeile prüft, dass der Falter nur faltet, was
> zusammengehört.*
>
> *Dasselbe an der zweiten Stelle: die Platzhalterprobe der „sieben Wächter der
> Sprachdatei" (0.24.0) faltet seit dieser Runde ebenso.*

---

## Drei Wächter haben sich gedreht — und keiner ist gelöscht

| Wächter | stand da | steht jetzt da |
|---|---|---|
| **0.24.4, T2** | *„die fünf Vokabelpaare tragen auf Türkisch **dasselbe** Wort"* | *„… **verschiedene** Wörter"* — **und der alte Grund steht im Kommentar weiter**: er war richtig, solange ein Platz zwei Stellungen tragen musste |
| **0.31.3, Zusage 9** | dasselbe | dasselbe, **und die Messung der 24 Stellen bleibt stehen** — *sie war der Beweis, dass es den Zielkonflikt GIBT. Er ist nicht verschwunden, er ist gelöst* |
| **0.31.3, Zusage 10** *(zweite Hälfte)* | *„die fünf Paare tragen ihre Mehrzahl noch — Punkt 32, dem Betreiber vorgelegt"* | *„… — seit 0.31.4 an der richtigen Stelle gelesen"* |

> **KEINE DER DREI IST WEGGENOMMEN WORDEN, und das ist der Punkt:** *wer
> `counted()` wieder durch `plural()` ersetzte, bräche alle drei — und die
> Kommentare erzählen, warum sie einmal andersherum standen.*

---

---

## Die Probe liest den BILDSCHIRM und nicht die Datei

**DIE FRAGE DES AUFTRAGS WAR F8:** *„Woran zeigt sich, dass es wirklich stimmt?
Am gerenderten Bildschirmtext und nicht an der Datei."* **Sie musste so gestellt
werden, denn der Befund von 0.31.3 stand in KEINER Datei:** *„3 yorumlar" gibt es
dort nicht — `countWord` setzt Zahl und Wort aus zwei Schlüsseln zusammen, und
erst am Bildschirm stehen sie nebeneinander.*

**DIE PROBE LÄSST `app.js` WIRKLICH LAUFEN** — *in einem Fenster des Prüfstands,
mit der echten `tr.json`, und sie FÜLLT die Zählerstellen aus.*

| | |
|---|---|
| **Wie viele Stellen** | **dreizehn** — *die fünf Vokabelzähler, die sechs Paare der beiden Zählerhelfer und `entry.added` zweimal (Foto und Video)* |
| **Mit welchen Zahlen** | **0 · 1 · 2 · 3 · 11 · 21 · 100** — *zusammen **91 gerenderte Sätze**. Die Zahlen stehen da, weil der Fehler am Wert hängt: `Intl.PluralRules('tr')` sagt bei 1 `one` und sonst `other`. Eine Probe, die nur mit 1 rechnete, wäre grün und belegte das Gegenteil* |
| **Woher die Paare kommen** | **aus dem Quelltext**, nicht aus einer Liste im Prüfstand — *gelesen wird `countWord(` und nicht `counted(`, weil der Helfer die beiden Schlüssel unter seinen PARAMETERNAMEN weitergibt* |
| **Woher die Wörter kommen** | **aus der Sprachdatei** — *gefragt wird über `eval` IM Fenster, denn `vThing` und `V` stehen auf oberster Ebene als `const` und `let` und liegen damit nicht am `window`* |

**WAS SIE LIEST, bei `n = 3`:**

| Stelle | am Bildschirm |
|---|---|
| `vThing` · `vTime` | **3 Öğe** · **3 Test günü** |
| `vReport` · `vTask` · `vRating` | **3 Rapor** · **3 Görev** · **3 Değerlendirme** |
| `dialog.comment` · `dialog.link` · `dialog.file` | **3 yorum** · **3 bağlantı** · **3 dosya** |
| `list.photo` · `list.video` | **3 Fotoğraf** · **3 Video** |
| `entry.added` | **3 Fotoğraf eklendi** · **3 Video eklendi** |

> **UND DIE GEGENPROBE STEHT IM SELBEN FENSTER:** *derselbe Satz, dasselbe
> Wortpaar, dieselbe Zahl — nur mit `plural()` statt `counted()`.* **Er liest
> „3 yorumlar", und der Leser fällt darauf.** *Das ist zugleich der Beleg, DASS
> `counted()` der Unterschied ist und nicht die Sprachdatei.*

**DIE GEGENRICHTUNG, ebenfalls am Bildschirm:** *„Açık Görevler", „Kategorisiz
Öğeler", „Yeni yorumlar ve Değerlendirmeler" — und das angehängte „listesi" ist
weg.* **Ohne diese Zeile wäre die Runde auch dann grün, wenn jemand alle fünf
Mehrzahlen aus `tr.json` löschte.**

> **DIE SELBSTPROBE HAT SICH IM ERSTEN LAUF BEZAHLT.** *Sie fragt, ob das
> Fenster wirklich auf Türkisch steht und `_afterNumber` gelesen hat — und war
> rot:* **„AFTER_NUMBER one · Eintrag / Einträge".** *Die Sätze kamen aus
> `tr.json`, die Vokabelwörter aus `de.json`.*
>
> **DAS IST KEINE LÜCKE IN `app.js`, SONDERN SEINE BAUFORM:** *`loadLanguages()`
> holt zuerst die **Vorgabesprache der Installation**, und `V = {
> ...vocabularyDefault(), ...V }` lässt stehen, was schon drinsteht — „der Satz
> des Servers wiegt schwerer als die Vorgabe" (0.24.0).* **Im Betrieb
> überschreibt `/api/settings` ihn mit `vocabulary`** — *dem Satz für die
> Sprache des Lesers, den `vocabulary()` in `server.js` aus der Sprachdatei
> ableitet, wenn nichts eingetragen ist.* **Genau das gibt die Prüflage jetzt
> mit, abgeleitet und nicht getippt.**
>
> **UND DIE ZEILE DARUNTER WAR DABEI GRÜN** — *„Açık Aufgaben" enthält keine
> Mehrzahl auf `-ler`.* **Eine Probe ohne ihre Selbstprobe hätte hier grün
> gemeldet und nichts belegt** *(Stolperstein 81).*

---

## Die Zusagen und ihre Gegenproben

**ELF ZUSAGEN, SECHS NEUE GEGENPROBEN (1002 bis 1007)** — *und drei vorhandene
sind nachgezogen.*

| # | Zusage | Gegenprobe |
|---|---|---|
| **1** | Deutsch und Englisch unangetastet | **1002** *(Deutsch bekommt die türkische Stellungsregel — und keine deutsche Zeile des Prüfstands sähe es)* |
| **2** | jede der drei Dateien nennt `_afterNumber` | **1003** *(Türkisch verliert seine Stellungsregel)* |
| **3** | eine Datei ohne den Schlüssel fällt auf `plural` | *am Quelltext geprüft; 1003 hält die Gegenrichtung* |
| **4 · 6** | die fünf Vokabelpaare tragen verschiedene Wörter, die Mehrzahl endet auf `-ler`/`-lar` | **997** — *gedreht: es nimmt die Mehrzahl jetzt WEG, statt sie einzubauen* |
| **5** | hinter einer Zahl steht am Bildschirm keine Mehrzahl | **1004** *(eine Zählerstelle greift wieder zu `plural()`)* · **689** *(nachgezogen)* |
| **7** | `counted()` liest die Datei und nicht die Locale | **1005** *(eine Liste von Sprachen im Code — die billige Lösung, die L1 verbietet)* |
| **8** | 1198 Schlüssel in allen drei Dateien | *die sieben Wächter der Sprachdatei (0.24.0)* |
| **9** | die zwölf Sätze aus 0.24.4 sind unverändert | *nachgesehen und nicht nachgezogen (L4)* |
| **10** | ein Platz wechselt nur innerhalb SEINES Paares | *eigene Zeile in der Gruppe* |
| **11** | `her` und `sayısı` stehen mit der Einzahlform | **1006** *(ein Satz mit `her` fällt zurück)* · **994** *(nachgezogen)* |
| **5 am Bildschirm** | die Krücke „listesi" ist weg | **1007** — *keine Verbotsliste und kein Platzhalter fängt sie* |
| **5, fünfter Schritt** | die Vorschau der Vokabelkarte | **1008** *(die feste Zahl kommt zurück)* · **1009** *(sie fragt den Leser statt der gezeigten Sprache)* |
| **7, zweite Hälfte** | der Server nennt je Sprache ihre Regel | *am laufenden Server gefahren; 1009 hält die Gegenrichtung im Browser* |

> **979 → 992 → 1000.** *Acht neue, und drei vorhandene sind nachgezogen:*
> **689** *(`plural` wurde `counted`),* **994** *(der Satz trägt jetzt die
> Einzahlform) und* **997**, *das sich mit seiner Zusage GEDREHT hat.*
>
> **DREI DER ACHT HAT DER AUGENSCHEIN VERDIENT und kein Muster über eine
> Datei** — *1007, 1008, 1009.* **Das ist die Lehre dieser Runde:** *„Açık
> {taskMany} listesi" verstößt gegen keine Verbotsliste, trägt jeden Platzhalter
> des deutschen Satzes und liest sich sauber; `<span>7 ${esc(sm)}</span>` ist
> eine Zahl in einem String. Falsch sind beide erst am fertigen Satz — und den
> liest nur, wer ihn rendert.*

---

## Der Augenschein — und der Fund, den vier Wächter nicht sehen konnten

**EIN ECHTER BROWSER, EINE ECHTE INSTANZ, DIE OBERFLÄCHE AUF `tr-TR`.** *Liste,
Detailansicht, Anmeldeseite und alle fünf Abschnitte der Einstellungen —
durchgesehen auf offene Platzhalter, fehlende Schlüssel (`⟦…⟧`), Fehler in der
Browserkonsole* **und, neu in dieser Runde, auf jede Zahl mit einem Wort auf
`-ler`/`-lar` dahinter.**

> **UND ER HAT ETWAS GEFUNDEN — in der Karte „Vokabular", im Abschnitt
> „Veriler":**
>
> ```
> ÖNİZLEME
> + Öğe      Öğe silinsin mi?      7 Öğeler
> Test edildi / Test edilmedi
> 1 Test günü      3 Test günleri
> Rapor olarak işaretle      2 Raporlar
> Görev olarak işaretle      4 Görevler
> …                          2 Değerlendirmeler
> ```
>
> **FÜNF STELLEN, und keiner der vier Schritte von Zusage 5 konnte sie sehen.**
> *In `drawPreview()` steht die Zahl als **String** unmittelbar vor der
> Mehrzahlform —* `<span>7 ${esc(sm)}</span>`. *Kein `plural()`, kein
> `counted()`, kein Vokabelzähler: nichts, wonach ein Muster gesucht hätte.*
>
> **UND ES IST DIE SCHLIMMSTE STELLE, AN DER DAS STEHEN KANN:** *es ist die
> Karte, in die der Eigentümer seine eigenen Wörter einträgt.* **Sie lehrte das
> Gegenteil der Regel, die diese Runde gebaut hat** — *wer „Öğeler" eintippt,
> las dort „7 Öğeler" und schloss daraus, sein Mehrzahlwort erscheine hinter
> Zahlen. Es erscheint dort nie.*

### Die Berichtigung — und mein eigener Fehlgriff auf dem Weg dahin

**DER ERSTE BAU HAT DIE ZAHL UNBEDINGT GESTRICHEN.** *Das war falsch, und der
zweite Gang der Gleichlautprobe hat es gemeldet:* **damit verlor die DEUTSCHE
Vorschau ihr „7 Einträge".** *Die Forderung des Betreibers war ausdrücklich
„das darf sich bei deutsch und englisch nicht negativ auswirken" — und genau
das wäre es gewesen.*

**DIE VORSCHAU FRAGT SEITHER DIE STELLUNGSREGEL DER GEZEIGTEN SPRACHE**, *nicht
die des Lesers und nicht keine:*

```js
const many = (n, word) =>
  (afterNumberOf(namesLanguage()) === 'one' ? esc(word) : `${n} ${esc(word)}`);
```

| | |
|---|---|
| **Warum nicht `AFTER_NUMBER`?** | *Weil die Karte die Wörter der Sprache zeigt, die gerade **gepflegt** wird, und nicht die des Bildschirms.* **Ein Blick auf `AFTER_NUMBER` hätte ausgerechnet den Fall des Betreibers verfehlt:** *er liest Deutsch und trägt Türkisch ein — und die Vorschau stünde wieder auf „7 Öğeler"* |
| **Woher die Regel kommt** | **Aus der Sprachtafel des Servers.** *`languageEntries()` trägt seit dieser Runde neben Name, Vorgabe und Vorrat auch `afterNumber` — abgeleitet aus `_afterNumber` der Datei, nicht aus einer Liste im Quelltext. Das ist L1 ein drittes Mal* |
| **Was seine Zahl behält** | **„1 Test günü"** — *die Einzahl hinter einer Zahl ist in jeder Sprache richtig und ist genau die Stelle, um die es dieser Runde ging* |

**AM ECHTEN BROWSER NACHGESEHEN, im Fall des Betreibers — Leser Deutsch,
gepflegt Türkçe, ein Fenster, ein Klick auf die Pille:**

| gezeigte Sprache | die Vorschau |
|---|---|
| **Deutsch** | `+ Eintrag · Eintrag löschen? ·` **`7 Einträge`** `· 1 Testtag ·` **`3 Testtage`** `· 2 Berichte · 4 Aufgaben · 2 Bewertungen` |
| **Türkçe** | `+ Öğe · Öğe löschen? ·` **`Öğeler`** `· 1 Test günü ·` **`Test günleri`** `· Raporlar · Görevler · Değerlendirmeler` |

> *Dieselbe Karte, dasselbe Fenster, derselbe Leser — zwei Regeln, und jede ist
> die ihrer Sprache.* **Deutsch ist Zeichen für Zeichen das von vorher.**

> **DER WÄCHTER DAZU IST ZUSAGE 5, FÜNFTER SCHRITT**, *und er liest nicht die
> NAMEN der Stellen, sondern ihre Zuweisung:* `const sm = w.entryMany.trim() ||
> e.entryMany` *bindet `sm` an ein `…Many`-Feld.* **Wer die Namen umbenennt,
> wird mitgenommen; wer ein sechstes Mehrzahlfeld hinzufügt, auch.** *Dazu:
> jede der fünf geht durch `many()`, `many()` fragt `namesLanguage()` und nicht
> `AFTER_NUMBER`, die Einzahl behält ihre Zahl — und der Server nennt in seiner
> Sprachtafel je Sprache ihre Regel (Zusage 7, zweite Hälfte, am laufenden
> Server gefahren).*
>
> **ZWEI GEGENPROBEN:** **1008** *setzt die feste Zahl zurück,* **1009** *lässt
> die Vorschau die Sprache des LESERS fragen statt der gezeigten* — *der feinere
> der beiden, weil er für einen türkischen Leser gar nichts ändert.*

**NACH DER BERICHTIGUNG: KEIN BEFUND.** *Die Tafel aller Zahl-Wort-Stellen am
türkischen Bildschirm trägt genau zwei Vokabelstellen — **„3 Öğe"** und
**„3 yorum"** —, und die vier Mehrzahlformen stehen ohne Zahl da.*

> **ZWEI VON SIEBEN ERSTEN BEFUNDEN WAREN MEINE EIGENEN FEHLALARME**, *und sie
> gehören ins Protokoll:* **mein Leser las über den Zeilenumbruch hinweg.** *In
> der Karte „Sayılar" stehen Beschriftung und Wert untereinander — „Fotoğraflar"
> / „0 · 0 B" —, und ein `\s+` machte daraus „0 Fotoğraflar".* **Gesucht ist die
> Nachbarschaft IM SATZ**, *also Leerzeichen ohne Umbruch. Drei Fehlalarme sind
> damit weggefallen, vier Befunde blieben — und die waren echt.*

---

## Der Prüflauf

**DER PRÜFSTAND IST GRÜN: 6990 von 6990, kein einziger roter Punkt.** *0.31.3
stand bei 6951; die Runde legt 39 Prüfungen dazu.*

> **VIER ROTE PUNKTE HABEN DEN WEG DAHIN GEMACHT, und jeder war meiner:**
>
> | | |
> |---|---|
> | **`entry.added` war übersehen** | *Die Zeile, die jede Zählerstelle zählt, hat es gemeldet: sieben Rufe von `counted()` statt acht.* **Gegenprobe 1004 hält sie** |
> | **Die Selbstprobe der neuen Bildschirmprobe** | *„AFTER_NUMBER one · Eintrag / Einträge" — die Sätze türkisch, die Vokabelwörter deutsch.* **Die Prüflage muss den Vokabelsatz des Lesers mitgeben, so wie der Server es tut**, *und die Zeile darunter war dabei grün: deutsche Mehrzahlen enden nicht auf `-ler`* |
> | **Mein Wortgebrauch** | *Das Wort für eine Zeichenfolge heißt im Haus* **`String`** — *der Wächter über die Fachwörter hat drei Kommentare gemeldet. Und beim Berichtigen habe ich seine eigene Vorschrift mitersetzt* (`['Zeichenkette', 'String']` *wurde* `['String', 'String']`, *und damit war die halbe Anwendung verboten*)*: genau davor warnt der Kommentar an dieser Liste.* **Dieses Papier steht unter demselben Wächter — das gesuchte Wort darf hier nur in Backticks vorkommen** |
> | **Die sechs Prüfsummen** | *zweimal — die Runde baut in `public/app.js`, und die Gleichlautprobe liest den ganzen Quelltext* |

---

## Die Gegenproben sind gefahren — 0 STUMM

**ZWÖLF GEGEN DEN GEBAUTEN STAND** *(`git archive HEAD`, vier Nebenspuren)* —
**die acht neuen und die vier, die diese Runde anfasst.** *Jede hat ihre
erwartete Gruppe rot gemacht; keine blieb stumm.*

| Rückbau | rot | erwartete Gruppe |
|---|---|---|
| **689** *(`plural` statt `counted`)* | 11 | *Die sieben Wächter der Sprachdatei — 0.24.0* |
| **793** *(das Anführungszeichen bleibt offen)* | 7 | *Ein Satz, den jede Sprache selbst schneidet — 0.25.4* |
| **994** *(der Satz wird wieder länger)* | 4 | *Türkisch sitzt — 0.31.3* |
| **997** *(das Vokabelwort verliert seine Mehrzahl)* | 8 | *Türkisch sitzt — 0.31.3* |
| **1002** *(Deutsch bekommt die türkische Regel)* | **24** | *Nach einer Zahl die Einzahl — 0.31.4* |
| **1003** *(Türkisch verliert sie)* | 9 | *dieselbe* |
| **1004** *(eine Zählerstelle greift zu `plural()`)* | 11 | *dieselbe* |
| **1005** *(`counted()` liest die Locale)* | 10 | *dieselbe* |
| **1006** *(ein Satz mit `her` fällt zurück)* | 9 | *dieselbe* |
| **1007** *(die Krücke „listesi" kommt zurück)* | 6 | *dieselbe* |
| **1008** *(die Zahl kommt vor die Mehrzahl der Vorschau)* | 10 | *dieselbe* |
| **1009** *(die Vorschau fragt den Leser)* | 7 | *dieselbe* |

> **1002 IST DER TEUERSTE, und das ist die Sache selbst:** *wer Deutsch die
> türkische Stellungsregel gibt, macht aus „3 Einträge" ein „3 Eintrag" —* **24
> rote Punkte**, *und keine einzige deutsche Zeile des Prüfstands prüft Werte
> dafür: sie prüfen Wortlaute, nicht Stellungen.* **Der Schutz ist EIN Wort in
> der Datei, und dieser Rückbau ist der Beleg, dass es bewacht wird.**
>
> **1009 IST DER FEINSTE:** *er lässt die Vorschau die Sprache des LESERS fragen
> statt der gezeigten.* **Für einen türkischen Leser ändert er gar nichts** —
> *falsch wird er genau in dem Fall, für den die Karte gebaut ist. Sieben rote
> Punkte, und einer davon nennt ihn beim Namen.*

> ### UND DER LAUF HAT EINEN FEHLER VON MIR GEFUNDEN, der keiner Gegenprobe gehört
>
> **IN JEDER DER ZWÖLF STAND DERSELBE ROTE PUNKT:** *„Die Dokumente ebenso" aus
> der Gruppe „Der Sprachwächter".* **Zwölfmal dasselbe heißt: es liegt nicht an
> den Rückbauten, sondern am gebauten Stand** — *und so war es.*
>
> *Der Wächter über die Fachwörter liest nicht nur den Quelltext, sondern auch
> die Papiere.* **Und dieses Papier erklärt genau diesen Wächter** — *es nannte
> das verbotene Wort in Anführungszeichen, um zu erzählen, dass es verboten
> ist.* **In Backticks hätte er es stehen lassen;** *in Prosa nicht, und zu
> Recht: er kann nicht unterscheiden, ob ein Wort benutzt oder besprochen
> wird.*
>
> *Berichtigt, und der Satz steht jetzt so da, dass er dasselbe sagt, ohne das
> Wort zu benutzen.* **Jede der zwölf Zahlen oben trägt diesen einen Punkt
> noch mit** — *ein Lauf danach zeigte je einen weniger. Die Zahlen sind
> gemessen und nicht gerechnet, deshalb bleiben sie stehen.*
>
> **DIE LEHRE IST DIE VON STOLPERSTEIN 47, eine Ebene höher:** *ein Papier über
> einen Wächter steht unter diesem Wächter. Der Prüfstand hat es bemerkt, weil
> zwölf unabhängige Läufe dasselbe sagten.*

---

## Was ausdrücklich NICHT gebaut wurde

- **Kein fünfzehnter Vokabelplatz.** *Punkt 19 bleibt abgelehnt — und er ist auch nicht nötig: die beiden Plätze gab es schon.*
- **Keine Liste von Sprachen im Code.** *Gegenprobe 1005 baut sie ein und wird rot.*
- **Kein deutscher und kein englischer Wert.**
- **Die zwölf Sätze, die 0.24.4 um die Einzahl herum gebaut hat**, sind nachgesehen und **nicht** umgeschrieben *(L4)*.
