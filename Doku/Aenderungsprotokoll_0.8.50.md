# Änderungsprotokoll 0.8.50 — „Kurzvideos am Fotoplatz"

**Rohstoff für die Dokumentenpflege.**

**0.8.50 — Abdruck `3cb528d6`**

Die nächste Runde des Stufenplans, und **keine Stufe des
Mehrbenutzerbetriebs** — der ist mit G4 bis auf H und I gebaut. Es ist eine
**Datenbankstufe**: vollständige DDL in `db.js`, ein Umstiegsblock mit Marken,
ein eigener Prüfabschnitt, ein Eintrag unter „Vorgemerkt für 1.0". Die
Sicherung des Datenverzeichnisses gehört in den Einspielweg.

**Was sich ändert, in einem Satz.** Ein **Kurzvideo bis 20 MB** liegt in
derselben Reihe wie die Fotos, mit einem **Standbild**, das der Browser des
Hochladenden erzeugt — der Server öffnet nie ein Video.

**Die Entscheidung, an der das Ganze hängt, ist baulich: `ffmpeg` kommt nicht
ins Abbild.** Vier Folgen, alle gewollt: keine neue Abhängigkeit; der Server
speichert Bytes und liefert Bytes; wer ein Video nicht abspielen kann, kann es
nicht hochladen; und das Standbild ist **nicht überprüfbar** — es ist eine
Vorschau, keine Aussage. Der letzte Satz steht als Kommentar am Schema, damit
ihn niemand später für einen Beleg hält.

**Dieselbe Tabelle, keine zweite.** Fotos und Videos stehen in **einer**
Reihenfolge; zwei Tabellen hießen zwei sortierte Listen und damit zwei Quellen
für die Frage, was das Hauptbild ist. Daraus folgt, dass jede vorhandene Regel
von selbst greift — und zwar wirklich: **fünf** der acht Zeilen aus
Abschnitt 3a des Videopapiers gelten ohne einen Handgriff (Kaskade,
Reihenfolge, Verschlüsselung, Sicherung und, bis auf die neue Route, die
Rechte). **Drei gelten nicht von selbst** und sind gebaut worden: Löschdialog,
Kennzahlen und die Auslieferung. Eine neunte Stelle, die im Papier gar nicht
steht, greift sogar **falsch** — siehe Stolperstein 109.

**Eine neue schreibende Route.** `POST /api/items/:id/videos` hinter
`nurEintragVerfasser` — `F_ROUTEN` geht von **46 auf 47**, die erste seit
langem. Die vorhandene Fotoroute zu erweitern hätte ihren `fileFilter` auf
`^image\/` lockern müssen, und das nähme die erste, ausdrücklich nicht tragende
Schranke dem **Fotoweg** mit ab.

**Formatnummer 9 → 10.**

---

## 1. Was gebaut wurde, je Datei

### `db.js` (+65/−1 Zeilen)

**Die DDL.** `photos` bekommt zwei Spalten:

```sql
art TEXT NOT NULL DEFAULT 'bild',   -- 'bild' | 'video'
dauer INTEGER,                      -- Sekunden, nur bei Video
```

Darüber steht als Kommentar die **Tabelle aus Abschnitt 3 des Papiers** — was
`data`, `thumb`, `medium`, `focus_x`/`focus_y` und `dauer` bei welcher Art
bedeuten. Sie ist die einzige Stelle, an der erklärt ist, warum `data` je nach
`art` etwas anderes trägt. Daneben steht, warum es **keinen `CHECK`** gibt:
nicht weil SQLite ihn nicht nähme (Stolperstein 107), sondern weil die Menge
der erlaubten Werte sonst zweimal stünde.

**`umstieg0850()`** — der **fünfte** markierte Block, mit den Marken der
Bauregel, einmalig, wiederholbar und im Normalfall stumm. Er ist der erste
Block mit **zwei** Spalten und deshalb der erste, der **jede einzeln abfragt**
(Stolperstein 108). Die Meldung nennt, was wirklich ergänzt wurde:
`photos um art und dauer ergaenzt (Umstieg auf 0.8.50); N Zeilen stehen auf der
Vorgabeart 'bild'.` Die Vorgabe kommt aus dem `DEFAULT` der Spalte, nicht aus
einem `UPDATE`; `dauer` bleibt bei den Bestandszeilen `NULL`.

