# Änderungsprotokoll 0.29.0 — „Worauf man sich verlassen können muss"

**Fünf geplante Punkte und drei Befunde aus dem Betrieb · 11. September 2026 ·
gebaut auf 0.28.1 (`452d1764`).**

> **FINGERPRINT DIESER RUNDE: `0336d3a5`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**. Er deckt `node_modules`
> nicht ab und hängt an jeder Datei der Liste — auch an einem Kommentar.
>
> **ACHTZEHN DATEIEN, WIE IN DER VORRUNDE.** *Und seit dieser Runde nennt die
> Karte „Kennzahlen" sie auf Verlangen einzeln — wer den Wert oben nicht
> wiederfindet, muss die Liste nicht mehr von Hand in einen Container tippen.*
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`0336d3a5`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`0336d3a5`** |
>
> **ZWEI QUELLEN, EIN WERT.** *Die dritte — die Meldung aus der laufenden
> Installation — kann erst nach dem Einspielen kommen.*

> **DER BETREIBER IM WORTLAUT, 11. September 2026, zum dritten Befund:**
> *„Achso wenn man nach Titel sortieren lässt sortiert es von A bis Z aber Z
> bis A kann nicht angewahlt werden."*

---

## Die Versionsnummer

**0.29.0 ist MINOR — Regel 5.1.** *Das Fälligkeitsdatum ist eine **Funktion**:
die Instanz kann danach etwas, was sie vorher nicht konnte. Dazu ein
Schemaschritt (`comments.due_date`, der **zwölfte** Migrationsblock) und ein
höheres Austauschformat (**15 → 16**).* **Jede dieser drei Angaben allein
genügte schon.**

`F_ROUTES` steigt von **72 auf 73** — `POST /api/backup/check`.

**Die drei Befunde aus dem Betrieb heben sie nicht weiter.** *Sie sind
Reparaturen und fahren mit, weil der Betreiber keine eigene Runde dafür wollte.*
**Und der dritte fährt nur mit, weil die Nummer schon steht** — „Titel" in beide
Richtungen wäre für sich genommen MINOR, und genau deshalb hat 0.28.1 ihn
liegen lassen müssen.

---

## Was diese Runde am Auftrag berichtigt hat

> **REGEL 11 IST EINGEHALTEN WORDEN, UND SIE HAT SICH DREIMAL BEZAHLT
> GEMACHT.** *Die Fragetafel wurde vor der ersten Zeile beantwortet und
> eingetragen — und beim Messen für die Antworten sind drei Angaben des
> Auftrags gefallen.*

| | der Auftrag sagte | gemessen |
|---|---|---|
| **die dritte Rasterspalte** | *alle Verweise hinein, 79 px Gewinn* | **so verliert die Sortierwahl ihren Namen** — sie schrumpft auf 30 px. Gebaut wird enger, und der Gewinn ist trotzdem größer: **104 px** |
| **der Kategoriekasten** | *Auswahl 148 px, feste 119 einsetzen* | **die Auswahl hat gar keine Obergrenze** und misst bei einem langen Namen **278 px**. Der Auftrag hat mit kurzen Namen gemessen |
| **der Platzhalter** | *„Neue Kategorie" genügt* | **er passt danach bei keiner Schriftstufe** — 124 px in ein Feld von 91 bis 106. Der Vorschlag hätte das Abschneiden verschärft |

**UND EINE VIERTE ANGABE IST NICHT BERICHTIGT, SONDERN ERSETZT WORDEN.** *Der
Auftrag schrieb zu Befund 2: „weicht etwas ab, steht die Karte ohnehin auf
Rot".* **Das ist falsch: die Instanz kennt keinen Sollwert.** *Er steht im
Änderungsprotokoll, also auf Papier, und verglichen wird mit dem Auge.* **In
der Software gibt es keinen Fehlerfall**, und „sichtbar nur im Fehlerfall" war
so nicht baubar. Gebaut ist ein Verweis, der auf Verlangen aufklappt.

