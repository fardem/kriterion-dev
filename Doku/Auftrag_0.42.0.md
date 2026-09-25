# Auftrag 0.42.0 — „Dokumente über einen Document Server ansehen"

**Erteilt am 25. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Dieser Auftrag beantwortet jede Frage, die beim Bauen
aufkommen kann. Es wird nicht nachgefragt.

Grundlage ist der Eintrag 0.42.0 in `Doku/Fahrplan.md`. Dieser Auftrag
entscheidet, was dort offen ist, und ersetzt drei Punkte davon (Abschnitt 3).

---

## 1. Das Ziel

- Eine Instanz mit Document Server zeigt Word-, Excel- und
  PowerPoint-Dateien und ihre OpenDocument-Gegenstücke im Eintrag an, mit
  Formatierung, Bildern und Tabellen.
- Getestet wird gegen Euro-Office. OnlyOffice hat dieselbe Schnittstelle und
  geht ebenso.
- Ohne Document Server ändert sich nichts.
- Die Karte „Dokumente" sagt, woran es liegt, wenn die Anzeige nicht geht.
- Die README sagt, dass eine angesehene Datei im Zwischenspeicher des
  Document Servers unverschlüsselt liegt.

---

## 2. Der Anlass

| Anlass | Stand am 25. September 2026 |
|---|---|
| Vorschau heute | `previewKind()` (`attachments.js`:58) kennt `image`, `pdf`, `text`, `docx` und `keine`. `.docx` zeigt nur den Text aus `word/document.xml` (`docxPreview()`, `attachments.js`:220). `.xlsx`, `.pptx`, `.odt`, `.ods` und alles Übrige werden heruntergeladen |
| Betrieb | Der Betreiber betreibt Euro-Office unter `https://office.dmrts.de`, im selben Docker-Netz wie Kriterion, intern unter `http://euro-office:80` |
| Euro-Office | Fork von OnlyOffice, mit dessen Schnittstelle. Image `ghcr.io/euro-office/documentserver`. `JWT_ENABLED` ist `true`, `JWT_HEADER` ist `Authorization`, `ALLOW_PRIVATE_IP_ADDRESS` ist `false` |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 21. September 2026 | Ansehen in 0.42.0, Bearbeiten in 0.43.0 |
| 25. September 2026 | Document Server ist Euro-Office |
| 25. September 2026 | OpenDocument-Dateien gehören dazu |
| 25. September 2026 | Der Abruf wird über das JWT im Header geprüft. Das Secret ist Pflicht |
| 25. September 2026 | Feste Liste der Formate, mit den alten Formaten. Keine Auswahl in der Oberfläche |
| 25. September 2026 | Die Karte prüft auch, ob der Document Server Kriterion erreicht |

### Abweichungen vom Fahrplan

