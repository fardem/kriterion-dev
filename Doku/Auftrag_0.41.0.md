# Auftrag 0.41.0 — „Backup, Videos in Kommentaren und der Prüfstand ohne feste Wartezeiten"

**Erteilt am 23. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Dieser Auftrag beantwortet jede Frage, die beim Bauen
aufkommen kann. Es wird nicht nachgefragt.

Grundlage ist der Eintrag 0.41.0 in `Doku/Fahrplan.md`. Dort steht zu jedem
Punkt die Ausarbeitung mit Fundstellen. Dieser Auftrag entscheidet, was dort
offen ist.

---

## 1. Das Ziel

- Der Prüfstand wartet auf Bedingungen statt auf feste Zeiten.
- Oberfläche und Handbuch sagen, was Export, Import und Backup enthalten. Das
  Wort heißt Backup.
- Kommentare nehmen kurze Videos auf. Jedes Foto und jedes Video lässt sich
  einzeln herunterladen.
- Drei Fehler aus dem Betrieb sind behoben. Die Beispieldateien sind kurz und
  richtig.

---

## 2. Der Anlass

| Anlass | Stand am 23. September 2026 |
|---|---|
| Feste Wartezeiten im Prüfstand | 618 Stellen, zusammen 47.625 ms, in 13 Modulen, gemessen an `47e8cf6`. Ein voller Lauf dauert 401,6 bis 410,4 s |
| Export und Import | Nach dem Einspielen einer Exportdatei in eine frische Installation fehlten Benutzer und Mailversand. Das ist so gebaut und steht nirgends am Bildschirm |
| Das Wort | Die Oberfläche sagt „Sicherung", an 57 Schlüsseln in `de.json` |
| Drei Fehler | Das Hinweisfeld an der Zeitleiste, die Formatierleiste am langen Kommentar, das Cookie nach dem Umlegen von `BEHIND_PROXY` |
| Die Beispieldateien | `.env.example` hat 120 Kommentarzeilen für drei Einstellungen und zwei falsche Angaben |
| Zwei Wünsche | Download je Foto und Video; kurze Videos in Kommentaren |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 22. September 2026 | „richtige Begriffe sind: Import, Export, Backup." |
| 22. September 2026 | „du brauchst die Funktion nicht verändern, passt schon so" — am Ablauf von Export, Import und Backup ändert sich nichts. Gebaut werden die Hinweise |
| 23. September 2026 | „Nur das Backup ist eine vollständige Sicherung der Datenbank." |
| 23. September 2026 | Beispieldateien: wofür eine Einstellung da ist, was sie bewirkt, wovon sie abhängt. Keine Cookienamen, kein genauer Ablauf |
| 23. September 2026 | „wir nehmen alle Punkte für 0.41.0 auf" |
| 23. September 2026 | Der Auftrag kommt „mit Schemaänderung": kurze Videos in Kommentaren gehören dazu |
| 23. September 2026 | „Download pro Video/Foto (kein Download für alle nötig)" |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.41.0**, MINOR, Schema: ja, Format: 18 → 19 |
| Wo liegen Videos in Kommentaren? | In einer neuen Tabelle `comment_videos`, nicht in neuen Spalten von `comment_images` |
| Warum eine Tabelle? | `db.exec(SCHEMA)` legt bei jedem Start fehlende Tabellen an und ändert nie eine bestehende (`db.js`:486). Eine neue Tabelle erreicht die bestehenden Installationen ohne Zutun. Eine neue Spalte erreichte sie nur über einen Migrationsblock, und die werden nicht mehr geschrieben. Dafür entsteht ein eigener Speicherweg, vor dem das Konzept zu Video gewarnt hat |
| Was heißt kurz? | Höchstens 20 MB je Video, dieselbe Grenze wie am Eintrag (`VIDEO_MAX`). Die Dauer wird nicht begrenzt: ohne Umkodierer kann der Server sie nicht prüfen |
| Welche Formate? | Dieselben wie am Eintrag (`attachments.VIDEO_TYPES`: mp4, m4v, webm, mov), geprüft an den Bytes |
| Wie viele? | Bilder und Videos zusammen höchstens sechs je Kommentar (`IMAGE_COUNT`). Je Hochladen ein Video |
| Wer darf? | Wie bei Kommentarbildern: hinzufügen nur der Verfasser, löschen Verfasser und Admin |
| Der Zähler „vom Admin entfernt" | `images_removed` zählt Videos mit. Wortlaut: „{n} Bild oder Video vom Admin entfernt", Mehrzahl „{n} Bilder oder Videos vom Admin entfernt" |
| Austauschformat | 19. Der Kommentar bekommt `videos`, unter dem Schalter der Dateien wie die Kommentarbilder. Eine Datei mit Format 18 bleibt lesbar. Eine ältere Fassung übergeht `videos` beim Einlesen |
| Download | Ein Knopf je Foto und Video in der Bildansicht. Kein Download für alle. Keine neue Route; die Dateinamen setzt der Server wie heute |
| Hinweisfeld an der Zeitleiste | Es bekommt eine eigene Breite und wird nach innen verschoben, an beiden Rändern |
| Formatierleiste | Kopfzeile des Feldes, mit `position: sticky` unter der festen Kopfzeile. Das Feld bekommt keine Höchsthöhe |
| Cookie nach `BEHIND_PROXY` | Der Wächter vor allen Routen löscht das Cookie gegen fremde Formulare unter dem anderen Namen |
| Wortfilter für Kommentare und `Doku/` | Bekommt keinen Eintrag. `Doku/` enthält das alte Wort 818-mal in 73 Dateien, und Änderungsprotokolle bleiben, wie sie sind. Stattdessen zwei Wächter über die ausgelieferten Texte (BA 10) |
| Pfade und Kennungen | Bleiben: `kriterion-sicherung`, `/app/sicherung`, `/sicherung`, der Kartenschlüssel `'sicherung'` (`public/app.js`:7107). Ein geänderter Pfad verlegt den Ordner bestehender Installationen |
| Namen im Prüfstand | Gruppen-, Prüfungs- und Rückbaunamen mit dem alten Wort bleiben. Sie umzubenennen ist eine eigene Runde |
| Englisch und Türkisch | Sagen schon `Backup` und `Yedekleme`. Sie bekommen nur die neuen Sätze und Schlüssel, sinngleich |
| Ändert sich eine bestehende Route? | Nein. Neu sind drei Routen für Kommentarvideos (BA 3), und `POST /api/items/:id/comments` nimmt zusätzlich ein Video an |

