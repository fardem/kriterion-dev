# Änderungsprotokoll 0.8.40 — „Nicht jedes Kriterium wiegt gleich"

**Rohstoff für die Dokumentenpflege.**

**0.8.40 — Fingerprint `49d2ae53`**

Die nächste Runde des Stufenplans, und **keine Stufe des
Mehrbenutzerbetriebs** — der ist mit G4 bis auf H und I gebaut. Es ist eine
**Datenbankstufe**: vollständige DDL in `db.js`, ein Migrationsblock mit Marken,
ein eigener Prüfabschnitt, ein Eintrag unter „Vorgemerkt für 1.0". Die
Sicherung des Datenverzeichnisses gehört in den Einspielweg.

**Was sich ändert, in einem Satz.** Jedes Bewertungskriterium bekommt ein
**Gewicht** zwischen 0,2 und 2, einstellbar vom Admin, und der Gesamtschnitt
eines Eintrags wird zum **gewichteten Mittelwert** — bei Gewicht 1 überall
rechnerisch identisch mit vorher.

**Die Zusicherung ist baulich, nicht geklemmt.** Ein Eintrag kommt nie über 5
und nie unter 1. Das ist keine Regel, die irgendwo durchgesetzt wird: ein
gewichteter Mittelwert liegt bei positiven Gewichten immer zwischen dem
kleinsten und dem größten gemittelten Wert. Es gibt keinen Deckel, der
vergessen werden könnte, weil es keinen Deckel gibt — dieselbe Bauform wie die
Rollenleiter aus 0.8.0.

**Keine neue schreibende Route.** `PUT /api/criteria/:id` gibt es bereits, sie
steht bereits hinter `nurAdmin` und bereits in `F_ROUTEN`. **Die Zahl bleibt
bei 46, und keine Art wechselt** — die erste Runde seit langem, für die das
gilt. Eine eigene Prüfung hält die Zahl jetzt ausdrücklich fest.

**Formatnummer 8 → 9.**

Prüfungen: **1682 → 1807** (125 neue), alle grün.
**30 Gegenproben**, jede in einer Kopie des Arbeitsbaums.

---

## 1. Was gebaut wurde, je Datei

### `db.js` (+47/−1 Zeilen)

`rating_criteria` trägt `gewicht REAL NOT NULL DEFAULT 1.0`, mit dem
Kommentartext aus dem Gewichtungspapier an der Spalte: warum `REAL` und nicht
Hundertstel als `INTEGER`, warum 0 verboten ist, und warum die Untergrenze 0,2
nicht Geschmack, sondern der Grund ist, dass die Division immer aufgeht.

Dazu `migration0840()` mit den Marken der Bauregel — **27 Zeilen**, der
**vierte** markierte Block im Projekt. `PRAGMA table_info(rating_criteria)`
entscheidet, ob etwas zu tun ist; einmalig, wiederholbar und im Normalfall
stumm. Der Export von `migration0840` in `module.exports` trägt dieselbe Marke.

**Die Bestandszeilen bekommen 1,0 aus dem `DEFAULT` der Spalte, nicht aus
einem `UPDATE`.** `ALTER TABLE … ADD COLUMN … NOT NULL DEFAULT 1.0` füllt die
vorhandenen Zeilen selbst — nachgestellt, nicht geglaubt. Jeder andere Wert
änderte beim Einspielen still sämtliche Gesamtschnitte.

**`ordneBestandZu()` ist NICHT angefasst worden.** Dort geht es um `user_id`
und um die Frage, wem eine herrenlose Zeile gehört. Ein Gewicht kann nicht
herrenlos werden — es hat einen `NOT NULL`-Vorgabewert. Die Frage ist gestellt
und verneint worden; eine Quelltextprüfung hält fest, dass `rating_criteria`
im Auffangnetz nicht vorkommt.

### `server.js` (+170/−24 Zeilen)

- **`GEWICHT_MIN = 0.2`, `GEWICHT_MAX = 2.0`, `gueltigesGewicht()` und
  `zahl()`** stehen an **genau einer** Stelle, unmittelbar über `qCriteria`.
  Zwei Schreibwege führen darauf: die Verwaltung und der Import.
