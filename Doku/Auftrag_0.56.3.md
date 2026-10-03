# Auftrag 0.56.3 — „Titel in der Mail, ◆ ★, Fehler aus der Durchsicht“

**Aufgestellt am 3. Oktober 2026.** Grundlage sind
`Doku/Vorschlaege_Claude_0.56.x.md` und zwei Vorgaben des Betreibers aus dem
Chat. Jeder Befund aus Abschnitt 2 der Vorschläge ist am 3. Oktober 2026 noch
einmal im Code nachgelesen; F3, F9, F11, F19, F20, F21 und F26 auch am
laufenden Server oder in Chromium. Widerlegt wurde keiner.

Zeilennummern gelten für `6b1c562`.

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | M | Bildschirmfoto einer Testmail mit „Testmail aus „{instanceTitle}““: „im Mail fehlt der Titel“; muss in die nächste Runde (Chat, 3. Oktober 2026) |
| V2 | E | „Eigene Werte“ mit dem Symbol der Schätzung und einem Stern darstellen; die Schwelle für „Teilweise“ auch bei Potenzial zeigen (Chat, 3. Oktober 2026) |
| V3 | alle | Umfang: Fehler mit Folgen und die Fehler der Bedienung zusammen, rund 50 Punkte (Fragetafel, 3. Oktober 2026) |
| V4 | I | Bildschirmfoto des Dialogs „Infos“ eines Videos: „kann man alles nach dem Allgemein also Video/Audio und Proxy aufklappbar machen damit es nicht so riesig ist“ (Chat, 3. Oktober 2026) |
| V5 | I | „das wort farbuntertabtastung mit "Chroma Subsampling" ersetzen. das wird auch in deutsch so verwendet“ (Chat, 3. Oktober 2026) |

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Umfang der Runde? | wie vorgeschlagen (16 Fehler mit Folgen) · kleiner (F1 bis F4) · größer (dazu die Bedienung) | **größer** |
| F2 | Beschriftung der Gruppe „Eigene Werte“? | „Eigene Werte ◆ ★“ · nur „◆ ★“ | **nur „◆ ★“**, ohne Potenzialmodus nur „★“. Wortlaut des Betreibers: „Ist das eine eigene werte oder sind dass einschätzungen und bewertungen […] Daher mag ich das wort eigene werte nicht. nicht mal im tooltip. […] im tooltips wird das richtige wort dafür was der admin dafür eingetragen hat angezeigt“ |
| F3 | Wo steht die Schwelle für „Teilweise“? | in beiden Karten, ein Wert · nur bei Potenzial, Bewertung mit Hinweis · bleibt bei Bewertung, Potenzial mit Hinweis | **in beiden Karten** (Empfehlung) |
| F4 | Wann gilt `X-Forwarded-For` für die Anmeldebremse? | nur von privaten Adressen · wie bisher · Compose bindet an 127.0.0.1 | **nur von privaten Adressen** (Empfehlung) |
| F5 | Abschnitte im Dialog „Infos“ beim Öffnen? | immer zugeklappt · Zustand je Account merken · am Telefon zu, am Rechner offen | **immer zugeklappt** (Empfehlung) |
| F6 | Setzt eine gelungene Anmeldung den Zähler der Adresse zurück? (beim Bauen: ohne Rücksetzen liefen viele Tests in die Sperre) | ja, wie bisher · nein, nur den Namen | **ja, wie bisher** (Empfehlung) |

---

## 1. Das Ziel

Die Mails nennen den Titel der Installation. Die Filtergruppe der eigenen
Sterne heißt „◆ ★“, der Tooltip nennt die Wörter aus dem Vokabular. Die
Schwelle für „Teilweise“ steht in beiden Kriterienkarten.

Dazu die bestätigten Fehler aus der Durchsicht: Datenverlust, Sicherheit,
Absturz, Funktionen, die nicht gehen, und Fehler der Bedienung.

---

## 2. Die Punkte

### M Titel in der Mail

- `sendTokenLink()` (`server.js:263`), `sendConfirm()` (`server.js:306`) und
  `POST /api/mail/test` (`server.js:1405`) übergeben `title`. Die Sprachdateien
  erwarten `{instanceTitle}`. Betroffen sind alle vier Mails, Betreff und Text.
- Die drei Aufrufe übergeben `instanceTitle`.
- Prüfung am echten SMTP-Gespräch: Betreff und Text nennen den Titel, kein
  `{…}` bleibt stehen.

### E ◆ ★ und die Schwelle

- `drawFilters()` (`public/app.js:3579`): Beschriftung „◆ ★“, ohne
  Potenzialmodus „★“. Der Tooltip der Beschriftung ist `list.ownValuesHint`
  mit den Wörtern aus dem Vokabular; ohne Potenzialmodus ein eigener Satz nur
  mit „Bewertung“.
- `list.ownValues` entfällt. `list.sharePartialHint` nennt die Sterne statt
  „selbst bewertet“; die türkische Fassung verliert „Kendi değerleriniz“.
- `cardCriteria()` (`public/app.js:9876`): Das Feld steht in beiden Karten.
  Eine Änderung schreibt den Wert in beide Felder.

### Fehler mit Folgen

