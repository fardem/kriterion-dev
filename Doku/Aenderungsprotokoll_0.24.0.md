# Änderungsprotokoll 0.24.0 — „Das Deutsche wandert in eine eigene Datei"

**MINOR · 6. September 2026 · gebaut auf 0.23.0 (`92f7a142`, Stand `34da9ea`).**

**Jeder Satz, den ein Mensch am Bildschirm oder in einer Mail liest, ist aus
dem Quelltext herausgenommen und in EINE Datei gelegt:
`public/sprachen/de.json`.** Der Code kennt nur noch den Schlüssel. **Die
Anwendung sieht danach genauso aus wie vorher** — das ist die Abnahme, und der
Auftrag sagt sie dreimal: *kein Wort anders.*

*Stufe 1 der Mehrsprachigkeit. Englisch und die Wahl der Sprache kommen mit
Stufe 2; `spracheVon(req)` liefert in dieser Runde immer `de`. Das Konzept
steht in `Doku/Konzept_Mehrsprachigkeit_0_24_0.md`, der Auftrag in
`Doku/Auftrag_0.24.0.md` — mit acht Fragen, die vor der ersten Zeile
beantwortet und eingetragen worden sind.*

---

## Diese Runde ist KEINE Datenbankstufe — ausdrücklich

Kein Schema, keine Migration, kein Bestandslauf. **`F_ROUTEN` bleibt bei 70**,
die persönliche Schlüsselliste bei zehn, `/api/config` bei fünf Feldern. **Es
kommt eine ausgelieferte Datei dazu** — `public/sprachen/de.json`; sie geht
über `express.static` wie `app.js`, und der Fingerprint deckt sie ab.

**Was ein Betreiber tun muss:** einspielen, im Browser einmal hart neu laden.
*Fehlt die Datei, startet der Server gar nicht erst und sagt, warum.*

---

## Was diese Runde an den Zahlen ändert

| | 0.23.0 | 0.24.0 |
|---|---|---|
| Prüfungen | 5744 | **5862** (+118) |
| Rückbauten | 649 | **685** *(neun neue, 41 mitgezogen)* |
| Schlüssel in `de.json` | — | **1190** *(davon 34 Mehrzahlformen)* |
| Lesbare Texte in `app.js` | rund 1500 | **45**, namentlich |
| Zeilen `public/app.js` | 10833 | **10963** |
| Zeilen `server.js` | 6891 | **6995** |
| Ausgelieferte Dateien in `public/` | 5 | **6** |

---

## 1. Die acht Fragen — vor der ersten Zeile

**Sie stehen vollständig im Auftrag, mit Datum.** Kurz:

| # | | |
|---|---|---|
| **F1** | Wie heißt die Datei? | `public/sprachen/de.json` |
| **F2** | Wo liegt sie? | unter `public/`, über `express.static` |
| **F3** | Vokabular je Sprache? | **jetzt flach, Stufe 2 baut das Objekt** — die Vorgaben ziehen um, das eingetragene Vokabular folgt der Installation |
| **F4** | Was wird nicht übersetzt? | **nur Kriterien bekommen in Stufe 2 eine Fassung je Sprache; Tags bleiben eine Wolke für alle** |
| **F5** | Was ist ein Text? | **was ein Mensch am Bildschirm liest** |
| **F6** | Wie heißen die Schlüssel? | **deutsch, nach der Sache, mit Namensraum** |
| **F7** | Die Zeitleiste im hellen Schema | `#b9c2cb` · `#9aa5b0` · `--muted` |
| **F8** | Der Umschalter der Tagzeile | rechts in der Kategoriezeile, „Tags" mit Zahl |

---

## 2. Bauabschnitt 0 — zwei Befunde aus dem Betrieb

**Sie standen vor der Sprache, weil sie älter sind als sie.**

* **Die Zeitleiste war im hellen Schema unsichtbar.** Das Farbkonzept 0.23.0
  hat seine Randfarben gegen die KARTE gemessen; die Zeitleiste liegt aber
  seit 0.22.0 ohne Kasten auf dem GRUND. `--line-2` misst dort **1,02 : 1** —
  eine Linie, die es nicht gibt. **Drei neue Variablen** (`--zl-linie`,
  `--zl-mitte`, `--zl-jahr`) tragen im hellen Schema `#b9c2cb`, `#9aa5b0` und
  `--muted`: **1,54 · 2,13 · 4,62**. *Im dunklen Schema tragen sie genau die
  Werte, die die vier Regeln vorher gelesen haben — kein Bildpunkt anders.*
  Der Prüfstand rechnet die drei Verhältnisse aus dem Stilblatt nach, statt
  sie abzuschreiben.
