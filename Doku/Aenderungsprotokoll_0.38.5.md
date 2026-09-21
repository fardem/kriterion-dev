# Änderungsprotokoll 0.38.5 — „Zwei Befunde des Betriebs, eine Zusage, zwei Wörter"

Gebaut am 21. September 2026, auf 0.38.4. PATCH.

Zehn Bauabschnitte, einer davon vor allen anderen: `main` war rot, und der
Grund war keine Änderung am Code. **Schema unverändert. Format unverändert.
Keine neue Route.**

| | vorher | nachher |
|---|---:|---:|
| Zeilen in `public/app.js` | 10.472 | **10.481** |
| Zeilen in `server.js` | 6.139 | **6.146** |
| Zeilen in `db.js` | 808 | **824** |
| Zeilen in `test/frame.js` | 970 | **981** |
| Zeilen in `README.md` | 1.133 | **1.280** |
| Zeilen in `manual-de.md` | 1.474 | **1.513** |
| Regelzeilen in `public/style.css` | 1.673 | **1.674** |
| Schlüssel je Sprachdatei | 1.233 | **1.233** |
| Auslieferung, gzip | 272.273 | **272.552** |
| Kommentarzeilen über alles | 16.557 | **16.660** |
| Codezeilen über alles | 66.429 | **66.661** |
| Prüfungen | 7.227 | **7.247** |
| Rückbauten | 1.115 | **1.127** |

> **FINGERPRINT DIESER RUNDE: `c4185d0a`** — der Stand davor war
> `246372bd`.

---

## 1. Drei Messungen, die den Auftrag widerlegen

Der Auftrag stand vollständig entschieden da. Drei seiner Annahmen haben der
Messung nicht standgehalten, und alle drei waren zu klein.

| | Auftrag | gemessen |
|---|---|---|
| **BA 5** — Spalten, die den Start verhindern | eine, `rating_criteria.language` | **sechzehn von achtzehn** |
| **BA 7** — Stellen mit den beiden Wörtern | 18 | **74** |
| **BA 8** — das Abzeichen für die Lizenz | „ja" | **nicht gebaut: es gibt keine Lizenz im Repository** |

**Die Zahlen stehen an ihrem Bauabschnitt, samt dem Weg, auf dem sie gemessen
worden sind.**

---

## 2. BA 0 — Die Zeitbombe im Prüfstand

**`main` war rot, und keine Änderung am Code hat sie rot gemacht.** Am
21. September 2026 meldete der volle Lauf 7226 von 7227; gescheitert war
`Und carla sieht ihrerseits nur ihre beiden` in `test/roundtrip.js`.

**Die Ursache:** die Prüflage setzte vier Sitzungen mit festen Zeitstempeln und
maß sie gegen ein mitlaufendes Fenster von dreißig Tagen (`SESSION_DAYS`,
`auth.js`:101). Am 21. September war `carla-2` genau dreißig Tage alt und fiel
heraus.

| Sitzung | `last_seen` alt | Alter am 21.09. | in der Liste |
|---|---|---:|---|
| anna-1 | 2026-08-24 07:30 | 28 Tage | ja |
| anna-2 | 2026-08-23 21:00 | 28 Tage | ja |
| carla-1 | 2026-08-24 06:00 | 28 Tage | ja |
| **carla-2** | **2026-08-22 09:45** | **30 Tage** | **nein** |

**Gebaut:** die acht Zeitstempel rechnen gegen die Uhr statt festgeschrieben zu
sein — `last_seen` auf −1, −2, −3 und −4 Tage, `created_at` auf −10, −12, −14
und −16. Alle acht liegen im Fenster, alle acht sind verschieden, und die
Reihenfolge je Benutzer ist dieselbe wie vorher. Gerechnet wird mit
`datetime('now', ?)`, der Form, die der Prüfstand an elf anderen Stellen schon
benutzt.

### Die Nachschau: gibt es weitere?

**Gesucht wurde von beiden Seiten.**

