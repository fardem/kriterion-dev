# Kriterion — Entwicklung

Aufbau, Datenmodell, Sicherheit der Auslieferung und Prüfstand. Betrieb steht in
`README.md`, Bedienung in `manual-de.md`.

## Aufbau des Ordners

| Datei | Inhalt |
|---|---|
| `server.js` | Routen und Auslieferung |
| `auth.js` | Anmeldung, Sitzungen, Token, Sicherheitsprotokoll |
| `db.js` | Schema und Verbindung zur verschlüsselten Datei |
| `keys.js` | Schlüssel lesen, erzeugen, prüfen |
| `attachments.js` | Anhänge: Auslieferung und Vorschau |
| `images.js` | Bildableitungen: Kachel und mittlere Variante |
| `batchrun.js` | Bestandsläufe in einem eigenen Thread |
| `mail.js` | Versand über SMTP |
| `twofactor.js` | zweiter Faktor, TOTP nach RFC 6238 |
| `log.js` | Containerprotokoll: Zeitstempel und Name |
| `usertool.js` | Zugangsverwaltung auf dem Server |
| `keytool.js`, `keytool.sh` | Schlüsselwechsel bei angehaltener Instanz |
| `public/` | `index.html`, `app.js`, `style.css`, `theme.js`, drei Sprachdateien |
| `test/`, `testbench.js`, `counterproof.js` | Prüfstand und Gegenproben |

Das Frontend kommt ohne Framework und ohne Build aus. Fünf
Laufzeitabhängigkeiten, festgelegt über `package-lock.json`.

## Datenmodell

Die Datei heißt `katalog.sqlite`. Der Name bleibt auch nach einer Umbenennung
des Projekts: ein anderer Name ließe den Start eine leere Neuinstallation
annehmen.

- `items`: Titel, Beschreibung, Getestet- und Abgelehnt-Merkmal, Kategorie. Zur
  Ablehnung gehören `rejected_at`, `rejected_reason` und `rejected_by`; alle
  drei dürfen leer sein. `items.favorite` wird nicht beschrieben.
- `item_pins`: Favoriten je Benutzer und Eintrag, nur für markierte Einträge.
- `photos`: Original, Kachel, mittlere Variante, Reihenfolge. `focus_x`,
  `focus_y` und `zoom` steuern den quadratischen Ausschnitt der Vorschau; das
  Original wird nicht geschnitten. Videos stehen in derselben Tabelle.
- `links`: Adressen mit Reihenfolge und Verfasser.
- `test_days`, `test_day_tags`: ein Testtag je Eintrag, Tag und Benutzer, mit
  Gesamtnote und eigenen Tags.
- `rating_criteria`, `ratings`: gemeinsame Kriterien mit Reihenfolge, Gewicht
  (`weight`, 0,2 bis 2, Vorgabe 1) und `phase` (`before` für Potenzial, `after`
  für Bewertung). Ein Name ist über beide Phasen eindeutig. `ratings.set_at`
  hält die letzte Setzung für die Glocke und hat keinen Vorgabewert;
  eingespielte Bewertungen stehen ohne Zeitpunkt da.
- `product_categories`, `tags`, `item_tags`.
- `comments`: Art (`kind`), Anpinnung (`pinned`), Bearbeitungszeitpunkt und
  `images_removed`, die Zahl der Bilder und Videos, die ein anderer als der
  Verfasser entfernt hat.
- `comment_images`, `comment_videos`: Bilder und Videos in Kommentaren, Videos
  mit Standbild und Dauer.
- `attachments`: angehängte Dateien mit Bytes und Verfasser.
- `settings`: globale Einstellungen, darunter Titel, Vokabular, Suchmaschinen
  und das Verfahren der Bildablage (`imageStore`).
- `user_settings`: zehn persönliche Schlüssel je Benutzer, darunter Filter,
  Ansichten, Bezugspunkt der Glocke, Farbschema, Schriftgröße, Blockanordnung.
- `users`: scrypt-Hash, Rolle (`user` < `admin` < `owner`), Adresse, Status,
  letzte Anmeldung. Gelöschte Benutzer bleiben als Zeile mit
  `status = deleted` und dem Namen `deleted-<id>`.
- `sessions`: aktive Anmeldungen. Die Karte „Meine Sitzungen" adressiert sie
  über eine abgeleitete Kennung, nie über den Sitzungsschlüssel.
- `login_attempts`: Zähler der Anmeldebremse je Adresse und je Name. Liegt in
  der Datenbank, damit ein Neustart eine Sperre nicht aufhebt. Zeilen ohne
  neuen Versuch werden nach einer Stunde gelöscht.
- `tokens`: Einladungs- und Rücksetzlinks, gespeichert als SHA-256. Sieben Tage
  gültig, einmal einlösbar; abgelaufene Zeilen werden nach dreißig Tagen
  gelöscht.
