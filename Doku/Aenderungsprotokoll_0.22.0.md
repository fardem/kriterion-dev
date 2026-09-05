# Änderungsprotokoll 0.22.0 — „Die Oberfläche wird ruhiger, und sie redet Deutsch"

**Diese Runde ändert keine Funktion, und sie ist trotzdem die größte
Textrunde des Projekts.** *Drei Befunde standen am Anfang (Konzept, Abschnitt 1):
die Oberfläche bewegt sich an den falschen Stellen, sie redet wie unter Kollegen,
und sie ist nicht überall aufgeräumt.* **Sechzehn Entscheidungen** hat der
Betreiber am 4. September 2026 dazu getroffen (E1 bis E16); **fünf
Bauabschnitte** setzen sie um: das Stilblatt, zwei Vokabelwörter, rund 250
Textstellen nach einem Wörterbuch, die Dialoge, und Bildstreifen · Rechteck ·
Sternzeile.

**Was ein Betreiber merkt:** *die Wörter sind andere, der Bildstreifen ist
einstellbar, und die Sternzeile hat ihren Rücksetzknopf woanders.* Wer eine
Bewertung zurücksetzt, bekommt seither „Rückgängig" angeboten; wer einen
Benutzer löscht, sieht EIN Fenster mit zwei Häkchen, und „Abbrechen" bricht ab.

> **DAS IST KEIN ANSTRICH.** Die Gestaltungsregeln G1 bis G8 und die
> Sprachregeln S1 bis S7 stehen seit dieser Runde als geschriebene Regel im
> Projektstand, Abschnitt 5.6, und drei davon hält der Prüfstand fest: kein
> Milchglas, keine Browserfenster, Server-Befehle nur im Kasten. *Eine Regel, die
> im Papier steht und im Stilblatt gebrochen wird, ist keine Regel — G3 hatte
> genau das vorgeführt (Stolperstein 314).*

---

## Diese Runde ist KEINE Datenbankstufe — ausdrücklich

**Kein Migrationsblock, keine Spalte, kein Bestandslauf, keine neue Route, kein
neues Modul, keine neue Datei, keine neue Abhängigkeit.** *Der Server bekommt
zwei Vokabelwörter und einen persönlichen Schlüssel (`streifen`), beide auf den
vorhandenen Routen `GET`/`PUT /api/settings`; `db.js` und `mail.js` sind nicht
angefasst.* Austauschformat **13**, `F_ROUTEN` **70**, einundzwanzig Karten,
neun Migrationsblöcke, neun ausgelieferte Module — unverändert.

> **DER RÜCKWEG AUF 0.21.1 IST OFFEN.** *Eine ältere Fassung kennt die zwei neuen
> Vokabelwörter nicht und zeigt dort ihre eingebauten Wörter; die Einstellung
> `streifen` liest sie nicht und lässt sie stehen.* **Umbenannte Wörter bleiben
> in den Einstellungen stehen und kommen beim nächsten Einspielen zurück.**
> *Eine Sicherung schadet nie, ist hier aber nicht nötig.*

**Nach dem Einspielen im Browser einmal hart neu laden** — `public/app.js` und
`public/style.css` haben sich geändert.

---

## Was diese Runde an den Zahlen ändert

| | vorher (0.21.1) | nachher (0.22.0) |
|---|---|---|
| Prüfungen | 5571 | **5661** (+90, gezählt an beiden Läufen) |
| Rückbauten in `gegenprobe.js` | 617 | **635** (+18, Nummern 624 bis 641; 42 nachgezogen) |
| Stolpersteine | 313 | **316** |
| Vokabelwörter | 12 | **14** (`bewertungEinzahl`, `bewertungMehrzahl`) |
| persönliche Schlüssel in `user_settings` | 8 | **9** (`streifen`) |
| `F_ROUTEN` · Karten · Austauschformat | 70 · 21 · 13 | 70 · 21 · 13 — unverändert |
| `backdrop-filter` im Stilblatt | 9 Regeln | **0** |
| `confirm(`/`prompt(` in `public/app.js` | 8 Aufrufe | **0** |
| Server-Befehle im Fließtext einer Karte | 4 | **0** — vier im Kasten „Auf dem Server", gezählt |
| Übergänge im Stilblatt | 48, in sieben Dauern (0,10 bis 0,40 s) | **55**, davon 78 Angaben auf 0,15 s, drei auf 0,18 s, je eine auf 0,3 / 0,2 / 0,1 s, zwei auf 0,12 s |
| Bildschirmtexte in `public/app.js` (Texte in Anführungszeichen und Backticks, gezählt vom Wächter) | 1769 | **1851** — 460 weggefallen, 542 neu |
| Zeilen, die sich geändert haben (`git diff --stat`, Code) | — | 2917 hinzu, 1457 weg in sechs Dateien |

*Die 250 Stellen des Auftrags sind damit nicht „rund", sondern gezählt: der
Bildschirmtext-Wächter liest 460 Texte, die es nicht mehr gibt, und 542, die
neu sind — die Differenz sind Texte, die in mehrere Teile zerfallen oder
zusammengezogen wurden.*

---

## 1. Das Wörterbuch — die sechzehn Entscheidungen und ihre Begründung

*Beschlossen am 4. September 2026 im Gespräch mit dem Betreiber; die Fragen mit
Empfehlung und Gegenrede stehen im Konzept, Abschnitt 9.1. Hier steht, was gilt,
und warum.*

