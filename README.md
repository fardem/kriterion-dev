# Kriterion

**Ein selbstgehostetes Archiv für Dinge, die man sammelt und beurteilt.**
Geräte, Materialien, Modelle, Prototypen, Bezugsquellen — alles, wovon man
mehrere hat und zwischen denen man sich irgendwann entscheiden muss.

Jeder Eintrag trägt Fotos und Kurzvideos, eine Bewertung nach frei gewählten
Kriterien, Kommentare, Testtage, Links und Dateien. Man kann Einträge
nebeneinanderstellen, vergleichen, filtern und durchsuchen.

**Alles bleibt auf dem eigenen Server.** Kein Konto bei Dritten, keine Cloud,
kein Verkauf, keine Telemetrie. Keine externen Schriftarten, kein CDN, keine
Favicon-Abrufe — die Anwendung läuft vollständig offline im eigenen Netz.
**Die Datenbank ist als Ganzes verschlüsselt** (SQLCipher, AES-256); Fotos und
Videos liegen darin und werden nie als Datei auf die Platte geschrieben.

---

## Was du damit machen kannst

| | |
|---|---|
| **Einträge anlegen** | Titel, Beschreibung, Kategorie, Tags — dazu Fotos, Kurzvideos bis 20 MB, Dateien bis 50 MB und eine Linkliste |
| **Bewerten** | eigene Kriterien mit Sternen von 1 bis 5, je Kriterium ein **Gewicht** zwischen 0,2 und 2, daraus ein gewichteter Gesamtschnitt |
| **Mitschreiben** | Kommentare in drei Arten — **Notiz**, **Bericht**, **Aufgabe** (mit Erledigt-Haken) —, dazu Bilder am Kommentar |
| **Testtage führen** | datierte Einträge mit Note und Tags; sie sind die Zeitreihe, die Kriterienbewertung ist das gegenwärtige Urteil |
| **Vergleichen** | mehrere Einträge nebeneinander, Kriterium für Kriterium |
| **Suchen und filtern** | Volltextsuche über Titel, Beschreibung, Kategorie, Tags, Links und Kommentare — **jede Trefferkachel sagt, wo das Wort steht, und der Begriff ist hervorgehoben**; Filterstellungen lassen sich als **Ansicht** speichern |
| **Den Überblick behalten** | „Offen" zeigt alle unerledigten Aufgaben über alle Einträge, die **Glocke** alles, was seit dem letzten Blick dazugekommen ist |
| **Zu mehreren arbeiten** | Zugänge mit drei Rollen; jeder Beitrag trägt seinen Verfasser |
| **Sichern** | verschlüsselte Kopie auf Knopfdruck, dazu ein JSON-Export, der ohne Schlüssel auskommt |

## Ist das etwas für dich?

**Ja, wenn du** einen kleinen Server oder ein NAS hast, auf dem Docker läuft,
und einen Bestand pflegen willst, der dir gehört und dich überdauert.
Kriterion ist für **eine Person oder eine Handvoll**, die einander kennen —
eine Familie, eine Werkstatt, ein Verein.

**Nein, wenn du** eine Anwendung für viele fremde Nutzer suchst, einen Shop,
eine öffentliche Datenbank oder etwas, das ohne eigenen Server auskommt.

**Und das solltest du vor der Entscheidung wissen:**

* **Eine Installation ist ein Sachgebiet.** Bewertungskriterien sind global und
  erscheinen an **jedem** Eintrag. Wer Modelle *und* Werkzeuge *und*
  Bezugsquellen sammeln will, betreibt besser zwei oder drei Installationen mit je
  eigenem Datenverzeichnis — sonst steht an jedem Eintrag die Kriterienliste
  aller Sachgebiete.
* **Ein Schlüssel, eine Datenbank.** Die Verschlüsselung schützt die Datei,
  nicht die Benutzer voreinander: wer die Installation betreibt, kann alles lesen,
  was darin steht. Bei einer selbstgehosteten Sache ist das normal — es gehört
  trotzdem gesagt, bevor Fremde mitmachen.
* **Ohne den Schlüssel sind die Daten endgültig verloren.** Es gibt keine
  Hintertür. Der Abschnitt „Der Schlüssel" weiter unten ist der wichtigste
  in dieser Datei.
* **E-Mail ist Bequemlichkeit, nie Voraussetzung.** Ohne Mailzugang läuft
  alles weiter; nur Einladungs- und Rücksetzungslinks muss man dann selbst
  weiterreichen.

## Woraus es gebaut ist

Node.js mit Express, SQLite über SQLCipher
(`better-sqlite3-multiple-ciphers`), Bildverarbeitung mit `sharp`, Mailversand
mit `nodemailer`. **Das Frontend kommt ohne Framework aus** — kein Build, keine
Paketkette im Browser, eine Datei JavaScript und eine Datei CSS.

Fünf Laufzeitabhängigkeiten, festgenagelt über `package-lock.json`.

