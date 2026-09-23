# Änderungsprotokoll 0.41.0 — „Backup, Videos in Kommentaren und der Prüfstand ohne feste Wartezeiten"

**Gebaut am 23. September 2026 auf 0.40.0. Fingerprint `d5aaeb21`, davor
`7681fc64`.**

Gebaut ist der Auftrag `Doku/Auftrag_0.41.0.md` mit seinen fünfzehn
Bauabschnitten. Die Datenbank bekommt eine neue Tabelle, `comment_videos`; das
Austauschformat steigt von 18 auf 19. Eine bestehende Installation läuft mit
ihrer eigenen `.env` und ihrer eigenen `docker-compose.yml` weiter.

---

## 1. Was gemessen ist

### Die Laufzeit des Prüfstands

Je drei volle Läufe von `npm test` nacheinander auf demselben Rechner, ohne
andere Last. Genannt ist die Zeile „im ganzen Lauf" des Prüfstands.

| | Lauf 1 | Lauf 2 | Lauf 3 | Median |
|---|---:|---:|---:|---:|
| vorher, 0.40.0 (`8984f45`) | 352,9 s | 340,8 s | 340,1 s | **340,8 s** |
| nachher, 0.41.0 | 288,9 s | 288,8 s | 288,6 s | **288,8 s** |

**Der Lauf wird um 52,0 s kürzer**, obwohl er 119 Prüfungen und 18 Gruppen
mehr trägt: das neue Modul `test/release_041.js` mit den Prüfungen dieser
Runde. Die festen Wartezeiten allein fallen von 47,7 s auf 3,0 s.

### Die festen Wartezeiten

Gezählt wird die Form `await new Promise(r => setTimeout(r, N))` in allen
Dateien unter `test/`.

| | Stellen | ms |
|---|---:|---:|
| gemessen im Auftrag, an `47e8cf6` | 618 | 47.625 |
| am Ausgangsstand 0.40.0, `8984f45` | 619 | 47.745 |
| am fertigen Stand | **30** | **3.045** |

Jede der 30 hat einen Kommentar in der Zeile darüber. Der Wächter
„Die Zahl der festen Wartezeiten in test/ ist genau die der bleibenden (30)" in
`test/selfcheck.js` hält die Zahl und die Kommentare fest.

| Stelle | ms | Grund |
|---|---:|---|
| `test/dom.js`:74 | 20 | Wartet, ob nach dem Abbruch eine Anfrage ausbleibt. |
| `test/frame.js`:903 | 5 | Schritt der Abfrage, bis die Sekunde wechselt. |
| `test/roundtrip.js`:12433 | 200 | Wartet, ob ein Brief an den Zugang ohne Adresse ausbleibt. |
| `test/roundtrip.js`:12560 | 200 | Wartet, ob ohne oeffentliche Adresse ein Brief ausbleibt. |
| `test/roundtrip.js`:13016 | 600 | UND DIE GEGENLAGE ZUR MESSUNG SELBST: der troepfelnde Empfaenger muss ueberhaupt gehalten haben. Gewartet wird, ob ein Brief ausbleibt. |
| `test/roundtrip.js`:13552 | 400 | Wartet, ob eine Absagemail ausbleibt. |
| `test/ui_entry.js`:133 | 20 | Wartet, ob nach dem Ziehen am Rumpf eine Verschiebung ausbleibt. |
| `test/ui_entry.js`:1162 | 20 | Wartet, ob ohne gueltigen Anbieter ein Aufruf ausbleibt. |
| `test/ui_entry.js`:1304 | 20 | Wartet, ob nach dem Zeigerdruck auf den Namen der Zeilenklick ausbleibt. |
| `test/ui_entry.js`:1576 | 20 | Wartet, ob nach dem sofortigen Wischen eine Umsortierung ausbleibt. |
| `test/ui_entry.js`:1589 | 420 | Wartet ueber die Haltezeit von 400 ms hinaus, ob der Griff ausbleibt. |
| `test/ui_entry.js`:1594 | 20 | Wartet, ob nach dem Loslassen eine Umsortierung ausbleibt. |
| `test/ui_entry.js`:1604 | 420 | Wartet ueber die Haltezeit von 400 ms hinaus, ob der Griff ausbleibt. |
| `test/ui_entry.js`:1607 | 20 | Wartet, ob nach dem Wisch das Oeffnen des Links ausbleibt. |
| `test/ui_entry.js`:2359 | 20 | Abstand zwischen den Tipps, kuerzer als die 300 ms des Doppeltipps. |
| `test/ui_entry.js`:2364 | 20 | Abstand zwischen den Tipps, kuerzer als die 300 ms des Doppeltipps. |
| `test/ui_entry.js`:2371 | 360 | Abstand zwischen den Tipps, laenger als die 300 ms des Doppeltipps. |
| `test/ui_entry.js`:2878 | 20 | Wartet, ob nach dem Griff an den Schieber eine Anfrage ausbleibt. |
| `test/ui_entry.js`:2950 | 20 | Wartet, ob nach dem Griff ohne Weg das Speichern ausbleibt. |
| `test/ui_entry.js`:3123 | 20 | Wartet, ob nach dem Griff ohne Weg an der Ecke eine Anfrage ausbleibt. |
| `test/ui_entry.js`:3153 | 20 | Wartet, ob nach dem Klick ausserhalb des Modus das Speichern ausbleibt. |
| `test/ui_entry.js`:4425 | 20 | Die gestellte Antwort braucht 20 ms: der erste Ruf ist noch unterwegs, wenn der zweite fragt. |
| `test/ui_export.js`:1330 | 20 | Wartet, ob nach dem Doppelklick eine Anfrage ausbleibt. |
| `test/ui_inventory.js`:253 | 20 | Wartet, ob die Anfrage zur Reihenfolge ausbleibt. |
| `test/ui_inventory.js`:1212 | 20 | Wartet, ob die leere Zeile leer bleibt. |
| `test/ui_overview.js`:187 | 20 | Wartet, ob nach dem blossen Anfassen eine Anfrage ausbleibt. |
| `test/ui_overview.js`:600 | 20 | Wartet, ob nach dem Neuzeichnen das Zurueckholen der Bildlaufstellung ausbleibt. |
| `test/ui_style.js`:234 | 20 | Wartet, ob nach dem Blur eine Anfrage ausbleibt. |
| `test/ui_style.js`:300 | 20 | Wartet, ob Escape und Blur die Aussage unveraendert lassen. |
| `test/ui_style.js`:343 | 20 | Wartet, ob das Feld nach dem Klick geschlossen bleibt. |

