# Auftrag 0.24.3 — „Kriterion spricht Englisch, und der Benutzer wählt"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** Seit 0.24.0 liegt jeder
Satz der Oberfläche in `public/languages/de.json`, und seit 0.24.1 heißt jeder
Name im Code englisch. **Was fehlt, ist die zweite Sprache.** In dieser Runde
kommt `en.json` neben `de.json`, **Englisch wird die Vorgabesprache**, und
zwei Leute an derselben Installation können gleichzeitig verschiedene Sprachen
lesen — Oberfläche, Meldungen und Mails. *Der Eigentümer bestimmt, welche
Sprache die Installation vorgibt und welche dem Benutzer überhaupt zur Wahl
stehen; der Benutzer wählt daraus seine eigene.*

**Eine Sprache wird an der ANWESENHEIT ihrer Datei erkannt** — kein Eintrag im
Quelltext, kein Neubau: wer `tr.json` in `public/languages/` legt, hat eine
Sprache mehr.

Aufsetzend auf **0.24.2, Fingerprint `ae0084d8`** — im Feld bestätigt am
7. September 2026.

> **DIE NUMMER IST OFFEN, UND SIE IST FRAGE F1.** Diese Runde bringt eine
> Funktion, die die Installation vorher nicht konnte — **nach Abschnitt 5.1
> des Projektstands ist das MINOR und nicht PATCH.** Das Konzept warnt seit
> E12 davor, und der Fahrplan überlässt die Entscheidung ausdrücklich diesem
> Auftrag. *Fällt sie auf 0.25.0, wird dieses Papier beim Start der Runde per
> `git mv` umbenannt — die Nummer im Dateinamen ist keine zweite Wahrheit.*

---

## Was der Betreiber bereits festgelegt hat

**Am 7. September 2026, und das steht nicht zur Diskussion:**

1. **Englisch ist die Vorgabesprache.**
2. **Eine Sprache wird an der Anwesenheit ihrer Datei erkannt** —
   `<sprachbezeichnung>.json` in `public/languages/`. Keine Liste im
   Quelltext, das Verzeichnis ist die Liste. Der vordere Teil des Dateinamens
   trägt eine **international anerkannte Sprachbezeichnung** (`de.json`,
   `tr.json`) — **und das gilt auch für Englisch.**
3. **Der Eigentümer wählt im Abschnitt „Installation" eine andere
   Vorgabesprache**, wenn deren Datei liegt. **Im selben Einsteller legt er
   fest, welche Sprachen der Benutzer in seinem persönlichen Bereich
   überhaupt zur Wahl bekommt** und dort als seine eigene Kriterion-Sprache
   setzt.

*Empfehlung dieses Papiers zu (2): **BCP 47** — der zweibuchstabige
ISO-639-1-Code als Regelfall (`de`, `en`, `tr`), und wo eine Sprache sich nach
Region unterscheidet, Sprache und Region mit Bindestrich (`pt-BR`,
`zh-Hans`). Der Grund ist kein Geschmack: genau diese Zeichenfolge steht schon
heute in `<html lang>`, und `Intl` erwartet sie für Datum, Zahl und Sortierung.
Die Datei heißt bereits `de.json`, also ist nichts umzubenennen.*

---

## Zuerst: neun Fragen, die vor der ersten Zeile geklärt werden

**Kein Bauabschnitt beginnt, bevor die Spalte „Antwort" gefüllt ist.** Die
Fragen werden **beim Start der Runde im Gespräch** gestellt, beantwortet und
hier eingetragen — nicht unterwegs (Abschnitt 12 des Projektstands). Die
Spalte „Vorschlag" ist der Vorschlag dieses Papiers; **entschieden ist nichts,
solange die Antwort fehlt.**

**Drei davon entscheiden über den Zuschnitt der Runde** — F1 über die Nummer,
F7 und F8 darüber, wie groß sie wird. **Zwei sind Fallen, die erst beim
Messen sichtbar wurden** — F2 und F6. *Wer sie überspringt, baut gegen eine
Vermutung.*