---

## 4. Die Bauabschnitte

Die Reihenfolge ist die hier. BA 1 steht vorn: jeder spätere Testlauf wird
dadurch kürzer, und neue Prüfungen entstehen gleich ohne feste Wartezeit.

### BA 1 — Der Prüfstand wartet auf Bedingungen

Gemessen an `47e8cf6`, Form `await new Promise(r => setTimeout(r, N))`:

| Modul | Stellen | ms |
|---|---:|---:|
| `test/ui_entry.js` | 144 | 8.270 |
| `test/ui_overview.js` | 99 | 8.230 |
| `test/ui_system.js` | 105 | 6.450 |
| `test/ui_style.js` | 89 | 5.540 |
| `test/ui_inventory.js` | 56 | 5.105 |
| `test/roundtrip.js` | 18 | 4.600 |
| `test/ui_export.js` | 58 | 4.040 |
| `test/release_030.js` | 17 | 3.465 |
| `test/ui_language.js` | 21 | 1.230 |
| `test/ui_translator.js` | 4 | 420 |
| `test/dom.js` | 5 | 150 |
| `test/release_031.js` | 1 | 120 |
| `test/frame.js` | 1 | 5 |
| **zusammen** | **618** | **47.625** |

- Jede Stelle wird zu `until(w, Bedingung, Grenze, Beschreibung)` aus
  `test/dom.js`:1320. Die Bedingung nennt den Zustand, auf den gewartet wird.
- `test/dom.js` zuerst: seine fünf Stellen stehen in Helfern, die viele Module
  rufen.
- Bleiben dürfen zwei Arten: der Schritt in `nextSecond()`
  (`test/frame.js`:897) und eine Wartezeit, die prüft, dass etwas nicht
  geschieht. Jede bleibende Stelle bekommt einen Kommentar in einer Zeile.
- Modul für Modul. Nach jedem Modul ein voller `npm test` und ein Commit.
- Ein neuer Wächter hält die Zahl der bleibenden Stellen genau fest.

### BA 2 — Die Tabelle `comment_videos`

In `SCHEMA` (`db.js`), hinter `comment_images`:

```sql
CREATE TABLE IF NOT EXISTS comment_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL DEFAULT 'video.mp4',
  duration INTEGER,
  thumb BLOB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comment_videos_comment ON comment_videos(comment_id);
```

- `data` steht am Ende, wie in den anderen Tabellen mit Blobs.
- `thumb` ist die Kachel aus dem Standbild. Sie dient auch als Poster im
  Player.
- Keine bestehende Tabelle ändert sich. `REQUIRED_COLUMNS` bleibt, wie es ist.
- Eine Datenbank von 0.40.0 bekommt die Tabelle beim ersten Start.

### BA 3 — Videos in Kommentaren am Server

| Route | was sie tut |
|---|---|
| `POST /api/items/:id/comments` | nimmt zusätzlich `video`, `stillFrame` und `duration` an, wie `POST /api/items/:id/videos` am Eintrag. Text, Bilder und Video kommen in einem Zug. Die Grenze je Datei bleibt 20 MB |
| `POST /api/comments/:id/videos` | neu: ein Video an einen bestehenden Kommentar, nur der Verfasser |
| `DELETE /api/comment-videos/:id` | neu: Verfasser und Admin; löscht der Admin, steigt `images_removed` |
| `GET /api/comment-videos/:id/raw` | neu: liefert mit Range aus wie `/api/photos/:id/raw`; `?size=thumb` liefert die Kachel |

- Die Absagen verwenden die vorhandenen Meldungen der Eintragsvideos
  (`server.videoOne`, `server.videoStill`, `server.stillNotImage`,
  `server.stillNoPreview`) und `server.imageCap`.
- Das Video wird nicht neu kodiert. Aus dem Standbild entsteht `thumb` auf
  demselben Weg wie die Kachel eines Kommentarbilds.
- **Export:** der Kommentar bekommt
  `videos: [{ filename, duration, data…, still… }]`, unter dem Schalter der
  Dateien. `EXCHANGE_FORMAT` wird 19.
- **Import:** `videos` wird ohne Umkodieren übernommen, das Standbild wird
  `thumb`. Ein Video ohne lesbares Standbild wird übergangen und gezählt wie
  `videosUnreadable` heute. Eine Datei mit Format 18 kommt unverändert herein.
- **Papierkorb:** `intoTrash()` kopiert Video und Standbild mit
  `INSERT … SELECT` nach `trash_bytes`, wie die anderen Blobs. Das
  Zurückholen stellt beide ohne Umkodieren her.
- **Kennzahlen:** die Karte bekommt die Zeile „Kommentarvideos" neben
  „Kommentarbilder". Die geschätzte Exportgröße zählt sie mit den Dateien.

### BA 4 — Videos in Kommentaren im Browser

- Der Knopf `entry.addImage` heißt „+ Bild/Video" (en „+ Image/Video", tr
  „+ Resim/Video") und nimmt Bilder und Videos an.
- Das Standbild schneidet `stillFrame()` (`public/app.js`:5343) wie am
  Eintrag. Die Funktion wird dafür auf die oberste Ebene gehoben.
- Die Kachel steht in der Reihe der Kommentarbilder, hinter den Bildern, mit
  dem Abspielzeichen der Eintragsvideos. Ein Klick öffnet die Bildansicht und
  spielt ab.
- Beim Bearbeiten zeigt die Kachel das × wie ein Kommentarbild.
- Die Bildansicht kennt eine dritte Quelle neben Foto und Kommentarbild
  (`public/app.js`:4463).

### BA 5 — Download je Foto und Video

- Die Kopfzeile der Bildansicht (`openLightbox()`, `public/app.js`:4492)
  bekommt einen Link mit `download` auf das Original:
  `/api/photos/:id/raw`, `/api/comment-images/:id/raw` oder
  `/api/comment-videos/:id/raw`.
- Zeichen und Titel wie am Anhang: „↓" und `entry.download`.
- Der Server bleibt unverändert. Die Dateinamen bleiben `foto-<Nummer>` und
  `bild-<Nummer>`, neu ist `video-<Nummer>`, je mit der Endung aus den Bytes.

### BA 6 — Das Hinweisfeld an der Zeitleiste

- `.timeline-hint` (`public/style.css`:1907) bekommt `width: max-content`.
  `max-width: min(14rem, 46%)` und `overflow-wrap: anywhere` bleiben.