**Erstens die Fenster im ausgelieferten Code.** Vier Stellen nennen einen
festen Abstand (`auth.js`:591, :606, :1170 — dreimal dasselbe Sitzungsfenster;
`server.js`:1886 — eine Sekunde), elf weitere binden den Abstand als Parameter:
die Anmeldebremse, die Token, die Anfragen, das Sicherheitsprotokoll und der
Papierkorb. Dazu zwei Rechnungen in JavaScript (`server.js`:5425 und :5593).

**Zweitens die festen Daten im Prüfstand.** In `test/` und den Rückbauten
stehen **252 feste Datumsangaben**. Geprüft wurde jede Schreibstelle auf die
sechs Tabellen, die an einem mitlaufenden Fenster hängen — `sessions`,
`login_attempts`, `tokens`, `requests`, `security_log`, `trash`.

> **ES IST NICHTS WEITER GEFUNDEN WORDEN.** Jede andere Schreibstelle lässt die
> Zeitspalte weg — dann setzt die Vorgabe des Schemas `datetime('now')` — oder
> rechnet selbst mit `datetime('now', …)`. Die Sitzungen waren die einzige
> Stelle, die ein festes Datum an ein mitlaufendes Fenster stellte.

**Zwei Dinge bleiben stehen, und beide sind in Ordnung:** die Sitzungskarten in
`test/dom.js`:272–277 tragen feste Daten, erreichen aber keine Datenbank — die
Oberfläche zeigt `daysAgo` so an, wie der Server es gerechnet hat, und rechnet
nichts nach. Und `test/roundtrip.js`:2060 prüft mit `'2099-01-01'`, dass ein
Testtag in der Zukunft abgewiesen wird; diese Zahl läuft im Jahr 2099 ab.

**Gegenprobe 1181** setzt die vier festen Zeitstempel wortgleich wieder ein.

---

## 3. BA 1 und BA 2 — Zwei Handgriffe an den Papieren

**Der Fingerprint von 0.38.4 heißt `246372bd`.** `CHANGELOG.md` und
`Doku/Aenderungsprotokoll_0.38.4.md` nannten `0d3111e4` — eine Zahl, die zu
keinem Commit gehört. Nachgemessen an `8cec0e8`, dem ersten Commit der Runde,
an `5aeb27b`, an `bacc93a` und an `0fb3dad`: alle vier tragen `246372bd`.
Daneben steht in beiden Papieren, warum die Zahl sich geändert hat.

**`Doku/Auftrag_0.38.4.md` ist entfernt.** Die Runde ist gebaut, und es liegt
immer nur ein Auftrag im Repository.

---

## 4. BA 3 — Die Rechentabelle rollte waagerecht

**Befund des Betreibers vom 21. September 2026.** Der Kasten „Wie die
Durchschnittszahl zustande kommt" rollte auf dem Telefon waagerecht.

**Die Ursache stand in einer Zeile.** `.calc` ist ein Raster mit
`grid-template-columns: 1fr auto auto auto`; `1fr` ist `minmax(auto, 1fr)`, und
`auto` als Untergrenze heißt: mindestens so breit wie der längste Inhalt, der
nicht umbrechen kann. Die erste Spalte trug weder `min-width: 0` noch ein
Umbruchrecht.

**Gemessen in Chromium bei 360 CSS-Pixeln, Pixeldichte 3:**

| | vorher | nachher |
|---|---:|---:|
| Tabelle, gebraucht — Name aus 40 Zeichen | **378 px** | **328 px** |
| Tabelle, sichtbar | 328 px | 328 px |
| rollt waagerecht | **ja** | **nein** |
| erste Spalte | 190 px | **88,7 px** |
| Kopfzellen | 190 · 33 · 56,6 · 56,6 | **88,7 · 33 · 56,6 · 107,7** |

Bei kurzen Namen ändert sich nichts: 328 px vorher wie nachher.

