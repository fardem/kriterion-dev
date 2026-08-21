# Projektstand — Kriterion

**Kompakte Übergabe · Revision 9 · Stand 21. August 2026 · gebaut: Version 0.8.10**

Dieses Blatt fasst ein langes Entwicklungsgespräch zusammen. Es genügt, um in
einem frischen Chat weiterzuarbeiten, ohne den alten Verlauf mitzuschleppen.
**Gearbeitet wird im Repo `fardem/kriterion`**, nicht an einer Kopie; dieses
Blatt, das Konzeptpapier und die Änderungsprotokolle liegen dort unter
`Doku/`.

**Was Revision 9 ist.** Revision 8 trug 0.8.6 nach. Diese trägt **0.8.10**
nach — *keine Stufe des Umbaus, die erste Runde des neuen Stufenplans*
(Abschnitt 10): `package-lock.json` eingecheckt, `sharp` auf 0.35.3, das
Abbild auf Node 22, ein Versionsabdruck über die ausgelieferten Dateien, der
Prüfstand filterbar und ein Prüflauf bei jedem Push.
**Vollständig geblieben sind die Abschnitte 5, 5a und 12** — Entscheidungen,
Sicherheitsregel, Arbeitsweise. Bestände und Versionen vor 0.8.0 werden nicht
mehr berücksichtigt.

**Was als Nächstes ansteht, steht in Abschnitt 10.** Der Umbau auf mehrere
Benutzer wird in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_6.md` gepflegt und nur
dort.

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

**0.8.10 ist gebaut, alle Prüfungen grün, auf `main` gemergt.** *Keine Stufe
des Umbaus, die erste Runde des neuen Stufenplans* (Abschnitt 10):
`package-lock.json` liegt jetzt im Repo und der `Dockerfile` liest sie mit
`npm ci`, `sharp` steht auf 0.35.3 (die Lücke aus `npm audit` ist zu), das
Abbild auf Node 22, der Server bildet beim Start einen **Abdruck** über die
ausgelieferten Dateien (`GET /api/stats`, Karte „Kennzahlen"), der Prüfstand
lässt sich nach Gruppen filtern, und `.github/workflows/pruefstand.yml` fährt
ihn bei jedem Push.
**1480 von 1480 Prüfungen.**

**Die Einspielung auf dem Betriebsserver ist zum Stand dieses Blatts noch
nicht bestätigt.** Der gemeldete Abdruck wich zunächst vom erwarteten
`48fe44e7` ab — Ursache offen, geprüft werden sollten Zeilenenden, eine
überzählige Datei unter `public/` und ob wirklich der gepushte Stand gebaut
wurde (Abschnitt 2, „Eine unvollständige Kopie" unten). **Diese Zeile gehört
korrigiert, sobald der Abdruck übereinstimmt.**

**0.8.10 hat das Schema NICHT angefasst.** Kein Punkt hat eine Spalte oder
Tabelle gebraucht — die Punkte 1, 2 und 5 fassen nur den Bau an, Punkt 4 nur
den Prüfstand, Punkt 3 ist der einzige Eingriff in den Anwendungscode. Es ist
kein Umstiegscode entstanden; `umstieg083()` aus 0.8.3 bleibt der einzige,
weiterhin vorgemerkt für 1.0.

**Die beiden Anlegen-Schalter stehen im Betrieb so:** bei den **Kategorien
aus** (nur der Admin legt neue an, das Auswahlfeld am Eintrag bleibt), bei den
**Tags an** (jeder vergibt am Eintrag einen neuen Namen). Das ist eine
Einstellung im Systembereich, keine Version — beides jederzeit umkehrbar.

**Vorausgesetzt wird weiterhin eine Datenbank aus 0.8.0 oder neuer.** Ältere
Bestände werden nicht übernommen; sie bräuchten den Zwischenschritt über 0.8.0
als letzte Version mit Umstiegscode.

**Zurückrollen ist weiterhin eine reine Dateikopie.** Seit 0.8.3 (Spalte
`images_removed`) hat keine Version das Schema angefasst — wer von 0.8.6
zurückgeht, braucht keine Rücksicht darauf zu nehmen. **Das ändert sich mit
Stufe G4:** dort kommt eine Spalte an `links`. Vor jedem
Einspielen gehört trotzdem eine Sicherung des Datenverzeichnisses dazu, wie
immer.

**Der Weg zum Einspielen.** Das Repo ist **privat**, der Server zieht deshalb
nicht selbst — das ZIP kommt über „Download ZIP" von GitHub auf den Wirt. Der
Pfad steht am laufenden Container, kein Suchen, kein Abschreiben:

```bash
cd "$(docker inspect kriterion --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}')"
docker compose down
cd .. && cp -r kriterion/data ./sicherung-data-$(date +%F)   # bei Datenbankstufen
mv kriterion kriterion-alt
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion               # GitHub hängt den Zweignamen an
cp -r kriterion-alt/data kriterion/data
cp kriterion-alt/.env kriterion/.env      # OHNE DIESE ZEILE STARTET NICHTS
cd kriterion && docker compose up -d --build
```

Sechs Dinge, die dabei schiefgehen können, alle schon vorgekommen:

- **Der Ordner aus dem GitHub-ZIP heißt nicht `kriterion`.** GitHub packt den
  Zweignamen an: aus `main` wird `kriterion-main`, und Schrägstriche im
  Zweignamen werden zu Bindestrichen (`claude/g3-…` → `kriterion-claude-g3-…`).
  Ohne das `mv` legt das anschließende `cp -r kriterion-alt/data kriterion/data`
  den Bestand in einen Ordner, den `docker compose` nie ansieht — oder
  scheitert. **Der Zweigname steht damit im Einspielweg**: wer von einem
  Arbeitszweig lädt, passt beide Zeilen an.

- **`--build` vergessen.** `docker compose up -d` startet stillschweigend die
  alte Version weiter — der Quelltext steckt im Abbild, nicht im eingehängten
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
  ein — `public/app.js` steckt seit dem Bau **fest im Abbild** und muss vor
  dem `--build` auf der Platte liegen.

  **Seit 0.8.10 wird das über den Abdruck geprüft, nicht mehr über eine
  Textstelle je Version.** Angemeldet, in der Karte „Kennzahlen": ein Wert,
  der sich ändert, sobald irgendeine ausgelieferte Datei anders ist —
  `curl -s -b kekse.txt http://localhost:3100/api/stats` nennt ihn als
  `abdruck`. Der erwartete Wert steht zu jeder Version im Änderungsprotokoll
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