**SIEBEN FRAGEN STANDEN NICHT IN DER TAFEL** und sind beim Messen aufgefallen;
sie stehen als F16 bis F22 im Auftrag, beantwortet vor der ersten Zeile.

---

## Die Bauabschnitte

### BA 1 — Die Sicherungsprobe

**`POST /api/backup/check` — die dreiundsiebzigste schreibende Route.** *Sie
schreibt nichts in den Bestand, aber sie öffnet eine fremde Datei und kostet
Zeit; ein `GET`, das eine Datenbank aufmacht, lädt zum Nachladen ein.*

**DIE NUMMER GEHT ÜBER DIE LEITUNG UND NICHT DER DATEINAME.** *Die Liste in der
Karte nummeriert von der jüngsten (1) zur ältesten, und genau diese Nummer kommt
zurück; aufgelöst wird mit `backupList()`, derselben Funktion, die die Liste
baut.* **Kein Weg dieser Instanz nimmt einen Dateinamen entgegen** — das ist in
0.20.0 für das Löschen entschieden worden (Stolperstein 300).

**JE ZEILE UND NICHT EINMAL FÜR DIE JÜNGSTE:** *der Befund heißt „es gibt
Sicherungen, die noch nie jemand geöffnet hat", und das ist meistens nicht die
jüngste — der traut man ohnehin.*

**Vier Zahlen, und sie tragen die Namen der Karte „Kennzahlen":** Einträge ·
Fotos · Zugänge · **„Inhalt bis"**. *Die vierte ist die jüngste Änderung IM
Bestand und nicht der Zeitpunkt der Datei — der steht in derselben Zeile schon.*

**Die laufende Datenbank wird nicht angefasst:** ein eigener Griff auf eine
eigene Datei, `readonly`, und am Ende zu. *Auch `readonly` ist nicht bloß
Zierde: ohne es legte SQLite eine WAL neben die Sicherung und änderte damit den
Ordner, den die Aufräumregel gleich wieder zählt.*

> **EIN NEBENEFFEKT, DER NICHT STEHEN GEBLIEBEN IST.** *Der Verweis nahm sich
> den Platz von der Zeitmarke — aus „11.09.2026, 23:34" wurde „11.09.2026, …".*
> **Die Zeitmarke IST der Name der Kopie** und unterscheidet zwei Sicherungen
> desselben Tages. *Sie schrumpft jetzt nicht mehr; gekürzt wird das Alter
> rechts, und dafür steht die Größe vorn.* **Gemessen fehlten der Zeile 24 px;
> zehn davon war ein doppelter Abstand, den der Knopf mitbrachte.**

### BA 2 — Der Fingerprint nennt die Datei

**`buildFingerprint()` liefert zwei Dinge aus EINEM Lauf:** den Gesamtwert und
die achtzehn Einzelwerte. *Dieselbe Schleife, dieselbe Reihenfolge, dieselben
Bytes — kein zweiter Leser und keine zweite Liste (Stolperstein 47).*

**Die Einzelwerte gehen über den BLOSSEN Inhalt** und nicht über Name-plus-Inhalt
wie der Gesamtwert: *sie sollen sich mit `sha256sum | cut -c1-8` nachrechnen
lassen, so wie der Handgriff in der README es tut.* **Am laufenden Server
gegengeprüft: alle achtzehn stimmen überein.**

**Sie fahren auf der vorhandenen lesenden Route `/api/stats` mit** — ein eigener
Weg ließe `F_ROUTES` wachsen, ohne dass es etwas Neues zu bewachen gäbe.

**Am Bildschirm ein Verweis „Dateien zeigen".** *Solange niemand drückt, steht
dort nichts: keine dauerhafte Zeile, kein Überfahrtext.* **Gemessen am Telefon:
zugeklappt 0 px, aufgeklappt 260 px mit senkrechtem Rollen, achtzehn Zeilen.**

