# Konzept 0.24.0 — „Die Oberfläche lernt Sprachen"

**Geschrieben am 5. September 2026, am Tag, an dem die Runde von 0.28.0 auf
0.24.0 vorgezogen wurde.** *Der Betreiber hat die Aufgabe in drei Sätzen
gestellt: Sprachdateien — `de`, `en`, `tr`, „oder so, wie es draußen üblich
ist" —; angefangen wird mit Deutsch und Englisch; **das Deutsche gibt es
schon, es muss nur in eine eigene Datei wandern — das ist Stufe 1; Stufe 2
ist Englisch, Stufe 3 ist Türkisch.** Für alle drei Stufen ein Konzept, mit
diesen drei Abschnitten.*

**Stand, auf dem es aufsetzt:** 0.23.0, Fingerprint `92f7a142`, 5744
Prüfungen — der Stand von `main` am 5. September 2026 (`34da9ea`).
**Die Bestandsaufnahme in Abschnitt 2 ist auf `34da9ea` gezählt**, mit dem
Werkzeug des Prüfstands selbst (`bildschirmtexteVon()`, `servertexteVon()`)
und nicht mit einem Muster über Anführungszeichen.

**Der Fahrplan hat die Runde am 2. September 2026 in einem Satz eingetragen:**
*„Alles, was in der Oberfläche zu sehen ist, verlässt den Quelltext und wird
austauschbar."* Dieses Papier sagt, wie — und wo der Satz an seine Grenze
kommt.

---

## 0. Was für alle drei Stufen gilt

**Vier Sätze tragen das ganze Papier.** Jede Entscheidung weiter unten ist
eine Folge aus einem davon.

1. **Text ist Daten, nicht Programm.** Was ein Mensch am Bildschirm liest,
   steht in einer Datei je Sprache — und der Quelltext kennt nur noch den
   Schlüssel. *Eine neue Sprache ist danach eine neue Datei, keine neue
   Version des Programms.*
2. **Ganze Sätze, keine Satzteile.** Ein Schlüssel trägt einen ganzen Satz mit
   benannten Platzhaltern. Kein Satz wird im Code aus Stücken
   zusammengeklebt — *das geht auf Deutsch gerade noch, auf Englisch mit
   anderer Wortstellung schlecht und auf Türkisch, wo das Verb am Ende steht
   und die Fälle als Endungen am Wort hängen, gar nicht.*
3. **Die Sprache des Projekts bleibt Deutsch.** Kommentare, Bezeichner,
   Papiere, README, Changelog, Prüfstand, die Meldungen für den Betreiber auf
   der Konsole und die beiden Werkzeuge auf dem Wirt (Abschnitt 12 des
   Projektstands). **Wählbar wird allein, was der Benutzer sieht** — die
   Oberfläche, die Meldungen des Servers an die Oberfläche und die Mails.
4. **Die Regeln S1 bis S7 gelten je Sprache, nicht nur für Deutsch.** Eine
   Sache, ein Wort — auch auf Englisch; kurz, mit Maß — auch auf Türkisch.
   **Jede Sprache bekommt deshalb ihr eigenes Wörterbuch, beschlossen vor der
   ersten übersetzten Zeile** (so wie 0.22.0 das deutsche beschlossen hat).

---

## 1. Worum es geht

Kriterion redet seit 0.22.0 nach einem Wörterbuch, und es redet **nur
Deutsch**. `<html lang="de">` steht im Kopf der Seite, die drei Datumshelfer
tragen `'de-DE'` fest im Quelltext, und rund 1.800 lesbare Textbausteine
liegen als Literale in `public/app.js` — zwischen Markup, in Vorlagen, in
Tooltips und Platzhaltern. Der Server antwortet mit deutschen Sätzen im Feld
`error`, `auth.js` wirft deutsche Sätze als Fehler, und `mail.js` schreibt vier
deutsche Briefe.

**Es kommt die Wahl.** Ein Benutzer stellt seine Sprache ein, ein zweiter
seine — an derselben Installation, gleichzeitig. Die Installation hat eine
Vorgabe, die der Admin setzt. Wer nichts einstellt, sieht Deutsch, so wie
heute.

**Und es kommt eine Bauform, die nach Stufe 1 keine Sprache mehr bevorzugt.**
Das Deutsche ist danach eine Datei wie jede andere — nur die erste und die
vollständige, an der die anderen gemessen werden.

---

## 2. Der Befund — die Arbeitsmenge

*Der Fahrplan nannte die Runde „nur eingetragen, nicht ausgearbeitet". Die
Menge ist jetzt bekannt.*

### 2.1 Wo Text steht

| Ort | was dort steht | gezählt auf `34da9ea` |
|---|---|---|
| `public/app.js` (10.833 Zeilen) | jeder Text der Oberfläche | **1.824 verschiedene lesbare Bausteine** — 833 mehrwortige Sätze und Satzteile, 979 einzelne Wörter; der Prüfstand hält als Untergrenze „mehr als 800 Texte" fest |
| `public/app.js` | Zuweisungen, die Text erzeugen | 167 × `innerHTML =` (105 davon Vorlagen), 102 × `textContent =`, 58 × `title="…"` in Vorlagen, 49 × `.title =`, 17 × `placeholder`, 11 × `aria-label`; **172 × `toast()`**, 25 × `confirmBox()` |
| `public/index.html` | Text | **einer**: `<title>Kriterion</title>` — und den überschreibt `app.js` beim Start mit dem Titel der Installation |
| `server.js` | Meldungen an die Oberfläche | **125 verschiedene** Meldungen im Feld `error`, 25 davon mit einem Vokabelwort darin |
| `auth.js` | Meldungen an die Oberfläche | **rund 40** deutsche Sätze als `throw new Error('…')`, die `server.js` fängt und als `error` weiterreicht — **der Bildschirmtext-Wächter sieht keinen davon**, er liest nur `error:` |
| `mail.js` | die vier Briefe | rund **55** deutsche Zeilen (Einladung 12, Rücksetzung 12, Bestätigung 14, Testmail 8, eine gemeinsame Schlusszeile) — **die vier Betreffzeilen stehen nicht dort, sondern in `server.js`** |
| Vokabular | die 14 Vokabelwörter | Vorgaben **zweimal** — `VOKABULAR_VORGABE` in `server.js`, `VOK_VORGABE` in `app.js` —, gespeichert im globalen Schlüssel `vokabular`; 133 Verwendungen im Browser, 25 im Server |

**Was NICHT dazugehört, und die Zahl steht hier, damit sie niemand
mitzählt:** 164 `console.*`-Meldungen im Server (Betreiber), die beiden
Werkzeuge `zugang.js` und `schluessel.js` (Konsole, nie HTTP), `pruefung.js`
und `gegenprobe.js`, Kommentare, Papiere. **Sie bleiben Deutsch.**

### 2.2 Wo Sprache im Code steckt, ohne Text zu sein

| was | wo | Stellen |
|---|---|---|
| **Einzahl/Mehrzahl** von Hand | `n === 1 ? 'Kommentar' : 'Kommentare'` | **46** in `app.js`, **6** in `server.js`; dazu der Helfer `zaehl()` zweimal und fünf Vokabelzähler (`vSache` … `vBewertung`) |
| **Verbform** nach der Zahl | `${n === 1 ? 'ist' : 'sind'}` | in `server.js` und `app.js` — *das ist Satzbau im Code, und er fällt (Satz 2)* |
| **Datum und Uhrzeit** | `toLocaleString('de-DE', …)` | drei Helfer am Kopf von `app.js`: `fmtDate`, `fmtDay`, `weekday` |
| **Dezimalkomma** | `.replace('.', ',')` | 11 × in `app.js`, 1 × in `server.js` (`zahl()`) |
| **Sortierung** | `localeCompare(…, 'de')` | 3 × mit `'de'`, 3 × ohne |
| **Kleinschreibung** für Suche und Vergleich | `toLowerCase()` | 3 × in `app.js`, 9 × in `server.js` |
| **`Intl.`** | — | **0** — die Schnittstelle, die genau dafür da ist, wird heute nicht benutzt |
| **Sprache der Seite** | `<html lang="de">` | einmal in `index.html`, einmal im Prüfstand (`baueDom`) |

### 2.3 Was den Text bewacht

Der Prüfstand hat seit 0.22.0 drei Wächter über die Sprache, und **zwei davon
lesen Quelltext** — nach Stufe 1 steht dort kein Text mehr:

- `bildschirmtexteVon()` — ein eigener Tokenizer, der jeden lesbaren String
  aus `app.js` zieht; darauf die **Verbotsliste** `BILDSCHIRM_VERBOT` (rund 30
  Muster) und die Untergrenze „mehr als 800 Texte".
