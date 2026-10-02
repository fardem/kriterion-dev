# Änderungsprotokoll 0.55.0 — „Proxys für Videos, Wartung und Einstellungen; Punkte aus der Abnahme von 0.54.0“

**Gebaut am 2. Oktober 2026 auf 0.54.0. Fingerprint `064133fa`, davor
`6402677f`.**

Nach `Doku/Auftrag_0.55.0.md` und dem Eintrag 0.55.0 im Fahrplan. Schema: ja,
die Tabelle `proxy_files` und der Trigger `proxy_files_gone`, kein
Migrationsblock. Austauschformat: bleibt 22. Routen: zwei neue,
`GET /api/maintenance` und `POST /api/files/missing`; `DELETE /api/files/unknown`
nimmt jetzt die gewählten Namen; `GET /api/attachments/:id/raw?size=proxy`
liefert den Proxy. Kein neuer Vorgang im Sicherheitsprotokoll. In
`package.json` keine neue Abhängigkeit; im Image ffmpeg 9.0.2 und die
Bibliotheken `libx264-164`, `libva2`, `libva-drm2`, `libdrm2`, `libdav1d6`, auf
amd64 `intel-media-va-driver`.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 30. September 2026 | V3 bis V6, der Wortlaut steht in Abschnitt 0 des Auftrags |
| 1. Oktober 2026 | V1, V2 und V7 bis V16; F1 bis F18 in Fragetafeln, die Antworten in Abschnitt 0 des Auftrags. Anders als empfohlen: F1, F3, F6 und F15 |
| 2. Oktober 2026 | V17 bis V23; F19 bis F32 in Fragetafeln. Anders als empfohlen: F21, F26 und F29 |
| 2. Oktober 2026 | Start des Baus: „starte dann den bau 0.55.0“ |

Beim Bau kam keine Frage auf, die eine Fragetafel brauchte. Die Entscheidungen
im Rahmen des Auftrags stehen in Abschnitt 4.

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.54.0.

| | 0.54.0 | 0.55.0 |
|---|---:|---:|
| Tabellen | 44 | **45** |
| Schreibende Routen | 91 | **92** |
| Routen insgesamt | 129 | **131** |
| Vorgänge im Sicherheitsprotokoll | 22 | 22 |
| Ausgelieferte JavaScript-Dateien | 18 | **19** |
| Abhängigkeiten in `package.json` | 7 | 7 |
| Pakete nach `npm install` | 173 | 173 |
| Zeilen `server.js` | 7.931 | **8.372** |
| Zeilen `public/app.js` | 12.310 | **12.528** |
| Zeilen `videoproxy.js` | — | **172** |
| Zeilen `batchrun.js` | 154 | **167** |
| Schlüssel je Sprachdatei | 1.489 | **1.552** |
| Regelzeilen des Stilblatts | 2.003 | **2.005** |
| Kommentarzeilen im Stilblatt | 514 | 514 |
| Kommentarzeilen | 7.148 in 54 Dateien | **7.234 in 57** |
| Dateien des Prüfstands samt `counterproof.js` | 35 | **37** |
| Rückbauten | 1.575 | **1.678** |
| Prüfungen im Prüfstand | 8.110 | **8.232** |
| Zeilen `CHANGELOG.md` | 1.471 | **1.491** |

README und Anleitung, Zeilen:

| | englisch | deutsch | türkisch |
|---|---:|---:|---:|
| README | 710 (`README.md`, vorher 636) | 713 (`README-de.md`, vorher 638) | 714 (`README-tr.md`, vorher 639) |
| Anleitung | 932 (`manual.md`, vorher 882) | 950 (`manual-de.md`, vorher 900) | 936 (`manual-tr.md`, vorher 887) |

Das Image für amd64, gebaut am 2. Oktober 2026 in dieser Sitzung mit 4 CPUs:

| | 0.54.0 | 0.55.0 |
|---|---:|---:|
| Größe | 307.818.823 Bytes | **344.868.469 Bytes** |
| Bau ohne Cache | 31 s | **192 s** |

Von den 37,0 MB mehr sind 17,9 MB ffmpeg und 19,1 MB die Bibliotheken mit dem
Intel-Treiber. Vom Bau entfallen 157 s auf das Übersetzen von ffmpeg. Das
Messverfahren nannte für das Image aus `node:22-bookworm-slim` und ffmpeg 264
statt 227 MB, also dieselben 37 MB.