| # | Frage | Vorschlag | Antwort |
|---|---|---|---|
| **F1** | **Die Nummer: 0.24.3 oder 0.25.0?** Die Runde bringt eine Funktion, die es vorher nicht gab; 0.25.0 steht im Fahrplan als *frei* | **0.25.0.** Eine PATCH-Zahl für eine neue Funktion ist genau das, wogegen SemVer gebaut ist. *Kostet nichts außer einem `git mv` an diesem Papier* |  |
| **F2** | **Was sieht eine BESTEHENDE Installation nach dem Einspielen?** Heute steht `LANGUAGE_DEFAULT = 'de'`, und die laufende Instanz hat keine Vorgabe gesetzt. Vorgabe (1) sagt: Englisch | **Der Bestand behält Deutsch, eine frische Installation startet auf Englisch.** Ein Migrationsblock schreibt einmalig `language = 'de'`, wenn die Instanz schon Zugänge hat. *Sonst spricht eine laufende Instanz nach dem Update plötzlich Englisch — und „am Bildschirm ändert sich kein Wort" wäre zum ersten Mal in dieser Reihe gebrochen, ohne dass jemand es bestellt hätte* |  |
| **F3** | **Das Vokabular — welche der drei Fassungen gilt?** E9 sagt: je Sprache, mit Überschreibung je Sprache. Die Entscheidung vom 5. September (F3 des Auftrags 0.24.0) sagt: **ein** Satz je Installation, wie der Titel. Der Fahrplan-Nachtrag sagt: je angelegter Sprache in der Datenbank, mit Rückfall auf den zuerst angelegten Satz | **Der Nachtrag.** Er hält beides: der Eigentümer pflegt seine Wörter je Sprache, und wer eine Sprache dazulegt, ohne Wörter zu pflegen, sieht die des Bestands statt Löcher. *Die Entscheidung vom 5. September war für eine Runde MIT einer Sprache richtig; mit zweien stellt sich die Frage neu* |  |
| **F4** | **Welches Englisch (E13)?** `en-GB` oder `en-US` | **`en-GB`** — Tag zuerst wie Deutsch und Türkisch, 24 Stunden, *Colour*. Es ist eine Zeile (`_locale`), **aber sie zieht die Wörter mit** und ist später nicht ohne sie änderbar |  |
| **F5** | **Wer liest `en.json` gegen (E14)?** | **Der Betreiber benennt einen Leser.** Claude liefert den Erstentwurf; die Durchsicht ist nicht verhandelbar (S2.2) — *eine Sprache, die niemand gelesen hat, geht nicht heraus* |  |
| **F6** | **Was geschieht mit einer hineingelegten Datei, die Löcher hat oder falsch heißt?** Vorgabe (2) macht das Verzeichnis zur Liste, und `readLanguages()` nimmt heute **jede** `*.json` ohne jede Prüfung | **Der Dateiname wird gegen ein Muster geprüft, der Inhalt nicht.** Was nicht wie eine Sprachkennung aussieht, wird beim Start übergangen und mit einer Zeile im Containerprotokoll genannt. **Ein fehlender Schlüssel fällt auf die Vorgabesprache zurück**, nicht auf `⟦…⟧`. *Der Deckungswächter gilt für die Dateien IM REPO; eine hineingelegte kann er nicht prüfen — und der Server darf an ihr nicht sterben* |  |
| **F7** | **Ziehen die Reste aus 0.24.1 mit?** 104 deutsche Grenznamen, 68 Mehrzahlformen, die 14 Vokabelnamen, `sicher` im Mailzugang, die Blocknamen (`seite`, `unten`, `zu`), die Filterschlüssel (`abgelehnt`, `favorit`), die Sortierwerte und sechs Abfrageangaben | **Nur, was mit einem WERT der Sprachdatei umzieht** — Platzhalternamen und Vokabelnamen. **Was in der Datenbank steht, bleibt:** das wäre eine zweite Migration in einer Runde, die schon eine hat. *Und 0.24.2 hat gerade gezeigt, was eine übersehene gespeicherte Form kostet* |  |
| **F8** | **Die Kriterien je Sprache in der Datenbank?** Die Schärfung zu E11 vom 5. September sagt, dass sie in Stufe 2 je Sprache eine Fassung bekommen; der Fahrplan führt die Runde deshalb als Datenbankstufe | **Nicht in dieser Runde.** Die Kriterien sind INHALT und stellen eigene Fragen: Wer pflegt die zweite Fassung? Was zeigt Kriterion, wenn sie fehlt? Was steht im Export? **Eine eigene Runde.** *Ohne sie ist diese hier keine Datenbankstufe — außer über F2 und F3* |  |
| **F9** | **Wo genau stehen die zwei Ebenen der Wahl?** Vorgabe (3) legt Vorgabesprache und Vorrat in den Abschnitt „Installation"; das Konzept (5.2) legt die Vorgabe in die Karte „Vokabular" und kennt gar keinen Vorrat | **Eine neue Karte „Sprachen" im Abschnitt „Installation".** Vorgabe und Vorrat gehören beide dem Eigentümer und stehen zusammen. Die Karte „Vokabular" bleibt, wo sie ist, und bekommt nur die Sprachzeile über ihre vierzehn Felder |  |

