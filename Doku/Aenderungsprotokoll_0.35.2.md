# Änderungsprotokoll 0.35.2 — „Der Einzelexport geht raus"

Gebaut am 19. September 2026, auf 0.35.1. PATCH.

Die Runde war als Aufräumrunde geplant: eine Route, die das Projekt nicht
braucht, und zwei Stücke, die dieselben Dateien anfassen. Am 18. September 2026
sind zwei Meldungen aus dem Betrieb dazugekommen, am 19. September vier offene
Punkte des Sammelblatts. **Gebaut sind zehn Bauabschnitte; einer der elf
geplanten war schon gebaut.**

| | vorher | nachher |
|---|---:|---:|
| Fotos, die bei einer Auswahl von 80 ankommen | 0 | **80** |
| `[Kriterion]`-Zeilen ohne Zeitstempel | 51 | **0** |
| Routen in `server.js` | 103 | **102** |
| Routen ohne Rufer, die ein Wächter findet | *keiner sah nach* | **0 von 102** |
| Verweise auf `Doku/` in ausgelieferten Dateien | 1 | **0** |
| Stolpersteinverweise, die kein Wächter sieht | 15 | **0** |
| Deutsche `id`, die über `.id = '…'` gesetzt werden | 6 | **0** |
| Gegenproben, die abreißen statt rot zu werden | 1 | **0** |
| Schlüssel je Sprachdatei | 1212 | **1214** |
| Prüfungen | 7013 | **7040** |
| Gruppen in der Schlusstafel | 364 | **368** |
| Rückbauten | 1038 | **1053** |

> **FINGERPRINT DIESER RUNDE: `0fc33e91`** — der Stand davor war `10017d45`.
> Er geht jetzt über **19 Dateien** statt über 18: `log.js` ist dazugekommen.
>
> Er ändert sich, weil `server.js`, `public/app.js`, `public/style.css`,
> `db.js`, `mail.js`, `auth.js`, `keys.js`, `batchrun.js` und `images.js`
> Zeilen ändern, weil die drei Sprachdateien zwei Schlüssel weniger und vier
> mehr tragen, weil `log.js` neu daneben liegt und weil `package.json` die
> neue Versionsnummer trägt.

**An den ausgelieferten Dateien sind es 277 neue und 186 entfernte Zeilen** —
gezählt ohne Leerraum (`git diff -w`). Über alles, mit Prüfstand und
Gegenproben, sind es 1129 neue und 463 entfernte.

**Zur Laufzeit wird keine Aussage gemacht.** Der Schlusslauf dieser Runde
dauerte 300,7 Sekunden, der zur 0.35.1 312,8 — beides Einzelläufe, und
dazwischen liegen 27 Prüfungen mehr. Was sie wirklich kosten, sagt erst eine
Messung mit fünf Läufen.

---

## 1. Die Fragetafel, bevor die erste Zeile fiel

Der Auftrag stellt sechs Fragen. Zwei trugen einen Vorschlag und sind ihm
gefolgt, eine war schon beantwortet. Drei hat der Betreiber am 19. September
2026 entschieden:

| | Frage | Entscheidung |
|---|---|---|
| **F1** | Ist ein Routenausbau eine PATCH-Runde? | **0.35.2 bleibt.** Die Nummer kommt vom Betreiber; der Kasten im CHANGELOG warnt vor dem 404 |
| **F2** | Fällt der tote `itemId`-Zweig in derselben Runde? | **Mitnehmen** |
| **F4** | Punkt 34 — der Versandgrund als Schlüssel | **Als BA 11 mitnehmen** |
| **F5** | Bündeln oder absagen? | *bündeln*, wie vorgeschlagen |
| **F6** | Folgt das Containerprotokoll `TZ`? | *ja, gespeicherte Zeiten bleiben UTC*, wie vorgeschlagen |

---

## 2. BA 4 — Mehr als 40 Fotos auf einmal

**Gemeldet vom Betreiber am 18. September 2026 aus dem Betrieb.** Er hatte es
früher schon bei „mehr als 60 oder vielleicht 80" Bildern bemerkt.

`server.js` nahm die Fotos mit `upload.array('photos', 40)` an. Multer zählt je
Feldnamen herunter und wirft beim 41. Bild `LIMIT_UNEXPECTED_FILE`. **Drei
Dinge waren daran falsch:**

1. **Es ging alles verloren, nicht nur das über 40.** Multer bricht die ganze
   Anfrage ab, der Handler läuft nie, es wird kein einziges Foto gespeichert.