### BA 3 — Das Fälligkeitsdatum

**Eine Spalte an `comments`, keine neue Tabelle** — `due_date TEXT`, 'JJJJ-MM-TT'
wie `test_days.day`. *In dieser Form ordnet der Zeichenvergleich wie der
Kalender.*

**Ein Datum und keine Uhrzeit.** *Eine Aufgabe in einem Bewertungsarchiv ist an
einem TAG fällig und nicht um 14:30; eine Genauigkeit, die niemand pflegt, wird
zur zweiten Wahrheit.* **Freiwillig** — NULL heißt „ohne Datum", und es gibt
keinen Vorgabewert.

**Sie hängt nicht an `kind`:** *wer eine Aufgabe zur Notiz zurückschaltet,
behält das Datum.* **Am laufenden Server nachgefahren** — nach Notiz und zurück
steht es noch da.

**„Offen" ordnet in VIER Abschnitten:** überfällig · heute · später — **und ohne
Datum hinten, mit eigener Überschrift.** *Der vierte ist kein vierter Zustand,
sondern die Abwesenheit eines Zustands; unter „Später" wäre er eine Behauptung.*

**Die Gruppierung nach Eintrag bleibt — INNERHALB des Abschnitts.** *Ohne die
zweite Sortierstufe zerfiele sie, und derselbe Eintrag stünde mehrfach in der
Liste.* **Am Bildschirm nachgesehen: zwei Aufgaben desselben Eintrags stehen
unter EINER Überschrift.**

**„Heute" ist der heutige Tag des LESERS** und nicht der des Servers. *Gerechnet
wird in Ortszeit und nicht über `toISOString()` — das gäbe UTC, und östlich von
Greenwich wäre „heute" bis zum Vormittag noch „gestern".*

**Ohne Datum steht hinten, und zwar mit einer eigenen Stufe:** *ein NULL
sortiert in SQLite von sich aus nach VORN, und wer keine Zahl hat, hätte damit
den niedrigsten Wert statt gar keinen.*

**Gesetzt wird es am Kommentar, und erst wenn die Aufgabenmarke steht.** *Ein
Datumsfeld an jedem Vermerk stünde bei den meisten Kommentaren für nichts da.*
**Ein Verweis, kein Feld** — er trägt das Datum oder das Wort, und ein Klick
macht daraus ein `<input type="date">`. *Der Rückweg ist das leere Feld und kein
zweites Kreuz.*

**Das Austauschformat steigt auf 16.** *Ein Feld, das im Export fehlt, ist beim
nächsten Einspielen weg.* **Es steht nur an den Zeilen, die eines tragen** —
dieselbe Regel wie „nur Abweichungen" bei den Gewichten. *Der Import lässt es
durch DIESELBE Prüfung wie die Oberfläche: eine Exportdatei kommt von außen, und
ein „2026-02-31" darin wäre ein Tag, den es nicht gibt.* **Was nicht durchgeht,
fällt still weg und reißt die Zeile nicht ab.**

**Der zwölfte Migrationsblock, an einer ECHTEN alten Datei gefahren** — angelegt
von der Fassung vor dieser Runde:

```
[Kriterion] comments um due_date ergaenzt (Migration auf 0.29.0);
            3 Aufgaben stehen weiterhin ohne Faelligkeitsdatum da.
```

*Die Bestandszeilen stehen auf NULL, und der zweite Start ist stumm.*

### BA 4 — Die Adresse bekommt ihr Schloss

**Ein partieller Index statt eines `UNIQUE` an der Spalte:**

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
  ON users(email COLLATE NOCASE) WHERE email IS NOT NULL