- `showHint()` (`public/app.js`:3962) misst das Feld nach dem Einfügen und
  verschiebt es so, dass es ganz in der Zeitleiste steht, an beiden Rändern.
  Die Rechnung steht in einer eigenen Funktion ohne Zugriff auf das DOM, damit
  der Prüfstand sie ohne Layout prüfen kann.
- Messung in Chromium, Zeitleiste 900 px, vorher und nachher: Breite und Lage
  bei 0, 50, 90, 95 und 100 %. Vorher gemessen: 210 px bei 50 %, bei 100 %
  35 px breit und 647 px hoch.

### BA 7 — Die Formatierleiste am Feld

- Hat ein Feld mit `data-markup` den Fokus, steht die Leiste im Fluss direkt
  über dem Feld. Beide stehen dafür in einem Behälter `.markup-wrap`, der nur
  Leiste und Feld enthält.
- Die Leiste hat `position: sticky`. `top` ist die Höhe von `.masthead`,
  gemessen beim Andocken und bei jeder Größenänderung des Fensters.
- Sie läuft beim Scrollen mit und hält am unteren Rand des Behälters an. Die
  Knöpfe unter dem Feld liegen außerhalb des Behälters und bleiben frei.
- Das Menü an einer Auswahl im Lesemodus (Zitieren, Kopieren) bleibt
  absolut an der Auswahl, mit `markupMenuPlace()`.
- Messung in Chromium bei 360 px mit einem langen Kommentar, vorher und
  nachher: Abstand zwischen Leiste und Knopfreihe.

### BA 8 — Das Cookie nach dem Umlegen von `BEHIND_PROXY`

- Der Wächter vor allen Routen (`server.js`:636) prüft zusätzlich, ob die
  Anfrage das Cookie gegen fremde Formulare unter dem anderen Namen
  mitbringt. Wenn ja, hängt er eine Löschung an: `Max-Age=0`, beim Namen mit
  `__Host-` zusätzlich `Secure` und `Path=/`.
- Das Sitzungscookie unter dem anderen Namen bleibt unberührt.
- Danach hilft das Neuladen, zu dem `server.deniedOrigin` rät.

### BA 9 — Was Export, Import und Backup enthalten

Wortlaut auf Deutsch. Englisch und Türkisch sinngleich; `{entryMany}` folgt
dem Vokabular der Instanz.

| Ort | Schlüssel | neuer Wortlaut |
|---|---|---|
| Dialog, Zeile „Backup" | `card.wayBackupHint` | der Notfall. Die vollständige, verschlüsselte Sicherung der Datenbank — auch mit Benutzern und Einstellungen. |
| Dialog, unter den drei Wegen | neu `card.onlyBackupComplete` | Nur das Backup ist eine vollständige Sicherung der Datenbank. |
| Dialog, unter den drei Wegen | neu `card.exportOnlyEntries` | Export und Import enthalten nur die {entryMany} — keine Benutzer und keine Einstellungen von Kriterion. |
| Karte „Export und Import" | `card.exportPurposeHint` | für Umzug, Archiv und Weitergabe — unverschlüsselt, auch mit späteren Versionen lesbar. Er enthält nur die {entryMany}, keine Benutzer und keine Einstellungen. Für den Notfall: Karte |
| Karte des Backups | `card.backupWhatHint` | {word} die vollständige, verschlüsselte Sicherung der Datenbank — auch mit Benutzern und Einstellungen, die der Export nicht enthält. Lässt sich nur in dieselbe Programmversion zurückspielen. |

- **Handbuch, Abschnitt „Export und Import":** die Liste, was die Exportdatei
  nicht enthält, wird vollständig: Benutzer, Passwörter, Sitzungen, zweiter
  Faktor, Mailversand, Titel, Vokabular, Suchmaschinen, Bildformate, Ort des
  Backups, persönliche Einstellungen, Sicherheitsprotokoll, Papierkorb. Dazu
  der Satz „Nur das Backup ist eine vollständige Sicherung der Datenbank."
  und ein Satz zum Umzug: wer eine neue Installation mit einer Exportdatei
  füllt, legt die Benutzer vorher mit denselben Benutzernamen an; sonst fallen
  ihre Beiträge an den, der einspielt.
