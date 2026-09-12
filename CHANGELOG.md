# Changelog

Alle beachtenswerten Änderungen an diesem Projekt — **kurzgefasst für den, der
Kriterion betreibt.** Wie etwas gebaut wurde und warum, steht im
Änderungsprotokoll der jeweiligen Runde (`Doku/Aenderungsprotokoll_<Version>.md`).

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

> **EINE ZEILE JE ÄNDERUNG.** Kein Absatz, keine Begründung — ein Changelog wird
> überflogen, nicht gelesen.
>
> **STEHT ÜBER DEN ÄNDERUNGEN EIN KASTEN, IST ETWAS ZU TUN.** Meistens steht
> dort nichts: dann einspielen und fertig. Steht dort eine Zeile, geht es um
> deinen Bestand — eine Sicherung vor dem Einspielen, oder eine Folge, die
> überrascht.
>
> **Zurückgezogene Versionen** stehen als `## [x.y.z] - JJJJ-MM-TT [YANKED]`,
> großgeschrieben, damit ein Mensch es bemerkt.

*Zur Form: die Einträge ab 0.10.0 sind am 31. August 2026 auf diese knappe Form
gebracht worden. Vorher trugen sie Absätze, Herleitungen und Zahlen aus dem
Bauen — `F_ROUTEN`, Migrationsblöcke, Kartenzahlen —, die niemandem etwas sagen,
der das Projekt nicht selbst gebaut hat. Verloren geht dabei nichts: die
Änderungsprotokolle sind unangetastet und tragen alles. Die Einträge bis 0.9.1
bleiben in der Form ihrer Zeit.*

## [Unreleased]

*Hier wird mitgeschrieben, während gebaut wird.*

## [0.30.0] - 2026-09-12

> **NICHTS ZU TUN.** Diese Runde fasst das Schema nicht an, das Austauschformat
> bleibt 16, und es gibt keinen Migrationsblock. Einspielen und fertig.
>
> **Eine Zeile im Protokoll ist neu und sollte dort NICHT stehen:** steht beim
> Start „PRUEFSCHALTER AKTIV", trägt deine `.env` die Variable
> `KRITERION_TESTBENCH`. Sie gehört nur in den Prüfstand — entfernen.

### Neu

- **Der Prüflauf sagt am Ende, wo seine Zeit hingeht** — eine Schlusstafel mit den zehn teuersten Prüfgruppen, ihrem Anteil und der Gesamtzeit. Die Zeit je Gruppe steht mit `TESTBENCH_ZEIT=1` daneben.
- **Der Prüfstand darf zwei Kosten senken, die nur ihn betreffen** — die Kostenstufe des Passwortspeichers und die Mailfristen. Über **einen** Schalter mit Marke, Boden und Ansage beim Start; eine gewöhnliche Umgebungsvariable greift nicht.
- **Der Prüfstand räumt beim Start auf**, was ein abgebrochener Lauf liegen gelassen hat.

### Geändert

- **Der Prüflauf braucht 271 statt 465 Sekunden** — bei mehr Prüfungen und mehr Prüfgruppen als vorher. Die Gegenproben sparen dieselbe Zeit **je Rückbau**.
- **Die Tagzeile steht offen, sobald die Filter aufgeklappt sind** — der Umschalter „Tags" fällt dafür weg. „und/Oder" steht klein unter der Beschriftung; am Telefon 24 Pixel weniger Filterleiste.
- **Der Knopf „Wer hat bewertet" heißt „Wer?"** — damit steht die Kopfzeile des Bewertungskastens wieder auf **einer** Zeile statt zwei.
- **Der Bewertungskasten misst am Telefon 439 statt 537 Pixel**, sobald es mehr als einen Zugang gibt. Bei einem einzigen Zugang ändert sich nichts.
- **Das Fälligkeitsdatum sagt seinen Zustand mit Farbe** — überfällig rot, heute hervorgehoben, später gedämpft, erledigt durchgestrichen. Bis hierher sah es aus wie der Zeitstempel daneben.
- **Eine erledigte Aufgabe zeigt ihr Fälligkeitsdatum weiter** — bis hierher verschwand es beim Abhaken.
- **Die Vokabelkarte misst am Telefon 1056 statt 1203 Pixel** — dieselbe Bauform, weniger Luft.

### Behoben

- **Vier deutsche Wörter standen fest im Quelltext** und blieben deutsch, auch wenn die Oberfläche englisch oder türkisch eingestellt war: „gewichtet" am Durchschnitt, „an" und „aus" an der Registrierung und „eingerichtet" am Mailversand.
- **Ein Bestandslauf konnte den Server mitnehmen** — hatte beim Start gerade etwas anderes die Datenbank gesperrt, endete der ganze Prozess. Er sagt es jetzt und versucht es später noch einmal.
- **Die Gegenproben erkannten einen nebenher laufenden Prüflauf nicht** und meldeten seine Störung als Befund über den Rückbau.
- **Startet ein Zweitserver des Prüflaufs nicht, sagt die Meldung jetzt, welcher.**

## [0.29.0] - 2026-09-11

> **VOR DEM EINSPIELEN: EINE SICHERUNG.** Diese Runde fasst das Schema an — eine
> Spalte an den Kommentaren (`due_date`) und ein Index auf der Adresse. Beides
> legt der erste Start selbst nach; die Migrationszeile steht danach einmal im
> Containerprotokoll und beim nächsten Start nicht mehr.
>
> **Das Austauschformat steigt auf 16.** Ältere Exportdateien bleiben lesbar;
> eine Datei aus dieser Runde spielt eine ältere Fassung ohne das neue Feld ein.
>
> **Und eine Folge, die auffallen kann:** trägt dein Bestand heute schon **zwei
> Zugänge mit derselben Adresse**, wird der Index nicht angelegt. Die Instanz
> läuft weiter, das Containerprotokoll sagt es, und die Karte „Benutzer" nennt
> die Adressen. Eine davon ändern oder leeren — beim nächsten Start greift das
> Schloss von selbst.

### Neu

- **Jede Sicherung lässt sich prüfen** — an jeder Zeile der Liste steht „prüfen". Es öffnet die Kopie probeweise und sagt, wie viele Einträge, Fotos und Zugänge darin stehen und bis wann der Inhalt reicht. Die laufende Datenbank wird dabei nicht angefasst.
- **Eine Aufgabe kann ein Fälligkeitsdatum tragen** — freiwillig, ein Datum ohne Uhrzeit. „Offen" ordnet danach in vier Abschnitten: überfällig, heute, später, ohne Datum.
- **Die Kennzahlen nennen auf Verlangen jede einzelne Datei** — der Verweis „Dateien zeigen" unter dem Fingerprint klappt alle achtzehn mit ihrer Prüfsumme auf. Dieselben acht Zeichen wie `sha256sum | cut -c1-8`.
- **Eine E-Mail-Adresse kann nur noch einmal vergeben werden** — mehrere Zugänge ohne Adresse bleiben erlaubt.
- **Nach Titel lässt sich jetzt auch von Z nach A sortieren.**

### Geändert

- **Der Umschalter „Tags" steht am Ende der Kategoriezeile** statt allein auf einer eigenen — am Telefon 104 Pixel weniger Filterleiste, 105 mit gesetztem Tagfilter.
- **Der Kategoriekasten im Eintrag misst eine Zeile statt zwei** — der Anlegeknopf steht neben dem Feld. Das Feld heißt jetzt „Name".
- **In der Liste der Sicherungen steht die Größe vor dem Alter** — die Zeitmarke wird dafür nicht mehr gekürzt.
- **Die README erklärt, warum Mails im Spam landen** — und dass SPF, DKIM und DMARC das ausräumen, nicht ein anderer Versandweg.

## [0.28.1] - 2026-09-11

> **VOR DEM EINSPIELEN NICHTS ZU TUN.** Kein Schemaschritt, keine Migration.
>
> **Eine Folge, die auffällt:** die Sortierung wird jetzt an **zwei**
> Bedienelementen eingestellt — das Feld sagt, wonach sortiert wird, der Knopf
> daneben sagt die Richtung. **Gespeicherte Ansichten gelten unverändert
> weiter.**
>
> **Und eine zweite:** die Blätterpfeile stehen nicht mehr in der Kopfzeile,
> sondern als zwei breite Knöpfe am **Fuß** des Eintrags.

### Geändert

- **Die Sortierliste ist halb so lang** — sie nennt nur noch, **wonach** sortiert wird; die Richtung steht als eigener Knopf daneben und sagt sie im Klartext („neu → alt", „hoch → niedrig"). Sieben Einträge statt dreizehn.
- **Das Blättern im Eintrag zog ans Ende** — zwei breite Knöpfe „‹ Voriger" und „Nächster ›", statt zweier Pfeile links und rechts von der Marke.
- **Im Systembereich steht kein Suchfeld mehr** — es versprach, in den Einstellungen zu suchen, und sprang in den Bestand.
- **Auf dem Telefon steht in keiner Unteransicht mehr ein Suchfeld** — es kostete dort eine ganze Zeile. Am Schreibtisch bleibt es.
- **Die Abschnitte des Systembereichs klappen auf dem Telefon ein** — ein Knopf darüber nennt den offenen Abschnitt, wie der Filterschalter der Übersicht.
- **Die Sterne der Bewertung sind auf dem Telefon feiner** — rund 40 Pixel je Kriterienzeile statt 50.
- **Die Filterreihen sind auf dem Telefon flacher** — die Beschriftung steht wieder **neben** der Reihe statt darüber, und die Reihen rollen quer, statt umzubrechen. Die Pillen bleiben, wie sie sind.

### Behoben

- **Der Favoritenstern steht auf dem Telefon jetzt bündig rechts** — die Titelzeile war 88 Pixel schmaler als ihre Spalte.
- **„Titel" sortierte nach dem Änderungsdatum**, sobald man von einer anderen Sortierung dorthin wechselte — ohne Meldung und ohne dass man es sah.
- Eine tote Stilblattregel aus 0.28.0 ist gefallen.

> **BERICHTIGUNG ZU 0.28.0:** *dort steht „die aufgeklappte Sortierung passt
> jetzt auf den Schirm".* **Das stimmte nicht.** *Chrome auf Android zeichnet
> die aufgeklappte Auswahl als eigenen Systemdialog mit eigener Schrift — das
> Feld wurde kleiner, die Liste nicht.* **Diese Runde holt die andere Hälfte
> nach, auf einem anderen Weg: die Liste ist kürzer geworden.**

## [0.28.0] - 2026-09-11

> **VOR DEM EINSPIELEN NICHTS ZU TUN.** Kein Schemaschritt, keine Migration.
>
> **Eine Folge, die auffällt:** die Bedienelemente sind auf dem Telefon
> schlanker, und die aufgeklappte Sortierung steht dort in kleinerer Schrift.
> Auf dem Schreibtisch ändert sich an beidem nichts.

### Hinzugefügt

- **Von einem Eintrag zum nächsten blättern** — zwei Pfeile in der Kopfzeile, in der Reihenfolge der Übersicht mit ihrem Filter und ihrer Sortierung.
- **Die Installation lässt sich auf den Startbildschirm legen** — eigenes Zeichen, eigener Name aus „Öffentlicher Titel", ohne Adresszeile darüber.
- **Eine gemeinsame Kopfzeile für Eintrag, Systembereich, offene Aufgaben und Vergleich** — mit Suchfeld und Menü; vorher stand dort nur „Zurück zur Übersicht".

### Geändert

- Die Suche ist aus jeder Unteransicht **einen Griff** entfernt statt zwei.
- Die Bedienelemente sind auf dem Telefon schlanker: eine Pillenreihe spart sechs Pixel je Zeile.
- Die Auswahlfelder zoomen auf dem Telefon nicht mehr auf 16 Pixel hoch — die aufgeklappte Sortierung passt jetzt auf den Schirm.
- Der Hinweis unter dem Ablegefeld nennt „Strg+V" nicht mehr — auf dem Telefon gibt es das nicht.

### Behoben

- Der Befehl in „Mein Zugang" und in „Kennzahlen" lief in schmalen Karten seitlich aus dem Kasten; er bricht jetzt um.
- Die Zeile des Sicherheitsprotokolls richtet sich nach der Breite ihrer **Karte** statt nach der des Fensters.
- Eine Meldung verdeckt die Vergleichsleiste nicht mehr.

## [0.27.0] - 2026-09-10

> **VOR DEM EINSPIELEN NICHTS ZU TUN — ABER ZWEI FOLGEN, DIE ÜBERRASCHEN
> KÖNNEN.**
>
> **Erstens:** deine bisherige Einstellung wird beim ersten Start übersetzt.
> Stand das Häkchen „PNG-Fotos beim Upload in WebP umwandeln" **an**, steht
> danach **WebP verlustfrei**; stand es **aus**, steht **PNG**. **Am Bildschirm
> ändert sich an der Ablage kein Byte** — nur die Karte zeigt drei Verfahren
> statt eines Häkchens.
>
> **Zweitens:** neu erzeugte Vorschaubilder sind ab jetzt **WebP** statt JPEG.
> Die vorhandenen bleiben liegen, bis du den Knopf drückst — sie werden nicht
> von selbst umgerechnet.

### Neu
- **Die Bildablage ist eine Wahl aus drei Verfahren geworden.** *PNG (nichts wird umkodiert), WebP verlustfrei (die Vorgabe, das bisherige Verhalten) und **neu** WebP verlustbehaftet für Fotos aus der Zwischenablage — gemessen rund zwei Drittel kleiner.* Zu finden unter **Datenbank → Bildformate**, jede Zeile mit einem Knopf **Standard**; stellen kann es der Eigentümer allein.
- **Das dritte Verfahren trägt eine Auflage, und die Karte sagt sie:** bei einem **Bildschirmfoto mit Text** ist verlustbehaftet gemessen ein Vielfaches **größer** als verlustfrei. Es lohnt sich nur bei Fotos.
- **Ein Satz an der Einfügestelle nennt die Folge:** *„Das Einfügen über die Zwischenablage führt zu erheblich größeren Dateien."* Was daraus folgt, entscheidet jeder selbst — die Anwendung gibt dazu keinen Rat.
- **Der Knopf „Vorhandene Bilder umstellen"** zieht Originale **und** Vorschaubilder in **einem** Durchgang nach. *Er fragt weiterhin vorher das Passwort.*

### Geändert
- **Die Vorschaubilder sind WebP statt JPEG.** *Sie folgen der Wahl oben nicht — sie sind immer WebP.* Gemessen an drei Bildarten spart das bei der Kachel 52 / 5 / 6 % und bei der mittleren Ansicht 9 / 27 / 30 %, bei durchweg **kleinerer** Abweichung als vorher.
- **Das Umschalten allein rührt den Bestand nicht an.** Wer die Wahl nur ausprobiert, bekommt nichts umkodiert.
- **Die Fortschrittszeile nennt beide Hälften** — wie viele Originale umgestellt und wie viele Vorschaubilder neu gerechnet wurden.

### Behoben
- **Ein Bild im Kommentar wurde mit einem festen Dateinamen ausgeliefert** und damit immer als JPEG angekündigt, was auch darin lag. *Solange alles JPEG war, stimmte es zufällig.* Der Typ kommt jetzt aus den Bytes, wie beim Foto am Eintrag.
- **Die Fertigmeldung der Umstellung stand halb auf Deutsch, egal welche Sprache eingestellt war** — „Conversion done: 7 von 12 umgewandelt".

## [0.26.0] - 2026-09-10

### Neu
- **Der Potenzialmodus lässt sich abschalten.** *Ist er aus, ist der Sternkasten am Eintrag gar nicht erst gezeichnet, die Sortiergruppe fällt aus dem Auswahlfeld, und die Kopfzahl ◆ verschwindet aus der Übersicht — auch dann, wenn schon Bewertungen in der Datenbank stehen.* **Die vergebenen Sterne bleiben stehen:** Ausschalten ist Verbergen und nicht Löschen, und wer wieder einschaltet, findet seinen Bestand vor. **Stellen kann den Schalter der Eigentümer allein** — ein Admin sieht ihn und kommt nicht daran.

### Behoben
- **Nach dem ersten Bild ging die Dateiauswahl nicht mehr auf.** *Der Fortschrittstext im Ablegefeld warf das versteckte Dateifeld mit hinaus; Strg+V ging die ganze Zeit weiter, F5 heilte es — deshalb ist es nie als Fehler gemeldet worden, sondern als Eigenart.*
- **Die Sitzungsliste lief unten aus dem Kasten** und nahm den Knopf „Andere Sitzungen beenden" mit. *Auf einem schmalen Schirm ist eine Sitzungszeile höher, als der Deckel gerechnet hatte.*
- **Drei kleine Anzeigefehler** aus dem Augenschein zu 0.22.0: der Eintragstitel bricht auf dem Telefon um, statt abgeschnitten zu werden; das Leerzeichen vor der Klammer am Ausfuhrknopf ist weg; und der Satz über das Gewicht steht hinter der Adminklemme, wo er hingehört.
- **Eine Regel im Stilblatt, die nie greifen konnte** — `.calc-sum:first-of-type` zählte DIV-Geschwister, und das erste `div` ist der Kopf.
- **Der Hinweis an der Zeitleiste lief am rechten Rand hinaus.**
- **„ÜBERGROSS" findet jetzt „übergroß".** *Mit ausdrücklichem Preis: in der Gegenrichtung findet „Masse" danach auch „Maße" — für eine Suche ist das die richtige Seite des Irrtums.*
- **Die Übersicht leert den Bildschirm nicht mehr, bevor sie überhaupt fragt.** *Steht schon eine Ansicht da, bleibt sie stehen, bis die neue fertig ist.*

## [0.25.4] - 2026-09-10

### Behoben
- **Auf Türkisch sagte ein Satz das Gegenteil.** *„Dein Link ist davon **nicht** betroffen"* war in drei Schlüssel zerlegt und wurde erst beim Anzeigen zusammengesetzt. Türkisch verneint mit einer Endung im Verb und nicht mit einem eigenen Wort davor — dort stand Kauderwelsch. **Jede Sprache trägt jetzt einen ganzen Satz und entscheidet selbst, welches Stück hervorgehoben wird.**
- **Das Anführungszeichen am Tag-Zeichen wurde nie geschlossen** — in allen drei Sprachen.
- **„in 1 Tagen" und „noch 1 Minuten".** Beiden Sätzen fehlte die Einzahlform — und der Zählwert, über den sie überhaupt gewählt wird.

## [0.25.3] - 2026-09-10

### Behoben
- **In der Kachel „Vokabular" standen die beiden Felder einer Zeile nicht auf einer Linie.** Brauchte eine Beschriftung zwei Zeilen und die daneben nur eine, rutschte das eine Eingabefeld nach unten. *Betraf alle drei Sprachen, sobald die Kachel zwei Spalten breit ist — im Türkischen und Englischen ab 1280 Pixeln, im Deutschen ab 1360.*

## [0.25.2] - 2026-09-10

