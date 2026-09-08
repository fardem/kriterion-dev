# Änderungsprotokoll 0.24.4 — „Türkisch, und die Kacheln sagen die Wahrheit"

**Stufe 3 der Mehrsprachigkeit und das Ende der 24er-Reihe · 8. September 2026
· gebaut auf 0.24.3 (`ceb8d26a`).**

**Diese Runde bringt die dritte Sprachdatei — und repariert neun Befunde: die
acht aus dem Auftrag und einen neunten, der beim Bauen aufgefallen ist.** Der
schwerste heißt: *was für eine Sprache eingetragen worden ist, erscheint in
dieser Sprache nicht.* **Zwei hat niemand gemeldet** — der achte ist beim
Messen für die türkische Suche aufgefallen und steht seit 0.24.3 in der
Auslieferung, der neunte beim Bauen dieser Runde.

***Die Befunde standen vor Türkisch, und zwar nicht aus Ordnungsliebe:*** solange
die Kachel „Vokabular" beim Umschalten die falsche Sprache zeigt und in die
falsche schreibt, ließen sich vierzehn türkische Wörter gar nicht pflegen.

---

## Die Versionsnummer — und das Ende der benannten Abweichung

**0.24.4 ist ein PATCH-Sprung, und die Runde bringt eine Funktion** (die
Installation spricht danach Türkisch). Nach Regel 5.1 des Projektstands
gehörte sie auf 0.25.0.

**Die benannte Abweichung aus 0.24.3 deckt sie ausdrücklich mit ab:** die
24er-Reihe ist *ein* Vorhaben in fünf Schritten — 0.24.0 die Maschine, 0.24.1
die englischen Namen, 0.24.2 die gespeicherten Formen, 0.24.3 die zweite
Sprache, **0.24.4 die dritte**. *Eine Nummer, die dieses Vorhaben im letzten
Schritt teilte, sagte weniger über die Runde aus als eine, die es
zusammenhält.*

> **UND HIER ENDET SIE.** Mit dieser Runde ist die 24er-Reihe fertig. **Ab
> 0.25.0 gilt SemVer wieder ohne Ausnahme** — wer eine Funktion baut, nimmt
> eine MINOR-Nummer. *Die Abweichung steht im Projektstand, Abschnitt 5.1, und
> trägt seit dieser Runde ihr Ende.*

---

## Die zehn Fragen — und was ihre Antworten gekostet haben

**Alle zehn Fragen des Auftrags standen im Papier, bevor eine Zeile Code
entstand — beantwortet hat sie aber erst der Betreiber, und zwar am
8. September 2026, nachdem gebaut war.** *Das ist ein Befund an dieser Runde
und keine Nebensache: **zwei der zehn Antworten fielen anders aus als der
Vorschlag**, und beide haben Arbeit gekostet, die vorher nicht nötig gewesen
wäre. Die Regel dazu steht seit dieser Runde im Projektstand, Abschnitt 11:
**die Fragen werden mit dem Betreiber durchgegangen, bevor gebaut wird — ein
Vorschlag ist keine Antwort.*** **Dazu eine dritte, die im Bauen anders
ausfiel als vermutet**, und zwar F6 — nicht in der Entscheidung, sondern in
der Ursache:

| | Frage | Entscheidung |
|---|---|---|
| **F1** | Bleibt es bei 0.24.4? | **Ja** — und die Abweichung endet mit dieser Runde |
| **F2** | Wer liest Türkisch gegen? | **der Betreiber selbst** — *„das bin ich", 8. September 2026*; siehe den Kasten unten |
| **F3** | `Parola` oder `Şifre`? | **`Parola`** als Vorschlag — die Entscheidung gehört dem Betreiber, und der ist der Leser *(F2)* |
| **F4** | Türkisch in den Vorrat? | **alles im Vorrat**, wie bisher |
| **F5** | Welche Faltung gilt für die Suche? | **eine, ohne Sprache, auf beiden Seiten** |
| **F6** | Umschalter reparieren oder umbauen? | **reparieren** — *und die Ursache lag woanders, siehe B1* |
| **F7** | Papierkorb: Kachel oder Detailansicht? | **erst die Zeile** *(Schritt 1)* |
| **F8** | Leeres Zeichen: eigenes oder gar keines? | **gar keines** |
| **F9** | Anlegen in „Kategorien"/„Tags": welche Sprache? | **immer die Grundzeile** |
| **F10** | Alle acht Befunde? | **alle acht** — *und ein neunter, der beim Bauen dazukam* |

> ## DER LESER IST DER BETREIBER (F2, entschieden am 8. September 2026)
>
> **Die Regel des Konzepts lautet: *ohne einen Leser, der Türkisch als Sprache
> und nicht als Wörterbuch kennt, geht die Datei nicht heraus*** (S3.4, E14).
> **Auf die Frage F2 des Auftrags hat der Betreiber geantwortet: *„das bin
> ich".*** *Damit steht Türkisch auf demselben Leser wie Englisch bei 0.24.3
> (dort Frage F5) — die Regel ist erfüllt, und die benannte Abweichung, die in
> der ersten Fassung dieses Papiers stand, gibt es nicht.*
>
> **Was das für die Datei heißt:** `tr.json` ist gebaut, geprüft, gefahren und
> am Bildschirm gesehen; das Wörterbuch daneben ist der **Vorschlag**, den der
> Leser durchgeht. ***Was Claude leisten kann, ist das Wörterbuch, die fünf
> Regeln und ihre Proben; ob ein Satz sich türkisch LIEST, sagt nur jemand,
> der die Sprache spricht.***
>
> **Zwei Stellen gehören dabei zuerst angesehen:** `Parola` gegen `Şifre` an
> der Anmeldemaske *(F3)* und `Öğe` für „Eintrag" *(der Zusammenstoß mit
> `Kayıt`, S3.2)*. **Eine dritte stand hier und ist gefahren** — die Länge am
> Telefon *(T4)*, achtzehn Bilder, unten im Abschnitt „Der Augenschein".
> **Eine vierte stand hier und ist entschieden** — die Mehrzahl hinter einer
> Zahl, unten im selben Abschnitt.

