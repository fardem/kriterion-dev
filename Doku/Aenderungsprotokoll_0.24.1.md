# Änderungsprotokoll 0.24.1 — „Der Quelltext spricht Englisch"

**PATCH, Datenbankstufe · 7. September 2026 · gebaut auf 0.24.0
(`795ddc8a`, Stand `3be57cc`).**

**Jeder Name im Code ist englisch.** Bezeichner, Schlüssel der Sprachdatei,
ids, Klassen, Stilblattvariablen, Adressen, API-Wurzeln, Dateinamen,
Umgebungsvariablen — und die Datenbank mit Tabellen, Spalten und
gespeicherten Werten. **Am Bildschirm ändert sich kein Zeichen:** die WERTE
von `de.json` sind hinterher dieselben wie bei der Abnahme von 0.24.0, nur
ihre Schlüssel heißen anders. *Das ist die Abnahme, und ein Wächter zählt
sie nach.*

*Kommentare und Papiere bleiben deutsch — ausdrücklich und dauerhaft. Der
Auftrag steht in `Doku/Auftrag_0.24.1.md` mit neun Fragen, die vor der
ersten Zeile beantwortet worden sind; das Namenswörterbuch in
`Doku/Namenswoerterbuch_0_24_1.md` — erzeugt aus `tools/dictionary.json`
und nicht von Hand gepflegt.*

---

## Diese Runde IST eine Datenbankstufe

**Sechs Tabellen, sechsundzwanzig Spalten, fünfundsiebzig gespeicherte
Werte** heißen englisch. Der Migrationsblock steht in `db.js` **vor**
`db.exec(SCHEMA)`, läuft einmal, ist wiederholbar und fragt `sqlite_master`
und `PRAGMA table_info` statt eines Merkers.

**Was ein Betreiber tun muss:** *eine Sicherung ziehen, dann einspielen.*
**Es gibt keinen Weg zurück** — eine ältere Fassung kann die umbenannte
Datenbank nicht mehr lesen.

**Und fünf Umgebungsvariablen heißen anders.** Die alten Namen werden
weiter gelesen und schreiben beim Start eine Zeile ins Containerprotokoll:
`OEFFENTLICHE_ADRESSE` → `PUBLIC_ADDRESS`, `HINTER_PROXY` → `BEHIND_PROXY`,
`PORT_VERSATZ` → `PORT_OFFSET`, `SICHERUNG_DIR` → `BACKUP_DIR`,
`NEUER_SCHLUESSEL` → `NEW_KEY`. *Nichts bricht; wer sie umstellt, hat es
hinter sich.*

**Die Migration ist an einem echten Altbestand geprüft** — gebaut aus dem
Grundstein dieser Runde (`3be57cc`) und mit deutschen Tabellen, Spalten und
Werten gefüllt: **21 Zusagen grün.** Sechs Tabellen umbenannt, die Spalten
mitgezogen, die Werte übersetzt — samt Grabstein (`geloescht-3` →
`deleted-3`) —, die Daten unversehrt, der zweite Lauf stumm.

---

## Was diese Runde an den Zahlen ändert

| | 0.24.0 | 0.24.1 |
|---|---|---|
| Prüfungen | 5862 | **5890** (+28) |
| Rückbauten | 685 | **693** *(acht neue, 694 bis 701)* |
| Wortpaare im Wörterbuch | — | **1186** |
| Deutsche Bezeichner im ausgelieferten Code | 808 *(Auftrag, F0)* | **110, alle benannt** |
| Deutsche Bezeichner in `counterproof.js` | 16 | **0** |
| Schlüssel in `de.json` | 1191 | **1191** *(+68 Mehrzahlformen darunter = 1259; **diese Runde legt keinen an und nimmt keinen weg** — sie benennt sie um. Das Protokoll 0.24.0 nennt 1190; am Grundstein dieser Runde (`3be57cc`) sind es 1191)* |
| Werte in `de.json` | 1225 | **1225, davon 1224 Zeichen für Zeichen dieselben** |
| Tabellen · Spalten · Werte umbenannt | — | **6 · 26 · 75** |
| Zeilen `server.js` | 6996 | **7056** |
| Zeilen `public/app.js` | 10964 | **11019** |
| Zeilen `db.js` | 1231 | **1415** *(der Migrationsblock)* |
| Zeilen `testbench.js` | 43314 | **43648** |

---

## 1. Die neun Fragen — vor der ersten Zeile

