# Konzept — Gewichtung der Bewertungskriterien

Ausgangsstand: 0.8.6. **Gebaut in 0.8.40**; der Stufenplan steht im
Projektstand, Abschnitt 10. Hervorgegangen aus Punkt 4.1 in
`Ideen_und_Vorschlaege.md`.

> **ERLEDIGT — gebaut in 0.8.40.** Dieses Papier ist ab hier **Quelle, nicht
> Stand**: was daraus gilt, steht im Projektstand, Abschnitt 5. Was beim Bauen
> anders entschieden wurde, steht in
> `Doku/Aenderungsprotokoll_0.8.40.md`, Abschnitt 2. Vier Dinge in Kürze:
>
> - **Die Formatnummer ging 8 → 9**, nicht 6 → 7 und nicht 7 → 8. Stufe G4 hat
>   die 7 belegt, 0.8.31 die 8. Im Text unten steht sie an zwei Stellen noch
>   alt: im JSON-Beispiel in Abschnitt 10 (`"version": 7`) und im Satz „die
>   Gewichtung wird 0.8.40 mit Format 8" ebenda.
> - **Der Umstiegsblock heißt `umstieg0840()`**, nicht `umstiegGewicht()`, und
>   ist der **vierte** markierte Block im Projekt — `umstieg0830()` und
>   `umstieg0831()` liegen dazwischen.
> - **Die Begründung gegen den `CHECK` in Abschnitt 3 ist falsch.** SQLite
>   nimmt `ALTER TABLE … ADD COLUMN … CHECK (…)` sehr wohl an, und der `CHECK`
>   greift danach; das ist nachgestellt worden (Stolperstein 107). Er ist
>   trotzdem nicht gebaut, aus einem anderen Grund: die Spanne stünde dann
>   zweimal.
> - **Zwei kleine Abweichungen am Bildschirm.** Die Vorschlagsliste reicht
>   unter 1 (`0,5 · 0,8 · 1 · 1,2 · 1,5`), und das Wort „gewichtet" am
>   Blockkopf leitet sich aus den **bewerteten** Kriterien ab, nicht aus allen.
>   Prüfung 22 in Abschnitt 12 spricht noch von einem `select`; gebaut ist ein
>   Textfeld mit Vorschlagsliste, wie Abschnitt 7.1 es beschreibt.
>
> **Alle Zeilennummern im Text sind weitergerückt** — das Papier ist auf dem
> Stand 0.8.6 geschrieben. Die Empfehlung „getrennt lassen" (Abschnitt 10) ist
> so entschieden und so gebaut worden.
> **Offen geblieben ist Punkt 4 aus Abschnitt 14:** die Vorschau der Rangfolge
> im Systembereich. Sie bleibt vorgemerkt.

Sprache wie im Ideenpapier: gewöhnliches IT-Deutsch, nicht die Projektsprache.
Wird gebaut, wird im Duktus des Projekts dokumentiert.

---

## 1. Die Anforderung — und warum die Hälfte davon geschenkt ist

Gewünscht ist:

- ein Gewicht je Bewertungskriterium, einstellbar im Systembereich
- drei Vorgaben zum Anklicken — **1 · 1,2 · 1,5** —, dazu **freie Eingabe**
- Wertebereich **0,2 bis 2**, **immer positiv**
- Zahlen mit **Komma**, wie in Deutschland üblich — nicht mit Punkt
- **ein Eintrag darf nie über 5 und nie unter 1 kommen**

Der dritte Punkt klingt nach Arbeit — nach Deckeln, nach Abfangen, nach einer
Regel, die irgendwo durchgesetzt werden muss. Ist er aber nicht, **wenn man
den richtigen Rechenweg wählt.**

### Der Unterschied, an dem alles hängt

Es gibt zwei Arten, Gewichte zu verrechnen, und nur eine davon ist hier
richtig:

**Gewichtete Summe** — falsch:

```
Σ (Gewicht · Wert)
```

Drei Kriterien, alle mit 5 bewertet, Gewichte 2 / 2 / 2 → **30**. Genau die
Explosion, die befürchtet wird. Dieser Weg braucht tatsächlich einen Deckel,
und ein Deckel bei 5 würde jede Unterscheidung im oberen Bereich einebnen.

**Gewichteter Mittelwert** — richtig:

```
Σ (Gewicht · Wert)
─────────────────
   Σ Gewicht
```

Dieselben drei Kriterien → 30 / 6 = **5,0**. Und das ist kein Zufall, sondern
eine mathematische Eigenschaft: **ein gewichteter Mittelwert liegt immer
zwischen dem kleinsten und dem größten der gemittelten Werte** — solange alle
Gewichte positiv sind. Er ist eine Konvexkombination.

Da jeder Kriterienwert in [1, 5] liegt, liegt der gewichtete Schnitt
zwangsläufig ebenfalls in [1, 5]. Immer. Bei jeder Gewichtskombination.

**Nachgerechnet** (500.000 Zufallsdurchläufe, 1 bis 8 Kriterien, Werte
gleichverteilt von 1 bis 5, Gewichte gleichverteilt von 0,2 bis 2):

```
kleinster aufgetretener Wert:  1,000119
größter aufgetretener Wert:    4,999987
```

Kein Ausreißer, keine Ausnahme, kein Deckel nötig.

### Warum das die richtige Bauform ist

Das Projekt hat für genau diese Sorte Lösung schon eine Formulierung. Zur
Rollenleiter steht im Konzeptpapier:

> Als Leiter ist „ein Eigentümer ist immer auch Admin" **baulich wahr** statt
> eine Regel, die durchgesetzt werden muss.

Dasselbe gilt hier. „Nie über 5, nie unter 1" wird **baulich wahr**, nicht
durch eine Klemme abgesichert. Es gibt keine Stelle, an der ein Deckel
vergessen werden könnte, weil es keinen Deckel gibt.

Und es bleibt beim vorhandenen Rechenweg: 0.7.0 hat entschieden, dass der
Gesamtschnitt **erst je Kriterium, dann über die Kriterien** rechnet. Der
erste Schritt bleibt völlig unangetastet. Nur der zweite Schritt — das Mitteln
über die Kriterien — bekommt Gewichte. Das ist heute schon ein Mittelwert; er
wird nur von einem ungewichteten zu einem gewichteten.

