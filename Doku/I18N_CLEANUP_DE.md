# Auftrag für Claude Code: Bereinigung & Schärfung der deutschen Lokalisierung (`de.json`)

## 1. Ziel & Leitplanken
Die Datei `de.json` ist die Quelle aller Texte (Source of Truth) für **Kriterion** (Bewertungs- und Entscheidungsportal mit Admin-Bereich). 
Bisherige Texte leiden unter geschwätzigen Erklärungen, Entwickler-Jargon und flapsigem Ton.

**Dein Auftrag:**
1. **Code-Lecks entfernen:** Technische Konstanten aus `de.json` in den Quellcode verlagern.
2. **Texte schärfen & straffen:** Formuliere alle Texte **so kurz, präzise und schnörkellos wie möglich**. Kürzungen erfolgen ausschließlich durch das Streichen von Jargon, Füllwörtern und Paternalismus – der funktionale Sinngehalt bleibt vollständig erhalten.
3. **Tonfall:** Sachliches, modernes und professionelles „Du“ (Linear-/Notion-Stil).

---

## 2. Phase 1: Code-Lecks im Repository refaktorisieren & löschen
Folgende Keys enthalten keinen Text, sondern technische HTML-Attribute, Pixelwerte oder Query-Strings.

**Schritte:**
1. Suche im gesamten Repository (`grep`), wo diese Keys aufgerufen werden.
2. Ersetze die Aufrufe direkt in den Templates/Komponenten durch den festen technischen Wert.
3. Lösche diese Keys anschließend restlos aus `de.json`.

| Zu entfernender Key | Fester Wert im Code | Zweck / Zielort |
| :--- | :--- | :--- |
| `entry.targetBlank` | `"_blank"` | HTML-Link-Attribut in Templates |
| `entry.linkRel` | `"noopener,noreferrer"` | Sicherheitsattribut in Templates |
| `entry.imagePrefix` | `"image/"` | MIME-Präfix in Upload-Validierung |
| `list.px10` / `list.px20` | `"10px"` / `"20px"` | CSS-Werte ins Stylesheet |
| `card.composeFile` | `"docker-compose.yml"` | Dateiname in Code/Doku |
| `card.filesQuery` | `"&files=1"` | URL-Parameter in API-/Routing-Client |
| `card.photosQuery` | `"photos=1"` | URL-Parameter in API-/Routing-Client |
| `card.videosQuery` | `"&videos=1"` | URL-Parameter in API-/Routing-Client |
| `list.thumbQuery` | `"?size=thumb"` | Image-Query in Bild-Service |
| `card.partQuery` | `"&from={from}&to={to}&part={part}&parts={n}"` | URL-Builder im Routing-Code |

---

## 3. Phase 2: Geschärfte Texte für `de.json`

Übertrage die folgenden geschärften Texte in `de.json`. Variablen (`{name}`, `{count}`, `{bytes}` etc.) müssen exakt erhalten bleiben.

### A. Frontend, UI & Navigation (Prägnant & schlicht)
| JSON-Key | Bisheriger Text (flapsig / lang) | Zieltext (kurz, präzise, professionell) |
| :--- | :--- | :--- |
| `list.pillHint` | *„Ein Klick auf eine der drei Pillen setzt den Filter selbst.“* | *„Klick auf eine Filterschaltfläche übernimmt die Auswahl.“* |
| `server.criteriaConflict` | *„...in einem anderen Kasten als hier...“* | *„...in einem anderen Bereich als hier...“* |
| `card.exportWritesHint` | *„...die erwartete Größe steht an den Knöpfen.“* | *„...erwartete Dateigröße steht auf den Schaltflächen.“* |
| `entry.jumpToInput` | *„Zum Schreibfeld springen“* | *„Zum Eingabefeld springen“* |
| `card.fontSizeHint` | *„...Bei sehr großer Schrift wird es an manchen Stellen eng.“* | *„...Sehr große Schrift kann zu Darstellungsfehlern führen.“* |
| `card.likeDevice` | *„Wie das Gerät“* | *„Systemstandard“* |
| `list.hitPlace` | *„Fundstelle“* | *„Suchtreffer“* |
| `list.openGroupedBy` | *„...offen, gruppiert nach “* | *„...offen, sortiert nach “* |
| `entry.tagInputHint` | *„Tag eingeben, Enter bestätigt“* | *„Tag eingeben und mit Enter bestätigen“* |
| `card.calculating` | *„Wird gerechnet …“* | *„Berechnung läuft …“* |