**Gebaut ist dieselbe Reparatur, die `.rrow .rname` seit längerem trägt** —
`min-width: 0; overflow-wrap: anywhere`, in derselben Medienabfrage und in der
Zeile daneben.

> **DIE KOPFZEILEN HABEN NICHTS GEBRAUCHT.** Der Auftrag hielt es für möglich,
> dass die Reparatur der ersten Spalte nicht reicht. Die Messung sagt das
> Gegenteil: die vier Kopfzellen stehen nachher **breiter** da als vorher, weil
> die erste Spalte ihnen keinen Platz mehr wegnimmt. Die Regel greift für sie
> ohnehin mit — sie tragen dieselbe Klasse.

**Gegenprobe 1182** nimmt die Zeile wieder weg.

---

## 5. BA 4 — Die Zählzeile der Meldungstafel

**Fassung B, entschieden vom Betreiber.** Das Wort bleibt beim ersten Stück,
die Bewertungen bekommen das Zeichen, der lange Wortlaut wandert in den
Überfahrtext — dieselbe Trennung, die `commentNumbers()` für den Blockkopf
schon liefert.

| | Zeile | Überfahrtext |
|---|---|---|
| vorher | `12 Kommentare · @34 · 56 Bewertungen` | — |
| **Fassung B** | `12 Kommentare · @34 · ★56` | `12 Kommentare · 34 an mich gerichtet · 56 Bewertungen` |

**Gemessen in Chromium bei 360 CSS-Pixeln, in allen drei Sprachen:**

| Sprache | Zeichen vorher | Breite vorher | Zeichen nachher | Breite nachher |
|---|---:|---:|---:|---:|
| Deutsch | 36 | 227,6 px | 25 | **158,1 px** |
| English | 30 | 189,7 px | 23 | **145,4 px** |
| Türkçe | 33 | 208,6 px | 20 | **126,5 px** |

> **DIE HOCHRECHNUNG DES AUFTRAGS IST BESTÄTIGT.** Er rechnete mit „rund
> 158 Pixeln" für Fassung B auf Deutsch; gemessen sind **158,1**. Und die
> Spalte „vorher" trifft die Messung von 0.38.4 Zeichen für Zeichen
> (227,6 · 189,7 · 208,6), obwohl dort bei 390 Pixeln gemessen wurde: die Zeile
> bricht in keiner der drei Sprachen um, ihre Breite hängt deshalb nicht an der
> Schirmbreite.

**Das `★` ist nicht erfunden:** `public/app.js` schreibt es an der Sternzeile.
Es steht in einem `countMark()` wie die Markierung daneben und bricht damit
nicht von seiner Zahl weg.

**Die Übersichtskachel ist nicht angefasst.** Sie schreibt seit je eine Zahl.

**Gegenproben 1183 und 1184.**

---

## 6. BA 5 — „Die Instanz startet trotzdem"

`db.js` schreibt beim Start über eine unvollständige Datenbank einen Kasten,
und der sagt zwei Dinge zu:

> THIS INSTANCE STARTS ANYWAY. Nothing is blocked and nothing is
> changed; but every page that reads one of the parts above fails
> until the database has been through that version.

**Der Auftrag rechnete mit einer Spalte, für die das nicht stimmt. Es sind
sechzehn.**

### Erst messen

Je Eintrag aus `REQUIRED_COLUMNS` eine Testdatenbank, die Spalte daraus
entfernt, den **ganzen Server** hochgezogen und `/api/config` gefragt.

| | |
|---|---:|
| Spalten geprüft | 18 |
| **Spalten, die den Start verhinderten** | **16** |
| Spalten, die ihn nicht verhinderten | 2 — `comments.images_removed`, `tokens.purpose` |

Danach dieselbe Messung noch einmal, diesmal mit umgelenktem `db.prepare`: es
vermerkt den Fehler und gibt einen Platzhalter zurück, damit das Laden
weiterläuft und **alle** Stellen sichtbar werden statt nur der ersten.

