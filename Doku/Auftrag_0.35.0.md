# Auftrag 0.35.0 — „Code-Effizienz"

Geschrieben am 16. September 2026. Nicht gebaut. Läuft nach 0.34.4.

**101 Befunde gemessen, 75 halten der Widerlegung stand. Fünf davon sind
Sicherheitsbefunde: zwei gehen als Patch 0.34.4 vor diese Runde, drei nach
0.36.0. Für diese Runde bleiben 70 Befunde an 65 Stellen.**

> **GEMESSEN WURDE AUF DEM STAND `5139e1f` (0.34.3).** *0.34.4 ist am selben Tag
> gebaut worden und hebt zwei Zahlen, die hier stehen:* **Rückbauten 998 → 1000,
> Prüfungen 6893 → 6903.** *Die Befunde selbst sind davon nicht berührt — 0.34.4
> fasst `auth.js`, `testbench.js`, `test/frame.js`, `test/roundtrip.js` und
> `test/selfcheck.js` an, und zwar an Stellen, die in keinem der 70 Befunde
> stehen.*

---

## 1. Die Regel

Der Betreiber hat die Runde am 16. September 2026 in zwei Sätzen bestimmt:

> „code der statt kompliziert und schwerfaellig einfacher zu bauen waere"

> „natuerlich auch langsam. Also ueberall da wo es haette besser gemacht werden
> koennen"

Daraus vier Arten:

| Art | was gesucht wird |
|---|---|
| **tot** | Namen ohne Aufrufer, Spalten ohne Leser, Schlüssel ohne Verwendung, Zweige, die nie erreicht werden |
| **umständlich** | kompliziert gebaut, wo dasselbe einfacher ginge — eine Stelle, die in drei Zeilen sagt, was heute dreißig braucht |
| **langsam** | Arbeit, die nicht sein müsste: dieselbe Abfrage in einer Schleife, ein fehlender Index, ein Blob, das gelesen und nicht gebraucht wird |
| **besser** | verschluckte Fehler, Absagen ohne Auskunft, willkürliche Grenzen |

**Vereinfacht heißt kürzer UND flacher** (F5). Eine Änderung, die Zeilen nur
verschiebt, zählt nicht. Beides ist messbar: Zeilen je Funktion und
Verschachtelungstiefe, und beide Zahlen stehen im Änderungsprotokoll.

---

## 2. Die Zahlen

Gemessen am 16. September 2026 auf dem Stand `5139e1f` (nach 0.34.3) durch
**17 Leser**, je ein Sachgebiet, höchstens sechs Befunde je Leser. Jeder Befund
danach von zwei Seiten geprüft: einer versucht ihn zu widerlegen, einer misst
die Folgen.

| | |
|---|---:|
| Befunde gemessen | **101** |
| halten der Widerlegung stand | **75** |
| davon Sicherheitsbefunde → 0.36.0 | **5** |
| **für diese Runde** | **70** |
| an verschiedenen Stellen | **65** |
| widerlegt | 26 |

Die 65 Stellen nach Art: **tot 24 · langsam 21 · umständlich 15 · besser 5.**

**Fünf Stellen haben zwei Leser unabhängig gefunden** — `images.js:98`,
`public/app.js:1336`, `public/app.js:6492`, `public/style.css:2663`,
`server.js:3135`. Der Deckel von sechs Befunden je Leser hat also nicht nur
abgeschnitten, er hat auch doppelt gesehen.

### Die schwersten Einzelbefunde

| Stelle | Befund |
|---|---|
| `public/style.css` | **70,5 %** des ausgelieferten Stilblatts sind Kommentar — 212.626 von 301.395 Bytes. Der Server komprimiert nicht. Jeder Browser lädt bei jedem Aufruf **208 kB Kommentar** |
| `server.js:4285` | `importInto` mit **372 Zeilen** und Einrückungstiefe 14, drei fast gleiche find-or-create-Closures |
| `server.js:4251` | Der Export steht **dreimal gleichzeitig** im Arbeitsspeicher |
| `server.js:4669` | Der Import steht **viermal** im Arbeitsspeicher |
| `server.js:4262` | `GET /api/items/:id/export` hat **kein Bedienelement** — das Handbuch beschreibt die Funktion, `public/app.js` ruft sie nie |
| `test/dom.js` | **626 feste Wartezeiten** in den Prüfmodulen, zusammen 62.635 ms nominal |

**`public/style.css` war in keiner Messung von 0.34.1.** Jene Runde hat den
Kommentaranteil auf 19,2 % gebracht, aber über 34 **JavaScript**-Dateien.
`tools/comments.js` zählt keine CSS-Datei.

---

## 3. Was NICHT in diese Runde gehört

**Fünf Befunde halten stand und sind Sicherheitsbefunde.** Sie gehören nach
**0.36.0**, und einer von ihnen gehört früher.

| Stelle | Befund |
|---|---|
| `auth.js:691` | **Ein einmaliger Link lässt sich zweimal einlösen.** `redeemToken` prüft `used_at IS NULL`, rechnet dann scrypt — das gibt den Event Loop frei —, und setzt `used_at` erst danach, ohne `AND used_at IS NULL`. **Nachgestellt auf einer Kopie der Datenbank:** zwei gleichzeitige Aufrufe gelingen beide, das zweite Passwort überschreibt das erste |
| `server.js:4780` | Dasselbe Muster beim Wiederherstellen aus dem Papierkorb: lesen, `await importInto`, dann löschen. Zwei gleichzeitige Anfragen legen den Eintrag zweimal an |
| `keys.js:86` | Die Schlüsseldatei wird ungeprüft gelesen. `HEX_PATTERN` wird nicht gefragt, obwohl der Kommentar in `keys.js:9-10` zusagt, die Frage werde beim Laden gestellt |
| `server.js:1655` | `PUT /api/settings` sagt an neun Stellen ab, **nachdem** es schon geschrieben hat, ohne Transaktion |
| `testbench.js:25` | **Ein Modul, das nach dem Schreiben seiner Meldung abstürzt, zählt als bestanden.** `test/frame.js` schreibt die Meldung in Zeile 619, räumt in 620–624 auf (`fs.rmSync` ohne `try/catch`) und beendet erst in 625 |

**`auth.js:691` und `testbench.js:25` warten nicht auf 0.36.0.** Der erste
bricht eine Zusage, die die Anwendung ausdrücklich gibt; der zweite kann einen
roten Lauf als grünen ausgeben — und zwar gerade dort, wo 0.35.0 seine Belege
herholt. Beide sind je wenige Zeilen.

> **ENTSCHIEDEN AM 16. SEPTEMBER 2026 (F13): beide gehen als eigener Patch
> 0.34.4 vor diese Runde.** Nach dem Muster von 0.33.1 und 0.33.2: eigene
> Nummer, eigenes Änderungsprotokoll, **kein Auftrag**. Die übrigen drei
> Befunde bleiben bei 0.36.0.
>
> **GEBAUT am 16. September 2026** — Änderungsprotokoll 0.34.4. *Beide sind
> behoben und mit zehn Prüfungen und zwei Rückbauten belegt.* **Diese Runde
> fängt also mit einem Treiber an, der einen roten Lauf nicht mehr als grünen
> ausgeben kann** — was für ihre Belege der Punkt war.

---

## 4. Der Beleg

**Womit belegt wird, dass eine vereinfachte Stelle dasselbe tut** (F3): für
jede vereinfachte Stelle wird die **alte Form als Rückbau** eingetragen. Wird
er rot, ist belegt, dass eine Prüfung die Stelle bewacht. Wird er nicht rot,
war sie nie bewacht — dann kommt erst eine Prüfung, dann die Vereinfachung.

**6893 Prüfungen sind kein Beweis für Gleichheit.** Eine subtil andere Fassung
kann grün sein. Genau dafür gibt es die 998 Rückbauten.

**Womit Laufzeit belegt wird** (F4): **fünf Läufe vorher, fünf nachher, der
Median**. Der Grund ist gemessen und steht in Abschnitt 10 als B3: die teuerste
Prüfgruppe schwankt zwischen **19,2 und 35,8 s** ohne jede Änderung.

