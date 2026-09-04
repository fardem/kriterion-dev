# Auftrag 0.22.0 — „Die Oberfläche wird ruhiger, und sie redet Deutsch"

**Vorher: der Stand, auf dem diese Runde aufsetzt.** *Seine Versionsnummer, sein Fingerprint,
die Zahl der Prüfungen, der Rückbauten (samt höchster Nummer), der Stolpersteine, `F_ROUTEN`,
die Zwecke der zweiten Bestätigung, die Migrationsblöcke, das Austauschformat, die Karten in
den Einstellungen und die ausgelieferten Module stehen im Änderungsprotokoll 0.21.1* — **und
werden von dort übernommen, beim Start des Chats, nicht beim Schreiben dieses Auftrags.**

**Gebaut wird gegen `0.21.1`, Fingerprint `2295870b`** — im Feld seit dem 4. September 2026.

> **WAS DIESE RUNDE AN DEN ZAHLEN ÄNDERT:**
>
> | | diese Runde |
> |---|---|
> | Schema | **nein** — keine Spalte, kein Migrationsblock, kein Bestandslauf |
> | Austauschformat | **unverändert** (13) — das Vokabular reist in den Einstellungen und nicht im Export; **das ist beim Bauen zu bestätigen** |
> | `F_ROUTEN` | **unverändert** (70) — die Einstellung `streifen` reist auf `PUT /api/settings` mit, wie `schrift` |
> | Zwecke der zweiten Bestätigung | unverändert |
> | Karten in den Einstellungen | **21, unverändert** — es kommt keine dazu und es fällt keine weg; drei werden umbenannt |
> | ausgelieferte Module | unverändert |
> | **Vokabular** | **12 → 14 Wörter** — `bewertungEinzahl`, `bewertungMehrzahl` (E14) |
> | Prüfstand, Rückbauten, Stolpersteine | wachsen — **ab der jeweils nächsten freien Nummer** *(Prüfungen **5571**, Rückbau **624**, Stolperstein **314**, Stand 0.21.1)* |
>
> **Die Zeilenangaben in diesem Auftrag und in den beiden Konzeptpapieren sind auf 0.21.1
> gerechnet und am Wortlaut nachgeprüft. Sie sind Orientierung, keine Zusage** — der Text ist
> der Anker, nicht die Zahl.

---

## Das Papier zu dieser Runde liegt daneben, und es gilt

**`Doku/Konzept_Oberflaeche_0_22_0.md`** — die Ausarbeitung: die drei Befunde, die
Gestaltungsregeln G1 bis G8, die Sprachregeln S1 bis S7, das Wörterbuch, die Ideentafel N1 bis
N12, die sechzehn Entscheidungen mit Begründung, und was ausdrücklich nicht mitkommt.

**`Doku/Konzept_Oberflaeche_0_22_0_Anlage.md`** — die Arbeitsliste: rund 250 Textstellen in
acht Abschnitten, jede mit Zeile, Rolle, heutigem Wortlaut, Befund und Vorschlag.

> **DIESER AUFTRAG WIEDERHOLT DIE BEIDEN PAPIERE NICHT.** Er sagt, **was gebaut wird, in
> welcher Reihenfolge, und was dabei nicht verhandelbar ist.** *Wo er schweigt, gilt das
> Konzept; wo er dem Konzept widerspricht, gilt er — und der Widerspruch gehört ins
> Änderungsprotokoll.*

---

## Worum es geht, in drei Sätzen

