# Farbkonzept 0.23.0 — „Die Oberfläche wird hell"

**Geschrieben am 5. September 2026, im Vorbereitungschat zu 0.23.0.**
*Der Projektstand hat dieses Papier am 4. September 2026 verlangt und den
Grund gleich mitgeschrieben: **eine Farbe lässt sich nicht aus einer anderen
ausrechnen.** Jeder der rund dreißig Werte ist eine eigene Entscheidung, und
die fällt man einmal in Ruhe und nicht fünfzigmal beim Bauen.*

**Stand, auf dem es aufsetzt:** 0.22.1, Fingerprint `15c9b736` — der Stand von
`main` am 5. September 2026 (`bc175ce`), nach den vier Funden der Gegenprobe.
**Derselbe Bau läuft am Wirt.**

**Die Bestandsaufnahme in Abschnitt 10 ist auf `bc175ce` nachgezählt:** 32
Variablen, 68 Zeilen, 36 Hex- und 38 rgba-Literale.

---

## 0. Wie dieses Papier entstanden ist

**Der Betreiber hat eine fremde Vorlage mitgebracht.** Fünf Bilder: zwei vom
Telefon aus dem laufenden Betrieb, zwei Entwürfe vom Schreibtisch und ein
A/B-Vergleich zweier Tagwolken. Sie stammen nicht aus diesem Projekt, sondern
von einer anderen Maschine, und sie waren ausdrücklich **als Anschauung
gemeint, nicht als Vorlage**: *„letztlich muss es zum Stil passen und auch
alle Schriften und Buttons lesbar sein."*

**Sie sind nachgemessen worden und nicht angesehen.** Was daraus übernommen
ist und was nicht, steht in Abschnitt 11 — mit der Zahl daneben, an der es
entschieden wurde.

**Sieben Entscheidungen sind im Gespräch gefallen** (Abschnitt 12). Keine
davon ist beim Bauen noch offen.

---

## 1. Worum es geht

Kriterion ist seit jeher nur dunkel: `color-scheme: dark` im Kopf der Seite,
`theme-color #0e1012` als Farbe der Browserleiste, **32 Farbwerte in `:root`**,
die alle einen dunklen Grund voraussetzen.

**Es kommt ein zweites Schema — hell, umschaltbar, und die Vorgabe bleibt
dunkel.** Wer nichts einstellt, sieht, was er heute sieht.

---

## 2. Der Befund: die heutige Palette hat eine Geometrie

**Sie ist nirgends aufgeschrieben.** Herausgerechnet aus den 32 Werten:

| | Ton (H) | Sättigung (S) |
|---|---|---|
| **alle elf Neutralen** — `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--line-2`, `--text`, `--text-2`, `--muted`, `--faint`, `--star-off` | **207–212°**, also praktisch **210°** | **7,8 – 15,8 %** |
| die fünf Bedeutungsfarben | 25° · 43° · 157° · 207° · 357° | 63 – 100 % |

**Jeder neutrale Wert der Instanz ist derselbe Ton bei derselben niedrigen
Sättigung — nur in anderer Helligkeit.** Das ist der eigentliche Fund dieses
Papiers, und er bindet: **ein zweites Schema, das diesen Ton verlässt, ist
nicht dasselbe Haus bei Tag, sondern ein anderes Haus.**

**Alle fünf Bedeutungsfarben fallen auf hellem Grund durch.** Gemessen gegen
Weiß:

| | Wert | auf Weiß |
|---|---|---|
| Gold | `#ffc531` | **1,58 : 1** |
| Grün | `#3fd39a` | **1,91 : 1** |
| Orange | `#ff7a1a` | **2,61 : 1** |
| Blau | `#4d9de0` | **2,91 : 1** |
| Rot | `#f0555c` | **3,41 : 1** |

*Keine erreicht 4,5. Das ist der Grund, warum dieses Papier vor dem Auftrag
steht und nicht in ihm.*

---

## 3. Der tragende Gedanke — die Meßlatte

