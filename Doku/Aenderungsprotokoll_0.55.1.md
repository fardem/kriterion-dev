# Änderungsprotokoll 0.55.1 — „Punkte aus der Abnahme von 0.55.0: der Knopf im Vollbild, Bitraten des Proxys“

**Gebaut am 2. Oktober 2026 auf 0.55.0. Fingerprint `cc298c6f`, davor
`064133fa`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue;
`GET /api/attachments/:id/info` nennt bei einem fertigen Proxy dessen Bitraten.
Kein neuer Vorgang im Sicherheitsprotokoll, keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 2. Oktober 2026 | Fragen nach der Abnahme von 0.55.0: wann der Proxy spielt, was der graue Knopf „Original“ und das orange umrahmte „Proxy“ bedeuten |
| 2. Oktober 2026 | Fragetafel zum Knopf, eigene Antwort statt der drei angebotenen: „Es wird das angezeigt was angespielt wird. Es bleibt grau. Das Media info zeigt fur den Proxy auch den Bitrate für audio und auch für video“ |
| 2. Oktober 2026 | Fragetafel: als 0.55.1 nach dem Merge von 0.55.0. Anders als empfohlen; empfohlen war, es in 0.55.0 (Pull Request #279) einzubauen |
| 2. Oktober 2026 | Fragetafel: die Bitraten am Proxy gemessen, beim Öffnen von „Erweiterte Infos“ (Empfehlung) |
| 2. Oktober 2026 | Fragetafel beim Bau: Das CHANGELOG hätte 1.504 Zeilen, erlaubt sind 1.500. 0.10.0 bis 0.19.6 stehen künftig je in einer Zeile (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.55.0.

| | 0.55.0 | 0.55.1 |
|---|---:|---:|
| Tabellen | 45 | 45 |
| Routen insgesamt | 131 | 131 |
| Zeilen `server.js` | 8.372 | **8.390** |
| Zeilen `public/app.js` | 12.528 | 12.528 |
| Schlüssel je Sprachdatei | 1.552 | **1.554** |
| Regelzeilen des Stilblatts | 2.005 | 2.005 |
| Kommentarzeilen | 7.234 in 57 Dateien | **7.235 in 57** |
| Rückbauten | 1.678 | **1.684** |
| Prüfungen im Prüfstand | 8.232 | 8.232 |
| Zeilen `CHANGELOG.md` | 1.491 | **1.263** |

Anleitung, Zeilen: `manual.md` 932 → 934, `manual-de.md` 950 → 952,
`manual-tr.md` 936 → 938. Die README ändert sich nicht.

Die Obergrenze der Kommentarzeilen von `test/ffmpeg.js` steigt von 4 auf 5:
Der neue Kommentar sagt, warum `stsz` größere Proben nennt, als die Datei
enthält.

---

## 3. Was gebaut ist

**Der Knopf im Vollbild.** Er nennt, was spielt: „Proxy“, solange der Proxy
spielt, „Original“ nach dem Wechsel. Sein Titel nennt, wohin ein Klick wechselt.
`markOriginal()` setzt kein `aria-pressed` mehr, das Stilblatt färbt den Knopf
nicht mehr orange. Wechsel, Stelle und Rücksetzen beim nächsten Öffnen bleiben
wie in 0.55.0.

**Bitraten des Proxys.** `proxyInfo()` misst bei jedem Aufruf von „Erweiterte
Infos“ die Bitraten von Video und Audio am fertigen Proxy. `proxyRates()` liest
ihn verschlüsselt mit `sealedReader()`, das aus `readPartsOf()` herausgelöst
ist, und gibt ihn an MediaInfo, in der Reihe der Analysen (`inMediaTurn()`).
Gespeichert wird nichts. Die Gruppe „Proxy“ zeigt zwei neue Zeilen, „Bitrate
Video“ und „Bitrate Audio“ (`entry.proxyVideoRate`, `entry.proxyAudioRate`).

**CHANGELOG.** Die 29 Versionen 0.10.0 bis 0.19.6 stehen unter „Older versions
— 0.10.0 to 0.19.6“ je in einer Zeile; vorher belegten sie 272 Zeilen. Jede
Version ab 0.20.0 behält Überschrift und Fingerprint.

**Anleitung.** In drei Sprachen: der Knopf unter „Proxy“ und die Bitraten in der
Gruppe „Proxy“ der Erweiterten Infos.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Titel des Knopfs | nennt, wohin ein Klick wechselt | Die Aufschrift nennt, was spielt; ohne Titel bliebe offen, was der Klick tut |
| `aria-pressed` | entfällt | Bei einer Aufschrift, die den Zustand nennt, widerspräche ein gedrückter Zustand ihr |
| Bitraten | nur bei fertigem Proxy | Ein wartender oder fehlgeschlagener Proxy hat keine Datei; die Antwort für ihn bleibt wie in 0.55.0 |
| Keine Spalte in `proxy_files` | gemessen bei jedem Aufruf | Vorgabe; eine neue Spalte bräuchte bei einer Datenbank aus 0.55.0 eine Migration |
| Schlüsselnamen | `entry.proxyVideoRate`, `entry.proxyAudioRate` | `test/source.js` erlaubt höchstens drei Wörter je Schlüsselname; der erste Entwurf `entry.mediaProxyVideoRate` hatte vier |
| Prüfstand | Der Ersatz für ffmpeg schreibt ein `moov`, dessen `stsz` die verlangten `-b:v` und `-b:a` ergibt | MediaInfo rechnet die Bitrate aus `stsz` und Dauer; so prüft der Server die Messung am Proxy |
| Ort der Zusammenfassung im CHANGELOG | ein eigener Abschnitt an der Stelle von 0.10.0 bis 0.19.6 | Im Abschnitt „Older versions — 0.8.5 and earlier“ am Ende stünden die Zeilen hinter 0.9.1 und damit außer der Reihe |
| Zeile von 0.55.1 im CHANGELOG | höchstens 120 Zeichen | Vorgabe aus 0.53.0. Zwölf Zeilen aus 0.54.0 und 0.55.0 liegen darüber; keine Prüfung erfasst das |

---

## 5. Der Prüfstand

**Angepasst:** `test/release_055.js` (Aufschrift und Titel des Knopfs, kein
`aria-pressed`, keine Regel für `.lb-btn.original[aria-pressed]` im Stilblatt;
die gemessenen Bitraten in der Antwort von `/info`; die beiden Zeilen der
Gruppe „Proxy“), `test/ffmpeg.js` (das `moov`), `test/release_053.js` (100
Abschnitte, 40 Fingerprints, 29 Zeilen für 0.10.0 bis 0.19.6),
`test/selfcheck.js` (1.684 Rückbauten, Grenzwert `test/ffmpeg.js`).

**Rückbauten.** 1775 bis 1780 neu: der Knopf nennt das Ziel, ist gedrückt oder
orange; die Gruppe ohne Bitraten; der Server misst nicht; Video und Audio
vertauscht. 1738 bekommt einen neuen Suchtext (`await proxyInfo`). Gefahren mit
dem Treiber je Modul an `test/release_055.js`, zusammen mit allen Rückbauten
der drei geänderten Gruppen: 31 Stück, **alle rot**. 1734 bricht wie in 0.55.0
nach seiner roten Prüfung ab.

Der volle Lauf vor dem Push: **8.232 von 8.232** Prüfungen bestanden. Die Zahl
bleibt gleich, weil nur bestehende Prüfungen geändert sind.

---

## 6. Nicht geprüft und offen

- Im Image mit dem echten ffmpeg ist nur die Bitrate des Videos geprüft: Für
  ein 4K-Video in H.264 (6 s, 25 Bilder je Sekunde) nennt „Erweiterte Infos“
  6.208.278 bit/s, ffmpeg selbst 6.208 kb/s. Das Testvideo hat keinen Ton, weil
  das ffmpeg im Image keine Tonquelle kennt; die Bitrate des Tons ist nur am
  Ersatz für ffmpeg geprüft.
- Die türkischen Texte hat kein Muttersprachler gelesen.
