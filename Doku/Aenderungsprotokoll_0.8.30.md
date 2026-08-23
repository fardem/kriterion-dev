# Änderungsprotokoll 0.8.30 — „Die Linkliste bekommt Verfasser" (Stufe G4)

**Rohstoff für die Dokumentenpflege. Projektstand, Konzeptpapier, Ideenpapier
und README sind nicht angefasst.**

**0.8.30 — Fingerprint `f498cbda`**

Der Fingerprint ist **zuletzt** gebildet worden, nach der letzten Änderung an einer
ausgelieferten Datei — die Versionsnummer in `package.json` eingeschlossen, denn
`server.js` lädt sie und sie steht damit in seiner Ableitung. Diese Runde fasst
`db.js`, `server.js`, `auth.js`, `public/app.js` und `public/style.css` an; alle
fünf deckt er. `pruefung.js` bewegt ihn nicht — es wird weder geladen noch
ausgeliefert. Zweimal unabhängig gerechnet (laufender Server über `/api/stats`
und Nachrechnung über dieselbe Ableitung).

> **Der Fingerprint ist einmal weitergerückt, und das gehört dazu.** Der erste
> Stand trug `6302a4b1`; mit ihm ist der Container gebaut und geprüft worden
> (Abschnitt 7). Danach kam die Berichtigung am Bildschirm dazu (Abweichung F)
> — sie fasst `public/app.js` und `public/style.css` an, und damit ändert sich
> der Fingerprint: **`f498cbda`.** Genau dafür ist er gebaut. Die Versionsnummer
> bleibt `0.8.30`: der erste Stand ist nie eingespielt worden, und eine Zahl
> für einen Stand zu verbrauchen, den niemand betrieben hat, wäre eine Lücke
> in der Versionsgeschichte. **Auf dem Server erwartet wird `f498cbda`.**

Gebaut wurden **alle fünf Auftragspunkte**. Der Haltepunkt nach Punkt 4 ist
erreicht und steht als eigener Commit in der Historie.

Prüfungen: **1548 → 1624** (76 neue), alle grün. **31 Gegenproben**, jede in
einer Kopie des Arbeitsbaums (Stolperstein 100).

`F_ROUTEN` bleibt bei **46** Routen. Es ist keine schreibende Route entstanden;
**eine** hat ihre Art gewechselt — nicht zwei, wie der Auftrag annimmt
(Abweichung A).

**Erste Datenbankstufe seit 0.8.3.** Für „Vorgemerkt für 1.0" fällt aus dieser
Version ein markierter Block an: `migration0830()` ist der **zweite**
Migrationscode im Projekt.

---

## 1. Was gebaut wurde, je Datei

### `db.js` (+49/−6 Zeilen)

**Die `links`-Tabelle trägt `user_id INTEGER REFERENCES users(id) ON DELETE SET
NULL`** — dieselbe Form wie an den vier anderen Trägern, in der vollständigen
DDL. Ausdrücklich **nicht** `NOT NULL`: der Grabstein hält die Nummer zwar am
Leben, aber die Spalte muss den Fall aushalten, in dem eine Zeile in `users`
doch verschwindet. (Sie *könnte* auch gar nicht `NOT NULL` sein — siehe
Stolperstein 105.)

**`migration0830()`**, gebaut wie `migration083()` und mit denselben Marken.
`PRAGMA table_info(links)` entscheidet, ob überhaupt etwas zu tun ist; einmalig,
wiederholbar und im Normalfall stumm. Die Bestandszeilen fallen an den
**Eintragsverfasser**:

```sql
UPDATE links SET user_id = (SELECT user_id FROM items WHERE items.id = links.item_id)
 WHERE user_id IS NULL
```

**`ordneBestandZu()` nimmt `links` auf** — als fünfte Tabelle, samt der Zahl in
der Protokollzeile und im Frührückgabewert. Das ist die **zweite, andere Regel**,
und beide stehen im Quelltext nebeneinander erklärt: die Migration beantwortet
einmalig, wem die Links eines *bestehenden* Eintrags gehören (seinem Verfasser);
das Netz beantwortet fortlaufend, wem eine Zeile zufällt, die ihren Verfasser
*verloren* hat (dem Eigentümer). Verschiedene Zeitpunkte, verschiedene Fragen —
kein Widerspruch, aber ohne die Erklärung läse der Nächste einen.

