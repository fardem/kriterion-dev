# Konzept — Große Dateien bis 2 GB

**Konzeptpapier · Stand 27. August 2026 · Teil I gebaut in 0.8.50, Teil II
offen.**

> ## TEIL I IST GEBAUT UND STEHT NICHT MEHR HIER
>
> **Kurzvideos am Fotoplatz sind seit 0.8.50 gebaut.** Was gilt, steht ab
> Revision 25 des Projektstands **dort und nur dort** — Abschnitt 4
> (Funktionsumfang), Abschnitt 5 (die Entscheidungen), Abschnitt 5a (die
> Auslieferung) und Abschnitt 9 (was die Runde brachte). Die vollständige
> Herleitung samt Gegenprobentabelle steht in
> `Doku/Aenderungsprotokoll_0.8.50.md`.
>
> **Der Entwurf ist hier entfernt, weil er sonst eine zweite Wahrheit wäre.**
> Er ist vor dem Bau geschrieben worden und wich an fünf Stellen vom Gebauten
> ab; solange beides nebeneinander stand, musste jede Zahl an zwei Orten
> gepflegt werden — und genau daran ist Stolperstein 137 entstanden.
>
> **Wo die fünf Abweichungen jetzt stehen**, damit ältere Verweise auf die
> Abschnitte dieses Papiers noch aufgehen:
>
> | hieß hier | wo es jetzt steht |
> |---|---|
> | 3 — Datenmodell, `art` und `dauer` | Projektstand, Abschnitt 4 („Was die vorhandenen Spalten bei einem Video bedeuten") |
> | 3a — „Es gelten dieselben Regeln wie am Foto" | Projektstand, Abschnitt 4 und Abschnitt 5.7 („Fotos und Videos stehen in EINER Tabelle") |
> | 4 — das Standbild ohne `ffmpeg` | Projektstand, Abschnitt 5.7 (`ffmpeg` kommt nicht ins Image; das Standbild belegt nichts) |
> | 5/6 — Formate und Auslieferung | Projektstand, Abschnitt 5a (achte Schicht, Videoweg) |
> | 9 — Export | Projektstand, Abschnitt 4 und Abschnitt 9 (Formatnummer 9 → 10, eigener Schalter) |
>
> **Die fünf Abweichungen selbst, in einem Satz:** der ausgelieferte Typ kommt
> **nicht nach Endung**, sondern aus den ersten Bytes (`photos` speichert keinen
> Dateinamen); **`Accept-Ranges` wird geliefert**, nicht abgeschaltet; die
> Sicherheitsregel der Anwendung brauchte **`media-src 'self' blob:`**; **kein
> Videoplatz ohne Videodatei** im Export, stattdessen eine Marke in der Datei;
> und das **Standbild muss eigens in die Exportdatei**, sonst erzeugte der
> Import die Varianten aus der Videodatei.

**Dieses Papier trägt ab jetzt nur noch Teil II.** Sprache wie in den übrigen
Papieren: gewöhnliches IT-Deutsch.

---

## 1. Es sind zwei Vorhaben, nicht eins

Das war die wichtigste Erkenntnis dieses Papiers und steht deshalb weiter vorn —
sie ist der Grund, warum Teil II eine eigene Runde ist und nicht ein Anbau an
Teil I.

| | **Kurzvideo** *(gebaut, 0.8.50)* | **Große Datei** *(offen)* |
|---|---|---|
| Wo | an der Stelle der Fotos | an der Stelle der Anhänge |
| Größe | bis **20 MB** | bis **2 GB** |
| Gespeichert | als BLOB **in** der Datenbank | als Datei **neben** der Datenbank |
| Verschlüsselt | durch SQLCipher, wie alles | **eigens**, mit eigenem Verfahren |
| Ausgeliefert | am Stück, mit Ranges | in **Ranges** über eine Datei |
| Hochgeladen | in einem Zug | **in Stücken** |
| Im JSON-Export | möglich, aber abschaltbar | **unmöglich** |
| Aufwand | überschaubar | ein eigener Bauabschnitt |

**Der Größenunterschied ist nicht der eigentliche Unterschied.** Er ist der
Auslöser für vier bauliche Unterschiede — Speicherort, Verschlüsselung,
Auslieferung und Hochladen —, und jeder einzelne davon zieht eigenen Code nach
sich. *Wer beides in einem Zug baut, baut zwei Dinge gleichzeitig und hat
hinterher an keinem eine klare Regel.*

**Warum Teil II nach 1.0.0 liegt.** Ab 1.0 wird Abwärtskompatibilität
**zugesichert**. Teil I änderte `photos` — die Tabelle, in der jeder vorhandene
Bestand liegt —, und so etwas gehört **vor** die Zusage. Teil II legt dagegen
nur **Neues** daneben: ein vorhandener Anhang bleibt, wo er ist, und nur neue
große Dateien gehen nach draußen. **Deshalb bricht Teil II die Zusage nicht.**

*Das ist die Umkehrung des ersten Entwurfs, und der Grund gehört genannt: dort
stand „beides nach 1.0, weil beides Datenmodell und Speicherort anfasst". Das
Argument ist richtig, zeigt aber in die andere Richtung.*