```

*`ALTER TABLE` kann kein `UNIQUE` nachrüsten, und die gewanderte und die frisch
angelegte Datenbank wären damit verschieden gebaut.* **Der Index wirkt auf
beiden Wegen gleich, ist keine Datenbankstufe und legt sich bei jedem Start
selbst nach.**

**`NOCASE` wie am Benutzernamen:** *„Anna@Haus.de" und „anna@haus.de" sind
dieselbe Adresse.* **Ohne diese Angabe hätte der Index den Befund nur halb
erledigt.**

**Grabsteine geben ihre Adresse ab**, bevor der Index versucht wird: *ein
gelöschter Zugang meldet sich nie wieder an, und seine Adresse stünde sonst
einem lebenden im Weg.*

**Bestehende Doppeladressen lassen die Instanz laufen.** *Der Index wird dort
nicht angelegt, das Containerprotokoll sagt es, und die Karte „Benutzer" nennt
Adresse und Zugänge samt dem Weg heraus.* **Gezählt wird mit einer eigenen
Abfrage und nicht am Fehlertext** — „UNIQUE constraint failed" sagt nicht,
WELCHE Adresse doppelt ist.

**Der Klartext gilt nur hinter der Anmeldung:** *„Diese Adresse ist bereits
vergeben" in `changeUser` und `createUser`.* **Der Weg VOR der Anmeldung — die
Anfrage auf einen Zugang — bleibt unberührt**; dort ist jede unterschiedliche
Antwort ein Werkzeug zum Durchprobieren.

### BA 5 — Die Zustellbarkeit

**Ein Abschnitt in der README, kein Code.** *Dass eine Mail im Spam landet,
entscheidet nicht der Weg, auf dem sie den Server verlässt, sondern ob die
Domain den Absender deckt.* **SPF, DKIM, DMARC** — drei Einträge im Namensdienst,
und die Werte kommen vom Anbieter.

**Ein Dienst wie Brevo oder Postmark hilft trotzdem** — *aber nicht wegen HTTPS,
sondern weil er die drei Einträge mitbringt und von Adressen sendet, denen die
Empfänger schon trauen.* **Und er spricht SMTP, das die Instanz seit 0.9.0
kann.**

**Ein Sammelblattpunkt fällt:** *„Ein Versanddienst über HTTPS statt SMTP" —
erledigt ohne Code, nach Regel 2 an beiden Stellen entfernt.*

### BA 6 — Die dritte Rasterspalte

**Der Umschalter „Tags" ist 46 px breit und stand seit 0.28.1 allein auf einer
Zeile von 366** — jene Runde gab allen Verweisen `grid-column: 1 / -1`. *Für den
Vermerk „folgt der Sortierung" war das richtig, für einen Umschalter ist es
Verschwendung.*

**Er bekommt zusammen mit den beiden Verweisen der Tagzeile eine dritte
Spalte** — und der Rücksetzer der Sortierzeile **nicht**:

| | Filterkasten | erste Kachel | Sortierwahl |
|---|---|---|---|
| **heute, aufgeklappt** | 395 px | y = 607 | 176 px |
| **gebaut** | **291 px** | **y = 502** | **170 px** |
| *alle Verweise (der Auftrag)* | *291 px* | *y = 502* | *170 px* |

**Mit einem gesetzten Tagfilter trennen sich die beiden letzten:**

| | Filterkasten | erste Kachel | Sortierwahl |
|---|---|---|---|
| **heute** | 435 px | y = 646 | 176 px, lesbar |
| **gebaut** | **330 px** | **y = 542** | **170 px, lesbar** |
| *alle Verweise* | *291 px* | *y = 502* | **30 px — der Name ist WEG** |

> **NEUNUNDDREISSIG PIXEL KOSTEN DEN NAMEN DER SORTIERUNG.** *„Filter
> zurücksetzen (1)" ist 140 px breit und nimmt sie der Wahl daneben.*
> **Der Gewinn bleibt 105 Pixel, und die Zeile bleibt heil.**

**Der Und/Oder-Umschalter geht in Spalte 2** — *gemessen statt vermutet (F12):
zwei Pillen, die zusammen **86 px** brauchen, spannten über **362**, und die
Beschriftung „Tags" blieb dabei allein auf der Zeile darüber.* **Zwei Zeilen
kündigten dieselbe Sache an.** In Spalte 2 misst die Tagzeile **69 statt 94 px**.

**Kein `:has()`:** *die beiden Verweise sagen selbst, dass sie ans Zeilenende
gehören* — `frow-right-end`, in `drawFilters()` gesetzt.

**Am Schreibtisch ändert sich nichts, und das ist gemessen:** *1280 px, vorher
wie nachher 130 px Filterkasten, erste Kachel y = 261, Zeilen 35 / 35 / 39 px.*

### BA 7 — Der Kategoriekasten

**Der Anlegeknopf stand verwaist auf einer zweiten Zeile.** *Auswahl und Feld
teilen sich jetzt, was der Knopf übrig lässt* — `flex: 1 1 0` und `min-width: 0`,
**statt zweier ausgerechneter Zahlen**. *Eine feste Zahl kann bei 80 bis 120
Prozent Schrift nur falsch werden, und das Stilblatt sagt es an anderer Stelle
selbst.*

| Schrift | heute | gebaut |
|---|---|---|
| **80 %** | 153 px, **2 Zeilen** | **107 px, 1 Zeile** (130 / 130 / 91) |
| **100 %** | 161 px, **2 Zeilen** | **110 px, 1 Zeile** (122 / 122 / 106) |
| **120 %** | 167 px, **2 Zeilen** | **118 px, 1 Zeile** (115 / 115 / 121) |

**Und die Auswahl hatte gar keine Obergrenze** — *das stand in keinem Befund.*
**Bei einer Kategorie „Haushaltsgroßgeräte und Zubehör" misst sie 278 statt
148 px**; der Auftrag hat mit kurzen Namen gemessen. *Die Mindestbreite zieht
dafür aus dem Quelltext ins Stilblatt — inline schlug sie jede Regel, auch die
des schmalen Schirms.*

**Der Platzhalter wird „Name" · „Name" · „Ad" und nicht „Neue Kategorie":**

| Platzhalter | 80 % | 100 % | 120 % |
|---|---|---|---|
| „Neue Kategorie" | 124 ✗ | 124 ✗ | 139 ✗ |
| **„Name" · „Ad"** | **47 ✓** | **47 ✓** | **53 ✓** |

*Im schmaleren Feld sind 91 bis 106 px Platz.* **Der Vorschlag des Auftrags
hätte das Abschneiden verschärft statt abgestellt.**

**Am Schreibtisch ändert sich nichts, Pixel für Pixel:** *1280 px, 80/100/120 %,
vorher wie nachher 104 / 107 / 168 px und 231 / 278 / 324 px Auswahl.*

### BA 8 — „Titel" kehrt um

**Die Sortierung nach Titel kannte nur A → Z.** *Der Grund stand im Quelltext
und war die Nummer und nicht die Sache:*

> *„Z nach A wäre eine FUNKTION, und eine Funktion ist nach Regel 5.1
> mindestens MINOR. Diese Runde ist ein PATCH aus acht Reparaturen; drei Zeilen
> hätten den Fahrplan ab 0.29.0 um eine Stelle verschoben."* — `public/app.js`,
> in 0.28.1 geschrieben

**0.29.0 ist MINOR, damit reisen die drei Zeilen zum Nulltarif mit.**

**Es fällt mehr, als es scheint:** *danach ist keine der sieben Grundlagen mehr
einspurig.* **`list.sortOneWay` fällt in drei Sprachen**, mit ihm der gesperrte
Knopf, `twoWays()`, `dirOf()` und die Stilblattregel `.sort-dir:disabled`. *Eine
Regel ohne Träger bleibt nicht stehen.*

**Und jede Grundlage sagt jetzt, worauf ein Wechsel landet** (`start`). *Ohne das
hätte die mitwandernde Richtung jeden, der aus der Vorgabe „neu → alt" kommt,
auf „Z → A" abgesetzt — also jeden beim ersten Mal.* **„Titel" fängt vorn an, die
sechs anderen oben.** *Der Betreiber hat es entschieden, nachdem die Messung
gezeigt hatte, was die einfache Lösung gekostet hätte.*

**Am laufenden Server nachgefahren:** *Wechsel auf „Titel" gibt „A → Z" und
Ampel…Zange, ein Klick gibt „Z → A" und Zange…Ampel. Vorher: „A → Z", gesperrt,
und ein Klick tat nichts.*

---

## Was NICHT gebaut wurde

| | warum |
|---|---|
| **Ein Wecker für fällige Aufgaben** | *die Glocke trägt einen Zeitstempel und keine Tabelle* |
| **Eine Uhrzeit am Fälligkeitsdatum** | *eine Genauigkeit, die niemand pflegt, wird zur zweiten Wahrheit* |
| **Ein Versanddienst über HTTPS** | *er löst das Problem nicht — die drei Namensdiensteinträge tun es* |
| **Das Zurückspielen einer Sicherung über die Oberfläche** | *die Probe öffnet und zählt; zurückspielen heißt die laufende Datenbank ersetzen* |
| **Der Rücksetzer der Sortierzeile in Spalte 3** | *gemessen: er kostet den Namen der Sortierung* |
| **Eine mitgelieferte Sollliste für den Fingerprint** | *eine zweite Liste, die ausläuft — F6 und Stolperstein 47* |

---

## Der Prüfstand

**6662 von 6662 Prüfungen bestanden.** *Der Lauf trug vor dieser Runde 6611;
**einundfünfzig** sind dazugekommen.*

**Sechsundzwanzig neue Gegenproben, Nummern 869 bis 894** — *je eine für die
Sicherungsprobe, den Fingerprint, das Fälligkeitsdatum, den partiellen Index,
die beiden Bildschirmbefunde und „Titel" in beide Richtungen.* **Die Liste
wächst von 859 auf 885, und alle 885 Suchtexte greifen in ihrer Datei genau
einmal.**

> **FÜNF RÜCKBAUTEN GRIFFEN INS LEERE — genau der Fall, vor dem der Auftrag
> warnt.** *233 und 448 zielten auf die Formatnummer, 806 auf die
> Potenzialzeile, 866 auf das Raster der Filterzeile — alle vier **mitgezogen**
> und nicht ersetzt.* **858 hat den Gegenstand gewechselt:** *`dirOf()` ist mit
> Befund 8 gefallen, und der Rückbau zielt jetzt auf die Zeile, die `start`
> auswertet — was er belegt, ist dasselbe geblieben.*

### Die Gegenproben sind gefahren

**SECHSUNDZWANZIG, UND ALLE SECHSUNDZWANZIG GREIFEN — 0 STUMM.** *Jede färbt
genau die Zusage rot, gegen die sie gebaut ist; keine lässt den Lauf stehen.*

> **ZWEI WAREN IM ERSTEN ANLAUF WERTLOS, und beide sind ein Fund über mich und
> nicht über den Code.**
>
> **871 RISS DEN LAUF AB** — *359 Sekunden, kein einziger roter Punkt.* Der
> erste Entwurf ersetzte die Antwort auf einen fremden Schlüssel durch ein
> `throw`, und damit war nach der Route Schluss. **Eine Gegenprobe, die
> abreißt, belegt nichts** — sie muss so greifen, dass die Oberfläche danach
> noch läuft. *Sie erklärt den fremden Schlüssel jetzt für **lesbar** und
> antwortet mit „Einträge 0": wer das sieht, hält seine Sicherung für leer
> statt für unlesbar, und das ist die schlimmste der drei möglichen Antworten.*
>
> **872 WAR STUMM.** *Der Entwurf nahm die Zahlenprüfung heraus — und
> `files[9999 - 1]`, `files[0 - 1]` und `files[NaN - 1]` sind alle drei
> `undefined`, die Absage kam trotzdem.* **Ein Griff ohne sichtbare Wirkung
> belegt nichts.** *Sie zielt jetzt auf die **Absage** selbst.*

### Was der Prüfstand an dieser Runde gefunden hat

**ZWEI EIGENE FEHLER, und beide steckten in Zeilen, die diese Runde selbst
geschrieben hat:**

**DIE GRUPPIERUNG IN „OFFEN" ZERFIEL BEI GLEICHER SEKUNDE.** *Sortiert wurde
nach `due_date`, dann `i.updated_at DESC`, dann `c.id` — und `updated_at` ist
auf die **Sekunde** genau.* **Werden zwei Einträge in derselben Sekunde
angefasst — beim Einspielen die Regel und nicht die Ausnahme —, sind ihre Werte
gleich, die Stufe entscheidet nichts mehr, und `c.id` mischt die Zeilen beider
Einträge ineinander.** *Die Gruppierung zerfiel also genau in dem Fall, für den
sie gebaut ist.* `c.item_id` **steht jetzt davor.**

**UND MEINE EIGENEN CSS-ZUSAGEN SUCHTEN AN DER FALSCHEN UMBRUCHSTELLE.** *Sie
heißt **700** und nicht 760 und trägt zwei weitere Bedingungen.* **Eine eigene
Zusage hält jetzt ihren Wortlaut fest**, damit die nächste Runde ihn nicht
wieder abschreibt.

**UND FÜNF WEITERE HABEN DIE WÄCHTER GEFANGEN, BEVOR SIE INS PAPIER KAMEN:**
*sechs deutsche Bezeichner in neuem Code (`eine`, `feld`, `heute`, `kopf`,
`steht`, `zwei`); zweimal „Zeichenkette" statt „String" in Kommentaren;
„Instanz", „Zugänge" und „Kopie" in vier Bildschirmsätzen — alle drei hat das
Wörterbuch aus 0.22.0 vom Bildschirm genommen; ein alleinstehendes „yedek" im
Türkischen, wo es „yedekleme" heißt; und ein `CREATE TABLE IF NOT EXISTS`, das
über einen Zeilenumbruch lief und den Wächter darüber rot färbte.*

> **UND EINE ZUSAGE MUSSTE IHREN GEGENSTAND WECHSELN.** *Zwei Gegenlagen nahmen
> bis hierher `users.email`, **weil sie keinen Migrationsblock trägt** — sie
> belegen, dass eine entfernte Spalte nicht von selbst zurückkommt.* **Seit
> dieser Runde trägt sie etwas anderes: den partiellen Index.** *SQLite weist
> ein `DROP COLUMN` ab, sobald ein Index auf der Spalte steht, und der ganze
> Lauf riss an dieser Zeile ab.* **Sie nehmen jetzt `users.last_login`** — kein
> Migrationsblock, kein Index, kein Vorgabewert. *Die Zusage ist dieselbe
> geblieben; nur ihr Gegenstand hat gewechselt, weil der alte in dieser Runde
> einen Träger bekommen hat.*

---

## Die Papiere dieser Runde

| Datei | was |
|---|---|
| `Doku/Auftrag_0.29.0.md` | **die Fragetafel beantwortet**, F16 bis F22 ergänzt, Befund 8 und BA 8 aufgenommen, drei Angaben berichtigt |
| `Doku/Aenderungsprotokoll_0.29.0.md` | **neu** — dieses Papier |
| `Doku/Projektstand_Kriterion_0_29_0.md` | `git mv`, **Revision 82** |
| `Doku/Fahrplan.md` | 0.29.0 durchgestrichen |
| `Doku/Fehler_und_Ideen.md` | „Versanddienst über HTTPS" **gefallen** (Regel 2) |
| `README.md` | die Sicherungsprobe, die Dateiliste am Fingerprint, das Fälligkeitsdatum, der Abschnitt zur Zustellbarkeit |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
