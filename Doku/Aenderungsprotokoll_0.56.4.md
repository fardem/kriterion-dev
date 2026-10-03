# Änderungsprotokoll 0.56.4 — „Vollbild am Telefon, Kontraste“

**Gebaut am 3. Oktober 2026 auf 0.56.3 (`a1bf892`) nach
`Doku/Auftrag_0.56.4.md`. Fingerprint `5d8a9336`, davor `6a318ea6`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue.
Sprachschlüssel: `entry.videoLoaded` entfällt; `entry.loadWholeCancel` und
`list.zoomActual` sind neu; `list.zoomFull` und `list.clickZoomHint` nennen
„100 %“. Kein neuer Vorgang im Sicherheitsprotokoll, keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 3. Oktober 2026 | Chat: „kann man paket 4 dazu nehmen oder ist es zu aufwändig“; Paket 3 (Vollbild) und Paket 4 (Kontraste) kommen zusammen |
| 3. Oktober 2026 | Chat zu V8: „besser wäre einfach den Knopf "100%" zu benennen“; Fragetafel: **100 % an der Stelle** (Empfehlung) |
| 3. Oktober 2026 | Fragetafel zu V12: Pfeile **während der Wiedergabe weg** (Empfehlung) |
| 3. Oktober 2026 | Fragetafel zu V5: **eigene Zeile mit Name und Titel** (Empfehlung) |
| 3. Oktober 2026 | Chat zu S2: Entscheidung erst nach Bildschirmfotos der drei Varianten, hell und dunkel; Fragetafel: **B, eigene Farbe mit 3 : 1** (Empfehlung) |
| 3. Oktober 2026 | Chat zu F55: „das überlasse ich dir“; F55 kommt mit |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.56.3.

| | 0.56.3 | 0.56.4 |
|---|---:|---:|
| Zeilen `public/app.js` | 12.641 | **12.657** |
| Zeilen `server.js` | 8.501 | **8.502** |
| Schlüssel je Sprachdatei | 1.563 | **1.564** |
| Kommentarzeilen | 7.275 in 58 Dateien | **7.282** in 58 |
| Rückbauten | 1.811 | **1.850** |
| Prüfungen im Prüfstand | 8.329 | **8.349** |
| Zeilen `CHANGELOG.md` | 1.349 | **1.369** |

Anleitung, Zeilen: `manual.md` 944 → 952, `manual-de.md` 964 → 971,
`manual-tr.md` 947 → 952. README unverändert.

Kommentarzeilen: die Grenzwerte sind angehoben für `public/app.js` 1.211 →
1.212, `public/style.css` 521 → 526 und `auth.js` 149 → 150; die Gründe
stehen im Commit. Regelzeilen im Stilblatt 2.031 → 2.045.

---

## 3. Was gebaut ist

### Vollbild

- V8 Ein Klick oder ein Doppeltipp auf das Bild lädt das Original und zeigt es
  in 100 %. `setZoom(on, click)` merkt sich den angeklickten Punkt relativ zum
  Bild und seine Lage in der Bühne; nach `load` rollt die Bühne so, dass der
  Punkt an derselben Stelle steht. Der Knopf heißt „100 %“
  (`list.zoomActual`), trägt `aria-pressed` und zeigt die Mitte
  (`centerStage()`). Gemessen in Chromium: Klick bei 518/453 px, nach dem Zoom
  steht derselbe Bildpunkt bei 518/453 px; Doppeltipp am Telefon bei
  288/364 px, danach 288/364 px.
- V5 Am Telefon hochkant (`max-width: 700px`) bricht `.lb-top` um: Titel und
  ✕ in der ersten Zeile, die Knöpfe darunter (`.lb-tools` mit `order: 1` und
  voller Breite). An 412 × 915 ist der Titel 322 px breit statt 21 px. Bei
  Dateien steht in `.lb-name` der Dateiname, dahinter in `.lb-of` klein der
  Titel des Eintrags; bei Fotos bleibt `.lb-name` leer.