> **Das helle Schema wird nicht ausgerechnet und nicht gespiegelt. Es wird an
> derselben Meßlatte gebaut, an der das dunkle heute hängt — und es darf sie
> an keiner Paarung unterschreiten.**

Das ist zugleich die Antwort auf die Frage des Projektstands, *woran
Lesbarkeit gemessen wird*: **nicht an der WCAG-Schwelle allein, sondern am
eigenen Bestand.**

Das dunkle Schema erreicht heute:

| Paarung | dunkel, heute |
|---|---|
| `--text` auf der Karte | 14,88 : 1 |
| `--text-2` auf der Karte | 9,00 : 1 |
| `--muted` auf der Karte | 5,17 : 1 |
| `--faint` auf der Karte | 3,21 : 1 |
| Stern an gegen Stern aus | 6,45 : 1 |
| Rand auf der Karte | 1,25 : 1 |

**Diese Zahlen sind die Abnahme.** Sie sind strenger als AA, und sie sind
nicht verhandelbar, weil sie schon stehen.

**Und sie werden gegen den härteren der beiden Gründe geprüft.** Eine Farbe,
die auf der weißen Karte trägt, kann auf dem grauen Grund der Seite
durchfallen — der Unterschied beträgt rund 15 Prozent. **Geprüft wird gegen
`--bg`, nicht gegen `--surface`.**

---

## 4. Die Palette

### 4.1 Die Neutralen

```
                 dunkel (heute)   hell (neu)    Ton
--bg             #0e1012          #eaedf1       210°
--surface        #16191c          #ffffff       — (die Karte)
--surface-2      #1c2126          #f4f6f8       210°
--surface-3      #232930          #e3e7ec       210°
--line           #262c33          #d0d7de       210°
--line-2         #1e2429          #e7ebef       210°
--text           #e9ecef          #14181c
--text-2         #b3bac1          #3f4851
--muted          #838c95          #616b75
--faint          #616a73          #767f89
--star-off       #3a424a          #d3dae1
```

**Die Stufenleiter kehrt ihre Richtung um, nicht ihre Bedeutung.** Im dunklen
Schema heißt „eine Stufe hervortreten" *heller*; im hellen heißt es *dunkler*.
`--surface-3` ist in beiden die Hover-Fläche — einmal über, einmal unter der
Karte.

**Gemessen:**

| Paarung | dunkel | hell |
|---|---|---|
| `--text` auf der Karte | 14,88 | **17,84** |
| `--text-2` auf der Karte | 9,00 | **9,30** |
| `--muted` auf der Karte | 5,17 | **5,43** |
| `--faint` auf der Karte | 3,21 | **4,06** |
| `--muted` auf dem Grund | 5,58 | **4,62** |
| `--faint` auf dem Grund | 3,47 | **3,46** |
| Grund → Karte | 1,08 | **1,17** |
| Karte → Fläche 2 | 1,09 | **1,08** |
| Fläche 2 → 3 (Hover) | 1,11 | **1,15** |
| Rand auf der Karte | 1,25 | **1,45** |

**Warum `#eaedf1` und nicht Weiß.** Das tragfähige Fenster für den Grund ist
schmal und es ist ausgemessen:

| Grund | Karte hebt sich ab | `--muted` | schwächste Bedeutungsfarbe |
|---|---|---|---|
| `#e4e8ed` | 1,23 | **4,41 ✗** | **4,31 ✗** |
| **`#eaedf1`** | **1,17** | **4,62** | **4,52** |
| `#f2f4f7` | 1,10 | 4,93 | 4,82 |
| `#f7f8fa` | 1,06 | 5,11 | 4,99 |
| `#ffffff` | **1,00 ✗** | 5,43 | 5,31 |

*Nach unten begrenzt `--muted` das Fenster, nach oben die Karte. `#eaedf1`
steht am unteren Ende — dort, wo die Karte am deutlichsten liegt.*

### 4.2 Die fünf Bedeutungsfarben

**Sie behalten ihre Bedeutung (G1) und bekommen einen zweiten Wert.**