**Es gibt keine Quote** (F12). Je Bauabschnitt ein belegtes Vorher und Nachher;
die Runde endet, wenn die Befunde abgearbeitet sind. „Einfacher" lässt sich
nicht quotieren — zwei Zeilen weniger können eine Verschlechterung sein.

---

## 5. Fragetafel — beantwortet am 16. September 2026

| Nr | Frage | Antwort |
|---|---|---|
| **F1** | Darf sich Verhalten ändern? | **Nein.** Wo Verhalten fiele, ist es ein Befund und keine Zeile dieser Runde |
| **F2** | Dürfen tote Spalten fallen? | **Keine Schemaänderung** in dieser Runde; tote Spalten bleiben als Befund stehen |
| **F3** | Beleg für Gleichheit einer Vereinfachung? | **Je Bauabschnitt ein Rückbau** auf die alte Form |
| **F4** | Beleg für Laufzeit? | **Fünf Läufe, Median**, vorher und nachher |
| **F5** | Wann gilt eine Stelle als vereinfacht? | **Nur wenn kürzer UND flacher** |
| **F6** | Tote Sprachschlüssel und CSS? | **Beide fallen**, die Wächterzahl wird mitgezogen |
| **F7** | Darf der Prüfstand angefasst werden? | **Ja** — zusammenfassen und beschleunigen. **Keine Prüfung fällt** |
| **F8** | Reihenfolge? | **Tot, dann umständlich, dann langsam** |
| **F9** | Modellstufe und Form je Bauabschnitt? | **Gemischt nach Form der Arbeit** — siehe Abschnitt 7 |
| **F10** | Die vier Befunde der Messung? | **B1 und B2 als eigener Bauabschnitt**, B3 als Messpunkt davor |
| **F11** | Welche Stellen kommen in die Runde? | **Die 65**, die der Widerlegung standhalten. Die 26 widerlegten stehen mit Begründung daneben |
| **F12** | Bindende Zahl wie die 20 % bei 0.34.1? | **Keine Quote** |
| **F13** | `auth.js:691` und `testbench.js:25` als Patch 0.34.4 vor dieser Runde? | **Ja.** Eigene Nummer, eigenes Änderungsprotokoll, kein Auftrag |

---

## 6. Bauabschnitte

| BA | Inhalt | Stellen | Stufe | Form |
|---|---|---:|---|---|
| **0** | Die eigenen Befunde der Messung: B1 Schalterprobe, B2 überholte Zeile im Fahrplan | 2 | niedriger | einzeln |
| **0a** | Ausgangswerte messen: fünf Läufe je Gruppe, die beschleunigt werden soll (B3) | — | niedriger | einzeln |
| **1** | **Tot** in den ausgelieferten Dateien: Exporte, Konstanten, Zweige, Routen | 14 | niedriger | **fächerförmig** |
| **2** | **Tot** in `public/languages/*.json` und `public/style.css`, Wächterzahlen mitgezogen | 3 | Opus 5 | einzeln |
| **3** | **Umständlich** in `server.js`: `importInto`, `entryAsBundle`, `PUT /api/settings`, `GET /api/backup` | 5 | **Opus 5** | einzeln |
| **4** | **Umständlich** in `public/app.js`: Dialoggerüst, Pillenreihen, Anmeldeseiten, doppelte Rechnungen | 10 | **Opus 5** | einzeln |
| **5** | **Langsam** in der Auslieferung: `style.css`, `SELECT *`, Blobs, Abfragen in Schleifen | 11 | **Opus 5** | einzeln |
| **6** | **Langsam** im Speicher: Export, Import, `intoTrash` | 3 | **Opus 5** | einzeln |
| **7** | **Langsam** im Prüfstand: `test/selfcheck.js` 996 Lesevorgänge, feste Wartezeiten | 3 | Opus 5 | einzeln |
| **8** | **Besser**: Fehlerbehandlung, Fotoweg, zwei deutsche Texte im Skript | 4 | **Opus 5** | einzeln |
| **9** | Papiere: CHANGELOG, Änderungsprotokoll, Fahrplan, Projektstand | — | Opus 5 | einzeln |

**BA 1 ist der einzige, der fächerförmig darf.** Rein örtliche Wegnahmen von
totem Code berühren einander nicht, und `codesame.js` liefert je Datei einen
Beleg.

---

## 7. Wie diese Runde gefahren wird

Der Prüfstand ist der einzige Richter, er urteilt **global**, und er braucht
**rund 300 Sekunden**. Daraus folgt die Form je Phase:

| Phase | Form | Stufe |
|---|---|---|
| **Vorlauf je Bauabschnitt** — welche Aufrufstellen, welche Rückbauten, welche zählenden Wächter hängen daran | **fächerförmig** | Opus 5, hohe Denkstufe |
| **Entwurf** — bei „umständlich" und „langsam" drei unabhängige Entwürfe, dazu Bewerter | **fächerförmig** | Opus 5 |
| **Schreiben** | **ein einziger Schreiber**, ein Bauabschnitt, ein voller Lauf, ein Commit | Opus 5, bei BA 0, 0a und 1 niedriger |
| **Billige Proben zwischendurch** | `codesame.js`, die Suchtexte der 998, `tools/comments.js` | — |
| **Gegenproben** | `counterproof.js` fährt Nebenspuren selbst — kein Workflow, nur mehr Spuren | — |
| **Durchsicht des fertigen Diffs** | **fächerförmig**, Dimensionen mal gegnerische Prüfung | Opus 5 |

**Warum nicht überall parallel geschrieben wird:** zwei Agenten, die
gleichzeitig `server.js` und `public/app.js` ändern, können jeder für sich
recht haben und zusammen unrecht — an einem Rückbauanker, an einem zählenden
Wächter, an einer gemeinsamen Hilfsfunktion. Das sieht man erst im gemeinsamen
Lauf.

---

## 8. Zusagen an den Prüfstand

1. **Kein Verhalten ändert sich.** Wo es fiele, wird die Stelle nicht angefasst.
2. Die Zahl der Prüfungen bleibt gleich oder **steigt**. Keine Prüfung fällt.
3. Kein Gruppenname und kein Prüfungsname ändert sich, außer er nennt eine Zahl,
   die diese Runde ändert. Solche Änderungen stehen namentlich im Protokoll.
4. Je vereinfachter Stelle ein Rückbau auf die alte Form. Die Zahl der
   Rückbauten steigt über 998.
5. Gegenprobenlauf über die neuen und die berührten Rückbauten, **0 stumm**.
6. Jede Laufzeitzahl aus fünf Läufen, Median, vorher und nachher.
7. Der Fingerprint ändert sich — erwartet.

---

## 9. Nicht gebaut wird

- **Keine Schemaänderung.** Keine Spalte fällt, keine Tabelle fällt, kein Index
  kommt dazu. Betroffen sind damit: die acht `created_at`-Spalten ohne Leser
  (`db.js:549`), `attachments.mime_type` (`db.js:459`), `items.favorite`, und
  der fehlende Index auf `ratings.criterion_id` (`db.js:338`). **Alle vier
  bleiben als Befund stehen und bekommen eine eigene Nummer.**
- **Kein Austauschformat.** `appVersion` wird im Format 17 nie gelesen
  (`server.js:4021`) — das bleibt Befund.
- **Keine Sicherheitsarbeit.** Drei der fünf Befunde aus Abschnitt 3 gehören
  nach 0.36.0. Die beiden übrigen sind mit **0.34.4** vor dieser Runde gebaut
  worden (F13).
- **Keine Prüfung fällt**, auch keine, die dasselbe sagt wie eine andere.
- **Keine Quote wird gegen die Regel erzwungen.** Kommt ein Bauabschnitt mit der
  Regel nicht zu einer Verbesserung, ist das ein Befund und wird aufgeschrieben.
- **Keine neue Abhängigkeit.** Auch keine für Kompression.

---

## 10. Die Befunde der Messung selbst