---

## Was ein Mensch davon sieht

* **Kriterion spricht Türkisch.** Eine dritte Pille in „Darstellung", eine
  dritte Zeile in der Karte „Sprachen" — sonst nichts. *Die Datei ist
  hineingelegt worden, und mehr war nicht zu tun; das ist die Probe auf die
  Zusage aus 0.24.3.*
* **Die Kachel „Vokabular" sagt die Wahrheit.** In den Feldern steht, was für
  diese Sprache **eingetragen** ist — und sonst nichts. Ein leeres Feld heißt
  „hier ist nichts eingetragen"; was stattdessen am Bildschirm steht, sagen
  der Hinweis darunter und die Probe.
* **Der Hinweis „(Vorgabe: …)" folgt der Kachel** und nicht mehr dem Leser.
* **Die Bildlaufstellung überlebt das Umschalten.** Bei vierzehn Feldern
  hieß das bisher: nach jedem Klick wieder hinunterrollen.
* **Die Suche findet, was sie finden soll** — `İstanbul` als `istanbul` wie als
  `ISTANBUL`, `Iğdır` als `ığdır`. **Und zwei Leser verschiedener Sprache
  bekommen auf dieselbe Eingabe dieselbe Trefferliste.**
* **Am Papierkorb ändert sich am Bildschirm nichts** — die Zeile bleibt bei
  Titel, Löschvermerk, Frist und Größe. *Der Anleger war gebaut und ist auf
  Entscheidung des Betreibers wieder herausgenommen worden; er kommt mit der
  Detailansicht, und die Route trägt ihn schon.*
* **Der Wiederherstellen-Knopf zeigt kein SVG mehr als Text.**
* **„Kategorien" und „Tags" lassen sich in ihrer Karte anlegen** — ein Feld,
  ein Knopf, wie bei den Kriterien daneben.
* **Zwei deutsche Wörter sind aus dem Quelltext verschwunden** — „alle N
  anzeigen" und „N aktiv" standen auf jeder Oberfläche deutsch da.
* **Über „Noch keine Kommentare." steht kein Bildzeichen mehr.**
* **Wer seine eigene Sprache wechselt, wechselt auch die vierzehn Wörter.**
  *Bisher blieben sie in der alten stehen — auf einer englischen Oberfläche
  las man „applies to all Einträge".*

---

## Bauabschnitt 1 — die Befunde, und B1 zuerst von allen

### B1 und B2 — nachgestellt, und die Ursache war eine andere

> **DER VERDACHT DES AUFTRAGS HAT NICHT GETROFFEN — und das ist der Grund,
> warum die Runde zuerst nachgestellt und dann repariert hat.** Der Auftrag
> vermutete, `vocabularyLanguage()` falle auf die Sprache des Lesers zurück
> und der Klick auf die Pille tue nichts. **Nachgestellt in jsdom: der Klick
> tut sehr wohl etwas.** Die Pille wandert, das Feld wechselt, der Rumpf des
> `PUT` nennt die geklickte Sprache. *Ein Verdacht ist keine Ursache.*

**Die Ursache liegt an zwei anderen Stellen, und beide zusammen ergeben genau
das Bild, das der Betreiber gemeldet hat.**

**(1) Der Schreibweg machte aus „nichts eingetragen" ein „eingetragen".**
`PUT /api/settings` setzte für jedes leere Feld die Vorgabe **seiner** Sprache
in die Ablage:

```js
clean[k] = v || fallback[k];      // bis 0.24.3
```

*Für eine Installation mit EINER Sprache war das gleichgültig — die Vorgabe
stand ohnehin da.* **Mit zweien war es der Fehler:** nach einem einzigen
Speichern auf Englisch lagen vierzehn englische Wörter in der Datenbank, die
niemand eingetragen hatte.

**(2) Der Rückfall aus 0.24.3 reichte sie an jeden anderen Leser weiter.** Die
Regel *„lieber ein Wort in der falschen Sprache als gar keines"* war für
**eingetragene** Wörter gedacht; sie bekam jetzt einen vollen Satz aus lauter
Vorgaben zu sehen und trug ihn getreu weiter.

**Nachgestellt am laufenden Server, Zeile für Zeile:**

```
Leser DE, Kachel auf EN, „Entry_eng" eingetragen, gespeichert
ABLAGE:   {"en":{ ...alle vierzehn, zwölf davon englische Vorgaben... }}
Leser DE sieht:  entryOne = Entry_eng · dayOne = Test day · taskMany = Tasks
```

***Das ist der gemeldete Bildschirm:*** die Pille steht auf Deutsch, die
Beschriftungen nennen die deutschen Vorgaben, und in den Feldern stehen die
englischen Werte. **Schalterstellung und Inhalt widersprechen sich — aber der
Schalter war unschuldig.**

**Die Reparatur, in drei Zeilen:**

| wo | was |
|---|---|
| `server.js`, `PUT /api/settings` | ein leeres Feld **fällt heraus** und wird nicht zur Vorgabe; eine Sprache ohne ein einziges Wort fällt ganz aus der Ablage |
| `server.js`, `vocabulary()` | der Rückfall nimmt den ersten Satz, der ein Wort **trägt** — leere werden übergangen |
| `public/app.js`, `vocabularyShown()` | die vierzehn Felder zeigen das **Eingetragene** und nicht mehr den Rückfall |

> **„LEER HEISST VORGABE" GILT WEITER** — nur wird die Vorgabe jetzt beim
> **Lesen** eingesetzt und nicht beim Schreiben festgelegt. *Eine Vorgabe in
> der Ablage ist ein Wort ohne Absender.*

**Und die Karte bekommt drei Tafeln statt einer**, weil sie drei verschiedene
Fragen stellt und keine sich aus den anderen ausrechnen lässt:

| Tafel | beantwortet | liest |
|---|---|---|
| `vocabularies` | was ein Leser dieser Sprache **sähe** (samt Rückfall) | die Probe unter den Feldern |
| `vocabulariesOwn` | was **eingetragen** ist | die vierzehn Felder |
| `vocabularyDefaults` | die **Vorgabe** aus der Sprachdatei | der Hinweis „(Vorgabe: …)" |

**Und eine Klemme ist umgezogen:** `vocabularyLanguage()` klemmt seit dieser
Runde gegen den **Vorrat** (`LANGUAGES`) und nicht mehr gegen die Tafel — *was
gewählt werden darf, sagt der Vorrat, und zwei Klemmen über dieselbe Frage
laufen auseinander.* Es ist dieselbe Zeile, die `namesLanguage()` daneben
schon hatte.

### B3 — die Bildlaufstellung überlebt das Umschalten

`renderSystem()` baut `app.innerHTML` neu; die Seite fällt dabei auf die Höhe
der Ladezeile zusammen, und der Browser zieht auf null nach.

**Repariert als ausdrücklicher Schalter und nicht als Automatik:**
`renderSystem({ keepScroll: true })`. *Wer aus der Übersicht in den
Systembereich geht, will oben anfangen — eine gemerkte Stellung wäre dort ein
Sprung ins Nichts.* Gesetzt wird er von den drei Rufern, die **in derselben
Ansicht** neu zeichnen: die beiden Sprachumschalter und das Speichern des
Vokabulars. *Dieselbe Bauform wie in `autoHeight()`: Stellung merken, neu
bauen, Stellung zurücksetzen.*

### B4 — der Vorgabehinweis folgt der Kachel

`vocabularyDefault()` in `app.js` liest `TEXTS` — die Datei des **Lesers**.
Für eine Sprache, die der Leser gar nicht liest, liegt im Browser keine Datei.
**Die Vorgaben kommen deshalb vom Server**, je Sprache, aus derselben
Ableitung wie dort (`vocabulary.`-Vorsatz). *Wer auf Deutsch liest und
Türkisch pflegt, bekam vorher deutsche Vorgaben unter türkische Felder.*

### B9 — der Sprachwechsel des Lesers nahm das Vokabular nicht mit

> **NICHT AUS DEM AUFTRAG UND NICHT AUS DEM FELD — beim Bauen dieser Runde
> gefunden.** *Ein Befund aus dem Bauen zählt genauso wie einer aus dem
> Betrieb; das sagt der Auftrag über B8, und es gilt hier genauso.*

**Wer in „Darstellung" seine eigene Sprache wechselt, bekam die Oberfläche in
der neuen Sprache und die vierzehn Vokabelwörter in der alten.** Auf einer
englischen Oberfläche stand danach:

```
The order of the blocks and whether they are collapsed applies to all Einträge.
```

**Die Ursache: die Pillenreihe warf die Antwort des Servers weg.**

```js
await api('PUT', '/api/settings', { language: a.code });   // bis 0.24.3
```

*Die Antwort trägt den Satz des Lesers in seiner NEUEN Sprache — sie kommt aus
derselben Anfrage, die die Sprache gesetzt hat.*

**Und `loadLanguages()` richtet es nicht**, obwohl es unmittelbar danach
läuft: `loadLanguage()` legt die Vorgaben der neuen Datei **unter** `V`
(`{ ...vocabularyDefault(), ...V }`), und `V` trägt zu diesem Zeitpunkt schon
alle vierzehn Wörter der alten Sprache. **Ein Rückfall greift nur, wo etwas
fehlt — und hier fehlte nichts.**

**Repariert** durch `takeVocabulary()`, den Helfer, den das Speichern der
Wörter ohnehin brauchte; er steht seither auf Modulebene und hat zwei Rufer.

> **UND DER MOCK MUSSTE MITZIEHEN.** Bis zu dieser Runde antwortete
> `PUT /api/settings` im Prüfstand mit `{ convertImages }` — **damit war der
> Befund im Mock gar nicht nachstellbar** (Stolperstein 90: ein Mock antwortet
> wie der echte Server). Er liefert jetzt für einen Sprachwechsel den Satz der
> neuen Sprache, aus der echten Sprachdatei.

### B8 — eine Faltung für Nadel und Heuhaufen

**Der Befund am Quelltext, gemessen und nicht vermutet:**

| Hälfte | wo | wie, bis 0.24.3 |
|---|---|---|
| **Die Nadel** | `fulltextTerm()` | `toLocaleLowerCase(localeTag(localeOf(req)))` — **mit der Sprache des Lesers** |
| **Der Heuhaufen** | `kkl()`, in SQL eingehängt | `String(s).toLowerCase()` — **ohne jede Sprache** |

**Zwei Regeln für dieselbe Suche.** Mit Deutsch und Englisch fällt es nicht
auf; auf Türkisch sofort, denn `'I'.toLocaleLowerCase('tr')` ist das punktlose
`ı`.

**Repariert als EINE Funktion, in `db.js`, ohne Sprache:**

```js
const searchFold = (s) => (s === null || s === undefined ? ''
  : String(s).toLowerCase().replace(/̇/g, '').replace(/ı/g, 'i'));
db.function('kkl', { deterministic: true }, searchFold);
```

**Die vier i des Lateinischen fallen auf eines** — `I i İ ı` → `i`.
`toLowerCase()` macht aus `İ` ein `i` mit angehängtem U+0307; der fällt weg,
und `ı` wird `i`. *Deutscher und englischer Bestand ändert sich dabei um kein
Zeichen: `ı` und `İ` kommen dort nicht vor.*

**Gemessen an einem Bestand aus `İstanbul`, `Istanbul`, `Işık`, `ışık`,
`Iğdır`, `ığdır`:** neun gewöhnliche Suchfälle, vorher fünf ins Leere, jetzt
keiner — **und dieselbe Trefferliste für einen Leser auf Deutsch wie für einen
auf Türkisch.**