- V12 Das Vollbild trägt `.lb-playing`, solange das Video spielt (`play`,
  `pause`, `ended`, `emptied`). Ohne Zeiger sind die Pfeile dann ausgeblendet.
- V13 `.lightbox` hat unten und an den Seiten `env(safe-area-inset-*)` als
  Innenabstand; die Pfeile rechnen den seitlichen Abstand dazu. `.lb-top` und
  `.lb-strip` tragen diese Abstände nicht mehr selbst.
- V15 `::-webkit-scrollbar-corner` ist durchsichtig. Ohne Zeiger hat die
  gezoomte Bühne keine Rollbalken.
- V16 Kacheln ohne Standbild im Streifen sind nicht abgedunkelt; die Endung
  steht in `--text-2`.
- V17 „Ganz laden“ zeigt den Fortschritt im Knopf („Abbrechen 45 %“,
  `entry.loadWholeCancel`); `.lb-loaded` entfällt. Während des Ladens hat der
  Knopf `min-width: calc(15ch + 22px)` und Ziffern gleicher Breite. Gemessen:
  „Abbrechen 100 %“ braucht 129 px, der Knopf ist in allen drei Sprachen bei
  0, 45 und 100 % 137 px breit.
- V19 Die Vorschau im Eintrag setzt `swipes` bei jedem `touchstart` neu; ein
  zweiter Finger und eine gezoomte Seite blättern nicht.

### Kontraste

Gemessen nach WCAG; „über weißem Foto“ heißt: die Fläche mit ihrer Deckung über
#ffffff.

| Stelle | Schema | vorher | nachher |
|---|---|---:|---:|
| S1 Fokusrahmen auf Weiß | hell | 2,61 | **5,38** |
| S1 Fokusrahmen auf `--surface-2` | hell | 2,41 | **4,97** |
| S2 Rand der Eingabefelder gegen die Karte | dunkel | 1,25 | **3,07** |
| S2 Rand der Eingabefelder gegen die Karte | hell | 1,45 | **3,12** |
| S3 Pfeil ‹ › im Bild über weißem Foto | hell | 1,37 | **10,98** |
| S3 ▶ auf der Karte über weißem Foto | hell | 1,30 | **6,19** |
| S3 ★ auf der Karte über weißem Foto | hell | 2,29 | **7,67** |
| S6 Fokus im Dateimenü: Fläche gegen Menü / Rahmen | dunkel | 1,11 | **6,22** |
| S6 Fokus im Dateimenü: Fläche gegen Menü / Rahmen | hell | 1,15 | **4,97** |
| V16 „WEBM“ im Streifen | dunkel | 2,06 | **8,27** |
| V16 „WEBM“ im Streifen | hell | 2,04 | **6,00** |

- S1 `:focus-visible`, der Fokus der Felder und alle übrigen Fokusrahmen
  nehmen `--accent-edge`. Im dunklen Schema ist das `--accent`; dort ändert
  sich nichts.
- S2 Neues Token `--input-edge`: dunkel #5e6770, hell #8a939d. `.input`,
  `.ta` und `.select` tragen es; beim Zeigen `--muted`.