### Behoben
- **Bei anderssprachiger Oberfläche behaupteten die Namenskarten Unwahrheiten.** Wer Kriterion auf Türkisch las und in der Kartenpille auf „Deutsch" schaltete, sah an jeder deutschen Zeile *„kein Eintrag in Deutsch — gezeigt wird Deutsch"*, obwohl die Pille darüber den Punkt für „vollständig" trug. *Bei deutscher oder englischer Oberfläche fiel es nicht auf.*
- **Das Zeichen zum Räumen (✕) fehlte an denselben Zeilen** — es hängt an derselben Abfrage.
- **Der Sprachumschalter der Kachel „Vokabular" lief nicht mit.** Die drei Namenskarten schalteten gemeinsam um, das Vokabular blieb stehen. **Jetzt schalten alle vier gemeinsam**, in beide Richtungen.

## [0.25.1] - 2026-09-10

### Behoben
- Die Zahl an der Sprachpille zählt jetzt **je Kachel**. Über „Bewertung" und „Potenzial" stand bisher dieselbe Summe über beide Kacheln.
- Der rote Rahmen folgt derselben Zahl: eine vollständige Kachel trägt ihn nicht mehr, auch wenn die andere Lücken hat.
- Der Hinweis unter einem geliehenen Namen wird nicht mehr abgeschnitten — er steht über die ganze Kachelbreite.

### Geändert
- Der Hinweis nennt jetzt **beide** Sprachen: „(kein Eintrag in Türkçe — gezeigt wird Deutsch)" statt „(nicht eingetragen — es steht Deutsch)".
- Türkisch: „Backup" heißt durchgehend **`yedekleme`** statt `yedek` (45 Sätze).

## [0.25.0] - 2026-09-09

> **SICHERUNG VOR DEM EINSPIELEN.** Diese Runde ist eine **Datenbankstufe**:
> beim ersten Start läuft ein Migrationsblock und ergänzt zwei Spalten
> (`product_categories.language`, `rating_criteria.language`). *Er schreibt
> keinen Wert und ändert keine Zeile — er legt die Spalten an und meldet, wie
> viele Namen ohne Sprachangabe dastehen.* **Ein zweiter Start ist still.**
>
> **DIE VERSIONSNUMMER IST GEWÖHNLICHES SemVer** — eine Datenbankstufe und eine
> neue Funktion bekommen eine MINOR-Nummer.
>
> **NACH DEM EINSPIELEN FRAGT DIE KARTE „Kategorien" EINMAL NACH.** Für deinen
> vorhandenen Bestand weiß niemand, in welcher Sprache die Namen geschrieben
> sind — **und das System behauptet es auch nicht.** Bis du antwortest, steht
> unter jedem dieser Namen *„(Originaltext — Sprache unbekannt)"*, und die
> Kacheln tragen den roten Rahmen. **Ein Knopf räumt das auf:** *„… Namen ohne
> Sprachangabe — alle als ⟨Sprache⟩ eintragen"* — stell die Pille auf die
> Sprache, in der du deinen Bestand eingetragen hast, und drück ihn. **Das ist
> der einzige Handgriff, den diese Runde von dir verlangt.**
>
> **DAMIT IST DER BEFUND AUS 0.24.6 BEHOBEN.** Ein Wechsel der Vorgabesprache
> verschiebt keine Namen mehr: **jeder Name sagt jetzt selbst, in welcher
> Sprache er geschrieben ist.**
>
> **DIE EXPORTDATEI TRÄGT DIE FORMATNUMMER 15.** Sie nimmt die
> Erstellungssprache mit. *Ältere Dateien lassen sich weiterhin einspielen —
> dann bleibt die Sprache unbekannt, und die Karte fragt wieder einmal nach.*
> **Eine Datei aus 0.25.0 lässt sich in eine ältere Instanz einspielen**, die
> beiden neuen Felder werden dort wortlos übergangen.
>
> **EIN NAME, DER IN ZWEI SPRACHEN GLEICH LAUTET, WIRD NICHT MEHR
> WEGGERÄUMT.** Bis 0.24.6 löschte das Speichern eine Übersetzung, die dem
> Grundnamen glich. *Weggeräumt wird ab jetzt mit dem Zeichen am Feld — mit
> Rückfrage.*
>
> **DIE KACHEL „Vokabular" TRÄGT DEN ROTEN RAHMEN, SOLANGE DER GEZEIGTEN
> SPRACHE WÖRTER FEHLEN.** Auf einer Installation, an der niemand eigene
> Vokabeln eingetragen hat, ist das von Anfang an so. *Es ist kein Fehler: was
> fehlt, ersetzt die Vorgabe der Sprachdatei, und die steht unter jedem Feld.*

*Was ein Betreiber merkt: die Sprachpillen sagen jetzt, wo noch Arbeit liegt —
ein Punkt heißt „vollständig", eine Zahl sagt, wie viele Einträge fehlen.*

- Added: **Jeder Name trägt seine Sprache** — Kategorien und Kriterien wissen, in welcher Sprache sie geschrieben sind
- Fixed: **Ein Wechsel der Vorgabesprache verschiebt keine Namen mehr** — bisher wanderte der ganze Bestand der Grundnamen auf die neue Sprachpille
- Added: **Auch ein gewöhnlicher Benutzer bekommt die volle Rückfallkette** — bisher sah nur die Adminkarte mehr als zwei Schritte
- Added: **Punkt und Zahl an jeder Sprachpille** — der Punkt heißt „für jede Zeile ist etwas eingetragen", die Zahl sagt, wie viele fehlen
- Added: **Roter Rahmen an einer Kachel, solange der gezeigten Sprache etwas fehlt** — an den drei Namenskarten und am Vokabular
- Added: **Ein Zeichen am Feld räumt einen Eintrag weg**, mit Rückfrage — der Originaltext bleibt
- Added: **Ein Knopf ordnet dem Bestand ohne Sprachangabe eine Sprache zu** — die einzige Nachfrage dieser Runde
- Added: **Nach einem Wechsel der Vorgabesprache sagt die Karte „Sprachen", was der neuen Sprache fehlt** — keine Glocke
- Added: **Ein geliehener Name steht blass und kursiv da**, mit dem Vermerk darunter
- Changed: **Das Austauschformat steigt auf 15** — die Erstellungssprache reist mit
- Changed: **Ein Name, der dem Grundnamen gleicht, wird nicht mehr weggeräumt** — er ist eine Übersetzung wie jede andere
- Security: **`multer`, `nodemailer`, `sharp` und `body-parser` auf den geprüften Stand gehoben** — `npm audit` meldet keine hohe Lücke mehr

## [0.24.6] - 2026-09-09

> **KEINE SICHERUNG NÖTIG.** Diese Runde legt keine Tabelle an, ändert kein
> Schema und lässt keinen Migrationsblock laufen. Einspielen und fertig.
>
> **DIE VERSIONSNUMMER IST GEWÖHNLICHES SemVer** — eine Reparatur bekommt eine
> PATCH-Nummer.
>
> **WER DIE VORGABESPRACHE SEINER INSTALLATION WECHSELT, SOLLTE DANACH IN
> „Einstellungen → Bestand" NACHSEHEN.** Kategorien und Kriterien haben eine
> **Grundzeile**, und die trägt keinen Sprachvermerk: ihr Name gilt immer als
> der der *aktuellen* Vorgabesprache. **Wechselst du die Vorgabesprache,
> wandert der ganze Bestand dieser Namen auf die neue Pille** — dort stehen
> danach Namen, die niemand in dieser Sprache eingegeben hat, und die alte
> Pille steht leer da. **An deinem Bestand ändert das nichts** — kein Name geht
> verloren, keine eingetragene Übersetzung wandert. Es ist eine Frage der
> Zuordnung, und sie ist mit dieser Runde **benannt und nicht behoben**: unter
> der Sprachzeile steht jetzt ein Hinweis, sobald die Vorgabesprache gezeigt
> wird. *Der saubere Weg — ein Sprachvermerk an der Grundzeile — ist eine
> Datenbankstufe und kommt in einer eigenen Runde.*
>
> **BIS ZU DIESER VERSION KONNTE DER VERMERK UNTER EINEM NAMEN DIE FALSCHE
> SPRACHE NENNEN.** Betroffen waren nur Zeilen, für die weder die gezeigte noch
> die Vorgabesprache einen Eintrag trägt. **Es war eine Falschauskunft und kein
> Schaden am Bestand** — geschrieben wurde nichts.
>
> **UND EINER HAT DOCH GESCHRIEBEN — SIEH DEINE KRITERIEN DURCH.** Bis zu
> dieser Version benannte das Ändern eines **Gewichts** den Grundnamen des
> Kriteriums um, sobald die Sprachzeile über der Karte auf einer anderen
> Sprache als der Vorgabesprache stand: der dort angezeigte Name wanderte in
> den Grundnamen. **Wer Gewichte nur auf der Vorgabesprache verstellt hat, ist
> nicht betroffen.** *Ein umbenannter Grundname lässt sich in derselben Karte
> wieder richtigstellen — auf der Pille der Vorgabesprache umbenennen.*

*Was ein Betreiber merkt: unter einem Namen ohne eigene Übersetzung steht
jetzt die Sprache, die er wirklich vor sich hat — und wenn es keine gibt, sagt
der Vermerk das, statt eine zu nennen.*

- Fixed: **Der Vermerk unter einem Namen nennt die Sprache, die wirklich dasteht** — bisher die Vorgabesprache, auch wenn deren Name gar nicht gezeigt wurde
- Fixed: **Nach einem Wechsel der Vorgabesprache stimmen die drei Verwaltungskarten sofort** — bisher erst nach einem Neuladen
- Added: **Ist für die Vorgabesprache nichts eingetragen, wird die nächste Sprache des Vorrats genommen, die etwas trägt** — statt stillschweigend die Sprache des Lesers
- Added: **Trägt keine einzige Sprache etwas, nennt der Vermerk keine** — er sagt nur noch, dass nichts eingetragen ist
- Added: **Unter der Sprachzeile steht ein Hinweis, sobald die Vorgabesprache gezeigt wird** — dort stehen die Namen der Grundzeile, gleichgültig in welcher Sprache sie eingetragen wurden
- Fixed: **Das Gewicht eines Kriteriums zu ändern benennt nichts mehr um** — auf einer anderen Sprachpille als der der Vorgabesprache wanderte bisher der angezeigte Name in den Grundnamen

## [0.24.5] - 2026-09-08

> **KEINE SICHERUNG NÖTIG.** Diese Runde legt keine Tabelle an, ändert kein
> Schema und lässt keinen Migrationsblock laufen. Einspielen und fertig.
>
> **DIE VERSIONSNUMMER IST GEWÖHNLICHES SemVer** — eine Reparatur bekommt eine
> PATCH-Nummer. Die benannte Abweichung von 0.24.3 und 0.24.4 ist mit 0.24.4
> zu Ende und wird hier nicht wieder geöffnet.
>
> **BIS ZU DIESER VERSION HAT DIE SPRACHZEILE ÜBER „KATEGORIEN" UND ÜBER DEN
> BEIDEN KRITERIENKARTEN NICHT GETAN, WAS SIE VERSPRICHT.** Wer angemeldet war
> — und das ist dort jeder —, bekam auf jede Pille die Liste seiner **eigenen**
> Sprache; nach einem Wechsel der eigenen Sprache sogar die einer dritten. **An
> deinem Bestand hat das nichts geändert**: es war ein Fehler beim Lesen, nicht
> beim Schreiben. Was du in dieser Zeit *umbenannt* hast, ist trotzdem in der
> Sprache gelandet, auf die die Pille zeigte — der Schreibweg war richtig.
> **Sieh die drei Karten einmal durch**, jetzt zeigen sie die Wahrheit.
>
> **DIE KACHEL „VOKABULAR" WAR NIE BETROFFEN** und ist in dieser Runde nicht
> angefasst worden.

*Was ein Betreiber merkt: die Sprachpille über den drei Verwaltungskarten zeigt
endlich die Sprache, auf der sie steht — und eine Zeile ohne eigene Übersetzung
sagt jetzt, dass sie eine fremde zeigt.*

- Fixed: **Die Sprachpille über „Kategorien", „Bewertung: Kriterien" und „Potenzial: Kriterien" zeigt die Namen der Sprache, auf der sie steht** — bisher immer die des Lesers
- Fixed: **Nach einem Wechsel der eigenen Sprache zeigt dieselbe Pille dasselbe wie vorher** — bisher die Liste der zuvor gelesenen Sprache
- Fixed: **Nach dem Umbenennen, Anlegen, Löschen und Sortieren bleibt die Liste in der Sprache der Pille** — bisher fiel sie auf die des Lesers zurück
- Added: **Eine Zeile ohne eigene Übersetzung sagt es** — unter dem Namen steht gedämpft, dass nichts eingetragen ist und welche Sprache stattdessen dasteht
- Changed: **Das Umbenennfeld zeigt nur, was für die gewählte Sprache eingetragen ist** — der Rückfall steht als Platzhalter darin und wird beim Speichern nicht mehr zum Eintrag
- Changed: **Wer nicht verwalten darf, sieht die Sprachzeile nicht** — er sieht die Namen in der Sprache, die er eingestellt hat

## [0.24.4] - 2026-09-08

> **KEINE SICHERUNG NÖTIG.** Diese Runde legt keine Tabelle an, ändert kein
> Schema und lässt keinen Migrationsblock laufen. Einspielen und fertig.
>
> **DIE VERSIONSNUMMER IST DIESELBE BENANNTE ABWEICHUNG WIE 0.24.3** — und mit
> dieser Runde endet sie. Nach SemVer gehörte die dritte Sprache auf 0.25.0;
> sie trägt 0.24.4, weil die 24er-Reihe ein Vorhaben ist. **Ab 0.25.0 gilt die
> Regel wieder ohne Ausnahme** (Projektstand, Abschnitt 5.1).
>
> **EIN EINGETRAGENES VOKABELWORT KANN IN DER FALSCHEN SPRACHE STEHEN** — wenn
> es unter 0.24.3 eingetragen wurde. Der Fehler ist repariert; was er in die
> Datenbank geschrieben hat, bleibt dort stehen. **Sieh in „Einstellungen →
> Bestand → Vokabular" nach:** Felder, die du nie ausgefüllt hast, tragen
> womöglich die Vorgaben einer anderen Sprache. Leeren und speichern setzt sie
> wieder auf die Vorgabe.
>
> **DIE SUCHE FINDET AB JETZT MEHR.** `İ`, `I`, `ı` und `i` gelten als
> dasselbe Zeichen — ein türkischer Name in einem deutschen Bestand wird
> dadurch gefunden. Am deutschen und englischen Bestand ändert sich nichts.
>
> **`tr.json` IST VOLLSTÄNDIG, GEPRÜFT UND AM BILDSCHIRM GESEHEN** — in drei
> Sprachen, am Telefon und am großen Schirm. **Das Gegenlesen der Wörterliste
> übernimmt der Betreiber selbst**, wie schon bei Englisch. Wer einzelne
> Wörter anders haben will, ändert sie unter „Einstellungen → Bestand →
> Vokabular"; die Sätze stehen in der Datei.
>
> **NACH EINER ZAHL STEHT AUF TÜRKISCH DIE EINZAHL** — „3 öğe", nicht
> „3 öğeler". Die fünf Vokabelpaare tragen deshalb in beiden Formen dasselbe
> Wort. *Das ist so gewollt und keine fehlende Übersetzung.*

*Was ein Betreiber merkt: Kriterion spricht Türkisch. Und die Karte
„Vokabular" zeigt endlich das, was wirklich eingetragen ist.*

- Added: **Türkisch** — `public/languages/tr.json`, dieselben 1209 Schlüssel wie die deutsche Datei
- Added: **Ein Anlegefeld in den Karten „Kategorien" und „Tags"** — bisher ging das nur am Eintrag
- Fixed: **Was für eine Sprache eingetragen wurde, steht jetzt in dieser Sprache da.** Leere Felder wurden bisher als Eintrag gespeichert und in jede andere Sprache weitergereicht
- Fixed: **Wer seine eigene Sprache wechselt, wechselt auch die vierzehn Vokabelwörter** — bisher blieben sie in der alten stehen
- Fixed: **Der Hinweis „Vorgabe: …" folgt der gewählten Sprache** und nicht mehr der des Lesers
- Fixed: **Die Bildlaufstellung bleibt beim Umschalten der Sprache stehen**
- Fixed: **Die Suche gibt zwei Lesern verschiedener Sprache dieselbe Antwort** — die beiden Hälften falteten unterschiedlich
- Fixed: **„İstanbul" wird als „istanbul" und als „ISTANBUL" gefunden**, „Iğdır" als „ığdır"
- Fixed: **Der Wiederherstellen-Knopf im Papierkorb zeigte seinen Bildcode als Text**
- Fixed: **Zwei deutsche Wörter standen auf jeder Oberfläche** — „alle N anzeigen" und „N aktiv"
- Changed: **Leere Kästen zeigen kein Bildzeichen mehr** — der Satz „Noch keine Kommentare." steht für sich

## [0.24.3] - 2026-09-08

> **VOR DEM EINSPIELEN EINE SICHERUNG ZIEHEN.** Diese Runde legt zwei Tabellen
> an und schreibt gespeicherte Werte um — drei Migrationsblöcke laufen beim
> ersten Start von selbst und sind an einem gestellten Altbestand geprüft.
>
> **DEIN BESTAND SPRICHT WEITER DEUTSCH.** Nur eine FRISCH eingerichtete
> Installation startet auf Englisch. Am Bildschirm ändert sich für dich damit
> kein Wort, solange du nichts umstellst.
>
> **DIE VERSIONSNUMMER IST EINE BENANNTE ABWEICHUNG.** Nach SemVer gehörte
> diese Runde auf 0.25.0; sie trägt 0.24.3, weil sie zur 24er-Reihe gehört —
> entschieden am 7. September 2026, nachzulesen im Projektstand, Abschnitt 5.1.
>
> **EINE EXPORTDATEI AUS 0.24.2 SPIELT SICH WEITER EIN.** Das Austauschformat
> steigt auf 14 und trägt jetzt alle Sprachfassungen der Kriterien- und
> Kategorienamen mit; ältere Dateien laufen unverändert durch.

*Was ein Betreiber merkt: Kriterion spricht Englisch. Jeder Zugang wählt
selbst, welche Sprache er liest — der Wechsel wirkt sofort, ohne Neuladen, und
der andere am selben Bildschirm merkt nichts davon.*

