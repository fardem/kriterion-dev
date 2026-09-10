# Auftrag 0.27.0 — „Die wählbare Bildablage"

**Eine Funktion mit einer Auflage, dazu die Ableitungen · geschrieben am
10. September 2026 · gebaut auf 0.26.0.**

---

## Was in dieser Runde passiert

**Die Wahl gibt es schon — sie hat nur zwei Stellungen, und sie ist ein
Häkchen.** *Seit 0.19.0 steht in der Karte „Bildformate" ein Schalter
`convertImages` (`server.js:746`), der dem Eigentümer gehört:*

| Stellung | was geschieht |
|---|---|
| **aus** | ein PNG bleibt ein PNG |
| **an** *(Vorgabe)* | `storeImage()` macht ein WebP `nearLossless` daraus — **wenn es kleiner ist** |

> **DAS IST WICHTIG, UND ICH HATTE ES BEIM ERSTEN ENTWURF DIESES AUFTRAGS
> ÜBERSEHEN.** *Der Fahrplan schreibt seit dem 2. September „drei Verfahren
> zur Wahl **statt eines Schalters**", und das klingt, als gäbe es noch gar
> keine Wahl.* **Es gibt sie — zwei der drei Verfahren stehen schon da.**
> Nachgesehen am Quelltext, nicht dem Papier geglaubt.

**DIESE RUNDE MACHT AUS DEM HÄKCHEN EINE WAHL MIT DREI STELLUNGEN.** *Das
Dritte ist neu, die anderen zwei sind es nicht — und genau deshalb ist der
teure Teil dieser Runde nicht das Kodieren, sondern die **Migration**: aus
einem Ja/Nein wird ein Wert aus dreien, und jede bestehende Installation
trägt heute das Ja/Nein.*

| | | |
|---|---|---|
| **PNG** | nichts wird umkodiert | keine Rechenzeit, größte Ablage — **gibt es heute** *(Häkchen aus)* |
| **WebP verlustfrei** | `nearLossless` 60 | **gibt es heute** *(Häkchen an)*, bleibt Vorgabe |
| **WebP verlustbehaftet** | für Fotos aus der Zwischenablage | **NEU** — gemessen 67 % kleiner, *und bei einem Bildschirmfoto siebenmal GRÖSSER* |

**Und die Ableitungen fahren mit.** `thumb` und `medium` sind heute **JPEG**;
sie gehen im selben Durchgang über den Bestand auf WebP. *Ein Lauf statt
zwei — und das ist der einzige Grund, aus dem die beiden Punkte in einer
Runde stehen.*

> **DER BEFUND KOMMT AUS DEM BETRIEB, 2. September 2026**, und er kam als
> Verdacht auf einen Fehler: *ein JPEG von 5 MB, im Browser über „Grafik
> kopieren" genommen und in Kriterion eingefügt, liegt danach als 12 MB in der
> Datenbank.*
>
> **Es war keiner** — die Kette hat drei Glieder, und Kriterion sitzt am
> dritten. *Aber die Messung, die das zeigte, hat den eigentlichen Punkt
> freigelegt.*

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Am fertigen Stand gerechnet, vor dem Einspielen** *(10. September 2026)* | **`9ad0be7b`** |
| **Aus der laufenden Installation gemeldet** *(Betreiber, 10. September 2026)* | **`9ad0be7b`** — *derselbe Wert* |

> **ZWEI QUELLEN, EIN WERT — UND DIESMAL DIE STÄRKERE PAARUNG.** *Die zweite
> Zeile ist die laufende Installation und nicht eine zweite Rechnung: sie
> beweist, dass das Eingespielte dasselbe ist wie das Gebaute.* **Damit ist
> auch der Vorfall vom Vorabend abgeschlossen** — der gemeldete `a0a4c927`
> gehörte zu keiner Runde, sondern zu einem Zwischenstand mit gebautem Code
> und ungesetzter Nummer.

**Der Vorgänger im Überblick:** 0.26.0 · **6412 Prüfungen** · **803
Rückbauten** · `F_ROUTES` = **72** · Austauschformat `EXCHANGE_FORMAT` = **15**.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **DIE SPALTE „VORSCHLAG VON CLAUDE" IST EIN VORSCHLAG UND KEINE ANTWORT.**
> *Gebaut wird erst, wenn jede Frage beantwortet und in diesem Papier
> eingetragen ist* (Projektstand, Abschnitt 11).