* **„Weitere Filter" kostete Platz und versprach mehr, als dahinterstand.**
  Der Aufklapper ist ein **Umschalter rechts in der Kategoriezeile**
  geworden — „Tags (2)", mit Zahl, `aria-expanded`, und er **steht gar nicht
  da, wenn kein Tag an einem Eintrag hängt.** Die Filterleiste ist
  zugeklappt 147 → **114 px**, aufgeklappt 186 → **154 px**.
  *Nachgestellt wurde vorher, in einem echten Chromium, in beiden Schemata:
  die Tags erschienen sehr wohl — die Zeile war leer, weil kein Tag benutzt
  war. Kein Fehler im Stilblatt, sondern eine Zeile, die nichts zu zeigen
  hatte.*

---

## 3. Bauabschnitt 1 — der Helfer und die Ladung

**Vierzig Zeilen, keine Bibliothek** (E4). `t()` gibt den nackten Satz, `tH()`
denselben mit **maskierten Werten** — der Text kommt aus der Datei und trägt
kein HTML, der Wert kommt vom Benutzer oder aus dem Vokabular des Admins
(Stolperstein 18 in Dateiform). **Flache Schlüssel mit Punkten**, weil
`knopf.speichern` und `knopf.speichern.titel` verschachtelt nicht nebeneinander
stehen könnten; **ein Objekt ist deshalb immer eine Mehrzahlform.**

**Die Datei kommt vor allem anderen.** `boot()` holt sie parallel zu
`/api/config`; ohne sie steht **ein einziger fester Satz** auf dem Bildschirm —
„Die Sprachdatei fehlt." (Entscheidung A1). *Ein deutscher Satz mehr wäre einer
zu viel gewesen; eine Oberfläche voller ⟦…⟧ wäre schlimmer.*

**Ein fehlender Schlüssel steht als `⟦schluessel⟧` da** — sichtbar und nie
still. Der Rückfall auf Deutsch ist schon gebaut, obwohl es nur Deutsch gibt:
eine Regel, die man erst dann baut, wenn sie gebraucht wird, ist ungeprüft.

---

## 4. Bauabschnitt 2 — die Serverseite

**153 `error:`-Stellen in `server.js`, 36 Würfe in `auth.js`, vier Briefe in
`mail.js`.** Der Weg dahin war eine kleine Klasse:

* **`Meldung`** (in `auth.js`) trägt **Schlüssel, Werte und Status** statt
  eines Satzes. `server.js` fängt sie und übersetzt — *drei Dateien, ein Satz.*
  Der Fehler-Handler erkennt sie **an ihrer Gestalt** (`.schluessel`), nicht am
  `instanceof`: so kann `mail.js` dieselbe Form bauen, ohne `auth.js` zu
  laden — ein Ringschluss weniger.
