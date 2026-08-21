# Kriterion

Selbstgehostetes Bewertungsarchiv. Kein Verkauf, keine Cloud, keine Konten bei
Dritten — Fotos, Bewertungen, Notizen und Linksammlungen bleiben auf dem eigenen
Server.

Gedacht für alles, was man sammelt und beurteilt: Geräte, Materialien, Modelle,
Prototypen, Bezugsquellen. Die Oberfläche ist neutral gehalten und lässt sich
über zwei frei wählbare Titel an den eigenen Zweck anpassen.

Node.js/Express, verschlüsselte SQLite-Datenbank, Frontend ohne Framework. Keine
externen Schriftarten, kein CDN, keine Favicon-Abrufe — läuft vollständig
offline im eigenen Netz.

## Einrichten

```bash
cp .env.example .env
nano .env                 # Zugangsdaten eintragen
docker compose up -d --build
```

Erreichbar unter `http://<server-ip>:3100`. Der Port steht unmittelbar in der
`docker-compose.yml`.

**Beim ersten Aufruf im Browser** werden Benutzername und Passwort gesetzt. Es
gibt keine voreingestellte Kennung, und in der `.env` steht kein Passwort — der
Zugang liegt als scrypt-Hash in der verschlüsselten Datenbank. Mindestens zehn
Zeichen, sonst keine Regeln.

Die `.env` enthält damit nur noch den Schlüssel und darf leer bleiben. Sie muss
aber **vorhanden** sein: `docker compose` liest sie ein und bricht sonst ab,
bevor der Container startet. Deshalb der Schritt `cp .env.example .env` oben.
Die **Titel werden im Systembereich der Anwendung gepflegt**, nicht über die
Umgebung.

**Passwort vergessen?** Auf dem Server, nicht über die `.env`:

```bash
docker compose exec kriterion node zugang.js passwort <name>
```

Das Passwort wird zweimal abgefragt und gleich dort gesetzt; alle Sitzungen
dieses Zugangs fallen, Bestand und Rolle bleiben unangetastet — der
Datenbankschlüssel hängt nicht am Passwort. `node zugang.js liste` zeigt die
vorhandenen Namen, `node zugang.js entfernen <name>` legt einen Zugang still,
`node zugang.js eigentuemer <name>` ist der Notausgang, wenn sich der bisherige
Eigentümer nicht mehr anmeldet. Läuft der Container gar nicht erst an, tut es
`docker compose run --rm kriterion node zugang.js …` ebenso.

Das setzt Zugriff auf den Server voraus und ist deshalb kein Umweg um die
Anmeldung. **`AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD` werden nicht
gelesen.** Stehen sie noch in der `.env`, meldet der Start sie als entfernbar;
kaputt geht dadurch nichts.

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
den kompletten Projektordner sichert, hat die `.env` mit im Backup — und damit
den Schlüssel wieder neben den Daten. Die Verschlüsselung ist dann so wirksam
wie ein Schloss mit danebenliegendem Schlüssel.

> **Merksatz:** `.env` und `data/` gehören **nicht** ins selbe Backup. Den
> Schlüssel getrennt aufbewahren, zum Beispiel im Passwortspeicher.

**Die Kehrseite:** Ohne den Schlüssel sind alle Daten endgültig verloren. Es
gibt keine Hintertür und keine Wiederherstellung. Wer den Schlüssel selbst
setzt, muss ihn auch verwahren.

## Verschlüsselung

Die **gesamte Datenbankdatei** ist verschlüsselt (SQLCipher, AES-256). Ohne
Schlüssel meldet selbst ein Datenbankwerkzeug nur „file is not a database" —
lesbar ist nichts, auch nicht die Tabellenstruktur, Kategorienamen, Zeitstempel
oder Bildgrößen. Fotos liegen mit in der Datenbank und werden nie als Datei auf
die Platte geschrieben; der Upload läuft über den Arbeitsspeicher.

Innerhalb der geöffneten Datenbank steht alles im Klartext. Deshalb funktioniert
die Suche über sämtliche Felder, ohne dass die Verschlüsselung im Weg steht.