> **NACHGETRAGEN AM 10. SEPTEMBER 2026, NACH DEM BAUEN — und der Ablauf gehört
> genauso ins Papier wie das Ergebnis.** *Die Runde ist mit den Worten* „Keine
> Ahnung was wir damals für die 27.0 ausgemacht haben" *in Auftrag gegeben
> worden; die Antwortspalte war leer.* **Gebaut wurde nach der
> Vorschlagsspalte, und die Tafel ist DANACH durchgegangen worden.**
>
> **FÜNF SIND VOM BETREIBER ENTSCHIEDEN:** F2 als Vorgabe im Auftrag selbst
> (*„Standard soll das sein, was heute aktiv genutzt wird"*), dazu F1, F3, F4
> und F6 im Gespräch — **jede davon wie vorgeschlagen, keine Abweichung.**
> **FÜNF SIND NACH VORSCHLAG GEBAUT UND NICHT EINZELN BESTÄTIGT:** F5, F7, F8,
> F9, F10. *Sie stehen so in der Spalte, damit niemand sie für abgenommen hält.*
>
> **REGEL 11 IST DAMIT IN DIESER RUNDE NICHT ERFÜLLT WORDEN** — beantwortet
> wurde nach dem Bauen und nicht davor. *Das steht hier als offener Punkt und
> nicht als Fußnote.*

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Wie kommt der Bestand vom Häkchen zur Wahl?** *Jede bestehende Installation trägt `convertImages` als `true` oder `false`; der neue Schlüssel hat drei Werte.* **Das ist eine Migration, und die Frage ist, ob sie eine SPUR hinterlässt** | **Ein weiterer Migrationsblock, und der alte Schlüssel fällt.** *`true` → `webp-lossless`, `false` → `png`, nichts Gespeichertes → die Vorgabe.* **Beide Wege sind eindeutig, es geht nichts verloren, und ein Schlüssel, der nach der Migration noch dastünde, wäre eine zweite Wahrheit über dieselbe Frage.** *Der Block fällt mit dem Bruch auf 0.33.0, wie die davor.* — **Und dabei ist eine Zahl zu klären, die nicht stimmt:** *Fahrplan und Projektstand sprechen vom Bruch als „zehn Migrationsblöcke", `db.js` trägt aber **vierzehn** Migrationsfunktionen. Entweder zählen die Papiere Blöcke anders als Funktionen (0.24.1 hat drei Teile), oder eine Zahl ist stehengeblieben.* **Nachzählen, bevor diese Runde eine elfte, fünfzehnte oder was auch immer dazuschreibt.** |  **Ja, wie vorgeschlagen** — *entschieden 10.9.2026* |
| **F2** | **Was ist die Vorgabe für eine FRISCHE Installation?** | **WebP verlustfrei** — *das heutige Verhalten.* Die Messung von 0.19.0 gilt unverändert, und eine Runde, die eine Wahl einführt, darf die bisherige Antwort nicht nebenbei ändern. |  **Ja — „Standard soll das sein, was heute aktiv genutzt wird"** *(Betreiber, 10.9.2026)* |
| **F3** | **Trifft die Wahl auch die ABLEITUNGEN, oder nur das Original?** | **Nur das Original.** *Die Ableitungen gehen unabhängig davon auf WebP — sie sind heute JPEG q78/q84, also ohnehin verlustbehaftet, und niemand archiviert sie.* **Zwei Fragen, zwei Antworten; sie in einen Schalter zu legen wäre bequem und falsch.** |  **Ja, wie vorgeschlagen** — *entschieden 10.9.2026* |
| **F4** | **Wird `medium` ebenfalls `nearLossless`?** *Der Fahrplan nennt das ausdrücklich als NICHT gemessen* | **Nein, und zwar bis es gemessen ist.** *`medium` ist das, was man in der Anwendung ansieht; ob verlustfrei dort mehr nützt als kostet, ist eine Zahl, die noch niemand hat.* **Diese Runde misst es — und baut es nur, wenn die Messung dafür spricht.** |  **Ja, wie vorgeschlagen — und gemessen** *(entschieden 10.9.2026)* |
| **F5** | **Was passiert mit dem BESTAND, wenn die Wahl sich ändert?** | **Die Kachel bietet es an, sie tut es nicht von selbst.** *Dieselbe Bauform wie heute bei PNG → WebP: ein Knopf, eine zweite Bestätigung, ein Lauf.* **Niemals beim Umschalten** — wer die Wahl probiert, soll nicht 500 MB umkodiert bekommen. |  *nach Vorschlag gebaut, nicht einzeln bestätigt* |
| **F6** | **Verlustbehaftet trägt seine Rechtfertigung nur bei einem Bild aus der ZWISCHENABLAGE** — dort ist der Verlust schon passiert. *Aus den Bytes sind Zwischenablage und hochgeladenes PNG nicht zu unterscheiden.* Wird trotzdem beides gleich behandelt? | **Ja, gleich — und der Preis steht in der Karte.** *Eine Weiche, die den Weg des Bildes rät, wäre eine zweite Wahrheit über dieselbe Frage.* **Die Karte sagt beim Einschalten, wofür das Verfahren gedacht ist und wofür nicht.** |  **Ja, wie vorgeschlagen** — *entschieden 10.9.2026* |
| **F7** | **Der billigste Weg steht gar nicht im Quelltext:** „Bild speichern unter" und dann hochladen — 5,21 MB, kein Generationsverlust, kein Kodierer. Bekommt der Benutzer das gesagt? | **Ja, ein Satz an der Einfügestelle.** *Er ist billiger als jede Wahl und schließt sie nicht aus.* **Er gehört in diese Runde**, weil sie die einzige ist, in der jemand über diese Kette nachdenkt. |  *nach Vorschlag gebaut, nicht einzeln bestätigt* |
| **F8** | **Die Nummer: 0.27.0 als MINOR — richtig?** *Die Wahl gibt es zur Hälfte schon* | **Ja, MINOR.** *Nicht, weil es eine Wahl gibt — die gibt es —, sondern weil ein **drittes Verfahren** dazukommt: die Installation kann danach etwas ablegen, was sie vorher nicht konnte (Regel 5.1).* **Und die Migration allein würde es schon tragen.** *Die Ableitungen wären für sich ein PATCH; sie fahren mit.* |  *nach Vorschlag gebaut, nicht einzeln bestätigt* |
| **F9** | **Wird ein neuer Weg gebraucht?** `F_ROUTES` steht bei **72** | **Nein.** *Die Wahl reist über die vorhandene Einstellungsroute, der Bestandslauf über `POST /api/images/convert`, den es seit 0.19.1 gibt.* **Kommt doch einer hinzu, steht die neue Zahl im Änderungsprotokoll.** |  *nach Vorschlag gebaut, nicht einzeln bestätigt* |
| **F10** | **Wem gehört die Wahl?** — *die Frage ist schon beantwortet, und zwar vom Quelltext* | **Dem Eigentümer, und das ist keine Entscheidung dieser Runde.** *`convertImages` steht seit 0.19.0 in `OWNER_KEYS` (`server.js:697`), mit der Begründung: „ein Schlüssel, der den PLATZBEDARF DER GANZEN INSTANZ bestimmt, gehört in dieselbe Rechtezeile wie Export, Sicherung und Schlüssel".* **Der Nachfolger erbt die Klemme.** *Die Zeile steht hier trotzdem, damit niemand sie für vergessen hält — sieben Schlüssel werden acht, oder sieben bleiben sieben, wenn der alte fällt (F1).* |  *nach Vorschlag gebaut, nicht einzeln bestätigt* |

---

## Der Befund

### 1 — die Kette hat drei Glieder, und Kriterion sitzt am dritten

**Gemessen am 2. September 2026:**

| | |
|---|---|
| das Original im Netz | **5,21 MB** JPEG |
| was die Zwischenablage liefert | **34,79 MB** PNG |
| was Kriterion daraus macht | **20,42 MB** WebP `nearLossless` |
| was verlustbehaftet q90 daraus würde | **6,64 MB** — **67 % weniger** |

**Die Zwischenablage trägt keine Datei, sondern Bildpunkte.** *Der Browser legt
sie als PNG ab — verlustfrei, aus den **dekodierten** Bildpunkten des JPEG,
Kompressionsspuren eingeschlossen.* **Kriterion bläht also nichts auf; es
verkleinert um 41 %, nur von einer Zahl aus, die es vorher nicht gab.**

> **UND ES IST KEINE FEHLENDE GRÖSSENPRÜFUNG.** `storeImage()`
> (`images.js:417`) nimmt das WebP **nur, wenn es kleiner ist** als das, was
> hereinkam — *die Regel gibt es, sie ist als Rückbau 433 bewacht, und sie hat
> hier richtig entschieden: das PNG war der große Brocken.* **Achtzehn
> Laborversuche quer durch Palette, Text, Graustufen, Alpha und 1×1 zeigen:
> PNG gewinnt nie über die Größe.**

### 2 — die Auflage, und sie ist der ganze Grund für „mit einer Auflage"

**Verlustbehaftet darf keine Regel werden, sondern nur eine Wahl.**

> **Gemessen an einem Bildschirmfoto mit Text ist WebP q90 rund SIEBENMAL
> GRÖSSER als `nearLossless`** — 0,09 gegen 0,01 MB. *Der verlustbehaftete
> Bitstrom kann mit harten Kanten nichts anfangen.* **Die Entscheidung von
> 0.19.0 war für diesen Bestand richtig und bleibt die Vorgabe.**

**Die Stelle, an der das steht, ist `images.js:377`:**

```js
const WEBP_STORE = { nearLossless: true, quality: 60, effort: 4 };
```

*Der Kommentar darüber trägt die Herleitung — warum `nearLossless` und nicht
`quality`, und warum 60.* **Er geht nicht weg; er bekommt einen zweiten
Absatz über die Wahl.**

### 3 — die Ableitungen sind JPEG, und sie sind die größere Hälfte geworden

**Die Stelle:** `images.js`, `VARIANTS` und `makeVariants()` (`images.js:248`).

```js
const VARIANTS = {
  thumb:  { short: 512,  long: 1280, q: 78, crops: true  },
  medium: { short: 1600, long: 1600, q: 84, crops: false }
};
```

**Bis 0.19.0 waren die Ableitungen die kleinere Hälfte** — 71,1 MB gegen
497,7 MB Originale. **Nach 0.19.0 schrumpfen die Originale auf rund 162 MB,
und die Ableitungen bleiben bei 71,1 MB: sie sind damit die größere Hälfte.**

> **UND DER GRUND HAT SICH MIT 0.19.4 NOCH EINMAL GEÄNDERT.** *Bis dahin
> lautete er: die Vorschaukachel rechnet ihr Bild ohnehin hoch. Das Hochrechnen
> ist weg — geblieben ist, dass die Ableitungen JPEG sind, und das ist jetzt
> der ganze Punkt.* **Der `thumb` trägt seither das 3,06fache an Bytes eines
> 16:9-Bildes**, und genau daran wäre ein sparsameres Verfahren mehr wert als
> vorher.

**`medium` ist JPEG q84 und damit verlustbehaftet** — *es franst an Text
genauso aus wie die verlustbehafteten WebP-Stufen.* **Was man in der Anwendung
ansieht, ist die Ableitung und nicht das Original.**

### 4 — was noch niemand gemessen hat

> **DIE RUNDE MISST, BEVOR SIE BAUT — an genau einer Stelle:** ob `medium`
> ebenfalls verlustfrei werden sollte *(F4)*. **Der Fahrplan nennt das seit
> dem 2. September ausdrücklich als ungemessen**, und eine Ersparnis, die man
> nicht gemessen hat, ist eine Vermutung. *Dieselbe Regel, an der 0.19.0 selbst
> hängt.*

**Was zu messen ist, in einem Lauf über echte Bilder:** `medium` als JPEG q84
gegen WebP q84 gegen WebP `nearLossless` — **Bytes und Augenschein**, an einem
Foto, an einem Bildschirmfoto mit Text und an einer Strichzeichnung.

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 0** | **Die Messung zu `medium`** *(F4)* — drei Verfahren, drei Bildarten, Bytes und Augenschein | *nichts — es wird gemessen, nicht gebaut* |
| **BA 1** | **Aus dem Häkchen wird die Wahl** — `imageStore` mit drei Werten, Vorgabe „WebP verlustfrei". *Die Eigentümerklemme wird geerbt, nicht neu entschieden (F10).* **Dazu der Migrationsblock** *(F1)*: `true` → `webp-lossless`, `false` → `png` | **`convertImages` FÄLLT NAMENTLICH** — der Schlüssel, die Ableitung `convertImages()` (`server.js:746`), das Feld in der Antwort (`server.js:2568`, `:2895`) und der Schreibzweig (`server.js:2834`). *Die Zahl in `OWNER_KEYS` (`server.js:697`) bleibt damit bei **sieben** — einer kommt, einer geht — und das gehört so ins Protokoll, weil eine unveränderte Zahl sonst wie ein vergessener Eintrag aussieht* |
| **BA 2** | **`storeImage()`** *(`images.js:417`)* liest die Wahl, statt sie zu kennen | **Die Größenprüfung bleibt** — *sie ist Rückbau 433 und gilt für jedes Verfahren. Wer sie für den verlustbehafteten Weg abschaltete, machte aus einer Wahl eine Wette* |
| **BA 3** | **Die Karte „Bildablage"** *(`public/app.js:11495`, `cardImageStore`)* — drei Verfahren zur Wahl, der Satz über die Auflage, das Angebot, den Bestand nachzuziehen | *keine Zeile fällt; die Karte bekommt Sätze. **Fällt doch einer, steht er NAMENTLICH hier, in allen drei Sprachen*** |
| **BA 4** | **Die Ableitungen auf WebP** — `VARIANTS`, `makeVariants()`, `encodeCommentImage()` *(`server.js:5531`)*, die Auslieferung *(`attachments.js:220`, `setImageHeader`)* | **`q: 78` und `q: 84` fallen in ihrer heutigen Bedeutung** — *sie heißen dann WebP-Qualität und nicht JPEG-Qualität; die Zahlen sind neu zu setzen und nicht zu übernehmen* |
| **BA 5** | **Der Bestandslauf** über `POST /api/images/convert` *(`server.js:5930`)* — er zieht Originale **und** Ableitungen in EINEM Durchgang nach | *nichts fällt; der vorhandene Weg bekommt mehr zu tun. **Die zweite Bestätigung bleibt**, und die Zahl in ihrem Satz muss beide Hälften nennen* |
| **BA 6** | **Der Satz an der Einfügestelle** *(F7)* — „Bild speichern unter und hochladen ist billiger" | *nichts fällt; drei neue Sätze in den Sprachdateien* |

> **DAS SCHEMA WIRD NICHT ANGEFASST.** *Die Wahl ist eine Zeile in der
> Einstellungstabelle.* **Und das Austauschformat bleibt bei 15** — *im Export
> steht der MIME-Typ längst an jedem Bild; ein WebP dort ist nichts Neues.*
> **Die letzte Runde, die das Schema anfassen darf, ist 0.29.0.**

---

## Die Nummer und ihre Begründung

**0.27.0 ist ein MINOR — Regel 5.1.**

**Nicht, weil es eine Wahl gibt — die gibt es seit 0.19.0 als Häkchen.**
*Sondern weil ein **drittes Verfahren** dazukommt: die Installation kann danach
etwas ablegen, was sie vorher nicht konnte.* **Das ist eine Funktion, und eine
Funktion nimmt eine MINOR-Nummer.**

**Und die Migration allein würde es schon tragen** — ein gespeicherter Wert
ändert seine Gestalt, und das ist mehr als eine Reparatur. *Die Ableitungen
wären für sich ein PATCH: sie ändern, wie ein Bild aussieht und wie groß es
ist, aber nicht, was die Installation kann. Sie fahren mit, weil ein Durchgang
über den Bestand billiger ist als zwei.*

**Der Fahrplan rückt nicht.** *0.28.0 bis 0.35.0 stehen, wo sie stehen; 0.32.0
bleibt frei, der Bruch bleibt auf 0.33.0.*

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 813.** *Ein STUMM ist ein Fund und kein Versehen.*

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | Die Einstellung kennt **genau drei** Werte, und ein vierter wird abgewiesen | einen vierten Wert durchlassen |
| **2** | Sie gehört dem **Eigentümer** — ein Admin bekommt sie zu sehen und nicht zu setzen | die Klemme auf Admin weiten |
| **3** | Eine **frische** Installation steht auf „WebP verlustfrei" | die Vorgabe verstellen |
| **4** | `storeImage()` **liest** die Wahl — dreimal dasselbe Bild, dreimal ein anderes Ergebnis | die Wahl wieder fest verdrahten |
| **5** | **Die Größenprüfung gilt in jedem Verfahren** — auch im verlustbehafteten | sie für einen Weg abschalten |
| **6** | Die Ableitungen sind **WebP**, und ihr MIME-Typ sagt es | eine auf JPEG zurück |
| **7** | Der Bestandslauf zieht **Originale und Ableitungen** — nicht nur eine Hälfte | eine Hälfte auslassen |
| **8** | **Umschalten allein rührt den Bestand nicht an** | den Lauf ans Umschalten hängen |
| **9** | Die Karte nennt die **Auflage** in allen drei Sprachen | den Satz aus einer Datei nehmen |
| **10** | **Die Migration übersetzt beide alten Stellungen** — an echten Altbeständen: `true` → verlustfrei, `false` → PNG, nichts → Vorgabe | eine der drei Richtungen falsch abbiegen lassen |
| **11** | **`convertImages` steht nach der Migration NIRGENDS mehr** — nicht in der Antwort, nicht in `OWNER_KEYS`, nicht als Ableitung | den alten Schlüssel stehen lassen |

> **GEMESSEN WIRD MIT ECHTEN BILDERN UND NICHT MIT ZUFALLSBYTES.** *Ein
> Rauschbild lässt sich nicht komprimieren und beantwortet damit jede Frage
> nach der Größe falsch.* **Der Prüfstand baut seine Bilder selbst** — ein
> Farbverlauf, ein Text auf weiß, eine Fläche —, *und er hält die Zahlen
> gegeneinander statt gegen feste Werte: welches Verfahren gewinnt, ist die
> Zusage, nicht wie viele Bytes es sind.*

> **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90). *Die Wahl muss
> im Nachbau genauso in der Antwort stehen wie im Betrieb.*