Die Obergrenzen der Kommentarzeilen steigen: `server.js` 1.054 → 1.089
(Abgleich, Prüfung der Datenbank, Warteschlange und Umwandlung der Proxys),
`public/app.js` 1.187 → 1.199 (Kopie aus „Ganz laden“, Karte „Abgleich“,
Umschalter, Karte „Proxy“, Adresse des Proxys), `attachments.js` 68 → 69,
`batchrun.js` 14 → 15 (Aufgabe `check`); `test/dom.js` 172 → 175,
`test/frame.js` 122 → 125 (`testMp4` aus `test/release_052.js`),
`test/release_048.js` 16 → 17, `test/source.js` 216 → 217. Neu sind
`videoproxy.js` mit 24, `test/release_055.js` mit 6 und `test/ffmpeg.js` mit 4.
Es sinken `test/release_052.js` 8 → 6 und `test/ui_system.js` 190 → 187.

---

## 3. Was gebaut ist

**Proxys** (B1). Neues Modul `videoproxy.js`: `needsProxy()` nach F24,
`videoBitRate()` nach F21 (0,23 Mbit je Bild, höchstens 7,5 Mbit/s, ohne
Bildrate wie 30), `wayOf()` mit den Wegen A, B und C, `ffmpegArgs()` wie im
Messverfahren mit `-noautorotate`, Keyframe alle 2 Sekunden, `-maxrate` gleich
der Bitrate und `-bufsize` doppelt so groß, `tmpState()` aus `/proc/mounts` und
`statfs`, `run()` mit leerer Umgebung, `workDir()` mit den Rechten 0700 und
`probe()` mit dem Test aus Abschnitt 2 des Messverfahrens. ffmpeg läuft nur,
wenn Kriterion root ist, unter der Nummer 65534 mit der Gruppe von
`/dev/dri/renderD128`, gestartet über `nice -n 19`. In `server.js` die
Warteschlange `proxySoon()` (neue Videos vor dem Bestand, fehlgeschlagene
einmal je Start), `originalServer()` (das Original entschlüsselt über
`127.0.0.1` und eine Marke je Lauf), `sealProxy()` (Verschlüsseln nach
`data/files/proxy/` in Blöcken von 8 MiB), `proxyLost()` und
`proxyFilesThere()` (eine Zeile ohne Datei fällt weg, das Video wartet wieder)
und `sweepProxyDir()` (Dateien ohne Zeile). Tabelle `proxy_files` an
`disk_files` mit `ON DELETE CASCADE`, Trigger `proxy_files_gone` in `db.js`;
`sweepDisk()` löscht `proxy/<Name>`. `?size=proxy` geht über `sendDiskFile()`,
das dafür Datei, Namen und den Umgang mit einer fehlenden Datei übernimmt.
`playsAsVideo()` lässt `mkv`, `avi`, `wmv` und `flv` erst mit fertigem Proxy
als Video gelten: Vorschau, Standbild, Stelle im Video und Kachel.
`mediaKind()` nimmt die vier Endungen in die Analyse.

Im Browser: `playSource()` nimmt den Proxy, die Adresse trägt seine Größe als
`v=`. Der Knopf „Original“ im Vollbild wechselt an derselben Stelle, nur für
dieses Abspielen; `show()` setzt ihn zurück. Lässt sich der Proxy nicht
spielen, spielt das Original ohne Meldung. „Ganz laden“ misst am Proxy. Das
Standbild entsteht aus dem Proxy. Die Karte „Proxy“ unter „Installation“:
Schalter für den Eigentümer-Admin, sonst ein Satz; Quick Sync mit Treiber oder
der Grund dagegen; RAM unter `/tmp`; fertige, wartende und fehlgeschlagene
Proxys. „Erweiterte Infos“ hat die Gruppe „Proxy“.

**Image und Compose** (B1). Ein dritter Abschnitt im `Dockerfile` übersetzt
ffmpeg 9.0.2 mit den Einstellungen aus `bau_schlank()`; die Laufzeit installiert
die Bibliotheken und auf amd64 den Intel-Treiber. `docker-compose.example.yml`:
`tmpfs: - /tmp:size=2g`, `devices: - /dev/dri:/dev/dri` auskommentiert.

