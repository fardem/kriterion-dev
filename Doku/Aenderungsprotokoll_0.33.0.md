# Änderungsprotokoll 0.33.0 — „Bereinigung — der Bruch"

**Gebaut am 14. September 2026 · auf 0.32.1 · MINOR — und trotzdem DER BRUCH:
die Runde legt nichts dazu, sie nimmt weg, was einen Rückweg offenhält.**
*Solange die erste Zahl 0 ist, läuft ein Bruch über MINOR.*

> **FINGERPRINT DIESER RUNDE: `9083d8c7`** — *gerechnet am gebauten Stand, als
> letztes und hinter der letzten Zeile; achtzehn Dateien, `Doku/` und
> `testbench.js` ausdrücklich nicht darunter.* **Der Stand davor war
> `24899ab8`.**

> **DIE ZAHLEN GEHEN NACH UNTEN, UND DAS IST DIE PROBE DARAUF, DASS DIE RUNDE
> IHRE ARBEIT GETAN HAT.**
>
> | | vorher | nachher |
> |---|---|---|
> | **Zeilen in `db.js`** | 2145 | **1474** |
> | **Migrationsblöcke** | 18 | **0** |
> | **Schlüssel je Sprachdatei** | 1209 | **1208** |
> | **Prüfungen** | 7017 | **6858** |
> | **Rückbauten** | 1008 | **990** |
> | **Austauschformat** | 16 | **17** *(das einzige, was steigt)* |
> | **Tabellen** | 28 | **28** |

> **DIE SECHS GLEICHLAUTSUMMEN** *(`node tools/gleichlaut.js`)*:
>
> | | Einzahl | Mehrzahl |
> |---|---|---|
> | **de** | `daa0c9094f2c2305` | `77128aef244a5976` |
> | **en** | `caa4b814e75f8263` | `f224721465ac0d35` |
> | **tr** | `ab6bdf35499f7cf9` | `ad34f68137acaa2b` |

---

## Die Voraussetzung, auf der die ganze Runde steht

> **DER BETREIBER AM 14. SEPTEMBER 2026, nachdem er den Auftrag gelesen hatte:**
>
> *„Heute geht es darum, dass jemand entweder ganz frisch nach einem Download
> von Kriterion anfängt oder bereits 0.33.0 und darüber hat. Alles darunter
> wird ein normaler User nie zu Gesicht bekommen. Das war unser beider
> Entwicklungsarbeit."*

**DAS IST DIE AUSSAGE, DIE DEN BRUCH ÜBERHAUPT ERST BILLIG MACHT.** *Die
achtzehn Blöcke holten einen Bestand nach, den es draußen nicht gibt.* **Es gibt
keine fremde Datenbank zu schützen — es gibt nur die Annahme, dass es keine
gibt.** *Und genau deshalb ist der Hinweis aus Strang 3 nicht mit weggefallen,
sondern gebaut worden:* **er ist der Unterschied zwischen „wir glauben es" und
„das Programm sieht nach".**

---

## Der Befund, der den Auftrag über den Fahrplan gehoben hat

> **ES WAREN ACHTZEHN UND NICHT ZWÖLF — und der Zähler selbst war der
> Betroffene.**

Der Fahrplan sagte seit 0.29.0 „zwölf Migrationsblöcke raus", und der Prüfstand
hielt die Zahl namentlich. **Beide zählten dasselbe Muster** — Marken der Form

```
// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0
```

*eine Zeile, ein Kommentarstrich.* **Die sechs Blöcke der Sprachrunde 0.24.x
trugen ihre Absage aber im BLOCKKOMMENTAR, auf einer eigenen Zeile darunter** —
und das Muster fand sie nicht.

| | Blöcke | wo | Zeilen | lief |
|---|---|---|---|---|
| **gezählt** | **zwölf** — 0.8.3 · 0.8.30 · 0.8.31 · 0.8.40 · 0.8.50 · 0.14.0 · 0.16.0 · 0.19.0 · 0.21.0 · 0.25.0 · 0.27.0 · 0.29.0 | `db.js:1430–1867` | 426 | **NACH** `db.exec(SCHEMA)` |
| **nicht gezählt** | **sechs** — `migration0241Tables` · `migration0241Columns` · `migration0241Values` · `migration0242Shapes` · `migration0243Language` · `migration0243Stored` | `db.js:923–1424` | 502 | **VOR** `db.exec(SCHEMA)` |