Vier Befunde sind beim Messen entstanden, nicht durch die Leser.

### B1 — Die Schalterprobe belegt nicht, was ihr Name sagt

`test/release_030.js:180` startet ein Kind, um zu belegen, dass die Zeitzeile
ohne Schalter nicht dasteht — und vererbt `TESTBENCH_TIME` dabei an das Kind.
Die Prüfung in Zeile 194 heißt „Und ohne ihn nicht — er ist ein Schalter und
keine Ansichtssache" und ist grün, weil der Elternprozess zufällig keinen
Schalter trug.

**Gemessen:** `TESTBENCH_TIME=1 npm test` ergibt 6892 von 6893, `npm test` ohne
Schalter 6893 von 6893, auf demselben Stand. **Behebung: eine Zeile.**

### B2 — Der Fahrplan nennt zwei Schwachstellen, die es nicht gibt

`Doku/Fahrplan.md`, Abschnitt 0.36.0: „`npm audit` meldet heute zwei
mittelschwere Schwachstellen in `qs`". **Gemessen am 16. September 2026:
`npm audit` meldet 0 vulnerabilities.** 0.33.1 hat sie behoben.

### B3 — Die teuerste Prüfgruppe schwankt um Faktor 1,86

| Lauf | Zeit |
|---|---:|
| allein, dreimal | **23,0 / 35,2 / 35,4 s** |
| im vollen Lauf, zweimal | **19,2 / 35,8 s** |

Nicht die Konkurrenz der Modulprozesse — die Schwankung tritt auch allein auf.
Nicht der Prüfschalter — er steht fest in `test/frame.js:13`.

**Die Ursache ist gemessen:** der Server nimmt nur einen echt größeren
TOTP-Zähler an (`auth.js:1054`). Zwei Codes im selben 30-Sekunden-Schritt
können nicht beide gelten, also wartet der zweite auf die nächste
Schrittgrenze — je nach Startlage 0 bis 30 Sekunden.

*Eine erste Erklärung — die Kette in `test/ui_export.js:272` beginne einen
Schritt zu hoch — ist beim Gegenprüfen widerlegt worden. Der vorgeschlagene
Einzeiler hätte nichts gebracht.*

### B4 — Die Schlusstafel rangiert nach einer schwankenden Zahl

Folgt aus B3. „DIE TEUERSTEN 10 VON 349 GRUPPEN" stammt aus einem einzelnen
Lauf. Wer daraus wählt, wählt zum Teil aus Rauschen. **Deshalb F4.**

### B5 — 50 von 998 `expected`-Werten sind kein Gruppenname

Beim Gegenprüfen gemessen: von den 998 Rückbauten tragen **948** ein `expected`,
das wörtlich mit einem `group()`-Aufruf übereinstimmt, **50 nicht**. Drei davon
sind gar keine Gruppennamen, sondern Fließtext (`06`, `433`, `516`). Weitere
tragen gekürzte oder veraltete Namen.

*Ein Befund, der daraus einen Vergleich `group === expected` vorschlug, ist
widerlegt worden: er gäbe rund 50 Fehlalarme. Die 50 abweichenden Werte sind
der eigentliche Befund und gehören einzeln nachgezogen.*

---

## 11. Was die Messung nicht gesehen hat

- **Der Deckel lag bei sechs Befunden je Leser.** Wo ein Leser sechs gemeldet
  hat, ist wahrscheinlich mehr da. Das betrifft vor allem `public/app.js` und
  `server.js`.
- **`public/index.html` und `Dockerfile` hatte kein Leser als Sachgebiet.**
- **Keine Zahl ist am laufenden Betrieb gemessen worden**, nur am Quelltext und
  an gestellten Prüflagen. Die Zahlen zu Speicher und Abfragen sind gezählt,
  nicht gestoppt.
- **Die 26 widerlegten Befunde stehen mit Begründung in der Messung** und sind
  kein Freibrief: eine Widerlegung sagt, dass *dieser* Befund in *dieser* Form
  nicht hält.

---

## 12. Anlage: die Befunde

**65 Stellen**, die der Widerlegung standhalten. `P` heisst: eine Pruefung oder
ein Rueckbau haengt daran. `V` heisst: die Folgenpruefung sieht eine
Verhaltensaenderung — solche Stellen faellt Zusage 1 aus der Runde heraus,
wenn sich die Aenderung nicht ohne sie bauen laesst.

### Tot — 24 Stellen