- **`qCriteria` liefert `c.gewicht` mit** — ohne die Angabe stünde in der
  Verwaltungskarte bei jedem Neuaufbau wieder die Vorgabe statt des
  gespeicherten Werts.
- **`qSchnittJeKriterium` bekommt einen JOIN auf `rating_criteria`.** Das
  Gewicht reist damit **an der Schnittzeile mit**, statt beim Rechnen separat
  nachgeschlagen zu werden. Der Kommentar darüber ist umgeschrieben: die
  vorhandene Warnung gilt einem zweiten JOIN auf **`ratings`**, der Zeilen
  vervielfacht; `rating_criteria` ist über `criterion_id` eindeutig, die
  Zeilenzahl bleibt. `c.gewicht` steht zusätzlich im `GROUP BY`.
- **`gesamtSchnitt()` ist ein gewichteter Mittelwert.** Zähler und Nenner
  entstehen in **derselben** Schleife aus **derselben** Menge. Gerundet wird
  weiterhin genau einmal, am Ende.
- **`detail()` hängt `gewicht` an jede Kriterienzeile.** Gebraucht wird es für
  die Marke `×1,5` und für die zweite Rechenstelle im Vergleich.
- **`PUT /api/criteria/:id` nimmt `gewicht` entgegen**, freiwillig: das
  Umbenennen schickt nur den Namen, und `COALESCE` lässt das Gewicht dann
  stehen. Name und Gewicht gehen in **einem** `UPDATE` hinaus.
- **`POST /api/criteria` nimmt es ausdrücklich nicht entgegen** — ein neues
  Kriterium startet auf 1,0 aus der DDL und wird danach eingestellt.
- **Export:** `criteriaGewichte` als **zusätzliches** Feld, `criteria` bleibt
  eine Liste von Namen. **Nur Abweichungen** werden geschrieben.
  **Formatnummer 8 → 9.** Der veraltete Kommentar „Formatnummer 6" ist dabei
  mitberichtigt worden.
- **Import:** ein **bekanntes** Kriterium behält sein Gewicht, ein **neu
  angelegtes** bekommt das aus der Datei. Ein ungültiges Gewicht bricht nicht
  ab, sondern fällt auf 1,0 zurück und steht in der Antwort
  (`gewichteVerworfen`) **und** im Protokoll.

### `public/app.js` (+154/−7 Zeilen)

- **`gewichtAusText()`, `gewichtText()` und `gewichtMarke()`** als
  Oberflächenhelfer. Gelesen wird `1,2` und `1.2`, geschrieben wird immer mit
  Komma, ohne nachlaufende Nullen. **Die Spanne selbst steht nicht hier** —
  eine Quelltextprüfung hält das fest.
- **Die Kriterienzeile bekommt ein Eingabefeld** zwischen Name und
  Verwendungszähler: `type="text"` mit `inputmode="decimal"` und
  `list="gewichtsug"`, die Gründe als Kommentar daneben. Vorschläge:
  **0,5 · 0,8 · 1 · 1,2 · 1,5**, freie Eingabe von 0,2 bis 2.
- **`manage()` zeichnet dieselbe Zeile auch für Kategorien und Tags** — das
  Feld hängt deshalb an einem neuen `KIND`-Eintrag `gewicht: true`, nicht an
  einer Abfrage auf den Kartennamen.
- **Nach einem Gewichtswechsel wird die Liste nicht neu gezeichnet.**
- **Die Marke `×1,5`** steht an der Kriterienzeile im Bewertungsblock und an
  der Zeilenbeschriftung im Vergleich, **nur bei Abweichung von 1**.
- **Das Wort „gewichtet"** am Blockkopf, abgeleitet aus den **bewerteten**
  Kriterien.
- **`eigenerSchnitt()` rechnet gewichtet** — die zweite Rechenstelle, und sie
  ist Absicht. Der Nenner zählt nur die Kriterien, die *ich* bewertet habe.