2. **Die Antwort war englisch und intern.** Der Fehler-Handler fragt nach
   `err.key`; ein `MulterError` hat keinen und fiel auf `err.message` zurück.
   Am Bildschirm stand **„Unexpected field"**.
3. **Der Browser prüfte beim Fotoweg nichts** — weder Zahl noch Größe.

### Die Behebung

**`PHOTO_COUNT = 40` und `PHOTO_MAX = 30 MB`** stehen jetzt als benannte Zahlen
in `server.js` und in `public/app.js`. Ein Wächter hält beide Seiten auf
derselben Zahl; laufen sie auseinander, verliert der Betreiber wieder Bilder.

**Der Browser schickt in Bündeln von `PHOTO_COUNT`** und sagt vorher ab, was
über `PHOTO_MAX` liegt. Achtzig Bilder landen damit in zwei Anfragen. *Die 40
ist eine Schranke der ANFRAGE und keine Obergrenze je Eintrag — eine solche
gibt es bei Fotos nicht.*

**Die Grenzen reisen am Gesuch mit.** Der Fehler-Handler steht ganz am Ende des
Stapels und sieht dort nicht mehr, an welcher Route die Datei hereinkam. Alle
sechs Hochladerouten setzen deshalb `req.caps` über einen Helfer `capped()`;
der Handler übersetzt daraus `LIMIT_UNEXPECTED_FILE` und `LIMIT_FILE_SIZE`.

### Vier Schlüssel statt einem, und warum

Der Auftrag hatte **einen** neuen Schlüssel vorgesehen und `server.fileCap`
für die Zahl wiederverwenden wollen. Das geht nicht: `server.fileCap` sagt
„Höchstens {cap} Dateien je {entryOne}" — eine Obergrenze je Eintrag, und die
gibt es bei Fotos gerade nicht. Die Meldung wäre falsch gewesen.

Gebaut sind deshalb **vier**: `server.uploadCap` (zu viele Dateien in einem
Zug), `server.uploadSize` (eine Datei zu groß), `server.videoOne` und
`server.importOne` (ein Video, eine Datei je Anfrage).

**`entry.tooBig` trägt die 50 nicht mehr als Text im Satz**, sondern als `{mb}`
aus `ATTACHMENT_MAX`. Die Zahl stand an zwei Orten.

Die 30 MB und die 40 stehen jetzt auch im Handbuch und in der README. Vorher
standen sie nirgends.

---

## 3. BA 5 — Das Containerprotokoll trägt seine Zeit

**Vorgabe des Betreibers am 18. September 2026:** ein Protokoll ohne
Zeitstempel ist schwer zu lesen. Keine der 51 Zeilen trug eine Zeit.

`docker compose logs -t` setzt zwar eine davor, aber in UTC und nur, wenn man
es so aufruft. **Ein Protokoll, dessen Zeit davon abhängt, wie man es liest,
hat keine.**

### Die Behebung

**Ein neues Modul `log.js`** mit `stamp()`, `logLine()`, `logWarn()` und
`logFail()`. Es hat keine Abhängigkeit: auch ein Worker-Thread ruft hierher.
Die Namen heißen `logLine` und nicht `log`, weil `auth.js` unter `log()` das
Sicherheitsprotokoll führt.

**Alle 51 Zeilen** in `server.js` (28), `batchrun.js` (8), `auth.js` (7),
`db.js` (5), `keys.js` (2) und `images.js` (1) gehen darüber. Der Name
`[Kriterion]` steht nur noch an einer Stelle.

**ISO 8601 mit Versatz**, und der Versatz kommt aus `TZ`:

```
2026-09-19T09:29:40+02:00 [Kriterion] Running on port 3000 -- …
```

`TZ=Europe/Berlin` steht jetzt in `docker-compose.example.yml`. Ohne `TZ` läuft
der Container auf UTC und es steht `+00:00` da — die Zeile sagt damit selbst,
welche Uhr gemeint ist.

> **DIE GESPEICHERTEN ZEITEN BLEIBEN UTC.** Das Sicherheitsprotokoll, die
> Sicherungsnamen und `exported_at` werden zwischen Installationen verglichen
> und folgen `TZ` ausdrücklich nicht.

### Was der Umbau im Prüfstand nach sich zog

Vier Leser haben bis dahin nur `console.log/warn/error` gekannt und mussten die
zweite Form dazulernen: die Restprobe über deutsche Bildschirmtexte, der
Wächter über deutsche Konsolenansagen, die Probe „das Wort Backup steht in
keiner ausgelieferten Datei mehr" und die drei Prüfungen am gefangenen Fehler.
**`log.js` steht jetzt in den Dateilisten von `tools/comments.js`,
`tools/publish.js`, `test/source.js` und im Handgriff der README.** Der
Fingerprint geht über `require.cache` und hat es von selbst mitgenommen.