| Nr. | Fix |
|---|---|
| F1 | `closed: []` statt `zu: []` (`public/app.js:9752`) |
| F2 | `value="owner"` (`public/app.js:10614`, `10773`); `test/ui_entry.js:727` |
| F3 | Je Adresse läuft nur eine Prüfung des Passworts zur Zeit. Der Bestätigungslink der Registrierung setzt den Zähler nicht mehr zurück; Anmeldung und Einlösen eines Links weiter (F6) |
| F4 | „Alte Backups“: Die Felder bleiben beim Tippen stehen, nur die Liste wird neu gezeichnet. „Jetzt löschen“ schickt die angezeigten Werte mit |
| F5 | Ein Testtag darf bis UTC+14 in der Zukunft liegen |
| F8 | `qPhotoBytes().data` (`server.js:3773`) |
| F9 | `takeBackupLock()` im `try` (`server.js:5752`) |
| F10 | Der SIGTERM-Handler gibt ein gehaltenes Lockfile frei; der Start löscht ein Lockfile, wenn ein abgebrochenes Backup erkannt ist |
| F11 | Bremse für das Passwort in `ownPasswordMatches()` und `PUT /api/account` |
| F12 | `backuptool`: Die Meldung nach einem Abbruch nennt das Backup mit Zeitpunkt statt der Nummer |
| F16 | `keytool.sh`: `-exec … {} +`; Abbruch, wenn die Kopie scheitert |
| F25 | `keytool.sh`: `-e NEW_KEY` ohne Wert |
| F27 | `.env.before-key-change-*` in `.dockerignore` und `.gitignore` |
| F28 | Das gespeicherte Mailpasswort gilt nur für denselben Server |
| F43 | `untilDrained()` endet, wenn der Browser die Verbindung schließt |
| F46 | Die Kopie wird nur gelöscht, wenn das Umbenennen gelungen ist |
| — | `clientIp()`: `X-Forwarded-For` nur von Loopback und privaten Netzen (F4 oben) |

### Fehler der Bedienung

| Nr. | Fix |
|---|---|
| F6, F13 | Ein Zähler je Ansicht; nach einer Antwort zeichnet nur die Ansicht, die noch steht |
| F7 | „Weiter ›“ folgt `visibleItems()` |
| F14 | Nach dem Anfügen eines Bildes bleibt der Editor mit dem Entwurf offen |
| F15 | „Anlegen“ und „Kommentieren“ sind während der Anfrage gesperrt |
| F17 | Die Größe des Exports zählt Kommentarvideos mit |
| F18 | „Links“ misst beim Aufklappen neu |
| F19 | Benutzerzeile bricht in schmalen Karten um |
| F20 | „Von vorn“ liegt unter den Werkzeugen des Videos |
| F21 | Ein Dialog schließt nur, wenn Drücken und Loslassen auf dem Hintergrund lagen |
| F22 | Die Anmeldung schließt ein offenes Vollbild mit `close()` |
| F23 | Nach dem Wechsel des Backup-Ordners werden die Einstellungen neu gezeichnet |
| F26 | Upload-Anzeige am Telefon unten |
| F31 | Die Sperre „letzter Eigentümer“ zählt nur aktive Eigentümer |
| F34 | Der Grund eines SMTP-Fehlers bleibt in der Antwort |
| F35 | ✕ der Vergleichsleiste wirkt überall; die Leiste verschwindet außerhalb von Übersicht und Eintrag |
| F36 | Der Zähler der offenen Aufgaben zählt nur offene |
| F38 | Ein Ladefehler nennt den Grund; „unbekannt“ nur bei 404 |
| F39 | Pfeiltaste und Wischen bei einem Element tun nichts |
| F40 | Ohne Potenzialmodus gilt eine Sortierung nach Potenzial als „Geändert“ |
| F41 | Endet die Konvertierung vor der ersten Abfrage, wird der Knopf frei |
| F52 | `.sys-tabs.closed` nur in der Media Query des Telefons |
| F54 | Das Zitiermenü weicht der Kopfzeile aus |

### Texte

| Nr. | Fix |
|---|---|
| F29 | Der Hinweis „Keine Suchmaschine eingestellt“ nennt „Installation“ |
| F30 | „(du)“, „… eingetragen“ als Schlüssel; Platzhalter `forum.example.com` |
| F47 | Die Anleitung nennt die Vorgabesprache statt der Browsersprache |
| F51 | `.env.example` nennt die richtige Karte, `keytool.sh` die englische Logzeile |
| F53 | Die Fehlermeldung zur Aufräumregel nennt „Löschen, wenn älter als“ |

### I Infos

- `mediaGroup()` (`public/app.js:5200`): bei Bildern und Videos stehen alle
  Gruppen nach „Allgemein“ als `<details>`, beim Öffnen zugeklappt. Dokumente
  bleiben, wie sie sind.
- `entry.mediaChroma` heißt deutsch „Chroma Subsampling“.

### Nicht in dieser Runde

Vollbild (V5, V8, V12 bis V17, V19), Stil (S1 bis S13), F24, F32, F33, F37,
F42, F44, F45, F48, F49, F50, V11, V18.

---

## 3. Prüfstand

- Neue Gruppen in `test/release_056.js`.
- Bestehende Prüfungen auf den neuen Stand, wo sie den Fehler festhalten
  (`test/ui_entry.js:727`, `test/release_056.js:366–404`).
- Rückbauten je Punkt.

## 4. Dokumentation

- README und Anleitung in drei Sprachen, wo sich Verhalten ändert.
- CHANGELOG, Änderungsprotokoll 0.56.3, Fahrplan.
- `Doku/Vorschlaege_Claude_0.56.x.md`: gebaute Punkte entfernen.
- `Doku/Entwicklung.md`: `X-Forwarded-For`.
- Version 0.56.3, Fingerprint.
