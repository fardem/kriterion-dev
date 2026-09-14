# Auftrag 0.33.0 — „Bereinigung — der Bruch"

**Geschrieben am 14. September 2026 · gebaut auf 0.32.1 · MINOR — und trotzdem
DER BRUCH: die Runde legt nichts dazu, sie nimmt weg, was einen Rückweg
offenhält.** *Solange die erste Zahl 0 ist, läuft ein Bruch über MINOR.*

> **UND DER BODEN IST GEPRÜFT UND NICHT ANGENOMMEN:** *Fingerprint der Basis
> `24899ab8`* — **nachgerechnet am 14. September 2026, und zwar mit einer
> ZWEITEN Rechnung.** *Nicht die Karte des laufenden Servers und nicht der Wert
> aus dem Protokoll: die Vorschrift aus `buildFingerprint()` ist in einem
> eigenen kleinen Skript nachgebaut und über die achtzehn Dateien gefahren
> worden. Sie kommt auf denselben Wert, auf dem Baum `a6bb974c`, und der ist
> byteweise `origin/main` nach dem Zusammenführen von 0.32.1.*

> **VIERMAL GERÜCKT UND JETZT AN DER REIHE.** *0.28.0 → 0.30.0 → 0.31.0 →
> 0.32.0 → 0.33.0; das letzte Mal auf Wunsch des Betreibers* („Bruch mal auf die
> 0.33.0 legen.. ist auch ne schöne Zahl"). **Die Regel darunter hat jedes
> Rücken überstanden:** *der Bruch kommt NACH der letzten Runde, die das Schema
> anfassen darf.* **Das war 0.32.0** *(`comment_mentions`, 27 Tabellen wurden
> 28)*, **und 0.32.1 hat nur noch Sätze angefasst. Es steht nichts mehr davor.**

> **UND DIE VORAUSSETZUNG, AUF DER DIE GANZE RUNDE STEHT — vom Betreiber am
> 14. September 2026, nachdem er den Auftrag gelesen hatte:**
>
> *„Heute geht es darum, dass jemand entweder ganz frisch nach einem Download
> von Kriterion anfängt oder bereits 0.33.0 und darüber hat. Alles darunter
> wird ein normaler User nie zu Gesicht bekommen. Das war unser beider
> Entwicklungsarbeit."*
>
> **DAS IST DIE AUSSAGE, DIE DEN BRUCH ÜBERHAUPT ERST BILLIG MACHT.** *Die
> achtzehn Blöcke holen einen Bestand nach, den es draußen nicht gibt: jede
> Fassung unter 0.33.0 ist auf genau zwei Maschinen gelaufen, und beide sind
> heute aktuell.* **Es gibt keine fremde Datenbank zu schützen — es gibt nur
> die Annahme, dass es keine gibt.** *Und genau deshalb fällt die Absage aus
> Strang 3 nicht mit weg, sondern wird gebaut:* **sie ist der Unterschied
> zwischen „wir glauben es" und „das Programm sieht nach".**

---

## Der Befund, der diesen Auftrag über den Fahrplan hebt

> **ES SIND ACHTZEHN UND NICHT ZWÖLF.**

Der Fahrplan sagt seit 0.29.0 „zwölf Migrationsblöcke raus", und der Prüfstand
hält die Zahl namentlich (`testbench.js:18221`). **Beide haben recht — und beide
zählen dasselbe Muster.** Gezählt werden Marken der Form

```
// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0
```

— **eine Zeile, ein Kommentarstrich.** *Die sechs Blöcke der Sprachrunde 0.24.x
tragen ihre Absage aber im BLOCKKOMMENTAR, auf einer eigenen Zeile darunter:*

```
/* ================= MIGRATION 0.24.1 — DIE NAMEN DES BESTANDS ==============
   ENTFAELLT MIT 1.0.
```

**Das Muster findet sie nicht, und damit findet sie auch der Fahrplan nicht.**
*`db.js` trägt achtzehn Funktionen, die `migration…` heißen, und alle achtzehn
sagen „ENTFAELLT MIT 1.0".* **Stolperstein 156 in Reinform: gezählt wird, was
gemeint ist, und nicht, was dasteht** — *nur diesmal ist der Zähler selbst der
Betroffene.*

| | Blöcke | wo | Zeilen | läuft |
|---|---|---|---|---|
| **gezählt** | **zwölf** — 0.8.3 · 0.8.30 · 0.8.31 · 0.8.40 · 0.8.50 · 0.14.0 · 0.16.0 · 0.19.0 · 0.21.0 · 0.25.0 · 0.27.0 · 0.29.0 | `db.js:1430–1867` | **426** | **NACH** `db.exec(SCHEMA)` |
| **nicht gezählt** | **sechs** — `migration0241Tables` · `migration0241Columns` · `migration0241Values` · `migration0242Shapes` · `migration0243Language` · `migration0243Stored` | `db.js:923–1424` | **502** | **VOR** `db.exec(SCHEMA)` |

**Zusammen 928 Zeilen — 43 Prozent von `db.js`.** *Die Datei hat 2146.*

> **DIE GRENZE BEI `db.exec(SCHEMA)` IST KEINE ORDNUNGSFRAGE, SONDERN DIE
> SACHE SELBST.** *Die sechs stehen davor, weil `CREATE TABLE IF NOT EXISTS`
> eine vorhandene Tabelle nicht anfasst: liefe die DDL zuerst, stünde neben
> dem vollen `papierkorb` ein leeres `trash`, und `ALTER TABLE … RENAME TO`
> scheiterte an einem Namen, den es schon gibt. **Die Zeilen wären nicht
> verloren, aber unsichtbar — der schlimmste aller Ausgänge.*** **Wer hier
> wegnimmt, darf diese Grenze nicht verschieben.**

**UND DER BETREIBER HAT ENTSCHIEDEN — am 14. September 2026, ohne Zögern:**
*„Ja, alles was für die Migration von den Zwischenschritten notwendig war, kann
weg."* **ALLE ACHTZEHN FALLEN, die sechs der 0.24er Runde eingeschlossen**
*(F2)*. *Sie sind teurer als die zwölf — sie hängen an
`tools/dictionary.json`, und dieselbe Datei übersetzt beim Import alte
Exportdateien —, aber ein Bruch, der die Hälfte stehen lässt, wäre keiner.*

### Und die Marke sagt selbst, was diese Runde ist

> **DER BETREIBER AM 14. SEPTEMBER 2026:** *„Die 0.33.0 ist quasi die 1.0."*

**ER HAT RECHT, UND DER QUELLTEXT SAGT ES WÖRTLICH.** *Jede der achtzehn Marken
heißt* **„ENTFAELLT MIT 1.0"** *— und keine sagt „entfällt mit 0.33.0".* **Sie
sind geschrieben worden, bevor der Fahrplan die Bereinigung nach vorn zog**, und
sie sind seither stehen geblieben. *Die Arbeit, die dieser Auftrag beschreibt,
ist wortwörtlich die Arbeit, die der Quelltext dem 1.0 zugeschrieben hat.*

**Was von 1.0 danach noch übrig ist — und es merkt niemand, der die Anwendung
benutzt:**

| Runde | was sie tut | merkt der Bestand etwas davon? |
|---|---|---|
| **0.33.x** | die Kommentare werden knapp *(16.281 von 54.822 Zeilen)* | **nein** |
| **0.34.0** | `testbench.js` wird ein Verzeichnis | **nein** — sie liegt nicht einmal im Image |
| **0.35.0** | Leichen und ineffizienter Code | **nein**, wenn sie sauber gemacht ist |
| **1.0.0** | **die Zusage** — Abwärtskompatibilität, feste Schnittstelle, dazu Vorgabewerte und Tastaturbedienung beim Sortieren | eine Zusage ist kein Handgriff |

> **AUS DER SICHT DESSEN, DER DIE ANWENDUNG BETREIBT, IST 0.33.0 DIE LETZTE
> RUNDE, DIE AN SEINEN DATEN ETWAS ÄNDERT.** *Alles danach ist Hausarbeit am
> Quelltext und ein Versprechen.*

**UND DIE NUMMER BLEIBT TROTZDEM 0.33.0 — der Grund steht in der Bedeutung von
1.0 selbst.** *„Die Zusage" heißt: ab hier wird Abwärtskompatibilität
ZUGESICHERT.* **Diese Runde tut das Gegenteil — sie weist alte Datenbanken ab.**
*Ein 1.0, dessen erste Handlung eine Absage ist, wäre das falsche Signal.*
**Solange die erste Zahl 0 ist, darf gebrochen werden, und genau dafür ist sie
da: der Bruch gehört VOR die Zusage und nicht in sie.**

**WAS DARAUS FÜR DEN BAU FOLGT, IST ABER ARBEIT:** *achtzehn Marken sagen einen
Satz, der nach dieser Runde nicht mehr stimmt.* **Fällt ein Block, fällt seine
Marke mit ihm — bleibt einer stehen** *(F2)*, **muss seine Marke berichtigt
werden, sonst steht in `db.js` eine Ankündigung auf eine Fassung, die den Block
gar nicht mehr erreicht.** *Zwei Orte für dieselbe Aussage sind einer zu viel
(Stolperstein 47), und hier ist der zweite Ort der Quelltext selbst.*

---

## 0. Die Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **UMGEDREHT UND NICHT GELÖSCHT.** *Zu jedem Block, der fällt, gehört eine Prüfgruppe, die heute belegt, dass er läuft. Sie wird UMGEDREHT und belegt danach, dass er fort ist — und dass eine Datenbank, die ihn gebraucht hätte, ABGEWIESEN wird* | Stolperstein 74; so gebaut in 0.32.1 an „Filter folgt der Sortierung" |
| **L2** | **DIE ZAHL DER BLÖCKE STEHT AN EINER STELLE.** *Heute steht sie an dreien und stand bis 13.9.2026 an dreien VERSCHIEDEN da. Nach dieser Runde steht sie im Prüfstand und sonst nirgends* | Stolperstein 47 |
| **L3** | **KEIN ABSTURZ ALS ABSAGE.** *Wer eine zu alte Datenbank öffnet, bekommt einen SATZ und keinen Stapelabzug. Er muss daraus lesen können, über welche Fassung er zuerst gehen muss* | `keys.js`, `warnKeyBesideData()` als Vorbild |
| **L4** | **DIE ABSAGE FRAGT DEN BESTAND UND KEINEN MERKER.** *Jeder Block hier fragt heute `sqlite_master` und ist deshalb beliebig oft fahrbar. Ein Merker wäre eine zweite Wahrheit — und er fehlte genau in der Datenbank, um die es geht* | `db.js:942`, Stolperstein 47 |
| **L5** | **DAS AUSTAUSCHFORMAT RÜHRT SICH NICHT.** *Es bleibt 16. Der Bruch ist einer an der DATENBANK; eine Exportdatei von gestern muss morgen noch lesbar sein* | `server.js:6572` |
| **L6** | **KEIN SCHLÜSSEL FÄLLT NUR IN EINER SPRACHE.** *Die Deckungsprobe verlangt in allen drei Dateien dieselben Schlüssel in derselben Folge* | 0.24.0 |
| **L7** | **JEDE ÄNDERUNG AN DEN SPRACHDATEIEN STEHT IN IHRER TAFEL.** *Wortlautprobe gegen `0681d42`, `EG_CHANGED_AFTER_0312`, `TR_CHANGED_AFTER_0313` — und die Bücher von 0.32.1 sind frisch* | 0.31.2 Zusage 10, 0.31.3 |
| **L8** | **DIE README SPRICHT VON DER LAGE UND NICHT VON DER GESCHICHTE.** *Was in dieser Runde fällt, fällt auch aus der Anleitung — der Satz „Wer von einer Fassung vor 0.14.0 kommt, sichert pflichtgemäß" beschreibt danach einen Weg, den es nicht mehr gibt* | Regel 5.6 |

> **DER STAND VOR DER RUNDE, gemessen am 14. September 2026**
> *(`node tools/gleichlaut.js`)*:
>
> | | Einzahl | Mehrzahl |
> |---|---|---|
> | **de** | `6ff26921e11674ff` | `e1428e2484415619` |
> | **en** | `97f89e94bcb911f2` | `81d826369839a242` |
> | **tr** | `f3a2034e18783412` | `5ef5cbd1132e5562` |
>
> **1209 Schlüssel je Datei · 1008 Rückbauten · Prüfstand 7017 · 28 Tabellen ·
> Austauschformat 16.** *Diese Runde nimmt weg: die Zahlen gehen NACH UNTEN,
> und das ist die Probe darauf, dass sie ihre Arbeit getan hat.*

---

## Strang 1 — Die Migrationsblöcke fallen

**Was jeder einzelne von ihnen tut, steht in seinem Kopf, und keiner davon ist
zu raten.** *Die zwölf gezählten rüsten SPALTEN nach — bis auf den elften
(0.27.0), der eine Einstellungszeile übersetzt: aus dem Häkchen `convertImages`
wird die Wahl `imageStore`.* **Der zwölfte (0.29.0) ist das Fälligkeitsdatum an
der Aufgabe und war der letzte, der je dazukam.**

### Was mit ihnen mitgeht — und es ist mehr als `db.js`

| was | wo | Umfang |
|---|---|---|
| die achtzehn Funktionen samt ihren Aufrufen | `db.js:923–1424`, `:1430–1867` | **928 Zeilen** |
| **zehn Namen im `module.exports`** — *sie gehen heute nur deshalb hinaus, weil der Prüfstand sie einzeln fährt* | `db.js:2126–2146` | 10 Zeilen + Kommentare |
| **acht eigene Prüfgruppen** — 0.8.3 · 0.8.30 · 0.8.31 · 0.8.40 · 0.8.50 · 0.14.0 · 0.16.0 · 0.19.0 | `testbench.js:22232–23673` | **1441 Zeilen, 121 Prüfungen** |
| die Zählprüfung „Es gibt genau zwoelf Migrationsfunktionen" und ihre fünf Nachbarn | `testbench.js:18221–18251` | **6 Prüfungen** |
| **acht Rückbauten**, die einen Block stilllegen oder verstümmeln — *219–224 rund um 0.14.0, 447 um 0.19.0, 581 um 0.21.0* | `counterproof.js` | **8** |
| zwei Stellen in der README | `README.md:259 ff`, `:403` | 2 Absätze |

> **DIE ACHT PRÜFGRUPPEN SIND DER TEUERSTE TEIL DIESER RUNDE, und sie sind
> auch der wertvollste.** *Jede legt heute eine Datenbank im alten Zustand an,
> ruft ihren Block und sieht nach, was danach dasteht.* **Umgedreht prüfen sie
> genau die neue Zusage:** *dieselbe alte Datenbank, kein Block mehr — und die
> Instanz sagt es und öffnet nicht halb.* **Gelöscht würde 121 Prüfungen
> kosten, ohne eine einzige neue zu bringen.**

---

## Strang 2 — Die JPEG-Hälfte des Bestandslaufs

**Vom Betreiber am 13. September 2026 dazubestellt** — *„wenn diese funktion nur
deswegen existiert weil vorher die vorschaubilder mit jpg gemacht wurden … muss
der code dafür … raus"*. **Nachgesehen und bestätigt:** *seit 0.27.0 sind
Vorschaubilder WebP (`images.js:135` sagt es im Klartext); die zweite Hälfte des
Knopfes kann nur in einer Installation greifen, die VOR 0.27.0 Fotos
hochgeladen hat.* **In einer frischen Instanz ist sie toter Code — und damit
Migrationsschuld wie ein Block, nur ohne Marke.**

| was fällt | wo |
|---|---|
| `isJpeg` und der zweite Zweig des Laufs | `batchrun.js:90`, `:191` |
| der Zähler `derived` und seine Hälfte des Fertigsatzes | `batchrun.js:174`, `:204`, `:238`, `public/app.js:12621` |
| **drei Rückbauten am Knopf** — *454, 455 und **819**, und 819 legt genau diese zwei Zeilen still* | `counterproof.js` |
| der Satz in der README über „jede Ableitung, die noch JPEG ist" | `README.md:2621 ff` |

### Ein Fund an der Schlüsselliste — der Fahrplan nennt einen, den es nicht gibt

**`card.convertCounts` steht in keiner der drei Sprachdateien.** *Der Fahrplan
führt ihn als fünften; die anderen vier stimmen.* **Den Fertigsatz trägt in
Wirklichkeit `card.convertFinished`:**

```
„Konvertierung fertig: {converted} von {total} Originalen konvertiert,
 {derived} Vorschaubilder neu generiert{stayed}{freed}."
```

**Die richtige Liste ist damit:** `card.catchUpBoth` *(Einzahl und Mehrzahl)* ·
`card.catchUpDerivatives` *(fällt ganz)* · `card.catchUpAsk` *(Einzahl und
Mehrzahl)* · `card.derivativesAsk` *(fällt ganz)* · `card.convertFinished`
*(der `{derived}`-Teil)* — **in allen drei Dateien.**

> **DIE ERSTE HÄLFTE DES KNOPFES BLEIBT.** *Originale nach einem Wechsel des
> Ablageverfahrens umstellen ist dauerhaft sinnvoll.* **Und `card.derivativesWebp`
> („Vorschaubilder: in jedem Fall WebP, von dieser Wahl unberührt") bleibt
> ebenfalls** — *er ist der Satz, der danach ohne Widerspruch dasteht.*

---

## Strang 3 — Die Absage an zu alte Datenbanken

**Das ist der Teil, der heute nicht existiert, und er ist das eigentliche
Neue an dieser Runde.** *Nachgesehen: `db.js` kennt keinen Versionsmerker,
keine `user_version`, keine Abbruchstelle — der einzige `throw` der Datei
gehört dem Schlüsselwechsel.* **Bis heute braucht es das auch nicht: jeder Block
ist stumm, wenn seine Arbeit schon getan ist.** *Wer die Blöcke wegnimmt, nimmt
genau diese Gutmütigkeit weg — und eine Datenbank aus 0.13.0 öffnete danach
ohne Widerspruch und ohne die drei Spalten, die jede Ablehnung braucht.*

**DAS IST DER GEFÄHRLICHSTE AUGENBLICK DER GANZEN STRECKE, und er ist still.**
*Nicht der Absturz ist die Gefahr, sondern der Start, der gelingt.*

**Der Vorschlag** *(F4)*: **gefragt wird der Bestand selbst, wie die Blöcke es
tun** — *ein Handvoll Proben auf `sqlite_master` nach den Spalten und Tabellen,
die die achtzehn Blöcke angelegt hätten.* **Fehlt eine, öffnet die Instanz
nicht,** und im Protokoll steht ein Kasten in derselben Form wie der Schlüsselhinweis
von `keys.js` (`warnKeyBesideData()`): *was fehlt, seit welcher Fassung es fehlt, und über welche
Fassung zuerst zu gehen ist.*

### Und sie wird gebaut, OBWOHL es niemanden gibt, den sie schützt

**Das ist kein Widerspruch, sondern der Grund.** *Nach der Voraussetzung dieser
Runde steht draußen niemand unter 0.33.0 — die Absage träfe also nie jemanden.*
**Genau deshalb gehört sie gebaut und nicht weggelassen:**

| ohne Absage | mit Absage |
|---|---|
| **„Wir glauben, dass es keine alte Datenbank gibt."** *Eine Annahme, die niemand nachsehen kann und die mit jedem Jahr unsicherer wird* | **„Das Programm sieht nach."** *Aus der Annahme wird eine Prüfung, die bei jedem Start läuft* |
| ein Start, der GELINGT und danach still falsch rechnet | ein Start, der nicht gelingt und sagt, warum |

> **SIE KOSTET WENIGER, ALS SIE AUSSIEHT** — *eine Handvoll Proben auf
> `sqlite_master`, gestellt an derselben Stelle, an der bisher achtzehn Blöcke
> standen.* **Sie ersetzt 928 Zeilen durch etwa zwanzig**, und sie ist das
> einzige Stück dieser Runde, das DAZUKOMMT.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

**Stand 14. September 2026, 20 Uhr: F2 und F7 sind vom Betreiber entschieden**
*(alle achtzehn fallen · der Bestandslauf ist mit PNG und mit den Vorschaubildern gefahren)*. **Offen sind noch F5** *(Sprache der Absage)*, **F6** *(wie weit sie zurückreicht)* **und F9** *(die Übersetzung alter Exportdateien)*.

| # | Frage | Vorschlag |
|---|---|---|
| **F1** | **Die Nummer?** | **0.33.0, MINOR.** *Ein Bruch, aber die erste Zahl ist 0* |
| **F2** | **Fallen die sechs Blöcke der 0.24er Sprachrunde mit?** | **ENTSCHIEDEN AM 14.9.2026 — JA, alle achtzehn.** *Der Betreiber: „alles was für die Migration von den Zwischenschritten notwendig war, kann weg."* **Damit fallen 928 von 2146 Zeilen aus `db.js`** — *die sechs vor `db.exec(SCHEMA)` und die zwölf dahinter, und die Grenze selbst fällt mit* |
| **F3** | **Fällt die Zählprüfung, oder wird sie umgedreht?** | **UMGEDREHT.** *„Es gibt genau zwoelf Migrationsfunktionen" wird „Es gibt keine" — und sie zählt danach über BEIDE Markenformen, damit ein neuer Block auffällt, gleich in welcher Schreibweise* |
| **F4** | **Wie sagt die Instanz ab?** | **Sie fragt `sqlite_master` und öffnet nicht.** *Kein Merker (L4), kein Absturz (L3)* |
| **F5** | **In welcher Sprache steht die Absage?** | **Vorschlag: Deutsch, im Containerprotokoll, wie jede andere Startansage.** *Sie erreicht keinen Bildschirm und keinen angemeldeten Menschen — sie erreicht den Betreiber am Wirt. **Ein Sprachschlüssel dafür wäre der erste, den niemand je in der Oberfläche sieht.*** **Zu bestätigen** |
| **F6** | **Wie weit zurück reicht die Absage?** | **Vorschlag: bis zur ältesten Spalte, die ein Block angelegt hätte.** *Eine gröbere Grenze verweigerte Datenbanken, die vollständig sind* |
| **F7** | **Was ist die BEDINGUNG, die vorher erfüllt sein muss?** | **ERFÜLLT, und zwar gemeldet und nicht angenommen.** *Der Betreiber am 14.9.2026: „Bestandslauf habe ich mit PNG gemacht und auch mit den Vorschaubildern."* **Beide Hälften des Knopfes sind auf der einen echten Installation gefahren** — *es liegt kein JPEG-Vorschaubild mehr, das der fallende Zweig noch erwischen müsste.* **Und für die Datenbankhälfte trägt die Voraussetzung der Runde:** *unter 0.33.0 hat nie jemand anders gestanden* |
| **F8** | **Steigt das Austauschformat mit?** | **Nein, es bleibt 16** *(L5)* |
| **F9** | **Fällt die Übersetzung ALTER EXPORTDATEIEN mit?** | **VORSCHLAG: NEIN — und das ist die eine Stelle, an der ich die Voraussetzung der Runde NICHT durchschlagen lasse.** *`server.js:52` holt `COLUMNS_0241` und `VALUES_0241` aus `db.js`; `server.js:7207`/`:7218` übersetzen damit beim EINLESEN eine Exportdatei von vor 0.24.1 — „die Paare kommen aus DERSELBEN Liste wie der Migrationsblock und nicht aus einer zweiten".* **Eine Datenbank liegt auf EINER Maschine und ist mit ihr aktuell geworden; eine Exportdatei ist eine DATEI — sie liegt in einer Sicherung und überlebt die Maschine.** *Es kostet `DICTIONARY` samt den beiden Tafeln, rund fünfzehn Zeilen, und keinen einzigen Migrationsblock.* **Wer sagt, dass auch keine solche Datei mehr existiert, kann sie fallen lassen** — *dann fällt `DICTIONARY` ganz aus `db.js`, und der Prüfstand liest die Datei ohnehin selbst (`testbench.js:18825`).* **Zu bestätigen** |
| **F10** | **Die acht Prüfgruppen?** | **UMGEDREHT, nicht gelöscht** *(L1)*. *Sie legen weiter eine alte Datenbank an — und belegen danach die Absage* |
| **F11** | **Die acht Rückbauten auf Migrationszeilen?** | **Sie werden auf die Absage umgehängt.** *Wer sie stilllegt, muss eine Prüfung rot machen — sonst ist die Absage nicht belegt* |
| **F12** | **Kommt 0.33.x (Kommentare kürzen) mit?** | **Nein, und der Grund steht im Fahrplan:** *diese Runde löscht ganze Blöcke samt ihren Kommentaren. **Wer vorher schneidet, schneidet zweimal*** |
| **F13** | **Die Marken sagen „ENTFAELLT MIT 1.0" und meinen diese Runde — was wird daraus?** | **Mit dem Block fällt seine Marke.** *Was nach F2 stehen bleibt, bekommt eine berichtigte Marke — und der Prüfstand hält danach fest, dass in `db.js` keine Ankündigung auf 1.0 mehr steht, zu der es keinen Block mehr gibt* |

---

## Die Bauabschnitte

| | was | Frage |
|---|---|---|
| **BA 1** | **Die Absage zuerst** — *sie wird gebaut und geprüft, BEVOR ein Block fällt. Solange beides steht, kann jede Prüfgruppe beides gegeneinander halten* | F4, F6 |
| **BA 2** | **Die zwölf gezählten Blöcke fallen** — samt ihren Aufrufen und den zehn Namen im `module.exports` | F3 |
| **BA 3** | **Die sechs der 0.24er Runde fallen** — *samt der Grenze `db.exec(SCHEMA)`, die sie von den zwölf trennte; `tools/dictionary.json` bleibt als Datei* | F2 ✓, F9 |
| **BA 4** | **Die acht Prüfgruppen werden umgedreht** — *dieselbe alte Datenbank, das umgekehrte Ergebnis* | F10 |
| **BA 5** | **Die JPEG-Hälfte des Bestandslaufs fällt** — *vier bis fünf Schlüssel in drei Sprachen, und der Widerspruch an der Karte verschwindet von selbst* | Strang 2 |
| **BA 6** | **Die Papiere** — README *(zwei Migrationsabsätze, der JPEG-Satz)*, CHANGELOG, Projektstand, Fahrplan, Änderungsprotokoll | L8 |
| **BA 7** | **Prüfstand, Gegenproben, Augenschein, Fingerprint** | |

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Es gibt keine Migrationsfunktion mehr** — *gezählt über BEIDE Markenformen, damit die Lücke, die diesen Auftrag ausgelöst hat, nicht wiederkommt* |
| **1b** | **Und keine Marke ohne Block** — *in `db.js` steht kein „ENTFAELLT MIT 1.0" mehr, hinter dem nichts mehr liegt* |
| **2** | **`db.exec(SCHEMA)` steht als erste Anweisung nach der Grundausstattung** — *die Grenze ist nicht verschoben, sie ist fort* |
| **3** | **Eine Datenbank ohne die neueste Spalte wird ABGEWIESEN** — *und zwar mit einem Satz, der die Fassung nennt, über die zuerst zu gehen ist* |
| **4** | **Eine vollständige Datenbank öffnet unverändert** — *die Absage ist eine Absage und keine Hürde* |
| **5** | **Die Absage fragt keinen Merker** — *kein Wert in `settings`, keine `user_version`; sie fragt `sqlite_master`* |
| **6** | **Die Instanz stirbt nicht, sie sagt ab** — *kein Stapelabzug im Protokoll* |
| **7** | **Der Bestandslauf kennt kein JPEG mehr** — *`isJpeg` steht nirgends, der Zähler `derived` steht nirgends* |
| **8** | **Die erste Hälfte des Knopfes tut, was sie tat** — *Originale werden weiter umgestellt* |
| **9** | **Die drei Sprachdateien tragen gleich viele Schlüssel, in derselben Folge und derselben Gestalt** — *und die neue Zahl steht an EINER Stelle* |
| **10** | **Jede Änderung an den Sprachdateien steht in ihrer Tafel** *(L7)* |
| **11** | **Die 28 Tabellen sind 28, und das Austauschformat ist 16** |
| **12** | **Kein Papier nennt einen Migrationsblock, den es nicht mehr gibt** — *README, CHANGELOG, Projektstand und Fahrplan werden mitgezogen* |

**DREIZEHN ZUSAGEN, und jede bekommt ihre Gegenprobe — jede wird GEFAHREN.**
*Eine stumme ist ein Fund; 0.32.0 hat das mit 1023 bewiesen und 0.32.1 mit acht
Rückbauten bestätigt, die alle WIEDER EINBAUEN, was die Runde ausgebaut hat.*
**Diese Runde ist von derselben Art: ihre Rückbauten bauen die Blöcke wieder
ein — und wenn keine Prüfung davon rot wird, ist die Absage nicht belegt.**

---

## Was ausdrücklich NICHT gebaut wird

- **Kein Schritt am Austauschformat.** *Es bleibt 16. Der Bruch gilt der DATENBANK, nicht der Exportdatei — wer eine Sicherung von gestern hat, spielt sie morgen ein.*
- **Kein Merker in der Datenbank.** *Er fehlte genau dort, wo er gebraucht würde.*
- **`tools/dictionary.json` fällt nicht.** *Der Import lebt davon.*
- **Keine gekürzten Kommentare.** *Das ist 0.33.x und kommt DANACH.*
- **Keine der drei offenen Notizen des Sammelblatts** *(36 Genitiv, 37 deutscher Artikel, 38 Zählzeile in der Kachel)*. **Sie sind Sprache und Oberfläche, kein Schema — sie stehen dem Bruch nicht im Weg und können jede spätere Runde mitnehmen.**