---

## Der Augenschein

**Diese Runde ändert, wie Bilder AUSSEHEN — das gehört angesehen und nicht
gerechnet:**

| | Lage |
|---|---|
| **1** | ein **Foto**, in allen drei Verfahren abgelegt — nebeneinander, am großen Bild |
| **2** | ein **Bildschirmfoto mit Text**, dasselbe — *hier muss der verlustbehaftete Weg sichtbar schlechter sein, sonst stimmt die Auflage nicht* |
| **3** | eine **Strichzeichnung** — die härteste Probe für WebP verlustbehaftet |
| **4** | die **Vorschaukachel** vor und nach dem Wechsel auf WebP — *sie ist das, was man am häufigsten sieht* |
| **5** | die Karte „Bildablage" in **allen drei Sprachen**, mit jedem der drei Verfahren gewählt |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Eine Weiche zwischen Zwischenablage und Upload** | *aus den Bytes sind die beiden nicht zu unterscheiden (F6).* **Eine Weiche, die den Weg des Bildes rät, wäre eine zweite Wahrheit über dieselbe Frage** |
| **`medium` auf verlustfrei — ohne die Messung** | **F4 sagt: erst messen.** *Eine Ersparnis, die man nicht gemessen hat, ist eine Vermutung* |
| **AVIF** | *draußen üblich und deutlich kleiner — aber ein drittes Verfahren, das die Runde nicht gemessen hat, und `sharp` kodiert es langsamer.* **Gehört in einen eigenen Punkt, nicht in diese Runde** |
| **Ein Umkodieren beim Umschalten** | **niemals** *(F5)*. Wer die Wahl probiert, soll nicht 500 MB umkodiert bekommen |
| **Das Anfassen bestehender JPEG-Originale** | *Kriterion fasst JPEG nicht an, und das bleibt so.* **Die Wahl gilt für PNG, das hereinkommt** — und für die Ableitungen, die Kriterion selbst erzeugt |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.27.0.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_27_0.md` | `git mv`, **Revision 79** — dazu die Einstellung in Abschnitt 3 |
| `Doku/Fahrplan.md` | die Zeile 0.27.0 wird durchgestrichen; **die Ausarbeitungen bleiben als Herleitung** |
| `Doku/Fehler_und_Ideen.md` | **Punkt 5 und Punkt 6 fallen heraus** *(Regel 2)* |
| `Doku/Auftrag_0.26.0.md` | **fällt mit diesem Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **ja** — die Bildablage steht dort erklärt, und die Wahl gehört dazu |

---

## WIE DER NÄCHSTE AUFTRAG AUSZUSEHEN HAT

> **Ab 0.25.0 trägt jeder Auftrag diesen Abschnitt.** *Entschieden vom
> Betreiber am 9. September 2026: „das muss immer in jedem Auftrag drin
> stehen … um dir beim Bauen Arbeit zu sparen, ohne dass wir unsicherer oder
> schlechter werden."* **Er beschreibt die FORM, nicht den Inhalt** — der
> Inhalt kommt aus dem Rundlauf.

**Am Kopf**

1. **Ein Absatz „was in dieser Runde passiert"**, mit dem Wortlaut des
   Betreibers, wenn der Befund aus dem Feld kommt.
2. **Der Fingerprint des Vorgängers**, aus **zwei** Quellen bestätigt: aus der
   laufenden Installation gemeldet **und** am gebauten Stand gerechnet.
   *Fehlt eine der beiden, steht das dort — als offener Punkt und nicht als
   Fußnote.*
3. **Die Fragetafel** mit einer Spalte „Vorschlag von Claude". **Die Spalte ist
   ein Vorschlag und keine Antwort.** *Gebaut wird erst, wenn jede Frage
   beantwortet und im Papier eingetragen ist* (Abschnitt 11 des Projektstands).
   **Und die Antwort gehört in die Antwortspalte** — am 10. September 2026 sind
   sieben Antworten in einer fünften Spalte gelandet, die eine vierspaltige
   Tafel gar nicht anzeigt.

**Im Rumpf**

4. **Der Befund**, in nummerierten Teilen, jeder mit der Stelle im Quelltext
   oder einer **Messung am laufenden Server**. *Vermutungen werden als solche
   benannt.*
5. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
6. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.*

**Am Fuß**

7. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.**
8. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
9. **Was ausdrücklich NICHT gebaut wird.**
10. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`, Revision),
    Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