- `servertexteVon()` — liest nur, was hinter `error:` steht; Untergrenze
  „mehr als 100 Meldungen" über `server.js`, `auth.js`, `mail.js`.
- der Sprachwächter über die **Kommentare** — er ist nicht betroffen, weil
  Kommentare Deutsch bleiben.

Dazu: **805 Zeilen des Prüfstands tragen einen Umlaut, rund 312 davon in einer
Zusicherung** (`textContent`, `includes`, ein Muster). Und **28 der 649
Rückbauten** in `gegenprobe.js` suchen einen deutschen Satz im Quelltext.
*Das ist die eigentliche Arbeit hinter der Stufe 1, genau wie es bei 0.22.0
die Arbeit hinter den 250 Stellen war — Prüfungen ziehen mit, sie werden nicht
gelöscht (Stolperstein 201).*

### 2.4 Was schon richtig gebaut ist

**Drei Dinge nimmt diese Runde als Vorlage und erfindet sie nicht neu:**

- **Das Farbschema je Zugang (0.23.0).** Ein persönlicher Schlüssel in
  `user_settings`, eine Klemme in `PUT /api/settings`, eine Pillenreihe in der
  Karte „Darstellung", ein Gedächtnis in `localStorage` gegen das Blitzen —
  **kein Schema, keine Route, kein Bestandslauf.** Die Sprache wird genauso
  gespeichert.
- **Das Vokabular (seit der alten 4.2, erweitert in 0.21.0 und 0.22.0).**
  Vierzehn Wörter, die der Admin umbenennt, und die Regel S6 dazu: *ohne Artikel, ohne Beiwort, nie
  zusammengesetzt, nach einer Zahl im Nominativ und in Anführungszeichen.*
  **Diese Regel ist zufällig genau die, die Türkisch braucht** (Stufe 3).
- **Das Wörterbuch und die Regeln S1 bis S7 (0.22.0).** Ein Wort je Sache,
  beschlossen vor der ersten Zeile. **Jede Sprache bekommt ihr eigenes.**

---

## 3. Draußen üblich — und was davon hierher passt

**Der Betreiber hat `de.lang`, `eng.lang`, `tr.lang` genannt und „oder so, wie
es draußen üblich ist" dazugesagt.** Draußen ist zweierlei üblich — die
Kennung der Sprache und die Form der Datei —, und beides ist entschieden.

### 3.1 Die Kennung: ISO 639-1

**`de`, `en`, `tr`** — zwei Buchstaben nach ISO 639-1, so wie im
`lang`-Attribut, in `Accept-Language`, in `Intl` und in jeder Bibliothek
draußen. *Nicht `eng`* (das wäre ISO 639-2, die dreibuchstabige Liste der
Bibliothekare — kein Browser spricht sie). Eine Region kommt erst dazu, wenn
zwei Fassungen derselben Sprache gebraucht werden (`de-AT`, `en-US`); **heute
nicht**, und die Bauform lässt es zu, weil die Kennung nur ein Dateiname ist.

### 3.2 Die Form: JSON, eine Datei je Sprache

| Form | wer sie benutzt | was sie kostet | hier |
|---|---|---|---|
| **JSON, eine Datei je Sprache** | i18next, vue-i18n, die meisten Webanwendungen | nichts — Node und Browser lesen sie ohne Bibliothek; **verschachtelte Schlüssel und Objekte für Mehrzahlformen sind eingebaut** | **ja** |
| `.po`/`.mo` (gettext) | GNU, Python, PHP, Übersetzerwerkzeuge wie Poedit | ein Parser und ein Übersetzschritt; der Schlüssel ist der Originalsatz, und wer den ändert, verliert alle Übersetzungen | nein — *später ein Export dorthin, wenn ein Übersetzer das Werkzeug braucht* |
| `.properties` (Java), `strings.xml` (Android), `.strings` (Apple) | die jeweilige Plattform | eigene Parser, keine Mehrzahlformen ohne Zusatz | nein |
| Fluent `.ftl` (Mozilla) | Firefox | die beste Grammatik draußen — und ein eigener Parser samt Laufzeit | nein |
| `.lang` mit `schluessel=text` | Minecraft | kein Standard, nur ein Brauch; eigener Parser für Zeilenumbrüche und Sonderzeichen; keine Mehrzahlformen | nein — *der Name ist verständlich, die Form nicht tragfähig* |

**Also `public/sprachen/de.json`, `en.json`, `tr.json`.** JSON kennt keine
Kommentare — was ein Übersetzer über eine Stelle wissen muss (*„ein Wort,
Knopf"*, *„Tooltip, höchstens acht Wörter"*), steht als eigener Schlüssel
`_hinweis` daneben, nur in `de.json`, und wird von der Deckungsprobe (Abschnitt
9) ausdrücklich ausgenommen.

**Keine Bibliothek.** i18next brächte rund 40 KB in den Browser, müsste ohne
Bauschritt von Hand nach `public/` kopiert werden und wäre die sechste
Abhängigkeit für eine Funktion von vierzig Zeilen. *Was gebraucht wird —
Schlüssel nachschlagen, Platzhalter einsetzen, Mehrzahl wählen — steht in
Abschnitt 4 vollständig da.*

### 3.3 Wo die Dateien liegen — und warum unter `public/`

**Beide Seiten lesen dieselben Dateien.** Der Server lädt beim Start alle
`public/sprachen/*.json` in den Speicher (für Meldungen und Mails); der
Browser holt die eine, die er braucht, als statische Datei.

- **Keine neue Route** — `express.static` liefert sie aus, mit ETag und
  `304`, wie `app.js` selbst. `F_ROUTEN` bleibt bei 70.
- **Der Fingerprint deckt sie ab, ohne dass jemand daran denkt:**
  `bildeFingerprint()` läuft über alles unter `public/` — genau deshalb liegt
  `thema.js` dort, und aus demselben Grund liegen die Sprachdateien dort.
- **Die CSP steht nicht im Weg:** `default-src 'self'` erlaubt `fetch()` auf
  die eigene Adresse; ein Inline-Script wäre verboten, eine Datei nicht.
- **Sie sind öffentlich, und das ist richtig so:** heute steht jeder dieser
  Texte in `app.js`, die ebenso öffentlich ist. Ein Text der Oberfläche ist
  kein Geheimnis.

---

## 4. Die Bauform — Schlüssel, Sätze, Mehrzahl

### 4.1 Die Schlüssel

**Deutsch, nach der Sache, mit Namensraum** — `karte.darstellung.titel`,
`dialog.fotoLoeschen.frage`, `server.eintragNichtGefunden`,
`mail.einladung.betreff`. *Nicht der deutsche Satz als Schlüssel* (gettext
tut das, und dann hängt jede Übersetzung an jedem deutschen Tippfehler);
*nicht `t1`, `t2`* (dann sagt der Code nicht mehr, was er zeigt).

**Die Namensräume sind die Orte der Anwendung:** `kopf`, `liste`, `eintrag`,
`karte.<name>`, `dialog.<name>`, `toast`, `anmeldung`, `server`, `mail`,
`vokabular`, `format`. **Eine Sache, ein Schlüssel** — der Text „Speichern"
steht einmal unter `knopf.speichern` und wird von jeder Karte gelesen, nicht
je Karte neu. *Das ist S3 in Dateiform.*

### 4.2 Die Sätze

**Benannte Platzhalter in geschweiften Klammern:** `{n}`, `{name}`,
`{sache}`. *Benannt, nicht nummeriert*, weil die Reihenfolge je Sprache eine
andere ist — auf Türkisch steht das Verb am Ende, und was auf Deutsch vorn
steht, steht dort in der Mitte.

**Vokabelwörter sind Platzhalter mit festem Namen:** `{sache}`,
`{sacheMehrzahl}`, `{merkmalJa}` … — dieselben vierzehn Namen wie heute in `V`.
Der Helfer setzt sie aus dem Vokabular der **gerade gewählten Sprache** ein
(Abschnitt 7).

**Kein HTML in einem Text.** Wo ein Satz einen Link oder ein fettes Wort
braucht, sind es zwei Schlüssel — der Satz davor und der Satz danach — oder
der Knopf steht neben dem Satz statt darin. *Sonst müsste jeder Übersetzer
Markup können, und jeder Text müsste beim Einsetzen zweimal geprüft
werden.*

### 4.3 Einzahl und Mehrzahl

**Ein Schlüssel, der von einer Zahl abhängt, trägt ein Objekt statt eines
Strings:**

```json
"eintrag.kommentare": { "eins": "{n} Kommentar", "andere": "{n} Kommentare" }
```