**Nicht auf Variablen umstellen:** Eine frühere Compose-Datei nutzte
`"${HOST_PORT:-3100}:3000"`. Die Ersetzung wurde auf dem Zielsystem nicht
aufgelöst, der Container startete ohne Portfreigabe. Der Port steht deshalb
unmittelbar da.

---

## 3. Zugang und Verschlüsselung

Mehrbenutzerbetrieb mit Rechteschicht: jede Sitzung weiß, wem sie gehört
(`sessions.user_id`), `requireAuth` legt den Benutzer als `req.benutzer` ab,
und jeder Eintrag, Kommentar, Testtag und jede Bewertung kennt ihren
Verfasser. **Jeder schreibende Endpunkt weiß, wer etwas darf:** der **Admin**
(`role = 'admin'`) verwaltet den gemeinsamen Bestand und löscht fremde
Beiträge, der **Eigentümer** (`role = 'eigentuemer'`) besitzt Export, Import,
Schlüsselwert und Rollenvergabe, alles am Eintrag gehört seinem Verfasser.
Was ein Admin ausdrücklich **nicht** darf: einen fremden Kommentartext
ändern, die Note eines fremden Testtags ändern, ein Bild an einen fremden
Kommentar hängen. **Löschen ja, umschreiben nein.** Bei einem einzigen Zugang
ist von alledem nichts zu merken.

**Der Zugang liegt als scrypt-Hash in der Tabelle `users`**, nicht in der
Umgebung; gesetzt wird er beim ersten Aufruf im Browser, und wer die Anlage
einrichtet, ist ihr Eigentümer. Es gibt keine voreingestellte Kennung.
Mindestens zehn Zeichen, sonst keine Regeln. Ohne Anmeldung ist außer dem
öffentlichen Titel nichts sichtbar — auch die Schnittstellen liefern nichts
aus, Fotos und Export eingeschlossen. Sitzung 30 Tage, Cookie
`kriterion_session` mit `HttpOnly`/`SameSite=Lax`. Die Anmeldebremse zählt je
IP (weich ab fünf Fehlversuchen, hart ab zehn für fünf Minuten) und
zusätzlich je Benutzername — dort nur verzögernd, nie sperrend.

**Passwort vergessen:** ein Befehl auf dem Wirt, keine Umgebungsvariable.

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

**Beim Entfernen eines Zugangs gehen seine Sitzungen, Favoriten und
persönlichen Einstellungen ausdrücklich mit weg** — sie sagen niemandem
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
`data/` nicht ins selbe Backup**. Ohne den Schlüssel sind die Daten endgültig
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

**Wer was geschrieben hat:** Eintrag, Kommentar und Testtag nennen ihren
Verfasser mit Namen, der Eintrag dazu **wann** er angelegt wurde. Ein
entfernter Zugang erscheint als „Gelöschter Benutzer 7", eine Zeile ohne
Verfasser als „Ohne Verfasser". **Bei genau einem aktiven Zugang bleibt davon
alles aus** — abgeleitet aus der Zahl der Zugänge, ohne Schalter.
**Die Bewertung sagt nur den eigenen Wert und den Schnitt** (seit 0.8.6). Wer
welchen Wert vergeben hat, sieht der **Admin in einer eigenen Ansicht**, die er
über „Wer hat bewertet" im Blockkopf ausdrücklich aufruft; dort entfernt er
auch eine fremde Bewertung. Die Note ändert er nicht.

**Wer angemeldet ist, steht in der Kopfzeile** (seit 0.8.6), neben „Abmelden" —
und zwar **auch bei einem einzigen Zugang**: das ist eine Aussage über einen
selbst, nicht über andere.

**Eintrag:** mehrere Fotos mit Vollbild, Zoom und einstellbarem Bildausschnitt
für die quadratische Vorschau, angehängte Dateien mit Vorschau, Beschreibung,
Kategorie, Tags, Bewertungskriterien, Testtage, Links, Kommentare, zwei
unabhängige Merkmale (getestet, abgelehnt), Favorit. Beschreibung und
Kommentarfelder wachsen mit dem Text. Tagwolke über drei Zeilen, Klick vergibt
und nimmt zurück. Testtage können eigene Tags tragen. Die Blöcke lassen sich per
Griff anordnen und per Klick auf die Kopfzeile einklappen — innerhalb ihres
Bereichs, nicht darüber hinaus.

**Systembereich: dreizehn Karten, und sie hängen an der Rolle** (seit 0.8.5;
die breite Kachel „Zugänge" lässt seit 0.8.6 keine Lücke mehr im Raster).
Dem **Admin**: beide Titel, Kennzahlen, Kategorien und Tags umbenennen und
löschen, Bewertungskriterien umbenennen, löschen und per Ziehen sortieren,
Karte „Zugänge" (anlegen, sperren, Passwort zurücksetzen, Rolle wechseln,
entfernen), Karte „Suchanbieter" (Vorrat, Startanbieter, drei eigene),
Vokabular aus elf Wörtern. Dem **Eigentümer** zusätzlich: Export mit/ohne
Fotos und Import (ersetzen oder zusammenführen).
**Jedem, auch ohne Rolle:** „Zugang" (eigener Name und Passwort),
„Darstellung" (Schriftgröße in fünf Stufen, Zeitleiste, Blockanordnung) und
„Links" (sichtbare Zeilen, Zahl der angezeigten Anbieternamen). Die Karten
„Kategorien", „Tags" und „Bewertungskriterien" stehen ebenfalls für jeden —
aber als **Liste ohne Bedienzeichen**: wer nicht verwalten darf, darf
trotzdem nachsehen.

**Links und Suchzeilen:** Was wie eine Adresse aussieht, wird eine — mit
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

**Dateien:** bis 50 MB je Stück, höchstens 20 je Eintrag, in der verschlüsselten
Datenbank. Vorschau für Bilder, PDF, Text/Markdown/CSV/Log und `.docx`; alles
andere wird heruntergeladen. Die Absicherung steht in Abschnitt 5a.

