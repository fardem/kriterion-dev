# Konzept — Dateien, Ordner und große Videos

*Stand 28. September 2026, gegen Kriterion 0.44.2. Löst Teil II von
`Doku/Konzept_Video_und_grosse_Dateien.md` ab. Grundlage: die Vorgaben des Betreibers
vom 27. und 28. September 2026 (Nr. 1 bis 20), sieben Bestandsaufnahmen, drei Entwürfe,
die Prüfung der ersten Fassung (76 Befunde) und die Gegenprüfung der zweiten
(15 Befunde). Antworten des Betreibers vom 28. September 2026 eingearbeitet, zuletzt
F11 bis F16 (Speicherort nach Testtag). Die Vorgaben stehen in Anhang B. Nichts ist
gebaut.*

„Testtag" steht für das Wort aus dem Vokabular (`V.dayOne`, `public/app.js:1233`). Neue
Texte verwenden es nur ohne Artikel, als `{dayOne}`. Ausnahme ist der Name der Grenze
„Video am {dayOne}" (F13).

## Auf einen Blick

- Der Block „Dateien" wird ein Kachelraster: oben die Dateien ohne Ordner, darunter
  aufklappbare Ordner. Jede Kachel hat ein Vorschaubild und ein Menü ⋯.
- Ein Klick zeigt die Datei: Bild und Video im Vollbild, PDF und Office in der Vorschau
  unter den Kacheln. Ein Klick lädt nie herunter.
- Ein Ordner kann einem eigenen Testtag zugewiesen werden; Testtagzeile und Ordnerkopf
  verweisen dann aufeinander.
- Was zu einem Testtag gehört, liegt verschlüsselt auf der Platte; alles andere liegt in
  der Datenbank (F14). Jede Datei in einem Ordner mit Testtag geht in Anfragen zu 8 MiB
  hoch; ein unterbrochener Upload lässt sich fortsetzen. Verschieben in einen solchen
  Ordner und das Zuweisen eines Testtags lagern Dateien aus der Datenbank um; zurück in
  die Datenbank geht keine.
- Große Videos sind Videos über der Grenze „Anhang", bis zur neuen Grenze „Video am
  {dayOne}", und nur in einem Ordner mit Testtag erlaubt. Das Backup kopiert jede Datei
  auf der Platte in den Backup-Ordner. Der Export trägt jede Datei bis „Anhang" mit
  Inhalt und nennt nur die großen Videos.
- Vier Versionen (Vorgabe 20): 1a Kacheln (0.45.0, groß), 1b Videos unter „Dateien"
  (0.46.0, klein), 2 Ordner (0.47.0, mittel), 3 Testtage und Dateien auf der Platte
  (0.48.0, groß).
- Offene Fragen gibt es nicht. Die Antworten des Betreibers stehen in Abschnitt 0.

---

## 0. Antworten des Betreibers (28. September 2026)

Die Antworten kommen mit Datum ins Änderungsprotokoll unter „Vorgaben des Betreibers".
`Doku/Fahrplan.md:3318-3330` wird in 1a angeglichen, weil Vorgabe 20 die großen Videos
beauftragt. Die Antworten vom 27.09.2026 zu 0.44.0 heißen hier „0.44.0/F3" usw.
(`Doku/Fahrplan.md:3172-3184`). F11 bis F16 kamen nach F1 bis F10; die Spalte „Folge"
nennt, was sie an früheren Antworten ändern.

| Nr. | Frage | Antwort | Folge |
|---|---|---|---|
| F1 | Welche Dateien dürfen größer sein als die Grenze „Anhang"? | c) Nur Videos, mit Prüfung der ersten Bytes | Andere Dateien und ein älteres MOV ohne `ftyp` gehen nur bis zur Grenze „Anhang" hoch (6.2, 6.3). |
| F2 | Eine Grenze oder zwei? | b) Zwei: „Anhang" (1 bis 100 MB, wie heute einstellbar) legt zugleich fest, ab wann ein Video auf die Platte geht; dazu eine zweite Grenze | Geändert durch F11 und F14: Den Speicherort legt der Ordner fest, nicht „Anhang". „Anhang" legt fest, ab wann ein Video ein großes Video ist: Es braucht die Prüfung der ersten Bytes und darf nur in einen Ordner mit Testtag (R2). |
| F3 | Wie viele Dateien trägt ein Eintrag? | a) 100 je Eintrag, 20 je Anfrage | Zwei Konstanten ersetzen `ATTACHMENT_COUNT` (`server.js:3655`); `entry.fileLimitHint` (`de.json:786`) und `manual-de.md:345` bekommen die Zahl als Parameter (Stolperstein 47). |
| F4 | Wer lädt in einen Ordner hoch, und wohin dürfen große Videos? | a) In einen Ordner nur, wer ihn angelegt hat; verbinden nur mit einem eigenen Testtag; ohne Ordner lädt jeder Account hoch, auch große Videos | In den Ordner eines Testtags lädt nur dessen Verfasser, auch kein Admin; für Dateien ohne Ordner weicht das von Vorgabe 6 ab (4, 11). Geändert durch F12: Ohne Ordner geht jede Datei nur bis „Anhang". |
| F5 | Wo öffnet die Vorschau lesbarer Dateien? | a) Unter allen Kacheln ihres Ordners bzw. der Dateien ohne Ordner, höchstens eine im Block; am Telefon in der eigenen Ansicht | Höchstens eine Vorschau ist offen, heute mehrere (`app.js:6073`); die eigene Ansicht am Telefon gilt für alle lesbaren Dateien, heute nur für Office (`app.js:6152`). |
| F6 | Gelten die Video-Regeln des gemeinsamen Vollbilds (`openLightbox`, `app.js:4319`) auch für die Bildleiste? | a) Ja, für alle Videos | Hat ein Video den Fokus, spulen ← und → auch im Kurzvideo, wo sie heute blättern (`app.js:4452-4462`); Abweichung von Vorgabe 18. |
| F7 | Was öffnet die Adresse einer Bild- oder Videodatei (`#/item/x/file/y`), auch als Link und als Marke in Kommentar und Beschreibung? | a) Das Vollbild im Eintrag, wie ein Klick auf die Kachel; danach steht ihr Ordner offen | Ein Video braucht keinen zweiten Abspieler; Abweichung von 0.44.0/F3 (3.3). |
| F8 | Was geschieht mit Dateien unter `data/files/`, die die Datenbank nicht kennt? | Melden; der Knopf „Löschen" für den Eigentümer-Admin wirkt nur auf Dateien, deren Kopie gleicher Länge im Backup-Ordner liegt (Antwort nach der Gegenüberstellung der Folgen, 28.09.2026) | Kein Video geht durch den Knopf verloren; ohne Backup-Ordner löscht er nichts (R6, 7.5). |
| F9 | Vorschaubild und Dauer eines Videos auch in Papierkorb, Export und Import? | a) In allen dreien | Das Vorschaubild übersteht Wiederherstellen und Umzug; beim Import für jedes Video mit Inhalt, weil große Videos dort nicht ankommen (Vorgabe 8). |
| F10 | Wie heißt die zweite Grenze? (neu) | „Video unter „Dateien"" nach dem Muster von „Video im Kommentar" (`de.json:293`), Schlüssel `card.limitFileVideo`, 1 bis 4096 MB, Vorgabe 2048 MB | Ersetzt durch F13. |
| F11 | Wo liegen Videos in einem Ordner mit Testtag? | Immer auf der Platte, auch kurze. Verschieben in einen solchen Ordner und das Zuweisen eines Testtags an einen Ordner lagern Dateien aus der Datenbank auf die Platte um. Zurück in die Datenbank wird nie umgelagert. | Den Speicherort legt der Ordner fest, nicht die Größe (R2, R18); Umlagerung in 6.5. |
| F12 | Wohin dürfen große Videos? | Nur in einen Ordner mit Testtag. Ohne einen solchen Ordner geht jede Datei wie heute bis „Anhang". | Ein großes Video lädt nur der Verfasser eines Testtags hoch (4); ändert F4 für Dateien ohne Ordner. |
| F13 | Wie heißt die zweite Grenze? | „Video am {dayOne}", Schlüssel `card.limitDayVideo`, 1 bis 4096 MB, Vorgabe 2048 MB | Ersetzt F10. Liegt sie nicht über „Anhang", nimmt Kriterion keine großen Videos an (R2). |
| F14 | Welche Dateien eines Ordners mit Testtag liegen auf der Platte? | Alle, nicht nur Videos: „Was zu einem Testtag gehört, liegt verschlüsselt auf der Platte. Alles andere liegt in der Datenbank." Andere Dateien dort bis „Anhang", Videos bis „Video am {dayOne}". | Jeder Upload in einen solchen Ordner geht in Stücken (6.2); Vorschau, Document Server und Export entschlüsseln Dateien bis „Anhang" ganz (R3, 6.6, 6.8). |
| F15 | Bekommt jeder Ordner ein eigenes Verzeichnis? | Nein. Alles liegt flach unter `data/files/`; zusammen gehören die Dateien über den Ordner in der Datenbank, das Backup und die Löschliste. | 5.2 bleibt; verworfen in 8. |
| F16 | Was trägt der JSON-Export von Dateien auf der Platte? | Jede Datei bis zur Grenze „Anhang" mit Inhalt, gleich wo sie liegt; Dateien auf der Platte werden dafür ganz entschlüsselt. Nur Dateien darüber, die großen Videos, nennt er mit Namen. Der Import legt Dateien eines Ordners mit Testtag auf die Platte, sonst in die Datenbank. | `entryTooLarge`, `PART_SIZES` und `exportSum` zählen Dateien auf der Platte mit, große Videos nicht (7.3); maßgeblich ist `disk_files.large`. |

## 1. Worum es geht

Zu manchen Einträgen gibt es Videos von Testtagen, 0,5 bis 2 GB je Testtag, heute 3
Testtage, absehbar 3 je Jahr. Heute ist eine Datei höchstens 100 MB groß, weil sie ganz
im Arbeitsspeicher liegt und als ein Blob in SQLite geht (`server.js:386-395`). Ein Video
unter „Dateien" lässt sich nur herunterladen. Der Block ist eine Liste mit elf Spalten
ohne Gruppen, und ein Klick auf eine Datei ohne Vorschau lädt sie herunter.

## 2. Begriffe und Regeln

### 2.1 Begriffe

| Begriff | Bedeutung | im Code |
|---|---|---|
| Datei | alles im Block „Dateien", gleich wie groß | `attachments` |
| Ohne Ordner | Dateien, die in keinem Ordner liegen | keine Zeile in `attachment_folders` |
| Ordner | Gruppe von Dateien eines Eintrags, höchstens ein `{dayOne}` | `folders`, `attachment_folders` |
| Ordner mit Testtag | Ordner, dem ein Testtag zugewiesen ist | `folders.test_day_id` nicht NULL |
| Kachel | Bedienelement einer Datei im Kachelraster | – |
| Vorschaubild | Bild auf der Kachel; beim Video auch das Poster im Vollbild | `attachment_thumbs`; beim Video dazu `attachment_stills` |
| Vorschau | Feld unter einem Kachelraster für PDF, Text und Office | – |
| Upload | jede Übertragung einer Datei zum Server | – |
| Datei auf der Platte | Datei, die in einem Ordner mit Testtag liegt oder lag; verschlüsselt unter `data/files/` | `disk_files`, `data/files/` |
| großes Video | Video, das beim Beginn seines Uploads über der Grenze „Anhang" lag; gibt es nur auf der Platte | `disk_files.large` = 1 |
| *Gruppe* | die Dateien ohne Ordner oder ein Ordner, also ein Kachelraster | – |
| *Standbild* | Bild aus einem Video, 1600 px, im Browser erstellt | `attachment_stills`, `stillFrame()` |
| *Upload in Stücken* | jeder Upload in einen Ordner mit Testtag: Beginn, dann Anfragen bis 8 MiB | `POST /api/items/:id/uploads`, `PUT /api/uploads/:id` |
| *offener Upload* | Upload in Stücken, noch nicht ganz angekommen | `uploads`, `data/files/upload/` |
| *Umlagerung* | eine Datei geht aus der Datenbank auf die Platte (6.5) | – |
| *Stück* | 1 MiB Klartext, einzeln verschlüsselt; eine Anfrage trägt bis zu 8 | `disk_files.chunk` |
| *Löschliste* | Namen, deren Datei nach dem Commit von der Platte gelöscht wird | `disk_files_gone` |

Kursive Begriffe stehen nur im Konzept und im Code; die übrigen kommen aus `de.json`. Im
Export und seinen Hinweisen heißt es „große Videos", in „Kennzahlen" „Dateien auf der
Platte". `card.limitAttachment` bleibt „Anhang"; die zweite Grenze heißt „Video am
{dayOne}" (`card.limitDayVideo`). Der Exporthinweis (`de.json:196`, `:201-202`) nennt die
großen Videos als nicht enthalten.

### 2.2 Regeln