**„Ganz laden“ auf Knopfdruck** (B2, Commit `59274d0`). Beim Abspielen lädt der
Browser die Datei nicht mehr ein zweites Mal. Nur der Knopf „Ganz laden“ im
Vollbild lädt sie ganz: Das Video hält an, der Player hat währenddessen keine
Quelle und lädt nichts nach, danach spielt es aus der Kopie an derselben Stelle
weiter. Ein zweiter Druck bricht ab. Die letzte Kopie bleibt bis zum Neuladen
der Seite oder bis zur nächsten (F25).

**Wartung** (B3, Commit `1ab7df8`). Den Knopf „Abgleich“ in „Speicher und
Wartung“ sieht nur der Eigentümer-Admin (F27). `GET /api/maintenance` nennt jede
Datei unter `data/files/` ohne Verweis, mit jedem Namen, dazu Verzeichnisse und
symbolische Links. Löschen dürfen nur drei Fälle: ein Name, den Kriterion nicht
anlegt; eine Kopie gleicher Länge im Backup-Ordner; kein Backup nennt den
Namen. Hat ein Backup keine Dateiliste, gilt der dritte Fall nicht, wie ohne
Backup-Ordner. `DELETE /api/files/unknown` löscht die gewählten Namen,
`POST /api/files/missing` holt fehlende Dateien aus dem Backup-Ordner zurück;
beides unter der Sperre des Backups. Die Prüfung der Datenbank
(`quick_check(20)` und `foreign_key_check`) läuft als Aufgabe `check` in
`batchrun.js`. Eine fehlende Datei zeigt „fehlt“ an ihrer Kachel.
`GET /api/stats` nennt die freien Seiten der Datenbank, die Karte „davon frei“.

**Einstellungen** (B4, Commit `0306882`). Neuer Abschnitt „Backup“ mit
„Backup“, „Alte Backups“ und „Export und Import“. „Kennzahlen“ ist geteilt in
„Kennzahlen“, „Speicher und Wartung“ und „Version und Verschlüsselung“.
„Zweiter Faktor“ ist eine eigene Karte neben „Mein Account“. Die Linkzeilen
stehen in „Darstellung“, „Vokabular“ ist eine breite Karte (F28). Ein Benutzer
sieht nur „Persönlich“ und holt Titel, Kategorien, Tags und Kriterien nicht
mehr (F30). Gesperrte Felder sieht ein Admin als Text: Grenzen beim Hochladen
und Modus „Potenzial“ (F31). Den Hinweis auf den Schlüssel neben der Datenbank
sieht nur der Eigentümer-Admin (F32). Wo `serverBox()` keinen Befehl zeigt,
steht „Wende dich an einen Admin, der dir dabei helfen kann.“ (V22).

**Anleitung und README.** In drei Sprachen: der Abschnitt „Proxys für Videos“
in der README mit `tmpfs`, `noswap`, `/dev/dri`, der Tafel der Firmware und den
drei Befehlen zum Prüfen; die Konfiguration nennt `devices` und `tmpfs`; die
Zeile „Dateien“ nennt „Ganz laden“ auf Knopfdruck und den Proxy. Die Anleitung
beschreibt den Proxy unter „Dateien“, die Gruppe „Proxy“ der Erweiterten Infos,
die Karte „Proxy“ und den Abschnitt „Abgleich“.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Weg A scheitert | danach Weg B | So hält es das Skript des Messverfahrens; eine Datei, die Quick Sync nicht dekodiert, bekommt trotzdem einen Proxy |
| Ungerade Pixel | die kürzere Seite auf eine gerade Zahl abgerundet (`trunc(ih/2)*2`) | `libx264` bricht bei ungerader Höhe ab |
| Priorität 19 | ffmpeg startet über `nice -n 19` statt `os.setPriority()` (Auftrag, Abschnitt 3) | Docker gibt root kein `CAP_SYS_NICE`. `os.setPriority()` scheiterte am Prozess unter 65534 ohne Meldung; im Image lief ffmpeg mit Priorität 0. `nice` senkt die Priorität des eigenen Prozesses, dafür braucht es kein Recht |
| Ausschalten während einer Umwandlung | ffmpeg wird beendet, die Tabelle bekommt keinen Fehlschlag | Ein Fehlschlag würde erst beim nächsten Start neu versucht |
| Adresse des Proxys | `?size=proxy&v=<Größe>` | Der Browser hält die Antwort eine Stunde; ein neu angelegter Proxy braucht eine neue Adresse |
| Schlüssel des Originals | über `diskFileOf()` | `test/source.js` lässt `file_key` nur an wenigen Stellen lesen; neu ist nur `qProxyFile` |
| Treiber ohne Namen | „VA-API“ aus `videoproxy.js` | Die Karte trägt keinen festen Text |
| Arbeitsverzeichnis | `kriterion-video-` statt `kriterion-proxy-` unter `/tmp` | `kriterion-proxy-` nutzen die Prüfungen des Reverse Proxy |
| Beenden während einer Umwandlung | `proxyStop()` löscht auch das Verzeichnis | ohne Neustart des Containers bliebe es sonst unter `/tmp` |
| Fehlschlag ohne Zeile in der Liste | „zu wenig RAM in /tmp“, „zu wenig Platz auf der Platte“, „abgebrochen, dauerte zu lange“, sonst die letzte Zeile von ffmpeg | drei Gründe kennt der Server selbst |
| Wort für die Elemente des Abgleichs | „Dateien ohne Verweis“, auch für Verzeichnisse und Links | „Eintrag“ ist ein Wort des Vokabulars, „Element“ steht auf der Verbotsliste der Oberfläche |
| Türkischer Name des Abgleichs | „Eşleştir“ | „Karşılaştır“ ist schon der Vergleich von Einträgen |
| Prüfung der Datenbank | die Route wartet höchstens 20 s, dann fragt die Karte alle 2 s nach | ein Reverse Proxy bricht nach 60 s ab |