| Fahrplan | dieser Auftrag | Grund |
|---|---|---|
| Einmaliges Token in der Adresse, Tabelle `tokens` | JWT im Header `Authorization`, geprüft mit dem Secret | Der Document Server schickt es bei jedem Abruf mit. Es enthält die URL der Datei und läuft nach 5 Minuten ab. Ein einmaliges Token bräche, wenn der Document Server die Datei zweimal holt |
| Das Ansehen geht auch ohne Secret | Ohne Secret bleibt die Anzeige aus | Ohne Secret kann jeder den öffentlichen Document Server für eigene Dateien nutzen, und die Route für den Abruf wäre offen |
| Fünf Zustände der Karte | Drei Zustände der Einrichtung, der Schalter, sechs Ergebnisse der Prüfung (BA 1, BA 4) | Die Prüfung, ob der Document Server Kriterion erreicht, fehlte. Daran scheitern solche Einbindungen am häufigsten |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.42.0**, MINOR, Schema: nein, Format: 19 bleibt |
| Welche Formate? | `docx`, `doc`, `odt`, `rtf` (Text), `xlsx`, `xls`, `ods` (Tabelle), `pptx`, `ppt`, `odp` (Präsentation) |
| Und PDF, Bilder, Text? | Zeigt Kriterion weiter selbst. Jede Datei, die an den Document Server geht, liegt dort unverschlüsselt |
| Wo stehen Adressen und Secret? | In der `.env`, vier Variablen (BA 6). Kein Feld in der Oberfläche |
| Der Schalter | `settings.documentServer`, `true` oder `false`, Vorgabe `false`. Schreiben darf der Admin. Nicht in `OWNER_KEYS` |
| Wann ist die Anzeige an? | Adresse, Secret und Rückweg-Adresse sind gültig, und der Schalter ist an. Nur dann liefert `detail()` die Art `office` |
| Die Karte | „Dokumente", Schlüssel `documents`, Abschnitt Installation, hinter „Sprachen". Admins sehen und schalten sie |
| Je Benutzer | Kein Schalter |
| Bestätigungsdialog | Keiner. Unter dem Betrachter steht ständig, welcher Document Server die Datei anzeigt |
| Wer darf ansehen? | Wer angemeldet ist, wie bei `/api/attachments/:id/raw` |
| JWT | HS256, gebaut mit `crypto` in `docserver.js`. Keine neue Abhängigkeit |
| Schlüssel des Dokuments | Die ersten 40 Zeichen von HMAC-SHA256 mit dem Secret über `<Abrufadresse>\|<created_at>\|<size>`. Zwei Instanzen am selben Document Server bekommen so nie denselben Schlüssel; der Document Server hält seinen Zwischenspeicher nach diesem Schlüssel |
| Betrachter | Modus `view`, Sprache des Benutzers. `type` ist `mobile`, wenn `isNarrow()` gilt, sonst `desktop` |
| Download im Betrachter | Aus. Der Download bleibt der Knopf ↓ an der Zeile, wie heute |
| Wenn der Document Server nicht antwortet | Eine Zeile mit dem Grund. Bei `.docx` darunter die Textvorschau von heute |
| Neues Modul | `docserver.js`. `server.js` hat 5.855 Zeilen; JWT und Prüfung lassen sich so ohne Server testen |
| Lizenz | Kriterion liefert keinen Code von Euro-Office aus. `api.js` kommt zur Laufzeit vom Document Server. Die Lizenzen der Abhängigkeiten ändern sich nicht |
| Ändert sich eine bestehende Route? | `/api/attachments/:id/raw` und `/api/attachments/:id/preview` nicht. `detail()` liefert für die zehn Endungen `preview: 'office'`, wenn die Anzeige an ist. `PUT /api/settings` kennt `documentServer`. Neu sind fünf Routen (BA 2) |

---

## 4. Die Bauabschnitte

### BA 1 — `docserver.js`

**Die Einstellungen**, beim Start gelesen mit `auth.fromEnv()` und geprüft
mit `auth.checkPublicAddress()`:

| Variable | wofür | leer |
|---|---|---|
| `DOCUMENT_SERVER_ADDRESS` | Adresse, unter der der Browser den Document Server erreicht | keine Anzeige |
| `DOCUMENT_SERVER_SECRET` | derselbe Wert wie `JWT_SECRET` am Document Server | keine Anzeige |
| `DOCUMENT_SERVER_INTERNAL_ADDRESS` | Adresse, unter der Kriterion den Document Server erreicht | `DOCUMENT_SERVER_ADDRESS` |
| `INTERNAL_ADDRESS` | Adresse, unter der der Document Server Kriterion erreicht | `PUBLIC_ADDRESS`; sind beide leer, bleibt die Anzeige aus |

- Eine ungültige Adresse steht als Warnung im Protokoll und gilt als leer,
  wie bei `PUBLIC_ADDRESS` (`server.js`:5825).
- Warnung beim Start, wenn das Secret kürzer als 32 Zeichen ist. Euro-Office
  verlangt 32 für HS256.
- Warnung beim Start, wenn `BEHIND_PROXY` gesetzt ist und
  `DOCUMENT_SERVER_ADDRESS` mit `http://` beginnt. Der Browser lädt dann kein
  Skript von dort.