**Zwei Dinge sind mitgezogen:**

* `snippet()` faltet ebenfalls ohne Sprache — der Ausschnitt gehört zur
  Antwort, und die soll für beide Leser dieselbe sein. **Gefaltet wird dort
  Zeichen für Zeichen**, damit die Fundstelle im gefalteten Text an derselben
  Stelle liegt wie im rohen: `İ` fällt auf *ein* Zeichen, `toLowerCase()`
  allein machte zwei daraus. *Stimmt die Länge doch nicht überein, wird gar
  nicht erst gesucht — dann steht der Anfang des Textes da, und das ist die
  Regel, die es dort schon gab.*
* `deterministic` an `kkl()` **ist seit dieser Runde auch verdient.** Bis
  0.24.3 stand die Angabe da, während die andere Hälfte am Leser hing; ein
  Index darüber wäre falsch geworden, sobald jemand umschaltet.

> **`ß` GEGEN `ss` GEHÖRT AUSDRÜCKLICH NICHT DAZU.** „ÜBERGROSS" findet
> „übergroß" heute nicht und nachher auch nicht. Es ist ein eigener Fall, er
> betrifft Deutsch und nicht Türkisch, und er steht als **Punkt 18** im
> Fahrplan. *Beim Messen für B8 mitgefallen und dort eingetragen.*

> **ES IST EIN BESTANDSFEHLER, KEIN NEUER.** Die auseinanderlaufende Faltung
> steht in der ausgelieferten 0.24.3; die zweite Hälfte ist so alt wie
> `kkl()`. *Er steht hier, weil Türkisch ihn sichtbar macht — und weil sich
> die Regel T3 vor ihm nicht prüfen ließ.*

---

## Bauabschnitt 2 — `tr.json`

**Das Wörterbuch zuerst** — `Doku/Woerterbuch_Tuerkisch_0_24_4.md`, geschrieben
und eingecheckt, **bevor der erste Satz übersetzt wurde**. Die Tafel aus dem
Konzept (S3.2) war der Entwurf; das Papier ist das Ergebnis.

**Die Datei: 1209 oberste Schlüssel, dieselbe Liste und dieselbe Reihenfolge
wie `de.json` und `en.json`.** Der Kopf trägt `_locale: "tr-TR"` und
`_name: "Türkçe"`.

> **ZWEI ZAHLEN, UND BEIDE SIND WAHR — und die eine ist eine andere als im
> Auftrag.** Die Datei trägt **1209 oberste Einträge**; flach gerechnet — jede
> Mehrzahlform als eigener Schlüssel *neben* ihrem Träger — sind es **1277**.
> **Der Auftrag nannte 1204 und 1272**, und beide Zahlen waren der Stand von
> 0.24.3: *diese Runde legt **sechs** Schlüssel dazu (B5, B7) und nimmt
> **einen** weg (B6 A).* `1204 + 6 − 1 = 1209`, und `1209 + 68 = 1277`. **Der
> Prüfstand nagelt die flache Zahl fest, das Papier nennt die oberste.**
>
> **Die sechs sind:** `entry.showAllLinks` und `list.filtersActive` *(B5 —
> die beiden festen deutschen Wörter)*, `card.newCategory`, `card.newTag`,
> `card.categoryCreated` und `card.tagCreated` *(B7 — das Anlegefeld)*. **Der
> eine ist `card.restoreIcon`** *(B6 A)*. ***B6 B legt keinen Schlüssel an***
> — die Zeile des Papierkorbs behält ihren Wortlaut, siehe dort.

**Die fünf Regeln und ihre Proben:**

| | Regel | wie sie in der Datei steht | Probe |
|---|---|---|---|
| **T1** | keine Endung an einem Platzhalter | die Sätze sind **passiv** gebaut: `{entryOne} silinsin mi?` — der Nominativ braucht gar keine Endung | drei Vokabelwörter (**Model**, **Kutu**, **Kayıt**), drei Vokale, derselbe Satz bleibt richtig |
| **T2** | nach einer Zahl steht die Einzahl | beide Mehrzahlformen sind gefüllt und tragen dasselbe Nomen — **auch die fünf Vokabelwörter, seit der Entscheidung des Betreibers** | „1 yorum" und „3 yorum" — **kein -ler/-lar hinter einem Zähler**; dazu ein zweiter Wächter auf die fünf Vokabelpaare |
| **T3** | İ und ı | **setzt B8 voraus** | neun Suchfälle, zwei Leser, dieselbe Antwort; Sortierung über `Intl.Collator`: `ılık < irmik < İzmir` |
| **T4** | Länge | **gefahren** — achtzehn Bilder auf 390 × 844 und 1280 × 900, siehe unten | Augenschein, kein Wächter: *ob ein Satz in eine Pille passt, sagt kein Wächter, der Strings vergleicht* |
| **T5** | der Apostroph | die Sätze sind so gebaut, dass weder Titel noch Zahl eine Endung braucht | im Prüfstand als Teil von T1 |

> **T1 STEHT IN DER DATEI ANDERS ALS IM AUFTRAG — und erfüllt dieselbe Regel
> strenger.** Der Auftrag nennt als Beispiel `„{entryOne}" öğesi silinsin mi?`
> — die Endung sitzt an *öğe*, das Wort des Admins steht unberührt davor.
> **Die Datei geht einen Schritt weiter und baut den Satz passiv:**
> `{entryOne} silinsin mi?` — dort braucht überhaupt niemand eine Endung, auch
> *öğe* nicht. *Beide Formen halten T1; die zweite ist kürzer und liest sich
> natürlicher.* **Wo ein zitierter Wert im Satz steht** — ein Titel, ein
> Dateiname —, **steht er in Anführungszeichen und ebenfalls ohne Endung.**

**Und `Intl.PluralRules('tr')` kennt beide Klassen** — `select(1)` ist `one`,
`select(3)` ist `other`. *Nachgemessen, nicht angenommen: wer nur `other`
schriebe, ließe bei `n = 1` ein `⟦…⟧` am Bildschirm stehen.*

