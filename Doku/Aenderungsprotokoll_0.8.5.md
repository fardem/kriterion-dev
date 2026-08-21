# Änderungsprotokoll 0.8.5 — Stufe G3 „Der Systembereich lernt die Rechte"

**Rohstoff für die Dokumentenpflege. Projektstand und Konzeptpapier sind nicht
angefasst.**

Gebaut wurden **alle sechs Auftragspunkte**. Der Haltepunkt nach Punkt 4 ist
erreicht und steht als eigener Commit in der Historie; die Punkte 5 und 6 sind
danach gebaut worden, weil noch Luft war.

Prüfungen: **1349 → 1391** (42 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — es ist keine schreibende Route
entstanden, und keine hat ihre Art gewechselt.
**Kein Punkt hat das Schema angefasst.** Es ist kein Umstiegscode entstanden,
und für „Vorgemerkt für 1.0" fällt aus dieser Version **nichts** an.

---

## 1. Was gebaut wurde, je Datei

### `package.json`
Version auf `0.8.5`.

### `db.js`, `auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`
**Unverändert.**

### `server.js` (+10/−2 Zeilen)

**Punkt 2 — die Kennzahlen hinter den Admin.**
- `GET /api/stats` bekommt den Wächter `nurAdmin` **in der Routenzeile**.
  Darüber der zeitlose Kommentar: die Zahlen sagen, wie groß der Bestand und
  wie belegt die Datenbank ist — eine Aussage über die Anlage als Ganzes.
- **Kein Eintrag in `F_ROUTEN`.** Die Liste führt nur schreibende Routen; der
  Wächter steht trotzdem davor, dasselbe Muster wie bei
  `GET /api/users/:id/bestand` und `GET /api/items/:id/bestand`.
- **Der Schlüsselwert im selben Rumpf bleibt unangetastet** —
  `keyHex: (keyFromEnv || !istEigentuemer(req)) ? null : keyHex`. Das ist eine
  zweite, engere Klemme; sie wurde ausdrücklich **nicht** mit dem Wächter
  zusammengelegt. Gegenprobe G2 belegt, dass die beiden einander nicht
  zudecken.

**Sonst nichts.** Punkt 2 ist der einzige Servereingriff der Stufe.

### `public/app.js` (+114/−63 Zeilen)

**Punkt 1 — die Karten nach Rolle.** Von zwölf Karten hing eine an der Rolle;
jetzt hängen zehn von dreizehn daran.

| Karte | steht |
|---|---|
| Titel, Kennzahlen, Kategorien, Tags, Bewertungskriterien, Zugänge, Suchanbieter, Vokabular | dem Admin |
| Export, Import | dem Eigentümer |
| **Zugang, Darstellung, Links** | **jedem, auch ohne Rolle** |

- Der Abruf der Kennzahlen im Sammel-`Promise.all` ist **bedingt**:
  `ADMIN ? api('GET', '/api/stats') : null`. Ohne das bliebe der gesamte
  Systembereich für einen Benutzer leer — siehe Abweichung 1.
- Neuer Helfer **`amElement(id, tu)`**: ein Behandler wird nur gesetzt, wenn
  es das Element gibt. **Ein Ort für die Frage** — stünde vor jedem Behandler
  dieselbe Klammer, risse die erste vergessene den ganzen Systembereich mit,
  und zwar wortlos. Betroffen sind `tsave`, `ex-yes`, `ex-no`, `imp`,
  `breset`, `vsave`, `vreset` und die elf Vokabelfelder.
- `mitDateien()` liest das Häkchen mit `?.` — es steht nur in der
  Exportkarte.

**Punkt 3 — Kategorien und Tags bekommen das Muster der Kriterienkarte.**
- In `manage()` wird aus `const darf = kind !== 'crit' || ADMIN;` schlicht
  `const darf = ADMIN;`. Umbenennen und Löschen stehen an allen drei Karten
  hinter `nurAdmin`, also gilt für alle drei dasselbe: Zeilen sichtbar,
  Griff/✎/✕ weg.
- **Die Karten selbst bleiben stehen** — wer nicht verwalten darf, darf
  trotzdem nachsehen, was es gibt. Die Namen sind die Auswahl, aus der jeder
  am Eintrag schöpft.
- Die beiden Anlegen-Häkchen aus 0.8.4 stehen bereits hinter `ADMIN` und
  wurden **nicht** doppelt geklammert.

**Punkt 3, Sonderfall — die Karte „Links" ist in zwei Karten geschnitten**
(vor dem Bauen gefragt und freigegeben, Abweichung 2):
- **„Links"** steht jedem: sichtbare Linkzeilen (`#lzeilen`), der Absatz, der
  erklärt, was eine Suchzeile ist, und die Zahl der Anbieternamen
  (`#snamen`). Beide Einstellungen sind serverseitig **persönlich**.
- **„Suchanbieter"** steht dem Admin: Vorrat und Startanbieter
  (`#sanbieter`), die drei eigenen Anbieter (`#seigene`) und der Hinweis zur
  Domain-Einschränkung. Alle drei sind serverseitig **global**.
- Der Satz in der Adminkarte nennt die Grenze ausdrücklich: „Beides gilt für
  alle — die Zahl der angezeigten Namen bestimmt jeder für sich in der Karte
  ‚Links'."

**Punkt 4 — die veraltete Anleitung.** In der Karte „Zugang" steht statt
„vergessen heißt `AUTH_RESET=1` am Server" jetzt
`docker compose exec kriterion node zugang.js passwort <name>`. Damit kommt
`AUTH_RESET` in `public/app.js` **überhaupt nicht mehr vor**; eine Prüfung
hält das fest.

**Punkt 5.** Die Kachel „Zugänge" trägt zusätzlich die Klasse `breit`.

**Punkt 6.** Die beiden Absätze, die in den Karten „Links" und
„Suchanbieter" einen neuen Abschnitt einleiten, tragen `class="desc sys-teil"`
statt einer eingebauten Abstandsangabe.

### `public/style.css` (+9 Zeilen)
- `.sys-card.breit { grid-column: 1 / -1; }` — Punkt 5.
- `.sys-card .sys-teil { border-top: 1px solid var(--line); margin: 16px 0 8px;
  padding-top: 14px; }` — Punkt 6. **Keine neue Farbe:** `--line` gibt es
  längst und bedeutet dort bereits „Kante zwischen zwei Flächen"
  (Stolperstein 48).

### `pruefung.js` (+305/−28 Zeilen)
- **Der Doppelgänger stellt `/api/stats` hinter die Rolle.** Antwortete er
  jedem mit 200, verdeckte er genau die Falle dieser Stufe (Abweichung 1).
- **Zwei Prüflagen berichtigt:** `eSysUser` und `sysUser` setzten `istAdmin`
  auf `false`, ließen `istEigentuemer` aber auf seiner Vorgabe `true` stehen —
  eine Lage, die der Server nie ausliefert, weil die Rollen eine **Leiter**
  sind (Abweichung 3).
- **Zwei Prüfungen umgedreht statt gelöscht** (Stolperstein 74), zwei
  umbenannt, zwei neue Gegenstücke daneben gestellt.
- `eSys` und `eSysUser` bekommen **dieselben zwei Tags** mitgegeben: mit einer
  leeren Liste zeigt die Karte „Noch nichts angelegt", und eine Prüfung auf
  fehlende Bedienzeichen bliebe daran grün, ohne je etwas zu belegen
  (Stolperstein 81).
- Eine neue Gruppe: **„Der Systembereich nach Rolle"** (37 Prüfungen) mit dem
  Helfer `baueSystem(rollen)` und **drei Lagen nebeneinander** — Eigentümerin,
  Admin ohne Eigentümerrecht, gewöhnlicher Benutzer.

---

## 2. Abweichungen und Entscheidungen

| # | Was | Entschieden | Begründung |
|---|---|---|---|
| 1 | **Der Abruf der Kennzahlen wird bedingt, statt ein `catch` danebenzustellen** | Bedingung, kein Auffangnetz | Der Auftrag nennt die Falle selbst: sechs Abrufe in **einem** `Promise.all`, und der Rumpf verlässt sich mit `return`, sobald einer scheitert. Ein `catch` je Abruf wäre eine zweite Schicht über der ersten und verdeckte sie in jeder Gegenprobe (Stolpersteine 28 und 51). Die Bedingung ist die **eine** Stelle, an der die Frage gestellt wird. Gegenprobe G3 belegt die Tragweite (19 rot), G3b den Ort (1 rot). |
| 2 | **Die Karte „Links" wird in zwei Karten geschnitten** | Zwei Karten, nicht eine Karte mit Adminteil | **Vor dem Bauen gefragt und freigegeben.** Die Regel der Stufe heißt „was verschwindet, sind die Karten". Eine Karte, die zur Hälfte verschwindet, wäre die einzige ihrer Art; zwei Karten machen die Rechtegrenze zur Kartengrenze, wie bei allen übrigen. Der Schnitt folgt genau der Trennung, die der Server seit 0.6.5 hält: `linkZeilen` und `suchNamen` sind persönlich, `suche`, `sucheEigene` und `sucheAktiv` sind global. **Damit sind es dreizehn Karten, nicht zwölf.** |
| 3 | **`istEigentuemer` muss in zwei Prüflagen mit auf `false`** | Nötig, im Auftrag nicht vorgesehen | Die Rollen sind eine **Leiter**: `istAdmin(req)` ist wahr, sobald `istEigentuemer(req)` es ist. Ein Eigentümer ohne Adminrecht kann es gar nicht geben. Die beiden vorhandenen Lagen setzten nur `istAdmin: false` und bauten damit einen Zustand nach, den der Server nie ausliefert — sichtbar wurde es erst, als die Exportkarte hinter `EIGENTUEMER` kam und die Kennzahlen an `ADMIN` hingen: die Karte stand da, `stats` war `null`, und der Lauf brach ab. **Das ist kein Fehler im Auslieferungsstand**, sondern eine Prüflage, die eine unmögliche Lage prüfte. |
| 4 | **Die Karte „Titel" verschwindet ganz** | So gebaut | Der Auftrag nennt sie unter dem, was ein Benutzer heute zu Unrecht sieht („Titel mit Eingabefeldern und Speichern-Knopf"), und `PUT /api/titles` steht hinter `nurAdmin`. Der **interne Titel selbst** wird weiterhin ausgeliefert — er kommt über `/api/config` in die Kopfzeile, nicht über diese Karte. |
| 5 | **`GET /api/titles` wird weiterhin von jedem abgerufen** | Bewusst nicht angefasst | Die Route ist lesend und offen; der Auftrag nennt `GET /api/stats` als **einzigen** Servereingriff. Der Abruf kostet nichts und ist kein Loch: der öffentliche Titel steht ohnehin auf der Anmeldeseite, der interne in der Kopfzeile jedes Angemeldeten. Ihn ebenfalls bedingt zu machen wäre mehr, als beauftragt ist. |
| 6 | **Neuer Helfer `amElement()` statt zehn einzelner Klammern** | Nötig | Fallen Karten weg, laufen zehn Behandler auf `null` — und der Fehler käme **nach** dem Setzen von `app.innerHTML`, also wortlos und mit halb gezeichnetem Bildschirm. Ein Ort für die Frage statt zehn (dasselbe Muster wie `anlegeSchalter()` aus 0.8.4). Gegenproben G11 und G11b belegen, dass die Klammer wirklich gebraucht wird. |
| 7 | **Der Doppelgänger im Prüfstand stellt `/api/stats` hinter die Rolle** | Nötig | Ein Doppelgänger, der die Antwort vereinfacht, löscht genau die Prüfung, für die er gebaut ist — dieselbe Überlegung wie bei `mine` und `bilderEntfernt` in 0.8.3. Antwortete er jedem mit 200, bliebe G3 stumm, und die konkreteste Falle der Stufe wäre unprüfbar. |
| 8 | **Die Trennlinien bleiben auf die beiden Linkkarten begrenzt** | Wie beauftragt | Die Karte „Darstellung" hat ebenfalls drei Abschnitte und bekommt **keine** Linien. Der Auftrag nennt ausdrücklich die Linkliste; die Klasse `.sys-teil` ist allgemein gehalten und ließe sich jederzeit auch dort setzen. *Merkposten für eine spätere Runde.* |
| 9 | **Die Zahl „neun Karten" im Konzeptpapier stimmt nicht** | Nur ins Papier | Es waren zwölf, jetzt sind es dreizehn: Titel, Zugang, Kennzahlen, Export, Import, Kategorien, Tags, Bewertungskriterien, Zugänge, Darstellung, Links, **Suchanbieter**, Vokabular. Die Aufzählung im Papier ist nicht falsch, sie nennt nur nicht alle. |

