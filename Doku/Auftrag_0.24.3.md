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

**UND SEIT DEM 7. SEPTEMBER 2026 IST DIE RUNDE GRÖSSER ALS DIESER ABSATZ.**
*Der Betreiber hat F7 und F8 gegen den Vorschlag dieses Papiers entschieden:*
**der deutsche Rest aus 0.24.1 fällt ganz — auch der, der in der Datenbank
steht —, und Kriterien wie Kategorien bekommen je Sprache eine eigene
Fassung.** Damit ist die Runde eine **Datenbankstufe mit drei
Migrationsblöcken**, zwei neuen Tabellen und **Austauschformat 14**. *Was
davon wie gebaut wird, steht in den Antworten unten und in den Bauabschnitten
6a und 7.*

Aufsetzend auf **0.24.2, Fingerprint `ae0084d8`** — im Feld bestätigt am
7. September 2026.

> **DIE NUMMER IST ENTSCHIEDEN, UND SIE BLEIBT 0.24.3.** *Der Betreiber hat
> F1 am 7. September 2026 gegen den Vorschlag dieses Papiers entschieden.*
> Diese Runde bringt eine Funktion, die die Installation vorher nicht konnte —
> **nach Abschnitt 5.1 des Projektstands wäre das MINOR und nicht PATCH**, und
> das Konzept warnt seit E12 davor. **Die Abweichung ist gewollt und benannt:**
> *0.24.0 bis 0.24.3 sind EIN Vorgang — die Datei, der Quelltext, die Formen,
> die zweite Sprache —, und Türkisch wird 0.24.4. `0.25.0` bleibt frei.* **Sie
> steht im Änderungsprotokoll als Abweichung, damit sie in einem halben Jahr
> nicht als Versehen gelesen wird.**

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

## Zuerst: zwölf Fragen, die vor der ersten Zeile geklärt werden

**Kein Bauabschnitt beginnt, bevor die Spalte „Antwort" gefüllt ist.** Die
Fragen werden **beim Start der Runde im Gespräch** gestellt, beantwortet und
hier eingetragen — nicht unterwegs (Abschnitt 12 des Projektstands). Die
Spalte „Vorschlag" ist der Vorschlag dieses Papiers; **entschieden ist nichts,
solange die Antwort fehlt.**

**Drei davon entscheiden über den Zuschnitt der Runde** — F1 über die Nummer,
F7 und F8 darüber, wie groß sie wird. **Zwei sind Fallen, die erst beim
Messen sichtbar wurden** — F2 und F6. *Wer sie überspringt, baut gegen eine
Vermutung.*

> **ALLE ZWÖLF SIND AM 7. SEPTEMBER 2026 IM GESPRÄCH BEANTWORTET WORDEN,
> vor der ersten Zeile.** *Neun standen hier; drei sind dazugekommen, weil F8
> mit Ja beantwortet wurde und damit genau die drei Fragen stellte, mit denen
> dieses Papier F8 abgelehnt hatte.* **Zwei Antworten weichen vom Vorschlag ab
> — F1 und F7 —, eine dritte macht die Runde größer als geplant: F8.** *Die
> Runde ist damit eine Datenbankstufe mit drei Migrationsblöcken, und das
> Austauschformat steigt auf 14.*

