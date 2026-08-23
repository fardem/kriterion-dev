# Änderungsprotokoll 0.8.20 — „Die Schotten dicht"

**Rohstoff für die Dokumentenpflege. Projektstand, Konzeptpapier, Ideenpapier
und README sind nicht angefasst.**

**0.8.20 — Fingerprint `3ab38137`**

Der Fingerprint ist **zuletzt** gebildet worden, nach der letzten Änderung an einer
ausgelieferten Datei. Diese Runde ändert nichts an seiner Ableitung; sie fasst
mit `anhaenge.js`, `auth.js`, `db.js` und `server.js` vier Dateien an, die er
ohnehin schon deckt. `Dockerfile` und `pruefung.js` bewegen ihn nicht — beide
werden weder geladen noch ausgeliefert.

Gebaut wurden **alle fünf Auftragspunkte**. Der Haltepunkt nach Punkt 3 ist
erreicht und steht als eigener Commit in der Historie; die Punkte 4 und 5 sind
danach gebaut worden. Der Haltepunkt-Stand ist **für sich grün** — eigener
Prüflauf gegen genau diesen Commit: 1526 von 1526.

Prüfungen: **1480 → 1548** (68 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — es ist keine schreibende Route
entstanden und keine hat ihre Art gewechselt. **Kein Punkt hat das Schema
angefasst.** Es ist kein Migrationscode entstanden, und für „Vorgemerkt für 1.0"
fällt aus dieser Version **nichts** an: der Index ist eine Ableitung beim
Start, `hinterProxy` rührt kein Schema an, alles Übrige ist Anwendungscode.

---

## 1. Was gebaut wurde, je Datei

### `keys.js`, `zugang.js`, `public/app.js`, `public/index.html`, `public/style.css`, `docker-compose.yml`, `.dockerignore`
**Unverändert.** Die Oberfläche ist an keiner Stelle angefasst worden — die
Sicherheitsregel aus Punkt 2 ist so geschnitten, dass sie zu ihr passt, nicht
umgekehrt (Abschnitt 2, Abweichung A).

### `package.json` (+1/−1 Zeile)
Version auf `0.8.20`.

### `package-lock.json` (+2/−2 Zeilen)
Nur die beiden Versionszeilen — `npm install --package-lock-only`, keine
Abhängigkeit bewegt. Ohne das wäre *„Es gehört zu dieser package.json"* rot
geworden.

### `anhaenge.js` (+57/−0 Zeilen)
**Punkt 1.** Zwei neue Funktionen und ein neunter Punkt in der Regel im Kopf.

`typAusBytes(buf)` leitet den Typ aus den ersten Bytes ab: JPEG, PNG, GIF,
WebP, AVIF (Marke `avif`/`avis`), TIFF und BMP. Alles Übrige bleibt bewusst
unerkannt und wird damit `application/octet-stream`. Eine SVG ist Text und
beginnt mit nichts Festem — sie fällt heraus, und das ist die gewünschte
Antwort.

`setzeBildHeader(res, buf, { name, maxAge })` ist die zweite Form von
`setzeHeader()`: dort entscheidet der Dateiname, hier der Inhalt. Sie
setzt Content-Type, Content-Disposition (inline nur für die Positivliste,
sonst Download), `nosniff`, die Sicherheitsregel und `Cache-Control`. Der
ausgelieferte Dateiname trägt die Endung des **erkannten** Typs.

### `server.js` (+93/−10 Zeilen)

**Punkt 1.** `rasterBild(buf)` prüft mit `sharp(buf).metadata()`, ob das
Ergebnis eines der sechs Rasterformate ist; `POST /api/items/:id/photos` weist
alles andere mit 400 ab. `metadata()` kommt damit zum ersten Mal in den
Quelltext. `GET /api/photos/:id/raw` setzt den Typ nicht mehr selbst, sondern
ruft `anh.setzeBildHeader()` — `photos.mime_type` kommt im Rumpf gar nicht
mehr vor. Der `fileFilter` am Upload wirft seinen Fehler ab jetzt mit
`status = 400` (siehe Punkt 4).

**Punkt 2.** Neben dem vorhandenen `nosniff` steht jetzt `CSP_ANWENDUNG` für
jede Antwort der Anwendung:

```
default-src 'self'; img-src 'self' data: blob:;
style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src 'self';
frame-ancestors 'none'; base-uri 'none'; form-action 'none'
```

**Punkt 3.** `Strict-Transport-Security: max-age=31536000` in derselben
Middleware, nur wenn `auth.HINTER_PROXY`. Dazu eine zweite Zeile im
Startprotokoll, die die Betriebsart nennt.

**Punkt 4.** Der Fehler-Handler unterscheidet: `err.status` / `err.statusCode`
oder ein `MulterError` behalten Rang und Meldung, alles Übrige wird 500 mit
festem Text *„Im Server ist etwas schiefgegangen."*

**Punkt 5a.** `SIGTERM` und `SIGINT` schließen die WAL (`wal_checkpoint
(TRUNCATE)`) und die Datenbank, dann `process.exit(0)`.

### `auth.js` (+51/−6 Zeilen)
**Punkt 3.** `HINTER_PROXY` aus der Umgebung (`1|true|ja|an|yes|on`, Vorgabe
aus). Vier Wirkungen hängen daran:

- `clientIp()` liest `X-Forwarded-For` nur bei eingeschalteter Einstellung —
  und dann den **letzten** Eintrag der Kette. Ohne sie allein
  `req.socket.remoteAddress`; der Kopf wird nicht einmal angesehen.
- `SICHER` hängt `; Secure` an den Cookie.
- `COOKIE_NAME` wird `__Host-kriterion_session` statt `kriterion_session`.
- `HINTER_PROXY` wird mitexportiert; `server.js` setzt daran HSTS.

### `db.js` (+5/−0 Zeilen)
**Punkt 5b.** `CREATE INDEX IF NOT EXISTS idx_sessions_user ON
sessions(user_id);` neben die Tabelle, mit der Begründung daneben.

### `Dockerfile` (+6/−0 Zeilen)
**Punkt 5, Nachtrag.** `HEALTHCHECK` gegen `/api/config` (30 s Takt, 3 s
Zeitgrenze, 20 s Anlauf). Kein Eingriff in `/api/health` — das liegt hinter
der Anmeldung und käme für einen Healthcheck nie in Frage.

### `pruefung.js` (+413/−6 Zeilen)
Sieben neue Gruppen, drei erweiterte, eine umgehängt. Einzelheiten in
Abschnitt 5.

---

## 2. Abweichungen und Entscheidungen

### A. `style-src 'self'` hätte die Oberfläche zerlegt — Abweichung vom Auftrag

Der Auftrag hält fest, ein `style="…"`-Attribut sei von `style-src` weiterhin
erlaubt, `'unsafe-inline'` nur für `<style>`-Elemente nötig. **Das ist
falsch.** In einem echten Chromium nachgemessen, eigener Server, Header
wörtlich wie im Auftrag:

```
color   = rgb(0, 0, 0)   (ohne Regel: rgb(1, 2, 3))
padding = 0px            (ohne Regel: 44px)
Konsole: Refused to apply inline style … "style-src 'self'"
```

In `public/app.js` stehen **36** solcher Attribute — Randabstände,
Rasterspalten der Vergleichsansicht, `object-position` des Fokuspunkts. Die
Regel wäre also nicht billig gewesen, sondern hätte die Anzeige gekostet.
Gebaut ist deshalb `style-src 'self' 'unsafe-inline'`.

Die enge Form `style-src 'self'; style-src-attr 'unsafe-inline'` wurde
mitgemessen und funktioniert ebenfalls, ist aber **nicht** genommen worden:
ältere Browser kennen `style-src-attr` nicht, fallen auf `style-src` zurück
und zeichneten die Oberfläche dann kaputt. `script-src` bleibt streng — dort
liegt die Wirkung, und der Prüfstand hält ausdrücklich fest, dass dort **kein**
`'unsafe-inline'` steht.

Die 36 Stellen umzubauen wäre ein eigener Auftrag und kein Nebenbei dieser
Runde. Die Zahl steht im Prüfstand: fällt sie je auf 0, gehört die Freigabe
weg.

### B. Der letzte Eintrag der Kette, nicht der erste

Der Auftrag sagt dazu nichts, das Ideenpapier (2.2) nennt den letzten. Gebaut
ist der letzte: ein Proxy hängt die Gegenstelle, die er wirklich sieht, hinten
an — alles davor kann der Aufrufer selbst geschrieben haben, und genau der
erste Eintrag war es, den die alte Fassung nahm. Eine eigene Gruppe belegt
beide Richtungen.

### C. Die Einstellung ist eine Umgebungsvariable

`HINTER_PROXY` in der `.env`, parallel zu `PORT`, `DATA_DIR` und
`ENCRYPTION_KEY` — nicht ein Schlüssel in `settings`. Sie entscheidet über
Netzwerkvertrauen, nicht über eine Vorliebe; ein übernommener Admin-Zugang
könnte sie sonst über `PUT /api/settings` selbst umlegen und damit die
IP-Bremse abstellen.

### D. Der Import bleibt ungeprüft

Die Prüfung am Ergebnis (`rasterBild`) sitzt am Hochladeweg, nicht am Import.
Eine Exportdatei kommt nur vom Eigentümer, und die zweite Schicht deckt sie
ohnehin: was aus einem Import in `photos` landet, wird beim Ausliefern
genauso aus den Bytes bestimmt. Eine Prüfung dort hätte alte Sicherungen mit
SVG-Fotos unaufspielbar gemacht, ohne etwas zu gewinnen.

### E. Die Kommentarbilder bleiben, wie sie sind

`GET /api/comment-images/:id/raw` ruft weiter `setzeHeader(res,
'bild.jpg')`. Das ist kein Versehen: die Bytes sind dort beim Hochladen neu
kodiert worden, der Typ steht damit ohnehin fest. Der Wächter über den
Quelltext greift trotzdem — auch diese Zeile setzt keinen Typ selbst.

### F. `photos.mime_type` bleibt stehen

Die Spalte wird weiter geschrieben und angezeigt. Sie ist ab jetzt eine
Anzeige, keine Ausliefergrundlage. Kein Schemaeingriff, kein Migrationscode —
und der Prüfstand belegt an einer echten Bestandszeile, dass eine vor dieser
Version hereingekommene SVG trotzdem nicht mehr als `image/svg+xml` herausgeht.

### G. Die README ist nicht angefasst

Der Auftrag nennt „der Hinweis in der README" als eine der fünf Wirkungen von
`hinterProxy`, verbietet aber im selben Atemzug, die README anzufassen. Der
Hinweis fehlt damit — siehe Abschnitt 7.

---

## 3. Neue Stolpersteine

**96. Eine Content-Security-Policy mit `style-src` verwirft auch
`style="…"`-Attribute.** Nicht nur `<style>`-Elemente: die Freigabe
`'unsafe-inline'` entscheidet über beides zugleich, und ohne sie fällt jedes
einzelne Attribut still weg — die Seite lädt, sie sieht nur falsch aus.
`el.style.x = …` über CSSOM bleibt dagegen erlaubt. **Vor einer CSP gehören
die Attribute gezählt, nicht geschätzt** — und nachgemessen wird im Browser,
nicht in `jsdom`: dort greift keine CSP, eine Prüfung sähe nur den Header.

**97. Wer ein Header vom Aufrufer nicht mehr glaubt, nimmt zuerst dem
eigenen Prüfstand ein Werkzeug weg.** Die Gruppe zur Namensbremse gab jedem
Versuch eine eigene Adresse per `X-Forwarded-For` — genau die Behauptung, die
diese Version nicht mehr annimmt. Vier Prüfungen wurden rot, ohne dass etwas
kaputt war. Sie sind auf einen Server **mit** eingeschalteter Einstellung
umgehängt worden, und damit prüfen sie jetzt zwei Sachen statt einer.
Stolperstein 74 in neuer Gestalt: umhängen, nicht löschen.

**98. Eine Prüfung, die nur der Header ansieht, belegt nicht, was
herausgeht.** Zur Auslieferung gehört der Bytestrom daneben: der Inhalt ist
bei einer SVG aus dem Bestand unverändert die SVG samt Skript — gefährlich
wäre allein, dass der Browser sie als Webseite liest. Erst Header **und**
Inhalt zusammen sagen, was der Fall ist.

**99. `pkill -f "node server.js"` erschlägt den laufenden Prüfstand.** Der
startet seine Server als eigene Prozesse mit genau dieser Befehlszeile. Ein
Aufräumbefehl neben einem laufenden Prüflauf sah aus wie ein echter Fehler
(*„Prueflauf abgebrochen: fetch failed"*), war aber selbst die Ursache.
**Was im Hintergrund läuft, gehört vor jedem `pkill` bedacht.**

**100. Ein Rückbau in derselben Arbeitskopie ist eine Wette auf einen
störungsfreien Lauf.** Bricht der Vorgang mittendrin ab, bleibt der Rückbau
stehen — und die nächste Änderung baut auf einem Stand auf, den niemand so
wollte. Die Gegenproben dieser Runde laufen deshalb in einer **Kopie des
Arbeitsbaums**; der echte Baum wird nicht angefasst. (Hier tatsächlich
eingetreten und einmal von Hand zurückgeholt.)

---

## 4. Gegenprobentabelle

**Vierzehn Gegenproben**, jede in der Kopie des Arbeitsbaums gefahren, jede
mit dem Filter auf ihre Gruppe.

### Punkt 1 — der Fotoweg

| Rückbau | Ergebnis |
|---|---|
| `setzeBildHeader()` wird wieder `res.set('Content-Type', p.mime_type)` | **5 rot** in *Fotos*, dazu 3 im Wächter — *Eine SVG aus dem Bestand geht NIE als image/svg+xml heraus* |
| die Prüfung `rasterBild()` beim Hochladen fällt weg | **5 rot** — *Eine SVG wird als Foto abgewiesen* |
| `/api/health` setzt seinen Typ wieder selbst | **1 rot** — *server.js setzt den Content-Type an keiner Stelle selbst* |

Der letzte Rückbau ist der Wächter aus Projektstand Abschnitt 11: er findet
eine **fehlende** Entscheidung, nicht eine falsche. Er trägt unmittelbar für
0.8.50, wo ein Video inline ausgeliefert wird.

### Punkt 2 — die Sicherheitsregel für die Anwendung

| Rückbau | Ergebnis |
|---|---|
| der Header fällt ganz weg | **7 rot** |
| `style-src` verliert `'unsafe-inline'` | **1 rot** — *Und die Freigabe steht nur bei style-src* |
| `script-src` bekommt `'unsafe-inline'` | **1 rot** — *Und ausdrücklich KEIN eingebettetes Skript* |

Das letzte Paar trennt zwei Sachen, die leicht als eine gelesen werden: dass
die Freigabe **da** ist, wo sie sein muss, und dass sie **nicht** da ist, wo
sie nichts zu suchen hat.

### Punkt 3 — der Kopf vom Aufrufer

| Rückbau | Ergebnis |
|---|---|
| `clientIp()` wie vor 0.8.20 (erster Eintrag, immer geglaubt) | **2 rot**, dazu 1 im Übergangenen — *Ein wechselnder Kopf hält die Bremse nicht mehr auf* |
| der **erste** statt der letzte Eintrag der Kette | **1 rot** — *Der letzte Eintrag der Kette wird gezählt und gesperrt* |
| `Secure` fällt weg | **1 rot** — *Der Cookie trägt hinter dem Proxy Secure* |
| der Cookiename bleibt `kriterion_session` | **2 rot** — *Und er heisst \_\_Host-kriterion\_session* |
| HSTS fällt weg | **1 rot** — *Hinter dem Proxy steht Strict-Transport-Security* |

Fünf Rückbauten für fünf Wirkungen einer Einstellung — jede einzeln belegt.

### Punkt 4 — der Fehler-Handler

| Rückbau | Ergebnis |
|---|---|
| Handler wie vor 0.8.20 (alles 400 samt Meldung) | **2 rot** in *Fehler nach Rang*, 2 im Wächter — *Ein Fehler des Servers kommt als 500* |

Was der alte Handler dabei preisgab, wörtlich mitgeschnitten:

```
400 {"error":"number 5 is not iterable (cannot read property Symbol(Symbol.iterator))"}
```

Jetzt: `500 {"error":"Im Server ist etwas schiefgegangen."}` — und die
Einzelheiten stehen im Protokoll, wo sie hingehören.

### Punkt 5 — Herunterfahren, Index, Healthcheck

| Rückbau | Ergebnis |
|---|---|
| der `SIGTERM`-Block fällt weg | **1 rot** — *Nach SIGTERM ist die WAL abgeschlossen*, dazu 2 im Wächter |
| die Indexzeile fällt aus `db.js` | **2 rot** — *Der Index auf sessions.user\_id ist da* |
| `HEALTHCHECK` fällt aus dem `Dockerfile` | **2 rot** — *Der Dockerfile hat einen Healthcheck* |

---

## 5. Prüfungszahlen

**1480 → 1548, alle grün.** 68 neue Prüfungen.

| Gruppe | Prüfungen | |
|---|---|---|
| `Fotos: Auslieferung (Sicherheitsregel)` | 15 | neu |
| `Die Sicherheitsregel fuer die Anwendung selbst` | 12 | neu |
| `Ohne Proxy ist der Kopf nur eine Behauptung` | 4 | neu |
| `Hinter dem Proxy wird der Kopf gelesen` | 8 | neu |
| `Welcher Eintrag der Kette zaehlt` | 2 | neu |
| `Fehler nach Rang` | 7 | neu |
| `Sauberes Herunterfahren und der Index auf sessions` | 7 | neu |
| `Der Waechter ueber den Quelltext` | +10 | erweitert |
| `Der Bau ist wiederholbar` | +3 | erweitert (Healthcheck) |
| `Die Anmeldebremse zaehlt auch den Namen` | 5 | umgehängt, Zahl gleich |

**Was die neuen Gruppen wirklich fahren**, nicht nur ansehen:

- **Fotos.** Echter Server, echter Multipart-Upload einer SVG mit
  `<script>`, echte Kontrolle des ausgelieferten Bytestroms. Dazu der
  Erfolgsfall daneben (PNG), die Nachschau, dass die abgewiesene Datei in
  keiner Zeile steht, und eine per SQL eingesetzte **Bestandszeile** für den
  Fall, den es vor dieser Version schon gab.
- **Proxy.** Beide Lagen, jede auf einem eigenen Server mit eigener Umgebung:
  aus (Vorgabe) und an, mit echtem `X-Forwarded-For` im Prüfaufruf. Belegt
  wird auch, dass der Cookie mit dem neuen Namen **gelesen** wird und der alte
  Name nicht mehr gilt — die einmalige Abmeldung ist damit belegt, nicht
  vermutet.
- **Herunterfahren.** Die WAL wird vor dem Signal gemessen (`> 0 Bytes`,
  Stolperstein 81), dann `SIGTERM`, dann wieder gemessen (`0 Bytes`), dann
  nachgesehen, dass der Bestand wirklich in der Hauptdatei steht.
- **Index.** Nicht nur „steht im Schema": `EXPLAIN QUERY PLAN` belegt, dass
  der Abfrageplaner ihn nimmt. Und die Behauptung „kein Migrationscode nötig"
  ist nachgestellt statt geglaubt — Index von Hand entfernt, ein Start, Index
  wieder da.

---

## 6. Vorgemerkt für 1.0

**Nichts.** Kein markierter Block ist entstanden. `migration083()` bleibt der
einzige Migrationscode im Projekt.

---

## 7. Offen geblieben

- **Der Hinweis in der README zu `HINTER_PROXY`.** Eine der fünf Wirkungen
  aus Projektstand Abschnitt 11; der Auftrag verbietet das Anfassen der
  README. Gehört bei der nächsten Dokumentenpflege nachgetragen, samt der
  Zeile, dass das Einschalten alle einmalig abmeldet.
- **Welcher Proxy tatsächlich davorsteht.** Läuft Nginx Proxy Manager im
  selben Docker-Netz oder über den veröffentlichten Port 3100? Bei
  Bridge-Netzwerk ohne `network_mode: host` sieht der Container nie die echte
  Adresse des Besuchers, sondern die des vorgeschalteten Hops — dann fasst
  `hinterProxy: aus` alle Besucher in **einen** Zähler, und die IP-Bremse
  wirkt wie eine Bremse für die ganze Anlage. Das ist keine Lücke, aber es
  ändert, was die Einstellung im Betrieb bedeutet. Nachzusehen auf dem Wirt,
  die Befehle stehen im Chat.
- **Eine Adressliste, wer den Kopf setzen darf**, ist bewusst nicht gebaut —
  die Einstellung ist ein Ja/Nein. Wird die Anlage je aus mehreren Netzen
  zugleich erreichbar, gehört das nachgeliefert.
- **Die 36 `style="…"`-Attribute in `public/app.js`.** Solange sie stehen,
  braucht die Sicherheitsregel `'unsafe-inline'` bei `style-src`. Ein eigener
  Auftrag, keine Nebensache.
- **Der Betriebsstand im Projektstand.** Dort steht noch, die Einspielung von
  0.8.10 sei nicht bestätigt; sie ist es inzwischen, mit Fingerprint `48fe44e7`.
  Gehört bei der Dokumentenpflege korrigiert.

---

## 8. Für die Dokumente

- **Projektstand Abschnitt 2:** 0.8.20 gebaut, 1548 Prüfungen, Fingerprint
  `3ab38137`. 0.8.10 ist eingespielt und läuft, Fingerprint `48fe44e7` bestätigt.
- **Projektstand Abschnitt 5a:** die Regel gilt ab jetzt auch am Fotoweg; der
  Kopf von `anhaenge.js` trägt einen neunten Punkt (Typ aus den ersten Bytes).
- **Projektstand Abschnitt 6:** Stolpersteine 96 bis 100.
- **Projektstand Abschnitt 10:** 0.8.20 erledigt, als Nächstes Stufe G4 auf
  0.8.30.
- **Projektstand Abschnitt 11:** die beiden Merkposten „Ein Kopf vom
  Aufrufer …" und „Der ausgelieferte Typ kommt nie aus der Datenbank" sind
  eingelöst. Was von ihnen als **Regel** weitergilt, gehört nach Abschnitt 5;
  der Wächter über den Quelltext bindet unverändert für 0.8.50.
- **README:** `HINTER_PROXY` beim Reverse-Proxy-Hinweis.