Der Helfer wählt die Form über `Intl.PluralRules(sprache).select(n)` —
*`one` → `eins`, alles andere → `andere`.* Deutsch, Englisch und Türkisch
kennen genau diese zwei Klassen. **Kommt einmal Polnisch oder Arabisch, kommen
`wenige` und `viele` dazu, und zwar in der Datei — nicht im Code.**

**Und der ganze Satz wechselt, nicht das Nomen:**

```json
"server.getestetBleibt": {
  "eins":   "Solange {n} {zeitpunkt} eingetragen ist, lässt sich „{merkmalJa}“ nicht zurücknehmen. Bitte zuerst die Liste leeren.",
  "andere": "Solange {n} {zeitpunktMehrzahl} eingetragen sind, lässt sich „{merkmalJa}“ nicht zurücknehmen. Bitte zuerst die Liste leeren."
}
```

*Heute steht dieser Satz in `server.js` mit `${n === 1 ? 'ist' : 'sind'}`
mittendrin. Die 52 Stellen dieser Art (Abschnitt 2.2) werden zu 52 Objekten
mit zwei ganzen Sätzen — und die Verbform wandert aus dem Code in die
Datei, wo der Übersetzer sie sieht.*

### 4.4 Der Helfer im Browser

```js
let SPRACHE = 'de', TEXTE = {}, TEXTE_DE = {};
const PLURAL = { select: (n) => new Intl.PluralRules(LOCALE).select(n) };

function t(schluessel, werte = {}) {
  let s = TEXTE[schluessel] ?? TEXTE_DE[schluessel];        // Deutsch ist die Rückfalldatei
  if (s === undefined) return `⟦${schluessel}⟧`;             // sichtbar, nie still
  if (typeof s === 'object') s = s[PLURAL.select(werte.n) === 'one' ? 'eins' : 'andere'];
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    werte[k] !== undefined ? String(werte[k]) : (V[k] !== undefined ? V[k] : `{${k}}`));
}
const tH = (schluessel, werte = {}) =>                        // für innerHTML: Werte maskiert
  t(schluessel, Object.fromEntries(Object.entries(werte).map(([k, v]) => [k, esc(String(v))])));
```

**Zwei Funktionen, und die zweite ist die Regel aus Stolperstein 18 in
Dateiform:** *jedes Vokabelwort in `innerHTML` braucht `esc()`* — `tH()`
maskiert jeden eingesetzten Wert, auch die Vokabelwörter, und `t()` tut es
nicht, weil `textContent`, `title` und `placeholder` es nicht brauchen. **Der
Text selbst wird nie maskiert** — er kommt aus der Datei, nicht vom
Benutzer, und er enthält kein HTML (4.2).

**Ein fehlender Schlüssel ist sichtbar und nie still:** in der gewählten
Sprache fällt er auf Deutsch zurück, und fehlt er dort, steht `⟦schluessel⟧`
auf dem Bildschirm. *Der Prüfstand sorgt dafür, dass beides nie herausgeht
(Abschnitt 9).*

### 4.5 Der Helfer im Server

**Derselbe Helfer, mit der Sprache als erstem Argument:** `t(sprache,
schluessel, werte)`. Die Dateien werden beim Start gelesen; fehlt `de.json`,
startet der Server nicht — *eine Installation ohne Sprache ist keine.*

**Die Sprache einer Antwort** bestimmt `spracheVon(req)`, in dieser
Reihenfolge:

1. der persönliche Schlüssel `sprache` des angemeldeten Benutzers, wenn
   gesetzt;
2. der Header `Accept-Language`, **den `api()` im Browser ausdrücklich auf die
   gerade gewählte Sprache setzt** — nicht der, den der Browser von sich aus
   schickt (das wäre die Sprache des Geräts, und um die geht es nicht);
3. die Vorgabe der Installation (globaler Schlüssel `sprache`);
4. `de`.

**Was `auth.js` wirft, wird ein Schlüssel.** Heute: `throw new Error('Der
Code stimmt nicht.')` — rund vierzig Mal, und der Wächter sieht keinen
davon. Künftig: `throw new Meldung('anmeldung.codeFalsch', { … })`, eine
kleine Fehlerklasse mit Schlüssel und Werten, die **der Fehler-Handler in
`server.js` übersetzt**, in der Sprache der Anfrage. *Damit fällt der blinde
Fleck des Wächters von selbst: was `auth.js` wirft, ist danach kein Text,
sondern ein Schlüssel, und den Text liest der Wächter in `de.json`.*

**Der Fehler-Handler übersetzt auch seine zwei eigenen Sätze** — *„Auf dem
Server ist ein Fehler aufgetreten."* und *„Unbekannter Fehler"* —, und `api()`
im Browser seinen einen: *„Der Server meldet einen Fehler ({status})."*

### 4.6 Die Mails

**Die vier Briefe bekommen einen Parameter `sprache`, und die Betreffzeilen
ziehen von `server.js` in die Sprachdatei** — dorthin, wo der Brief steht
(`mail.js:284` sagt es selbst: *der Text gehört zur Sache*). Jede Zeile eines
Briefs ist ein Schlüssel `mail.einladung.z1` … oder, besser lesbar, **ein
Schlüssel je Brief mit einem Feld je Zeile**; der Übersetzer sieht den Brief
am Stück.

**Die Sprache des Empfängers**, nicht des Absenders:

| Brief | Empfänger | Sprache |
|---|---|---|
| Einladung | ein Benutzer, der noch nie angemeldet war | **die Vorgabe der Installation** — er hat noch keine eigene |
| Rücksetzung | ein bestehender Benutzer | seine, wenn gesetzt; sonst die Vorgabe |
| Bestätigung | jemand, der sich registriert | die Sprache, in der er das Formular gesehen hat — **`api()` schickt sie mit** |
| Testmail | der Eigentümer an sich selbst | seine |

*Der Aufrufer in `server.js` hat die Benutzerzeile ohnehin in der Hand
(`ziel`, `eigener`); er reicht die Sprache weiter, und `mail.js` fragt die
Datenbank auch weiterhin nicht.*

---

## 5. Die Maschine — wo eingestellt wird, was zuerst zu sehen ist

### 5.1 Je Benutzer: die Karte „Darstellung"

```
Sprache      [ Deutsch ]  [ English ]  [ Türkçe ]
```

**Als Pillenreihe über dem Farbschema**, dieselbe Bauform wie `thema`. **Die
Namen stehen in ihrer eigenen Sprache**, nicht übersetzt — wer die Oberfläche
gerade nicht lesen kann, findet seine Sprache trotzdem. *Die Reihe zeigt genau
die Sprachen, für die eine Datei liegt; `SPRACHE_STUFEN` ist die Liste der
geladenen Dateien und keine feste Liste im Code.*

- `PERSOENLICHE_SCHLUESSEL` wächst von **10 auf 11**: `sprache` kommt dazu.
- `PUT /api/settings` bekommt **eine** Klemme gegen `SPRACHE_STUFEN` —
  dieselbe Bauform wie `THEMA_STUFEN`.
- **Kein Schalter in der Kopfzeile** — sonst gäbe es zwei Orte für dieselbe
  Frage (E2 des Farbkonzepts, und sie gilt hier genauso).
- **Der Wechsel lädt die Datei nach und zeichnet die Seite neu — ohne
  Neuladen.** `app.js` zeichnet ohnehin ganze Ansichten (`app.innerHTML`,
  25 Stellen); ein Wechsel ruft dieselbe Zeichenroutine noch einmal.

### 5.2 Je Installation: die Vorgabe

**Ein globaler Schlüssel `sprache`, gesetzt vom Admin — in der Karte
„Vokabular".** *Dort, weil es um Wörter geht, und weil die Karte in Abschnitt 7
ohnehin eine Sprachzeile bekommt.* Vorgabe der Vorgabe: `de`. **Wer nichts
einstellt, sieht Deutsch — der Satz gilt auf beiden Ebenen.**

`GET /api/config` bekommt ein **sechstes** Feld: `sprache`, die Vorgabe der
Installation. *Die Liste ist abgeschlossen und im Prüfstand festgenagelt —
sie wird mit Absicht um eins länger, weil die Anmeldeseite die Vorgabe kennen
muss, bevor jemand angemeldet ist.* Was hier auftaucht, sieht jeder, der die
Adresse kennt: **eine Sprachkennung verrät nichts.**

### 5.3 Vor der Anmeldung — und vor dem ersten Anstrich

**Es gibt drei Quellen, und die Reihenfolge ist entschieden:**

1. **der persönliche Schlüssel** des Benutzers — sobald `GET /api/settings`
   da ist;