### `public/style.css` (+30/−0 Zeilen)

`.rgew`/`.cgew` für die Marke (gedämpft, Festbreitenschrift, keine neue Farbe)
und `.mgew`/`.mgew-feld`/`.mgew-fest` für die Zeile im Systembereich. Das Feld
steht **dauerhaft** da, anders als ✎ und ✕ — es zeigt einen Wert, es ist keine
Aktion.

### `pruefung.js` (+954/−20 Zeilen)

Fünf neue Gruppen — darunter der Migrationsabschnitt —, fünf erweiterte, neue
Wächter über den Quelltext und ein Mock, der `gewicht` an jeder
Kriterienzeile mitbringt, drei verschiedene Gewichte kennt (eines davon 1) und
seit dieser Runde auch **Kategorien** liefert.

### `auth.js`

**Unberührt.** Ein Gewicht ist keine Angabe über einen Zugang.

---

## 2. Abweichungen und Entscheidungen

### A. Der `CHECK` bleibt weg — aber die Begründung des Papiers ist falsch

Das Gewichtungspapier (Abschnitt 3) begründet den fehlenden `CHECK` damit,
dass „SQLite ein CHECK nicht per `ALTER TABLE` nachrüsten kann". **Das ist
nachgestellt worden, und es stimmt nicht:**

```
ALTER TABLE k ADD COLUMN gewicht REAL NOT NULL DEFAULT 1.0
  CHECK (gewicht BETWEEN 0.2 AND 2.0)     -> angenommen
UPDATE k SET gewicht = 5                  -> CHECK constraint failed
```

Die Spalte lässt sich also samt `CHECK` nachrüsten, und er greift danach. Die
befürchtete Abweichung zwischen frischer und migrierter Anlage entstünde gar
nicht.

**Der `CHECK` bleibt trotzdem weg, aus dem tragfähigen Grund:** die Spanne
stünde dann **zweimal** — in der DDL und als `GEWICHT_MIN`/`GEWICHT_MAX` im
Server. Zwei Stellen für dieselbe Grenze laufen auseinander, und die in der
Datenbank meldete sich nicht als Absage mit Meldung, sondern als abgebrochene
Schreibung. Ein `CHECK` erzwänge außerdem die Rundung auf Hundertstel nicht —
er wäre eine halbe Wahrheit. Beides steht als Kommentar an der Spalte.

→ **Stolperstein 106.**

### B. Die Vorschlagsliste reicht unter 1

Das Papier schlägt **1 · 1,2 · 1,5** vor und lässt die Frage offen
(Abschnitt 14, Punkt 5). Gebaut ist **0,5 · 0,8 · 1 · 1,2 · 1,5**.

Der Grund ist nicht, dass man häufiger nach unten gewichtete — das Papier hat
darin recht. Der Grund ist, dass **die Liste der einzige Ort ist, an dem der
Bereich unter 1 überhaupt sichtbar wird.** Ohne sie bliebe er da und wäre nur
nicht auffindbar. Sie kostet eine Zeile in `app.js`, und der Server merkt
davon nichts.

### C. „gewichtet" leitet sich aus den bewerteten Kriterien ab

Das Papier leitet das Wort aus `it.ratings.some(r => r.gewicht !== 1)` ab —
also aus **allen** Kriterien des Eintrags. Gebaut ist
`(r.value > 0 || r.avg != null) && r.gewicht !== 1`.

Ein Kriterium mit Gewicht 1,5, das an diesem Eintrag niemand bewertet hat,
geht in die Rechnung gar nicht ein. Das Wort stünde dann an einer Zahl, an der
keine Gewichtung stattgefunden hat. Die Ableitung ist dadurch etwas
umständlicher; die Aussage stimmt dafür. Die Marke `×1,5` an der Zeile bleibt
davon unberührt — sie ist eine Aussage über das **Kriterium**, nicht über die
Zahl. Beide Fälle haben ihre eigene Prüflage.

### D. Wo das Feld steht — die Zeile war besetzt