| # | Frage | Vorschlag | Antwort |
|---|---|---|---|
| **F1** | **Die Nummer: 0.24.3 oder 0.25.0?** Die Runde bringt eine Funktion, die es vorher nicht gab; 0.25.0 steht im Fahrplan als *frei* | **0.25.0.** Eine PATCH-Zahl für eine neue Funktion ist genau das, wogegen SemVer gebaut ist. *Kostet nichts außer einem `git mv` an diesem Papier* | **0.24.3 — die Nummer bleibt, gegen den Vorschlag.** *Entschieden vom Betreiber am 7. September 2026:* „diese Runde wurde hauptsächlich gemacht, um die englische Sprache hier reinzubringen. Sie ist damit ein Teil der 24er, genauso wie Türkisch, der später kommt." **Das ist eine benannte Abweichung von Projektstand 5.1** — die Runde bringt eine Funktion und trägt eine PATCH-Zahl. *Sie steht hier, damit sie niemand für ein Versehen hält: 0.24.0 bis 0.24.3 sind EIN Vorgang — die Datei, der Quelltext, die Formen, die zweite Sprache —, und Türkisch wird 0.24.4.* **`0.25.0` bleibt frei.** |
| **F2** | **Was sieht eine BESTEHENDE Installation nach dem Einspielen?** Heute steht `LANGUAGE_DEFAULT = 'de'`, und die laufende Instanz hat keine Vorgabe gesetzt. Vorgabe (1) sagt: Englisch | **Der Bestand behält Deutsch, eine frische Installation startet auf Englisch.** Ein Migrationsblock schreibt einmalig `language = 'de'`, wenn die Instanz schon Zugänge hat. *Sonst spricht eine laufende Instanz nach dem Update plötzlich Englisch — und „am Bildschirm ändert sich kein Wort" wäre zum ersten Mal in dieser Reihe gebrochen, ohne dass jemand es bestellt hätte* | **Wie vorgeschlagen.** Der Bestand behält Deutsch, eine frische Installation startet auf Englisch. **Und es MUSS ein Migrationsblock sein, kein abgeleiteter Wert** — das ist beim Messen aufgefallen: „kein `language` in `settings` **und** es gibt Zugänge → Deutsch" beim LESEN abzuleiten kippte eine frisch auf Englisch eingerichtete Installation in dem Augenblick auf Deutsch, in dem der erste Zugang angelegt ist. *Der Block läuft in `db.js` vor `db.exec(SCHEMA)`, an derselben Stelle wie die aus 0.24.1 und 0.24.2, und fragt die Zeile selbst statt eines Merkers — wiederholbar und im Normalfall stumm.* |
| **F3** | **Das Vokabular — welche der drei Fassungen gilt?** E9 sagt: je Sprache, mit Überschreibung je Sprache. Die Entscheidung vom 5. September (F3 des Auftrags 0.24.0) sagt: **ein** Satz je Installation, wie der Titel. Der Fahrplan-Nachtrag sagt: je angelegter Sprache in der Datenbank, mit Rückfall auf den zuerst angelegten Satz | **Der Nachtrag.** Er hält beides: der Eigentümer pflegt seine Wörter je Sprache, und wer eine Sprache dazulegt, ohne Wörter zu pflegen, sieht die des Bestands statt Löcher. *Die Entscheidung vom 5. September war für eine Runde MIT einer Sprache richtig; mit zweien stellt sich die Frage neu* | **Wie vorgeschlagen — der Nachtrag**, und in derselben Bauform wie F8: je Sprache, mit Rückfall auf die Vorgabesprache. `settings['vocabulary']` wird ein Objekt je Sprache, der alte flache Wert gilt beim Lesen als Vorgabesprache. **`VOCABULARY_DEFAULT` fällt an beiden Stellen weg** — in `app.js` und in `server.js` —, die Vorgaben stehen ab jetzt in der Sprachdatei. *Eine Wahrheit je Sprache statt zwei je Code.* |
| **F4** | **Welches Englisch (E13)?** `en-GB` oder `en-US` | **`en-GB`** — Tag zuerst wie Deutsch und Türkisch, 24 Stunden, *Colour*. Es ist eine Zeile (`_locale`), **aber sie zieht die Wörter mit** und ist später nicht ohne sie änderbar | **`en-GB`.** *Der Betreiber hat die Entscheidung ausdrücklich abgegeben („ich habe keine Präferenzen"); sie fällt nach der Messung und nicht nach dem Geschmack.* Gemessen am 7. September 2026: `de-DE` 07.09.2026 14:30 · `tr-TR` 07.09.2026 14:30 · `en-GB` 07/09/2026 14:30 · **`en-US` 09/07/2026 02:30 PM**. **Alle drei Sprachen dieser Installation schreiben den Tag zuerst; nur `en-US` nicht** — und `09/07/2026` liest ein deutscher oder türkischer Benutzer als 9. Juli. *In einem Archiv mit Testtagen ist das ein Fehler und keine Geschmacksfrage.* **`en-US` ist weltweit der häufigere Vorgabewert** — das gilt für Produkte an ein Weltpublikum und nicht für dieses hier. *Geht Kriterion je nach Amerika, liegt `en-US.json` daneben: genau dafür ist „eine Sprache ist eine Datei" da.* **Und keine der beiden Fassungen bringt eine einstellbare Datumsanzeige** — Kriterion hat keine, das Format folgt der Locale, und eine zu bauen schließt dieses Papier zweimal aus. |
| **F5** | **Wer liest `en.json` gegen (E14)?** | **Der Betreiber benennt einen Leser.** Claude liefert den Erstentwurf; die Durchsicht ist nicht verhandelbar (S2.2) — *eine Sprache, die niemand gelesen hat, geht nicht heraus* | **Der Betreiber liest selbst gegen.** *Claude liefert den Erstentwurf; die Durchsicht geht Satz für Satz gegen das Wörterbuch aus Bauabschnitt 0.* **Damit das lesbar ist, steht `en.json` in der Reihenfolge von `de.json`** — Schlüssel für Schlüssel dieselbe Folge, damit beim Lesen daneben steht, wo der Satz am Bildschirm auftaucht. |
| **F6** | **Was geschieht mit einer hineingelegten Datei, die Löcher hat oder falsch heißt?** Vorgabe (2) macht das Verzeichnis zur Liste, und `readLanguages()` nimmt heute **jede** `*.json` ohne jede Prüfung | **Der Dateiname wird gegen ein Muster geprüft, der Inhalt nicht.** Was nicht wie eine Sprachkennung aussieht, wird beim Start übergangen und mit einer Zeile im Containerprotokoll genannt. **Ein fehlender Schlüssel fällt auf die Vorgabesprache zurück**, nicht auf `⟦…⟧`. *Der Deckungswächter gilt für die Dateien IM REPO; eine hineingelegte kann er nicht prüfen — und der Server darf an ihr nicht sterben* | **Wie vorgeschlagen — und es sind DREI Klammern, nicht eine.** Beim Messen gefunden: der Server stirbt heute an einer hineingelegten Datei auf drei Wegen. (1) `JSON.parse` steht ungeschützt — kaputtes JSON bricht den Start ab. (2) `new Intl.PluralRules(texts._locale)` steht ungeschützt — eine fehlende oder erfundene `_locale` wirft `RangeError` beim Start. (3) Der harte Wurf, wenn die Pflichtdatei fehlt. **Alle drei melden ab jetzt und werfen nicht**, dazu das Muster auf den Dateinamen (BCP 47). *Der Inhalt wird nicht geprüft: ein fehlender Schlüssel fällt auf die Vorgabesprache zurück, nicht auf `⟦…⟧`.* |
| **F7** | **Ziehen die Reste aus 0.24.1 mit?** 104 deutsche Grenznamen, 68 Mehrzahlformen, die 14 Vokabelnamen, `sicher` im Mailzugang, die Blocknamen (`seite`, `unten`, `zu`), die Filterschlüssel (`abgelehnt`, `favorit`), die Sortierwerte und sechs Abfrageangaben | **Nur, was mit einem WERT der Sprachdatei umzieht** — Platzhalternamen und Vokabelnamen. **Was in der Datenbank steht, bleibt:** das wäre eine zweite Migration in einer Runde, die schon eine hat. *Und 0.24.2 hat gerade gezeigt, was eine übersehene gespeicherte Form kostet* | **ALLES, auch was in der Datenbank steht — gegen den Vorschlag.** *Entschieden vom Betreiber am 7. September 2026.* Der deutsche Rest aus 0.24.1 fällt in dieser Runde ganz: die 104 Platzhalternamen, die 68 Mehrzahlformen (`eins`/`andere`), die 14 Vokabelnamen — **und die gespeicherten Werte**: die Blocknamen (`seite`, `unten`, `zu`), die Filterschlüssel (`abgelehnt`, `favorit`), die Sortierwerte (`potenzial_asc`, `potenzial_desc`), `sicher` im Mailzugang und die sechs Abfrageangaben (`?teil=`, `?teile=`, `?von=`, `?bis=`, `?eintraege=`, `?beitraege=`). **`WAITING_FOR_STAGE_TWO` fällt ganz weg**, und mit ihr die Zahl 104. *Das ist ein zweiter Migrationsblock in einer Runde, die schon einen hat — und genau der Fall, vor dem Stolperstein 324 warnt: das Schema UND der Inhalt.* |
| **F8** | **Die Kriterien je Sprache in der Datenbank?** Die Schärfung zu E11 vom 5. September sagt, dass sie in Stufe 2 je Sprache eine Fassung bekommen; der Fahrplan führt die Runde deshalb als Datenbankstufe | **Nicht in dieser Runde.** Die Kriterien sind INHALT und stellen eigene Fragen: Wer pflegt die zweite Fassung? Was zeigt Kriterion, wenn sie fehlt? Was steht im Export? **Eine eigene Runde.** *Ohne sie ist diese hier keine Datenbankstufe — außer über F2 und F3* | **JA — und die Runde ist damit eine Datenbankstufe.** *Entschieden vom Betreiber am 7. September 2026, gegen den Vorschlag:* „die Tabelle könnte noch eine Spalte bekommen, in der die Zuordnung zu der Sprache drin steht. Hat der Admin noch keinen Eintrag für die Übersetzung eingegeben, werden automatisch die Einträge aus der Default-Sprache verwendet." **Die drei Fragen, die dieses Papier dagegen hielt, sind damit gestellt und beantwortet — sie stehen als F8a, F8b und F8c unter dieser Tafel.** |
| **F9** | **Wo genau stehen die zwei Ebenen der Wahl?** Vorgabe (3) legt Vorgabesprache und Vorrat in den Abschnitt „Installation"; das Konzept (5.2) legt die Vorgabe in die Karte „Vokabular" und kennt gar keinen Vorrat | **Eine neue Karte „Sprachen" im Abschnitt „Installation".** Vorgabe und Vorrat gehören beide dem Eigentümer und stehen zusammen. Die Karte „Vokabular" bleibt, wo sie ist, und bekommt nur die Sprachzeile über ihre vierzehn Felder | **Wie vorgeschlagen.** Eine neue Karte „Sprachen" im Abschnitt „Installation", neben „Titel" — *der Abschnitt trägt damit seine zweite Karte, und der Vermerk in `app.js` („trägt heute genau eine Karte") wird mit ihr fällig.* Dieselbe Bauform wie der Vorrat der Suchmaschinen. Die Karte „Vokabular" bekommt nur die Sprachzeile über ihre vierzehn Felder. |

### Die drei Fragen, die F8 aufgemacht hat — gestellt und beantwortet am selben Tag

*Dieses Papier hatte F8 mit genau diesen drei Fragen abgelehnt. Der Betreiber
hat F8 mit Ja beantwortet — also werden sie gestellt, vor der ersten Zeile und
nicht unterwegs.*

| # | Frage | Antwort |
|---|---|---|
| **F8a** | **WIE hängt die Sprachfassung an einem Kriterium?** *Das ist die Frage, an der die Runde hängt:* jede Bewertung im Bestand zeigt über `ratings.criterion_id` auf eine Zeile in `rating_criteria`, mit `UNIQUE(item_id, criterion_id, user_id)` darauf. **Eine zweite ZEILE je Sprache tränte die vorhandenen Bewertungen von ihrem Kriterium** | **Eine Namenstabelle daneben.** `rating_criteria` bleibt, wie es ist — `id`, `weight`, `phase`, `sort_order` und der Name der zuerst angelegten Sprache. Daneben `criterion_names (criterion_id, language, name)` mit den Übersetzungen. **Die Bewertungen werden nicht angefasst**, `UNIQUE(name)` bleibt stehen, und der Rückfall ist ein `LEFT JOIN`: keine Zeile für diese Sprache → der Name der Vorgabesprache. *Ein Kriterium bleibt EIN Kriterium, in wie vielen Sprachen es auch heißt.* **Die Spalte, die der Betreiber genannt hat, steht damit da — sie steht nur in der Tabelle daneben und nicht in der, an der die Bewertungen hängen** |
| **F8b** | **Kommen die KATEGORIEN mit?** Der Nachtrag zu E9/E11 vom 6. September nennt drei Sachen: Vokabular, Kriterien **und Kategorien**. F3 und F8 entscheiden die ersten beiden | **Ja, gleiche Bauform.** `category_names (category_id, language, name)` neben `product_categories`, derselbe Rückfall. *Der Nachtrag ist damit ganz erfüllt, und es ist dieselbe Maschine ein zweites Mal — kein neues Nachdenken, nur Arbeit.* **`items.product_category_id` wird nicht angefasst**, aus demselben Grund wie bei F8a |
| **F8c** | **Was steht im Export?** `EXCHANGE_FORMAT` ist heute **13**. Der Export ist Teil der öffentlichen Schnittstelle (Projektstand 5.1, Punkt 2) — *was er nicht trägt, ist beim Wiedereinspielen weg* | **Alle Sprachfassungen, Formatnummer auf 14.** Die Übersetzungen der Kriterien und Kategorien gehen mit hinaus und kommen wieder herein. *Sonst verlöre ein Rundlauf über Export und Import genau die Arbeit, die der Eigentümer gerade von Hand eingetragen hat.* **Ältere Dateien bleiben lesbar** — der Import entscheidet über das Vorhandensein der Felder und nie über die Nummer, und das bleibt so |

**Und drei Befunde aus dem Nachmessen, die keine Frage sind, sondern Arbeit:**

1. **`localeOf(req)` steht an 179 Zeilen in `server.js`, nicht an 125.** *Der
   Auftrag nennt die Zahl aus dem Konzept; gemessen am Stand `24bfc86` sind es
   179. **Keine davon ändert sich** — der Vorbau aus 0.24.0 trägt.*
2. **Die Rückfalldatei im Browser ist fest auf Deutsch verdrahtet:**
   `if (code === 'de') TEXTS_DE = data;` in `loadLanguage()`. *Mit Englisch als
   Vorgabe muss der Browser ZWEI Dateien holen, sobald die Sprache des Benutzers
   nicht die Vorgabe ist — und `TEXTS_DE` heißt dann falsch.*
3. **Der Abschnitt „Installation" trägt heute genau eine Karte**, und
   `app.js` sagt das in einem Kommentar mit Begründung. *Mit der Karte
   „Sprachen" (F9) wird der Kommentar unwahr und zieht mit.*

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
| **`localeOf(req)`** | steht als Funktion da und gibt die Konstante zurück; **179 Zeilen hängen schon daran** *(gemessen am Stand `24bfc86`; das Konzept nannte 125)* — es fehlen die drei Quellen |
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
| davon Vokabelnamen | 14 | **englisch benannt** *(F7)* |
| davon Mehrzahlformen | 68 (`eins` / `andere`) | **englisch benannt** — `one` / `other` *(F7)* |
| Platzhalternamen in `de.json` | **112 verschiedene, davon 104 deutsch** | **112 englisch** *(F7)* |
| `PERSONAL_KEYS` | **10** | **11** — `language` kommt dazu |
| Felder in `GET /api/config` | **5** | **7** — die Vorgabe und der Vorrat *(F9)* |
| `F_ROUTES` | **70** | **70**, unverändert |
| Deutsche Bezeichner im Code | **116, alle benannt** | **6** — nur die falschen Freunde bleiben *(F7)* |
| `WAITING_FOR_STAGE_TWO` | **104** | **fällt weg** *(F7)* |
| `OLD_STORED_NAMES` | **6** | **mehr** — die Übersetzungstafel der neuen Migration *(F7)* |
| Tabellen | **25** | **27** — `criterion_names`, `category_names` *(F8a, F8b)* |
| `EXCHANGE_FORMAT` | **13** | **14** *(F8c)* |
| Migrationsblöcke dieser Runde | — | **drei** — die Vorgabesprache *(F2)*, die gespeicherten Werte *(F7)*, die Namenstabellen *(F8a/F8b)* |
| `localeOf(req)`-Zeilen in `server.js` | **179** *(nicht 125)* | **179**, keine ändert sich |
| Prüfungen | **5920** | mehr, um die zehn neuen Wächter |
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
- **Die Pflichtdatei ist `en.json`.** *Sie ist die Vorgabesprache nach Vorgabe
  (1) und damit die Datei, auf die jeder Rückfall zeigt.* **Und sie wird
  gemeldet statt geworfen** *(F6)*: fehlt sie, sagt das Containerprotokoll es
  in einer Zeile — der Server stirbt nicht mehr daran, denn *eine Instanz, die
  nicht hochkommt, kann niemand mehr richten.*
- **Zwei weitere Klammern an derselben Stelle** *(F6)*: `JSON.parse` und
  `new Intl.PluralRules(texts._locale)`. **Beide stehen heute nackt da**, und
  jede von beiden bringt den Start an einer hineingelegten Datei um.
- **`LANGUAGE_DEFAULT` wird gelesen, nicht geschrieben** — aus den
  Einstellungen, mit Rückfall auf `en`. *Der Bestand liest dort `de`, weil der
  Migrationsblock aus F2 es einmalig hineingeschrieben hat.*

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

`localeOf(req)` bekommt seine drei Quellen; **die 179 Aufrufstellen ändern
sich nicht** — *gemessen, nicht geschätzt: das Papier nannte 125, und der
Vorbau aus 0.24.0 trägt auch die übrigen 54.* Dazu `Accept-Language` aus
`api()`, und **die Mails in der Sprache des Empfängers** *(Konzept 4.6)* —
Einladung, Rücksetzung, Bestätigung und die Testmail.

**Und die acht `toLowerCase()` an getipptem Text werden
`toLocaleLowerCase()`** — mit der Locale des Vergleichs, nicht der des
Lesers.

> **DIE RÜCKFALLDATEI IM BROWSER HEISST HEUTE `TEXTS_DE` UND WIRD ES NICHT
> BLEIBEN.** *Beim Messen gefunden:* `loadLanguage()` setzt sie mit
> `if (code === 'de') TEXTS_DE = data;` — **fest auf Deutsch verdrahtet.** Mit
> Englisch als Vorgabe muss der Browser **zwei Dateien holen**, sobald die
> Sprache des Benutzers nicht die Vorgabe ist, und der Name zieht mit
> *(Bauabschnitt 3)*.

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

> **`settings['vocabulary']` ist heute ein flaches Objekt und wird ein Objekt
> je Sprache.** *Der alte Wert wird beim Lesen als Vorgabesprache gedeutet —
> eine Zeile in `vocabulary()`, kein eigener Migrationsblock.* **Der Rückfall
> geht auf den ZUERST ANGELEGTEN Satz und nicht auf die Vorgaben der Datei:**
> wer die Installation auf Deutsch angelegt und die vierzehn Wörter gepflegt
> hat, sieht sie beim Umschalten auf Englisch wieder — *lieber ein Wort in der
> falschen Sprache als gar keines (Nachtrag zu E9).*
>
> **DIESE RUNDE HAT DREI GESPEICHERTE FORMEN, NICHT EINE** — *das ist die
> Folge von F7 und F8.* Neben dieser hier die Werte aus Bauabschnitt 7 und die
> Namenstabellen aus Bauabschnitt 6a. **Für alle drei gilt Stolperstein 324:**
> ein gespeicherter Wert hat eine Form, auch wenn die Datenbank sie nicht
> kennt — *wer den Namen umbenennt, fasst das Schema UND den Inhalt an.* **Und
> Stolperstein 325:** der Bestandslauf füllt `settings`, `rating_criteria` und
> `product_categories`, *sonst sagt er über genau die Klasse nichts, an der es
> scheitert.*

---

## Bauabschnitt 6a — die Kriterien und die Kategorien je Sprache *(F8, F8a, F8b, F8c)*

**Zwei neue Tabellen, und keine der beiden rührt an, woran der Bestand hängt:**

```
criterion_names (criterion_id, language, name)   UNIQUE(criterion_id, language)
category_names  (category_id,  language, name)   UNIQUE(category_id,  language)
```

**`rating_criteria` und `product_categories` bleiben, wie sie sind** — mit
`id`, `weight`, `phase`, `sort_order`, `UNIQUE(name)` und dem Namen der zuerst
angelegten Sprache darin. *Das ist keine Sparsamkeit, sondern die Bedingung:*
`ratings.criterion_id` mit `UNIQUE(item_id, criterion_id, user_id)` und
`items.product_category_id` zeigen auf genau diese Zeilen. **Eine zweite Zeile
je Sprache träfe jede Bewertung im Bestand** — und `UNIQUE(name)` zu ändern
hieße Tabellenneubau, weil SQLite kein `ALTER CONSTRAINT` kennt.

**Der Rückfall ist ein `LEFT JOIN` und kein Zustand:** keine Zeile für die
gelesene Sprache → der Name aus `rating_criteria.name` bzw.
`product_categories.name`. *Er gilt genau so lange, wie für eine Sprache noch
nichts dasteht — Nachtrag zu E9/E11, Punkt 4.*

**Der Eigentümer pflegt sie in derselben Bauform wie das Vokabular:** ein
Sprachumschalter über der Liste, und darunter stehen die Namen der gewählten
Sprache. *Wo nichts eingetragen ist, steht der Name der Vorgabesprache als
Vorschlag im Feld und nicht ein leeres Feld.*

**Der Export trägt beide Tabellen** *(F8c)*; `EXCHANGE_FORMAT` steigt von
**13 auf 14**. *Der Import entscheidet weiter über das Vorhandensein der
Felder und nie über die Nummer — ältere Dateien bleiben lesbar, ohne dass
irgendwo eine Fallunterscheidung nach Nummer steht.*

> **DIE TAGS BLEIBEN, WIE SIE SIND.** *Eine Wolke, keine Zuordnung, keine
> zweite Fassung — Nachtrag zu E9/E11, Punkt 2. Ein Tag ist eine Marke am
> Bestand und kein Satz.* **Und die Einträge, Kommentare und der Titel
> ebenfalls nicht:** sie sind Inhalt und werden nie übersetzt.

---

## Bauabschnitt 7 — die Reste aus 0.24.1, alle *(hängt an F7)*

**F7 ist gegen den Vorschlag entschieden: der deutsche Rest fällt ganz.** Drei
Schichten, und nur die erste zieht mit einem Wert der Sprachdatei um:

1. **In der Sprachdatei** — die 112 Platzhalternamen (davon 104 deutsch), die
   68 Mehrzahlformen (`eins`/`andere` → `one`/`other`), die 14 Vokabelnamen.
   *Sie ziehen mit ihrem Satz um: `"{tage} Tagen"` wird `"{days} Tagen"`, und
   `en.json` trägt `"in {days} days"`. Genau dafür hat 0.24.1 sie liegen
   gelassen.*
2. **In der Datenbank** — die Blocknamen (`seite`, `unten`, `zu`), die
   Filterschlüssel (`abgelehnt`, `favorit`), die Sortierwerte
   (`potenzial_asc`, `potenzial_desc`), `sicher` im Mailzugang. **Das ist der
   zweite Migrationsblock dieser Runde**, und er geht denselben Weg wie
   `SHAPES_0242`: die Zeile selbst wird gefragt, nicht ein Merker —
   wiederholbar und im Normalfall stumm.
3. **In den Adressen** — die sechs Abfrageangaben `?teil=`, `?teile=`,
   `?von=`, `?bis=`, `?eintraege=`, `?beitraege=`. *Die ersten vier baut die
   Oberfläche aus `card.partQuery`, einem WERT der Sprachdatei — sie ziehen
   mit ihm um, ohne dass jemand sie einzeln anfasst.*

**`WAITING_FOR_STAGE_TWO` fällt ganz weg**, und mit ihr die Zahl 104. *Eine
Ausnahme, die niemand mehr braucht, ist eine Karteileiche, und der Wächter
sagt es.* **Was bleibt, sind die sechs falschen Freunde** (`MAILTEST_KEY`,
`cleanNote`, `liesIn`, `note`, `noteFailure`, `noteSuccess`) **und die
Übersetzungstafel der neuen Migration** — sie steht in `OLD_STORED_NAMES`,
denn *eine Übersetzungstafel muss sagen dürfen, was sie übersetzt.*

> **DIE ALTEN ADRESSEN BLEIBEN STEHEN.** `#/offen`, `#/einladung/` und
> `#/bestaetigung/` sind die DREI ALTEN Wege aus 0.24.1 und stehen in ihrer
> Tafel — *sie sind kein Rest, sondern der Gegenstand einer Übersetzung.*

---

## Bauabschnitt 8 — der Prüfstand

**Sieben neue Wächter, jeder mit seiner gefahrenen Gegenprobe** *(Konzept 9)*:

| Wächter | Zusicherung |
|---|---|
| **Deckungsprobe** | jede Datei im Repo hat exakt die Schlüssel der Vorgabesprache |
| **Verwendungsprobe** | jeder Schlüssel wird gerufen; jeder gerufene existiert |
| **Platzhalterprobe** | je Schlüssel dieselbe Menge `{…}` in jeder Sprache |
| **Mehrzahlprobe** | jedes Objekt trägt `one` und `other` *(F7)* |
| **Restprobe** | der Leser findet in `app.js` weniger als 60 lesbare Texte |
| **Rückfallprobe** | kein `⟦` im DOM irgendeiner Ansicht, in jeder Sprache |
| **Formatprobe** | `_locale` liegt in jeder Datei und ist eine, die `Intl` kennt |

**Dazu SECHS, die diese Runde eigens braucht** — drei aus F6 und F9, drei aus
F7 und F8:

| Wächter | Zusicherung |
|---|---|
| **Fremddateiprobe** *(F6)* | eine hineingelegte Datei mit Löchern bringt den Server nicht um und fällt auf die Vorgabesprache zurück — **an allen drei Klammern**: kaputtes JSON, unbrauchbare `_locale`, fehlende Pflichtdatei |
| **Namensprobe der Dateien** *(F6)* | eine Datei mit falschem Namen wird übergangen **und namentlich gemeldet** |
| **Vorratsprobe** *(F9)* | ein Benutzer kann keine Sprache setzen, die der Eigentümer nicht freigegeben hat — und die Vorgabesprache lässt sich nicht aus dem Vorrat nehmen |
| **Restnamensprobe** *(F7)* | **kein deutscher Bezeichner mehr außer den sechs falschen Freunden** — `WAITING_FOR_STAGE_TWO` ist weg, und der Wächter meldet jede Karteileiche in `OLD_STORED_NAMES` |
| **Bestandsprobe der Werte** *(F7)* | ein Altbestand mit gesetzten Blöcken, Filtern, Ansichten und Mailzugang läuft an, **und alles steht danach da** — der zweite Lauf ist stumm |
| **Rückfallprobe der Namen** *(F8a, F8b)* | ein Kriterium ohne Zeile in `criterion_names` zeigt den Namen der Vorgabesprache, **und seine Bewertungen hängen unverändert daran** — dasselbe für eine Kategorie |

**Die Zahlen, die festgenagelt werden:** `PERSONAL_KEYS` = **11**, die
**sieben** Felder von `/api/config`, `F_ROUTES` = **70**, `EXCHANGE_FORMAT` =
**14**, die Zahl der Tabellen = **27**, die Zahl der Sprachdateien im Repo =
**2**, und die Zahl der deutschen Bezeichner = **6**.

---

## Was ausdrücklich NICHT gebaut wird

* **Kein Türkisch.** `tr.json` ist die nächste Stufe.
* **Keine übersetzten Inhalte** — Einträge, Kommentare, Tags, der Titel.
  ***Kategorien und Kriterien sind mit F8, F8a und F8b AUSGENOMMEN:*** *sie
  bekommen je Sprache eine Fassung, weil der Nachtrag zu E9/E11 sie ausdrücklich
  neben das Vokabular stellt. **Übersetzt wird trotzdem nichts:** der Eigentümer
  trägt die zweite Fassung von Hand ein, und wo er es nicht tut, steht die
  erste.*
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
6. **Eine Datei mit Löchern bringt den Server nicht um** *(F6)* — und eine mit
   kaputtem JSON und eine mit erfundener `_locale` ebenso wenig.
7. **Ein Bestand von `ae0084d8` läuft an** — und zeigt, was F2 sagt.
8. **DERSELBE Bestand hat gesetzte Blöcke, Filter, Ansichten, eigene
   Suchmaschinen und einen Mailzugang** *(F7)*, **dazu Kriterien mit
   Bewertungen und Kategorien an Einträgen** *(F8a, F8b)* — *er wird nicht
   danach gebaut, was leicht zu füllen ist, sondern danach, WAS DIESE RUNDE
   ANFASST (Stolperstein 325).*
9. **Nach dem Lauf steht alles da**, und der zweite Lauf ist stumm.
10. **Ein Export, wieder eingespielt, trägt beide Sprachfassungen** *(F8c)* —
    und eine Datei mit Format 13 lässt sich weiterhin einspielen.
11. **Der Augenschein an den zwanzig dichtesten Stellen**, in beiden Sprachen,
    am Telefon.

---

## Bauregeln

* **Zuerst die zwölf Fragen** — gestellt, beantwortet, eingetragen.
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
| `Doku/Woerterbuch_Englisch_0_24_3.md` | **neu** — das englische Wörterbuch aus Bauabschnitt 0, eingecheckt vor dem ersten übersetzten Satz |
| `Doku/Aenderungsprotokoll_0.24.3.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_3.md` | `git mv`, Revision 69, **Regel S10** in 5.6: *eine Sprache ist eine Datei* — **dazu die benannte Abweichung von 5.1** *(F1)* |
| `Doku/Konzept_Mehrsprachigkeit_0_24_0.md` | die Nachträge zu E9, E12, E13, E14 und die drei überholten Punkte aus 5.1/5.2 |
| `CHANGELOG.md` | ein Eintrag — **mit Kasten: drei Migrationsblöcke und Austauschformat 14** |
| `Doku/Fehler_und_Ideen.md` | Wegweiserzeile — **und der Fahrplan rückt: Türkisch wird 0.24.4** |
| `package.json` | **0.24.3** *(F1)* |

---

## Was danach offen bleibt

* **Stufe 3 — Türkisch, als 0.24.4.** `tr.json`, gegengelesen von einem Leser,
  den der Betreiber benennt. *Sie findet die acht `toLocaleLowerCase()` schon
  vor — und die Namenstabellen aus Bauabschnitt 6a, in die nur noch Zeilen
  einzutragen sind.*
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und
  `gegenprobe.js` nennen** — Papierarbeit aus 0.24.1, gemeldet beim Bauen von
  0.24.2.
* **Rechts-nach-links** und **die Region je Sprache** (`de-AT` neben `de-DE`) —
  *die Bauform lässt beides zu; gebaut ist keines von beiden, und das steht
  hier, damit es niemand für erledigt hält.*

> **F7 UND F8 SIND MIT DIESER RUNDE ERLEDIGT und stehen deshalb NICHT mehr
> hier.** *Beide standen im ersten Entwurf dieses Papiers unter „offen" — der
> Betreiber hat sie am 7. September 2026 in die Runde geholt.*