**Bilder:** Originale bleiben unverändert. Zusätzlich Kachel (400 px, ~17 KB)
und mittlere Variante (1600 px, ~140 KB). Übersicht nutzt die Kachel, Detail und
Vollbild die mittlere, erst der Zoom lädt das Original. Aufschlag rund 7 %,
Ersparnis beim Blättern etwa Faktor 100. Fotos ohne Varianten werden nach dem
Start im Hintergrund nachgerüstet.

---

## 5. Entscheidungen, die nicht rückgängig gemacht werden sollen

Diese Punkte wirken beim Lesen des Codes womöglich seltsam. Sie sind Absicht:

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
  Ziehen, mit Maus und Finger (Pointer-Events, nicht HTML5-Drag).
- **Keine Favicons bei den Links.** Sie würden von fremden Servern nachgeladen
  und brächen das Offline-Prinzip. Stattdessen Domain als Text.
- **Links: nur Adresse, keine Bezeichnung, keine Gruppen.** Bewusst verworfen.
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
  ein Rückschritt auf 0.5.10 noch beim richtigen Anbieter sucht. Zwei Orte, die
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
  die je Kriterium den besten Wert hervorhebt.
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
- **Der Keksname trägt den Projektnamen** (`kriterion_session` seit 0.5.10).
  Ihn zu wechseln macht alle Sitzungen ungültig — einmal neu anmelden, keine
  Datenfolge. Das ist bei einer Umbenennung der billigste Zeitpunkt dafür:
  Stufe A des Mehrbenutzerbetriebs fasst die Sitzungstabelle ohnehin an und
  kann die dann leere Tabelle sauber neu vergeben, statt bestehende Zeilen ohne
  `user_id` nachziehen zu müssen. Sonst meldete man sich zweimal neu an.
- **Eine Sitzung ohne Benutzer gilt nicht** (seit 0.6.0). `sitzungsBenutzer()`
  fragt über einen JOIN von `sessions` auf `users`; wo kein Benutzer hängt, gibt
  es keine Anmeldung. Im Betrieb kann das nicht vorkommen — beim Anlegen ist die
  Id Pflicht, bestehende Sitzungen wurden beim Umstieg nachgezogen, und mit dem
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
  stünden nach dem Umstieg alle ehemals angehefteten Einträge oben, und zwar für
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
  — jedes Kriterium hat dann höchstens eine Stimme. Der Umstieg auf 0.7.0
  ändert im Einbenutzerbetrieb also keine einzige Zahl.
  **Gerundet wird genau einmal, am Ende.** Je Kriterium vorzurunden und dann zu
  mitteln wäre ein zweiter Rundungsort für dieselbe Zahl; SQL und JavaScript
  müssten dafür gleich runden. Der Preis steht hier, damit ihn niemand für
  einen Fehler hält: wer die angezeigten Zehntel von Hand mittelt, kann um bis
  zu 0,05 danebenliegen.
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
  Aufrufstelle (nach der Übernahme aus der `.env`) ist mit dem Umstiegscode
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
  Umstiegscode entfernt. Die Lehre bleibt als Muster — eine Überführung
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
  Der Umbau ist in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_6.md` in neun Stufen
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
  gerade Gesperrter bis zum Ablauf seines Kekses drin, also bis zu dreißig Tage.
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
  einer Zeichenkette, weil ein Grabstein keinen Namen mehr hat und die
  Beschriftung aus der **Nummer** entsteht. Das Feld heißt ausdrücklich nicht
  `author` wie im Export: dort ist es eine blanke Zeichenkette, hier ein
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
  an, als **Ableitung beim Lesen** — kein Umstiegscode, nichts, was zu 1.0
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
- **Eine neue Spalte braucht beides: die DDL und einen Umstiegsblock** (seit
  0.8.3). `CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht an
  (Stolperstein 13), und seit 0.8.1 gibt es keinen anderen Nachrüstweg mehr.
  Die Vorgabe greift für jede **Zeile**, aber nur dort, wo die **Spalte**
  existiert — der Entwurf zu 0.8.3 verwechselte das und behauptete „kein
  Umstiegscode nötig". Die DDL bleibt trotzdem der Ort der Wahrheit: zu 1.0
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

---

## 5a. Die Sicherheitsregel für angehängte Dateien

**Eine Anlage darf niemals so ausgeliefert werden, dass der Browser sie als
Webseite ausführt.** Das ist die einzige Regel in diesem Projekt, bei der ein
Fehler nicht bloß ärgerlich wäre. Alles in `anhaenge.js` dient ihr. Sieben
Schichten, damit kein einzelner Fehler genügt:

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
6. **Der Dateiname wird für die Kopfzeile entschärft.** Zeilenumbrüche und
   Anführungszeichen raus, Umlaute über `filename*=UTF-8''`.
7. **Text wird nie als Datei ausgeliefert**, sondern gelesen und als JSON
   geschickt; die Oberfläche setzt ihn mit `textContent` in die Seite.

**Bei Anhängen wird bewusst nicht gefiltert.** Eine Positivliste dort wäre
durch Umbenennen zu umgehen und wiegte in falscher Sicherheit.

**Bilder in Kommentaren sind der eine Fall, in dem doch beim Hochladen geprüft
wird.** Dort ist ausschließlich Bild erlaubt: jede Datei geht durch `sharp` und
wird neu kodiert gespeichert, Unlesbares wird abgewiesen. Eine als `.png`
getarnte HTML-Datei kommt damit gar nicht erst in die Datenbank. Der
Unterschied ist beabsichtigt — bei Anhängen ist jede Datei erlaubt, bei
Kommentarbildern nicht.

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
einzelne dieser Schichten. Wer hier etwas ändert, lässt `npm test` laufen und
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
    nicht Zeichenketten.
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
    Ereignisschleife).