- `requests`: Anfragen der Registrierung. Unbestätigte verfallen nach 24
  Stunden. Höchstens zwanzig offene, je Adresse eine.
- `two_factor`, `two_factor_codes`: TOTP-Geheimnis im Klartext (es wird
  nachgerechnet, nicht verglichen) und acht Wiederherstellungscodes als
  SHA-256. Verbrauchte Codes bleiben als Zeile stehen. Hier läuft keine Frist.
- `security_log`: Zeitpunkt, Vorgang, Handelnder, Ziel und ein Merkmal aus
  einer festen Liste. Kein Freitext, keine Adresse. Leeres `actor` heißt
  „über `usertool.js`", außer bei einer gescheiterten Anmeldung. 180 Tage.
- `trash`, `trash_bytes`: Papierkorb. Je gelöschtem Eintrag eine Zeile mit dem
  Paket im Austauschformat, die Bytes je Datei in der zweiten Tabelle. Keine
  andere Abfrage liest diese Tabellen.

Verfasser tragen sechs Tabellen: `items`, `comments`, `test_days`, `ratings`,
`links`, `attachments`, jeweils in `user_id`. `trash.deleted_by`,
`security_log.actor` und `security_log.target` halten einen Vorgang fest, kein
Recht. `ON DELETE SET NULL` greift nur bei einem `DELETE` von Hand; Bestand
ohne Verfasser fällt beim Start an den Eigentümer.

## Sicherheit der Auslieferung

Keine hochgeladene Datei darf im Browser als Webseite laufen. Änderungen an
`attachments.js` müssen diese Punkte halten:

1. Der vom Browser gemeldete Typ wird gespeichert und angezeigt, aber nie
   ausgeliefert. Der ausgelieferte Typ kommt aus einer eigenen Liste nach
   Dateiendung.
2. Unbekanntes geht als `application/octet-stream` hinaus. Die Liste enthält
   kein HTML, XHTML, XML und SVG.
3. `Content-Disposition: attachment` ist die Vorgabe. `inline` nur für Bilder
   und PDF und nur auf ausdrückliche Anforderung.
4. `X-Content-Type-Options: nosniff`, auch für die ganze Anwendung.
5. `Content-Security-Policy: default-src 'none'; sandbox` auf jeder
   Anlagen-Antwort.
6. Der Dateiname im Header wird bereinigt: keine Zeilenumbrüche, keine
   Anführungszeichen, Umlaute über `filename*=UTF-8''`.
7. Text, Markdown, CSV und Log gehen als JSON hinaus und werden als Text in die
   Seite gesetzt.
8. PDF läuft in einem `iframe` mit `sandbox="allow-scripts"` ohne
   `allow-same-origin`. Die PDF-Betrachter von Chrome und Edge brauchen
   Skripte; ohne `allow-same-origin` sehen sie nichts von der Anwendung.

Fotos: beim Hochladen entscheidet `sharp`. Nur JPEG, PNG, WebP, AVIF, GIF und
TIFF werden angenommen. Beim Ausliefern entscheiden die ersten Bytes, nicht die
Spalte `photos.mime_type`.

Videos: MP4, M4V und MOV an `ftyp`, WebM am EBML-Kopf. Der Server liest zwölf
Bytes und öffnet ein Video nie. Das Standbild läuft durch dieselbe Prüfung wie
ein Foto.

Bilder in Kommentaren gehen durch `sharp` und werden neu kodiert gespeichert.
Anhänge werden nicht nach Typ gefiltert; eine Positivliste ließe sich durch
Umbenennen umgehen. Die Sicherheit hängt an der Auslieferung.

Content-Security-Policy der Anwendung: `default-src 'self'`,
`script-src 'self'`, `frame-ancestors 'none'`, `base-uri 'none'`,
`form-action 'none'`, `frame-src 'self'` für die PDF-Vorschau,
`media-src 'self' blob:` für das Standbild vor dem Hochladen. `style-src`
enthält `'unsafe-inline'`, weil die Oberfläche `style="…"`-Attribute setzt;
`script-src` enthält es nicht.

Links im Kommentartext: die Zerlegung erkennt nur `http://`, `https://` und
`www.`. Vor dem Setzen von `href` wird zusätzlich gegen `^https?://` geprüft.
Text kommt über `createTextNode`, nie über `innerHTML`. Beide Prüfungen sind im
Prüfstand einzeln abgedeckt.

Die `.docx`-Vorschau entpackt mit `zlib` und liest `word/document.xml` als
Text.

## Kurzvideos

Das Standbild erzeugt der Browser beim Hochladen und schickt es mit. Dadurch
braucht das Image kein `ffmpeg` (rund 100 MB), und der Server öffnet nie ein
Video. Folge: ein Video, das der Browser nicht abspielt, lässt sich nicht
hochladen.