- **Nach dem Dateiimport** nennt die Meldung die Verfasser, die dem
  Einspielenden zugefallen sind: `r.authorUnknown` mit
  `card.postsAssignedHint`, wie nach dem Zurückholen aus dem Papierkorb
  (`public/app.js`:8608). Die Stelle ist `public/app.js`:10445.

### BA 10 — Das Wort heißt Backup

| alt | neu |
|---|---|
| die Sicherung | das Backup |
| die Sicherungen | die Backups |
| Sicherungsordner | Backup-Ordner |
| Sicherungsort, Ort der Sicherung | Ort des Backups |
| sichern | ein Backup anlegen |
| Kopie, wo das Backup gemeint ist | Backup |

Artikel, Adjektive und Pronomen folgen dem neuen Geschlecht: „Letzte
Sicherung" wird „Letztes Backup", „Sie lässt sich" wird „Es lässt sich".
Ausnahme ist „Sicherung der Datenbank" als Beschreibung, wie im Satz aus
BA 9.

| Wo | Umfang |
|---|---|
| `public/languages/de.json` | 57 Schlüssel mit 68 Werten; dazu `card.backupNow` („Backup anlegen") und `card.backupNowHint` („Bitte jetzt ein neues Backup anlegen.") |
| `README.md` | 43 Stellen und „Kopie" im Sinn des Backups. Die Überschrift „Sichern" heißt „Backup"; Sprungmarken, Inhaltsverzeichnis und Verweise aus dem Handbuch folgen |
| `manual-de.md` | 16 Stellen und „Kopie" im Sinn des Backups (Zeilen 124, 1051, 1056, 1067, 1071, 1145, 1149) |
| Ausgaben auf dem Server | `keytool.js` (sechs Zeilen), `keytool.sh` (Hilfetext und Ausgabe), `keys.js` (die Meldung in Zeile 90 und der Kommentar, den es in die `.env` schreibt) |
| Kommentare | `server.js` 13, `public/app.js` 16, `public/style.css` 3, `auth.js` 1, `keys.js` 1, `keytool.js` 3. Der Kommentar in `keytool.js`:20 nennt `SICHERUNG_MS_JE_MB`; die Konstante heißt `BACKUP_MS_PER_MB` |
| Beispieldateien | BA 11 |

„Kopie" bleibt, wo eine Kopie von `./data` gemeint ist (`README.md`:333, 809,
896, 921, 1137, 1139, 1184, 1189).

**Die Wächter:**

1. `SCREEN_BAN` (`test/dom.js`:1466) bekommt `Sicherung(?!\s+der\s+Datenbank)`
   und `\bsichern\b`. Die Ausnahme `Kopien?\b(?!\s+der\s+Datenbank)` entfällt,
   weil kein Bildschirmtext sie mehr braucht. Die Prüfung der benannten
   Ausnahmen (`test/source.js`:2547 und :2552) nennt stattdessen
   „vollständige Sicherung der Datenbank".
2. Ein neuer Wächter liest `README.md`, `manual-de.md`, die Kommentare von
   `.env.example` und `docker-compose.example.yml` und die Ausgaben von
   `keytool.js`, `keytool.sh` und `keys.js`. Das alte Wort darf dort nur in
   „Sicherung der Datenbank" und in den Pfaden stehen.

Prüfungen, die den alten Wortlaut festhalten, gehen mit: `test/source.js`:1577
und die Prüfungen der Karten in `test/ui_system.js` ab Zeile 3530.

### BA 11 — Die Beispieldateien

Je Einstellung eine Überschriftzeile und höchstens vier Zeilen darunter:
wofür, was sie bewirkt, wovon sie abhängt. In der Compose-Datei höchstens vier
Kommentarzeilen je Eintrag. Die herausfallenden Begründungen stehen in den
Änderungsprotokollen, in denen sie entschieden wurden; README und Handbuch
nehmen sie nicht auf. Eine bestehende `.env` bleibt unberührt.

**`.env.example`, vollständig:**