## Anmeldung

Ohne gültige Anmeldung ist außer dem öffentlichen Titel nichts zu sehen: keine
Einträge, keine Kategorien, keine Zahlen. Auch die Schnittstellen liefern ohne
Sitzung nichts aus, Fotos und Export eingeschlossen. Sitzungen laufen nach 30
Tagen ab.

Nach mehreren Fehlversuchen antwortet die Anmeldung verzögert, nach zehn
Fehlversuchen von derselben Adresse für einige Minuten gar nicht mehr.
Gezählt wird zusätzlich je Benutzername — dort wird nur verzögert, nie
gesperrt: eine harte Namenssperre wäre ein Werkzeug *gegen* fremde Zugänge.

Wird Kriterion über einen Reverse Proxy nach außen gegeben, dann **nur über
HTTPS** — sonst wandert das Passwort im Klartext durchs Netz.

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
sichtbar): anlegen mit erstem Passwort, sperren und freigeben, Passwort
zurücksetzen, Rolle wechseln, entfernen. Drei Regeln stehen serverseitig fest,
nicht nur ausgegraut in der Oberfläche:

- **Ein Admin kommt nicht an seinesgleichen.** An einen anderen Admin oder den
  Eigentümer kommt nur der Eigentümer — sonst wäre die Verwaltung ein
  Wettrennen.
- **Der letzte aktive Eigentümer bleibt** — er lässt sich weder herabstufen
  noch sperren noch entfernen, solange kein zweiter bestimmt ist.
- **Niemand sperrt oder entfernt sich selbst.**

Sperren wirkt sofort: die laufende Sitzung fällt, die Anmeldung nennt den
Grund — aber erst nach dem richtigen Passwort, sonst wäre die Meldung ein
Werkzeug zum Durchprobieren von Namen.

**Entfernen entwertet, es löscht nicht.** Die Benutzerzeile bleibt mit ihrer
Nummer stehen, der Name wird freigegeben, und die Beiträge bleiben sichtbar —
sie tragen künftig „Gelöschter Benutzer 7". Zwei Häkchen im Dialog nehmen auf
Wunsch die Inhalte mit: *seine Einträge löschen* (nimmt über die Kaskade auch
fremde Kommentare, Bewertungen und Testtage daran mit — der Dialog nennt die
Zahlen) und *seine Beiträge in fremden Einträgen löschen*. Sitzungen,
Favoriten und persönliche Einstellungen gehen immer mit. Der Name
`geloescht-<nummer>` ist als Benutzername gesperrt.

### Wer was darf

Am einzelnen Eintrag gilt:

| | Verfasser | jeder andere | Admin |
|---|---|---|---|
| alles sehen | ✔ | ✔ | ✔ |
| Titel, Beschreibung, Fotos, Dateien, Links, Tags, Kategorie, getestet, abgelehnt | ✔ | — | ✔ |
| Eintrag löschen | ✔ | — | ✔ |
| **Favorit** (★ am Eintrag) | persönlich — jeder für sich, an jedem Eintrag | | |
| eigene Bewertung, eigener Testtag | ✔ | ✔ | ✔ |
| Kommentar schreiben | ✔ | ✔ | ✔ |
| eigenen Kommentar ändern | ✔ | — | — |
| fremden Kommentar löschen | — | — | ✔ |
| Art und Anpinnung am Kommentar | ✔ | — | ✔ |
| Note eines fremden Testtags ändern | — | — | — |
| fremden Testtag löschen | — | — | ✔ |
| Bild an einen Kommentar hängen | ✔ | — | — |
| Bild aus einem Kommentar löschen | ✔ | — | ✔ |

**Löschen ja, umschreiben nein** ist die Regel dahinter: ein Admin räumt auf,
aber er verändert keine fremde Aussage unter fremdem Namen. Deshalb darf er
einen Kommentar löschen, nicht aber dessen Text ändern — und deshalb darf er
einen fremden Testtag löschen, nicht aber dessen Note.

