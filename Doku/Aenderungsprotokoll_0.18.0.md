# Änderungsprotokoll 0.18.0 — „Die Suche wird nachvollziehbar"

**Version 0.18.0 · gebaut am 1. September 2026 · Fingerprint `FINGERPRINT_PLATZ` ·
4917 Prüfungen · 421 Rückbauten in `gegenprobe.js`**

---

**DER ÄLTESTE OFFENE PUNKT DES SAMMELBLATTS, Nr. 1** — aufgefallen am
**27. August 2026** unmittelbar nach dem Einspielen von 0.11.0 und seither
dreimal übersprungen, weil vier Rundläufe von Hand dazwischenkamen.

**Der Befund in einem Satz:** *eine Suche nach „ella" findet auch „eurobella" —
unter anderem in einer Linkadresse.* **Der Treffer ist richtig. Er war nur nicht
nachvollziehbar:** die Kachel sagte nicht, **wo** das Wort steht.

**Das war ein Wunsch und kein Fehler.** *Vor 0.11.0 lief `searchText.includes(q)`
im Browser über genau dieselben Quellen, zusammengeklebt zu einem Feld; „ella"
fand „eurobella" also auch damals. 0.11.0 hat das Verhalten absichtlich Zeichen
für Zeichen erhalten — sichtbar geworden ist es, weil die Suche seither benutzt
wird.*

> **DIE NUMMER: MINOR.** *Die Übersicht sagt danach, **warum** ein Eintrag in
> der Trefferliste steht. Das konnte sie vorher nicht.*

> **DIES IST KEINE DATENBANKSTUFE — ausdrücklich gesagt.** Kein Schema, kein
> Migrationsblock, keine neue Formatnummer: es bleibt bei **sieben** markierten
> Blöcken und bei **Austauschformat 11**. *Die Suche liest, sie schreibt
> nichts.* **`F_ROUTEN` bleibt bei 69**, `BESTAETIGUNG_ZWECKE` bei sieben,
> achtzehn Karten in fünf Abschnitten, acht persönliche Schlüssel — nachgezählt
> und nicht angenommen. **Die Sicherung des Datenverzeichnisses ist Empfehlung
> und nicht Pflicht.**

---

## Inhalt