Der Auftrag stellt sie am Kopf; alle neun sind vor dem ersten Umbenennen
beantwortet und eingetragen worden. **Die drei, die den Zuschnitt der Runde
entschieden haben:**

* **F1/F2 — geht die Datenbank mit?** *Ja, Schema und Werte.* Damit ist die
  Runde eine Datenbankstufe, und der Migrationsblock ist der Preis dafür.
* **F8 — ziehen Prüfstand und Gegenprobe mit?** *Die Bezeichner ja, die
  Namen nein.* Ein Prüfungsname ist Bericht für den, der den Lauf liest —
  dieselbe Sache wie ein Kommentar. **Alle 5862 Prüfungs- und 685
  Rückbaunamen sind unangetastet geblieben.**
* **Wie lang darf ein Name sein?** *Wörter ausgeschrieben, höchstens drei.*
  Ein eingebürgertes Fachwort darf stehen, wo es die Sache IST (`2FA`,
  `URL`, `ID`, `API`); ein Wort wird nie zu einem Kürzel verkürzt. **Und
  der Namensraum zählt mit:** was links vom Punkt steht, wird rechts davon
  nicht wiederholt.

---

## 2. Bauabschnitt 0 und 1 — das Wörterbuch und das Werkzeug

**EINE Liste, aus der jeder Bauabschnitt liest:** `tools/dictionary.json`.
Aus ihr wird das Papier erzeugt (`node tools/dictionary-doc.js`), aus ihr
liest der Migrationsblock in `db.js`, aus ihr lesen die Wächter im
Prüfstand. *Zwei Listen über dieselbe Sache dürfen sich nicht
widersprechen.*

**Das Werkzeug ist ein Umbenenner mit einer Probe, die jede Anwendung
begleitet** (`tools/rename.js`, `tools/segments.js`). Er fasst nur CODE an;
Strings, Vorlagen, reguläre Ausdrücke und Kommentare werden vorher
ausgesondert. **Und die Probe steht daneben:** die Vielfachmenge aller
Strings der Datei ist vorher und nachher dieselbe. *Sie hat in 0.24.0
den einen Fehlgriff gefangen, bei dem aus `getElementById('sw-test-t')` ein
`'sw-test-schalter'` wurde.*

---

## 3. Bauabschnitte 2 bis 6 — Sprachdatei, Server, Oberfläche, Dateien, Datenbank

| Abschnitt | was gefallen ist |
|---|---|
| **2** | alle Schlüssel der Sprachdatei — **kein Wert angefasst** |
| **3** | die Serverseite in drei Teilen; `server.js` allein 2084 Treffer |
| **4** | die Oberfläche in acht Teilen: Bezeichner, ids, Klassen, Stilblattvariablen, Bildfolgen — und die Adressen, **jede alte wird übersetzt** |
| **5** | acht Dateinamen und sechs Umgebungsvariablen, fünf davon mit Rückfall |
| **6** | die Datenbank in fünf Teilen: Tabellen, Spalten, Werte, die Felder der Schnittstelle, der Rest |

**Drei Lehren aus diesen Abschnitten, jede an einer roten Zeile bezahlt:**

* **Ein Alias in SQL zieht nicht von allein mit.** `AVG(…) AS schnitt` in
  einem String und `.average` im Code: jeder Durchschnitt war still
  `null`. *Dieselbe Falle ein zweites Mal in 7.5 — siehe unten.*
* **Ein Feldname in einer Liste ist ein Feldname.** `AUTHOR_ONLY_FIELDS`
  nennt seine Felder als Strings; nach dem Umbenennen der Bezeichner
  durfte ein Fremder `rejected_reason` schreiben.
* **Der Namensersetzer für SQL-Strings arbeitet auf Wortgrenzen, und
  ein Bindestrich IST eine.** Er hat aus `WHERE username = 'geloescht-' ||
  id` ein `'deleted-'` gemacht — die Grabsteinmigration lief danach stumm
  ins Leere. **Seither wird er für allgemeine Wörter nicht mehr angewandt.**

---

## 4. Bauabschnitt 7 — der Prüfstand

**2287 deutsche Bezeichner in `testbench.js`, 27 in `counterproof.js`** —
in einer Datei mit 43 570 Zeilen, ohne Geltungsbereichsanalyse. Er ist in
sechs Teilen gefallen (7.1 bis 7.6). **Drei Dinge hat er gelehrt:**

### Ein Kindprogramm ist Code, auch wenn es als Vorlage dasteht