**Was nicht gefragt wird, weil es entschieden ist:** die drei Vorgaben des
Betreibers oben, dass **Kommentare und Papiere deutsch bleiben**, dass
**Inhalte nie übersetzt werden** (Einträge, Kommentare, Kategorien, Tags,
Titel), und dass **jede neue Prüfung ihre gefahrene Gegenprobe hat**.

---

## Was schon dasteht — und nicht noch einmal gebaut wird

**Gemessen am Stand `03ad4c8`, am 7. September 2026.** *0.24.0 hat mehr
vorbereitet, als das Konzept für Stufe 2 vorsieht; wer das nicht nachmisst,
baut es ein zweites Mal.*

| Sache | Zustand |
|---|---|
| **Das Verzeichnis ist die Liste** | `readLanguages()` liest `public/languages/` und lädt **jede** `*.json` in `LANGUAGES` — *fertig, außer der Prüfung des Dateinamens (F6)* |
| **Eine Mehrzahlregel je Sprache** | `LANGUAGE_PLURAL` wird je geladener Datei gebaut, aus deren `_locale` — **fertig** |
| **Der Rückfall auf die Vorgabesprache** | `t()` liest `LANGUAGES[locale]`, dann `LANGUAGES[LANGUAGE_DEFAULT]`, dann `⟦…⟧` — **fertig** |
| **`localeOf(req)`** | steht als Funktion da und gibt die Konstante zurück; **125 Aufrufstellen hängen schon daran** — es fehlen die drei Quellen |
| **`LOCALE` im Browser** | kommt aus `_locale` der geladenen Datei, ebenso `PLURAL` — **fertig** |
| **Datum, Zahl, Sortierung (Konzept 6)** | `fmtDate`, `fmtDay`, `weekday` über `LOCALE`; `number()` über `Intl.NumberFormat`; `localeCompare(…, LOCALE)` an vier Stellen; `toLocaleLowerCase(LOCALE)` in der Suche — **fertig.** *Die elf `.replace('.', ',')`, die das Konzept nennt, sind mit 0.24.0 gefallen — `number()` hat sie ersetzt* |
| **`_locale` im Kopf der Datei** | `de.json` trägt `"de-DE"` — **fertig** |

**Was davon übrig bleibt, ist klein und benannt:** zwei `localeCompare` ohne
Locale (beide auf `updated_at`, einem ISO-Datum — *sie brauchen keine*), und
**acht `toLowerCase()`-Aufrufe an sieben Stellen, alle an vom Benutzer
getipptem Text** — Ansichtsnamen (im Browser und im Server), vier
Kriteriennamen aus einer Datei, der Zugangsname in `auth.js`. *Drei weitere
Aufrufe sind technisch — ein MIME-Typ, eine Adresszeile, eine Liste aus der
`.env` — und bleiben, wie sie sind.* *Die sind die
Stelle, an der Türkisch bricht (T3), und sie gehören in diese Runde, obwohl
Türkisch erst die nächste ist: mit `en.json` daneben fällt es niemandem auf,
mit `tr.json` fällt es auf die Füße.*

---

## Woher

| Ort | Zahl | nach dieser Runde |
|---|---|---|
| `public/languages/de.json` | 1191 Schlüssel, davon 34 Mehrzahlobjekte mit 68 Unterschlüsseln = **1259** | **`en.json` mit exakt denselben 1259** |
| davon Vokabelnamen | 14 | unverändert deutsch benannt *(F7)* |
| `PERSONAL_KEYS` | **10** | **11** — `language` kommt dazu |
| Felder in `GET /api/config` | **5** | **6 oder 7** — die Vorgabe, und der Vorrat *(F9)* |
| `F_ROUTES` | **70** | **70**, unverändert |
| Deutsche Bezeichner im Code | **116, alle benannt** | weniger, um die Platzhalter- und Vokabelnamen *(F7)* |
| Prüfungen | **5920** | mehr, um die sieben neuen Wächter |
| Rückbauten | **701** | mehr, um mindestens einen je Wächter |