- Added: **Englisch** — `public/languages/en.json`, dieselben 1204 Schlüssel wie die deutsche Datei
- Added: **Jeder Zugang wählt seine Sprache** in der Karte „Darstellung" — sie gilt auf jedem Gerät, an dem er sich anmeldet
- Added: **Die Anmeldeseite spricht die Vorgabesprache der Installation** — dort gibt es nichts umzuschalten
- Added: **Neue Karte „Sprachen"** im Abschnitt „Installation" (Eigentümer): die Vorgabesprache und der Vorrat, aus dem gewählt werden darf
- Added: **Wer nichts einstellt, bekommt, was sein Browser verlangt** — `Accept-Language` gilt, sofern die Sprache im Vorrat steht
- Added: **Das Vokabular je Sprache** — mit Rückfall: wo für eine Sprache nichts eingetragen ist, steht der zuerst angelegte Satz, sonst die Vorgabe
- Added: **Kriterien und Kategorien je Sprache** — der Eigentümer trägt die zweite Fassung ein, wo keine steht, gilt die der Vorgabesprache; die Bewertungen hängen unverändert daran
- Added: **Eine Sprachdatei lässt sich hineinlegen** — jede `.json` unter `public/languages/` zählt; eine unbrauchbare wird namentlich gemeldet und übergangen, statt den Server umzubringen
- Changed: **Das Austauschformat steigt auf 14** — der Export trägt alle Sprachfassungen der Namen mit
- Fixed: **`<html lang>` steht wieder** — es war seit 0.24.1 leer, weil das Attribut beim Umbenennen für ein Wort gehalten wurde
- Fixed: **Die Statusvorgabe der Potenzialsortierung greift wieder** — sie war seit 0.24.1 stumm
- Fixed: **Die Bildumstellung meldet ihren Stand wieder** — sie stand seit 0.24.1 auf „null"
- Fixed: **Die Trefferzeile an der Kachel nennt die Quelle wieder** — fünf von sieben hießen seit 0.24.1 „Fundstelle"
- Fixed: **Zwei deutsche Wörter im Quelltext** — „geladen" am Teil-Knopf und „ am" vor dem Datum der Exportdatei stehen jetzt in der Sprachdatei

## [0.24.2] - 2026-09-07

> **VOR DEM EINSPIELEN EINE SICHERUNG ZIEHEN.** Diese Runde schreibt
> gespeicherte Werte um. Die Migration läuft beim ersten Start von selbst und
> ist an einem echten 0.24.0er Bestand geprüft; wer von 0.24.0 kommt, fährt
> beide Migrationen in einem einzigen Start.
>
> **WER 0.24.1 SCHON LAUFEN HAT UND DIE KARTE „SUCHMASCHINEN" GESPEICHERT
> HAT**, trägt seine eigenen Suchmaschinen neu ein: die Karte stand leer da,
> und „Übernehmen" hat die leeren Felder übernommen. **Wer sie nicht angefasst
> hat, bekommt sie mit dieser Runde zurück** — verloren war nichts.

*Was ein Betreiber merkt: drei Dinge sind wieder da, die 0.24.1 unsichtbar
gemacht hat. 0.24.1 hat die Schlüssel der Einstellungen umbenannt, aber nicht
die Feldnamen in den gespeicherten Werten darin; die Zeilen lagen unverändert
in der Datenbank, und Kriterion las an ihnen vorbei.*

- Fixed: **Die eigenen Suchmaschinen stehen wieder in der Karte** — und wieder im Vorrat der Suchzeile
- Fixed: **Der Mailzugang gilt wieder als eingerichtet** — Einladung, Rücksetzung und Bestätigung gehen wieder hinaus, und die Selbstanmeldung lässt sich wieder einschalten
- Fixed: **„Zuletzt getestet" steht wieder am Mailversand** — eine neue Testmail ist nicht nötig, der alte Beleg gilt weiter

## [0.24.1] - 2026-09-07

> **VOR DEM EINSPIELEN EINE SICHERUNG ZIEHEN.** Diese Runde benennt Tabellen,
> Spalten und gespeicherte Werte der Datenbank um. Die Migration läuft beim
> ersten Start von selbst und ist geprüft — an einem echten Altbestand, 21
> Zusagen grün. **Es gibt trotzdem keinen Weg zurück:** eine ältere Fassung
> kann die umbenannte Datenbank nicht mehr lesen.
>
> **UND EINE ZEILE IN DER `.env` LESEN.** Fünf Umgebungsvariablen heißen anders.
> **Die alten Namen werden weiter gelesen** und schreiben beim Start eine Zeile
> ins Containerprotokoll — nichts bricht, aber wer sie umstellt, hat es hinter
> sich: `OEFFENTLICHE_ADRESSE` → `PUBLIC_ADDRESS`, `HINTER_PROXY` →
> `BEHIND_PROXY`, `PORT_VERSATZ` → `PORT_OFFSET`, `SICHERUNG_DIR` →
> `BACKUP_DIR`, `NEUER_SCHLUESSEL` → `NEW_KEY`.

*Was ein Betreiber merkt: am Bildschirm kein Wort — und drei Dinge, die wieder
gehen. Unter der Haube spricht der ganze Quelltext Englisch: Namen, Adressen,
Dateinamen, die Datenbank. Ein Lesezeichen auf eine alte Adresse führt weiter
ans Ziel; ein Einladungslink aus einer verschickten Mail auch.*

- Fixed: **Die Vorschaubilder im Eintrag sind wieder anklickbar** — mit der Maus und mit dem Finger; mit den Pfeiltasten ging es die ganze Zeit
- Fixed: **Ein Tag am Testtag zeigt wieder seinen Namen** statt eines „t" — und sein Kreuz entfernt wieder das richtige Tag
- Fixed: **Der zugeklappte Block „Links" zeigt wieder die ersten Zeilen** statt der letzten; „alle N anzeigen" bleibt der Weg zum Rest
- Fixed: Das Abzeichen des Eigentümers und der grüne Punkt am aktiven Zugang sind wieder gefärbt
- Changed: **Jeder Name im Quelltext ist englisch** — Bezeichner, Schlüssel der Sprachdatei, ids, Klassen, Stilblattvariablen, Dateinamen, Umgebungsvariablen
- Changed: **Tabellen, Spalten und gespeicherte Werte der Datenbank heißen englisch** — die Migration läuft beim ersten Start
- Changed: Die Adressen heißen englisch (`#/offen` → `#/open`, `#/einladung/` → `#/invite/`, `#/bestaetigung/` → `#/confirm/`) — **jede alte Adresse wird übersetzt**
- Changed: Die API-Wurzeln heißen englisch (`/api/sicherung` → `/api/backup` und acht weitere) — sie werden nur von der eigenen Oberfläche gerufen
- Changed: Die Sprachdatei liegt jetzt unter `public/languages/` statt `public/sprachen/`
- Changed: Ältere Exportdateien werden beim Einlesen übersetzt — ein Export aus 0.24.0 spielt sich unverändert ein

## [0.24.0] - 2026-09-06

*Was ein Betreiber merkt: nichts — und genau das ist der Punkt. Jeder Satz der Oberfläche ist aus dem Programm in eine eigene Datei gezogen (`public/sprachen/de.json`); Kriterion sieht danach Zeichen für Zeichen aus wie vorher. Zwei Dinge sind trotzdem anders: die Zeitleiste ist im hellen Schema wieder zu sehen, und die Tags im Filter stecken hinter einem Umschalter statt hinter „Weitere Filter". Keine Datenbankstufe; nach dem Einspielen im Browser einmal hart neu laden.*

- Added: **Alle Texte der Oberfläche stehen in einer Datei** — `public/sprachen/de.json`, 1190 Einträge. Grundlage für weitere Sprachen; in dieser Runde ändert sich kein Wort
- Added: Fehlt die Sprachdatei, sagt die Oberfläche das in einem Satz — und der Server startet gar nicht erst
- Fixed: **Die Zeitleiste der Testtage war im hellen Schema unsichtbar** — Linie, Mittelstrich und Jahreszahl haben jetzt eigene Farben mit ausreichendem Kontrast
- Changed: **„Weitere Filter" ist ein Umschalter „Tags" mit Zahl geworden**, rechts in der Kategoriezeile — die Filterleiste ist gut zwei Zeilen schmaler, und ohne Tags am Bestand steht er gar nicht erst da
- Changed: Datum, Uhrzeit, Wochentag, Zahlen mit Komma und die Sortierung folgen jetzt der eingestellten Sprache statt einer festen deutschen Regel — für Deutsch sieht alles aus wie vorher
- Changed: Einzahl und Mehrzahl wählt die Sprachregel statt eines Vergleichs auf 1

## [0.23.0] - 2026-09-05

*Was ein Betreiber merkt: es gibt jetzt ein helles Farbschema, und jeder stellt für sich ein, welches er sieht — in „Einstellungen → Persönlich → Darstellung". Die Vorgabe bleibt dunkel: wer nichts einstellt, sieht, was er heute sieht. Keine Datenbankstufe; nach dem Einspielen im Browser einmal hart neu laden.*

- Added: **Ein helles Farbschema** — umschaltbar in der Karte „Darstellung", drei Stufen: **Hell · Dunkel · Wie das Gerät**. Persönlich je Zugang, ein Wert für alle Geräte, wirkt sofort
- Added: „Wie das Gerät" folgt der Einstellung des Betriebssystems und wechselt mit ihr — ohne Neuladen
- Changed: Beim Öffnen blitzt kein falsches Schema mehr auf; der Browser merkt sich die letzte Wahl und malt gleich richtig, auch vor der Anmeldung
- Changed: Die Farbe der Browserleiste folgt dem Schema
- Changed: **Das Vollbild bleibt in beiden Schemata dunkel** — im hellen aber dunkelgrau statt fast schwarz, dort, wo Bildwerkzeuge ihr Umfeld haben. Ein fast schwarzer Rand lässt Fotos heller erscheinen, als sie sind
- Changed: Ein abgelehnter Eintrag wird im hellen Schema nach hell gedämpft statt nach dunkel — sonst wäre er der lauteste Fleck der Seite
- Changed: Die Marke folgt dem Schema; auf hellem Grund war sie vorher kaum zu sehen

## [0.22.1] - 2026-09-05

*Was ein Betreiber merkt: der Bildausschnitt lässt sich schieben und an Ecken und Kanten ändern, die Kopfzahl steht nur noch einmal da, und an ungetesteten Einträgen gibt es keinen Bewertungskasten mehr. Keine Datenbankstufe; nach dem Einspielen im Browser einmal hart neu laden.*

- Changed: **Der Bildausschnitt bedient sich wie ein Ausschnitt** — außerhalb ziehen zieht einen neuen auf, im Rahmen ziehen schiebt ihn, an vier Ecken und vier Kanten wird er größer oder kleiner; die gegenüberliegende Ecke bzw. Kante bleibt dabei liegen
- Changed: **An einem ungetesteten Eintrag gibt es den Bewertungskasten nicht mehr** — er ist weg statt zugeklappt und nimmt keinen Platz; der Server weist eine Bewertung dort ebenfalls ab. *Sterne wegnehmen geht weiter, und ein ungetesteter Eintrag mit vorhandenen Sternen zeigt seinen Kasten*
- Changed: Der Kopf eines zugeklappten Sternkastens zeigt seine Zahl nur noch einmal — bis 0.22.0 stand dort dieselbe Zahl zweimal, „(⌀ 2,1)" und „⌀ 2,1 gewichtet"
- Added: Die Kopfzahl sagt jetzt, wessen Zahl sie ist — Durchschnitt über alle Benutzer, nicht nur der eigene; im Titel und im Erklärkasten dahinter
- Added: Der Zeiger sagt vor dem Drücken, welche Geste unter ihm liegt
- Changed: Ein Griff in den Rahmen, der sich nicht bewegt, ändert nichts mehr; ein Klick außerhalb setzt weiterhin den Punkt
- Changed: Auf dem Telefon schiebt ein Tipp in den Rahmen ihn, die Größe bleibt beim Schieber

## [0.22.0] - 2026-09-04

*Was ein Betreiber merkt: die Wörter sind andere, der Bildstreifen ist einstellbar, und die Sternzeile hat ihren Rücksetzknopf woanders. Keine Datenbankstufe; nach dem Einspielen im Browser einmal hart neu laden.*

- Changed: **Die Wörter sind andere** — „Einstellungen" statt „Systembereich", „Mein Konto" und „Benutzer" statt „Zugang" und „Zugänge", „Registrierung" statt „Selbstanmeldung", „Wer hat bewertet" statt „Stimmen", „Bildformate" statt „Bildablage", „Suchmaschinen" statt „Suchanbieter", „Alle" statt „Alles anzeigen"; rund 250 Textstellen nach einem Wörterbuch, die Servermeldungen eingeschlossen
- Changed: „Bewertung" ist Vokabelwort, als Paar (Einzahl und Mehrzahl) — es ändert Kastenkopf, Sortierung, Vergleich, Kachel und Karte
- Added: Die Größe der Bilder im Bildstreifen der Detailansicht ist einstellbar — fünf Stufen von 60 bis 150 px, persönlich, in der Karte „Darstellung"; der Streifen nutzt auf jedem Schirm die volle Breite
- Added: Der Bildausschnitt lässt sich mit der Maus als Rechteck aufziehen; der Schieber bleibt daneben
- Changed: **Der Rücksetzknopf der Sternzeile steht ganz rechts hinter der Durchschnittszahl**, als runder Knopf mit eigener Spalte — und die Meldung danach trägt „Rückgängig"
- Changed: Alle Rückfragen laufen über eigene Fenster statt über die Browserfenster; einen Benutzer löschen fragt in EINEM Fenster mit zwei Häkchen, und „Abbrechen" bricht ab; ein fremdes Passwort wird in einem Passwortfeld eingegeben
- Changed: Kein Milchglas mehr — die Kopfzeile ist deckend und setzt sich beim Rollen mit einem Schatten ab; Kacheln heben sich beim Überfahren um zwei Pixel, Listenzeilen und Pillen antworten auf den Zeiger
- Changed: Rolle und Zustand in der Benutzerliste sind Marken statt grauer Wörter; Beschriftungen der Blöcke sind größer und heller; Ziffern stehen tabellarisch
- Changed: Server-Befehle stehen nur noch im Kasten „Auf dem Server" mit Kopierknopf, den allein der Eigentümer sieht; den Schlüssel im Klartext sieht nur der Eigentümer; der Knopf „Eintrag löschen" erscheint nur für Verfasser und Admin
- Changed: Die Tagzeile der Filterleiste steht hinter dem Aufklapper „Weitere Filter" — offen, sobald ein Tagfilter greift
- Changed: Erklärtexte an den Karten sind ein Satz; was Admin und Eigentümer darüber hinaus lesen, steht hinter „Mehr"

## [0.21.1] - 2026-09-04

- Added: Die Sortierung gibt den Statusfilter vor — Bewertung stellt ihn auf „Getestet", Potenzial auf „Ungetestet"
- Added: Die vorgegebene Statuspille ist gestrichelt statt ausgefüllt, und daneben steht „folgt der Sortierung"
- Added: Eingeklappt sagt der Filterschalter dasselbe — „· folgt der Sortierung"
- Changed: **Wer nach Bewertung oder Potenzial sortiert, sieht ab jetzt eine andere Menge als vorher** — die jeweils andere Hälfte des Bestands steht nicht mehr in der Liste
- Changed: „Filter zurücksetzen" nimmt auch die Handwahl am Status mit zurück — danach folgt er wieder der Sortierung
- Changed: Ein Klick auf eine Statuspille und eine angewandte gespeicherte Ansicht schlagen die Vorgabe und halten über den Wechsel der Sortierung hinweg
- Changed: Die Vorgabe wird nicht gespeichert und nicht mitgezählt — geschrieben und gezählt wird nur, was jemand selbst gesetzt hat

## [0.21.0] - 2026-09-04

> **DIES IST EINE DATENBANKSTUFE — SICHERUNG VOR DEM EINSPIELEN.** Ein
> Migrationsblock kommt dazu: `rating_criteria` bekommt die Spalte `phase`,
> und **alle vorhandenen Kriterien stehen danach auf „nachher"**, also weiter
> in der Bewertung. *Es wird nichts umgerechnet und nichts gelöscht; kein
> Gesamtschnitt ändert sich.* Das Austauschformat rückt auf **13**.
>
> **DER RÜCKWEG AUF 0.20.1 BLEIBT TECHNISCH OFFEN** — die zusätzliche Spalte
> stört eine ältere Fassung nicht. *Dort zählten Sterne aus dem neuen Kasten
> aber wieder in die Bewertung mit.* **Nach dem Einspielen im Browser einmal
> hart neu laden.**
>
> **JEDER EINTRAG HAT AB JETZT ZWEI STERNKÄSTEN.** Neben „Bewertung" (wie gut
> war es) steht **„Potenzial"** (wie sehr will ich es) mit **eigenen
> Kriterien**. Die beiden Durchschnitte **berühren einander nicht** — kein
> Stern des einen zählt im anderen. **Der Potenzialkasten ist leer, bis du im
> Systembereich Kriterien dafür anlegst**; bis dahin sieht der Eintrag aus wie
> bisher.
>
> **ZWEI ÄNDERUNGEN AM GEWOHNTEN VERHALTEN.** *Erstens:* der Knopf **„Meine
> Bewertung zurücksetzen"** ist weg — zurückgesetzt wird jetzt **je Zeile über
> ein × an den eigenen Sternen**. *Zweitens:* welcher der beiden Sternkästen
> offen steht, **entscheidet ab jetzt der Eintrag und nicht mehr deine
> Einstellung** — ungetestet: Potenzial offen; getestet: Bewertung offen. Ein
> Klick auf die Kopfzeile gilt für diesen Eintrag und wird nicht gespeichert.
> **Wer den Bewertungsblock bisher dauerhaft zugeklappt hatte, sieht ihn an
> getesteten Einträgen wieder offen.**

- Added: Zweiter Sternkasten „Potenzial" an jedem Eintrag — eigene Kriterien, eigene Gewichte, eigener Durchschnitt
- Added: Systemkarte „Potenzial: Kriterien" neben „Bewertungskriterien" — gleiche Bedienung, eigene Liste
- Added: Sortierung „Potenzial (hoch → niedrig)" und „(niedrig → hoch)"
- Added: Die Kachel zeigt an ungetesteten Einträgen „◆ 4,2" statt „★ 3,8" — ein anderes Zeichen für eine andere Frage
- Added: Der Vergleich zeigt zwei Gruppen von Zeilen, je mit eigener Kopfzahl
- Added: „Potenzial" ist das zwölfte Wort im Vokabular und umbenennbar
- Added: Ein × an der eigenen Sternzeile setzt genau dieses Kriterium zurück
- Added: Die Exportdatei trägt das Feld `criteriaPhase`; das Format rückt auf 13
- Changed: Welcher Sternkasten offen steht, entscheidet der Zustand des Eintrags — nicht mehr die gespeicherte Einstellung
- Changed: Die leere Durchschnittsspalte zeigt „–" statt nichts, und sie hat ihre Breite von Anfang an — die Sterne springen beim ersten Stern nicht mehr nach links
- Changed: Auf dem Telefon steht der Kriterienname über den Sternen statt daneben
- Changed: Der Knopf „Wer hat bewertet" heißt „Stimmen" und steht in beiden Kastenköpfen
- Removed: Der Knopf „Meine Bewertung zurücksetzen" und die Route `DELETE /api/items/:id/ratings` dahinter
- Removed: Der Doppelklick auf die Sterne, der ein Kriterium zurücksetzte — samt seinem Hinweistext, den kein Telefon zeigte
- Fixed: Ein Import, der ein Kriterium unter demselben Namen im anderen Kasten mitbringt, wird abgewiesen, bevor etwas geschrieben ist

## [0.20.1] - 2026-09-03