Der Prüfstand trägt **82 ganze Programme in Rücktasten** und lässt sie in
einem Kindprozess laufen. Für den Zerleger ist das TEXT: der Umbenenner
fasste es nicht an, der äußere Code aber schon — und `mw.good.weiter` griff
ins Leere, weil das Kind weiter `gut:` ausgab. **Sie werden jetzt umbenannt
wie eine eigene Datei:** der Zerleger läuft ein zweites Mal auf dem Rumpf
der Vorlage, die deutschen Sätze in ihren Kommentaren bleiben stehen.

*Die Erkennung hat zweimal nachgeschärft werden müssen. Ein Programm, das
aus fünf Vorlagen zusammengesetzt ist, trägt das `require` nur im ersten —
das vierte blieb deutsch, und der Lauf brach mit `raus is not defined` ab.*

### Ein echter Streit braucht zwei Veränderliche

Eine Eigenschaft und eine Veränderliche teilen sich keinen Namensraum:
`.stopp` → `.stop` neben `stop()` ist kein Streit, `const raus` neben
`const out` schon. **Von 59 gemeldeten blieben 28 echte**, und jeder trägt
den Namen seiner Sache: `raus` → `outcome`, `latte` → `required`,
`ausweich` → `newTabLink`, `ende` → `endRecord`.

**Und wo zwei deutsche Wörter dasselbe englische wollen, steht die Trennung
im Wörterbuch** — Abschnitt 9 des Namenswörterbuchs, neun Paare mit
Begründung: `klemme`/`wächter`, `rechteck`/`fläche`, `prüfe`/`haken`,
`erwartet`/`soll`, `mehr`/`weiter`, `ausgabe`/`aus`, `zweit`/`zweiter`.

### Was Inhalt ist, bleibt deutsch

`Haptik` ist ein Kriterium, das eine Prüflage anlegt — ein Mensch hat den
Namen getippt, und er steht als Schlüssel in der Antwort. `Faden` ist ein
deutsches WORT, nach dem der Sprachwächter sucht. `fokus()` und
`ausschnitt()` sind Funktionen, **die es nicht mehr gibt** — zwei
Zusicherungen belegen genau das, und mit englischem Namen fragten sie nach
etwas anderem. *Eine von beiden wurde prompt rot und hat sich damit selbst
erklärt.*

---

## 5. Das Wörterbuch war lückenhaft — und die Restzahlen zu gut

**Ein Befund aus der Mitte der Runde, und er ist unangenehm.** Die
Restzahlen der Bauabschnitte 3 bis 6 waren zu gut: gemessen wurde gegen das
Wörterbuch, und das Wörterbuch kannte die Wörter nicht, die es hätte finden
sollen.

**Ein Wortschatztest — jedes Namensstück gegen das Wörterbuch UND gegen eine
Liste englischer Wörter — fand 99 deutsche Wortstücke im ausgelieferten Code
und 371 im Prüfstand, die nirgends verzeichnet waren:** `einzahl`,
`mailstand`, `ausruesten`, `wurzel`, `erreichbar`, `schlange`, `sekunden`,
`nenner`, `aufzaehlung`, `unterwegs`, `ersatz`, `handgriff`, `kurzlauf`,
`mitschrift` und die übrigen.

**Das Wörterbuch ist von 716 auf 1186 Wortpaare gewachsen**, und die
ehrliche Zahl danach lautet **110 deutsche Bezeichner im ausgelieferten
Code** — nicht 143, wie vorher gemessen. *Die Zahl stimmt ab jetzt, weil sie
gegen zwei Listen zählt und nicht gegen eine.*

---

## 6. Die sechs Wächter — und ihre acht Gegenproben

| Wächter | was er festhält | die Zahl |
|---|---|---|
| **Namensprobe** | kein Bezeichner des ausgelieferten Codes trägt ein deutsches Wortstück | **110 benannte**: 6 falsche Freunde, 104 Grenzen |
| **Schlüsselprobe** | kein Schlüssel der Sprachdatei trägt eines | 1259 Schlüssel, 68 Mehrzahlformen, 14 Vokabelnamen, **5 benannte** |
| **Adressprobe** | kein Weg trägt ein deutsches Wort — und jede alte Adresse wird übersetzt | **3 alte**, alle drei in der Tafel |
| **Gestaltprobe** | keine id, keine Klasse, keine Stilblattvariable | **3 falsche Freunde** (`note`, `alt`) |
| **Wortlautprobe** | die WERTE von `de.json` sind Zeichen für Zeichen die von `0681d42` | 1225 Sätze, **genau EINE benannte Ausnahme** |
| **Kürzeprobe** | kein Schlüssel trägt eine angehängte Ziffer, keiner steht über der Latte | **8 mit echter Zahl**, **4 begründete Ausnahmen**, längster 20 Zeichen |

