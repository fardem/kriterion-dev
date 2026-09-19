# Änderungsprotokoll 0.35.0 — „Code-Effizienz"

Gebaut am 17. September 2026, auf 0.34.4. MINOR.

Die Runde ändert am Verhalten der Anwendung nichts — bis auf einen Fehler,
den sie behebt (Abschnitt 7). Sie nimmt toten Code weg,
legt doppelte Bauformen zusammen, komprimiert die Auslieferung und kürzt die
Kommentare des Stilblatts. Grundlage war `Doku/Auftrag_0.35.0.md` *(weggefallen — es liegt immer nur einer im Repo)*:
101 Befunde
von 17 Lesern, 75 halten der Widerlegung stand, 5 davon sind
Sicherheitsbefunde und gehen nach 0.36.0. Für die Runde blieben **70 Befunde
an 65 Stellen**.

| | vorher | nachher |
|---|---:|---:|
| Ausgelieferter Text je vollem Aufruf | 1.001.488 B | **268.441 B** |
| `public/style.css` | 300.472 B | **195.090 B** |
| davon Kommentar | 211.862 B (70,5 %) | **106.321 B (54,5 %)** |
| `importInto` | 373 Zeilen, Tiefe 14 | **228 Zeilen, Tiefe 9** |
| `GET /api/backup` | 52 Zeilen, Tiefe 18 | **50 Zeilen, Tiefe 9** |
| Feste Wartezeiten in `test/` | 59.635 ms | **47.520 ms** |
| Schlüssel der Sprachdateien | 1.208 | **1.211** |
| Prüfungen | 6.903 | **6.969** |
| Gruppen in der Schlusstafel | 350 | **360** |
| Rückbauten | 1.000 | **1.032** |

> **FINGERPRINT DIESER RUNDE: `5297965e`** — der Stand davor war `1f76adac`.
>
> Er ändert sich, weil `public/style.css`, `public/app.js`, `server.js`,
> `auth.js`, `attachments.js`, `db.js`, `images.js`, `keys.js`, `mail.js`,
> die drei Sprachdateien und `package.json` sich geändert haben.

---

## 1. Was die Runde nicht tut

**Kein Verhalten ändert sich** — mit **einer benannten Ausnahme**, und die ist
die Behebung eines Fehlers: der Filter des Sicherheitsprotokolls hat seit
0.13.0 nicht gegriffen (Abschnitt 7).

**Von den 65 Stellen sind 40 gebaut, 24 nicht und eine zum Teil.** Die 24
stehen in Abschnitt 9 mit ihrem Grund; die eine zum Teil gebaute sind die
festen Wartezeiten des Prüfstands (Abschnitt 6).

| | Stellen | gebaut | nicht | zum Teil |
|---|---:|---:|---:|---:|
| tot | 24 | **21** | 3 | — |
| umständlich | 15 | **8** | 7 | — |
| langsam | 21 | **7** | 14 | — |
| besser | 5 | **4** | — | 1 |

**Keine Schemaänderung.** Vier Befunde verlangen eine neue Spalte oder einen
neuen Index; Abschnitt 9 des Auftrags schließt das aus. Sie bleiben Befund.

**Keine neue Abhängigkeit.** `package.json` nennt dieselben fünf Pakete wie
vorher — `better-sqlite3-multiple-ciphers`, `express`, `multer`, `nodemailer`,
`sharp`. Die Kompression läuft über `zlib`, das zu Node gehört.

**Keine Prüfung fällt.** Die Zahl der Prüfungen steigt von 6.903 auf
6.969.

---

## 2. Tot — 21 von 24 Stellen

Weggenommen ist nur, was kein Leser hat. Der Beleg je Stelle ist ein Rückbau:
die Zeile kommt zurück, und eine Prüfung wird rot. **Siebzehn Stellen im
Quelltext**, dazu die Prüfung über die Sprachdateien, die drei Klassen ohne
Regel und die eine Regel ohne Träger — und `GET /api/items/:id/export`, das
nicht weggenommen, sondern an einen Knopf gehängt worden ist (Abschnitt 7).