* **Zehn Würfe bleiben `new Error`** — Programmierfehler ohne Bildschirm
  („Eine Sitzung braucht einen Benutzer."). **Sie stehen namentlich im
  Prüfstand**, nicht als Zahl: wer einen entfernt, fällt auf.
* **`mail.js` bekommt den Übersetzer gereicht** (`setzeUebersetzer`), wie
  `auth.js`. Die vier Briefe sind ein Aufruf geworden: `brief(sprache, art,
  werte)` liest `mail.<art>.betreff` und `mail.<art>.text`.
* **`VOKABULAR_VORGABE` ist gefallen.** Die vierzehn Vorgaben stehen unter
  `vokabular.` in der Sprachdatei, und der Server leitet seine Liste aus dem
  Namensraum ab — eine Vorgabe, ein Ort (Stolperstein 47).

---

## 5. Bauabschnitt 3 — `public/app.js`, Ansicht für Ansicht

**Fünf Commits, fünf Ansichten**, jeder mit grünem Prüfstand: Anmeldung und
Einrichtung · Dialoge, Kopfzeile und Liste · der Eintrag · der Systembereich ·
die Reste. **Rund 1800 Bausteine sind zu 1190 Schlüsseln geworden** — weniger
Schlüssel als Stellen, weil derselbe Satz an drei Stellen jetzt einmal
dasteht und dreimal gerufen wird.

### Vier Funde am Werkzeug — jeder von einer Zusicherung gefangen

1. **Aus einem sicheren Ruf darf der NAME des Platzhalters kommen, nie sein
   WERT.** `verfasserName(v)` heißt `{verfasser}` — eingesetzt wird aber
   weiter der AUFRUF. Der erste Anlauf hat den Ruf durch sein Argument
   ersetzt; am Bildschirm stand „Angelegt von [object Object]". **Sechs
   Zusicherungen wurden rot, bevor irgendetwas eingecheckt war.** Die drei
   bereits umgezogenen Ansichten sind mit dem berichtigten Werkzeug **neu
   gebaut** — nicht nachgebessert.
2. **Ein Feldname ist kein Text.** `{ 'anfrage.frei': 'Anfrage
   freigeschaltet' }` — links steht ein Schlüssel des Sicherheitsprotokolls.
3. **Ein Schlüssel bleibt einer, wo immer er steht.** `z.was ===
   'zugang.status'` vergleicht mit einem Vorgang, nicht mit einem Wort.
4. **Ein Server-Befehl ist in jeder Sprache derselbe.** `docker compose up -d`
   war in die Datei gewandert, und der Wächter zählte nur noch drei von vier.

### Elf Tabellen standen auf ⟦…⟧

`SYS_ABSCHNITTE`, `VORGANGSWORT`, `MERKMALSWORT`, `ROLLENWORT`, `STATUSWORT`,
`PROTOKOLL_ANSICHT` samt Hilfe, `VERWALTUNGSART`, `THEMA_NAMEN`, `VOK_VORGABE`,
`VOK_FELDER`, `BILDFORMATE`, `BESTANDSLAEUFE` — **sie werden ausgewertet,
sobald der Browser die Datei liest, und die Sprachdatei kommt erst danach.**
Am Reiter stand sonst für immer ⟦karte.persoenlich⟧.

**Zwei Formen, eine Regel:** eine **Nachschlagetabelle hält den Schlüssel**
und die Lesestelle ruft (`VORGANGSWORT[z.was] ? t(...) : z.was`); wo ein Feld
**unmittelbar gelesen** wird, steht ein **Ruf** (`name: () => t(...)`).

### Ein Platzhalter gehört maskiert

**Fünf Stellen setzten mit rohem `t()` ein Vokabelwort in eine Vorlage.** Ein
`<i>` im Vokabular wurde damit zum Knoten — genau das, was `tH()` verhindert.
Die Zusicherung „Systembereich macht aus dem Vokabular kein HTML" hat es
gefangen.

### Die Einzahl kommt jetzt von der Sprache

**45 Gabelungen `=== 1 ?` sind gefallen.** Was von einer Zahl abhängt, trägt
ein Objekt `{ eins, andere }` und wird über `Intl.PluralRules` gewählt — **34
Mehrzahlformen**. Für die **Vokabelwörter** tut das `mehrzahl(n, eins, andere)`
an einer Stelle: ihre beiden Formen sind Inhalt und stehen nicht in der Datei.

---

## 6. Bauabschnitt 4 — die Format-Helfer und `<html lang>`

* **`fmtDate`, `fmtDay`, `weekday`** lesen `LOCALE` aus dem Kopf der Datei
  (`_locale: "de-DE"`). **`today()` bleibt `sv-SE`** — ein Trick für
  `JJJJ-MM-TT`, kein Datum für Menschen.
* **`zahl(n, stellen, höchstens)`** über `Intl.NumberFormat` ersetzt **elf**
  `.replace('.', ',')`. **Ohne Gruppierung**, sonst stünde in „1234" plötzlich
  ein Punkt. *Gegen den heutigen Ausdruck durchgerechnet: 5000 Zufallswerte je
  Form, null Abweichungen — bis auf eine, die dabei aufgefallen ist und
  erhalten bleibt: `alsZahl` schreibt „7,0", wo gerechnet wurde, und „7" nur
  bei einer glatten Zahl.*
* **`localeCompare(…, LOCALE)`** dort, wo Sprache verglichen wird — der
  Vergleich zweier ISO-Zeitstempel bleibt ausdrücklich ohne Sprache.
* **`toLocaleLowerCase(LOCALE)`** in Suche und Sortierung, im Browser und im
  Server. *MIME-Typen, Schlüssel und Adressen bleiben `toLowerCase()`.*
* **`document.documentElement.lang`** setzt `boot()` aus `SPRACHE`; das
  Attribut in `index.html` bleibt `de` und sagt bis dahin die Wahrheit.

---

## 7. Bauabschnitt 5 — die sieben Wächter

| Wächter | hält fest |
|---|---|
| **Deckungsprobe** | jede Datei unter `public/sprachen/` trägt genau die Schlüssel von `de.json` |
| **Verwendungsprobe** | jeder Schlüssel wird gerufen, jeder gerufene existiert — Kommentare zählen nicht mit |
| **Platzhalterprobe** | je Schlüssel dieselben `{…}` in jeder Datei; kein Name, der BEINAHE ein Vokabelwort ist |
| **Mehrzahlprobe** | jedes Objekt trägt `eins` und `andere` und nennt sein `{n}`; kein `=== 1 ?` mehr im Code |
| **Restprobe** | **45** lesbare Texte in `app.js`, **namentlich** — HTTP-Verben, Tasten, Formate, vier Server-Befehle, zwei Medienabfragen und der eine feste Satz |
| **Rückfallprobe** | kein `⟦` im DOM — Liste, Eintrag, Anmeldung und der Systembereich in drei Rollen |
| **Formatprobe** | `_locale` steht in jeder Datei und `Intl` kennt sie; `fmtDate`, `zahl` und `weekday` liefern je drei Werte wie am Stand `92f7a142` |

**Dazu:** der Bildschirmtext-Wächter **liest seit dieser Runde die
Sprachdatei** — jeden Wert, nicht nur die Servermeldungen; ein Platzhaltername
ist dabei kein Bildschirmtext. Ein neuer Wächter hält fest, dass **kein
Server-Befehl in der Sprachdatei** steht. Und `de.json` steht jetzt auf der
Liste der ausgelieferten Dateien, die der Wächter gegen den alten Projektnamen
liest.

### Neun Altlasten — Befund, nicht Änderung

**Der Wächter sieht neun Sätze zum ersten Mal**, weil sie vorher an Stellen
standen, die er nicht las: vier in `throw new Error` oder in einem Prüfer,
**fünf sind die Briefe aus `mail.js`** — ein Brief war nie ein Bildschirm. In
ihnen stehen Wörter, die das Wörterbuch aus 0.22.0 vom Bildschirm genommen hat:
**„Zugang", „Rücksetzlink", „Verwaltungsbereich", „Kasten", „liegen".**

**Sie sind in dieser Runde NICHT geändert worden**, und das ist keine
Nachsicht, sondern die Abnahme: *kein Wort anders.* Sie stehen **namentlich**
im Prüfstand und im Sammelblatt.

---

## 8. Die Dateien

| Datei | was |
|---|---|
| `public/sprachen/de.json` | **neu** — 1190 Schlüssel, `_locale: "de-DE"` |
| `public/app.js` | der Helfer, `mehrzahl()`, `zahl()`, elf Tabellen auf Rufe und Schlüssel umgestellt, rund 1800 Textstellen |
| `server.js` | Sprachdateien lesen, `t(sprache, …)`, `spracheVon(req)`, `zahl()` und die Suche mit Locale |
| `auth.js` | `class Meldung`, `setzeUebersetzer`, 36 Würfe |
| `mail.js` | Übersetzer gereicht, vier Briefe aus zwei Schlüsseln |
| `public/style.css` | drei Variablen für die Zeitleiste, der Tagzeilen-Umschalter |
| `pruefung.js` | die sieben Wächter, die Rückfallprobe in zwei Gruppen, umgedrehte Wächter |
| `gegenprobe.js` | neun neue Rückbauten (685–693), 41 mitgezogen |
| `Doku/Projektstand_Kriterion_0_24_0.md` | **`git mv`** aus `_0_23_0`, Revision 66, **Regel S8** in 5.6 |

---

## 9. Was diese Runde ausdrücklich NICHT tut

* **Kein Englisch, keine Sprachwahl.** `spracheVon(req)` liefert `de`.
* **Kein Inhalt zieht um** — Vokabular, Tags, Kriterien, Kategorien, Titel,
  Einträge bleiben in der Sprache, in der sie eingetragen wurden.
* **Kein Wort wird verbessert.** Wer einen Satz besser fände, ändert ihn in
  einer eigenen Runde — hier ist er Zeichen für Zeichen derselbe.
