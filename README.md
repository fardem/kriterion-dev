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
| **Suchen und filtern** | Volltextsuche über Titel, Beschreibung, Kategorie, Tags, Links und Kommentare; Filterstellungen lassen sich als **Ansicht** speichern |
| **Den Überblick behalten** | „Offen" zeigt alle unerledigten Aufgaben über alle Einträge, „Neu seit …" alles seit dem letzten Besuch |
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

* **Eine Anlage ist ein Sachgebiet.** Bewertungskriterien sind global und
  erscheinen an **jedem** Eintrag. Wer Modelle *und* Werkzeuge *und*
  Bezugsquellen sammeln will, betreibt besser zwei oder drei Anlagen mit je
  eigenem Datenverzeichnis — sonst steht an jedem Eintrag die Kriterienliste
  aller Sachgebiete.
* **Ein Schlüssel, eine Datenbank.** Die Verschlüsselung schützt die Datei,
  nicht die Benutzer voreinander: wer die Anlage betreibt, kann alles lesen,
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
python3 -m zipfile -e kriterion-main.zip .   # ZIP von GitHub
mv kriterion-main kriterion                  # der Ordner heißt nach dem Branch
cd kriterion
chmod +x schluessel.sh                       # das ZIP bringt das Recht nicht mit
cp .env.example .env
docker compose up -d --build
```

Erreichbar unter `http://<server-ip>:3100`. **Der Port steht in der
`docker-compose.yml`**, nicht in der `.env`.

*Wer `git` auf dem Server hat, nimmt statt der ersten beiden Zeilen*
`git clone https://github.com/fardem/kriterion.git` *— dann kommen auch die
Ausführungsrechte mit, und das `chmod` entfällt.*

**Der Schritt `cp .env.example .env` ist Pflicht, auch wenn nichts darin steht.**
`docker compose` liest die Datei ein und bricht sonst ab, bevor der Container
startet. Alle Werte dürfen leer bleiben.

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
| **Titel der Anlage** | Systembereich, Karte „Darstellung" | zwei frei wählbare Titel: einer über der Anmeldeseite, einer in der Anwendung |
| **Bewertungskriterien** | Systembereich, Karte „Kriterien" | Name, Reihenfolge, Gewicht — sie erscheinen an jedem Eintrag |
| **Vokabular** | Systembereich, Karte „Vokabular" | elf Wörter der Oberfläche umbenennen, etwa „Eintrag" → „Modell" |
| **Weitere Zugänge** | Systembereich, Karte „Zugänge" | anlegen oder über einen Einladungslink einladen |
| **Mailversand** | Systembereich, Karte „Mailversand" | nur für Einladungs- und Rücksetzlinks; ohne ihn läuft alles weiter |
| **Sicherungsort** | `docker-compose.yml` | Vorgabe liegt im Projektverzeichnis; die empfohlene Lage ist daneben — siehe „Sichern" |
| **Reverse Proxy** | `.env`, `HINTER_PROXY=1` | nur wenn die Anlage über einen Proxy und HTTPS nach außen geht — siehe „Anmeldung" |

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
chmod +x kriterion/schluessel.sh          # das ZIP bringt das Recht nicht mit
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
kein guter Rat, sondern der einzige Weg zurück. Ob eine Version das tut, sagt
`CHANGELOG.md` unter „Was du danach von Hand tun musst".

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