- **`images.js`** — `PNG_MAGIC_HEX`.
- **`auth.js`** — sieben Exportnamen und `STATES`.
- **`attachments.js`** — sieben Namen.
- **`mail.js`** — drei Namen. **`keys.js`** — drei Namen.
- **`db.js`** — `ownerId`.
- **`server.js`** — ein toter Zweig in `checkPlace`, eine ungelesene Variable,
  ein toter Bedingungsausdruck an `server.accountGone`, die Route
  `GET /api/health`.
- **`public/app.js`** — `OLD_SECTIONS` samt Zweig, `state.criteria` samt dem
  Abruf von `/api/criteria`, `searchDefault`, `ICON_STEP_BACK` und
  `ICON_STEP_FWD`, die Klassen `blocks`, `user-linkbox` und
  `two-factor-codebox`, das Attribut `data-section`, und `'ename'` heißt
  `'engine-name'`.
- **`public/style.css`** — `.backup-old`, die einzige Klasse ohne Träger.

**Die Sprachdateien tragen keinen toten Schlüssel.** Das war ein Befund der
Messung und ist jetzt eine Prüfung: die neue Gruppe „Jeder Schlüssel der
Sprachdatei hat einen Leser" deckt alle 1.211 Schlüssel ab. 23 davon werden
zur Laufzeit zusammengesetzt (`mail.<art>.subject|body`, `vocabulary.*`) und
stehen namentlich in der Prüfung.

---

## 3. Umständlich — 8 von 15 Stellen

**`server.js`:**

- **`importInto` ist in zwei Funktionen geteilt** — `importPrepare()` bereitet
  die Bildvarianten vor, `importTables()` schreibt. 373 Zeilen mit
  Einrückungstiefe 14 sind 228 mit Tiefe 9 geworden. Rund 25 Anweisungen
  stehen jetzt auf Modulebene statt in den Schleifen; `findOrCreate()` fasst
  vier gleiche Stellen zusammen.
- **`PUT /api/settings` liest aus einer Tafel.** Sechs Blöcke mit gleichem
  Aufbau — Wert holen, wandeln, gegen eine Liste prüfen, absagen oder
  schreiben — sind `PICK_SETTINGS`, `pick()` und `refused()` geworden. Die
  fünf Stufenlisten standen bis dahin zweimal im Quelltext, einmal als Leser
  und einmal als Schreiber.
- **`GET /api/backup` baut eine Antwort statt dreier.** Drei getrennte
  `res.json`-Aufrufe mit weitgehend denselben Feldern sind ein Objekt
  geworden. Einrückungstiefe 18 → 9.
- **`entryAsBundle` übersetzt keine SQL-Texte mehr je Eintrag.** Sechs
  `db.prepare` im Rumpf stehen jetzt auf Modulebene.

**`public/app.js`:**

- **`openModal(html, atClose, cancel, keys)`** trägt das Gerüst von vier
  Dialogen: Kasten anlegen, an `body` hängen, Escape und Klick auf den
  Hintergrund, Horcher abmelden, Fokus setzen. Acht weitere Dialoge bleiben
  einzeln — sie weichen im Verhalten ab (`openCreate` hat keinen
  Escape-Horcher, `showBellPanel` schließt nur als oberstes Fenster), und ein
  Gerüst, das jede Abweichung als Schalter trägt, ist kein Gerüst.
- **`pillRow({boxId, levels, get, set, label, apply, key, mark})`** trägt fünf
  Pillenreihen — Farbschema, Schriftgröße, Bildstreifen, Zeilen der Linkliste,
  Zahl der Namen. Die fünf `draw*`-Funktionen bleiben als Deklarationen
  stehen: `test/ui_style.js` sucht sie im Quelltext beim Namen.

---

## 4. Langsam in der Auslieferung