### `server.js` (+72/−13 Zeilen)

- `qLinks` holt `created_at` und `user_id` mit.
- `detail()` hängt `verfasser` und `mine` an jede Linkzeile und entfernt die
  nackte Nummer — dieselbe Handvoll Zeilen wie am Kommentar.
- **`POST /api/items/:id/links` verliert `nurEintragVerfasser`** und schreibt
  `req.benutzer.id` in die neue Spalte.
- **`DELETE /api/links/:id` klemmt auf `darfAendern(req, l.user_id)`** statt auf
  `eintragFrei(req, res, l.item_id)`: die Frage nach der *Zeile* statt nach dem
  *Eintrag*. Meldung ist `VERWEIGERT_SELBST` — dieselbe wie an Bewertung und
  Kommentar, denn es ist dieselbe Regel.
- **`PUT /api/items/:id/link-order` bleibt unverändert** hinter
  `nurEintragVerfasser`, jetzt mit dem Grund im Quelltext.
- **Export:** `links: [{ url, author }]` statt nackter Strings,
  **Formatnummer 6 → 7**.
- **Import:** liest beide Formen. Die Nummer des Eintragsverfassers wird
  **einmal** ermittelt und festgehalten (`itemVerfasser`) — ein zweiter Aufruf
  von `verfasser()` zählte den Fremdverweis doppelt.
- `GET /api/items/:id/bestand` nennt `eigenLinks`/`fremdLinks` statt einer
  Zahl `links`.

### `auth.js` (+8/−1 Zeilen)

`zaehleBestand()` bekommt beide Richtungen: `fremdLinks` (fremde Links an seinen
Einträgen) und `links` (seine Links in fremden Einträgen). Und
**`entferneZugang()` räumt sie beim zweiten Häkchen wirklich mit weg** — das
steht so nicht im Auftrag, folgt aber zwingend: der Dialog sagt „mitlöschen",
und eine Zahl darin, die nichts bewirkt, wäre schlimmer als keine
(Abweichung C).

### `public/app.js` (+58/−8 Zeilen)

`drawLinks()` zeigt den Namen und richtet das ✕ nach dem Recht. Beide
Löschdialoge nennen Links jetzt getrennt nach eigen und fremd.

### `public/style.css` (+10/−0 Zeilen)

`.lunten` — die zweite Zeile der Linkzeile als Flex-Paar: Pfad bzw.
Anbieternamen dehnbar und abschneidbar, der Name unverkürzbar. Nicht im Auftrag
vorgesehen und trotzdem nötig (Abweichung B).

### `pruefung.js` (+588/−29 Zeilen)

Neue Gruppen, umgedrehte Prüfungen, der Migrationsabschnitt — Einzelheiten in
Abschnitt 5.

### `package.json` (+1/−1), `package-lock.json` (+2/−2)

Version auf `0.8.30`, Lockfile über `npm install --package-lock-only`
nachgezogen.

---

## 2. Abweichungen und Entscheidungen

### A. In `F_ROUTEN` wechselt **eine** Art, nicht zwei

Der Auftrag sagt: „`F_ROUTEN` bleibt bei 46 Routen, aber **zwei** Einträge
wechseln ihre Art." Im Quelltext ist es einer.

`POST /api/items/:id/links` geht von `'nurEintragVerfasser'` auf `'offen'`.
`DELETE /api/links/:id` stand schon auf `'im Rumpf'` und **bleibt** darauf: die
Art sagt nur, *dass* eine Klemme im Rumpf steht, nicht *welche*. `eintragFrei(`
und `darfAendern(` stehen beide in `RUMPF_WOERTER`.

**Die Wende wäre damit für `F_ROUTEN` unsichtbar gewesen.** Antwort darauf: zwei
eigene Quelltextprüfungen am Rumpf beider Linkrouten, gebaut wie die vorhandene
an `DELETE /api/comment-images/:id` — die eine hält fest, dass dort
`darfAendern(req, l.user_id)` steht und `eintragFrei(` **nicht mehr**, die
andere, dass der `INSERT` die Spalte `user_id` füllt.

