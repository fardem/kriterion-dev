# Änderungsprotokoll 0.8.6 — „Berichtigungen aus dem Betrieb"

**Rohstoff für die Dokumentenpflege. Projektstand, Konzeptpapier und README
sind nicht angefasst.**

Gebaut wurden **alle fünf Auftragspunkte**. Der Haltepunkt nach Punkt 2 ist
erreicht und steht als eigener Commit in der Historie; die Punkte 3 bis 5 sind
danach gebaut worden, weil noch Luft war.

Prüfungen: **1391 → 1429** (38 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — es ist keine schreibende Route
entstanden, und keine hat ihre Art gewechselt. Der neue Endpunkt ist lesend
und trägt seinen Wächter in der Routenzeile; das ist das vierte Mal, dass
dieses Muster angewandt wird.
**Kein Punkt hat das Schema angefasst.** Es ist kein Umstiegscode entstanden,
und für „Vorgemerkt für 1.0" fällt aus dieser Version **nichts** an.

---

## 1. Was gebaut wurde, je Datei

### `package.json`
Version auf `0.8.6`.

### `db.js`, `auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`
**Unverändert.**

### `server.js` (+30/−7 Zeilen)

**Punkt 1 — die Stimmen aus `detail()` heraus.**
- `detail()` ruft `stimmenJeKriterium()` nicht mehr und hängt kein `r.stimmen`
  mehr an die Kriterienzeilen. `GET /api/items/:id` liefert an jeden — was
  nicht angezeigt werden darf, wird nicht geliefert (Stolperstein 79).
- `avg` und `count` bleiben unverändert stehen: der Schnitt und die Zahl der
  Bewerter sind keine Aussage über eine Person.
- **Neu `GET /api/items/:id/stimmen` mit `nurAdmin` in der Routenzeile.** Er
  ist der zweite Rufer von `stimmenJeKriterium()`; die Funktion selbst ist
  unverändert geblieben, samt ihrer Klemme am Funktionsanfang. Der Benutzer
  wird durchgereicht, weil `mine` daran hängt.
- Antwort: `[{ criterion_id, stimmen: [ { id, wert, mine, verfasser } ] }]`.
  **Ohne Kriterienname** — den hat die Oberfläche aus dem Eintrag, und zwei
  Quellen für denselben Namen wären zwei Wahrheiten. Nur Kriterien **mit**
  Stimmen kommen vor.
- **Kein Eintrag in `F_ROUTEN`.** Die Liste führt nur schreibende Routen;
  dasselbe Muster wie `GET /api/users/:id/bestand`, `GET /api/items/:id/bestand`
  und `GET /api/stats`.
- `DELETE /api/ratings/:id` ist **unverändert** geblieben, samt `darfAendern`
  und seiner Zeile in `F_ROUTEN` (`'im Rumpf'`). Geändert hat sich nur, von wo
  aus er gerufen wird.

**Punkt 5 — der eigene Name in den Einstellungen.**
- `GET /api/settings` liefert `name: req.benutzer.username`, neben
  `benutzerZahl`, `istAdmin` und `istEigentuemer`.

**Sonst nichts.** Punkt 1 und die eine Zeile aus Punkt 5 sind die einzigen
Servereingriffe der Runde.

### `public/app.js` (+62/−19 Zeilen)

**Punkt 1 — die Stimmenliste wird zur Adminansicht.**
- Der Block unter der Sternzeile (`if (!mehrereBenutzer() || !(r.stimmen ||
  []).length) return;` samt der ganzen Liste) ist weg; an seiner Stelle steht
  der Grund.
- Neuer Knopf **„Wer hat bewertet"** im Blockkopf, neben „Meine Bewertung
  zurücksetzen". Er steht unter `ADMIN && mehrereBenutzer()`.
- Neue Funktion **`zeigeStimmen()`**: holt `GET /api/items/:id/stimmen`, öffnet
  einen Dialog (`.backdrop` / `.modal`, dieselben Bausteine wie `confirmBox`)
  und zeichnet je Kriterium eine Zeile mit Namen und den Stimmen darunter.
  Reihenfolge und Kriterienname kommen aus `item.ratings`.
- Das ✕ an der fremden Stimme ist **mitgewandert**, samt Rückfrage und
  Wortlaut. Nach dem Löschen wird **beides** neu geholt: der Eintrag (Antwort
  des `DELETE`) und die Stimmenliste.
- Der Behandler hängt an einem `if (rwhoEl)` — ohne Rolle gibt es das Element
  nicht (Stolperstein 88).

**Punkt 2 — die Linkliste.** In `begrenzeLinks()` steht `overflowY = 'hidden'`
statt `'auto'`. Sonst nichts; der Knopf „alle N anzeigen" stand schon da.

**Punkt 4 — das Anlegedatum.** `drawVerfasser()` bildet
`Angelegt von <name> am <fmtDate(item.created_at)>`. Dasselbe Format wie am
Kommentar. Die Schwelle `mehrereBenutzer()` bleibt unverändert.

**Punkt 5 — die Kopfzeile.** Neue Globale `NAME`, gesetzt in
`ladeEinstellungen()`. Im `.masthead` steht `<span class="hint wer"
id="wer">Angemeldet als ${esc(NAME)}</span>` unmittelbar vor dem Knopf
„Abmelden". Nach dem Umbenennen des eigenen Zugangs in der Karte „Zugang" wird
`NAME` mitgesetzt.

### `public/style.css` (+12/−1 Zeilen)
- `.stimmliste`, `.stimmzeile .rname`, `.stimmzeile .rstimmen` — die
  Adminansicht. Die Stimmen selbst tragen weiterhin `.rstimmen` / `.rstimme`;
  ihr Aussehen steht damit an genau einer Stelle, samt der Ausnahme für das
  immer sichtbare Löschkreuz (die Regel bleibt unangetastet unter ihrer
  Aufzählung stehen, Stolperstein 78).
- `.sys-grid` bekommt `grid-auto-flow: dense` — Punkt 3.
- `.masthead .wer { white-space: nowrap; }` — Punkt 5. **Keine neue Farbe:**
  `.hint` gibt es längst und bedeutet dort bereits „Auskunft, kein
  Bedienelement" (Stolperstein 48).

### `pruefung.js` (+194/−15 `pruefe`-Aufrufe gezählt; netto +38 Prüfungen)
- **Der Doppelgänger kennt den neuen Endpunkt** — und hält die Rolle nach,
  wie bei `/api/stats`. `beispiel.ratings` trägt **keine** `stimmen` mehr; die
  vier Lagen (eigene, fremde lebende, Grabstein, herrenlos) stehen jetzt in
  `stimmenAntwort`, und das dritte Kriterium kommt dort gar nicht vor.
- Ein `DELETE /api/ratings/:id` **nimmt die Stimme wirklich aus der Antwort**.
  Ohne das wäre ein neu gezeichneter Dialog von einem stehengebliebenen nicht
  zu unterscheiden (Stolperstein 90).
- `beispiel` bekommt `created_at` — ohne das zeichnete die Verfasserzeile ins
  Leere und jede Prüfung darauf wäre blind.
- `/api/settings` liefert im Doppelgänger einen Vorgabenamen (`chefin`,
  derselbe wie unter `/api/account`); eine Prüflage kann ihn überschreiben.
- **Neue Servergruppe „Wer hat bewertet -- die Ansicht des Admins"** mit vier
  Rufern nebeneinander.
- **Vier serverseitige und sechs Oberflächenprüfungen umgehängt, drei
  umgedreht, keine gelöscht** (Stolperstein 74) — siehe Abschnitt 5.

---

## 2. Abweichungen und Entscheidungen

| # | Was | Entschieden | Begründung |
|---|---|---|---|
| 1 | **Die Tagwolke war gar nicht betroffen** | Nichts geändert, Prüflage ergänzt | `begrenzeWolke()` setzt `box.style.overflow = 'hidden'`, nie `'auto'` — die Wolke hatte nie einen eigenen Bildlauf. **Vor dem Bauen gemeldet.** Damit ein späterer Griff nach `'auto'` dort ebenso auffällt wie an der Linkliste, steht die Prüflage jetzt trotzdem daneben (G12, G13). |
| 2 | **Die Begründung des Auftrags zu Punkt 5 trifft nicht zu** | `/api/settings` trotzdem | Die Kopfzeile (`.masthead` mit „Abmelden") steht **ausschließlich in `renderList()`**; die Detailansicht und der Systembereich haben nur „← Zurück". Beim Direkteinstieg auf einen Eintrag wird also gar keine Kopfzeile gezeichnet, und `/api/account` in `loadAll()` hätte gereicht. **Vor dem Bauen gemeldet und so freigegeben.** Der Gewinn ist trotzdem echt: ein Abruf weniger, und die Angabe hängt an `start()` statt an `loadAll()` — sie steht damit auch dann bereit, wenn eine spätere Stufe die Kopfzeile woanders zeichnet (Stolperstein 16). Zwei Wahrheiten sind es nicht: beide Antworten lesen dieselbe angemeldete Zeile. |
| 3 | **Der Aufrufknopf hängt an `ADMIN && mehrereBenutzer()`, nicht nur an `ADMIN`** | Beides | Bei genau einem Zugang wäre die Ansicht der eigene Wert ein zweites Mal — dieselbe Begründung wie bei der Durchschnittsspalte seit 0.7.0. **Die Schwelle steht ausschließlich in der Oberfläche**; der Server liefert und entscheidet nichts darüber. Zu jeder Hälfte der Bedingung gehört eine eigene Prüflage (G3 und G4 liefern verschiedene Punktlisten). |
| 4 | **Im Dialog hängt das ✕ nur noch an `!st.mine`, nicht mehr an `ADMIN && !st.mine`** | Klemme weggenommen, nicht verdoppelt | Den Dialog bekommt ohnehin nur der Admin zu sehen — und der Server gibt die Liste ohnehin nur ihm. Eine zweite Rollenfrage darin wäre eine zweite Wahrheit über dieselbe Sache und ließe sich nicht gegenprüfen: ihr Rückbau bliebe stumm (Stolperstein 50). Was die Prüflage stattdessen belegt: **ohne Adminrolle gibt es den Aufruf gar nicht und wird auch nichts abgerufen.** |
| 5 | **Der Endpunkt liefert keinen Kriterienname** | Nur Nummern | Reihenfolge und Name stehen in `item.ratings`, das die Ansicht ohnehin hat. Zwei Quellen für denselben Namen wären zwei Wahrheiten — dieselbe Überlegung wie bei den Zahlen des Löschdialogs, nur mit umgekehrtem Ergebnis: dort ließ sich die Frage aus dem geladenen Eintrag *nicht* beantworten, hier schon. |
| 6 | **Der Doppelgänger stellt `/api/stats`-artig auch `/api/items/1/stimmen` hinter die Rolle** | Nachgebaut, obwohl heute keine Prüflage ihn ohne Rolle ruft | Ein Doppelgänger, der die Antwort vereinfacht, löscht genau die Prüfung, für die er gebaut ist. Dass der Zweig heute nicht angesprochen wird, ist eine Aussage über die **Oberfläche** (sie ruft ohne Rolle gar nicht) und keine über den Server. Steht unter „nicht gegengeprüft, mit Grund". |
| 7 | **Die Prüfung „die Wolke wird abgeschnitten" steht am gestellten Kasten, nicht an der echten Ansicht** | Nötig, beim Bauen aufgefallen | Der erste Versuch stand an `#tagcloud` in einer echten Detailansicht und wurde sofort rot: jsdom rechnet kein Layout, `offsetHeight` der ersten Marke ist null, und `begrenzeWolke()` bricht dann **absichtlich** ab, ohne etwas zu setzen. Prüfbar ist die Funktion nur dort, wo die Höhe gestellt wird (Stolperstein 91). |
| 8 | **Das Datum steht mit Uhrzeit, nicht nur als Tag** | `fmtDate()` | Es ist dieselbe Angabe wie in der Kopfzeile jedes Kommentars, und zwei Schreibweisen für denselben Zeitpunkt wären eine zu viel. |
| 9 | **Ein Auffangnetz für ein fehlendes `created_at` gibt es nicht** | Bewusst keins | Die Spalte steht `NOT NULL DEFAULT (datetime('now'))`. Ein Netz gegen etwas, das es nicht gibt, ließe sich nicht gegenprüfen. |

---

## 3. Neue Stolpersteine

**89. Zwei Dialoge übereinander teilen sich die Abbruchtaste.** Ein
Escape-Behandler an `document` schließt **jeden** offenen Dialog, nicht nur den
obersten: die Rückfrage vor dem Löschen liegt über der Adminansicht, und eine
Taste nähme beide zugleich weg — der Admin hätte abgebrochen und stünde wieder
am Eintrag. Wer einen zweiten Dialog über einen ersten legt, fragt im
Behandler, ob er selbst der oberste ist. **Verwandt mit 41**, aber umgekehrt:
dort bleibt ein Behandler an einem Element hängen, das neu gezeichnet wird,
hier greifen zwei gültige Behandler auf dasselbe Ereignis zu.

**90. Ein Doppelgänger, der eine Antwort nur ausliefert, kann kein
Neuzeichnen belegen.** Antwortet er auf ein `DELETE` zwar mit dem neuen Stand
des Eintrags, liefert aber weiterhin dieselbe Liste, ist „die Ansicht zeichnet
sich neu" von „die Ansicht blieb stehen" nicht zu unterscheiden — die
Prüfung bliebe in beiden Fällen grün. **Ein Doppelgänger, dessen Antwort sich
durch einen Schreibvorgang ändern soll, muss sie wirklich ändern.**
Fortschreibung von Abweichung 7 aus 0.8.5: dort ging es darum, dass er nicht
*vereinfachen* darf, hier darum, dass er nicht *erstarren* darf.

**91. Eine Funktion, die selbst misst, ist im gebauten DOM nur an einer
gestellten Höhe prüfbar.** `begrenzeWolke()` liest `offsetHeight` der ersten
Marke; in jsdom ist das immer null, und die Funktion bricht dann
**absichtlich** ab, ohne etwas zu setzen (die Regel aus 0.8.3). Eine Prüfung,
die sie an einer echten Ansicht abfragt, prüft deshalb nicht die Begrenzung,
sondern den Abbruch — und wird rot, obwohl der Code richtig ist. Verwandt mit
Stolperstein 20 und mit „Was der Prüfstand nicht kann: Aussehen": **wo eine
Prüfung Layout braucht, muss sie es stellen.**

---

## 4. Gegenprobentabelle

Jeder Rückbau wurde gegen eine unberührte Kopie **per `diff` belegt**, vor dem
Lauf und nach dem Zurückstellen (Stolperstein 75). Der Schlusslauf lief gegen
einen `diff`-sauberen Quelltext.

### Punkt 1 — die Bewertungsdetails gehören dem Admin

| # | Rückbau | rot |
|---|---|---|
| G1 | `nurAdmin` fällt aus der Routenzeile von `GET /api/items/:id/stimmen` | **3** — *Wer welchen Wert vergeben hat, sieht nur der Admin* · *Auch der Verfasser des Eintrags nicht* · *Die Absage nennt den Admin* |
| G2 | `detail()` hängt die Stimmen wieder an die Kriterienzeilen | **1** — *Der Eintrag selbst nennt seit 0.8.6 keine Stimmen mehr* |
| G3 | Der Aufrufknopf hängt nur noch an `mehrereBenutzer()` | **1** — *Ohne Adminrolle gibt es den Aufruf gar nicht* |
| G4 | Der Aufrufknopf hängt nur noch an `ADMIN` | **1** — *Bei einem Zugang gibt es den Aufruf gar nicht* |
| G5 | Das ✕ steht an **jeder** Stimme, auch an der eigenen | **5** — *An jeder fremden Stimme steht ein ✕* · *Aber keins an der eigenen* · *Die Frage nennt den Verfasser und sagt, dass nur Loeschen geht* · *Der Klick entfernt wirklich genau diese Bewertung* · *Danach holt sie die Liste neu und zeigt die Stimme nicht mehr* |
| G6 | Die Ansicht zeichnet auch Kriterien **ohne** Stimme | **3** — *Je Kriterium steht dort, wer welchen Wert vergeben hat* · *Ein Kriterium ohne Stimme bekommt gar keine Liste* · *Jede Zeile traegt den Namen ihres Kriteriums* |
| G7 | Nach dem Löschen wird die Liste **nicht** neu geholt | **1** — *Danach holt sie die Liste neu und zeigt die Stimme nicht mehr* |
| G8 | Der Escape-Behandler fragt nicht mehr, ob er der oberste ist | **1** — *Ein Abbruch nimmt nur die Rueckfrage weg, nicht die Ansicht* |
| G9 | Der Endpunkt reicht eine feste Nummer statt `req.benutzer.id` durch | **1** — *Und fuer einen Admin ohne eigene Bewertung ist es keine davon* |

**G3 gegen G4 ist die Zeile, um die es bei der Sichtbarkeit geht.** Die
Bedingung hat zwei Hälften, und jede hat ihre eigene Prüflage: die eine ohne
Adminrolle, die andere mit einem einzigen Zugang. Verschiedene Punktlisten,
also zwei verschiedene Sachen (Stolperstein 72).

**G5 nimmt mehr mit, als es aussieht — und das ist richtig so.** Steht das ✕
auch an der eigenen Stimme, ist es das **erste** in der Liste; der Klick trifft
dann eine andere Bewertung, und die Rückfrage nennt einen anderen Namen. Die
drei zusätzlichen roten Punkte sind Folge desselben Rückbaus und keine zweite
Sache.

**G2 ist die wichtigste Zeile des Punktes.** Sie belegt die Regel aus
Stolperstein 79: die Liste ist nicht bloß ausgeblendet, sie wird gar nicht
mehr geliefert.

### Punkt 2 — die Linkliste

| # | Rückbau | rot |
|---|---|---|
| G10 | `overflowY = 'auto'` — der Stand von 0.8.5 | **1** — *Zugeklappt wird die Liste abgeschnitten, nicht scrollbar* |
| G11 | Aufgeklappt wird die Abschneidung nicht mehr weggenommen | **1** — *Und die Abschneidung ebenso* |
| G12 | `begrenzeWolke()` setzt `overflow: 'auto'` | **1** — *Und die Wolke wird abgeschnitten, nicht scrollbar* |
| G13 | `begrenzeWolke(box, 0)` nimmt die Abschneidung nicht mehr weg | **1** — *Und nehmen die Abschneidung mit* |

**G10 gegen G12** trennt die beiden Listen: dieselbe Regel, zwei Orte, zwei
Prüfungen — keine deckt die andere zu (Stolperstein 53).

### Punkt 3 — die Lücke im Kartenraster

| # | Rückbau | rot |
|---|---|---|
| G14 | `grid-auto-flow: dense` fällt aus der Regel | **1** — *Und das Raster zieht nachfolgende Karten in die Luecke* |
| G15 | Die ganze `.sys-grid`-Regel fällt weg | **2** — *Die Regel fuer das Kartenraster steht ueberhaupt im Stylesheet* · *Und das Raster zieht nachfolgende Karten in die Luecke* |
| G16 | Die Kachel „Zugänge" wandert ans **Ende** des Rasters | **2** — *Die Eigentuemerin sieht alle dreizehn Karten* · *Und die Kachel steht dabei nicht am Ende des Rasters* |

**G14 gegen G15 ist Stolperstein 81 in Reinform:** ohne die Prüfung auf das
**Vorhandensein** der Regel bliebe bei einer fehlenden Regel nur ein roter
Punkt statt zwei — eine leere Zeichenkette macht jede Verneinung wahr.

**G16 belegt die Entscheidung gegen die Ersatzlösung des Auftrags.** Die
Kachel ans Ende zu ziehen wäre der andere Weg gewesen; die Prüfung hält fest,
dass die Reihenfolge im Quelltext eben **nicht** angefasst wurde.

### Punkt 4 — das Anlegedatum

| # | Rückbau | rot |
|---|---|---|
| G17 | Die Zeile nennt wieder nur den Verfasser | **1** — *Und seit 0.8.6 auch, wann* |
| G18 | Die Zeile steht auch bei einem einzigen Zugang | **2** — *Bei einem Zugang steht keine Verfasserzeile am Eintrag* · *Und damit auch kein Anlegedatum* |

### Punkt 5 — „Angemeldet als"

| # | Rückbau | rot |
|---|---|---|
| G19 | `name` fällt aus `GET /api/settings` | **2** — *Die Einstellungen nennen den eigenen Namen* · *Und jedem seinen eigenen, nicht den der Eigentuemerin* |
| G20 | Die Angabe fällt aus der Kopfzeile | **5** — *Die Kopfzeile nennt auch bei einem einzigen Zugang, wer angemeldet ist* · *Und ab zwei Zugaengen ebenso, mit dem Namen des Angemeldeten* · *Sie steht unmittelbar vor dem Knopf zum Abmelden* · *Aus einem Benutzernamen wird in der Kopfzeile kein HTML* · *Und die Kopfzeile nennt danach den neuen Namen* |
| G21 | Die Antwort nennt den **ersten** Zugang statt des angemeldeten | **1** — *Und jedem seinen eigenen, nicht den der Eigentuemerin* |
| G22 | `NAME` wird nach dem Umbenennen nicht mitgesetzt | **1** — *Und die Kopfzeile nennt danach den neuen Namen* |
| G23 | `esc()` fällt um den Namen weg | **1** — *Aus einem Benutzernamen wird in der Kopfzeile kein HTML* |

**G19 gegen G21 ist die Zeile, um die es bei Punkt 5 geht.** Der grobe Rückbau
nimmt die Angabe ganz weg, der engere lässt sie stehen und macht sie falsch —
verschiedene Punktlisten, also zwei verschiedene Sachen. Die zweite ist die
eigentliche: eine Antwort, die stur den ersten Zugang nennte, wäre bei der
Eigentümerin richtig und bei jedem anderen falsch.

**Nicht gegengeprüft, mit Grund:**

- **Die Rollenklemme des Doppelgängers an `/api/items/1/stimmen`.** Ein
  Rückbau bliebe stumm: die Oberfläche ruft den Endpunkt ohne Adminrolle gar
  nicht erst, es gibt also keine Prüflage, die eine 403-Antwort sähe. Der Zweig
  steht trotzdem — er bildet den echten Server ab, und die Aussage „ohne Rolle
  wird gar nicht abgerufen" ist eine über die Oberfläche, keine über den
  Server (Abweichung 6).
- **`.stimmliste` und `.stimmzeile` im Stylesheet.** Beide sind reine
  Anordnung (Abstände, Blocksatz der Namenszeile) ohne Aussage, die sich
  belegen ließe; die Klassen, an denen etwas hängt — `.rstimme`, `.rstimme
  .xdel` —, sind unverändert geblieben und tragen ihre Prüfungen seit 0.8.2.

---

## 5. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen gesamt | 1391 | **1429** |
| `F_ROUTEN` | 46 | **46** (unverändert) |
| Formatnummer Export | 6 | **6** (unverändert) |
| Umstiegsblöcke | 1 (`umstieg083`) | **1** (unverändert) |
| Karten im Systembereich | 13 | **13** (unverändert) |

Neue Prüfungen nach Ort:

| Gruppe | neu |
|---|---|
| Wer hat bewertet -- die Ansicht des Admins *(neu, serverseitig)* | 12 |
| Mehrbenutzer-Anzeigen in der Oberflaeche | 19 |
| Was dem Eigentuemer gehoert | 3 |
| Der Systembereich nach Rolle | 3 |
| Tagwolken | 2 |
| Eine fremde Bewertung entfernen | 1 |
| Linkliste und Aktionszeichen | 1 |
| Verfasser in der Antwort | **−3** (vier umgehängt, eine neu) |

Macht 38. Die Gruppe „Verfasser in der Antwort" **schrumpft**, und das ist der
Punkt: ihre vier Stimmenprüfungen stehen jetzt am eigenen Endpunkt, und was
dort bleibt, ist die eine Prüfung darauf, dass sie in dieser Antwort **nicht**
mehr vorkommen.

**23 Gegenproben**, darunter drei Paare aus grobem und engerem Rückbau
(G3/G4, G14/G15, G19/G21). Kein Rückbau hat den Lauf abgerissen — eine engere
Zweitprobe nach Stolperstein 76 war deshalb nirgends nötig.

**Drei Prüfungen umgedreht statt gelöscht** (Stolperstein 74, Auflage aus dem
Auftrag):

| bis 0.8.5 | seit 0.8.6 |
|---|---|
| *Unter den Sternen steht, wer welchen Wert vergeben hat* | *Unter den Sternen steht seit 0.8.6 keine Stimmenliste mehr* |
| *Und keine Stimmenliste unter den Sternen* (nur bei einem Zugang) | *Bei einem Zugang gibt es den Aufruf gar nicht* |
| *Zugeklappt bleibt die Liste scrollbar* | *Zugeklappt wird die Liste abgeschnitten, nicht scrollbar* |

**Vier serverseitige Prüfungen umgehängt** — vom Eintrag an den neuen
Endpunkt, im Wortlaut unverändert: *Je Kriterium steht, wer welchen Wert
vergeben hat* · *Eine zurueckgesetzte Bewertung ist keine Stimme* · *Die eigene
Stimme ist als solche gekennzeichnet* · *Jede Stimme nennt ihre Nummer*.

**Sieben Oberflächenprüfungen umgehängt** — von der Sternzeile an die
Adminansicht: *Ein Kriterium ohne Stimme bekommt gar keine Liste* · *Jede
Stimme nennt Name und Wert* · *Die eigene Stimme ist gekennzeichnet* · *Aber
keins an der eigenen* · *Das ✕ fragt vorher nach* · *Die Frage nennt den
Verfasser und sagt, dass nur Loeschen geht* · *Der Klick entfernt wirklich
genau diese Bewertung*.

**Zwei umbenannt**, weil ihr Gegenstand sich verschoben hat:

| bis 0.8.5 | seit 0.8.6 |
|---|---|
| *Der Admin bekommt ein ✕ an jeder fremden Stimme* | *An jeder fremden Stimme steht ein ✕* (die Rollenfrage steht nicht mehr daneben, siehe Abweichung 4) |
| *Ohne Adminrolle stehen die Namen trotzdem da* | *Ohne Adminrolle gibt es den Aufruf gar nicht* |

**Eine Prüfung inhaltlich nachgezogen:** *Die Antwort ist der neu gezeichnete
Eintrag* las bis 0.8.5 die Zahl der Stimmen in der Antwort; sie liest jetzt
`count`, denn Stimmen stehen dort nicht mehr.

---

## 6. Vorgemerkt für 1.0

**Aus dieser Version fällt nichts an.** Kein Punkt hat das Schema angefasst,
es ist kein Umstiegscode entstanden. `umstieg083()` in `db.js` bleibt der
einzige markierte Block — 18 Zeilen, 7 Prüfungen, unverändert.

---

## 7. Offen geblieben

- **Ein Kommentar in `server.js` ist seit 0.8.2 falsch.** Über den beiden
  Bewertungswegen steht „Fremde Bewertungen einzeln zu loeschen hat keinen
  Endpunkt; sie fallen nur mit dem Eintrag oder mit dem Zugang ihres
  Verfassers." Genau diesen Endpunkt gibt es seit 0.8.2, zwanzig Zeilen
  darunter. **Nicht angefasst**, weil er außerhalb des Auftrags liegt — eine
  Zeile Arbeit, gehört in die Runde mit den Dokumenten.
- **Die Karte „Darstellung" bekommt weiterhin keine Trennlinien**, obwohl sie
  drei Abschnitte hat. Merkposten aus 0.8.5, unverändert offen.
- **`README.md` ist seit 0.8.3 nicht nachgezogen.** Offen sind dort weiterhin
  die beiden Anlegen-Häkchen, die Abschaltbarkeit des Anlegens, der Umschalter
  „meine / alle" im Vergleich und alles aus 0.8.5. **Dazu kommt jetzt:** der
  Abschnitt zur Stimmenliste unter der Sternzeile ist durch Punkt 1 **falsch**
  geworden — er ist in 0.8.5 gerade erst geschrieben worden und beschreibt
  jetzt einen Zustand, den es nicht mehr gibt. Er gehört zusammen mit der
  neuen Adminansicht berichtigt.
- **Projektstand und Konzeptpapier** sind wie verlangt nicht angefasst.
  Nachzutragen wären dort: der Betriebsstand (Abschnitt 2), die neuen
  Entscheidungen (Abschnitt 5, siehe unten), die Stolpersteine 89 bis 91
  (Abschnitt 6), die Prüfzahlen (Abschnitt 7), die Zeile 0.8.6 in der
  Versionsgeschichte (Abschnitt 9) und in Abschnitt 11 der eingelöste
  Merkposten „Für 0.8.6 steht die nächste an: die Stimmenliste aus 0.8.2
  verliert ihre Prüfungen an der Sternzeile" — er ist mit dieser Version
  abgearbeitet, ebenso das „vierte Mal" beim lesenden Endpunkt mit Wächter.
- **Nicht gebaut, wie im Auftrag festgelegt:** die anonyme Werteliste
  („3 · 4 · 2" ohne Namen). Sie war schon im Auftrag verworfen und steht hier
  nur zur Vollständigkeit.

---

## 8. Für die Dokumente

**Neue Entscheidungen für Abschnitt 5 des Projektstands:**

- **Wer welchen Wert vergeben hat, sieht nur der Admin** (seit 0.8.6). Nimmt
  „Die Stimmenliste ist die Voraussetzung des Löschwegs" aus 0.8.2
  **teilweise** zurück: die Liste selbst ist von der Sternzeile verschwunden,
  ihre Rolle als Löschweg ist geblieben und in eine eigene Ansicht gewandert.
  Eine Bewertung sagt den eigenen Wert und den Schnitt — mehr nicht. `avg` und
  `count` bleiben unangetastet: sie sind keine Aussage über eine Person.
- **Der Löschweg wandert mit der Ansicht, nicht der Endpunkt** (seit 0.8.6).
  `DELETE /api/ratings/:id` ist unverändert geblieben, samt Wächter und
  Eintrag in `F_ROUTEN`. Was sich ändert, ist ausschließlich, von wo aus er
  gerufen wird. **Wer eine Anzeige einschränkt, prüft zuerst, was an ihr
  hängt.**
- **Ein lesender Endpunkt kann einen Wächter tragen und steht trotzdem nicht
  in `F_ROUTEN`** — mit 0.8.6 zum **vierten** Mal angewandt
  (`GET /api/items/:id/stimmen`). Die Zahl bleibt bei 46.
- **Eine Liste wird abgeschnitten, nicht scrollbar** (seit 0.8.6). Ein eigener
  Bildlauf in einer Liste fängt auf dem Finger die Wischbewegung ab: wer die
  Seite herunterzieht und dabei über die Liste kommt, scrollt plötzlich nur
  noch die Liste. Der Weg zum Rest ist der Aufklappknopf. Gilt für die
  Linkliste **und** die beiden Tagwolken; die Wolken waren schon so gebaut.
  *Verworfen:* eine Haltezeit wie beim Ziehen — beim Scrollen unüblich, und
  sie verzögerte jedes Wischen um 0,4 s.
- **Eine breite Karte im Raster braucht `grid-auto-flow: dense`, keine feste
  Position** (seit 0.8.6). Wie viele Karten in eine Zeile passen, hängt an der
  Fensterbreite; wie viele es gibt, an der Rolle. Eine Position, die bei drei
  Spalten stimmt, ist bei zwei falsch. Die Reihenfolge im Quelltext bleibt,
  wie sie ist — eine Prüfung hält genau das fest.
- **„Angemeldet als" steht auch bei einem einzigen Zugang** (seit 0.8.6). Es
  ist eine Aussage über **mich**, nicht über andere — derselbe Grund, aus dem
  die Karte „Zugang" für jeden stehenbleibt. Das unterscheidet die Angabe von
  allem, was `mehrereBenutzer()` verbirgt: dort geht es immer um andere.
  Der Name kommt über `GET /api/settings`, weil `ladeEinstellungen()` in
  `start()` läuft; dass er auch unter `GET /api/account` steht, ist keine
  zweite Wahrheit — beide lesen dieselbe angemeldete Zeile.
- **„Angelegt von" nennt auch das Datum** (seit 0.8.6), in derselben Form wie
  die Kopfzeile eines Kommentars. Bei genau einem Zugang bleibt die ganze
  Zeile weg — dann steht das Datum schon in der Sortierung.