**Die Auslieferung geht gezippt hinaus.** `zlib` gehört zu Node, also kommt
keine Abhängigkeit dazu. Gezippt wird **einmal beim Start** und nicht je
Anfrage; die Dateien unter `public/` ändern sich zur Laufzeit nicht. Die
gezippten Fassungen stehen im Arbeitsspeicher und ausdrücklich **nicht** als
eigene Datei neben dem Original — eine Datei in `public/` ginge in den
Fingerprint ein.

Nur Text wird gezippt (`.css`, `.js`, `.json`, `.html`, `.svg`). Ein Bild oder
eine Schrift ist bereits komprimiert. Wird eine Datei gezippt größer als roh,
bleibt es beim Original.

Die gezippte Fassung trägt eine **eigene Marke** (`ETag` mit dem Zusatz `-gz`)
und `Vary: Accept-Encoding`. Eine bekannte Marke bekommt `304` und keine
Bytes. Wer kein `gzip` verlangt, bekommt die Datei wie bisher, über
`express.static`.

| | Bytes je vollem Aufruf |
|---|---:|
| vor der Runde | 1.001.488 |
| nur gezippt | 307.400 |
| nur Kommentare gekürzt | 896.187 |
| **beides** | **268.441** |

**Vier Abfragen holen nur noch, was gebraucht wird:**

- `GET /api/photos/:id/raw` las mit `SELECT *` alle drei Blobs der Zeile, auch
  wenn nur die Kachel verlangt war — bei einem Video bis zu 20 MB für rund
  200 kB. Jetzt eine Anweisung je Ableitung. Fehlt die gewünschte Ableitung,
  wird das Original nachgeholt: dieselbe Antwort wie bisher.
- `DELETE /api/photos/:id` brauchte aus der Zeile nur die Eintragsnummer und
  zog `data`, `thumb` und `medium` mit.
- `getSetting` und `getUserSetting` trugen ihr `db.prepare` im Rumpf.
  `GET /api/settings` ruft sie mindestens 29 Mal je Anfrage.
- Die Bilder der Kommentare eines Eintrags kommen in **einer** Abfrage mit
  JOIN statt einer je Kommentar — dieselbe Bauform, die `qMentionsOfItem` zwei
  Zeilen darüber schon hatte.

---

## 5. Das Stilblatt

Der schwerste Einzelbefund der Messung: `public/style.css` maß 300.472 Bytes,
davon 211.862 in 408 Kommentarblöcken — **70,5 Prozent**. Der Auftrag nennt
die Kompression als Mittel und erklärt die Frage nach den Kommentaren damit
für erledigt. Der Betreiber hat am 17. September 2026 beides bestellt.

| | vorher | nachher |
|---|---:|---:|
| Bytes | 300.472 | **195.090** |
| Kommentarbytes | 211.862 | **106.321** |
| Anteil | 70,5 % | **54,5 %** |
| Kommentarzeilen | 3.131 | **1.576** |
| Regelzeilen | 1.639 | **1.639** |
| gezippt | — | **62.250** |

**Keine Regelzeile ist gefallen.** Die Zahl der Zeilen mit Regeltext ist
unverändert, und eine Prüfung zählt sie nach. Gefallen ist die Erzählform:
wie es dazu kam, wer es gemeldet hat, was vorher dastand und warum ein anderer
Weg nicht gewählt wurde. Geblieben sind die gemessenen Zahlen — Kontrastwerte,
Pixelrechnungen, Messtafeln —, die Rundennummern und die Begründungen.

**Vier Sätze haben ihren Wortlaut zurückbekommen.** Vier Prüfungen suchen im
Stilblatt einen bestimmten Satz: „zwei Merkmale, zwei Kanäle" (0.12.3),
„DER RAND EINES VIDEOS" (Positivliste 0.23.0), die Rechnung
`5 x 41,92 / 15 = 13,973` und der Grund, warum die Auswahlfelder nicht mehr in
der Zoomregel stehen. Die Kürzung hatte sie weggenommen; sie stehen wieder da.