Eine Absage kommt als Meldung, nicht als stille Wirkungslosigkeit, und sie
kommt **bevor** irgendetwas geschrieben ist.

### Zwei Titel

Der Titel auf der Anmeldeseite ist für jeden sichtbar, der die Adresse aufruft.
Ein aussagekräftiger Name verrät dort schon, was im Bestand liegt. Deshalb gibt
es zwei, beide im Systembereich einstellbar:

- **Titel vor der Anmeldung** — zurückhaltend wählen (Vorgabe „Bewertungskatalog")
- **Titel nach der Anmeldung** — die eigentliche Bezeichnung (Vorgabe „Model Bewertungen")

## Bedienung

**Übersicht**
- Die Suche greift auf Titel, Beschreibung, Kategorie, Tags, Linkadressen und
  Kommentare zu. `/` springt ins Suchfeld.
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
- Das **erste Foto ist das Hauptbild** — Reihenfolge durch Ziehen der
  Vorschaubilder ändern, mit Maus oder Finger.
- Fotos lassen sich per Dateiauswahl, **Strg+V aus der Zwischenablage** oder
  durch Ablegen auf dem Feld hinzufügen.
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
  **Angelegt, umbenannt, sortiert und gelöscht werden Kriterien
  ausschließlich im Systembereich und ausschließlich vom Admin.** Ein
  neues Kriterium erscheint sofort an jedem Eintrag, ein gelöschtes nimmt
  überall die vergebenen Sterne mit — eine globale Folge, die nicht eine
  Zeigerbreite neben dem Sterne-Widget liegen sollte. Anlegen und Aufräumen
  gehören an dieselbe Stelle.
  Im Systembereich steht daneben, in wie vielen Einträgen das Kriterium
  verwendet wird.
- **Beschreibung und Kommentarfelder wachsen mit dem Text** — sie zeigen immer
  den ganzen Inhalt und haben deshalb keinen Ziehgriff mehr.
- **Testtage**: nur bei eingeschaltetem „Getestet". Jede Zeile ist ein Tag mit
  einer einzigen Gesamtnote — das Bauchgefühl dieses Tages, unabhängig von den
  Kriterien. Ein Datum kann nur einmal vorkommen; wird es erneut eingetragen,
  ersetzt die neue Note die alte. Ab drei Tagen zeigt eine kleine Kurve den
  Verlauf. Solange Testtage vorhanden sind, lässt sich „Getestet" nicht
  zurücknehmen.
- **Links**: beliebig viele Adressen. Ein Klick auf die Zeile öffnet sie in einem
  neuen Tab, Ziehen sortiert um. Bewusst ohne Favicons — die müssten von fremden
  Servern geladen werden. **Was keine Adresse ist, wird zur Suche**: ein Wort,
  eine Normbezeichnung, eine Artikelnummer bleibt im Rohzustand stehen und führt
  beim Klick zum Startanbieter. Solche Zeilen tragen rechts eine
  Lupe statt des Pfeils und nennen unter dem Text die Anbieter, bei denen sich
  suchen lässt — der Startanbieter zuerst, dahinter bis zu drei weitere. Jeder
  Name ist ein eigenes Klickziel: ein Klick darauf sucht bei genau diesem
  Anbieter. Gespeichert wird
  nie eine fertige Suchadresse — ein Anbieterwechsel gilt deshalb rückwirkend
  für alle vorhandenen Suchzeilen.
- Kommentare lassen sich nachträglich bearbeiten und löschen.
- Löschen von Eintrag, Foto, Kommentar, Link und Testtag jeweils mit
  Rückfrage. Beim Eintrag wird benannt, was dranhängt.

**Systembereich** (Zahnrad in der Kopfzeile)

**Was man dort sieht, hängt an der Rolle.** Ein gewöhnlicher Benutzer bekommt
sechs Karten: seinen eigenen **Zugang**, die **Darstellung**, die **Links**
und die drei Listen **Kategorien**, **Tags** und **Bewertungskriterien** — die
letzten drei ohne Bedienzeichen, nur zum Nachsehen. Alles Übrige steht dem
**Admin**, Export und Import allein dem **Eigentümer**. Der Grund: ein Knopf,
der zuverlässig eine Fehlermeldung erzeugt, sieht aus wie ein Fehler.

- Beide Titel ändern *(Admin)*
- Kennzahlen: Einträge, Fotos, Kommentare, Links, Testtage, Datenbankgröße
  *(Admin)*. Der Schlüsselwert zum Abschreiben steht darin nur für den
  **Eigentümer**.
- **Zugänge** verwalten — siehe den Abschnitt „Rollen und Zugänge" oben
  *(Admin)*
- **Export** mit oder ohne Fotos, nur für den Eigentümer der Anlage. Die
  Datei nennt zu jedem Eintrag, jeder Bewertung, jedem Kommentar und jedem
  Testtag den **Verfassernamen**.
- **Import** einer Exportdatei, wahlweise *ersetzen* oder *zusammenführen* —
  ebenfalls nur für den Eigentümer, und zwar in beiden Fällen: eine
  Exportdatei kann Beiträge **unter fremdem Namen** anlegen.
  Der Vorgang läuft in einem Zug; bricht er ab, bleibt der Bestand unverändert.
  Ein genannter Verfasser, den es als Zugang gibt, bekommt seine Zeilen zurück;
  alles andere fällt an den Einspielenden — auch ältere Dateien, die noch gar
  keinen Namen kennen. **Ein unbekannter Name legt keinen Zugang an**; er wird
  im Protokoll genannt, damit man ihn vor einem zweiten Versuch anlegen kann.
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
- **Bewertungskriterien** umbenennen, löschen und **per Ziehen sortieren**
  *(Admin)*. Die
  Reihenfolge gilt für Detailansicht und Vergleich gleichermaßen — im Vergleich
  fällt das oberste Kriterium zuerst ins Auge. Die Zahl nennt die Einträge, bei
  denen Sterne vergeben sind; ein zurückgesetztes Kriterium zählt nicht mit.

## Auf dem Handy

Sortieren und Scrollen teilen sich auf einem Berührungsbildschirm denselben
Zeiger. Deshalb gilt: **mit der Maus wird sofort gezogen, mit dem Finger erst
nach kurzem Halten** (0,4 Sekunden). Bewegt sich der Finger vorher, war es ein
Wisch — dann wird gescrollt und nichts umsortiert. Sobald gegriffen ist, meldet
das die Zeile mit einem Rahmen, und das Gerät gibt einen kurzen Impuls.

**Kein `touch-action: none`** auf sortierbaren Listen. Genau das hat vorher
jede Wischbewegung über Fotos oder Links zum Umsortieren gemacht und das
Scrollen unmöglich — man musste eine bildfreie Stelle suchen.

Zeilenaktionen sind überall Zeichen (`✎` bearbeiten, `✕` löschen), nicht mal
Text und mal Zeichen. Auf schmalen Bildschirmen passt Text nicht in die
Kopfzeile, und uneinheitlich sieht es ohnehin schlechter aus.

Im Vollbild **zoomt mit der Maus ein Klick, mit dem Finger erst der zweite
Tipp** innerhalb einer knappen Sekunde. Ein einzelner Tipp tut nichts —
Schließen wäre bei jedem versehentlichen Antippen zu hart. Die Pfeile zum
Blättern hängen an der Lightbox, nicht an der Bildfläche: im gezoomten Zustand
wird diese zum Scrollbereich, und Kinder davon wandern beim Verschieben mit dem
Bild aus dem Bild.

**Nach dem Zoom steht die Mitte des Bildes im Blick**, nicht die
linke obere Ecke. Ist das Original kleiner als die Fläche, sitzt es mittig statt
oben links. Beides hat dieselbe Ursache: die Fläche muss im gezoomten Zustand
auf `flex-start` stehen, weil ein zentriertes Kind, das größer als sein Behälter
ist, nach *beiden* Seiten überläuft — die obere linke Hälfte wäre dann gar nicht
mehr erreichbar. Zentriert wird deshalb über `margin: auto` am Bild: ist Platz
da, teilt der Rand ihn auf; ist keiner da, wird er null und `flex-start` greift.
Den Bildlauf setzt die Anwendung erst, wenn das Original geladen ist — vorher
stünden noch die Maße der kleinen Variante fest und die Mitte wäre falsch
berechnet.

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
   erraten. Steht zusätzlich als Kopfzeile für die ganze Anwendung.
5. **`Content-Security-Policy: default-src 'none'; sandbox`** auf jeder
   Anlagen-Antwort. Selbst wenn alles andere versagt, läuft dort nichts.
6. **Der Dateiname wird für die Kopfzeile entschärft.** Zeilenumbrüche würden
   erlauben, weitere Kopfzeilen einzuschleusen; Anführungszeichen würden den
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
`data:` können dort gar nicht erst passen. Zweitens wird die Zeichenkette
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

## Speicherbedarf

Fotos werden **unverändert** gespeichert — ein Bild aus einer Systemkamera
bleibt bei seinen 8–12 MB. Zusätzlich entstehen zwei kleinere Varianten: eine
Kachel (400 px) für die Übersicht und eine mittlere (1600 px) für Detail- und
Vollbildansicht. Das kostet rund 7 % mehr Speicher, spart beim Blättern aber
etwa den Faktor 100 an Datenübertragung. Das Original wird erst geladen, wenn im
Vollbild gezoomt wird.

Gelöschter Platz wird automatisch freigegeben.

## Sichern

Für den Bestand genügt das Verzeichnis `./data`. Wurde ein eigener
`ENCRYPTION_KEY` gesetzt, gehört dieser **getrennt davon** gesichert — siehe den
Abschnitt zum Schlüssel. Ohne ihn lässt sich aus der Sicherung nichts
wiederherstellen.

Zusätzlich empfiehlt sich ein gelegentlicher Export über den Systembereich: Er
ist unabhängig von Datenbankformat und Schlüssel und lässt sich jederzeit wieder
einspielen.

## Eine neue Version einspielen

```bash
cd .../kriterion && docker compose down
cd .. && mv kriterion kriterion-alt
python3 -m zipfile -e kriterion.zip .
cp -r kriterion-alt/data kriterion/data
cp kriterion-alt/.env kriterion/.env      # ohne diese Zeile startet nichts
cd kriterion && docker compose up -d --build
```

**Die `.env` liegt bewusst nicht im Paket** — sie enthält den Schlüssel und hat
in einer verteilten Datei nichts verloren. Sie wandert deshalb mit dem alten
Ordner nach `kriterion-alt` und muss von Hand zurückgeholt werden. Fehlt sie,
bricht `docker compose` ab, bevor der Container entsteht; kaputt geht dabei
nichts.

> **Nicht mit `cp .env.example .env` behelfen.** Dieser Schritt gilt nur für
> eine **neue, leere** Installation. Bei vorhandenem Bestand steht darin ein
> leerer `ENCRYPTION_KEY`, der Start erzeugt einen **neuen** Schlüssel und legt
> ihn als `data/encryption.key` ab — und die vorhandene Datenbank lässt sich
> damit nicht mehr öffnen. Passiert es doch: `data/encryption.key` löschen und
> die richtige `.env` aus `kriterion-alt` holen. Zerstört wird nichts, aber der
> Container läuft bis dahin in einer Neustartschleife.

Nach dem Start im Protokoll nachsehen, ob „Schlüssel aus ENCRYPTION_KEY
geladen" dasteht (`docker compose logs kriterion`). Steht dort stattdessen die
Warnung über eine Schlüsseldatei neben den Daten, wurde die `.env` nicht
gelesen — dann sofort anhalten und nachsehen, bevor etwas geschrieben wird.

**Vorausgesetzt wird eine Datenbank aus Version 0.8.0.** Kriterion enthält
keinen Umstiegscode mehr; ein älterer Bestand braucht den Zwischenschritt über
0.8.0 als letzte Version, die ihn noch übernehmen konnte.

## Datenmodell

Die Datenbankdatei heißt `katalog.sqlite` — der Dateiname stammt aus der Zeit
vor der Umbenennung des Projekts und wandert bewusst nicht mit: ein anderer
Name ließe den Start eine leere Neuinstallation vermuten.

- `items` — Titel, Beschreibung, Getestet-/Abgelehnt-Merkmal, Kategorie
- `item_pins` — der **Favorit**, je Benutzer und je Eintrag; nur Zeilen für
  tatsächlich Markiertes. Die Spalte `items.favorite` bleibt ungenutzt im
  Schema und wird nie beschrieben. *Der Tabellenname stammt aus der Zeit, als
  das Merkmal in der Oberfläche „Anheftung" hieß — Tabellennamen wandern wie
  üblich nicht mit. Die Anpinnung der **Kommentare** (`comments.pinned`) ist
  etwas anderes und heißt weiterhin so.*
- `photos` — Original, Kachel und mittlere Variante, mit Reihenfolge
- `links` — Adressen mit Reihenfolge
- `test_days` — ein Eintrag je Tag mit Gesamtnote, eindeutig pro Eintrag, Tag
  **und Benutzer**
- `rating_criteria` / `ratings` — gemeinsame Kriterien mit frei bestimmbarer
  Reihenfolge, Werte je Eintrag und je Benutzer
- `product_categories`, `tags`, `item_tags`
- `comments` — mit Bearbeitungszeitpunkt
- `test_day_tags` — Tags an einzelnen Testtagen, getrennt von `item_tags`
- `comments.kind` / `comments.pinned` — Art und Anpinnung je Kommentar
- `comment_images` — Bilder in Kommentaren, eigene Tabelle neben `attachments`
- `attachments` — angehängte Dateien samt Bytes
- `photos.focus_x` / `photos.focus_y` — Fokuspunkt der quadratischen Vorschau
- `settings` — die **globale** Hälfte: Titel, Vokabular und die Suchanbieter
  (Vorrat, eigene Anbieter, Startanbieter). Sache des Admins
- `user_settings` — die **persönliche** Hälfte: Filterwahl, Schriftgröße,
  Blockanordnung, sichtbare Linkzeilen, Zeitleiste und die Zahl der
  Anbieternamen. Je Benutzer eine Zeile pro Schlüssel
- `users` — Zugang als scrypt-Hash, dazu Rolle (`user` < `admin` <
  `eigentuemer`), Adresse, Status und letzte Anmeldung. Entfernte Zugänge
  bleiben als Grabstein (`status = geloescht`, Name `geloescht-<id>`) stehen
- `sessions` — aktive Anmeldungen, mit `user_id` am Benutzer
- `items.user_id` / `comments.user_id` / `test_days.user_id` /
  `ratings.user_id` — der Verfasser. `ON DELETE SET NULL` ist nur noch das
  Auffangnetz für ein `DELETE` von Hand: die Anwendung entfernt keine
  Benutzerzeile mehr, herrenloser Bestand fällt beim Start an den Eigentümer

## Prüfen

```bash
npm install          # einmalig, holt zusätzlich jsdom für die Oberflächenprüfung
npm test
```

Der Prüfstand legt echte Server mit echten, verschlüsselten Datenbanken in
Wegwerfverzeichnissen an — `./data` bleibt unangetastet, alle Anlagen entstehen
frisch über Einrichtungsseite und Verwaltung. Geprüft werden unter anderem die
Rechteschicht mit mehreren Zugängen nebeneinander, die Zugangsverwaltung samt
`zugang.js` als echtem Prozess, die Kriterienverwaltung samt Reihenfolge, deren
Wirkung auf Detailansicht, Vergleich und Export, die Auslieferungsregeln für
Anhänge sowie die mitwachsenden Textfelder im echten DOM.

Die Datei `pruefung.js` ist per `.dockerignore` ausgeschlossen und landet nicht
im Abbild.