---

## Bauabschnitt 0 — das englische Wörterbuch, vor der ersten übersetzten Zeile

**Die Regel aus 0.22.0 gilt je Sprache: eine Sache, ein Wort, beschlossen im
Gespräch.** Der Vorschlag steht im Konzept, S2.1 — die vierzehn Vokabelwörter
und rund zwanzig Sachen daneben:

`Eintrag → Entry` *(nicht „Item" — das ist das Wort der Warenkörbe)* ·
`Getestet / Ungetestet → Tested / Untested` · `Testtag → Test day` ·
`Bewertung → Rating` *(nicht „Review" — das wäre der Bericht)* ·
`Potenzial → Potential` · `Note → Score` · `Löschen / Entfernen → Delete /
Remove` · `Sicherung → Backup` · `Eigentümer → Owner`

**Drei englische Regeln, die es auf Deutsch nicht braucht** *(S2.1)*:

- **E-S1 · Sentence case.** „Reset to defaults", nicht „Reset To Defaults".
- **E-S2 · Du bleibst du.** Kein *please* vor jedem Satz; was nicht ging,
  dann der nächste Schritt.
- **E-S3 · Keine Abkürzungen, die das Deutsche nicht hat.** „e.g." nur, wo
  „z. B." stünde; „ID" bleibt „ID".

**Das Wörterbuch wird eingecheckt, bevor ein Satz übersetzt wird.** *Wer
mittendrin merkt, dass „Eintrag" mal Entry und mal Item heißt, hat 1259
Schlüssel zu prüfen statt eine Liste.*

---

## Bauabschnitt 1 — die Sprachen des Verzeichnisses

**Was `readLanguages()` dazubekommt** *(F6)*:

- **Ein Muster für den Dateinamen.** Was nicht wie eine Sprachkennung
  aussieht, wird übergangen und **namentlich ins Containerprotokoll
  geschrieben** — eine Datei, die stillschweigend nicht zählt, sucht der
  Eigentümer eine Stunde.
- **Die Pflichtdatei ist nicht mehr `de.json`.** Heute stirbt der Server ohne
  sie; nach Vorgabe (1) ist das die Vorgabesprache, und die ist Englisch.
  *Welche Datei Pflicht ist, hängt an F2.*
- **`LANGUAGE_DEFAULT` wird gelesen, nicht geschrieben** — aus den
  Einstellungen, mit Rückfall auf die Vorgabe.

---

## Bauabschnitt 2 — der Einsteller im Abschnitt „Installation"

**Eine Karte „Sprachen"** *(F9)*, und sie trägt genau zwei Dinge:

1. **Die Vorgabesprache der Installation** — eine Pillenreihe über die
   Sprachen, für die eine Datei liegt.
2. **Der Vorrat:** welche davon dem Benutzer zur Wahl stehen. *Die
   Vorgabesprache ist immer im Vorrat und lässt sich nicht herausnehmen — ein
   Vorrat ohne die Vorgabe wäre eine Installation, deren Vorgabe niemand
   sehen darf.*

**Dieselbe Bauform wie der Vorrat der Suchmaschinen**, und aus demselben
Grund: *der Eigentümer kuratiert, der Benutzer wählt daraus.*

---

## Bauabschnitt 3 — die Wahl je Benutzer

- **`language` wird der elfte persönliche Schlüssel**, mit einer Klemme in
  `PUT /api/settings` gegen den Vorrat — *dieselbe Bauform wie `theme`.*
- **Eine Pillenreihe „Sprache" in der Karte „Darstellung"**, über dem
  Farbschema. **Die Namen stehen in ihrer eigenen Sprache** — wer die
  Oberfläche gerade nicht lesen kann, findet seine trotzdem.
- **Die Zeile unter der Anmeldemaske** — der eine Ort, an dem noch kein Konto
  da ist. Ein Klick dort schreibt nur das Gedächtnis.
- **Drei Quellen, und die Reihenfolge steht** *(Konzept 5.3)*: der
  persönliche Schlüssel, dann `localStorage`, dann die Vorgabe der
  Installation.
- **Der Wechsel zeichnet neu — ohne Neuladen.** `app.js` zeichnet ohnehin
  ganze Ansichten.
- **`<html lang>` folgt der Sprache.** *Daran hängen Silbentrennung und
  Vorleser.*
- **Kein Schalter in der Kopfzeile.** Zwei Orte für eine Frage.

---

## Bauabschnitt 4 — der Server spricht die Sprache des Anfragenden

`localeOf(req)` bekommt seine drei Quellen; **125 Aufrufstellen ändern sich
nicht.** Dazu `Accept-Language` aus `api()`, und **die Mails in der Sprache
des Empfängers** *(Konzept 4.6)* — Einladung, Rücksetzung, Bestätigung und
die Testmail.

**Und die acht `toLowerCase()` an getipptem Text werden
`toLocaleLowerCase()`** — mit der Locale des Vergleichs, nicht der des
Lesers.

---

## Bauabschnitt 5 — `en.json`

**Exakt die 1259 Schlüssel von `de.json`** — nicht einen mehr, nicht einen
weniger. Erstentwurf von Claude, **Durchsicht vom benannten Leser** *(F5)*,
Satz für Satz gegen das Wörterbuch aus Bauabschnitt 0.

*Jede Stelle, an der die Übersetzung vom deutschen Satzbau abweichen muss, ist
ein Beleg dafür, dass die Trennung von 0.24.0 trägt — und jede, an der sie es
nicht kann, weil der Code noch klebt, ist ein Fund.*

---

## Bauabschnitt 6 — das Vokabular je Sprache *(hängt an F3)*

Die Vorgaben ziehen in die Sprachdatei; `VOCABULARY_DEFAULT` in `app.js` und
`server.js` fallen weg — *eine Wahrheit je Sprache statt zwei je Code.* Die
Karte „Vokabular" bekommt oben eine Sprachzeile.

> **HIER LIEGT DIE EINE GESPEICHERTE FORM DIESER RUNDE.** `settings['vocabulary']`
> ist heute ein flaches Objekt und wird ein Objekt je Sprache. **Der alte Wert
> wird beim Lesen als Vorgabesprache gedeutet** — eine Zeile in `vocabulary()`,
> kein Migrationsblock. *Und wenn doch einer nötig wird, gilt Stolperstein 324:
> ein gespeicherter Wert hat eine Form, auch wenn die Datenbank sie nicht
> kennt. Der Bestandslauf füllt `settings` — Stolperstein 325.*

---

## Bauabschnitt 7 — die Reste aus 0.24.1 *(hängt an F7)*

Die Platzhalternamen der Sprachdatei und die vierzehn Vokabelnamen ziehen mit
ihrem Satz um. **Was in der Datenbank steht, bleibt** — und die Liste
`WAITING_FOR_STAGE_TWO` im Prüfstand schrumpft um genau das, was gefallen ist,
**nicht um mehr**: eine Ausnahme, die niemand mehr braucht, ist eine
Karteileiche, und der Wächter sagt es.

---

## Bauabschnitt 8 — der Prüfstand

**Sieben neue Wächter, jeder mit seiner gefahrenen Gegenprobe** *(Konzept 9)*:

| Wächter | Zusicherung |
|---|---|
| **Deckungsprobe** | jede Datei im Repo hat exakt die Schlüssel der Vorgabesprache |
| **Verwendungsprobe** | jeder Schlüssel wird gerufen; jeder gerufene existiert |
| **Platzhalterprobe** | je Schlüssel dieselbe Menge `{…}` in jeder Sprache |
| **Mehrzahlprobe** | jedes Objekt trägt `eins` und `andere` |
| **Restprobe** | der Leser findet in `app.js` weniger als 60 lesbare Texte |
| **Rückfallprobe** | kein `⟦` im DOM irgendeiner Ansicht, in jeder Sprache |
| **Formatprobe** | `_locale` liegt in jeder Datei und ist eine, die `Intl` kennt |

**Dazu drei, die diese Runde eigens braucht:** eine **hineingelegte Datei mit
Löchern** darf den Server nicht umbringen und muss auf die Vorgabesprache
zurückfallen *(F6)*; eine **Datei mit falschem Namen** wird übergangen und
gemeldet; und **der Vorrat klemmt** — ein Benutzer kann keine Sprache setzen,
die der Eigentümer nicht freigegeben hat.

**Die Zahlen, die festgenagelt werden:** `PERSONAL_KEYS` = 11, die Felder von
`/api/config`, `F_ROUTES` = 70, die Zahl der Sprachdateien im Repo.

---

## Was ausdrücklich NICHT gebaut wird

* **Kein Türkisch.** `tr.json` ist die nächste Stufe.
* **Keine übersetzten Inhalte** — Einträge, Kommentare, Kategorien, Tags, der
  Titel. **Und die Kriterien auch nicht** *(F8)*.
* **Keine Bibliothek.** Vierzig Zeilen gegen 40 kB.
* **Kein HTML in Sprachtexten.**
* **Kein Rechts-nach-links.** *Die Bauform verbaut es nicht; das Stilblatt ist
  dafür nicht geprüft, und das steht hier, damit es niemand für erledigt hält.*
* **Keine Region je Sprache** (`de-AT` neben `de-DE`) — die Bauform lässt sie
  zu, gebaut wird sie nicht.
* **Keine Umgestaltung.** Was beim Übersetzen als zu lang auffällt, bleibt zu
  lang und geht ins Sammelblatt.

---

## Der Prüfstand — was er halten muss

1. **`npm test` grün**, und jede neue Prüfung hat ihre Gegenprobe **gefahren**.
2. **Zwei Zugänge, zwei Sprachen, gleichzeitig** — der Wechsel wirkt ohne
   Neuladen, und der jeweils andere sieht nichts davon.
3. **Die Anmeldeseite in beiden Sprachen**, mit und ohne Gedächtnis.
4. **Eine Servermeldung mit Vokabelwort und Mehrzahl auf Englisch**, mit
   `n = 1` und `n = 3`.
5. **Die Deckungsprobe grün, ihre Gegenprobe rot.**
6. **Eine Datei mit Löchern bringt den Server nicht um** *(F6)*.
7. **Ein Bestand von `ae0084d8` läuft an** — und zeigt, was F2 sagt.
8. **Der Augenschein an den zwanzig dichtesten Stellen**, in beiden Sprachen,
   am Telefon.

---

## Bauregeln

* **Zuerst die neun Fragen** — gestellt, beantwortet, eingetragen.
* **Dann das Wörterbuch**, eingecheckt, bevor ein Satz übersetzt wird.
* **Die Bauabschnitte in dieser Reihenfolge**, jeder ein eigener Commit mit
  grünem Prüfstand.
* **Die Maschine vor der Sprache.** Erst Bauabschnitt 1 bis 4, dann `en.json`
  — *eine Datei, die man nicht umschalten kann, lässt sich nicht ansehen.*
* **Nach jedem Abschnitt der Augenschein**, und am Ende der volle: alle
  Ansichten, beide Sprachen, beide Farbschemata.
* **Die Gegenprobe wird gefahren, nicht nur geschrieben.** Eine stumme
  Gegenprobe ist ein Fund.
* **Was in der Datenbank liegt, wird an einem echten Altbestand geprüft** —
  Stolperstein 324 und 325, und beide sind aus 0.24.2 bezahlt.

---

## Die Dokumente

| Datei | was |
|---|---|
| `public/languages/en.json` | **neu** — 1259 Schlüssel |
| `Doku/Aenderungsprotokoll_0.24.3.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_3.md` | `git mv`, Revision 69, **Regel S10** in 5.6: *eine Sprache ist eine Datei* |
| `Doku/Konzept_Mehrsprachigkeit_0_24_0.md` | die Nachträge zu E9, E12, E13 und die drei überholten Punkte aus 5.1/5.2 |
| `CHANGELOG.md` | ein Eintrag — **mit Kasten, wenn F2 einen Migrationsblock verlangt** |
| `Doku/Fehler_und_Ideen.md` | Wegweiserzeile |
| `package.json` | die Nummer aus F1 |

---

## Was danach offen bleibt

* **Stufe 3 — Türkisch.** `tr.json`, gegengelesen von einem Leser, den der
  Betreiber benennt. *Sie findet die sieben `toLocaleLowerCase()` schon vor.*
* **Die Kriterien je Sprache** *(F8)* — eine eigene Runde mit eigenen Fragen.
* **Die Reste, die in der Datenbank stehen** *(F7)* — Blocknamen,
  Filterschlüssel, `sicher`, die sechs Abfrageangaben.
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und
  `gegenprobe.js` nennen** — Papierarbeit aus 0.24.1, gemeldet beim Bauen von
  0.24.2.