---

### B. Medien & Bildverarbeitung (Keine Codec-Vorträge & „Lauf“-Metaphern)
| JSON-Key | Bisheriger Text (flapsig / lang) | Zieltext (kurz, präzise, professionell) |
| :--- | :--- | :--- |
| `card.storeCaveat` | *„Zur Auflage: Verlustbehaftet lohnt sich nur bei Fotos... der Kodierer kann mit harten Kanten nichts anfangen. Woher ein PNG kommt, lässt sich seinen Bytes nicht ansehen...“* | *„Verlustbehaftete Kompression spart vor allem bei Fotos Speicherplatz. Bei Screenshots mit Text ist verlustfreie Speicherung kleiner und schärfer. Gilt für alle neuen Uploads.“* |
| `card.derivativesWebp` | *„Die Vorschaubilder folgen der Wahl nicht: sie sind immer WebP. Sie sind ohnehin verlustbehaftet, und niemand archiviert sie.“* | *„Vorschaubilder werden zur Optimierung der Ladezeiten immer als WebP gespeichert.“* |
| `card.catchUpAsk` | *„...neu gerechnet... angesehen... Dauer: Minuten bis Stunden.“* | *„Konvertiert {n} PNG-Originale ({bytes}) zu WebP (erwartet: ca. {after}) und erneuert veraltete Vorschaubilder. Erfordert vorherige Sicherung. Dauer: Minuten bis Stunden.“* |
| `card.catchUpBoth` | *„Der Lauf stellt {n} PNG-Originale um und sieht dabei jedes Vorschaubild an — was noch JPEG ist, wird neu gerechnet.“* | *„Konvertiert {n} PNG-Originale und aktualisiert veraltete JPEG-Vorschaubilder zu WebP.“* |
| `card.catchUpDerivatives` | *„Der Lauf sieht jedes Vorschaubild an — was noch JPEG ist, wird neu gerechnet. Die Originale bleiben unberührt.“* | *„Aktualisiert alle JPEG-Vorschaubilder zu WebP. Originale bleiben unverändert.“* |
| `card.convertCounts` | *„...Vorschaubilder neu gerechnet“* | *„...Vorschaubilder neu generiert“* |
| `card.convertProgress` | *„Umstellung läuft — {done} von {total} angesehen …“* | *„Konvertierung läuft — {done} von {total} verarbeitet …“* |
| `card.storePngHint` | *„nichts wird umkodiert — keine Rechenzeit, größte Ablage“* | *„Originale unverändert speichern — keine Konvertierung, maximaler Speicherbedarf.“* |
| `card.storeLosslessHint` | *„Vorgabe — kein sichtbarer Verlust, gemessen rund zwei Drittel kleiner“* | *„Standard — verlustfrei, ca. zwei Drittel kleiner.“* |
| `card.nothingToDo` | *„, an {stayed} war nichts zu tun“* | *„, {stayed} bereits aktuell“* |
| `server.videoNeedsStill` | *„Nur ein Video mit Standbild ist erlaubt“* | *„Nur Videos mit Vorschaubild sind zulässig.“* |
| `server.videoStill` | *„Video und Standbild gehören zusammen“* | *„Video und Vorschaubild gehören zusammen.“* |
| `server.stillNoPreview` | *„Aus dem Standbild ließ sich keine Vorschau erzeugen“* | *„Vorschau konnte aus dem Vorschaubild nicht erzeugt werden.“* |
| `server.stillNotImage` | *„Das Standbild ist keine Bilddatei“* | *„Das Vorschaubild ist keine Bilddatei.“* |

---