> **NICHTS ZU TUN — außer im Browser einmal hart neu zu laden.** Keine
> Datenbankstufe, keine Migration, kein neuer Index; das Austauschformat bleibt
> 12. **Die Regel, die Knöpfe und deine Einstellungen bleiben, wie sie sind** —
> es ändert sich nur, was die Karte zeigt und wie viel sie dazu schreibt.
>
> **DIE KARTE „ALTE SICHERUNGEN" LISTET JETZT ALLE SICHERUNGEN.** Jüngste
> zuerst, durchnummeriert, mit Datum, Alter und Größe; ab der sechsten Zeile
> rollt die Liste. **Gelöscht wird darin nichts** — die Liste ist zum Ansehen,
> und welche Sicherung beim nächsten Lauf fällt, steht als Marke an ihrer Zeile.
>
> **DIE KARTE „SICHERUNG" ZEIGT DAFÜR NUR NOCH DIE LETZTE SICHERUNG.** Die
> Zeile „Dateien am Ort" ist heraus: die Liste daneben sagt es vollständig.

- Added: Die Karte „Alte Sicherungen" listet alle Sicherungen — Nummer, Datum, Alter und Größe, jüngste zuerst
- Added: Ab der sechsten Zeile rollt die Liste, statt die Karte aufzuziehen
- Added: An jeder Zeile steht, ob sie beim nächsten Lauf gelöscht wird oder nur mit dem alten Schlüssel zu öffnen ist
- Changed: Die Texte auf der Karte sind deutlich kürzer — dieselbe Aussage, weniger Worte
- Changed: Die Felder heißen „Mindestens behalten" und „Löschen ab Alter (Tage)"
- Changed: Die Karte „Sicherung" zeigt nur noch die letzte Sicherung; die Zeile „Dateien am Ort" ist entfallen

## [0.20.0] - 2026-09-03

> **ES KOMMT EIN SCHALTER DAZU, DER DATEIEN ENTFERNT — UND ER STEHT AUF AUS.**
> Kriterion kann ab jetzt alte Sicherungen wegräumen; **bis du den Schalter in
> der neuen Karte „Alte Sicherungen" umlegst, geschieht das nicht.** *Beim
> ersten Start nach dem Einspielen passiert nichts von selbst.*
>
> **DIE REGEL HAT ZWEI BEDINGUNGEN, UND BEIDE MÜSSEN ZUTREFFEN:** eine Kopie
> fällt nur, wenn sie **nicht unter den jüngsten drei** ist **und** **älter als
> 30 Tage**. Beide Zahlen lassen sich einstellen. *Die Karte zeigt vorher
> namentlich, welche Dateien fallen würden — mit Datum, Alter und Größe.*
> **Einen Papierkorb gibt es dafür nicht:** eine gelöschte Sicherung ist weg.
>
> **AUFGERÄUMT WIRD NUR NACH EINER SICHERUNG, DIE GELUNGEN IST** — oder auf
> Knopfdruck. **Eine Zeitsteuerung gibt es nicht.**
>
> **DEINE EIGENEN DATEIEN IM SICHERUNGSORDNER BLEIBEN LIEGEN.** Angefasst wird
> ausschließlich, was `kriterion-….sqlite` heißt; Unterverzeichnisse werden
> nicht betreten. **Kopien von vor einem Schlüsselwechsel fasst die Regel gar
> nicht an** — für die gibt es einen eigenen Knopf.
>
> **Keine Datenbankstufe, keine Migration, kein neuer Index**, das
> Austauschformat bleibt 12.

- Added: Alte Sicherungen lassen sich jetzt über die Oberfläche entfernen — bisher ging das nur mit einer Shell auf dem Wirt
- Added: Neue Karte „Alte Sicherungen" im Systembereich unter „Datenbank", beim Eigentümer
- Added: Eine Vorschau nennt vorher namentlich, welche Kopien fallen würden, mit Datum, Alter und Größe — und was das an Platz freigibt
- Added: Ein Schalter räumt im Anschluss an jede gelungene Sicherung auf; er steht auf aus
- Added: Ein Knopf wendet die Regel einmal an, hinter der Passwortabfrage
- Added: Ein zweiter Knopf entfernt die Kopien von vor einem Schlüsselwechsel — ausdrücklich und getrennt
- Added: Jede entfernte Kopie steht im Sicherheitsprotokoll unter „Bestand", ohne Dateinamen
- Changed: Die Karte „Sicherung" bleibt unverändert — sie legt Kopien an, die neue Karte räumt sie weg

## [0.19.6] - 2026-09-03

> **NICHTS ZU TUN — außer im Browser einmal hart neu zu laden.** Keine
> Datenbankstufe, keine Migration, kein neuer Index, kein Nachziehen von
> Vorschaubildern; das Austauschformat bleibt 12.
>
> **DIE ROTE MELDUNG BEIM ZURÜCKGEHEN IST WEG.** Wer einen Bildausschnitt
> gespeichert und sofort auf die Übersicht geklickt hat, bekam unten einen
> roten Kasten — *„can't access property innerHTML"*. **Gespeichert war der
> Ausschnitt dabei jedes Mal**; die Meldung war falsch, nicht der Vorgang.
> *Jetzt steht dort die Bestätigung, die auch sonst dort steht.*

- Fixed: Keine rote Fehlermeldung mehr, wenn man direkt nach dem Speichern eines Bildausschnitts zur Übersicht zurückgeht — der Ausschnitt war dabei immer gespeichert
- Fixed: Dasselbe beim Löschen und beim Hochladen von Bildern und Videos — auch dort wird die Ansicht nicht mehr angefasst, wenn sie schon fort ist
- Changed: Die Bestätigung „Bildausschnitt gespeichert" erscheint jetzt auch dann, wenn die Ansicht schon gewechselt ist
- Changed: Die Karte „Bildablage" meldet „Vorschaubilder erneuert" statt „gebacken" — dasselbe Wort steht jetzt im ganzen Projekt

## [0.19.5] - 2026-09-03

> **BEIM ERSTEN START RECHNET KRITERION ALLE VORSCHAUBILDER EIN ZWEITES MAL
> NEU** — 0.19.4 hat es schon einmal getan. Das geschieht von selbst, im
> Hintergrund, und die Karte „Bildablage" zählt dabei mit. *Keine
> Datenbankstufe, keine Migration, kein neuer Index, das Austauschformat bleibt
> 12.* **Nach dem Einspielen im Browser einmal hart neu laden.**
>
> **DIE DATENBANK WIRD DABEI IN DER REGEL KLEINER.** Ein Vorschaubild ist
> danach quadratisch und trägt genau das, was die Kachel zeigt — gemessen an
> zwölf Seitenverhältnissen rund ein Drittel weniger Bytes. *Nur ein sehr
> breites Panoramabild kann größer werden; dafür ist seine Kachel danach
> scharf.* **Eine Sicherung vor dem Einspielen schadet nie:** die alten
> Vorschaubilder sind danach weg. *Sie lassen sich aus den Originalen und den
> drei gespeicherten Zahlen jederzeit wieder herstellen — deshalb ist es keine
> Datenbankstufe.*
>
> **DER BILDAUSSCHNITT STECKT AB JETZT IM VORSCHAUBILD.** Bisher hat der
> Browser ihn beim Anzeigen zurechtgezogen; jetzt schneidet der Server ihn
> hinein. **Für dich ändert sich an der Bedienung nichts** — derselbe Knopf,
> derselbe Schieber, dasselbe Ergebnis, nur scharf. *Das Original bleibt
> unangetastet, der Ausschnitt jederzeit änderbar.*
>
> **EINE STELLE ZEIGT DANACH MEHR ALS VORHER:** der Bilderstreifen unten im
> Vollbild hat den eingestellten Ausschnitt bisher als einziger nicht gezeigt.
> **Jetzt zeigt er ihn mit** — dieselbe Kachel überall.

- Fixed: Eine Kachel mit eingestelltem Bildausschnitt ist scharf — bisher wurde sie umso stärker hochgezogen, je enger der Ausschnitt saß
- Fixed: Dasselbe gilt für den Bilderstreifen am Eintrag und für den Streifen im Vollbild
- Fixed: Auch Videokacheln zeigen jetzt den eingestellten Ausschnitt
- Changed: Ein geänderter Ausschnitt ist sofort zu sehen — bisher konnte der Browser bis zu einen Tag lang die alte Kachel zeigen
- Changed: Der Bilderstreifen im Vollbild zeigt den Ausschnitt jetzt mit
- Changed: Die Karte „Bildablage" nennt die neuen Maße des kleinen Vorschaubilds

## [0.19.4] - 2026-09-03

> **BEIM ERSTEN START RECHNET KRITERION ALLE VORSCHAUBILDER NEU.** Das
> geschieht von selbst, im Hintergrund, und die Karte „Bildablage" zählt dabei
> mit. *Keine Datenbankstufe, keine Migration, kein neuer Index, das
> Austauschformat bleibt 12.* **Nach dem Einspielen im Browser einmal hart neu
> laden.**
>
> **DIE DATENBANK WÄCHST DABEI — wie stark, hängt an deinen Bildern.** Ein
> Vorschaubild trägt jetzt so viele Bildpunkte, wie die Kachel wirklich
> braucht; bei einem 16:9-Bildschirmfoto ist das rund das Dreifache, bei einem
> quadratischen Bild ändert sich gar nichts. *Bisher belegten alle
> Vorschaubilder zusammen wenige Prozent der Datenbank.* **Eine Sicherung vor
> dem Einspielen schadet nie:** die alten Vorschaubilder sind danach weg. *Sie
> lassen sich aus den Originalen jederzeit wieder herstellen — deshalb ist es
> keine Datenbankstufe.*
>
> **VIDEOS BEHALTEN IHRE ALTE KACHEL.** Ihr Standbild kommt vom Browser und
> liegt nicht als Original in der Datenbank; **es gibt nichts, woraus sich neu
> rechnen ließe.** *Wer eine scharfe Videokachel will, lädt das Video neu hoch.*

- Fixed: Die Kacheln der Übersicht sind scharf — die Vorschaubilder wurden bisher immer hochgerechnet
- Fixed: Dasselbe gilt für den Bilderstreifen am Eintrag und für das Bild im Vollbild-Streifen
- Changed: Der vorhandene Bestand wird beim ersten Start nachgezogen; danach passiert nichts mehr
- Changed: Die Karte „Bildablage" zeigt den Lauf mit und sagt danach, was er gebracht hat
- Changed: Sie nennt jetzt auch, welche Maße die beiden Vorschaubilder tragen

## [0.19.3] - 2026-09-02

> **Nichts zu tun.** *Keine Datenbankstufe, keine Migration, kein neuer Index,
> das Austauschformat bleibt 12 — gesichert werden muss vor dem Einspielen
> nichts.* **Nach dem Einspielen im Browser einmal hart neu laden.**
>
> **EINE ANTWORT WIRD SCHMALER, und das steht hier, weil es sonst niemand
> erführe:** die Übersicht (`GET /api/items`) liefert zu jedem Testtag nur noch
> Datum, Note und „gehört mir" — die Schlagworte des Testtags und sein Verfasser
> stehen dort nicht mehr. **Am Eintrag selbst stehen beide unverändert weiter.**
> *Wer die Übersicht nur im Browser benutzt, merkt davon nichts; wer die Antwort
> selbst abfragt, soll es nicht aus einem Diff erfahren müssen.*

- Changed: Der Umstellungslauf „Alle PNG nach WebP umstellen" hält den Server nicht mehr an — er läuft in einem eigenen Thread
- Changed: Dasselbe gilt für das Nachrüsten fehlender Vorschaubilder beim Start
- Changed: Die Übersicht kommt noch einmal spürbar schneller — sie stellt 405 Abfragen statt 3200
- Changed: Und sie holt nicht mehr, was sie gar nicht zeigt; die Antwort ist gut ein Viertel kleiner
- Changed: Die letzten acht Meldungen sagen „Installation" statt „Instanz" — damit ist der Produktname aus dem Bildschirmtext heraus

## [0.19.2] - 2026-09-02

> **Nichts zu tun.** *Keine Datenbankstufe, keine Migration, kein neues
> Austauschformat — gesichert werden muss vor dem Einspielen nichts.*
>
> **Beim ersten Start legt die Datenbank zwei Indizes an.** Das dauert einmalig
> ein bis zwei Sekunden und geschieht von selbst; danach stehen sie. **Nach dem
> Einspielen im Browser einmal hart neu laden.**

- Fixed: Der Systembereich lädt jetzt wirklich sofort — 0.19.1 hatte nur die eine von zwei Ursachen behoben
- Changed: Auch die Übersicht kommt schneller — sie holt die Vorschaubilder in einer Abfrage statt in einer je Eintrag
- Fixed: Der engere Bildausschnitt lässt sich endlich in alle Richtungen verschieben; bei fast quadratischen Bildern ging waagerecht bisher gar nichts
- Changed: Der Dialog vor „Alle PNG nach WebP umstellen" ist kürzer und sagt jetzt, dass die Umwandlung nahezu verlustfrei ist
- Changed: Die Rückfrage nach dem Passwort ist kürzer und nennt den zweiten Faktor beim Namen

## [0.19.1] - 2026-09-02

> **DIE `docker-compose.yml` HEISST IM REPO JETZT `docker-compose.example.yml`
> UND STEHT IN DER `.gitignore`** — dasselbe Muster wie bei der `.env`. *Grund:
> wer das ZIP von GitHub über seinen Ordner entpackte, verlor seine angepasste
> Fassung samt Port, Sicherungsort und Containernamen. Im Feld passiert.*
>
> **Wer per `git pull` aktualisiert, sieht seine `docker-compose.yml` danach als
> unverfolgte Datei** — sie bleibt liegen, wie sie ist, und wird nicht mehr
> überschrieben. **Wer das ZIP entpackt, behält sie ebenfalls.** *Beides ist der
> Zweck.*
>
> **Wer noch keine hat, legt sie einmal an:**
> `cp docker-compose.example.yml docker-compose.yml`. Ohne sie bricht
> `docker compose up` mit „no configuration file provided: not found" ab.
>
> **Sonst nichts zu tun.** *Keine Datenbankstufe, keine Migration, kein neues
> Austauschformat — gesichert werden muss vor dem Einspielen nichts.* **Nach dem
> Einspielen im Browser einmal hart neu laden.**

- Fixed: Der Systembereich lädt wieder sofort — die Kennzahlen lasen bei jedem Abschnittswechsel jedes Bild aus der Datenbank
- Fixed: Während einer Bildumstellung reagierte die Oberfläche zeitweise nicht — dieselbe Abfrage lief alle 1,5 Sekunden
- Fixed: Ein enger gezogener Bildausschnitt erreichte die Bildränder nicht; die Vergrößerung saß immer in der Mitte
- Fixed: Eine Rückfrage aus dem Vollbild heraus — etwa beim Löschen — stand hinter dem Vollbild und war nicht zu sehen
- Changed: „Bildablage" ist eine eigene Karte unter Datenbank statt ein Abschnitt in „Kennzahlen"; die Karte war zu groß geworden
- Changed: Der Dialog vor „Alle PNG nach WebP umstellen" sagt jetzt, dass der Lauf dauern und den Betrieb stören kann
- Changed: Meldungen sagen „dieser Installation" statt „der Instanz" — der Produktname steht nicht mehr dort, wo deine Anlage gemeint ist
- Changed: Die Bildverarbeitung nimmt sich höchstens die halbe Kernzahl der Maschine, statt sich auf die Vorgabe zu verlassen

## [0.19.0] - 2026-09-01

> **VOR DEM EINSPIELEN DAS DATENVERZEICHNIS SICHERN.** Diese Version rüstet eine
> Spalte nach (`photos.zoom`) und hebt das Austauschformat von 11 auf 12; ein
> Rückweg ist danach keine reine Dateikopie mehr.
>
> **UND DER KNOPF „Alle PNG nach WebP umstellen" ÜBERSCHREIBT BILDBYTES.** Die
> PNG-Fassung ist danach weg — es gibt dafür keinen Papierkorb und keinen
> Rückweg. Die Sicherung ist die einzige Rückfahrkarte. *Der Knopf läuft nur,
> wenn du ihn drückst; das Einspielen allein ändert an vorhandenen Bildern
> nichts.*
>
> **Was von selbst anders wird:** ein ab jetzt eingefügtes Bildschirmfoto liegt
> als WebP in der Datenbank statt als PNG. Der Schalter dazu steht unter
> Datenbank → Kennzahlen → Bildablage und lässt sich abschalten.

- Added: Ein mit Strg+V eingefügtes Bildschirmfoto wird als WebP abgelegt — rund zwei Drittel kleiner, ohne sichtbaren Verlust
- Added: Schalter „PNG-Originale beim Hereinkommen umwandeln" unter Datenbank → Kennzahlen (Vorgabe an, nur der Eigentümer)
- Added: Knopf „Alle PNG nach WebP umstellen" daneben — er zieht den vorhandenen Bestand nach und fragt vorher das Passwort
- Added: Die Kennzahlen führen die Fotos nach Format auf — PNG, JPEG, WebP, jeweils mit Zahl und Größe
- Added: Der Bildausschnitt der Vorschau lässt sich enger ziehen; ein Schieber im Ausschnittmodus stellt ein, wie nah
- Changed: Die Kennzahlenkarte lädt spürbar schneller — sie geht einmal statt zweimal durch die Bildtabelle
- Changed: JPEG, GIF und vorhandenes WebP bleiben unberührt — und ein PNG bleibt PNG, wenn es als WebP größer wäre oder zu groß für WebP ist (mehr als 16383 Pixel je Kante)
- Changed: Der Import wandelt ausdrücklich nichts um — wer eine alte Sicherung einspielt, holt PNG zurück und drückt danach den Knopf

## [0.18.1] - 2026-09-01

> **Nur die Anzeige ändert sich, und nur im Systembereich.** Nach dem Einspielen
> im Browser einmal hart neu laden — geändert ist ausschließlich das Stilblatt.

- Fixed: „Meine Sitzungen" zeigte fünf Anmeldungen statt zehn — eine Sitzungszeile ist fast doppelt so hoch wie eine gewöhnliche
- Changed: Eine leere Liste ist zwei Zeilen hoch statt einer; mit einer las sie sich wie ein Absatz und nicht wie ein leerer Bereich

## [0.18.0] - 2026-09-01

- Added: Solange gesucht wird, sagt jede Kachel unter dem Titel, wo das Wort steht — mit der Quelle und einem Ausschnitt: „Kommentar: …in Bellavista empfohlen…"
- Added: Trifft der Begriff mehrere Quellen, nennt die Zeile die erste in fester Folge und hängt an, wie viele weitere es sind
- Added: Der gefundene Begriff ist hervorgehoben — an der Kachel in Titel, Kategorie, Tags und Trefferzeile, im Eintrag in der Linkliste und in den Kommentaren
- Added: Der Suchbegriff steht in der Adresse eines geöffneten Treffers; ein Neuladen behält die Hervorhebung, und der Link lässt sich weitergeben
- Changed: In der Linkliste wird die Adresse hervorgehoben und nicht der Anbietername — gesucht wurde in der Adresse

## [0.17.5] - 2026-08-31