Die Zeile trug Griff, Name, Verwendungszähler, ✎ und ✕. Das Papier zeichnet
das Feld zwischen Name und Zähler, ungeprüft. **Angesehen und übernommen:**
`.mname` trägt `flex: 1` und schiebt alles Weitere nach rechts; das Feld sitzt
damit an der Kante zwischen Beschriftung und Kennzahlen. Rechts der Knöpfe
wäre es zwischen zwei Aktionen geraten, obwohl es keine ist.

**Wer nicht verwalten darf, sieht das Gewicht als Text statt als Feld.** Es
erklärt die Kopfzahl an jedem Eintrag, und die sieht er ja auch — dieselbe
Haltung wie bei Name und Zähler daneben, die für jeden dastehen.

### E. Zwei Unstimmigkeiten im Papier, die den Bau nicht berühren

- **Alle Zeilennummern sind weitergerückt.** `qSchnittJeKriterium` steht nicht
  bei `server.js:1077`, sondern bei 1119; `gesamtSchnitt()` nicht bei 1128,
  sondern bei 1170; die Sternzeile in `detail()` nicht bei 1214, sondern bei
  1275; `eigenerSchnitt()` nicht bei `app.js:1322`, sondern bei 1323. Das
  Papier ist auf dem Stand 0.8.6 geschrieben.
- **Die Formatnummer steht an drei Stellen noch alt.** Der Kopfvermerk sagt
  8 → 9 richtig. Falsch geblieben sind: das JSON-Beispiel in Abschnitt 10
  (`"version": 7`), der Satz „die Gewichtung wird 0.8.40 mit Format 8"
  ebenda — und **Prüfung 22 in Abschnitt 12** spricht von einer „Auswahl im
  `select`", obwohl die Entscheidung längst auf ein Textfeld mit
  Vorschlagsliste gefallen ist. Das ist ein Rest der ersten Fassung.
- **Der Migrationsblock heißt im Papier `umstiegGewicht()`.** Gebaut ist
  `migration0840()`, wie der Auftrag verlangt und wie die drei Blöcke davor
  heißen.

### F. Ein veralteter Kommentar im Quelltext, mitberichtigt

Über `res.json({ … version: 8 … })` stand „Formatnummer 6 (mit
Verfassernamen)", obwohl schon 8 ausgeliefert wurde. Die Stelle wird in dieser
Runde ohnehin angefasst; der Kommentar ist jetzt zeitlos formuliert und nennt
keine Nummer mehr, die veralten kann.

---

## 3. Neue Stolpersteine

**Die Zählung setzt bei 106 fort.**

106. **Ein Wächter über den Quelltext färbt sich am Warnschild statt an der
    Sache.** Zwei Prüfungen dieser Runde sind daran gescheitert, und zwar
    beide am unveränderten Stand: Die Prüfung „die Spalte trägt keinen
    `CHECK`" las den DDL-Text aus `sqlite_master` — und **SQLite speichert die
    Kommentare mit**, in denen das Wort `CHECK` erklärt wird, warum keiner
    dasteht. Die Prüfung „nirgends wird über ALLE Gewichte summiert" las
    `server.js` als Ganzes — und traf den Kommentar, der den falschen Griff
    ausschreibt, damit ihn der Nächste nicht für einen guten hält.
    *Wer eine Regel als Text prüft, prüft Code — der Kommentar daneben ist die
    Erklärung der Regel und darf sie nicht auslösen.* Die Antwort ist beide
    Male dieselbe Sorte: die eine Prüfung sieht sich jetzt das **Verhalten**
    an (ein Wert außerhalb der Spanne muss durchgehen), die andere filtert die
    Kommentarzeilen weg — samt einer Gegenprobe, dass sie danach überhaupt
    noch Code liest.

107. **`ALTER TABLE … ADD COLUMN … CHECK (…)` geht sehr wohl.** Nachgestellt
    statt geglaubt, und diesmal fiel die *Behauptung* und nicht der Bau: das
    Gewichtungspapier verneint es, SQLite nimmt es an, und der `CHECK` greift
    danach. Das Gegenstück zu Stolperstein 105, der dieselbe Frage für
    `REFERENCES` gestellt und andersherum beantwortet hat.
    *Zwei Nachrüstungen, zwei verschiedene Antworten — die eine sagt nichts
    über die andere.*