---

## Bauabschnitt 3 — die übrigen Befunde

### B5 — zwei deutsche Wörter standen fest im Quelltext

| wo | was | jetzt |
|---|---|---|
| `drawLinks()` | `` `alle ${rows.length} anzeigen` `` | `entry.showAllLinks` |
| `drawFilterSwitch()` | `` `${n} aktiv` `` | `list.filtersActive` |

**Beide sind keine Sätze**, und deshalb durch jeden Wächter der Runde 0.24.3
gefallen: der Bildschirmtext-Wächter prüft die **Verbotsliste** und nicht die
**Sprache**. *Auf Englisch standen sie deutsch da.*

**Dazu der Wächter, sonst kommt der dritte im nächsten Jahr:** die *Restprobe*
prüft seit dieser Runde nicht mehr nur, ob die übriggebliebenen Texte in einer
Liste stehen, sondern **ob sie ein deutsches Wortstück tragen**. Gelesen wird
`tools/dictionary.json` — dieselbe Tafel wie bei den sechs Wächtern des
Quelltextes. **Drei Ausnahmen, jede namentlich**: der eine feste Satz „Die
Sprachdatei fehlt." (er erscheint, *bevor* eine Sprachdatei geladen ist) und
die beiden Serverbefehle (sie sind Befehle und keine Sätze).

### B6 A — ein Zeichen als Quelltext

Der Wiederherstellen-Knopf zeigte seinen SVG-Quelltext als Text:

```js
${tH('card.restoreIcon', { restoreIcon: ICON_RESTORE })}
```

**`tH()` maskiert jeden eingesetzten Wert — mit Absicht** (Stolperstein 18 in
Dateiform). **Verursacht hat es 0.24.0** beim Umzug der Sätze: aus
`${ICON} Wiederherstellen` wurde ein Satz mit Platzhalter, und ein Platzhalter
ist ein Wert.

**Der Schlüssel `card.restoreIcon` fällt weg** — *ein Zeichen ist kein Wort und
gehört nicht in einen Satz, den jemand übersetzt.* Der Knopf setzt das Zeichen
selbst und schreibt das Wort daneben. **Dazu ein Wächter:** kein `ICON_` geht
durch `t()` oder `tH()`, mit gefahrener Gegenprobe an der Zeile von 0.24.3.

### B6 B — die Zeile des Papierkorbs

**Der Befund fragte: *ist das der Eintrag, den ich meine?*** Der Auftrag
schlug vor, dafür den **Anleger** in die Zeile zu setzen; im Bauen kam der
Name des Eintrags dazu, dann der Anlagetag.

> ## DIE ENTSCHEIDUNG DES BETREIBERS, 8. September 2026
> **Die Zeile bleibt, was sie war: Titel · gelöscht am … von … · noch N Tage ·
> Größe.** Im Wortlaut: *„Ich glaube Löschdatum reicht doch. Wie es ist
> draußen? Höchstens wenn man auf Details klickt, dass dann mehr zu sehen
> ist."*
>
> **UND DRAUSSEN, auf die Frage des Betreibers:** der Windows-Papierkorb
> führt Name, ursprünglichen Ort, Löschdatum und Größe; der Mac-Papierkorb
> Name, Löschdatum und Größe; Nextcloud Name, Ort und „vor … gelöscht".
> **Den ANLEGER führt von diesen keiner** — er steht nur dort, wo eine Ablage
> vielen gehört (Google Drive nennt ihn aus genau diesem Grund).
> ***Der gemeinsame Nenner ist: Name, Löschdatum, Größe*** — und genau das
> steht in der Zeile. *Das ist aus der Kenntnis dieser Papierkörbe gesagt und
> nicht an ihnen nachgemessen; wo dieses Papier misst, sagt es „gemessen".*
>
> **Was mehr will, klickt auf Details** — Schritt 2 aus F7, eine eigene Runde.

**`GET /api/trash` trägt trotzdem Anleger und Anlagezeit.** *Das ist kein
herrenloses Feld, sondern die halbe Reparatur:* der Auftrag hat den Schritt in
zwei geteilt, die Detailansicht ist Schritt 2, und sie liest die beiden dann
ohne einen zweiten Weg. Beide stehen seit jeher im Paket, das der Papierkorb
ablegt (`author` und `created_at` am Eintrag im Austauschformat) — **deshalb
bekommt die Tabelle weder eine Spalte noch einen Migrationsblock.** *Zwei
Spalten wären der teurere Weg und dazu der schlechtere: sie blieben für jede
Zeile leer, die heute schon im Papierkorb liegt — die Auskunft gäbe es also
gerade dort nicht, wo sie gebraucht wird.* Gelesen wird mit `json_extract()`
in SQLite und nicht mit `JSON.parse()` in JS: das Paket trägt den ganzen
Eintrag, und es je Zeile in den Arbeitsspeicher zu holen, nur um zwei Felder
zu lesen, wäre bei dreißig Tagen Papierkorb eine sichtbare Rechnung.

**Die Sprachdatei bekommt für B6 B keinen Schlüssel.** *`card.createdBy` und
`card.createdByOn` sind im Bauen entstanden und mit der Entscheidung wieder
gefallen — ein Schlüssel ohne Leser ist ein Schlüssel, den irgendwann jemand
übersetzt, ohne zu wissen wofür.*

> **DIE DETAILANSICHT IST SCHRITT 2 UND EINE EIGENE RUNDE** *(F7)*. Ein
> Vorschaubild ist teurer als es aussieht — die Zeilen liegen im Papierkorb
> als Gebilde und nicht mehr in `photos`. **Dort stehen dann Anleger und
> Anlagetag**, und die Route trägt sie schon.

### B7 — Kategorien und Tags ließen sich in ihrer Karte nicht anlegen

**Und die beiden Hälften lagen verschieden:**