- Die Warnungen sind englisch, wie die übrigen im Protokoll.

**Die Formate**, als `OFFICE_TYPES`:

```js
{ docx: 'word', doc: 'word', odt: 'word', rtf: 'word',
  xlsx: 'cell', xls: 'cell', ods: 'cell',
  pptx: 'slide', ppt: 'slide', odp: 'slide' }
```

**JWT:**

- `sign(payload)`: Kopf `{ alg: 'HS256', typ: 'JWT' }`, base64url, HMAC-SHA256
  mit dem Secret.
- `verify(token)`: gibt `{ ok: true, payload }` oder `{ ok: false, reason }`.
  Abgewiesen wird: kein Token, nicht drei Teile, `alg` nicht `HS256`, falsche
  Signatur (Vergleich mit `crypto.timingSafeEqual`), kein `exp`, `exp` älter
  als 60 Sekunden.
- `reason` ist einer von `missing`, `form`, `alg`, `signature`, `noExp`,
  `expired`.
- Das Token wird nie ins Protokoll geschrieben.

**Der Abruf durch den Document Server:**

- Er schickt `Authorization: Bearer <JWT>`. Die URL steht in `payload.url`;
  steht sie dort nicht, gilt `url` auf oberster Ebene.
- `checkFetch(req)`: `verify()`, dann muss `new URL(url).pathname` gleich
  `req.path` sein. Sonst `reason: 'url'`.

**Die Konfiguration des Betrachters**, `viewerConfig(attachment, { lang, mobile })`:

```js
{
  document: {
    fileType, key, title: filename,
    url: `${fetchBase}/api/document-server/attachments/${id}`,
    permissions: { edit: false, comment: false, review: false, download: false, print: true }
  },
  documentType,                       // aus OFFICE_TYPES
  editorConfig: { mode: 'view', lang },
  type: mobile ? 'mobile' : 'desktop',
  width: '100%', height: '100%',
  token                               // sign() über alle Felder davor
}
```

`fetchBase` ist `INTERNAL_ADDRESS` oder ersatzweise `PUBLIC_ADDRESS`.

**Die Prüfung**, `check()`, asynchron, nur wenn die Einrichtung vollständig ist:

1. `GET <intern>/healthcheck`, Grenze 5 s. Erwartet wird der Text `true`.
   Sonst `server.docUnreachable` mit der versuchten Adresse.
2. `POST <intern>/converter`, Grenze 20 s, `Accept: application/json`.
   Antwortet `/converter` mit 404, geht dieselbe Anfrage an
   `/ConvertService.ashx`. Der Körper:
   `{ async: false, filetype: 'txt', outputtype: 'docx', key: 'probe-<16 Zufallsbytes hex>', title: 'probe.txt', url: '<fetchBase>/api/document-server/probe', token }`.
   `token` ist `sign()` über dieselben Felder.
3. Auswertung:

| Antwort | Ergebnis |
|---|---|
| `endConvert: true` | `server.docReady` |
| `error: -8` | `server.docSecretRejected` |
| `error: -4`, und die Probe-Route wurde in dieser Prüfung gerufen und hat das Token abgewiesen | `server.docTokenRejected` mit `reason` |
| `error: -4`, und die Probe-Route wurde nicht gerufen | `server.docNoWayBack` mit `fetchBase` |
| anderer Fehler | `server.docError` mit dem Code |

Ob die Probe-Route gerufen wurde, hält `docserver.js` im Arbeitsspeicher:
Zeitpunkt, `ok`, `reason` des letzten Rufs. `check()` setzt den Wert vor
Schritt 2 zurück.

### BA 2 — Routen und CSP in `server.js`

**Öffentlich**, vor `app.use('/api', auth.requireAuth)` (`server.js`:796):

