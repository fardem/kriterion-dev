# Änderungsprotokoll 0.42.0 — „Dokumente über einen Document Server ansehen"

**Gebaut am 25. September 2026 auf 0.41.1 nach `Doku/Auftrag_0.42.0.md`.
Fingerprint `48829449`, davor `dcbfdfb6`.**

Eine Instanz mit Euro-Office oder OnlyOffice zeigt zehn Bürodateiformate im
Eintrag an. Ohne die neuen Variablen in der `.env` verhält sich die Instanz wie
0.41.1. Schema: nein. Austauschformat: 19 bleibt.

---

## 1. Die Bilanz

Gemessen am fertigen Stand gegen 0.41.1.

| | 0.41.1 | 0.42.0 |
|---|---:|---:|
| Ausgelieferte JavaScript-Module | 14 | **15** |
| Schlüssel je Sprachdatei | 1.186 | **1.203** |
| Schreibende Routen (`F_ROUTES`) | 75 | **76** |
| Lesende Routen | 31 | **35** |
| Davon offen vor der Anmeldung | 3 | **5** |
| Karten in den Einstellungen | 23 | **24** |
| Regelzeilen des Stilblatts | 1.680 | **1.683** |
| Kommentarzeilen, alle Dateien | 6.410 in 37 | **6.449 in 39** |
| Rückbauten | 1.141 | **1.148** |
| Prüfungen im Prüfstand | 7.362 | **7.410** |

---

## 2. Was gebaut ist

**`docserver.js`, neu.**

- Liest `DOCUMENT_SERVER_ADDRESS`, `DOCUMENT_SERVER_SECRET`,
  `DOCUMENT_SERVER_INTERNAL_ADDRESS` und `INTERNAL_ADDRESS` beim Start. Eine
  ungültige Adresse gilt als leer und steht als Warnung im Protokoll.
- Warnt beim Start bei einem Secret unter 32 Zeichen und bei `http://` hinter
  einem Reverse Proxy.
- JWT HS256 mit `crypto`, ohne neue Abhängigkeit. `verifyWith()` weist ab:
  kein Token, nicht drei Teile, `alg` nicht `HS256`, falsche Signatur, kein
  `exp`, `exp` älter als 60 Sekunden.
- `checkFetch()` prüft das JWT, das der Document Server im Header
  `Authorization` mitschickt, und vergleicht den Pfad der URL darin mit dem
  Pfad der Anfrage.
- `viewerConfig()` baut die Konfiguration des Betrachters: Modus `view`, ohne
  Bearbeiten, Kommentar, Review und Download, signiert über alle Felder.
- Der Schlüssel des Dokuments sind die ersten 40 Zeichen von HMAC-SHA256 über
  Abrufadresse, `created_at` und `size`.
- `check()` fragt `/healthcheck` (5 s) und lässt den Document Server über
  `/converter` (20 s) eine Probedatei bei Kriterion holen. Antwortet
  `/converter` mit 404, geht dieselbe Anfrage an `/ConvertService.ashx`.

**`server.js`.**

- Zwei offene Routen: `GET /api/document-server/attachments/:id` liefert die
  Datei an den Document Server, `GET /api/document-server/probe` die Probe.
- Drei geschützte: `GET /api/attachments/:id/office` (angemeldet),
  `GET /api/document-server` und `POST /api/document-server/check` (Admin).
- `CSP_APP` nimmt den Origin von `DOCUMENT_SERVER_ADDRESS` in `script-src` und
  `frame-src` auf. Ohne Adresse ist sie Zeichen für Zeichen die alte.
- `detail()` liefert `preview: 'office'` für die zehn Endungen, wenn
  Einrichtung und Schalter stimmen. `PUT /api/settings` kennt
  `documentServer`.

**Browser.**

- `buildPreview()` hat den Zweig `office`. `api.js` wird einmal je Seite
  geladen. Beim Neuzeichnen der Dateiliste wird jeder offene Betrachter mit
  `destroyEditor()` abgebaut.
- Schlägt das Laden fehl oder meldet der Betrachter `onError`, steht
  `entry.officeFailed` da; bei `.docx` darunter die Textvorschau.
- Die Karte „Dokumente" steht unter Installation hinter „Sprachen". Sie zeigt
  die drei Adressen samt Ersatz, den Schalter und das Ergebnis der Prüfung.
  Die Prüfung läuft beim Zeichnen einmal von selbst.

**Texte und Doku.** 17 Schlüssel je Sprache, `.env.example` mit vier
Abschnitten, README mit Abschnitt „Document Server" und dem Satz zum
Zwischenspeicher neben der Verschlüsselung, Handbuch mit Dateien und Karte.
`CLAUDE.md` nennt fünfzehn Module; `tools/publish.js` und der Handgriff der
README rechnen den Fingerprint über `docserver.js` mit.

---