**Mit Gewicht 1 überall ist er rechnerisch identisch mit dem heutigen.** Das
ist dieselbe Zusicherung, mit der 0.7.0 seinen eigenen Umbau begründet hat
(„ändert im Einbenutzerbetrieb keine einzige Zahl") — hier gilt sie sogar für
jeden Betriebszustand und in beide Richtungen: **wer alle Gewichte auf 1
zurückstellt, bekommt exakt die alten Zahlen wieder.** Die Sache ist
vollständig umkehrbar, ohne Datenverlust.

---

## 2. Die eine Stelle, an der die Zusicherung doch kippt

Es gibt genau einen Weg, das kaputtzumachen, und er ist verführerisch
naheliegend. Deshalb steht er hier ganz vorn und nicht in einer Fußnote.

**Der Nenner darf nur die Gewichte der *bewerteten* Kriterien summieren.**

Heute liefert `qSchnittJeKriterium` (server.js:1077) ausschließlich Zeilen für
Kriterien mit `value > 0`. Ein Kriterium, das niemand bewertet hat, steht gar
nicht in der Map — `gesamtSchnitt()` mittelt also über die tatsächlich
bewerteten. Das ist richtig und muss so bleiben.

Wer beim Gewichten den Nenner stattdessen über **alle** Kriterien bildet
(etwa mit `SELECT SUM(gewicht) FROM rating_criteria` — sieht sauber aus, ist
es aber nicht), bekommt:

```
Bestand: 3 Kriterien. Bewertet ist nur eines, mit 3, Gewicht 0,2.
Die beiden anderen haben Gewicht 2 und sind unbewertet.

richtig:  3 · 0,2 / 0,2                    = 3,0     ✓
falsch:   3 · 0,2 / (0,2 + 2 + 2)          = 0,14    ✗
```

**Nachgerechnet** — derselbe Zufallslauf, aber mit zwei unbewerteten
Kriterien à Gewicht 2 im Nenner:

```
kleinster aufgetretener Wert: 0,049079
```

Also weit unter 1, und damit genau der Fall, den die Anforderung ausschließen
will. Nicht durch die Gewichte — durch einen falschen Nenner.

**Konsequenz für den Bau:** Zähler und Nenner werden aus **derselben** Menge
gebildet, in **derselben** Schleife. Nie aus zwei Quellen. Das ist im
Vorschlag unten baulich so gelöst, dass es gar nicht auseinanderfallen kann —
das Gewicht reist an der Schnittzeile mit, statt separat nachgeschlagen zu
werden.

Und es ist die erste Prüfung, die in den Prüfstand gehört (Abschnitt 12,
Prüfung 6).

---

## 3. Datenmodell

Eine Spalte an `rating_criteria`:

```sql
CREATE TABLE IF NOT EXISTS rating_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Das GEWICHT dieses Kriteriums im Gesamtschnitt. 1 heisst "zaehlt wie
  -- jedes andere". Erlaubt ist 0,2 bis 2, und nur positiv: NULL, 0 und alles
  -- Negative sind es nicht. Bei Gewicht 0 waere der Nenner eines Eintrags, an
  -- dem nur dieses Kriterium bewertet ist, null, und die Division ginge nicht
  -- auf; ein negatives Gewicht kehrte die Aussage um -- eine gute Note zoege
  -- den Schnitt nach unten -- und braeche die Zusicherung [1,5] mit.
  -- Verrechnet wird als gewichteter MITTELWERT, nicht als Summe: dadurch
  -- liegt der Gesamtschnitt immer zwischen 1 und 5, ohne dass das irgendwo
  -- durchgesetzt werden muesste.
  gewicht REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Warum `REAL` und nicht Hundertstel als `INTEGER`.** Hundertstel (20 bis 200) wären
exakt und würden Gleitkomma ganz vermeiden — aber sie zwängen jeder
Lesestelle eine Umrechnung auf, und die vergisst irgendwann jemand.
`photos.focus_x REAL NOT NULL DEFAULT 50` ist der Präzedenzfall im eigenen
Schema: ein Prozentwert als REAL, ohne Umrechnung. Dasselbe hier.

Die Gleitkommafrage ist ohnehin unkritisch: gerundet wird auf ein Hundertstel, und
der Fehler einer Double-Multiplikation liegt fünfzehn Stellen darunter. Und
`1.0` ist im Binärformat exakt darstellbar — die Abfrage „weicht das Gewicht
von 1 ab?", von der die Anzeige abhängt, ist deshalb verlässlich.

**Warum 0 verboten ist**, und zwar nicht aus Geschmack: bei Gewicht 0 an einem
Kriterium, das als einziges bewertet ist, wäre Σ Gewicht = 0. Die Untergrenze
0,2 ist damit nicht nur eine Bedienentscheidung, sondern der Grund, warum die
Division immer aufgeht. Das gehört als Kommentar an die Spalte, sonst hebt es
irgendwann jemand als „warum eigentlich nicht 0" auf.

**Kein `CHECK`-Constraint.** Wünschenswert wäre
`CHECK (gewicht BETWEEN 0.2 AND 2.0)` — aber SQLite kann ein CHECK nicht per
`ALTER TABLE` nachrüsten. Es ginge nur über einen Tabellenneubau, und der ist
in Stufe C ausdrücklich als „riskant" markiert worden. Träge man es nur in die
DDL ein, wären die frisch angelegte und die migrierte Datenbank verschieden
gebaut — genau die Abweichung 5, die in 0.6.0 als Fehler erkannt wurde.

Die Gültigkeit wird deshalb im Code durchgesetzt, an **einer** Stelle
(Abschnitt 5).

---

## 4. Der Rechenweg im Server

Zwei Änderungen, beide klein, und die zweite ist die eigentliche.

### 4.1 Das Gewicht reist an der Schnittzeile mit

`server.js:1077`, heute:

```js
const qSchnittJeKriterium = db.prepare(`
  SELECT criterion_id, AVG(value * 1.0) AS schnitt, COUNT(*) AS anzahl
    FROM ratings WHERE item_id = ? AND value > 0 GROUP BY criterion_id`);
```

künftig:

```js
const qSchnittJeKriterium = db.prepare(`
  SELECT r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,
         c.gewicht
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.item_id = ? AND r.value > 0
   GROUP BY r.criterion_id, c.gewicht`);
```

**Warum das Gewicht hier mitkommt und nicht separat nachgeschlagen wird:** so
kann der Nenner gar nicht aus einer anderen Menge gebildet werden als der
Zähler. Die Falle aus Abschnitt 2 wird baulich unmöglich, statt durch
Sorgfalt vermieden. Wer eine Zeile hat, hat ihr Gewicht; wer keine Zeile hat,
hat auch kein Gewicht im Nenner.

**Zum JOIN, weil der Kommentar darüber davor warnt:** die dortige Warnung gilt
einem **zweiten JOIN auf `ratings`** — der vervielfacht Zeilen. `rating_criteria`
ist über `criterion_id` eindeutig; die Zeilenzahl bleibt. `c.gewicht` steht
zusätzlich im `GROUP BY`, damit die Abfrage nicht auf SQLites Nachsicht
gegenüber freien Spalten angewiesen ist.

### 4.2 Der Gesamtschnitt wird gewichtet

`server.js:1128`, heute:

```js
function gesamtSchnitt(karte) {
  const werte = [...karte.values()].map(z => z.schnitt);
  if (!werte.length) return null;
  const a = werte.reduce((s, v) => s + v, 0) / werte.length;
  return Math.round(a * 10) / 10;
}
```

künftig:

```js
function gesamtSchnitt(karte) {
  // Gewichteter Mittelwert ueber die BEWERTETEN Kriterien. Zaehler und
  // Nenner entstehen in derselben Schleife aus derselben Menge -- ein
  // Nenner ueber ALLE Kriterien (auch die unbewerteten) druecke das
  // Ergebnis unter 1 und braeche damit die Zusicherung, dass ein Eintrag
  // immer zwischen 1 und 5 liegt.
  // Weil jeder Wert in [1,5] liegt und jedes Gewicht groesser als null ist,
  // liegt auch das Ergebnis in [1,5] -- eine Eigenschaft des gewichteten
  // Mittels, keine Regel, die hier durchgesetzt wuerde.
  let zaehler = 0, nenner = 0;
  for (const z of karte.values()) { zaehler += z.schnitt * z.gewicht; nenner += z.gewicht; }
  if (!nenner) return null;
  // Gerundet wird weiterhin GENAU EINMAL, hier am Ende.
  return Math.round((zaehler / nenner) * 10) / 10;
}
```

`if (!nenner) return null` ersetzt `if (!werte.length) return null` und
bedeutet dasselbe: keine bewerteten Kriterien, keine Zahl. Bei mindestens
einer Zeile ist der Nenner mindestens 0,2 und damit sicher ungleich null.

**Das ist der ganze serverseitige Rechenumbau.** Alles Weitere folgt von
selbst:

- `detail()` ruft `gesamtSchnitt()` — gewichtet.
- `/api/items` ruft dieselbe Funktion je Eintrag — gewichtet.
- Die Sortierung `rating_desc` / `rating_asc` liest `avgRating` — gewichtet,
  ohne dass dort etwas geändert wird.
- Der Vergleich liest `it.avgRating` in der Stellung „alle" — gewichtet.
- `avg` und `count` je Kriterium bleiben **unangetastet**: der Schnitt eines
  einzelnen Kriteriums ist eine Aussage über dieses Kriterium, nicht über den
  Eintrag. Ihn zu gewichten ergäbe keinen Sinn — er wäre mit sich selbst
  gewichtet.

### 4.3 Das Gewicht muss in die Antwort

`detail()` baut die eigene Sternzeile aus `rating_criteria` (server.js:1214).
Dort kommt `c.gewicht` dazu:

```js
it.ratings = db.prepare(`
  SELECT c.id AS criterion_id, c.name, c.gewicht, COALESCE(r.value, 0) AS value
  ...`).all(id, benutzerId);
```

Gebraucht wird es für zwei Dinge: die Anzeige `×1,5` an der Kriterienzeile —
und für die zweite Rechenstelle, die es tatsächlich gibt.

---

## 5. Gültigkeit — eine Stelle, kein Deckel

Die Grenzen stehen **einmal** und werden von jedem Schreibweg gerufen:

```js
/* Der gueltige Bereich eines Gewichts steht GENAU HIER. Zwei Schreibwege
   fuehren darauf (Verwaltung und Import); stuende die Spanne an beiden,
   liefen sie irgendwann auseinander.
   NUR POSITIVE WERTE, und die Untergrenze ist keine Geschmacksfrage: bei 0
   waere der Nenner eines Eintrags, an dem nur dieses Kriterium bewertet ist,
   null. Ein negatives Gewicht kehrte die Aussage um -- eine gute Note zoege
   den Schnitt nach unten -- und braeche zugleich die Zusicherung, dass der
   Gesamtschnitt zwischen 1 und 5 liegt.
   Auf der Leitung steht eine ZAHL, kein Text: das Komma ist eine Sache der
   Anzeige und hat in der Schnittstelle nichts verloren. */
const GEWICHT_MIN = 0.2, GEWICHT_MAX = 2.0;

function gueltigesGewicht(roh) {
  const g = Number(roh);
  if (!Number.isFinite(g) || g < GEWICHT_MIN || g > GEWICHT_MAX) return null;
  // Auf Hundertstel festlegen. Nicht als Schranke gedacht, sondern gegen den
  // Rest der Gleitkommarechnung: 1.2000000000000002 hat niemand eingegeben.
  return Math.round(g * 100) / 100;
}
```

**Abgewiesen wird, was etwas anderes bedeutet — gerundet wird, was dasselbe
bedeutet.** Diese Unterscheidung trägt die ganze Regel:

- **Außerhalb von 0,2 bis 2 → Absage mit Meldung.** Wer 5 eintippt, meint 5.
  Den Wert stillschweigend auf 2 zu ziehen hieße, eine andere Aussage zu
  speichern als die eingegebene — und der Betroffene glaubte, es habe
  gewirkt. Dasselbe gilt für alles Negative.
- **Feiner als ein Hundertstel → gerundet.** 1,234 und 1,23 sind dieselbe
  Aussage. Und die Rundung ist **nicht still**: das Feld zeigt danach 1,23,
  also genau das, was gespeichert wurde.

Das ist bewusst nicht dieselbe Haltung wie beim Bewertungswert, der an zwei
Stellen mit `Math.max(0, Math.min(5, …))` zurechtgebogen wird. Dort ist es
richtig — der Wert kommt aus einem Sterne-Widget, das gar nichts anderes
senden kann, also gibt es keine Fehleingabe, die man melden könnte. Ein
Gewicht wird von Hand getippt.

`PUT /api/criteria/:id` bekommt das Feld dazu:

```js
app.put('/api/criteria/:id', nurAdmin, (req, res) => {
  // … Name wie bisher …
  let gewicht = null;
  if (req.body.gewicht !== undefined) {
    gewicht = gueltigesGewicht(req.body.gewicht);
    if (gewicht === null) return res.status(400).json({
      error: `Das Gewicht muss eine Zahl zwischen ${zahl(GEWICHT_MIN)} und ` +
             `${zahl(GEWICHT_MAX)} sein.` });
  }
  // Name und Gewicht in EINEM UPDATE: zwei Anweisungen hintereinander
  // koennten halb durchlaufen.
  db.prepare('UPDATE rating_criteria SET name = ?, gewicht = COALESCE(?, gewicht) WHERE id = ?')
    .run(name, gewicht, req.params.id);
  res.json(db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(req.params.id));
});
```

**Keine neue schreibende Route.** `PUT /api/criteria/:id` gibt es bereits, sie
steht bereits hinter `nurAdmin` und bereits in `F_ROUTEN`. **Die Zahl bleibt
bei 46.** (Das ist ausdrücklich zu erwähnen, weil der Prüfstand sie zählt und
ein Merkposten in Abschnitt 11 des Projektstands daran hängt.)

**Die Meldung braucht das Komma.** `${GEWICHT_MIN}` allein ergäbe „zwischen
0.2 und 2 sein" — ein Punkt mitten in einem deutschen Satz. Deshalb steht auch
serverseitig ein Formatierer daneben, wortgleich zu der Konvention, die die
Oberfläche an neun Stellen schon benutzt:

```js
// Deutsches Komma in Meldungen. Dieselbe Regel wie in der Oberflaeche
// (`toFixed(1).replace('.', ',')`), nur ohne feste Nachkommastelle.
const zahl = (n) => String(n).replace('.', ',');
```

`POST /api/criteria` nimmt das Feld **nicht** entgegen — ein neues Kriterium
startet immer bei 1,0 und wird danach eingestellt. Ein Feld weniger im
Anlegen-Weg, und die Vorgabe steht nur in der DDL.

---

## 6. Die zweite Rechenstelle — im Frontend, und sie ist Absicht

Das ist der Punkt, den man beim Bauen am ehesten übersieht.

Der Vergleich rechnet die Zahl für die Stellung **„meine"** selbst aus
(`public/app.js:1322`), mit ausgeschriebener Begründung:

> DIE ZAHL FÜR „MEINE" BILDET DER KLIENT. Bei einem Bewerter hat jedes
> Kriterium höchstens eine Stimme […] Ein zweiter Rechenweg im Server wäre
> eine zweite Wahrheit über denselben Schnitt.

```js
const eigenerSchnitt = (it) => {
  const werte = it.ratings.map(r => r.value).filter(v => v > 0);
  if (!werte.length) return null;
  return Math.round((werte.reduce((s, v) => s + v, 0) / werte.length) * 10) / 10;
};
```

**Bleibt diese Stelle ungewichtet, zeigt der Umschalter „meine / alle" zwei
Zahlen, die nach zwei verschiedenen Formeln entstanden sind** — und niemand
könnte sagen, ob ein Unterschied von der anderen Bewertermenge kommt oder von
der fehlenden Gewichtung. Das wäre die zweite Wahrheit, die der Kommentar
gerade zu vermeiden versucht.

Künftig:

```js
/* Dieselbe Formel wie gesamtSchnitt() im Server, auf die eigene Menge
   angewandt: gewichteter Mittelwert, Nenner nur ueber die Kriterien, die
   ICH bewertet habe. Ein Kriterium ohne eigenen Wert bringt sein Gewicht
   NICHT in den Nenner -- sonst laege die eigene Zahl unter der ueber alle,
   ohne dass es an den Werten laege. */
const eigenerSchnitt = (it) => {
  let zaehler = 0, nenner = 0;
  for (const r of it.ratings) {
    if (r.value > 0) { zaehler += r.value * r.gewicht; nenner += r.gewicht; }
  }
  if (!nenner) return null;
  return Math.round((zaehler / nenner) * 10) / 10;
};
```

Dieselbe Falle wie in Abschnitt 2, an einer zweiten Stelle — hier bezogen auf
„von mir bewertet" statt „von irgendwem bewertet". Deshalb steht sie im
Prüfstand zweimal (Prüfung 6 und 12).

**Es sind und bleiben genau zwei Rechenstellen.** Wer eine dritte anlegt — etwa
in der Kachel der Übersicht —, bricht die Regel. Die Kachel liest `avgRating`
vom Server, und dabei bleibt es.

---

## 7. Oberfläche: der Systembereich

### 7.1 Wo das Gewicht eingestellt wird

Karte **„Bewertungskriterien"**, dieselbe Zeile wie heute:

```
⣿   Verarbeitungsqualität     × [1,5  ▾]   12 Einträge   ✎  ✕
⣿   Funktionalität            × [1,2  ▾]   12 Einträge   ✎  ✕
⣿   Optische Erscheinung      × [1    ▾]    9 Einträge   ✎  ✕
```

**Ein Textfeld mit Vorschlagsliste — kein Auswahlfeld.** Drei feste Stufen
decken den Bereich 0,2 bis 2 nicht ab, und ein Auswahlfeld mit einem
zusätzlichen Eintrag „anderer Wert …" wäre ein Moduswechsel: erst wählen,
dann tippen, in zwei verschiedenen Bedienformen für dieselbe Sache.

Ein `<input>` mit `<datalist>` ist beides zugleich: ein Klick zeigt die
Vorschläge, ein Tastendruck überschreibt sie. **Das Muster gibt es im Projekt
schon** — die Tageingabe am Eintrag ist genau so gebaut (`#newtag` mit
`list="tagsug"`).