| Bedeutung | dunkel | hell | auf Karte | auf Grund |
|---|---|---|---|---|
| **Gold** — Bewertung, Anheftung | `#ffc531` | **`#8f6306`** | 5,31 | 4,52 |
| **Orange** — Art und Bedienung *(als Text)* | `#ff7a1a` | **`#ad4f0b`** | 5,38 | 4,59 |
| **Grün** — erledigt, getestet | `#3fd39a` | **`#0c7a54`** | 5,35 | 4,55 |
| **Blau** — die Aufgabe | `#4d9de0` | **`#1d6eb6`** | 5,31 | 4,52 |
| **Rot** — das Zerstören | `#f0555c` | **`#cb2a32`** | 5,36 | 4,57 |

**Die fünf liegen zwischen 5,31 und 5,38.** Das ist kein Zufall, sondern das
Ergebnis derselben Rechnung — und es ist der Grund, warum sie sich als *eine
Familie* lesen und nicht als fünf Einzelentscheidungen.

### 4.3 Die Tönungen und die Schatten

```
--accent          #ff7a1a                    #ff7a1a        UNVERAENDERT
--accent-hi       #ff9440                    #ec6a05        (Hover: heller / dunkler)
--accent-text     = var(--accent)            #ad4f0b        NEU
--accent-dim      rgba(255,122,26,.13)       rgba(255,122,26,.16)
--accent-line     rgba(255,122,26,.42)       = var(--accent-text)
--gold-line       rgba(255,197,49,.52)       rgba(143,99,6,.55)
--green-dim       rgba(63,211,154,.13)       rgba(12,122,84,.10)
--red-dim         rgba(240,85,92,.13)        rgba(203,42,50,.09)

--sh-sm           0 1px 2px  rgba(0,0,0,.40) 0 1px 2px  rgba(20,26,33,.06)
--sh              0 4px 16px rgba(0,0,0,.45) 0 4px 16px rgba(20,26,33,.10)
--sh-lg           0 12px 40px rgba(0,0,0,.60) 0 12px 40px rgba(20,26,33,.16)
```

*Schwarz bei 45 Prozent über Weiß ist Ruß. Auf hellem Grund trägt ohnehin der
Rand und nicht der Schatten — deshalb fällt das Alpha auf ein Sechstel und der
Ton geht von reinem Schwarz auf die 210° der übrigen Palette.*

---

## 5. Die fünf Regeln, die aus der Messung fallen

### F1 · Die Fläche trägt die Marke, der Rand trägt den Kontrast

**`--accent` bleibt in beiden Schemata `#ff7a1a`.** Dieselbe Farbe wie
`favicon.svg` — die Marke bekommt keinen zweiten Wert.

Aber Orange als **Fläche** misst auf Weiß nur **2,61 : 1** und bleibt damit
unter der Schwelle für Bedienelemente (3,0 nach WCAG 1.4.11). Deshalb trägt im
hellen Schema der **Rand** in `--accent-text` die Grenze — **5,38 : 1** — und
die Schrift darauf bleibt `#14161a` mit **6,94 : 1**.

> **Weiße Schrift auf orangem Knopf misst 2,61 : 1 und ist ausgeschlossen.**
> Kriterion macht es heute schon richtig; die fremde Vorlage machte es falsch.

### F2 · Nur Orange braucht zwei Werte

Gold, Grün, Blau und Rot tragen mit **einem** dunklen Wert als Text *und* als
Fläche. Orange nicht — weil es als einziges auch die **Markenfläche** ist.

**Also `--accent-text` und sonst nichts.** *Ein erster Entwurf sah fünf
Farben mit je zwei Werten vor. Die Messung hat vier davon als überflüssig
ausgewiesen — sie stehen hier, damit sie nicht ein zweites Mal erfunden
werden.*

### F3 · Tönungen werden im hellen Schema aus dem Textwert gemischt

`--accent-line` als Alpha von `rgba(255,122,26,…)` erreicht auf Weiß **auch
bei voller Deckung nur 2,61 : 1** — es gibt kein Alpha, das sie rettet.