### B. Die Linkzeile braucht eine neue Stylesheet-Regel

Der Auftrag nennt vier Dateien im Fingerprint; `public/style.css` kommt hinzu.

Grund: `.path` und `.snamen` schneiden mit `text-overflow: ellipsis` ab. Ein
langer Pfad hätte den Namen vollständig aufgefressen — und damit genau die
Angabe, um derentwillen die Zeile ihn trägt. Die zweite Zeile wird deshalb ein
Flex-Paar. Die Datei stand ohnehin im Fingerprint; sie ist hier nur ausdrücklich
genannt.

### C. `entferneZugang()` löscht die Links mit

Der Auftrag verlangt nur, dass `zaehleBestand()` sie **zählt**. Zählen ohne
Löschen hieße: der Dialog nennt „12 Links", der Haken sagt „mitlöschen", und
danach stehen sie noch da. Das wäre eine Lüge im Dialog. Ein `DELETE FROM links
WHERE user_id = ?` steht deshalb bei Kommentaren, Bewertungen und Testtagen
daneben.

### D. Der Name steht nur an **fremden** Zeilen

Auftrag und Konzeptpapier sagen: „ab zwei Zugängen steht **sein Name** an der
Zeile." Gebaut ist es enger, auf ausdrückliche Entscheidung im Gespräch:

```
Name sichtbar  ⟺  mehrereBenutzer()  UND  Link-Verfasser ≠ Eintragsverfasser
```

Begründung: bei den vier anderen Trägern steht jede Zeile für sich, die
Linkliste ist eine Liste vieler kurzer Zeilen. Ein Name an jeder wäre Rauschen;
an der einen fremden ist er die Auskunft. An einer Zeile, die der Verfasser des
Eintrags selbst eingetragen hat, wiederholte der Name nur, was oben am Eintrag
ohnehin steht.

**Folge, die man kennen muss:** „kein Name" heißt bei mehreren Zugängen „vom
Verfasser des Eintrags". Der Satz steht im Quelltext an genau einer Stelle, bei
der Regel.

Randfälle: eine herrenlose Zeile an einem Eintrag mit Verfasser ist „fremd" und
zeigt „Ohne Verfasser" — eine Zeile ohne Verfasser ist eine Auskunft. Herrenlos
an herrenlos zeigt nichts; da ist niemand zu nennen. Verglichen wird über die
**Nummer**, nicht über den Namen: ein Grabstein hat keinen mehr.

### E. Das Datum steht im Überfahrtext, nicht in der Zeile

Auf ausdrückliche Entscheidung im Gespräch. Die Zeile ist auf dem Handy am
Anschlag; `pfad · name · 12.03.2026` fräße den Pfad vollständig. Sichtbar bleibt
der Name, das Datum steht im `title` der Zeile: „Eingetragen von user1 am
12.03.2026", hinter dem bisherigen Überfahrtext.

**Der Preis ist benannt und angenommen:** auf einem Berührbildschirm gibt es
kein Zeigen, dort ist das Datum nicht erreichbar. Der Auftrag warnt zu Recht
davor, den *Namen* im `title` zu verstecken — der bleibt sichtbar, ins
Verborgene geht nur das Datum.

### F. Der Name steht in Klammern, ohne Trennzeichen — berichtigt am Bildschirm

**Gebaut war zuerst etwas anderes**, und das gehört hierher, weil es der
lehrreichere Teil ist: ein Mittelpunkt an der Adresszeile, ein Gedankenstrich
an der Suchzeile, und `flex: 1 1 auto` am Pfad. Die Überlegung dahinter war
richtig — in der Suchzeile bedeutet „ · " bereits „noch ein Anbieter,
anklickbar", also braucht der Name dort ein anderes Zeichen.

**Am Bildschirm war es trotzdem falsch, und zwar doppelt.** Der Pfad nahm sich
die volle Breite und schob den Namen ans **rechte Ende** der Zeile — dort
gehörte er zu nichts mehr, er hing einfach da. Und der Strich davor las sich
wie ein abgerissener Satz statt wie eine Zugehörigkeit.