**Der Zähler ist deshalb nicht bloß umgedreht, sondern zuerst berichtigt
worden:** *er liest jetzt BEIDE Markenformen, und zwar in demselben Muster.*
**Die Gegenprobe steht gestellt daneben** — beide Schreibweisen, wie sie bis
0.32.1 in `db.js` nebeneinander standen, und eine dritte Zeile, die keine ist.

---

## Strang 1 · Die achtzehn Blöcke fallen

**945 Zeilen aus `db.js` — der Block von Zeile 923 bis 1867.** *Dazu zehn
Namen im `module.exports`, die nur hinausgingen, weil der Prüfstand sie einzeln
fuhr.*

> **GEMESSEN UND NICHT GESCHÄTZT: die Datei geht von 2145 auf 1474 Zeilen.**
> *Der Auftrag rechnete mit 928 Zeilen und einer Datei von 2146; nachgezählt am
> gebauten Stand sind es 945 gefallene Zeilen, und dazu kommt, was an ihre
> Stelle getreten ist — die Probe, der Stempel und die drei Klammern gegen den
> Abbruch. Unterm Strich:* **997 Zeilen weg, 326 dazu.**
>
> **UND DIE MESSUNG WAR BEIM ERSTEN MAL EINEN SCHRITT ZU FRÜH.** *Hier stand
> 1473, und 983 weg, 311 dazu. Das war richtig gemessen — nur an dem Stand VOR
> dem Griff, der die Zahl hinschrieb: derselbe Griff hat drei Kommentare in
> `db.js` umgeschrieben (15 Zeilen hin, 14 her) und die eigene Messung damit
> um eine Zeile überholt.* **Wer misst, misst zuletzt.** *Die Zahlen oben sind
> am fertigen Zweig gegen `main` genommen: 2145 − 997 + 326 = 1474.*

### Die Grenze ist nicht verschoben, sie ist fort

Die sechs der 0.24er Runde standen **vor** `db.exec(SCHEMA)`, und das war keine
Ordnungsfrage: `CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht
an — liefe die DDL zuerst, stünde neben dem vollen `papierkorb` ein leeres
`trash`, und `ALTER TABLE … RENAME TO` scheiterte an einem Namen, den es schon
gibt. **Jetzt steht `db.exec(SCHEMA)` unmittelbar hinter der Faltung der Suche**,
und der Prüfstand hält genau das fest.

### `tools/dictionary.json` bleibt — `db.js` liest sie nicht mehr

**Die Datei bleibt, weil der Prüfstand sie selbst liest** *(die Worttafel der
drei Restproben)*. **Aus `db.js` ist sie ganz verschwunden**, und mit ihr
`DICTIONARY`, `COLUMNS_0241` und `VALUES_0241`.

---

## Strang 2 · Was an ihre Stelle getreten ist

### Die Probe auf einen unvollständigen Bestand

**Das ist das einzige Stück dieser Runde, das DAZUKOMMT** — rund zwanzig Zeilen
für 928.

| | was sie tut |
|---|---|
| **sie fragt den Bestand** | `sqlite_master` für die sechs Tabellen, `PRAGMA table_info` für die achtzehn Spalten — **keinen Merker** *(L4)* |
| **sie nennt die Diagnose** | welche Spalte fehlt, **seit welcher Fassung**, und ob der alte Name noch dasteht |
| **sie sperrt niemanden aus** | ein Kasten im Protokoll, **die Instanz startet trotzdem** *(L3, F4)* |
| **sie spricht englisch** | wie das ganze Protokoll seit dieser Runde *(F5)* |
| **sie ist still im Neben-Thread** | wie der Schlüsselhinweis in `keys.js` |

```
  ------------------------------------------------------------------
  WARNING: this database is incomplete. It is missing parts that
  earlier versions added while starting up. Kriterion 0.33.0 removed
  those upgrade steps, so they never run again:

    papierkorb             renamed to trash in 0.24.1;
                           its rows are invisible to this version
    photos.zoom            added in 0.19.0
    tokens.purpose         added in 0.24.1; still present as tokens.zweck

  To repair it, open this database once with Kriterion 0.32.1 --
  the last version that still carried the upgrade steps -- let it
  start, shut it down, and come back here.

  THIS INSTANCE STARTS ANYWAY. Nothing is blocked and nothing is
  changed; but every page that reads one of the parts above fails
  until the database has been through that version.
  ------------------------------------------------------------------