---

## 4. BA 6 war schon gebaut

**Punkt 33 — die Startzeile nennt einen Schlüssel statt eines Satzes.** Der
Auftrag führt ihn als BA 6, das Sammelblatt als offen.

**Nachgemessen am 19. September 2026: er ist seit 0.33.2 gebaut.** Der Commit
`b88bdb4` („0.33.2 — elf deutsche Saetze und ein roher Schluessel im
Protokoll") hat `t('en', situation.reason, situation.values)` eingesetzt, und
`test/roundtrip.js` hält seit damals fest, dass in der Zeile „Backup location"
kein roher `server.*`-Schlüssel steht.

**Kein Befund, keine Änderung.** Der Eintrag im Sammelblatt war veraltet.

---

## 5. BA 1 — Der Einzelexport geht raus, mit F2

Der Betreiber hat am 17. September 2026 gefragt, welchen Nutzen das Projekt von
`GET /api/items/:id/export` hat. **Es hat keinen.** Die Route stand in keinem
Auftrag und hatte 26 Runden lang keinen Rufer in der Oberfläche; 0.35.0 hat ihr
einen Knopf gegeben, statt nach ihrem Nutzen zu fragen.

**Ausgeliefert fallen:** die Route, der Knopf `#exp1` im Fuß des Eintrags, sein
Rufer, die Stilregel `.entry-out` und zwei Sprachschlüssel in allen drei
Dateien — `entry.exportOne` und `server.entryTooBig`.

**Die beiden Schlüssel fallen verschieden**, und das war die eine Falle:
`entry.exportOne` steht in keinem Vergleichsstand und verlässt nur die
Zugangslisten; `server.entryTooBig` steht in beiden, wird dort namentlich als
Verlust geführt und sein Wortlaut wird aus dem Stand von damals abgezogen
(`WORDING_GONE_TEXT_0352`). Ohne das wären die beiden Zahlen der Wortlautprobe
auseinandergelaufen.

### F2 — der tote Zweig fällt mit

Nach dem Ausbau reichten beide verbliebenen Rufer von `exchangeParts()` und
`exchangeEnvelopeBytes()` nur noch `null`. Der Zweig für einen einzelnen
Eintrag konnte also nur noch falsch sein: `onlyOne`, `values`, `and()`, `wo()`
und die Einsetzungen in den Abfragen fallen. **Der Auftrag nannte elf
Einsetzungen, gezählt sind vierzehn.**

### Zwei Zahlen des Auftrags waren falsch

**`F_ROUTES` bleibt bei 73.** Der Auftrag erwartete 73 → 72. `F_ROUTES` führt
die **schreibenden** Routen; die Exportroute ist lesend und stand dort nie —
der Kommentar in `server.js` hat das auch gesagt.

**Die Schlüsselzahl geht 1212 → 1214, nicht → 1210.** Die Runde nimmt zwei weg
und legt vier an (BA 4).

`tools/keys.json` verliert den Eintrag `server.eintragZuGross`: er zeigte auf
einen Schlüssel, den es nicht mehr gibt.

---

## 6. BA 2 — Jede Route hat einen Rufer

**Das ist die Lücke, durch die der Einzelexport 26 Runden gefallen ist.** Der
Prüfstand kannte seit 0.35.0 „jeder Abfrageparameter des Browsers hat einen
Leser" und „jeder Schlüssel der Sprachdatei hat einen Leser". Der dritte Satz
derselben Form fehlte.

**Gemessen: 102 Routen, 0 ohne Rufer.** Gelesen werden `public/app.js` **und**
`public/index.html` — das Manifest hängt als `<link rel>` im Kopf der Seite und
nicht an einem Ruf im Skript.

**Die Ausnahmeliste trägt zwei Adressen, nicht drei.** Der Auftrag hatte drei
erwartet (`/api/product-categories`, `/api/tags`, `/api/criteria`, je PUT und
DELETE). Nachgemessen hat `/api/criteria/:id` einen buchstäblichen Rufer;
übrig bleiben die beiden anderen, die über die Verwaltungstafel als
`${url}/${entry.id}` reisen. **Die Liste ist in beide Richtungen geschlossen:**
eine Ausnahme für eine Route, die längst einen Rufer hat, färbt den Lauf rot.

---

## 7. BA 3 — Der letzte Verweis auf `Doku/`

`public/style.css` nannte `Doku/Farbkonzept_0_23_0.md`. **Der öffentliche Stand
trägt kein `Doku/`**, der Verweis zeigte dort auf nichts. Er war in 0.35.0
ausdrücklich liegengeblieben, weil eine Einzelbehebung den Fingerprint einer
bereits veröffentlichten Version verschoben hätte.

Der Verweis fällt, der Satz in `Doku/Veroeffentlichen.md`, der die Stelle als
bekannt offen führte, mit. **`node tools/publish.js --trocken` meldet: „Kein
Verweis auf Doku/ geht mit hinaus."**

**Und ein Wächter hält es fest**, über vierundzwanzig ausgelieferte Dateien —
bis dahin galt die Zusage nur, wenn jemand das Werkzeug aufrief.

---

## 8. BA 7 — Eine Gegenprobe macht rot, statt abzureißen

**Punkt 35.** Gegenprobe 330 setzte in `public/app.js`

```
${tMark('entry.calcStepsHint', 'entry.grade',   →   ${tH('entry.calcStepsHint', { word: '',
```

und ließ die schließende Klammer des Rufs stehen. Die Datei lud danach nicht
mehr, und der Treiber meldete ABGERISSEN statt ROT. **Ein Rückbau, der die
Datei zerbricht, belegt nichts:** er zeigt nicht, dass die Prüfung greift,
sondern nur, dass kaputter Code kaputt ist.

Der Suchtext nimmt jetzt den ganzen Ruf mit, der Ersatz schließt seine Klammer
selbst. **Nummer und Name bleiben** — sie fällt nicht, sie wird berichtigt.

**Dazu ein Wächter:** jeder Rückbau an einer `.js`-Datei muss eine Datei
zurücklassen, die sich übersetzen lässt. **795 der 1053 werden so geprüft, in
fünf Sekunden.** Übersetzt wird mit `vm.Script` und nicht ausgeführt; der Rumpf
steht dabei in derselben Hülle, in die Node ein Modul stellt, und die Zeile mit
`#!` fällt davor weg.

---

## 9. BA 8 — Sechs deutsche `id`

**Punkt 25.** Die Gestaltprobe las zwei Quellen: den Aufbau (`id="…"`) und das
Stilblatt. **Eine `id`, die das Skript mit `element.id = '…'` setzt und die in
keiner Stilblattregel vorkommt, stand in keiner von beiden.** Der Wächter sagte
„deutsch ist keine id" und meinte „keine id, die ich sehe".

| alt | neu |
|---|---|
| `f-abgelehnt` | `f-rejected` |
| `f-kat-ohne` | `f-cat-none` |
| `f-tagzeile` | `f-tagrow` |
| `ansicht-neu` | `view-save` |
| `filter-zurueck` | `filter-reset` |
| `zug-weg-auf` | `deleted-users` |

**Die Reihenfolge war zwingend: erst umbenennen, dann den Wächter erweitern.**
Danach findet er alle elf gesetzten `id`, und alle elf sind englisch.

---

## 10. BA 9 — Die zwei Löcher des Nummernwächters

**Punkt 43, Schritt 1.** Der Wächter „Kein Stolpersteinverweis mehr" las
dreizehn ausgelieferte Dateien. **Zwei Stellen entgingen ihm, und dahinter
standen 15 Verweise:**

| | | gemessen |
|---|---|---:|
| `public/style.css` | stand in keiner Dateiliste | **8** |
| `db.js` | die Verweise stehen als `-- Nummer` **innerhalb des SQL-Schematexts**; der Segmentierer hält eine Vorlage für Text | **7** |

Beide Löcher sind zu: `public/style.css` steht in der Liste, und eine
SQL-Kommentarzeile wird als Kommentar gelesen. Die 15 Verweise sind
gestrichen — **die Begründung bleibt stehen, nur die Nummer fällt.** Der
Wächter liest jetzt sechsunddreißig Dateien.

*Schritt 2 und 3 von Punkt 43 bleiben offen: die 770 Versionsnummern und
`tools/comments.js`, das das Stilblatt mitzählt.*

---

## 11. BA 11 — Der Grund eines Versands reist als Schlüssel

**Punkt 34.** `sendTokenLink()` hat mit 0.32.0 die Sprache des Lesers bekommen;
die drei Gründe, warum gar nicht erst verschickt wurde, stehen seither in ihr.
**Der vierte nicht:** `mail.send()` baute ihn mit der Sprache des Empfängers,
und er landete in der Karte des Admins. *Ein deutscher Admin, der einen
türkischen Kollegen einlädt, las den Grund auf Türkisch.*

**`mail.send()` und `shortReason()` bekommen keine Sprache mehr.** Sie geben
`reasonKey` zurück, wo der Grund aus `mail.js` kommt, und `reason`, wo ihn der
Anbieter geschrieben hat — immer nur eines von beiden. Der Wurf der Frist trägt
seinen Schlüssel statt eines Satzes, in derselben Form, die `auth.js` unter
`Message` wirft.

**`sendWhy(e, locale)` in `server.js` ist die eine Stelle, die daraus einen
Satz macht:** mit `readerLocale` in `sendTokenLink`, mit `localeOf(req)` an der
Testmail. **Der Brief bleibt in der Sprache des Empfängers** — es geht allein
um den Grund daneben.

**Gemessen statt gelesen:** der Prüfstand ruft `mail.send()` wirklich und hält
fest, dass ohne Mailzugang `mail.noAccount` und ohne brauchbare Adresse
`mail.recipientInvalid` zurückkommt — als Schlüssel, ohne Satz daneben.

---

## 12. Die Rückbauten

**1038 wurden 1053.** Zwei fallen, siebzehn kommen dazu, einer wird berichtigt.

| | |
|---|---|
| **1087, 1088** | fallen mit dem Knopf, den sie zurückbauten |
| **1101–1104** | die Fotogrenzen: nackte 40, Bündel, zwei verschiedene Zahlen, die englische Absage |
| **1105–1107** | der Zeitstempel: Versatz, Umgehung des Helfers, `TZ` in der Beispieldatei |
| **1108, 1109** | der Routenwächter: ein Rufer fällt weg, die Ausnahmeliste deckt zu viel zu |
| **1110** | das Stilblatt verweist wieder unter `Doku/` |
| **1111** | ein Rückbau lässt die Klammer wieder stehen |
| **1112, 1113** | eine gesetzte `id` heißt wieder deutsch, die dritte Quelle fällt weg |
| **1114, 1115** | Stilblatt und SQL-Zeile nennen wieder eine Nummer |
| **1116, 1117** | der Versandgrund in der Sprache des Empfängers, der Schlüssel als Text |
| **330** | **berichtigt**, nicht gefallen: dieselbe Nummer, derselbe Name |

**Gefahren und ausgewertet: 20 Gegenproben, 0 stumm.** Jede macht die Gruppe
rot, die sie treffen soll.

Vier bestehende Rückbauten mussten ihren Suchtext nachziehen, weil BA 5 ihre
Zeile angefasst hat (458, 516, 552, 1051, 1057, 1083), vier weitere wegen F2
(171, 172, 173, 482) und einer wegen BA 11 (05).

---

## 13. Was diese Runde nicht tut

| | was | warum |
|---|---|---|
| **V4** | **Punkt 38** — die Kurzform der Zählzeile in der Kachel | Oberfläche, und gemessen ist nichts |
| **V5** | **Punkt 27** — der Aufräumer des Prüfstands auf mehreren Spuren | `testbench.js`, und diese Runde fasst die Datei nicht an |
| **V6** | **Punkt 26** — die Restprobe sieht feste Wörter in Vorlagen nicht | eine Runde, die dreißig Sätze in drei Sprachen anlegt, ist keine Aufräumrunde |
| **V7** | **Punkt 21** — `express` 5 und `npm audit` | Abhängigkeiten stehen als eigener Punkt in 0.36.0 |
| | **Punkt 43, Schritt 2 und 3** | die 770 Versionsnummern und `tools/comments.js` |

**Punkt 36 — der türkische Genitiv — ist am 17. September 2026 geschlossen
worden:** kein Befund, keine Änderung.

---

## 14. Was ein Betreiber wissen muss

> **`GET /api/items/:id/export` gibt es nicht mehr.** Wer die Adresse in einem
> Skript stehen hat, bekommt danach **404**. Der volle Export
> (`GET /api/export`) und der Teilexport tragen dieselben Bündel.

> **`TZ` entscheidet ab dieser Runde, welche Zeit im Containerprotokoll
> steht.** Ohne `TZ` ist es UTC, wie bisher. `TZ=Europe/Berlin` steht als
> Vorschlag in `docker-compose.example.yml`. **Die gespeicherten Zeiten ändern
> sich nicht.**

**Und eine Behebung aus dem Betrieb:** wer mehr als 40 Fotos auf einmal
auswählt, verliert sie nicht mehr. Der Browser teilt die Auswahl selbst auf.
