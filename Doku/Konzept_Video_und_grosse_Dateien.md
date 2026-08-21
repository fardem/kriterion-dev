# Konzept — Videos und große Dateien

Vorgesehen **nach 1.0**. Der Projektstand führt Videos seit Langem als
zurückgestellt („kein Verzicht, sondern ein eigener Bauabschnitt"); dieses
Papier sagt, wie der Bauabschnitt aussähe.

Sprache wie in den übrigen neuen Papieren: gewöhnliches IT-Deutsch.

---

## 1. Es sind zwei Vorhaben, nicht eins

Das ist die wichtigste Erkenntnis dieses Papiers, und sie steht deshalb vorn.

| | **Kurzvideo** | **Große Datei** |
|---|---|---|
| Wo | an der Stelle der Fotos | an der Stelle der Anhänge |
| Größe | bis **20 MB** | bis **2 GB** |
| Gespeichert | als BLOB **in** der Datenbank | als Datei **neben** der Datenbank |
| Verschlüsselt | durch SQLCipher, wie alles | **eigens**, mit eigenem Verfahren |
| Ausgeliefert | am Stück | in **Bereichen** (Springen im Video) |
| Hochgeladen | in einem Zug | **in Stücken** |
| Im JSON-Export | möglich, aber abschaltbar | **unmöglich** |
| Aufwand | überschaubar | ein eigener Bauabschnitt |

**Der Größenunterschied ist nicht der eigentliche Unterschied.** Er ist der
Auslöser für vier bauliche Unterschiede — Speicherort, Verschlüsselung,
Auslieferung und Hochladen —, und jeder einzelne davon zieht eigenen Code nach
sich. Wer beides in einem Zug baut, baut zwei Dinge gleichzeitig und hat
hinterher an keinem eine klare Regel.

**Deshalb: zwei Versionen.** Kurzvideos zuerst — sie sind für sich vollständig
und liefern den sichtbaren Nutzen. Große Dateien danach.

---

# Teil I — Kurzvideos an der Stelle der Fotos

## 2. Was es können soll

Ein Video liegt **in derselben Reihe wie die Fotos**. Auf der Karte und in der
Vorschauleiste erscheint ein Standbild mit einem Abspielzeichen; ein Klick
spielt es ab. Ist es das erste Element, ist sein Standbild das Hauptbild des
Eintrags.

## 3. Datenmodell — dieselbe Tabelle, eine Spalte mehr

```sql
-- photos traegt seit dieser Version zwei Arten. Der Tabellenname wandert
-- NICHT mit (dieselbe Regel wie bei katalog.sqlite): ein umbenannter Name
-- brauchte einen Tabellenneubau und braechte nichts.
ALTER TABLE photos ADD COLUMN art TEXT NOT NULL DEFAULT 'bild';   -- 'bild' | 'video'
ALTER TABLE photos ADD COLUMN dauer INTEGER;                      -- Sekunden, nur bei Video
```

**Warum keine eigene Tabelle `videos`.** Fotos und Videos stehen in **einer**
Reihenfolge — `sort_order` entscheidet, was das Hauptbild ist. Zwei Tabellen
hießen: zwei sortierte Listen, die beim Anzeigen zusammengefügt werden müssen,
und die Frage „was steht an erster Stelle" hätte zwei Quellen. Das ist die
zweite Wahrheit in Reinform.

Mit einer Spalte bleibt alles, was es schon gibt: das Ziehen zum Umsortieren,
`sort_order`, `focus_x`/`focus_y` (sie wirken auf das Standbild), die
Löschwege, die Kaskade am Eintrag.

**Was die vorhandenen Spalten bei einem Video bedeuten:**

| Spalte | bei `art = 'bild'` | bei `art = 'video'` |
|---|---|---|
| `data` | das Originalbild | die **Videodatei** |
| `thumb` | Kachel 400 px | **Standbild** 400 px |
| `medium` | 1600 px | **Standbild** 1600 px |
| `focus_x`/`focus_y` | Ausschnitt der Kachel | dasselbe, am Standbild |
| `dauer` | `NULL` | Sekunden |

Damit funktionieren Kartenraster, Vorschauleiste und Sortierung **ohne eine
einzige Änderung** — sie greifen ohnehin nur auf `thumb` und `sort_order` zu.

## 4. Das Standbild — und warum dafür kein `ffmpeg` nötig ist

**Das ist die Entscheidung, an der das ganze Vorhaben hängt.**

Ein Standbild aus einem Video zu holen, heißt normalerweise: `ffmpeg`. Das ist
ein Programm von rund hundert Megabyte, das ins Abbild müsste, mit eigener
Angriffsfläche und eigenem Aktualisierungsbedarf. Für ein Projekt, das scrypt
lieber aus Nodes eingebautem `crypto` nimmt als aus einer Bibliothek, wäre das
ein Bruch.

**Der Ausweg: das Standbild macht der Browser, bevor hochgeladen wird.**

```js
/* Ein Standbild aus dem gewaehlten Video ziehen -- im Browser, ohne dass der
   Server das Video je oeffnen muesste. Der Browser kann alle Formate
   abspielen, die er auch anzeigen wird; kann er es nicht, taugt das Video
   ohnehin nicht fuer die Vorschau. */
async function standbild(datei, sekunde = 1) {
  const v = document.createElement('video');
  v.preload = 'metadata'; v.muted = true;
  v.src = URL.createObjectURL(datei);
  await new Promise((ok, fehl) => { v.onloadedmetadata = ok; v.onerror = fehl; });
  v.currentTime = Math.min(sekunde, (v.duration || 2) / 2);
  await new Promise((ok, fehl) => { v.onseeked = ok; v.onerror = fehl; });
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  URL.revokeObjectURL(v.src);
  return { bild: await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85)),
           dauer: Math.round(v.duration) || null };
}
```

Hochgeladen werden dann **zwei Teile**: die Videodatei und ein JPEG. Der Server
schickt das JPEG durch `sharp` und erzeugt daraus wie bei jedem Foto Kachel und
mittlere Variante — **damit gilt für das Standbild dieselbe Regel wie für
Kommentarbilder**: was `sharp` nicht als Bild lesen kann, kommt nicht herein.

**Vier Folgen, alle gewollt:**

1. **Keine neue Abhängigkeit.** Nicht eine.
2. **Der Server öffnet nie ein Video.** Er speichert Bytes und liefert Bytes.
   Die gesamte Klasse von Verwundbarkeiten in Video-Bibliotheken entfällt,
   weil keine im Spiel ist.
3. **Wer es nicht abspielen kann, kann es nicht hochladen** — und genau das ist
   richtig: ein Videoplatz, der nicht abspielt, ist ein kaputter Platz. Wer
   ein Format ablegen will, das der Browser nicht kann, nimmt den Anhang.
4. **Das Standbild ist nicht überprüfbar.** Ein manipulierter Browser könnte ein
   Standbild schicken, das nicht zum Video gehört. Das ist hinnehmbar — es ist
   eine Vorschau, keine Aussage. Und es steht ausdrücklich hier, damit niemand
   später glaubt, das Standbild belege etwas.

**Wenn der Browser scheitert:** Upload trotzdem zulassen? **Nein.** Siehe
Folge 3 — sonst entsteht ein Platz ohne Bild und ohne Abspielbarkeit, und
niemand versteht, warum.

## 5. Welche Formate

Eine Positivliste nach **Endung**, wie in `anhaenge.js`:

| Endung | Typ | Anmerkung |
|---|---|---|
| `.mp4`, `.m4v` | `video/mp4` | H.264/AAC — läuft überall |
| `.webm` | `video/webm` | VP8/VP9 — überall außer älterem Safari |
| `.mov` | `video/quicktime` | **Grenzfall**, siehe unten |

**`.mov` ist der Grenzfall, den die Praxis erzwingt:** jedes iPhone liefert
`.mov`. Meist steckt darin H.264, das jeder Browser abspielen kann — aber nicht
immer. Die Antwort ist **nicht**, es zu verbieten, sondern die Prüfung aus
Abschnitt 4 entscheiden zu lassen: Kann der Browser des Hochladenden ein
Standbild ziehen, spielt er es ab. Kann er es nicht, wird abgewiesen.

**Alles Übrige — `.avi`, `.mkv`, `.wmv`, `.flv` — gehört an den Anhang**, nicht
an den Fotoplatz. Dort wird es heruntergeladen, und das ist die ehrliche
Antwort.

## 6. Auslieferung — und der Befund, der hier nicht wiederkommen darf

`GET /api/photos/:id/raw` liefert heute den **gespeicherten** `mime_type`
zurück. Genau das ist Befund 2.1 aus dem Ideenpapier, und beim Video wäre es
schlimmer: eine Videodatei wird **inline** eingebunden.

**Die Regel für den Videoweg, ohne Ausnahme:**

1. Der ausgelieferte Typ kommt **aus der Positivliste in Abschnitt 5**, nach
   Endung — nie aus der Datenbank.
2. Was nicht auf der Liste steht: `application/octet-stream` und
   `Content-Disposition: attachment`.
3. `X-Content-Type-Options: nosniff` (steht schon global).
4. `Content-Security-Policy: default-src 'none'` auf der Antwort. **Das
   verhindert das Abspielen nicht** — die Regel gilt dem, was *diese Antwort*
   nachlädt, und ein Video lädt nichts nach. Eingebunden wird es von der Seite,
   und dort entscheidet deren `media-src 'self'`.
5. `Accept-Ranges: none` in Teil I — bei 20 MB lädt der Browser die Datei ganz
   und springt darin selbst.

## 7. Was es kostet — gemessen

20 MB als BLOB in der verschlüsselten Datenbank, auf dieser Maschine:

| Größe | Schreiben | Lesen |
|---|---|---|
| 10 MB | 515 ms | 85 ms |
| **20 MB** | **770 ms** | **124 ms** |
| 50 MB | 2.201 ms | 533 ms |

**Deshalb 20 MB und nicht 50.** Bei 50 MB steht der Prozess beim Lesen eine
halbe Sekunde — und zwar mit dem gesamten Blob im Arbeitsspeicher, weil eine
BLOB-Zeile nicht stückweise gelesen wird. Bei zwei Leuten gleichzeitig ist das
spürbar. 20 MB reichen für ein bis zwei Minuten Handyvideo in vernünftiger
Auflösung; wer mehr braucht, ist in Teil II richtig.

## 8. Bedienung

- **In der Vorschauleiste** trägt ein Video ein ▶ in der Ecke und, wenn
  `dauer` bekannt ist, seine Länge (`0:42`).
- **Im Vollbild** wird statt `<img>` ein `<video controls>` gezeigt. Das
  Blättern mit ← → bleibt; beim Verlassen wird angehalten.
- **Kein Zoom bei einem Video** — der zweite Klick, der beim Bild auf
  Originalgröße geht, gehört beim Video der Abspielsteuerung.
- **Auf der Karte** ändert sich nichts: dort steht das Standbild, wie ein Foto.
  Ein Abspielzeichen darauf, sonst nichts — angespielt wird erst im Eintrag.
- **Kein automatisches Abspielen**, nirgends.

## 9. Export

Ein 20-MB-Video wird als Base64 zu **27 MB**. Zwanzig davon sind 540 MB in
**einer** JSON-Zeichenkette — das reißt den Export, siehe Abschnitt 3.2 des
Ideenpapiers.

**Deshalb ein eigener Schalter, Vorgabe aus** — wie schon bei den Anhängen
(`files=1`). Der Export enthält bei ausgeschaltetem Schalter den **Eintrag des
Videos** (Name, Dauer, Reihenfolge) und sein **Standbild**, nur nicht die
Videodatei. Beim Einspielen entsteht daraus ein Platz mit Standbild und dem
Vermerk, dass die Datei fehlt.

Das ist ehrlicher als beides andere: die Datei stillschweigend wegzulassen
verlöre die Reihenfolge, und sie mitzunehmen ließe den Export scheitern.

**Der eigentliche Sicherungsweg für Videos ist ohnehin nicht der Export**,
sondern die Sicherung des Datenverzeichnisses (im Roadmap-Papier Stufe
„Sicherung und Papierkorb").

---

# Teil II — Große Dateien bis 2 GB

## 10. Warum die Datenbank ausscheidet

Bei 2 GB scheitert es an drei Stellen gleichzeitig:

- **Eine BLOB-Zeile wird ganz gelesen.** Der Weg, den Kriterion benutzt, gibt
  einen Buffer zurück — 2 GB im Arbeitsspeicher, und Node kann einen einzelnen
  Buffer über 2 GB gar nicht halten.
- **Kein Springen.** Ohne Bereichsabfragen kann der Browser in einem Video
  nicht vorspulen — und iOS Safari spielt ein Video **überhaupt nicht** ab,
  wenn der Server keine Bereiche anbietet.
- **Hochladen in einem Zug** geht nicht: `multer.memoryStorage()` nimmt die
  Datei komplett in den Speicher.

## 11. Der Speicherort — und wie er verschlüsselt bleibt

Große Dateien liegen als **eigene Dateien** unter `data/blobs/<id>`. Damit ist
die erste Frage sofort da: **die Datenbank ist verschlüsselt, diese Dateien
wären es nicht.** Das wäre ein Loch mitten durch das Kernversprechen.

Also bekommen sie eine **eigene Verschlüsselung**. Der Schlüssel wird aus dem
Datenbankschlüssel abgeleitet (`hkdf`, eingebaut in Node) — **ein Schlüssel für
die Anlage bleibt wahr**, es gibt nichts zusätzlich zu verwahren, und der Satz
„ohne den Schlüssel ist alles verloren" gilt unverändert.

### Der Kern: Verschlüsselung, in der man springen kann

Ein gewöhnliches Verfahren zwingt zum Entschlüsseln von vorn — bei 2 GB
undenkbar. **AES im Zählermodus (CTR) nicht:** jeder 16-Byte-Block hat seine
eigene Zählerstellung, und die lässt sich ausrechnen. Wer bei Byte 33.333.333
anfangen will, rückt den Zähler um `33333333 / 16` vor und entschlüsselt ab
dort.

**Nachgemessen**, 50-MB-Datei, Sprünge an neun Stellen:

```
  Sprung auf Byte         0 -> ✓     Sprung auf Byte   1048576 -> ✓
  Sprung auf Byte         1 -> ✓     Sprung auf Byte  33333333 -> ✓
  Sprung auf Byte        15 -> ✓     Sprung auf Byte  52428700 -> ✓
  Sprung auf Byte        16 -> ✓
  Sprung auf Byte        17 -> ✓     1 MB aus der Mitte: 15 ms
```

Auch die unbequemen Fälle — Sprung mitten in einen Block (Byte 1, 15, 17) —
stimmen, wenn man am Blockanfang aufsetzt und die überzähligen Bytes vorn
abschneidet. Es ist also **baubar, und zwar mit Nodes eingebautem `crypto`,
ohne jede Abhängigkeit**.

### Der Haken, und er gehört benannt

**CTR allein schützt nicht gegen Veränderung.** Wer Schreibzugriff auf
`data/blobs` hat, kann Bits kippen, und niemand merkt es. Bei der Datenbank
übernimmt SQLCipher diesen Schutz mit; hier fiele er weg.

**Empfehlung: nicht CTR pur, sondern stückweise mit Beglaubigung.** Die Datei
wird in Stücke von 1 MB zerlegt, jedes Stück einzeln mit `aes-256-gcm`
verschlüsselt, der Zählerwert enthält die Stücknummer, und die 16-Byte-Marke
jedes Stücks steht dahinter.

- **Springen bleibt möglich:** ein Bereich betrifft ein paar Stücke, nur die
  werden geöffnet.
- **Veränderung fällt auf:** ein gekipptes Bit lässt die Marke scheitern, und
  zwar bevor etwas ausgeliefert wird.
- **Kosten:** 16 Bytes je Megabyte — bei 2 GB rund 32 KB. Nichts.
- **Aufwand:** etwa achtzig Zeilen gegenüber dreißig für CTR pur.

Die fünfzig Zeilen sind gut angelegt. Eine Verschlüsselung, die nur gegen Lesen
schützt und nicht gegen Verändern, ist in einem Papier schwer zu erklären — und
in diesem Projekt wäre sie die einzige Stelle, an der etwas *halb* geschützt ist.

## 12. Ausliefern in Bereichen

```
GET /api/attachments/17/raw
Range: bytes=1048576-2097151

206 Partial Content
Accept-Ranges: bytes
Content-Range: bytes 1048576-2097151/2147483648
Content-Length: 1048576
Content-Type: video/mp4              <- aus der Positivliste, nie gespeichert
Content-Disposition: inline          <- nur fuer Video und die bisherige Liste
```

Was dabei zu beachten ist:

- **Ohne `Accept-Ranges` spielt iOS Safari gar nicht ab.** Das ist kein
  Feinschliff, sondern die Voraussetzung.
- **Der Bereich kommt vom Aufrufer** und ist zu prüfen: Ende vor Anfang,
  Anfang hinter dem Dateiende, absurd große Spannen. Ungültiges wird mit
  **416** beantwortet, nicht stillschweigend zurechtgebogen.
- **Ein Bereich darf nichts über die Datei verraten**, was ein voller Abruf
  nicht auch verriete — die Rechteprüfung sitzt vor dem Bereich, nicht dahinter.

## 13. Hochladen in Stücken

Der Browser zerlegt die Datei (`File.slice()`) und schickt Stücke von etwa
5 MB. Der Server hängt sie an, verschlüsselt sie stückweise und führt Buch:

```sql
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,            -- vom Server vergeben, nicht vom Aufrufer
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  dateiname TEXT NOT NULL,
  groesse INTEGER NOT NULL,       -- angekuendigt
  empfangen INTEGER NOT NULL DEFAULT 0,
  begonnen TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Drei Dinge, die dabei schiefgehen können und deshalb vorab geregelt gehören:

- **Ein Upload, der nie fertig wird**, hinterlässt eine halbe Datei. Beim Start
  und einmal täglich werden Uploads älter als 24 Stunden samt ihrer Bruchstücke
  entfernt.
- **Die angekündigte Größe ist eine Behauptung.** Wer mehr schickt, als er
  angekündigt hat, wird abgebrochen — sonst füllt ein Aufrufer die Platte.
- **Der Fortschritt gehört in die Oberfläche.** Ein Upload, der zwei Minuten
  dauert und dabei nichts anzeigt, sieht aus wie ein Absturz.

## 14. Was Teil II sonst noch anfasst

| Betroffen | Warum |
|---|---|
| **Sicherung** | `./data` deckt weiterhin alles ab — die Dateien liegen darunter. Der Satz in der README bleibt wahr, die Größenordnung ändert sich. |
| **Papierkorb** | Ein gelöschter Eintrag nimmt Dateien mit, die nicht in der Datenbank stehen. Die Kaskade kann das nicht — es braucht ein Aufräumen verwaister Dateien beim Start. |
| **Kennzahlen** | Die Datenbankgröße ist nicht mehr die Gesamtgröße. Beide Zahlen gehören in den Systembereich. |
| **Export** | Kann Dateien dieser Größe nicht enthalten, unter keinen Umständen. Er nennt sie und lässt sie weg. |
| **Speicherplatz** | Mit 2-GB-Dateien ist „kein Platz mehr" ein realer Betriebsfall. Vor dem Annehmen eines Uploads wird der freie Platz geprüft. |

---

## 15. Aufwand und Reihenfolge

| | Umfang | Was daran hängt |
|---|---|---|
| **Teil I — Kurzvideos** | mittel | zwei Spalten, ein Upload-Weg, Standbild im Browser, Abspieler im Vollbild, ein Export-Schalter |
| **Teil II — Große Dateien** | **groß** | zweiter Speicherort, eigene Verschlüsselung, Bereichsabfragen, stückweises Hochladen, Aufräumen, Platzprüfung |

**Teil I ist für sich vollständig** und braucht von Teil II nichts. Wer nur
kurze Videos an der Stelle der Fotos will — und das war der Ausgangswunsch —
ist danach fertig.

**Vorschlag: 1.1.0 für Teil I, 1.2.0 für Teil II.** Beides nach 1.0, weil
beides Datenmodell und Speicherort anfasst und die Zusage der
Abwärtskompatibilität ab 1.0 gilt: ein Bestand mit Videos muss dann in jeder
folgenden Version lesbar bleiben. Diese Zusage will man nicht einlösen müssen,
während man noch überlegt, wie die Dateien liegen sollen.

## 16. Was ich ausdrücklich nicht vorschlage

- **Umkodieren auf dem Server.** Das hieße `ffmpeg`, und `ffmpeg` hieße eine
  eigene Angriffsfläche, ein eigener Aktualisierungsbedarf und ein Vielfaches
  der Abbildgröße. Die Antwort auf ein nicht abspielbares Format ist der
  Anhang, nicht ein Umkodierer.
- **Videos in Kommentaren.** Kommentarbilder sind bewusst klein und werden
  neu kodiert. Ein Video dort wäre ein dritter Speicherweg für dieselbe Sache.
- **Automatisches Abspielen, Vorschau beim Überfahren, Endloswiedergabe.**
  Nichts davon gehört in ein Bewertungsarchiv.
- **Ein Video als Anhang gleichzeitig am Fotoplatz.** Eine Datei, ein Platz.
  Wer ein großes Video will, hängt es an; wer es in der Reihe haben will,
  nimmt ein kurzes.
