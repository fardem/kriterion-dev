# Änderungsprotokoll 0.8.10 — „Werkzeug"

**Rohstoff für die Dokumentenpflege. Projektstand, Konzeptpapier, Ideenpapier
und README sind nicht angefasst.**

**0.8.10 — Abdruck `48fe44e7`**

Der Abdruck ist **zuletzt** gebildet worden, nach der letzten Änderung an
einer ausgelieferten Datei. Die Punkte 4 und 5 kamen danach und haben ihn
nicht bewegt — sie fassen nur `pruefung.js` und `.github/` an, und beides
wird weder geladen noch ausgeliefert. Genau das ist der Beweis, dass die
Ableitung schneidet, wie sie soll.

Gebaut wurden **alle fünf Auftragspunkte**. Der Haltepunkt nach Punkt 3 ist
erreicht und steht als eigener Commit in der Historie; die Punkte 4 und 5 sind
danach gebaut worden, weil noch Luft war.

Prüfungen: **1429 → 1480** (51 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — es ist keine schreibende Route
entstanden und keine hat ihre Art gewechselt. **Kein Punkt hat das Schema
angefasst.** Es ist kein Umstiegscode entstanden, und für „Vorgemerkt für 1.0"
fällt aus dieser Version **nichts** an: der Abdruck ist eine Ableitung beim
Start und rührt die Datenbank nicht an.

---

## 1. Was gebaut wurde, je Datei

### `db.js`, `auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`, `public/style.css`, `docker-compose.yml`, `.dockerignore`
**Unverändert.**

### `package.json` (+2/−2 Zeilen)
Version auf `0.8.10`. `sharp` von `^0.33.5` auf `^0.35.3`.

### `package-lock.json` (neu, 2433 Zeilen)
**Punkt 1.** `lockfileVersion 3`, 177 Pakete. Sie lag bisher nicht im Repo —
nicht ausgeschlossen, nur nie eingecheckt. Aufgelöst wird damit fest:
`better-sqlite3-multiple-ciphers 11.10.0`, `express 4.22.2`, `multer 2.2.0`,
`sharp 0.35.3`, `jsdom 30.0.1`.

### `Dockerfile` (+13/−7 Zeilen)

**Punkt 1.**
- `COPY package.json package-lock.json ./` statt `COPY package.json ./` — die
  Bauphase bekommt die Sperrdatei überhaupt erst zu sehen.
- `RUN npm ci --omit=dev` statt `RUN npm install --omit=dev`. **Das ist der
  eigentliche Punkt:** ohne den Wechsel läge die Datei im Repo und würde beim
  Bauen übergangen — ein Merker, der nichts bewirkt.
- Die zweite Stufe holt sich weiterhin alles über `COPY --from=builder` und
  bringt die Sperrdatei damit ohnehin mit.

**Punkt 2.**
- Beide Stufen auf `node:22-bookworm-slim` statt `node:20-bookworm-slim`.
- Die Schicht `apt-get install python3 make g++` steht **unverändert**. Sie
  wird auf Node 22 nicht gebraucht (es gibt einen Fertigbau, siehe unten),
  bleibt aber als Auffangnetz: fehlte er einmal, übersetzte `node-gyp`.

### `server.js` (+65/−0 Zeilen)

**Punkt 3 — der Versionsabdruck.** Der einzige Eingriff in den
Anwendungscode dieser Runde.
- `crypto` am Dateianfang dazu.
- `dateienUnter(verzeichnis)` — läuft ein Verzeichnis rekursiv ab.
- `bildeAbdruck()` — SHA-256 über die Dateien, acht Zeichen. **Die Liste wird
  abgeleitet, nicht gepflegt:** alles unter `public/` (das liefert
  `express.static` aus) plus alles in `require.cache` unterhalb von
  `__dirname` und außerhalb von `node_modules` (das führt der Server aus).
  Zusammengelegt, nach Namen sortiert. Je Datei gehen **Name und Inhalt** in
  den Hash, durch ein Nullzeichen getrennt — sonst bliebe eine Umbenennung
  unsichtbar.
- `const ABDRUCK = bildeAbdruck();` unmittelbar vor `app.listen`. Dort, weil
  `require.cache` erst nach allen `require`-Aufrufen vollständig ist.
- `GET /api/stats` nennt `abdruck` als zweites Feld, direkt hinter `version`.
- Heute deckt der Abdruck sieben Dateien ab: `server.js`, `db.js`, `auth.js`,
  `keys.js`, `anhaenge.js`, `package.json` und alles unter `public/`.

### `public/app.js` (+7/−1 Zeilen)

**Punkt 3.** Die Karte „Kennzahlen" bekommt eine Zeile `Abdruck` hinter
`Datenbank`, der Wert in `<code>`, durch `esc()` geführt, mit `—` als Rückfall.
Die Kurzbeschreibung der Karte nennt ihn mit. **Die Fußzeile bleibt bei der
blanken Versionsnummer.**

### `pruefung.js` (+484/−17 Zeilen)

**Punkt 4 — der Gruppenfilter** im Prüfrahmen (siehe Abschnitt 2), dazu
`schlussBlock()` und `rueckgabewert()` als eigene Funktionen, damit der
gefilterte und der volle Lauf **eine** Stelle für ihr Ende haben. Der
Dateikopf nennt den Aufruf.

**Die Selbstprobe hinter `PRUEFRAHMEN_PROBE`** am Dateianfang: zwei gestellte
Gruppen mit gestellten Ergebnissen, danach `schlussBlock()` und Ende. Sie
läuft nur, wenn die Umgebungsvariable gesetzt ist.

**Vier neue Gruppen** (siehe Abschnitt 5), dazu zwei Prüfungen bei
`/api/config` und vier in „Der Systembereich nach Rolle".

**Der Doppelgänger in `baueDom()`** liefert `abdruck: 'a1b2c3d4'` in der
Antwort auf `/api/stats`.

### `.github/workflows/pruefstand.yml` (neu, 45 Zeilen)

**Punkt 5.** `on: [push, pull_request]`; `actions/checkout@v4`,
`actions/setup-node@v4` mit `node-version: '22'` und `cache: npm`, dann
`npm ci`, `npm test`, `npm audit --audit-level=high`. Dazu ein
`concurrency`-Block, der einen überholten Lauf auf demselben Zweig ablöst.
Schlüsselwörter englisch, Kommentare deutsch.

---

## 2. Abweichungen und Entscheidungen

**Der Abdruck geht nach `/api/stats`, nicht nach `/api/config`.** Der Auftrag
neigte dazu und wollte eine Begründung. Drei Gründe, in dieser Reihenfolge:

1. Er ist **dieselbe Art Aussage** wie die Kennzahlen — eine über die Anlage
   als Ganzes. An diesem Endpunkt ist die Grenze schon gezogen.
2. Die Liste in `/api/config` ist eine Sicherheitsgrenze, gehalten von einer
   Prüfung, die den Schlüsselsatz Zeichen für Zeichen vergleicht. Sie ist mehr
   wert als die eine gesparte Anmeldung. Der erste harmlose Eintrag ist der
   Präzedenzfall, der den zweiten billig macht.
3. Der Abdruck nagelt den laufenden Dateisatz fest. Vor der Anmeldung nützt
   das dem Betreiber nichts — der kann sich anmelden.

**Der Schnitt der Dateiliste ist ein anderer als im Auftrag vorgeschlagen.**
Statt „alle `.js` im Wurzelverzeichnis plus `public/`" steht dort jetzt „was
der Server lädt plus was er ausliefert". Der Grund ist die Falle selbst: bei
einem blossen Verzeichnislauf müsste `pruefung.js` **ausgeschlossen** werden,
und dieser Ausschluss wäre eine zweite gepflegte Liste. Bei der Ableitung
über `require.cache` kann die Falle gar nicht erst entstehen — der Server
lädt `pruefung.js` nicht und liefert `Doku/` nicht aus.

**Die Grenze, die daraus folgt und die ausdrücklich geprüft wird:**
`zugang.js` liegt im Abbild, läuft aber nie im Server und steht deshalb
**nicht** im Abdruck. Ein veraltetes `zugang.js` fiele nicht auf. Der Abdruck
sagt, welcher **Server** läuft, nicht welches Werkzeug danebenliegt.

**Node 22 und nicht 24.** Node 20 ist seit dem 30. April 2026 ohne Pflege —
nachgesehen, nicht geglaubt. Der Auftrag nennt das Übersetzen von
`better-sqlite3-multiple-ciphers` als riskantesten Teil der Runde. Gemessen:

| Abbild | `npm ci --omit=dev` ohne Übersetzer | `better-sqlite3-multiple-ciphers` |
|---|---|---|
| `node:22-bookworm-slim` | **läuft durch**, 2 s | Fertigbau für ABI 127 |
| `node:24-bookworm-slim` | **bricht ab** | kein Fertigbau, fällt auf `node-gyp` |

Auf Node 22 wird also **nichts übersetzt** — das Risiko fällt weg statt
eingegangen zu werden. Node 24 gäbe ein Jahr mehr Frist (bis April 2028
gegen April 2027) und kostete dafür echte Übersetzung im Bauabschnitt.

**Die Begründung für Punkt 4 ist umgeschrieben.** Der Auftrag sagte es
vorher, und er hat recht: die Datei ist **ein** langer Ablauf, die Prüflagen
bauen aufeinander auf, Server werden einmal gestartet. Ein Namensfilter kann
nur die **Ausgabe** einschränken, nicht die **Arbeit** — `node pruefung.js
Rechte` dauert genauso lange wie der volle Lauf. Der Gewinn ist ein anderer
und trotzdem echt: statt 1480 stehen 96 Punkte auf dem Schirm. So steht es
jetzt im Quelltext, nicht die Begründung des Ideenpapiers.

**Der Rückgabewert eines gefilterten Laufs folgt dem Gezeigten.** Sonst wäre
`node pruefung.js Rechte` aus Gründen rot, die gar nicht angesehen werden, und
der Filter wäre wertlos. Damit „alles in Ordnung" trotzdem nie als
vollständiger Beleg gelesen werden kann, sagt der Schlussblock ausdrücklich,
wonach gefiltert wurde, wie viele Gruppen übergangen sind und — falls
zutreffend — dass darin etwas rot war. **Zwei Zusätze, die sich beim Bauen
ergeben haben:** ein Filter, auf den keine Gruppe passt, ist **rot** (sonst
meldete ein Tippfehler wortlos Erfolg), und die Zeile „0 von 0 Prüfungen
bestanden — alles in Ordnung" gibt es nicht mehr; sie hieße jetzt „KEINE
PRÜFUNG GEZEIGT — nichts belegt."

**`npm audit` im Prüflauf läuft über alle Abhängigkeiten**, auch die zum
Entwickeln — also ohne `--omit=dev`, genau wie im Auftrag geschrieben. Das
war eine bewusste Entscheidung gegen die naheliegende Verengung: `jsdom` liegt
nicht im Abbild, ein Fund dort träfe die Anwendung nicht. Aber sich darauf
zurückzuziehen wäre ein Herabsetzen der Schwelle durch die Hintertür. Heute
meldet der Lauf in beiden Fassungen null Funde.

**Zwei Zutaten über den Auftrag hinaus**, beide wegen der gedeckelten Minuten
eines privaten Repos: `concurrency` mit `cancel-in-progress` löst einen
überholten Lauf auf demselben Zweig ab, und `cache: npm` an `setup-node` hält
den Paketzwischenspeicher.

**Eine Unstimmigkeit zwischen Papier und Quelltext**, vor dem Bauen gemeldet:
der Auftrag nennt `metadata` als benutzte `sharp`-Funktion. Sie kommt
**nirgends** vor. Benutzt werden an drei Stellen (`server.js:91`, `:1803`,
`:1806`): `sharp(buf, { failOn: 'none' })`, `.rotate()`, `.resize(…, { fit:
'inside', withoutEnlargement: true })`, `.jpeg({ quality, mozjpeg: true })`,
`.toBuffer()`. Von den Brüchen in `sharp` 0.35.0 trifft davon keiner einen:
entfernt wurden `failOnError` (die **alte** Schreibweise — benutzt wird
`failOn`), `paletteBitDepth`, alte `sharpen`-Felder und `jp2k`; neu ist
`limitInputChannels` mit Vorgabe 5, und CMYK hat vier.

---

## 3. Neue Stolpersteine

**92. `fetch()` weigert sich, bestimmte Portnummern überhaupt anzuwählen.**
Ein Prüfserver auf Port 6000 läuft, meldet es im Protokoll — und die Prüfung
kommt trotzdem nicht an ihn heran: `fetch failed: bad port`. 6000 ist X11 und
steht auf der Sperrliste der Fetch-Spezifikation, zusammen mit rund achtzig
weiteren. `curl` kommt durch, `fetch` nicht. **Ein Prüfstand, der sich seine
Ports selbst vergibt, muss diese Liste meiden** — und das Fehlerbild führt in
die Irre, weil der Server nachweislich läuft.

**93. Ein Filter auf der Ausgabe braucht drei Aussagen, nicht eine.** Dass
gefiltert wurde, wie viel übergangen wurde, und ob im Übergangenen etwas rot
war. Fehlt die dritte, ist der Teillauf still; fehlt die zweite, sieht er aus
wie ein voller Lauf; fehlt die erste, ist er von einem vollen Lauf gar nicht
zu unterscheiden. **Und der Sonderfall ist der gefährlichste: ein Filter ohne
Treffer zeigt nichts und meldete ohne eigene Regel Erfolg für nichts.**

**94. Ein Rahmen kann sich nicht selbst bestätigen.** Wäre die Zählung des
Prüfrahmens falsch, wäre es die Zählung, die es meldet. Prüfbar wird er erst
von aussen — als eigener Prozess, dessen Ausgabe und Rückgabewert angesehen
werden. Damit das nicht den ganzen Durchlauf ein zweites Mal kostet, trägt der
Prüfstand eine **Selbstprobe**, die nur den Rahmen fährt: zwei gestellte
Gruppen, Millisekunden statt einer Minute.

**95. Ein Abdruck über Dateien ist erst dann vollständig, wenn alle Dateien
schon geladen sind.** Er entsteht beim Start; ein `require` **innerhalb** einer
Funktion liefe später und stünde dann nicht darin — der Abdruck würde still
unvollständig, ohne dass irgendetwas rot wird. Dagegen hilft kein Kommentar,
sondern ein Wächter über den Modulgraphen ab `server.js`.

---

## 4. Gegenprobentabelle

**Zweiunddreissig Gegenproben.** Jede benannt, jede mit `diff` belegt, jede
mit ihrer eigenen Punktliste. Der Rückbau wird in allen Fällen durch einen
Treiber gesetzt und danach zwangsweise zurückgenommen — auch bei Abbruch
(Stolperstein 75).

### Punkt 1 — der Bau ist wiederholbar

| Rückbau | Ergebnis |
|---|---|
| `package-lock.json` wird in `.dockerignore` aufgenommen | **1 rot** — *.dockerignore hält die Sperrdatei nicht zurück* |
| `npm ci` wird wieder `npm install` | 2 rot |
| eine **zusätzliche** Zeile `RUN npm install --no-save`, `npm ci` bleibt | **1 rot** — *Keine Bauzeile ruft npm install* |
| `COPY package.json package-lock.json ./` wird `COPY package.json ./` | **1 rot** |
| die Sperrdatei fehlt ganz | 4 rot |
| `version` in der Sperrdatei auf `0.0.1` | **1 rot** — *Sie gehört zu dieser package.json* |
| `sharp` fällt aus `packages` der Sperrdatei | **1 rot** — *Sie nennt jede Abhängigkeit* |
| `alsMuster()` trifft nie | **1 rot** — *Und das Muster greift nachweislich* |

**Das letzte Paar trägt mehr als seine Zahl** und ist Stolperstein 81 in
Reinform: bei einem nie greifenden Muster bleibt „`.dockerignore` hält die
Sperrdatei nicht zurück" **grün** — eine leere Trefferliste macht jede
Verneinung wahr. Nur die Prüfung daneben findet es.

**Und das Paar am `npm install`** trennt zwei Sachen: „der richtige Befehl
steht da" (2 rot beim Tausch) von „der falsche ist weg" (1 rot bei der
zusätzlichen Zeile). Verschiedene Punktlisten, also verschiedene Sachen
(Stolperstein 72).

### Punkt 3 — der Versionsabdruck

| Rückbau | Ergebnis |
|---|---|
| `abdruck` fällt aus der Antwort von `/api/stats` | 5 rot |
| die Liste wird ein blosser Verzeichnislauf über alle `.js` der Wurzel | 4 rot |
| `public/` fällt aus der Liste | 2 rot |
| der **Name** geht nicht mehr in den Hash, nur der Inhalt | **1 rot** — *Zwei Dateien gleichen Inhalts unter verschiedenem Namen* |
| der volle Hash statt acht Zeichen | 4 rot |
| `abdruck` wandert **zusätzlich** nach `/api/config` | 2 rot |
| die Zeile fällt aus der Karte „Kennzahlen" | 2 rot |
| die Zeile bleibt, zeigt aber einen festen Text | **1 rot** — *Und darin steht der Wert aus der Antwort* |
| ein `require` wandert in `db.js` in eine Funktion | **1 rot** |
| der Modulgraph bleibt bei `server.js` stehen | **1 rot** |
| der Doppelgänger kennt `abdruck` nicht mehr | **1 rot** |

**Der zweite Rückbau ist die Falle des Auftrags in Reinform.** Mit dem
blossen Verzeichnislauf zählen `pruefung.js`, `Doku/` und `zugang.js` mit —
genau die drei Prüfungen werden rot, dazu die auf den Ausgangsstand.

**Drei Paare tragen mehr als ihre Zahl.** Die beiden an der Karte trennen
„die Zeile fehlt" (2 rot) von „die Zeile ist falsch" (1 rot). Der Rückbau am
Doppelgänger belegt Stolperstein 90: die Zeile wird weiterhin **gezeichnet**
(mit dem Rückfall `—`), nur der Wert stimmt nicht — die Prüfung auf das
Vorhandensein bleibt grün, und ohne die Prüfung auf den **Wert** daneben
fiele es niemandem auf. Und die beiden am Modulgraphen trennen „der Wächter
greift" von „der Wächter hat überhaupt etwas zu lesen" (Stolperstein 81).

### Punkt 4 — der Gruppenfilter

| Rückbau | Ergebnis |
|---|---|
| der Schlussblock sagt nicht mehr, dass gefiltert wurde | **1 rot** |
| ein übergangener Fehlschlag färbt den Lauf doch rot | 2 rot |
| die Überschrift wird auch bei übergangenen Gruppen gedruckt | 4 rot |
| der Rückgabewert kümmert sich nicht mehr um den Filter ohne Treffer | **1 rot** — *Und sein Rückgabewert ist rot* |
| „KEINE PRÜFUNG GEZEIGT" fällt weg, „0 von 0 bestanden" kehrt zurück | **1 rot** |
| übergangene Prüfungen werden gar nicht mehr gezählt | 2 rot |

### Punkt 5 — der Prüflauf bei jedem Push

| Rückbau | Ergebnis |
|---|---|
| `node-version` im Prüflauf auf `'20'` | **1 rot** — *Und es ist dieselbe* |
| die Laufzeitstufe des `Dockerfile` auf `node:24` | **1 rot** — *Bauphase und Laufzeit* |
| `--audit-level=high` wird `moderate` | 2 rot |
| `continue-on-error: true` am `audit`-Schritt | **1 rot** — *Die Schwelle ist nicht abgesenkt* |
| `on: [push, pull_request]` wird `on: [push]` | **1 rot** |
| `npm ci` im Prüflauf wird `npm install` | **1 rot** |
| die Datei fehlt ganz | 7 rot |

**Der letzte Rückbau ist lehrreich:** bei fehlender Datei bleibt „Die Schwelle
ist nicht abgesenkt" **grün** — eine leere Zeichenkette macht jede Verneinung
wahr. Genau deshalb steht die Prüfung auf das **Vorhandensein** der Datei an
erster Stelle (Stolperstein 81).

**Kein Rückbau hat in dieser Runde den Lauf abgerissen**, eine engere
Zweitprobe nach Stolperstein 76 war deshalb nirgends nötig.

---

## 5. Prüfungszahlen

**1429 → 1480, 51 neue.** Vier neue Gruppen, dazu sechs Prüfungen in
vorhandenen Gruppen.

| Gruppe | Prüfungen |
|---|---|
| „Der Bau ist wiederholbar" *(neu)* | 9 |
| „Der Versionsabdruck" *(neu)* | 12 |
| „Der Gruppenfilter" *(neu)* | 14 |
| „Der Prüflauf bei jedem Push" *(neu)* | 10 |
| bei `/api/config` ergänzt | 2 |
| „Der Systembereich nach Rolle" ergänzt | 4 |

**„Der Versionsabdruck" prüft nicht die Liste, sondern worauf der Abdruck
reagiert.** Die Liste nachzubilden hiesse, dieselbe Rechnung ein zweites Mal
aufzuschreiben — zwei Wahrheiten über dieselbe Sache. Stattdessen läuft ein
Server aus einer **Kopie** des Quelltexts in einem Wegwerfverzeichnis; nur so
lassen sich Dateien anfassen, ohne den laufenden Prüflauf unter sich selbst zu
verändern. Vierzehn Server nacheinander, jeder mit eigenem Datenverzeichnis,
jeder frisch eingerichtet. Gezeigt wird: gleicher Inhalt an anderem Ort ergibt
denselben Abdruck; `pruefung.js`, `Doku/` und `zugang.js` bewegen ihn nicht;
`public/app.js` und `db.js` bewegen ihn; gleicher Inhalt unter anderem Namen
ergibt einen anderen; und der Ausgangsstand ergibt wieder den ersten Wert.

**Stolperstein 74 ist eingelöst.** Die Prüfung „Die Kennzahlen nennen sie
ebenfalls" ist **umgedreht, nicht gelöscht**: daneben stehen jetzt „Der
Abdruck bleibt vor der Anmeldung draussen" und „Die Kennzahlen nennen ihn
dafür". Damit ist „umdrehen oder umhängen, nicht löschen" in sechs
aufeinanderfolgenden Versionen angewandt worden.

**Der Prüflauf ist gleich schnell geblieben:** 62–64 s, gemessen über drei
Läufe hintereinander, gegen 62 s vor der Runde. Die vierzehn zusätzlichen
Server kosten nichts Messbares.

---

## 6. Vorgemerkt für 1.0

**Nichts.** Es ist kein Umstiegscode entstanden. Der Abdruck ist eine
Ableitung beim Start und rührt die Datenbank nicht an — genau der Fall, den
der erste Punkt der Bauregel meint: Code, der später gar nicht entfernt werden
muss.

Der Stand von 0.8.3 bleibt unverändert: `db.js`, `umstieg083()`, 18 Zeilen,
7 Prüfungen.

---

## 7. Offen geblieben

**Der Bau des unveränderten `Dockerfile` ist in der Bausitzung nur mit einer
Krücke gelaufen.** Die Ausgangssperre der Sitzung blockierte `deb.debian.org`
und jeden geprüften Debian-Spiegel (403), dazu Docker Hubs Blob-CDN. Belegt
werden konnte trotzdem alles Wesentliche: `docker compose build` läuft
durch, das Abbild startet, `/api/config` antwortet mit `0.8.10`, Node 22.23.2,
`sharp` 0.35.3 auf libvips 8.18.3, `better-sqlite3-multiple-ciphers` lädt
gegen sqlite 3.49.2, im Laufzeitabbild liegt kein Übersetzer, und der Abdruck
im Container ist **derselbe** wie auf der Platte. Nicht belegt ist allein,
dass Debian die drei Pakete ausliefert — und diese Zeile ist unverändert.

Die Krücke war ein Grundabbild aus dem **vollen** `node:22-bookworm`, das die
drei Pakete schon mitbringt, mit beiseitegelegter Paketquelle: dann läuft
`apt-get update` leer durch und `apt-get install` meldet „already the newest
version". **Zwei Zahlen sind dadurch verfälscht** und hier richtiggestellt,
gemessen gegen das echte schlanke Grundabbild: das Abbild ist **101 MB** groß
(nicht 420), und in der Laufzeitstufe liegt **kein Übersetzer** — die
apt-Schicht steht in der Bauphase, und die Laufzeit holt sich über
`COPY --from=builder` allein `/app`.

**Zwei Abrisse des Prüflaufs unter schwerer Nebenlast.** Zweimal meldete
`starteWeiterenServer` „Zweitserver nicht erreichbar", beide Male während
gleichzeitig ein Abbild gebaut wurde. Drei Läufe hintereinander ohne Nebenlast
liefen sauber durch. Die Ursache ist kein Zusammenstoss — jeder Zweitserver
wird vor dem nächsten gestoppt — sondern das Wartefenster von 12 Sekunden, das
unter Last nicht reicht. **Auf einem geteilten Läufer bei GitHub kann das
wieder auftreten.** Nicht angefasst, weil es keiner der fünf Punkte ist; die
Antwort wäre ein grösseres Fenster und eine Fehlermeldung, die sagt, welcher
der elf Zweitserver gemeint ist.

**Die Minuten bei GitHub Actions sind nicht ausgelesen.** Private Repos:
Free 2.000, Pro und Team 3.000, Enterprise 50.000 Minuten im Monat. *Welche*
Stufe dieses Konto hat, lässt sich über die API ohne zusätzliches Recht nicht
lesen — es steht unter Settings → Billing. Die Rechnung dazu: ein Lauf kostet
etwa 2–3 Minuten, ein Push auf einen Zweig mit offener Anfrage läuft zweimal,
also rund 5 Minuten. Selbst auf Free sind das ungefähr **400 Pushes im
Monat**.

**Der Abdruck deckt `zugang.js` nicht ab.** Bewusst so entschieden und
geprüft, siehe Abschnitt 2.

---

## 8. Für die Dokumente

- **Projektstand, Abschnitt 9 (Versionsgeschichte):** 0.8.10 „Werkzeug" —
  alle fünf Punkte, Abdruck `48fe44e7`.
- **Projektstand, Abschnitt 10:** die Zeile 0.8.10 des Stufenplans ist
  eingelöst. Als Nächstes 0.8.20 „Die Schotten dicht".
- **Projektstand, Abschnitt 6:** vier neue Stolpersteine, 92 bis 95.
- **Projektstand, Abschnitt 7:** 1480 Prüfungen, 32 Gegenproben; dazu, dass
  der Prüfstand sich in Gruppen aufrufen lässt und bei jedem Push läuft.
- **Projektstand, Abschnitt 11:** neu bindend — *die Node-Version steht an
  zwei Stellen und muss an beiden dieselbe sein*, und *was der Server weder
  lädt noch ausliefert, steht nicht im Abdruck*.
- **README:** der Abschnitt über die Textstelle zum Gegenprüfen ist durch
  Punkt 3 überholt und gehört durch drei Sätze über den Abdruck ersetzt.
  Dazu, was Punkt 1 am Einspielweg ändert (`npm ci`, Sperrdatei) und dass
  das Abbild jetzt auf Node 22 steht.
- **Ideenpapier, 5.5:** die Begründung dort stimmt nicht — der Filter spart
  keine Zeit. Siehe Abschnitt 2.