| Route | tut |
|---|---|
| `GET /api/document-server/attachments/:id` | `checkFetch()`, sonst 403 ohne Inhalt. 404, wenn die Anzeige aus ist, die Datei fehlt oder die Endung nicht in `OFFICE_TYPES` steht. Liefert die Bytes mit `attachments.setHeader()` und `Cache-Control: no-store` |
| `GET /api/document-server/probe` | `checkFetch()`, sonst 403. Liefert `Kriterion` als `text/plain`. Geht auch bei ausgeschaltetem Schalter, damit der Admin vor dem Einschalten prüfen kann. 404, wenn die Einrichtung unvollständig ist |

**Nach der Anmeldung:**

| Route | Recht | tut |
|---|---|---|
| `GET /api/attachments/:id/office?mobile=1` | angemeldet | `{ address, host, config }`. 404 ohne Datei, 409 mit `server.docOff`, wenn die Anzeige aus ist oder die Endung nicht passt |
| `GET /api/document-server` | Admin | `{ address, internalAddress, fetchAddress, secret: true/false, on, setup }`. `setup` ist `null` oder einer von `server.docNoAddress`, `server.docNoSecret`, `server.docNoFetchAddress`. Das Secret selbst geht nie hinaus |
| `POST /api/document-server/check` | Admin | ruft `check()`, antwortet `{ result, values }` |

- **CSP:** `CSP_APP` (`server.js`:311) wird beim Start gebaut. Ist
  `DOCUMENT_SERVER_ADDRESS` gültig, steht sein Origin in `script-src` und
  `frame-src`. `frame-ancestors 'none'` bleibt.
- **`PUT /api/settings`** schreibt `documentServer` als Boolean, neben
  `tagsFreeCreate` (`server.js`:1772).
- **`detail()`** (`server.js`:2472, `preview:` in Zeile 2497): `preview` ist
  `office`, wenn die Anzeige an ist und die Endung in `OFFICE_TYPES` steht,
  sonst `previewKind()` wie heute. Der Schalter wird einmal je Aufruf gelesen, nicht je Datei.
- `test/frame.js`: `F_ROUTES` bekommt `POST /api/document-server/check`,
  `F_READ_ROUTES` die beiden offenen Routen, je mit dem Grund, warum sie
  offen sind.

### BA 3 — Der Betrachter im Browser

- `buildPreview()` (`public/app.js`:5975) bekommt den Zweig `office`: ein
  Behälter `.aoffice` mit einem leeren `div` für den Betrachter, darunter
  `entry.officeHint` mit dem Rechnernamen des Document Servers.
- `api.js` wird einmal je Seite geladen:
  `<DOCUMENT_SERVER_ADDRESS>/web-apps/apps/api/documents/api.js`. Schlägt das
  Laden fehl, wird beim nächsten Öffnen neu geladen.
- Dann `new DocsAPI.DocEditor(<id des div>, { ...config, events: { onError } })`.
- `drawAtts()` zeichnet die ganze Liste neu. Vorher ruft es
  `destroyEditor()` an jedem offenen Betrachter; eine `Map` hält sie nach der
  Nummer der Datei.
- Fehler beim Laden oder `onError`: `entry.officeFailed` statt des
  Betrachters. Bei `.docx` darunter die Textvorschau über
  `/api/attachments/:id/preview`, wie heute.
- `.aoffice` in `public/style.css`: Höhe `min(720px, 75dvh)`, Rand und Ecken
  wie `.apreview iframe`.

### BA 4 — Die Karte „Dokumente"

- In `SYS_CARDS` hinter `languages`:
  `{ key: 'documents', section: 'installation', visible: () => ADMIN, ... }`.
  `renderSystem()` holt `GET /api/document-server` nur für Admins.
- Inhalt, von oben:
  1. `card.documentsHint`.
  2. Die drei Adressen, jede mit ihrem Variablennamen. Ein leerer Wert zeigt,
     welcher Ersatz gilt.
  3. Ist `setup` gesetzt: dieser Satz, und sonst nichts weiter.
  4. Der Schalter `card.documentsOn`.
  5. Das Ergebnis der Prüfung und der Knopf `card.documentsCheck`.
- Die Prüfung läuft beim Zeichnen der Karte einmal von selbst, wenn die
  Einrichtung vollständig ist, und auf Knopfdruck. Die Seite wartet nicht
  darauf. Bis zur Antwort steht `list.loading`.