62. **Ein zusammengesetzter regulärer Ausdruck wird zweimal maskiert** —
    langweiliger Zeichenkettencode ist dort das kleinere Übel.
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
    Zeichenkette, und jede Verneinung darauf ist wahr — die Gegenprobe machte
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
90. **Ein Doppelgänger, der eine Antwort nur ausliefert, kann kein
    Neuzeichnen belegen.** Antwortet er auf ein Löschen zwar mit dem neuen
    Stand, liefert aber weiterhin dieselbe Liste, ist „die Ansicht zeichnet
    sich neu" von „die Ansicht blieb stehen" nicht zu unterscheiden — die
    Prüfung bliebe in beiden Fällen grün. **Ein Doppelgänger, dessen Antwort
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
95. **Ein Abdruck über Dateien ist erst dann vollständig, wenn alle Dateien
    schon geladen sind.** Er entsteht beim Start; ein `require` **innerhalb**
    einer Funktion liefe später und stünde dann nicht darin — der Abdruck
    würde still unvollständig, ohne dass irgendetwas rot wird. Dagegen hilft
    kein Kommentar, sondern ein Wächter über den Modulgraphen ab `server.js`.

---

## 7. Prüfstand

Der Prüfstand liegt als `pruefung.js` im Quelltext und läuft über `npm test`.
Er legt echte Server mit echten, verschlüsselten Datenbanken in
Wegwerfverzeichnissen an — `data/` bleibt unangetastet, und **alle Anlagen
entstehen frisch** über Einrichtungsseite und Verwaltung; einen präparierten
Altbestand gibt es seit 0.8.1 nicht mehr. Die Oberflächenprüfungen brauchen
`jsdom` (Entwicklungsabhängigkeit; per `.dockerignore` und `--omit=dev`
außerhalb des Docker-Abbilds).

**Zuletzt: 1480 von 1480 bestanden** (0.8.10; 51 neue Prüfungen, vier neue
Gruppen: „Der Bau ist wiederholbar", „Der Versionsabdruck", „Der
Gruppenfilter", „Der Prüflauf bei jedem Push"). Der Abschnitt
**„UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0"** mit sieben Prüfungen steht unverändert:
er stellt eine Datenbank aus 0.8.2 nach — dieselbe Anlage, nur ohne die neue
Spalte und mit einer Zeile darin — und belegt, dass der Umstieg sie ergänzt,
dass die Bestandszeile auf der Vorgabe null steht, dass ein zweiter Lauf stumm
bleibt und dass eine **frische** Anlage die Spalte ohne Umstieg trägt. Seit
0.8.4 hat keine Version einen eigenen Umstiegsabschnitt bekommen — keine hat
das Schema angefasst.

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
- **Export und Import** in beiden Richtungen, auch mit alten Exportdateien
  ohne die neueren Felder, samt Rundlauf durch drei Verfasser.
- **Oberfläche im echten DOM (`jsdom`):** mitwachsende Felder, Reihenfolge
  und Sichtbarkeit der Blöcke, Vergleichsansicht, Sternenzeile mit eigenem
  und gemitteltem Wert. **Der Favoriten-Stern bekommt ein wirklich
  zugestelltes Klickereignis** — ein Fehler hinter einem `await` bleibt im
  nur gebauten DOM sonst grundsätzlich unsichtbar (Stolperstein 61).
- **Dateien:** jede einzelne Schicht der Sicherheitsregel aus Abschnitt 5a —
  dafür lädt der Prüfstand eine echte HTML-Seite mit Skript und eine
  SVG-Datei hoch und sieht sich die Kopfzeilen der Antwort an. Die
  `.docx`-Vorschau wird an einer selbst gebauten, echten `.docx` geprüft.
- **Suchanbieter:** neun Plätze, Auswahl, Startanbieter, Nachrücken, die
  Schranken der Vorlage einzeln.
- **Mehrbenutzerbetrieb und Rechte:** mehrere echte Rufer nebeneinander
  (Stolperstein 56); jede Verweigerung einzeln, jede mit dem Erfolgsfall
  daneben **und** der Nachschau, dass wirklich nichts geschrieben wurde. Dazu
  ein **Admin ohne Eigentümerrolle** — ohne ihn ließe sich „Eigentümer" von
  „Admin" gar nicht unterscheiden.
- **Der Quelltext selbst:** eine gepflegte Liste **aller schreibenden Routen
  (aktuell 46)** samt der Art ihrer Absicherung, gehalten gegen das, was in
  `server.js` wirklich steht — in beide Richtungen, denn wo „offen" steht,
  darf auch nichts stehen. Dazu die Zählung, dass Adminfrage und
  Eigentümerfrage je genau einmal vorkommen, und der Wächter darauf, dass das
  Wort „Leitung" nirgends zurückkehrt. **Das ist die einzige Prüfung, die
  eine fehlende Entscheidung findet.**
- **Das Werkzeug selbst (seit 0.8.10):** die Sperrdatei, der `Dockerfile`, der
  Versionsabdruck und die Datei für den Prüflauf bei jedem Push — geprüft
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

**Sieben Lücken sind dabei schon aufgefallen — sie sind der eigentliche Ertrag:**

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
| 0.8.1 | Umstellung auf frische Anlage (102 Umstiegsprüfungen entfielen) | — | — |
| 0.8.2 | Stufe G2, erste Hälfte (61) | 19 | Stolpersteine 78, 79 und 80 |
| 0.8.3 | Stufe G2, zweite Hälfte, Punkte 1–4 (39) | 16 | Stolpersteine 81 und 82 |
| 0.8.4 | Stufe G2, zweite Hälfte, Rest — alle fünf Punkte (106) | 34 | Stolpersteine 83, 84, 85 und 86 |
| 0.8.5 | Stufe G3 — alle sechs Punkte (42) | 19 | Stolpersteine 87 und 88 |
| 0.8.6 | Berichtigungen aus dem Betrieb — alle fünf Punkte (38 netto) | 23 | Stolpersteine 89, 90 und 91 |
| 0.8.10 | Werkzeug — alle fünf Punkte (51) | 32 | Stolpersteine 92 bis 95 |

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
`.dockerignore` mit einem nie greifenden Muster bleibt „hält die Sperrdatei
nicht zurück" **grün** — Stolperstein 81 in Reinform, nur die Prüfung daneben
findet es. Und der naive Verzeichnislauf statt der Ableitung über
`require.cache` färbt genau die drei Prüfungen rot, die die Falle des Auftrags
benennen: `pruefung.js`, `Doku/` und `zugang.js` zählten mit.