**Sie weisen nichts ab. Sie ZÄHLEN, und jede Ausnahme steht namentlich da.**
*Eine Ausnahme, die niemand zählt, wird zur Auslegung; eine, die einen Namen
hat, bleibt eine Entscheidung.*

**Die eine Ausnahme der Wortlautprobe ist `server.backupDirNotSet`** — der
Satz NENNT die Umgebungsvariable, und die heißt seit Bauabschnitt 5.2
`BACKUP_DIR`. Die anderen 1224 Sätze sind Wort für Wort dieselben.

**Jeder Wächter hat seine Gegenprobe** (694 bis 699): eine Stelle, an der
ein deutscher Name zurückkehrt — ein Bezeichner, ein Schlüssel, eine
Adresse, eine Klasse, ein Satz, eine angehängte Ziffer. **Und sie sind
gefahren, nicht behauptet** — jede in einer eigenen Kopie aus
`git archive HEAD`:

| Rückbau | holt zurück | rot |
|---|---|---|
| 694 | einen deutschen Bezeichner im Server | 2 |
| 695 | einen deutschen Schlüssel der Sprachdatei | 4 |
| 696 | eine deutsche Adresse | 2 |
| 697 | eine deutsche Klasse im Stilblatt | 1 |
| 698 | einen umformulierten Satz der Oberfläche | 3 |
| 699 | einen Schlüssel mit angehängter Ziffer | 9 |
| 700 | den Griff der Vorschaukachel an den Sprachhelfer | 1 |
| 701 | die Stellung des zugeklappten Linkblocks | 1 |

*Ein Wächter, der nie rot wird, ist eine Behauptung und keine Zusage.*

### Zwei Wächter sind erst durch ihre Gegenprobe brauchbar geworden

**Der erste Anlauf meldete achtmal ABGERISSEN statt einer roten Zeile.**
Die Wortlautprobe holte die Werte der Abnahme mit `git show` — und eine
Gegenprobenkopie entsteht aus `git archive` und hat kein `.git`. Der Aufruf
brach ab und mit ihm der ganze Lauf. *Ein abgerissener Lauf belegt nichts
(Stolpersteine 138, 161 und 170).* Die Werte stehen jetzt als
`tools/wording-0681d42.json` daneben, erzeugt aus genau diesem Commit.

**Und 700 blieb STUMM — ein Fund am Wächter selbst.** Er schloss jeden
Punkt vor dem `t` aus; in `[...t.parentElement]` gehört der Punkt aber zum
AUSBREITEN und nicht zu einem Eigentumszugriff. **Genau die Stelle aus dem
Betrieb wäre ihm durchgegangen.** Er unterscheidet jetzt wie der Umbenenner:
ein EINZELNER Punkt davor heißt Eigenschaft (`obj.t.name`), zwei heißen
Ausbreiten — mit drei gestellten Fällen belegt.

### Die Gestaltprobe hat gleich beim Bauen etwas gefunden

`.role-badge.eigentuemer` und `.user-dot.aktiv` **waren seit Bauabschnitt
6.3 tot.** Die Werte heißen seither `owner` und `active`, die Klassen im
Stilblatt hießen noch deutsch — das Abzeichen des Eigentümers hatte seinen
Grund verloren, der Punkt am aktiven Zugang seine grüne Farbe. **Ein
sichtbarer Schaden, den kein Prüfstand gesehen hat.** Jetzt hält ihn ein
Wächter.

---

## 7. Drei Befunde aus dem Betrieb — am 7. September 2026 gemeldet

**Zwei davon gehen auf 0.24.0 zurück, einer ist älter.** Sie sind mit zwei
Bildern gemeldet und noch am selben Tag behoben worden.

### Die Vorschaukachel im Eintrag war mit der Maus nicht anzuklicken

`t.parentElement` — **`t` gehört seit 0.24.0 dem Sprachhelfer**, die Kachel
heißt `tile`. Die Umbenennung von damals hat den Rumpf einer Pfeilfunktion
nicht mitgenommen. `t.parentElement` ist `undefined`, das Ausbreiten wirft,
und der Klick verpufft. *Mit den Pfeiltasten ging es die ganze Zeit — die
laufen einen anderen Weg.*