| Stelle | Befund | einfacher | Zeilen | | |
|---|---|---|---:|---|---|
| `images.js`:98 *(zweimal gefunden)* | PNG_MAGIC_HEX wird in images.js:98 aus PNG_MAGIC berechnet und in images.js:121 exportiert. Es gibt keinen Leser — weder in images.js selbst, noch in server.js, batchrun.js, test/ oder counterproof.js. Derselbe Befund in kleinerer | images.js:98 und den Eintrag in images.js:121 entfernen. Die 16 Einträge aus den Exportlisten nehmen; die Definitionen bleiben. Kein Prüfmodul hält au | 18 | P |  |
| `server.js`:4262 | Die Route hat im Produkt keinen Aufrufer. public/app.js baut nur `/api/export` (Zeile 9134 und 9233) und `/api/export/plan` (Zeile 9177). In public/index.html, README.md und manual-de.md kommt sie nicht vor. Aufgerufen wird sie au | Entweder im Client einen Knopf am Eintrag anbinden oder Route und Schluessel entfernen. Keine der gerufenen Funktionen wuerde verwaisen: exchangeBytes | 11 | P | V |
| `db.js`:549 | Acht created_at-Spalten werden vom Vorgabewert geschrieben und von keiner Abfrage gelesen: product_categories (db.js:77), test_days (db.js:223), comment_images (db.js:393), tags (db.js:431), tokens (db.js:549), two_factor (db.js:6 | Je Spalte einzeln entscheiden. Wegnehmen ist eine Schemaaenderung (ALTER TABLE ... DROP COLUMN, an SQLite 3.49.2 moeglich). Austauschformat 17 ist bei | 8 | P | V |
| `public/app.js`:1963 | Die Übersetzungstafel `OLD_SECTIONS` bildet alle vier Schlüssel auf denselben Wert ab. Der Zweig in `translateAddress()`, der sie liest, kann deshalb nie eine Adresse ändern: das Ergebnis ist immer die Adresse, die schon dasteht,  | Die Zeilen 1963 und 1964 sowie den Zweig in den Zeilen 1970 bis 1973 entfernen. `OLD_ADDRESSES` und `OLD_ADDRESS_ROOTS` in den Zeilen 1961 und 1962 bl | 6 |  | V |
| `public/app.js`:3787 | In public/app.js und public/index.html werden 412 verschiedene Klassennamen gesetzt. Sechs davon haben keine Regel in style.css: `blocks` (app.js:3787 und 3835), `ename` (6117), `user-linkbox` (7657), `two-factor-codebox` (6311),  | `blocks` an beiden Stellen und `user-linkbox` streichen. Bei `two-factor-codebox` die Klasse streichen, die Kennung bleibt. `ename` siehe Befund 2. `c | 6 |  |  |
| `public/style.css`:2663 *(zweimal gefunden)* | public/style.css enthaelt 961 Selektorbloecke, davon 937 Regeln mit Rumpf, 440 verschiedene Klassennamen und 9 Kennungen. Genau eine Klasse hat keinen Traeger: `.backup-old` in Zeile 2663, eine Regel mit einer Deklaration (`color: | Zeilen 2659 bis 2663 entfernen. Kein Test verankert sich auf dem Namen. Der einzige zaehlende Waechter, der die Menge beruehrt, ist test/source.js:121 | 5 |  |  |
| `server.js`:1048 | Der Server liest in Zeile 1048 `req.query.group`. Der Client baut die Adresse mit `?gruppe=` (public/app.js:8156). Der String `group=` kommt im ganzen Repository nirgends vor. `group` ist deshalb bei jedem echten Aufruf unde | Eine der beiden Seiten angleichen: entweder server.js:1048 auf `req.query.gruppe` oder public/app.js:8156 auf `?group=`. Das Zweite passt zur laufende | 4 | P | V |
| `server.js`:4885 | Der Zweig wird nie wahr. `checkPlace` ruft in Zeile 4865 `backupState()` und bricht in Zeile 4866 ab, wenn `input` falsch ist. Wer weiterkommt, hat die Pruefung in Zeile 4858-4859 hinter sich: weder liegt `root` in `data` noch `da | Zeilen 4883-4886 entfernen. Die Aussage steht bereits in backupState(), Zeile 4854-4859. | 4 |  |  |
| `public/app.js`:1715 | Das Feld `criteria` im Zustandsobjekt wird in `loadAll()` gesetzt und an keiner Stelle gelesen. Dafür holt `loadAll()` bei jedem Zeichnen der Übersicht zusätzlich `/api/criteria`. Die Antwort wird weggeworfen. | `api('GET', '/api/criteria')` aus dem `Promise.all` in Zeile 1707 entfernen, `criteria` aus der Auflistung in Zeile 1705 und aus dem Objektliteral in  | 3 |  |  |
| `public/app.js`:1336 *(zweimal gefunden)* | `searchDefault` hat im ganzen Repository keinen Aufrufer. Der Kommentar darüber nennt es das Ziel des Zeilenklicks, aber der Zeilenklick rechnet denselben Ausdruck selbst noch einmal aus. | Zeile 1336 samt dem zugehörigen Kommentar in den Zeilen 1334 und 1335 entfernen. Zweite Stelle im selben Bereich: `searchList()` steht in Zeile 5169 i | 3 | P |  |
| `auth.js`:1172 | auth.js exportiert 100 Namen (Zeilen 1172-1208). 7 davon ruft niemand ausserhalb der Datei. Sechs haben Leser in auth.js selbst: TOKEN_TRACE_DAYS (Definition 614, gelesen 640 und 642), TOKEN_PURPOSES (615, gelesen 653), LOG_DAYS ( | Die 7 Namen aus module.exports streichen und STATES (Zeile 149) ganz entfernen. Wenn STATES bleiben soll, dann als Grundlage der Pruefung in Zeile 337 | 3 |  |  |
| `server.js`:2966 | `v` wird nie gelesen. Die Antwort zwei Zeilen darunter (2969-2970) uebergibt nur `{ n }` an t(). `vocabulary()` (Zeile 1398-1414) liest dabei die Einstellung `vocabulary` aus der Datenbank, baut die Tafel je Sprache und laeuft ueb | Zeile 2966 und den Kommentar in Zeile 2967-2968 entfernen. | 3 |  |  |
| `public/app.js`:262 | Die beiden Zeichen für die Blätterpfeile sind gebaut, aber nirgends eingesetzt. Der Fuß des Eintrags zeichnet die Pfeile seit 0.28.1 mit den Schriftzeichen U+2039 und U+203A und nicht mit diesen Zeichen. | Die Zeilen 262 und 263 entfernen und den Kommentar in den Zeilen 256 bis 259, der sie erklärt, mit entfernen. `char()` bleibt, es trägt 17 weitere Zei | 2 |  | V |
| `public/app.js`:5971 | Zwei Stellen schreiben Marken in den Aufbau, die niemand liest: das Attribut `data-section` an den Abschnittsreitern und die Klasse `user-linkbox` am Kasten mit dem Einladungslink. Beide haben weder eine Regel im Stilblatt noch ei | In Zeile 5971 ` data-section="${esc(a.key)}"` streichen; die Adresse im `href` trägt denselben Schlüssel. In Zeile 7657 `user-linkbox` aus der Klassen | 2 |  |  |
| `attachments.js`:269 | attachments.js exportiert 16 Namen (Zeilen 269-274). 7 davon ruft niemand ausserhalb der Datei. Sie werden nur innerhalb von attachments.js benutzt: outType in 101, dispositionHeader in 106 und 158, findInZip in 252, extension in  | Die 7 Namen aus module.exports streichen. Die Funktionen und Konstanten bleiben stehen, sie werden in der Datei gebraucht. Der Export-Block geht von 6 | 2 | P |  |
| `server.js`:4021 | Jede Exportdatei traegt seit 0.33.0 das Feld appVersion (server.js:4021 im Umschlag, server.js:4175 im Rahmen, der die Paketgroesse rechnet). Gelesen wird es nirgends. Der Import prueft nur payload.version (server.js:4290-4294); a | Entweder einen Leser bauen (die Importvorschau in public/app.js:9262 koennte neben Anzahl, Datum und Titel auch sagen, welche Programmfassung die Date | 2 | P | V |
| `public/app.js`:6117 | app.js:6117 setzt `nm.className = 'ename'`. Fuer `.ename` gibt es in style.css keine Regel. Die Zeile steht in `drawLanguages()` und baut eine `.engine`-Zeile (app.js:6094). Zwei weitere Listen bauen dieselbe Zeilenform und setzen | In app.js:6117 `'ename'` durch `'engine-name'` ersetzen. Eine Zeile, keine neue Regel im Stilblatt. | 1 |  | V |
| `mail.js`:204 | mail.js exportiert 24 Namen (Zeilen 204-211). 3 davon ruft niemand ausserhalb der Datei: HINTS (Definition 30, gelesen 64 und 90), HINT_ALWAYS (35, gelesen 90), providerOf (56, gerufen 70, 83, 98, 110). Server und Dialog bekommen  | Die 3 Namen aus module.exports streichen. Die Definitionen bleiben, sie werden in mail.js gebraucht. Die oeffentliche Flaeche geht von 24 auf 21 Namen | 1 |  |  |
| `keys.js`:195 | keys.js exportiert 14 Namen (Zeilen 195-198). 3 davon ruft niemand ausserhalb der Datei: cleanNote (Definition 153, gerufen 181), TESTBENCH_MARK (23, gelesen 29 und 31), TESTBENCH_FLOOR (25, gelesen 47, 50, 62, 69). Von aussen ben | Die 3 Namen aus module.exports streichen. Die Definitionen bleiben, sie werden in keys.js gebraucht. | 1 | P |  |
| `db.js`:1266 | ownerId wird in db.js:1141 definiert, in db.js:1165 von assignInventory gerufen und in db.js:1275 exportiert. Ausserhalb von db.js gibt es keinen Treffer. server.js laedt db.js in Zeile 23 mit Destrukturierung und nimmt ownerId ni | Den Namen aus der Exportliste in Zeile 1275 streichen. Die Funktion bleibt, assignInventory braucht sie. | 1 |  |  |
| `server.js`:5299 | Die Route hat keinen Aufrufer. Sie ist in Zeile 5299 registriert, also hinter `app.use('/api', auth.requireAuth)` in Zeile 770, und antwortet ohne Sitzungscookie mit 401. public/app.js und public/index.html rufen sie nicht auf. De | Route entfernen. Wer sie behalten will, registriert sie vor Zeile 770; dann ist sie erreichbar und der Dockerfile-Kommentar wird gegenstandslos. | 1 |  |  |
| `server.js`:598 | Der Zweig wird nie wahr, und der Schluessel `server.accountGone` wird an dieser Stelle nie erzeugt. `auth.checkLogin` (auth.js:524-537) gibt eine Zeile nur zurueck, wenn Name und Passwort stimmen. Ein geloeschter Zugang traegt `pa | Ternaeroperator in Zeile 598 entfernen und fest `server.accountLocked` einsetzen. | 1 |  |  |
| `db.js`:459 | Die Spalte wird beim Hochladen (server.js:3237) und beim Einspielen (server.js:4609) geschrieben und an zwei Stellen gelesen: qAttachments (server.js:2300) legt sie in die Antwort von detail() (server.js:2637), und der Export nimm | Spalte entfernen und das Feld mime_type aus dem Anhangsteil des Austauschformats nehmen. Das ist eine Schemaaenderung (ALTER TABLE attachments DROP CO | 1 | P | V |
| `public/languages/de.json` | Kein einziger Schlüssel ist tot. **1155** Schlüssel stehen als exakter String in public/app.js, server.js oder public/index.html. **28** stehen nur in auth.js und mail.js (login.accountLocked, login.emailTaken, login.lastOwner, lo | Es gibt nichts zurückzubauen. Was fehlt, ist der Wächter: kein Prüfmodul misst die Deckung zwischen Sprachdatei und Quelltext. test/release_031.js:25  | 0 | P |  |

### Umstaendlich — 15 Stellen

| Stelle | Befund | einfacher | Zeilen | | |
|---|---|---|---:|---|---|
| `server.js`:4285 | importInto ist mit 372 Zeilen die laengste Funktion der Datei und erreicht Einrueckungstiefe 14. Sie macht drei Aufgaben hintereinander: Bildvarianten vorbereiten (Z4300-4369), Gewichte, Kaesten und Konflikte pruefen (Z4400-4448), | Erstens: die drei Closures auf eine Form bringen. findOrCreate(sel, ins, name, extra) mit den drei Statements einmal vor der Transaktion vorbereitet.  | 372 | P | V |
| `server.js`:3926 | entryAsBundle liest in einem Objektliteral zehn Tabellen. Vier davon ueber gehobene Statements: qCat (Z3939), qTags (Z3940), qLinks (Z3943), qTestDayTags (Z3947). Sechs davon ueber db.prepare an Ort und Stelle: test_days (Z3945),  | Die sechs Abfragen neben qCat, qTags, qLinks und qTestDayTags auf Modulebene heben, als qTestDaysFull, qRatingsFull, qCommentsFull, qCommentImages, qP | 75 | P |  |
| `public/app.js`:356 | Zwoelf Dialoge bauen dasselbe Geruest von Hand: div anlegen, className = 'backdrop', innerHTML setzen, an document.body haengen, done() erklaeren, Klick auf den Hintergrund schliesst, Escape schliesst, Listener abmelden, Fokus set | Ein Helfer modal({ html, onClose }) von etwa 15 Zeilen, der bd anlegt, anhaengt, die drei Schliesswege verdrahtet und den Listener an genau einer Stel | 71 | P | V |
| `public/app.js`:359 | 13 Dialoge bauen dasselbe Gerüst einzeln auf: div anlegen, class 'backdrop', innerHTML, an body hängen, Schließfunktion, Escape-Horcher, Horcher wieder abmelden, Klick auf den Hintergrund. Die Stellen sind public/app.js:359 (confi | Eine Funktion openModal(html, beimSchliessen), die den Knoten anlegt, den Escape-Horcher mit der Obersten-Prüfung anmeldet, ihn in JEDEM Schließweg ab | 70 | P | V |
| `server.js`:5060 | GET /api/backup (Z5060-5110) erreicht die groesste Einrueckungstiefe der Datei, 19 Ebenen bei 51 Zeilen. Der Grund sind drei getrennte res.json-Aufrufe (Z5095, Z5100, Z5107), die zum grossen Teil dieselben Felder tragen: place, db | Erstens: in GET /api/backup ein gemeinsames Grundobjekt bilden und die drei Rueckgaben daraus ableiten. const base = { place, dbBytes, durationSeconds | 63 | P |  |
| `server.js`:1753 | In PUT /api/settings stehen sechs Bloecke mit gleichem Aufbau: Wert aus req.body holen, mit Number oder String wandeln, gegen eine Liste pruefen, bei Fehlschlag mit 400 absagen, sonst putUserSetting mit JSON.stringify. Es sind fon | Eine Tabelle CHOICES mit einem Eintrag je Einstellung: cast (Number oder String), list (FONT_LEVELS, STRIP_LEVELS, THEME_LEVELS, LINK_ROW_LEVELS, lang | 61 | P | V |
| `public/app.js`:6492 *(zweimal gefunden)* | drawTheme (6492-6510), drawFont (6512-6529), drawStrip (6532-6550), drawLinkRows (7280-7296) und drawSearchNames (7298-7315) sind fünfmal dieselbe Funktion. Jede holt ihren Kasten über getElementById, leert innerHTML, läuft über e | Eine Funktion pillRow({ boxId, levels, get, set, label, key }), die die Reihe zeichnet und den Klick mit Zurücksetzen bei Fehlschlag abwickelt. Rund 1 | 55 | P | V |
| `public/app.js`:557 | Zehn Seiten vor der Anmeldung setzen denselben Rahmen einzeln zusammen: showSetup (557), showLogin (608), showSecondFactor (657), showRequest (704), showRequestThanks (752), showConfirm (764 und 787), showInvite (809, 835, 845). W | Eine Funktion loginPage(inhalt, errMsg), die räumt, die Klassen setzt, den Rahmen mit BRAND_LINE und der Fehlerzeile baut und den Titel setzt. Rund 12 | 39 | P | V |
| `public/app.js`:1394 | Der Server erkennt Markierungen mit einem Muster: MENTION_RX (server.js:2335), gelesen in mentionsIn() (server.js:2349-2360), und schreibt die Treffer nach comment_mentions. Der Browser bekommt die fertige Liste der Handgriffe, mu | Der Server kennt die Stellen bereits, waehrend er schreibt. Er koennte zu jeder Markierung den Zeichenversatz in comment_mentions ablegen und mitliefe | 30 | P | V |
| `server.js`:1553 | Fünf persönliche Einstellungen mit fester Stufenliste stehen zweimal im Quelltext. Einmal als Leser: linkRows (1439-1442), searchNames (1554-1557), fontSize (1560-1563), theme (1566-1569), strip (1577-1580) — je 4 Zeilen nach dems | Eine Tabelle PICK_SETTINGS mit fünf Zeilen (Schlüssel, Stufenliste, Umwandlung, Vorgabe, Meldungsschlüssel), ein Leser pick(userId, key) von rund 5 Ze | 26 | P | V |
| `public/app.js`:1901 | Welche Sortierungen es gibt, steht zweimal in public/app.js. In drawFilters ab Zeile 2619 als Tabelle SORT_BASES mit sieben Eintraegen (updated, title, rating, potential, tests, testavg, testlast), jeder mit Beschriftung, den beid | SORT_BASES auf oberste Ebene ziehen und jedem Eintrag den Lesezugriff mitgeben, zum Beispiel value: i => i.avgRating samt Angabe, wie ein fehlender We | 23 | P | V |
| `public/app.js`:897 | Die Vorraete der persoenlichen Einstellungen stehen Wort fuer Wort in beiden Dateien: BLOCK_DEFAULT (server.js:1357-1362 / public/app.js:897-902), BLOCKS_ALWAYS_OPEN (1366 / 904), CLOSED_BLOCKS (1367 / 905-906), sortArea() (1371-1 | Die Vorraete in GET /api/settings mitschicken, wie es dieselbe Antwort fuer andere Zahlen schon tut: viewsCap (server.js:1612), imageStores (1647), tr | 19 | P | V |
| `public/app.js`:1372 | Der Server faltet Nadel und Heuhaufen mit searchFold() aus db.js:833-835: toLowerCase(), U+0307 entfernt, U+0131 zu i, ss statt scharfem s. Dieselbe Funktion haengt als SQL-Funktion kkl() am Inhalt (db.js:841), faltet den Begriff  | Die Faltung in eine Datei legen, die beide laden. public/theme.js zeigt, dass public/ schon eine zweite Skriptdatei traegt (public/index.html:55); ein | 18 | P | V |
| `public/app.js`:5423 | Der Server benennt seine Grenzen und der Browser schreibt dieselbe Zahl noch einmal hin: 50 MB fuer Dateien (public/app.js:5423 gegen ATTACHMENT_MAX, server.js:3221), 6 Bilder je Kommentar (public/app.js:5660 gegen IMAGE_COUNT, se | Dieselbe Antwort, die die Zahlen schon liefert, um die weiteren erweitern: GET /api/settings schickt bereits viewsCap (server.js:1612), imageStores (1 | 10 | P | V |
| `public/app.js`:3293 | Der Server rechnet den Gesamtschnitt in totalAverage() (server.js:2522-2540): Summe aus Schnitt mal Gewicht, geteilt durch die Summe der Gewichte, auf eine Nachkommastelle gerundet. Der Vergleich im Browser rechnet dieselbe Formel | Der Server liefert je Kriterium bereits r.value (meine Stimme) und r.avg (der Schnitt aller). Er koennte daneben die fertige eigene Zahl liefern -- ei | 9 | P |  |

### Langsam — 21 Stellen

| Stelle | Befund | einfacher | Zeilen | | |
|---|---|---|---:|---|---|
| `public/style.css`:1 | public/style.css ist **300.635** Bytes gross. 409 Kommentarbloecke belegen davon **211.866** Bytes, das sind **70,5** Prozent; der Regeltext ist **88.769** Bytes. Der groesste einzelne Block steht ab Zeile 4798 mit 4.174 Bytes ueb | Kompression vor express.static setzen. Das ist eine Zeile und nimmt die Frage nach den Kommentaren weg: gezippt kosten sie 85.600 Bytes statt 211.866. | 4910 | P | V |
| `server.js`:4251 | Der gesamte Export steht dreimal gleichzeitig im Arbeitsspeicher. entryAsBundle() erzeugt je Blob einen Base64-String (funnel.take, Zeile 3888). exportEnvelope() gibt ein Objekt mit allen diesen Strings zurueck. res.json() ruft JS | Den Umschlag stueckweise schreiben: res.write() fuer den Kopf, je Eintrag ein eigenes JSON.stringify(), dann der Schluss. Die Spitze faellt damit auf  | 258 | P | V |
| `server.js`:4669 | Die Datei liegt viermal im Speicher. multer haelt sie als Buffer (memoryStorage, Zeile 4275). toString('utf8') macht einen String daraus. JSON.parse legt das Objekt mit allen Base64-Strings an. prepared (Zeile 4300, gefuellt in 43 | multer auf diskStorage stellen und die Datei eintragsweise lesen, dann liegt nur ein Eintrag im Heap. Ohne diesen Umbau helfen drei kleine Schritte: d | 70 | P | V |
| `server.js`:3945 | entryAsBundle() (server.js:3926-4001) wird je Eintrag gerufen und uebersetzt dabei fuenf SQL-Texte neu: Zeile 3945 (test_days), 3950 (ratings), 3954 (comments), 3973 (photos), 3995 (attachments). Zeile 3966 uebersetzt einen sechst | Die fuenf Texte als Modulkonstanten anlegen, genau dort, wo qTags, qLinks und qAttachments schon stehen (server.js:2300-2350). Die Kommentarbilder ueb | 70 | P |  |
| `public/app.js`:2785 | drawBody() ruft in Zeile 2785 drawTimeline(list). drawTimeline (Zeilen 2842 bis 2902) baut aus timelinePoints(list) eine Punktliste, sortiert sie, leert #timeline und erzeugt je Punkt einen Knopf mit drei Behandlerzuweisungen: onc | Eine Signatur der Liste merken (Laenge und Nummern) und nur neu zeichnen, wenn sie sich geaendert hat. Zusaetzlich die Punkte ueber einen Behandler am | 61 | P | V |
| `server.js`:3046 | 40 Dateien zu je 30 MB (limits.fileSize in Zeile 350) ergeben 1200 MB, die als Buffer in req.files liegen, bevor die erste Zeile des Rumpfes laeuft. Die Oberflaeche schickt ALLE ausgewaehlten Bilder in EINER Anfrage: public/app.js | diskStorage statt memoryStorage: dann liegt nur der gerade verarbeitete Buffer im Heap, der Rest im Dateisystem. Ohne diesen Umbau: die Zahl in upload | 32 | P | V |
| `server.js`:4722 | Beim Loeschen eines Eintrags (DELETE /api/items/:id, Zeile 3038) laeuft entryAsBundle() innerhalb von db.transaction(). funnelStore() sammelt jedes Blob des Eintrags als Buffer in collector; erst danach schreibt collector.forEach( | Die Bytes nicht durch Node fuehren, sondern je Traegertabelle eine Anweisung: INSERT INTO trash_bytes (trash_id, part, data) SELECT ?, ?, data FROM ph | 18 | P |  |
| `public/app.js`:5936 | `renderSystem()` holt zwölf Endpunkte in einem `Promise.all`, unabhängig davon, welcher Abschnitt offen ist. Gezeichnet werden nur die Karten des offenen Abschnitts. Beim Abschnitt „Installation" bleiben 7 der 12 Antworten ungeles | Zuerst die vier Abrufe holen, die immer gebraucht werden (`requests`, `log`, `mailStatus`, `trash`), daraus `visibleOnes` und `open` bestimmen, und er | 13 | P | V |
| `server.js`:3227 | 20 Dateien zu je 50 MB (ATTACHMENT_COUNT in Zeile 3222, ATTACHMENT_MAX in 3221) ergeben 1000 MB in req.files. Die Pruefung, ob der Eintrag ueberhaupt noch Platz hat, steht in Zeile 3233 und damit NACH dem Einlesen. Ein Eintrag, de | Die Zaehlung in ein eigenes Middleware vor attachmentUpload.array() ziehen. Die Eintragsnummer steht im Pfad, die Abfrage braucht keine einzige Datei. | 10 | P | V |
| `server.js`:371 | Beide Helfer enthalten das db.prepare im Rumpf: server.js:372 fuer settings, server.js:419 fuer user_settings. Jeder Aufruf uebersetzt den Text neu. GET /api/settings (server.js:1600-1652) ruft sie mindestens 29 Mal: 12 Mal getUse | Zwei vorbereitete Abfragen auf Modulebene statt der beiden Rumpf-prepare -- zwei geaenderte Zeilen. Dazu eine Map je Anfrage fuer die gelesenen Schlue | 10 | P | V |
| `test/selfcheck.js`:37 | Die Schleife in Zeile 33 bis 39 liest fuer jeden Rueckbau mit Suchtext seine Datei neu ein (Zeile 37) und legt danach ein split() ueber den ganzen Inhalt. Es sind 996 Durchgaenge auf nur 32 verschiedene Dateien: counterproof.js 6- | Den Inhalt je Pfad in einer Map halten und jede Datei einmal lesen. Der Rest der Schleife bleibt unveraendert, die Pruefung in Zeile 40 ebenso. | 7 | P |  |
| `server.js`:3135 *(zweimal gefunden)* | GET /api/photos/:id/raw liest mit SELECT * alle drei Blobs der Zeile, auch wenn nur ?size=thumb oder ?size=medium verlangt ist. Bei einer Videozeile sind das bis zu 20 MB (VIDEO_MAX, Zeile 3077) fuer eine Kachel von etwa 200 kB. D | Spalten benennen statt *. Den vollen Gewinn bringt erst eine Nebentabelle photo_bytes fuer data; die Bauform steht im Repository schon, trash und tras | 5 | P |  |
| `public/app.js`:3001 | Der Klickbehandler am .pick-box eines Kartenfusses (Zeilen 2998 bis 3002) nimmt eine Nummer in state.compare auf oder heraus und ruft dann drawBody(). Dasselbe in Zeile 3032 fuer das Leeren der Auswahl. Von state.compare haengen g | Klasse am angeklickten <a> und am Knopf umschalten, den Titel des Knopfes neu setzen, drawCompareBar() aufrufen. Vier Zeilen. Fuer state.compare.clear | 5 | P | V |
| `db.js`:145 | Die Spaltenfolge ist id, item_id, mime_type, data, thumb, medium, kind, ... Die Kachel steht damit HINTER dem Original. Sie laesst sich nicht lesen, ohne die Overflow-Kette von data zu durchlaufen und zu entschluesseln. Bei kind = | Die beiden Ableitungen in eine eigene Tabelle legen, zum Beispiel photo_derivatives(photo_id INTEGER PRIMARY KEY REFERENCES photos(id) ON DELETE CASCA | 3 | P | V |
| `server.js`:2300 | qAttachments liest sort_order, created_at und user_id. Alle drei stehen in attachments hinter data (db.js:461), und data ist bis 50 MB gross (ATTACHMENT_MAX, server.js:3221). idx_attachments_item (db.js:466) traegt nur item_id und | CREATE INDEX IF NOT EXISTS idx_attachments_tile ON attachments(item_id, sort_order, id, filename, mime_type, size, created_at, user_id) -- dieselbe Ba | 2 |  |  |
| `server.js`:2403 | detail() (server.js:2606-2686) setzt rund 15 feste Abfragen ab. Dazu kommen zwei Schleifen. Zeile 2403 in qComments() holt die Bilder mit qCommentImages.all(c.id) je Kommentar. Zeile 2557 in qTestDays() holt die Schlagworte mit qT | Die Bauform steht zwei Zeilen darueber schon da. qMentionsOfItem (server.js:2375) holt die Markierungen des ganzen Eintrags in EINER Abfrage mit JOIN  | 2 | P |  |
| `server.js`:2429 | PHOTO_VERSION = 'length(thumb) AS thumbLength' wird in qPhotos (server.js:2430) und qAllPhotos (server.js:2433) an PHOTO_COLUMNS angehaengt. length(thumb) steht nicht in idx_photos_tile (db.js:1060). SQLite faellt deshalb auf idx_ | idx_photos_tile in db.js:1060 um den Ausdruck length(thumb) erweitern: ON photos(item_id, sort_order, id, mime_type, focus_x, focus_y, zoom, created_a | 1 | P |  |
| `server.js`:3298 | Die Route liest SELECT * FROM photos WHERE id = ?. Gebraucht wird aus der Zeile nur item_id -- in Zeile 3299 fuer entryFree, in 3302 fuer die Neunummerierung und in 3305 fuer touch. SELECT * zieht data, thumb und medium mit. Bei e | SELECT item_id FROM photos WHERE id = ?. item_id ist Spalte 2 und steht vor allen Blobs. Gemessen 0,00 ms statt 82,01 ms. Eine Zeile, keine Migration, | 1 |  |  |
| `db.js`:338 | Der einzige Index auf ratings ist das UNIQUE ueber (item_id, criterion_id, user_id) in db.js:338. criterion_id steht an zweiter Stelle und ist von links nicht greifbar. qCriteria (server.js:1927-1931) zaehlt je Kriterium COUNT(DIS | CREATE INDEX IF NOT EXISTS idx_ratings_criterion ON ratings(criterion_id, value, item_id). Gemessen 14,2 ms statt 73,6 ms, Plan 'SEARCH r USING COVERI | 1 |  |  |
| `public/app.js`:5535 | Zeile 5536 ersetzt den Knopf .cmt-due durch ein Datumsfeld. Zeile 5535 setzt dessen onblur auf drawComments(). Verliert das Feld den Fokus, ohne dass jemand ein Datum gewaehlt hat, aendert sich kein Datenstand und es geht keine An | field.replaceWith(dueButton). Eine Zeile. Der Weg ueber drawComments() bleibt fuer onchange (Zeile 5534) noetig, wo sich der Datenstand wirklich aende | 1 |  | V |
| `server.js`:2897 | Die Route buendelt alles ausser einer Sache. 18 Aufrufstellen liegen ausserhalb der Schleife und ergeben rund 20 Abfragen. Zeile 2897 setzt eine weitere Abfrage je Eintrag ab: qTestStats (server.js:2587) bekommt item_id zweimal, w | testCount, testAvg und testLast in testDaysPerEntry aus den ohnehin gelesenen Zeilen rechnen -- die Sortierung liefert die letzte Note als erstes Elem | 1 | P |  |

### Besser — 5 Stellen

| Stelle | Befund | einfacher | Zeilen | | |
|---|---|---|---:|---|---|
| `test/dom.js`:1316 | In den Modulen unter test/ stehen 626 feste Wartezeiten der Form await new Promise(r => setTimeout(r, N)), zusammen 62635 ms nominal: 155-mal 80 ms, 115-mal 60 ms, 101-mal 40 ms, 80-mal 20 ms, 39-mal 30 ms. Die 155 Stellen mit 80  | Neben waitSearch eine Funktion bis(w, bedingung, grenzeMs) in test/dom.js, die in 5-ms-Schritten fragt und beim Erreichen der Grenze rot wird statt st | 626 | P |  |
| `server.js`:249 | errorText(req, e) in server.js:249-251 liefert t(locale, 'server.errorUnknown'), sobald e kein Feld key traegt. In public/languages/de.json:1233 steht dafuer "Unbekannter Fehler". Die 15 catch-Bloecke, die diese Funktion rufen, sc | Zwei Schritte. Erstens in errorText ein console.error(e) fuer den Fall ohne key, damit der Betreiber den echten Fehler ueberhaupt sieht. Zweitens in c | 15 |  |  |
| `server.js`:3053 | In server.js:3053-3066 laeuft die Schleife ueber req.files und prueft, wandelt und schreibt jede Datei in einem Durchgang. Scheitert gridImage bei der fuenften von zehn Dateien, steht in Zeile 3055 ein return res.status(400) -- di | Dieselbe Bauform wie encodeAll: erst alle Dateien pruefen, ableiten und in eine Liste legen, dann in einer db.transaction schreiben. Eine ungeeignete  | 14 | P | V |
| `public/app.js`:7420 | Die Zahl der eigenen Suchplätze steht dreimal. server.js:1458 als benannte Konstante OWN_SLOTS = 3, gelesen in server.js:1479 und server.js:1798. public/app.js:7420 als festes Array [1, 2, 3] in sendOwn(). public/style.css:1757 al | Die Zahl einmal vom Server holen — sie steht schon in der Antwort von /api/settings, weil searchPool() für jeden Platz einen Eintrag mit own: true lie | 3 | P |  |
| `public/app.js`:4996 | Zwei Texte der Oberfläche stehen als deutsches Wort im Skript statt in der Sprachdatei. public/app.js:4988 setzt `x.title = `${V.ratingOne} entfernen`` und public/app.js:4996 setzt `toast(`${V.ratingOne} entfernt`)`. Das Vokabelwo | Zwei Schlüssel anlegen, etwa entry.removeRating und entry.ratingRemoved, beide mit dem Platzhalter {ratingOne}, und die zwei Stellen auf t() umstellen | 2 | P | V |

### Widerlegt — nicht in die Runde

**26 Befunde** halten der Widerlegung nicht stand. Eine Widerlegung sagt,
dass *dieser* Befund in *dieser* Form nicht haelt — nicht, dass an der Stelle
nichts ist.

| Stelle | Befund | warum er nicht haelt |
|---|---|---|
| `test/source.js`:1199 | Der Waechter sammelt die Daten fuer die Probe bereits ein un | Der Kern des Befunds stimmt, der tragende Teil des Vorschlags nicht.  Was ich bestaetigen kann: 1. test/source.js:1199 bis 1215 baut die Menge `shapes` und prueft daran nur zwei Dinge: `isGerman` je Name (Zeile 1212 bis  |
| `public/app.js`:581 | Sieben fetch-Blöcke am api()-Helfer vorbei | Der Zählteil des Befundes stimmt, die Begründung und der Vorschlag nicht.  BESTÄTIGT: Sieben POST-Blöcke mit identischem Gerüst an public/app.js:581, 631, 674, 732, 770, 816, 869. Die Zeile "method: 'POST', credentials:  |
| `server.js`:2015 | 193-mal t(localeOf(req), …) statt einmal req.t | Die Zählungen stimmen, der Vorschlag nicht. Nachgerechnet: 193 Vorkommen von 't(localeOf(req),', 249 Vorkommen von 'localeOf(req)' auf 247 Zeilen, 13 eingerückte Fortsetzungszeilen. server.js:2015-2016 ruft localeOf(req) |
| `server.js`:2314 | qCommentImages | Die Beschreibung des Codes stimmt, die Zahlen und die Begruendung dahinter nicht.  Richtig ist: qCommentImages (server.js:2314) liest id, filename, sort_order. sort_order steht in comment_images hinter data und thumb (db |
| `batchrun.js`:92 | Der Kachellauf beim Start sieht jede Fotozeile ganz an | Die Beobachtung stimmt, der Vorschlag trägt nicht.  Richtig beschrieben: server.js:468 wählt `SELECT id FROM photos`, also alle Zeilen. server.js:5347-5350 startet damit den Thread. batchrun.js:91-92 liest je Zeile `SELE |
| `test/roundtrip.js`:242 | 625 feste Wartestellen im Pruefstand | Die Zaehlung stimmt, die Folgerung und der Vorschlag halten nicht.  1. Zaehlung bestaetigt. Ueber test/*.js stehen 625 Stellen der Form `new Promise(r => setTimeout(r, N))`, Summe der Zahlen 59.635 ms. Das habe ich nachg |
| `server.js`:524 | reclaim() nach jedem einzelnen Loeschen | Die Beobachtung stimmt, der Vorschlag traegt nicht.  1. Die Arbeit faellt an. reclaim() steht in server.js:524 und wird ohne Bedingung aus vier Anfragewegen gerufen: server.js:3039 (Eintrag), 3285 (Anhang), 3306 (Foto),  |
| `server.js`:4711 | Das Aufraeumen haengt daran, dass ein Admin eine Karte oeffn | Der Befund ist in seiner Aufzaehlung falsch und faellt deshalb.  1. cleanupRequests() hat nicht zwei, sondern vier Aufrufstellen. Der Finder nennt server.js:4719 und server.js:1276. Es fehlen auth.js:752 in createRequest |
| `server.js`:3726 | /api/stats erzwingt bei jedem Abruf einen WAL-Checkpoint | Der Befund haelt nicht. Weder die Kosten noch der Vorschlag tragen.  1. Die Arbeit faellt nicht in der beschriebenen Hoehe an. Gemessen an einer SQLCipher-Datenbank mit denselben Pragmas wie db.js:15-21: wal_autocheckpoi |
| `public/app.js`:1322 | searchTemplateOk steht zweimal und ist auseinandergelaufen | Der Textbefund stimmt, die Folgerung nicht. Richtig ist: server.js:1465-1467 prüft drei Bedingungen, public/app.js:1322-1324 nur zwei; die Grenze `v.length <= 300` fehlt im Browser. Falsch ist die daraus gezogene Folge " |
| `public/app.js`:1772 | runSearch: drawBody() vor der Antwort | Die Messung des Finders stimmt, seine Begruendung nicht. Der Aufruf von drawBody() in Zeile 1772 aendert am Bildschirm drei Dinge, nicht zwei.  Erstens die Hervorhebung. card() liest in Zeile 2945 `const term = state.sea |
| `public/app.js`:3186 | renderOpen draw(): vier Durchlaeufe ueber dieselbe Liste | Die Codebeschreibung stimmt, die Begruendung als LANGSAM-Befund nicht.  Richtig ist: public/app.js:3186 laeuft ueber die vier Abschnitte aus SECTIONS (3157), 3187 filtert je Abschnitt die ganze Liste erneut. Vier Durchla |
| `public/app.js`:3054 | similarEntries(): titleCore ueber den ganzen Bestand bei jed | Der beschriebene Mechanismus stimmt in Teilen, die Zahlen des Finders messen ihn aber nicht.  Was stimmt: Zeile 3087 haengt drawSimilar ohne Debounce an das input-Ereignis. Zeile 3080 und 3083 schreiben row.innerHTML bei |
| `server.js`:3135 | GET /api/photos/:id/raw | Der beobachtete Sachverhalt stimmt, die Begruendung nicht. Drei Punkte widerlegen den Befund in der vorgetragenen Form.  1. Die Hauptzahl ist falsch. Der Finder schreibt, fuer ein Standbild von wenigen Kilobyte wuerden " |
| `server.js`:2728 | qFulltext -- die sieben Quellen stehen zweimal in derselben  | Der Befund haelt nicht. Zwei Gruende.  1. Der Vorschlag bringt gemessen nichts. SQLite flacht die innere Abfrage ab (Query Flattener) und setzt die Ausdruecke wieder in das aeussere WHERE ein. Die Zahl der kkl-Aufrufe is |
| `server.js`:1877 | PUT /api/settings baut die Antwort von GET /api/settings ein | Die Doppelung gibt es, aber der Befund ist in seinen Zahlen falsch und sein Vorschlag ist nicht dasselbe.  1. Schluesselmengen falsch gezaehlt. Gemeinsam sind nicht 20, sondern **25** Schluessel. Der Finder nennt imageSt |
| `server.js`:1758 | 166 Fehlerrueckgaben schreiben dreimal dasselbe hin | Die beiden Zahlen des Finders stimmen: 166 Stellen der Form und 247 Aufrufe von localeOf(req). Drei tragende Aussagen darum herum stimmen nicht, und die vorgeschlagene Form spart keine Zeile.  1. Die Aussage zur Klasse M |
| `testbench.js`:101 | Die 17 Module laufen hintereinander, obwohl vier Nebenspuren | Die Beobachtung stimmt, der Vorschlag traegt nicht.  Richtig ist: runModule() startet mit spawnSync (testbench.js:19) und die Schleife testbench.js:101-109 wartet auf jedes Modul. 17 Module laufen hintereinander, jedes m |
| `test/ui_export.js`:272 | Die teuerste Gruppe des Laufs wartet auf die Uhr, obwohl dre | Die Beschreibung der Schleife ist falsch, und der Vorschlag spart keine Zeit.  1. tzCode wartet nicht, bis der Schritt nowStep()+1 erreicht ist. Die Bedingung in test/ui_export.js:274 lautet "ZF2.nowStep() + 1 > tzUsed", |
| `counterproof.js`:8811 | Die Gegenprobe vergleicht nie, ob der rote Punkt dort steht, | Der Kern der Beobachtung stimmt: In counterproof.js wird e.expected genau einmal gelesen, in Zeile 8811, und nur gedruckt. Kein Vergleich gegen die tatsaechlich roten Gruppen. Trotzdem haelt der Befund in dieser Form nic |
| `db.js`:1060 | idx_photos_tile wird nie gewaehlt | Der Befund nennt idx_photos_tile "tot" mit der Begruendung, der Abfrageplaner nehme ihn nie. Das ist falsch. Er wird genommen, und zwar von /api/items/:id/inventory in server.js:3019 und server.js:3020.  Gemessen an eine |
| `db.js`:1242 | settings-Schluessel versionCreated wird geschrieben und nie  | Die Tatsachenbehauptung stimmt, die Einordnung als "tot" nicht.  Nachgeprüft und bestätigt: `versionCreated` hat im laufenden Programm keinen Leser. grep über das gesamte Repository ohne node_modules findet nur db.js:122 |
| `db.js`:799 | trash_bytes.id wird nie gelesen | Die Beobachtung stimmt teilweise, der Vorschlag nicht. Nachgeprüft:  1. Kein Produktivcode liest trash_bytes.id. Bestätigt: grep -rn "trash_bytes" über db.js, server.js, auth.js, keys.js, keytool.js zeigt nur INSERT (ser |
| `public/app.js`:3715 | renderDetail | Die Messung stimmt, der Vorschlag nicht. Deshalb haelt=false.  BESTAETIGT. Ich habe functionLengths() aus test/selfcheck.js Zeile 355 nachgebaut und auf public/app.js angewandt. Ergebnis identisch: 187 Funktionen, render |
| `public/app.js`:2385 | drawFilters | Der Befund haelt nicht, weil seine zentrale Zahl falsch gemessen ist.  1. "Vierzehn Pillenknoepfe" ist falsch. Es sind neun. Der Finder hat mit `grep -c "className = 'pill"` gezaehlt, und dieses Muster trifft auch `class |
| `public/app.js`:7161 | drawPreview | Der Befund hält nicht. Zwei Gründe.  1. Die Kernbehauptung ist falsch. Der Auspacker ist nicht Zeile 7161 bis 7174, sondern `vFields()` in Zeile 7154/7155: `const vFields = () => Object.fromEntries(VOCABULARY_FIELDS.map( |
