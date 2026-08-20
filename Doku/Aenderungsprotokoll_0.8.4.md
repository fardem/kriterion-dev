# Änderungsprotokoll 0.8.4 — Stufe G2, zweite Hälfte (Rest)

**Rohstoff für die Dokumentenpflege. Projektstand und Konzeptpapier sind nicht
angefasst.**

Gebaut wurden **alle fünf Auftragspunkte**. Der Haltepunkt nach Punkt 4 wurde
erreicht und als eigener Stand festgehalten; Punkt 5 ist danach gebaut worden,
weil noch Luft war. **Damit ist Stufe G2 vollständig.**

Prüfungen: **1243 → 1349** (106 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — keine neue schreibende Route, zwei
geänderte Arten.
**Kein Punkt hat das Schema angefasst.** Es ist kein Umstiegscode entstanden,
und für „Vorgemerkt für 1.0" fällt aus dieser Version **nichts** an.

---

## 1. Was gebaut wurde, je Datei

### `package.json`
Version auf `0.8.4`.

### `db.js`, `auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`, `public/style.css`
**Unverändert.** Auch das Stylesheet: der Eingriffsvermerk trägt weiterhin
`.cmt-eingriff`, der Umschalter der Vergleichsansicht benutzt die vorhandenen
`.pills` / `.pill` / `.pill.on`.

### `server.js` (+117 Zeilen)

**Punkt 2 — `updated_at` an den Bildwegen.**
- Neue vorbereitete Anweisung **`kommentarBearbeitet`** neben `touch`, mit der
  Begründung als zeitlosem Kommentar: eine Stelle für beide Bildwege, weil
  Anhängen und Entfernen dieselbe Aussage über denselben Menschen sind.
- `POST /api/comments/:id/images` setzt `updated_at` — **nur wenn wirklich ein
  Bild angekommen ist** (`if (k.bilder.length)`; siehe Abweichung 2).
- `DELETE /api/comment-images/:id` bekommt ein **`if/else`** um die vorhandene
  Bedingung: Vermerk beim Fremden, `updated_at` beim Verfasser. Damit ist
  „genau eines von beiden, nie beides und nie keines" **baulich** wahr und
  keine Regel, die jemand einhalten müsste.

**Punkt 4 — die beiden Anlegen-Schalter.**
- `freiAnlegen(schluessel)` als **Ableitung beim Lesen**
  (`getSetting(k, true) !== false`) und `darfAnlegen(req, schluessel)`
  (`istAdmin(req) || freiAnlegen(...)`), beide bei den übrigen Rechtefunktionen.
- Zwei neue Absagen `VERWEIGERT_TAG_NEU` und `VERWEIGERT_KAT_NEU`.
- `GET /api/settings` und `PUT /api/settings` kennen `tagsFreiAnlegen` und
  `kategorienFreiAnlegen`. **Keine neue Route**: die Adminprüfung in `PUT` ist
  seit 0.6.5 abgeleitet („was nicht persönlich ist, ist Adminsache") und greift
  die beiden neuen Schlüssel von selbst.
- **`findOrCreateTag()` ist in `findeTag()` und `legeTagAn()` zerlegt**
  (Abweichung 1). Die Klemme sitzt an allen drei Anlegewegen **hinter** dem
  Nachschlagen des vorhandenen Namens:
  `POST /api/product-categories`, `POST /api/items/:id/tags`,
  `POST /api/test-days/:id/tags`.
- Der Kommentar über `PUT /api/product-categories/:id` ist nachgezogen: dort
  stand „ein Schalter … steht noch aus".

**Punkt 1 und 3 brauchen am Server nichts** — siehe Abschnitt 2, Punkt 3.

### `public/app.js` (+236 Zeilen)

**Punkt 1.** Der Eingriffsvermerk lautet `2 Bilder vom Admin entfernt` bzw.
`1 Bild vom Admin entfernt`, weiterhin als eigene `<span class="cmt-eingriff">`
in der Kopfzeile. Darüber die Begründung, warum dafür kein Feld nötig ist.

**Punkt 3.** Neue Funktion **`kommentarZahlen(kommentare)`** — **ein Ort**, aus
dem sowohl der aufgeklappte als auch der eingeklappte Zustand liest. Dazu die
Vokabelhelfer `vBericht(n)` und `vAufgabe(n)` im Stil von `vSache` / `vZeit`.
Der Kommentarblock bekommt seinen **Hinweis** `#ccount` in der Kopfzeile, wie
Links und Dateien ihn haben; `blockZusammenfassung('kommentare')` liefert
deshalb **leer** (Abweichung 3), und `ruesteBloeckeAus()` setzt für eine leere
Kurzfassung **keine leere Klammer** mehr.

**Punkt 4.** `TAGS_FREI` / `KATEGORIEN_FREI` aus `/api/settings`, dazu
`darfTagAnlegen()` und `darfKategorieAnlegen()` — beide mit `ADMIN ||`, wie
serverseitig. Am Eintrag verschwinden bei ausgeschaltetem Schalter nur die
**Anlegezeilen**; Auswahlliste, Wolke, Marken und die Vorschlagsliste bleiben.
Die Behandler hängen nur noch an tatsächlich vorhandenen Elementen. Im
Systembereich zwei Häkchen in den Karten „Kategorien" und „Tags", **nur für den
Admin**, über einen gemeinsamen Helfer `anlegeSchalter()`.

**Punkt 5.** `renderCompare()` ist um eine Zeichenfunktion herum umgebaut:
`nurMeine` als **Ansichtszustand im Speicher**, Vorgabe `false` („alle"), ein
Umschalter aus zwei `.pill`-Knöpfen, der nur bei `mehrereBenutzer()` überhaupt
entsteht. `wertVon`, `schnittVon` und `zeitpunkteVon` schalten **gemeinsam**;
`eigenerSchnitt()` bildet die Zahl für „meine" im Klienten und trägt den
Kommentar zum zweiten Rundungsort. Die Zeile über dem Raster sagt, welche Sicht
gerade gilt — aber nur, wenn es den Umschalter gibt.

### `pruefung.js` (+721 Zeilen)
- `RUMPF_WOERTER` um **`darfAnlegen(`** ergänzt (Abweichung 4).
- `F_ROUTEN`: `POST /api/product-categories` `'offen'` → `'im Rumpf'`,
  `POST /api/items/:id/tags` `'nurEintragVerfasser'` →
  `'nurEintragVerfasser, im Rumpf'`. Zahl unverändert 46.
- Neuer Schreibhelfer `fSchreibe()` am Rechte-Server, um Zeitstempel von Hand
  zu leeren (Stolperstein 60).
- `baueDom()` kennt **`zweiterEintrag`** — ohne einen zweiten Detaileintrag
  wäre die Vergleichsansicht gar nicht erreichbar.
- Drei neue Gruppen: **„Wer darf anlegen"** (28), **„Anlegen-Schalter in der
  Oberflaeche"** (19), **„Der Umschalter der Vergleichsansicht"** (18).
- **Zwei Prüfungen umgedreht statt gelöscht** (Stolperstein 74), eine
  **gespalten**, damit zwei Gegenproben nicht dieselbe Punktliste liefern
  (Stolperstein 72).

---

## 2. Abweichungen und Entscheidungen

| # | Was | Entschieden | Begründung |
|---|---|---|---|
| 1 | **`findOrCreateTag()` wird zerlegt** in `findeTag()` und `legeTagAn()` | Nötig, im Papier nicht vorgesehen | **Vor dem Bauen gemeldet.** Bliebe der gemeinsame Helfer, säße die Klemme in *seinem* Rumpf statt in den beiden Routenrümpfen. Der Wächter über den Quelltext fände sie dort nicht, und nach Stolperstein 53 könnte keiner der beiden Wege noch eine Gegenprobe rot machen, die genau ihn meint. Die Gegenproben G17 und G19 belegen jetzt jeden Weg für sich. |
| 2 | **Kein Bild, keine Bearbeitung** | `POST /api/comments/:id/images` setzt `updated_at` nur, wenn wirklich etwas angekommen ist | Nicht im Auftrag, aber die Folge seines eigenen Satzes: „Anhängen ist Bearbeiten". Ein Ruf ohne Datei hat nichts angehängt; „bearbeitet" wäre dort eine Aussage über nichts. Gegenprobe G6. |
| 3 | **Der Kommentarblock trägt seinen Satz im Hinweis, nicht in der Kurzfassung** | Ausdrücklich so, statt `(…)` in der `.bsumme` | **Vor dem Bauen gemeldet und freigegeben.** Zwei Gründe: erstens enthält der Satz selbst schon eine Klammer, `(12 Kommentare … (2 Done))` wäre verschachtelt; zweitens steht der Hinweis in der Kopfzeile und **überlebt das Einklappen von selbst** — beides zugleich ergäbe denselben Satz zweimal nebeneinander, wie ihn Links und Dateien heute mit `(8)` und „8 gespeichert" tragen. Daraus folgt die Zeile in `ruesteBloeckeAus()`: eine leere Kurzfassung erzeugt keine leere Klammer. Siehe Stolperstein 83. |
| 4 | **`RUMPF_WOERTER` bekommt `darfAnlegen(`** | Nötig | Das Konzeptpapier sagt, die Art zweier Routen wechsele auf `'im Rumpf'`; es sagt nicht, dass der Prüfstand dafür ein siebtes Klemmenwort braucht. Ohne den Eintrag wäre `'im Rumpf'` dort eine Behauptung, die der Wächter nicht prüfen kann. Gegenprobe G20 macht ihn namentlich rot. |
| 5 | **Der Admin legt immer an** | Der Schalter bindet den Benutzer, nicht den Admin | **Vor dem Bauen gemeldet und freigegeben.** Die Rechtetabelle (Konzept Abschnitt 3) gibt dem Admin für „Tags und Kategorien anlegen" ein ✔; Abschnitt 7 schweigt dazu. Alles andere wäre schief: er räumt auf und benennt um, müsste aber zum Anlegen erst den eigenen Schalter umlegen. Nebenbei ist `darfAnlegen` damit eine echte Rechteklemme und nicht bloß ein Blick in die Einstellungen. |
| 6 | Zwei Prüfbestände fürs Vokabular | Der vorhandene `eigen` bleibt **unvollständig**, ein zweiter `eigenVoll` kommt daneben | Beim ersten Anlauf war `eigen` um Bericht und Aufgabe ergänzt worden — und drei Prüfungen an der Vokabularkarte wurden rot. Sie hingen genau daran, dass `eigen` diese Wörter **nicht** nennt: die Karte muss für ein fehlendes Wort die Vorgabe zeigen. Siehe Stolperstein 84. |
| 7 | Wortlaut der Kopfzahl im Vergleich | Bleibt in beiden Stellungen **„Durchschnitt"** | In einer 264-px-Spalte ist „eigener Durchschnitt" zu lang, und der Umschalter steht unmittelbar darüber. Welche Sicht gilt, sagt zusätzlich die Zeile über dem Raster — aber nur, wenn es den Umschalter überhaupt gibt. |
| 8 | Vorgabestellung „alle" ändert eine bestehende Anzeige | Hingenommen, ausdrücklich | **Vor dem Bauen gemeldet.** Bis 0.8.3 zeigten die Vergleichsspalten die **eigenen** Werte, die Kopfzeile darüber den Schnitt über alle — genau der Widerspruch, den der Umschalter auflöst. Mit Vorgabe „alle" wechseln die Kriterienwerte deshalb ohne Zutun auf den Schnitt. **Bei genau einem Zugang ändert sich keine einzige Zahl.** |
| 9 | Ein HTML-Kommentar in `public/app.js` | Hingenommen | Die Vorschlagsliste `#tagsug` steht jetzt **außerhalb** der Eingabezeile, weil die Tageingabe am Testtag sie braucht und dort in jedem Fall stehenbleibt. Diese Begründung gehört genau dorthin, und im Innern eines Template-Literals geht nur ein HTML-Kommentar. Es ist der erste in `app.js`; `index.html` hat einen. |
| 10 | `Doku/` bleibt aus `kriterion.zip` heraus | Wie bisher | Das ZIP ist der Quelltext für den Server, und `Dockerfile` kopiert mit `COPY . .` alles, was im Bauverzeichnis liegt. Die Dokumente gehören nicht ins Abbild. *Merkposten:* wer das ZIP künftig selbst packt, sollte entweder `Doku` in `.dockerignore` nachtragen oder es weiter beim Packen weglassen. |

---

## 3. Neue Stolpersteine

**83. Was in der Kopfzeile steht, überlebt das Einklappen — ein zweiter Text
daneben wird dort zur Doppelung, und eine leere Kurzfassung zur leeren
Klammer.** `.block-head` trägt zwei Stellen für Inhaltsangaben: die
Kurzfassung `.bsumme`, die nur eingeklappt erscheint, und den freien Hinweis
(`#lcount`, `#acount`), der immer dasteht. Wer einem Block beides gibt, zeigt
eingeklappt zweimal dasselbe — Links und Dateien tun das heute mit „(8)" und
„8 gespeichert". Und wer die Kurzfassung leer lässt, bekommt „()", eine
Klammer um nichts. **Merksatz: ein Block hat genau eine Stelle für seine
Zahlen; welche, entscheidet, ob sie eingeklappt sichtbar bleiben soll.**

**84. Ein absichtlich unvollständiger Prüfbestand trägt eine Aussage — wer ihn
vervollständigt, löscht sie.** Der Vokabularsatz `eigen` nennt seit jeher nur
Sache, Merkmal und Zeitpunkt. Das ist keine Nachlässigkeit: daran hängen drei
Prüfungen, die belegen, dass die Karte im Systembereich für ein **nicht
genanntes** Wort die Vorgabe zeigt. Die Ergänzung um Bericht und Aufgabe machte
sie rot — und zwar zu Recht. Richtig ist ein **zweiter** Satz daneben.
Verwandt mit 32 („ein Prüfbestand kann eine Regel unprüfbar machen"), aber
umgekehrt: dort verhindert der Bestand eine Prüfung, hier **ist** er eine.

**85. Wo die Anzeige selbst rundet, ist ein Rundungsschritt davor nicht
gegenprüfbar.** `eigenerSchnitt()` rundet auf ein Zehntel, die Kopfzeile
schreibt danach `toFixed(1)` — der Rückbau des `Math.round` bliebe auf dem
Bildschirm vollständig stumm. Der Schritt steht trotzdem: er macht aus dem
rohen Mittel dieselbe **Art** Zahl, die der Server in `avgRating` liefert, und
ohne ihn stünden zwei Sorten Schnitt nebeneinander. **Ein Schritt, dessen
Wirkung erst außerhalb der Anzeige sichtbar würde, gehört mit seinem Grund in
den Kommentar — und in die Liste „nicht gegengeprüft, mit Grund".**

**86. Ein Abbruch in einer Gruppe, die der Rückbau gar nicht berührt, ist erst
ein Fund, wenn er sich allein wiederholen lässt.** Die Gegenprobe G27 (Klient
liest die Schalterstellung nicht mehr) nannte drei richtige rote Punkte und
brach danach in „Erstanmeldung: frische Installation" mit „Zweitserver nicht
erreichbar" ab — einer Gruppe, mit der der Rückbau nichts zu tun hat. Allein
wiederholt lief dieselbe Gegenprobe glatt durch. Es war ein liegengebliebener
Prozess auf dem Prüfport, nicht der Rückbau. **Ergänzung zu 75 und 76: vor dem
Deuten eines Abbruchs die Frage, ob er überhaupt im Wirkbereich des Rückbaus
liegt — und wenn nicht, den Rückbau allein wiederholen.**

---

## 4. Gegenprobentabelle

Jeder Rückbau wurde gegen eine unberührte Kopie **per `diff` belegt**, vor dem
Lauf und nach dem Zurückstellen (Stolperstein 75). Der Schlusslauf lief gegen
einen `diff`-sauberen Quelltext.

### Punkt 1 — der Vermerk nennt die Rolle

| # | Rückbau | rot |
|---|---|---|
| G1 | Der Vermerk sagt wieder nur „entfernt" | **3** — *Der Eingriffsvermerk steht als eigene Angabe in der Kopfzeile* · *Und er nennt die Rolle, nicht die Person* · *Erst deshalb darf der Bildschirm die Rolle nennen* |
| G2 | `darfAendern` fällt aus der Löschroute, grob | **0 — Lauf abgebrochen** nach 5 roten Punkten, siehe unten |
| G2b | Die Klemme bleibt, wird aber anders geschrieben (`b['user_id']`) | **2** — *Sie steht hinter darfAendern — Verfasser oder Admin* · *Erst deshalb darf der Bildschirm die Rolle nennen* |

**G2 gegen G2b** ist die wichtigste Zeile des Punktes und ein Fall von
Stolperstein 82: der grobe Rückbau belegt die **Tragweite** (fünf
Verhaltensprüfungen fallen, dann reißt der Lauf), der engere den **Ort** — er
lässt das Verhalten unangetastet und trifft genau die beiden Prüfungen, die die
Beschriftung an die Klemme binden.

### Punkt 2 — `updated_at` an den Bildwegen

| # | Rückbau | rot |
|---|---|---|
| G3 | Anhängen setzt kein „bearbeitet" mehr | **1** — *Ein nachgereichtes Bild setzt „bearbeitet"* |
| G4 | An der Löschroute gilt **beides** (kein `else`) | **3** — *Aber ausdrücklich KEIN bearbeitet* · *Auch in der Antwort steht kein bearbeitet* · *Der andere Zweig setzt bearbeitet, und es ist ein else* |
| G5 | An der Löschroute gilt **keines** (kein `else`-Zweig) | **3** — *Aber es gilt als Bearbeitung durch ihn selbst* · *Die Antwort sagt dasselbe* · *Der andere Zweig setzt bearbeitet, und es ist ein else* |
| G6 | Auch ein Ruf ohne Datei setzt „bearbeitet" | **1** — *Ein Ruf ohne Datei setzt kein „bearbeitet"* |

**G4 gegen G5** trennt „nie beides" von „nie keines" — beide treffen den
Quelltextwächter, aber ihre Verhaltenshälften sind gegenläufig und
überschneiden sich nicht.

### Punkt 3 — die Zahlen am Kommentarblock

| # | Rückbau | rot |
|---|---|---|
| G7 | Das Erledigte zählt **neben** den Aufgaben | **7**, darunter *Das Erledigte steckt IN den Aufgaben, nicht daneben* · *Die Teilmengen bleiben Teilmengen* |
| G8 | Eine Gruppe mit null verschwindet nicht mehr | **7**, darunter *Nur Notizen: das „davon" fällt ganz weg* |
| G9 | Die Klammer bleibt auch ohne Erledigte stehen | **3** — *Ohne Erledigte fällt die Klammer weg* · *Bei einem einzigen greift überall die Einzahl* · *Und die Einzahl kommt ebenfalls aus dem Vokabular* |
| G10 | „Kommentar" steht immer in der Mehrzahl | **3** — *Ein einzelner Kommentar steht in der Einzahl* · *„Kommentar" bleibt dabei fest* · *Ein erledigtes Todo allein ist immer noch eine Aufgabe* |
| G11 | Bericht und Aufgabe immer in der Mehrzahl | **8** |
| G12 | Die Wörter kommen nicht mehr aus dem Vokabular | **7**, darunter *Die Zahlen am Kommentarblock folgen dem Vokabular* |
| G13 | Die Notiz bekommt eine eigene Gruppe | **12**, darunter *Die NOTIZ bleibt ungenannt* · *Und die ANPINNUNG steht nicht in der Zeile* |
| G14 | Der Hinweis wird gar nicht mehr gefüllt | **4** |
| G15 | Die leere Kurzfassung erzeugt wieder eine Klammer | **1** — *Eingeklappt steht dort keine leere Klammer* |
| G16 | Die Kurzfassung zählt wieder selbst | **2** — *Eingeklappt steht dort keine leere Klammer* · *Der Kommentarblock zählt in seinem Hinweis, nicht in der Kurzfassung* |

**G15 gegen G16** ist das Paar zu Stolperstein 83: der eine belegt die leere
Klammer, der andere die Entscheidung, wo die Zahlen stehen. G15 trifft genau
eine Prüfung — enger geht es nicht.

### Punkt 4 — die beiden Anlegen-Schalter

| # | Rückbau | rot |
|---|---|---|
| G17 | Die Klemme am Eintragstag steht **vor** dem Nachschlagen | **1** — *Einen VORHANDENEN Tag vergibt er trotzdem* |
| G18 | Dasselbe an der Kategorie | **1** — *Eine VORHANDENE Kategorie bekommt er weiterhin — auch in anderer Schreibweise* |
| G19 | Dasselbe am Testtag | **1** — *Einen bekannten Namen weist er dem Testtag weiterhin zu* |
| G20 | Am Eintragstag steht gar keine Klemme mehr | **6**, darunter *Jede Route mit zwei Rechteklassen hat die Klemme im Rumpf* |
| G21 | Der Admin kommt nicht mehr vorbei | **2** — *Der Admin legt auch bei ausgeschaltetem Schalter an* · *Der Admin legt auch hier weiterhin an* |
| G22 | Die Vorgabe steht auf aus statt auf an | **10**, darunter **vier Prüfungen aus früheren Versionen** — *Der Verfasser tut es* · *Der Tag hängt noch am Testtag* · *Eine Kategorie anlegen darf weiterhin jeder* · *Die Kategorie steht unverändert da* |
| G23 | `PUT /api/settings` nimmt die Schlüssel nicht mehr entgegen | **17** |
| G24 | Die Anlegezeilen stehen wieder unbedingt da | **2** |
| G25 | Der Admin fällt in der Oberfläche unter den Schalter | **1** — *Der Admin behält beide Zeilen, auch bei ausgeschaltetem Schalter* |
| G26 | Der Haken steht auch ohne Adminrolle da | **1** — *Ein Benutzer bekommt die Haken gar nicht erst zu sehen* |
| G27 | Der Klient liest die Stellung nicht mehr aus der Antwort | **3** (im Sammellauf mit einem fremden Abbruch, allein wiederholt sauber — Stolperstein 86) |

**G17, G18 und G19 sind die drei wichtigsten Zeilen der ganzen Version.** Sie
verschieben die Klemme, statt sie zu entfernen (Stolperstein 72), und jede
trifft **genau eine** Prüfung: die, die belegt, dass Zuweisen weiterhin jedem
offensteht. **G22 ist der Beleg, dass die Vorgabe „an" nicht bloß behauptet
ist** — vier Prüfungen aus der Zeit vor dem Schalter fallen mit, und genau
deshalb mussten sie nicht umgedreht werden (Stolperstein 74 greift hier
**nicht**: sie sind weiterhin wahr).

### Punkt 5 — der Umschalter der Vergleichsansicht

| # | Rückbau | rot |
|---|---|---|
| G28 | Vorgabestellung „meine" statt „alle" | **4** — *Vorgabestellung ist „alle"* und die drei Prüfungen der Stellung „alle" |
| G29 | Die Kopfzeile schaltet nicht mit | **2** — *Und die Kopfzeile schaltet mit* · *Sie zeigt das Mittel der eigenen Werte, ohne die Nullen* |
| G30 | Die Testtagzeile schaltet nicht mit | **3** — *Die Testtagzeile schaltet mit, gezählt über `mine`* · *Jetzt stehen in den Zeilen die eigenen Werte* · *Und die Hervorhebung wandert mit* |
| G31 | Die Zeilen zeigen wie bisher immer die eigenen Werte | **3** — *In Stellung „alle" zeigen die Zeilen den Schnitt über alle* · *Der beste Wert je Kriterium ist hervorgehoben* · *Und zurück geht es auch* |
| G32 | Der Umschalter erscheint auch bei einem Zugang | **1** — *Aber der Umschalter erscheint gar nicht erst* |
| G33 | Der Umschalter wird zur gespeicherten Einstellung | **1** — *Der Umschalter schreibt nichts an den Server* |
| G34 | Der eigene Schnitt zählt auch die Nullen mit | **1** — *Sie zeigt das Mittel der eigenen Werte, ohne die Nullen* |

**G29 gegen G34 hat beim ersten Anlauf dieselbe Punktliste geliefert** —
Stolperstein 72: dann prüfen sie dieselbe Sache. Die Prüfung *„Und die
Kopfzeile schaltet mit"* ist daraufhin **gespalten** worden: die eine Hälfte
fragt nur, ob sich die Zahl überhaupt bewegt, die andere, ob sie stimmt. Seither
ist G29 eine echte Obermenge von G34.

**Nicht gegengeprüft, mit Grund:**

- **Die Rundung in `eigenerSchnitt()`.** Ihr Rückbau bliebe stumm, weil die
  Kopfzeile mit `toFixed(1)` ohnehin auf dasselbe Zehntel rundet. Sie steht
  trotzdem — siehe Stolperstein 85.
- **Die Klemme in `POST /api/product-categories` als eigener Rückbau.** Sie
  träfe dieselbe Prüfung des Quelltextwächters wie G20 (*Jede Route mit zwei
  Rechteklassen hat die Klemme im Rumpf*); G18 belegt den Ort bereits.

---

## 5. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen gesamt | 1243 | **1349** |
| `F_ROUTEN` | 46 | **46** (unverändert) |
| Formatnummer Export | 6 | **6** (unverändert) |
| Umstiegsblöcke | 1 (`umstieg083`) | **1** (unverändert) |

Neue Prüfungen nach Ort:

| Gruppe | neu |
|---|---|
| Wer darf anlegen *(neu)* | 28 |
| Anlegen-Schalter in der Oberflaeche *(neu)* | 19 |
| Der Umschalter der Vergleichsansicht *(neu)* | 18 |
| Kommentare in der Oberflaeche | 15 |
| Rechte an Kommentaren | 7 |
| Der Waechter ueber den Quelltext | 6 |
| Bilder in Kommentaren | 5 |
| Blöcke anordnen und einklappen | 4 |
| Oberflaeche mit eigenem Vokabular | 3 |
| Einstellungen: Vokabular und Schriftgroesse | 1 |

**34 Gegenproben**, davon eine mit Abbruch und engerer Zweitprobe daneben
(G2/G2b) und eine, die eine Prüfung zum Spalten gezwungen hat (G29/G34).

---

## 6. Vorgemerkt für 1.0

**Aus dieser Version fällt nichts an.** Kein Punkt hat das Schema angefasst, es
ist kein Umstiegscode entstanden, und die beiden Schalter sind ausdrücklich als
**Ableitung beim Lesen** gebaut — ein Schlüssel, der nicht in `settings` steht,
gilt als eingeschaltet. Damit gibt es nichts, was später zu entfernen wäre.

Der vorhandene Eintrag **`db.js`, `umstieg083()`** bleibt unverändert stehen.

---

## 7. Offen geblieben

- **Die `AUTH_RESET`-Zeile** in der Karte „Zugang" (`public/app.js`) sagt
  weiterhin „vergessen heißt `AUTH_RESET=1` am Server". Seit 0.8.0 falsch.
  Gehört zu Stufe G3, wo dieselbe Karte ohnehin angefasst wird — unverändert
  seit 0.8.3.
- **Nicht im Browser gesehen** (Stolperstein 29). Vier Stellen sind am DOM und
  am Stylesheet geprüft, nicht am Bildschirm:
  1. **Die längere Kopfzeile am Kommentar.** „chefin · 03.08.2026 · bearbeitet
     · 2 Bilder vom Admin entfernt" neben Markenleiste und ✎ ✕.
     `.cmt-head` ist `display:flex` **ohne** `flex-wrap`, `.cmt-when` hat
     `flex:1` und damit `min-width:auto` — der Text bricht **innerhalb** seiner
     Spanne um, die Zeile wird höher statt abgeschnitten. Kippt es doch, ist
     die Antwort `flex-wrap: wrap` an `.cmt-head`, nicht eine kürzere
     Beschriftung.
  2. **Der Hinweis am Kommentarblock**, aufgeklappt wie eingeklappt.
  3. **Der Tagblock ohne seine Eingabezeile** — die Wolke rückt dann direkt an
     die Marken heran.
  4. **Der Umschalter im Vergleich** und die Zeile darüber.
- **Der Wortlaut „Durchschnitt"** in der Kopfzahl des Vergleichs gilt für beide
  Stellungen (Abweichung 7). Wenn das im Betrieb stört, ist die Antwort eine
  eigene Beschriftung je Stellung, nicht ein zweiter Wert daneben — der wäre in
  264 px zu dicht.
- **`README.md` ist nicht angefasst** — wie schon in 0.8.3. Drei Stellen sind
  jetzt unvollständig: die Aufzählung des Systembereichs nennt die beiden neuen
  Häkchen nicht, der Abschnitt zu Tags und Kategorien sagt nichts davon, dass
  das Anlegen abschaltbar ist, und der Vergleich hat keinen Umschalter. Der
  Auftrag verlangt die Datei nicht; sie gehört in dieselbe Runde wie
  Projektstand und Konzeptpapier.

---

## 8. Für die Dokumente

- **Projektstand Abschnitt 2:** Betriebsstand auf 0.8.4, 1349 von 1349.
  **Der Satz „0.8.3 hat das Schema angefasst" bleibt richtig** — 0.8.4 hat es
  nicht getan, Zurückrollen ist hier wieder eine Dateikopie.
- **Abschnitt 5:** neue Punkte zu „der Vermerk nennt die Rolle, und dafür
  braucht es kein Feld", zu „`updated_at` ist eine Aussage über den Verfasser —
  genau eines von beiden an der Löschroute", zu „die Zahlen am Kommentarblock
  nennen Teilmengen", zu „ein Block hat eine Stelle für seine Zahlen", zu „der
  Schalter bindet den Benutzer, nicht den Admin" und zu „der Umschalter der
  Vergleichsansicht ist Ansichtszustand, keine Einstellung".
- **Abschnitt 6:** Stolpersteine **83** bis **86**.
- **Abschnitt 7:** 1349 von 1349; `F_ROUTEN` weiterhin 46; Zeile für 0.8.4 in
  der Versionstabelle der Gegenproben (34).
- **Abschnitt 9:** Zeile für 0.8.4.
- **Abschnitt 10 Punkt 5:** **Stufe G2 ist vollständig.** Als Nächstes steht
  Stufe G3 auf 0.8.5.
- **Abschnitt 11:** die vier Blöcke zu 0.8.4 (Rolle im Vermerk, `updated_at`,
  Anlegen-Schalter, Vergleichsumschalter, Zahlen am Kommentarblock) sind
  eingelöst und können in Abschnitt 5 wandern.
- **Konzeptpapier, Stufe G2 zweite Hälfte:** vollständig durchstreichen und mit
  Version und Abweichungen annotieren; die `AUTH_RESET`-Zeile bleibt als
  einziger offener Punkt stehen und gehört zu G3.
- **Konzeptpapier, Abschnitt 3 (Rechtetabelle):** die Zeile „Tags und
  Kategorien **anlegen** — abschaltbar, siehe Abschnitt 7" ist gebaut; das ✔ in
  der Adminspalte ist jetzt ausdrücklich durchgesetzt.