| Nr. | gilt | warum | was dagegen sprach |
|---|---|---|---|
| **E1** | Der Bereich hinter dem Zahnrad heißt **„Einstellungen"** | Der Benutzer sieht dort sein Konto, seine Sitzungen, seine Darstellung und den Bestand; „System" verspricht ihm etwas, das er nicht bekommt | rund 700 Stellen in den Papieren sagen „Systembereich" — sie bleiben, die Adressen `#/system/…` auch |
| **E2** | Die eigene Karte heißt **„Mein Konto"**, Reiter und Karte der Verwaltung **„Benutzer"**; die Rolle heißt weiterhin „Benutzer" | Ein Wort für die Person, eins für das eigene Konto; „Zugang" neben „Zugänge" war ein Buchstabe Unterschied für zwei Dinge | „Zugang" stand in der README, im Sicherheitsprotokoll, in `zugang.js` — der Befehl heißt weiter so |
| **E3** | **„Registrierung"** statt „Selbstanmeldung"; auf der Anmeldeseite **„Zugang beantragen"**; die Bitte bleibt **„Anfrage"** | Das Wort, das jede Webseite benutzt | „Selbstanmeldung" war verständlich und seit 0.9.x in allen Papieren |
| **E4** | Eine Runde, fünf Bauabschnitte | Ein Wörterbuch, das zur Hälfte gilt, erzeugt genau die zwei Wörter je Sache, die es abschaffen soll | die Größe der Runde |
| **E5** | **„Wer hat bewertet"** statt „Stimmen" | So hieß der Knopf bis 0.21.0; „Stimme" meint eine Wahl und kommt sonst nirgends vor | „Stimmen" passte in beide Kastenköpfe, 0.21.0 hatte es bewusst so gesetzt |
| **E6** | Die Karte heißt **„Bildformate"** statt „Bildablage" | Die Karte zählt Formate und wandelt um | „Bildablage" ist der Name der Runde 0.19.0 im Projektstand — der bleibt |
| **E7** | **„Suchmaschinen"** statt „Suchanbieter", **„Standard"** statt „Start", **„Such-URL"** statt „Vorlage" | Das Alltagswort | ein eigener Anbieter kann ein Forum sein |
| **E8** | Hinter einem Aufklapper **„Weitere Filter"** wandert **allein die Tagzeile**; die Ablehnungsgruppe bleibt in der Statuszeile | Die Tagzeile kostet den Platz, die Ablehnung ist mit drei Knöpfen schmal; ein versteckter Filter, der greift, öffnet den Aufklapper beim Aufbau | ein versteckter Filter braucht eine Regel mehr — sie steht im Prüfstand |
| **E9** | Der Bildausschnitt lässt sich als **Rechteck** aufziehen; **der Schieber bleibt** | Das Rechteck ist der schnelle Weg mit der Maus, der Schieber der Weg für den Finger und die Feinarbeit | zwei Wege für eine Sache |
| **E10** | Der Knopf **„Eintrag löschen"** erscheint nur für Verfasser und Admin | Der Server sagte ohnehin 403; ein Knopf, der nie geht, ist kein Knopf | „Funktion bleibt" — hier fällt für den Benutzer ein sichtbares Element, das für ihn nie eine Funktion war |
| **E11** | Bildstreifen: **60 · 80 · 100 · 120 · 150 px, Vorgabe 80** | Fünf Stufen wie bei der Schriftgröße; 150 px ist die Grenze der Auflösung des gespeicherten Vorschaubilds | die Vorgabe könnte 100 sein — am gebauten Stand angesehen: 80 trägt, sechs Kacheln je Zeile am Schreibtisch, vier auf dem Telefon |
| **E12** | Ruhige Karten bekommen den **leiseren Rand** (`--line-2`) — am gebauten Stand anzusehen | Systemkarten und Blöcke sind Fläche, kein Bedienelement | Kontrast auf schlechten Bildschirmen — **angesehen und behalten**, siehe Abschnitt 5 |
| **E13** | Der Kasten mit dem Schlüssel im Klartext **gehört dem Eigentümer** | Der Admin sieht einen Satz: der Schlüssel liegt noch neben der Datenbank, und der Eigentümer sollte das ändern | ein Admin, der die Installation einrichtet, brauchte ihn — dann macht ihn der Eigentümer zum Eigentümer |
| **E14** | **„Bewertung" wird Vokabelwort, als Paar** — `bewertungEinzahl`, `bewertungMehrzahl` | „Potenzial" ist umbenennbar, sein Gegenstück war es nicht — eine Schieflage, die bei jedem Umbenennen sichtbar wurde; gegen die Empfehlung des Konzepts entschieden | drei hart geschriebene Stellen, die Sortierung, der Vergleich, die Kachel und die Karte hängen daran (Konzept 9.4) |
| **E15** | Der Rücksetzknopf der Sternzeile **wandert ganz nach rechts, hinter die Durchschnittszahl**, als runder Knopf mit eigener Spalte | Das × stand zu nah am fünften Stern; wer danebentraf, vergab fünf Sterne statt seinen zu entfernen (Konzept 6.5a) | eine vierte Spalte im Raster, auch auf dem Telefon |
| **E16** | Die Meldung nach dem Zurücksetzen trägt **„Rückgängig"** | Ein Fehlklick ist reparierbar; der alte Wert wird per `PUT` zurückgeschrieben, nicht aus der Anzeige geraten | eine Meldung, die sechs statt drei Sekunden steht |

**Was daneben stillschweigend gilt, weil das Wörterbuch es sagt:** „Alle" statt
„Alles anzeigen" in jeder Filtergruppe; „Neuigkeiten" statt „Neu seit deinem
letzten Blick"; „Server-Log" statt „Protokoll" (das Wort bleibt allein dem
Sicherheitsprotokoll); „Sicherungsordner" statt Sicherungsort, Zielort, Ort;
„Link zum Zurücksetzen" statt Rücksetzlink und Passwortersatz; „(erforderlich)"
und „(optional)" statt „(wird gebraucht)" und „(freiwillig)"; „Gelöschter
Benutzer" statt Grabstein; „per Kommandozeile am Server" statt „zugang.js auf
dem Wirt"; die Rückgängig-Formel „Das lässt sich nicht rückgängig machen."
überall gleich; das Zeichen ⌀ nur vor der Zahl, nie als Wort.

**Was ausdrücklich beim Alten geblieben ist:** „Verlauf" (nicht „Testverlauf"),
„Ablehnung" als Beschriftung der Filtergruppe, die Karte „Anfragen", der Reiter
„Persönlich", die Adressen `#/system/zugaenge` und alle übrigen; das Wort
„Backup" steht nirgends — „Sicherung" genügt.

---

## 2. Was gebaut wurde, je Datei

### `public/style.css`

- **Kein Milchglas (G3).** Neun `backdrop-filter` sind gefallen: die Kopfzeile
  (`.masthead`, jetzt deckend `var(--bg)`, mit `transition: box-shadow .15s`),
  der Dialoghintergrund (`.backdrop`, Schleier `rgba(6,7,9,.78)` statt 0,74 mit
  `blur(3px)`) und sieben kleine Träger auf Fotos (Stern, Zähler, Abspielmarke,
  Marken, Blätterpfeile, Zähler im Vollbild) — die dunklen Träger sind dafür
  eine Spur deckender (`.photo-count` 0,78 → 0,82, `.vnav` 0,82 → 0,86,
  `.vcount` 0,80 → 0,84). Neu:
  `.masthead.gerollt { box-shadow: var(--sh-sm) }`, gesetzt von `app.js` ab acht
  Bildpunkten Rollweg.
- **Eine Antwort auf jede Berührung (G2).** `.card:hover` hebt um **zwei** Pixel
  (bis 0.21.1 drei), das Bild wächst auf **1,02** (1,03) in **0,3 s** (0,4 s);
  `.mrow`, `.trow`, `.arow` und `.lrow` antworten beim Überfahren mit
  `background: var(--surface-3)`; `.pill:hover` bekommt `--accent-dim` als
  Hintergrund; `.sys-reiter-k:hover` eine Fläche. **Alle Farb- und
  Randübergänge stehen auf 0,15 s** (bis 0.21.1 0,10 bis 0,16 s in fünf
  Stufen), Bewegung auf 0,18 s, das Kachelbild auf 0,3 s. **Von selbst bewegt
  sich zweierlei:** `.glocke-punkt` schwillt einmal an (`glocke-auf`, 0,3 s) und
  `.sys-card.gespeichert` leuchtet einmal grün (`karte-gespeichert`, 0,4 s).