**Die Oberfläche ist sachlich und richtig gebaut, aber sie antwortet nicht auf Berührung, sie
trägt an zwei Stellen Milchglas gegen die eigene Regel, und ihre wichtigsten Beschriftungen
sind die kleinste Schrift auf dem Bildschirm.** **Sie redet an rund 230 Stellen wie unter
Programmierkollegen** — Kunstdeutsch („trägt", „fallen", „Blick", „Grabstein", „Sicherungsweg"),
Begründungen aus dem Bauen („das ist so gewollt und bleibt so"), drei Wörter für dieselbe
Sache, und vier Server-Befehle im Bildschirmtext, einen davon vor den Augen jedes Benutzers.
**Und der Systembereich ist ein Handbuch, das in Karten zerschnitten wurde:** rund 2 500 Wörter
Erklärtext auf einundzwanzig Kacheln.

**Diese Runde ändert daran die Form und die Sprache — und keine einzige Funktion.**

---

## Die Beschlüsse, und sie sind gefallen

**Am 4. September 2026 im Gespräch mit dem Betreiber, sechzehn Stück.** *Die Begründungen und
die jeweils verworfene Möglichkeit stehen im Konzept, Abschnitt 9.1. Hier steht nur, was gilt.*

| Nr. | gilt |
|---|---|
| **E1** | Der Bereich hinter dem Zahnrad heißt **„Einstellungen"** |
| **E2** | Die eigene Karte heißt **„Mein Konto"**, Reiter und Karte der Verwaltung heißen **„Benutzer"**; die Rolle heißt weiterhin „Benutzer" |
| **E3** | **„Registrierung"** statt „Selbstanmeldung"; auf der Anmeldeseite **„Zugang beantragen"**; die eingegangene Bitte bleibt **„Anfrage"** |
| **E4** | **Eine Runde, fünf Bauabschnitte** — die Reihenfolge steht unten |
| **E5** | **„Wer hat bewertet"** statt „Stimmen" |
| **E6** | Die Karte heißt **„Bildformate"** statt „Bildablage" |
| **E7** | **„Suchmaschinen"** statt „Suchanbieter", **„Standard"** statt „Start", **„Such-URL"** statt „Vorlage" |
| **E8** | Hinter einem Aufklapper **„Weitere Filter"** wandert **allein die Tagzeile**; die Ablehnungsgruppe bleibt in der Statuszeile |
| **E9** | Der Bildausschnitt lässt sich als **Rechteck** aufziehen; **der Schieber bleibt** |
| **E10** | Der Knopf **„Eintrag löschen" erscheint nur für Verfasser und Admin** |
| **E11** | Bildstreifen: Stufen **60 · 80 · 100 · 120 · 150 px**, Vorgabe **80** |
| **E12** | Ruhige Karten bekommen den **leiseren Rand** (`--line-2`) — **am gebauten Stand anzusehen** |
| **E13** | Der Kasten mit dem Schlüssel im Klartext **gehört dem Eigentümer** |
| **E14** | **„Bewertung" wird Vokabelwort, als Paar** — `bewertungEinzahl`, `bewertungMehrzahl` |
| **E15** | Der Rücksetzknopf der Sternzeile **wandert ganz nach rechts, hinter die Durchschnittszahl** |
| **E16** | Die Meldung nach dem Zurücksetzen trägt **„Rückgängig"** |

---

## Bauabschnitt 1 — das Stilblatt

**`public/style.css`, und so wenig `public/app.js` wie möglich.** Die Kennwerte stehen im
Konzept, 6.1; hier steht, was nicht verhandelbar ist.

### 1.1 Was fällt

**Das Milchglas fällt an beiden Stellen, an denen es heute steht** — an der Kopfzeile
(`backdrop-filter: blur(10px)`) und am Dialoghintergrund (`blur(3px)`).

> **DAS IST DER EIGENTLICHE PUNKT DIESES ABSCHNITTS UND KEINE GESCHMACKSFRAGE.** *Der
> Projektstand lehnt Milchglas in Abschnitt 10a ausdrücklich ab — „kostet auf dem Telefon
> spürbar Leistung und macht Text unruhig" —, und die Kopfzeile bricht die Regel, seit es sie
> gibt.* **Eine Regel, die im Papier steht und im Stilblatt gebrochen wird, ist keine Regel:
> der Prüfstand bekommt sie deshalb als Zusage** (unten), und das ist Kandidat für einen
> Stolperstein.

Die Kopfzeile wird deckend (`--bg`) und **setzt sich beim Rollen mit einem Schatten ab**
(`--sh-sm`, Klasse ab acht Pixeln Rollweg). Der Dialoghintergrund bleibt ein dunkler Schleier.

### 1.2 Eine Antwort auf jede Berührung

**Alles, was man anfassen kann, antwortet gleich:** Rand oder Hintergrund eine Stufe heller,
**150 ms**, über die vorhandene Kurve `--ease`. Das betrifft namentlich die Listenzeilen
(`.mrow`, `.trow`, `.arow`), die Reiter, die Blockköpfe und die Pillen — **heute antwortet dort
nur `.lrow`.** Die Kacheln heben sich um **zwei** Pixel statt drei, ihr Bild wächst um zwei
statt drei Prozent.

**Von selbst bewegen sich genau zwei Dinge:** die Glocke, wenn der Punkt erscheint (einmal,
300 ms), und der Rand einer Karte, die gerade gespeichert wurde (einmal, 400 ms, `--green-dim`).
**`prefers-reduced-motion` nimmt weiterhin alles weg** — die Zeile steht schon da und bleibt.

### 1.3 Lesbarkeit

**`.label` wächst von 0,7 auf 0,8 rem und von `--faint` auf `--muted`.** Das ist die Schrift,
mit der ein Neuling sich orientiert — „Kategorie", „Tags", „Bewertung", „Testtage" —, und sie
ist heute die kleinste und blasseste auf dem Bildschirm.

**Kein Text unter 0,78 rem, den jemand lesen muss, um zu bedienen.** *Tooltips, Datumszeilen
und Kennzahlen dürfen kleiner bleiben; sie ergänzen, sie führen nicht.*

### 1.4 Marken für Rolle und Zustand

**In der Benutzerliste steht die Rolle als Marke und der Zustand als Punkt** — die Werte stehen
im Konzept, 6.7. **Gebaut aus Form, nicht aus neuer Farbe** (G1): gefüllt, umrandet, neutral;
Punkt in Grün, gedämpftem Grau und Orange, weil diese drei Farben „aktiv", „zurückgenommen" und
„wartet auf Bedienung" ohnehin schon bedeuten.

### 1.5 Die kleinen Dinge aus der Ideentafel

**N1 — eigene Zeichen statt Emoji und Schriftzeichen.** Die Anwendung hat schon SVG-Zeichen mit
einer Strichstärke; die Zeilenaktionen (`✎ ✕ ↩ ☐ ☑ 🔗 🔑 ⃠`) und das Emoji `📌` kommen dazu.
**Das ist der größte einzelne Schritt zu „modern", ohne eine Regel zu berühren** — 24er Raster,
Strich 1,8, keine Icon-Schrift, kein CDN.

**N2 — tabellarische Ziffern** (`font-variant-numeric: tabular-nums`) in Listen, Kennzahlen und
Sternspalten. **N3 — die leeren Zustände** bekommen das vorhandene Platzhalterzeichen über dem
Satz.

*N4 und N5 sind beim Ansehen als schon vorhanden erkannt worden und entfallen (Konzept,
Abschnitt 7).*

### 1.6 Der leisere Rand — und die Auflage dazu

**E12 wird gebaut** (`--line-2` an Systemkarten und Blöcken) **und im Augenschein geprüft.**
*Trägt er auf einem gewöhnlichen Bildschirm nicht, wird er zurückgenommen* — das ist kein
Scheitern, sondern der Zweck des Augenscheins, und es gehört ins Änderungsprotokoll.

---

## Bauabschnitt 2 — die zwei Vokabelwörter

**VOR dem Textdurchgang, und das ist der Grund für die Reihenfolge:** wer die Texte erst
schreibt und danach das Vokabelwort einzieht, fasst dieselben Sätze zweimal an.

**Was zu tun ist, steht vollständig im Konzept, 9.4.** Der Kern:

* `VOKABULAR_VORGABE` in `server.js` bekommt **`bewertungEinzahl: 'Bewertung'`** und
  **`bewertungMehrzahl: 'Bewertungen'`**, mit demselben Kommentar wie bei `potenzial`.
* `V` in `public/app.js` bekommt sie ebenfalls — **wer dort ein Wort vergisst, sieht das Feld
  in der Vokabularkarte leer**; genau das ist beim Bauen von 0.21.0 mit `potenzial` passiert
  und steht als Warnung im Quelltext.
* **Die Vokabularkarte bekommt zwei Felder — vierzehn statt zwölf** —, und die Vorschau unter
  den Feldern zeigt sie mit.
* **Die Karte „Bewertungskriterien" heißt „Bewertung: Kriterien"** — ein Vokabelwort wird nie in
  ein zusammengesetztes Wort verbaut, und die Nachbarkarte heißt seit 0.21.0 „Potenzial:
  Kriterien". **Der Kartenschlüssel im Quelltext (`kriterien`) bleibt: ein Bildschirmtext
  benennt keine Adresse um.**
* **61 Stellen in `public/app.js` gehen über `V`**, davon 19 in der Mehrzahl. Jeder Satz ist
  dabei auf die Vokabelregel zu prüfen: **kein Artikel, kein Beiwort davor, kein Dativ Plural.**

> **DAS AUSTAUSCHFORMAT BLEIBT 13, UND DAS IST BEIM BAUEN ZU BESTÄTIGEN.** *Nach Durchsicht der
> Exportroute nimmt sie den Bestand und die Kriterien mit, nicht die Einstellungen — und das
> Vokabular liegt in den Einstellungen.* **Stimmt das nicht, ist es ein Befund und ändert die
> Zahl in der Tafel oben.**

---

## Bauabschnitt 3 — die Texte

**Bereich für Bereich in der Reihenfolge der Anlage (A bis H, dazu C1), je Bereich mit einem
Blick durch alle drei Rollen.**

### 3.1 Die sieben Regeln gelten für jeden Satz

**S1 bis S7 stehen im Konzept, 4.2.** Die drei, an denen die Runde hängt:

**Ein Text sagt, was ist und was der Klick tut** — nicht, warum es so gebaut wurde. *Die Probe:
steht im Satz ein „weil", ein „deshalb", ein „so gewollt", ein „wie bisher", gehört er in die
README.* **Eine fachliche Warnung ist erlaubt, und eine Folge, die man kennen muss, um zu
entscheiden, auch.**

**Eine Sache, ein Wort.** Das Wörterbuch im Konzept, 4.3, legt es fest. **Wer ein zweites Wort
braucht, ändert das Wörterbuch und alle Stellen — nicht nur die eine.**

**Dialoge folgen einer Form.** Titel: Verb, Objekt, Fragezeichen. Ein Satz. Der Knopf
wiederholt das Verb. **„Abbrechen" bricht immer ab, ohne Ausnahme.**

### 3.2 Die Maße

| | höchstens |
|---|---|
| Kartenbeschreibung | ein Satz, 20 Wörter |
| Tooltip | 8 Wörter |
| Meldung (Toast) | 5 Wörter |
| Dialogtext | zwei Sätze |
| Fehlermeldung | was nicht ging — und, wenn es einen gibt, der nächste Schritt |

**Der Benutzerbereich hält diese Maße immer.** Admin und Eigentümer dürfen sie überschreiten —
**aber nur hinter „Mehr"** (Konzept, 4.5).

### 3.3 Drei Dinge, die dabei nicht vergessen werden dürfen

**Die Server-Befehle verlassen den Fließtext.** Vier Stellen tragen heute
`docker compose exec …`; **eine davon sieht jeder Benutzer** (die Wiederherstellungscodes).
Sie ziehen in den Kasten **„Auf dem Server"**, den **nur der Eigentümer** sieht: Überschrift,
ein Satz, der Befehl in Schreibmaschinenschrift mit Kopierknopf. *Das ist die einzige Stelle,
an der ein solcher Befehl am Bildschirm stehen darf.*

**Was hinter einer Rolle liegt, wird ihr nicht erklärt.** Der Benutzer liest heute auf der
Karte „Kategorien", wie man umbenennt und löscht — beides darf er nicht. **Er sieht die Liste
und einen Satz; die Werkzeuge und ihre Erklärung sieht der Admin.**

**Der Klartextschlüssel gehört dem Eigentümer** (E13). Der Admin sieht stattdessen einen Satz:
der Schlüssel liegt noch neben der Datenbank, und der Eigentümer sollte das ändern.

### 3.4 Die Texte aus 0.21.1

**Anlage, Abschnitt C1.** Drei der fünf neuen Texte sind ohne Befund und bleiben. **Zwei
Tooltips werden gekürzt** — der an der abgeleiteten Pille und der an der zweiten Beschriftung
(22 Wörter, mit Anführungszeichen im Anführungszeichen). **Und der Rücksetzer sagt seit 0.21.1
nicht mehr die ganze Wahrheit:** er beendet auch die Handwahl, danach folgt der Status wieder
der Sortierung. *Sein Text nennt das nicht.*

---

## Bauabschnitt 4 — die Dialoge

**Acht Stellen benutzen heute die rohen Browserfenster `confirm()` und `prompt()`.** Sie gehen
auf die eigenen Fenster, die längst dastehen: `confirmBox`, `nameBox`, `passwortFenster`.

**Zwei davon sind mehr als Form:**

> **DER LÖSCHDIALOG FÜR EINEN BENUTZER SAGT HEUTE DAS GEGENTEIL VON DEM, WAS ER TUT.** Vier
> Fenster hintereinander, und in den ersten beiden heißt **„Abbrechen" nicht „abbrechen",
> sondern „seine Einträge behalten und trotzdem weiter löschen"**. *Das ist kein Stilproblem.*
>
> **Gebaut wird ein Fenster:** Titel „Benutzer „x" löschen?", **zwei Häkchen** („Seine 5
> Einträge mitlöschen — samt 3 fremden Beiträgen daran", „Seine Beiträge in fremden Einträgen
> mitlöschen"), ein Satz zum Sperren als Alternative, **zwei Knöpfe: „Abbrechen" und „Benutzer
> löschen"**. Danach, wie heute, die Passwortabfrage.

> **EIN FREMDES PASSWORT WIRD HEUTE ÜBER `prompt()` ABGEFRAGT UND DABEI IM KLARTEXT
> ANGEZEIGT.** Es bekommt ein eigenes Fenster mit einem Passwortfeld.

---

## Bauabschnitt 5 — Bildstreifen, Ausschnitt, Sternzeile

### 5.1 Der Bildstreifen nutzt die Breite, und seine Größe ist eine Einstellung

**Die Telefonfassung wird auf alle Schirme gezogen:** `.thumbs` überall als Raster mit
`repeat(auto-fill, minmax(var(--streifen), 1fr))`, `.thumb` mit `aspect-ratio: 1/1`. **Der tote
Rest rechts in jeder vollen Zeile verschwindet, und die Kacheln werden dabei von selbst
größer.**

**Die Mindestgröße kommt aus einer Einstellung** — **dieselbe Maschine wie `schrift`**
(`getUserSetting`, `PUT /api/settings`), persönlich je Zugang, **ein Wert für alle Geräte**.
Stufen **60 · 80 · 100 · 120 · 150 px, Vorgabe 80** (E11). Der Regler steht **neben der
Schriftgröße** in der Karte „Darstellung".

> **DIE OBERGRENZE 150 IST KEINE GESCHMACKSFRAGE.** *Das gespeicherte Vorschaubild hat 512 px
> auf der kurzen Kante; darüber verlässt die Anzeige seine Reserve, und es bräuchte eine neue
> Ableitung — das wäre eine andere Runde.* **Kein Bestandslauf.**

### 5.2 Der Ausschnitt als Rechteck

**Ein Rechteck aufziehen setzt Punkt und Weite in einer Geste.** *Es ist eine Bedienform und
kein neues Feld: `focus_x`, `focus_y` und `zoom` bleiben, wie sie sind.* **Der Schieber bleibt**
(E9) — für den Finger und für die Feinarbeit.

### 5.3 Die Sternzeile

**Der Rücksetzknopf steht heute zwei Pixel hinter dem fünften Stern** (`.stars { gap: 2px }`).
**Er wandert ganz nach rechts, hinter die Durchschnittszahl** (E15), und wird ein eigener
runder Knopf mit dem Zeichen „zurücksetzen".

**Die drei Auflagen dazu stehen im Konzept, 6.5a, und keine ist verhandelbar:**

1. **Eigene Rasterspalte, nicht in die Zelle der Zahl** — sonst wandert die Zahl, sobald eine
   Zeile keinen Knopf trägt, und die Sterne springen wieder. *Genau den Sprung hat 0.21.0
   abgeschafft.*
2. **Bei einem einzigen Zugang gibt es die Zahlenspalte nicht** (`.rlist.ohne-schnitt`) — dort
   braucht der Knopf **mindestens 12 px** Abstand aus der Rasterlücke, sonst ist der Befund
   nicht behoben.
3. **Neben der Durchschnittszahl darf er nicht wie ein Löschknopf für fremde Bewertungen
   gelesen werden.** Dagegen: eigene Spalte, sichtbar abgesetzter Knopf, **und der Hinweistext
   behält das Wort „Meine".**

**Und die Meldung bekommt „Rückgängig"** (E16): *„Sterne bei „Qualität" entfernt · Rückgängig"*.
Das Zurücksetzen ist heute ein `PUT` mit `value: 0`; **das Zurückschreiben ist derselbe Ruf mit
dem alten Wert.** Keine neue Route, kein Feld. Was dazukommt, ist **ein Knopf in der Meldung** —
`toast()` trägt heute nur Text.

> **„RÜCKGÄNGIG" SCHREIBT DEN EIGENEN ALTEN WERT ZURÜCK UND SONST NICHTS.** Es ist kein Verlauf
> und keine Wiederherstellung, sondern die Umkehr genau des einen Klicks, der die Meldung
> ausgelöst hat.

---

## Was ausdrücklich NICHT gebaut wird

* **Keine Funktion fällt weg, und keine kommt dazu** — außer den zwei Vokabelwörtern (E14).
  **Jedes Bedienelement, das es heute gibt, gibt es nachher noch**, an derselben Stelle oder
  eine Ebene tiefer. *Verschwinden dürfen genau fünf Dinge: Erklärtext (in die README oder
  hinter „Mehr"), doppelte Leerzustände, die rohen Browserfenster, das Milchglas — und der
  Knopf „Eintrag löschen" bei dem, der nicht löschen darf (E10).*
* **Keine neue Farbe.** Gold bleibt Bewertung und Anheftung, Orange Art und Bedienung, Grün
  erledigt und getestet, Blau die Aufgabe, Rot das Zerstören.
* **Kein helles Farbschema.** *Es ist beschlossen — aber als eigene Runde danach (N6).*
* **Keine Seitenleiste in den Einstellungen, keine randlosen Karten, kein Filterkasten, keine
  Listenansicht, keine Farbe je Kategorie** — die Begründungen stehen in der Ideentafel
  (Konzept, Abschnitt 7, N8 bis N12).
* **Kein Umzug einer Karte zwischen Reitern**, keine neue Karte, keine gestrichene.
* **Keine Sprachdatei.** Die Mehrsprachigkeit ist eine eigene Runde (Fahrplan 0.28.0); diese
  hier bereitet sie vor, indem sie je Sache ein Wort festlegt.
* **Kein Kommentar im Quelltext wird angefasst, der nicht an einem geänderten Text hängt.**
  *Die Kommentare sind eine eigene Runde nach der Bereinigung.*
* **Die Regeln, die frühere Runden Lehrgeld gekostet haben, bleiben unberührt:** die Höhe einer
  Kartenreihe und die Deckel der Listen (0.17.2 bis 0.18.1), die gemessenen Kachelmaße
  (240 / 200 / 150 px), die Umbruchpunkte, die Stapelordnung, „ein Markup, zwei Gestalten".
* **Die Kopplung aus 0.21.1** (die Sortierung gibt den Statusfilter vor) **wird vorgefunden und
  nicht angefasst.**

---

## Der Prüfstand — was er halten muss

**Alle vorhandenen Gruppen bleiben grün.** Wo eine Zusage an einem Wortlaut hängt, der sich
ändert, **wird sie umgedreht und nicht gelöscht** (Stolperstein 74). *Betroffen sind
mindestens die Gruppen zu Filtern, Ansichten, Blöcken, Dialogen, Rollen und Sitzungen —
`pruefung.js` sucht Wortlaute („Meine Sitzungen" elfmal, „Alles anzeigen" viermal, „Angemeldet
als" dreimal), und `gegenprobe.js` sucht Quelltextzeilen mit Texten darin.* **Das ist die
eigentliche Arbeit hinter den 250 Stellen und der Grund, warum eine Textrunde nicht „nur Text"
ist.**

**Neu zu belegen ist mindestens:**

1. **Der Bildschirmtext-Wächter.** Der Sprachwächter liest heute Kommentare und Papiere; ein
   zweiter Durchgang liest **die Texte in Anführungszeichen und Backticks von `public/app.js`**
   — also gerade das, was der erste wegwirft — und die `error:`-Texte der Serverdateien, gegen
   die Verbotsliste aus dem Konzept, 4.3. *Bezeichner sind kein Text und werden nicht gelesen;
   die Wortliste des ersten Wächters bleibt, wie sie ist.*
2. **Kein `backdrop-filter` im Stilblatt** — eine Regelprüfung wie die zu `[hidden]` aus 0.15.1,
   damit das Milchglas nicht zurückkommt.
3. **Kein `confirm(` und kein `prompt(` in `public/app.js`.**
4. **Server-Befehle nur im Kasten:** `docker compose` und `zugang.js` kommen in `public/app.js`
   nur innerhalb des Eigentümer-Kastens vor — **gezählt, nicht gesucht.**
5. **Die Einstellung `streifen`:** gültige Stufen, Rückfall auf die Vorgabe, und ein Rückbau,
   der eine ungültige Stufe durchlässt.
6. **Das Vokabular steht bei vierzehn** — die Zahl ausdrücklich, wie bei `F_ROUTEN`; dazu ein
   Rückbau, der eines der zwei neuen Wörter vergisst.
7. **Die Sternzeile:** der Knopf in seiner eigenen Spalte; **die Sterne aller Zeilen beginnen an
   derselben Stelle, auch wenn eine Zeile keinen Knopf trägt**; bei einem einzigen Zugang hat
   der Knopf seinen Abstand; **„Rückgängig" schreibt den alten Wert zurück** — am gesendeten
   Rumpf zu prüfen, nicht an der Anzeige.
8. **Der Aufklapper „Weitere Filter":** greift ein Tagfilter, **steht der Kasten beim Aufbau
   offen**; `filterZahl()` zählt ihn weiter mit.
9. **Die Rollenweichen:** der Löschknopf am Eintrag, der Schlüsselkasten, die Karten
   „Kategorien" und „Tags" — **je Rolle geprüft, nicht nur als Admin.**

**Und eine Zählung, die kein Prüflauf leisten kann:** die **Bedienelemente je Ansicht und je
Rolle, vorher und nachher**, als Tabelle im Änderungsprotokoll. *Eine Zahl, die kleiner wird,
braucht eine Zeile, die sagt, wohin das Element gezogen ist.*

**Rückbauten ab 624**, für jede neue Regel mindestens einer — **und einer, der das Milchglas
wieder einsetzt.**

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der Sprachwächter läuft mit,
  und seine Dateiliste ist gepflegt.
* **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.** *Die Zeichen aus N1
  liegen als SVG im Quelltext; keine Icon-Schrift, kein CDN — die Installation läuft ohne
  Internet.*
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.** *Die Pixelmaße aus
  6.1 sind Vorgaben und werden am gebauten Stand nachgemessen.*
* **Der Augenschein gehört zur Runde und nicht ans Ende:** je Bauabschnitt ein Blick auf einen
  breiten Schirm und ein Telefon, **und je Rolle einer.** *Was dabei auffällt, gehört ins
  Änderungsprotokoll — auch das, was zurückgenommen wird.*
* **Neue Stolpersteine ab 314.** Kandidaten aus dem Konzept:
  - *Eine Regel, die im Papier steht und im Stilblatt gebrochen wird, ist keine Regel — der
    Prüfstand muss sie kennen* (das Milchglas).
  - *Ein Text, den nur die Rolle darüber braucht, gehört hinter deren Klemme* (der
    Server-Befehl vor den Augen jedes Benutzers).
  - *„Abbrechen" bricht ab* (der Löschdialog für einen Benutzer).
* **Neue Rückbauten ab 624. Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein
  161) — *erst das Objekt, dann sein Inhalt* (Stolperstein 311).
* **Rückbauten mitgehen lassen, nicht löschen** (Stolperstein 201), wo ihr Suchtext sich
  verschiebt. **Betroffen ist diesmal fast jeder, der einen Bildschirmtext sucht.**
* **VOR DEM GEGENPROBENLAUF: kein fremder Server.** Der Treiber sieht selbst nach und bricht ab
  (`fremdeServer()`), *aber er findet nur, was `node server.js` oder `node pruefung.js` heißt*
  (Stolperstein 310).
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll geschnittene Commits
  mit deutschen Meldungen** — *bei einer Runde dieser Größe sind fünf bis sieben Schnitte
  richtig: das Stilblatt, die Vokabelwörter, die Texte in zwei bis drei Teilen, die Dialoge,
  Bildstreifen und Sternzeile, der Prüfstand samt Rückbauten, die Papiere.*
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft ein letztes Mal
  gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.22.0.md`** liegt im Branch: was gebaut wurde je Datei, **das
  beschlossene Wörterbuch mit den sechzehn Entscheidungen und ihrer Begründung**, die Tabelle
  der Bedienelemente vorher/nachher, die Kennwerte des Stilblatts **gemessen**, was umgedreht
  statt gelöscht wurde, neue Stolpersteine, die Gegenprobentabelle, Prüfungszahlen
  vorher/nachher, Rückbauten vorher/nachher *(vorher jeweils aus dem Protokoll 0.21.1)*,
  Offengebliebenes — **und was im Augenschein zurückgenommen wurde.**
* Die Zeile „0.22.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT gebildet**,
  nach der letzten Änderung an einer ausgelieferten Datei — die Versionsnummer in
  `package.json` eingeschlossen, **und `package-lock.json` trägt sie an zwei Stellen ein
  zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** *Kein Migrationsblock, keine
  Spalte, kein Bestandslauf.* **Der Rückweg auf 0.21.1 ist offen:** eine ältere Fassung kennt
  die zwei neuen Vokabelwörter nicht und zeigt dort ihre eingebauten Wörter; **umbenannte Wörter
  bleiben in den Einstellungen stehen und kommen beim nächsten Einspielen zurück.** **Nach dem
  Einspielen im Browser einmal hart neu laden.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat, nicht in den
  Dokumenten.** Darunter: **die Einstellungen öffnen** *(sie heißen so, und der Reiter heißt
  „Benutzer")*, **einen Bildstreifen verstellen** *(er wirkt sofort und auf jedem Gerät)*,
  **eine Bewertung zurücksetzen und „Rückgängig" drücken** *(der alte Wert steht wieder da)*,
  **einen Benutzer löschen** *(ein Fenster, zwei Häkchen, „Abbrechen" bricht ab)*, **„Bewertung"
  im Vokabular umbenennen** *(es ändert sich der Kastenkopf, die Sortierung, der Vergleich, die
  Kachel und die Karte)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_22_0`), und **alle Verweise sind
  nachzuziehen.** Kopf, Betriebsstand, **Abschnitt 4 (Funktionsumfang, wo die Karten stehen)**,
  **Abschnitt 5.6 (Anzeige und Bedienung)**, Stolpersteine, Prüfstand, Versionsgeschichte,
  Fahrplan, offene Betriebspunkte.
* **Abschnitt 5.6 bekommt die Gestaltungsregeln G1 bis G8 und die Sprachregeln S1 bis S7 als
  geschriebene Regel** — *sonst läuft es beim nächsten Mal wieder auseinander.* **Das ist keine
  Zugabe, sondern der Grund, warum diese Runde eine Runde ist und kein Anstrich.**
* **Der Fahrplan:** 0.22.0 ist gebaut und wandert in die Versionsgeschichte. **Die Runde
  dahinter steht schon da** — 0.23.0, „Die Oberfläche wird hell", am 4. September 2026
  eingetragen. *Dabei ist nichts gerückt, und an der Regel steht seither, welcher ihrer beiden
  Sätze gilt: die freien Nummern verhindern Nachrücker, also rückt auch das Belegen einer
  Lücke nichts. Die nächste eingeschobene Runde nimmt 0.25.0.*
* **README:** die Abschnitte, deren Wörter sich ändern (E1 bis E3, E5 bis E7), der Absatz zum
  Bildstreifen unter „Bedienung", der Absatz zum Rechteck — **und ein eigener Abschnitt „Auf dem
  Server"** für die Handgriffe, die vom Bildschirm hierher ziehen.
* **`CHANGELOG.md`** in der Form ab 0.17.2 — **ohne Kasten**, es ist keine Datenbankstufe; mit
  einem Satz zu dem, was ein Betreiber merkt: **die Wörter sind andere, der Bildstreifen ist
  einstellbar, und die Sternzeile hat ihren Rücksetzknopf woanders.**
* **Das Sammelblatt:** Punkt 10 (der Bildstreifen) ist mit dieser Runde gebaut und wandert
  heraus; **die zwölf liegen gebliebenen Sätze aus Teil II** („Dieselbe Art Satz wie in Punkt 2
  von 0.17.0 steht an zwölf weiteren Stellen") **sind mit dieser Runde erledigt und werden dort
  so vermerkt.**
* **Die beiden Konzeptpapiere bleiben liegen**, wie `Konzept_Potenzial.md` — als Herleitung.
  *Ob die Anlage nach dem Bauen bleibt oder mit dem Änderungsprotokoll herausfällt, entscheidet
  der Betreiber beim Schreiben der Papiere.*
* **Der vorige Auftrag fällt mit diesem Auftrag weg** — *es liegt immer nur einer im Repo.*
  **Dieser hier fällt weg, wenn der nächste geschrieben wird.**

---

## Was danach offen bleibt

* **Das helle Farbschema — 0.23.0, „Die Oberfläche wird hell".** *Am 4. September 2026 in den
  Fahrplan eingetragen und in Abschnitt 10a ausgearbeitet; es ist dabei nichts gerückt.* Rund
  30 Farbwerte ein zweites Mal, die Bedeutungsfarben auf hellem Grund neu abgestimmt,
  `theme-color` je Schema, jedes Foto auf hellem Grund angesehen. **Sie setzt auf den
  Gestaltungsregeln dieser Runde auf** — deshalb steht sie dahinter und nicht daneben.
* **Die Mehrsprachigkeit** (Fahrplan 0.28.0) — sie kommt nach dieser Runde und wegen ihr.
* **Die Ideen, die stehen geblieben sind:** die Übersicht der Tastenkürzel (N7), die kompakte
  Listenansicht (N11) — *die ist eine Funktion, kein Anstrich, und gehört ins Sammelblatt.*
* **Die Verlaufs-Sortierungen** (Testtage, Note ⌀, letzte Note) — *sie setzen „getestet" genauso
  voraus wie die Bewertung; 0.21.1 hat sie mit Begründung ausgelassen.*
* **Die beiden Handgriffe aus 0.20.0** — eine eigene Datei in den Sicherungsordner legen, und
  die Zeile im Sicherheitsprotokoll je entfernter Kopie. *Sie stehen seit 0.20.1 in dieser
  Liste.*
* **Der volle Gegenprobenlauf** über alle Rückbauten — weiter ausstehend.