| Alpha aus `--accent` | ergibt | gegen die Karte |
|---|---|---|
| .45 | `#ffc398` | 1,55 |
| .65 | `#ffa96a` | 1,89 |
| 1,00 | `#ff7a1a` | 2,61 |

**Auf hellem Grund fallen `--accent-line` und `--accent-text` deshalb
zusammen** — ein Wert weniger, und der Grund steht als Zahl da.

### F4 · Dämpfung schiebt zum Grund hin, nicht zu Schwarz

`.card.rejected` dämpft heute mit `grayscale(.85) brightness(.5)`. Ein
mittleres Foto gegen seine Karte:

| | gedämpft | ungedämpft |
|---|---|---|
| dunkel, `brightness(.5)` — heute | **1,71 : 1** | 4,51 : 1 |
| hell, `brightness(.5)` — **falsch** | **10,33 : 1** | 3,91 : 1 |
| hell, **`opacity(.45)`** | **1,71 : 1** | 3,91 : 1 |

**`opacity(.45)` auf hellem Grund erzeugt exakt dieselbe Dämpfung wie
`brightness(.5)` auf dunklem — 1,71 in beiden.** Mit `brightness(.5)` wäre der
abgelehnte Eintrag **lauter als ein normaler** gewesen: der dunkelste Fleck
einer hellen Seite.

### F5 · Was auf einem Foto liegt, folgt dem Foto und nicht dem Schema

Die Abzeichen, Zähler und Löschkreuze auf den Bildkacheln liegen auf
**Bildinhalt**, nicht auf der Seite. Ihr Grund ist unbekannt und in beiden
Schemata derselbe.

**`--foto-schleier` und `--auf-foto` haben in beiden Schemata denselben
Wert.** Sie sind keine Ausnahme von der Regel, sondern ihre Anwendung: sie
folgen ihrem Grund, und ihr Grund ist das Foto.

---

## 6. Der Betrachter — ein Raum mit eigenem Licht

**Das Vollbild bleibt in beiden Schemata dunkel. Aber nicht gleich dunkel.**

| Umfeld | Helligkeit (L) |
|---|---|
| Kriterion Vollbild **heute** (dunkles Schema) | **2,9 %** — praktisch schwarz |
| Adobe Lightroom | 20 % |
| Capture One | 19,6 % |
| **Vollbild im hellen Schema: `#2b323a`** | **19,8 %** |

*Ein fast schwarzes Umfeld lässt Fotos heller und kontrastreicher erscheinen,
als sie sind — deshalb sitzen die Bildwerkzeuge alle bei rund 20 Prozent. Im
dunklen Schema gewinnt die Geschlossenheit der Oberfläche; im hellen gibt es
nichts zu schließen, und dort gewinnt das Bild.*

**Die Folge, die nachgesehen werden musste:** der Betrachter benutzt heute
**acht** Schema-Variablen — `--text`, `--text-2`, `--muted`, `--line`,
`--surface`, `--surface-3`, `--accent`, `--red`. Bliebe er dunkel, während
`--text` auf `#14181c` geht, stünde seine Bedienung mit **1,38 : 1** da. Sie
wäre weg.

**Die Lösung kostet keine einzige Regeländerung.** CSS-Variablen vererben
sich:

```css
[data-thema="hell"] .lightbox {
  --bg: #2b323a;  --surface: #363e47;  --surface-3: #434c56;
  --line: #4a535e; --text: #eef1f4;  --text-2: #c2c9d1;  --muted: #96a0aa;
}
```

Jede `var(--text)`-Regel im Betrachter greift von selbst auf den örtlichen
Wert. **Gemessen gegen den Grund `#2b323a`:**

| | Wert | gegen den Grund |
|---|---|---|
| Bedienung, Blätterpfeile | `#eef1f4` | 11,43 |
| Titel, Knopfschrift | `#c2c9d1` | 7,76 |
| Zähler | `#96a0aa` | 4,88 |
| aktives Vorschaubild (`--accent`) | `#ff7a1a` | 4,97 |
| Löschen (`--red`) | `#f0555c` | 3,80 |
| Hover-Stufe | | 1,24 *(dunkel: 1,11)* |