> **Nur die Anzeige ändert sich, und nur im Systembereich.** Nach dem Einspielen
> im Browser einmal hart neu laden — geändert ist ausschließlich das Stilblatt.

- Fixed: Karten mit kurzer oder leerer Liste waren viel zu hoch — sie hielten Platz für zehn Zeilen frei, die sie nicht hatten
- Fixed: Im Sicherheitsprotokoll stand der Name in jeder Zeile an einer anderen Stelle
- Changed: Eine Liste neben einer höheren Karte zeigt wieder höchstens zehn Zeilen; der Rest der Karte bleibt leer

## [0.17.4] - 2026-08-31

> **Nur die Anzeige ändert sich, und nur im Systembereich.** Nach dem Einspielen
> im Browser einmal hart neu laden — geändert ist ausschließlich das Stilblatt,
> und das liegt im Zwischenspeicher.

- Changed: Die Karten einer Reihe sind wieder gleich hoch — 0.17.3 hatte sie zu einer Treppe gemacht
- Changed: Steht neben einer Liste eine hohe Karte, zeigt die Liste auch mehr als zehn Zeilen *(zurückgenommen mit 0.17.5)*
- Changed: Das Sicherheitsprotokoll zeigt fünfzehn Zeilen statt zehn, bevor es rollt
- Changed: Eine leere Liste ist eine Zeile hoch und sagt, dass nichts da ist
- Changed: In der Glockentafel und bei den gelöschten Zugängen gilt kein Deckel — dort rollt das Fenster

## [0.17.3] - 2026-08-31

- Added: „Filter zurücksetzen" in der Sortierzeile — nur wenn etwas gesetzt ist, und mit der Zahl daneben
- Changed: Jede Kachel im Systembereich ist so hoch wie ihr Inhalt; eine kurze Liste zieht die Reihe nicht mehr auf *(zurückgenommen mit 0.17.4)*
- Changed: Listen in Karten deckeln bei zehn Zeilen statt bei zwölf
- Changed: Die Karte „Mailversand" zeigt nur noch den Zustand; eingetragen wird er in einem eigenen Fenster
- Changed: Der Erklärkasten hinter der Gesamtnote braucht keinen Rollbalken mehr
- Removed: Die Zeile „Passwort" in der Karte „Mailversand" — sie sagte dasselbe wie „Zustand" darüber

## [0.17.2] - 2026-08-31

- Changed: Die Zeile einer Anmeldung steht in zwei Reihen — oben der Name, darunter die beiden Zeiten
- Changed: Listen in Karten deckeln bei zwölf Zeilen; steht daneben eine höhere Kachel, wachsen sie mit
- Changed: Im Mailversand stehen die erklärenden Sätze neben ihrer Sache statt darunter
- Changed: Hinter dem Durchschnitt einer Bewertung steht die Zahl der Stimmen erst ab zwei
- Changed: Die README nennt eine Versionsnummer nur noch dort, wo sie eine Handlung bestimmt
- Removed: Die Glocke meldet die eigenen Beiträge nicht mehr — bei einem einzigen Zugang bleibt sie still
- Removed: Die Begründung zum fehlenden Adressfeld in der Karte „Mailversand"

## [0.17.1] - 2026-08-30

- Changed: Aus „Anlage" wird „Instanz", überall — ein Lesezeichen auf `#/system/anlage` bleibt gültig
- Changed: Der Text in der Karte „Zugang" richtet sich danach, ob die Selbstanmeldung an ist
- Changed: Die Listen in den Kacheln bekommen die Höhe, die ihre Kachel hergibt
- Changed: Der Mailversand ordnet sich in vier Reihen — wer · wohin · womit · als wer
- Changed: Die beiden Zeitangaben einer Anmeldung stehen rechtsbündig untereinander
- Fixed: Das Video fing im Vollbild von vorn an, statt an seiner Stelle weiterzulaufen

## [0.17.0] - 2026-08-30

- Added: Die Glockentafel sagt, WAS neu ist — „3 Kommentare · 4 Bewertungen" statt „7 neue Beiträge"
- Added: Jede Zeile der Tafel sagt, von wem
- Added: Der Erklärkasten hinter der Gesamtnote nennt die Vergleichszahl ohne Gewichtung
- Changed: Die Glocke meldet Kommentare und Bewertungen von allen, die eigenen eingeschlossen
- Changed: Die Zeile einer Anmeldung in „Meine Sitzungen" bricht immer um
- Changed: Die Karte „Mailversand" steht so breit wie ihre drei Nachbarn
- Removed: Die Filterpille „Neu seit …" — die Auskunft trägt die Glocke; gespeicherte Ansichten bleiben lesbar
- Removed: Zwei Erklärtexte haben die Oberfläche verlassen; sie stehen in der README
- Fixed: Die Kriterienliste zerfiel bei genau einem Zugang
- Fixed: Der Erklärkasten verwies auf eine Spalte, die es bei einem Zugang nicht gibt
- Fixed: Die Anmeldeseite maß ihre Höhe falsch, wenn die Adressleiste des Telefons einklappte

## [0.16.0] - 2026-08-29

> **Vor dem Einspielen: das Datenverzeichnis sichern.** Diese Version ändert die
> Datenbank. Ohne die Kopie gibt es keinen Weg zurück auf eine ältere Fassung.

- Added: Fünf Abschnitte im Systembereich, jeder mit eigener Adresse
- Added: Eine Glocke in der Kopfzeile mit einem Punkt, dazu die Zahl der offenen Aufgaben
- Added: Ein Klick auf die Zahl im Bewertungsblock öffnet die Rechnung dieses Eintrags
- Added: Die Kennzahlen nennen Version, Fingerprint und die verwendeten Verfahren
- Added: Ein Papierkorb in der Vollbildansicht, mit derselben Rückfrage wie darunter
- Added: Bewertungen tragen einen Zeitpunkt — ohne ihn kann die Glocke nichts über sie sagen
- Changed: Export und Import stehen in einer Karte, aber nicht gleichrangig
- Fixed: `node gegenprobe.js 2 256` fuhr neben Rückbau 256 auch die 83 mit

## [0.15.1] - 2026-08-29

- Fixed: Aussage und Eingabefeld zur Ablehnung standen auch an Einträgen, die nicht abgelehnt sind
- Changed: Das Eingabefeld für die Begründung steht, solange abgelehnt ist und kein Grund dasteht

## [0.15.0] - 2026-08-29

- Added: Ein Filter für „abgelehnt" in der Statuszeile — Alle · Abgelehnt · Nicht abgelehnt
- Added: Ein ✎ und ein ✕ an der Begründung einer Ablehnung
- Added: Eine fremde Begründung lässt sich entfernen — von jedem, der den Eintrag ändern darf
- Changed: Die Begründung steht im Ruhezustand als Aussage da statt in einem dauernd offenen Feld
- Security: An der Begründung gilt „Löschen ja, umschreiben nein" jetzt ganz

## [0.14.0] - 2026-08-29

> **Vor dem Einspielen: das Datenverzeichnis sichern.** Diese Version ändert die
> Datenbank. Ohne die Kopie gibt es keinen Weg zurück auf eine ältere Fassung.

- Added: Eine Ablehnung bekommt Datum, Grund und Verfasser
- Added: Beim Einschalten von „abgelehnt" erscheint sofort ein Feld für den Grund
- Added: Die Marke liest sich als Satz — „Abgelehnt am 14.03.2026, 09:12 von Anna — Lieferzeit über 6 Monate"
- Changed: Die Begründung darf nur umschreiben, wer sie getroffen hat
- Changed: Die Sternreihen der Kriterienliste beginnen an derselben Stelle
- Fixed: Ein fremder Cookie mit einem Prozentzeichen im Wert sperrte einen Browser aus
- Security: Die Begründung ist eine fremde Aussage und wird wie eine behandelt

## [0.13.2] - 2026-08-29

- Fixed: Ein angepinnter Kommentar trug drei Kanten in einer Farbe und die vierte in einer anderen

## [0.13.1] - 2026-08-29

- Fixed: Beschriftung und Umschalter der Filterzeile standen tiefer als der Rest der Zeile

## [0.13.0] - 2026-08-28

> **Wer `HINTER_PROXY` umlegt, meldet damit alle ab, die über HTTPS hereinkommen.**
> Kein Datenverlust, nur eine neue Anmeldung.

- Added: Die Instanz ist über HTTPS **und** über das Heimnetz erreichbar, mit derselben Einstellung
- Added: Ein Filter am Sicherheitsprotokoll — Alle · Gescheitert · Anmeldungen · Zugänge · Zweiter Faktor · Bestand
- Added: Die Namen im Protokoll sind anklickbar und springen zur Karte „Zugänge"
- Added: Gelöschte Zugänge stehen in einem eigenen Fenster
- Added: Die Kategoriezeile trägt mehrere Kategorien zugleich
- Changed: Der Löschdialog nennt den umkehrbaren Weg — sperren statt löschen
- Changed: Die Filterleiste ist flacher — die Liste beginnt weiter oben
- Removed: Der Handgriff „Wenn der Proxy ausfällt" aus der README — er wird nicht mehr gebraucht
- Fixed: Der Export in Teilen ging mit eingeschaltetem zweitem Faktor überhaupt nicht
- Fixed: Ein Teilexport stand in keiner einzigen Protokollzeile
- Fixed: Fünf Vorgänge standen als roher Schlüssel am Bildschirm
- Security: Der Heimnetzweg bekommt einen eigenen Cookienamen statt denselben ohne `Secure`

## [0.12.4] - 2026-08-28

- Added: „In Teilen exportieren" — beim Einspielen Teil 1 mit „Ersetzen", alle übrigen mit „Zusammenführen"
- Added: Die Teilgröße ist wählbar, 50 bis 300 MB
- Added: Ein Eintrag, der schon allein über der Grenze liegt, wird namentlich genannt
- Changed: Das Passwort wird einmal gefragt und je Teil geprüft

## [0.12.3] - 2026-08-28

- Added: Die Exportkarte nennt die erwartete Dateigröße, bevor der Knopf gedrückt wird
- Added: Ein Hinweis an der Exportkarte ab 300 MB, mit dem Weg, der dann hilft
- Added: Der Import fragt vor dem Einlesen nach
- Added: Ein Sprungknopf `+ Kommentar`
- Changed: Am Kriterium steht `⌀ 4,2 (3)` statt `4,2 · 3`
- Changed: Die Kopfzeile der Kommentare nennt die offenen Aufgaben
- Fixed: Ein zu großer Export brach wortlos ab — jetzt sagt die Instanz vorher ab
- Fixed: Die Zahlen an den Exportknöpfen folgten den Häkchen nicht

## [0.12.2] - 2026-08-28

- Fixed: Die Vorschaureihe ließ auf dem Telefon einen Streifen rechts leer

## [0.12.1] - 2026-08-28

- Changed: Die Knöpfe am Bildbereich stehen in einer Reihe oben rechts
- Changed: Auf dem Berührungsbildschirm trägt die Vorschaukachel kein Löschkreuz mehr
- Fixed: Bei großer Schrift schoben sich „Ausschnitt" und „Vollbild" am Video übereinander
- Fixed: Das Feld zum Hochladen stand auf dem Telefon dauerhaft wie im Ziehzustand

## [0.12.0] - 2026-08-28

- Added: Kriterion ist auf Telefon und Tablett bedienbar — Menü, Filterschalter, Wischen am Bildbereich
- Changed: Auf dem Telefon ist ein Block kein Kasten mehr, sondern ein Abschnitt
- Changed: Der Titel des Eintrags steht auf dem Telefon vor dem Bild
- Changed: Dialoge steigen von unten auf
- Fixed: Anzeigefehler auf dem Telefon — vom verschobenen Kommentartext bis zum Systembereich, der rechts aus dem Bild lief

## [0.11.0] - 2026-08-27

- Added: Die Suche läuft im Server und findet auch in Kommentaren, Links und Testtagen
- Added: Gespeicherte Ansichten
- Added: Ein Hinweis auf doppelte Einträge beim Anlegen
- Changed: Die Übersicht lädt deutlich weniger Daten
- Fixed: Eine gemerkte Filterstellung auf eine gelöschte Kategorie zeigte eine leere Liste

## [0.10.0] - 2026-08-26

> **Vor dem Einspielen: das Datenverzeichnis sichern.** Diese Version ändert die
> Datenbank. Ohne die Kopie gibt es keinen Weg zurück auf eine ältere Fassung.
>
> **Wer danach den zweiten Faktor einschaltet:** die acht Wiederherstellungscodes
> aufschreiben und dorthin legen, wo das Telefon nicht liegt. Sie werden genau
> einmal angezeigt.

- Added: Ein zweiter Faktor über eine App auf dem Telefon, je Zugang und freiwillig
- Added: Acht Wiederherstellungscodes, jeder genau einmal gültig
- Added: Die Anmeldung wird zweistufig — aber nur für Zugänge mit zweitem Faktor
- Added: `node zugang.js zweifaktor <name>` schaltet ihn auf dem Wirt aus, wenn Telefon und Codes weg sind
- Changed: Die Versionsnummern folgen ab hier Semantic Versioning, dieses Changelog Keep a Changelog
- Changed: Diese Datei heißt `CHANGELOG.md` und liegt im Wurzelverzeichnis
- Security: Der Rücksetzlink war der Weg am zweiten Faktor vorbei und ist geschlossen
- Security: Sperren und Freigeben streift einen fremden zweiten Faktor nicht ab
- Security: „Dieser Zugang hat einen zweiten Faktor" erfährt nur, wer das Passwort kennt
- Security: Das Geheimnis kommt aus keiner Antwort heraus, sobald es bestätigt ist

---

## 0.9.1 — Stufe I₂: die Selbstanmeldung

**Wer einen Zugang haben will, kann von selbst danach fragen — und niemand
kommt dadurch herein, ohne dass ein Admin ihn hereinlässt.** Das ist
der Satz, unter dem diese Version steht, und er ist keine Einstellung: es gibt
keine Betriebsart, in der ein geklickter Link allein freischaltet.

> **Und die Anlage läuft ohne all das vollständig.** Der Schalter steht ab Werk
> auf **aus**; dann legt eben nur der Admin Zugänge an, genau wie bisher. Es
> fehlt keine Funktion, und wer die Selbstanmeldung nicht will, merkt von dieser
> Version nichts.

### Neu

- **Ein zweiter Knopf auf der Anmeldeseite — „Zugang anfragen".** Er steht
  unter „Anmelden", in derselben Größe, mit der Frage „Noch keinen Zugang?"
  darüber — **ruhiger gehalten als der Anmeldeknopf**, damit klar bleibt,
  welcher der gewöhnliche Weg ist. Das Formular dahinter hat zwei Felder, Wunschname und
  E-Mail-Adresse, **kein Passwortfeld**. Beides erscheint nur, wenn die
  Selbstanmeldung eingeschaltet ist.
- **Eine Bestätigungsmail davor (Double Opt-in).** Wer das Formular abschickt,
  bekommt zuerst eine Mail mit einem kurzen Link. **Der Link öffnet keinen
  Zugang und setzt kein Passwort** — er sagt nur „ja, das bin ich", und er
  belegt damit, dass die Adresse dem Anfragenden gehört. Er gilt **24 Stunden**.
  Ohne diesen Schritt könnte jeder eine **fremde** Adresse in deine Liste
  schreiben.
- **Die Karte „Anfragen" im Systembereich, für Admins.** Dort steht der
  Schalter, der Stand gegen den Deckel und die Liste der **bestätigten**
  Anfragen mit Name, Adresse und beiden Zeitpunkten — je Zeile
  **Freischalten** oder **Ablehnen**. Unbestätigte Anfragen erscheinen dort
  **nie** und verfallen nach 24 Stunden. **Die Karte steht immer da**, auch
  solange die Selbstanmeldung aus ist — in ihr sitzt schließlich der Schalter.
- **Freischalten legt einen Zugang mit der Rolle „Benutzer" an** — nie mit
  einer anderen — und erzeugt den Einladungslink, über den der Betreffende sein
  Passwort selbst setzt. Der Weg dahinter ist der bekannte aus 0.8.80,
  unverändert: sieben Tage, genau einmal, ab dem ersten Öffnen fünfzehn Minuten.
- **Ablehnen entfernt die Anfrage.** Es entsteht kein Zugang, und es geht
  **keine** Nachricht hinaus — Benachrichtigungsmails gibt es in dieser Anlage
  nicht.
- **Zwei neue Zeilen im Sicherheitsprotokoll** — Freischaltung und Ablehnung,
  beide **ohne** den Namen des Anfragenden.

### Was du danach von Hand tun musst