---

## 3. Neue Stolpersteine

**87. Eine Prüflage, die nur die eine Hälfte einer Rollenleiter setzt, prüft
eine Lage, die es nicht gibt.** Zwei Aufbauten setzten `istAdmin: false` und
ließen `istEigentuemer` auf seiner Vorgabe `true` — solange keine Karte an der
Eigentümerfrage hing, fiel das nicht auf. Es fiel erst auf, als eine Karte
hinter `EIGENTUEMER` kam und ihre Daten an `ADMIN` hingen: der Aufbau baute
einen Eigentümer ohne Adminrecht, den der Server nie ausliefert, und der Lauf
brach ab. **Wo zwei Felder derselben Leiter angehören, setzt die Prüflage
beide — oder sie prüft eine Lage, gegen die niemand gebaut hat.** Verwandt mit
71, aber eigenständig: dort räumt der Bestand die Lage weg, hier ist die Lage
von vornherein unmöglich.

**88. Wer eine Karte versteckt, muss auch ihre Behandler verstecken — und der
Fehler kommt zu spät, um laut zu sein.** Zehn Behandler hingen blank an
`document.getElementById(...)`. Fällt die Karte weg, ist das `null`, und die
Zuweisung wirft — **nach** dem Setzen von `app.innerHTML`. Auf dem Bildschirm
steht dann ein halb eingerichteter Systembereich ohne jede Meldung, und im
Prüfstand reißt es den ganzen Lauf mit, ohne einen einzigen Namen zu nennen.
**Zu jeder Karte, die an einer Rolle hängt, gehört dieselbe Frage für ihre
Behandler — an einem Ort, nicht an zehn.**

