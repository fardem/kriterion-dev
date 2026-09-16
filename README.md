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
| **Zu mehreren arbeiten** | Benutzer mit drei Rollen; jeder Beitrag trägt seinen Verfasser |
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
chmod +x keytool.sh          # das Ausführungsrecht, siehe unten
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
docker compose up -d --build
```

Erreichbar unter `http://<server-ip>:3100`. **Der Port steht in der
`docker-compose.yml`**, nicht in der `.env`.

> **DIE `chmod`-ZEILE BRAUCHT NUR, WER MIT `python3 -m zipfile` AUSPACKT** —
> oder unter Windows. **`unzip` und `git clone` bringen das Ausführungsrecht
> mit.** *Fehlt es, antwortet `./keytool.sh` später mit „Keine
> Berechtigung"; dann hilft `chmod +x keytool.sh`.*

**Der Schritt `cp .env.example .env` ist Pflicht, auch wenn nichts darin steht.**
`docker compose` liest die Datei ein und bricht sonst ab, bevor der Container
startet. Alle Werte dürfen leer bleiben.

**Der Schritt `cp docker-compose.example.yml docker-compose.yml` ist Pflicht.**
Ohne die Datei bricht `docker compose up` mit
„no configuration file provided: not found" ab. **Die Vorlage liegt im Repo, die
Arbeitskopie nicht** — hier stehen Port, Einhängung des Sicherungsordners und
Containername, und das sind *deine* Werte. Wer sie in einer verfolgten Datei
bearbeitet, verliert sie beim nächsten Auspacken des ZIP.

> **BEIM AKTUALISIEREN GILT DASSELBE UMGEKEHRT.** Wer per `git pull`
> aktualisiert, sieht seine `docker-compose.yml` danach als **unverfolgte
> Datei**; wer das ZIP über den Ordner entpackt, **behält** sie ebenfalls.
> Ändert sich etwas an der Vorlage, steht es im `CHANGELOG.md`; verglichen wird
> dann von Hand mit `diff docker-compose.example.yml docker-compose.yml`.

**`--build` ist nicht optional**, auch beim ersten Mal nicht: der Quelltext
steckt im Image, nicht im eingehängten Verzeichnis.

### Der erste Zugang

**Beim ersten Aufruf im Browser** werden Benutzername und Passwort gesetzt.
Es gibt keine voreingestellte Kennung, und in der `.env` steht kein Passwort —
der Zugang liegt als scrypt-Hash in der verschlüsselten Datenbank. Mindestens
zehn Zeichen, sonst keine Regeln.

**Dieser erste Zugang wird der Eigentümer.** Ihm gehören Export, Import,
Rollenvergabe, der Mailzugang und der Schlüsselwert; alles Weitere steht unter
„Rollen und Benutzer".

### Was danach eingerichtet werden kann — und nichts davon muss

| | wo | wofür |
|---|---|---|
| **Titel der Installation** | Einstellungen › Installation, Karte „Titel" | zwei frei wählbare Titel: einer über der Anmeldeseite, einer in der Anwendung |
| **Bewertung: Kriterien** | Einstellungen › Bestand, Karte „Bewertung: Kriterien" | Name, Reihenfolge, Gewicht — sie erscheinen an jedem Eintrag |
| **Potenzial: Kriterien** | Einstellungen › Bestand, Karte „Potenzial: Kriterien" | dasselbe für den Kasten *vor* dem Test — zwei oder drei reichen |
| **Vokabular** | Einstellungen › Bestand, Karte „Vokabular" | fünfzehn Wörter der Oberfläche umbenennen, etwa „Eintrag" → „Modell" |
| **Weitere Benutzer** | Einstellungen › Benutzer, Karte „Benutzer" | anlegen oder über einen Einladungslink einladen |
| **Mailversand** | Einstellungen › Benutzer, Karte „Mailversand" | nur für Einladungslinks und Links zum Zurücksetzen; ohne ihn läuft alles weiter |
| **Sicherungsordner** | `docker-compose.yml` | Vorgabe liegt im Projektordner; die empfohlene Lage ist daneben — siehe „Sichern" |
| **Reverse Proxy** | `.env`, `BEHIND_PROXY=1` | nur wenn die Installation über einen Proxy und HTTPS nach außen geht. **Der Weg über `http://<server-ip>:3100` bleibt daneben offen** — siehe „Anmeldung" |

### Wenn niemand mehr hereinkommt

Der gewöhnliche Weg läuft über die Karte „Benutzer": ein Admin erzeugt einen
**Link zum Zurücksetzen**, und der Betreffende wählt sein Passwort selbst.
Kommt **niemand mehr** herein, hilft der Weg auf dem Server — nicht die `.env`:

```bash
docker compose exec kriterion node usertool.js passwort <name>
```

Das Passwort wird zweimal abgefragt und gleich dort gesetzt; alle Sitzungen
dieses Zugangs fallen, Bestand und Rolle bleiben unangetastet — der
Datenbankschlüssel hängt nicht am Passwort.

| Befehl | was er tut |
|---|---|
| `node usertool.js liste` | zeigt die vorhandenen Namen, ihre Rolle und ob der zweite Faktor an ist |
| `node usertool.js passwort <name>` | setzt ein neues Passwort |
| `node usertool.js zweifaktor <name>` | schaltet den zweiten Faktor **aus** — einschalten geht von dort ausdrücklich nicht |
| `node usertool.js entfernen <name>` | legt einen Zugang still |
| `node usertool.js eigentuemer <name>` | der Notausgang, wenn sich der bisherige Eigentümer nicht mehr anmeldet |

Läuft der Container gar nicht erst an, tut es
`docker compose run --rm kriterion node usertool.js …` ebenso.

Das alles setzt Zugriff auf den Server voraus und ist deshalb kein Umweg um die
Anmeldung. **Der Zugang lässt sich über keine Umgebungsvariable setzen oder
zurücksetzen** — `AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD` werden nicht
gelesen. Stehen sie in der `.env`, meldet der Start sie als entfernbar; sie
enthalten ein Passwort im Klartext und gehören heraus.
## Auf dem Server

**Drei Handgriffe laufen nicht am Bildschirm, sondern auf dem Server** — dort,
wo `docker compose` läuft. Die Oberfläche nennt sie nur dem **Eigentümer**, in
vier Kästen „Auf dem Server" mit Kopierknopf; Benutzer und Admins sehen weder
den Befehl noch eine Erklärung dazu.

| Handgriff | Befehl | wo der Kasten steht |
|---|---|---|
| **Ein vergessenes Passwort zurücksetzen** — wenn kein Admin mehr hereinkommt | `docker compose exec kriterion node usertool.js passwort <name>` | Karte „Mein Konto" und Karte „Benutzer" |
| **Den zweiten Faktor eines Benutzers ausschalten** — wenn Handy und Wiederherstellungscodes weg sind | `docker compose exec kriterion node usertool.js zweifaktor <name>` | Karte „Mein Konto", beim zweiten Faktor |
| **Den Schlüssel in die `.env` nehmen** und danach neu starten | `docker compose up -d` | Karte „Kennzahlen", solange der Schlüssel neben der Datenbank liegt |

Die beiden `usertool.js`-Befehle fragen auf dem Server nach, bevor sie etwas
tun, und stehen danach im Sicherheitsprotokoll als „per Kommandozeile am
Server". Was `usertool.js` sonst kann (`liste`, `entfernen`, `eigentuemer`),
steht im Kopf der Datei.

## Der Schlüssel — bitte einmal aufmerksam lesen

Hier entscheidet sich, ob die Verschlüsselung tatsächlich schützt.

**Ohne eigenen Schlüssel** wird beim ersten Start automatisch einer erzeugt und
unter `data/encryption.key` abgelegt — also **direkt neben der Datenbank**. Das
genügt gegen zufälliges Durchklicken im Dateisystem. Es genügt **nicht**, wenn
jemand das Verzeichnis `data` kopiert: Er hat dann Daten und Schlüssel beisammen
und kann alles lesen.