### C. Backup, Dateisystem & Speicherverwaltung
| JSON-Key | Bisheriger Text (flapsig / lang) | Zieltext (kurz, präzise, professionell) |
| :--- | :--- | :--- |
| `card.exportPartsHint` | *„Der Export schreibt den gesamten Bestand in {n} Dateien, die das Haus verlassen — mit allen Fotos, allen Anhängen und den Namen aller Verfasser.“* | *„Exportiert den gesamten Datenbestand in {n} Dateien — inklusive Fotos, Anhängen und Verfassernamen.“* |
| `card.backupWritten` | *„Sicherung geschrieben“* | *„Sicherung erstellt“* |
| `card.backupWrittenFile` | *„Sicherung geschrieben: {file} ({bytes})“* | *„Sicherung erstellt: {file} ({bytes})“* |
| `card.keyBesideDb` | *„Der Schlüssel liegt neben der Datenbank“* | *„Schlüssel liegt im selben Verzeichnis wie die Datenbank“* |
| `card.keyStillBeside` | *„Der Schlüssel liegt noch neben der Datenbank“* | *„Schlüssel liegt weiterhin im Datenbankverzeichnis“* |
| `server.backupInDataDir` | *„...eine Sicherung neben dem Original ist keine.“* | *„Sicherungen dürfen nicht im Datenverzeichnis liegen (kein Schutz vor Datenverlust).“* |
| `card.backupDirAdvice` | *„...am besten auf einer anderen Platte — sonst gehen bei einem Fehler am Projektordner Original und Sicherung zugleich verloren...“* | *„Separates Speichermedium empfohlen, um Datenverlust bei Projektordner-Fehlern zu vermeiden.“* |
| `card.backupHint` | *„...auch mit dem, was der Export nicht enthält. Lässt sich nur in dieselbe Programmversion zurückspielen.“* | *„Vollständige Kopie der Datenbank. Kann nur in dieselbe Programmversion wiederhergestellt werden.“* |
| `card.itemOne` / `Many` | *„Sache, Einzahl“* / *„Sache, Mehrzahl“* | *„Element, Einzahl“* / *„Element, Mehrzahl“* |
| `server.backupGone` | *„Diese Sicherung gibt es nicht mehr.“* | *„Sicherung nicht gefunden.“* |
| `card.cleanupAfterBackup` | *„Nach jeder erfolgreichen Sicherung aufräumen“* | *„Nach erfolgreicher Sicherung bereinigen“* |

---

### D. Server-Meldungen & IT-Interna (Kein Schulmeister-Ton)
| JSON-Key | Bisheriger Text (flapsig / lang) | Zieltext (kurz, präzise, professionell) |
| :--- | :--- | :--- |
| `server.backupDirGone` | *„...Er wird nicht angelegt — häng ihn auf dem Server ein.“* | *„Sicherungsordner {folder} existiert nicht. Bitte Verzeichnis auf dem Server einbinden.“* |
| `server.backupDirNotSet` | *„Es ist kein Sicherungsordner eingerichtet. Die docker-compose.yml hängt ihn ein und benennt ihn als BACKUP_DIR — beides gehört zusammen.“* | *„Kein Sicherungsordner konfiguriert (BACKUP_DIR in Server-Konfiguration fehlt).“* |
| `server.exportGrew` | *„...Eine Exportdatei ist ein einziger Text, und der kann nicht größer als {limit} MB werden. Nimm die Sicherung — sie schreibt den ganzen Bestand und braucht dafür keinen nennenswerten Arbeitsspeicher.“* | *„Exportdatei überschreitet das Limit von {limit} MB. Bitte stattdessen die Sicherungsfunktion nutzen.“* |
| `server.backupConcurrent` | *„In dieser Sekunde wurde dort schon eine Sicherung angelegt — bitte noch einmal.“* | *„Ein Sicherungsvorgang läuft bereits. Bitte kurz warten und erneut versuchen.“* |
| `server.subDirOutside` | *„„{folder}“ führt aus dem eingerichteten Sicherungsordner heraus.“* | *„Pfad liegt außerhalb des Sicherungsverzeichnisses.“* |
| `server.subDirForm` | *„...ein führender Schrägstrich und „..“ sind es nicht.“* | *„Führende Schrägstriche und Pfadnavigationen („..“) sind unzulässig.“* |
| `card.languagesFileAfter` | *„...ohne Neubau. Der vordere Teil des Dateinamens ist die Sprachkennung nach BCP 47.“* | *„...ohne Neustart. Dateiname muss dem BCP-47-Sprachcode entsprechen (z. B. de-DE).“* |
| `card.emailsDoubledHint` | *„...beim nächsten Start greift das Schloss von selbst.“* | *„...die Eindeutigkeit wird beim nächsten Neustart erzwungen.“* |
| `server.partExportIncomplete`| *„Ein Teilexport braucht von, bis, teil und teile.“* | *„Parameter für den Teilexport sind unvollständig.“* |
| `server.targetNotNumber` | *„Jedes Ziel ist eine Nummer.“* | *„Jedes Ziel muss eine Zahl sein.“* |
| `server.nameOriginalStays` | *„...er ist der Name der Zeile.“* | *„...ist die feste Originalbezeichnung des Eintrags.“* |