**Vorgeschlagen werden drei Werte:**

```
1     ·     1,2     ·     1,5
```

Alles andere zwischen **0,2 und 2** lässt sich eintippen.

**Warum alle drei Vorschläge bei 1 oder darüber liegen.** 1 ist der Anker —
„zählt wie jedes andere". In der Praxis macht man das Wichtige schwerer, statt
alles andere leichter zu machen: das Ergebnis ist dasselbe, aber man dreht an
einer Zeile statt an allen übrigen. Wer trotzdem nach unten will, tippt 0,8
oder 0,5. **Die Vorschlagsliste ist eine Zeile in `app.js`** und jederzeit
erweiterbar, ohne dass der Server davon etwas merkt.

**Der Server nimmt denselben Bereich an, den das Feld annimmt** — 0,2 bis 2.
Anders als im ersten Entwurf gibt es hier keine Aufteilung mehr in „Server
kann mehr, Oberfläche bietet weniger": mit freier Eingabe fällt der Grund
dafür weg, und eine Grenze ist besser als zwei.

#### Komma, nicht Punkt

**Gelesen wird beides, geschrieben wird immer mit Komma.** Getippt wird `1,2`;
ein eingefügter Wert aus einer Tabelle kann `1.2` heißen und soll nicht
scheitern.