11. **Dieser Abschnitt selbst.**

**Und die stehenden Regeln, die keine Runde neu verhandelt**

* **GEBAUT UND GEPRÜFT WIRD ÖRTLICH, GEPUSHT WIRD AUF ANSAGE.** *Entschieden
  vom Betreiber am 10. September 2026: das Repository ist privat und wird nur
  um einen Push herum öffentlich, damit die Läufer nichts kosten.* **Bis zum
  Wort des Betreibers weiß GitHub von nichts.** Der Auslöser hängt seither an
  `push` (jeder Zweig) und an `workflow_dispatch`; ein Push löst den Lauf
  selbst aus.
* **KEIN WIRTSNAME, KEINE ADRESSE, KEINE MAILADRESSE DES BETREIBERS IN EINEM
  PAPIER.** *Am 10. September 2026 stand die Adresse seiner Instanz in zwei
  Papieren eines öffentlichen Repositorys.* **Was er schickt, wird mit seinen
  ZAHLEN zitiert und nicht mit seiner Herkunft.**
* **DER FINGERPRINT WIRD VOR DEM EINSPIELEN GERECHNET** und steht im
  Änderungsprotokoll. *Er deckt `node_modules` NICHT ab.* **Und er hängt an
  jeder Datei der Liste — auch an einem Kommentar:** am 10. September hat ein
  gestrichener Vorname in `auth.js` ihn bewegt, und das ist kein Fehler,
  sondern der Zweck.