**Die Norm der JavaScript-Dateien — höchstens 30 Prozent Kommentar je Datei —
ist nicht erreicht**, und das ist ein Befund und keine Nachlässigkeit. Sie
wäre nur zu erreichen, wenn die gemessenen Zahlen aus den Kommentaren fielen;
der Auftrag sagt in Abschnitt 9, dass keine Quote gegen die Regel erzwungen
wird. `tools/comments.js` zählt dieses Blatt weiterhin nicht — es zählt
JavaScript. Der Wächter über das Stilblatt steht in `test/source.js` und hält
den erreichten Stand.

---

## 6. Der Prüfstand

**Der Wächter über die Rückbauten liest jede Datei einmal.** Die Schleife las
je Rückbau seine Datei neu ein: 1.030 Durchgänge auf 32 Dateien. Der Inhalt
steht jetzt in einer `Map`, und eine Prüfung hält die Zahl der Lesevorgänge
unter 35.

**Die Schalterprobe hängt nicht mehr am Elternlauf.** `test/release_030.js`
startete ein Kind, um zu belegen, dass die Zeitzeile ohne Schalter nicht
dasteht — und vererbte `TESTBENCH_TIME` dabei an das Kind. Die Prüfung war
grün, weil der Elternprozess zufällig keinen Schalter trug. Gemessen vorher:
`TESTBENCH_TIME=1 npm test` ergab 6.892 von 6.893, `npm test` ohne Schalter
6.893 von 6.893, auf demselben Stand.

**Der Prüfstand wartet auf die Bedingung statt auf eine Dauer.** In den
Modulen unter `test/` standen **625 feste Wartezeiten, zusammen 59.635 ms**;
die Module laufen nacheinander, also liegt jede dieser Millisekunden auf der
Laufzeit. Danach sind es **614 Stellen und 47.520 ms**.

> **DIE ZAHL DES AUFTRAGS LAUTET 626 STELLEN UND 62.635 ms.** Sie ist über das
> ganze Repository gezählt, nicht nur über `test/`; nachgemessen sind es dort
> **631 Stellen und 62.785 ms**. Die Zahlen oben zählen `test/` allein, weil
> der Wächter das tut.

- `until(w, condition, limitMs, what)` in `test/dom.js` fragt in
  Fünf-Millisekunden-Schritten und **wirft** an der Grenze. Ein Modul, das
  wirft, meldet seinen Abbruch und färbt den Lauf rot.
- `nextSecond(limitMs)` in `test/frame.js` wartet auf die nächste
  Sekundengrenze der Uhr. SQLite schreibt `datetime('now')` auf die Sekunde
  genau; elf Stellen in `test/roundtrip.js` belegen, dass ein Zeitpunkt
  mitzieht, und warteten dafür je 1.100 ms. Im Mittel war davon die Hälfte
  umsonst.

**614 Wartezeiten bleiben stehen.** Sie warten auf das Neuzeichnen eines
Fensters, und jede braucht ihre eigene Bedingung. Das ist eine eigene Runde
und steht als Punkt 41 im Sammelblatt.

**Gemessen und zurückgenommen:** `sysSection` auf `.sys-card` warten zu lassen
kehrt zu früh zurück — die Karte steht früher da als ihr Inhalt, und zwölf
Prüfungen über die Karte „Zugänge" fanden eine leere Liste. Dort bleibt die
feste Wartezeit, mit dem Grund daneben.

---

## 7. Besser — vier Stellen, ein Knopf und ein Fehler

**Ein gefangener Fehler bleibt nicht stumm.** `errorText(req, e)` lieferte
„Unbekannter Fehler", sobald der Fehler keinen Schlüssel trug. Für den Leser
ist das richtig — die Oberfläche nennt keine Stapelabzüge. Der Betreiber
bekam aber ebenfalls nichts: fünfzehn `catch`-Blöcke schluckten den echten
Fehler wortlos. Der Fall ohne Schlüssel geht jetzt mit Stapelabzug ins
Protokoll. Ein Fehler **mit** Schlüssel bleibt still — er ist beantwortet.