- Der Schalter lässt sich auch bei einem Fehler der Prüfung setzen.

### BA 5 — Die Texte

Deutsch im Wortlaut. Englisch und Türkisch sinngleich. `{host}` und
`{address}` kommen vom Server.

| Schlüssel | Wortlaut |
|---|---|
| `card.documents` | Dokumente |
| `card.documentsHint` | Word-, Excel- und PowerPoint-Dateien und OpenDocument-Dateien über einen Document Server anzeigen, etwa Euro-Office oder OnlyOffice. Jede angesehene Datei liegt danach unverschlüsselt im Zwischenspeicher des Document Servers. |
| `card.documentsOn` | Dateien über den Document Server anzeigen |
| `card.documentsCheck` | Verbindung prüfen |
| `server.docNoAddress` | In der .env fehlt DOCUMENT_SERVER_ADDRESS. |
| `server.docNoSecret` | In der .env fehlt DOCUMENT_SERVER_SECRET. Es muss denselben Wert haben wie JWT_SECRET am Document Server. |
| `server.docNoFetchAddress` | In der .env fehlen INTERNAL_ADDRESS und PUBLIC_ADDRESS. Der Document Server weiß nicht, wo er die Dateien holt. |
| `server.docOff` | Die Anzeige über den Document Server ist aus. |
| `server.docReady` | Verbunden. Der Document Server holt Dateien unter {address}. |
| `server.docUnreachable` | Der Document Server antwortet nicht unter {address}. |
| `server.docSecretRejected` | Der Document Server weist das Secret ab. DOCUMENT_SERVER_SECRET und JWT_SECRET müssen gleich sein. |
| `server.docNoWayBack` | Der Document Server erreicht Kriterion nicht unter {address}. Liegen beide im selben Docker-Netz, braucht der Document Server ALLOW_PRIVATE_IP_ADDRESS=true. |
| `server.docTokenRejected` | Kriterion weist das Token des Document Servers ab ({reason}). |
| `server.docError` | Der Document Server meldet den Fehler {code}. |
| `entry.officeHint` | Angezeigt vom Document Server {host}. |
| `entry.officeFailed` | Der Document Server kann die Datei nicht anzeigen. |

### BA 6 — `.env.example`

Hinter `PUBLIC_ADDRESS`, im Stil der Datei (ASCII, höchstens vier Zeilen je
Einstellung):

```
# ---------------------------------------------------------------------------
# DOCUMENT_SERVER_ADDRESS -- Euro-Office oder OnlyOffice, wie der Browser es
# erreicht. Zeigt Word-, Excel- und PowerPoint-Dateien im Eintrag an.
# Leer: keine Anzeige. Einschalten in der Karte "Dokumente".
# DOCUMENT_SERVER_ADDRESS=https://office.beispiel.de

# DOCUMENT_SERVER_SECRET -- derselbe Wert wie JWT_SECRET am Document Server.
# Leer: keine Anzeige.
# DOCUMENT_SERVER_SECRET=

# DOCUMENT_SERVER_INTERNAL_ADDRESS -- der Document Server im Docker-Netz.
# Leer: DOCUMENT_SERVER_ADDRESS.
# DOCUMENT_SERVER_INTERNAL_ADDRESS=http://euro-office:80

# INTERNAL_ADDRESS -- Kriterion, wie der Document Server es erreicht.
# Leer: PUBLIC_ADDRESS. Im selben Docker-Netz Dienstname und Port 3000.
# INTERNAL_ADDRESS=http://kriterion:3000
```

`docker-compose.example.yml` bleibt unverändert.

### BA 7 — README und Handbuch

**`README.md`:**

- Zeile 15 bis 16, hinter „Fotos und Videos liegen darin.": „Mit einem
  Document Server liegt jede dort angesehene Datei zusätzlich unverschlüsselt
  in dessen Zwischenspeicher." Mit Verweis auf den neuen Abschnitt.
