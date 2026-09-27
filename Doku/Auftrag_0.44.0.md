# Auftrag 0.44.0 — „Verweise auf Dateien und Fotos"

**Erteilt am 27. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist.

**Der Bau beginnt mit Abschnitt 0.** Die offenen Fragen dort werden gestellt,
bevor eine Zeile Code entsteht. Gebaut wird erst mit allen Antworten.

Grundlage ist der Abschnitt 0.44.0 in `Doku/Fahrplan.md`. Dieser Auftrag
entscheidet, was dort offen ist. Drei Punkte weichen vom Fahrplan ab
(Abschnitt 3); zwei davon stehen als Fragen in Abschnitt 0.

---

## 0. Vor dem Bau: die offenen Fragen

**So wird gefragt:**

- Gleich nach dem Start, vor BA 1, in Fragetafeln (`AskUserQuestion`).
- Höchstens vier Fragen je Tafel. Tafel 1 zuerst, dann Tafel 2.
- Die empfohlene Antwort steht zuerst und trägt „(Empfohlen)". Jede Antwort
  hat eine Zeile Beschreibung, was sie bewirkt.
- Die Antworten stehen im Änderungsprotokoll unter „Vorgaben des Betreibers",
  mit Datum.
- Weicht eine Antwort von der Empfehlung ab, gilt sie für alle Stellen in
  diesem Auftrag, die sich auf die Frage beziehen (Verweis „F1" usw.).
- Wird eine Tafel weggeklickt, wird nicht gebaut. Die Tafel wird noch einmal
  gezeigt, wenn der Betreiber es verlangt.

**Tafel 1:**

| Nr | Frage | Antworten, Empfehlung zuerst |
|---|---|---|
| F1 | Welche Dateien werden im Text zur Marke? | **Jede Datei**: der Klick zeigt dieselbe Vorschau wie in der Dateiliste, eine Datei ohne Vorschau wird heruntergeladen · **Nur Bürodateien und Bilder**, wie im Fahrplan; andere Dateien bleiben ein Link |
| F2 | Wie sieht die Marke einer Bilddatei aus? | **Zeichen und Dateiname, das Bild erst auf Klick**: Dateien haben kein Vorschaubild, die Marke müsste sonst die ganze Datei laden, bis 100 MB · **Kleines Vorschaubild in der Marke**, wie im Fahrplan; lädt die ganze Datei beim Öffnen des Eintrags |
| F3 | Wo erscheint die Vorschau nach dem Klick? | **Unter dem Absatz mit der Marke** · **Am Ende des Kommentars oder der Beschreibung** · **In einem Fenster über der Seite** |
| F4 | Was zeigt die Marke eines Fotos? | **Kachel und Titel des Eintrags** · **Nur die Kachel** |

**Tafel 2:**

| Nr | Frage | Antworten, Empfehlung zuerst |
|---|---|---|
| F5 | Wie groß ist der kleine Betrachter einer Bürodatei? | **360 px hoch** · **480 px hoch** · **Halbe Fensterhöhe** |
| F6 | Ein Foto aus einem anderen Eintrag: was tut der Klick? | **Wechselt zu diesem Eintrag und öffnet die Bildansicht an dem Foto** · **Öffnet nur die Bildansicht über dem aktuellen Eintrag** |
| F7 | Wo steht „Link kopieren" an der Dateizeile? | **Beim Überfahren, wie ⤢ und ↓; auf dem Telefon immer** · **Immer sichtbar** |

---

## 1. Das Ziel

- Die Adresse einer Datei oder eines Fotos dieser Instanz wird in Kommentar
  und Beschreibung zur Marke, wie heute die Adresse eines Eintrags oder
  Kommentars.
- Ein Klick auf die Marke einer Datei klappt die Vorschau auf (F3). Eine
  Bürodatei zeigt einen kleinen Betrachter des Document Servers. Er lädt erst
  auf diesen Klick.
- Die Marke eines Fotos zeigt seine Kachel. Ein Klick öffnet die Bildansicht
  an diesem Foto.
- An der Dateizeile und in der Bildansicht steht „Link kopieren".
- Ohne Document Server geht alles außer dem Betrachter; Bürodateien zeigen
  dann die Vorschau wie in der Dateiliste.

---

## 2. Der Anlass

| Anlass | Stand am 27. September 2026 |
|---|---|
| Verweise heute | `markupRefOf()` (`public/app.js`:1992) erkennt `#/item/<Eintrag>` und `#/item/<Eintrag>?c=<Kommentar>` und liefert die Schlüssel `i<Eintrag>` und `c<Kommentar>`. `markupRefNode()` (`public/app.js`:2139) zeichnet die Marke. `/api/comment-refs` (`server.js`:3318) liefert Titel und Nummer, je Art höchstens 200 |
| Adresse einer Datei | `#/item/<Eintrag>/file/<Datei>` zum Ansehen, `…/edit` zum Bearbeiten, beide seit 0.43.2 (`FILE_PATTERN`, `public/app.js`:6615) |
| Adresse eines Fotos | keine. Die Bildansicht öffnet `openLightbox()` (`public/app.js`:4184) ohne eigene Adresse |
| Vorschau in der Dateiliste | `buildPreview()` (`public/app.js`:6001) kennt `image`, `pdf`, `office`, `text`, `docx`. `drawAtts()` baut offene Betrachter beim Neuzeichnen mit `destroyEditor()` ab (`officeViewers`, `public/app.js`:5921) |
| Link kopieren | nur am Kommentar (`entry.copyCommentLink`), über `copyText()` (`public/app.js`:6500) |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 26. September 2026 | Verweise auf Dateien und Fotos in Kommentar und Beschreibung, als kleine Vorschau |
| 26. September 2026 | Der kleine Betrachter einer Bürodatei lädt erst nach dem Klick |
| 26. September 2026 | Die erste Seite einer Bürodatei als Bild gehört nicht dazu |

### Abweichungen vom Fahrplan

| Fahrplan | dieser Auftrag | Grund |
|---|---|---|
| Eine Bilddatei am Eintrag zeigt in der Marke ein kleines Vorschaubild | nach F2; empfohlen: Zeichen und Dateiname, das Bild auf Klick | Dateien haben kein Vorschaubild. Die Marke müsste die ganze Datei laden, bis 100 MB |
| Marken für Bürodateien und Bilddateien | nach F1; empfohlen: Marken für jede Datei | `buildPreview()` kennt jede Art. Eine Ausnahme wäre eine zweite Regel |
| Adresse der Datei `…/file/<Datei>` | auch `…/file/<Datei>/edit` wird zur Marke derselben Datei; der Klick zeigt die Vorschau, nicht den Editor | Seit 0.43.2 gibt es beide Adressen |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.44.0**, MINOR, Schema: nein, Austauschformat: 20 bleibt |
| Schlüssel im Browser | `f<Datei>` und `p<Foto>`, neben `i` und `c` |
| Adresse eines Fotos | `#/item/<Eintrag>/photo/<Foto>`, neues Muster `PHOTO_PATTERN` |
| Gilt das auch für Videos am Eintrag? | Ja. Videos stehen in `photos` mit `kind = 'video'`; ihre Kachel trägt das Zeichen ▶ |
| Wo werden Marken erkannt? | In Kommentaren und in der Beschreibung, wie heute. Nicht in der Linkliste |
| Welche Dateien | nach F1 |
| Marke einer Datei | Klasse `markup-ref file`, das Zeichen der Dateiliste (▥, ▣, ▤, ▪) und der Dateiname; bei Bilddateien nach F2. Ein selbst gesetzter Name im Link geht vor, wie heute |
| Marke eines Fotos | Klasse `markup-ref photo`, die Kachel (`/api/photos/<Foto>/raw?size=thumb`) 40 px hoch; der Titel des Eintrags nach F4 |
| Klick auf eine Datei im Eintrag | klappt die Vorschau auf, wo F3 es sagt; empfohlen unter dem Absatz, der die Marke trägt (`p`, `li` oder Zitat). Ein zweiter Klick klappt zu. Jede Marke hat ihre eigene Vorschau |
| Klick auf eine Datei außerhalb eines Eintrags | Der Link öffnet die Adresse, wie heute bei Kommentaren |
| Größe der Vorschau | nach F5, empfohlen 360 px. Der Betrachter einer Bürodatei ist `type: 'embedded'`, auch am Rechner; `startOffice()` bekommt dafür einen Parameter und schickt `mobile=1` |
| Kopf der Vorschau | Dateiname, ⤢ zur eigenen Ansicht (nur Bürodateien), ↓ zum Download |
| Datei an einem anderen Eintrag | dieselbe Vorschau; die Rechte sind dieselben wie an der eigenen Datei |
| Klick auf ein Foto desselben Eintrags | `openLightbox()` an diesem Foto, ohne Adresswechsel |
| Klick auf ein Foto eines anderen Eintrags | nach F6; empfohlen: wechselt zu `#/item/<Eintrag>/photo/<Foto>` |
| Die Adresse eines Fotos beim Laden | `route()` zeichnet den Eintrag und öffnet die Bildansicht an dem Foto. Beim Schließen setzt `history.replaceState` die Adresse auf den Eintrag zurück. Gibt es das Foto nicht, steht der Eintrag da und ein Hinweis `entry.photoGone` |
| Neuzeichnen | Kommentare und Beschreibung bauen offene Betrachter mit `destroyEditor()` ab, wie `drawAtts()`. Eine geöffnete Vorschau schließt dabei |
| Gelöschte Datei, gelöschtes Foto | Marke `gone` mit `entry.refGone` („gelöscht"), ohne Klick, wie beim Kommentar |
| Link kopieren an der Datei | Knopf mit `ICON_LINK` in der Dateizeile, sichtbar nach F7. Er kopiert die Adresse zum Ansehen, nie `…/edit` |
| Link kopieren am Foto | Knopf mit `ICON_LINK` in `lb-tools` der Bildansicht. Er kopiert die Adresse des gezeigten Fotos, auch nach dem Blättern |
| Meldung nach dem Kopieren | `card.linkCopied`, wie bisher |
| Wer sieht die Vorschau? | Wer angemeldet ist, wie `/api/attachments/:id/raw` und `/api/photos/:id/raw`. Ein Verweis zeigt nichts, was der Leser nicht ohnehin sehen darf |
| Suchtreffer | Der Dateiname in der Marke wird wie ein Titel hervorgehoben |
| Neues Modul im Prüfstand | `test/release_044.js`, wie bei 0.41 bis 0.43 |

---

## 4. Die Bauabschnitte

### BA 1 — `/api/comment-refs` in `server.js`

Zwei neue Parameter, je höchstens 200 Nummern, wie `ids` und `items`:

| Parameter | Zeile der Antwort |
|---|---|
| `files=<Datei>,…` | `{ key: 'f<Datei>', id, itemId, itemTitle, filename, size, preview }` |
| `photos=<Foto>,…` | `{ key: 'p<Foto>', id, itemId, itemTitle, kind }` |

- `preview` wird bestimmt wie in `detail()`: `office`, wenn der Document
  Server an ist und die Endung passt, sonst `attachments.previewKind()`.
  Den Code dafür teilen sich beide Stellen; er steht einmal.
- Nummern, die es nicht gibt, fehlen in der Antwort. Der Browser setzt sie
  dann auf `gone`.
- Die Abfragen lesen keine Blobspalte.

### BA 2 — Erkennen und Laden im Browser

- `markupRefOf()` erkennt zusätzlich `FILE_PATTERN` (mit und ohne `/edit`)
  und `PHOTO_PATTERN` und liefert `f<Datei>` und `p<Foto>`.
- `markupRefAsk()` schickt `files` und `photos` mit. Die Grenze in
  `markupRefLoad()` steigt von 400 auf 800, je Art 200.
- `route()` kennt `PHOTO_PATTERN` (Abschnitt 3).

### BA 3 — Die Marken

- `markupRefNode()` zeichnet je Schlüssel die Marke aus Abschnitt 3.
- Die Marke einer Datei trägt `data-file` mit der Nummer, die eines Fotos
  `data-photo`.
- Die Kachel eines Fotos lädt mit `loading="lazy"`.

### BA 4 — Die Vorschau

- Eine Funktion `refPreview(row, mark)` baut den Kasten mit Kopf (Abschnitt 3)
  und ruft für den Inhalt `buildPreview()` mit einem Objekt aus der Zeile von
  `/api/comment-refs`.
- `buildPreview()` und `startOffice()` bekommen je einen Parameter für die
  kleine Form: Höhe nach F5, `embedded`.
- Offene Betrachter stehen in derselben Liste wie die der Dateiliste
  (`officeViewers`) und werden beim Neuzeichnen von Kommentaren und
  Beschreibung abgebaut.
- Kein Betrachter entsteht, bevor geklickt wurde. Das prüft eine eigene
  Prüfung (BA 7).

### BA 5 — Link kopieren

- Dateizeile: Knopf `.alink` vor ⤢, Titel `entry.copyFileLink`.
- Bildansicht: Knopf `.lb-btn link`, Titel `entry.copyPhotoLink`.
- Beide über `copyText()` mit der ganzen Adresse
  (`location.origin + location.pathname + …`).

### BA 6 — Texte, Stilblatt, Handbuch

**Neue Schlüssel** in allen drei Sprachen:

| Schlüssel | Deutsch |
|---|---|
| `entry.copyFileLink` | Link auf diese Datei kopieren |
| `entry.copyPhotoLink` | Link auf dieses Foto kopieren |
| `entry.refFileHint` | Vorschau auf- und zuklappen |
| `entry.refPhotoHint` | Foto öffnen |
| `entry.photoGone` | Dieses Foto gibt es nicht mehr. |

Englisch höchstens 1,15-mal so lang wie Deutsch. Türkisch nach den Regeln in
`test/release_031.js`.

**Stilblatt:** `.markup-ref.file`, `.markup-ref.photo` mit Kachel,
`.ref-preview` mit Kopf und 360 px, `.alink`, `.lb-btn.link`.

**`manual-de.md`:** im Abschnitt zu Kommentaren ein Absatz „Verweise auf
Dateien und Fotos"; bei „Tags, Dateien, Links" ein Satz zu „Link kopieren".

### BA 7 — Der Prüfstand

`test/release_044.js`, in `testbench.js` hinter `release_043`. Mit eigener
Instanz, Portbasis 7340 wie `release_041` bis `release_043`, und dem
gestellten Document Server aus `release_043`.

| Gruppe | Prüfungen, mindestens |
|---|---|
| Verweise: der Server | `files` und `photos` liefern die Felder aus BA 1; unbekannte Nummern fehlen; je Art 200; ohne Anmeldung 401; kein Blob in der Abfrage |
| Verweise: die Marken | Datei, Datei mit `/edit`, Foto, Video, gelöscht, fremde Adresse bleibt Link, selbst gesetzter Name geht vor, Suchtreffer im Dateinamen |
| Verweise: die Vorschau | kein Betrachter vor dem Klick; Klick öffnet unter dem richtigen Absatz; zweiter Klick schließt; `mobile=1` beim Betrachter; `destroyEditor()` beim Neuzeichnen; PDF, Bild, Text und `docx` wie in der Dateiliste |
| Verweise: Fotos und Adresse | Foto desselben Eintrags öffnet die Bildansicht ohne Adresswechsel; fremdes Foto wechselt die Adresse; `#/item/…/photo/…` beim Laden; Schließen setzt die Adresse zurück; fehlendes Foto zeigt `entry.photoGone` |
| Verweise: Link kopieren | Dateizeile kopiert die Adresse zum Ansehen; Bildansicht kopiert das gezeigte Foto, auch nach dem Blättern |

**Gegenproben**, je eine: `/api/comment-refs` übergeht `files` · übergeht
`photos` · der Betrachter lädt schon beim Zeichnen · die Vorschau erscheint
am Ende des Kommentars statt unter dem Absatz · `mobile=1` fehlt · kein
`destroyEditor()` beim Neuzeichnen · `route()` kennt `PHOTO_PATTERN` nicht ·
das Schließen lässt die Adresse des Fotos stehen · der Knopf an der Datei
kopiert `…/edit` · die Bildansicht kopiert das erste statt des gezeigten Fotos.

**Listen, die mitgehen:** die festen Zahlen in `test/source.js`,
`test/selfcheck.js` und `test/ui_language.js`; `release_044` in den Listen
von `testbench.js` und `test/selfcheck.js`.

### BA 8 — Dokumentation und Zahlen

- **`Doku/Aenderungsprotokoll_0.44.0.md`** mit den Zahlen am fertigen Stand.
- **`CHANGELOG.md`** — `## [0.44.0]`, ohne Kasten: es gibt nichts zu tun.
- **`Doku/Fahrplan.md`** — die Zeile 0.44.0 durchstreichen und füllen; der
  Abschnitt bekommt oben „GEBAUT am …" und die drei Abweichungen.
- **`Doku/Fehler_und_Ideen.md`** — die Zeile 0.44.0 als gebaut.
- **`package.json`** auf `0.44.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand: Prüfungen, Rückbauten,
  Kommentarzeilen je Datei und Summe, Schlüssel der Sprachdateien,
  Regelzeilen des Stilblatts, `innerHTML`-Zuweisungen.
- **Der Fingerprint** mit `node tools/publish.js --trocken` am sauberen
  Arbeitsbaum, dann in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Die Bauumgebung erreicht `office.dmrts.de` nicht. Der Betreiber prüft nach dem
Einspielen:

1. In einem Kommentar die Adressen einer `.docx`, eines PDF und eines Fotos
   einfügen, je aus „Link kopieren".
2. Die Marken zeigen Zeichen und Dateiname, das Foto seine Kachel.
3. Klick auf die `.docx`: der kleine Betrachter erscheint unter dem Absatz,
   am Rechner und auf dem Telefon. Vorher lädt nichts vom Document Server.
4. Klick auf das Foto: die Bildansicht an diesem Foto. Der Link eines Fotos
   aus einem anderen Eintrag öffnet diesen Eintrag mit der Bildansicht.

Zeigt Euro-Office den Betrachter mit `embedded` am Rechner nicht, geht der
Befund in eine PATCH-Runde.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Die erste Seite einer Bürodatei als Bild | Vorgabe des Betreibers. Das Bild müsste erzeugt, gespeichert und nach jeder Bearbeitung neu gebaut werden |
| Verweise nach Import und Papierkorb umschreiben | Beide vergeben neue Nummern. Das gilt heute schon für Verweise auf Kommentare und bleibt so |
| Ein Menüpunkt „Verweis einfügen" in der Auszeichnung | Die Adresse aus „Link kopieren" einzufügen genügt |
| Marken in der Linkliste | Die Linkliste zeigt Adressen, keinen Text |
| Ein Vorschaubild für Dateien | siehe Abschnitt 3, Abweichungen |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Ohne Verweise auf Dateien und Fotos verhalten sich Kommentare und
   Beschreibung wie in 0.43.2.
3. Kein Betrachter des Document Servers entsteht, bevor jemand auf eine Marke
   klickt.
4. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
5. Kein Pull Request, wenn keiner verlangt wurde.
6. Die Fragen aus Abschnitt 0 werden vor BA 1 in Fragetafeln gestellt.
   Kommt beim Bauen eine neue Frage auf, die hier nicht beantwortet ist,
   wird sie ebenso in einer Fragetafel gestellt. Antwortet niemand, wird der
   einfachere Weg gewählt, der kein Verhalten ändert. Die Entscheidung steht
   im Änderungsprotokoll.
