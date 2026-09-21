# Kriterion

![Node](https://img.shields.io/badge/Node-22-informational)
![Docker](https://img.shields.io/badge/Docker-Compose-informational)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-informational)

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

> **DIE BEDIENUNG STEHT IM [Handbuch](manual-de.md).** Was am Bildschirm
> passiert — Anmeldung, Benutzer und Rollen, Einträge, Bewertungen, Kommentare,
> Einstellungen, Sprache und die Ansicht auf dem Telefon — steht dort.
> **Hier steht, was auf dem Server passiert**, und was der kennen muss, der am
> Code arbeitet. **Jede Sache steht an genau einer der beiden Stellen.**

---

**Inhalt**

- [Was du damit machen kannst](#was-du-damit-machen-kannst)
- [Ist das etwas für dich?](#ist-das-etwas-für-dich)
- [Woraus es gebaut ist](#woraus-es-gebaut-ist)
- [Voraussetzungen](#voraussetzungen)
- [Erstinstallation](#erstinstallation)
  - [Der erste Zugang](#der-erste-zugang)
  - [Was danach eingerichtet werden kann — und nichts davon muss](#was-danach-eingerichtet-werden-kann--und-nichts-davon-muss)
- [Aufbau des Ordners](#aufbau-des-ordners)
- [Auf dem Server](#auf-dem-server)
- [Der Schlüssel — bitte einmal aufmerksam lesen](#der-schlüssel--bitte-einmal-aufmerksam-lesen)
- [Eine neuere Version über eine bestehende einspielen](#eine-neuere-version-über-eine-bestehende-einspielen)
  - [Prüfen, ob wirklich die neue Version läuft](#prüfen-ob-wirklich-die-neue-version-läuft)
- [Fehlerbehebung](#fehlerbehebung)
  - [Wenn niemand mehr hereinkommt](#wenn-niemand-mehr-hereinkommt)
  - [Wenn eine Version die Datenbank anfasst](#wenn-eine-version-die-datenbank-anfasst)
  - [Die alten Namen in der `.env`](#die-alten-namen-in-der-env)
- [Verschlüsselung](#verschlüsselung)
- [Anmeldung und Benutzer](#anmeldung-und-benutzer)
- [Hinter einem Reverse Proxy](#hinter-einem-reverse-proxy)
  - [Beide Wege zugleich](#beide-wege-zugleich)
- [Gescheiterte Anmeldungen aussperren](#gescheiterte-anmeldungen-aussperren)
- [Ein eigenes Skript an der Schnittstelle](#ein-eigenes-skript-an-der-schnittstelle)
- [Dateien am Eintrag — wie sie abgesichert sind](#dateien-am-eintrag--wie-sie-abgesichert-sind)
- [Kurzvideos](#kurzvideos)
- [Speicherbedarf](#speicherbedarf)
- [Sichern](#sichern)
- [Datenmodell](#datenmodell)
- [Prüfen](#prüfen)
  - [Wie lange er braucht — und wo die Zeit hingeht](#wie-lange-er-braucht--und-wo-die-zeit-hingeht)
  - [Der Prüfschalter](#der-prüfschalter)
- [Den Schlüssel wechseln](#den-schlüssel-wechseln)
  - [Zwei Schlüssel im Umlauf](#zwei-schlüssel-im-umlauf)
  - [Was der Wechsel nicht ist](#was-der-wechsel-nicht-ist)
- [Wie dieser Code entstanden ist](#wie-dieser-code-entstanden-ist)
- [Lizenz](#lizenz)
  - [Die Lizenzen der Abhängigkeiten](#die-lizenzen-der-abhängigkeiten)

---

## Was du damit machen kannst

| | |
|---|---|
| **Einträge anlegen** | Titel, Beschreibung, Kategorie, Tags — dazu Fotos bis 30 MB, Kurzvideos bis 20 MB, Dateien bis 50 MB und eine Linkliste |
| **Bewerten** | eigene Kriterien mit Sternen von 1 bis 5, je Kriterium ein **Gewicht** zwischen 0,2 und 2, daraus ein gewichteter Gesamtschnitt |
| **Mitschreiben** | Kommentare in drei Arten — **Notiz**, **Bericht**, **Aufgabe** (mit Erledigt-Haken) —, dazu Bilder am Kommentar |
| **Testtage führen** | datierte Einträge mit Note und Tags; sie sind die Zeitreihe, die Kriterienbewertung ist das gegenwärtige Urteil |
| **Vergleichen** | mehrere Einträge nebeneinander, Kriterium für Kriterium |
| **Suchen und filtern** | Volltextsuche über Titel, Beschreibung, Kategorie, Tags, Links und Kommentare — **jede Trefferkachel sagt, wo das Wort steht, und der Begriff ist hervorgehoben**; Filterstellungen lassen sich als **Ansicht** speichern |
| **Den Überblick behalten** | „Offen" zeigt alle unerledigten Aufgaben über alle Einträge, die **Glocke** alles, was seit dem letzten Blick dazugekommen ist |
| **Zu mehreren arbeiten** | Benutzer mit drei Rollen; jeder Beitrag trägt seinen Verfasser |
| **Sichern** | verschlüsselte Kopie auf Knopfdruck, dazu ein JSON-Export, der ohne Schlüssel auskommt |

---

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

---

## Woraus es gebaut ist

Node.js mit Express, SQLite über SQLCipher
(`better-sqlite3-multiple-ciphers`), Bildverarbeitung mit `sharp`, Mailversand
mit `nodemailer`. **Das Frontend kommt ohne Framework aus** — kein Build, keine
Paketkette im Browser, eine Datei JavaScript und eine Datei CSS.

Fünf Laufzeitabhängigkeiten, festgenagelt über `package-lock.json`.

**Was eine Version mitbringt, steht in `CHANGELOG.md`.** Das Format folgt
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern
folgen [Semantic Versioning](https://semver.org/lang/de/).

---

## Voraussetzungen

**Ein Rechner mit Docker und Docker Compose.** Ein NAS, ein kleiner Server,
ein Intel-N100-Kasten unter OpenMediaVault reicht völlig.

**Sonst nichts.** Node.js, Übersetzer und Datenbank stecken im Image; auf dem
Wirt muss nichts davon liegen. Gebaut wird gegen Node 22.

---

## Erstinstallation

**Vier Schritte.** Nur der erste geht auf zwei Wegen — über `git` oder über
das ZIP; die drei danach sind für beide gleich.

**1. Das Projekt holen.**

```bash
git clone https://github.com/fardem/kriterion.git
cd kriterion
```

**Ohne `git` geht es über das ZIP** — auf <https://github.com/fardem/kriterion>
unter „Code" → „Download ZIP":

```bash
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion                  # der Ordner heißt nach dem Branch
cd kriterion
chmod +x keytool.sh          # das Ausführungsrecht, siehe unten
```

> **DIE `chmod`-ZEILE BRAUCHT NUR, WER MIT `python3 -m zipfile` AUSPACKT** —
> oder unter Windows. **`unzip` und `git clone` bringen das Ausführungsrecht
> mit.** *Fehlt es, antwortet `./keytool.sh` später mit „Keine
> Berechtigung"; dann hilft `chmod +x keytool.sh`.*

**2. Die `.env` anlegen.**

```bash
cp .env.example .env
```

**Der Schritt `cp .env.example .env` ist Pflicht, auch wenn nichts darin steht.**
`docker compose` liest die Datei ein und bricht sonst ab, bevor der Container
startet. Alle Werte dürfen leer bleiben.

**3. Die `docker-compose.yml` anlegen.**

```bash
cp docker-compose.example.yml docker-compose.yml
```

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

**4. Starten.**

```bash
docker compose up -d --build
```

**`--build` ist nicht optional**, auch beim ersten Mal nicht: der Quelltext
steckt im Image, nicht im eingehängten Verzeichnis.

Erreichbar unter `http://<server-ip>:3100`. **Der Port steht in der
`docker-compose.yml`**, nicht in der `.env`.

### Der erste Zugang

**Beim ersten Aufruf im Browser** werden Benutzername und Passwort gesetzt.
Es gibt keine voreingestellte Kennung, und in der `.env` steht kein Passwort —
der Zugang liegt als scrypt-Hash in der verschlüsselten Datenbank. Mindestens
zehn Zeichen, sonst keine Regeln.

**Dieser erste Zugang wird der Eigentümer.** Ihm gehören Export, Import,
Rollenvergabe, der Mailzugang und der Schlüsselwert; alles Weitere steht im
[Handbuch](manual-de.md) unter „Rollen und Benutzer".

### Was danach eingerichtet werden kann — und nichts davon muss

Die Tafel sagt, wo es steht. **Was die einzelnen Karten tun, steht im
[Handbuch](manual-de.md).**

| | wo | wofür |
|---|---|---|
| **Titel der Installation** | Einstellungen › Installation, Karte „Titel" | zwei frei wählbare Titel: einer über der Anmeldeseite, einer in der Anwendung |
| **Bewertung: Kriterien** | Einstellungen › Bestand, Karte „Bewertung: Kriterien" | Name, Reihenfolge, Gewicht — sie erscheinen an jedem Eintrag |
| **Potenzial: Kriterien** | Einstellungen › Bestand, Karte „Potenzial: Kriterien" | dasselbe für den Kasten *vor* dem Test — zwei oder drei reichen |
| **Vokabular** | Einstellungen › Bestand, Karte „Vokabular" | fünfzehn Wörter der Oberfläche umbenennen, etwa „Eintrag" → „Modell" |
| **Weitere Benutzer** | Einstellungen › Benutzer, Karte „Benutzer" | anlegen oder über einen Einladungslink einladen |
| **Mailversand** | Einstellungen › Benutzer, Karte „Mailversand" | nur für Einladungslinks und Links zum Zurücksetzen; ohne ihn läuft alles weiter |
| **Sicherungsordner** | `docker-compose.yml` | Vorgabe liegt im Projektordner; die empfohlene Lage ist daneben — siehe „Sichern" |
| **Reverse Proxy** | `.env`, `BEHIND_PROXY=1` | nur wenn die Installation über einen Proxy und HTTPS nach außen geht. **Der Weg über `http://<server-ip>:3100` bleibt daneben offen** — siehe „Hinter einem Reverse Proxy" |

---

## Aufbau des Ordners

**Welche Datei wofür da ist.** Der Quelltext steckt im Image, nicht im
eingehängten Verzeichnis; der Ordner auf dem Wirt trägt trotzdem alles, was
gebaut wird.

| | |
|---|---|
| `server.js` | die Routen und die Auslieferung |
| `auth.js` | Anmeldung, Sitzungen, Token und das Sicherheitsprotokoll |
| `db.js` | das Schema und die Verbindung zur verschlüsselten Datei |
| `keys.js` | der Schlüssel: lesen, erzeugen, prüfen |
| `attachments.js` | Anhänge: Auslieferung und Vorschau |
| `images.js` | die Bildableitungen — Kachel und mittlere Variante |
| `batchrun.js` | die Bestandsläufe, in einem eigenen Thread |
| `mail.js` | der Versand über SMTP |
| `twofactor.js` | der zweite Faktor: TOTP nach RFC 6238 |
| `log.js` | das Containerprotokoll: Zeitstempel und Name an einer Stelle |
| `usertool.js` | die Zugangsverwaltung auf dem Wirt |
| `keytool.js`, `keytool.sh` | der Schlüsselwechsel bei angehaltener Instanz |
| `public/` | `index.html`, `app.js`, `style.css`, `theme.js` und die drei Sprachdateien |
| `test/`, `testbench.js`, `counterproof.js` | der Prüfstand und die Gegenproben |
| `Dockerfile`, `docker-compose.example.yml`, `.env.example` | die Vorlagen für den Betrieb |

**Drei Dinge liegen nicht im Repository und gehören dem Betreiber:**

| | |
|---|---|
| `data/` | die verschlüsselte Datenbank `katalog.sqlite` |
| `.env` | der Schlüssel und die Einstellungen |
| `docker-compose.yml` | Port, Einhängung des Sicherungsordners, Containername |

---

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
Server". Was `usertool.js` sonst kann, sagt es ohne Argument selbst; die Tafel
darüber nennt alle fünf Befehle.

---

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

---

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
> **Was der Start meldet, wenn eine Spalte fehlt, und was die Instanz dann
> noch kann, steht unten unter „Wenn eine Version die Datenbank anfasst".**
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
(Reiter „Datenbank"). **Der Sollwert steht im `CHANGELOG.md`, im Eintrag der
Version**, als Zeile „Fingerprint …".

Stimmt er nicht überein, ist der Dateisatz nicht der, der gemeint war — dann
hilft nur, ihn **vollständig** erneut einzuspielen. **Er schlägt in beide
Richtungen aus: auch eine Datei zu viel ändert ihn.**

**Weicht er ab, findest du die Ursache so** — im Projektverzeichnis oder im
Container (`docker compose exec kriterion sh`):

```bash
for f in attachments.js auth.js batchrun.js images.js db.js keys.js log.js \
         mail.js package.json server.js twofactor.js public/*; do
  printf "%-26s %s\n" "$f" "$(sha256sum "$f" | cut -c1-8)"
done
```

Das sind **genau die Dateien, über die der Fingerprint geht**, und sonst keine.
Löschen bzw. ersetzen und `docker compose up -d --build`, denn der Quelltext
steckt im Image.

**Das geht auch ohne Shell.** Unter dem Fingerprint steht in der Karte
„Kennzahlen" ein Verweis **„Dateien zeigen"**; er klappt dieselbe Liste auf —
Name und Prüfsumme, neunzehn Zeilen, dieselben acht Zeichen wie oben.

Solange niemand auf den Verweis drückt, steht dort nichts. Der Sollwert steht
im `CHANGELOG.md`, verglichen wird mit dem Auge.

Ändert eine Version die Marke der Installation, zeigt der Browser im Reiter
noch die alte — ein hartes Neuladen (Strg+Umschalt+R) räumt den
Zwischenspeicher weg.

---

## Fehlerbehebung

**Drei Fälle, und alle drei haben einen Weg heraus.** Wenn niemand mehr
hereinkommt, wenn eine Version die Datenbank anfasst, und wenn in der `.env`
noch die alten Namen stehen.

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

### Wenn eine Version die Datenbank anfasst

**Eine fehlende Tabelle legt der Start selbst an. Eine fehlende Spalte dagegen
nicht.** Was der Start stattdessen tut, ist nachsehen: fehlt eine, schreibt er
einen Kasten ins Protokoll, der sie beim Namen nennt — und dazu den Namen,
unter dem sie früher dalag, wo es einen gibt. **Welche Fassung den Bestand
nachzieht, steht oben unter „Eine neuere Version über eine bestehende
einspielen".** **Die Zeile kommt bei jedem Start**, solange die Spalte fehlt.
**Die Anwendung startet trotzdem** — aber jede Seite, die eine der genannten
Spalten liest, scheitert.

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

---

## Verschlüsselung

Die **gesamte Datenbankdatei** ist verschlüsselt (SQLCipher, AES-256). Ohne
Schlüssel meldet selbst ein Datenbankwerkzeug nur „file is not a database" —
lesbar ist nichts, auch nicht die Tabellenstruktur, Kategorienamen, Zeitstempel
oder Bildgrößen. Fotos **und Videos** liegen mit in der Datenbank und werden
nie als Datei auf die Platte geschrieben; der Upload läuft über den
Arbeitsspeicher.

Innerhalb der geöffneten Datenbank steht alles im Klartext; die Suche läuft
deshalb über sämtliche Felder.

---

## Anmeldung und Benutzer

**Wie man sich anmeldet, wer was darf, wie Benutzer angelegt und eingeladen
werden und was der zweite Faktor tut, steht im
[Handbuch](manual-de.md).** Hier stehen die beiden Stellen, an denen die
Anmeldung den Server betrifft.

---

## Hinter einem Reverse Proxy

Wird Kriterion über einen Reverse Proxy nach außen gegeben, dann **nur über
HTTPS**. Und dann gehört `BEHIND_PROXY=1` in die `.env`.

> **Kriterion komprimiert seine Textdateien selbst.** Stilblatt,
> Skript, Sprachdateien und Markup gehen gezippt hinaus, sobald der Browser es
> verlangt — rund ein Viertel der ursprünglichen Größe. Ein Proxy, der
> zusätzlich komprimiert, bringt nichts dazu und packt eine gezippte Antwort
> im schlechtesten Fall ein zweites Mal ein. `gzip off;` bei nginx,
> `encode` weglassen bei Caddy.

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

### Beide Wege zugleich

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

---

## Gescheiterte Anmeldungen aussperren

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

**Die Sperre übersteht einen Neustart.** Die Zähler liegen in der Datenbank,
nicht im Arbeitsspeicher; eine laufende Sperre gilt weiter, auch wenn der
Container zwischendurch neu anläuft. Eine Zeile, die eine Stunde ohne neuen
Versuch steht, wird beim Start und stündlich geräumt.

---

## Ein eigenes Skript an der Schnittstelle

**Jede schreibende Anfrage braucht einen Token gegen fremde Formulare.** Der
Browser macht das von selbst; ein eigenes Skript muss es nachbauen.

Der Server setzt den Token bei der Anmeldung als zweiten Cookie neben den
Sitzungscookie: `kriterion_csrf`, hinter einem Proxy über HTTPS
`__Host-kriterion_csrf`. **Er trägt kein `HttpOnly`** — anders wäre er nicht
lesbar. Sein Wert gehört unverändert in die Kopfzeile `x-csrf-token`:

```bash
curl -c cookies.txt -X POST http://<server>:3199/api/login \
  -H 'content-type: application/json' \
  -d '{"user":"anna","password":"…"}'

TOKEN=$(awk '/kriterion_csrf/ { print $7 }' cookies.txt)

curl -b cookies.txt -X POST http://<server>:3199/api/items \
  -H 'content-type: application/json' -H "x-csrf-token: $TOKEN" \
  -d '{"title":"Ein Eintrag"}'
```

**Ohne die Kopfzeile antwortet jede schreibende Route mit 403.** Lesende
Anfragen brauchen sie nicht, und die Wege vor der Anmeldung — Einrichtung,
Anmeldung, Abmeldung, die beiden Tokenwege und die Selbstanmeldung — ebenso
wenig.

---

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

---

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

---

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

---

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
fehlen) und mit der ganzen Datei im Arbeitsspeicher. Er schreibt den ganzen
Bestand oder, wenn die Datei zu groß würde, einen Teil davon.

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
> Ob eine Version das tut, steht im `CHANGELOG.md` über ihren Änderungen.
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

---

## Datenmodell

Die Datenbankdatei heißt `katalog.sqlite`. Der Dateiname wandert bei einer
Umbenennung des Projekts bewusst **nicht** mit: ein anderer Name ließe den
Start eine leere Neuinstallation vermuten.

- `items` — Titel, Beschreibung, Getestet-/Abgelehnt-Merkmal, Kategorie. **Zur
  Ablehnung gehören drei Spalten:** `rejected_at` (wann), `rejected_reason`
  (warum, eine Zeile) und `rejected_by` (wer). Alle drei dürfen leer sein.
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
  Reihenfolge **und Gewicht** (`weight`, 0,2 bis 2, Vorgabe 1), Werte je
  Eintrag und je Benutzer. Reihenfolge steuert die Anzeige, Gewicht die
  Rechnung. **`phase` sagt, zu welchem der beiden Sternkästen ein Kriterium
  gehört** — `before` (Potenzial) oder `after` (Bewertung), Vorgabe `after`;
  der Name bleibt über beide Kästen hinweg eindeutig. **`ratings` trägt keine
  Phase** — zu welchem Kasten ein Stern gehört, sagt sein Kriterium.
  **`ratings.set_at` hält den Zeitpunkt der letzten Setzung**
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
- `users` — Zugang als scrypt-Hash, dazu Rolle (`user` < `admin` < `owner`),
  Adresse, Status und letzte Anmeldung. Gelöschte Benutzer bleiben als Zeile
  ohne Namen (`status = deleted`, Name `deleted-<id>`) stehen.
  **Die Adresse wird überhaupt gefüllt** — beim Anlegen durch den
  Admin, danach nur noch durch den Betreffenden selbst
- `sessions` — aktive Anmeldungen, mit `user_id` am Benutzer. In der Karte
  **„Meine Sitzungen"** sieht jeder seine eigenen; adressiert werden sie über
  eine **gerechnete Kennung**, nie über den Sitzungsschlüssel selbst
- `login_attempts` — die **Bremse gegen Durchprobieren**: je Adresse und je
  getipptem Namen ein Zähler, bei der Adresse dazu das Ende einer Sperre.
  Sie liegt in der Datenbank und nicht im Arbeitsspeicher, damit ein Neustart
  sie nicht aufhebt; eine Zeile ohne neuen Versuch wird nach einer Stunde
  geräumt
- `tokens` — Einladungslinks und Links zum Zurücksetzen. **Gespeichert ist nur
  der SHA-256 des Links, nie er selbst**; dazu Benutzer, Anlass, Ablauf und
  wann er eingelöst wurde. Sieben Tage haltbar, einmal gültig; abgelaufene
  Zeilen räumt die Installation nach dreißig Tagen selbst weg
- `requests` — die **Warteschlange der Registrierung**:
  Wunschname, Adresse, der SHA-256 des Bestätigungslinks und der Zeitpunkt der
  Bestätigung. **Unbestätigte verfallen nach 24 Stunden** und erscheinen beim
  Admin nie; eine bestätigte wartet, so lange es dauert. Höchstens zwanzig
  offene, je Adresse eine
- `two_factor` / `two_factor_codes` — der **zweite Faktor**, je Zugang höchstens
  einer. Das TOTP-Geheimnis liegt dort **im Klartext**: es wird nachgerechnet
  und nicht geprüft, deshalb geht es nicht anders; die verschlüsselte Datenbank
  ist die einzige Schicht darüber. Die acht **Wiederherstellungscodes** stehen
  daneben als SHA-256 ohne Salz, jeder genau einmal gültig; eine verbrauchte
  Zeile bleibt stehen, damit die Karte „noch 6 von 8" sagen kann. **Geräumt wird
  hier nichts nach einer Frist** — ein Wiederherstellungscode soll gerade dann
  tragen, wenn das Telefon seit Monaten weg ist
- `security_log` — **wer Zugang hatte und wer die Installation als Ganzes
  angefasst hat**. Eine Zeile je Vorgang: Zeitpunkt, was, wer, an
  wem und ein kurzes Merkmal aus einer festen Liste — **kein Freitext, keine
  Namen, keine Adresse**. Beide Benutzerspalten halten einen **Vorgang** fest,
  keine Zugehörigkeit; ein leeres `actor` heißt „über `usertool.js` auf dem Wirt",
  außer bei einer gescheiterten Anmeldung. 180 Tage haltbar, und die Frist ist
  der einzige Weg hinaus
- `trash` / `trash_bytes` — der **Papierkorb**. Eine
  Zeile je gelöschtem Eintrag: Zeitpunkt, Löschender, Titel und das ganze Paket
  im Austauschformat; die Bytes (Fotos, Videos, Dateien, Kommentarbilder)
  liegen daneben in der zweiten Tabelle, eine Zeile je Datei. **Keine
  bestehende Abfrage fasst diese Tabellen an** — ein gelöschter Eintrag ist
  wirklich weg und liegt nur zusätzlich noch als Paket daneben. Deshalb gibt es
  auch **keinen** Zustand `deleted` an `items`
- `items.user_id` / `comments.user_id` / `test_days.user_id` /
  `ratings.user_id` / `links.user_id` / `attachments.user_id` — der Verfasser,
  an sechs Trägern. `trash.deleted_by` sieht aus wie ein siebter, ist aber
  keiner: es hält fest, **wer gelöscht hat**, und daran hängt kein Recht.
  Dasselbe gilt für `security_log.actor` und `.target`.
  `ON DELETE SET NULL` greift nur bei einem `DELETE` von Hand: die Anwendung
  selbst entfernt keine Benutzerzeile, und Bestand ohne Verfasser fällt beim
  Start an den Eigentümer

---

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

Welche Gruppe wie lange braucht, sagt der Lauf am Ende selbst.
**Ein Teillauf startet nur die Module, die er zeigt:**

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

---

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

---

## Wie dieser Code entstanden ist

**Geschrieben mit [Claude Code](https://claude.com/claude-code), August bis
September 2026.** Idee, Konzept und die Entscheidung, was gebaut wird, kommen
von [Faruk Demirtas](https://github.com/fardem).

---

## Lizenz

**MIT.** Der Text steht in `LICENSE`.

Das heißt: du darfst Kriterion verwenden, verändern, weitergeben und verkaufen,
auch als Teil einer größeren Sache. **Eine Bedingung:** der Lizenztext und der
Urheberrechtsvermerk gehen mit. Eine Garantie gibt es nicht, und eine Haftung
übernimmt niemand.

**Ein Fork braucht keine Erlaubnis.**

### Die Lizenzen der Abhängigkeiten

Gemessen an den 157 Paketen, die `npm install` anlegt: 124 MIT, 8 ISC,
6 Apache-2.0, 4 BSD-3-Clause, 3 MIT-0, 2 BSD-2-Clause, 2 LGPL-3.0-or-later,
der Rest CC0, 0BSD, BlueOak und Pakete mit einem Wahlrecht.

**Die zwei LGPL-Pakete sind `@img/sharp-libvips-linux-x64` und
`@img/sharp-libvips-linuxmusl-x64`** — die vorkompilierte libvips, die `sharp`
für die Bildableitungen mitbringt. Die LGPL verlangt bei der **Weitergabe einer
Binärdatei**, dass ihr Lizenztext mitgeht und die Bibliothek austauschbar
bleibt. *Wer Kriterion aus diesem Repository baut, lädt `sharp` selbst über
npm; wer ein fertiges Image weitergibt, gibt libvips mit weiter und hat diese
Pflicht.*