- „Konfiguration": vier Zeilen für die vier Variablen.
- Neuer Abschnitt „Document Server" hinter „Hinter einem Reverse Proxy":
  - was er tut und welche zehn Formate
  - am Document Server: `JWT_SECRET` mit mindestens 32 Zeichen, derselbe
    Wert in `DOCUMENT_SERVER_SECRET`; `JWT_HEADER` bleibt `Authorization`;
    im selben Docker-Netz `ALLOW_PRIVATE_IP_ADDRESS=true`
  - zwei Compose-Dateien brauchen ein gemeinsames Netz
  - die Karte „Dokumente" prüft die Verbindung
  - der Satz zum Zwischenspeicher, und dass er gilt, bis der Document Server
    ihn leert
  - Einrichtung von Euro-Office selbst: Link auf dessen Dokumentation, keine
    Kopie davon

**`manual-de.md`:**

- „Tags, Dateien, Links" (Zeile 343): welche Dateien mit Document Server
  angezeigt werden, und dass der Betrachter den Document Server nennt.
- „Einstellungen": Installation mit „Titel, Sprachen, Dokumente"; eine Zeile
  „Dokumente" in der Tabelle der Karten.

### BA 8 — Der Prüfstand

Neues Modul `test/release_042.js`, in `MODULE` in `testbench.js` hinter
`release_041`. Es startet mit `startFurtherServer()` eine Instanz mit den vier
Variablen und einen gestellten Document Server als `http`-Server im selben
Prozess. Der gestellte Document Server:

- liefert `/healthcheck` und ein `api.js`, das `DocsAPI.DocEditor` festhält
- prüft bei `/converter` das Token im Körper mit dem Secret, holt die URL mit
  eigenem JWT im Header und antwortet wie Euro-Office
- lässt sich umstellen: nicht erreichbar, anderes Secret, falsche
  Rückweg-Adresse, JWT ohne `exp`

| | was gehalten wird |
|---|---|
| 1 | `sign()` und `verify()` passen zueinander. `verify()` weist ab: `alg: none`, `HS512`, falsche Signatur, fehlendes `exp`, abgelaufenes `exp` |
| 2 | Die Abrufroute liefert mit gültigem JWT die Bytes, byte-gleich. Ohne JWT, mit fremder URL im JWT oder mit anderem Secret 403 |
| 3 | Bei ausgeschaltetem Schalter liefert die Abrufroute 404, die Probe-Route weiter |
| 4 | `detail()` liefert `office` für alle zehn Endungen nur bei vollständiger Einrichtung und eingeschaltetem Schalter. PDF, Bild und Text behalten ihre Art |
| 5 | Die Konfiguration: Modus `view`, `edit: false`, `download: false`, `documentType` nach Endung, `mobile` nach Parameter. Das Token prüft mit dem Secret |
| 6 | Der Schlüssel des Dokuments hängt an Abrufadresse, `created_at` und `size` und ist höchstens 128 Zeichen lang |
| 7 | CSP: mit Adresse steht der Origin in `script-src` und `frame-src`, ohne Adresse ist sie wie heute |
| 8 | Die Karte meldet jeden der drei Zustände der Einrichtung und jedes der sechs Ergebnisse der Prüfung |
| 9 | Nur Admins sehen die Karte und rufen die Prüfung. Das Secret steht in keiner Antwort |
| 10 | Im Browser: der Zweig `office` lädt `api.js` von der Adresse und ruft `DocEditor` mit der Konfiguration. Beim Neuzeichnen wird `destroyEditor()` gerufen |
| 11 | Schlägt `api.js` fehl, steht `entry.officeFailed` da; bei `.docx` zusätzlich die Textvorschau |
| 12 | Ohne die vier Variablen verhält sich die Instanz wie 0.41.1: keine neue Art, keine Karte mit Schalter, dieselbe CSP |

**Gegenproben**, je eine: `verify()` prüft `alg` nicht · der Vergleich der URL
fällt weg · der Schalter wird in der Abrufroute nicht gelesen · die CSP nimmt
den Origin nicht auf · `detail()` liefert `office` auch für PDF · die Prüfung
unterscheidet `-4` nicht nach der Probe-Route · `destroyEditor()` wird nicht
gerufen.