**Drei Arten bleiben, nicht zwei.** Der Auftrag nennt den Schritt in
`nextSecond()` und die Wartezeiten, die prüfen, dass etwas nicht geschieht.
Vier Stellen gehören zu keiner der beiden: drei in `test/ui_entry.js` stellen
den Abstand zwischen zwei Tipps her, den die Oberfläche selbst misst (kürzer
und länger als die 300 ms des Doppeltipps), und eine lässt eine gestellte
Antwort 20 ms brauchen, damit der erste Ruf noch unterwegs ist, wenn der
zweite fragt. Bei allen vier ist die Zeit selbst der Gegenstand der Prüfung;
eine Bedingung gibt es dafür nicht. Sie bleiben, jede mit ihrem Kommentar.

### Das Hinweisfeld an der Zeitleiste

Chromium, Zeitleiste 900 px, fünf Einträge bei 0, 50, 90, 95 und 100 % der
Spanne. Gemessen mit Playwright am Stand `8984f45` und am fertigen Stand.

| Lage | vorher: Breite × Höhe | vorher: links / rechts | nachher: Breite × Höhe | nachher: links / rechts |
|---|---:|---:|---:|---:|
| 0 % | 210 × 73 | **−105** / 795 | 210 × 73 | 0 / 690 |
| 50 % | 210 × 73 | 345 / 345 | 210 × 73 | 345 / 345 |
| 90 % | 90 × 147 | 765 / 45 | 210 × 73 | 690 / 0 |
| 95 % | 45 × 383 | 833 / 23 | 210 × 73 | 690 / 0 |
| 100 % | **35 × 663** | 882 / **−18** | 210 × 73 | 690 / 0 |

Links und rechts ist der Abstand zum Rand der Zeitleiste in Pixeln; ein
negativer Wert liegt außerhalb. Der Auftrag nannte für 100 % vorher 35 × 647;
gemessen sind hier 35 × 663 bei derselben Breite.

### Die Formatierleiste am langen Kommentar

Chromium, Fenster 360 × 740 px, ein Kommentar von 40 Zeilen im Feld. Die
Oberkante des Feldes liegt über dem Bild, die Unterkante 120 px über dem
unteren Rand. Die Kopfzeile endet bei 69 px.

| | Leiste oben / unten | Knopfreihe oben | Abstand Leiste → Knopfreihe |
|---|---:|---:|---:|
| vorher | 626 / 661 | 636 | **−25** (die Leiste deckt die Knopfreihe) |
| nachher | 69 / 104 | 643 | 539 (die Leiste steht unter der Kopfzeile) |