Die Dauer der Prüfung ist gemessen am 2. Oktober 2026 ohne Last, an einer
Datenbank mit SQLCipher von 131,1 MB (2.000 Fotos zu 100 KB und 50.000
Kommentare, je die Hälfte gelöscht), 4 CPUs, drei Läufe:

| | Lauf 1 | Lauf 2 | Lauf 3 |
|---|---:|---:|---:|
| `quick_check(20)` | 633 ms | 594 ms | 575 ms |
| `foreign_key_check` | 123 ms | 115 ms | 114 ms |

Bei rund 0,2 GB/s braucht eine Datenbank von 2 GB etwa 10 s, weniger als die
20 s, die die Route wartet.

---

## 5. Der Prüfstand

Neues Modul `test/release_055.js` auf der Portbasis 7340, eingetragen hinter
`release_054`. Neu ist auch `test/ffmpeg.js`: Mit dem Prüfstandschalter
`ffmpeg=1` startet `videoproxy.js` ihn statt ffmpeg, ebenfalls über
`nice -n 19`. Er liest das Original über die Adresse hinter `-i` und schreibt
eine kleine MP4 mit dem SHA-256 des Originals, den Namen der Umgebung, der
Priorität, den Rechten des Verzeichnisses und den Argumenten. `qsv=1` lässt
den Test von Quick Sync gelingen, `qsv=2` nur ohne feste Bitrate wie ohne
HuC-Firmware; `ffmpegfail=1` bricht ab, `ffmpegfail=2` nur auf Weg A;
`ffmpeghold=<ms>` wartet vor dem Schreiben. `checkwait` verkürzt die Wartezeit
der Route auf die Prüfung der Datenbank.

| Gruppe | Prüfungen |
|---|---:|
| Wartung: der Abgleich nennt jeden Eintrag ohne Verweis | 7 |
| Wartung: Loeschen nach Namen | 6 |
| Wartung: ohne Backup-Ordner und mit einem Backup ohne Liste | 4 |
| Wartung: fehlende Dateien | 9 |
| Wartung: waehrend eines Backups | 1 |
| Wartung: Pruefung der Datenbank | 7 |
| Proxy: Auswahl, Bitrate und Weg | 10 |
| Proxy: Umwandlung mit dem Ersatz fuer ffmpeg | 15 |
| Proxy: die vier Endungen, Pixel und Auswahl im Server | 4 |
| Proxy: Fehler, Neustart und fehlende Datei | 6 |
| Proxy: Papierkorb, Backup und Export | 5 |
| Proxy: ohne Quick Sync, ohne Firmware und Schalter aus | 7 |
| Wartung: die Karte | 12 |
| Wartung: „fehlt“ an der Datei | 2 |
| Proxy: Abspielen und Umschalter | 9 |
| Proxy: Standbild, die vier Endungen und Erweiterte Infos | 4 |
| Proxy: die Karte | 5 |