**Jetzt: `(chefin)`, an beiden Zeilenarten gleich, ohne Trennzeichen, direkt
hinter dem Pfad** (`flex: 0 1 auto` — der Pfad nimmt sich nur, was er braucht,
und darf weiterhin schrumpfen; der Name nicht). Die Klammer sagt von selbst,
dass hier eine **Angabe über** die Zeile steht und kein weiterer Teil von ihr,
und sie trägt jede Form, die `verfasserName()` liefert: `(chefin)`,
`(Gelöschter Benutzer 4)`, `(Ohne Verfasser)`.

**Warum kein „von" davor**, was am deutlichsten gewesen wäre: es komponiert
nicht. „von Ohne Verfasser" ist kein Deutsch, und eine Fallunterscheidung
zwischen echten Namen und Ersatzbeschriftungen wären zwei Formen für dieselbe
Sache — genau das, was das Projekt an anderer Stelle vermeidet.

**Das ist der Fall aus Projektstand Abschnitt 7:** *was der Prüfstand nicht
kann, ist Aussehen.* Die Prüfungen waren grün, die Regel war entschieden und
begründet, und das Ergebnis war trotzdem unbrauchbar. Zum dritten Mal nach der
leeren PDF-Vorschau und dem unsichtbaren Löschkreuz (Stolpersteine 29 und 30).

### G. Kein neuer Vokabeleintrag, keine neue Verweigerungsmeldung