**Die `chmod`-Zeile ist nicht überflüssig.** `python3 -m zipfile -e` stellt
**keine Ausführungsrechte** wieder her — anders als `unzip`, das es tut. Ohne
sie antwortet `./schluessel.sh` mit „Keine Berechtigung"; es geht dann auch
`bash schluessel.sh zeigen`.

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
for f in anhaenge.js auth.js db.js keys.js mail.js package.json server.js \
         zweifaktor.js public/*; do
  printf "%-26s %s\n" "$f" "$(sha256sum "$f" | cut -c1-8)"
done
```

Das sind **genau die Dateien, über die der Fingerprint geht**, und sonst keine.
Steht eine Zeile zu viel da, ist das die Ursache; weicht eine Prüfsumme ab, ist
es diese Datei. Löschen bzw. ersetzen und `docker compose up -d --build`, denn
der Quelltext steckt im Image.

*Ein Randfall, der wie ein Fehler aussieht und keiner ist:* ändert eine Version
die Marke der Anlage, zeigt der Browser im Reiter noch die alte — ein hartes
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
der Zugang ist gesperrt —, beantwortet die Anlage **immer gleich**: „Dieser
Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern." Der Grund ist
nicht Geheimniskrämerei, sondern dass in allen vier Fällen dasselbe zu tun
ist.

**Die zweite Bestätigung greift auch hinter der Anmeldung** — vor
jedem Weg, der die Anlage als Ganzes trifft. Was das ist und warum, steht
unter „Rollen und Zugänge".

### Der zweite Faktor, freiwillig

**Wer will, sichert seinen Zugang zusätzlich mit einem Code aus einer App auf
seinem Telefon.** Der Code entsteht dort **ohne Netz**, aus einem Geheimnis und
der Uhr, und ist alle dreißig Sekunden ein anderer. **Die Anlage schickt dafür
nichts hinaus** — kein Code per Mail, kein Code per SMS.

> **OHNE ZWEITEN FAKTOR LÄUFT DIE ANLAGE VOLLSTÄNDIG.** Er ist freiwillig und
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

Eine Einstellung, fünf Wirkungen:

| | `HINTER_PROXY` fehlt (Vorgabe) | `HINTER_PROXY=1` |
|---|---|---|
| Adresse des Aufrufers | die tatsächliche Verbindung | der **letzte** Eintrag aus `X-Forwarded-For` |
| Sitzungscookie | `kriterion_session` | `__Host-kriterion_session` |
| `Secure` am Cookie | nein | ja |
| `Strict-Transport-Security` | nein | `max-age=31536000` |
| `http://` in `OEFFENTLICHE_ADRESSE` | wird hingenommen | **Warnung beim Start**, keine Absage |
| richtig für | direkt im Heimnetz, Port 3100 | Betrieb hinter einem Proxy, HTTPS |

Der **letzte** Eintrag der Kette und nicht der erste: ein Proxy hängt die
Gegenstelle, die er wirklich sieht, hinten an — alles davor kann der Aufrufer
selbst hineingeschrieben haben.

Zwei Dinge beim Umlegen:

- **Es meldet alle einmalig ab.** Das Präfix `__Host-` verlangt den Cookienamen
  wörtlich; der alte Name wird nicht mehr gelesen. Kein Datenverlust, nur eine
  neue Anmeldung.
- **Danach geht die Anmeldung nur noch über HTTPS.** Der `Secure`-Cookie wird
  über `http://` vom Browser verworfen — ein direkter Aufruf von
  `http://<server-ip>:3100` käme nicht mehr herein.

Der Start sagt im Protokoll, welche Lage gilt: `Hinter Proxy: an` oder
`Hinter Proxy: aus`.

**WENN DER PROXY AUSFÄLLT — der Weg zurück.** Fällt der Reverse Proxy aus,
läuft ein Zertifikat ab oder klemmt der Name im DNS, dann gibt es mit
`HINTER_PROXY=1` **gar keinen Weg mehr in die Oberfläche**: über HTTPS geht es
nicht, weil der Proxy fehlt, und über `http://<server-ip>:3100` verwirft der
Browser den Cookie. *Die Anmeldung sieht dabei aus, als klappte sie* — der
Server antwortet mit 200 und setzt den Cookie; erst der Browser wirft ihn weg,
stillschweigend und ohne Meldung, und die Seite fällt auf die Anmeldung
zurück. **Im Protokoll des Servers steht davon nichts**, er hat seinen Teil ja
getan.

Der Ausweg braucht kein Werkzeug und dauert eine Minute — die Einstellung für
die Dauer der Störung abschalten:

```bash
cd .../kriterion
sed -i 's/^HINTER_PROXY=1/# HINTER_PROXY=1/' .env
docker compose up -d
```

Danach geht `http://<server-ip>:3100` wieder. **Es meldet alle einmalig ab**,
weil der Cookiename wechselt — kein Datenverlust, nur eine neue Anmeldung.
Ist der Proxy repariert, die Zeile wieder scharf schalten und erneut starten;
das meldet noch einmal ab.

> **Solange die Einstellung aus ist, wird `X-Forwarded-For` nicht mehr
> geglaubt.** Die Anmeldebremse zählt dann nach der tatsächlichen Verbindung —
> hinter einem Proxy wäre das dessen Adresse für alle zusammen. **Deshalb nur
> für die Dauer der Störung**, nicht als Dauerzustand.

*Wer den Fall gar nicht erst haben will, richtet den Namen der Anlage auch im
eigenen Netz auf den Proxy ein* (Eintrag im lokalen DNS oder in der
`hosts`-Datei). Dann läuft auch der Weg von innen über HTTPS und der Cookie
gilt. **Gegen einen ausgefallenen Proxy hilft das allerdings nicht** — dafür
bleibt der Handgriff oben.

**Was die Einstellung nicht ist:** eine Liste, wer den Kopf setzen darf. Bleibt
der Port des Containers im eigenen Netz erreichbar, kann dort auch jemand von
Hand einen Kopf mitschicken und die Bremse damit umgehen — ein gewöhnlicher
Browser tut das nicht, ein absichtlicher Aufruf schon. Wer das ausschließen
will, gibt den Port nicht mehr im Netz frei, sondern lässt allein den Proxy
heran.

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
Protokoll des Proxys, nicht das der Anlage. *Das ist auch die richtige Stelle:
hinter dem Proxy sieht Kriterion ohnehin nur dessen Adresse, solange
`HINTER_PROXY` nicht gesetzt ist.*

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

**Das Sicherheitsprotokoll der Anlage räumt sich dagegen schon selbst** — es
hält 180 Tage, geprüft beim Start und jedes Mal, wenn die Karte geöffnet wird.
*Wer dafür eine Rotation sucht, soll sie nicht bauen: es gibt sie schon.*

### Rollen und Zugänge

Drei Rollen, und sie sind eine Leiter: **Benutzer** < **Admin** <
**Eigentümer**. Wer die Anlage einrichtet, ist ihr Eigentümer; das Recht ist
eine Rolle und lässt sich vergeben — zwei Leute können sich eine Anlage
teilen. Solange nur **ein** Zugang besteht, ist er alles zugleich, und ihm
verweigert nichts etwas.

- **Benutzer** — schreibt eigene Beiträge: Einträge, Kommentare, Bewertungen,
  Testtage, Favoriten.
- **Admin** — verwaltet zusätzlich, was an *allen* Einträgen erscheint:
  Bewertungskriterien, Tags und Kategorien (umbenennen und löschen), beide
  Titel, Vokabular und die Suchanbieter. Er darf fremde Beiträge **löschen**,
  aber nicht umschreiben. Und er verwaltet die Zugänge — aber nicht die von
  Admins oder dem Eigentümer.
- **Eigentümer** — alles davon, dazu das, was die Anlage als *Ganzes*
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

**„Ich vergebe das erste Passwort" — wie bisher.** Erst dann erscheint das
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
schickt die Anlage den Link zusätzlich dorthin — vorausgesetzt, ein Mailzugang
ist eingerichtet (siehe **Mailversand**). Der Link steht trotzdem zum Kopieren
da, auch wenn der Versand fehlschlägt. **Ändern darf die Adresse danach allein
der Betreffende selbst**, im Systembereich unter „Zugang": sie entscheidet,
wohin sein nächster Rücksetzlink geht, und das gehört nicht in fremde Hand.

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
verschickt die Anlage keine Links: der Server wüsste nicht, worauf sie zeigen
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

Die Karte **„Mailversand"** im Systembereich fragt nach:

| Feld | |
|---|---|
| **Anbieter** | GMX, Web.de, Gmail, Strato, IONOS oder „Eigener Server" |
| **Server, Port, Verschlüsselung** | füllt die Vorlage; offen nur bei „Eigener Server" |
| **Benutzername, Passwort** | dein Zugang beim Anbieter |
| **Absenderadresse** | muss zum Konto gehören |

**Das Passwort wird nie angezeigt** — die Karte sagt „gesetzt" oder „nicht
gesetzt", nie die Länge, nie den Anfang, nie Sternchen mit der richtigen Zahl.
Beim Speichern bedeutet ein leeres Passwortfeld „unverändert lassen". Es steht
in der **verschlüsselten Datenbank**, nicht in der `.env`, und wandert weder in
eine Exportdatei noch in eine Protokollzeile.

Drei Hinweise, an denen die meisten Versuche scheitern:

- **Gmail** verlangt Zwei-Faktor und ein **App-Passwort**; das Kontopasswort
  wird abgewiesen.
- **GMX** und **Web.de** verlangen, den Versand über fremde Programme im Konto
  erst **freizuschalten**.
- **Die Absenderadresse muss zum Konto gehören** — über GMX lässt sich nicht
  als fremde Adresse senden.

Und der Grund für die Vorlagen: **immer über den SMTP-Zugang eines Anbieters,
nie unmittelbar vom Hausanschluss.** Dort fehlen rDNS und SPF/DKIM, und die
Mail landet im besten Fall im Spam.

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

**Und die Anlage läuft ohne all das vollständig.** Ist die Selbstanmeldung aus,
legt eben nur der Admin Zugänge an. Es fehlt keine Funktion, und der Schalter
steht ab Werk auf **aus**.

**Der Weg, vom Formular bis zum Passwort:**

1. **Anfrage.** Auf der Anmeldeseite steht unter „Anmelden" ein zweiter Knopf:
   **„Zugang anfragen"**, darüber die Frage „Noch keinen Zugang?". Das Formular
   dahinter hat zwei Felder — Wunschname und E-Mail-Adresse — und **kein
   Passwortfeld**.
2. **Bestätigungsmail.** Die Anlage schickt einen kurzen Link an die
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
lässt** — und beides prüft die Anlage selbst, statt es zu empfehlen:

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

**Was die Anlage als Ganzes trifft, wird ein zweites Mal bestätigt.** Vor dem
Export, dem Import, dem Vergeben einer Rolle, dem Setzen eines fremden
Passworts, dem Erzeugen eines Links, dem Entfernen eines Zugangs und dem
**Setzen des Mailzugangs** fragt Kriterion nach **deinem eigenen Passwort**, in
einem Fenster, das daneben schreibt, warum es fragt.

**Wogegen das schützt, ist nicht der Fremde:** der kommt ohne Passwort gar
nicht herein. Es schützt gegen eine **fremde offene Anmeldung** — einen
Bildschirm, der unbeaufsichtigt stehen blieb, einen Rechner, an dem jemand
anderes sitzt. Beim Ändern des eigenen Zugangs gilt dasselbe Prinzip seit
0.5.0; bei den schweren Wegen hat es gefehlt.

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
Anlage als Ganzes angefasst hat**: Anmeldungen (gelungen und gescheitert),
angelegte, gesperrte, freigegebene und entfernte Zugänge, vergebene Rollen,
gesetzte Passwörter, erzeugte und eingelöste Links, Export, Import,
Sicherung — und den **Schlüsselwechsel**. Der trägt weder Ziel noch
Merkmal und keinen Handelnden: gewechselt wird auf dem Wirt. **Die Zeile nennt,
DASS gewechselt wurde, nie WOHIN** — ein Schlüssel steht in keiner
Protokollzeile.

**Was dort nicht steht, ist der eigentliche Punkt.** Es ist **kein
Änderungsverlauf**: kein Eintragstitel, kein Kommentartext, keine Bewertung,
keine Note. Dieselbe Trennlinie wie überall — was die *Anlage* betrifft, nicht
was jemand *gesagt* hat. Ebenso wenig stehen dort **IP-Adresse oder
Browserkennung**: Kriterion speichert beides nicht, und dabei bleibt es.

Ein entfernter Zugang erscheint auch hier als „Gelöschter Benutzer 7" — der
Name wird nirgends aufbewahrt. Und ein Vorgang über den Server
(`node zugang.js …`) trägt keinen Handelnden; die Zeile sagt das ausdrücklich.

**Die Zeilen bleiben 180 Tage stehen** und werden danach von selbst geräumt.
**Einen anderen Weg hinaus gibt es nicht** — ein Sicherheitsprotokoll, das sich
wegräumen lässt, wäre keins. Das Wort meint hier nicht `docker compose logs`;
das heißt in dieser Anleitung weiterhin schlicht *Protokoll*.

### Wer was darf

Am einzelnen Eintrag gilt:

| | Verfasser | jeder andere | Admin |
|---|---|---|---|
| alles sehen | ✔ | ✔ | ✔ |
| Titel, Beschreibung, Fotos, Videos, Tags, Kategorie, getestet, abgelehnt | ✔ | — | ✔ |
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
  *sucht der Server und nicht mehr der Browser.* Gefunden wird
  dasselbe wie vorher; gefragt wird kurz nach dem letzten Anschlag, damit
  nicht jeder Tastendruck über das Netz geht. Ist der Server einmal nicht
  erreichbar, bleibt die zuletzt gezeigte Liste stehen und sagt es.
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
  mit mindestens einem. Die Wahl bleibt bestehen, bis man sie ändert. Im
  Und-Modus werden Tags gedämpft dargestellt, die zusammen mit der aktuellen
  Auswahl keinen Treffer mehr ergäben — anklickbar bleiben sie.
  Die Tagwolke zeigt eine Zeile, nach Häufigkeit sortiert und
  mit den aktiven Filtern vorn; der Rest klappt auf. Tags, die nur an Testtagen
  hängen, stehen nicht darin — dort lieferten sie null Treffer. Die Suche
  findet sie trotzdem.
- **Zeitleiste der Testtage** zwischen Filterleiste und Kartenraster: waagerecht
  die Zeit, senkrecht die Tagesnote, ein Punkt je Testtag. Überfahren zeigt
  Titel, Datum und Note, ein Klick öffnet den Eintrag. Sie richtet sich nach den
  gerade sichtbaren Einträgen und bleibt unter fünf Testtagen weg.
- Filter- und Sortierwahl werden serverseitig gespeichert und sind auf jedem
  Gerät gleich.
- Sortierung nach Änderung, Bewertung, Titel sowie nach Testverlauf: Anzahl der
  Testtage, Durchschnitt der Tagesnoten und letzte Tagesnote. Einträge ohne
  Testtage stehen dabei immer am Ende — sie haben keinen niedrigen Wert, sondern
  gar keinen.
- **★ Favoriten** steht als eigener Umschalter rechts in der Statuszeile und
  lässt sich mit jedem Teststatus kombinieren. Ein Favorit ist persönlich
  und sortiert die gemeinsame Liste nicht um — wer seine Favoriten sammeln
  will, nimmt den Filter.
- **„Neu seit …"** steht daneben und folgt demselben Muster: er
  zeigt, was sich seit dem letzten Besuch getan hat, mit der Zahl daneben, und
  lässt sich mit Status, Kategorie und Tags frei kombinieren. Der Bezugspunkt
  ist persönlich und wird gesetzt, wenn man die Übersicht **verlässt** — solange
  man hinsieht, bleibt die Liste also stehen. **Beim allerersten Besuch
  erscheint der Umschalter nicht:** vorher gibt es nichts, womit sich
  vergleichen ließe. Wie der Favorit filtert er und sortiert nicht.
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
  Rahmen zeigt dabei den künftigen Ausschnitt. Zugeschnitten wird nichts — die
  Datei bleibt unangetastet, es verschiebt sich nur das sichtbare Fenster.
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
- **Bewertung**: gemeinsame Kriterien, feste Skala 1–5. **Die Sterne sind die
  eigene Bewertung**; sind mehrere Zugänge eingerichtet, steht rechts daneben
  gedämpft der Schnitt über alle und die Zahl der Bewerter, im Blockkopf die
  Gesamtzahl. Der Gesamtschnitt entsteht **erst je Kriterium, dann über die
  Kriterien**. Ein **Doppelklick auf die Sterne setzt genau dieses Kriterium
  zurück**, der Knopf oben leert die eigenen Werte für diesen Eintrag — fremde
  Bewertungen bleiben unberührt.
  **Kriterien können verschieden schwer wiegen.** Ist an einem Kriterium ein
  Gewicht eingestellt, das von 1 abweicht, steht `×1,5` hinter seinem Namen,
  und im Blockkopf steht neben der Zahl das Wort „gewichtet". Stehen alle
  Gewichte auf 1 — so, wie eine frische Anlage startet —, sieht der Block aus
  wie zuvor. Eingestellt wird das Gewicht im Systembereich; **der
  Gesamtschnitt bleibt in jedem Fall zwischen 1 und 5.**
  **Wer welchen Wert vergeben hat, steht nicht unter der Sternzeile.** Ab zwei
  Zugängen findet der **Admin** im Blockkopf den Knopf **„Wer hat bewertet"**:
  er öffnet eine Ansicht mit den Namen je Kriterium, und dort lässt sich eine
  fremde Bewertung **entfernen** — ändern lässt sie sich nicht. Für alle
  anderen gibt es den Knopf nicht, und der Server liefert ihnen die Namen auch
  nicht aus.
  **Angelegt, umbenannt, sortiert und gelöscht werden Kriterien
  ausschließlich im Systembereich und ausschließlich vom Admin.** Ein
  neues Kriterium erscheint sofort an jedem Eintrag, ein gelöschtes nimmt
  überall die vergebenen Sterne mit — eine globale Folge, die nicht eine
  Zeigerbreite neben dem Sterne-Widget liegen sollte. Anlegen und Aufräumen
  gehören an dieselbe Stelle.
  Im Systembereich steht daneben, in wie vielen Einträgen das Kriterium
  verwendet wird.
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
  dort zurückholen kann — der Eigentümer der Anlage, nicht der, der hier
  klickt.
- **„Diesen Eintrag als Datei"** *(Eigentümer)*: derselbe Aufbau
  wie eine volle Exportdatei, nur mit einem Eintrag — samt Fotos, Videos,
  Dateien und Kommentarbildern.

**Systembereich** (Zahnrad in der Kopfzeile)

**Was man dort sieht, hängt an der Rolle.** Ein gewöhnlicher Benutzer bekommt
sieben Karten: seinen eigenen **Zugang**, **Meine Sitzungen**, die
**Darstellung**, die **Links** und die drei Listen **Kategorien**, **Tags** und
**Bewertungskriterien** — die letzten drei ohne Bedienzeichen, nur zum
Nachsehen. Alles Übrige steht dem
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
- **Zugänge** verwalten — anlegen mit Passwort **oder mit Link**, sperren,
  Passwort zurücksetzen **direkt oder mit Link**, Rolle wechseln, entfernen;
  siehe den Abschnitt „Rollen und Zugänge" oben *(Admin)*
- **Meine Sitzungen** — wo dieser Zugang überall angemeldet ist, mit „alle
  anderen beenden" *(jeder; jeder sieht nur seine eigenen)*
- **Sicherheitsprotokoll** *(Eigentümer)*: wer Zugang hatte und
  wer die Anlage als Ganzes angefasst hat — 180 Tage lang, ohne einen Weg
  hinaus außer der Frist. Kein Änderungsverlauf, keine Adresse, keine
  Browserkennung.
- **Export** mit oder ohne Fotos, nur für den Eigentümer der Anlage. Die
  Datei nennt zu jedem Eintrag, jeder Bewertung, jedem Kommentar, jedem
  Testtag, **jeder Linkzeile und jeder Datei** den **Verfassernamen**.
  **Videos gehen nur mit eigenem Häkchen mit** — ohne es nennt die Datei sie,
  enthält sie aber nicht, und der Import sagt beim Einspielen, wie viele
  gefehlt haben. Der eigentliche Sicherungsweg für Videos ist ohnehin nicht der
  Export, sondern die Sicherung des Verzeichnisses `data`.
  **Die Karte nennt die erwartete Dateigröße, bevor der Knopf gedrückt wird**,
  und die Zahl folgt den Häkchen. Ab **300 MB** steht ein Hinweis darunter:
  eine Exportdatei ist ein **einziger Text**, und der kann nicht größer als
  512 MB werden. **Gewarnt wird, verweigert nicht** — die Zahl ist eine
  Schätzung, und wer weiß, was er tut, soll es versuchen dürfen. Wird sie
  wirklich gerissen, sagt die Anlage ab, **bevor** sie anfängt zu bauen,
  statt nach zwei Minuten mit einem Speicherfehler abzubrechen. Für eine
  vollständige Kopie ist die **Sicherung** der Weg; sie braucht dafür keinen
  nennenswerten Arbeitsspeicher.
- **Import** einer Exportdatei, wahlweise *ersetzen* oder *zusammenführen* —
  ebenfalls nur für den Eigentümer, und zwar in beiden Fällen: eine
  Exportdatei kann Beiträge **unter fremdem Namen** anlegen.
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

  **Das Gewicht** bestimmt, wie stark ein Kriterium in den Gesamtschnitt
  eingeht. Bei **1** zählen alle gleich — so startet jede Anlage, und so
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

**Es ist eine Anlage und keine zweite Oberfläche.** Es gibt keinen zweiten
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
Übrige — offene Aufgaben, Systembereich, wer angemeldet ist, Abmelden — liegt
**hinter dem Zeichen**.

**Die Suche bleibt draußen**, weil sie auf einem kleinen Bildschirm das
wichtigste Bedienelement ist: Filter und Tagwolke sieht man dort nicht auf einen
Blick, die Suche findet trotzdem. **„+ Eintrag" bleibt draußen**, weil er der
eine Weg ist, auf dem etwas Neues in die Anlage kommt.

**Dasselbe Menü bekommt auch ein Tablett, das mit dem Finger bedient wird** —
dort passt die Kopfzeile mit Fingermaßen sonst nicht in eine Zeile. Ein Fenster
von 1024 Pixeln auf einem Desktop behält die Kopfzeile, die es immer hatte.

Die Tafel schließt sich beim Klick daneben und mit Escape. Ein Menü, das nur
sein eigener Knopf wieder zumacht, steht im Weg, sobald man es versehentlich
geöffnet hat.

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

Bis 0.11.0 war jeder Block eine Karte: eigener Untergrund, eigener Rahmen, eigene
Ecke, eigener Innenabstand. **Worin** die Karte stand, war schon die Seite;
**was** darin stand, waren wieder Kästen. Auf 390 Pixeln lagen damit fünf Kanten
und drei verschiedene Eckenradien zwischen dem Bildschirmrand und dem ersten
Buchstaben — und der Bildbereich saß am Seitenrand, die Kommentarkarte 36 Pixel
weiter innen.

**Auf dem Telefon ist ein Block deshalb kein Kasten mehr, sondern ein
Abschnitt:** ein Trennstrich darüber, ein Titel, der Inhalt. Er steht auf der
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
  *Vorher stand die Kachel fest auf 62 Pixeln, und was nicht mehr hineinpasste,
  blieb als Streifen rechts liegen — auf einem 360 Pixel breiten Telefon ein
  Fünftel der Breite, weil die fünfte Kachel an zwei Pixeln scheiterte.* Am
  Desktop bleibt die Kachel bei ihren 62 Pixeln.
- **Eingabefelder fallen nicht unter 16 Pixel.** Darunter zoomt Safari auf dem
  iPhone beim Antippen die ganze Seite heran und wieder heraus tut sie es nicht
  von selbst. Wer die Schrift auf 80 Prozent stellt, bekommt hier deshalb nicht
  ganz, was er wollte — aber eine Seite, die bei jedem Tastendruck springt, hat
  er noch weniger gewollt.
- **Die Aussparung des Geräts wird mitgerechnet** — Kopfzeile, Vollbild,
  Meldungen und die Vergleichsleiste. Auf jedem Gerät ohne Aussparung ändert das
  nichts.
- **Die Leiste des Browsers nimmt die Farbe der Anlage.** Ein hellerer Streifen
  über der dunklen Seite ist das, was eine Seite wie eine Seite aussehen läßt.

### Berühren, halten, wischen

Sortieren und Scrollen teilen sich auf einem Berührungsbildschirm denselben
Zeiger. Deshalb gilt: **mit der Maus wird sofort gezogen, mit dem Finger erst
nach kurzem Halten** (0,4 Sekunden). Bewegt sich der Finger vorher, war es ein
Wisch — dann wird gescrollt und nichts umsortiert. Sobald gegriffen ist, meldet
das die Zeile mit einem Rahmen, und das Gerät gibt einen kurzen Impuls.

**Keine Liste scrollt in sich selbst.** Wer die Seite herunterzieht und dabei
über eine lange Linkliste oder eine Tagwolke kommt, scrollt weiter die Seite —
die Listen werden abgeschnitten statt scrollbar gemacht, und der Weg zum Rest
ist der Aufklappknopf darunter. Ein eigener Bildlauf mitten in der Seite fängt
sonst die Wischbewegung ab.

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
Blättern hängen an der Lightbox, nicht an der Bildfläche: im gezoomten Zustand
wird diese zum Scrollbereich, und Kinder davon wandern beim Verschieben mit dem
Bild aus dem Bild.

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
sammelt, ändert diese elf Wörter im Systembereich — aus „3 Einträge" wird
„3 Maschinen", aus „+ Testtag eintragen" wird „+ Sitzung eintragen".

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

Leere Felder fallen auf die Vorgabe zurück, ein Knopf stellt alle elf
zurück. Eine Probe unter den Feldern zeigt vor dem Speichern, wie die Wörter in
echten Textbausteinen aussehen.

## Schriftgröße

Sämtliche Schriftgrößen im Stylesheet sind relativ (`rem`) und hängen an einem
einzigen Grundmaß am Wurzelelement. Die Einstellung im Systembereich setzt genau
dieses Maß. **Layoutmaße bleiben in Pixeln** — bei 120 % wird es deshalb an
einigen Stellen enger, dafür verschiebt sich das Gefüge nicht. Die Anmeldeseite
bleibt bei der Vorgabegröße, weil der Endpunkt vor der Anmeldung nur den
öffentlichen Titel ausliefert.

## Dateien am Eintrag — wie sie abgesichert sind

**Eine Anlage darf niemals so ausgeliefert werden, dass der Browser sie als
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
`media-src 'self' blob:`: `'self'` trägt das Abspielen aus der eigenen Anlage,
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
und liest `word/document.xml` als Text — eine eigene Abhängigkeit dafür wäre für
eine vereinfachte Lesevorschau zu viel gewesen. Absätze und Zeilenumbrüche
bleiben, alles andere fällt weg.

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

Fotos werden **unverändert** gespeichert — ein Bild aus einer Systemkamera
bleibt bei seinen 8–12 MB. Zusätzlich entstehen zwei kleinere Varianten: eine
Kachel (400 px) für die Übersicht und eine mittlere (1600 px) für Detail- und
Vollbildansicht. Das kostet rund 7 % mehr Speicher, spart beim Blättern aber
etwa den Faktor 100 an Datenübertragung. Das Original wird erst geladen, wenn im
Vollbild gezoomt wird.

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
vorher, wie lange es dauert; **während die Kopie entsteht, steht die Anlage
still** (rund zehn bis zwanzig Millisekunden je Megabyte). Sie zeigt außerdem,
wann zuletzt gesichert wurde — gelesen wird das am Zielort selbst, nicht aus
einem Merker in der Datenbank.
**Und zeigt sie, welche Kopien noch mit dem alten Schlüssel
verschlüsselt sind**, falls je gewechselt wurde: jede Kopie, die älter ist als
der Wechsel, wird rot markiert. Ist auch die jüngste älter, sagt die Karte, dass
überhaupt keine zum heutigen Schlüssel passt — dann gehört sofort neu gesichert.
Einzelheiten im Abschnitt „Den Schlüssel wechseln".

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

> **Und daran hat er seine Grenze.** Die Datei ist ein einziger Text, und
> länger als **512 MB** kann ein Text in Node nicht werden — Fotos und Videos
> stecken als Base64 darin und kosten dabei ein Drittel Aufschlag. Die Karte
> **Export** rechnet das vorher aus und warnt ab **300 MB**; darüber sagt die
> Anlage ab, bevor sie anfängt. **Für große Bestände ist deshalb die Sicherung
> der Weg und nicht der Export** — sie schreibt über `VACUUM INTO` und braucht
> dabei keinen nennenswerten Arbeitsspeicher. Beim **Import** gilt dieselbe
> Grenze, dort aber vorab sichtbar: die Dateigröße steht ja fest, und die
> Anlage fragt nach, bevor sie zu lesen anfängt.

> **Vor einer Version, die die Datenbank anfasst, ist die Sicherung Pflicht.**
> Ob eine Version das tut, sagt `CHANGELOG.md` unter „Was du danach von Hand
> tun musst", und ausführlich das Änderungsprotokoll der Version.
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

- `items` — Titel, Beschreibung, Getestet-/Abgelehnt-Merkmal, Kategorie
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
  zwei Aussagen sind: die eine über die Anzeige, die andere über die Rechnung
- `product_categories`, `tags`, `item_tags`
- `comments` — mit Bearbeitungszeitpunkt und `images_removed`: die Zahl der
  Bilder, die ein **anderer** als der Verfasser entfernt hat
- `test_day_tags` — Tags an einzelnen Testtagen, getrennt von `item_tags`
- `comments.kind` / `comments.pinned` — Art und Anpinnung je Kommentar
- `comment_images` — Bilder in Kommentaren, eigene Tabelle neben `attachments`
- `attachments` — angehängte Dateien samt Bytes **und Verfasser**
- `photos.focus_x` / `photos.focus_y` — Fokuspunkt der quadratischen Vorschau
- `settings` — die **globale** Hälfte: Titel, Vokabular, die Suchanbieter
  (Vorrat, eigene Anbieter, Startanbieter) und die beiden Schalter, wer neue
  Tags und Kategorien anlegen darf. Sache des Admins
- `user_settings` — die **persönliche** Hälfte, **acht** Schlüssel: die zuletzt
  benutzte Filterwahl, die **gespeicherten Ansichten**, der
  Bezugspunkt für „Neu seit …", Schriftgröße, Blockanordnung,
  sichtbare Linkzeilen, Zeitleiste und die Zahl der Anbieternamen. Je Benutzer
  eine Zeile pro Schlüssel
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
  Zeilen räumt die Anlage nach dreißig Tagen selbst weg
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
- `sicherheitsprotokoll` — **wer Zugang hatte und wer die Anlage als Ganzes
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
Wegwerfverzeichnissen an — `./data` bleibt unangetastet, alle Anlagen entstehen
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
Ausgangsstand gehalten — und **die Sicherung an einer echten Anlage**: die
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
verschlüsselten Anlagen: wechseln, mit dem neuen Schlüssel lesen, mit dem alten
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
nicht mehr. **Feld für Feld gegen eine namentliche Liste** wird geprüft, dass
`searchText` fort ist und **sonst nichts**, und dass `testDays` genau dann
fehlt, wenn die Zeitleiste aus ist — samt der Nachschau, dass die Kachelzahlen
trotzdem stimmen. Am Bildschirm: dass **drei Anschläge hintereinander EINE
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
bestehenden Anlage beim Start selbst wieder anlegt — **eine Spalte dagegen
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

> **„Keine Berechtigung"?** Dann fehlt dem Skript das Ausführungsrecht —
> `python3 -m zipfile -e` im Einspielweg bringt es nicht mit. Einmal
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
3. die Anlage **anhalten** — ein laufender Server hält die Datenbank im
   WAL-Modus offen, und der Wechsel braucht `journal_mode = DELETE`
4. das Datenverzeichnis sichern (`../kriterion-data-vor-schluesselwechsel-…`)
5. wechseln, in einem Wegwerf-Container
6. **erst nach Erfolg** den neuen Wert eintragen — in die `.env` oder in
   `data/encryption.key`, je nachdem, woher der alte kam
7. die Anlage starten

Danach ins Protokoll sehen:

```bash
docker compose logs --tail 30 kriterion
```

Erwartet wird „Schlüssel aus ENCRYPTION_KEY geladen." bzw. die Warnung, dass
der Schlüssel neben der Datenbank liegt.

> **PROBIER DEN WECHSEL AN EINER WEGWERFANLAGE AUS, bevor du ihn an der echten
> fährst.** Es ist der einzige Vorgang im ganzen Projekt, bei dem ein Fehler
> alles kostet.

**Und die Probe muss an einem echten Bestand laufen, sonst belegt sie nichts.**
Ein Wechsel an einer leeren Datenbank ist in Millisekunden vorbei und sagt über
662 MB nichts. Die Probe unten nimmt deshalb eine **Kopie der echten Anlage** —
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
> keine Probe mehr, sondern eine neue Anlage.** Wird `data/` gelöscht und ein
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
**Die `.env` der Probe niemals an die echte Anlage zurückkopieren** — sie trägt
einen Schlüssel, zu dem nur die Probedaten passen.

### Zwei Schlüssel im Umlauf — die unangenehmste Falle

**Ab dem Wechsel gibt es zwei Schlüssel.** Jede Sicherung, die vorher entstanden
ist, bleibt mit dem **alten** verschlüsselt. Sie ist nicht kaputt — sie braucht
nur einen anderen Schlüssel als die laufende Anlage. Wer das nicht weiß, hält
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