**Angepasst:** `test/release_052.js` (die Gruppe „Video ganz laden“ auf
Knopfdruck, `testMp4` nach `test/frame.js`); `test/release_053.js` (39
Fingerprints im CHANGELOG); `test/release_048.js` (Löschen nach Namen; die
Prüfung zu `DISK_WRITING` nimmt eine Datei aus der Tabelle, die der Start
umlagert);
`test/dom.js` (Mock der drei Routen der Wartung, `stats.proxy`);
`test/roundtrip.js` (92 schreibende und 39 lesende Routen, 45 Tabellen mit
`proxy_files`, drei Abschnitte auf demselben Image, neun Einstellungen nur
für den Eigentümer-Admin); `test/source.js` (19 ausgelieferte Module, 57 Dateien,
`videoproxy.js` in jeder Liste, Grenze 1 für Versionsnummern im `Dockerfile`);
`test/selfcheck.js` (Grenzwerte, 57 Dateien, 1.678 Rückbauten);
`test/release_041.js` (`tmpfs` in der Compose-Datei, Kartenschlüssel mit
`proxy`); `test/ui_style.js` (Knopf „Original“); `test/frame.js` (`testMp4`,
die neuen Routen); `testbench.js` (`release_055`). Für die neue Aufteilung der
Einstellungen: `test/ui_system.js`, `test/ui_entry.js`, `test/ui_inventory.js`,
`test/ui_language.js`, `test/ui_overview.js`, `test/release_031.js`,
`test/release_042.js`, `test/release_051.js` und `test/release_054.js`.

**Rückbauten.** 1672 bis 1774 neu, einer je Zusage: 1672 bis 1675 (B2), 1676
bis 1688 (B4), 1689 bis 1712 (B3), 1713 bis 1774 (B1). Neue Suchtexte, weil
ihre Stellen sich geändert haben: 1568, 1571 bis 1573, 1575 und 1578 (B2);
561, 562, 639, 640, 801 und 1660 (B4); 1395, 1396, 1399 und 1400 (B3); W14,
1317, 1403, 1447, 1473, 1532, 1557 und 1575 (B1); 1725 (`nice`).

Gefahren in drei Teilen:

- B2 und B4 am Stand `0306882` mit `counterproof.js`, der je Rückbau den
  ganzen Prüfstand fährt: 1576 bis 1578, 1672 bis 1688, 561, 562, 639, 640,
  801 und 1660, 26 Stück. **Alle rot.** Bei 1675 und 1687 waren in
  `test/roundtrip.js` je sechs weitere Prüfungen rot (Umlagerung beim Start nach
  10 s nicht fertig); beide ändern nur `public/app.js`, die Ursache war die Last
  aus vier Spuren.
- B3 am Stand `1ab7df8` ebenso: 1395, 1396, 1399 und 1400 rot. Danach ist der
  Lauf abgebrochen, weil ein Rückbau mit dem ganzen Prüfstand rund 10 Minuten
  braucht.
- Am fertigen Stand mit einem Treiber, der je Rückbau eine Kopie des
  Arbeitsbaums anlegt und nur das Modul der erwarteten Gruppe fährt, mit
  höchstens vier Spuren: 1689 bis 1774 an `test/release_055.js`, W14 an
  `test/source.js`, 1317 an `test/release_046.js`, 1403 an
  `test/release_048.js`, 1447 an `test/release_049.js`, 1473 an
  `test/release_050.js`, 1532, 1557 und 1568 bis 1578 an `test/release_052.js`.
  Damit sind auch 1568, 1571 bis 1573 und 1575 gefahren, die im ersten Teil
  fehlten.

Im dritten Teil blieben fünf stumm:

- 1712, die Karte fragt nicht nach: `until()` warf nach 6 s, und das Modul brach
  ohne rote Prüfung ab. Das Warten endet jetzt ohne Ausnahme, die Prüfung wird
  rot.
- 1753, Ausschalten beendet ffmpeg nicht: Die Prüfung wartete 4,5 s, bis dahin
  war der Ersatz mit `ffmpeghold=4000` ohnehin fertig. Sie verlangt jetzt, dass
  die Umwandlung 1,5 s nach dem Ausschalten beendet ist.
- 1763, der Umschalter springt an den Anfang: JSDOM setzt `currentTime` bei
  einer neuen Quelle nicht auf 0. Im Test tut der Player das jetzt wie ein
  Browser.
- 1764, `show()` setzt den Umschalter nicht zurück: Die Prüfung öffnete das
  Vollbild neu, und das legt den Zustand ohnehin neu an. Neu ist eine Prüfung,
  die im Vollbild weiter- und zurückblättert.