**Teil II lässt sich jederzeit vorziehen**, ohne dass an Teil I etwas anders
gebaut werden müsste. Die beiden teilen sich **keinen Code**: der eine Weg legt
BLOBs in die Datenbank, der andere Dateien daneben. Was sie teilen, ist allein
die Positivliste der Formate — und die steht ohnehin an einer Stelle.

**Eine Vorgabe aus 0.8.70 gilt hier schon:** eine Exportdatei ist **ein** String,
und Node hält keinen über 512 MB. Eine Datei über rund 950 MB passt deshalb auch
nicht in eine Zelle und teilt sich auf mehrere `papierkorb_bytes.nr` auf
(Projektstand, Abschnitt 5.4).

---

# Teil II — Große Dateien bis 2 GB

## 10. Warum die Datenbank ausscheidet

Bei 2 GB scheitert es an drei Stellen gleichzeitig:

- **Eine BLOB-Zeile wird ganz gelesen.** Der Weg, den Kriterion benutzt, gibt
  einen Buffer zurück — 2 GB im Arbeitsspeicher, und Node kann einen einzelnen
  Buffer über 2 GB gar nicht halten.
- **Kein Springen.** Ohne Range-Abfragen kann der Browser in einem Video
  nicht vorspulen — und iOS Safari spielt ein Video **überhaupt nicht** ab,
  wenn der Server keine Ranges anbietet.
- **Hochladen in einem Zug** geht nicht: `multer.memoryStorage()` nimmt die
  Datei komplett in den Speicher.

## 11. Der Speicherort — und wie er verschlüsselt bleibt

Große Dateien liegen als **eigene Dateien** unter `data/blobs/<id>`. Damit ist
die erste Frage sofort da: **die Datenbank ist verschlüsselt, diese Dateien
wären es nicht.** Das wäre ein Loch mitten durch das Kernversprechen.

Also bekommen sie eine **eigene Verschlüsselung**. Der Schlüssel wird aus dem
Datenbankschlüssel abgeleitet (`hkdf`, eingebaut in Node) — **ein Schlüssel für
die Instanz bleibt wahr**, es gibt nichts zusätzlich zu verwahren, und der Satz
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

- **Springen bleibt möglich:** ein Range betrifft ein paar Stücke, nur die
  werden geöffnet.
- **Veränderung fällt auf:** ein gekipptes Bit lässt die Marke scheitern, und
  zwar bevor etwas ausgeliefert wird.
- **Kosten:** 16 Bytes je Megabyte — bei 2 GB rund 32 KB. Nichts.
- **Aufwand:** etwa achtzig Zeilen gegenüber dreißig für CTR pur.

Die fünfzig Zeilen sind gut angelegt. Eine Verschlüsselung, die nur gegen Lesen
schützt und nicht gegen Verändern, ist in einem Papier schwer zu erklären — und
in diesem Projekt wäre sie die einzige Stelle, an der etwas *halb* geschützt ist.

## 12. Ausliefern in Ranges

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
- **Der Range kommt vom Aufrufer** und ist zu prüfen: Ende vor Anfang,
  Anfang hinter dem Dateiende, absurd große Spannen. Ungültiges wird mit
  **416** beantwortet, nicht stillschweigend zurechtgebogen.
- **Ein Range darf nichts über die Datei verraten**, was ein voller Abruf
  nicht auch verriete — die Rechteprüfung sitzt vor dem Range, nicht dahinter.

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

## 15. Aufwand

| | Umfang | Was daran hängt |
|---|---|---|
| **Teil I — Kurzvideos** | mittel — **gebaut in 0.8.50** | zwei Spalten, ein Upload-Weg, Standbild im Browser, Abspieler im Vollbild, ein Export-Schalter |
| **Teil II — Große Dateien** | **groß** | zweiter Speicherort, eigene Verschlüsselung, Range-Abfragen, stückweises Hochladen, Aufräumen, Platzprüfung |

**Teil I war für sich vollständig** und brauchte von Teil II nichts. *Der
Aufwand „mittel" hat gestimmt: 146 neue Prüfungen, 30 Gegenproben, vier neue
Stolpersteine.* **Für Teil II ist „groß" die Schätzung, und sie ist nicht
nachgemessen** — die einzige Zahl daran, die es schon gibt, ist die gemessene
Sprungprobe aus Abschnitt 11.

## 16. Was ich ausdrücklich nicht vorschlage

- **Umkodieren auf dem Server.** Das hieße `ffmpeg`, und `ffmpeg` hieße eine
  eigene Angriffsfläche, ein eigener Aktualisierungsbedarf und ein Vielfaches
  der Imagegröße. Die Antwort auf ein nicht abspielbares Format ist der
  Anhang, nicht ein Umkodierer.
- **Videos in Kommentaren.** Kommentarbilder sind bewusst klein und werden
  neu kodiert. Ein Video dort wäre ein dritter Speicherweg für dieselbe Sache.
- **Automatisches Abspielen, Vorschau beim Überfahren, Endloswiedergabe.**
  Nichts davon gehört in ein Bewertungsarchiv.
- **Ein Video als Anhang gleichzeitig am Fotoplatz.** Eine Datei, ein Platz.
  Wer ein großes Video will, hängt es an; wer es in der Reihe haben will,
  nimmt ein kurzes.