---

## 4. Gegenprobentabelle

Jeder Rückbau wurde gegen eine unberührte Kopie **per `diff` belegt**, vor dem
Lauf und nach dem Zurückstellen (Stolperstein 75). Der Schlusslauf lief gegen
einen `diff`-sauberen Quelltext.

### Punkt 2 — die Kennzahlen hinter den Admin

| # | Rückbau | rot |
|---|---|---|
| G1 | `nurAdmin` fällt aus der Routenzeile von `GET /api/stats` | **2** — *Die Kennzahlen selbst sieht seit 0.8.5 nur noch der Admin* · *Die Absage nennt dabei den Admin* |
| G2 | Die **zweite, engere** Klemme fällt: der Schlüsselwert geht an jeden Admin | **1** — *Aber den Schluesselwert bekommt nur die Eigentuemerin* |

**G1 gegen G2 ist die wichtigste Zeile des Punktes.** Zwei Klemmen in
**einem** Rumpf, und sie decken einander nicht zu — genau die Frage aus
Stolperstein 53, hier vorab beantwortet statt hinterher.

### Punkt 1 — die Karten nach Rolle

| # | Rückbau | rot |
|---|---|---|
| G3 | Die Kennzahlen werden wieder **unbedingt** abgerufen | **19**, darunter *Und der Systembereich bleibt dabei ueberhaupt gefuellt* · *Die Karte „Zugang" ist ueberhaupt da* · *Das Vokabular wird trotzdem ausgeliefert und benutzt* |
| G3b | Derselbe Rückbau, aber der Doppelgänger lässt den Abruf **gelingen** | **1** — *Ohne Adminrolle werden die Kennzahlen gar nicht erst abgerufen* |
| G4 | Die Karte „Titel" steht wieder für jeden | **2** — *Die Karte „Titel" steht nur beim Admin* · *Ein gewoehnlicher Benutzer sieht sechs* |
| G5 | Die Karte „Vokabular" steht wieder für jeden | **3**, darunter *Aber die Karte zum Bearbeiten steht ihm nicht* |
| G6 | Die Karte „Suchanbieter" steht wieder für jeden | **3**, darunter *Vorrat, Startanbieter und eigene Anbieter dagegen nicht* |
| G7 | Export und Import stehen **jedem Admin** (Klemme *verschoben*, nicht entfernt) | **2** — *Die Karte „Export" steht nur beim Eigentuemer* · *Die Karte „Import" steht nur beim Eigentuemer* |
| G11 | Der Behandler der Titelkarte hängt wieder blank am Element | **0 — Lauf abgebrochen**, „Cannot set properties of null (setting 'onclick')" |
| G11b | Derselbe blanke Behandler, aber die Karte steht wieder da | **2** — *Die Karte „Titel" steht nur beim Admin* · *Ein gewoehnlicher Benutzer sieht sechs* |