- **Lesbarkeit (G6).** `.label` von 0,7 rem und `--faint` auf **0,8 rem und
  `--muted`**; `.eyebrow` auf 0,78 rem; die Zähler in Blockköpfen
  (`.block-head .hint`) in `--text-2`; **tabellarische Ziffern** an 30
  Zahlenstellen (`font-variant-numeric: tabular-nums`, eine Sammelregel mit
  dreißig Wählern, gezählt).
- **Marken für Rolle und Zustand (G1).** `.rolle-marke` (Monospace 0,68 rem,
  Pille): Eigentümer gefüllt (`--accent-dim`, Rand `--accent-line`), Admin
  umrandet, Benutzer neutral; `.zug-punkt` in Grün (aktiv), `--faint`
  (gesperrt), `--accent` (eingeladen). Dieselbe Marke steht im
  Sicherheitsprotokoll hinter den Rollenwörtern.
- **Die kleinen Dinge aus der Ideentafel.** Drei eigene SVG-Zeichen als Klasse
  `.zg` (Rücksetzer, Kreuz, Menü); der Leerzustand `.leer-zustand` mit Zeichen
  und Satz; die Zeitleiste `.zl` ohne Kasten (kein Rand, kein Hintergrund, nur
  Linien und Punkte — Höhe wie zuvor); der leisere Rand `--line-2` an
  `.sys-card`, `.block`, `.kv`, `.rrow > *`, `.cmp-crit`, `.rz > span` (E12).
- **Der Bildstreifen (G7).** `.thumbs { display: grid; grid-template-columns:
  repeat(auto-fill, minmax(var(--streifen), 1fr)) }` auf jedem Schirm;
  `.thumb { width: auto; height: auto; aspect-ratio: 1/1 }`; `--streifen: 80px`
  in `:root`, gesetzt von `app.js` aus der Einstellung. Der Telefonblock
  wiederholt das Raster nicht mehr.
- **Die Sternzeile (E15).** `.rlist { grid-template-columns: 1fr auto auto
  auto }`, `.rlist.ohne-schnitt { 1fr auto auto }`; die vierte Zelle `.rrow .rzz`
  (flex, rechtsbündig, `padding-left: 12px`); `.rzurueck` — 26 × 26 px, rund,
  ohne Rand, `--faint`, beim Überfahren `--red` auf `--red-dim`; `.rzurueck.leer
  { visibility: hidden }` (nicht `display: none` — der Platz bleibt); auf dem
  Telefon 32 × 32 px und drei Spalten `auto 1fr auto` unter dem Namen. Die
  Regeln zu `.stars .sdel` sind weg.
- **Die Kästen.** `.server-kasten` (Rand `--line-2`, Fläche `--surface-2`) mit
  `.server-kopf` (0,78 rem, Versalien), `.server-zeile` (Befehl in Monospace,
  rollbar, Kopierknopf daneben); `.mehr` und `.mehr-text` für den Aufklapper
  „Mehr" an den Karten; `.weitere-filter > summary` mit eigenem Pfeil; der Toast
  mit Knopf (`.toast.mit-knopf`, `.toast-knopf`).

### `public/app.js`