- 1403, der Lauf über `upload/` beachtet `DISK_WRITING` nicht: Seit 0.50.0 legt
  ein Upload die Datei direkt auf der Platte an, und das Verschieben in einen
  Ordner lagert nichts mehr um. Damit fehlte im Test das Zeitfenster, in dem nur
  `DISK_WRITING` die Datei schützt. Die Prüfung legt jetzt den Inhalt einer
  Datei zurück in die Tabelle; der Start lagert ihn mit `hold=1500` um, und der
  Lauf alle 300 ms trifft das Zeitfenster.

Nach den Korrekturen ist 1403 rot. Die 21 Rückbauten der drei geänderten
Gruppen von `test/release_055.js` (1705 bis 1707, 1709, 1712, 1727, 1728, 1753
bis 1766) sind noch einmal gefahren, **alle rot**. Bei 1734, 1741, 1744, 1747
und 1771 bricht das Modul nach der roten Prüfung ab, weil der Rückbau eine
spätere Wartezeit nicht enden lässt; gezählt wird die rote Prüfung in der
erwarteten Gruppe. Damit sind alle 103 neuen und die 23 umgestellten
Rückbauten rot gefahren. Eine volle Gegenprobe ist nicht gefahren.

**Im Image.** Gebaut aus dem Arbeitsbaum mit dem `Dockerfile` des Repositorys;
nur die Bauphase bekam für `npm ci` das Zertifikat des Proxys dieser Sitzung.
Container mit `--tmpfs /tmp:size=2g`, ohne `/dev/dri`:

- Die Karte nennt „/dev/dri ist im Container nicht eingebunden“ (`noDevice`)
  und `/tmp` im RAM mit 2 GiB.
- Ein 4K-Video in H.264, 6 s mit 25 Bildern je Sekunde, 42.183.229 Bytes: Nach
  dem Einschalten ist der Proxy nach 3 s fertig, Weg C, 1920×1080, H.264 High,
  `yuv420p`, 4.643.924 Bytes. Das Server-Log meldet „Proxy for file 1 made in
  3 s (way C).“
- Ein 4K-Video in H.264, 30 s mit 30 Bildern je Sekunde, 226.347.512 Bytes:
  Proxy nach 11 s, 26.512.977 Bytes.
- Während der Umwandlung läuft ffmpeg unter der Nummer 65534 und der Gruppe
  65534, mit Priorität 19, in `/tmp/kriterion-video-*` mit den Rechten 0700.
  Danach ist `/tmp` leer. Der Proxy unter `data/files/proxy/` ist
  verschlüsselt (kein `ftyp`), mit den Rechten 0600.
- Ohne `--tmpfs` nennt die Karte „/tmp liegt nicht im RAM; Kriterion wandelt
  nicht um“. Das Video wartet.

Im ersten Lauf im Image lief ffmpeg mit Priorität 0: `os.setPriority()`
scheiterte am fehlenden `CAP_SYS_NICE`, der Fehler blieb im `catch`. Der
Prüfstand sah das nicht, weil sein Ersatz unter derselben Nummer wie Kriterion
läuft. Seitdem startet ffmpeg über `nice -n 19` (Abschnitt 4); die Prüfung
„Im Container startet ffmpeg über nice -n 19“ und Rückbau 1774 sind neu,
Rückbau 1725 nimmt jetzt `nice` aus dem Weg des Prüfstands.

Der volle Lauf vor dem Push: **8.232 von 8.232** Prüfungen bestanden, im ersten
Anlauf.

---

## 6. Nicht geprüft und offen

- Eine echte Umwandlung mit Quick Sync ist hier nicht möglich: Die Sitzung hat
  kein `/dev/dri`. Geprüft ist Weg C mit dem gebauten ffmpeg im Image (Abschnitt
  5).
- Das Image für arm64 ist nicht gebaut.
- Ob Proxys der Hochkant-Videos aus Weg A mit ffmpeg 9.0.2 aufrecht stehen,
  prüft der Betreiber (V19, Abnahme 18).
- Videos in HLG, mkv mit Untertiteln und Dateien mit mehreren Videospuren sind
  nicht gemessen; ffmpeg wählt je eine Video- und eine Tonspur nach seiner
  eigenen Regel.
- Die türkischen Texte hat kein Muttersprachler gelesen.
- Die Abnahme im Betrieb nach Abschnitt 5 des Auftrags führt der Betreiber
  durch.