**Was eine Version mitbringt, steht in `CHANGELOG.md`.** Das Format folgt
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern
folgen [Semantic Versioning](https://semver.org/lang/de/).

## Erstinstallation

**Voraussetzungen:** ein Rechner mit Docker und Docker Compose — ein NAS, ein
kleiner Server, ein Intel-N100-Kasten unter OpenMediaVault reicht völlig. Sonst
nichts: Node.js, Übersetzer und Datenbank stecken im Image.

```bash
git clone https://github.com/fardem/kriterion.git
cd kriterion
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
docker compose up -d --build
```

**Ohne `git` geht es über das ZIP** — auf <https://github.com/fardem/kriterion>
unter „Code" → „Download ZIP":

```bash
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion                  # der Ordner heißt nach dem Branch
cd kriterion
chmod +x schluessel.sh                       # siehe unten
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
docker compose up -d --build
```

Erreichbar unter `http://<server-ip>:3100`. **Der Port steht in der
`docker-compose.yml`**, nicht in der `.env`.

> **DIE `chmod`-ZEILE BRAUCHT NUR, WER MIT `python3 -m zipfile` AUSPACKT** —
> oder unter Windows. **`unzip` und `git clone` bringen das Ausführungsrecht
> mit.** *Fehlt es, antwortet `./schluessel.sh` später mit „Keine
> Berechtigung"; dann hilft `chmod +x schluessel.sh`.*

**Der Schritt `cp .env.example .env` ist Pflicht, auch wenn nichts darin steht.**
`docker compose` liest die Datei ein und bricht sonst ab, bevor der Container
startet. Alle Werte dürfen leer bleiben.

**Der Schritt `cp docker-compose.example.yml docker-compose.yml` ist Pflicht.**
Ohne die Datei bricht `docker compose up` mit
„no configuration file provided: not found" ab. **Die Vorlage liegt im Repo, die
Arbeitskopie nicht** — genau wie bei der `.env`, und aus demselben Grund: hier
stehen der Port, die Einhängung des Sicherungsorts und der Containername, und
das sind *deine* Werte. Wer sie in einer verfolgten Datei bearbeitet, verliert
sie beim nächsten Auspacken des ZIP.

> **BEIM AKTUALISIEREN GILT DASSELBE UMGEKEHRT.** Wer per `git pull`
> aktualisiert, sieht seine `docker-compose.yml` danach als **unverfolgte
> Datei** — sie bleibt liegen, wie sie ist. Wer das ZIP über den Ordner
> entpackt, **behält** sie ebenfalls. *Das ist der ganze Zweck.* Ändert sich
> etwas an der Vorlage, steht es im `CHANGELOG.md`; verglichen wird dann von
> Hand mit `diff docker-compose.example.yml docker-compose.yml`.

**`--build` ist nicht optional**, auch beim ersten Mal nicht: der Quelltext
steckt im Image, nicht im eingehängten Verzeichnis.

### Der erste Zugang

**Beim ersten Aufruf im Browser** werden Benutzername und Passwort gesetzt.
Es gibt keine voreingestellte Kennung, und in der `.env` steht kein Passwort —
der Zugang liegt als scrypt-Hash in der verschlüsselten Datenbank. Mindestens
zehn Zeichen, sonst keine Regeln.

**Dieser erste Zugang wird der Eigentümer.** Ihm gehören Export, Import,
Rollenvergabe, der Mailzugang und der Schlüsselwert; alles Weitere steht unter
„Rollen und Zugänge".

### Was danach eingerichtet werden kann — und nichts davon muss

| | wo | wofür |
|---|---|---|
| **Titel der Installation** | Systembereich, Karte „Darstellung" | zwei frei wählbare Titel: einer über der Anmeldeseite, einer in der Anwendung |
| **Bewertungskriterien** | Systembereich, Karte „Bewertungskriterien" | Name, Reihenfolge, Gewicht — sie erscheinen an jedem Eintrag |
| **Potenzialkriterien** | Systembereich, Karte „Potenzial: Kriterien" | dasselbe für den Kasten *vor* dem Test — zwei oder drei reichen |
| **Vokabular** | Systembereich, Karte „Vokabular" | zwölf Wörter der Oberfläche umbenennen, etwa „Eintrag" → „Modell" |
| **Weitere Zugänge** | Systembereich, Karte „Zugänge" | anlegen oder über einen Einladungslink einladen |
| **Mailversand** | Systembereich, Karte „Mailversand" | nur für Einladungs- und Rücksetzlinks; ohne ihn läuft alles weiter |
| **Sicherungsort** | `docker-compose.yml` | Vorgabe liegt im Projektverzeichnis; die empfohlene Lage ist daneben — siehe „Sichern" |
| **Reverse Proxy** | `.env`, `HINTER_PROXY=1` | nur wenn die Installation über einen Proxy und HTTPS nach außen geht. **Der Weg über `http://<server-ip>:3100` bleibt daneben offen** — siehe „Anmeldung" |

### Wenn niemand mehr hereinkommt

Der gewöhnliche Weg läuft über die Karte „Zugänge": ein Admin erzeugt einen
**Link zum Zurücksetzen**, und der Betreffende wählt sein Passwort selbst.
Kommt **niemand mehr** herein, hilft der Weg auf dem Server — nicht die `.env`:

```bash
docker compose exec kriterion node zugang.js passwort <name>
```

Das Passwort wird zweimal abgefragt und gleich dort gesetzt; alle Sitzungen
dieses Zugangs fallen, Bestand und Rolle bleiben unangetastet — der
Datenbankschlüssel hängt nicht am Passwort.

| Befehl | was er tut |
|---|---|
| `node zugang.js liste` | zeigt die vorhandenen Namen, ihre Rolle und ob der zweite Faktor an ist |
| `node zugang.js passwort <name>` | setzt ein neues Passwort |
| `node zugang.js zweifaktor <name>` | schaltet den zweiten Faktor **aus** — einschalten geht von dort ausdrücklich nicht |
| `node zugang.js entfernen <name>` | legt einen Zugang still |
| `node zugang.js eigentuemer <name>` | der Notausgang, wenn sich der bisherige Eigentümer nicht mehr anmeldet |

Läuft der Container gar nicht erst an, tut es
`docker compose run --rm kriterion node zugang.js …` ebenso.

Das alles setzt Zugriff auf den Server voraus und ist deshalb kein Umweg um die
Anmeldung. **Der Zugang lässt sich über keine Umgebungsvariable setzen oder
zurücksetzen** — `AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD` werden nicht
gelesen. Stehen sie in der `.env`, meldet der Start sie als entfernbar; sie
enthalten ein Passwort im Klartext und gehören heraus.

## Der Schlüssel — bitte einmal aufmerksam lesen

Hier entscheidet sich, ob die Verschlüsselung tatsächlich schützt.

**Ohne eigenen Schlüssel** wird beim ersten Start automatisch einer erzeugt und
unter `data/encryption.key` abgelegt — also **direkt neben der Datenbank**. Das
genügt gegen zufälliges Durchklicken im Dateisystem. Es genügt **nicht**, wenn
jemand das Verzeichnis `data` kopiert: Er hat dann Daten und Schlüssel beisammen
und kann alles lesen.

**Soll eine kopierte Datenbank unlesbar bleiben**, muss der Schlüssel in die
`.env`. Der Systembereich zeigt den **bereits erzeugten** Wert zum Abschreiben —
genau diesen eintragen. Keinen neuen erzeugen, solange schon Daten vorhanden
sind: sie wären danach nicht mehr lesbar.

Reihenfolge: Wert in die `.env`, `docker compose up -d`, im Protokoll
„Schlüssel aus ENCRYPTION_KEY geladen" prüfen — **erst dann**
`data/encryption.key` entfernen. Dann wird auch keine Schlüsseldatei mehr
angelegt.

Nur bei einer noch leeren Installation darf der Schlüssel auch von Hand kommen
(`openssl rand -hex 32`).

**Die `.env` muss dauerhaft liegen bleiben.** Sie wird nicht nur einmal gelesen:
Jedes Einspielen einer neuen Version erzeugt den Container neu und liest sie
dabei erneut. Fehlt sie dann, öffnet sich die Datenbank nicht mehr.

**Und jetzt der Punkt, an dem es in der Praxis schiefgeht:** Wer anschließend
den kompletten Projektordner sichert, hat die `.env` mit in der Sicherung — und
damit den Schlüssel wieder neben den Daten. Die Verschlüsselung ist dann so wirksam
wie ein Schloss mit danebenliegendem Schlüssel.

> **Merksatz:** `.env` und `data/` gehören **nicht** in dieselbe Sicherung.
> Den Schlüssel getrennt aufbewahren, zum Beispiel im Passwortspeicher.
> **Das gilt auch für die Sicherung auf Knopfdruck:** ihre Kopie ist
> verschlüsselt und ohne den Schlüssel wertlos — der Zielort ist deshalb nicht
> der Ort für die `.env`.

**Die Kehrseite:** Ohne den Schlüssel sind alle Daten endgültig verloren. Es
gibt keine Hintertür und keine Wiederherstellung. Wer den Schlüssel selbst
setzt, muss ihn auch verwahren.

**Ist es schon passiert?** Lag der Schlüssel eine Weile neben der Datenbank und
wurde `data/` in dieser Zeit kopiert, öffnet diese Kopie die Datei bis heute —
auch nachdem der Wert in die `.env` umgezogen ist. Dagegen hilft nur ein
**Schlüsselwechsel** — wie der geht, steht ganz am Ende dieser Datei.

## Eine neuere Version über eine bestehende einspielen

> **OB EINE VERSION DIE DATENBANK ANFASST, STEHT IM `CHANGELOG.md` ÜBER IHREN
> ÄNDERUNGEN.** Steht dort ein Kasten, ist etwas zu tun; steht dort keiner, ist
> die Sicherung Empfehlung und nicht Pflicht. *Wer sie mitnimmt, tut nichts Falsches; die Zeile steht unten
> ohnehin im Rezept.*
>
> **WER VON EINER FASSUNG VOR 0.14.0 KOMMT, SICHERT PFLICHTGEMÄSS.**
> Der Sprung führt über die Datenbankstufe 0.14.0 hinweg: sie rüstet drei
> Spalten an `items` nach (`rejected_at`, `rejected_grund`, `rejected_von`), und
> ihr Migrationsblock läuft beim ersten Start mit. **Ohne die Kopie gibt es
> danach keinen Rückweg.** *Im Protokoll steht dann einmalig die Zeile „items um
> rejected_at, rejected_grund und rejected_von ergaenzt (Migration auf 0.14.0)"
> samt der Zahl der Ablehnungen, die von nun an ohne Datum, Grund und Verfasser
> dastehen — das ist gewollt: diese Installation weiß nicht, wann und von wem sie
> getroffen wurden.*
>
> **Niemand wird abgemeldet, und einzustellen ist nichts.** *Auch keine
> gespeicherte Ansicht geht verloren: eine ältere Ansicht kennt den Filter
> „abgelehnt" nicht und fällt auf „Alle" zurück.*

**Der Weg ersetzt das Verzeichnis, statt darüber zu kopieren.** Bestand
(`data/`), Schlüssel (`.env`) und Sicherungen ziehen von Hand mit:

```bash
cd .../kriterion && docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)
mv kriterion kriterion-alt
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion               # der Ordner heißt nach dem Branch
cp -r kriterion-alt/data kriterion/data
cp kriterion-alt/.env kriterion/.env      # ohne diese Zeile startet nichts
mv kriterion-alt/kriterion-sicherung kriterion/ 2>/dev/null   # nur bei Ort im Projekt
chmod +x kriterion/schluessel.sh          # python3 legt das Recht nicht an
cd kriterion && docker compose up -d --build
```

**Danach ins Protokoll sehen** (`docker compose logs kriterion`): dort muss
„Schlüssel aus ENCRYPTION_KEY geladen" stehen. Steht stattdessen die Warnung
über eine Schlüsseldatei neben den Daten, wurde die `.env` nicht gelesen —
dann sofort anhalten und nachsehen, **bevor** etwas geschrieben wird.

### Warum jede Zeile so dasteht

**`docker compose down` vor der Sicherung.** Eine Kopie, die neben einem
laufenden Server entsteht, kann eine offene WAL-Datei enthalten.

**Die Sicherungszeile.** Bei einer Version, die die Datenbank anfasst, ist sie
kein guter Rat, sondern der einzige Weg zurück. Ob eine Version das tut, steht
im `CHANGELOG.md` über ihren Änderungen.

**`mv kriterion kriterion-alt` und ein frisch entpacktes Verzeichnis.** Wer über
den alten Ordner entpackt, behält Dateien, die die neue Version **weggenommen**
hat. Der Server läuft dann einwandfrei, die Oberfläche ist die neue — **und der
Fingerprint ist trotzdem ein anderer** (siehe unten).

**Der Ordner aus dem ZIP heißt nicht `kriterion`.** GitHub hängt den Branchnamen
an: aus `main` wird `kriterion-main`. Ohne das `mv` legt das folgende
`cp -r kriterion-alt/data kriterion/data` den Bestand in einen Ordner, den
`docker compose` nie ansieht.

**Die `.env` liegt bewusst nicht im Paket** — sie enthält den Schlüssel und hat
in einer verteilten Datei nichts verloren. Sie wandert mit dem alten Ordner nach
`kriterion-alt` und muss von Hand zurück. Fehlt sie, bricht `docker compose` ab,
bevor der Container entsteht; kaputt geht dabei nichts.

> **Nicht mit `cp .env.example .env` behelfen.** Dieser Schritt gilt nur für
> eine **neue, leere** Installation. Bei vorhandenem Bestand steht darin ein
> leerer `ENCRYPTION_KEY`, der Start erzeugt einen **neuen** Schlüssel und legt
> ihn als `data/encryption.key` ab — und die vorhandene Datenbank lässt sich
> damit nicht mehr öffnen. Passiert es doch: `data/encryption.key` löschen und
> die richtige `.env` aus `kriterion-alt` holen. Zerstört wird nichts, aber der
> Container läuft bis dahin in einer Neustartschleife.

**Die `mv`-Zeile für die Sicherungen gilt nur, solange der Sicherungsort im
Projektverzeichnis liegt** — der Auslieferungszustand. Sie holt die vorhandenen
Kopien aus dem umbenannten Ordner zurück; ohne sie bleiben sie in
`kriterion-alt` liegen und verschwinden, sobald der weggeräumt wird. Genau davor
warnt der rote Kasten in der Karte „Sicherung". Liegt der Ort außerhalb, ist die
Zeile ohne Wirkung und stört nicht.

**Die `chmod`-Zeile.** `python3 -m zipfile -e` legt das Ausführungsrecht beim
Auspacken nicht an — `unzip` und `git clone` tun es. **Wer einen davon nimmt,
braucht die Zeile nicht.** Ohne das Recht antwortet `./schluessel.sh` mit „Keine
Berechtigung"; es geht dann auch `bash schluessel.sh zeigen`.

**`--build` ist nicht optional.** Ohne es startet stillschweigend die alte
Version weiter — der Quelltext steckt im Image, nicht im eingehängten
Verzeichnis.

### Prüfen, ob wirklich die neue Version läuft

Die Versionsnummer allein genügt nicht:

```bash
curl -s http://localhost:3100/api/config
```

Diese Zahl kommt aus der `package.json` und ist **keine Aussage über die
übrigen Dateien**. Wurden `package.json` und `server.js` ersetzt,
`public/app.js` aber nicht, zeigt die Fußzeile die neue Version, während die
Oberfläche sich alt verhält.

**Dafür gibt es den Fingerprint.** Der Server bildet beim Start eine kurze
Prüfsumme über alles, was er lädt und ausliefert, und meldet sie unter
`fingerprint` in `GET /api/stats` — angemeldet, in der Karte „Kennzahlen" im
Systembereich. Der Sollwert steht zu jeder Version im Änderungsprotokoll
(`Doku/Aenderungsprotokoll_<Version>.md`, Zeile „Fingerprint …").

Stimmt er nicht überein, ist der Dateisatz nicht der, der gemeint war — dann
hilft nur, ihn **vollständig** erneut einzuspielen, nicht einzelne Dateien
nachzuziehen. **Er schlägt in beide Richtungen aus: auch eine Datei ZU VIEL
ändert ihn**, denn er geht über alles unter `public/` und nicht über eine Liste
erwarteter Namen.

**Weicht er ab, findest du die Ursache so** — im Projektverzeichnis oder im
Container (`docker compose exec kriterion sh`):

```bash
for f in anhaenge.js auth.js bestandslauf.js bilder.js db.js keys.js mail.js \
         package.json server.js zweifaktor.js public/*; do
  printf "%-26s %s\n" "$f" "$(sha256sum "$f" | cut -c1-8)"
done
```

Das sind **genau die Dateien, über die der Fingerprint geht**, und sonst keine.
Steht eine Zeile zu viel da, ist das die Ursache; weicht eine Prüfsumme ab, ist
es diese Datei. Löschen bzw. ersetzen und `docker compose up -d --build`, denn
der Quelltext steckt im Image.

*Ein Randfall, der wie ein Fehler aussieht und keiner ist:* ändert eine Version
die Marke der Installation, zeigt der Browser im Reiter noch die alte — ein hartes
Neuladen (Strg+Umschalt+R) räumt den Zwischenspeicher weg.

### Wenn eine Version die Datenbank anfasst

**Eine fehlende Tabelle legt der Start selbst an**, dafür braucht es nichts.
**Rüstet eine Version eine Spalte nach, sagt sie es im Protokoll** — etwa
„links um user_id ergaenzt (Migration auf 0.8.30)". Die Zeile kommt genau
einmal; beim nächsten Start ist sie weg, und das ist richtig so. Wer mehrere
Versionen auf einmal überspringt, sieht entsprechend mehrere Zeilen.

**Ein Downgrade ist dann keine reine Dateikopie mehr** — deshalb die Sicherung
davor. Eine ältere Fassung sieht zusätzliche Tabellen und Spalten gar nicht an;
was darin steht, bleibt stehen, aber niemand zeigt es mehr.

**Vorausgesetzt wird eine Datenbank aus Version 0.8.0 oder neuer.** Ein älterer
Bestand wird nicht übernommen; er braucht den Zwischenschritt über 0.8.0, die
letzte Version, die ihn noch lesen konnte.

## Verschlüsselung

Die **gesamte Datenbankdatei** ist verschlüsselt (SQLCipher, AES-256). Ohne
Schlüssel meldet selbst ein Datenbankwerkzeug nur „file is not a database" —
lesbar ist nichts, auch nicht die Tabellenstruktur, Kategorienamen, Zeitstempel
oder Bildgrößen. Fotos **und Videos** liegen mit in der Datenbank und werden
nie als Datei auf die Platte geschrieben; der Upload läuft über den
Arbeitsspeicher.

Innerhalb der geöffneten Datenbank steht alles im Klartext. Deshalb funktioniert
die Suche über sämtliche Felder, ohne dass die Verschlüsselung im Weg steht.

## Anmeldung

Ohne gültige Anmeldung ist außer dem öffentlichen Titel nichts zu sehen: keine
Einträge, keine Kategorien, keine Zahlen. Auch die Schnittstellen liefern ohne
Sitzung nichts aus, Fotos, Videos und Export eingeschlossen. Sitzungen laufen nach 30
Tagen ab.

Nach mehreren Fehlversuchen antwortet die Anmeldung verzögert, nach zehn
Fehlversuchen von derselben Adresse für einige Minuten gar nicht mehr.
Gezählt wird zusätzlich je Benutzername — dort wird nur verzögert, nie
gesperrt: eine harte Namenssperre wäre ein Werkzeug *gegen* fremde Zugänge.
**Dieselbe Bremse steht vor dem Einlösen eines Einladungs- oder
Rücksetzlinks** — dort ohne die Hälfte je Benutzername, denn ein Link nennt
keinen. Was dabei abgewiesen wird — abgelaufen, schon eingelöst, erfunden, oder
der Zugang ist gesperrt —, beantwortet die Installation **immer gleich**: „Dieser
Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern." Der Grund ist
nicht Geheimniskrämerei, sondern dass in allen vier Fällen dasselbe zu tun
ist.

**Die zweite Bestätigung greift auch hinter der Anmeldung** — vor
jedem Weg, der die Installation als Ganzes trifft. Was das ist und warum, steht
unter „Rollen und Zugänge".

### Der zweite Faktor, freiwillig

**Wer will, sichert seinen Zugang zusätzlich mit einem Code aus einer App auf
seinem Telefon.** Der Code entsteht dort **ohne Netz**, aus einem Geheimnis und
der Uhr, und ist alle dreißig Sekunden ein anderer. **Die Installation schickt dafür
nichts hinaus** — kein Code per Mail, kein Code per SMS.

> **OHNE ZWEITEN FAKTOR LÄUFT DIE INSTANZ VOLLSTÄNDIG.** Er ist freiwillig und
> steht je Zugang; ab Werk ist er aus. Wer ihn nicht einschaltet, merkt von
> dieser Funktion nichts. **Und niemand kann ihn für einen anderen ein- oder
> ausschalten** — auch der Eigentümer nicht.

**Wo er eingeschaltet wird:** im Systembereich, in der Karte **„Zugang"** —
dort, wo auch Name, Passwort und Adresse stehen. Der Zustand steht dort ohne
Klick: „an seit …" oder „aus", dazu die Zahl der übrigen
Wiederherstellungscodes.

**Was auf dem Telefon zu tun ist**, in drei Schritten:

1. Eine App installieren, die TOTP nach RFC 6238 kann — **Google
   Authenticator**, Aegis, 1Password, die Passwörter-App von iOS. Alle rechnen
   dasselbe; Kriterion bindet sich an den Standard, nicht an einen Anbieter.
2. In der Karte „Zugang" auf **„Zweiten Faktor einschalten"** und das bisherige
   Passwort eingeben. Es erscheint ein Schlüssel in **Vierergruppen**. Am
   Telefon führt der Knopf **„In der App öffnen"** unmittelbar hinein; am
   Rechner wird der Schlüssel von Hand in die App eingetragen — die Leerzeichen
   gehören nicht dazu.
3. Den **sechsstelligen Code**, den die App dann anzeigt, in das Feld darunter
   eintragen und auf **„Einschalten"**. Erst damit ist er an: so ist belegt,
   dass die App wirklich dasselbe rechnet.

**Ab dann fragt die Anmeldung in zwei Schritten** — erst Passwort, dann Code.
Ein Code gilt **genau einmal**; Uhren dürfen dabei um eine halbe Minute
auseinanderlaufen. Dieselbe Frage steht danach auch vor den schweren Wegen
(Export, Import, Rollen, fremde Passwörter) und beim Einlösen eines
Rücksetzlinks.

**Die Wiederherstellungscodes — und wohin sie gehören.** Beim Einschalten
erscheinen **acht** Codes zu je zehn Zeichen. Sie werden **genau einmal**
angezeigt und kommen nicht wieder: in der Datenbank steht nur ihr Hash. Jeder
von ihnen trägt **genau einmal** und ersetzt dabei den Code aus der App.

> **Schreib sie auf und leg sie dorthin, wo dein Telefon NICHT liegt.** Ein
> Zettel in der Schreibtischschublade, ein Eintrag im Passwortspeicher auf
> einem anderen Gerät — irgendwo, wo sie noch da sind, wenn das Telefon weg
> ist. *Genau dafür sind sie da: ohne sie ist ein verlorenes Telefon ein
> verlorener Zugang.*

Die Karte nennt jederzeit, wie viele noch übrig sind, und sagt es deutlich,
wenn es knapp wird. **Neue gibt es auf Knopfdruck** — hinter Passwort und einem
gültigen Code; die alten verfallen dabei alle.

**Und wenn Telefon und Codes weg sind:** dann hilft der Weg über den Server,
derselbe wie beim vergessenen Passwort:

```bash
docker compose exec kriterion node zugang.js zweifaktor <name>
```

Er schaltet den zweiten Faktor **aus** und lässt Passwort, Rolle und Bestand in
Ruhe. **Einschalten geht von dort nicht** — dazu müsste das Geheimnis auf ein
fremdes Telefon, und das sperrte den Betroffenen aus.

*Ein Hinweis zur Sicherung:* die Kopie über die Karte „Sicherung" enthält den
gesamten Datenbestand und damit auch die Geheimnisse der zweiten Faktoren —
verschlüsselt, wie Passwörter und Sitzungen auch. Der **JSON-Export** enthält
sie nicht; er packt Einträge samt Anhängen, keine Zugänge.

Wird Kriterion über einen Reverse Proxy nach außen gegeben, dann **nur über
HTTPS** — sonst wandert das Passwort im Klartext durchs Netz. Und dann gehört
`HINTER_PROXY=1` in die `.env`.

**Warum die Einstellung nötig ist.** Ein Reverse Proxy nimmt die Verbindung des
Besuchers entgegen und öffnet eine **eigene** zum Container. Kriterion sieht an
der Verbindung deshalb immer nur den Proxy; die Adresse des Besuchers kommt
allein als Header `X-Forwarded-For` an. **Ein Kopf vom Aufrufer ist aber nie
eine Feststellung, sondern eine Behauptung** — wer ihn bei jedem Anmeldeversuch
ändert, bekäme sonst jedes Mal einen frischen Zähler, und die Bremse je Adresse
liefe ins Leere. Geglaubt wird er deshalb nur, wo ausdrücklich eingestellt ist,
dass ein Proxy davorsteht.

Eine Einstellung, zwei Wirkungen:

| | `HINTER_PROXY` fehlt (Vorgabe) | `HINTER_PROXY=1` |
|---|---|---|
| `X-Forwarded-For` und `X-Forwarded-Proto` | werden **nicht angesehen** | werden gelesen |
| Adresse des Aufrufers | die tatsächliche Verbindung | der **letzte** Eintrag aus `X-Forwarded-For` |
| `http://` in `OEFFENTLICHE_ADRESSE` | wird hingenommen | **Warnung beim Start**, keine Absage |
| richtig für | direkt im Heimnetz, Port 3100 | Betrieb hinter einem Proxy, HTTPS |

Der **letzte** Eintrag der Kette und nicht der erste: ein Proxy hängt die
Gegenstelle, die er wirklich sieht, hinten an — alles davor kann der Aufrufer
selbst hineingeschrieben haben.

Der Start sagt im Protokoll, welche Lage gilt: `Hinter Proxy: an` oder
`Hinter Proxy: aus`.

#### Beide Wege zugleich

**Der Name des Sitzungscookies, `Secure` und `Strict-Transport-Security` hängen
nicht an der Einstellung, sondern an der einzelnen Anfrage** — und zwar am Kopf
`X-Forwarded-Proto`, den der Proxy setzt:

| | über den Proxy (HTTPS) | direkt, `http://<server-ip>:3100` |
|---|---|---|
| Sitzungscookie | `__Host-kriterion_session` | `kriterion_session` |
| `Secure` | ja | nein |
| `Strict-Transport-Security` | `max-age=31536000` | nein |

**Beide Wege stehen damit offen, mit derselben Einstellung.** Du kannst dich
über HTTPS anmelden und im selben Browser über das Heimnetz — beide Sitzungen
gelten nebeneinander, und ein Abmelden beendet beide.

**Warum zwei Namen und nicht ein Name ohne `Secure`:** das Präfix `__Host-` ist
eine Zusage an den Browser — nur über HTTPS gesetzt, ohne Domain, mit `Path=/`.
Ein einzelner Name ohne diese Zusage ließe sich aus dem eigenen Netz über eine
verbogene Klartextverbindung setzen, und die HTTPS-Seite nähme ihn an. **Jede
Anfrage liest deshalb genau einen der beiden Namen** — der Heimnetzcookie gilt
auf der HTTPS-Seite nicht und umgekehrt.

**Das Umlegen von `HINTER_PROXY` meldet weiterhin alle einmalig ab, die über
HTTPS kommen** — ihr Cookiename wird dann nicht mehr gelesen. Kein
Datenverlust, nur eine neue Anmeldung.

**FÄLLT DER PROXY AUS, IST NICHTS ZU TUN.** Läuft ein Zertifikat ab oder klemmt
der Name im DNS, geht `http://<server-ip>:3100` von selbst — ohne `.env`, ohne
Neustart, ohne Menschen am Server.

*Wer den Umweg gar nicht erst haben will, richtet den Namen der Installation auch im
eigenen Netz auf den Proxy ein* (Eintrag im lokalen DNS oder in der
`hosts`-Datei). Dann läuft auch der Weg von innen über HTTPS.

**Was die Einstellung nicht ist:** eine Liste, wer den Kopf setzen darf. Bleibt
der Port des Containers im eigenen Netz erreichbar, kann dort auch jemand von
Hand einen `X-Forwarded-For` mitschicken und die Anmeldebremse damit umgehen —
ein gewöhnlicher Browser tut das nicht, ein absichtlicher Aufruf schon. Wer das
ausschließen will, gibt den Port nicht mehr im Netz frei, sondern lässt allein
den Proxy heran — dann läuft auch der Weg von innen über den Proxy.

#### Gescheiterte Anmeldungen aussperren — mit dem, was schon da ist

**Kriterion muss dafür keine Zeile ändern.** Die Anmelderoute antwortet
bereits unterscheidbar, und das genügt einem Wächter davor:

| Antwort | heißt |
|---|---|
| **401** | Name oder Passwort falsch |
| **429** | ausgebremst — zu viele Versuche |
| **403** | Passwort richtig, Zugang gesperrt |

**Wer einen Reverse Proxy fährt, hat diese Antworten in dessen
Zugriffsprotokoll stehen.** Ein CrowdSec-Szenario auf `POST /api/login`, das
auf 401, 403 und 429 achtet, sperrt die Adresse damit heute — es liest das
Protokoll des Proxys, nicht das der Installation. *Das ist auch die richtige Stelle:
hinter dem Proxy sieht Kriterion ohnehin nur dessen Adresse, solange
`HINTER_PROXY` nicht gesetzt ist — und mit der Einstellung nur das, was im Kopf
steht. Der Proxy schreibt auf, was er wirklich gesehen hat.*

**Die Rotation des Containerprotokolls ist Dockers Sache**, nicht Kriterions.
Vier Zeilen in der `docker-compose.yml`, und die Datei wächst nicht mehr
unbegrenzt:

```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
```

**Das Sicherheitsprotokoll der Installation räumt sich dagegen schon selbst** — es
hält 180 Tage, geprüft beim Start und jedes Mal, wenn die Karte geöffnet wird.
*Wer dafür eine Rotation sucht, soll sie nicht bauen: es gibt sie schon.*

### Rollen und Zugänge

Drei Rollen, und sie sind eine Leiter: **Benutzer** < **Admin** <
**Eigentümer**. Wer die Installation einrichtet, ist ihr Eigentümer; das Recht ist
eine Rolle und lässt sich vergeben — zwei Leute können sich eine Installation
teilen. Solange nur **ein** Zugang besteht, ist er alles zugleich, und ihm
verweigert nichts etwas.

- **Benutzer** — schreibt eigene Beiträge: Einträge, Kommentare, Bewertungen,
  Testtage, Favoriten.
- **Admin** — verwaltet zusätzlich, was an *allen* Einträgen erscheint:
  Bewertungskriterien, Tags und Kategorien (umbenennen und löschen), beide
  Titel, Vokabular und die Suchanbieter. Er darf fremde Beiträge **löschen**,
  aber nicht umschreiben. Und er verwaltet die Zugänge — aber nicht die von
  Admins oder dem Eigentümer.
- **Eigentümer** — alles davon, dazu das, was die Installation als *Ganzes*
  betrifft: **Export**, **Import**, der angezeigte Schlüsselwert und das
  Vergeben von Rollen. Ein Admin ohne Eigentümerrolle kann also keine
  Sicherung ziehen — das ist Absicht.

Verwaltet wird in der Karte **„Zugänge"** im Systembereich (nur für Admins
sichtbar): anlegen, sperren und freigeben, Passwort zurücksetzen, Rolle
wechseln, entfernen. Drei Regeln stehen serverseitig fest, nicht nur ausgegraut
in der Oberfläche:

- **Ein Admin kommt nicht an seinesgleichen.** An einen anderen Admin oder den
  Eigentümer kommt nur der Eigentümer — sonst wäre die Verwaltung ein
  Wettrennen.
- **Der letzte aktive Eigentümer bleibt** — er lässt sich weder herabstufen
  noch sperren noch entfernen, solange kein zweiter bestimmt ist.
- **Niemand sperrt oder entfernt sich selbst.**

Sperren wirkt sofort: die laufende Sitzung fällt, die Anmeldung nennt den
Grund — aber erst nach dem richtigen Passwort, sonst wäre die Meldung ein
Werkzeug zum Durchprobieren von Namen. Offene Einladungs- und Rücksetzlinke
dieses Zugangs verfallen dabei mit.

#### Einen Zugang anlegen — die Wahl steht im Formular

Neben dem Namensfeld steht ein Auswahlfeld mit zwei Möglichkeiten. **Es
bestimmt, was der Knopf daneben tut, und welche Felder überhaupt erscheinen.**

**„Er wählt sein Passwort selbst" — die Vorgabe und der empfohlene Weg.** Es
gibt kein Passwortfeld; der Knopf heißt **„+ Anlegen und Link"**. Der Zugang
entsteht **ohne** Passwort, und darunter erscheint ein Link. Den kopierst du
und gibst ihn dem Betreffenden — mündlich, per Zettel, per Messenger. Wer ihn
öffnet, wählt sein Passwort selbst und ist danach gleich angemeldet. **Du
erfährst das Passwort nie.** In der Liste steht bei ihm „noch kein Passwort",
bis er den Link eingelöst hat.

**„Ich vergebe das erste Passwort".** Erst dann erscheint das
Passwortfeld, und der Knopf heißt nur noch **„+ Anlegen"**. Der kürzere Weg,
wenn der andere danebensteht. Wechselst du zurück, verschwindet das Feld
wieder — und was darin stand, wird geleert.

> **Der Link ist ein Passwortersatz auf Zeit.** Er gilt **sieben Tage** und
> **genau einmal**; wer ihn in dieser Zeit hat, kommt herein. Nach der
> Weitergabe steht er in dem Verlauf, über den du ihn geschickt hast — gib ihn
> nur dem, für den er ist. Er wird **nur ein einziges Mal angezeigt**; ist er
> weg, erzeugst du einen neuen.

**Und eine zweite Frist daneben: ab dem ersten Öffnen bleiben
fünfzehn Minuten.** Die sieben Tage sind die Frist fürs *Lesen der Mail*, nicht
fürs Liegenlassen des Links. Solange niemand geöffnet hat, ist nichts geschehen
und die sieben Tage laufen weiter. Ab dem ersten Öffnen ist erwiesen, dass der
Link angekommen ist — und dann hat er in einem fremden Postfach nichts mehr
verloren. **Innerhalb der fünfzehn Minuten darf beliebig oft geöffnet und neu
geladen werden**; nur der *erste* Aufruf startet die Uhr. Wer die Frist
verstreichen lässt, holt sich einen neuen Link. Der Zugang selbst bleibt dabei
stehen und trägt weiter „noch kein Passwort".

Das Feld daneben ist **freiwillig**: trägst du eine **E-Mail-Adresse** ein,
schickt die Installation den Link zusätzlich dorthin — vorausgesetzt, ein Mailzugang
ist eingerichtet (siehe **Mailversand**). Der Link steht trotzdem zum Kopieren
da, auch wenn der Versand fehlschlägt. **Ändern darf die Adresse danach allein
der Betreffende selbst**, im Systembereich unter „Zugang": sie entscheidet,
wohin sein nächster Rücksetzlink geht, und das gehört nicht in fremde Hand.

> **WAS DIE KARTE „ZUGANG" DAZU SAGT, RICHTET SICH DANACH, WAS GERADE GILT.**
> Ist die **Selbstanmeldung aus**, steht am Feld *(freiwillig)*, und darunter:
> *„Wird für den Einladungs- oder Rücksetzlink per Mail gebraucht und für die
> Testmail im Mailversand. Ohne sie steht der Link wie immer zum Kopieren
> bereit."* **Ist sie an, steht dort *(wird gebraucht)*** und der Satz, dass
> ohne Adresse keine Bestätigungsmail ankommt.
>
> **DER WEG ÜBER DEN SERVER STEHT NUR BEIM EIGENTÜMER.** Er ist der Einzige,
> der in der Regel auch am Wirt sitzt; wer dort nicht hinkommt, liest
> stattdessen, dass er sich an den Admin wendet. *Ein Befehl, den man nicht
> ausführen kann, ist keine Hilfe, sondern eine Auskunft über den Betrieb.*
> **Die Vorgabe „mindestens 10 Zeichen" steht am Passwortfeld** und nicht im
> Absatz unter der Adresse, für die sie nicht gilt.

#### Ein Passwort zurücksetzen — ebenfalls zwei Wege

- **🔗 Link zum Zurücksetzen** — derselbe Weg wie bei der Einladung. Das
  bisherige Passwort gilt weiter, **bis** der Link eingelöst wird; danach
  fallen alle Anmeldungen dieses Zugangs.
- **🔑 Passwort direkt setzen** — du gibst eins ein und sagst es. Alle
  Anmeldungen dieses Zugangs fallen sofort.

Kommt **niemand mehr** herein, hilft weiterhin der Weg über den Server:
`docker compose exec kriterion node zugang.js passwort <name>`.

#### Wohin der Link zeigt — `OEFFENTLICHE_ADRESSE`

Den vollständigen Link baut **der Browser des Admins** aus der Adresse, an der
er ohnehin steht. Das ist sicher, braucht keine Einstellung und bleibt die
Vorgabe: „läuft im eigenen Netz" soll ohne Konfiguration auskommen.

**Es hat genau eine Bruchstelle:** die Adresse, unter der *du* zugreifst, ist
nicht immer die, die der *Empfänger* benutzen soll. Wer über
`http://192.168.1.50:3100` arbeitet und einen Link nach draußen gibt, gibt
einen Link ins Leere.

Dagegen steht eine **optionale** Zeile in der `.env`:

```bash
OEFFENTLICHE_ADRESSE=https://kriterion.beispiel.de
```

Ist sie gesetzt, gibt der Server den fertigen Link heraus; ist sie leer, baut
ihn der Browser. **Der Kasten, aus dem du den Link kopierst, sagt in einer
Zeile darunter, woher die Adresse kam** — damit du den falschen Fall dort
erkennst und nicht erst am toten Link beim Empfänger.

Schema und Rechnername sind Pflicht, ein Pfad ist erlaubt, alles ab `?` und `#`
wird abgewiesen. **Ein unbrauchbarer Wert bricht den Start nicht ab**: er wird
im Protokoll gemeldet, und der Browserweg trägt weiter.

**Warum in der `.env` und nicht im Systembereich**, obwohl es dort bequemer
wäre: dieselbe Linie wie `HINTER_PROXY` — die Einstellung entscheidet über
Netzwerkvertrauen, nicht über eine Vorliebe. Ein Admin kommt nicht an einen
anderen Admin; dürfte er die öffentliche Adresse setzen, zeigte später jede
verschickte Mail auf seinen Server. Der Systembereich **zeigt** sie, er setzt
sie nicht.

**ist sie Pflicht — für den Versand, nicht für den Start.** Ohne sie
verschickt die Installation keine Links: der Server wüsste nicht, worauf sie zeigen
sollen, und aus dem `Host`-Kopf darf er es nicht ableiten. Der Start bricht
deswegen **nicht** ab, und es fehlt auch nichts — die Links stehen wie bisher
zum Kopieren da. Die Karte „Mailversand" markiert den fehlenden Wert rot und
nennt den Grund.

**Und ist sie die Voraussetzung der Selbstanmeldung — nicht eine
Empfehlung daneben, sondern baulich:** der Schalter lässt sich ohne diesen Wert
gar nicht erst einschalten. Der Grund ist nachgesehen und nicht angenommen: die
**Testmail enthält keinen Link** und geht auch ohne die öffentliche Adresse
anstandslos durch. Die Marke des Tests könnte also grün sein, während jede
Bestätigungsmail ohne brauchbaren Link hinausginge — und genau dann liefe die
Selbstanmeldung ins Leere. Wer sie nicht setzt, legt Zugänge weiterhin selbst
an; es fehlt nichts.

#### Mailversand

**E-Mail ist eine Bequemlichkeit, keine Voraussetzung.** Ohne Mailzugang läuft
Kriterion vollständig, rein offline, und es fehlt keine Funktion: Einladungs-
und Rücksetzlinks stehen im Verwaltungsbereich zum Kopieren.
**Wer keinen Mailzugang einträgt, verliert nichts.** Mit Mailzugang
gehen dieselben Links *zusätzlich* per Mail hinaus; schlägt das fehl, bricht
nichts ab — im Kasten steht „Versand fehlgeschlagen" samt Grund, und der Link
daneben.

**Nur ausgehend.** Kein Empfang, kein offener Port, kein Abholen. Es gibt genau
**zwei Anlässe** für eine Mail: den Tokenlink und die Testmail. Keine
Benachrichtigungen, keine Zählpixel, kein HTML — reiner Text.

**Der Mailzugang gehört dem Eigentümer, ganz.** Eintragen, einsehen und die
Testmail auslösen liegen bei ihm; ein Admin kommt an keines davon. Der Grund
ist die Rollenleiter: der SMTP-Server sieht **jede** Mail, die durch ihn geht,
und jede trägt einen Link, der ein Passwort setzt. Dürfte ein Admin ihn
eintragen, liefe die Rücksetzmail des Eigentümers über einen Server seiner
Wahl. Über dem Eigentümer steht niemand — wer ohnehin exportieren und den
Schlüsselwert sehen darf, gewinnt hier nichts dazu. Was der Admin bekommt, ist
die Auskunft an der Stelle, an der sie ihn angeht: neben dem Link steht, ob
etwas hinausging und warum nicht.

**Die Karte „Mailversand" zeigt, der Dialog stellt ein.** Im Systembereich
unter **Zugänge** steht die Karte und sagt in fünf Zeilen, woran man ist:

| Zeile | |
|---|---|
| **Zustand** | eingerichtet oder nicht eingerichtet |
| **Anbieter** | Name, Server mit Port und Verschlüsselung in einer Zeile |
| **Absender** | die Absenderadresse |
| **Öffentliche Adresse** | der Wert aus der `.env`, auf den die Links zeigen |
| **Zuletzt erfolgreich getestet** | wann die letzte Testmail durchkam |

Darunter zwei Knöpfe: **„Mailzugang einrichten"** beziehungsweise **„Mailzugang
ändern"** — und **„Testmail an mich"**.

**Der Knopf öffnet einen Dialog, und der fragt der Reihe nach:**

| Feld | |
|---|---|
| **Anbieter** | GMX, Web.de, Gmail, Strato, IONOS oder „Eigener Server" |
| **Server, Port, Verschlüsselung** | bei einer Vorlage stehen sie nur da und sind kein Feld; einzutragen sind sie ausschließlich bei „Eigener Server" |
| **Benutzername, Passwort** | dein Zugang beim Anbieter |
| **Absenderadresse** | muss zum Konto gehören |

**Wer eine der fünf Vorlagen nimmt, füllt drei Felder** — Benutzername,
Passwort, Absenderadresse. Server, Port und Verschlüsselung stehen fest und
werden aus der Vorlage gelesen; wechselt der Anbieter morgen den Port, kommt
der neue mit dem nächsten Kriterion und nicht aus deiner Datenbank.

**Speichern verlangt dein eigenes Passwort** — und, wenn du den zweiten Faktor
eingeschaltet hast, zusätzlich einen Code. Der Dialog kürzt daran nichts ab.

**Das Passwort wird nie angezeigt** — nie der Wert, nie die Länge, nie den
Anfang, nie Sternchen mit der richtigen Zahl. Beim Speichern bedeutet ein
leeres Passwortfeld „unverändert lassen". Es steht in der **verschlüsselten
Datenbank**, nicht in der `.env`, und wandert weder in eine Exportdatei noch in
eine Protokollzeile.

Drei Hinweise, an denen die meisten Versuche scheitern:

- **Gmail** verlangt Zwei-Faktor und ein **App-Passwort**; das Kontopasswort
  wird abgewiesen.
- **GMX** und **Web.de** verlangen, den Versand über fremde Programme im Konto
  erst **freizuschalten**.
- **Die Absenderadresse muss zum Konto gehören** — über GMX lässt sich nicht
  als fremde Adresse senden.

Und der Grund für die Vorlagen: **immer über den SMTP-Zugang eines Anbieters,
nie unmittelbar vom Hausanschluss.** Dort fehlen rDNS und SPF/DKIM, und die
Mail landet im besten Fall im Spam. *Dieser Satz steht auch im Dialog — aber
nur dort, wo er gilt: bei „Eigener Server".*

**Der Testmail-Knopf geht ausschließlich an die Adresse deines eigenen
Zugangs.** Es gibt kein Adressfeld daneben, und das ist Absicht: ein Knopf, der
an eine beliebige Adresse schickt, wäre ein offener Mailverteiler hinter einer
Anmeldung. Hast du für deinen Zugang keine Adresse hinterlegt, sagt die Absage
das und nennt den Weg — Systembereich, Karte „Zugang".

Antwortet der Mailserver nicht, **bricht der Versuch nach zwanzig Sekunden ab**
und die Antwort kommt trotzdem. Der Token entsteht dabei **zuerst**: der Link
steht in jedem Fall da, egal was der Mailserver sagt.

#### Selbstanmeldung

**Niemand kommt durch die Selbstanmeldung herein, ohne dass ein Admin ihn
hereinlässt.** Das ist der Satz, unter dem alles Weitere steht. Es gibt keine
Betriebsart, in der ein geklickter Link allein freischaltet — Kriterion ist ein
Archiv für eine kleine Gruppe, kein Forum.

**Und die Installation läuft ohne all das vollständig.** Ist die Selbstanmeldung aus,
legt eben nur der Admin Zugänge an. Es fehlt keine Funktion, und der Schalter
steht ab Werk auf **aus**.

**Der Weg, vom Formular bis zum Passwort:**

1. **Anfrage.** Auf der Anmeldeseite steht unter „Anmelden" ein zweiter Knopf:
   **„Zugang anfragen"**, darüber die Frage „Noch keinen Zugang?". Das Formular
   dahinter hat zwei Felder — Wunschname und E-Mail-Adresse — und **kein
   Passwortfeld**.
2. **Bestätigungsmail.** Die Installation schickt einen kurzen Link an die
   angegebene Adresse. Er **öffnet keinen Zugang und setzt kein Passwort**; wer
   ihn anklickt, sagt nur „ja, das bin ich". Er gilt **24 Stunden**.
3. **Warteschlange.** Erst die **bestätigte** Anfrage erscheint beim Admin, in
   der Karte **„Anfragen"** im Systembereich. Unbestätigte verfallen nach 24
   Stunden und werden nie angezeigt. **Die Karte steht dort immer** — auch wenn
   die Selbstanmeldung aus ist; in ihr sitzt schließlich der Schalter.
4. **Freischalten oder ablehnen.** Beim Freischalten entsteht ein Zugang mit
   der Rolle **Benutzer** — nie mit einer anderen — samt Einladungslink; beim
   Ablehnen verschwindet die Zeile, und es entsteht nichts.
5. **Passwort setzen.** Über den Einladungslink, auf dem bekannten Weg: sieben
   Tage gültig, genau einmal, ab dem ersten Öffnen fünfzehn Minuten.

**Zwei Dinge müssen stehen, bevor sich der Schalter überhaupt einschalten
lässt** — und beides prüft die Installation selbst, statt es zu empfehlen:

- **Ein Mailzugang, mit dem eine Testmail wirklich durchgekommen ist.** Ändert
  sich danach irgendetwas am Mailzugang, gilt der Beleg nicht mehr, und der
  Schalter lässt sich erst nach einer neuen Testmail wieder einschalten.
- **`OEFFENTLICHE_ADRESSE` in der `.env`.** Ohne sie wüsste der Server nicht,
  worauf der Bestätigungslink zeigen soll. Die Testmail allein genügt als
  Beleg **nicht**: sie enthält gar keinen Link und geht auch ohne diesen Wert
  durch.

**Ausschalten geht dagegen immer.** Und geht der Versand später kaputt, **bleibt
der Schalter an** — die Karte sagt es in einer roten Zeile. Ein Schalter, der
sich von selbst umlegt, stünde anders da, als ihr ihn gestellt habt, und
niemand wüsste, wann das passiert ist.

**Was die Selbstanmeldung nicht preisgibt:** die Antwort auf eine Anfrage sieht
**immer gleich aus** — ob der Name frei war, ob er vergeben ist, ob die Adresse
schon an einem Zugang hängt, ob gerade zwanzig Anfragen offen sind oder ob der
Schalter aus ist. Andernfalls wäre das Formular ein bequemes Werkzeug, Namen und
Adressen durchzuprobieren, und zwar ohne Passwort davor. Dazu greift dieselbe
**Anmeldebremse** wie an der Anmeldung, und höchstens **zwanzig** Anfragen
liegen gleichzeitig; die einundzwanzigste wird still verworfen.

**Wer eine Bestätigungsmail bekommt, ohne etwas angefragt zu haben, muss nichts
tun** — die Mail sagt das auch. Ohne den Klick geschieht nichts, und die Anfrage
verfällt von selbst.

#### Meine Sitzungen

Die Karte **„Meine Sitzungen"** im Systembereich steht **jedem**, auch ohne
Rolle. Sie zeigt, wo dieser Zugang überall angemeldet ist — wann angemeldet,
wann zuletzt gesehen, und welche davon die gerade benutzte ist. Der Knopf
**„Alle anderen beenden"** wirft alle übrigen hinaus; die eigene bleibt.

**Was die Karte nicht kann, und sie sagt es selbst:** sie kennt **kein Gerät**.
Kriterion speichert weder IP-Adresse noch Browserkennung — das ist Absicht und
passt zu „läuft im eigenen Netz". Was sie beantwortet, ist die Frage, die
zählt: *stehen hier mehr Anmeldungen, als ich erwarte?* Wenn ja, ist der Knopf
daneben die Antwort. **Ein Admin sieht hier nur seine eigenen Anmeldungen**,
nie fremde; wer einen fremden Zugang aussperren muss, sperrt ihn.

**Entfernen entwertet, es löscht nicht.** Die Benutzerzeile bleibt mit ihrer
Nummer stehen, der Name wird freigegeben, und die Beiträge bleiben sichtbar —
sie tragen künftig „Gelöschter Benutzer 7". Zwei Häkchen im Dialog nehmen auf
Wunsch die Inhalte mit: *seine Einträge löschen* (nimmt über die Kaskade auch
fremde Kommentare, Bewertungen und Testtage daran mit — der Dialog nennt die
Zahlen) und *seine Beiträge in fremden Einträgen löschen*. Sitzungen, offene
Links, Favoriten und persönliche Einstellungen gehen immer mit. Der Name
`geloescht-<nummer>` ist als Benutzername gesperrt.

#### Die zweite Bestätigung

**Was die Installation als Ganzes trifft, wird ein zweites Mal bestätigt.** Vor dem
Export, dem Import, dem Vergeben einer Rolle, dem Setzen eines fremden
Passworts, dem Erzeugen eines Links, dem Entfernen eines Zugangs und dem
**Setzen des Mailzugangs** fragt Kriterion nach **deinem eigenen Passwort**, in
einem Fenster, das daneben schreibt, warum es fragt.

**Wogegen das schützt, ist nicht der Fremde:** der kommt ohne Passwort gar
nicht herein. Es schützt gegen eine **fremde offene Anmeldung** — einen
Bildschirm, der unbeaufsichtigt stehen blieb, einen Rechner, an dem jemand
anderes sitzt. Beim Ändern des eigenen Zugangs gilt dasselbe Prinzip.

Die Bestätigung gilt **genau einmal** und **nur für die eine Handlung, für die
du sie gegeben hast**. Wer drei Zugänge nacheinander entfernt, tippt dreimal.
Das ist der Preis, und er ist gewollt. Sie ist außerdem an **die Anmeldung**
gebunden, an der du gerade sitzt: eine zweite offene Anmeldung desselben
Zugangs muss selbst bestätigen.

**Was ausdrücklich nicht dahinter liegt:** einen Zugang **sperren oder
freigeben** (das ist umkehrbar), einen Zugang **anlegen** (er ist neu und nimmt
niemandem etwas), der eigene Zugang (dort ist das bisherige Passwort ohnehin
Pflicht), die **Testmail** (sie geht an die eigene Adresse und übergibt nichts)
und alles am Eintrag. **Ein zweiter Faktor ist es nicht** — gefragt
wird dasselbe Passwort noch einmal.

Auch hier gilt die Anmeldebremse: nach zehn falschen Bestätigungen von
derselben Adresse ist für einige Minuten Ruhe.

#### Das Sicherheitsprotokoll

Der Systembereich zeigt dem **Eigentümer** eine Karte
**„Sicherheitsprotokoll"**. Sie hält fest, **wer Zugang hatte und wer die
Installation als Ganzes angefasst hat**: Anmeldungen (gelungen und gescheitert),
angelegte, gesperrte, freigegebene und entfernte Zugänge, vergebene Rollen,
gesetzte Passwörter, erzeugte und eingelöste Links, Export, Import,
Sicherung — und den **Schlüsselwechsel**. Der trägt weder Ziel noch
Merkmal und keinen Handelnden: gewechselt wird auf dem Wirt. **Die Zeile nennt,
DASS gewechselt wurde, nie WOHIN** — ein Schlüssel steht in keiner
Protokollzeile.

**Was dort nicht steht, ist der eigentliche Punkt.** Es ist **kein
Änderungsverlauf**: kein Eintragstitel, kein Kommentartext, keine Bewertung,
keine Note. Dieselbe Trennlinie wie überall — was die *Installation* betrifft, nicht
was jemand *gesagt* hat. Ebenso wenig stehen dort **IP-Adresse oder
Browserkennung**: Kriterion speichert beides nicht, und dabei bleibt es.

Ein entfernter Zugang erscheint auch hier als „Gelöschter Benutzer 7" — der
Name wird nirgends aufbewahrt. Und ein Vorgang über den Server
(`node zugang.js …`) trägt keinen Handelnden; die Zeile sagt das ausdrücklich.

**Die Zeilen bleiben 180 Tage stehen** und werden danach von selbst geräumt.
**Einen anderen Weg hinaus gibt es nicht** — ein Sicherheitsprotokoll, das sich
wegräumen lässt, wäre keins. Das Wort meint hier nicht `docker compose logs`;
das heißt in dieser Anleitung weiterhin schlicht *Protokoll*.

**Über der Liste steht eine Reihe von Ansichten**, jede mit ihrer
Zahl: **Alle · Gescheitert · Anmeldungen · Zugänge · Zweiter Faktor ·
Bestand**. Die Karte zeigt die **hundert jüngsten** Zeilen — mit einer Ansicht
sind es die hundert jüngsten **dieser Art**, und damit findet man die
gescheiterten Versuche auch dann, wenn viel anderes dazwischensteht. *„Gescheitert"
umfasst die gescheiterte Anmeldung und die gescheiterte zweite Bestätigung: in
beiden Fällen konnte jemand an der Tür nicht belegen, wer er ist.*
**Die Namen in den Zeilen sind anklickbar** und springen zur Karte „Zugänge".
Ein getippter Name, der an keinen Zugang traf, steht als „unbekannter Name" da
und bleibt Text — er wird nirgends gespeichert.

### Wer was darf

Am einzelnen Eintrag gilt:

| | Verfasser | jeder andere | Admin |
|---|---|---|---|
| alles sehen | ✔ | ✔ | ✔ |
| Titel, Beschreibung, Fotos, Videos, Tags, Kategorie, getestet, abgelehnt | ✔ | — | ✔ |
| **Begründung einer Ablehnung umschreiben** | nur wer sie getroffen hat | — | nur wenn er sie getroffen hat |
| **Begründung einer Ablehnung entfernen** | ✔ | — | ✔ |
| Eintrag löschen | ✔ | — | ✔ |
| **Favorit** (★ am Eintrag) | persönlich — jeder für sich, an jedem Eintrag | | |
| eigene Bewertung, eigener Testtag | ✔ | ✔ | ✔ |
| Link eintragen, Datei hochladen | ✔ | ✔ | ✔ |
| eigenen Link, eigene Datei löschen | ✔ | ✔ | ✔ |
| fremden Link, fremde Datei löschen | — | — | ✔ |
| Linkliste umsortieren | ✔ | — | ✔ |
| Kommentar schreiben | ✔ | ✔ | ✔ |
| eigenen Kommentar ändern | ✔ | — | — |
| fremden Kommentar löschen | — | — | ✔ |
| Art und Anpinnung am Kommentar | ✔ | — | ✔ |
| Note eines fremden Testtags ändern | — | — | — |
| fremden Testtag löschen | — | — | ✔ |
| sehen, wer welchen Wert bewertet hat | — | — | ✔ |
| fremde Bewertung löschen | — | — | ✔ |
| Note einer fremden Bewertung ändern | — | — | — |
| Bild an einen Kommentar hängen | ✔ | — | — |
| Bild aus einem Kommentar löschen | ✔ | — | ✔ |

**Löschen ja, umschreiben nein** ist die Regel dahinter: ein Admin räumt auf,
aber er verändert keine fremde Aussage unter fremdem Namen. Deshalb darf er
einen Kommentar löschen, nicht aber dessen Text ändern — und deshalb darf er
einen fremden Testtag löschen, nicht aber dessen Note.

**Warum Links und Dateien in der Tabelle ihre eigenen Zeilen haben:** beide
erscheinen nur dort, wo man sie hinsetzt — anders als ein Kriterium, das an
jedem Eintrag steht. Deshalb darf sie **jeder** dazutun, und wieder wegnehmen
darf sie, wer sie hingesetzt hat, oder der Admin. **Das Umsortieren der Links
bleibt beim Verfasser des Eintrags:** die Reihenfolge ändert keine Aussage und
lässt sich zurücknehmen — dieselbe Überlegung wie beim Anpinnen eines
Kommentars.

**Fotos und Videos sind bewusst nicht dabei.** Sie gehören zum Eintrag selbst:
das erste Element ist das Hauptbild und damit sein Gesicht in der Übersicht.
Wer die Reihenfolge ändert, ändert den Eintrag — das bleibt bei seinem
Verfasser. Für ein Video gilt jede dieser Regeln unverändert, weil es in
derselben Tabelle steht wie ein Foto; es bekommt kein eigenes Recht.

Eine Absage kommt als Meldung, nicht als stille Wirkungslosigkeit, und sie
kommt **bevor** irgendetwas geschrieben ist.

### Wer was geschrieben hat

**Bei genau einem Zugang bleibt davon alles aus.** Sobald es einen zweiten
gibt, nennen **Eintrag, Kommentar und Testtag** ihren Verfasser mit Namen —
der Eintrag dazu, **wann** er angelegt wurde. Eigene Testtage sind gefüllt,
fremde ein Ring.

**Eine Linkzeile und eine Datei nennen ihren Eintrager bzw. Hochladenden nur
dann, wenn er nicht der Verfasser des Eintrags ist.** Der Gedanke dahinter: an den eigenen Zeilen des
Eintragsverfassers wiederholte der Name nur, was oben am Eintrag ohnehin
steht, und die Linkliste ist eine Liste vieler kurzer Zeilen — ein Name an
jeder wäre Rauschen. An der einen fremden ist er die Auskunft: *hier hat
jemand anderes etwas beigesteuert.*
**Umgekehrt gelesen heißt das:** steht bei mehreren Zugängen kein Name an
einer solchen Zeile, stammt sie vom Verfasser des Eintrags. Wer mit dem Zeiger
über der Zeile stehen bleibt, sieht zusätzlich das Datum: „Eingetragen von
… am …" bzw. „Hochgeladen von … am …". Auf einem Berührbildschirm gibt es kein
Überfahren — dort bleibt es beim Namen.

Am Link steht der Name hinter dem Pfad, an der Datei hinter der Größe: dort
stehen die Angaben **zur** Datei, und ihr Name behält den Platz.

**Die Bewertung sagt nur den eigenen Wert und den Schnitt.** Wer welchen Wert
vergeben hat, ist eine Angabe über einzelne Personen und steht deshalb nicht
unter der Sternzeile. Der **Admin** sieht sie in einer eigenen Ansicht, die er
über den Knopf **„Wer hat bewertet"** im Blockkopf ausdrücklich aufruft; dort
kann er eine fremde Bewertung auch entfernen. Ausgeliefert wird die Liste
ebenfalls nur an ihn — was nicht angezeigt werden darf, wird gar nicht erst
geschickt.

Ein entfernter Zugang erscheint als **„Gelöschter Benutzer 7"**, eine Zeile
ohne Verfasser als **„Ohne Verfasser"**. Der freigegebene Name verlässt den
Server dabei nicht.

**In der Kopfzeile steht, wer angemeldet ist** — neben dem Knopf „Abmelden",
und zwar auch dann, wenn es nur einen Zugang gibt: das ist eine Aussage über
einen selbst, nicht über andere.

Entfernt ein Admin ein Bild aus einem fremden Kommentar, steht in dessen
Kopfzeile ein **Vermerk**: „2 Bilder vom Admin entfernt". Er nennt eine
**Rolle, keine Person**, und ist für jeden sichtbar — das Loch, das ein
entferntes Bild hinterlässt, ist ohnehin für jeden Leser da. Es ist die
einzige Stelle, an der Kriterion einen Eingriff festhält; einen
Änderungsverlauf gibt es nicht.

### Zwei Titel

Der Titel auf der Anmeldeseite ist für jeden sichtbar, der die Adresse aufruft.
Ein aussagekräftiger Name verrät dort schon, was im Bestand liegt. Deshalb gibt
es zwei, beide im Systembereich einstellbar:

- **Titel vor der Anmeldung** — zurückhaltend wählen (Vorgabe „Bewertungskatalog")
- **Titel nach der Anmeldung** — die eigentliche Bezeichnung (Vorgabe „Model Bewertungen")

## Bedienung

**Übersicht**
- **Die Suche greift auf sieben Quellen zu:** Titel, Beschreibung, Name der
  Kategorie, Tags am Eintrag, **Tags an Testtagen**, Adressen der Links und
  **sämtliche Kommentartexte**. `/` springt ins Suchfeld.
  Groß- und Kleinschreibung spielt keine Rolle, auch bei Umlauten; ein
  einzelnes Zeichen findet bereits. **Prozentzeichen und Unterstrich sind
  gewöhnliche Zeichen** — man kann nach ihnen suchen.
  *Gesucht wird im Server.* Gefragt wird kurz nach dem letzten Anschlag, damit
  nicht jeder Tastendruck über das Netz geht. Ist der Server einmal nicht
  erreichbar, bleibt die zuletzt gezeigte Liste stehen und sagt es.
- **Solange gesucht wird, sagt jede Kachel, WARUM sie in der Liste steht.**
  Unter dem Titel steht eine Zeile mit der Quelle und einem Ausschnitt:
  *„Kommentar: …hat mir der Händler in Bellavista empfohlen…"* oder
  *„Link: …eurobella.example/werkzeug/…"*. **Eine Zeile je Kachel und nicht
  eine je Quelle** — trifft der Begriff mehrere, nennt sie die erste in einer
  festen Folge und hängt an, wie viele weitere es sind. *Die Folge beginnt bei
  dem, was die Kachel sonst nicht zeigt: Beschreibung, Kommentar, Link, Tag am
  Testtag, Tag, Kategorie, Titel.* **Ohne Suchbegriff steht die Zeile nicht
  da**, und die Kachel ist dann genau die von vorher.
- **Der gefundene Begriff ist hervorgehoben** — an der Kachel in Titel,
  Kategorie, Tags und in der Zeile darunter, im Eintrag in der Linkliste und in
  den Kommentaren. **In der Linkliste ist es die Adresse und nicht der
  Anbietername**, denn gesucht wurde in der Adresse.
  **Die Hervorhebung gehört der Suche und nicht dem Eintrag:** Feld geleert,
  Begriff geändert, Ansicht ohne Begriff gewählt — weg. Gespeichert wird sie
  nicht.
  *Wer einen Treffer öffnet, findet den Begriff in der Adresse wieder
  (`#/item/12?q=ella`); ein Neuladen behält die Hervorhebung deshalb, und der
  Link lässt sich so weitergeben.* **Titel und Beschreibung sind im Eintrag
  Eingabefelder — dort ist keine Hervorhebung möglich**, und die Zeile an der
  Kachel nennt die Beschreibung dafür ausdrücklich als Quelle.
- **Gespeicherte Ansichten** stehen als Knöpfe unter den Filtern. Wer eine
  Kombination öfter braucht, stellt sie ein und drückt **„+ Ansicht
  speichern"**; ein Klick auf den Knopf stellt sie wieder her. Gemerkt wird
  die ganze Filterstellung **samt Suchbegriff** — eine Ansicht „Bosch,
  ungetestet" wäre ohne ihn die halbe Ansicht. Das Kreuz am Knopf entfernt
  sie wieder.
  **Acht Stück je Zugang**, und sie sind **persönlich**: ein anderer Zugang
  sieht sie nicht. *Wird eine Kategorie oder ein Tag gelöscht, auf die eine
  Ansicht zeigt, wird die Nummer beim Anwenden übergangen — die Ansicht zeigt
  dann, was sie zeigen kann, statt leer zu bleiben.*
- **Beim Anlegen weist eine Zeile auf Ähnliches hin.** Wer einen Titel tippt,
  sieht darunter *„Ähnlich: …"* mit Sprungmarken zu dem, was schon da ist —
  gedacht für den Fall, dass zwei Menschen denselben Gegenstand eintragen.
  **Sie blockiert nichts:** wer den Eintrag trotzdem will, legt ihn an.
- Filter nach Status (Alles / Getestet / Ungetestet — die beiden letzten heißen
  so, wie es im Vokabular steht), Kategorie und Tags. Bei mehreren Tags legt der
  Umschalter neben der Beschriftung fest, wie sie verknüpft werden: **Und**
  (Vorgabe) zeigt nur Einträge, die alle gewählten Tags tragen, **Oder** solche
  mit mindestens einem. Die Wahl bleibt bestehen, bis man sie ändert. Gedämpft
  dargestellt wird jede Pille, die zusammen mit der aktuellen Auswahl keinen
  Treffer mehr ergäbe — anklickbar bleibt sie.
  Die Tagwolke zeigt eine Zeile, nach Häufigkeit sortiert und
  mit den aktiven Filtern vorn; der Rest klappt auf. Tags, die nur an Testtagen
  hängen, stehen nicht darin — dort lieferten sie null Treffer. Die Suche
  findet sie trotzdem.
- **Mehrere Kategorien zugleich**: ein Klick nimmt eine dazu,
  ein zweiter nimmt sie wieder heraus, **„Alle"** räumt die Auswahl weg. **Es
  ist immer ein Oder** — ein Eintrag trägt genau eine Kategorie, ein „und" wäre
  garantiert leer; die Zeile hat deshalb keinen Umschalter. Am Ende steht
  **„Ohne"** mit eigener Zahl: Einträge, die keiner Kategorie zugeordnet sind
  und über keine einzelne Kategorie zu finden wären.
- **„Filter zurücksetzen" steht rechts in der Sortierzeile**, neben „+ Ansicht
  speichern" — und nur dann, wenn wirklich etwas gesetzt ist. Er nennt die
  Zahl: *„Filter zurücksetzen (3)"*. Ein Klick stellt Status, Ablehnung,
  Favoriten, Kategorien und Tags auf „alles zeigen" zurück.
  **Der Suchbegriff bleibt stehen** — er hat sein eigenes Kreuz im Suchfeld —,
  **die Sortierung ebenfalls**, und **eine gespeicherte Ansicht wird nicht
  angetastet**. *Zurücksetzen heißt „zeig mir alles", nicht „vergiss, was ich
  mir gemerkt habe".*
- **Zeitleiste der Testtage** zwischen Filterleiste und Kartenraster: waagerecht
  die Zeit, senkrecht die Tagesnote, ein Punkt je Testtag. Überfahren zeigt
  Titel, Datum und Note, ein Klick öffnet den Eintrag. Sie richtet sich nach den
  gerade sichtbaren Einträgen und bleibt unter fünf Testtagen weg.
- Filter- und Sortierwahl werden serverseitig gespeichert und sind auf jedem
  Gerät gleich.
- Sortierung nach Änderung, Bewertung, **Potenzial**, Titel sowie nach
  Testverlauf: Anzahl der Testtage, Durchschnitt der Tagesnoten und letzte
  Tagesnote. Einträge ohne Testtage stehen dabei immer am Ende — sie haben
  keinen niedrigen Wert, sondern gar keinen. **Dasselbe gilt für die beiden
  Potenzialeinträge:** wer keine Einschätzung hat, steht in beiden Richtungen
  hinten.
- **Die Kachel zeigt eine Zahl, nicht zwei**: bei einem getesteten Eintrag die
  Bewertung („★ 3,8"), bei einem ungetesteten das Potenzial („◆ 4,2"). *Ein
  anderes Zeichen, damit niemand 4,2 Potenzial für 4,2 Qualität hält.* Die
  andere Zahl steht im Kopf des zugeklappten Kastens am Eintrag.
- **Abgelehnt** steht als eigene Gruppe in der Statuszeile, hinter der
  Beschriftung „Ablehnung": *Alle · Abgelehnt · Nicht abgelehnt*. **Sie lässt
  sich mit dem Teststatus kombinieren** — man lehnt ab, ohne zu testen, und man
  lehnt nach dem Test ab, und beides muss zusammen einstellbar bleiben. *Drei
  Zustände und kein einfacher Umschalter: gebraucht wird auch die
  Gegenrichtung — „zeig mir alles außer dem Verworfenen".*
- **★ Favoriten** steht als eigener Umschalter rechts in der Statuszeile und
  lässt sich mit jedem Teststatus kombinieren. Ein Favorit ist persönlich
  und sortiert die gemeinsame Liste nicht um — wer seine Favoriten sammeln
  will, nimmt den Filter.
- **Einen Filter „Neu seit …" gibt es nicht.** *Zwei Anzeigen für dieselbe
  Frage — was hat sich getan, seit ich zuletzt hier war — sind eine zu viel;
  die Auskunft trägt die **Glocke** in der Kopfzeile.* **Eine gespeicherte
  Ansicht, die ihn trägt, bleibt lesbar** — er wird übergangen.
- Über das Häkchen auf einer Karte lassen sich Einträge vergleichen. Im
  Vergleich steht bei **mehr als einem Zugang** ein Umschalter
  **„meine / alle"** über dem Raster: er schaltet Kriterienwerte, Kopfzahl und
  Testtagzeile gemeinsam zwischen den eigenen Werten und dem Schnitt über
  alle. Vorgabe ist „alle". Bei einem einzigen Zugang erscheint er nicht —
  dann wären beide Stellungen dieselbe Zahl.

**Eintrag**
- Blättern mit ← → oder über die Pfeile, ohne vorher ins Bild zu klicken. Klick
  aufs Foto öffnet die Vollbildansicht; dort zoomt ein weiterer Klick auf
  Originalgröße. Esc schließt, auf Touch wird gewischt.
  **Das Vollbild trägt denselben Papierkorb wie die Ansicht darunter** — wer
  ein Bild groß betrachtet, erwartet dort auch den Papierkorb. Es ist **dieselbe Klemme und dieselbe Rückfrage**; ein
  Papierkorb im Vollbild, der ohne Frage löschte, wäre der gefährlichste Knopf
  der Installation. Er steht abgesetzt und **vor** dem Schließenkreuz, nicht daneben.
  War es das letzte Bild, geht das Vollbild zu. *An einem Kommentarbild gibt
  es ihn nicht — das wird am Kommentar entfernt.*
- Das **erste Element ist das Hauptbild** — Reihenfolge durch Ziehen der
  Vorschaubilder ändern, mit Maus oder Finger.
- Fotos lassen sich per Dateiauswahl, **Strg+V aus der Zwischenablage** oder
  durch Ablegen auf dem Feld hinzufügen.
- **Kurzvideos bis 20 MB stehen in derselben Reihe** — MP4, WebM und MOV, über
  dasselbe Feld hinzugefügt. In der Vorschauleiste trägt ein Video ein ▶ und
  seine Länge, im Eintrag und im Vollbild wird es mit der Steuerung des
  Browsers abgespielt; darin lässt sich springen. Nichts spielt von selbst los,
  und beim Blättern oder Schließen wird angehalten. Steht ein Video vorn, ist
  sein Standbild das Hauptbild. Siehe unten, „Kurzvideos".
- **Blöcke lassen sich anordnen und einklappen**: Ziehen am Griff in der
  Kopfzeile, Klick auf die Kopfzeile klappt ein und aus. Eingeklappt nennt die
  Kopfzeile den Inhalt, etwa „Kommentare (3)". Verschoben wird nur innerhalb des
  jeweiligen Bereichs — die drei Blöcke rechts untereinander, die vier unten
  untereinander. Anordnung und Einklappzustand gelten für alle Einträge
  gemeinsam und liegen auf dem Server; zurückgesetzt wird im Systembereich.
- **Tags**: Marken oben mit ✕, darunter eine Wolke aller vorhandenen Tags über
  drei Zeilen. Ein Klick in der Wolke vergibt, ein erneuter nimmt zurück; das ✕
  an der Marke bleibt daneben bestehen — zwei Wege für zwei Absichten.
- **Testtage** können eigene Tags tragen, zwischen Datum und Sternen. Derselbe
  Vorrat wie am Eintrag, aber eine eigene Verknüpfung.
- **Dateien** am Eintrag, bis 50 MB je Stück und höchstens 20. Ein Klick auf die
  Zeile tut das Naheliegende — was der Server ansehen kann (Bilder, PDF,
  Text/Markdown/CSV/Log, `.docx`) klappt auf und wieder zu, alles andere wird
  heruntergeladen. Der Pfeil rechts zeigt vorher an, was passiert; ein eigener
  Ladepfeil daneben lädt auch Ansehbares herunter. Siehe unten, wie das
  abgesichert ist.
- **Bildausschnitt der Vorschau**: Der Schalter „Ausschnitt" über dem Bild legt
  je Foto fest, welcher Teil auf der quadratischen Karte zu sehen ist. Ein
  Rahmen zeigt dabei den künftigen Ausschnitt. Ein Schieber daneben zieht ihn
  **enger** — von „so weit wie das Bild hergibt" bis viermal so nah. Ziehen
  setzt den Punkt, der Schieber die Weite; beides landet in derselben Zeile.
  **Das Original bleibt unangetastet** — geschnitten wird ausschließlich die
  kleine Vorschau, und zwar aus dem Original neu, sobald du speicherst. *Der
  Ausschnitt ist deshalb jederzeit änderbar; die Kachel ist danach so scharf,
  wie das Original es hergibt, gleich wie eng du ziehst.* Die Vorschau in der
  Mitte des Eintrags und das Vollbild zeigen weiter das **ganze** Bild.
- **Kommentare** tragen zwei unabhängige Merkmale: die **Art** (Notiz, Bericht
  oder Aufgabe) und die **Anpinnung**. Frei kombinierbar. Daraus folgt die
  Reihenfolge: erst Angepinntes, dann Aufgaben, dann Berichte, dann Notizen —
  und **innerhalb jeder Gruppe das Älteste oben**. Der Block der Angepinnten bleibt gemischt;
  dort entscheidet allein das Alter, nicht die Art. Die Gruppen zerreißen die
  Chronologie, deshalb sind beide Merkmale optisch klar unterscheidbar; gelesen
  wird trotzdem überall von alt nach neu. Wer sein aktuelles Fazit oben haben
  will, pinnt es an. Ein Bericht ist an keinen Testtag gebunden; er fasst meist
  mehrere zusammen.
  Die **Aufgabe** steht ganz oben, damit sie auffällt. Ihr Knopf
  schaltet **weiter statt um**: Notiz → Aufgabe → erledigt → Notiz.
  **Alle offenen Aufgaben auf einen Blick** zeigt die Ansicht
  **„Offen"** — der Knopf dafür steht in der Kopfzeile neben dem Zahnrad. Sie
  listet alle nicht erledigten Aufgaben aus allen Einträgen, gruppiert nach
  Eintrag, mit Verfasser und Datum; ein Klick führt in den Eintrag, und abhaken
  geht direkt dort. Die abgehakte Zeile bleibt durchgestrichen stehen, damit
  sich der Haken gleich wieder wegnehmen lässt. Abhaken darf, wer den Kommentar
  geschrieben hat, und der Admin — dieselbe Regel wie im Eintrag. Bei mehr als
  einem Zugang steht darüber ein Umschalter **„meine / alle"**.
  Ein erledigtes Todo verlässt die Spitze und reiht sich nach Alter bei den
  Notizen ein — es bleibt aber als erledigt gekennzeichnet und wird nicht
  wieder zur Notiz. Der Berichtsknopf daneben bleibt ein gewöhnlicher
  Umschalter; ein Kommentar hat immer genau eine Art.
  **Gekennzeichnet werden die beiden Merkmale auf getrennten Kanten**: die **linke** Kante gehört allein der Art — orange bei einem Bericht,
  blau bei einer Aufgabe, grün wenn sie erledigt ist, nichts bei einer Notiz.
  Das Grün ist dasselbe wie bei der „Getestet"-Marke und beim besten Wert im
  Vergleich; es bedeutet dort schon „positiv abgeschlossen". Die drei **übrigen** Kanten gehören allein der
  Anpinnung und werden gedämpft golden. Bei einer angepinnten Notiz bleibt die
  linke Kante deshalb neutral: sonst wechselte das Anpinnungszeichen je nach Art
  die Stelle. So sind alle vier Zustände unterscheidbar, ohne dass sich die
  Zeichen überlagern, und ein Bericht behält seine Kante auch dann, wenn er
  angepinnt wird.
- **Der Blockkopf zählt**: „12 Kommentare, davon 3 Berichte und 5 Aufgaben
  (2 Erledigt)". Die Zahlen hinter dem „davon" sind **Teilmengen**, keine
  Summanden — das Erledigte steckt in den Aufgaben. Gruppen mit null fallen
  weg. Der Satz bleibt auch eingeklappt stehen.
- **Adressen im Kommentartext werden anklickbar.** Erkannt wird nur
  ausdrücklich Geschriebenes: `http://`, `https://` und `www.` ohne Schema. Ein
  blankes `beispiel.de` bleibt Text — anders als in der Linkliste, wo ein Wort
  zur Suche wird: deutscher Fließtext ist voll von „z.B." und „usw.", und jede
  Endungsregel trifft dort daneben. Nachlaufende Satzzeichen gehören nicht zur
  Adresse; eine schließende Klammer bleibt nur, wenn die Adresse eine unpaarige
  öffnende enthält. Angezeigt wird die Adresse vollständig, so wie geschrieben.
  Beim Bearbeiten steht weiterhin der Rohtext im Textfeld. Gespeichert ändert
  sich nichts — die Umwandlung geschieht erst beim Zeichnen.
- **Bilder in Kommentaren**: bis 6 je Kommentar, anhängen oder mit Strg+V
  einfügen. Jedes Bild wird beim Hochladen neu kodiert — gespeichert wird nur
  die verkleinerte Variante samt Kachel, nicht das Original.
- **Zwei Sternkästen: „Potenzial" und „Bewertung".** Sie beantworten zwei
  verschiedene Fragen und **berühren einander nicht** — kein Stern des einen
  zählt im anderen, und jeder hat eigene Kriterien, eigene Gewichte und einen
  eigenen Durchschnitt.
  *Potenzial* fragt **vor** dem Ausprobieren: *lohnt es sich, das als Nächstes
  zu probieren?* *Bewertung* fragt **danach**: *wie gut war es?* Wer Ideen mit
  den Bewertungskriterien benotet, mischt beides in einen Durchschnitt, und
  niemand sieht es der Zahl an.
  **Welcher Kasten offen steht, entscheidet der Eintrag**: an einem
  ungetesteten steht *Potenzial* offen und *Bewertung* zugeklappt, an einem
  getesteten umgekehrt. Der zugeklappte behält seine Zahl im Kopf
  („Potenzial (⌀ 4,2)"), und ein Klick auf die Kopfzeile klappt ihn auf.
  **Dieser Klick gilt für diesen Eintrag und wird nicht gespeichert** — eine
  gespeicherte Einstellung gälte für alle Einträge zugleich, und beim nächsten
  stünde der falsche Kasten offen. *Versteckt wird nichts: was jemand
  eingetragen hat, ist immer einen Klick entfernt.*
  **Der Potenzialkasten ist leer, bis der Admin Kriterien dafür anlegt** — in
  der Karte *Potenzial: Kriterien* im Systembereich. Bis dahin sieht der
  Eintrag aus wie zuvor. **Das Wort „Potenzial" steht im Vokabular** und lässt
  sich umbenennen.
  *Eine Ausnahme aus Rücksicht auf den Bestand: trägt ein ungetesteter Eintrag
  schon Bewertungssterne, steht der Bewertungskasten offen. Vorhandene Daten
  schlagen die Regel.*
- **Bewertung**: gemeinsame Kriterien, feste Skala 1–5. **Die Sterne sind die
  eigene Bewertung**; sind mehrere Zugänge eingerichtet, steht rechts daneben
  gedämpft der Schnitt über alle, im Blockkopf die Gesamtzahl. **Hat dort noch
  niemand bewertet, steht ein Strich** — die Spalte hat ihre Breite von
  Anfang an, damit die Sterne beim ersten Stern nicht nach links springen.
  **Wie viele Stimmen darin stecken, steht in Klammern daneben — aber erst ab
  zweien.** *„⌀ 4,0 (1)" wäre eine Auskunft über nichts: dass jemand bewertet
  hat, sagt schon der Schnitt.* Die vollständige Angabe steht am Überfahren. Der Gesamtschnitt entsteht **erst je Kriterium, dann über die
  Kriterien**. **Hinter den eigenen fünf Sternen steht ein ×, sobald in dieser
  Zeile ein Stern gesetzt ist** — ein Tipp darauf entfernt ihn, und das gilt in
  beiden Kästen. *Dass es der eigene ist, sagt der Platz: das × sitzt an den
  eigenen Sternen, die Durchschnittszahl daneben bleibt unberührt.* **Einen
  Knopf, der alle Kriterien auf einmal leert, gibt es nicht** — wer alles
  zurücksetzen will, tippt drei- bis fünfmal, bei einer Handlung, die selten
  ist und sich durch erneutes Setzen ohnehin heilt.
  **Kriterien können verschieden schwer wiegen.** Ist an einem Kriterium ein
  Gewicht eingestellt, das von 1 abweicht, steht `×1,5` hinter seinem Namen,
  und im Blockkopf steht neben der Zahl das Wort „gewichtet". Stehen alle
  Gewichte auf 1 — so, wie eine frische Installation startet —, sieht der Block aus
  wie zuvor. Eingestellt wird das Gewicht im Systembereich; **der
  Gesamtschnitt bleibt in jedem Fall zwischen 1 und 5.**
  **Ein Klick auf die Zahl im Blockkopf öffnet die Rechnung — die dieses
  Eintrags, kein erfundenes Beispiel.** Der Kasten zeigt je
  bewertetem Kriterium eine Zeile mit Note, Gewicht und Produkt, darunter
  Summe, Teiler und Ergebnis:
  **erst je Kriterium der Schnitt über alle Bewertungen, dann der gewichtete
  Mittelwert darüber.** Der **Teiler zählt nur die Kriterien, die auch bewertet
  sind** — ein Kriterium ohne Sterne geht gar nicht ein, sonst zöge es die Zahl
  nach unten, ohne dass es an den Werten läge. **Gerundet wird genau einmal,
  ganz am Ende.**
  **Darunter steht die Vergleichszahl: was käme heraus, wenn alle Kriterien
  gleich zählten?** *Erst der Unterschied macht die Gewichtung
  sichtbar — die Formel allein sagt, WIE gerechnet wird, nicht, WAS die
  Gewichte ändern.* **Stehen alle Gewichte auf 1, steht sie gar nicht da:**
  dort gibt es nichts zu vergleichen. **Und ergeben beide Zahlen nach dem
  Runden dasselbe, sagt der Kasten genau das** — zweimal dieselbe Zahl
  hinzuschreiben wäre eine Auskunft über nichts.
  *Der Kasten **liest** diese Rechnung; er rechnet sie nicht nach — die
  Vergleichszahl eingeschlossen. Beide entstehen in derselben Schleife im
  Server. Zwei Rechenwege für dieselbe Zahl liefen früher oder später
  auseinander.*
  **Wer welchen Wert vergeben hat, steht nicht unter der Sternzeile.** Ab zwei
  Zugängen findet der **Admin** in jedem der beiden Kastenköpfe den Knopf
  **„Stimmen"**: er öffnet eine Ansicht mit den Namen je Kriterium, und dort
  lässt sich eine fremde Bewertung **entfernen** — ändern lässt sie sich
  nicht. Für alle
  anderen gibt es den Knopf nicht, und der Server liefert ihnen die Namen auch
  nicht aus.
  **Angelegt, umbenannt, sortiert und gelöscht werden Kriterien
  ausschließlich im Systembereich und ausschließlich vom Admin** — in zwei
  Karten, eine je Kasten. **Zu welchem Kasten ein Kriterium gehört, steht mit
  dem Anlegen fest** und lässt sich danach nicht ändern: ein Wechsel trüge
  vergebene Sterne von einem Durchschnitt in den anderen, und zwar still.
  *Wer ihn braucht, löscht und legt neu an — dabei gehen die Sterne sichtbar
  mit.* **Ein Name gehört zu genau einem Kasten**: „Wunsch" gibt es einmal
  oder gar nicht.
  **Auf dem Telefon steht der Kriterienname über den Sternen**, in einer
  eigenen Zeile; darunter links die Sterne mit ×, rechts der Durchschnitt. So
  bleibt für lange Namen Platz, auch bei großer Schrift. Ein
  neues Kriterium erscheint sofort an jedem Eintrag, ein gelöschtes nimmt
  überall die vergebenen Sterne mit — eine globale Folge, die nicht eine
  Zeigerbreite neben dem Sterne-Widget liegen sollte. Anlegen und Aufräumen
  gehören an dieselbe Stelle.
  Im Systembereich steht daneben, in wie vielen Einträgen das Kriterium
  verwendet wird.
- **„Abgelehnt" ist eine Aussage und kein bloßes Häkchen.** Beim
  Einschalten öffnet sich **sofort** ein Feld für den Grund — eine Zeile,
  **freiwillig**, höchstens 200 Zeichen; gespeichert wird beim Verlassen des
  Feldes oder mit Enter, verworfen mit Escape. **Danach schließt sich das Feld,
  und was stehenbleibt, ist der Satz:**
  *„Abgelehnt am 14.03.2026, 09:12 von Anna — Lieferzeit über 6 Monate."*
  Der Grund selbst steht **hervorgehoben** da, Datum und Name gedämpft.
  **Jedes der drei darf fehlen**, und die Zeile setzt sich aus dem zusammen, was
  bekannt ist; ein entfernter Zugang erscheint als „Gelöschter Benutzer 7".
- **Wann das Eingabefeld dasteht**: **solange abgelehnt ist und
  noch kein Grund dasteht** — und darüber hinaus dann, wenn man es über den
  Text oder das ✎ aufmacht. *Nie beides zugleich mit der Aussage, und an einem
  Eintrag, der nicht abgelehnt ist, steht gar nichts davon.* **Wird ein Eintrag
  mit vorhandener Begründung erneut abgelehnt, bleibt das Feld zu** — die alte
  Begründung steht dann in der Aussage.
- **Ändern und Entfernen der Begründung**: ein Klick auf den Text
  oder auf das **✎** daneben öffnet das Feld wieder — **beides nur für den, der
  die Begründung getroffen hat.** Das **✕** daneben entfernt sie nach Rückfrage,
  und **das darf jeder, der den Eintrag ändern darf** — also auch der Admin.
  *Es ist dieselbe Hausregel wie beim Kommentar: Löschen ja, umschreiben nein.*
  **Beim Entfernen bleiben Datum und Verfasser stehen** — „Abgelehnt am
  14.03.2026 von Anna" ist weiterhin wahr, nur der Grund fehlt. *Und wer
  entfernt hat, wird dabei nicht ihr Verfasser: Anna darf danach eine neue
  schreiben, der Admin nicht.* **Steht gar keine Begründung da, bleibt das ✎
  allein stehen** — sonst gäbe es keinen Weg mehr hinein.
  *Beim Zurücknehmen des Merkmals wird ebenfalls nichts gelöscht: lehnt jemand
  denselben Eintrag später wieder ab, steht die alte Begründung als Vorschlag
  im Feld.*
  **In der Kachelansicht bleibt die Marke, wie sie war** — ein Grund gehört an
  den Eintrag und nicht in eine Kachelreihe. *„Getestet" bekommt bewusst nichts
  davon: es ist ein Zustand und keine Entscheidung.*
- **Beschreibung und Kommentarfelder wachsen mit dem Text** — sie zeigen immer
  den ganzen Inhalt und haben deshalb keinen Ziehgriff.
- **Testtage**: nur bei eingeschaltetem „Getestet". Jede Zeile ist ein Tag mit
  einer einzigen Gesamtnote — das Bauchgefühl dieses Tages, unabhängig von den
  Kriterien. Ein Datum kann nur einmal vorkommen; wird es erneut eingetragen,
  ersetzt die neue Note die alte. Ab drei Tagen zeigt eine kleine Kurve den
  Verlauf. Solange Testtage vorhanden sind, lässt sich „Getestet" nicht
  zurücknehmen.
- **Links**: beliebig viele Adressen. **Eintragen darf jeder**, auch an einem
  fremden Eintrag; wieder wegnehmen darf sie, wer sie hingesetzt hat, oder der
  Admin — das ✕ steht nur dort, wo es auch gedrückt werden darf. Ab zwei
  Zugängen trägt eine **fremde** Zeile den Namen ihres Eintragers.
  Ein Klick auf die Zeile öffnet sie in einem
  neuen Tab, Ziehen sortiert um — **umsortieren darf nur der Verfasser des
  Eintrags oder der Admin.** Über der eingestellten Zeilenzahl wird die
  Liste **abgeschnitten**, nicht scrollbar — der Knopf darunter klappt sie auf.
  Bewusst ohne Favicons — die müssten von fremden Servern geladen werden. **Was keine Adresse ist, wird zur Suche**: ein Wort,
  eine Normbezeichnung, eine Artikelnummer bleibt im Rohzustand stehen und führt
  beim Klick zum Startanbieter. Solche Zeilen tragen rechts eine
  Lupe statt des Pfeils und nennen unter dem Text die Anbieter, bei denen sich
  suchen lässt — der Startanbieter zuerst, dahinter bis zu drei weitere. Jeder
  Name ist ein eigenes Klickziel: ein Klick darauf sucht bei genau diesem
  Anbieter. Gespeichert wird
  nie eine fertige Suchadresse — ein Anbieterwechsel gilt deshalb rückwirkend
  für alle vorhandenen Suchzeilen.
- Kommentare lassen sich nachträglich bearbeiten und löschen.
- Löschen von Eintrag, Foto, Video, Kommentar, Link, Datei und Testtag jeweils
  mit Rückfrage. Beim Eintrag wird benannt, was dranhängt — **Fotos und Videos
  getrennt**, dazu **Links, Dateien,
  Kommentare, Bewertungen und Testtage getrennt nach eigenen und fremden**,
  denn die fremden gehen über die Kaskade mit. **sagt der Dialog
  dazu, dass der Eintrag dreißig Tage im Papierkorb liegt** und wer ihn von
  dort zurückholen kann — der Eigentümer der Installation, nicht der, der hier
  klickt.
- **„Diesen Eintrag als Datei"** *(Eigentümer)*: derselbe Aufbau
  wie eine volle Exportdatei, nur mit einem Eintrag — samt Fotos, Videos,
  Dateien und Kommentarbildern.

**Systembereich** (Zahnrad in der Kopfzeile)

**Er steht in fünf Abschnitten, und jeder hat eine eigene Adresse.** Neunzehn
Karten in einer Reihe wären auf dem Telefon eine einzige lange Spalte. Die
Abschnitte folgen der **Rechteleiter**: was jedem gehört, steht vorn, was nur
der Eigentümer sieht, hinten.

| Abschnitt | Adresse | Karten |
|---|---|---|
| **Persönlich** | `#/system/persoenlich` | Zugang, Meine Sitzungen, Darstellung |
| **Bestand** | `#/system/bestand` | Kategorien, Tags, Bewertungskriterien, Potenzialkriterien, Vokabular, Links, Suchanbieter, Papierkorb |
| **Zugänge** | `#/system/zugaenge` | Zugänge, Anfragen, Sicherheitsprotokoll, Mailversand |
| **Datenbank** | `#/system/datenbank` | Kennzahlen, Bildablage, Sicherung, Alte Sicherungen, Export und Import |
| **Installation** | `#/system/installation` | Titel |

**Die Adresse ist der ganze Punkt.** Ohne sie lässt sich keine Einstellung
verlinken, und die Zurück-Taste bricht: `#/system/datenbank` lässt sich
weitergeben, in einem neuen Fenster öffnen und mit der Zurück-Taste wieder
verlassen. `#/system` ohne Abschnitt bleibt gültig und löst sich auf den ersten
sichtbaren auf.

**Der fünfte Abschnitt hieß früher anders, und die alten Adressen führen
weiter.** `#/system/anlage` und `#/system/instanz` landen beide bei
„Installation"; ein Lesezeichen von damals führt also nicht ins Leere, und die
Adresszeile zieht still auf die heutige nach.

> **DIE KARTEN EINER REIHE SIND GLEICH HOCH, und was die Reihe hoch macht, ist
> ihre höchste Karte ohne Liste.** Steht in einer Reihe keine solche, macht die
> Liste mit den meisten Zeilen das Maß — höchstens **zehn** Zeilen, beim
> Sicherheitsprotokoll höchstens **fünfzehn**, und mindestens eine.
>
> **Zehn Zeilen heißt zehn Zeilen DIESER Liste.** Eine Zeile in „Meine
> Sitzungen" trägt drei Angaben untereinander und ist damit fast doppelt so hoch
> wie eine gewöhnliche; sie zeigt trotzdem zehn Sitzungen und nicht fünf.
>
> **Eine Liste ist so hoch wie ihr Inhalt und rollt, wenn er den Deckel
> übersteigt.** Tags, Kategorien, Zugänge und das Sicherheitsprotokoll können
> beliebig lang werden; ohne Deckel zöge eine einzige Karte die Seite auf
> fünfzig Zeilen.
>
> **Bekommt eine Karte mehr Platz, als ihre Liste braucht, bleibt der Rest
> leer.** Eine Karte mit zwei Zeilen zeigt zwei Zeilen und bläst sich nicht auf
> zehn auf. *Und eine leere Liste ist **zwei** Zeilen hoch und sagt, dass nichts
> da ist — eine Zeile allein läse sich wie ein Absatz und nicht wie ein leerer
> Bereich.*
>
> **In einem Fenster gilt kein Deckel** — die Glockentafel und die Liste der
> gelöschten Zugänge zeigen, was da ist; das Fenster selbst rollt.
>
> **Auf dem Telefon steht jede Karte allein in ihrer Zeile.** Dort hängt der
> Deckel am Fenster: eine Liste nimmt höchstens gut sechs Zehntel der
> Fensterhöhe, und der Rest kommt über den Rollbalken.

> **DIE ALTE ADRESSE `#/system/anlage` WIRD WEITER VERSTANDEN.** Sie führt
> still an dieselbe Stelle wie `#/system/instanz` und wird dabei in der
> Adresszeile auf die neue nachgezogen. *Ein Lesezeichen von gestern führt
> also dorthin, wohin es immer führte.*

**Ein Abschnitt, in dem für diesen Zugang keine einzige Karte steht, erscheint
gar nicht** — ein leerer Reiter wäre schlechter als keiner. Ein gewöhnlicher
Benutzer sieht deshalb zwei Abschnitte statt fünf. **Und eine Adresse, die auf
einen Abschnitt zeigt, den es für ihn nicht gibt, fällt auf den ersten
sichtbaren zurück** und wird dabei in der Adresszeile nachgezogen — sonst
stünden dort zwei Aussagen über denselben Zustand.

**Auf dem Telefon wird aus der Reiterreihe eine Liste**, die in den Abschnitt
hinein führt.

**Der zuletzt offene Abschnitt wird ausdrücklich nicht gemerkt.** Die Adresse
tut es schon; ein gemerkter Zustand daneben wäre eine zweite Wahrheit.

**Was man dort sieht, hängt an der Rolle.** Ein gewöhnlicher Benutzer bekommt
acht Karten: seinen eigenen **Zugang**, **Meine Sitzungen**, die
**Darstellung**, die **Links** und die vier Listen **Kategorien**, **Tags**,
**Bewertungskriterien** und **Potenzial: Kriterien** — die letzten vier ohne
Bedienzeichen, nur zum Nachsehen. Alles Übrige steht dem
**Admin**, Export, Import, Sicherung und **Sicherheitsprotokoll** allein dem
**Eigentümer**. Der Grund:
ein Knopf, der zuverlässig eine Fehlermeldung erzeugt, sieht aus wie ein
Fehler. **Der Papierkorb ist der Zwischenfall:** die Karte steht dem Admin,
die beiden Knöpfe daran nur dem Eigentümer — dieselbe Bauform wie bei den drei
Listen.

- Beide Titel ändern *(Admin)*
- Kennzahlen: Einträge, Fotos, Videos, Kommentare, Links, Testtage,
  **Papierkorb** und Datenbankgröße *(Admin)*. Der Schlüsselwert zum Abschreiben steht darin nur für den
  **Eigentümer**.
  **Dort stehen auch die Version und der Fingerprint nebeneinander** — die
  Version sagt, welcher Stand laufen *soll*, der Fingerprint, ob die Dateien
  dazu wirklich zusammengehören.
  **Und ganz unten die Verfahren:** Verschlüsselung `sqlcipher`, Schlüssel
  **256 Bit roh** (`PRAGMA key = x'…'`, also ohne Ableitung — er ist kein
  Passwort, sondern trägt schon 256 Zufallsbits), Journal **WAL**, Passwörter
  **scrypt**. Die vier Angaben werden aus der geöffneten Datenbank *abgelesen*
  und nicht behauptet.
  **Welche Fassung welcher Bibliothek das rechnet, steht dort ausdrücklich
  nicht.** Ein Verfahrensname sagt, *wie* gerechnet wird; eine Versionsnummer
  sagt, *welche Lücke passt*.
- **Zugänge** verwalten — anlegen mit Passwort **oder mit Link**, sperren,
  Passwort zurücksetzen **direkt oder mit Link**, Rolle wechseln, entfernen;
  siehe den Abschnitt „Rollen und Zugänge" oben *(Admin)*.
  **Gelöschte Zugänge stehen in einem eigenen Fenster** hinter dem Knopf
  „Gelöschte Zugänge (n)" — sie sind kein Zugang mehr, den man verwalten kann,
  und die Liste bleibt damit kurz. *Der Löschdialog nennt auch den umkehrbaren
  Weg: **sperren** weist die Anmeldung ab, lässt aber den Namen und den Bestand
  stehen und lässt sich jederzeit zurücknehmen.*
- **Meine Sitzungen** — wo dieser Zugang überall angemeldet ist, mit „alle
  anderen beenden" *(jeder; jeder sieht nur seine eigenen)*
- **Sicherheitsprotokoll** *(Eigentümer)*: wer Zugang hatte und
  wer die Installation als Ganzes angefasst hat — 180 Tage lang, ohne einen Weg
  hinaus außer der Frist. Kein Änderungsverlauf, keine Adresse, keine
  Browserkennung.
- **Export und Import stehen in EINER Karte** *(Eigentümer)* —
  sie meinen dieselbe Datei: die eine geht hinaus, dieselbe kommt herein.
  **Aber nicht gleichrangig.** Der Export liest, der Import **ersetzt
  Bestand**; die zerstörende Hälfte steht deshalb unter einem Trennstrich, mit
  eigener, kleinerer Überschrift und in einer leiseren Zeichnung. Die zweite
  Bestätigung vor dem Import bleibt, wo sie war.
- **Export** mit oder ohne Fotos, nur für den Eigentümer der Installation. Die
  Datei nennt zu jedem Eintrag, jeder Bewertung, jedem Kommentar, jedem
  Testtag, **jeder Linkzeile und jeder Datei** den **Verfassernamen**.
  **Videos gehen nur mit eigenem Häkchen mit** — ohne es nennt die Datei sie,
  enthält sie aber nicht, und der Import sagt beim Einspielen, wie viele
  gefehlt haben. Der eigentliche Sicherungsweg für Videos ist ohnehin nicht der
  Export, sondern die Sicherung des Verzeichnisses `data`.
  **Die Karte nennt die erwartete Dateigröße, bevor der Knopf gedrückt wird**,
  und die Zahl folgt den Häkchen. Ab **300 MB** steht ein Hinweis darunter:
  eine Exportdatei ist ein **einziger Text**, und der kann nicht größer als
  512 MB werden — das ist Nodes Grenze für einen String und keine Einstellung. **Gewarnt wird, verweigert nicht** — die Zahl ist eine
  Schätzung, und wer weiß, was er tut, soll es versuchen dürfen. Wird sie
  wirklich gerissen, sagt die Installation ab, **bevor** sie anfängt zu bauen,
  statt nach zwei Minuten mit einem Speicherfehler abzubrechen.
- **Export in Teilen** *(Eigentümer)* — der Weg, wenn die eine
  Datei nicht mehr geht. Die Installation rechnet aus, wie viele Teile es braucht,
  und **jeder Teil ist eine vollständige Exportdatei**: derselbe Umschlag,
  dieselbe Formatnummer, nur weniger Einträge darin. **Geschnitten wird
  zwischen Einträgen, nie mitten hinein.**
  **Zum Einspielen: Teil 1 mit „Ersetzen", alle übrigen der Reihe nach mit
  „Zusammenführen".** Es ist derselbe Import wie immer — es gibt kein neues
  Format und keinen zweiten Weg hinein.
  **Die Teilgröße ist wählbar** (50 bis 300 MB), nach oben aber gedeckelt:
  darüber baute die Installation Teile, vor denen sie im selben Atemzug warnt.
  **Das Passwort wird einmal gefragt und je Teil geprüft** — eine Freigabe
  für Teil 1 lässt Teil 2 nicht durch.
  **Ein Eintrag, der schon für sich allein über der Grenze liegt**, passt in
  keinen Teil und wird **namentlich genannt** statt still übergangen; ohne das
  Häkchen an den Videos wird er meist klein genug.
  *Für eine Kopie zum Zurückspielen bleibt die **Sicherung** der kürzere Weg —
  ein Griff statt n.*
- **Import** einer Exportdatei, wahlweise *ersetzen* oder *zusammenführen* —
  ebenfalls nur für den Eigentümer, und zwar in beiden Fällen: eine
  Exportdatei kann Beiträge **unter fremdem Namen** anlegen.
  **Das Austauschformat trägt die Nummer 11** — darin stehen auch Datum, Grund
  und Verfasser einer Ablehnung; der Verfasser wandert als **Name** hinaus, nie
  als Zugangsnummer. **Eine Datei der Nummer 10 (und jeder älteren)
  lässt sich weiterhin einspielen**: die drei Felder fehlen dann und bleiben
  leer. *Ein fehlender Ablehnender fällt dabei ausdrücklich **nicht** an den
  Einspielenden — ein Eintrag, den niemand abgelehnt hat, hat keinen
  Ablehnenden.*
  Der Vorgang läuft in einem Zug; bricht er ab, bleibt der Bestand unverändert.
  Ein genannter Verfasser, den es als Zugang gibt, bekommt seine Zeilen zurück;
  alles andere fällt an den Einspielenden — auch ältere Dateien, die noch gar
  keinen Namen kennen. **Ein unbekannter Name legt keinen Zugang an**; er wird
  im Protokoll genannt, damit man ihn vor einem zweiten Versuch anlegen kann.
  **Eine Ausnahme, und sie ist die naheliegende:** Links und Dateien aus einer
  Exportdatei, die noch gar kein Feld dafür hat, fallen an den **Verfasser des
  Eintrags** und nicht an den Einspielenden. Die Datei sagt ja nichts anderes,
  als dass sie zu diesem Eintrag gehören.
- **Sicherung** *(Eigentümer)*: eine vollständige, verschlüsselte
  Kopie der Datenbank auf Knopfdruck — siehe den Abschnitt „Sichern" weiter
  unten. Die Karte nennt den eingerichteten Zielort, das Unterverzeichnis
  darunter, wann zuletzt gesichert wurde und wie lange es dauern wird. **Ganz
  oben steht, wie der Zielort liegt:** rot, wenn er im Projektverzeichnis
  liegt, mit dem Grund daneben; grün, wenn er außerhalb liegt. Abgewiesen wird
  keine der beiden Lagen — eine Sicherung am falschen Ort ist besser als
  keine. **markiert sie außerdem jede Kopie rot, die noch mit dem
  alten Schlüssel verschlüsselt ist** — falls je gewechselt wurde.
- **Alte Sicherungen** *(Eigentümer)*: **listet alle Sicherungen am Zielort und
  entfernt alte — ohne Shell auf dem Wirt.** Die Liste führt sie mit **Nummer,
  Datum, Alter und Größe**, jüngste zuerst; ab der sechsten Zeile rollt sie.
  **In der Liste wird nichts gelöscht** — an jeder Zeile steht nur, ob sie beim
  nächsten Lauf fällt oder ob sie sich nur mit dem alten Schlüssel öffnet.
  **Gelöscht wird eine Sicherung nur, wenn BEIDES zutrifft:** sie liegt *nicht
  unter den jüngsten N* **und** ist *älter als X Tage*. Beide Werte lassen sich
  einstellen (**1 bis 20** und **7 bis 365 Tage**); die Grenzen hält der Server,
  und jede Änderung rechnet die Liste neu, ohne dass etwas gelöscht wird. **Der
  Schalter „Nach jeder erfolgreichen Sicherung aufräumen" steht auf AUS.**
  Daneben ein **Knopf** hinter der Passwortabfrage. **Angefasst wird
  ausschließlich, was dem Namensschema der Installation entspricht** — eine
  eigene Datei im Ordner bleibt liegen, ein Unterverzeichnis wird nicht
  betreten, und ein Symlink ist keine Sicherung. **Kopien von vor einem
  Schlüsselwechsel fasst die Regel gar nicht an**; für sie gibt es einen
  eigenen, ausdrücklichen Knopf.
- **Papierkorb** *(Admin sieht, Eigentümer handelt;)*: was in den
  letzten dreißig Tagen gelöscht wurde, mit Titel, Datum, Löschendem, der
  verbleibenden Frist und der Größe. **„Zurückholen"** legt einen **neuen**
  Eintrag mit demselben Inhalt an — Fotos, Videos, Dateien, Kommentare,
  Bewertungen und Testtage samt ihren Verfassern; ein Verfasser, dessen Zugang
  inzwischen entfernt wurde, bleibt „Gelöschter Benutzer N". **„Endgültig
  entfernen"** schließt den Rückweg. Nach dreißig Tagen fällt eine Zeile von
  selbst heraus.
  *Zwei Dinge kommen nicht zurück, und das ist beabsichtigt:* die Favoriten
  **anderer** (ein Favorit heißt „habe ich markiert") und der Vermerk über
  entfernte Kommentarbilder. *Und zwei Löschwege füllen den Papierkorb nicht:*
  „Zugang entfernen" mit dem Häkchen *Einträge mitnehmen* und der **ersetzende**
  Import.
- **Darstellung**: Schriftgröße der Oberfläche in fünf Stufen von 80 % bis
  120 %, Zeitleiste an oder aus, Standardanordnung der Blöcke — alles
  serverseitig gespeichert
- **Links** *(jeder)*: Zahl der sichtbaren Zeilen, bevor aufgeklappt werden
  muss, und die Zahl der Anbieternamen unter einer Suchzeile — beides
  persönlich, jeder stellt es für sich ein.
- **Suchanbieter** *(Admin)*: die Anbieter für Zeilen, die keine Adresse sind.
  Sechs eingebaute
  (Google, Bing, DuckDuckGo, Startpage, Brave Search, Ecosia) und bis zu drei
  eigene mit Name und Vorlage, `%s` als Platzhalter — etwa für ein Forum oder
  einen Suchdienst im Heimnetz. Erlaubt sind ausschließlich `http://` und
  `https://`. Ein Häkchen nimmt einen Anbieter in die Auswahl, **Start** macht
  ihn zum Ziel des Zeilenklicks. Beides gilt für alle — der Admin kuratiert,
  die Dichte bestimmt jeder für sich.
- **Vokabular**: wie die Dinge heißen sollen (siehe unten) *(Admin)*
- **Kategorien und Tags** umbenennen oder löschen, mit Angabe der betroffenen
  Einträge *(Admin)*. Dazu je ein Häkchen, **wer einen neuen Namen anlegen
  darf**: mit Haken jeder unmittelbar am Eintrag, ohne Haken nur der Admin.
  Zuweisen und Auswählen aus dem Vorhandenen bleibt in jedem Fall für alle
  offen — abgeschaltet verschwindet nur die Zeile „+ neu anlegen".
- **Bewertungskriterien** umbenennen, löschen, **per Ziehen sortieren** und
  **gewichten** *(Admin)*. Die
  Reihenfolge gilt für Detailansicht und Vergleich gleichermaßen — im Vergleich
  fällt das oberste Kriterium zuerst ins Auge. Die Zahl nennt die Einträge, bei
  denen Sterne vergeben sind; ein zurückgesetztes Kriterium zählt nicht mit.
- **Potenzial: Kriterien** — dieselbe Karte für den Kasten *vor* dem Test,
  gleiche Bedienung, eigene Liste. **Zwei oder drei reichen**: mehr macht die
  Einschätzung langsamer, nicht besser — sie soll in zehn Sekunden gehen. Die
  Karte schlägt *Wunsch* (Gewicht 1,5), *Nutzen* und *Machbarkeit* vor;
  **angelegt wird nichts von selbst.** *Das ist ein Rat und kein Verbot — der
  Admin darf so viele anlegen, wie er will.*

  **Das Gewicht** bestimmt, wie stark ein Kriterium in den Gesamtschnitt
  eingeht. Bei **1** zählen alle gleich — so startet jede Installation, und so
  bleiben die Zahlen die gewohnten. Möglich ist **0,2 bis 2**; angeboten
  werden `0,5 · 0,8 · 1 · 1,2 · 1,5`, alles dazwischen lässt sich eintippen.
  Geschrieben wird mit Komma (`1,5`), gelesen wird auch ein Punkt (`1.5`).
  Feiner als zwei Nachkommastellen wird gerundet — und man sieht es, denn das
  Feld zeigt danach den gespeicherten Wert. Ein Wert außerhalb der Spanne wird
  **abgewiesen**, nicht stillschweigend zurechtgebogen: wer 5 eintippt, meint
  5. Ein leer gelassenes Feld bedeutet nicht „0", sondern „doch nicht" — der
  alte Wert kehrt zurück.

  **Der Gesamtschnitt eines Eintrags bleibt dabei immer zwischen 1 und 5.**
  Das ist keine Klemme, sondern eine Eigenschaft der Rechnung: gerechnet wird
  ein **gewichteter Mittelwert**, und der liegt zwangsläufig zwischen dem
  kleinsten und dem größten der gemittelten Werte. Gewichtet wird nur der
  Schritt über die Kriterien; die Werte je Kriterium bleiben, was sie sind.

  **Das Gewicht gilt für alle.** Es ist keine persönliche Einstellung — hätten
  zwei Leute verschiedene Gewichte, hätte derselbe Eintrag zwei verschiedene
  Gesamtschnitte. Wer nicht verwalten darf, sieht das Gewicht trotzdem: es
  erklärt die Zahl, die an jedem Eintrag steht.

## Auf dem Handy und auf dem Tablett

**Es ist eine Installation und keine zweite Oberfläche.** Es gibt keinen zweiten
Aufbau, keine Weiche nach der Kennung des Browsers und keine Handy-Adresse. Was
sich ändert, entscheidet der Browser anhand von zwei Fragen — und die beiden
werden nie vermischt:

- **Die Breite entscheidet über das Layout.** Wie viele Spalten ein Raster
  trägt, ob die Kopfzeile umbricht, ob ein Kasten seinen Rahmen behält. Ein
  Tablett am Standfuß und ein kleines Fenster auf dem Desktop sind
  derselbe Fall.
- **Der Zeiger entscheidet über die Größe der Ziele.** Ein Finger ist rund
  zehnmal so breit, wie ein Mauszeiger spitz ist. Ein Tablett im Querformat ist
  breit **und** wird mit dem Finger bedient; wer die Zielgröße an die Breite
  hinge, ließe genau dieses Gerät leer ausgehen.

Es gibt **drei Umbruchpunkte**, mehr nicht: **1024 px** (Tablett — engeres
Polster, dichtere Raster), **860 px** (die Detailansicht wird einspaltig) und
**700 px** (Telefon). Die Telefonregel fragt zusätzlich nach der **Höhe**: quer
gehalten ist ein Telefon 850 bis 930 Pixel breit und keine 500 hoch — nach der
Breite allein wäre es ein Tablett und bekäme eine Kopfzeile, die ein Drittel der
Höhe frißt, die es gar nicht hat.

### Die Kopfzeile

Auf dem Telefon stehen dort **zwei Zeilen**: oben Marke, Titel, der Knopf zum
Anlegen und ein Menüzeichen, darunter die Suche über die volle Breite. Alles
Übrige — die Glocke, offene Aufgaben, Systembereich, wer angemeldet ist,
Abmelden — liegt **hinter dem Zeichen**.

**Die Suche bleibt draußen**, weil sie auf einem kleinen Bildschirm das
wichtigste Bedienelement ist: Filter und Tagwolke sieht man dort nicht auf einen
Blick, die Suche findet trotzdem. **„+ Eintrag" bleibt draußen**, weil er der
eine Weg ist, auf dem etwas Neues in die Installation kommt.

**Dasselbe Menü bekommt auch ein Tablett, das mit dem Finger bedient wird** —
dort passt die Kopfzeile mit Fingermaßen sonst nicht in eine Zeile. Ein Fenster
von 1024 Pixeln auf einem Desktop behält die Kopfzeile, die es immer hatte.

Die Tafel schließt sich beim Klick daneben und mit Escape. Ein Menü, das nur
sein eigener Knopf wieder zumacht, steht im Weg, sobald man es versehentlich
geöffnet hat.

### Die Glocke und der Zähler „Offen"

*(auf jedem Gerät — die Kopfzeile ist **eine**, und was in ihr steht, wandert
auf dem Telefon von selbst hinter das Menüzeichen.)*

**Die Glocke trägt einen Punkt, der Knopf „Offen" eine Zahl.** Das ist kein
Zufall: eine Zahl beschreibt einen **Zustand** — so viele Aufgaben stehen offen
—, ein Punkt meldet ein **Ereignis** — seit deinem letzten Blick ist etwas
dazugekommen. Die beiden Zeichen werden nirgends vertauscht.

**Ein Klick auf die Glocke öffnet eine Tafel** mit den Einträgen, an denen
etwas hinzugekommen ist, und **jede Zeile führt zu ihrem Eintrag**.
Eine Meldung, die man nicht anspringen kann, wäre eine Mitteilung ohne Weg.

**Was die Glocke verspricht:** **Kommentare** und **Bewertungen** seit dem
letzten Öffnen der Tafel — **von den anderen. Die eigenen meldet sie nicht.**
*Eine Glocke ist eine Nachricht von jemand anderem; über die eigene Hand
braucht niemand eine, man war dabei.* **Wer allein an einer Installation arbeitet,
sieht sie deshalb nie läuten.** Das ist die gewollte Folge und keine Lücke:
sie hätte ihm nichts zu sagen, was er nicht selbst getan hat.

**Und jede Zeile sagt, WAS neu ist:** „3 Kommentare · 4 Bewertungen" statt
„7 neue Beiträge". **Bei nur einer Art steht auch nur eine Angabe da** —
„0 Bewertungen" wäre eine Auskunft über nichts, dieselbe Regel wie beim Zähler
„Offen" weiter unten.

**Darunter steht, von wem** — und zwar **nur zu den Kommentaren**. *Ein
Kommentar trägt seinen Verfasser am Eintrag ohnehin sichtbar; eine Bewertung
tut das nicht.* **Wer welche Bewertung abgegeben hat, bleibt anonym** — die
Liste „Wer hat bewertet" sieht weiterhin nur der Admin, und die Tafel gibt
davon nichts preis. Eine Zeile, an der ausschließlich Bewertungen neu sind,
trägt deshalb keinen Namen; **das ist dieselbe Regel wie am Eintrag selbst und
keine Ausnahme.**

**Was sie nicht verspricht — und das gehört gesagt:**

- **Sie rechnet beim Aufbau der Übersicht nach, nicht laufend.** Was in dieser
  Minute entsteht, steht beim nächsten Laden da. *Eine Glocke ist ein
  Versprechen; wer sie sieht, verlässt sich darauf — deshalb steht hier, wie
  weit es trägt.*
- **Sie führt keinen Lesestand je Meldung.** Das Öffnen der Tafel setzt
  **alles** auf gesehen, auch was man gleich nicht anklickt. Ein Lesestand je
  Zeile bräuchte eine eigene Tabelle; die schlanke Fassung führt einen
  **Zeitstempel**, und das ist ihre bewusste Grenze.
- **Bewertungen ohne Zeitpunkt bleiben ihr unsichtbar.** Ältere Bewertungen
  tragen keinen, und ein nachgetragener wäre erfunden — entweder sähe alles
  gleich alt aus oder alles brandneu, und die Glocke läutete beim ersten Start
  für den ganzen Bestand.
- **Vor dem ersten Verlassen der Übersicht gibt es sie gar nicht.** Ohne
  gespeicherten Bezugspunkt weiß die Installation nicht, was jemand schon gesehen
  hat.
- **Sie meldet Kommentare und Bewertungen — sonst nichts.** Ein geänderter
  Titel, eine neue Datei, ein neuer Testtag stehen nicht darin. *Das ist etwas,
  das jemand **am** Eintrag getan hat, und kein Beitrag, der **für** dich
  daliegt — und die Übersicht ordnet ohnehin nach der letzten Änderung: was
  sich zuletzt getan hat, steht oben.*

**Der Zähler „Offen"** summiert die offenen Aufgaben über den ganzen Bestand —
gerechnet aus derselben Bedingung wie die Ansicht dahinter, damit Knopf und
Ansicht nicht zwei verschiedene Zahlen nennen. **Ohne offene Aufgaben steht
dort keine Null:** „Offen 0" wäre eine Auskunft über nichts.

*Beide Zahlen reisen mit einer Antwort mit, die die Übersicht ohnehin holt. Es
gibt keinen zusätzlichen Abruf je Seitenaufbau.*

### Die Filter

Sie stehen auf dem Telefon **eingeklappt** und öffnen sich auf einen Druck. Vier
Reihen mit Beschriftung und beliebig vielen Pillen füllten dort sonst den ganzen
ersten Bildschirm, bevor der erste Eintrag zu sehen war — und die Übersicht ist
die Liste, nicht ihre Einstellung.

**Der Schalter nennt die Zahl der greifenden Filter**, und das ist der Grund,
warum Einklappen überhaupt zulässig ist: eingeklappt sieht man sonst nicht, dass
gefiltert wird, und eine Liste, die ohne sichtbaren Grund unvollständig ist, ist
ein Fehler und keine Ansicht. Die Sortierung zählt nicht mit — sie nimmt nichts
weg, sie ordnet nur. **Der Zustand ist Ansichtszustand und keine Einstellung:**
beim nächsten Aufruf steht wieder die Vorgabe.

Auf einem Tablett steht der Schalter ebenfalls da, die Filter fangen dort aber
**offen** an. Dort ist Platz, und was vorher sichtbar war, soll nicht ohne Not
verschwinden.

### Die Kästen — Kaffeesatz und Kartenstapel

Wäre jeder Block eine Karte — eigener Untergrund, eigener Rahmen, eigene Ecke,
eigener Innenabstand —, lägen auf 390 Pixeln fünf Kanten und drei verschiedene
Eckenradien zwischen dem Bildschirmrand und dem ersten Buchstaben. **Worin** die
Karte steht, ist schon die Seite; **was** darin steht, wären wieder Kästen.

**Auf dem Telefon ist ein Block deshalb kein Kasten, sondern ein Abschnitt:** ein Trennstrich darüber, ein Titel, der Inhalt. Er steht auf der
Seite und nicht auf einer Karte. Damit bleibt genau **eine** Kastenebene übrig —
die Kommentarkarte, die Linkzeile, die Dateizeile —, und die steht auf voller
Breite, bündig unter dem Bild darüber. Dieselbe Kante, dieselbe Flucht, **eine**
Ordnung. Alles, was in dieser Flucht steht, rundet mit demselben Radius.

Das ist kein neuer Gedanke, es ist der vorhandene: *ein Merkmal, ein Zeichen.*

### Was sonst noch anders ist

- **Der Titel steht vor dem Bild.** Einspaltig kam sonst zuerst das Foto, dann
  die Vorschaubilder, dann das Feld zum Hochladen und dann sechs Zeilen
  Erklärung — und erst danach erfuhr man, *welche* Sache man da ansieht.
- **Zwei Karten nebeneinander** statt einer. Eine Karte über die volle Breite
  war nicht einmal zwei Karten je Bildschirm; ein Bestand von dreißig Einträgen
  war damit eine Wischstrecke.
- **Dialoge steigen von unten auf** und liegen am unteren Rand an. Die Mitte des
  Schirms ist die Stelle, an die der Daumen am schlechtesten kommt. Die Knöpfe
  stehen untereinander über die volle Breite, der eigentliche Vorgang oben.
- **Am Bildbereich blättert ein Wisch**, wie im Vollbild. Die Pfeile bleiben
  trotzdem stehen: der Wisch ist der bequeme Weg, der Pfeil der auffindbare.
  Auf der Abspielsteuerung eines Videos blättert er nicht.
- **Gelöscht wird am großen Bild und nicht an der Vorschaukachel.** Oben rechts
  im Bildbereich steht eine Reihe von Zeichen: Ausschnitt, beim Video Vollbild,
  und abgesetzt davon der Papierkorb. *Die Kachelreihe darunter trägt auf dem
  Finger keine Zerstörung mehr* — sie kann antippen und, nach kurzem Halten,
  verschieben, und sonst nichts. Mit der Maus bleibt das Kreuz an der Kachel, wo
  es war; dort gibt es kein Danebentippen.
- **Die Vorschaureihe füllt die Breite.** Sie steht als Raster, das seine
  Spalten selbst auszählt: passen fünf Kacheln hinein, stehen dort fünf; passen
  nur vier, werden die vier größer. **Links und rechts bleibt derselbe Rand wie
  überall auf der Seite**, und die Reihe endet bündig unter dem Bild darüber.
  *Eine feste Kachelbreite ließe auf einem 360 Pixel breiten Telefon einen
  Streifen rechts liegen — ein Fünftel der Breite, wenn die fünfte Kachel an
  zwei Pixeln scheitert.* Am Desktop bleibt die Kachel bei 62 Pixeln.
- **Eingabefelder fallen nicht unter 16 Pixel.** Darunter zoomt Safari auf dem
  iPhone beim Antippen die ganze Seite heran und wieder heraus tut sie es nicht
  von selbst. Wer die Schrift auf 80 Prozent stellt, bekommt hier deshalb nicht
  ganz, was er wollte — aber eine Seite, die bei jedem Tastendruck springt, hat
  er noch weniger gewollt.
- **Die Aussparung des Geräts wird mitgerechnet** — Kopfzeile, Vollbild,
  Meldungen und die Vergleichsleiste. Auf jedem Gerät ohne Aussparung ändert das
  nichts.
- **Die Leiste des Browsers nimmt die Farbe der Installation.** Ein hellerer Streifen
  über der dunklen Seite ist das, was eine Seite wie eine Seite aussehen läßt.

### Berühren, halten, wischen

Sortieren und Scrollen teilen sich auf einem Berührungsbildschirm denselben
Zeiger. Deshalb gilt: **mit der Maus wird sofort gezogen, mit dem Finger erst
nach kurzem Halten** (0,4 Sekunden). Bewegt sich der Finger vorher, war es ein
Wisch — dann wird gescrollt und nichts umsortiert. Sobald gegriffen ist, meldet
das die Zeile mit einem Rahmen, und das Gerät gibt einen kurzen Impuls.

**Am Eintrag scrollt keine Liste in sich selbst.** Wer die Seite herunterzieht
und dabei über eine lange Linkliste oder eine Tagwolke kommt, scrollt weiter
die Seite — die Listen werden abgeschnitten statt scrollbar gemacht, und der
Weg zum Rest ist der Aufklappknopf darunter. Ein eigener Bildlauf mitten in der
Seite fängt sonst die Wischbewegung ab.

*Die Karten im Systembereich sind die Ausnahme, und sie ist begründet:* eine
Liste, die auf hunderte Zeilen wachsen kann, hat dort keinen Aufklappknopf
unter sich, sondern einen Deckel — siehe „Systembereich".

Zeilenaktionen sind überall Zeichen (`✎` bearbeiten, `✕` löschen), nicht mal
Text und mal Zeichen. Auf schmalen Bildschirmen passt Text nicht in die
Kopfzeile, und uneinheitlich sieht es ohnehin schlechter aus.

**Die Vorschaukachel ist davon die eine Ausnahme, und sie ist begründet.** Ihr
Kreuz maß mit Fingermaßen 27 Pixel auf einer Kachel von 62 — ein Fünftel der
Fläche, und zwar in der Ecke, auf der der Daumen aufsetzt, wenn er über die
Reihe wischt. **Eine Zeile ist breit und wird von oben nach unten gelesen; eine
Kachelreihe ist schmal und wird quer durchgewischt.** Das Kreuz sitzt dort also
nicht neben dem Weg des Fingers, sondern darauf. Es steht deshalb auf dem
Berührungsbildschirm nicht mehr da.

**Es steht dort nicht nur unsichtbar, sondern gar nicht** — der Unterschied ist
der ganze Punkt. Eine Fläche, die man nur durchsichtig macht, nimmt weiterhin
jede Berührung an; sie sieht richtig aus und verhält sich falsch. *Nachgemessen:
fragt man den Browser, was an der Ecke liegt, in der das Kreuz saß, nennt er auf
dem Finger die Kachel und mit der Maus das Kreuz.*

Im Vollbild **zoomt mit der Maus ein Klick, mit dem Finger erst der zweite
Tipp** innerhalb einer knappen Sekunde. Ein einzelner Tipp tut nichts —
Schließen wäre bei jedem versehentlichen Antippen zu hart. Die Pfeile zum
Blättern bleiben auch im herangezoomten Bild stehen, wo immer man es gerade
hingeschoben hat.

**Nach dem Zoom steht die Mitte des Bildes im Blick**, nicht die linke obere
Ecke, und in jede Richtung lässt sich schieben. Ist das Original kleiner als die
Fläche, sitzt es mittig statt oben links.

**Was beim Überfahren erscheint, steht auf dem Finger dauerhaft da** — Kreuze,
Stifte, Blätterpfeile, der Knopf für den Bildausschnitt. Ohne diese Ausnahme gibt
es die Funktion auf einem Telefon schlicht nicht: es gibt dort kein Überfahren.
**Und was sich beim Überfahren bewegt, bewegt sich auf dem Finger nicht.** Ein
Tipp setzt diesen Zustand, und niemand nimmt ihn wieder weg; die Karte, die man
einmal angetippt hat, stünde sonst dauerhaft drei Pixel höher als ihre
Nachbarinnen.

**Ein Tipp löst sofort aus.** Ohne besondere Angabe hält der Browser jede
Berührung eines Knopfes rund 300 Millisekunden zurück, weil daraus noch ein
Doppeltipp zum Vergrößern werden könnte — auf einer Seite mit `width=device-width`
gibt es den nicht mehr, die Wartezeit bliebe trotzdem. **Im Vollbild ist der
zweite Tipp ausgenommen**: dort *ist* er eine Bedeutung, er zoomt aufs Original.

## Vokabular

Kriterion nennt seine Gegenstände von Haus aus „Eintrag", das Merkmal
„Getestet/Ungetestet" und die Zeitpunkte „Testtag/Testtage". Wer etwas anderes
sammelt, ändert diese zwölf Wörter im Systembereich — aus „3 Einträge" wird
„3 Maschinen", aus „+ Testtag eintragen" wird „+ Sitzung eintragen". **Das
zwölfte ist „Potenzial"**, der Name des ersten Sternkastens; wer lieber
„Erwartung" oder „Einschätzung" sagt, stellt es dort um.

**Ein Wort aus dem Vokabular wird nirgends zu einem Wort verbaut.** Kriterion
schreibt „Potenzial: Kriterien" und „Potenzial (hoch → niedrig)", nie
„Potenzialkriterien" — „Erwartungkriterien" hätte kein Fugen-s, und der
Quelltext kennt keins.

**Nur die Beschriftung ändert sich.** Feldnamen in Datenbank und Exportdatei
bleiben, wie sie sind; ältere Exportdateien lassen sich weiterhin einspielen,
und ein Export aus einem umbenannten Bestand passt in einen nicht umbenannten.

Damit das ohne Angabe des Geschlechts funktioniert, sind sämtliche Texte so
geschrieben, dass weder Beiwort noch Fall vorkommt. Wer neue Texte hinzufügt,
hält sich an dieselbe Regel:

- **Sicher:** Plural im Nominativ und Akkusativ — „die Einträge", „die
  Maschinen", „die Objekte". Der Artikel „die" passt zu jedem Geschlecht.
- **Sicher:** Einzahl ohne Begleiter — „Eintrag löschen", „+ Maschine",
  „Objekt nicht gefunden".
- **Unsicher:** Dativ Plural, der ein -n anhängt — „bei allen Objekten". Wer
  „Objekte" einträgt, bekäme „bei allen Objekte".
- **Unsicher:** jede Einzahl mit Artikel oder Beiwort — „ein neuer Eintrag"
  wird zu „ein neuer Maschine".

Leere Felder fallen auf die Vorgabe zurück, ein Knopf stellt alle zwölf
zurück. Eine Probe unter den Feldern zeigt vor dem Speichern, wie die Wörter in
echten Textbausteinen aussehen.

## Schriftgröße

**Die Einstellung im Systembereich vergrößert oder verkleinert die Schrift der
ganzen Oberfläche**, in fünf Stufen von 80 auf 120 Prozent. **Die Abstände
gehen nicht mit** — bei 120 % wird es deshalb an einigen Stellen enger, dafür
verschiebt sich das Gefüge nicht. Die Anmeldeseite
bleibt bei der Vorgabegröße, weil der Endpunkt vor der Anmeldung nur den
öffentlichen Titel ausliefert.

## Dateien am Eintrag — wie sie abgesichert sind

**Eine Installation darf niemals so ausgeliefert werden, dass der Browser sie als
Webseite ausführt.** Wer an `anhaenge.js` etwas ändert, sollte das hier gelesen
haben. Die Verteidigung liegt in Schichten, damit kein einzelner Fehler genügt:

1. **Der gemeldete Typ des Hochladenden wird nie ausgeliefert.** Er wird
   gespeichert und angezeigt, mehr nicht. Was rausgeht, bestimmt eine eigene
   Liste anhand der Dateiendung.
2. **Alles Unbekannte geht als `application/octet-stream` raus.** Die Liste
   enthält absichtlich kein HTML, XHTML, XML oder SVG.
3. **`Content-Disposition: attachment` ist die Vorgabe.** `inline` gibt es nur
   für Bilder und PDF, und auch nur, wenn es ausdrücklich angefordert wird.
4. **`X-Content-Type-Options: nosniff`** — sonst darf der Browser den Typ selbst
   erraten. Steht zusätzlich als Header für die ganze Anwendung.
5. **`Content-Security-Policy: default-src 'none'; sandbox`** auf jeder
   Anlagen-Antwort. Selbst wenn alles andere versagt, läuft dort nichts.
6. **Der Dateiname wird für der Header entschärft.** Zeilenumbrüche würden
   erlauben, weitere Header einzuschleusen; Anführungszeichen würden den
   Wert beenden. Umlaute kommen über `filename*=UTF-8''` durch.
7. **Text, Markdown, CSV und Log werden gar nicht als Datei ausgeliefert.** Der
   Server liest sie und schickt sie als JSON; die Oberfläche setzt sie als Text
   in die Seite. Der Browser interpretiert diese Inhalte damit überhaupt nie.
8. **PDF wird in einem `iframe` mit `sandbox="allow-scripts"` angezeigt** —
   ausdrücklich **ohne** `allow-same-origin`. Die eingebauten PDF-Betrachter von
   Chrome und Edge bestehen selbst aus HTML und JavaScript und bleiben ohne
   `allow-scripts` schlicht leer. Ohne `allow-same-origin` liegt das Dokument in
   einem eigenen, fremden Ursprung und sieht von der Anwendung nichts. Die
   Lockerung gilt **nur für PDF**; alles andere bekommt weiterhin das
   vollständige `sandbox`. Daneben steht immer ein Verweis „In neuem Tab
   öffnen", falls ein Browser das Einbetten trotzdem verweigert.

**Fotos folgen derselben Regel** — und in beiden Richtungen. Beim
**Hochladen** wird das Ergebnis geprüft, nicht die Angabe: was `sharp` nicht als
JPEG, PNG, WebP, AVIF, GIF oder TIFF liest, wird abgewiesen. Eine SVG kommt
damit gar nicht erst herein — sie bestand den alten Filter, weil sie sich
`image/svg+xml` nennt, und ließ sich anstandslos zu Vorschaubildern rastern.
Beim **Ausliefern** entscheiden die ersten Bytes, nie der gespeicherte Typ:
alles Unerkannte geht als `application/octet-stream` zum Herunterladen heraus.
Damit ist auch geschützt, was schon vorher in der Datenbank lag — eine
Ableitung braucht keine Datenüberführung. Die Spalte `photos.mime_type` bleibt
stehen und wird weiter angezeigt; sie ist eine Anzeige, keine Grundlage der
Auslieferung.

**Videos gehen denselben Weg**. Erkannt werden sie an den ersten
Bytes: MP4, M4V und MOV tragen den ISO-Kasten `ftyp`, WebM den EBML-Kopf. Nur
diese drei Typen kommen herein und gehen `inline` heraus; jede andere Marke
wird zum Herunterladen. Der Server **öffnet ein Video nie** — er liest zwölf
Bytes, speichert den Rest und liefert ihn wieder aus. Das Standbild dagegen
läuft durch dieselbe Prüfung wie jedes Foto.

**Die Anwendung selbst hat ebenfalls eine `Content-Security-Policy`**, auf
jeder Antwort: `default-src 'self'`, `script-src 'self'` ohne
jedes eingebettete Skript, `frame-ancestors 'none'`, `base-uri 'none'`,
`form-action 'none'`. `frame-src 'self'` trägt die PDF-Vorschau. Bei
`style-src` steht `'unsafe-inline'`, und zwar nötigerweise: die Oberfläche
setzt Abstände, Rasterspalten und den Fokuspunkt als `style="…"`-Attribut, und
ohne die Freigabe verwirft der Browser jedes davon. Die tragende Zeile ist
`script-src` — dort steht sie nicht. steht dort außerdem
`media-src 'self' blob:`: `'self'` trägt das Abspielen aus der eigenen Installation,
`blob:` das Standbild vor dem Hochladen. Ohne die zweite Angabe verwirft der
Browser die Adresse, an der die Oberfläche das Standbild zieht, und zwar
wortlos — es ließe sich überhaupt kein Video hochladen.

**Bilder in Kommentaren sind der eine Fall, in dem doch beim Hochladen
geprüft wird:** dort ist ausschließlich Bild erlaubt, jede Datei geht durch
`sharp` und wird neu kodiert gespeichert. Was `sharp` nicht als Bild lesen kann,
wird abgewiesen — eine als `.png` getarnte HTML-Datei kommt gar nicht erst in
die Datenbank. Ausgeliefert werden sie nach denselben Regeln wie alles andere.

**Bei Anhängen wird bewusst nicht nach Typen gefiltert.** Eine Positivliste
dort wäre leicht zu umgehen (umbenennen genügt) und wiegte in falscher
Sicherheit. Die Sicherheit hängt vollständig an der Auslieferung.

**Links im Kommentartext hängen an zwei Schranken.** Erstens erkennt die
Zerlegung ausschließlich `http://`, `https://` und `www.` — `javascript:` und
`data:` können dort gar nicht erst passen. Zweitens wird der String
unmittelbar vor dem Setzen von `href` noch einmal gegen `^https?://` geprüft;
fällt sie durch, wird sie als gewöhnlicher Text gezeichnet statt als Link. Dazu
`target="_blank"` und `rel="noopener noreferrer"`. Der Text selbst kommt nie
über `innerHTML` in die Seite, sondern als echte Knoten (`createTextNode` für
Text, `createElement('a')` mit `textContent` für Links) — Maskierung ist damit
nicht „nicht vergessen worden", sondern baulich unmöglich. Die zweite Schranke
kann nicht anschlagen, solange die erste richtig ist; beide sind deshalb im
Prüfstand einzeln aufrufbar und einzeln gegengeprüft.

**Warum kein SVG in der Vorschau:** Eine SVG-Datei kann Skript enthalten. In
einem `img`-Element läuft es nicht, aber ein direkt geöffneter Tab ist eine
Webseite. SVG wird deshalb wie jede andere Datei heruntergeladen.

Die `.docx`-Vorschau packt das Dokument mit dem eingebauten `zlib` selbst aus
und liest `word/document.xml` als Text. Absätze und Zeilenumbrüche bleiben,
alles andere fällt weg.

## Kurzvideos

Ein Video bis **20 MB** liegt in **derselben Reihe wie die Fotos** — dieselbe
Tabelle, dieselbe Reihenfolge, dieselben Rechte, dieselbe Verschlüsselung. Es
gibt keine zweite Liste und damit keine zweite Antwort auf die Frage, was das
Hauptbild ist. Erlaubt sind **MP4, WebM und MOV**; entschieden wird nach dem
Inhalt, nicht nach dem Dateinamen.

**Das Standbild erzeugt der Browser des Hochladenden**, über ein verstecktes
`<video>` und eine Zeichenfläche, und schickt es als zweiten Teil desselben
Vorgangs mit. Damit kommt **kein `ffmpeg` ins Image** — rund hundert Megabyte
mit eigener Angriffsfläche und eigenem Aktualisierungsbedarf —, und der Server
öffnet nie ein Video. Zwei Folgen gehören dazu: wer ein Video nicht abspielen
kann, kann es auch nicht hochladen (ein Videoplatz, der nicht abspielt, wäre
ein kaputter Platz), und **das Standbild belegt nichts** — es ist eine
Vorschau, keine Aussage über den Inhalt der Datei.

**20 MB und nicht mehr**, und die Zahl ist gemessen: 50 MB kosten beim Lesen
aus der verschlüsselten Datenbank rund eine halbe Sekunde, mit dem gesamten
Blob im Arbeitsspeicher — eine BLOB-Zeile wird nicht stückweise gelesen. 20 MB
reichen für ein bis zwei Minuten Handyvideo. Wer mehr braucht, hängt die Datei
als Anhang an; dort wird sie heruntergeladen statt abgespielt.

Ausgeliefert wird **in Ranges**, damit sich im Video springen lässt. Fotos
bleiben davon unberührt.

## Speicherbedarf

Fotos werden gespeichert, wie sie ankommen — ein Bild aus einer Systemkamera
bleibt bei seinen 8–12 MB. **Eine Ausnahme gibt es, und sie ist gemessen: ein
eingefügtes Bildschirmfoto wird als WebP abgelegt.** Was mit Strg+V hereinkommt,
liefert der Browser als PNG; als WebP im Verfahren `nearLossless` ist es rund
zwei Drittel kleiner, **ohne dass man einen Unterschied sieht** — an hundert
Bildern des echten Bestands gemessen weicht der schlimmste einzelne Farbwert um
**2 von 255** ab. **JPEG, GIF und vorhandenes WebP bleiben unberührt**, und ein
PNG, das als WebP größer wäre, bleibt PNG.

Wer das nicht will, schaltet es ab: im Systembereich unter **Datenbank →
Kennzahlen → Bildablage** steht der Schalter „PNG-Originale beim Hereinkommen
umwandeln" (Vorgabe an, nur der Eigentümer). Ohne Häkchen bleibt jedes PNG
byte-genau so liegen, wie es ankam. **Daneben steht ein Knopf, der den
vorhandenen Bestand nachzieht** — er fragt vorher das Passwort und sagt, was
er tut: die PNG-Fassung ist danach weg, und zurück führt nur eine Sicherung des
Datenverzeichnisses.

Zusätzlich entstehen zwei kleinere Varianten: eine
Kachel (512 × 512, mit dem eingestellten Bildausschnitt darin) für die
Übersicht und eine mittlere (1600 px auf der langen Kante, ungeschnitten) für
Detail- und Vollbildansicht. Das kostet rund 7 % mehr Speicher, spart beim Blättern aber
etwa den Faktor 100 an Datenübertragung. Das Original wird erst geladen, wenn im
Vollbild gezoomt wird. **Beide Varianten sind JPEG und bleiben es** — das
Original ist unversehrt, die Anzeige ist es nicht.

**Ein Video zählt voll.** Es wird nicht umkodiert, sondern unverändert
abgelegt; dazu kommen die beiden Varianten seines Standbilds. Bei 20 MB je
Stück wächst die Datenbank entsprechend schnell — das ist der Grund für die
Grenze.

Gelöschter Platz wird automatisch freigegeben.

## Sichern

**Es gibt drei Wege, und sie tun Verschiedenes.**

| | Sicherung auf Knopfdruck | Kopie von `./data` | JSON-Export |
|---|---|---|---|
| **Wozu** | der Notfall, im laufenden Betrieb | der Notfall, bei angehaltenem Server | Umzug, Archiv, Weitergabe |
| **Vollständig** | ja, samt Sitzungen und Einstellungen | ja | nein |
| **Braucht den Schlüssel** | ja | ja | nein |
| **Überlebt einen Formatwechsel** | nein | nein | ja |
| **Server muss stehen** | nein | ja | nein |

**Die Sicherung auf Knopfdruck** steht im Systembereich beim
Eigentümer. Sie erzeugt über `VACUUM INTO` eine vollständige, verschlüsselte
Kopie der Datenbank — konsistent, auch während gearbeitet wird. Die Karte nennt
vorher, wie lange es dauert; **während die Kopie entsteht, steht die Installation
still** (rund zehn bis zwanzig Millisekunden je Megabyte). Sie zeigt außerdem,
wann zuletzt gesichert wurde — gelesen wird das am Zielort selbst, nicht aus
einem Merker in der Datenbank.
**Und zeigt sie, welche Kopien noch mit dem alten Schlüssel
verschlüsselt sind**, falls je gewechselt wurde: jede Kopie, die älter ist als
der Wechsel, wird rot markiert. Ist auch die jüngste älter, sagt die Karte, dass
überhaupt keine zum heutigen Schlüssel passt — dann gehört sofort neu gesichert.
Einzelheiten im Abschnitt „Den Schlüssel wechseln".

**Alte Kopien lassen sich entfernen, ohne dass du eine Shell öffnest.**
*Jede Kopie ist so groß wie die ganze Datenbank; bei 570 MB Bildbestand ist die
zehnte ein halbes Dutzend Gigabyte.* Zuständig ist die Karte **„Alte
Sicherungen"** neben der Sicherungskarte.

> **Die Regel hat zwei Bedingungen, und beide müssen zutreffen: eine Kopie
> fällt nur, wenn sie NICHT unter den jüngsten N ist UND älter als X Tage.**
> *Jede einzelne für sich wäre in genau der Lage falsch, in der man sie
> braucht: „nur älter als 30 Tage" nähme einer Installation, an der ein halbes
> Jahr nicht gesichert wurde, **alle** Kopien auf einmal — und „nur die letzten
> drei" wirft die Kopie vom Vormonat weg, wenn jemand an einem Nachmittag
> viermal auf den Knopf drückt.*

**Was du wissen musst, bevor du den Schalter umlegst:**

- **Er steht auf AUS, und das ist Absicht.** Eine gelöschte Sicherung holt
  nichts zurück; was nicht umkehrbar ist, schaltet die Installation nicht
  stillschweigend ein. **Bis du ihn umlegst, ändert sich an deinem
  Sicherungsordner nichts.**
- **Aufgeräumt wird nur im Anschluss an eine Sicherung, die GELUNGEN ist** —
  oder auf Knopfdruck. **Eine Zeitsteuerung gibt es nicht.** *Schlägt die
  Sicherung fehl, bleibt jede Kopie liegen: sonst räumte die Installation genau
  in dem Augenblick auf, in dem sie keine neue Kopie zustande bringt.*
- **Die Karte zeigt VORHER, was daliegt und was fällt.** Sie listet alle
  Sicherungen mit Nummer, Datum, Alter und Größe und markiert die, die beim
  nächsten Lauf fallen. *Einen Papierkorb gibt es dafür nicht; für eine
  600-MB-Datei wäre er sinnlos — der Platz ist ja der Grund. Die Liste ist der
  Ersatz.*
- **Angefasst wird ausschließlich, was dem Namensschema der Installation
  entspricht** (`kriterion-….sqlite`), nur im eingestellten Ordner, **nie in
  Unterverzeichnissen**, und nur, was wirklich eine Datei ist — ein Symlink ist
  keine Sicherung. **Eine eigene Datei, die du dort ablegst, bleibt liegen.**
- **Kopien von vor einem Schlüsselwechsel fasst die Regel gar nicht an.** *Sie
  sind nicht entbehrlich, sondern etwas anderes: wer den alten Schlüssel noch
  hat, kommt an sie heran.* Sie stehen in der Karte getrennt, mit eigener Zahl
  und eigener Summe, und haben einen **eigenen** Knopf.
- **Jede Löschung steht im Sicherheitsprotokoll**, unter „Bestand" — eine Zeile
  je entfernter Kopie, **ohne Dateinamen und ohne Pfad**.

**Der Zielort wird eingehängt, nicht eingetippt.** Die `docker-compose.yml`
bringt ihn mit:

```yaml
    volumes:
      - ./data:/app/data
      - ./kriterion-sicherung:/app/sicherung
    environment:
      - SICHERUNG_DIR=/app/sicherung
```

Beide Zeilen gehören zusammen und stehen deshalb in **derselben** Datei: ein
Pfad ohne Einhängung schriebe in eine Schicht des Containers, die beim nächsten
`docker compose up --build` verschwindet. In der Oberfläche lässt sich darunter
ein **Unterverzeichnis** wählen; es muss dort schon liegen, angelegt wird
keines.

> **Die Vorgabe legt den Ort ins Projektverzeichnis — bequem, aber nicht die
> sichere Lage.** Die Karte „Sicherung" markiert das **rot** und nennt den
> Grund; liegt der Ort außerhalb, steht dort ein **grüner** Kasten. Drei Dinge
> sprechen dagegen: beim Einspielen einer neuen Version wird das
> Projektverzeichnis umbenannt und die Sicherungen wandern mit (der
> Einspielweg unten holt sie eigens zurück); ein Fehlgriff am Projektordner
> nähme Original und Sicherung auf einmal; und beide liegen auf derselben
> Platte.
>
> **Umgestellt wird es in der `docker-compose.yml`, beide Zeilen zusammen:**
>
> ```yaml
>       - ../kriterion-sicherung:/sicherung
>     environment:
>       - SICHERUNG_DIR=/sicherung
> ```
>
> Dann entfällt auch die zusätzliche Zeile im Einspielweg. Ein relativer Pfad
> löst `docker` gegen den Ort der `docker-compose.yml` auf, also zeigt
> `../kriterion-sicherung` vor und nach dem Einspielen auf dasselbe
> Verzeichnis.
>
> **Die Anzeige hängt an der Spiegelung:** was auf dem Wirt unter `./` liegt,
> gehört im Container unter `/app`, was daneben liegen soll, daneben. Der
> Container sieht den Wirt nicht — er liest die Lage an seinem eigenen Pfad ab.

**Ohne die beiden Zeilen bleibt die Karte aus und sagt das** — sie schreibt
nicht still irgendwohin.

**Die Kopie von `./data`** bleibt der Weg für den angehaltenen Server:
`docker compose down` beendet ihn sauber, schließt die WAL-Datei ab und die
Datenbank. Wer im Anschluss kopiert, kopiert einen vollständigen Stand —
vorher blieb bei einem harten Ende eine offene WAL liegen. Wurde ein eigener
`ENCRYPTION_KEY` gesetzt, gehört dieser **getrennt davon** aufbewahrt.

**Der JSON-Export** ist der Austauschweg: unabhängig von Datenbankformat und
Schlüssel, dafür unvollständig (Sitzungen, Einstellungen und die Blockanordnung
fehlen) und mit der ganzen Datei im Arbeitsspeicher. lässt sich
auch **ein einzelner Eintrag** als Datei ziehen.

> **Und daran hat die EINE Datei ihre Grenze.** Sie ist ein einziger Text, und
> länger als **512 MB** kann ein Text in Node nicht werden — Fotos und Videos
> stecken als Base64 darin und kosten dabei ein Drittel Aufschlag. Die Karte
> **Export** rechnet das vorher aus und warnt ab **300 MB**; darüber sagt die
> Installation ab, bevor sie anfängt. Beim **Import** gilt dieselbe Grenze, dort aber
> vorab sichtbar: die Dateigröße steht ja fest, und die Installation fragt nach,
> bevor sie zu lesen anfängt.
>
> **Das ist kein Ende, sondern ein Schnitt:** „In Teilen exportieren" schreibt
> so viele vollständige Exportdateien, wie es braucht, und der vorhandene
> Import nimmt sie mit „Zusammenführen" wieder auf. *Die Grenze gilt je Datei —
> sie gilt nicht für den Bestand.*
>
> **Bestätigt wird dabei EINMAL** — Passwort und, wenn der Zugang einen zweiten
> Faktor trägt, **ein** Code. Danach lädst du jeden Teil selbst. *Ein Code des
> zweiten Faktors gilt genau einmal; eine Rückfrage je Teil ginge mit
> eingeschaltetem Faktor überhaupt nicht.*
>
> **Für eine Kopie zum Zurückspielen bleibt die Sicherung der kürzere Weg** —
> ein Griff statt n, und sie braucht dabei keinen nennenswerten
> Arbeitsspeicher. Der Export ist der **Austauschweg**: er überlebt einen
> Formatwechsel und braucht keinen Schlüssel.

> **Vor einer Version, die die Datenbank anfasst, ist die Sicherung Pflicht.**
> Ob eine Version das tut, steht im `CHANGELOG.md` über ihren Änderungen, und
> ausführlich im Änderungsprotokoll der Version.
>
> **Rüstet sie eine Spalte nach**, lässt sich der Bestand danach nicht mehr
> ohne Weiteres auf die vorige Version zurückbringen. Der Weg zurück ist dann
> die Sicherung, die **vor** dem Einspielen entstanden ist — nicht das
> Zurückkopieren der alten Dateien.
>
> **Legt sie nur eine neue Tabelle an**, sieht eine ältere Version die gar
> nicht an — und genau das ist die Falle: was darin steht, ist nach einem
> Downgrade **unerreichbar, ohne dass irgendetwas danach aussieht.** Was im
> Papierkorb liegt, ist dann nicht wiederherstellbar; ein Zugang, der über
> einen Link angelegt und noch nicht eingelöst wurde, hat kein Passwort und
> bekommt von der älteren Version auch keinen neuen Link — dort hilft nur
> `node zugang.js passwort <name>`.

## Datenmodell

Die Datenbankdatei heißt `katalog.sqlite`. Der Dateiname wandert bei einer
Umbenennung des Projekts bewusst **nicht** mit: ein anderer Name ließe den
Start eine leere Neuinstallation vermuten.

- `items` — Titel, Beschreibung, Getestet-/Abgelehnt-Merkmal, Kategorie. **Zur
  Ablehnung gehören drei Spalten:** `rejected_at` (wann), `rejected_grund`
  (warum, eine Zeile) und `rejected_von` (wer). Alle drei dürfen leer sein —
  eine ältere Ablehnung kennt keine davon, und ein Grund ist freiwillig. *„Getestet" bekommt bewusst nichts
  davon: es ist ein Zustand und keine Entscheidung.*
- `item_pins` — der **Favorit**, je Benutzer und je Eintrag; nur Zeilen für
  tatsächlich Markiertes. Die Spalte `items.favorite` bleibt ungenutzt im
  Schema und wird nie beschrieben. Die Anpinnung der **Kommentare**
  (`comments.pinned`) ist etwas anderes.
- `photos` — Original, Kachel und mittlere Variante, mit Reihenfolge
- `links` — Adressen mit Reihenfolge **und Verfasser**
- `test_days` — ein Eintrag je Tag mit Gesamtnote, eindeutig pro Eintrag, Tag
  **und Benutzer**
- `rating_criteria` / `ratings` — gemeinsame Kriterien mit frei bestimmbarer
  Reihenfolge **und Gewicht** (`gewicht`, 0,2 bis 2, Vorgabe 1), Werte je
  Eintrag und je Benutzer. Reihenfolge und Gewicht sind zwei Spalten, weil sie
  zwei Aussagen sind: die eine über die Anzeige, die andere über die Rechnung.
  **`phase` sagt, zu welchem der beiden Sternkästen ein Kriterium gehört** —
  `vorher` (Potenzial) oder `nachher` (Bewertung), Vorgabe `nachher`. *Der
  Name bleibt über beide Kästen hinweg eindeutig: ein Name, ein Kasten.*
  **`ratings` wird davon nicht berührt** — ein Stern ist ein Stern; zu welchem
  Kasten er gehört, sagt sein Kriterium. Eine Phase an der Sternzeile wäre eine
  zweite Wahrheit über dieselbe Sache.
  **`ratings` trägt mit `gesetzt_am` den Zeitpunkt der letzten Setzung** — für
  die Glocke. Er heißt nicht `created_at`, weil die Zeile beim ersten Stern
  entsteht und danach überschrieben wird, und er hat **keinen Vorgabewert**:
  ältere und **eingespielte** Bewertungen stehen ohne Zeitpunkt da. *Die Installation weiß dann nicht, wann das
  war, und behauptet es auch nicht — die Glocke übergeht solche Zeilen*
- `product_categories`, `tags`, `item_tags`
- `comments` — mit Bearbeitungszeitpunkt und `images_removed`: die Zahl der
  Bilder, die ein **anderer** als der Verfasser entfernt hat
- `test_day_tags` — Tags an einzelnen Testtagen, getrennt von `item_tags`
- `comments.kind` / `comments.pinned` — Art und Anpinnung je Kommentar
- `comment_images` — Bilder in Kommentaren, eigene Tabelle neben `attachments`
- `attachments` — angehängte Dateien samt Bytes **und Verfasser**
- `photos.focus_x` / `photos.focus_y` / `photos.zoom` — Fokuspunkt und Weite der
  quadratischen Vorschau. `zoom` ist ein Prozentwert; 100 heißt „so weit wie das
  Bild hergibt". **Es wird nichts geschnitten** — die drei Werte steuern nur die
  Anzeige
- `settings` — die **globale** Hälfte: Titel, Vokabular, die Suchanbieter
  (Vorrat, eigene Anbieter, Startanbieter), die beiden Schalter, wer neue
  Tags und Kategorien anlegen darf, und der Schalter der **Bildablage**.
  Sache des Admins — der Schalter der Bildablage allerdings nur des
  **Eigentümers**: er bestimmt, wie die ganze Installation künftig ablegt, und
  liegt damit in derselben Zeile wie Export, Sicherung und Schlüssel
- `user_settings` — die **persönliche** Hälfte, **acht** Schlüssel: die zuletzt
  benutzte Filterwahl, die **gespeicherten Ansichten**, der Bezugspunkt der
  **Glocke**, Schriftgröße, Blockanordnung, sichtbare Linkzeilen, Zeitleiste
  und die Zahl der Anbieternamen. Je Benutzer eine Zeile pro Schlüssel.
  *Ein Schlüssel aus einer älteren Fassung, den es nicht mehr gibt, **bleibt
  stehen und wird nicht mehr gelesen** — es gibt dafür keinen Migrationsblock,
  und eine Migration, die persönliche Zeilen löscht, wäre teurer als die Zeilen
  selbst.*
- `users` — Zugang als scrypt-Hash, dazu Rolle (`user` < `admin` <
  `eigentuemer`), Adresse, Status und letzte Anmeldung. Entfernte Zugänge
  bleiben als Grabstein (`status = geloescht`, Name `geloescht-<id>`) stehen.
  **Die Adresse wird überhaupt gefüllt** — beim Anlegen durch den
  Admin, danach nur noch durch den Betreffenden selbst
- `sessions` — aktive Anmeldungen, mit `user_id` am Benutzer. In der Karte
  **„Meine Sitzungen"** sieht jeder seine eigenen; adressiert werden sie über
  eine **gerechnete Kennung**, nie über den Sitzungsschlüssel selbst
- `tokens` — Einladungs- und Rücksetzlinke. **Gespeichert ist nur
  der SHA-256 des Links, nie er selbst**; dazu Benutzer, Anlass, Ablauf und
  wann er eingelöst wurde. Sieben Tage haltbar, einmal gültig; abgelaufene
  Zeilen räumt die Installation nach dreißig Tagen selbst weg
- `anfragen` — die **Warteschlange der Selbstanmeldung**:
  Wunschname, Adresse, der SHA-256 des Bestätigungslinks und der Zeitpunkt der
  Bestätigung. **Unbestätigte verfallen nach 24 Stunden** und erscheinen beim
  Admin nie; eine bestätigte wartet, so lange es dauert. Höchstens zwanzig
  offene, je Adresse eine
- `zweifaktor` / `zweifaktor_codes` — der **zweite Faktor**, je
  Zugang höchstens einer. Das TOTP-Geheimnis liegt dort **im Klartext** — es
  wird nachgerechnet und nicht geprüft, deshalb geht es nicht anders; die
  verschlüsselte Datenbank ist die einzige Schicht darüber. Die acht
  **Wiederherstellungscodes** stehen daneben als SHA-256 ohne Salz, jeder genau
  einmal gültig; eine verbrauchte Zeile bleibt stehen, damit die Karte „noch 6
  von 8" sagen kann. **Geräumt wird hier nichts nach einer Frist** — ein
  Wiederherstellungscode soll genau dann tragen, wenn das Telefon seit Monaten
  weg ist
- `sicherheitsprotokoll` — **wer Zugang hatte und wer die Installation als Ganzes
  angefasst hat**. Eine Zeile je Vorgang: Zeitpunkt, was, wer, an
  wem und ein kurzes Merkmal aus einer festen Liste — **kein Freitext, keine
  Namen, keine Adresse**. Beide Benutzerspalten halten einen **Vorgang** fest,
  keine Zugehörigkeit; ein leeres `wer` heißt „über `zugang.js` auf dem Wirt",
  außer bei einer gescheiterten Anmeldung. 180 Tage haltbar, und die Frist ist
  der einzige Weg hinaus
- `papierkorb` / `papierkorb_bytes` — der **Papierkorb**. Eine
  Zeile je gelöschtem Eintrag: Zeitpunkt, Löschender, Titel und das ganze Paket
  im Austauschformat; die Bytes (Fotos, Videos, Dateien, Kommentarbilder)
  liegen daneben in der zweiten Tabelle, eine Zeile je Datei. **Keine
  bestehende Abfrage fasst diese Tabellen an** — ein gelöschter Eintrag ist
  wirklich weg und liegt nur zusätzlich noch als Paket daneben. Deshalb gibt es
  auch **keinen** Zustand `geloescht` an `items`.
- `items.user_id` / `comments.user_id` / `test_days.user_id` /
  `ratings.user_id` / `links.user_id` / `attachments.user_id` — der Verfasser,
  an sechs Trägern. `papierkorb.geloescht_von` sieht aus wie ein siebter, ist
  aber keiner: es hält fest, **wer gelöscht hat**, so wie ein Zeitstempel
  festhält, wann — daran hängt kein Recht. Dasselbe gilt für
  `sicherheitsprotokoll.wer` und `.ziel`.
  `ON DELETE SET NULL` ist das Auffangnetz für ein `DELETE` von Hand: die
  Anwendung selbst entfernt keine Benutzerzeile, und herrenloser Bestand fällt
  beim Start an den Eigentümer

## Prüfen

```bash
npm install          # einmalig, holt zusätzlich jsdom für die Oberflächenprüfung
npm test
```

Der Prüfstand legt echte Server mit echten, verschlüsselten Datenbanken in
Wegwerfverzeichnissen an — `./data` bleibt unangetastet, alle Installationen entstehen
frisch über Einrichtungsseite und Verwaltung. Geprüft werden unter anderem die
Rechteschicht mit mehreren Zugängen nebeneinander, die Zugangsverwaltung samt
`zugang.js` als echtem Prozess, die Kriterienverwaltung samt Reihenfolge **und
Gewicht**, deren Wirkung auf Detailansicht, Vergleich und Export, die
Auslieferungsregeln für
Anhänge, **Fotos und Videos** — samt echtem Upload einer SVG sowie einer echten
MP4- und WebM-Datei und Kontrolle des ausgelieferten Bytestroms —, die
Range-Auslieferung samt ihrer Absagen, die Anmeldebremse in beiden
Proxy-Lagen sowie die mitwachsenden Textfelder im echten DOM.
**Dazu der Rundlauf des Papierkorbs** — ein Eintrag mit Foto,
Video, Dateien, Kommentaren aller Arten, Bewertungen und Testtagen mehrerer
Verfasser wird gelöscht, zurückgeholt und Feld für Feld gegen den
Ausgangsstand gehalten — und **die Sicherung an einer echten Installation**: die
Kopie entsteht, ist ohne Schlüssel nicht lesbar, mit Schlüssel vollständig, und
jeder abgewiesene Zielort hinterlässt nachweislich keine Datei.
**Dazu der Rundlauf des Einladungslinks** — anlegen, Link, Formular,
Passwort, Anmeldung, und **derselbe Link ein zweites Mal nicht** —, die
Nachschau, dass der Link selbst in **keiner Spalte keiner Tabelle** steht, die
sieben Tage an beiden Seiten, die Anmeldebremse vor der Anmeldung und „Meine
Sitzungen" mit zwei Benutzern zu je zwei Sitzungen.
**Dazu jeder der sieben schweren Wege einzeln** — ohne Bestätigung
abgewiesen, mit falschem Passwort abgewiesen, mit richtigem durch, und nach
jeder Verweigerung die Nachschau in der Datenbank, dass nichts geschrieben
wurde —, das Sicherheitsprotokoll mit einer Zeile je Vorgang und der Nachschau,
dass **kein Geheimnis in irgendeiner Spalte irgendeiner Zeile** steht, die
Frist an beiden Seiten, das Aufräumen an **beiden** Aufrufstellen (die für den
Start gegen einen echten Serverstart) und die öffentliche Adresse in beiden
Zuständen.
**Dazu der Rundlauf des Schlüsselwechsels** an echten,
verschlüsselten Installationen: wechseln, mit dem neuen Schlüssel lesen, mit dem alten
nicht mehr, Bestand Feld für Feld derselbe — dazu jede Lage, in der der Wechsel
**nicht** laufen darf, und in jeder davon die Nachschau, dass wirklich nichts
gewechselt wurde. **Der Abbruch mit `kill -9` mitten hinein** wird an rund 60 MB
nachgestellt, und die Dauer dafür wird **gemessen** statt geraten: ist der
Wechsel zu schnell zum Treffen, sagt die Prüfung genau das.
**Dazu der Mailversand am echten SMTP-Gespräch** — ein
SMTP-Empfänger aus Nodes `net` führt das Protokoll wirklich, und „angekommen"
heißt ein Brief, den er aufgehoben hat. **Er kann scheitern**, und das ist der
Punkt: annehmen, mit 550 ablehnen, gar nicht grüßen, grüßen und schweigen,
tröpfeln, sofort auflegen. Geprüft werden das **Offline-Prinzip in beide
Richtungen** (der Token entsteht auch dann, wenn der Versand fehlschlägt, und
der Link steht in der Antwort), die **Frist von zwanzig Sekunden** — gemessen,
nicht behauptet, und an einem tröpfelnden Empfänger, an dem nur die äußere
Schranke greift —, dass **ohne die öffentliche Adresse nichts hinausgeht** und
ein gefälschter `Host`-Kopf den Link nicht umbiegt, dass die **Testmail
ausschließlich an die eigene Adresse** geht (auch mit einem mitgegebenen Feld in
Rumpf, Abfrage oder Kopf), dass das **Mailpasswort in keiner Spalte, keiner
Protokollzeile und keiner Antwort** steht, und dass die **Frist ab dem ersten
Öffnen** wirklich nur beim ersten Öffnen schreibt.
**Dazu die Volltextsuche, je eine Lage für jede der sieben
Quellen** — mit erfundenen Suchwörtern, damit jede Trefferzahl **exakt** ist und
nicht „mindestens einer": fällt eine Quelle aus der Abfrage, wird genau sie
namentlich rot. Dazu die Schreibung samt **Umlauten in beide Richtungen**, ein
Teilstring aus einem einzigen Zeichen, **Prozentzeichen und Unterstrich als
Text samt der Gegenlage, dass man sie suchen kann**, und die Zusicherung, dass
jede Trefferliste eine **Teilmenge** der Liste ohne Suchbegriff ist —
nachgestellt an einem Eintrag, der vor dem Löschen gefunden wird und danach
nicht mehr. **Feld für Feld gegen eine namentliche Liste** wird geprüft, dass die Übersicht
nur noch mitschickt, was sie wirklich zeigt — samt der Nachschau, dass die
Kachelzahlen trotzdem stimmen. Am Bildschirm: dass **drei Anschläge hintereinander EINE
Anfrage** sind, dass der zuletzt getippte Begriff gewinnt, dass das Leeren
ohne Anfrage auskommt und dass die Liste **stehenbleibt**, wenn die Suche
scheitert.
**Dazu die Selbstanmeldung, vom Formular bis zum gesetzten
Passwort** — und die schwerste Zusage darin wird **gemessen, nicht behauptet**:
die fünf Lagen der Anfrage antworten mit demselben Statuscode und demselben
Rumpf **Byte für Byte**, und **keine davon wartet auf den Mailserver**,
nachgestellt an einem Empfänger, der den Versand zwanzig Sekunden festhält.
Dazu die Bestätigungsmail am echten SMTP-Gespräch samt ihrem Link im Fragment,
der Beleg, dass dieser Link **keinen Zugang, keinen Token und keine Sitzung**
entstehen lässt, der Deckel (die einundzwanzigste wird still verworfen), das
Verfallen an beiden Seiten, die Freischaltung mit der Rolle `user` **auch dann,
wenn eine andere in Rumpf, Abfrage oder Kopf mitgeschickt wird**, die Ablehnung
ohne Namen in der Protokollzeile, und dass die neue Tabelle sich an einer
bestehenden Installation beim Start selbst wieder anlegt — **eine Spalte dagegen
nicht**.

Die Dateien `pruefung.js` und `gegenprobe.js` sind per `.dockerignore`
ausgeschlossen und landen nicht im Image.

**Die Gegenproben laufen über `gegenprobe.js`** — ein eigener Aufruf, nicht Teil
von `npm test`:

```bash
node gegenprobe.js 3     # alle Rückbauten, drei Nebenspuren
```

Er baut jede geprüfte Sache **probeweise zurück**, in einer eigenen Kopie aus
`git archive HEAD`, und schreibt eine Tabelle: welcher Rückbau welche Prüfungen
namentlich rot gemacht hat. **Ein Rückbau, der keine einzige Prüfung rot macht,
ist ein Fund** — dann prüft die Prüfung nicht, was sie zu prüfen vorgibt.

**Reißt ein Lauf ab, statt rot zu werden, druckt die Tabelle die letzten Zeilen
seiner Ausgabe mit.** Die Kopie ist danach weg, und ein Abbruch ohne genannten
Grund sieht aus wie ein Fund, ist aber eine Sackgasse.

## Den Schlüssel wechseln

Es gibt genau einen Anlass dafür: **der Schlüssel ist in fremde Hand geraten.**
Der häufigste Weg dorthin ist der aus dem Abschnitt darüber — der Schlüssel lag
eine Weile als `data/encryption.key` neben der Datenbank, und irgendjemand hat
in dieser Zeit das Verzeichnis kopiert. Diese Kopie öffnet die Datei bis heute.
**Ein Wechsel ist das einzige Mittel dagegen**; die alte Schlüsseldatei zu
löschen hilft nur gegen künftige Kopien.

Gewechselt wird **auf dem Wirt**, im Projektverzeichnis:

```bash
./schluessel.sh zeigen       # Lage ansehen, ändert nichts
./schluessel.sh wechseln     # anhalten, sichern, wechseln, starten
```

> **„Keine Berechtigung"?** Dann fehlt dem Skript das Ausführungsrecht — das
> passiert beim Auspacken mit `python3 -m zipfile -e` und unter Windows. Einmal
> `chmod +x schluessel.sh`, und es ist erledigt; ohne das Recht geht auch
> `bash schluessel.sh zeigen`.

**Warum nicht auf Knopfdruck in der Oberfläche?** Zwei Gründe. Der Anlass ist
**einmalig** — ein dauerhafter Knopf für ein einmaliges Ereignis, und
ausgerechnet der eine, der bei falscher Handhabung **alles** verliert, wäre ein
schlechtes Tauschgeschäft. Und ein Knopf könnte die Sache gar nicht zu Ende
bringen: steht der Schlüssel in der `.env`, kennt die Anwendung den neuen Wert,
erreicht die Datei aber nicht — sie liegt auf dem Wirt und ist nicht einmal im
Image. Dort werden Datenbank und `.env` **in einem Zug** nachgezogen.

**Was das Skript tut, in dieser Reihenfolge:**

1. `.env` sichern (`.env.vor-schluesselwechsel-…`)
2. neuen Wert erzeugen (`openssl rand -hex 32`)
3. die Installation **anhalten** — ein laufender Server hält die Datenbank im
   WAL-Modus offen, und der Wechsel braucht `journal_mode = DELETE`
4. das Datenverzeichnis sichern (`../kriterion-data-vor-schluesselwechsel-…`)
5. wechseln, in einem Wegwerf-Container
6. **erst nach Erfolg** den neuen Wert eintragen — in die `.env` oder in
   `data/encryption.key`, je nachdem, woher der alte kam
7. die Installation starten

Danach ins Protokoll sehen:

```bash
docker compose logs --tail 30 kriterion
```

Erwartet wird „Schlüssel aus ENCRYPTION_KEY geladen." bzw. die Warnung, dass
der Schlüssel neben der Datenbank liegt.

> **PROBIER DEN WECHSEL AN EINER WEGWERFINSTANZ AUS, bevor du ihn an der echten
> fährst.** Es ist der einzige Vorgang im ganzen Projekt, bei dem ein Fehler
> alles kostet.

**Und die Probe muss an einem echten Bestand laufen, sonst belegt sie nichts.**
Ein Wechsel an einer leeren Datenbank ist in Millisekunden vorbei und sagt über
662 MB nichts. Die Probe unten nimmt deshalb eine **Kopie der echten Installation** —
mit ihrem Bestand **und ihrer `.env`**:

```bash
cd .../DockerAppData                       # eine Ebene über dem Projekt
docker compose -f kriterion/docker-compose.yml stop    # ruhige Kopie, offene WAL vermeiden
cp -a kriterion kriterion-probe
docker compose -f kriterion/docker-compose.yml start   # die echte darf sofort weiterlaufen

cd kriterion-probe
rm -rf kriterion-sicherung .git .env.vor-*   # data BLEIBT. .env BLEIBT.
sed -i 's/^    container_name: kriterion$/    container_name: kriterion-probe/' docker-compose.yml
sed -i 's/"3100:3000"/"3199:3000"/' docker-compose.yml
chmod +x schluessel.sh
docker compose up -d --build
# auf http://<server>:3199 anmelden — dieselben Zugänge, derselbe Bestand
./schluessel.sh wechseln
docker compose logs --tail 30 kriterion
```

> **`data/` und `.env` gehören zusammen — wer eines von beiden ersetzt, hat
> keine Probe mehr, sondern eine neue Installation.** Wird `data/` gelöscht und ein
> frischer Schlüssel erzeugt, wechselt das Skript den Schlüssel einer **leeren**
> Datenbank; das läuft durch und belegt nichts. Wird umgekehrt `data/` behalten
> und trotzdem ein frischer Schlüssel geschrieben, geht die Datenbank **gar
> nicht mehr auf** — dann scheitert nicht der Wechsel, sondern schon der Start.
> `schluessel.sh` selbst stört sich an einem vorhandenen `data/` nicht.

**Woran du erkennst, dass die Probe etwas wert war** — vier Zeilen, und alle
vier müssen stimmen:

| | erwartet |
|---|---|
| Ansage vor dem Wechsel | die **echte** Größe, z. B. `662.5 MB, erwartete Dauer rund 13 Sekunden` — nicht `0.2 MB` |
| nach dem Wechsel | `integrity_check: ok` |
| im Protokoll danach | `Läuft auf Port 3000 — Eigentümer: <dein Name>` — **nicht** „noch kein Zugang" |
| im Browser auf `:3199` | Einträge, Fotos, Kommentare vollständig; Karte „Sicherung" markiert die alten Kopien rot |

Danach die Probe wegräumen: `cd .. && docker compose -f kriterion-probe/docker-compose.yml down && rm -rf kriterion-probe`.
**Die `.env` der Probe niemals an die echte Installation zurückkopieren** — sie trägt
einen Schlüssel, zu dem nur die Probedaten passen.

### Zwei Schlüssel im Umlauf — die unangenehmste Falle

**Ab dem Wechsel gibt es zwei Schlüssel.** Jede Sicherung, die vorher entstanden
ist, bleibt mit dem **alten** verschlüsselt. Sie ist nicht kaputt — sie braucht
nur einen anderen Schlüssel als die laufende Installation. Wer das nicht weiß, hält
sie im Ernstfall für defekt und wirft sie weg.

Dagegen stehen drei Dinge:

* **Der alte Wert bleibt auskommentiert in der `.env` stehen**, mit Datum, mit
  dem Namen dessen, der gewechselt hat, und mit dem Satz, wofür er noch gut
  ist. **Nicht löschen, bevor er im Passwortspeicher steht.**
* **Die Karte „Sicherung" markiert jede Kopie rot, die älter ist als der
  Wechsel** — und wenn auch die jüngste älter ist, sagt sie das deutlicher:
  dann passt überhaupt keine, und es gehört sofort neu gesichert.
* **Der JSON-Export braucht keinen Schlüssel.** Er ist damit der einzige
  Rückweg, der von der ganzen Schlüsselverwaltung nichts wissen muss.

### Was der Wechsel nicht ist

Er wechselt den **Schlüssel**, nicht das Verfahren: SQLCipher bleibt, die
Schlüssellänge bleibt, `katalog.sqlite` bleibt, das Schema bleibt, die
Passwörter bleiben, und **niemand wird abgemeldet** — der Datenbankschlüssel
hängt an keinem Passwort.

Bricht der Wechsel mitten hinein ab (Stromausfall, `kill -9`), ist das
**folgenlos**: das Rollback-Journal stellt den alten Stand her, der **alte**
Schlüssel öffnet weiter, der neue wird abgewiesen. Es entsteht kein halber
Zustand. Geht dagegen das Journal verloren, ist alles verloren — **das** ist
der Grund für die Sicherung davor, nicht der Abbruch selbst. Das Journal
wächst dabei auf die Größe der Datenbank; reicht der Platz nicht, sagt das
Skript vorher ab und rührt nichts an.