## 3. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| Schlüsselnamen `server.docNoFetchAddress` und `server.docNoWayBack` | heißen `server.docFetchUnset` und `server.docCannotFetch` | `test/source.js` lässt höchstens drei Wörter je Schlüsselname zu |
| Der Ersatz einer leeren Adresse auf der Karte | neuer Schlüssel `card.documentsFallback`: „leer, es gilt {name}" | BA 4 verlangt die Anzeige, BA 5 hatte keinen Satz dafür |
| Die Namen der Variablen auf der Karte | kommen vom Server als `rows` mit Name, Wert und Ersatz | Die Restprobe in `test/ui_language.js` lässt keine neuen lesbaren Texte in `public/app.js` zu; die Namen stehen damit nur in `docserver.js` |
| Antwort von `GET /api/attachments/:id/office` | `{ script, host, config }` statt `{ address, host, config }` | Der Browser braucht die Adresse von `api.js`, nicht die des Servers |
| Ergebnis der Prüfung | `{ key, values }`, gebaut mit `message()` | Die Sprachproben lesen `message(` als Ruf und prüfen so Schlüssel und Platzhalter |
| Englisch `server.docError` | „returns error" statt „reports error" | „report" ist ein Vokabelwort und darf nicht fest im Satz stehen |
| Englisch `server.docOff` | 40 statt 52 Zeichen | Zusage 6: ein englischer Wert ist höchstens 1,15-mal so lang wie der deutsche |
| `.env.example` | vier Abschnitte mit eigener Trennlinie statt einer | Die Prüfung der Beispieldatei zählt Kommentarzeilen je Abschnitt |
| Portbasis der Zweitserver in `test/release_042.js` | 7340, wie `test/release_041.js` | Die Module laufen nacheinander; die Zahl der Portbasen bleibt 65, und die Spanne aller Basen bleibt unter dem Versatz je Nebenspur |
| Kommentargrenzen | angehoben mit `node tools/comments.js --write` | zwei neue Dateien und die Kommentare an Routen, Betrachter und Karte |

---

## 4. Der Prüfstand

`test/release_042.js`, 48 Prüfungen in sechs Gruppen. Ein gestellter Document
Server läuft im selben Prozess auf einem freien Port: `/healthcheck`,
`api.js` und `/converter`, der mit eigenem JWT bei Kriterion holt. Er lässt
sich umstellen auf: nicht erreichbar, anderes Secret, kein Rückweg, JWT ohne
`exp`, anderer Fehler.

| Gruppe | Prüfungen |
|---|---:|
| Document Server: JWT | 6 |
| Document Server: Abruf und Konfiguration | 17 |
| Document Server: die Pruefung der Karte | 9 |
| Document Server: unvollstaendige Einrichtung | 2 |
| Document Server: ohne die vier Variablen wie bisher | 3 |
| Document Server: der Betrachter im Browser | 11 |

Rückbauten 1222 bis 1228, dazu die an die neue Liste angepassten W14 und 1056:

| Nr | Rückbau | rot in |
|---|---|---|
| 1222 | `verify()` prüft `alg` nicht | alg none und HS512 werden abgewiesen |
| 1223 | Der Abruf vergleicht die URL im JWT nicht | Ohne JWT, mit fremder URL im JWT und mit anderem Secret: 403 |
| 1224 | Die Abrufroute liest den Schalter nicht | Ausgeschaltet: die Abrufroute 404, die Probe-Route weiter 200 |
| 1225 | Die CSP nimmt den Document Server nicht auf | CSP: mit Adresse steht der Origin in script-src und frame-src |
| 1226 | `detail()` liefert office auch für PDF, Bild und Text | PDF, Bild und Text behalten ihre Art |
| 1227 | Die Prüfung unterscheidet -4 nicht nach der Probe-Route | JWT ohne exp: server.docTokenRejected mit dem Grund |
| 1228 | `destroyEditor()` wird beim Neuzeichnen nicht gerufen | Beim Neuzeichnen wird destroyEditor() gerufen |
| W14 | Die Dateiliste des Sprachwächters verliert die neuen Dateien | Der Sprachwaechter sieht alle fuenfzehn Quelltextdateien an |
| 1056 | Der Sprachwächter verliert `mail.js` wieder | Der Sprachwaechter sieht alle fuenfzehn Quelltextdateien an |

**9 rot, 0 stumm.** 1228 brach im ersten Lauf das Modul ab, weil der Test auf
das Abbauen wartete; er wartet jetzt auf das Schließen der Vorschau und prüft
danach. Der zweite Lauf von 1228 ist rot in der genannten Prüfung.

---

## 5. Nicht geprüft

Die Bauumgebung erreicht `office.dmrts.de` nicht. Alle Prüfungen laufen gegen
den gestellten Document Server. Die Abnahme im Betrieb steht in Abschnitt 5
des Auftrags.