* **DIE NUMMER GEHÖRT ANS ENDE DER RUNDE — aber der Code darf nicht vorher
  hinaus.** *Am 10. September lag 0.26.0 vier Stunden auf `main`, während
  `package.json` noch 0.25.4 trug; die Installation zeigte die neue Funktion
  und die alte Zahl.*
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — Stolperstein 47.
* **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90).
* **`group()` SETZT EINE ÜBERSCHRIFT UND KEINE KLAMMER.**
* **EIN FREMDER SERVER MUSS NICHT DEN PORT BELEGEN — ER MUSS NUR ANTWORTEN.**
  *Nach einem abgebrochenen Lauf bleiben verwaiste Server stehen; sie sind vor
  dem nächsten abzuräumen.*
* **GEGENPROBEN GEHEN MIT, STATT GELÖSCHT ZU WERDEN** (Stolperstein 201).
* **EINE GEGENPROBE LÄUFT GEGEN `git archive HEAD`** — *erst committen, dann
  fahren.*
* **EINE ZUSAGE, DIE NUR ZÄHLT, SIEHT KEINEN TAUSCH.** *Am 10. September hielt
  eine Zusage fest, dass der Prüflauf an „genau EINEM Ereignis" hängt — sie
  hätte nicht bemerkt, wenn das eine gegen ein falsches getauscht worden wäre.*
  **Was zählbar ist, gehört zusätzlich namentlich zugesagt.**
