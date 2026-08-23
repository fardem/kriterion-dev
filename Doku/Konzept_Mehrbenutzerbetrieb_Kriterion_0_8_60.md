# Umbenennung und Mehrbenutzerbetrieb

**Konzeptpapier · Stand 23. August 2026 · gebaut bis Version 0.8.60 — Fingerprint `ab68b523`**
(Stufen A bis **G4** erledigt, **G vollständig**; 0.8.1 war eine
**Bereinigung**, 0.8.6 eine Runde **Berichtigungen aus dem Betrieb**, 0.8.10
die Runde **Werkzeug** und 0.8.20 die Runde **„Die Schotten dicht"** — alle
vier keine Stufen.)

**0.8.60 berührt den Mehrbenutzerbetrieb nicht — und bestätigt dabei zwei
seiner Regeln.** „Was ist offen, was ist neu" ist keine Datenbankstufe und
keine Stufe dieses Papiers: keine Rolle, kein Recht, kein Träger, kein Schema.
**`F_ROUTEN` bleibt bei 47** — die Ansicht „Offen" ist eine lesende Route ohne
Wächter, und der Erledigt-Haken geht über `PUT /api/comments/:id`, die es
längst gibt.

Bestätigt werden zwei Regeln:

- **Der Erledigt-Haken am fremden Aufgabenkommentar bleibt bei „Verfasser oder
  Admin".** „Löschen ja, umschreiben nein" gilt **Aussagen**; die Art eines
  Kommentars ist ein **Merkmal**, und Merkmale darf der Admin seit 0.7.2
  setzen. Die neue Ansicht schafft damit kein neues Recht, sie macht ein
  vorhandenes erreichbar. Der Prüfstand belegt es mit **zwei Sitzungen** und
  einem **Admin ohne Eigentümerrolle**: ein gewöhnlicher Benutzer bekommt 403
  und danach steht die Art unverändert da.
- **Der Merkzeitpunkt `zuletztGesehen` ist eine persönliche Einstellung** und
  steht in `PERSOENLICHE_SCHLUESSEL` — dem siebten Eintrag dort. Genau dafür ist
  `user_settings` in Stufe D gebaut worden: keine Schemaänderung, kein
  Migrationsblock. **Und die Schranke aus 0.6.5 hat gehalten**, allerdings mit
  einem Befund: sie wird erst bei einem Zugang **ohne** Adminrolle laut, weil
  `PUT /api/settings` aus derselben Liste ableitet, was Adminsache ist
  (Stolperstein 116).

Was der Mehrbenutzerbetrieb dabei sichtbar macht: **der Umschalter „meine /
alle" erscheint erst ab zwei Zugängen**, abgeleitet über `mehrereBenutzer()`,
und der **Verfassername steht nur dann an der Zeile** — dieselbe Schwelle wie
überall. Der Filter „Neu seit …" dagegen erscheint **immer**: er ist eine
Aussage über einen selbst, nicht über andere.

**0.8.50 davor berührte den Mehrbenutzerbetrieb ebenfalls nicht — mit einer
Ausnahme, und die bestätigt dieses Papier.** Kurzvideos am Fotoplatz sind eine
Datenbankstufe, aber keine Stufe dieses Papiers: keine Rolle, kein Recht, kein
neuer Träger. **Die Ausnahme ist eine neue schreibende Route** —
`POST /api/items/:id/videos`, `F_ROUTEN` geht von **46 auf 47**. Sie steht
hinter `nurEintragVerfasser`, also hinter **derselben Klemme wie der Fotoweg**,
und begründet damit kein neues Recht: ein Video hängt am Eintrag und gehört
seinem Verfasser, genau wie ein Foto. **Fotos und Videos sind weiterhin kein
Träger** (Änderungsprotokoll 0.8.31, Abschnitt 7) — `photos` hat keine
`user_id` und bekommt keine, und `ordneBestandZu()` kennt die Tabelle nicht.
Der Prüfstand belegt die Route mit einem **echten Multipart-Upload**: ein
Fremder bekommt 403, und danach steht keine Zeile in `photos`.

**0.8.40 berührte den Mehrbenutzerbetrieb nicht.** Die Gewichtung der
Bewertungskriterien ist eine Datenbankstufe, aber keine Stufe dieses Papiers:
keine Rolle, kein Recht, kein Endpunkt, kein Träger. `F_ROUTEN` bleibt bei 46,
und **keine Route wechselt ihre Art** — das Gewicht geht über
`PUT /api/criteria/:id`, die längst hinter `nurAdmin` steht. Eine Sache berührt
dieses Papier trotzdem, und sie bestätigt eine seiner Regeln: **das Gewicht ist
ausdrücklich keine persönliche Einstellung.** Hätten zwei Leute verschiedene
Gewichte, hätte derselbe Eintrag zwei verschiedene Gesamtschnitte — es gilt
dieselbe Trennung wie seit 0.8.4 zwischen `settings` und `user_settings`.

**Mit 0.8.31 sind Links UND Dateien beim Eintrager**, und damit ist der
Mehrbenutzerbetrieb bis auf H und I gebaut. 0.8.31 ist **keine Stufe**,
sondern eine Berichtigungsrunde: sie holt am sechsten Träger nach, was G4 am
fünften entschieden hat — hochladen darf jeder, löschen der Hochladende oder
der Admin, der Name steht nach derselben Regel an der Zeile, Formatnummer
**7 → 8**. Der Ergebnisblock steht in Teil III unter G4.

**Mit 0.8.30 ist Stufe G4 gebaut, und damit die letzte offene Stufe des
Mehrbenutzerbetriebs vor H.** „Die Linkliste bekommt Verfasser": `links` trägt
eine `user_id`, eintragen darf jeder, löschen der Eintrager oder der Admin,
sortieren bleibt beim Eintragsverfasser, und ab zwei Zugängen steht an einer
**fremden** Linkzeile der Name ihres Eintragers. Das kehrt eine Zeile der
Rechtetabelle in Abschnitt 3 um und macht Links zum **fünften Träger** neben
Eintrag, Kommentar, Testtag und Bewertung. Der Ergebnisblock steht in Teil III.

**Weder 0.8.10 noch 0.8.20 haben den Mehrbenutzerbetrieb berührt.** 0.8.10
ging an den Bau (Lockfile, `npm ci`, `sharp`, Node 22), an den Prüfstand
(Gruppenfilter, Prüflauf bei jedem Push) und mit dem Versions-Fingerprint an eine
einzige Zeile im Systembereich. 0.8.20 ging an die Absicherung: der Fotoweg
liefert nie mehr den gemeldeten Typ, die Anwendung bekommt eine
Sicherheitsregel, der Kopf `X-Forwarded-For` wird nur noch nach ausdrücklicher
Einstellung geglaubt, der Fehler-Handler trennt Absicht von Panne, dazu
sauberes Herunterfahren und ein Index auf `sessions.user_id`. Keine Rolle,
kein Recht, kein Endpunkt, kein Schema — dieses Papier ändert sich durch
beide nur in seinen Nummern.

**Offen sind damit noch H (Tokens, 0.8.80) und I (Mailversand und
Selbstanmeldung, 0.9.0).** Zwischen G4 und H liegen vier Stufen, die nicht zum
Mehrbenutzerbetrieb gehören; sie stehen im Projektstand, Abschnitt 10. Die
ersten drei davon — **0.8.40, die Gewichtung**, **0.8.50, Kurzvideos am
Fotoplatz**, und **0.8.60, „Was ist offen, was ist neu"** — sind gebaut; die
nächste ist **0.8.70, „Sicherung und Papierkorb"**.