„Link" ist kein Wort des Vokabulars und wird auch keines. Und `DELETE
/api/links/:id` bekommt keine eigene Meldung, sondern `VERWEIGERT_SELBST` — es
ist dieselbe Regel wie an Bewertung und Kommentar, und eine fünfte Meldung
dafür wäre eine zweite Wahrheit.

### H. Ein gelöschter Link bekommt keinen Vermerk

Wie im Konzeptpapier festgelegt, hier nur bestätigt: ein gelöschter Link ist
eine ganze Aussage, die geht, kein Loch in einer bleibenden. Der
Eingriffsvermerk bleibt auf den einen Fall begrenzt, für den er beschlossen
wurde.

### I. „Vorgemerkt für 1.0" stand erst hier, dann im Projektstand

Der Auftrag sagt an einer Stelle „der markierte Block bekommt **sofort** seinen
Eintrag im Projektstand" und am Schluss „Projektstand … **nicht anfassen**".
Aufgelöst wie in 0.8.20: der Eintrag stand zunächst fertig in Abschnitt 6
dieses Protokolls.

**Inzwischen ist die Dokumentenpflege gelaufen** und der Eintrag steht im
Projektstand, Abschnitt 10, unter „Vorgemerkt für 1.0" — zusammen mit dem
Hinweis, dass `links` in `ordneBestandZu()` ausdrücklich **nicht** mitfällt.

---

## 3. Neue Stolpersteine

**101. Eine Gegenrichtung wird an beiden Orten geprüft — Rumpf *und*
Routenzeile.** Der Wächter über den Quelltext prüfte bei der Art `'offen'` nur,
dass im **Rumpf** keine Klemme steht. Ein Wächter, der in die **Routenzeile**
zurückwandert, blieb ihm unsichtbar: die Gegenprobe „`nurEintragVerfasser`
wieder vor `POST …/links`" färbte acht Verhaltensprüfungen rot — und den
Wächter nicht, der eine falsche *Entscheidung* finden soll. *Behoben in dieser
Runde; die Prüfung „Und erst recht kein Wächter in der Routenzeile" steht
daneben.*

**102. Ein Mock, der ein Feld selbst mitbringt, deckt die Serverseite
zu.** Der Rückbau „`verfasser` fällt aus der Linkzeile in `detail()`" blieb
**vollständig grün**: die Oberflächenprüfungen laufen gegen `baueDom`, dessen
Prüflage das Feld selbst setzt, und die Rechteprüfungen sehen in die Datenbank
statt in die Antwort. *Zu jedem Feld, das die Oberfläche aus der Antwort liest,
gehört eine Prüfung an der echten Antwort.* Lücke 3 des Prüfstands, zum zweiten
Mal.

**103. Eine Prüfzeile, die auf `liste[0].feld` zugreift, reißt den Lauf ab,
statt rot zu werden.** Drei Prüfungen zu eingespielten Links lasen `links[0].url`
ohne Fragezeichenpunkt. Fällt die Zeile weg, ist `links[0]` undefined — und der
Zugriff beendet den ganzen Lauf, der dann **keinen einzigen Namen** nennt.
Verwandt mit 76, aber eigenständig: dort ist der *Rückbau* zu grob, hier ist die
*Prüfung* zu unvorsichtig.

**104. Seit es fünf Träger mit `user_id` gibt, muss jede von Hand angelegte
Prüfzeile ihren Verfasser ausdrücklich tragen.** Die Prüflage der Rechtegruppe
legte ihre Linkzeile ohne `user_id` an. `ordneBestandZu()` schob sie beim Start
der Eigentümerin zu — und „der Admin löscht einen **fremden** Link" löschte
danach einen eigenen: grün, aber über etwas anderes.

**105. `ALTER TABLE … ADD COLUMN … REFERENCES` geht nur mit der Vorgabe NULL.**
Nachgestellt statt geglaubt: SQLite antwortet auf jede andere Vorgabe mit
„Cannot add a REFERENCES column with non-NULL default value" — auch auf
`NOT NULL DEFAULT 0`. *Eine nachgerüstete Fremdschlüsselspalte ist immer
nullbar; wer sie anders will, braucht einen Tabellenneubau.* Für `links.user_id`
war die nullbare Spalte ohnehin die richtige Antwort — aber die Wahl war keine.

---

## 4. Gegenprobentabelle

**29 Rückbauten, jeder in einer Kopie des Arbeitsbaums** (Stolperstein 100), und
vor jedem Deuten per `diff` belegt, dass der Quelltext der ist, den die Probe
zu prüfen glaubt (Stolperstein 75).

### Punkt 1 — Schema, Migration, Auffangnetz

| Rückbau | Ergebnis |
|---|---|
| `user_id` aus der `links`-DDL | **1 rot** — nur „Eine frische Anlage trägt die Spalte ohne Migration". Auf einer bestehenden Anlage rüstet die Migration sie ohnehin nach; **nur die Gegenlage sieht die Lücke** (Stolperstein 81 in Reinform) |
| `migration0830()` ganz entfernt | **Lauf reißt ab**, kein Name — `ordneBestandZu()` stößt auf die fehlende Spalte (Stolperstein 76) |
| die Migration ergänzt die Spalte, ordnet aber niemanden zu | 3 rot — die **engere Zweitprobe** dazu, sie nennt den Ort |
| die Migration setzt den **Eigentümer** statt des Eintragsverfassers | 3 rot — **dieselben Namen** wie darüber |
| `links` aus `ordneBestandZu()` | 3 rot |

**Die beiden mittleren prüfen dieselbe Sache** (Stolperstein 72): „die Migration
setzt niemanden ein" und „die Migration setzt den Falschen ein" sind am Ergebnis
nicht zu unterscheiden. Das ist kein Mangel der Prüfungen — die Aussage, die sie
halten, lautet „die Bestandszeilen landen beim Eintragsverfasser", und die ist
in beiden Fällen verletzt.

### Punkt 2 — Die Rechte

| Rückbau | Ergebnis |
|---|---|
| `nurEintragVerfasser` wieder vor `POST …/links` | **9 rot** — darunter der neue Wächtereintrag (Stolperstein 101) |
| `POST` schreibt keine `user_id` | 12 rot, darunter „links: keine der 6 Zeilen ist ohne Benutzer" |
| `DELETE /api/links/:id` fragt wieder `eintragFrei` | 3 rot, darunter „Sie fragt nach der ZEILE, nicht nach dem Eintrag" |
| Wächter vor `link-order` entfernt | 3 rot |

### Punkt 3 — Der Name an der Zeile

| Rückbau | Ergebnis |
|---|---|
| Name **ohne** die Schwelle `mehrereBenutzer()` | 2 rot — die Gegenlage „ein Zugang" |
| Name an **jeder** Zeile (Vergleich mit dem Eintragsverfasser weg) | 2 rot — **andere** Namen als darüber |
| ✕ an jeder Zeile | 2 rot |
| `esc()` am Verfassernamen entfernt | **1 rot** |
| Datum nicht mehr im Überfahrtext | **1 rot** |
| ein Trennzeichen statt der Klammern | 7 rot |
| der Pfad nimmt sich wieder die volle Breite (`flex: 1 1 auto`) | **1 rot** |
| der Name steht **neben** statt **in** der zweiten Zeile | 2 rot |
| Regel `.lunten` ersatzlos aus dem Stylesheet | 4 rot |
| nur `display: flex` aus `.lunten` | **1 rot** — Stolperstein 81, das Paar dazu |
| `verfasser` fällt aus der Linkzeile in `detail()` | **erst stumm** (Stolperstein 102), nach dem Nachziehen **1 rot** |
| `mine` fällt aus der Linkzeile in `detail()` | **1 rot** |

**Die beiden ersten sind das Paar, auf das es ankommt.** Die Regel hat zwei
Hälften, und jede färbt ihre eigenen Namen rot — ein Rückbau, der nur eine
entfernt, ist von einem, der beide entfernt, unterscheidbar.

### Punkt 4 — Export und Import

| Rückbau | Ergebnis |
|---|---|
| Export liefert wieder nackte Strings | 4 rot |
| Formatnummer bleibt 6 | **1 rot** |
| Import liest die Stringform nicht mehr (`eintrag.url` blind) | **Lauf reißt ab** — Stolperstein 103 |
| Import lässt die Stringform still fallen | 7 rot (nach dem Nachziehen der drei Prüfzeilen) |
| Links aus einer Datei der Formatnummer 6 fallen an den Einspielenden | **1 rot** |

### Punkt 5 — Die Löschdialoge

| Rückbau | Ergebnis |
|---|---|
| `bestand` nennt Links wieder als **eine** Zahl | 3 rot |
| `zaehleBestand()` ohne Links | 2 rot |
| `entferneZugang()` räumt die Links nicht mit | **1 rot** |
| Links wieder im ersten Satz des Löschdialogs | 3 rot |

**Kein Rückbau blieb unerklärt.** Zwei rissen den Lauf ab; zu beiden steht eine
engere Zweitprobe daneben (Stolperstein 76). Einer blieb stumm und ist damit der
wertvollste der Runde — er hat Stolperstein 102 gefunden.

---

## 5. Prüfungszahlen

**1548 → 1624, alle grün.** 76 neue Prüfungen, zwei neue Gruppen.

| Gruppe | Prüfungen | |
|---|---|---|
| `MIGRATION 0.8.30 — ENTFAELLT MIT 1.0` | 11 | neu |
| `Der Name an der Linkzeile` | 25 | neu |
| `Verfasser in Export und Import` | +11 | erweitert |
| `Rechte am Eintrag` | +6 | erweitert |
| `Verfasser in der Antwort` | +5 | erweitert |
| `Der Waechter ueber den Quelltext` | +5 | erweitert |
| `Loeschen entwertet, es loescht nicht` | +5 | erweitert |
| `Der Loeschdialog am Eintrag` | +3 | erweitert |
| `Adresse oder Suchbegriff` | +1 | erweitert |
| `Mehrbenutzer-Anzeigen in der Oberflaeche` | +1 | erweitert |
| `Keine Zeile ohne Benutzer` | +1 | erweitert |

**Was die neuen Gruppen wirklich fahren:**

- **Migration.** Eine Datenbank aus 0.8.20 wird nachgestellt — `links` per
  Tabellenneubau ohne die Spalte, mit drei Zeilen darin. Die Anlage ist so
  gebaut, dass die falsche Antwort auffällt: der Eintrag gehört **bert**,
  Eigentümerin ist **chefin**. Belegt werden: die Spalte kommt dazu, die
  Bestandszeilen landen beim Eintragsverfasser und ausdrücklich nicht beim
  Eigentümer, ein zweiter Lauf bleibt stumm und lässt die Zeilen unangetastet,
  eine frische Anlage trägt die Spalte **ohne** Migration — und der Index auf
  `links` legt sich beim Start selbst nach, während die Spalte es nicht täte.
  Die dritte Zeile hängt an einem Eintrag, der selbst herrenlos ist: sie kann
  die Migration nicht füllen und fällt danach dem Auffangnetz zu. **Beide Regeln
  sind an einem Lauf zu sehen.**
- **Der Name an der Zeile.** Drei Fenster nebeneinander — drei Zugänge mit
  Adminrolle, ein Zugang, drei Zugänge ohne Adminrolle. Die Prüflage trägt
  **fünf Verfasserlagen** an acht Zeilen: vier vom Eintragsverfasser (kein
  Name), eine mit spitzen Klammern im Namen, eine von der Fragenden, eine
  herrenlose und die Suchzeile von einem Grabstein. Geprüft werden Name,
  Klammerform an **beiden** Zeilenarten, Maskierung am **gerenderten HTML**
  (samt der Probe, dass die Klammern aus der Vorlage kommen und nicht aus dem
  Namen), die Stelle in der zweiten
  Zeile, der Überfahrtext mit Datum, das ✕ nach dem Recht — und die Regel im
  Stylesheet, erst auf Vorhandensein, dann auf Eigenschaft.
- **Rechte.** Die fünf Fälle des Auftrags, in dieser Reihenfolge: ein Fremder
  trägt einen Link ein (201, und die Zeile gehört **ihm**), löscht einen fremden
  nicht (403, die Zeile steht noch), sortiert nicht um (403, die Reihenfolge
  steht unverändert), löscht seinen eigenen (204, die Zeile ist weg), der Admin
  löscht einen fremden (204). Zu jeder Verweigerung der Erfolgsfall daneben und
  die Nachschau in der Datenbank.
- **Export und Import.** Drei Verfasserlagen an drei Linkzeilen eines Eintrags,
  der Rundlauf über Export und ersetzenden Import, dazu **zwei eigene Dateien**:
  eine der Formatnummer 6 mit nackten Strings und dem Eintragsverfasser
  `bert`, eingespielt als `anna` — nur so ist „fällt an den Eintragsverfasser"
  von „fällt an den Einspielenden" zu unterscheiden — und eine der Formatnummer
  7 mit bekanntem Namen, unbekanntem Namen und `author: null`.
- **Keine Zeile ohne Benutzer.** `links` steht in der Tabellenliste und in der
  Schwelle für den belastbaren Bestand. Aufgefüllt wird über **beide** Wege: von
  Hand eingetragen und eingespielt, letzteres in beiden Dateiformen.

---

## 6. Vorgemerkt für 1.0

*Übernommen in Projektstand Abschnitt 10, „Vorgemerkt für 1.0" — der zweite
markierte Block im Projekt. Hier steht der Wortlaut, wie er dort eingetragen
wurde.*

> - **`db.js`, `migration0830()` — 27 Zeilen samt Marken, 11 Prüfungen** (seit
>   0.8.30). Ergänzt `user_id` an `links` in einer Datenbank aus 0.8.0 bis
>   0.8.20 und ordnet die Bestandszeilen dem **Verfasser ihres Eintrags** zu.
>   Zu 1.0 fällt der Block weg, **die Spalte in der DDL bleibt** — die Prüfung
>   „Eine frische Anlage trägt die Spalte ohne Migration" hält genau das fest. Die
>   zugehörigen Prüfungen stehen im Abschnitt „MIGRATION 0.8.30 — ENTFAELLT MIT
>   1.0" in `pruefung.js` (124 Zeilen); der Export von `migration0830` in
>   `module.exports` trägt dieselbe Marke und fällt mit.
>   **Was NICHT mitfällt:** `links` in der Tabellenliste von
>   `ordneBestandZu()`. Das Auffangnetz ist keine Migration — es läuft bei jedem
>   Start und beantwortet eine andere Frage.

---

## 7. Der Bau des Images — die offene Zeile aus 0.8.10 ist beantwortet

0.8.10 hielt fest: „Nicht belegt ist allein, dass Debian die drei Pakete
ausliefert." Diese Sitzung hatte Zugang zu `deb.debian.org`, und die Zeile ist
jetzt belegt:

```
#8 [builder 3/6] RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++
#8 0.367 Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
#8 12.27 Setting up make (4.3-4.1) ...
#8 13.05 Setting up python3 (3.11.2-1+b1) ...
#8 13.15 Setting up g++ (4:12.2.0-3) ...
#8 DONE 13.9s
```

*Der Bau lief gegen den Stand `6302a4b1`, also vor der Berichtigung am
Bildschirm (Abweichung F). Sie fasst nur `public/app.js` und
`public/style.css` an; am Image, an den Fassungen und am Migration ändert sie
nichts. Wiederholt worden ist der Bau nicht — die Krücke unten macht ihn
teuer, und keine der belegten Aussagen hängt an den beiden Dateien.*

**Gemessen am fertigen Image:** 101 MB, Node v22.23.2, `sharp` 0.35.3 auf
libvips 8.18.3, `better-sqlite3-multiple-ciphers` gegen SQLite 3.49.2 und
**aus dem Fertigbau** — es wurde nichts übersetzt. Im Laufzeit-Image liegt kein
Übersetzer. Der Healthcheck meldet `healthy`. **Der Fingerprint im Container war
`6302a4b1` — derselbe wie damals auf der Platte.**

**Und die Migration ist im Container gefahren worden**, nicht nur im Prüfstand:
eine Datenbank mit `links` ohne `user_id`, ein `docker restart`, und im
Protokoll steht

```
[Kriterion] links um user_id ergaenzt (Migration auf 0.8.30); 1 Linkzeilen dem Verfasser ihres Eintrags zugeordnet.
```

Die Zeile gehört danach dem Verfasser ihres Eintrags (Nummer 2) und nicht der
Eigentümerin (Nummer 1); `SELECT COUNT(*) FROM links WHERE user_id IS NULL`
antwortet 0.

**Eine Krücke war nötig, und sie steht nicht im Repo:** die Ausgangssperre der
Sitzung schneidet TLS zur npm-Registrierung auf, und der Container kennt die
Wurzel nicht — `npm ci` scheitert mit `SELF_SIGNED_CERT_IN_CHAIN`. Gebaut wurde
deshalb mit `--network=host` und einer Kopie des `Dockerfile`, die in der
**Bauphase** die Wurzel hereinkopiert und `NODE_EXTRA_CA_CERTS` setzt. Das
Laufzeit-Image bekommt davon nichts: es holt sich über `COPY --from=builder`
allein `/app`. **Der `Dockerfile` im Repo ist unverändert**, und der Fingerprint
belegt, dass der Dateisatz im Container derselbe ist.

**`node:22-bookworm-slim` bleibt.** Ein Sprung auf `trixie` ist keine Frage
dieser Stufe, sondern einer Werkzeugrunde mit eigener Nummer; und Node 24 hat
für `better-sqlite3-multiple-ciphers` keinen Fertigbau (gemessen in 0.8.10).

---

## 8. Offen geblieben

- **Der Wortlaut des Löschdialogs am Zugang ist weiterhin nicht
  oberflächengeprüft.** Er läuft über `confirm()` und stand auch vor dieser
  Runde für Kommentare, Bewertungen und Testtage ungeprüft da. Die **Zahlen**
  dahinter sind es (`zaehleBestand()`, Gegenprobe „ohne Links" → 2 rot), der
  Satz selbst nicht. Nicht angefasst, weil es keiner der fünf Punkte ist; die
  Antwort wäre ein Mock für `confirm` in `baueDom`.
- **Der Prüflauf riss einmal mit „Zweitserver nicht erreichbar" ab.** Das ist
  das Zeitfenster von 12 Sekunden aus 0.8.10, hier unter der Nebenlast eines
  gleichzeitigen Image-Baus. Der Wiederholungslauf war grün, und alle folgenden
  Läufe ebenfalls. Unverändert offen und unverändert richtig beschrieben.
- **Tastaturbedienung beim Sortieren.** Die Linkliste ist eine der fünf
  Stellen, die sich nur mit dem Zeiger umsortieren lassen. Diese Runde ändert
  daran nichts; der Punkt bleibt für 1.0 vorgemerkt.
- **Das Datum am Berührbildschirm.** Siehe Abweichung E — bewusst getragen. Wer
  es sichtbar will, braucht eine dritte Zeile in der Linkzeile.