**G3 gegen G3b ist die Zeile, um die es in dieser Stufe geht.** Der grobe
Rückbau belegt die **Tragweite**: neunzehn Prüfungen fallen, weil der
Systembereich für einen gewöhnlichen Benutzer **vollständig leer** bleibt —
auch die drei Karten, die ihm zustehen. Der engere belegt den **Ort**: er
lässt den Abruf gelingen und trifft genau die eine Prüfung, die sagt, dass er
gar nicht erst hätte stattfinden dürfen. Stolperstein 82 in neuer Gestalt, und
zugleich der Beleg für den Satz aus dem Auftrag: *Punkt 2 ist ohne Punkt 1
nicht zu haben.*

**G11 gegen G11b ist dasselbe Paar für die Behandler** und der Grund für
Stolperstein 88. Der Abbruch liegt im Wirkbereich des Rückbaus — der
Fehlertext nennt `onclick`, und `tsave` ist genau das zurückgebaute Element
(Stolperstein 86). G11b lässt den Lauf durchlaufen und zeigt, dass der Abbruch
wirklich an der fehlenden **Karte** lag und an nichts anderem.

**G7 nimmt die Klemme nicht weg, sondern verschiebt sie** (Stolperstein 72):
`EIGENTUEMER` → `ADMIN`. Die Karten bleiben, nur die Rolle wechselt — und
trotzdem wird es rot, weil die Lage „Admin ohne Eigentümerrecht" im Prüfstand
steht.