**Eine ungeeignete Datei lässt nichts zurück.** Der Fotoweg prüfte, wandelte
und schrieb jede Datei in einem Durchgang. Scheiterte `gridImage` bei der
fünften von zehn Dateien, standen die vier davor schon in der Datenbank und
die Antwort war eine Absage. Jetzt werden erst alle Dateien geprüft und
abgeleitet, dann schreibt eine `db.transaction`.

**Die Zahl der eigenen Suchplätze steht an einer Stelle.** Sie stand dreimal:
als `OWN_SLOTS` in `server.js`, als festes Array `[1, 2, 3]` in `sendOwn()`
und als drei einzeln aufgezählte Nummern im Stilblatt. `sendOwn()` zählt
jetzt, was der Server in `GET /api/settings` geschickt hat; das Stilblatt
greift die Felder über ihren gemeinsamen Anfang.

**Zwei deutsche Sätze standen fest im Skript.** Die beiden Sätze an der
Sternzeile — „{ratingOne} entfernen" und „{ratingOne} entfernt" — stehen jetzt
als `entry.removeRating` und `entry.ratingRemoved` in allen drei
Sprachdateien.

**Und der Filter des Sicherheitsprotokolls greift zum ersten Mal.** Der Server
liest die Auswahl als `req.query.group`; der Browser hängte sie als `?gruppe=`
an. Der Wert war damit bei jedem echten Aufruf undefiniert, und die Karte
zeigte statt der gewählten Ansicht die hundert jüngsten Zeilen. **Seit 0.13.0.**

*Im Prüfstand fiel es nicht auf, weil der Mock in `test/dom.js` denselben
deutschen Namen las wie der Browser — zwei Abschriften derselben Annahme, und
die dritte Stelle, die zählt, stand daneben.* Der serverseitige Filter stand in
keiner einzigen Prüfung.

**Das Handbuch hat die Zusage die ganze Zeit getragen:** „mit einer Ansicht
sind es die hundert jüngsten **dieser Art**, und damit findet man die
gescheiterten Versuche auch dann, wenn viel anderes dazwischensteht"
(`manual-de.md`). Sie stimmt erst mit dieser Runde.

**Der Befund ist in der Messung als „tot" geführt**, weil `group=` im ganzen
Repository nirgends vorkam. Er ist es nicht: er ist ein Fehler, den der Leser
sieht. Gebaut ist die Angleichung, die der Auftrag vorschlägt — der Browser
schickt `group`. **Der Wächter, der ihn gefunden hätte, steht jetzt da:** jeder
Abfrageparameter, den `public/app.js` baut, muss in `server.js` einen Leser
haben. Die eine Ausnahme heißt `v` und steht namentlich in der Prüfung — sie
hängt an der Kacheladresse und soll gerade nicht gelesen werden.

**Und der einzelne Eintrag ist über die Oberfläche zu holen.**
`GET /api/items/:id/export` gibt es seit 0.8.70, und kein Element der
Oberfläche rief die Route auf — erreichbar war sie nur, wer die Adresse von
Hand eintippt. Der Knopf steht im Fuß des Eintrags und nur beim Betreiber: die
Route trägt `ownerOnly`. Neu ist `entry.exportOne` in allen drei
Sprachdateien.

> **BERICHTIGT AM 17. SEPTEMBER 2026:** hier stand „seit 0.30.0“. Die Route
> steht im Änderungsprotokoll 0.8.70, Abschnitt J; 0.30.0 hat mit ihr nichts zu
> tun. Dieselbe Zahl war auch im CHANGELOG und im Projektstand falsch.