| | |
|---|---:|
| Gesuche, die beim Laden scheitern | **33** in `server.js`, **2** in `auth.js` |
| Stellen, die beim Start schreiben wollen | 2 |

### Dann bauen

**Die betroffenen Gesuche werden erst beim ersten Ruf vorbereitet.** `db.js`
liefert dafür zwei Helfer:

```js
const lateStatement = (sql) => {
  let ready = null;
  return () => (ready || (ready = db.prepare(sql)));
};
```

`lateGroup()` tut dasselbe für eine Gruppe, die zusammengehört — die drei
Bildspalten von `qPhotoBytes`.

> **UND ZWAR SO UND NICHT ANDERS.** Der nächstliegende Weg wäre, die
> Spaltenliste von der Spalte abhängig zu machen. Er wäre falsch: die Seite
> liefe dann mit fehlenden Daten weiter und behauptete Vollständigkeit. Der
> späte Ruf trifft beides — die Instanz startet, und die lesende Seite
> scheitert.

**Zwei Stellen laufen beim Start und schreiben.** Das Einsetzen der drei
mitgelieferten Kriterien und das Aufräumen der abgelaufenen Token. Für sie
gilt der zweite Satz des Kastens: *nothing is changed*. Über einer
unvollständigen Datenbank laufen beide nicht mehr; der Merker dafür ist
`DATABASE_INCOMPLETE`, und er fragt dieselbe Probe, die den Kasten geschrieben
hat.

### Nachgemessen

| | vorher | nachher |
|---|---:|---:|
| Spalten, die den Start verhindern | **16** | **0** |

**Die Prüflage in `test/roundtrip.js` zieht jetzt die ganze Instanz hoch** und
nicht mehr nur `db.js`. Sie kostet die Gruppe rund elf Sekunden statt einer
halben; gemessen wird über `PORT=0` — gefragt ist, ob das Modul lädt, und mit
keinem Server geredet.

**Gegenproben 1185 und 1186.**

---

## 7. BA 6 — Der Aufräumer auf vier Spuren

**Was gemeldet war:** bei einem Gegenprobenlauf mit vier Nebenspuren wird die
Prüfgruppe „Der Prüfstand räumt beim Start auf" in neun von einundzwanzig
Läufen rot, bei Rückbauten, die mit ihr nichts zu tun haben.

### Die Lage nachgestellt

Vier Prüfläufe gleichzeitig, jeder mit dem Versatz seiner Spur, gefiltert auf
diese eine Gruppe — dieselbe Lage, die ein Gegenprobenlauf mit vier Spuren
herstellt.

| Runde | Spur 0 | Spur 1 | Spur 2 | Spur 3 |
|---|---|---|---|---|
| 1 | **rot** | **rot** | **rot** | grün |
| 2 | **rot** | **rot** | grün | **rot** |
| 3 | **rot** | grün | **rot** | **rot** |

**Neun von zwölf rot, und in jeder Runde genau eine grüne Spur.** Die Ursache
steht in dieser Verteilung: es ist ein Wettlauf, und es gewinnt genau einer.

### Welcher Zweig der Erkennung greift

Rot waren immer dieselben zwei Prüfungen, und die Meldung sagt es wörtlich:

```
✗ Der Aufraeumer findet ihn — am Wegwerfverzeichnis und nicht am Namen
      nichts gefunden
✗ Und er sagt, was er angefasst hat
      0 geraeumt, 0 uebrig
```

**Jede der vier Spuren stellt einen Rest hin** — einen abgehängten Prozess mit
einem Verzeichnis unter `/tmp/kriterion-`. `leftovers()` erkennt einen Rest an
drei Dingen: das Verzeichnis liegt unter der gemeinsamen Wurzel, der Vater ist
fort, und er ist kein Kind dieses Laufs. **Alle vier Reste erfüllen das für
alle vier Spuren.** Wer zuerst räumt, nimmt die drei fremden mit; die anderen
drei finden danach ihren eigenen nicht mehr.