### Punkt 3 — Kategorien und Tags

| # | Rückbau | rot |
|---|---|---|
| G8 | `darf = kind !== 'crit' \|\| ADMIN` — der Stand von 0.8.4 | **1** — *Tags und Kategorien tragen seit 0.8.5 dasselbe Muster* |
| G9 | Die Karte „Tags" verschwindet **ganz**, statt nur ihre Zeichen | **0 — Lauf abgebrochen**, „Cannot set properties of null (setting 'innerHTML')" |
| G9b | Die Karte und die Zeilen bleiben, aber ohne Rolle steht kein **Name** mehr drin | **2** — *Die Kriterien selbst bleiben sichtbar* · *Die Tagnamen selbst bleiben sichtbar* |

**G9 gegen G9b trennt die beiden Aussagen der Karte.** „Die Zeichen gehen" und
„die Zeilen bleiben" sind zwei verschiedene Regeln; G8 trifft die erste, G9b
die zweite. G9 **überzieht** die Regel, statt sie wegzunehmen, und reißt den
Lauf mit — deshalb steht G9b daneben (Stolperstein 76). Nebenbei ist G9 der
Beleg, dass `manage()` seine drei Behälter wirklich braucht: eine spätere
Stufe, die eine dieser Karten doch versteckt, muss dort mit ansetzen.