Mitten im Feld stand die Leiste vorher bei 868 px, also unterhalb des
Fensters von 740 px. Nachher steht sie bei 69 px, direkt unter der Kopfzeile.

### Die Beispieldateien

| | Zeilen vorher | davon Kommentar | Zeilen nachher | davon Kommentar |
|---|---:|---:|---:|---:|
| `.env.example` | 130 | 120 | **43** | 32 |
| `docker-compose.example.yml` | 44 | 29 | **22** | 7 |

---

## 2. Was gebaut ist

### Der Prüfstand wartet auf Bedingungen (BA 1)

Modul für Modul, mit einem vollen Lauf und einem Commit je Modul: zuerst
`test/dom.js`, dann `ui_translator`, `release_031`, `release_030`,
`roundtrip`, `ui_overview`, `ui_entry`, `ui_inventory`, `ui_language`,
`ui_system`, `ui_export` und `ui_style`. Jeder der zwölf Commits lief im
vollen Prüfstand grün.

`until()` in `test/dom.js` nimmt eine Schrittweite und eine asynchrone
Bedingung. Dazu kommt `openRequests(w)`: der Mock zählt die offenen Anfragen
eines Fensters und zählt eine erst nach dem nächsten Takt als erledigt, damit
der Behandler, der die Antwort zeichnet, vorher gelaufen ist. Die meisten
Bedingungen lauten „dieses Element steht da und keine Anfrage ist offen".

### Videos in Kommentaren (BA 2 bis 4)

- Die Tabelle `comment_videos` mit `comment_id`, `filename`, `duration`,
  `thumb`, `sort_order`, `created_at` und `data` am Ende der Zeile. Sie kommt
  über `CREATE TABLE IF NOT EXISTS` in eine bestehende Datenbank; eine andere
  Tabelle ändert sich nicht.
- `POST /api/comments/:id/videos`, `DELETE /api/comment-videos/:id` und
  `GET /api/comment-videos/:id/raw` mit Range und `?size=thumb`. Löschen
  darf der Verfasser und der Admin; beim Admin steigt `images_removed`.
- Export, Import und Papierkorb tragen das Video und sein Standbild.
  Format 19; eine Datei mit Format 18 kommt weiter herein.
- Im Browser: „+ Bild/Video", das Standbild aus `stillFrame()`, die Kachel mit
  dem Abspielzeichen hinter den Bildern, die Bildansicht als dritte Quelle.

### Download, Hinweisfeld, Formatierleiste, Cookie (BA 5 bis 8)

- Die Bildansicht trägt einen Link mit `download` auf das Original. Die
  Dateinamen heißen `photo-<Nummer>`, `image-<Nummer>` und `video-<Nummer>`.
- `hintCenter()` rechnet die Lage des Hinweisfelds ohne DOM; `.timeline-hint`
  hat `width: max-content`.
- Die Leiste steht in `.markup-wrap` direkt über dem Feld, mit
  `position: sticky` und `top` in der Höhe der Kopfzeile. Das Menü an einer
  Auswahl im Lesemodus steht weiter absolut.
- Der Wächter vor allen Routen hängt eine Löschung an, wenn die Anfrage das
  Cookie gegen fremde Formulare unter dem anderen Namen mitbringt.

### Export, Import und Backup, das Wort, die Bezeichnungen (BA 9 bis 12)

- Dialog, beide Karten und Handbuch sagen, dass nur das Backup eine
  vollständige Sicherung der Datenbank ist. Nach dem Dateiimport nennt die
  Meldung die zugefallenen Verfasser.
- Das Wort heißt Backup: 51 Schlüssel in `de.json`, README, Handbuch,
  Kommentare und die Ausgaben von `keytool.js`, `keytool.sh` und `keys.js`.
- Neue Installationen bekommen englische Bezeichnungen. Die deutschen Befehle
  von `usertool.js` und `keytool` fallen weg. Die Kartenschlüssel im
  Systembereich sind englisch.
- `.env.example` und `docker-compose.example.yml` im Wortlaut des Auftrags.

### Die Grenzen beim Hochladen (BA 13)

- `settings.uploadLimits` mit fünf ganzen Zahlen in MB. `uploadLimits` steht
  in `OWNER_KEYS`. `GET /api/settings` nennt Werte und Spannen.
- `multer` entsteht je Anfrage über `cappedLive()`; eine geänderte Grenze gilt
  ohne Neustart.