```

### VIER BLÖCKE HABEN IN DER PROBE NICHTS ZU SUCHEN — und das ist kein Vergessen

*0.24.2 und 0.24.3 übersetzten Feldnamen **in** gespeicherten Werten, 0.24.3
schrieb eine Vorgabesprache und 0.27.0 eine Einstellungszeile.* **Keiner von
ihnen hat eine Spalte oder eine Tabelle angelegt**, und F6 sagt, was gefragt
wird: *eine Probe je SPALTE und TABELLE.*

### DREI ABBRUCHSTELLEN, DIE DER UMGEDREHTE PRÜFSTAND GEFUNDEN HAT

**Das ist der wertvollste Befund dieser Runde, und er kam nicht aus dem
Auftrag.** *Die Blöcke wegzunehmen genügt nicht: an drei Stellen stirbt der
Start an einer fehlenden Spalte, und zwar an einem `db.prepare`, das schon beim
VORBEREITEN scheitert.* **Das wäre die harte Absage gewesen, die der Betreiber
ausdrücklich gekippt hat — nur nicht als Entscheidung, sondern als Absturz.**

| wo | was ohne die Klammer geschähe | was jetzt dasteht |
|---|---|---|
| **die beiden Indizes auf `photos`** | `CREATE INDEX … zoom` trifft „no such column" — **die Anwendung kommt nicht hoch** | `tryIndex()` fängt es weich ab und sagt es in EINER Zeile; die Abfragen laufen ohne ihn, nur langsamer |
| **der Rückfall** | `UPDATE links SET user_id = …` scheitert am Vorbereiten | eine Tabelle ohne `user_id` wird übergangen — was es nicht gibt, lässt sich niemandem zuordnen |
| **die mitgelieferten Kriterien** | `INSERT … (name, language)` scheitert am Vorbereiten | ohne die Spalte wird nur der Name gesetzt |

> **UND DIE GRENZE STEHT AUSDRÜCKLICH DA:** *das ÖFFNEN der Datenbank gelingt
> und sagt, was fehlt.* **Eine Seite, die eine fehlende Spalte LIEST, scheitert
> weiterhin** — genau so, wie der Kasten es ansagt. *Das ist keine halbe Zusage,
> sondern die ganze: der Fehler ist laut geworden, und laut ist er, weil er
> genannt wird und nicht, weil er verschwindet.*

### Der Stempel — die andere Hälfte, und der Betreiber hat sie benannt

> *„Prüft das System beim Einspielen, mit welcher Version die Datenbank
> betrieben wurde? … Generell für die Zukunft wäre es gut, wenn direkt
> erkennbar wäre, mit welcher Version das betrieben wurde."*

**NACHGESEHEN UND NICHT VERMUTET: an keiner der drei Stellen stand etwas.**

| | `versionCreated` | `versionLastOpened` |
|---|---|---|
| **frische Datenbank** | **0.33.0** | **0.33.0** |
| **gewachsener Bestand** | *— sie bleibt leer* | **0.33.0** |
| **zweiter Start** | unverändert | unverändert, **und stumm** |
| **Fassungswechsel** | unverändert | wandert mit, **und sagt es einmal** |

> **DIE LEERE ZEILE IST DIE RICHTIGE ANTWORT.** *Ein `INSERT OR IGNORE` bei
> jedem Start trüge in eine Datenbank aus 0.19.0 „angelegt mit 0.33.0" ein —
> eine ERFINDUNG über fremde Arbeit, und niemand sähe sie je wieder.* **Dieselbe
> Überlegung wie seinerzeit an `set_at` in 0.16.0 und an `rejected_at` in
> 0.14.0: was die Instanz nicht weiß, behauptet sie nicht.**

**UND DER STEMPEL IST KEIN MERKER FÜR DIE PROBE.** *Die beiden beantworten
verschiedene Fragen — „ist es vollständig?" und „was ist es?" —, und die Probe
liest ihn ausdrücklich nicht.* **Der Prüfstand liest dafür den Quelltext der
Probe.**

---

## Strang 3 · Die JPEG-Hälfte des Bestandslaufs

**Vom Betreiber am 13. September 2026 dazubestellt:** *„wenn diese funktion nur
deswegen existiert weil vorher die vorschaubilder mit jpg gemacht wurden … muss
der code dafür … raus."*

**Und die Bedingung ist gemeldet und nicht angenommen** *(F7)*: *„Bestandslauf
habe ich mit PNG gemacht und auch mit den Vorschaubildern."*

| was gefallen ist | wo |
|---|---|
| `isJpeg` und der zweite Zweig des Laufs | `batchrun.js` |
| der Zähler `derived` und seine Hälfte des Fertigsatzes | `batchrun.js`, `server.js`, `public/app.js` |
| `card.catchUpDerivatives` und `card.derivativesAsk` | drei Sprachdateien |
| der `{derived}`-Teil von `card.convertFinished` | drei Sprachdateien |
| der JPEG-Satz in `card.catchUpBoth` und `card.catchUpAsk` | drei Sprachdateien |

**DER SCHREIBGRIFF IST DIE ZUSAGE:** *`UPDATE photos SET mime_type = ?, data = ?`
— **`thumb` und `medium` stehen nicht mehr darin**. Der Lauf fasst eine Ableitung
nicht mehr an, und der Prüfstand hält genau diese Zeile fest.*

### Der Knopf ist wieder das, was er bis 0.26.0 war

**Liegt kein PNG mehr da oder ist „PNG" gewählt, ist er tot.** *0.27.0 hat ihn
belebt, weil die Ableitungen eine zweite Hälfte waren; sie ist fort, und damit
auch ihr Grund.* **Ein Knopf, der zuverlässig eine Frage ohne Gegenstand öffnet
— und dafür ein Passwort verlangt —, sieht aus wie ein Fehler.**

> **UND `card.derivativesWebp` BLEIBT** — *„Vorschaubilder: in jedem Fall WebP,
> von dieser Wahl unberührt".* **Er ist der Satz, der danach ohne Widerspruch
> dasteht.**

### Ein Fund an der Schlüsselliste

**`card.convertCounts` steht in keiner der drei Sprachdateien** — der Fahrplan
führte ihn als fünften. **Den Fertigsatz trägt in Wirklichkeit
`card.convertFinished`.**

---

## Strang 4 · Das Austauschformat und die eine Abweisung

| | |
|---|---|
| **`EXCHANGE_FORMAT`** | 16 → **17**, weil `appVersion` dazukommt *(F16)* |
| **`EXCHANGE_FORMAT_MIN`** | **14**, neu — die älteste Datei, die noch hereinkommt *(F15)* |
| **beide Schreibstellen** | tragen die Programmfassung neben der Formatnummer |
| **der Import** | **LIEST die Nummer** — zum ersten Mal seit sechzehn Fassungen |

**WARUM 14 UND NICHT 13:** *die Zahl markiert den Umbau nicht.* **0.24.1 hat die
Felder umbenannt, OHNE die Formatnummer zu heben** — *0.24.0 und 0.24.2 tragen
beide die 13, erst 0.24.3 hebt auf 14.* **Eine 0.24.2-Datei fällt damit mit ab,
und das ist die richtige Richtung.**

> **SIE LIEGT AN DER DATEI UND NICHT AM START, und das ist der ganze
> Unterschied zu der Absage, die gekippt worden ist:** *eine Datei, die nicht
> hereinkommt, sperrt niemanden aus seiner Anwendung aus.*

**SIE STEHT IN `importInto()` UND NICHT AN DER ROUTE:** *der Papierkorb geht
denselben Weg, und seine Pakete sind Exportumschläge wie jeder andere.* **Ein
Paket, das diese Instanz selbst geschrieben hat, trägt immer die laufende
Nummer — die Abweisung kann es gar nicht treffen.**

**EINE FEHLENDE NUMMER GILT ALS ZU ALT.** *Jede Datei, die dieses Haus je
geschrieben hat, trägt sie; was keine trägt, ist kein Umschlag von hier.*

---

## Strang 5 · Das Protokoll spricht englisch

> **DER BETREIBER AM 14. SEPTEMBER 2026:** *„Englisch. Aber mit Konsole meinst
> du das Log, oder? Das ist blöd, dass die noch auf Deutsch sind. Die müssen
> englisch werden."*

**ES WAR DIE LETZTE DEUTSCHE ECKE DES HAUSES.** *0.31.0 hat elf Code-Lecks aus
den Sprachdateien geholt, 0.32.0 zwölf feste deutsche Sätze aus `server.js` —
beide Male ging es um das, was den BILDSCHIRM erreicht.* **Das
Containerprotokoll ist nie angefasst worden, weil es keinen Bildschirm erreicht.
Es erreicht aber den, der die Anwendung betreibt.**

| Datei | übersetzt | ganz |
|---|---|---|
| `server.js` | **28** | 30 |
| `db.js` | **4** *(die übrigen sind mit Strang 1 gefallen)* | 6 |
| `batchrun.js` | **7** | 8 |
| `auth.js` | **7** | 7 |
| `keys.js` | **3** *(darunter der halbe Bildschirm Schlüsselhinweis)* | 3 |
| `images.js` | 0 | 1 |

**UND ES WAR BILLIGER ALS JEDE FRÜHERE SPRACHRUNDE, weil es KEINE Sprachdatei
anfasst.** *Ein Satz im Protokoll bekommt keinen Schlüssel, keine Mehrzahlform
und keine drei Fassungen.*

### Die Restprobe — das Spiegelbild der von 0.32.0

**Jene schneidet die Konsolenrufe WEG und fragt, was übrig bleibt; diese liest
GENAU sie.** *Zusammen decken die beiden jede Zeichenfolge der Serverdateien ab.*

**ZWEI WÖRTER FALLEN AUS DER FRAGE, und beide sind BEFEHLE und keine Sätze:**
`passwort` *(aus `node usertool.js passwort <name>`)* und `rand` *(aus
`openssl rand -hex 32`)*. **Ein drittes, `will`, ist ein falscher Freund** — *im
Wörterbuch das deutsche Vollverb, im Englischen das Hilfsverb.* **Es steht
ausdrücklich NICHT in der Liste:** *die Sätze dieser Runde kommen ohne es aus,
und eine Ausnahme, die auf nichts zeigt, ist eine Karteileiche.*

### Eine Folge, die der Prüfstand gefunden hat

**Die Kennzahlenkarte ZITIERT eine Protokollzeile** — *„im Server-Log
‚Schluessel aus ENCRYPTION_KEY geladen' prüfen".* **Sie heißt jetzt englisch**,
in allen drei Sprachdateien derselbe Wortlaut: *zitiert wird eine Zeile und
nicht ein Satz.* **0.32.0 hatte an genau dieser Stelle schon einmal einen
Befund** *(Punkt 28, Fund 1: die Karte schrieb „Schlüssel" mit Umlaut, das
Protokoll „Schluessel" ohne)*.

---

## Der Prüfstand — was er hält

| | Zusage | wo |
|---|---|---|
| **1** | Es gibt keine Migrationsfunktion mehr — *gezählt über BEIDE Markenformen* | „Der Wächter über den Quelltext" |
| **1b** | Und keine Marke ohne Block | ebenda |
| **2** | `db.exec(SCHEMA)` steht unmittelbar hinter den mitgelieferten Kriterien | ebenda |
| **3** | Einer Datenbank, der eine Spalte fehlt, wird sie BENANNT — *achtzehn Prüflagen, eine je Spalte* | „Der Hinweis auf einen unvollständigen Bestand" |
| **4** | Auch die unvollständige öffnet — *gefahren, nicht behauptet* | ebenda |
| **5** | Die Probe fragt keinen Merker | ebenda + „Der Stempel der Datenbank" |
| **6** | Kein Stapelabzug und kein Abbruch | „Der Hinweis auf einen unvollständigen Bestand" |
| **7** | Der Bestandslauf kennt kein JPEG mehr | „Die Bildablage" |
| **8** | Die erste Hälfte des Knopfes tut, was sie tat | ebenda |
| **9** | Die drei Sprachdateien tragen 1208 Schlüssel, in derselben Folge | „Der Sprachwächter" |
| **10** | Jede Änderung steht in ihrer Tafel | 0.31.2 / 0.31.3 |
| **11** | 28 Tabellen, Austauschformat 17 an EINER Stelle | „Der Stempel der Datenbank" |
| **12** | Kein Papier nennt einen Block, den es nicht mehr gibt | README, CHANGELOG, Fahrplan, Projektstand |
| **13** | Die Datenbank sagt, womit sie läuft und womit sie angelegt wurde | „Der Stempel der Datenbank" |
| **14** | Die Exportdatei trägt die Programmfassung, und der Import LIEST die Nummer | ebenda + „Die Exportdatei" |
| **15** | Keine Konsolenansage der sechs Dateien spricht noch deutsch | „Restprobe: keine Konsolenansage …" |

---

## Die Gegenproben

**1008 → 990, und die Rechnung steht im Prüfstand:**

| | | |
|---|---|---|
| **−36** | 219–223 · 447 · 580 · 581 · 702–709 · 720–730 · 760–762 · 819 · 822 · 823 · 882 · 883 · 1015 | **gelöscht und nicht umgedreht** — *umdrehen ließe sich nur ein Gegenstand, den es gibt; die Selbstprobe „jeder Suchtext kommt genau einmal vor" hat sie namentlich gemeldet* |
| **+18** | 1035–1052 | **sie bauen wieder ein, was diese Runde ausgebaut hat** — *der Hinweis samt Probe, die weiche Klammer um die Indizes, die beiden übergehenden Abfragen, die Abweisung, die Programmfassung, der Stempel, die JPEG-Hälfte und zwei deutsche Konsolenansagen* |

> **DAS IST DIE RICHTUNG FÜR EINE RUNDE, DIE WEGNIMMT:** *nicht „nimm weg, was
> da ist", sondern „bring zurück, was weg sein soll".* **Und wenn davon keine
> Prüfung rot wird, ist der Hinweis nicht belegt** *(F11)*.

### Der Lauf, und was er gefunden hat

**ACHTZEHN GEFAHREN, EINER STUMM — und der eine ist der Ertrag.**

| | |
|---|---|
| **erster Lauf** | 17 machen Prüfungen rot *(1 bis 10 Punkte, jeder in seiner Gruppe)*, **1042 bleibt STUMM** |
| **nach der Reparatur** | **0 STUMM** |

**1042 NIMMT DEM RÜCKFALL DIE FRAGE NACH `user_id` WEG**, und es wurde kein
Punkt rot. *Der Grund saß in meiner Prüflage und nicht im Rückbau:*
`assignInventory()` **kehrt VOR seiner Schleife zurück, wenn es gar keinen
Eigentümer gibt** — *und eine frisch angelegte Datenbank hat keinen.* **Die
Zeile, um die es geht, wurde nie erreicht.**

> **EINE DATENBANK OHNE JEDEN ZUGANG IST AUCH KEIN GEWACHSENER BESTAND.** *Die
> Prüflage legt jetzt erst an, setzt dann einen Eigentümer und nimmt danach die
> Spalte — sie ist damit nicht nur schärfer, sondern richtiger: sie stellt nach,
> was draußen stünde.* **Nachgemessen an einer gestellten Lage:** *mit der Frage
> kommt die Instanz hoch und nennt `links.user_id`, ohne sie endet der Start mit
> Rückgabewert 1.*

**UND EIN ZWEITER FUND KAM AUS DEMSELBEN LAUF, noch vor dem ersten:** *die erste
Fassung der umgedrehten Prüfgruppe WARF, wenn ein Start nicht hochkam — und riss
damit jeden Gegenprobenlauf ab, statt eine Zeile rot zu färben.* **Ein
abgerissener Lauf belegt nichts** *(derselbe Fehler wie an Rückbau 1014 in
0.32.0).* `uhRun` *liefert seither ein Paar aus* `ok` *und* `out`; **ein toter
Start ist eine rote Prüfung.**

> **BEIDE FUNDE SIND AN DER PRÜFUNG UND NICHT AM GEBAUTEN** — *und genau dafür
> gibt es die Gegenprobe.* **Eine Prüfung, die grün ist, belegt nichts, solange
> niemand gezeigt hat, dass sie auch rot werden kann.**

---

## Was ausdrücklich NICHT gebaut wurde

- **Kein Bruch an der Exportdatei ab 14.** *Wer eine Sicherung von gestern hat, spielt sie morgen ein.*
- **Kein Merker in der Datenbank** für die Probe. *Er fehlte genau dort, wo er gebraucht würde.*
- **`tools/dictionary.json` ist nicht gefallen.** *Der Prüfstand liest sie selbst.*
- **Keine gekürzten Kommentare.** *Das ist 0.33.x und kommt DANACH — diese Runde hat ganze Blöcke samt ihren Kommentaren gelöscht; wer vorher schneidet, schneidet zweimal.*
- **Die beiden Indizes sind NICHT in die DDL gewandert.** *Bis 0.32.1 stand an ihrer Stelle der Satz „zu 1.0 dürfen diese Zeilen mit nach oben" — er ist mit den Blöcken hinfällig geworden, und zwar ins Gegenteil: in der DDL trüge `db.exec(SCHEMA)` den Fehlschlag, und DER ist nicht zu klammern, ohne das ganze Schema mitzuklammern.*