### Punkt 4 — die veraltete Anleitung

| # | Rückbau | rot |
|---|---|---|
| G10 | Die `AUTH_RESET`-Zeile steht wieder da | **3** — *Sie nennt AUTH_RESET nicht mehr* · *Sondern den Befehl, der wirklich hilft* · *AUTH_RESET steht in der ganzen Oberflaeche nirgends mehr* |

### Punkt 5 — die Kachel über die volle Breite

| # | Rückbau | rot |
|---|---|---|
| G12 | Die Kachel trägt die Kennzeichnung `breit` nicht mehr | **2** — *Und sie ist als breite Kachel gekennzeichnet* · *Als einzige der dreizehn* |
| G13 | Die Kennzeichnung bleibt, die Regel bewirkt nichts mehr (`grid-column: auto`) | **1** — *Und sie zieht die Kachel ueber alle Rasterspalten* |

**G12 gegen G13 ist Lücke 1 des Projektstands in Reinform:** eine
Klassenprüfung belegt nicht, dass die Klasse etwas bewirkt. Zwei getrennte
Punktlisten — die eine am Knoten, die andere am Stylesheet.

### Punkt 6 — die Trennlinien

| # | Rückbau | rot |
|---|---|---|
| G14 | Der Abschnitt bekommt nur Abstand, keine Linie | **1** — *Und sie zieht eine Linie darueber, nicht bloss einen Abstand* |
| G15 | Die Abschnitte tragen die Kennzeichnung `sys-teil` nicht mehr | **2** — *Die Karte „Links" traegt einen abgesetzten Abschnitt* · *Und die Karte „Suchanbieter" ebenfalls* |
| G16 | Die Linie bekommt eine eigene Farbe statt `var(--line)` | **2** — *Und sie zieht eine Linie darueber, nicht bloss einen Abstand* · *Ohne eine neue Farbe dafuer zu erfinden* |

**G14 gegen G16** liefert verschiedene Punktlisten (Stolperstein 72): der eine
nimmt die Linie weg, der andere lässt sie stehen und tauscht nur ihre Farbe.

**Nicht gegengeprüft, mit Grund:**

- **Die Karten „Kennzahlen" und „Import" einzeln.** Ein Rückbau, der sie ohne
  ihre Datenabhängigkeit wieder für jeden hinstellt, ist nicht herstellbar:
  „Kennzahlen" liest `stats.itemCount`, „Import" steht im selben
  `${EIGENTUEMER ? …}`-Block wie „Export". G3 und G7 treffen beide, und die
  Prüfungen *Die Karte „Kennzahlen" steht nur beim Admin* und *Die Karte
  „Import" steht nur beim Eigentuemer* stehen namentlich in ihren Listen.
- **Die Karte „Kategorien" als eigener Rückbau neben „Tags".** Beide gehen
  durch denselben `manage()`-Aufruf; G8 und G9b treffen den einen Ort, an dem
  die Regel steht. Ein zweiter Rückbau an derselben Zeile lieferte dieselbe
  Punktliste (Stolperstein 72).

---