---

## 4. Gegenprobentabelle

**30 Rückbauten, jeder in einer Kopie des Arbeitsbaums** (Stolperstein 100),
und vor jedem Deuten per `diff` belegt (Stolperstein 75).

| Rückbau | Ergebnis |
|---|---|
| **Der Nenner geht über ALLE Kriterien** statt über die bewerteten | **9 rot** — darunter „Alle Gewichte 1: der Gesamtschnitt ist der ungewichtete", „Ein unbewertetes Kriterium bringt sein Gewicht NICHT in den Nenner" und der Quelltext-Wächter |
| `gesamtSchnitt()` rechnet wieder ungewichtet | 5 rot |
| `qSchnittJeKriterium` bringt das Gewicht nicht mehr mit | 5 rot — **dieselben Namen wie darüber**, und das ist richtig: derselbe Defekt über zwei Wege. Er belegt, dass das Gewicht ausschließlich über den JOIN in die Rechnung kommt |
| `detail()` liefert kein `gewicht` an der Kriterienzeile | **1 rot** — die Prüfung an der echten Serverantwort (Stolperstein 102) |
| `/api/criteria` liefert kein `gewicht` | 6 rot |
| `PUT /api/criteria/:id` nimmt kein Gewicht mehr entgegen | 28 rot |
| `gueltigesGewicht()` prüft die Spanne nicht mehr | 12 rot |
| `gueltigesGewicht()` rundet nicht mehr auf Hundertstel | 2 rot |
| Die Meldung trägt einen Punkt statt eines Kommas | **1 rot** |
| Umbenennen setzt das Gewicht mit zurück (kein `COALESCE`) | **1 rot** |
| **Der Migrationsblock wird nicht mehr gefahren** | 9 rot — *im ersten Anlauf riss der Lauf ab und nannte keinen einzigen Namen; siehe „Was die Gegenproben gefunden haben"* |
| Die Spalte steht nicht mehr in der DDL | **1 rot** — nur „Eine frische Anlage trägt die Spalte ohne Migration". *Stolperstein 81 in Reinform: die Migration trägt sie in der frischen Anlage nach* |
| Der Export schreibt die Gewichte gar nicht mit | 4 rot |
| Der Export schreibt auch die Einsen mit | 2 rot |
| Der Import überschreibt das Gewicht eines bekannten Kriteriums | **1 rot** |
| Ein ungültiges Gewicht bricht die Einspielung ab | 4 rot |
| `eigenerSchnitt()` rechnet wieder ungewichtet | 2 rot |
| `eigenerSchnitt()` nimmt auch unbewertete Kriterien in den Nenner | 3 rot — **eine mehr** als darüber, und es ist die eigene: „Ein Kriterium ohne eigenen Wert bringt sein Gewicht nicht in den Nenner" |
| Die Marke steht auch bei Gewicht 1 | 5 rot |
| „gewichtet" wird über **alle** statt über die bewerteten Kriterien abgeleitet | **1 rot** — genau die Prüfung, die es ohne die Entscheidung nicht gäbe |
| **Das Gewichtsfeld erscheint auch bei Kategorien und Tags** | *zuerst **stumm**, siehe unten* — nach dem Fund 4 rot |
| Ein leeres Feld wird als Null gelesen | **1 rot** |
| Das Komma wird nicht mehr in einen Punkt übersetzt | 9 rot |
| Die Anzeige bekommt nachlaufende Nullen | 8 rot |
| Nach einem Gewichtswechsel wird die Liste neu gezeichnet | 2 rot — darunter „Ein offenes Umbenennen überlebt den Gewichtswechsel daneben" |
| Das Feld wird ein `type="number"` | 12 rot |
| `POST /api/criteria` nimmt doch ein Gewicht entgegen | **1 rot** |
| Das Feld wird auch ohne Adminrecht ein Eingabefeld | 2 rot |
| Die Breite des Feldes steht wieder in `px` | **1 rot** — die Stylesheet-Prüfung (Lücke 1) |
| Die Gewichtsmarke wird golden statt gedämpft | **1 rot** — dito |