*Das Handbuch beschrieb die Funktion samt einer Beschriftung, die es nicht
gab („Diesen Eintrag als Datei"). Es nennt jetzt die wirkliche —
„{entryOne} exportieren", mit dem Wort aus dem Vokabular.*

---

## 8. Die Zusagen an den Prüfstand

| Nr | Zusage | Stand |
|---|---|---|
| 1 | Kein Verhalten ändert sich | gehalten bis auf **eine benannte Behebung** — 24 Stellen sind deshalb nicht gebaut |
| 2 | Die Zahl der Prüfungen bleibt gleich oder steigt | 6.903 → **6.969** |
| 3 | Kein Gruppenname ändert sich, außer er nennt eine Zahl | gehalten — **eine Ausnahme steht namentlich unten** |
| 4 | Je vereinfachter Stelle ein Rückbau | 1.000 → **1.032** |
| 5 | Gegenprobenlauf über die neuen Rückbauten, 0 stumm | **0 stumm** |
| 6 | Jede Laufzeitzahl aus fünf Läufen, Median | Abschnitt 10 |
| 7 | Der Fingerprint ändert sich | `1f76adac` → `5297965e` |

**Die eine Ausnahme zu Zusage 3:** `test/release_030.js` trug die Prüfung „Und
es sind genau sechs benannte Ausnahmen — zwei Befehle, drei Adressen, ein
Satz". `?gruppe=` stand darin, weil die Adresse ein deutsches Wort trug; mit
`group` trägt sie keines mehr. Die Prüfung heißt jetzt „Und es sind genau fünf
benannte Ausnahmen — zwei Befehle, zwei Adressen, ein Satz".

---

## 9. Was nicht gebaut ist — 24 Stellen

**Vier verlangen eine Schemaänderung** und sind von Abschnitt 9 des Auftrags
ausgeschlossen: die Spaltenfolge in `photos` (`db.js`:145), der fehlende Index
auf `ratings.criterion_id` (`db.js`:338), ein deckender Index für
`qAttachments` (`server.js`:2300) und `length(thumb)` in `idx_photos_tile`
(`server.js`:2429). **Sie stehen als Punkt 39 im Sammelblatt.**

**Drei „tote" Stellen verlangen dasselbe:** die acht `created_at`-Spalten ohne
Leser (`db.js`:549), `attachments.mime_type` (`db.js`:459) und `appVersion` im
Austauschformat (`server.js`:4021). Eine tote Spalte fällt nur mit einer
Schemaänderung, ein totes Feld im Format nur mit einer Formatnummer.

**Drei sind der Bauabschnitt „langsam im Speicher"** und fallen unter Zusage 1:

- **Der Export steht dreimal im Arbeitsspeicher** (`server.js`:4251). Der
  Umschlag stückweise mit `res.write()` zu schreiben ändert die Antwort: sie
  trägt dann keine `Content-Length` mehr, sondern geht in Stücken hinaus. Das
  ist für den Leser dieselbe Datei und für den Prüfstand eine andere Antwort.
- **Die Importdatei liegt viermal im Speicher** (`server.js`:4669). `multer`
  auf `diskStorage` zu stellen verlegt die Datei ins Dateisystem und verlangt
  ein Aufräumen auf jedem Fehlerweg. Ein Fehler dort verliert Daten.
- **`intoTrash` führt jedes Blob durch Node** (`server.js`:4722). Der saubere
  Weg — je Trägertabelle eine Anweisung `INSERT … SELECT` — verlangt, dass
  `entryAsBundle` die Blobspalten gar nicht erst liest. Diese Funktion trägt
  auch den Export; sie dafür umzubauen ist mehr als ein Handgriff.

**Zwei betreffen die Obergrenzen beim Hochladen** (`server.js`:3046 und 3227).
Die Zählung vor `multer` zu ziehen sagt dieselbe Absage mit demselben Text,
schneidet aber die laufende Übertragung ab. Das sieht ein Browser.

**Einer widerspricht einer bestehenden Prüfung.** `server.js`:2897 — die Route
`GET /api/items` setzt je Eintrag eine Abfrage für die Testzahlen ab. Die
gebündelte Fassung ist gebaut, gemessen und wieder zurückgenommen worden:
`test/roundtrip.js` hält ausdrücklich fest, dass die Route gebündelt
**langsamer** wäre. Der Rückbau dazu ist entfernt.

**Sieben sind „umständlich" und berühren die Schnittstelle:** das Gerüst der
zehn Anmeldeseiten (`public/app.js`:557), die Tafel der Sortierungen (1901),
und fünf Stellen, an denen Browser und Server dieselbe Regel kennen —
Markierungen (1394), Vorräte der Einstellungen (897), `searchFold` (1372), die
Obergrenzen (5423) und der Gesamtschnitt (3293). Jede von ihnen verlangt, dass
der Server mehr schickt als heute. Das ist eine Änderung der Antwort und damit
Zusage 1.

**Vier sind „langsam" im Browser:** die Zeitleiste zeichnet bei jedem
`drawBody` neu (`public/app.js`:2785), der Klick auf einen Kartenfuß zeichnet
die ganze Liste neu (3001), `renderSystem` holt zwölf Endpunkte für einen
Abschnitt (5936), und ein Datumsfeld zeichnet die Kommentare neu, wenn es den
Fokus ohne Änderung verliert (5535). Alle vier sind in der Messung mit **V**
gekennzeichnet: der Augenschein ändert sich.

**Zum Teil gebaut ist eine Stelle:** von den 625 festen Wartezeiten des
Prüfstands (`test/dom.js`:1316) sind elf umgestellt, 614 bleiben stehen —
Abschnitt 6, und Punkt 41 im Sammelblatt.

**Und der Kommentaranteil des Stilblatts** liegt bei 54,5 statt 30 Prozent —
Abschnitt 5, und Punkt 42 im Sammelblatt.

---

## 10. Laufzeit

**Fünf Läufe je Stand, Median** — Zusage 6. Nacheinander auf demselben
Rechner, ohne andere Last.

| | Läufe (s) | Median |
|---|---|---:|
| vor der Runde (`578bb63`) | 299,1 · 299,4 · 299,8 · 300,5 · 300,8 | **299,8 s** |
| nach der Runde | 298,1 · 298,8 · 299,4 · 300,5 · 300,8 | **299,4 s** |

**Der Prüfstand läuft 0,4 Sekunden kürzer, und das ist keine Verbesserung,
sondern Rauschen.** Die Spanne innerhalb eines Standes beträgt 1,7 und 2,7
Sekunden; der Unterschied zwischen den Ständen liegt darunter.

**Die Rechnung dahinter geht auf, und sie sagt, warum:**

| | Sekunden |
|---|---:|
| elf Wartezeiten von 1.100 ms auf die Sekundengrenze | **−6,3** |
| 80 Serverstarts komprimieren `public/` beim Start | **+3,3** |
| 66 neue Prüfungen, zehn neue Gruppen | ~+1 |
| Rest | ~−0,4 |

Die 6,3 Sekunden sind gerechnet: elf Stellen, die vorher fest 1.100 ms
warteten und jetzt im Mittel 525 ms warten (die halbe Sekunde bis zur Grenze
plus 25 ms Abstand). Die 3,3 Sekunden sind gemessen: **41,3 ms** für einen
Durchgang über `public/` mit `gzip` auf Stufe 9, Median aus fünf Messungen,
mal 80 Server, die ein voller Lauf startet.

> **DER ZWEITE POSTEN FÄLLT IM BETRIEB NICHT AN.** Eine Installation startet
> einmal und komprimiert einmal. Der Prüfstand startet 80 Server und zahlt
> deshalb 80-mal — das ist der Preis dafür, dass jeder dieser Server der
> echte ist.

**Was die Runde WIRKLICH schneller macht, steht nicht in dieser Tabelle.** Der
Leser lädt 268.441 statt 1.001.488 Bytes (Abschnitt 4); `GET /api/photos/:id/raw`
zieht für eine Kachel nicht mehr bis zu 20 MB durch den Arbeitsspeicher
(Abschnitt 4). Beides ist am Quelltext gezählt und nicht am laufenden Betrieb
gestoppt — Abschnitt 11 des Auftrags sagt dasselbe über die Messung, auf der
diese Runde steht.

---

## 11. Die Gegenproben

Zweiunddreißig neue Rückbauten, 1.000 → 1.032. Je Bauabschnitt mindestens einer, und
für jede vereinfachte Stelle einer. Gefahren sind sie in Gruppen; **keiner ist
stumm geblieben** — jeder färbt die Gruppe rot, die ihn belegen soll.