- Die Karte „Grenzen beim Hochladen" hinter „Bildformate". Admins sehen sie,
  die Felder bedient nur der Eigentümer.
- Die Grenze je Eintrag: `entryTooLarge()` rechnet mit `partBytes()` und allen
  Schaltern. `EXCHANGE_MAX` lässt sich über `KRITERION_EXCHANGE_MAX` senken.

---

## 3. Entscheidungen, die der Auftrag offenließ

| Frage | Entscheidung | Grund |
|---|---|---|
| Wie sieht der Benutzer die Absage 413 beim Export in einer Datei? | als Text der Antwort im Fenster; der Browser navigiert wie bisher | Abschnitt 5 des Auftrags schließt eine Änderung am Ablauf von Export, Import und Backup aus. Eine Vorprüfung im Browser vor der Navigation war gebaut und ist wieder herausgenommen |
| Welcher Statuscode beim Hochladen über der Grenze je Eintrag? | `413` mit JSON | die Oberfläche zeigt bei JSON den Satz von Kriterion und nur ohne JSON den Satz zum Reverse Proxy |
| Prüft der Browser auch Videos, Kommentarbilder und Kommentarvideos vorher? | ja, mit denselben Werten vom Server | der Auftrag verlangt die Vorprüfung mit denselben Werten; nur Foto und Anhang hatten bisher eine |
| Wie wird eine Grenze gespeichert? | beim Verlassen des Feldes, wie „Mindestens behalten" in der Karte „Alte Backups" | dieselbe Bauform wie die einzige andere Zahl im Systembereich |
| Bleibt die Antwort `[ja/nein]` in `usertool.js` und `keytool.js` deutsch? | ja | sie ist eine Antwort auf eine deutsche Frage und kein Befehl |
| Was steht in `.gitignore` und `.dockerignore`? | `kriterion-backup` neben `kriterion-sicherung` | ohne den neuen Namen ginge der Backup-Ordner einer neuen Installation beim Bau mit ins Image; der alte bleibt für bestehende Installationen |
| Warum sind drei türkische Werte kürzer geworden? | `card.catchUpAsk`, `entry.imagesRemovedAdmin`, `server.cleanupAllYoungest` | mit „Backup" wurden die deutschen Sätze kürzer, und die türkischen lagen über der Latte von 1,15; „yedekleme" bleibt das Wort |
| Welche Portbasis bekommt die Instanz mit gesenktem `EXCHANGE_MAX`? | 7340 | die Spanne aller Basen bleibt damit bei 3.500, dem Versatz je Nebenspur |

---

## 4. Befunde nebenbei

- **`.env.before-key-change-…` steht weder in `.gitignore` noch in
  `.dockerignore`.** Die Datei trägt den alten Schlüssel. Unter dem alten Namen
  `.env.vor-schluesselwechsel-…` war es genauso; geändert ist nichts. Der
  Befund steht als Punkt 52 im Sammelblatt.
- **Das Handbuch nennt `#/system/anlage` und `#/system/instanz` als alte
  Adressen,** die zu „Installation" führen. In `public/app.js` gibt es diese
  Umleitung nicht; eine unbekannte Adresse fällt auf den ersten sichtbaren
  Abschnitt. Der Satz steht unverändert.
- **Ein Wächter aus 0.25.1 verbot das Wort Backup in den Modulen.** Er ist
  umgekehrt und verbietet jetzt das alte Wort, außer in „Sicherung der
  Datenbank".

---

## 5. Die festen Zahlen

| | vorher | jetzt |
|---|---:|---:|
| Prüfungen | 7.291 | **7.410** |
| Gruppen | 389 | **407** |
| Rückbauten | 1.135 | **1.149** |
| Portbasen des Laufs | 64 | **65** |
| Tabellen der Datenbank | 29 | **30** |
| Schlüssel je Sprachdatei | 1.243 | **1.258** |
| Regelzeilen im Stilblatt | 1.678 | **1.680** |
| Kommentarzeilen über alles | 16.822 | **16.850** |
| Codezeilen über alles | 67.279 | **69.100** |
| feste Wartezeiten unter `test/` | 619 | **30** |

---

## 6. Was ausdrücklich nicht gebaut ist

Die Tafel in Abschnitt 5 des Auftrags gilt unverändert: kein Download für alle
Fotos eines Eintrags, kein Umkodieren, keine Grenze für die Dauer eines
Videos, keine neuen Namen für bestehende Installationen, keine Umbenennung
interner Namen und der Namen im Prüfstand, keine einstellbare Zahl je
Hochladen und keine einstellbare Grenze je Eintrag.

---

## 7. Der Prüflauf

