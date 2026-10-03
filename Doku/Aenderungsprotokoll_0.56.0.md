# Änderungsprotokoll 0.56.0 — „Bitrate der Proxys einstellbar, Ersatz im Hintergrund, Proxy in der Liste, Vollbild am Telefon“

**Gebaut am 2. Oktober 2026 auf 0.55.1. Fingerprint `a161550c`, davor
`cc298c6f`.** MINOR.

Schema: ja, die neue Tabelle `proxy_rates`; eine Datenbank aus 0.55 bekommt sie
beim Start. Austauschformat: bleibt 22. Routen: keine neue. `GET` und
`PUT /api/settings` kennen `proxyRate`; `GET /api/stats` nennt bei `proxy` die
Zahl `stale`; `/raw?size=proxy` liefert für das `v` eines ersetzten Proxys eine
Stunde lang den alten. Kein neuer Vorgang im Sicherheitsprotokoll, keine neue
Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 2. Oktober 2026 | „Und wir machen die Bitrate einstellbar. Und zwar als Basis machen wir 1080p30 alles anderer wird davon ausgehend berechnet aber max 10mbit. Wenn man dafür 8 MBit wählt wird nicht mehr als 10 MBit herangezogen.“ Dazu: „Wenn das Video 4k ist wird auf dem Handy nur ein Teil angezeigt. Erst wenn ich auf vollnild drücke wird das Video passend zum Handy scalliert“ und „Proxy“ in der Liste „ähnlich wie bearbeiten und link. Wie bei davinci. Das aber nur bei Desktop“ |
| 2. Oktober 2026 | Fragetafel: die Bitrate folgt Bildrate und Pixeln (Empfehlung) |
| 2. Oktober 2026 | Fragetafel, eigene Antwort: „1 bis 8 Vorgabe 5mbit . Mit einer nachkoma“ |
| 2. Oktober 2026 | Fragetafel: vorhandene Proxys behalten und im Hintergrund ersetzen (Empfehlung) |
| 2. Oktober 2026 | Fragetafel, eigene Antwort: „Proxy wenn vorhanden.. Wenn nicht vorhanden nichts anzeigen“ |
| 2. Oktober 2026 | Fragetafel: „Ganz laden“ bleibt (Empfehlung); 0.56.0 sofort bauen; das Gerät ist ein Telefon mit Android, hochkant; dazu drei Bildschirmfotos |
| 2. Oktober 2026 | Fragetafel: Proxys aus 0.55 nach dem Update im Hintergrund ersetzen (Empfehlung); die Leiste oben „Ist ganz da“; der Browser ist Chrome |
| 2. Oktober 2026 | Drei Bildschirmfotos aus Chrome auf Android; daraus die Ursache am Telefon (Abschnitt 3) |
| 2. Oktober 2026 | Fragetafel beim Push: die zwei Commits direkt auf 0.55.1 (`b3b5879`) pushen, ohne den Branch neu auf `main` aufzusetzen (Empfehlung). Das Neu-Aufsetzen hatte die automatische Freigabe abgelehnt; 0.55.1 ist über #280 schon in `main` |
| 2. Oktober 2026 | Fragetafel nach dem roten Lauf 1204: Der Prüfstand listet am Ende jedes Laufs die roten Prüfungen mit ihrer Gruppe (Empfehlung); Nachtrag und Liste kommen über einen neuen Pull Request nach `main` (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.55.1.

| | 0.55.1 | 0.56.0 |
|---|---:|---:|
| Tabellen | 45 | **46** |
| Routen insgesamt | 131 | 131 |
| Zeilen `server.js` | 8.390 | **8.452** |
| Zeilen `public/app.js` | 12.528 | **12.568** |
| Zeilen `videoproxy.js` | 172 | **185** |
| Schlüssel je Sprachdatei | 1.554 | **1.559** |
| Regelzeilen des Stilblatts | 2.005 | **2.016** |
| Kommentarzeilen | 7.235 in 57 Dateien | **7.253 in 58** |
| Rückbauten | 1.684 | **1.726** |
| Prüfungen im Prüfstand | 8.232 | **8.264** |
| Zeilen `CHANGELOG.md` | 1.263 | **1.285** |

Anleitung, Zeilen: `manual.md` 934 → 937, `manual-de.md` 952 → 955,
`manual-tr.md` 938 → 941. README: `README.md` 710 → 717, `README-de.md`
713 → 720, `README-tr.md` 714 → 721.

Grenzwerte der Kommentarzeilen angehoben: `server.js` 1.089 → 1.093 (Einheit
der Bitrate, `PROXY_KEPT`, Frist des ersetzten Proxys, Ersatz ohne Eintrag
„fehlgeschlagen“), `videoproxy.js` 24 → 25 (Bezug von `base` und `SCALE`),
`public/app.js` 1.199 → 1.202 (Chrome auf Android, `resize` am Video, Streifen
ohne `scrollIntoView()`), `public/style.css` 514 → 518 (Umbruch der Knöpfe im
Vollbild und im Kopf von „Dateien“, `html` im Vollbild), `test/dom.js` 175 → 176
(Mock der Bitrate wie am Server). Neu: `test/release_056.js` mit 5.

---

## 3. Was gebaut ist

**Bitrate.** Der Eigentümer-Admin stellt in der Karte „Proxy“ die Bitrate für
1920 × 1080 bei 30 Bildern je Sekunde ein: 1 bis 8 Mbit/s mit einer Stelle nach
dem Komma, Vorgabe 5. `videoBitRate(base, v)` in `videoproxy.js` rechnet mit
den Pixeln des Proxys und der Bildrate im Verhältnis, höchstens 10 Mbit/s. Mit
der Vorgabe bekommt 4K mit 30 Bildern je Sekunde 5 Mbit/s, mit 25 Bildern
4,17 Mbit/s, mit 60 Bildern 10 Mbit/s; 720p mit 30 Bildern bekommt 2,22 Mbit/s.
Vorher galten 0,23 Mbit je Bild, höchstens 7,5 Mbit/s, ohne Rücksicht auf die
Pixel. `proxyPixels()` ist aus `server.js` nach `videoproxy.js` gezogen, neben
die Skalierung `SCALE`. Der Server prüft den Wert wie die Schwelle für
„Teilweise“ und lehnt mit `server.proxyRate` ab.

**Ersatz im Hintergrund.** Die Tabelle `proxy_rates` merkt sich je Proxy das
`-b:v`, mit dem er entstand. Ein Proxy ohne Zeile oder mit anderem Wert als
`videoBitRate()` ist veraltet; das gilt nach dem Update für jeden Proxy aus
0.55. Die Warteschlange nimmt veraltete nach den fehlenden. Spielt ein
veraltetes Video, kommt es nach vorn (`proxyPlayed()`). Bis der neue fertig ist,
spielt der alte. Schlägt der neue fehl, bleibt der alte; `PROXY_KEPT` hält das
Video bis zum Neustart oder zur nächsten Bitrate aus der Warteschlange, und in
die Tabelle kommt kein Fehler. Die Karte zeigt die Zeile „mit alter Bitrate“,
solange es veraltete gibt.

**Der alte Proxy nach dem Tausch.** Der Browser holt ein Video in Bereichen. Ein
laufendes Abspielen läse nach dem Tausch ab der nächsten Anfrage die neue Datei
hinter dem `moov` der alten. `holdFormer()` hält den alten Proxy deshalb eine
Stunde für Anfragen mit seinem `v`; danach löscht ihn `sweepProxyDir()`. Die
Oberfläche hängt die Größe des Proxys schon seit 0.55.0 als `v` an die Adresse.

**Proxy in der Liste.** In der Listenansicht am Rechner steht „Proxy“ vor ✎
(„Bearbeiten“) und 🔗 („Link auf diese Datei kopieren“), wenn ein Video einen
fertigen Proxy hat; Pixel und Größe stehen am
Mauszeiger. Die Spalte gibt es nur, wenn im Eintrag mindestens ein Video einen
Proxy hat (`aproxy-on`). Am Telefon fehlt sie wie ✎ und 🔗.

**Vollbild am Telefon.** Die Ursache steht in den Bildschirmfotos des
Betreibers: Zwischen zwei Fotos ist die Seite hinter dem Vollbild waagerecht
verschoben. Die Seite war also breiter als der Bildschirm. Nachgestellt in
Chromium mit der echten App, 412 × 915 CSS-Pixel, Eigentümer-Admin: Die
Knopfzeile im Kopf von „Dateien“ (Sortieren, Gruppieren, „Kacheln“ und
„Liste“, „Auswählen“, „Ordner anlegen“, „Gelöschte Dateien …“) ist 707 px
breit und bricht nicht um. Die Seite wird 719 statt 412 px breit. Chrome legt
dann auch das Vollbild 719 × 1.597 px groß an; am Telefon sieht man davon
einen Ausschnitt. Beim Blättern rollte `scrollIntoView()` am Streifen unten die
ganze Seite mit, daher der wechselnde Ausschnitt. Das Vollbild des Browsers
richtet sich nach dem Bildschirm, nicht nach der Seite; deshalb passte das
Video dort.

Fünf Änderungen:

- Die Knopfzeile im Kopf von „Dateien“ bricht um. Die Seite ist danach 412 px
  breit.
- Solange das Vollbild offen ist, rollt auch `html` nicht
  (`html:has(> body.lb-open)`). Gemessen mit einem eingefügten Element von
  900 px: ohne die Regel 901 px Layoutbreite, mit ihr 412 px, auch wenn das
  Vollbild auf einer schon zu breiten Seite aufgeht. Nach dem Schließen steht
  die Seite an derselben Stelle (`scrollY` 600 vorher und nachher).
- Der Streifen rollt nur noch sich selbst, nicht mehr die Seite.
- Die Knöpfe oben brechen um. Mit „Ganz laden“, „Proxy“, Zähler, „Erweiterte
  Infos“, „Link kopieren“, „Herunterladen“, „Dieses Bild als Vorschaubild“,
  „Löschen“ und „Schließen“ ist die Leiste 507 px breit; bei 412 px lag
  „Schließen“ außerhalb. Jetzt zwei Zeilen, die Leiste oben 120 statt 70 px
  hoch; der Titel weicht zuerst. „Ganz laden“ und „Proxy“ stehen genau bei
  Videos mit Proxy, also bei 4K. Das passt zum Befund „nur bei 4K“.
- `fitPlayer()` setzt Breite und Höhe des Videos in Pixeln: so groß, wie die
  Bühne erlaubt, nie größer als das Video. Gemessen in der App: quer
  412 × 231 px, hochkant 395 × 703 px, nach dem Drehen auf quer 444 × 250 px.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Wo die Bitrate eines Proxys steht | eigene Tabelle `proxy_rates` | Eine neue Spalte in `proxy_files` machte eine Datenbank aus 0.55 unvollständig; Migrationsblöcke werden nicht mehr geschrieben |
| Was gemerkt wird | das `-b:v`, nicht die Einstellung | Ändert die neue Einstellung das `-b:v` eines Videos nicht, etwa bei 4K mit 60 Bildern über 10 Mbit/s, wird es nicht neu gerechnet |
| Pixel für die Formel | die des Proxys | Ein 4K-Video wird ohnehin zu 1080p; es soll dieselbe Bitrate bekommen wie ein Video in 1080p |
| Ein laufendes Abspielen nach dem Tausch | der alte Proxy bleibt eine Stunde für sein `v` | Eine Stunde wie `max-age` in `sendDiskFile()`. Ohne das sähe ein Video, das gerade ersetzt wurde, nach dem nächsten Spulen kaputt aus |
| Fehlschlag beim Ersatz | der alte bleibt, kein `failed` | Ein fertiger Proxy ist besser als keiner; der Grund steht im Log |
| Zeile „mit alter Bitrate“ | nur, wenn es veraltete gibt | wie „fehlgeschlagen“ |
| Spalte „Proxy“ | nur mit mindestens einem Proxy im Eintrag | Ohne Proxys bliebe eine leere Spalte von 44 px |
| Knöpfe im Vollbild | umbrechen statt schrumpfen | Jeder Knopf bleibt erreichbar, auch „Schließen“ |
| Seite breiter als der Bildschirm | Knopfzeile umbrechen und zusätzlich `html` im Vollbild nicht rollen lassen | Die Knopfzeile ist die gefundene Ursache; die Regel an `html` hält das Vollbild auch bei einer künftigen zu breiten Stelle passend |
| Streifen im Vollbild | `scrollLeft` des Streifens statt `scrollIntoView()` | `scrollIntoView()` rollt jeden rollbaren Vorfahren, auch die Seite |

---

## 5. Der Prüfstand

**Neu:** `test/release_056.js` mit 32 Prüfungen in acht Gruppen: Bitrate aus
Basis, Bildrate und Pixeln; die Bitrate in den Einstellungen; Ersatz im
Hintergrund; abgespielte zuerst, Fehlschlag und Neustart; Bestand ohne
gemerkte Bitrate; Bitrate in der Karte; Proxy in der Liste; Vollbild. Der
Ersatz für ffmpeg wartet mit `ffmpeghold` 2,5 s; die neue Schaltstelle
`proxyhold` kürzt die Frist des ersetzten Proxys auf 6 s, `run=1000` lässt den
stündlichen Lauf jede Sekunde laufen.

**Angepasst:** `test/release_055.js` (Aufrufe von `videoBitRate()`,
`ffmpegArgs()` und `expectedBytes()` mit Basis, Werte der neuen Formel,
Quelltextprüfung auf `failed(...)`), `test/roundtrip.js` (46 Tabellen, zehn
Schlüssel in `OWNER_KEYS`), `test/release_053.js` (101 Abschnitte, 41
Fingerprints), `test/release_052.js` (die Spalte zählt ✎ und 🔗, nicht jedes
Kind), `test/source.js` (2.016 Regelzeilen, 38 und 58 Dateien, 83
Protokollzeilen; `v` liest der Server jetzt am Proxy), `test/selfcheck.js`
(1.726 Rückbauten, 58 Dateien, Grenzwerte), `test/dom.js` (Mock für
`proxyRate`), `testbench.js` (Modul `release_056`).

**Rückbauten.** 1781 bis 1822 neu, 42 Stück. Gefahren mit dem Treiber je Modul
gegen `test/release_056.js`: **42 von 42 rot**. 1794 (der stündliche Lauf stellt
den laufenden Ersatz noch einmal an) blieb im ersten Lauf stumm: Die Prüfung
maß, bevor der stündliche Lauf kam. Jetzt dauert die Umwandlung im Test 2,5 s,
und gemessen wird nach 1,2 s; danach rot. Acht Rückbauten aus 0.55 mit neuem
Suchtext (1717, 1722, 1730, 1735, 1745, 1755, 1757, 1758): alle rot. 1717
erwartet jetzt eine Gruppe aus `release_056`, weil in `release_055` keine
Bitrate mehr 10 Mbit/s erreicht.

**Die Oberfläche in Chromium.** Mit der echten App, dem Ersatz für ffmpeg und
zwei VP8-Videos in 4K, Telefon 412 × 915 CSS-Pixel:

| | Seite 719 px breit | jetzt |
|---|---:|---:|
| Breite der Seite | 719 px | **412 px** |
| Vollbild | 719 × 1.597 px | **412 × 915 px** |
| Video quer | 719 × 404 px | **412 × 231 px** |
| Video hochkant | 719 × 1.278 px | **395 × 703 px** |
| Knöpfe oben | eine Zeile, 521 px | **zwei Zeilen, 364 px** |

Mit einem eingefügten Element von 900 px: Layoutbreite 901 px, im Vollbild
412 px; `scrollX` bleibt beim Blättern 0. Am Rechner, 1280 × 800: „Proxy“ steht
44 px breit vor 🔗, der Rest der Kopfzeile ist 160 px breit.

Der volle Lauf vor dem Push: **8.264 von 8.264** Prüfungen bestanden.

**GitHub.** Lauf 1204 auf dem Branch (`8674d64`): 8.252 von 8.258 bestanden,
**6 rot**. Derselbe Stand auf `main` (`330ff7f`, Lauf 1205) und als `v0.56.0`
(Lauf 1206): grün. Die 6 roten stehen vor der Gruppe „Zeitleiste abschaltbar“
in `ui_entry`, also in `roundtrip`, `source`, `ui_overview` oder den ersten
vier Gruppen von `ui_entry`; je rote Prüfung steht eine Hinweiszeile mehr im
Log. Das Werkzeug für GitHub liest nur die letzten 5.000 von 9.721 Zeilen. Vom
Start des Prüfstands bis zur Gruppe „Linkliste und Aktionszeichen“ vergingen
rund 137 s, in Lauf 1205 rund 114 s. Die fünf Module von `roundtrip` bis
`ui_system` dreimal parallel hier: alle grün.

**Nachtrag: die roten Prüfungen am Ende.** `test/frame.js` merkt sich jede rote
Prüfung mit ihrer Gruppe, gibt sie in der Meldung eines Moduls weiter und
nennt sie im Schlussblock unter „ROT:“, direkt nach der Summenzeile.
`testbench.js` trägt dort auch seine eigenen Fehler ein, mit „Modul <Name>“ als
Gruppe. Übergangene Gruppen eines gefilterten Laufs kommen nicht in die Liste.
Die Zeilen der Liste tragen kein ✗; `counterproof.js` liest rote Prüfungen
weiter nur aus den Zeilen mit ✗. Neu sind drei Prüfungen in `test/roundtrip.js`
(„Der Gruppenfilter“) und eine in `test/selfcheck.js` („Der Treiber sieht den
Rueckgabewert — 0.34.4“); eine bestehende prüft zusätzlich, dass der übergangene
Fehlschlag in keiner Zeile steht. Rückbauten 1823 bis 1829 neu: **7 von 7
rot**. 1062 hat einen neuen Suchtext, weil die Zeile in `testbench.js` keine
Klammer mehr trägt; rot. Der volle Lauf mit der Liste: **8.268 von 8.268**
Prüfungen bestanden, 1.733 Rückbauten.

**Nachtrag: Wettlauf mit dem Protokoll.** Lauf 1207 (Pull Request #282) war
mit 1 Prüfung rot, und die neue Liste nannte sie: „Proxy: abgespielte zuerst,
Fehlschlag und Neustart › Ein veraltetes Video, das gerade spielt, kommt in der
Warteschlange nach vorn“, Hinweis `4:1331 2:1411 3:1491 1:1023`. Ursache:
`until2()` wartete auf die neue Bitrate in der Datenbank und las danach sofort
das Protokoll des Servers. Die Zeile „Proxy for file 1 replaced in …“ kommt
über die Pipe von stdout und war auf dem Läufer noch nicht da.

Nachgestellt in einer Kopie, in der `test/frame.js` jede Ausgabe eines Servers
um 300 ms verzögert:

- `test/release_056.js` ohne Fix: 3 rot, darunter genau diese Prüfung mit dem
  Hinweis `4:1332 2:1412 3:1492 1:1024`. Mit Fix: 32 von 32.
- Der ganze Prüfstand ohne Fix: 14 Prüfungen rot, die alle das Protokoll
  direkt nach einer Antwort oder nach dem Start lesen. 10 davon stehen in
  `test/roundtrip.js`, 4 in `test/release_055.js`.

Die 10 aus `test/roundtrip.js` stehen alle vor der Gruppe „Zeitleiste
abschaltbar“, also in dem Teil des Logs von Lauf 1204, der die 6 roten enthielt.
Jede nennt bei Rot eine Hinweiszeile. Die 6 roten aus Lauf 1204 sind damit sehr
wahrscheinlich 6 dieser 10; belegt ist es nicht.

Fix: `test/frame.js` hat jetzt `logUntil(log, muster, ms)`. Die Funktion fragt
das Protokoll alle 25 ms ab, bis das Muster passt, höchstens 5 s. Vor jeder der
14 Prüfungen steht ein `await H.logUntil(...)` mit dem Muster, das die Prüfung
erwartet; die Prüfungen selbst sind unverändert. In `test/release_056.js`
wartet `until2()` an drei Stellen zusätzlich auf die Zeilen im Protokoll. Die
Rückbauten 1781 bis 1822 gegen `test/release_056.js` mit Fix: **42 von 42
rot**.

---

## 6. Nicht geprüft und offen

- Die Anzeige auf einem Telefon mit Android und Chrome. Nachgestellt ist der
  Fehler in Chromium mit Emulation eines Telefons; dort ist er behoben.
- Die Dauer des Ersatzes: Nach dem Update rechnet Kriterion jeden Proxy neu.
  Auf dem N100 dauerte eine Stunde 4K mit 60 Bildern je Sekunde mit Quick Sync
  rund 30 Minuten, mit der CPU zwei bis zweieinhalb Stunden.
- Die türkischen Texte hat kein Muttersprachler gelesen.
- Die 6 roten Prüfungen aus Lauf 1204 (Abschnitt 5): Die Namen sind nicht
  bekannt. Wahrscheinliche Ursache ist der Wettlauf mit dem Protokoll; der
  Nachtrag in Abschnitt 5 behebt ihn an 14 Stellen. Ein künftiger roter Lauf
  nennt die Namen am Ende des Logs.