| Nr. | Regel | Grund |
|---|---|---|
| R1 | Eine Datei ist eine Zeile in `attachments`, gleich wie groß. | Adresse, Kommentarverweis, Rechte, Zählung, Kachel und Ordner hängen an `attachments.id`; eine eigene Tabelle verdoppelte jede Stelle. |
| R2 | Der Speicherort folgt dem Ordner (F11, F14): Eine Datei in einem Ordner mit Testtag liegt verschlüsselt auf der Platte und geht in Stücken hoch; jede andere liegt in der Datenbank und geht in einer Anfrage. In der Datenbank gilt für jede Datei die Grenze „Anhang"; auf der Platte gilt sie für jede Datei außer Videos, ein Video geht bis „Video am {dayOne}" (F12, F13). Über „Anhang" nimmt Kriterion nur Videos an und nur in einen Ordner mit Testtag; jede andere Datei über „Anhang" wird wie heute abgewiesen. Es gelten die Werte beim Beginn des Uploads (`limitBytes`). Liegt „Video am {dayOne}" nicht über „Anhang", nimmt Kriterion keine großen Videos an. Einmal auf der Platte, bleibt eine Datei dort (R18). | Was zu einem Testtag gehört, liegt an einem Ort. Das Backup kopiert eine Datei auf der Platte einmal, die Datenbank dagegen bei jedem Backup ganz. Ohne Testtag bleibt alles wie heute. |
| R3 | Eine Datei auf der Platte wird nie überschrieben; eine neue Fassung ist eine neue Datei mit neuem Namen und Schlüssel (6.6). Ein großes Video liest der Server nur stückweise. Jede andere Datei auf der Platte darf er ganz entschlüsseln: für die Vorschau von Text und `.docx`, das Vorschaubild eines Bildes, den Document Server und den Export (6.8). | Unter einem Schlüssel wird kein Stück zweimal verschlüsselt (6.3). Bis „Anhang" hält der Server eine Datei schon heute ganz im Arbeitsspeicher; ein Video spielt der Browser aus Ranges. |
| R4 | Den Speicherort sagt nur `disk_files`, nie `length(data)`. | Eine leere Datei hat ebenfalls `x''` (Stolperstein 109). |
| R5 | Eine Datei auf der Platte hat immer einen Besitzer: eine Datei (`attachment_id`), die Datei, deren vorige Fassung sie ist (`previous_of`), oder einen Eintrag im Papierkorb (`trash_id`). Verliert sie ihn, schreibt ein Trigger in derselben Transaktion ihren Namen in die Löschliste. | So erfasst jeder Löschweg sie, auch Kaskaden und `usertool.js`. |
| R6 | In `data/files/` wird nur gelöscht, was die Löschliste nennt, und erst nach dem Commit. Ausnahme: Der Eigentümer-Admin löscht in „Kennzahlen" Dateien ohne Verweis, deren Kopie gleicher Länge unter `kriterion-files/` liegt (7.5). Sonst bleibt eine unbekannte Datei dort liegen und wird gemeldet. | `unlink` lässt sich nicht zurückrollen; nach dem Zurückspielen eines Backups gehört sie zum neueren Stand. |
| R7 | Unter `data/files/upload/` wird gelöscht, was weder `uploads` noch `disk_files` kennt und was der Server nicht gerade schreibt. | Ein offener Upload ist kein Bestand; die Quelle liegt beim Benutzer. Umlagerung, Rückschrieb und Import tragen ihre Datei erst mit dem Commit ein; bis dahin steht der Name in einer Menge im Speicher. |
| R8 | Ein Backup ist die Datenbank und jede Datei auf der Platte, die sie nennt. Während der Kopie löscht kein Prozess in `data/files/` oder am Ablageort. In `kriterion-files/` wird gelöscht, was keine Liste eines vorhandenen Backups nennt. | Sonst wäre der Backup-Knopf nicht mehr vollständig. |
| R9 | Ein Ordner ordnet und besitzt nichts. Was gelöscht wird, löst seine Verbindungen, mehr nicht; die Dateien bleiben, wo sie liegen (R18). | Ordner löschen macht Dateien lose, Testtag löschen lässt den Ordner stehen. |
| R10 | Ordner und Testtag stehen höchstens 1:1, am selben Eintrag und beim selben Account. Die Verbindung legt den Speicherort fest (R2); keine Note, kein Filter und keine Statistik liest sie. | Sie dient der Navigation und dem Speicherort; ein Ordner bewertet nichts. „Bericht an einen Testtag binden" bleibt abgelehnt, weil ein Bericht mehrere Testtage zusammenfasst (`Doku/Fehler_und_Ideen.md:932-935`). |
| R11 | Ändern darf nur, wer etwas angelegt hat; löschen darf er und der Admin. Etwas in einen Ordner legen oder einen Ordner mit einem Testtag verbinden verlangt beide Seiten als eigene. Ohne Ordner hochladen darf jeder Account, bis „Anhang" (F12). | Dasselbe Paar wie heute: `selfOnly` für Ändern, `mayChange` für Löschen (`server.js:3935-3950`, `manual-de.md:232`). |
| R12 | Ein Klick auf eine Datei zeigt sie, nie Download. Eine Datei ohne Vorschau und eine Kachel in Übertragung mit ⋯ öffnen ihr Menü; ein eigener unterbrochener Upload setzt fort. Ein fremder Upload ohne ⋯ ist kein Knopf; sein Zustand steht in der Unterschrift. | Bei 2 GB wäre ein Klick ein ungefragter Download. |
| R13 | Jede Handlung an einer Datei oder einem Ordner steht im Menü ⋯, und es zeigt nur, was der Server annimmt. Das Vollbild wiederholt Link, Herunterladen und Löschen, der Kopf der Vorschau Öffnen und Herunterladen. Hochgeladen wird mit „+" und durch Ablegen. | Kein Knopf, den der Server abweist (`Doku/Projektstand_Kriterion_0_33_0.md:6189-6192`). |
| R14 | Ein Sprung gilt nur für diese Ansicht. Gespeichert wird nur eine Handlung im Blockkopf: der Kopf selbst und der Knopf zum Kommentarfeld darin (`cjump`, `app.js:6479-6484`). | Wer im Kopf klickt, will den Block offen haben; wer springt, will etwas ansehen. |
| R15 | Höchstens 100 Dateien je Eintrag; ein offener Upload belegt einen Platz. | So überschreitet kein Wettlauf zwischen den Anfragen eines Uploads die Grenze. |
| R16 | Eine Datei, ein Platz: Bildleiste oder „Dateien". | Eine dritte `kind` in `photos` zählte an acht Stellen als Foto (Stolperstein 291). |
| R17 | Tasten gehören dem, was den Fokus hat; im gemeinsamen Vollbild gilt das für jedes Video (3.3). | Gilt heute für Eingabefelder (`keyNav`, `app.js:5192-5195`). |
| R18 | Eine Datei auf der Platte geht nie zurück in die Datenbank: nicht beim Verschieben aus dem Ordner, nicht beim Lösen der Zuweisung, nicht beim Löschen von Testtag oder Ordner (F11). | Ein großes Video passt nicht in die Datenbank. Ein Weg zurück nur für kleine Dateien wäre eine zweite Umlagerung mit eigenem Absturzfall. |

## 3. Was der Benutzer sieht

### 3.1 Block, Kachel, Ordnerkopf

```
 ⣿ ▾ Dateien  6                                        [ Ordner hinzufügen ]
   ┌───────⋯┐ ┌───────⋯┐ ┌───────⋯┐ ┌ ─ ─ ─ ─┐
   │ (Bild) │ │  PDF   │ │  DOCX  │ │   +    │
   └────────┘ └────────┘ └────────┘ └ ─ ─ ─ ─┘
   Aufbau.jpg  Daten…t.pdf Protokoll  bis 50 MB
   2,1 MB      340 KB     88 KB·ben
   ┌ Datenblatt.pdf · 340 KB                        ⤢   ↓   × ┐
   └───────────────────────────────────────────────────────────┘
 ▾ 📁 Nordhang  ↑ 12.09.2026         3 Dateien · 1,7 GB · anna   ⋯
   │▶      ⋯│ │▶      ⋯│ │  CSV  ⋯│ │   +    │
   │ 1:02:13│ │  48:05 │ │        │ │        │
   └────────┘ └────────┘ └────────┘ └ ─ ─ ─ ─┘
   Nordh….mov  Süd.mov     Wetter.csv bis 50 MB
   1,2 GB      0,5 GB      12 KB      Video 2 GB
 ▸ 📁 Messdaten Sommer               leer · anna                  ⋯
```

Oben die Dateien ohne Ordner, darunter die Ordner (Vorgabe 9); beim Öffnen eines Eintrags
sind alle Ordner zu (Vorgabe 14). „+" steht am Ende jeder Gruppe, in die man hochladen
darf (Vorgabe 11, R11), und nennt die Grenze „Anhang", im Ordner mit Testtag dazu „Video
am {dayOne}"; bei voller Zahl zeigt es „100 von 100". Leer: „Noch keine Dateien." und,
mit Maus, „Hierher ziehen oder mit + hochladen."

| Teil der Kachel | Inhalt |
|---|---|
| Bildfläche, quadratisch | Bild: Vorschaubild. Video: Vorschaubild, oben links ▶, unten rechts die Dauer (wie in der Bildleiste). Sonst die Endung groß („PDF", „ZIP"). |
| ⋯ | oben rechts auf der Bildfläche, immer sichtbar (Vorgabe 16), am Telefon 44 × 44 px |
| Zustandsecke unten rechts | leer oder genau eins: Ring mit Prozent, „wartet", ⏸ unterbrochen, ⚠ fehlgeschlagen oder fehlt auf dem Server; verdrängt die Dauer |
| Unterschrift | Name über die volle Breite, höchstens zwei Zeilen, in der Mitte gekürzt, damit die Endung bleibt; darunter „1,2 GB · anna" (Verfasser ab zwei Accounts), beim Upload „34 % · noch etwa 4 min" |
| Rahmen | Akzentfarbe, solange Vorschau oder Vollbild dieser Datei offen ist |

Bildfläche und Name bilden einen Knopf („Nordhang.mov, Video, 1,2 GB, 1:02:13"), ⋯
einen zweiten; den Speicherort zeigt die Kachel nicht. 128 px am Rechner, 96 px am
Telefon (drei Spalten bei 344 px). Wie bei Homarr stehen Zustand unten rechts und Menü
rechts im Ordnerkopf; der Name steht unter dem Bild, damit die Bilder bündig bleiben.

**Ordnerkopf:** ▸/▾, 📁, Name, beim Ordner eines Testtags der Link „↑ 12.09.2026" (für
Screenreader „{dayOne} 12.09.2026 anzeigen"), „3 Dateien · 1,7 GB · anna" (Verfasser ab
zwei Accounts) oder „leer", dann ⋯. Jeder Ordner hat einen Namen, den sein Verfasser
vergibt; der Link zum Testtag steht daneben und nicht im Namen. So bleibt ein Ordner
unterscheidbar, wenn sein Testtag gelöscht wird, und keine Anzeige hängt davon ab, ob er
einen Testtag hat. Zugeklappt zeigen Ordnerkopf und Blockkopf die
Zustandsecke zusammengefasst (⚠ vor ⏸ vor Ring, mit Text für Screenreader); aufgeklappt
wird nichts.

### 3.2 Das Menü

Ein Bauteil für Kachel und Ordner: am Rechner an ⋯, am Telefon als Liste am unteren
Rand. Sein Kopf nennt Name und „Hochgeladen von … am …" (ab zwei Accounts) und ersetzt
den Tooltip, den es am Telefon nicht gibt. Was der Server abweisen würde, fehlt (R13).

| heute | künftig | sichtbar, wenn |
|---|---|---|
| Symbol, Name, Größe, Verfasser, Klick | Bildfläche, Unterschrift, Menükopf, Klick | immer |
| Zustandszeichen ▸ ▾ ↓ | Rahmen der offenen Kachel | – |
| Zeichen der zwei Personen | „Bearbeiten durch alle" mit Haken | Office, eigene Datei, `edit` |
| Stift | „Bearbeiten" | Office, `edit`, nicht am Telefon |
| ⤢ | „Öffnen" (eigene Ansicht) | Datei mit Vorschau: PDF, Text, `.docx`, Office |
| Kette, ↓ | „Link auf diese Datei kopieren", „Herunterladen" | immer |
| ✕ | „Datei löschen", mit Rückfrage | eigene Datei oder Admin |
| ↶ nur in der eigenen Ansicht | auch „Vorige Fassung wiederherstellen" | `restore` |
| neu | „Verschieben nach …" | eigene Datei, mindestens ein Ziel |
| neu | „Dieses Bild als Vorschaubild" (öffnet das Vollbild) | Video, eigene Datei |

Kachel in Übertragung: „Abbrechen" nimmt eine wartende Datei heraus, bricht beim Upload
in einer Anfrage die Anfrage ab und löscht beim Upload in Stücken den offenen Upload, mit
Rückfrage, wenn schon Bytes auf dem Server liegen. Eigener unterbrochener Upload:
„Fortsetzen", „Abbrechen". Nach einem Fehler: „Erneut versuchen", „Entfernen". Fremder
offener Upload: „Abbrechen" nur für den Admin, sonst kein ⋯. Ordner: „Bearbeiten …",
„Link kopieren", „Ordner löschen".

### 3.3 Klick, Vorschau, Vollbild

| Datei | Rechner | Telefon |
|---|---|---|
| Bild, Video | Vollbild; ← → blättern durch Bilder und Videos der Gruppe | Vollbild |
| PDF, Text, `.docx`, Office | Vorschau unter der Gruppe | eigene Ansicht |
| ohne Vorschau (ZIP, Audio), Kachel in Übertragung mit ⋯ | Menü ⋯ | Menü am unteren Rand |
| fremder Upload ohne ⋯ | nichts; Zustand in der Unterschrift | ebenso |
| eigener unterbrochener Upload | Fortsetzen (3.4) | Fortsetzen |

**Adresse einer Datei:** `#/item/x/file/y` öffnet bei Bild und Video den Eintrag und
darin das Vollbild, wie bei Fotos (`showPhoto`, `app.js:5071-5078`); danach steht der
Ordner offen. Die Marke in Kommentar und Beschreibung folgt der Adresse. Andere Dateien
öffnen die eigene Ansicht. Ein Kommentarverweis auf ein Video zeigt das Vorschaubild
mit ▶.

**Vorschau:** unter dem Kachelraster ihrer Gruppe, volle Breite, Kopf mit Name · Größe ·
⤢ · ↓ · ×; höchstens eine im Block. Klick auf eine andere Kachel wechselt den Inhalt. Sie
schließt mit ×, Esc, Klick auf dieselbe Kachel, beim Zuklappen des Ordners und wenn die
Datei verschoben oder gelöscht wird. Sie wird im DOM nie verschoben, weil ein `iframe`
dabei neu lädt.

**Vollbild:** Fotos, Kurzvideos und Dateien teilen es (`openLightbox`, `app.js:4319`).
Die Regeln für Videos gelten für jedes Video darin, auch für die Kurzvideos der
Bildleiste. Ein Video lädt mit `preload="metadata"` und `playsinline`. Hat es den Fokus,
springen ← und → darin 5 s (beim Bau von 0.46.0 entschieden), sonst blättern sie. Spielt der Browser es nicht (`error`, oder
`videoWidth` 0 bei HEVC in Chrome), steht dort „Dieses Video kann der Browser nicht
abspielen."; bei einer Datei dazu „Herunterladen". Bei einer Datei ist das Poster das
Standbild. Ihre Leiste: „Link kopieren", „Herunterladen", mit Recht „Dieses Bild als
Vorschaubild" und „Löschen".

**Video ohne Vorschaubild** (die vorhandenen bis 100 MB, HEVC in Firefox, Tab vor dem
Senden des Standbilds geschlossen): Kachel und Streifen zeigen Endung und ▶, das Vollbild
kein Poster. Sieht der Verfasser die Kachel, erzeugt sein Browser das Standbild aus
`/raw` nach (6.7), einmal je Sitzung und Datei.

**Neuzeichnen:** `drawAtts()` aktualisiert Kacheln nach Nummer und lässt die Vorschau
stehen (heute zerstört es alle Office-Betrachter). Offene Ordner hält eine Modulvariable
`{ itemId, open }` neben `fileReturn`, damit sie die Rückkehr aus der eigenen Ansicht
überstehen.

### 3.4 Hochladen

1. „+" oder Dateien auf eine Gruppe oder einen Ordnerkopf ziehen. Der ganze Block fängt
   das Ablegen ab; heute tut das nur die Bildleiste, und eine anderswo abgelegte Datei
   öffnet der Browser im Tab. Wo man nicht hochladen darf, nennt ein Toast den Grund.
2. Der Browser prüft vorher Anzahl (R15) und Größe: bis zur Grenze „Anhang" jede Datei,
   darüber nur ein Video mit Endung aus `VIDEO_TYPES` bis zur Grenze „Video am {dayOne}"
   und nur in einen Ordner mit Testtag. Scheitert eines, nennt er wie heute Datei und
   Grenze, bei einem großen Video außerhalb eines solchen Ordners „Große Videos nur in
   einem Ordner mit {dayOne}.", und nichts geht hoch. Den Weg wählt er nach dem Ziel,
   nicht nach der Größe: in einen Ordner mit Testtag in Stücken, sonst in einer Anfrage
   (6.7). Die Videoendungen liefert der Server mit den Grenzen (`app.js:2736`). Hat
   inzwischen der Admin eine Grenze oder der Verfasser die Zuweisung des Ordners
   geändert, weist der Server ab und nennt den neuen Stand; der Browser übernimmt ihn
   und wählt den Weg einmal neu.
3. Jede Datei erscheint sofort als Kachel mit „wartet". Übertragen wird die kleinste
   zuerst, in dieser Reihenfolge stehen auch die Kacheln. Ein Video zeigt sein
   Vorschaubild, sobald der Browser es bei 10 % erstellt hat (Vorgabe 4).
4. Am Ende der Toast „3 Dateien angehängt"; eine fehlgeschlagene Datei zeigt ⚠ und den
   Grund. Beim Schließen des Tabs fragt der Browser, solange noch etwas wartet.

| Lage | in einer Anfrage | in Stücken (Ordner mit Testtag) |
|---|---|---|
| Übertragung | eine Anfrage | Beginn, dann Anfragen zu 8 MiB |
| zu wenig Platz | ⚠ mit der Meldung des Servers | vor dem ersten Byte ⚠: „Frei: 2,0 GB, davon 0,5 GB für laufende Uploads vorgemerkt. Nötig: 1,6 GB und 1,4 GB Reserve für die Datenbank." |
| volle Zahl, weil ein anderer Upload zuvorkam | ⚠ „Höchstens 100 Dateien je {entryOne}." (`server.fileCap`) | ebenso, vor dem ersten Byte |
| 3 offene Uploads des Accounts | – | vor dem ersten Byte ⚠: „Schon 3 Uploads offen: Aufbau A, Nordhang. Einen davon fortsetzen oder abbrechen." |
| Verbindung weg | Wiederholung nach 2, 5 und 15 s, dann ⚠ mit „Erneut versuchen" | ebenso, dann ⏸ „unterbrochen · 380 MB von 1,6 GB · verfällt 29.09. 14:05"; Klick setzt fort |
| Tab wieder sichtbar, Netz wieder da | Warteschlange läuft weiter | jeder eigene ⏸-Upload, dessen Datei der Tab noch hält, setzt fort |
| anderer Eintrag geöffnet | Upload läuft weiter | ebenso; Kopfleiste „↑ 23 %", Klick führt zurück |
| Tab geschlossen | die Datei ist weg; andere sahen sie nie | ⏸ bleibt. Klick öffnet die Dateiauswahl; dieselbe Datei (Name, Größe, Änderungszeit) setzt fort (6.2), eine andere ergibt „Das ist nicht dieselbe Datei wie beim ersten Versuch." |
| Admin bricht ab | – | ⚠ „Upload wurde abgebrochen", keine Wiederholung |
| 24 h ohne angenommene Anfrage | – | Upload und Kachel verschwinden |

**Uploads außerhalb dieses Tabs:** Ein fremder zeigt „Upload · anna · läuft, zuletzt
14:05" oder „unterbrochen seit 14:05", ohne Prozentzahl, weil die Ansicht nicht
nachfragt. Die Uhrzeit ist die letzte angenommene Anfrage (`touched_at`); sie zeigt, wie
alt die Angabe ist. Ein eigener, der in einem anderen Fenster läuft, zeigt das und bietet
kein „Fortsetzen". Ein Tab, der ohne eigene abgebrochene Anfrage davor auf 409 trifft,
hat einen zweiten Sender und hört auf (6.3).

**Am Telefon** stoppt der Browser Anfragen bei gesperrtem Bildschirm; während eines
Uploads in Stücken steht deshalb „Seite offen und Bildschirm an lassen." (mit
HTTPS hält `navigator.wakeLock` ihn an). Eine aus „Fotos" neu gewählte Datei hat auf iOS
vermutlich eine neue Änderungszeit und gilt dann als andere Datei; der Upload beginnt
nach „Abbrechen" neu. A.4 prüft das.