**Listen, die mitgehen:** `docserver.js` kommt in die Listen der
Quelltextdateien in `test/source.js` (`LANGUAGE_SOURCES`, `SHIPPED`) und
`test/selfcheck.js` (Grenzwerte der Kommentare, Messung der Funktionen). Die
festen Zahlen dort steigen von 14 auf 15. `CLAUDE.md`, Abschnitt 3: „die
fünfzehn JavaScript-Module".

### BA 9 — Dokumentation und Zahlen

- **`Doku/Aenderungsprotokoll_0.42.0.md`** mit den Zahlen am fertigen Stand.
- **`CHANGELOG.md`** — `## [0.42.0]` mit einem Kasten: ohne die neuen
  Variablen ändert sich nichts; mit Document Server liegt jede angesehene
  Datei unverschlüsselt in dessen Zwischenspeicher; im selben Docker-Netz
  braucht der Document Server `ALLOW_PRIVATE_IP_ADDRESS=true`.
- **`Doku/Fahrplan.md`** — die Zeile 0.42.0 durchstreichen und füllen; der
  Abschnitt bekommt oben „GEBAUT am …".
- **`package.json`** auf `0.42.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand: Prüfungen, Rückbauten,
  Kommentarzeilen je Datei und Summe, Schlüssel der Sprachdateien,
  Regelzeilen des Stilblatts, Routen in `F_ROUTES`.
- **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum,
  dann in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Die Bauumgebung erreicht `office.dmrts.de` nicht. Der Prüfstand arbeitet mit
dem gestellten Document Server. Der Betreiber prüft nach dem Einspielen:

1. Am Euro-Office-Container: `JWT_SECRET` mit mindestens 32 Zeichen,
   `ALLOW_PRIVATE_IP_ADDRESS=true`.
2. In der `.env` von Kriterion die vier Variablen, Neustart.
3. Karte „Dokumente": „Verbunden." Sonst nennt die Karte den Grund.
4. Schalter an. Je eine Datei `.docx`, `.xlsx`, `.pptx`, `.odt`, `.ods`,
   `.odp` öffnen, auf dem Rechner und auf dem Telefon.

Weicht Euro-Office in einer Antwort von OnlyOffice ab, geht der Befund in eine
PATCH-Runde.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Bearbeiten | 0.43.0 |
| Eine Auswahl der Formate | Vorgabe des Betreibers. Beim Ansehen geht nichts verloren. Die Frage kommt mit 0.43.0 zurück: beim Speichern von ODF und RTF kann Formatierung verloren gehen |
| PDF, Bilder und Text über den Document Server | Kriterion zeigt sie selbst. Jede Datei dort liegt unverschlüsselt im Zwischenspeicher |
| Ein anderer Header als `Authorization` | Die Vorgabe von Euro-Office und OnlyOffice. Eine eigene Variable dafür hat niemand verlangt |
| WOPI | Euro-Office kennt es, braucht es aber nicht. Die Schnittstelle von OnlyOffice reicht fürs Ansehen und Bearbeiten |
| Der Betrachter in einem eigenen Tab | Er steht wie das PDF im Eintrag |
| Ein Dienst für Euro-Office in `docker-compose.example.yml` | Die Einrichtung von Euro-Office steht in dessen Dokumentation |
| Die Tabelle `tokens` | Wird nicht gebraucht (Abschnitt 3) |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Ohne die vier Variablen verhält sich die Instanz wie 0.41.1. Das hält
   Prüfung 12 aus BA 8 fest.
3. Das Secret steht in keiner Antwort, in keinem Protokoll und in keinem
   Export.
4. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
5. Kein Pull Request, wenn keiner verlangt wurde.
6. Kommt eine Frage auf, die hier nicht beantwortet ist, wird der einfachere
   Weg gewählt, der kein Verhalten ändert. Die Entscheidung steht im
   Änderungsprotokoll.