| Rückbau | Ergebnis |
|---|---|
| `package-lock.json` wird in `.dockerignore` aufgenommen | **1 rot** |
| `npm ci` wird wieder `npm install` | 2 rot |
| die Sperrdatei fehlt ganz | 4 rot |
| `alsMuster()` trifft nie | **1 rot** — *Stolperstein 81 in Reinform* |
| `abdruck` fällt aus der Antwort von `/api/stats` | 5 rot |
| die Liste wird ein blosser Verzeichnislauf über alle `.js` der Wurzel | 4 rot |
| der **Name** geht nicht mehr in den Hash, nur der Inhalt | **1 rot** |
| `abdruck` wandert **zusätzlich** nach `/api/config` | 2 rot |
| der Doppelgänger kennt `abdruck` nicht mehr | **1 rot** — *Stolperstein 90* |
| ein `require` wandert in `db.js` in eine Funktion | **1 rot** — *Stolperstein 95* |
| der Schlussblock sagt nicht mehr, dass gefiltert wurde | **1 rot** |
| ein übergangener Fehlschlag färbt den Lauf doch rot | 2 rot |
| der Rückgabewert kümmert sich nicht mehr um den Filter ohne Treffer | **1 rot** |
| `node-version` im Prüflauf auf `'20'` | **1 rot** — *Abbild und Prüflauf laufen auseinander* |
| `--audit-level=high` wird `moderate` | 2 rot |
| die Datei für den Prüflauf fehlt ganz | 7 rot |