**`npm test`: 7.410 von 7.410 Prüfungen bestanden, 407 Gruppen.**

Das neue Modul `test/release_041.js` hält die Zusagen 2 bis 18 aus BA 14;
Zusage 1 steht in `test/selfcheck.js`.

**Die vierzehn Gegenproben sind gefahren:**

| # | Rückbau | rot in der erwarteten Gruppe | rot insgesamt |
|---|---|---|---:|
| **1204** | Eine feste Wartezeit kommt in ein Modul zurueck | „Die Wartezeiten des Pruefstands — 0.35.0": „Die Zahl der festen Wartezeiten in test/ ist genau die der bleibenden (30)", „Und jede bleibende hat einen Kommentar in der Zeile darueber" | 3 |
| **1205** | Die Route der Kommentarvideos kennt keinen Range mehr | „Kommentarvideos: Auslieferung mit Range": „Auf Range antwortet es mit 206 und Content-Range", „Auf eine ungueltige Range mit 416" | 3 |
| **1206** | Der Import kodiert ein Kommentarvideo als Bild | „Kommentarvideos: Rundlauf mit Format 19": „Das Video kommt Byte fuer Byte gleich zurueck" | 4 |
| **1207** | Der Papierkorb kopiert das Standbild nicht | „Kommentarvideos: der Papierkorb": „trash_bytes traegt Video und Standbild byte-gleich", „Das Zurueckholen stellt beide ohne Umkodieren her" | 3 |
| **1208** | Der Link in der Bildansicht verliert download | „Download je Foto und Video in der Bildansicht": „Das Foto: ein Link mit download auf das Original", „Das Video am Eintrag ebenso", „Das Kommentarbild", „Das Kommentarvideo" | 5 |
| **1209** | Die Verschiebung des Hinweisfelds faellt weg | „Das Hinweisfeld bleibt in der Zeitleiste": „Die Rechnung haelt das Feld an beiden Raendern in der Zeitleiste", „Am rechten Ende schiebt showHint() das Feld nach innen", „Und am linken Ende ebenso" | 8 |
| **1210** | Die Formatierleiste wird nicht mehr angedockt | „Die Formatierleiste steht am Feld": „Mit Fokus steht die Leiste im Behaelter direkt ueber dem Feld", „Der Behaelter traegt nur Leiste und Feld", „Die Leiste ist angedockt und haelt unter der Kopfzeile" | 9 |
| **1211** | Das Cookie unter dem anderen Namen bleibt stehen | „Das Cookie unter dem anderen Namen wird geloescht": „Eine Anfrage mit beiden Cookies bekommt die Loeschung des anderen" | 3 |
| **1212** | Ein Wert in de.json sagt wieder Sicherung | „Das Wort heisst Backup": „Kein Wert in de.json sagt „Sicherung" ausser „Sicherung der Datenbank"" | 7 |
| **1213** | Die .env.example nennt wieder zugang.js | „Die Beispieldateien": „Jeder Befehl node <datei>.js in .env.example nennt eine Datei, die es gibt" | 2 |
| **1214** | Die Compose-Vorlage haengt wieder kriterion-sicherung ein | „Englische Bezeichnungen in neuen Installationen": „Beispieldateien und Befehle der README nennen nur englische Bezeichnungen" | 3 |
| **1215** | Der Server nimmt eine Grenze ueber der Obergrenze an | „Die Grenzen beim Hochladen": „0 MB und 101 MB fuer ein Video werden abgewiesen, 51 MB fuer ein Foto ebenso" | 2 |
| **1216** | Die Pruefung je Eintrag beim Hochladen faellt weg | „Die Grenze je Eintrag": „Ein Hochladen darueber wird abgesagt und nennt die Grenze in MB", „Ein Kommentarvideo ueber der Grenze je Eintrag wird ebenso abgesagt", „Der Teilexport laesst ihn aus und traegt die uebrigen" | 4 |
| **1217** | Eine Antwort 413 ohne JSON zeigt wieder den Statuscode | „Die Antwort 413 vom Reverse Proxy": „Eine Antwort 413 ohne JSON zeigt error.proxyTooLarge" | 7 |

*„Jeder Suchtext kommt in seiner Datei genau einmal vor" wird bei jedem Rückbau
auf einer ausgelieferten Datei ebenfalls rot — der Rückbau hat den Suchtext
ersetzt. Wo die Prüfsummen der Gleichlautprobe rot werden, hat der Rückbau
`public/app.js` geändert, aus dem die Probe liest.*

**Keine der vierzehn ist stumm geblieben.**