**Zwei Gegenproben haben etwas gefunden, und sie sind der Ertrag dieser Runde:**

**1. Der Rückbau des Migrationsblocks riss den Lauf ab, statt rot zu werden.**
Fehlt die Spalte, wirft jede Prüfzeile, die sie liest, einen SQL-Fehler — und
`pruefe()` rechnet die Bedingung vor dem Aufruf. Der Lauf endete mit
„Prueflauf abgebrochen" und **nannte keinen einzigen Namen**. Das ist
Stolperstein 103 an einer neuen Stelle: dort war es `liste[0].feld`, hier ist
es eine fehlende Spalte. Behoben, indem **jede** Lesestelle auf `gewicht` im
Prüfstand abgefangen wird und eine leere Liste zurückgibt — danach werden neun
Prüfungen namentlich rot, wie es sein soll.

**2. Die Gegenprobe „das Feld erscheint auch bei Kategorien und Tags" blieb
vollständig stumm.** Der Grund ist Stolperstein 81 in Reinform: der
Mock lieferte für `/api/product-categories` eine **leere Liste**, und
die Prüflage hatte keine Tags. „Keine der 0 Zeilen trägt ein Gewichtsfeld" ist
wahr und belegt nichts. Behoben, indem der Mock zwei Kategorien und
zwei Tags mitbringt und **vor** jeder Eigenschaftsprüfung geprüft wird, dass
die Karte überhaupt Zeilen hat.

**Kein weiterer Rückbau blieb stumm, und keiner riss den Lauf ab.**

---

## 5. Prüfungszahlen

**1682 → 1807, alle grün.** 125 neue Prüfungen, fünf neue Gruppen.

| Gruppe | Prüfungen | |
|---|---|---|
| `Das Gewicht im Systembereich` | 33 | neu |
| `Gewichtung: was angenommen wird und was nicht` | 27 | neu |
| `Gewichtung: der Rechenweg` | 16 | neu |
| `MIGRATION 0.8.40 — ENTFAELLT MIT 1.0` | 15 | neu |
| `Das Gewicht am Eintrag` | 9 | neu |
| `Export und Import` | +12 | erweitert |
| `Der Waechter ueber den Quelltext` | +7 | erweitert |
| `Der Umschalter der Vergleichsansicht` | +4 | erweitert |
| `Frische Installation` | +1 | erweitert |
| `MIGRATION 0.8.31 — ENTFAELLT MIT 1.0` | +1 | erweitert |