**Das ist nicht nur ein Fehler der Prüflage.** Ein Server, dessen Modulprozess
gestorben ist, während sein Lauf weiterläuft, sieht für eine Nebenspur genauso
aus — und würde ihr mitten im Lauf weggeräumt.

### Behoben

`test/frame.js` setzt `KRITERION_RUN` auf die eigene Prozessnummer. Die Zahl
reist in der Umgebung an jedes Kind und an jeden Enkel weiter, auch an den,
dessen Vater stirbt. `leftovers()` übergeht einen Prozess, dessen Laufnummer
einen **lebenden fremden** Lauf nennt.

Ein Rest eines beendeten Laufs trägt eine tote Nummer und wird weiterhin
gefunden — auch der, den die Prüflage selbst hinstellt: er trägt die Nummer
dieses Laufs und ist trotzdem kein Kind von ihm.

### Nachgemessen

| | rote Spuren |
|---|---|
| vorher, 3 Runden | **9 von 12** |
| nachher, 5 Runden | **0 von 20** |

**Eine eigene Prüfgruppe hält es fest**, und sie fährt beide Richtungen: ein
Rest mit fremder lebender Laufnummer bleibt stehen, derselbe Rest mit toter
Laufnummer wird gefunden. Sie wartet dabei auf die Bedingung und nicht auf die
Uhr — an genau einer Stelle steht eine feste Wartezeit von 25 ms.

**Gegenproben 1187 und 1188.**

---

## 8. BA 7 — Die beiden Wörter

`CLAUDE.md` führt `Auffangnetz` und `Grundausstattung` unter „nicht
verwenden". **Der Auftrag zählte 18 Stellen. Es sind 74.**

### Warum die Zahl so viel größer ist

**Der Sprachwächter liest zwei Dinge:** die Kommentare von vierzehn
Quelltextdateien samt allen Modulen des Prüfstands — und die **Prosa** von
`Doku/*.md`, `README.md`, `CHANGELOG.md` und `manual-de.md`.

| | |
|---|---:|
| ausgelieferte Dateien | 5 |
| Namen — Gruppe, Prüfungen, Rückbau, `expected` | 7 |
| weitere Kommentare im Prüfstand und in den Rückbauten | 11 |
| **Prosa der Papiere** | **51** |
| **zusammen** | **74** |

Die 51 stehen in 23 Dateien, davon 18 Änderungsprotokolle.

### Die Ersatzwörter

| Stelle | vorher | nachher |
|---|---|---|
| `db.js`, zwei Abschnitte | `Auffangnetz` | **Rückfall** |
| `server.js`, der letzte Stapelrahmen | `Auffangnetz` | **Fehler-Handler** |
| `auth.js`, die zweite Aufrufstelle | `Auffangnetz` | **Rückfall** |
| `db.js`, Titel und Stempel | `Grundausstattung` | **Vorgabewerte** |
| die Prüfungen an den drei Kriterien | `Grundausstattung` | **die mitgelieferten Kriterien** |

> **`Grundausstattung` MEINTE ZWEI VERSCHIEDENE SACHEN**, und ein einziges
> Ersatzwort wäre falsch gewesen: in `db.js` sind es die Vorgabewerte für Titel
> und Stempel, in den Prüfungen die drei mitgelieferten Kriterien.

### Drei Arten von Stellen, drei Behandlungen

**Erstens der Gegenstand aus `db.js`.** Er heißt jetzt Rückfall
beziehungsweise Vorgabewerte — auch dort, wo ein Änderungsprotokoll über ihn
schreibt.

**Zweitens das Bild im allgemeinen Sinn.**
`über ein Auffangnetz`, `ohne Auffangnetz`, `mit Auffangnetz` —
das ist die Metapher, die `CLAUDE.md` verbietet. Sie ist durch einfaches Deutsch ersetzt: **abgefangen**, das Wort,
das der Prüfstand an fünf anderen Stellen schon benutzt, oder **ohne `try`**,
wo genau das gemeint war.