| | was fehlte |
|---|---|
| Kategorien | **nur das Feld.** `POST /api/product-categories` stand längst — der Weg war nur nicht dort, wo man ihn beim Verwalten sucht |
| Tags | **der Weg selbst.** `/api/tags` kannte GET, PUT und DELETE; angelegt wurde ein Tag nur **am Eintrag** oder beim Import |

**Das Feld läuft über `MANAGE_KIND`** und nicht über eine Abfrage auf den
Kartennamen — dieselbe Bauform wie `sortable`, `counter`, `weight` und
`perLanguage`. *Die Kriterien tragen keinen Eintrag: sie schicken die Phase
mit und haben dafür ihre eigene Zeile.*

**`POST /api/tags` ist Zeile für Zeile wie `POST /api/product-categories`
gebaut**, und das ist Absicht — es sind dieselbe Frage und dieselbe Antwort:

* **keine Rollenfrage im Kopf.** Stünde dort `adminOnly`, wäre die Klemme
  darunter totes Holz — `mayCreate()` ist für einen Admin immer wahr, und eine
  Klemme, die nie greift, lässt sich nicht gegenprüfen. *Der Auftrag schreibt
  „Eigentümer, mit der Klemme aus B7"; die beiden Hälften widersprechen
  einander, und die Klemme ist die operative.* **Die Karte bleibt trotzdem beim
  Admin** — ein Feld, das je nach Schalter eine Absage erzeugt, sähe aus wie
  ein Fehler.
* **erst nachschlagen, dann die Klemme.** Einen **vorhandenen** Tag zu benennen
  darf jeder; nur ein **neuer** Name hängt an `tagsFreeCreate`.
* **`findTag()` und `createTag()` werden gerufen** — keine dritte Art, einen
  Tag anzulegen.

**`F_ROUTES` steigt damit von 70 auf 71.** *Drei Dinge dieser Runde bewegen sie
ausdrücklich nicht: das Anlegefeld der Kategorien geht über eine Route, die es
längst gibt; Anleger und Anlagezeit sind zwei Felder mehr in einem lesenden
Endpunkt; und die drei Vokabeltafeln gehen über `GET`/`PUT /api/settings`.*

### B4 der Runde 0.24.3 — das leere Zeichen

**`emptyState()` benutzte `ICON_PH`** — einen Bildplatzhalter, ein Rechteck mit
Sonne und Bergen — für **vier** Kästen, die mit Bildern nichts zu tun haben:
Testtage, Links, Dateien und Kommentare. *An der Kachel ohne Foto und im
Bildstreifen meint das Zeichen, was es zeigt; über „Noch keine Kommentare."
meinte es „hier fehlt ein Bild, das nicht geladen werden konnte".*

**Jetzt steht dort gar keines** *(F8)*: der Satz sagt alles, ein Bild darüber
erklärt nichts und kostet Höhe. `ICON_PH` selbst bleibt — es hat drei Rufer,
an denen es richtig steht.

---

## Bauabschnitt 4 — der Prüfstand

**Achtzehn neue Wächter, jeder mit gefahrener Gegenprobe** — die elf aus der
Tafel des Auftrags, dazu die Sprachprobe des Lesers (B9), der Beleg, dass ein
Bestand aus 0.24.3 anläuft, der Export über alle drei Sprachfassungen, die
T2-Probe, die Probe auf drei gleichzeitige Zugänge, die Faltung am
laufenden Server neben der am Quelltext — **und die Vokabelprobe zu T2, die
erst die Entscheidung des Betreibers nötig gemacht hat.**

**Zehn stehen in einer eigenen Servergruppe, drei am Quelltext, vier am DOM,
eine an der Datei.** *Dreiundsechzig Prüfungen mehr: 6019 werden 6082.*

| Wächter | wo | Zusicherung |
|---|---|---|
| **Eintragsprobe** | Server | was für eine Sprache eingetragen wurde, kommt in dieser Sprache heraus — *und in der Ablage liegt genau ein Wort, nicht vierzehn* |
| **Drei Zugänge** | Server | drei Sprachen gleichzeitig, keiner sieht etwas vom anderen |
| **T3-Probe** | Server | neun türkische Suchfälle, keiner geht ins Leere |
| **Zwei-Leser-Probe** | Server | derselbe Bestand, dieselbe Eingabe, dieselbe Trefferliste |
| **Faltungsprobe** | Server **und** Quelltext | Nadel und Heuhaufen rufen dieselbe Funktion, und sie nimmt keine Sprache entgegen |
| **Deckungsprobe** | Datei | `tr.json` trägt dieselben Schlüssel wie `de.json`, in derselben Folge |
| **T1-Probe** | Datei | drei Vokabelwörter, drei Vokale, derselbe Satz bleibt richtig |
| **T2-Probe** | Datei | beide Mehrzahlformen gefüllt, kein -ler/-lar hinter einem Zähler |
| **Vokabelprobe zu T2** | Datei | die fünf türkischen Vokabelpaare tragen **dasselbe** Wort in `one` und `other` — *und in `de.json` und `en.json` sind sie verschieden, damit die Zeile belegt, dass die Regel JE SPRACHE gilt und nicht überall* |
| **Bestandslauf** | Server | eine Ablage aus 0.24.3 läuft an — die vierzehn Wörter stehen danach da |
| **Exportprobe** | Server | ein Export trägt alle drei Sprachfassungen und spielt sie wieder ein |
| **Sprachprobe des Lesers** | DOM | wer seine eigene Sprache wechselt, wechselt auch die vierzehn Wörter |
| **Umschalterprobe** | DOM | die Kachel zeigt die Sprache, auf der sie steht — **an allen vier Kacheln** |
| **Vorgabeprobe** | DOM | der Hinweis „(Vorgabe: …)" folgt der Kachel |
| **Stellungsprobe** | DOM | die Bildlaufstellung überlebt das Umschalten — *und ein gewöhnliches Neuzeichnen fängt weiter oben an* |
| **Zeichenprobe** | Quelltext | kein `ICON_` geht durch `t()` oder `tH()` |
| **Restprobe, verschärft** | Quelltext | kein übriger Text in `app.js` trägt ein deutsches Wortstück |