**Die wichtigste Prüfung der Runde hängt an der Lage mit den drei Bewertern**
(Gruppe „Gewichtung: der Rechenweg"), also an ungleich vielen Stimmen je
Kriterium: Optik 3, Haptik 2, Preis 1, Kundendienst 0. Sie belegt, dass bei
Gewicht 1 überall der gewichtete Schnitt bitgleich zum ungewichteten ist —
und die Gegenzahl wird **aus den Zeilenwerten der Antwort nachgerechnet**,
nicht hingeschrieben. An einer Lage mit einer Stimme je Kriterium belegte sie
zu wenig.

**Die Falle aus Abschnitt 2 des Gewichtungspapiers steht zweimal darin**,
einmal in ihrer milden und einmal in ihrer schärfsten Form: ein unbewertetes
Kriterium bei Gewicht 2 darf den Schnitt nicht bewegen — und ein Eintrag, an
dem **nur eines** von vier Kriterien bewertet ist, mit Gewicht 0,2 gegen drei
unbewertete à 2, muss den Wert dieses einen Kriteriums zeigen. Ein Nenner über
alle ergäbe dort 0,1.

**Der Migrationsabschnitt sieht sich das Schema am Verhalten an, nicht am Text.**
`PRAGMA table_info` liefert `notnull` und die Vorgabe; ob ein `CHECK` dasteht,
wird durch einen Schreibversuch außerhalb der Spanne festgestellt. Ein Wächter
über den DDL-Text färbte sich am Kommentar (Stolperstein 106).

**Zwei Ergänzungen im Prüfstand, die nicht zur Gewichtung gehören und
trotzdem dazugehören:** der Lauf über **alle** Migrationsblöcke (im Abschnitt
von 0.8.31) trägt jetzt auch `rating_criteria`, und `F_ROUTEN` wird
ausdrücklich **auf die Zahl 46** geprüft, nicht mehr nur auf die
Übereinstimmung mit dem Quelltext.

---

## 6. Vorgemerkt für 1.0

*Zum Übernehmen in Projektstand Abschnitt 10 — der **vierte** markierte Block
im Projekt.*

> - **`db.js`, `migration0840()` — 27 Zeilen samt Marken, 15 Prüfungen**
>   (seit 0.8.40). Ergänzt `gewicht` an `rating_criteria` in einer Datenbank
>   aus 0.8.0 bis 0.8.31; die Bestandszeilen bekommen 1,0 aus dem `DEFAULT`
>   der Spalte. Zu 1.0 fällt der Block weg, **die Spalte in der DDL bleibt** —
>   die Prüfung „Eine frische Anlage trägt die Spalte ohne Migration" hält genau
>   das fest. Die zugehörigen Prüfungen stehen im Abschnitt „MIGRATION 0.8.40 —
>   ENTFAELLT MIT 1.0" in `pruefung.js` (196 Zeilen); der Export von
>   `migration0840` in `module.exports` trägt dieselbe Marke und fällt mit.
>   **Was ausdrücklich NICHT mitfällt:** alles, was mit der Spalte selbst zu
>   tun hat — `GEWICHT_MIN`/`GEWICHT_MAX`, `gueltigesGewicht()`, der JOIN in
>   `qSchnittJeKriterium`, der gewichtete `gesamtSchnitt()`, das Feld in der
>   Verwaltungskarte und `criteriaGewichte` im Austauschformat. Die Migration
>   trägt die Spalte nach, er trägt die Gewichtung nicht.
>   **Und `rating_criteria` kommt in `ordneBestandZu()` gar nicht vor** —
>   anders als bei 0.8.30 und 0.8.31 gibt es hier nichts, was nicht mitfallen
>   dürfte.
>   **Eine Prüfung gehört ALLEN vier Blöcken:** „Ein Sprung von 0.8.20 fährt
>   ALLE Migrationen in einem Start". Sie steht im Abschnitt von 0.8.31 und ist
>   beim Rückbau umzuschreiben, nicht zu löschen.

---

## 7. Offen geblieben

- **Die Vorschau der Rangfolge im Systembereich** — sehen, wie sich die Spitze
  verschiebt, wenn man an einem Gewicht dreht. Das ist es, was Gewichte im
  Alltag richtig bedienbar macht; es ist aber eine eigene Ansicht mit eigenem
  Endpunkt. Steht als Punkt 4 in Abschnitt 14 des Gewichtungspapiers und
  bleibt vorgemerkt.
- **Der Docker-Bau ist für diese Runde nicht wiederholt worden.** Diese Runde
  fasst keine Abhängigkeit an. Der **Migration** ist im Prüfstand belegt, nicht
  im Container.
- **Das Aussehen der neuen Zeile ist ungeprüft**, wie jedes Aussehen: der
  Prüfstand belegt, dass das Feld an seiner Stelle im DOM steht und die
  richtigen Merkmale trägt, nicht wie es aussieht. Die Stelle ist vor dem
  Bauen angesehen worden, weil die letzten beiden Runden zweimal gezeigt
  haben, was sonst passiert.
- **`avg` und `count` je Kriterium bleiben ungewichtet**, und das ist eine
  Entscheidung: sie sind eine Aussage über das Kriterium, nicht über den
  Eintrag. Sie zu gewichten hieße, sie mit sich selbst zu gewichten.
- **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut.
- **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier bleibt
  offen und weiterhin nicht zusammengelegt.