**Derselbe Griff repariert Maus und Finger:** beide laufen über dasselbe
`onClick` in `makeSortable()`.

### Ein Tag am Testtag hieß „t"

Dieselbe Ursache, dieselbe Runde: `t.name` gab den Namen der FUNKTION
zurück, `t.id` gab `undefined`, und das Kreuz löschte `/tags/undefined`.
*Der Titel war schon vor 0.24.0 kein gültiges Attribut mehr — das
schließende Zeichen ist ein einfaches `"`, und `entfernen"` stand seither
als Geisterattribut daneben.*

**Ein Wächter fängt die ganze Klasse:** in `public/app.js` wird der
Sprachhelfer nie nach einer Eigenschaft gefragt. *Warum es niemand sah:
beides wirft keinen Fehler. Eine Funktion HAT eine Eigenschaft `name`, und
`undefined` fällt erst beim Ausbreiten auf — im Rumpf eines Hörers, den
niemand ruft, wenn er kaputt ist.*

### Der zugeklappte Block „Links" zeigte die letzten Zeilen

Das Hinzufügen eines Links scrollt den Kasten ans Ende, danach klemmt
`limitLinks()` ihn auf `LINK_ROWS` Zeilen — **und der geklemmte Kasten
behielt die Stellung.** Bei acht Links standen die Nummern 4 bis 8 da statt
1 bis 5. Der Bildlauf steht dort auf `hidden`, sie war also auch von außen
nicht mehr zu ändern.

**Zugeklappt heißt: die ersten N Zeilen**, der Rest steht hinter dem Knopf.

---

## 8. Was zurückgestellt ist — namentlich

**104 Namen im ausgelieferten Code bleiben deutsch, und keiner davon ist
eine Benennung.** Es sind GRENZEN:

* **Schlüssel der Sprachdatei und ihre Platzhalter** — `{tage}`,
  `{minuten}`, `{deckel}`, `{verfasser}`, `{stimmen}` und siebzig weitere.

  **WARUM SIE NICHT JETZT FALLEN — an einem echten Beispiel.** In `de.json`
  steht `"card.inDays": "{tage} Tagen"`, in `public/app.js` daneben
  `tH('card.inDays', { tage: log.days })`. **Das Wort steht zweimal: als
  Marke IM SATZ und als Name IM CODE, und beide müssen buchstabengleich
  sein** — sonst findet die Marke ihren Wert nicht, und am Bildschirm steht
  `{tage} Tagen` statt „30 Tagen". *Derselbe Platzhalter steckt in den
  Briefen `mail.invite.body` und `mail.reset.body`, dort neben `{minuten}`.*

  Ein Umbenennen auf `days` verlangt also, den deutschen Satz mitzuändern
  (`"{days} Tagen"`). **Und genau das ist die Abnahme dieser Runde: kein
  Wert in `de.json` ändert sich.** Der Name wäre nur zu holen, indem man die
  Zusage bricht.

  **In Stufe 2 wird der Satz ohnehin angefasst**, weil `en.json` daneben
  kommt (`"in {days} days"`). Dann ändern sich Satz, Marke und Name in EINEM
  Griff — deutsch, englisch, türkisch und Code zugleich. *Das ist der Grund,
  und der einzige.*
* **Die Namen des Vokabulars** — `sacheEinzahl`, `bewertungMehrzahl`,
  `merkmalJa` und elf weitere. *Sie stehen als Werte in der Datenbank.*
* **Die Mehrzahlformen** `eins` und `andere` — 68 Vorkommen.
* **Gespeicherte Werte** — Blocknamen (`seite`, `unten`), Filterschlüssel
  (`abgelehnt`), Sortierwerte (`potenzial_desc`), zwei Spalten
  (`geloescht_am`, `bestaetigt_am`).
* **Die Abfrageangaben** `?teil=`, `?teile=`, `?von=`, `?bis=`,
  `?eintraege=`, `?beitraege=`. *Die ersten vier baut die Oberfläche aus
  `card.partQuery`, einem WERT der Sprachdatei — sie ziehen mit ihm um.*
* **`sicher` in der gespeicherten Mail-Einstellung** — sie liegt als JSON in
  `settings` und bräuchte eine eigene Migration.
* **`offen`** — drei Bedeutungen in drei Dateien.

**Und sechs falsche Freunde**, die das Wörterbuch als deutsche Wörter kennt
und die an ihrer Stelle englisch sind: `MAILTEST_KEY`, `cleanNote`,
`liesIn`, `note`, `noteFailure`, `noteSuccess`.