Vorgabe 20 MB je Video. Gemessen: 50 MB aus der verschlüsselten Datenbank zu
lesen dauert rund 0,5 s, weil SQLite eine BLOB-Zeile ganz in den Speicher
liest. Ausgeliefert wird in Ranges.

## Bildablage

Fotos werden unverändert gespeichert. Ausnahme ist PNG: je nach Verfahren wird
es als WebP abgelegt.

| Verfahren | Wirkung |
|---|---|
| PNG | keine Umkodierung |
| WebP verlustfrei | `nearLossless` 60, Vorgabe |
| WebP verlustbehaftet | Qualität 90, nur für Fotos sinnvoll |

Gemessen an 100 Bildschirmfotos: WebP verlustfrei ist rund zwei Drittel kleiner
als PNG, größte Abweichung eines Farbwerts 2 von 255. Verlustbehaftet ist bei
Text ein Vielfaches größer als verlustfrei (VP8 gegen VP8L). Ein PNG, das als
WebP größer wäre, bleibt PNG.

Kachel 512 × 512 (Qualität 82) und mittlere Variante 1600 px lange Kante
(Qualität 78), beide immer WebP. Sie kosten rund 7 % mehr Speicher und sparen
beim Blättern etwa den Faktor 100 an Übertragung.

## Reverse Proxy: Cookies je Anfrage

Cookiename, `Secure` und `Strict-Transport-Security` hängen an
`X-Forwarded-Proto` der einzelnen Anfrage, nicht an `BEHIND_PROXY`:

| | über HTTPS | direkt über HTTP |
|---|---|---|
| Sitzungscookie | `__Host-kriterion_session` | `kriterion_session` |
| `Secure` | ja | nein |
| `Strict-Transport-Security` | `max-age=31536000` | nein |

Aus `X-Forwarded-For` gilt der letzte Eintrag: der Proxy hängt die Gegenstelle
hinten an.

## Prüfstand

```bash
npm install                  # holt zusätzlich jsdom
npm test
node testbench.js Rechte     # nur Gruppen mit „Rechte" im Namen
TESTBENCH_TIME=1 npm test    # Zeit je Gruppe
```

Der Prüfstand startet echte Server mit verschlüsselten Datenbanken in
temporären Verzeichnissen. `./data` bleibt unberührt. Am Ende stehen die zehn
teuersten Gruppen.

`counterproof.js` baut einzelne Stellen zurück und prüft, dass der zugehörige
Test scheitert: `node counterproof.js <Nummer>`.

### Prüfschalter

Senkt Kosten, die beim Prüfen nur Zeit kosten. Gelesen wird nur diese Form:

```
KRITERION_TESTBENCH=pruefstand:scrypt=1024:mail=40:brake=10
```

| Wert | senkt | Untergrenze |
|---|---|---|
| `scrypt=<N>` | Kostenstufe von scrypt (ausgeliefert 16384) | 1024, Zweierpotenz |
| `mail=<Teiler>` | die drei Mailfristen (20 s, 7 s, 7 s) | 100 ms |
| `brake=<Teiler>` | Wartezeit der Anmeldebremse, nicht ihre Schwellen | 10 ms |

Ein gesetzter Schalter steht beim Start im Protokoll (`TEST SWITCH ACTIVE`).

## Texte der Oberfläche

Die Wörter aus dem Vokabular werden in jeden Text eingesetzt, ohne Geschlecht
und Fall zu kennen. Neue Texte halten sich deshalb an:

- Plural im Nominativ und Akkusativ: „die Einträge".
- Einzahl ohne Begleiter: „Eintrag löschen", „+ Eintrag".
- Kein Dativ Plural: „bei allen Objekten" würde zu „bei allen Objekte".
- Keine Einzahl mit Artikel oder Beiwort: „ein neuer Eintrag" würde zu „ein
  neuer Maschine".
- Kein zusammengesetztes Wort mit einem Vokabularwort: „Potenzial: Kriterien",
  nicht „Potenzialkriterien".

Eine Sprache kommt als Datei `public/languages/<BCP-47-Kennung>.json` dazu,
etwa `pt-BR.json`. Pflicht sind `"_locale"` (für Datum, Zahl, Mehrzahl) und
`"_name"` (Eigenname der Sprache). Fehlende Schlüssel fallen auf die
Vorgabesprache zurück. Eine unbrauchbare Datei wird übergangen; der Grund steht
im Protokoll (`docker compose logs kriterion | grep '\[languages\]'`).

Ein Satz steht ganz in einem Schlüssel. Betonte Wörter stehen darin zwischen
`**…**`; `tH()` macht daraus Fettdruck, `t()` lässt die Zeichen weg. Jede
Sprache betont im selben Satz gleich viele Stellen. `mail.*` und `server.*`
tragen kein `**`, weil der Server sie als reinen Text einsetzt.