**Eines aus 0.8.20 wirkt bis in diese Stufe und weiter:** die Einstellung
`HINTER_PROXY` entscheidet, ob `X-Forwarded-For` geglaubt wird — und an ihr
hängen auch `Secure` am Sitzungscookie, `Strict-Transport-Security` und das
Präfix `__Host-` am Cookienamen. Wer künftig etwas an der Sitzung baut (Stufe H,
„Meine Sitzungen"), findet den Cookienamen deshalb **nicht** als feste
String vor, sondern nimmt ihn aus `auth.COOKIE_NAME`. Im Betrieb steht
die Einstellung auf der Vorgabe **aus**; sie gehört auf `1`, sobald Kriterion
über den Proxy nach außen geht (Projektstand, Abschnitte 2 und 3).

Dieses Papier trägt die Entwürfe der Stufen und was beim Bauen anders kam.
Erledigtes steht seit der Bereinigung als **Ergebnisblock** — was gilt, mit
Version und Abweichungen; die vollständigen Baupläne stehen in den älteren
Ständen dieses Papiers. **Alles Offene steht vollständig.**

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

# Teil I — Umbenennung auf „Kriterion" — erledigt in Version 0.5.10

**Was gilt:** Das Projekt heißt Kriterion; umbenannt sind Anzeigename,
Paketname, Container- und Imagename und der Cookie (`kriterion_session`). **Die
Datenbankdatei heißt weiterhin `katalog.sqlite`** — der Dateiname ist kein
Projektname und wandert bei keiner Umbenennung mit. Das Risiko lag wie
vorhergesagt im Betriebsvorgang (Ordnerwechsel, `.env`, alter Container am
Port), nicht im Code; der Umzug auf dem Server ist seit dem 13. August 2025
erledigt.

---

# Teil Ia — Mehrere Suchanbieter je Suchzeile — erledigt in Version 0.5.11

**Was gilt:** Unter jeder Suchzeile stehen bis zu **vier** Anbieternamen
(je höchstens 20 Zeichen); die Zeile selbst führt zum **Startanbieter**, der
immer vorn steht und aussieht wie alle anderen. `sucheAktiv[0]` ist die
**einzige Wahrheit** über den Startanbieter; die alte Einstellung `suche`
wird beim Lesen abgeleitet, nie zurückgeschrieben. Ein gelöschter eigener
Anbieter führt zur **Absage mit Meldung**, nie zum stillen Rückfall auf
Google. Die Anbieterliste liegt im **Server**, nicht in `app.js`; Vorrat,
eigene Anbieter und Startanbieter sind Sache des Admins, persönlich ist
allein die Zahl der angezeigten Namen (`suchNamen`, seit 0.6.5).

---

# Teil II — Mehrbenutzerbetrieb

## 1. Leitgedanke

**Ausgeschaltet sieht Kriterion aus wie heute.** Keine Namen an Kommentaren,
keine Durchschnittsspalte neben den Sternen, keine Benutzerverwaltung, kein
Registrieren-Knopf.

Umgesetzt wird das nicht über einen abgefragten Schalter, sondern **aus der Zahl
der aktiven Benutzer abgeleitet**: bei genau einem entfällt die
Durchschnittsspalte (`3,4 · 1` ist keine Information), der Verfassername und die
Verwaltungskarte. Ein Zustand, keine zweite Wahrheit.

Der Grund ist nicht Höflichkeit gegenüber dem Einzelbetrieb, sondern die
Bedingung dafür, dass der Umbau die Veröffentlichung nicht verschlechtert. „Für
eine Person, dafür vollständig verschlüsselt" bleibt ein vollwertiger
Betriebszustand und kein halb ausgebauter.

## 2. Rollen

**Drei Rollen seit Version 0.8.0, und sie sind eine Leiter:**
`user` < `admin` < `eigentuemer`.

**Der Eigentümer ist ein Recht, keine Nummer.** Der Entwurf leitete ihn aus
der kleinsten `id` ab; aus dem Betrieb kam die Entscheidung, das Recht
**vergebbar** zu machen — zwei Leute sollen sich eine Anlage teilen können.
Gebaut ist es als **dritter Wert in `role`**, nicht als Bit daneben: ein Bit
ließe `role='user'` mit `eigentuemer=1` zu, also zwei Spalten, die beide
sagen dürften, was jemand darf (Bauform der Stolpersteine 47 und 48). Als
Leiter ist „ein Eigentümer ist immer auch Admin" **baulich wahr** statt eine
Regel, die durchgesetzt werden muss. `MIN(id)` kommt in `server.js` nicht
mehr vor; ein Wächter im Prüfstand zählt das nach.

**Die Startregel** (seit 0.6.0, ersetzt in 0.8.0): *gibt es keinen
Eigentümer, wird es der älteste Zugang, der schon Rechte hat — und erst wenn
es auch keinen Admin gibt, der mit der kleinsten Nummer.* Der Zwischenschritt
über den Admin ist keine Zierde: ohne ihn machte der nächste Start eine
bewusste Herabstufung still rückgängig. Seit 0.8.1 bekommt der erste Zugang
die Rolle direkt beim Anlegen; die Startregel bleibt als Auffangnetz.

**Serverseitig durchgesetzt, nicht nur ausgegraut:** der **letzte aktive
Eigentümer** darf nicht verschwinden — weder durch Herabstufen noch Sperren
noch Löschen. Und **ein Admin kommt nicht an seinesgleichen**: an einen
anderen Admin oder den Eigentümer kommt nur der Eigentümer.

## 3. Rechte

| | Verfasser | anderer | Admin |
|---|---|---|---|
| alles sehen | ✔ | ✔ | ✔ |
| Titel, Beschreibung, Fotos, Tags, Kategorie, abgelehnt, getestet | ✔ | — | ✔ |
| Eintrag löschen | ✔ | — | ✔ |
| **Link eintragen / Datei hochladen** *(0.8.30 / 0.8.31)* | ✔ | ✔ | ✔ |
| **eigenen Link, eigene Datei löschen** | ✔ | ✔ | ✔ |
| **fremden Link, fremde Datei löschen** | — | — | ✔ |
| **Linkliste umsortieren** *(bleibt beim Eintrag)* | ✔ | — | ✔ |
| Kommentar schreiben | ✔ | ✔ | ✔ |
| eigenen Kommentar ändern/löschen | ✔ | — | ✔ (nur löschen) |
| Art (Notiz/Bericht/Aufgabe/erledigt) und Anpinnung setzen | ✔ | — | ✔ |
| fremden Kommentartext **ändern** | — | — | **—** |
| eigene Bewertung, eigene Testtage | ✔ | ✔ | ✔ |
| fremde Bewertung/Testtag löschen | — | — | ✔ |
| fremde Bewertung/Testtagsnote **ändern** | — | — | **—** |
| **sehen, wer welchen Wert vergeben hat** | — | — | ✔ (eigene Ansicht, seit 0.8.6) |
| Favorit am Eintrag (★) | persönlich, jeder für sich | | |
| Tags und Kategorien **zuweisen** | ✔ (nur am eigenen Eintrag) | — | ✔ |
| Tags und Kategorien **anlegen** | abschaltbar, siehe Abschnitt 7 | | ✔ |
| Tags und Kategorien umbenennen/löschen | — | — | ✔ |
| Kriterien anlegen, umbenennen, sortieren, löschen | — | — | ✔ |
| Vokabular, beide Titel, Benutzerverwaltung | — | — | ✔ |
| Export, jeder Import, Schlüsselwert, Rollen vergeben | — | — | nur Eigentümer |

Seit 0.7.2 zusätzlich entschieden: Tags am Testtag folgen dem Testtag und
gehören nur seinem Verfasser; Bilder an einen Kommentar darf nur der
Verfasser **anhängen**, löschen darf sie auch der Admin; eine **herrenlose**
Zeile (`user_id IS NULL`) gehört dem Admin.

**Linkzeile und Datei haben die Seite gewechselt** — die Linkzeile mit 0.8.30,
die Datei mit 0.8.31. Beide standen bis dahin in
der ersten Zeile dieser Tabelle, also beim Verfasser des Eintrags. Dahinter
steht die Regel aus 0.8.4: *was an allen Einträgen aller Benutzer erscheint,
gehört dem Admin; was nur dort erscheint, wo man es hinsetzt, gehört jedem.*
Ein Link und eine Datei erscheinen nur dort, wo man sie hinsetzt.
**Fotos bleiben ausdrücklich, wo sie sind:** das erste Foto ist das Hauptbild
und damit das Gesicht des Eintrags, keine Beigabe.
**Das Umsortieren ist ausdrücklich nicht mitgewandert:** es ändert keine
Aussage und ist umkehrbar — dieselbe Überlegung wie beim Anpinnen eines
Kommentars. Und **ein gelöschter Link bekommt keinen Vermerk**: er ist eine
ganze Aussage, die geht, kein Loch in einer bleibenden.

**Einen Eintrag zu löschen nimmt fremde Kommentare und Bewertungen mit.** Die
Tabelle oben gibt das Löschen des Eintrags dem Verfasser; die Kaskade räumt dann
alles ab, was andere daran geschrieben haben. Das ist richtig — ein Eintrag ohne
Eintrag ergibt nichts —, aber es darf nicht wortlos geschehen. **Dieselbe
Antwort wie beim Löschen eines Benutzers: der Dialog nennt die Zahlen**, und
zwar getrennt nach eigen und fremd. **Erledigt in 0.8.2** über
`GET /api/items/:id/bestand`; „fremd" meint dabei, was dem **Löschenden** fremd
ist — löscht ein Admin einen fremden Eintrag, ist auch der Beitrag des
Verfassers fremd, und genau das soll dastehen.

**Kein Admin ändert fremde Bewertungen oder Kommentartexte.** Löschen ja,
umschreiben nein. Eine fremde Aussage unter fremdem Namen verändern zu können
ist die Art Funktion, die man später bereut. **Seit 0.8.2 gibt es den Löschweg
auch für die einzelne fremde Bewertung** (`DELETE /api/ratings/:id`, hinter
`darfAendern`); ein schreibender Weg auf denselben Pfad entsteht ausdrücklich
nicht, und eine Prüfung am Quelltext hält das fest. **Seit 0.8.6 wird er aus
der Adminansicht gerufen** statt aus einer Liste unter der Sternzeile — der
Endpunkt selbst ist dabei unverändert geblieben.

**Die Anpinnung am Kommentar bleibt beim Verfasser** (und beim Admin), obwohl
sie auf die Sortierung aller Leser wirkt — `pinned DESC` steht ganz vorn in der
Sortierregel. Sie gehört zur Aussage („das ist mein Fazit"), im Gegensatz zum
Favoriten am Eintrag, der eine reine Merkhilfe ist und deshalb persönlich wird.
*Beobachten:* Bei vielen angepinnten Kommentaren mehrerer Leute wächst der
angepinnte Block zur Wand über allem. Wenn das im Betrieb stört, ist die Antwort
**nicht** eine Einschränkung des Anpinnens, sondern eine zweite Sortierstufe
innerhalb des angepinnten Blocks. Gehört nicht in dieses Vorhaben.

## 4. Datenmodell

**Alles bis auf `tokens` ist gebaut** (0.6.0 bis 0.6.5) und steht seit 0.8.1
als vollständige DDL in `db.js` — das Schema dort ist die Wahrheit, nicht
mehr dieses Papier. Die tragenden Entscheidungen: `sessions.user_id` mit
`ON DELETE CASCADE` als Wurzel des Ganzen; `user_id` an `items`, `comments`,
`test_days`, `ratings` und — seit 0.8.30 bzw. 0.8.31 — `links` und
`attachments` mit **`ON DELETE SET NULL`** als Auffangnetz
(`CASCADE` ließe einen Gelöschten den halben Bestand mitnehmen, gar keine
Angabe ließe ein `DELETE` von Hand an der Fremdschlüsselverletzung
scheitern); `UNIQUE` um `user_id` erweitert bei `ratings` und `test_days`;
`item_pins` für den Favoriten; `user_settings` mit
`ON DELETE CASCADE` und `PRIMARY KEY (user_id, key)` für die persönliche
Hälfte.

**Sechs Träger seit 0.8.31**, nicht mehr vier. `links.user_id` und
`attachments.user_id` sind die beiden Spalten, die nachgerüstet werden mussten
— mit `migration0830()` und `migration0831()`, dem zweiten und dritten markierten
Block im Projekt. Wer von 0.8.20 kommt, fährt beide in einem Start. Nachgestellt dabei: eine Fremdschlüsselspalte
lässt sich nur **nullbar** nachrüsten (Projektstand, Stolperstein 105); für
`links` war das ohnehin die richtige Form.

**Offen für Stufe H:** `tokens (hash, user_id, zweck, ablauf, benutzt_am)`.
Zur Adress-Eindeutigkeit siehe Abschnitt 10 — ein **partieller Index**, wenn
sie gebraucht wird, nicht vorher.

## 5. Die Bewertung — erledigt in 0.7.0

**Was gilt:** Die Sterne zeigen die **eigene** Bewertung, anklickbar, Gold;
rechts in gedämpfter Textfarbe der Schnitt aller und die Zahl der Bewerter:

```
Optische Erscheinung      ★★★★☆        3,4 · 5
Verarbeitungsqualität     ★★★☆☆        4,1 · 6
Funktionalität            ☆☆☆☆☆        2,8 · 4
```

Ein Bedienelement zeigt den Zustand, den es verändert — zeigten die Sterne
den Schnitt, wirkte jeder Klick verschluckt. Die Bewerterzahl steht bewusst
dabei: 4,8 aus einer Stimme heißt etwas anderes als 4,8 aus zwanzig.
**Gesamtschnitt: erst je Kriterium über alle, dann über die Kriterien**,
gerundet **einmal** am Ende — die Kopfzahl bleibt aus den Zeilen
nachvollziehbar (nicht exakt nachrechenbar; wer Zehntel von Hand mittelt,
kann um bis zu 0,05 danebenliegen). Es zählen nur Werte > 0.
**Rücksetzen trifft ausschließlich die eigenen Werte** — Doppelklick das
eigene Kriterium, der Knopf „Meine Bewertung zurücksetzen" die eigenen Werte
des Eintrags.

**Die Stimmenliste kam in 0.8.2 dazu und ist in 0.8.6 gewandert** — unter der
Sternzeile stand je Kriterium, wer welchen Wert vergeben hat, für jeden
sichtbar. Das ist mehr, als eine Bewertung aussagen soll: **der Schnitt und
die eigene Zahl reichen.** Wer welchen Wert vergeben hat, sieht seitdem nur
noch der **Admin in einer eigenen Ansicht**, die er über den Knopf „Wer hat
bewertet" im Blockkopf ausdrücklich aufruft. Sie ist zugleich der **Löschweg**
für eine fremde Bewertung — der hing am ✕ in der Stimmenzeile und ist
mitgewandert. Siehe den Block „0.8.6" in Teil III.

## 6. Testtage, Zeitleiste, „Getestet" — erledigt in 0.7.0

**Was gilt:** Der Sternwert eines Testtags gehört dem Eintragenden; im
Blockkopf Schnitt und Anzahl über alle. Zwei Leute am selben Datum sind zwei
Testtage (`UNIQUE(item_id, day, user_id)`). `testAvg`, `testCount`,
`testLast` und die drei Testsortierungen laufen über alle Benutzer;
**„`null`, nicht `0`"** bleibt, und **ein Testtag hat keine Null** — er fand
statt und hat eine Note, oder er wird gelöscht. **Zeitleiste:** alle Punkte,
die eigenen gefüllt, fremde als Ring; dazu die Verlaufskurve im Eintrag.

**„Getestet" bleibt eine Eigenschaft des Eintrags** — *jemand* hat getestet,
wie „abgelehnt". Damit gilt die serverseitige Sperre („lässt sich nicht
abschalten, solange Testtage vorhanden sind") über alle Benutzer: **fremde
Testtage können den eigenen Schalter blockieren.** Die Meldung muss das
sagen, sonst wirkt der Schalter defekt.

## 7. Wer darf was anlegen

Die Regel, aus der sich alles ergibt:

> **Was an allen Einträgen aller Benutzer erscheint, gehört dem Admin. Was
> nur dort erscheint, wo man es hinsetzt, gehört jedem.**

**Kriterien — erledigt in 0.7.0:** angelegt, umbenannt, sortiert und
gelöscht wird ausschließlich im Systembereich, alle vier Wege hinter einem
Wächter. Anlegen und Aufräumen gehören an dieselbe Stelle — wer Unordnung
erzeugen kann, die nur einer aufräumen kann, erzeugt sie. *(Verworfen: ein
Antragswesen.)*

**Erledigt in Stufe G2, zweite Hälfte (0.8.4):**

**Tags und Kategorien: anlegen darf jeder — abschaltbar.** Zwei getrennte
globale Schalter im Verwaltungsbereich (`tagsFreiAnlegen`,
`kategorienFreiAnlegen`), Vorgabe an, als Ableitung beim Lesen. Aus heißt:
Auswahl aus dem Vorhandenen bleibt, nur die Zeile „+ neu anlegen" verschwindet.
Zuweisen darf immer jeder, umbenennen und löschen bleibt wie heute im
Systembereich. **Der Admin kommt am Schalter immer vorbei** — im Entwurf noch
offen, beim Bauen entschieden: er räumt ohnehin auf, ein Schalter gegen sich
selbst wäre schief.

Der Unterschied zu den Kriterien: ein neuer Tag erscheint nur dort, wo man ihn
hinsetzt. Ein neues Kriterium erscheint überall. **Deshalb ist es ein Schalter
und keine feste Regel** — der Nutzen kommt erst mit dem dritten Zugang, wenn
einer „Alu" und der nächste „Aluminium" tippt und nur der Admin aufräumen darf.

**Der Sonderfall am Testtag**, der im Entwurf fehlte: dort gibt es keine
Tagwolke, die Eingabe ist der einzige Zuweisungsweg. Sie bleibt stehen; ein
unbekannter Name wird vom Server abgewiesen. Sonst nähme der Schalter das
Zuweisen mit, und „Zuweisen darf immer jeder" gilt.

**Die gewählte Stellung im Betrieb, seit 0.8.5 entschieden:** bei den
**Kategorien** ist der Schalter **aus** — eine neue Kategorie legt nur der
Admin an, am Eintrag bleibt das Auswahlfeld aus dem Vorhandenen. Bei den
**Tags** ist er **an** — dort vergibt jeder einen neuen Namen unmittelbar am
Eintrag. Im Systembereich sieht ein gewöhnlicher Benutzer seit 0.8.5 bei
beiden nur noch die Liste; umbenannt und gelöscht wird dort weiterhin
ausschließlich vom Admin. **Das ist eine Einstellung, kein Bau** — genau
dafür ist der Schalter da, und beide Stellungen sind jederzeit umkehrbar.

## 8. Einstellungen: global gegen persönlich — erledigt in 0.6.5

| persönlich (`user_settings`) | global (`settings`, Admin) |
|---|---|
| `filters` — Filter- und Sortierwahl | `title_public`, `title_app` |
| `schrift` — Schriftgröße | `vokabular` — elf Wörter |
| `bloecke` — Anordnung und Einklappzustand | `tagsFreiAnlegen`, `kategorienFreiAnlegen` *(0.8.4)* |
| `suchNamen` — Zahl der Anbieternamen | `registrierung` *(Stufe I)* |
| `linkZeilen` — sichtbare Linkzeilen | Mail-Einstellungen, öffentliche Adresse *(Stufe I)* |
| `zeitleiste` — ein/aus | `suche`, `sucheEigene`, `sucheAktiv` |

Das Vokabular bleibt global — es ist die Sprache der Anwendung, keine
Ansichtssache. Blockanordnung und Einklappzustand liegen weiterhin **nicht**
im Export. Die Suchanbieter gingen abweichend vom ersten Entwurf global;
persönlich ist allein `suchNamen`. Gegen ein erneutes globales Schreiben
eines persönlichen Schlüssels steht eine Schranke in `putSetting`.

## 9. Verwaltung

**Gebaut in 0.8.0 (Stufe G1):** die Karte „Zugänge" im Systembereich (nur für
Admins) — anlegen mit erstem Passwort, sperren und freigeben, Passwort
zurücksetzen, Rolle wechseln (nur Eigentümer), entfernen. **„Sperren" ist
wichtiger als Löschen** — Anmeldung blockiert, Inhalte bleiben. `status` ist
an **zwei** Stellen durchgesetzt (Anmeldung und `requireAuth`, jede mit
eigener Gegenprobe, Stolperstein 51); ein Gesperrter erfährt den Grund, aber
erst **nach** dem richtigen Passwort.

**Löschen entwertet, es löscht nicht — die wichtigste Abweichung der ganzen
Stufe.** Die Zeile bleibt mit ihrer `id` stehen, `status` wird `geloescht`,
der Hash geleert, der Name mit `geloescht-<id>` überschrieben und damit
**freigegeben** (das Muster ist als Benutzername gesperrt, geprüft an beiden
Wegen). Die Beiträge bleiben stehen und tragen künftig „Gelöschter
Benutzer 7". Damit bleiben die `ON DELETE`-Klauseln unverändert und sind
reines Auffangnetz für ein `DELETE` von Hand. *Statt einer Entscheidung gibt
es zwei Häkchen* (Vorgabe: beide aus): **„seine Einträge löschen"** nimmt
über die Kaskade auch **fremde** Kommentare, Bewertungen und Testtage daran
mit; **„seine Beiträge in fremden Einträgen löschen"** trifft nur seine
eigenen. Der Dialog nennt die Zahlen aus `GET /api/users/:id/bestand`.
Sitzungen, Favoriten und persönliche Einstellungen gehen immer mit.

**Anmeldebremse — erledigt in 0.8.0, mit berichtigter Begründung:** die
IP-Bremse kann niemanden anderen aussperren; der echte Gewinn ist die Bremse
**je Benutzername** gegen verteiltes Raten. **Der Name wird nur verzögert,
nie hart gesperrt** — eine harte Namenssperre wäre ein Werkzeug gegen fremde
Zugänge. Kennwerte unverändert (weich ab 5, hart ab 10, fünf Minuten, je IP).

**`AUTH_RESET` — anders gelöst in 0.8.0:** nicht begrenzt, sondern durch
**`zugang.js`** auf dem Wirt ersetzt (`liste`, `passwort`, `entfernen`,
`eigentuemer`); die Umgebungsvariable wird beim Start **abgelehnt** und das
Protokoll nennt den neuen Weg. So machen es Nextcloud, GitLab, Grafana,
WordPress und Home Assistant auch: ein Befehl, ein Name, nur das Passwort.
Damit entfällt das Rücksetz-Fenster ganz — und mit ihm der Einmalcode aus
Stufe H, der nur existierte, um es zu schließen.

**Offen (H/I):**

**Adressen doppelt vergeben: hinter der Anmeldung klar sagen, davor nicht.**
Legt der Admin jemanden an oder ändert jemand seine eigene Adresse, ist
„Diese Adresse ist bereits vergeben, bitte eine andere eintragen" die richtige
Antwort — wer das sieht, ist angemeldet und sieht die Liste ohnehin. Für die
**Selbstregistrierung** vor der Anmeldung gilt das Gegenteil, siehe
Abschnitt 10: dort ist jede unterschiedliche Antwort ein Werkzeug zum
Durchprobieren von Adressen.

## 10. Registrierung und Tokens — offen, Stufe I (Selbstanmeldung) und H (Tokens)

**Auf einen Schalter gekürzt, entschieden vor 0.8.0:** der Schalter
„Mehrbenutzerbetrieb ein" widersprach Abschnitt 1 („ein Zustand, keine zweite
Wahrheit", Stolperstein 47 in Reinform) und ist gestrichen. Es bleibt allein
`registrierung`, und der gehört in die Stufe, die die Selbstanmeldung baut.
Die geschlossene Gruppe entsteht von selbst — ist die Selbstanmeldung aus,
legt nur der Admin an.

Ablauf der Selbstregistrierung: Der Anfragende gibt **nur** Benutzername und
E-Mail-Adresse an, kein Passwort. Admin prüft und schaltet frei. Erst danach
erzeugt der Server einen Token, und der Benutzer setzt über den Link sein
Passwort selbst.

**Die Antwort auf eine Registrierung sieht immer gleich aus**, egal ob Name oder
Adresse bereits existieren („Danke, die Anfrage liegt beim Admin").
Andernfalls ist das Formular ein Werkzeug zum Durchprobieren von Adressen.

**Token:** 32 Zufallsbytes, gespeichert wird nur der Hash, einmal gültig, Ablauf
nach sieben Tagen, beim Einlösen alle Sitzungen dieses Benutzers beenden. **Ein
Mechanismus, zwei Anlässe** — Einladung und Passwortrücksetzung.

**Missbrauchsschutz:** Deckel auf offene Anfragen (Vorschlag: 20), Zeitsperre pro
IP.

**Der Mindestwert von zehn Zeichen** aus 0.5.0 gilt unverändert für jedes
Passwort, das über einen Token gesetzt wird.

**Eindeutigkeit der Adresse — zu entscheiden, wenn sie gebraucht wird.**
`users.email` hat bewusst **kein** `UNIQUE`: `ALTER TABLE` kann eines nicht
nachrüsten, die gewanderte und die frisch angelegte Datenbank wären damit
verschieden gebaut (0.6.0, Abweichung 5). Wird Eindeutigkeit gewollt, ist der
richtige Weg ein **partieller Index**
(`CREATE UNIQUE INDEX IF NOT EXISTS … ON users(email) WHERE email IS NOT NULL`)
— der wirkt auf beiden Wegen gleich und lässt mehrere Zugänge ohne Adresse zu.
Er gehört dann in dieselbe Stufe wie die Prüfung im Code, nicht davor.

## 11. E-Mail

`nodemailer` — ohne Laufzeitabhängigkeiten, MIT-0, passend zur Linie von scrypt
(Nodes eingebautes `crypto` statt einer Bibliothek). Nur ausgehend, kein offener
Port.

**Klarstellung zur Begrifflichkeit:** GMX, Google und Strato sind keine
Alternativen zu nodemailer, sondern das, was man **mit** nodemailer einträgt.
nodemailer spricht SMTP und hat weder eigenen Versand noch eigene Adresse.

**Auswahlliste mit Vorlagen plus „eigener Server"**, nach dem Muster der
Suchanbieter: GMX, Web.de, Gmail, Strato, IONOS füllen Server, Port und
Verschlüsselung selbst aus; einzutragen sind nur Benutzer, Passwort und
Absenderadresse. Bei „eigener Server" stehen alle Felder offen.

Drei Hinweise gehören dabei in die Oberfläche:

- **Gmail** braucht Zwei-Faktor und ein App-Passwort; das Kontopasswort wird
  abgewiesen.
- **GMX** verlangt, den Versand über fremde Programme im Konto freizuschalten.
- **Die Absenderadresse muss zum Konto gehören** — man kann nicht als
  `kriterion@zuhause.local` über GMX senden.

**Zustellbarkeit:** direkt vom Hausanschluss zu versenden scheitert an fehlender
rDNS und SPF/DKIM. Deshalb immer über den SMTP-Zugang eines Anbieters.

**Öffentliche Adresse:** Hinter dem Proxy weiß der Container nicht, wie er von
außen heißt. Sie wird eine **Einstellung** und darf **niemals** aus dem
`Host`-Kopf abgeleitet werden — sonst lässt sich ein Rücksetzlink über einen
gefälschten Kopf auf einen fremden Server umbiegen.

**Zugangsdaten** in die `.env`, in der Oberfläche nur „gesetzt/nicht gesetzt".
Dazu ein **Testmail-Knopf** — sonst fällt der Fehler erst auf, wenn jemand
wartet.

### Der Punkt, der das Offline-Prinzip erhält

**Jeder Link, der verschickt wird, ist im Verwaltungsbereich zusätzlich zum
Kopieren sichtbar.** Schlägt der Versand fehl, bricht nichts ab: der Admin
sieht „Versand fehlgeschlagen" und daneben den Link.

Damit läuft Kriterion mit abgeschaltetem Mailversand **vollständig**, rein
offline, ohne dass eine Funktion fehlt. E-Mail ist eine Bequemlichkeit, keine
Voraussetzung. Das ist die wichtigste Entwurfsentscheidung des ganzen Vorhabens
— sie ist der Grund, warum der Umbau die Veröffentlichung nicht verschlechtert.

*Vorgemerkt, nicht eingeplant:* Falls SMTP am Anschluss gar nicht durchkommt
(manche Anbieter sperren Port 587 ausgehend), wäre ein Versanddienst über HTTPS
statt SMTP der Ausweg — Brevo, Mailjet, Postmark haben Schnittstellen, die sich
mit einem einfachen `fetch` bedienen lassen, ganz ohne Bibliothek. Zweiter Weg im
Code, erst bauen, wenn SMTP nachweislich scheitert.

## 12. Export und Import — erledigt in 0.7.1 und 0.7.2

**Was gilt:** Der Export nennt zu **jedem Eintrag, jeder Bewertung, jedem
Kommentar, jedem Testtag und — seit 0.8.30 — jeder Linkzeile** den
Verfassernamen (**fünf** Träger; der Eintrag fehlte im Entwurf, die Linkzeile
kam mit Stufe G4 dazu). **Formatversion 7** seit 0.8.30, davor 6. Beim Import wird ein bekannter
Name zugeordnet, alles andere fällt **laut gemeldet** an den Importierenden;
**ein unbekannter Name legt keinen Zugang an**, die Anpinnung wandert nicht
mit, geliefert wird der Name, nie die Id. Ältere Exportdateien bleiben
lesbar. **Export und jeder Import gehören dem Eigentümer** (0.7.2). **Der
ersetzende Import rührt `users`, `sessions` und `tokens` nicht an** — täte
er es, würde er im schlimmsten Fall alle aussperren.

## 13. Was dabei aufgegeben wird

Ein Schlüssel, eine Datenbank. Jeder Benutzer vertraut dem Betreiber mit allem,
was er einträgt — lesbar ist alles, Rechtetabelle hin oder her. Bei einer
selbstgehosteten Sache ist das normal, gehört aber in die README, sobald Fremde
mitmachen. Verschlüsselung je Benutzer wäre ein Neubau, kein Anbau.

**Abschalten:** Der Mehrbenutzerbetrieb lässt sich nur zurücknehmen, solange kein
zweiter aktiver Benutzer existiert. Sonst würden fremde Inhalte herrenlos.

---

# Teil III — Stufen

Geschnitten nach **Arbeitsmenge je Thread**, nicht nach Sichtbarkeit. Jede
Stufe muss in einem Chat abzuarbeiten sein. **Die Versionsnummern der offenen
Stufen sind mit der Bereinigung 0.8.1 hochgerückt.**

> **Neue Nummern für die offenen Stufen — G4 wird 0.8.30, H wird 0.8.80, I
> bleibt 0.9.0.** Die Stufen des Umbaus stehen nicht mehr allein: der
> Gesamtplan im Projektstand, Abschnitt 10, schiebt Runden dazwischen, die
> nicht zum Mehrbenutzerbetrieb gehören (Werkzeug, Sicherheit, Gewichtung,
> Kurzvideos, Sicherung). **Die Nummern gehen dort in Zehnerschritten**, damit
> zwischen zwei Stufen neun Nummern für Berichtigungsrunden frei bleiben —
> 0.8.1 und 0.8.6 waren genau das und mussten sich in eine geplante Nummer
> drängen. **Mit 0.8.10 ist der Zehnerschritt zum ersten Mal wirklich
> gebaut**, und die Sortierung `0.8.9 < 0.8.10 < 0.8.20` hat im Betrieb
> gehalten.
>
> **Der Inhalt der Stufen G4, H und I bleibt unverändert und wird weiter hier
> gepflegt.** Nur ihre Nummern und ihre Nachbarn stehen im Projektstand.

| | Version | Was | Umfang |
|---|---|---|---|
| **A** | 0.6.0 | `users` um `role`/`email`/`status`/`last_login`, `sessions.user_id`, `req.benutzer` — **erledigt**, siehe unten | klein |
| **B** | 0.6.1 | `user_id` an `items`, `comments`, `test_days` — **erledigt**, siehe unten | mittel |
| **C** | 0.6.2 | Tabellenneubau: `ratings` und `test_days` mit neuem UNIQUE — **erledigt**, siehe unten | mittel, riskant |
| **C2** | 0.6.3 | `item_pins` statt `items.favorite` — **erledigt**, siehe unten | mittel |
| — | 0.6.4 | *Keine Stufe.* Berichtigung: der Favoriten-Knopf zeichnete sich nach dem Klick nicht neu (Stolperstein 61) | winzig |
| **D** | 0.6.5 | `user_settings`: sechs Schlüssel werden persönlich — **erledigt**, siehe unten | klein |
| — | 0.6.6 | *Keine Stufe.* Am Eintrag heißt es **Favorit**, sortiert nicht mehr vor, eigener Filter „★ Favoriten". Der Filter liegt in `filters` und ist damit seit Stufe D persönlich | klein |
| **E** | 0.7.0 | Bewertungsanzeige, Testtage, Zeitleiste, Kriterien in den Systembereich — **erledigt**, siehe unten | groß |
| **E2** | 0.7.1 | Export und Import mit Verfassernamen — **erledigt**, siehe unten | mittel |
| **F** | 0.7.2 | Rechteschicht serverseitig, Endpunkt für Endpunkt; dazu der Selbstbezug — **erledigt**, siehe unten | mittel |
| **G1** | 0.8.0 | Verwaltungskarte, Rollen, Sperren, Namensbremse, `zugang.js` — **erledigt**, siehe unten | groß |
| — | 0.8.1 | *Keine Stufe.* **Bereinigung:** `legacy.js` und aller Migrationscode entfernt, Schema als DDL, Prüfstand auf frische Anlagen (−102 Prüfungen), Kommentare und Vokabular vereinheitlicht, Dokumente eingedampft | mittel |
| **G2a** | **0.8.2** | Verfassernamen an vier Trägern, Stimmenliste je Kriterium, Löschdialog am Eintrag, Endpunkt für fremde Bewertungen — **erledigt**, siehe unten | mittel |
| **G2b** | **0.8.3** | Eingriffsvermerk am Kommentar, `mine` am Kommentar samt der Oberfläche dazu, blaue Aufgabenmarke, Tagwolke — **erledigt**, siehe unten | mittel |
| **G2c** | **0.8.4** | Rest von G2: die beiden Anlegen-Schalter und die Vergleichsansicht; dazu die Rolle im Vermerk, `updated_at` bei den Bildwegen und die Zahlen am Kommentarblock — **erledigt, Stufe G2 vollständig**, siehe unten | mittel |
| **G3** | **0.8.5** | „Der Systembereich lernt die Rechte": dreizehn Karten nach Rolle, `GET /api/stats` hinter den Admin, Karte „Links" in zwei geschnitten, Kachel „Zugänge" über die volle Breite, Trennlinien — **erledigt**, siehe unten | mittel |
| — | **0.8.6** | *Keine Stufe.* **Berichtigungen aus dem Betrieb:** Bewertungsdetails nur noch für den Admin (eigener Endpunkt, Löschweg mitgewandert), Scrollen der Linkliste am Finger, Lücke im Kartenraster, Datum am Eintragsverfasser, „angemeldet als" in der Kopfzeile — **erledigt**, siehe unten | klein |
| — | **0.8.10** | *Keine Stufe.* **Werkzeug:** `package-lock.json` eingecheckt und `npm ci` statt `npm install`, `sharp` auf 0.35.3, Image auf Node 22, Versions-Fingerprint über die ausgelieferten Dateien, Prüfstand in Gruppen aufrufbar und bei jedem Push — **erledigt**, den Umbau nicht berührt | klein |
| — | **0.8.20** | *Keine Stufe.* **„Die Schotten dicht":** SVG am Fotoweg (Typ aus den ersten Bytes statt aus der Datenbank), Sicherheitsregel für die Anwendung selbst, `X-Forwarded-For` nur nach Einstellung samt `Secure`/HSTS/`__Host-`, Fehler-Handler nach Rang, sauberes Herunterfahren, Index auf `sessions.user_id` — **erledigt**, den Umbau nicht berührt | klein |
| **G4** | **0.8.30** | „Die Linkliste bekommt Verfasser": `user_id` an `links`, jeder trägt ein, löschen darf Eintrager oder Admin, Name an der **fremden** Zeile ab zwei Zugängen, Formatnummer 6 → 7 — **erledigt, Stufe G vollständig**, siehe unten | mittel |
| — | **0.8.31** | *Keine Stufe.* **Dieselbe Wende an den Dateien:** `user_id` an `attachments`, hochladen offen, löschen beim Hochladenden oder Admin, Name an der fremden Zeile, Formatnummer 7 → 8 — **erledigt** | klein |
| **H** | **0.8.80** | Tokens für Einladung und Rücksetzung, im Verwaltungsbereich zum Kopieren. Dazu **„Meine Sitzungen"** — sehen, wo man angemeldet ist, und einzelne Sitzungen beenden. *Der Einmalcode im Protokoll ist entfallen — siehe Stufe G1.* | mittel |
| **I** | 0.9.0 | Mailversand mit Anbietervorlagen, öffentliche Adresse, Testmail, Selbstregistrierung mit Freischaltung. *Abbruchpunkt: nach dem Versand, vor der Selbstregistrierung.* | groß |

**G4 ist gebaut, und damit sind die Stufen A bis G vollständig.** **Zwischen
G4 und H liegen vier weitere Stufen** (Gewichtung, Kurzvideos, „Offen/Neu",
Sicherung und Papierkorb). Alle vier gehören nicht zum Mehrbenutzerbetrieb und
stehen deshalb im Projektstand, Abschnitt 10 — zusammen mit der Begründung für
die Reihenfolge. **Die ersten drei — 0.8.40 (Gewichtung), 0.8.50 (Kurzvideos) und 0.8.60
(„Offen/Neu") — sind gebaut; als Nächstes 0.8.70, „Sicherung und
Papierkorb".**

Danach: Zwei-Faktor, Suche, dann 1.0.0. **Zwei Punkte hängen unmittelbar an
Stufe I und gehören beim Bauen mitgedacht:** die Tokens aus H tragen auch die
Zwischenstufe der Zwei-Faktor-Anmeldung (0.9.10), und der Satz „E-Mail ist
Bequemlichkeit, nie Voraussetzung" gilt dort **nicht** — ein zweiter Faktor
über TOTP braucht ausdrücklich kein Netz und darf deshalb nie ausfallen.

## Stufe A — erledigt in Version 0.6.0

Gebaut wie entworfen: vier Spalten an `users`, `sessions.user_id` mit
`ON DELETE CASCADE`, `req.benutzer` in `requireAuth`; drei Umbenennungen in
`auth.js`, weil sich der Vertrag änderte (`legeSitzungAn`, `pruefeAnmeldung`,
`sitzungsBenutzer`), `last_login` wird in `legeSitzungAn()` mitgeschrieben.
**Abweichungen:** bestehende Sitzungen wurden nachgezogen statt gelöscht
(Teil V Punkt 1); „gibt es keinen Admin, wird es der Eigentümer" schloss die
Lücke, wer der erste Admin wird; die Durchsetzung von `status` wurde bewusst
nach Stufe G verschoben; `email` bekam **kein** `UNIQUE` (ein partieller
Index, falls je gebraucht — Abschnitt 10).

## Stufe B — erledigt in Version 0.6.1

`user_id` an `items`, `comments`, `test_days`; Zuweisung beim Anlegen;
Bestand fiel dem ersten Benutzer zu. **Die eigentliche Entscheidung war
`ON DELETE SET NULL`** (Teil II Abschnitt 4). **Abweichungen:** die Migration
brauchte **drei** Aufrufstellen statt einer (Teil V Punkt 10; seit 0.8.1 sind
es zwei — die `.env`-Übernahme ist entfallen); `test_day_tags` bekam keine
eigene Spalte (der Verfasser folgt dem Testtag); der Verfasser wandert beim
Ersetzen eines Testtags mit; `user_id` erscheint in den Antworten. Seitdem
kann der Prüfstand **zwei echte Rufer** nebeneinanderstellen — das Muster
jeder Rechteprüfung (Stolperstein 56).

## Stufe C — der Tabellenneubau — erledigt in Version 0.6.2

`ratings` und `test_days` neu angelegt mit `user_id` im UNIQUE, in einer
Transaktion, Reihenfolge `PRAGMA foreign_keys=OFF` → `BEGIN` → Umbau →
`COMMIT` → `ON`, die `id` der Testtage mitkopiert, geprüft an einem Bestand
mit Tags an Testtagen. Die zwei Fallen, nachgestellt vor dem Bauen: **ein
`DROP TABLE` ist bei scharfen Fremdschlüsseln ein `DELETE`** (die Kaskade
hätte die Tags lautlos mitgenommen), und **`PRAGMA foreign_keys` ist in einer
Transaktion ein stiller No-op**. **Abweichungen:** `item_pins` wurde
herausgelöst (→ C2); das `ON CONFLICT`-Ziel musste mitwandern; die Migration
konnte am neuen UNIQUE scheitern (`UPDATE OR IGNORE`, Stolperstein 57); der
Umbau erkannte seinen Bedarf am UNIQUE-Index, nicht an einer Marke. Nebenbei:
das Zurücksetzen der Bewertungen trifft seitdem nur die eigenen Werte.
*Der Umbaucode selbst ist seit 0.8.1 entfernt; was bleibt, ist das Schema.*

## Stufe C2 — `item_pins` statt `items.favorite` — erledigt in Version 0.6.3

Der Favorit liegt je Benutzer in `item_pins` (`ON DELETE CASCADE` an beiden
Fremdschlüsseln); `items.favorite` wurde geleert und bleibt als ungenutzte
Spalte im Schema. Oberfläche, Stylesheet und `index.html` blieben
unangetastet. **Abweichungen:** **Anpinnen rührt `updated_at` nicht an** —
eine Merkhilfe ist keine Änderung am Eintrag; „ohne Vorgabewert" erwies sich
als leere Zusicherung (Klemme nötig, Stolperstein 59); der Zeitstempelvergleich
brauchte ein festes altes Datum (Stolperstein 60); die Momentaufnahme des
Bestands muss früh genommen werden. **Nicht gebaut, ausdrücklich:** eine
Anzeige, wer außer mir angepinnt hat.

## Stufe D — `user_settings` — erledigt in Version 0.6.5

Die persönliche Hälfte steht (Tabelle in Teil II Abschnitt 8): eine Tabelle
für alle Schlüssel, `PRIMARY KEY (user_id, key)`, `ON DELETE CASCADE` — die
fehlende ON-DELETE-Angabe im Entwurf war genau die Lücke aus Stolperstein 54.
**Abweichungen:** `PERSOENLICHE_SCHLUESSEL` wurde von der Dokumentation zur
**Laufzeit-Schranke** in `putSetting` (kein persönlicher Schlüssel wird je
wieder global geschrieben); die Liste stand zwangsläufig zweimal (seit 0.8.1
nur noch einmal); Teil V Punkt 17 sagte neue Bedienelemente voraus — es gab
keine, aber die vorhandenen Schalter schrieben in eine andere Tabelle, und
genau das war der Anlass für die `dispatchEvent`-Prüfungen.

## Stufe E — die Trennung wird sichtbar — erledigt in 0.7.0 und 0.7.1

Eigene Sterne neben Schnitt und Bewerterzahl, zweistufiger Gesamtschnitt,
`mine` an Testtagen, Zeitleiste mit Ringen, Verlaufskurve, Kriterien in den
Systembereich (alle vier Wege hinter einem Wächter). **Abweichungen:** die
Doppel-JOIN-Warnung traf zu — an einer **anderen** Stelle als vorhergesagt
(`usage_count`; Stolperstein 67); die Rundung einmal am Ende; die Schwelle
für die Durchschnittsspalte liegt in der Oberfläche; fremde Testtage werden
in der Liste nicht gekennzeichnet, nur in der Zeitleiste; zwei Sätze in
Abschnitt 5 des Projektstands wurden widerrufen. **Offen geblieben und
vermerkt (Entscheidung in G2):** die Vergleichsansicht hebt je Kriterium den
besten **eigenen** Wert hervor, die Kopfzeile derselben Spalte zeigt den
Schnitt über alle.

## Stufe E2 — Export und Import mit Verfassernamen — erledigt in Version 0.7.1

**Vier** Träger statt drei (der Eintrag kam dazu; der fünfte, die Linkzeile,
kam mit G4 in 0.8.30); unbekannte Namen werden **laut** gemeldet und fallen an
den Importierenden; kein Zugang wird vom Import angelegt; der Favorit wandert
nicht mit; Formatversion 6, seit 0.8.30 **7**. **Dabei
gefunden, älter als die Stufe:** `INSERT OR REPLACE` ist ein `DELETE` mit
Nachspiel — die Kinder gehen über die Kaskade mit (Stolperstein 70; Teil V
Punkt 18 hält die Warnung für die Löschwege in G2 fest).

## Stufe F — die Rechteschicht — erledigt in Version 0.7.2

Jeder schreibende Endpunkt fragt serverseitig, wer etwas darf; bei einem
einzigen Zugang verweigert nichts. **Abweichungen (die wichtigsten von
neun):** „Leitung" heißt seitdem **Admin**, daneben steht der **Eigentümer**;
**Export und Import gehören dem Eigentümer**, nicht dem Admin; zwei Endpunkte
tragen zwei Rechteklassen in einem Rumpf; die Note eines fremden Testtags
ändert niemand; Tags und Kategorie am Eintrag gehören dem Verfasser; bei den
Bewertungen steht ausdrücklich kein Wächter (beide Wege treffen nur die
eigene Zeile); `aendereZugang()` behielt seinen Namen (Klemme statt
Umbenennung). **Neu entstanden: der Wächter über den Quelltext** — `F_ROUTEN`
hält jede schreibende Route samt Absicherungsart gegen `server.js`, in beide
Richtungen; er ist die einzige Prüfung, die eine **fehlende Entscheidung**
findet. **Der Selbstbezug wurde hierher vorgezogen** und ist ganz entfernt:
`GET /api/account` liest `req.benutzer`, `aendereZugang()` bekommt die
Nummer übergeben, das `DELETE FROM sessions` trägt `AND user_id = ?` — drei
Stellen, drei eigene Gegenproben. **Für G2 weiter offen:** der Vermerk, wenn
der Admin ein fremdes Kommentarbild entfernt, und der Endpunkt, mit dem ein
Admin eine fremde Bewertung löscht.

## Stufe G1 — Verwaltung, Rollen, Sperren — erledigt in Version 0.8.0

**Gebaut ist die erste Hälfte der Stufe G**, nach der Teilung aus dem
Betrieb: 0.8.0 brachte den zweiten echten Zugang, G2 bringt die
Verfassernamen auf den Bildschirm. Seitdem lässt sich die Rechteschicht aus
0.7.2 von Hand gegenprüfen. **Fünf Abweichungen**, alle in Teil II an ihrer
Stelle vermerkt: der Eigentümer ist ein **dritter Rollenwert** (`MIN(id)`
kommt in `server.js` nicht mehr vor, ein Wächter zählt nach); **Löschen
entwertet** (Grabstein, Name freigegeben, `ON DELETE`-Klauseln unverändert);
**`AUTH_RESET` ist durch `zugang.js` ersetzt** (der Einmalcode aus Stufe H
entfällt ersatzlos); die **Namensbremse verzögert nur**; der Schalter
„Mehrbenutzerbetrieb ein" ist gestrichen. Dazu die Regel, die beim Besprechen
entstand: **ein Admin kommt nicht an seinesgleichen.** Und der Preis, der
genannt gehört: `geloescht-<zahl>` ist als Benutzername gesperrt, geprüft an
beiden Wegen (Anlegen und Umbenennen).

~~**Für Stufe G2 gilt daraus:** die Oberfläche hat mit `daten.ich`,
`daten.darfRollen` und dem Grabstein-Status bereits alles, was sie braucht.~~
**Berichtigt in 0.8.2:** das galt **nur** für die Karte „Zugänge". `GET
/api/users` steht hinter `nurAdmin`; für die Beiträge im Eintrag lag nichts
bereit, und die Auflösung Nummer → Verfasser musste eigens gebaut werden.
Wer dort eine schreibende Route ergänzt, trägt sie in `F_ROUTEN` ein; die
Liste (aktuell 47 Routen) kennt seit 0.8.0 eine vierte Art,
`'nurAdmin, im Rumpf'`, für Routen, die hinter einem Wächter stehen **und**
drinnen noch einmal unterscheiden.

## Stufe G2, erste Hälfte — erledigt in Version 0.8.2

**Was gilt.** Eintrag, Kommentar, Testtag und jede einzelne Bewertung nennen
ihren Verfasser als Objekt `verfasser: { id, name, geloescht }`; die nackte
`user_id` steht in keiner Antwort mehr. Gebaut aus **einer** Karte je Anfrage.
Ein Grabstein liefert `name: null` — die Beschriftung „Gelöschter Benutzer 7"
entsteht in `public/app.js`, an genau einem Ort, den auch die Karte „Zugänge"
ruft; eine herrenlose Zeile heißt „Ohne Verfasser". Je Kriterium entsteht die
**Stimmenliste** mit `id`, `wert`, `mine` und Verfasser aus einer eigenen
gruppierten Abfrage — *bis 0.8.5 unter der Sternzeile für jeden, seit 0.8.6 in
der Adminansicht.* **Bei genau einem aktiven Zugang bleibt
davon alles aus**, abgeleitet aus `benutzerZahl` — kein Schalter, keine zweite
Schwelle. Der **Löschdialog am Eintrag** liest seine Zahlen aus
`GET /api/items/:id/bestand`, getrennt nach eigen und fremd aus Sicht des
Löschenden. **`DELETE /api/ratings/:id`** entfernt eine einzelne fremde
Bewertung, hinter `darfAendern`; die Note ändert niemand.

**Abweichungen.** Das Feld heißt `verfasser`, nicht `author` — der Export-
`author` ist eine blanke String, hier steht ein Objekt, und gleicher Name
bei anderer Form wäre eine Falle. *Verworfen:* ein Endpunkt `GET /api/verfasser`
— er legte die vollständige Zugangsliste jedem offen. Der **Grabsteinname
verlässt den Server nicht** (`name: null`), weil er freigegeben ist und längst
einem anderen gehören kann; beim Bauen war das zuerst falsch. Die
**Stimmenliste** stand nicht im Entwurf und ist trotzdem nötig: ohne sie hätte
der Löschweg für fremde Bewertungen keine Bedienung. Bei den Zahlen des Dialogs
zählen nur Bewertungen mit **Wert > 0** — das weicht bewusst von
`zaehleBestand()` ab, das ohne diese Bedingung zählt; dort lautet die Frage „was
hängt an diesem Zugang", hier „was geht anderen verloren".

**Berichtigung des Entwurfs.** Der Ergebnisblock zu Stufe G1 behauptete, für
„Gelöschter Benutzer 7" liege alles bereit. Das galt **nur** für die Karte
„Zugänge": `daten.ich` und `daten.darfRollen` kommen aus `GET /api/users`, und
die Route steht hinter `nurAdmin`. Für die Beiträge im Eintrag lag nichts
bereit. Und das genannte Muster heißt im Quelltext `verfasserName()` im
**Export**; `verfasser()` im Import macht die Gegenrichtung.

**Nicht gebaut, am Haltepunkt angehalten:** der Eingriffsvermerk am Kommentar,
die beiden Anlegen-Schalter und die Vergleichsansicht — alle drei entschieden,
siehe die zweite Hälfte unten.

## Stufe G2, zweite Hälfte — erledigt in Version 0.8.3 und 0.8.4

**Stufe G2 ist mit 0.8.4 vollständig.** Alle sieben Punkte der zweiten Hälfte
gebaut, keiner offen. Details und Abweichungen im Projektstand, Abschnitt 5
und Abschnitt 9.

~~**Der Eingriffsvermerk am Kommentar.**~~ **Erledigt in 0.8.3.** Entschieden
als **bewusste Ausnahme von „kein Änderungsverlauf"**, und die Begründung
gehört mit ihm ins Dokument: er ist eine Aussage über den *jetzigen* Zustand —
kein Wer, kein Wann, keine Kette. Gebaut wie entworfen: Spalte
`images_removed INTEGER NOT NULL DEFAULT 0` an `comments` in der DDL,
hochgezählt nur bei fremdem Eingriff, in der Antwort als `bilderEntfernt`, in
der Kopfzeile als eigene Angabe, nie im Textfeld, nicht zurücksetzbar, nicht im
Export, Formatnummer bleibt 6.
**Abweichung:** der Satz „kein Migrationscode (die Vorgabe 0 greift für jede
Bestandszeile)" war **falsch** — er galt für die Zeilen, nicht für die Spalte.
`CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht an
(Stolperstein 13), und seit 0.8.1 gibt es keinen Nachrüstweg mehr. 0.8.3 hat
deshalb einen markierten Migrationsblock `migration083()` bekommen — vor dem Bauen
nachgestellt, gemeldet und freigegeben. **Merksatz für jede weitere Spalte:
DDL und Migrationsblock, nicht eines von beidem.**
~~**Offen für 0.8.4:** der Vermerk nennt die Rolle.~~ **Erledigt in 0.8.4.**
„2 Bilder vom Admin entfernt" — ohne eigenes Feld: wer beide Klemmen an
`DELETE /api/comment-images/:id` passiert (`darfAendern`, dann ein anderer als
der Verfasser), kann nur der Admin sein. Eine Prüfung am Quelltext bindet die
Beschriftung an genau diese beiden Klemmen. **Der Vermerk bleibt für ALLE
sichtbar:** das Loch ist für jeden Leser da, und ein Vermerk, den nur einer
sieht, wäre eine Benachrichtigung — die hat Kriterion nicht.

~~**Dazu für 0.8.4: `updated_at` bei den Bildwegen des Verfassers.**~~
**Erledigt in 0.8.4.** Anhängen ist Bearbeiten, also ist Entfernen es auch —
beide setzen jetzt „bearbeitet", aber nur der Verfasser selbst löst es aus. An
der Löschroute gilt damit genau eines von beiden, gebaut als `if`/`else` um
dieselbe Bedingung: der Vermerk beim Fremden, `updated_at` beim Verfasser, nie
beides und nie keines. Der Eingriff des Admins setzt es nie. **Abweichung, im
Auftrag nicht vorgesehen:** ein Ruf ohne Datei (`POST
/api/comments/:id/images` ohne Anhang) setzt ebenfalls nichts — nichts
angehängt heißt nicht bearbeitet. „Ein Merkmal umzuschalten ist keine
Bearbeitung" bleibt unberührt.

~~**Die beiden Anlegen-Schalter. Offen, Version 0.8.4.**~~ **Erledigt in
0.8.4.** `tagsFreiAnlegen` und `kategorienFreiAnlegen`, global, Vorgabe an, als
**Ableitung beim Lesen** — kein Migrationscode. Geschrieben über `PUT
/api/settings`, dessen Adminprüfung bereits abgeleitet ist („was nicht
persönlich ist, ist Adminsache"), also keine neue Route und keine zweite
Liste. Drei Anlegewege bekommen die Klemme, jeweils **hinter** dem
Nachschlagen des vorhandenen Namens — nur so bleibt „Zuweisen darf immer
jeder" baulich wahr: `POST /api/product-categories`
(`'offen'` → `'im Rumpf'`), `POST /api/items/:id/tags`
(`'nurEintragVerfasser'` → `'nurEintragVerfasser, im Rumpf'`) und
`POST /api/test-days/:id/tags` (schon `'im Rumpf'`). Der Import braucht keine:
er gehört dem Eigentümer.
**Der Sonderfall, der im Entwurf fehlte:** „Auswahl aus dem Vorhandenen bleibt,
nur ‚+ neu anlegen' verschwindet" trägt an der Kategorie (die Auswahlliste
bleibt) und an den Tags am Eintrag (die Wolke bleibt). **Am Testtag gibt es
keine Wolke** — dort ist die Eingabe der einzige Zuweisungsweg und bleibt
stehen; ein unbekannter Name wird vom Server mit sprechender Meldung
abgewiesen, denn „Zuweisen darf immer jeder".
**Zwei Abweichungen gegenüber dem Entwurf, beide vor dem Bauen gemeldet:**
`findOrCreateTag()` musste in `findeTag()` und `legeTagAn()` zerlegt werden —
ein gemeinsamer Helfer trüge die Klemme in seinem eigenen Rumpf statt in den
Routenrümpfen, und der Wächter über den Quelltext fände sie dort nicht. Und
der Entwurf schwieg dazu, ob der Admin ebenfalls am Schalter hängt — er tut es
nicht: die Rechtetabelle (Abschnitt 3) gibt ihm für „Tags und Kategorien
anlegen" ohnehin ein ✔, und ein Schalter, den er erst umlegen müsste, um selbst
anzulegen, wäre eine Schranke gegen sich selbst.

~~**Die Vergleichsansicht. Offen, Version 0.8.4.**~~ **Erledigt in 0.8.4.** Die
seit 0.7.0 offene Frage ist gebaut: ein **Umschalter „meine / alle"**. Zwei
Auflagen, ohne die er nichts löst — **die Kopfzeile schaltet mit** (sonst ist
es derselbe Widerspruch mit einem Knopf davor), und er ist **Ansichtszustand
im Speicher**, keine gespeicherte Einstellung, wie `linksOffen` und
`wolkeOffen`. Bei genau einem Zugang erscheint er nicht. **Vorgabestellung
„alle"**; die **Testtagzeile schaltet mit**, gezählt über `mine`. Die Zahl für
„meine" bildet der **Klient**: bei einem Bewerter hat jedes Kriterium
höchstens eine Stimme, Stufe 1 des Zweistufenmittels ist also der eigene Wert
— kein zweiter Rechenweg im Server, aber ein zweiter Rundungsort für eine
*andere* Zahl, kommentiert im Quelltext. *Verworfen wie entschieden:*
durchgehend der Schnitt, durchgehend die eigenen Werte, beides nebeneinander.

~~**Neu für 0.8.4: Zahlen in der Kopfzeile des Kommentarblocks.**~~
**Erledigt in 0.8.4.** Links und Dateien tragen ihren Hinweis, Kommentare als
einziger Block trugen ihn nicht — aufgeklappt sah man nicht, wie viele es
sind. Wortlaut: `12 Kommentare, davon 3 Berichte und 5 Aufgaben (2 Erledigt)`.
**„Davon", nicht Mittelpunkte:** die Zahlen dahinter sind Teilmengen, keine
Summanden, und die Klammer nistet die zweite Ebene ein — das Erledigte steckt
**in** den Aufgaben, sonst schrumpfte die Zahl beim Abhaken. „Kommentar"
bleibt eine **feste Beschriftung** und wird kein zwölftes Vokabelwort; die
**Notiz** bleibt ungenannt, weil sie der Zustand ohne Markierung ist; die
**Anpinnung** steht nicht in der Zeile, weil sie die zweite, unabhängige Achse
ist. Derselbe volle Satz auch **eingeklappt** — bewusste Abweichung von den
übrigen Blöcken, die dort eine sehr kurze Kurzfassung tragen.
**Abweichung, im Entwurf nicht bedacht:** dafür bekam der Kommentarblock einen
eigenen Hinweis (`#ccount`) statt die Kurzfassung `.bsumme` zu füllen — der
Satz trägt selbst schon eine Klammer, verschachtelt wäre er unlesbar, und der
Hinweis überlebt das Einklappen ohnehin von selbst.

**Die drei Funde aus dem Betrieb — alle drei erledigt in 0.8.3.**
~~Die **Aufgabenmarke** ist orange, obwohl `.cmt.aufgabe` daneben längst blau
ist.~~ Eine Zeile `.mark.aufg.on` in Blau; der Satz „Orange ist Art und
Bedienung" ist damit **klargestellt, nicht widerrufen**: die Art hat drei
Farben, und der Knopf trägt die Farbe der Kante, die er setzt.
~~Der **Kommentar** bietet ✎, ✕, „+ Bild" und die drei Marken an jedem
Kommentar an.~~ Der Server liefert `mine`; ✎ steht nur beim Verfasser, ✕ am
Kommentar, ✕ am Bild und die Marken bei Verfasser oder Admin. **Abweichung:**
„+ Bild" bekam **keine eigene Klemme** — es steht ausschließlich im
Bearbeitenmodus und fällt mit ✎ baulich weg; eine zweite Klemme daneben ließe
sich nicht gegenprüfen. Ausdrücklich bestätigt: **Anhängen ist Bearbeiten**,
das darf auch der Admin nicht; entfernen darf er sehr wohl.
~~Die **Tagwolke** klappt nur halb auf.~~ Zwei Wege, beide nötig und einzeln
gegengeprüft: `begrenzeWolke()` bricht bei Höhe 0 ab, und das Aufklappen
zeichnet die Wolke neu.


## Stufe G3 — erledigt in Version 0.8.5

**„Der Systembereich lernt die Rechte."** Gebaut wie entworfen, mit einer
Erweiterung: es waren **nicht neun Karten, sondern zwölf** — und nach dem Bau
sind es **dreizehn**.

**Die Karten hängen jetzt an der Rolle.** Vorher hing genau eine daran.

| Karte | steht |
|---|---|
| Titel, Kennzahlen, Kategorien, Tags, Bewertungskriterien, Zugänge, Suchanbieter, Vokabular | dem Admin |
| Export, Import | dem Eigentümer |
| **Zugang, Darstellung, Links** | **jedem, auch ohne Rolle** |

Die drei letzten sind **Selbstbezug**: der eigene Zugang, die eigene
Schriftgröße und Blockanordnung, die eigene Zahl sichtbarer Linkzeilen und
Anbieternamen. Sie gehen niemanden sonst etwas an und hängen an keiner Rolle.

**Kategorien, Tags und Kriterien bleiben für jeden stehen** — Zeilen sichtbar,
Griff, ✎ und ✕ weg. *Wer nicht verwalten darf, darf trotzdem nachsehen:* die
Namen sind die Auswahl, aus der jeder am Eintrag schöpft. Eine versteckte
Karte nähme ihm die Übersicht über etwas, das er benutzt.

**Die Karte „Links" ist in zwei geschnitten** — im Entwurf nicht bedacht. Sie
mischte als einzige Karte Persönliches mit Adminsachen. Der Schnitt folgt
genau der Trennung, die der Server seit 0.6.5 hält:

- **„Links"** (jeder): sichtbare Linkzeilen, Zahl der Anbieternamen. Beides
  persönlich.
- **„Suchanbieter"** (Admin): Vorrat, Startanbieter, die drei eigenen
  Anbieter. Alles global.

*Der Admin kuratiert, der Benutzer bestimmt die Dichte* — dieser Satz stand
schon in `server.js` und hat seit 0.8.5 seine Entsprechung auf dem Bildschirm.

**`GET /api/stats` steht hinter `nurAdmin`.** Das nimmt „Die Kennzahlen selbst
sieht weiterhin jeder" aus 0.7.2 zurück. Lesende Route, deshalb **kein**
Eintrag in `F_ROUTEN` — die Zahl bleibt bei 46. Der Schlüsselwert in derselben
Antwort bleibt eine **zweite, engere Klemme** am Eigentümer; die beiden decken
einander nicht zu, eine eigene Gegenprobe belegt das.

**Die konkreteste Falle der Stufe, und sie ist eingetreten.** `renderSystem()`
hängt sechs Abrufe in **ein** `Promise.all` und verlässt den Rumpf mit
`return`, sobald einer scheitert. Stünden die Kennzahlen hinter dem Admin und
würden trotzdem abgerufen, bliebe der Systembereich für einen gewöhnlichen
Benutzer **vollständig leer** — auch die drei Karten, die ihm zustehen. Der
Abruf ist deshalb bedingt; ein `catch` daneben wäre eine zweite Schicht und
verdeckte die erste in jeder Gegenprobe. Der Rückbau macht **19 Prüfungen**
rot.

**Dazu erledigt:** die veraltete `AUTH_RESET`-Zeile in der Karte „Zugang" (sie
nennt jetzt `zugang.js`), die Kachel „Zugänge" über die volle Breite und
dezente Trennlinien zwischen den Abschnitten der beiden Linkkarten.

**Was ausdrücklich nicht gebaut wurde:** „Ansicht für Vokabular und Titel gar
nicht". Das Vokabular **ist** jede Beschriftung, der interne Titel steht in der
Header — beide werden weiter ausgeliefert. Was verschwindet, sind die
**Karten**, nicht die Daten.

**Zwei Prüfungen umgedreht statt gelöscht** (Auflage aus Stolperstein 74):
„Die Kennzahlen selbst sieht weiterhin jeder" und „Tags und Kategorien bleiben
unangetastet bedienbar". **Zwei neue Stolpersteine:** 87 (eine Prüflage, die
nur die eine Hälfte einer Rollenleiter setzt) und 88 (wer eine Karte
versteckt, muss ihre Behandler mitverstecken).

## 0.8.6 — Berichtigungen aus dem Betrieb — erledigt in Version 0.8.6

**Keine Stufe des Umbaus, eine Runde Nacharbeit.** Fünf Punkte, alle beim
Ansehen von 0.8.5 aufgefallen. Kein Schema, kein Migrationscode.

**Was gilt.** Die Sternzeile zeigt den **eigenen Wert und den Schnitt**, mehr
nicht. Wer welchen Wert vergeben hat, sieht der **Admin in einer eigenen
Ansicht**, die er über den Knopf **„Wer hat bewertet"** im Blockkopf aufruft —
ein Dialog, kein Aufklapper an der Zeile. Der Knopf steht nur beim Admin und
erst **ab zwei Zugängen**: bei einem wäre die Ansicht der eigene Wert ein
zweites Mal. In der Ansicht trägt jede **fremde** Stimme ihr ✕; damit ist der
Löschweg aus 0.8.2 mitgewandert. `DELETE /api/ratings/:id` ist **unverändert**
geblieben, samt `darfAendern` und seiner Zeile in `F_ROUTEN`.
Geliefert wird die Liste ebenfalls nicht mehr an jeden: `detail()` hängt keine
`stimmen` mehr an die Kriterienzeilen, und der neue
**`GET /api/items/:id/stimmen`** trägt `nurAdmin` in der Routenzeile. Lesende
Route, also **kein** Eintrag in `F_ROUTEN` — das vierte Mal, dass dieses
Muster angewandt wird; die Zahl bleibt bei 46. `avg` und `count` bleiben
unangetastet: der Schnitt und die Zahl der Bewerter sind keine Aussage über
eine Person.

**Dazu erledigt.** `begrenzeLinks()` schneidet die Linkliste ab
(`overflowY: hidden`) statt ihr einen eigenen Bildlauf zu geben — auf dem
Finger scrollt damit immer die Seite, und der Weg zum Rest ist der Knopf „alle
N anzeigen". `grid-auto-flow: dense` am `.sys-grid` schließt die Lücke vor der
breiten Kachel „Zugänge", ohne die Reihenfolge im Quelltext anzufassen. Die
Zeile „Angelegt von" nennt jetzt auch **wann**. Und in der Kopfzeile steht
neben „Abmelden", **wer angemeldet ist** — auch bei einem einzigen Zugang.

**Abweichungen.**
- **Die Tagwolke war gar nicht betroffen.** `begrenzeWolke()` setzte seit jeher
  `overflow: hidden`, nie `auto`. Nichts geändert; die Prüflage steht jetzt
  trotzdem daneben, damit ein späterer Griff nach `auto` dort ebenso auffällt.
- **Die Kopfzeile wird nur in der Übersicht gezeichnet.** Der Entwurf begründete
  den Weg über `/api/settings` damit, dass die Kopfzeile auch beim
  Direkteinstieg auf einen Eintrag entsteht — das stimmt nicht, die
  Detailansicht hat nur „← Zurück". Die Entscheidung bleibt trotzdem: ein
  Abruf weniger, und die Angabe hängt an `start()` statt an `loadAll()`.
- **Der Aufrufknopf hängt an `ADMIN && mehrereBenutzer()`**, nicht nur an der
  Rolle — beide Hälften mit eigener Prüflage.
- **Im Dialog hängt das ✕ nur noch daran, ob die Stimme fremd ist.** Eine
  zweite Rollenfrage darin wäre eine zweite Wahrheit und ließe sich nicht
  gegenprüfen: den Dialog bekommt ohnehin nur der Admin.
- **Der Endpunkt liefert keinen Kriterienname.** Reihenfolge und Name stehen im
  geladenen Eintrag; zwei Quellen für denselben Namen wären zwei Wahrheiten.

**Verworfen:** eine anonyme Werteliste („3 · 4 · 2" ohne Namen). Der Admin
wüsste dann nicht, wessen Bewertung er entfernt, und für alle anderen wäre es
eine Zahlenreihe ohne Aussage.

**Drei Prüfungen umgedreht, vier serverseitige und sieben in der Oberfläche
umgehängt, keine gelöscht** (Auflage aus Stolperstein 74). **Drei neue
Stolpersteine:** 89 (zwei Dialoge übereinander teilen sich die Abbruchtaste),
90 (ein Mock, dessen Antwort sich ändern soll, muss sie wirklich
ändern) und 91 (eine Funktion, die selbst misst, ist im gebauten DOM nur an
einer gestellten Höhe prüfbar).

**Ausdrücklich nicht in dieser Runde, weil kein Bau nötig war:** dass „+ neue
Kategorie" am Eintrag nur dem Admin offensteht. **Der Schalter dafür steht seit
0.8.4 im Systembereich** — Häkchen bei „Kategorien" heraus, und die
Anlegezeile verschwindet für jeden außer dem Admin; das Auswahlfeld aus dem
Vorhandenen bleibt. Bei den **Tags** bleibt das Häkchen an. **Das ist eine
Einstellung, keine Version.**

## 0.8.10 — Werkzeug — erledigt in Version 0.8.10

**Kein Block, und das ist die Auskunft.** 0.8.10 hat den Mehrbenutzerbetrieb
an keiner Stelle berührt: keine Rolle, kein Recht, kein Endpunkt, kein Schema.
`F_ROUTEN` blieb bei 46. Gebaut wurden der wiederholbare Bau, `sharp` und Node
22, der Versions-Fingerprint und zwei Dinge am Prüfstand — was davon gilt, steht
im Projektstand, Abschnitte 2, 5, 7 und 9.

**Eines wirkt trotzdem hierher**, weil es jede kommende Stufe betrifft: der
**Fingerprint** löst die Textstelle je Version ab, mit der bisher nachgeprüft
wurde, ob wirklich der neue Dateisatz läuft (siehe „Nachprüfen per SSH"). Und
er wird **zuletzt** gebildet, nach der letzten Änderung an einer
ausgelieferten Datei — jede spätere Änderung macht die genannte Zeile falsch.

## 0.8.20 — „Die Schotten dicht" — erledigt in Version 0.8.20

**Kein Block, und das ist die Auskunft.** 0.8.20 hat den Mehrbenutzerbetrieb
an keiner Stelle berührt: keine Rolle, kein Recht, kein Endpunkt, kein Schema.
`F_ROUTEN` blieb bei 46. Was gebaut wurde und was davon gilt, steht im
Projektstand, Abschnitte 2, 5, 5a, 7 und 9.

**Zwei Dinge wirken trotzdem hierher**, weil sie jede kommende Stufe betreffen:

- **Der Sitzungscookie heißt nicht mehr fest `kriterion_session`.** Bei
  `HINTER_PROXY=1` heißt er `__Host-kriterion_session` und trägt `Secure`. Wer
  in Stufe H „Meine Sitzungen" baut, nimmt den Namen aus `auth.COOKIE_NAME`
  und schreibt ihn nirgends ab.
- **Der ausgelieferte Typ kommt nie aus der Datenbank**, und ein Wächter im
  Prüfstand hält das fest: keine Zeile in `server.js` setzt den Content-Type
  selbst. Er wird namentlich rot, sobald jemand eine Auslieferung ergänzt.
  **In 0.8.50 hat er gehalten:** der Videoweg liefert `inline` aus und geht
  trotzdem durch `setzeBildHeader()`; keine Zeile in `server.js` ist
  dazugekommen, die den Typ selbst setzt. Seitdem hat er eine Gegenprobe
  neben sich.

## Stufe G4 — erledigt in Version 0.8.30

**„Die Linkliste bekommt Verfasser."** Bis 0.8.20 gehörten Links dem
**Eintragsverfasser**: `POST /api/items/:id/links` stand hinter
`nurEintragVerfasser`, ebenso Sortieren und Löschen. Jetzt darf **jeder**
einen Link eintragen; löschen darf ihn der **Eintrager oder der Admin**, und
ab zwei Zugängen steht sein Name an der Zeile.

**Was gilt.** Die Rechte gehen in drei verschiedene Richtungen, und das ist
die Entscheidung dieser Stufe:

| Route | vorher | jetzt |
|---|---|---|
| `POST /api/items/:id/links` | `nurEintragVerfasser` | **offen**, schreibt `req.benutzer.id` |
| `DELETE /api/links/:id` | `eintragFrei(…, l.item_id)` | **`darfAendern(req, l.user_id)`** |
| `PUT /api/items/:id/link-order` | `nurEintragVerfasser` | **unverändert** |

`links` trägt `user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`,
nachgerüstet über `migration0830()` — den zweiten markierten Block im Projekt.
**Die Bestandszeilen fallen an den Eintragsverfasser**, nicht an den
Eigentümer: bis dahin *waren* die Links eines Eintrags die Sache seines
Verfassers. `ordneBestandZu()` nimmt `links` trotzdem auf und antwortet dort
weiterhin mit dem Eigentümer — das ist eine andere Frage zu einem anderen
Zeitpunkt, und beide stehen im Quelltext nebeneinander erklärt.

Export und Import nennen den Namen wie an den vier anderen Trägern; ein Link
ist in der Datei ein Objekt aus `url` und `author`, **Formatnummer 6 → 7**.
Der Import liest beide Formen. **Ein Link aus einer Datei der Formatnummer 6
fällt an den Verfasser des Eintrags** — dieselbe Antwort wie beim Migration: die
Datei sagt nichts anderes, als dass die Links zu diesem Eintrag gehören.

**Der Name steht an der fremden Zeile, nicht an jeder — Abweichung vom
Entwurf.** Der Entwurf sagte „ab zwei Zugängen steht sein Name an der Zeile".
Gebaut ist es enger: **mehrere Zugänge und eine Zeile, die nicht vom Verfasser
des Eintrags stammt.** Bei den vier anderen Trägern steht jede Zeile für sich;
die Linkliste ist eine Liste vieler kurzer Zeilen, und ein Name an jeder wäre
Rauschen. An der einen fremden ist er die Auskunft — „jemand anderes hat etwas
beigesteuert". Daraus folgt ein Satz, den man kennen muss: **„kein Name" heißt
bei mehreren Zugängen „vom Verfasser des Eintrags".**

**Der Platz in der Zeile war der offene Punkt, und er hat eine Antwort
gebraucht.** Die Zeile trägt Griff, Nummer, Domain, Pfad, bis zu vier
Anbieternamen, Pfeil oder Lupe und das ✕. Der Name steht jetzt in der
**zweiten** Zeile, **direkt hinter** Pfad bzw. Anbieternamen — nicht darunter,
sonst wüchse die Zeile auf dem Handy auf drei Höhen. Beide sind ein Flex-Paar:
der Pfad nimmt sich nur, was er braucht, und darf schrumpfen, **der Name
nicht**. Ohne das fräße eine lange Adresse genau die Angabe weg, um
derentwillen die Zeile ihn trägt.

**Der Name steht in Klammern — `(chefin)` —, an beiden Zeilenarten gleich, und
ohne Trennzeichen davor.** *Berichtigt aus dem Betrieb, siehe unten.* Ein
Trennzeichen wäre an beiden falsch: in der Suchzeile bedeutet „ · " bereits
„noch ein Anbieter, anklickbar", und ein Strich davor sieht aus wie ein
abgerissener Satz. Die Klammer sagt von selbst, dass hier eine **Angabe über**
die Zeile steht und kein weiterer Teil von ihr. Sie trägt außerdem jede Form,
die `verfasserName()` liefert: `(chefin)`, `(Gelöschter Benutzer 4)`,
`(Ohne Verfasser)`. **Ein Vorwort wie „von" täte das nicht** — „von Ohne
Verfasser" ist kein Deutsch.

> **Aus dem Betrieb berichtigt, noch vor dem Einspielen.** Gebaut war zuerst
> ein Mittelpunkt an der Adresszeile und ein Gedankenstrich an der Suchzeile,
> und der Pfad nahm sich die volle Breite (`flex: 1 1 auto`). Am Bildschirm
> ergab das zweierlei Schaden: der Name stand ganz am **rechten Rand**, wo er
> zu nichts mehr gehörte, und der Strich davor las sich wie ein Bruch. Beides
> ist der Fall, den Abschnitt 7 des Projektstands meint — *was der Prüfstand
> nicht kann, ist Aussehen.* Die Prüfungen waren grün und das Ergebnis
> trotzdem unbrauchbar; es ist das dritte Mal (nach der leeren PDF-Vorschau
> und dem unsichtbaren Löschkreuz, Stolpersteine 29 und 30).

**Das Datum steht im Überfahrtext**, nicht in der Zeile. Auf einem
Berührbildschirm ist es damit nicht erreichbar; bewusst getragen, der Name
bleibt in beiden Fällen sichtbar.

**Das ✕ folgt dem Recht, nicht der Anzeige.** Beides ist getrennt: ein Kreuz
ohne Namen ist möglich, ein Name ohne Kreuz auch.

**Kein Vermerk beim Löschen** — wie entworfen. Ein gelöschter Link ist eine
ganze Aussage, die geht, kein Loch in einer bleibenden; der Eingriffsvermerk
bleibt auf den einen Fall begrenzt, für den er beschlossen wurde.

**Was daran hing und leicht übersehen worden wäre:** beide Löschdialoge
zählten Beiträge auf und wären nach der Rechtewende nachweislich unvollständig
gewesen. `GET /api/items/:id/bestand` nennt Links jetzt getrennt nach eigen
und fremd; `auth.zaehleBestand()` kannte sie überhaupt nicht — ein Zugang mit
zwanzig Links in fremden Einträgen sah dort leer aus. Und `entferneZugang()`
räumt sie beim zweiten Häkchen wirklich mit weg: eine Zahl im Dialog, die
nichts bewirkt, wäre schlimmer als keine.

**Nachgeholt in 0.8.31: dieselbe Wende an den Dateien.** Der Entwurf sprach
nur von Links, aber die Begründung — *was nur dort erscheint, wo man es
hinsetzt, gehört jedem* — trifft eine Datei genauso. `attachments` bekommt
`user_id` samt `migration0831()`, hochladen wird offen,
`DELETE /api/attachments/:id` fragt nach der Datei, der Name steht nach
derselben Regel an der Zeile (dort hinter der Größe, weil die Zeile einzeilig
ist), **Formatnummer 7 → 8**. Der Wächter fiel dort **vor multer** weg — er
hatte den zusätzlichen Zweck, die Datei eines Fremden gar nicht erst
einzulesen, und diese Begründung ist mit der Rechtewende gegenstandslos.
*Keine eigene Stufe: die Regel war entschieden, nur nicht gebaut.*

**`F_ROUTEN` blieb bei 46 Routen, und nur EINE Art hat gewechselt** — der
Auftrag nahm zwei an. Die Art `'im Rumpf'` sagt nur, *dass* eine Klemme
dasteht, nicht *welche*; die Wende von `eintragFrei` auf `darfAendern` wäre
für die Liste unsichtbar gewesen. Zwei eigene Quelltextprüfungen halten sie
jetzt fest. Einzelheiten und die vollständige Gegenprobentabelle stehen in
`Doku/Aenderungsprotokoll_0.8.30.md`.

## Nachprüfen per SSH

Der zeitlose Kern; die stufenbezogenen Abfragen werden je Version im Gespräch
mitgeliefert und stehen nicht mehr hier. Drei Ebenen, in dieser Reihenfolge:

**1. Protokoll.** `docker compose logs --tail=50 kriterion`. Der Start meldet
den Eigentümer und `.env`-Reste; fehlt nach einem Einspielen die erwartete
Änderung, wurde der Container nicht neu gebaut (`--build` vergessen).

**1a. Der Fingerprint** (seit 0.8.10) — die Antwort auf „läuft wirklich der neue
Dateisatz". Die Versionsnummer aus `/api/config` sagt nichts über die übrigen
Dateien; der Fingerprint deckt alles ab, was der Server lädt und ausliefert. Er
steht hinter der Anmeldung, die deshalb in den Befehl gehört:

```bash
curl -s -c cookies.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"NAME","password":"..."}'
curl -s -b cookies.txt localhost:3100/api/stats | head -c 60
```

Erwartet für 0.8.31: `{"version":"0.8.31","fingerprint":"1a801477",…`. Der Fingerprint
jeder Version steht im Kopf des Projektstands und in ihrem
Änderungsprotokoll. **Was er nicht abdeckt:** `zugang.js` — es liegt im
Image, läuft aber nie im Server.

**2. Datenbank von innen.** Sie ist verschlüsselt, `sqlite3` von außen
scheitert — die passende Bibliothek liegt im Container:

```bash
docker compose exec kriterion node -e "
  const db=require('./db').db;
  for (const t of ['items','comments','test_days','ratings','links','attachments'])
    console.log(t, '->', db.prepare('SELECT COUNT(*) n FROM '+t+' WHERE user_id IS NULL').get().n);
"
```

**Sechs Träger, sechsmal `0` — das ist die zeitlose Form dieser Abfrage.** Sie
war bis 0.8.20 auf `ratings` geschrieben; seit 0.8.30 gehört `links` dazu und
seit 0.8.31 `attachments`. Die Schleife hat sich damit schon einmal
ausgezahlt. Wer
zusätzlich wissen will, ob eine Spalte überhaupt angekommen ist:
`db.prepare('PRAGMA table_info(links)').all().map(c=>c.name)`.

Der Augenschein ist hier nicht die Bestätigung, sondern die Abfrage: eine
Datenbank, der beim Umbau etwas verlorengegangen ist, sieht in der Oberfläche
vollständig aus.

**3. Schnittstelle von außen** — der einzige Weg, der Rechte wirklich belegt.
Zwei Sitzungen nebeneinander:

```bash
curl -s -c a.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"faruk","password":"..."}'
curl -s -c b.txt -X POST localhost:3100/api/login \
  -H 'Content-Type: application/json' -d '{"user":"gast","password":"..."}'
curl -s -b b.txt -X DELETE localhost:3100/api/items/1     # muss 403 sein
```

„Darf nicht" muss einzeln belegt werden, mit einem echten zweiten Cookie. Der
Prüfstand hat dasselbe Muster eingebaut (drei Sitzungen nebeneinander, dazu
ein Admin **ohne** Eigentümerrolle); von Hand gegenzuprüfen bleibt es
trotzdem — es ist die Stelle, an der ein Fehler still bleibt und trotzdem
alles öffnet.

---

# Teil IV — Nachträge zu Abschnitt 5

Diese Punkte gehören nach Abschluss in „Entscheidungen, die nicht rückgängig
gemacht werden sollen" des Projektstands; die durchgestrichenen früherer
Stände sind übernommen und hier entfernt. Es bleiben — berichtigt auf den
Stand 0.8.0 —:

- **Kein Admin ändert fremde Bewertungen oder Kommentartexte** — löschen ja,
  umschreiben nein. **Und er hängt auch nichts an** (0.8.3): Anhängen ist
  Bearbeiten; wer etwas beizutragen hat, schreibt einen eigenen Kommentar.
  Entfernen darf er, und genau dafür gibt es den Eingriffsvermerk.
- **Was an allen Einträgen aller Benutzer erscheint, gehört dem Admin.** Was
  nur dort erscheint, wo man es hinsetzt, gehört jedem. Daraus folgen:
  Kriterien beim Admin (erledigt 0.7.0), Tags und Kategorien bei allen
  (Schalter seit 0.8.4). **Links haben in Stufe G4 die Seite gewechselt**
  (erledigt 0.8.30) und **Dateien in 0.8.31**: sie erscheinen nur dort, wo man
  sie hinsetzt, und gehören damit jedem. *Das Umsortieren der Links ist nicht
  mitgewandert — es ändert keine Aussage und ist umkehrbar.*
  **Fotos sind ausdrücklich nicht gewandert:** das erste Foto ist das Hauptbild
  und damit das Gesicht des Eintrags, keine Beigabe.
- **E-Mail ist Bequemlichkeit, nie Voraussetzung.** Jeder verschickte Link
  ist im Verwaltungsbereich zum Kopieren sichtbar.
- **Die Antwort auf eine Registrierung verrät nichts über den Bestand.**
- **Die öffentliche Adresse ist eine Einstellung, niemals der `Host`-Kopf.**
- **Der ersetzende Import rührt `users`, `sessions` und `tokens` nicht an.**
- **Der letzte aktive Eigentümer darf nicht verschwinden** — serverseitig
  durchgesetzt. *(Bis 0.8.0 stand hier „der letzte Admin"; die Rolle darüber
  hat die Regel geerbt.)*
- **Der Eigentümer ist ein vergebbarer Rollenwert** (`eigentuemer`), keine
  Ableitung aus der kleinsten `id`. *(Der ursprüngliche Punkt behauptete das
  Gegenteil und ist in 0.8.0 umgestoßen worden — als Leiter `user` < `admin`
  < `eigentuemer`, damit „ein Eigentümer ist immer auch Admin" baulich wahr
  ist.)*
- **Eine Rücksetzung entwertet einen Zugang, sie löscht ihn nicht** — und sie
  schreibt keine Verfasser um. Seit 0.8.0 heißt der Weg `zugang.js` auf dem
  Wirt; `AUTH_RESET` wird abgelehnt.
- **Ein Eintrag, der gelöscht wird, nimmt fremde Beiträge mit** — deshalb
  nennt der Dialog sie getrennt nach eigen und fremd, bevor er es tut.
  *Erledigt in 0.8.2; „fremd" meint die Sicht des Löschenden.*
- **Was nicht angezeigt werden darf, wird nicht geliefert** (seit 0.8.2). Ein
  freigegebener Grabsteinname verlässt den Server nicht, auch wenn die
  Oberfläche ihn ohnehin ignorieren würde. **Zum zweiten Mal angewandt in
  0.8.6:** `detail()` hängt keine Stimmen mehr an die Kriterienzeilen — sonst
  hinge die Regel daran, dass die Oberfläche mitspielt.
- **Die Übersicht sortiert nach `updated_at`, und das gilt für alle.**
  Schreibt jemand einen Kommentar, rückt der Eintrag auf jedem Bildschirm
  nach oben. Das ist gewollt: die Liste zeigt, wo etwas geschieht, nicht wo
  *ich* zuletzt war. Eine persönliche Reihenfolge wäre eine zweite Wahrheit
  über denselben Bestand.
- **`katalog.sqlite` behält seinen Namen.** Der Dateiname der Datenbank ist
  kein Projektname und wandert bei keiner Umbenennung mit.
- **Vorrat und Standard der Suchanbieter gehören dem Admin, die Zahl der
  angezeigten Namen dem Benutzer.** Das Ziel des Zeilenklicks ist für alle
  gleich.
- **Der Standard steht immer vorn** — und sieht aus wie alle anderen. Die
  Zeile muss weiterhin sagen, wohin der Klick geht.
- **Höchstens vier Anbieternamen unter einer Suchzeile**, Name höchstens 20
  Zeichen. Eine Handy-Entscheidung: die Zeile selbst ist das Hauptziel,
  kleine Ziele daneben sind ab vier zu dicht.
- **Der Name an einer Zeile steht nur, wo er eine Auskunft ist** (seit 0.8.30
  am Link, seit 0.8.31 an der Datei): mehrere Zugänge **und** eine Zeile, die
  nicht vom Verfasser des Eintrags stammt. Daraus folgt, dass „kein Name" bei mehreren Zugängen
  „vom Verfasser des Eintrags" heißt. **Und der Name wird nie abgeschnitten** —
  abgeschnitten wird der Pfad daneben.
- **Ein Bedienzeichen folgt dem Recht, nicht der Anzeige** (seit 0.8.30, am ✕
  der Linkzeile). Ein Kreuz ohne Namen ist möglich, ein Name ohne Kreuz auch.

# Teil V — Zu erwartende Stolpersteine

Vorgemerkt, damit sie beim Bauen nicht überraschen; Nummern werden vergeben,
wenn sie eintreten. Eingetretene stehen seit der Bereinigung nur noch mit
ihrem Merksatz; **die offenen Auflagen stehen vollständig.**

1. *Eingetreten und erledigt in 0.6.0.* **Merksatz: eine Annahme über den
   Bestand veraltet in dem Moment, in dem eine Version eingespielt wird.**
   Vor jeder Datenüberführung gehört die Frage dazu, was auf dem Server
   tatsächlich läuft — nicht, was beim Schreiben des Entwurfs lief.
2. *Eingetreten und erledigt in 0.7.0 — an anderer Stelle als vorhergesagt.*
   **Merksatz: eine vorhergesagte Falle ist eine Aussage über den Effekt,
   nicht über den Ort** (Stolperstein 67).
3. **Rechteprüfungen, die grün sind, ohne zu prüfen.** Eine Prüfung, die nur
   den Erfolgsfall durchspielt, belegt kein Verbot. Jede Verweigerung braucht
   ihre eigene Gegenprobe mit zweiter Sitzung.
4. *(Betriebsvorgang der Umbenennung 0.5.10 — erledigt, ohne Fortwirkung.)*
5. *(Ebenso.)*
6. *Eingetreten und erledigt in 0.5.11.* **Merksatz: Maskierung nicht
   vergessbar machen, sondern baulich unmöglich** (`textContent` statt
   `innerHTML`).
7. *Erledigt in 0.5.11.* **Merksatz: eine Ableitung beim Lesen statt einer
   Rückschreibung — und die Gegenprobe muss den stillen Rückfall rot machen.**
8. *In 0.7.2 vermieden statt eingetreten:* die Rechteschicht bekam **einen**
   Ort je Frage, und der Quelltext-Wächter zählt nach. **Was doch zweimal
   stand, war anderswo — Merksatz: eine Gegenprobe, die eine Reihenfolge
   belegen soll, darf die Regel nicht wegnehmen, sonst belegt sie nur, dass
   es die Regel überhaupt gibt** (Stolperstein 72).
9. *Eingetreten und erledigt in 0.6.0* („gibt es keinen Admin, wird es der
   Eigentümer"; seit 0.8.0 ersetzt durch die Eigentümer-Startregel).
10. *Viermal eingetreten (0.6.0 bis 0.6.3).* **Merksatz: es genügt nicht zu
    fragen, ob eine Regel beim Start läuft — man muss abzählen, auf wie
    vielen Wegen der Auslöser entstehen kann.** Das trägt bis heute die zwei
    Aufrufstellen von `ordneBestandZu()`.
11. *Eingetreten und erledigt in 0.6.5.* **Merksatz: ein Schlüssel kann nicht
    nur beim Lesen zwischen die Stühle fallen, sondern auch beim
    Zurückschreiben** — dagegen steht die Schranke in `putSetting`.
12. *Eingetreten und erledigt in 0.6.2.* **Merksatz: ein `DROP TABLE` ist bei
    eingeschalteten Fremdschlüsseln ein `DELETE`, und `PRAGMA foreign_keys`
    ist in einer Transaktion ein stiller No-op.**
13. *Entschärft in 0.7.2* (alle drei „der erste Benutzer"-Stellen lesen
    `req.benutzer`). **Merksatz: „hat keinen Vorgabewert" ist keine
    Zusicherung, dass ein Fehler auffällt — das ist eine Aussage über die
    Bibliothek und gehört nachgestellt** (Stolperstein 59).
14. **Ein `UNIQUE` mit einer Spalte, die leer sein darf, ist löchrig — und
    die Überführung, die sie füllt, kann daran scheitern.** `NULL` gilt im
    UNIQUE als von allem verschieden; gelöst mit `UPDATE OR IGNORE`
    (Stolperstein 57). **Betrifft jede weitere Spalte, die in einem UNIQUE
    steht und nachgetragen wird, und ist bei jedem Löschweg mitzudenken, den
    die Verwaltung bekommt.**
15. **Ein Zeitstempel mit Sekundenauflösung belegt keine Änderung innerhalb
    derselben Sekunde** (Stolperstein 60). **Betrifft jede folgende Stufe, in
    der `updated_at` eine Rolle spielt.** Richtig ist, den Ausgangswert von
    Hand auf ein festes, altes Datum zu setzen statt ihn von der Uhr zu
    nehmen.
16. *Eingehalten in 0.6.5.* **Merksatz: eine persönliche Einstellung ist eine
    Aussage über niemanden außer sich selbst — zweite Spalte am Schlüssel,
    keine Tabelle je Schlüssel.**
17. **Ein Bedienelement ist erst geprüft, wenn ein Ereignis wirklich
    zugestellt wurde** (Stolperstein 61). `.click()` oder der von Hand
    gerufene Behandler genügen nicht. **Für jede folgende Stufe mit neuen
    Bedienelementen — G2 bringt welche mit — gehört mindestens ein
    `dispatchEvent` samt anschließendem Durchlauf des Event Loops
    dazu.** Nicht „neues Bedienelement" ist der Anlass, sondern „geänderter
    Weg hinter einem Bedienelement". Dazu die zweite Hälfte: **wo ein
    Mock im Prüfstand die Antwort vereinfacht, verschwindet genau die
    Prüfung, für die man ihn gebaut hat** — der falsche Server muss antworten
    wie der echte. *In 0.8.2 und 0.8.3 beide Male eingehalten:* der
    Mock liefert `verfasser`, `mine` und `bilderEntfernt` an allen
    sechs Kommentaren, zwei davon mit **verschiedenen** Vermerkzahlen. Und: **ein Merkmal kann vollständig geprüft sein und
    trotzdem an der falschen Stelle wirken** (Stolperstein 65) — zu einem
    Merkmal in Sortierung oder Filter gehört eine Prüfung mit zwei
    Sortierungen und einem Eintrag mit leerem Sortierwert.
18. **`INSERT OR REPLACE` ist ein `DELETE` mit Nachspiel** (Stolperstein 70):
    SQLite löscht die Zeile, die das `UNIQUE` verletzt, und über
    `ON DELETE CASCADE` gehen deren Kinder mit — lautlos. **Betrifft jede
    folgende Stufe, in der eine Tabelle mit Kindern über `OR REPLACE`
    beschrieben wird.** Die Frage lautet dort nicht „welcher Wert gewinnt",
    sondern „was hängt an der Zeile, die verschwindet".
    *In 0.8.2 geprüft und nicht zutreffend:* die beiden neuen Löschwege sind
    schlichte `DELETE`; an einer `ratings`-Zeile hängen keine Kinder, und die
    einzige Kaskade im Umfeld ist die am Eintrag — genau die, die der Dialog
    ankündigt.
    *In 0.8.3 erneut geprüft und wieder nicht zutreffend:* an `comments`
    schreibt nichts mit `OR REPLACE` oder `ON CONFLICT` (auch der Import nicht,
    dort steht ein blankes `INSERT`), und der Zähler des Eingriffsvermerks ist
    ein `UPDATE` auf eine bestehende Zeile.
    *In 0.8.30 zum dritten Mal geprüft und wieder nicht zutreffend:* an `links`
    hängen keine Kinder, und der Import schreibt sie mit blankem `INSERT`.
    *In 0.8.40 zum vierten Mal geprüft und wieder nicht zutreffend:* an
    `rating_criteria` hängen zwar Bewertungen, die Migration legt aber keine
    Zeile an und entfernt keine.
    *In 0.8.50 zum fünften Mal geprüft und wieder nicht zutreffend:* an
    `photos` hängen keine Kinder, die Migration rüstet nur zwei Spalten nach, und
    der Import schreibt Fotozeilen mit blankem `INSERT`.
    **Die Auflage bleibt stehen** — als Nächstes für 0.8.70, wo der Papierkorb
    einen ganzen Eintrag samt seiner Kinder serialisiert.
19. *Eingetreten und erledigt in 0.7.2.* **Merksatz: der Import kann unter
    fremdem Namen schreiben — deshalb gehört er (samt Export) hinter den
    Eigentümer.**
20. **Eine neue Spalte braucht die DDL *und* einen Migrationsblock**
    (0.8.3 eingetreten, **0.8.30 zum zweiten Mal**). `CREATE TABLE IF NOT
    EXISTS` rüstet nichts nach (Stolperstein 13), und seit der Bereinigung
    0.8.1 gibt es keinen anderen Weg.
    *Aus 0.8.30 kommen zwei Auflagen dazu, und beide gelten für jede folgende
    Datenbankstufe:* **erstens** ist die Frage, **wem** die Bestandszeilen
    zufallen, eine eigene Entscheidung und nicht dieselbe wie die des
    Auffangnetzes — hier fielen sie an den Eintragsverfasser, dort fallen sie
    an den Eigentümer, und wer das nicht nebeneinander erklärt, hinterlässt
    einen scheinbaren Widerspruch. **Zweitens** lässt sich eine
    Fremdschlüsselspalte nur **nullbar** nachrüsten: SQLite lehnt jede andere
    Vorgabe ab (Projektstand, Stolperstein 105). Wer eine `NOT NULL`-Spalte mit
    `REFERENCES` braucht, braucht einen Tabellenneubau.
    *In 0.8.31 zum zweiten Mal angewandt, und beide Auflagen haben getragen.*
    **Dazu eine dritte, die dort dazukam:** liegen mehrere Migrationsblöcke
    vor, gehört ein Prüflauf dazu, der sie **hintereinander in einem Start**
    fährt — das ist die Lage, die im Betrieb wirklich vorkommt, und keiner der
    einzelnen Abschnitte deckt sie ab.
21. **Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
    scheitern** (Stolperstein 81). Erst das Vorhandensein prüfen, dann die
    Eigenschaft. **Und ein Rückbau, der den Lauf abbricht, nennt keinen Namen**
    (Stolperstein 82, Anwendung von 76) — dann gehört eine engere zweite
    Gegenprobe daneben. Beide gelten für jede folgende Stufe.