```js
/* Komma herein, Komma hinaus.
   "1,2" und "1.2" ergeben beide 1.2; alles andere ergibt NaN und faellt
   damit durch gueltigesGewicht(). Auch "" und " " -- ein leeres Feld ist
   keine Null, siehe den dritten Fallstrick unten. */
const gewichtAusText = (roh) => {
  const t = String(roh).trim();
  return t === '' ? NaN : Number(t.replace(',', '.'));
};

/* 1 -> "1", 1.2 -> "1,2", 1.25 -> "1,25". KEINE nachlaufenden Nullen:
   "1,50" sieht nach einer Genauigkeit aus, die es nicht gibt -- und "1,0"
   nach einer Einstellung, wo in Wahrheit die Vorgabe steht.
   .replace('.', ',') ist die Konvention der ganzen Oberflaeche; sie steht
   dort schon an neun Stellen. */
const gewichtText = (g) => String(Math.round(g * 100) / 100).replace('.', ',');
```

**Durchgespielt** — beide Helfer zusammen mit `gueltigesGewicht()`:

| Eingabe | gespeichert | Anzeige danach |
|---|---|---|
| `1,2` | 1,2 | `1,2` |
| `1.2` | 1,2 | `1,2` |
| `1` | 1 | `1` |
| `0,2` | 0,2 | `0,2` |
| `1,25` | 1,25 | `1,25` |
| `1,234` | 1,23 | `1,23` — gerundet, und man sieht es |
| `0,19` | — | abgewiesen, unter der Grenze |
| `2,1` | — | abgewiesen, über der Grenze |
| `-1` · `-1,5` | — | abgewiesen, nicht positiv |
| `0` | — | abgewiesen, spränge die Division |
| leer · `abc` · `1,2,3` | — | abgewiesen, keine Zahl |

