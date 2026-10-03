# Änderungsprotokoll 0.56.3 — „Titel in der Mail, ◆ ★, Fehler aus der Durchsicht“

**Gebaut am 3. Oktober 2026 auf 0.56.2 (`6b1c562`) nach
`Doku/Auftrag_0.56.3.md`. Fingerprint `6a318ea6`, davor `df009920`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue;
`POST /api/backup/cleanup` nimmt bei `kind: 'rule'` die Felder `keep` und
`days` an. Sprachschlüssel: `list.ownValues` entfällt; `list.ownRatingHint`,
`card.youMarker`, `entry.dayAdded` und `entry.quoted` sind neu. Kein neuer
Vorgang im Sicherheitsprotokoll, keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 3. Oktober 2026 | Bildschirmfoto einer Testmail mit „Testmail aus „{instanceTitle}““: „im Mail fehlt der Titel“; muss in die nächste Runde |
| 3. Oktober 2026 | „Eigene Werte“ mit dem Symbol der Schätzung und einem Stern darstellen; die Schwelle auch bei Potenzial, synchron oder mit Hinweis |
| 3. Oktober 2026 | Die Vorschläge aus `Doku/Vorschlaege_Claude_0.56.x.md` bewerten: „lohnt es sich für uns oder ist das nur eine Bemerkung“; das erste Paket nach eigener Beurteilung schnüren |
| 3. Oktober 2026 | Fragetafel: Umfang **größer**, Fehler mit Folgen und Fehler der Bedienung zusammen |
| 3. Oktober 2026 | Fragetafel: nur „◆ ★“ ohne das Wort „Eigene Werte“, auch nicht im Tooltip; der Tooltip nennt die Wörter aus dem Vokabular |
| 3. Oktober 2026 | Fragetafel: die Schwelle steht in beiden Karten (Empfehlung) |
| 3. Oktober 2026 | Fragetafel: `X-Forwarded-For` nur von privaten Adressen (Empfehlung) |
| 3. Oktober 2026 | Chat: im Dialog „Infos“ alles nach „Allgemein“ aufklappbar; Fragetafel: immer zugeklappt (Empfehlung) |
| 3. Oktober 2026 | Chat: „Farbunterabtastung“ heißt „Chroma Subsampling“ |
| 3. Oktober 2026 | Fragetafel beim Bauen: eine gelungene Anmeldung setzt den Zähler der Adresse weiter zurück (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.56.2.

BILANZ

---

## 3. Was gebaut ist

### Titel in der Mail

- `sendTokenLink()`, `sendConfirm()` und `POST /api/mail/test` übergeben
  `instanceTitle` statt `title`. Die Sprachdateien tragen den Platzhalter
  `{instanceTitle}` seit dem ersten Commit des Repositorys; der Server hat ihn
  nie gefüllt. Betroffen waren Einladung, Zurücksetzen, Bestätigung und
  Testmail, Betreff und Text.
- Der Abgleich aller übrigen 350 Aufrufe von `t()` mit Werten in `server.js`
  und `public/app.js` gegen die Platzhalter der Sprachdatei fand keine weitere
  Abweichung.

### ◆ ★ und die Schwelle

- Die Gruppe in der Statuszeile heißt „◆ ★“, ohne Potenzialmodus „★“. Ihr
  Titel ist `list.ownValuesHint`, ohne Potenzialmodus `list.ownRatingHint`;
  beide nennen nur Wörter aus dem Vokabular.
- `list.sharePartialHint` nennt die eigenen Sterne; die türkische Fassung
  verliert „Kendi değerleriniz“.
- Das Feld „Schwelle für „Teilweise““ steht in „Potenzial: Kriterien“ und
  „Bewertung: Kriterien“ (`CRIT_CARD.*.share`). Eine Änderung schreibt den
  gespeicherten Wert in beide Felder. Der Hinweis nennt beide Kästen.

### Infos

- Bei Bildern und Videos stehen die Gruppen nach „Allgemein“ als `<details>`,
  beim Öffnen zugeklappt (`mediaGroup(…, true)`). Dokumente bleiben, wie sie
  sind.
- `entry.mediaChroma` heißt deutsch „Chroma Subsampling“.

### Anmeldebremse

- `brakeTurn()`: je Adresse eine Prüfung von Passwort oder Code zur Zeit. Vorher
  ergaben 500 parallele falsche Anmeldungen 500 × 401 und keine 429.
- `brakeFree()` und `noteFailure()` jetzt auch in `PUT /api/account` (altes
  Passwort), `ownPasswordMatches()` und `ownCodeMatches()` (Routen des zweiten
  Faktors).
- `POST /api/signup/confirm` setzt den Zähler der Adresse nicht mehr zurück.
  Anmeldung und Einlösen eines Links setzen ihn weiter zurück (Vorgabe).
- `clientIp()` liest `X-Forwarded-For` nur, wenn die Verbindung aus dem eigenen
  Netz kommt (`PRIVATE_PEER`).

### Fehler mit Folgen

- F1 `closed: []` in „Standardanordnung wiederherstellen“.
- F2 `value="owner"` an beiden Rollenwahlen.
- F4 „Alte Backups“: `drawCleanup(fetched, true)` zeichnet beim Tippen nur
  Liste und Regeltext; die Felder bleiben. „Jetzt löschen“ schickt `keep` und
  `days` mit, der Server prüft sie mit `checkRuleValue()`.
- F5 Ein Testtag darf bis zum Datum in UTC+14 liegen.
- F8 `qPhotoBytes().data`.
- F9 `takeBackupLock()` in `POST /api/files/missing` im `try`.
- F10 `HELD_LOCK`: der Signal-Handler gibt das Lockfile frei; der Start löscht
  es, wenn er ein abgebrochenes Backup (`*.sqlite.wird`) findet.
- F12 `backuptool restore`: die Meldung nach einem Abbruch nennt die Zeit aus
  dem Namen. README in drei Sprachen.
- F16 `keytool.sh`: `-exec … {} +` mit Abbruch und Neustart, wenn die Kopie
  scheitert; vorher die Prüfung, ob `data/encryption.key` lesbar ist.
- F25 `-e NEW_KEY` ohne Wert.
- F27 `.env.before-key-change-*` in `.dockerignore` und `.gitignore`.
- F28 Ein leeres Mailpasswort übernimmt das gespeicherte nur bei gleichem
  Anbieter, Benutzer und Server.
- F43 `untilDrained()` endet sofort, wenn die Verbindung schon zu ist; auch für
  den Weg an ffmpeg.
- F46 Die Kopie wird nur gelöscht, wenn das Original an seinem Platz liegt.

### Fehler der Bedienung

- F6, F13 `VIEW_RUN`: jedes `render*` zählt hoch und zeichnet nach einem
  `await` nur, wenn kein neueres lief; `drawViewer()`, `drawThumbs()` und
  `drawComments()` fragen `here()`. `loadFailed()` (F38) nennt den Grund, nur
  404 heißt „nicht gefunden“.
- F7 `entryNeighbours()` folgt `visibleItems()`; fällt der Eintrag aus dem
  Filter, gilt der Bestand.
- F14 Nach einem Bild am offenen Editor geht er mit dem Entwurf wieder auf.
- F15 „Anlegen“ und „Kommentieren“ sind während der Anfrage gesperrt.
- F17 Die Exportgröße zählt Kommentarvideos mit.
- F18 `redrawLinks` misst beim Aufklappen von „Links“ neu.
- F21 `fromBackdrop()`: ein Klick auf den Hintergrund zählt nur, wenn auch
  `pointerdown` dort lag; an allen zehn Dialogen.
- F22 `showLogin()` schließt ein offenes Vollbild mit `close()`; `inert` und
  die Tastenhandler gehen mit.
- F23 Nach dem Wechsel des Backup-Ordners lädt `renderSystem()` neu.
- F31 Die Sperre „letzter Eigentümer“ gilt nur für aktive Eigentümer.
- F34 In der Antwort auf das Freischalten steht der Grund des Versands.
- F35 ✕ der Vergleichsleiste wirkt; außerhalb der Übersicht verschwindet sie.
- F36 Der Zähler der offenen Aufgaben zählt abgehakte nicht.
- F39 Pfeiltaste und Wischen bei einem Element tun nichts (`step()`).
- F40 `sortOf()`: ohne Potenzialmodus gilt eine Sortierung nach Potenzial als
  „Geändert“.
- F41 `followBatchRun(stats)` übernimmt die laufenden Läufe vom Zeichnen.
- F54 Das Zitiermenü weicht der Kopfzeile aus (`mastheadHeight()`).
- F19, F20, F26, F52 im Stilblatt: Benutzerzeile bricht in Karten unter 560 px
  um; „Von vorn“ 62 px von oben; Upload-Anzeige am Telefon unten;
  `.sys-tabs.closed` nur in der Media Query der eingeklappten Kopfzeile.

### Texte

- F29 „Keine Suchmaschine eingestellt“ nennt „Installation“.
- F30 `card.youMarker`, `entry.dayAdded`, `entry.quoted`; Beispieladressen mit
  `forum.example.com`.
- F47 Die Anleitung nennt die Vorgabesprache statt der Browsersprache.
- F51 `.env.example` nennt „Version und Verschlüsselung“, `keytool.sh` die Zeile
  „Key loaded from ENCRYPTION_KEY.“.
- F53 `server.ruleDays` nennt „Löschen, wenn älter als“ (de, tr).

### Dokumentation

- Anleitung in drei Sprachen: Filter „◆ ★“, Schwelle, Infos, Sprache,
  Blättern.
- README in drei Sprachen: abgebrochenes `restore`, Reverse Proxy.
- `Doku/Entwicklung.md`: `X-Forwarded-For` und Anmeldebremse.
- `Doku/Vorschlaege_Claude_0.56.x.md`: die gebauten Fehler entfallen; jeder
  übrige Punkt trägt eine Bewertung; F55 bis F57 sind neu.

---

## 4. Der Prüfstand

PRUEFSTAND