- S3 Neue Tokens `--on-photo-strong` (#e9ecef) und `--badge-gold` (#ffc531),
  in beiden Schemata gleich. `.vnav` und die Werkzeuge beim Zeigen nehmen
  `--on-photo-strong`, ▶ auf Karten und Kacheln `--on-photo`, ★ auf Karten
  `--badge-gold`. Im dunklen Schema sind das dieselben Farben wie vorher.
- S5 Mit Tastaturfokus erscheinen `.vnav`, `.thumb .del`, `.xdel`,
  `.mrow .mact`, `.cmt-img .del` (`:focus-visible`) und `.vtools`
  (`:has(:focus-visible)`).
- S6 `.fmenu-item:focus-visible` hat einen Rahmen in `--accent-edge`.
- S12 Die Rücknahmen unter `(hover: none)` nehmen die Deckung der
  Ausgangsregeln: `.vnav` .86, `.lb-nav` .9.

### Anmeldebremse

- F55 `addressBlock()` in `auth.js` gibt für IPv6 das /64 zurück
  (`2001:db8:1:2::/64`), Schreibweise und führende Nullen gleichen sich an.
  IPv4 und Adressen mit IPv4-Teil (`::ffff:a.b.c.d`) bleiben, wie sie sind.
  `keyIp()` und die Warteschlange `brakeTurn()` in `server.js` nehmen diesen
  Schlüssel. Bestehende Zeilen in `login_attempts` laufen nach einer Stunde
  ohne Versuch aus.

### Dokumentation

- Anleitung in drei Sprachen: Zoom auf 100 %, „Abbrechen 45 %“, Dateiname im
  Vollbild, Telefon hochkant, Pfeile während der Wiedergabe, IPv6 je /64.
- `Doku/Entwicklung.md`: Anmeldebremse je /64.
- `Doku/Vorschlaege_Claude_0.56.x.md`: Paket 3, Paket 4 und F55 entfallen.

---

## 4. Der Prüfstand

**Neu** in `test/release_056.js`: sechs Gruppen mit zusammen 20 Prüfungen.

- „Anmeldebremse: IPv6 je /64“: 15 parallele Fehlversuche von 15 Adressen
  eines /64 ergeben 10 × 401 und 5 × 429; eine andere Schreibweise desselben
  /64 ist gesperrt, das /64 daneben nicht.
- „Vollbild: 100 % an der angetippten Stelle“: Klick, Knopf, Doppeltipp und
  Blättern in jsdom mit gesetzten `getBoundingClientRect()`.
- „Vollbild: Kopfzeile am Telefon und der Dateiname“, „Vollbild: Pfeile
  waehrend der Wiedergabe, Raender, Rollbalken, Streifen“, „Vorschau im
  Eintrag: Wischen mit einem Finger“.
- „Kontraste: Fokus, Eingabefelder, Zeichen auf Fotos, Tastatur“: rechnet den
  Kontrast von `--input-edge` gegen `--surface` in beiden Schemata.

**Angepasst:** `test/release_052.js` (Fortschritt im Knopf statt
`.lb-loaded`), `test/ui_entry.js` (die Mitte über den Knopf „100 %“),
`test/ui_overview.js` (★ in `--badge-gold`), `test/roundtrip.js` (das
Kreuz der Vorschaukachel auch mit Tastaturfokus; die Meldung zur Umlagerung beim
Start nennt die Zahl der Dateien und die letzten Zeilen des Servers), `test/source.js` (2.045
Regelzeilen), `test/release_053.js` (105 Abschnitte, 45 Fingerprints),
`test/selfcheck.js` (1.850 Rückbauten, Grenzwerte der Kommentare).

**Rückbauten.** 1908 bis 1946 neu; 1570, 1675 und 1777 mit neuem Suchtext.
Gefahren je Modul gegen eine Kopie des Arbeitsbaums, mit der erwarteten Gruppe
als Filter: **42 von 42 rot**.

Volle Läufe vor dem Push:

1. 8.348 von 8.349: die Prüfung des Kreuzes in `test/roundtrip.js` suchte die
   alte Regel `.thumb:hover .del` wörtlich.
2. 8.343 von 8.349: sechs rote Prüfungen in „Der Papierkorb: der Rundlauf“. Die
   Umlagerung der Dateien beim Start war nach 10 s nicht fertig; die übrigen
   fünf folgen daraus. Nicht nachgestellt: die Gruppe allein dreimal grün, das
   ganze Modul grün, unter CPU-Last dreimal grün. 0.56.4 ändert an der
   Umlagerung nichts. Die Prüfung nennt seitdem bei einem Fehlschlag die Zahl
   der Dateien und die letzten Zeilen des Servers.
3. **8.349 von 8.349** Prüfungen bestanden.