- **Nichts** — solange du die Selbstanmeldung nicht willst. Sie ist aus.
- **Willst du sie:** im Systembereich die Karte **„Anfragen"** aufsuchen und
  dort einschalten. Das geht erst, wenn **zwei** Dinge stehen:
  - ein **Mailzugang**, mit dem eine **Testmail wirklich durchgekommen** ist
    (Karte „Mailversand", nur für den Eigentümer der Anlage), und
  - **`OEFFENTLICHE_ADRESSE`** in der `.env` — sonst wüsste der Server nicht,
    worauf der Bestätigungslink zeigen soll. *Die Testmail allein genügt als
    Beleg nicht: sie enthält gar keinen Link.*

  Fehlt eines von beiden, sagt die Karte, was fehlt, und der Knopf bleibt
  gesperrt.
- **Die Sicherung des Datenverzeichnisses vor dem Einspielen ist PFLICHT** —
  diese Version bringt eine neue Tabelle mit.
- **Keine neue Zeile in der `.env`**, und die `docker-compose.yml` ist
  unberührt.

### Was gleich bleibt

- **Der Admin entscheidet, immer.** Kein Betrieb, in dem der geklickte Link
  allein hereinlässt.
- **Die Antwort auf eine Anfrage sieht immer gleich aus** — ob der Name frei
  war, ob er vergeben ist, ob die Adresse schon an einem Zugang hängt, ob
  gerade zwanzig Anfragen offen sind oder ob der Schalter aus ist. Sonst wäre
  das Formular ein bequemes Werkzeug, Namen und Adressen durchzuprobieren.
- **Höchstens zwanzig offene Anfragen**, und je Adresse höchstens eine. Die
  einundzwanzigste wird still verworfen.
- **Dieselbe Anmeldebremse wie an der Anmeldung**, an beiden neuen Wegen vor
  der Anmeldung.
- **Ausschalten geht immer.** Und geht der Versand später kaputt, **bleibt der
  Schalter an** — die Karte sagt es rot, statt sich stillschweigend umzulegen.
- **Der Tokenweg aus 0.8.80 ist unverändert**, und der Mailversand aus 0.9.0
  ebenso — es kommt nur ein dritter Anlass für eine Mail dazu.
- **Reiner Text, kein HTML, keine Zählpixel**, auch in der Bestätigungsmail.
- **Die Exportdatei behält ihr Format** (unverändert 10).
- **Keine neue Abhängigkeit, nicht eine.**

### Wenn du eine Bestätigungsmail bekommst, ohne etwas angefragt zu haben

**Dann ist nichts zu tun.** Ohne den Klick geschieht gar nichts, und die
Anfrage verfällt von selbst. Die Mail sagt das auch — und sie sagt ausdrücklich,
dass ihr Link keinen Zugang öffnet und kein Passwort setzt.

### Nachgezogen nach dem Einspielen

Aus dem Betrieb heraus, ohne neue Versionsnummer — **wer 0.9.1 schon fährt,
holt sich das mit dem nächsten Einspielen**:

> **ZWEI DATEISÄTZE TRAGEN DAMIT DIE NUMMER 0.9.1, und hier steht, welcher
> welcher ist.** Das zuerst veröffentlichte 0.9.1 hat den Fingerprint
> **`cb73399d`**; der nachgezogene Satz — der mit allem, was unter dieser
> Überschrift steht — hat **`3cf1b093`**, und **das ist der Stand, der gilt.**
> *Eine eigene Nummer bekommt er nicht: 0.9.2 käme heute hinter 0.10.0 und
> 0.11.0 zu liegen, und eine Zahl, die älter ist als das Laufende, spielt
> niemand mehr ein.* **Wer heute nachsieht und `cb73399d` findet, fährt den
> Satz von vor der Nacharbeit.**

- **Die Karte „Anfragen" steht dem Admin jetzt immer.** Sie war an die
  Bedingung geknüpft, dass die Selbstanmeldung an ist oder Anfragen vorliegen —
  und der Schalter sitzt in ihr. Frisch eingespielt war sie damit nicht zu
  erreichen.
- **Der Weg zur Anfrage ist ein Knopf** und nicht mehr ein Verweis in der
  Fußzeile. Er wurde übersehen.
- **Marke und Name stehen auf der Anmeldeseite nebeneinander** statt
  übereinander — erst das Zeichen, dann „Kriterion", so wie in der Kopfzeile
  nach der Anmeldung auch.
- **Der Strich über „Zugang anfragen" ist weg.** Er lag quer durch eine Karte,
  die sonst keine Linie kennt. Getrennt wird jetzt mit Abstand, und der Knopf
  trägt dafür selbst eine ganz leichte Färbung — dieselbe Farbe wie „Anmelden",
  nur leise.
- **Eine Grafikdatei weniger.** `marke-hell.svg` war Byte für Byte
  `favicon.svg`; sie ist entfernt.

> **ACHTUNG BEIM EINSPIELEN: diese Version NIMMT eine Datei WEG.** Wer über den
> vorhandenen Ordner auspackt, statt ihn wie im README zu ersetzen, hat
> `public/marke-hell.svg` danach immer noch liegen. Die Anlage läuft damit
> einwandfrei — **aber der Fingerprint ist ein anderer**, weil er über alles
> unter `public/` geht. Steht in der Karte „Kennzahlen" nicht `3cf1b093`, ist
> das der erste Ort zum Nachsehen: Datei löschen und
> `docker compose up -d --build`.

---

## 0.9.0 — Der Server verschickt selbst

**Einladungs- und Rücksetzlinks gehen ab jetzt per Mail hinaus — und wer keinen
Mailzugang einträgt, verliert nichts: die Links stehen weiter zum Kopieren da.**
Das ist die tragende Zusage dieser Version und keine Nebenbemerkung. Eine Anlage
ohne Mailzugang läuft nach dem Einspielen **genau so vollständig** wie vorher.

> **Was sich wirklich ändert, ist die Betriebsart.** Bis 0.8.91 hat die Anlage
> nur auf Anfragen geantwortet. Ab dieser Version baut sie von sich aus eine
> Verbindung zu einem fremden Server auf — ausgehend, zu genau einem Server,
> den du selbst einträgst. Kein Empfang, kein offener Port, kein Abholen.

### Neu

- **Der Mailzugang, in der Karte „Mailversand" im Systembereich.** Anbieter
  auswählen (GMX, Web.de, Gmail, Strato, IONOS oder „Eigener Server"),
  Benutzername, Passwort und Absenderadresse eintragen, fertig. Server, Port
  und Verschlüsselung füllt die Vorlage.
- **Die Karte gehört dem Eigentümer, ganz** — eintragen, einsehen und die
  Testmail auslösen. Ein Admin kommt an keines davon, und der Grund ist die
  Rollenleiter: der SMTP-Server sieht **jede** Mail, und jede trägt einen Link,
  der ein Passwort setzt. Dürfte ein Admin ihn eintragen, liefe die Rücksetzmail
  des Eigentümers über einen Server seiner Wahl.
- **Ein Testmail-Knopf — an die eigene Adresse und nirgendwo sonst.** Es gibt
  kein Adressfeld daneben, und das ist Absicht: ein Knopf, der an eine beliebige
  Adresse schickt, wäre ein offener Mailverteiler hinter einer Anmeldung.
- **Ein Adressfeld am Zugang.** Beim Anlegen kannst du eine E-Mail-Adresse
  mitgeben — sonst hätte die Einladung keinen Empfänger. **Ändern darf sie
  danach allein der Betreffende selbst**, im Systembereich unter „Zugang", hinter
  seinem bisherigen Passwort. Sie ist überall **freiwillig**.
- **Eine zweite Frist am Link: ab dem ersten Öffnen bleiben fünfzehn Minuten.**
  Die sieben Tage sind die Frist fürs *Lesen der Mail*; solange niemand geöffnet
  hat, läuft nichts. Ab dem ersten Öffnen ist der Link erwiesenermaßen
  angekommen — und hat in einem fremden Postfach nichts mehr verloren.
  **Innerhalb der fünfzehn Minuten darfst du beliebig oft öffnen und neu laden.**

### Behoben

- **Ein gültiger Einladungslink konnte tot aussehen.** Wer sich vorher ein
  paarmal beim Anmelden vertippt hatte, lief beim Klick auf seinen Link in die
  Anmeldebremse — und die Oberfläche warf den Schlüssel daraufhin aus der
  Adresse. Nach dem Neuladen stand man auf der Anmeldeseite, und der Link schien
  verbraucht. **Er war es nie.** Jetzt bleibt der Schlüssel bei einer
  vorübergehenden Absage stehen, und die Seite bietet einen zweiten Anlauf an.

### Was du danach von Hand tun musst

- **Nichts** — solange du keine Mail willst. Ohne Mailzugang bleibt alles, wie
  es war.
- **Willst du Mail:** `OEFFENTLICHE_ADRESSE` in die `.env` eintragen (ohne sie
  wird nicht verschickt), dann die Karte „Mailversand" ausfüllen und die
  **Testmail** drücken. Dafür brauchst du eine Adresse an deinem eigenen Zugang.
- **Drei Stolpersteine beim Anbieter**, an denen die meisten Versuche
  scheitern: **Gmail** verlangt Zwei-Faktor und ein **App-Passwort**; **GMX**
  und **Web.de** verlangen, den Versand über fremde Programme im Konto erst
  **freizuschalten**; und **die Absenderadresse muss zum Konto gehören**.

### Was gleich bleibt

- **Der Tokenweg aus 0.8.80 im Übrigen unverändert:** sieben Tage, genau einmal
  gültig, beim Einlösen fallen alle übrigen offenen Links und alle Sitzungen,
  Mindestwert zehn Zeichen, **eine** Absage für alle Fälle.
- **Der Link steht immer zum Kopieren da** — auch wenn der Versand gelingt,
  und erst recht, wenn er fehlschlägt. Dann steht daneben, was schiefging.
- **Keine Benachrichtigungsmails.** Es gibt genau **zwei** Anlässe für eine
  Mail: den Tokenlink und die Testmail. Nicht „jemand hat kommentiert", nicht
  „etwas ist offen".
- **Reiner Text.** Kein HTML, keine Bilder, keine Zählpixel, keine Anhänge.
- **Die Exportdatei behält ihr Format** (unverändert 10) — ein Mailzugang steht
  nicht darin, und die Exportdatei trägt überhaupt keine Einstellungen.
- **Die Datenbank bekommt weder Tabelle noch Spalte.** Diese Version ist
  **keine** Datenbankstufe; der Mailzugang liegt in `settings`, und
  `users.email` gibt es seit 0.6.0.
- **Es kommt keine neue Zeile in die `.env`.** `OEFFENTLICHE_ADRESSE` gibt es
  seit 0.8.90.

### Beim Einspielen

- **Wie immer: `docker compose down`, Daten kopieren, ZIP auspacken, `.env`
  zurück, `up -d --build`.** Nichts an der `docker-compose.yml`.
- **Eine neue Laufzeitabhängigkeit — die erste seit Langem:** `nodemailer`.
  MIT-0, **ohne eigene Abhängigkeiten**, 776 KB; der Baum wächst um genau ein
  Paket. Das `--build` holt sie mit.
- **Die Selbstanmeldung ist noch nicht dabei.** Sie ist die zweite Hälfte dieser
  Stufe und kommt als 0.9.1 — Formular vor der Anmeldung, Bestätigungsmail,
  Warteschlange beim Admin, Freischaltung.

---

## 0.8.91 — Der Schlüssel lässt sich wechseln

**Der Schlüssel der Datenbank lässt sich wechseln, ohne die Anlage neu
aufzusetzen — und die Anlage sagt vorher, was danach von Hand zu tun ist.**
Bisher galt: ein einmal gesetzter Schlüssel bleibt für immer. Wer ihn versehentlich
weitergegeben hatte — etwa, weil er eine Weile als `data/encryption.key` neben der
Datenbank lag und jemand das Verzeichnis kopiert hat —, konnte nichts dagegen
tun. Das ändert sich.

> **Lies das hier bitte ganz, bevor du den Wechsel fährst.** Er ist der
> einzige Vorgang im ganzen Projekt, bei dem ein Fehler **alle Daten**
> kostet. Wer ihn drückt, muss vorher wissen, was er danach von Hand tun muss.

### Neu

- **Der Schlüsselwechsel — auf dem Wirt, nicht in der Oberfläche.** Im
  Projektverzeichnis:

  ```bash
  ./schluessel.sh zeigen       # Lage ansehen, ändert nichts
  ./schluessel.sh wechseln     # anhalten, sichern, wechseln, starten
  ```

  Das Skript sichert erst die `.env`, hält die Anlage an, sichert das
  Datenverzeichnis, wechselt den Schlüssel und trägt den neuen Wert dorthin
  ein, **woher der alte kam**: in die `.env` oder in `data/encryption.key`.
  Danach startet es die Anlage wieder.
- **Der alte Wert geht nicht verloren.** In der `.env` bleibt er
  **auskommentiert** über der neuen Zeile stehen — mit Datum, mit dem Namen
  dessen, der gewechselt hat, und mit dem Satz, wofür er noch gut ist. **Alles
  andere in der `.env` bleibt unangetastet**, Zeichen für Zeichen.
- **Die Karte „Sicherung" markiert die alten Kopien.** Ab einem Wechsel sind
  **zwei Schlüssel im Umlauf**: jede Sicherung von vorher öffnet sich nur noch
  mit dem alten. Die Karte zählt sie und markiert sie rot. Ist auch die
  **jüngste** Kopie älter als der Wechsel, sagt sie das deutlicher — dann passt
  überhaupt keine zum heutigen Schlüssel, und es gehört sofort neu gesichert.
- **Eine Zeile im Sicherheitsprotokoll.** „Schlüssel gewechselt", ohne
  Handelnden, ohne Ziel, ohne Merkmal. **Sie nennt, DASS gewechselt wurde, nie
  WOHIN** — ein Schlüssel steht in keiner Protokollzeile.

### Was du danach von Hand tun musst

- **Den alten Wert in den Passwortspeicher übernehmen**, bevor du die
  auskommentierte Zeile aus der `.env` entfernst. **Er ist der einzige
  Schlüssel zu allen Sicherungen, die vor dem Wechsel entstanden sind.**
- **Neu sichern.** Erst danach liegt wieder eine Kopie da, die zur laufenden
  Anlage gehört.
- **Und wie immer:** `.env` und `data/` gehören nicht in dieselbe Ablage.

### Was gleich bleibt

- **Gewechselt wird der Schlüssel, nicht das Verfahren.** SQLCipher bleibt, die
  Schlüssellänge bleibt, der Dateiname bleibt, das Schema bleibt.
- **Niemand wird abgemeldet.** Der Datenbankschlüssel hängt an keinem Passwort;
  offene Sitzungen laufen weiter.
- **Am Eintrag ändert sich gar nichts.** Schreiben, bewerten, kommentieren,
  Fotos und Dateien: alles wie bisher.
- **Die Exportdatei behält ihr Format** (unverändert 10). Ein Schlüssel steht
  nicht darin, und ein JSON-Export braucht auch keinen — er ist damit der
  einzige Rückweg, der von der Schlüsselverwaltung nichts wissen muss.
- **Es kommt keine neue Einstellung dazu** und keine neue Abhängigkeit.
- **Die Datenbank bekommt weder Tabelle noch Spalte.** Diese Version ist
  **keine** Datenbankstufe.

### Beim Einspielen

- **Wie immer: `docker compose down`, Daten kopieren, ZIP auspacken, `.env`
  zurück, `up -d --build`.** Nichts an der `docker-compose.yml`.
- **Die Sicherung des Datenverzeichnisses ist PFLICHT — und beim
  Schlüsselwechsel ein zweites Mal.** Beim Einspielen wie immer; vor jedem
  Wechsel noch einmal, **und die `.env` dazu**. Das Skript legt beides selbst
  an, aber eine Sicherung neben dem Original ist keine.
- **PROBIER DEN WECHSEL AN EINER WEGWERFANLAGE AUS.** Ein leeres Verzeichnis,
  ein `docker compose up -d`, ein paar Einträge, dann `./schluessel.sh
  wechseln` — und danach nachsehen, ob sie wieder aufgeht. Erst dann an der
  echten.
- **Bricht der Wechsel ab, ist das folgenlos:** die Datenbank behält ihren
  bisherigen Schlüssel, es entsteht kein halber Zustand. Reicht der Platz
  nicht, sagt das Skript vorher ab und rührt nichts an.

---

## 0.8.90 — Schwere Eingriffe

**Wer die Anlage als Ganzes anfasst, gibt sein Passwort noch einmal ein — und
was dabei geschieht, steht hinterher nachlesbar da.** Bisher genügte eine offene
Anmeldung, um einen Zugang zu entfernen, eine Rolle zu vergeben oder den ganzen
Bestand zu exportieren. Wer einen Bildschirm unbeaufsichtigt stehen lässt,
lässt damit die ganze Anlage offen. Das ändert sich.

### Neu

- **Die zweite Bestätigung.** Vor dem **Export**, dem **Import**, dem
  **Vergeben einer Rolle**, dem **Setzen eines fremden Passworts**, dem
  **Erzeugen eines Links** und dem **Entfernen eines Zugangs** fragt Kriterion
  nach deinem eigenen Passwort — in einem Fenster, das daneben schreibt, warum
  es fragt. Die Bestätigung gilt **genau einmal** und nur für die eine
  Handlung: wer drei Zugänge nacheinander entfernt, tippt dreimal.
- **Das Sicherheitsprotokoll.** Eine neue Karte im Systembereich, **nur für den
  Eigentümer**. Sie hält fest, wer Zugang hatte und wer die Anlage als Ganzes
  angefasst hat: Anmeldungen (gelungene und gescheiterte), angelegte,
  gesperrte, freigegebene und entfernte Zugänge, vergebene Rollen, gesetzte
  Passwörter, erzeugte und eingelöste Links, Export, Import und Sicherung. Die
  Zeilen bleiben **180 Tage** stehen und werden danach von selbst geräumt.
- **`OEFFENTLICHE_ADRESSE` in der `.env` — optional.** Den Einladungslink baut
  bisher der Browser aus der Adresse, an der du gerade stehst. Wer über
  `http://192.168.1.50:3100` arbeitet und einen Link nach draußen gibt, gibt
  einen Link ins Leere. Ist die Zeile gesetzt, baut der Server den Link; der
  Kasten sagt darunter, **woher** die Adresse kam.

### Was gleich bleibt

- **Sperren, Freigeben und Anlegen fragen nicht nach.** Sperren ist umkehrbar,
  und ein neuer Zugang nimmt niemandem etwas. Auch am eigenen Zugang ändert
  sich nichts — dort war das bisherige Passwort ohnehin schon Pflicht.
- **Am Eintrag ändert sich gar nichts.** Schreiben, bewerten, kommentieren,
  Fotos und Dateien: alles wie bisher.
- **Das Protokoll ist kein Änderungsverlauf.** Es steht nicht darin, was jemand
  geschrieben, bewertet oder geändert hat — nur, wer die *Anlage* angefasst
  hat. Und es speichert weiterhin **weder IP-Adresse noch Browserkennung**.
- **Es wird nichts verschickt.** Kriterion baut weiterhin keine Verbindung nach
  außen auf. Mailversand kommt in einer späteren Version.
- **Ohne die neue `.env`-Zeile läuft alles wie bisher.** Sie ist optional und
  leer als Vorgabe.
- Export, Import, Papierkorb, Sicherung, Rollen und Rechte arbeiten
  unverändert. Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Die Sicherung des Datenverzeichnisses ist PFLICHT.** Die Datenbank bekommt
  eine neue Tabelle; ein Downgrade auf eine ältere Version ist damit keine
  reine Dateikopie mehr. Auf Knopfdruck geht es auch — **aber die Kopie ist
  verschlüsselt und ohne die `.env` wertlos**, also beides sichern und
  ausdrücklich **nicht** in dieselbe Ablage legen.
- **Sonst nichts.** Keine Änderung an der `docker-compose.yml`, keine neue
  Abhängigkeit. Die Tabelle legt sich beim ersten Start selbst an.
- **Wenn du die öffentliche Adresse setzen willst**, trag sie in die `.env` ein
  und erzeuge den Container neu:
  `OEFFENTLICHE_ADRESSE=https://kriterion.beispiel.de`. Ein Tippfehler bricht
  den Start **nicht** ab — er wird im Protokoll gemeldet, und der bisherige Weg
  trägt weiter.
- **Halte dein eigenes Passwort bereit.** Es wird ab jetzt vor jedem schweren
  Weg gefragt. Wer es nicht mehr weiß, ändert es vorher unter „Zugang".

---

## 0.8.80 — Einladung, Rücksetzung, Sitzungen

**Das Passwort gehört dem, der es benutzt.** Bisher legte der Admin einen
Zugang mit einem ersten Passwort an und musste es weitersagen — er kannte es
also, und der neue Benutzer musste es hinterher selbst ändern, wenn ihm das
unangenehm war. Jetzt bekommt er stattdessen einen **Link** und wählt sein
Passwort selbst.

### Neu

- **Zugang anlegen mit Link.** In der Karte „Zugänge" steht beim Anlegen ein
  **Auswahlfeld**: *„Er wählt sein Passwort selbst"* (die Vorgabe) oder *„Ich
  vergebe das erste Passwort"*. Bei der ersten Wahl gibt es gar kein
  Passwortfeld — der Zugang entsteht **ohne** Passwort, und du bekommst einen
  Link. Wer ihn öffnet, wählt sein Passwort selbst und ist danach gleich
  angemeldet.
- **Passwort zurücksetzen mit Link.** Dasselbe für einen vorhandenen Zugang:
  das Kettenglied 🔗 an der Zeile erzeugt einen Link. Das bisherige Passwort
  gilt weiter, bis er eingelöst wird.
- **Der Link gilt sieben Tage und genau einmal.** Beim Einlösen werden alle
  bestehenden Anmeldungen dieses Zugangs beendet, und alle anderen noch
  offenen Links dazu verfallen.
- **„Meine Sitzungen".** Eine neue Karte im Systembereich — für **jeden**, auch
  ohne Rolle. Sie zeigt, wo dieser Zugang überall angemeldet ist, markiert die
  aktuelle Anmeldung und hat einen Knopf „alle anderen beenden". Ein Admin
  sieht dort **nur seine eigenen**, nie fremde.

### Was gleich bleibt

- **Der direkte Weg bleibt.** Der Admin kann weiterhin ein Passwort setzen und
  es sagen — der Schlüssel 🔑 steht neben dem Kettenglied. Das ist der kürzere
  Weg, wenn der andere danebensteht.
- **Der Notweg auf dem Server bleibt unverändert:**
  `docker compose exec kriterion node zugang.js passwort <name>`.
- **Es wird nichts verschickt.** Kriterion baut weiterhin **keine** Verbindung
  nach außen auf: den Link kopiert der Admin und gibt ihn weiter. Mailversand
  kommt in einer späteren Version.
- **Es wird nichts zusätzlich gespeichert.** „Meine Sitzungen" kennt **kein
  Gerät** — weder IP-Adresse noch Browserkennung werden erfasst, wie bisher
  auch nicht. Die Karte sagt das offen.
- Export, Import, Papierkorb, Sicherung, Rollen und Rechte arbeiten
  unverändert. Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Die Sicherung des Datenverzeichnisses ist PFLICHT.** Die Datenbank bekommt
  eine neue Tabelle; ein Downgrade auf eine ältere Version ist damit keine
  reine Dateikopie mehr. Seit 0.8.70 geht das auch auf Knopfdruck — **aber die
  Kopie ist verschlüsselt und ohne die `.env` wertlos**, also beides sichern
  und ausdrücklich **nicht** in dieselbe Ablage legen.
- **Sonst nichts.** Keine neue Einstellung, keine Änderung an der
  `docker-compose.yml` oder der `.env`, keine neue Abhängigkeit. Die Tabelle
  legt sich beim ersten Start selbst an.
- **Ein Hinweis für den Fall eines Downgrades:** ein Zugang, der über einen
  Link angelegt und noch **nicht** eingelöst wurde, hat kein Passwort. Eine
  ältere Version kann ihm keinen neuen Link geben — dort hilft nur
  `node zugang.js passwort <name>` auf dem Server.
- **Der Link ist ein Passwortersatz auf Zeit.** Wer ihn weitergibt, gibt für
  sieben Tage den Zugang weiter. Er steht danach in dem Verlauf, über den er
  verschickt wurde — nur dem geben, für den er ist. Die Oberfläche sagt das an
  der Stelle, an der er kopiert wird.

---

## 0.8.71 — Der Sicherungsort zieht um

**Eine Berichtigungsrunde, keine Stufe.** Der Sicherungsort lag bisher eine
Ebene über dem Projektverzeichnis und legte dort einen zweiten Ordner an. Das
hielt die Übersicht nicht — und die sichere Lage war es nur solange, wie
niemand sie hinterfragte.

### Neu

- **Der Sicherungsort liegt jetzt im Projektverzeichnis** (`kriterion-sicherung`
  neben `data`). Ein Ordner weniger eine Ebene höher.
- **Die Karte „Sicherung" sagt, wie er liegt.** Ein **roter** Kasten, wenn er
  im Projektverzeichnis liegt, mit dem Grund daneben; ein **grüner**, wenn er
  außerhalb liegt. Abgewiesen wird keine der beiden Lagen — eine Sicherung am
  falschen Ort ist besser als keine.
- **Wer die sichere Lage will, stellt zwei Zeilen in der `docker-compose.yml`
  um.** Wie, steht dort und in der README.

### Was gleich bleibt

- Alles andere. Kein Schema, keine neue Formatnummer, keine neue Route, keine
  neue Abhängigkeit. Der Papierkorb, die Sicherung selbst und ihr Zielort in
  der Oberfläche arbeiten unverändert.

### Beim Einspielen

- **Der Einspielweg hat eine Zeile mehr bekommen** — sie holt vorhandene
  Sicherungen aus dem umbenannten Ordner zurück. Ohne sie bleiben sie in
  `kriterion-alt` liegen. Steht der Sicherungsort außerhalb, ist die Zeile
  wirkungslos und stört nicht.
- **Die neue `docker-compose.yml` muss mit eingespielt werden** — sie trägt die
  geänderte Einhängung und die geänderte Variable. Beide gehören zusammen.
- Kein Pflicht-Sicherungspunkt: die Datenbank wird nicht angefasst.

---

## 0.8.70 — Sicherung und Papierkorb

**Zwei Wege zurück, die es bisher nicht gab.** Ein gelöschter Eintrag war
endgültig weg — samt allem, was andere daran geschrieben hatten. Und eine
Sicherung der Anlage entstand nur von Hand auf dem Server.

### Neu

- **Der Papierkorb.** Ein gelöschter Eintrag liegt **dreißig Tage** dort und
  lässt sich zurückholen — mit Fotos, Videos, Dateien, Kommentaren,
  Bewertungen und Testtagen, jeweils samt Verfasser. Die Karte im Systembereich
  zeigt, was drin liegt, wer gelöscht hat und wie lange es noch bleibt.
- **Sehen darf den Papierkorb der Admin, zurückholen der Eigentümer der
  Anlage.** Zurückholen legt Beiträge unter fremdem Namen wieder an; das ist
  dieselbe Sache wie ein Import und liegt deshalb in derselben Hand.
- **Der Löschdialog sagt es vorher.** Er nennt weiterhin, was am Eintrag hängt
  und was davon anderen gehört — und dazu jetzt, dass alles davon dreißig Tage
  im Papierkorb liegt.
- **Sicherung auf Knopfdruck.** Eine neue Karte im Systembereich erzeugt eine
  vollständige, verschlüsselte Kopie der Datenbank — ohne den Server anhalten
  zu müssen. Sie sagt vorher, wie lange es dauert, und zeigt, wann zuletzt
  gesichert wurde.
- **Der Zielort liegt außerhalb des Projektordners** und wird in der
  `docker-compose.yml` eingehängt; in der Oberfläche lässt sich darunter ein
  Unterverzeichnis wählen. Jede Sicherung bekommt einen eigenen Namen mit Datum
  und Uhrzeit — eine Sicherung überschreibt nie die vorige.
- **Einen einzelnen Eintrag als Datei ziehen.** Dieselbe Form wie der volle
  Export, nur mit einem Eintrag.
- **Die Kennzahlen weisen den Papierkorb getrennt aus** — sonst wundert man
  sich über eine Datenbank, die nach dem Aufräumen größer ist als vorher.

### Was gleich bleibt

- **Gelöscht ist gelöscht.** Ein gelöschter Eintrag verschwindet aus Übersicht,
  Suche und Filtern wie bisher; er liegt nur zusätzlich noch als Paket im
  Papierkorb. An der Bedienung ändert sich sonst nichts.
- **Die Exportdatei behält ihr Format.** Eine Datei aus 0.8.50 oder 0.8.60
  lässt sich unverändert einspielen, und eine Datei aus 0.8.70 auch dort wieder.
- **Der Export bleibt, wie er war**, samt seiner Häkchen für Dateien und
  Videos. Er ist der Weg für Umzug und Archiv; die neue Sicherung ist der Weg
  für den Notfall. Ein Satz auf jeder der beiden Karten sagt, welche man will.
- **Zwei Löschwege füllen den Papierkorb nicht:** einen Zugang mitsamt seinen
  Einträgen zu entfernen, und ein Import, der den Bestand *ersetzt*. Beides ist
  eine Ansage über die ganze Anlage, kein einzelner Fehlgriff.
- **Zwei Kleinigkeiten kommen beim Zurückholen nicht mit:** Favoritensterne
  **anderer** Benutzer und der Vermerk über entfernte Kommentarbilder.

### Beim Einspielen

- **Die Sicherung des Verzeichnisses `data` ist wieder Pflicht.** Diese Version
  fasst die Datenbank an; ein Downgrade auf 0.8.60 ist keine reine Dateikopie
  mehr. In 0.8.60 war das anders.
- **Die neue `docker-compose.yml` gehört mit eingespielt.** Sie hängt den
  Sicherungsort ein (`../kriterion-sicherung`) und benennt ihn. Ohne sie bleibt
  die Karte „Sicherung" aus und sagt das — sie schreibt nicht still irgendwohin.
- **Der Sicherungsort gehört nicht dorthin, wo auch die `.env` liegt.** Die
  Kopie ist verschlüsselt; wer den Schlüssel danebenlegt, hebt die
  Verschlüsselung auf.
- **Die Anlage steht still, während eine Sicherung entsteht** — bei einer
  Datenbank von einem Gigabyte etwa eine halbe Minute. Die Karte nennt die
  erwartete Dauer, bevor man drückt.
- Sonst nichts Besonderes: keine neuen Einstellungen, keine geänderte
  Bedienung, kein neues Wort im Vokabular.

---

## 0.8.60 — Was ist offen, was ist neu

**Zwei Dinge, die es längst gibt, werden auffindbar.** Aufgabenkommentare
waren nur zu sehen, wenn man ihren Eintrag öffnete — bei zwanzig Einträgen
hieß das zwanzigmal klicken. Und wer nach ein paar Tagen wiederkam, sah zwar,
dass sich etwas getan hatte, aber nicht mehr, was davon neu war.

### Neu

- **Die Ansicht „Offen"** — ein neuer Knopf in der Kopfzeile, neben dem
  Zahnrad. Sie zeigt alle nicht erledigten Aufgaben aus allen Einträgen auf
  einem Bildschirm, gruppiert nach Eintrag, mit Verfasser und Datum. Ein Klick
  führt in den Eintrag.
- **Abhaken geht direkt dort.** Die Zeile bleibt danach durchgestrichen
  stehen, damit sich der Haken gleich wieder wegnehmen lässt; beim nächsten
  Aufruf ist sie fort. Wer abhaken darf, ist unverändert: der Verfasser des
  Kommentars und der Admin.
- **Ein Umschalter „meine / alle"** ab zwei Zugängen — bei einem einzigen
  Zugang wären beide Stellungen dieselbe Liste.
- **Der Filter „Neu seit …"** in der Filterzeile, neben „★ Favoriten", mit der
  Zahl daneben. Er zeigt, was sich seit dem letzten Besuch getan hat, und
  lässt sich mit Status, Kategorie und Tags frei kombinieren.
- **Der Bezugspunkt ist persönlich** und wird beim Verlassen der Übersicht
  gesetzt — während man hinsieht, bleibt die Liste also stehen. Beim
  allerersten Besuch erscheint der Filter noch nicht: es gibt dann nichts, mit
  dem sich vergleichen ließe.

### Was gleich bleibt

- **Die Reihenfolge der Übersicht ändert sich nicht.** Beide Neuerungen sind
  Filter — die Liste zeigt weiter für alle gleich, wo zuletzt etwas geschehen
  ist, und niemand bekommt eine eigene Sortierung.
- **Am Kommentarblock im Eintrag ändert sich nichts.** Farbkante,
  Weiterschaltknopf und Reihenfolge bleiben, wie sie waren; die neue Ansicht
  kann nichts, was der Eintrag nicht auch könnte.
- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr
  Format. Eine Datei aus 0.8.50 lässt sich unverändert einspielen.
- **Wer eigene Wörter eingestellt hat**, liest sie auch hier: heißen die
  Aufgaben „Mängel", steht über der Ansicht „Offene Mängel".

### Beim Einspielen

- **Nichts Besonderes.** Diese Version fasst die Datenbank nicht an; die
  Sicherung des Verzeichnisses `data` ist eine Empfehlung, keine Pflicht — und
  der Weg zurück auf 0.8.50 ist wieder eine reine Dateikopie.
- Der Filter „Neu seit …" erscheint erst beim **zweiten** Besuch der
  Übersicht. Das ist kein Fehler: vorher gibt es keinen Bezugspunkt.
- Intern heißt der `Abdruck` in der Kennzahlenkarte jetzt **Fingerprint** —
  dieselbe Zahl, das gebräuchlichere Wort.

---

## 0.8.50 — Kurzvideos am Fotoplatz

**Ein kurzes Video gehört in dieselbe Reihe wie die Fotos.** Bis dahin blieb
nur der Umweg über einen Anhang, der heruntergeladen statt abgespielt wurde.

### Neu

- **Videos bis 20 MB liegen bei den Fotos.** Dasselbe Feld zum Hinzufügen,
  dieselbe Reihenfolge, dasselbe Ziehen zum Umsortieren. Steht ein Video
  vorn, ist sein Standbild das Hauptbild des Eintrags.
- **MP4, WebM und MOV** — also auch das Format, das jedes iPhone liefert.
  Entschieden wird nach dem Inhalt der Datei, nicht nach ihrem Namen.
- **Das Standbild erzeugt der Browser beim Hochladen.** Es erscheint auf der
  Karte und in der Vorschauleiste, mit einem ▶ in der Ecke und der Länge
  daneben. Wer ein Video nicht abspielen kann, kann es auch nicht hochladen —
  ein Videoplatz, der nicht abspielt, wäre ein kaputter Platz.
- **Abgespielt wird im Eintrag und im Vollbild**, mit der gewohnten Steuerung
  des Browsers und mit Springen im Video. Nichts spielt von selbst los.
- **Der Löschdialog und die Kennzahlen nennen Videos getrennt.** Ein Dialog,
  der „3 Fotos" sagt und dabei ein Video mit wegwirft, verschwiege genau das,
  worum es geht.
- **Export und Import nehmen Videos mit** — über einen eigenen Schalter,
  Vorgabe aus.

### Was gleich bleibt

- **Fotos bleiben in jeder Hinsicht, wie sie waren.** Anzeige, Reihenfolge,
  Bildausschnitt, Auslieferung — kein Handgriff daran.
- **Ein Video liegt wie alles andere in der verschlüsselten Datenbank.** Die
  Sicherung des Verzeichnisses `data` deckt es mit ab, ohne Zutun.
- **Wer den Eintrag ändern darf, darf Videos hinzufügen und entfernen** —
  dieselbe Regel wie beim Foto, kein neues Recht.
- Größere Dateien gehören weiterhin an den Anhang. Für Videos jenseits von
  20 MB ist ein eigener Bauabschnitt vorgesehen.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `photos um art und dauer ergaenzt (Migration auf 0.8.50)`. Danach steht jedes
  vorhandene Foto auf der Art „bild"; an der Anzeige ändert sich nichts.
- **Das Austauschformat steht jetzt auf 10.** Ältere Exportdateien lassen sich
  weiterhin einspielen.
- **Der Videoschalter beim Export ist mit Absicht aus.** Ohne ihn nennt die
  Datei die Videos, enthält sie aber nicht; beim Einspielen sagt die Meldung,
  wie viele gefehlt haben. Wer eine vollständige Sicherung braucht, sichert
  das Verzeichnis `data` — nicht die Exportdatei.

---

## 0.8.40 — Gewichtete Bewertungskriterien

**Nicht jedes Kriterium wiegt gleich.** Bisher zählte „Optische Erscheinung"
genauso viel wie „Verarbeitungsqualität". Ab dieser Version lässt sich das
einstellen.

### Neu

- **Jedes Bewertungskriterium bekommt ein Gewicht.** Im Systembereich, in der
  Karte „Bewertungskriterien", steht neben jedem Kriterium ein Feld:
  **0,2 bis 2**, Vorgabe **1**. Vorgeschlagen werden `0,5 · 0,8 · 1 · 1,2 ·
  1,5`, alles dazwischen lässt sich eintippen. Kommazahlen wie gewohnt mit
  Komma — ein eingefügter Punkt wird ebenfalls gelesen.
- **Der Gesamtschnitt rechnet mit.** Ein Kriterium mit Gewicht 1,5 zieht die
  Zahl am Eintrag anderthalbmal so stark. Das wirkt überall dort, wo die Zahl
  auftaucht: in der Kachel der Übersicht, in der Sortierung „Bewertung", in
  der Detailansicht und im Vergleich.
- **Man sieht, dass gewichtet gerechnet wurde.** Weicht ein Gewicht von 1 ab,
  steht `×1,5` hinter dem Kriteriennamen — am Eintrag und im Vergleich —, und
  im Blockkopf steht das Wort „gewichtet" neben der Zahl. Ohne diese Anzeige
  ließe sich die Kopfzahl nicht mehr nachvollziehen.
- **Export und Import nehmen die Gewichte mit.** Beim Einspielen in eine
  bestehende Anlage bleiben die dort eingestellten Gewichte unangetastet — der
  Import bringt Bestand mit, keine Einstellungen.

### Was gleich bleibt

- **Solange alle Gewichte auf 1 stehen, ist jede angezeigte Zahl exakt die
  von vorher.** Das Einspielen dieser Version verändert keine Bewertung und
  keine Reihenfolge in der Übersicht.
- **Und es ist umkehrbar:** wer alle Gewichte auf 1 zurückstellt, hat wieder
  genau den alten Stand. Es geht dabei nichts verloren.
- **Ein Eintrag bleibt immer zwischen 1 und 5** — bei jeder Kombination von
  Gewichten. Das ergibt sich aus der Rechenart, es ist keine Deckelung.
- Die Skala bleibt 1 bis 5, die Sterne bleiben die eigene Bewertung, und der
  Durchschnitt eines einzelnen Kriteriums bleibt ungewichtet.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `rating_criteria um gewicht ergaenzt (Migration auf 0.8.40)`. Danach steht
  jedes vorhandene Kriterium auf Gewicht 1.
- **Das Austauschformat steht jetzt auf 9.** Ältere Exportdateien lassen sich
  weiterhin einspielen; eine neue Datei in einer älteren Anlage verliert nur
  die Gewichte, sonst nichts.
- Die Gewichte stellt der **Admin** ein. Sie gelten für alle — eine
  persönliche Einstellung wäre eine zweite Wahrheit über denselben Eintrag.

---

## 0.8.31 — Dateien bekommen einen Verfasser

**Wer eine Datei anhängt, dem gehört sie.** Bis dahin durfte nur der Verfasser
eines Eintrags Dateien anhängen.

- **Hochladen darf jeder.** Löschen darf, wer die Datei hochgeladen hat — oder
  der Admin.
- **Ab zwei Zugängen steht der Name an fremden Dateizeilen**, in Klammern
  hinter der Größe. An den eigenen steht nichts; er stünde nur im Weg.
- Export und Import tragen den Namen mit (**Austauschformat 8**).

**Beim Einspielen:** auch diese Version fasst die Datenbank an — `data`
vorher sichern. Beim ersten Start meldet das Protokoll einmalig
`attachments um user_id ergaenzt`; vorhandene Dateien fallen dabei dem
Verfasser ihres Eintrags zu.


---

## 0.8.30 — Die Linkliste bekommt einen Verfasser

**Wer einen Link einträgt, dem gehört die Zeile.** Bis dahin durfte nur der
Verfasser eines Eintrags Links eintragen, sortieren und löschen — dieselbe
Klemme wie für Titel und Beschreibung.

### Neu

- **Eintragen darf jeder.** Löschen darf, wer die Zeile eingetragen hat — oder
  der Admin. Das ✕ steht nur dort, wo es auch gedrückt werden darf.
- **Ab zwei Zugängen steht der Name an fremden Linkzeilen**, in Klammern hinter
  Pfad bzw. Anbieternamen: `(chefin)`. **An den eigenen steht nichts** — er
  stünde nur im Weg. *Daraus folgt ein Satz, den man kennen muss: „kein Name"
  heißt bei mehreren Zugängen „vom Verfasser des Eintrags".* Das Datum steht im
  Überfahrtext.
- **Beide Löschdialoge zählen die Links jetzt mit** — der am Eintrag getrennt
  nach eigen und fremd, der am Zugang als eigene Zeile. *Eine Zahl im Dialog,
  die nichts bewirkt, wäre schlimmer als keine:* „Zugang entfernen" mit dem
  Häkchen *seine Beiträge löschen* räumt die Links seitdem wirklich mit weg.
- Export und Import tragen den Namen mit (**Austauschformat 7**).

### Was gleich bleibt

- **Das Umsortieren der Linkliste bleibt beim Verfasser des Eintrags** — die
  Reihenfolge ändert keine Aussage und lässt sich zurücknehmen; dieselbe
  Überlegung wie beim Anpinnen eines Kommentars.
- **Ein gelöschter Link bekommt keinen Vermerk.** Er ist eine ganze Aussage, die
  geht, kein Loch in einer bleibenden — der Eingriffsvermerk am Kommentar bleibt
  auf den einen Fall begrenzt, für den er beschlossen wurde.
- **Fotos bleiben, wo sie sind.** Sie gehören zum Eintrag selbst: das erste Foto
  ist das Hauptbild und damit sein Gesicht in der Übersicht.
- Ältere Exportdateien lassen sich weiterhin einspielen; ein Link aus einer
  Datei der Formatnummer 6 fällt an den **Verfasser des Eintrags**.

### Beim Einspielen

- **Diese Version fasst die Datenbank an — `data` vorher sichern.** Es ist die
  erste Datenbankstufe seit 0.8.3; ohne die Sicherung gibt es keinen Weg zurück
  auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `links um user_id ergaenzt (Migration auf 0.8.30)`. **Vorhandene Links fallen
  dabei dem Verfasser ihres Eintrags zu** — nicht dem Eigentümer der Anlage:
  bis dahin *waren* die Links eines Eintrags die Sache seines Verfassers.
- **Das Austauschformat steht jetzt auf 7.**

---

## 0.8.20 — Die Schotten dicht

**Eine Runde, die nichts Neues kann und mehrere Löcher schließt.** Sie ändert an
der Bedienung nichts — aber sie ändert, was die Anlage einem Aufrufer glaubt.

### Neu

- **Am Fotoplatz entscheidet ab jetzt der Inhalt, nicht die Angabe.** Beim
  Hochladen wird abgewiesen, was **kein Rasterbild ist** — auch dann, wenn es
  sich als Bild ausgibt; beim Ausliefern bestimmen die **ersten Bytes** den Typ.
  *Bis dahin wurde der beim Hochladen gemeldete Typ aus der Datenbank wieder
  ausgeliefert, und eine SVG-Datei besteht die Prüfung `image/…` anstandslos —
  wer ihre Adresse direkt öffnete, bekam Skript im Ursprung der Anwendung.*
- **Die Anwendung selbst bekommt eine `Content-Security-Policy`** — eine zweite
  Verteidigung für denselben Fehler, und sie ist billig, weil die Oberfläche
  nichts von außen nachlädt.
- **`HINTER_PROXY` in der `.env` — neu und optional.** Sie ist ein Ja/Nein und
  entscheidet über **fünf** Dinge auf einmal: ob `X-Forwarded-For` geglaubt
  wird, den Cookienamen, `Secure` am Cookie, `Strict-Transport-Security` und den
  Hinweis in der README. *Ohne sie wird der Kopf nicht einmal angesehen.*
- **Der Container ist sichtbar gesund oder nicht.** Das Image trägt einen
  `HEALTHCHECK`; `docker compose ps` zeigt `healthy`. *Vorher wusste Docker nur,
  dass der Prozess läuft — ein Container in einer Neustartschleife sah von außen
  gesund aus.*
- **Ein Fehler-Handler nach Rang und sauberes Herunterfahren.** Eine Absage aus
  Absicht sieht anders aus als eine Panne, und `docker compose down` schließt
  die Datenbank ordentlich statt sie abzuschneiden.
- Ein **Index auf `sessions.user_id`** — er rüstet sich bei jedem Start selbst
  nach und ist deshalb **keine** Migration.

### Was gleich bleibt

- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr Format.
- **An der Bedienung ändert sich nichts.** Die Oberfläche ist an keiner Stelle
  angefasst worden — die Sicherheitsregel ist so geschnitten, dass sie zu ihr
  passt, nicht umgekehrt.
- **Vorhandene Fotos bleiben vorhanden.** `photos.mime_type` wird weiter
  geschrieben und angezeigt; sie ist ab jetzt eine **Anzeige, keine
  Ausliefergrundlage**.
- **Bei Anhängen wird weiterhin bewusst nicht gefiltert** — eine Positivliste
  wäre dort durch Umbenennen zu umgehen und wiegte in falscher Sicherheit. Die
  Auslieferungsregeln bleiben, wie sie sind.

### Beim Einspielen

- **Nichts Besonderes.** Keine Datenbankstufe, keine neue Abhängigkeit; die
  Sicherung von `data` ist Empfehlung.
- **`HINTER_PROXY` bleibt leer, solange kein Reverse Proxy davorsteht.** Wer sie
  setzt, muss zweierlei wissen: **es meldet alle einmalig ab** (der Cookiename
  wechselt), und **die Anmeldung geht danach nur noch über HTTPS** — ein
  direkter Aufruf von `http://<server-ip>:3100` käme nicht mehr herein.
- **Eine SVG, die vor dieser Version als Foto hereingekommen ist, wird ab jetzt
  heruntergeladen statt angezeigt.** Das ist gewollt: sie ist eine Webseite und
  keine Grafik. Der Eintrag bleibt unangetastet.
- Der Start meldet ab jetzt die Betriebsart: `Hinter Proxy: an` oder
  `Hinter Proxy: aus`.

---

## 0.8.10 — Werkzeug

**Eine Runde für den Bau, nicht für die Anlage.** Sie beantwortet die Frage, die
sich nach jedem Einspielen stellt: *läuft wirklich der neue Dateisatz?*

### Neu

- **Der Fingerprint in der Karte „Kennzahlen".** Ein Wert über **alles**, was
  der Server lädt und ausliefert. Stimmt er mit dem der Version überein, ist die
  Kopie vollständig; stimmt er nicht, war sie es nicht oder es wurde nicht neu
  gebaut. *Bis dahin gab es dafür nur eine Textstelle je Version, die man von
  Hand suchen musste.* **Er schlägt in beide Richtungen aus** — bei einer Datei
  zu wenig wie bei einer zu viel.
- **Der Bau ist wiederholbar.** `package-lock.json` liegt jetzt im Repo, und das
  Image baut mit `npm ci` statt `npm install`. *Ohne den Wechsel läge die Datei
  da und würde beim Bauen übergangen — ein Merker, der nichts bewirkt.*
- **`sharp` auf 0.35.3, das Image auf Node 22.**
- **Der Prüfstand lässt sich in Gruppen aufrufen und läuft bei jedem Push.**

### Was gleich bleibt

- **An der Anlage ändert sich nichts** — keine Rolle, kein Recht, kein
  Endpunkt, kein Schema, keine neue Einstellung. Die einzige sichtbare Änderung
  ist die eine Zeile im Systembereich.
- Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Wie immer, und das `--build` ist diesmal wichtiger als sonst:** es holt die
  festgeschriebenen Abhängigkeiten und das neue Node-Image.
- **Keine Sicherungspflicht** — die Datenbank wird nicht angefasst.
- **Danach lohnt der erste Blick auf den Fingerprint.** Er steht in der Karte
  „Kennzahlen" und über `curl -s -b cookies.txt .../api/stats`; der erwartete
  Wert steht im Änderungsprotokoll jeder Version.

---

## 0.8.6 — Berichtigungen aus dem Betrieb

**Fünf Dinge, die beim Ansehen der vorigen Version aufgefallen sind.** Kein
Schema, keine neue Route.

### Neu

- **Wer welchen Wert vergeben hat, sieht nur noch der Admin.** Die Sternzeile
  zeigt den **eigenen Wert und den Schnitt** — mehr soll eine Bewertung nicht
  aussagen. Die Namensliste ruft der Admin über den Knopf **„Wer hat bewertet"**
  im Blockkopf auf; dort entfernt er auch eine fremde Bewertung. **Die Note
  ändert er nicht.** *Der Knopf erscheint erst ab zwei Zugängen — bei einem wäre
  die Ansicht der eigene Wert ein zweites Mal.*
- **Die Linkliste wird abgeschnitten statt scrollbar.** Auf dem Finger scrollt
  damit immer die Seite; der Weg zum Rest ist der Knopf „alle N anzeigen", den
  es längst gibt.
- **Die Lücke im Kartenraster ist weg.** Die breite Kachel „Zugänge" ließ je nach
  Fensterbreite eine Lücke davor; das Raster zieht jetzt eine nachfolgende
  schmale Karte selbst hinein.
- **In der Kopfzeile steht, wer angemeldet ist** — neben „Abmelden", und **auch
  bei einem einzigen Zugang**: das ist eine Aussage über einen selbst, nicht
  über andere.
- **„Angelegt von" nennt auch das Datum**, in derselben Form wie die Kopfzeile
  eines Kommentars.

### Was gleich bleibt

- **Der Schnitt und die Zahl der Bewerter bleiben für jeden sichtbar** — sie
  sind keine Aussage über eine Person.
- **Am Löschweg für eine fremde Bewertung ändert sich nichts**; er ist nur
  mitgewandert. *Wäre die Liste ersatzlos verschwunden, wäre er vom Bildschirm
  aus unerreichbar geworden — die neue Ansicht ist deshalb kein Zusatz, sondern
  die Bedingung.*
- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr Format.

### Beim Einspielen

- **Nichts Besonderes.** Keine Datenbankstufe, keine neue Einstellung, keine
  neue Abhängigkeit.

---

## Ältere Versionen — 0.8.5 und davor

**Für diese Versionen gab es noch kein Changelog.** *Sie werden hier nicht
nacherzählt: die Nummern stehen vollständig im Projektstand, Abschnitt 9, und
was von ihnen als Regel weitergilt, in Abschnitt 5.* Die Zeile je Version ist
die folgende — **damit keine Version ohne Eintrag bleibt**:

| Version | Was |
|---|---|
| **0.8.5** | Der Systembereich lernt die Rechte: dreizehn Karten nach Rolle, Kennzahlen nur noch für den Admin, Karte „Links" in zwei geschnitten |
| **0.8.4** | Eingriffsvermerk nennt die Rolle, „bearbeitet" an den Bildwegen des Verfassers, Zahlen am Kommentarblock, die beiden Anlegen-Schalter für Tags und Kategorien, Umschalter „meine/alle" im Vergleich |
| **0.8.3** | Eingriffsvermerk am Kommentar (Datenbankstufe), Kennzeichnung eigener Kommentare, blaue Aufgabenmarke, Tagwolke klappt ganz auf |
| **0.8.2** | Verfassernamen an Eintrag, Kommentar, Testtag und Bewertung; Löschdialog am Eintrag mit Zahlen; eine fremde Bewertung lässt sich löschen |
| **0.8.1** | Bereinigung: aller Migrationscode entfernt, Schema als vollständige DDL. **Ab hier wird eine Datenbank aus 0.8.0 oder neuer vorausgesetzt** |
| **0.8.0** | Karte „Zugänge", drei Rollen als Leiter, Sperren, Anmeldebremse je Name, **Löschen entwertet statt zu löschen**, `zugang.js` auf dem Wirt statt `AUTH_RESET` |
| **0.7.2** | Rechteschicht serverseitig an jedem schreibenden Endpunkt; Export und Import nur für den Eigentümer |
| **0.7.1** | Export und Import tragen Verfassernamen (Austauschformat 6) |
| **0.7.0** | Eigene Sterne neben Schnitt und Bewerterzahl, zweistufiger Gesamtschnitt, Kriterien nur noch im Systembereich |
| **0.6.6** | Am Eintrag heißt es „Favorit"; er sortiert nicht mehr vor und bekommt einen eigenen Filter |
| **0.6.5** | Persönliche Einstellungen: Filterwahl, Schriftgröße, Blockanordnung und drei weitere gehören ab jetzt dem Einzelnen |
| **0.6.4** | Berichtigung: der Favoriten-Knopf zeichnete sich nach dem Klick nicht neu |
| **0.6.3** | Der Favorit steht je Benutzer; Anheften rührt das Änderungsdatum nicht mehr an |
| **0.6.2** | Zwei Leute am selben Datum sind zwei Testtage; jeder hat seine eigene Bewertungszeile |
| **0.6.1** | Eintrag, Kommentar und Testtag bekommen einen Verfasser |
| **0.6.0** | Grundlage des Mehrbenutzerbetriebs: Rolle, Adresse, Status und letzte Anmeldung am Zugang |
| **0.5.11** | Mehrere Suchanbieter je Suchzeile |
| **0.5.10** | Umbenennung auf „Kriterion", ohne jede Funktionsänderung |
| **0.5.9** | Erledigt-Zustand für Aufgaben |
| **0.5.8** | Kriterien werden nur noch im Systembereich gelöscht |
| **0.5.7** | Dritte Kommentarart: Aufgabe |
| **0.5.6** | Zoom im Vollbild startet in der Mitte |
| **0.5.5** | Kennzeichnung von Art und Anheftung am Kommentar |
| **0.5.4** | Links im Kommentartext sind anklickbar |
| **0.5.3** | Eine Suchzeile, die keine Adresse ist, führt zum Suchanbieter |
| **0.5.2** | Innerhalb jeder Kommentargruppe steht das Älteste oben |
| **0.5.1** | Der Ausschnitt-Modus ließ sich nicht verlassen |
| **0.5.0** | Erstanmeldung; der Zugang liegt als Hash in der Datenbank statt in der Umgebung |
| **0.4.10** | Versionsnummer auf der Anmeldeseite |
| **0.4.9** | Sprung beim Bearbeiten der Beschreibung behoben |
| **0.4.8** | Handy-Paket, zweiter Teil; die Filterwahl sprang beim Zurückgehen zurück |
| **0.4.7** | Handy-Paket: Ziehen erst nach Halten, Zeilenaktionen als Zeichen, Schriftskala 80–120 |
| **4.5** | Und/Oder-Verknüpfung der Tagfilter |
| **4.4.2** | Dateizeilen reagieren als Ganzes auf einen Klick |
| **4.4.1** | PDF-Vorschau blieb leer, Löschkreuz war unsichtbar |
| **4.4** | Anhänge am Eintrag |
| **4.3** | Tags an Testtagen, Zeitleiste, Blöcke anordnen, Tagwolken aufklappbar |
| **4.2** | Schriftgröße einstellbar, anpassbares Vokabular |
| **4.1** | Bewertungskriterien pflegen, mitwachsende Felder, Prüfstand |

*Alles davor — 4.0 und älter — ist nicht mehr dokumentiert und wird nicht mehr
berücksichtigt: eine Datenbank aus jener Zeit lässt sich seit 0.8.1 ohnehin
nicht mehr übernehmen.*

---

<!-- DIE VERGLEICHSVERWEISE. Sie hängen an den Git-Tags. Ältere Tags gibt es
     zwar (0.8.3 bis v0.8.91), aber die Reihe ist lückenhaft und die
     Schreibweise uneinheitlich — verlässlich verlinkbar ist sie erst ab
     0.10.0. Ab 0.11.0 steht deshalb ein echter Vergleich; für alles vor
     0.10.0 bleibt das Änderungsprotokoll in `Doku/` das Ziel.
     `v0.10.0` liegt am Remote und trägt. ACHTUNG: ab `v0.11.0` fehlen sie alle
     am Remote; solange das so ist, zeigen die Verweise darunter ins Leere.
     SEIT DEM 30. AUGUST 2026 IST ENTSCHIEDEN, DASS KEINE TAGS MEHR GESETZT
     WERDEN -- weder die ausstehenden noch kuenftige (Projektstand,
     Abschnitt 8). Die Verweise bleiben trotzdem stehen: sie sind Teil der Form
     dieser Datei, und wer die Tags eines Tages doch setzt, findet sie fertig
     vor. Die Versionen sind ueber diese Datei, die Aenderungsprotokolle und
     den Fingerprint eindeutig bestimmt.
     DER GRUND IST SEIT 0.12.4 BEKANNT UND WAR VORHER FALSCH NOTIERT: es ist
     KEIN Problem der GitHub-Rechte. Der Git-Proxy der Arbeitsumgebung, in der
     Claude laeuft, weist `POST /git-receive-pack` mit `refs/tags/*` mit 403
     ab -- ohne einen einzigen GitHub-Header, GitHub sieht die Anfrage nie.
     `refs/heads/*` geht durch dieselbe Route ohne weiteres durch.
     Die Tags muessen deshalb vom Rechner des Betreibers gesetzt werden; die
     Befehle stehen im Projektstand, Abschnitt 8. -->
[0.10.0]: https://github.com/fardem/kriterion/releases/tag/v0.10.0
[0.11.0]: https://github.com/fardem/kriterion/compare/v0.10.0...v0.11.0
[0.12.0]: https://github.com/fardem/kriterion/compare/v0.11.0...v0.12.0
[0.12.1]: https://github.com/fardem/kriterion/compare/v0.12.0...v0.12.1
[0.12.2]: https://github.com/fardem/kriterion/compare/v0.12.1...v0.12.2
[0.12.3]: https://github.com/fardem/kriterion/compare/v0.12.2...v0.12.3
[0.12.4]: https://github.com/fardem/kriterion/compare/v0.12.3...v0.12.4
[0.13.0]: https://github.com/fardem/kriterion/compare/v0.12.4...v0.13.0
[0.13.1]: https://github.com/fardem/kriterion/compare/v0.13.0...v0.13.1
[0.13.2]: https://github.com/fardem/kriterion/compare/v0.13.1...v0.13.2
[0.14.0]: https://github.com/fardem/kriterion/compare/v0.13.2...v0.14.0
[0.15.0]: https://github.com/fardem/kriterion/compare/v0.14.0...v0.15.0
[0.15.1]: https://github.com/fardem/kriterion/compare/v0.15.0...v0.15.1
[0.16.0]: https://github.com/fardem/kriterion/compare/v0.15.1...v0.16.0
[0.17.0]: https://github.com/fardem/kriterion/compare/v0.16.0...v0.17.0
[0.17.1]: https://github.com/fardem/kriterion/compare/v0.17.0...v0.17.1