> **Der Betrachter ist ein Raum mit eigenem Licht — und CSS hat das Mittel
> dafür schon.** Neun Zeilen, keine acht Sonderfälle.

**`--red` und `--accent` behalten im Betrachter ihre dunklen Werte**, weil der
Raum dunkel ist. Das ist keine dritte Fassung: es ist derselbe Mechanismus wie
oben.

---

## 7. Die Fotos auf hellem Grund

**Der Bildgrund der Kachel.** `.card-img` steht heute auf `#0a0c0e` — gegen
eine weiße Karte sind das **19,59 : 1**, der lauteste Fleck der ganzen Seite.
Ein Hochformat in quadratischer Kachel zeigt links und rechts davon eine
schwarze Wand.

**Er wird `--surface-3` (`#e3e7ec`, 1,24 : 1).** Dieselbe Rolle wie heute — eine
Fläche, die zurücktritt, damit das Foto vorne steht —, nur in die andere
Richtung.

**Im Betrachter bleibt er dunkel**, aus dem Grund in Abschnitt 6.

**Die Dämpfung** steht in F4 und ist ausgerechnet.

---

## 8. Die Marke

**Sie fällt auf hellem Grund durch.** `marke-dunkel.svg` — der Dateiname sagt
es selbst:

| | auf dunklem Grund | auf hellem Grund |
|---|---|---|
| die drei grauen Striche `#838c95` | 5,58 | **2,91 ✗** |
| der orange Strich `#ff7a1a` | 7,31 | **2,22 ✗** |

**Sie wird inline ausgegeben statt als Datei geladen.** `MARK()` in `app.js`
gibt das SVG direkt in den Baum; seine zwei Striche werden zu
`var(--marke-grau)` und `var(--marke-strich)` — **und die Marke folgt dem
Schema ohne eine Zeile JavaScript.**

```
--marke-grau     #838c95   →   #69737d   (4,11 auf hellem Grund)
--marke-strich   #ff7a1a   →   #ad4f0b   (4,59 auf hellem Grund)
```

**`public/marke-dunkel.svg` fällt weg.** *Zwei Dateien über dieselbe Sache
dürfen sich nicht widersprechen — Stolperstein 47. Eine zweite Datei
`marke-hell.svg` wäre genau das gewesen, und sie hätte beim Umschalten ein
Neuzeichnen der Kopfzeile gekostet.*

**`public/favicon.svg` bleibt unverändert.** Es bringt seine eigene dunkle
Kachel mit (`<rect fill="#16191c">`) und steht damit auf jeder Leiste — hell
wie dunkel. *Das ist kein Versehen, das war 2026 schon so gedacht.*

---

## 9. Die Maschine — umschalten und speichern

### 9.1 Wo eingestellt wird

**Karte „Darstellung", Abschnitt „Persönlich"** — als Pillenreihe über der
Schriftgröße, dieselbe Bauform wie `schrift` und `streifen`.

```
Farbschema   [ Hell ]  [ Dunkel ]  [ Wie das Gerät ]
```

**Drei Stufen. Die Vorgabe ist `dunkel`** — nicht „wie das Gerät". *Wer nichts
einstellt, sieht, was er heute sieht.*

**Kein Schalter in der Kopfzeile.** Die Darstellung wird in der Karte
„Darstellung" eingestellt, sonst gäbe es zwei Orte für dieselbe Frage.

### 9.2 Wie gespeichert wird

* `PERSOENLICHE_SCHLUESSEL` wächst von **9 auf 10**: `thema` kommt dazu.
* `PUT /api/settings` bekommt **eine** Klemme gegen `THEMA_STUFEN =
  ['hell','dunkel','geraet']` — dieselbe Bauform wie `SCHRIFT_STUFEN`.
* **Keine neue Route. Kein Schema. Kein Bestandslauf.**

### 9.3 Wie es im Stilblatt steht

**Ein Attribut `data-thema` am Wurzelelement, und es hat genau zwei Werte:
`hell` und `dunkel`.**