**Soll eine kopierte Datenbank unlesbar bleiben**, muss der Schlüssel in die
`.env`. Die Einstellungen zeigen dem Eigentümer den **bereits erzeugten** Wert zum Abschreiben (Karte „Kennzahlen") —
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

**Hier geht es in der Praxis schief:** Wer anschließend den kompletten
Projektordner sichert, hat die `.env` mit in der Sicherung — und damit den
Schlüssel wieder neben den Daten.

> **Merksatz:** `.env` und `data/` gehören **nicht** in dieselbe Sicherung.
> Den Schlüssel getrennt aufbewahren, zum Beispiel im Passwortspeicher.
> **Das gilt auch für die Sicherung auf Knopfdruck:** ihre Kopie ist
> verschlüsselt und ohne den Schlüssel wertlos — der Sicherungsordner ist deshalb nicht
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
> die Sicherung Empfehlung und nicht Pflicht.
>
> **WER VON EINER FASSUNG VOR 0.33.0 KOMMT, GEHT ZUERST ÜBER 0.32.1.** Bis
> dahin rüstete der Start jede fehlende Spalte selbst nach; heute tut er es
> nicht mehr. Der Weg ist: einmal mit 0.32.1 öffnen, hochkommen lassen, wieder
> anhalten.
>
> **Und die Instanz sagt es, wenn etwas fehlt.** Steht im Protokoll ein Kasten
> „this database is incomplete", nennt er jede fehlende Spalte samt der
> Fassung, die sie gebracht hätte. **Sie startet trotzdem** — aber jede Seite,
> die eine der genannten Spalten liest, scheitert.
>
> **Niemand wird abgemeldet, und einzustellen ist nichts.**

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
chmod +x kriterion/keytool.sh          # python3 legt das Recht nicht an
cd kriterion && docker compose up -d --build
```

**Danach ins Protokoll sehen** (`docker compose logs kriterion`): dort muss
„Schlüssel aus ENCRYPTION_KEY geladen" stehen. Steht stattdessen die Warnung
über eine Schlüsseldatei neben den Daten, wurde die `.env` nicht gelesen —
dann sofort anhalten und nachsehen, **bevor** etwas geschrieben wird.

### Prüfen, ob wirklich die neue Version läuft

Die Versionsnummer allein genügt nicht:

```bash
curl -s http://localhost:3100/api/config
```

Diese Zahl kommt aus der `package.json` und sagt über die übrigen Dateien
nichts.

**Dafür gibt es den Fingerprint.** Der Server bildet beim Start eine kurze
Prüfsumme über alles, was er lädt und ausliefert, und meldet sie unter
`fingerprint` in `GET /api/stats` — angemeldet, in der Karte „Kennzahlen"
(Reiter „Datenbank"). Der Sollwert steht zu jeder Version im
Änderungsprotokoll (`Doku/Aenderungsprotokoll_<Version>.md`, Zeile
„Fingerprint …").

Stimmt er nicht überein, ist der Dateisatz nicht der, der gemeint war — dann
hilft nur, ihn **vollständig** erneut einzuspielen. **Er schlägt in beide
Richtungen aus: auch eine Datei zu viel ändert ihn.**

**Weicht er ab, findest du die Ursache so** — im Projektverzeichnis oder im
Container (`docker compose exec kriterion sh`):

```bash
for f in attachments.js auth.js batchrun.js images.js db.js keys.js mail.js \
         package.json server.js twofactor.js public/*; do
  printf "%-26s %s\n" "$f" "$(sha256sum "$f" | cut -c1-8)"
done
```

Das sind **genau die Dateien, über die der Fingerprint geht**, und sonst keine.
Löschen bzw. ersetzen und `docker compose up -d --build`, denn der Quelltext
steckt im Image.

**Das geht auch ohne Shell.** Unter dem Fingerprint steht in der Karte
„Kennzahlen" ein Verweis **„Dateien zeigen"**; er klappt dieselbe Liste auf —
Name und Prüfsumme, achtzehn Zeilen, dieselben acht Zeichen wie oben.

Solange niemand auf den Verweis drückt, steht dort nichts. Der Sollwert steht
im Änderungsprotokoll, verglichen wird mit dem Auge.

Ändert eine Version die Marke der Installation, zeigt der Browser im Reiter
noch die alte — ein hartes Neuladen (Strg+Umschalt+R) räumt den
Zwischenspeicher weg.

### Wenn eine Version die Datenbank anfasst

**Eine fehlende Tabelle legt der Start selbst an. Eine fehlende Spalte dagegen
nicht.** Was der Start stattdessen tut, ist nachsehen: fehlt eine, schreibt er
einen Kasten ins Protokoll, der sie beim Namen nennt — mit der Fassung, die sie
gebracht hätte, und der Fassung, über die zuerst zu gehen wäre. **Die Zeile
kommt bei jedem Start**, solange die Spalte fehlt. **Die Anwendung startet
trotzdem** — aber jede Seite, die eine der genannten Spalten liest, scheitert.

**Ein Downgrade ist dann keine reine Dateikopie mehr** — deshalb die Sicherung
davor. Eine ältere Fassung sieht zusätzliche Tabellen und Spalten gar nicht an;
was darin steht, bleibt stehen, aber niemand zeigt es mehr.

**Vorausgesetzt wird eine Datenbank aus Version 0.8.0 oder neuer.** Ein älterer
Bestand wird nicht übernommen; er braucht den Zwischenschritt über 0.8.0, die
letzte Version, die ihn noch lesen konnte.

### Die alten Namen in der `.env`

**Drei Werte hießen früher deutsch. Die alten Namen werden weiter gelesen.**

| früher | heute | wo er steht |
|---|---|---|
| `HINTER_PROXY` | `BEHIND_PROXY` | `.env` |
| `OEFFENTLICHE_ADRESSE` | `PUBLIC_ADDRESS` | `.env` |
| `SICHERUNG_DIR` | `BACKUP_DIR` | `docker-compose.yml` |

**Eine `.env` von gestern gilt unverändert weiter.** Steht der alte Name da,
wird er gelesen, und die Instanz schreibt beim Start eine Zeile ins
Containerprotokoll:

```
[Kriterion] HINTER_PROXY heisst jetzt BEHIND_PROXY — der alte Name wird noch
gelesen. Bitte in der .env nachziehen.
```

**Wer beide setzt, bekommt den neuen.**

## Verschlüsselung

Die **gesamte Datenbankdatei** ist verschlüsselt (SQLCipher, AES-256). Ohne
Schlüssel meldet selbst ein Datenbankwerkzeug nur „file is not a database" —
lesbar ist nichts, auch nicht die Tabellenstruktur, Kategorienamen, Zeitstempel
oder Bildgrößen. Fotos **und Videos** liegen mit in der Datenbank und werden
nie als Datei auf die Platte geschrieben; der Upload läuft über den
Arbeitsspeicher.

Innerhalb der geöffneten Datenbank steht alles im Klartext; die Suche läuft
deshalb über sämtliche Felder.

## Anmeldung

Ohne gültige Anmeldung ist außer dem öffentlichen Titel nichts zu sehen: keine
Einträge, keine Kategorien, keine Zahlen. Auch die Schnittstellen liefern ohne
Sitzung nichts aus, Fotos, Videos und Export eingeschlossen. Sitzungen laufen nach 30
Tagen ab.

Nach mehreren Fehlversuchen antwortet die Anmeldung verzögert, nach zehn
Fehlversuchen von derselben Adresse für einige Minuten gar nicht mehr.
Gezählt wird zusätzlich je Benutzername — dort wird nur verzögert, nie
gesperrt: eine harte Namenssperre ließe sich gegen fremde Konten richten.
**Dieselbe Bremse steht vor dem Einlösen eines Einladungslinks oder eines
Links zum Zurücksetzen** — dort ohne die Hälfte je Benutzername, denn ein Link
nennt keinen. Was dabei abgewiesen wird — abgelaufen, schon eingelöst,
erfunden, oder der Zugang ist gesperrt —, beantwortet die Installation **immer
gleich**: „Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen
anfordern." In allen vier Fällen ist dasselbe zu tun.

**Die zweite Bestätigung greift auch hinter der Anmeldung** — vor jedem Weg,
der die Installation als Ganzes trifft; die Liste steht unter „Rollen und
Benutzer".

### Der zweite Faktor, freiwillig

**Wer will, sichert seinen Zugang zusätzlich mit einem Code aus einer App auf
seinem Telefon.** Der Code entsteht dort **ohne Netz**, aus einem Geheimnis und
der Uhr, und ist alle dreißig Sekunden ein anderer. **Die Installation schickt
dafür nichts hinaus** — kein Code per Mail, kein Code per SMS.

> **OHNE ZWEITEN FAKTOR LÄUFT DIE INSTANZ VOLLSTÄNDIG.** Er ist freiwillig und
> steht je Zugang; ab Werk ist er aus. **Und niemand kann ihn für einen anderen
> ein- oder ausschalten** — auch der Eigentümer nicht.

**Wo er eingeschaltet wird:** in den Einstellungen, in der Karte **„Mein
Konto"**. Der Zustand steht dort ohne Klick: „an seit …" oder „aus", dazu die
Zahl der übrigen Wiederherstellungscodes.

**Was auf dem Telefon zu tun ist**, in drei Schritten:

1. Eine App installieren, die TOTP nach RFC 6238 kann — **Google
   Authenticator**, Aegis, 1Password, die Passwörter-App von iOS.
2. In der Karte „Zugang" auf **„Zweiten Faktor einschalten"** und das bisherige
   Passwort eingeben. Es erscheint ein Schlüssel in **Vierergruppen**. Am
   Telefon führt der Knopf **„In der App öffnen"** unmittelbar hinein; am
   Rechner wird der Schlüssel von Hand eingetragen — die Leerzeichen gehören
   nicht dazu.
3. Den **sechsstelligen Code** aus der App in das Feld darunter eintragen und
   auf **„Einschalten"**. Erst damit ist er an.

**Ab dann fragt die Anmeldung in zwei Schritten** — erst Passwort, dann Code.
Ein Code gilt **genau einmal**; Uhren dürfen um eine halbe Minute
auseinanderlaufen. Dieselbe Frage steht vor den schweren Wegen (Export, Import,
Rollen, fremde Passwörter) und beim Einlösen eines Links zum Zurücksetzen.

**Die Wiederherstellungscodes.** Beim Einschalten erscheinen **acht** Codes zu
je zehn Zeichen. Sie werden genau einmal angezeigt und kommen nicht wieder: in
der Datenbank steht nur ihr Hash. Jeder trägt genau einmal und ersetzt dabei
den Code aus der App.

> **Schreib sie auf und leg sie dorthin, wo dein Telefon NICHT liegt.** Ohne
> sie ist ein verlorenes Telefon ein verlorener Zugang.

Die Karte nennt jederzeit, wie viele noch übrig sind. **Neue gibt es auf
Knopfdruck** — hinter Passwort und einem gültigen Code; die alten verfallen
dabei alle.

**Und wenn Telefon und Codes weg sind:** der Weg über den Server, derselbe wie
beim vergessenen Passwort:

```bash
docker compose exec kriterion node usertool.js zweifaktor <name>
```

Er schaltet den zweiten Faktor **aus** und lässt Passwort, Rolle und Bestand in
Ruhe. **Einschalten geht von dort nicht.**

Die Kopie über die Karte „Sicherung" enthält den gesamten Datenbestand und damit
auch die Geheimnisse der zweiten Faktoren — verschlüsselt, wie Passwörter und
Sitzungen auch. Der **JSON-Export** enthält sie nicht.

#### Hinter einem Reverse Proxy

Wird Kriterion über einen Reverse Proxy nach außen gegeben, dann **nur über
HTTPS**. Und dann gehört `BEHIND_PROXY=1` in die `.env`.

Ein Reverse Proxy nimmt die Verbindung des Besuchers entgegen und öffnet eine
eigene zum Container; Kriterion sieht deshalb immer nur den Proxy. Die Adresse
des Besuchers kommt allein als Header `X-Forwarded-For` an. **Gelesen wird er
nur, wo `BEHIND_PROXY=1` gesetzt ist.**

| | `BEHIND_PROXY` fehlt (Vorgabe) | `BEHIND_PROXY=1` |
|---|---|---|
| `X-Forwarded-For` und `X-Forwarded-Proto` | werden **nicht angesehen** | werden gelesen |
| Adresse des Aufrufers | die tatsächliche Verbindung | der **letzte** Eintrag aus `X-Forwarded-For` |
| `http://` in `PUBLIC_ADDRESS` | wird hingenommen | **Warnung beim Start**, keine Absage |
| richtig für | direkt im Heimnetz, Port 3100 | Betrieb hinter einem Proxy, HTTPS |

Der **letzte** Eintrag der Kette und nicht der erste: ein Proxy hängt die
Gegenstelle, die er wirklich sieht, hinten an. Der Start sagt im Protokoll,
welche Lage gilt: `Hinter Proxy: an` oder `Hinter Proxy: aus`.

#### Beide Wege zugleich

**Der Name des Sitzungscookies, `Secure` und `Strict-Transport-Security` hängen
nicht an der Einstellung, sondern an der einzelnen Anfrage** — am Kopf
`X-Forwarded-Proto`:

| | über den Proxy (HTTPS) | direkt, `http://<server-ip>:3100` |
|---|---|---|
| Sitzungscookie | `__Host-kriterion_session` | `kriterion_session` |
| `Secure` | ja | nein |
| `Strict-Transport-Security` | `max-age=31536000` | nein |

**Beide Wege stehen damit offen, mit derselben Einstellung.** Du kannst dich
über HTTPS anmelden und im selben Browser über das Heimnetz; ein Abmelden
beendet beide.

Das Präfix `__Host-` setzt der Browser nur über HTTPS, ohne Domain, mit
`Path=/`. **Jede Anfrage liest genau einen der beiden Namen.**

**Das Umlegen von `BEHIND_PROXY` meldet alle einmalig ab, die über HTTPS
kommen** — ihr Cookiename wird dann nicht mehr gelesen. Kein Datenverlust, nur
eine neue Anmeldung.

**Fällt der Proxy aus, ist nichts zu tun.** Läuft ein Zertifikat ab oder klemmt
der Name im DNS, geht `http://<server-ip>:3100` von selbst.

**Was die Einstellung nicht ist:** eine Liste, wer den Kopf setzen darf. Bleibt
der Port des Containers im eigenen Netz erreichbar, kann dort jemand von Hand
einen `X-Forwarded-For` mitschicken und die Anmeldebremse umgehen. Wer das
ausschließen will, gibt den Port nicht mehr im Netz frei.

#### Gescheiterte Anmeldungen aussperren

Die Anmelderoute antwortet unterscheidbar, und das genügt einem Wächter davor:

| Antwort | heißt |
|---|---|
| **401** | Name oder Passwort falsch |
| **429** | ausgebremst — zu viele Versuche |
| **403** | Passwort richtig, Zugang gesperrt |

Ein CrowdSec-Szenario auf `POST /api/login`, das auf 401, 403 und 429 achtet,
sperrt die Adresse damit heute — es liest das Zugriffsprotokoll des Proxys.

**Die Rotation des Containerprotokolls ist Dockers Sache.** Vier Zeilen in der
`docker-compose.yml`:

```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
```

**Das Sicherheitsprotokoll der Installation räumt sich selbst** — es hält 180
Tage, geprüft beim Start und jedes Mal, wenn die Karte geöffnet wird.

### Rollen und Benutzer

Drei Rollen als Leiter: **Benutzer** < **Admin** < **Eigentümer**. Wer die
Installation einrichtet, ist ihr Eigentümer; das Recht ist eine Rolle und lässt
sich vergeben. Solange nur ein Benutzer besteht, ist er alles zugleich.

- **Benutzer** — schreibt eigene Beiträge: Einträge, Kommentare, Bewertungen,
  Testtage, Favoriten.
- **Admin** — verwaltet zusätzlich, was an *allen* Einträgen erscheint: die
  Kriterien beider Kästen, Tags und Kategorien, beide Titel, Vokabular und die
  Suchmaschinen. Er darf fremde Beiträge löschen, aber nicht umschreiben, und
  er verwaltet die Benutzer — nicht die Admins und nicht den Eigentümer.
- **Eigentümer** — alles davon, dazu Export, Import, der angezeigte
  Schlüsselwert und das Vergeben von Rollen.

Verwaltet wird in der Karte **„Benutzer"** in den Einstellungen, Reiter
„Benutzer": anlegen, sperren und entsperren, Passwort zurücksetzen, Rolle
wechseln, löschen. Drei Regeln stehen serverseitig fest:

- **Ein Admin kommt nicht an seinesgleichen.** An einen anderen Admin oder den
  Eigentümer kommt nur der Eigentümer.
- **Der letzte aktive Eigentümer bleibt** — weder herabstufbar noch sperrbar
  noch entfernbar, solange kein zweiter bestimmt ist.
- **Niemand sperrt oder entfernt sich selbst.**

Sperren wirkt sofort: die laufende Sitzung fällt, und die Anmeldung nennt den
Grund erst nach dem richtigen Passwort. Offene Einladungslinks und Links zum
Zurücksetzen dieses Benutzers verfallen mit.

#### Einen Benutzer anlegen — die Wahl steht im Formular

Neben dem Namensfeld steht ein Auswahlfeld mit zwei Möglichkeiten. Es bestimmt,
was der Knopf daneben tut und welche Felder erscheinen.

**„Benutzer wählt Passwort selbst (per Link)" — die Vorgabe.** Es gibt kein
Passwortfeld; der Knopf heißt **„+ Anlegen und Link erzeugen"**. Der Benutzer
entsteht ohne Passwort, und darunter erscheint ein Link zum Kopieren. Wer ihn
öffnet, wählt sein Passwort selbst und ist danach angemeldet. In der Liste
steht bei ihm „noch kein Passwort", bis er den Link eingelöst hat.

**„Ich vergebe das erste Passwort".** Erst dann erscheint das Passwortfeld, und
der Knopf heißt **„+ Anlegen"**. Wechselst du zurück, verschwindet das Feld
wieder, und was darin stand, wird geleert.

> **Wer den Link hat, kann das Passwort setzen.** Er gilt **sieben Tage** und
> **einmal**; nach der Weitergabe steht er in dem Verlauf, über den du ihn
> geschickt hast. Er wird nur einmal angezeigt; ist er weg, erzeugst du einen
> neuen.

**Eine zweite Frist daneben: ab dem ersten Öffnen bleiben fünfzehn Minuten.**
Solange niemand geöffnet hat, laufen die sieben Tage weiter. Innerhalb der
fünfzehn Minuten darf beliebig oft geöffnet und neu geladen werden; nur der
erste Aufruf startet die Uhr. Wer die Frist verstreichen lässt, holt sich einen
neuen Link — der Zugang bleibt stehen und trägt weiter „noch kein Passwort".

Das Feld daneben ist **optional**: trägst du eine E-Mail-Adresse ein, schickt
die Installation den Link zusätzlich dorthin, sofern ein Mailzugang eingerichtet
ist. Der Link steht trotzdem zum Kopieren da, auch wenn der Versand
fehlschlägt. **Ändern darf die Adresse danach allein der Betreffende selbst**,
in den Einstellungen unter „Mein Konto": sie entscheidet, wohin sein nächster
Link zum Zurücksetzen geht.

> **Die Karte „Mein Konto" sagt am Adressfeld, was gerade gilt.** Ist die
> Registrierung aus, steht dort *(optional)*; ist sie an, *(erforderlich)*.
> Der Weg über den Server steht nur beim Eigentümer, im Kasten „Auf dem
> Server"; alle anderen lesen stattdessen, dass ein Admin einen Link zum
> Zurücksetzen erzeugen kann.

#### Ein Passwort zurücksetzen — ebenfalls zwei Wege

- **🔗 Link zum Zurücksetzen** — derselbe Weg wie bei der Einladung. Das
  bisherige Passwort gilt weiter, bis der Link eingelöst wird; danach fallen
  alle Anmeldungen dieses Zugangs.
- **🔑 Passwort direkt setzen** — du gibst eins ein und sagst es. Alle
  Anmeldungen dieses Zugangs fallen sofort.

Kommt niemand mehr herein, hilft der Weg über den Server:
`docker compose exec kriterion node usertool.js passwort <name>`.

#### Wohin der Link zeigt — `PUBLIC_ADDRESS`

Den vollständigen Link baut der Browser des Admins aus der Adresse, an der er
ohnehin steht. Das ist die Vorgabe und braucht keine Einstellung. Es hat eine
Bruchstelle: wer über `http://192.168.1.50:3100` arbeitet und einen Link nach
draußen gibt, gibt einen Link ins Leere.

Dagegen steht eine **optionale** Zeile in der `.env`:

```bash
PUBLIC_ADDRESS=https://kriterion.beispiel.de
```

Ist sie gesetzt, gibt der Server den fertigen Link heraus; ist sie leer, baut
ihn der Browser. Der Kasten, aus dem du den Link kopierst, sagt in einer Zeile
darunter, woher die Adresse kam.

Schema und Rechnername sind Pflicht, ein Pfad ist erlaubt, alles ab `?` und `#`
wird abgewiesen. **Ein unbrauchbarer Wert bricht den Start nicht ab**: er wird
im Protokoll gemeldet, und der Browserweg trägt weiter.

Die Zeile steht in der `.env` und nicht in den Einstellungen: sie entscheidet
über Netzwerkvertrauen wie `BEHIND_PROXY`. Die Einstellungen zeigen sie, sie
setzen sie nicht.

**Für den Versand ist sie Pflicht, für den Start nicht.** Ohne sie verschickt
die Installation keine Links; die Links stehen weiterhin zum Kopieren da. Die
Karte „Mailversand" markiert den fehlenden Wert rot und nennt den Grund.

**Und sie ist die Voraussetzung der Registrierung:** der Schalter lässt sich
ohne diesen Wert nicht einschalten. Die Testmail enthält keinen Link und geht
auch ohne die Adresse durch — ihre Marke könnte grün sein, während jede
Bestätigungsmail ins Leere liefe.

#### Mailversand

**E-Mail ist optional.** Ohne Mailzugang läuft Kriterion vollständig, rein
offline, und es fehlt keine Funktion: Einladungslinks und Links zum Zurücksetzen
stehen in den Einstellungen zum Kopieren. Mit Mailzugang gehen dieselben Links
zusätzlich per Mail hinaus; schlägt das fehl, bricht nichts ab — im Kasten steht
„Versand fehlgeschlagen" samt Grund, und der Link daneben.

**Nur ausgehend.** Kein Empfang, kein offener Port, kein Abholen. Es gibt genau
**zwei Anlässe** für eine Mail: den Tokenlink und die Testmail. Keine
Benachrichtigungen, keine Zählpixel, kein HTML — reiner Text.

**Der Mailzugang gehört dem Eigentümer, ganz.** Eintragen, einsehen und die
Testmail auslösen liegen bei ihm; ein Admin kommt an keines davon — der
SMTP-Server sieht jede Mail, und jede trägt einen Link, der ein Passwort setzt.
Was der Admin bekommt, ist die Auskunft neben dem Link: ob etwas hinausging und
warum nicht.

**Die Karte „Mailversand" zeigt, der Dialog stellt ein.** In den Einstellungen
unter **Benutzer** steht die Karte und sagt in fünf Zeilen, woran man ist:

| Zeile | |
|---|---|
| **Zustand** | eingerichtet oder nicht eingerichtet |
| **Anbieter** | Name, Server mit Port und Verschlüsselung in einer Zeile |
| **Absender** | die Absenderadresse |
| **Öffentliche Adresse** | der Wert aus der `.env`, auf den die Links zeigen |
| **Zuletzt erfolgreich getestet** | wann die letzte Testmail durchkam |

Darunter zwei Knöpfe: **„Mailzugang einrichten"** beziehungsweise **„Mailzugang
ändern"** — und **„Testmail an mich"**.

**Der Dialog fragt der Reihe nach:**

| Feld | |
|---|---|
| **Anbieter** | GMX, Web.de, Gmail, Strato, IONOS oder „Eigener Server" |
| **Server, Port, Verschlüsselung** | bei einer Vorlage stehen sie nur da und sind kein Feld; einzutragen sind sie ausschließlich bei „Eigener Server" |
| **Benutzername, Passwort** | dein Zugang beim Anbieter |
| **Absenderadresse** | muss zum Konto gehören |

**Wer eine der fünf Vorlagen nimmt, füllt drei Felder** — Benutzername,
Passwort, Absenderadresse. Server, Port und Verschlüsselung stehen fest und
werden aus der Vorlage gelesen; wechselt der Anbieter morgen den Port, kommt der
neue mit dem nächsten Kriterion und nicht aus deiner Datenbank.

**Speichern verlangt dein eigenes Passwort** — und, wenn du den zweiten Faktor
eingeschaltet hast, zusätzlich einen Code.

**Das Passwort wird nie angezeigt** — nie der Wert, nie die Länge, nie der
Anfang. Beim Speichern bedeutet ein leeres Passwortfeld „unverändert lassen". Es
steht in der **verschlüsselten Datenbank**, nicht in der `.env`, und wandert
weder in eine Exportdatei noch in eine Protokollzeile.

Drei Hinweise, an denen die meisten Versuche scheitern:

- **Gmail** verlangt Zwei-Faktor und ein **App-Passwort**; das Kontopasswort
  wird abgewiesen.
- **GMX** und **Web.de** verlangen, den Versand über fremde Programme im Konto
  erst **freizuschalten**.
- **Die Absenderadresse muss zum Konto gehören.**

**Immer über den SMTP-Server eines Anbieters, nie unmittelbar vom eigenen
Internetanschluss.** Dort fehlen rDNS und SPF/DKIM, und die Mail landet im
besten Fall im Spam. Dieser Satz steht auch im Dialog, bei „Eigener Server".

##### Die Mail kommt an und landet trotzdem im Spam

Ob ein Empfänger sie annimmt, entscheidet er an einer Frage: **deckt die Domain
des Absenders diesen Versand?** Der typische Fall: du versendest über den
SMTP-Server deines Anbieters, aber als Absender steht deine eigene Domain darin
— und in deren Namensdienst steht nichts, was diesen Anbieter erlaubt.

**Drei Einträge im Namensdienst (DNS) räumen das aus.** Sie gehören zur
**Domain**, nicht zu Kriterion:

| | was er sagt |
|---|---|
| **SPF** | **wer für diese Domain senden darf** — ein `TXT`-Eintrag, der die Server deines Anbieters nennt |
| **DKIM** | **eine Unterschrift unter jeder Mail**, die der Empfänger gegen einen öffentlichen Schlüssel im Namensdienst prüft |
| **DMARC** | **was mit einer undeckten Mail geschehen soll** — und wohin die Berichte darüber gehen |

**Die Werte kommen vom Anbieter, über den du sendest**, und stehen dort in der
Anleitung zu „eigene Domain" oder „Absenderdomain verifizieren".

Ein Dienst wie Brevo oder Postmark hilft, **weil er die drei Einträge mitbringt
und von Adressen sendet, denen die Empfänger schon trauen.** Kriterion braucht
dafür keine Zeile Code: diese Dienste sprechen SMTP — Wirt, Port, Konto,
Passwort in die Karte „Mailversand".

> **PRÜFEN LÄSST SICH DAS OHNE KRITERION.** Schick eine Testmail an ein
> Gmail-Konto, öffne sie dort und sieh dir „Original anzeigen" an: in der
> Kopfzeile stehen `spf=`, `dkim=` und `dmarc=` mit `pass` oder `fail`. Steht
> dort dreimal `pass` und die Mail landet trotzdem im Spam, liegt es nicht an
> der Deckung.

**Der Testmail-Knopf geht ausschließlich an die Adresse deines eigenen Kontos.**
Es gibt kein Adressfeld daneben. Hast du für dein Konto keine Adresse
hinterlegt, sagt die Absage das und nennt den Weg — Einstellungen, Karte „Mein
Konto".

Antwortet der Mailserver nicht, **bricht der Versuch nach zwanzig Sekunden ab**
und die Antwort kommt trotzdem. Der Token entsteht dabei zuerst: der Link steht
in jedem Fall da.

#### Registrierung

**Niemand kommt durch die Registrierung herein, ohne dass ein Admin ihn
hereinlässt.** Das ist der Satz, unter dem alles Weitere steht. Es gibt keine
Betriebsart, in der ein geklickter Link allein freischaltet — Kriterion ist ein
Archiv für eine kleine Gruppe, kein Forum.

**Und die Installation läuft ohne all das vollständig.** Ist die Registrierung aus,
legt eben nur der Admin Benutzer an. Es fehlt keine Funktion, und der Schalter
steht ab Werk auf **aus**.

**Der Weg, vom Formular bis zum Passwort:**

1. **Anfrage.** Auf der Anmeldeseite steht unter „Anmelden" ein zweiter Knopf:
   **„Zugang anfragen"**, darüber die Frage „Noch keinen Zugang?". Das Formular
   dahinter hat zwei Felder — Benutzername und E-Mail-Adresse — und **kein
   Passwortfeld**. **Geprüft wird die FORM, und zwar an beiden Enden:** ein
   leeres Feld und eine Zeichenfolge ohne `@` werden abgewiesen, im Browser
   und noch einmal im Server. *Über den Bestand sagt diese Absage nichts —
   ob ein Name frei ist, erfährt man daraus nicht:* **Form ist öffentlich,
   Existenz ist es nicht.**
2. **Bestätigungsmail.** Die Installation schickt einen kurzen Link an die
   angegebene Adresse. Er **öffnet keinen Zugang und setzt kein Passwort**; wer
   ihn anklickt, sagt nur „ja, das bin ich". Er gilt **24 Stunden**.
3. **Warteschlange.** Erst die **bestätigte** Anfrage erscheint beim Admin, in
   der Karte **„Anfragen"** in den Einstellungen. Unbestätigte verfallen nach 24
   Stunden und werden nie angezeigt. **Die Karte steht dort immer** — auch wenn
   die Registrierung aus ist; in ihr sitzt schließlich der Schalter.
4. **Freischalten oder ablehnen.** Beim Freischalten entsteht ein Benutzer mit
   der Rolle **Benutzer** — nie mit einer anderen — samt Einladungslink; beim
   Ablehnen verschwindet die Zeile, und es entsteht nichts.
5. **Passwort setzen.** Über den Einladungslink, auf dem bekannten Weg: sieben
   Tage gültig, genau einmal, ab dem ersten Öffnen fünfzehn Minuten.

**Zwei Dinge müssen stehen, bevor sich der Schalter überhaupt einschalten
lässt** — und beides prüft die Installation selbst, statt es zu empfehlen:

- **Ein Mailzugang, mit dem eine Testmail wirklich durchgekommen ist.** Ändert
  sich danach irgendetwas am Mailzugang, gilt der Beleg nicht mehr, und der
  Schalter lässt sich erst nach einer neuen Testmail wieder einschalten.
- **`PUBLIC_ADDRESS` in der `.env`.** Ohne sie wüsste der Server nicht,
  worauf der Bestätigungslink zeigen soll. Die Testmail allein genügt als
  Beleg **nicht**: sie enthält gar keinen Link und geht auch ohne diesen Wert
  durch.

**Ausschalten geht dagegen immer.** Und geht der Versand später kaputt, **bleibt
der Schalter an** — die Karte sagt es in einer roten Zeile. Ein Schalter, der
sich von selbst umlegt, stünde anders da, als ihr ihn gestellt habt, und
niemand wüsste, wann das passiert ist.

**Was die Registrierung nicht preisgibt:** die Antwort auf eine Anfrage sieht
**immer gleich aus** — ob der Name frei war, ob er vergeben ist, ob die Adresse
schon an einem Konto hängt, ob gerade zwanzig Anfragen offen sind oder ob der
Schalter aus ist. Andernfalls wäre das Formular ein bequemes Werkzeug, Namen und
Adressen durchzuprobieren, und zwar ohne Passwort davor. Dazu greift dieselbe
**Anmeldebremse** wie an der Anmeldung, und höchstens **zwanzig** Anfragen
liegen gleichzeitig; die einundzwanzigste wird still verworfen.

**Wer eine Bestätigungsmail bekommt, ohne etwas angefragt zu haben, muss nichts
tun** — die Mail sagt das auch. Ohne den Klick geschieht nichts, und die Anfrage
verfällt von selbst.

#### Meine Sitzungen

Die Karte **„Meine Sitzungen"** in den Einstellungen steht **jedem**, auch ohne
Rolle. Sie zeigt, wo dein Konto überall angemeldet ist — wann angemeldet, wann
zuletzt aktiv, und welche davon die gerade benutzte ist. Der Knopf **„Alle
anderen Sitzungen beenden"** wirft alle übrigen hinaus; die eigene bleibt.

**Was die Karte nicht kann, und sie sagt es selbst:** sie kennt **kein Gerät**.
Kriterion speichert weder IP-Adresse noch Browserkennung — das ist Absicht und
passt zu „läuft im eigenen Netz". Was sie beantwortet, ist die Frage, die
zählt: *stehen hier mehr Anmeldungen, als ich erwarte?* Wenn ja, ist der Knopf
daneben die Antwort. **Ein Admin sieht hier nur seine eigenen Anmeldungen**,
nie fremde; wer ein fremdes Konto aussperren muss, sperrt es.

**Einen Benutzer löschen gibt den Namen frei; die Beiträge bleiben.** Die
Benutzerzeile bleibt mit ihrer Nummer stehen, der Name wird frei, und die
Beiträge bleiben sichtbar — sie tragen künftig „Gelöschter Benutzer 7". Das
Fenster fragt **einmal**, mit zwei Häkchen, die auf Wunsch die Inhalte
mitnehmen: *Einträge von „…" mitlöschen* (nimmt über die Kaskade auch fremde
Kommentare, Bewertungen und Testtage daran mit — das Fenster nennt die Zahlen)
und *Beiträge in Einträgen anderer Benutzer mitlöschen*. **„Abbrechen" bricht
ab**, ohne dass etwas geschieht; danach kommt die zweite Bestätigung. Sitzungen, offene
Links, Favoriten und persönliche Einstellungen gehen immer mit. Der Name
`geloescht-<nummer>` ist als Benutzername gesperrt.

#### Die zweite Bestätigung

**Was die Installation als Ganzes trifft, wird ein zweites Mal bestätigt.** Vor dem
Export, dem Import, dem Vergeben einer Rolle, dem Setzen eines fremden
Passworts, dem Erzeugen eines Links, dem Löschen eines Benutzers und dem
**Setzen des Mailzugangs** fragt Kriterion nach **deinem eigenen Passwort**, in
einem Fenster, das daneben schreibt, warum es fragt.

**Wogegen das schützt, ist nicht der Fremde:** der kommt ohne Passwort gar
nicht herein. Es schützt gegen eine **fremde offene Anmeldung** — einen
Bildschirm, der unbeaufsichtigt stehen blieb, einen Rechner, an dem jemand
anderes sitzt. Beim Ändern des eigenen Kontos gilt dasselbe Prinzip.

Die Bestätigung gilt **genau einmal** und **nur für die eine Handlung, für die
du sie gegeben hast**. Wer drei Benutzer nacheinander löscht, tippt dreimal.
Das ist der Preis, und er ist gewollt. Sie ist außerdem an **die Anmeldung**
gebunden, an der du gerade sitzt: eine zweite offene Sitzung desselben
Kontos muss selbst bestätigen.

**Was ausdrücklich nicht dahinter liegt:** einen Benutzer **sperren oder
entsperren** (das ist umkehrbar), einen Benutzer **anlegen** (er ist neu und
nimmt niemandem etwas), das eigene Konto (dort ist das bisherige Passwort
ohnehin Pflicht), die **Testmail** (sie geht an die eigene Adresse und übergibt nichts)
und alles am Eintrag. **Ein zweiter Faktor ist es nicht** — gefragt
wird dasselbe Passwort noch einmal.

Auch hier gilt die Anmeldebremse: nach zehn falschen Bestätigungen von
derselben Adresse ist für einige Minuten Ruhe.

#### Das Sicherheitsprotokoll

Die Einstellungen zeigen dem **Eigentümer** eine Karte
**„Sicherheitsprotokoll"**. Sie hält fest, **wer Zugang hatte und wer die
Installation als Ganzes angefasst hat**: Anmeldungen (gelungen und gescheitert),
angelegte, gesperrte, entsperrte und gelöschte Benutzer, vergebene Rollen,
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

Ein gelöschter Benutzer erscheint auch hier als „Gelöschter Benutzer 7" — der
Name wird nirgends aufbewahrt. Und ein Vorgang über den Server
(`node usertool.js …`) trägt als Handelnden „per Kommandozeile am Server".

**Die Zeilen bleiben 180 Tage stehen** und werden danach von selbst geräumt.
**Einen anderen Weg hinaus gibt es nicht** — ein Sicherheitsprotokoll, das sich
wegräumen lässt, wäre keins. Das Wort meint hier nicht `docker compose logs`;
das heißt in dieser Anleitung weiterhin schlicht *Protokoll*.

**Über der Liste steht eine Reihe von Ansichten**, jede mit ihrer
Zahl: **Alle · Gescheitert · Anmeldungen · Benutzer · Zweiter Faktor ·
Datenbank**. Die Karte zeigt die **hundert jüngsten** Zeilen — mit einer Ansicht
sind es die hundert jüngsten **dieser Art**, und damit findet man die
gescheiterten Versuche auch dann, wenn viel anderes dazwischensteht. *„Gescheitert"
umfasst die gescheiterte Anmeldung und die gescheiterte zweite Bestätigung: in
beiden Fällen konnte jemand an der Tür nicht belegen, wer er ist.*
**Die Namen in den Zeilen sind anklickbar** und springen zur Karte „Benutzer".
Ein getippter Name, der an kein Konto traf, steht als „unbekannter Name" da
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

**Links und Dateien haben eigene Zeilen in der Tabelle:** beide erscheinen nur
dort, wo man sie hinsetzt. Deshalb darf sie **jeder** dazutun, und wieder
wegnehmen darf sie, wer sie hingesetzt hat, oder der Admin. **Das Umsortieren
der Links bleibt beim Verfasser des Eintrags.**

**Fotos und Videos sind nicht dabei.** Sie gehören zum Eintrag selbst: das
erste Element ist das Hauptbild und damit auch die Kachel in der Übersicht. Wer
die Reihenfolge ändert, ändert den Eintrag — das bleibt bei seinem Verfasser.
Für ein Video gilt jede dieser Regeln unverändert, weil es in derselben Tabelle
steht wie ein Foto; es bekommt kein eigenes Recht.

Eine Absage kommt als Meldung, nicht als stille Wirkungslosigkeit, und sie
kommt **bevor** irgendetwas geschrieben ist.
### Wer was geschrieben hat

**Bei genau einem Zugang bleibt davon alles aus.** Sobald es einen zweiten
gibt, nennen **Eintrag, Kommentar und Testtag** ihren Verfasser mit Namen —
der Eintrag dazu, **wann** er angelegt wurde. Eigene Testtage sind gefüllt,
fremde ein Ring.

**Eine Linkzeile und eine Datei nennen ihren Eintrager bzw. Hochladenden nur
dann, wenn er nicht der Verfasser des Eintrags ist.** Steht bei mehreren
Benutzern kein Name an einer solchen Zeile, stammt sie also vom Verfasser des
Eintrags. Wer mit dem Zeiger über der Zeile stehen bleibt, sieht zusätzlich das
Datum: „Eingetragen von … am …" bzw. „Hochgeladen von … am …". Auf einem
Berührbildschirm gibt es kein Überfahren — dort bleibt es beim Namen.

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
und zwar auch dann, wenn es nur einen Zugang gibt.

Entfernt ein Admin ein Bild aus einem fremden Kommentar, steht in dessen
Kopfzeile ein **Vermerk**: „2 Bilder vom Admin entfernt". Er nennt eine
**Rolle, keine Person**, und ist für jeden sichtbar. Es ist die einzige Stelle,
an der Kriterion einen Eingriff festhält; einen Änderungsverlauf gibt es nicht.
### Zwei Titel

Der Titel auf der Anmeldeseite ist für jeden sichtbar, der die Adresse aufruft.
Ein aussagekräftiger Name verrät dort schon, was im Bestand liegt. Deshalb gibt
es zwei, beide in den Einstellungen einstellbar:

- **Titel vor der Anmeldung** — zurückhaltend wählen (Vorgabe „Bewertungskatalog")
- **Titel nach der Anmeldung** — die eigentliche Bezeichnung (Vorgabe „Model Bewertungen")

## Bedienung

**Übersicht**
- **Die Suche greift auf sieben Quellen zu:** Titel, Beschreibung, Name der
  Kategorie, Tags am Eintrag, **Tags an Testtagen**, Adressen der Links und
  **sämtliche Kommentartexte**. `/` springt ins Suchfeld. Groß- und
  Kleinschreibung spielt keine Rolle, auch bei Umlauten; ein einzelnes Zeichen
  findet bereits. Prozentzeichen und Unterstrich sind gewöhnliche Zeichen.
  **Die Suche folgt einer Regel für alle und nicht der Sprache des Lesers**:
  zwei Zugänge in zwei Sprachen bekommen auf dieselbe Eingabe dieselbe
  Trefferliste. Die vier i des Lateinischen — `I i İ ı` — gelten dabei als
  eines; **`ß` und `ss` nicht** — „ÜBERGROSS" findet „übergroß" nicht.
  Gesucht wird im Server, kurz nach dem letzten Anschlag. Ist der Server einmal
  nicht erreichbar, bleibt die zuletzt gezeigte Liste stehen und sagt es.
- **Solange gesucht wird, sagt jede Kachel, warum sie in der Liste steht.**
  Unter dem Titel steht eine Zeile mit Quelle und Ausschnitt:
  *„Kommentar: …hat mir der Händler in Bellavista empfohlen…"*. Eine Zeile je
  Kachel und nicht eine je Quelle — trifft der Begriff mehrere, nennt sie die
  erste in der Folge Beschreibung, Kommentar, Link, Tag am Testtag, Tag,
  Kategorie, Titel und hängt an, wie viele weitere es sind. Ohne Suchbegriff
  steht die Zeile nicht da.
- **Der gefundene Begriff ist hervorgehoben** — an der Kachel in Titel,
  Kategorie, Tags und in der Zeile darunter, im Eintrag in der Linkliste und in
  den Kommentaren. In der Linkliste ist es die Adresse und nicht der
  Anbietername. Die Hervorhebung gehört der Suche: Feld geleert, Begriff
  geändert, Ansicht ohne Begriff gewählt — weg, und gespeichert wird sie nicht.
  Wer einen Treffer öffnet, findet den Begriff in der Adresse wieder
  (`#/item/12?q=ella`); ein Neuladen behält die Hervorhebung deshalb.
  **Titel und Beschreibung sind im Eintrag Eingabefelder — dort ist keine
  Hervorhebung möglich.**
- **Gespeicherte Ansichten** stehen als Knöpfe unter den Filtern. Wer eine
  Kombination öfter braucht, stellt sie ein und drückt **„+ Ansicht
  speichern"**; ein Klick auf den Knopf stellt sie wieder her. Gemerkt wird die
  ganze Filterstellung samt Suchbegriff. Das Kreuz am Knopf entfernt sie wieder.
  **Acht Stück je Zugang**, und sie sind persönlich. Wird eine Kategorie oder
  ein Tag gelöscht, auf die eine Ansicht zeigt, wird die Nummer beim Anwenden
  übergangen.
- **Beim Anlegen weist eine Zeile auf Ähnliches hin.** Wer einen Titel tippt,
  sieht darunter *„Ähnlich: …"* mit Sprungmarken zu dem, was schon da ist. Sie
  blockiert nichts.
- Filter nach Status (Alles / Getestet / Ungetestet — die beiden letzten heißen
  so, wie es im Vokabular steht), Kategorie und Tags. Bei mehreren Tags legt der
  Umschalter neben der Beschriftung fest, wie sie verknüpft werden: **Und**
  (Vorgabe) zeigt nur Einträge, die alle gewählten Tags tragen, **Oder** solche
  mit mindestens einem. Die Wahl bleibt, bis man sie ändert. Gedämpft
  dargestellt wird jede Pille, die mit der aktuellen Auswahl keinen Treffer mehr
  ergäbe — anklickbar bleibt sie. Die Tagwolke zeigt eine Zeile, nach
  Häufigkeit sortiert und mit den aktiven Filtern vorn; der Rest klappt auf.
  Tags, die nur an Testtagen hängen, stehen nicht darin; die Suche findet sie
  trotzdem.
- **Die Sortierung fasst den Statusfilter nicht an.** Was in der Statuszeile
  steht, hast du gesetzt.
- **Mehrere Kategorien zugleich**: ein Klick nimmt eine dazu, ein zweiter nimmt
  sie wieder heraus, **„Alle"** räumt die Auswahl weg. Es ist immer ein Oder —
  ein Eintrag trägt genau eine Kategorie; die Zeile hat deshalb keinen
  Umschalter. Am Ende steht **„Ohne"** mit eigener Zahl.
- **„Filter zurücksetzen" steht rechts in der Sortierzeile**, neben „+ Ansicht
  speichern", und nur dann, wenn wirklich etwas gesetzt ist. Er nennt die Zahl:
  *„Filter zurücksetzen (3)"*. Ein Klick stellt Status, Ablehnung, Favoriten,
  Kategorien und Tags auf „alles zeigen" zurück und nimmt die Handwahl am
  Statusfilter mit. **Der Suchbegriff bleibt stehen** — er hat sein eigenes
  Kreuz im Suchfeld —, **die Sortierung ebenfalls**, und **eine gespeicherte
  Ansicht wird nicht angetastet**.
- **Zeitleiste der Testtage** zwischen Filterleiste und Kartenraster: waagerecht
  die Zeit, senkrecht die Tagesnote, ein Punkt je Testtag. Überfahren zeigt
  Titel, Datum und Note, ein Klick öffnet den Eintrag. Sie richtet sich nach den
  gerade sichtbaren Einträgen und bleibt unter fünf Testtagen weg.
- Filter- und Sortierwahl werden serverseitig gespeichert und sind auf jedem
  Gerät gleich.
- **Die Sortierung besteht aus zwei Bedienelementen:** das Feld sagt, **wonach**
  sortiert wird, der Knopf daneben die **Richtung**, im Klartext („neu → alt",
  „hoch → niedrig", „viele → wenige"). Ein Druck darauf dreht um. Bei „Titel"
  gibt es nur A → Z; der Knopf steht dort gedämpft daneben.
- Sortierung nach Änderung, Bewertung, **Potenzial**, Titel sowie nach
  Testverlauf: Anzahl der Testtage, Durchschnitt der Tagesnoten und letzte
  Tagesnote. Einträge ohne Testtage stehen immer am Ende, und dasselbe gilt für
  die beiden Potenzialeinträge: wer keine Einschätzung hat, steht in beiden
  Richtungen hinten.
- **Die Kachel zeigt eine Zahl, nicht zwei**: bei einem getesteten Eintrag die
  Bewertung („★ 3,8"), bei einem ungetesteten das Potenzial („◆ 4,2"). Die
  andere Zahl steht im Kopf des zugeklappten Kastens am Eintrag.
- **Abgelehnt** steht als eigene Gruppe in der Statuszeile, hinter der
  Beschriftung „Ablehnung": *Alle · Abgelehnt · Nicht abgelehnt*. Sie lässt sich
  mit dem Teststatus kombinieren.
- **★ Favoriten** steht als eigener Umschalter rechts in der Statuszeile und
  lässt sich mit jedem Teststatus kombinieren. Ein Favorit ist persönlich und
  sortiert die gemeinsame Liste nicht um.
- **Einen Filter „Neu seit …" gibt es nicht** — die Auskunft trägt die Glocke in
  der Kopfzeile. Eine gespeicherte Ansicht, die ihn trägt, bleibt lesbar; er
  wird übergangen.
- Über das Häkchen auf einer Karte lassen sich Einträge vergleichen. Im
  Vergleich steht bei mehr als einem Zugang ein Umschalter **„meine / alle"**
  über dem Raster: er schaltet Kriterienwerte, Kopfzahl und Testtagzeile
  gemeinsam zwischen den eigenen Werten und dem Schnitt über alle. Vorgabe ist
  „alle". Bei einem einzigen Zugang erscheint er nicht.

**Eintrag**
- Blättern mit ← → oder über die Pfeile, ohne vorher ins Bild zu klicken. Klick
  aufs Foto öffnet die Vollbildansicht; dort zoomt ein weiterer Klick auf
  Originalgröße. Esc schließt, auf Touch wird gewischt. **Das Vollbild trägt
  denselben Papierkorb wie die Ansicht darunter**, mit derselben Rückfrage; er
  steht abgesetzt und vor dem Schließenkreuz. War es das letzte Bild, geht das
  Vollbild zu. An einem Kommentarbild gibt es ihn nicht.
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
  jeweiligen Bereichs. Anordnung und Einklappzustand gelten für alle Einträge
  gemeinsam und liegen auf dem Server; zurückgesetzt wird in den Einstellungen.
- **Tags**: Marken oben mit ✕, darunter eine Wolke aller vorhandenen Tags über
  drei Zeilen. Ein Klick in der Wolke vergibt, ein erneuter nimmt zurück; das ✕
  an der Marke bleibt daneben bestehen.
- **Testtage** können eigene Tags tragen, zwischen Datum und Sternen. Derselbe
  Vorrat wie am Eintrag, aber eine eigene Verknüpfung.
- **Dateien** am Eintrag, bis 50 MB je Stück und höchstens 20. Ein Klick auf die
  Zeile tut das Naheliegende — was der Server ansehen kann (Bilder, PDF,
  Text/Markdown/CSV/Log, `.docx`) klappt auf und wieder zu, alles andere wird
  heruntergeladen. Der Pfeil rechts zeigt vorher an, was passiert; ein eigener
  Ladepfeil daneben lädt auch Ansehbares herunter.
- **Bildausschnitt der Vorschau**: Der Schalter „Ausschnitt" über dem Bild legt
  je Foto fest, welcher Teil auf der quadratischen Karte zu sehen ist. Ein
  Rahmen zeigt den künftigen Ausschnitt: **außerhalb ziehen** zieht einen neuen
  auf, **im Rahmen ziehen** schiebt ihn, und an **seinen vier Ecken und vier
  Kanten** änderst du die Größe. Ein Klick außerhalb setzt nur den Punkt. Der
  Zeiger sagt vorher, was passiert. Ein Schieber daneben zieht den Ausschnitt
  enger — von „so weit wie das Bild hergibt" bis viermal so nah; **auf dem
  Telefon schiebst du den Rahmen und stellst die Größe am Schieber.** Der
  Ausschnitt ist immer ein Quadrat.
  **Das Original bleibt unangetastet** — geschnitten wird die kleine Vorschau,
  und zwar aus dem Original neu, sobald du speicherst. Der Ausschnitt ist
  deshalb jederzeit änderbar. Die Vorschau in der Mitte des Eintrags und das
  Vollbild zeigen weiter das ganze Bild.
- **Kommentare** tragen zwei unabhängige Merkmale: die **Art** (Notiz, Bericht
  oder Aufgabe) und die **Anpinnung**, frei kombinierbar. Daraus folgt die
  Reihenfolge: erst Angepinntes, dann Aufgaben, dann Berichte, dann Notizen —
  und innerhalb jeder Gruppe das Älteste oben. Im Block der Angepinnten
  entscheidet allein das Alter. Ein Bericht ist an keinen Testtag gebunden.
  Die **Aufgabe** steht ganz oben. Ihr Knopf schaltet weiter statt um:
  Notiz → Aufgabe → erledigt → Notiz.
  **Alle offenen Aufgaben auf einen Blick** zeigt die Ansicht **„Offen"** — der
  Knopf dafür steht in der Kopfzeile neben dem Zahnrad. Sie listet alle nicht
  erledigten Aufgaben aus allen Einträgen, gruppiert nach Eintrag, mit
  Verfasser und Datum; ein Klick führt in den Eintrag, und abhaken geht direkt
  dort. Die abgehakte Zeile bleibt durchgestrichen stehen. Abhaken darf, wer
  den Kommentar geschrieben hat, und der Admin. Bei mehr als einem Zugang steht
  darüber ein Umschalter **„meine / alle"**.
  **Eine Aufgabe kann ein Fälligkeitsdatum tragen** — ein Datum ohne Uhrzeit,
  freiwillig. Gesetzt wird es am Kommentar selbst: sobald die Aufgabenmarke
  steht, erscheint neben ihr ein Verweis, der das Datum trägt oder das Wort
  „Datum"; ein Klick macht daraus ein Datumsfeld, ein leeres Feld nimmt das
  Datum wieder weg. In „Offen" ordnen sich die Aufgaben danach in vier
  Abschnitten — **überfällig · heute · später**, und **ohne Datum** hinten,
  jeder mit seiner Zahl; innerhalb eines Abschnitts bleibt die Gruppierung nach
  Eintrag erhalten. **Es gibt keine Benachrichtigung, keinen Wecker und keine
  Mail.** „Überfällig" rechnet sich am heutigen Tag dessen, der hinsieht. Das
  Datum geht in den Export mit (**Austauschformat 17**).
  **Einen anderen markieren:** wer `@name` in einen Kommentar schreibt,
  markiert diesen Zugang. Die Stelle steht hervorgehoben da, und der Markierte
  bekommt eine Glocke — er, nicht jeder. Die Markierung wirkt in allen vier
  Arten. **Ein Name, den es nicht gibt, wird gar keine Markierung**; eine
  E-Mail-Adresse im Text ist ebenfalls keine. **Gespeichert wird die
  Zugangsnummer und nicht der Name**: wer umbenannt wird, steht danach unter
  seinem heutigen Namen da, wer gelöscht wird, als „Gelöschter Benutzer 7". Ein
  Name mit Leerzeichen lässt sich nicht markieren. **Der Export trägt die
  Markierung als `@name` im Kommentartext mit**; beim Einspielen löst die
  Zielinstanz sie gegen ihre eigenen Namen neu auf (**Austauschformat 17**).
  Ein erledigtes Todo verlässt die Spitze und reiht sich nach Alter bei den
  Notizen ein, bleibt aber als erledigt gekennzeichnet. Ein Kommentar hat immer
  genau eine Art.
  **Gekennzeichnet werden die beiden Merkmale auf getrennten Kanten**: die
  linke Kante gehört der Art — orange bei einem Bericht, blau bei einer
  Aufgabe, grün wenn sie erledigt ist, nichts bei einer Notiz. Die drei übrigen
  Kanten gehören der Anpinnung und werden gedämpft golden. Bei einer
  angepinnten Notiz bleibt die linke Kante neutral.
- **Der Blockkopf zählt — kurz und in Zeichen**: **12 · ⚑3 · ☐3 · ☑2**. Die
  Fahne ist der Bericht, das leere Kästchen die offene Aufgabe, das Häkchen das
  Erledigte; jedes in der Farbe, die es am Kommentar auch trägt. **Der volle
  Satz steht am Mauszeiger:** „12 Kommentare · 3 Berichte · 5 Aufgaben
  (3 offen)". Die Zahlen sind Teilmengen und keine Summanden. Gruppen mit null
  fallen weg; die Zeile bleibt auch eingeklappt stehen.
- **Adressen im Kommentartext werden anklickbar.** Erkannt wird nur
  ausdrücklich Geschriebenes: `http://`, `https://` und `www.` ohne Schema. Ein
  blankes `beispiel.de` bleibt Text. Nachlaufende Satzzeichen gehören nicht zur
  Adresse; eine schließende Klammer bleibt nur, wenn die Adresse eine unpaarige
  öffnende enthält. Angezeigt wird die Adresse vollständig. Beim Bearbeiten
  steht weiterhin der Rohtext im Textfeld; gespeichert ändert sich nichts.
- **Bilder in Kommentaren**: bis 6 je Kommentar, anhängen oder mit Strg+V
  einfügen. Jedes Bild wird beim Hochladen neu kodiert — gespeichert wird nur
  die verkleinerte Variante samt Kachel, nicht das Original.
- **Zwei Sternkästen: „Potenzial" und „Bewertung".** Sie beantworten zwei
  verschiedene Fragen und berühren einander nicht — kein Stern des einen zählt
  im anderen, und jeder hat eigene Kriterien, eigene Gewichte und einen eigenen
  Durchschnitt. *Potenzial* fragt vor dem Ausprobieren, *Bewertung* danach.
  **An einem ungetesteten Eintrag gibt es den Bewertungskasten nicht**, und der
  Server weist eine Bewertung dort ebenfalls ab; wegnehmen lässt sich immer.
  Steht der Eintrag auf **getestet**, ist es umgekehrt: die Bewertung steht
  offen, das Potenzial zugeklappt. Der zugeklappte Kasten behält seine Zahl im
  Kopf („⌀ 4,2 gewichtet"), und ein Klick auf die Kopfzeile klappt ihn auf.
  **Dieser Klick gilt für diesen Eintrag und wird nicht gespeichert.**
  **Der Potenzialkasten ist leer, bis der Admin Kriterien dafür anlegt** — in
  der Karte *Potenzial: Kriterien* in den Einstellungen. Das Wort „Potenzial"
  steht im Vokabular und lässt sich umbenennen.
  Trägt ein ungetesteter Eintrag schon Bewertungssterne, steht der
  Bewertungskasten da — offen.
- **Bewertung**: gemeinsame Kriterien, feste Skala 1–5. **Die Sterne sind die
  eigene Bewertung**; sind mehrere Benutzer eingerichtet, steht rechts daneben
  gedämpft der Schnitt über alle, im Blockkopf die Gesamtzahl. Hat dort noch
  niemand bewertet, steht ein Strich. **Wie viele Bewertungen darin stecken,
  steht in Klammern daneben — aber erst ab zweien**; die vollständige Angabe
  steht am Überfahren. Der Gesamtschnitt entsteht erst je Kriterium, dann über
  die Kriterien, und er geht über alle Benutzer.
  **Ganz rechts in der Zeile steht ein runder Rücksetzknopf, sobald in dieser
  Zeile ein eigener Stern gesetzt ist** — ein Tipp darauf entfernt die eigenen
  Sterne, in beiden Kästen. Die Meldung darunter trägt **„Rückgängig"**. Einen
  Knopf, der alle Kriterien auf einmal leert, gibt es nicht.
  **Kriterien können verschieden schwer wiegen.** Ist an einem Kriterium ein
  Gewicht eingestellt, das von 1 abweicht, steht `×1,5` hinter seinem Namen,
  und im Blockkopf steht neben der Zahl das Wort „gewichtet". Stehen alle
  Gewichte auf 1, sieht der Block aus wie zuvor. Eingestellt wird das Gewicht
  in den Einstellungen; **der Durchschnitt bleibt zwischen 1 und 5.**
  **Ein Klick auf die Zahl im Blockkopf öffnet die Rechnung — die dieses
  Eintrags.** Der Kasten zeigt je bewertetem Kriterium eine Zeile mit Note,
  Gewicht und Produkt, darunter Summe, Teiler und Ergebnis. **Der Teiler zählt
  nur die Kriterien, die auch bewertet sind**, und **gerundet wird genau
  einmal, ganz am Ende**. Darunter steht die Vergleichszahl: was käme heraus,
  wenn alle Kriterien gleich zählten? Stehen alle Gewichte auf 1, steht sie
  nicht da; ergeben beide Zahlen nach dem Runden dasselbe, sagt der Kasten das.
  **Wer welchen Wert vergeben hat, steht nicht unter der Sternzeile.** Ab zwei
  Benutzern findet der Admin in jedem der beiden Kastenköpfe den Knopf **„Wer
  hat bewertet"**: er öffnet eine Ansicht mit den Namen je Kriterium, und dort
  lässt sich eine fremde Bewertung entfernen — ändern nicht. Für alle anderen
  gibt es den Knopf nicht, und der Server liefert ihnen die Namen nicht aus.
  **Angelegt, umbenannt, sortiert und gelöscht werden Kriterien ausschließlich
  in den Einstellungen und ausschließlich vom Admin** — in zwei Karten, eine je
  Kasten. **Zu welchem Kasten ein Kriterium gehört, steht mit dem Anlegen fest**
  und lässt sich danach nicht ändern. **Ein Name gehört zu genau einem Kasten.**
  Ein neues Kriterium erscheint sofort an jedem Eintrag, ein gelöschtes nimmt
  überall die vergebenen Sterne mit. In den Einstellungen steht daneben, in wie
  vielen Einträgen das Kriterium verwendet wird.
  **Auf dem Telefon steht der Kriterienname über den Sternen**, in einer
  eigenen Zeile; darunter links die Sterne mit ×, rechts der Durchschnitt.
- **„Abgelehnt" ist eine Aussage und kein bloßes Häkchen.** Beim Einschalten
  öffnet sich sofort ein Feld für den Grund — eine Zeile, freiwillig, höchstens
  200 Zeichen; gespeichert wird beim Verlassen des Feldes oder mit Enter,
  verworfen mit Escape. Danach schließt sich das Feld, und was stehenbleibt,
  ist der Satz: *„Abgelehnt am 14.03.2026, 09:12 von Anna — Lieferzeit über 6
  Monate."* Der Grund steht hervorgehoben da, Datum und Name gedämpft. Jedes
  der drei darf fehlen; ein entfernter Zugang erscheint als „Gelöschter
  Benutzer 7".
- **Wann das Eingabefeld dasteht**: solange abgelehnt ist und noch kein Grund
  dasteht — und darüber hinaus dann, wenn man es über den Text oder das ✎
  aufmacht. An einem Eintrag, der nicht abgelehnt ist, steht nichts davon.
  **Wird ein Eintrag mit vorhandener Begründung erneut abgelehnt, bleibt das
  Feld zu.**
- **Ändern und Entfernen der Begründung**: ein Klick auf den Text oder auf das
  **✎** daneben öffnet das Feld wieder — beides nur für den, der die Begründung
  getroffen hat. Das **✕** daneben entfernt sie nach Rückfrage, und das darf
  jeder, der den Eintrag ändern darf. **Beim Entfernen bleiben Datum und
  Verfasser stehen.** Wer entfernt hat, wird dabei nicht ihr Verfasser. Steht
  gar keine Begründung da, bleibt das ✎ allein stehen. Beim Zurücknehmen des
  Merkmals wird nichts gelöscht: lehnt jemand denselben Eintrag später wieder
  ab, steht die alte Begründung als Vorschlag im Feld. In der Kachelansicht
  bleibt die Marke, wie sie war.
- **Beschreibung und Kommentarfelder wachsen mit dem Text** — sie zeigen immer
  den ganzen Inhalt und haben deshalb keinen Ziehgriff.
- **Testtage**: nur bei eingeschaltetem „Getestet". Jede Zeile ist ein Tag mit
  einer einzigen Gesamtnote, unabhängig von den Kriterien. Ein Datum kann nur
  einmal vorkommen; wird es erneut eingetragen, ersetzt die neue Note die alte.
  Ab drei Tagen zeigt eine kleine Kurve den Verlauf. Solange Testtage vorhanden
  sind, lässt sich „Getestet" nicht zurücknehmen.
- **Links**: beliebig viele Adressen. **Eintragen darf jeder**, auch an einem
  fremden Eintrag; wieder wegnehmen darf sie, wer sie hingesetzt hat, oder der
  Admin — das ✕ steht nur dort, wo es auch gedrückt werden darf. Ab zwei
  Zugängen trägt eine fremde Zeile den Namen ihres Eintragers. Ein Klick auf
  die Zeile öffnet sie in einem neuen Tab, Ziehen sortiert um — **umsortieren
  darf nur der Verfasser des Eintrags oder der Admin.** Über der eingestellten
  Zeilenzahl wird die Liste abgeschnitten, nicht scrollbar; der Knopf darunter
  klappt sie auf. Bewusst ohne Favicons.
  **Was keine Adresse ist, wird zur Suche**: ein Wort, eine Normbezeichnung,
  eine Artikelnummer bleibt im Rohzustand stehen und führt beim Klick zur
  Standard-Suchmaschine. Solche Zeilen tragen rechts eine Lupe statt des Pfeils
  und nennen unter dem Text die Suchmaschinen, bei denen sich suchen lässt —
  die Standard-Suchmaschine zuerst, dahinter bis zu drei weitere. Jeder Name
  ist ein eigenes Klickziel. **Gespeichert wird nie eine fertige Suchadresse**,
  ein Wechsel der Suchmaschine gilt deshalb rückwirkend.
- Kommentare lassen sich nachträglich bearbeiten und löschen.
- Löschen von Eintrag, Foto, Video, Kommentar, Link, Datei und Testtag jeweils
  mit Rückfrage. Beim Eintrag wird benannt, was dranhängt — Fotos und Videos
  getrennt, dazu Links, Dateien, Kommentare, Bewertungen und Testtage getrennt
  nach eigenen und fremden. Der Dialog sagt dazu, dass der Eintrag dreißig Tage
  im Papierkorb liegt und wer ihn von dort zurückholen kann — der Eigentümer
  der Installation.
- **„Diesen Eintrag als Datei"** *(Eigentümer)*: derselbe Aufbau wie eine volle
  Exportdatei, nur mit einem Eintrag — samt Fotos, Videos, Dateien und
  Kommentarbildern.

**Einstellungen** (Zahnrad in der Kopfzeile)

**Sie stehen in fünf Abschnitten, und jeder hat eine eigene Adresse.** Die
Reihenfolge folgt der Rechteleiter.

| Abschnitt | Adresse | Karten |
|---|---|---|
| **Persönlich** | `#/system/persoenlich` | Mein Konto, Meine Sitzungen, Darstellung |
| **Bestand** | `#/system/bestand` | Kategorien, Tags, Bewertung: Kriterien, Potenzial: Kriterien, Vokabular, Links, Suchmaschinen, Papierkorb |
| **Benutzer** | `#/system/zugaenge` | Benutzer, Anfragen, Sicherheitsprotokoll, Mailversand |
| **Datenbank** | `#/system/datenbank` | Kennzahlen, Bildformate, Sicherung, Alte Sicherungen, Export und Import |
| **Installation** | `#/system/installation` | Titel |

`#/system/datenbank` lässt sich weitergeben, in einem neuen Fenster öffnen und
mit der Zurück-Taste wieder verlassen. `#/system` ohne Abschnitt bleibt gültig
und löst sich auf den ersten sichtbaren auf. Die alten Adressen
`#/system/anlage` und `#/system/instanz` führen beide zu „Installation" und
werden in der Adresszeile nachgezogen.

**Auf dem Telefon steht die Abschnittsliste eingeklappt**, hinter einem Knopf,
der den Namen des offenen Abschnitts trägt; am Schreibtisch steht sie offen.

> **Die Karten einer Reihe sind gleich hoch**, und was die Reihe hoch macht,
> ist ihre höchste Karte ohne Liste. Steht in einer Reihe keine solche, macht
> die Liste mit den meisten Zeilen das Maß — höchstens **zehn** Zeilen, beim
> Sicherheitsprotokoll höchstens **fünfzehn**, und mindestens eine.
>
> **Eine Liste ist so hoch wie ihr Inhalt und rollt, wenn er den Deckel
> übersteigt.** Bekommt eine Karte mehr Platz, als ihre Liste braucht, bleibt
> der Rest leer. Eine leere Liste ist zwei Zeilen hoch und sagt, dass nichts da
> ist.
>
> **In einem Fenster gilt kein Deckel** — die Glockentafel und die Liste der
> gelöschten Benutzer zeigen, was da ist; das Fenster selbst rollt.
>
> **Auf dem Telefon steht jede Karte allein in ihrer Zeile.** Dort hängt der
> Deckel am Fenster: eine Liste nimmt höchstens gut sechs Zehntel der
> Fensterhöhe.

**Ein Abschnitt, in dem für diesen Zugang keine einzige Karte steht, erscheint
gar nicht** — ein gewöhnlicher Benutzer sieht zwei Abschnitte statt fünf. Eine
Adresse, die auf einen solchen Abschnitt zeigt, fällt auf den ersten sichtbaren
zurück und wird in der Adresszeile nachgezogen. Der zuletzt offene Abschnitt
wird nicht gemerkt; die Adresse tut es schon.

**Was man dort sieht, hängt an der Rolle.** Ein gewöhnlicher Benutzer bekommt
acht Karten: seinen eigenen **Zugang**, **Meine Sitzungen**, die
**Darstellung**, die **Links** und die vier Listen **Kategorien**, **Tags**,
**Bewertungskriterien** und **Potenzial: Kriterien** — die letzten vier ohne
Bedienzeichen, nur zum Nachsehen. Alles Übrige steht dem **Admin**, Export,
Import, Sicherung und **Sicherheitsprotokoll** allein dem **Eigentümer**. Beim
**Papierkorb** steht die Karte dem Admin, die beiden Knöpfe daran nur dem
Eigentümer.

- Beide Titel ändern *(Admin)*
- Kennzahlen: Einträge, Fotos, Videos, Kommentare, Links, Testtage,
  **Papierkorb** und Datenbankgröße *(Admin)*. Der Schlüsselwert zum
  Abschreiben steht darin nur für den **Eigentümer**.
  **Dort stehen auch die Version und der Fingerprint nebeneinander** — die
  Version sagt, welcher Stand laufen *soll*, der Fingerprint, ob die Dateien
  dazu wirklich zusammengehören.
  **Und ganz unten die Verfahren:** Verschlüsselung `sqlcipher`, Schlüssel
  **256 Bit roh** (`PRAGMA key = x'…'`, also ohne Ableitung), Journal **WAL**,
  Passwörter **scrypt**. Die vier Angaben werden aus der geöffneten Datenbank
  abgelesen und nicht behauptet.
  **Welche Fassung welcher Bibliothek das rechnet, steht dort ausdrücklich
  nicht.** Ein Verfahrensname sagt, *wie* gerechnet wird; eine Versionsnummer
  sagt, *welche Lücke passt*.
- **Benutzer** verwalten — anlegen mit Passwort oder mit Link, sperren,
  Passwort zurücksetzen direkt oder mit Link, Rolle wechseln, löschen; siehe
  „Rollen und Benutzer" oben *(Admin)*. **Gelöschte Benutzer stehen in einem
  eigenen Fenster** hinter dem Knopf „Gelöschte Benutzer (n)". Das Löschfenster
  nennt auch den umkehrbaren Weg: sperren weist die Anmeldung ab, lässt Namen
  und Bestand stehen und lässt sich zurücknehmen.
- **Meine Sitzungen** — wo dein Konto überall angemeldet ist, mit „Alle anderen
  Sitzungen beenden" *(jeder sieht nur seine eigenen)*
- **Sicherheitsprotokoll** *(Eigentümer)*: wer Zugang hatte und wer die
  Installation als Ganzes angefasst hat — 180 Tage lang, ohne einen Weg hinaus
  außer der Frist. Kein Änderungsverlauf, keine Adresse, keine Browserkennung.
- **Export und Import stehen in einer Karte** *(Eigentümer)* — sie meinen
  dieselbe Datei. Der Export liest, der Import **ersetzt Bestand**; die
  zerstörende Hälfte steht unter einem Trennstrich, mit eigener, kleinerer
  Überschrift. Die zweite Bestätigung vor dem Import bleibt.
- **Export** mit oder ohne Fotos, nur für den Eigentümer. Die Datei nennt zu
  jedem Eintrag, jeder Bewertung, jedem Kommentar, jedem Testtag, jeder
  Linkzeile und jeder Datei den **Verfassernamen**. **Videos gehen nur mit
  eigenem Häkchen mit** — ohne es nennt die Datei sie, enthält sie aber nicht,
  und der Import sagt beim Einspielen, wie viele gefehlt haben.
  **Die Karte nennt die erwartete Dateigröße, bevor der Knopf gedrückt wird**,
  und die Zahl folgt den Häkchen. Ab **300 MB** steht ein Hinweis darunter:
  eine Exportdatei ist ein einziger Text und kann nicht größer als 512 MB
  werden. **Gewarnt wird, verweigert nicht.** Wird die Grenze wirklich
  gerissen, sagt die Installation ab, bevor sie anfängt zu bauen.
- **Export in Teilen** *(Eigentümer)* — der Weg, wenn die eine Datei nicht mehr
  geht. Die Installation rechnet aus, wie viele Teile es braucht, und **jeder
  Teil ist eine vollständige Exportdatei**: derselbe Umschlag, dieselbe
  Formatnummer, nur weniger Einträge darin. **Geschnitten wird zwischen
  Einträgen, nie mitten hinein.**
  **Zum Einspielen: Teil 1 mit „Ersetzen", alle übrigen der Reihe nach mit
  „Zusammenführen".** Es ist derselbe Import wie immer.
  **Die Teilgröße ist wählbar** (50 bis 300 MB). **Das Passwort wird einmal
  gefragt und je Teil geprüft.** Ein Eintrag, der schon für sich allein über
  der Grenze liegt, wird **namentlich genannt** statt still übergangen.
- **Import** einer Exportdatei, wahlweise *ersetzen* oder *zusammenführen* —
  ebenfalls nur für den Eigentümer: eine Exportdatei kann Beiträge unter
  fremdem Namen anlegen.
  **Das Austauschformat trägt die Nummer 17.** Sie sagt, welche Felder zu
  erwarten sind; die Programmfassung steht daneben.
  **Gelesen wird ab Nummer 14, und alles Ältere wird abgewiesen:** eine solche
  Datei trägt an ihren Fotos noch andere Feldnamen. Abgewiesen wird die Datei
  und nicht der Start; wer eine solche hat, spielt sie
  in eine Fassung bis 0.32.1 ein und exportiert sie dort neu.
  **Innerhalb der lesbaren Spanne entscheidet, welche Felder dastehen, und nie
  die Nummer** — fehlt eines, bleibt es leer. Ein fehlender Ablehnender fällt
  ausdrücklich nicht an den Einspielenden.
  Der Vorgang läuft in einem Zug; bricht er ab, bleibt der Bestand unverändert.
  Ein genannter Verfasser, den es als Zugang gibt, bekommt seine Zeilen zurück;
  alles andere fällt an den Einspielenden. **Ein unbekannter Name legt keinen
  Zugang an**; er wird im Protokoll genannt. Links und Dateien aus einer Datei
  ohne Verfasserfeld fallen an den Verfasser des Eintrags.
- **Sicherung** *(Eigentümer)*: eine vollständige, verschlüsselte Kopie der
  Datenbank auf Knopfdruck — siehe „Sichern" weiter unten. Die Karte nennt den
  Sicherungsordner, den Unterordner darunter, wann zuletzt gesichert wurde und
  wie lange es dauern wird. **Ganz oben steht, wie der Sicherungsordner liegt:**
  rot im Projektordner, grün außerhalb. Abgewiesen wird keine der beiden Lagen.
  Sie markiert außerdem jede Kopie rot, die noch mit dem alten Schlüssel
  verschlüsselt ist.
- **Alte Sicherungen** *(Eigentümer)*: listet alle Sicherungen im
  Sicherungsordner und entfernt alte, ohne Shell auf dem Wirt. Die Liste führt
  sie mit **Nummer, Datum, Alter und Größe**, jüngste zuerst; ab der sechsten
  Zeile rollt sie. **In der Liste wird nichts gelöscht.**
  **Gelöscht wird eine Sicherung nur, wenn beides zutrifft:** sie liegt nicht
  unter den jüngsten N **und** ist älter als X Tage. Beide Werte lassen sich
  einstellen (1 bis 20 und 7 bis 365 Tage); die Grenzen hält der Server. **Der
  Schalter „Nach jeder erfolgreichen Sicherung aufräumen" steht auf AUS**,
  daneben ein Knopf hinter der Passwortabfrage.
  **An jeder Zeile steht ein „prüfen".** Es öffnet diese Kopie probeweise,
  zählt darin und macht sie wieder zu — die laufende Datenbank wird nicht
  angefasst. Darunter erscheint eine Zeile: so viele Einträge, so viele Fotos,
  so viele Zugänge, und bis zu welchem Datum der Inhalt reicht. Die Zeile
  bleibt stehen; gespeichert wird nichts. Lässt sich eine Kopie mit dem
  Schlüssel dieser Installation nicht öffnen, steht dort **„Mit diesem
  Schlüssel nicht lesbar"**.
  **Eine Sicherung zurückzuspielen kann die Oberfläche nicht**; dafür gibt es
  den Abschnitt „Sichern". Was die Regel anfasst und was sie liegen lässt,
  steht ebenfalls dort.
- **Papierkorb** *(Admin sieht, Eigentümer handelt)*: was in den letzten
  dreißig Tagen gelöscht wurde, mit Titel, **Löschdatum**, Löschendem, der
  verbleibenden Frist und der Größe. **„Zurückholen"** legt einen neuen Eintrag
  mit demselben Inhalt an — Fotos, Videos, Dateien, Kommentare, Bewertungen und
  Testtage samt ihren Verfassern. **„Endgültig entfernen"** schließt den
  Rückweg. Nach dreißig Tagen fällt eine Zeile von selbst heraus.
  Zwei Dinge kommen nicht zurück: die Favoriten anderer und der Vermerk über
  entfernte Kommentarbilder. Zwei Löschwege füllen den Papierkorb nicht:
  „Zugang entfernen" mit dem Häkchen *Einträge mitnehmen* und der ersetzende
  Import.
- **Darstellung**: das **Farbschema** — hell, dunkel oder wie das Gerät —, die
  Schriftgröße der Oberfläche in fünf Stufen von 80 % bis 120 %, die Größe der
  Bilder im Bildstreifen in fünf Stufen von 60 bis 150 px, Zeitleiste an oder
  aus, Standardanordnung der Blöcke — alles serverseitig gespeichert,
  persönlich, und es gilt auf jedem Gerät.
- **Links** *(jeder)*: Zahl der sichtbaren Zeilen, bevor aufgeklappt werden
  muss, und die Zahl der Anbieternamen unter einer Suchzeile — beides
  persönlich.
- **Suchmaschinen** *(Admin)*: die Suchmaschinen für Zeilen, die keine Adresse
  sind. Sechs eingebaute (Google, Bing, DuckDuckGo, Startpage, Brave Search,
  Ecosia) und bis zu drei eigene mit Name und Such-URL, `%s` als Platzhalter.
  Erlaubt sind ausschließlich `http://` und `https://`. Ein Häkchen nimmt eine
  Suchmaschine in die Auswahl, **Standard** macht sie zum Ziel des
  Zeilenklicks. Beides gilt für alle.
- **Vokabular**: wie die Dinge heißen sollen (siehe unten) *(Admin)*
- **Kategorien und Tags** anlegen, umbenennen oder löschen, mit Angabe der
  betroffenen Einträge *(Admin)*. **Unter der Liste steht ein Feld mit
  „Erzeugen"**; angelegt wird immer die Grundzeile, und der Sprachumschalter
  darüber fasst sie nicht an. Dazu je ein Häkchen, **wer einen neuen Namen
  anlegen darf**: mit Haken jeder unmittelbar am Eintrag, ohne Haken nur der
  Admin. Zuweisen und Auswählen aus dem Vorhandenen bleibt für alle offen.
- **Bewertungskriterien** umbenennen, löschen, per Ziehen sortieren und
  **gewichten** *(Admin)*. Die Reihenfolge gilt für Detailansicht und Vergleich
  gleichermaßen. Die Zahl nennt die Einträge, bei denen Sterne vergeben sind.
- **Potenzial: Kriterien** — dieselbe Karte für den Kasten *vor* dem Test,
  gleiche Bedienung, eigene Liste. Die Karte schlägt *Wunsch* (Gewicht 1,5),
  *Nutzen* und *Machbarkeit* vor; angelegt wird nichts von selbst.

  **Das Gewicht** bestimmt, wie stark ein Kriterium in den Gesamtschnitt
  eingeht. Bei **1** zählen alle gleich — so startet jede Installation.
  Möglich ist **0,2 bis 2**; angeboten werden `0,5 · 0,8 · 1 · 1,2 · 1,5`,
  alles dazwischen lässt sich eintippen. Geschrieben wird mit Komma (`1,5`),
  gelesen wird auch ein Punkt (`1.5`). Feiner als zwei Nachkommastellen wird
  gerundet, und das Feld zeigt danach den gespeicherten Wert. Ein Wert
  außerhalb der Spanne wird **abgewiesen**, nicht zurechtgebogen; ein leer
  gelassenes Feld holt den alten Wert zurück.

  **Der Gesamtschnitt eines Eintrags bleibt immer zwischen 1 und 5.**
  Gewichtet wird nur der Schritt über die Kriterien.

  **Das Gewicht gilt für alle** und ist keine persönliche Einstellung. Wer
  nicht verwalten darf, sieht es trotzdem.

## Auf dem Handy und auf dem Tablett

**Es ist eine Installation und keine zweite Oberfläche.** Es gibt keinen zweiten
Aufbau, keine Weiche nach der Kennung des Browsers und keine Handy-Adresse. Was
sich ändert, entscheidet der Browser anhand von zwei Fragen:

- **Die Breite entscheidet über das Layout** — wie viele Spalten ein Raster
  trägt, ob die Kopfzeile umbricht, ob ein Kasten seinen Rahmen behält. Ein
  Tablett am Standfuß und ein kleines Fenster auf dem Desktop sind derselbe
  Fall.
- **Der Zeiger entscheidet über die Größe der Ziele.** Ein Tablett im
  Querformat ist breit und wird mit dem Finger bedient.

Es gibt **drei Umbruchpunkte**: **1024 px** (Tablett — engeres Polster,
dichtere Raster), **860 px** (die Detailansicht wird einspaltig) und **700 px**
(Telefon). Die Telefonregel fragt zusätzlich nach der **Höhe**: quer gehalten
ist ein Telefon 850 bis 930 Pixel breit und keine 500 hoch.

### Die Kopfzeile

Auf dem Telefon stehen dort **zwei Zeilen**: oben Marke, Titel, der Knopf zum
Anlegen und ein Menüzeichen, darunter die Suche über die volle Breite. Alles
Übrige — die Glocke, offene Aufgaben, Einstellungen, wer angemeldet ist,
Abmelden — liegt hinter dem Zeichen. **Die Suche und „+ Eintrag" bleiben
draußen.**

Dasselbe Menü bekommt auch ein Tablett, das mit dem Finger bedient wird. Ein
Fenster von 1024 Pixeln auf einem Desktop behält die Kopfzeile, die es immer
hatte. Die Tafel schließt sich beim Klick daneben und mit Escape.

**Die vier Unteransichten tragen dieselbe Kopfzeile** — Eintrag, Systembereich,
offene Aufgaben und Vergleich. Sie trägt vier Dinge: zurück zur Übersicht, die
Marke, das Suchfeld und das Menü. **Keinen Zähler**, **kein „+ Eintrag"**,
**keine Glocke.**

**Das Suchfeld ist eine Tür und kein zweiter Sucher.** Ein Tipp darauf bringt
dich in die Übersicht, und der Schreibstrich steht dort schon im Feld.
**Zwei Stellen tragen es nicht:** im Systembereich steht es auf keinem Gerät,
und auf dem Telefon in keiner Unteransicht — dort kostete es eine ganze Zeile
(123 Pixel mit ihm, 69 ohne). Am Schreibtisch trägt es Eintrag, offene Aufgaben
und Vergleich unverändert.

### Von einem Eintrag zum nächsten

**Zwei breite Knöpfe am Fuß des Eintrags** — *„‹ Voriger"* und *„Nächster ›"* —
blättern durch die Einträge in **der Reihenfolge, die die Übersicht zuletzt
gezeigt hat**, mit ihrem Filter und ihrer Sortierung. Wer mit einem Suchbegriff
in einen Eintrag gegangen ist, blättert durch die Treffer.

Sie stehen am Ende und nicht oben; wer früher wechseln will, muss erst ans Ende
scrollen. **Am ersten und am letzten Eintrag ist der jeweilige Knopf gedämpft
und bleibt stehen.**

**Wer einen Eintrag über seine Adresse aufruft oder die Seite neu lädt, hat
keine Reihenfolge** — dann sind beide Knöpfe gedämpft. Die Reihenfolge lebt im
Browser und in dieser Sitzung; sie wird nicht gespeichert und nicht am Server
nachgefragt.

**Es gibt keine Taste dafür und keine Wischgeste.** Beides ist in dieser Ansicht
vergeben: `←` und `→` blättern durch die Bilder des Eintrags, quer wischen tut
dasselbe, und `Bild auf`/`Bild ab` rollen die Seite.

### Auf den Startbildschirm legen

**Die Installation lässt sich als Anwendung ablegen.** Im Browser des Telefons
„Zum Startbildschirm hinzufügen" — danach liegt dort ein Zeichen, das die
Installation unter ihrem eigenen Namen öffnet, ohne Adresszeile darüber. Der
Name kommt aus der Einstellung **„Öffentlicher Titel"**.

**Es wird nichts zwischengespeichert und läuft nichts im Hintergrund.** Kein
`service worker`, keine Offline-Ablage. **Ohne Netz öffnet sich also nichts.**

### Die Glocke und der Zähler „Offen"

*(auf jedem Gerät — die Kopfzeile ist eine, und was in ihr steht, wandert auf
dem Telefon von selbst hinter das Menüzeichen.)*

**Die Glocke trägt einen Punkt, der Knopf „Offen" eine Zahl.** Die beiden
Zeichen werden nirgends vertauscht.

**Ein Klick auf die Glocke öffnet eine Tafel** mit den Einträgen, an denen etwas
hinzugekommen ist, und **jede Zeile führt zu ihrem Eintrag**.

**Die Tafel ist nach Herkunft geteilt — drei Abschnitte:**

| | |
|---|---|
| **An mich gerichtet** | Einträge, unter denen ein neuer Kommentar dich mit `@name` **markiert** |
| **Meine Einträge** | was unter Einträgen geschieht, die **dir gehören** |
| **Alles andere** | der Rest |

**Eine Zeile steht in genau einem Abschnitt**, und zwar im obersten, der auf sie
zutrifft. Am Zeichen selbst bleibt es bei einem Punkt und einer Zahl.

**Was die Glocke verspricht:** **Kommentare** und **Bewertungen** seit dem
letzten Öffnen der Tafel — **von den anderen. Die eigenen meldet sie nicht.**
Wer allein an einer Installation arbeitet, bekommt deshalb nie eine Meldung.

**Jede Zeile sagt, was neu ist:** „3 Kommentare · 4 Bewertungen" statt „7 neue
Beiträge". Bei nur einer Art steht auch nur eine Angabe da. **Was davon dich
markiert, steht daneben:** „3 Kommentare · **@1**", mit dem vollen Satz am
Mauszeiger. Es ist eine Teilmenge und keine zweite Zahl.

**Darunter steht, von wem** — und zwar nur zu den Kommentaren. **Wer welche
Bewertung abgegeben hat, bleibt anonym**; eine Zeile, an der ausschließlich
Bewertungen neu sind, trägt keinen Namen.

**Was sie nicht verspricht:**

- **Sie rechnet beim Aufbau der Übersicht nach, nicht laufend.** Was in dieser
  Minute entsteht, steht beim nächsten Laden da.
- **Sie führt keinen Lesestand je Meldung.** Das Öffnen der Tafel setzt alles
  auf gesehen, auch was man gleich nicht anklickt: gespeichert wird ein
  Zeitstempel.
- **Bewertungen ohne Zeitpunkt bleiben ihr unsichtbar.** Ältere Bewertungen
  tragen keinen.
- **Vor dem ersten Verlassen der Übersicht gibt es sie gar nicht** — vorher
  steht kein Bezugspunkt in der Datenbank.
- **Sie meldet Kommentare und Bewertungen — sonst nichts.** Ein geänderter
  Titel, eine neue Datei, ein neuer Testtag stehen nicht darin.

**Der Zähler „Offen"** summiert die offenen Aufgaben über den ganzen Bestand,
gerechnet aus derselben Bedingung wie die Ansicht dahinter. **Ohne offene
Aufgaben steht dort keine Null.** Beide Zahlen reisen mit einer Antwort mit, die
die Übersicht ohnehin holt.

### Die Filter

Sie stehen auf dem Telefon **eingeklappt** und öffnen sich auf einen Druck.
**Der Schalter nennt die Zahl der greifenden Filter** — eine Liste, die ohne
sichtbaren Grund unvollständig ist, ist ein Fehler und keine Ansicht. Die
Sortierung zählt nicht mit; sie nimmt nichts weg. **Der Zustand ist
Ansichtszustand und keine Einstellung:** beim nächsten Aufruf steht wieder die
Vorgabe.

Auf einem Tablett steht der Schalter ebenfalls da, die Filter fangen dort aber
**offen** an.

### Die Kästen der Übersicht

**Auf dem Telefon ist ein Block kein Kasten, sondern ein Abschnitt:** ein
Trennstrich darüber, ein Titel, der Inhalt. Damit bleibt genau **eine**
Kastenebene übrig — die Kommentarkarte, die Linkzeile, die Dateizeile —, und
die steht auf voller Breite, bündig unter dem Bild darüber. Alles, was in dieser
Flucht steht, rundet mit demselben Radius.

### Was sonst noch anders ist

- **Der Titel steht vor dem Bild.**
- **Zwei Karten nebeneinander** statt einer.
- **Dialoge steigen von unten auf** und liegen am unteren Rand an. Die Knöpfe
  stehen untereinander über die volle Breite, der eigentliche Vorgang oben.
- **Am Bildbereich blättert ein Wisch**, wie im Vollbild. Die Pfeile bleiben
  stehen. Auf der Abspielsteuerung eines Videos blättert er nicht.
- **Gelöscht wird am großen Bild und nicht an der Vorschaukachel.** Oben rechts
  im Bildbereich steht eine Reihe von Zeichen: Ausschnitt, beim Video Vollbild,
  und abgesetzt davon der Papierkorb. Mit der Maus bleibt das Kreuz an der
  Kachel, wo es war.
- **Der Bildstreifen füllt die Breite — auf jedem Schirm.** Er steht als Raster,
  das seine Spalten selbst auszählt. Links und rechts bleibt derselbe Rand wie
  überall auf der Seite. Die Mindestgröße der Kacheln kommt aus der Karte
  „Darstellung".
- **Eingabefelder fallen nicht unter 16 Pixel.** Darunter zoomt Safari auf dem
  iPhone beim Antippen die ganze Seite heran.
- **Die Aussparung des Geräts wird mitgerechnet** — Kopfzeile, Vollbild,
  Meldungen und die Vergleichsleiste.
- **Die Leiste des Browsers nimmt die Farbe der Installation.**

### Berühren, halten, wischen

Sortieren und Scrollen teilen sich auf einem Berührungsbildschirm denselben
Zeiger. **Mit der Maus wird sofort gezogen, mit dem Finger erst nach kurzem
Halten** (0,4 Sekunden). Bewegt sich der Finger vorher, war es ein Wisch.
Sobald gegriffen ist, meldet das die Zeile mit einem Rahmen, und das Gerät
gibt einen kurzen Impuls.

**Am Eintrag scrollt keine Liste in sich selbst.** Die Listen werden
abgeschnitten statt scrollbar gemacht, und der Weg zum Rest ist der
Aufklappknopf darunter. Die Karten in den Einstellungen sind die Ausnahme: dort
steht ein Deckel statt eines Aufklappknopfes.

Zeilenaktionen sind überall Zeichen (`✎` bearbeiten, `✕` löschen), nicht mal
Text und mal Zeichen.

**Die Vorschaukachel ist die eine Ausnahme.** Ihr Kreuz maß mit Fingermaßen 27
Pixel auf einer Kachel von 62, in der Ecke, auf der der Daumen beim Wischen
aufsetzt. Auf dem Berührungsbildschirm steht es deshalb **gar nicht** mehr da
statt unsichtbar.

Im Vollbild **zoomt mit der Maus ein Klick, mit dem Finger erst der zweite
Tipp** innerhalb einer knappen Sekunde. Ein einzelner Tipp tut nichts. Die
Pfeile zum Blättern bleiben auch im herangezoomten Bild stehen.

**Nach dem Zoom steht die Mitte des Bildes im Blick**, und in jede Richtung
lässt sich schieben. Ist das Original kleiner als die Fläche, sitzt es mittig.

**Was beim Überfahren erscheint, steht auf dem Finger dauerhaft da** — Kreuze,
Stifte, Blätterpfeile, der Knopf für den Bildausschnitt. **Und was sich beim
Überfahren bewegt, bewegt sich auf dem Finger nicht.**

**Ein Tipp löst sofort aus.** Ohne besondere Angabe hält der Browser jede
Berührung eines Knopfes rund 300 Millisekunden zurück. **Im Vollbild ist der
zweite Tipp ausgenommen** — dort zoomt er aufs Original.

## Sprache

**Kriterion spricht Deutsch, Englisch und Türkisch, und jeder stellt für sich
ein, welche Sprache er liest** — in „Einstellungen → Persönlich → Darstellung".
Der Wechsel wirkt sofort, ohne Neuladen. Die Sprache gehört dem Zugang und
nicht der Installation.

**Die Anmeldeseite spricht die Vorgabesprache der Installation** — dort gibt es
nichts umzuschalten. Wer angemeldet ist, liest in seiner eigenen.

**Wer angemeldet ist und nichts eingestellt hat, bekommt, was sein Browser
verlangt.** Kriterion sieht sich `Accept-Language` an — steht die Sprache
nicht zur Wahl, gilt die Vorgabe der Installation.

**Der Eigentümer bestimmt beides** in „Einstellungen → Installation →
Sprachen": **die Vorgabesprache** der Installation und **den Vorrat**, aus dem
ein Benutzer wählen darf. Was nicht freigegeben ist, taucht nirgends auf, auch
nicht vor der Anmeldung. **Die Vorgabesprache ist immer im Vorrat.**

**Ein bestehender Bestand spricht weiter Deutsch.** Nur eine frisch
eingerichtete Installation startet auf Englisch.

### Eine eigene Sprache dazulegen

**Das Verzeichnis ist die Liste.** Unter `public/languages/` liegt je Sprache
eine Datei — `de.json`, `en.json`, `tr.json`. Wer eine vierte hineinlegt und
den Container neu startet, hat eine vierte Sprache: sie steht dann in der Karte
„Sprachen" zur Freigabe. Türkisch ist genau so hinzugekommen.

| | |
|---|---|
| **Der Dateiname** | die Sprachkennung nach BCP 47 und `.json` — `tr.json`, `pt-BR.json`. Ein anderer Name wird übergangen |
| **Der Kopf der Datei** | `"_locale"` (etwa `"tr-TR"`, für Datum, Zahl und Mehrzahl) und `"_name"` (der Eigenname, den die Pille zeigt — „Türkçe") |
| **Der Inhalt** | dieselben Schlüssel wie `de.json`. **Fehlende sind erlaubt** — sie fallen auf die Vorgabesprache zurück |

**Eine unbrauchbare Datei hält den Start nicht auf.** Kaputtes JSON, eine
`_locale`, die niemand kennt, ein Dateiname, der keine Sprachkennung ist: die
Datei zählt nicht, der Grund steht im Protokoll des Containers, und die
Installation läuft weiter.

```
docker compose logs kriterion | grep '\[languages\]'
```

## Vokabular

Kriterion nennt seine Gegenstände ab Werk „Eintrag", das Merkmal
„Getestet/Ungetestet" und die Zeitpunkte „Testtag/Testtage". Wer etwas anderes
sammelt, ändert diese fünfzehn Wörter in den Einstellungen — aus „3 Einträge"
wird „3 Maschinen", aus „+ Testtag eintragen" wird „+ Sitzung eintragen".
**Das zwölfte ist „Potenzial"**, der Name des ersten Sternkastens.
**Das dreizehnte und vierzehnte sind „Bewertung" und „Bewertungen"** — sie
ändern den Kastenkopf, die Sortierung, den Vergleich, die Kachel und die Karte
der Kriterien. **Das fünfzehnte ist „Note"** — die Zahl, die an einem Testtag
steht; die Sortierungen „Durchschnitt: Note" und „Zuletzt: Note" gehen mit.

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

Leere Felder fallen auf die Vorgabe zurück, ein Knopf stellt alle fünfzehn
zurück. Eine Probe unter den Feldern zeigt vor dem Speichern, wie die Wörter in
echten Textbausteinen aussehen.

**Die fünfzehn Wörter gibt es je Sprache.** Über den Feldern steht eine
Sprachzeile, sobald mehr als eine Sprache freigegeben ist; der Eigentümer
pflegt die englischen Wörter, während seine eigene Oberfläche deutsch bleibt.
**In den Feldern steht, was für diese Sprache eingetragen ist — und sonst
nichts.** Was stattdessen am Bildschirm steht, sagt der Hinweis darunter
(„Vorgabe: Eintrag") und die Probe.
**Wo für eine Sprache nichts eingetragen ist, gilt der zuerst angelegte Satz**,
und wo überhaupt nichts steht, die Vorgabe der jeweiligen Sprachdatei.

**Dasselbe gilt für die Namen der Kategorien und der Kriterien.** Über beiden
Listen steht dieselbe Sprachzeile. **Übersetzt wird nichts von selbst:** wer
keine zweite Fassung einträgt, dessen Leser sehen die erste — und die
Bewertungen hängen unverändert an ihrem Kriterium, in jeder Sprache.

**Wo für die gezeigte Sprache nichts eingetragen ist, steht ein anderer Name da
— und darunter, gedämpft, welcher.** Der Name selbst steht dann blass und
kursiv. **Die Kette hat vier Schritte, und sie gilt für jeden Leser** —
angemeldet oder nicht, Admin oder nicht:

| | |
|---|---|
| **1.** | was für **deine** Sprache eingetragen ist — ohne Vermerk |
| **2.** | sonst der Eintrag der **Vorgabesprache** der Installation |
| **3.** | sonst der Eintrag in der **Sprache, in der die Zeile angelegt wurde** |
| **4.** | sonst der **Originaltext** — mit dem Vermerk „Sprache unbekannt" |

**Jeder Name weiß, in welcher Sprache er geschrieben ist**, und der Vermerk
nennt sie. Ein Wechsel der Vorgabesprache verschiebt deshalb keinen Namen: er
ändert nur, welche Sprache im zweiten Schritt gefragt wird.

**Schritt 4 tritt nur bei Namen auf, für die in der Datenbank nicht steht, in
welcher Sprache sie geschrieben sind** — dem Bestand aus einer Fassung ohne
diesen Vermerk. Dort steht dann „Sprache unbekannt" daneben. **Die Karte
„Kategorien" fragt einmal nach:** ein Kasten nennt die Zahl und bietet einen
Knopf *„alle als ⟨Sprache⟩ eintragen"*. Stell die Pille auf die Sprache, in der
du deinen Bestand eingetragen hast, und drück ihn — danach ist der Kasten weg
und kommt nicht wieder. Neue Zeilen bekommen ihre Sprache beim Anlegen.

**Die Sprachzeile sagt, wo noch Arbeit liegt.** Hinter jeder Sprache steht
entweder ein **Punkt** — für jede Zeile ist etwas eingetragen — oder die
**Zahl** der fehlenden Einträge. **Fehlt der gerade gezeigten Sprache etwas,
bekommt die Kachel einen roten Rahmen.** Dasselbe gilt für die Kachel
„Vokabular"; dort heißt „fehlt", dass für diese Sprache kein eigenes Wort
eingetragen ist — es gilt dann die Vorgabe der Sprachdatei, und die steht unter
jedem Feld.

Das Umbenennfeld bleibt bei einem Rückfall leer und zeigt ihn nur als
Platzhalter: gespeichert wird nur, was jemand wirklich eingetippt hat.
**Weggeräumt wird ein Eintrag mit dem Zeichen neben dem Namen**, mit Rückfrage.
Der Originaltext lässt sich nicht wegräumen — er ist der Name der Zeile.

> **WER DIE VORGABESPRACHE WECHSELT, BEKOMMT ES GESAGT.** In der Karte
> „Sprachen" steht darunter, was der neuen Vorgabesprache fehlt — Namen und
> Vokabelwörter, mit Zahl. **Verhindert wird nichts:** die Vorgabesprache darf
> auf eine lückige Sprache stehen, und die Kette hält jede Liste lesbar.
## Hell oder dunkel

**Kriterion hat zwei Farbschemata, und jeder stellt für sich ein, welches er
sieht** — in „Einstellungen → Persönlich → Darstellung", drei Stufen:

| | |
|---|---|
| **Hell** | die helle Oberfläche, immer |
| **Dunkel** | die dunkle, immer — **die Vorgabe** |
| **Auto** | folgt der Einstellung des Betriebssystems und wechselt mit ihr, ohne Neuladen |

**Wer nichts einstellt, bekommt dunkel.** Die Einstellung gehört dem Zugang und
nicht der Installation: zwei Leute an derselben Installation können
verschiedene Schemata sehen.

**Das Vollbild bleibt in beiden Schemata dunkel** — im hellen dunkelgrau statt
fast schwarz. Ein fast schwarzes Umfeld lässt Fotos heller und kontrastreicher
erscheinen, als sie sind; Bildwerkzeuge sitzen deshalb alle bei rund 20 Prozent
Helligkeit.

**Beim Öffnen blitzt nichts auf.** Der Browser merkt sich die letzte Wahl und
malt gleich richtig — auch vor der Anmeldung. Zwei Leute an einem Browser: der
zweite sieht für Sekundenbruchteile das Schema des ersten, dann berichtigt der
Server.

*Wie die Farben zustande gekommen sind — jeder Wert gemessen, nicht
ausgerechnet — steht in `Doku/Farbkonzept_0_23_0.md`.*

## Schriftgröße

**Die Einstellung in den Einstellungen vergrößert oder verkleinert die Schrift der
ganzen Oberfläche**, in fünf Stufen von 80 auf 120 Prozent. **Die Abstände
gehen nicht mit** — bei 120 % wird es deshalb an einigen Stellen enger, dafür
verschiebt sich das Gefüge nicht. Die Anmeldeseite
bleibt bei der Vorgabegröße, weil der Endpunkt vor der Anmeldung nur den
öffentlichen Titel ausliefert.

## Dateien am Eintrag — wie sie abgesichert sind

**Eine Installation darf niemals so ausgeliefert werden, dass der Browser sie als
Webseite ausführt.** Wer an `attachments.js` etwas ändert, sollte das hier gelesen
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
6. **Der Dateiname wird für den Header entschärft.** Zeilenumbrüche würden
   erlauben, weitere Header einzuschleusen; Anführungszeichen würden den
   Wert beenden. Umlaute kommen über `filename*=UTF-8''` durch.
7. **Text, Markdown, CSV und Log werden gar nicht als Datei ausgeliefert.** Der
   Server liest sie und schickt sie als JSON; die Oberfläche setzt sie als Text
   in die Seite. Der Browser interpretiert diese Inhalte damit überhaupt nie.
8. **PDF wird in einem `iframe` mit `sandbox="allow-scripts"` angezeigt** —
   ausdrücklich **ohne** `allow-same-origin`. Die eingebauten PDF-Betrachter von
   Chrome und Edge bestehen selbst aus HTML und JavaScript und bleiben ohne
   `allow-scripts` leer; ohne `allow-same-origin` liegt das Dokument in einem
   eigenen, fremden Ursprung und sieht von der Anwendung nichts. Die Lockerung
   gilt **nur für PDF**. Daneben steht immer ein Verweis „In neuem Tab öffnen",
   falls ein Browser das Einbetten trotzdem verweigert.

**Fotos folgen derselben Regel** — und in beiden Richtungen. Beim
**Hochladen** wird das Ergebnis geprüft, nicht die Angabe: was `sharp` nicht als
JPEG, PNG, WebP, AVIF, GIF oder TIFF liest, wird abgewiesen. Eine SVG kommt
damit gar nicht erst herein — sie bestand den alten Filter, weil sie sich
`image/svg+xml` nennt. Beim **Ausliefern** entscheiden die ersten Bytes, nie der
gespeicherte Typ: alles Unerkannte geht als `application/octet-stream` zum
Herunterladen heraus. Damit ist auch geschützt, was schon vorher in der
Datenbank lag. Die Spalte `photos.mime_type` bleibt stehen und wird weiter
angezeigt; sie ist eine Anzeige, keine Grundlage der Auslieferung.

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
`script-src` — dort steht `'unsafe-inline'` nicht. Dazu kommt
`media-src 'self' blob:`: `'self'` trägt das Abspielen aus der eigenen
Installation, `blob:` das Standbild vor dem Hochladen. Ohne die zweite Angabe
verwirft der Browser wortlos die Adresse, an der die Oberfläche das Standbild
zieht — es ließe sich überhaupt kein Video hochladen.

**Bilder in Kommentaren sind der eine Fall, in dem doch beim Hochladen
geprüft wird:** dort ist ausschließlich Bild erlaubt, jede Datei geht durch
`sharp` und wird neu kodiert gespeichert. Eine als `.png` getarnte HTML-Datei
kommt gar nicht erst in die Datenbank. Ausgeliefert werden sie nach denselben
Regeln wie alles andere.

**Bei Anhängen wird bewusst nicht nach Typen gefiltert.** Eine Positivliste
dort wäre durch Umbenennen zu umgehen. Die Sicherheit hängt vollständig an der
Auslieferung.

**Links im Kommentartext hängen an zwei Schranken.** Erstens erkennt die
Zerlegung ausschließlich `http://`, `https://` und `www.` — `javascript:` und
`data:` können dort gar nicht erst passen. Zweitens wird der String
unmittelbar vor dem Setzen von `href` noch einmal gegen `^https?://` geprüft;
fällt sie durch, wird sie als gewöhnlicher Text gezeichnet statt als Link. Dazu
`target="_blank"` und `rel="noopener noreferrer"`. Der Text selbst kommt nie
über `innerHTML` in die Seite, sondern als echte Knoten (`createTextNode` für
Text, `createElement('a')` mit `textContent` für Links). Die zweite Schranke
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
kann, kann es auch nicht hochladen, und **das Standbild belegt nichts** — es
ist eine Vorschau, keine Aussage über den Inhalt der Datei.

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
zwei Drittel kleiner, und an hundert Bildern des echten Bestands gemessen weicht
der schlimmste einzelne Farbwert um **2 von 255** ab. **JPEG, GIF und
vorhandenes WebP bleiben unberührt**, und ein PNG, das als WebP größer wäre,
bleibt PNG.

**Es ist eine Wahl aus drei Verfahren und kein Häkchen.** In
den Einstellungen unter **Datenbank → Bildformate** steht die Karte „Verfahren
der Ablage" mit drei Zeilen; die gewählte trägt den Knopf **Standard**
(nur der Eigentümer, dieselbe Rechtezeile wie Export, Sicherung und Schlüssel):

| Verfahren | was es tut |
|---|---|
| **PNG** | nichts wird umkodiert — keine Rechenzeit, größte Ablage. Jedes PNG bleibt byte-genau so liegen, wie es ankam |
| **WebP verlustfrei** | `nearLossless` 60 — **die Vorgabe** |
| **WebP verlustbehaftet** | Qualität 90 — für Fotos aus der Zwischenablage, gemessen rund zwei Drittel kleiner |

**Das dritte Verfahren hat eine Auflage, und die Karte sagt sie:** verlustbehaftet
lohnt sich nur bei **Fotos**. An einem **Bildschirmfoto mit Text** ist es
gemessen ein Vielfaches **größer** als verlustfrei — der verlustbehaftete
Bitstrom (VP8) kann mit harten Kanten nichts anfangen, der verlustfreie (VP8L)
kann genau das. Und woher ein PNG kommt, ist seinen Bytes nicht anzusehen: die
Wahl gilt für alles, was hereinkommt.

**Eine Datei hochzuladen ist etwas anderes, als sie einzufügen.** Die
Zwischenablage trägt keine Datei, sondern Bildpunkte; der Browser legt sie als
PNG ab, und das ist oft ein Vielfaches der ursprünglichen Datei — aus einem
5,21-MB-JPEG im Netz wurden gemessen 34,79 MB. **An der Einfügestelle steht
deshalb ein Satz, der die Folge nennt** *(„Das Einfügen über die Zwischenablage
führt zu erheblich größeren Dateien.")*.

**Daneben steht der Knopf „Vorhandene Bilder konvertieren"** für den vorhandenen
Bestand — er fragt vorher das Passwort und sagt, was er tut: die alte Fassung
ist danach weg, und zurück führt nur eine vorher angelegte Sicherung des
Datenverzeichnisses. **Das Umschalten allein rührt den Bestand nicht an.**

Zusätzlich entstehen zwei kleinere Varianten: eine
Kachel (512 × 512, mit dem eingestellten Bildausschnitt darin) für die
Übersicht und eine mittlere (1600 px auf der langen Kante, ungeschnitten) für
Detail- und Vollbildansicht. Das kostet rund 7 % mehr Speicher, spart beim Blättern aber
etwa den Faktor 100 an Datenübertragung. Das Original wird erst geladen, wenn im
Vollbild gezoomt wird. **Beide Varianten sind immer WebP** und folgen der Wahl
oben nicht: sie sind ohnehin verlustbehaftet, und niemand archiviert sie. Die
Zahlen dahinter sind neu gesetzt und nicht übernommen — `thumb` auf Qualität 82,
`medium` auf 78; dieselbe Zahl bedeutet in JPEG und WebP nicht dasselbe.
Gemessen an drei Bildarten spart das bei der Kachel 52 / 5 / 6 % und bei der
mittleren 9 / 27 / 30 % — bei durchweg **kleinerer** Abweichung als vorher.
**Der Knopf „Vorhandene Bilder konvertieren" zieht die Originale nach**, nach
dem gewählten Verfahren. **Die Vorschaubilder fasst er nicht an** — sie sind
ohnehin schon WebP. **Liegt kein PNG mehr da oder ist „PNG" gewählt, ist der
Knopf tot.**

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

**Die Sicherung auf Knopfdruck** steht in den Einstellungen beim Eigentümer.
Sie erzeugt über `VACUUM INTO` eine vollständige, verschlüsselte Kopie der
Datenbank — konsistent, auch während gearbeitet wird. Die Karte nennt vorher,
wie lange es dauert; **während die Kopie entsteht, steht die Installation
still** (rund zehn bis zwanzig Millisekunden je Megabyte). Sie zeigt außerdem,
wann zuletzt gesichert wurde — gelesen im Sicherungsordner selbst, nicht aus
einem Merker in der Datenbank.
**Und sie zeigt, welche Kopien noch mit dem alten Schlüssel verschlüsselt
sind**, falls je gewechselt wurde: jede Kopie, die älter ist als der Wechsel,
wird rot markiert. Ist auch die jüngste älter, sagt die Karte, dass überhaupt
keine zum heutigen Schlüssel passt.

**Alte Kopien lassen sich entfernen, ohne dass du eine Shell öffnest.** Jede
Kopie ist so groß wie die ganze Datenbank. Zuständig ist die Karte **„Alte
Sicherungen"** neben der Sicherungskarte.

> **Die Regel hat zwei Bedingungen, und beide müssen zutreffen: eine Kopie
> fällt nur, wenn sie NICHT unter den jüngsten N ist UND älter als X Tage.**

**Was du wissen musst, bevor du den Schalter umlegst:**

- **Er steht auf AUS.** Bis du ihn umlegst, ändert sich an deinem
  Sicherungsordner nichts.
- **Aufgeräumt wird nur im Anschluss an eine Sicherung, die gelungen ist** —
  oder auf Knopfdruck. **Eine Zeitsteuerung gibt es nicht.** Schlägt die
  Sicherung fehl, bleibt jede Kopie liegen.
- **Die Karte zeigt vorher, was daliegt und was fällt.** Sie listet alle
  Sicherungen mit Nummer, Datum, Alter und Größe und markiert die, die beim
  nächsten Lauf fallen. Einen Papierkorb gibt es dafür nicht.
- **Angefasst wird ausschließlich, was dem Namensschema der Installation
  entspricht** (`kriterion-….sqlite`), nur im eingestellten Ordner, **nie in
  Unterverzeichnissen**, und nur, was wirklich eine Datei ist — ein Symlink ist
  keine Sicherung. **Eine eigene Datei, die du dort ablegst, bleibt liegen.**
- **Kopien von vor einem Schlüsselwechsel fasst die Regel gar nicht an.** Sie
  stehen in der Karte getrennt, mit eigener Zahl und eigener Summe, und haben
  einen eigenen Knopf.
- **Jede Löschung steht im Sicherheitsprotokoll**, unter „Bestand" — eine Zeile
  je entfernter Kopie, **ohne Dateinamen und ohne Pfad**.

**Der Sicherungsordner wird eingehängt, nicht eingetippt.** Die
`docker-compose.yml` bringt ihn mit:

```yaml
    volumes:
      - ./data:/app/data
      - ./kriterion-sicherung:/app/sicherung
    environment:
      - BACKUP_DIR=/app/sicherung
```

Beide Zeilen gehören zusammen und stehen in derselben Datei: ein Pfad ohne
Einhängung schriebe in eine Schicht des Containers, die beim nächsten
`docker compose up --build` verschwindet. In der Oberfläche lässt sich darunter
ein **Unterverzeichnis** wählen; es muss dort schon liegen, angelegt wird
keines.

> **Die Vorgabe legt den Ort ins Projektverzeichnis. Die empfohlene Lage ist
> daneben.** Die Karte „Sicherung" markiert den Ort im Projektverzeichnis
> **rot**, einen Ort außerhalb **grün**. Dagegen sprechen: beim Einspielen
> einer neuen Version wird das Projektverzeichnis umbenannt und die Sicherungen
> wandern mit; ein Fehlgriff am Projektordner nähme Original und Sicherung auf
> einmal; beide liegen auf derselben Platte.
>
> **Umgestellt wird es in der `docker-compose.yml`, beide Zeilen zusammen:**
>
> ```yaml
>       - ../kriterion-sicherung:/sicherung
>     environment:
>       - BACKUP_DIR=/sicherung
> ```
>
> Dann entfällt auch die zusätzliche Zeile im Einspielweg. Ein relativer Pfad
> löst `docker` gegen den Ort der `docker-compose.yml` auf.
>
> **Die Anzeige hängt an der Spiegelung:** was auf dem Wirt unter `./` liegt,
> gehört im Container unter `/app`, was daneben liegen soll, daneben.

**Ohne die beiden Zeilen bleibt die Karte aus und sagt das.**

**Die Kopie von `./data`** bleibt der Weg für den angehaltenen Server:
`docker compose down` beendet ihn sauber, schließt die WAL-Datei ab und die
Datenbank. Wer im Anschluss kopiert, kopiert einen vollständigen Stand. Wurde
ein eigener `ENCRYPTION_KEY` gesetzt, gehört dieser **getrennt davon**
aufbewahrt.

**Der JSON-Export** ist der Austauschweg: unabhängig von Datenbankformat und
Schlüssel, dafür unvollständig (Sitzungen, Einstellungen und die Blockanordnung
fehlen) und mit der ganzen Datei im Arbeitsspeicher. Es lässt sich auch ein
einzelner Eintrag als Datei ziehen.

> **Und daran hat die eine Datei ihre Grenze.** Sie ist ein einziger Text, und
> länger als **512 MB** kann ein Text in Node nicht werden — Fotos und Videos
> stecken als Base64 darin und kosten ein Drittel Aufschlag. Die Karte
> **Export** rechnet das vorher aus und warnt ab **300 MB**; darüber sagt die
> Installation ab, bevor sie anfängt. Beim **Import** gilt dieselbe Grenze,
> dort aber vorab sichtbar.
>
> **„In Teilen exportieren"** schreibt so viele vollständige Exportdateien, wie
> es braucht, und der vorhandene Import nimmt sie mit „Zusammenführen" wieder
> auf. Die Grenze gilt je Datei.
>
> **Bestätigt wird dabei einmal** — Passwort und, wenn der Zugang einen zweiten
> Faktor trägt, ein Code. Danach lädst du jeden Teil selbst.
>
> **Für eine Kopie zum Zurückspielen bleibt die Sicherung der kürzere Weg** —
> ein Knopfdruck statt n Dateien, und sie braucht keinen nennenswerten
> Arbeitsspeicher.

> **Vor einer Version, die die Datenbank anfasst, ist die Sicherung Pflicht.**
> Ob eine Version das tut, steht im `CHANGELOG.md` über ihren Änderungen, und
> ausführlich im Änderungsprotokoll der Version.
>
> **Rüstet sie eine Spalte nach**, lässt sich der Bestand danach nicht mehr
> ohne Weiteres auf die vorige Version zurückbringen. Der Weg zurück ist dann
> die Sicherung, die vor dem Einspielen entstanden ist.
>
> **Legt sie nur eine neue Tabelle an**, sieht eine ältere Version die gar
> nicht an — und was darin steht, ist nach einem Downgrade unerreichbar, ohne
> dass etwas danach aussieht. Was im Papierkorb liegt, ist dann nicht
> wiederherstellbar; ein Zugang, der über einen Link angelegt und noch nicht
> eingelöst wurde, bekommt von der älteren Version keinen neuen Link — dort
> hilft nur `node usertool.js passwort <name>`.

## Datenmodell

Die Datenbankdatei heißt `katalog.sqlite`. Der Dateiname wandert bei einer
Umbenennung des Projekts bewusst **nicht** mit: ein anderer Name ließe den
Start eine leere Neuinstallation vermuten.

- `items` — Titel, Beschreibung, Getestet-/Abgelehnt-Merkmal, Kategorie. **Zur
  Ablehnung gehören drei Spalten:** `rejected_at` (wann), `rejected_grund`
  (warum, eine Zeile) und `rejected_von` (wer). Alle drei dürfen leer sein.
  „Getestet" hat keine davon: es ist ein Zustand und keine Entscheidung
- `item_pins` — der **Favorit**, je Benutzer und je Eintrag; nur Zeilen für
  tatsächlich Markiertes. Die Spalte `items.favorite` bleibt ungenutzt im
  Schema und wird nie beschrieben. Die Anpinnung der **Kommentare**
  (`comments.pinned`) ist etwas anderes
- `photos` — Original, Kachel und mittlere Variante, mit Reihenfolge
- `links` — Adressen mit Reihenfolge **und Verfasser**
- `test_days` — ein Eintrag je Tag mit Gesamtnote, eindeutig pro Eintrag, Tag
  **und Benutzer**
- `rating_criteria` / `ratings` — gemeinsame Kriterien mit frei bestimmbarer
  Reihenfolge **und Gewicht** (`gewicht`, 0,2 bis 2, Vorgabe 1), Werte je
  Eintrag und je Benutzer. Reihenfolge steuert die Anzeige, Gewicht die
  Rechnung. **`phase` sagt, zu welchem der beiden Sternkästen ein Kriterium
  gehört** — `vorher` (Potenzial) oder `nachher` (Bewertung), Vorgabe
  `nachher`; der Name bleibt über beide Kästen hinweg eindeutig. **`ratings`
  trägt keine Phase** — zu welchem Kasten ein Stern gehört, sagt sein
  Kriterium. **`ratings.gesetzt_am` hält den Zeitpunkt der letzten Setzung**
  für die Glocke. Er heißt nicht `created_at`, weil die Zeile beim ersten
  Stern entsteht und danach überschrieben wird, und er hat **keinen
  Vorgabewert**: ältere und **eingespielte** Bewertungen stehen ohne Zeitpunkt
  da, und die Glocke übergeht solche Zeilen
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
- `settings` — die **globale** Hälfte: Titel, Vokabular, die Suchmaschinen
  (Vorrat, eigene, Standard), die beiden Schalter, wer neue Tags und Kategorien
  anlegen darf, und das **Verfahren der Bildablage** (`imageStore`, ein Wert aus
  dreien; eine Zeile aus einer älteren Fassung unter anderem Namen bleibt
  unbeachtet stehen). Sache des Admins — das Verfahren der Bildablage nur des
  **Eigentümers**, in derselben Rechtezeile wie Export, Sicherung und Schlüssel
- `user_settings` — die **persönliche** Hälfte, **zehn** Schlüssel: zuletzt
  benutzte Filterwahl, gespeicherte Ansichten, Bezugspunkt der Glocke,
  Farbschema, Schriftgröße, Größe der Bilder im Bildstreifen, Blockanordnung,
  sichtbare Linkzeilen, Zeitleiste und die Zahl der Suchmaschinennamen. Je
  Benutzer eine Zeile pro Schlüssel. Ein Schlüssel aus einer älteren Fassung
  bleibt stehen und wird nicht mehr gelesen; es gibt dafür keinen
  Migrationsblock
- `users` — Zugang als scrypt-Hash, dazu Rolle (`user` < `admin` <
  `eigentuemer`), Adresse, Status und letzte Anmeldung. Gelöschte Benutzer
  bleiben als Zeile ohne Namen (`status = geloescht`, Name `geloescht-<id>`) stehen.
  **Die Adresse wird überhaupt gefüllt** — beim Anlegen durch den
  Admin, danach nur noch durch den Betreffenden selbst
- `sessions` — aktive Anmeldungen, mit `user_id` am Benutzer. In der Karte
  **„Meine Sitzungen"** sieht jeder seine eigenen; adressiert werden sie über
  eine **gerechnete Kennung**, nie über den Sitzungsschlüssel selbst
- `tokens` — Einladungslinks und Links zum Zurücksetzen. **Gespeichert ist nur
  der SHA-256 des Links, nie er selbst**; dazu Benutzer, Anlass, Ablauf und
  wann er eingelöst wurde. Sieben Tage haltbar, einmal gültig; abgelaufene
  Zeilen räumt die Installation nach dreißig Tagen selbst weg
- `anfragen` — die **Warteschlange der Registrierung**:
  Wunschname, Adresse, der SHA-256 des Bestätigungslinks und der Zeitpunkt der
  Bestätigung. **Unbestätigte verfallen nach 24 Stunden** und erscheinen beim
  Admin nie; eine bestätigte wartet, so lange es dauert. Höchstens zwanzig
  offene, je Adresse eine
- `zweifaktor` / `zweifaktor_codes` — der **zweite Faktor**, je Zugang höchstens
  einer. Das TOTP-Geheimnis liegt dort **im Klartext**: es wird nachgerechnet
  und nicht geprüft, deshalb geht es nicht anders; die verschlüsselte Datenbank
  ist die einzige Schicht darüber. Die acht **Wiederherstellungscodes** stehen
  daneben als SHA-256 ohne Salz, jeder genau einmal gültig; eine verbrauchte
  Zeile bleibt stehen, damit die Karte „noch 6 von 8" sagen kann. **Geräumt wird
  hier nichts nach einer Frist** — ein Wiederherstellungscode soll gerade dann
  tragen, wenn das Telefon seit Monaten weg ist
- `sicherheitsprotokoll` — **wer Zugang hatte und wer die Installation als Ganzes
  angefasst hat**. Eine Zeile je Vorgang: Zeitpunkt, was, wer, an
  wem und ein kurzes Merkmal aus einer festen Liste — **kein Freitext, keine
  Namen, keine Adresse**. Beide Benutzerspalten halten einen **Vorgang** fest,
  keine Zugehörigkeit; ein leeres `wer` heißt „über `usertool.js` auf dem Wirt",
  außer bei einer gescheiterten Anmeldung. 180 Tage haltbar, und die Frist ist
  der einzige Weg hinaus
- `papierkorb` / `papierkorb_bytes` — der **Papierkorb**. Eine
  Zeile je gelöschtem Eintrag: Zeitpunkt, Löschender, Titel und das ganze Paket
  im Austauschformat; die Bytes (Fotos, Videos, Dateien, Kommentarbilder)
  liegen daneben in der zweiten Tabelle, eine Zeile je Datei. **Keine
  bestehende Abfrage fasst diese Tabellen an** — ein gelöschter Eintrag ist
  wirklich weg und liegt nur zusätzlich noch als Paket daneben. Deshalb gibt es
  auch **keinen** Zustand `geloescht` an `items`
- `items.user_id` / `comments.user_id` / `test_days.user_id` /
  `ratings.user_id` / `links.user_id` / `attachments.user_id` — der Verfasser,
  an sechs Trägern. `papierkorb.geloescht_von` sieht aus wie ein siebter, ist
  aber keiner: es hält fest, **wer gelöscht hat**, und daran hängt kein Recht.
  Dasselbe gilt für `sicherheitsprotokoll.wer` und `.ziel`.
  `ON DELETE SET NULL` greift nur bei einem `DELETE` von Hand: die Anwendung
  selbst entfernt keine Benutzerzeile, und Bestand ohne Verfasser fällt beim
  Start an den Eigentümer
## Prüfen

```bash
npm install          # einmalig, holt zusätzlich jsdom für die Oberflächenprüfung
npm test
```

Der Prüfstand legt echte Server mit echten, verschlüsselten Datenbanken in
Wegwerfverzeichnissen an — `./data` bleibt unangetastet, alle Installationen
entstehen frisch über Einrichtungsseite und Verwaltung. Er läuft gegen die
Routen und gegen ein echtes DOM, nicht gegen Attrappen: der Mailversand gegen
einen SMTP-Empfänger aus Nodes `net`, der Schlüsselwechsel an einer echten
Datenbank samt Abbruch mit `kill -9`, die Auslieferung von Fotos, Videos und
Anhängen am ausgelieferten Bytestrom.

Was er abdeckt, steht im Projektstand; welche Gruppe wie lange braucht, sagt der
Lauf am Ende selbst. **Ein Teillauf startet nur die Module, die er zeigt:**

```bash
node testbench.js Rechte     # nur die Module mit „Rechte" im Gruppennamen
```

### Wie lange er braucht — und wo die Zeit hingeht

Unter dem Schlussblock steht eine Schlusstafel: die zehn teuersten Prüfgruppen
mit ihrer Zeit und ihrem Anteil, darunter die Zeit in den Gruppen und die des
ganzen Laufs.

```
  DIE TEUERSTEN 10 VON 347 GRUPPEN:
    Der Sprachhelfer und die Ladung              20.4 s    7.8 %
    …
  260.8 s in Gruppen, 261.3 s im ganzen Lauf.
```

**Die Zeit je Gruppe steht nur auf Schalter da:**

```bash
TESTBENCH_TIME=1 npm test
```

### Der Prüfschalter

**Zwei Kosten sind im Betrieb richtig und beim Prüfen sinnlos:** die Kostenstufe
von `scrypt` und die drei Mailfristen. Zusammen sind das rund 75 der
465 Sekunden eines Laufs.

**Der Prüfstand setzt dafür einen Schalter, und der trägt einen einzigen
Namen:**

```
KRITERION_TESTBENCH=pruefstand:scrypt=1024:mail=40:brake=10
```

| Einstellung | was sie senkt | Boden |
|---|---|---|
| `scrypt=<N>` | die Kostenstufe des Passwortspeichers *(ausgeliefert: 16384)* | 1024, und immer eine Zweierpotenz |
| `mail=<Teiler>` | alle drei Mailfristen mit **demselben** Teiler *(ausgeliefert: 20 s / 7 s / 7 s)* | 100 ms |
| `brake=<Teiler>` | die **Wartezeit** der Anmeldebremse — nicht ihre Kurve und nicht ihre Schwellen | 10 ms |

**Was er ausdrücklich nicht kann:**

* **Eine gewöhnliche Umgebungsvariable greift nicht.** `SCRYPT_N=1024` bewirkt
  nichts, `KRITERION_TESTBENCH=1` bewirkt nichts. Nur die vollständige Form mit
  der Marke `pruefstand:` davor wird gelesen.
* **Unter den Boden kommt auch er nicht.** Was darunter steht, wird auf ihn
  gehoben statt abgewiesen.
* **Er senkt keine Schwelle.** Die Anmeldebremse zählt weiter ab fünf weich und
  ab zehn hart, und die harte Sperre dauert ihre fünf Minuten.

**Und er sagt sich an.** Läuft ein Server mit gesetztem Schalter, steht beim
Start eine Zeile im Protokoll:

```
[Kriterion] PRUEFSCHALTER AKTIV (KRITERION_TESTBENCH) — scrypt N=1024,
Mailfristen 500/175/175 ms. NUR FUER DEN PRUEFSTAND — wo jemand damit
arbeitet, gehört er entfernt.
```

**Steht diese Zeile in deinem Protokoll, gehört der Schalter aus der `.env`.**

## Den Schlüssel wechseln

Anlass ist, dass **der Schlüssel in fremde Hand geraten** ist. Der häufigste Weg
dorthin: er lag eine Weile als `data/encryption.key` neben der Datenbank, und
jemand hat in dieser Zeit das Verzeichnis kopiert. Diese Kopie öffnet die Datei
bis heute. **Ein Wechsel ist das einzige Mittel dagegen**; die alte
Schlüsseldatei zu löschen hilft nur gegen künftige Kopien.

Gewechselt wird **auf dem Wirt**, im Projektverzeichnis:

```bash
./keytool.sh zeigen       # Lage ansehen, ändert nichts
./keytool.sh wechseln     # anhalten, sichern, wechseln, starten
```

> **„Keine Berechtigung"?** Dann fehlt dem Skript das Ausführungsrecht — das
> passiert beim Auspacken mit `python3 -m zipfile -e` und unter Windows. Einmal
> `chmod +x keytool.sh`, und es ist erledigt; ohne das Recht geht auch
> `bash keytool.sh zeigen`.

**In der Oberfläche gibt es dafür keinen Knopf.** Steht der Schlüssel in der
`.env`, liegt diese Datei auf dem Wirt und nicht im Image; die Anwendung
erreicht sie nicht. Das Skript zieht Datenbank und `.env` **in einem Zug** nach.

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

Die Probe muss an einem echten Bestand laufen: ein Wechsel an einer leeren
Datenbank ist in Millisekunden vorbei und sagt über 662 MB nichts. Sie nimmt
deshalb eine **Kopie der echten Installation** — mit ihrem Bestand **und ihrer
`.env`**:

```bash
cd .../DockerAppData                       # eine Ebene über dem Projekt
docker compose -f kriterion/docker-compose.yml stop    # ruhige Kopie, offene WAL vermeiden
cp -a kriterion kriterion-probe
docker compose -f kriterion/docker-compose.yml start   # die echte darf sofort weiterlaufen

cd kriterion-probe
rm -rf kriterion-sicherung .git .env.vor-*   # data BLEIBT. .env BLEIBT.
sed -i 's/^    container_name: kriterion$/    container_name: kriterion-probe/' docker-compose.yml
sed -i 's/"3100:3000"/"3199:3000"/' docker-compose.yml
chmod +x keytool.sh
docker compose up -d --build
# auf http://<server>:3199 anmelden — dieselben Benutzer, derselbe Bestand
./keytool.sh wechseln
docker compose logs --tail 30 kriterion
```

> **`data/` und `.env` gehören zusammen.** Wird `data/` gelöscht und ein
> frischer Schlüssel erzeugt, wechselt das Skript den Schlüssel einer **leeren**
> Datenbank; das läuft durch und belegt nichts. Wird `data/` behalten und
> trotzdem ein frischer Schlüssel geschrieben, geht die Datenbank **gar nicht
> mehr auf** — dann scheitert schon der Start. `keytool.sh` selbst stört sich an
> einem vorhandenen `data/` nicht.

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

### Zwei Schlüssel im Umlauf

**Ab dem Wechsel gibt es zwei Schlüssel.** Jede Sicherung, die vorher entstanden
ist, bleibt mit dem **alten** verschlüsselt. Sie ist nicht kaputt — sie braucht
nur einen anderen Schlüssel als die laufende Installation.

Dagegen stehen drei Dinge:

* **Der alte Wert bleibt auskommentiert in der `.env` stehen**, mit Datum, mit
  dem Namen dessen, der gewechselt hat, und mit dem Satz, wofür er noch gut
  ist. **Nicht löschen, bevor er im Passwortspeicher steht.**
* **Die Karte „Sicherung" markiert jede Kopie rot, die älter ist als der
  Wechsel** — und wenn auch die jüngste älter ist, sagt sie das deutlicher:
  dann passt überhaupt keine, und es gehört sofort neu gesichert.
* **Der JSON-Export braucht keinen Schlüssel.**

### Was der Wechsel nicht ist

Er wechselt den **Schlüssel**, nicht das Verfahren: SQLCipher bleibt, die
Schlüssellänge bleibt, `katalog.sqlite` bleibt, das Schema bleibt, die
Passwörter bleiben, und **niemand wird abgemeldet** — der Datenbankschlüssel
hängt an keinem Passwort.

Bricht der Wechsel mitten hinein ab (Stromausfall, `kill -9`), ist das
**folgenlos**: das Rollback-Journal stellt den alten Stand her, der **alte**
Schlüssel öffnet weiter, der neue wird abgewiesen. Geht dagegen das Journal
verloren, ist alles verloren — **das** ist der Grund für die Sicherung davor.
Das Journal wächst dabei auf die Größe der Datenbank; reicht der Platz nicht,
sagt das Skript vorher ab und rührt nichts an.