> **DIE GEGENPROBEN SIND GEFAHREN, NICHT NUR GESCHRIEBEN — und eine hat eine
> Erwartung berichtigt.** Drei neue Rückbauten, keiner stumm:
>
> | Rückbau | was rot wird |
> |---|---|
> | **734** die Nadel faltet wieder mit einer Locale | T3-Probe, Faltungsprobe (Server **und** Quelltext) |
> | **735** die vier i fallen auseinander | T3-Probe, Faltungsprobe, „die vier i fallen wirklich auf eines" |
> | **736** der Sprachwechsel wirft die Antwort weg | genau die zweite Hälfte der Sprachprobe |
>
> ***Die berichtigte Erwartung:*** *dieses Papier nahm an, Rückbau 734 mache
> auch die **Zwei-Leser-Probe** rot. Er tut es nicht.* **Der Grund ist die
> Rufstelle:** sie reicht seit dieser Runde gar keine Sprache mehr herein, und
> die zurückgebaute Zeile nimmt deshalb die Locale der **Installation** statt
> der des Lesers — für alle dieselbe, nur die falsche. ***Der Wächter für
> „zwei Leser, eine Antwort" hängt damit an der Rufstelle und nicht an der
> Funktion*** — eine Auskunft, die vor dem Fahren kein Papier hatte.

**Die Zahlen, die festgenagelt sind:**

| | |
|---|---|
| Sprachdateien | **drei** *(vorher zwei)* |
| Schlüssel je Datei | **1209** oberste, **1277** flach, davon **68** Mehrzahlformen und **14** Vokabelnamen |
| `EXCHANGE_FORMAT` | **14** *(unverändert)* |
| Tabellen | **27** *(unverändert)* |
| `F_ROUTES` | **71** *(vorher 70)* |
| Wege unter `/api/tags` | **vier** *(vorher drei)* |
| Rückbauten | **728** *(vorher 725)* |

---

## Der Augenschein — gefahren, in drei Sprachen, am Telefon

**Der Punkt, der in 0.24.3 offen geblieben ist, ist mit dieser Runde
gefahren.** Übersicht, Eintrag und der Abschnitt „Bestand" der Einstellungen,
je in Deutsch, Englisch und Türkisch, auf **390 × 844** (Telefon) und auf
**1280 × 900** — achtzehn Bilder, mit Chromium an einer laufenden Instanz.

**Was er bestätigt:**

* **Nichts läuft über und nichts wird abgeschnitten.** Die türkischen Sätze
  sind länger, und die Stellen, an denen es eng wird, sind dieselben wie auf
  Deutsch (der Titel in der Kopfzeile, die Kachelüberschrift) — sie brechen um
  oder kürzen, wie sie es sollen.
* **`ğ ş ç ı İ` liegen in der Schriftkette**, wie das Konzept sagt (S3.3).
  „TEST EDİLDİ" steht mit gepunktetem großem İ da.
* **T1 hält am lebenden Beispiel:** „Öğe sil", „Öğe silinsin mi?" — keine
  Endung, an keiner Stelle.
* **Die Reparaturen dieser Runde sind zu sehen:** die vierzehn Felder stehen
  leer, darunter „(varsayılan: Öğe)"; die Sprachzeile steht über allen vier
  Karten; „+ Oluştur" steht unter „Kategoriler" und unter „Etiketler"; über
  „Henüz yorum yok." steht kein Bildzeichen mehr.

### Und ein Befund, den erst der Augenschein gebracht hat — samt seiner Entscheidung

**„3 Öğeler" stand am Bildschirm, und türkisch ist „3 öğe".** *Nach einer Zahl
steht im Türkischen die Einzahl — das ist Regel T2, und die erste Fassung
dieser Runde hielt sie an genau dieser Stelle nicht.*

**Die Ursache ist nicht die Übersetzung, sondern der Mechanismus.** Die
vierzehn Vokabelwörter haben je **einen** Mehrzahlplatz, und der wird an drei
Orten gelesen:

| wo | was Türkisch will | gemessen am 8. September 2026 |
|---|---|---|
| hinter einem Zähler — `3 {entryMany}` | die **Einzahl**: „3 öğe" | **30 Stellen** *(27 über `vThing`/`vTime`/`vReport`/`vTask`/`vRating`, drei über `countWord`)* |
| in einem Satz — `bütün {entryMany} için` | eher die **Mehrzahl**: „öğeler" | **27 Schlüssel**, 30 Vorkommen |
| als bloße Beschriftung — „TEST GÜNLERİ" über der Liste | die **Mehrzahl** | **5 Stellen** im Code |