- **Die Texte (Bauabschnitt 3).** Rund 250 Stellen nach den Anlagen A bis H des
  Konzepts und den Regeln S1 bis S7: die Anmeldeseite (Zugang beantragen), die
  Übersicht (Filterleiste mit „Alle", Sortieren, Ansichten, Leerzustände), der
  Eintrag (Blöcke, Kästen, Tooltips „Noch nicht bewertet", „Durchschnitt 4,0 aus
  2 Bewertungen"), Glocke („Neuigkeiten", „Keine Neuigkeiten"), Vergleich,
  Offen, und alle einundzwanzig Karten der Einstellungen: **jede
  Kartenbeschreibung ein Satz**, alles Weitere hinter `mehr()` (nur Admin und
  Eigentümer, S4). Die Toasts sagen „Gespeichert" und heißen sonst höchstens
  fünf Wörter; die Rückgängig-Formel ist überall dieselbe.
- **Die Rollenweichen (S5).** `serverKasten(satz, befehl)` prüft die Rolle
  selbst (`if (!EIGENTUEMER) return ''`) und trägt genau vier Befehle: Passwort
  zurücksetzen (Mein Konto und Benutzer), zweiter Faktor, `docker compose up -d`
  nach dem Umzug des Schlüssels; `kopiereText()` hängt am Kopierknopf über
  `[data-kopie]`. Der Klartextschlüssel steht nur beim Eigentümer, der Admin
  liest einen Satz (E13). Der Knopf „Eintrag löschen" wird nur für Verfasser und
  Admin gezeichnet (E10). Die Karten „Kategorien" und „Tags" zeigen dem
  Benutzer die Liste und einen Satz, dem Admin die Werkzeuge.
- **Die Dialoge (Bauabschnitt 4).** Acht Stellen liefen über `confirm()` und
  `prompt()`; alle gehen jetzt durch `confirmBox()` (Titel: Verb, Objekt,
  Fragezeichen; Knopf wiederholt das Verb), durch `neuesPasswortFenster(titel,
  satz)` (ein Passwortfeld, `#np-pass`, `autocomplete="new-password"`) und durch
  `benutzerLoeschenFenster(name, nummer, b)` — **ein** Fenster mit den zwei
  Häkchen `#bl-eintraege` und `#bl-beitraege`, das `{eintraege, beitraege}` oder
  bei „Abbrechen" `null` liefert; erst danach die zweite Bestätigung.
- **Der Aufklapper „Weitere Filter" (E8).** Die Tagzeile steht in einem
  `<details class="weitere-filter">`; `weitere.open = WEITERE_FILTER_OFFEN ||
  f.tagIds.length > 0`, und `filterZahl()` zählt die Tags weiter mit.
- **Der Bildstreifen (G7).** `STREIFEN`, `STREIFEN_STUFEN = [60, 80, 100, 120,
  150]`, `wendeStreifenAn()` setzt `--streifen` am Dokument, `drawStreifen()`
  zeichnet die fünf Pillen neben der Schriftgröße und schreibt die Wahl über
  `PUT /api/settings { streifen }` — dieselbe Maschine wie `schrift`.
- **Das Rechteck (G8).** `ausRechteck(a, e)` rechnet aus zwei Eckpunkten Mitte
  und Zoom (auf 5 gerundet, 100 bis 400 begrenzt); `v.onpointermove` beginnt
  das Rechteck ab sechs Bildpunkten Weg, ein Klick setzt weiter nur den Punkt;
  `zeigeZoom()` zieht den Schieber nach.
- **Die Sternzeile (E15, E16).** `zuruecksetzKnopf(value, onReset)` baut den
  runden Knopf (`.rzurueck`, `.leer` ohne eigenen Stern, `aria-label` „Meine
  Sterne entfernen"); die Zeile hängt ihn als vierte Zelle `.rzz` an; der Klick
  schickt `PUT` mit `value: 0` und zeigt `toast('Sterne bei „…" entfernt',
  false, { text: 'Rückgängig', tu: () => set(alt) })` — **der alte Wert wird
  zurückgeschrieben, nicht aus der Anzeige geraten**; der Toast mit Knopf steht
  sechs Sekunden statt 2,6.
- **Die Kopfzeile.** Ein Rollwächter setzt `.masthead.gerollt` ab acht
  Bildpunkten; `gespeichert(el)` zeigt „Gespeichert" und lässt die Karte einmal
  grün aufleuchten; `leerZustand(satz)` zeichnet den einen Leerzustand.

### `server.js`

- `VOKABULAR_VORGABE` endet auf `bewertungEinzahl: 'Bewertung'` und
  `bewertungMehrzahl: 'Bewertungen'` — das 13. und 14. Wort, mit Rückfall auf
  die Vorgabe bei leerem Feld (E14).
- `PERSOENLICHE_SCHLUESSEL` trägt `streifen`; `bildstreifen(benutzerId)` liest
  die Stufe mit Vorgabe 80; `PUT /api/settings` weist eine Zahl außerhalb der
  fünf Stufen mit „Diese Größe für den Bildstreifen gibt es nicht." ab
  (`STREIFEN_STUFEN`); `GET /api/settings` liefert `streifen` mit.
- Die Servermeldungen sprechen die Wörter des Wörterbuchs: „Der Unterordner
  liegt im eingerichteten Sicherungsordner …", „Den Unterordner „…" gibt es im
  Sicherungsordner nicht. Er wird nicht angelegt — leg ihn auf dem Server an.",
  „Bitte einen Titel eingeben.", „Diese Phase gibt es nicht." — und keine
  Meldung nennt mehr Kasten, Kopie, Zielort oder Wirt.

### `auth.js`

- „Dieser Name ist reserviert.", „Diesen Benutzer gibt es nicht.", „Dieser
  Benutzer ist bereits gelöscht.", „Dieser Benutzer ist nicht aktiv.", „Das ist
  der letzte Eigentümer — bitte vorher einen zweiten bestimmen.", „Dein Konto
  gibt es nicht mehr.", „Dein Konto ist gesperrt." — dieselben Prüfungen,
  andere Worte.

### `pruefung.js`

- **Neun neue Gruppen** (siehe Abschnitt 8): der Bildschirmtext-Wächter (mit
  dem Leser `bildschirmtexteVon()`/`servertexteVon()` und der Verbotsliste
  `BILDSCHIRM_VERBOT` oben im Modul), Kein Milchglas, Keine Browserfenster,
  Server-Befehle nur im Kasten, Die Einstellung streifen, Die Sternzeile, Der
  Aufklapper, Die Rollenweichen; das Vokabular bei vierzehn und die neun
  persönlichen Schlüssel in den vorhandenen Gruppen.
- **`stelleBestaetigung(w, ja, mitschrift)`:** ein `MutationObserver` am
  Dokument drückt an jedem neuen Fenster ohne Eingabefeld den Ja- oder
  Nein-Knopf — der Ersatz für `w.confirm = () => true`, das seit Bauabschnitt 4
  ein Stellrad ohne Wirkung wäre. Fenster mit Feldern (Passwort, Häkchen)
  bedient die Prüflage selbst.
- **Rund neunzig Zusagen umgedreht statt gelöscht** (Abschnitt 6); zwei Gruppen
  heißen neu.
- Die Zahl der Rückbauten steht auf **635**.

### `gegenprobe.js`

- **Rückbauten 624 bis 641** (Abschnitt 8) und **42 nachgezogen** — jeder, dessen
  Suchtext ein Bildschirmtext war, der sich geändert hat (Stolperstein 201):
  13, 30, 68, 123, 143, 167, 168, 169, 170, 180, 181, 203, 204, 238, 264, 283,
  284, 296, 302, 315, 316, 327, 330, 334, 337, 363, 367, 377, 383, 453, 454,
  455, 472, 473, 485, 505, 522, 551, 583, 584, 585, 601. **Keiner ist
  weggefallen.**

### `package.json`, `package-lock.json`

- Version **0.22.0**, in der Lock-Datei an zwei Stellen.

### Die Papiere

- `Doku/Projektstand_Kriterion_0_22_0.md` (per `git mv` aus `_0_21_1`,
  Revision 59): Kopf, Betriebsstand, Abschnitt 4 (die Karten unter ihren neuen
  Namen), **Abschnitt 5.6 mit G1 bis G8 und S1 bis S7 als geschriebene Regel**,
  Stolpersteine 314 bis 316, Prüfstand (Abschnitt 7), Versionsgeschichte,
  Fahrplan (0.22.0 ist gebaut; die Ausarbeitung aus 10a ist herausgefallen; die
  nächste eingeschobene Runde nimmt 0.25.0), offene Betriebspunkte.
- `README.md`: „Rollen und Benutzer", Registrierung, Mein Konto, Einstellungen,
  Suchmaschinen, Bildformate, Sicherungsordner; der Bildstreifen und das
  Rechteck unter „Bedienung"; **der neue Abschnitt „Auf dem Server"**.
- `CHANGELOG.md` in der Form ab 0.17.2, ohne Kasten.
- `Doku/Fehler_und_Ideen.md`: Punkt 10 (der Bildstreifen) ist gebaut und
  herausgefallen; die zwölf liegen gebliebenen Sätze aus Teil II sind als
  erledigt vermerkt.
- **Die beiden Konzeptpapiere bleiben liegen**, samt Anlage — als Herleitung.
  Der Auftrag bleibt liegen, bis der nächste geschrieben wird.

---

## 3. Die Kennwerte des Stilblatts — gemessen

*Gemessen am gebauten Stand: die Regeln gelesen, und was jsdom nicht misst, in
Chromium am laufenden Server nachgemessen (Abschnitt 5).*

| Element | 0.21.1 | 0.22.0 (gemessen) |
|---|---|---|
| Kopfzeile `.masthead` | Verlauf auf `--bg` plus `backdrop-filter: blur(10px)` | deckend `var(--bg)`, Linie darunter; ab 8 px Rollweg Klasse `gerollt` mit `--sh-sm`; kein `blur` |
| Dialoghintergrund `.backdrop` | Schleier 74 % plus `blur(3px)` | Schleier 78 %, kein `blur` |
| Kachel beim Überfahren `.card:hover` | −3 px, `--sh`, Bild ×1,03 in 0,4 s | **−2 px**, `--sh`, Bild **×1,02** in **0,3 s** |
| Listenzeile beim Überfahren (`.mrow`, `.trow`, `.arow`, `.lrow`) | keine Antwort (nur `.lrow`) | Hintergrund `--surface-3`, 0,15 s — dieselbe Regel für alle vier |
| Pille beim Überfahren | Rand `--accent-line` | Rand plus Hintergrund `--accent-dim`; die gewählte bleibt gefüllt |
| Fokusring | 2 px `--accent`, 2 px Abstand | unverändert (G5) |
| Übergänge | 48 Angaben, Dauern 0,10 / 0,12 / 0,14 / 0,15 / 0,16 / 0,18 / 0,4 s | 55 Angaben: Farbe und Rand **0,15 s** (78 Nennungen), Bewegung 0,18 s, Bild 0,3 s; eine Kurve `--ease` |
| Blockkopf `.label` | Monospace 0,7 rem, `--faint` | **0,8 rem, `--muted`**; Zähler in `--text-2` |
| `.eyebrow` | 0,7 rem, `--faint` | 0,78 rem, `--muted` |
| Kartenbeschreibung `.desc` | 0,87 rem, mehrere Absätze | 0,87 rem, **ein Satz**, Rest hinter „Mehr" |
| Rolle und Zustand in der Benutzerliste | graue Wörter | `.rolle-marke` — Eigentümer gefüllt, Admin umrandet, Benutzer neutral; `.zug-punkt` 8 px in Grün / `--faint` / `--accent` |
| Glocke `.glocke-punkt` | erscheint | schwillt einmal an (0,3 s, `scale(0) → 1,4 → 1`) |
| gespeicherte Karte | Toast | Toast bleibt; `.sys-card.gespeichert` leuchtet einmal grün (0,4 s) |
| Bildstreifen `.thumbs` | breit `flex`, 62 × 62 px fest; Telefon Raster `minmax(60px, 1fr)` | überall Raster `minmax(var(--streifen), 1fr)`, `aspect-ratio: 1/1`; `--streifen` 80 px als Vorgabe — **gemessen: sechs Kacheln je Zeile in einer 470 px breiten Spalte am Schreibtisch, vier auf 390 px Telefonbreite** |
| Bildausschnitt | Klick setzt Punkt, Schieber setzt Weite | Rechteck setzt beides; Schieber bleibt |
| Rücksetzknopf der Sternzeile | `.stars .sdel`, 1,2 rem breit, in der Sternreihe | `.rzurueck` 26 × 26 px rund in der vierten Zelle, `visibility: hidden` ohne eigenen Stern; 32 × 32 px auf dem Telefon |
| Zeitleiste `.zl` | Kasten mit Rand und Hintergrund | ohne Rand, nur Linien und Punkte; Höhe wie zuvor (60 px Achse) |
| Toast | 2,6 s | 2,6 s; **mit Knopf 6 s** |
| Systemkarten | Reihenhöhe = höchste Karte | Regel bleibt; dass die Karten gleichmäßiger werden, weil der Text auf einen Satz fällt, ist im Augenschein gesehen und **nicht gemessen** |

---

## 4. Die Bedienelemente je Ansicht und je Rolle — vorher und nachher

*Gezählt mit derselben Prüflage (`baueDom`), am Stand 0.21.1 und am gebauten
Stand: Knöpfe, Felder, Häkchen, Auswahlen, Pillen und Aufklapper, sichtbar. Die
Zeilen, in denen sich nichts geändert hat, sind weggelassen (31 von 57).*

| Rolle | Ansicht / Karte | vorher (0.21.1) | nachher (0.22.0) | Unterschied — und woher |
|---|---|---|---|---|
| Benutzer | Übersicht | 25 | 26 | +1 Aufklapper „Weitere Filter" (E8) |
| Benutzer | Eintrag | 51 | 53 | +2: die Rücksetzknöpfe sind Knöpfe (bis 0.21.1 Zeichen in der Sternreihe) |
| Benutzer | Vergleich | 25 | 26 | +1 Aufklapper |
| Benutzer | Einstellungen › Darstellung | 7 | 12 | +5 Pillen des Bildstreifens |
| Admin | Übersicht | 25 | 26 | +1 Aufklapper |
| Admin | Eintrag | 77 | 80 | +3 Rücksetzknöpfe |
| Admin | Vergleich | 25 | 26 | +1 Aufklapper |
| Admin | Einstellungen › Darstellung | 7 | 12 | +5 Pillen |
| Admin | Einstellungen › Bewertung: Kriterien | 11 | 12 | +1 Aufklapper „Mehr" |
| Admin | Einstellungen › Potenzial: Kriterien | 2 | 3 | +1 „Mehr" |
| Admin | Einstellungen › Vokabular | 14 | 16 | +2 Felder (E14) |
| Admin | Einstellungen › Suchmaschinen | 27 | 29 | +2 „Mehr" |
| Admin | Einstellungen › Benutzer | 15 | 16 | +1 „Mehr" |
| Admin | Einstellungen › Anfragen | 5 | 6 | +1 „Mehr" |
| Eigentümer | Übersicht | 25 | 26 | +1 Aufklapper |
| Eigentümer | Eintrag | 77 | 80 | +3 Rücksetzknöpfe |
| Eigentümer | Vergleich | 25 | 26 | +1 Aufklapper |
| Eigentümer | Einstellungen › Mein Konto | 7 | 8 | +1 Kopierknopf im Kasten „Auf dem Server" |
| Eigentümer | Einstellungen › Darstellung | 7 | 12 | +5 Pillen |
| Eigentümer | Einstellungen › Bewertung: Kriterien | 11 | 12 | +1 „Mehr" |
| Eigentümer | Einstellungen › Potenzial: Kriterien | 2 | 3 | +1 „Mehr" |
| Eigentümer | Einstellungen › Vokabular | 14 | 16 | +2 Felder |
| Eigentümer | Einstellungen › Suchmaschinen | 27 | 29 | +2 „Mehr" |
| Eigentümer | Einstellungen › Benutzer | 16 | 18 | +1 „Mehr", +1 Kopierknopf |
| Eigentümer | Einstellungen › Anfragen | 5 | 6 | +1 „Mehr" |
| Eigentümer | Einstellungen › Kennzahlen | 0 | 1 | +1 Kopierknopf (`docker compose up -d`, solange der Schlüssel neben der Datenbank liegt) |

**Keine Zahl ist kleiner geworden.** *Die eine Stelle, an der ein Element
verschwindet, zählt die Prüflage nicht: der Knopf „Eintrag löschen" an einem
fremden Eintrag, für den Benutzer, der nicht löschen darf (E10) — die Prüflage
sieht den Eintrag als Verfasser. Für ihn war der Knopf nie eine Funktion,
sondern eine Fehlermeldung auf Vorrat; er ist nirgends hingezogen, sondern
weg.* Die Kacheln, Blöcke und Sternreihen selbst sind unverändert.

---

## 5. Der Augenschein — und was dabei zurückgenommen wurde

**Gefahren mit Chromium am laufenden Server** (eine Prüflage aus drei
Benutzern, drei Einträgen, neun Fotos, acht Kriterien, zwei Kommentaren): je
Rolle und je Schirm (1280 × 900 und 390 × 844 als Telefon) die Übersicht, zwei
Einträge, der Vergleich, „Offen" und alle fünf Reiter der Einstellungen — 64
Bildschirmfotos, dazu das Löschfenster, das Passwortfenster und der Toast mit
„Rückgängig". Zum Vergleich dieselben Seiten am Stand 0.21.1.

**Drei Funde, zwei davon behoben, bevor der Prüfstand sie gesehen hätte:**

1. **Die Filterpillen des Sicherheitsprotokolls waren doppelt so hoch wie
   alle anderen** — 61 statt 31 Bildpunkte, und die Zahl stand unter dem Wort.
   *Ursache: die neue Regel für den Leerzustand hieß `.leer`, und dieselbe
   Klasse trägt seit 0.17.3 eine Pille ohne Treffer; die Flex-Reihe streckte
   dann jede Pille auf die Höhe der gestapelten.* **Behoben: die Klasse heißt
   `leer-zustand`.** Gemessen danach: 31,3 px, wie in 0.21.1. *Die Lehre steht
   nicht als eigener Stolperstein, sie ist Stolperstein 47 an einer Klasse:
   ein Name, der zwei Dinge meint, meint irgendwann beide.*
2. **„Die Testmail geht ausschließlich an die Adresse deines eigenen
   Zugangs"** — ein Wort, das der Wächter nicht sah, weil `\bZugang\b` an
   „Zugangs" nicht greift. **Behoben:** „Kontos", der Wächter fängt seither
   `Zugangs?`, und der Rückbau, der auf den Satz zeigte, ist mitgegangen.
3. **E12 — der leisere Rand `--line-2`: angesehen und behalten.** Systemkarten,
   Blöcke und die Zeilen der Sternliste sind auf dem dunklen Grund weiterhin
   als Fläche zu erkennen, und der Blick fällt auf das Bedienelement statt auf
   den Rahmen. *Zurückgenommen wird nichts; die Frage nach schlechten
   Bildschirmen bleibt eine Frage an 0.23.0 („Die Oberfläche wird hell"), wo
   jeder Randwert ohnehin ein zweites Mal entschieden wird.*

**Was auffiel und nicht aus dieser Runde stammt** (Abschnitt 10): der Titel
eines Eintrags wird auf dem Telefon rechts abgeschnitten statt umgebrochen (so
auch in 0.21.1); die Knöpfe „Mit Fotos (~ 301,5 KB )" tragen durch den
`gap` des `.btn` ein Leerzeichen vor der Klammer (so auch in 0.21.1); die Karte
„Bewertung: Kriterien" erklärt dem Benutzer das Gewicht, das er nicht stellen
kann (der Satz stand schon in 0.21.1 und liest sich als Erklärung der Marke
`×1`, die er sieht).

**Und was am gebauten Stand bestätigt ist:** sechs Kacheln je Zeile im
Bildstreifen am Schreibtisch, vier auf dem Telefon, bei 80 px; die Sterne aller
Zeilen beginnen an derselben Stelle, mit und ohne Knopf; das Löschfenster
zeigt bei einem Benutzer mit Einträgen das erste Häkchen samt Zahl der fremden
Beiträge; „Rückgängig" schreibt den alten Wert zurück (die Durchschnittszahl
und die Klammer stehen danach wieder da); der Admin ohne Eigentümerrolle sieht
in den Kennzahlen den grünen Kasten ohne Befehl und die Karte „Bildformate"
ohne Schalter.

---

## 6. Was umgedreht statt gelöscht wurde (Stolperstein 74)

**Eine Textrunde ändert genau das, wonach der Prüfstand sucht.** Der Auftrag
hatte es vorausgesagt: „Meine Sitzungen" elfmal, „Alles anzeigen" viermal,
„Angemeldet als" dreimal — und es waren mehr: **in 33 Gruppen hat sich der
Wortlaut einer Zusage verschoben, und keine ist gefallen.** Zwei Gruppen tragen
einen neuen Namen: „Der Einladungslink in der Karte Zugaenge" heißt „… in der
Karte Benutzer", „Die eigene Adresse in der Karte „Zugang"" heißt „… „Mein
Konto"".

| Gruppe | Zusagen mit neuem Namen | was sich verschoben hat |
|---|---|---|
| Der Einladungslink in der Karte Benutzer *(umbenannt)* | 31 | die Karte, der Kasten mit dem Link („Wer den Link hat, kann das Passwort setzen … 7 Tage gültig, einmal nutzbar"), das Fenster der gelöschten Benutzer; die Prüflage antwortet `confirmBox()` über `stelleBestaetigung()` |
| Die eigene Adresse in der Karte „Mein Konto" *(umbenannt)* | 11 | „(optional)" statt „freiwillig"; die Karte sagt in einem Satz, was sie enthält |
| Der Systembereich nach Rolle | 8 | „Mein Konto" statt „Zugang" in der Liste der Karten für jeden |
| Der Zugangstext sagt, was gilt — 0.17.1 | 7 | „(optional)"/„(erforderlich)" statt „(freiwillig)"/„(wird gebraucht)"; die drei Sätze zur Adresse |
| Die Sicherung in der Oberflaeche | 6 | „2 Sicherungen stammen von vor dem Schlüsselwechsel", „Passwort-Manager", „Alle Sicherungen hier sind jünger", „für Umzug, Archiv und Weitergabe" statt Austauschweg, „vollständige, verschlüsselte Kopie der Datenbank" statt Sicherungsweg, „kurz nicht erreichbar" statt „steht still" |
| Die Bildablage in der Oberflaeche | 5 | die Karte heißt „Bildformate"; „12 PNG-Fotos (6,0 MB) … die Originale ersetzt … Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden."; die Maße der Vorschaubilder stehen nicht mehr in der Karte (S5) |
| Die zweite Bestaetigung in der Oberflaeche | 5 | das Löschfenster mit Häkchen statt drei Rückfragen; das Passwortfeld statt `prompt()` |
| Mehrbenutzer-Anzeigen in der Oberflaeche | 4 | „Wer hat bewertet" statt „Stimmen" |
| Die Karte „Zugang": der zweite Faktor | 4 | die Karte heißt „Mein Konto"; der Befehl steht im Kasten |
| Der Papierkorb in der Oberflaeche | 4 | „kann nur der Eigentümer", „Das lässt sich nicht rückgängig machen.", „Prüfsumme (Fingerprint)", „Technische Verfahren", „256 Bit (Zufallsschlüssel)", „Journal (SQLite)" |
| Die Sternzeile — 0.21.0 | 3 | `.rzz .rzurueck` statt `.stars .sdel`; 26 px rund statt 1,2 rem; „Wer hat bewertet" |
| Die Karte „Alte Sicherungen" in der Oberflaeche | 3 | „— endgültig.", „nur Sicherungen, die Kriterion selbst angelegt hat", „Das automatische Aufräumen löscht sie nicht." |
| Die Einladungsseite in der Oberflaeche | 3 | „danach brauchst du einen neuen vom Admin", „Nach dem Setzen wirst du auf allen anderen Geräten abgemeldet" |
| Handy und Tablett: die Staffel der Umbruchpunkte | 2 | der Bildstreifen ist auf allen Schirmen ein Raster; keine festen 62 Pixel |
| Einstellungen: Vokabular und Schriftgroesse | 2 | vierzehn statt zwölf |
| Persoenliche Einstellungen | 2 | neun statt acht Schlüssel |
| Der Waechter ueber den Quelltext | 2 | „Protokoll" in genau einer ausgelieferten Zeile; „Server-Log" |
| Kommentare in der Oberflaeche · Der Dialog „Mailzugang einrichten" · Das Raster der Kriterienliste · Die Sortierung gibt den Status vor | je 2 | „Internetanschluss" statt „Hausanschluss", „SSL/TLS" statt „TLS von Anfang an"; vier und drei Zellen statt drei und zwei; „Alle" statt „Alles anzeigen" — und gezählt wird die erste Pillengruppe der Statusreihe, weil „Alle" seit E8 zweimal in ihr steht |
| Der Ausschnitt steckt in der Kachel · Favorit: der Knopf im Eintrag · Offen: der Haken · Die Karte „Anfragen" · Das Sicherheitsprotokoll · Die Karte „Mailversand" · Das Gewicht · Die Exportgroesse · Der Teilexport · Die Sternreihe — 0.14.0 · Die Gegenproben greifen · Die Compose-Datei | je 1 | ein Wort je Gruppe: „Zoom", „Registrierung", „per Kommandozeile am Server", „E-Mail ist optional.", „Löschen entfernt auch alle vergebenen Sterne", „Exportgröße (alles)", „danach lädst du jeden Teil einzeln", „Noch nicht bewertet", 635 Rückbauten |

**Dazu die Umdrehungen, die keinen neuen Namen brauchten** — ein Regex oder
ein Selektor, sonst nichts: „Keine Neuigkeiten" statt „Nichts Neues", „Höchstens
8 Ansichten" statt „8 sind das Höchste", „Mit der aktuellen Auswahl keine
Treffer" als Überfahrtext, „Begründung löschen?" als Dialogtitel, „Gerundet wird
nur das Endergebnis", „(Spalte Note)", „Kriterien ohne Sterne zählen nicht mit",
„wird endgültig gelöscht" im Vollbild, „noch nicht eingeschätzt" statt „keine
Sterne", „Durchschnitt 4,0 aus 1 Bewertung", „Neue Kommentare und Bewertungen
anderer Benutzer", „5 Neuigkeiten von anderen" — und der Einladungsbrief, der
„bleiben dir 15 Minuten" und „einen neuen Link vom Admin" sagt.

> **UND EINE GRUPPE HATTE IHREN KOPF VERLOREN.** Beim Einbau stand die neue
> Gruppe „Der Bildschirmtext-Wächter" mitten im Sprachwächter, und 21 alte
> Zusagen zählten unter dem neuen Kopf. *Aufgefallen beim Zählen je Gruppe gegen
> den Lauf am Stand davor* (Stolperstein 137) — der Block ist hinter das Ende
> des Sprachwächters gezogen, die Zahlen oben sind aus dem Lauf danach.

---

## 7. Neue Stolpersteine

- **314 — Eine Regel, die im Papier steht und im Stilblatt gebrochen wird, ist
  keine Regel; der Prüfstand muss sie kennen.** *„Kein Milchglas" stand seit
  0.19.x im Projektstand; das Stilblatt trug neun `backdrop-filter`. Seit 0.22.0
  hält eine Regelprüfung das ganze Stilblatt frei davon.*
- **315 — Ein Text, den nur die Rolle darüber braucht, gehört hinter deren
  Klemme.** *Vier Server-Befehle standen im Fließtext, einer vor jedem Benutzer.
  Seit 0.22.0 im Kasten „Auf dem Server", nur Eigentümer, gezählt.*
- **316 — „Abbrechen" bricht ab.** *Der Löschdialog für einen Benutzer stellte
  drei `confirm()`, und in zweien hieß „Abbrechen" „ohne diese Hälfte weiter".
  Seit 0.22.0 ein Fenster mit zwei Häkchen, „Abbrechen" liefert null.*

*Der Wortlaut steht im Projektstand, Abschnitt 11.*

---

## 8. Prüfstand und Gegenproben

### Prüfungen: 5571 → 5661 (+90), gezählt

*Der volle Lauf am Stand vor dieser Runde hat 5571 von 5571 gemeldet; der
Lauf am gebauten Stand 5661 von 5661 (7 Minuten 3 Sekunden). Die Aufteilung je
Gruppe ist aus beiden Ausgaben gezählt.*

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Der Bildschirmtext-Wächter — 0.22.0** *(neu)* | — | **15** | Der zweite Durchgang des Sprachwächters: jeder Text in Anführungszeichen und Backticks von `public/app.js`, jede `error:`-Meldung der Serverdateien, gegen die Verbotsliste `BILDSCHIRM_VERBOT` — erst der Leser an gestellten Fällen (Kommentare sind kein Text, ein Bezeichner ist keiner, `${…}` ist keiner), dann die Dateien |
| **Die Sternzeile — 0.22.0** *(neu)* | — | **18** | Der Knopf in seiner eigenen Spalte; die Sterne aller Zeilen beginnen an derselben Stelle; bei einem einzigen Benutzer sein Abstand; „Rückgängig" schreibt den alten Wert zurück — am gesendeten Rumpf |
| **Keine Browserfenster mehr — 0.22.0** *(neu)* | — | **10** | Kein `confirm(`, kein `prompt(` im Code; die fünf eigenen Fenster stehen da und werden gerufen; das Löschfenster ist eins mit zwei Häkchen, „Abbrechen" liefert null; das Passwortfeld |
| **Die Rollenweichen — 0.22.0** *(neu)* | — | **10** | Löschknopf, Schlüsselkasten, Kategorien und Tags — je Rolle |
| **Der Aufklapper „Weitere Filter" — 0.22.0** *(neu)* | — | **9** | offen bei greifendem Tagfilter; `filterZahl()` zählt weiter |
| **Die Einstellung streifen — 0.22.0** *(neu)* | — | **8** | Stufen, Rückfall, Absage, Pillen |
| **Server-Befehle nur im Kasten — 0.22.0** *(neu)* | — | **7** | gezählt, nicht gesucht: vier |
| **Kein Milchglas im Stilblatt — 0.22.0** *(neu)* | — | **4** | kein `backdrop-filter`; Kopfzeile deckend mit Schatten; Dialoghintergrund ohne `blur` |
| **Einstellungen: Vokabular und Schriftgroesse** | 22 | **25** | vierzehn Wörter, das Paar für die Bewertung |
| **Favorit: der Knopf im Eintrag** | 31 | **33** | „Eintrag löschen" nur bei Verfasser und Admin |
| **Die zweite Bestaetigung in der Oberflaeche** | 27 | **29** | Passwortfenster und Löschfenster vor der Bestätigung |
| **Handy und Tablett: die Staffel der Umbruchpunkte** | 29 | **30** | das Raster auf allen Schirmen |
| **Der Waechter ueber den Quelltext** | 105 | **106** | „Server-Log" |
| **zusammen** | **5571** | **5661** | **+90** |

### Rückbauten: 617 → 635 (+18), Nummern 624 bis 641

**Keiner ist weggefallen. 42 sind mitgegangen** (Stolperstein 201, Liste in
Abschnitt 2) — *fast jeder, der einen Bildschirmtext sucht, und das war
vorausgesagt.*

| # | Rückbau | Datei | Regel |
|---|---|---|---|
| **624** | Das Milchglas kommt an die Kopfzeile zurück | `style.css` | G3 (Stolperstein 314) |
| **625** | Die Glocke sagt wieder „Blick" | `app.js` | Verbotsliste |
| **626** | Die Servermeldung zur Phase eines Kriteriums sagt wieder „Kasten" | `server.js` | Verbotsliste, Serverseite |
| **627** | Das Beenden der anderen Sitzungen fragt wieder über `confirm()` | `app.js` | S7 |
| **628** | Ein Server-Befehl steht wieder im Fließtext der Karte Mein Konto | `app.js` | S5 (Stolperstein 315) |
| **629** | Ein fünfter Kasten „Auf dem Server" kommt an die Karte Sicherung | `app.js` | S5 — gezählt sind vier |
| **630** | Das fremde Passwort wird wieder über `prompt()` abgefragt | `app.js` | S7 |
| **631** | Der Bildstreifen lässt eine ungültige Stufe durch | `server.js` | E11 |
| **632** | Die Vorgabe des Vokabulars vergisst die Mehrzahl der Bewertung | `server.js` | E14 |
| **633** | Der Rücksetzknopf steht wieder in der Sternzelle statt in seiner eigenen Spalte | `app.js` | E15 |
| **634** | Rückgängig schreibt die Null statt des alten Werts | `app.js` | E16 |
| **635** | Die Zelle des Rücksetzknopfs verliert ihren Abstand | `style.css` | E15 |
| **636** | Der Aufklapper „Weitere Filter" bleibt bei greifendem Tagfilter zu | `app.js` | E8 |
| **637** | `filterZahl()` zählt die Tags hinter dem Aufklapper nicht mehr | `app.js` | E8 |
| **638** | Der Knopf „Eintrag löschen" steht wieder für jede Rolle | `app.js` | E10 |
| **639** | Der Klartextschlüssel steht wieder vor dem Admin | `app.js` | E13 |
| **640** | Die Karte Kategorien erklärt dem Benutzer wieder die Werkzeuge des Admins | `app.js` | S5 |
| **641** | Abbrechen im Löschfenster für einen Benutzer bricht nicht ab | `app.js` | S7 (Stolperstein 316) |

### Die Gegenprobentabelle

@@GP_TABELLE@@

---

## 9. Was ausdrücklich NICHT gebaut wurde

- **Keine Funktion fällt weg, und keine kommt dazu** — außer den zwei
  Vokabelwörtern. *Verschwunden sind genau die fünf Dinge, die der Auftrag
  nannte: Erklärtext (in die README oder hinter „Mehr"), doppelte Leerzustände,
  die rohen Browserfenster, das Milchglas — und der Knopf „Eintrag löschen" bei
  dem, der nicht löschen darf.*
- **Keine neue Farbe, kein helles Farbschema** — das ist 0.23.0.
- **Keine Seitenleiste, keine randlosen Karten, kein Filterkasten, keine
  Listenansicht, keine Farbe je Kategorie** (Konzept, Abschnitt 7).
- **Kein Umzug einer Karte zwischen Reitern**, keine neue Karte, keine
  gestrichene; die Adressen bleiben.
- **Keine Sprachdatei** — die Mehrsprachigkeit ist 0.28.0; diese Runde legt je
  Sache ein Wort fest.
- **Kein Kommentar im Quelltext, der nicht an einem geänderten Text hängt.**
- **Die Kopplung aus 0.21.1** ist vorgefunden und nicht angefasst.

---

## 10. Was offen geblieben ist

- **Das helle Farbschema — 0.23.0**, mit dem Farbkonzept davor
  (`Doku/Farbkonzept_0_23_0.md`, noch nicht geschrieben; Projektstand 10a).
- **Die Mehrsprachigkeit** (0.28.0).
- **Drei Beobachtungen aus dem Augenschein, die nicht aus dieser Runde
  stammen:** der Eintragstitel wird auf dem Telefon rechts abgeschnitten statt
  umgebrochen; das Leerzeichen vor der Klammer in „Mit Fotos (~ 301,5 KB )"
  (der `gap` des `.btn`); der Satz zum Gewicht in „Bewertung: Kriterien" für den
  Benutzer. *Alle drei sind Zeilen fürs Sammelblatt, keine für diese Runde.*
- **Die Papiere sagen weiterhin „Systembereich"**, wo sie Geschichte erzählen —
  rund 700 Stellen; nachgezogen ist, was den heutigen Stand beschreibt.
- **Der volle Gegenprobenlauf** über alle 635 Rückbauten — weiter ausstehend.
- **Die Ideen, die stehen geblieben sind:** die Übersicht der Tastenkürzel
  (N7), die kompakte Listenansicht (N11); die Verlaufs-Sortierungen; die beiden
  Handgriffe aus 0.20.0.

---

## 0.22.0 — Fingerprint `@@FP@@`

*Gebildet zuletzt, aus einem laufenden Server über `GET /api/stats`, nach der
letzten Änderung an einer ausgelieferten Datei — die Versionsnummer in
`package.json` und `package-lock.json` eingeschlossen; `public/` gehört dazu
(Stolperstein 158).*