Das Feld ist **`type="text"` mit `inputmode="decimal"`**, nicht
`type="number"`. Begründung, damit es niemand später „aufräumt":

- `type="number"` nimmt das Komma nur an, wenn die Browsersprache es vorsieht
  — bei einem englisch eingestellten Browser auf einem deutschen Rechner also
  nicht.
- Bei einer Eingabe, die er für ungültig hält, liefert `input.value` einen
  **leeren String** statt dem, was sichtbar dasteht. Man kann dann nicht
  einmal melden, was falsch war.
- `inputmode="decimal"` bringt die Zahlentastatur auf dem Handy und hat keinen
  dieser Nachteile.

#### Drei Fallstricke beim Einbau

1. **`makeSortable` deckt das Feld bereits ab.** Die Kriterienzeile ist
   ziehbar, und die Ausnahmeliste lautet heute schon `ignore: '.mact, input'`
   — ein `<input>` ist damit ausgenommen, ohne dass etwas geändert werden
   muss. *(Ein `<select>` wäre es nicht gewesen; das war ein Argument gegen
   die erste Fassung dieses Abschnitts.)*

2. **Nach einem Gewichtswechsel wird die Liste NICHT neu gezeichnet.** Das ist
   der Unterschied zum Umbenennen — dort *muss* neu gezeichnet werden, weil das
   ✎ den Namen durch ein Eingabefeld **ersetzt** hat und der Zustand
   zurückgebaut gehört. Ein Gewichtswechsel ersetzt nichts: das Feld steht
   dauerhaft da und trägt den neuen Wert bereits.

   ```js
   feld.onchange = async () => {
     const g = gewichtAusText(feld.value);
     if (Number.isNaN(g)) { feld.value = gewichtText(entry.gewicht); return; }
     try {
       const neu = await api('PUT', `/api/criteria/${entry.id}`,
                             { name: entry.name, gewicht: g });
       // Den Datensatz IN DER LISTE nachziehen statt neu zu laden -- sonst
       // zeigt die naechste Zeichnung wieder den alten Wert.
       entry.gewicht = neu.gewicht;
       feld.value = gewichtText(neu.gewicht);   // zeigt die Rundung mit
       toast('Gewicht gespeichert');
     } catch (e) { toast(e.message, true); feld.value = gewichtText(entry.gewicht); }
   };
   ```

   Ein `refresh()` an dieser Stelle wäre nicht nur überflüssig, sondern
   schädlich: ist an derselben Zeile gerade ein Umbenennen offen, risse der
   Neuaufbau es weg. Der Verwendungszähler daneben ändert sich durch ein
   Gewicht ohnehin nicht.

3. **Ein leeres Feld ist keine Null.** Wer den Inhalt löscht und wegklickt,
   meint nicht „Gewicht 0" — er hat es sich anders überlegt. Dann wird der
   alte Wert wieder eingesetzt und **keine Anfrage geschickt**. `Number('')`
   ergibt in JavaScript 0, deshalb fängt `gewichtAusText()` den leeren Fall
   ausdrücklich vorher ab; ohne das liefe er in eine Absage „muss zwischen 0,2
   und 2 sein", die niemand verlangt hat.

### 7.2 Was die Karte sonst noch braucht

Ein Satz unter der Liste, der die Rechnung benennt:

> Das Gewicht bestimmt, wie stark ein Kriterium in den Gesamtschnitt eingeht.
> Bei 1 zählen alle gleich. Möglich ist 0,2 bis 2 — die Vorschläge sind nur
> die häufigsten Werte. Der Gesamtschnitt bleibt in jedem Fall zwischen
> 1 und 5.

Der letzte Satz ist wichtig: er nimmt genau die Sorge vorweg, die diesem
Konzept zugrunde liegt, und zwar an der Stelle, an der sie entsteht.

**Optional, zweite Stufe:** eine Vorschau, die zeigt, wie sich die Rangfolge
der bestbewerteten Einträge durch eine Gewichtsänderung verschiebt. Das ist
das, was Gewichte im Alltag erst richtig bedienbar macht — man dreht an einer
Schraube und will sehen, ob sich die Spitze bewegt. Ich würde es **nicht in
dieselbe Runde** nehmen: es braucht einen eigenen Endpunkt und eine eigene
Ansicht, und die Gewichtung funktioniert ohne es vollständig.

---

## 8. Oberfläche: der Bewertungsblock am Eintrag

### 8.1 Am Kriterium

Hinter dem Namen, dezent und **nur wenn das Gewicht von 1 abweicht**:

```
Verarbeitungsqualität  ×1,5     ★★★★☆      ⌀ 3,8 · 4
Funktionalität         ×2       ★★★☆☆      ⌀ 3,2 · 4
Optische Erscheinung            ★★★★★      ⌀ 4,5 · 4
```

**Warum das nicht weggelassen werden darf.** Der Projektstand nennt heute
schon einen Rundungspreis:

> wer die angezeigten Zehntel von Hand mittelt, kann um bis zu 0,05
> danebenliegen.

Mit Gewichten wird der Zusammenhang zwischen den Zeilenwerten und der Kopfzahl
**grundsätzlich** nicht mehr durch Mitteln nachvollziehbar — aus 0,05
Abweichung wird ein völlig anderes Ergebnis. Ohne die Anzeige des Gewichts
sähe die Kopfzahl schlicht falsch aus.

**Ohne diese Anzeige würde ich das ganze Vorhaben nicht empfehlen.** Sie ist
kein Beiwerk, sie ist die Bedingung dafür, dass die Zahl weiterhin
nachvollziehbar bleibt.

**Nur bei Abweichung von 1** — aus demselben Grund, aus dem die
Durchschnittsspalte bei einem Zugang entfällt: `×1` an jeder Zeile wäre
Rauschen ohne Aussage. Und wie dort ist es eine **Ableitung, kein Schalter**.

### 8.2 Am Blockkopf

Der Blockkopf zeigt heute den Gesamtschnitt. Steht **irgendein** Gewicht auf
einem anderen Wert als 1, kommt ein Wort dazu:

```
Bewertung   ★ 3,7 gewichtet
```