> ## DIE ENTSCHEIDUNG DES BETREIBERS, 8. September 2026
> **Kein fünfzehnter Vokabelplatz. Beide Formen tragen dasselbe Wort.** Im
> Wortlaut: *„Nein, es wird keine Felder für mehrzahlige Angaben auf Türkisch
> geben. 1 Öğe, 4 Öğe, beides geht. Dann ist die Vorgabe für beides halt zwei
> mal das gleiche. Öğeler ist ja eher ‚öğelere baktım'. Silinecek 3 öğe var.
> 15 öğe görünüyor. Öğeler görünüyor ist eher, wenn man die Zahl nicht
> gibt."*
>
> **`tr.json` trägt seither `Öğe`, `Test günü`, `Rapor`, `Görev`,
> `Değerlendirme` in `one` wie in `other`.** Damit stehen die **30
> Zählerstellen** richtig — und das war die Mehrheit.
>
> **Bezahlt ist es an den Sätzen, und zwar gemessen:** von den **27
> Satzschlüsseln** haben **12 einen neuen Wortlaut** bekommen, damit sie sich
> mit der Einzahl lesen — *„bütün {entryMany} öğelerini göster" wurde „Bütün
> {entryMany} listesini göster"; „kaç {entryMany} öğesinde yıldız verildiğini"
> wurde „yıldız verilen {entryMany} sayısını".* **Die übrigen 15 lasen sich
> mit der Einzahl schon richtig**, weil das Türkische das bloße Nomen ohnehin
> allgemein gebraucht: „Silinmiş öğe yok.", „Henüz Test günü yok."
>
> **Dazu ein dreizehnter Schlüssel, der kein Satz ist:** `card.vocabularyResetHint`
> zählt die vierzehn Vorgabewörter auf und musste die neuen Paare nennen —
> *„Öğe/Öğe, …, Test günü/Test günü"*. **Er sieht doppelt aus und ist es
> nicht:** die Karte hat zwei Felder, und der Hinweis sagt, was in beide
> zurückgeschrieben wird.
>
> **Was bleibt, ist benannt und nicht verschwiegen:** an den **fünf bloßen
> Beschriftungen** stünde türkisch lieber die Mehrzahl — „TEST GÜNLERİ" über
> der Liste der Testtage statt „TEST GÜNÜ". *Der Betreiber kennt den Preis
> und hat so entschieden.*

> **UND DAS IST DIE PROBE AUFS EXEMPEL, VON DER DAS KONZEPT SPRICHT.** Deutsch
> und Englisch brauchen für beide Orte dasselbe Wort; Türkisch bräuchte zwei.
> **Der Vokabularmechanismus hat dafür keinen Platz** — die Alternative wäre
> kein besseres Wort gewesen, sondern ein **fünfzehnter Vokabelplatz**
> („Mehrzahl nach einer Zahl"): ein Feld mehr in jeder Sprache, ein
> Wanderungsschritt für jeden Bestand, eine eigene Runde. ***Er ist abgelehnt,
> nicht vertagt*** — Punkt 19 in „Fehler und Ideen", und die Regel dazu steht
> als TR-S4 im Wörterbuch.

**Was der Augenschein NICHT sagt:** ob ein Satz sich türkisch **liest**. Das
bleibt beim Betreiber, und der ist seit dieser Runde auch der Leser *(F2)*.

---

## Stolpersteine dieser Runde

**EIN VORSCHLAG IST KEINE ANTWORT — und dieser Stolperstein ist der teuerste
der Runde.** *Die zehn Fragen des Auftrags standen mit einer Vorschlagsspalte
im Papier, und gebaut wurde nach der Vorschlagsspalte. Der Betreiber hat sie
danach beantwortet, und **zwei von zehn fielen anders aus**: der Leser für
Türkisch war nicht „niemand", sondern er selbst (F2), und die Mehrzahl bekam
keinen fünfzehnten Platz, sondern zwei mal dasselbe Wort.* **Beides war
danach zu bauen, statt vorher.** Die Regel steht seit dieser Runde im
Projektstand, Abschnitt 11, ganz oben: **die Fragen werden vor dem Bauen mit
dem Betreiber durchgegangen.**

**Ein Verdacht im Auftrag ist eine Vermutung und keine Ursache.** *B1 war am
Quelltext plausibel begründet und am laufenden Programm falsch. Hätte die
Runde die vermutete Zeile repariert, wäre der Umschalter unverändert richtig
geblieben — und der Befund unverändert da.* **Die Regel dazu stand im Auftrag
und hat sich bezahlt gemacht: erst nachstellen, dann reparieren.**

**Eine Vorgabe, die beim Schreiben festgelegt wird, ist ab da ein Eintrag.**
*Solange es eine Sprache gab, war der Unterschied unsichtbar. Mit zweien ist
er der ganze Befund.* **Wo ein Rückfall gilt, muss „nichts eingetragen"
unterscheidbar bleiben** — sonst füttert man den Rückfall mit dem, was er
ersetzen sollte.

**Eine Zahl in einem Auftrag ist eine Behauptung.** *Der Auftrag nannte 1204
oberste und 1272 flache Schlüssel; beide waren der Stand von 0.24.3, und
`1204 + 68` ist eben nicht dieselbe Rechnung wie „jede Mehrzahlform als
eigener Schlüssel neben ihrem Träger". Beide Lesarten stehen jetzt
nebeneinander im Prüfstand — 1209 und 1277 —, mit ihrer Rechnung daneben.*

**Ein Wächter, der eine Liste vergleicht, prüft die Liste und nicht die
Sache.** *Zwei deutsche Wörter sind durch fünf Sprachwächter gefallen, weil
keiner von ihnen nach der Sprache gefragt hat.*

---

## Was danach offen bleibt

* **Das Gegenlesen von `tr.json`** — der Leser ist benannt *(F2: der Betreiber
  selbst)*, das Durchgehen der Wörterliste steht noch aus. **`Parola` gegen
  `Şifre`** *(F3)* ist der erste Punkt dieser Liste.
* **Die Detailansicht im Papierkorb** *(Schritt 2 aus F7)* — dort stehen dann
  Anleger und Anlagetag; die Route trägt sie schon.
* **Rechts-nach-links** — die Bauform lässt es zu, geprüft ist es nicht.
* **Die Region je Sprache** (`de-AT` neben `de-DE`).
* **`ß` gegen `ss` in der Suche** — Punkt 18 im Fahrplan.
**Und einer ist ausdrücklich NICHT offen:** *der **fünfzehnte Vokabelplatz**
(„Mehrzahl nach einer Zahl") ist am 8. September 2026 **abgelehnt** worden und
nicht vertagt. Er steht als Punkt 19 in „Fehler und Ideen" — als entschiedene
Absage mit ihrer Begründung, damit ihn niemand in zwei Runden noch einmal
vorschlägt.*
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und `gegenprobe.js`
  nennen** — Papierarbeit aus 0.24.1, seit vier Runden offen.
* **`0.25.0` ist frei** und die erste Nummer nach dem Ende der Abweichung.