**Drittens das Wort als Name genannt.** „`Auffangnetz` und `Grundausstattung`
sind Abschnittsnamen in `db.js`" ist eine Aussage über das Wort und nicht sein
Gebrauch. Diese Stellen bleiben wörtlich stehen und wandern in Rückstriche —
der Wächter liest Prosa und lässt Code in Rückstrichen in Ruhe. **Sonst stünde
in einem Protokoll von 0.37.0, dass die Abschnitte „Rückfall" und
„Vorgabewerte" hießen; sie hießen damals nicht so.**

> **EIN ZITAT IN RÜCKSTRICHEN MUSS AUF EINER ZEILE STEHEN.** Der Wächter
> streicht Rückstrichpaare zeilenweise; ein Paar über zwei Zeilen findet er
> nicht. Zwei Stellen sind dafür umgebrochen worden.

### Der Wortfilter nimmt beide auf

Die Wortliste in `test/source.js` wächst von vierzehn auf **sechzehn Zeilen**
und von zwölf auf **vierzehn Wörter**. Beide neuen Einträge sind die einzigen,
deren Ersatz deutsch ist und nicht englisch.

**Gegenproben 1191 und 1192.** Die eine nimmt ein Wort aus der Liste, die
andere setzt den Abschnittsnamen in `db.js` zurück.

---

## 9. BA 8 — Gliederung für README und Handbuch

**Wunsch des Betreibers vom 21. September 2026.**

| | README | Handbuch |
|---|---:|---:|
| Zeilen vorher | 1.133 | 1.474 |
| Zeilen nachher | **1.280** | **1.513** |
| Abschnitte zweiter Ebene | 19 → **22** | 7 → **7** |
| Zeilen im Inhaltsverzeichnis | — → **33** | — → **21** |

> **DAS VERZEICHNIS ZÄHLT 33 ZEILEN UND NICHT 37.** Der Auftrag rechnete mit
> 37. Gezählt sind 22 Überschriften der zweiten und 11 der dritten Ebene. Für
> das Handbuch trifft seine Zahl: 21.

**Gebaut in beiden Dateien:** ein Inhaltsverzeichnis mit Sprungmarken auf jeden
Abschnitt der zweiten und dritten Ebene, die dritte eingerückt, und ein
Trennstrich zwischen den Kapiteln.

**Und in der README zusätzlich:**

1. **Voraussetzungen** als eigener Abschnitt vor der Erstinstallation.
2. Die Erstinstallation in **vier nummerierten Schritten**.
3. **Aufbau des Ordners** — welche Datei wofür da ist, und die drei Dinge, die
   nicht im Repository liegen.
4. Die drei Fehlerfälle unter **einem** Kapitel „Fehlerbehebung".
5. Zwei Abzeichen am Kopf.

### Das Verzeichnis ist keine Überschrift

Es steht als fette Zeile mit einer Liste darunter. **Eine Überschrift „Inhalt"
stünde in beiden Dateien und fiele der Zusage „Kein Abschnitt steht in beiden
Dateien" zum Opfer.**

### Das Abzeichen für die Lizenz ist nicht gebaut

**Es gibt im Repository keine Lizenz.** Keine `LICENSE`-Datei, kein `license`
in der `package.json`, kein Satz darüber in README oder Handbuch. Ein Abzeichen
hätte eine Lizenz behauptet, die nirgends steht. **Node und Docker stehen am
Kopf**; beide Angaben stehen im `Dockerfile`.

### Der Kopierschritt wird jetzt einmal genannt und nicht dreimal

Ein Wächter verlangte den Schritt `cp docker-compose.example.yml
docker-compose.yml` **dreimal**: einmal im Weg über `git`, einmal im Weg über
das ZIP und einmal im Pflichtsatz. **Mit den nummerierten Schritten treffen
sich beide Wege wieder**, bevor die `docker-compose.yml` angelegt wird; der
Schritt steht damit zweimal da. Der Wächter ist darauf gestellt, und der Grund
steht neben ihm.