```
# Vor dem ersten Start nach .env kopieren:  cp .env.example .env
# Ohne .env bricht docker compose ab. Alle Werte duerfen leer bleiben.


# ---------------------------------------------------------------------------
# ENCRYPTION_KEY -- der Schluessel der Datenbank.
# Leer: der erste Start erzeugt ihn unter data/encryption.key.
# Fuer echten Schutz den Wert aus dem Systembereich hier eintragen und .env
# nicht ins selbe Backup wie data/ legen. Ohne Schluessel sind die Daten
# verloren. Nicht von Hand aendern, solange Daten da sind (siehe unten).
ENCRYPTION_KEY=


# ---------------------------------------------------------------------------
# BEHIND_PROXY -- steht ein Reverse Proxy davor?
# Leer: Kriterion ist direkt erreichbar (Heimnetz, Port 3100).
# 1: ein Reverse Proxy mit HTTPS steht davor. Kriterion wertet dann dessen
# X-Forwarded-Kopfzeilen aus.
# BEHIND_PROXY=


# ---------------------------------------------------------------------------
# PUBLIC_ADDRESS -- die Adresse, unter der Kriterion von aussen erreichbar ist.
# Ohne Mailversand optional. Mit Mailversand Pflicht: ohne sie verschickt
# Kriterion keine Links, und die Selbstanmeldung laesst sich nicht einschalten.
# Hinter einem Reverse Proxy beginnt sie mit https://.
# PUBLIC_ADDRESS=https://kriterion.beispiel.de


# ---------------------------------------------------------------------------
# NICHT IN DIESER DATEI
# Benutzer und Passwort: beim ersten Aufruf im Browser. Passwort vergessen:
#   docker compose exec kriterion node usertool.js passwort <name>
# Port und Ort des Backups: docker-compose.yml.
# Mailzugang: in der Oberflaeche, Karte "Mailversand".


# ---------------------------------------------------------------------------
# DEN SCHLUESSEL WECHSELN -- nur auf dem Server:
#   ./keytool.sh zeigen      # Lage ansehen, aendert nichts
#   ./keytool.sh wechseln    # anhalten, Backup, wechseln, starten
# Backups von vor dem Wechsel oeffnen sich nur mit dem alten Schluessel. Das
# Skript laesst ihn auskommentiert hier stehen: nicht loeschen.
```

**`docker-compose.example.yml`, die Kommentare:**

```
    volumes:
      - ./data:/app/data
      # Das Backup. Die Vorgabe liegt im Projektordner und wandert beim Update
      # mit nach kriterion-alt. Sicherer ausserhalb; dann beide Zeilen aendern:
      #   - ../kriterion-sicherung:/sicherung
      #   - BACKUP_DIR=/sicherung
      - ./kriterion-sicherung:/app/sicherung
    environment:
      - PORT=3000
      # Zeitzone des Containerprotokolls. Gespeicherte Zeiten bleiben UTC.
      - TZ=Europe/Berlin
      # Ohne diese Zeile bleibt die Karte "Backup" aus. Sie gehoert zur
      # Einhaengung oben.
      - BACKUP_DIR=/app/sicherung
```

Die Zeilen ohne `#` bleiben Zeichen für Zeichen, wie sie sind.

### BA 12 — Der Prüfstand

| | was gehalten wird |
|---|---|
| 1 | Die Zahl der festen Wartezeiten in `test/` ist genau die der bleibenden, und jede bleibende hat einen Kommentar |
| 2 | Eine Datenbank von 0.40.0 hat nach dem Start `comment_videos`; keine andere Tabelle hat sich geändert |
| 3 | Ein Kommentar nimmt ein Video mit Standbild an. Ohne Standbild, über 20 MB, mit falschem Typ oder als siebtes Bild oder Video wird abgesagt |
| 4 | `/api/comment-videos/:id/raw` antwortet auf Range mit 206 und `Content-Range`, auf eine ungültige mit 416; `?size=thumb` liefert ein Bild |
| 5 | Löschen: Verfasser ja; Admin ja, und `images_removed` steigt; jeder andere 403 |
| 6 | Rundlauf mit Format 19: das Video kommt Byte für Byte gleich zurück, samt Standbild. Eine Datei mit Format 18 kommt weiter herein |
| 7 | Papierkorb: `trash_bytes` enthält Video und Standbild byte-gleich; das Zurückholen stellt beide her |
| 8 | Die Bildansicht zeigt für Foto, Video, Kommentarbild und Kommentarvideo einen Link mit `download` auf die richtige Adresse |
| 9 | Die Rechnung des Hinweisfelds hält es an beiden Rändern in der Zeitleiste; die Regel hat `width: max-content` |
| 10 | Mit Fokus steht die Formatierleiste in `.markup-wrap` direkt über dem Feld, mit `position: sticky`. Das Menü an einer Auswahl steht weiter absolut |
| 11 | Eine Anfrage mit beiden Cookies gegen fremde Formulare bekommt die Löschung des anderen. Die nächste schreibende Anfrage gelingt |
| 12 | Der Dialog zeigt die beiden Sätze, die beiden Karten den neuen Wortlaut. Nach dem Dateiimport nennt die Meldung die zugefallenen Verfasser |
| 13 | `SCREEN_BAN` meldet das alte Wort und lässt „Sicherung der Datenbank" durch. Der neue Wächter über README, Handbuch, Beispieldateien und Serverausgaben ist grün |
| 14 | Jeder Befehl `node <datei>.js` in `.env.example` nennt eine Datei, die es gibt. Die Kommentarzeilen je Einstellung halten die Regel aus BA 11 |