### 3.5 Ordner

| Handlung | Ablauf |
|---|---|
| anlegen | „Ordner hinzufügen" → Dialog mit „Name" (Pflicht, 1 bis 80 Zeichen, gleiche Namen erlaubt) und „{dayOne}": „ohne {dayOne}" oder ein eigener Testtag dieses Eintrags ohne Ordner, neueste zuerst, „12.09.2026 · ★★★★". Das Feld fehlt, wenn es keinen gibt. Ist „Name" noch leer, trägt die Wahl eines Testtags „{dayOne} 12.09.2026" als Vorschlag ein; gespeichert wird, was im Feld steht. Der neue Ordner steht offen. |
| bearbeiten | ⋯ → „Bearbeiten …": derselbe Dialog. Die Wahl eines Testtags lagert die Dateien des Ordners aus der Datenbank um (6.5); bis zur Antwort bleibt der Dialog offen. „ohne {dayOne}" löst die Zuweisung (Vorgabe 13); die Dateien bleiben auf der Platte (R18). |
| verschieben | ⋯ an der Kachel → „Verschieben nach …" → „Ohne Ordner" und die eigenen Ordner. Nummer, Adresse, Kommentarverweise, Vorschaubild, „Bearbeiten durch alle" und eine Sitzung am Document Server bleiben. In einen Ordner mit Testtag lagert es eine Datei aus der Datenbank um (6.5); bis zur Antwort zeigt die Kachel „wartet". Aus einem solchen Ordner heraus bleibt sie auf der Platte (R18). |
| löschen | Rückfrage „Die 3 Dateien darin bleiben erhalten und stehen danach bei den Dateien ohne Ordner."; ein leerer Ordner ohne Rückfrage (Vorgabe 17) |
| Testtag löschen | Die Rückfrage bekommt „Der Ordner „Nordhang" bleibt mit seinen Dateien erhalten." |

Reihenfolge: nach Datum des Testtags, sonst Tag des Anlegens, neueste oben, wie die
Testtage. Eine Höchstzahl für Ordner gibt es nicht, wie bei Links und Kommentaren.

### 3.6 Testtagzeile und Sprung

```
 Rechner:  12.09.2026  Sa  📁  [Tag] [Tag] +                 ★★★★☆  ×
 Telefon:  12.09.2026  📁  [Tag] +
           ★★★★☆                                              ×
```

- Das Ordnersymbol steht nur an einem Testtag mit Ordner (Vorgabe 13), hinter dem
  Wochentag; 44 px, „Ordner öffnen, 3 Dateien". Am Telefon bricht die Zeile um wie eine
  mit Tags (`style.css:2362-2367`); sonst bräuchte sie 363 von 344 px.
- **Sprung:** Der Block „Dateien" klappt für diese Ansicht auf; ein Set wie `GLANCE`
  (`app.js:990-1000`) hält das fest. Ein Klick auf den Kopf eines so geöffneten Blocks
  nimmt ihn aus dem Set und klappt ihn zu, ohne die Einstellung zu ändern (heute hängte
  `app.js:1008` ihn doppelt an `BLOCKS.closed`). Der Ordner klappt auf, rückt in die
  Mitte, leuchtet 2,6 s und hat den Fokus; die Adresse wird `#/item/12/folder/5`.
- **Zurück:** „↑ 12.09.2026" öffnet den Block „Testtage" für diese Ansicht, hebt die
  Zeile hervor und setzt den Fokus auf das Symbol.
- `commentJump` (`app.js:2126-2144`) wird zu `jumpTo(element)` für Kommentar, Ordner und
  Testtagzeile. Eine Änderung an Testtag oder Ordner zeichnet beide Blöcke neu.

### 3.7 Telefon, Tastatur, Screenreader

- ⋯, „+", Ordnerkopf und Testtagsymbol haben mindestens 44 × 44 px. Im Block „Dateien"
  erscheint nichts erst beim Überfahren.
- Der Ordnerkopf ist gebaut wie der Blockkopf (`app.js:1002-1004`): ein Knopf aus ▸/▾,
  Symbol, Name und Zählung mit `aria-expanded`; Link und ⋯ stehen daneben.
- Kachelraster sind Listen, die Vorschau eine `region`, das Menü ein `menu` mit ↑ ↓,
  Enter, Esc und Umschalt+F10. `aria-live="polite"` meldet Beginn, je 25 %, Ende und
  Fehler eines Uploads.

### 3.8 Bildleiste

Sie bleibt, wie sie ist (Vorgabe 18; zum Vollbild 3.3). Ein zu großes Video lehnt sie ab
wie heute, neu mit einem Hinweis ohne Knopf: ab 1b „Längere Videos gehören unter
„Dateien".", ab 3 „Längere Videos gehören unter „Dateien" in einen Ordner mit
{dayOne}." Ein Video unter „Dateien" erscheint nie in der Bildleiste (R16).

## 4. Rechte

Grundlage ist das Paar, das heute für Testtage und Kommentare gilt: `selfOnly` für
Ändern, `mayChange` für Löschen (`server.js:959-965`); „Ein Admin löscht fremde
Beiträge, ändert sie aber nicht" (`manual-de.md:232`).

| Handlung | Wer | Prüfung im Server |
|---|---|---|
| sehen, abspielen, herunterladen | jeder angemeldete Account | wie heute |
| ohne Ordner hochladen, bis „Anhang" | jeder angemeldete Account | im Rumpf: ohne `folderId` frei |
| in einen Ordner hochladen | wer den Ordner angelegt hat | `selfOnly(folder)`, `folders.item_id = :id` |
| Datei verschieben | wem Datei und Zielordner gehören; in einen Ordner mit Testtag mit Umlagerung (6.5) | `selfOnly` an beiden, gleicher Eintrag |
| Datei löschen | wer sie hochgeladen hat, Admin | `mayChange`, wie heute |
| Vorschaubild setzen | wer die Datei hochgeladen hat | `selfOnly` |
| Bearbeiten, „Bearbeiten durch alle", vorige Fassung | wie heute, auch auf der Platte (6.6) | `mayEditFile`, `selfOnly` |
| Upload fortsetzen / abbrechen | wer ihn begonnen hat / dazu der Admin | eigener, fremd 404 / `mayChange` |
| Ordner anlegen | jeder angemeldete Account | offen |
| Ordner umbenennen, zuweisen, lösen | wer ihn angelegt hat; nur eigener Testtag am selben Eintrag; Zuweisen mit Umlagerung (6.5) | `selfOnly` an beiden, `test_days.item_id = folders.item_id`; belegter Testtag 409 |
| Ordner löschen | wer ihn angelegt hat, Admin | `mayChange` |
| Dateien ohne Verweis löschen (7.5) | Eigentümer-Admin | `ownerOnly`, Admin 403 |

Ordner anlegen ist offen nach der Regel „was nur dort erscheint, wo man es hinsetzt,
gehört jedem" (`Doku/Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_1.md:100-104`). Vorgabe 6
entstand, als Videos am Testtag hängen sollten; den Testtag bearbeiten darf nur sein
Verfasser (`server.js:3935-3943`), anlegen darf ihn jeder Account (`server.js:3913`).
Sie gilt wörtlich für den Ordner eines Testtags, nicht für Dateien ohne Ordner. Weil
große Videos nur in den Ordner eines Testtags gehen (F12), lädt sie nur dessen Verfasser
hoch.

Den Speicher schützen die Grenzen je Datei, 3 offene Uploads je Account, die Zahl je
Eintrag und die Prüfung des freien Platzes (6.2, 6.5). Die Obergrenze 4096 MB von „Video
am {dayOne}" ist das Doppelte der Vorgabe 2048 MB aus Vorgabe 3. Drei offene Uploads
reichen, weil der Browser eine Datei nach der anderen überträgt: Zwei unterbrochene
bleiben fortsetzbar, während die nächste läuft; bei einem sperrte jeder unterbrochene
Upload den nächsten.

## 5. Datenmodell und Platte

### 5.1 Neue Tabellen und Trigger

Nur neue Tabellen (Vorgabe 19); jede entsteht beim nächsten Start durch
`db.exec(SCHEMA)`. Neue Angaben kommen per `LEFT JOIN` wie heute `attachment_editing`.