---

### E. Authentifizierung, Benutzer & Mails
| JSON-Key | Bisheriger Text (flapsig / lang) | Zieltext (kurz, präzise, professionell) |
| :--- | :--- | :--- |
| `mail.invite.body` | *„Wer diesen Link hat, kommt herein — gib ihn an niemanden weiter.“* | *„Dieser Link gewährt Kontozugriff — bitte vertraulich behandeln.“* |
| `mail.confirm.body` | *„Er öffnet keinen Zugang und setzt kein Passwort — er sagt nur „ja, das bin ich“... Antworten darauf liest niemand.“* | *„Bestätigt lediglich deine Adresse. Ein Administrator prüft die Anfrage anschließend... Bitte nicht auf diese E-Mail antworten.“* |
| `mail.test.body` | *„Kommt sie an, steht der Mailversand: Einladungen und Rücksetzlinks gehen ab jetzt von selbst hinaus.“* | *„Mailversand erfolgreich eingerichtet. Einladungen und Links werden nun automatisch versendet.“* |
| `card.adminOnlyCategory` | *„Ohne Häkchen legen nur Admins neue Kategorien an; vorhandene kann weiterhin jeder auswählen.“* | *„Deaktiviert: Nur Admins erstellen neue Kategorien; vorhandene bleiben für alle wählbar.“* |
| `card.adminOnlyTag` | *„Ohne Häkchen legen nur Admins neue Tags an; vorhandene kann weiterhin jeder vergeben.“* | *„Deaktiviert: Nur Admins erstellen neue Tags; vorhandene bleiben für alle verfügbar.“* |
| `card.autoDeleteHint` | *„...ein Löschen von Hand gibt es nicht.“* | *„Wird automatisch gelöscht; manuelles Löschen nicht möglich.“* |
| `card.backupUnopenableHint` | *„...beides gehört nicht an denselben Ort.“* | *„Darf sich nicht im selben Verzeichnis befinden.“* |
| `card.titleAfterHint` | *„...hier gehört die aussagekräftige Bezeichnung hin.“* | *„...wird nach der Anmeldung als Bezeichnung angezeigt.“* |
| `card.allCodesUsed` | *„...und das Handy weg...“* | *„...und das Mobilgerät nicht verfügbar...“* |
| `card.openAppHint` | *„Am Rechner tippst du den Schlüssel ohne die Leerzeichen ein.“* | *„Am Computer den Schlüssel ohne Leerzeichen eingeben.“* |
| `card.lastSeen` | *„zuletzt gesehen {lastSeen}“* | *„Zuletzt aktiv: {lastSeen}“* |
| `card.linkUsed` | *„Link eingelöst“* | *„Link bereits verwendet“* |
| `login.linkUnaffected` | *„Dein Link ist davon {word} betroffen — er gilt weiter.“* | *„Dein Link bleibt davon {word} — er gilt weiter.“* |
| `login.linkUnaffectedWord`| *„nicht“* | *„unberührt“* |

---

## 4. Phase 3: Typografie & Syntax-Validierung
1. Anführungszeichen: Verwende in `de.json` durchgehend typografische Anführungszeichen (`„...“`). Korrigiere verbleibende gemischte Quotes (`„...\"`).
2. Validiere abschließend, dass `de.json` syntaktisch 100 % fehlerfreies JSON ist.
3. Gib nach getaner Arbeit eine kurze Zusammenfassung der gelöschten Code-Lecks und bereinigten Zeilen aus.