## 5. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen gesamt | 1349 | **1391** |
| `F_ROUTEN` | 46 | **46** (unverändert) |
| Formatnummer Export | 6 | **6** (unverändert) |
| Umstiegsblöcke | 1 (`umstieg083`) | **1** (unverändert) |
| Karten im Systembereich | 12 | **13** |

Neue Prüfungen nach Ort:

| Gruppe | neu |
|---|---|
| Der Systembereich nach Rolle *(neu)* | 37 |
| Was dem Eigentuemer gehoert | 3 |
| Mehrbenutzer-Anzeigen in der Oberflaeche | 2 |

**19 Gegenproben**, darunter drei Paare aus grobem und engerem Rückbau
(G3/G3b, G9/G9b, G11/G11b). Zwei der drei groben Rückbauten reißen den Lauf
mit, ohne einen Namen zu nennen — deshalb steht neben jedem eine engere
Zweitprobe, die den Ort belegt (Stolpersteine 76 und 82).

**Zwei Prüfungen umgedreht statt gelöscht** (Stolperstein 74, Auflage aus dem
Auftrag):

| bis 0.8.4 | seit 0.8.5 |
|---|---|
| *Die Kennzahlen selbst sieht weiterhin jeder* | *Die Kennzahlen selbst sieht seit 0.8.5 nur noch der Admin* |
| *Tags und Kategorien bleiben unangetastet bedienbar* | *Tags und Kategorien tragen seit 0.8.5 dasselbe Muster* |

Dazu **zwei umbenannt**, weil ihr Gegenstand sich verschoben hat:

| bis 0.8.4 | seit 0.8.5 |
|---|---|
| *Aber nur die Eigentuemerin bekommt ihn* (an bert **und** carla) | *Aber den Schluesselwert bekommt nur die Eigentuemerin* (nur noch an carla — bert kommt gar nicht mehr an die Antwort) |
| *Die Karten selbst bleiben ihm — das raeumt erst die naechste Stufe* | *Die Karten selbst bleiben ihm* |

Und **zwei Gegenstücke neu daneben gestellt**, damit kein „ist weg" ohne sein
„mit Rolle ist es da" dasteht (Stolperstein 81): *Und die Tagzeilen tragen mit
Adminrolle ✎ und ✕* sowie *Die Tagnamen selbst bleiben sichtbar*.

---

## 6. Vorgemerkt für 1.0

**Aus dieser Version fällt nichts an.** Kein Punkt hat das Schema angefasst,
es ist kein Umstiegscode entstanden. `umstieg083()` in `db.js` bleibt der
einzige markierte Block — 18 Zeilen, 7 Prüfungen, unverändert.

---

## 7. Offen geblieben

- **Die Karte „Darstellung" bekommt keine Trennlinien**, obwohl sie drei
  Abschnitte hat. Der Auftrag nennt die Linkliste; die Klasse `.sys-teil` ist
  allgemein gehalten und ließe sich dort jederzeit setzen. Eine Zeile Arbeit,
  gehört in eine Runde zusammen mit den Dokumenten.
- **`README.md` ist seit 0.8.3 nicht nachgezogen.** Offen sind dort weiterhin
  die beiden Anlegen-Häkchen, die Abschaltbarkeit des Anlegens von Tags und
  Kategorien und der Umschalter „meine / alle" im Vergleich. **Dazu kommt
  jetzt:** dass der Systembereich nach Rolle unterschiedlich aussieht, dass
  die Kennzahlen nur noch der Admin sieht, und dass es die Karte
  „Suchanbieter" gibt.
