# Projektstand — Kriterion

**Kompakte Übergabe · Revision 19 · Stand 24. August 2026 · gebaut: Version 0.8.90**

Dieses Blatt fasst ein langes Entwicklungsgespräch zusammen. Es genügt, um in
einem frischen Chat weiterzuarbeiten, ohne den alten Verlauf mitzuschleppen.
**Gearbeitet wird im Repo `fardem/kriterion`**, nicht an einer Kopie; dieses
Blatt, das Konzeptpapier und die Änderungsprotokolle liegen dort unter
`Doku/`.

**Was Revision 19 ist.** Revision 18 trug 0.8.80 nach. Diese trägt **0.8.90**
nach — **„Schwere Eingriffe"**, und das ist **keine Stufe des
Mehrbenutzerbetriebs**: der ist mit Stufe H bis auf **Stufe I** gebaut, und die
bleibt bei 0.9.0. Diese Runde liegt dazwischen und arbeitet ihr an einer Stelle
vor.

**0.8.90 in einem Satz: wer die Anlage als Ganzes anfasst, gibt sein Passwort
noch einmal ein — und was dabei geschieht, steht hinterher nachlesbar da.**
Drei Dinge sind dazugekommen: die **zweite Bestätigung** vor sieben schweren
Wegen, das **Sicherheitsprotokoll** als Tabelle, in die sie schreibt, und die
optionale **öffentliche Adresse** in der `.env`. **Es ist eine Datenbankstufe** —
das Schema bekommt die Tabelle `sicherheitsprotokoll` —, aber **ohne
Migrationsblock**, wie schon 0.8.70 und 0.8.80: an dieser Tabelle zum dritten
Mal nachgestellt, nicht abgeschrieben. Es bleibt bei **fünf** markierten Blöcken.

**Die tragende Frage der Runde war, wogegen das eigentlich verteidigt.** Nicht
gegen einen Fremden — der kommt ohne Passwort gar nicht herein. Sondern gegen
eine **fremde offene Sitzung**: einen Bildschirm, der unbeaufsichtigt stehen
blieb, einen gestohlenen Cookie, einen Rechner, an dem jemand anderes sitzt.
`aendereZugang()` wendet dieses Prinzip seit 0.5.0 an; es fehlte nur bei den
schweren Wegen. Daraus folgt alles Weitere: die Bestätigung gilt **genau
einmal**, für **genau eine Handlung an genau einem Ziel**, und sie ist an **die
Sitzung** gebunden, nicht an den Menschen.

**Drei Entscheidungen, die vom Auftrag abweichen und begründet gehören.** Die
Bestätigung reist **nicht im Rumpf der Handlung**, sondern kommt über eine
eigene Route und liegt danach als kurzlebige **Freigabe im Arbeitsspeicher** —
weil `GET /api/export` eine Browsernavigation ist (dort gibt es keinen Rumpf)
und weil der Wächter vor `POST /api/import` ausdrücklich **vor multer** steht.
Das Protokoll führt **keine Namensspalte**: sie wäre die eine Stelle im Projekt,
die den Grabstein rückgängig macht. Und die **gescheiterte Anmeldung** steht
darin — mit der Anmeldebremse als baulichem Deckel, denn sie ist die einzige
Zeile, die ein Fremder auslösen kann.

**`F_ROUTEN` geht von 56 auf 57** und bekommt die neue Art `'zweitbestaetigt'`;
sechzehn Karten im Systembereich werden **siebzehn**. Die Formatnummer bleibt
bei **10** — weder das Protokoll noch die Bestätigung stehen im
Austauschformat. Keine neue Abhängigkeit, kein neuer Vokabeleintrag.

**0.8.80 davor** war **Stufe H**, „Einladung, Rücksetzung, Sitzungen": ein
Zugang bekommt sein Passwort **selbst**, über einen Link mit begrenzter
Haltbarkeit (32 Zufallsbytes, gespeichert als SHA-256 ohne Salz, sieben Tage,
genau einmal), derselbe Mechanismus trägt die Rücksetzung, und jeder sieht in
der Karte **„Meine Sitzungen"**, wo er überall angemeldet ist. Ebenfalls eine
Datenbankstufe ohne Migrationsblock; `F_ROUTEN` ging von 51 auf 56.

**Was davor liegt, steht in Abschnitt 9** — 0.8.71 verlegte den Sicherungsort,
0.8.70 brachte Sicherung und Papierkorb, 0.8.60 machte „Offen" und „Neu seit"
auffindbar, 0.8.50 stellte das Kurzvideo in dieselbe Reihe wie die Fotos,
0.8.40 gab jedem Kriterium ein Gewicht, 0.8.30 und 0.8.31 gaben Links und
Dateien einen Verfasser.
**Damit ist der Mehrbenutzerbetrieb bis auf Stufe I gebaut.** Vollständig
geblieben sind die Abschnitte 5 und 12 — Entscheidungen und Arbeitsweise.
Bestände und Versionen vor 0.8.0 werden nicht mehr berücksichtigt.

> **Regel für diesen Kopf, damit er nicht zum zweiten Changelog wird.** Er
> trägt die **gebaute** Runde und die eine davor ausführlich; alles Ältere
> steht in **einem** Satz und sonst in Abschnitt 9. Wer eine Runde nachträgt,
> kürzt die vorletzte auf diesen Satz ein. Ein Übergabeblatt, das mit jeder
> Version wächst, wird irgendwann nicht mehr gelesen — und dann nützt es
> niemandem mehr.

**Für den Betrieb ändert sich mit 0.8.90 zweierlei.** Die **Sicherung des
Datenverzeichnisses steht als PFLICHT im Einspielweg** — es ist eine
Datenbankstufe, auch ohne Migrationsblock. Seit 0.8.70 gibt es sie auf
Knopfdruck; das ist der bequemere der beiden Wege, **aber ohne die `.env` ist
die Kopie wertlos**, denn sie ist verschlüsselt. Und die **`.env.example`
bekommt einen neuen, optionalen Eintrag**: `OEFFENTLICHE_ADRESSE`, leer als
Vorgabe — wer nichts tut, merkt nichts davon. Die `docker-compose.yml` ist
**unberührt**. Die **Formatnummer der Exportdatei
bleibt bei 10** (0.8.30 hob sie auf 7, 0.8.31 auf 8, 0.8.40 auf 9, 0.8.50 auf
10). Alles davon steht in Abschnitt 2.

**Was als Nächstes ansteht, steht in Abschnitt 10.** Der Umbau auf mehrere
Benutzer wird in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_90.md` gepflegt und
nur dort; von seinen Stufen ist **allein Stufe I offen** — diese Runde hat
daran nichts bewegt. **Der Schlüsselwechsel aus dem Auftrag 0.8.90 ist NICHT
gebaut** und liegt auf **0.8.91**; der Grund steht in Abschnitt 10.

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

---

## 1. Was es ist

Selbstgehostetes Bewertungsarchiv für Dinge, die man sammelt und beurteilt —
Geräte, Materialien, Modelle, Prototypen. Kein Verkauf, keine Cloud, läuft
offline im Heimnetz auf einem Intel N100 unter OpenMediaVault, hinter Nginx
Proxy Manager, erreichbar auf Port **3100**.

**Zur Netzlage, seit 0.8.20 nachgesehen statt vermutet** (`docker inspect`):
Kriterion hängt allein in `kriterion_default`, Nginx Proxy Manager in
`npm_external-net`/`npm_internal-net` — **kein gemeinsames Netz**. Und
wichtiger: **Kriterion wird zum Stand dieses Blatts gar nicht über den Proxy
geführt.** Es läuft im Heimnetz auf Port 3100, direkt. Der Proxy steht auf
demselben Wirt für andere Dienste und wäre der Weg nach außen, sobald
Kriterion ins Internet gegeben wird — dann über den veröffentlichten Port
3100, nicht über den Containernamen. **Daraus folgt die Stellung von
`HINTER_PROXY`** (Abschnitt 3): heute aus, mit dem Schritt nach außen an.

Node.js/Express, verschlüsselte SQLite-Datenbank (SQLCipher über
`better-sqlite3-multiple-ciphers`), `sharp` für die Bildvarianten, Frontend
ohne Framework, Auslieferung per Docker.

17 Dateien. Darin `pruefung.js` — der Prüfstand, läuft über `npm test` —,
`anhaenge.js` mit sämtlichen Auslieferungsregeln für angehängte Dateien
(Abschnitt 5a) und `zugang.js`, der Befehl auf dem Wirt für Passwort und
Zugänge.

**Das Projekt heißt „Kriterion", die Datenbankdatei weiterhin
`katalog.sqlite`.** Der Dateiname ist kein Projektname und wandert bei keiner
Umbenennung mit — ein anderer Name ließe den Start eine leere Neuinstallation
vermuten (Abschnitt 5).

---

## 2. Betriebsstand

**0.8.90 ist gebaut** — Fingerprint **`FINGERPRINT_0890`**, 2903
Prüfungen. **Keine Stufe des Mehrbenutzerbetriebs, aber eine Datenbankstufe
ohne Migrationsblock:** das Schema bekommt die Tabelle `sicherheitsprotokoll`
(`id`, `am`, `was`, `wer`, `ziel`, `merkmal`) samt Index auf `am`. Zum dritten
Mal an dieser Tabelle nachgestellt statt abgeschrieben. Es bleibt bei **fünf**
markierten Blöcken, und unter „Vorgemerkt für 1.0" kommt **nichts** dazu.
**Sieben schwere Wege über sechs Routen verlangen das Passwort ein zweites
Mal** — Export, Import, Rolle vergeben, fremdes Passwort setzen, Link erzeugen,
Zugang entfernen. Die Bestätigung kommt über `POST /api/bestaetigung` und liegt
danach als **Freigabe im Arbeitsspeicher**: gebunden an Sitzungstoken, Zweck
und Ziel, gültig 120 Sekunden und **genau einmal**. Kein Schema, also kein
sechster Migrationsblock.
**Das Sicherheitsprotokoll hält vierzehn Vorgänge fest**, 180 Tage lang; die
Frist ist der **einzige** Weg hinaus. Es sieht nur der Eigentümer.
**`OEFFENTLICHE_ADRESSE` ist neu in der `.env`** und optional; leer heißt „wie
bisher, der Browser baut".
**`F_ROUTEN` geht von 56 auf 57**, die Formatnummer bleibt bei **10**.
24 Gegenproben.
**Der Schlüsselwechsel, Punkt 3 des Auftrags, ist NICHT gebaut** — er liegt auf
0.8.91 (Abschnitt 10).

**0.8.80 davor** — Fingerprint **`a835ac92`**, 2661
Prüfungen. **Stufe H des Mehrbenutzerbetriebs, und eine Datenbankstufe ohne
Migrationsblock:** das Schema bekommt die Tabelle `tokens`
(`hash`, `user_id`, `zweck`, `ablauf`, `benutzt_am`, `created_at`) samt Index
auf `user_id`. Nachgestellt an dieser Tabelle, nicht aus 0.8.70 abgeschrieben:
`CREATE TABLE IF NOT EXISTS` legt eine fehlende **Tabelle** bei jedem Start an.
Es bleibt bei **fünf** markierten Blöcken, und unter „Vorgemerkt für 1.0" kommt
**nichts** dazu.
**Stufe H im Einzelnen: ein Token trägt 32 Zufallsbytes; gespeichert wird nur sein SHA-256** — ohne
Salz, damit die Zeile über den Primärschlüssel gefunden statt gesucht wird. Er
gilt **sieben Tage** und **einmal**; beim Einlösen fallen alle Sitzungen dieses
Zugangs **und alle übrigen offenen Links**. Abgelaufene Zeilen räumt
`raeumeTokensAuf()` dreißig Tage nach Ablauf weg — beim Start und beim Öffnen
der Karte „Zugänge".
**Ein Zugang ohne Passwort trägt den leeren Hash** — dieselbe Sperre wie beim
Grabstein, ohne eine einzige neue Klemme; `ZUSTAENDE` bleibt bei drei.
**Zwei schreibende Routen stehen vor der Anmeldung** (`POST /api/token/pruefen`
und `.../einloesen`), beide hinter der Anmeldebremse: die IP-Hälfte greift
unverändert, die Namenshälfte fällt weg. Die Absage ist **eine einzige** für
alle Fälle.
**Die Einlöseseite ist ein Zustand der Anmeldeseite**, erreicht über
`#/einladung/<schlüssel>` — das Fragment geht nie an den Server.
**`F_ROUTEN` ging von 51 auf 56**, die Formatnummer blieb bei **10**.
40 Gegenproben.

**0.8.71 davor** — Fingerprint **`1b03fabf`**, 2398
Prüfungen. Eine **Berichtigungsrunde ohne Schema, ohne Route, ohne
Formatnummer**: der Sicherungsort liegt jetzt im Projektverzeichnis
(`./kriterion-sicherung:/app/sicherung`), und `GET /api/sicherung` sagt über
das Feld `imArbeitsverzeichnis`, wie er liegt. Die Karte macht daraus einen
roten oder grünen Kasten. **Die Aussage trägt nur, solange die Einhängung die
Lage spiegelt** — der Prozess sieht den Wirt nicht (Stolperstein 123); ein
Wächter über die `docker-compose.yml` hält es fest. Der Einspielweg holt den
Sicherungsordner jetzt eigens aus dem umbenannten Verzeichnis zurück.

**0.8.70 davor** — Fingerprint **`1aa9266a`**. *Wieder eine
Datenbankstufe, aber keine Stufe des Mehrbenutzerbetriebs:* das Schema bekommt
**zwei Tabellen**, `papierkorb` und `papierkorb_bytes` — und **keinen
Migrationsblock**. Nachgestellt statt geglaubt: anders als eine Spalte legt
`CREATE TABLE IF NOT EXISTS` eine fehlende **Tabelle** bei jedem Start an. Es
bleibt bei **fünf** markierten Blöcken, und es kommt **kein** Eintrag unter
„Vorgemerkt für 1.0" dazu.
**Der Papierkorb fasst keine bestehende Abfrage an:** `items` trägt unverändert
zehn Spalten, kein `WHERE` hat einen Zusatz. Beim Löschen wird der Eintrag im
Austauschformat serialisiert und **in derselben Transaktion** entfernt; die
Bytes gehen dabei **an der JSON vorbei** in eine Nebentabelle, weil zwanzig
Videos als Base64 533 MB in einem String wären und Node keinen String über
512 MB hält.
**Die Sicherung auf Knopfdruck** nutzt `VACUUM INTO` — vollständig,
verschlüsselt, ohne Schlüssel unlesbar. Der Zielort kommt zweistufig: die
Wurzel aus `SICHERUNG_DIR`, ein Unterverzeichnis darunter aus der Oberfläche,
geprüft am **aufgelösten** Pfad.
**Vier neue schreibende Routen: `F_ROUTEN` geht von 47 auf 51.** Die
Formatnummer bleibt bei **10**; der **Einzelexport** ist dieselbe Form mit
einem Eintrag.
**2381 von 2381 Prüfungen**, 38
Gegenproben.

**0.8.60 davor** — Fingerprint **`ab68b523`**. *Keine Datenbankstufe und
keine Stufe des Mehrbenutzerbetriebs:* die **Ansicht „Offen"** über
`GET /api/offen` zeigt alle nicht erledigten Aufgabenkommentare quer über alle
Einträge, gruppiert nach Eintrag; der **Filter „Neu seit …"** hängt an einem
persönlichen Schlüssel `zuletztGesehen` in `user_settings` und vergleicht zwei
Zeitstempel. **Kein `ALTER TABLE`, kein sechster Migrationsblock, keine neue
Formatnummer** — die Exportdatei bleibt bei 10. **`F_ROUTEN` bleibt bei 47:**
die Ansicht ist lesend, und der Erledigt-Haken geht über
`PUT /api/comments/:id`, die es längst gibt.
Dazu die **Sprachbereinigung** aus Abschnitt 12 samt einem Wächter im
Prüfstand; sichtbar davon ist genau eine Umbenennung, der `Abdruck` in der
Kennzahlenkarte heißt jetzt **Fingerprint**.
**2087 von 2087 Prüfungen**, 17 Gegenproben.

**0.8.50 davor** — Fingerprint **`3cb528d6`**. *Eine
Datenbankstufe, aber keine Stufe des Mehrbenutzerbetriebs:* `photos` trägt
`art TEXT NOT NULL DEFAULT 'bild'` und `dauer INTEGER`, ein Kurzvideo bis
20 MB liegt als BLOB in derselben Tabelle wie die Fotos, das Standbild kommt
aus dem Browser des Hochladenden, ausgeliefert wird `inline` und **in
Ranges** (nur am Video), und Export und Import tragen Videos über einen
eigenen Schalter mit (**Formatnummer 9 → 10**).
**Eine neue schreibende Route: `F_ROUTEN` geht von 46 auf 47** —
`POST /api/items/:id/videos` hinter `nurEintragVerfasser`, dieselbe Klemme wie
am Fotoweg. Die Sicherheitsregel der Anwendung bekommt `media-src 'self'
blob:`; ohne `blob:` ließe sich überhaupt kein Video hochladen.
**1953 von 1953 Prüfungen**, 30 Gegenproben.

**0.8.40 davor** — Fingerprint `49d2ae53`. *Eine
Datenbankstufe, aber keine Stufe des Mehrbenutzerbetriebs:*
`rating_criteria` trägt ein `gewicht REAL NOT NULL DEFAULT 1.0`,
`gesamtSchnitt()` ist ein gewichteter Mittelwert über die **bewerteten**
Kriterien, das Gewicht wird in der Kriterienkarte des Systembereichs
eingestellt, `×1,5` steht an drei Anzeigeorten, und Export und Import tragen
es mit (**Formatnummer 8 → 9**).
**Keine neue schreibende Route: `F_ROUTEN` blieb bei 46, und keine Art
wechselte** — das Gewicht geht über `PUT /api/criteria/:id`, die es längst gibt
und die längst hinter `nurAdmin` steht.
**1807 von 1807 Prüfungen**, 30 Gegenproben.

**0.8.31 davor** — Fingerprint `1a801477`. *Keine Stufe, eine
Berichtigungsrunde:* `attachments` trägt eine `user_id`, hochladen ist offen,
`DELETE /api/attachments/:id` fragt nach der **Datei** statt nach dem
**Eintrag**, der Name steht nach derselben Regel an der Zeile, und Export und
Import tragen ihn mit (**Formatnummer 7 → 8**). **1682 von 1682 Prüfungen**,
16 Gegenproben.

**0.8.30 davor** — Fingerprint `f498cbda`. *Stufe G4 des Umbaus und die
erste Datenbankstufe seit 0.8.3* (Abschnitt 10): `links` trägt eine `user_id`
mit `ON DELETE SET NULL`, `POST /api/items/:id/links` verliert seinen Wächter
und schreibt den Eintrager, `DELETE /api/links/:id` fragt nach der **Zeile**
statt nach dem **Eintrag**, Sortieren bleibt beim Eintragsverfasser und Admin,
die Zeile nennt ihren Verfasser, Export und Import tragen ihn mit
(**Formatnummer 6 → 7**), und die beiden Löschdialoge kennen den fünften
Träger.
**1624 von 1624 Prüfungen** in jenem Stand, 31 Gegenproben.

**Der Fingerprint ist im Container bestätigt worden, nicht nur auf der Platte** —
und dazu die Migration selbst: eine Datenbank mit `links` ohne `user_id`, ein
`docker restart`, und im Protokoll steht die Zeile der Migration; danach gehört
die Linkzeile dem Verfasser ihres Eintrags und nicht dem Eigentümer.
Einzelheiten in `Doku/Aenderungsprotokoll_0.8.30.md`, Abschnitt 7.

**Auch 0.8.10 und 0.8.20 sind eingespielt und bestätigt** — Abdrücke
`48fe44e7` und `3ab38137`, beide stimmen überein.

**`HINTER_PROXY` steht im Betrieb auf der Vorgabe: aus** — und das ist für den
heutigen Betrieb richtig. Kriterion läuft direkt im Heimnetz; die
Anmeldebremse zählt damit die tatsächliche Verbindung, also das Gerät. Der
Kopf `X-Forwarded-For` wird nicht einmal angesehen.

**Sie gehört auf `1`, sobald Kriterion über den Proxy nach außen geht** — dann
sieht der Container an der Verbindung nur noch den Proxy, und die Adresse des
Besuchers kommt allein als Header an; ohne die Einstellung lägen alle
Besucher in einem Zähler. Was daran hängt und was beim Umlegen passiert, steht
in Abschnitt 3 und in der README. **Das Umlegen gehört in denselben Schritt
wie die Freigabe nach außen, nicht davor und nicht danach.**

**0.8.70 hat das Schema wieder angefasst — aber ohne Migrationscode.** Zwei
neue TABELLEN stehen in der vollständigen DDL, und `CREATE TABLE IF NOT EXISTS`
legt eine fehlende Tabelle bei jedem Start an. **Stolperstein 13 gilt der
SPALTE, nicht der Tabelle**, und der Prüfstand belegt beides an einem Lauf:
`papierkorb` von Hand entfernt kommt beim nächsten Start zurück, eine von Hand
entfernte Spalte nicht. **Es bleibt deshalb bei fünf markierten Blöcken.**

**0.8.30, 0.8.31, 0.8.40 UND 0.8.50 haben das Schema angefasst** — die ersten
Versionen seit 0.8.3. `links` und `attachments` bekommen je
`user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`, `rating_criteria`
bekommt `gewicht REAL NOT NULL DEFAULT 1.0`, `photos` bekommt
`art TEXT NOT NULL DEFAULT 'bild'` und `dauer INTEGER`, und dazu gehört je ein
Migrationsblock: `migration0830()`, `migration0831()`, `migration0840()` und
`migration0850()` in
`db.js`, mit den Marken der Bauregel, einmalig, wiederholbar und im Normalfall
stumm. **Es sind damit fünf markierte Blöcke im Projekt**; alle fünf sind für
1.0 vorgemerkt (Abschnitt 10).

**`migration0850()` fragt jede seiner beiden Spalten EINZELN ab.** Zwei
`ALTER TABLE` sind zwei Anweisungen: scheitert die zweite, bleibt die erste
stehen — nachgestellt, und ohne Transaktion ist genau das das Ergebnis. Ein
Block, der beim Vorhandensein von `art` zurückkehrte, ließe `dauer` dann für
immer fehlen. So heilt der nächste Start einen zerrissenen Stand.

**Wer von 0.8.20 kommt, fährt alle vier in einem Start.** Das Protokoll nennt
dann vier Zeilen. Nachgestellt statt geglaubt: der Prüfstand fährt genau
diesen Sprung und belegt, dass sie sich nicht ins Gehege kommen.

**Die Migration auf 0.8.50 verändert keine angezeigte Zeile.** Jedes vorhandene
Foto steht danach auf `art = 'bild'` und `dauer = NULL` — die Vorgabe kommt aus
dem `DEFAULT` der Spalte, nicht aus einem nachgeschobenen `UPDATE`. An der
Auslieferung vorhandener Fotos ändert die Runde nichts: kein Header
verschiebt sich, und Ranges bietet allein ein Video an. Der Prüfstand hält
beides fest.

**Die Migration auf 0.8.40 verändert keine angezeigte Zahl.** Die Bestandszeilen
bekommen ihr Gewicht 1,0 aus dem `DEFAULT` der Spalte, nicht aus einem
nachgeschobenen `UPDATE` — und bei Gewicht 1 überall ist der gewichtete
Mittelwert bitgleich zum ungewichteten. Der Prüfstand belegt das an einer Lage
mit **mehreren Bewertern und ungleich vielen Stimmen je Kriterium**; an einer
Lage mit einer Stimme je Kriterium belegte es zu wenig.

**Die Bestandszeilen fallen an den Verfasser ihres Eintrags, nicht an den
Eigentümer.** Bis 0.8.20 *waren* die Links eines Eintrags die Sache seines
Verfassers; sie ihm zu nehmen und dem Eigentümer zu geben, machte aus seinen
Links stillschweigend fremde. **Das Auffangnetz `ordneBestandZu()` beantwortet
eine andere Frage** — wem eine Zeile zufällt, die *später* herrenlos wird — und
antwortet dort weiterhin mit dem Eigentümer. Zwei Zeitpunkte, zwei Regeln, und
beide stehen im Quelltext nebeneinander erklärt.

**Die beiden Anlegen-Schalter stehen im Betrieb so:** bei den **Kategorien
aus** (nur der Admin legt neue an, das Auswahlfeld am Eintrag bleibt), bei den
**Tags an** (jeder vergibt am Eintrag einen neuen Namen). Das ist eine
Einstellung im Systembereich, keine Version — beides jederzeit umkehrbar.

**Vorausgesetzt wird weiterhin eine Datenbank aus 0.8.0 oder neuer.** Ältere
Bestände werden nicht übernommen; sie bräuchten den Zwischenschritt über 0.8.0
als letzte Version mit Migrationscode.

**Zurückrollen ist ab 0.8.30 keine reine Dateikopie mehr — und ab 0.8.40
erst recht nicht.** Zwischen 0.8.3 und
0.8.20 hat keine Version das Schema angefasst; wer in diesem Bereich
zurückging, brauchte keine Rücksicht darauf zu nehmen. **Eine Datenbank aus
0.8.40 trägt drei Spalten, die 0.8.20 nicht kennt.** Ein Downgrade geht
deshalb nur über die **Sicherung des Datenverzeichnisses**, die vor dem
Einspielen entstanden ist — nicht über das Zurückkopieren der alten Dateien
allein. Die Sicherung steht dafür ausdrücklich im Einspielweg unten.

*Genau genommen ginge das Downgrade auch mit der neuen Datenbank: eine
zusätzliche Spalte stört SQLite nicht, und 0.8.20 schreibt sie einfach nicht
mehr. Verlassen sollte man sich darauf nicht — jede Linkzeile, die danach
entsteht, ist herrenlos, und beim nächsten Vorwärtsschritt fällt sie dem
Eigentümer zu statt dem Eintrager. Bei den Gewichten ist die Lage milder und
trotzdem dieselbe Sorte: eine ältere Version liest die Spalte nicht, rechnet
also wieder ungewichtet — die eingestellten Gewichte stehen still da und
wirken beim nächsten Vorwärtsschritt wieder. Die Sicherung ist der Weg, der
ohne diese Fußnoten auskommt.*

**Der Weg zum Einspielen.** Das Repo ist **privat**, der Server zieht deshalb
nicht selbst — das ZIP kommt über „Download ZIP" von GitHub auf den Wirt. Der
Pfad steht am laufenden Container, kein Suchen, kein Abschreiben:

```bash
cd "$(docker inspect kriterion --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}')"
docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)   # PFLICHT bei Datenbankstufen
mv kriterion kriterion-alt
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion               # GitHub hängt den Branchnamen an
cp -r kriterion-alt/data kriterion/data
cp kriterion-alt/.env kriterion/.env      # OHNE DIESE ZEILE STARTET NICHTS
cd kriterion && docker compose up -d --build
```

**Seit 0.8.70 legt `docker compose` beim ersten Start ein zweites Verzeichnis
an**: `../kriterion-sicherung` neben dem Projektordner. Dorthin schreibt die
Karte „Sicherung". Es gehört **nicht** in dieselbe Ablage wie die `.env` — die
Kopie ist verschlüsselt und ohne den Schlüssel wertlos, und beides
nebeneinander hebt die Verschlüsselung auf.

**Die Sicherungszeile ist seit 0.8.30 keine Empfehlung mehr.** Bei einer
Datenbankstufe ist sie der einzige Weg zurück — siehe oben. Sie gehört
**zwischen** `docker compose down` und alles Weitere: eine Sicherung, die
neben einem laufenden Server entsteht, kann eine offene WAL enthalten.

**Für 0.8.90 gilt sie als PFLICHT.** Die Runde fasst das Schema an — sie ist
eine Datenbankstufe, auch ohne Migrationsblock —, und ein Downgrade ist damit
keine reine Dateikopie mehr.
*Genau genommen stört ein Downgrade auf 0.8.80 wenig: eine zusätzliche Tabelle
sieht eine ältere Version gar nicht an, die Exportdatei behält Format 10, und
`OEFFENTLICHE_ADRESSE` wird von ihr schlicht nicht gelesen. Was verloren geht,
sind die Protokollzeilen — sie bleiben zwar stehen, aber niemand zeigt sie.
Die Sicherung ist der Weg, der ohne diese Fußnoten auskommt.*

**Für 0.8.80 galt sie aus demselben Grund.**
*Genau genommen stört ein Downgrade auf 0.8.71 wenig: eine zusätzliche Tabelle
sieht eine ältere Version gar nicht an, und die Exportdatei behält ihr Format
10. Aber jeder Zugang, der über einen Link angelegt und noch nicht eingelöst
wurde, trägt einen leeren Hash — er kommt nicht herein, und die ältere Version
hat keinen Weg, ihm einen neuen Link zu geben. Für ihn hilft dann nur
`node zugang.js passwort <name>` auf dem Wirt. Die Sicherung ist der Weg, der
ohne diese Fußnoten auskommt.*

**Seit 0.8.70 gibt es die Sicherung auch auf Knopfdruck**, im Systembereich
unter „Sicherung" — der bequemere der beiden Wege. **Während die Kopie
entsteht, steht die Anlage still**; die Karte sagt es vorher mit einer
Schätzung in Sekunden (rund 20 ms je MB). *Bis Revision 18 stand hier das
Gegenteil — ein Fehler dieses Papiers: `VACUUM INTO` läuft synchron auf der
einen Verbindung, und Abschnitt 4, die README und die Karte selbst sagen es
richtig.* **Er ersetzt die Zeile oben aber nicht vollständig:** die
Kopie ist verschlüsselt und **ohne die `.env` wertlos**. Wer sich auf den Knopf
verlässt, sichert die `.env` getrennt — und legt beides ausdrücklich **nicht**
in dieselbe Ablage.

**Für 0.8.70 galt sie aus demselben Grund** — zwei neue Tabellen —, **und in
0.8.60 war das anders**; das gehört gesagt, weil die Zeile seitdem nicht in
jeder Runde dieselbe Bedeutung hatte.

**Der Sicherungsort ist neu im Einspielweg.** `docker-compose.yml` hängt seit
0.8.70 ein zweites Verzeichnis ein — `../kriterion-sicherung:/sicherung` — und
benennt es als `SICHERUNG_DIR`. **Beide Hälften stehen in derselben Datei**,
und das ist kein Geschmack: ein Pfad ohne Einhängung schriebe in eine Schicht
des Containers, die beim nächsten `--build` verschwindet. Der Pfad liegt
**außerhalb** des Projektverzeichnisses, weil das beim Einspielen umbenannt
wird; `../kriterion-sicherung` zeigt vor und nach dem `mv` auf dasselbe
Verzeichnis. Ohne die Einhängung bleibt die Karte „Sicherung" aus und sagt,
warum.

Sieben Dinge, die dabei schiefgehen können, alle schon vorgekommen:

- **Der Ordner aus dem GitHub-ZIP heißt nicht `kriterion`.** GitHub packt den
  Branchnamen an: aus `main` wird `kriterion-main`, und Schrägstriche im
  Branchnamen werden zu Bindestrichen (`claude/g3-…` → `kriterion-claude-g3-…`).
  Ohne das `mv` legt das anschließende `cp -r kriterion-alt/data kriterion/data`
  den Bestand in einen Ordner, den `docker compose` nie ansieht — oder
  scheitert. **Der Branchname steht damit im Einspielweg**: wer von einem
  Arbeitsbranch lädt, passt beide Zeilen an.

- **`--build` vergessen.** `docker compose up -d` startet stillschweigend die
  alte Version weiter — der Quelltext steckt im Image, nicht im eingehängten
  Verzeichnis. `curl -s http://localhost:3100/api/config` nennt die Version, die
  der Server wirklich ausliefert. Stimmt sie und die Oberfläche verhält sich
  trotzdem alt, liegt `app.js` im Zwischenspeicher des Browsers (Strg+Shift+R).
- **Eine unvollständige Kopie sieht aus wie eine vollständige.** Die
  Versionsnummer im Footer kommt aus `/api/config`, also aus `package.json` —
  sie ist keine Aussage über die übrigen Dateien. Wurden `package.json` und
  `server.js` ersetzt, `public/app.js` aber nicht, zeigt der Footer die neue
  Version, während die Oberfläche sich alt verhält; anders als beim
  vergessenen `--build` hilft hier kein `Strg+Shift+R`, weil der Container die
  alte Datei tatsächlich ausliefert. `docker-compose.yml` hängt nur `./data`
  ein — `public/app.js` steckt seit dem Bau **fest im Image** und muss vor
  dem `--build` auf der Platte liegen.

  **Seit 0.8.10 wird das über den Fingerprint geprüft, nicht mehr über eine
  Textstelle je Version.** Angemeldet, in der Karte „Kennzahlen": ein Wert,
  der sich ändert, sobald irgendeine ausgelieferte Datei anders ist —
  `curl -s -b cookies.txt http://localhost:3100/api/stats` nennt ihn als
  `fingerprint`. Der erwartete Wert steht zu jeder Version im Änderungsprotokoll
  (`Doku/Aenderungsprotokoll_<Version>.md`). Stimmt er nicht überein, war die
  Kopie unvollständig oder es wurde nicht neu gebaut — dann hilft nur, den
  vollständigen Dateisatz erneut einzuspielen, nicht einzelne Dateien
  nachzuziehen.
- **`cp .env.example .env` statt der echten `.env`** (Stolperstein 45). Dann
  steht `ENCRYPTION_KEY=` leer da, der Start erzeugt einen **neuen** Schlüssel
  und legt ihn als `data/encryption.key` ab, und die vorhandene Datenbank lässt
  sich damit nicht mehr öffnen. Zerstört wird nichts, aber jetzt liegt eine
  falsche Schlüsseldatei neben den Daten und wird beim nächsten Start gegenüber
  einer nachgetragenen `.env` bevorzugt. Ausweg: `data/encryption.key` löschen
  und die richtige `.env` aus `kriterion-alt` holen.
- **Zweiter Anlauf nach einem Abbruch**, bei dem `cp -r kriterion-alt/data
  kriterion/data` nicht überschreibt, sondern `kriterion/data/data` anlegt. Der
  Bestand wirkt dann leer.
- **Der alte Ordner läuft noch** und belegt Port 3100. Deshalb steht das
  `docker compose down` an erster Stelle.
- **Der Sicherungsort ist nicht eingehängt** (seit 0.8.70 möglich). Wer eine
  alte `docker-compose.yml` weiterbenutzt, bekommt die Karte „Sicherung" mit
  dem Satz „Es ist kein Sicherungsort eingerichtet" — und **nicht** eine, die
  still ins Nichts schreibt. Der Ausweg ist die neue Datei aus dem ZIP; sie
  wird beim Einspielen ohnehin mitkopiert.
- **Die Sicherung wurde bei einer Datenbankstufe übersprungen** (seit 0.8.30
  möglich). Vorher war der Rückweg das Zurückkopieren des alten Dateisatzes;
  seit `links.user_id` reicht das nicht mehr. Wer ohne Sicherung einspielt,
  hat keinen Rückweg — der Bestand geht dabei nicht verloren, aber er lässt
  sich nicht mehr auf die vorige Version zurückbringen.

**Nicht auf Variablen umstellen:** Eine frühere Compose-Datei nutzte
`"${HOST_PORT:-3100}:3000"`. Die Ersetzung wurde auf dem Zielsystem nicht
aufgelöst, der Container startete ohne Portfreigabe. Der Port steht deshalb
unmittelbar da.

---

## 3. Zugang und Verschlüsselung

Mehrbenutzerbetrieb mit Rechteschicht: jede Sitzung weiß, wem sie gehört
(`sessions.user_id`), `requireAuth` legt den Benutzer als `req.benutzer` ab,
und jeder Eintrag, Kommentar, Testtag, **jede Linkzeile** (seit 0.8.30),
**jede Datei** (seit 0.8.31) und jede Bewertung kennt ihren Verfasser. **Jeder schreibende Endpunkt weiß, wer etwas darf:** der **Admin**
(`role = 'admin'`) verwaltet den gemeinsamen Bestand und löscht fremde
Beiträge, der **Eigentümer** (`role = 'eigentuemer'`) besitzt Export, Import,
Schlüsselwert und Rollenvergabe, alles am Eintrag gehört seinem Verfasser.
Was ein Admin ausdrücklich **nicht** darf: einen fremden Kommentartext
ändern, die Note eines fremden Testtags ändern, ein Bild an einen fremden
Kommentar hängen. **Löschen ja, umschreiben nein.** Bei einem einzigen Zugang
ist von alledem nichts zu merken.

**Seit 0.8.30 ist die Linkzeile der fünfte, seit 0.8.31 die Datei der sechste
Träger.** Beide folgen derselben Regel wie Kommentar, Testtag und Bewertung:
**eintragen bzw. hochladen darf jeder, löschen der Eintrager oder der Admin.**
Dahinter steht die Entscheidung aus 0.8.4 — *was an allen Einträgen aller
Benutzer erscheint, gehört dem Admin; was nur dort erscheint, wo man es
hinsetzt, gehört jedem.* Ein Link und eine Datei erscheinen nur dort, wo man
sie hinsetzt.
**Das Sortieren der Links bleibt beim Eintragsverfasser und Admin**, und zwar
ausdrücklich: die Reihenfolge ändert keine Aussage und ist umkehrbar —
dieselbe Überlegung wie beim Anpinnen eines Kommentars. Dateien haben gar
keinen eigenen Sortierweg.

**Fotos sind ausdrücklich KEIN Träger.** Sie hängen am Eintrag und gehören
seinem Verfasser. Der Unterschied ist nicht Bequemlichkeit: ein Foto ist nicht
etwas, das man an einen Eintrag *hängt* — das erste Foto **ist** der Eintrag,
es steht als Hauptbild in der Übersicht. Wer die Reihenfolge ändert, ändert
das Gesicht des Eintrags.

**Der Zugang liegt als scrypt-Hash in der Tabelle `users`**, nicht in der
Umgebung; gesetzt wird er beim ersten Aufruf im Browser, und wer die Anlage
einrichtet, ist ihr Eigentümer. Es gibt keine voreingestellte Kennung.
Mindestens zehn Zeichen, sonst keine Regeln — **auch für ein Passwort, das über
einen Link gesetzt wird**. Ohne Anmeldung ist außer dem
öffentlichen Titel nichts sichtbar — auch die Schnittstellen liefern nichts
aus, Fotos und Export eingeschlossen. Sitzung 30 Tage, Cookie mit
`HttpOnly`/`SameSite=Lax`. Die Anmeldebremse zählt je IP (weich ab fünf
Fehlversuchen, hart **ab dem elften** für fünf Minuten — der Zähler wird
gelesen, bevor er erhöht wird, Stolperstein 124) und zusätzlich je
Benutzername — dort nur verzögernd, nie sperrend. **Seit 0.8.90 greift dieselbe
Bremse auch hinter der Anmeldung**, an der zweiten Bestätigung.

**DER LINK STATT DES GESAGTEN PASSWORTS — seit 0.8.80 (Stufe H).** Ein Zugang
entsteht auf zwei Wegen, und die Karte „Zugänge" bevorzugt den zweiten:
entweder legt der Admin ihn **mit erstem Passwort** an, oder er legt ihn
**ohne** an und gibt einen **Link** aus. Wer den Link öffnet, wählt sein
Passwort selbst. Derselbe Mechanismus trägt die **Rücksetzung** — ein
Mechanismus, zwei Anlässe.

| | |
|---|---|
| Was im Link steht | 32 Zufallsbytes, hexadezimal |
| Was gespeichert wird | **nur der SHA-256 davon**, ohne Salz |
| Haltbarkeit | **sieben Tage** |
| Gültigkeit | **genau einmal** |
| Beim Einlösen | alle Sitzungen dieses Zugangs fallen, **und alle übrigen offenen Links** |
| Beim Sperren und Entfernen | die offenen Links fallen mit |
| Wo der Schlüssel in der Adresse steht | im **Fragment** (`#/einladung/…`) — es geht nie an den Server |
| Spur danach | die Zeile bleibt mit `benutzt_am` stehen und wird dreißig Tage nach Ablauf geräumt |

**SHA-256 ohne Salz ist eine bewusste Abweichung von der scrypt-Linie.** scrypt
ist absichtlich langsam und schützt damit **ratbare** Geheimnisse; ein Token
trägt 256 Bit aus dem Zufallsgenerator, da kauft die Langsamkeit nichts. Mit
Salz je Zeile wäre der Hash außerdem **nicht nachschlagbar** — der Server
müsste bei jedem Versuch jede Zeile durchrechnen, und das auf einer Route, die
**vor** der Anmeldung steht. Ohne Salz ist der Hash ein Schlüssel: die Zeile
wird über den Primärschlüssel **gefunden** statt gesucht. Ein zeitunabhängiger
Vergleich hat dort deshalb nichts mehr zu tun. *Zum Maßstab: `sessions.token`
liegt im Klartext in der Tabelle — den Token zu hashen ist strenger als der
Bestand, nicht lockerer.*

**Der Weitergabeweg ist Teil der Bauform, keine Notlösung:** Mailversand ist
Stufe I. Der Admin **kopiert den Link und gibt ihn weiter**. Damit ist er ein
**Passwortersatz auf Zeit** und steht danach in einem fremden Verlauf — und
genau das sagt die Oberfläche an der Stelle, an der er kopiert wird.

**Die Absage vor der Anmeldung ist EINE**, für abgelaufen, schon benutzt,
erfunden und „Zugang gesperrt": *„Dieser Link gilt nicht mehr. Bitte beim Admin
einen neuen anfordern."* Der Grund ist nicht bloß Verschwiegenheit — **das
Heilmittel ist in jedem dieser Fälle dasselbe.** Was das kostet, gehört dazu:
wer sich vertippt hat, unterscheidet das nicht von „abgelaufen".

**Ein Zugang ohne Passwort trägt den leeren Hash** — dieselbe Sperre wie beim
Grabstein, und es kommt **keine neue Klemme** dazu: `pruefeAnmeldung()` fällt
bei leerem Hash auf den Blindwert zurück, und `pruefePasswort()` weist einen
Wert, der nicht nach scrypt aussieht, schon am Format ab. Zwei voneinander
unabhängige Gründe, beide nachgestellt. **Es gibt keinen vierten Zustand:**
„noch kein Passwort" wird aus `password_hash = ''` abgeleitet — nicht aus
`last_login IS NULL`, denn das beantwortet „hat sich noch nie angemeldet", und
das ist etwas anderes.

**„Meine Sitzungen" — seit 0.8.80, und ehrlich beschriftet.** Jeder sieht beim
eigenen Zugang, wo er überall angemeldet ist: angemeldet am, zuletzt gesehen,
welche davon die eigene ist, und wie viele andere daneben stehen. **Ein Admin
sieht keine fremden** — für den Ernstfall gibt es das Sperren, und das löscht
die Sitzungen bereits mit.
**Was die Karte nicht kann und offen sagt: sie kennt kein Gerät.** Die Anlage
speichert **weder IP-Adresse noch Browserkopf** — das ist eine Eigenschaft und
kein Mangel und passt zu „läuft offline im Heimnetz". Was sie trägt, ist die
**Zahl** und **ein Knopf**: „alle anderen beenden".
**Adressiert wird eine Sitzung über eine Kennung, die gerechnet und nirgends
gespeichert wird** — der volle SHA-256 ihres Tokens. Der Token selbst ist
Primärschlüssel **und** Geheimnis und darf in keiner Adresse stehen; die
Kennung ist sein Bild und lässt sich nicht zurückrechnen. **Kein Schema, keine
Migration, keine Frage nach Eindeutigkeit.**

**EINE EINSTELLUNG, FÜNF WIRKUNGEN — `HINTER_PROXY` (seit 0.8.20).** Sie steht
in der `.env`, nicht in `settings`: sie entscheidet über Netzwerkvertrauen,
nicht über eine Vorliebe, und ein übernommener Admin-Zugang könnte sie sonst
selbst umlegen. Vorgabe ist **aus**, und so steht sie im Betrieb — Kriterion
läuft heute direkt im Heimnetz (Abschnitt 2).

| | fehlt (Vorgabe) | `HINTER_PROXY=1` |
|---|---|---|
| Adresse des Aufrufers | `req.socket.remoteAddress` | **letzter** Eintrag aus `X-Forwarded-For` |
| Cookiename | `kriterion_session` | `__Host-kriterion_session` |
| `Secure` am Cookie | nein | ja |
| `Strict-Transport-Security` | nein | `max-age=31536000` |
| richtig für | direkt im Heimnetz, Port 3100 | Betrieb hinter einem Proxy, HTTPS |

**Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung**
(Abschnitt 5). Ohne die Einstellung wird `X-Forwarded-For` nicht einmal
angesehen; mit ihr zählt der **letzte** Eintrag der Kette und nicht der erste —
ein Proxy hängt die Gegenstelle, die er wirklich sieht, hinten an, alles davor
kann der Aufrufer selbst geschrieben haben. Genau der erste Eintrag war es,
den die Fassung vor 0.8.20 nahm; mit wechselndem Kopf griff die Bremse nie.

**Der Cookiename steht deshalb nirgends mehr als fester String** — wer ihn
braucht, nimmt `auth.COOKIE_NAME`. **Seit 0.8.80 hält ein Wächter über die
ausgelieferten Dateien das fest**, mit Gegenprobe, dass er überhaupt Code liest
und sich nicht am Kommentar daneben färbt. **Und das Umlegen meldet alle einmalig ab:**
das Präfix `__Host-` verlangt den Namen wörtlich, der alte wird nicht mehr
gelesen. Danach geht die Anmeldung nur noch über HTTPS; der `Secure`-Cookie wird
über `http://` verworfen.

**Was die Einstellung nicht ist: eine Liste, wer den Kopf setzen darf.** Sie
ist ein Ja/Nein. Solange der Port des Containers im eigenen Netz erreichbar
ist, kann dort jemand von Hand einen Kopf mitschicken — ein gewöhnlicher
Browser tut das nicht, ein absichtlicher Aufruf schon. Bewusst getragen,
siehe Abschnitt 8.

**Passwort vergessen: seit 0.8.80 gibt es zwei Wege, und sie ersetzen einander
nicht.** In der Karte „Zugänge" erzeugt der Admin einen **Link zum
Zurücksetzen** — der Betroffene wählt sein Passwort selbst, und das bisherige
gilt weiter, bis der Link eingelöst wird. Daneben bleibt der **direkte** Weg:
der Admin setzt ein Passwort und sagt es. *Der Link braucht den Browser des
anderen, der direkte Weg nicht — deshalb sind es zwei Wege und nicht einer mit
zwei Beschriftungen.* Kommt **niemand mehr herein**, gilt unverändert der
dritte Weg über den Wirt:

```bash
docker compose exec kriterion node zugang.js passwort <benutzername>
```

Das neue Passwort wird zweimal abgefragt und sofort gesetzt; alle Sitzungen
dieses Zugangs fallen, Rolle und Bestand bleiben unberührt. Möglich, weil der
Datenbankschlüssel nicht am Passwort hängt. Der Befehl setzt Zugriff auf den
Wirt voraus und ist deshalb kein Umweg um die Anmeldung.
`node zugang.js eigentuemer <benutzername>` ist der Notausgang, wenn sich
kein Eigentümer mehr anmelden kann. **`AUTH_RESET`, `AUTH_USER` und
`AUTH_PASSWORD` werden nicht gelesen**; stehen sie noch in der `.env`, meldet
der Start sie als entfernbar.

**WAS DIE ANLAGE ALS GANZES TRIFFT, WIRD EIN ZWEITES MAL BESTÄTIGT — seit
0.8.90.** Sieben Wege über sechs Routen verlangen das Passwort des
Angemeldeten noch einmal:

| Weg | Route |
|---|---|
| Export | `GET /api/export` |
| Import | `POST /api/import` |
| Rolle vergeben | `PUT /api/users/:id` (nur mit `rolle` im Rumpf) |
| Fremdes Passwort setzen | `PUT /api/users/:id` (nur mit `passwort` im Rumpf) |
| Link erzeugen | `POST /api/users/:id/token` |
| Zugang entfernen | `DELETE /api/users/:id` |

**Wogegen das verteidigt, ist nicht der Fremde**, sondern eine **fremde offene
Sitzung**. Deshalb ist die Bestätigung an **die Sitzung** gebunden und nicht an
den Menschen: eine zweite offene Sitzung desselben Zugangs muss selbst
bestätigen.

**Was ausdrücklich NICHT dahinter liegt, und es ist entschieden, nicht
vergessen:** Sperren und Freigeben (umkehrbar, und ein gesperrter Zugang ist
nicht die Anlage), einen Zugang **anlegen** (er ist neu und nimmt niemandem
etwas — auch mit Einladungslink), der eigene Zugang (dort ist das bisherige
Passwort seit 0.5.0 ohnehin Pflicht) und alles am Eintrag. **`POST /api/setup`
erst recht** — dort gibt es kein bisheriges Passwort.

**DIE FORM: EINE FREIGABE IM ARBEITSSPEICHER, KEIN SCHEMA.**

| | |
|---|---|
| Woher | `POST /api/bestaetigung` mit `{ passwort, zweck, ziel }` |
| Wo sie liegt | im Arbeitsspeicher, neben `attempts` der Anmeldebremse |
| Gebunden an | **Sitzungstoken + Zweck + Ziel** |
| Haltbarkeit | **120 Sekunden** |
| Gültigkeit | **genau einmal** |
| Beim Abmelden | fällt sie mit |
| Absage | *„Das Passwort stimmt nicht."* — **403**, nie 401 |

**Warum nicht im Rumpf der Handlung selbst**, was die schönere Form wäre: an
zwei der sieben Wege geht es nicht auf. `GET /api/export` ist eine
**Browsernavigation** — die Datei läuft damit an der Platte vorbei statt
vollständig im Speicher zu stehen, und ein Rumpf ist dort baulich unmöglich.
Und bei `POST /api/import` steht der Wächter ausdrücklich **vor multer**, damit
die bis zu 900 MB große Datei eines Fremden gar nicht erst eingelesen wird; ein
Passwort im Multipart-Rumpf wäre erst danach lesbar. Der Preis der gewählten
Form ist benannt: es **ist** Zustand, und es gibt eine Frist. Er wiegt weniger
als ein Export im Speicher des Browsers und ein Wächter, der hinter multer
rutscht.

**Die Rechtefrage steht VOR der Bestätigungsfrage.** Wer ohnehin nicht darf,
erfährt das — und wird nicht erst nach seinem Passwort gefragt.

**Die Anmeldebremse greift, dieselbe wie überall**, je Adresse und je Name.
Ohne sie wäre die Bestätigungsroute ein Weg, ein Passwort ungebremst
durchzuprobieren — und zwar **hinter** der Anmeldung, wo niemand hinsieht.
**Die Absage ist hier klar und deutlich, anders als bei den Token aus 0.8.80**,
und der Unterschied gehört benannt: dort wusste der Server nicht, wer fragt,
und die eine verschleierte Absage schützte vor dem Durchprobieren. Hier ist der
Fragende angemeldet und namentlich bekannt — eine verschleierte Absage schützte
niemanden und verwirrte nur.

**DAS SICHERHEITSPROTOKOLL — seit 0.8.90.** Es hält fest, **wer Zugang hatte
und wer die Anlage als Ganzes angefasst hat**. Es ist **kein
Änderungsverlauf**: kein Eintragstitel, kein Kommentartext, keine Bewertung,
keine Note. Dieselbe Trennlinie wie überall.

**Vierzehn Vorgänge:** Anmeldung gelungen, Anmeldung gescheitert, Bestätigung
gescheitert, Zugang angelegt, Rolle vergeben, Zugang gesperrt/freigegeben,
fremdes Passwort gesetzt, Zugang entfernt, eigener Zugang geändert, Link
erzeugt, Link eingelöst, Export, Import, Sicherung.

| | |
|---|---|
| Was in einer Zeile steht | Zeitpunkt, was, wer, an wem, ein kurzes Merkmal |
| Was **nicht** darin steht | Namen, Freitext, IP-Adresse, Browserkopf, Schlüssel |
| Wer es sieht | **der Eigentümer allein** |
| Wie lange | **180 Tage**, geräumt beim Start und beim Öffnen der Karte |
| Weg hinaus | **nur die Frist** — es gibt keine Löschroute |

**Keine Namensspalte, obwohl sie verlockt:** `entferneZugang()` überschreibt
`username`, und eine hier aufbewahrte Kopie wäre die eine Stelle im Projekt,
die den Grabstein rückgängig macht. Gespeichert werden Nummern; ein entfernter
Zugang erscheint wie überall als „Gelöschter Benutzer 7".
**`wer` und `ziel` sind die Feststellung eines Vorgangs**, so wie
`papierkorb.geloescht_von` — daran hängt kein Recht, und beide stehen
ausdrücklich **nicht** in `ordneBestandZu()`. Es sind die achte und die neunte
Spalte dieser Art.
**Ein leeres `wer` heißt „über `zugang.js` auf dem Wirt"** — mit genau einer
Ausnahme, und die ist am Vorgang zu erkennen: bei einer gescheiterten Anmeldung
war niemand angemeldet. Ein eigenes Feld für die Herkunft wäre eine zweite
Wahrheit daneben.

**Die gescheiterte Anmeldung ist die einzige Zeile, die ein Fremder auslösen
kann** — und damit die einzige, mit der sich die Tabelle von außen
vollschreiben ließe. **Ihr Deckel ist die Bremse, die es schon gibt:**
geschrieben wird nur, wenn die Anfrage die Passwortprüfung wirklich erreicht
hat; der gesperrte Fall schreibt nichts. Damit sind es höchstens **zehn Zeilen
je Adresse und Sperrzeit**, und die Obergrenze ist eine Eigenschaft der Anlage
statt einer Regel, die jemand durchsetzen müsste. Der Preis, ehrlich benannt:
verteiltes Raten aus vielen Adressen schreibt weiterhin viele Zeilen — die
Frist trägt es, und die ersten zehn je Adresse sind die Spur, auf die es
ankommt. **Der getippte Name wird nie gespeichert**; `ziel` trägt eine Nummer
nur, wenn der Name einen vorhandenen Zugang traf.

**`zugang.js` bleibt der Notweg ohne Rechtefrage** — Zugriff auf den Wirt *ist*
die Berechtigung. **Aber seine drei schreibenden Befehle stehen im Protokoll**,
sonst hätte ausgerechnet der Weg, den man hinterher nachlesen möchte, als
einziger keine Spur.

**DIE ÖFFENTLICHE ADRESSE — `OEFFENTLICHE_ADRESSE`, seit 0.8.90, optional.**
Den Einladungslink baut weiterhin **der Browser des Admins** aus `location`;
das ist die Vorgabe und braucht keine Einstellung. Es hat eine Bruchstelle: die
Adresse, unter der der Admin zugreift, ist nicht immer die, die der Empfänger
benutzen soll. Ist der Wert gesetzt, gibt der Server den fertigen Link heraus
(`link` und `linkQuelle`), und der Linkkasten sagt in einer Zeile darunter,
**woher** die Adresse kam.
Geprüft wird über `new URL`: Schema (nur `http`/`https`) und Rechnername sind
Pflicht, ein Pfad ist erlaubt, ein abschließender Schrägstrich fällt, und
Zugangsdaten, `?` und `#` werden abgewiesen. **Ein unbrauchbarer Wert bricht
den Start nicht ab**, sondern meldet sich laut und fällt auf den Browserweg
zurück — dieselbe Form wie bei `AUTH_RESET` und beim fehlenden Sicherungsort.
`http://` bei gesetztem `HINTER_PROXY` ist ein Widerspruch und bekommt eine
**Warnung, keine Absage**: ein falscher Link ist ein toter Link, kein Verlust.
**In `GET /api/config` steht sie nicht** — der Endpunkt liegt vor der
Anmeldung. **Sie gehört in die `.env` und nicht in `settings`**, dieselbe Linie
wie `HINTER_PROXY`: sie entscheidet über Netzwerkvertrauen, nicht über eine
Vorliebe. Der Systembereich **zeigt** sie, er setzt sie nicht.

**Beim Entfernen eines Zugangs gehen seine Sitzungen, offenen Links, Favoriten
und persönlichen Einstellungen ausdrücklich mit weg** — sie sagen niemandem
etwas, sobald der Mensch weg ist. Der Bestand selbst bleibt: Löschen
entwertet (Abschnitt 5).

**Die gesamte Datenbankdatei ist verschlüsselt.** Ohne Schlüssel meldet selbst
ein Datenbankwerkzeug „file is not a database" — nichts ist lesbar, auch nicht
Struktur, Kategorienamen, Zeitstempel oder Bildgrößen. Innerhalb der geöffneten
Datenbank steht alles im Klartext, deshalb funktioniert die Suche über alle
Felder.

`ENCRYPTION_KEY` **muss** in der `.env` bleiben — er wird gebraucht, um die
Datei überhaupt zu öffnen, und kann deshalb nicht in die Anwendung wandern.
Fehlt er, wird beim Start einer erzeugt und **neben** der Datenbank abgelegt;
dann schützt die Verschlüsselung nicht gegen jemanden, der das Verzeichnis
kopiert. **Auf dem Betriebssystem ist der Umzug erledigt:** der Wert steht seit
dem 13. August in der `.env`, die Datei liegt nur noch als
`encryption.key.abgeloest` daneben.

**Wann die `.env` gelesen wird — drei verschiedene Zeitpunkte:** `docker build`
nie (sie ist per `.dockerignore` ausgeschlossen). `docker compose up -d` liest
sie beim **Erzeugen** des Containers. Ein `docker restart` oder ein Neustart des
Rechners liest sie nicht mehr. Daraus folgt: die `.env` muss dauerhaft liegen
bleiben, denn **jedes Einspielen einer neuen Version erzeugt den Container neu**.

Eine Kopie des Schlüssels gehört in den Passwortspeicher, und **`.env` und
`data/` nicht in dieselbe Sicherung** — seit 0.8.70 gilt das auch für den
Zielort der Sicherung auf Knopfdruck: ihre Kopie ist verschlüsselt und ohne den
Schlüssel wertlos. Ohne den Schlüssel sind die Daten endgültig
verloren. Wer auf dem Wirt `docker inspect` ausführen darf, sieht den Schlüssel
— kein neues Loch, dieselbe Person könnte auch die `.env` lesen.

**Zwei Titel**, beide im Systembereich gepflegt: Titel 1 steht auf der
Anmeldeseite und ist für jeden sichtbar, der die Adresse aufruft — daher
zurückhaltend wählen. Titel 2 erscheint erst nach der Anmeldung. Der Endpunkt
vor der Anmeldung darf Titel 2 niemals ausliefern.

---

## 4. Funktionsumfang

**Übersicht:** Kartenraster; Zeitleiste der Testtage über den Karten (waagerecht
die Zeit, senkrecht die Tagesnote, folgt den Filtern, unter fünf Testtagen
ausgeblendet); Suche über Titel, Beschreibung, Kategorie, Tags, Linkadressen,
Kommentare und Tags an Testtagen (`/` springt ins Suchfeld); Filter nach Status,
Kategorie und Tags (Tagwolke eine Zeile, aufklappbar, nach Häufigkeit sortiert,
Verknüpfung Und/Oder umschaltbar); Sortierung nach Änderung, Bewertung, Titel
und drei Testkennzahlen; Vergleich mehrerer Einträge; „★ Favoriten" als
eigener, mit jedem Teststatus kombinierbarer Filter. Filter- und Sortierwahl
werden serverseitig gespeichert.
**Daneben „Neu seit …"** (seit 0.8.60) — derselbe Platz, dasselbe Muster: ein
eigener Umschalter, mit allen übrigen Filtern kombinierbar, **persönlich**, mit
der Zahl daneben (*„Neu seit 19.08. · 7"*). Er **filtert und sortiert nicht**.
Der Bezugszeitpunkt ist ein persönlicher Schlüssel und wird beim **Verlassen**
der Übersicht gesetzt; beim allerersten Besuch erscheint der Umschalter nicht,
weil es dann nichts zu vergleichen gibt. **Bei einem einzigen Zugang erscheint
er trotzdem** — anders als „meine / alle" ist er keine Aussage über andere.

**Die Ansicht „Offen"** (seit 0.8.60): ein Knopf in der Kopfzeile neben dem
Zahnrad führt auf einen Bildschirm mit **allen nicht erledigten
Aufgabenkommentaren** über alle Einträge, gruppiert nach Eintrag, mit Verfasser
und Datum an der Zeile. Ein Klick führt in den Eintrag. **Der Erledigt-Haken
lässt sich dort setzen** — und steht nur, wo er gedrückt werden darf: beim
Verfasser des Kommentars und beim Admin, dieselbe Regel wie am Kommentar im
Eintrag. Die abgehakte Zeile **bleibt durchgestrichen stehen**, bis die Ansicht
neu geladen wird. Umschalter „meine / alle" ab zwei Zugängen, Vorgabestellung
„alle". Überschrift und Beschriftungen kommen aus dem **Vokabular**: wer seine
Aufgaben „Mängel" nennt, liest dort „Offene Mängel".

**Wer was geschrieben hat:** Eintrag, Kommentar und Testtag nennen ihren
Verfasser mit Namen, der Eintrag dazu **wann** er angelegt wurde. Ein
entfernter Zugang erscheint als „Gelöschter Benutzer 7", eine Zeile ohne
Verfasser als „Ohne Verfasser". **Bei genau einem aktiven Zugang bleibt davon
alles aus** — abgeleitet aus der Zahl der Zugänge, ohne Schalter.
**Die Bewertung sagt nur den eigenen Wert und den Schnitt** (seit 0.8.6). Wer
welchen Wert vergeben hat, sieht der **Admin in einer eigenen Ansicht**, die er
über „Wer hat bewertet" im Blockkopf ausdrücklich aufruft; dort entfernt er
auch eine fremde Bewertung. Die Note ändert er nicht.

**Jedes Kriterium hat ein Gewicht** (seit 0.8.40), zwischen 0,2 und 2,
eingestellt vom Admin in der Kriterienkarte des Systembereichs. Der
Gesamtschnitt eines Eintrags ist der **gewichtete Mittelwert** über die
bewerteten Kriterien; die Werte je Kriterium bleiben ungewichtet. Weicht ein
Gewicht von 1 ab, steht `×1,5` hinter dem Kriteriennamen — im Bewertungsblock
und an der Zeilenbeschriftung im Vergleich —, und am Blockkopf steht das Wort
„gewichtet". Alles davon ist **abgeleitet**, kein Schalter: bei Gewicht 1
steht nichts da, und die Anzeige sieht aus wie vor 0.8.40.

**Wer angemeldet ist, steht in der Kopfzeile** (seit 0.8.6), neben „Abmelden" —
und zwar **auch bei einem einzigen Zugang**: das ist eine Aussage über einen
selbst, nicht über andere.

**Eintrag:** mehrere Fotos **und Kurzvideos** mit Vollbild, Zoom (nur am Foto)
und einstellbarem Bildausschnitt
für die quadratische Vorschau, angehängte Dateien mit Vorschau, Beschreibung,
Kategorie, Tags, Bewertungskriterien, Testtage, Links, Kommentare, zwei
unabhängige Merkmale (getestet, abgelehnt), Favorit. Beschreibung und
Kommentarfelder wachsen mit dem Text. Tagwolke über drei Zeilen, Klick vergibt
und nimmt zurück. Testtage können eigene Tags tragen. Die Blöcke lassen sich per
Griff anordnen und per Klick auf die Kopfzeile einklappen — innerhalb ihres
Bereichs, nicht darüber hinaus.

**Kurzvideos stehen in derselben Reihe wie die Fotos** (seit 0.8.50), bis
20 MB, als MP4, WebM oder MOV. Erkannt wird nach dem **Inhalt**, nicht nach der
Endung. In der Vorschauleiste trägt ein Video ein ▶ und, wenn die Dauer bekannt
ist, seine Länge als `0:42`; auf der Karte steht sein Standbild wie ein Foto,
mit einem Abspielzeichen darauf. Im Eintrag und im Vollbild wird mit der
Steuerung des Browsers abgespielt, und darin lässt sich springen — die
Auslieferung beantwortet Ranges. **Nichts spielt von selbst los**, und beim
Blättern wie beim Verlassen wird angehalten. **Kein Zoom am Video:** der zweite
Klick gehört der Abspielsteuerung. Der Ausschnittmodus bleibt bedienbar und
zeigt dort das Standbild. Alles davon ist **abgeleitet** aus `art` und `dauer`
der Antwort, kein Schalter.

**Systembereich: sechzehn Karten, und sie hängen an der Rolle** (seit 0.8.5;
die breite Kachel „Zugänge" lässt seit 0.8.6 keine Lücke mehr im Raster).
Dem **Admin**: beide Titel, Kennzahlen, Kategorien und Tags umbenennen und
löschen, Bewertungskriterien umbenennen, löschen, per Ziehen sortieren und
**gewichten**,
Karte „Zugänge" (anlegen **mit Passwort oder mit Link**, sperren, Passwort
zurücksetzen **direkt oder über einen Link**, Rolle wechseln, entfernen),
Karte „Suchanbieter" (Vorrat, Startanbieter, drei eigene),
Vokabular aus elf Wörtern. Dem **Eigentümer** zusätzlich: Export mit/ohne
Fotos, mit eigenem Häkchen für Dateien und eines für **Videos**, Import
(ersetzen oder zusammenführen) und seit 0.8.70 die Karte **„Sicherung"**.
**Die Karte „Papierkorb" (seit 0.8.70) steht dem Admin** — aber als Liste, an
der nur der Eigentümer die beiden Knöpfe sieht; dieselbe Bauform wie bei
„Kategorien", „Tags" und „Bewertungskriterien".
**„Video" ist kein zwölfter Vokabeleintrag** und wird keiner — die elf bleiben
elf. Es ist ein Wort über den Gegenstand, so wie „Foto" auch.
**Jedem, auch ohne Rolle:** „Zugang" (eigener Name und Passwort),
**„Meine Sitzungen"** (seit 0.8.80 — wo dieser Zugang überall angemeldet ist,
mit „alle anderen beenden"; **kein Systembereich für Admins**, sie zeigt nur
die eigenen), „Darstellung" (Schriftgröße in fünf Stufen, Zeitleiste,
Blockanordnung) und „Links" (sichtbare Zeilen, Zahl der angezeigten
Anbieternamen). Die Karten
„Kategorien", „Tags" und „Bewertungskriterien" stehen ebenfalls für jeden —
aber als **Liste ohne Bedienzeichen**: wer nicht verwalten darf, darf
trotzdem nachsehen. **Das Gewicht steht dort als Text statt als Eingabefeld**
(seit 0.8.40) — es erklärt die Kopfzahl an jedem Eintrag, und die sieht er ja
auch.

**Dateien am Eintrag:** Hochladen darf **jeder** (seit 0.8.31), löschen der
Hochladende oder der Admin; ab zwei Zugängen trägt eine **fremde** Datei den
Namen ihres Hochladenden in Klammern hinter der Größe. Die Auslieferungsregeln
aus Abschnitt 5a sind davon unberührt.

**Links und Suchzeilen:** Eintragen darf **jeder** (seit 0.8.30), löschen der
Eintrager oder der Admin; das ✕ steht nur dort, wo es auch gedrückt werden
darf. Ab zwei Zugängen trägt eine **fremde** Zeile — also eine, die nicht vom
Verfasser des Eintrags stammt — den Namen ihres Eintragers **in Klammern**
direkt hinter Pfad bzw. Anbieternamen: `(chefin)`. Der Überfahrtext nennt ihn
samt Datum.
Was wie eine Adresse aussieht, wird eine — mit
`https://` davor, wenn keins dasteht. Alles andere bleibt Rohtext und führt beim
Klick zum Startanbieter. Erkennbar an der Lupe rechts statt des Pfeils und an
den Anbieternamen unter dem Text. Sechs eingebaute und bis zu drei eigene
Anbieter; der Admin nimmt sie per Häkchen in die Auswahl und bestimmt mit
„Start" das Ziel des Zeilenklicks — seit 0.8.5 in der eigenen Karte
„Suchanbieter". Unter der Zeile stehen ein bis vier Namen,
der Startanbieter zuerst; jeder Name ist ein eigenes Klickziel.

**Vokabular:** Sache (Einzahl/Mehrzahl), Merkmal (erfüllt/nicht erfüllt),
Zeitpunkt (Einzahl/Mehrzahl), Bericht (Einzahl/Mehrzahl) und Aufgabe
(Einzahl/Mehrzahl/erledigt) — Vorgaben Eintrag/Einträge, Getestet/Ungetestet,
Testtag/Testtage, Bericht/Berichte. Betrifft rund 45 Textstellen in der
Oberfläche und eine Meldung im Server. Unter der Haube ändert sich nichts.

**Kommentare:** zwei unabhängige Merkmale je Kommentar — Art (Notiz, Bericht,
Aufgabe oder erledigte Aufgabe) und Anpinnung, frei kombinierbar. Die Art ist
**ein Wert**, nicht mehrere Merkmale. Bis zu sechs Bilder je Kommentar, per
Knopf oder Strg+V. Adressen im Text sind anklickbar: nur ausdrücklich
geschriebene `http://`, `https://` und `www.`, angezeigt vollständig wie
geschrieben, in Orange und unterstrichen. Der Bearbeitenmodus zeigt weiterhin
den Rohtext.

**Löschdialoge nennen Zahlen.** Am Zugang wie am Eintrag, und getrennt nach
eigen und fremd: einen Eintrag zu löschen nimmt über die Kaskade fremde
Kommentare, Bewertungen und Testtage mit, und das darf nicht wortlos geschehen.
„Fremd" meint dabei, was dem **Löschenden** fremd ist.
**Seit 0.8.70 sagt der Dialog am Eintrag nicht mehr „unwiderruflich"** — das
wäre falsch. Die Zahlen bleiben wortgleich, der Schlusssatz nennt stattdessen
den Papierkorb, die dreißig Tage und **wer zurückholen darf**: nicht der, der
hier klickt.

**Der Papierkorb** (seit 0.8.70): beim Löschen eines Eintrags wird er im
vorhandenen Austauschformat serialisiert und **in derselben Transaktion** als
eine Zeile abgelegt; danach läuft die Kaskade wie bisher. Die Karte im
Systembereich nennt Titel, Datum, Löschenden, die verbleibenden Tage und die
Größe. **Wiederherstellen legt einen NEUEN Eintrag an** — die alte Nummer ist
weg, und daran hängt nichts mehr —, ordnet die Verfasser über ihre **Namen**
wieder zu (ein Grabstein wird gefunden) und nennt, was dabei an den
Wiederherstellenden gefallen ist. Nach dreißig Tagen fällt eine Zeile heraus;
aufgeräumt wird beim **Start** und beim **Öffnen der Karte**. **Zwei Löschwege
füllen ihn ausdrücklich nicht:** „Zugang entfernen" mit dem Häkchen *Einträge
mitnehmen* und der ersetzende Import.

**Die Sicherung auf Knopfdruck** (seit 0.8.70): eine Karte beim Eigentümer,
neben Export und Import. `VACUUM INTO` erzeugt eine **vollständige,
verschlüsselte** Kopie der Datenbank — samt Sitzungen und Einstellungen, ohne
den Schlüssel unlesbar. Die Karte nennt **vorher**, wie lange es dauert und
dass die Anlage währenddessen stillsteht, dazu „letzte Sicherung vor N Tagen"
(aus dem **Dateisystem**, nicht aus einem Merker) und den Hinweis auf den
Schlüssel. **Die Rollenteilung steht an beiden Karten:** `VACUUM INTO` ist der
**Sicherungsweg**, der JSON-Export der **Austauschweg** — der überlebt einen
Formatwechsel und braucht keinen Schlüssel, die Kopie ist dafür vollständig und
konstant im Speicherbedarf.

**Das Sicherheitsprotokoll** (seit 0.8.90): eine **breite** Karte beim
Eigentümer, unter „Zugänge". Sie zeigt die hundert jüngsten von insgesamt N
Vorgängen, je Zeile Zeitpunkt, Vorgang, Handelnder, Ziel und Merkmal, die
jüngste oben. Was sie **nicht** zeigt, steht in ihr selbst: keine Inhalte,
keine Adresse, keine Browserkennung. Die Zeilen bleiben **180 Tage** stehen,
und die Frist ist der einzige Weg hinaus. Sie wird **beim Aufbau des
Systembereichs** geholt, wie jede andere Karte auch (Stolperstein 118).
Einzelheiten in Abschnitt 3.

**Die zweite Bestätigung** (seit 0.8.90): kein eigener Ort, sondern ein Fenster
vor sieben Wegen — nach dem Muster von `confirmBox()`, mit einem Passwortfeld
und dem Satz daneben, **warum** gefragt wird. Ein Passwortfeld ohne Begründung
sieht aus wie eine Schikane. Welche Wege, steht in Abschnitt 3.

**Einen einzelnen Eintrag als Datei** (seit 0.8.70): `GET /api/items/:id/export`
liefert dieselbe Form wie der volle Export, nur mit einem Eintrag — Formatnummer
unverändert **10**, und alles geht mit. Wo die Datei die Stringgrenze sprengen
würde, steht eine Absage mit Begründung statt eines Abrisses.

**Dateien:** bis 50 MB je Stück, höchstens 20 je Eintrag, in der verschlüsselten
Datenbank. Vorschau für Bilder, PDF, Text/Markdown/CSV/Log und `.docx`; alles
andere wird heruntergeladen. Die Absicherung steht in Abschnitt 5a.

**Bilder:** Originale bleiben unverändert — was hereinkommt, muss aber seit
0.8.20 ein Rasterbild **sein**, nicht bloß so heißen (Abschnitt 5a).
Zusätzlich Kachel (400 px, ~17 KB) und mittlere Variante (1600 px, ~140 KB). Übersicht nutzt die Kachel, Detail und
Vollbild die mittlere, erst der Zoom lädt das Original. Aufschlag rund 7 %,
Ersparnis beim Blättern etwa Faktor 100. Fotos ohne Varianten werden nach dem
Start im Hintergrund nachgerüstet — **Videozeilen ausdrücklich nicht**: dort
stünde in `data` die Videodatei, das Nachrüsten liefe darauf in einen Fehler
und überschriebe ein vorhandenes Standbild.

**Videos:** unverändert gespeichert, bis 20 MB je Stück; dazu die beiden
Varianten ihres Standbilds. Umkodiert wird nichts, weder beim Hochladen noch
beim Ausliefern.

---

## 5. Entscheidungen, die nicht rückgängig gemacht werden sollen

Diese Punkte wirken beim Lesen des Codes womöglich seltsam. Sie sind Absicht:

- **Die zweite Bestätigung ist an die SITZUNG gebunden, nicht an den Menschen**
  (seit 0.8.90). Verteidigt wird gegen eine **fremde offene Sitzung** — nicht
  gegen einen Fremden, der kommt ohne Passwort gar nicht herein. Eine zweite
  offene Sitzung desselben Zugangs muss deshalb selbst bestätigen, und mit dem
  Abmelden fällt die Freigabe. *Wer die Bindung je an den Benutzer hängt, hat
  genau die Lage wieder offen, gegen die die Runde gebaut wurde.*
- **Die Rechtefrage steht vor der Bestätigungsfrage** (seit 0.8.90). Wer
  ohnehin nicht darf, erfährt das — und wird nicht erst nach seinem Passwort
  gefragt. Gebaut ist das an den drei Verwaltungsrouten, wo `zielZugangFrei`
  läuft, **bevor** die Bestätigung geprüft wird. *Die umgekehrte Reihenfolge
  wäre ein Weg, an einer fremden Rolle zu prüfen, ob ein Passwort stimmt.*
- **Die Bestätigung reist NICHT im Rumpf der Handlung** (seit 0.8.90). Die
  schönere Form scheitert an zwei der sieben Wege: `GET /api/export` ist eine
  Browsernavigation (kein Rumpf möglich, und in die Adresse gehört ein Passwort
  nie), und der Wächter vor `POST /api/import` steht ausdrücklich **vor
  multer**. Die Freigabe kann beides, weil sie **vor** der Handlung steht und
  nicht in ihr. *Wer einen achten Weg ergänzt, nimmt dieselbe Form — nicht eine
  zweite daneben.*
- **Das Sicherheitsprotokoll führt keine Namen** (seit 0.8.90). Gespeichert
  werden Nummern; aufgelöst wird beim Anzeigen über denselben Weg wie überall.
  Eine Namensspalte wäre die eine Stelle im Projekt, die den Grabstein
  rückgängig macht — „die Beiträge bleiben stehen, aber ohne den Namen" gilt
  auch hier. **Und kein Freitext von außen:** `merkmal` trägt ausschließlich
  Werte aus einer geschlossenen Liste im Quelltext, sonst landete früher oder
  später ein ins falsche Feld getipptes Passwort in der Tabelle.
- **Ein leeres `wer` im Protokoll heißt „über `zugang.js` auf dem Wirt"**
  (seit 0.8.90) — mit genau einer Ausnahme, und die ist am Vorgang zu erkennen:
  bei einer gescheiterten Anmeldung war niemand angemeldet. Ein eigenes Feld
  für die Herkunft wäre eine zweite Wahrheit daneben.
- **Die Obergrenze des Protokolls ist die Anmeldebremse, keine eigene Regel**
  (seit 0.8.90). Die gescheiterte Anmeldung ist die einzige Zeile, die ein
  Fremder auslösen kann; geschrieben wird nur, wenn die Anfrage die
  Passwortprüfung wirklich erreicht hat. *Ein Deckel, den es nicht gibt, kann
  nicht vergessen werden* — dieselbe Bauform wie beim gewichteten Mittel.

- **Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung**
  (seit 0.8.20). Er darf nur geglaubt werden, wo ausdrücklich eingestellt ist,
  wer ihn setzen darf. Gilt für `X-Forwarded-For` — dort gebaut als
  `HINTER_PROXY`, Abschnitt 3 — und unverändert für den `Host`-Kopf: **die
  öffentliche Adresse ist eine Einstellung, niemals der `Host`-Kopf**, sonst
  ließe sich ein Rücksetzlink über einen gefälschten Kopf auf einen fremden
  Server umbiegen. Wer künftig einen weiteren Kopf auswertet, stellt zuerst
  diese Frage.
- **Der ausgelieferte Typ kommt nie aus der Datenbank** (seit 0.8.20). Er
  kommt aus der Endung (`anhaenge.js`, `ausgabeTyp`) oder aus den ersten Bytes
  (`typAusBytes`) — nie aus einer Spalte, die der Hochladende gefüllt hat.
  `photos.mime_type` und `attachments.mime_type` bleiben stehen und werden
  angezeigt; sie sind eine Anzeige, keine Ausliefergrundlage. **Dagegen hilft
  kein Merksatz, sondern ein Wächter im Prüfstand:** keine Zeile in
  `server.js` setzt den Content-Type selbst. Wer eine Auslieferung ergänzt,
  wird namentlich rot. **Er hat in 0.8.50 gehalten:** der Videoweg liefert
  `inline` aus und geht trotzdem durch `setzeBildHeader()`; keine Zeile
  in `server.js` ist dazugekommen, die den Typ selbst setzt. Seit 0.8.50 hat
  der Wächter eine Gegenprobe neben sich, die ihn an einer verletzenden
  String vorführt — sonst bliebe er auch dann grün, wenn er gar nichts
  mehr ansähe.
- **Testtage und Kriterienbewertung sind getrennt.** Die Kriterien sind eine
  Analyse, die Testtage ein Verlauf. Nicht zu einem Durchschnitt verrechnen und
  nicht in denselben Block stecken.
- **Testkennzahlen sind `null`, nicht `0`**, wenn keine Testtage vorhanden sind.
  Solche Einträge stehen bei allen Testsortierungen immer am Ende — sie haben
  keinen niedrigen Wert, sondern gar keinen.
- **Ein Testtag hat keine Null.** Er fand statt und hat eine Note, oder er wird
  gelöscht. Der Doppelklick-Rücksetzer der Kriterien gilt dort nicht.
- **„Getestet" ist gesperrt**, solange Testtage vorhanden sind — serverseitig
  durchgesetzt, mit sprechender Begründung. Ein Schalter, der wortlos nichts
  tut, wirkt wie ein Fehler.
- **Erstes Foto ist das Hauptbild.** Kein separater Schalter; Reihenfolge per
  Ziehen, mit Maus und Finger (Pointer-Events, nicht HTML5-Drag). **Seit
  0.8.50 heißt „Foto" hier „erstes Element"** — steht ein Video vorn, ist sein
  Standbild das Hauptbild. Die Regel selbst ändert sich nicht.
- **Fotos und Videos stehen in EINER Tabelle** (seit 0.8.50). Zwei Tabellen
  hießen zwei sortierte Listen und damit **zwei Quellen** für die Frage, was
  an erster Stelle steht — die zweite Wahrheit in Reinform. Aus der einen
  Tabelle folgt, dass jede vorhandene Regel von selbst greift: Rechte,
  Kaskade, Reihenfolge, Fokuspunkt, Verschlüsselung, Sicherung. **Nichts davon
  darf je eine Ausnahme bekommen.** Was NICHT von selbst greift, ist genau
  dreierlei und ist gebaut: Löschdialog, Kennzahlen und die Auslieferung.
- **`ffmpeg` kommt nicht ins Image** (seit 0.8.50), und keine andere neue
  Abhängigkeit. Das Standbild eines Videos erzeugt der **Browser des
  Hochladenden** über `<video>` und `<canvas>`. Daraus folgt: **der Server
  öffnet nie ein Video** — er liest zwölf Bytes für die Typerkennung,
  speichert den Rest und liefert ihn wieder aus; die gesamte Klasse von
  Verwundbarkeiten in Videobibliotheken entfällt, weil keine im Spiel ist.
  Und: **wer ein Video nicht abspielen kann, kann es nicht hochladen.** Das
  ist richtig — ein Videoplatz, der nicht abspielt, ist ein kaputter Platz.
  Wer ein Format ablegen will, das der Browser nicht kann, nimmt den Anhang.
- **Das Standbild belegt nichts** (seit 0.8.50). Ein manipulierter Browser
  könnte eines schicken, das nicht zum Video gehört. Das ist hinnehmbar — es
  ist eine Vorschau, keine Aussage —, und es steht hier wie im Quelltext,
  damit es niemand später für einen Beleg hält.
- **Videos werden in Ranges ausgeliefert, Fotos nicht** (seit 0.8.50).
  Der Grund ist nicht die Größe, sondern die Bedienung: ohne Ranges kann der
  Browser im Video nicht springen, und manche Abspieler beginnen gar nicht
  erst. Der Range kommt vom Aufrufer und wird geprüft; Ungültiges wird mit
  **416** beantwortet, nicht stillschweigend zurechtgebogen. **An der
  Auslieferung eines Fotos ändert sich dadurch keine einzige Header** —
  das ist Absicht und wird geprüft.
- **Keine Favicons bei den Links.** Sie würden von fremden Servern nachgeladen
  und brächen das Offline-Prinzip. Stattdessen Domain als Text.
- **Links: nur Adresse, keine Bezeichnung, keine Gruppen.** Bewusst verworfen.
- **Ein Link gehört dem, der ihn einträgt** (seit 0.8.30), **und eine Datei
  dem, der sie hochlädt** (seit 0.8.31) — nicht dem
  Verfasser des Eintrags. Er erscheint nur dort, wo man ihn hinsetzt, und
  fällt damit auf die Seite von Kommentar, Testtag und Bewertung. **Sortieren
  bleibt trotzdem beim Eintragsverfasser:** es ändert keine Aussage und ist
  umkehrbar. Wer das eine für eine Nachlässigkeit hält, hat das andere nicht
  gelesen — die Trennung ist die Entscheidung.
- **Der Name an einer Zeile steht nur, wo er eine Auskunft ist**
  (seit 0.8.30 am Link, seit 0.8.31 an der Datei). Zwei Bedingungen, und beide
  gehören zusammen: mehrere
  Zugänge **und** eine Zeile, die nicht vom Verfasser des Eintrags stammt. An
  seinen eigenen Zeilen wiederholte der Name nur, was oben am Eintrag ohnehin
  steht. **Daraus folgt ein Satz, den man kennen muss:** „kein Name" heißt bei
  mehreren Zugängen „vom Verfasser des Eintrags". Die Regel steht in
  `drawLinks()` bzw. `drawAtts()`; die Schwelle in `mehrereBenutzer()`.
- **Ein Name an einer Zeile steht in Klammern, ohne Trennzeichen davor**
  (seit 0.8.30). Die Klammer sagt von selbst, dass dort eine **Angabe über**
  die Zeile steht und kein weiterer Teil von ihr — ein Trennzeichen davor liest
  sich wie ein abgerissener Satz, und in der Suchzeile bedeutet „ · " ohnehin
  schon „noch ein Anbieter, anklickbar".
  **Und sie trägt jede Form, die `verfasserName()` liefert:** `(chefin)`,
  `(Gelöschter Benutzer 4)`, `(Ohne Verfasser)`. Ein Vorwort wie „von" täte das
  nicht — „von Ohne Verfasser" ist kein Deutsch, und zwei Formen für dieselbe
  Sache wären eine Fallunterscheidung, die niemand pflegen will.
  **Der Name steht direkt hinter dem Inhalt, nicht am rechten Rand.** Was sich
  die volle Breite nimmt, schiebt ihn ans andere Ende der Zeile, wo er zu
  nichts mehr gehört; im Stylesheet heißt das `flex: 0 1 auto` am Inhalt und
  `flex: 0 0 auto` am Namen.
  **Und er steht bei den Angaben ZUR Zeile, nicht bei ihrem Gegenstand**
  (0.8.31): an der Dateizeile also hinter der Größe und nicht hinter dem
  Dateinamen. Der Dateiname ist die Hauptsache der Zeile und darf nicht
  schrumpfen, um einer Nebenangabe Platz zu machen.
- **Ein Bedienzeichen folgt dem Recht, nicht der Anzeige** (seit 0.8.30, am ✕
  der Linkzeile). Beides ist getrennt: ein Kreuz ohne Namen ist möglich (die
  eigene Zeile bei einem Zugang), ein Name ohne Kreuz auch (eine fremde Zeile,
  wenn man nicht Admin ist). Wer eines aus dem anderen ableitet, baut eine
  zweite Wahrheit über dieselbe Frage.
- **Zwei Regeln für zwei Zeitpunkte sind keine zweite Wahrheit** (seit
  0.8.30). `migration0830()` gibt die Bestandslinks dem **Eintragsverfasser**,
  `ordneBestandZu()` gibt später herrenlos gewordene Zeilen dem
  **Eigentümer**. Das ist kein Widerspruch, sondern eine Antwort auf zwei
  verschiedene Fragen — aber es liest sich als einer, wenn es nicht dasteht.
  **Beide stehen deshalb im Quelltext nebeneinander erklärt**, nicht jede für
  sich.
- **Eine Suchzeile speichert den Rohtext, nie eine fertige Suchadresse**
  (seit 0.5.3). Sonst stünde ein Suchanbieter für immer in den Daten, und ein
  Anbieterwechsel wirkte nur auf neue Zeilen. So gilt er rückwirkend für alle.
- **Adresse oder Suchtext wird am fehlenden Schema erkannt**, nicht an einer
  eigenen Spalte. Der Server setzt `https://` vor alles, was wie eine Adresse
  aussieht — was ohne dasteht, ist Suchtext. Damit braucht es keine Migration:
  jede vor 0.5.3 gespeicherte Zeile trägt bereits ein Schema und bleibt
  Adresse. **Keine Liste echter Endungen**: sie wäre pflegebedürftig und
  trotzdem lückenhaft. Der Preis ist ein seltener Fehlgriff wie `v2.beta`, das
  als Adresse durchgeht — die Zeile zeigt sofort, wofür sie sich entschieden
  hat, und lässt sich löschen und neu eintippen. IP-Nummern und
  `rechnername:port` gelten ausdrücklich als Adresse; das hier ist ein
  Heimnetzwerkzeug.
- **Die Suchvorlage darf nur `http://` und `https://` sein und muss `%s`
  enthalten** — geprüft im Server beim Speichern **und** in der Oberfläche vor
  dem Öffnen. Sie ist Eingabe aus dem Systembereich, die in einem
  `window.open` landet; eine Schicht allein wäre hier zu wenig. `http://` ist
  zugelassen, weil ein Suchdienst im eigenen Netz oft keins hat.
  *Seit 0.5.11 gilt das für bis zu drei eigene Vorlagen zugleich.* Fällt eine
  in der Oberfläche durch, **wird dieser Anbieter weggelassen** und nicht
  still durch einen anderen ersetzt: eine Zeile, die „Modellforum" anschreibt
  und Google öffnet, wäre schlimmer als eine Zeile, die nichts tut. Überlebt
  keiner, meldet der Klick das.
- **`sucheAktiv[0]` ist die einzige Wahrheit darüber, wer Startanbieter ist**
  (seit 0.5.11). Die alte Einstellung `suche` wird zwar weiter mitgeschrieben,
  aber **nie wieder gelesen** — sie ist eine Projektion in eine Richtung, damit
  ein Downgrade auf 0.5.10 noch beim richtigen Anbieter sucht. Zwei Orte, die
  beide sagen dürften, wer Standard ist, wären genau die Bauform der
  Stolpersteine 47 und 48.
- **Der Schlüssel eines eigenen Anbieters hängt am Platz, nicht am Namen**
  (`eigen1` bis `eigen3`). Sonst verlöre ein Umbenennen den Vorrat und den
  Startanbieter.
- **Ein eigener Anbieter zählt nur mit Name *und* Vorlage.** Halb ausgefüllt
  gibt es ihn nicht — weder im Vorrat noch in der Auswahl. Der Schreibweg sagt
  das mit einer Meldung, der Leseweg lässt den Platz gar nicht erst gelten;
  siehe Stolperstein 51 zu der Doppelung.
- **Den letzten Anbieter aus der Auswahl zu nehmen, wird abgesagt** statt
  ersatzweise auf Google zu wechseln. Ein leerer Vorrat macht jede Suchzeile
  unbenutzbar; ein wortloser Wechsel wäre aber schlimmer als eine Absage, weil
  ab dann alle Suchen woanders landeten.
- **Vorrat und Startanbieter gehören dem Admin, die Zahl der Namen dem
  Benutzer.** Das Ziel des Zeilenklicks ist damit für alle gleich — bei einem
  gemeinsamen Bestand richtig: wer im Forum sucht, sucht dort, unabhängig
  davon, wer klickt.
- **Der Startanbieter steht immer vorn — und sieht aus wie alle anderen.**
  Die Angabe, wohin die Zeile selbst führt, stammt aus 0.5.3 und darf durch
  die Alternativen nicht verlorengehen; deshalb die erste Stelle. Eine
  zusätzliche Hervorhebung wurde in 0.5.11 verworfen: jeder Name bedeutet
  genau dasselbe, nämlich „ein Klick hierauf sucht dort".
- **Höchstens vier Namen unter einer Suchzeile, Name höchstens 20 Zeichen.**
  Eine Handy-Entscheidung: die Zeile selbst ist das Hauptziel, kleine Ziele
  daneben sind ab vier zu dicht.
- **Kein Vorspann vor den Anbieternamen** (seit 0.5.11). Bis 0.5.10 stand dort
  „Suche · Google"; bei mehreren Namen bedeutete der erste Trenner etwas
  anderes als der zweite. Die Lupe rechts sagt ohnehin, dass es eine Suche ist,
  und der Überfahrtext nennt sie ausdrücklich.
- **„Abgelehnt" wird optisch zurückgenommen** (entsättigt, abgedunkelt) statt
  über Rot — Rot und Orange liegen auf Dunkel zu dicht beieinander. Nicht
  abgelehnte Einträge zeigen gar nichts.
- **Gold ist Bewertung und Anheftung, Orange ist Art und Bedienung.** Sonst
  verschwimmt die Bewertung mit der Signalfarbe. *Klarstellung:* Der frühere
  Wortlaut hieß „Sterne in Gold, Bedienelemente in Orange" und war schon damals
  ungenau — der Anheftungspunkt an den Übersichtskarten (`.card-pin`) und der
  Pin-Knopf (`.pin-btn.on`) sind seit jeher gold. Die Anheftung hatte die Farbe
  also längst, es stand nur nirgends. Version 0.5.5 hat sie an den Kommentaren
  nachgezogen (gedämpftes Gold, `--gold-line`).
- **Rot bleibt dem Zerstören vorbehalten** — Löschkreuz, Löschknopf,
  „Abgelehnt"-Marke, `on-red`-Schalter. Es taugt deshalb nicht als
  Hervorhebung: eine rot markierte Zeile liest sich als beanstandet, nicht als
  wichtig. Dazu liegen Rot und Orange auf Dunkel ohnehin zu dicht beieinander
  (siehe die Begründung bei „Abgelehnt").
- **Skala fest 1–5.** Wählbare Skalen würden die Vergleichsansicht verfälschen,
  die je Kriterium den besten Wert hervorhebt. **Die Gewichtung von 0.8.40
  berührt das nicht:** ein Gewicht ändert keinen einzigen Kriterienwert, nur
  die eine Zahl darunter. Die Hervorhebung vergleicht Werte, die alle in
  derselben Zeile und damit unter demselben Gewicht stehen.
- **Jedes Kriterium hat ein Gewicht, und es gehört dem Admin** (seit 0.8.40).
  Zwischen **0,2 und 2**, immer positiv, Vorgabe 1. Es ist **keine
  persönliche Einstellung** und steht ausdrücklich nicht in `user_settings`:
  hätten zwei Leute verschiedene Gewichte, hätte derselbe Eintrag zwei
  verschiedene Gesamtschnitte — eine zweite Wahrheit in Reinform. Es gilt
  dieselbe Regel wie seit 0.8.4: was an **allen** Einträgen **aller** Benutzer
  erscheint, stellt der Admin ein.
  **Und es steht in der Datenbank, nicht in einer Datei.** Das Gewicht gehört
  dem Kriterium, also ist es eine **Spalte an `rating_criteria`** und nicht
  einmal ein Schlüssel in `settings`. Eine Konfigurationsdatei stünde außerhalb
  der Verschlüsselung, außerhalb der Sicherung und außerhalb des Exports;
  `.env` trägt nur, was **vor** dem Öffnen der Datenbank lesbar sein muss.
- **„Nie über 5, nie unter 1" ist baulich wahr, nicht geklemmt** (seit
  0.8.40). Ein **gewichteter Mittelwert** liegt bei positiven Gewichten immer
  zwischen dem kleinsten und dem größten gemittelten Wert — eine
  Konvexkombination. Da jeder Kriterienwert in [1, 5] liegt, liegt der
  Gesamtschnitt zwangsläufig ebenfalls dort. Es gibt keinen Deckel, der
  vergessen werden könnte, weil es keinen Deckel gibt; dieselbe Bauform wie
  die Rollenleiter aus 0.8.0.
  *Eine gewichtete **Summe** hätte einen Deckel gebraucht — drei Kriterien mit
  5 bei Gewicht 2 ergäben 30 —, und ein Deckel bei 5 ebnete jede
  Unterscheidung im oberen Bereich ein. Der Rechenweg ist die Entscheidung,
  nicht die Absicherung danach.*
- **Der Nenner summiert nur die Gewichte der BEWERTETEN Kriterien** (seit
  0.8.40). Das ist die eine Stelle, an der ein naheliegender Griff die ganze
  Zusicherung bricht: ein Nenner über *alle* Kriterien — etwa eine Summe über
  die ganze Tabelle, was sauber aussieht — drückt einen Eintrag unter 1. Drei
  Kriterien, bewertet nur eines mit 3 bei Gewicht 0,2, die beiden anderen
  unbewertet bei Gewicht 2: richtig sind **3,0**, falsch wären **0,1**.
  **Die Antwort darauf ist baulich, nicht sorgfältig:** das Gewicht reist an
  der Schnittzeile mit (`qSchnittJeKriterium` holt es per JOIN), statt separat
  nachgeschlagen zu werden. Zähler und Nenner entstehen in **derselben**
  Schleife aus **derselben** Menge; eine zweite Quelle gibt es dort gar nicht.
- **Die Gültigkeit steht an genau einer Stelle, und nicht im Schema** (seit
  0.8.40). `GEWICHT_MIN`, `GEWICHT_MAX` und `gueltigesGewicht()` stehen einmal
  in `server.js`; zwei Schreibwege führen darauf (Verwaltung und Import), die
  Oberfläche kennt die Spanne nicht. **Ein `CHECK` an der Spalte wäre eine
  dritte Stelle** — und er meldete sich nicht als Absage mit Meldung, sondern
  als abgebrochene Schreibung. *Anders als das Gewichtungspapier annimmt,
  ließe SQLite ihn sich per `ALTER TABLE` durchaus nachrüsten; das ist
  nachgestellt worden (Stolperstein 107). Der Grund ist ein anderer.*
- **Abgewiesen wird, was etwas anderes bedeutet — gerundet wird, was dasselbe
  bedeutet** (seit 0.8.40). Außerhalb von 0,2 bis 2 kommt eine Absage mit
  Meldung: wer 5 eintippt, meint 5, und den Wert still auf 2 zu ziehen hieße,
  eine andere Aussage zu speichern als die eingegebene. Feiner als ein
  Hundertstel wird gerundet, denn 1,234 und 1,23 sind dieselbe Aussage — und
  die Rundung ist **nicht still**: das Feld zeigt danach den gespeicherten
  Wert. Das ist bewusst **nicht** dieselbe Haltung wie beim Bewertungswert,
  der mit `Math.max(0, Math.min(5, …))` zurechtgebogen wird; der kommt aus
  einem Sterne-Widget, das gar nichts anderes senden kann. Ein Gewicht wird
  von Hand getippt.
  **Ein leeres Feld ist keine Null.** `Number('')` ergibt 0; wer den Inhalt
  löscht und wegklickt, meint aber nicht „Gewicht 0" — dann wird der alte Wert
  wieder eingesetzt und gar keine Anfrage geschickt.
- **Komma herein, Komma hinaus** (seit 0.8.40). Gelesen wird `1,2` und `1.2` —
  ein eingefügter Wert aus einer Tabelle soll nicht scheitern —, geschrieben
  wird immer mit Komma und **ohne nachlaufende Nullen**: „1,50" sähe nach
  einer Genauigkeit aus, die es nicht gibt, und „1,0" nach einer Einstellung,
  wo in Wahrheit die Vorgabe steht. Auch die Meldung des Servers trägt ein
  Komma; „zwischen 0.2 und 2" wäre ein Punkt mitten in einem deutschen Satz.
- **Das Feld ist `type="text"` mit `inputmode="decimal"`, nicht
  `type="number"`** (seit 0.8.40). Drei Gründe, und sie stehen als Kommentar
  im Quelltext, damit es niemand später „aufräumt": `type="number"` nimmt das
  Komma nur an, wenn die Browsersprache es vorsieht; bei einer Eingabe, die er
  für ungültig hält, liefert `input.value` einen **leeren String** statt dem,
  was sichtbar dasteht — man kann dann nicht einmal melden, was falsch war;
  und `inputmode="decimal"` bringt die Zahlentastatur auf dem Handy, ohne
  einen dieser Nachteile.
- **`sort_order` und `gewicht` bleiben getrennt.** Naheliegend wäre, das
  Gewicht aus der Reihenfolge abzuleiten — eine Wahrheit statt zweier. Das
  wäre trotzdem falsch: `renumberCriteria()` nummeriert lückenlos durch, ein
  neu eingeschobenes Kriterium verschöbe damit **still sämtliche Gewichte**,
  und zwei gleich wichtige Kriterien in fester Anzeigereihenfolge wären
  unmöglich. Die Reihenfolge ist eine Aussage über die Anzeige, das Gewicht
  eine über die Rechnung. Zwei Aussagen, zwei Spalten.
- **Das Gewicht wird angezeigt, und das ist kein Beiwerk** (seit 0.8.40). Der
  Rundungspreis weiter unten sagt, dass man beim Nachmitteln der angezeigten
  Zehntel um bis zu 0,05 danebenliegen kann. **Mit Gewichten ist der
  Zusammenhang zwischen Zeilenwerten und Kopfzahl grundsätzlich nicht mehr
  durch Mitteln nachvollziehbar** — ohne die Anzeige sähe die Kopfzahl schlicht
  falsch aus. `×1,5` steht deshalb an drei Orten, **nur bei Abweichung von 1**,
  und ist überall **abgeleitet**: dieselbe Bauform wie die
  Durchschnittsspalte, die bei einem einzigen Zugang entfällt.
  **Das Wort „gewichtet" am Blockkopf leitet sich aus den BEWERTETEN
  Kriterien ab**, nicht aus allen. Ein Kriterium mit Gewicht 1,5, das an
  diesem Eintrag niemand bewertet hat, geht in die Rechnung gar nicht ein; das
  Wort stünde sonst an einer Zahl, an der keine Gewichtung stattgefunden hat.
  Die Marke an der Zeile bleibt davon unberührt — sie ist eine Aussage über
  das Kriterium, nicht über die Zahl.
- **Es sind und bleiben genau zwei Rechenstellen** (seit 0.8.40). Der Server
  rechnet den Schnitt über alle, der Klient den für die Stellung „meine" im
  Vergleich — und **beide sind gewichtet**. Bliebe die zweite ungewichtet,
  zeigte der Umschalter zwei Zahlen nach zwei verschiedenen Formeln, und
  niemand könnte sagen, ob ein Unterschied von der anderen Bewertermenge kommt
  oder von der fehlenden Gewichtung. Wer eine **dritte** Rechenstelle anlegt —
  etwa in der Kachel der Übersicht —, bricht die Regel; die Kachel liest
  `avgRating` vom Server, und dabei bleibt es.
- **Kein Eintrag im Vokabular für „Gewicht".** Es ist ein Wort über die
  Rechnung, nicht über den Gegenstand. Die elf Wörter bleiben elf.
- **Kriterienreihenfolge wird gepflegt, nicht abgeleitet.** Keine alphabetische
  Sortierung, keine Sortierung nach Häufigkeit — die Reihenfolge ist eine
  Aussage darüber, was zuerst zählt, und steht als `sort_order` in der
  Datenbank. Detailansicht und Vergleich lesen dieselbe Sortierung; im Vergleich
  fällt das oberste Kriterium zuerst ins Auge.
- **Gelöscht werden Kriterien nur im Systembereich** (seit 0.5.8). Ein
  Kriterium zu löschen wirkt auf **alle** Einträge und nimmt vergebene Sterne
  mit. Diese globale Folge lag bis dahin eine Zeigerbreite neben dem
  Sterne-Widget, im Blick auf einen einzelnen Eintrag — örtlich falsch, auch
  mit Rückfrage davor. Im Systembereich steht der Verwendungszähler daneben,
  also die Information, die man für die Entscheidung braucht. Dieselbe
  Begründung wie beim Sortieren, das aus demselben Grund schon dort liegt.
  ~~**Angelegt** werden Kriterien weiterhin am Eintrag: das ist folgenlos für
  bestehende Daten, und dort entsteht der Bedarf.~~ **Widerrufen in 0.7.0**,
  siehe den eigenen Punkt weiter unten.
- **Sortiert wird nur im Systembereich**, nicht im Bewertungsblock des Eintrags.
  Dort liegt in derselben Zeile das Sterne-Widget mit Klick *und* Doppelklick;
  eine Ziehschwelle daneben führt zu genau der Art Kollision, die unter
  Stolperstein 5 schon einmal weh getan hat. ~~Angelegt werden Kriterien
  weiterhin am Eintrag — dort entsteht der Bedarf.~~ **Widerrufen in 0.7.0.**
- **Kriterien werden im Systembereich angelegt, und nur von dem Admin**
  (seit 0.7.0). Das widerruft die beiden durchgestrichenen Halbsätze darüber,
  und zwar mit voller Absicht: die Begründung „folgenlos für bestehende Daten"
  war im Einbenutzerbetrieb richtig und kippt mit dem zweiten Bewerter. Ein
  neues Kriterium erscheint **sofort an jedem Eintrag auf jedem Bildschirm** —
  rechnerisch passiert zwar nichts (nur Werte > 0 zählen), aber die
  Kriterienliste ist laut demselben Abschnitt „eine Aussage darüber, was zuerst
  zählt". Das ist eine redaktionelle Entscheidung, keine Notiz am Eintrag.
  Das schärfere Argument ist die Schieflage: darf jeder anlegen, kann jeder
  Unordnung erzeugen, die nur einer aufräumen kann — und das Aufräumen ist der
  zerstörerische Vorgang, der Sterne mitnimmt. Zwei Leute tippen unabhängig
  „Haptik" und „Griffgefühl"; das Zusammenlegen kostet Bewertungen.
  **Anlegen und Aufräumen gehören an dieselbe Stelle.** Gewonnen wird ein
  Bewertungsblock, in dem nur noch bewertet wird. Der Preis ist ehrlich: „dort
  entsteht der Bedarf" stimmt weiterhin. *Verworfen: ein Antragswesen* — wer
  ein Kriterium braucht, sagt es dem Admin.
  **Alle vier Wege liegen hinter derselben Klemme** (`nurVerwalter`): anlegen,
  umbenennen, sortieren, löschen. Ein Wächter für vier Routen, nicht vier
  Abfragen — Stufe F erweitert genau diesen, statt die Regel ein zweites Mal
  hinzuschreiben.
- **Der Verwendungszähler zählt nur vergebene Sterne** (Wert > 0). Ein
  zurückgesetztes Kriterium hinterlässt eine Zeile mit Wert 0; die als
  Verwendung zu zählen, würde die Zahl bedeutungslos machen.
  **Und er zählt Einträge, nicht Bewertungszeilen** (berichtigt in 0.7.0).
  Bis dahin stand dort `COUNT(*)` über `ratings` — bei einem Benutzer ist Zeile
  gleich Eintrag, ab dem zweiten nicht mehr: ein Kriterium, das drei Leute an
  **einem** Eintrag bewertet haben, meldete „3 Einträge". Die Zahl steht in der
  Verwaltungskarte unmittelbar neben dem Löschknopf, also genau dort, wo sie
  die Entscheidung tragen soll. Richtig ist `COUNT(DISTINCT r.item_id)`.
  Gefunden beim Lesen des Codes vor dem Bauen, nicht durch eine Prüfung —
  dieselbe Sorte Fund wie Stolperstein 65.
- **Mitwachsende Felder haben keinen Ziehgriff** (`resize: none`). Beides
  zusammen widerspricht sich: die Handkorrektur hielte nur bis zum nächsten
  Zeichen. Ohne Obergrenze — das Feld zeigt immer den ganzen Text.
- **Kein Geschlechtsfeld beim Vokabular.** Stattdessen sind alle Texte so
  geschrieben, dass weder Beiwort noch Fall vorkommt. Die Regel, an die sich
  jeder neue Text halten muss:
  *sicher* ist Plural im Nominativ und Akkusativ („die Einträge", „die
  Objekte" — „die" passt zu jedem Geschlecht) und Einzahl ohne Begleiter
  („Eintrag löschen", „+ Maschine");
  *unsicher* ist Dativ Plural, der ein -n anhängt („bei allen Objekten"), und
  jede Einzahl mit Artikel oder Beiwort („ein neuer Eintrag").
  Die Oberfläche wird dadurch knapper und etwas amtlicher — das ist der
  bewusst gezahlte Preis.
- **Das Vokabular ändert nur Beschriftungen.** Feldnamen in Datenbank und
  Export bleiben, sonst wären alte Exportdateien nicht mehr einspielbar und ein
  Export aus einem umbenannten Katalog passte in keinen anderen. Aus demselben
  Grund steht das Vokabular in den Einstellungen und nicht in der Exportdatei.
  *Ausgesetzt bis zum Ende des Mehrbenutzerumbaus (beschlossen vor 0.6.3):* Der
  Anspruch, dass alte Sicherungen einspielbar bleiben, gilt während der Stufen
  A bis I **nicht**. Das Exportformat bekommt in Stufe E den Verfasser und
  ändert sich dabei ohnehin; erst danach wird die Einspielbarkeit wieder
  zugesichert. *Nachtrag 0.7.1: die Änderung ist erfolgt und hat die Zusicherung
  nicht gebraucht.* Das Format hat nur Felder **dazubekommen**, keines
  umgedeutet und keines entfernt; eine Datei aus 4.x läuft unverändert durch,
  und eine Datei aus 0.7.1 läuft auch in 0.7.0, das `author` schlicht nicht
  liest. Die Aussetzung bleibt trotzdem stehen — sie gilt bis Stufe I, und
  Stufe G fasst den Export erneut an. Der Feldname `favorite` ist in 0.6.3 trotzdem geblieben — er
  bedeutet jetzt „die Anheftung dessen, der exportiert hat", und ihn ohne Not
  zu wechseln hätte nichts gekauft.
- **Schriftgröße hängt an genau einem Wert**, dem Grundmaß am Wurzelelement.
  Alle Schriftgrößen im Stylesheet sind `rem`, alle Layoutmaße bleiben in
  Pixeln. Zwei Ausnahmen, weil sie ausschließlich Text fassen: die
  Mindestbreite der Filterbeschriftungen und die Nummernspalte der Links.
- **Die Anmeldeseite bleibt bei der Vorgabegröße.** Der Endpunkt vor der
  Anmeldung liefert nur den öffentlichen Titel; dafür eine Einstellung
  auszuliefern, wäre es nicht wert.
- **Blöcke wandern nur innerhalb ihres Bereichs.** Kommentare in der schmalen
  Spalte oder eine Kategorieauswahl über die volle Breite wären schlechter als
  jede Vorgabe. Deshalb zwei getrennte Listen, kein gemeinsamer Topf.
- **Anordnung und Einklappzustand gelten global**, nicht je Eintrag. Wer die
  Reihenfolge einmal für sich richtig gestellt hat, will sie überall.
- **Tags werden mit UND verknüpft, nicht mit ODER.** Bei zwei Tags will man
  fast immer den Schnitt („grün und schwer"); ODER ist der Sonderfall. Der
  Umschalter neben der Beschriftung macht die Verknüpfung sichtbar — ohne ihn
  wäre ein leeres Ergebnis nach dem zweiten Klick rätselhaft. Er ist gedämpft,
  solange er nichts bewirkt, bleibt aber auffindbar. Die Wahl liegt in den
  Filtern und damit auf dem Server.
  *Bis Version 4.4 war ODER fest verdrahtet — von Anfang an, ohne dass es je
  eine Entscheidung dafür gegeben hätte.*
- **Aussichtslose Tags werden gedämpft, nicht gesperrt.** Im UND-Modus sieht
  man vorher, welcher Klick die Liste leert. Anklickbar bleiben sie trotzdem —
  eine gesperrte Marke erklärt nichts, eine gedämpfte lädt zum Ausprobieren ein.
  **Gewählte Tags sind davon ausgenommen**, sonst wären sie bei einer Auswahl
  ohne Treffer gleichzeitig hervorgehoben und gedämpft.
- **Der Filter greift nur Tags am Eintrag ab.** Tags, die ausschließlich an
  Testtagen hängen, erscheinen gar nicht erst in der Filterwolke — sie lieferten
  dort null Treffer. Die Suche findet sie trotzdem, und die Tagverwaltung zählt
  beide Verwendungen getrennt.
- **Die Zeitleiste trägt die Note als Höhe.** Ein flaches Band hätte Punkte
  desselben Tages übereinandergelegt; so trennen sie sich von selbst und der
  Verlauf der Bewertungen wird nebenbei sichtbar. Punkte in Gold, weil sie
  Bewertungen sind.
- **Der Aufklappzustand der Tagwolken bleibt im Speicher**, nicht auf dem
  Server: er sagt nichts über den Bestand aus und soll beim nächsten Aufruf
  wieder auf der knappen Vorgabe stehen.
- **Der Fokuspunkt schneidet nichts weg.** Zwei Prozentwerte verschieben nur
  das sichtbare Fenster der quadratischen Vorschau (`object-position`); die
  Datei und ihre Ableitungen bleiben unangetastet. Ein einmal weggeschnittener
  Bildrand wäre unwiederbringlich, ein Prozentwert ist jederzeit korrigierbar.
- **Zeilen tun das Naheliegende, wenn man sie anklickt.** Links öffnen, Dateien
  ansehen oder herunterladen — je nach Typ. Ein kleiner Knopf, den man treffen
  muss, ist bei einer ganzen anklickbaren Zeile daneben immer der schlechtere
  Weg. Ausgenommen bleiben nur ✕ und Ladepfeil, sonst löste ein Klick zwei
  Dinge zugleich aus.
- **Anpinnen schlägt die Art.** Ein angepinnter Kommentar steht ganz oben,
  gleich welcher Art. Die beiden Merkmale sind unabhängig und frei
  kombinierbar, aber für die Reihenfolge gibt es einen klaren Vorrang. Der
  Block der Angepinnten bleibt dabei **einer**: dort entscheidet allein das
  Alter, nicht die Art.
- **Innerhalb jeder Gruppe steht das Älteste oben** (seit 0.5.2). Die Gruppen —
  Angepinntes, Aufgaben (seit 0.5.7), Berichte, Notizen samt erledigten
  Aufgaben — zerreißen die
  Chronologie, gelesen wird
  innerhalb jeder aber von alt nach neu. Bis 0.5.1 liefen Angepinnte und
  Berichte umgekehrt, damit das jüngste Fazit oben stand; zwei Blöcke mit
  gegenläufiger Zeitrichtung lasen sich schlechter als der Gewinn wert war. Wer
  sein aktuelles Fazit oben haben will, pinnt es an — das Mittel dafür gibt es
  schon. Sortiert wird nach `id`, nicht nach `created_at`: innerhalb eines
  Eintrags stimmen beide immer überein, weil auch der Import stets einen neuen
  Eintrag anlegt und dessen Kommentare in Dateireihenfolge schreibt. Der Wert
  in `created_at` kommt dagegen ungeprüft aus der Datei und hat nur
  Sekundenauflösung.
- **Ein Bericht ist an keinen Testtag gebunden.** Er fasst meist mehrere
  zusammen, jede Zuordnung wäre willkürlich.
- **Ein Merkmal umzuschalten ist keine Bearbeitung.** Es setzt deshalb kein
  „bearbeitet" — sonst stünde das an jedem angepinnten Kommentar, ohne dass
  jemand am Text war.
- **Ein Kommentar braucht Text, auch wenn er Bilder hat.** Ein Beitrag, der nur
  aus einem Bild besteht, ist im Verlauf nicht wiederzufinden.
- **Kommentarbilder liegen in einer eigenen Tabelle**, nicht in `attachments`
  mit einer Zusatzspalte. Ein Anhang gehört dem Eintrag, ein Kommentarbild dem
  Kommentar und geht mit ihm. Zwei Tabellen sind ehrlicher als eine mit
  Sonderfällen, die überall herausgefiltert werden müssten.
- **Vom Kommentarbild wird kein Original aufbewahrt.** Gespeichert wird die
  verkleinerte Variante samt Kachel. Der Zoom aufs Original wäre dort kein
  Gewinn, und es hält die Datenbank klein. Bei Fotos am Eintrag bleibt es
  selbstverständlich beim Original.
- **Auf dem Finger wird erst nach Halten gezogen** (0,4 s), mit der Maus
  sofort. Sortieren und Scrollen teilen sich denselben Zeiger; ohne die
  Haltezeit ist jede Wischbewegung ein Umsortieren. **Kein `touch-action:
  none`** auf sortierbaren Listen — genau das hat vorher das Scrollen
  unmöglich gemacht.
- **Zeilenaktionen sind überall Zeichen**, nicht mal Text und mal Zeichen.
  `✎` bearbeiten, `✕` löschen. Auf schmalen Bildschirmen passt Text nicht in
  die Kopfzeile, und Uneinheitlichkeit sieht ohnehin schlechter aus.
- **Kommentartext kommt nie über `innerHTML` in die Seite** (seit 0.5.4).
  `.cmt-body` bleibt im Vorlagentext leer und wird mit echten Knoten gefüllt:
  `createTextNode()` für Text, `createElement('a')` mit `textContent` und
  `href` für Links. Damit ist Maskierung nicht „nicht vergessen worden",
  sondern baulich unmöglich. Die Zerlegung arbeitet auf dem **Rohtext**, nicht
  auf maskiertem — sonst zerrisse ein `&amp;` jede Abfragezeichenfolge.
- **Als Link im Kommentartext gilt nur ausdrücklich Geschriebenes**: `http://`,
  `https://` und `www.` ohne Schema. Ein blankes `beispiel.de` ausdrücklich
  **nicht** — anders als in der Linkliste, wo ein Wort zur Suche wird.
  Deutscher Fließtext ist voll von „z.B." und „usw."; jede Endungsregel
  produziert dort Fehltreffer. Bei `www.` trägt das `href` ein vorangestelltes
  `https://`, sichtbar bleibt der Text wie geschrieben. Angezeigt wird die
  Adresse **vollständig** — kein Kürzen auf die Domain wie in der Linkliste.
  Nachlaufende Satzzeichen gehören nicht dazu; eine schließende runde oder
  eckige Klammer bleibt nur, wenn die Adresse eine unpaarige öffnende enthält.
  Geschweifte Klammern bleiben ausdrücklich draußen — sie kommen in Notizen
  praktisch nicht als Einklammerung vor.
- **Kein Schalter für die Kommentarlinks im Systembereich.** War überlegt und
  verworfen: anklickbare Links sind keine Geschmacksfrage. Damit bleibt es bei
  einer reinen Oberflächenänderung.
- **`katalog.sqlite` behält seinen Namen.** Der Dateiname der Datenbank ist
  kein Projektname und wandert bei keiner Umbenennung mit. Ein anderer Name
  hieße: der Start hält den Bestand für eine Neuinstallation und legt eine
  **leere** Datenbank an — neben der vollen Datei, die niemand mehr anfasst.
- **Der Cookiename trägt den Projektnamen** (`kriterion_session` seit 0.5.10).
  Ihn zu wechseln macht alle Sitzungen ungültig — einmal neu anmelden, keine
  Datenfolge. Das ist bei einer Umbenennung der billigste Zeitpunkt dafür:
  Stufe A des Mehrbenutzerbetriebs fasst die Sitzungstabelle ohnehin an und
  kann die dann leere Tabelle sauber neu vergeben, statt bestehende Zeilen ohne
  `user_id` nachziehen zu müssen. Sonst meldete man sich zweimal neu an.
- **Eine Sitzung ohne Benutzer gilt nicht** (seit 0.6.0). `sitzungsBenutzer()`
  fragt über einen JOIN von `sessions` auf `users`; wo kein Benutzer hängt, gibt
  es keine Anmeldung. Im Betrieb kann das nicht vorkommen — beim Anlegen ist die
  Id Pflicht, bestehende Sitzungen wurden beim Migration nachgezogen, und mit dem
  Benutzer gehen seine Sitzungen über die Kaskade mit. Eine herrenlose Zeile
  wäre ein Schlüssel zu niemandem und darf deshalb nicht der Duldung anheimfallen.
- **Eigentümer wird, wer schon Rechte hat — aber nur, solange es keinen gibt**
  (seit 0.8.0, ersetzt die Adminregel aus 0.6.0). Die Regel lautet: *gibt es
  keinen Eigentümer, wird es der älteste Zugang, der schon Rechte hat; und erst
  wenn es auch keinen Admin gibt, der mit der kleinsten Nummer.* Sie **ersetzt**
  die alte Formulierung, sie steht nicht daneben — zwei Regeln schrieben sich
  gegenseitig um, und die alte machte aus einem `role='eigentuemer'` beim
  nächsten Start wieder einen bloßen Admin.
  **Der Zwischenschritt über den Admin ist keine Zierde.** Ohne ihn beförderte
  der nächste Start den Zugang mit der kleinsten Nummer auch dann, wenn er
  ausdrücklich herabgestuft worden ist und längst ein anderer verwaltet — genau
  die stille Rücknahme einer bewussten Entscheidung, gegen die schon die alte
  Regel gebaut war. Beim Bauen war das zuerst falsch und ist an der Prüfung
  „Ein herabgestufter Erster wird nicht wieder befördert" aufgefallen.
  **`status != 'geloescht'` ebenso wenig:** die kleinste Nummer kann seit 0.8.0
  ein Grabstein sein, und ein Grabstein darf die Anlage nicht erben — er meldet
  sich nie wieder an.
  *Seit 0.8.1 bekommt der erste Zugang die Rolle direkt beim Anlegen
  (`legeErstenBenutzerAn()` setzt fest `eigentuemer`); die Startregel bleibt
  als Auffangnetz für von Hand veränderte Bestände.*
  *Der ursprüngliche Wortlaut, zur Einordnung:* **Admin wird, wer der Erste ist —
  aber nur, solange es keinen gibt**
  (seit 0.6.0). Die Regel lautet nicht „der Erste ist immer Admin", sondern
  „gibt es keinen Admin, wird es der Eigentümer". Sie läuft bei jedem Start,
  ändert im Normalfall nichts und fängt zwei Fälle mit einer Formulierung: die
  frisch nachgetragene Spalte, in der alles auf `user` steht, und den
  Einbenutzerbetrieb, in dem der Einzige immer beides ist. Die Klemme
  `NOT EXISTS (… role = 'admin')` ist der eigentliche Inhalt: ohne sie machte
  jeder Start eine spätere bewusste Herabstufung still rückgängig — genau die
  Bauform der Stolpersteine 47 und 48.
- **Die Anmeldung liefert den Benutzer, nicht ein Ja/Nein** (seit 0.6.0).
  `pruefeAnmeldung()` gibt die Zeile zurück, und die Sitzung entsteht mit
  genau dieser Id. Hinterher über „der erste Benutzer" zu erraten, wer sich
  angemeldet hat, wäre heute richtig und ab Stufe G falsch.
  **Die Strenge der Namensprüfung bleibt unangetastet:** gesucht wird der
  Kandidat über die Spalte (die `COLLATE NOCASE` trägt), entschieden wird
  danach weiterhin mit `safeEqual` Zeichen für Zeichen. Der Blindwert gegen
  Zeitmessung gilt unverändert.
- **`last_login` wird beim Anlegen der Sitzung geschrieben, nicht an den
  Aufrufstellen** (seit 0.6.0). Eine Sitzung entsteht in dieser Anwendung
  ausschließlich durch eine Anmeldung — Anmeldeseite oder Ersteinrichtung.
  Eine Stelle statt zwei kann nicht auseinanderlaufen (Stolperstein 51).
- **Ein Fremdschlüssel auf `users` gibt den Bestand frei, statt ihn
  mitzunehmen** (seit 0.6.1). `items.user_id`, `comments.user_id` und
  `test_days.user_id` stehen auf `ON DELETE SET NULL`, seit 0.6.2 auch
  `ratings.user_id`. Die beiden Alternativen
  sind beide falsch: `CASCADE` ließe einen gelöschten Benutzer den halben
  Bestand mitnehmen, und gar keine Angabe (`NO ACTION`) ließe ein
  `DELETE FROM users` von Hand an einer Fremdschlüsselverletzung scheitern,
  sobald ein einziger Eintrag am Benutzer hängt. `SET NULL` hält „der Bestand bleibt" aus Abschnitt 3
  wörtlich ein. Siehe Stolperstein 54.
- **Wer einen Testtag einträgt, dem gehört die Zeile** (seit 0.6.1). ~~Ändern und
  Löschen bleiben ab Stufe F dem Verfasser und dem Admin vorbehalten.~~
  **Widerrufen in 0.7.2, und zwar zur Hälfte:** *Löschen* darf der Admin,
  *Ändern* nicht. Die Note **ist** die Aussage dieser Zeile, genau wie eine
  Bewertung — und für die galt schon immer „fremde Bewertung ändern: niemand"
  (Konzept Teil IV: löschen ja, umschreiben nein). Der Halbsatz oben hätte den
  Admin an eine fremde Beobachtung gelassen; das war beim Schreiben nicht
  bedacht und ist beim Durchgehen der Rechtetabelle aufgefallen. **Dieselbe
  Regel gilt für die Tags am Testtag**: sie hängen am Testtag, teilen dessen
  Eigentümer und lassen sich von niemand anderem ergänzen oder wegnehmen.
  *In 0.6.1 hatte die Regel noch einen zweiten Halbsatz — „auch dann, wenn er
  einen vorhandenen Tag ersetzt" —, weil das `UNIQUE` damals auf
  `(item_id, day)` stand und ein zweiter Benutzer die fremde Zeile überschrieb.
  Seit 0.6.2 gibt es diesen Fall nicht mehr, siehe den nächsten Punkt.*
- **Zwei Leute am selben Datum sind kein Konflikt, sondern zwei Testtage**
  (seit 0.6.2). Das `UNIQUE` steht auf `(item_id, day, user_id)`; ersetzt wird
  nur, was einem selbst gehört. Dasselbe für die Bewertung: jeder hat seine
  eigene Zeile je Kriterium, `UNIQUE(item_id, criterion_id, user_id)`.
  **Zurücksetzen meint deshalb ab jetzt ausschließlich die eigenen Werte** —
  ohne die zweite Bedingung im `DELETE` räumte der Knopf im Blockkopf die
  Bewertungen aller anderen wortlos mit weg. Die Beschriftung („Meine Bewertung
  zurücksetzen") kommt mit der Anzeige in Stufe E.
- **Das Merkmal am Eintrag heißt Favorit, das am Kommentar Anheftung**
  (seit 0.6.6). Bis dahin hieß beides „Anheftung", obwohl es zwei verschiedene
  Dinge sind. Datenbank und Schnittstelle sagten mit `favorite` ohnehin schon
  „Favorit" — die Umbenennung hat also eine bestehende Uneinheitlichkeit
  weggeräumt, keine neue geschaffen. **Der Tabellenname `item_pins` wandert
  nicht mit**, aus demselben Grund wie `katalog.sqlite`. Wer künftig „Anheften"
  im Quelltext ersetzt, muss die Kommentare auslassen; ein Wächter im Prüfstand
  hält das fest.
- **Ein Favorit sortiert nicht vor** (seit 0.6.6). Bis 0.6.5 zog eine Zeile in
  `renderList()` alle Favoriten vor **jede** eingestellte Sortierung — ein
  Favorit ohne Wertung stand bei „Bewertung hoch → niedrig" ganz oben, obwohl
  Einträge ohne Wert dort ans Ende gehören. Das steht quer zu „die Liste zeigt,
  wo etwas geschieht, nicht wo *ich* zuletzt war", und seit 0.6.5 erst recht:
  der Favorit ist persönlich und darf die gemeinsame Liste nicht umsortieren.
  **Wer seine Favoriten sammeln will, nimmt den Filter** — der ist in derselben
  Version dazugekommen und ist die Voraussetzung dafür, dass diese Änderung
  kein Verlust ist.
- **Zwei Filter sind zwei Filter, kein zweiter Sortierweg** (seit 0.8.60, am
  Umschalter „Neu seit …"). Die Übersicht sortiert nach `updated_at`, für alle
  gleich; wer daraus eine persönliche Reihenfolge macht, hat zwei Wahrheiten
  über denselben Bestand. **Eine Vorsortierung des Neuen vor dem `switch` wäre
  genau die Bauform, an der der Favorit 2020 gescheitert ist** — und sie fällt
  an der Reihenfolge der *verbliebenen* Zeilen nicht auf, sondern nur an der
  **ungefilterten** Liste (Stolperstein 114). Der Prüfstand misst sie deshalb
  dort.
- **Der Merkzeitpunkt kommt von der Serveruhr und wird um eine Sekunde
  nachgestellt** (seit 0.8.60). Was der Aufrufer schickt, ist ein **Signal**
  („ich habe die Übersicht verlassen"), keine Feststellung — eine mitgeschickte
  Zeit wäre eine Behauptung, mit der sich jeder Bestand nach Belieben als
  ungesehen erklären ließe. Dieselbe Regel wie beim `Host`-Header, nur an einer
  neuen Stelle. **Und die Sekunde zurück ist keine Feinheit:** `datetime('now')`
  löst nur Sekunden auf (Stolperstein 60); ein Kommentar aus derselben Sekunde
  trüge sonst genau den Merkzeitpunkt und gälte nie als neu. *Lieber einen
  Eintrag zweimal zeigen als einen verschlucken.*
- **Der Merkzeitpunkt wird beim VERLASSEN gesetzt, gelesen wird er einmal je
  Seitenleben** (seit 0.8.60). Beim Betreten gesetzt stünde er auf dem
  Augenblick, in dem man hinsieht, und „neu seit" wäre immer leer. Und würde er
  bei jeder Rückkehr in die Übersicht nachgezogen, sähe man sieben Neue und
  verlöre sechs davon beim ersten Klick. **Ein Besuch ist eine Sitzung am
  Bildschirm, kein Wechsel der Ansicht.**
- **Der Haken in der Ansicht „Offen" ist ein Zustand, keine Weiterschaltung**
  (seit 0.8.60). Er schickt `kind: 'done'` bzw. `'task'` ausdrücklich.
  `aufgabeWeiter()` macht aus einer erledigten Aufgabe eine **Notiz** — im
  Kommentarblock die gewollte Abfolge, hier ein Kästchen, dessen zweiter Druck
  die Zeile lautlos aus der Menge nähme. Zwei Bedienelemente, zwei Bedeutungen.
- **Der Erledigt-Haken am fremden Aufgabenkommentar bleibt bei „Verfasser oder
  Admin"** (bestätigt in 0.8.60). „Löschen ja, umschreiben nein" gilt
  **Aussagen**; ein Haken ändert keine Aussage, er setzt ein Merkmal — dieselbe
  Klasse wie die Anpinnung, die der Admin seit 0.7.2 setzen darf. **Und das
  Kästchen steht nur, wo es gedrückt werden darf:** ein Bedienzeichen folgt dem
  Recht, nicht der Anzeige.
- **Die Ansicht „Offen" ist lesend und steht deshalb in keiner Liste
  schreibender Routen** (seit 0.8.60). Sie braucht auch keinen Wächter: wer
  angemeldet ist, sieht die Kommentare ohnehin in jedem Eintrag. Der Haken geht
  über `PUT /api/comments/:id`. **`F_ROUTEN` bleibt bei 47**, und die Zahl wird
  ausdrücklich geprüft.
- **Die Bedingung „nicht erledigt" heißt `kind = 'task'`, an beiden Stellen**
  (seit 0.8.60). Die Detailansicht schreibt sie so, die neue Abfrage schreibt
  sie genauso. `kind != 'done'` wäre falsch — es nähme Notizen und Berichte
  mit — und ist als Gegenprobe gefahren. *Zwei Schreibweisen für dieselbe Frage
  laufen auseinander.*
- **Der Favoritenfilter ist ein eigener Umschalter, kein vierter Teststatus**
  (seit 0.6.6). Die drei Knöpfe „Alles anzeigen / Getestet / Ungetestet" sind
  drei Zustände **eines** Merkmals; genau einer gilt. Der Favorit ist davon
  unabhängig und muss sich mit jedem von ihnen kombinieren lassen — als vierter
  Knopf ginge „getestet **und** Favorit" nicht, ohne den Teststatus aufzugeben.
  Er steht deshalb abgesetzt (`.pill-sep`), damit ihn niemand für den vierten
  Zustand hält.
- **Der Favoritenknopf bleibt orange, der Stern gold** (seit 0.6.6). „Gold ist
  Bewertung und Favorit, Orange ist Art und Bedienung" — ein Filterknopf ist
  Bedienung. Beim Bauen war die goldene Einfärbung des Knopfes schon
  eingetragen und ist zurückgenommen worden; eine Prüfung hält jetzt fest, dass
  `.pill-sep.on` kein Gold trägt.
- **Die Anheftung ist eine Aussage über den Eintrag, keine Eigenschaft von ihm**
  (seit 0.6.3). Sie steht deshalb in `item_pins (user_id, item_id)` und nicht
  mehr als Spalte in der Zeile, über die alle gemeinsam schreiben. Es gibt nur
  Zeilen für tatsächlich Angeheftetes; ein Eintrag, den niemand angeheftet hat,
  kommt dort gar nicht vor. `favorite` in der Antwort heißt ab jetzt „habe
  **ich** angeheftet" — dieselbe Antwort sieht für zwei Leute verschieden aus.
- **Anheften rührt `updated_at` nicht mehr an** (seit 0.6.3). Bis 0.6.2 lief die
  Anheftung als Spalte durch dasselbe `UPDATE` wie der Titel und setzte das
  Änderungsdatum mit — der Eintrag sprang damit in **jeder** Übersicht nach oben.
  Das steht quer zu „die Liste zeigt, wo etwas geschieht, nicht wo *ich* zuletzt
  war"; eine persönliche Ablage ist genau Letzteres. Sichtbare Folge: Losheften
  schiebt den Eintrag nicht mehr an den Anfang. Dieselbe Überlegung gilt für die
  Migration — sie leert die Spalte, **ohne** `updated_at` mitzuschreiben, sonst
  stünden nach der Migration alle ehemals angehefteten Einträge oben, und zwar für
  jeden.
- **`items.favorite` bleibt als Spalte stehen und wird nie beschrieben**
  (seit 0.6.3, Begründung erneuert in 0.8.1). Die Spalte bleibt, damit
  Bestands- und Neuanlage dasselbe Schema tragen; der Favorit steht in
  `item_pins`. **Wer hier wieder hineinschreibt**, baut eine zweite Wahrheit
  über dieselbe Sache.
- **`detail()` bekommt den Benutzer ohne Vorgabewert — und mit einer Klemme**
  (seit 0.6.3). Ein `ORDER BY id LIMIT 1` als Rückfall wäre genau die Zeitbombe
  aus Teil V Punkt 13 des Konzeptpapiers. Die Klemme ist dabei keine Zierde,
  sondern die **einzige** Schicht: `better-sqlite3` bindet ein fehlendes
  Argument still als `NULL`, nur zu *wenige* Argumente werfen (Stolperstein 59).
  Ohne sie lieferte eine vergessene Aufrufstelle wortlos `favorite: false` und
  lauter Nullen bei den Sternen.
- **Die Sterne zeigen die eigene Zeile, der Schnitt bleibt über alle**
  (seit 0.6.3). `it.ratings` filtert auf den Benutzer — ohne das vervielfacht
  der `LEFT JOIN` das Kriterium, und bei zwei Bewertern stünden zwei Reihen
  Sterne für dieselbe Sache. Die Testkennzahlen und `usage_count` rechnen
  ausdrücklich weiter über alle; *ihre Anzeige ist seit 0.7.0 gebaut.*
- **Ein Bedienelement zeigt den Zustand, den es verändert** (seit 0.7.0). Die
  Sterne sind die eigene Bewertung, nie der Schnitt. Zeigten sie den Schnitt,
  spränge die Anzeige nach einem Klick auf den vierten Stern auf 3,6 — man
  hätte vier geklickt und sähe nicht vier, und bei vielen Bewertern bewegte
  sich der Balken irgendwann gar nicht mehr sichtbar. Der Schnitt steht
  gedämpft rechts daneben, zusammen mit der **Zahl der Bewerter**: 4,8 aus
  einer Stimme heißt etwas anderes als 4,8 aus zwanzig.
  *Verworfen:* Schnitt in den Sternen mit dem eigenen Wert in Klammern
  dahinter — die Klammer wäre korrekt, das große Element daneben löge weiter.
- **Der Gesamtschnitt rechnet erst je Kriterium, dann über die Kriterien**
  (seit 0.7.0). Nicht flach über alle Bewertungszeilen: flach zählt ein
  Kriterium, das drei Leute bewertet haben, dreifach gegen eines mit einer
  Stimme, und die Kopfzahl wäre aus den angezeigten Zeilenwerten nicht mehr
  nachvollziehbar. **Bei genau einem Zugang liefern beide Rechnungen dasselbe**
  — jedes Kriterium hat dann höchstens eine Stimme. Die Migration auf 0.7.0
  ändert im Einbenutzerbetrieb also keine einzige Zahl.
  **Gerundet wird genau einmal, am Ende.** Je Kriterium vorzurunden und dann zu
  mitteln wäre ein zweiter Rundungsort für dieselbe Zahl; SQL und JavaScript
  müssten dafür gleich runden. Der Preis steht hier, damit ihn niemand für
  einen Fehler hält: wer die angezeigten Zehntel von Hand mittelt, kann um bis
  zu 0,05 danebenliegen.
  **Seit 0.8.40 bekommt der zweite Schritt Gewichte, der erste nicht.** Die
  Zweistufigkeit bleibt unangetastet; aus dem ungewichteten Mittel über die
  Kriterien wird ein gewichtetes. Bei Gewicht 1 überall ist es dasselbe —
  Zähler und Nenner bekommen denselben Faktor —, und wer alle Gewichte auf 1
  zurückstellt, bekommt exakt die alten Zahlen wieder. Die Sache ist
  vollständig umkehrbar, ohne Datenverlust. Gerundet wird weiterhin genau
  einmal.
- **Die Durchschnittsspalte entfällt bei genau einem Zugang** (seit 0.7.0).
  „3,4 · 1" ist keine Information. Abgeleitet aus `benutzerZahl`, nicht aus
  einem Schalter — ein Zustand, keine zweite Wahrheit. Die Schwelle steht
  ausschließlich in der Oberfläche (`mehrereBenutzer()`); der Server liefert
  die Zahl und trifft keine Entscheidung darüber.
- **Der Rücksetzer heißt „Meine Bewertung zurücksetzen", immer** (seit 0.7.0).
  Serverseitig trifft er seit 0.6.2 nur die eigenen Werte; hier stand nur noch
  die Beschriftung aus. Der Wortlaut bleibt bei einem wie bei zehn Zugängen
  derselbe — eine Beschriftung, die mit der Zahl der Zugänge umspringt, wäre
  eine zweite Wahrheit über denselben Knopf.
- **Eigene Testtage sind gefüllt, fremde ein Ring** (seit 0.7.0). Gilt in der
  Zeitleiste über dem Kartenraster und in der Verlaufskurve im Eintrag.
  **Kein neuer Farbkanal** — Gold bleibt Gold, unterschieden wird über die
  Füllung. Die Linie der Verlaufskurve läuft weiter über alle: sie ist der
  Verlauf des Eintrags, nicht der einer Person. *Verworfen:* ein Schalter
  „nur meine" — mehr Bedienung für wenig Gewinn.
- **Die Antwort nennt `mine`, nicht die Verfasser-Id** (seit 0.7.0). Eine
  nackte Id liest niemand, und der Name kommt in Stufe G. `qTestDays()`
  bekommt den Benutzer **ohne Vorgabewert und mit einer Klemme**, aus demselben
  Grund wie `detail()` seit 0.6.3: `better-sqlite3` bindet ein fehlendes
  Argument still als `NULL` (Stolperstein 59), und eine vergessene Aufrufstelle
  lieferte sonst wortlos lauter fremde Punkte.
- **Die Exportdatei nennt den Namen, nie die Id** (seit 0.7.1). Eine nackte
  `user_id` liest niemand, und in einer Datei, die den Rechner verlässt, wäre
  sie eine Angabe über eine Person ohne jeden Nutzen — sie zeigt auf eine
  Zeilennummer in *einer bestimmten* Datenbank und ist woanders bedeutungslos.
  Der Name dagegen ist die einzige Angabe, die zwei Anlagen gemeinsam haben.
  Dieselbe Überlegung wie bei `mine` an den Testtagen seit 0.7.0, nur mit dem
  umgekehrten Ergebnis: dort war die Antwort für einen Bildschirm bestimmt und
  brauchte gar keinen Namen, hier verlässt sie das Haus und braucht genau ihn.
- **Auch der Eintrag selbst nennt seinen Verfasser** (seit 0.7.1). Abschnitt 12
  des Konzeptpapiers zählte nur Bewertung, Kommentar und Testtag auf — `items`
  trägt aber seit 0.6.1 dieselbe Spalte. Ohne dieses Feld schöbe eine
  ersetzende Wiederherstellung **alle** Einträge dem Einspielenden zu und nähme
  damit genau die Angabe zurück, die Stufe B eingeführt hat. Vier Träger, nicht
  drei; die Lücke im Entwurf ist im Konzeptpapier vermerkt.
- **Ein herrenloser Verfasser steht ausdrücklich als `null` in der Datei**
  (seit 0.7.1), das Feld fehlt nie. Sonst wäre „diese Zeile hat keinen
  Verfasser" von „diese Datei ist älter als 0.7.1" nicht zu unterscheiden — und
  das sind zwei verschiedene Aussagen, auch wenn der Import beide gleich
  behandelt.
- **Ein unbekannter Name legt keinen Zugang an** (seit 0.7.1). Er fällt an den
  Einspielenden, wie es das Konzept vorschreibt. Die naheliegende
  „Hilfsbereitschaft", den fehlenden Zugang eben anzulegen, wäre ein Weg an der
  Verwaltung (Stufe G) und am Passwort vorbei: eine Exportdatei erzeugte damit
  Zugänge, die niemand angelegt hat. **Die Datei ist Bestand, keine Verwaltung.**
- **Der Import meldet die Namen, die er nicht kennt** (seit 0.7.1) — in der
  Antwort (`verfasserUnbekannt`, `verfasserZugeordnet`) und, wenn die Liste
  nicht leer ist, mit einer Zeile im Protokoll. Der Grund ist die Stille des
  Gegenteils: „alles andere fällt an den Einspielenden" ist die entworfene Regel
  und zugleich der lautloseste denkbare Vorgang. Beim Einspielen einer
  Mehrbenutzersicherung in eine frische Anlage zieht sonst der gesamte Bestand
  wortlos um, und zwei Zeilen zur selben Sache fallen dabei über `OR REPLACE`
  zusammen (Stolperstein 70). **Gezählt werden nur die *fremden* Zuordnungen** —
  der eigene Name ist keine, sonst meldete jede selbst erzeugte Datei eine
  Zuordnung, die keine ist.
- **Die Anheftung wandert nicht mit dem Eintrag** (seit 0.7.1). Der Verfasser
  kommt zu Eintrag, Bewertung, Kommentar und Testtag — **nicht** zum Favoriten.
  Er ist eine Aussage *über* einen Eintrag und nicht sein Inhalt; eine Liste
  fremder Anheftungen in der Datei wäre Ablage, kein Bestand. `favorite` heißt
  in der Datei weiterhin „hat der angeheftet, der exportiert hat" und wird beim
  Einspielen dem zugeschrieben, der einspielt — unverändert seit 0.6.3.
- **Die Formatnummer ist eine Aussage, keine Bedingung** (seit 0.7.1, Nummer 6).
  Weder der Import noch die Oberfläche lesen sie. Entschieden wird
  ausschließlich über das **Vorhandensein der Felder** — nur so bleiben ältere
  Dateien lesbar, ohne dass irgendwo eine Fallunterscheidung nach Nummer steht,
  die beim nächsten Format gepflegt werden müsste. Wer die Nummer je zur
  Bedingung macht, macht aus einer Notiz eine zweite Wahrheit.
- **Ein `ON CONFLICT`-Ziel gehört zum `UNIQUE` seiner Tabelle** (seit 0.6.2).
  Die beiden Stellen in `server.js` und die beiden Tabellen in `db.js` sind
  **ein** Paar; wer eines ändert, ändert das andere mit. SQLite lehnt eine
  Anweisung mit unpassendem Ziel rundheraus ab — das ist die freundliche
  Variante, siehe Stolperstein 58.
- **Der Tabellenneubau erkennt seinen Bedarf am UNIQUE-Index, nicht an einem
  Merker** (seit 0.6.2). `PRAGMA index_list` und `index_info` sagen, ob der
  Umbau schon gelaufen ist. Ein Merker in `settings` wäre die naheliegende
  Alternative und wäre falsch: Stufe D teilt `settings` in eine globale und eine
  persönliche Hälfte, und genau dort kann ein Schlüssel still zwischen die
  Stühle fallen. Der Index ist ohnehin die Wahrheit — der Merker wäre nur eine
  Behauptung darüber.
- **Tags am Testtag bekommen keine eigene `user_id`** (seit 0.6.1). Sie hängen
  am Testtag, gehen mit ihm über die Kaskade und teilen damit dessen
  Eigentümer. Eine zweite Spalte daneben wäre genau die Bauform der
  Stolpersteine 47 und 48: zwei Orte, die beide sagen dürften, wem etwas gehört.
- **Ein Auffangnetz mit einem Anlegeweg braucht so viele Aufrufstellen wie es
  Wege gibt** (seit 0.6.1, verkleinert in 0.8.1). `ordneBestandZu()` steht in
  `db.js` und wird an **zwei** Stellen gerufen: beim Start und in
  `legeErstenBenutzerAn()` — beim Start einer leeren Anlage gibt es noch
  keinen Benutzer, dem etwas zufallen könnte. Das sieht nach Doppelung aus
  und ist keine: die Gegenprobe an jeder Stelle macht genau ihre eigene
  Prüfung rot. Dieselbe Frage wie bei Stolperstein 53 — nicht „ist das
  redundant", sondern „deckt eine Stelle die andere zu". *Die dritte
  Aufrufstelle (nach der Übernahme aus der `.env`) ist mit dem Migrationscode
  in 0.8.1 entfallen.*
- **Eine Einstellung ist entweder Ansicht oder Sprache — und das entscheidet,
  wem sie gehört** (seit 0.6.5). `settings` zerfällt in zwei Hälften:
  `user_settings` trägt, was nur den Einzelnen angeht (Filterwahl,
  Schriftgröße, Blockanordnung, sichtbare Linkzeilen, Zeitleiste, Zahl der
  Anbieternamen), `settings` behält, was für alle gilt (Vokabular, beide Titel,
  die drei Sucheinstellungen). **Das Vokabular bleibt ausdrücklich global**: es
  ist die Sprache der Anwendung, keine Ansichtssache — zwei Leute, die
  denselben Bestand pflegen und dabei verschiedene Wörter für dieselbe Sache
  sehen, hätten eine Verständigung weniger.
- **Eine persönliche Einstellung bekommt eine Spalte, keine Tabelle**
  (seit 0.6.5). `item_pins` ist hier kein Vorbild: die Anheftung hat eine eigene
  Tabelle bekommen, weil sie eine Aussage über einen **Eintrag** ist. Eine
  Einstellung ist eine Aussage über niemanden außer sich selbst — also eine
  Tabelle für alle Schlüssel, mit `key` als zweiter Spalte des
  Primärschlüssels. Wer C2 als Muster nimmt, baut eine Tabelle zu viel.
- **`user_settings.user_id` steht auf `ON DELETE CASCADE`** (seit 0.6.5), und
  das ist keine Formsache. Die beiden Alternativen sind nachgestellt und beide
  falsch: ohne Angabe scheitert `AUTH_RESET` an einer Fremdschlüsselverletzung
  und der Start stirbt in `auth.js`, `SET NULL` scheitert am `NOT NULL` des
  Primärschlüssels. Dieselbe Frage wie bei Stolperstein 54, nur an einer neuen
  Tabelle. **Hinzunehmende Folge, wie bei `item_pins`:** die Rücksetzung nimmt
  die persönlichen Einstellungen mit. Das entfällt, sobald Stufe G sie auf
  „entwerten statt löschen" umstellt.
- **Ein persönlicher Schlüssel darf nie wieder global geschrieben werden**
  (seit 0.6.5). `putSetting` weist ihn laut ab. Ohne diese Schranke entstünde
  eine zweite Wahrheit über dieselbe Sache: ein Wert, der still für alle
  gilt statt für den, der ihn gesetzt hat. Solange nur einer angemeldet ist,
  sähe das niemand.
- ~~**Die globale Zeile wird bei der Migration geräumt, nicht kopiert**~~
  (0.6.5). **Gegenstandslos seit 0.8.1:** die Migration ist mit dem
  Migrationscode entfernt. Die Lehre bleibt als Muster — eine Überführung
  erkennt ihren Bedarf am Ergebnis, nicht an einem Merker.
- ~~**`legacy.js` schreibt weiterhin `filters` global — und das bleibt so.**~~
  **Gegenstandslos seit 0.8.1:** `legacy.js` ist gelöscht, einen globalen
  Eingang für persönliche Schlüssel gibt es nicht mehr. Die Schranke in
  `putSetting` bleibt.
- **Die Liste der persönlichen Schlüssel steht nur noch einmal** (seit 0.8.1;
  bis dahin zwangsläufig zweimal, weil die Migration in `db.js` eine
  Zwillingsliste brauchte). `PERSOENLICHE_SCHLUESSEL` in `server.js` ist
  Schranke und Wahrheit zugleich; der Prüfstand belegt, dass sie zur
  Laufzeit wirklich gelesen wird.
- **Zwei Wörter für zwei Dinge: Admin und Eigentümer** (seit 0.7.2). *Admin* ist
  `role = 'admin'` und verwaltet den Bestand; *Eigentümer* ist der Zugang mit
  der kleinsten `id`, also wer die Anlage eingerichtet hat, und ihm gehört, was
  die Anlage als Ganzes betrifft. **„Leitung" war für beides benutzt worden**
  und ist deshalb aus Quelltext, Oberfläche und Dokumenten verschwunden; ein
  Wächter im Prüfstand hält fest, dass das Wort nirgends zurückkommt. Kein
  drittes Rollenwort — der Eigentümer bleibt eine Ableitung aus der Nummer.
- **Die Rechteregel steht an einem Ort, nicht an jeder Route** (seit 0.7.2).
  `istAdmin` und `istEigentuemer` sagen, wer fragt; `darfAendern` (Verfasser
  oder Admin) und `nurSelbst` (Verfasser, Admin ausdrücklich nicht) sagen, was
  er darf; `nurAdmin`, `nurEigentuemer` und `nurEintragVerfasser` hängen als
  Wächter vor den Routen, `eintragFrei` bedient die Wege, bei denen die
  Eintragsnummer erst aus der Kindzeile kommt. **Die Adminfrage
  (`role === 'admin'`) steht genau einmal im Quelltext**, die Eigentümerfrage
  (`MIN(id)`) ebenfalls — beides wird nachgezählt. Ohne diese Zählung wäre die
  Bauform der Stolpersteine 51 und 53 unvermeidlich: zwei Stellen, die dieselbe
  Regel behaupten, laufen auseinander, und keine Gegenprobe belegt dann noch
  etwas.
- **Löschen ja, umschreiben nein** (seit 0.7.2, aus Konzept Teil IV). Ein Admin
  räumt auf, aber er verändert keine fremde Aussage unter fremdem Namen.
  Daraus folgt die Trennung, die in zwei Endpunkten mitten im Rumpf sitzt:
  fremden **Kommentartext** ändern darf niemand, fremde **Art und Anheftung**
  setzen darf der Admin; einen fremden **Testtag löschen** darf er, dessen
  **Note ändern** nicht; ein fremdes **Kommentarbild löschen** darf er,
  **anhängen** nicht.
  *Der Preis steht hier, damit ihn niemand für einen Fehler hält:* entfernt der
  Admin ein fremdes Bild, verschwindet es wortlos. Der Vermerk dazu gehört als
  eigene Angabe an den Kommentar — niemals in sein Textfeld, sonst hätte er
  genau das getan, was er nicht darf — und ist für Stufe G eingetragen.
- **Zwei Rechteklassen dürfen in einem Rumpf stehen, aber nur vor dem ersten
  Schreiben** (seit 0.7.2). `PUT /api/items/:id` trägt den persönlichen
  Favoriten neben den Feldern des Verfassers, `PUT /api/comments/:id` den Text
  neben Art und Anheftung. Beide prüfen, **bevor** irgendetwas geschrieben ist.
  Das ist keine Feinheit: die Anheftung ist in `PUT /api/items/:id` der erste
  Schreibvorgang, und eine Absage danach wäre halb ausgeführt — der Fremde
  bekäme sein 403 und hätte den Eintrag trotzdem losgeheftet. Zu jeder der
  beiden gehört eine Gegenprobe, die die Klemme **verschiebt** statt sie zu
  entfernen (siehe Stolperstein 72).
- **Der Favorit bleibt persönlich, auch unter der Rechteschicht** (seit 0.7.2).
  Jeder setzt seinen eigenen an **jedem** Eintrag, auch an einem fremden. Er ist
  eine Merkhilfe und keine Aussage über den Eintrag; ihn hinter den Verfasser zu
  klemmen hieße, dass man sich fremde Einträge nicht mehr merken kann. Deshalb
  steht `favorite` ausdrücklich **nicht** in `NUR_VERFASSER_FELDER`.
- **Bei den Bewertungen steht ausdrücklich kein Wächter** (seit 0.7.2). Beide
  Wege treffen baulich nur die eigene Zeile — das `ON CONFLICT` nennt
  `(item_id, criterion_id, user_id)`, das `DELETE` trägt seit 0.6.2
  `AND user_id = ?`. Eine Klemme daneben wäre eine zweite Wahrheit über
  dieselbe Sache und ließe sich obendrein nicht gegenprüfen: ihr Rückbau bliebe
  stumm, weil die Eindeutigkeitsregel den Fall ohnehin verhindert
  (Stolperstein 50). **Wer hier später doch eine hinsetzt**, sollte wissen, dass
  sie nichts bewirkt und nichts belegt.
- **Eine herrenlose Zeile gehört dem Admin** (seit 0.7.2). `darfAendern` gibt
  bei `user_id IS NULL` für jeden anderen falsch zurück. Ohne diese Klemme wäre
  sie für alle offen — und genau die entstünde bei einem `DELETE` von
  Hand: die Anwendung selbst entfernt seit 0.8.0 keine Benutzerzeile mehr.
  `ordneBestandZu()` räumt sie beim nächsten Start dem Eigentümer zu; bis
  dahin darf sie nicht jedem gehören.
- **Export und Import gehören dem Eigentümer, nicht jedem Admin** (seit 0.7.2).
  Der Import, weil eine Exportdatei seit 0.7.1 Beiträge **unter fremdem Namen**
  anlegen kann — über ihn wäre das Umschreiben fremder Beiträge für jeden offen,
  ohne dass irgendwo „ändern" steht. **Beide Modi**, nicht nur „ersetzen": das
  Zusammenführen legt genauso Zeilen unter fremdem Namen an, es wirft nur nichts
  weg. Der Export, weil er der gesamte Bestand in einer Datei ist, die das Haus
  verlässt — mit allen Fotos, allen Anhängen und allen Verfassernamen. „Alles
  sehen darf jeder" gilt für den Bildschirm, nicht für die Mitnahme.
  **Hinzunehmende Folge:** ein Admin ohne Eigentümerrecht kann keine Sicherung
  ziehen. *Entschieden in 0.8.0:*
  das Recht hängt am Rollenwert `eigentuemer`, nicht an der Nummer.
- **Die Liste aller schreibenden Routen wird gepflegt, nicht abgeleitet**
  (seit 0.7.2). Im Prüfstand steht zu jedem der 42 Endpunkte, welcher Art seine
  Absicherung ist, und der Lauf hält das gegen `server.js`. **Das ist die
  einzige Prüfung, die eine fehlende Entscheidung findet:** eine neue Route
  ohne Eintrag macht sie namentlich rot. Sie prüft beide Richtungen — wo
  „offen" steht, darf auch keine Klemme stehen, sonst wäre eine
  stillschweigend eingebaute von einer entschiedenen nicht zu unterscheiden.
- **`aendereZugang()` bekommt den Benutzer, behält aber seinen Namen**
  (seit 0.7.2). Das weicht bewusst von den drei Umbenennungen aus 0.6.0 ab, und
  der Unterschied ist die Begründung: dort änderte sich, was die Funktionen
  **zurückgeben** — das fällt einem Aufrufer still auf die Füße, und dagegen
  hilft nur ein anderer Name. Hier ändert sich, was sie **entgegennimmt**, und
  eine vergessene Aufrufstelle reicht ein Passwort durch, wo eine Nummer stehen
  muss. Die Klemme (`Number.isInteger`) sagt das laut. **Merksatz: eine
  Umbenennung schützt vor stillem Weiterverwenden, eine Klemme vor lautem — man
  braucht die Umbenennung nur dort, wo die Klemme nicht greifen kann.**
- **`holeBenutzer()` heißt weiterhin nicht `holeAngemeldeten()`** (seit 0.6.0,
  bestätigt in 0.7.2). Es liefert den **Eigentümer**, und das ist seit 0.7.2 eine
  eigene, gebrauchte Angabe und kein Notbehelf mehr. Die drei Stellen, an denen
  „der erste Benutzer" stand, wo „der angemeldete" gemeint war, sind weg; was
  bleibt, ist die Startmeldung im Protokoll — und die sagt seitdem auch
  ausdrücklich „Eigentümer".
- **Kein Papierkorb, kein Änderungsverlauf, keine Statistikübersicht** —
  bewusst verworfen.
  *Der Mehrbenutzerbetrieb stand bis 0.5.9 ebenfalls hier.* Die Begründung
  lautete: gemeinsame Kriterien, globale Blockanordnung und ein Vokabular für
  alle stünden im Weg. **Sie galt nur für getrennte Kataloge je Benutzer.** Für
  einen gemeinsamen Bestand mit mehreren Bewertern sind geteilte Kriterien kein
  Hindernis, sondern die Voraussetzung — ohne sie wäre kein Vergleich möglich.
  Der Umbau ist in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_90.md` in neun Stufen
  entworfen; siehe Abschnitt 10 Punkt 5.

- **Drei Rollen als Leiter, nicht zwei plus ein Bit** (seit 0.8.0).
  `user` < `admin` < `eigentuemer`. Bis 0.7.2 war der Eigentümer die kleinste
  `id` und ausdrücklich kein Rollenwort; das ist auf ausdrückliche Entscheidung
  aufgegeben worden, damit sich das Recht **vergeben** lässt und zwei Leute
  sich eine Anlage teilen können. **Ein Bit neben `role` wäre die naheliegende
  Bauform und wäre falsch:** es ließe `role='user'` mit `eigentuemer=1` zu, also
  zwei Spalten, die beide sagen dürften, was jemand darf — die Bauform der
  Stolpersteine 47 und 48. Als Leiter ist „ein Eigentümer ist immer auch Admin"
  **baulich wahr** statt eine Regel, die man durchsetzen muss.
  Gewonnen wird nebenbei, dass `istEigentuemer` die Datenbank nicht mehr fragt:
  beide Fragen lesen `req.benutzer.role`. **`MIN(id)` kommt in `server.js` nicht
  mehr vor**, und ein Wächter im Prüfstand zählt das nach.
- **Ein Admin kommt nicht an seinesgleichen** (seit 0.8.0). Er legt Benutzer an,
  sperrt sie, setzt ihr Passwort zurück und entfernt sie. An einen anderen
  **Admin** oder den **Eigentümer** kommt nur der Eigentümer, und Rollen vergibt
  ohnehin nur er. Ohne diese Zeile wäre die Verwaltung ein Wettrennen: ein
  Admin könnte alle anderen sperren und bliebe allein im Dorf. Die Regel steht
  an genau einer Stelle (`darfAnZugang`) und wird von allen Verwaltungsrouten
  gerufen.
- **Der letzte aktive Eigentümer darf nicht verschwinden** (seit 0.8.0) — weder
  durch Herabstufen noch Sperren noch Entfernen. Serverseitig durchgesetzt, nicht
  nur in der Oberfläche ausgegraut. Gezählt werden nur **aktive** Eigentümer:
  sonst ließe sich die Anlage verriegeln, indem man den letzten sperrt statt ihn
  herabzustufen. Sich selbst herabstufen bleibt erlaubt, solange ein anderer
  bleibt.
- **Niemand sperrt oder entfernt sich selbst** (seit 0.8.0). Das ist keine
  Doppelung der Regel darüber: mit zwei Eigentümern greift jene nicht mehr, und
  dann spräche nichts mehr dagegen, dass sich einer selbst aussperrt. *Die
  naheliegende Prüflage dafür ist blind* — lässt man einen Admin sich selbst
  sperren, kommt das 403 von `darfAnZugang` und nicht von dieser Klemme
  (Stolperstein 73). Die Prüfung nimmt deshalb den Eigentümer an sich selbst,
  bei zwei Eigentümern.
- **Löschen entwertet, es löscht nicht** (seit 0.8.0). Die Benutzerzeile bleibt
  mit ihrer `id` stehen: `status='geloescht'`, Passwort-Hash geleert, Rolle
  zurück auf `user`, Name mit `geloescht-<id>` überschrieben. **Die Anwendung
  entfernt seit 0.8.0 keine Benutzerzeile mehr.**
  Der Grund ist nicht Schonung, sondern Zwang: verschwände die Zeile, machte
  `ON DELETE SET NULL` den ganzen Bestand herrenlos, und `ordneBestandZu()`
  schöbe ihn beim nächsten Start **still** dem Eigentümer zu — fremde Aussagen
  unter fremdem Namen, genau das, was Teil IV des Konzeptpapiers verbietet.
  **Folge, die hierher gehört: die `ON DELETE`-Klauseln bleiben unverändert**
  und sind ab jetzt reines Auffangnetz für ein `DELETE` von Hand. Der Prüfstand
  stellt es deshalb ausdrücklich nach — bis 0.7.2 belegte `AUTH_RESET` die
  Kaskade nebenbei, und dieser Beleg wäre sonst stillschweigend weggefallen.
- **Der Name eines entfernten Zugangs wird freigegeben** (seit 0.8.0). Er wird
  mit `geloescht-<id>` überschrieben, und die Zahl ist die alte Nummer — dieselbe,
  die in `user_id` steht. Die Oberfläche bildet daraus „Gelöschter Benutzer 7";
  **nirgends wird ein Name aufbewahrt.** Das Feld draußen ist geteilt: Discourse,
  MediaWiki und GitHub geben den Namen frei, Slack, Jira und Mastodon behalten
  ihn. Für Kriterion gab den Ausschlag, dass der **Export** seit 0.7.1 den Namen
  nennt, nie die Id: trüge ein Grabstein weiter „faruk", schöbe dieselbe Datei in
  einer anderen Anlage mit einem lebenden „faruk" dessen Zeilen zu — stillschweigend.
  **Der Preis, damit ihn niemand für einen Fehler hält:** der alte Name ist
  danach endgültig weg, und das Muster `geloescht-<zahl>` ist als Benutzername
  gesperrt. Geprüft wird das an **beiden** Wegen — beim Anlegen und beim bloßen
  Umbenennen des eigenen Zugangs; die zweite Stelle deckt die erste nicht ab und
  hat ihre eigene Gegenprobe.
- **Zwei Häkchen beim Entfernen, nicht eine Entscheidung** (seit 0.8.0). Der
  Entwurf sah *Inhalte mitlöschen* oder *an den Admin übertragen* vor; die
  Übertragung entfällt, weil sie die Antwort auf ein Problem war, das mit dem
  Grabstein nicht mehr entsteht. Geblieben sind zwei Ausnahmen von „alles
  bleibt", und sie tun sehr Verschiedenes: **„seine Einträge löschen"** nimmt
  über die Kaskade auch **fremde** Kommentare, Bewertungen und Testtage daran
  mit — der Dialog nennt diese Zahl; **„seine Beiträge in fremden Einträgen
  löschen"** trifft nur seine eigenen. Vorgabe: beide aus.
  **Sitzungen, Favoriten und persönliche Einstellungen gehen immer mit** — sie
  sagen niemandem etwas, sobald der Mensch weg ist.
- **`AUTH_RESET` wird abgelehnt, nicht begrenzt** (seit 0.8.0). Das Konzept sah
  vor, die Umgebungsvariable stehenzulassen und aus „löschen" ein „entwerten" zu
  machen, mit Rückweg über die Einrichtungsseite und einem Einmalcode dagegen.
  **Ein Blick nach draußen zeigte, dass das niemand so macht:** Nextcloud
  (`occ user:resetpassword`), GitLab, Grafana, WordPress und Home Assistant
  haben alle einen **Befehl auf dem Wirt**, der einen **Namen** nennt und **nur
  das Passwort** setzt; keines kennt einen dokumentierten Weg, bei dem eine
  Rücksetzung einen Zugang entfernt. `zugang.js` folgt dem.
  **Der Gewinn ist das Fenster, das gar nicht erst aufgeht:** beim Weg über die
  Einrichtungsseite steht die nach jeder Rücksetzung offen, und wer den Namen
  errät, nimmt den Zugang. Damit entfällt auch der Einmalcode, der nur existierte,
  um es zu schließen, und der Status `entwertet`.
  **Die Vorgänge stehen in `auth.js`, nicht in `zugang.js`** — die
  Verwaltungskarte ruft dieselben. Zwei Wege zum selben Grabstein wären
  Stolperstein 51.
- **Die Namensbremse verzögert, sie sperrt nicht** (seit 0.8.0). Gezählt wird je
  IP **und** je Benutzername; die IP sperrt hart ab zehn, der Name **nie**.
  *Die Begründung des Konzeptpapiers war sachlich falsch* („sonst sperrt einer
  alle anderen aus" — das kann die IP-Bremse gar nicht, sie zählt je IP). Der
  echte Gewinn ist, dass **verteiltes** Raten gegen einen Namen bisher überhaupt
  nicht gebremst wurde: zehn Rechner mit je neun Versuchen blieben unter jeder
  Schwelle. Eine harte Namenssperre wäre dagegen ein Werkzeug **gegen** fremde
  Zugänge — wer einen Namen kennt, sperrte ihn für fünf Minuten. Die Kennwerte
  sind unverändert.
- **Ein gesperrter Zugang erfährt es — aber erst nach dem richtigen Passwort**
  (seit 0.8.0). Die Reihenfolge im Code ist die Aussage: erst prüfen, dann die
  Meldung. Vorher wäre „Dieser Zugang ist gesperrt" ein Werkzeug zum
  Durchprobieren von Benutzernamen; nachher ist sie das, was der Betroffene
  braucht — sonst liest sich die Absage wie ein falsches Passwort, und er
  probiert weiter, bis die Bremse zuschlägt. Ein Fehlversuch ist es dabei
  ausdrücklich nicht: der Zähler wird nicht hochgesetzt.
- **Der Status wird an zwei Stellen durchgesetzt** (seit 0.8.0), Anmeldung und
  `requireAuth`, und sie decken einander nicht zu. Ohne die zweite bliebe ein
  gerade Gesperrter bis zum Ablauf seines Cookies drin, also bis zu dreißig Tage.
  Das Sperren räumt seine Sitzungen zwar zusätzlich weg — **die Gegenprobe zu
  `requireAuth` muss den Status deshalb über die Datenbank setzen**, sonst
  bliebe sie grün, auch wenn die Klemme fehlte.
- **`benutzerZahl` zählt keine Grabsteine** (seit 0.8.0). An dieser Zahl hängt
  die Durchschnittsspalte neben den Sternen; ein entfernter Zugang ist kein
  zweiter Bewerter. Bei genau einem lebenden Zugang sieht die Anlage wieder aus
  wie im Einbenutzerbetrieb, auch wenn zehn Grabsteine daneben stehen.
- **`istVerwalter` heißt `istAdmin`** (seit 0.8.0). Der Feldname war 0.7.2 der
  letzte Rest des alten Wortes und blieb nur stehen, weil `public/app.js` in
  jener Stufe unberührt bleiben sollte.
- **Der Verfasser kommt als Objekt, nicht als Name** (seit 0.8.2).
  `verfasser: { id, name, geloescht }` an Eintrag, Kommentar, Testtag und
  Stimme; die nackte `user_id` steht in keiner Antwort mehr. Ein Objekt statt
  einem String, weil ein Grabstein keinen Namen mehr hat und die
  Beschriftung aus der **Nummer** entsteht. Das Feld heißt ausdrücklich nicht
  `author` wie im Export: dort ist es eine blanke String, hier ein
  Objekt, und gleicher Name bei anderer Form wäre eine Falle.
  **Herrenlos ist `null`, und das Feld fehlt nie** — sonst wäre „diese Zeile hat
  keinen Verfasser" von „diese Antwort kennt das Feld nicht" nicht zu
  unterscheiden. *Verworfen:* ein Endpunkt `GET /api/verfasser`, den die
  Oberfläche einmal holt — er legte die vollständige Zugangsliste jedem offen,
  auch die Namen derer, die nie etwas beigetragen haben.
- **Der Grabsteinname verlässt den Server nicht** (seit 0.8.2). Ein Grabstein
  liefert `name: null`, nur seine Nummer. `geloescht-<zahl>` ist **freigegeben**
  und kann längst einem anderen Menschen gehören; eine Antwort, die ihn
  mitschickt, verlässt sich darauf, dass die Oberfläche ihn ignoriert. Was nicht
  angezeigt werden darf, wird nicht geliefert. Beim Bauen war das zuerst falsch.
- **Die Beschriftung „Gelöschter Benutzer 7" entsteht an genau einem Ort**
  (seit 0.8.2). `verfasserName()` in `public/app.js`; die Karte „Zugänge" ruft
  dieselbe Funktion, statt den Namen ein zweites Mal zu bilden. Damit bleibt das
  Muster `geloescht-<zahl>` in `auth.js` und wandert nicht in einen zweiten
  Quelltext. Eine Gegenprobe belegt es: baut man die Bildung zurück, werden
  **auch** die beiden Prüfungen an der Verwaltungskarte rot.
- **Die Stimmenliste ist die Voraussetzung des Löschwegs** (seit 0.8.2, an
  einen anderen Ort gerückt in 0.8.6). Je Kriterium steht, wer welchen Wert
  vergeben hat — mit `id`, `wert`, `mine` und Verfasser. Ohne die `id` gäbe es
  vom Bildschirm aus keinen Weg zu einer einzelnen fremden Bewertung, und der
  Endpunkt darunter wäre unerreichbar. Gerechnet wird sie aus einer **eigenen
  gruppierten Abfrage**, ausdrücklich nicht aus einem dritten JOIN neben dem
  Schnitt und der eigenen Sternzeile.
  ~~Sie steht unter der Sternzeile.~~ **Widerrufen in 0.8.6**, siehe den
  eigenen Punkt weiter unten: die Liste war damit für **jeden** sichtbar, und
  das ist mehr, als eine Bewertung aussagen soll. Der Löschweg ist mit ihr
  gewandert — er ist der Grund, warum sie nicht ersatzlos verschwinden konnte.
- **Nur Werte > 0 sind Stimmen** (seit 0.8.2, dieselbe Regel wie überall). Eine
  zurückgesetzte Bewertung hinterlässt eine Zeile mit 0; sie erscheint weder in
  der Stimmenliste noch in den Zahlen des Löschdialogs. **Das weicht bewusst von
  `zaehleBestand()` in `auth.js` ab**, das ohne diese Bedingung zählt: dort
  lautet die Frage „was hängt an diesem Zugang", hier „was geht anderen
  verloren". Zwei Fragen, zwei Antworten — wer das für einen Fehler hält, hat
  eine der beiden nicht gelesen.
- **„Fremd" im Löschdialog meint die Sicht des Löschenden** (seit 0.8.2), nicht
  die des Verfassers. Die Frage, die der Dialog beantwortet, lautet „was nehme
  ich **anderen** weg". Löscht ein Admin einen fremden Eintrag, ist auch der
  Beitrag des Verfassers fremd — und genau diese Zahl soll dastehen. Verglichen
  wird mit `IS NOT`, nicht mit `!=`: eine herrenlose Zeile ist eine fremde und
  fiele sonst aus dem Vergleich heraus (Stolperstein 55).
- **Eine fremde Bewertung wird gelöscht, nie geändert** (seit 0.8.2).
  `DELETE /api/ratings/:id` steht hinter `darfAendern` — löschen darf der Admin,
  umschreiben niemand. Ein `PUT` auf denselben Pfad entsteht ausdrücklich nicht;
  eine Prüfung am Quelltext hält das fest. Die beiden älteren Bewertungswege
  bleiben ohne Wächter: sie treffen baulich nur die eigene Zeile. **Hier ist
  eine Klemme nötig, weil hier eine fremde Nummer in der Adresse steht.**
- **Die Zahlen für einen Löschdialog kommen aus einem Endpunkt, nicht aus dem
  geladenen Eintrag** (seit 0.8.2). Nur dort lassen sich eigene von fremden
  Beiträgen trennen; zwei Quellen für dieselbe Aussage wären zwei Wahrheiten.
  `GET /api/items/:id/bestand` ist lesend und steht deshalb nicht in `F_ROUTEN`
  — der Wächter `nurEintragVerfasser` steht trotzdem davor: wer nicht löschen
  darf, braucht die Zahlen nicht.
- **Jeder Kommentar sagt, ob er mir gehört** (seit 0.8.3). `mine` am Kommentar,
  dasselbe Muster wie am Testtag (0.7.0) und an der Stimme (0.8.2). Daran
  hängen fünf Bedienelemente; ohne die Angabe müsste die Oberfläche aus dem
  Verfasserobjekt zurückrechnen, wem eine Zeile gehört — und bei einem
  Grabstein (`name: null`) ginge das gar nicht.
- **Der Bildschirm bietet nicht an, was der Server abweist** (seit 0.8.3). Fünf
  Fälle, drei Antworten — die drei Spalten der Rechtetabelle: **✎ und „+ Bild"
  nur der Verfasser** (auch der Admin nicht), **✕ am Kommentar, ✕ am Bild und
  die drei Marken Verfasser oder Admin**. Ein Knopf, der zuverlässig eine
  Fehlermeldung erzeugt, sieht aus wie ein Fehler.
- **Anhängen ist Bearbeiten** (seit 0.8.3, ausdrücklich bestätigt). Ein Bild an
  einen fremden Kommentar hängt niemand, auch der Admin nicht — wer etwas
  beizutragen hat, schreibt einen eigenen Kommentar. Entfernen darf der Admin
  sehr wohl. „+ Bild" bekommt deshalb **keine eigene Klemme**: es steht
  ausschließlich im Bearbeitenmodus und fällt mit ✎ baulich weg; eine zweite
  Klemme daneben ließe sich nicht gegenprüfen.
- **Der Eingriffsvermerk am Kommentar ist die einzige Ausnahme von „kein
  Änderungsverlauf"** (seit 0.8.3). Er ist eine Aussage über den *jetzigen*
  Zustand: kein Wer, kein Wann, keine Kette. Hochgezählt **nur**, wenn ein
  anderer als der Verfasser ein Bild entfernt — wer bei sich aufräumt, greift
  in keine fremde Aussage ein. Eine herrenlose Zeile hat keinen Verfasser, also
  ist dort jeder Entfernende ein anderer. In der Antwort `bilderEntfernt`, in
  der Oberfläche eine eigene Angabe in der Kopfzeile, **nie im Textfeld** —
  dort täte der Admin genau das, was ihm verwehrt ist. Nicht zurücksetzbar,
  und **nicht im Export**: Kommentarbilder wandern nur mit `files=1`, ein
  Vermerk neben null Bildern wäre sinnlos, und er ist eine Aussage über
  Verwaltung in *dieser* Anlage. Formatnummer bleibt 6.
  **Seit 0.8.4 nennt der Satz die Rolle** — „2 Bilder vom Admin entfernt".
  Kein Feld dafür nötig: wer beide Klemmen an `DELETE
  /api/comment-images/:id` passiert (`darfAendern`, dann ein anderer als der
  Verfasser), kann nur der Admin sein. Der Satz ist deshalb nur so lange wahr,
  wie die Klemme genau dort steht — eine Prüfung am Quelltext bindet die
  Beschriftung daran. Der Vermerk bleibt für **alle** Leser sichtbar, nicht nur
  für den Verfasser: das Loch, das ein entferntes Bild hinterlässt, ist für
  jeden da, und ein Vermerk, den nur einer sieht, wäre eine Benachrichtigung —
  die hat Kriterion nicht.
- **`updated_at` ist eine Aussage über den Verfasser** (seit 0.8.4). Anhängen
  ist Bearbeiten, also ist Entfernen es auch — beides setzt jetzt „bearbeitet",
  aber **nur, wenn der Verfasser selbst** es tut. An `DELETE
  /api/comment-images/:id` gilt deshalb genau eines von beiden: der Vermerk
  beim Fremden, `updated_at` beim Verfasser, nie beides und nie keines (ein
  `if`/`else` um dieselbe Bedingung, nicht zwei getrennte). Der Eingriff eines
  Admins setzt `updated_at` **nie** — sonst sähe seine Löschung aus wie eine
  Bearbeitung durch den Verfasser, und genau das darf er nicht. Ein Ruf ohne
  Datei (`POST /api/comments/:id/images` ohne Anhang) setzt ebenfalls nichts:
  nichts angehängt heißt nicht bearbeitet. Unberührt bleibt „ein Merkmal
  umzuschalten ist keine Bearbeitung" — Anpinnen und Art setzen weiterhin
  nichts.
- **Die Zahlen am Kommentarblock nennen Teilmengen, keine Summanden** (seit
  0.8.4): „12 Kommentare, davon 3 Berichte und 5 Aufgaben (2 Erledigt)".
  „Davon", nicht Mittelpunkte — die Zahlen dahinter zählen dieselben
  Kommentare noch einmal aus einem anderen Blickwinkel, addiert ergäben sie
  mehr Kommentare, als es gibt. Die Klammer nistet die zweite Ebene ein: das
  Erledigte steckt **in** den Aufgaben, sonst schrumpfte die Zahl beim
  Abhaken. Eine Gruppe mit null verschwindet ganz, ohne Erledigte fällt die
  Klammer weg, ohne Kommentare bleibt der Hinweis ganz leer, wie bei den
  Links. **„Kommentar" bleibt eine feste Beschriftung** und wird kein
  zwölftes Vokabelwort — anders als Sache und Zeitpunkt verschiebt es sich
  nicht mit dem Gegenstand. Die **Notiz** bleibt ungenannt: sie ist der
  Zustand ohne Markierung und hat kein eigenes Wort. Die **Anpinnung** steht
  nicht in der Zeile: zweite, unabhängige Achse, zwei Achsen in einer Zeile
  wären nicht mehr lesbar. Derselbe volle Satz auch **eingeklappt** — der
  Kommentarblock weicht damit bewusst von Links und Dateien ab, die dort eine
  sehr kurze Kurzfassung tragen.
- **Ein Block hat genau eine Stelle für seine Zahlen** (seit 0.8.4, Muster
  aus dem Bau der vorigen Regel). `.block-head` trägt zwei mögliche Stellen:
  die Kurzfassung `.bsumme`, die nur eingeklappt erscheint, und einen freien
  Hinweis (`#lcount`, `#acount`, `#ccount`), der immer dasteht. Wer einem
  Block beide gibt, zeigt eingeklappt zweimal dasselbe. Der Kommentarblock
  trägt seine Zahlen ausschließlich im Hinweis; `blockZusammenfassung()`
  liefert für ihn deshalb leer, und eine leere Kurzfassung erzeugt keine
  leere Klammer mehr — „()" wäre eine Klammer um nichts.
- **Tags und Kategorien: anlegen darf jeder — abschaltbar** (seit 0.8.4).
  Zwei globale Schalter (`tagsFreiAnlegen`, `kategorienFreiAnlegen`), Vorgabe
  an, als **Ableitung beim Lesen** — kein Migrationscode, nichts, was zu 1.0
  zurückzubauen wäre. Aus heißt ausschließlich: die Zeile „+ neu anlegen"
  verschwindet, die Auswahl aus dem Vorhandenen bleibt (Kategorie) und die
  Wolke bleibt bedienbar (Tags am Eintrag). **Zuweisen darf immer jeder** —
  die Klemme sitzt an jedem der drei Anlegewege *hinter* dem Nachschlagen des
  vorhandenen Namens, nicht davor, sonst nähme sie das Zuweisen mit.
  **Der Admin kommt immer durch**, unabhängig vom Schalter: er räumt ohnehin
  auf, ein Schalter, den er erst umlegen müsste, um selbst anzulegen, wäre
  eine Schranke gegen sich selbst. **Der Sonderfall am Testtag:** dort gibt
  es keine Wolke, die Eingabe ist der einzige Zuweisungsweg und bleibt
  deshalb stehen; ein unbekannter Name wird dort mit sprechender Meldung
  abgewiesen.
- **Die Kennzahlen sieht nur der Admin** (seit 0.8.5). Nimmt „Die Kennzahlen
  selbst sieht weiterhin jeder" aus 0.7.2 **ausdrücklich zurück**. Sie sagen,
  wie groß der Bestand und wie belegt die Datenbank ist — eine Aussage über
  die **Anlage als Ganzes**, nicht über den Einzelnen. `GET /api/stats` trägt
  den Wächter in der Routenzeile. **Der Schlüsselwert im selben Rumpf bleibt
  eine zweite, engere Klemme** am Eigentümer; die beiden wurden ausdrücklich
  nicht zusammengelegt, und eine eigene Gegenprobe belegt, dass sie einander
  nicht zudecken.
- **Ein lesender Endpunkt kann einen Wächter tragen und steht trotzdem nicht
  in `F_ROUTEN`** (seit 0.8.2, mit 0.8.5 zum dritten Mal angewandt). Die Liste
  ist die Stelle, an der die Rechtefrage für **schreibende** Routen gestellt
  wird. Ein Wächter vor einer lesenden Route ist davon unberührt — die Zahl
  bleibt bei 46.
- **Was verschwindet, sind die Karten, nicht die Daten** (seit 0.8.5). Das
  Vokabular **ist** jede Beschriftung der Oberfläche, der interne Titel steht
  in der Kopfzeile — beide werden auch an einen gewöhnlichen Benutzer
  ausgeliefert. Weg ist nur, womit man sie ändern könnte. „Ansicht für
  Vokabular und Titel gar nicht" aus dem ersten Entwurf lässt sich nicht
  wörtlich einlösen und wurde nicht versucht.
- **Wer nicht verwalten darf, darf trotzdem nachsehen** (seit 0.8.5). Die
  Karten „Kategorien", „Tags" und „Bewertungskriterien" bleiben für jeden
  stehen; weg sind nur Griff, ✎ und ✕. Die Namen sind die Auswahl, aus der
  jeder am Eintrag schöpft — eine versteckte Karte nähme ihm die Übersicht
  über etwas, das er benutzt.
- **Drei Karten sind Selbstbezug und hängen an keiner Rolle** (seit 0.8.5):
  „Zugang" (der eigene Zugang), „Darstellung" (Schriftgröße, Zeitleiste,
  Blockanordnung) und „Links" (sichtbare Zeilen, Zahl der Anbieternamen).
  Alles persönlich, alles geht niemanden sonst etwas an.
- **Die Karte „Links" ist in zwei geschnitten** (seit 0.8.5). Sie mischte als
  einzige Karte des Systembereichs Persönliches mit Adminsachen. Der Schnitt
  folgt genau der Trennung, die der Server seit 0.6.5 hält: `linkZeilen` und
  `suchNamen` sind persönlich, `suche`, `sucheEigene` und `sucheAktiv` sind
  global. **Der Admin kuratiert, der Benutzer bestimmt die Dichte** — der Satz
  stand schon in `server.js` und hat seit 0.8.5 seine Entsprechung auf dem
  Bildschirm.
- **Eine Karte, die an einer Rolle hängt, nimmt ihre Behandler mit** (seit
  0.8.5). Zehn Behandler hingen blank an `document.getElementById(...)`; ohne
  ihre Karte ist das `null`, und die Zuweisung wirft **nach** dem Setzen von
  `app.innerHTML` — halb gezeichneter Bildschirm, keine Meldung. Ein Ort für
  die Frage (`amElement()`), nicht zehn. Siehe Stolperstein 88.
- **Der Umschalter der Vergleichsansicht ist Ansichtszustand, keine
  Einstellung** (seit 0.8.4) — im Speicher wie `linksOffen` und `wolkeOffen`,
  nicht in `user_settings`. Vorgabestellung **„alle"**: Kriterienwerte,
  Kopfzahl und Testtagzeile zeigen den Schnitt über alle Bewerter.
  **Kriterienwerte, Kopfzahl und Testtagzeile schalten gemeinsam** — sonst
  wäre es derselbe Widerspruch mit einem Knopf davor, den der Umschalter
  gerade auflösen soll. **Bei genau einem Zugang erscheint er nicht:** dann
  sind beide Stellungen dieselbe Zahl. Die Zahl für „meine" bildet der
  **Klient**: bei einem Bewerter hat jedes Kriterium höchstens eine Stimme,
  Stufe 1 des Zweistufenmittels ist also der eigene Wert — kein zweiter
  Rechenweg im Server, aber ein zweiter Rundungsort für eine *andere* Zahl.
- **Eine neue Spalte braucht beides: die DDL und einen Migrationsblock** (seit
  0.8.3). `CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht an
  (Stolperstein 13), und seit 0.8.1 gibt es keinen anderen Nachrüstweg mehr.
  Die Vorgabe greift für jede **Zeile**, aber nur dort, wo die **Spalte**
  existiert — der Entwurf zu 0.8.3 verwechselte das und behauptete „kein
  Migrationscode nötig". Die DDL bleibt trotzdem der Ort der Wahrheit: zu 1.0
  fällt der Block weg, die Spalte bleibt.
- **Der Knopf trägt die Farbe der Kante, die er setzt** (seit 0.8.3).
  Klarstellung zu „Orange ist Art und Bedienung", keine Rücknahme: die **Art**
  hat drei Farben — Orange für den Bericht, Blau für die Aufgabe, Grün für
  erledigt —, und der eingeschaltete Knopf zeigt jeweils dieselbe. Bis 0.8.2
  fiel der offene Aufgabenknopf auf `.mark.on` zurück und war orange neben
  einer blauen Kante. Orange bleibt die Farbe aller übrigen Marken.
- **Eine eingeklappte Wolke ist nicht messbar, und dagegen braucht es zwei
  Wege** (seit 0.8.3). In einem `display: none`-Block ist `offsetHeight` null;
  `begrenzeWolke()` setzte daraus eine winzige feste `maxHeight`, die nach dem
  Aufklappen stehenblieb. Beide Wege sind nötig und decken einander **nicht**
  zu: die Messung bricht bei Höhe null ab **und** das Aufklappen zeichnet die
  Wolke neu. Stolperstein 14 in neuer Gestalt.

- **Wer welchen Wert vergeben hat, sieht nur der Admin** (seit 0.8.6). Nimmt
  den sichtbaren Teil der Stimmenliste aus 0.8.2 **ausdrücklich** zurück: die
  Sternzeile zeigt den **eigenen Wert und den Schnitt**, mehr soll eine
  Bewertung nicht aussagen. Die Namensliste ruft der Admin über den Knopf „Wer
  hat bewertet" im Blockkopf auf — eine eigene Ansicht, kein Aufklapper an der
  Zeile. **`avg` und `count` bleiben unangetastet:** der Schnitt und die Zahl
  der Bewerter sind keine Aussage über eine Person.
  **Geliefert wird sie auch nicht mehr** (Stolperstein 79): `detail()` hängt
  keine `stimmen` mehr an die Kriterienzeilen, sonst hinge die Regel daran,
  dass die Oberfläche mitspielt. Der eigene Endpunkt
  `GET /api/items/:id/stimmen` ist lesend, trägt `nurAdmin` in der Routenzeile
  und steht **nicht** in `F_ROUTEN`.
  Der Knopf hängt an `ADMIN && mehrereBenutzer()`: bei einem Zugang wäre die
  Ansicht der eigene Wert ein zweites Mal — dieselbe Schwelle wie bei der
  Durchschnittsspalte, und sie steht ausschließlich in der Oberfläche.
  *Verworfen:* eine anonyme Werteliste („3 · 4 · 2" ohne Namen). Der Admin
  wüsste dann nicht, wessen Bewertung er entfernt, und für alle anderen wäre es
  eine Zahlenreihe ohne Aussage.
- **Wer eine Anzeige einschränkt, prüft zuerst, was an ihr hängt** (seit
  0.8.6). `DELETE /api/ratings/:id` ist bei alldem **unverändert** geblieben,
  samt `darfAendern` und seiner Zeile in `F_ROUTEN`; geändert hat sich nur, von
  wo aus er gerufen wird. Wäre die Liste ersatzlos verschwunden, wäre der
  Endpunkt vom Bildschirm aus unerreichbar gewesen — die neue Ansicht ist
  deshalb kein Zusatz, sondern die Bedingung.
- **Eine Liste wird abgeschnitten, nicht scrollbar** (seit 0.8.6). Ein eigener
  Bildlauf in einer Liste fängt auf dem Finger die Wischbewegung ab: wer die
  Seite herunterzieht und dabei über die Liste kommt, scrollt plötzlich nur
  noch die Liste. Der Weg zum Rest ist der Aufklappknopf, den es längst gibt.
  Gilt für die Linkliste (`begrenzeLinks()`) und die beiden Tagwolken
  (`begrenzeWolke()`) — die Wolken waren schon immer so gebaut, die Prüflage
  steht seit 0.8.6 trotzdem daneben. *Verworfen:* eine Haltezeit wie beim
  Ziehen — beim Scrollen unüblich, und sie verzögerte jedes Wischen um 0,4 s.
- **Eine breite Karte im Raster braucht `grid-auto-flow: dense`, keine feste
  Position** (seit 0.8.6). Wie viele Karten in eine Zeile passen, hängt an der
  Fensterbreite (`auto-fit`), wie viele es gibt, an der Rolle — eine Position,
  die bei drei Spalten stimmt, ist bei zwei falsch. Das Raster zieht eine
  nachfolgende schmale Karte selbst in die Lücke. **Die Reihenfolge im
  Quelltext bleibt, wie sie ist**, und eine Prüfung hält genau das fest; die
  Ersatzlösung „Kachel ans Ende" ist damit ausdrücklich nicht gebaut.
- **„Angemeldet als" steht auch bei einem einzigen Zugang** (seit 0.8.6). Das
  unterscheidet die Angabe von allem, was `mehrereBenutzer()` verbirgt: dort
  geht es immer um **andere**, hier um einen selbst — derselbe Grund, aus dem
  die Karte „Zugang" seit 0.8.5 für jeden stehenbleibt. Der Name kommt über
  `GET /api/settings`, weil `ladeEinstellungen()` in `start()` läuft und die
  Angabe damit überall bereitsteht (Stolperstein 16). Dass er auch unter
  `GET /api/account` steht, ist **keine zweite Wahrheit**: beide Antworten
  lesen dieselbe angemeldete Zeile. Nach dem Umbenennen des eigenen Zugangs
  zieht die Kopfzeile nach — `ladeEinstellungen()` läuft nur beim Start.
- **„Angelegt von" nennt auch das Datum** (seit 0.8.6), in derselben Form wie
  die Kopfzeile eines Kommentars. Zwei Schreibweisen für denselben Zeitpunkt
  wären eine zu viel. Bei genau einem Zugang bleibt die **ganze Zeile** weg wie
  bisher — dann steht das Datum schon in der Sortierung.

- **„Löschen entwertet, es löscht nicht" gilt Benutzern — beim Eintrag gilt das
  Gegenteil, und der Papierkorb ändert daran nichts** (seit 0.8.70). Ein
  gelöschter Eintrag ist **wirklich weg**: kein `geloescht`-Zustand an `items`,
  kein `WHERE`-Zusatz irgendwo. Er liegt nur **zusätzlich** noch als Paket
  daneben, in einer Tabelle, die keine bestehende Abfrage anfasst. *Die Form
  ist hier wichtiger als die Idee* — ein Zustand an `items` berührte jede
  Abfrage im ganzen System, und jede vergessene Stelle wäre ein stiller Fehler.

- **Wiederherstellen legt einen NEUEN Eintrag an** (seit 0.8.70). Die alte
  Nummer ist weg, und daran hängt nichts mehr. Der Weg geht durch den **Import**
  und erfindet dessen Regeln nicht neu: ein genannter Name, den es gibt, wird
  zugeordnet — **ein Grabstein wird dabei gefunden**, seine Zeile in `users`
  steht ja noch —, alles andere fällt an den Wiederherstellenden und wird
  **genannt**.

- **`geloescht_von` ist kein Träger wie `items.user_id`** (seit 0.8.70). Es ist
  die Feststellung eines **Vorgangs**, so wie `created_at`; daran hängt kein
  Recht und kein Filter. Die Spalte gehört deshalb ausdrücklich **nicht** in
  `ordneBestandZu()`: das Auffangnetz beantwortet, wem herrenloser **Bestand**
  zufällt, und hier stillschweigend den Eigentümer einzusetzen machte aus einer
  Feststellung eine **Falschaussage**. Es gibt damit **sieben** Spalten mit
  `user_id`-Charakter, aber weiterhin **sechs** im Auffangnetz.

- **Der Titel steht im Papierkorb absichtlich zweimal** (seit 0.8.70) — als
  eigene Spalte und im Paket. Er steht dort, damit die Liste lesbar ist, ohne
  jede Zeile zu entpacken. **Eine zweite Wahrheit kann daraus nicht werden:**
  das Wiederherstellen liest ausschließlich `inhalt` und die Spalte nie.

- **Eine Exportdatei ist EIN String, und der hat eine Grenze** (seit 0.8.70,
  gemessen). `MAX_STRING_LENGTH` ist 536.870.888 (512 MB); zwanzig Videos zu je
  20 MB sind als Base64 533 MB, und `JSON.stringify` antwortet mit
  `RangeError: Invalid string length`. **Zippen hilft nicht** — der String
  entsteht davor. Daraus folgt die Bauform des Papierkorbs: die Bytes gehen an
  der JSON **vorbei** in eine Nebentabelle. **Vorgabe für Teil II des
  Videopapiers:** eine Datei über rund 950 MB passt auch dort nicht in eine
  Zelle und teilt sich auf mehrere `nr` auf.

- **Die Abbildung je Eintrag und der Deserialisierer stehen je genau einmal**
  (seit 0.8.70). Bis dahin lagen beide mitten in ihren Routen. Jetzt rufen drei
  Stellen `eintragAlsPaket()` und zwei `spieleEin()`; ein Wächter über den
  Quelltext hält beide Zahlen fest. *Zwei Rechenwege für dieselbe Datei laufen
  auseinander.*

- **`VACUUM INTO` ist der Sicherungsweg, der JSON-Export der Austauschweg**
  (seit 0.8.70), und **die Rollenteilung steht an beiden Karten**, nicht nur in
  den Dokumenten. Die Kopie ist vollständig und konstant im Speicherbedarf,
  überlebt aber keinen Formatwechsel und ist ohne den Schlüssel wertlos; der
  Export ist unvollständig, baut die ganze Datei im Arbeitsspeicher und
  überlebt beides. **Einen dritten Weg gibt es nicht:** `db.backup()` liefe
  schrittweise, scheitert an einer SQLCipher-Datenbank aber an der
  Zieldatenbank ohne Schlüssel (Stolperstein 117).

- **Wohin geschrieben wird, entscheidet der aufgelöste Pfad** (seit 0.8.70).
  Der Sicherungsort ist zweistufig: die Wurzel kommt aus der Umgebung und ist
  über die Oberfläche nicht erreichbar, das Unterverzeichnis darunter geht
  durch eine **Positivliste** und danach durch `realpathSync`. Erst dort fällt
  ein Symlink auf, der aus der Wurzel herausführt (Stolperstein 120). **Ein
  Verzeichnis, das es nicht gibt, ist eine Absage mit Begründung — kein stilles
  Anlegen.**

- **Eine Sicherung entsteht unter einem Arbeitsnamen und wird erst danach
  umbenannt** (seit 0.8.70). Stolperstein 8 verlangt, eine halbfertige
  Zieldatei nach einem Fehlschlag zu entfernen; das hier ist eine Stufe
  schärfer: **der Fall entsteht gar nicht.** Eine halbfertige Kopie trägt nie
  den endgültigen Namen, fällt damit aus dem Muster heraus, nach dem „letzte
  Sicherung" sucht, und kann selbst dann nicht als fertige Sicherung gelesen
  werden, wenn das Aufräumen scheitert. **Entfernt wird ausschließlich der
  Arbeitsname** — ein Aufräumen, das die endgültige Datei träfe, würfe im
  Zweifel die Sicherung des Vortags weg. *Gefunden hat das eine Gegenprobe, die
  stumm blieb:* die alte Fassung räumte hinterher auf, und keine einzige
  Prüfung deckte es.

- **Der Sicherungsort und seine Einhängung stehen in derselben Datei**
  (seit 0.8.70). Beide Hälften gehören in die `docker-compose.yml`; stünde die
  eine in der `.env`, liefen sie auseinander, und die Anlage schriebe in eine
  Schicht des Containers, die beim nächsten `--build` verschwindet.

- **„Sicherung", nicht „Backup"** (seit 0.8.70). Beide Wörter sind
  gebräuchlich; zwei für dieselbe Sache sind genau das, was die Sprachregel aus
  Abschnitt 12 verhindern soll. Das Projekt sagt seit jeher „Sicherung" — im
  Einspielweg, im Stufenplan, im Ideenpapier. **Nicht** in der Wortliste des
  Sprachwächters: sie soll kurz bleiben, und das hier ist keine Übersetzung,
  sondern eine Wahl zwischen zwei deutschen Wendungen. Ein eigener, enger
  Wächter über die ausgelieferten Dateien hält sie fest.

---

- **Benannt statt verboten — die Lage des Sicherungsorts** (seit 0.8.71). Der
  Riegel gegen den Sicherungsort **im Datenverzeichnis** bleibt eine Absage:
  dort läge die Kopie in dem Verzeichnis, das sie schützen soll. Der Ort **im
  Arbeitsverzeichnis** ist eine Stufe milder und wird deshalb **erlaubt und
  angezeigt** — roter Kasten mit Grund, grüner Kasten daneben, wenn er
  außerhalb liegt. Zwei Gründe: eine Sicherung am falschen Ort ist besser als
  keine, und der **Auslieferungszustand ist selbst dieser Fall** — ein Riegel,
  den die eigene Vorgabe verletzt, wäre absurd. *Wo eine Lage schlechter, aber
  nicht falsch ist, gehört sie benannt und nicht verboten.*
- **Die Lage gilt für die Wurzel, nicht für das Unterverzeichnis** (seit
  0.8.71). `imArbeitsverzeichnis` wird an `SICHERUNG_DIR` gemessen und nicht am
  in der Oberfläche gewählten Zielort: es ist eine Eigenschaft der
  **Einrichtung**, nicht der Einstellung. Deshalb steht die Auskunft auch dann
  da, wenn der gewählte Zielort gerade einen Fehler meldet.
- **Ein Schalter kann nichts tun, während nichts läuft** (seit 0.8.71). Der
  Vorschlag, den Sicherungsordner beim Einspielen einer neuen Version über eine
  Einstellung in der `.env` verschieben zu lassen, ist verworfen: zu diesem
  Zeitpunkt ist `docker compose down` längst gelaufen, und ein Schalter würde
  von einem Prozess gelesen, den es nicht gibt. Ein eigenes Skript im Repo
  stünde als **zweite Wahrheit** neben dem Weg in der README (Stolperstein 47).
  Der Weg trägt ohnehin schon `data/` und `.env` hinüber — ein Drittes ist
  **eine Zeile in derselben Liste**.

---

- **Ein Token wird nachgeschlagen, ein Passwort verglichen** (seit 0.8.80).
  Deshalb SHA-256 **ohne Salz** statt scrypt, und deshalb steht dort **kein**
  zeitunabhängiger Vergleich. scrypt schützt **ratbare** Geheimnisse; 256 Bit
  aus dem Zufallsgenerator sind keins. Mit Salz je Zeile wäre der Hash nicht
  nachschlagbar — der Server müsste bei jedem Versuch jede Zeile durchrechnen,
  auf einer Route **vor** der Anmeldung. *Die Wahl des Hashverfahrens folgt dem
  Gegenstand, nicht der Gewohnheit des Projekts.*
- **Der Link ist ein Passwortersatz auf Zeit, und das steht am Bildschirm**
  (seit 0.8.80). Weil Mailversand erst Stufe I ist, gibt der Admin ihn von Hand
  weiter; danach steht er in einem fremden Verlauf. Sieben Tage, genau einmal,
  alle Sitzungen fallen beim Einlösen. **Wer ihn kopiert, liest das an genau
  der Stelle** — nicht bloß in einem Dokument.
- **Beim Einlösen fällt ALLES Offene dieses Zugangs** (seit 0.8.80), nicht nur
  der eine Link. Läge noch ein älterer in einem fremden Verlauf, setzte er
  hinterher ein zweites Mal ein Passwort — „einmal gültig" wäre dann nur für je
  einen Link wahr, nicht für den Vorgang. Dasselbe beim **Sperren** und beim
  **Entfernen**: ein offener Link, der eine frische Sperre überlebte, wäre ein
  Weg an ihr vorbei.
- **Eine Absage vor der Anmeldung sagt nur, was zu tun ist** (seit 0.8.80).
  Abgelaufen, schon benutzt, erfunden, gesperrt — vier Lagen, **eine**
  Meldung, weil das Heilmittel dasselbe ist. *Wo verschiedene Ursachen
  denselben nächsten Schritt haben, ist die Unterscheidung nur eine Auskunft an
  den, der rät.* Der Preis gehört dazu und wird nicht verschwiegen: ein
  Tippfehler in der Adresse sieht aus wie ein abgelaufener Link.
- **„Noch kein Passwort" ist abgeleitet, kein vierter Zustand** (seit 0.8.80).
  `ZUSTAENDE` hat drei, und jede Stelle, die `status` liest, kennt sie.
  Abgeleitet wird aus `password_hash = ''` — dem Wert, über den auch die
  Anmeldung entscheidet — und **nicht** aus `last_login IS NULL`: das
  beantwortet „hat sich noch nie angemeldet", und das ist etwas anderes als
  „kann sich nicht anmelden". *Der Grabstein trägt denselben leeren Hash; er
  ist über `status` unterschieden und wird nie als „eingeladen" gelesen.*
- **Der Link und der Schlüssel sind zwei Wege, nicht einer mit zwei
  Beschriftungen** (seit 0.8.80). Der Link übergibt das **Recht, ein Passwort
  zu setzen**, der direkte Weg übergibt ein **Passwort**. Der zweite kommt ohne
  den Browser des anderen aus. Deshalb ist das **kein** Fall von Stolperstein
  47, und deshalb stehen beide in der Karte — der Link zuerst.
- **Eine Betriebsart steht als Wahl im Formular, nicht in der Frage, welchen
  Knopf man drückt** (seit 0.8.80, nachgebessert aus dem Betrieb). Beim Anlegen
  eines Zugangs standen zuerst **zwei Knöpfe** nebeneinander; damit musste man
  beide Beschriftungen lesen, um zu wissen, was gleich geschieht, und das
  Passwortfeld stand auch dann da, wenn es gar nicht galt. Jetzt sagt ein
  Auswahlfeld die Betriebsart, das Passwortfeld erscheint **nur zu ihr** — und
  wird beim Zurückwechseln geleert —, und **ein** Knopf trägt die Folge im
  Namen. *Ein Feld, das gerade nicht gilt, ist kein Feld;* dieselbe Überlegung,
  aus der ein Knopf fehlt, wo er zuverlässig eine Fehlermeldung erzeugte.
- **Eine Sitzung wird über eine gerechnete Kennung adressiert, nie über ihren
  Token** (seit 0.8.80). Der Token ist Primärschlüssel **und** Geheimnis; in
  einem Pfad stünde er im Zugriffsprotokoll, in der Verlaufsliste und womöglich
  im Referrer. Die Kennung ist sein voller SHA-256 — **gerechnet und nirgends
  gespeichert**, damit weder ein Schema noch eine Frage nach Eindeutigkeit
  entsteht. Dieselbe Überlegung trägt die Einlöseseite: der Schlüssel steht im
  **Fragment** der Adresse und geht damit nie an den Server.
- **Die Anlage speichert weiterhin weder IP-Adresse noch Browserkopf**
  (bestätigt in 0.8.80). „Meine Sitzungen" könnte damit mehr sagen — und sagt
  stattdessen offen, dass sie das Gerät nicht kennt. *Eine Karte, die mehr
  behauptet, als sie weiß, ist schlimmer als keine.* Was sie trägt, ist die
  **Zahl** und **ein Knopf**.
- **Der Server gibt den Token heraus, den Link baut der Browser** (seit
  0.8.80). Damit stellt sich die Frage nach einer öffentlichen Adresse in
  dieser Stufe gar nicht, und aus dem `Host`-Kopf wird nichts abgeleitet — über
  einen gefälschten Kopf ließe sich ein Link sonst auf einen fremden Server
  umbiegen. Der Browser des Admins steht ohnehin an der richtigen Adresse.
- **„Token" im Quelltext, „Link" am Bildschirm** (seit 0.8.80). Dieselbe Form
  wie bei „Sicherung": **nicht** in die Wortliste des Sprachwächters — „Token"
  ist kein übersetztes Lehnwort, sondern der Fachbegriff —, sondern ein enger
  eigener Wächter über `public/app.js`, denn diese Datei **ist** der
  Bildschirm.

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

Die Kurzform: je ein Kernsatz und die Lehre. Die ausführlichen Herleitungen
stehen in den Revisionen 1 und 2 dieses Blatts; die Nummern gelten weiter und
werden im Quelltext nicht mehr zitiert, wohl aber in Gesprächen.

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
    Durchgehen von Abschnitt 3a des Videopapiers, vor dem Bauen.

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

---

## 7. Prüfstand

Der Prüfstand liegt als `pruefung.js` im Quelltext und läuft über `npm test`.
Er legt echte Server mit echten, verschlüsselten Datenbanken in
Wegwerfverzeichnissen an — `data/` bleibt unangetastet, und **alle Anlagen
entstehen frisch** über Einrichtungsseite und Verwaltung; einen präparierten
Altbestand gibt es seit 0.8.1 nicht mehr. Die Oberflächenprüfungen brauchen
`jsdom` (Entwicklungsabhängigkeit; per `.dockerignore` und `--omit=dev`
außerhalb des Docker-Images).

**Zuletzt: 2903 von 2903 bestanden** (0.8.90; **237 neue Prüfungen, 24
Gegenproben, elf neue Gruppen**: „Das Sicherheitsprotokoll: die Tabelle legt
sich selbst an", „… eine Zeile je Vorgang", „… kein Geheimnis in einer Zeile",
„… die Frist an beiden Seiten", „… das Aufräumen an beiden Aufrufstellen",
„… wer es sehen darf", „Die zweite Bestätigung: die Freigabe selbst",
„… jeder schwere Weg einzeln", „… was NICHT dahinter liegt", „… die Bremse
greift auch dahinter", „Die öffentliche Adresse: die Prüfung des Werts",
„… beide Zustände am Server", „zugang.js schreibt ins Sicherheitsprotokoll" und
die drei Oberflächengruppen. Die übrigen sind Erweiterungen vorhandener
Gruppen: `F_ROUTEN` samt Zahl und der neuen Art `'zweitbestaetigt'`, der
Wortwächter über „Protokoll", der Wächter gegen „Re-Authentifizierung" in
ausgelieferten Dateien, der Wächter, dass keine Zeile den Anfragerumpf ausgibt,
und die Kartenzahl im Systembereich.
**Die Gegenproben haben zwei Befunde gebracht** — Stolperstein 129 und 130.
Davor 0.8.80; 263 neue Prüfungen, 40 Gegenproben, vierzehn neue Gruppen.
Davor 0.8.71; 17 neue Prüfungen, 6
Gegenproben, **keine neue Gruppe** — die Lage des Sicherungsorts gehört zu dem,
was schon geprüft wird, und eine eigene Gruppe hätte sie davon getrennt.
Serverseitig liefert `GET /api/sicherung` das Feld `imArbeitsverzeichnis` in
**beiden** Lagen, gefahren an zwei echten Servern; in der Oberfläche wird zu
jeder Farbe geprüft, dass die **andere** gerade nicht dasteht; und ein Wächter
liest die `docker-compose.yml` selbst — Einhängung und Variable dürfen nicht
auseinanderlaufen, und `./` draußen muss `/app` drinnen heißen. Davor 0.8.70;
294 neue Prüfungen, neun neue Gruppen: „Der Papierkorb: die Tabelle
legt sich selbst an", „Der Papierkorb: der Rundlauf", „Der Papierkorb: dieselbe
Transaktion", „Der Papierkorb: die dreissig Tage", „Der Papierkorb: die
Rechte", „Ein einzelner Eintrag als Datei", „Die Sicherung auf Knopfdruck",
„Der Papierkorb in der Oberflaeche" und „Die Sicherung in der Oberflaeche";
dazu Ergänzungen an „Der Waechter ueber den Quelltext", „Der Systembereich nach
Rolle", „Kommentare in der Oberflaeche" und am Mock in `baueDom`).
Davor 0.8.60 mit 134 neuen Prüfungen, 0.8.50 mit 146, 0.8.40 mit 125, 0.8.31
mit 58 und 0.8.30 mit 76.

**Es gibt jetzt FÜNF Migrationsabschnitte**, und alle tragen dieselbe Marke.
Der Abschnitt **„MIGRATION 0.8.3 — ENTFAELLT MIT 1.0"** mit sieben Prüfungen
steht unverändert: er stellt eine Datenbank aus 0.8.2 nach — dieselbe Anlage,
nur ohne die neue Spalte und mit einer Zeile darin — und belegt, dass der
Migration sie ergänzt, dass die Bestandszeile auf der Vorgabe null steht, dass
ein zweiter Lauf stumm bleibt und dass eine **frische** Anlage die Spalte ohne
Migration trägt.

Der Abschnitt **„MIGRATION 0.8.30 — ENTFAELLT MIT 1.0"** mit elf Prüfungen ist
nach demselben Muster gebaut, aber die Prüflage muss mehr können: sie stellt
eine Datenbank aus 0.8.20 nach und ist **so eingerichtet, dass die falsche
Antwort auffällt** — der Eintrag gehört `bert`, Eigentümerin ist `chefin`.
Fielen die Bestandszeilen an den Eigentümer statt an den Eintragsverfasser,
stünde dort `chefin`. Eine dritte Linkzeile hängt an einem Eintrag, der selbst
herrenlos ist: sie kann die Migration nicht füllen und fällt danach dem
Auffangnetz zu. **Damit sind beide Regeln an einem Lauf zu sehen.** Dazu die
Gegenlage, dass der Index auf `links` sich beim Start selbst nachlegt, während
die Spalte es nicht täte.

Der Abschnitt **„MIGRATION 0.8.40 — ENTFAELLT MIT 1.0"** stellt eine Datenbank
aus 0.8.31 nach — dieselbe Anlage, nur ohne die Spalte `gewicht`, mit drei
Kriterien und **mit Bewertungen daran**. Die Frage nach einem Verfasser stellt
sich hier nicht; ein Gewicht kann nicht herrenlos werden. Belegt wird: die
Spalte kommt dazu, die Bestandszeilen stehen auf **1,0**, die Vorgabe kommt
aus dem `DEFAULT` und nicht aus einem `UPDATE` (am Quelltext nachgesehen),
`ordneBestandZu()` kennt `rating_criteria` gar nicht, ein zweiter Lauf bleibt
stumm, ein von Hand gesetztes Gewicht überlebt den nächsten Start, und eine
**frische** Anlage trägt die Spalte ohne Migration. Dazu die eigentliche
Zusicherung der Runde, an derselben Anlage nachgerechnet: **der gewichtete
Gesamtschnitt ist nach der Migration derselbe wie der ungewichtete davor.**
Und die Gegenlage, dass migrierte und frische Anlage die Spalte **gleich**
bauen — geprüft am Verhalten, nicht am DDL-Text (Stolperstein 106).

Der Abschnitt **„MIGRATION 0.8.50 — ENTFAELLT MIT 1.0"** stellt eine Datenbank
aus 0.8.40 nach — dieselbe Anlage, nur ohne `art` und `dauer` an `photos`, und
**mit Fotos darin**; eine leere Tabelle bewiese nichts über die Vorgabe. Die
Frage nach einem Verfasser stellt sich auch hier nicht: ein Foto gehört seinem
Eintrag, nicht einem Verfasser, und `ordneBestandZu()` kennt `photos` gar
nicht. Belegt wird: beide Spalten kommen dazu, die Bestandszeilen stehen auf
`'bild'` und `NULL`, die Vorgabe kommt aus dem `DEFAULT` und nicht aus einem
`UPDATE` (am Quelltext nachgesehen), ein zweiter Lauf bleibt stumm, und eine
**frische** Anlage trägt beide Spalten ohne Migration. **Dazu die Probe, die
diesen Abschnitt von den vier davor unterscheidet: jede der beiden Spalten
wird EINZELN nachgerüstet** — zwei weitere Prüflagen, in der einen fehlt nur
`art`, in der anderen nur `dauer`. Und die Gegenlage, dass migrierte und
frische Anlage die Spalten **gleich** bauen, geprüft am Verhalten statt am
DDL-Text (Stolperstein 106): `art` ist `NOT NULL` mit Vorgabe `'bild'`, `dauer`
darf leer bleiben, und eine dritte Art geht in der Datenbank durch — es gibt
**keinen `CHECK`**, die Menge der erlaubten Werte steht allein im Server.
Dass der Index auf `photos` unverändert der eine von vorher ist, steht
daneben; ein Index über `art` brächte nichts.

**Die Probe „Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start" gehört
allen fünf Blöcken** und ist erweitert worden, nicht verdoppelt: sie steht im
Abschnitt von 0.8.31 und trägt jetzt auch eine Fototabelle ohne die beiden
neuen Spalten.

**Der Index auf `sessions.user_id` ist der Beleg dafür, dass ein Index kein
Migration ist** (0.8.20, nachgestellt statt geglaubt): Der Prüfstand entfernt
ihn von Hand aus einer bestehenden Anlage, startet den Server einmal — und er
ist wieder da. `CREATE INDEX IF NOT EXISTS` rüstet sich bei jedem Start selbst
nach, anders als eine neue **Spalte**, die `CREATE TABLE IF NOT EXISTS` in
einer vorhandenen Tabelle nie nachträgt. Dass der Abfrageplaner ihn auch nimmt,
prüft `EXPLAIN QUERY PLAN` daneben.

**Und seit 0.8.70 steht dieselbe Probe für eine ganze TABELLE daneben**, in der
eigenen Gruppe „Der Papierkorb: die Tabelle legt sich selbst an": `papierkorb`
und `papierkorb_bytes` werden von Hand entfernt, der Server startet einmal, und
beide sind wieder da — samt Spalten und Index. **Die Gegenlage gehört dazu:**
eine von Hand entfernte **Spalte** (`items.description`) kommt **nicht** von
selbst zurück. Damit ist Stolperstein 13 an einem Lauf von beiden Seiten
belegt, und **es bleibt bei fünf Migrationsabschnitten**: 0.8.70 hat keinen
bekommen, weil es keinen Block gibt. Die Probe „Ein Sprung von 0.8.20 fährt
ALLE Migrationen in einem Start" ist deshalb **nicht** erweitert worden.

**Was abgedeckt ist**, grob nach Bereichen:

- **Start und Erstanlage:** frische Installation, Einrichtungsseite,
  Zugangswechsel, Anmeldebremse und die Ablehnung von `AUTH_RESET` — auf
  eigenen Servern mit eigenen Datenverzeichnissen.
- **Zugangsverwaltung:** ein eigener Server, auf dem die Zugänge **über die
  Verwaltung selbst** entstehen. Fünf Rollen- und Statuslagen nebeneinander,
  jede Verweigerung mit ihrem Erfolgsfall daneben und der Nachschau in der
  Datenbank. Dazu **`zugang.js` als echter Prozess:** der Befehl wird mit
  geröhrter Eingabe gefahren, seine Rückfragen werden beantwortet, danach
  wird die Datenbank angesehen (Stolperstein 77).
- **Kriterien:** anlegen, umbenennen, sortieren, löschen, lückenlose
  Nummerierung, Wirkung auf Detailansicht und Vergleich.
- **Die Gewichtung (0.8.40):** der Rechenweg an einer Lage mit **drei
  Bewertern und ungleich vielen Stimmen je Kriterium** — ohne das belegte die
  wichtigste Prüfung der Runde zu wenig. Darin: alle Gewichte 1 ergeben den
  ungewichteten Schnitt (die Gegenzahl wird aus den Zeilenwerten der Antwort
  nachgerechnet, nicht hingeschrieben); ein unbewertetes Kriterium bringt sein
  Gewicht **nicht** in den Nenner, auch nicht in der schärfsten Lage, in der
  ein einziges bewertetes Kriterium bei Gewicht 0,2 gegen drei unbewertete bei
  Gewicht 2 steht; alle Werte 5 bei gemischten Gewichten ergeben **genau**
  5,0, alle Werte 1 **genau** 1,0; ein Gewichtswechsel dreht die Rangfolge der
  Übersicht und rührt `updated_at` **nicht** an. Dazu die Gültigkeit — zehn
  Abweisungen mit 400, darunter `0`, alles Negative und `Infinity`, jede mit
  der Nachschau, dass der alte Wert unverändert dasteht; die Rundung auf
  Hundertstel; das Komma in der Meldung; und die Klemme mit **zweiter
  Sitzung**: ein Benutzer bekommt 403, der Admin kommt durch, und nach dem 403
  steht der alte Wert in der Datenbank.
- **Die Gewichtung in der Oberfläche:** die Marke `×1,5` an drei Orten samt
  **zwei Gegenlagen** — alle Gewichte auf 1 (dann steht nirgends etwas), und
  ein Gewicht ≠ 1 an einem Kriterium, das **niemand bewertet hat** (dann steht
  die Marke an der Zeile, aber nicht das Wort „gewichtet" am Kopf). Das
  Eingabefeld wird über ein **wirklich zugestelltes `change`-Ereignis**
  bedient, nicht über einen Aufruf von `onchange`; geprüft sind Komma und
  Punkt, die sichtbare Rundung, das leere Feld (das gar nichts schickt), die
  Rückstellung nach einer Absage, dass die Liste **nicht** neu gezeichnet wird
  und dass ein offenes Umbenennen daneben überlebt. Dazu, dass das Feld an der
  Kriterienkarte steht und an den Karten „Kategorien" und „Tags" **nicht** —
  `manage()` zeichnet alle drei.
- **Export und Import** in beiden Richtungen, auch mit alten Exportdateien
  ohne die neueren Felder, samt Rundlauf durch drei Verfasser. **Seit 0.8.50
  auch mit Videos:** beide Schalterstellungen, die Marke ohne Bytes, der
  Rundlauf mit Videodatei **und Standbild**, ein unlesbares Standbild, das
  übergangen und genannt wird, und eine ältere Datei ohne `art`, in der alles
  ein Bild ist.
- **Oberfläche im echten DOM (`jsdom`):** mitwachsende Felder, Reihenfolge
  und Sichtbarkeit der Blöcke, Vergleichsansicht, Sternenzeile mit eigenem
  und gemitteltem Wert. **Der Favoriten-Stern bekommt ein wirklich
  zugestelltes Klickereignis** — ein Fehler hinter einem `await` bleibt im
  nur gebauten DOM sonst grundsätzlich unsichtbar (Stolperstein 61).
- **Videos (0.8.50):** ein echtes MP4 und eine echte WebM werden hochgeladen,
  und angesehen wird der **ausgelieferte Bytestrom samt Header** — Typ,
  `Content-Disposition: inline`, der Name mit der Endung des *erkannten* Typs,
  `nosniff`, die Sicherheitsregel ohne `allow-scripts`. Dazu: eine Datei mit
  **falscher Endung und Videobytes** kommt herein, eine mit Videoendung und
  Bildbytes nicht — der Inhalt entscheidet. `size=thumb` und `size=medium`
  liefern an einer Videozeile ein **Bild**, ohne Größe die **Videodatei**,
  bytegleich. Die **Ranges** mit `206`, `Content-Range`, offenem Ende,
  Suffix und zwei Absagen mit `416`; ein **Foto bietet weiterhin keine an**
  und beantwortet einen Range mit dem ganzen Bild. Eine unbekannte ISO-Marke
  aus dem Bestand geht als Download heraus. Und: das Nachrüsten der
  Vorschaubilder lässt das Standbild eines Videos in Ruhe, tut am Foto daneben
  aber weiterhin seine Arbeit.
- **Dateien:** jede einzelne Schicht der Sicherheitsregel aus Abschnitt 5a —
  dafür lädt der Prüfstand eine echte HTML-Seite mit Skript und eine
  SVG-Datei hoch und sieht sich der Header der Antwort an. Die
  `.docx`-Vorschau wird an einer selbst gebauten, echten `.docx` geprüft.
- **Suchanbieter:** neun Plätze, Auswahl, Startanbieter, Nachrücken, die
  Schranken der Vorlage einzeln.
- **Mehrbenutzerbetrieb und Rechte:** mehrere echte Rufer nebeneinander
  (Stolperstein 56); jede Verweigerung einzeln, jede mit dem Erfolgsfall
  daneben **und** der Nachschau, dass wirklich nichts geschrieben wurde. Dazu
  ein **Admin ohne Eigentümerrolle** — ohne ihn ließe sich „Eigentümer" von
  „Admin" gar nicht unterscheiden. **Seit 0.8.30 auch am fünften Träger:** ein
  Fremder trägt einen Link ein und die Zeile gehört *ihm*, er löscht einen
  fremden nicht und seinen eigenen schon, er sortiert nicht um, der Admin
  löscht einen fremden. **Seit 0.8.31 dasselbe am sechsten Träger**, dort mit
  einem **echten Multipart-Upload**: der Wächter stand vor multer, ein
  nachgereichter `INSERT` liefe an beidem vorbei und bewiese nichts über die
  Route. **Seit 0.8.50 am Videoweg dasselbe**, ebenfalls mit echtem
  Multipart-Upload: ein Fremder bekommt 403 und danach steht **keine Zeile**
  in `photos`, der Verfasser bekommt 201 und die Zeile trägt `art = 'video'`
  mit ihrer Dauer, ein Fremder löscht das Video nicht.
- **Der Name an der Datei- und der Linkzeile (0.8.30/0.8.31):** je drei
  Fenster nebeneinander —
  drei Zugänge mit Adminrolle, ein Zugang, drei Zugänge ohne Adminrolle. Die
  Prüflage trägt **fünf Verfasserlagen** an acht Zeilen: vier vom
  Eintragsverfasser (dort steht kein Name), eine mit spitzen Klammern im
  Namen, eine von der Fragenden, eine herrenlose und die Suchzeile von einem
  Grabstein. Beide Hälften der Anzeigeregel bekommen ihre eigene Gegenlage,
  und die Stylesheet-Regel wird erst auf Vorhandensein, dann auf Eigenschaft
  geprüft. **Die Dateizeile bekommt ihre eigenen Gegenlagen und erbt keine** —
  eine Regel, die an einer Stelle geprüft ist und an der zweiten nur behauptet,
  ist an der zweiten ungeprüft.
- **Der Quelltext selbst:** eine gepflegte Liste **aller schreibenden Routen
  (aktuell 56, und die Zahl wird seit 0.8.40 ausdrücklich geprüft)** samt der
  Art ihrer Absicherung, gehalten gegen das, was in
  `server.js` wirklich steht — in beide Richtungen, denn wo „offen" steht,
  darf **weder eine Klemme im Rumpf noch ein Wächter in der Routenzeile**
  stehen (die zweite Hälfte seit 0.8.30, Stolperstein 101). Dazu seit 0.8.30
  zwei Prüfungen darauf, **welche** Klemme im Rumpf der beiden Linkrouten
  steht — die Art `'im Rumpf'` unterscheidet das nicht. Dazu die Zählung, dass Adminfrage und
  Eigentümerfrage je genau einmal vorkommen, und der Wächter darauf, dass das
  Wort „Leitung" nirgends zurückkehrt. **Seit 0.8.40 auch die Spanne des
  Gewichts:** `GEWICHT_MIN` und `GEWICHT_MAX` je genau einmal, genau eine
  `gueltigesGewicht()`, keine Spanne in `app.js` — und der Wächter darauf,
  dass nirgends über **alle** Gewichte summiert wird, mit einer Gegenprobe,
  dass er überhaupt noch Code liest (Stolperstein 106). **Das ist die einzige Prüfung, die
  eine fehlende Entscheidung findet.** **0.8.60 hat die Zahl nicht bewegt:** die Ansicht „Offen" ist lesend,
  und der Erledigt-Haken geht über `PUT /api/comments/:id` — nachgestellt statt
  geglaubt, denn eine Gegenprobe macht aus dem lesenden Endpunkt eine
  schreibende Route und färbt beide Zeilen rot. **Seit 0.8.50 hat auch der Wächter über
  den Content-Type seine Gegenprobe:** dieselbe Zählung wird an einer
  String vorgeführt, die die Verletzung trägt — sonst bliebe er grün,
  wenn er gar nichts mehr ansähe.
  **0.8.80 bewegt die Zahl von 51 auf 56** und ändert eine Art von Grund auf:
  `'selbstbezug'` prüft seitdem nicht mehr den **Namen einer Funktion**,
  sondern die **Herkunft der Benutzernummer** — sie muss aus `req.benutzer`
  kommen und darf nicht aus `req.params`. Beide Hälften einzeln, drei eigene
  Gegenproben daneben; bis dahin gab es genau eine Route dieser Art, jetzt sind
  es drei. **Zwei neue Wächter dazu:** der Cookiename steht in keiner der
  sieben ausgelieferten Dateien abgeschrieben (und in `auth.js` genau einmal),
  und am Bildschirm heißt es „Link" und nicht „Token" — beide mit Gegenprobe,
  dass sie **Code** lesen und sich nicht am Kommentar daneben färben
  (Stolperstein 106).
- **Die Ansicht „Offen" und der Filter „Neu seit …" (0.8.60):** die Abfrage an
  einer Prüflage, die neben zwei offenen Aufgaben eine **erledigte**, eine
  **Notiz** und einen **Bericht** trägt — ohne die drei belegte sie nur, dass
  überhaupt etwas erscheint. Zwei Einträge, damit die Gruppierung sichtbar
  wird; drei Verfasserlagen, darunter eine **herrenlose** Zeile. Der Haken in
  beiden Richtungen mit **zwei Sitzungen**: ein gewöhnlicher Benutzer bekommt
  403 und danach steht die Art unverändert da, der Verfasser kommt durch, und
  ein **Admin ohne Eigentümerrolle** kommt am fremden Haken ebenfalls durch.
  In der Oberfläche: das Kästchen nur, wo das Recht steht (Vorhandensein
  zuerst, dann Abwesenheit), die durchgestrichene Zeile, das Vokabular in
  Überschrift und Beschriftung, beide leeren Fälle. Beim Filter: er **filtert
  und sortiert nicht** — an zwei Sortierungen, und gemessen wird die
  **ungefilterte** Liste (Stolperstein 114) —, er ist mit Status, Kategorie und
  Tags kombinierbar, er erscheint beim ersten Besuch nicht und bei einem
  einzigen Zugang doch. **Und die Sekunde am Rand:** eine Prüflage, in der ein
  Kommentar in genau der Sekunde des Verlassens entsteht, samt dem Beleg, dass
  die Lage wirklich getroffen wurde.
- **Der Papierkorb (0.8.70):** der **Rundlauf** ist die tragende Prüfung der
  Runde — ein Eintrag mit Foto, echtem Video, zwei Dateien, zwei Links, zwei
  Tags, Kommentaren **aller vier Arten** (darunter einer mit echtem Bild, einer
  von einem **Grabstein** und ein **herrenloser**), Bewertungen zweier Bewerter
  samt einer zurückgesetzten und Testtagen zweier Verfasser **am selben Tag**
  wird gelöscht, wiederhergestellt und **Feld für Feld** gegen die echte
  Serverantwort gehalten; Fotos und Video kommen **bytegleich** zurück. Dazu:
  die Zeile entsteht **in derselben Transaktion** (ein Auslöser in der
  Datenbank erzwingt den Fehlschlag, danach steht der Eintrag **unverändert**
  da), die Bytes liegen **nicht** in der JSON (an der echten Videodatei
  nachgesehen), die **dreißig Tage** an **beiden** Seiten der Grenze und **jede**
  der beiden Aufräumstellen einzeln, die Rechte in beiden Richtungen mit einem
  **Admin ohne Eigentümerrolle**, und die Kennzahl getrennt.
- **Die Sicherung (0.8.70):** `VACUUM INTO` an einer echten Anlage — die Kopie
  entsteht, ist **ohne Schlüssel nicht lesbar**, **mit** Schlüssel vollständig
  (Bestand, Zugänge **und** Sitzungen), und der Ausgangsstand ist danach
  unverändert. Der Zielort in beide Richtungen: sieben Absagen, jede mit ihrer
  sprechenden Begründung **und** der Nachschau, dass danach keine Datei da
  liegt; darunter ein **Symlink**, der aus der Wurzel herausführt, und ein
  Verzeichnis, das es nicht gibt und auch nicht angelegt wird. Eine vorhandene
  Zieldatei wird nicht überschrieben. „Letzte Sicherung" folgt dem
  **Dateisystem** und ausdrücklich **nicht** einem Schlüssel in `settings`. Ein
  unerreichbarer Ort ergibt eine Ansage statt einer Zahl. Ein Ort **im**
  Datenverzeichnis bleibt aus und sagt, warum. Und die Probe, dass
  `db.backup()` an dieser Datenbank kein zweiter Weg ist.
- **Der Einzelexport (0.8.70):** dieselbe Form wie der volle Export — Zeichen
  für Zeichen am Eintrag verglichen — und geprüft an einer Datei, die durch den
  **Import** wieder hereinkommt, nicht nur am JSON.
- **Der Sprachwächter (seit 0.8.60):** eine kurze Wortliste, gesucht in `Doku/`
  und in den **Kommentaren** des Quelltextes. **Er ist die Ausnahme von
  Stolperstein 106** — jeder andere Wächter filtert die Kommentarzeilen weg,
  dieser sieht sie an — und lässt dafür Code in Ruhe; was in Backticks steht,
  ist zitierter Code und keine Sprache. Acht Gegenproben an gestellten Texten,
  dazu die **Zahl** der angesehenen Dateien ausdrücklich (Stolperstein 113) und
  der Beleg, dass der Filter überhaupt etwas übrig lässt.
- **Das Werkzeug selbst (seit 0.8.10):** das Lockfile, der `Dockerfile`, der
  Versions-Fingerprint und die Datei für den Prüflauf bei jedem Push — geprüft
  gegen den Quelltext, teils über einen Server aus einer **Kopie** des
  Quelltexts in einem Wegwerfverzeichnis. Dazu eine **Selbstprobe des
  Prüfrahmens**, die den Gruppenfilter als eigenen Prozess fährt und Ausgabe
  und Rückgabewert von außen ansieht (Stolperstein 94).

**Wichtiger als die Zahl: die Prüfungen werden gegengeprüft.** Über hundert
gezielte Rückbauten am Code führen jeweils zu genau den passenden
Fehlschlägen. Was dabei gilt:

- **Gemessen wird an den Namen der roten Prüfungen, nicht an ihrer Zahl.** Wo
  eine breite Prüfung über den ganzen Quelltext geht, schlägt sie bei jeder
  Gegenprobe mit an und täuscht Abdeckung vor (Stolperstein 49).
- **Bleibt eine Gegenprobe stumm, ist die erste Frage nicht „ist die Regel
  überflüssig", sondern „habe ich die Stelle getroffen, an der sie wirkt"**
  (Stolperstein 50), und die zweite: „liegt dieselbe Regel noch woanders"
  (Stolperstein 51). Wo sie doppelt liegt, gehört zur Gegenprobe entweder der
  gleichzeitige Rückbau beider Stellen oder ein Weg an der äußeren Schicht
  vorbei.
- **Wo eine Regel mehrfach steht, ist die Frage nicht „ist das redundant",
  sondern „deckt eine Stelle die andere zu"** (Stolperstein 53).
- **Die ganze Ausgabe ansehen, nicht nur die roten Punkte** (Stolperstein 24).
  Ein Rückbau kann den Lauf abreißen; dann sind die roten Punkte davor nur die
  halbe Auskunft.

**Neun Lücken sind dabei schon aufgefallen — sie sind der eigentliche Ertrag:**

1. **Eine Klassenprüfung belegt nicht, dass die Klasse etwas bewirkt.** Drei
   Prüfungen lasen nur die Klassennamen am Kommentarknoten; ein ersatzloses
   Löschen beider CSS-Regeln blieb vollständig grün, obwohl danach alle vier
   Zustände gleich aussahen. Dazu gehört immer ein Blick ins Stylesheet.
2. **Eine Prüfung über `textContent` sieht keine Maskierung.** Für die
   Maskierung des Kommentartextes gab es deshalb jahrelang **keine einzige**
   wirksame Prüfung. Seitdem gilt: Prüfung zuerst schreiben, am unveränderten
   Stand als grün nachweisen, dann erst die Regel anfassen.
3. **Wo Client und Server dieselbe Vorgabe doppelt halten, prüft eine
   Oberflächenprüfung nur die eine Hälfte.** Die Gegenprobe „Vokabel
   serverseitig entfernt" blieb zunächst vollständig grün.
4. **Eine Prüfung, die eine Spalte mit `!=` vergleicht, die leer sein kann,
   prüft gar nichts** — `NULL` fällt aus dem `WHERE` heraus (Stolperstein 55).
5. **Zwei Zeitstempel, die sich nicht unterscheiden können, belegen nichts.**
   Die Prüfung auf das unveränderte Änderungsdatum blieb auch beim Rückbau
   grün, weil `datetime('now')` nur Sekunden auflöst (Stolperstein 60).
6. **Ein gebauter DOM zeigt nicht, was beim Klicken passiert.** 43 Prüfungen
   zur Anheftung, und keine hat den Knopf gedrückt — der Fehler entstand erst,
   als ein Behandler nach einem `await` weiterlief (Stolperstein 61).
7. **Ein Rückbau, der zu viel wegnimmt, belegt die falsche Sache.** Zwei
   Gegenproben zur Reihenfolge einer Klemme haben sie entfernt statt verschoben
   und dabei dieselbe Punktliste geliefert wie die Gegenprobe daneben
   (Stolperstein 72). **Wenn zwei Gegenproben dieselben Namen rot machen,
   prüfen sie dieselbe Sache.**
8. **Ein Mock, der ein Feld selbst mitbringt, prüft sich selbst.**
   Der Rückbau „`verfasser` fällt aus der Linkzeile in `detail()`" blieb
   vollständig grün — die Oberflächenprüfungen bekommen das Feld aus der
   eigenen Prüflage, die Rechteprüfungen sehen in die Datenbank statt in die
   Antwort. Gefunden in 0.8.30, behoben durch fünf Prüfungen an der echten
   Serverantwort (Stolperstein 102). Verwandt mit Lücke 3, aber schärfer: dort
   war es eine doppelt gehaltene Vorgabe, hier ist es der Prüfstand selbst.

9. **Ein Wächter über den Quelltext trifft den Kommentar, der die Regel
   erklärt.** Zwei Prüfungen aus 0.8.40 waren schon am unveränderten Stand rot:
   das Wort `CHECK` steht im Kommentar an der Spalte, und SQLite speichert
   Kommentare im DDL-Text mit; der falsche Griff „Summe über alle Gewichte"
   steht ausgeschrieben in `server.js`, damit ihn der Nächste nicht für einen
   guten hält. **Beide Fehlschläge lagen an der Prüfung, nicht am Code**
   (Stolperstein 106) — und sie sind vor dem Bauen aufgefallen, weil eine neue
   Prüfung erst am unveränderten Stand grün sein muss.

**Acht Prüfungen sind als zu nachsichtig aufgeflogen** — zwei standen schlicht
auf `true`. Eine Prüfung, die nie scheitern kann, ist schlimmer als keine. Und
umgekehrt: vier Fehlschläge beim Bau von 4.2 lagen an der Prüfung, nicht am Code
(Stolpersteine 19 und 20). Ein roter Punkt ist erst dann ein Fehler, wenn
feststeht, auf welcher Seite er liegt.

**Was der Prüfstand nicht kann: Aussehen.** Hier läuft kein Browser mit
Layoutberechnung. Dass keine Schriftgröße mehr fest ist und die Einstellung
ankommt, ist geprüft; ob bei 120 % irgendwo etwas umbricht, muss man ansehen.
Zweimal ist genau daran etwas vorbeigegangen: die leere PDF-Vorschau und ein
unsichtbares Löschkreuz (Stolpersteine 29 und 30). Beide Male war die Prüfung
richtig und das Ergebnis trotzdem unbrauchbar.

Weiterhin gültig aus Version 4.0, aber nicht im Skript: Verschlüsselung
(falscher Schlüssel wird abgewiesen, kein Klartext in der Datei), Bildgrößen je
Ansicht, Zoom lädt das Original.

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
| 0.8.1 | Umstellung auf frische Anlage (102 Migrationsprüfungen entfielen) | — | — |
| 0.8.2 | Stufe G2, erste Hälfte (61) | 19 | Stolpersteine 78, 79 und 80 |
| 0.8.3 | Stufe G2, zweite Hälfte, Punkte 1–4 (39) | 16 | Stolpersteine 81 und 82 |
| 0.8.4 | Stufe G2, zweite Hälfte, Rest — alle fünf Punkte (106) | 34 | Stolpersteine 83, 84, 85 und 86 |
| 0.8.5 | Stufe G3 — alle sechs Punkte (42) | 19 | Stolpersteine 87 und 88 |
| 0.8.6 | Berichtigungen aus dem Betrieb — alle fünf Punkte (38 netto) | 23 | Stolpersteine 89, 90 und 91 |
| 0.8.10 | Werkzeug — alle fünf Punkte (51) | 32 | Stolpersteine 92 bis 95 |
| 0.8.20 | Die Schotten dicht — alle fünf Punkte (68) | 14 | Stolpersteine 96 bis 100 |
| 0.8.30 | Stufe G4 — alle fünf Punkte (76) | 31 | Stolpersteine 101 bis 105, Lücke 8 oben |
| 0.8.31 | Dateien bekommen Verfasser (58) | 16 | — (die fünf aus 0.8.30 haben getragen) |
| 0.8.40 | Gewichtete Bewertungskriterien — alle fünf Punkte (125) | 30 | Stolpersteine 106 und 107, Lücke 9 oben |
| 0.8.50 | Kurzvideos am Fotoplatz — alle fünf Punkte (146) | 30 | Stolpersteine 108 bis 111 |
| 0.8.60 | Was ist offen, was ist neu — Ansicht „Offen", Filter „Neu seit …", Sprachbereinigung (132) | 17 | Stolpersteine 112 bis 116 |
| 0.8.70 | Sicherung und Papierkorb — alle drei Punkte (294) | 38 | Stolpersteine 117 bis 121 |
| 0.8.71 | 17 | 6 | Stolperstein 123 |
| 0.8.80 | Stufe H — alle vier Punkte (263) | 40 | Stolpersteine 124 bis 127 |
| 0.8.90 | Protokoll, zweite Bestätigung, öffentliche Adresse (237) | 24 | Stolpersteine 128 bis 130 |

**Aus 0.8.80 (Stufe H):** der **Rundlauf** ist die tragende Prüfung — einladen,
Link, Formular, Passwort, Anmeldung, und **derselbe Link ein zweites Mal
nicht**. Daneben stehen: die Tabellenprobe samt der Gegenlage, dass eine
**Spalte** nicht nachwächst; die Nachschau, dass der Klartext des Tokens in
**keiner Spalte keiner Tabelle** steht, samt der Gegenprobe, dass die Nachschau
überhaupt etwas findet; die sieben Tage an beiden Seiten mit von Hand gesetztem
Ausgangswert **und** der Kontrolle, dass dort wirklich ein Wert steht; fünf
Absagen, geprüft auf Wortgleichheit **und** gleichen Statuscode, mit dem
Erfolgsfall daneben; die Bremse, belegt am Übergang vom zehnten zum elften
Versuch auf einem **eigenen** Server; die Rechte am Einladen mit zwei
vorbereiteten Sitzungen, einem **Admin ohne Eigentümerrolle** und der Nachschau
nach jeder Absage, dass **nichts geschrieben** wurde. „Meine Sitzungen" mit
**zwei Benutzern zu je zwei Sitzungen**; die eigene ist markiert, und dieselbe
Liste aus der **anderen** Sitzung gefragt markiert die andere. In der
Oberfläche jede Karte in **beiden** Zuständen, mit einem Mock, der beim
Beenden wirklich mitzieht.

**Ausführlich steht nur die jüngste Version.** Von den älteren bleibt hier,
was heute noch bindet; die Lehren selbst sind Stolpersteine in Abschnitt 6 und
gelten dort weiter.

**Aus 0.8.0 (115 Prüfungen, 20 Gegenproben):** Der Prüfbestand entsteht
seitdem **über die Verwaltung selbst**, nur die Einrichtung läuft über die
Einrichtungsseite — jeder Zugang braucht ein **echtes Passwort**, sonst ließe
sich weder die Anmeldung eines Gesperrten noch die Bremse je Name prüfen.
**Fünf Lagen stehen nebeneinander:** Eigentümerin, Admin **ohne**
Eigentümerrecht, gewöhnlicher Benutzer, Gesperrter, Grabstein. Die mittlere ist
die wichtigste — ohne sie wäre „Admin" von „Eigentümer" nicht zu unterscheiden,
und jede Prüfung darauf bliebe grün, auch wenn überall nur `nurAdmin` stünde
(Stolperstein 73). Drei Gegenproben trugen mehr als ihre Zahl: die auf die
**zweite** Namensprüfstelle (1 rot — sie wird von der ersten nicht abgedeckt,
Stolperstein 53), die *verschobene* statt entfernte Namensbremse (2 rot,
Stolperstein 72) und die Selbstsperr-Klemme, deren erster Rückbau **stumm**
blieb, weil das 403 von `darfAnZugang` kam (Stolperstein 73).

**Aus 0.8.2 (61 Prüfungen, 19 Gegenproben):** Der Prüfbestand für den
Löschdialog entsteht **eigens** und nicht aus dem Gewachsenen — drei Verfasser,
drei Sorten Beitrag, dazu die zwei Fälle, die genau die zwei Klemmen treffen
(eine zurückgesetzte Bewertung mit Wert 0 und eine herrenlose Zeile). Ein
**vierter** Rufer musste dazu, der weder Verfasser noch Admin ist; ohne ihn
ließe sich an den neuen Wegen gar keine Verweigerung herstellen. Das Paar zur
`value > 0`-Bedingung ist Stolperstein 80 in Reinform: derselbe Wortlaut an
zwei Zeilen, und erst der zweite, engere Rückbau macht die Prüfung rot, die ihn
meint. Und ein abgebrochener Treiberlauf ließ einen Rückbau im Quelltext stehen
und erzeugte drei Läufe lang falsche rote Punkte (Stolperstein 75).

**Aus 0.8.5 (42 Prüfungen, 19 Gegenproben):** Die Gruppe „Der Systembereich
nach Rolle" baut den Bereich **dreimal** auf. Zu jedem „ist weg" steht das „mit
Rolle ist es da" daneben — eine verschwundene Karte ist von einer, die es nie
gab, nur am Gegenaufbau zu unterscheiden (Stolperstein 81). Das aufschlussreichste
Paar: der grobe Rückbau des bedingten Kennzahlenabrufs belegt die **Tragweite**
(19 rot, weil ein einziger fehlgeschlagener Abruf im Sammel-`Promise.all` den
ganzen Rumpf mit `return` verlässt), der engere den **Ort** (1 rot). Zwei der
drei groben Rückbauten rissen den Lauf mit, ohne einen Namen zu nennen —
deshalb steht neben jedem eine engere Zweitprobe (Stolpersteine 76 und 82).

**Aus 0.8.6 (38 Prüfungen netto, 23 Gegenproben):** Der neue Endpunkt für die
Stimmenliste stellt vier Rufer nebeneinander — den Fremden, den **Verfasser
des Eintrags**, den Admin ohne Eigentümerrecht und die Eigentümerin; der
zweite ist der entscheidende, ohne ihn bliebe die Prüfung auch bei
`nurEintragVerfasser` grün. Zwei Paare trugen mehr als ihre Zahl: die beiden
Rückbauten am Aufrufknopf belegen je eine Hälfte derselben Bedingung (ohne
Adminrolle, bei einem einzigen Zugang — Stolperstein 72), und das Paar an der
Rasterregel ist Stolperstein 81 in Reinform: ohne die Prüfung auf das
Vorhandensein der Regel bliebe bei einer fehlenden Regel nur ein roter Punkt
statt zwei.

**In 0.8.10 51 neue Prüfungen und 32 Gegenproben, alle mit eigener
Punktliste.** Vier neue Gruppen (Abschnitt „Was abgedeckt ist" oben), dazu
sechs Prüfungen in vorhandenen Gruppen. Zwei Gegenproben stechen heraus: bei
`.dockerignore` mit einem nie greifenden Muster bleibt „hält das Lockfile
nicht zurück" **grün** — Stolperstein 81 in Reinform, nur die Prüfung daneben
findet es. Und der naive Verzeichnislauf statt der Ableitung über
`require.cache` färbt genau die drei Prüfungen rot, die die Falle des Auftrags
benennen: `pruefung.js`, `Doku/` und `zugang.js` zählten mit.

| Rückbau | Ergebnis |
|---|---|
| `package-lock.json` wird in `.dockerignore` aufgenommen | **1 rot** |
| `npm ci` wird wieder `npm install` | 2 rot |
| das Lockfile fehlt ganz | 4 rot |
| `alsMuster()` trifft nie | **1 rot** — *Stolperstein 81 in Reinform* |
| `fingerprint` fällt aus der Antwort von `/api/stats` | 5 rot |
| die Liste wird ein blosser Verzeichnislauf über alle `.js` der Wurzel | 4 rot |
| der **Name** geht nicht mehr in den Hash, nur der Inhalt | **1 rot** |
| `fingerprint` wandert **zusätzlich** nach `/api/config` | 2 rot |
| der Mock kennt `fingerprint` nicht mehr | **1 rot** — *Stolperstein 90* |
| ein `require` wandert in `db.js` in eine Funktion | **1 rot** — *Stolperstein 95* |
| der Schlussblock sagt nicht mehr, dass gefiltert wurde | **1 rot** |
| ein übergangener Fehlschlag färbt den Lauf doch rot | 2 rot |
| der Rückgabewert kümmert sich nicht mehr um den Filter ohne Treffer | **1 rot** |
| `node-version` im Prüflauf auf `'20'` | **1 rot** — *Image und Prüflauf laufen auseinander* |
| `--audit-level=high` wird `moderate` | 2 rot |
| die Datei für den Prüflauf fehlt ganz | 7 rot |

**Vollständige Tabelle im Änderungsprotokoll 0.8.10.** Kein Rückbau hat den
Lauf abgerissen, eine engere Zweitprobe nach Stolperstein 76 war nirgends
nötig.

**In 0.8.30 76 neue Prüfungen und 31 Gegenproben** — die meisten einer
einzelnen Version bisher. Drei sind mehr wert als ihre Zahl:

| Rückbau | Ergebnis |
|---|---|
| `user_id` aus der `links`-DDL | **1 rot** — nur „Eine frische Anlage trägt die Spalte ohne Migration"; auf einer bestehenden Anlage rüstet die Migration sie ohnehin nach. *Stolperstein 81 in Reinform* |
| `verfasser` fällt aus der Linkzeile in `detail()` | **stumm** — und damit der wertvollste Rückbau der Runde (Lücke 8, Stolperstein 102) |
| `nurEintragVerfasser` wieder vor `POST …/links` | 8 rot, der Quelltextwächter **grün** — Stolperstein 101, behoben; danach 9 rot |
| die Migration ordnet niemanden zu | 3 rot |
| die Migration setzt den **Eigentümer** ein | 3 rot — **dieselben Namen**, Stolperstein 72 |
| Name ohne die Schwelle `mehrereBenutzer()` | 2 rot |
| Name an **jeder** Zeile | 2 rot — **andere** Namen als darüber |
| ein Trennzeichen statt der Klammern um den Namen | 7 rot |
| der Inhalt der zweiten Zeile nimmt sich wieder die volle Breite | **1 rot** |

**Das letzte Paar ist die Bauform, auf die es ankommt:** die Anzeigeregel hat
zwei Hälften, und jede färbt ihre eigenen Namen rot. Ein Rückbau, der nur eine
entfernt, ist von einem, der beide entfernt, unterscheidbar.

**Zwei Rückbauten haben den Lauf abgerissen**, beide mit einer engeren
Zweitprobe daneben (Stolperstein 76). Einer davon hat Stolperstein 103
gefunden: nicht der Rückbau war zu grob, sondern die Prüfung zu unvorsichtig.

**Die beiden letzten Zeilen der Tabelle kamen erst nach dem Bau dazu** — die
Anzeige des Namens ist am Bildschirm berichtigt worden, nachdem der Prüflauf
längst grün war. *Was der Prüfstand nicht kann, ist Aussehen*, zum dritten Mal
(nach den Stolpersteinen 29 und 30). **Vollständige Tabelle im
Änderungsprotokoll 0.8.30.**

**In 0.8.31 58 neue Prüfungen und 16 Gegenproben** — dieselbe Bauform am
sechsten Träger, und **kein neuer Stolperstein**: die fünf aus 0.8.30 haben
getragen. Kein Rückbau blieb stumm, keiner riss den Lauf ab. Bemerkenswert
sind zwei Dinge:

- **Stolperstein 104 hat sich sofort bezahlt gemacht.** Die Prüflage legte ihre
  Datei zuerst ohne `user_id` an; diesmal war vorher klar, dass
  `ordneBestandZu()` sie der Eigentümerin zuschöbe und „der Admin löscht eine
  **fremde** Datei" danach eine eigene löschte. In 0.8.30 hatte erst eine
  Gegenprobe das gezeigt.
- **Die Gruppe „Keine Zeile ohne Benutzer" hat sich selbst überführt.** Sie
  stand zuerst auf **null** Dateien und blieb grün — „keine der 0 Zeilen ist
  ohne Benutzer" ist wahr und belegt nichts (Stolperstein 81). Rot wurde die
  Zeile daneben, die den Bestand auf eine Schwelle prüft. **Genau dafür steht
  sie da**, und es ist das erste Mal, dass sie zugeschlagen hat.

**Vollständige Tabelle im Änderungsprotokoll 0.8.31.**

---

## 8. Offene Betriebspunkte

- **Der Betriebsstand steht in Abschnitt 2, nicht hier.** Zwei Stellen für
  dieselbe Angabe halten nur eine aktuell (vgl. Stolperstein 47).
- **Versionsnummern brauchen drei Zahlen** (`0.6.10`, nicht `0.6.9b`) — die
  `package.json` lässt keine Buchstaben zu. Die führende Null sagt, dass sich
  noch alles ändern darf; die Veröffentlichung bekäme `1.0.0`.
- **Noch zu erledigen, wenn nicht schon geschehen:** `AUTH_USER` und
  `AUTH_PASSWORD` aus der `.env` nehmen — sie werden nicht mehr gelesen (der
  Start meldet Reste), enthalten aber ein Klartextpasswort. Und das Passwort im
  Systembereich unter „Zugang" wechseln: es ist zweimal aus der Anlage
  herausgeraten — einmal im Klartext in einem ZIP, einmal über eine
  `od -c`-Ausgabe beim Nachprüfen von 0.8.2. **Merksatz für die Zukunft:
  Kontrollausgaben laufen über die Länge und das letzte Zeichen, nie über den
  Inhalt.**
- **Dateien lassen die Datenbank wachsen.** Bei 50 MB je Stück lohnt
  gelegentlich ein Blick auf die Kennzahlen im Systembereich — und daran zu
  denken, dass die Sicherung entsprechend größer wird.
- **Am Bildschirm nachsehen, was der Prüfstand nicht kann:** ob bei 120 %
  Schriftgröße irgendwo etwas umbricht, wie sich das Ziehen der Blöcke anfühlt,
  ob die Zeitleiste bei echtem Bestand lesbar bleibt (sie ist auf rund 50 Punkte
  über fünf Jahre ausgelegt; bei Hunderten wäre sie zu überdenken) und ob die
  Tagwolke mit einer Zeile auskommt. Aus 0.8.4 dazu: der Umbruch der
  Kommentar-Kopfzeile bei „… bearbeitet · 2 Bilder vom Admin entfernt" in der
  schmalen Spalte (`.cmt-head` hat `flex-wrap` bewusst nicht — kippt es doch,
  ist die Antwort dort, nicht eine kürzere Beschriftung), der Hinweis am
  Kommentarblock auf- und eingeklappt, der Tagblock ohne seine Eingabezeile bei
  ausgeschaltetem Schalter und der Umschalter im Vergleich.
- **Blockanordnung und Einklappzustand liegen in den Einstellungen**, nicht im
  Export. Nach einem ersetzenden Import stehen sie unverändert da.
- **Veröffentlichung auf GitHub ist vorbereitet:** `.env` per `.gitignore`
  ausgeschlossen, `.env.example` als Vorlage, keine echten Zugangsdaten im
  Quelltext. Offen davor: Punkt 7 in Abschnitt 10.
- **Die Sicherung des Datenverzeichnisses ist seit 0.8.30 Pflicht, nicht
  Empfehlung** — jedenfalls bei einer Datenbankstufe. Ein Downgrade ist dann
  keine reine Dateikopie mehr (Abschnitt 2). Betroffen sind die Stufen mit
  „ja" in der Schemaspalte des Stufenplans. **0.8.60 ist keine davon:** dort
  ist die Sicherung wieder eine Empfehlung und das Downgrade wieder eine reine
  Dateikopie — zum ersten Mal seit 0.8.30. Die nächste Pflicht ist **0.8.70**.
- **Nach jedem Einspielen lohnt ein Blick ins Protokoll:** der Start meldet
  den Eigentümer, `.env`-Reste, seit 0.8.20 die Betriebsart („Hinter Proxy:
  an/aus"), seit 0.8.90 die **öffentliche Adresse** („Oeffentliche Adresse:
  … / nicht gesetzt") und — falls Zeilen herausfallen — das Aufräumen des
  Sicherheitsprotokolls, — falls je nötig — die Zuordnung herrenlosen Bestands
  („Bestand ohne Benutzer dem Eigentuemer zugeordnet") und, **einmalig beim
  Migration auf 0.8.30**, die Zeile „links um user_id ergaenzt". Beim zweiten
  Start ist sie weg; das ist richtig so.
- **Der Container ist seit 0.8.20 sichtbar gesund oder nicht.** Das Image
  trägt einen `HEALTHCHECK` gegen `/api/config`; `docker compose ps` zeigt
  `healthy`. Vorher wusste Docker nur, dass der Prozess läuft — ein Container
  in einer Neustartschleife sah von außen gesund aus.
- **Der Weg nach außen ist noch nicht gebaut, und daran hängt eine
  Entscheidung.** Heute ist Kriterion nur im Heimnetz auf Port 3100
  erreichbar; `HINTER_PROXY` steht deshalb auf der Vorgabe (Abschnitt 2). Beim
  Schritt nach außen über den Proxy gehören **zwei** Dinge zusammen: die
  Einstellung auf `1` — und die Frage, ob der Port 3100 daneben offen bleiben
  soll. Bleibt er offen, kann jemand im Heimnetz den Proxy umgehen und
  `X-Forwarded-For` selbst setzen; die Anmeldebremse ließe sich so aushebeln.
  Ein gewöhnlicher Browser tut das nicht, ein absichtlicher Aufruf schon.
  **Als tragbar eingestuft**, solange es das Heimnetz betrifft: der Schutz
  gilt dem Weg aus dem Internet. Wer es doch schließen will, hängt Kriterion
  in das Netz des Proxys und lässt die Portfreigabe fallen — dann kommt
  niemand mehr direkt heran, und der Zugriff im Heimnetz läuft ebenfalls über
  den Proxy. Ein Adressbuch, wer den Kopf setzen darf, ist in 0.8.20
  ausdrücklich **nicht** gebaut worden und wäre der dritte Weg (Abschnitt 11).

---

## 9. Versionsgeschichte

**0.8.90 — „Schwere Eingriffe".** Keine Stufe des Mehrbenutzerbetriebs, aber
eine Datenbankstufe ohne Migrationsblock. Die **zweite Bestätigung** vor sieben
schweren Wegen, das **Sicherheitsprotokoll** mit vierzehn Vorgängen und 180
Tagen Frist, die optionale **öffentliche Adresse** in der `.env`.
`F_ROUTEN` 56 → 57 samt der neuen Art `'zweitbestaetigt'`, sechzehn Karten
werden siebzehn, Formatnummer unverändert 10, keine neue Abhängigkeit.
**Der Schlüsselwechsel ist nicht gebaut** und liegt auf 0.8.91.
2903 Prüfungen, 24 Gegenproben, Stolpersteine 128 bis 130.

Die jüngste Version steht ausführlich; alles davor als eine Zeile — die
tragenden Entscheidungen dahinter leben in Abschnitt 5 weiter.

**0.8.80 — Stufe H, „Einladung, Rücksetzung, Sitzungen".** Die erste Stufe des
Mehrbenutzerbetriebs seit G4 (0.8.30); danach fehlt nur noch **Stufe I**. Ein
neuer Zugang bekommt sein Passwort **selbst**, über einen Link mit begrenzter
Haltbarkeit — **32 Zufallsbytes, gespeichert wird nur ihr SHA-256, sieben Tage,
genau einmal**. Beim Einlösen fallen alle Sitzungen dieses Zugangs und alle
übrigen offenen Links. **Ein Mechanismus, zwei Anlässe:** Einladung und
Rücksetzung. Der direkte Weg „Passwort setzen und sagen" bleibt daneben — der
Link braucht den Browser des anderen, dieser nicht.
**Eine Datenbankstufe ohne Migrationsblock:** die Tabelle `tokens`, an dieser
Tabelle nachgestellt statt aus 0.8.70 abgeschrieben. Es bleibt bei **fünf**
markierten Blöcken.
**Zwei schreibende Routen stehen vor der Anmeldung** und damit hinter der
Anmeldebremse; die Absage ist **eine einzige** für alle Fälle, weil das
Heilmittel dasselbe ist. Die Einlöseseite ist ein **Zustand der Anmeldeseite**,
der Schlüssel steht im **Fragment** und geht nie an den Server.
**Neu daneben: die Karte „Meine Sitzungen"** — für jeden, nicht für Admins;
sie zeigt nur die eigenen, markiert die aktuelle und kann „alle anderen
beenden". **Ohne Gerätekennung, und sie sagt das offen.** Adressiert wird über
eine gerechnete Kennung, den vollen SHA-256 des Sitzungstokens — kein Schema,
keine Migration.
**`F_ROUTEN` 51 → 56**, fünfzehn Karten werden **sechzehn**, Formatnummer
unverändert **10**, keine neue Abhängigkeit, kein neuer Vokabeleintrag.

**0.8.71 — „Der Sicherungsort zieht um".** Eine **Berichtigungsrunde** auf
einer der neun freien Nummern, wie 0.8.1, 0.8.6 und 0.8.31 — **kein Schema,
keine Route, keine Formatnummer**. Der Sicherungsort liegt jetzt **im**
Projektverzeichnis (`./kriterion-sicherung:/app/sicherung`), weil ein zweiter
Ordner eine Ebene höher die Übersicht nicht hielt. Der Preis wird nicht
verschwiegen, sondern angezeigt: `GET /api/sicherung` liefert
`imArbeitsverzeichnis`, und die Karte macht daraus einen **roten** Kasten samt
Grund oder einen **grünen**. **Benannt, nicht verboten** — der Riegel gegen den
Ort im *Datenverzeichnis* bleibt eine Absage, der Ort im Arbeitsverzeichnis
wird erlaubt; ein Riegel, den die eigene Vorgabe verletzt, wäre absurd. Der
Einspielweg holt den Sicherungsordner mit einer eigenen Zeile aus dem
umbenannten Verzeichnis zurück.
**Die Aussage trägt nur, solange die Einhängung die Lage spiegelt** — der
Prozess sieht den Wirt nicht (Stolperstein 123); ein Wächter über die
`docker-compose.yml` hält es fest.
**2398 von 2398 Prüfungen**, 6 Gegenproben, **ein neuer Stolperstein** (123).
Einzelheiten in `Doku/Aenderungsprotokoll_0.8.71.md`.

**0.8.70 davor — „Sicherung und Papierkorb".** Die Runde davor im Stufenplan,
**keine Stufe des Mehrbenutzerbetriebs** — und **wieder eine Datenbankstufe**,
aber **ohne Migrationsblock**.

*Was sie tut.* Zwei Wege zurück, die es bisher nicht gab. Ein gelöschter
Eintrag lag bis dahin endgültig hinter der Kaskade; die einzige Rettung war ein
Export, den jemand gezogen haben musste. Und eine Sicherung der Anlage entstand
nur von Hand auf dem Wirt.

*Der Papierkorb.* Zwei Tabellen in der vollständigen DDL — und **kein
Migrationsblock**: `CREATE TABLE IF NOT EXISTS` legt eine fehlende **Tabelle**
bei jedem Start an, anders als eine Spalte. **Keine bestehende Abfrage ändert
sich**: `items` trägt unverändert zehn Spalten, kein `WHERE` bekommt einen
Zusatz. Beim Löschen wird der Eintrag im vorhandenen Austauschformat
serialisiert und **in derselben Transaktion** entfernt; danach läuft die
Kaskade wie bisher. **Die Bytes gehen an der JSON vorbei** in eine
Nebentabelle — als Base64 in einem String rissen zwanzig Videos die Grenze von
Node. Sehen darf die Karte der **Admin**, zurückholen und endgültig entfernen
der **Eigentümer**; Wiederherstellen legt einen **neuen** Eintrag an und geht
durch den Import, samt dessen Regel zu den Verfassernamen. Nach dreißig Tagen
fällt eine Zeile heraus, aufgeräumt beim **Start** und beim **Öffnen der
Karte**.

*Der Einzelexport.* Aus Punkt 3 gefallen: die Abbildung je Eintrag stand mitten
in der Exportroute, der Deserialisierer mitten im Importrumpf. Beide sind
herausgezogen, und ein Wächter hält fest, dass es je **einen** gibt. Damit ist
„diesen Eintrag als Datei" ein Knopf und eine lesende Route —
`GET /api/items/:id/export` hinter `nurEigentuemer`, **Formatnummer unverändert
10**.

*Die Sicherung.* `VACUUM INTO` erzeugt eine vollständige, verschlüsselte Kopie —
ohne Schlüssel meldet sie „file is not a database". Einen schrittweisen Weg
gibt es an dieser Datenbank nicht (Stolperstein 117). Sie läuft **synchron**,
und die Karte sagt die erwartete Dauer **vorher**; gemessen sind rund 10 ms je
MB. Der Zielort kommt zweistufig — Wurzel aus `SICHERUNG_DIR`,
Unterverzeichnis aus der Oberfläche —, und geprüft wird am **aufgelösten**
Pfad. „Letzte Sicherung vor N Tagen" kommt aus dem **Dateisystem**.

**Vier neue schreibende Routen: `F_ROUTEN` 47 → 51.** Fünfzehn Karten im
Systembereich, elf Vokabeleinträge, keine neue Abhängigkeit.

**2381 von 2381 Prüfungen**, 38
Gegenproben, **fünf neue Stolpersteine** (117 bis 121). Einzelheiten in
`Doku/Aenderungsprotokoll_0.8.70.md`.

**0.8.60 davor — „Was ist offen, was ist neu".** Die Runde davor im
Stufenplan, **keine Stufe des Mehrbenutzerbetriebs** — und **keine
Datenbankstufe**.

*Was sie tut.* Zwei Dinge, die es längst gibt, werden auffindbar.
Aufgabenkommentare gibt es seit 0.5.9, samt Farbkante und Weiterschaltknopf;
sichtbar waren sie nur im eigenen Eintrag. **Die günstigste Art von
Verbesserung ist, vorhandene Funktionalität erreichbar zu machen.**

*Die Ansicht „Offen".* Ein Knopf in der Kopfzeile neben dem Zahnrad,
`GET /api/offen` dahinter — **lesend und ohne Wächter**, also kein Eintrag in
`F_ROUTEN`; die Zahl bleibt bei **47**. Eine Abfrage, kein zweiter Rechenweg:
`WHERE c.kind = 'task'`, dieselbe Schreibweise wie in der Detailansicht.
Sortiert wie die Übersicht, gruppiert nach Eintrag, mit Verfasser und Datum an
der Zeile. **Der Erledigt-Haken geht über `PUT /api/comments/:id`** und steht
nur, wo er gedrückt werden darf; die abgehakte Zeile bleibt durchgestrichen
stehen. Umschalter „meine / alle" ab zwei Zugängen, Überschrift aus dem
Vokabular.

*Der Filter „Neu seit …".* Ein persönlicher Schlüssel `zuletztGesehen` in
`user_settings` — **keine Schemaänderung, kein Migrationsblock**, genau das,
wofür die Tabelle in Stufe D gebaut wurde. Er steht in
`PERSOENLICHE_SCHLUESSEL`, dem siebten Eintrag dort. **Gesetzt wird er beim
Verlassen der Übersicht**, von der **Serveruhr** und um eine Sekunde
nachgestellt (Stolperstein 60); gelesen wird er **einmal je Seitenleben**. Er
filtert und sortiert nicht, ist mit allen anderen Filtern kombinierbar,
erscheint beim ersten Besuch nicht und bei einem einzigen Zugang doch.

*Die Sprachbereinigung.* Zwölf übersetzte Lehnwörter sind abgeräumt, „Kopfzeile"
und „Bereich" nur dort, wo HTTP gemeint ist; die eigenen Bilder des Projekts
bleiben. Mitgewandert sind Bezeichner und Marken — die fünf Migrationsblöcke
heißen jetzt `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0` und `migration083()` bis
`migration0850()`. Sichtbar ist genau eine Umbenennung: der `Abdruck` in der
Kennzahlenkarte heißt **Fingerprint**. Die Regel steht in Abschnitt 12, ein
Wächter im Prüfstand hält sie fest.

**2087 von 2087 Prüfungen**, 17 Gegenproben, **fünf neue Stolpersteine**
(112 bis 116). Einzelheiten in `Doku/Aenderungsprotokoll_0.8.60.md`.

**0.8.50 davor — „Kurzvideos am Fotoplatz".** Die Runde davor im Stufenplan,
**keine Stufe des Mehrbenutzerbetriebs** — und eine Datenbankstufe.

*Das Schema und die Migration.* `photos` trägt `art TEXT NOT NULL DEFAULT 'bild'`
und `dauer INTEGER`, samt `migration0850()`, dem **fünften** markierten Block.
**Dieselbe Tabelle, keine zweite:** zwei Tabellen hießen zwei sortierte Listen
und damit zwei Quellen für die Frage nach dem Hauptbild. Die Bestandszeilen
bekommen `'bild'` aus dem `DEFAULT`, `dauer` bleibt `NULL`.
`ordneBestandZu()` bleibt unberührt — ein Foto gehört seinem Eintrag, nicht
einem Verfasser. **Kein `CHECK`**, aus demselben Grund wie beim Gewicht.
**Der Block fragt jede seiner beiden Spalten einzeln ab** (Stolperstein 108).

*Der Weg herein.* Eine eigene Route `POST /api/items/:id/videos` hinter
`nurEintragVerfasser`, mit eigenem `multer` und zwei benannten Feldern —
`F_ROUTEN` geht von **46 auf 47**, die erste neue schreibende Route seit
langem. Die vorhandene Fotoroute zu erweitern hätte ihren `fileFilter` auf
`^image\/` lockern müssen, und das nähme die erste Schranke dem Fotoweg mit ab.
`VIDEO_MAX = 20 MB` steht an genau einer Stelle, mit der gemessenen Begründung
daneben. **Der Inhalt entscheidet:** `typAusBytes()` muss einen der drei
Videotypen liefern. Das Standbild läuft durch `rasterBild()` und
`makeVariants()` wie jedes Foto; auf die Videodatei wird `rasterBild()`
ausdrücklich **nicht** angewandt.

*Das Standbild kommt aus dem Browser.* `ffmpeg` bleibt draußen — hundert
Megabyte mit eigener Angriffsfläche für eine Vorschau. Vier Folgen, alle
gewollt: keine neue Abhängigkeit, der Server öffnet nie ein Video, wer nicht
abspielen kann, kann nicht hochladen, und das Standbild belegt nichts.

*Die Auslieferung.* `typAusBytes()` erkennt zusätzlich `video/mp4`,
`video/webm` und `video/quicktime`; die Endungsliste steht in `anhaenge.js` und
trägt beide Richtungen; die drei Typen kommen auf die `inline`-Liste. **Der
Wächter aus 0.8.20 hat gehalten** — `server.js` setzt weiterhin an keiner
Stelle den Content-Type selbst. **Ausgeliefert wird in Ranges**, aber nur am
Video und nur an der ganzen Datei: Ungültiges bekommt **416**, und an einem
Foto verschiebt sich kein Header. Das Papier verlangte an einer Stelle
`Accept-Ranges: none` und an einer anderen das Gegenteil; entschieden wurde für
die Ranges.

*Am Bildschirm.* `qPhotos` liefert `art` und `dauer` mit — woran die
Oberfläche ein Video erkennt, ist allein `art`. Vorschauleiste mit ▶ und
Länge, Vollbild mit `<video controls>`, kein automatisches Abspielen, kein
Zoom, Anhalten beim Blättern **und** beim Verlassen. Auf der Karte das
Standbild mit Abspielzeichen und der Zähler „3 Fotos · 1 Video".
**Die Sicherheitsregel der Anwendung bekommt `media-src 'self' blob:`** —
ohne `blob:` verwirft der Browser die Adresse, an der das Standbild entsteht,
und zwar wortlos. Löschdialog und Kennzahlen weisen Videos getrennt aus; die
alten Feldnamen behalten ihre Bedeutung und bekommen Nachbarn.

*Export und Import.* Eigener Schalter `videos=1`, Vorgabe aus. **Kein
Videoeintrag ohne Videodatei** — `photos.data` ist `NOT NULL`. Ohne den
Schalter bleibt die Zeile als **Marke** ohne Bytes in der Datei stehen; nur so
kann der Import nennen, wie viele Videos gefehlt haben. Das Standbild geht
eigens mit, sonst erzeugte der Import die Varianten aus der Videodatei.
**Formatnummer 9 → 10.**

*Ein Befund nebenbei:* `backfillVariants()` hätte an einer Videozeile die
Varianten aus der Videodatei erzeugt und ein vorhandenes Standbild
überschrieben (Stolperstein 109).

**1953 von 1953 Prüfungen**, 30 Gegenproben, **vier neue Stolpersteine**
(108 bis 111). Einzelheiten in `Doku/Aenderungsprotokoll_0.8.50.md`.

**0.8.40 davor — „Nicht jedes Kriterium wiegt gleich".** **Keine Stufe des
Mehrbenutzerbetriebs** — und ebenfalls eine Datenbankstufe.

*Das Schema und die Migration.* `rating_criteria` trägt
`gewicht REAL NOT NULL DEFAULT 1.0`, samt `migration0840()`, dem **vierten**
markierten Block. **Die Bestandszeilen bekommen 1,0 aus dem `DEFAULT` der
Spalte**, nicht aus einem nachgeschobenen `UPDATE`. `ordneBestandZu()` bleibt
unberührt: ein Gewicht kann nicht herrenlos werden. **Kein `CHECK`** — nicht
weil SQLite ihn nicht nachrüsten könnte (er könnte, das ist nachgestellt
worden), sondern weil die Spanne dann zweimal stünde.

*Der Rechenweg.* `qSchnittJeKriterium` bekommt einen JOIN auf
`rating_criteria`, das Gewicht **reist an der Schnittzeile mit**, und
`gesamtSchnitt()` wird ein gewichteter Mittelwert. **Der Nenner summiert nur
die Gewichte der bewerteten Kriterien** — die eine Stelle, an der ein
naheliegender Griff die Zusicherung [1, 5] bricht; sie ist baulich gelöst und
nicht durch Sorgfalt. `avg` und `count` je Kriterium bleiben ungewichtet,
gerundet wird weiterhin genau einmal.

*Wo es eingestellt wird.* `GEWICHT_MIN = 0.2`, `GEWICHT_MAX = 2.0` und
`gueltigesGewicht()` an **genau einer** Stelle; zwei Schreibwege führen darauf.
In der Kriterienkarte steht ein Textfeld mit Vorschlagsliste
(**0,5 · 0,8 · 1 · 1,2 · 1,5**, freie Eingabe dazwischen), `type="text"` mit
`inputmode="decimal"`. Komma herein, Komma hinaus. **Keine neue schreibende
Route: `F_ROUTEN` bleibt bei 46, und keine Art wechselt.**

*Wo es sichtbar wird.* `×1,5` an der Kriterienzeile, an der
Zeilenbeschriftung im Vergleich und das Wort „gewichtet" am Blockkopf — alles
abgeleitet, nur bei Abweichung von 1, das Wort zusätzlich nur über die
**bewerteten** Kriterien. `eigenerSchnitt()` im Klienten rechnet ebenfalls
gewichtet; es bleiben **genau zwei** Rechenstellen.

*Export und Import.* `criteriaGewichte` als zusätzliches Feld, **nur
Abweichungen**, `criteria` unverändert eine Liste von Namen. **Formatnummer
8 → 9.** Ein bekanntes Kriterium behält beim Einspielen sein Gewicht, ein neu
angelegtes bekommt das aus der Datei, ein ungültiges fällt auf 1,0 und wird
genannt statt abzubrechen.

**1807 von 1807 Prüfungen** in jenem Stand, 30 Gegenproben, **zwei
neue Stolpersteine** (106 und 107, beide über das Prüfen selbst). Einzelheiten
in `Doku/Aenderungsprotokoll_0.8.40.md`.

**0.8.31 davor — „Dateien bekommen Verfasser".** *Keine Stufe, eine
Berichtigungsrunde* — und die erste, die eine der neun freien Nummern zwischen
zwei Stufen nutzt (Abschnitt 10). Sachlich dieselbe Wende wie G4, nur am
sechsten Träger: die Regel galt für Dateien immer schon, sie war nur nicht
gebaut.

`attachments` bekommt `user_id` samt `migration0831()`, dem **dritten**
markierten Block. `POST /api/items/:id/attachments` verliert seinen Wächter —
er stand dort **vor multer**, mit dem Zweck, „die Datei eines Fremden gar
nicht erst einzulesen"; diese Begründung ist gegenstandslos geworden, die
Mengengrenze `ANHANG_ZAHL` bleibt.
`DELETE /api/attachments/:id` klemmt auf `darfAendern(req, a.user_id)`.
**Formatnummer 7 → 8.** Der Name steht nach derselben Regel an der Zeile, in
Klammern — **hinter der Größe**, nicht hinter dem Dateinamen: der Dateiname ist
die Hauptsache der Zeile.

Beide Löschdialoge und `zaehleBestand()` sind nachgezogen; `entferneZugang()`
räumt die Dateien beim zweiten Häkchen mit weg.

**1682 von 1682 Prüfungen**, 16 Gegenproben, **kein neuer Stolperstein** — die
fünf aus 0.8.30 haben getragen. Einzelheiten in
`Doku/Aenderungsprotokoll_0.8.31.md`.

**0.8.30 davor — Stufe G4, „Die Linkliste bekommt Verfasser", alle fünf Punkte.**
Die erste Datenbankstufe seit 0.8.3 und die letzte offene Stufe des
Mehrbenutzerbetriebs vor H.

*Die Linkzeile bekommt einen Verfasser.* `links` trägt `user_id` mit
`ON DELETE SET NULL` — dieselbe Form wie an den vier anderen Trägern, in der
vollständigen DDL. Dazu `migration0830()` mit den Marken der Bauregel: einmalig,
wiederholbar und im Normalfall stumm. **Die Bestandszeilen fallen an den
Eintragsverfasser**, nicht an den Eigentümer; `ordneBestandZu()` nimmt `links`
trotzdem auf, weil es eine andere Frage zu einem anderen Zeitpunkt beantwortet
(Abschnitt 5).

*Die Rechte kehren sich um, aber nicht alle drei.* `POST /api/items/:id/links`
verliert `nurEintragVerfasser` und schreibt `req.benutzer.id`;
`DELETE /api/links/:id` klemmt auf `darfAendern(req, l.user_id)` statt auf
`eintragFrei(…, l.item_id)` — die Frage nach der **Zeile** statt nach dem
**Eintrag**; `PUT /api/items/:id/link-order` bleibt, wo es war.
**`F_ROUTEN` bleibt bei 46 Routen, und nur EINE Art wechselt** — der Auftrag
nahm zwei an. Die Art `'im Rumpf'` sagt nur, *dass* eine Klemme dasteht, nicht
*welche*; die Wende wäre für die Liste unsichtbar gewesen. Zwei eigene
Quelltextprüfungen halten sie jetzt fest.

*Der Name steht an der fremden Zeile, nicht an jeder.* Zwei Bedingungen
(Abschnitt 5): mehrere Zugänge **und** eine Zeile, die nicht vom Verfasser des
Eintrags stammt. Er steht in der zweiten Zeile neben Pfad bzw. Anbieternamen
und ist **unverkürzbar** — ohne diese Aufteilung fräße ein langer Pfad genau
die Angabe weg, um derentwillen die Zeile ihn trägt. Das Datum steht im
Überfahrtext; auf einem Berührbildschirm ist es damit nicht erreichbar, und
das ist bewusst getragen.

*Formatnummer 6 → 7.* Ein Link ist im Export ein Objekt aus `url` und
`author`. Der Import liest **beide** Formen; ein Link aus einer Datei der
Formatnummer 6 fällt an den **Verfasser des Eintrags** — dieselbe Antwort wie
beim Migration und aus demselben Grund.

*Und was daran hing.* `GET /api/items/:id/bestand` nennt Links getrennt nach
eigen und fremd, `auth.zaehleBestand()` kannte sie überhaupt nicht, und
`entferneZugang()` räumt sie beim zweiten Häkchen jetzt wirklich mit weg — eine
Zahl im Dialog, die nichts bewirkt, wäre schlimmer als keine.

**1624 von 1624 Prüfungen**, 31 Gegenproben. Fünf neue Stolpersteine (101 bis
105) und eine achte Lücke im Prüfstand (Abschnitt 7) — gefunden von der einen
Gegenprobe, die **stumm** blieb.

Als Nächstes **0.8.40 — Gewichtung der Bewertungskriterien**, siehe
Abschnitt 10. Sie hebt die
Formatnummer erneut (**8 → 9**, nachdem 0.8.31 die 8 belegt hat).

| Version | Was |
|---|---|
| 0.8.20 | „Die Schotten dicht", alle fünf Punkte: Fotoweg leitet den ausgelieferten Typ aus den ersten Bytes ab und weist beim Hochladen alles ab, was kein Rasterbild ist; `Content-Security-Policy` für die Anwendung; `X-Forwarded-For` nur nach ausdrücklicher Einstellung samt `Secure`/HSTS/`__Host-`; Fehler-Handler nach Rang; sauberes Herunterfahren; Index auf `sessions.user_id`; `HEALTHCHECK` im Image |
| 0.8.10 | Werkzeug, alle fünf Punkte: `package-lock.json` eingecheckt und `npm ci` statt `npm install`, `sharp` auf 0.35.3, Image auf Node 22, Versions-Fingerprint über die ausgelieferten Dateien, Prüfstand in Gruppen aufrufbar und bei jedem Push |
| 0.8.6 | Berichtigungen aus dem Betrieb, alle fünf Punkte: Bewertungsdetails gehören dem Admin (samt Löschweg für eine fremde Bewertung), Linkliste abgeschnitten statt scrollbar, `grid-auto-flow: dense` schließt die Lücke im Kartenraster, „Angemeldet als" auch bei einem Zugang, „Angelegt von" nennt auch das Datum |
| 0.8.5 | Stufe G3: dreizehn Karten des Systembereichs nach Rolle, `GET /api/stats` hinter `nurAdmin`, Karte „Links" in zwei geschnitten, Kachel „Zugänge" über die volle Breite, Trennlinien, berichtigte `AUTH_RESET`-Zeile |
| 0.8.4 | Stufe G2, zweite Hälfte, Rest — alle fünf Punkte, **Stufe G2 vollständig**: Eingriffsvermerk nennt die Rolle, `updated_at` an den Bildwegen des Verfassers, Zahlen in der Kopfzeile des Kommentarblocks, die beiden Anlegen-Schalter, Umschalter „meine/alle" im Vergleich |
| 0.8.3 | Stufe G2, zweite Hälfte, erster Teil: Eingriffsvermerk am Kommentar (`images_removed`, erster Migrationscode seit der Bereinigung), `mine` am Kommentar samt Oberfläche, blaue Aufgabenmarke, Tagwolke klappt ganz auf |
| 0.8.2 | Stufe G2, erste Hälfte: Verfassernamen an vier Trägern als Objekt, Stimmenliste je Kriterium, Löschdialog am Eintrag (`GET .../bestand`), `DELETE /api/ratings/:id` für fremde Bewertungen |
| 0.8.1 | Bereinigung (keine Stufe): `legacy.js` und aller Migrationscode entfernt, Schema als vollständige DDL, Prüfstand auf frische Anlagen (−102 Prüfungen), Kommentare und Vokabular vereinheitlicht |
| 0.8.0 | Stufe G1: Karte „Zugänge", Rollenleiter `user` < `admin` < `eigentuemer` als vergebbarer Rollenwert, Sperren an zwei Stellen durchgesetzt, Namensbremse, Löschen als Grabstein mit freigegebenem Namen, `zugang.js` ersetzt `AUTH_RESET` |
| 0.7.2 | Stufe F: serverseitige Rechteschicht für alle schreibenden Endpunkte, Export/Import nur Eigentümer, „Leitung" → „Admin", Selbstbezugsfehler entfernt |
| 0.7.1 | Stufe E2: Export/Import mit Verfassernamen an vier Trägern, Formatversion 6, unbekannte Namen fallen an den Eigentümer |
| 0.7.0 | Stufe E: eigene Sterne neben Schnitt und Bewerterzahl je Kriterium, zweistufiger Gesamtschnitt, `mine`-Kennung an Testtagen, Kriterien nur noch im Systembereich |
| 0.6.6 | Am Eintrag heißt es „Favorit", sortiert nicht mehr vor, eigener Filter „★ Favoriten" |
| 0.6.5 | Stufe D: `user_settings` — sechs Schlüssel werden persönlich |
| 0.6.4 | Berichtigung: Favoriten-Knopf zeichnete sich nach dem Klick nicht neu (Stolperstein 61) |
| 0.6.3 | Stufe C2: `item_pins` je Benutzer statt `items.favorite`; Favorit rührt `updated_at` nicht mehr an |
| 0.6.2 | Stufe C: Tabellenneubau — `ratings` und `test_days` mit `user_id` im UNIQUE |
| 0.6.1 | Stufe B: `user_id` an `items`, `comments`, `test_days`; Bestand fällt dem ersten Benutzer zu |
| 0.6.0 | Stufe A: `users` um Rolle, Adresse, Status, letzte Anmeldung; `sessions.user_id`; `req.benutzer` |
| 0.5.11 | Mehrere Suchanbieter je Suchzeile; Anbieterliste aus `app.js` in den Server gezogen |
| 0.5.10 | Umbenennung auf „Kriterion", ohne jede Funktionsänderung; Cookiename wechselte mit |
| 0.5.9 | Erledigt-Zustand für Aufgaben (vierter `kind`-Wert, Weiterschaltung auf demselben Knopf) |
| 0.5.8 | Kriterien werden nur noch im Systembereich gelöscht |
| 0.5.7 | Dritte Kommentarart: Aufgabe |
| 0.5.6 | Zoom im Vollbild startet in der Mitte |
| 0.5.5 | Kennzeichnung von Art und Anheftung am Kommentar (reines Stylesheet) |
| 0.5.4 | Links im Kommentartext anklickbar; dabei fiel die fehlende Maskierungsprüfung auf |
| 0.5.3 | Suchlink aus Nicht-Adressen; vorher bekam *jede* Eingabe ohne Schema `https://` davor |
| 0.5.2 | Reihenfolge der Berichte umgedreht — innerhalb jeder Gruppe das Älteste oben |
| 0.5.1 | Ausschnitt-Modus ließ sich nicht verlassen (Stolperstein 41) |
| 0.5.0 | Erstanmeldung, Zugang als scrypt-Hash in `users` statt in der Umgebung |
| 0.4.10 | Versionsnummer auf der Anmeldeseite (Stolperstein 38) |
| 0.4.9 | Sprung beim Bearbeiten der Beschreibung (Stolperstein 37) |
| 0.4.8 | Handy-Paket, zweiter Teil; Filterwahl sprang beim Zurückgehen zurück (Stolperstein 35) |
| 0.4.7 | Handy-Paket: Ziehen erst nach Halten, Zeilenaktionen als Zeichen, Schriftskala 80–120 |
| 4.5 | Und/Oder-Verknüpfung der Tagfilter (vorher war ODER fest verdrahtet) |
| 4.4.2 | Dateizeilen reagieren als Ganzes auf einen Klick |
| 4.4.1 | PDF-Vorschau blieb leer, Löschkreuz war unsichtbar (Stolpersteine 29 und 30) |
| 4.4 | Anhänge am Eintrag samt `anhaenge.js` |
| 4.3 | Tags an Testtagen, Zeitleiste, Blöcke anordnen, Tagwolken aufklappbar |
| 4.2 | Schriftgröße einstellbar, anpassbares Vokabular |
| 4.1 | Bewertungskriterien pflegen, mitwachsende Felder, Prüfstand |

---

## 10. Zurückgestellt und offen

### Der Stufenplan bis 1.0

**Hier steht der Plan, und sonst nirgends.** Der Mehrbenutzerbetrieb bringt
seine eigenen Stufen im Konzeptpapier mit (G4, H, I); ihre Versionsnummern
stehen unten mit drin, ihr Inhalt bleibt dort.

**Die Nummern gehen in Zehnerschritten.** Die neun Nummern zwischen zwei
Stufen bleiben für Berichtigungs- und Bereinigungsrunden frei — 0.8.1 und
0.8.6 waren genau das und mussten sich in eine geplante Nummer drängen.
**Mit 0.8.31 hat sich das zum ersten Mal ausgezahlt:** eine Runde, die
sachlich zu einer bereits gebauten Stufe gehört, hat eine freie Nummer bekommen
statt alles darüber zu verschieben. *Die Formatnummer rückt trotzdem weiter —
sie hängt am Inhalt der Exportdatei, nicht an der Versionsnummer.*
Nachgeprüft: `0.8.7.2` ist unbrauchbar (vier Zahlen sind kein gültiges
Versionsschema, `npm version` lehnt sie ab), `0.8.10` und `0.8.75` gehen
beide, und sortiert wird zahlweise — `0.8.9 < 0.8.10 < 0.8.20 < 0.9.0`.

| Version | Name | Was | Schema | Format |
|---|---|---|---|---|
| **0.8.10** | Werkzeug | `package-lock.json` einchecken, `npm ci` statt `npm install`, `sharp` auf 0.35, Versions-Fingerprint über die ausgelieferten Dateien, Prüflauf bei jedem Push, Prüfstand in Gruppen aufrufbar | — | — |
| **0.8.20** | Die Schotten dicht | SVG am Fotoweg, `X-Forwarded-For`, `Secure`-Cookie, Sicherheitsregel für die Anwendung selbst, Fehler-Handler, sauberes Herunterfahren, Index auf `sessions.user_id` | — | — |
| **0.8.30** | **Stufe G4** — Links bekommen Verfasser | `user_id` an `links`, eintragen offen, löschen beim Eintrager oder Admin, Name an der fremden Zeile, beide Löschdialoge | ja | 6 → 7 |
| **0.8.31** | *(keine Stufe)* Dateien bekommen Verfasser | dieselbe Wende am sechsten Träger — `user_id` an `attachments`, hochladen offen, löschen beim Hochladenden oder Admin | ja | 7 → 8 |
| **0.8.40** | Gewichtung der Kriterien | Gewicht 0,2 bis 2 je Kriterium, gewichteter Gesamtschnitt, Anzeige `×1,5`, `criteriaGewichte` im Austauschformat — Einzelheiten in Abschnitt 5 und `Doku/Aenderungsprotokoll_0.8.40.md` | ja | 8 → 9 |
| **0.8.50** | Kurzvideos am Fotoplatz | bis 20 MB, in der Datenbank, Standbild aus dem Browser — siehe `Konzept_Video_und_grosse_Dateien.md`, Teil I | ja | 9 → 10 |
| **0.8.60** | Was ist offen, was ist neu | Ansicht „Offen" über alle Einträge, Filter „Neu seit …" | — | — |
| **0.8.70** | Sicherung und Papierkorb | `VACUUM INTO` auf Knopfdruck (Punkt 8), Papierkorb, einzelnen Eintrag exportieren | ja, **ohne Migrationsblock** | — |
| **0.8.71** | *(keine Stufe)* Der Sicherungsort zieht um | in das Projektverzeichnis, dazu die rot/grüne Anzeige, wie er liegt — benannt, nicht verboten | nein | — |
| **0.8.80** | **Stufe H** — Tokens (**erledigt**) | Einladung und Rücksetzung über einen Link, dazu „Meine Sitzungen" | ja, **ohne Migrationsblock** | — |
| **0.8.90** | Schwere Eingriffe (**erledigt**) | zweite Bestätigung, Sicherheitsprotokoll, öffentliche Adresse | ja, **ohne Migrationsblock** | — |
| **0.8.91** | *(keine Stufe)* Der Schlüssel lässt sich wechseln | `PRAGMA rekey` samt Journalumschaltung, `.env`-Fall und Dateifall, die alten Sicherungen | nein | — |
| **0.9.0** | **Stufe I** — Mailversand und Selbstanmeldung | siehe Konzeptpapier | ja | — |
| **0.9.10** | Zwei-Faktor | TOTP und Wiederherstellungscodes | ja | — |
| **0.9.20** | Suche und Bestand | Volltextsuche, gespeicherte Ansichten, Doppelerkennung samt Zusammenführen | ja | — |
| **1.0.0** | Bereinigung und Zusage | Migrationscode raus, Absage an zu alte Datenbanken, Vorgabewerte (Punkt 7), Tastaturbedienung beim Sortieren, Abwärtskompatibilität wird zugesichert | — | — |
| **1.1.0** | Große Dateien bis 2 GB | Teil II des Videopapiers | ja | — |

**0.8.10 bis 0.8.90 sind gebaut** — Einzelheiten in Abschnitt 2 und
Abschnitt 9. Mit 0.8.30 ist **die erste Datenbankstufe seit 0.8.3** gefahren,
mit 0.8.31 die zweite, mit 0.8.40 die dritte, mit 0.8.50 die vierte, mit
0.8.70 die fünfte, mit 0.8.80 die sechste und mit **0.8.90 die siebte**; bei
allen sieben steht die Sicherung des Datenverzeichnisses als **Pflicht** im
Einspielweg (Abschnitt 2).
**0.8.60 und 0.8.71 sind die einzigen Runden seit 0.8.20, die das Schema nicht
angefasst haben.**

**0.8.70 ist die erste Datenbankstufe OHNE Migrationsblock, 0.8.80 die
zweite, 0.8.90 die dritte.** Alle drei bringen neue **Tabellen**, und
`CREATE TABLE IF NOT EXISTS` legt eine fehlende Tabelle bei jedem Start an — in
0.8.90 an `sicherheitsprotokoll` zum dritten Mal nachgestellt statt
abgeschrieben, samt der Gegenlage, dass eine **Spalte** nicht nachwächst. Es
bleibt bei **fünf** markierten Blöcken, und unter „Vorgemerkt für 1.0" kommt
**nichts** dazu.

**Als Nächstes 0.8.91 — der Schlüsselwechsel, und er ist eine eigene Runde.**
Er war Punkt 3 des Auftrags 0.8.90 und ist dort **bewusst herausgenommen
worden**, mit drei Gründen: er ist der einzige Knopf im ganzen Projekt, der bei
falscher Handhabung **alles** verliert; er hat beim Nachstellen seine Form
geändert (**Stolperstein 128** — `PRAGMA rekey` läuft im WAL-Modus nicht); und
er braucht einen eigenen Einspielweg samt Wegwerfanlage auf dem Server. Die
Runde 0.8.90 war mit Protokoll, Bestätigung und Adresse bereits so breit wie
0.8.80. *Der Stufenplan trägt das ohne Verschiebung: die neun Nummern zwischen
zwei Stufen sind genau dafür da, und 0.8.31 hat es schon einmal getragen.*
**Was 0.8.90 ihm vorgearbeitet hat:** die zweite Bestätigung steht bereit — der
Schlüsselwechsel bekommt sie als achten Weg —, und das Sicherheitsprotokoll
bekommt seinen fünfzehnten Vorgang. *Eine Protokollzeile nennt, DASS gewechselt
wurde, nie WOHIN.*
**Teil I des Videopapiers ist mit 0.8.50 abgearbeitet;** Teil II bleibt auf
1.1.0 und teilt mit Teil I keinen Code außer der Positivliste der Formate —
**und seit 0.8.70 eine Vorgabe zum Papierkorb**: eine Datei über rund 950 MB
passt nicht in eine Zelle und teilt sich auf mehrere `papierkorb_bytes.nr` auf.

**Der Sprung auf 0.9.0 liegt auf Stufe I, und das mit Absicht:** bis dahin
antwortet die Anlage nur auf Anfragen. Ab Stufe I baut sie **von sich aus**
eine Verbindung zu einem fremden Server auf. Das ist die größte Änderung der
Betriebsart im ganzen Plan, größer als jede einzelne Funktion davor.

**Die Reihenfolge ist nicht beliebig.** Vier Bindungen:

- **0.8.10 vor allem anderen** (erledigt). Ohne festgenagelte Abhängigkeiten
  wäre jeder Bau ein anderer gewesen, und ohne Prüflauf bei jedem Push liefe
  der Prüfstand nur, wenn jemand daran denkt. Beides sichert alles Folgende ab.
- **0.8.20 vor 0.8.50** (beide erledigt). Der Videoweg liefert eine Datei
  **inline** aus. Er durfte erst gebaut werden, wenn die Regel „der gemeldete
  Typ des Hochladenden wird nie ausgeliefert" auch am Fotoweg gilt.
  **Die Bindung hat sich beim Bauen bewährt:** der Videoweg ist durch
  `setzeBildHeader()` gegangen, ohne dass in `server.js` eine einzige
  Zeile dazukam, die den Typ selbst setzt — der Wächter blieb grün, und er hat
  seitdem eine Gegenprobe neben sich.
- **0.8.50 vor 0.8.70** (beide erledigt). Der Papierkorb serialisiert einen
  Eintrag. Da es schon Videos gab, ist die Serialisierung **einmal** gebaut
  worden statt einmal gebaut und einmal nachgezogen. **Die Bindung hat sich
  beim Bauen ausgezahlt, und zwar schärfer als erwartet:** die Videohälfte ist
  nicht bloß groß, sie sprengt als Base64 die Stringgrenze von Node. Wäre der
  Papierkorb vor 0.8.50 gebaut worden, stünde die Bauform heute falsch da und
  müsste umgebaut werden — mit Bestand darin.
- **0.8.10 und 0.8.20 vor 1.0.0** (beide erledigt). Eine Veröffentlichung
  heißt fremde Installationen. Danach stünden die beiden Befunde nicht mehr in
  einer Anlage, sondern in allen — deshalb lagen sie vorn und nicht hinten.
- **G4 vor 0.8.40** (beide erledigt). Beide heben die Formatnummer, und beide
  fassen das Schema an. Nacheinander gebaut heißt: zwei Formatnummern statt
  einer, zwei Migrationsblöcke statt einem — **und das ist bewusst so
  entschieden**. Das Ideenpapier schlägt das Zusammenlegen vor; die Regel
  „jede Stufe muss in einem Chat abzuarbeiten sein" wiegt schwerer als eine
  gesparte Formatnummer. G4 war mit Schema, Migration, Rechtewende, Oberfläche
  und Austauschformat bereits breit genug — **die Runde hat 76 Prüfungen und
  31 Gegenproben gebraucht**, und das war keine Reserve mehr.
  **Im Nachhinein bestätigt:** 0.8.40 allein brauchte 125 neue Prüfungen
  und 30 Gegenproben. Zusammengelegt wäre keine der beiden Runden in einem
  Durchgang fertig geworden.

**Die Herkunft der neuen Punkte** — Befunde, Messwerte und Begründungen —
steht in `Ideen_und_Vorschlaege.md`. Das Papier ist damit **Quelle, nicht
Stand**: was daraus gilt, steht ab jetzt hier.

### Die einzelnen Punkte

1.–4. *(erledigt bzw. aufgegangen in früheren Versionen — die Zählung bleibt,
damit alte Verweise stimmen.)*

5. **Mehrbenutzerbetrieb.** *Kein Anbau, ein Umbau.* **Dieser Punkt liegt
   vollständig in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_90.md` und wird
   nur noch dort gepflegt.** Die Stufen A bis F, G1, G2 und **G3** sind
   erledigt (0.6.0 bis 0.8.5); 0.8.1 (Bereinigung) und 0.8.6 (Berichtigungen
   aus dem Betrieb) waren keine Stufen.

   **0.8.6 ist eingespielt und läuft** — alle fünf Punkte, Einzelheiten in
   Abschnitt 5 und Abschnitt 9.

   **Stufe G4 ist gebaut (0.8.30) — „Die Linkliste bekommt Verfasser".**
   Damit sind die Stufen A bis G **vollständig**. Links darf jeder eintragen;
   löschen darf sie der Eintrager oder der Admin, sortieren bleibt beim
   Eintragsverfasser, und ab zwei Zugängen steht an einer **fremden** Zeile der
   Name ihres Eintragers. Das hat die Zeile „Titel, Beschreibung, Fotos,
   Dateien, Links, Tags, Kategorie" der Rechtetabelle umgekehrt und macht
   Links zum **fünften Träger** neben Eintrag, Kommentar, Testtag und
   Bewertung. Gebaut: `user_id` an `links` samt `migration0830()` und
   `ON DELETE SET NULL`, Bestandszeilen beim **Eintragsverfasser**, Export und
   Import mit Namen (**Formatnummer 6 → 7**), beide Löschdialoge um den
   fünften Träger ergänzt. Ein gelöschter Link bekommt weiterhin **keinen**
   Vermerk. Einzelheiten in Abschnitt 9 und in
   `Doku/Aenderungsprotokoll_0.8.30.md`.

   **Stufe H ist gebaut (0.8.80) — „Einladung, Rücksetzung, Sitzungen".**
   Zwischen G4 und H lagen mit 0.8.40 bis 0.8.71 vier Runden, die nicht zum
   Mehrbenutzerbetrieb gehörten. Ein Zugang entsteht seitdem wahlweise **ohne
   Passwort** und bekommt einen **Link**, über den sein Inhaber es selbst
   setzt; derselbe Mechanismus trägt die Rücksetzung. Gebaut: die Tabelle
   `tokens` **ohne Migrationsblock**, SHA-256 ohne Salz statt scrypt, sieben
   Tage, einmal gültig, beim Einlösen fallen alle Sitzungen **und alle übrigen
   offenen Links**; dazu die Karte **„Meine Sitzungen"** für jeden.
   `F_ROUTEN` 51 → 56, Formatnummer unverändert. Einzelheiten in Abschnitt 5
   und in `Doku/Aenderungsprotokoll_0.8.80.md`.

   *Dann:* **allein Stufe I (Mailversand und Selbstanmeldung) ist noch offen
   und bleibt 0.9.0.** Sie erbt den Token dieser Runde unverändert; was hier an
   Form entschieden wurde, gilt dort weiter. **Der Sprung auf 0.9.0 ist der
   größte im ganzen Plan** — ab dort baut die Anlage von sich aus eine
   Verbindung nach außen auf. Davor liegt mit **0.8.90** noch eine Runde, die
   nicht zum Mehrbenutzerbetrieb gehört.

   *Anmerkung, unverändert gültig:* eine Veröffentlichung setzt keinen
   Mehrbenutzerbetrieb voraus. „Für eine Person, dafür vollständig
   verschlüsselt" ist ein Merkmal, kein Mangel.

6. **Videos — beschlossen, und es sind zwei Vorhaben.** Der bisherige Eintrag
   („zurückgestellt, ein eigener Bauabschnitt") stimmte nur für die eine
   Hälfte. Ausgearbeitet in `Konzept_Video_und_grosse_Dateien.md`.

   **Kurzvideos am Fotoplatz — 0.8.50, also vor 1.0.** Bis 20 MB, als BLOB
   **in** der Datenbank wie ein Foto. Gemessen: 20 MB kosten 770 ms beim
   Schreiben und 124 ms beim Lesen; bei 50 MB wären es schon 533 ms beim
   Lesen, und der ganze Blob steht dabei im Arbeitsspeicher — daher die
   Grenze bei 20 MB.

   **Dieselbe Tabelle `photos`, eine Spalte `art` dazu.** Fotos und Videos
   stehen in **einer** Reihenfolge; zwei Tabellen hießen zwei sortierte
   Listen und damit zwei Quellen für die Frage, was das Hauptbild ist. Am
   Video gilt **jede Regel, die am Foto gilt** — dieselben Rechte, dieselbe
   Kaskade, dasselbe Ziehen zum Umsortieren.

   **Das Standbild macht der Browser**, vor dem Hochladen, über `<video>` und
   `<canvas>`. Damit **kein `ffmpeg`**, keine neue Abhängigkeit, und der
   Server öffnet nie ein Video — er speichert Bytes und liefert Bytes. Wer
   ein Video nicht abspielen kann, kann es auch nicht hochladen, und das ist
   richtig: ein Videoplatz, der nicht abspielt, ist ein kaputter Platz.

   **Große Dateien bis 2 GB — 1.1.0, also nach 1.0.** Sie können nicht in die
   Datenbank (Node hält keinen Buffer über 2 GB, und ohne Range-Abfragen
   spielt iOS Safari überhaupt nicht ab). Sie liegen daneben und bekommen
   eine **eigene Verschlüsselung**, deren Schlüssel aus dem
   Datenbankschlüssel abgeleitet wird — *ein Schlüssel für die Anlage* bleibt
   wahr. Nachgewiesen, dass man darin springen kann: AES-256 im Zählermodus,
   neun Sprungstellen geprüft, 1 MB aus der Mitte einer 50-MB-Datei in 15 ms.
   Gebaut wird trotzdem nicht mit CTR allein, sondern **stückweise mit
   Beglaubigung** — CTR schützt gegen Lesen, nicht gegen Verändern, und das
   wäre die einzige Stelle im Projekt, an der etwas *halb* geschützt ist.

   **Warum das eine vor und das andere nach 1.0 steht.** Ab 1.0 wird
   Abwärtskompatibilität zugesichert. Die Kurzvideos ändern eine **bestehende**
   Tabelle — so etwas gehört vor die Zusage, nicht dahinter. Die großen
   Dateien legen dagegen **neue** Tabellen und einen zweiten Speicherort an,
   ohne den bisherigen anzurühren: ein Anhang bleibt in der Datenbank, nur
   neue große gehen daneben. Deshalb bricht 1.1.0 die Zusage nicht.

   **Zwei Einschränkungen bleiben in beiden Fällen:** nicht jedes Format ist
   im Browser abspielbar (die Antwort darauf ist der Anhang, nicht ein
   Umkodierer), und der JSON-Export trägt Videodateien nur mit eigenem
   Schalter, große gar nicht.
7. **Vorgabewerte vor der Veröffentlichung durchsehen.** `title_app` hat im
   Server die Vorgabe „Model Bewertungen" — ein persönlicher Wert, der in einer
   frischen Installation für jeden dasteht. Dazu liegt die Vorgabe für
   `title_public` zweimal: im Server als „Bewertungskatalog", in
   `public/app.js` als „Kriterion". Harmlos, weil der Rückfall in der
   Oberfläche nur greift, wenn `/api/config` gar nicht antwortet — aber es ist
   die Form von Stolperstein 47 und gehört vor 1.0.0 auf eine Wahrheit gebracht.
8. **Sicherungskopie auf Knopfdruck — ERLEDIGT mit 0.8.70.** `VACUUM INTO`
   erzeugt eine **verschlüsselte**, vollständige und konsistente Kopie der
   Datenbank; ohne Schlüssel meldet sie „file is not a database". Gebaut sind
   die Karte „Sicherung" beim Eigentümer, der einstellbare Zielort, der
   Hinweis „letzte Sicherung vor N Tagen" aus dem **Dateisystem** und die
   Ansage der erwarteten Dauer.

   **Die Rollenteilung steht jetzt an beiden Karten**, nicht nur in den
   Dokumenten: `VACUUM INTO` ist der **Sicherungsweg**, der JSON-Export der
   **Austauschweg**. Die Grenze, die den Export für das eine zu schwer macht,
   ist inzwischen gemessen und benannt (Abschnitt 5): eine Exportdatei ist
   **ein** String, und Node hält keinen über 512 MB. Genau daraus folgt auch
   die Bauform des Papierkorbs.

### Vorgemerkt für 1.0

*Aus 0.8.10 und 0.8.20 ist hier nichts dazugekommen — beide haben das Schema
nicht angefasst. **Aus 0.8.30, 0.8.31, 0.8.40 und 0.8.50 ist je ein markierter
Block dazugekommen; es sind fünf.** **Aus 0.8.70 und 0.8.80 ist ebenfalls
nichts dazugekommen, obwohl beide das Schema anfassen** — sie bringen neue
TABELLEN, und die legt `CREATE TABLE IF NOT EXISTS` bei jedem Start selbst an.
Kein Block, kein Eintrag hier, kein sechster Migrationsabschnitt im Prüfstand.
**In 0.8.80 ist das an `tokens` erneut nachgestellt worden** statt aus der
Vorrunde abgeschrieben — samt der Gegenlage, dass eine **Spalte** nicht
nachwächst.*

- **Finale Bereinigung.** Der Rückbau des Migrationscodes wurde aus
  Notwendigkeit nach 0.8.0 vorgezogen; zu 1.0 folgt eine letzte Bereinigung
  über alles, was bis dahin dazukommt. **Daraus folgt eine Bauregel ab
  sofort:** jeder Code, der die Datenbank verändert, wird so geschnitten und
  gekennzeichnet, dass sein späterer Rückbau leichtfällt (Abschnitt 12).
- **`db.js`, `migration083()` — 18 Zeilen, 7 Prüfungen** (seit 0.8.3). Ergänzt
  `images_removed` an `comments` in einer Datenbank aus 0.8.0 bis 0.8.2.
  Zu 1.0 fällt der Block weg, **die Spalte in der DDL bleibt** — die Prüfung
  „Eine frische Anlage trägt die Spalte ohne Migration" hält genau das fest. Die
  zugehörigen Prüfungen stehen im Abschnitt „MIGRATION 0.8.3 — ENTFAELLT MIT 1.0"
  in `pruefung.js` (91 Zeilen); der Export von `migration083` in `module.exports`
  trägt dieselbe Marke und fällt mit.
- **`db.js`, `migration0830()` — 27 Zeilen samt Marken, 11 Prüfungen** (seit
  0.8.30). Ergänzt `user_id` an `links` in einer Datenbank aus 0.8.0 bis
  0.8.20 und ordnet die Bestandszeilen dem **Verfasser ihres Eintrags** zu. Zu
  1.0 fällt der Block weg, **die Spalte in der DDL bleibt** — dieselbe Prüfung
  hält es fest. Die zugehörigen Prüfungen stehen im Abschnitt „MIGRATION 0.8.30
  — ENTFAELLT MIT 1.0" in `pruefung.js` (124 Zeilen); der Export von
  `migration0830` in `module.exports` trägt dieselbe Marke und fällt mit.
  **Was ausdrücklich NICHT mitfällt:** `links` in der Tabellenliste von
  `ordneBestandZu()`. Das Auffangnetz ist keine Migration — es läuft bei jedem
  Start und beantwortet eine andere Frage (Abschnitt 5).
- **`db.js`, `migration0831()` — 27 Zeilen samt Marken, 13 Prüfungen** (seit
  0.8.31). Dasselbe an `attachments`, mit denselben Regeln: Bestandszeilen an
  den **Verfasser ihres Eintrags**, Spalte bleibt, Block fällt, `attachments`
  in `ordneBestandZu()` fällt **nicht** mit. Prüfabschnitt „MIGRATION 0.8.31 —
  ENTFAELLT MIT 1.0", Export von `migration0831` mit derselben Marke.
  **Eine Prüfung gehört ALLEN markierten Blöcken und fällt erst mit dem
  letzten:** „Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start". Sie
  steht im Abschnitt von 0.8.31 und ist beim Rückbau mitzunehmen — wer nur
  einen der Blöcke entfernt, muss sie umschreiben statt löschen. **Sie ist
  mit 0.8.50 erweitert worden, nicht verdoppelt**, und trägt jetzt auch eine
  Fototabelle ohne `art` und `dauer`.
- **`db.js`, `migration0840()` — 27 Zeilen samt Marken, 15 Prüfungen** (seit 0.8.40). Ergänzt `gewicht` an `rating_criteria` in einer
  Datenbank aus 0.8.0 bis 0.8.31; die Bestandszeilen bekommen 1,0 **aus dem
  `DEFAULT` der Spalte**, nicht aus einem `UPDATE`. Zu 1.0 fällt der Block
  weg, **die Spalte in der DDL bleibt** — dieselbe Prüfung hält es fest.
  Prüfabschnitt „MIGRATION 0.8.40 — ENTFAELLT MIT 1.0" in `pruefung.js`
  (196 Zeilen), Export von `migration0840` mit derselben Marke.
  **Was ausdrücklich NICHT mitfällt:** alles, was mit der Spalte selbst zu tun
  hat — `GEWICHT_MIN`/`GEWICHT_MAX`, `gueltigesGewicht()`, der JOIN in
  `qSchnittJeKriterium`, der gewichtete `gesamtSchnitt()`, das Feld in der
  Verwaltungskarte und `criteriaGewichte` im Austauschformat. Die Migration
  trägt die Spalte nach, er trägt die Gewichtung nicht.
  **Und `rating_criteria` kommt in `ordneBestandZu()` gar nicht vor** — anders
  als bei 0.8.30 und 0.8.31 gibt es hier nichts, was nicht mitfallen dürfte.
- **`db.js`, `migration0850()` — 33 Zeilen samt Marken, 26 Prüfungen** (seit
  0.8.50). Ergänzt `art` und `dauer` an `photos` in einer Datenbank aus 0.8.0
  bis 0.8.40; die Bestandszeilen bekommen `'bild'` **aus dem `DEFAULT` der
  Spalte**, `dauer` bleibt `NULL`. **Der einzige Block mit zwei Spalten — und
  deshalb der einzige, der jede einzeln abfragt** (Stolperstein 108). Zu 1.0
  fällt der Block weg, **die Spalten in der DDL bleiben** — dieselbe Prüfung
  hält es fest. Prüfabschnitt „MIGRATION 0.8.50 — ENTFAELLT MIT 1.0" in
  `pruefung.js` (rund 190 Zeilen), Export von `migration0850` mit derselben
  Marke.
  **Was ausdrücklich NICHT mitfällt:** alles, was mit den Spalten selbst zu tun
  hat — die Videoroute samt `VIDEO_MAX`, die Videotypen in `typAusBytes()` und
  `INLINE_ERLAUBT`, die Range-Auslieferung, `media-src` in der
  Sicherheitsregel, `art`/`dauer` in `qPhotos`, die getrennten Zahlen in
  Löschdialog und Kennzahlen, der Filter in `backfillVariants()` und der
  Videoschalter im Austauschformat. Die Migration trägt die Spalten nach, er
  trägt den Videoweg nicht.
  **Und `photos` kommt in `ordneBestandZu()` gar nicht vor** — wie schon bei
  0.8.40 gibt es hier nichts, was nicht mitfallen dürfte.
- **Harte Zurückweisung zu alter Datenbanken.** Seit 0.8.1 wird ein Bestand
  aus der Zeit vor 0.8.0 nicht mehr übernommen, aber auch nicht erkannt — der
  Start liefe in SQL-Fehler statt in eine Meldung. Vor 1.0 gehört an den
  Start eine klare Absage, die den Zwischenschritt über 0.8.0 nennt. **Seit
  0.8.3 wiegt der Punkt schwerer:** es gibt wieder Migrationscode, und eine
  Anlage aus der Zeit vor 0.8.0 läuft weiterhin wortlos in SQL-Fehler. **Mit
  0.8.50 gibt es davon fünf** — und `migration0830()` greift auf eine Tabelle
  `links` zu, die es in einer wirklich alten Anlage geben mag oder nicht.
  `rating_criteria` und `photos` gibt es dagegen seit jeher.
- **Abwärtskompatibilität.** Ab 1.0 wird sie zugesichert und
  aufrechterhalten. Fällt die Entscheidung früher, wird sie vorher final in
  die Dokumente eingearbeitet.
- **Die Vorgabewerte** (Punkt 7) gehören in 1.0.0. Aufzulösen ist die zweite
  Vorgabe für `title_public` in `public/app.js`, und zwar **zugunsten des
  Servers**: das Frontend bekommt gar keine. Antwortet `/api/config` nicht,
  zeigt die Anmeldeseite lieber nichts als etwas Falsches — das spart die
  zweite Wahrheit ganz, statt sie abzugleichen. Für `title_app` ist
  „Bewertungen" die neutrale Vorgabe.
- **Tastaturbedienung beim Sortieren.** Umsortiert wird an fünf Stellen
  (Fotos **und Videos**, Links, Kriterien, Blöcke, Tags am Testtag), überall
  ausschließlich über Zeigerereignisse. **Seit 0.8.30 hängt an der Linkzeile noch etwas
  daran:** das Datum des Eintragers steht nur im Überfahrtext und ist damit
  ohne Zeigegerät gar nicht erreichbar. Wer die Tastaturbedienung baut, sieht
  sich diese Stelle mit an. Im Frontend stehen **null** `tabindex` und zwei
  `aria-`Angaben auf 3.857 Zeilen. Wer keine Maus benutzen kann, kann die
  Reihenfolge der Fotos nicht ändern — und das erste Foto ist das Hauptbild.
  Die Antwort ist klein: `tabindex="0"` an der Zeile und `Alt+↑`/`Alt+↓` im
  Fokus. **Daraus eine Regel:** *Was sich ziehen lässt, muss sich auch mit der
  Tastatur bewegen lassen. Maus, Finger und Tastatur sind drei Fälle, nicht
  zwei.*
- **Ein Satz in die README: eine Anlage ist ein Sachgebiet.** Kriterien sind
  global und erscheinen an jedem Eintrag. Wer Modelle **und** Werkzeuge **und**
  Bezugsquellen in derselben Anlage sammelt, hat an jedem Eintrag die Kriterien
  aller drei stehen — bei 25 Kriterien ist die Detailansicht eine Wand aus
  Sternenzeilen, von denen zwei Drittel nie ausgefüllt werden. Das ist die
  einzige Annahme der Architektur, die nirgends aufgeschrieben ist.
  **Aufschreiben statt bauen:** wer zwei Sachgebiete sammelt, betreibt zwei
  Anlagen — was zur Linie „ein Schlüssel, eine Datenbank" ohnehin besser
  passt. Kriteriengruppen je Kategorie wären ein Umbau und sind ausdrücklich
  **nicht** vorgesehen.

**Ideen ohne Beschluss**, hier als Liste und sonst nirgends: Prüfung der
Wiederherstellung, Anzeige des Speicherverbrauchs, PWA-Manifest, Vorlagen für
Einträge, Tags in Mengen bearbeiten, Druckstylesheet, Fälligkeitsdatum an
Aufgaben, Erwähnungen im Kommentar.

*Herausgefallen, weil beschlossen:* Sicherung auf Anforderung und Endpunkt für
den Gesundheitszustand (0.8.20 bzw. 0.8.70), Doppelerkennung (0.9.20).

---

## 11. Beschlossen für die kommenden Stufen

Eingetragen im Konzeptpapier, hier als Merkzettel — **nur noch, was bindet.**
Eingelöste Merkposten fallen mit der Version heraus, in der sie gebaut sind;
was von ihnen als Regel weitergilt, steht in Abschnitt 5.

- **Wer eine schreibende Route ergänzt, trägt sie in `F_ROUTEN` im Prüfstand
  ein** — sonst wird der Lauf namentlich rot, und genau das ist der Zweck.
  Die Liste (aktuell 56 Routen) ist die Stelle, an der die Rechtefrage
  gestellt wird; seit 0.8.0 kennt sie die vierte Art `'nurAdmin, im Rumpf'`.
- **Ein lesender Endpunkt mit Wächter steht nicht in `F_ROUTEN`** — viermal
  angewandt (`GET /api/users/:id/bestand`, `GET /api/items/:id/bestand`,
  `GET /api/stats`, seit 0.8.6 `GET /api/items/:id/stimmen`). **`GET /api/offen`
  aus 0.8.60 ist der erste Fall daneben:** ein lesender Endpunkt **ohne**
  Wächter, wie `GET /api/items` — auch er steht dort nicht, und die Regel
  bleibt dieselbe. Die Liste ist
  die Stelle für **schreibende** Routen. **G4 hat die Zahl nicht bewegt:**
  es entstand keine schreibende Route — nur eine hat ihre Art gewechselt.
  **0.8.40 hat weder das eine noch das andere getan** — das Gewicht geht über
  `PUT /api/criteria/:id`, die es längst gibt; seitdem prüft der Prüfstand die
  **Zahl ausdrücklich**, nicht nur die Übereinstimmung der Liste mit dem
  Quelltext. **0.8.60 hat sie nicht bewegt** — die Ansicht „Offen" ist lesend,
  und der Erledigt-Haken geht über `PUT /api/comments/:id`, die es längst gibt.
  **0.8.70 bewegt sie um vier: 47 → 51** — zwei für den Papierkorb, zwei für
  die Sicherung. Die drei lesenden Endpunkte daneben (`GET /api/papierkorb`,
  `GET /api/items/:id/export`, `GET /api/sicherung`) stehen wie immer **nicht**
  in der Liste, obwohl alle drei einen Wächter tragen.
  **0.8.80 bewegt sie um fünf: 51 → 56** — drei für den Token, zwei für „Meine
  Sitzungen". `GET /api/sessions` steht wie immer **nicht** dort.
  **Zwei Besonderheiten dieser Runde gehören genannt:** `POST /api/token/pruefen`
  **liest nur** und steht trotzdem in der Liste — der Wächter sieht jedes
  `app.post(` an, und eine Route stillschweigend auszunehmen wäre genau die
  fehlende Entscheidung, die er finden soll. Und die Art `'selbstbezug'` prüft
  seit dieser Runde die **Herkunft der Benutzernummer** statt den Namen einer
  Funktion: sie muss aus `req.benutzer` kommen und darf nicht aus `req.params`.
  *Wird ein Endpunkt erweitert, sind die Prüfungen der Vorgängerversion die
  ersten Betroffenen* (Stolperstein 74).
  **0.8.50 hat sie zum ersten Mal seit langem bewegt: 46 → 47**,
  mit `POST /api/items/:id/videos` hinter `nurEintragVerfasser`. Die Route ist
  eigens entstanden, statt die Fotoroute zu erweitern — deren `fileFilter`
  wäre dabei gelockert worden, und das hätte die erste Schranke dem Fotoweg
  mit abgenommen.
- **Eine Einstellung, die an allen Einträgen aller Benutzer erscheint, gehört
  dem Admin — und in die Datenbank** (seit 0.8.4, am Gewicht in 0.8.40 zum
  wiederholten Mal angewandt). Nicht in `user_settings`: zwei Leute mit
  verschiedenen Werten hätten zwei verschiedene Wahrheiten über dieselbe
  Sache. Und nicht in eine Konfigurationsdatei: die stünde außerhalb der
  Verschlüsselung, außerhalb der Sicherung und außerhalb des Exports. `.env`
  trägt nur, was **vor** dem Öffnen der Datenbank lesbar sein muss.
- **Wer eine Zusicherung über eine Zahl gibt, sucht den Rechenweg, der sie
  baulich wahr macht** (seit 0.8.40). „Nie über 5, nie unter 1" ist keine
  Regel, die durchgesetzt wird, sondern eine Eigenschaft des gewichteten
  Mittels. Dieselbe Bauform wie die Rollenleiter aus 0.8.0: *ein Deckel, den
  es nicht gibt, kann nicht vergessen werden.* Und die Kehrseite gehört dazu:
  **wo ein Rechenweg eine Zusicherung trägt, ist die eine Stelle, an der er
  kippen kann, im Quelltext zu benennen** — hier der Nenner, der nur über die
  bewerteten Kriterien gehen darf.
- **Die Art in `F_ROUTEN` sagt nicht, WELCHE Klemme im Rumpf steht** (seit
  0.8.30). `eintragFrei(`, `darfAendern(`, `nurSelbst(` und die Übrigen stehen
  alle in `RUMPF_WOERTER`; die Art `'im Rumpf'` unterscheidet sie nicht. Wer
  eine Klemme durch eine andere ersetzt — etwa die Frage nach dem *Eintrag*
  durch die nach der *Zeile* —, bewegt die Liste nicht und braucht eine eigene
  Quelltextprüfung daneben. Dreimal gebaut: an
  `DELETE /api/comment-images/:id` (0.8.4), an `DELETE /api/links/:id` (0.8.30)
  und an `DELETE /api/attachments/:id` (0.8.31).
- **Wo `'offen'` steht, steht weder eine Klemme im Rumpf noch ein Wächter in
  der Routenzeile** (seit 0.8.30, Stolperstein 101). Bis dahin prüfte der
  Wächter über den Quelltext nur den Rumpf — ein Wächter, der in die
  Routenzeile zurückwanderte, blieb ihm unsichtbar. Beide Richtungen werden
  jetzt geprüft.
- **Wer aus einer Nummer einen Namen machen muss, hat zwei Muster** — und sie
  gehen in verschiedene Richtungen. `verfasserKarte()` in `server.js` macht aus
  einer Nummer einen Verfasser (für den Bildschirm, als Objekt),
  `verfasserName()` im Export macht aus ihr einen Namen (für die Datei, als
  String), und `verfasser()` im Import macht aus einem Namen eine Nummer.
  `daten.ich` und `daten.darfRollen` gelten nur für die Karte „Zugänge", und
  `GET /api/users` steht hinter `nurAdmin` — für die Beiträge im Eintrag liegt
  dort nichts bereit.
- **Wird ein Endpunkt eingeschränkt, sind die Prüfungen der Vorgängerversion
  die ersten Betroffenen** (Stolperstein 74) — bindet weiterhin, und zwar für
  jede kommende Stufe. **Für 0.8.6 eingelöst:** die Stimmenliste aus 0.8.2 hat
  ihre Prüfungen an der Sternzeile verloren und an der Adminansicht
  wiederbekommen — vier serverseitig, sieben in der Oberfläche umgehängt, drei
  umgedreht, keine gelöscht. **Umdrehen oder umhängen, nicht löschen** ist
  damit in fünf aufeinanderfolgenden Versionen angewandt worden.
- **Wer eine Anzeige einschränkt, prüft zuerst, was an ihr hängt** (seit
  0.8.6). Am ✕ der Stimmenliste hing der einzige Weg zu einer fremden
  Bewertung; wäre die Liste ersatzlos verschwunden, wäre der Endpunkt darunter
  vom Bildschirm aus unerreichbar geworden. **Die Frage gehört vor den Bau,
  nicht in die Gegenprobe.**
- **Eine Regel, die an einer Stelle geprüft ist und an der zweiten nur
  behauptet, ist an der zweiten ungeprüft** (seit 0.8.31). Die Anzeigeregel für
  den Verfassernamen gilt an Link- und Dateizeile gleich; jede hat trotzdem
  ihre eigenen Gegenlagen bekommen, einschließlich der Stylesheet-Regel. Wer
  eine bestehende Regel auf einen weiteren Ort ausdehnt, dehnt die Prüfungen
  mit aus — er verweist nicht auf die vorhandenen.
- **Ein Wächter kann mehr sein als eine Rechtefrage** (seit 0.8.31). Vor
  `POST /api/items/:id/attachments` stand `nurEintragVerfasser` **vor multer**,
  ausdrücklich, damit die Datei eines Fremden gar nicht erst eingelesen wird.
  Wer einen Wächter entfernt, liest zuerst, warum er dort steht: hier fiel mit
  der Rechtefrage auch die Schonung mit weg, und was blieb — die Mengengrenze —
  stand ohnehin an anderer Stelle.
- **Ein Vermerk gehört dorthin, wo aus einer Aussage etwas herausgenommen
  wird — nicht dorthin, wo eine ganze Aussage verschwindet.** Der
  Eingriffsvermerk am Kommentar ist die einzige Ausnahme von „kein
  Änderungsverlauf" und für **alle** sichtbar (gebaut in 0.8.3/0.8.4, siehe
  Abschnitt 5). Ein gelöschter Kommentar und ein gelöschter Link bekommen
  deshalb keinen — **in 0.8.30 am fünften Träger bestätigt und so gebaut.**
- **Jede von Hand angelegte Prüfzeile trägt ihren Verfasser ausdrücklich**
  (seit 0.8.30, Stolperstein 104). Es gibt **sechs** Tabellen mit `user_id`; eine
  Zeile ohne sie überlebt den nächsten Start nicht so, wie sie angelegt wurde —
  `ordneBestandZu()` schiebt sie dem Eigentümer zu, und eine Prüfung auf
  „fremd" prüft danach etwas anderes, als ihr Name sagt.
  **Seit 0.8.70 gibt es eine SIEBTE Spalte mit `user_id`-Charakter**,
  `papierkorb.geloescht_von` — und sie steht ausdrücklich **nicht** im
  Auffangnetz (Abschnitt 5). Wer dort eine Tabelle ergänzt, prüft zuerst, ob
  ihre Spalte eine **Zugehörigkeit** ist oder die Feststellung eines
  **Vorgangs**.
- **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (seit 0.8.30, Stolperstein 102). Der
  Mock in `baueDom` bringt die Felder selbst mit; er kann eine
  fehlende Serverantwort nicht bemerken. Wer ein Feld ergänzt, ergänzt beides.
  **In 0.8.50 an `art` und `dauer` angewandt**, an den Fotozeilen von
  `detail()` **und** von `/api/items`.
- **Der Mock trägt beide Fälle, wenn eine Spalte zwei Bedeutungen
  hat** (seit 0.8.50, Stolperstein 90 verschärft). Seine Fotoliste enthält ein
  Bild **und** ein Video, und das Video steht ausdrücklich **nicht** an erster
  Stelle: nur so lassen sich Hauptbild und Abspielzeichen unabhängig
  voneinander belegen. Ein Mock mit lauter Bildern nähme genau die
  Prüfungen weg, für die er gebaut wird.
- **Wer eine Spalte mit zwei Bedeutungen einführt, geht jede Stelle durch, die
  sie ohne Fallunterscheidung liest** (seit 0.8.50, Stolperstein 109). In
  0.8.50 war das `backfillVariants()`; gefunden wurde es beim Durchgehen der
  Liste „welche Regel gilt von selbst", nicht von einer Prüfung.
- **Fotos und Videos stehen in EINER Tabelle, und das darf keine Ausnahme
  bekommen** (seit 0.8.50). Wer künftig eine Abfrage auf `photos` schreibt,
  entscheidet ausdrücklich, ob sie beide Arten meint. Die drei Stellen, an
  denen die Trennung gebaut ist, sind Löschdialog, Kennzahlen und Export; jede
  andere Stelle behandelt beide Arten gleich, und das ist der Zweck der
  Bauform.
- **Die Rollen sind eine Leiter, auch in der Prüflage** (seit 0.8.5,
  Stolperstein 87). Wer `istAdmin: false` setzt, setzt `istEigentuemer`
  gleich mit — sonst baut die Prüflage einen Zustand nach, den der Server nie
  ausliefert.
- **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Er
  darf die Antwort weder vereinfachen noch erstarren lassen: was sich durch
  einen Schreibvorgang ändert, muss sich bei ihm wirklich ändern, und was
  hinter einem Wächter liegt, liegt auch bei ihm dahinter.
- **Die beiden Anlegen-Schalter sind eine Einstellung, keine Version.** Im
  Betrieb steht der bei den **Kategorien aus** und der bei den **Tags an**.
  Wer künftig „das Anlegen soll nur der Admin dürfen" hört, prüft **zuerst
  die Schalterstellung**, bevor er baut.
- **Die Übersicht sortiert weiter nach `updated_at` für alle:** die Liste
  zeigt, wo etwas geschieht, nicht wo ich zuletzt war. **Mit 0.8.60 eingelöst
  und als Regel weitergegeben** (Abschnitt 5): „Neu seit …" ist ein **Filter**,
  kein zweiter Sortierweg; der Merkzeitpunkt wird beim **Verlassen** gesetzt und
  um eine Sekunde nachgestellt, weil Zeitstempel Sekundenauflösung haben
  (**Stolperstein 60** — der Verweis lautete bis 0.8.60 an drei Stellen
  fälschlich auf 15). **Wer künftig eine persönliche Ansicht baut, baut einen
  Filter.**
- **Die Node-Version steht an zwei Stellen und muss an beiden dieselbe sein**
  (seit 0.8.10). Im `Dockerfile` (beide Stufen) und in
  `.github/workflows/pruefstand.yml`. Laufen sie auseinander, prüft der
  Prüflauf gegen etwas, das im Container so nicht betrieben wird — genau der
  Befund, der zu dieser Regel geführt hat (lokal 22, im Image 20). Der
  Prüfstand hält die beiden Zahlen gegeneinander.
- **Was der Server weder lädt noch ausliefert, steht nicht im Fingerprint**
  (seit 0.8.10). Die Liste dafür ist abgeleitet — `require.cache` plus
  `public/` —, nicht gepflegt; `pruefung.js`, `Doku/` und `zugang.js` können
  dadurch gar nicht erst hineingeraten. Wer ein weiteres serverseitiges Modul
  ergänzt, das beim Start geladen wird, sieht den Fingerprint dadurch wandern —
  das ist beabsichtigt, nicht zu unterdrücken.
- **Der Wächter über den ausgelieferten Typ bindet unmittelbar für 0.8.50**
  (eingelöst in 0.8.20, die Regel steht jetzt in Abschnitt 5). Keine Zeile in
  `server.js` setzt den Content-Type selbst; wer den Videoweg baut,
  entscheidet sich für einen der beiden Wege in `anhaenge.js` — Typ nach
  Endung oder Typ nach den ersten Bytes — und wird sonst namentlich rot.
- **Der Cookiename ist kein fester String mehr** (seit 0.8.20). Bei
  `HINTER_PROXY=1` heißt er `__Host-kriterion_session`. Wer in **0.8.80**
  „Meine Sitzungen" baut, nimmt ihn aus `auth.COOKIE_NAME` und schreibt ihn
  nirgends ab.
- **Ein Adressbuch, wer `X-Forwarded-For` setzen darf, ist bewusst nicht
  gebaut** (Entscheidung aus 0.8.20). Die Einstellung ist ein Ja/Nein. Wird
  die Anlage je aus mehreren Netzen zugleich erreichbar — oder soll der direkt
  erreichbare Port abgesichert werden, ohne ihn zu schließen —, gehört es
  nachgeliefert. Der einfachere Weg steht in Abschnitt 8.
- **Fotos und Videos stehen in EINER Reihenfolge** (ab 0.8.50). Deshalb
  dieselbe Tabelle mit einer Spalte `art`, keine zweite Tabelle. Und am Video
  gilt jede Regel, die am Foto gilt — Rechte, Kaskade, Umsortieren, Kennzahlen.
- **Der Server öffnet nie ein Video** (ab 0.8.50). Das Standbild macht der
  Browser vor dem Hochladen. Wer später einen Umkodierer vorschlägt,
  verhandelt damit eine neue Abhängigkeit von der Größe des halben Images —
  die Antwort auf ein nicht abspielbares Format ist der Anhang.
- **Was die Anlage als Ganzes trifft, wird ein zweites Mal bestätigt** —
  **mit 0.8.90 eingelöst** (Abschnitt 3). Was davon als Regel weitergilt:
  *die Rechtefrage steht vor der Bestätigungsfrage*, und *eine Bestätigung ist
  an die Sitzung gebunden, nicht an den Menschen*. **Der Schlüsselwechsel ist
  der eine Weg der Liste, der noch fehlt** — er kommt mit 0.8.91 als achter
  dazu und bekommt dabei keine neue Form, sondern die vorhandene.
- **Wer eine Datei aus dem Bestand baut, denkt an die Stringgrenze**
  (seit 0.8.70). Eine Exportdatei ist **ein** String, und Node hält keinen über
  512 MB. Der volle Export hält mit den Schaltern dagegen, der Einzelexport mit
  einer Absage, der Papierkorb mit einer Nebentabelle. **Wer einen vierten Weg
  ergänzt, entscheidet sich für einen davon** — es gibt keinen, der ohne
  auskommt.
- **Wer eine Ansicht ergänzt, holt ihren Bestand beim Aufbau**
  (seit 0.8.70, Stolperstein 118). `renderSystem()` hängt acht Abrufe in EIN
  `Promise.all`, jeder hinter der Rolle, hinter der auch seine Karte steht. Ein
  Nachladen aus der Karte heraus läuft als herrenlose Zusage weiter, wenn das
  Fenster längst zu ist — und reißt im Prüfstand den ganzen Lauf ab.
- **Wer an einen angegebenen Ort schreibt, prüft den aufgelösten Pfad**
  (seit 0.8.70, Stolperstein 120). Positivliste zuerst, `realpathSync` danach,
  und die Frage nach innerhalb/außerhalb an beiden Enden. Der Sicherungsort ist
  bis auf Weiteres die **einzige** Stelle, an der der Server an einen Ort
  schreibt, den jemand angeben darf; wer eine zweite baut, nimmt `pruefeOrt()`
  zum Vorbild und schreibt die Regel nicht ein zweites Mal hin.
- **Ein Sicherheitsprotokoll ist kein Änderungsverlauf** — **mit 0.8.90
  eingelöst** (Abschnitt 3). Was davon als Regel weitergilt: *was die Anlage
  betrifft, gehört hinein; was jemand gesagt hat, nicht*, und *eine Spalte, die
  einen Vorgang feststellt, ist keine Zugehörigkeit* — sie gehört nicht in
  `ordneBestandZu()`. **Wer einen Vorgang ergänzt**, trägt ihn in `VORGAENGE`
  ein und entscheidet, ob er ein Merkmal aus der geschlossenen Liste braucht;
  **Freitext von außen kommt in diese Tabelle nicht hinein.**
- **Die öffentliche Adresse gehört in die `.env`** — **mit 0.8.90 eingelöst**
  (Abschnitt 3). **Ab Stufe I ist sie Pflicht**, denn dort verschickt der
  Server selbst: *wer den Link von Hand weitergibt, hat einen Browser, der die
  Adresse kennt; wer ihn verschicken lässt, hat keinen.*

---

## 12. Arbeitsweise für die Fortsetzung

- **Vor dem Bauen besprechen.** Änderungswünsche erst durchdenken, Rückfragen
  stellen, Entscheidungen ausdrücklich bestätigen lassen, dann umsetzen. Wenn
  mir am Entwurf etwas unstimmig vorkommt, sage ich es vorher und nicht
  hinterher.
- **Kurze Chats.** Jede Nachricht verarbeitet den gesamten bisherigen Verlauf;
  lange Gespräche werden überproportional teuer. Für größere Vorhaben getrennte
  Chats je Bereich, jeweils mit diesem Blatt als Einstieg. Wird ein Auftrag zu
  groß für einen Durchgang, gehört das **vorher** gesagt.
- **Gezielt ändern statt neu erzeugen.** Das Projekt läuft; einzelne Dateien
  anzupassen ist fast immer günstiger als ein Neubau.
- **Erst nachstellen, dann behaupten.** Was an einer Datenbank oder an einem
  Pragma zweifelhaft ist, lässt sich in zwanzig Zeilen nachbauen. Die
  Stolpersteine 54, 57 und 58 sind so entstanden — **vor** dem Bauen.
- **Am Ende prüfen, nicht behaupten.** `npm test` läuft in Minuten. Neue
  Funktionen bekommen neue Prüfungen — und die Gegenprobe: die Änderung
  probeweise zurückbauen und zeigen, dass die Prüfung wirklich rot wird. Eine
  Gegenprobe, die stumm bleibt, ist ein Fund und kein Beleg.
- **Datenbankverändernder Code wird rückbaufreundlich gebaut.** Zu 1.0 kommt
  eine finale Bereinigung; bis dahin wird jede Änderung am Schema oder an
  Bestandsdaten so geschnitten und gekennzeichnet, dass sie sich später mit
  einem Griff entfernen oder zusammenfassen lässt.
- **Sprache im Projekt: Deutsch**, auch in Kommentaren, Oberfläche und
  Meldungen. **Fachbegriffe werden aber nicht zwanghaft eingedeutscht**
  (seit 0.8.60):

  > Wo die deutschsprachige IT ein englisches Wort benutzt, steht dieses Wort —
  > und wo es ein gebräuchliches deutsches gibt, steht das deutsche. Der Maßstab
  > ist weder „möglichst deutsch" noch „möglichst englisch", sondern **das Wort,
  > das ein deutschsprachiger Entwickler im Gespräch benutzen würde.**

  **Die Regel zielt auf übersetzte Lehnwörter, nicht auf die eigenen Bilder des
  Projekts.** „Stolperstein", „Gegenprobe", „Prüfstand", „Wächter" und „Klemme"
  sind keine Übersetzungen von irgendetwas Englischem — sie sind eigene
  Begriffe mit eigener Bedeutung und **bleiben**.

  Abgeräumt mit 0.8.60: Cookie (nicht `Keks`), Migration (nicht `Umstieg`),
  Image, Lockfile, Mock, Multipart, Branch, Downgrade, Event Loop, String,
  Fingerprint (nicht `Abdruck`). **„Kopfzeile" und „Bereich" nur dort, wo ein
  HTTP-Header bzw. ein Range gemeint ist** — die Kopfzeile der Anwendung, der
  Blockbereich der Detailansicht, der gültige Bereich eines Gewichts und der
  Zweig einer Verzweigung im Quelltext heißen weiter so. **Ein stures Suchen
  und Ersetzen richtet hier Schaden an.**

  **Ein Wächter im Prüfstand hält die Regel fest** („Der Sprachwaechter"): eine
  **kurze** Liste, gesucht in `Doku/` und in den Kommentaren des Quelltextes —
  ein Wächter, der jedes zweite Wort anmeckert, wird abgeschaltet. Er ist die
  ausdrückliche Ausnahme von Stolperstein 106 und sieht die Kommentare an;
  **Code lässt er in Ruhe**, und was in Backticks steht, ist zitierter Code und
  keine Sprache. **Die Regel gilt ab sofort für alles Neue**, unabhängig davon,
  wie weit die Bereinigung des Bestands geht.