`umstieg0850` steht mit derselben Marke in `module.exports`.
**`ordneBestandZu()` ist nicht angefasst worden** — ein Foto gehört seinem
Eintrag, nicht einem Verfasser (Änderungsprotokoll 0.8.31, Abschnitt 7:
*„Fotos sind weiterhin kein Träger"*). Die Frage ist gestellt und verneint, und
eine Prüfung hält es fest.
**`idx_photos_item` bleibt, wie er ist.** Ein Index über `art` brächte nichts:
die Zeilen je Eintrag sind einstellig, und gefiltert wird nirgends nach Art.

### `anhaenge.js` (+98/−8 Zeilen)

**`VIDEO_TYPEN`** — eine Liste für beide Richtungen: `mp4`, `m4v`, `webm`,
`mov`. Sie speist `TYP_NACH_ENDUNG` (für Anhänge, Endung → Typ) und über
`ENDUNG_NACH_TYP` die Namensgebung in `setzeBildKopfzeilen()` (Typ → Endung).
Zwei Listen für dieselbe Frage liefen auseinander. Der bisherige Einzeleintrag
`mp4: 'video/mp4'` ist darin aufgegangen.

**`typAusBytes()`** erkennt zusätzlich `video/mp4`, `video/webm` und
`video/quicktime`. Die ISO-BMFF-Erkennung war für AVIF schon da und bekommt
eine **Positivliste von Marken** (`ISO_MARKEN_MP4`: `isom`, `iso2`, `iso4`,
`iso5`, `iso6`, `mp41`, `mp42`, `mmp4`, `avc1`, `dash`, `cmfc`, `M4V `,
`M4VH`, `M4VP`) plus `qt  ` für QuickTime; WebM am EBML-Kopf
`1A 45 DF A3`. Bewusst keine Regel „alles, was nicht Bild ist": eine unbekannte
Marke — darunter die Bildformate `heic` und `mif1` — bleibt unerkannt und geht
als Download heraus.

**`INLINE_ERLAUBT`** bekommt die drei Videotypen. Ohne sie ginge ein Video als
`attachment` heraus und würde heruntergeladen statt abgespielt. Die
hinzunehmende Folge steht als Kommentar daneben: damit darf auch ein **Anhang**
mit Videoendung inline heraus, wenn er ausdrücklich so angefordert wird — die
Oberfläche fordert das nur für Bild und PDF an.

**`bereichAus(kopf, groesse)`** — neu. Liest einen `Range`-Kopf und liefert
`null` (kein Bereich verlangt), `{ ungueltig: true }` (→ 416) oder
`{ von, bis }`. Mehrere Bereiche in einer Anfrage werden nicht beantwortet,
sondern wie „kein Bereich" behandelt; das lässt die Norm ausdrücklich zu.
Zurechtgerückt wird nur das eine, was die Norm so will: ein Ende hinter dem
Dateiende meint das Dateiende.

**`sicherheitsRegel()` ist unverändert.** Nachgemessen im echten Chromium:
`sandbox` behindert das Abspielen nicht — eingebettet nicht, und direkt im Tab
geöffnet ist der Bildschirmabzug mit und ohne `sandbox` bytegleich.

### `server.js` (+224/−26 Zeilen)

**`CSP_ANWENDUNG`** bekommt `media-src 'self' blob:`. Die Begründung steht
ausgeschrieben daneben (siehe Abschnitt 2, C).

**`VIDEO_MAX = 20 * 1024 * 1024`** an genau einer Stelle, mit der gemessenen
Begründung daneben — wie `ANHANG_MAX` und `GEWICHT_MIN`.

**`videoUpload`** — eigener `multer` mit zwei benannten Feldern (`video`,
`standbild`) und einem `fileFilter`, der je Feld die grobe erste Schranke am
gemeldeten Typ zieht (`^video\/` bzw. `^image\/`).

**`POST /api/items/:id/videos`** hinter `nurEintragVerfasser`, der Wächter vor
`multer` wie am Fotoweg. Im Rumpf: Eintrag vorhanden (404), beide Teile da
(400), **`typAusBytes()` muss einen der drei Videotypen liefern** (400),
`rasterBild()` am Standbild (400). `dauer` wird aus dem Rumpf gelesen und auf
1 bis 86 400 Sekunden beschnitten — sie ist eine Angabe wie der gemeldete Typ.
`makeVariants()` läuft über das **Standbild**; auf die Videodatei wird
`rasterBild()` ausdrücklich nicht angewandt, und der Grund steht daneben.
`sort_order` zählt weiter wie bisher, `touch.run()` wie beim Foto.

**`GET /api/photos/:id/raw`** — die Kopfzeilen kommen unverändert aus
`anh.setzeBildKopfzeilen()`; der Wächter „server.js setzt den Content-Type an
keiner Stelle selbst" bleibt grün. Dazu: `Accept-Ranges: bytes` und die
Bereichsauslieferung, **nur bei `art = 'video'` und nur ohne `size=`**. Ein
Foto bekommt keine einzige zusätzliche Kopfzeile.

**`qPhotos`** liefert `art` und `dauer` mit — an `detail()` **und** an
`/api/items`.

**`/api/items`**: `photoCount` zählt nur noch Bilder, `videoCount` kommt
daneben. `mainPhoto` bleibt die erste Zeile, gleich welcher Art.

**`GET /api/items/:id/bestand`**: `fotos` zählt nur noch Bilder, `videos` kommt
daneben.

**`GET /api/stats`**: `photoCount`/`photoBytes` zählen nur noch Bilder,
`videoCount`/`videoBytes` kommen daneben.

**`GET /api/export`**: Schalter `videos=1`, Vorgabe aus. Jede Fotozeile trägt
jetzt `art`; eine Videozeile trägt zusätzlich `dauer` und — nur mit dem
Schalter — `data_base64` **und `standbild_base64`**. Ohne den Schalter bleibt
die Zeile als **Marke ohne Bytes** stehen. Formatnummer **10**.

**`POST /api/import`**: entscheidet über das **Vorhandensein der Felder**,
nicht über die Formatnummer. Eine Zeile ohne `data_base64` wird übersprungen
und, wenn sie ein Video ist, gezählt (`videosOhneDatei`). Die Varianten eines
Videos kommen aus `standbild_base64`, nie aus `data`; ist das Standbild
unlesbar oder fehlt es, wird die Zeile übergangen und gezählt
(`videosUnlesbar`). `stats.videos` kommt neben `stats.photos`. Beide Zahlen
stehen in der Antwort **und** im Protokoll.

**`backfillVariants()`** fasst nur noch Bilder an — siehe Stolperstein 109.

### `public/app.js` (+186/−25 Zeilen)

`istVideo(p)` und `dauerText(s)` als Ableitungen; `hatOriginal()` gibt am Video
`false` zurück. Vorschauleiste mit `▶` und Länge; `drawViewer()` zeigt am
Videoplatz ein `<video controls playsinline preload="metadata">` mit dem
Standbild als `poster` — außer im Ausschnittmodus, dort steht das Standbild als
`<img>`. Vollbild mit einem eigenen `<video class="lb-video">`; `halteAn()`
pausiert, nimmt die Quelle weg und ruft `load()` — beim Blättern **und** beim
Verlassen. Karte mit `card-spielmarke` und `bestandText()`. Löschdialog,
Kennzahlenkarte, Exportkarte und die Meldung nach dem Import sind nachgezogen.

**`standbild(datei)`** — die Funktion aus Abschnitt 4 des Papiers, mit zwei
Ergänzungen: ein Video **ohne Bildmaße** wird abgewiesen (eine Zeichenfläche
der Größe null ergäbe gar kein Standbild), und ein `null` aus `toBlob()`
ebenso. `uploadFiles()` teilt die Auswahl auf: Bilder gebündelt in einem
Vorgang wie bisher, Videos einzeln, jedes mit seinem Standbild. Was schon
durchging, bleibt bei einem Fehler stehen und wird angezeigt.

### `public/style.css` (+47/−0 Zeilen)

`.card-spielmarke`, `.thumb .spielmarke` / `.lb-thumb .spielmarke`,
`.thumb .dauer`, `.viewer video`, `.lb-stage video`. Keine neue Farbe: die
Marken bekommen denselben dunklen Träger wie Stern und Zähler.
`pointer-events: none` an den Marken, sonst fingen sie das Ziehen zum
Umsortieren ab.

### `pruefung.js` (+1082/−18 Zeilen)

Vier neue Gruppen und Ergänzungen an dreien; Einzelheiten in Abschnitt 5.

### `auth.js`

Unberührt.

---

## 2. Abweichungen und Entscheidungen

### A. Der Typ kommt aus den ersten Bytes, nicht nach Endung

Abschnitt 6 des Papiers sagt: *„Der ausgelieferte Typ kommt aus der
Positivliste in Abschnitt 5, **nach Endung**"*. **`photos` speichert aber
keinen Dateinamen** — es gibt dort keine Endung. Der Fotoweg entscheidet seit
0.8.20 nach den ersten Bytes, und für ein Video geht das genauso.

**An echten Dateien nachgestellt**, nicht geglaubt: eine im Browser
aufgenommene MP4 beginnt mit `00 00 00 24 66 74 79 70 69 73 6F 6D` — Länge,
`ftyp` an Byte 4, Marke `isom` an Byte 8. Eine echte WebM beginnt mit
`1A 45 DF A3`. Beide Marken sitzen, wo das Papier sie vermutet.

**Nicht belegen konnte ich `qt  `** — im Baucontainer stand kein echtes
QuickTime-Video zur Verfügung und kein Werkzeug, eines zu erzeugen. Die Marke
steht aus der Formatbeschreibung im Quelltext und wird auf Byte-Ebene geprüft;
die beiden Prüffixtures des Prüfstands sind die echte MP4 und die echte WebM.
**Das ist die einzige Stelle dieser Runde, die auf einer Angabe statt auf einer
Messung steht.**

Die Endungsliste steht trotzdem in `anhaenge.js` und nicht in `server.js` — sie
benennt die ausgelieferte Datei und ist dieselbe Liste, die die Anhänge
benutzen.

### B. Bereiche werden geliefert — das Papier widerspricht sich

Abschnitt 6, Punkt 5 verlangt `Accept-Ranges: none`. Abschnitt 10 sagt über
denselben Gegenstand: *„iOS Safari spielt ein Video überhaupt nicht ab, wenn
der Server keine Bereiche anbietet."* Beides kann nicht stimmen.

**Entschieden für die Bereiche.** Der Blob liegt beim Lesen ohnehin ganz im
Arbeitsspeicher, ein `206` mit `Content-Range` auf einem Buffer ist ein Dutzend
Zeilen, und ein Video, das auf dem Handy nicht abspielt, ist genau der kaputte
Platz, den Abschnitt 4 vermeiden will. Chromium spielt auch mit
`Accept-Ranges: none` durch — für iOS stand kein Gerät zur Verfügung, und genau
das ist der Grund, es zu bauen statt zu wetten.

**Nur am Video und nur an der ganzen Datei.** An einem Foto verschiebt sich
keine Kopfzeile; der Einspielweg vergleicht sie mit `curl -I` vor und nach dem
Einspielen. Ungültige Bereiche bekommen **416** mit `Content-Range: bytes */N`,
nicht ein zurechtgebogenes Stück: ein Abspieler, der etwas anderes bekommt als
er verlangt hat, zeigt Bildsalat statt eines Fehlers.

### C. `media-src` fehlte in der Sicherheitsregel — ohne es geht gar nichts

Die Regel der Anwendung hatte **kein `media-src`**; damit greift
`default-src 'self'`. Die Standbildfunktion setzt
`v.src = URL.createObjectURL(datei)` auf ein `<video>`, und eine
`blob:`-Adresse an einem `<video>` fällt unter `media-src`, **nicht** unter
`img-src`.

**Nachgestellt im echten Chromium, in beiden Richtungen.** Ohne die Erweiterung:
`Refused to load media from 'blob:…'`, `MEDIA_ELEMENT_ERROR` code 4, und das
Standbild entsteht nicht. Mit `media-src 'self' blob:`: Standbild 64×48, JPEG
776 Bytes. **Ohne diesen Punkt wäre überhaupt kein Video hochladbar gewesen** —
und zwar wortlos.

Beide Angaben sind nötig: `'self'` trägt die Wiedergabe aus der eigenen Anlage,
`blob:` das Standbild vor dem Hochladen. Der Prüfstand hält jede einzeln fest,
mit einer Gegenprobe auf das Muster selbst.

### D. Kein Videoeintrag ohne Videodatei — aber eine Marke in der Datei

Abschnitt 9 des Papiers will bei ausgeschaltetem Schalter „einen Platz mit
Standbild und dem Vermerk, dass die Datei fehlt". **Das geht mit dem heutigen
Schema nicht auf:** `photos.data` ist `NOT NULL`. Ein Platz ohne Videodatei
müsste entweder das Standbild in `data` tragen — dann lieferte
`GET /api/photos/:id/raw` ein JPEG für eine Zeile, die `art = 'video'` sagt,
und der Abspieler bliebe schwarz —, oder `art` bekäme einen dritten Wert, oder
es käme eine weitere Spalte dazu. Alle drei kosten mehr, als der gewonnene
Platzhalter wert ist.

**Gebaut wurde eine Verfeinerung des Vorschlags aus dem Auftrag:** kein
Videoeintrag ohne Videodatei, **aber die Zeile bleibt als Marke in der Datei
stehen** — mit `art`, `dauer` und Fokus, ohne Bytes. Nur so kann der Import
nennen, wie viele Videos gefehlt haben; ohne die Marke wüsste er es gar nicht,
und der Verlust wäre still. Gemeldet wird in der Antwort und im Protokoll,
dieselbe Haltung wie bei unbekannten Verfassernamen (0.8.30) und ungültigen
Gewichten (0.8.40): nicht abbrechen, melden.

**Der Preis steht in der Antwort und in der README:** stand das Video an erster
Stelle, wird das nächste Foto zum Hauptbild.

### E. Das Standbild muss eigens in die Exportdatei — im Papier fehlt das

Der Import erzeugt die Varianten aus `data`. Bei einem Video stünde dort die
Videodatei; `sharp` liefe in einen Fehler, beide Varianten kämen leer zurück,
und **das Standbild wäre beim Einspielen verloren**. Die Exportdatei trägt
deshalb `standbild_base64` (die `medium`-Variante), und der Import erzeugt
daraus wie bei jedem Foto Kachel und mittlere Variante. Ein Video, dessen
Standbild sich nicht durch `sharp` lesen lässt, wird übergangen und genannt —
dieselbe Regel wie beim Hochladen.

### F. Der Ausschnittmodus bleibt am Videoplatz bedienbar

Der Fokuspunkt wirkt auf die Kachel, und die gibt es am Video genauso. Der
Knopf bleibt deshalb stehen; solange der Modus an ist, zeigt der Betrachter das
**Standbild** statt des Abspielers. Der Rahmen rechnet mit `naturalWidth` und
`naturalHeight`, und die hat ein Abspieler nicht. Die billigere Antwort wäre
gewesen, den Knopf am Video auszublenden — dann ließe sich die Kachel eines
Videos nicht mehr einstellen, und das wäre eine Ausnahme in einer Runde, deren
ganze Bauform darauf beruht, dass es keine gibt.

### G. `reclaim()` reicht — nachgemessen

`db.pragma('incremental_vacuum')` ohne Argument gibt **alle** freien Seiten
zurück. Gemessen an einer echten verschlüsselten Datenbank mit einem 20-MB-Blob:
20,2 MB → nach dem `DELETE` unverändert 20,2 MB → nach `reclaim()` 0,0 MB.
Keine Änderung nötig.

Dazu die Kosten auf der Baumaschine: 20 MB schreiben 1 009 ms, lesen 223 ms.
Das Papier maß 770 und 124 ms auf einer schnelleren Maschine — dieselbe
Größenordnung, und die Begründung für die Grenze von 20 MB trägt.

### H. Zwei Kleinigkeiten am Beispielcode des Papiers

Die Funktion `standbild()` aus Abschnitt 4 fängt zwei Fälle nicht ab: ein Video
**ohne Bildmaße** (etwa eine reine Tonspur) ergäbe eine Zeichenfläche der Größe
null, und `c.toBlob()` kann `null` liefern. Beides wird jetzt abgefangen und als
Meldung gezeigt, statt eine leere Datei hochzuladen.

### I. Drei Befunde aus der Probe am echten Browser

Der Prüfstand fährt `jsdom` und rechnet kein Layout; drei Dinge sind erst am
laufenden Chromium sichtbar geworden, nachdem alles grün war.

**Am Videoplatz gab es keinen Weg ins Vollbild.** Beim Foto öffnet der Klick
aufs Bild; am Video gehört der Klick der Abspielsteuerung. Aus einem reinen
Videobestand käme man damit gar nicht hinein. Ein eigener Knopf „Vollbild"
steht deshalb **nur dort** — am Foto wäre er Beiwerk. Das Papier setzt das
Vollbild als erreichbar voraus, ohne zu sagen, wodurch.

**Der Zoomknopf blieb trotz `hidden` stehen.** `.lb-btn` trägt `display: flex`,
und das schlägt das `display: none`, das der Browser einem `hidden`-Attribut
mitgibt. Der Knopf stand sichtbar da und tat nichts — am Video und **schon
vorher am Kommentarbild**, seit es die Regel gibt. Eine eigene Regel
`.lb-btn[hidden]` setzt es durch. Das ist Lücke 1 des Prüfstands in Reinform:
eine Prüfung auf das Attribut belegt nicht, dass das Attribut etwas bewirkt.

**Leere Varianten wären am Video dauerhaft.** Das Nachrüsten beim Start lässt
Videozeilen aus (Stolperstein 109); ein Foto holt seine Vorschau beim nächsten
Start nach, ein Video kann das nicht. Käme aus dem Standbild keine Variante
heraus, stünde die Zeile für immer ohne Kachel da. Sie wird deshalb gar nicht
erst angelegt — beim Hochladen wie beim Einspielen.

### J. Kein neuer Vokabeleintrag

„Video" ist ein Wort über den Gegenstand, aber keiner der elf einstellbaren
Begriffe — und wird auch keiner. „Foto" steht dort ebenfalls nicht; es ist fest
verdrahtet. Die elf bleiben elf.

---

## 3. Neue Stolpersteine

**108. Zwei `ALTER TABLE` sind zwei Anweisungen — scheitert die zweite, bleibt
die erste stehen.** Nachgestellt: ohne Transaktion überlebt die erste Spalte,
in einer `db.transaction()` rollen beide zurück. Für einen Umstiegsblock mit
mehr als einer Spalte folgt daraus die Bauform: nicht den Block als Ganzes
fragen, sondern **jede Spalte einzeln**. Dann heilt der nächste Start einen
zerrissenen Stand von selbst. *Die Transaktion verhindert den Riss, die
Einzelabfrage überlebt ihn — nur das Zweite hilft gegen einen Riss, der in
einer früheren Version entstand.*

**109. Ein Nachrüster, der aus `data` ableitet, gehört auf die Zeilen
eingeschränkt, deren `data` das Erwartete trägt.** `backfillVariants()` holte
jede Zeile mit fehlender Vorschau und erzeugte **beide** Varianten neu — an
einer Videozeile also aus der Videodatei. Ergebnis: zwei leere Varianten, ein
**überschriebenes** Standbild und eine Zeile, die bei jedem Start aufs Neue
fällig ist. Der Fehler ist nicht das Ableiten, sondern die unbeschränkte
Auswahl. *Wer eine Spalte mit zwei Bedeutungen einführt, geht jede Stelle
durch, die sie ohne Fallunterscheidung liest.* Gefunden beim Durchgehen von
Abschnitt 3a, vor dem Bauen — von keiner Prüfung.

**110. Eine Prüfung, die auf eine Nebenwirkung wartet, wartet auf die Meldung,
nicht auf die Uhr.** Das Nachrüsten startet 1,5 Sekunden nach dem Zuhören; eine
feste Wartezeit von 400 ms war zu kurz und ließ die Prüfung rot werden, obwohl
der Code stimmte. Eine großzügigere feste Zahl hätte den Lauf verlangsamt und
wäre auf einer langsameren Maschine trotzdem zu kurz. *Warte auf das, was du
erwartest, mit einer Obergrenze — nicht auf eine geschätzte Dauer.*

**111. jsdom kennt `<video>`, aber nicht `pause()` und `load()`.** Beide melden
sich als `jsdomError` und schwemmen das Protokoll voll, ohne dass etwas falsch
wäre. Gefiltert wird genau diese eine Meldung über eine eigene
`VirtualConsole`; alles andere geht unverändert durch. *Ein Filter über
Fehlermeldungen ist eine Wette — er gehört so eng gefasst, dass er nur den
bekannten Fall trifft.* In jsdom 30 heißt der Weg
`forwardTo(console, { jsdomErrors: 'none' })`; `sendTo` gibt es nicht mehr.

---

## 4. Gegenprobentabelle

Dreißig Rückbauten, jeder in einer **Kopie des Arbeitsbaums** (Stolperstein
100). Genannt ist die Zahl der roten Punkte und die Prüfung, um derentwillen
der Rückbau gemacht wurde — die übrigen roten sind Folgeschäden desselben
Rückbaus und stehen hier nicht einzeln.

| Rückbau | rot | die tragende Prüfung |
|---|---|---|
| `umstieg0850()` fragt nicht jede Spalte einzeln | 10 | „Der Block fragt jede Spalte einzeln ab" · „Der Umstieg rüstet dauer einzeln nach" |
| Vorgabe der Spalte `art` ist nicht `'bild'` | 6 | „Die beiden Bestandszeilen stehen auf bild, ohne Dauer" |
| Die DDL trägt die beiden Spalten nicht | 1 | „Eine frische Anlage trägt beide Spalten ohne Umstieg" |
| `typAusBytes()` kennt die MP4-Marken nicht | 35 | „Ein MP4 wird als video/mp4 ausgeliefert" |
| `typAusBytes()` kennt den EBML-Kopf nicht | 8 | „Eine echte WebM geht ebenfalls durch" |
| `INLINE_ERLAUBT` ohne die Videotypen | 1 | „Und darf eingebettet werden — sonst spielte es nicht, sondern liefe herunter" |
| Endungstabelle ohne die Videotypen | 1 | „Der Name trägt die Endung des ERKANNTEN Typs" |
| `bereichAus()` biegt Ungültiges zurecht statt abzuweisen | 2 | „Ungültiger Bereich (Ende vor Anfang) wird mit 416 abgewiesen" |
| `media-src` fehlt ganz | 3 | „Videos dürfen aus der eigenen Anlage abgespielt werden" |
| `media-src` ohne `blob:` | 1 | „Und das Standbild darf vor dem Hochladen aus einer blob-Adresse kommen" |
| Keine Bereiche am Video | 10 | „Das Video bietet Bereiche an" |
| Bereiche auch am Foto | 2 | „Ein Foto bietet weiterhin KEINE Bereiche an" |
| `server.js` setzt den Content-Type selbst | 1 | „server.js setzt den Content-Type an keiner Stelle selbst" |
| `qPhotos` liefert `art` und `dauer` nicht mit | 29 | „Die Videozeile nennt ihre Art und ihre Dauer" |
| Der Löschdialog nennt die Videos nicht | 1 | „Der Löschdialog zählt Fotos und Videos getrennt" |
| `photoCount` zählt die Videos mit | 1 | „photoCount zählt weiterhin nur Fotos" |
| Die Übersicht zählt Videos als Fotos | 1 | „Die Übersicht zählt ebenfalls getrennt" |
| Der Export nimmt das Standbild nicht mit | 4 | „Sie trägt Art, Dauer, Videodatei UND beide Standbildvarianten" |
| Der Import zählt fehlende Videos nicht | 1 | „Und sie nennt in der Antwort, wie viele Videos gefehlt haben" |
| Der Import zählt unlesbare Standbilder nicht | 1 | „Es wird übergangen und genannt" |
| Der Import erzeugt die Varianten aus der Videodatei | 3 | „Sie trägt Art, Dauer, Videodatei UND beide Standbildvarianten" |
| Das Nachrüsten fasst Videozeilen an | 2 | „Das Standbild des Videos überlebt den Start" |
| Der Videoweg prüft die ersten Bytes nicht | 7 | „Bildbytes unter Videoendung dagegen nicht" |
| Der Videoweg prüft das Standbild nicht (**beide** Schichten) | 5 | „Ein unlesbares Standbild wird abgewiesen" |
| Die Videoroute steht ohne `nurEintragVerfasser` | 3 | „Ein Fremder lädt kein Video an einen fremden Eintrag" · „Und nach der Absage steht keine neue Zeile in photos" |
| Keine Abspielmarke in der Vorschauleiste | 1 | „Am Video steht ein Abspielzeichen" |
| Das Vollbild hält beim Blättern nicht an | 2 | „Beim Blättern wird angehalten und die Quelle abgeräumt" |
| Der Kartenzähler nennt die Videos nicht | 2 | „Bei gemischtem Bestand nennt der Zähler beide Zahlen" |
| Der Zoomknopf bleibt am Video stehen | 1 | „Der Zoomknopf ist am Video verborgen" |
| Der Betrachter zeigt am Video kein `<video>` | 6 | „Beim Video steht ein Abspieler" · „Am Videoplatz gibt es einen Knopf ins Vollbild" |

**Drei Gegenproben haben mehr getragen als ihre Zahl.**

**Der Rückbau am Standbild musste BEIDE Schichten mitnehmen** (Stolperstein 51).
Fällt nur `rasterBild()` weg, fängt die Klemme darunter — „aus dem Standbild
ließ sich keine Vorschau erzeugen" — denselben Fall ab, und die Gegenprobe
bliebe **stumm**. Beide Schichten prüfen dasselbe Ergebnis auf zwei Wegen; nur
gemeinsam zurückgebaut belegen sie etwas.

**Vier Gegenproben haben den Lauf abgerissen, statt Namen zu nennen** — und das
war ein Mangel **im Prüfstand**, nicht im Code (Stolperstein 103). Eine
Lesestelle in der neuen Gruppe griff auf `photos[1].id` zu; kam kein Video
herein, war das `undefined`. Genau der Fehler, der in 0.8.40 schon einmal
zugeschlagen hat. Nach dem Abfangen nennen dieselben vier Rückbauten
zusammen **74** rote Prüfungen namentlich — vorher nannten sie null bis
zwanzig und rissen dann ab.

**Der Wächter über den Content-Type ließ sich nicht am laufenden Code
zurückbauen.** Er zählt wörtlich und sieht dabei auch Kommentare an; die
Gegenprobe setzt die verletzende Zeichenkette deshalb in einen **Kommentar** —
der Wächter wird namentlich rot, und der Server läuft weiter. Ein Rückbau, der
eine Route wirklich anfasst, riss den Lauf ab und belegte damit weniger.

---

## 5. Prüfungszahlen

**Vorher 1807, nachher 1953 — 146 neue Prüfungen.**

Vier neue Gruppen:

| Gruppe | Was sie hält |
|---|---|
| **UMSTIEG 0.8.50 — ENTFAELLT MIT 1.0** | Anlage aus 0.8.40 mit Fotos; beide Spalten kommen dazu, Bestand auf `'bild'`/`NULL`, Vorgabe aus dem `DEFAULT`, **jede Spalte einzeln nachgerüstet** (zwei weitere Prüflagen), zweiter Lauf stumm, frische Anlage ohne Umstieg, migriert und frisch gleich gebaut, kein `CHECK`, `ordneBestandZu()` kennt `photos` nicht, Index unverändert |
| **Videos am Fotoplatz** | Upload einer echten MP4 und WebM, `art`/`dauer` an der echten Antwort, Inhalt entscheidet in **beide** Richtungen, fehlendes und unlesbares Standbild, `VIDEO_MAX`, Reihenfolge über ein Video hinweg, Fokuspunkt am Video, Löschdialog und Kennzahlen getrennt, `mainPhoto` als Video |
| **Videos: Auslieferung (Sicherheitsregel)** | Typ, `inline`, Name mit der Endung des *erkannten* Typs, `nosniff`, Sicherheitsregel ohne `allow-scripts`, Bytestrom bytegleich, `size=` liefert JPEG, Bereiche mit 206/offenem Ende/Suffix und zwei Absagen mit 416, **Foto ohne Bereiche**, unbekannte ISO-Marke als Download, Standbild überlebt das Nachrüsten |
| **Videos am Bildschirm** | Marke und Länge an der richtigen Kachel **und nicht an der falschen**, Abspieler im Betrachter, Ausschnittmodus zeigt das Standbild, Vollbild mit `<video>`, Anhalten beim Blättern **und** beim Verlassen, kein Zoomknopf, Marke in der Leiste, Kartenzähler in vier Lagen |

Ergänzt wurden:

- **Export und Import** — beide Schalterstellungen, die Marke ohne Bytes, der
  Rundlauf mit Videodatei und Standbild, ein unlesbares Standbild, eine ältere
  Datei ohne `art`. Formatnummer 10 an zwei Stellen.
- **Rechte am Eintrag** — der Videoweg mit **echtem mehrteiligem Upload**:
  403 für den Fremden, danach keine Zeile in `photos`; 201 für den Verfasser,
  Zeile mit `art` und `dauer`; kein Löschen durch den Fremden.
- **Die Sicherheitsregel fuer die Anwendung selbst** — `media-src` mit `'self'`
  und mit `blob:`, je einzeln, dazu eine Gegenprobe auf das Muster und der
  Beleg, dass die Oberfläche die Freigabe wirklich braucht.
- **Der Waechter ueber den Quelltext** — `F_ROUTEN` 46 → 47, und der
  Content-Type-Wächter bekommt seine **Gegenprobe**: dieselbe Zählung an einer
  Zeichenkette, die die Verletzung trägt.
- **Der Doppelgänger in `baueDom`** trägt jetzt zwei Fotozeilen, ein Bild und
  ein Video, **das Video nicht an erster Stelle** (Stolperstein 90 verschärft).
  `art` und `dauer` stehen an **beiden**.

Die Prüffixtures sind **echte Dateien**: eine im Browser aufgenommene MP4
(1 418 Bytes) und WebM (1 053 Bytes), als Base64-Konstanten wie `PNG_BASE64`.
Eine von Hand zusammengesetzte Kopfzeile bewiese über `ftyp` nichts.

---

## 6. Vorgemerkt für 1.0

`umstieg0850()` ist der **fünfte** markierte Block und hat seinen Eintrag im
Projektstand, Abschnitt 10, bekommen: Datei, Zeilenzahl, Prüfabschnitt, was
bleibt (die beiden Spalten in der DDL) und was fällt (der Block). Dazu der
Satz, was **nicht** mitfällt — die Videoroute samt `VIDEO_MAX`, die Videotypen
in `typAusBytes()` und `INLINE_ERLAUBT`, die Bereichsauslieferung, `media-src`,
`art`/`dauer` in `qPhotos`, die getrennten Zahlen in Löschdialog und
Kennzahlen, der Filter in `backfillVariants()` und der Videoschalter im
Austauschformat.

Die Prüfung „Ein Sprung von 0.8.20 fährt ALLE Umstiege in einem Start" ist
**erweitert** worden, nicht verdoppelt: sie steht weiterhin im Abschnitt von
0.8.31 und trägt jetzt auch eine Fototabelle ohne die beiden neuen Spalten.

---

## 7. Offen geblieben

- **Die Marke `qt  ` ist nicht an einer echten Datei belegt.** Siehe
  Abschnitt 2, A. Wer ein iPhone zur Hand hat, lädt ein `.mov` hoch und sieht
  sich die Kopfzeilen an; erwartet wird `Content-Type: video/quicktime` und
  `inline`.
- **`Accept-Ranges` ist auf iOS Safari nicht nachgestellt.** Die Entscheidung
  für die Bereiche ist gerade deshalb gefallen; ein Gerät stand nicht zur
  Verfügung.
- **Tastaturbedienung beim Sortieren** bleibt offen und betrifft jetzt auch
  Videos (Projektstand, „Vorgemerkt für 1.0").
- **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 ist weiterhin
  offen und weiterhin vorgemerkt.
- **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
- **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut.
- **Teil II des Videopapiers** — große Dateien bis 2 GB — bleibt auf 1.1.0.
  Teil I braucht davon nichts, und die beiden teilen sich keinen Code außer der
  Positivliste der Formate.