- **Projektstand und Konzeptpapier** sind wie verlangt nicht angefasst.
  Nachzutragen wären dort: der Betriebsstand (Abschnitt 2), die neuen
  Stolpersteine 87 und 88 (Abschnitt 6), die Prüfzahlen (Abschnitt 7), die
  Zeile 0.8.5 in der Versionsgeschichte (Abschnitt 9), die erledigte Stufe G3
  (Abschnitt 10) und die eingelösten Merkposten (Abschnitt 11 — beide Auflagen
  aus Stolperstein 74 und die Zeile zum Vokabular sind mit dieser Version
  abgearbeitet). Im Konzeptpapier: **„neun Karten" ist falsch**, es sind
  dreizehn.
- **Nicht gebaut, wie im Auftrag festgelegt:** „Ansicht für Vokabular und
  Titel gar nicht" aus dem ersten Entwurf. Das Vokabular **ist** jede
  Beschriftung, der interne Titel steht in der Kopfzeile — beide werden
  weiterhin ausgeliefert. Eine Prüfung hält genau das fest: *Das Vokabular
  wird trotzdem ausgeliefert und benutzt*.

---

## 8. Für die Dokumente

**Neue Entscheidungen für Abschnitt 5 des Projektstands:**

- **Die Kennzahlen sieht nur der Admin** (seit 0.8.5). Nimmt „Die Kennzahlen
  selbst sieht weiterhin jeder" aus 0.7.2 ausdrücklich zurück. Sie sagen, wie
  groß der Bestand und wie belegt die Datenbank ist — eine Aussage über die
  **Anlage als Ganzes**, nicht über den Einzelnen. Der Schlüsselwert in
  derselben Antwort bleibt eine zweite, engere Klemme am Eigentümer; die
  beiden decken einander nicht zu.
- **Was verschwindet, sind die Karten, nicht die Daten** (seit 0.8.5). Das
  Vokabular ist jede Beschriftung der Oberfläche, der interne Titel steht in
  der Kopfzeile — beide werden auch an einen gewöhnlichen Benutzer
  ausgeliefert. Weg ist nur, womit man sie ändern könnte.
- **Wer nicht verwalten darf, darf trotzdem nachsehen** (seit 0.8.5). Die
  Karten „Kategorien", „Tags" und „Bewertungskriterien" bleiben für jeden
  stehen; nur Griff, ✎ und ✕ fallen weg. Die Namen sind die Auswahl, aus der
  jeder am Eintrag schöpft — eine Karte zu verstecken nähme ihm die Übersicht
  über etwas, das er benutzt.
- **Drei Karten sind Selbstbezug und hängen an keiner Rolle** (seit 0.8.5):
  „Zugang" (der eigene Zugang), „Darstellung" (Schriftgröße, Zeitleiste,
  Blockanordnung) und „Links" (sichtbare Zeilen, Zahl der Anbieternamen).
- **Die Karte „Links" ist in zwei geschnitten** (seit 0.8.5). Sie mischte
  Persönliches und Adminsachen als einzige Karte des Systembereichs. Der
  Schnitt folgt genau der Trennung, die der Server seit 0.6.5 hält:
  `linkZeilen` und `suchNamen` sind persönlich, `suche`, `sucheEigene` und
  `sucheAktiv` sind global. **Der Admin kuratiert, der Benutzer bestimmt die
  Dichte** — dieser Satz stand schon in `server.js` und hat jetzt seine
  Entsprechung auf dem Bildschirm.
- **Ein lesender Endpunkt kann einen Wächter tragen und steht trotzdem nicht
  in `F_ROUTEN`** (seit 0.8.2, mit 0.8.5 zum dritten Mal angewandt). Die Liste
  ist die Stelle, an der die Rechtefrage für **schreibende** Routen gestellt
  wird; ein Wächter vor einer lesenden Route ist davon unberührt.

**Für Abschnitt 4 (Funktionsumfang):** der Satz „**Systembereich:** beide
Titel, Kennzahlen, Karte „Zugänge" …" beschreibt jetzt die Sicht des
Eigentümers. Ein gewöhnlicher Benutzer sieht dort sechs Karten: seinen eigenen
Zugang, Darstellung, Links, und die drei Listen zum Nachsehen.