„Wie das Gerät" wird in **`app.js`** aufgelöst, nicht im Stilblatt:

```js
const wirksamesThema = () =>
  THEMA === 'geraet'
    ? (matchMedia('(prefers-color-scheme: light)').matches ? 'hell' : 'dunkel')
    : THEMA;
```

> **Das Stilblatt kennt den dritten Zustand nicht.** Stünde er dort, müsste
> jeder Wert **dreimal** geschrieben werden — in `:root`, in
> `[data-thema="hell"]` und noch einmal in einer Medienabfrage. **So gibt es
> genau einen zweiten Block.**

Ein Horcher auf `matchMedia` zieht nach, wenn der Benutzer sein Gerät
umstellt — **ohne Neuladen**, und nur solange `thema === 'geraet'`.

### 9.4 Was vor dem ersten Anstrich zu sehen ist

**Das Schema steht in `user_settings` und ist erst nach `GET /api/settings`
bekannt.** Ohne Vorgriff blitzt bei jedem Laden das falsche Schema auf — *der
bekannteste Fehler dieser Bauart, und er fällt erst im Feld auf.*

**Ein Achtzeiler im `<head>`, vor dem Stilblatt:**

```html
<script>
  try {
    var t = localStorage.getItem('kriterion.thema');
    if (t === 'geraet' || !t)
      t = (!t) ? 'dunkel'
        : (matchMedia('(prefers-color-scheme: light)').matches ? 'hell' : 'dunkel');
    document.documentElement.dataset.thema = (t === 'hell') ? 'hell' : 'dunkel';
  } catch (e) { document.documentElement.dataset.thema = 'dunkel'; }
</script>
```

> **`localStorage` ist keine zweite Wahrheit, sondern das Gedächtnis der
> letzten.** Der Server bleibt die Wahrheit: `ladeEinstellungen()`
> überschreibt den Wert bei **jedem** Laden, und er wird **nie** an den Server
> zurückgeschickt. Er wird gelesen, um nicht zu blitzen — und sonst zu nichts.

**Der Randfall ist benannt und hingenommen:** zwei Benutzer an einem Browser.
B sieht für Sekundenbruchteile das Schema von A, dann berichtigt der Server.
*Das ist billiger als ein Blitzen bei jedem Laden für jeden.*

**`try/catch` ist Pflicht:** in einem privaten Fenster wirft der Zugriff
selbst, und dann muss die Vorgabe stehen.

### 9.5 Die Anmeldeseite

`start()` läuft erst nach der Anmeldung — **die Anmeldeseite sieht deshalb den
gemerkten Wert**, und ohne Gedächtnis: **dunkel**. Dieselbe Regel wie oben, und
sie gilt auch vor dem Anmelden.

### 9.6 `theme-color` und `color-scheme`

**Zwei Werte, von `app.js` gesetzt** — nicht als zweites `<meta media=…>`.

```
dunkel   #0e1012      (= --bg, wie heute)
hell     #eaedf1      (= --bg)
```

*Die Wahl ist eine der Anwendung und keine des Geräts. Eine Medienabfrage im
Kopf der Seite kennt sie nicht — sie kennt nur das Gerät, und genau darum geht
es hier nicht.*

**Der Vermerk im Kopf der Seite bleibt gültig und wird nur ergänzt:** der Wert
ist `--bg` und darf keine zweite Wahrheit sein. **Zwei Schemata heißen zwei
Werte, und beide stehen an einer Stelle in `app.js`.**

`<meta name="color-scheme" content="dark">` wird zu `"light dark"`, und die
tatsächliche Stellung setzt das Stilblatt je Block über die
CSS-Eigenschaft `color-scheme`. *Davon hängen die nativen Bedienelemente ab —
Auswahlfelder, Rollbalken, Datumswähler.* Die eine feste Stelle
(`style.css:1246`, `color-scheme: dark` an `.select`) fällt damit weg.

---

## 10. Die Bestandsaufnahme — die Arbeitsmenge