2. **das Gedächtnis** `localStorage['kriterion.sprache']` — dieselbe Regel wie
   `kriterion.thema`: *keine zweite Wahrheit, sondern das Gedächtnis der
   letzten*; der Server überschreibt es bei jedem Laden;
3. **die Vorgabe der Installation** aus `/api/config`.

**Die Anmeldeseite sieht 2, sonst 3** — und sie bekommt **eine Zeile mit den
Sprachnamen unter der Maske**, denn sie ist der eine Ort, an dem der
persönliche Schlüssel noch nicht greifen kann. Ein Klick dort schreibt nur das
Gedächtnis. **Damit die Wahl nach der Anmeldung nicht verloren geht, gilt:
ein Benutzer OHNE gesetzten Schlüssel behält, was das Gedächtnis sagt** — und
der erste Klick in „Darstellung" macht daraus den Schlüssel. *Ein Benutzer
MIT Schlüssel bekommt seinen; das Gedächtnis richtet sich danach.*

**Kein Achtzeiler im `<head>`.** Das Farbschema brauchte ihn, weil das
Stilblatt vor `app.js` greift und die falsche Farbe blitzt. **Text zeichnet
allein `app.js`** — es entscheidet die Sprache in `boot()`, holt die Datei
parallel zu `/api/config` und zeichnet erst dann. *Nichts blitzt, weil vorher
nichts dasteht.*

**Der Randfall ist derselbe wie beim Farbschema und wird genauso
hingenommen:** zwei Benutzer an einem Browser — B sieht für einen Augenblick
die Sprache von A, dann berichtigt der Server.

### 5.4 Was noch an der Sprache hängt

- **`<html lang>` folgt der Sprache** — `app.js` setzt es beim Wechsel.
  Daran hängen Silbentrennung, Vorleser und die `:lang()`-Regeln des
  Stilblatts.
- **`document.title` bleibt der Titel der Installation** — der ist Daten und
  wird nicht übersetzt.
- **`theme-color`, `color-scheme`: unberührt.**

---

## 6. Datum, Zahl, Sortierung — die Stellen ohne Text

**Jede Sprachdatei trägt einen Kopf mit ihrer Locale:**

```json
"_locale": "de-DE"
```

und **jeder der acht Helfer liest sie statt eines festen Strings:**

| heute | künftig |
|---|---|
| `toLocaleString('de-DE', …)` in `fmtDate`, `fmtDay`, `weekday` | `toLocaleString(LOCALE, …)` — die drei Muster (Tag zweistellig, Monat zweistellig, Jahr) bleiben, **die Sprache der Wochentage kommt aus der Locale** |
| `.replace('.', ',')` an 12 Stellen | **ein** Helfer `zahl(n, stellen)` über `Intl.NumberFormat(LOCALE)` — Komma auf Deutsch und Türkisch, Punkt auf Englisch, und die Regel steht einmal da |
| `localeCompare(b, 'de')` | `localeCompare(b, LOCALE)` — *und die drei Stellen ohne Locale bekommen eine* |
| `toLowerCase()` für Suche und Vergleich | `toLocaleLowerCase(LOCALE)` — **die Stelle, an der Türkisch sonst bricht** (Stufe 3, T3) |
| `today()` über `'sv-SE'` | **bleibt** — das ist kein Datum für Menschen, sondern ein Trick für `JJJJ-MM-TT`, und er hängt an keiner Sprache |
| `gewichtAusText` nimmt `1,2` und `1.2` | **bleibt** — Eingabe darf beides |

**Die Zeitzone bleibt die des Browsers**, wie heute. *Der Server speichert
UTC, der Browser rechnet um — daran ändert die Sprache nichts, und `TZ` im
Container bleibt, was es ist: nicht gesetzt.*

**Was die Locale je Sprache ist, steht in Stufe 2 (E13) und Stufe 3 — und in
der Datei, nicht im Code.** *Wer eine vierte Sprache anlegt, entscheidet dort,
ob sie Tag-zuerst schreibt und mit Komma rechnet.*

---

## 7. Die Vokabelwörter je Sprache