**Gegenproben**, je eine: eine feste Wartezeit kommt in ein Modul zurück · der
Range-Zweig der Route für Kommentarvideos fällt weg · der Import kodiert ein
Kommentarvideo als Bild · der Papierkorb kopiert das Standbild nicht · der
Link verliert `download` · die Verschiebung des Hinweisfelds fällt weg · die
Leiste wird nicht angedockt · die Löschung des anderen Cookies fällt weg · ein
Wert in `de.json` sagt wieder „Sicherung" · `.env.example` nennt wieder
`zugang.js`.

### BA 13 — Dokumentation und Zahlen

- **`Doku/Aenderungsprotokoll_0.41.0.md`** mit den Messungen am fertigen
  Stand: Laufzeit des Prüfstands vorher und nachher (je drei volle Läufe, der
  mittlere Wert), die bleibenden Wartezeiten mit Grund, Hinweisfeld und
  Formatierleiste vorher und nachher, Zeilen der Beispieldateien vorher und
  nachher.
- **`CHANGELOG.md`** — `## [0.41.0]` mit einem Kasten: die Datenbank bekommt
  beim ersten Start die Tabelle `comment_videos`, zu tun ist nichts; das
  Austauschformat ist 19, eine ältere Fassung übergeht die Kommentarvideos;
  die eigene `.env` bleibt, wie sie ist.
- **`manual-de.md`** — Export und Import (BA 9), das Wort (BA 10), Videos in
  Kommentaren, der Download in der Bildansicht, „Das Austauschformat trägt die
  Nummer 19."
- **`README.md`** — das Wort (BA 10) und die Beispieldateien (BA 11).
- **`Doku/Fahrplan.md`** — die Zeile 0.41.0 durchstreichen und füllen, Schema
  `ja`, Format `18 → 19`; der Abschnitt bekommt oben „GEBAUT am …".
- **`package.json`** auf `0.41.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand: Prüfungen, Rückbauten (heute
  1.135), Kommentarzeilen je Datei und Summe, Schlüssel der Sprachdateien,
  Regelzeilen des Stilblatts.
- **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum,
  dann in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Was nicht dazugehört

| | Grund |
|---|---|
| Ein Download für alle Fotos eines Eintrags | Vorgabe des Betreibers: nicht nötig |
| Umkodieren von Videos | Das Konzept zu Video schließt `ffmpeg` aus |
| Eine Grenze für die Dauer eines Videos | Der Server kann die Dauer ohne Umkodierer nicht prüfen |
| Spalten in `comment_images` | Sie erreichten bestehende Installationen nur über einen Migrationsblock |
| Pfade, Kennungen und Namen im Prüfstand mit dem alten Wort | Ein neuer Pfad verlegt den Ordner; die Namen sind eine eigene Runde |
| Das alte Wort in Änderungsprotokollen und im CHANGELOG | Sie halten fest, was zu ihrer Zeit galt |
| Eine Höchsthöhe für das Kommentarfeld | Sie änderte, wie sich ein langer Kommentar schreibt |
| Eine Änderung am Ablauf von Export, Import und Backup | Vorgabe des Betreibers |

---

## 6. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Der Bestand bleibt unberührt. Die einzige Änderung an einer bestehenden
   Datenbank ist die neue Tabelle.
3. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Gemessen wird am fertigen Stand. Wird eine veröffentlichte Zahl korrigiert,
   steht daneben, warum.
6. Kommt eine Frage auf, die hier nicht beantwortet ist, wird der einfachere
   Weg gewählt, der kein Verhalten ändert. Die Entscheidung steht im
   Änderungsprotokoll.