**Vollständige Tabelle im Änderungsprotokoll 0.8.10.** Kein Rückbau hat den
Lauf abgerissen, eine engere Zweitprobe nach Stolperstein 76 war nirgends
nötig.

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
- **Nach jedem Einspielen lohnt ein Blick ins Protokoll:** der Start meldet
  den Eigentümer, `.env`-Reste und — falls je nötig — die Zuordnung
  herrenlosen Bestands („Bestand ohne Benutzer dem Eigentuemer zugeordnet").

---

## 9. Versionsgeschichte

Die jüngste Version steht ausführlich; alles davor als eine Zeile — die
tragenden Entscheidungen dahinter leben in Abschnitt 5 weiter.

**0.8.10 — „Werkzeug", alle fünf Punkte.** Keine Stufe des Umbaus, die erste
Runde des neuen Stufenplans (Abschnitt 10). Fünf Punkte, kein Schema, kein
Umstiegscode, keine neue schreibende Route.

*Der Bau wird wiederholbar.* `package-lock.json` liegt jetzt im Repo
(`lockfileVersion 3`, 177 Pakete), der `Dockerfile` liest sie mit `npm ci
--omit=dev` statt `npm install --omit=dev` — ohne den Wechsel läge die Datei
nur ungenutzt daneben. Belegt außerhalb des Prüfstands: `npm ci` bricht ab, wo
`npm install` am selben Stand wortlos eine andere Version auflöste.

*`sharp` auf 0.35.3, das Abbild auf Node 22.* `npm audit` meldete für
`sharp <0.35` geerbte Lücken aus libvips mit dem Schweregrad „high"; danach
„found 0 vulnerabilities". Node 20 ist seit dem 30. April 2026 ohne Pflege.
Gemessen statt geglaubt: auf Node 22 übersetzt `better-sqlite3-multiple-ciphers`
gar nicht erst (Fertigbau für ABI 127), auf Node 24 gäbe es keinen und der Bau
fiele auf `node-gyp` zurück — deshalb 22, nicht 24.

*Ein Versionsnachweis, der wirklich trägt.* Der Server bildet beim Start einen
Abdruck (SHA-256, acht Zeichen) über das, was er tatsächlich lädt
(`require.cache`) und ausliefert (`public/`) — abgeleitet, nicht gepflegt.
`GET /api/stats` nennt ihn, die Karte „Kennzahlen" zeigt ihn. Er geht bewusst
**nicht** nach `/api/config`: die Liste dort ist eine Sicherheitsgrenze, die
mehr wert ist als die eine gesparte Anmeldung. `zugang.js` läuft nie im
Server und steht deshalb nicht im Abdruck — er sagt, welcher Server läuft,
nicht welches Werkzeug danebenliegt. **Das war die letzte Version, die dafür
eine Textstelle zum Gegenprüfen brauchte** — siehe Abschnitt 2.

*Der Prüfstand lässt sich filtern und läuft bei jedem Push.* `node
pruefung.js Rechte` zeigt nur passende Gruppen — die Arbeit bleibt dieselbe
(die Prüflagen bauen aufeinander auf), nur die Ausgabe schrumpft. Ein
gefilterter Lauf sagt das selbst und lässt den Rückgabewert dem Gezeigten
folgen. `.github/workflows/pruefstand.yml`: `npm ci`, `npm test`, `npm audit
--audit-level=high`, Node-Version identisch mit dem Abbild.

**1480 von 1480 Prüfungen**, 32 Gegenproben. Vier neue Stolpersteine (92 bis
95). `F_ROUTEN` unverändert 46. **Kein Punkt hat das Schema angefasst**, kein
Umstiegscode entstanden.

Als Nächstes **0.8.20 „Die Schotten dicht"** — SVG am Fotoweg,
`X-Forwarded-For`, `Secure`-Cookie und mehr. Danach **Stufe G4 auf 0.8.30**,
die erste Datenbankstufe seit 0.8.3. Siehe Abschnitt 10.

| Version | Was |
|---|---|
| 0.8.6 | Berichtigungen aus dem Betrieb, alle fünf Punkte: Bewertungsdetails gehören dem Admin (samt Löschweg für eine fremde Bewertung), Linkliste abgeschnitten statt scrollbar, `grid-auto-flow: dense` schließt die Lücke im Kartenraster, „Angemeldet als" auch bei einem Zugang, „Angelegt von" nennt auch das Datum |
| 0.8.5 | Stufe G3: dreizehn Karten des Systembereichs nach Rolle, `GET /api/stats` hinter `nurAdmin`, Karte „Links" in zwei geschnitten, Kachel „Zugänge" über die volle Breite, Trennlinien, berichtigte `AUTH_RESET`-Zeile |
| 0.8.4 | Stufe G2, zweite Hälfte, Rest — alle fünf Punkte, **Stufe G2 vollständig**: Eingriffsvermerk nennt die Rolle, `updated_at` an den Bildwegen des Verfassers, Zahlen in der Kopfzeile des Kommentarblocks, die beiden Anlegen-Schalter, Umschalter „meine/alle" im Vergleich |
| 0.8.3 | Stufe G2, zweite Hälfte, erster Teil: Eingriffsvermerk am Kommentar (`images_removed`, erster Umstiegscode seit der Bereinigung), `mine` am Kommentar samt Oberfläche, blaue Aufgabenmarke, Tagwolke klappt ganz auf |
| 0.8.2 | Stufe G2, erste Hälfte: Verfassernamen an vier Trägern als Objekt, Stimmenliste je Kriterium, Löschdialog am Eintrag (`GET .../bestand`), `DELETE /api/ratings/:id` für fremde Bewertungen |
| 0.8.1 | Bereinigung (keine Stufe): `legacy.js` und aller Umstiegscode entfernt, Schema als vollständige DDL, Prüfstand auf frische Anlagen (−102 Prüfungen), Kommentare und Vokabular vereinheitlicht |
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
| 0.5.10 | Umbenennung auf „Kriterion", ohne jede Funktionsänderung; Keksname wechselte mit |
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
Nachgeprüft: `0.8.7.2` ist unbrauchbar (vier Zahlen sind kein gültiges
Versionsschema, `npm version` lehnt sie ab), `0.8.10` und `0.8.75` gehen
beide, und sortiert wird zahlweise — `0.8.9 < 0.8.10 < 0.8.20 < 0.9.0`.

| Version | Name | Was | Schema | Format |
|---|---|---|---|---|
| **0.8.10** | Werkzeug | `package-lock.json` einchecken, `npm ci` statt `npm install`, `sharp` auf 0.35, Versionsabdruck über die ausgelieferten Dateien, Prüflauf bei jedem Push, Prüfstand in Gruppen aufrufbar | — | — |
| **0.8.20** | Die Schotten dicht | SVG am Fotoweg, `X-Forwarded-For`, `Secure`-Cookie, Sicherheitsregel für die Anwendung selbst, Fehler-Handler, sauberes Herunterfahren, Index auf `sessions.user_id` | — | — |
| **0.8.30** | **Stufe G4** — Links bekommen Verfasser | siehe Konzeptpapier | ja | 6 → 7 |
| **0.8.40** | Gewichtung der Kriterien | siehe `Konzept_Gewichtung_Bewertungskriterien.md` | ja | 7 → 8 |
| **0.8.50** | Kurzvideos am Fotoplatz | bis 20 MB, in der Datenbank, Standbild aus dem Browser — siehe `Konzept_Video_und_grosse_Dateien.md`, Teil I | ja | 8 → 9 |
| **0.8.60** | Was ist offen, was ist neu | Ansicht „Offen" über alle Einträge, Filter „Neu seit …" | — | — |
| **0.8.70** | Sicherung und Papierkorb | `VACUUM INTO` auf Knopfdruck (Punkt 8), Papierkorb, einzelnen Eintrag exportieren | ja | — |
| **0.8.80** | **Stufe H** — Tokens | Einladung und Rücksetzung, dazu „Meine Sitzungen" | ja | — |
| **0.8.90** | Schwere Eingriffe | Re-Authentifizierung, Sicherheitsprotokoll, Schlüssel wechseln | ja | — |
| **0.9.0** | **Stufe I** — Mailversand und Selbstanmeldung | siehe Konzeptpapier | ja | — |
| **0.9.10** | Zwei-Faktor | TOTP und Wiederherstellungscodes | ja | — |
| **0.9.20** | Suche und Bestand | Volltextsuche, gespeicherte Ansichten, Doppelerkennung samt Zusammenführen | ja | — |
| **1.0.0** | Bereinigung und Zusage | Umstiegscode raus, Absage an zu alte Datenbanken, Vorgabewerte (Punkt 7), Tastaturbedienung beim Sortieren, Abwärtskompatibilität wird zugesichert | — | — |
| **1.1.0** | Große Dateien bis 2 GB | Teil II des Videopapiers | ja | — |

**0.8.10 ist gebaut** — Einzelheiten in Abschnitt 2 und Abschnitt 9. Als
Nächstes **0.8.20**.

**Der Sprung auf 0.9.0 liegt auf Stufe I, und das mit Absicht:** bis dahin
antwortet die Anlage nur auf Anfragen. Ab Stufe I baut sie **von sich aus**
eine Verbindung zu einem fremden Server auf. Das ist die größte Änderung der
Betriebsart im ganzen Plan, größer als jede einzelne Funktion davor.

**Die Reihenfolge ist nicht beliebig.** Vier Bindungen:

- **0.8.10 vor allem anderen** (erledigt). Ohne festgenagelte Abhängigkeiten
  wäre jeder Bau ein anderer gewesen, und ohne Prüflauf bei jedem Push liefe
  der Prüfstand nur, wenn jemand daran denkt. Beides sichert alles Folgende ab.
- **0.8.20 vor 0.8.50.** Der Videoweg liefert eine Datei **inline** aus. Er
  darf erst gebaut werden, wenn die Regel „der gemeldete Typ des Hochladenden
  wird nie ausgeliefert" auch am Fotoweg gilt.
- **0.8.50 vor 0.8.70.** Der Papierkorb serialisiert einen Eintrag. Gibt es
  dann schon Videos, wird die Serialisierung **einmal** gebaut statt einmal
  gebaut und einmal nachgezogen.
- **0.8.10 und 0.8.20 vor 1.0.0.** Eine Veröffentlichung heißt fremde
  Installationen. Danach stehen die beiden Befunde nicht mehr in einer Anlage,
  sondern in allen.

**Die Herkunft der neuen Punkte** — Befunde, Messwerte und Begründungen —
steht in `Ideen_und_Vorschlaege.md`. Das Papier ist damit **Quelle, nicht
Stand**: was daraus gilt, steht ab jetzt hier.

### Die einzelnen Punkte

1.–4. *(erledigt bzw. aufgegangen in früheren Versionen — die Zählung bleibt,
damit alte Verweise stimmen.)*

5. **Mehrbenutzerbetrieb.** *Kein Anbau, ein Umbau.* **Dieser Punkt liegt
   vollständig in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_6.md` und wird
   nur noch dort gepflegt.** Die Stufen A bis F, G1, G2 und **G3** sind
   erledigt (0.6.0 bis 0.8.5); 0.8.1 (Bereinigung) und 0.8.6 (Berichtigungen
   aus dem Betrieb) waren keine Stufen.

   **0.8.6 ist eingespielt und läuft** — alle fünf Punkte, Einzelheiten in
   Abschnitt 5 und Abschnitt 9.

   **Als Nächstes: Stufe G4 auf 0.8.30 — „Die Linkliste bekommt Verfasser".**
   Davor liegt mit 0.8.20 noch eine Runde **ohne Schemaänderung** — 0.8.10 ist
   erledigt; die Begründung steht im Stufenplan oben.
   Links darf jeder eintragen; löschen darf sie der Eintrager oder der Admin,
   und ab zwei Zugängen steht sein Name an der Zeile. Das **kehrt die Zeile
   „Titel, Beschreibung, Fotos, Dateien, Links, Tags, Kategorie" der
   Rechtetabelle um** und macht Links zum fünften Träger neben Eintrag,
   Kommentar, Testtag und Bewertung. Umfang: `user_id` an `links` samt
   Umstiegsblock und `ON DELETE SET NULL`, Bestandszeilen fallen an den
   **Eintragsverfasser** (nicht an den Eigentümer, sonst gehörten die eigenen
   Links plötzlich jemand anderem); Export und Import nennen den Namen, also
   **Formatnummer 6 → 7**; Sortieren bleibt beim Eintragsverfasser und Admin;
   Platz in der Zeile prüfen, sie trägt schon Domain, Pfad und bis zu vier
   Anbieternamen. Ein gelöschter Link bekommt ausdrücklich **keinen** Vermerk.
   **Erste Datenbankstufe seit 0.8.3** — die Sicherung des Datenverzeichnisses
   gehört wieder ausdrücklich in den Einspielweg.

   *Dann:* **Stufe H (Tokens) wird 0.8.80**, **Stufe I (Mailversand und
   Selbstanmeldung) bleibt 0.9.0.** Zwischen G4 und H liegen mit 0.8.40 bis
   0.8.70 vier Stufen, die nicht zum Mehrbenutzerbetrieb gehören.

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
   Datenbank (Node hält keinen Buffer über 2 GB, und ohne Bereichsabfragen
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
8. **Sicherungskopie auf Knopfdruck — beschlossen, 0.8.70.** `VACUUM INTO`
   erzeugt eine **verschlüsselte**, vollständige und konsistente Kopie der
   Datenbank — geprüft, ohne Schlüssel meldet sie „file is not a database".
   Dazu ein Hinweis „letzte Sicherung vor N Tagen" und ein einstellbarer
   Zielort, damit die Kopie nicht neben dem Original liegt.

   **Dazu die Rollenteilung, die bisher nirgends stand:** `VACUUM INTO` ist
   der **Sicherungsweg**, der JSON-Export der **Austauschweg**. Beide werden
   gebraucht, aber für Verschiedenes — die Kopie ist konstant im
   Speicherbedarf und vollständig, der Export überlebt einen Formatwechsel
   und braucht keinen Schlüssel. Heute muss der Export beides sein und ist
   für das eine davon zu schwer: er baut **eine** JSON-Zeichenkette mit allen
   Fotos als Base64, und Node kann eine Zeichenkette über rund 512 MB nicht
   halten. Der Hinweis auf die erwartete Exportgröße gehört deshalb neben den
   Knopf.

### Vorgemerkt für 1.0

- **Finale Bereinigung.** Der Rückbau des Umstiegscodes wurde aus
  Notwendigkeit nach 0.8.0 vorgezogen; zu 1.0 folgt eine letzte Bereinigung
  über alles, was bis dahin dazukommt. **Daraus folgt eine Bauregel ab
  sofort:** jeder Code, der die Datenbank verändert, wird so geschnitten und
  gekennzeichnet, dass sein späterer Rückbau leichtfällt (Abschnitt 12).
- **`db.js`, `umstieg083()` — 18 Zeilen, 7 Prüfungen** (seit 0.8.3). Ergänzt
  `images_removed` an `comments` in einer Datenbank aus 0.8.0 bis 0.8.2.
  Zu 1.0 fällt der Block weg, **die Spalte in der DDL bleibt** — die Prüfung
  „Eine frische Anlage trägt die Spalte ohne Umstieg" hält genau das fest. Die
  zugehörigen Prüfungen stehen im Abschnitt „UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0"
  in `pruefung.js` (91 Zeilen); der Export von `umstieg083` in `module.exports`
  trägt dieselbe Marke und fällt mit.
- **Harte Zurückweisung zu alter Datenbanken.** Seit 0.8.1 wird ein Bestand
  aus der Zeit vor 0.8.0 nicht mehr übernommen, aber auch nicht erkannt — der
  Start liefe in SQL-Fehler statt in eine Meldung. Vor 1.0 gehört an den
  Start eine klare Absage, die den Zwischenschritt über 0.8.0 nennt. **Seit
  0.8.3 wiegt der Punkt schwerer:** es gibt wieder Umstiegscode, und eine
  Anlage aus der Zeit vor 0.8.0 läuft weiterhin wortlos in SQL-Fehler.
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
  (Fotos, Links, Kriterien, Blöcke, Tags am Testtag), überall ausschließlich
  über Zeigerereignisse. Im Frontend stehen **null** `tabindex` und zwei
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
  Die Liste (aktuell 46 Routen) ist die Stelle, an der die Rechtefrage
  gestellt wird; seit 0.8.0 kennt sie die vierte Art `'nurAdmin, im Rumpf'`.
- **Ein lesender Endpunkt mit Wächter steht nicht in `F_ROUTEN`** — viermal
  angewandt (`GET /api/users/:id/bestand`, `GET /api/items/:id/bestand`,
  `GET /api/stats`, seit 0.8.6 `GET /api/items/:id/stimmen`). Die Liste ist
  die Stelle für **schreibende** Routen; die Zahl bleibt bei 46, bis Stufe G4
  sie anfasst.
- **Wer aus einer Nummer einen Namen machen muss, hat zwei Muster** — und sie
  gehen in verschiedene Richtungen. `verfasserKarte()` in `server.js` macht aus
  einer Nummer einen Verfasser (für den Bildschirm, als Objekt),
  `verfasserName()` im Export macht aus ihr einen Namen (für die Datei, als
  Zeichenkette), und `verfasser()` im Import macht aus einem Namen eine Nummer.
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
- **Ein Vermerk gehört dorthin, wo aus einer Aussage etwas herausgenommen
  wird — nicht dorthin, wo eine ganze Aussage verschwindet.** Der
  Eingriffsvermerk am Kommentar ist die einzige Ausnahme von „kein
  Änderungsverlauf" und für **alle** sichtbar (gebaut in 0.8.3/0.8.4, siehe
  Abschnitt 5). Ein gelöschter Kommentar und ein gelöschter Link bekommen
  deshalb keinen — gilt unverändert für den fünften Träger aus G4
  (Abschnitt 10 Punkt 5).
- **Die Rollen sind eine Leiter, auch in der Prüflage** (seit 0.8.5,
  Stolperstein 87). Wer `istAdmin: false` setzt, setzt `istEigentuemer`
  gleich mit — sonst baut die Prüflage einen Zustand nach, den der Server nie
  ausliefert.
- **Ein Doppelgänger antwortet wie der echte Server** (Stolperstein 90). Er
  darf die Antwort weder vereinfachen noch erstarren lassen: was sich durch
  einen Schreibvorgang ändert, muss sich bei ihm wirklich ändern, und was
  hinter einem Wächter liegt, liegt auch bei ihm dahinter.
- **Die beiden Anlegen-Schalter sind eine Einstellung, keine Version.** Im
  Betrieb steht der bei den **Kategorien aus** und der bei den **Tags an**.
  Wer künftig „das Anlegen soll nur der Admin dürfen" hört, prüft **zuerst
  die Schalterstellung**, bevor er baut.
- **Die Übersicht sortiert weiter nach `updated_at` für alle:** die Liste
  zeigt, wo etwas geschieht, nicht wo ich zuletzt war. **Daraus folgt für
  0.8.60:** „Neu seit …" wird ein **Filter**, kein zweiter Sortierweg — er
  ist persönlich und darf die gemeinsame Reihenfolge nicht anrühren, genau
  wie der Favoritenfilter. Der Merkzeitpunkt wird beim **Verlassen** der
  Übersicht gesetzt, nicht beim Betreten: Zeitstempel haben Sekundenauflösung
  (Stolperstein 15), und beim Betreten wäre das Fenster scharf.
- **Die Node-Version steht an zwei Stellen und muss an beiden dieselbe sein**
  (seit 0.8.10). Im `Dockerfile` (beide Stufen) und in
  `.github/workflows/pruefstand.yml`. Laufen sie auseinander, prüft der
  Prüflauf gegen etwas, das im Container so nicht betrieben wird — genau der
  Befund, der zu dieser Regel geführt hat (lokal 22, im Abbild 20). Der
  Prüfstand hält die beiden Zahlen gegeneinander.
- **Was der Server weder lädt noch ausliefert, steht nicht im Abdruck**
  (seit 0.8.10). Die Liste dafür ist abgeleitet — `require.cache` plus
  `public/` —, nicht gepflegt; `pruefung.js`, `Doku/` und `zugang.js` können
  dadurch gar nicht erst hineingeraten. Wer ein weiteres serverseitiges Modul
  ergänzt, das beim Start geladen wird, sieht den Abdruck dadurch wandern —
  das ist beabsichtigt, nicht zu unterdrücken.
- **Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine
  Behauptung** (ab 0.8.20). Er darf nur geglaubt werden, wo ausdrücklich
  eingestellt ist, wer ihn setzen darf. Bisher stand die Regel nur für den
  `Host`-Kopf im Konzeptpapier; sie gilt genauso für `X-Forwarded-For`, und
  dort ist sie nachweislich verletzt — mit wechselndem Kopf greift die
  IP-Bremse nie. **Eine Einstellung, fünf Wirkungen:** gelesener Kopf,
  `Secure` am Keks, `Strict-Transport-Security`, `__Host-`-Präfix und der
  Hinweis in der README hängen alle daran.
- **Der ausgelieferte Typ kommt nie aus der Datenbank** (ab 0.8.20). Die Regel
  steht seit jeher im Kopf von `anhaenge.js` — der Fotoweg hält sie nicht ein
  und liefert den gemeldeten Typ des Hochladenden zurück, samt SVG. Dagegen
  hilft kein Merksatz, sondern ein **Wächter im Prüfstand**, gebaut wie der
  auf die Adminfrage: keine Zeile in `server.js` setzt `Content-Type` aus
  einem Wert, der aus der Datenbank kommt. **Bindet unmittelbar für 0.8.50** —
  ein Video wird inline ausgeliefert.
- **Fotos und Videos stehen in EINER Reihenfolge** (ab 0.8.50). Deshalb
  dieselbe Tabelle mit einer Spalte `art`, keine zweite Tabelle. Und am Video
  gilt jede Regel, die am Foto gilt — Rechte, Kaskade, Umsortieren, Kennzahlen.
- **Der Server öffnet nie ein Video** (ab 0.8.50). Das Standbild macht der
  Browser vor dem Hochladen. Wer später einen Umkodierer vorschlägt,
  verhandelt damit eine neue Abhängigkeit von der Größe des halben Abbilds —
  die Antwort auf ein nicht abspielbares Format ist der Anhang.
- **Was die Anlage als Ganzes trifft, wird ein zweites Mal bestätigt**
  (ab 0.8.90). Export, Import, Rolle vergeben, fremdes Passwort zurücksetzen,
  Zugang entfernen, Schlüssel wechseln. Die Grenze ist nicht „gefährlich",
  sondern dieselbe, an der schon die Eigentümerrolle liegt. `aendereZugang()`
  wendet das Prinzip längst an („das bisherige Passwort ist Pflicht — sonst
  genügte eine fremde offene Sitzung"); es fehlt nur bei den schweren Wegen.
- **Ein Sicherheitsprotokoll ist kein Änderungsverlauf** (ab 0.8.90). Die
  Entscheidung gegen den Änderungsverlauf gilt **Inhalten**. Das Protokoll
  hält fest, wer Zugang hatte und wer die Anlage als Ganzes angefasst hat —
  kein Eintragstitel, kein Kommentartext, keine Bewertung. Dieselbe Trennlinie
  wie überall: was die Anlage betrifft, nicht was jemand gesagt hat.

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
- Sprache im Projekt: Deutsch, auch in Kommentaren, Oberfläche und Meldungen.