Ebenfalls abgeleitet: `it.ratings.some(r => r.gewicht !== 1)`. Kein Schalter,
keine Einstellung, kein zweiter Zustand. Sind alle Gewichte 1, steht dort
exakt das, was heute dort steht.

---

## 9. Oberfläche: der Vergleich

Die Kriterienzeilen tragen den Namen einmal je Zeile (die Spalten sind die
Einträge). Das Gewicht steht deshalb **einmal an der Zeilenbeschriftung**, nicht
je Spalte:

```
                        Bohrer A     Bohrer B     Bohrer C
Verarbeitung  ×1,5        4,0          4,5          3,0
Funktion      ×2          3,5          3,0          4,5
Optik                     5,0          4,0          4,0
─────────────────────────────────────────────────────────
★ Durchschnitt            4,0          3,7          3,9
```

Die Kopfzahl von A entsteht als
`(4,0·1,5 + 3,5·2 + 5,0·1) / (1,5+2+1) = 18 / 4,5 = 4,0`.

**Und daran sieht man, wofür das Ganze gut ist.** Ungewichtet lägen B und C
mit je **3,8** exakt gleichauf — beide haben dieselbe Summe, nur anders
verteilt. Gewichtet zieht C an B vorbei (**3,9** gegen **3,7**), weil C
ausgerechnet beim doppelt gewichteten Kriterium „Funktion" vorne liegt und B
seinen Vorsprung im schwächer gewichteten „Verarbeitung" hat. Genau diese
Unterscheidung kann der Bestand heute nicht treffen.

**Die Hervorhebung des besten Werts je Kriterium bleibt unverändert.** Sie
vergleicht Kriterienwerte, und die sind ungewichtet — sie stehen ja alle in
derselben Zeile, also unter demselben Gewicht. Das ist genau der Grund, warum
die Entscheidung „Skala fest 1–5" von diesem Vorhaben **nicht** berührt wird:

> **Skala fest 1–5.** Wählbare Skalen würden die Vergleichsansicht
> verfälschen, die je Kriterium den besten Wert hervorhebt.

Ein Gewicht ändert keinen einzigen Kriterienwert. Die Skala bleibt 1–5, die
Sterne bleiben Sterne, die Hervorhebung bleibt gültig. Es ändert sich allein
die eine Zahl darunter.

Der Umschalter **„meine / alle"** schaltet weiterhin drei Zahlen gemeinsam —
beide Schnitte sind nach dem Umbau aus Abschnitt 6 gewichtet.

---

## 10. Export und Import

### Was ich vorschlage

**`criteria` bleibt unverändert eine Liste von Namen.** Die Gewichte kommen als
**zusätzliches Feld** daneben:

```json
{
  "exported_at": "…",
  "title": "…",
  "version": 7,
  "criteria": ["Optische Erscheinung", "Verarbeitungsqualität", "Funktionalität"],
  "criteriaGewichte": { "Verarbeitungsqualität": 1.5, "Funktionalität": 2 },
  "items": [ … ]
}
```

**Warum nicht `criteria` auf Objekte umstellen.** Der Import liest heute
(server.js:2247):

```js
for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
  const clean = String(name || '').trim();
```

Ein Objekt liefe dort durch `String()` und ergäbe ein Kriterium namens
`[object Object]`. Das beträfe **eine bereits laufende 0.8.6-Anlage, in die
jemand eine neue Exportdatei einspielt.** Rückwärtskompatibilität ist im
Projekt zugesichert, Vorwärtskompatibilität nicht — aber sie hier geschenkt zu
bekommen, kostet nur ein zusätzliches Feld statt eines geänderten.

Mit dem Vorschlag oben gilt in **beide** Richtungen:

- **Alte Datei in neue Anlage:** kein `criteriaGewichte` → alles 1,0.
- **Neue Datei in alte Anlage:** `criteria` unverändert lesbar, das
  unbekannte Feld wird ignoriert. Die Gewichte gehen verloren, sonst nichts.

Das folgt der vorhandenen Linie wörtlich: *„Zusätzliches Feld, damit die
Kriterienreihenfolge den Export überlebt. Bestehende Feldnamen bleiben
unverändert."*

**Nur Abweichungen werden geschrieben.** Ein Kriterium mit Gewicht 1 taucht in
`criteriaGewichte` nicht auf — dieselbe Regel wie bei der Anzeige, und die
Datei bleibt in einem ungewichteten Bestand zeichengleich zu heute.

**Die Formatnummer geht 8 → 9** (ursprünglich stand hier 6 → 7; G4 hat die 7
belegt, 0.8.31 die 8). Sie ist im Projekt eine Aussage, keine Bedingung — entschieden wird
über das Vorhandensein der Felder.

### Beim Einspielen

- Ein **bekanntes** Kriterium behält sein vorhandenes Gewicht. Der Import
  legt Bestand an; er ändert keine Einstellung des Ziels. Das ist dieselbe
  Regel wie beim ersetzenden Import, der `users` nicht anrührt.
- Ein **neu angelegtes** Kriterium bekommt das Gewicht aus der Datei,
  ansonsten 1,0.
- Jedes Gewicht aus der Datei läuft durch `gueltigesGewicht()`. Hier wird
  allerdings **nicht abgewiesen**, sondern auf 1,0 zurückgefallen und im
  Protokoll genannt — eine ganze Einspielung an einem Zahlenwert scheitern zu
  lassen, wäre unverhältnismäßig. Das ist dieselbe Haltung wie bei unbekannten
  Verfassernamen: nicht abbrechen, sondern melden.

### Zum Zeitpunkt

**Entschieden und gebaut: getrennt.** Der Absatz hier lautete ursprünglich als
Abwägung — G4 hebt das Format ohnehin, also ließe sich mit einer gemeinsamen
Version eine Formaterhöhung, ein Migrationsblock und eine Runde
Import-Prüfungen sparen. Dagegen stand die Regel, dass eine Stufe in einem
Durchgang abzuarbeiten sein muss, und die Empfehlung lautete: getrennt lassen.

**So ist es gekommen.** G4 ist auf 0.8.30 allein gefahren worden, mit Format 7;
die Gewichtung wird 0.8.40 mit Format 8. Die Empfehlung hat sich im Bau
bestätigt: G4 brauchte allein 76 neue Prüfungen und 31 Gegenproben — Schema,
Umstieg, Rechtewende, Oberfläche und Austauschformat in einem Durchgang. Für
eine zweite Baustelle war darin keine Reserve.

---

## 11. Migration

Nach Stolperstein 20 gehören **beide** Teile dazu — die DDL *und* ein
Migrationsblock, denn `CREATE TABLE IF NOT EXISTS` rüstet an einer vorhandenen
Tabelle nichts nach:

*Der Block ist damit der **vierte** markierte im Projekt — nach `umstieg083()`
(0.8.3), `umstieg0830()` (0.8.30) und `umstieg0831()` (0.8.31). Alle drei
stehen unter „Vorgemerkt für 1.0" im Projektstand; dieser gehört dort sofort
dazu.*