1. [Was gebaut ist](#1-was-gebaut-ist)
2. [Der Trefferkontext im Server](#2-der-trefferkontext-im-server)
3. [Die Trefferzeile an der Kachel](#3-die-trefferzeile-an-der-kachel)
4. [Die Hervorhebung, und die Falle, die dazugehört](#4-die-hervorhebung-und-die-falle-die-dazugehört)
5. [Der Suchbegriff in der Adresse](#5-der-suchbegriff-in-der-adresse)
6. [Gemessen in Chromium](#6-gemessen-in-chromium)
7. [Gemessen an der Datenbank](#7-gemessen-an-der-datenbank)
8. [Abweichungen, mit Begründung](#8-abweichungen-mit-begründung)
9. [Die Entscheidungen dieser Runde](#9-die-entscheidungen-dieser-runde)
10. [Was je Datei geändert wurde](#10-was-je-datei-geändert-wurde)
11. [Der Prüfstand](#11-der-prüfstand)
12. [Gegenproben](#12-gegenproben)
13. [Neue Stolpersteine](#13-neue-stolpersteine)
14. [Die Zahlen](#14-die-zahlen)
15. [Was ausdrücklich nicht gebaut ist](#15-was-ausdrücklich-nicht-gebaut-ist)
16. [Offen geblieben](#16-offen-geblieben)

---

## 1. Was gebaut ist

**Drei Stücke, und sie hängen aneinander.**

1. **Der Trefferkontext.** Die Suchantwort trägt je Eintrag ein Feld
   `fundstelle`: die **Quelle**, den **Ausschnitt** um die Fundstelle herum und
   die Zahl der **weiteren** getroffenen Quellen. *Es steht nur da, wenn
   wirklich gesucht wurde.*
2. **Die Trefferzeile und die Hervorhebung.** Die Kachel macht daraus **eine**
   Zeile unter dem Titel; der Begriff ist markiert, wo er gesucht wurde.
3. **Der Begriff in der Adresse.** `#/item/12?q=ella` — die Hervorhebung
   übersteht ein Neuladen.

---

## 2. Der Trefferkontext im Server

### Die sieben Quellen stehen jetzt genau einmal

**Bis 0.17.5 stand die Bedingung nur im `WHERE`**, und die Antwort warf weg,
welche der sieben getroffen hatte. **Seit 0.18.0 muss dieselbe Bedingung zweimal
ausgewertet werden:** einmal als Filter und einmal als Auskunft.

**Abgeschrieben liefen die beiden ab dem nächsten Zusatz auseinander** — ein
Eintrag stünde dann in der Trefferliste, ohne dass eine Quelle dazu genannt
wäre. Deshalb steht die Liste `VOLLTEXT_QUELLEN` da, und beide Hälften der
Abfrage werden aus ihr gesetzt:

```js
const qVolltext = db.prepare(`
  SELECT i.id,
         ${VOLLTEXT_QUELLEN.map(q => `${q.wert} AS f_${q.schluessel}`).join(…)}
    FROM items i
    LEFT JOIN product_categories c ON c.id = i.product_category_id
   WHERE ${VOLLTEXT_QUELLEN.map(q => `(${q.wert}) IS NOT NULL`).join(…)}`);
```

**Jeder Ausdruck liefert den getroffenen Text oder `NULL`.** Damit ist
`IS NOT NULL` genau dieselbe Frage wie vorher `instr(…) > 0` beziehungsweise
`EXISTS (…)`: getroffen wird nur über nicht leeren Text, und der Suchbegriff ist
nie leer.

> **ES SIND SIEBEN UND NICHT SECHS**, und jetzt ist es nachzählbar: die Tags
> kommen zweimal vor, einmal am Eintrag und einmal am Testtag. *Der Fahrplan
> zählte sechs.*

### Warum der Filter die ODER-Kette bleibt

**SQLite bricht sie beim ersten Treffer ab.** Stünden die sieben Ausdrücke
stattdessen in einer inneren Abfrage und die Bedingung darüber, wären sie für
**jede** Zeile des Bestands vollständig zu rechnen — auch für die, die schon am
Titel hängen bleibt. **Die Spaltenliste rechnet nur für die Zeilen, die
durchkommen.**

### Die feste Folge

> **Beschreibung · Kommentar · Link · Tag am Testtag · Tag · Kategorie · Titel**

**Sie beginnt bei dem, was die Kachel NICHT zeigt.** *Steht der Begriff im
Titel, sieht man ihn ohnehin — die Zeile trüge dort nichts bei. Steht er in
einem Kommentar, ist sie die einzige Auskunft, die es gibt.* **Trifft nur der
Titel, steht die Zeile trotzdem da** — eine Regel und keine Ausnahme.

### Je Quelle ein bestimmter Satz

**Wo mehrere Zeilen treffen können — Tags, Links, Kommentare —, steht ein
`ORDER BY`.** *Ohne es entschiede die Abfrageplanung, welcher Kommentar auf der
Kachel steht, und dieselbe Suche zeigte morgen einen anderen.* Gewählt ist
jeweils die Reihenfolge, in der die Oberfläche die Zeilen ohnehin zeigt: Links
nach ihrer Sortierung, Kommentare nach ihrem Alter, Tags nach ihrem Namen.

### Der Ausschnitt

```js
const AUSSCHNITT_LAENGE = 56;
const AUSSCHNITT_VORLAUF = 4;
```

**Der Text wird eingeebnet, der Begriff nicht.** *Ein Kommentar trägt Absätze;
die Kachelzeile ist eine Zeile. Der Begriff dagegen wird genommen, wie er
getippt und getrimmt ist — genau so wurde gesucht, und wer ihn hier zusätzlich
einebnete, suchte im Ausschnitt nach etwas anderem als im Bestand.*

**Vier Zeichen Vorlauf, und die Zahl ist gemessen** — siehe Abschnitt 6.

---

## 3. Die Trefferzeile an der Kachel

**Sie steht unter dem Titel und über den Tags** — bei dem, was sie erklärt, und
nicht am Fuß bei den Zahlen.

```
Beschreibung: …eurobella, sehr handlich, und in der Beschr…   +2
Kommentar:    … in Bellavista empfohlen, und er hatte …
Link:         …eurobella.example/werkzeug/stichsaege-mo…
```

**Drei Teile, und nur der mittlere gibt nach.** Die Quelle sagt, **wo** der
Begriff steht, die Zahl, wie viele weitere Stellen es gibt — beide sind kurz und
wären abgeschnitten wertlos. **Der Ausschnitt ist der einzige Teil, der sich
kürzen lässt, ohne eine Aussage zu verlieren:** die Fundstelle steht in ihm ganz
vorn, was hinten fehlt, ist Umgebung.

**Der Ausschnitt kommt als echte Knoten in die Seite und nie über `innerHTML`.**
*Er kann aus einem Kommentar stammen, und für Kommentartext gilt seit 0.5.4
genau das (Projektstand 5.6) — auch dann, wenn er auf dem Umweg über die Kachel
kommt.* **Die Vorlage lässt die Stelle deshalb leer.**

**Eine unbekannte Quelle heißt „Fundstelle" und fällt nicht aus der Zeile.** *Ein
Server, der eine achte Quelle kennt, und eine Oberfläche, die sie noch nicht
kennt, sind derselbe Fall wie eine alte Oberfläche an einer neuen Antwort: die
Zeile sagt dann weniger, aber sie lügt nicht und sie verschwindet nicht.*

---

## 4. Die Hervorhebung, und die Falle, die dazugehört

**Hervorheben heißt, fremden Text mit Markup zu durchsetzen. Kommentartexte
kommen von Menschen.**

> **PROJEKTSTAND 5.6: „Kommentartext kommt nie über `innerHTML` in die Seite"
> (seit 0.5.4).** `.cmt-body` wird mit echten Knoten gefüllt. **Damit ist
> Maskierung nicht „nicht vergessen worden", sondern baulich unmöglich.**

**Die Hervorhebung ist deshalb ein DRITTES STÜCK DER ZERLEGUNG** — neben „Text"
und „Link" — und kein Nachbearbeiten des Ergebnisses:

```js
function zerlegeAmBegriff(text, begriff, rest = {}) { … }   // { text, treffer: true }
function stueckKnoten(s) {
  if (!s?.treffer) return document.createTextNode(text);
  const m = document.createElement('mark');
  m.textContent = text;                                     // niemals innerHTML
  return m;
}
```

*Wer den Rohtext maskiert und danach `<mark>` hineinschreibt, hat den Weg wieder
aufgemacht, den 0.5.4 zugemacht hat. Wer das fertige Ergebnis nachbearbeitet,
muss dafür wieder in Strings denken, und genau dort entsteht der Fehler.*

**Gesucht wird mit `indexOf` und nicht mit einem Muster.** *Aus einem Suchbegriff
ein reguläres Ausdrucksmuster zu bauen hieße, jedes Sonderzeichen darin
maskieren zu müssen; ein eingegebener Punkt fände sonst jedes Zeichen —
derselbe Fehler wie `LIKE` gegen `instr()` im Server, nur im Browser.*

**Eine Adresse bleibt ein Link, auch wenn der Begriff mitten in ihr steht.** Die
Zerlegung liefert sie dann als mehrere Stücke mit demselben Ziel, und der
Knotenbauer setzt sie zu **einem** Anker zusammen. *Drei Anker nebeneinander
wären drei Links auf dieselbe Adresse — für ein Vorleseprogramm drei Ziele statt
einem.*

**In der Linkliste wird die ADRESSE hervorgehoben und nicht der Anzeigename.**
*Gesucht wurde in `links.url`; ein hervorgehobener Anbietername, in dem der
Begriff gar nicht steht, wäre eine Falschaussage.*

### Die Prüfung dazu ist erweitert und nicht ersetzt

**Die Lage „Auch der Knotenbauer erzeugt aus Markup niemals Markup" fuhr schon
vorher einen echten Angriffstext** — `<img src=x onerror=alert(1)>` — **durch
`baueKommentarknoten()`. Sie steht unverändert; daneben steht dieselbe Zeile ein
zweites Mal, jetzt mit einem Begriff, der MITTEN IM Markup trifft** (`onerror`).
*Geprüft wird dreierlei: dass kein `img` entsteht, dass überhaupt kein fremdes
Element entsteht, und dass der Text Zeichen für Zeichen so dasteht, wie er
gespeichert ist.*

---

## 5. Der Suchbegriff in der Adresse

```js
const EINTRAG_MUSTER = /^#\/item\/(\d+)(?:\?(.*))?$/;
```

**Das Muster war verankert und bleibt es** — `#/item/12x` trifft nicht, weder
mit noch ohne Begriff. **Eine Adresse ohne `?q=` bleibt gültig** und heißt
„keine Suche"; jedes Lesezeichen von gestern führt dorthin, wohin es immer
führte.

**Gelesen wird mit `URLSearchParams` und nicht mit einem zweiten Muster.** *Das
Entschlüsseln der Prozentzeichen steht damit an einer Stelle, und ein Parameter,
den diese Fassung nicht kennt, wirft die Adresse nicht um.*

**Gesetzt wird über `history.replaceState`** — dieselbe Entscheidung wie im
Systembereich seit 0.16.0. **Nachgezogen wird an genau einer Stelle**, in
`renderDetail()`: nicht jeder Weg in einen Eintrag kommt von einer Kachel — die
Glockentafel, die Zeitleiste, die offenen Aufgaben und der Vergleich setzen die
Adresse selbst. *Wer stattdessen an jedem Absender den Begriff anhängte, hätte
ihn ab dem nächsten Absender vergessen.*

**Die Übersicht bekommt den Begriff NICHT in die Adresse.** *Dort steht er im
Feld, und das Feld ist sichtbar.*

---

## 6. Gemessen in Chromium

**Gemessen wurde über das DevTools-Protokoll an einer echten Instanz**, mit dem
Werkzeug aus 0.17.4 — es liegt außerhalb des Baums und braucht keine
Abhängigkeit. **Der Bestand ist derselbe für beide Stände** (vierzehn Einträge,
vier davon Treffer auf „bella"), **und der alte Stand kommt aus
`git archive HEAD`**, nicht aus dem Arbeitsbaum.

### Die Kachelhöhe OHNE Suchbegriff — sie darf sich um keinen Pixel ändern

| Fenster | Kachelbreite | 0.17.5 | 0.18.0 |
|---|---|---|---|
| `--window-size=1280,900` | 293,50 px | 371,20 / 395,84 px | **371,20 / 395,84 px** |
| `--window-size=620,900` | 188,66 px | 258,77 / 282,41 / 301,50 px | **258,77 / 282,41 / 301,50 px** |
| `--window-size=390,844` | 173,00 px | 262,19 / 266,73 / 285,83 px | **262,19 / 266,73 / 285,83 px** |

**Kein Pixel Unterschied, auf allen drei Breiten.** *Die Kachel baut die Zeile
ohne `fundstelle` gar nicht erst, und das Feld steht ohne Suche nicht in der
Antwort.*

### Die Kachelhöhe MIT Suchbegriff

| Fenster | 0.17.5 | 0.18.0 | Zuwachs |
|---|---|---|---|
| 1280 × 900 | 398,34 px | **420,70 px** | +22,36 |
| 620 × 900 | 282,39 / 301,48 px | **303,27 / 322,84 px** | +20,88 / +21,36 |
| 390 × 844 | 266,73 / 285,83 px | **287,61 / 307,19 px** | +20,88 / +21,36 |

**Alle Trefferkacheln wachsen um dieselbe Zeile** — die Zeile steht an jeder von
ihnen, also verschiebt sich nichts gegeneinander. *Die beiden verschiedenen
Höhen je Fenster gab es vorher genauso; sie kommen vom Inhalt.*

### Was in die Zeile passt

| Fenster | Kachel | Platz für den Ausschnitt | sichtbare Zeichen |
|---|---|---|---|
| 1280 × 900 | 293,50 px | 172,30 px | **30** |
| 620 × 900 | 188,66 px | 70,95 px | **10** |
| 390 × 844 | 173,00 px | 55,30 px | **9** |

*Schrift: 10,95 px / 15,88 px, mittlere Zeichenbreite 5,78 px. Die Quelle
„Beschreibung:" misst 88,70 px — sie ist die längste.*

> **DARAUS FOLGT DER VORLAUF VON VIER ZEICHEN.** *Mit den ursprünglich
> vorgesehenen zwölf stand auf der schmalsten Kachel „…eug von" — Umgebung ohne
> das Wort, um das es geht. Mit vier steht dort „…eurobell": die Marke beginnt
> auf allen drei Breiten im sichtbaren Bereich, und auf den beiden schmalen
> stehen bei den kurzen Quellen („Link:", „Kommentar:") auch ihre letzten
> Zeichen noch da.* **Null Vorlauf wäre der andere Fehler:** dann verschwiege
> der Ausschnitt, dass die Fundstelle mitten in einem Wort steht — und genau das
> ist der Befund, wegen dem es diese Zeile gibt.

> **UND DER GANZE SATZ „und 2 weitere Stellen" PASST NICHT.** *Gemessen misst er
> **116,63 px**; auf der Kachel von 1280 px Breite bleiben für den Ausschnitt
> 172,30 px, auf der schmalsten 55,30.* **In der Zeile steht deshalb `+2`, und
> der Satz steht ausgeschrieben im Überfahrtext.** *Siehe Abschnitt 8.*

---

## 7. Gemessen an der Datenbank

**Der Auftrag sagt: „Die Zahl ist umsonst zu haben: der ODER-Ausdruck wertet
ohnehin alle sieben aus." Das trägt nicht.** *SQLite bricht die Kette beim ersten
Treffer ab — die Aussage gilt genau für die Zeilen, die **nicht** treffen. Im
Quelltext daneben stand seit 0.11.0 die richtige Aussage samt Messung.*

**Nachgemessen an 1000 Einträgen mit 4001 Kommentaren und 2,77 MB Suchtext, je
200 Läufe, Median:**

| Begriff | Treffer | ohne Kontext | mit Kontext | Aufschlag |
|---|---|---|---|---|
| häufig (jeder zehnte Titel) | 100 | 17,07 ms | **19,96 ms** | **+17 %** |
| selten (nur ein Kommentar) | 1 | 17,01 ms | **17,84 ms** | **+5 %** |
| ohne Treffer | 0 | 17,35 ms | **17,82 ms** | **+3 %** |

**Der Aufschlag hängt an der Zahl der TREFFER und nicht an der Größe des
Bestands** — genau deshalb steht die Spaltenliste hinter dem Filter und nicht in
einer inneren Abfrage darunter.

> *Die Zahlen sind an einem eigens gebauten Bestand gemessen und nicht an der
> laufenden Instanz; sie sind untereinander vergleichbar, weil beide Abfragen
> denselben Bestand und dieselbe Bedingung sehen. **Sie sind nicht mit den
> 1,9 / 13,2 ms aus 0.11.0 zu vergleichen** — das war ein anderer Bestand.*

---

## 8. Abweichungen, mit Begründung

**a) Titel und Beschreibung der Detailansicht tragen keine Marke.**

Der Auftrag nennt für die Detailansicht „Titel, Beschreibung, Linkliste,
Kommentare". **Gebaut sind Linkliste und Kommentare.** *Titel und Beschreibung
sind **Eingabefelder** — ein `<input>` und ein `<textarea>` haben keine
Kindknoten; in sie lässt sich kein Element hängen. Auch die
Custom-Highlight-Schnittstelle erreicht Formularfelder nicht.*

**Was möglich gewesen wäre und warum es nicht gebaut ist:** ein zweiter, nur zum
Ansehen gebauter Titel neben dem Feld wäre **eine zweite Anzeige derselben
Sache**; eine Spiegelschicht hinter einem durchsichtigen Textfeld wäre eine
Bauform, die bei jeder Schriftgröße, jedem Umbruch und jedem Rollstand
nachgeführt werden müsste — *„wo eine einfache Bauform reicht, ist sie die
richtige" (Stolperstein 256), und hier reicht keine.*

**Was stattdessen da ist:** die Trefferzeile an der Kachel nennt Beschreibung und
Titel ausdrücklich als Quelle. **Und es steht als Zusage im Prüfstand**, damit
niemand die fehlende Marke für einen Fehler hält und still einen Weg dafür baut.

**b) In der Zeile steht `+2` und nicht „und 2 weitere Stellen".**

*Der Auftrag schreibt den Satz aus. Gemessen misst er 116,63 px — auf der
schmalsten Kachel bliebe für den Ausschnitt nichts übrig.* **Die Zahl steht
deshalb kurz in der Zeile und ausgeschrieben im Überfahrtext**
(„Gefunden in: Kommentar und 2 weitere Stellen"). *Die Aussage ist dieselbe, der
Platz nicht.*

**c) Der Ausschnitt trägt keine Anführungszeichen.**

*Das Beispiel im Auftrag setzt den Kommentar in „…" und den Link nicht.* **Auf
einer Zeile, die auf ein Zeichen genau geschnitten ist, kosten zwei Zeichen zu
viel** — und ein schließendes Anführungszeichen hinter einem Auslassungszeichen
sagt nichts, was die Quelle davor nicht schon sagt.

---

## 9. Die Entscheidungen dieser Runde

| Entscheidung | Warum |
|---|---|
| **Die sieben Quellen stehen als Liste und nicht zweimal im SQL** | Der Trefferkontext braucht dieselbe Bedingung ein zweites Mal. Abgeschrieben liefen die beiden ab dem nächsten Zusatz auseinander — und nebenbei ist damit nachzählbar, dass es sieben sind |
| **Der Filter bleibt die ODER-Kette** | SQLite bricht sie beim ersten Treffer ab. In einer inneren Abfrage wären alle sieben für jede Zeile des Bestands zu rechnen |
| **Eine Zeile je Kachel, nicht eine je Quelle** | Die Kachel ist dicht; sieben mögliche Zeilen machten aus der Übersicht eine Liste von Fundstellen |
| **Die Folge beginnt bei dem, was die Kachel nicht zeigt** | Steht der Begriff im Titel, sieht man ihn ohnehin; steht er in einem Kommentar, ist die Zeile die einzige Auskunft |
| **Trifft nur der Titel, steht die Zeile trotzdem da** | Eine Regel und keine Ausnahme — und die Auskunft ist: der Begriff steht NUR dort |
| **Je Quelle ein bestimmter Satz (`ORDER BY`)** | Ohne ihn entschiede die Abfrageplanung, welcher Kommentar auf der Kachel steht |
| **Vier Zeichen Vorlauf** | Gemessen an der schmalsten Kachel. Mehr schnitte die Fundstelle ab, null verschwiege, dass sie mitten in einem Wort steht |
| **Der Begriff wird nicht eingeebnet, der Text schon** | Gesucht hat `instr()` Zeichen für Zeichen |
| **Die Hervorhebung ist ein drittes Stück der Zerlegung** | Nachbearbeiten hieße, wieder in Strings zu denken — und genau dort entsteht der Fehler, den 0.5.4 zugemacht hat |
| **Gesucht wird mit `indexOf`, nicht mit einem Muster** | Ein eingegebener Punkt fände sonst jedes Zeichen |
| **Eine Adresse mit Begriff bleibt EIN Link** | Drei Anker wären drei Ziele für ein Vorleseprogramm |
| **In der Linkliste die Adresse, nicht der Anzeigename** | Gesucht wurde in `links.url` |
| **Der Begriff in die Adresse, über `replaceState`** | Ein Eintrag im Verlauf je Buchstabe machte die Zurück-Taste unbrauchbar |
| **Nachgezogen wird an EINER Stelle** | Sechs Absender setzen die Adresse selbst; wer an jedem anhängt, vergisst den nächsten |
| **Die Übersicht bekommt den Begriff nicht in die Adresse** | Dort steht er im Feld, und das Feld ist sichtbar |
| **`mark` ohne eigene Klasse** | Die Marke steht in der Kachel, in der Linkliste und im Kommentartext — drei Abschriften derselben Regel liefen auseinander |

---

## 10. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `server.js` | `VOLLTEXT_QUELLEN` als Liste der sieben Quellen; `qVolltext` aus ihr gebaut, mit Spaltenliste **und** Filter; `AUSSCHNITT_LAENGE`, `AUSSCHNITT_VORLAUF`, `einZeilig()` und `ausschnitt()`; `volltextTreffer()` liefert eine **Abbildung** statt einer Menge; `GET /api/items` hängt `fundstelle` an — **nur bei einer Suche** |
| `public/app.js` | `zerlegeAmBegriff()` als dritte Stückart; `zerlegeKommentartext()` nimmt den Begriff; `stueckKnoten()` und der Knotenbauer fassen zusammenhängende Stücke eines Links wieder zu **einem** Anker; `hebeHervor()` und `hebeImKnoten()`; `FUND_WORTE`, `fundWort()`, `fundUeberfahrt()`; `card()` baut die Zeile und hebt Titel, Kategorie und Tags hervor; `EINTRAG_MUSTER`, `eintragAdresse()`, `begriffAusAdresse()`; `route()` und `renderDetail()` nehmen den Begriff; `drawLinks()` hebt die Adresse hervor; `drawComments()` reicht den Begriff durch |
| `public/style.css` | `.card-fund` samt `.fund-quelle`, `.fund-text`, `.fund-mehr`; die Regel für `mark` |
| `pruefung.js` | fünf neue Gruppen, „Links im Kommentartext" erweitert; die Attrappe liefert `fundstelle` **nur** bei einer Suche; der Wächter auf die Zahl der Rückbauten |
| `gegenprobe.js` | 32 neue Rückbauten ab 398; die acht zur Volltextsuche greifen jetzt auf den Ausdruck statt auf seine Umgebung |
| `package.json`, `package-lock.json` | Version 0.18.0 |
| `Doku/Projektstand_Kriterion_0_17_5.md` → `_0_18_0.md` | **`git mv`.** Kopf (Revision 46), der Satz zur Runde, Betriebsstand, Abschnitt 4, **Abschnitt 5.6 mit den Entscheidungen zur Suche und der geschärften Regel zum Kommentartext**, **Stolpersteine 260–266**, Prüfstand (Zahlen, beide Tabellen, Fingerprintliste), Abschnitt 8, Versionsgeschichte, Abschnitt 10 und 10a auf **GEBAUT**. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `Doku/Fehler_und_Ideen.md` | Punkt 1 im Wegweiser auf **GEBAUT**; **Punkt 4 neu**: der Suchbereich als Häkchen, mit dem Grund, warum er liegen bleibt; die beiden Übersichtstabellen nachgezogen |
| `README.md` | der Trefferkontext und die Hervorhebung in der Bedienung, die Zeile in der Merkmalstabelle — **ohne eine einzige neue Versionsnummer** |
| `CHANGELOG.md` | der Eintrag zu 0.18.0, eine Zeile je Änderung, **ohne Kasten darüber** |
| `Doku/Auftrag_0.17.3.md` | war mit dem Auftrag zu dieser Runde bereits weggefallen |

---

## 11. Der Prüfstand

**4917 von 4917 bestanden — 104 neue Prüfungen netto, keine weggefallen.**

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Der Trefferkontext an der Antwort** *(neu)* | — | **35** | je Quelle die richtige Benennung und ein Ausschnitt, der den Begriff trägt; einzeilig, gekürzt, mit Vorlauf zwischen zwei und fünf Zeichen; die feste Folge **Schritt für Schritt abgeräumt**; „nur der Titel" trägt die Zeile trotzdem; der genannte Kommentar ist bestimmt; Prozentzeichen und Punkt als Text |
| **Die Trefferzeile an der Kachel** *(neu)* | — | **19** | ohne Suche keine Zeile, mit Suche genau eine; **unter dem Titel und über den Tags**; Quelle, Ausschnitt, Zahl, Überfahrtext; **aus Markup im Ausschnitt entsteht kein Element**; unbekannte Quelle heißt „Fundstelle"; das Leeren räumt alles weg |
| **Die Hervorhebung in der Übersicht** *(neu)* | — | **9** | alle Vorkommen in Titel, Kategorie, Tags und Trefferzeile, in der Schreibung, die dort steht; ohne Suche keine Marke; **ein Punkt im Begriff findet keinen beliebigen Buchstaben** |
| **Der Suchbegriff in der Adresse** *(neu)* | — | **20** | mit und ohne `?q=`, `#/item/1x` trifft nicht, leeres `?q=` heißt „keine Suche", unbekannter Parameter stört nicht, `%20` kommt entschlüsselt an; die Adresse wird nachgezogen; **die Adresse wird hervorgehoben, nicht der Anzeigename**; Titel und Beschreibung tragen als Eingabefelder keine Marke |
| **Die Trefferzeile im Stylesheet** *(neu)* | — | **8** | die Zeile bricht nicht um, nachgeben darf allein der Ausschnitt, die Marke setzt Grund **und** Schrift aus vorhandenen Farben und steht **genau einmal** |
| **Links im Kommentartext** | 46 | **59** | der Angriffstext **mit** Begriff mitten darin; eine Adresse mit Begriff bleibt **ein** Link; die Zerlegung verliert und erfindet auch mit Begriff kein Zeichen |
| **zusammen** | | | **+104** |

> **DIE ATTRAPPE MACHT DIE KLEMME MIT.** `fundstelle` geht bei einer Suche
> hinaus und fällt ohne Begriff weg — *ein Mock, der das Feld immer mitgäbe,
> nähme genau die Prüfung weg, für die er gebraucht wird (Stolperstein 102).*

> **DIE FOLGE WIRD SCHRITT FÜR SCHRITT ABGERÄUMT**, an einem Eintrag, der alle
> sieben Quellen trifft: Beschreibung weg → Kommentar; Kommentar weg → Link;
> und so fort bis zum Titel. *Ohne diese Kette belegte die Prüfung nur, dass
> „Beschreibung" ganz vorn steht, und nichts über die Reihenfolge dahinter.*

---

## 12. Gegenproben

**421 Rückbauten, gefahren wurden die 32 dieser Runde.**

GEGENPROBENTABELLE_PLATZ

---

## 13. Neue Stolpersteine

**Sieben, und sie zählen bei 260 weiter** — 259 war vergeben.

| Nr. | Kernsatz |
|---|---|
| **260** | **Eine ODER-Kette in SQL wertet nicht alle Glieder aus.** Umsonst ist eine zusätzliche Auskunft aus denselben Ausdrücken nur für die Zeilen, die **nicht** treffen |
| **261** | **Die Grundregel eines Rasters ist nicht sein schmalster Fall.** `minmax(240px, 1fr)` — und zwei Medienabfragen setzen darunter 200 und 150 px; gemessen sind es 173 |
| **262** | **Wer serverseitig um eine Fundstelle schneidet und danach per CSS kappen lässt, kappt zweimal — das zweite Mal von hinten.** Die Fundstelle gehört an den Anfang, mit so viel Vorlauf, wie an der schmalsten Stelle sichtbar bleibt |
| **263** | **In ein `<input>` und ein `<textarea>` lässt sich kein Element hängen.** Eine Hervorhebung ist dort nicht schwierig, sondern baulich unmöglich |
| **264** | **Ein Rückbau, der auf die UMGEBUNG eines Ausdrucks zielt, veraltet beim ersten Umbau.** Acht griffen nach dem Umhängen ins Leere |
| **265** | **`| **265** | **`$&` in einem Ersetzungstext ist kein Text.** `String.replace` liest die Verweise auch dann, wenn der Ersatz aus einer Datei kommt |` in einem Ersetzungstext ist kein Text.** `String.replace` liest die Verweise auch dann, wenn der Ersatz aus einer Datei kommt |
| **266** | **Die Hervorhebung trägt immer den Suchbegriff — und den tippt ein Mensch.** Der Angriffstext gehört auch in den BEGRIFF; gefunden hat das die Gegenprobe |

---

## 14. Die Zahlen

| | vorher (0.17.5) | nachher (0.18.0) |
|---|---|---|
| Prüfungen | 4813 | **4917** |
| Rückbauten in `gegenprobe.js` | 389 | **421** |
| Stolpersteine | 259 | **266** |
| Routen (`F_ROUTEN`) | 69 | **69** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 18 in 5 Abschnitten | **18 in 5 Abschnitten** |
| persönliche Schlüssel | 8 | **8** |
| markierte Migrationsblöcke | 7 | **7** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Versionsnummern in der README | 6 | **6** |
| Fingerprint | `6a2c264a` | **`FINGERPRINT_PLATZ`** |

---

## 15. Was ausdrücklich nicht gebaut ist

- **Der Suchbereich als Häkchen** (Fahrplan-Teil (b)). *Er ist eine **zweite
  Bedienfläche** neben einer Suche, die heute ein Feld ist: wer sie
  überfrachtet, macht den einfachen Fall teurer, um den seltenen billiger zu
  machen.* **Und er war erst zu beurteilen, wenn der Trefferkontext steht** —
  vielleicht beantwortet die Zeile „Link: …" die Frage schon. **Das ist eine
  Entscheidung mit Begründung und keine Verschiebung aus Zeitmangel**; er steht
  als eigener Punkt 4 im Sammelblatt.
- **Wortgrenzen statt Teilstring.** *In einem Katalog voller Typnummern
  („GSR 18V-60") ist Teilstring das richtige Verhalten: wer „18v" tippt, will es
  finden. Eine Wortgrenzensuche verschwiege still Treffer.*
- **Eine Sortierung nach Treffergüte.** *Sortiert wird weiter über `sort` in der
  Filterleiste — eine zweite, unsichtbare Ordnung wäre eine zweite Wahrheit.*
- **Ein zweiter Abruf für den Kontext.** *Was die Liste ohnehin holt, trägt ihn
  mit.*
- **Keine neue Abhängigkeit, nicht eine** — auch nicht für den Prüfstand. *Das
  Messwerkzeug für Chromium liegt außerhalb des Baums und steht in keiner
  `package.json`.*
- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.**
- **Keine neue Route.** *Ein neues Feld in einer Antwort ist keine neue Route,
  und ein Suchbegriff in der Adresse erst recht nicht.*
- **Kein Tag und kein Tag-Push.**

---

## 16. Offen geblieben

- **0.18.0 ist am Wirt noch nicht gesehen.** *Vier Handgriffe stehen aus; sie
  stehen im Projektstand, Abschnitt 8, und die Befehle dazu standen im Chat der
  Runde.*
- **Der Blick auf ein echtes Telefon.** *Die 173 px und die neun sichtbaren
  Zeichen sind in Chromium gemessen; was ein echtes Gerät daraus macht, ist
  damit nicht belegt (Stolperstein 256).*
- **Der Suchbereich als Häkchen** — jetzt mit der Frage, ob die Trefferzeile ihn
  überflüssig macht. *Sammelblatt, Punkt 4.*
- **Die Tags im EINTRAG tragen keine Marke, die an der Kachel schon.** *Der
  Auftrag zählt für die Detailansicht Titel, Beschreibung, Linkliste und
  Kommentare auf; die Tags stehen dort nicht.* **Und der Block im Eintrag zeigt
  nicht nur die Tags dieses Eintrags, sondern die ganze Wolke zum Anklicken** —
  eine Marke an einem Tag, den der Eintrag gar nicht trägt, wäre eine
  Falschaussage. *Wer das ändern will, muss vorher entscheiden, ob die
  Hervorhebung dort dem Eintrag oder dem Vorrat gilt; das ist keine Zeile,
  sondern eine Frage.*
- **Unverändert offen seit 0.16.0:** der Teilexport ein drittes Mal mit
  Mitschrift, **und ein Teil in eine Zweitinstanz eingespielt, nicht in die
  laufende**, sowie **beide Netze am echten Wirt**. *Beides kostet keine Zeile
  Code und ist nur am echten Bestand zu haben.*
- **Der volle Gegenprobenlauf steht seit siebzehn Runden aus.** *421 Rückbauten
  zu je einem vollen Prüflauf sind in vier Nebenspuren rund zehn Stunden.*