*Der Projektstand nennt sie „die eigentliche Arbeitsmenge der Runde, und sie
ist heute unbekannt". **Sie ist jetzt bekannt.***

```
  32   Farbwerte in :root                                  → 31 zweite Werte (F3 spart einen)
  68   Zeilen ausserhalb :root mit fester Farbe            ← DIE EIGENTLICHE ARBEIT
       davon 36 Hex-Literale und 38 rgb/rgba-Literale
 266   Regeln, die schon sauber ueber Variablen gehen      → bleiben unberuehrt
3567   Zeilen style.css insgesamt
```

**Die 68 Zeilen sind nicht 68 Entscheidungen, sondern acht.**

| neue Variable | ersetzt | Stellen | im hellen Schema |
|---|---|---|---|
| `--line-hover` | `#333b44`, `#3a434c`, `#363e47` | **17** | `#b9c2cb` |
| `--foto-schleier` | `rgba(8,10,12,.78–.88)` | **13** | *gleich* (F5) |
| `--bild-grund` | `#0a0c0e`, `#08090b`, `#14181c` | **8** | `#e3e7ec` |
| `--auf-accent` | `#14161a` (Schrift auf Orange) | **7** | *gleich* (F1) |
| `--red-line` / `--green-line` | die roten und grünen Tönungen | **12** | aus dem Textwert (F3) |
| `--schleier` | `rgba(6,7,9,.78)` — Dialoggrund | **2** | `rgba(20,26,33,.55)` |
| `--auf-signal` | `#fff` auf Rot | **2** | *gleich* |
| `--auf-foto` | `var(--text-2)` auf Bildabzeichen | **5** | *gleich* (F5) |

**Was in der Positivliste bleibt und fest bleiben darf:**

* `#000` hinter `<video>` — der Balken beim Seitenverhältnis. **Er ist der
  Rand eines Videos und keine Fläche der Oberfläche.**
* `transparent`, `currentColor`.

**Das ist alles.** Die Zusage an den Prüfstand — *keine Farbe steht fest im
Stilblatt, die eine Bedeutung trägt* — wird damit nahezu absolut.

---

## 11. Was aus der fremden Vorlage übernommen ist

**Übernommen:**

| was | warum |
|---|---|
| **Weiße Karten auf grauem Grund** | Die Stufenleiter kehrt die Richtung um und behält ihre Bedeutung (4.1). Der Grund ist ausgemessen, nicht abgemalt |
| **Variante 2 der Tagwolke** — dunkler Text auf hellem Orange | Misst **4,62 : 1** und braucht **keinen neuen Farbwert**: sie ist `--accent-dim` als Fläche plus `--accent-text` als Schrift. Beide muss das helle Schema ohnehin haben |

**Nicht übernommen:**

| was | die Zahl, an der es scheitert |
|---|---|
| **Weiße Schrift auf orangem Knopf** | **2,61 : 1.** Kriterion macht es heute schon richtig: `#14161a` auf Orange = 6,94 : 1 |
| **Blaustichiger Grund** (~`#e8ebf2`) | Sättigung deutlich über 16 % — verlässt die 210°-Geometrie (Abschnitt 2) und bringt einen Blauton, **der laut G1 der Aufgabe gehört** |
| **Variante 1 der Tagwolke** — heller Text auf dunklem Orange | Trägt zwar (6,07 : 1), ist aber eine **zweite Orangefamilie**: ein neuer Farbwert für eine bereits vergebene Bedeutung. **G1 verbietet das** |

---

## 12. Die Entscheidungen — sieben, und sie sind gefallen