---

## 9. Abweichungen vom Auftrag — namentlich

**Der Auftrag nagelt in Bauabschnitt 7.3 vier Zahlen auf NULL fest. Drei
davon stehen nicht auf null, und das ist eine Abweichung und kein
Versehen.**

| der Auftrag sagt | gemessen | warum |
|---|---|---|
| deutsche Bezeichner im ausgelieferten Code = **0** | **110** | Keiner davon ist eine Benennung. 104 sind GRENZEN — Platzhalter der Sprachdatei, Vokabelnamen, gespeicherte Werte —, sechs sind falsche Freunde. *Sie ziehen mit ihrer Sache um, und die Sache fasst Stufe 2 an.* |
| deutsche Schlüssel = **0** | **87** | 68 Mehrzahlformen (`eins`/`andere`), 14 Vokabelnamen, 5 falsche Freunde. *Die Mehrzahlformen und das Vokabular sind INHALT: sie stehen als Werte in der Datenbank.* |
| Schlüssel mit angehängter Ziffer **66 → 0** | **8** | Bei allen achten ist die Ziffer die SACHE: 50 MB, 100 MB, 200 MB, 300 MB, Schritt 1, Schritt 2, 10 px, 20 px. *Die Regel zielt auf `hinweis2` — eine Nummerierung, die nicht sagt, WAS der Satz ist.* |
| deutsche Wege = **0** | **3** | `#/offen`, `#/einladung/`, `#/bestaetigung/` — **die ALTEN Adressen**, und der Auftrag verlangt im selben Satz, dass jede von ihnen übersetzt wird. Sie stehen in der Tafel, und ein Wächter prüft es. |

**Die zwei Zahlen, die der Auftrag nennt und die unverändert geblieben
sind, sind es auch:** `F_ROUTES` steht bei **70**, `PERSONAL_KEYS`
(vormals `PERSOENLICHE_SCHLUESSEL`) bei **10**. *Beide werden im Prüfstand
gezählt, nicht behauptet.*

**Die Zahlen der Kürze, gegen die von heute gestellt:** Schlüssel mit fünf
und mehr Wörtern **261 → 1** (`card.passLinkByHandEnd`), längster
Schlüsselname **37 → 20** (`backupUnopenableHint`), Namen über der Latte
**4**, jeder mit seinem Satz im Wörterbuch.

---

## 10. Die Dateien

| war | heißt |
|---|---|
| `anhaenge.js` | `attachments.js` |
| `bestandslauf.js` | `batchrun.js` |
| `bilder.js` | `images.js` |
| `schluessel.js` | `keytool.js` |
| `schluessel.sh` | `keytool.sh` |
| `zugang.js` | `usertool.js` |
| `zweifaktor.js` | `twofactor.js` |
| `pruefung.js` | `testbench.js` |
| `gegenprobe.js` | `counterproof.js` |
| `public/thema.js` | `public/theme.js` |
| `public/sprachen/` | `public/languages/` |

**Dazu drei neue, und alle drei sind Werkzeug:** `tools/dictionary.json`
(die eine Liste), `tools/rename.js` und `tools/segments.js` (der Umbenenner
und sein Zerleger), `tools/dictionary-doc.js` (das Papier daraus).
*`db.js` liest aus dem Wörterbuch nur die drei Tafeln der Migration; der
Prüfstand liest dieselbe Datei für seine Wächter.*

---

## 11. Was diese Runde ausdrücklich NICHT tut

* **Keine Übersetzung der Oberfläche.** `en.json` kommt mit Stufe 2.
* **Kein Kommentar wird angefasst** — weder übersetzt noch gekürzt. *Wo ein
  Kommentar einen Namen ZITIERT, zieht das Zitat mit; der deutsche Satz
  darum bleibt Wort für Wort stehen.*
* **Kein Papier wird übersetzt.**
* **Keine Umgestaltung.** Eine Funktion, die beim Umbenennen als zu lang
  auffällt, bleibt zu lang. *Wer beides zugleich tut, kann eine rote Zeile
  nicht mehr zuordnen.*
* **Kein Prüfungsname und kein Rückbauname ändert sich** — sie sind
  Bericht, nicht Code.
* **Kein Wort am Bildschirm ändert sich.** *Ausgenommen die drei Befunde
  aus dem Betrieb: dort ändert sich etwas, und zwar zurück auf das, was
  gemeint war.*
