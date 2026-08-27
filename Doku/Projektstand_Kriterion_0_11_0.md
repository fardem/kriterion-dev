# Projektstand — Kriterion

**Kompakte Übergabe · Revision 25 · Stand 27. August 2026 · gebaut: Version 0.11.0**

Dieses Blatt ist der **einzige Ort, an dem steht, was gebaut ist und was
bindet.** Es genügt, um in einem frischen Chat weiterzuarbeiten, ohne den alten
Verlauf mitzuschleppen. **Gearbeitet wird im Repo `fardem/kriterion`**, nicht an
einer Kopie; dieses Blatt, die Konzeptpapiere und die Änderungsprotokolle liegen
dort unter `Doku/`.

> **WAS REVISION 25 IST — DIE ZUSAMMENFÜHRUNG.** Bis Revision 24 stand
> Umgesetztes an mehreren Orten zugleich: hier, im Konzeptpapier zum
> Mehrbenutzerbetrieb und im Videopapier. Drei Orte für dieselbe Frage sind
> zwei zu viel (Stolperstein 47), und beim Nachziehen wird immer einer
> vergessen — genau so ist Stolperstein 137 entstanden.
> **Ab dieser Revision gilt: was gebaut ist, steht hier.** Die beiden
> Konzeptpapiere sind auf das eingedampft, was sie allein sind — Herleitung,
> Abweichungen und, im Videopapier, der **noch nicht gebaute Teil II**.
> Mitgenommen wurden dabei die Punkte, die dort und nirgends sonst standen:
> die Einstellungstabelle (Abschnitt 3), die Nachschau per SSH (Abschnitt 8),
> die offene Frage nach der Eindeutigkeit der Adresse und der Versanddienst
> über HTTPS (Abschnitt 10) sowie die offenen Auflagen aus Teil V
> (Abschnitt 11).
> **Und dieses Blatt selbst ist umgeräumt:** Abschnitt 5 ist nach Themen
> sortiert statt nach Versionen, Abschnitt 2 trägt die Geschichte nicht mehr
> doppelt neben Abschnitt 9, und der Kopf ist ein Kopf und kein zweites
> Changelog. **Die Abschnittsnummern 1 bis 12 samt 5a bleiben, wie sie waren** —
> Quelltext, Prüfstand und die übrigen Papiere verweisen darauf.

**0.11.0 in einem Satz: die Suche zieht vom Browser auf den Server, wer oft
dasselbe sucht, kann es sich merken — und wer denselben Gegenstand zweimal
anlegt, erfährt es beim Tippen.** Es ist die zweite Runde nach dem Stufenplan,
die zweite unter Semantic Versioning — und die erste, die etwas Bestehendes
umbaut, statt etwas Neues danebenzustellen. Alles Weitere in Abschnitt 2 und
Abschnitt 9.

> **Regel für diesen Kopf, damit er nicht zum zweiten Changelog wird.** Er
> trägt die **gebaute** Runde in einem Satz und sonst nichts Versionsbezogenes.
> Was eine Runde gebracht hat, steht in Abschnitt 9; wie sie sich im Betrieb
> auswirkt, in Abschnitt 2. *Ein Übergabeblatt, das mit jeder Version wächst,
> wird irgendwann nicht mehr gelesen — und dann nützt es niemandem mehr.*

> **Zum Wortgebrauch.** Drei Rollen, und sie sind eine **Leiter**: `user` <
> `admin` < `eigentuemer`. **Benutzer** schreibt eigene Beiträge. **Admin**
> verwaltet den gemeinsamen Bestand und legt Benutzer an, sperrt und löscht
> sie — aber nicht seinesgleichen. **Eigentümer** ist alles davon, dazu:
> Rollen vergeben, an andere Admins heran, Export, Import, Schlüsselwert. Die
> Rolle ist ein **vergebbarer Rollenwert**, keine Ableitung aus der
> Benutzernummer.
> Durchgehend heißt es **Version** (nie „Fassung"), am Eintrag **Favorit**
> (★), am Kommentar **angepinnt/Anpinnung** (📌), Bild-Renditionen heißen
> **Variante**, und die einmalige Datenüberführung beim Start hieß
> **Migration** — sie kommt seit 0.8.1 nur noch historisch vor.

**Welches Papier was trägt:**

| Papier | Was darin steht |
|---|---|
| **dieses Blatt** | **der Stand**: was gebaut ist, was bindet, was offen ist |
| `CHANGELOG.md` (Wurzelverzeichnis) | je Version, was ein **Betreiber** wissen muss |
| `Doku/Aenderungsprotokoll_<Version>.md` | je Runde, was wirklich gebaut wurde — Rohstoff, unverändert |
| `README.md` | die **Bedienung und der Betrieb**: einrichten, sichern, einspielen, wer was darf |
| `Doku/Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_1.md` | die **Herleitung** des abgearbeiteten Stufenplans — Historie, geschlossen |
| `Doku/Konzept_Video_und_grosse_Dateien.md` | **Teil II, große Dateien bis 2 GB** — noch nicht gebaut |
| `Doku/Roadmap.md` | **neue** Punkte aus dem Betrieb, ohne Nummer |
| `Doku/Ideen_und_Vorschlaege.md` | die Durchsicht von damals — eine **Quelle**, kein Stand |
| `Doku/Auftrag_<Version>.md` | der Auftrag der **laufenden** Runde; er fällt weg, sobald die nächste beginnt |

---

## 1. Was es ist

Selbstgehostetes Bewertungsarchiv für Dinge, die man sammelt und beurteilt —
Geräte, Materialien, Modelle, Prototypen. Kein Verkauf, keine Cloud, läuft
offline im Heimnetz auf einem Intel N100 unter OpenMediaVault, hinter Nginx
Proxy Manager, erreichbar auf Port **3100**.

Node.js/Express, verschlüsselte SQLite-Datenbank (SQLCipher über
`better-sqlite3-multiple-ciphers`), `sharp` für die Bildvarianten, Frontend
ohne Framework, Auslieferung per Docker.

**20 Dateien.** Darin `pruefung.js` — der Prüfstand, läuft über `npm test` —,
`anhaenge.js` mit sämtlichen Auslieferungsregeln für angehängte Dateien
(Abschnitt 5a) und `zugang.js`, der Befehl auf dem Wirt für Passwort und
Zugänge. Dazu `gegenprobe.js` (der Gegenprobentreiber, läuft eigens und nicht
über `npm test`) sowie `schluessel.sh` und `schluessel.js` — der
Schlüsselwechsel, ebenfalls auf dem Wirt. **Keine dieser drei steht im
Fingerprint**: der Server lädt sie nicht und liefert sie nicht aus.

**Das Projekt heißt „Kriterion", die Datenbankdatei weiterhin
`katalog.sqlite`.** Der Dateiname ist kein Projektname und wandert bei keiner
Umbenennung mit — ein anderer Name ließe den Start eine leere Neuinstallation
vermuten (Abschnitt 5).

**Der Leitgedanke, seit dem ersten Entwurf des Mehrbenutzerbetriebs und
unverändert: ausgeschaltet sieht Kriterion aus wie vorher.** Bei genau einem
aktiven Zugang gibt es keine Durchschnittsspalte, keinen Verfassernamen und
keinen Umschalter „meine / alle". Das ist **kein Schalter**, sondern **aus der
Zahl der aktiven Zugänge abgeleitet** — ein Zustand, keine zweite Wahrheit.
*„Für eine Person, dafür vollständig verschlüsselt" bleibt ein vollwertiger
Betriebszustand und kein halb ausgebauter.*

**Zur Netzlage, seit 0.8.20 nachgesehen statt vermutet** (`docker inspect`):
Kriterion hängt allein in `kriterion_default`, Nginx Proxy Manager in
`npm_external-net`/`npm_internal-net` — **kein gemeinsames Netz**. Der Proxy
steht inzwischen davor (Abschnitt 8); die Portfreigabe 3100 ist daneben
weiterhin offen. Daraus folgt die Stellung von `HINTER_PROXY` (Abschnitt 3).

---

## 2. Betriebsstand

**Gebaut ist 0.11.0** — Fingerprint **`74c44ec0`**, **3815 Prüfungen**, 34
Gegenproben. **KEINE DATENBANKSTUFE:** keine Tabelle, keine Spalte, kein
Migrationscode; es bleibt bei **fünf** markierten Migrationsblöcken. *Die
Sicherung des Datenverzeichnisses ist deshalb Empfehlung und nicht Pflicht.*
Was die Runde bringt, steht in Abschnitt 9.

**Was 0.11.0 für den Betrieb bedeutet.** Es kommt **keine neue `.env`-Zeile**
dazu, die `docker-compose.yml` ist unberührt, und es gibt nichts einzustellen.
**Eine Sache gehört danach in den Blick, und sie ist harmlos:** die Marke hat
sich geändert, und **zwei Dateien in `public/` sind damit andere**. Wer im
Reiter des Browsers noch die alte Marke sieht, sieht einen zwischengespeicherten
Stand und keine kaputte Anlage; ein hartes Neuladen räumt ihn weg. *Am
Fingerprint ist die Änderung dagegen sofort zu sehen — er geht über ALLES in
`public/`.*

**Ob 0.11.0 im Feld läuft, steht noch aus.** Der Rundlauf von Hand — nach einem
Kommentartext suchen, eine Ansicht speichern und nach dem Abmelden wieder
wählen, einen Doppeleintrag antippen und die Zeile „Ähnlich" sehen — gehört
nach dem Einspielen einmal gefahren; das Ergebnis gehört hierher
(Abschnitt 8).

**IM FELD BESTÄTIGT IST 0.10.0** — die laufende Anlage meldete denselben
Fingerprint wie der Branch (`dc8c16f7`), und der zweite Faktor tut, was er soll.
**Der Mailversand aus 0.9.0 ist ebenfalls bestätigt** (die erste echte
Einladungsmail kam an, Absender und Link stimmten, der Rumpf stand als reiner
Text da). **Und bei 0.9.1 hat sich der Fingerprint zum ersten Mal bezahlt
gemacht:** die laufende Anlage meldete einen Wert, den kein Commit trug —
Ursache war **eine Datei zu viel** auf dem Wirt (Stolperstein 158).

**Fingerprints der letzten Runden**, zum Abgleich mit `GET /api/stats`:

| Version | Fingerprint | Prüfungen |
|---|---|---|
| **0.11.0** | **`74c44ec0`** | 3815 |
| 0.10.0 | `dc8c16f7` | 3676 |
| 0.9.1 | `3cf1b093` | 3451 |
| 0.9.0 | `82dc8550` | 3192 |
| 0.8.91 | `a810f529` | 3010 |
| 0.8.90 | `aeb336bf` | 2909 |
| 0.8.80 | `a835ac92` | 2661 |
| 0.8.71 | `1b03fabf` | 2398 |
| 0.8.70 | `1aa9266a` | 2381 |

*Ältere: 0.8.60 `ab68b523`, 0.8.50 `3cb528d6`, 0.8.40 `49d2ae53`, 0.8.31
`1a801477`, 0.8.30 `f498cbda`, 0.8.20 `3ab38137`, 0.8.10 `48fe44e7`. Der Wert
jeder Version steht auch in ihrem Änderungsprotokoll.*

**`HINTER_PROXY` STEHT IM BETRIEB AUF `1`.** Der Reverse Proxy steht inzwischen
davor — festgehalten wurde das mit 0.10.0. Die Anmeldung läuft damit nur noch
über HTTPS, und der Sitzungscookie heißt `__Host-kriterion_session`. **Der
direkte Weg über `http://<server-ip>:3100` ist damit tot** — der Server
antwortet zwar mit 200, aber der Browser verwirft den `Secure`-Cookie
stillschweigend. *Das ist kein
Fehler, sondern der Preis der Einstellung.* Was daran offen ist und wie der Weg
zurück aussieht, steht in Abschnitt 8; die fünf Wirkungen der Einstellung in
Abschnitt 3.

**Die beiden Anlegen-Schalter stehen so:** bei den **Kategorien aus** (nur der
Admin legt neue an, das Auswahlfeld am Eintrag bleibt), bei den **Tags an**
(jeder vergibt am Eintrag einen neuen Namen). Das ist eine Einstellung im
Systembereich, keine Version — beides jederzeit umkehrbar.

**Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.** Ältere Bestände
werden nicht übernommen; sie bräuchten den Zwischenschritt über 0.8.0 als
letzte Version mit Migrationscode. **Eine wirklich alte Anlage läuft dabei
wortlos in SQL-Fehler** — die klare Absage am Start ist für 1.0 vorgemerkt
(Abschnitt 10).

### Welche Version das Schema angefasst hat

**Die Sicherung des Datenverzeichnisses ist bei einer Datenbankstufe PFLICHT und
sonst Empfehlung.** Der Grund ist nicht Vorsicht, sondern der Rückweg: bei einer
Datenbankstufe ist ein Downgrade **keine reine Dateikopie mehr**.

| Version | Schema | Migrationsblock | Sicherung |
|---|---|---|---|
| 0.8.3 | Spalte `comments.images_removed` | `migration083()` | Pflicht |
| 0.8.30 | Spalte `links.user_id` | `migration0830()` | Pflicht |
| 0.8.31 | Spalte `attachments.user_id` | `migration0831()` | Pflicht |
| 0.8.40 | Spalte `rating_criteria.gewicht` | `migration0840()` | Pflicht |
| 0.8.50 | Spalten `photos.art`, `photos.dauer` | `migration0850()` | Pflicht |
| 0.8.70 | Tabellen `papierkorb`, `papierkorb_bytes` | **keiner** | Pflicht |
| 0.8.80 | Tabelle `tokens` | **keiner** | Pflicht |
| 0.8.90 | Tabelle `sicherheitsprotokoll` | **keiner** | Pflicht |
| 0.9.1 | Tabelle `anfragen` | **keiner** | Pflicht |
| 0.10.0 | Tabellen `zweifaktor`, `zweifaktor_codes` | **keiner** | Pflicht |
| 0.8.6 · 0.8.10 · 0.8.20 · 0.8.60 · 0.8.71 · 0.8.91 · 0.9.0 · **0.11.0** | — | — | Empfehlung |

*Die Spalte „Sicherung" ist eine rückblickende Einordnung. **Als Regel steht sie
erst seit 0.8.30 im Einspielweg** — 0.8.3 lag davor, und damals war der Rückweg
noch das Zurückkopieren des alten Dateisatzes.*

**Eine neue SPALTE braucht die DDL UND einen Migrationsblock, eine neue TABELLE
nicht.** `CREATE TABLE IF NOT EXISTS` legt eine fehlende **Tabelle** bei jedem
Start an, eine fehlende **Spalte** in einer vorhandenen Tabelle dagegen nie
(Stolperstein 13). Deshalb bleibt es trotz zehn Datenbankstufen bei **fünf**
markierten Blöcken; nachgestellt statt abgeschrieben, an jeder neuen Tabelle
erneut, samt der Gegenlage an einer Spalte.

**`migration0850()` fragt jede seiner beiden Spalten EINZELN ab.** Zwei
`ALTER TABLE` sind zwei Anweisungen: scheitert die zweite, bleibt die erste
stehen (Stolperstein 108). So heilt der nächste Start einen zerrissenen Stand.
**Wer von 0.8.20 kommt, fährt alle Blöcke in einem Start** — der Prüfstand fährt
genau diesen Sprung.

**Keine Migration verändert eine angezeigte Zahl oder Zeile.** Die
Bestandszeilen bekommen ihren Wert aus dem `DEFAULT` der Spalte, nicht aus einem
nachgeschobenen `UPDATE`: Gewicht 1,0 ist bitgleich zum ungewichteten Mittel,
`art = 'bild'` ändert an keiner Auslieferung etwas.

*Genau genommen ginge ein Downgrade oft auch ohne Sicherung: eine zusätzliche
Spalte oder Tabelle stört eine ältere Fassung nicht, und die Exportdatei behält
ihre Nummer. Verlassen sollte man sich darauf nicht — jede Linkzeile, die
danach entsteht, ist herrenlos und fällt beim nächsten Vorwärtsschritt dem
Eigentümer zu statt dem Eintrager; ein Zugang, der über einen Link angelegt und
noch nicht eingelöst wurde, kommt in einer älteren Fassung gar nicht mehr
herein. **Die Sicherung ist der Weg, der ohne diese Fußnoten auskommt.***

### Der Weg zum Einspielen

Das Repo ist **privat**, der Server zieht deshalb nicht selbst — das ZIP kommt
über „Download ZIP" von GitHub auf den Wirt. Der Pfad steht am laufenden
Container, kein Suchen, kein Abschreiben:

```bash
cd "$(docker inspect kriterion --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}')"
docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)   # PFLICHT bei Datenbankstufen
mv kriterion kriterion-alt
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion               # GitHub hängt den Branchnamen an
cp -r kriterion-alt/data kriterion/data
cp kriterion-alt/.env kriterion/.env      # OHNE DIESE ZEILE STARTET NICHTS
chmod +x kriterion/schluessel.sh          # das ZIP bringt das Recht nicht mit
cd kriterion && docker compose up -d --build
```

**Der Weg ERSETZT das Verzeichnis, er kopiert nicht darüber.** Das ist kein
Geschmack: ein Einspielweg, der Dateien kopiert, **entfernt keine** — eine in
dieser Version gelöschte Datei bliebe liegen und liefe mit, und der Fingerprint
schlüge aus, ohne dass die Anlage kaputt wäre (Stolperstein 158).

**Die `chmod`-Zeile ist nachgestellt:** `python3 -m zipfile -e` stellt **keine
Ausführungsrechte** wieder her, `unzip` dagegen schon. Im Repo trägt
`schluessel.sh` den Modus `100755`; auf dem Wirt kommt er ohne ihn an
(Stolperstein 140). Ohne das Recht geht `bash schluessel.sh`.

**Die Sicherungszeile gehört ZWISCHEN `docker compose down` und alles Weitere** —
eine Sicherung, die neben einem laufenden Server entsteht, kann eine offene WAL
enthalten.

**Seit 0.8.70 legt `docker compose` beim ersten Start ein zweites Verzeichnis
an**: `kriterion-sicherung`. Dorthin schreibt die Karte „Sicherung". Es gehört
**nicht** in dieselbe Ablage wie die `.env` — die Kopie ist verschlüsselt und
ohne den Schlüssel wertlos, und beides nebeneinander hebt die Verschlüsselung
auf. **Die Sicherung auf Knopfdruck ersetzt die Zeile oben deshalb nicht
vollständig**: wer sich auf den Knopf verlässt, sichert die `.env` getrennt.

**Beim Schlüsselwechsel gilt die Sicherung ein zweites Mal**, und die `.env`
dazu. `./schluessel.sh wechseln` legt beides selbst an, aber eine Sicherung, die
neben dem Original liegt, ist keine. **Bricht der Wechsel ab, stellt das
Rollback-Journal den alten Stand her — geht das Journal verloren, ist alles
verloren.** Das ist der Grund für die Kopie, nicht der Abbruch selbst. **Und der
Schlüsselwechsel wird nicht nebenbei ausprobiert** — wer ihn zum ersten Mal
fährt, fährt ihn an einer Wegwerfanlage; das Rezept steht in der README.

### Sieben Dinge, die beim Einspielen schiefgehen können — alle schon vorgekommen

- **Der Ordner aus dem GitHub-ZIP heißt nicht `kriterion`.** GitHub packt den
  Branchnamen an: aus `main` wird `kriterion-main`, und Schrägstriche im
  Branchnamen werden zu Bindestrichen. Ohne das `mv` legt das anschließende
  `cp -r` den Bestand in einen Ordner, den `docker compose` nie ansieht — oder
  es scheitert. **Der Branchname steht damit im Einspielweg.**
- **`--build` vergessen.** `docker compose up -d` startet stillschweigend die
  alte Version weiter — der Quelltext steckt im Image, nicht im eingehängten
  Verzeichnis. `curl -s http://localhost:3100/api/config` nennt die Version, die
  der Server wirklich ausliefert. Stimmt sie und die Oberfläche verhält sich
  trotzdem alt, liegt `app.js` im Zwischenspeicher des Browsers (Strg+Shift+R).
- **Eine unvollständige Kopie sieht aus wie eine vollständige.** Die
  Versionsnummer im Footer kommt aus `package.json` und ist keine Aussage über
  die übrigen Dateien. **Dagegen steht seit 0.8.10 der Fingerprint** in der
  Karte „Kennzahlen" (`GET /api/stats`): ein Wert über **alles**, was der
  Server lädt und ausliefert. Stimmt er nicht, war die Kopie unvollständig oder
  es wurde nicht neu gebaut — dann hilft nur der vollständige Dateisatz, nicht
  das Nachziehen einzelner Dateien. **Er schlägt in beide Richtungen aus, bei
  einer Datei zu wenig wie bei einer zu viel.**
- **`cp .env.example .env` statt der echten `.env`** (Stolperstein 45). Dann
  steht `ENCRYPTION_KEY=` leer da, der Start erzeugt einen **neuen** Schlüssel
  und legt ihn als `data/encryption.key` ab, und die vorhandene Datenbank lässt
  sich damit nicht mehr öffnen. Zerstört wird nichts, aber die falsche
  Schlüsseldatei wird beim nächsten Start gegenüber einer nachgetragenen `.env`
  bevorzugt. Ausweg: `data/encryption.key` löschen und die richtige `.env`
  zurückholen.
- **Zweiter Anlauf nach einem Abbruch**, bei dem `cp -r kriterion-alt/data
  kriterion/data` nicht überschreibt, sondern `kriterion/data/data` anlegt. Der
  Bestand wirkt dann leer.
- **Der alte Ordner läuft noch** und belegt Port 3100. Deshalb steht das
  `docker compose down` an erster Stelle.
- **Der Sicherungsort ist nicht eingehängt.** Wer eine alte
  `docker-compose.yml` weiterbenutzt, bekommt die Karte „Sicherung" mit dem
  Satz „Es ist kein Sicherungsort eingerichtet" — und **nicht** eine, die still
  ins Nichts schreibt. Der Ausweg ist die neue Datei aus dem ZIP.

**Nicht auf Variablen umstellen:** Eine frühere Compose-Datei nutzte
`"${HOST_PORT:-3100}:3000"`. Die Ersetzung wurde auf dem Zielsystem nicht
aufgelöst, der Container startete ohne Portfreigabe. Der Port steht deshalb
unmittelbar da.

**Nach jedem Einspielen lohnt ein Blick ins Protokoll.** Der Start meldet den
Eigentümer, `.env`-Reste, die Betriebsart („Hinter Proxy: an/aus"), die
öffentliche Adresse, den Mailversand — und, falls je nötig, das Aufräumen des
Sicherheitsprotokolls, die Zuordnung herrenlosen Bestands und die einmalige
Zeile einer Migration. Beim zweiten Start ist sie weg; das ist richtig so.

---

## 3. Zugang und Verschlüsselung

### Rechteschicht und Träger

Mehrbenutzerbetrieb mit Rechteschicht: jede Sitzung weiß, wem sie gehört
(`sessions.user_id`), `requireAuth` legt den Benutzer als `req.benutzer` ab, und
**jeder schreibende Endpunkt weiß, wer etwas darf**. Der **Admin**
(`role = 'admin'`) verwaltet den gemeinsamen Bestand und löscht fremde Beiträge,
der **Eigentümer** (`role = 'eigentuemer'`) besitzt Export, Import,
Schlüsselwert und Rollenvergabe, alles am Eintrag gehört seinem Verfasser.
**Bei einem einzigen Zugang ist von alledem nichts zu merken.**

**Sechs Träger tragen einen Verfasser** (`user_id`, alle mit
`ON DELETE SET NULL`): Eintrag, Kommentar, Testtag, Bewertung, **Linkzeile**
(seit 0.8.30) und **Datei** (seit 0.8.31). **Fotos und Videos sind ausdrücklich
KEIN Träger** — sie hängen am Eintrag und gehören seinem Verfasser; das erste
Element ist das Hauptbild und damit das Gesicht des Eintrags.
**`papierkorb.geloescht_von`, `sicherheitsprotokoll.wer` und `.ziel` sehen aus
wie weitere Träger und sind keine:** sie halten einen **Vorgang** fest, so wie
ein Zeitstempel — daran hängt kein Recht, und sie stehen ausdrücklich nicht in
`ordneBestandZu()`.

**Die vollständige Rechtetabelle steht in der README** („Wer was darf"). Der
Satz dahinter: **löschen ja, umschreiben nein.** Ein Admin räumt auf, aber er
verändert keine fremde Aussage unter fremdem Namen — keinen fremden
Kommentartext, keine fremde Note, kein Bild an einen fremden Kommentar. Die
Regel, aus der sich die Zuständigkeiten ergeben, steht in Abschnitt 5:
*was an allen Einträgen aller Benutzer erscheint, gehört dem Admin; was nur
dort erscheint, wo man es hinsetzt, gehört jedem.*

### Der Zugang selbst

**Der Zugang liegt als scrypt-Hash in der Tabelle `users`**, nicht in der
Umgebung; gesetzt wird er beim ersten Aufruf im Browser, und wer die Anlage
einrichtet, ist ihr Eigentümer. Es gibt keine voreingestellte Kennung.
Mindestens zehn Zeichen, sonst keine Regeln — **auch für ein Passwort, das über
einen Link gesetzt wird**. Ohne Anmeldung ist außer dem öffentlichen Titel
nichts sichtbar, auch über die Schnittstellen nicht, Fotos und Export
eingeschlossen. Sitzung 30 Tage, Cookie mit `HttpOnly`/`SameSite=Lax`.

**Die Anmeldebremse** zählt je IP (weich ab fünf Fehlversuchen, hart **ab dem
elften** für fünf Minuten — der Zähler wird gelesen, bevor er erhöht wird,
Stolperstein 124) und zusätzlich je Benutzername — dort nur **verzögernd, nie
sperrend**. Sie greift an **jeder** Route, die ein Geheimnis prüft: Anmeldung,
zweiter Schritt, zweite Bestätigung, die beiden Tokenrouten und die beiden
Routen der Selbstanmeldung. **An den Routen vor der Anmeldung fällt die
Namenshälfte weg.**

**Ein gesperrter Zugang erfährt es — aber erst nach dem richtigen Passwort**,
und ein Fehlversuch ist es nicht. Der Status wird an **zwei** Stellen
durchgesetzt, Anmeldung und `requireAuth`; ohne die zweite bliebe ein gerade
Gesperrter bis zum Ablauf seines Cookies drin.

**Passwort vergessen — drei Wege, und sie ersetzen einander nicht:** der
**Rücksetzlink** aus der Karte „Zugänge" (der Betroffene wählt selbst, das
bisherige Passwort gilt weiter, bis der Link eingelöst wird), der **direkte
Weg** (der Admin setzt ein Passwort und sagt es — er braucht den Browser des
anderen nicht) und, wenn **niemand mehr hereinkommt**, der Weg über den Wirt:

```bash
docker compose exec kriterion node zugang.js passwort <benutzername>
```

Das neue Passwort wird zweimal abgefragt und sofort gesetzt; alle Sitzungen
dieses Zugangs fallen, Rolle und Bestand bleiben unberührt. Möglich, weil der
Datenbankschlüssel nicht am Passwort hängt. `node zugang.js eigentuemer <name>`
ist der Notausgang, wenn sich kein Eigentümer mehr anmelden kann.
**`AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD` werden nicht gelesen**; stehen
sie noch in der `.env`, meldet der Start sie als entfernbar.

**`zugang.js` hat vier schreibende Befehle** — `passwort`, `entfernen`,
`eigentuemer` und (seit 0.10.0) `zweifaktor` —, dazu das lesende `liste`. **Alle
vier stehen im Sicherheitsprotokoll**, sonst hätte ausgerechnet der Weg, den man
hinterher nachlesen möchte, als einziger keine Spur. *Zugriff auf den Wirt ist
die Berechtigung* — dieselbe Linie wie beim Schlüsselwechsel.

**Beim Entfernen eines Zugangs gehen seine Sitzungen, offenen Links, Favoriten,
persönlichen Einstellungen und sein zweiter Faktor mit weg** — sie sagen
niemandem etwas, sobald der Mensch weg ist. Der Bestand selbst bleibt: Löschen
entwertet (Abschnitt 5).

### Der Link statt des gesagten Passworts — seit 0.8.80

Ein Zugang entsteht auf zwei Wegen, und die Karte „Zugänge" bevorzugt den
zweiten: entweder legt der Admin ihn **mit erstem Passwort** an, oder er legt
ihn **ohne** an und gibt einen **Link** aus. **Ein Mechanismus, zwei Anlässe** —
Einladung und Rücksetzung.

| | |
|---|---|
| Was im Link steht | 32 Zufallsbytes, hexadezimal |
| Was gespeichert wird | **nur der SHA-256 davon**, ohne Salz |
| Haltbarkeit | **sieben Tage** — und **ab dem ersten Öffnen fünfzehn Minuten** (seit 0.9.0) |
| Gültigkeit | **genau einmal** |
| Beim Einlösen | alle Sitzungen dieses Zugangs fallen, **und alle übrigen offenen Links** |
| Beim Sperren und Entfernen | die offenen Links fallen mit |
| Wo der Schlüssel steht | im **Fragment** der Adresse (`#/einladung/…`) — es geht nie an den Server |
| Spur danach | die Zeile bleibt mit `benutzt_am` stehen, geräumt dreißig Tage nach Ablauf |
| Bei zweitem Faktor | der Link **meldet nicht an**; nach dem Passwort wird der Code verlangt (seit 0.10.0) |

**Die zweite Frist ist keine Verschärfung des Ablaufs, sondern eine andere
Frage.** Die sieben Tage sind die Frist fürs **Lesen der Mail**: solange niemand
geöffnet hat, ist nichts geschehen. Ab dem ersten Öffnen ist erwiesen, dass der
Link angekommen ist — und dann hat er in einem fremden Postfach nichts mehr
verloren. *Sie schützt nicht gegen den, der das Postfach mitliest — der klickt
zuerst; sie macht seinen Zugriff **sichtbar**, weil der echte Empfänger vor
einem toten Link steht.* **Vorschaudienste lösen sie nicht aus:** der Schlüssel
steht im Fragment, sie holen nur die Seite. **Innerhalb** der Frist darf
beliebig oft geöffnet werden — nur der erste Aufruf schreibt herunter, und
`beginneTokenFrist` schreibt ausschließlich herunter. *Der Preis, ehrlich
benannt: hinterher ist nicht mehr zu sehen, **ob** ein Link schon geöffnet
wurde.*

**Die Absage vor der Anmeldung ist EINE**, für abgelaufen, schon benutzt,
erfunden und „Zugang gesperrt": *„Dieser Link gilt nicht mehr. Bitte beim Admin
einen neuen anfordern."* **Das Heilmittel ist in jedem dieser Fälle dasselbe.**
Was das kostet, gehört dazu: wer sich vertippt hat, unterscheidet das nicht von
„abgelaufen".

**Weitergegeben wird der Link auf zwei Wegen, und sie ersetzen einander nicht.**
Ist ein Mailzugang eingetragen, geht er **zusätzlich** per Mail hinaus; sonst
kopiert der Admin ihn. **In beiden Fällen steht er im Verwaltungsbereich zum
Kopieren**, und bei einem Fehlschlag steht der Grund daneben. Damit ist er ein
**Passwortersatz auf Zeit** und steht nach der Weitergabe in einem fremden
Verlauf — *und das sagt die Oberfläche an der Stelle, an der er kopiert wird.*

**Ein Zugang ohne Passwort trägt den leeren Hash** — dieselbe Sperre wie beim
Grabstein, ohne eine einzige neue Klemme. `ZUSTAENDE` bleibt bei drei; „noch
kein Passwort" wird aus `password_hash = ''` abgeleitet und **nicht** aus
`last_login IS NULL` (das beantwortet „hat sich noch nie angemeldet").

### „Meine Sitzungen" — seit 0.8.80

Jeder sieht beim eigenen Zugang, wo er überall angemeldet ist: angemeldet am,
zuletzt gesehen, welche davon die eigene ist. **Ein Admin sieht keine fremden** —
für den Ernstfall gibt es das Sperren, und das löscht die Sitzungen bereits mit.
**Die Karte kennt kein Gerät und sagt das offen:** die Anlage speichert **weder
IP-Adresse noch Browserkopf**. Was sie trägt, ist die **Zahl** und **ein Knopf**
(„alle anderen beenden"). **Adressiert wird eine Sitzung über eine Kennung, die
gerechnet und nirgends gespeichert wird** — der volle SHA-256 ihres Tokens; der
Token selbst ist Primärschlüssel **und** Geheimnis und darf in keiner Adresse
stehen.

### Die Selbstanmeldung — seit 0.9.1

Wer einen Zugang haben will, kann von selbst danach fragen. **Der Admin schaltet
frei, immer** — es gibt keine Betriebsart, in der der geklickte Link allein
hereinlässt. **Der Schalter `registrierung` steht ab Werk auf aus**, und ist er
aus, legt nur der Admin an; es fehlt nichts.

**Fünf Schritte:** Anfrage mit Wunschname und Adresse (kein Passwort) →
**Bestätigungsmail** mit einem Link **ohne Passwortkraft** → erst die
**bestätigte** Anfrage erscheint beim Admin, in der Karte „Anfragen" →
Freischalten (Zugang mit der Rolle `user`, samt Einladungslink) oder Ablehnen →
Passwort setzen über den Tokenweg aus 0.8.80, **unverändert**.

**Der Bestätigungslink hat keine Passwortkraft, und das ist baulich wahr:** die
Route setzt einen Zeitpunkt in einer Zeile, mehr nicht — sie legt keinen Zugang
an, setzt kein Passwort und schickt keinen Sitzungscookie; geprüft am Zustand
danach, nicht an der Antwort. Der Schlüssel geht denselben Weg wie ein Token: 32
Zufallsbytes, gespeichert nur der SHA-256, im **Fragment** (`#/bestaetigung/…`).

**Die Tabelle heißt `anfragen`** — `id`, `hash`, `username`, `email`,
`bestaetigt_am`, `created_at`. `hash` ist hier **nicht** Primärschlüssel, anders
als bei `tokens`: die Adminrouten sprechen eine Zeile über eine **Nummer** an,
und ein Geheimnis hat in keinem Pfad etwas verloren. **Kein Fremdschlüssel** —
eine Anfrage ist noch kein Zugang; `bestaetigt_am IS NULL` heißt „noch nicht
bestätigt", ein zweites Zustandsfeld wäre eine zweite Wahrheit daneben.

**Drei Schranken gegen den Missbrauch, und sie sind nicht dasselbe:**

* **Die immer gleiche Antwort.** Unbekannter Name, bekannter Name, bekannte
  Adresse, Deckel erreicht, Schalter aus — gleicher Statuscode, gleicher Rumpf
  **Byte für Byte**. **Sie ist die schwerste der drei**, weil sie auch dann
  halten muss, wenn die Wege verschieden lang sind: eine Anfrage, die eine Mail
  verschickt, dauert Sekunden; eine still verworfene Millisekunden. **Deshalb
  wartet die Antwort nicht auf den Versand** — Zeile schreiben, antworten, dann
  verschicken. Der Prüfstand **misst** das an einem Empfänger, der den Versand
  zwanzig Sekunden festhält.
* **Der Deckel.** Zwanzig offene Anfragen, **bestätigte und unbestätigte
  zusammen** — sonst füllte ein Angreifer die Tabelle mit Unbestätigten, ohne je
  eine Mail zu lesen. Die einundzwanzigste wird still verworfen. **Dazu je
  Adresse höchstens eine offene Anfrage**, sonst wäre das Formular ein Weg,
  einer fremden Adresse beliebig viele Bestätigungsmails zu schicken. *Der
  Preis: geht die eine Mail verloren, wartet der Anfragende bis zum Verfall.*
* **Die Anmeldebremse**, an beiden Routen, ohne Namenshälfte. **Der Wunschname
  geht ausdrücklich nicht in die Bremse:** er ist geraten, und ein Zähler darauf
  wäre ein Werkzeug, einen erwünschten Namen auszusperren.

**Unbestätigte Anfragen verfallen nach 24 Stunden** — deutlich kürzer als die
sieben Tage des Einladungslinks, denn hier ist noch nichts geprüft. **Nur die
unbestätigten:** eine bestätigte wartet auf den Admin, so lange es dauert.
Geräumt wird an **drei** Stellen — beim Start, beim Öffnen der Karte und **vor
der Deckelprüfung**; die dritte ist keine Hauswirtschaft: sonst blockierten
zwanzig längst verfallene Zeilen die Selbstanmeldung noch einen weiteren Tag.

**Aus einer Anfrage wird nie etwas anderes als ein Zugang mit der Rolle
`user`** — baulich wahr statt durchgesetzt: die Route ruft `legeZugangAn` mit
fest verdrahtetem `'user'` und liest an **keiner** Stelle eine Rolle aus der
Anfrage. **Freischalten darf jeder Admin**, ohne zweite Bestätigung — es
entsteht ein neuer Zugang und nimmt niemandem etwas.

**Name und Adresse sind der einzige Freitext von außen, der überhaupt
gespeichert wird.** Sie gehen durch dieselben Prüfungen wie an einem echten
Zugang (`pruefeName`, `mail.istAdresse`) und tragen zusätzlich eine
Längengrenze — 64 Zeichen für den Namen, 254 für die Adresse. *Das ist keine
zweite Wahrheit über Benutzernamen: ein Admin legt weiter an, was er will;
begrenzt wird die **Eingabe von außen**.*

**Der Schalter braucht ZWEI Voraussetzungen:** eine durchgekommene **Testmail**
*und* gesetzte **`OEFFENTLICHE_ADRESSE`**. Die Testmail allein belegt es nicht —
sie enthält **keinen Link** und geht auch ohne die öffentliche Adresse durch
(Stolperstein 149). **Ausschalten geht immer**, und geht der Versand später
kaputt, **bleibt der Schalter an** und die Karte sagt es rot.


### Der zweite Faktor — seit 0.10.0, freiwillig, je Zugang

Wer will, sichert seinen Zugang zusätzlich mit einem Code aus einer App auf
seinem Telefon. Der Code entsteht dort **ohne Netz**, aus einem Geheimnis und
der Uhr. **Ab Werk ist er aus, und ohne ihn läuft die Anlage vollständig** —
dieselbe Linie wie beim Mailversand und bei der Selbstanmeldung. **Die Anlage
verschickt dafür nichts**: kein Code per Mail, kein Code per SMS.

| | |
|---|---|
| Verfahren | **HMAC-SHA1**, RFC 6238 |
| Länge | **sechs** Ziffern |
| Schritt | **dreißig** Sekunden |
| Geheimnis | **20 Zufallsbytes**, als 32 Zeichen Base32 (RFC 4648, ohne Füllzeichen) |
| Fenster | **±1**, also je dreißig Sekunden Drift |
| Wiederverwendung | **ein Code gilt genau einmal** — der Zeitschritt muss echt größer sein als der zuletzt verbrauchte |
| Wo das Geheimnis liegt | Tabelle `zweifaktor`, **im Klartext** |
| Wiederherstellungscodes | **acht**, je zehn Zeichen, **SHA-256 ohne Salz**, jeder **genau einmal** |

**Einschalten geht in zwei Schritten, und der zweite ist der Beleg.**
`POST /api/zweifaktor/start` erzeugt das Geheimnis und gibt es **einmal**
heraus; `bestaetigt_am` bleibt dabei leer. Erst ein gültiger Code aus der App
schaltet wirklich ein — so ist belegt, dass die App dasselbe rechnet. *Solange
nicht bestätigt ist, verlangt die Anmeldung nichts:* sonst sperrte ein
abgebrochenes Einschalten den Zugang aus. **Der bestätigende Code zählt als
verbraucht.**

**Die Anmeldung wird zweistufig, ohne einen zweiten Zustand zu erzeugen.**
Zwischen den Schritten liegt ein **Ausweis im Arbeitsspeicher**, nach dem Muster
der Freigabe aus 0.8.90 — gebunden an die **Benutzernummer** (sie kommt nie aus
dem Rumpf), **120 Sekunden**, **genau einmal**. **Es entsteht keine halbe
Sitzung**; `sessions` bleibt die eine Antwort auf „angemeldet". **Bei falschem
Code liegt der Absage ein frischer Ausweis bei** — sonst stünde ein Mensch nach
*einem* Tippfehler wieder vor dem Passwortfeld, und das trifft ausgerechnet den,
der einen zehnstelligen Wiederherstellungscode vom Zettel abschreibt. *Was den
Versuch begrenzt, ist die Bremse und nicht die Frist.*

**Die Auskunft „dieser Zugang hat einen zweiten Faktor" kommt erst nach
richtigem Passwort** — baulich wahr, die Frage steht unterhalb von
`pruefeAnmeldung`. Bei falschem Passwort ist die Antwort Byte für Byte die von
vorher.

**Der Tokenweg aus 0.8.80 und die zweite Bestätigung aus 0.8.90 fragen
ebenfalls.** Der erste, weil er sonst der Weg daran vorbei wäre — das war die
Lücke, und sie ist in derselben Runde geschlossen worden (Stolperstein 159); die
zweite, weil sie gegen die übernommene offene Sitzung verteidigt und ein zweiter
Faktor genau dort am meisten trägt.

**Die Anmeldebremse greift am zweiten Schritt, mit unangetasteten Kennwerten**,
und sie steht **ganz vorn in der Route** — nicht hinter dem Verbrauch des
Ausweises. Erstens bekommt ein gesperrter Aufrufer damit überall dieselbe 429
und nirgends stattdessen eine Auskunft über seinen Ausweis; zweitens ist die
Zusage sonst gar nicht belegbar (Stolperstein 163). **`noteSuccess` steht seit
0.10.0 hinter der Verzweigung**, sonst löschte der erste Schritt den Zähler, den
der zweite aufbaut (Stolperstein 160). **Die Absage bei falschem Code ist EINE**
und nennt nicht, ob er falsch, zu alt oder schon verbraucht war.

**Ein Fremder kommt an einen fremden zweiten Faktor nicht heran.** Die vier
Routen tragen die Art `selbstbezug`: die Benutzernummer kommt aus
`req.benutzer`, und es gibt **gar keine Adresse**, unter der ein anderer gemeint
sein könnte. **`PUT /api/users/:id` mit `passwort` tastet ihn nicht an**, und
**`setzeStatus` ebenso wenig** — nähme das Sperren ihn mit, wäre „sperren und
wieder freigeben" der Weg, an dem ein Admin einen fremden Faktor abstreift.
**`entferneZugang` nimmt ihn dagegen mit.**

**Der Notweg über den Wirt — und er schaltet nur AUS:**

```bash
docker compose exec kriterion node zugang.js zweifaktor <benutzername>
```

Er fragt vorher nach, nennt den Stand samt Zahl der übrigen
Wiederherstellungscodes und lässt Passwort, Rolle und Bestand unangetastet.
**Einschalten geht von dort ausdrücklich nicht:** dazu müsste das Geheimnis auf
das Telefon des Betroffenen, und wer es für ihn erzeugte, sperrte ihn aus.
`node zugang.js liste` hat dafür eine Spalte **2FA**, die „an" oder „aus" sagt
und nie mehr.

**Zwei Tabellen, kein Migrationsblock.** `zweifaktor` trägt `user_id` als
Primärschlüssel — ein Zugang hat einen zweiten Faktor oder keinen.
`zweifaktor_codes` ist die zweite, weil „jeder genau einmal" eine Eigenschaft
der **Zeile** ist; die verbrauchte Zeile **bleibt stehen**, sonst könnte die
Karte nicht „noch 6 von 8" sagen. **Geräumt wird nicht nach einer Frist**,
anders als bei Token und Anfragen: ein Wiederherstellungscode liegt auf einem
Zettel und soll genau dann tragen, wenn das Telefon seit Monaten weg ist.

**Der QR-Code ist ausdrücklich nicht Teil von 0.10.0** und bekommt eine eigene
Runde (Abschnitt 10). Statt seiner steht der Base32-Schlüssel in
**Vierergruppen** auf dem Bildschirm, daneben die `otpauth://`-Zeile als
anklickbarer Verweis — auf einem Telefon öffnet der die App unmittelbar.

### Die zweite Bestätigung — seit 0.8.90

**Was die Anlage als Ganzes trifft, wird ein zweites Mal bestätigt.** Sieben
Wege über sechs Routen verlangen das Passwort des Angemeldeten noch einmal:

| Weg | Route |
|---|---|
| Export | `GET /api/export` |
| Import | `POST /api/import` |
| Rolle vergeben | `PUT /api/users/:id` (nur mit `rolle` im Rumpf) |
| Fremdes Passwort setzen | `PUT /api/users/:id` (nur mit `passwort` im Rumpf) |
| Link erzeugen | `POST /api/users/:id/token` |
| Zugang entfernen | `DELETE /api/users/:id` |
| Mailzugang setzen | `PUT /api/mail` *(seit 0.9.0)* |

*`BESTAETIGUNG_ZWECKE` hat damit **sieben** Einträge.* **Der Schlüsselwechsel
kommt ausdrücklich nicht dazu** — er läuft seit 0.8.91 auf dem Wirt und kennt
die zweite Bestätigung nicht; *Zugriff auf den Wirt ist die Berechtigung.* **Und
die Testmail ebenso wenig:** sie verschickt an die **eigene** Adresse und
übergibt nichts. *Die Zahl stand in Revision 19 und im Änderungsprotokoll 0.8.90
falsch bei „sieben über sechs" und wurde mit 0.8.91 auf sechs über fünf
berichtigt; mit `PUT /api/mail` aus 0.9.0 sind es wieder sieben über sechs —
diesmal nachgezählt (Stolperstein 137).*

| | |
|---|---|
| Woher | `POST /api/bestaetigung` mit `{ passwort, zweck, ziel }` |
| Wo sie liegt | im Arbeitsspeicher, neben `attempts` der Anmeldebremse |
| Gebunden an | **Sitzungstoken + Zweck + Ziel** |
| Haltbarkeit | **120 Sekunden** |
| Gültigkeit | **genau einmal** |
| Beim Abmelden | fällt sie mit |
| Absage | *„Das Passwort stimmt nicht."* — **403**, nie 401 |
| Bei zweitem Faktor | zusätzlich der Code (seit 0.10.0) |

**Was ausdrücklich NICHT dahinter liegt, und es ist entschieden, nicht
vergessen:** Sperren und Freigeben (umkehrbar, und ein gesperrter Zugang ist
nicht die Anlage), einen Zugang **anlegen** (er ist neu und nimmt niemandem
etwas — auch mit Einladungslink), Anfragen freischalten und ablehnen, der eigene
Zugang (dort ist das bisherige Passwort seit 0.5.0 ohnehin Pflicht) und alles am
Eintrag. **`POST /api/setup` erst recht** — dort gibt es kein bisheriges
Passwort.

**Die Rechtefrage steht VOR der Bestätigungsfrage.** Wer ohnehin nicht darf,
erfährt das — und wird nicht erst nach seinem Passwort gefragt. **Die Absage ist
hier klar und deutlich, anders als beim Token:** dort wusste der Server nicht,
wer fragt; hier ist der Fragende angemeldet und namentlich bekannt.

### Das Sicherheitsprotokoll — seit 0.8.90

Es hält fest, **wer Zugang hatte und wer die Anlage als Ganzes angefasst hat**.
Es ist **kein Änderungsverlauf**: kein Eintragstitel, kein Kommentartext, keine
Bewertung, keine Note.

| | |
|---|---|
| Was in einer Zeile steht | Zeitpunkt, was, wer, an wem, ein kurzes Merkmal |
| Was **nicht** darin steht | Namen, Freitext, IP-Adresse, Browserkopf, Schlüssel, Suchbegriffe |
| Wer es sieht | **der Eigentümer allein** |
| Wie lange | **180 Tage**, geräumt beim Start und beim Öffnen der Karte |
| Weg hinaus | **nur die Frist** — es gibt keine Löschroute |

**Zwanzig Vorgänge** (`VORGAENGE`): Anmeldung gelungen/gescheitert, Bestätigung
gescheitert, Zugang angelegt, Rolle vergeben, Zugang gesperrt/freigegeben,
fremdes Passwort gesetzt, Zugang entfernt, eigener Zugang geändert, Link
erzeugt, Link eingelöst, Anfrage freigeschaltet, Anfrage abgelehnt, zweiter
Faktor an/aus/wieder, Export, Import, Sicherung, Schlüssel gewechselt.
**Dreizehn Merkmale** (`MERKMALE`), alle aus einer geschlossenen Liste im
Quelltext.

**`zweifaktor.wieder` ist der, auf den es ankommt** — er sagt, dass ein
**Wiederherstellungscode verbraucht** wurde, und ist damit die einzige Zeile im
ganzen Protokoll, die auf ein verlorenes Telefon zeigt. **Einen Vorgang für den
falschen Code gibt es nicht:** eine gescheiterte zweite Stufe *ist* eine
gescheiterte Anmeldung und schreibt `anmeldung.fehl`.

**Keine Namensspalte, obwohl sie verlockt:** `entferneZugang()` überschreibt
`username`, und eine hier aufbewahrte Kopie wäre die eine Stelle im Projekt, die
den Grabstein rückgängig macht. Gespeichert werden Nummern; ein entfernter
Zugang erscheint wie überall als „Gelöschter Benutzer 7".
**Ein leeres `wer` heißt „über den Wirt"** — mit genau einer Ausnahme, und die
ist am Vorgang zu erkennen: bei einer gescheiterten Anmeldung war niemand
angemeldet.
**Die gescheiterte Anmeldung ist die einzige Zeile, die ein Fremder auslösen
kann.** Ihr Deckel ist die Bremse, die es schon gibt: geschrieben wird nur, wenn
die Anfrage die Passwortprüfung wirklich erreicht hat. Damit sind es höchstens
**zehn Zeilen je Adresse und Sperrzeit** — eine Eigenschaft der Anlage statt
einer Regel, die jemand durchsetzen müsste. *Der Preis: verteiltes Raten aus
vielen Adressen schreibt weiterhin viele Zeilen.* **Der getippte Name wird nie
gespeichert**; `ziel` trägt eine Nummer nur, wenn der Name einen vorhandenen
Zugang traf.

### Der Mailversand — seit 0.9.0, und er gehört dem Eigentümer

Der Zugang (Anbieter, Server, Port, Verschlüsselung, Benutzer, Passwort,
Absender) liegt als **ein** Schlüssel `mailzugang` in `settings` — ein Objekt,
keine sechs Zeilen: sechs wären sechs Stellen, an denen ein halb geschriebener
Zugang entstehen kann. **Eintragen, einsehen und die Testmail auslösen liegen
beim Eigentümer; ein Admin kommt an keines davon.** Das Setzen liegt hinter der
zweiten Bestätigung.

**Warum nicht in der `.env`, wie es der Auftrag vorsah:** die Begründung trägt
weiter, sie trifft nur den **Admin** — der SMTP-Server sieht jede Mail, und jede
trägt einen Link, der ein Passwort setzt. Über dem Eigentümer steht niemand.
**Zwei Dinge sprechen sogar dafür, beide nachgesehen:** das Mailpasswort liegt in
der **verschlüsselten Datenbank** statt unverschlüsselt auf dem Wirt, und die
**Exportdatei trägt es nicht**. *Damit wird die Ausnahme von der `.env`-Regel
aus Abschnitt 11 nicht gebraucht.*

**Das Passwort kommt aus keiner Antwort heraus** — die Karte sagt „gesetzt" oder
„nicht gesetzt", nie die Länge, nie der Anfang, nie Sternchen mit der richtigen
Zahl; ein leeres Feld beim Speichern heißt „unverändert lassen". Es steht in
**keiner** Protokollzeile und in **keiner** Kontrollausgabe.
**Die Vorlage gewinnt:** wer GMX gewählt hat, bekommt GMX, auch wenn ein anderer
Server mitgeschickt wird — wechselt ein Anbieter morgen den Port, kommt der neue
aus dem Quelltext, eine Kopie in der Datenbank wäre eingefroren.
**Die Testmail geht an die eigene Adresse des Anfordernden und nirgendwo
sonst** — es gibt **kein** Adressfeld, weder im Rumpf noch in der Abfrage noch
als Kopf. *Ein Knopf mit freiem Adressfeld wäre ein offener Mailverteiler hinter
einer Anmeldung.*
**Die Frist des Versands ist zwanzig Sekunden**, hergeleitet und gemessen: ein
SMTP-Gespräch über TLS sind rund acht Umläufe, bei schlechten 300 ms unter drei
Sekunden. **Nodemailers eigene Fristen tragen das nicht** — `socketTimeout`
läuft nur bei Untätigkeit ab, und **jedes zugestellte Byte setzt es zurück**;
ein Empfänger, der alle drei Sekunden ein Byte schickt, hält es ewig am Leben
(nachgestellt: nach 45 Sekunden hängt der Versand immer noch). Nur ein Wettlauf
über dem **ganzen** Versand ist eine Frist auf die Gesamtdauer. *Die drei
darunter bleiben stehen — sie sind der schnellere Weg: ein toter Rechner
scheitert nach sieben Sekunden statt nach zwanzig.*

**Es gibt genau drei Anlässe für eine Mail** — den Tokenlink, die Testmail und
(seit 0.9.1) die Bestätigungsmail. **Keine Benachrichtigungen**, und
ausdrücklich auch keine Absagemail an einen abgelehnten Anfragenden. Reiner
Text, kein HTML, keine Zählpixel, keine Anhänge. **Kein Eintrag im
Sicherheitsprotokoll für den Versand:** eine Zeile „Mail an X verschickt" wäre
ein Zustellprotokoll, und die Adresse wäre Freitext von außen. Der Anlass steht
schon drin (`link.neu`).

**Die Bestätigungsmail ist der einzige Text der Anlage, der an jemanden gehen
kann, der nichts angefordert hat**, und danach ist sie gebaut: der Satz *„warst
du das nicht, ist nichts zu tun"* steht weit oben und nicht am Ende, und der
Text sagt ausdrücklich, dass der Link **keinen Zugang öffnet und kein Passwort
setzt**.

**Die Stolpersteine beim Anbieter stehen in der README** (Gmail: Zwei-Faktor und
App-Passwort; GMX und Web.de: Versand über fremde Programme freischalten; die
Absenderadresse muss zum Konto gehören). Sie kommen vom **Server**, nicht aus
einer zweiten Liste in der Oberfläche.

### Die öffentliche Adresse — `OEFFENTLICHE_ADRESSE`

**Pflicht für den VERSAND, nicht für den Start.** Ohne sie wird nicht
verschickt: der Server wüsste nicht, worauf der Link zeigen soll, und aus dem
`Host`-Kopf darf er es nicht ableiten — eine verschickte Mail wäre genau die
Stelle, an der ein gefälschter Kopf am meisten wert wäre. **Der Start bricht
deswegen nicht ab**, und die Anlage bleibt vollständig; die Karte „Mailversand"
markiert den fehlenden Wert rot. *Das ist eine engere Auslegung als der Wortlaut
des Konzeptpapiers („ab Stufe I ist sie Pflicht") — wörtlich gelesen bräche der
Start jede vorhandene Installation beim Einspielen.*

Ist der Wert leer, baut **der Browser des Admins** den Link aus `location` —
das ist die Vorgabe und die Lage aus Stufe H. Ist er gesetzt, gibt der Server
den fertigen Link heraus (`link` und `linkQuelle`), und der Linkkasten sagt in
einer Zeile darunter, **woher** die Adresse kam.
Geprüft wird über `new URL`: Schema (nur `http`/`https`) und Rechnername sind
Pflicht, ein Pfad ist erlaubt, ein abschließender Schrägstrich fällt, und
Zugangsdaten, `?` und `#` werden abgewiesen. **Ein unbrauchbarer Wert bricht den
Start nicht ab**, sondern meldet sich laut und fällt auf den Browserweg zurück.
`http://` bei gesetztem `HINTER_PROXY` bekommt eine **Warnung, keine Absage**.
**In `GET /api/config` steht sie nicht** — der Endpunkt liegt vor der Anmeldung.
**Sie gehört in die `.env` und nicht in `settings`**, dieselbe Linie wie
`HINTER_PROXY`: sie entscheidet über Netzwerkvertrauen, nicht über eine
Vorliebe. Der Systembereich **zeigt** sie, er setzt sie nicht.

### Die Adresse am Zugang — `users.email`

Die Spalte stand seit 0.6.0 im Schema und wurde bis 0.9.0 von **keiner** Stelle
gefüllt. Gebaut sind **zwei** Schreibwege und ausdrücklich kein dritter:

* **beim Anlegen** (`POST /api/users`) — den Zugang gibt es in diesem Augenblick
  noch nicht, also kann ihn niemand selbst eintragen;
* **danach allein der Betroffene** (`PUT /api/account`, hinter dem bisherigen
  Passwort).

**`PUT /api/users/:id` bekommt sie NICHT**, und das ist entschieden: ein Admin,
der eine **bestehende** fremde Adresse umschreiben dürfte, böge den nächsten
Rücksetzlink des Betroffenen auf ein Postfach seiner Wahl. **`GET /api/users`
liefert sie ebenfalls nicht mit** — ein Admin braucht für seine Arbeit die
Zugänge, nicht die Postfächer. Die Adresse ist überall **freiwillig**;
`undefined` heißt „nicht angefasst", der leere String „löschen".
**Ein `UNIQUE` trägt sie nicht** — die Frage ist offen und steht in
Abschnitt 10.

### Einstellungen: global gegen persönlich

`settings` zerfällt in zwei Hälften. **Eine Einstellung ist entweder Ansicht
oder Sprache — und das entscheidet, wem sie gehört.**

| persönlich (`user_settings`, **acht** Schlüssel) | global (`settings`, Admin) |
|---|---|
| `filters` — die zuletzt benutzte Filter- und Sortierwahl | `title_public`, `title_app` |
| `ansichten` — bis zu acht **gespeicherte Ansichten** *(0.11.0)* | `vokabular` — elf Wörter |
| `zuletztGesehen` — der Bezugspunkt für „Neu seit …" *(0.8.60)* | `tagsFreiAnlegen`, `kategorienFreiAnlegen` |
| `schrift` — Schriftgröße | `suche`, `sucheEigene`, `sucheAktiv` |
| `bloecke` — Anordnung und Einklappzustand | `registrierung` *(0.9.1)* |
| `linkZeilen` — sichtbare Linkzeilen | `mailtestOk` — Marke der letzten Testmail *(0.9.0)* |
| `zeitleiste` — ein/aus | `schluesselGewechseltAm` — Marke des Wechsels *(0.8.91)* |
| `suchNamen` — Zahl der Anbieternamen | `mailzugang` *(0.9.0 — **beim Eigentümer**, nicht beim Admin)* |

**`mailzugang` ist die eine Zeile in `settings`, die NICHT dem Admin gehört** —
und die einzige Ausnahme von „global heißt Adminsache".
**`PERSOENLICHE_SCHLUESSEL` in `server.js` ist Schranke und Wahrheit zugleich:**
`PUT /api/settings` leitet daraus ab, was jeder für sich schreiben darf, und
`putSetting` weist einen persönlichen Schlüssel auf dem globalen Weg laut ab.
*Die Schranke wird erst bei einem Zugang **ohne** Adminrolle laut — der
Eigentümer kommt als Admin ohnehin durch (Stolperstein 116).*
**`OEFFENTLICHE_ADRESSE` und `HINTER_PROXY` stehen ausdrücklich nicht in dieser
Tabelle** — sie liegen in der `.env` und sind gar keine Einstellungen im Sinne
dieses Abschnitts.

### Verschlüsselung und Schlüssel

**Die gesamte Datenbankdatei ist verschlüsselt.** Ohne Schlüssel meldet selbst
ein Datenbankwerkzeug „file is not a database" — nichts ist lesbar, auch nicht
Struktur, Kategorienamen, Zeitstempel oder Bildgrößen. Innerhalb der geöffneten
Datenbank steht alles im Klartext; deshalb funktioniert die Suche über alle
Felder.

`ENCRYPTION_KEY` **muss** in der `.env` bleiben — er wird gebraucht, um die
Datei überhaupt zu öffnen. Fehlt er, wird beim Start einer erzeugt und **neben**
der Datenbank abgelegt; dann schützt die Verschlüsselung nicht gegen jemanden,
der das Verzeichnis kopiert. **Auf dem Betriebssystem ist der Umzug erledigt:**
der Wert steht seit dem 13. August in der `.env`, die Datei liegt nur noch als
`encryption.key.abgeloest` daneben.

> **DER WERT IST UMGEZOGEN, NICHT GEWECHSELT — und daraus folgt der eine echte
> Anlass für einen Schlüsselwechsel, den diese Anlage hat.** Jede Kopie von
> `data/`, die vor dem 13. August entstanden ist, enthält einen Schlüssel, der
> die **heutige** Datei öffnet. `encryption.key.abgeloest` zu löschen hilft nur
> gegen **künftige** Kopien; die vorhandenen bleiben lesbar. **Ein
> Schlüsselwechsel ist das einzige Mittel dagegen.**

**Wann die `.env` gelesen wird — drei verschiedene Zeitpunkte:** `docker build`
nie (sie ist per `.dockerignore` ausgeschlossen). `docker compose up -d` liest
sie beim **Erzeugen** des Containers. Ein `docker restart` oder ein Neustart des
Rechners liest sie nicht mehr. Daraus folgt: die `.env` muss dauerhaft liegen
bleiben, denn **jedes Einspielen einer neuen Version erzeugt den Container neu**.

Eine Kopie des Schlüssels gehört in den Passwortspeicher, und **`.env` und
`data/` nicht in dieselbe Sicherung** — das gilt auch für den Zielort der
Sicherung auf Knopfdruck. Ohne den Schlüssel sind die Daten endgültig verloren.
Wer auf dem Wirt `docker inspect` ausführen darf, sieht den Schlüssel — kein
neues Loch, dieselbe Person könnte auch die `.env` lesen.

**Der Schlüssel lässt sich wechseln — seit 0.8.91, auf dem Wirt:**

```bash
cd <projektverzeichnis>
./schluessel.sh zeigen       # Lage ansehen, ändert nichts
./schluessel.sh wechseln     # anhalten, sichern, wechseln, starten
```

**Es ist der einzige Vorgang im ganzen Projekt, der bei falscher Handhabung
alles verliert** — und deshalb steht er dort und nicht in der Oberfläche
(Begründung in Abschnitt 5).

| | |
|---|---|
| Woher der neue Wert kommt | `openssl rand -hex 32` auf dem Wirt, an den Wegwerf-Container über die Umgebung |
| Wohin er geschrieben wird | dorthin, **woher der alte kam** — `.env` oder `data/encryption.key` |
| Der alte Wert in der `.env` | bleibt **auskommentiert** stehen, mit Datum, Namen und dem Satz, wofür er noch gut ist |
| Was sonst in der `.env` geschieht | **nichts.** Nur die eine aktive Zeile wird ersetzt |
| Journalmodus | `WAL → DELETE → wechseln → WAL`; `PRAGMA rekey` läuft im WAL-Modus nicht (Stolperstein 128), die Rückschaltung steht im `finally` |
| Dauer | rund **20 ms je MB** — dieselbe Zahl wie `SICHERUNG_MS_JE_MB` |
| Platzbedarf | **die Größe der Datenbank**: das Rollback-Journal wächst auf sie. Reicht der Platz nicht, kommt die Absage **vorher** |
| Abbruch mittendrin | **folgenlos**: das Rollback-Journal stellt den alten Stand her, der **alte** Schlüssel öffnet. **Kein halber Zustand** |
| Journal verloren | **alles verloren** — *das* ist der Grund für die Sicherung davor |
| Die Spur | `schluessel` im Sicherheitsprotokoll, **ohne** Handelnden, Ziel und Merkmal, und die Marke `schluesselGewechseltAm` in `settings` |
| Sitzungen | fallen **nicht**. Ein Schlüsselwechsel ändert am Passwort nichts |

**Eine Protokollzeile nennt, DASS gewechselt wurde, nie WOHIN.** Die eine
Stelle, an der ein Schlüssel zum Abschreiben steht, ist der **Bildschirm des
Wirts**: nach einem gelungenen Wechsel nennt das Skript den **alten** Wert — er
öffnet ab jetzt nur noch die Sicherungen von vorher, und im Dateifall steht er
sonst nirgends mehr. Den **neuen** nennt es nicht; nur wenn das Schreiben der
Ablage scheitert, steht auch er da, laut und mit der Anweisung, ihn von Hand
einzutragen.

**Zwei Schlüssel sind ab dem Wechsel im Umlauf, und das ist die unangenehmste
Falle des ganzen Projekts.** Jede Sicherung von vorher bleibt mit dem **alten**
Schlüssel verschlüsselt — sie ist nicht kaputt, sie braucht nur einen anderen
Schlüssel. Dagegen stehen drei Dinge zusammen: die **Marke** in `settings`, die
**rote Markierung jeder älteren Kopie** in der Karte „Sicherung" und der
**auskommentierte alte Wert** in der `.env`. *Der JSON-Export bleibt davon
unberührt: er braucht keinen Schlüssel und ist damit der einzige Rückweg ohne
Schlüsselverwaltung.*

**Was der Wechsel nicht anfasst:** das Verfahren (`cipher='sqlcipher'` bleibt),
die Schlüssellänge, den Dateinamen `katalog.sqlite`, das Schema, das
Austauschformat, die Passwörter und die Sitzungen.

### `HINTER_PROXY` — eine Einstellung, fünf Wirkungen

Sie steht in der `.env`, nicht in `settings`: sie entscheidet über
Netzwerkvertrauen, nicht über eine Vorliebe, und ein übernommener Admin-Zugang
könnte sie sonst selbst umlegen. Vorgabe ist **aus**; **im Betrieb steht sie auf
`1`** (Abschnitt 2).

| | fehlt (Vorgabe) | `HINTER_PROXY=1` |
|---|---|---|
| Adresse des Aufrufers | `req.socket.remoteAddress` | **letzter** Eintrag aus `X-Forwarded-For` |
| Cookiename | `kriterion_session` | `__Host-kriterion_session` |
| `Secure` am Cookie | nein | ja |
| `Strict-Transport-Security` | nein | `max-age=31536000` |
| richtig für | direkt im Heimnetz, Port 3100 | Betrieb hinter einem Proxy, HTTPS |

**Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung.**
Ohne die Einstellung wird `X-Forwarded-For` nicht einmal angesehen; mit ihr zählt
der **letzte** Eintrag der Kette und nicht der erste — ein Proxy hängt die
Gegenstelle, die er wirklich sieht, hinten an, alles davor kann der Aufrufer
selbst geschrieben haben. *Genau der erste Eintrag war es, den die Fassung vor
0.8.20 nahm; mit wechselndem Kopf griff die Bremse nie.*

**Der Cookiename steht deshalb nirgends mehr als fester String** — wer ihn
braucht, nimmt `auth.COOKIE_NAME`; ein Wächter über die ausgelieferten Dateien
hält das fest. **Das Umlegen meldet alle einmalig ab**, weil das Präfix
`__Host-` den Namen wörtlich verlangt.

**Was die Einstellung nicht ist: eine Liste, wer den Kopf setzen darf.** Sie ist
ein Ja/Nein — und die Anlage ist inzwischen aus **zwei** Netzen zugleich
erreichbar. Was daran offen ist, steht in Abschnitt 8.

### Zwei Titel

Titel 1 steht auf der Anmeldeseite und ist für jeden sichtbar, der die Adresse
aufruft — daher zurückhaltend wählen. Titel 2 erscheint erst nach der Anmeldung.
**Der Endpunkt vor der Anmeldung darf Titel 2 niemals ausliefern.**

---

## 4. Funktionsumfang

### Übersicht, Suche, Filter

Kartenraster; **Zeitleiste** der Testtage über den Karten (waagerecht die Zeit,
senkrecht die Tagesnote, folgt den Filtern, unter fünf Testtagen ausgeblendet);
Filter nach Status, Kategorie und Tags (Tagwolke eine Zeile, aufklappbar, nach
Häufigkeit sortiert, Verknüpfung Und/Oder umschaltbar); Sortierung nach
Änderung, Bewertung, Titel und drei Testkennzahlen; Vergleich mehrerer Einträge;
**„★ Favoriten"** als eigener, mit jedem Teststatus kombinierbarer Filter.
Filter- und Sortierwahl werden serverseitig gespeichert.

**Die Suche läuft seit 0.11.0 im SERVER** (`GET /api/items?q=…`) und nicht mehr
im Browser. **Sie findet dasselbe wie vorher:** dieselben **sieben Quellen**
(Titel, Beschreibung, Kategoriename, Tags am Eintrag, Tags an Testtagen,
Linkadressen, sämtliche Kommentartexte), ohne Rücksicht auf Groß- und
Kleinschreibung **bis in die Umlaute**, ab einem **einzigen** Zeichen, und `%`
und `_` sind gewöhnliche Zeichen — man kann nach ihnen suchen. `/` springt ins
Suchfeld. Gefragt wird **220 ms** nach dem letzten Anschlag; jede Anfrage trägt
eine laufende Nummer, damit sich zwei Antworten nicht überholen; während sie
unterwegs ist, bleibt die alte Liste **gedämpft stehen**, und scheitert sie,
bleibt sie stehen und die Zählzeile sagt es. **Das Leeren der Suche kostet keine
Anfrage.** *Die Übersicht ist dadurch um 73 Prozent leichter geworden; das je
Eintrag mitgeschickte Feld `searchText` gibt es nicht mehr.*

**Gespeicherte Ansichten** (seit 0.11.0): bis zu **acht** benannte
Filterstellungen je Zugang, als Knöpfe in der Filterzeile — **nicht** als eigene
Karte im Systembereich. Eine Ansicht merkt sich die ganze Stellung **samt
Suchbegriff**; ein Klick stellt beides wieder her, das Kreuz am Knopf entfernt
sie. **Persönlich**, wie die eine gemerkte Stellung daneben, die bleibt, was sie
war. *Zeigt eine Ansicht auf eine gelöschte Kategorie oder einen gelöschten Tag,
wird die Nummer beim **Anwenden** übergangen — die Ansicht zeigt dann, was sie
zeigen kann, statt leer zu bleiben.*

**Der Filter „Neu seit …"** (seit 0.8.60): derselbe Platz, dasselbe Muster wie
der Favoritenfilter — ein eigener Umschalter, mit allen übrigen Filtern
kombinierbar, **persönlich**, mit der Zahl daneben (*„Neu seit 19.08. · 7"*). Er
**filtert und sortiert nicht**. Der Bezugszeitpunkt wird beim **Verlassen** der
Übersicht gesetzt, von der Serveruhr und um eine Sekunde nachgestellt; beim
allerersten Besuch erscheint der Umschalter nicht. **Bei einem einzigen Zugang
erscheint er trotzdem** — anders als „meine / alle" ist er keine Aussage über
andere.

**Die Ansicht „Offen"** (seit 0.8.60): ein Knopf in der Kopfzeile neben dem
Zahnrad führt auf einen Bildschirm mit **allen nicht erledigten
Aufgabenkommentaren** über alle Einträge, gruppiert nach Eintrag, mit Verfasser
und Datum. Ein Klick führt in den Eintrag. **Der Erledigt-Haken lässt sich dort
setzen** — und steht nur, wo er gedrückt werden darf. Die abgehakte Zeile
**bleibt durchgestrichen stehen**, bis die Ansicht neu geladen wird. Umschalter
„meine / alle" ab zwei Zugängen, Vorgabestellung „alle". Überschrift und
Beschriftungen kommen aus dem **Vokabular**.

**Ein Hinweis auf doppelte Einträge beim Anlegen** (seit 0.11.0): wer einen
Titel tippt, sieht darunter eine Zeile *„Ähnlich: …"* mit Sprungmarken zu dem,
was schon da ist. **Sie blockiert nichts und fragt nichts nach.** Verglichen
wird über vier Zeichen, ohne Rücksicht auf Groß- und Kleinschreibung und
Sonderzeichen, gegen den **ganzen** Bestand — auch, wenn eine Suche gerade einen
Teil davon ausblendet. **Keine Route:** die Titel liegen ohnehin im Browser.

### Der Eintrag

Mehrere Fotos **und Kurzvideos** mit Vollbild, Zoom (nur am Foto) und
einstellbarem Bildausschnitt für die quadratische Vorschau, angehängte Dateien
mit Vorschau, Beschreibung, Kategorie, Tags, Bewertungskriterien, Testtage,
Links, Kommentare, zwei unabhängige Merkmale (getestet, abgelehnt), Favorit.
Beschreibung und Kommentarfelder wachsen mit dem Text. Tagwolke über drei
Zeilen, Klick vergibt und nimmt zurück. Testtage können eigene Tags tragen. Die
Blöcke lassen sich per Griff anordnen und per Klick auf die Kopfzeile
einklappen — **innerhalb ihres Bereichs**, nicht darüber hinaus.

**Wer was geschrieben hat:** Eintrag, Kommentar und Testtag nennen ihren
Verfasser mit Namen, der Eintrag dazu **wann** er angelegt wurde. Ein entfernter
Zugang erscheint als „Gelöschter Benutzer 7", eine Zeile ohne Verfasser als
„Ohne Verfasser". **Bei genau einem aktiven Zugang bleibt davon alles aus.**

**Die Bewertung sagt nur den eigenen Wert und den Schnitt** (seit 0.8.6). Wer
welchen Wert vergeben hat, sieht der **Admin in einer eigenen Ansicht**, die er
über „Wer hat bewertet" im Blockkopf aufruft; dort entfernt er auch eine fremde
Bewertung. Die Note ändert er nicht.

**Jedes Kriterium hat ein Gewicht** (seit 0.8.40), zwischen **0,2 und 2**,
eingestellt vom Admin. Der Gesamtschnitt ist der **gewichtete Mittelwert** über
die **bewerteten** Kriterien; die Werte je Kriterium bleiben ungewichtet. Weicht
ein Gewicht von 1 ab, steht `×1,5` hinter dem Kriteriennamen — im
Bewertungsblock und an der Zeilenbeschriftung im Vergleich —, und am Blockkopf
steht das Wort „gewichtet". Alles davon ist **abgeleitet**, kein Schalter.

**Kommentare:** zwei unabhängige Merkmale je Kommentar — Art (Notiz, Bericht,
Aufgabe oder erledigte Aufgabe) und Anpinnung, frei kombinierbar. Die Art ist
**ein Wert**, nicht mehrere Merkmale. Bis zu sechs Bilder je Kommentar, per Knopf
oder Strg+V. Adressen im Text sind anklickbar: nur ausdrücklich geschriebene
`http://`, `https://` und `www.`, angezeigt vollständig wie geschrieben, in
Orange und unterstrichen. Der Bearbeitenmodus zeigt weiterhin den Rohtext.

**Links und Suchzeilen:** Eintragen darf **jeder**, löschen der Eintrager oder
der Admin; das ✕ steht nur dort, wo es auch gedrückt werden darf. Ab zwei
Zugängen trägt eine **fremde** Zeile den Namen ihres Eintragers **in Klammern**
direkt hinter Pfad bzw. Anbieternamen: `(chefin)`; der Überfahrtext nennt ihn
samt Datum. Was wie eine Adresse aussieht, wird eine — mit `https://` davor,
wenn keins dasteht. Alles andere bleibt Rohtext und führt beim Klick zum
Startanbieter, erkennbar an der Lupe rechts statt des Pfeils. Sechs eingebaute
und bis zu drei eigene Anbieter; der Admin nimmt sie per Häkchen in die Auswahl
und bestimmt mit „Start" das Ziel des Zeilenklicks. Unter der Zeile stehen ein
bis vier Namen, der Startanbieter zuerst; jeder Name ist ein eigenes Klickziel.

**Dateien am Eintrag:** Hochladen darf **jeder** (seit 0.8.31), löschen der
Hochladende oder der Admin; ab zwei Zugängen trägt eine **fremde** Datei den
Namen ihres Hochladenden in Klammern **hinter der Größe**. Bis 50 MB je Stück,
höchstens 20 je Eintrag, in der verschlüsselten Datenbank. Vorschau für Bilder,
PDF, Text/Markdown/CSV/Log und `.docx`; alles andere wird heruntergeladen. Die
Absicherung steht in Abschnitt 5a.

**Löschdialoge nennen Zahlen.** Am Zugang wie am Eintrag, getrennt nach eigen
und fremd; „fremd" meint dabei, was dem **Löschenden** fremd ist. **Seit 0.8.70
sagt der Dialog am Eintrag nicht mehr „unwiderruflich"** — die Zahlen bleiben
wortgleich, der Schlusssatz nennt stattdessen den Papierkorb, die dreißig Tage
und **wer zurückholen darf**: nicht der, der hier klickt.

### Bilder und Videos

**Bilder:** Originale bleiben unverändert — was hereinkommt, muss aber seit
0.8.20 ein Rasterbild **sein**, nicht bloß so heißen (Abschnitt 5a). Zusätzlich
Kachel (400 px, ~17 KB) und mittlere Variante (1600 px, ~140 KB). Übersicht
nutzt die Kachel, Detail und Vollbild die mittlere, erst der Zoom lädt das
Original. Aufschlag rund 7 %, Ersparnis beim Blättern etwa Faktor 100. Fotos
ohne Varianten werden nach dem Start im Hintergrund nachgerüstet —
**Videozeilen ausdrücklich nicht** (Stolperstein 109).

**Kurzvideos stehen in derselben Reihe wie die Fotos** (seit 0.8.50), bis
**20 MB**, als MP4, WebM oder MOV. **Erkannt wird nach dem Inhalt, nicht nach
der Endung.** In der Vorschauleiste trägt ein Video ein ▶ und, wenn die Dauer
bekannt ist, seine Länge als `0:42`; auf der Karte steht sein Standbild wie ein
Foto, mit einem Abspielzeichen darauf. Im Eintrag und im Vollbild wird mit der
Steuerung des Browsers abgespielt, und darin lässt sich springen — die
Auslieferung beantwortet **Ranges**. **Nichts spielt von selbst los**, und beim
Blättern wie beim Verlassen wird angehalten. **Kein Zoom am Video:** der zweite
Klick gehört der Abspielsteuerung. Der Ausschnittmodus bleibt bedienbar und
zeigt dort das Standbild. Alles davon ist **abgeleitet** aus `art` und `dauer`
der Antwort, kein Schalter. **Umkodiert wird nichts**, weder beim Hochladen noch
beim Ausliefern.

**Fotos und Videos stehen in EINER Tabelle** — `photos`, mit einer Spalte `art`.
Was die vorhandenen Spalten dabei bedeuten:

| Spalte | bei `art = 'bild'` | bei `art = 'video'` |
|---|---|---|
| `data` | das Originalbild | die **Videodatei** |
| `thumb` | Kachel 400 px | **Standbild** 400 px |
| `medium` | 1600 px | **Standbild** 1600 px |
| `focus_x`/`focus_y` | Ausschnitt der Kachel | dasselbe, am Standbild |
| `dauer` | `NULL` | Sekunden |

**Damit greift jede vorhandene Regel von selbst** — Rechte, Kaskade,
Reihenfolge, Fokuspunkt, Verschlüsselung, Sicherung. **Was NICHT von selbst
greift, ist genau dreierlei und ist gebaut:** Löschdialog, Kennzahlen und die
Auslieferung. *Beim Bauen einzeln durchgegangen: fünf der acht Zeilen gelten
wirklich von selbst, drei mussten gebaut werden — und an der neuen Route
`POST /api/items/:id/videos` ist ohnehin nichts automatisch,
`nurEintragVerfasser` steht dort ausdrücklich.*

**Was nicht an den Fotoplatz gehört:** `.avi`, `.mkv`, `.wmv`, `.flv` und alles
andere, was der Browser nicht abspielt. **Die ehrliche Antwort darauf ist der
Anhang, nicht ein Umkodierer** — `ffmpeg` kommt nicht ins Image (Abschnitt 5).

### Systembereich — neunzehn Karten, und sie hängen an der Rolle

**Dem Admin:** beide Titel, Kennzahlen, Kategorien und Tags umbenennen und
löschen, Bewertungskriterien umbenennen, löschen, per Ziehen sortieren und
**gewichten**, Karte **„Zugänge"** (anlegen mit Passwort oder mit Link, sperren,
Passwort zurücksetzen direkt oder über einen Link, Rolle wechseln, entfernen),
Karte **„Anfragen"** (der Schalter der Selbstanmeldung, die Liste der
bestätigten Anfragen, je Zeile Freischalten und Ablehnen), Karte
**„Suchanbieter"** (Vorrat, Startanbieter, drei eigene), **Vokabular** aus elf
Wörtern und die Karte **„Papierkorb"** — Letztere als Liste, an der nur der
Eigentümer die beiden Knöpfe sieht.

> **Die Karte „Anfragen" steht dem Admin IMMER**, auch wenn die Selbstanmeldung
> aus ist — eine Berichtigung aus dem Betrieb (Stolperstein 155). Zuerst war sie
> an „der Schalter ist an oder es liegen Anfragen" geknüpft; **der Schalter
> steht aber in dieser Karte**, und solange sie fehlt, gibt es keinen Weg, ihn je
> einzuschalten. In dieser Lage bleibt sie **kurz** — Überschrift, ein Satz, der
> Zustand und der Schalter. **Sie steht beim Admin, nicht beim Eigentümer:** aus
> einer Anfrage wird nie etwas anderes als ein Zugang mit der Rolle `user`.

**Dem Eigentümer zusätzlich:** Export mit/ohne Fotos, mit eigenem Häkchen für
Dateien und eines für **Videos**, Import (ersetzen oder zusammenführen), die
Karte **„Sicherung"**, das **„Sicherheitsprotokoll"** und die Karte
**„Mailversand"**. **Letztere steht ausdrücklich NICHT beim Admin**, obwohl der
die Einladungen verschickt — was er bekommt, ist die Auskunft an der Stelle, an
der sie ihn angeht: neben dem Link steht, ob etwas hinausging und warum nicht.

**Jedem, auch ohne Rolle:** „Zugang" (eigener Name, Passwort, Adresse und
**der zweite Faktor**), **„Meine Sitzungen"**, „Darstellung" (Schriftgröße in
fünf Stufen, Zeitleiste, Blockanordnung) und „Links" (sichtbare Zeilen, Zahl der
angezeigten Anbieternamen). Die Karten „Kategorien", „Tags" und
„Bewertungskriterien" stehen ebenfalls für jeden — aber als **Liste ohne
Bedienzeichen**: *wer nicht verwalten darf, darf trotzdem nachsehen.* Das
Gewicht steht dort als Text statt als Eingabefeld.

> **Der zweite Faktor bekommt ausdrücklich KEINE eigene Karte** — es bleibt bei
> neunzehn. Er steht in „Zugang", wo Name, Passwort und Adresse stehen: wer
> seinen Zugang sichern will, sucht ihn da, wo sein Zugang steht. Der Zustand
> steht **ohne Klick** da — „an seit …" oder „aus", dazu „noch 6 von 8", und ab
> zwei übrigen sagt die Karte deutlich, dass es knapp wird. Gefärbt wird **grün
> für an und grau für aus**; **kein Rot** — ein ausgeschalteter zweiter Faktor
> ist kein Fehler, sondern die Vorgabe, und eine Warnung, die immer dasteht,
> liest niemand mehr.

**Drei breite Kacheln** brauchen die Breite: „Zugänge", „Sicherheitsprotokoll"
und „Anfragen". Sie stehen über `grid-auto-flow: dense` im Raster, ohne feste
Position.

**Der Papierkorb** (seit 0.8.70): beim Löschen eines Eintrags wird er im
vorhandenen Austauschformat serialisiert und **in derselben Transaktion** als
eine Zeile abgelegt; danach läuft die Kaskade wie bisher. Die Karte nennt Titel,
Datum, Löschenden, die verbleibenden Tage und die Größe. **Wiederherstellen legt
einen NEUEN Eintrag an** — die alte Nummer ist weg —, ordnet die Verfasser über
ihre **Namen** wieder zu (ein Grabstein wird gefunden) und nennt, was dabei an
den Wiederherstellenden gefallen ist. Nach dreißig Tagen fällt eine Zeile
heraus; aufgeräumt wird beim **Start** und beim **Öffnen der Karte**. **Zwei
Löschwege füllen ihn ausdrücklich nicht:** „Zugang entfernen" mit dem Häkchen
*Einträge mitnehmen* und der ersetzende Import. **Zwei Kleinigkeiten kommen
beim Zurückholen nicht mit:** Favoritensterne **anderer** Benutzer und der
Vermerk über entfernte Kommentarbilder.

**Die Sicherung auf Knopfdruck** (seit 0.8.70): `VACUUM INTO` erzeugt eine
**vollständige, verschlüsselte** Kopie der Datenbank — samt Sitzungen,
Einstellungen und den Geheimnissen der zweiten Faktoren, ohne den Schlüssel
unlesbar. **Während die Kopie entsteht, steht die Anlage still**; die Karte sagt
es vorher mit einer Schätzung (rund 20 ms je MB), dazu „letzte Sicherung vor N
Tagen" (aus dem **Dateisystem**, nicht aus einem Merker) und den Hinweis auf den
Schlüssel. **Die Rollenteilung steht an beiden Karten:** `VACUUM INTO` ist der
**Sicherungsweg**, der JSON-Export der **Austauschweg**.

**Seit 0.8.91 markiert sie, welche Kopien noch mit dem ALTEN Schlüssel
verschlüsselt sind** — und der Kasten steht nur da, wenn er etwas zu sagen hat:

| Lage | Was die Karte sagt |
|---|---|
| Nie gewechselt | **nichts.** Eine Warnung, die immer dasteht, liest niemand mehr |
| Gewechselt, alle Kopien jünger | ein **grüner** Kasten mit dem Datum |
| Gewechselt, einige Kopien älter | ein **roter** Kasten mit Zahl, Datum und Verbleib des alten Werts |
| Gewechselt, auch die jüngste älter | ein **roter** Kasten: *„Keine dieser Kopien passt zum heutigen Schlüssel"* |

*Die Marke kommt aus `settings` und nicht aus dem Dateisystem — anders als
„letzte Sicherung vor N Tagen": der Zeitpunkt eines Wechsels ist ein **Vorgang**
und hinterlässt keine Datei, die Änderungszeit einer Kopie ist dagegen die Sache
selbst.*

**Der Sicherungsort ist zweistufig** — die Wurzel aus `SICHERUNG_DIR`, ein
Unterverzeichnis darunter aus der Oberfläche, geprüft am **aufgelösten** Pfad.
`GET /api/sicherung` sagt über `imArbeitsverzeichnis`, ob die Wurzel im
Projektverzeichnis liegt; die Karte macht daraus einen roten oder grünen Kasten.
**Benannt, nicht verboten** — der Riegel gegen den Ort **im Datenverzeichnis**
bleibt eine Absage, der Ort im Arbeitsverzeichnis wird erlaubt und angezeigt.

**Einen einzelnen Eintrag als Datei** (seit 0.8.70): `GET /api/items/:id/export`
liefert dieselbe Form wie der volle Export, nur mit einem Eintrag —
Formatnummer unverändert **10**. Wo die Datei die Stringgrenze sprengen würde,
steht eine Absage mit Begründung statt eines Abrisses.

**Vokabular:** Sache (Einzahl/Mehrzahl), Merkmal (erfüllt/nicht erfüllt),
Zeitpunkt (Einzahl/Mehrzahl), Bericht (Einzahl/Mehrzahl) und Aufgabe
(Einzahl/Mehrzahl/erledigt) — Vorgaben Eintrag/Einträge, Getestet/Ungetestet,
Testtag/Testtage, Bericht/Berichte. **Elf Wörter**, betrifft rund 45 Textstellen
in der Oberfläche und eine Meldung im Server. Unter der Haube ändert sich
nichts. **„Video", „Gewicht" und „Kommentar" sind ausdrücklich keine weiteren
Vokabeleinträge.**

**Wer angemeldet ist, steht in der Kopfzeile** (seit 0.8.6), neben „Abmelden" —
**auch bei einem einzigen Zugang**: das ist eine Aussage über einen selbst,
nicht über andere.

---

## 5. Entscheidungen, die nicht rückgängig gemacht werden sollen

Diese Punkte wirken beim Lesen des Codes womöglich seltsam. Sie sind Absicht.

> **SORTIERT NACH THEMA, NICHT NACH VERSION** (seit Revision 25). Bis dahin
> standen sie in der Reihenfolge, in der sie entstanden sind — und dieselbe
> Frage tauchte dadurch an drei Stellen auf. Die Jahreszahl in Klammern bleibt
> an jedem Punkt stehen: sie sagt, seit wann er gilt. **Was zurückgenommen
> wurde, wird umgeschrieben und nicht gelöscht** — wer eine Frage in zwei
> Jahren wieder stellt, soll sehen, dass sie schon zweimal beantwortet wurde.

### 5.1 Versionierung, Changelog und die Papiere

#### Versionsnummern folgen Semantic Versioning 2.0.0 (ab 0.10.0)

**Beschlossen nach 0.9.1.** `https://semver.org/lang/de/`. Bis dahin trug das
Projekt ein eigenes Schema: Zehnerschritte, damit zwischen zwei Stufen neun
Nummern für Berichtigungsrunden frei bleiben. **Das war die Antwort auf ein
Problem, das SemVer schon löst** — und besser: die dritte Zahl ist bei SemVer
unbegrenzt, es kann also nie eng werden. *0.8.1, 0.8.6, 0.8.31 und 0.8.71 waren
genau solche Runden; unter SemVer hätte keine davon eine freie Nummer gebraucht.*

- **Dritte Zahl (PATCH) nur für abwärtskompatible Fehlerbehebungen.** Eine
  Runde, die eine Funktion bringt, ist keine PATCH-Runde — auch dann nicht, wenn
  sie klein ist.
- **Zweite Zahl (MINOR) für neue, abwärtskompatible Funktionen.** PATCH springt
  dabei auf 0 zurück. **Sie muss auch dann steigen, wenn etwas als `Deprecated`
  markiert wird.** *Umfangreiche Änderungen an internem Code dürfen sie
  ebenfalls heben; müssen aber nicht.*
- **Erste Zahl (MAJOR) für Brüche.** *Solange die erste Zahl 0 ist, gilt Punkt 4
  von SemVer selbst: in `0.y.z` können Änderungen „in jeder denkbaren Form und
  zu jeder Zeit auftreten".* Brüche laufen bis dahin über MINOR.
- **Was entfernt wird, wird vorher angekündigt.** Erst eine Version, die es als
  `Deprecated` führt, dann eine spätere, die es entfernt.
  **AUSGENOMMEN IST DIE ABSAGE AN ALTE DATENBANKEN IN 0.12.0, ausdrücklich
  entschieden:** es gibt zurzeit **genau eine Anlage und genau einen
  Betreiber**, und der weiß es. Ein Ankündigungslauf für ein Publikum, das es
  nicht gibt, wäre Papier ohne Leser. **Diese Ausnahme endet in dem Augenblick,
  in dem die Anlage an jemand anderen herausgeht.**
- **Vorveröffentlichungen sind möglich**, falls eine Runde in Etappen
  herausgeht: `1.0.0-rc.1` rangiert vor `1.0.0`.
- **EINE VERÖFFENTLICHTE VERSION WIRD NIE VERÄNDERT.** Wer an einem
  ausgelieferten Stand etwas ändert, gibt eine **neue Nummer** heraus. Das ist
  die Regel, gegen die 0.9.1 selbst verstoßen hat: die Nacharbeit an der
  Anmeldeseite ging unter derselben Nummer heraus, und genau daran ist der
  Fingerprint der laufenden Anlage unlesbar geworden (Stolperstein 158).
  **Ab 0.10.0 gibt es das nicht mehr.**
- **Nummern, die einmal draußen waren, werden nicht umgeschrieben.** 0.8.31
  bleibt 0.8.31. Umnummeriert wird nur der **Plan**.

**WAS BEI KRITERION DIE ÖFFENTLICHE SCHNITTSTELLE IST.** SemVer verlangt das
ausdrücklich als Erstes: ohne sie ist „abwärtskompatibel" ein Wort ohne
Gegenstand. Kriterion ist keine Bibliothek; wer es benutzt, betreibt es. **Die
Schnittstelle ist deshalb das, worauf sich ein Betreiber über einen
Versionswechsel hinweg verlässt:**

1. **Das Datenverzeichnis** — das Schema der verschlüsselten Datenbank und die
   Art der Verschlüsselung. Eine neue Fassung muss ein Verzeichnis der
   vorherigen öffnen können.
2. **Das Austauschformat** mit seiner Formatnummer (derzeit **10**).
3. **Die Schlüssel in der `.env`** und ihre Bedeutung.
4. **Die Werkzeuge auf dem Wirt** — `schluessel.sh` und `zugang.js` samt ihren
   Unterbefehlen. Sie sind der Notausgang; wer sie ändert, ändert einen Weg, den
   jemand im Ernstfall auswendig braucht.

*Was ausdrücklich NICHT dazugehört:* die HTTP-Endpunkte unter `/api/`. Sie
werden allein von der mitgelieferten Oberfläche gerufen, beide kommen aus
demselben Image, und ihre Fassungen können sich deshalb nicht auseinander
entwickeln. **Wer das je ändert — eine fremde Anwendung an `/api/` —, ändert
diese Aufzählung mit.**

**WARUM DANN NICHT SCHON 1.0.0?** SemVer sagt: *„Wenn die Software schon in der
Produktion verwendet wird, sollte sie bereits in Version 1.0.0 vorliegen."*
Kriterion läuft in der Produktion. **Die Null bleibt trotzdem, aus einem
benannten Grund:** die Schnittstelle oben ist noch nicht fest. 0.12.0 soll die
Datenbankstruktur erst festschreiben und den Rückweg abschneiden — genau das,
was nach 1.0.0 die Zwei kosten würde. *Die Null ist hier keine Bescheidenheit,
sondern eine Aussage: verlass dich noch nicht darauf.* **Sobald sie festliegt,
kommt 1.0.0 — und nicht später.**

#### Das Changelog folgt Keep a Changelog 1.1.0 (ab 0.10.0)

**Beschlossen nach 0.9.1.** `https://keepachangelog.com/de/1.1.0/`.

- **Überschrift `## [<Version>] - <JJJJ-MM-TT>`**, Datum nach ISO 8601, neueste
  Version oben.
- **Ein Abschnitt `## [Unreleased]`** ganz oben, in dem mitgeschrieben wird,
  während gebaut wird. *Die Regel stand bis Revision 24 als `[Unveröffentlicht]`
  hier und meinte damit die deutsche Fassung von Keep a Changelog; die Datei
  trug von Anfang an `[Unreleased]`. **Nachgezogen ist das Papier, nicht die
  Datei** — die sechs Abschnittsnamen bleiben englisch, und dieser gehört
  dazu.*
- **Die sechs Arten von Änderungen**, und nur die, jeweils weggelassen wenn
  leer: **`Added` · `Changed` · `Deprecated` · `Removed` · `Fixed` ·
  `Security`**. *Sie bleiben englisch, so wie die deutsche Fassung von Keep a
  Changelog sie selbst führt* — und das ist kein Bruch mit der Sprachregel aus
  Abschnitt 12: deren Maßstab ist das Wort, das ein deutschsprachiger
  Entwickler im Gespräch benutzt.
- **Für jede Version ein Eintrag. Keine Version ohne Zeile im Changelog.**
- **Zurückgezogene Versionen** als `## [x.y.z] - JJJJ-MM-TT [YANKED]`,
  großgeschrieben, damit ein Mensch es bemerkt.
- **Versionen sollen verlinkbar sein.** Das Repo trägt **fünfzehn** Tags, von
  `0.8.3` bis `v0.10.0` — sie sind nur **weder vollständig noch einheitlich**:
  0.8.80, 0.8.90, 0.9.0 und 0.9.1 haben keinen, und die zwölf ältesten stehen
  ohne `v`. **Ab 0.10.0 bekommt jede herausgegebene Version einen Tag, und zwar
  mit `v`.** **RÜCKWIRKEND WIRD NICHTS GETAGGT UND NICHTS UMBENANNT.**
- **Die Datei heißt `CHANGELOG.md` und liegt im Wurzelverzeichnis**, nicht in
  `Doku/`. *Wer das Paket auspackt, findet sie dort, ohne zu suchen.*
- **Keine Commit-Protokolle als Changelog.** Ein Commit dokumentiert die
  Entwicklung des Quelltextes, ein Changelog-Eintrag die beachtenswerte
  Änderung für den, der die Anlage betreibt.

**ZWEI EIGENE ABSCHNITTE BLEIBEN, und das ist kein Verstoß** — die Form nennt
sechs Arten, sie verbietet keine weiteren. Sie stehen **hinter** den sechs:
**„Was du danach von Hand tun musst"** (der Einspielweg dieser Version) und
**„Was gleich bleibt"** (die Zusagen, die eine Runde ausdrücklich *nicht*
antastet). *Beide sind für einen Betreiber das Wertvollste am ganzen Papier.*
**`Removed` bekommt dabei besonderes Gewicht:** eine weggenommene Datei bleibt
beim Einspielen über den alten Ordner liegen und verschiebt den Fingerprint
(Stolperstein 158) — was dort steht, gehört mit einem Satz auch nach „Was du
danach von Hand tun musst".

**Die Einträge bis einschließlich 0.9.1 stehen in der Form ihrer Zeit** — eigene
deutsche Überschriften, ohne Datum. *Sie werden nicht umgeschrieben.* **Was
dort fehlte, ist mit Revision 25 nachgetragen worden** — 0.8.6, 0.8.10, 0.8.20
und 0.8.30 hatten keinen Eintrag, und für alles vor 0.8.6 steht jetzt eine
Sammelzeile. Nachgetragen wird in der Form der Nachbarn, nicht in der neuen:
*eine dritte Form mitten in einer geschlossenen Reihe wäre schlechter als die
Lücke.*

#### Drei Papiere, ein Stand (seit Revision 25)

**Was gebaut ist, steht in diesem Blatt — und nur hier.** Die Konzeptpapiere
tragen die **Herleitung** und, im Videopapier, den **noch nicht gebauten**
Teil II. Der Grund ist keine Ordnungsliebe: dieselbe Zahl an drei Orten wird an
zwei davon vergessen, und genau so ist Stolperstein 137 entstanden. *Wer eine
Runde nachträgt, trägt sie hier nach, im Changelog und im Änderungsprotokoll —
sonst nirgends.*

**Das Konzeptpapier zum Mehrbenutzerbetrieb ist damit endgültig Historie.** Der
Satz „es wird nicht mehr angefasst" aus früheren Revisionen ist damit
eingelöst — nicht dadurch, dass niemand hineinsieht, sondern dadurch, dass
nichts mehr darin steht, was jemand nachziehen müsste.

### 5.2 Rollen, Rechte und Zugänge

- **Drei Rollen als Leiter, nicht zwei plus ein Bit** (seit 0.8.0).
  `user` < `admin` < `eigentuemer`. Bis 0.7.2 war der Eigentümer die kleinste
  `id` und ausdrücklich kein Rollenwort; das ist auf ausdrückliche Entscheidung
  aufgegeben worden, damit sich das Recht **vergeben** lässt. **Ein Bit neben
  `role` wäre die naheliegende Bauform und wäre falsch:** es ließe
  `role='user'` mit `eigentuemer=1` zu — zwei Spalten, die beide sagen dürften,
  was jemand darf. Als Leiter ist „ein Eigentümer ist immer auch Admin"
  **baulich wahr**. Gewonnen wird nebenbei, dass `istEigentuemer` die Datenbank
  nicht mehr fragt; **`MIN(id)` kommt in `server.js` nicht mehr vor**, und ein
  Wächter zählt das nach.
- **Eigentümer wird, wer schon Rechte hat — aber nur, solange es keinen gibt**
  (seit 0.8.0). *Gibt es keinen Eigentümer, wird es der älteste Zugang, der
  schon Rechte hat; und erst wenn es auch keinen Admin gibt, der mit der
  kleinsten Nummer.* **Der Zwischenschritt über den Admin ist keine Zierde:**
  ohne ihn beförderte der nächste Start den Zugang mit der kleinsten Nummer auch
  dann, wenn er ausdrücklich herabgestuft worden ist. **`status != 'geloescht'`
  ebenso wenig:** ein Grabstein darf die Anlage nicht erben. *Seit 0.8.1 bekommt
  der erste Zugang die Rolle direkt beim Anlegen; die Startregel bleibt als
  Auffangnetz für von Hand veränderte Bestände.*
- **Ein Admin kommt nicht an seinesgleichen** (seit 0.8.0). An einen anderen
  **Admin** oder den **Eigentümer** kommt nur der Eigentümer, und Rollen vergibt
  ohnehin nur er. Ohne diese Zeile wäre die Verwaltung ein Wettrennen. Die Regel
  steht an genau einer Stelle (`darfAnZugang`).
- **Der letzte aktive Eigentümer darf nicht verschwinden** (seit 0.8.0) — weder
  durch Herabstufen noch Sperren noch Entfernen, serverseitig durchgesetzt.
  Gezählt werden nur **aktive**: sonst ließe sich die Anlage verriegeln, indem
  man den letzten sperrt statt ihn herabzustufen.
- **Niemand sperrt oder entfernt sich selbst** (seit 0.8.0). Keine Doppelung der
  Regel darüber: mit zwei Eigentümern greift jene nicht mehr. *Die naheliegende
  Prüflage dafür ist blind* — lässt man einen Admin sich selbst sperren, kommt
  das 403 von `darfAnZugang` (Stolperstein 73).
- **Löschen entwertet, es löscht nicht** (seit 0.8.0). Die Benutzerzeile bleibt
  mit ihrer `id` stehen: `status='geloescht'`, Hash geleert, Rolle zurück auf
  `user`, Name mit `geloescht-<id>` überschrieben. **Die Anwendung entfernt keine
  Benutzerzeile mehr.** Der Grund ist nicht Schonung, sondern Zwang: verschwände
  die Zeile, machte `ON DELETE SET NULL` den ganzen Bestand herrenlos, und
  `ordneBestandZu()` schöbe ihn beim nächsten Start **still** dem Eigentümer zu.
  **Folge: die `ON DELETE`-Klauseln bleiben unverändert** und sind ab jetzt
  reines Auffangnetz für ein `DELETE` von Hand — der Prüfstand stellt es
  ausdrücklich nach.
- **Der Name eines entfernten Zugangs wird freigegeben** (seit 0.8.0), das
  Muster `geloescht-<zahl>` ist als Benutzername gesperrt, geprüft an **beiden**
  Wegen (Anlegen und Umbenennen). *Das Feld draußen ist geteilt: Discourse,
  MediaWiki und GitHub geben den Namen frei, Slack, Jira und Mastodon behalten
  ihn.* Für Kriterion gab den Ausschlag, dass der **Export** seit 0.7.1 den
  Namen nennt: trüge ein Grabstein weiter „faruk", schöbe dieselbe Datei in
  einer anderen Anlage mit einem lebenden „faruk" dessen Zeilen zu.
  **Der Preis: der alte Name ist danach endgültig weg.**
- **Zwei Häkchen beim Entfernen, nicht eine Entscheidung** (seit 0.8.0).
  **„seine Einträge löschen"** nimmt über die Kaskade auch **fremde**
  Kommentare, Bewertungen und Testtage mit — der Dialog nennt diese Zahl;
  **„seine Beiträge in fremden Einträgen löschen"** trifft nur seine eigenen.
  Vorgabe: beide aus. **Sitzungen, Favoriten, persönliche Einstellungen und der
  zweite Faktor gehen immer mit.**
- **`AUTH_RESET` wird abgelehnt, nicht begrenzt** (seit 0.8.0). **Ein Blick nach
  draußen zeigte, dass es niemand anders macht:** Nextcloud, GitLab, Grafana,
  WordPress und Home Assistant haben alle einen **Befehl auf dem Wirt**, der
  einen **Namen** nennt und **nur das Passwort** setzt. `zugang.js` folgt dem.
  **Der Gewinn ist das Fenster, das gar nicht erst aufgeht:** beim Weg über die
  Einrichtungsseite steht die nach jeder Rücksetzung offen. Damit entfällt auch
  der Einmalcode und der Status `entwertet`. **Die Vorgänge stehen in `auth.js`,
  nicht in `zugang.js`** — die Verwaltungskarte ruft dieselben.
- **Die Namensbremse verzögert, sie sperrt nicht** (seit 0.8.0). *Die Begründung
  des Konzeptpapiers war sachlich falsch* („sonst sperrt einer alle anderen
  aus" — das kann die IP-Bremse gar nicht, sie zählt je IP). Der echte Gewinn
  ist, dass **verteiltes** Raten gegen einen Namen bisher überhaupt nicht
  gebremst wurde. Eine harte Namenssperre wäre dagegen ein Werkzeug **gegen**
  fremde Zugänge.
- **Der Status wird an zwei Stellen durchgesetzt** (seit 0.8.0), Anmeldung und
  `requireAuth`, und sie decken einander nicht zu. **Die Gegenprobe zu
  `requireAuth` muss den Status über die Datenbank setzen**, sonst bliebe sie
  grün, auch wenn die Klemme fehlte.
- **`benutzerZahl` zählt keine Grabsteine** (seit 0.8.0). Bei genau einem
  lebenden Zugang sieht die Anlage wieder aus wie im Einbenutzerbetrieb, auch
  wenn zehn Grabsteine daneben stehen.
- **Die Rechteregel steht an einem Ort, nicht an jeder Route** (seit 0.7.2).
  `istAdmin` und `istEigentuemer` sagen, wer fragt; `darfAendern` (Verfasser
  oder Admin) und `nurSelbst` (Verfasser, Admin ausdrücklich nicht) sagen, was
  er darf; `nurAdmin`, `nurEigentuemer` und `nurEintragVerfasser` hängen als
  Wächter vor den Routen, `eintragFrei` bedient die Wege, bei denen die
  Eintragsnummer erst aus der Kindzeile kommt. **Die Adminfrage steht genau
  einmal im Quelltext, die Eigentümerfrage ebenfalls** — beides wird nachgezählt.
- **Löschen ja, umschreiben nein** (seit 0.7.2). Fremden **Kommentartext**
  ändern darf niemand, fremde **Art und Anheftung** setzen darf der Admin; einen
  fremden **Testtag löschen** darf er, dessen **Note ändern** nicht; ein fremdes
  **Kommentarbild löschen** darf er, **anhängen** nicht. *Der Preis: entfernt der
  Admin ein fremdes Bild, verschwindet es wortlos — der Vermerk dazu ist eine
  eigene Angabe am Kommentar und niemals sein Textfeld.*
- **Was an allen Einträgen aller Benutzer erscheint, gehört dem Admin; was nur
  dort erscheint, wo man es hinsetzt, gehört jedem** (seit 0.8.4). Daraus
  folgen: Kriterien beim Admin, Tags und Kategorien bei allen (abschaltbar),
  **Links und Dateien beim Eintrager** (0.8.30/0.8.31) — und das Gewicht beim
  Admin (0.8.40).
- **Ein Link gehört dem, der ihn einträgt, und eine Datei dem, der sie
  hochlädt** (seit 0.8.30/0.8.31) — nicht dem Verfasser des Eintrags.
  **Sortieren bleibt trotzdem beim Eintragsverfasser:** es ändert keine Aussage
  und ist umkehrbar — dieselbe Überlegung wie beim Anpinnen eines Kommentars.
  Dateien haben gar keinen eigenen Sortierweg. *Wer das eine für eine
  Nachlässigkeit hält, hat das andere nicht gelesen — die Trennung ist die
  Entscheidung.*
- **Fotos sind ausdrücklich KEIN Träger.** Ein Foto ist nicht etwas, das man an
  einen Eintrag *hängt* — das erste Foto **ist** der Eintrag, es steht als
  Hauptbild in der Übersicht. Wer die Reihenfolge ändert, ändert das Gesicht des
  Eintrags.
- **Der Name an einer Zeile steht nur, wo er eine Auskunft ist** (seit 0.8.30 am
  Link, 0.8.31 an der Datei). Zwei Bedingungen, und beide gehören zusammen:
  mehrere Zugänge **und** eine Zeile, die nicht vom Verfasser des Eintrags
  stammt. **Daraus folgt ein Satz, den man kennen muss:** „kein Name" heißt bei
  mehreren Zugängen „vom Verfasser des Eintrags".
- **Ein Name an einer Zeile steht in Klammern, ohne Trennzeichen davor** (seit
  0.8.30). Die Klammer sagt von selbst, dass dort eine **Angabe über** die Zeile
  steht; ein Trennzeichen liest sich wie ein abgerissener Satz, und in der
  Suchzeile bedeutet „ · " ohnehin schon „noch ein Anbieter". **Sie trägt jede
  Form, die `verfasserName()` liefert:** `(chefin)`, `(Gelöschter Benutzer 4)`,
  `(Ohne Verfasser)` — ein Vorwort wie „von" täte das nicht.
  **Der Name steht direkt hinter dem Inhalt, nicht am rechten Rand** (`flex: 0 1
  auto` am Inhalt, `flex: 0 0 auto` am Namen), **und bei den Angaben ZUR Zeile,
  nicht bei ihrem Gegenstand** — an der Dateizeile also hinter der Größe.
- **Ein Bedienzeichen folgt dem Recht, nicht der Anzeige** (seit 0.8.30). Ein
  Kreuz ohne Namen ist möglich, ein Name ohne Kreuz auch. Wer eines aus dem
  anderen ableitet, baut eine zweite Wahrheit über dieselbe Frage.
- **Zwei Rechteklassen dürfen in einem Rumpf stehen, aber nur vor dem ersten
  Schreiben** (seit 0.7.2). `PUT /api/items/:id` trägt den persönlichen
  Favoriten neben den Feldern des Verfassers, `PUT /api/comments/:id` den Text
  neben Art und Anheftung. Beide prüfen, **bevor** irgendetwas geschrieben ist:
  die Anheftung ist der erste Schreibvorgang, und eine Absage danach wäre halb
  ausgeführt.
- **Der Favorit bleibt persönlich, auch unter der Rechteschicht** (seit 0.7.2).
  Jeder setzt seinen eigenen an **jedem** Eintrag, auch an einem fremden;
  deshalb steht `favorite` ausdrücklich **nicht** in `NUR_VERFASSER_FELDER`.
- **Bei den Bewertungen steht ausdrücklich kein Wächter** (seit 0.7.2). Beide
  Wege treffen baulich nur die eigene Zeile. Eine Klemme daneben wäre eine
  zweite Wahrheit und ließe sich obendrein nicht gegenprüfen (Stolperstein 50).
- **Eine herrenlose Zeile gehört dem Admin** (seit 0.7.2). `darfAendern` gibt
  bei `user_id IS NULL` für jeden anderen falsch zurück; `ordneBestandZu()`
  räumt sie beim nächsten Start dem Eigentümer zu, bis dahin darf sie nicht
  jedem gehören.
- **Export und Import gehören dem Eigentümer, nicht jedem Admin** (seit 0.7.2).
  Der Import, weil eine Exportdatei seit 0.7.1 Beiträge **unter fremdem Namen**
  anlegen kann — **beide Modi**, nicht nur „ersetzen". Der Export, weil er der
  gesamte Bestand in einer Datei ist, die das Haus verlässt. *„Alles sehen darf
  jeder" gilt für den Bildschirm, nicht für die Mitnahme.* **Hinzunehmende
  Folge:** ein Admin ohne Eigentümerrecht kann keine Sicherung ziehen.
- **Die Liste aller schreibenden Routen wird gepflegt, nicht abgeleitet** (seit
  0.7.2). `F_ROUTEN` im Prüfstand nennt zu jedem Endpunkt die Art seiner
  Absicherung und wird gegen `server.js` gehalten — **in beide Richtungen**, denn
  wo „offen" steht, darf weder eine Klemme im Rumpf noch ein Wächter in der
  Routenzeile stehen. **Das ist die einzige Prüfung, die eine fehlende
  Entscheidung findet.**
- **Ein lesender Endpunkt kann einen Wächter tragen und steht trotzdem nicht in
  `F_ROUTEN`** (seit 0.8.2). Die Liste ist die Stelle, an der die Rechtefrage für
  **schreibende** Routen gestellt wird.
- **Eine Sitzung ohne Benutzer gilt nicht** (seit 0.6.0). `sitzungsBenutzer()`
  fragt über einen JOIN von `sessions` auf `users`; wo kein Benutzer hängt, gibt
  es keine Anmeldung. Eine herrenlose Zeile wäre ein Schlüssel zu niemandem.
- **Die Anmeldung liefert den Benutzer, nicht ein Ja/Nein** (seit 0.6.0).
  `pruefeAnmeldung()` gibt die Zeile zurück, und die Sitzung entsteht mit genau
  dieser Id. **Die Strenge der Namensprüfung bleibt unangetastet:** gesucht wird
  über die Spalte (die `COLLATE NOCASE` trägt), entschieden wird weiterhin mit
  `safeEqual` Zeichen für Zeichen; der Blindwert gegen Zeitmessung gilt
  unverändert.
- **`last_login` wird beim Anlegen der Sitzung geschrieben, nicht an den
  Aufrufstellen** (seit 0.6.0). Eine Stelle statt zwei kann nicht
  auseinanderlaufen.
- **`aendereZugang()` bekommt den Benutzer, behält aber seinen Namen** (seit
  0.7.2). **Merksatz: eine Umbenennung schützt vor stillem Weiterverwenden, eine
  Klemme vor lautem — man braucht die Umbenennung nur dort, wo die Klemme nicht
  greifen kann.**
- **`holeBenutzer()` heißt weiterhin nicht `holeAngemeldeten()`** (seit 0.6.0).
  Es liefert den **Eigentümer**, und das ist seit 0.7.2 eine eigene, gebrauchte
  Angabe und kein Notbehelf mehr.
- **Der Mehrbenutzerbetrieb lässt sich nur zurücknehmen, solange kein zweiter
  aktiver Zugang existiert** (aus dem Konzeptpapier, Teil II Abschnitt 13).
  Sonst würden fremde Inhalte herrenlos. *Ein Rückbau ist damit keine
  Einstellung, sondern eine Entscheidung über den Bestand.*
- **Ein Schlüssel, eine Datenbank** (aus dem Konzeptpapier, Teil II Abschnitt
  13). Jeder Benutzer vertraut dem Betreiber mit allem, was er einträgt —
  lesbar ist alles, Rechtetabelle hin oder her. Bei einer selbstgehosteten Sache
  ist das normal; **es gehört in die README, sobald Fremde mitmachen**
  (Abschnitt 10). *Verschlüsselung je Benutzer wäre ein Neubau, kein Anbau.*
- **Kein Papierkorb, kein Änderungsverlauf, keine Statistikübersicht** — bewusst
  verworfen. *Der Papierkorb ist mit 0.8.70 gebaut worden und die Ausnahme
  dazu; „kein Änderungsverlauf" gilt weiter, mit dem Eingriffsvermerk am
  Kommentar als einziger benannter Ausnahme.*
  *Der Mehrbenutzerbetrieb stand bis 0.5.9 ebenfalls hier.* Die Begründung
  (gemeinsame Kriterien, globale Blockanordnung, ein Vokabular für alle) **galt
  nur für getrennte Kataloge je Benutzer.** Für einen gemeinsamen Bestand mit
  mehreren Bewertern sind geteilte Kriterien kein Hindernis, sondern die
  Voraussetzung.
- **Zwei Wörter für zwei Dinge: Admin und Eigentümer** (seit 0.7.2). *Admin*
  verwaltet den Bestand; *Eigentümer* ist, wem gehört, was die Anlage als Ganzes
  betrifft. **„Leitung" war für beides benutzt worden** und ist aus Quelltext,
  Oberfläche und Dokumenten verschwunden; ein Wächter im Prüfstand hält fest,
  dass das Wort nirgends zurückkommt. **Kein drittes Rollenwort.** *Der
  Feldname `istVerwalter` war 0.7.2 der letzte Rest des alten Wortes und heißt
  seit 0.8.0 `istAdmin`.*
- **Ein gesperrter Zugang erfährt es — aber erst nach dem richtigen Passwort**
  (seit 0.8.0). Die Reihenfolge im Code ist die Aussage: erst prüfen, dann die
  Meldung. Vorher wäre „Dieser Zugang ist gesperrt" ein Werkzeug zum
  Durchprobieren von Benutzernamen; nachher ist sie das, was der Betroffene
  braucht. **Ein Fehlversuch ist es ausdrücklich nicht** — der Zähler wird nicht
  hochgesetzt.

### 5.3 Geheimnisse, Schranken und Absagen

- **Ein Token wird nachgeschlagen, ein Passwort verglichen** (seit 0.8.80).
  Deshalb SHA-256 **ohne Salz** statt scrypt, und deshalb steht dort **kein**
  zeitunabhängiger Vergleich. scrypt schützt **ratbare** Geheimnisse; 256 Bit
  aus dem Zufallsgenerator sind keins. Mit Salz je Zeile wäre der Hash nicht
  nachschlagbar — der Server müsste bei jedem Versuch jede Zeile durchrechnen,
  auf einer Route **vor** der Anmeldung. *Die Wahl des Hashverfahrens folgt dem
  Gegenstand, nicht der Gewohnheit des Projekts.* *Zum Maßstab: `sessions.token`
  liegt im Klartext in der Tabelle — den Token zu hashen ist strenger als der
  Bestand, nicht lockerer.*
- **Der Link ist ein Passwortersatz auf Zeit, und das steht am Bildschirm**
  (seit 0.8.80) — **an genau der Stelle, an der er kopiert wird**, nicht bloß in
  einem Dokument.
- **Beim Einlösen fällt ALLES Offene dieses Zugangs** (seit 0.8.80), nicht nur
  der eine Link. Läge noch ein älterer in einem fremden Verlauf, setzte er
  hinterher ein zweites Mal ein Passwort. Dasselbe beim **Sperren** und beim
  **Entfernen**: ein offener Link, der eine frische Sperre überlebte, wäre ein
  Weg an ihr vorbei.
- **Eine Absage vor der Anmeldung sagt nur, was zu tun ist** (seit 0.8.80).
  Abgelaufen, schon benutzt, erfunden, gesperrt — vier Lagen, **eine** Meldung,
  weil das Heilmittel dasselbe ist. *Wo verschiedene Ursachen denselben nächsten
  Schritt haben, ist die Unterscheidung nur eine Auskunft an den, der rät.* Der
  Preis wird nicht verschwiegen: ein Tippfehler sieht aus wie ein abgelaufener
  Link.
- **„Noch kein Passwort" ist abgeleitet, kein vierter Zustand** (seit 0.8.80).
  Abgeleitet aus `password_hash = ''` und **nicht** aus `last_login IS NULL` —
  das beantwortet „hat sich noch nie angemeldet", und das ist etwas anderes als
  „kann sich nicht anmelden".
- **Der Link und der Schlüssel sind zwei Wege, nicht einer mit zwei
  Beschriftungen** (seit 0.8.80). Der Link übergibt das **Recht, ein Passwort zu
  setzen**, der direkte Weg übergibt ein **Passwort**; der zweite kommt ohne den
  Browser des anderen aus.
- **Eine Betriebsart steht als Wahl im Formular, nicht in der Frage, welchen
  Knopf man drückt** (seit 0.8.80, nachgebessert aus dem Betrieb). Zuerst
  standen **zwei Knöpfe** nebeneinander; damit musste man beide Beschriftungen
  lesen, um zu wissen, was gleich geschieht. *Ein Feld, das gerade nicht gilt,
  ist kein Feld.*
- **Eine Sitzung wird über eine gerechnete Kennung adressiert, nie über ihren
  Token** (seit 0.8.80). In einem Pfad stünde er im Zugriffsprotokoll, in der
  Verlaufsliste und womöglich im Referrer. Dieselbe Überlegung trägt die
  Einlöseseite: der Schlüssel steht im **Fragment** und geht nie an den Server.
- **Die Anlage speichert weder IP-Adresse noch Browserkopf** (bestätigt in
  0.8.80). *Eine Karte, die mehr behauptet, als sie weiß, ist schlimmer als
  keine.*
- **„Token" im Quelltext, „Link" am Bildschirm** (seit 0.8.80). **Nicht** in der
  Wortliste des Sprachwächters — „Token" ist kein übersetztes Lehnwort, sondern
  der Fachbegriff —, sondern ein enger eigener Wächter über `public/app.js`,
  denn diese Datei **ist** der Bildschirm.
- **Der Admin schaltet frei, immer** (seit 0.9.1). **Es gibt keine Betriebsart,
  in der ein geklickter Link allein hereinlässt.** Eine solche Lage wäre ein
  anderes Produkt — Kriterion ist ein Archiv für eine kleine Gruppe, kein
  Forum —, und zwei Betriebsarten wären genau die zweite Wahrheit, die der
  Leitgedanke ausschließt. Der Bestätigungsschritt davor ist **kein** Ersatz für
  die Entscheidung eines Menschen, sondern nur der Beleg, dass die Adresse dem
  Anfragenden gehört. **Und die Anlage läuft ohne die Selbstanmeldung
  vollständig.**
- **Die immer gleiche Antwort ist eine Zusage über den Rumpf UND über die Uhr**
  (seit 0.9.1). Fünf Lagen, ein Statuscode, ein Rumpf Byte für Byte. **Die
  schwerere Hälfte ist die Laufzeit:** ein Weg, der eine Mail verschickt, dauert
  Sekunden; einer, der still verwirft, Millisekunden — aus dem Unterschied ließe
  sich ablesen, welcher gelaufen ist. **Gebaut ist deshalb die Trennung: Zeile
  schreiben, antworten, dann verschicken.** *Gemessen, nicht behauptet*
  (Stolperstein 150).
- **Ein Schalter legt sich nie von selbst um** (seit 0.9.1). Einschalten geht
  nur, wenn der Versand wirklich steht — ausschalten geht immer. Und geht der
  Versand später kaputt, **bleibt der Schalter an**; die Karte sagt es in einer
  roten Zeile. *Ein Schalter, der sich selbst umlegt, stünde anders da, als der
  Mensch ihn gestellt hat — das ist die zweite Wahrheit in ihrer unangenehmsten
  Form, weil sie sich wie Fürsorge liest.* **„Der Versand steht" heißt zwei
  Dinge, nicht eines** (Stolperstein 149).
- **Das Sicherheitsprotokoll nimmt keinen Freitext von außen** (seit 0.8.90,
  geschärft in 0.9.1 und 0.11.0). `merkmal` trägt ausschließlich Werte aus einer
  geschlossenen Liste; weder ein gewünschter Name noch eine Adresse noch ein
  **Suchbegriff** steht je in einer Zeile. *Sonst landete früher oder später ein
  ins falsche Feld getipptes Passwort in der Tabelle.* **Anfrage und Bestätigung
  schreiben ausdrücklich nichts** — sie wären die einzigen Zeilen neben der
  gescheiterten Anmeldung, die ein Fremder auslösen kann, und anders als dort
  gäbe es keinen Deckel darüber.
- **Das Sicherheitsprotokoll führt keine Namen** (seit 0.8.90). Eine
  Namensspalte wäre die eine Stelle im Projekt, die den Grabstein rückgängig
  macht.
- **Ein leeres `wer` im Protokoll heißt „über den Wirt"** (seit 0.8.90) — mit
  genau einer Ausnahme, und die ist am Vorgang zu erkennen. *Ein eigenes Feld
  für die Herkunft wäre eine zweite Wahrheit daneben.*
- **Die Obergrenze des Protokolls ist die Anmeldebremse, keine eigene Regel**
  (seit 0.8.90). *Ein Deckel, den es nicht gibt, kann nicht vergessen werden* —
  dieselbe Bauform wie beim gewichteten Mittel.
- **Die zweite Bestätigung ist an die SITZUNG gebunden, nicht an den Menschen**
  (seit 0.8.90). Verteidigt wird gegen eine **fremde offene Sitzung** — nicht
  gegen einen Fremden, der kommt ohne Passwort gar nicht herein. *Wer die
  Bindung je an den Benutzer hängt, hat genau die Lage wieder offen, gegen die
  die Runde gebaut wurde.*
- **Die Rechtefrage steht vor der Bestätigungsfrage** (seit 0.8.90). *Die
  umgekehrte Reihenfolge wäre ein Weg, an einer fremden Rolle zu prüfen, ob ein
  Passwort stimmt.*
- **Die Bestätigung reist NICHT im Rumpf der Handlung** (seit 0.8.90). Die
  schönere Form scheitert an zwei der Wege: `GET /api/export` ist eine
  **Browsernavigation** (kein Rumpf möglich, und in die Adresse gehört ein
  Passwort nie — die Datei läuft damit außerdem an der Platte vorbei statt
  vollständig im Speicher zu stehen), und der Wächter vor `POST /api/import`
  steht ausdrücklich **vor multer**, damit die bis zu 900 MB große Datei eines
  Fremden gar nicht erst eingelesen wird. **Die Freigabe kann beides, weil sie
  vor der Handlung steht und nicht in ihr.** *Der Preis ist benannt: es ist
  Zustand, und es gibt eine Frist.* **Wer einen achten Weg ergänzt, nimmt
  dieselbe Form — nicht eine zweite daneben.**
- **Der zweite Faktor gehört dem Betroffenen, ganz** (seit 0.10.0). Der Grund
  ist Bauart, nicht Höflichkeit: **einschalten** kann nur, wer das Geheimnis auf
  sein Telefon bekommt — ein Admin, der es für einen anderen täte, sperrte ihn
  aus. **Ausschalten** darf nur der Betroffene, sonst wäre der zweite Faktor an
  der Rollenleiter vorbei abschaltbar. **Es gibt deshalb gar keine Adresse
  dafür**: die vier Routen tragen die Art `selbstbezug`. Der einzige Weg daneben
  ist `zugang.js` auf dem Wirt — *was alles kann, läuft nicht über die
  Oberfläche* —, **und auch dort nur AUS.**
  *Ob ein Admin ihn später VERLANGEN kann, ist eine andere Frage und war in
  0.10.0 ausdrücklich nicht zu entscheiden.*
- **Sperren streift einen fremden zweiten Faktor nicht ab** (seit 0.10.0).
  `setzeStatus` räumt Sitzungen und Token — **den zweiten Faktor ausdrücklich
  nicht**: nähme es ihn mit, wäre „sperren und wieder freigeben" der Weg, an dem
  ein Admin einen fremden Faktor abstreift und danach mit einem selbst gesetzten
  Passwort hereinkäme. **`entferneZugang` nimmt ihn dagegen mit.** *Wer die
  Zeile je nach oben zieht, weil sie neben den beiden anderen so plausibel
  aussieht, öffnet genau diese Lücke.*
- **Das TOTP-Geheimnis liegt im Klartext, und es geht nicht anders** (seit
  0.10.0). Ein Passwort wird **geprüft**, also genügt sein Hash; ein
  TOTP-Geheimnis wird **nachgerechnet**, also braucht die Anlage den Wert
  selbst. **Die verschlüsselte Datenbank ist die einzige Schicht darüber**, und
  das gehört benannt statt weggeschrieben: der **JSON-Export trägt es nicht**,
  die **Sicherung sehr wohl**, und in eine **Kontrollausgabe kommt es nie**.
  *Wiederherstellungscodes sind der andere Fall und liegen deshalb als SHA-256
  ohne Salz da — sie werden verglichen, nicht nachgerechnet.*
- **Ein Code gilt genau einmal, und die Regel ist ein Zähler** (seit 0.10.0).
  Angenommen wird nur ein Zeitschritt, der **echt größer** ist als der zuletzt
  verbrauchte — schärfer als „derselbe Code nicht zweimal", dafür **eine** Regel
  statt einer Liste verbrauchter Werte. **Die Bedingung steht in der
  `WHERE`-Klausel des `UPDATE` und nicht in einer Prüfung davor:** zwischen
  Lesen und Schreiben läge sonst Platz für einen zweiten Aufruf mit demselben
  Code.
- **Die vier Kennwerte des zweiten Faktors sind eine Fessel, keine Wahl** (seit
  0.10.0). HMAC-**SHA1**, **sechs** Ziffern, **dreißig** Sekunden, **Base32**.
  SHA-256, acht Ziffern oder sechzig Sekunden wären jedes für sich das bessere
  Verfahren — und jedes wird von **Google Authenticator stillschweigend falsch**
  oder gar nicht gelesen. **Die Werte stehen als Konstanten im Quelltext, mit dem
  Grund daneben**, und der Prüfstand nagelt jede einzeln fest. *Die Kehrseite
  ist nachgesehen: es sind dieselben Werte in Aegis, 1Password und den
  iOS-Passwörtern — gebunden wird an den Standard, nicht an einen Anbieter.*
- **Der Schlüsselwechsel gehört auf den Wirt, nicht in die Oberfläche** (seit
  0.8.91). Der Auftrag sah einen Knopf im Systembereich vor. **Zwei Gründe:**
  *der Anlass ist einmalig, nicht wiederkehrend* — SQLCipher-Schlüssel altern
  nicht, gewechselt wird, wenn ein Schlüssel in fremde Hand geraten ist, und ein
  dauerhafter Knopf für ein einmaliges Ereignis (ausgerechnet der, der bei
  falscher Handhabung **alles** verliert) ist ein schlechtes Tauschgeschäft; und
  *ein Knopf könnte den `.env`-Fall gar nicht zu Ende bringen* — die `.env` ist
  per `.dockerignore` nicht einmal im Image.
  **Was daraus folgt und weitergilt:** *wer eine Handlung baut, die außerhalb
  der Anlage etwas nachziehen muss, baut sie dort, wo beides erreichbar ist* —
  und *ein Vorgang, der genau einmal vorkommt, braucht keinen dauerhaften Ort in
  der Oberfläche.* **Der Preis ist benannt:** es gibt keine Rechtefrage vor dem
  Wechsel. *Zugriff auf den Wirt ist die Berechtigung.*
- **Der alte Schlüssel ist kein Abfall** (seit 0.8.91). Nach einem Wechsel
  bleibt er **auskommentiert** in der `.env` stehen. **Er öffnet jede Sicherung,
  die vor dem Wechsel entstanden ist. Wer ihn wegwirft, wirft die Sicherungen
  weg.** *Zwei Schlüssel in einer Datei sind gegenüber vorher nicht schlechter —
  vorher öffnete der eine alles —, aber die Aufbewahrung ist damit **sichtbar**
  statt still.*
- **Der Name in der `.env` ist eine Notiz, das Protokoll eine Feststellung**
  (seit 0.8.91). `whoami` bzw. `$SUDO_USER` kann setzen, wer den Befehl ausführen
  darf. Sie steht deshalb dort und ausdrücklich **nicht** im
  Sicherheitsprotokoll, wo der Vorgang das leere `wer` trägt. *Zwei Wahrheiten
  über denselben Vorgang wären schlechter als eine.*
- **Kontrollausgaben laufen über die Länge und das letzte Zeichen, nie über den
  Inhalt.** **Seit 0.8.91 hat der Merksatz eine benannte, eng gefasste
  Ausnahme:** `schluessel.sh` nennt nach einem gelungenen Wechsel den **alten**
  Wert im Klartext. *Das ist eine Ausgabe an einen Menschen am Terminal, keine
  Kontrollausgabe: sie steht in keinem Containerprotokoll und in keiner
  Protokollzeile, und der Prüfstand hält beides fest.*
- **Der Server gibt den Token heraus, den Link baut der Browser — bis eine
  öffentliche Adresse gesetzt ist** (seit 0.8.80, erweitert in 0.8.90 und
  0.9.0). In Stufe H stellte sich die Frage nach einer öffentlichen Adresse gar
  nicht: der Browser des Admins steht ohnehin an der richtigen Adresse. **Ab
  0.9.0 braucht der Versand sie** — beim Verschicken gibt es keinen Browser zu
  fragen. *Aus dem `Host`-Kopf wird in keinem der beiden Fälle etwas
  abgeleitet.*

### 5.4 Schema, Daten und Austauschformat

- **Eine neue Spalte braucht beides: die DDL und einen Migrationsblock** (seit
  0.8.3). `CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht an
  (Stolperstein 13), und seit 0.8.1 gibt es keinen anderen Nachrüstweg mehr. Die
  Vorgabe greift für jede **Zeile**, aber nur dort, wo die **Spalte** existiert —
  *der Entwurf zu 0.8.3 verwechselte das und behauptete „kein Migrationscode
  nötig".* **Die DDL bleibt der Ort der Wahrheit:** zu 1.0 fällt der Block weg,
  die Spalte bleibt. **Eine neue TABELLE braucht keinen Block** (0.8.70, an
  jeder weiteren erneut nachgestellt statt abgeschrieben).
- **Ein Fremdschlüssel auf `users` gibt den Bestand frei, statt ihn
  mitzunehmen** (seit 0.6.1). Alle sechs Träger stehen auf
  `ON DELETE SET NULL`. Die Alternativen sind beide falsch: `CASCADE` ließe
  einen gelöschten Benutzer den halben Bestand mitnehmen, und gar keine Angabe
  ließe ein `DELETE FROM users` von Hand an einer Fremdschlüsselverletzung
  scheitern (Stolperstein 54).
- **Zwei Regeln für zwei Zeitpunkte sind keine zweite Wahrheit** (seit 0.8.30).
  `migration0830()` gibt die Bestandslinks dem **Eintragsverfasser**,
  `ordneBestandZu()` gibt später herrenlos gewordene Zeilen dem **Eigentümer**.
  Zwei verschiedene Fragen — **beide stehen deshalb im Quelltext nebeneinander
  erklärt**, nicht jede für sich.
- **Ein Auffangnetz mit einem Anlegeweg braucht so viele Aufrufstellen wie es
  Wege gibt** (seit 0.6.1). `ordneBestandZu()` steht in `db.js` und wird an
  **zwei** Stellen gerufen: beim Start und in `legeErstenBenutzerAn()`. Das
  sieht nach Doppelung aus und ist keine — die Gegenprobe an jeder Stelle macht
  genau ihre eigene Prüfung rot (Stolperstein 53).
- **Ein `ON CONFLICT`-Ziel gehört zum `UNIQUE` seiner Tabelle** (seit 0.6.2).
  Die Stellen in `server.js` und die Tabellen in `db.js` sind **ein** Paar; wer
  eines ändert, ändert das andere mit (Stolperstein 58).
- **Der Tabellenneubau erkennt seinen Bedarf am UNIQUE-Index, nicht an einem
  Merker** (seit 0.6.2). *Der Index ist ohnehin die Wahrheit — der Merker wäre
  nur eine Behauptung darüber*, und er könnte beim Schnitt zwischen globaler und
  persönlicher Hälfte zwischen die Stühle fallen.
- **Zwei Leute am selben Datum sind kein Konflikt, sondern zwei Testtage** (seit
  0.6.2). `UNIQUE(item_id, day, user_id)`; dasselbe für die Bewertung mit
  `UNIQUE(item_id, criterion_id, user_id)`. **Zurücksetzen meint deshalb
  ausschließlich die eigenen Werte** — ohne die zweite Bedingung im `DELETE`
  räumte der Knopf im Blockkopf die Bewertungen aller anderen wortlos mit weg.
- **Tags am Testtag bekommen keine eigene `user_id`** (seit 0.6.1). Sie hängen
  am Testtag, gehen mit ihm über die Kaskade und teilen dessen Eigentümer. Eine
  zweite Spalte daneben wären zwei Orte, die beide sagen dürften, wem etwas
  gehört.
- **Eine Einstellung ist entweder Ansicht oder Sprache — und das entscheidet,
  wem sie gehört** (seit 0.6.5). Die Aufteilung steht in Abschnitt 3. **Das
  Vokabular bleibt ausdrücklich global**: es ist die Sprache der Anwendung,
  keine Ansichtssache.
- **Eine persönliche Einstellung bekommt eine Spalte, keine Tabelle** (seit
  0.6.5). `item_pins` ist hier kein Vorbild: die Anheftung hat eine eigene
  Tabelle bekommen, weil sie eine Aussage über einen **Eintrag** ist. Eine
  Einstellung ist eine Aussage über niemanden außer sich selbst — also eine
  Tabelle für alle Schlüssel, mit `key` als zweiter Spalte des
  Primärschlüssels. *Wer C2 als Muster nimmt, baut eine Tabelle zu viel.*
- **`user_settings.user_id` steht auf `ON DELETE CASCADE`** (seit 0.6.5), und
  das ist keine Formsache: ohne Angabe scheiterte `AUTH_RESET` an einer
  Fremdschlüsselverletzung, `SET NULL` scheitert am `NOT NULL` des
  Primärschlüssels — beides nachgestellt.
- **Ein persönlicher Schlüssel darf nie wieder global geschrieben werden** (seit
  0.6.5). `putSetting` weist ihn laut ab. Ohne diese Schranke entstünde ein
  Wert, der still für alle gilt statt für den, der ihn gesetzt hat. **Die Liste
  steht nur noch einmal** (seit 0.8.1): `PERSOENLICHE_SCHLUESSEL` in `server.js`
  ist Schranke und Wahrheit zugleich.
- **`items.favorite` bleibt als Spalte stehen und wird nie beschrieben** (seit
  0.6.3). Die Spalte bleibt, damit Bestands- und Neuanlage dasselbe Schema
  tragen; der Favorit steht in `item_pins`. **Wer hier wieder hineinschreibt,
  baut eine zweite Wahrheit über dieselbe Sache.**
- **Die Anheftung ist eine Aussage über den Eintrag, keine Eigenschaft von ihm**
  (seit 0.6.3). `favorite` in der Antwort heißt „habe **ich** angeheftet" —
  dieselbe Antwort sieht für zwei Leute verschieden aus.
- **Anheften rührt `updated_at` nicht mehr an** (seit 0.6.3). Bis 0.6.2 sprang
  der Eintrag damit in **jeder** Übersicht nach oben; das steht quer zu *die
  Liste zeigt, wo etwas geschieht, nicht wo ich zuletzt war.*
- **`detail()` bekommt den Benutzer ohne Vorgabewert — und mit einer Klemme**
  (seit 0.6.3). Ein `ORDER BY id LIMIT 1` als Rückfall wäre eine Zeitbombe. Die
  Klemme ist die **einzige** Schicht: `better-sqlite3` bindet ein fehlendes
  Argument still als `NULL` (Stolperstein 59). Dasselbe gilt für `qTestDays()`
  und `getUserSetting`.
- **`katalog.sqlite` behält seinen Namen.** Ein anderer Name hieße: der Start
  hält den Bestand für eine Neuinstallation und legt eine **leere** Datenbank an
  — neben der vollen Datei, die niemand mehr anfasst. *Dasselbe gilt für den
  Tabellennamen `item_pins` und für `photos`, das seit 0.8.50 zwei Arten trägt.*
- **Der Cookiename trägt den Projektnamen** (`kriterion_session` seit 0.5.10).
  Ihn zu wechseln macht alle Sitzungen ungültig — einmal neu anmelden, keine
  Datenfolge. **Seit 0.8.20 ist er kein fester String mehr**, siehe
  `HINTER_PROXY`.
- **Die Formatnummer ist eine Aussage, keine Bedingung** (seit 0.7.1). Weder der
  Import noch die Oberfläche lesen sie; entschieden wird ausschließlich über das
  **Vorhandensein der Felder**. *Wer die Nummer je zur Bedingung macht, macht
  aus einer Notiz eine zweite Wahrheit.*
- **Die Exportdatei nennt den Namen, nie die Id** (seit 0.7.1). Eine nackte
  `user_id` zeigt auf eine Zeilennummer in *einer bestimmten* Datenbank und ist
  woanders bedeutungslos; der Name ist die einzige Angabe, die zwei Anlagen
  gemeinsam haben.
- **Ein herrenloser Verfasser steht ausdrücklich als `null` in der Datei** (seit
  0.7.1), das Feld fehlt nie. Sonst wäre „diese Zeile hat keinen Verfasser" von
  „diese Datei ist älter als 0.7.1" nicht zu unterscheiden. *Dieselbe Regel gilt
  in der Antwort des Servers: `verfasser: null`, nie ein fehlendes Feld.*
- **Ein unbekannter Name legt keinen Zugang an** (seit 0.7.1). Er fällt an den
  Einspielenden. *Die naheliegende „Hilfsbereitschaft" wäre ein Weg an der
  Verwaltung und am Passwort vorbei:* **die Datei ist Bestand, keine
  Verwaltung.**
- **Der Import meldet die Namen, die er nicht kennt** (seit 0.7.1) — in der
  Antwort und mit einer Zeile im Protokoll. Der Grund ist die Stille des
  Gegenteils: „alles andere fällt an den Einspielenden" ist der lautloseste
  denkbare Vorgang. **Gezählt werden nur die *fremden* Zuordnungen.**
- **Die Anheftung wandert nicht mit dem Eintrag** (seit 0.7.1). Der Verfasser
  kommt zu Eintrag, Bewertung, Kommentar, Testtag, Link und Datei — **nicht**
  zum Favoriten: er ist eine Aussage *über* einen Eintrag und nicht sein Inhalt.
- **Der ersetzende Import rührt `users`, `sessions` und `tokens` nicht an** —
  täte er es, würde er im schlimmsten Fall alle aussperren.
- **Das Vokabular ändert nur Beschriftungen.** Feldnamen in Datenbank und Export
  bleiben, sonst wären alte Exportdateien nicht mehr einspielbar. Aus demselben
  Grund steht das Vokabular in den Einstellungen und nicht in der Exportdatei.
- **Eine Exportdatei ist EIN String, und der hat eine Grenze** (seit 0.8.70,
  gemessen). `MAX_STRING_LENGTH` ist 536.870.888 (512 MB); zwanzig Videos zu je
  20 MB sind als Base64 533 MB, und `JSON.stringify` antwortet mit
  `RangeError`. **Zippen hilft nicht** — der String entsteht davor. Daraus folgt
  die Bauform des Papierkorbs: die Bytes gehen an der JSON **vorbei** in eine
  Nebentabelle. **Wer einen weiteren Weg ergänzt, der eine Datei aus dem Bestand
  baut, entscheidet sich für eine der drei Antworten** — Schalter, Absage oder
  Nebentabelle; es gibt keine, die ohne auskommt.
- **Die Abbildung je Eintrag und der Deserialisierer stehen je genau einmal**
  (seit 0.8.70). Drei Stellen rufen `eintragAlsPaket()` und zwei `spieleEin()`;
  ein Wächter hält beide Zahlen fest. *Zwei Rechenwege für dieselbe Datei laufen
  auseinander.*
- **`VACUUM INTO` ist der Sicherungsweg, der JSON-Export der Austauschweg**
  (seit 0.8.70), **und die Rollenteilung steht an beiden Karten**, nicht nur in
  den Dokumenten. Die Kopie ist vollständig und konstant im Speicherbedarf,
  überlebt aber keinen Formatwechsel und ist ohne den Schlüssel wertlos; der
  Export ist unvollständig, baut die ganze Datei im Arbeitsspeicher und überlebt
  beides. **Einen dritten Weg gibt es nicht:** `db.backup()` scheitert an einer
  SQLCipher-Datenbank (Stolperstein 117).
- **Wohin geschrieben wird, entscheidet der aufgelöste Pfad** (seit 0.8.70).
  Positivliste zuerst, `realpathSync` danach — erst dort fällt ein Symlink auf,
  der aus der Wurzel herausführt (Stolperstein 120). **Ein Verzeichnis, das es
  nicht gibt, ist eine Absage mit Begründung — kein stilles Anlegen.** *Der
  Sicherungsort ist bis auf Weiteres die einzige Stelle, an der der Server an
  einen Ort schreibt, den jemand angeben darf.*
- **Eine Sicherung entsteht unter einem Arbeitsnamen und wird erst danach
  umbenannt** (seit 0.8.70). Eine halbfertige Kopie trägt nie den endgültigen
  Namen und kann selbst dann nicht als fertige gelesen werden, wenn das
  Aufräumen scheitert. **Entfernt wird ausschließlich der Arbeitsname** — ein
  Aufräumen, das die endgültige Datei träfe, würfe im Zweifel die Sicherung des
  Vortags weg.
- **Der Sicherungsort und seine Einhängung stehen in derselben Datei** (seit
  0.8.70). Stünde die eine in der `.env`, liefen sie auseinander, und die Anlage
  schriebe in eine Schicht des Containers, die beim nächsten `--build`
  verschwindet.
- **Benannt statt verboten — die Lage des Sicherungsorts** (seit 0.8.71). Der
  Riegel gegen den Ort **im Datenverzeichnis** bleibt eine Absage; der Ort **im
  Arbeitsverzeichnis** wird **erlaubt und angezeigt**. Zwei Gründe: eine
  Sicherung am falschen Ort ist besser als keine, und der
  **Auslieferungszustand ist selbst dieser Fall**. *Wo eine Lage schlechter,
  aber nicht falsch ist, gehört sie benannt und nicht verboten.* **Die Lage gilt
  für die Wurzel, nicht für das Unterverzeichnis** — sie ist eine Eigenschaft der
  **Einrichtung**, nicht der Einstellung.
- **Ein Schalter kann nichts tun, während nichts läuft** (seit 0.8.71). Den
  Sicherungsordner beim Einspielen über eine Einstellung verschieben zu lassen,
  ist verworfen: zu diesem Zeitpunkt ist `docker compose down` längst gelaufen.
  *Ein eigenes Skript stünde als zweite Wahrheit neben dem Weg in der README.*
- **`geloescht_von` ist kein Träger wie `items.user_id`** (seit 0.8.70). Es ist
  die Feststellung eines **Vorgangs**, so wie `created_at`; daran hängt kein
  Recht und kein Filter, und die Spalte gehört ausdrücklich **nicht** in
  `ordneBestandZu()` — dort stillschweigend den Eigentümer einzusetzen machte aus
  einer Feststellung eine **Falschaussage**. *Dasselbe gilt seit 0.8.90 für
  `sicherheitsprotokoll.wer` und `.ziel`.*
- **Der Titel steht im Papierkorb absichtlich zweimal** (seit 0.8.70) — als
  eigene Spalte und im Paket. Er steht dort, damit die Liste lesbar ist, ohne
  jede Zeile zu entpacken. **Eine zweite Wahrheit kann daraus nicht werden:**
  das Wiederherstellen liest ausschließlich `inhalt` und die Spalte nie.
- **„Löschen entwertet" gilt Benutzern — beim Eintrag gilt das Gegenteil, und
  der Papierkorb ändert daran nichts** (seit 0.8.70). Ein gelöschter Eintrag ist
  **wirklich weg**: kein `geloescht`-Zustand an `items`, kein `WHERE`-Zusatz
  irgendwo. Er liegt nur **zusätzlich** als Paket daneben. *Die Form ist hier
  wichtiger als die Idee* — ein Zustand an `items` berührte jede Abfrage im
  ganzen System, und jede vergessene Stelle wäre ein stiller Fehler.
- **Wiederherstellen legt einen NEUEN Eintrag an** (seit 0.8.70). Die alte
  Nummer ist weg, und daran hängt nichts mehr. Der Weg geht durch den **Import**
  und erfindet dessen Regeln nicht neu — **ein Grabstein wird dabei gefunden**,
  seine Zeile in `users` steht ja noch.

#### Die Suche sucht im Server, über `instr()`, ohne Index (0.11.0)

**Drei Entscheidungen in einer, und alle drei sind gemessen.**

**Erstens: der Server sucht.** `searchText` war an 1000 Einträgen **73 Prozent
der Antwort** (2,50 MB gegen 0,68 MB ohne). Die Übersicht wird bei jedem
Betreten neu geholt und kostet danach 0,52 MB; eine entprellte Suche kostet
~15 ms und die Größe ihrer Treffer. *Es lohnt sich, selbst wenn jemand neunzig
Mal je Besuch sucht.*

**Zweitens: `instr()` und nicht `LIKE`.** In einem `LIKE '%…%'` sind `%` und
`_` im **Suchbegriff** Wildcards: ein eingegebenes Prozentzeichen fände jeden
Eintrag statt des einen, der eines trägt (nachgestellt: 1001 gegen 1 Treffer).
Mit `ESCAPE` ließe sich das einfangen — **aber `instr()` kennt gar keine
Wildcards. Der Suchbegriff ist dort Text von Bauart und nicht durch eine
Klemme, die jemand vergessen kann.** *Die Geschwindigkeit ist ein Nebenprodukt
(1,9 ms bei einem häufigen Wort, 13,2 ms im schlechtesten Fall).* **Dazu
gehört `kkl` in `db.js`**, eine in SQL eingehängte Kleinschreibung nach
Unicode — ohne sie fände „übergross" den Eintrag „ÜBERGROSS" nicht
(Stolperstein 164).

**Drittens: kein FTS5 und kein Suchindex.** Die eingebaute SQLite kann es
(3.49.2), es käme also **keine Abhängigkeit** dazu — und trotzdem nein: der
Trigramm-Index kostet an 1000 Einträgen **5,17 MB bei 1,75 MB Nettotext**,
bräuchte eine Auffrischung an **sieben** Schreibstellen und einen Neuaufbau
bei jedem Einspielen. **Und er ändert das Verhalten für den Menschen:** eine
Abfrage mit einem oder zwei Zeichen scheitert nicht, sie liefert *still null
Treffer* (Stolperstein 165). *Für eine Millisekunde nimmt man dem Benutzer
nicht die Suche ab einem Zeichen weg.*

**Der Suchtext wird nicht gespeichert.** Eine Spalte an `items` wäre der
sechste Migrationsblock; eine eigene Tabelle müsste an sieben Stellen
nachgezogen werden — **und eine vergessene Stelle ist eine zweite Wahrheit.**

**Die Route ist dieselbe mit einem Parameter mehr** und damit lesend; *eine
zweite Route für dieselbe Liste wären zwei Wege zu einer Menge.* **Die Suche
bekommt auch keine eigene Bremse:** sie steht hinter der Anmeldung, und die
Anmeldebremse verteidigt gegen Fremde.

#### Die gespeicherten Ansichten liegen in `settings` und nicht in einer Tabelle (0.11.0)

**Eine Ansicht ist kein Träger** — sie hat keinen
Verfasser, keine Kaskade und kein Recht, sie ist eine gemerkte Einstellung und
hat genau die Form, die `filters` seit jeher hat. Sie liegt als **achter
persönlicher Schlüssel** `ansichten` in `user_settings`, als JSON-Liste;
`getUserSetting` gibt die leere Liste als Vorgabe. **Damit kostet die Runde
kein Schema und keinen Migrationscode.**

**Der Preis steht dabei, statt weggeschrieben zu werden: JSON kennt keine
Kaskade.** Wird eine Kategorie oder ein Tag gelöscht, bleibt die Nummer
stehen. **Übergangen wird sie beim ANWENDEN und nicht beim Lesen** — *ein
Lesevorgang, der die Ansicht eines Menschen umschreibt, ist schlimmer als eine
Nummer, die ins Leere zeigt.*

**Der Suchbegriff gehört in die Ansicht.** Die Frage ist nicht, was technisch
dazugehört, sondern **was ein Mensch erwartet, wenn er eine Ansicht
anklickt**: das, was er beim Speichern vor sich hatte.

**Acht, und der Grund ist die Zeile** — mehr als acht Knöpfe sind keine Zeile
mehr, sondern eine Liste. **Der Deckel kommt vom Server** und wird in der
Oberfläche gesagt, statt den Knopf wortlos wegzulassen. 
**Persönlich, ganz:**
eine geteilte Ansicht wäre ein neuer Träger und eine neue Rechtefrage.

### 5.5 Bewertung, Testtage und Rechenwege

- **Testtage und Kriterienbewertung sind getrennt.** Die Kriterien sind eine
  Analyse, die Testtage ein Verlauf. Nicht zu einem Durchschnitt verrechnen und
  nicht in denselben Block stecken.
- **Testkennzahlen sind `null`, nicht `0`**, wenn keine Testtage vorhanden sind.
  Solche Einträge stehen bei allen Testsortierungen immer am Ende — sie haben
  keinen niedrigen Wert, sondern gar keinen.
- **Ein Testtag hat keine Null.** Er fand statt und hat eine Note, oder er wird
  gelöscht. Der Doppelklick-Rücksetzer der Kriterien gilt dort nicht.
- **„Getestet" ist gesperrt**, solange Testtage vorhanden sind — serverseitig
  durchgesetzt, mit sprechender Begründung, und **über alle Benutzer**: fremde
  Testtage können den eigenen Schalter blockieren. *Ein Schalter, der wortlos
  nichts tut, wirkt wie ein Fehler.*
- **Skala fest 1–5.** Wählbare Skalen würden die Vergleichsansicht verfälschen,
  die je Kriterium den besten Wert hervorhebt. **Die Gewichtung berührt das
  nicht:** ein Gewicht ändert keinen einzigen Kriterienwert.
- **Jedes Kriterium hat ein Gewicht, und es gehört dem Admin** (seit 0.8.40).
  Zwischen **0,2 und 2**, immer positiv, Vorgabe 1. Es ist **keine persönliche
  Einstellung**: hätten zwei Leute verschiedene Gewichte, hätte derselbe Eintrag
  zwei verschiedene Gesamtschnitte. **Und es steht in der Datenbank, nicht in
  einer Datei** — eine Konfigurationsdatei stünde außerhalb der Verschlüsselung,
  außerhalb der Sicherung und außerhalb des Exports.
- **„Nie über 5, nie unter 1" ist baulich wahr, nicht geklemmt** (seit 0.8.40).
  Ein **gewichteter Mittelwert** liegt bei positiven Gewichten immer zwischen
  dem kleinsten und dem größten gemittelten Wert. **Es gibt keinen Deckel, der
  vergessen werden könnte, weil es keinen Deckel gibt.** *Eine gewichtete
  **Summe** hätte einen gebraucht — und ein Deckel bei 5 ebnete jede
  Unterscheidung im oberen Bereich ein. Der Rechenweg ist die Entscheidung,
  nicht die Absicherung danach.*
- **Der Nenner summiert nur die Gewichte der BEWERTETEN Kriterien** (seit
  0.8.40). Das ist die eine Stelle, an der ein naheliegender Griff die ganze
  Zusicherung bricht: ein Nenner über *alle* Kriterien drückt einen Eintrag
  unter 1 (richtig **3,0**, falsch **0,1**). **Die Antwort darauf ist baulich,
  nicht sorgfältig:** das Gewicht reist an der Schnittzeile mit
  (`qSchnittJeKriterium` holt es per JOIN); Zähler und Nenner entstehen in
  **derselben** Schleife aus **derselben** Menge.
- **Die Gültigkeit steht an genau einer Stelle, und nicht im Schema** (seit
  0.8.40). `GEWICHT_MIN`, `GEWICHT_MAX` und `gueltigesGewicht()` stehen einmal in
  `server.js`; zwei Schreibwege führen darauf, die Oberfläche kennt die Spanne
  nicht. **Ein `CHECK` an der Spalte wäre eine dritte Stelle** — und er meldete
  sich als abgebrochene Schreibung statt als Absage mit Meldung. *Anders als das
  Gewichtungspapier annimmt, ließe SQLite ihn sich durchaus nachrüsten
  (Stolperstein 107). Der Grund ist ein anderer.*
- **Abgewiesen wird, was etwas anderes bedeutet — gerundet wird, was dasselbe
  bedeutet** (seit 0.8.40). Außerhalb von 0,2 bis 2 kommt eine Absage mit
  Meldung; feiner als ein Hundertstel wird gerundet, und **die Rundung ist nicht
  still**: das Feld zeigt danach den gespeicherten Wert. Das ist bewusst **nicht**
  dieselbe Haltung wie beim Bewertungswert, der zurechtgebogen wird — der kommt
  aus einem Sterne-Widget, das gar nichts anderes senden kann. **Ein leeres Feld
  ist keine Null:** `Number('')` ergibt 0, wer den Inhalt löscht, meint aber
  nicht „Gewicht 0".
- **Komma herein, Komma hinaus** (seit 0.8.40). Gelesen wird `1,2` und `1.2`,
  geschrieben wird immer mit Komma und **ohne nachlaufende Nullen**. Auch die
  Meldung des Servers trägt ein Komma.
- **Das Feld ist `type="text"` mit `inputmode="decimal"`, nicht
  `type="number"`** (seit 0.8.40). Drei Gründe, als Kommentar im Quelltext:
  `type="number"` nimmt das Komma nur bei passender Browsersprache an; bei einer
  Eingabe, die er für ungültig hält, liefert `input.value` einen **leeren
  String** statt dem, was sichtbar dasteht; und `inputmode="decimal"` bringt die
  Zahlentastatur aufs Handy, ohne einen dieser Nachteile.
- **`sort_order` und `gewicht` bleiben getrennt.** Das Gewicht aus der
  Reihenfolge abzuleiten wäre falsch: `renumberCriteria()` nummeriert lückenlos
  durch, ein neu eingeschobenes Kriterium verschöbe damit **still sämtliche
  Gewichte**. *Die Reihenfolge ist eine Aussage über die Anzeige, das Gewicht
  eine über die Rechnung.*
- **Das Gewicht wird angezeigt, und das ist kein Beiwerk** (seit 0.8.40). **Mit
  Gewichten ist der Zusammenhang zwischen Zeilenwerten und Kopfzahl
  grundsätzlich nicht mehr durch Mitteln nachvollziehbar** — ohne die Anzeige
  sähe die Kopfzahl schlicht falsch aus. `×1,5` steht an drei Orten, **nur bei
  Abweichung von 1**, und ist überall **abgeleitet**. **Das Wort „gewichtet" am
  Blockkopf leitet sich aus den BEWERTETEN Kriterien ab**, nicht aus allen.
- **Es sind und bleiben genau zwei Rechenstellen** (seit 0.8.40). Der Server
  rechnet den Schnitt über alle, der Klient den für die Stellung „meine" im
  Vergleich — und **beide sind gewichtet**. *Wer eine dritte anlegt — etwa in
  der Kachel der Übersicht —, bricht die Regel; die Kachel liest `avgRating` vom
  Server.*
- **Der Gesamtschnitt rechnet erst je Kriterium, dann über die Kriterien** (seit
  0.7.0). Nicht flach über alle Bewertungszeilen: flach zählt ein Kriterium, das
  drei Leute bewertet haben, dreifach gegen eines mit einer Stimme. **Gerundet
  wird genau einmal, am Ende** — je Kriterium vorzurunden wäre ein zweiter
  Rundungsort für dieselbe Zahl. *Der Preis: wer die angezeigten Zehntel von
  Hand mittelt, kann um bis zu 0,05 danebenliegen.* **Seit 0.8.40 bekommt der
  zweite Schritt Gewichte, der erste nicht**; bei Gewicht 1 überall ist es
  dasselbe, und die Sache ist vollständig umkehrbar.
- **Ein Bedienelement zeigt den Zustand, den es verändert** (seit 0.7.0). Die
  Sterne sind die eigene Bewertung, nie der Schnitt. Zeigten sie den Schnitt,
  spränge die Anzeige nach einem Klick auf den vierten Stern auf 3,6. Der
  Schnitt steht gedämpft rechts daneben, zusammen mit der **Zahl der Bewerter**:
  4,8 aus einer Stimme heißt etwas anderes als 4,8 aus zwanzig. *Verworfen:*
  Schnitt in den Sternen mit dem eigenen Wert in Klammern.
- **Die Sterne zeigen die eigene Zeile, der Schnitt bleibt über alle** (seit
  0.6.3). `it.ratings` filtert auf den Benutzer — ohne das vervielfacht der
  `LEFT JOIN` das Kriterium. Testkennzahlen und `usage_count` rechnen weiter
  über alle.
- **Die Durchschnittsspalte entfällt bei genau einem Zugang** (seit 0.7.0).
  „3,4 · 1" ist keine Information. Abgeleitet aus `benutzerZahl`, und **die
  Schwelle steht ausschließlich in der Oberfläche** (`mehrereBenutzer()`) — der
  Server liefert die Zahl und trifft keine Entscheidung darüber.
- **Der Rücksetzer heißt „Meine Bewertung zurücksetzen", immer** (seit 0.7.0).
  *Eine Beschriftung, die mit der Zahl der Zugänge umspringt, wäre eine zweite
  Wahrheit über denselben Knopf.*
- **Eigene Testtage sind gefüllt, fremde ein Ring** (seit 0.7.0). **Kein neuer
  Farbkanal** — Gold bleibt Gold, unterschieden wird über die Füllung. Die Linie
  der Verlaufskurve läuft weiter über alle: sie ist der Verlauf des Eintrags,
  nicht der einer Person. *Verworfen: ein Schalter „nur meine".*
- **Die Antwort nennt `mine`, nicht die Verfasser-Id** (seit 0.7.0). Eine nackte
  Id liest niemand. *Dasselbe Muster am Kommentar (0.8.3) und an der Stimme
  (0.8.2); daran hängen fünf Bedienelemente, und bei einem Grabstein ginge das
  Zurückrechnen aus dem Verfasserobjekt gar nicht.*
- **Der Verwendungszähler zählt nur vergebene Sterne** (Wert > 0) **und
  Einträge, nicht Bewertungszeilen** (berichtigt in 0.7.0). Bis dahin stand dort
  `COUNT(*)` über `ratings` — bei einem Benutzer ist Zeile gleich Eintrag, ab dem
  zweiten nicht mehr. Richtig ist `COUNT(DISTINCT r.item_id)`.
- **Nur Werte > 0 sind Stimmen** (seit 0.8.2). Eine zurückgesetzte Bewertung
  hinterlässt eine Zeile mit 0. **Das weicht bewusst von `zaehleBestand()` ab**,
  das ohne diese Bedingung zählt: dort lautet die Frage „was hängt an diesem
  Zugang", hier „was geht anderen verloren".
- **Kriterien werden im Systembereich angelegt, umbenannt, sortiert und
  gelöscht — und nur vom Admin** (seit 0.7.0, widerruft 0.5.8). Die frühere
  Begründung „folgenlos für bestehende Daten" war im Einbenutzerbetrieb richtig
  und **kippt mit dem zweiten Bewerter**: ein neues Kriterium erscheint **sofort
  an jedem Eintrag auf jedem Bildschirm**. Das schärfere Argument ist die
  Schieflage: darf jeder anlegen, kann jeder Unordnung erzeugen, die nur einer
  aufräumen kann — und das Aufräumen ist der zerstörerische Vorgang, der Sterne
  mitnimmt. **Anlegen und Aufräumen gehören an dieselbe Stelle.** *Verworfen:
  ein Antragswesen.* **Alle vier Wege liegen hinter derselben Klemme.**
  *Sortieren lag schon vorher dort: im Bewertungsblock liegt in derselben Zeile
  das Sterne-Widget mit Klick und Doppelklick, und eine Ziehschwelle daneben
  führt zu genau der Kollision aus Stolperstein 5.*
- **Wer welchen Wert vergeben hat, sieht nur der Admin** (seit 0.8.6). Nimmt den
  sichtbaren Teil der Stimmenliste aus 0.8.2 **ausdrücklich** zurück: die
  Sternzeile zeigt den **eigenen Wert und den Schnitt**, mehr soll eine Bewertung
  nicht aussagen. **Geliefert wird sie auch nicht mehr** — `detail()` hängt keine
  `stimmen` mehr an die Kriterienzeilen, sonst hinge die Regel daran, dass die
  Oberfläche mitspielt (Stolperstein 79). Der Knopf hängt an
  `ADMIN && mehrereBenutzer()`. *Verworfen: eine anonyme Werteliste — der Admin
  wüsste nicht, wessen Bewertung er entfernt.*
- **Eine fremde Bewertung wird gelöscht, nie geändert** (seit 0.8.2).
  `DELETE /api/ratings/:id` steht hinter `darfAendern`; ein `PUT` auf denselben
  Pfad entsteht ausdrücklich nicht. **Hier ist eine Klemme nötig, weil hier eine
  fremde Nummer in der Adresse steht.**
- **Wer eine Anzeige einschränkt, prüft zuerst, was an ihr hängt** (seit 0.8.6).
  Am ✕ der Stimmenliste hing der einzige Weg zu einer fremden Bewertung; wäre
  die Liste ersatzlos verschwunden, wäre der Endpunkt vom Bildschirm aus
  unerreichbar geworden. **Die neue Ansicht ist deshalb kein Zusatz, sondern die
  Bedingung.**
- **Die Zahlen für einen Löschdialog kommen aus einem Endpunkt, nicht aus dem
  geladenen Eintrag** (seit 0.8.2). Nur dort lassen sich eigene von fremden
  Beiträgen trennen.
- **„Fremd" im Löschdialog meint die Sicht des Löschenden** (seit 0.8.2). Löscht
  ein Admin einen fremden Eintrag, ist auch der Beitrag des Verfassers fremd.
  Verglichen wird mit `IS NOT`, nicht mit `!=` (Stolperstein 55).
- **Die Kennzahlen sieht nur der Admin** (seit 0.8.5). Nimmt „Die Kennzahlen
  selbst sieht weiterhin jeder" aus 0.7.2 **ausdrücklich zurück**: sie sind eine
  Aussage über die **Anlage als Ganzes**. **Der Schlüsselwert im selben Rumpf
  bleibt eine zweite, engere Klemme** am Eigentümer; die beiden wurden
  ausdrücklich nicht zusammengelegt.
- **Wer einen Testtag einträgt, dem gehört die Zeile** (seit 0.6.1). *Löschen*
  darf der Admin, *Ändern* nicht — die Note **ist** die Aussage dieser Zeile,
  genau wie eine Bewertung. **Dieselbe Regel gilt für die Tags am Testtag.**
- **Kriterienreihenfolge wird gepflegt, nicht abgeleitet.** Keine alphabetische
  Sortierung, keine Sortierung nach Häufigkeit — **die Reihenfolge ist eine
  Aussage darüber, was zuerst zählt**, und steht als `sort_order` in der
  Datenbank. Detailansicht und Vergleich lesen dieselbe Sortierung; im Vergleich
  fällt das oberste Kriterium zuerst ins Auge.

### 5.6 Anzeige und Bedienung

#### Farbe und Marke

- **Gold ist Bewertung und Anheftung, Orange ist Art und Bedienung.** Sonst
  verschwimmt die Bewertung mit der Signalfarbe. *Klarstellung: der frühere
  Wortlaut „Sterne in Gold, Bedienelemente in Orange" war schon damals ungenau —
  der Anheftungspunkt an den Übersichtskarten und der Pin-Knopf sind seit jeher
  gold; 0.5.5 hat es an den Kommentaren nachgezogen.*
- **Rot bleibt dem Zerstören vorbehalten** — Löschkreuz, Löschknopf,
  „Abgelehnt"-Marke, `on-red`-Schalter. Es taugt deshalb nicht als
  Hervorhebung: eine rot markierte Zeile liest sich als beanstandet, nicht als
  wichtig. Dazu liegen Rot und Orange auf Dunkel ohnehin zu dicht beieinander.
- **„Abgelehnt" wird optisch zurückgenommen** (entsättigt, abgedunkelt) statt
  über Rot. Nicht abgelehnte Einträge zeigen gar nichts.
- **Der Knopf trägt die Farbe der Kante, die er setzt** (seit 0.8.3).
  Klarstellung zu „Orange ist Art und Bedienung", keine Rücknahme: die **Art**
  hat drei Farben — Orange für den Bericht, Blau für die Aufgabe, Grün für
  erledigt —, und der eingeschaltete Knopf zeigt jeweils dieselbe.
- **Der Favoritenknopf bleibt orange, der Stern gold** (seit 0.6.6) — ein
  Filterknopf ist Bedienung.

> #### Die Marke trug Gold — ZURÜCKGENOMMEN mit 0.11.0
>
> **DIESER ABSCHNITT IST UMGESCHRIEBEN UND NICHT GELÖSCHT.** Eine
> zurückgenommene Entscheidung mit dem Grund daneben ist mehr wert als eine
> verschwundene.
>
> **Was in 0.10.0 entschieden war.** Der hervorgehobene Strich in
> `marke-dunkel.svg` und `favicon.svg` war `#ffc531` — **genau `--gold`**, seit
> jeher der zweite Signalwert der Anlage neben `--accent`. Die Frage stand als
> Berichtigung im Auftrag zu 0.10.0 („die Marke läuft aus der Farbwelt"); beim
> Nachsehen war sie **keine**. Entschieden war: Gold bleibt — *`--accent` ist
> die Farbe der **Handlung**, und eine Marke ist keine Handlung.*
>
> **Warum das nicht trägt.** Die Entscheidung fiel **am Papier**. An der
> laufenden Anlage gesehen, stehen in der Kopfzeile **zwei warme Farben
> nebeneinander, die nichts voneinander wissen**: der Strich in Gold, der Knopf
> „+ Maschine" eine Handbreit daneben in `--accent`. **Es ist keine Rangfolge,
> wenn beide gleichzeitig im Blick liegen — es sind zwei Töne, die sich
> streiten. Eine Farbe ist besser als zwei.**
>
> **Der Satz, der stehen bleibt: Gold ist die Farbe der Bewertung.** Er gilt
> weiter — für die Sterne, für die Punkte der Zeitleiste, für das Anheften.
> **Der Satz, der ihn schlägt: die Marke ist nicht die Bewertung — sie ist die
> Anlage.** Und die Anlage spricht in `--accent`.
>
> **Entschieden ist mit 0.11.0: der Strich trägt `--accent`**, in beiden
> Dateien. *Wer das je wieder ändert, ändert eine Aussage über die Anlage und
> nicht eine Farbe — und sollte es an der laufenden Anlage ansehen und nicht am
> Papier.*

- **Die Marke steht so hoch wie der Text daneben, und die Zahl ist
  ausgerechnet** (seit 0.11.0). `MARK(32)` stand neben einem Stapel aus `h1`
  (1,23 rem) und `.count` (0,77 rem); beide erben die Zeilenhöhe **1,55** des
  `body`, der Stapel misst also **3,10 rem**. Der gezeichnete Strich lief
  dagegen nur über **23 von 32** Einheiten des `viewBox` — nicht 20, wie die
  Pfadangaben nahelegen: bei `stroke-width: 3` und `stroke-linecap: round` trägt
  die Farbe eine halbe Strichbreite über jedes Ende hinaus. **Sichtbar waren
  23 px gegen 46,5 px — die halbe Höhe, und genau das sieht man.**

  **Entschieden: das `viewBox` der durchsichtigen Fassung umschließt die Farbe**
  (`6.5 4.5 19 23`). **`favicon.svg` behält dagegen sein Quadrat samt Kachel** —
  es ist ein **Kachelsymbol**, 72 Prozent Füllung sind dort der übliche
  Schutzbereich, und ein enges `viewBox` schnitte die Kachel an. **Und die Größe
  steht im Stylesheet, in `rem`, nicht in den Attributen** — die Anlage stellt
  die Schrift von 80 bis 120 Prozent. *Die Anmeldeseite ist damit
  mitentschieden und nicht mitgeschleift.*

#### Bilder, Videos und Blöcke

- **Erstes Foto ist das Hauptbild.** Kein separater Schalter; Reihenfolge per
  Ziehen, mit Maus und Finger (Pointer-Events, nicht HTML5-Drag). **Seit 0.8.50
  heißt „Foto" hier „erstes Element"** — steht ein Video vorn, ist sein
  Standbild das Hauptbild.
- **Der Fokuspunkt schneidet nichts weg.** Zwei Prozentwerte verschieben nur das
  sichtbare Fenster der quadratischen Vorschau (`object-position`); die Datei
  bleibt unangetastet. *Ein einmal weggeschnittener Bildrand wäre
  unwiederbringlich, ein Prozentwert ist jederzeit korrigierbar.*
- **Vom Kommentarbild wird kein Original aufbewahrt.** Gespeichert wird die
  verkleinerte Variante samt Kachel.
- **Kommentarbilder liegen in einer eigenen Tabelle**, nicht in `attachments`
  mit einer Zusatzspalte. Ein Anhang gehört dem Eintrag, ein Kommentarbild dem
  Kommentar und geht mit ihm. *Zwei Tabellen sind ehrlicher als eine mit
  Sonderfällen.*
- **Blöcke wandern nur innerhalb ihres Bereichs.** Kommentare in der schmalen
  Spalte oder eine Kategorieauswahl über die volle Breite wären schlechter als
  jede Vorgabe. Deshalb zwei getrennte Listen, kein gemeinsamer Topf.
- **Anordnung und Einklappzustand gelten global**, nicht je Eintrag.
- **Ein Block hat genau eine Stelle für seine Zahlen** (seit 0.8.4).
  `.block-head` trägt zwei mögliche: die Kurzfassung `.bsumme` (nur eingeklappt)
  und einen freien Hinweis (immer sichtbar). Wer einem Block beide gibt, zeigt
  eingeklappt zweimal dasselbe; eine leere Kurzfassung erzeugt „()".
- **Die Zahlen am Kommentarblock nennen Teilmengen, keine Summanden** (seit
  0.8.4): „12 Kommentare, davon 3 Berichte und 5 Aufgaben (2 Erledigt)". Die
  Klammer nistet die zweite Ebene ein — das Erledigte steckt **in** den
  Aufgaben, sonst schrumpfte die Zahl beim Abhaken. Die **Notiz** bleibt
  ungenannt (sie ist der Zustand ohne Markierung), die **Anpinnung** steht nicht
  in der Zeile (zweite, unabhängige Achse). **Derselbe volle Satz auch
  eingeklappt** — bewusste Abweichung von Links und Dateien.
- **Eine eingeklappte Wolke ist nicht messbar, und dagegen braucht es zwei
  Wege** (seit 0.8.3). `begrenzeWolke()` bricht bei Höhe null **absichtlich** ab
  **und** das Aufklappen zeichnet die Wolke neu. Beide sind nötig und decken
  einander nicht zu.
- **Eine Liste wird abgeschnitten, nicht scrollbar** (seit 0.8.6). Ein eigener
  Bildlauf fängt auf dem Finger die Wischbewegung ab. Der Weg zum Rest ist der
  Aufklappknopf. *Verworfen: eine Haltezeit wie beim Ziehen — beim Scrollen
  unüblich.*
- **Eine breite Karte im Raster braucht `grid-auto-flow: dense`, keine feste
  Position** (seit 0.8.6). Wie viele Karten in eine Zeile passen, hängt an der
  Fensterbreite, wie viele es gibt, an der Rolle. **Die Reihenfolge im Quelltext
  bleibt, wie sie ist.**
- **Auf dem Finger wird erst nach Halten gezogen** (0,4 s), mit der Maus sofort.
  **Kein `touch-action: none`** auf sortierbaren Listen — genau das hat vorher
  das Scrollen unmöglich gemacht.
- **Mitwachsende Felder haben keinen Ziehgriff** (`resize: none`). Beides
  zusammen widerspricht sich. Ohne Obergrenze — das Feld zeigt immer den ganzen
  Text.
- **Zeilenaktionen sind überall Zeichen**, nicht mal Text und mal Zeichen: `✎`
  bearbeiten, `✕` löschen.
- **Zeilen tun das Naheliegende, wenn man sie anklickt.** Links öffnen, Dateien
  ansehen oder herunterladen. Ausgenommen bleiben nur ✕ und Ladepfeil.
- **Schriftgröße hängt an genau einem Wert**, dem Grundmaß am Wurzelelement.
  Alle Schriftgrößen sind `rem`, alle Layoutmaße bleiben in Pixeln — zwei
  Ausnahmen, weil sie ausschließlich Text fassen.
- **Die Anmeldeseite bleibt bei der Vorgabegröße.** Der Endpunkt vor der
  Anmeldung liefert nur den öffentlichen Titel.

#### Kommentare, Tags und Filter

- **Anpinnen schlägt die Art.** Ein angepinnter Kommentar steht ganz oben,
  gleich welcher Art. Der Block der Angepinnten bleibt dabei **einer**: dort
  entscheidet allein das Alter.
- **Innerhalb jeder Gruppe steht das Älteste oben** (seit 0.5.2). Sortiert wird
  nach `id`, nicht nach `created_at`: innerhalb eines Eintrags stimmen beide
  immer überein, und der Wert in `created_at` kommt ungeprüft aus der Datei und
  hat nur Sekundenauflösung. *Bis 0.5.1 liefen Angepinnte und Berichte
  umgekehrt; zwei Blöcke mit gegenläufiger Zeitrichtung lasen sich schlechter
  als der Gewinn wert war.*
- **Ein Bericht ist an keinen Testtag gebunden.** Er fasst meist mehrere
  zusammen, jede Zuordnung wäre willkürlich.
- **Ein Merkmal umzuschalten ist keine Bearbeitung.** Es setzt kein
  „bearbeitet" — sonst stünde das an jedem angepinnten Kommentar.
- **Ein Kommentar braucht Text, auch wenn er Bilder hat.** Ein Beitrag, der nur
  aus einem Bild besteht, ist im Verlauf nicht wiederzufinden.
- **Kommentartext kommt nie über `innerHTML` in die Seite** (seit 0.5.4).
  `.cmt-body` wird mit echten Knoten gefüllt: `createTextNode()` für Text,
  `createElement('a')` mit `textContent` und `href` für Links. **Damit ist
  Maskierung nicht „nicht vergessen worden", sondern baulich unmöglich.** Die
  Zerlegung arbeitet auf dem **Rohtext**, nicht auf maskiertem.
- **Als Link im Kommentartext gilt nur ausdrücklich Geschriebenes**: `http://`,
  `https://` und `www.`. Ein blankes `beispiel.de` ausdrücklich **nicht** —
  anders als in der Linkliste. *Deutscher Fließtext ist voll von „z.B." und
  „usw.".* Angezeigt wird die Adresse **vollständig**; nachlaufende Satzzeichen
  gehören nicht dazu, eine schließende Klammer bleibt nur bei unpaariger
  öffnender.
- **Kein Schalter für die Kommentarlinks im Systembereich.** War überlegt und
  verworfen: anklickbare Links sind keine Geschmacksfrage.
- **Der Eingriffsvermerk am Kommentar ist die einzige Ausnahme von „kein
  Änderungsverlauf"** (seit 0.8.3). Er ist eine Aussage über den *jetzigen*
  Zustand: kein Wer, kein Wann, keine Kette. Hochgezählt **nur**, wenn ein
  anderer als der Verfasser ein Bild entfernt. **Nie im Textfeld** — dort täte
  der Admin genau das, was ihm verwehrt ist. Nicht zurücksetzbar, **nicht im
  Export**. **Seit 0.8.4 nennt der Satz die Rolle** („2 Bilder vom Admin
  entfernt") — ohne eigenes Feld: wer beide Klemmen passiert, kann nur der Admin
  sein, und eine Prüfung bindet die Beschriftung daran. **Der Vermerk bleibt für
  alle Leser sichtbar** — das Loch ist für jeden da, und ein Vermerk, den nur
  einer sieht, wäre eine Benachrichtigung.
- **`updated_at` ist eine Aussage über den Verfasser** (seit 0.8.4). Anhängen
  ist Bearbeiten, also ist Entfernen es auch — beides setzt „bearbeitet", aber
  **nur, wenn der Verfasser selbst** es tut. An `DELETE /api/comment-images/:id`
  gilt genau eines von beiden (ein `if`/`else` um dieselbe Bedingung). **Ein Ruf
  ohne Datei setzt ebenfalls nichts.**
- **Anhängen ist Bearbeiten** (seit 0.8.3). „+ Bild" bekommt **keine eigene
  Klemme**: es steht ausschließlich im Bearbeitenmodus und fällt mit ✎ baulich
  weg; eine zweite Klemme daneben ließe sich nicht gegenprüfen.
- **Jeder Kommentar sagt, ob er mir gehört** (seit 0.8.3), und **der Bildschirm
  bietet nicht an, was der Server abweist**: ✎ und „+ Bild" nur der Verfasser,
  ✕ am Kommentar, ✕ am Bild und die drei Marken bei Verfasser oder Admin. *Ein
  Knopf, der zuverlässig eine Fehlermeldung erzeugt, sieht aus wie ein Fehler.*
- **Tags werden mit UND verknüpft, nicht mit ODER.** Bei zwei Tags will man fast
  immer den Schnitt. Der Umschalter macht die Verknüpfung sichtbar — ohne ihn
  wäre ein leeres Ergebnis nach dem zweiten Klick rätselhaft. *Bis Version 4.4
  war ODER fest verdrahtet, ohne dass es je eine Entscheidung dafür gegeben
  hätte.*
- **Aussichtslose Tags werden gedämpft, nicht gesperrt.** *Eine gesperrte Marke
  erklärt nichts, eine gedämpfte lädt zum Ausprobieren ein.* **Gewählte Tags
  sind davon ausgenommen.**
- **Der Filter greift nur Tags am Eintrag ab.** Tags, die ausschließlich an
  Testtagen hängen, erscheinen gar nicht erst in der Filterwolke. Die Suche
  findet sie trotzdem, und die Tagverwaltung zählt beide Verwendungen getrennt.
- **Der Aufklappzustand der Tagwolken bleibt im Speicher**, nicht auf dem
  Server. Dasselbe gilt für den Umschalter der Vergleichsansicht (seit 0.8.4) —
  Ansichtszustand, keine Einstellung. **Vorgabestellung „alle"**, und
  **Kriterienwerte, Kopfzahl und Testtagzeile schalten gemeinsam**; bei genau
  einem Zugang erscheint er nicht.
- **Tags und Kategorien: anlegen darf jeder — abschaltbar** (seit 0.8.4). Zwei
  globale Schalter, Vorgabe an, als **Ableitung beim Lesen** — kein
  Migrationscode. Aus heißt ausschließlich: die Zeile „+ neu anlegen"
  verschwindet, die Auswahl aus dem Vorhandenen bleibt. **Zuweisen darf immer
  jeder** — die Klemme sitzt *hinter* dem Nachschlagen des vorhandenen Namens.
  **Der Admin kommt immer durch.** **Der Sonderfall am Testtag:** dort gibt es
  keine Wolke, die Eingabe ist der einzige Zuweisungsweg und bleibt stehen; ein
  unbekannter Name wird mit sprechender Meldung abgewiesen.
- **Die Zeitleiste trägt die Note als Höhe.** Ein flaches Band hätte Punkte
  desselben Tages übereinandergelegt. Punkte in Gold, weil sie Bewertungen sind.
- **Der Favoritenfilter ist ein eigener Umschalter, kein vierter Teststatus**
  (seit 0.6.6). Die drei Knöpfe „Alles / Getestet / Ungetestet" sind drei
  Zustände **eines** Merkmals; der Favorit muss sich mit jedem kombinieren
  lassen. Er steht deshalb abgesetzt (`.pill-sep`).
- **Ein Favorit sortiert nicht vor** (seit 0.6.6). Bis 0.6.5 zog eine Zeile alle
  Favoriten vor **jede** eingestellte Sortierung. *Der Favorit ist persönlich
  und darf die gemeinsame Liste nicht umsortieren.* **Wer seine Favoriten
  sammeln will, nimmt den Filter.**
- **Zwei Filter sind zwei Filter, kein zweiter Sortierweg** (seit 0.8.60). Die
  Übersicht sortiert nach `updated_at`, für alle gleich; **die Liste zeigt, wo
  etwas geschieht, nicht wo *ich* zuletzt war.** *Eine Vorsortierung des Neuen
  wäre genau die Bauform, an der der Favorit 2020 gescheitert ist — und sie
  fällt nur an der **ungefilterten** Liste auf (Stolperstein 114).* **Wer
  künftig eine persönliche Ansicht baut, baut einen Filter.**
- **Der Merkzeitpunkt kommt von der Serveruhr und wird um eine Sekunde
  nachgestellt** (seit 0.8.60). Was der Aufrufer schickt, ist ein **Signal**,
  keine Feststellung. Und die Sekunde zurück ist keine Feinheit:
  `datetime('now')` löst nur Sekunden auf. *Lieber einen Eintrag zweimal zeigen
  als einen verschlucken.*
- **Der Merkzeitpunkt wird beim VERLASSEN gesetzt, gelesen einmal je
  Seitenleben** (seit 0.8.60). Beim Betreten gesetzt wäre „neu seit" immer leer;
  bei jeder Rückkehr nachgezogen verlöre man sechs von sieben Neuen beim ersten
  Klick. **Ein Besuch ist eine Sitzung am Bildschirm, kein Wechsel der Ansicht.**
- **Der Haken in der Ansicht „Offen" ist ein Zustand, keine Weiterschaltung**
  (seit 0.8.60). Er schickt `kind: 'done'` bzw. `'task'` ausdrücklich;
  `aufgabeWeiter()` macht dagegen aus einer erledigten Aufgabe eine **Notiz**.
  *Zwei Bedienelemente, zwei Bedeutungen.*
- **Der Erledigt-Haken am fremden Aufgabenkommentar bleibt bei „Verfasser oder
  Admin"** (bestätigt in 0.8.60). „Löschen ja, umschreiben nein" gilt
  **Aussagen**; ein Haken ändert keine Aussage, er setzt ein Merkmal.
- **Die Bedingung „nicht erledigt" heißt `kind = 'task'`, an beiden Stellen**
  (seit 0.8.60). `kind != 'done'` wäre falsch — es nähme Notizen und Berichte
  mit. *Zwei Schreibweisen für dieselbe Frage laufen auseinander.*
- **Das Merkmal am Eintrag heißt Favorit, das am Kommentar Anheftung** (seit
  0.6.6). Bis dahin hieß beides „Anheftung", obwohl es zwei verschiedene Dinge
  sind; Datenbank und Schnittstelle sagten mit `favorite` ohnehin schon
  „Favorit". **Der Tabellenname `item_pins` wandert nicht mit**, aus demselben
  Grund wie `katalog.sqlite`. *Wer künftig „Anheften" im Quelltext ersetzt, muss
  die Kommentare auslassen; ein Wächter im Prüfstand hält das fest.*
- **Die Ansicht „Offen" ist lesend und braucht keinen Wächter** (seit 0.8.60):
  wer angemeldet ist, sieht die Kommentare ohnehin in jedem Eintrag. Sie steht
  deshalb **nicht** in `F_ROUTEN`, und der Erledigt-Haken geht über
  `PUT /api/comments/:id`.
#### Links, Suchzeilen und Suchanbieter

- **Keine Favicons bei den Links.** Sie würden von fremden Servern nachgeladen
  und brächen das Offline-Prinzip. Stattdessen Domain als Text.
- **Links: nur Adresse, keine Bezeichnung, keine Gruppen.** Bewusst verworfen.
- **Eine Suchzeile speichert den Rohtext, nie eine fertige Suchadresse** (seit
  0.5.3). Sonst stünde ein Suchanbieter für immer in den Daten, und ein
  Anbieterwechsel wirkte nur auf neue Zeilen.
- **Adresse oder Suchtext wird am fehlenden Schema erkannt**, nicht an einer
  eigenen Spalte. **Keine Liste echter Endungen** — sie wäre pflegebedürftig und
  trotzdem lückenhaft. *Der Preis ist ein seltener Fehlgriff wie `v2.beta`.*
  IP-Nummern und `rechnername:port` gelten ausdrücklich als Adresse; **das hier
  ist ein Heimnetzwerkzeug.**
- **Die Suchvorlage darf nur `http://` und `https://` sein und muss `%s`
  enthalten** — geprüft im Server **und** in der Oberfläche. `http://` ist
  zugelassen, weil ein Suchdienst im eigenen Netz oft keins hat. **Fällt eine in
  der Oberfläche durch, wird dieser Anbieter weggelassen** und nicht still durch
  einen anderen ersetzt: *eine Zeile, die „Modellforum" anschreibt und Google
  öffnet, wäre schlimmer als eine Zeile, die nichts tut.*
- **`sucheAktiv[0]` ist die einzige Wahrheit darüber, wer Startanbieter ist**
  (seit 0.5.11). Die alte Einstellung `suche` wird zwar weiter mitgeschrieben,
  aber **nie wieder gelesen**. **Die Anbieterliste liegt im Server**, nicht in
  `app.js`.
- **Der Schlüssel eines eigenen Anbieters hängt am Platz, nicht am Namen**
  (`eigen1` bis `eigen3`). Sonst verlöre ein Umbenennen den Vorrat.
- **Ein eigener Anbieter zählt nur mit Name *und* Vorlage.** Halb ausgefüllt
  gibt es ihn nicht — weder im Vorrat noch in der Auswahl.
- **Den letzten Anbieter aus der Auswahl zu nehmen, wird abgesagt** statt
  ersatzweise auf Google zu wechseln.
- **Vorrat und Startanbieter gehören dem Admin, die Zahl der Namen dem
  Benutzer.** *Der Admin kuratiert, der Benutzer bestimmt die Dichte.*
- **Der Startanbieter steht immer vorn — und sieht aus wie alle anderen.** Eine
  zusätzliche Hervorhebung wurde verworfen: jeder Name bedeutet genau dasselbe.
- **Höchstens vier Namen unter einer Suchzeile, Name höchstens 20 Zeichen.**
  Eine Handy-Entscheidung. **Kein Vorspann vor den Anbieternamen** (seit
  0.5.11) — bei mehreren Namen bedeutete der erste Trenner sonst etwas anderes
  als der zweite.

#### Systembereich

- **Was verschwindet, sind die Karten, nicht die Daten** (seit 0.8.5). Das
  Vokabular **ist** jede Beschriftung, der interne Titel steht in der Kopfzeile —
  beide werden auch an einen gewöhnlichen Benutzer ausgeliefert. *„Ansicht für
  Vokabular und Titel gar nicht" lässt sich nicht wörtlich einlösen.*
- **Wer nicht verwalten darf, darf trotzdem nachsehen** (seit 0.8.5). Weg sind
  nur Griff, ✎ und ✕. *Die Namen sind die Auswahl, aus der jeder am Eintrag
  schöpft.*
- **Drei Karten sind Selbstbezug und hängen an keiner Rolle** (seit 0.8.5):
  „Zugang", „Darstellung" und „Links". *Alles persönlich, alles geht niemanden
  sonst etwas an.* **„Meine Sitzungen" ist seit 0.8.80 die vierte.**
- **Die Karte „Links" ist in zwei geschnitten** (seit 0.8.5). Sie mischte als
  einzige Persönliches mit Adminsachen; der Schnitt folgt genau der Trennung,
  die der Server seit 0.6.5 hält.
- **Eine Karte, die an einer Rolle hängt, nimmt ihre Behandler mit** (seit
  0.8.5). Ein Behandler an einem Element, das es nicht gibt, wirft **nach** dem
  Setzen von `app.innerHTML` — halb gezeichneter Bildschirm, keine Meldung.
  **Ein Ort für die Frage (`amElement()`), nicht zehn.**
- **Wer eine Ansicht ergänzt, holt ihren Bestand beim Aufbau** (seit 0.8.70).
  `renderSystem()` hängt die Abrufe in EIN `Promise.all`, jeder hinter der
  Rolle, hinter der auch seine Karte steht. *Ein Nachladen aus der Karte heraus
  läuft als herrenlose Zusage weiter, wenn das Fenster längst zu ist
  (Stolperstein 118).* **Der Abruf ist bedingt und nicht mit einem `catch`
  abgesichert** — ein `catch` wäre eine zweite Schicht und verdeckte die erste
  in jeder Gegenprobe.
- **„Angemeldet als" steht auch bei einem einzigen Zugang** (seit 0.8.6). Das
  unterscheidet die Angabe von allem, was `mehrereBenutzer()` verbirgt: dort
  geht es immer um **andere**, hier um einen selbst.
- **„Angelegt von" nennt auch das Datum** (seit 0.8.6), in derselben Form wie
  die Kopfzeile eines Kommentars. Bei genau einem Zugang bleibt die **ganze
  Zeile** weg.
- **Der Verfasser kommt als Objekt, nicht als Name** (seit 0.8.2).
  `verfasser: { id, name, geloescht }`; die nackte `user_id` steht in keiner
  Antwort mehr. Ein Objekt, weil ein Grabstein keinen Namen mehr hat und die
  Beschriftung aus der **Nummer** entsteht. **Das Feld heißt ausdrücklich nicht
  `author` wie im Export** — dort ist es ein blanker String. *Verworfen: ein
  Endpunkt `GET /api/verfasser` — er legte die vollständige Zugangsliste jedem
  offen.*
- **Der Grabsteinname verlässt den Server nicht** (seit 0.8.2). `geloescht-<zahl>`
  ist **freigegeben** und kann längst einem anderen Menschen gehören. **Was nicht
  angezeigt werden darf, wird nicht geliefert.** *Beim Bauen war das zuerst
  falsch.*
- **Die Beschriftung „Gelöschter Benutzer 7" entsteht an genau einem Ort** (seit
  0.8.2): `verfasserName()` in `public/app.js`; die Karte „Zugänge" ruft
  dieselbe Funktion.
- **Kein Geschlechtsfeld beim Vokabular.** Stattdessen sind alle Texte so
  geschrieben, dass weder Beiwort noch Fall vorkommt: *sicher* ist Plural im
  Nominativ und Akkusativ und Einzahl ohne Begleiter; *unsicher* ist Dativ
  Plural (der ein -n anhängt) und jede Einzahl mit Artikel oder Beiwort. **Die
  Oberfläche wird dadurch knapper und etwas amtlicher — das ist der bewusst
  gezahlte Preis.**
- **Jedes Vokabelwort in `innerHTML` braucht `esc()`** — es ist Eingabe aus dem
  Systembereich, keine Konstante.

### 5.7 Auslieferung, Netz und Werkzeuge

- **Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung**
  (seit 0.8.20). Er darf nur geglaubt werden, wo ausdrücklich eingestellt ist,
  wer ihn setzen darf. Gilt für `X-Forwarded-For` — dort gebaut als
  `HINTER_PROXY` — und unverändert für den `Host`-Kopf: **die öffentliche
  Adresse ist eine Einstellung, niemals der `Host`-Kopf.** *Wer künftig einen
  weiteren Kopf auswertet, stellt zuerst diese Frage.* **Dieselbe Regel greift
  am Merkzeitpunkt von „Neu seit …"** — auch dort ist die mitgeschickte Zeit
  eine Behauptung.
- **Der ausgelieferte Typ kommt nie aus der Datenbank** (seit 0.8.20). Er kommt
  aus der Endung (`anhaenge.js`, `ausgabeTyp`) oder aus den ersten Bytes
  (`typAusBytes`) — nie aus einer Spalte, die der Hochladende gefüllt hat.
  `photos.mime_type` und `attachments.mime_type` bleiben stehen und werden
  angezeigt; **sie sind eine Anzeige, keine Ausliefergrundlage.** **Dagegen hilft
  kein Merksatz, sondern ein Wächter im Prüfstand:** keine Zeile in `server.js`
  setzt den Content-Type selbst. **Er hat in 0.8.50 gehalten**, und er hat seit
  0.8.50 eine Gegenprobe neben sich.
- **`ffmpeg` kommt nicht ins Image** (seit 0.8.50), und keine andere neue
  Abhängigkeit. Das Standbild erzeugt der **Browser des Hochladenden** über
  `<video>` und `<canvas>`. Daraus folgt: **der Server öffnet nie ein Video** —
  er liest zwölf Bytes für die Typerkennung, speichert den Rest und liefert ihn
  wieder aus; die gesamte Klasse von Verwundbarkeiten in Videobibliotheken
  entfällt, weil keine im Spiel ist. Und: **wer ein Video nicht abspielen kann,
  kann es nicht hochladen** — *ein Videoplatz, der nicht abspielt, ist ein
  kaputter Platz.* **Wer später einen Umkodierer vorschlägt, verhandelt eine
  neue Abhängigkeit von der Größe des halben Images.**
- **Das Standbild belegt nichts** (seit 0.8.50). Ein manipulierter Browser
  könnte eines schicken, das nicht zum Video gehört. Das ist hinnehmbar — es ist
  eine Vorschau, keine Aussage —, und es steht hier wie im Quelltext, **damit es
  niemand später für einen Beleg hält.**
- **Videos werden in Ranges ausgeliefert, Fotos nicht** (seit 0.8.50). Der Grund
  ist nicht die Größe, sondern die Bedienung: ohne Ranges kann der Browser nicht
  springen, und manche Abspieler beginnen gar nicht erst. Ungültiges wird mit
  **416** beantwortet, nicht stillschweigend zurechtgebogen. **An der
  Auslieferung eines Fotos ändert sich dadurch kein einziger Header.**
- **Fotos und Videos stehen in EINER Tabelle** (seit 0.8.50). Zwei Tabellen
  hießen zwei sortierte Listen und damit **zwei Quellen** für die Frage, was an
  erster Stelle steht. Aus der einen Tabelle folgt, dass jede vorhandene Regel
  von selbst greift. **Nichts davon darf je eine Ausnahme bekommen.** Was NICHT
  von selbst greift, ist genau dreierlei und ist gebaut: Löschdialog, Kennzahlen
  und die Auslieferung. **Wer künftig eine Abfrage auf `photos` schreibt,
  entscheidet ausdrücklich, ob sie beide Arten meint.**
- **„Sicherung", nicht „Backup"** (seit 0.8.70). Beide Wörter sind gebräuchlich;
  zwei für dieselbe Sache sind genau das, was die Sprachregel verhindern soll.
  **Nicht** in der Wortliste des Sprachwächters — das hier ist keine
  Übersetzung, sondern eine Wahl zwischen zwei deutschen Wendungen —, sondern
  ein eigener, enger Wächter.
- **Gegenproben laufen über einen Treiber, nicht von Hand** (seit 0.8.91).
  `gegenprobe.js` kennt seine Rückbauten als Liste ganz oben — dieselbe Bauform
  wie `F_ROUTEN`: **die Liste ist die Entscheidung.** Jeder Rückbau läuft in
  einer eigenen Kopie aus `git archive HEAD` (atomar gegen den Arbeitsbaum,
  Stolperstein 100), aufgeräumt wird über `/proc/<pid>/cwd` (Stolperstein 133),
  es gibt eine **Zeitgrenze je Rückbau** (Stolperstein 146) — und **ein Rückbau,
  der keine einzige Prüfung rot macht, ist ein FUND.** **Er läuft nicht in
  `npm test` mit.**

  **`PORT_VERSATZ` erlaubt Nebenspuren, und die Zahl ist ausgerechnet, nicht
  geschätzt:** der Versatz von **3000** je Spur ist größer als die Spanne aller
  Basen samt Breite, und keine der entstehenden Nummern liegt auf der Sperrliste
  von `fetch()`. **Ein Wächter am Ende jedes Laufs rechnet es nach** — und ein
  zweiter hält fest, dass keine Prüflage ihren Server zurücklässt.

---

## 5a. Die Sicherheitsregel für ausgelieferte Dateien

**Keine gespeicherte Datei darf jemals so ausgeliefert werden, dass der
Browser sie als Webseite ausführt.** Das ist die einzige Regel in diesem
Projekt, bei der ein Fehler nicht bloß ärgerlich wäre. Alles in `anhaenge.js`
dient ihr. **Seit 0.8.20 gilt sie ausdrücklich auch am Fotoweg** — dort hielt
sie sich zuvor an keinen ihrer eigenen Punkte (unten, „Der Fotoweg").

Sieben Schichten, damit kein einzelner Fehler genügt:

1. **Der gemeldete Typ des Hochladenden wird nie ausgeliefert.** Gespeichert
   und angezeigt ja, ausgeliefert nie. Was rausgeht, bestimmt eine eigene Liste
   anhand der Endung.
2. **Alles Unbekannte wird `application/octet-stream`.** Die Liste enthält
   absichtlich kein HTML, XHTML, XML oder SVG.
3. **`Content-Disposition: attachment` ist die Vorgabe**, `inline` nur für
   Bilder und PDF und nur auf ausdrückliche Anforderung.
4. **`X-Content-Type-Options: nosniff`**, zusätzlich für die ganze Anwendung.
5. **`Content-Security-Policy: default-src 'none'; sandbox`** auf jeder
   Anlagen-Antwort.
6. **Der Dateiname wird für der Header entschärft.** Zeilenumbrüche und
   Anführungszeichen raus, Umlaute über `filename*=UTF-8''`.
7. **Text wird nie als Datei ausgeliefert**, sondern gelesen und als JSON
   geschickt; die Oberfläche setzt ihn mit `textContent` in die Seite.

**Achte Schicht, seit 0.8.20: der Typ aus den ersten Bytes.** Wo kein
Dateiname mitgeführt wird — bei den Fotos **und Videos** —, entscheidet der
**Inhalt** (`typAusBytes`). Erkannt wird nur, was auch eingebettet werden darf:
JPEG, PNG, GIF, WebP, AVIF, TIFF, BMP — **seit 0.8.50 dazu `video/mp4`,
`video/webm` und `video/quicktime`**. MP4, M4V und MOV sind ISO-BMFF und
tragen `ftyp` an Byte 4; erkannt werden nur Marken auf einer Positivliste
(`isom`, `iso2`, `mp41`, `mp42`, `avc1`, `M4V `, `qt  ` und einige mehr), WebM
am EBML-Kopf `1A 45 DF A3`. **An echten Dateien nachgestellt, nicht geglaubt.**
Eine unbekannte ISO-Marke — darunter die Bildformate `heic` und `mif1` —
bleibt bewusst unerkannt und geht als Download heraus. Alles Übrige bleibt bewusst unerkannt und
geht als `application/octet-stream` mit `attachment` heraus. Eine SVG ist Text
und beginnt mit nichts Festem — sie fällt heraus, und genau das ist die
gewünschte Antwort.

**Neunte Schicht, seit 0.8.20: die Anwendung selbst hat eine
`Content-Security-Policy`.** Auf jeder Antwort, neben dem `nosniff`:

```
default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:;
style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src 'self';
frame-ancestors 'none'; base-uri 'none'; form-action 'none'
```

**`media-src 'self' blob:` ist seit 0.8.50 dabei, und beide Angaben sind
nötig.** `'self'` trägt das Abspielen aus der eigenen Anlage. `blob:` trägt das
**Standbild vor dem Hochladen**: die Oberfläche hängt die gewählte Datei als
`blob:`-Adresse an ein `<video>`, um ein Einzelbild daraus zu ziehen. Eine
`blob:`-Adresse an einem `<video>` fällt unter `media-src`, **nicht** unter
`img-src` — ohne die Freigabe verwirft der Browser sie **wortlos**, und es
ließe sich überhaupt kein Video hochladen. Im echten Chromium nachgemessen:
*„Refused to load media from blob:"*, `MEDIA_ELEMENT_ERROR` 4. Der Prüfstand
hält beide Angaben einzeln fest.

Sie ist die Schicht, die beim Befund am Fotoweg **mitgegriffen hätte** — zwei
Verteidigungen für denselben Fehler, und billig, weil die Oberfläche nichts von
außen nachlädt. `frame-src 'self'` trägt die PDF-Vorschau. **`'unsafe-inline'`
bei `style-src` ist nötig und keine Nachlässigkeit:** die Oberfläche setzt an
36 Stellen `style="…"`-Attribute, und im echten Chromium nachgemessen verwirft
der Browser ohne die Freigabe **jedes einzelne** — die Seite lädt, sie sieht
falsch aus (Stolperstein 96). Die tragende Zeile ist `script-src`; dort steht
sie nicht, und der Prüfstand hält das fest.

**Der Fotoweg (seit 0.8.20).** Er hielt sich bis dahin an keinen der Punkte 1
und 8: `GET /api/photos/:id/raw` lieferte `photos.mime_type` aus, und der
Upload-Filter prüfte `/^image\//` — `image/svg+xml` besteht das, und `sharp`
rastert eine SVG anstandslos zu Vorschaubildern, der Upload sah also normal
aus. Wer die Adresse direkt öffnete („Grafik in neuem Tab öffnen"), bekam
Skript im Ursprung der Anwendung. Jetzt gilt dort dieselbe Regel wie überall,
in zwei Schichten:

* **Beim Hochladen** entscheidet das Ergebnis, nicht die Angabe:
  `sharp(buf).metadata()` liefert `format`, und alles außerhalb von
  `jpeg|png|webp|avif|gif|tiff` wird abgewiesen. Dieselbe Regel, die
  Kommentarbilder schon hatten.
* **Beim Ausliefern** entscheiden die ersten Bytes. Damit ist auch geschützt,
  was schon vorher in der Datenbank lag — eine Ableitung braucht keinen
  Migration.

**Bei Anhängen wird bewusst nicht gefiltert.** Eine Positivliste dort wäre
durch Umbenennen zu umgehen und wiegte in falscher Sicherheit. **Bei Fotos
schon** — dort ist die Positivliste kein Ersatz für die Auslieferung, sondern
die zweite Schicht daneben, und sie ist nicht durch Umbenennen zu umgehen,
weil sie das Bild wirklich öffnet.

**Bilder in Kommentaren sind der eine Fall, in dem doch beim Hochladen geprüft
wird.** Dort ist ausschließlich Bild erlaubt: jede Datei geht durch `sharp` und
wird neu kodiert gespeichert, Unlesbares wird abgewiesen. Eine als `.png`
getarnte HTML-Datei kommt damit gar nicht erst in die Datenbank. Der
Unterschied ist beabsichtigt — bei Anhängen ist jede Datei erlaubt, bei
Kommentarbildern nicht.

**Der Videoweg (seit 0.8.50).** Er hält sich an dieselben Punkte, und zwar
ohne Ausnahme. Beim **Hochladen** entscheidet der Inhalt: `typAusBytes()` muss
einen der drei Videotypen liefern, sonst 400 — dieselbe Erkennung, die auch
beim Ausliefern entscheidet, damit keine Zeile entstehen kann, die sich
hinterher nicht abspielen lässt. Auf die Videodatei wird `rasterBild()`
ausdrücklich **nicht** angewandt; das Standbild dagegen läuft durch genau
denselben Weg wie jedes Foto. Beim **Ausliefern** entscheiden wieder die ersten
Bytes; die drei Videotypen stehen auf der `inline`-Liste, weil ein Video sonst
heruntergeladen statt abgespielt würde. **Hinzunehmende Folge:** damit darf
auch ein **Anhang** mit Videoendung inline heraus, wenn er ausdrücklich so
angefordert wird — die Oberfläche fordert das nur für Bild und PDF an. Die
Regel auf der Antwort bleibt `default-src 'none'; sandbox`; **nachgemessen im
echten Chromium behindert `sandbox` das Abspielen nicht** — eingebettet nicht,
und direkt im Tab geöffnet ist der Bildschirmabzug mit und ohne `sandbox`
bytegleich.

**SVG steht nicht auf der Vorschauliste.** Eine SVG-Datei kann Skript
enthalten; in einem `img` läuft es nicht, aber ein direkt geöffneter Tab ist
eine Webseite.

**PDF ist der Grenzfall**, und hier wurde in 4.4.1 nachgebessert: angezeigt in
einem `iframe` mit `sandbox="allow-scripts"`, ausdrücklich **ohne**
`allow-same-origin`. Die eingebauten PDF-Betrachter von Chrome und Edge
bestehen selbst aus HTML und JavaScript — mit vollständigem `sandbox` bleibt
das Fenster einfach leer. Ohne `allow-same-origin` liegt das Dokument in einem
eigenen, fremden Ursprung und sieht von der Anwendung nichts; die tragenden
Schichten (eigener Content-Type, `nosniff`, `inline` nur nach Positivliste)
bleiben unverändert. **Die Lockerung gilt nur für PDF** — geprüft wird auch
das. Daneben steht immer „In neuem Tab öffnen" als Ausweichweg.

Der Prüfstand lädt eine echte HTML-Seite mit Skript hoch und prüft jede
einzelne dieser Schichten. **Am Fotoweg dasselbe mit einer echten SVG** — und
dort gehört die Kontrolle des ausgelieferten **Bytestroms** dazu: eine
Prüfung, die nur der Header ansieht, belegt nicht, was herausgeht
(Stolperstein 98). Eine per SQL eingesetzte Bestandszeile deckt den Fall ab,
den es vor 0.8.20 schon gab. Wer hier etwas ändert, lässt `npm test` laufen und
baut die Änderung zusätzlich probeweise zurück (siehe Abschnitt 7).

---

## 6. Stolpersteine — gesammelt und nummeriert

**Je ein Kernsatz und die Lehre.** Die Nummern gelten dauerhaft und werden
zitiert — im Quelltext, in den Änderungsprotokollen und in Gesprächen; **sie
werden nie neu vergeben.** *Die frühen Nummern stehen ausführlich in den
Revisionen 1 und 2 dieses Blatts, die späteren in dem Änderungsprotokoll der
Version, in der sie entstanden sind.*

> **Vor dem Nummerieren wird gezählt, nicht geblättert** — die Liste ist nicht
> monoton, spätere Runden haben Nummern zwischen ältere geschoben, und zwei
> Rückbauten unter derselben Nummer sind im Namensfilter des
> Gegenprobentreibers nicht auseinanderzuhalten (Stolperstein 168).

1. **Blättern darf nichts speichern.** Vorschaubilder zum Durchsehen dürfen
   nicht nebenbei das Hauptbild setzen — Ansehen ist keine Entscheidung.
2. **Tastensteuerung ruht bei Eingabefeldern und offenem Vollbild** — sonst
   blättert das Tippen.
3. **Nach `incremental_vacuum` zwingend `wal_checkpoint(TRUNCATE)`** — sonst
   schrumpft die Datei nicht, der Gewinn steht nur im WAL.
4. **Kennzahlen ohne WAL-Datei rechnen** — sonst erscheint die Datenbank
   doppelt so groß, wie sie ist.
5. **Klick und Doppelklick am selben Element serialisieren** — sonst kommt das
   Zurücksetzen vor dem Setzen an.
6. **Sortiernummern nach dem Löschen lückenlos nachziehen** — Lücken werden zu
   Geistern beim nächsten Einfügen.
7. **Beim Zusammenführen zweier Quellen Nummern neu vergeben, nie mitnehmen** —
   mitgenommene Nummern kollidieren still.
8. **Eine halbfertige Zieldatei nach einem Fehlschlag entfernen** — sonst gilt
   sie beim nächsten Start als fertig vorhanden.
9. **Datenüberführungen mit echten Altbeständen prüfen:** läuft der
   Prüfbestand über die Startlogik, ist die Marke gesetzt und die Überführung
   läuft nie.
10. **Ein Datum je Eintrag (und Benutzer) nur einmal** — sonst ist die Zahl
    der Testtage wertlos.
11. **Feste Routen vor Platzhaltern registrieren** — sonst liest Express
    „order" als Id, still und ohne Fehler.
12. **Kein UPDATE mit Unterabfrage auf dieselbe Tabelle:** SQLite sieht schon
    geänderte Zeilen. Erst lesen, dann in einer Transaktion schreiben.
13. **`CREATE TABLE IF NOT EXISTS` rüstet keine Spalten nach** — eine neue
    Spalte braucht ihren eigenen Weg ins Bestandsschema.
14. **Mitwachsende Felder: Rahmen dazurechnen und erst im Dokument messen** —
    ausgehängt ist `scrollHeight` null.
15. **`/api/health` liegt hinter der Anmeldung** — für Bereitschaftsprüfungen
    taugt nur `/api/config`.
16. **Was überall gelten soll, lädt `start()`** — nicht `loadAll()`; sonst
    fehlt es beim Direkteinstieg in eine Detailansicht.
17. **Das Grundmaß der Schrift darf nicht selbst `rem` sein** — am
    Wurzelelement zeigt `rem` auf die Browservorgabe, nicht auf sich selbst.
18. **Jedes Vokabelwort in `innerHTML` braucht `esc()`** — es ist Eingabe aus
    dem Systembereich, keine Konstante.
19. **Im DOM-Prüfstand gehört das Skript in den Kopf** — sonst steht der
    Quelltext in `body.textContent`, und Textprüfungen finden Wörter, die nie
    auf dem Bildschirm stehen.
20. **CSS-Längen werden beim Zurücklesen normalisiert** — Zahlen vergleichen,
    nicht Strings.
21. **Zwei Zählungen an einer Tabelle brauchen zwei Unterabfragen** — zwei
    JOINs multiplizieren sich. Prüfbestände brauchen deshalb mehrere
    Verwendungen je Zeile, sonst ist 1 × 1 = 1 und nichts fällt auf.
22. **Ein hoher Block braucht einen Griff** und schrumpft beim Ziehen auf
    seine Kopfzeile — sonst ist Sortieren Glückssache.
23. **`const` am Dateianfang hängt nicht am `window`** — der Prüfstand muss
    über den echten Weg zugreifen, nicht über eine Abkürzung.
24. **Beim Gegenprüfen die ganze Ausgabe ansehen, nicht nur die Fehlschläge** —
    ein Absturz verdeckt alle Prüfungen dahinter.
25. **`Number(null)` ist `0`.** Erst `typeof v === 'number'`, dann auf endlich
    prüfen — sonst wird „keine Angabe" zur Note 0.
26. **Express hängt an Text-Typen ein `charset` an** — Antwortköpfe auf den
    Anfang prüfen, nicht auf Gleichheit.
27. **Ein Dateiname mit Zeilenumbruch kommt über den Import, nicht über den
    Upload** — die Prüfung muss dort ansetzen, wo der Weg wirklich ist.
28. **Zwei Sicherheitsschichten verdecken einander in der Gegenprobe** — beim
    Gegenprüfen beide zugleich zurückbauen, sonst bleibt alles grün.
29. **Eine Prüfung ohne Browser belegt die Regel, nicht ihre Wirkung** — wo
    etwas nur im echten Browser sichtbar wird, gehört vor dem Ausliefern eine
    Rückfrage hin.
30. **Vorhanden ist nicht sichtbar:** eine `:hover`-Regel, die Zeilenarten
    einzeln aufzählt, lässt jede neue Art unsichtbar. Geprüft wird am
    Stylesheet, nicht am Gefühl.
31. **Eine Prüfung, die auf ein fehlendes Element zugreift, reißt den Lauf
    mit** — erst auf Vorhandensein prüfen. Die Gegenprobe muss rot werden,
    nicht abstürzen.
32. **Ein Prüfbestand kann eine Regel unprüfbar machen** — bleibt eine
    Gegenprobe stumm, liegt es öfter am Aufbau der Prüfung als an einer
    überflüssigen Regel.
33. **`touch-action: none` auf einer sortierbaren Liste ist fast immer
    falsch** — richtig ist eine Haltezeit, damit Wischen Scrollen bleibt.
34. **Eine Pixelschwelle taugt nicht für den Finger** — die Bedingung muss
    Zeit sein, und Bewegung vor Ablauf bricht den Griff ab.
35. **Eine geholte Momentaufnahme beim Speichern mitführen** — sonst gewinnt
    die ältere von zwei Wahrheiten und überschreibt die jüngere.
36. **Absolut positionierte Kinder eines Scrollbereichs scrollen mit** —
    Bedienelemente eine Ebene höher hängen.
37. **Vermessen darf die Seite nicht kürzer machen** — Bildlaufposition vorher
    merken und im selben Durchlauf zurückstellen.
38. **`100vh` plus irgendetwas ergibt eine Seite, die scrollt** — Nachbarn
    teilen sich die Höhe über eine Kennzeichnung am `body`, kein geratener
    Pixelabzug.
39. **Wer Zugangsdaten entfernt, entfernt auch, was auf ihnen beruht** — eine
    Rücksetzung nimmt die Sitzungen mit.
40. **Der Prüfstand darf den geprüften Weg nicht selbst abschaffen** — Wege,
    die es auf dem Hauptserver nicht mehr gibt, bekommen eigene Server mit
    eigener Umgebung.
41. **`innerHTML` ersetzt nur die Kinder** — Behandler an einem bleibenden
    Element beim Neuzeichnen von Hand abräumen; bei jedem Modus beide
    Richtungen prüfen (rein und wieder raus).
42. **Zwei Sortierbedingungen, die dieselben Zeilen greifen, verdecken
    einander in der Gegenprobe** — die Abdeckung sieht stärker aus, als sie
    ist.
43. **Eine Sortiernummer je Eintrag darf nicht am Gesamtzähler hängen** —
    eigener Zähler je Eintrag, hochgezählt nur bei tatsächlich geschriebenen
    Zeilen.
44. **Eine Schranke kann sich selbst verdecken**, nicht nur eine zweite —
    gefunden wird das allein durch die Gegenprobe.
45. **Eine Anleitung, die eine Datei nicht erwähnt, schafft sie ab** — was
    absichtlich nicht im Paket liegt, muss die Anleitung ausdrücklich nennen.
46. **Zentrieren und Scrollen schließen einander in Flexbox aus** — beides
    zugleich geht nur über `margin: auto` am Kind, und der Bildlauf wird erst
    im `load` des Originals gesetzt.
47. **Doppelt gehaltene Vorgaben prüfen sich nur halb** — zu jeder Vokabel
    gehört eine Prüfung unmittelbar am Server, nicht nur am Klienten.
48. **Eine Farbvariable zweimal zu erklären ist still** — die spätere gewinnt.
    Vor jeder neuen Farbe nachsehen, ob es sie schon gibt.
49. **Ein Wächter über den ganzen Quelltext macht jede Gegenprobe rot** —
    gemessen wird an den **Namen** der roten Prüfungen, nicht an ihrer Zahl.
50. **Eine Regel kann anderswo liegen, als der Rückbau vermutet** — bleibt
    eine Gegenprobe stumm, lautet die erste Frage: „Habe ich die Stelle
    getroffen, an der sie wirkt?"
51. **Wo eine Regel zweimal steht, baut die Gegenprobe beide Stellen zugleich
    zurück** — oder sie geht an der äußeren Schicht vorbei.
52. **Zwei Wege, dieselbe Sache zu löschen, verdecken einander** — einzeln
    zurückgebaut bleibt alles grün, und keiner ist geprüft.
53. **Bei Mehrfachstellen ist die Frage nicht „ist das redundant", sondern
    „deckt eine Stelle die andere zu"** — jede Stelle braucht eine Gegenprobe,
    die genau ihre eigene Prüfung rot macht.
54. **Ein Fremdschlüssel ohne `ON DELETE` ist auch eine Entscheidung — nur
    keine bewusste.** Zu jeder neuen Fremdschlüsselspalte gehört die Frage,
    was beim Löschen des Ziels geschehen soll — und wer das Ziel heute schon
    löscht.
55. **`!=` prüft eine leere Spalte nicht** — `NULL` fällt aus dem `WHERE`;
    richtig ist `IS NOT`. Wo eine Spalte leer sein kann, gehört der leere Fall
    ausdrücklich in die Prüfung.
56. **Zwei fertige Sitzungen genügen, um jede Rechtefrage zu stellen** — der
    zweite Rufer lässt sich im Prüfstand herstellen, lange bevor die Anwendung
    ihn anlegen kann. Dieses Muster trägt jede Rechteprüfung.
57. **Eine Spalte, die leer sein darf, macht ein `UNIQUE` löchrig** — `NULL`
    gilt als von allem verschieden. Wo etwas eine solche Spalte füllt, ist zu
    fragen, ob zwei Zeilen aufeinandertreffen können — und ob dann ein Absturz
    oder ein Rest (`UPDATE OR IGNORE`) das kleinere Übel ist.
58. **Ein `ON CONFLICT`-Ziel ist eine Bedingung, keine Beschreibung** — passt
    es zu keiner Eindeutigkeitsregel der Tabelle, lehnt SQLite die ganze
    Anweisung ab.
59. **Ein fehlendes Argument scheitert nicht laut** — `better-sqlite3` bindet
    es still als `NULL`. „Ohne Vorgabewert" ist keine Zusicherung; die einzige
    Schutzschicht ist eine ausdrückliche Klemme am Funktionsanfang.
60. **`datetime('now')` löst nur Sekunden auf** — eine Änderung innerhalb
    derselben Sekunde ist unbeweisbar. Der Ausgangswert im Prüfbestand wird
    von Hand auf ein festes altes Datum gesetzt.
61. **`e.currentTarget` ist nach dem ersten `await` `null`** — danach aus dem
    Zustandsobjekt neu zeichnen. Und: ein Bedienelement ist erst geprüft, wenn
    ein Ereignis wirklich zugestellt wurde (`dispatchEvent` samt Durchlauf der
    Event Loop).
62. **Ein zusammengesetzter regulärer Ausdruck wird zweimal maskiert** —
    langweiliger String-Code ist dort das kleinere Übel.
63. **Eine Spalte, die man vergleicht, muss im `SELECT` stehen** — sonst ist
    sie `undefined`, und die Prüfung kann gar nicht scheitern.
64. **Zufällige Portwahl braucht Abstand** — überlappende Bereiche erzeugen
    Rauschen, das beim Gegenprüfen wie ein Befund aussieht. Neue Basis:
    höchste vorhandene plus 60.
65. **Ein Merkmal kann vollständig geprüft sein und trotzdem an der falschen
    Stelle wirken** — zu jedem Merkmal in Sortierung oder Filter gehört eine
    Prüfung mit zwei Sortierungen und einem Eintrag mit leerem Sortierwert.
66. **Beim Einfügen in ein gegliedertes Dokument ist der Anker das Ende des
    Abschnitts** (die nächste Überschrift), nicht ein Satz aus seiner Mitte —
    danach ein Blick über alle Überschriften.
67. **Eine vorhergesagte Falle ist eine Aussage über den Effekt, nicht über
    den Ort** — bleibt ihre Gegenprobe stumm, lautet die Frage: „Wo tritt der
    Effekt wirklich auf?"
68. **Ein Prüfbestand über die Startlogik bringt fremde Zeilen mit** —
    aufräumen oder Ids abholen; geraten wird keine.
69. **Wo eine Sortierung einen Gleichstand auflöst, gehört die zweite
    Sortierbedingung in die erwartete Reihenfolge der Prüfung hinein.**
70. **`INSERT OR REPLACE` löscht die getroffene Zeile mitsamt ihren Kindern**
    (`ON DELETE CASCADE` läuft mit). Die Frage ist nicht „welcher Wert
    gewinnt", sondern „was hängt an der Zeile, die verschwindet".
71. **Der Prüfbestand darf die Lage nicht wegräumen, die er herstellen soll —
    auch nicht durch den Start.** Zu jedem Prüfbestand gehört die Frage, was
    die Startlogik mit ihm anstellt, bevor die erste Prüfung läuft.
72. **Eine Gegenprobe, die eine Reihenfolge belegen soll, darf die Regel nicht
    wegnehmen — nur ihren Ort ändern.** Liefern zwei Gegenproben dieselbe
    Punktliste, prüfen sie dieselbe Sache.
73. **Ein Recht, das der Admin ohnehin hat, verdeckt die Spalte, an der es
    hängt** — beginnt eine Bedingung mit einem meist wahren ODER, braucht die
    Prüflage einen Rufer, für den der erste Teil falsch ist.
74. **Wird ein Endpunkt eingeschränkt, sind die Prüfungen der
    Vorgängerversion die ersten Betroffenen** — und beim Nachziehen ist zu
    prüfen, ob ihr Gegenstand überhaupt noch scheitern kann.
75. **Ein abgebrochener Gegenprobenlauf lässt den Rückbau im Quelltext
    stehen** — wer rote Punkte deutet, prüft zuerst per `diff`, ob der
    Quelltext der ist, den er zu prüfen glaubt. Identische rote Punktlisten in
    mehreren Gegenproben gehören zu keiner von ihnen.
76. **Eine Gegenprobe, die den Lauf abbricht, nennt keinen einzigen Namen** —
    ist ein Rückbau so grundlegend, gehört eine zweite, engere Gegenprobe
    daneben: die eine belegt die Tragweite, die andere den Ort.
77. **`readline` liest bei geröhrter Eingabe voraus** — die zweite Frage
    bekommt nichts mehr, und das Skript endet mit Code 0, ohne fertig zu sein.
    Ein Werkzeug, das interaktiv fragt, wird einmal aus einem Rohr gefahren,
    bevor man ihm glaubt.
78. **Ein Wächter, der die *erste* passende Regel im Stylesheet greift, wird
    durch eine neue Regel darüber blind.** Eine Ausnahme von einer geprüften
    Regel gehört **unter** sie, mit einem Kommentar, warum sie nicht in deren
    Aufzählung steht.
79. **Ein freigegebener Name darf die Antwort nicht verlassen, auch wenn ihn
    niemand anzeigen will.** Was nicht angezeigt werden darf, wird nicht
    geliefert — sonst hängt die Regel daran, dass die Oberfläche mitspielt.
80. **Zwei Bedingungen desselben Wortlauts in einer Antwort brauchen zwei
    Gegenproben.** Der Rückbau an der einen Zeile ließ die Prüfung, die sie
    meinte, grün — sie hing an der anderen. Anwendung von 53 auf zwei Zeilen
    derselben Abfrage.
81. **Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
    scheitern.** Fehlt die Regel im Stylesheet, liefert der Wächter eine leere
    String, und jede Verneinung darauf ist wahr — die Gegenprobe machte
    nur eine statt zwei Prüfungen rot. Erst das **Vorhandensein** prüfen, dann
    die Eigenschaft. Verwandt mit 63 und 31, aber eigenständig: dort ist der
    Wert `undefined`, hier ein *plausibler* leerer Wert.
82. **Die letzte Spalte einer Tabelle trägt das Komma ihres Vorgängers mit.**
    Ein Rückbau, der sie aus der DDL nimmt, hinterlässt ein nachlaufendes Komma;
    SQLite meldet „syntax error", `db.js` wirft beim Laden, und der Prüflauf gibt
    **keine einzige Zeile** aus. Stolperstein 76 in neuer Gestalt: ist ein
    Rückbau so grundlegend, gehört eine engere zweite Gegenprobe daneben, die
    die DDL gültig lässt und genau eine Prüfung trifft.
83. **Was in der Kopfzeile steht, überlebt das Einklappen — ein zweiter Text
    daneben wird dort zur Doppelung, und eine leere Kurzfassung zur leeren
    Klammer.** `.block-head` trägt zwei Stellen für Inhaltsangaben: die
    Kurzfassung `.bsumme` (nur eingeklappt sichtbar) und einen freien Hinweis
    (`#lcount`, `#acount`, immer sichtbar). Wer einem Block beides gibt, zeigt
    eingeklappt zweimal dasselbe. Und wer die Kurzfassung leer lässt, bekommt
    „()", eine Klammer um nichts. Ein Block hat genau eine Stelle für seine
    Zahlen; welche, entscheidet, ob sie eingeklappt sichtbar bleiben soll.
84. **Ein absichtlich unvollständiger Prüfbestand trägt eine Aussage — wer
    ihn vervollständigt, löscht sie.** Ein Vokabularsatz, der nur einen Teil
    der elf Wörter nennt, ist keine Nachlässigkeit: daran hängt die Prüfung,
    dass eine Karte für ein *nicht genanntes* Wort die Vorgabe zeigt. Ihn zu
    vervollständigen macht diese Prüfung rot — zu Recht. Richtig ist ein
    zweiter, vollständiger Satz daneben. Verwandt mit 32, aber umgekehrt: dort
    verhindert der Bestand eine Prüfung, hier *ist* er eine.
85. **Wo die Anzeige selbst rundet, ist ein Rundungsschritt davor nicht
    gegenprüfbar.** Bildet der Klient eine eigene Zahl (z. B. den Schnitt der
    eigenen Werte) und rundet die Anzeige hinterher ohnehin auf dasselbe
    Zehntel, bleibt der Rückbau der ersten Rundung auf dem Bildschirm stumm.
    Der Schritt gehört trotzdem hin: er macht aus dem rohen Mittel dieselbe
    Art Zahl wie die vom Server gelieferte, sonst stünden zwei Sorten Schnitt
    nebeneinander. Ein Schritt, dessen Wirkung erst außerhalb der Anzeige
    sichtbar würde, gehört mit seinem Grund in den Kommentar — und in die
    Liste „nicht gegengeprüft, mit Grund".
86. **Ein Abbruch in einer Gruppe, die der Rückbau gar nicht berührt, ist
    erst ein Fund, wenn er sich allein wiederholen lässt.** Ein Rückbau nannte
    drei richtige rote Punkte und brach danach in einer völlig fremden Gruppe
    ab; allein wiederholt lief er glatt durch — ein liegengebliebener Prozess
    auf dem Prüfport, nicht der Rückbau. Ergänzung zu 75 und 76: vor dem
    Deuten eines Abbruchs die Frage, ob er überhaupt im Wirkbereich des
    Rückbaus liegt — und wenn nicht, den Rückbau allein wiederholen.
87. **Eine Prüflage, die nur die eine Hälfte einer Rollenleiter setzt, prüft
    eine Lage, die es nicht gibt.** Zwei Aufbauten setzten `istAdmin: false`
    und ließen `istEigentuemer` auf der Vorgabe `true` — solange keine Karte
    an der Eigentümerfrage hing, fiel das nicht auf. Wo zwei Felder derselben
    Leiter angehören, setzt die Prüflage **beide**. Verwandt mit 71, aber
    umgekehrt: dort räumt der Bestand die Lage weg, hier ist sie von
    vornherein unmöglich.
88. **Wer eine Karte versteckt, muss ihre Behandler mitverstecken — und der
    Fehler kommt zu spät, um laut zu sein.** Ein Behandler an einem Element,
    das es nicht mehr gibt, wirft **nach** dem Setzen von `app.innerHTML`: auf
    dem Bildschirm steht ein halb eingerichteter Bereich ohne jede Meldung,
    im Prüfstand reißt es den Lauf mit, ohne einen einzigen Namen zu nennen.
    Zu jeder Karte an einer Rolle gehört dieselbe Frage für ihre Behandler —
    an **einem** Ort, nicht an zehn.
89. **Zwei Dialoge übereinander teilen sich die Abbruchtaste.** Ein
    Escape-Behandler an `document` schließt **jeden** offenen Dialog, nicht nur
    den obersten — eine Rückfrage über einer Ansicht nähme beim Abbrechen
    beide zugleich weg. Wer einen zweiten Dialog über einen ersten legt, fragt
    im Behandler, ob er selbst der oberste ist. Verwandt mit 41, aber
    umgekehrt: dort hängt ein Behandler an einem Element, das neu gezeichnet
    wird, hier greifen zwei **gültige** Behandler auf dasselbe Ereignis zu.
90. **Ein Mock, der eine Antwort nur ausliefert, kann kein
    Neuzeichnen belegen.** Antwortet er auf ein Löschen zwar mit dem neuen
    Stand, liefert aber weiterhin dieselbe Liste, ist „die Ansicht zeichnet
    sich neu" von „die Ansicht blieb stehen" nicht zu unterscheiden — die
    Prüfung bliebe in beiden Fällen grün. **Ein Mock, dessen Antwort
    sich durch einen Schreibvorgang ändern soll, muss sie wirklich ändern.**
    Fortschreibung der Regel aus 0.8.5: dort ging es darum, dass er nicht
    *vereinfachen* darf, hier darum, dass er nicht *erstarren* darf.
91. **Eine Funktion, die selbst misst, ist im gebauten DOM nur an einer
    gestellten Höhe prüfbar.** `begrenzeWolke()` liest `offsetHeight`; in
    jsdom ist das immer null, und die Funktion bricht dann **absichtlich** ab
    (die Regel aus 0.8.3). Eine Prüfung an einer echten Ansicht prüft deshalb
    nicht die Begrenzung, sondern den Abbruch — und wird rot, obwohl der Code
    richtig ist. **Wo eine Prüfung Layout braucht, muss sie es stellen.**
    Verwandt mit 20 und mit „Was der Prüfstand nicht kann: Aussehen".
92. **`fetch()` weigert sich, bestimmte Portnummern überhaupt anzuwählen.**
    Ein Prüfserver auf Port 6000 läuft, meldet es im Protokoll — und die
    Prüfung kommt trotzdem nicht an ihn heran: `fetch failed: bad port`. 6000
    ist X11 und steht auf der Sperrliste der Fetch-Spezifikation, zusammen mit
    rund achtzig weiteren. `curl` kommt durch, `fetch` nicht. Ein Prüfstand,
    der sich seine Ports selbst vergibt, muss diese Liste meiden — und das
    Fehlerbild führt in die Irre, weil der Server nachweislich läuft.
93. **Ein Filter auf der Ausgabe braucht drei Aussagen, nicht eine.** Dass
    gefiltert wurde, wie viel übergangen wurde, und ob im Übergangenen etwas
    rot war. Fehlt die dritte, ist der Teillauf still; fehlt die zweite,
    sieht er aus wie ein voller Lauf; fehlt die erste, ist er von einem
    vollen Lauf gar nicht zu unterscheiden. **Der gefährlichste Sonderfall:**
    ein Filter ohne Treffer zeigt nichts und meldete ohne eigene Regel Erfolg
    für nichts.
94. **Ein Rahmen kann sich nicht selbst bestätigen.** Wäre die Zählung des
    Prüfrahmens falsch, wäre es die Zählung, die es meldet. Prüfbar wird er
    erst von außen — als eigener Prozess, dessen Ausgabe und Rückgabewert
    angesehen werden. Damit das nicht den ganzen Durchlauf ein zweites Mal
    kostet, trägt der Prüfstand eine Selbstprobe, die nur den Rahmen fährt:
    zwei gestellte Gruppen, Millisekunden statt einer Minute.
95. **Ein Fingerprint über Dateien ist erst dann vollständig, wenn alle Dateien
    schon geladen sind.** Er entsteht beim Start; ein `require` **innerhalb**
    einer Funktion liefe später und stünde dann nicht darin — der Fingerprint
    würde still unvollständig, ohne dass irgendetwas rot wird. Dagegen hilft
    kein Kommentar, sondern ein Wächter über den Modulgraphen ab `server.js`.

96. **Eine Content-Security-Policy mit `style-src` verwirft auch
    `style="…"`-Attribute.** Nicht nur `<style>`-Elemente: `'unsafe-inline'`
    entscheidet über beides zugleich, und ohne die Freigabe fällt jedes
    einzelne Attribut still weg — die Seite lädt, sie sieht nur falsch aus.
    `el.style.x = …` über CSSOM bleibt erlaubt. **Vor einer CSP gehören die
    Attribute gezählt, nicht geschätzt** — und nachgemessen wird im Browser,
    nicht in `jsdom`: dort greift keine CSP, eine Prüfung sähe nur die
    Header.

97. **Wer ein Header vom Aufrufer nicht mehr glaubt, nimmt zuerst dem
    eigenen Prüfstand ein Werkzeug weg.** Die Gruppe zur Namensbremse gab
    jedem Versuch eine eigene Adresse per `X-Forwarded-For` — genau die
    Behauptung, die 0.8.20 nicht mehr annimmt. Vier Prüfungen wurden rot, ohne
    dass etwas kaputt war. Sie sind auf einen Server **mit** eingeschalteter
    Einstellung umgehängt worden und prüfen seitdem zwei Sachen statt einer.
    Stolperstein 74 in neuer Gestalt: **umhängen, nicht löschen.**

98. **Eine Prüfung, die nur der Header ansieht, belegt nicht, was
    herausgeht.** Zur Auslieferung gehört der Bytestrom daneben: bei einer SVG
    aus dem Bestand ist der Inhalt unverändert die SVG samt Skript —
    gefährlich wäre allein, dass der Browser sie als Webseite liest. Erst
    Header **und** Inhalt zusammen sagen, was der Fall ist.

99. **`pkill -f "node server.js"` erschlägt den laufenden Prüfstand.** Der
    startet seine Server als eigene Prozesse mit genau dieser Befehlszeile.
    Ein Aufräumbefehl neben einem laufenden Prüflauf sah aus wie ein echter
    Fehler („Prueflauf abgebrochen: fetch failed"), war aber selbst die
    Ursache. **Was im Hintergrund läuft, gehört vor jedem `pkill` bedacht.**

100. **Ein Rückbau in derselben Arbeitskopie ist eine Wette auf einen
    störungsfreien Lauf.** Bricht der Vorgang mittendrin ab, bleibt der
    Rückbau stehen — und die nächste Änderung baut auf einem Stand auf, den
    niemand so wollte. Gegenproben laufen deshalb seit 0.8.20 in einer
    **Kopie des Arbeitsbaums**; der echte Baum wird nicht angefasst.
101. **Eine Gegenrichtung wird an beiden Orten geprüft — Rumpf *und*
    Routenzeile.** Der Wächter über den Quelltext prüfte bei der Art `'offen'`
    nur, dass im **Rumpf** keine Klemme steht. Ein Wächter, der in die
    **Routenzeile** zurückwandert, blieb ihm unsichtbar: die Gegenprobe färbte
    acht Verhaltensprüfungen rot — und ausgerechnet die eine Prüfung nicht,
    die eine falsche *Entscheidung* finden soll. Behoben in 0.8.30.
102. **Ein Mock, der ein Feld selbst mitbringt, deckt die Serverseite
    zu.** Der Rückbau „`verfasser` fällt aus der Linkzeile in `detail()`" blieb
    **vollständig grün**: die Oberflächenprüfungen laufen gegen `baueDom`,
    dessen Prüflage das Feld selbst setzt, und die Rechteprüfungen sehen in die
    Datenbank statt in die Antwort. *Zu jedem Feld, das die Oberfläche aus der
    Antwort liest, gehört eine Prüfung an der echten Antwort.* Lücke 3 des
    Prüfstands (Abschnitt 7), zum zweiten Mal.
103. **Eine Prüfzeile, die auf `liste[0].feld` zugreift, reißt den Lauf ab,
    statt rot zu werden.** Fällt die Zeile weg, ist `liste[0]` `undefined`, und
    der Zugriff beendet den ganzen Lauf — der dann **keinen einzigen Namen**
    nennt. Verwandt mit 76, aber eigenständig: dort ist der *Rückbau* zu grob,
    hier ist die *Prüfung* zu unvorsichtig. Der Fragezeichenpunkt gehört dorthin.
104. **Seit es fünf Träger mit `user_id` gibt, muss jede von Hand angelegte
    Prüfzeile ihren Verfasser ausdrücklich tragen.** Eine Prüflage legte ihre
    Linkzeile ohne `user_id` an; `ordneBestandZu()` schob sie beim Start der
    Eigentümerin zu — und „der Admin löscht einen **fremden** Link" löschte
    danach einen eigenen: grün, aber über etwas anderes.
105. **`ALTER TABLE … ADD COLUMN … REFERENCES` geht nur mit der Vorgabe NULL.**
    Nachgestellt statt geglaubt: SQLite antwortet auf jede andere Vorgabe mit
    „Cannot add a REFERENCES column with non-NULL default value" — auch auf
    `NOT NULL DEFAULT 0`. *Eine nachgerüstete Fremdschlüsselspalte ist immer
    nullbar; wer sie anders will, braucht einen Tabellenneubau.*
106. **Ein Wächter über den Quelltext färbt sich am Warnschild statt an der
    Sache.** Zwei Prüfungen aus 0.8.40 sind daran gescheitert, und zwar beide
    am *unveränderten* Stand: „die Spalte trägt keinen `CHECK`" las den
    DDL-Text aus `sqlite_master` — und **SQLite speichert die Kommentare mit**,
    in denen erklärt wird, warum kein `CHECK` dasteht. „Nirgends wird über ALLE
    Gewichte summiert" las `server.js` als Ganzes und traf den Kommentar, der
    den falschen Griff ausschreibt, damit ihn der Nächste nicht für einen guten
    hält. *Wer eine Regel als Text prüft, prüft Code — der Kommentar daneben
    erklärt die Regel und darf sie nicht auslösen.* Beide Male derselbe Ausweg:
    die eine Prüfung sieht sich jetzt das **Verhalten** an, die andere filtert
    die Kommentarzeilen weg — samt Gegenprobe, dass sie danach überhaupt noch
    Code liest.
107. **`ALTER TABLE … ADD COLUMN … CHECK (…)` geht sehr wohl.** Nachgestellt
    statt geglaubt, und diesmal fiel die *Behauptung* und nicht der Bau: das
    Gewichtungspapier verneint es, SQLite nimmt es an, und der `CHECK` greift
    danach. Das Gegenstück zu 105, das dieselbe Frage für `REFERENCES` stellt
    und andersherum beantwortet. *Zwei Nachrüstungen, zwei verschiedene
    Antworten — die eine sagt nichts über die andere.* (Der `CHECK` bleibt
    trotzdem weg, aus einem anderen Grund: Abschnitt 5.)

108. **Zwei `ALTER TABLE` sind zwei Anweisungen — scheitert die zweite, bleibt
    die erste stehen.** Nachgestellt: ohne Transaktion überlebt die erste
    Spalte, in einer `db.transaction()` rollen beide zurück. Für einen
    Migrationsblock mit **mehr als einer** Spalte folgt daraus die Bauform: nicht
    den Block als Ganzes fragen, sondern **jede Spalte einzeln**. Dann heilt
    der nächste Start einen zerrissenen Stand von selbst; ein Block, der beim
    Vorhandensein der ersten zurückkehrt, ließe die zweite für immer fehlen.
    *Die Transaktion verhindert den Riss, die Einzelabfrage überlebt ihn — nur
    das Zweite hilft gegen einen Riss, der in einer früheren Version entstand.*

109. **Ein Nachrüster, der aus `data` ableitet, gehört auf die Zeilen
    eingeschränkt, deren `data` das Erwartete trägt.** `backfillVariants()`
    holte jede Zeile mit fehlender Vorschau und erzeugte **beide** Varianten
    neu — an einer Videozeile also aus der Videodatei. Ergebnis: zwei leere
    Varianten, ein **überschriebenes** Standbild und eine Zeile, die bei jedem
    Start aufs Neue fällig ist. Der Fehler ist nicht das Ableiten, sondern die
    unbeschränkte Auswahl. *Wer eine Spalte mit zwei Bedeutungen einführt, geht
    jede Stelle durch, die sie ohne Fallunterscheidung liest.* Aufgefallen beim
    Durchgehen der Liste „welche Regel gilt am Video von selbst", vor dem Bauen.

110. **Eine Prüfung, die auf eine Nebenwirkung wartet, wartet auf die Meldung,
    nicht auf die Uhr.** Das Nachrüsten der Vorschaubilder startet 1,5 Sekunden
    nach dem Zuhören; eine feste Wartezeit von 400 ms war zu kurz und ließ die
    Prüfung rot werden, obwohl der Code stimmte. Eine großzügigere feste Zahl
    hätte den Lauf verlangsamt und wäre auf einer langsameren Maschine
    trotzdem zu kurz. *Warte auf das, was du erwartest, mit einer Obergrenze —
    nicht auf eine geschätzte Dauer.*

111. **jsdom kennt `<video>`, aber nicht `pause()` und `load()`.** Beide melden
    sich als `jsdomError` und schwemmen das Protokoll voll, ohne dass etwas
    falsch wäre. Gefiltert wird genau diese eine Meldung über eine eigene
    `VirtualConsole`; alles andere geht unverändert durch. *Ein Filter über
    Fehlermeldungen ist eine Wette — er gehört so eng gefasst, dass er nur den
    bekannten Fall trifft.* (In jsdom 30 heißt der Weg `forwardTo(console,
    { jsdomErrors: 'none' })`; `sendTo` gibt es nicht mehr.)

112. **Ein Sprachwächter meldet sich selbst.** Sein eigener Kommentar erklärt
    die Regel und nennt dabei die verbotenen Wörter. Stolperstein 106 in neuer
    Gestalt und mit umgekehrtem Vorzeichen: dort trifft ein Wächter über den
    *Code* den Kommentar daneben, hier trifft ein Wächter über die *Sprache*
    die eigene Begründung. *Die Antwort ist dieselbe Trennlinie, nur andersherum
    gezogen: was in Backticks steht, ist zitierter Code und keine Sprache — in
    einem Kommentar so gut wie in einem Dokument.*
113. **Ein Wächter über eine Dateiliste braucht die ZAHL, nicht nur „alle, die
    dastehen".** Die Prüfung hing an `every(existsSync)` und blieb grün, als die
    Liste auf eine einzige Datei gekürzt wurde — der Wächter sah danach ein
    Achtel der Anwendung an und meldete nichts. *Dieselbe Überlegung wie bei der
    Zahl in `F_ROUTEN`: eine Liste, die schrumpfen darf, ohne dass es auffällt,
    ist keine Liste, sondern eine Behauptung.*
114. **Eine Prüfung auf „filtert, sortiert nicht" fängt keine Vorsortierung.**
    Verglichen wurde die Reihenfolge der *verbliebenen* Einträge mit und ohne
    Filter — und eine Zeile, die das Neue vor den `switch` zieht, ändert genau
    diese Reihenfolge **nicht**. Sie fällt erst auf, wenn die **ungefilterte**
    Liste gegen ihre eingestellte Ordnung gehalten wird. *Wer prüfen will, dass
    ein Filter nicht sortiert, misst die Liste ohne ihn.*
115. **Ein Mock, der beim Schreiben wirklich mitzieht, verändert die Prüflage
    für alles, was danach im selben Fenster läuft.** Stolperstein 90 verlangt,
    dass er sich ändert; die Folge ist, dass Prüfungen, die die **Zahlen der
    Prüflage** lesen, danach etwas anderes sehen. *Wer die Prüflage selbst
    misst, misst sie an einem frischen Aufbau.*
116. **Eine Schranke, die aus einer Liste ableitet, wird erst bei einem Zugang
    OHNE Adminrolle laut.** `PUT /api/settings` leitet aus
    `PERSOENLICHE_SCHLUESSEL` ab, was jeder für sich schreiben darf. Nimmt man
    einen Schlüssel dort heraus, kommt der **Eigentümer** weiterhin durch — er
    ist Admin — und nur ein gewöhnlicher Benutzer bekommt 403. *Wer eine
    Rechteschranke gegenprüft, prüft sie an dem Zugang, den sie treffen soll.*

117. **`db.backup()` geht an einer verschlüsselten Datenbank nicht.** Der
    schrittweise Weg der SQLite-Backup-API braucht eine Zieldatenbank mit
    demselben Schlüssel und antwortet sonst mit „backup is not supported with
    incompatible source and target databases". *Wer einen nicht blockierenden
    Weg sucht, misst zuerst nach, ob es ihn an dieser Datenbank gibt.*
118. **Eine Zusage, die nach dem Schließen ihres Fensters ankommt, reißt den
    Lauf ab.** Eine Ansicht, die ihre Liste selbst nachlädt, läuft weiter, wenn
    das jsdom-Fenster längst geschlossen ist; `document` ist dann `undefined`,
    und der Zugriff beendet den ganzen Prüflauf, statt eine Prüfung rot zu
    färben. *Was eine Ansicht beim Aufbau braucht, wird beim Aufbau geholt.*
    Verwandt mit 103, aber eigenständig: dort ist die Prüfung zu unvorsichtig,
    hier die Ansicht.
119. **`datetime()` nimmt seine Modifikatoren EINZELN.**
    `datetime('now', '-30 days +1 seconds')` ergibt **NULL**, nicht den
    gemeinten Zeitpunkt — zwei Modifikatoren sind zwei Argumente. *Eine
    Prüflage, die einen Zeitpunkt von Hand setzt, sieht nach, ob wirklich einer
    dasteht.* Verwandt mit 60: dort ist die Auflösung zu grob, hier fehlt der
    Wert ganz.
120. **Eine Positivliste am Dateipfad ist stärker als jede Verbotsliste — aber
    sie ersetzt den aufgelösten Pfad nicht.** `..` und ein absoluter Pfad sind
    nicht ausdrückbar, wenn jedes Segment mit einem Buchstaben oder einer
    Ziffer beginnen muss; **ein Symlink ist es sehr wohl**, und am String sieht
    er harmlos aus. *Wer prüft, wohin geschrieben wird, prüft `realpathSync`
    und nicht die Eingabe.* Die Gegenprobe zeigt beide Schichten getrennt: fällt
    die Positivliste weg, bleibt die **Abweisung** grün und nur die
    **Begründung** wird falsch — der aufgelöste Pfad fängt es auf.
121. **Ein Dateiname mit Sekundenauflösung kollidiert in derselben Sekunde.**
    Zwei Sicherungen kurz hintereinander tragen denselben Namen; `VACUUM INTO`
    scheitert dann mit „output file already exists". Das ist die richtige
    Antwort — aber eine Prüflage, die zweimal hintereinander sichert, muss eine
    Sekunde warten, sonst prüft sie die Kollision statt der Sache.
122. **Ein abgerissener Prüflauf hinterlässt seine Server.** Der Prüfstand
    startet echte Server als Kindprozesse; bricht er ab, laufen sie weiter. Die
    **Bereitschaftsprüfung** des nächsten Laufs (`GET /api/config` auf einem
    zufällig gewählten Port) kann dann von einem **fremden** Server beantwortet
    werden — und der Lauf prüft danach eine andere Anlage: Zeilen, die in der
    Datenbank stehen, sind über die Schnittstelle nicht da. Beim Bau von 0.8.70
    hat das zwei Gegenproben widersprüchliche Punkte liefern lassen, und der
    Befund war erst zu sehen, als zwölf verwaiste Prozesse nebeneinander
    standen. *Wer Gegenproben in Serie fährt, räumt die ganze Prozessgruppe ab
    und nicht nur das Wegwerfverzeichnis.*

123. **Eine Aussage über die Welt draußen trägt nur, solange die Einhängung sie
    spiegelt.** Der Prozess im Container sieht den Wirt nicht — er sieht
    `/app/sicherung` und sonst nichts. Ob dieser Pfad draußen **im** oder
    **neben** dem Projektverzeichnis liegt, kann er nicht messen; er liest die
    Lage an seinem **eigenen** Pfad ab (`__dirname`) und setzt voraus, dass die
    `docker-compose.yml` sie spiegelt: `./` draußen wird `/app` drinnen. Die
    Voraussetzung ist unsichtbar, und genau darin liegt die Falle — wer den
    Schnitt anders legt, bekommt eine falsche Farbe und keine Warnung darüber.
    Sie steht deshalb an **drei** Stellen im Klartext (Quelltext,
    `docker-compose.yml`, README) und in einem Wächter, der die
    `docker-compose.yml` selbst liest. *Wer eine Aussage über etwas trifft, das
    er nicht sehen kann, benennt die Brücke, über die sie trägt — und stellt
    einen Wächter davor.*

124. **Eine Schwelle wird gelesen, bevor sie erhöht wird.** `checkThrottle`
    fragt den Zählerstand ab, `noteFailure` zählt danach hoch — die harte
    Schwelle von zehn ist deshalb erst **nach** dem zehnten Fehlversuch
    erreicht, und gesperrt wird ab dem **elften**. Eine Grenzprüfung, die den
    Übergang beim zehnten erwartet, wird rot, ohne dass am Code etwas falsch
    wäre; beim Bau von 0.8.80 ist genau das passiert. *Wer eine Schwelle prüft,
    prüft den Übergang — und sieht vorher nach, an welcher Stelle im Ablauf der
    Zähler steht.*

125. **Eine Regel, die Zeilen räumt, und eine Handlung, die eine anlegt,
    hinterlassen genau eine.** „Beim Einlösen fallen ALLE Sitzungen dieses
    Benutzers" und „wer einlöst, ist damit angemeldet" gelten beide — was
    danach dasteht, ist **eine** Zeile, nicht keine. Eine Prüfung auf die
    **Zahl** kann „die alten sind weg und eine neue steht da" nicht von „eine
    alte ist stehengeblieben" unterscheiden; beide Male steht dort eine Zeile.
    *Wo geräumt und angelegt wird, prüft man die IDENTITÄT der Zeilen, nicht
    ihre Anzahl.* Verwandt mit 90, aber eigenständig: dort erstarrt der Mock,
    hier zählt die Prüfung das Falsche.

126. **Eine Prüfung, die die gerufene Funktion aufruft, prüft keine ihrer
    Aufrufstellen.** „Beim Start wird aufgeräumt" lief als kurzer Lauf, der
    `raeumeTokensAuf()` **selbst** rief — und blieb grün, als der Aufruf aus
    `server.js` verschwand. Die Gegenprobe war **vollständig stumm**.
    *Wo eine Funktion an zwei Stellen gerufen wird, läuft die Prüfung über den
    Weg, den auch der Betrieb nimmt* — hier ein echter Serverstart. Verwandt
    mit 53, aber eigenständig: dort deckt eine Stelle die andere zu, hier wird
    gar keine von beiden angesehen.

127. **Eine Portbasis deckt sechzig Nummern, und einige davon wählt `fetch()`
    nicht an.** Die Basis 5960 deckt 5960 bis 6019 — und **6000 ist X11** und
    steht auf der Sperrliste der Fetch-Spezifikation. Der Server läuft dann und
    meldet es auch; nur die Bereitschaftsprüfung kommt nie an ihn heran, und
    der Lauf reißt ab, statt eine Prüfung rot zu färben. Dasselbe gilt für
    6665–6669 und 6697. *Stolperstein 64 verlangt Abstand zwischen den Basen —
    dazu gehört der Abstand zu den gesperrten Nummern, und der wird
    ausgerechnet, nicht geschätzt.*

128. **`PRAGMA rekey` läuft im WAL-Modus nicht.** *„Rekeying is not supported in
    WAL journal mode."* — und `db.js` setzt `journal_mode = WAL` bei jedem
    Öffnen. Ein Schlüsselwechsel muss also erst auf `DELETE` umschalten,
    wechseln und danach zurückschalten. **Nachgestellt vor dem Bau**, und der
    Befund hat die Form von Punkt 3 des Auftrags 0.8.90 geändert. *Was an einem
    Pragma zweifelhaft ist, wird in zwanzig Zeilen nachgebaut — auch dann, wenn
    schon jemand gesagt hat, es laufe.*

129. **Eine liegengebliebene Freigabe trägt zwei Minuten lang.** Eine Prüfgruppe
    holte eine Bestätigung und verbrauchte sie nicht; die nächste Gruppe lief
    mit derselben Sitzung gegen einen Weg, der dadurch offen stand — „ohne
    Bestätigung abgewiesen" war rot, ohne dass am Code etwas falsch war.
    *Wo eine Prüflage kurzlebigen Zustand im Arbeitsspeicher hinterlässt,
    beginnt die nächste mit einer frischen Sitzung.* Verwandt mit 60, aber
    umgekehrt: dort ist der Zustand zu alt, hier zu jung.

130. **Ein Rückbau, der eine Tabelle aus der DDL nimmt, reißt den Start ab
    statt eine Prüfung rot zu färben.** `auth.js` bereitet seine Anweisungen
    beim Laden vor; fehlt die Tabelle, startet die Anlage gar nicht. Die
    Gegenprobe zu „die Tabelle legt sich selbst an" läuft deshalb über den
    **Index**, und der Befund gehört daneben geschrieben: *die Anlage startet
    ohne die Tabelle überhaupt nicht — das ist schärfer als die Prüfung, aber
    es ist eine andere Aussage.* Verwandt mit 103, aber eigenständig: dort
    reißt die Prüfzeile ab, hier der Gegenstand selbst.

131. **Was an einen Sitzungstoken gebunden ist, lässt sich nach dem Abmelden
    von außen nicht mehr prüfen.** Eine Prüfung, die sich nach dem Abmelden
    **neu** anmeldet und nachsieht, ob der alte Zustand noch trägt, kann nicht
    scheitern — die neue Sitzung trägt einen anderen Token. Die Gegenprobe zu
    „das Abmelden verwirft die Freigabe" blieb dementsprechend **vollständig
    stumm**. *Wo ein Zustand im Arbeitsspeicher an einem Geheimnis hängt, das
    nie wiederkehrt, läuft die Prüfung IM PROZESS und nicht über die
    Schnittstelle.*

132. **Eine Bindung aus mehreren Teilen wird an einem Paar geprüft, das sich
    nur in EINEM Teil unterscheidet.** „Eine Freigabe für den Export vergibt
    keine Rolle" hielt zwei Lagen gegeneinander, die sich in **Zweck und
    Ziel** unterschieden — sie wäre auch dann grün geblieben, wenn der
    Schlüssel den Zweck gar nicht trüge, denn die Ziele unterscheiden sich ja
    schon. Der Rückbau des Zwecks ließ die ganze Gruppe grün. *Wer eine
    zusammengesetzte Bindung prüft, hält je Teil ein Paar gegeneinander, das
    sich NUR in diesem Teil unterscheidet.* Verwandt mit 53, aber
    eigenständig: dort deckt eine Stelle die andere zu, hier ein Teil des
    Schlüssels den anderen.

133. **Ein Prozess ist an seinem Arbeitsverzeichnis zu erkennen, nicht an
    seiner Befehlszeile.** Der Gegenprobentreiber räumte mit
    `pkill -f <Kopierpfad>` auf und traf nie: ein mit `cwd` gestarteter
    Kindprozess trägt den Pfad in `/proc/<pid>/cwd`, in der Befehlszeile steht
    nur `node server.js`. `kill -- -$!` trifft ebenfalls daneben, weil
    `setsid` eine **neue** Prozessgruppe anlegt. 48 Server sammelten sich an,
    besetzten Ports und ließen acht Gegenproben abreißen — mit einem
    Fehlerbild, das nach einem Befund am Code aussah. *Ein Aufräumen, das nie
    greift, sieht aus wie eines, das greift; wer eines baut, sieht hinterher
    nach, ob wirklich keiner überlebt hat.* Die Kehrseite von 122 — und in
    derselben Runde ist die Regel auch in der eigenen Arbeit verletzt worden:
    zwei Prüflagen liefen nach `npm test` weiter.

134. **Eine offene Leseverbindung sperrt den Schlüsselwechsel.** Eine Prüfung
    öffnete die Datenbank, um zu sehen, ob der alte Schlüssel sie noch öffnet —
    und schloss sie im Erfolgsfall nicht. Die Verbindung hielt eine gemeinsame
    Sperre; der nächste Wechsel scheiterte mit `database is locked`, weil
    `journal_mode = DELETE` eine ausschließliche Sperre braucht. Das Fehlerbild
    sah aus wie ein Befund am Code und war eine Prüflage.
    *Wo eine Prüfung eine Datenbank öffnet, schließt sie sie auch im
    Fehlerfall — `finally`, nicht am Ende des guten Zweiges.* Verwandt mit 122,
    aber eigenständig: dort bleibt ein Prozess stehen, hier ein Dateizugriff im
    eigenen.

135. **`textContent` trägt die Zeilenumbrüche der Vorlage mit.** Ein Wächter
    über einen Satz in der Oberfläche prüfte auf ein einzelnes Leerzeichen —
    im gerenderten Text stand dort ein Umbruch samt Einrückung, und die Prüfung
    fand ihren eigenen Satz nicht. Sie war rot, obwohl die Karte richtig war;
    umgekehrt wäre sie stumm geblieben, hätte jemand die Vorlage später
    umbrochen. *Wer in gerendertem Text sucht, faltet die Leerzeichen vorher
    zusammen.*

136. **Ein Vergleich „Feld für Feld über alle Tabellen" sieht auch die Spur,
    die der Vorgang selbst hinterlässt.** Der Rundlauf des Schlüsselwechsels
    verglich den Bestand vor und nach dem Wechsel über **jede** Tabelle — und
    war rot, weil der Wechsel seine Marke in `settings` und seine Zeile im
    Sicherheitsprotokoll geschrieben hatte. Beides ist genau so beabsichtigt.
    *Wer einen Bestand vor und nach einem Vorgang vergleicht, nennt die
    Tabellen, in die der Vorgang selbst schreibt, ausdrücklich — und prüft sie
    eigens.* Beim **Abbruch** bleibt die Liste dagegen leer: dort darf sich
    nichts geändert haben, auch keine Marke.

137. **Eine gezählte Zahl in einem Papier wandert von Runde zu Runde weiter,
    bis jemand nachzählt.** „Sieben Wege über sechs Routen" stand im
    Änderungsprotokoll 0.8.90, im Projektstand an zwei Stellen und als
    Kommentar im Prüfstand. Es sind **sechs über fünf** — und die Rechnung
    daneben im selben Absatz (*„die sechs … minus dem Schlüsselwechsel, plus
    der Link"*) ergab das auch. Niemand hat sie gegen den Quelltext gehalten.
    *Eine Zahl in einem Papier ist eine Behauptung. Wo eine im Prüfstand
    festgenagelt werden kann — wie die 57 in `F_ROUTEN` —, gehört sie
    dorthin; wo nicht, gehört sie beim Nachtragen nachgezählt.*

138. **Wer einen Vorgang prüft, der scheitern KANN, prüft ihn so, dass das
    Scheitern rot wird und nicht abreißt.** Die Gruppen zum Schlüsselwechsel
    lesen nach dem Wechsel die Marke, die Protokollzeile und den Bestand. In
    der Gegenprobe scheitert der Wechsel **absichtlich** — und dann ist die
    Marke nicht da: `…get().value` warf, und der ganze Lauf brach ab. **Eine
    Gegenprobe, die den Lauf mitnimmt, sagt nichts darüber, welche Prüfung den
    Rückbau bemerkt hätte.** Stolperstein 103 in seiner unangenehmsten Form:
    dort reißt eine Prüfzeile am eigenen Gegenstand ab, hier an einem
    Gegenstand, den die Gegenprobe absichtlich wegnimmt. *In einer Gruppe über
    einen Vorgang, der scheitern kann, läuft jede Lesestelle danach über ein
    Auffangnetz.*

    **Und die Kehrseite, aus derselben Runde:** eine Gegenprobe, die **keine**
    Prüfung rot macht, sagt nicht „der Code ist richtig", sondern **„hier prüft
    niemand"**. Elf Gegenproben mit null stummen sahen nach einem guten
    Ergebnis aus; sieben nachgereichte brachten **zwei stumme**, und beide
    waren eine echte Lücke (Änderungsprotokoll 0.8.91, Befund L). *Die Liste
    der Rückbauten gehört gegen die Liste der neuen Verhaltensweisen gehalten,
    nicht gegen ein Gefühl für die Zahl.*

139. **Ein `on('exit')`, das nach dem Ende registriert wird, feuert nie.**
    `new Promise(r => { kind.on('exit', r); kind.kill(); })` wartet für immer,
    wenn das Kind schon von selbst geendet hat — **ohne CPU, ohne Meldung, und
    von „läuft noch" nicht zu unterscheiden.** Genau das ist passiert, als drei
    Gegenproben nebeneinander liefen: ihre Fingerprintlage ging als einzige
    **am Portversatz vorbei** (sie startet ihre Server nicht über
    `starteWeiterenServer`), alle drei griffen nach 6100, zwei bekamen ihn
    nicht, ihre Server endeten sofort — und das Aufräumen wartete auf ein
    Ereignis aus der Vergangenheit. *Wer auf das Ende eines Kindes wartet,
    fragt zuerst, ob es schon vorbei ist.* Und: *eine Portbasis, die nicht
    über die vermerkte Liste läuft, wird von keinem Wächter gesehen* — der
    Wächter zählt deshalb seit 0.8.91 auch die **Startstellen** im Quelltext.

140. **`python3 -m zipfile -e` stellt keine Ausführungsrechte wieder her.**
    `schluessel.sh` trägt im Repo den Modus `100755`; auf dem Wirt kam es ohne
    das Recht an, und `./schluessel.sh` antwortete **„Keine Berechtigung"**.
    Der Einspielweg packt das ZIP mit Pythons `zipfile` aus, und das schreibt
    die Modusbits nicht zurück — **`unzip` tut es**, nachgestellt an beiden.
    Der Weg trägt jetzt eine `chmod +x`-Zeile, und **ein Wächter hält beide
    Hälften**: das Recht an der Datei **und** die Zeile im Einspielweg —
    dieselbe Bauform wie bei Einhängung und `SICHERUNG_DIR` (Stolperstein 123).
    *Ein Recht, das nur im Repo steht, ist auf dem Wirt keins.* Gefunden im
    Betrieb, nicht im Prüfstand: der Prüfstand läuft im Arbeitsbaum, und dort
    stimmt das Recht.

141. **Eine vorübergehende Absage darf den Schlüssel nicht wegwerfen.** Die
    Einlöseseite leerte bis 0.8.91 bei **jedem** `!res.ok` die Adresse — auch
    bei der `429` der Anmeldebremse. Wer sich vorher ein paarmal beim Anmelden
    vertippt hatte und danach seinen **gültigen** Einladungslink anklickte, sah
    eine Fehlermeldung, lud neu und stand auf der Anmeldeseite: **der Link war
    nie tot, die Adresse war weg.** Am echten Server nachgestellt — dreimal
    `pruefen` hintereinander gibt dreimal 200, der Token stirbt erst beim
    Einlösen. *Wer aus einer Absage eine Handlung ableitet, unterscheidet
    „jetzt gerade nicht" von „nie wieder" — und wirft nur im zweiten Fall
    etwas weg.* Gefunden im Betrieb, nicht im Prüfstand: dort war die Bremse
    an dieser Route geprüft, die **Folge** für die Adresse aber nicht.

142. **Ein `net`-Server, der absichtlich schweigt, lässt sich nicht mit
    `close()` beenden.** `server.close()` hört nur auf zu **horchen** und
    wartet danach auf das Ende aller offenen Verbindungen. Die
    Betriebsarten „schweigt" und „stumm" des SMTP-Empfängers halten ihre
    Verbindung absichtlich offen — das `close()` darauf hängt **für immer,
    ohne CPU und ohne Meldung**, und der Lauf steht still, statt eine Prüfung
    rot zu färben. Genau das ist beim Bau dieser Runde passiert, und das
    Fehlerbild war von „die Gruppe rechnet noch" nicht zu unterscheiden.
    *Wer einen Horchposten beendet, räumt zuerst seine Verbindungen ab.*
    Dasselbe Muster wie 139, eine Ebene tiefer: dort ein Kindprozess, hier ein
    Socket.

143. **Ein langer Link steht im rohen Brief umbrochen — und das ist richtig
    so.** Der Rumpf einer Mail geht als `quoted-printable` hinaus, und dessen
    Zeilen enden spätestens bei 76 Zeichen; eine Adresse mit einem
    64-Zeichen-Schlüssel bekommt dabei einen **weichen** Umbruch (`=` am
    Zeilenende). Jedes Mailprogramm setzt ihn beim Anzeigen wieder zusammen.
    Eine Prüfung, die im **rohen** Text nach dem Schlüssel sucht, findet ihn
    nicht — und der naheliegende Schluss („der Link fehlt in der Mail") ist
    falsch. *Wer einen Brief prüft, prüft ihn wie ein Empfänger: dekodiert.*
    Verwandt mit 90: der Mock muss sich verhalten wie die echte Gegenstelle,
    und eine Gegenstelle, die nicht dekodiert, ist keine.

144. **Eine Zeile, die beim START geschrieben wird, lässt sich nicht an einem
    Server prüfen, der vor der Einstellung hochgekommen ist.** Die Startzeile
    zum Mailversand nennt Anbieter, Server und Absender — an einer Prüflage,
    die den Zugang erst **nach** dem Start einträgt, sagt sie zu Recht „nicht
    eingerichtet", und die Prüfung war rot, obwohl der Code stimmte. *Wer eine
    Startausgabe prüft, prüft sie an einem Neustart* — dort steht sie im
    Betrieb schließlich auch.

145. **Eine stumme Gegenprobe sagt nicht immer „hier prüft niemand" — manchmal
    sagt sie „diese Zeile tut nichts".** `PUT /api/mail` löschte die Marke der
    letzten Testmail ausdrücklich. Ein Rückbau darauf blieb **auch mit einer
    eigens dafür gebauten Prüfung** stumm, und der Grund lag im Code: der
    Vergleich in `mailKarte()` hängt am Hash über den Zugang und verwirft die
    Marke ohnehin — er kann sogar mehr, denn er fängt auch einen Wert, der auf
    einem anderen Weg in `settings` landet. **Zwei Mechanismen für eine Zusage
    sind einer zu viel.** Die Zeile ist entfernt, und der Rückbau zielt jetzt
    auf den Vergleich. *Wer eine stumme Gegenprobe untersucht, fragt zuerst,
    ob die zurückgebaute Zeile überhaupt etwas bewirkt.* Verwandt mit 138,
    aber die Gegenrichtung: dort fehlt die Prüfung, hier fehlt die Wirkung.

146. **Ein Rückbau, der den Prüflauf hängen lässt, blockiert seine Spur für
    immer.** Zwei Rückbauten dieser Runde taten es — der eine nahm die Frist
    über dem Mailversand weg, der andere das Abräumen der Verbindungen des
    SMTP-Empfängers. Ohne CPU, ohne Meldung, und in der Laufzeile des Treibers
    von einem stummen nicht zu unterscheiden. `gegenprobe.js` hat seitdem eine
    **Zeitgrenze je Rückbau** und ein eigenes Wort dafür. *Ein Treiber, der
    einen Rückbau fährt, rechnet damit, dass der Rückbau ihn aufhält.* Und die
    Kehrseite: **beide Rückbauten waren schlecht gezielt** — einer, der die
    Wirkung wegnimmt statt den Mechanismus zu zerstören, wird rot statt zu
    hängen.

147. **Eine Probe, die das Datenverzeichnis oder den Schlüssel ersetzt, belegt
    nichts.** Der Schlüsselwechsel galt seit 0.8.91 als „läuft, aber am echten
    Umfang unbestätigt". Der erste Anlauf, ihn zu bestätigen, löschte `data/`
    und erzeugte einen frischen Schlüssel — und tauschte damit den Schlüssel
    einer **leeren** Datenbank: Ansage „0,2 MB, rund 1 Sekunde", in
    Millisekunden vorbei, danach „noch kein Zugang". Über 662 MB sagt das
    nichts. **`data/` und `.env` gehören zusammen:** wer beides wegwirft, hat
    keine Probe mehr, sondern eine neue Anlage; wer nur den Schlüssel ersetzt
    und die Daten behält, bekommt eine Datenbank, die gar nicht mehr aufgeht —
    dann scheitert schon der Start, nicht der Wechsel. *Eine Probe an einem
    Bestand ist erst dann eine, wenn sie den echten Bestand trägt, samt seinem
    Schlüssel.* Die README trug dazu nur Prosa; seit 0.9.0 steht dort ein
    Rezept, das eine Kopie der echten Anlage nimmt, und daneben die vier
    Zeilen, an denen sich ablesen lässt, ob die Probe etwas wert war.

148. **Wer die echte `.env` in eine Probe kopiert, kopiert den laufenden
    Schlüssel mit — und `schluessel.sh` druckt ihn.** Dass das Skript den
    **alten** Wert im Klartext nennt, ist gewollt und in Abschnitt 3 begründet:
    er öffnet ab dann nur noch die Sicherungen von vorher. An einer Probe, die
    die echte `.env` trägt — und **nur die belegt etwas, siehe 147** —, ist
    dieser „alte" Wert der **laufende** Schlüssel der echten Anlage. **Das ist
    kein Fehler des Skripts, sondern eine Eigenschaft der Probe:** dieselbe
    Zeile ist an einer Wegwerfanlage harmlos und an der Kopie der echten die
    schärfste im ganzen Lauf. *Wer so probt, behandelt ihre Ausgabe wie den
    Schlüssel selbst* — kein Gespräch, kein Papier, keine Zwischenablage, die
    woanders landet. **Ist er doch abgeflossen, ist der Wechsel an der echten
    Anlage die Antwort**, und der ist jetzt geprobt: elf Sekunden Stillstand.
    Dazu gehört das Aufräumen, denn die Probe lässt zwei Dinge nebeneinander
    liegen: `.env.vor-schluesselwechsel-…` und die Sicherung
    `../kriterion-data-vor-schluesselwechsel-…` — Schlüssel neben Daten, genau
    die Lage, gegen die Abschnitt 3 argumentiert.

149. **Eine Marke belegt nur, was sie wirklich durchlaufen hat.** Der Auftrag zu
    0.9.1 wollte den Schalter der Selbstanmeldung an die Marke der Testmail
    hängen — eine einzige Bedingung, und sie sah aus wie der ganze Beleg. Sie
    ist es nicht: **die Testmail enthält keinen Link** und geht deshalb auch
    ohne `OEFFENTLICHE_ADRESSE` anstandslos durch. Die Marke wäre grün gewesen,
    während `versendeTokenLink()` bei jeder Bestätigungsmail mit
    `versand: 'aus'` abgebrochen hätte — und die Selbstanmeldung liefe genau in
    die Leere, gegen die die Kopplung gebaut war. *Wer eine Zusage an einen
    Beleg hängt, sieht nach, welchen Weg der Beleg wirklich gegangen ist — nicht
    nur, wie er heißt.* Der Schalter verlangt jetzt beides.

150. **Eine Antwort, die überall gleich AUSSEHEN muss, muss überall gleich
    lange DAUERN.** Fünf Lagen mit demselben Rumpf Byte für Byte sind kein
    Schutz, wenn eine davon eine Mail verschickt und deshalb Sekunden braucht,
    während die anderen in Millisekunden verwerfen: dann verrät die Uhr, was der
    Rumpf verschweigt, und das Formular ist wieder ein Werkzeug zum
    Durchprobieren. **Gebaut ist die Trennung: Zeile schreiben, antworten, dann
    verschicken** — der Anfragende erfährt über den Versand ohnehin nichts.
    *Und die Zusage wird gemessen, nicht behauptet:* der Prüfstand hält beide
    Wege an einem Empfänger gegeneinander, der den Versand zwanzig Sekunden
    festhält. Verwandt mit der Absage am Token, aber eine Ebene tiefer: dort
    geht es um den Wortlaut, hier um die Laufzeit.

151. **Wer eine Wirkung prüft, die NACH der Antwort eintritt, wartet nicht auf
    die Uhr, sondern auf die Sache.** Seit 0.9.1 geht die Bestätigungsmail
    hinaus, *nachdem* die Antwort geschrieben ist — die Antwort ist also kein
    Beleg dafür, dass die Mail schon da ist. Eine Prüfung, die „achthundert
    Millisekunden schlafen und dann den **letzten** Brief nehmen" sagte, war in
    beide Richtungen falsch: sie wurde rot, wenn die Mail langsamer kam, und sie
    nahm den falschen Brief, wenn eine ältere Lage dazwischenfiel. **Gesucht
    wird jetzt nach Empfänger, und gewartet wird, bis der Brief da ist.**
    *Roter Zufall ist schlimmer als keine Prüfung — er kostet Vertrauen in
    alle anderen.*

152. **Eine neue Portbasis kann nicht nur eine gesperrte Nummer treffen,
    sondern den VERSATZ zu klein machen.** Vier neue Prüflagen schoben die
    Spanne aller Basen auf 3040 — und `VERSATZ_STUFE` steht bei 3000. Damit
    läge die erste Nebenspur auf der letzten Basis der Hauptspur, und zwei
    Rückbauten kämen sich ins Gehege. **Der Wächter aus 0.8.91 hat es beim
    ersten Lauf gefunden**, namentlich und mit beiden Zahlen. *Wer eine
    Prüflage ergänzt, rechnet nicht nur ihre eigene Nummer nach, sondern die
    Spanne aller.* Behoben, ohne die Zahl zu ändern: die Bremsprobe teilt sich
    die Anlage der Gruppe davor, die dort ohnehin fertig ist. Fortschreibung
    von 127.

153. **Zwei Kästen mit denselben festen Kennungen sind einer zu viel.** Der
    Einladungslink erscheint seit 0.9.1 an zwei Stellen — beim Anlegen in
    „Zugänge" und beim Freischalten in „Anfragen". Dieselbe Funktion zeichnet
    beide, und ihre Kennungen (`zug-link-feld`, `zug-link-kopie`) sind feste
    Namen: stünden beide Kästen gleichzeitig da, nähme `getElementById` den
    **ersten**, und der Knopf „Kopieren" kopierte den falschen Link. *Wer eine
    Zeichenfunktion an einer zweiten Stelle wiederverwendet, prüft, ob ihre
    Kennungen das aushalten.* Gebaut ist die einfachste Form: der andere Kasten
    wird geleert, und es steht immer höchstens **ein** Link am Bildschirm — was
    ohnehin richtig ist.

154. **Eine Lage, die zwei Schranken zugleich reißt, prüft keine von beiden.**
    Die Selbstanmeldung weist eine Anfrage still ab, wenn schon eine offene mit
    demselben **Namen** ODER derselben **Adresse** dasteht — zwei Schranken,
    zwei Gründe. Die Prüflage dafür schickte Name und Adresse in einem Zug noch
    einmal; sie fiel damit an der ersten, und die zweite blieb **ungeprüft**.
    Aufgefallen ist es erst an einer **stummen Gegenprobe**: der Rückbau auf die
    Adressschranke blieb vollständig grün, weil die Namensschranke ihn auffing —
    und ausgerechnet die Adressschranke ist die, die eine **fremde** Adresse vor
    beliebig vielen Bestätigungsmails schützt. *Wer zwei Regeln nebeneinander
    baut, prüft jede an einer Lage, die nur sie reißt* — und dazu die Gegenlage,
    die keine von beiden reißt. Verwandt mit 138, aber die Ursache liegt eine
    Ebene tiefer: dort fehlt die Prüfung, hier verdeckt eine Prüfung die andere.

155. **Ein Bedienelement, das seinen eigenen Zustand ein- und ausschaltet, darf
    nicht an diesem Zustand hängen.** Die Karte „Anfragen" trug den Schalter der
    Selbstanmeldung — und erschien selbst nur, wenn der Schalter an war oder
    Anfragen vorlagen. An einer frisch eingespielten Anlage ist beides nicht der
    Fall: **die Karte fehlt, also fehlt der Schalter, also bleibt die
    Selbstanmeldung für immer aus.** Aufgefallen ist es erst im Betrieb, nach
    dem Einspielen.
    **Der Prüfstand konnte es nicht finden**, und das gehört dazu: er prüfte
    genau das, was gebaut war — *„ist die Selbstanmeldung aus und nichts offen,
    fehlt die Karte"* —, die Prüfung war grün, und die Gegenprobe färbte sie
    ordentlich rot. Beides war richtig. **Was fehlte, war die Frage, ob sich der
    Zustand von dort aus überhaupt verlassen lässt.**
    *Wer eine Anzeige an eine Bedingung knüpft, sucht den Zustand, in dem die
    Bedingung falsch ist, und fragt: komme ich von hier aus wieder heraus?*
    Verwandt mit 47 („ein Zustand, keine zweite Wahrheit"), aber die andere
    Richtung: dort steht ein Zustand doppelt da, hier ist einer nicht mehr zu
    verlassen.

156. **Eine Verneinung über die eigene Quelle trifft auch die Stelle mit, die
    die Sache richtig macht — gezählt wird, nicht verneint.** Die Anmeldeseiten
    sollten Marke und Namen nicht mehr von Hand stapeln; geprüft wurde das
    zunächst als *„das Muster `${MARK(…)}<h1>` steht nirgends in `app.js`"*.
    **Es steht dort — im Helfer, der die beiden richtig zusammensetzt.** Die
    Prüfung war rot, und sie hatte recht: die Verneinung schließt die eine
    erlaubte Stelle mit ein.
    *Wer über die eigene Quelle prüft, dass etwas nur an EINER Stelle steht,
    zählt die Vorkommen und hält daneben fest, welche Stelle die richtige ist.*
    Zwei Zeilen sagen dann zusammen, was eine Verneinung nicht sagen kann.
    Verwandt mit 81 („erst der Gegenstand, dann die Eigenschaft"): auch dort
    trägt erst das Paar aus zwei Zeilen die Aussage.

157. **Zwei Namen für dieselbe Datei sind eine Stelle, die auseinanderläuft;
    verglichen wird der Inhalt, nicht der Name.** `favicon.svg` und
    `marke-hell.svg` lagen Byte für Byte gleich in `public/`. Solange niemand
    sie anfasst, fällt das nicht auf; wer eine der beiden ändert, lässt die
    andere zurück, und ab dann zeigt der Reiter des Browsers etwas anderes als
    der Druck. **Der Name ist dabei das Täuschende:** zwei verschiedene Namen
    sehen nach zwei verschiedenen Sachen aus.
    *Der Prüfstand hält deshalb nicht nur den einen Fall fest, sondern die
    allgemeine Form: in `public/` liegt keine Datei zweimal unter zwei Namen —
    verglichen über den Inhalt.* Der Rückbau dazu brauchte einen zweiten
    Rückbauweg im Treiber: eine entfernte Datei lässt sich nicht über eine
    Textersetzung zurückholen.

158. **Ein Einspielweg, der Dateien kopiert, entfernt keine — eine gelöschte
    Datei bleibt auf dem Wirt liegen und läuft mit.** Nach dem Einspielen der
    Nacharbeit meldete die Anlage `fad3e5ed`, und das war der Stand keines
    einzigen Commits — nachgemessen an je einem echten Server aus einem
    sauberen `git archive`-Export, für jeden Stand der Runde. Die Ursache war
    **eine Datei zu viel**: `public/marke-hell.svg` war entfernt worden und lag
    noch da. Nachgestellt: derselbe Export, dieselbe Datei wieder hineingelegt,
    **derselbe Wert Zeichen für Zeichen.**
    **Der Server lief dabei einwandfrei, und jede Prüfung war grün** — der
    Prüfstand kann eine Datei zu viel auf einem fremden Wirt nicht sehen. Der
    Fingerprint konnte es, weil er über **alles** unter `public/` geht und nicht
    über eine Liste erwarteter Namen: *wäre er eine Liste, hätte er hier
    geschwiegen.* **Er schlägt deshalb in beide Richtungen aus — bei einer Datei
    zu wenig wie bei einer zu viel.**
    *Der Einspielweg im README ersetzt das Verzeichnis, statt darüber zu
    kopieren, und genau dafür ist das da.* Wer abkürzt und über den vorhandenen
    Ordner entpackt, bekommt diesen Fall. **Und was der Fingerprint weiterhin
    nicht sagt, ist WELCHE Datei abweicht** — dafür steht der Handgriff im
    README, und eine Zeile in der Karte „Anlage" ist für die nächste
    Nacharbeitsrunde vorgemerkt (Abschnitt 10).

159. **Wer eine zweite Schranke vor die Anmeldung setzt, sucht ALLE Wege
    dahinter — und einer davon ist der Rücksetzlink.** Der zweite Faktor aus
    0.10.0 stand nach dem ersten Bau vor `POST /api/login` und sonst nirgends.
    `POST /api/token/einloesen` meldete unverändert **gleich an**: ein Admin
    erzeugt für einen fremden Zugang einen Rücksetzlink, öffnet ihn selbst,
    setzt ein Passwort — und wäre drin gewesen, ohne je einen Code zu brauchen.
    **Die Schranke hätte gegen jeden gehalten außer gegen den, der sie am
    leichtesten umgeht.** *Wer eine Anmeldung verschärft, zählt die Stellen, an
    denen eine SITZUNG entsteht, und nicht die, an denen ein Passwort geprüft
    wird* — es sind drei (`/api/setup`, `/api/login`, `/api/token/einloesen`),
    und `legeSitzungAn` nennt sie alle. Der Sonderfall „erster Link, noch kein
    Passwort" löst sich dabei baulich und ist trotzdem nachgestellt worden:
    einschalten setzt eine Anmeldung voraus, also kann ein Zugang ohne Passwort
    keinen bestätigten Faktor haben.

160. **Ein Erfolg, der noch keiner ist, darf den Zähler der Bremse nicht
    löschen.** `POST /api/login` rief `noteSuccess` unmittelbar hinter der
    Passwortprüfung — richtig, solange die Anmeldung mit dem Passwort fertig
    war. Mit einem zweiten Schritt dahinter war es **die Lücke**: wer das
    Passwort kennt und Ziffern rät, holt sich vor jedem Versuch einen frischen
    Ausweis, und dieser Ruf löschte den Zähler, den der zweite Schritt gerade
    aufgebaut hatte. **Die Bremse hätte dort nie zugeschlagen** — sechs Ziffern
    wären eine Million ungebremste Versuche gewesen. Aufgefallen ist es an der
    eigens dafür gebauten Prüfung: zwölf falsche Codes hintereinander ergaben
    zwölfmal 401 und kein einziges 429.
    *Wer einen Vorgang in zwei Schritte teilt, sieht nach, welche Zeilen ihn für
    ABGESCHLOSSEN halten.* `noteSuccess` steht jetzt hinter der Verzweigung —
    einmal für den einstufigen Weg, einmal im zweiten Schritt. **Eine halb
    gelungene Anmeldung ist kein Erfolg.**

161. **Ein Rückbau, der die Zahl der Platzhalter ändert, reißt den Lauf ab
    statt ihn rot zu machen.** Der Rückbau auf „ein Code gilt genau einmal"
    strich die Bedingung `letzter_zaehler < ?` samt ihrem Platzhalter aus dem
    `UPDATE`. Die vorbereitete Anweisung bekam danach **drei Werte für zwei
    Stellen**, better-sqlite3 warf, der Server starb — und der Lauf war nach
    166 Sekunden **abgerissen**, ohne eine einzige rote Prüfung. Derselbe Fall
    traf den Versuch, eine der beiden neuen **Tabellen** aus der DDL zu nehmen:
    `auth.js` bereitet seine Anweisungen beim Laden vor, und „no such table"
    beendet den Prozess, bevor irgendetwas geprüft ist.
    *Ein Rückbau macht die Sache WIRKUNGSLOS, er entfernt sie nicht.* Die
    Bedingung steht jetzt als `(letzter_zaehler IS NULL OR ? IS NOT NULL)` da —
    dieselbe Form, dieselbe Zahl der Stellen, nur immer wahr; und statt der
    Tabellen wird der **Index** daneben zurückgenommen, der dieselbe Aussage
    über `CREATE … IF NOT EXISTS` trägt. Fortschreibung von 138, aber die
    Ursache liegt eine Ebene tiefer: dort war der Rückbau zu **groß**, hier ist
    er **formal unverträglich** mit dem Code, den er stehen lässt.

162. **Ein Testvektor belegt nur, was er wirklich durchläuft — auch wenn seine
    Zahl groß aussieht.** Der größte Vektor aus RFC 6238 (T = 20 000 000 000)
    sah nach der Stelle aus, an der der achtbytige TOTP-Zähler über 2³² läuft;
    im Quelltext stand das als Begründung neben der geteilten Schreibweise
    (`writeUInt32BE` zweimal). **Nachgerechnet ist der Zähler dort 666 666 666
    und liegt damit weit UNTER 2³².** Die obere Hälfte war also von keinem
    einzigen Vektor berührt, und der Rückbau darauf blieb folgerichtig ohne
    Wirkung. *Gehalten wird sie jetzt gegen eine ZWEITE Bauform statt gegen ein
    Papier:* `writeBigUInt64BE` schreibt dieselben acht Bytes in einem Zug, und
    beide Wege müssen für Zähler über 2³² dasselbe ergeben — samt der
    Gegenlage, dass verschiedene Zähler auch verschiedene Codes ergeben.
    Verwandt mit 81, aber die andere Richtung: dort fehlt der Gegenstand, hier
    ist er da und trifft die Sache nicht.

163. **Eine Schranke, die erst hinter einer anderen Absage steht, lässt sich
    von außen nicht mehr belegen.** Der zweite Anmeldeschritt aus 0.10.0 hatte
    die Anmeldebremse zunächst **hinter** dem Verbrauch des Ausweises: erst
    Ausweis prüfen, dann Bremse fragen. Fachlich richtig — und **der Rückbau
    darauf blieb vollständig STUMM.** Der Grund: sobald die Sperre steht, fällt
    schon Schritt 1 mit 429 aus, und eine Prüfschleife über beide Schritte sieht
    dieselbe 429 mit und ohne die Zeilen im zweiten. *Wer nur die Kette prüft,
    prüft das schwächste Glied und nicht das gemeinte.*
    **Zwei Dinge zusammen haben es behoben.** Die Bremse steht jetzt **ganz
    vorn** in der Route, wie an `POST /api/login` und `POST /api/bestaetigung`
    auch — ein gesperrter Aufrufer bekommt überall dieselbe 429 und nirgends
    stattdessen eine Auskunft über seinen Ausweis. Und die Prüfung fragt den
    zweiten Schritt **unmittelbar**, mit einem erfundenen Ausweis: trägt die
    Bremse, kommt 429, bevor der Ausweis überhaupt angesehen wird; trägt sie
    nicht, kommt die 401 über den Ausweis. **Dazu die Gegenlage vorher** —
    ungesperrt antwortet derselbe Ruf mit 401 (Stolperstein 81).
    *Die Reihenfolge ist damit nicht bloß aufgeräumt, sie ist die Bedingung
    dafür, dass die Zusage überhaupt geprüft werden kann.*

164. **SQLite faltet in `LIKE` und `lower()` nur ASCII — und es scheitert
    nicht, es findet weniger.** Der naheliegende Weg für eine serverseitige
    Suche ist `WHERE spalte LIKE '%…%'`; er ist schnell (0,62 ms an 1000
    Einträgen gegen 11,4 ms für einen Durchlauf in JS) und **verhält sich
    stillschweigend anders als vorher**: `lower('Ü')` ist `'Ü'`, und damit
    findet die Eingabe „übergross" den Eintrag „STICHSÄGE ÜBERGROSS" **nicht**.
    Nachgestellt: 0 Treffer statt 1, ohne Fehler, ohne Warnung.
    *Der Unterschied fällt bei englischen Testdaten nie auf.* Behoben über eine
    in SQL eingehängte Funktion `kkl` (`db.function` in `db.js`), die
    `toLowerCase()` aus JS benutzt — genau das, was der Browser vorher getan
    hat. Gegenprobe 132 nimmt ihr die Unicode-Hälfte weg und lässt ASCII
    stehen; sie färbt genau die Umlautzeilen rot und keine andere.
    **Die Lehre ist allgemeiner als der Fall:** wer eine Vergleichslogik von
    einer Schicht in eine andere verlegt, verlegt sie in eine andere
    Sprachdefinition. `includes()` in JS, `LIKE` in SQLite und `MATCH` in FTS5
    sind drei verschiedene Zusagen darüber, was „gleich" heißt.

165. **Ein FTS5-Trigramm-Index scheitert bei ein oder zwei Zeichen nicht — er
    liefert still null Treffer.** Das war die Rechnung, die FTS5 in dieser
    Runde aus dem Rennen genommen hat, und der Grund ist nicht die Größe des
    Index (5,17 MB bei 1,75 MB Nettotext, fast das Dreifache), sondern das
    Verhalten: `txt MATCH '"b"'` und `txt MATCH '"bo"'` werfen **keinen
    Fehler**, sie geben eine leere Menge zurück. Die Suche fand vorher ab
    **einem** Zeichen. Ein Umbau darauf hätte dem Benutzer etwas weggenommen,
    und zwar an einer Stelle, an der niemand einen Fehler gesehen hätte —
    sondern nur „findet nichts".
    *Eine Schnittstelle, die bei zu kurzer Eingabe leer statt laut antwortet,
    ist gefährlicher als eine, die scheitert.*

166. **Ein `const` auf oberster Ebene eines klassischen Skripts landet NICHT am
    `window`.** Eine Prüflage über die Oberfläche wollte warten, bis die Suche
    durch ist, und fragte dazu `w.state.suchLaeuft`. `state` ist in
    `public/app.js` ein `const` auf oberster Ebene: `w.state` ist
    **`undefined`**, die Wartebedingung war damit sofort falsch, und die
    Schleife lief **nie** — sie sah aus wie eine Wartezeit und war keine.
    Aufgefallen ist es nur, weil die Zeile daneben trotzdem grün wurde.
    *Funktionsdeklarationen landen am `window`, `const` und `let` nicht.* Die
    Prüfung wartet jetzt auf die **sichtbare Wirkung** — solange gesucht wird,
    steht „sucht …" in der Zählzeile. Das ist ohnehin die bessere Frage: es ist
    der Zustand, den ein Mensch sieht.

167. **Ein regulärer Ausdruck auf `body {` trifft `html, body {` zuerst.** Ein
    Wächter sollte die Zeilenhöhe des `body` ablesen, um die Höhe der Marke
    dagegen zu rechnen. `mkCss.match(/body \{[^}]*\}/)` fand den **ersten**
    Treffer — und der ist im Stylesheet `html, body { ... }`, ein Block ohne
    `line-height`. Ergebnis: `null`, und zwei Rechnungen darauf wurden rot mit
    der Meldung „3.1rem gegen 0.000rem".
    *Ein Selektor als Suchmuster trifft jeden Block, in dem er vorkommt, nicht
    den, den man meint.* Der Wächter geht jetzt über **alle** `body`-Blöcke und
    nimmt den, der die Zeilenhöhe wirklich setzt.

168. **Zwei Rückbauten mit derselben Nummer sind im Namensfilter des
    Gegenprobentreibers nicht auseinanderzuhalten.** Die neuen Rückbauten
    dieser Runde sollten bei 123 fortsetzen — die höchste Nummer im Papier war
    122. Im Quelltext lag aber schon eine **123**: die Liste ist nicht
    monoton, spätere Runden haben Nummern zwischen älteren eingefügt.
    `node gegenprobe.js 2 123 …` fuhr daraufhin **zwei verschiedene**
    Rückbauten unter demselben Wort, und die Tabelle hätte zwei Zeilen mit
    derselben Nummer getragen.
    *Die höchste Nummer steht nicht am Ende der Liste.* Vor dem Nummerieren
    wird gezählt, nicht geblättert — und die Nummern laufen jetzt von 124 bis
    157.

169. **Ein Feldname sagt nicht, was in dem Feld steht.** `testLast` in der
    Listenantwort klingt nach „letzter Testtag" und trägt die **letzte
    Tagesnote** — eine Zahl von 1 bis 5. Eine frisch geschriebene Prüfung
    verglich sie mit `'2026-05-05'` und wurde rot, obwohl die Anlage richtig
    antwortete. *Der Beleg für die Bedeutung eines Feldes steht an seiner
    Entstehungsstelle (`testStats`) und nicht in seinem Namen;* die Kachel
    schreibt daneben „zuletzt 4", und die Sortierung `testlast_desc` vergleicht
    Zahlen — beides hätte es verraten.

170. **Eine Prüfung, die ein Feld ungeschützt liest, reißt den Lauf ab, wenn ein
    Rückbau das Feld wegnimmt.** Die Zeile „Der Aufbau steht: ein Eintrag trägt
    wirklich einen Testtag" las `vsMitTest.testDays.length`. Der Rückbau, der
    `testDays` **gar nicht** mehr mitschickt, ließ den Zugriff werfen — und der
    ganze Lauf riss ab, statt eine Prüfung rot zu färben. **Eine abgerissene
    Gegenprobe belegt nichts:** sie sagt nicht, ob die Zusage geprüft ist, sie
    sagt nur, dass niemand mehr weiterzählen konnte (Stolpersteine 138 und 161).
    *Die Regel aus Stolperstein 81 gilt damit nicht nur für den Gegenstand,
    sondern für jedes Feld, das eine Prüfung anfasst:* `(… || []).length` macht
    aus dem Wurf ein `0 === 1`, und die Zeile sagt weiterhin dasselbe.

171. **Ein Mock, der augenblicklich antwortet, kann eine Zusage über die
    REIHENFOLGE nicht belegen.** Die Suche gibt jeder Anfrage eine laufende
    Nummer, damit die Antwort auf „bo" die auf „bosch" nicht überschreibt. Der
    Rückbau, der die Nummer entfernt, blieb **vollständig stumm** — der Mock
    löste seine Antwort im selben Tick auf, und zwei Anfragen können sich dann
    gar nicht überholen. **Die Zusage war gebaut und ließ sich nicht belegen.**
    *Wer eine Aussage über Reihenfolge prüfen will, braucht eine stellbare
    Verzögerung:* der Mock bekommt sie je Anfrage, und die Lage lässt die
    ERSTE Antwort später eintreffen als die zweite.

172. **Ein Zähler, der nur eine Teilmenge der Anfragen sieht, belegt nicht, dass
    keine Anfrage entstand.** „Das Leeren der Suche kostet keine Anfrage" wurde
    an der Zahl der Anfragen **mit `?q=`** gemessen. Der Rückbau, der beim
    Leeren den ganzen Bestand neu holt, fragt `/api/items` **ohne** Parameter —
    der Zähler bewegte sich nicht, und der Rückbau blieb stumm.
    *Die Frage lautete „kostet es eine Anfrage" und nicht „kostet es eine
    Suchanfrage".* Gezählt wird jetzt über alle Anfragen an die Liste. **Ein
    Filter im Zähler ist eine stillschweigende Verengung der Zusage.**

---

## 7. Prüfstand

Der Prüfstand liegt als `pruefung.js` im Quelltext und läuft über `npm test`. Er
legt **echte Server mit echten, verschlüsselten Datenbanken** in
Wegwerfverzeichnissen an — `data/` bleibt unangetastet, und **alle Anlagen
entstehen frisch** über Einrichtungsseite und Verwaltung; einen präparierten
Altbestand gibt es seit 0.8.1 nicht mehr. Die Oberflächenprüfungen brauchen
`jsdom` (Entwicklungsabhängigkeit; per `.dockerignore` und `--omit=dev`
außerhalb des Docker-Images). **`pruefung.js` und `gegenprobe.js` landen nicht
im Image.**

**Stand: 3815 von 3815 bestanden** (0.11.0) — 139 neue Prüfungen, **34
Gegenproben**, acht neue Gruppen.

### Was abgedeckt ist

- **Start und Erstanlage:** frische Installation, Einrichtungsseite,
  Zugangswechsel, Anmeldebremse und die Ablehnung von `AUTH_RESET` — auf
  eigenen Servern mit eigenen Datenverzeichnissen.
- **Zugangsverwaltung:** ein eigener Server, auf dem die Zugänge **über die
  Verwaltung selbst** entstehen. **Fünf Lagen nebeneinander** — Eigentümerin,
  **Admin ohne Eigentümerrecht**, gewöhnlicher Benutzer, Gesperrter, Grabstein;
  die mittlere ist die wichtigste, ohne sie wäre „Admin" von „Eigentümer" nicht
  zu unterscheiden. Jede Verweigerung mit ihrem Erfolgsfall daneben **und** der
  Nachschau in der Datenbank. Dazu **`zugang.js` als echter Prozess**, mit
  geröhrter Eingabe und beantworteten Rückfragen (Stolperstein 77).
- **Mehrbenutzerbetrieb und Rechte:** mehrere echte Rufer nebeneinander
  (Stolperstein 56), an allen sechs Trägern — an Link, Datei und Videoweg mit
  **echtem Multipart-Upload**, denn ein nachgereichter `INSERT` liefe an
  Wächter und multer vorbei und bewiese nichts über die Route.
- **Der Name an der Datei- und der Linkzeile:** je drei Fenster nebeneinander
  (drei Zugänge mit Adminrolle, ein Zugang, drei ohne), **fünf Verfasserlagen**
  an acht Zeilen — darunter ein Name mit spitzen Klammern, eine herrenlose Zeile
  und die Suchzeile eines Grabsteins. **Die Dateizeile bekommt ihre eigenen
  Gegenlagen und erbt keine.**
- **Kriterien und Gewichtung:** anlegen, umbenennen, sortieren, löschen,
  lückenlose Nummerierung. Der Rechenweg an einer Lage mit **drei Bewertern und
  ungleich vielen Stimmen je Kriterium**; alle Gewichte 1 ergeben den
  ungewichteten Schnitt (die Gegenzahl wird aus den Zeilenwerten
  **nachgerechnet**, nicht hingeschrieben); ein unbewertetes Kriterium bringt
  sein Gewicht **nicht** in den Nenner, auch in der schärfsten Lage nicht; alle
  Werte 5 ergeben **genau** 5,0. Dazu zehn Abweisungen mit 400, die Rundung, das
  Komma in der Meldung und die Klemme mit **zweiter Sitzung**.
- **Export und Import** in beiden Richtungen, auch mit alten Dateien ohne die
  neueren Felder, samt Rundlauf durch drei Verfasser — **mit Videos** in beiden
  Schalterstellungen, samt der Marke ohne Bytes und einem unlesbaren Standbild,
  das übergangen und **genannt** wird.
- **Dateien und Auslieferung:** jede einzelne Schicht aus Abschnitt 5a — dafür
  lädt der Prüfstand eine echte HTML-Seite mit Skript und eine echte SVG hoch
  und sieht sich **Header und Bytestrom** an (Stolperstein 98). Die
  `.docx`-Vorschau an einer selbst gebauten, echten `.docx`.
- **Videos:** ein echtes MP4 und eine echte WebM — Typ, `inline`, der Name mit
  der Endung des *erkannten* Typs, `nosniff`, die Sicherheitsregel. Eine Datei
  mit **falscher Endung und Videobytes** kommt herein, eine mit Videoendung und
  Bildbytes nicht. `size=thumb`/`medium` liefern an einer Videozeile ein
  **Bild**, ohne Größe die **Videodatei**, bytegleich. Die **Ranges** mit `206`,
  `Content-Range`, offenem Ende, Suffix und zwei Absagen mit `416`; ein **Foto
  bietet weiterhin keine an**. Und: das Nachrüsten der Vorschaubilder lässt das
  Standbild in Ruhe, tut am Foto daneben aber weiterhin seine Arbeit.
- **Der Papierkorb:** der **Rundlauf** ist die tragende Prüfung — ein Eintrag
  mit Foto, echtem Video, zwei Dateien, zwei Links, zwei Tags, Kommentaren
  **aller vier Arten** (darunter einer von einem **Grabstein** und ein
  **herrenloser**), Bewertungen zweier Bewerter samt einer zurückgesetzten und
  Testtagen zweier Verfasser **am selben Tag** wird gelöscht, wiederhergestellt
  und **Feld für Feld** gegen die echte Serverantwort gehalten; Fotos und Video
  kommen **bytegleich** zurück. Dazu: die Zeile entsteht **in derselben
  Transaktion** (ein Auslöser in der Datenbank erzwingt den Fehlschlag), die
  Bytes liegen **nicht** in der JSON, die **dreißig Tage** an **beiden** Seiten
  und **jede** der beiden Aufräumstellen einzeln.
- **Die Sicherung:** `VACUUM INTO` an einer echten Anlage — die Kopie entsteht,
  ist **ohne Schlüssel nicht lesbar**, **mit** Schlüssel vollständig, und der
  Ausgangsstand ist danach unverändert. Sieben Absagen am Zielort, jede mit
  ihrer Begründung **und** der Nachschau, dass danach keine Datei da liegt;
  darunter ein **Symlink**, der aus der Wurzel herausführt. „Letzte Sicherung"
  folgt dem **Dateisystem**. Und die Probe, dass `db.backup()` kein zweiter Weg
  ist.
- **Der Schlüsselwechsel:** an echten, verschlüsselten Anlagen, ohne Server —
  gewechselt wird bei angehaltener Anlage, und genau so läuft die Prüfung. Der
  **Abbruch mit `kill -9`** braucht eine Anlage, an der der Wechsel messbar
  dauert (rund 60 MB, gemessen statt geraten); ist er wider Erwarten zu schnell,
  **sagt die Prüfung das** und bleibt nicht still grün. Die **Absage bei zu
  wenig Platz** braucht ein volles Dateisystem; lässt sich keines einhängen,
  wird die Lage **ausdrücklich übersprungen** statt still ausgelassen.
- **Der Mailversand am ECHTEN SMTP-Gespräch:** ein **SMTP-Empfänger aus `net`**
  führt das Protokoll wirklich, und „angekommen" heißt ein Brief, den er
  aufgehoben hat — **keine zweite Entwicklungsabhängigkeit**. Er kann fünf
  Betriebsarten (annehmen, mit 550 ablehnen, gar nicht grüßen, grüßen und
  schweigen, sofort auflegen) und **dekodiert `quoted-printable`**, wie ein
  Empfänger es tut (Stolperstein 143). **Die Frist wird GEMESSEN, mit einer
  Untergrenze**, die den Beleg erst zu einem macht: der tröpfelnde Empfänger
  muss über 7,5 Sekunden brauchen — bliebe er darunter, hätte ihn eine von
  nodemailers eigenen Fristen gefangen.
- **Die Selbstanmeldung, vom Formular bis zum gesetzten Passwort.** **Die immer
  gleiche Antwort wird BYTEWEISE und mit der UHR geprüft:** verglichen wird der
  rohe Antwortkörper der fünf Lagen, nicht ein Feld daraus, und die Laufzeiten
  stehen daneben — **samt der Gegenlage zur Messung selbst** (hätte der
  Empfänger sofort abgesagt, wäre „keine wartet" wahr, ohne etwas zu belegen).
- **Der zweite Faktor: die Codes werden gegen die Testvektoren aus RFC 6238
  geprüft, nicht gegen die eigene Rechnung** — sonst prüfte die Anlage sich
  selbst. Alle sechs Vektoren, sechs- und achtstellig, dazu der Base32-Rundlauf
  gegen RFC 4648. **Jeder der vier Kennwerte wird einzeln festgenagelt.**
  **Jede Lage bekommt ihren eigenen Zugang** — der verbrauchte Zähler steht je
  Zugang, und zwei Lagen an einem verdeckten einander (Stolperstein 154); das
  Zeitfenster läuft über **vier** Zugänge. **Der Prüfstand wartet auf ein ruhiges
  Fenster, statt fest zu schlafen:** fiele die Grenze der dreißig Sekunden
  dazwischen, würde eine Prüfung zufällig rot — *roter Zufall ist schlimmer als
  keine Prüfung.*
- **Die Volltextsuche, je eine Lage für jede der sieben Quellen** — mit
  erfundenen Suchwörtern, damit jede Trefferzahl **exakt** ist und nicht
  „mindestens einer": fällt eine Quelle aus der Abfrage, wird genau sie
  namentlich rot. Dazu **Umlaute in beide Richtungen**, ein Teilstring aus einem
  einzigen Zeichen, **Prozentzeichen und Unterstrich als Text samt der
  Gegenlage, dass man sie suchen kann**, und die Zusicherung, dass jede
  Trefferliste eine **Teilmenge** der Liste ohne Suchbegriff ist. **Feld für
  Feld gegen eine namentliche Liste** wird geprüft, dass `searchText` fort ist
  und **sonst nichts**, und dass `testDays` genau dann fehlt, wenn die
  Zeitleiste aus ist. Am Bildschirm: dass **drei Anschläge EINE Anfrage** sind,
  dass der zuletzt getippte Begriff gewinnt, dass das Leeren ohne Anfrage
  auskommt und dass die Liste **stehenbleibt**, wenn die Suche scheitert.
- **Geheimnisse werden an vier Orten gesucht** — in **jeder Spalte jeder Zeile
  jeder Tabelle** (mit der einen benannten Ausnahme, wo etwas stehen muss), im
  Startprotokoll, in **jedem Antwortkörper** und in der Karte des Eigentümers.
  Dieselbe Bauform beim Mailpasswort (0.9.0), beim TOTP-Geheimnis und bei den
  Wiederherstellungscodes (0.10.0) — **samt der Gegenlage, dass die Suche
  überhaupt etwas findet** (Stolperstein 81).
- **Der Quelltext selbst:** die gepflegte Liste **aller schreibenden Routen
  (aktuell 69, und die Zahl wird ausdrücklich geprüft)** samt der Art ihrer
  Absicherung, gehalten gegen `server.js` — **in beide Richtungen**. Dazu die
  Zählung, dass Adminfrage und Eigentümerfrage je genau einmal vorkommen; die
  geschlossenen Listen aus `auth.js` samt ihren Zahlen (**zwanzig** Vorgänge,
  **dreizehn** Merkmale, **sieben** Zwecke); die Spanne des Gewichts; der
  Wächter über den **Content-Type** samt seiner Gegenprobe; der Wächter über den
  **Cookienamen**; der Wächter „am Bildschirm heißt es Link, nicht Token"; die
  Wörter „Leitung" und „Backup"; die Liste der persönlichen Schlüssel
  (**acht**); der Wächter über die **Migrationsblöcke** (**fünf**, und keiner
  für 0.11.0); und der Wächter über den **Handgriff im README**, der die Dateien
  aufzählt, über die der Fingerprint geht — geprüft gegen den **abgeleiteten**
  Modulgraphen und in beide Richtungen.
- **Der Sprachwächter:** eine **kurze** Wortliste, gesucht in `Doku/`, in den
  **Kommentaren** des Quelltextes und in `CHANGELOG.md`. **Er ist die Ausnahme
  von Stolperstein 106** — jeder andere Wächter filtert die Kommentarzeilen weg,
  dieser sieht sie an — und lässt dafür Code in Ruhe; was in Backticks steht,
  ist zitierter Code und keine Sprache. Acht Gegenproben an gestellten Texten,
  dazu die **Zahl** der angesehenen Dateien ausdrücklich (Stolperstein 113).
- **Das Werkzeug selbst:** das Lockfile, der `Dockerfile`, der
  Versions-Fingerprint und die Datei für den Prüflauf bei jedem Push — teils
  über einen Server aus einer **Kopie** des Quelltexts. Dazu eine **Selbstprobe
  des Prüfrahmens**, die den Gruppenfilter als eigenen Prozess fährt und Ausgabe
  und Rückgabewert von außen ansieht (Stolperstein 94), und **zwei Wächter über
  die eigenen Prüflagen**: die Portbasen samt Versatz und die Zusage, dass
  **keine Prüflage ihren Server zurücklässt**.

**Die Zahl der Abhängigkeiten steht im Prüfstand fest** — `npm ls --omit=dev`
liefert **122 Pfade**. Wächst der Baum später still, wird es namentlich rot.

### Die fünf Migrationsabschnitte — ENTFAELLT MIT 1.0

**Es gibt fünf, und alle tragen dieselbe Marke.** Je Block wird nachgestellt:
die Spalte kommt dazu, die Bestandszeilen stehen auf der Vorgabe **aus dem
`DEFAULT`** (am Quelltext nachgesehen, nicht aus einem `UPDATE`), ein zweiter
Lauf bleibt **stumm**, und eine **frische** Anlage trägt die Spalte **ohne**
Migration.

| Abschnitt | Prüflage | Was er außerdem belegt |
|---|---|---|
| 0.8.3 | Datenbank aus 0.8.2, `comments.images_removed` fehlt | die Vorgabe null an der Bestandszeile |
| 0.8.30 | Datenbank aus 0.8.20 — **so eingerichtet, dass die falsche Antwort auffällt**: der Eintrag gehört `bert`, Eigentümerin ist `chefin` | fielen die Zeilen an den Eigentümer, stünde dort `chefin`; eine dritte Linkzeile an einem herrenlosen Eintrag fällt danach dem Auffangnetz zu — **beide Regeln an einem Lauf** |
| 0.8.31 | dasselbe an `attachments` | `attachments` fällt **nicht** aus `ordneBestandZu()` mit |
| 0.8.40 | Datenbank aus 0.8.31, drei Kriterien **mit Bewertungen** | **der gewichtete Gesamtschnitt ist nach der Migration derselbe wie der ungewichtete davor** |
| 0.8.50 | Datenbank aus 0.8.40, `photos` **mit Fotos darin** | **jede der beiden Spalten wird EINZELN nachgerüstet** (zwei weitere Prüflagen, Stolperstein 108); es gibt **keinen `CHECK`** |

**Die Probe „Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start" gehört
allen fünf Blöcken.** Sie steht im Abschnitt von 0.8.31 und ist mit 0.8.50
**erweitert worden, nicht verdoppelt**. *Wer nur einen Block entfernt, muss sie
umschreiben statt löschen.*

**Für jede neue TABELLE steht dieselbe Probe daneben, und zwar eigens statt
abgeschrieben:** die Tabellen werden von Hand entfernt, der Server startet
einmal, und sie sind wieder da — **samt der Gegenlage, dass eine von Hand
entfernte SPALTE nicht von selbst zurückkommt.** Damit ist Stolperstein 13 an
einem Lauf von beiden Seiten belegt. *Die DDL einer Tabelle hat bewusst keinen
Rückbau: nähme man sie weg, stürbe der Server beim Laden, und der Lauf risse ab
statt rot zu werden (Stolperstein 161) — zurückgenommen wird der **Index**
daneben, der dieselbe Aussage trägt.* **Ausdrücklich geprüft ist außerdem: das
Schema einer gewachsenen Anlage ist nach dem Start dasselbe wie das einer
frischen.**

### Die Gegenproben — und was sie gefunden haben

**Wichtiger als die Zahl der Prüfungen: die Prüfungen werden gegengeprüft.**
**159 gezielte Rückbauten** (0.10.0: 125) führen jeweils zu genau den passenden
Fehlschlägen. Was dabei gilt:

- **Gemessen wird an den Namen der roten Prüfungen, nicht an ihrer Zahl.** Wo
  eine breite Prüfung über den ganzen Quelltext geht, schlägt sie bei jeder
  Gegenprobe mit an und täuscht Abdeckung vor (Stolperstein 49).
- **Bleibt eine Gegenprobe stumm, ist die erste Frage nicht „ist die Regel
  überflüssig", sondern „habe ich die Stelle getroffen, an der sie wirkt"**
  (Stolperstein 50), die zweite „liegt dieselbe Regel noch woanders"
  (Stolperstein 51) — und die dritte: **„tut die zurückgebaute Zeile überhaupt
  etwas"** (Stolperstein 145).
- **Wo eine Regel mehrfach steht, ist die Frage nicht „ist das redundant",
  sondern „deckt eine Stelle die andere zu"** (Stolperstein 53).
- **Ein Rückbau macht die Sache WIRKUNGSLOS, er entfernt sie nicht**
  (Stolperstein 161). Sonst reißt der Lauf ab, statt rot zu werden — und **eine
  abgerissene Gegenprobe belegt nichts.**
- **Die ganze Ausgabe ansehen, nicht nur die roten Punkte** (Stolperstein 24).
- **Eine Gegenprobe, die KEINE Prüfung rot macht, sagt nicht „der Code ist
  richtig", sondern „hier prüft niemand".** *Elf Gegenproben mit null stummen
  sahen in 0.8.91 nach einem guten Ergebnis aus; sieben nachgereichte brachten
  zwei stumme, und beide waren eine echte Lücke.*

**Neun Lücken sind dabei aufgefallen — sie sind der eigentliche Ertrag:**

1. **Eine Klassenprüfung belegt nicht, dass die Klasse etwas bewirkt.** Dazu
   gehört immer ein Blick ins Stylesheet.
2. **Eine Prüfung über `textContent` sieht keine Maskierung.** Für die
   Maskierung des Kommentartextes gab es deshalb jahrelang **keine einzige**
   wirksame Prüfung. Seitdem gilt: Prüfung zuerst schreiben, am unveränderten
   Stand als grün nachweisen, dann erst die Regel anfassen.
3. **Wo Client und Server dieselbe Vorgabe doppelt halten, prüft eine
   Oberflächenprüfung nur die eine Hälfte.**
4. **Eine Prüfung, die eine Spalte mit `!=` vergleicht, die leer sein kann,
   prüft gar nichts** (Stolperstein 55).
5. **Zwei Zeitstempel, die sich nicht unterscheiden können, belegen nichts**
   (Stolperstein 60).
6. **Ein gebauter DOM zeigt nicht, was beim Klicken passiert.** 43 Prüfungen zur
   Anheftung, und keine hat den Knopf gedrückt (Stolperstein 61).
7. **Ein Rückbau, der zu viel wegnimmt, belegt die falsche Sache**
   (Stolperstein 72). **Wenn zwei Gegenproben dieselben Namen rot machen, prüfen
   sie dieselbe Sache.**
8. **Ein Mock, der ein Feld selbst mitbringt, prüft sich selbst**
   (Stolperstein 102). *Zu jedem Feld, das die Oberfläche aus der Antwort liest,
   gehört eine Prüfung an der echten Antwort.*
9. **Ein Wächter über den Quelltext trifft den Kommentar, der die Regel
   erklärt** (Stolperstein 106). **Beide Fehlschläge lagen an der Prüfung, nicht
   am Code** — und sie sind vor dem Bauen aufgefallen, weil eine neue Prüfung
   erst am unveränderten Stand grün sein muss.

**Acht Prüfungen sind als zu nachsichtig aufgeflogen** — zwei standen schlicht
auf `true`. *Eine Prüfung, die nie scheitern kann, ist schlimmer als keine.* Und
umgekehrt: vier Fehlschläge beim Bau von 4.2 lagen an der Prüfung, nicht am
Code. **Ein roter Punkt ist erst dann ein Fehler, wenn feststeht, auf welcher
Seite er liegt.**

**Der Mock ist eine Prüflage und wird als solche gepflegt.** Er antwortet wie
der echte Server (Stolperstein 90): er darf die Antwort weder **vereinfachen**
noch **erstarren** lassen, er trägt **beide Fälle**, wo eine Spalte zwei
Bedeutungen hat (ein Bild **und** ein Video, und das Video ausdrücklich nicht an
erster Stelle), und **sein Fehlerfall ist stellbar** — bis 0.10.0 *konnte* die
Suche nicht scheitern, und ohne diese Lage ließe sich der Rückfall nicht prüfen,
sondern nur hoffen. **Er filtert die Suche über den Titel und nicht über sieben
Quellen** — die sieben prüfen die Servergruppen an einer echten Datenbank; ein
Mock, der die Suche nachbaute, belegte, was er selbst tut.

**Was der Prüfstand nicht kann: Aussehen.** Hier läuft kein Browser mit
Layoutberechnung. **Dreimal ist genau daran etwas vorbeigegangen** — die leere
PDF-Vorschau, ein unsichtbares Löschkreuz (Stolpersteine 29 und 30) und der Name
an der Linkzeile, der am rechten Rand stand (0.8.30). *Beide Male war die
Prüfung richtig und das Ergebnis trotzdem unbrauchbar.*

Weiterhin gültig aus Version 4.0, aber nicht im Skript: Verschlüsselung
(falscher Schlüssel wird abgewiesen, kein Klartext in der Datei), Bildgrößen je
Ansicht, Zoom lädt das Original.

### Die Portlage — die Spanne ist voll

**Es bleibt bei 53 Basen und `VERSATZ_STUFE` bei 3000.** Die niedrigste Basis
ist `HAUPT_BASIS` 3900, das höchste Fenster endet bei **6879**, die Spanne
beträgt damit **2980** gegen eine Stufe von 3000 — **zwanzig Nummern Luft**, und
ein Fenster ist 60 breit. **Oben passt keine neue Basis mehr dazu.**

**Und die Ausweichmöglichkeit „in eine Lücke innerhalb der Spanne gehen" gibt es
nicht.** Ausgezählt: innerhalb der Spanne liegen zehn Lücken mit zusammen 430
freien Nummern, aber nur **drei** davon sind mindestens 60 breit — und **jedes**
60er-Fenster darin deckt eine von `fetch()` gesperrte Nummer:

| Lücke | Breite | woran jedes Fenster scheitert |
|---|---:|---|
| 3990–4099 | 110 | **4045** |
| 5010–5069 | 60 | **5060, 5061** |
| 5960–6019 | 60 | **6000** |

**Was bleibt, ist das Anheben der Stufe, und es geht genau einmal.** Mit einer
neuen Basis **6880** wächst die Spanne auf 3040; brauchbar sind dann die Stufen
**3040–3045, 3091–3140 und 3381–3400**. Alles dazwischen legt eine Nebenspur auf
die Sperrliste. *Die obere Schranke „höchste Nummer aller Spuren unter 32768"
ist dabei nicht das Problem; die Sperrliste ist es.*

**Daraus folgt: die heutige Aufteilung trägt noch EINE neue Prüflage mit eigener
Basis, dann ist Schluss.** *Das ist kein Auftrag — aber es ist der Punkt, an dem
der Prüfstand das nächste Mal anhält, und er soll niemanden überraschen.*

*Nebenbei aufgefallen und ohne Handlungsbedarf:* **22 Fensterpaare überlappen
heute schon.** Harmlos, weil die Lagen der Reihe nach laufen und jede am Ende
beendet wird — aber *„eine Basis je Prüflage" war nie eine Trennung, sondern
eine Buchführung.*

### Prüfungen und Gegenproben je Version

| Version | neue Prüfungen | Gegenproben | dabei gefunden |
|---|---|---|---|
| 0.5.0 | Erstanmeldung | 7 | — |
| 0.5.2 | Kommentarsortierung | 3 | Stolperstein 42 |
| 0.5.3 | Adresse oder Suchtext | 5 | beide Schranken schlagen einzeln an |
| 0.5.4 | Links im Kommentartext | 7 | Lücke 2 oben |
| 0.5.5 | Kennzeichnung am Kommentar | 5 | Lücke 1 oben |
| 0.5.6 | Zoomzentrierung | 5 | Stolperstein 46 |
| 0.5.7 | dritte Kommentarart | 7 | Lücke 3 oben, Stolperstein 47 |
| 0.5.8 | Kriterien nur im Systembereich | 1 | — |
| 0.5.9 | Erledigt-Zustand | 8 | Stolperstein 48 |
| 0.5.10 | Umbenennung (8) | 6 | Stolperstein 49 |
| 0.5.11 | Suchanbieter (58) | 12 | Stolpersteine 50 und 51 |
| 0.6.0 | Stufe A (30) | 11 | Stolpersteine 52 und 53 |
| 0.6.1 | Stufe B (38) | 11 | Stolpersteine 54, 55 und 56 |
| 0.6.2 | Stufe C (29) | 13 | Stolpersteine 57 und 58 |
| 0.6.3 | Stufe C2 (43) | 14 | Stolpersteine 59 und 60 |
| 0.6.4 | Anheft-Knopf (8) | 4 | Stolperstein 61 |
| 0.6.5 | Stufe D (58) | 8 | Stolpersteine 62, 63 und 64 |
| 0.6.6 | Favoriten (22) | 5 | Stolpersteine 65 und 66 |
| 0.7.0 | Stufe E (49) | 11 | Stolpersteine 67, 68 und 69 |
| 0.7.1 | Stufe E2 (31) | 8 | Stolpersteine 70 und 71 |
| 0.7.2 | Stufe F (112) | 25 | Stolpersteine 72, 73 und 74 |
| 0.8.0 | Stufe G1 (115) | 20 | Stolpersteine 75, 76 und 77 |
| 0.8.1 | Umstellung auf frische Anlage (−102 Migrationsprüfungen) | — | — |
| 0.8.2 | Stufe G2, erste Hälfte (61) | 19 | Stolpersteine 78, 79 und 80 |
| 0.8.3 | Stufe G2, zweite Hälfte, Punkte 1–4 (39) | 16 | Stolpersteine 81 und 82 |
| 0.8.4 | Stufe G2 vollständig (106) | 34 | Stolpersteine 83 bis 86 |
| 0.8.5 | Stufe G3 (42) | 19 | Stolpersteine 87 und 88 |
| 0.8.6 | Berichtigungen aus dem Betrieb (38 netto) | 23 | Stolpersteine 89, 90 und 91 |
| 0.8.10 | Werkzeug (51) | 32 | Stolpersteine 92 bis 95 |
| 0.8.20 | Die Schotten dicht (68) | 14 | Stolpersteine 96 bis 100 |
| 0.8.30 | Stufe G4 (76) | 31 | Stolpersteine 101 bis 105, Lücke 8 oben |
| 0.8.31 | Dateien bekommen Verfasser (58) | 16 | — (die fünf aus 0.8.30 haben getragen) |
| 0.8.40 | Gewichtete Kriterien (125) | 30 | Stolpersteine 106 und 107, Lücke 9 oben |
| 0.8.50 | Kurzvideos am Fotoplatz (146) | 30 | Stolpersteine 108 bis 111 |
| 0.8.60 | Was ist offen, was ist neu (132) | 17 | Stolpersteine 112 bis 116 |
| 0.8.70 | Sicherung und Papierkorb (294) | 38 | Stolpersteine 117 bis 121 |
| 0.8.71 | Der Sicherungsort zieht um (17) | 6 | Stolperstein 123 |
| 0.8.80 | Stufe H (263) | 40 | Stolpersteine 124 bis 127 |
| 0.8.90 | Protokoll, zweite Bestätigung, öffentliche Adresse (248) | 24 | Stolpersteine 128 bis 133 |
| 0.8.91 | Schlüsselwechsel, Gegenprobentreiber, Portversatz (101) | 18 | Stolpersteine 134 bis 140, Befund L |
| 0.9.0 | Mailversand, Adresse am Zugang, zweite Frist (182) | 33 | Stolpersteine 141 bis 148 |
| 0.9.1 | Selbstanmeldung samt Nacharbeit (259) | 58 | Stolpersteine 149 bis 158 |
| 0.10.0 | Zweiter Faktor, Wiederherstellungscodes, zweistufige Anmeldung (225) | 42 | Stolpersteine 159 bis 163 |
| **0.11.0** | **Suche im Server, gespeicherte Ansichten, Doppelerkennung (139)** | **34** | **Stolpersteine 164 bis 172** |

**Ausführlich steht nur die jüngste Runde.** Von den älteren bleibt hier, was
heute noch bindet; die Lehren selbst sind Stolpersteine in Abschnitt 6, die
vollständigen Gegenprobentabellen stehen in den Änderungsprotokollen.

---

## 8. Offene Betriebspunkte

**Der Betriebsstand steht in Abschnitt 2, nicht hier.** Zwei Stellen für
dieselbe Angabe halten nur eine aktuell (Stolperstein 47). Hier steht, was
**offen** ist.

### Offen aus der laufenden Runde

- **DER TAG `v0.11.0` IST GESETZT, ABER NICHT GESCHOBEN.** Er liegt auf dem
  Commit, der herausgeht; der Push scheitert in der Arbeitsumgebung mit
  `HTTP 403` — **Branches gehen durch, Tags nicht.** Er braucht einen Push von
  einer Stelle mit den nötigen Rechten:

  ```bash
  git push origin v0.11.0
  ```

  *Liegt der Tag dort nicht mehr vor, entsteht er mit*
  `git tag -a v0.11.0 <commit> -m "…"`. **Ohne ihn zeigt der Vergleichsverweis
  `[0.11.0]` am Ende von `CHANGELOG.md` ins Leere** — das ist die einzige
  Wirkung; an der Anlage ändert es nichts. *`v0.10.0` liegt am Remote und trägt;
  das Repo hat damit **fünfzehn** Tags.*
- **DER RUNDLAUF FÜR 0.11.0 IST NOCH NICHT GEFAHREN.** Drei Handgriffe belegen
  die Runde am laufenden Server und gehören nach dem Einspielen einmal von Hand
  gemacht: **nach einem Kommentartext suchen** und den Eintrag finden; **eine
  Ansicht speichern, abmelden, anmelden, die Ansicht wählen**; und **einen
  Doppeleintrag antippen**, die Zeile „Ähnlich" sehen. Das Ergebnis gehört in
  Abschnitt 2.
- **Der Fingerprint der laufenden Anlage nach 0.11.0 ist zu vergleichen.** Die
  Marke hat zwei Dateien in `public/` verändert; der Wert muss sich also bewegt
  haben — und er muss `74c44ec0` sein. *Genau dort hat sich bei 0.9.1 eine Datei
  zu viel gezeigt (Stolperstein 158).*
- **ZWEI DATEISÄTZE TRAGEN DIE NUMMER 0.9.1, UND DAS IST NICHT ENTSCHIEDEN.**
  Das veröffentlichte 0.9.1 in `main` hat den Fingerprint `cb73399d`; die
  laufende Anlage trug `3cf1b093`. Dazwischen liegt die Nacharbeit an Marke und
  Anmeldekarte. **Nach Semantic Versioning, Punkt 3, gehört darauf eine eigene
  Nummer: `0.9.2`** — der Inhalt ist Fehlerbehebung und Aussehen, also PATCH.
  Nötig wären `package.json`, ein Changelog-Eintrag mit Datum, die Zahlen in den
  Papieren und der Tag `v0.9.2`. **Es ist vorgeschlagen und nicht beschlossen;**
  solange es offen ist, lässt sich jener Fingerprint keiner veröffentlichten
  Nummer zuordnen.

### Der Proxy, und was daran noch fehlt

**`HINTER_PROXY` IST EIN JA/NEIN, UND DIE ANLAGE IST INZWISCHEN BEIDES.** Seit
der Reverse Proxy davorsteht, kommt über `http://<server-ip>:3100` niemand mehr
herein: der Cookie trägt `Secure` und das Präfix `__Host-`, der Browser
verwirft ihn. **Gemessen, nicht vermutet** — der Server antwortet mit **200** und
setzt den Cookie; das Verwerfen geschieht allein im Browser, stillschweigend,
und im Serverprotokoll steht davon nichts. *Das ist kein Fehler, sondern der
Preis der Einstellung.*

**Der Mangel liegt woanders:** die eine Einstellung bündelt **vier** Wirkungen —
`X-Forwarded-For` glauben, `Secure`, `__Host-`, HSTS — und die Anlage ist seit
dem Proxy aus **zwei** Netzen zugleich erreichbar. *Der Quelltext hat genau das
vorhergesehen:* „Ist die Anlage je aus mehreren Netzen gleichzeitig erreichbar,
gehört das nachgeliefert" (`auth.js`, Kopf).

**Was das im Ernstfall kostet:** fällt der Proxy aus oder läuft ein Zertifikat
ab, gibt es **gar keinen Weg mehr in die Oberfläche**. Die Daten sind sicher und
die Werkzeuge auf dem Wirt gehen weiter — lesen lässt sich der Bestand nicht.
**Der Handgriff dagegen steht in der README** („Wenn der Proxy ausfällt"):
Einstellung für die Dauer der Störung abschalten, neu starten.

**Die saubere Lösung ist eine Runde Arbeit und vorgemerkt:**
`X-Forwarded-Proto` lesen (wird bisher **nirgends** gelesen) und je Anfrage
entscheiden — **mit zwei Cookienamen, nicht mit einem.** *Ein Name mit bedingtem
`Secure` gäbe Sicherheit auf, statt Bequemlichkeit zu gewinnen:* wer im eigenen
Netz eine Klartextverbindung verbiegen kann, setzte damit einen Cookie, den die
HTTPS-Seite anschließend auch annimmt — und genau dagegen gibt es `__Host-`.

**Die Portfreigabe 3100 bleibt daneben offen, und das ist als tragbar
eingestuft.** Wer im Heimnetz steht, kann den Proxy umgehen und
`X-Forwarded-For` selbst setzen; die Anmeldebremse ließe sich so aushebeln. *Ein
gewöhnlicher Browser tut das nicht, ein absichtlicher Aufruf schon.* Der Schutz
gilt dem Weg aus dem Internet. **Wer es doch schließen will**, hängt Kriterion
in das Netz des Proxys und lässt die Portfreigabe fallen — dann läuft auch der
Zugriff im Heimnetz über den Proxy. *Ein Adressbuch, wer den Kopf setzen darf,
ist in 0.8.20 ausdrücklich nicht gebaut worden und wäre der dritte Weg.*

### Offene Kleinigkeiten

- **Weicht der Fingerprint ab, nennt er nicht, WELCHE Datei es ist.** Der
  Handgriff dafür steht in der README („Eine neue Version einspielen"): die
  Prüfsummen der Dateien nebeneinander, über die er geht. **Eine Datei zu viel
  wiegt dabei genauso schwer wie eine falsche.** **Eine Zeile in der Karte
  „Anlage", die die abweichende Datei beim Namen nennt, ist für die nächste
  Nacharbeitsrunde vorgemerkt.**
- **EIN PRÜFLAUF IST ABGERISSEN UND LIESS SICH NICHT WIEDERHOLEN.** Bei der
  Nacharbeit an der Anmeldeseite riss einer von sieben Läufen in der **ersten**
  Gruppe ab. **Ein übriggebliebener Server aus einem früheren Lauf ist
  ausgeschlossen** (seine Datenbank wäre nicht leer gewesen), und nachgesehen:
  es lief keiner. **Sechs volle Läufe danach waren grün.** *Es fehlt die
  Auskunftszeile unter dem roten Punkt — die Ausgabe war beim ersten Durchgang
  gefiltert.* **Der Punkt bleibt offen: nicht wegerklärt, sondern nicht
  reproduziert.** Wer ihn wiedersieht, schreibt den Lauf vollständig mit.
- **`OEFFENTLICHE_ADRESSE` eintragen**, falls noch nicht geschehen. Die Anlage
  läuft hinter einem Proxy, eine Adresse von außen gibt es also. **Ohne sie wird
  nicht verschickt**, und die Selbstanmeldung lässt sich gar nicht erst
  einschalten. *Die Startzeile hat beim ersten Mal getan, wofür sie gebaut ist:
  „Mailversand: … Ohne OEFFENTLICHE_ADRESSE wird trotzdem nicht verschickt."*
- **`AUTH_USER` und `AUTH_PASSWORD` aus der `.env` nehmen** — sie werden nicht
  mehr gelesen (der Start meldet Reste), enthalten aber ein Klartextpasswort.
  **Und das Passwort im Systembereich unter „Zugang" wechseln:** es ist zweimal
  aus der Anlage herausgeraten — einmal im Klartext in einem ZIP, einmal über
  eine `od -c`-Ausgabe.
- **Dateien lassen die Datenbank wachsen.** Bei 50 MB je Stück lohnt
  gelegentlich ein Blick auf die Kennzahlen — und daran zu denken, dass die
  Sicherung entsprechend größer wird.
- **Am Bildschirm nachsehen, was der Prüfstand nicht kann:** ob bei 120 %
  Schriftgröße irgendwo etwas umbricht, wie sich das Ziehen der Blöcke anfühlt,
  ob die Zeitleiste bei echtem Bestand lesbar bleibt (sie ist auf rund 50 Punkte
  über fünf Jahre ausgelegt), ob die Tagwolke mit einer Zeile auskommt, und ob
  die Kommentar-Kopfzeile bei „… bearbeitet · 2 Bilder vom Admin entfernt" in
  der schmalen Spalte umbricht (`.cmt-head` hat `flex-wrap` bewusst nicht —
  kippt es doch, ist die Antwort dort, nicht eine kürzere Beschriftung).
- **Blockanordnung und Einklappzustand liegen in den Einstellungen**, nicht im
  Export. Nach einem ersetzenden Import stehen sie unverändert da.
- **Veröffentlichung auf GitHub ist vorbereitet:** `.env` per `.gitignore`
  ausgeschlossen, `.env.example` als Vorlage, keine echten Zugangsdaten im
  Quelltext. **Offen davor:** die Vorgabewerte (Abschnitt 10, Punkt 7).
- **Der Container ist seit 0.8.20 sichtbar gesund oder nicht.** Das Image trägt
  einen `HEALTHCHECK` gegen `/api/config`; `docker compose ps` zeigt `healthy`.

### Erledigt, aber die Lehre bleibt

**DER SCHLÜSSELWECHSEL IST BESTÄTIGT — an einer Kopie der echten Anlage, am
echten Umfang** (25. August 2026). Gemessen: **662,5 MB angesagt mit rund 13
Sekunden, wirklich gedauert 10 592 ms**, Journal `wal → DELETE → wal`, danach
`integrity_check: ok`. **Die Schätzung aus 20 ms je MB hält, und sie schätzt
nach oben** — rund ein Viertel Reserve; *eine Ansage, die zu kurz greift, wäre
die unangenehme.* **Was der Lauf belegt, ist beides:** die Hostseite (der
Wegwerf-Container bei gesetztem `container_name`, die Einhängung, das Nachziehen
der `.env`, Anhalten und Starten) **und** den Bestand am echten Umfang.

**Zwei Lehren daraus, und beide sind Stolpersteine geworden:**

- **Eine Probe, die das Datenverzeichnis oder den Schlüssel ersetzt, belegt
  nichts** (147). Der erste Anlauf löschte `data/` und erzeugte einen frischen
  Schlüssel — ein Wechsel an einer **leeren** Datenbank ist in Millisekunden
  vorbei und sagt über 662 MB nichts. **`data/` und `.env` gehören zusammen.**
- **Wer die echte `.env` in eine Probe kopiert, kopiert den laufenden Schlüssel
  mit — und `schluessel.sh` druckt ihn** (148). *Das ist kein Fehler des
  Skripts, sondern eine Eigenschaft der Probe.* **Wer so probt, behandelt ihre
  Ausgabe wie den Schlüssel selbst.** Zum Aufräumen gehört, dass die Probe zwei
  Dinge **nebeneinander** liegen lässt — `.env.vor-schluesselwechsel-…` und die
  Sicherung des Datenverzeichnisses. *Schlüssel neben Daten, genau die Lage,
  gegen die Abschnitt 3 argumentiert.* **Beides gehört nach der Probe weg.**

### Nachschau per SSH — der zeitlose Kern

Drei Ebenen, in dieser Reihenfolge. *Die stufenbezogenen Abfragen werden je
Version im Gespräch mitgeliefert und stehen nicht hier.*

**1. Protokoll.** `docker compose logs --tail=50 kriterion`. Was der Start
meldet, steht in Abschnitt 2. Fehlt nach einem Einspielen die erwartete
Änderung, wurde der Container nicht neu gebaut (`--build` vergessen).

**2. Der Fingerprint** — die Antwort auf „läuft wirklich der neue Dateisatz".
Die Versionsnummer aus `/api/config` sagt nichts über die übrigen Dateien. Er
steht hinter der Anmeldung, die deshalb in den Befehl gehört:

```bash
curl -s -c cookies.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"NAME","password":"..."}'
curl -s -b cookies.txt localhost:3100/api/stats | head -c 60
```

Erwartet für 0.11.0: `{"version":"0.11.0","fingerprint":"74c44ec0",…`.
**Was er nicht abdeckt:** `zugang.js`, `schluessel.js` und `gegenprobe.js` — sie
liegen im Image, laufen aber nie im Server.

**3. Die Datenbank von innen.** Sie ist verschlüsselt, `sqlite3` von außen
scheitert — die passende Bibliothek liegt im Container:

```bash
docker compose exec kriterion node -e "
  const db=require('./db').db;
  for (const t of ['items','comments','test_days','ratings','links','attachments'])
    console.log(t, '->', db.prepare('SELECT COUNT(*) n FROM '+t+' WHERE user_id IS NULL').get().n);
"
```

**Sechs Träger, sechsmal `0` — das ist die zeitlose Form dieser Abfrage.** *Sie
war bis 0.8.20 auf `ratings` geschrieben; seit 0.8.30 gehört `links` dazu und
seit 0.8.31 `attachments`. Die Schleife hat sich damit schon einmal ausgezahlt.*
Wer wissen will, ob eine Spalte überhaupt angekommen ist:
`db.prepare('PRAGMA table_info(links)').all().map(c=>c.name)`.
**Der Augenschein ist hier nicht die Bestätigung, sondern die Abfrage:** eine
Datenbank, der beim Umbau etwas verlorengegangen ist, sieht in der Oberfläche
vollständig aus.

**4. Die Schnittstelle von außen** — der einzige Weg, der Rechte wirklich
belegt. Zwei Sitzungen nebeneinander:

```bash
curl -s -c a.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"faruk","password":"..."}'
curl -s -c b.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"gast","password":"..."}'
curl -s -b b.txt -X DELETE localhost:3100/api/items/1     # muss 403 sein
```

**„Darf nicht" muss einzeln belegt werden, mit einem echten zweiten Cookie.**
Der Prüfstand hat dasselbe Muster eingebaut; von Hand gegenzuprüfen bleibt es
trotzdem — *es ist die Stelle, an der ein Fehler still bleibt und trotzdem alles
öffnet.*

---

## 9. Versionsgeschichte

**Ausführlich steht nur die jüngste Runde.** Was eine ältere gebracht hat, steht
in `CHANGELOG.md` (für den Betreiber) und in ihrem Änderungsprotokoll (Rohstoff,
unverändert). *Die tragenden Entscheidungen dahinter leben in Abschnitt 5
weiter.*

### 0.11.0 — „Suche und Bestand"

**Die zweite Runde nach dem Stufenplan — und die erste, die etwas Bestehendes
umbaut, statt etwas Neues danebenzustellen.** MINOR, weil Funktionen
dazukommen. *`searchText` fällt dabei aus der Antwort von `GET /api/items`
heraus, und das ist eine Wegnahme — aber die HTTP-Endpunkte unter `/api/`
gehören nach Abschnitt 5 ausdrücklich **nicht** zur öffentlichen Schnittstelle.
Es ist damit kein Bruch im Sinne von SemVer.* **Keine Datenbankstufe.**

**Und der Satz, der die Runde von ihrer Vorgängerin unterscheidet: diese Runde
konnte die Anlage verschlechtern.** Der zweite Faktor aus 0.10.0 konnte nichts
kaputtmachen; wer ihn nicht einschaltete, merkte nichts. **Die Suche merkt jeder,
sofort, bei jedem Tastendruck.** Deshalb sind Debounce, Reihenfolge der Antworten
und der Rückfall bei gescheiterter Anfrage **gebaut und geprüft, nicht gehofft.**

- **Die Suche zieht vom Browser auf den Server** — `GET /api/items?q=…`,
  dieselben sieben Quellen, und das je Eintrag mitgeschickte Feld `searchText`
  entfällt. Gemessen an 1000 Einträgen mit je vier Kommentaren: **2,50 MB →
  0,52 MB** und **110 ms → 93 ms**; das Feld war **73 Prozent** der Antwort.
  **Die Suche findet dasselbe wie vorher** — bis in die Umlaute, ab einem
  einzigen Zeichen, und ein Prozentzeichen bleibt ein Prozentzeichen. Gesucht
  wird über `instr()` statt `LIKE`, samt einer in SQL eingehängten
  Kleinschreibung nach Unicode. **Kein FTS5** (Stolpersteine 164 und 165).
- **`testDays` fällt aus der Listenantwort, wenn die Zeitleiste aus ist** — aus
  der Liste liest das Feld genau eine Stelle der Oberfläche. Die Kachel rechnet
  aus `testCount`, `testAvg` und `testLast`.
- **Gespeicherte Ansichten**, bis zu acht je Zugang, persönlich, samt
  Suchbegriff — als achter persönlicher Schlüssel in `user_settings`, **ohne
  Schema**.
- **Doppelte Einträge werden beim Anlegen erkannt**, als Zeile ohne Dialog und
  ohne eigene Route.
- **Die Marke trägt den Akzent statt Gold und steht so hoch wie der Text
  daneben** — eine Rücknahme aus 0.10.0, ausdrücklich gewollt und in Abschnitt 5
  umgeschrieben statt gelöscht.
- **Behoben:** eine gemerkte Filterstellung, die auf eine gelöschte Kategorie
  oder einen gelöschten Tag zeigte, ließ die Übersicht leer aussehen; und eine
  Beschriftung im Prüfstand nannte 64 schreibende Routen, wo 69 geprüft wurden.
- **Die Liste bereitet zwei Abfragen einmal vor statt je Eintrag** — an 1000
  Einträgen 24,2 ms → 11,5 ms.

**Was 0.11.0 NICHT enthält: das Zusammenführen zweier Einträge.** Der Fahrplan
nannte Doppelerkennung *und* Zusammenführen in einer Zeile; der Schnitt liegt
zwischen ihnen und ist ausdrücklich entschieden (Abschnitt 10).

`F_ROUTEN` bleibt bei **69**, `VORGAENGE` bei **zwanzig**, `MERKMALE` bei
**dreizehn**, `BESTAETIGUNG_ZWECKE` bei **sieben**, die Karten bei
**neunzehn**, die Formatnummer bei **10**, das Vokabular bei **elf**. Die
persönlichen Schlüssel gehen von sieben auf **acht**. **Keine neue Abhängigkeit
und keine neue `.env`-Zeile.** **3676 Prüfungen werden 3815**, 125 Rückbauten
werden **159**.

### Die Runden davor — je ein Absatz

**0.10.0 — „Der zweite Faktor".** Die erste Runde nach dem Stufenplan und die
erste unter Semantic Versioning; **Datenbankstufe ohne Migrationsblock**
(`zweifaktor`, `zweifaktor_codes`). TOTP nach RFC 6238, **freiwillig, je Zugang,
ab Werk aus**; acht Wiederherstellungscodes; zweistufige Anmeldung mit einem
Ausweis im Arbeitsspeicher, **keine halbe Sitzung**. Der Tokenweg aus 0.8.80 und
die zweite Bestätigung aus 0.8.90 fragen ebenfalls; die Anmeldebremse greift am
zweiten Schritt. **Zwei Lücken sind beim Bauen geschlossen worden**
(Stolpersteine 159 und 160). `F_ROUTEN` 64 → **69**, Vorgänge siebzehn →
**zwanzig**. **Der QR-Code ist nicht Teil dieser Runde.** *Ab dieser Version
trägt jede herausgegebene einen Git-Tag, und `CHANGELOG.md` folgt Keep a
Changelog 1.1.0.*

**0.9.1 — „Stufe I₂: die Selbstanmeldung".** Zweite Hälfte von Stufe I, **und
damit ist der Stufenplan des Mehrbenutzerbetriebs abgearbeitet**;
Datenbankstufe ohne Migrationsblock (`anfragen`). Anfrage → Bestätigungsmail
(Double Opt-in, der dritte Mailanlass, Link **ohne Passwortkraft**) →
Warteschlange beim Admin → Freischalten oder Ablehnen → Tokenweg aus 0.8.80.
**Die Antwort sieht immer gleich aus und wartet nicht auf den Versand**; Deckel
von zwanzig, Anmeldebremse an beiden Routen. Der Schalter verlangt **zwei**
Dinge (Stolperstein 149). `F_ROUTEN` 59 → **64**, Karten achtzehn →
**neunzehn**, Vorgänge fünfzehn → **siebzehn**. **Nach dem Einspielen dreimal
nachgezogen, ohne neue Versionsnummer** — die Karte „Anfragen" steht dem Admin
jetzt immer (Stolperstein 155), der Weg zur Anfrage ist ein Knopf, Marke und
Name stehen nebeneinander; dabei fiel **eine SVG weniger** in `public/` an, und
genau daran ist der Fingerprint der laufenden Anlage aufgefallen
(Stolperstein 158).

**0.9.0 — „Der Server verschickt selbst".** Erste Hälfte von Stufe I, **keine**
Datenbankstufe. Einladungs- und Rücksetzlinks gehen über **`nodemailer`** per
Mail hinaus, mit Vorlagen für GMX, Web.de, Gmail, Strato, IONOS und „eigener
Server" — **und wer keinen Mailzugang einträgt, verliert nichts**: der Token
entsteht zuerst, die Antwort trägt den Link immer, und der Versand ist ein
**Feld** darin. Der Mailzugang gehört dem **Eigentümer**, die Testmail geht an
die eigene Adresse, die öffentliche Adresse wird Pflicht **für den Versand,
nicht für den Start**, `users.email` bekommt zwei Schreibwege, und der Token
bekommt eine **zweite Frist**. **Behoben:** eine vorübergehende Absage warf den
Schlüssel aus der Adresse (Stolperstein 141). **Eine neue
Laufzeitabhängigkeit** — `nodemailer` 9.0.5, MIT-0, +1 Paket, 776 KB,
nachgemessen; `npm ls --omit=dev` steht seither bei **122 Pfaden**.

**0.8.91 — „Der Schlüssel lässt sich wechseln".** Keine Datenbankstufe. Der
Schlüssel wechselt über `./schluessel.sh wechseln` **auf dem Wirt**, bei
angehaltener Anlage, mit der `.env` in einem Zug — **ausdrücklich nicht als
Knopf** (Abschnitt 5). `PRAGMA rekey` läuft nur mit `journal_mode = DELETE`
davor (Stolperstein 128). Neu: der fünfzehnte Vorgang `schluessel`, die Marke
`schluesselGewechseltAm` und die **rote Markierung jeder älteren Sicherung**.
Dazu drei Werkzeuge, die keine ausgelieferte Datei anfassen: **`gegenprobe.js`**,
**`PORT_VERSATZ`** und zwei Wächter über die eigenen Prüflagen. **Berichtigt:**
es sind sechs Wege über fünf Routen hinter der zweiten Bestätigung, nicht sieben
über sechs (Stolperstein 137).

**0.8.90 — „Schwere Eingriffe".** Datenbankstufe ohne Migrationsblock
(`sicherheitsprotokoll`). Die **zweite Bestätigung** vor sechs schweren Wegen,
das **Sicherheitsprotokoll** mit vierzehn Vorgängen und 180 Tagen Frist, die
optionale **öffentliche Adresse** in der `.env`. `F_ROUTEN` 56 → **57** samt der
neuen Art `'zweitbestaetigt'`. *Der Schlüsselwechsel war Punkt 3 des Auftrags
und ist bewusst herausgenommen worden — er hat beim Nachstellen seine Form
geändert und braucht einen eigenen Einspielweg.*

**0.8.80 — Stufe H, „Einladung, Rücksetzung, Sitzungen".** Datenbankstufe ohne
Migrationsblock (`tokens`). Ein Zugang bekommt sein Passwort **selbst**, über
einen Link — **ein Mechanismus, zwei Anlässe**. Zwei schreibende Routen stehen
vor der Anmeldung, die Einlöseseite ist ein **Zustand der Anmeldeseite**, der
Schlüssel steht im **Fragment**. Dazu die Karte **„Meine Sitzungen"** — für
jeden, ohne Gerätekennung. `F_ROUTEN` 51 → **56**.

**0.8.71 — „Der Sicherungsort zieht um".** Eine Berichtigungsrunde ohne Schema,
Route und Formatnummer: der Sicherungsort liegt im Projektverzeichnis, und
`GET /api/sicherung` sagt über `imArbeitsverzeichnis`, wie er liegt — **benannt,
nicht verboten**. Die Aussage trägt nur, solange die Einhängung die Lage
spiegelt (Stolperstein 123); ein Wächter über die `docker-compose.yml` hält es
fest.

**0.8.70 — „Sicherung und Papierkorb".** Datenbankstufe ohne Migrationsblock
(`papierkorb`, `papierkorb_bytes`). Zwei Wege zurück, die es bisher nicht gab.
**Keine bestehende Abfrage ändert sich**; die Bytes gehen **an der JSON vorbei**
in eine Nebentabelle, weil zwanzig Videos als Base64 die Stringgrenze von Node
rissen. Dazu die **Sicherung auf Knopfdruck** (`VACUUM INTO`, synchron, Zielort
zweistufig und am **aufgelösten** Pfad geprüft) und der **Einzelexport**.
`F_ROUTEN` 47 → **51**.

**0.8.60 — „Was ist offen, was ist neu".** Keine Datenbankstufe. Die Ansicht
**„Offen"** über alle Einträge und der Filter **„Neu seit …"** an einem
persönlichen Schlüssel — *die günstigste Art von Verbesserung ist, vorhandene
Funktionalität erreichbar zu machen.* Dazu die **Sprachbereinigung** aus
Abschnitt 12 samt Wächter; sichtbar davon ist genau eine Umbenennung, der
`Abdruck` heißt jetzt **Fingerprint**. `F_ROUTEN` bleibt bei **47**.

**0.8.50 — „Kurzvideos am Fotoplatz".** Datenbankstufe (`photos.art`,
`photos.dauer`). Videos bis 20 MB in **derselben** Tabelle wie die Fotos, das
Standbild kommt aus dem **Browser des Hochladenden** — kein `ffmpeg`, keine neue
Abhängigkeit, und der Server öffnet nie ein Video. Ausgeliefert wird `inline`
und **in Ranges** (nur am Video). `F_ROUTEN` 46 → **47**, Formatnummer
**9 → 10**, `media-src 'self' blob:` in der Sicherheitsregel.

**0.8.40 — „Nicht jedes Kriterium wiegt gleich".** Datenbankstufe
(`rating_criteria.gewicht`). Gewicht 0,2 bis 2 je Kriterium, gewichteter
Gesamtschnitt über die **bewerteten** Kriterien, `×1,5` an drei Anzeigeorten,
`criteriaGewichte` im Austauschformat (**8 → 9**). **Keine neue schreibende
Route**, und keine Art wechselt.

**0.8.31 — „Dateien bekommen Verfasser".** Datenbankstufe
(`attachments.user_id`). Dieselbe Wende wie G4 am sechsten Träger: hochladen
offen, löschen beim Hochladenden oder Admin, Name an der fremden Zeile hinter
der Größe, Formatnummer **7 → 8**.

**0.8.30 — Stufe G4, „Die Linkliste bekommt Verfasser".** Die erste
Datenbankstufe seit 0.8.3 (`links.user_id`) und die letzte offene Stufe vor H.
Eintragen offen, löschen beim Eintrager oder Admin, **Sortieren bleibt beim
Eintragsverfasser**, Name an der fremden Zeile, Formatnummer **6 → 7**.
`F_ROUTEN` bleibt bei **46**, und **nur eine Art wechselt** — nicht zwei, wie der
Auftrag annahm.

| Version | Was |
|---|---|
| 0.8.20 | „Die Schotten dicht": Fotoweg leitet den ausgelieferten Typ aus den ersten Bytes ab und weist beim Hochladen alles ab, was kein Rasterbild ist; `Content-Security-Policy` für die Anwendung; `X-Forwarded-For` nur nach ausdrücklicher Einstellung samt `Secure`/HSTS/`__Host-`; Fehler-Handler nach Rang; sauberes Herunterfahren; Index auf `sessions.user_id`; `HEALTHCHECK` im Image |
| 0.8.10 | Werkzeug: `package-lock.json` eingecheckt und `npm ci` statt `npm install`, `sharp` auf 0.35.3, Image auf Node 22, Versions-Fingerprint über die ausgelieferten Dateien, Prüfstand in Gruppen aufrufbar und bei jedem Push |
| 0.8.6 | Berichtigungen aus dem Betrieb: Bewertungsdetails gehören dem Admin (samt Löschweg für eine fremde Bewertung), Linkliste abgeschnitten statt scrollbar, `grid-auto-flow: dense` schließt die Lücke im Kartenraster, „Angemeldet als" auch bei einem Zugang, „Angelegt von" nennt auch das Datum |
| 0.8.5 | Stufe G3: dreizehn Karten des Systembereichs nach Rolle, `GET /api/stats` hinter `nurAdmin`, Karte „Links" in zwei geschnitten, Kachel „Zugänge" über die volle Breite |
| 0.8.4 | Stufe G2 vollständig: Eingriffsvermerk nennt die Rolle, `updated_at` an den Bildwegen des Verfassers, Zahlen in der Kopfzeile des Kommentarblocks, die beiden Anlegen-Schalter, Umschalter „meine/alle" im Vergleich |
| 0.8.3 | Stufe G2, zweite Hälfte, erster Teil: Eingriffsvermerk am Kommentar (erster Migrationscode seit der Bereinigung), `mine` am Kommentar, blaue Aufgabenmarke, Tagwolke klappt ganz auf |
| 0.8.2 | Stufe G2, erste Hälfte: Verfassernamen an vier Trägern als Objekt, Stimmenliste je Kriterium, Löschdialog am Eintrag, `DELETE /api/ratings/:id` |
| 0.8.1 | Bereinigung: `legacy.js` und aller Migrationscode entfernt, Schema als vollständige DDL, Prüfstand auf frische Anlagen (−102 Prüfungen) |
| 0.8.0 | Stufe G1: Karte „Zugänge", Rollenleiter als vergebbarer Rollenwert, Sperren an zwei Stellen durchgesetzt, Namensbremse, Löschen als Grabstein, `zugang.js` ersetzt `AUTH_RESET` |
| 0.7.2 | Stufe F: serverseitige Rechteschicht für alle schreibenden Endpunkte, Export/Import nur Eigentümer, „Leitung" → „Admin" |
| 0.7.1 | Stufe E2: Export/Import mit Verfassernamen an vier Trägern, Formatnummer 6 |
| 0.7.0 | Stufe E: eigene Sterne neben Schnitt und Bewerterzahl, zweistufiger Gesamtschnitt, `mine` an Testtagen, Kriterien nur noch im Systembereich |
| 0.6.6 | Am Eintrag heißt es „Favorit", sortiert nicht mehr vor, eigener Filter „★ Favoriten" |
| 0.6.5 | Stufe D: `user_settings` — sechs Schlüssel werden persönlich |
| 0.6.4 | Berichtigung: Favoriten-Knopf zeichnete sich nach dem Klick nicht neu |
| 0.6.3 | Stufe C2: `item_pins` je Benutzer statt `items.favorite` |
| 0.6.2 | Stufe C: Tabellenneubau — `ratings` und `test_days` mit `user_id` im UNIQUE |
| 0.6.1 | Stufe B: `user_id` an `items`, `comments`, `test_days` |
| 0.6.0 | Stufe A: `users` um Rolle, Adresse, Status, letzte Anmeldung; `sessions.user_id`; `req.benutzer` |
| 0.5.11 | Mehrere Suchanbieter je Suchzeile; Anbieterliste aus `app.js` in den Server gezogen |
| 0.5.10 | Umbenennung auf „Kriterion", ohne jede Funktionsänderung; Cookiename wechselte mit |
| 0.5.9 | Erledigt-Zustand für Aufgaben |
| 0.5.8 | Kriterien werden nur noch im Systembereich gelöscht |
| 0.5.7 | Dritte Kommentarart: Aufgabe |
| 0.5.6 | Zoom im Vollbild startet in der Mitte |
| 0.5.5 | Kennzeichnung von Art und Anheftung am Kommentar |
| 0.5.4 | Links im Kommentartext anklickbar; dabei fiel die fehlende Maskierungsprüfung auf |
| 0.5.3 | Suchlink aus Nicht-Adressen |
| 0.5.2 | Reihenfolge der Berichte umgedreht — innerhalb jeder Gruppe das Älteste oben |
| 0.5.1 | Ausschnitt-Modus ließ sich nicht verlassen |
| 0.5.0 | Erstanmeldung, Zugang als scrypt-Hash in `users` statt in der Umgebung |
| 0.4.10 | Versionsnummer auf der Anmeldeseite |
| 0.4.9 | Sprung beim Bearbeiten der Beschreibung |
| 0.4.8 | Handy-Paket, zweiter Teil |
| 0.4.7 | Handy-Paket: Ziehen erst nach Halten, Zeilenaktionen als Zeichen, Schriftskala 80–120 |
| 4.5 | Und/Oder-Verknüpfung der Tagfilter |
| 4.4.2 | Dateizeilen reagieren als Ganzes auf einen Klick |
| 4.4.1 | PDF-Vorschau blieb leer, Löschkreuz war unsichtbar |
| 4.4 | Anhänge am Eintrag samt `anhaenge.js` |
| 4.3 | Tags an Testtagen, Zeitleiste, Blöcke anordnen, Tagwolken aufklappbar |
| 4.2 | Schriftgröße einstellbar, anpassbares Vokabular |
| 4.1 | Bewertungskriterien pflegen, mitwachsende Felder, Prüfstand |

---

## 10. Zurückgestellt und offen

### Der Fahrplan bis 1.0

**Hier steht der Plan, und sonst nirgends.** *Der Stufenplan des
Mehrbenutzerbetriebs ist mit 0.9.1 abgearbeitet; seine Nummern stehen in der
Tabelle mit drin, seine Herleitung im Konzeptpapier.*

**BIS 0.9.1 GINGEN DIE NUMMERN IN ZEHNERSCHRITTEN, AB 0.10.0 GILT SEMVER.**
Umnummeriert ist allein der **Plan** — was einmal draußen war, behält seine
Nummer. *Die Formatnummer der Exportdatei rückt unabhängig davon weiter; sie
hängt am Inhalt der Datei, nicht an der Versionsnummer.*

| Version | Name | Was | Schema | Format |
|---|---|---|---|---|
| **0.8.10** | Werkzeug | Lockfile, `npm ci`, `sharp` 0.35, Fingerprint, Prüflauf bei jedem Push | — | — |
| **0.8.20** | Die Schotten dicht | SVG am Fotoweg, `X-Forwarded-For`, `Secure`-Cookie, Sicherheitsregel, Fehler-Handler, Index | — | — |
| **0.8.30** | **Stufe G4** — Links bekommen Verfasser | `user_id` an `links` | ja | 6 → 7 |
| **0.8.31** | *(keine Stufe)* Dateien bekommen Verfasser | dieselbe Wende am sechsten Träger | ja | 7 → 8 |
| **0.8.40** | Gewichtung der Kriterien | Gewicht 0,2 bis 2, gewichteter Gesamtschnitt | ja | 8 → 9 |
| **0.8.50** | Kurzvideos am Fotoplatz | bis 20 MB, in der Datenbank, Standbild aus dem Browser | ja | 9 → 10 |
| **0.8.60** | Was ist offen, was ist neu | Ansicht „Offen", Filter „Neu seit …" | — | — |
| **0.8.70** | Sicherung und Papierkorb | `VACUUM INTO` auf Knopfdruck, Papierkorb, Einzelexport | ja, **ohne Block** | — |
| **0.8.71** | *(keine Stufe)* Der Sicherungsort zieht um | in das Projektverzeichnis, dazu die rot/grüne Anzeige | nein | — |
| **0.8.80** | **Stufe H** — Tokens | Einladung und Rücksetzung über einen Link, „Meine Sitzungen" | ja, **ohne Block** | — |
| **0.8.90** | Schwere Eingriffe | zweite Bestätigung, Sicherheitsprotokoll, öffentliche Adresse | ja, **ohne Block** | — |
| **0.8.91** | *(keine Stufe)* Der Schlüssel lässt sich wechseln | `./schluessel.sh` auf dem Wirt, dazu `gegenprobe.js` und `PORT_VERSATZ` | nein | — |
| **0.9.0** | **Stufe I₁** — Mailversand | `nodemailer`, Anbietervorlagen, Testmail, Adresse am Zugang, zweite Frist | nein | — |
| **0.9.1** | **Stufe I₂** — Selbstanmeldung | Formular, Bestätigungsmail, Warteschlange. **Damit ist der Stufenplan abgearbeitet.** | ja, **ohne Block** | — |
| | | ***ab hier SemVer*** | | |
| **0.10.0** | Zwei-Faktor | TOTP und Wiederherstellungscodes. *MINOR.* Der QR-Encoder wurde herausgenommen | ja | — |
| **0.11.0** | Suche und Bestand | Volltextsuche im Server, gespeicherte Ansichten, Doppelerkennung. *MINOR.* **Das Zusammenführen ist herausgenommen** | **nein** | — |
| **offen** | Zwei Einträge zu einem machen | das Zusammenführen aus der Zeile darüber, als eigene Runde. *MINOR, die Nummer ergibt sich* | nein — es bewegt vorhandene Zeilen | — |
| **offen** | Der QR-Encoder | eigene Runde, siehe unten. *MINOR* | nein | — |
| **offen** | `X-Forwarded-Proto` und zwei Cookienamen | die saubere Lösung des Ja/Nein aus Abschnitt 8. *MINOR* | nein | — |
| **0.11.x** | Fehlerbereinigung und Verbesserungen | Befunde aus dem Betrieb und Nacharbeit an Gebautem. **Keine geplante Nummer, sondern die nächste freie PATCH-Zahl** — und so viele davon, wie sie braucht | in der Regel nein | — |
| **0.12.0** | *(vermutlich)* Bereinigung von Code und Datenbankstruktur | Migrationscode raus, die Datenbankstruktur festgeschrieben, **Absage an zu alte Datenbanken. Ab hier gibt es keinen Rückweg auf ältere Fassungen.** *Ein Bruch — solange die erste Zahl 0 ist, läuft er über MINOR* | ja | — |
| **1.0.0** | **Die Zusage** | Abwärtskompatibilität wird zugesichert, die öffentliche Schnittstelle aus Abschnitt 5 steht fest. Dazu die Vorgabewerte und die Tastaturbedienung beim Sortieren | — | — |
| **danach** | Große Dateien bis 2 GB | Teil II des Videopapiers. *MINOR nach 1.0.0* | ja | — |

**VERÖFFENTLICHEN UND DIE EINS SIND ZWEI VERSCHIEDENE DINGE, und SemVer trennt
sie.** Die Anlage darf mit **jeder** Nummer herausgehen. Was 1.0.0 hinzufügt,
ist nicht das Herausgehen, sondern **die Zusage**: ab da ist die öffentliche
Schnittstelle festgelegt, und ein Bruch daran kostet die Zwei. *Die alte Zeile
„0.9.90 — Veröffentlichung" trug beides in einem und ist deshalb aufgeteilt.*

**Die Reihenfolge war nicht beliebig, und die Bindungen haben getragen:**

- **0.8.10 vor allem anderen.** Ohne festgenagelte Abhängigkeiten wäre jeder Bau
  ein anderer gewesen, und ohne Prüflauf bei jedem Push liefe der Prüfstand nur,
  wenn jemand daran denkt.
- **0.8.20 vor 0.8.50.** Der Videoweg liefert eine Datei **inline** aus. **Die
  Bindung hat sich bewährt:** der Videoweg ist durch `setzeBildHeader()`
  gegangen, ohne dass in `server.js` eine einzige Zeile dazukam, die den Typ
  selbst setzt.
- **0.8.50 vor 0.8.70.** Der Papierkorb serialisiert einen Eintrag. **Die
  Bindung hat sich schärfer ausgezahlt als erwartet:** die Videohälfte ist nicht
  bloß groß, sie sprengt als Base64 die Stringgrenze von Node — wäre der
  Papierkorb vorher gebaut worden, stünde die Bauform heute falsch da.
- **G4 vor 0.8.40.** Beide heben die Formatnummer und fassen das Schema an.
  Nacheinander gebaut heißt zwei Formatnummern statt einer — **und das ist
  bewusst so entschieden:** die Regel „jede Stufe muss in einem Chat
  abzuarbeiten sein" wiegt schwerer als eine gesparte Formatnummer. *Im
  Nachhinein bestätigt: 0.8.40 allein brauchte 125 neue Prüfungen und 30
  Gegenproben.*

### Warum das Zusammenführen aus 0.11.0 herausgenommen ist

Der Fahrplan nannte **Doppelerkennung und Zusammenführen in einer Zeile**. Es
sind zwei Vorhaben, und sie sind verschieden schwer wie Tag und Nacht: die
Doppelerkennung ist eine Zeile in einem Dialog **ohne Route und ohne Schema**,
das Zusammenführen ist der **erste Eingriff der Anlage, der Zeilen zwischen zwei
Eltern verschiebt** — unumkehrbar.

**Was den Ausschlag gegeben hat, ist gezählt und nicht geschätzt.** An einem
Eintrag hängen **acht** Tabellen. Der Auftrag rechnete mit **zwei**
Eindeutigkeitsschranken, die beim Zusammenführen brechen; nachgesehen im Schema
sind es **vier**:

| Tabelle | Schranke | wann sie bricht |
|---|---|---|
| `ratings` | `UNIQUE(item_id, criterion_id, user_id)` | derselbe Mensch hat dasselbe Kriterium an beiden bewertet |
| `test_days` | `UNIQUE(item_id, day, user_id)` | derselbe Mensch am selben Tag an beiden |
| `item_tags` | `PRIMARY KEY (item_id, tag_id)` | **beide tragen denselben Tag** |
| `item_pins` | `PRIMARY KEY (user_id, item_id)` | derselbe Mensch hat beide als Favorit |

**`item_tags` ist dabei der Normalfall und nicht der Randfall:** zwei Einträge,
die denselben Gegenstand beschreiben, tragen fast immer dieselben Tags. Ein
schlichtes `UPDATE … SET item_id = ?` läuft dort auf einen Constraint-Fehler,
und zwar beim ersten echten Doppeleintrag.

**Dazu kommt der Papierkorb.** Er serialisiert einen Eintrag *samt allem, was
daran hängt*. Nach dem Zusammenführen hängt am Verlierer **nichts** mehr — die
Wiederherstellung gäbe eine leere Hülle zurück. *Das ist schlechter als gar kein
Papierkorbeintrag, weil es aussieht wie eine Rettung und keine ist.*

**Entschieden ist: der Schnitt liegt zwischen den beiden.** Das Zusammenführen
bekommt eine eigene Runde samt eigener Route (`F_ROUTEN` 69 → 70, Art `nurAdmin`
und `zweitbestaetigt`), einem Vorgang im Sicherheitsprotokoll (zwanzig →
einundzwanzig) und einer Sicherung des Datenverzeichnisses als **Pflicht**.

**Was dagegen sprach und mitzudenken ist: eine Doppelerkennung ohne
Zusammenführen ist ein Hinweis ohne Heilmittel.** *Das ist tragbar, weil der
Hinweis den zweiten Eintrag verhindert, bevor er entsteht — und das ist der
Fall, der zählt. Es ist kein Ausschlussgrund, und es gehört in die Begründung.*

### Der QR-Encoder — eigene Runde, aus 0.10.0 herausgenommen

**Google Authenticator kennt zwei Wege hinein:** einen Code scannen oder den
Base32-Schlüssel von Hand eintippen. **Der zweite ist der Weg, an dem Menschen
aufgeben** — zweiunddreißig Zeichen auf einem Telefon.

**Der Encoder ist herausgenommen worden, und das ist entschieden, nicht
vergessen.** Ohne Bibliothek heißt er: Reed-Solomon über GF(256), Kapazitäts-
und Blocktabellen je Version und Fehlerkorrekturstufe, Findemuster, Taktlinien,
Alignment, Format- und Versionsbits, acht Masken mit Bewertung — mehrere hundert
Zeilen. **Teuer ist dabei nicht das Bauen, sondern der Beweis:** die Zusage
„dieselbe Zeichenfolge ergibt weltweit dieselbe Matrix" braucht ohne Bibliothek
einen eigenen **Dekoder** im Prüfstand, also die doppelte Arbeit. *Er war damit
der einzige Teil der Runde ohne begrenzten Prüfaufwand — und der abtippbare
Schlüssel trägt den Weg auch ohne ihn.*

**Was die eigene Runde zu entscheiden hat**, gemessen statt geschätzt: die
`otpauth://`-Zeile ist **100 Zeichen** bei `Kriterion/faruk`, **117** bei
`Bewertungskatalog/chefin` und **203** bei einem langen Anlagen- und
Zugangsnamen. Im Bytemodus heißt das Version 5 bis 8 — und die Frage, was
geschieht, wenn ein langer Titel über die Kapazität hinauswächst. *Die Antwort
sollte sein: der Code fällt weg, und der Schlüssel steht allein da.*

### Offene Entscheidungen, die keine Runde haben

- **Eindeutigkeit der Adresse — zu entscheiden, wenn sie gebraucht wird.**
  `users.email` hat bewusst **kein** `UNIQUE`: `ALTER TABLE` kann eines nicht
  nachrüsten, und die gewanderte und die frisch angelegte Datenbank wären damit
  verschieden gebaut. **Wird Eindeutigkeit gewollt, ist der richtige Weg ein
  partieller Index** —
  `CREATE UNIQUE INDEX IF NOT EXISTS … ON users(email) WHERE email IS NOT NULL` —,
  der wirkt auf beiden Wegen gleich und lässt mehrere Zugänge ohne Adresse zu.
  **Er gehört dann in dieselbe Runde wie die Prüfung im Code, nicht davor.**
  *Dazu gehört die zweite Hälfte, die schon entworfen ist:* **hinter der
  Anmeldung wird eine doppelte Adresse klar gesagt** („Diese Adresse ist bereits
  vergeben") — wer das sieht, ist angemeldet und sieht die Liste ohnehin; **vor
  der Anmeldung gilt das Gegenteil**, dort ist jede unterschiedliche Antwort ein
  Werkzeug zum Durchprobieren.
- **Ein Versanddienst über HTTPS statt SMTP — vorgemerkt, nicht eingeplant.**
  Falls SMTP am Anschluss gar nicht durchkommt (manche Anbieter sperren Port 587
  ausgehend), wäre er der Ausweg: Brevo, Mailjet und Postmark haben
  Schnittstellen, die sich mit einem einfachen `fetch` bedienen lassen, **ganz
  ohne Bibliothek**. *Zweiter Weg im Code — erst bauen, wenn SMTP nachweislich
  scheitert.*
- **Der angepinnte Block kann zur Wand werden.** Bei vielen angepinnten
  Kommentaren mehrerer Leute wächst er über allem zusammen. **Wenn das im
  Betrieb stört, ist die Antwort NICHT eine Einschränkung des Anpinnens,
  sondern eine zweite Sortierstufe innerhalb des angepinnten Blocks.**
  *Beobachten, nicht bauen.*

### Vorgemerkt für 1.0

*Aus 0.8.30, 0.8.31, 0.8.40 und 0.8.50 ist je ein markierter Block dazugekommen;
mit `migration083()` sind es **fünf**. **Aus keiner Runde seither ist etwas
dazugekommen**, obwohl mehrere das Schema anfassen — sie bringen neue TABELLEN,
und die legt `CREATE TABLE IF NOT EXISTS` bei jedem Start selbst an.*

- **Finale Bereinigung.** Der Rückbau des Migrationscodes wurde aus
  Notwendigkeit nach 0.8.0 vorgezogen; zu 1.0 folgt eine letzte Bereinigung über
  alles, was bis dahin dazukommt. **Daraus folgt eine Bauregel ab sofort:** jeder
  Code, der die Datenbank verändert, wird so geschnitten und gekennzeichnet, dass
  sein späterer Rückbau leichtfällt (Abschnitt 12).
- **Die fünf markierten Blöcke in `db.js`**, alle mit der Marke
  `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`, samt ihren Prüfabschnitten in
  `pruefung.js` und ihrem Export in `module.exports`:

  | Block | ergänzt | Prüfungen | was ausdrücklich NICHT mitfällt |
  |---|---|---|---|
  | `migration083()` | `comments.images_removed` | 7 | die Spalte in der DDL |
  | `migration0830()` | `links.user_id` | 11 | die Spalte **und** `links` in `ordneBestandZu()` |
  | `migration0831()` | `attachments.user_id` | 13 | die Spalte **und** `attachments` in `ordneBestandZu()` |
  | `migration0840()` | `rating_criteria.gewicht` | 15 | alles zur Gewichtung: `GEWICHT_MIN`/`MAX`, `gueltigesGewicht()`, der JOIN, `criteriaGewichte` |
  | `migration0850()` | `photos.art`, `photos.dauer` | 26 | alles zum Videoweg: `VIDEO_MAX`, die Videotypen, die Ranges, `media-src`, der Filter in `backfillVariants()` |

  **Die Spalte in der DDL bleibt in jedem Fall** — die Prüfung „Eine frische
  Anlage trägt die Spalte ohne Migration" hält genau das fest. **Und eine Prüfung
  gehört ALLEN Blöcken und fällt erst mit dem letzten:** „Ein Sprung von 0.8.20
  fährt ALLE Migrationen in einem Start". *Wer nur einen Block entfernt, muss
  sie umschreiben statt löschen.*
  **`rating_criteria` und `photos` kommen in `ordneBestandZu()` gar nicht vor** —
  anders als bei 0.8.30 und 0.8.31 gibt es dort nichts, was nicht mitfallen
  dürfte.
- **Harte Zurückweisung zu alter Datenbanken.** Seit 0.8.1 wird ein Bestand aus
  der Zeit vor 0.8.0 nicht mehr übernommen, **aber auch nicht erkannt** — der
  Start liefe in SQL-Fehler statt in eine Meldung. Vor 1.0 gehört an den Start
  eine klare Absage, die den Zwischenschritt über 0.8.0 nennt. *`migration0830()`
  greift dabei auf eine Tabelle `links` zu, die es in einer wirklich alten Anlage
  geben mag oder nicht.*
- **Die Vorgabewerte durchsehen.** `title_app` hat im Server die Vorgabe „Model
  Bewertungen" — ein persönlicher Wert, der in einer frischen Installation für
  jeden dasteht; **„Bewertungen" ist die neutrale Vorgabe.** Dazu liegt die
  Vorgabe für `title_public` **zweimal**: im Server als „Bewertungskatalog", in
  `public/app.js` als „Kriterion". Aufzulösen **zugunsten des Servers**: das
  Frontend bekommt gar keine — antwortet `/api/config` nicht, zeigt die
  Anmeldeseite lieber nichts als etwas Falsches. *Das spart die zweite Wahrheit
  ganz, statt sie abzugleichen.*
- **Tastaturbedienung beim Sortieren.** Umsortiert wird an fünf Stellen (Fotos
  **und Videos**, Links, Kriterien, Blöcke, Tags am Testtag), überall
  ausschließlich über Zeigerereignisse; im Frontend stehen **null** `tabindex`
  und zwei `aria-`Angaben. **Wer keine Maus benutzen kann, kann die Reihenfolge
  der Fotos nicht ändern — und das erste Foto ist das Hauptbild.** Die Antwort
  ist klein: `tabindex="0"` an der Zeile und `Alt+↑`/`Alt+↓` im Fokus. **Daraus
  eine Regel:** *was sich ziehen lässt, muss sich auch mit der Tastatur bewegen
  lassen. Maus, Finger und Tastatur sind drei Fälle, nicht zwei.* **Seit 0.8.30
  hängt daran noch etwas:** das Datum des Eintragers steht nur im Überfahrtext
  und ist ohne Zeigegerät gar nicht erreichbar.
- **Zwei Sätze in die README.** **Erstens: eine Anlage ist ein Sachgebiet.**
  Kriterien sind global und erscheinen an jedem Eintrag; wer Modelle **und**
  Werkzeuge **und** Bezugsquellen in derselben Anlage sammelt, hat an jedem
  Eintrag die Kriterien aller drei stehen. **Das ist die einzige Annahme der
  Architektur, die nirgends aufgeschrieben ist.** *Aufschreiben statt bauen:* wer
  zwei Sachgebiete sammelt, betreibt zwei Anlagen — was zur Linie „ein Schlüssel,
  eine Datenbank" ohnehin besser passt. **Kriteriengruppen je Kategorie wären ein
  Umbau und sind ausdrücklich nicht vorgesehen.**
  **Zweitens: ein Schlüssel, eine Datenbank.** Jeder Benutzer vertraut dem
  Betreiber mit allem, was er einträgt. *Bei einer selbstgehosteten Sache ist das
  normal — es gehört trotzdem in die README, sobald Fremde mitmachen.*
- **Abwärtskompatibilität.** Ab 1.0 wird sie zugesichert und aufrechterhalten.
  Fällt die Entscheidung früher, wird sie vorher final in die Dokumente
  eingearbeitet.

**Ideen ohne Beschluss**, hier als Liste und sonst nirgends: Prüfung der
Wiederherstellung, Anzeige des Speicherverbrauchs, PWA-Manifest, Vorlagen für
Einträge, Tags in Mengen bearbeiten, Druckstylesheet, Fälligkeitsdatum an
Aufgaben, Erwähnungen im Kommentar.

*Herausgefallen, weil beschlossen:* Sicherung auf Anforderung und Endpunkt für
den Gesundheitszustand (0.8.20 bzw. 0.8.70), Doppelerkennung (0.11.0).

**Neue Punkte aus dem Betrieb stehen in `Doku/Roadmap.md`** — ohne Nummer und
ohne Rangfolge, bis genug zusammengekommen sind. *Ein Punkt wandert von dort in
diesen Fahrplan und von hier in ein Änderungsprotokoll.*

---

## 11. Auflagen für alles, was noch gebaut wird

**Hier steht nur, was BINDET.** Eingelöste Merkposten fallen mit der Version
heraus, in der sie gebaut sind; was von ihnen als Regel weitergilt, steht in
Abschnitt 5. *Die Auflagen aus Teil V des Konzeptpapiers sind mit Revision 25
hierher gezogen — sie galten dort für „kommende Stufen", und Stufen gibt es
keine mehr.*

### Am Quelltext

- **Wer eine schreibende Route ergänzt, trägt sie in `F_ROUTEN` ein** — sonst
  wird der Lauf namentlich rot, und genau das ist der Zweck. Die Liste (aktuell
  **69** Routen) ist die Stelle, an der die Rechtefrage gestellt wird.
  **Ein lesender Endpunkt steht dort nicht, auch mit Wächter nicht.**
  *Die Zahl wird seit 0.8.40 ausdrücklich geprüft — nicht nur die
  Übereinstimmung der Liste mit dem Quelltext (Stolperstein 137).*
- **Die Art in `F_ROUTEN` sagt nicht, WELCHE Klemme im Rumpf steht.**
  `eintragFrei(`, `darfAendern(`, `nurSelbst(` und die Übrigen stehen alle in
  `RUMPF_WOERTER`. **Wer eine Klemme durch eine andere ersetzt — etwa die Frage
  nach dem *Eintrag* durch die nach der *Zeile* —, bewegt die Liste nicht und
  braucht eine eigene Quelltextprüfung daneben.** Dreimal gebaut.
- **Wo `'offen'` steht, steht weder eine Klemme im Rumpf noch ein Wächter in der
  Routenzeile** (Stolperstein 101). Beide Richtungen werden geprüft.
- **Die Art `'selbstbezug'` prüft die Herkunft der Benutzernummer, nicht den
  Namen einer Funktion** (seit 0.8.80): sie muss aus `req.benutzer` kommen und
  darf nicht aus `req.params`.
- **Wer einen Vorgang im Sicherheitsprotokoll ergänzt**, trägt ihn in
  `VORGAENGE` ein und entscheidet, ob er ein Merkmal aus der **geschlossenen**
  Liste braucht. **Freitext von außen kommt in diese Tabelle nicht hinein.**
- **Eine Einstellung, die an allen Einträgen aller Benutzer erscheint, gehört
  dem Admin — und in die Datenbank.** Nicht in `user_settings` (zwei Wahrheiten
  über dieselbe Sache), und nicht in eine Konfigurationsdatei (außerhalb von
  Verschlüsselung, Sicherung und Export). **`.env` trägt nur, was vor dem Öffnen
  der Datenbank lesbar sein muss.**
- **Wer eine Zusicherung über eine Zahl gibt, sucht den Rechenweg, der sie
  baulich wahr macht** (seit 0.8.40). *Ein Deckel, den es nicht gibt, kann nicht
  vergessen werden.* Und die Kehrseite gehört dazu: **wo ein Rechenweg eine
  Zusicherung trägt, ist die eine Stelle, an der er kippen kann, im Quelltext zu
  benennen.**
- **Wer aus einer Nummer einen Namen machen muss, hat zwei Muster** — und sie
  gehen in verschiedene Richtungen. `verfasserKarte()` in `server.js` macht aus
  einer Nummer einen Verfasser (für den Bildschirm, als Objekt),
  `verfasserName()` im Export macht aus ihr einen Namen (für die Datei, als
  String), und `verfasser()` im Import macht aus einem Namen eine Nummer.
- **Ein Wächter kann mehr sein als eine Rechtefrage** (seit 0.8.31). Vor
  `POST /api/items/:id/attachments` stand `nurEintragVerfasser` **vor multer**,
  ausdrücklich, damit die Datei eines Fremden gar nicht erst eingelesen wird.
  **Wer einen Wächter entfernt, liest zuerst, warum er dort steht.**
- **Wer eine Datei aus dem Bestand baut, denkt an die Stringgrenze** (seit
  0.8.70). Der volle Export hält mit Schaltern dagegen, der Einzelexport mit
  einer Absage, der Papierkorb mit einer Nebentabelle. **Wer einen vierten Weg
  ergänzt, entscheidet sich für einen davon.**
- **Wer an einen angegebenen Ort schreibt, prüft den aufgelösten Pfad** (seit
  0.8.70). Positivliste zuerst, `realpathSync` danach. *Wer eine zweite Stelle
  baut, nimmt `pruefeOrt()` zum Vorbild und schreibt die Regel nicht ein zweites
  Mal hin.*
- **Wer eine Ansicht ergänzt, holt ihren Bestand beim Aufbau** (seit 0.8.70,
  Stolperstein 118).
- **Der Cookiename ist kein fester String.** Wer etwas an der Sitzung baut,
  nimmt ihn aus `auth.COOKIE_NAME` und schreibt ihn nirgends ab.
- **Die Node-Version steht an zwei Stellen und muss an beiden dieselbe sein**
  (seit 0.8.10): im `Dockerfile` (beide Stufen) und in
  `.github/workflows/pruefstand.yml`. *Laufen sie auseinander, prüft der
  Prüflauf gegen etwas, das im Container so nicht betrieben wird.*
- **Was der Server weder lädt noch ausliefert, steht nicht im Fingerprint**
  (seit 0.8.10). Die Liste ist **abgeleitet** — `require.cache` plus `public/` —,
  nicht gepflegt. **Wer ein weiteres serverseitiges Modul ergänzt, das beim Start
  geladen wird, sieht den Fingerprint wandern — das ist beabsichtigt, nicht zu
  unterdrücken.** *Ein `require` **innerhalb** einer Funktion liefe später und
  stünde dann nicht darin; dagegen steht ein Wächter über den Modulgraphen
  (Stolperstein 95).*
- **Fotos und Videos stehen in EINER Tabelle, und das darf keine Ausnahme
  bekommen** (seit 0.8.50). **Wer künftig eine Abfrage auf `photos` schreibt,
  entscheidet ausdrücklich, ob sie beide Arten meint.** Die drei Stellen, an
  denen die Trennung gebaut ist, sind Löschdialog, Kennzahlen und Export.
- **Wer eine Spalte mit zwei Bedeutungen einführt, geht jede Stelle durch, die
  sie ohne Fallunterscheidung liest** (seit 0.8.50, Stolperstein 109). *In
  0.8.50 war das `backfillVariants()`; gefunden wurde es beim Durchgehen der
  Liste „welche Regel gilt von selbst", nicht von einer Prüfung.*
- **Eine neue SPALTE braucht die DDL UND einen Migrationsblock, eine neue
  TABELLE nicht** (Auflage 20 des Konzeptpapiers, an jeder Datenbankstufe
  erneut nachgestellt). **Zwei Auflagen kommen aus 0.8.30 dazu, und beide gelten
  für jede folgende Datenbankstufe:** *erstens* ist die Frage, **wem** die
  Bestandszeilen zufallen, eine eigene Entscheidung und nicht dieselbe wie die
  des Auffangnetzes — *wer das nicht nebeneinander erklärt, hinterlässt einen
  scheinbaren Widerspruch*; *zweitens* lässt sich eine Fremdschlüsselspalte nur
  **nullbar** nachrüsten (Stolperstein 105). **Und eine dritte aus 0.8.31:**
  liegen mehrere Blöcke vor, gehört ein Prüflauf dazu, der sie **hintereinander
  in einem Start** fährt — *das ist die Lage, die im Betrieb wirklich vorkommt,
  und keiner der einzelnen Abschnitte deckt sie ab.*
- **`INSERT OR REPLACE` ist ein `DELETE` mit Nachspiel** (Auflage 18,
  Stolperstein 70): SQLite löscht die Zeile, die das `UNIQUE` verletzt, und über
  `ON DELETE CASCADE` gehen deren Kinder mit — lautlos. **Die Frage lautet nicht
  „welcher Wert gewinnt", sondern „was hängt an der Zeile, die verschwindet".**
  *Sechsmal geprüft und sechsmal nicht zutreffend — die Auflage bleibt stehen.*
- **Ein `UNIQUE` mit einer Spalte, die leer sein darf, ist löchrig** (Auflage
  14, Stolperstein 57). `NULL` gilt als von allem verschieden. **Betrifft jede
  weitere Spalte, die in einem UNIQUE steht und nachgetragen wird, und ist bei
  jedem Löschweg mitzudenken.**
- **Ein Fremdschlüssel ohne `ON DELETE` ist auch eine Entscheidung — nur keine
  bewusste** (Stolperstein 54). Zu jeder neuen Fremdschlüsselspalte gehört die
  Frage, was beim Löschen des Ziels geschehen soll — **und wer das Ziel heute
  schon löscht.**

### Am Prüfstand

- **Rechteprüfungen, die grün sind, ohne zu prüfen** (Auflage 3). Eine Prüfung,
  die nur den Erfolgsfall durchspielt, belegt kein Verbot. **Jede Verweigerung
  braucht ihre eigene Gegenprobe mit zweiter Sitzung** — und **an dem Zugang,
  den sie treffen soll**: eine Schranke, die aus einer Liste ableitet, wird erst
  bei einem Zugang **ohne** Adminrolle laut (Stolperstein 116).
- **Wird ein Endpunkt eingeschränkt oder erweitert, sind die Prüfungen der
  Vorgängerversion die ersten Betroffenen** (Stolperstein 74). **Umdrehen oder
  umhängen, nicht löschen** — in fünf aufeinanderfolgenden Versionen angewandt.
- **Wer eine Anzeige einschränkt, prüft zuerst, was an ihr hängt** (seit 0.8.6).
  **Die Frage gehört vor den Bau, nicht in die Gegenprobe.**
- **Eine Regel, die an einer Stelle geprüft ist und an der zweiten nur
  behauptet, ist an der zweiten ungeprüft** (seit 0.8.31). **Wer eine bestehende
  Regel auf einen weiteren Ort ausdehnt, dehnt die Prüfungen mit aus — er
  verweist nicht auf die vorhandenen.**
- **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine Prüfung
  an der echten Antwort** (Stolperstein 102). Der Mock in `baueDom` bringt die
  Felder selbst mit; **er kann eine fehlende Serverantwort nicht bemerken.**
- **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Er darf die
  Antwort weder **vereinfachen** noch **erstarren** lassen; was hinter einem
  Wächter liegt, liegt auch bei ihm dahinter; **und was scheitern können soll,
  muss bei ihm stellbar sein.** **Wer eine Aussage über REIHENFOLGE prüfen will,
  braucht eine stellbare Verzögerung** (Stolperstein 171).
- **Ein Bedienelement ist erst geprüft, wenn ein Ereignis wirklich zugestellt
  wurde** (Auflage 17, Stolperstein 61). `.click()` oder der von Hand gerufene
  Behandler genügen nicht — es braucht `dispatchEvent` samt Durchlauf des Event
  Loops. *Nicht „neues Bedienelement" ist der Anlass, sondern „geänderter Weg
  hinter einem Bedienelement".*
- **Ein Zeitstempel mit Sekundenauflösung belegt keine Änderung innerhalb
  derselben Sekunde** (Auflage 15, Stolperstein 60). **Betrifft jede Stufe, in
  der `updated_at` eine Rolle spielt.** Richtig ist, den Ausgangswert von Hand
  auf ein festes, altes Datum zu setzen.
- **Ein Merkmal kann vollständig geprüft sein und trotzdem an der falschen
  Stelle wirken** (Stolperstein 65). Zu einem Merkmal in Sortierung oder Filter
  gehört eine Prüfung mit **zwei** Sortierungen und einem Eintrag mit leerem
  Sortierwert — **und wer prüfen will, dass ein Filter nicht sortiert, misst die
  Liste ohne ihn** (Stolperstein 114).
- **Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern** (Auflage 21, Stolperstein 81). **Erst das Vorhandensein prüfen,
  dann die Eigenschaft** — und **jedes Feld, das eine Prüfung anfasst, bekommt
  ein Auffangnetz** (Stolperstein 170), sonst reißt ein Rückbau den Lauf ab statt
  ihn rot zu machen.
- **Ein Rückbau, der den Lauf abbricht, nennt keinen Namen** (Stolperstein 76).
  **Ist er so grundlegend, gehört eine engere zweite Gegenprobe daneben:** die
  eine belegt die Tragweite, die andere den Ort.
- **Jede von Hand angelegte Prüfzeile trägt ihren Verfasser ausdrücklich**
  (Stolperstein 104). Es gibt **sechs** Tabellen mit `user_id`; eine Zeile ohne
  sie überlebt den nächsten Start nicht so, wie sie angelegt wurde. **Wer dort
  eine Tabelle ergänzt, prüft zuerst, ob ihre Spalte eine Zugehörigkeit ist oder
  die Feststellung eines Vorgangs.**
- **Die Rollen sind eine Leiter, auch in der Prüflage** (Stolperstein 87). Wer
  `istAdmin: false` setzt, setzt `istEigentuemer` gleich mit.
- **Wer eine Prüflage ergänzt, rechnet nicht nur ihre eigene Portnummer nach,
  sondern die Spanne aller** (Stolpersteine 127 und 152) — und die Spanne ist
  voll (Abschnitt 7).

### Am Betrieb

- **Die beiden Anlegen-Schalter sind eine Einstellung, keine Version.** Wer
  künftig „das Anlegen soll nur der Admin dürfen" hört, **prüft zuerst die
  Schalterstellung**, bevor er baut.
- **Ein Adressbuch, wer `X-Forwarded-For` setzen darf, ist bewusst nicht
  gebaut** (Entscheidung aus 0.8.20). Die Einstellung ist ein Ja/Nein. **Die
  Anlage ist inzwischen aus zwei Netzen zugleich erreichbar** — der einfachere
  Weg steht in Abschnitt 8.
- **Ein Vermerk gehört dorthin, wo aus einer Aussage etwas herausgenommen
  wird — nicht dorthin, wo eine ganze Aussage verschwindet.** Ein gelöschter
  Kommentar und ein gelöschter Link bekommen deshalb keinen.

---

## 12. Arbeitsweise für die Fortsetzung

- **Vor dem Bauen besprechen.** Änderungswünsche erst durchdenken, Rückfragen
  stellen, Entscheidungen ausdrücklich bestätigen lassen, dann umsetzen. Wenn
  am Entwurf etwas unstimmig wirkt, wird es **vorher** gesagt und nicht
  hinterher.
- **Kurze Chats.** Jede Nachricht verarbeitet den gesamten bisherigen Verlauf;
  lange Gespräche werden überproportional teuer. Für größere Vorhaben getrennte
  Chats je Bereich, jeweils mit diesem Blatt als Einstieg. **Wird ein Auftrag zu
  groß für einen Durchgang, gehört das vorher gesagt.**
- **Gezielt ändern statt neu erzeugen.** Das Projekt läuft; einzelne Dateien
  anzupassen ist fast immer günstiger als ein Neubau.
- **Erst nachstellen, dann behaupten.** Was an einer Datenbank oder an einem
  Pragma zweifelhaft ist, lässt sich in zwanzig Zeilen nachbauen. *Die
  Stolpersteine 54, 57, 58, 105, 107 und 128 sind so entstanden — **vor** dem
  Bauen.*
- **Am Ende prüfen, nicht behaupten.** `npm test` läuft in Minuten. Neue
  Funktionen bekommen neue Prüfungen — und die Gegenprobe: die Änderung
  probeweise zurückbauen und zeigen, dass die Prüfung wirklich rot wird. **Eine
  Gegenprobe, die stumm bleibt, ist ein Fund und kein Beleg.**
- **Eine Zahl in einem Papier ist eine Behauptung.** Wo eine im Prüfstand
  festgenagelt werden kann — wie die 69 in `F_ROUTEN` —, gehört sie dorthin; wo
  nicht, gehört sie beim Nachtragen **nachgezählt** (Stolperstein 137).
- **Datenbankverändernder Code wird rückbaufreundlich gebaut.** Zu 1.0 kommt
  eine finale Bereinigung; bis dahin wird jede Änderung am Schema oder an
  Bestandsdaten so geschnitten und gekennzeichnet, dass sie sich später mit
  einem Griff entfernen lässt.
- **Sprache im Projekt: Deutsch**, auch in Kommentaren, Oberfläche und
  Meldungen. **Fachbegriffe werden aber nicht zwanghaft eingedeutscht**
  (seit 0.8.60):

  > Wo die deutschsprachige IT ein englisches Wort benutzt, steht dieses Wort —
  > und wo es ein gebräuchliches deutsches gibt, steht das deutsche. Der Maßstab
  > ist weder „möglichst deutsch" noch „möglichst englisch", sondern **das Wort,
  > das ein deutschsprachiger Entwickler im Gespräch benutzen würde.**

  **Die Regel zielt auf übersetzte Lehnwörter, nicht auf die eigenen Bilder des
  Projekts.** „Stolperstein", „Gegenprobe", „Prüfstand", „Wächter" und „Klemme"
  sind keine Übersetzungen von irgendetwas Englischem — sie sind eigene Begriffe
  mit eigener Bedeutung und **bleiben**.

  Abgeräumt mit 0.8.60: Cookie (nicht `Keks`), Migration (nicht `Umstieg`),
  Image, Lockfile, Mock, Multipart, Branch, Downgrade, Event Loop, String,
  Fingerprint (nicht `Abdruck`). **„Kopfzeile" und „Bereich" nur dort, wo ein
  HTTP-Header bzw. ein Range gemeint ist** — die Kopfzeile der Anwendung, der
  Blockbereich der Detailansicht, der gültige Bereich eines Gewichts und der
  Zweig einer Verzweigung im Quelltext heißen weiter so. **Ein stures Suchen und
  Ersetzen richtet hier Schaden an.**

  **Ein Wächter im Prüfstand hält die Regel fest:** eine **kurze** Liste, gesucht
  in `Doku/`, in den Kommentaren des Quelltextes und in `CHANGELOG.md` — *ein
  Wächter, der jedes zweite Wort anmeckert, wird abgeschaltet.* Er ist die
  ausdrückliche Ausnahme von Stolperstein 106 und sieht die Kommentare an;
  **Code lässt er in Ruhe**, und was in Backticks steht, ist zitierter Code und
  keine Sprache. **Die Regel gilt für alles Neue**, unabhängig davon, wie weit
  die Bereinigung des Bestands geht.
- **Ein Papier trägt eine Sache, und nur eines trägt sie.** Was gebaut ist,
  steht in diesem Blatt; was ein Betreiber wissen muss, im Changelog; was
  wirklich gebaut wurde, im Änderungsprotokoll; wie man es bedient, in der
  README. **Wer eine Zahl an zwei Orten pflegt, pflegt sie an einem nicht.**