**Heute:** vierzehn Wörter, Vorgaben zweimal im Code (Stolperstein 47 nennt
genau das *„doppelt gehaltene Vorgaben prüfen sich nur halb"*), Überschreibung
im globalen Schlüssel `vokabular` — **eine Sprache.**

**Künftig — die Vorgaben ziehen in die Sprachdatei:**

```json
"vokabular": {
  "sacheEinzahl": "Eintrag", "sacheMehrzahl": "Einträge",
  "merkmalJa": "Getestet",   "merkmalNein": "Ungetestet",
  …
}
```

*Eine Wahrheit je Sprache statt zwei je Code — die Vorgabe steht dort, wo
auch der Übersetzer sie sieht, und `VOK_VORGABE` in `app.js` samt
`VOKABULAR_VORGABE` in `server.js` fallen weg.* Die Karte „Vokabular" nennt
die Vorgabe weiterhin („Vorgabe: Eintrag") — sie liest sie aus derselben
Datei.

**Die Überschreibungen des Admins gelten je Sprache.** Wer auf Deutsch
„Modell" statt „Eintrag" sagt, sagt auf Englisch nicht „Modell". Der
Schlüssel `vokabular` wird deshalb ein Objekt je Sprache:

```json
{ "de": { "sacheEinzahl": "Modell", "sacheMehrzahl": "Modelle" }, "en": { "sacheEinzahl": "Model" } }
```

**Ein bestehender flacher Wert wird beim Lesen als `de` genommen** — eine
Zeile in `vokabular()`, kein Migrationsblock, keine Formatnummer: *der Export
trägt keine Einstellungen* (die Exportdatei führt Kriterien und Einträge,
sonst nichts), also ändert sich am Austauschformat 13 nichts.

**Die Karte „Vokabular" bekommt oben eine Sprachzeile:** *„Wörter für:
Deutsch · English · Türkçe"* — und zeigt darunter die vierzehn Felder der
gewählten Sprache. Daneben, in derselben Karte, die Vorgabe der Installation
(5.2). **Zwei Fragen, eine Karte, weil beide von Wörtern handeln** — und kein
zweiter Ort für eine davon.

**S6 gilt je Sprache, und sie wird in Stufe 3 zur tragenden Regel:** ein
Vokabelwort steht ohne Artikel und Beiwort, nach einer Zahl im Nominativ, in
Anführungszeichen — **damit keine Sprache eine Endung daran hängen muss.**

---

## Stufe 1 — Das Deutsche wandert in eine eigene Datei

**Ziel in einem Satz:** *Die Anwendung sieht am Ende genauso aus wie am
Anfang, und kein Text steht mehr im Quelltext.*

**Das ist die größte Runde des Projekts nach Zeilen und die unsichtbarste
nach Wirkung.** Rund 1.800 Bausteine in `app.js`, 125 Meldungen in
`server.js`, 40 in `auth.js`, 55 Zeilen in `mail.js`, 52 Mehrzahlstellen,
acht Format-Helfer — und **nach dem Bauen kann die Installation nichts, was
sie vorher nicht konnte.** *Nach Abschnitt 5.1 des Projektstands wäre das
allein PATCH. Sie ist deshalb ein Bauabschnitt der Runde 0.24.0 und keine
eigene Version (E12).*

### S1.1 Die Bauabschnitte

1. **Der Helfer und die Ladung.** `t()`/`tH()` im Browser, `t(sprache, …)` im
   Server, `Meldung` als Fehlerklasse, `spracheVon(req)`, die Ladung in
   `boot()`, der Rückfall auf Deutsch. **Noch kein Text zieht um** — der
   Helfer wird an drei Stellen angeschlossen und mit drei Prüfungen belegt.
2. **Die Schlüssel für `server.js`, `auth.js` und `mail.js`** — 220 Sätze,
   die kleinere Hälfte, und die mit den meisten Mehrzahlformen. *Zuerst der
   Server, weil seine Meldungen der Prüfstand über `error` schon heute liest
   und der Umbau dort am besten belegt ist.*
3. **Die Schlüssel für `app.js`** — die große Hälfte, in der Reihenfolge der
   Ansichten: Anmeldung · Liste · Eintrag · Dialoge · Einstellungen (Karte für
   Karte) · Toasts. **Jede Ansicht wird nach dem Umzug einmal am Bildschirm
   mit dem Stand davor verglichen** — dasselbe Wort an derselben Stelle, oder
   es ist ein Fund.
4. **Die Format-Helfer** (Abschnitt 6) und `<html lang>`.
5. **Der Prüfstand** (Abschnitt 9): die drei Wächter lesen `de.json`, die
   neuen Wächter kommen dazu, die 312 Zusicherungen und die 28 Rückbauten
   ziehen mit.

**In dieser Reihenfolge und nicht andersherum:** wer mit `app.js` anfängt,
hat am längsten einen Stand, der beides ist — halb Datei, halb Literal.
*0.22.0 hat denselben Schluss gezogen (E4 dort: ein Wörterbuch, ein
Durchgang).*

### S1.2 Was ein Text ist — und was nicht

**Der Tokenizer des Prüfstands entscheidet, nicht das Auge.** Was
`bildschirmtexteVon()` als lesbaren String findet, ist ein Text und zieht um
— mit drei Ausnahmen, die er heute schon kennt und die bleiben:

- Adressen und Selektoren (`/api/items`, `#/system`, `.thumb`);
- Bezeichner, die als String vorkommen (`'thema'`, `'hell'`, Schlüssel der
  Einstellungen, Namen von CSS-Klassen);
- **Zeichen, die keine Sprache sind:** `⌀`, `·`, `→`, `—`, `%`, Zahlen.

**Was NICHT umzieht — und die Liste ist abgeschlossen:** der Titel der
Installation (Daten), die Namen von Kriterien, Kategorien, Tags, Benutzern
(Daten), die Vokabelwörter als Überschreibung des Admins (Daten je Sprache,
Abschnitt 7), alles, was der Betreiber auf der Konsole liest, und alles in
`pruefung.js`, `gegenprobe.js`, `zugang.js`, `schluessel.js`.

### S1.3 Die Untergrenzen drehen sich um

Heute sagt der Prüfstand: *„`public/app.js` trägt mehr als achthundert
lesbare Texte."* Nach Stufe 1 sagt er das Gegenteil — und beides ist eine
Zahl:

| Prüfung | heute | nach Stufe 1 |
|---|---|---|
| lesbare Texte in `app.js` (Tokenizer, ohne Adressen) | > 800 | **< 60** *(die Schwelle ist ein Vorschlag und wird beim Bauen festgenagelt)* — was bleibt, sind Zeichen, Bezeichner und die eine Fehlermeldung von `api()`, *und die Liste der Reste steht namentlich im Prüfstand* |
| Meldungen hinter `error:` in den Serverdateien | > 100 | **0 Literale** — nur noch `t(…)`-Aufrufe |
| Schlüssel in `de.json` | — | **in der Größenordnung von tausend** — die Zahl wird beim Bauen festgenagelt —, und jeder wird im Code mindestens einmal gerufen |
| `throw new Error('…')` mit deutschem Satz in `auth.js` | ~40 | **0** — nur noch `Meldung` |

**Der Bildschirmtext-Wächter liest danach `de.json` statt `app.js`** — die
Verbotsliste `BILDSCHIRM_VERBOT` bleibt, wie sie ist, und greift auf jeden
Wert der Datei (ohne `_hinweis`, ohne `_locale`). *Er wird dabei schärfer,
nicht stumpfer: er sieht jetzt auch, was `auth.js` bisher an ihm vorbei warf.*

### S1.4 Woran die Abnahme von Stufe 1 hängt

1. **Der Augenschein an jeder Ansicht** — vorher und nachher übereinander,
   am Schreibtisch und am Telefon. *Kein Wort anders, kein Umbruch anders.*
2. **Alle 5744 Prüfungen grün, die neuen dazu**, und jede neue mit ihrer
   Gegenprobe in `gegenprobe.js`.
3. **Der Tokenizer findet in `app.js` weniger als 60 lesbare Texte**, und die
   Liste der Reste steht im Prüfstand.
4. **`de.json` deckt sich mit dem Code:** jeder gerufene Schlüssel existiert,
   jeder existierende wird gerufen.
5. **Kein `⟦…⟧` auf dem Bildschirm** — der Prüfstand fährt jede Ansicht im
   jsdom und sucht das Zeichen.

**Der Fingerprint verschiebt sich, sonst nichts.** *Wer 0.24.0 nach Stufe 1
einspielte, sähe keinen Unterschied — und genau das ist der Beleg.*

---

## Stufe 2 — Englisch

**Ziel in einem Satz:** *Zwei Benutzer an derselben Installation, einer sieht
Deutsch, der andere Englisch — Oberfläche, Meldungen und Mails.*

**Mit dieser Stufe wird die Runde MINOR:** die Installation kann danach etwas,
was sie vorher nicht konnte. *Stufe 1 und Stufe 2 gehen zusammen als 0.24.0
heraus (E12).*

### S2.1 Zuerst das Wörterbuch — vor der ersten übersetzten Zeile

**Die Regel aus 0.22.0 gilt je Sprache:** eine Sache, ein Wort, beschlossen
im Gespräch. Hier der Vorschlag für die Wörter, an denen alles andere hängt —
**die vierzehn Vokabelwörter** und die Sachen aus S3:

| Sache (Schlüssel) | Deutsch | **Englisch — Vorschlag** | Bemerkung |
|---|---|---|---|
| `sacheEinzahl` / `sacheMehrzahl` | Eintrag / Einträge | **Entry / Entries** | *nicht „Item"* — das ist das Wort der Warenkörbe |
| `merkmalJa` / `merkmalNein` | Getestet / Ungetestet | **Tested / Untested** | |
| `zeitpunktEinzahl` / `-Mehrzahl` | Testtag / Testtage | **Test day / Test days** | zwei Wörter — S6 verbietet das Zusammensetzen ohnehin |
| `berichtEinzahl` / `-Mehrzahl` | Bericht / Berichte | **Report / Reports** | |
| `aufgabeEinzahl` / `-Mehrzahl` | Aufgabe / Aufgaben | **Task / Tasks** | |
| `aufgabeErledigt` | Erledigt | **Done** | ein Wort, ein Abzeichen |
| `potenzial` | Potenzial | **Potential** | |
| `bewertungEinzahl` / `-Mehrzahl` | Bewertung / Bewertungen | **Rating / Ratings** | *nicht „Review"* — das wäre der Bericht |
| Einstellungen | | **Settings** | |
| Mein Konto · Benutzer · Sitzung | | **My account · User · Session** | |
| Registrierung · Anfrage · beantragen | | **Registration · Request · request** | |
| Einladungslink · Link zum Zurücksetzen | | **Invitation link · Reset link** | |
| Sperren / Entsperren · Freischalten / Ablehnen | | **Lock / Unlock · Approve / Reject** | |
| Löschen · Entfernen · Wiederherstellen · Papierkorb | | **Delete · Remove · Restore · Trash** | *Delete: danach weg; Remove: aus einer Liste — dieselbe Trennung wie S7* |
| Speichern / Gespeichert · Abbrechen | | **Save / Saved · Cancel** | |
| Durchschnitt (⌀) · Note · Kriterium / Kriterien | | **Average · Score · Criterion / Criteria** | |
| Foto · Video · Vorschaubild · Bildausschnitt · Zoom | | **Photo · Video · Thumbnail · Crop · Zoom** | |
| Sicherung · Sicherungsordner · Export / Import · Exportdatei | | **Backup · Backup folder · Export / Import · Export file** | |
| Suchmaschine · Standard · Such-URL | | **Search engine · Default · Search URL** | |
| Darstellung · Farbschema · Schriftgröße · Sprache | | **Appearance · Colour scheme · Font size · Language** | *Colour* nach E13 — oder *Color* |
| Anmelden / Abmelden · Passwort · Code (zweiter Faktor) | | **Log in / Log out · Password · Code** | |
| Eigentümer · Admin · Benutzer | | **Owner · Admin · User** | |
| Kommentar · Kategorie · Tag · Neuigkeiten | | **Comment · Category · Tag · What's new** | |
| (erforderlich) / (optional) · Alle · Vorschau · Auf Vorgaben zurücksetzen | | **(required) / (optional) · All · Preview · Reset to defaults** | |

**Drei englische Regeln dazu, die es auf Deutsch nicht braucht:**

- **E-S1 · Sentence case.** Knöpfe, Titel, Pillen schreiben nur das erste
  Wort groß („Reset to defaults", nicht „Reset To Defaults"). *Das ist der
  Brauch der Oberflächen, die heute gebaut werden, und er passt zum Deutschen,
  wo ohnehin nur Nomen groß stehen.*
- **E-S2 · Du bleibst du.** Kriterion duzt („Dein Zugang"); auf Englisch gibt
  es nur ein *you* — und kein *please* vor jedem Satz. *Fehlermeldung: was
  nicht ging, dann der nächste Schritt (S4), ohne Höflichkeitsfloskel.*
- **E-S3 · Keine Abkürzungen, die das Deutsche nicht hat.** „e.g." nur, wo
  „z. B." stünde; „ID" bleibt „ID".

### S2.2 Die Datei

**`en.json` hat exakt die Schlüssel von `de.json`** — nicht einen mehr, nicht
einen weniger (Deckungsprobe, Abschnitt 9). *Ein Schlüssel, den es nur auf
Englisch gibt, ist ein Text, den ein deutscher Benutzer nie sieht — und
umgekehrt ein Loch, das der Rückfall auf Deutsch stopft, ohne dass es
jemand merkt.*

**Der erste Entwurf kommt von Claude, die Durchsicht vom Betreiber** — Satz
für Satz gegen das Wörterbuch. **Jede Stelle, an der die Übersetzung vom
deutschen Satzbau abweicht, ist ein Beleg dafür, dass Satz 2 aus Abschnitt 0
trägt** — und jede, an der sie nicht abweichen kann, weil der Code doch noch
klebt, ist ein Fund für Stufe 1.

**Länge:** Englisch ist im Schnitt kürzer als Deutsch. Die Maße aus S4
(Tooltip acht Wörter, Toast fünf) gelten je Sprache und werden **je Datei**
gezählt — der Wächter aus Abschnitt 9 liest die Zahl aus dem `_hinweis`.

### S2.3 Die Maschine

Alles aus Abschnitt 5, mit dieser Stufe zum ersten Mal sichtbar:

- die Pillenreihe „Sprache" in der Karte „Darstellung", mit **zwei** Pillen;
- die Vorgabe der Installation in der Karte „Vokabular";
- die Zeile unter der Anmeldemaske;
- `Accept-Language` aus `api()`, `spracheVon(req)` im Server;
- die Mails in der Sprache des Empfängers (4.6);
- die Locale in der Datei (E13).

### S2.4 Woran die Abnahme von Stufe 2 hängt

1. **Zwei Zugänge, zwei Sprachen, gleichzeitig** — in zwei Browsern; der
   Wechsel in „Darstellung" wirkt ohne Neuladen, und der jeweils andere sieht
   nichts davon.
2. **Die Anmeldeseite in beiden Sprachen**, mit und ohne Gedächtnis; die
   Registrierung mit Bestätigungsmail in der Sprache des Formulars.
3. **Eine Servermeldung mit Vokabelwort und Mehrzahl auf Englisch** — die
   Zeile aus 4.3, mit `n = 1` und `n = 3`.
4. **Die Deckungsprobe grün**, und ihre Gegenprobe (ein Schlüssel aus `en.json`
   entfernt) rot.
5. **Der Augenschein an den zwanzig dichtesten Stellen** — Pillenreihen,
   Kartenköpfe, die Filterleiste, die Sortierzeile, der Bewertungskasten — in
   beiden Sprachen, am Telefon.

---

## Stufe 3 — Türkisch

**Ziel in einem Satz:** *Eine dritte Datei — und der Beleg, dass die Bauform
eine Sprache trägt, die anders gebaut ist als die beiden ersten.*

**Türkisch ist keine dritte Übersetzung, sondern die Probe aufs Exempel.**
Deutsch und Englisch sind sich nah genug, dass ein zusammengeklebter Satz
zufällig noch richtig sein kann. Türkisch ist agglutinierend: Fälle,
Besitz und Verbformen sind Endungen, die sich nach den Vokalen des Wortes
richten, an dem sie hängen — **und das Wort, an dem sie hängen, ist bei
Kriterion oft ein Vokabelwort, das der Admin frei wählt.**

### S3.1 Die fünf türkischen Regeln

- **T1 · Keine Endung an einem Platzhalter.** Ein Vokabelwort bleibt im
  Nominativ, in Anführungszeichen — und die Endung trägt ein festes Wort
  daneben. *Nicht* `{sache}'yi sil?` (die Endung hinge am Wort des Admins,
  und ob sie -yi, -yı, -yu oder -yü heißt, entscheidet dessen letzter Vokal),
  *sondern* **`„{sache}“ öğesi silinsin mi?`** — die Endung sitzt an *öğe*
  (das Stück), und das Wort des Admins steht unberührt davor. **Das ist S6,
  wörtlich angewandt — die Regel, die das Deutsche für seine Artikel und Fälle
  brauchte, trägt das Türkische für seine Endungen.**
- **T2 · Nach einer Zahl steht die Einzahl.** „3 yorum", nicht „3 yorumlar".
  In `tr.json` tragen die Objekte aus 4.3 deshalb **in beiden Formen dasselbe
  Nomen** — die Datei sagt es, der Code weiß nichts davon. *Die Mehrzahl mit
  -ler/-lar steht nur, wo kein Zähler davor steht: „Yorumlar" als Titel der
  Liste.*
- **T3 · İ und ı.** `'I'.toLowerCase()` ist `'i'` — auf Türkisch ist es `'ı'`,
  und `'i'.toUpperCase()` ist dort `'İ'`. **Suche, Vergleich und Sortierung
  laufen über die Locale** (`toLocaleLowerCase('tr')`, `localeCompare(…,
  'tr')`), sonst findet die Suche „ISTANBUL" den Eintrag „İstanbul" nicht.
  *Abschnitt 6 baut das für alle Sprachen; Türkisch ist die Sprache, an der es
  auffällt.*
- **T4 · Länge.** Türkische Sätze sind oft länger als deutsche (die Endungen),
  bei weniger Wörtern. Die Maße aus S4 zählen Wörter — **für Türkisch gilt
  zusätzlich die Breite am Bildschirm**: Pillen, Knöpfe und Kartenköpfe an den
  zwanzig dichtesten Stellen (S2.4, Punkt 5) noch einmal, mit der dritten
  Datei.
- **T5 · Der Apostroph.** Endungen an Eigennamen, Zahlen und zitierten
  Wörtern trennt das Türkische mit Apostroph („Kriterion'a", „3'te"). **Sätze
  werden so gebaut, dass weder der Titel der Installation noch eine Zahl eine
  Endung braucht** — der Titel steht in Anführungszeichen als Beifügung, die
  Zahl vor einem Nomen (T2). *Wo es nicht anders geht, steht der Apostroph in
  der Datei, nie im Code.*

### S3.2 Das türkische Wörterbuch — und ein Zusammenstoß, der die Regel belegt

| Sache | Deutsch | **Türkisch — Vorschlag** | Bemerkung |
|---|---|---|---|
| `sacheEinzahl` / `-Mehrzahl` | Eintrag / Einträge | **Öğe / Öğeler** | **nicht *Kayıt*** — siehe unten |
| `merkmalJa` / `merkmalNein` | Getestet / Ungetestet | **Test edildi / Test edilmedi** | |
| `zeitpunktEinzahl` / `-Mehrzahl` | Testtag / Testtage | **Test günü / Test günleri** | |
| `berichtEinzahl` / `-Mehrzahl` | Bericht / Berichte | **Rapor / Raporlar** | |
| `aufgabeEinzahl` / `-Mehrzahl` | Aufgabe / Aufgaben | **Görev / Görevler** | |
| `aufgabeErledigt` | Erledigt | **Tamamlandı** | |
| `potenzial` | Potenzial | **Potansiyel** | |
| `bewertungEinzahl` / `-Mehrzahl` | Bewertung / Bewertungen | **Değerlendirme / Değerlendirmeler** | |
| Einstellungen · Mein Konto · Benutzer · Sitzung | | **Ayarlar · Hesabım · Kullanıcı · Oturum** | |
| Registrierung · Anfrage | | **Kayıt olma · Başvuru** | *hier* steht *Kayıt* — und deshalb nicht beim Eintrag |
| Einladungslink · Link zum Zurücksetzen | | **Davet bağlantısı · Sıfırlama bağlantısı** | |
| Sperren / Entsperren · Freischalten / Ablehnen | | **Kilitle / Kilidi aç · Onayla / Reddet** | |
| Löschen · Entfernen · Wiederherstellen · Papierkorb | | **Sil · Kaldır · Geri yükle · Çöp kutusu** | |
| Speichern / Gespeichert · Abbrechen | | **Kaydet / Kaydedildi · İptal** | |
| Durchschnitt · Note · Kriterium / Kriterien | | **Ortalama · Puan · Ölçüt / Ölçütler** | |
| Foto · Video · Vorschaubild · Bildausschnitt | | **Fotoğraf · Video · Küçük resim · Kırpma** | |
| Sicherung · Export / Import | | **Yedek · Dışa aktar / İçe aktar** | |
| Darstellung · Farbschema · Schriftgröße · Sprache | | **Görünüm · Renk şeması · Yazı boyutu · Dil** | |
| Anmelden / Abmelden · Passwort | | **Giriş yap / Çıkış yap · Parola** | *Parola* oder *Şifre* — beide üblich (Microsoft und Apple sagen *Parola*, Google sagt *Şifre*); Vorschlag *Parola*, zu entscheiden mit dem Leser aus E14 |
| Eigentümer · Admin · Benutzer | | **Sahip · Yönetici · Kullanıcı** | |
| Kommentar · Kategorie · Tag · Neuigkeiten | | **Yorum · Kategori · Etiket · Yenilikler** | |
| Alle · Vorschau · Auf Vorgaben zurücksetzen | | **Tümü · Önizleme · Varsayılanlara dön** | |

**Der Zusammenstoß:** das nächstliegende Wort für „Eintrag" wäre *Kayıt* — und
*Kayıt* heißt zugleich „Registrierung" (*kayıt olma*) und steckt in „speichern"
(*kaydet*). **Eine Sache, ein Wort** (S3) heißt auch: **ein Wort, eine Sache.**
Deshalb *Öğe* für den Eintrag. *Auf Deutsch stellt sich die Frage nicht, auf
Englisch auch nicht — und genau darum wird das Wörterbuch je Sprache
beschlossen und nicht je Sprache abgeschrieben.*

### S3.3 Was Türkisch mit Deutsch teilt — und deshalb nichts kostet

| | Deutsch | Türkisch |
|---|---|---|
| Datum | 05.09.2026 | 05.09.2026 — **gleich** |
| Uhrzeit | 24 Stunden | 24 Stunden — **gleich** |
| Dezimalzeichen | Komma | Komma — **gleich** |
| Mehrzahlklassen | eins / andere | eins / andere — **gleich** |
| Schrift | `system-ui, … Arial, sans-serif` | dieselbe Kette; **ğ, ş, ç, ı, İ liegen in jeder davon** |

*Die Locale ist `tr-TR`, und sonst ändert Abschnitt 6 für Türkisch nichts.*

### S3.4 Woran die Abnahme von Stufe 3 hängt

1. **T1 am lebenden Beispiel:** das Vokabelwort auf *Model* (letzter Vokal e),
   dann auf *Kutu* (u), dann auf *Kayıt* (ı) umgestellt — **derselbe Satz
   bleibt richtig**, weil keine Endung daran hängt. *Das ist die Gegenprobe
   der Regel, und sie steht im Prüfstand als Prüfung an drei Wörtern.*
2. **T2:** „1 yorum" und „3 yorum", „Yorumlar" als Titel.
3. **T3:** ein Eintrag „İstanbul", gesucht als „istanbul" und als „ISTANBUL",
   in der türkischen Oberfläche gefunden; Sortierung von „ılık", „irmik",
   „İzmir" in dieser Reihenfolge.
4. **T4:** der Augenschein an den zwanzig dichtesten Stellen, am Telefon.
5. **Deckungsprobe** für `tr.json`, mit Gegenprobe.

**Und die Frage, die dieses Papier nicht beantwortet:** *wer liest die
türkische Fassung gegen?* Der Entwurf kommt von Claude; **ohne einen Leser,
der Türkisch als Sprache und nicht als Wörterbuch kennt, geht `tr.json` nicht
heraus.** Der Betreiber sagt, wer das ist (E14).

---

## 8. Was es ausdrücklich NICHT wird

| was | warum nicht |
|---|---|
| **Eine Bibliothek (i18next, Polyglot, …)** | vierzig Zeilen gegen 40 KB, ohne Bauschritt, und die sechste Abhängigkeit für die einfachste Funktion des Projekts (3.2) |
| **`.lang`, `.po`, `.properties`** | keine Mehrzahlformen ohne Zusatz, eigener Parser; JSON lesen beide Seiten ohne Zeile Code (3.2). *Ein Export nach `.po` für ein Übersetzerwerkzeug bleibt möglich und ist Datei, nicht Bauform* |
| **Übersetzte Inhalte** | Einträge, Kommentare, Kriterien, Kategorien, Tags, der Titel — Daten des Benutzers, in der Sprache, in der er sie schreibt |
| **Übersetzte Kommentare, Papiere, Konsole, Werkzeuge** | die Sprache des Projekts bleibt Deutsch (Abschnitt 12 des Projektstands) |
| **Die Sprache des Geräts als alleinige Quelle** | wer am englischen Telefon Deutsch lesen will, könnte es dann nicht — die Wahl ist der Punkt (dasselbe Argument wie beim Farbschema) |
| **Ein Schalter in der Kopfzeile** | zwei Orte für eine Frage; die Anmeldeseite ist die eine Ausnahme, weil dort noch kein Konto ist (5.3) |
| **Eine Region je Sprache (`de-AT`, `en-US` neben `en-GB`)** | heute keine zweite Fassung; die Bauform lässt sie zu, weil die Kennung nur ein Dateiname ist (3.1) |
| **Rechts-nach-links** | keine der drei Sprachen braucht es. *Die Bauform verbaut es nicht:* `dir` am Wurzelelement käme aus dem Kopf der Datei, wie `_locale` — **aber das Stilblatt ist dafür nicht geprüft, und das steht hier, damit es niemand für erledigt hält** |
| **HTML in Sprachtexten** | jeder Übersetzer müsste Markup können, jeder Text beim Einsetzen zweimal geprüft werden (4.2) |
| **Ein Migrationsblock** | die Sprache liegt in `user_settings` wie das Farbschema; der Schlüssel `vokabular` wird beim Lesen umgedeutet, nicht beim Start umgeschrieben (Abschnitt 7) |

---

## 9. Der Prüfstand — was neu dazukommt

**Die drei bestehenden Wächter lesen um**, und **sieben neue kommen dazu.**
Jeder mit seiner Gegenprobe in `gegenprobe.js` — *eine Gegenprobe, die stumm
bleibt, ist ein Fund und kein Beleg.*

| Wächter | Zusicherung | Gegenprobe |
|---|---|---|
| **Deckungsprobe** | jede Sprachdatei hat exakt die Schlüssel von `de.json` — ohne `_hinweis`, mit `_locale` | ein Schlüssel aus `en.json` entfernt → rot; einer dazu → rot |
| **Verwendungsprobe** | jeder Schlüssel in `de.json` wird im Code mindestens einmal gerufen; jeder gerufene existiert | ein `t('…')` mit erfundenem Schlüssel → rot; eine Zeile aus `de.json` gelöscht → rot |
| **Platzhalterprobe** | je Schlüssel dieselbe Menge `{…}` in jeder Sprache; ein Vokabelplatzhalter nur aus den vierzehn Namen | `{n}` in `en.json` zu `{count}` → rot |
| **Mehrzahlprobe** | jedes Objekt trägt `eins` und `andere`; kein String enthält `=== 1 ?`-Reste im Code | `andere` entfernt → rot |
| **Restprobe** | der Tokenizer findet in `app.js` weniger als 60 lesbare Texte, und sie stehen namentlich in der Liste | ein deutscher Satz zurück in `app.js` → rot |
| **Rückfallprobe** | kein `⟦` im DOM irgendeiner Ansicht, in jeder Sprache | ein Schlüssel im Code umbenannt → `⟦…⟧` im DOM → rot |
| **Formatprobe** | `_locale` liegt in jeder Datei und ist eine, die `Intl` kennt; `fmtDate` liefert in `tr` und `de` dasselbe Datum, in `en` ein anderes | `_locale` auf `xx-XX` → rot |
| Bildschirmtext-Wächter (bestehend) | liest `de.json` statt `app.js`; `BILDSCHIRM_VERBOT` unverändert | wie heute |
| Servertext-Wächter (bestehend) | findet **null** Literale hinter `error:` — und **null** deutsche Sätze in `throw new Error` in `auth.js` | ein Literal zurück → rot |
| die drei türkischen Proben (Stufe 3) | T1 an drei Wörtern, T2, T3 | je eine |

**Die Zahlen, die im Prüfstand festgenagelt werden:** `PERSOENLICHE_SCHLUESSEL`
= 11, die Felder von `/api/config` = 6, `F_ROUTEN` = 70 (unverändert), die
Zahl der Sprachdateien (2 nach Stufe 2, 3 nach Stufe 3), die Reste in `app.js`
(< 60). *Eine Zahl in einem Papier ist eine Behauptung; im Prüfstand ist sie
ein Beleg (Abschnitt 12 des Projektstands).*

**Der jsdom-Rahmen** (`baueDom`) bekommt einen `fetch`-Stummel für
`sprachen/<code>.json`, der die echte Datei liest — **die 312 Zusicherungen mit
deutschem Text bleiben damit gültig, wie sie sind**: die Prüfungen laufen auf
Deutsch, und eine kleine Gruppe fährt dieselben Ansichten auf Englisch und
Türkisch. *Die 28 Rückbauten, die einen deutschen Satz im Quelltext suchen,
suchen ihn danach in `de.json` — mitgezogen, nicht gelöscht.*

---

## 10. Die Entscheidungen — vierzehn, und sie sind offen

*Empfehlung in Fettschrift. Die Entscheidung trifft der Betreiber; was anders
entschieden wird, wird hier nachgetragen — die Frage bleibt stehen, damit die
Entscheidung in einem halben Jahr noch zu beurteilen ist.*

| # | Frage | Empfehlung |
|---|---|---|
| **E1** | Form und Name der Dateien? | **JSON, ISO-639-1-Kennung, `public/sprachen/de.json`** — nicht `.lang`, nicht `eng` (3.1, 3.2) |
| **E2** | Wie heißen die Schlüssel? | **Deutsch, nach der Sache, mit Namensraum**; Platzhalter benannt (4.1, 4.2) |
| **E3** | Mehrzahl? | **Objekt `eins`/`andere`, Wahl über `Intl.PluralRules`, der ganze Satz wechselt** (4.3) |
| **E4** | Keine Bibliothek? | **Ja — `t()`/`tH()` in vierzig Zeilen, beide Seiten** (3.2, 4.4, 4.5) |
| **E5** | Wo stellt der Benutzer ein, wo der Admin? | **Benutzer: Karte „Darstellung", Pillen mit Eigennamen. Admin: Vorgabe in der Karte „Vokabular"** (5.1, 5.2) |
| **E6** | Was sieht die Anmeldeseite? | **Gedächtnis, sonst Vorgabe der Installation; eine Sprachzeile unter der Maske**, die nur das Gedächtnis schreibt (5.3) |
| **E7** | Woher weiß der Server die Sprache? | **Benutzerschlüssel → `Accept-Language` aus `api()` → Vorgabe → `de`**; `auth.js` wirft Schlüssel statt Sätze (4.5) |
| **E8** | Sprache der Mails? | **Die des Empfängers**; Einladung in der Vorgabe der Installation (4.6) |
| **E9** | Vokabelwörter? | **Vorgaben in der Sprachdatei, Überschreibungen je Sprache**, alter flacher Wert gilt als `de` (Abschnitt 7) |
| **E10** | Datum, Zahl, Sortierung? | **`_locale` im Kopf der Datei, `Intl` statt `replace`, `toLocaleLowerCase`** (Abschnitt 6) |
| **E11** | Was wird nicht übersetzt? | **Inhalte, Titel, Kommentare, Papiere, Konsole, Werkzeuge, Prüfstand** (Abschnitt 0, S1.2) |
| **E12** | Welche Stufe geht mit welcher Nummer heraus? | **Stufe 1 + 2 = 0.24.0.** Stufe 3 ist eine eigene Runde und nimmt die nächste freie Nummer — **oder fährt in 0.24.0 mit, wenn `tr.json` gegengelesen ist, bevor die Runde herausgeht.** *Eine dritte Datei allein bringt eine Funktion (die Installation spricht danach Türkisch) und wäre nach 5.1 MINOR, nicht PATCH* — **Entschieden am 5. September 2026, anders als empfohlen: Stufe 1 geht zuerst und allein heraus, als 0.24.0 — Auftrag `Doku/Auftrag_0.24.0.md`.** *Zunächst 0.24.1 genannt und noch am selben Tag auf 0.24.0 entschieden, weil eine PATCH-Zahl ihre MINOR-Zahl voraussetzt. Die Nummern für Stufe 2 und 3 sind offen und werden am Auftrag zu Stufe 2 entschieden.* |
| **E13** | Welches Englisch? | **`en-GB`** — Tag zuerst wie Deutsch und Türkisch, 24 Stunden, *Colour*. *Alternative `en-US`: Monat zuerst, 12 Stunden, *Color*.* Es ist eine Zeile in `en.json`, und sie ist später änderbar — aber nicht ohne die Wörter |
| **E14** | Wer liest Englisch und Türkisch gegen? | **Der Betreiber nennt je Sprache einen Leser.** Ohne Leser geht keine Datei heraus (S3.4) |

**Und eine Frage, die keine Nummer bekommt, weil sie entschieden ist:** *ob
die Runde vor der Bereinigung kommt.* **Das hat der Fahrplan am 5. September
2026 entschieden**; dieses Papier sagt nur, wie sie gebaut wird — und dass
sie keinen Migrationsblock bringt, den die Bereinigung ausbauen müsste.

---

## 11. Risiken — und was sie kosten

| Risiko | was dagegen steht |
|---|---|
| **Ein Satz bleibt geklebt** — irgendwo zieht der Code doch noch zwei Schlüssel zusammen | die Mehrzahlprobe (kein `=== 1 ?` mehr im Code) und die englische Durchsicht: *wo die Übersetzung nicht umstellen kann, klebt es* |
| **Eine Übersetzung fehlt und fällt still auf Deutsch zurück** | die Deckungsprobe im Prüfstand; im Feld der Rückfall auf Deutsch statt auf `⟦…⟧` — *lieber ein deutsches Wort als ein Zeichen* |
| **Die 312 Zusicherungen mit deutschem Text** | der jsdom-Rahmen liest `de.json`; die Prüfungen ändern sich nicht |
| **Die Karte platzt** — ein türkischer oder deutscher Text sprengt eine Pille | der Augenschein an zwanzig Stellen je Sprache (S2.4, T4); die Maße aus S4 je Datei |
| **Ein Vokabelwort des Admins bricht einen türkischen Satz** | T1 — keine Endung an einem Platzhalter; die Prüfung an drei Wörtern (S3.4) |
| **Eine zweite Wahrheit für die Sprache** — Gedächtnis gegen Server | dieselbe Regel wie beim Farbschema: der Server überschreibt bei jedem Laden, das Gedächtnis wird nie zurückgeschickt |
| **Ein Lauf mehr beim Laden** — die Sprachdatei | eine Datei, geschätzt zwischen 60 und 100 KB, mit ETag, parallel zu `/api/config`; **gemessen wird vor dem Bauen, nicht geschätzt** (Stolperstein 252: Zahlen aus dem Auftrag sind keine Messung) |
| **Die Bereinigung löscht später Text, der gerade umgezogen ist** | wenige Zeilen — Migrationsblöcke tragen keinen Bildschirmtext (Fahrplan, Kasten zum neunten Rücken) |

---

## 12. Woran die Abnahme der Runde hängt

**Stufe 1:** die fünf Punkte aus S1.4 — *nichts sieht anders aus, und kein
Text steht mehr im Code.*

**Stufe 2:** die fünf Punkte aus S2.4 — *zwei Benutzer, zwei Sprachen,
gleichzeitig; Mails in der Sprache des Empfängers.*

**Stufe 3:** die fünf Punkte aus S3.4 — *T1 an drei Wörtern, İ und ı, und ein
Leser, der Türkisch kann.*

**Für alle drei:** `npm test` grün mit den neuen Wächtern, jede neue Prüfung
mit ihrer Gegenprobe, die Zahlen aus Abschnitt 9 festgenagelt — und **der
Fahrplan, das Sammelblatt und der Projektstand nachgezogen, mit den Zahlen,
die beim Bauen wirklich herauskamen** (Stolperstein 137: nachzählen, nicht
abschreiben).

---

## 13. Was dieses Papier NICHT entscheidet

**Ob die Runde kommt und wann.** Das steht im Fahrplan — 0.24.0, seit dem
5. September 2026.

**Die Reihenfolge der Bauabschnitte im Einzelnen und die Schlüsselliste.**
Beides steht im Auftrag, der aus diesem Papier geschrieben wird — *die
Schlüsselliste entsteht beim Umzug und nicht vorher; wer sie vorher schreibt,
schreibt sie zweimal.*

**Die Wörter selbst.** Die Tafeln in S2.1 und S3.2 sind Vorschläge; das
Wörterbuch je Sprache wird beschlossen, bevor die erste Zeile übersetzt wird
— im Gespräch, wie 0.22.0 seines beschlossen hat.

---

*Die Zahlen dieses Papiers sind auf `34da9ea` gezählt, mit den Werkzeugen des
Prüfstands (`bildschirmtexteVon`, `servertexteVon`) und mit `grep` über den
Quelltext; wo eine Zahl „rund" heißt, ist sie eine Schätzung aus einem
Muster über Umlaute und wird beim Bauen nachgezählt. Was hier als Regel
steht, gehört in den Prüfstand und nicht in ein Papier.*