```js
// UMSTIEG 0.8.40 — ENTFAELLT MIT 1.0
// Die Spalte gewicht steht in der DDL, aber CREATE TABLE IF NOT EXISTS ruehrt
// eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus 0.8.6
// traegt rating_criteria ohne diese Spalte; die Vorgabe 1.0 greift nur dort,
// wo die Spalte ueberhaupt existiert.
// Einmalig, wiederholbar und im Normalfall stumm.
function umstiegGewicht() {
  const spalten = db.prepare('PRAGMA table_info(rating_criteria)').all().map(c => c.name);
  if (spalten.includes('gewicht')) return 0;
  db.exec('ALTER TABLE rating_criteria ADD COLUMN gewicht REAL NOT NULL DEFAULT 1.0');
  console.log('[Kriterion] rating_criteria um gewicht ergaenzt (Umstieg auf 0.8.40).');
  return 1;
}
umstiegGewicht();
// ENDE UMSTIEG 0.8.40
```

Wortgleich zum Muster von `umstieg083()`, inklusive der Marke für die
Bereinigung zu 1.0.

**Bestandszeilen bekommen 1,0** — und das ist die einzig mögliche Wahl: jeder
andere Wert änderte beim Einspielen still sämtliche Gesamtschnitte. Anders als
in Stufe G4, wo die Frage „wem fallen die Bestandszeilen zu" echte Abwägung
verlangte — sie fielen an den **Eintragsverfasser** und ausdrücklich nicht an
den Eigentümer —, ist sie hier trivial. Sie gehört trotzdem ausdrücklich beantwortet,
weil Stolperstein 20 sie verlangt.

**Stolperstein 18 geprüft, nicht zutreffend.** An `rating_criteria` schreibt
nichts mit `INSERT OR REPLACE` — die Grundausstattung in `db.js` benutzt
`INSERT OR IGNORE`, der Import legt mit blankem `INSERT` an, und die
Verwaltung schreibt `UPDATE` auf eine bestehende Zeile. Damit kann keine Zeile
still verschwinden und ihre `ratings` über die Kaskade mitnehmen.

**`ALTER TABLE ADD COLUMN` mit `NOT NULL DEFAULT` ist in SQLite erlaubt** und
füllt vorhandene Zeilen sofort — es ist derselbe Weg, den `umstieg083()` schon
gegangen ist.

---

## 12. Prüfstand

Nach den Regeln des Projekts: jede Verweigerung braucht ihre eigene Gegenprobe
mit zweiter Sitzung (Stolperstein 3), jedes neue Bedienelement braucht ein
wirklich zugestelltes Ereignis (Stolperstein 17), und ein Doppelgänger muss
antworten wie der echte Server (Stolperstein 90).

| # | Prüfung | Warum sie da sein muss |
|---|---|---|
| 1 | Frische Anlage: alle drei Grundkriterien haben `gewicht = 1` | Vorgabe in der DDL |
| 2 | Migration: Datenbank ohne Spalte bekommt sie, Bestandszeilen auf 1,0 | Stolperstein 20 |
| 3 | Migration ist wiederholbar und beim zweiten Lauf stumm | Muster von `umstieg083` |
| 4 | **Alle Gewichte 1 → `avgRating` bitgleich zum ungewichteten Ergebnis** | *die* Regressionsprüfung |
| 5 | A=5 (×2), B=1 (×1) → **3,7**; dieselben Werte ungewichtet → **3,0** | die Wirkung selbst |
| 6 | **3 Kriterien, nur eines bewertet (3, ×0,2), die anderen ×2 unbewertet → 3,0** | die Falle aus Abschnitt 2 |
| 7 | Alle Werte 5 bei gemischten Gewichten → **genau 5,0**; alle Werte 1 → **genau 1,0** | die zugesicherten Grenzen |
| 8 | Extremfall 1 (×0,2) gegen 5 (×2) → Ergebnis zwischen 1 und 5 | Grenzen unter Last |
| 9 | Abgewiesen mit 400: `0`, `-1`, `-1,5`, `2,1`, `3`, `"abc"`, `null`, `Infinity` | `gueltigesGewicht()`, „nur positiv" eingeschlossen |
| 10 | Nach einer Abweisung steht der **alte** Wert unverändert in der Datenbank | keine halbe Schreibung |
| 11 | Ein `user` bekommt 403 — **zweite Sitzung, echter zweiter Keks** | Stolperstein 3 |
| 12 | **Vergleich: „meine" ist ebenso gewichtet wie „alle"** — Prüflage, in der sich beide Zahlen ungewichtet *und* gewichtet unterscheiden | die zweite Rechenstelle |
| 13 | Vergleich: die Hervorhebung des besten Werts je Kriterium bleibt unverändert | Zusicherung an die feste Skala |
| 14 | Export enthält `criteriaGewichte`; Kriterien mit Gewicht 1 fehlen darin | nur Abweichungen |
| 15 | Import einer Datei **ohne** das Feld → alles 1,0 | ältere Dateien bleiben lesbar |
| 16 | Import: ein bekanntes Kriterium behält sein Gewicht, ein neues bekommt das aus der Datei | Import ändert keine Einstellung |
| 17 | Import mit ungültigem Gewicht: fällt auf 1,0, Einspielung läuft durch, Protokoll nennt es | nicht abbrechen, melden |
| 18 | **Sortierung `rating_desc`: zwei Einträge tauschen die Reihenfolge, wenn ein Gewicht sich ändert** | die Wirkung erreicht die Übersicht |
| 19 | Ein Gewichtswechsel rührt `items.updated_at` **nicht** an | sonst sortierte sich die Übersicht um |
| 20 | Oberfläche: `×1,5` steht an der Zeile, `×1` steht nirgends | Ableitung, kein Schalter |
| 21 | Oberfläche: das Wort „gewichtet" am Blockkopf erscheint nur bei Abweichung | dito |
| 22 | Oberfläche: Auswahl im `select` löst über ein echtes `change`-Ereignis den Schreibweg aus | Stolperstein 17 |
| 23 | Oberfläche: Ziehen der Kriterienzeile startet **nicht**, wenn das Eingabefeld berührt wird | Fallstrick 1 aus 7.1 |
| 24 | Oberfläche: `1,2` im Feld ergibt 1,2 in der Datenbank | deutsches Komma |
| 25 | Oberfläche: `1.2` im Feld ergibt ebenfalls 1,2 | eingefügte Werte scheitern nicht |
| 26 | Anzeige: 1 → `1`, 1,2 → `1,2`, 1,25 → `1,25` — **nie** `1,0` oder `1,50` | keine erfundene Genauigkeit |
| 27 | `1,234` wird zu 1,23 **und das Feld zeigt danach `1,23`** | gerundet, aber nicht still |
| 28 | Leeres Feld: alter Wert kehrt zurück, **keine** Anfrage geht raus | Fallstrick 3 aus 7.1 |
| 29 | Eine Absage vom Server setzt das Feld auf den alten Wert zurück | kein Wert im Feld, der nicht gespeichert ist |
| 30 | Die Fehlermeldung des Servers trägt ein **Komma**, keinen Punkt | `zahl()` |
| 31 | Nach einem Gewichtswechsel wird die Liste **nicht** neu gezeichnet, die Zeile trägt trotzdem den neuen Wert | Fallstrick 2 aus 7.1 |
| 32 | Ein offenes Umbenennen an derselben Zeile überlebt einen Gewichtswechsel daneben | dito |
| 33 | Quelltext-Wächter: `GEWICHT_MIN` steht genau einmal | eine Wahrheit |
| 34 | Quelltext-Wächter: `F_ROUTEN` hat weiterhin 46 Einträge | keine neue schreibende Route |