| # | Frage | Entscheidung |
|---|---|---|
| **E1** | Wie steht das Schema im Stilblatt? | **Ein Attribut `data-thema` mit zwei Werten.** „Wie das Gerät" löst `app.js` auf. Genau ein zweiter Block (9.3) |
| **E2** | Wo wird eingestellt? | **Karte „Darstellung", Abschnitt „Persönlich".** Drei Stufen, Vorgabe `dunkel`. Kein Schalter in der Kopfzeile (9.1) |
| **E3** | Was steht vor dem ersten Anstrich? | **`localStorage` plus Achtzeiler im `<head>`.** Der Server bleibt die Wahrheit (9.4) |
| **E4** | Was sieht die Anmeldeseite? | **Den gemerkten Wert; ohne Gedächtnis dunkel** (9.5) |
| **E5** | `theme-color` | **Zwei Werte, von `app.js` gesetzt** (9.6) |
| **E6** | Das Vollbild | **Bleibt dunkel — aber dunkelgrau (`#2b323a`, L 19,8 %), nicht schwarz.** Über örtliche Variablen, ohne Regeländerung (Abschnitt 6) |
| **E7** | Die Schatten | **Alpha auf ein Sechstel, Ton 210° statt Schwarz** (4.3) |

**Dazu drei Werte, die im Gespräch bestätigt wurden:** der Grund `#eaedf1`
(unteres Ende des Fensters), der Betrachter `#2b323a` (Lightroom-Niveau), und
die Marke inline statt als zweite Datei.

---

## 13. Was es ausdrücklich NICHT wird

| was | warum nicht |
|---|---|
| **Eine neue Farbfamilie fürs helle Schema** | Die Bedeutungen sind vergeben (G1). Zwei Schemata sind zwei Werte je Bedeutung, nicht zehn Bedeutungen |
| **Ein Schalter in der Kopfzeile** | Sonst gäbe es zwei Orte für dieselbe Frage |
| **Ein drittes Schema („Kontrast", „Sepia")** | Ein zweites ist eine Entscheidung; ein drittes ist eine Sammlung |
| **Nur `prefers-color-scheme` ohne eigene Einstellung** | Wer am hellen Bildschirm dunkel arbeiten will, könnte es dann nicht mehr — die Wahl ist der Punkt |
| **Eine zweite Markendatei** | Stolperstein 47: zwei Dateien über dieselbe Sache (Abschnitt 8) |
| **Ein helles Vollbild** | Das Bild gewinnt gegen die Geschlossenheit (Abschnitt 6) |
| **Neue Farben in `favicon.svg`** | Es bringt seine eigene Kachel mit und steht auf jeder Leiste |

---

## 14. Woran die Abnahme hängt

**Am Zahlenwert:**

1. **Kein Wert des hellen Schemas unterschreitet, was das dunkle an derselben
   Paarung heute erreicht** (Abschnitt 3).
2. **Fließtext ≥ 4,5 : 1 gegen den härteren der beiden Gründe**, also gegen
   `--bg`.
3. **Bedienelemente, Ränder und Sterne ≥ 3,0 : 1** (WCAG 1.4.11). *Stern an
   gegen Stern aus: 3,76.*
4. **`--faint` ist nie tragender Text** — die einzige Variable unterhalb 4,5,
   und sie war es im dunklen Schema auch schon.

**Am Augenschein, und zwar an echten Einträgen:**

5. Ein **Hochformat** in quadratischer Kachel — der Bildgrund links und rechts.
6. Ein **abgelehnter** Eintrag neben einem normalen — die Dämpfung nach F4.
7. Das **Vollbild aus der hellen Seite heraus** — der Sprung ist 11,0 : 1 und
   soll einer sein.
8. Ein **Dialog** aus dem Vollbild heraus — Schleier über Schleier.
9. Die **Kopfzeile beim Rollen** — `--sh-sm` bei einem Sechstel des Alphas.

**Am Prüfstand:** Abschnitt 10, die acht Gruppen und die Positivliste.

---

## 15. Was dieses Papier NICHT entscheidet

**Ob das helle Schema kommt.** *Die Frage ist im Fahrplan entschieden; hier
steht nur, wie es aussieht und wie es gebaut wird.*

**Die Reihenfolge der Bauabschnitte.** Sie steht im Auftrag.

---

*Alle Zahlen dieses Papiers sind gerechnet, nicht geschätzt: WCAG-2.1-Kontrast
über die relative Leuchtdichte nach sRGB. Der Rechenweg liegt dem Auftrag
bei — er gehört in den Prüfstand und nicht in ein Papier.*