### Der neue Wächter

**Er ist ein Wächter und kein Augenschein:** jede Sprungmarke trifft eine
Überschrift, die es gibt, **und** jeder Abschnitt der zweiten Ebene steht im
Verzeichnis. In beiden Dateien. Die Sprungmarke wird gebildet wie bei GitHub —
klein schreiben, Satzzeichen und Gedankenstriche weg, Leerzeichen zu
Bindestrichen, der Bindestrich selbst bleibt. **Die Bildungsvorschrift ist an
den Sprungmarken nachgeprüft, die seit 0.10.0 in einem Änderungsprotokoll
stehen.**

**Gegenproben 1189 und 1190.**

---

## 10. Prüfstand und Gegenproben

**7.247 Prüfungen, alle grün.**

Zwölf neue Rückbauten, 1181 bis 1192:

| Nummer | worauf er zielt |
|---|---|
| 1181 | die festen Zeitstempel der Sitzungen |
| 1182 | das Umbruchrecht der Rechentabelle |
| 1183, 1184 | die Zählzeile und ihr Überfahrtext |
| 1185, 1186 | das frühe Gesuch und das Schreiben beim Start |
| 1187, 1188 | die Laufnummer des Aufräumers |
| 1189, 1190 | Sprungmarke ins Leere, Abschnitt ohne Eintrag |
| 1191, 1192 | die Wortliste und der Abschnittsname in `db.js` |

**Sechs ältere sind nachgezogen**, weil diese Runde ihren Suchtext angefasst
hat: 316, 719, 740, 1042, 1171 und W13. **Keiner hat dabei seine Sache
verloren** — 1171 prüft weiterhin nur die Leerheitsbedingung; die Klammer über
der unvollständigen Datenbank ist die Sache von 1186.

### Die Zahlen, die mitgezogen sind

| | vorher | nachher |
|---|---:|---:|
| Rückbauten | 1.115 | **1.127** |
| Rückbauten auf Prüfstandsdateien | 32 | **33** |
| Regelzeilen in `public/style.css` | 1.673 | **1.674** |
| Zeilen der Wortliste | 14 | **16** |
| Wörter der Wortliste | 12 | **14** |
| Kommentarzeilen über alles | 16.557 | **16.660** |
| Codezeilen über alles | 66.429 | **66.661** |
| Kopierschritt in der README | 3 | **2** |

**Die sechs Gleichlautsummen sind neu gemessen.** Kein deutscher, englischer
oder türkischer Satz hat sich bewegt; die Probe liest `public/app.js` ohne
Kommentare, und BA 4 fasst dort Code an.

| | vorher | nachher |
|---|---|---|
| de | `015f1746` / `7ccda413` | **`4b0abbd6`** / **`84dad7c0`** |
| en | `1f666bca` / `0255fb6b` | **`a162f491`** / **`3ff87489`** |
| tr | `bb671551` / `7a831113` | **`7d4e5fd0`** / **`bfcfc702`** |

---

## 11. Was offen bleibt

| | warum |
|---|---|
| Die Fotokachel in eine Nebentabelle | **0.39.0**, eigene Runde, mit Sicherung davor |
| Export, Import und Papierkorb | eigene Runde nach 0.39.0 |
| Die festen Wartezeiten, zusammen rund 47,6 Sekunden | Ansage des Betreibers: beim nächsten Mal |
| Der Trefferausschnitt im Ziel eines Links | Eingriff in den gemeinsamen Kern |
| Der vierte Abruf nach dem Umbenennen | beide Auswege sind schlechter als das Problem |
| Der Halt als Frist, der Sprung in Chromium, die Strichstärke, der Kommentaranteil | nicht beantwortet |

**Und eines ist neu offen:** *es gibt keine Lizenz im Repository.* Solange das
so bleibt, hat die README kein Abzeichen dafür.