**Prüfung 4** ist die wichtigste: sie belegt, dass ein Einspielen dieser
Version in einen laufenden Bestand keine einzige angezeigte Zahl verändert.
Sie sollte an einer Prüflage mit mehreren Bewertern und ungleich vielen
Stimmen je Kriterium hängen, sonst belegt sie zu wenig.

**Prüfung 6 und 12** sind die beiden, die man ohne dieses Papier vergäße.

**Zum Doppelgänger** (Stolperstein 90): er muss `gewicht` an **allen**
Kriterienzeilen liefern, und mindestens zwei davon mit **verschiedenen**
Werten — einer davon 1, damit sich Anzeige und Nichtanzeige gleichzeitig
belegen lassen. Und sein `avgRating` muss sich nach einem Gewichtswechsel
wirklich ändern; eine erstarrte Antwort nähme genau die Prüfung weg, für die
er gebaut wurde.

---

## 13. Was sich ausdrücklich nicht ändert

- **Die Skala bleibt 1–5.** Kein Kriterienwert ändert sich, nirgends.
- **`avg` und `count` je Kriterium bleiben ungewichtet.** Sie sind eine
  Aussage über das Kriterium.
- **Die zweistufige Rechnung bleibt.** Erst je Kriterium über alle Bewerter,
  dann über die Kriterien. Nur der zweite Schritt bekommt Gewichte.
- **Gerundet wird genau einmal**, am Ende.
- **`sort_order` und `gewicht` bleiben getrennt.** Naheliegend wäre, das
  Gewicht aus der Reihenfolge abzuleiten — eine Wahrheit statt zweier. Das
  wäre trotzdem falsch: `renumberCriteria()` nummeriert lückenlos durch, ein
  neu eingeschobenes Kriterium verschöbe damit **still sämtliche Gewichte**,
  und zwei gleich wichtige Kriterien in fester Anzeigereihenfolge wären
  unmöglich. Die Reihenfolge ist eine Aussage über die Anzeige, das Gewicht
  eine über die Rechnung. Zwei Aussagen, zwei Spalten.
- **Kein persönliches Gewicht.** Zwei Leute mit verschiedenen Gewichten hätten
  zwei verschiedene Gesamtschnitte für denselben Eintrag — eine zweite
  Wahrheit in Reinform. Das Gewicht gehört dem Admin, wie alles, was an allen
  Einträgen aller Benutzer erscheint.
- **Kein Eintrag im Vokabular.** „Gewicht" ist ein Wort über die Rechnung,
  nicht über den Gegenstand. Die elf Wörter bleiben elf.
- **`updated_at` bleibt unberührt.** Ein Gewichtswechsel ist keine Änderung an
  einem Eintrag; die Übersicht darf sich davon nicht umsortieren.

---

## 14. Was du entscheiden musst

Vier Punkte, bei denen ich eine Empfehlung habe, aber keine Gewissheit:

| | Frage | Meine Empfehlung |
|---|---|---|
| 1 | ~~Sechs Stufen oder freie Zehntel?~~ | **Entschieden:** drei Vorschläge (1 · 1,2 · 1,5) in einer Vorschlagsliste, freie Eingabe von 0,2 bis 2, immer positiv, Anzeige mit Komma. Eingebaut in Abschnitt 5 und 7.1. |
| 2 | ~~Auswahlfeld in der Zeile oder Eingabe hinter dem ✎?~~ | **Hinfällig durch 1:** es wird ein Textfeld mit Vorschlagsliste in der Zeile. Es speichert bei `change`, es steht in der `ignore`-Liste von `makeSortable` schon drin, und es kommt dem Inline-Umbenennen nicht in die Quere, solange nach einem Gewichtswechsel **nicht** neu gezeichnet wird. |
| 3 | **Zusammen mit G4 oder als eigene Stufe?** | Eigene Stufe. Eine gesparte Formatnummer wiegt weniger als eine Stufe, die am Stück durchdacht werden kann. **So entschieden und so gebaut: G4 auf 0.8.30 allein, Format 7.** |
| 4 | **Vorschau der Rangfolge im Systembereich?** | Später, nicht jetzt. Sie ist das, was Gewichte im Alltag richtig bedienbar macht — aber sie ist eine eigene Ansicht mit eigenem Endpunkt, und die Gewichtung funktioniert ohne sie vollständig. |
| 5 | **Soll es auch einen Vorschlag unter 1 geben?** | Aus meiner Sicht nicht nötig — wer nach unten will, tippt 0,8. Wenn du es anders siehst, ist es eine Zeile in `app.js`. |

---

## 15. Umfang

| Ort | Was | Größe |
|---|---|---|
| `db.js` | Spalte in der DDL, Migrationsblock | ~25 Zeilen |
| `server.js` | `qSchnittJeKriterium` um den JOIN, `gesamtSchnitt()` gewichtet, `gueltigesGewicht()`, `PUT /api/criteria/:id`, `qCriteria`, `detail()` | ~40 Zeilen |
| `server.js` | Export-Feld, Import-Zweig | ~20 Zeilen |
| `public/app.js` | Eingabefeld mit Vorschlagsliste in der Kriterienkarte, `gewichtAusText()` / `gewichtText()`, `×1,5` an drei Anzeigeorten, `eigenerSchnitt()` gewichtet | ~55 Zeilen |
| `public/style.css` | eine Klasse für die Gewichtsmarke | ~6 Zeilen |
| `pruefung.js` | 34 Prüfungen | ~260 Zeilen |
| Doku | Projektstand Abschnitt 4 und 5, README, Änderungsprotokoll | — |

**Eine Stufe, ein Durchgang.** Kein Tabellenneubau, keine neue Route, keine
Rechteänderung, `F_ROUTEN` unverändert bei 46. Die riskanteste Stelle ist
nicht der Code, sondern die Frage aus Abschnitt 2 — und die ist hier so
gelöst, dass sie nicht mehr auftreten kann.