| Tabelle (Version) | Spalten | Beziehungen |
|---|---|---|
| `attachment_stills` (1b) | `attachment_id` PK, `duration` REAL (s; NULL unbekannt), `still` BLOB (1600 px WebP) | `attachments` CASCADE |
| `folders` (2) | `id`, `item_id`, `name` (1 bis 80 Zeichen), `user_id`, `created_at`, `test_day_id` UNIQUE (in 2 immer NULL) | `items` CASCADE; `users`, `test_days` SET NULL; Index auf `item_id` |
| `attachment_folders` (2) | `attachment_id` PK, `folder_id` | beide CASCADE; keine Zeile heißt ohne Ordner; Index auf `folder_id` |
| `uploads` (3) | `id` TEXT PK, `item_id`, `user_id`, `folder_id`, `filename`, `size`, `modified` (`File.lastModified`, ms), `large` (1: über „Anhang" beim Beginn), `name` UNIQUE, `received`, `touched_at`, `created_at`, `file_key` | `items`, `users` CASCADE; `folders` SET NULL; Index auf `item_id` |
| `disk_files` (3) | `id`, `name` UNIQUE (32 Hexzeichen), `size` (Klartext), `chunk`, `large`, `attachment_id` UNIQUE, `previous_of`, `trash_id`, `created_at`, `file_key` | `attachments` (zwei Spalten), `trash` je SET NULL; Index auf `previous_of` und `trash_id` |
| `disk_files_gone` (3) | `name` PK | nur der Trigger schreibt |

```sql
CREATE TRIGGER disk_files_orphaned AFTER UPDATE OF attachment_id, trash_id, previous_of ON disk_files
  WHEN new.attachment_id IS NULL AND new.trash_id IS NULL AND new.previous_of IS NULL
BEGIN
  INSERT OR IGNORE INTO disk_files_gone (name) VALUES (new.name);
  DELETE FROM disk_files WHERE id = new.id;
END;
CREATE TRIGGER disk_files_held BEFORE UPDATE OF attachment_id ON disk_files
  WHEN old.attachment_id IS NOT NULL AND new.attachment_id IS NOT old.attachment_id
   AND NOT (new.attachment_id IS NULL AND new.previous_of IS old.attachment_id)
   AND EXISTS (SELECT 1 FROM attachments WHERE id = old.attachment_id)
BEGIN SELECT RAISE(ABORT, 'disk file stays with its attachment'); END;
CREATE TRIGGER disk_files_kept BEFORE DELETE ON disk_files
  WHEN old.attachment_id IS NOT NULL OR old.trash_id IS NOT NULL OR old.previous_of IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'disk file has an owner'); END;
```

- **Ordner:** `UNIQUE` auf `test_day_id` sichert „ein Ordner je Testtag"; dass NULL
  `UNIQUE` nicht bindet (Stolperstein 57), ist gewollt. Verschieben ist ein Upsert oder
  `DELETE` in `attachment_folders`. `folders.user_id` ist der siebte Träger in
  `assignInventory`.
- **Besitzer:** Löscht ein Weg die Datei oder den Eintrag im Papierkorb, setzt SQLite die
  Spalte auf `NULL`, und das löst `disk_files_orphaned` aus, auch am Ende einer Kaskade.
  Mit der Datei fällt auch ihre vorige Fassung, weil `previous_of` ebenso auf `NULL`
  geht. `disk_files_held` und `disk_files_kept` verhindern, dass Code eine Zeile von
  ihrer lebenden Datei trennt oder mit Besitzer löscht.
- **Umhängen:** `disk_files_held` lässt einen Wechsel zu: `attachment_id` wird `NULL`,
  und `previous_of` bekommt denselben Wert. Rückschrieb und Wiederherstellen brauchen
  ihn (6.6). Dass danach eine neue aktuelle Datei folgt, prüft der Trigger nicht; das
  prüfen die Tests (A.3).
- **`previous_of` ohne `UNIQUE`:** Wiederherstellen tauscht zwei Zeilen und braucht
  einen Zwischenstand, in dem beide `previous_of` tragen. Mit `UNIQUE` scheitert der
  Tausch in jeder Reihenfolge, auch in einer Anweisung. Höchstens eine vorige Fassung je
  Datei sichert die Reihenfolge im Code (6.6); ein Test prüft sie.
- **`OR IGNORE`** gilt nur, wenn ein `UPDATE` den Trigger auslöst. Löst ihn eine
  Fremdschlüsselaktion aus (`ON DELETE SET NULL`), bricht ein Name, der schon in
  `disk_files_gone` steht, die Anweisung mit UNIQUE ab. Namen entstehen deshalb nur aus
  `crypto.randomBytes(16)` und werden nie wieder vergeben.
- **Nachgestellt** am 28.09.2026 mit better-sqlite3-multiple-ciphers 11.10.0 (SQLite
  3.49.2) und SQLite 3.45.1: Kaskade, Rollback, Umhängen, Tausch, Papierkorb, die
  Verbote und `OR IGNORE`; `recursive_triggers` ist 0.
- **Trigger anlegen:** `installTriggers()` in `db.js`, ohne Rückfall: DROP und CREATE in
  einer Transaktion, nur bei abweichendem Text; ein Fehler bricht den Start ab.
  `tryIndex` taugt nicht, weil es nur warnt.

### 5.2 Verzeichnisse und Antwort

| Pfad | Inhalt | gelöscht |
|---|---|---|
| `data/files/<name>` | fertige Dateien, verschlüsselt | über die Löschliste; ohne Verweis durch den Eigentümer-Admin (R6) |
| `data/files/upload/<name>` | offene Uploads; Dateien aus Umlagerung, Rückschrieb und Import bis zum Commit; verschlüsselt | nach R7 |
| `<Ablageort>/kriterion-files/<name>` | Kopien für Backups | nach R8 |

`upload/` liegt unter `files/`, damit `rename()` auf demselben Dateisystem arbeitet.
Alle Dateien liegen flach in diesen Verzeichnissen, auch die eines Ordners (F15);
zusammen gehören sie über `attachment_folders`, die Liste des Backups und die
Löschliste. Verzeichnisse 0700, Dateien 0600. Namen entstehen nur aus
`crypto.randomBytes(16)` und werden vor jedem Pfad gegen `^[0-9a-f]{32}$` geprüft; keine
Route nimmt einen Namen an.

`GET /api/items/:id` liefert zusätzlich `folders`; je Datei `folder`, `preview` (neu
`video`), `duration`, `still`, `missing`; `uploads` mit `active` (eine Anfrage läuft oder
die letzte ist jünger als 30 s) und `touched_at`, bei eigenen mit `modified` und
`received`; `testDays[].folder`.

## 6. Upload, Verschlüsselung, Auslieferung

### 6.1 Verschlüsselung (Vorgabe 2)

| Teil | Wert |
|---|---|
| Schlüssel | 32 Byte zufällig je Datei, in `disk_files`, beim Upload in Stücken vorher in `uploads`; SQLCipher schützt ihn |
| Stück | `disk_files.chunk` Bytes Klartext, 1 MiB; AES-256-GCM |
| Nonce | 8 Nullbytes und die Stücknummer (4 Byte, Big Endian) |
| AAD | `Buffer.from(name, 'ascii')`, die 32 Hexzeichen des Namens |
| Aufbau | Stück `i` bei `i × (chunk + 16)`: Geheimtext, 16 Byte Marke; `encLen(n) = n + 16 × ⌈n / chunk⌉` |

AAD ist der Name, weil Wiederherstellen eine neue `attachments.id` vergibt. `file_key`
lesen nur zwei benannte Anweisungen mit aufgezählten Spalten; `SELECT *` auf
`disk_files` und `uploads` gibt es nicht, damit der Schlüssel in keine Antwort gerät.

```
Gemessen im Container (Xeon 2,1 GHz, AES-NI, Node 22), 1-MiB-Stücke:
  512 MiB + 12.345 Bytes (513 Stücke), aus der Datei gelesen:
    Sprung an 10 Stellen, je 2 MB: 10 von 10 korrekt, 0,2 bis 7,2 ms, gekipptes Bit bemerkt
    Aufschlag 8.208 Bytes (513 × 16); Entschlüsseln 413 MB/s
  512 MiB im Speicher, 28.09.2026, 3 Runden:
    Verschlüsseln 834 bis 924 MB/s, je 8 MiB 8,7 bis 9,6 ms
```

### 6.2 Routen und Beginn

| Route | Wer | Was |
|---|---|---|
| `POST /api/items/:id/uploads` | R11, nur in einen Ordner mit Testtag | beginnt oder setzt fort; `{ filename, size, modified, folderId }` → `{ id, received }` |
| `PUT /api/uploads/:id` | wer ihn begonnen hat | Kopf `Upload-Offset`, Rumpf bis 8 MiB; die letzte Anfrage schließt ab, 201 mit `detail()` |
| `DELETE /api/uploads/:id` | wer ihn begonnen hat, Admin | Abbruch |
| `PUT /api/attachments/:id/still` | wer die Datei hochgeladen hat | Standbild und Dauer (Version 1b) |

Eine Route zum Abschließen gibt es nicht, also keinen Zustand „alle Bytes da, aber keine
Datei". Der Beginn prüft synchron, ohne `await` vor dem `INSERT`, in dieser Reihenfolge:

1. Der Eintrag besteht.
2. Ein eigener offener Upload am Eintrag mit gleichem `filename`, `size` und `modified`
   wird fortgesetzt, ohne Prüfung der Zahlen und Grenzen; Platz nur für den Rest,
   `folder_id` aus der Zeile.
3. Neuer Upload: Ordner am Eintrag und eigener (R11). Hat er keinen Testtag: 413 mit
   `server.bigVideoFolder` („Große Videos nur in einem Ordner mit {dayOne}."), wenn
   `size` über „Anhang" liegt, sonst 409 mit dem Stand des Ordners (3.4). Bis zur Grenze
   „Anhang" jede Endung und `entryTooLarge` wie heute, mit den offenen Uploads bis
   „Anhang" (413). Darüber ein großes Video: Endung in `VIDEO_TYPES`
   (`attachments.js:14`), sonst 415 mit Sprachschlüssel; `size` ≤ Grenze „Video am
   {dayOne}"; `large` = 1. Beide Grenzen mit dem Wert beim Beginn (`limitBytes`).
   Dateien und offene Uploads des Eintrags unter 100; offene Uploads des Accounts < 3;
   frei ≥ `encLen(size)` + vorgemerkt + Reserve, sonst 507 (3.4). Nummer, Name und
   Schlüssel aus 16, 16 und 32 Zufallsbytes; `upload/<name>` entsteht mit `wx`.

Der Upload in einer Anfrage (`POST /api/items/:id/attachments`) weist einen Ordner mit
Testtag mit 409 und dem Stand des Ordners ab; der Browser wählt dann den Upload in
Stücken (3.4).

**Vorgemerkt** ist der Rest der offenen Uploads, die in der letzten Stunde eine Anfrage
hatten; ein Upload ohne erste Anfrage verfällt nach 15 Minuten. **Reserve** ist die
Größe der Datenbank plus 1 GB, weil dort WAL und Papierkorb wachsen (`intoTrash` kopiert
die Bytes eines Eintrags). Den Platz prüfen nur die Wege auf die Platte: beim Beginn, bei
jeder Anfrage (6.3) und vor einer Umlagerung (6.5). Der Upload in einer Anfrage und die
Route für das Standbild prüfen ihn nicht, wie heute: Ihre Bytes gehen in die Datenbank,
für die die Reserve Platz hält. Scheitert `statfs`, wird wie in `importSpace`
(`server.js:4896-4905`) nicht abgelehnt.

### 6.3 Eine Anfrage und die Nonce-Regel

```
PUT /api/uploads/:id        Upload-Offset: n
  uploadTurn, vor dem Rumpf:
             Zeile fehlt oder fremd → 404 · laeuft schon eine Anfrage → 409
             n ≠ received → 409 { received } · ohne Content-Length → 411
             Content-Length ≠ min(8 MiB, size − n) → 400 · zu wenig Platz → 507
             Datei fehlt oder Laenge ≠ encLen(received) → Neubeginn, 409 { received: 0 }
             Sperre setzen
  express.raw({ type: 'application/octet-stream', limit: '8mb', inflate: false })
  bei n = 0 und large = 1, vor dem Verschluesseln:
             typeFromBytes(erste 12 Bytes) kein Videotyp → Zeile in uploads loeschen, 415
  asynchron: bis zu 8 Stuecke verschluesseln, an die Stelle encLen(n) schreiben, fdatasync
  synchron:  Zeile weg → 404 · received ≠ n → 409 { received }
             n + Laenge = size → Abschluss (6.4)
             sonst received = n + Laenge, touched_at = jetzt, 200 { received }
  finally:   Sperre frei; ebenso, wenn express.raw mit Fehler endet
```

Die Sperre fällt erst, wenn der Handler fertig ist, nicht bei `res.on('close')`. Trennt
der Client nach dem Rumpf, arbeitet der Server weiter; eine Wiederholung mit demselben
Offset bekäme sonst dieselben Stücke unter demselben Schlüssel ein zweites Mal. Nach
einer eigenen abgebrochenen Anfrage ist 409 kein zweiter Sender: Der Tab wiederholt nach
Plan (3.4) und fährt bei `received` aus der Antwort fort.

`uploadTurn` prüft vor dem Einlesen wie `entryAuthorOnly` vor multer
(`server.js:3465-3466`). Der Fehler-Handler übersetzt jedes `err.type` von body-parser
und protokolliert `request.aborted` ohne Stack, den Normalfall eines Abbruchs.

**Erste Bytes:** Bei einem großen Video (`large` = 1) prüft die Anfrage mit Offset 0 vor
dem Verschlüsseln die ersten 12 Bytes mit `typeFromBytes` (`attachments.js:100-126`); das
Ergebnis muss ein Videotyp sein. Sonst antwortet sie 415 (`server.videoOnly`, beim
Beginn mit falscher Endung ebenso), und der Upload wird gelöscht. Ein älteres
MOV ohne `ftyp` erkennt `typeFromBytes` nicht und wird abgewiesen. Die Meldung sagt, dass
es bis zur Grenze „Anhang" als gewöhnliche Datei hochgeht. Eine Datei bis „Anhang"
prüft die Anfrage nicht, auch ein Video nicht (F1).

**Nonce-Regel: Unter einem Schlüssel wird jedes Stück höchstens einmal verschlüsselt und
geschrieben.** Ein Stück wird nur unter der Sperre und nur an die Stelle
`encLen(received)` geschrieben; ein erneut gesendetes Stück wird nicht verschlüsselt.
Fehlt die Datei oder ist sie nicht `encLen(received)` lang, beginnt der Upload neu mit
neuem Namen und Schlüssel. Das deckt einen Absturz zwischen Schreiben und
`UPDATE received` und eine zurückgespielte Datenbank mit einem inzwischen fertigen
Upload. Sonst gäbe es zu einer Nonce zwei Geheimtexte, und bei GCM wäre der Schlüssel der
Marke berechenbar.

### 6.4 Abschluss

```
PRAGMA synchronous = FULL
db.transaction:  INSERT attachments (…, size, data = x'', sort_order = MAX + 1, user_id)
                 INSERT disk_files (name, size, chunk, large, file_key, attachment_id)  -- aus uploads
                 INSERT attachment_folders, wenn der Ordner noch besteht
                 „Bearbeiten durch alle" wie beim Upload in einer Anfrage (filesEditAllOf)
                 DELETE uploads
PRAGMA synchronous = NORMAL
danach synchron: existsSync(files/<name>) prüfen, renameSync(upload/<name>, files/<name>)
```

`rename` braucht keine Hardlinks, die exFAT und manche SMB-Freigaben nicht kennen.
Scheitert es nach dem Commit, antwortet der Server trotzdem 201 und protokolliert; der
nächste Lauf holt es nach (7.2). Commit vor Platte gilt nur bei dauerhaftem Commit. Der
Treiber setzt im WAL-Modus `synchronous = NORMAL` (nachgestellt); ein Commit ist dann
erst nach einem Checkpoint sicher auf der Platte. Deshalb läuft nur die Transaktion des
Abschlusses mit `FULL`, das kostet ein `fsync` je fertiger Datei; die Einstellung gilt je
Verbindung und lässt sich zwischen zwei Transaktionen umstellen (nachgestellt). Vor
einem `unlink` sichert `sweepDisk()` den Commit mit einem Checkpoint (7.2). `open()` in
`db.js` bleibt, wie es ist. Umlagerung (6.5), Rückschrieb (6.6) und Import (7.3)
schließen ebenso ab: Datei unter `upload/`, Transaktion mit `FULL`, danach `rename`.

### 6.5 Umlagerung

Eine Datei geht aus der Datenbank auf die Platte, wenn sie in einen Ordner mit Testtag
kommt (F11). Eine eigene Route gibt es nicht.

| Auslöser | Route | umgelagert |
|---|---|---|
| Verschieben in einen Ordner mit Testtag | `PUT /api/attachments/:id/folder` | die Datei, wenn sie in der Datenbank liegt |
| Testtag einem Ordner zuweisen | `PUT /api/folders/:id` | jede Datei des Ordners in der Datenbank |

Die Route prüft synchron Rechte, Ziel und Platz: frei ≥ Summe `encLen(size)` der
betroffenen Dateien und ihrer vorigen Fassungen + vorgemerkt + Reserve (6.2), sonst 507,
und nichts ist geändert. Dann committet sie Verschieben bzw. Zuweisung, liest ohne
`await` dazwischen die betroffenen Dateien und lagert sie um, eine nach der anderen:

```
je Datei:
  lesen:     data, size und saves (attachment_editing, 0 ohne Zeile); hoechstens 100 MB,
             dazu die vorige Fassung aus attachment_previous, falls vorhanden
  asynchron: je Fassung neuer Name und Schluessel, Name in die Menge im Speicher (R7),
             Stuecke nach upload/<name> verschluesseln, fdatasync
  PRAGMA synchronous = FULL
  db.transaction:
             Datei weg, schon auf der Platte oder in keinem Ordner mit Testtag mehr
               → vorbereitete Dateien loeschen, weiter mit der naechsten
             saves anders → vorbereitete Dateien loeschen, diese Datei einmal neu
             INSERT disk_files (name, size, chunk, large = 0, file_key, attachment_id)
             UPDATE attachments SET data = x'' WHERE id = ?
             vorige Fassung: INSERT disk_files (…, previous_of = id)
                             UPDATE attachment_previous SET data = x'' WHERE attachment_id = ?
  PRAGMA synchronous = NORMAL
  danach synchron: renameSync(upload/<name>, files/<name>) wie beim Abschluss (6.4)
nach der letzten Datei: reclaim(), Antwort mit detail()
```

- **`saves`:** Der Zähler in `attachment_editing` steigt mit jeder Speicherung des
  Document Servers und mit jedem Wiederherstellen (`countSave`, `server.js:842-843`).
  Hat er sich während der Umlagerung geändert, haben Rückschrieb oder Wiederherstellen
  `data` ersetzt; ohne den Vergleich ginge diese Fassung verloren.
- **Antwort erst nach der letzten Datei,** ohne Fortschrittsanzeige. `entryTooLarge`
  begrenzt die Dateien eines Eintrags in der Datenbank auf 345 MB (`EXCHANGE_MAX_MB`
  mit Node 22). Bei 834 MB/s (6.1) dauert das Verschlüsseln unter einer Sekunde, das
  Schreiben einige Sekunden, weit unter den 100 s, nach denen Cloudflare abbricht. Ein
  Fortschritt bräuchte einen Zustand im Server und eine Abfrage wie beim Backup (7.4).
- **Platz in der Datenbank:** `reclaim()` (`server.js:543-545`: `incremental_vacuum`,
  `wal_checkpoint(TRUNCATE)`) gibt die Seiten der Blobs frei, wie nach dem Löschen einer
  Datei (`server.js:3829`). `maintainStorage()` hat dafür beim Start
  `auto_vacuum = INCREMENTAL` eingerichtet (`server.js:6036-6047`).
- **Fehler:** Scheitert eine Datei (EIO, ENOSPC), antwortet die Route mit dem Fehler.
  Verschieben bzw. Zuweisung bleiben; der nächste Lauf lagert den Rest um (7.2,
  Schritt 6). Absturz vor dem Commit: Die Datei bleibt in der Datenbank, der Rest unter
  `upload/` fällt nach R7. Absturz nach dem Commit: `rename` holt der nächste Lauf nach
  (7.2, Schritt 2).

### 6.6 Neue Fassung aus dem Document Server

Eine Datei auf der Platte wird nie überschrieben (R3). Jede Speicherung des Document
Servers (`saveEdited`, `server.js:857-871`) schreibt eine neue Datei mit neuem Namen und
Schlüssel. Wie in der Datenbank legt nur die erste Speicherung einer Sitzung die
bisherige Fassung als vorige ab (`server.js:864`); jede weitere Speicherung derselben
Sitzung ersetzt nur die aktuelle, und deren alte Datei kommt in die Löschliste.

```
Callback wie heute bis docserver.download (bis 100 MB)
asynchron: liegt die Datei auf der Platte: neuer Name und Schluessel, Name in die Menge (R7),
           nach upload/<name> verschluesseln, fdatasync
PRAGMA synchronous = FULL
db.transaction (saveEdited):
  Datei weg → wie heute · Ort anders als beim Verschluesseln → {error: 1}
  in der Datenbank: wie heute; replaceFile nur WHERE NOT EXISTS (… disk_files …)
  auf der Platte, erste Speicherung der Sitzung (session_key weicht ab, wie heute):
    UPDATE disk_files SET previous_of = NULL WHERE previous_of = ?        -- aeltere vorige: Loeschliste
    UPDATE disk_files SET attachment_id = NULL, previous_of = ? WHERE attachment_id = ?
    keepPrevious (data ist x'')
  auf der Platte, weitere Speicherung derselben Sitzung:
    UPDATE disk_files SET attachment_id = NULL, previous_of = ? WHERE attachment_id = ?
    UPDATE disk_files SET previous_of = NULL WHERE id = <diese Zeile>     -- alte aktuelle: Loeschliste
  dann:
    INSERT disk_files (name, size, chunk, large = 0, file_key, attachment_id)
    attachments: filename, mime_type, size, data = x''
    countSave, touch wie heute
PRAGMA synchronous = NORMAL
danach synchron: renameSync wie beim Abschluss (6.4)
```

- **Ort geändert:** Der Rückschrieb entscheidet vor dem Verschlüsseln nach
  `disk_files`, die Transaktion prüft es erneut. Hat eine Umlagerung die Datei
  inzwischen auf die Platte gebracht, antwortet der Callback `{error: 1}`; der Document
  Server versucht es dann erneut und trifft den Weg auf die Platte. Ebenso bei ENOSPC.
- **Vorige Fassung wie heute:** „Vorige Fassung wiederherstellen" holt auch auf der
  Platte den Stand vor der Sitzung zurück, nicht den vor der letzten Speicherung. Die
  weitere Speicherung hängt die alte aktuelle Datei erst um und löst sie dann, weil
  `disk_files_held` das direkte Trennen von der lebenden Datei verbietet; `previous_of`
  hat dafür kein `UNIQUE` (5.1). Entschieden am 28. September 2026 nach der Regel „der
  einfachere Weg, der kein Verhalten ändert".
- **Wiederherstellen** (`POST /api/attachments/:id/previous`) tauscht die Besitzer in
  einer Transaktion:

  ```
  UPDATE disk_files SET attachment_id = NULL, previous_of = ? WHERE attachment_id = ?  -- aktuelle wird vorige
  UPDATE disk_files SET previous_of = NULL, attachment_id = ? WHERE id = ?             -- vorige wird aktuelle
  ```

  Dazu tauschen `attachments` und `attachment_previous` Name, Typ und Größe; `data`
  bleibt `x''`. Die Größe kommt aus `size`, nicht aus `data.length`
  (`server.js:3797`, `:3800`). Nichts wird neu verschlüsselt; ein zweiter Aufruf stellt
  den alten Stand her.
- **Schlüssel im Document Server:** `documentKey` (`docserver.js:133-136`) bildet ihn
  aus der Adresse mit `attachments.id`, `created_at` und dem Zähler; der Name auf der
  Platte geht nicht ein. Ein neuer Name ändert ihn nicht und muss es nicht: `saves`
  steigt mit jeder Speicherung und jedem Wiederherstellen, der Betrachter holt dann neu.
  Eine Umlagerung ändert den Inhalt nicht.

### 6.7 Im Browser

- Die Upload-Verwaltung steht auf Modulebene und hält `File`-Objekte, Warteschlange und
  Zustand. Den Weg wählt sie nach dem Ziel: In einen Ordner mit Testtag geht jede Datei
  in Stücken, auch ein PDF von 200 KB mit Beginn und einer Anfrage. Jede andere geht
  einzeln an `POST /api/items/:id/attachments` mit dem neuen Feld `folderId`, über
  `XMLHttpRequest` wegen des Fortschritts. Ein Hash zum Wiedererkennen scheidet aus,
  weil `crypto.subtle` ohne HTTPS fehlt.
- `stillFrame()` nimmt ein `File` oder eine Adresse und die Stelle (10 % unter
  „Dateien"). Mit `/raw` als Quelle lädt der Browser dank Range nur `moov` und ein paar
  Bilder. Die Adresse des Vorschaubilds bekommt `v=<Länge>`, weil es eine Woche im Cache
  liegt.

### 6.8 Auslieferung

`GET /api/attachments/:id/raw` bleibt die einzige Stelle, die Inhalt ausliefert.

- **In der Datenbank:** Range über `sendRanged` für jede Datei; so spielt auch ein Video
  bis zur Grenze „Anhang" auf iOS Safari. `?size=still` liefert das Poster.
- **Auf der Platte:** Rechte wie heute; ungültiger Range → 416; Kopf über
  `attachments.setHeader` (Typ aus der Endung, `nosniff`, `sandbox`) und `Accept-Ranges`.
- **Jedes Stück positionsgenau:** gelesen werden `min(chunk, size − i·chunk) + 16` Bytes
  an seiner Stelle; weniger Bytes, eine falsche Marke oder eine fehlende Datei gelten als
  beschädigt. Das erste Stück wird geprüft, bevor 200 oder 206 hinausgeht, sonst 500
  bzw. 404, und die Kachel zeigt ⚠. Jedes weitere Stück geht erst nach `final()` hinaus,
  weil Node mit `update()` Klartext vor der Prüfung liefert. Das nächste Stück wird erst
  nach `drain` entschlüsselt, so folgt die Last der Netzrate.
- **Ganz entschlüsseln** (R3): Vorschau von Text und `.docx`, Vorschaubild eines Bildes,
  Document Server (`server.js:818`) und Export lesen eine Datei auf der Platte, die kein
  großes Video ist, Stück für Stück in einen Buffer; jedes Stück wird wie oben geprüft.
  PDF, Bild und Video im Vollbild gehen über `/raw`.
- **HEAD** nimmt denselben Weg bis zum Kopf, prüft mit `fstat` die Länge und
  entschlüsselt nichts. Keine Kompression; `Cache-Control: no-transform`.
- **Reverse Proxy:** nginx puffert sonst Klartext auf seiner Platte. Die README
  (`README.md:379-381`) nennt für `/api/uploads/` und `/api/attachments/`
  `proxy_request_buffering off;` und `proxy_buffering off;`; je Anfrage bleiben 100 MB,
  die Obergrenze von „Anhang".
- **iOS Safari** fragt `bytes=0-1` und spielt nur mit 206. **HEVC:** Rückfall auf
  „Herunterladen"; kein Umkodieren, kein `ffmpeg`.

## 7. Lebenszyklus

### 7.1 Löschen über alle Wege

| Weg | Stelle | in der Datenbank | auf der Platte |
|---|---|---|---|
| Datei löschen | `server.js:3819-3831` | `DELETE attachments` → `SET NULL` → Trigger, auch für die vorige Fassung | nach der Antwort |
| Neue Fassung aus dem Document Server | `saveEdited`, `857-871` | erste Speicherung einer Sitzung: ältere vorige Fassung, weitere Speicherung: alte aktuelle; jeweils `previous_of` → `NULL` → Trigger (6.6) | nach der Antwort |
| Eintrag in den Papierkorb | `intoTrash`, `5487-5503` | erst `trash_id` setzen, dann `DELETE items`; die vorige Fassung fällt | bleibt |
| Wiederherstellen | `5535-5566` | 7.3 | bleibt |
| Frist 30 Tage, endgültig löschen | `5471`, `5568-5573` | `DELETE trash` → `SET NULL` → Trigger | nach der Antwort |
| Import „ersetzen" | `5042`, `5251-5256` | `DELETE items` in der Import-Transaktion | nach dem Commit |
| Account löschen | `auth.js:343`, `350`; `usertool.js:154` | `DELETE items` bzw. `attachments`; neu `uploads`, mit `--posts` `folders` | beim nächsten Lauf des Servers |
| Ordner löschen / Testtag löschen / Zuweisung lösen | neu / `3947-3955` / neu | Kaskade `attachment_folders` / `test_day_id` → `NULL` / `test_day_id` → `NULL` | nichts (R18) |
| Upload abbrechen, verfallen, Eintrag gelöscht | neu | Zeile in `uploads` weg | nach R7 |
| Umlagerung, Rückschrieb oder Import scheitert vor dem Commit | – | nichts eingetragen | nach R7 |
| Transaktion scheitert | – | `ROLLBACK` nimmt die Löschliste mit zurück | nichts |

Die Löschdialoge zählen Dateien auf der Platte mit und neu die Ordner. Die Rückfrage vor
„ersetzen" nennt Zahl und Größe der großen Videos, die der Export nicht trägt.

### 7.2 Löschliste, Start, stündlicher Lauf

`sweepDisk()` liest die Namen aus `disk_files_gone` und führt erst danach
`PRAGMA wal_checkpoint(PASSIVE)` aus, weil `usertool.js` aus einem eigenen Prozess
committen kann. Nur wenn `checkpointed` gleich `log` ist, stehen die Commits dieser Namen
sicher auf der Platte; sonst bleibt die Liste bis zum nächsten Lauf. `busy` taugt dafür
nicht:

```
PASSIVE, während eine zweite Verbindung eine Lesetransaktion hält:
  busy 0, log 1, checkpointed 0; nach ihrem Ende: busy 0, log 1, checkpointed 1
```

Dann prüft es jeden dieser Namen gegen `^[0-9a-f]{32}$`, löscht
`data/files/<name>` und danach die Zeile; `ENOENT` gilt als erledigt, ein anderer Fehler
lässt die Zeile stehen und wird einmal je Name und Fehlercode protokolliert. Es läuft
beim Start, nach jeder Antwort mit nicht leerer Liste, stündlich und nach jeder
Backup-Kopie. Es läuft nur in `server.js` im Haupt-Thread, weil `batchrun.js`,
`usertool.js` und `keytool.js` `db.js` ebenfalls öffnen. Jeder Lauf, in dieser Folge:

1. Beim Start: `data/files/` und `upload/` anlegen.
2. Abschlüsse nachholen: Liegt die Datei einer Zeile in `disk_files` noch unter
   `upload/`, folgt `rename`; ein vorhandenes Ziel gilt als erledigt. Das gilt auch nach
   Umlagerung, Rückschrieb und Import.
3. Verfallene Uploads löschen (24 h ohne angenommene Anfrage, 15 min ohne erste), dann
   Dateien unter `upload/` nach R7, ohne die Namen in der Menge im Speicher.
4. `cleanupTrash()` wie heute, dann `sweepDisk()`.
5. Beim Start: Jede Zeile in `disk_files` braucht eine Datei der Länge `encLen(size)`;
   fehlende merkt sich der Server, die Kachel zeigt ⚠.
6. Beim Start und stündlich: Umlagerung nachholen. Dateien in der Datenbank, die in
   einem Ordner mit Testtag liegen, lagert der Lauf um (6.5).

Bei `DATABASE_INCOMPLETE` (`server.js:200-201`) entfallen 2 bis 4 und 6.

### 7.3 Papierkorb, Export, Import

- **Papierkorb:** `intoTrash` setzt `disk_files.trash_id` vor `DELETE items` und kopiert
  die Datei nicht, für jede Datei auf der Platte; der Umschlag nennt sie mit
  `data_stored: <name>`, geschrieben nur von `funnelStore`. Eine vorige Fassung auf der
  Platte fällt dabei weg, wie heute `attachment_previous`, das der Papierkorb nicht
  trägt. **Wiederherstellen** prüft in seiner Transaktion zuerst, ob die Zeile in
  `trash` noch besteht (sonst 404), setzt `attachment_id` nur mit `WHERE name = ? AND
  trash_id = ?` und `changes === 1` und löscht die Zeile in `trash` in derselben
  Transaktion (heute danach, `server.js:5556`). `DELETE /api/trash/:id` antwortet für
  Nummern in `trashRestoring` mit 409, `cleanupTrash` überspringt sie; beide liefen sonst
  während `await importPrepare` und hinterließen eine Datei ohne Inhalt.
- **Vorschaubilder:** Die Kachel einer Bilddatei steht weder im Export noch im
  Papierkorb (0.44.0/F9); der Server erzeugt sie beim ersten Abruf neu. Standbild und
  Dauer eines Videos tragen der Umschlag des Papierkorbs und Format 21. Fehlen sie,
  erzeugt der Browser des Verfassers das Vorschaubild nach (3.3).
- **Export:** Format 21 (Version 2) trägt `folders` (`name`, `author`, `created_at`) und
  je Datei `folder`, als Stelle im Feld; je Video `still` und `duration`. Format 22
  (Version 3) trägt je Ordner `testDay`, als Stelle im Feld, weil Testtage ohne Nummer
  im Export stehen. Ein großes Video steht darin ohne `data` (Vorgabe 8); jede andere
  Datei auf der Platte entschlüsselt der Export ganz und trägt sie mit Inhalt (F16).
  Eine Datei in der Datenbank trägt er wie heute immer mit Inhalt. Der Exportdialog
  nennt vorher „Nicht enthalten: 3 große Videos (5,4 GB). Sie sichert das Backup."
  `entryTooLarge`, `PART_SIZES` und `exportSum` zählen eine Datei auf der Platte mit
  `disk_files.size`, ein großes Video mit 0 Bytes; `entryTooLarge` zählt dazu die
  offenen Uploads bis „Anhang". Maßgeblich ist `disk_files.large`, nicht der Wert von
  „Anhang" beim Export: Eine spätere Änderung der Grenze macht keinen Eintrag
  nachträglich zu groß für den Export.
- **Import:** Eine Datei ohne Inhalt legt er nicht an, sondern zählt und nennt sie; heute
  fällt sie still weg (`server.js:5124-5125`). `/api/import` übergibt keine Nummer eines
  Eintrags im Papierkorb, löst also nie einen Verweis auf die Platte auf. Ordner
  entstehen nach den Testtagen. Gehören Ordner und Testtag verschiedenen Accounts oder
  zeigen zwei Ordner auf denselben Testtag, bleibt der Ordner ohne Testtag und wird
  gezählt. Dateien eines Ordners mit Testtag legt er auf die Platte, alle anderen in die
  Datenbank (F16): `importPrepare` entscheidet die Zuweisungen vor der Transaktion und
  verschlüsselt diese Dateien nach `upload/`, die Transaktion trägt sie in `disk_files`
  ein, nach dem Commit folgt `rename` (6.4). Scheitert der Import, löscht der nächste
  Lauf sie nach R7. Format 20: alle Dateien ohne Ordner. Format 21: Ordner ohne Testtag.

### 7.4 Backup und Zurückspielen

```
<Ablageort>/kriterion-2026-09-28-07-45-12.sqlite
<Ablageort>/kriterion-2026-09-28-07-45-12.files     je Zeile: <Name> <Länge auf der Platte> [fehlt]
<Ablageort>/kriterion-files/<Name>                  byte-gleich zu data/files/<Name>
<Ablageort>/kriterion-files/.lock                   Host, PID, Beginn; verwaist nach 24 h
```

1. Sperre im Speicher und als Lockfile (`open(…, 'wx')`) für alle Prozesse am Ablageort,
   sonst 409 „Ein Backup läuft, auch aus einer anderen Instanz". Unter der Sperre werden
   Reste eines abgebrochenen Backups gelöscht (`.sqlite.wird`, `.part`). Frei am
   Ablageort ≥ Datenbank × 1,1 + Summe der dort fehlenden Dateien.
2. `sweepDisk()` anhalten (R8).
3. `VACUUM INTO …sqlite.wird` wie heute. Die Liste der Dateien kommt aus dieser Datei,
   nicht aus der laufenden Datenbank: `usertool.js` kann währenddessen aus einem eigenen
   Prozess committen (nachgestellt).
4. Fehlt am Ablageort nichts, antwortet die Route wie heute mit 200 und denselben
   Feldern, vor Version 3 also immer. Sonst 202, weil eine Kopie von GB länger dauert
   als die 100 s, nach denen Cloudflare abbricht; die Karte fragt alle 2 s nach:
   „Backup läuft: Dateien 2 von 5 (1,2 von 4,1 GB)".
5. Fehlende Dateien nach `kriterion-files/` kopieren (`.part`, `fsync`, `rename`); eine
   Kopie gleicher Länge bleibt. Fehlt eine Quelle, bekommt ihre Zeile in der Liste die
   Marke `fehlt`, und die Karte nennt die Zahl.
6. `.files` schreiben, dann `.wird` in `.sqlite` umbenennen; erst jetzt erscheint das
   Backup.
7. Alte Backups nach `keep` und `days` aufräumen, danach `cleanBackupFiles()`: am
   Ablageort `^kriterion-.+\.files$` ohne `.sqlite` daneben, in `kriterion-files/` jede
   reguläre Datei nach `^[0-9a-f]{32}(\.part)?$`, die keine verbliebene Liste nennt.

Die Schritte laufen in `try/finally`: Sperre, Lockfile und Pause werden in jedem Fall
aufgehoben, `.wird` wird gelöscht. Ein Fehler (ENOSPC, EIO, ausgehängter Ablageort)
steht als Sprachschlüssel im Zustand der Karte; ein beim Start gefundenes `.wird` meldet
sie als „Backup vom … durch Neustart abgebrochen". Die Liste ist Klartext, weil sich
Backups von vor einem Schlüsselwechsel nicht mit dem aktuellen Schlüssel öffnen.
„prüfen" vergleicht zusätzlich die Liste mit `kriterion-files/`.

- **Alte Backups aufräumen** (`POST /api/backup/cleanup`) nimmt dieselbe Sperre und ruft
  `cleanBackupFiles()`; seine Vorschau rechnet die Kopien mit. Dieselbe Sperre nimmt
  `DELETE /api/files/unknown` (7.5).
- `checkPlace` weist das Segment `kriterion-files` ab, sonst räumte das Aufräumen am
  übergeordneten Ort Backups darin weg. Ein neuer Ablageort bekommt beim ersten Backup
  alle Dateien neu; den alten räumt Kriterion nicht mehr auf.
- `manual-de.md:563-564` („nur `kriterion-….sqlite`, nie in Unterordnern") wird mit
  Vorgabe 5 neu gefasst; `test/roundtrip.js:7251-7257` und `counterproof.js:3926-3933`
  prüfen dann auch `cleanBackupFiles()`.

**Zurückspielen** (`README.md:283-292`): vorher den Backup-Knopf drücken; dieses Backup
ist der Rückweg, weil der erste Start Frist und Löschliste des zurückgespielten Stands
ausführt. Dann anhalten, `.sqlite` nach `data/katalog.sqlite` kopieren, Dateien holen:

```sh
mkdir -p data/files
while read -r n len rest; do
  case "$n" in *[!0-9a-f]*|'') continue ;; esac; [ ${#n} -eq 32 ] || continue
  [ "$rest" = fehlt ] && continue
  [ -f "data/files/$n" ] && [ "$(wc -c < "data/files/$n")" -eq "$len" ] && continue
  cp "kriterion-backup/kriterion-files/$n" "data/files/$n.part" &&
    mv "data/files/$n.part" "data/files/$n"
done < kriterion-backup/kriterion-<zeitpunkt>.files
```

Nur Namen aus der Liste und aus 32 Hexzeichen; eine Datei gleicher Länge bleibt, ein
Abbruch hinterlässt nur `.part`. Unbekannte Dateien bleiben liegen (R6).

### 7.5 Kennzahlen

| Zeile in „Kennzahlen" | Quelle |
|---|---|
| Datenbank | `dbBytes` wie heute |
| Dateien | wie heute (`server.js:4367`), aber nur Dateien in der Datenbank: `NOT EXISTS` in `disk_files` |
| Dateien auf der Platte | Zahl und Summe von `disk_files.size`; davon große Videos (`large` = 1); davon im Papierkorb |
| Uploads | Zahl und Summe von `received` |
| fehlen / warten auf Löschen | Menge aus 7.2, Schritt 5 / Namen in `disk_files_gone`; nur wenn größer null |
| ohne Verweis | Zahl und Größe der Namen unter `data/files/` nach `^[0-9a-f]{32}$`, die weder `disk_files` noch `disk_files_gone` kennt; nur wenn größer null; davon „mit Kopie im Backup"; für den Eigentümer-Admin mit dem Knopf „Löschen" |
| frei | `statfs` auf `data/files/` |

**Löschen ohne Verweis:** `DELETE /api/files/unknown`, nur für den Eigentümer-Admin
(`isOwner`, `server.js:917-918`); ein Admin bekommt 403. Die Route bildet die Liste bei
der Anfrage neu, nach derselben Regel wie die Zeile „ohne Verweis", und nimmt davon nur
Namen, deren Kopie unter `<Ablageort>/kriterion-files/` dieselbe Länge hat. Ohne
eingestellten Backup-Ordner löscht sie nichts. Unter `upload/` löscht sie nie. Sie
nimmt die Sperre des Backups (7.4, Schritt 1); während einer Backup-Kopie und bei `DATABASE_INCOMPLETE` antwortet sie 409. Die Rückfrage nennt Zahl
und Größe und den Satz: „Diese Dateien gehören zu keinem Eintrag dieser Datenbank. Eine
Kopie liegt im Backup-Ordner." Dateien ohne Kopie nennt die Karte getrennt; sie bleiben
liegen. Weil das Konzept vor dem Zurückspielen ein Backup verlangt (7.4), liegt die Kopie
im Normalfall vor.

Die Karte „Papierkorb" nennt je Eintrag die Größe mit seinen Dateien auf der Platte:
`qTrash` (`server.js:5506-5511`) zählt dazu `disk_files` mit dieser `trash_id`. Sonst
stünde ein Eintrag mit drei Videos dort mit wenigen KB.

### 7.6 Schlüsselwechsel, `keytool`, Update

`PRAGMA rekey` lässt die Dateischlüssel gelten; keine Datei wird neu verschlüsselt, das
ist der Grund für Vorgabe 2. Zwei Zeilen in `keytool.sh` ändern sich:

| Zeile | heute | künftig |
|---|---|---|
| 79, Kopie | `cp -a data "$ZIEL"` | `mkdir "$ZIEL" && find data -mindepth 1 -maxdepth 1 ! -name files -exec cp -a {} "$ZIEL"/ \;` |
| 100, ausgegebener Rückweg | `rm -rf data && cp -a $ZIEL data` | `find data -mindepth 1 -maxdepth 1 ! -name files -exec rm -rf {} + && cp -a "$ZIEL"/. data/` |

Bliebe Zeile 100, löschte der Rückweg nach einem gescheiterten Wechsel alle Dateien auf
der Platte. Ein Test in `test/source.js` prüft, dass `keytool.sh` kein `rm -rf data` ohne
Ausnahme für `files` enthält.

- **Probe an einer Kopie** (`README.md:216-230`): kopiert `data/` ohne `data/files/` und
  setzt einen eigenen Ablageort, sonst teilten sich beide Instanzen `../kriterion-backup`.
- **Update per ZIP** (`README.md:312-322`): Die Sicherheitskopie lässt `data/files/` aus;
  die Dateien ändern sich nie (R3) und stehen im Backup. Die zweite Kopie wird ein `mv`.
- **Verratener Schlüssel:** Nach `PRAGMA rekey` ist jedes spätere Backup der Datenbank
  geschützt, eine Datei auf der Platte nicht. `README.md:189-192` bekommt: „Dateien auf
  der Platte behalten ihren Schlüssel. Wer eine alte Kopie der Datenbank und den alten
  Schlüssel hat, liest sie weiter, auch aus späteren Backups. Schutz: Datei löschen und
  neu hochladen."

## 8. Verworfen, und warum

Was schon bei seiner Regel oder Stelle begründet ist, steht hier nicht noch einmal.

| Verworfen | Grund |
|---|---|
| Spalte `attachments.folder_id` | ändert eine vorhandene Tabelle (Vorgabe 19), setzt `DATABASE_INCOMPLETE` |
| eigene Tabelle Ordner–Testtag | leistet dasselbe wie `test_day_id UNIQUE` mit `SET NULL` |
| Ordner ohne Verfasser, Ordnen nur durch den Verfasser des Eintrags | ein Gast könnte für seinen Testtag an einem fremden Eintrag keinen Ordner anlegen |
| Admin ändert fremde Ordner | bräche „löschen ja, umschreiben nein"; der Verfasser eines Testtags verlöre das Hochladen in dessen Ordner |
| automatisches Löschen per Abgleich in `data/files/` | löschte nach dem Zurückspielen eines älteren Backups die neueren Dateien |
| Löschen per Code in jedem Löschweg | acht Stellen und ein eigener Prozess (`usertool.js`); jede neue Stelle wäre eine Lücke |
| Uploads direkt unter `data/files/` | das Backup könnte eine halbe Datei kopieren und später für fertig halten |
| Papierkorb kopiert die Bytes | 2 GB passen nicht in eine Zelle, der Platz verdoppelte sich |
| fehlende Dateien beim Start aus dem Backup-Ordner holen | Kopie von GB beim Start für einen Schritt, den eine Befehlszeile erledigt |
| Schlüssel per HKDF aus dem Datenbankschlüssel; Dateien beim Wechsel neu verschlüsseln | jeder Wechsel verschlüsselte alle Dateien neu, Stunden und doppelter Platz; Vorgabe 2 will das Gegenteil |
| zufällige Bytes im Nonce | weicht von Vorgabe 2 ab; „nur an `encLen(received)` schreiben, bei falscher Länge neu" genügt |
| Fortsetzen, wenn nur die Änderungszeit abweicht, nach Vergleich eines Stücks | braucht einen Rumpf im sonst synchronen Beginn und eine eigene Antwort; ob iOS die Änderungszeit ändert, ist nicht geprüft (A.4) |
| `synchronous = FULL` in `open()` | kostet ein `fsync` bei jedem Commit jedes Prozesses; nötig ist ein dauerhafter Commit nur vor `rename` und `unlink` (6.4, 7.2) |
| Entschlüsseln im Browser (MediaSource) | Schlüssel verließe den Server; MSE am iPhone eingeschränkt |
| Ordner als eigener Block | `BLOCK_DEFAULT` doppelt, feste Listen in `test/roundtrip.js:13998-14033` |
| Kachel ziehen zum Verschieben, Reihenfolge von Hand | zweiter Weg neben dem Menü, am Telefon nicht nutzbar; auch für Dateien gibt es keine Route zum Sortieren |
| Speicherort nach Größe: Video über „Anhang" auf die Platte, alles andere in die Datenbank (F2 in der ersten Fassung) | mischt in einem Ordner mit Testtag beide Speicherorte; jede kurze Sequenz stünde in der Datenbank und würde mit jedem Backup erneut kopiert |
| ein Verzeichnis je Ordner (F15) | verschlüsselt und mit Zufallsnamen außerhalb von Kriterion nicht nutzbar; Verschieben würde ein Umbenennen mit eigenem Absturzfall; der Pfad verriete, welche Dateien zusammengehören |

## 9. Grenzen und was nicht dazugehört

- Keine Umbenennung von Dateien, keine Suche nach Datei- und Ordnernamen.
- Große Videos sind in keinem Export und gehen nur in einen Ordner mit Testtag. Andere
  Dateien und ein älteres MOV ohne `ftyp` gehen nur bis zur Grenze „Anhang" hoch.
- Keine Umlagerung zurück in die Datenbank (R18). Dateien bis „Anhang" zählen auch auf
  der Platte in `entryTooLarge` (F16): Ein Eintrag fasst ohne große Videos wie heute
  höchstens 345 MB.
- Fortsetzen nach dem Schließen des Tabs verlangt, dieselbe Datei neu zu wählen; am
  iPhone gilt eine aus „Fotos" neu gewählte vermutlich als andere und beginnt neu (3.4).
  Kein Kontingent je Account.
- Links- und Testtagzeilen behalten ✕ beim Überfahren (`style.css:890-893`).
- Nicht dazu gehören: Umkodieren, automatisches Abspielen, Vorschau beim Überfahren,
  Verweiskarte für Ordner, ZIP mehrerer Dateien, die Knöpfe an fremden Testtagzeilen.

## 10. Bauabschnitte

Reihenfolge nach Vorgabe 20; jede Version ist für sich nutzbar. Im Repository liegt
immer nur ein Auftrag. Je Version kommen CHANGELOG, Änderungsprotokoll und die Schlüssel
in `de.json`, `en.json` und `tr.json` dazu.

| Version | Inhalt | für sich nutzbar | Doku | Aufwand |
|---|---|---|---|---|
| 1a Kacheln (0.45.0) | Kachel, Menü, Vorschau, eigene Ansicht am Telefon, Tastatur und ARIA, R12, R13, Adresse einer Bilddatei öffnet das Vollbild, Ablegen, Warteschlange mit Fortschritt und Abbrechen, Weiterlaufen beim Wechsel des Eintrags, 100 Dateien je Eintrag und 20 je Anfrage; kein Schema, keine Route | Klick lädt nie herunter, jede Handlung per Tastatur, Bilder im Vollbild | `manual-de.md:341-366`, `:450`; Fahrplan, `Fehler_und_Ideen.md:60`, `:201` | groß |
| 1b Videos unter „Dateien" (0.46.0) | `previewKind` `video`, Range an `/raw`, Zweig im Vollbild, Adresse einer Videodatei öffnet das Vollbild, R17 für jedes Video im Vollbild, `attachment_stills`, Standbild-Route, Vorschaubild nachholen, Standbild im Papierkorb, Text der Bildleiste (3.8) | Videos bis zur Grenze „Anhang" spielen ab, auch auf iOS | Handbuch, Dateien | klein |
| 2 Ordner (0.47.0) | `folders` mit der Spalte `test_day_id`, die hier leer bleibt; `attachment_folders`; vier Routen (A.2); Dialog ohne Feld „{dayOne}", Verschieben, Ordnermenü ohne „Link kopieren"; Format 21 samt Standbild; Papierkorb, Import; `countInventory`, `removeUser`, `assignInventory` | Dateien in benannten Ordnern gruppiert | `manual-de.md:205-230` mit Ordner, Verschieben, Vorschaubild, Upload abbrechen; Abschnitt „Ordner" | mittel |
| 3 Testtage und Dateien auf der Platte (0.48.0) | Zuweisung im Dialog (Teil von `PUT /api/folders/:id`), Testtagsymbol, `jumpTo`, Set für Sprünge, Rückweg, Adresse `#/item/x/folder/y` und „Link kopieren" am Ordner; `uploads`, `disk_files`, `disk_files_gone`, Trigger; Upload in Stücken für jede Datei eines Ordners mit Testtag; Prüfung der ersten Bytes; Umlagerung; große Videos, Grenze „Video am {dayOne}"; Rückschrieb und vorige Fassung auf der Platte; vier Routen (6.2, 7.5); Strom, HEAD, Entschlüsseln im Ganzen; `sweepDisk()`, Läufe; Papierkorb, Import; Backup; Kennzahlen mit „Löschen" für Dateien ohne Verweis; Format 22 mit `testDay`; Kopfleiste; Hinweis der Bildleiste; `keytool.sh` | die Videos und Dateien der Testtage | README `:16`, Schlüsselwechsel und Probe, Backup, Zurückspielen, Update, Reverse Proxy; Handbuch `:563-564`, Kennzahlen, Ordner mit Testtag und Sprung | groß, mehr als 0.8.50 (146 Prüfungen, 30 Gegenproben) |

Die Spalte `folders.test_day_id` entsteht schon mit 0.47.0 und bleibt dort leer, weil
eine vorhandene Tabelle später nicht mehr geändert wird (Vorgabe 19). Die Zuweisung kommt
erst mit 0.48.0 und dem Speicher auf der Platte. So gibt es beim Update auf 0.48.0 keinen
Ordner mit Testtag und keine Datei, die umzulagern wäre, also keine Datenmigration
(CLAUDE.md Abschnitt 5).

Version 3 lässt sich nicht teilen: Ohne Backup mit Dateien wäre der Knopf unvollständig,
ohne alle Löschwege blieben Dateien ohne Besitzer liegen. Ohne Speicher auf der Platte
entstünden Ordner mit Testtag, deren Dateien in der Datenbank liegen.

## 11. Abgleich mit den Vorgaben des Betreibers

| Nr. | Vorgabe | umgesetzt wie / Abweichung |
|---|---|---|
| 1 | große Videos neben der DB, verschlüsselt | umgesetzt (R2, 6.1). **Erweiterung (F11, F14):** Jede Datei eines Ordners mit Testtag liegt verschlüsselt neben der Datenbank; große Videos nur dort (F12) |
| 2 | AES-256-GCM, 1-MB-Stücke, Stücknummer im Nonce, Datei-ID als AAD, Schlüssel je Datei | umgesetzt. Auslegung: „Datei-ID" ist der Name auf der Platte, weil Wiederherstellen eine neue `attachments.id` vergibt |
| 3 | 8-MB-Anfragen, fortsetzbar, Prüfungen, 24 h, neue Grenze 2048 MB | umgesetzt im Wortlaut (6.2 bis 6.4): zwei Grenzen, Prüfung der ersten Bytes. Die neue Grenze heißt „Video am {dayOne}" (F13), Vorgabe 2048 MB. In Stücken geht jede Datei in einen Ordner mit Testtag, auch eine kleine. 24 h ab der letzten angenommenen Anfrage |
| 4 | H.264 und HEVC, Download als Rückfall, Standbild bei 10 %, Knopf im Player | umgesetzt (3.3, 6.7). Vorhandene Videos und HEVC in Firefox haben zunächst kein Vorschaubild; der Browser des Verfassers erzeugt es nach, wo er kann. Ein gewähltes Vorschaubild übersteht Papierkorb, Export und Import |
| 5 | Backup kopiert fehlende Videos | umgesetzt (7.4) für jede Datei auf der Platte, auch im Papierkorb. **Änderung** der Zusage in `manual-de.md:563-564` |
| 6 | hochladen, wer den Testtag bearbeiten darf | wörtlich für den Ordner eines Testtags (4) und damit für jedes große Video (F12). **Abweichung** für Dateien ohne Ordner: Jeder Account lädt sie hoch, bis „Anhang", wie heute |
| 7 | mehrere Videos je Testtag | umgesetzt. **Einschränkung:** 100 Dateien je Eintrag |
| 8 | Export nur mit Namen; endgültig gelöscht → Datei weg | umgesetzt (7.3, 7.1) für große Videos; andere Dateien auf der Platte trägt der Export mit Inhalt (F16). Der Import nennt jede Datei ohne Inhalt |
| 9 | lose Dateien oben, Ordner darunter, Kacheln mit Statuspunkt | umgesetzt (3.1); Zustand unten rechts, zusammengefasst auch am Ordnerkopf |
| 10 | Name „Ordner" | umgesetzt; nie neben „Backup-Ordner" |
| 11 | „Ordner hinzufügen" im Kopf, „+" im Ordner | umgesetzt; „+" auch bei den Dateien ohne Ordner. **Einschränkung:** fremde Ordner zeigen kein „+" |
| 12 | Videos und Dateien in einem Ordner | umgesetzt (R1); in einem Ordner mit Testtag liegen beide auf der Platte (F14) |
| 13 | 1:1, Zuweisung im Menü, Symbol, Sprung, Link zurück | umgesetzt (3.5, 3.6); Zuweisung auch beim Anlegen, nur an einen eigenen Testtag. Die Zuweisung lagert die Dateien des Ordners auf die Platte um (6.5) |
| 14 | beim Öffnen alle Ordner zu | umgesetzt; ein neu angelegter Ordner und ein Sprungziel stehen offen |
| 15 | Vorschau unter der Kachelreihe, Bild und Video im Vollbild | **Auslegung (F5):** unter allen Kacheln der Gruppe, am Telefon eigene Ansicht. **Änderung:** höchstens eine Vorschau im Block, heute mehrere. **Abweichung (F7)** von 0.44.0/F3: Adresse und Marke einer Bild- oder Videodatei öffnen das Vollbild |
| 16 | ⋯ immer sichtbar | umgesetzt (3.2); eine fremde Upload-Kachel ohne erlaubte Handlung hat kein ⋯ |
| 17 | Ordner löschen → Dateien lose | umgesetzt (R9) |
| 18 | Bildleiste bleibt | umgesetzt; neu ist der Hinweis bei zu großem Video, ohne Knopf (3.8). **Abweichung (F6):** Die Video-Regeln des gemeinsamen Vollbilds gelten auch für Kurzvideos; hat eines den Fokus, spulen ← und →, statt zu blättern |
| 19 | nur neue Tabellen | umgesetzt: sechs Tabellen, drei Trigger an einer neuen Tabelle; `folders.test_day_id` entsteht mit der Tabelle in 0.47.0 |
| 20 | erst Ordner und Kacheln, dann große Videos | umgesetzt in vier Versionen, 0.45.0 bis 0.48.0 (10) |

---

## Anhang A. Für den Bau

### A.1 Stolperstein 109: die leere Spalte `data`

`attachments.data` bleibt `BLOB NOT NULL`; eine Datei auf der Platte trägt `x''`, ihre
vorige Fassung in `attachment_previous.data` ebenso. Jede Stelle in `server.js`, die
`data` liest oder schreibt:

| Zeile | heute | bei einer Datei auf der Platte |
|---|---|---|
| `818` | Document Server holt die Datei | ganz entschlüsselt (R3, 6.8) |
| `846`, `3793` | vorige Fassung ablegen, wiederherstellen | neue Datei, Besitzer tauschen (6.6); Größe aus `size`, nicht aus `data.length` |
| `849` (schreibt) | Rückschrieb des Document Servers | in die Datenbank nur `WHERE NOT EXISTS (… disk_files …)`, ohne Treffer `{error: 1}`; sonst neue Datei (6.6) |
| `3705` | `/raw` | Strom mit Range (6.8) |
| `3719` | Vorschaubild beim ersten Abruf | Bild: ganz entschlüsselt; Video: das gespeicherte Standbild |
| `3733` | Text- und `.docx`-Vorschau | ganz entschlüsselt |
| `4518`, `5458` | Export mit Bytes, Bytes in den Papierkorb | Export: ganz entschlüsselt, ein großes Video ohne `data`; Papierkorb: `data_stored` (7.3) |
| `4677`, `4720` | Größe des Exports, `entryTooLarge` | `disk_files.size`, ein großes Video 0 Bytes |
| `3686`, `5075` (schreiben) | Upload, Import | `x''` beim Abschluss eines Uploads, bei der Umlagerung und beim Import in einen Ordner mit Testtag |

Ein Test in `test/source.js` hält diese SQL-Zeilen fest; eine neue Stelle lässt ihn
scheitern, bis sie hier behandelt ist. Neu sind die Zeilen der Umlagerung
(`UPDATE attachments SET data = x''`, `UPDATE attachment_previous SET data = x''`).
`batchrun.js` liest keine Anhänge.

### A.2 Feste Zahlen in `test/`

1a = 0.45.0, 1b = 0.46.0, 2 = 0.47.0, 3 = 0.48.0.

| Stelle | heute | 1a | 1b | 2 | 3 |
|---|---|---|---|---|---|
| schreibende Routen `F_ROUTES` (`test/source.js:36`, `test/frame.js:396ff.`) | 79 | 79 | 80 | 84 | 88 |
| davon hinter dem CSRF-Schutz (`test/roundtrip.js:335`, Zahlwort) | 71 | 71 | 72 | 76 | 80 |
| Routen mit Rufer in `app.js` (`test/source.js:1610`) | 114 | 114 | 115 | 119 | 123 |
| Tabellen (`test/roundtrip.js:4055`, Zahlwort) | 33 | 33 | 34 | 36 | 39 |
| `EXCHANGE_FORMAT` (`server.js:4427`, `test/source.js:1397`) | 20 | 20 | 20 | 21 | 22 |
| `DATATABLES` (`test/source.js:394-396`) mit `attachment_stills`, `folders`, `attachment_folders`; ohne `disk_files` | 12 | 12 | 13 | 15 | 15 |
| Träger in `assignInventory` (`test/source.js:484`) | 6 | 6 | 6 | 7 | 7 |
| Kopieranweisungen des Papierkorbs (`test/source.js:407-409`), mit `attachment_stills` | 6 | 6 | 7 | 7 | 7 |
| `cappedLive` (`test/source.js:1905-1908`) | 7 | 7 | 8 | 8 | 8 |
| Grenzen beim Hochladen (`test/release_041.js:718-722`, Zahlwort) | 5 | 5 | 5 | 5 | 6 |
| Dateien des Kommentarwächters (`test/selfcheck.js:387`), dazu `COMMENT_TOTAL` | 41 | 42 | 43 | 44 | 45 |
| Regelzeilen `style.css` (`test/source.js:1841`) | 1750 | neu gezählt | neu gezählt | neu gezählt | neu gezählt |
| Rückbauten (`test/selfcheck.js:18`) | 1226 | + Gegenproben | + Gegenproben | + Gegenproben | + Gegenproben |

- Die vier Routen von Version 2: `POST /api/items/:id/folders`, `PUT /api/folders/:id`,
  `DELETE /api/folders/:id`, `PUT /api/attachments/:id/folder`. In Version 3 nimmt
  `PUT /api/folders/:id` den Testtag an; Zuweisen und Umlagerung brauchen keine eigene
  Route. Die vier Routen von Version 3: `POST /api/items/:id/uploads`,
  `PUT /api/uploads/:id`, `DELETE /api/uploads/:id`, `DELETE /api/files/unknown`.
- `POST /api/items/:id/attachments` steht in `F_ROUTES` als „im Rumpf", Grund „ohne
  Ordner offen"; `POST /api/items/:id/uploads` ebenso, Grund „nur eigener Ordner mit
  Testtag". Bei „offen" schlüge `test/source.js:185` an `selfOnly(` an.
  `DELETE /api/files/unknown` steht dort als `ownerOnly`.
- `cappedLive` bleibt in Version 3 bei 8: Die Grenze „Video am {dayOne}" prüft
  `POST /api/items/:id/uploads` an `size`, ohne multer.
- Die sechste Grenze braucht auch den Mock in `test/dom.js:277`. Neue Texte:
  `card.limitDayVideo`; `entry.fileLimitHint` nennt im Ordner mit Testtag beide Grenzen,
  sonst „Anhang"; der Exporthinweis (`de.json:196`, `:201-202`) nennt die großen Videos
  als nicht enthalten; `server.videoOnly` die 415; `server.bigVideoFolder` die 413 für
  ein großes Video ohne Ordner mit Testtag.
- Version 1a ersetzt `test/release_044.js:457-477`; `ui_entry.js`, `release_042.js` bis
  `release_044.js` (87 Treffer) und 19 Rückbauten suchen künftig Kachel und Menü.
- Kommentargrenzen (`test/selfcheck.js:367-382`) für `db.js`, `server.js`, `app.js` und
  `style.css` steigen je Version mit Begründung im Commit; danach senkt
  `node tools/comments.js --write` sie.
- `'/api/backup'` steht 43-mal in `test/` und bleibt gültig, weil die Route ohne
  Kopierbedarf 200 liefert. Unverändert bleiben die Module (15). Die neue
  Kopieranweisung liest `WHERE attachment_id = ?`; die Prüfung auf `WHERE id = ?`
  (`test/source.js:410-412`) nimmt diese Form dazu.
- Tests setzen die Grenze „Anhang" auf 1 MB, den Mindestwert; ein Video von 20 MB geht
  dann in drei Anfragen über 20 Stücke (Stolperstein 189). Ein Testschalter stellt die
  Uhr. Rechte mit zwei echten Sitzungen (Stolperstein 56).

### A.3 Zusagen und Gegenproben

Jede Zusage bekommt einen Test und einen Rückbau in `counterproof.js`.

| V. | Zusage | Rückbau, der scheitern muss |
|---|---|---|
| 1a | Klick auf eine Datei ohne Vorschau öffnet das Menü und lädt nichts; eine Vorschau je Block; Office-Betrachter übersteht Neuzeichnen; Menü zeigt nur Erlaubtes; „Abbrechen" nimmt eine wartende Datei heraus | Download im Klick; Set statt Nummer; Neuzeichnen zerstört; Einträge ohne Rechte; Abbrechen ohne Wirkung |
| 1a | `#/item/x/file/y` einer Bilddatei öffnet das Vollbild im Eintrag, auch über die Marke; offene Ordner überstehen die Rückkehr aus der eigenen Ansicht | `renderFileView` für Bilder; Set in `renderDetail` |
| 1b | Range für Dateien in der Datenbank; Video ohne Vorschaubild zeigt Endung und ▶; Vorschaubild setzen: 403 für den Admin; es übersteht Papierkorb und Wiederherstellen | `res.send` ohne Range; `img` ohne Quelle; `mayChange` statt `selfOnly`; Standbild nicht im Umschlag |
| 2 | Verschieben behält die Nummer; Ordner löschen lässt Dateien stehen; `folders.test_day_id` bleibt leer, `PUT /api/folders/:id` nimmt keinen Testtag an | Neuanlegen; Kaskade auf `attachments`; Testtag angenommen |
| 2 | Fremder Ordner und Ordner eines anderen Eintrags: 403 beim Hochladen und Verschieben; Ordner und Standbild überstehen Export, Import, Papierkorb | `selfOnly` entfernt; Eintrag nicht verglichen; `folders` oder `still` nicht geschrieben |
| 3 | Ein Ordner je Testtag, zweite Zuweisung 409; fremder Testtag 403, der Admin verbindet nicht; Testtag löschen lässt den Ordner mit Namen stehen, auch wenn der Admin löscht; die Zuweisung übersteht Export (Format 22), Import und Papierkorb | `UNIQUE` entfernt; `selfOnly` am Testtag entfernt; `CASCADE` statt `SET NULL`; `testDay` nicht geschrieben |
| 3 | Klick auf den Kopf eines durch Sprung geöffneten Blocks klappt ihn zu, `BLOCKS.closed` bleibt | Klick schreibt `BLOCKS.closed` |
| 3 | Jede Datei in einen Ordner mit Testtag geht in Stücken, auch ein PDF; der Upload in einer Anfrage dorthin: 409; ein großes Video ohne Ordner mit Testtag: 413; Beginn einer Datei bis „Anhang" ohne Ordner mit Testtag: 409 | Weg nach der Größe gewählt; Ordner nicht geprüft; großes Video ohne Testtag angenommen |
| 3 | Umlagerung beim Verschieben und beim Zuweisen, samt voriger Fassung: danach `data` = `x''`, die Datei auf der Platte ist byte-gleich; eine Speicherung des Document Servers während der Umlagerung bleibt erhalten; zu wenig Platz: 507, nichts geändert; Absturz vor dem Commit: Datei bleibt in der Datenbank, der nächste Lauf löscht den Rest unter `upload/` und lagert um | Umlagerung entfernt; `data` nicht geleert; `saves` nicht verglichen; Platz nicht geprüft; Schritt 6 in 7.2 entfernt |
| 3 | Lösen der Zuweisung, Löschen von Testtag oder Ordner und Verschieben heraus lassen jede Datei auf der Platte (R18) | Umlagerung zurück in die Datenbank |
| 3 | Rückschrieb auf der Platte: neue Datei mit neuem Namen und Schlüssel; bei der ersten Speicherung einer Sitzung wird die bisherige vorige Fassung und die ältere steht in der Löschliste, bei jeder weiteren steht die alte aktuelle in der Löschliste und die vorige bleibt der Stand vor der Sitzung; höchstens eine vorige Fassung je Datei; Wiederherstellen tauscht die Besitzer, zweimal aufgerufen gilt der alte Stand; Text- und `.docx`-Vorschau und Document Server lesen die Datei ganz | Datei an ihrer Stelle überschrieben; ältere vorige Fassung bleibt; Größe aus `data.length`; 404 statt Entschlüsseln |
| 3 | Kaskade `items` → Löschliste → Datei weg, auch die vorige Fassung; Rollback lässt sie stehen; `UPDATE`/`DELETE` bei lebender Datei scheitert, Umhängen nur nach `previous_of` derselben Datei; `recursive_triggers` 0 | Trigger entfernt; `unlink` vor dem Commit; `disk_files_held`, `disk_files_kept` entfernt; Ausnahme ohne Vergleich mit `old.attachment_id` |
| 3 | Eine unbekannte Datei übersteht jeden Lauf; `/api/import` löst `data_stored` nicht auf; Wiederherstellen nach gelöschter `trash`-Zeile: 404, keine Datei ohne Inhalt | Abgleich statt Liste; Nummer an `/api/import`; `changes` nicht geprüft |
| 3 | Dateien ohne Verweis löschen: nur der Eigentümer-Admin, ein Admin bekommt 403; eine bekannte Datei, ein Name in der Löschliste, eine Datei ohne Kopie gleicher Länge im Backup-Ordner und `upload/` bleiben; ohne Backup-Ordner wird nichts gelöscht; während der Backup-Kopie 409 | `isAdmin` statt `isOwner`; Kopie nicht geprüft; Länge nicht verglichen; Abgleich ohne `disk_files`; Abgleich ohne `disk_files_gone`; `upload/` mit durchsucht; Sperre des Backups nicht genommen |
| 3 | Beginn eines großen Videos mit einer Endung außerhalb von `VIDEO_TYPES`: 415; erste Anfrage eines großen Videos, deren erste 12 Bytes kein Video sind, auch ein älteres MOV ohne `ftyp`: 415, der Upload ist gelöscht, nichts verschlüsselt; ein Video bis „Anhang" geht ohne diese Prüfung | Endung nicht geprüft; `typeFromBytes` nicht geprüft; Prüfung erst nach dem Verschlüsseln; Upload bleibt stehen; Prüfung für jede Datei |
| 3 | Client trennt nach dem Rumpf, zweite Anfrage mit gleichem Offset: 409, solange die erste läuft; danach ist die Datei `encLen(received)` lang und entschlüsselbar | Sperre bei `close` frei; `received ≠ n` im synchronen Teil nicht geprüft |
| 3 | Erneutes Stück 409, Datei unverändert; falsche Länge oder fehlende Datei: neuer Name und Schlüssel; Fortsetzen gelingt bei voller Zahl und bei 3 offenen Uploads | Stück bei `n < received` verschlüsselt; Längenprüfung entfernt; Zahlen vor der Suche geprüft |
| 3 | Fremde Nummer mit `Content-Length: 8388608` ohne Rumpf: sofort 404; fremder Upload 404, falscher Offset 409, zu viele Bytes 400, kein Platz 507, volle Zahl sperrt; scheitert `statfs`, kein 507 | Prüfung nach `express.raw`; jeweilige Prüfung entfernt; Fehler von `statfs` als 507 |
| 3 | Eine Datei aus `disk_files` unter `upload/` übersteht den stündlichen Lauf; scheitert `rename`, folgen 201 und das Nachholen im nächsten Lauf; ein Name, den der Server gerade schreibt, übersteht den Lauf | Abgleich ohne `disk_files`; Schritt 2 nur beim Start; Menge im Speicher nicht gelesen |
| 3 | `sweepDisk()` löscht nichts, solange eine Lesetransaktion den Checkpoint aufhält; der Abschluss committet mit `synchronous = FULL` | `checkpointed` nicht mit `log` verglichen; `FULL` entfernt |
| 3 | Ranges an 0, 1 MiB − 1, 1 MiB, 1 MiB + 1, letztem Byte, Suffix, offen, `bytes=0-1`; 416; HEAD entschlüsselt nichts und meldet eine fehlende Datei | Stückgrenze verschoben; Range zurechtgebogen; HEAD ohne `fstat` |
| 3 | Gekipptes Bit, vertauschte Stücke, gekürzt mitten im und genau an einem Stück: kein Byte des Stücks geht hinaus, auch beim Entschlüsseln im Ganzen; kein Klartext im Datenverzeichnis | `update()` vor `final()`; gelesene Länge nicht geprüft; Stück unverschlüsselt |
| 3 | Backup: nichts gelöscht während der Kopie; Liste = `disk_files` des Backups, auch wenn ein zweiter Prozess während `VACUUM INTO` löscht; 200 ohne Kopierbedarf; das Lockfile sperrt eine zweite Instanz; Aufräumen nur nach Muster | Pause entfernt; Liste aus der laufenden Datenbank; immer 202; Sperre nur im Speicher; Aufräumen ohne Muster |
| 3 | Export trägt eine Datei auf der Platte bis „Anhang" byte-gleich mit Inhalt, ein großes Video nur mit Namen; der Import legt die Dateien eines Ordners mit Testtag auf die Platte, die anderen in die Datenbank | Datei auf der Platte ohne Inhalt; großes Video mit Inhalt; Import alles in die Datenbank |
| 3 | `keytool.sh` enthält kein `rm -rf data` ohne Ausnahme für `files`; `entryTooLarge` zählt Dateien auf der Platte mit `size`, große Videos nicht; `raw` ohne `Content-Encoding`; Liste aus A.1 vollständig; `file_key` nur in zwei Anweisungen | Zeile 100 wie heute; großes Video mitgezählt oder Platte nicht gezählt; Kompression; Liste gekürzt; `SELECT *` |

### A.4 Abnahme im Browser

Der Prüfstand rechnet kein Layout und spielt kein Video (Stolperstein 29, 111). Von
Hand: Browser am Rechner, iPhone, Android; 344 bis 1440 px, dabei eine Testtagzeile mit
Ordner ohne Tags; ein Video von 2 GB (H.264 als MP4 und MOV, HEVC) über nginx ohne
Puffern und Cloudflare mit Abbruch, Fortsetzen, Neustart, Wiedergabe und Springen; am
iPhone Bildschirm sperren, Tab verworfen, Datei aus „Fotos" neu gewählt; nur Tastatur;
Screenreader; Backup mit drei Videos, Zurückspielen auf eine zweite Instanz; einem Ordner
mit Office-Datei einen Testtag zuweisen, die Datei im Document Server bearbeiten und die
vorige Fassung wiederherstellen.

### A.5 Quellen

Bestandsaufnahmen, Entwürfe, Befundlisten sowie Mess- und Prüfskripte der Sitzung vom
28.09.2026 liegen nicht im Repository. Die Zahlen stehen in 6.1, 6.4 und 7.2.
Nachgestellt wurde mit SQLite 3.45.1 und mit better-sqlite3-multiple-ciphers 11.10.0
(SQLite 3.49.2): Trigger bei Kaskade und Rollback, `VACUUM INTO` neben einem zweiten
Prozess, `synchronous` im WAL-Modus, Checkpoint neben einer Lesetransaktion; Trigger mit
drei Besitzern beim Umhängen und Tauschen, `OR IGNORE` unter einer Fremdschlüsselaktion.

## Anhang B. Vorgaben des Betreibers (27. und 28. September 2026)

Aus dem Gespräch vor dem Konzept. Ausgangslage: Videos von Testtagen, 0,5 bis 2 GB je
Testtag, heute 3 Testtage, absehbar etwa 3 je Jahr; sie sollen abspielbar sein.

| Nr. | Vorgabe |
|---|---|
| 1 | Große Videos liegen neben der Datenbank, verschlüsselt. Maskieren ist nicht nötig, weil Springen auch verschlüsselt geht. |
| 2 | AES-256-GCM in Stücken zu 1 MB, Stücknummer im Nonce, Datei-ID als AAD, ein zufälliger Schlüssel je Datei in der Datenbank. |
| 3 | Upload im Browser in Stücken zu 8 MB, fortsetzbar. Der Server prüft angekündigte Größe, Offset, freien Platz und die ersten Bytes; unfertige Uploads verfallen nach 24 h. Neue Grenze unter „Grenzen beim Hochladen", Vorgabe 2048 MB. |
| 4 | H.264 und HEVC (MOV) werden angenommen. Spielt der Browser nicht ab: Download. Das Standbild ist freiwillig, bei 10 % der Länge, dazu „Dieses Bild als Vorschau" im Player. |
| 5 | Der Backup-Knopf sichert die Datenbank und kopiert die Videos, die im Backup-Ordner fehlen. |
| 6 | Hochladen darf, wer den Testtag bearbeiten darf. |
| 7 | Mehrere Videos je Testtag. |
| 8 | Der JSON-Export nennt große Videos nur mit Namen. Endgültig gelöscht heißt: Datei weg. |
| 9 | Der Block „Dateien" wird neu aufgebaut: lose Dateien oben, darunter aufklappbare Ordner, darin quadratische Kacheln mit Vorschaubild und Zustandspunkt, nach dem Vorbild von Homarr. |
| 10 | Die Gruppen heißen „Ordner". |
| 11 | „Ordner hinzufügen" steht im Kopf des Blocks; hochgeladen wird über die „+"-Kachel im Ordner. |
| 12 | In einen Ordner dürfen Videos und Dateien. |
| 13 | Ordner und Testtag höchstens 1:1, zugewiesen im Ordnerkopf. Ein Symbol in der Testtagzeile nur bei zugewiesenem Ordner; ein Klick öffnet Block und Ordner und scrollt hin; der Ordnerkopf zeigt den Testtag als Link nach oben. |
| 14 | Beim Öffnen eines Eintrags sind alle Ordner zu. |
| 15 | Ein Klick auf eine Kachel öffnet die Vorschau unter der Kachelreihe; Bilder und Videos öffnen im Vollbild. |
| 16 | Ein Menü ⋯ an jeder Kachel und jedem Ordner, immer sichtbar. |
| 17 | Ordner löschen: Die Dateien darin werden lose Dateien. |
| 18 | Die Bildleiste oben bleibt, wie sie ist. |
| 19 | Nur neue Tabellen. |
| 20 | Erst Ordner und Kacheln für die vorhandenen Dateien, dann große Videos. |
