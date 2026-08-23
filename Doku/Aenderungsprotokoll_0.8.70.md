# Änderungsprotokoll 0.8.70 — „Sicherung und Papierkorb"

**Rohstoff für die Dokumentenpflege.**

**0.8.70 — Fingerprint `1aa9266a`**

Die nächste Runde des Stufenplans, und **keine Stufe des
Mehrbenutzerbetriebs** — der ist mit G4 bis auf H und I gebaut. Sie ist
ausdrücklich **wieder eine Datenbankstufe**: das Schema bekommt zwei neue
Tabellen, und die **Sicherung des Datenverzeichnisses steht wieder als PFLICHT
im Einspielweg**. Das war in 0.8.60 anders und gehört ausdrücklich gesagt.

**Was sich ändert, in einem Satz.** Zwei Wege zurück, die es bisher nicht gab:
ein **gelöschter Eintrag** ist dreißig Tage lang wiederherstellbar, und eine
**Sicherung der ganzen Anlage** entsteht auf Knopfdruck statt von Hand auf dem
Wirt.

**Die tragende Regel der Runde: der Papierkorb fasst keine einzige bestehende
Abfrage an.** Kein `geloescht`-Zustand an `items`, kein `WHERE`-Zusatz
irgendwo. Ein gelöschter Eintrag ist **wirklich weg** — er liegt nur zusätzlich
noch als Paket daneben.

**Zahlen dieser Runde.** `F_ROUTEN` **47 → 51**. Formatnummer der Exportdatei
**bleibt 10**. Markierte Migrationsblöcke **bleiben fünf** — es kommt **kein**
Eintrag unter „Vorgemerkt für 1.0" dazu. Karten im Systembereich **13 → 15**.
Vokabeleinträge **bleiben elf**. Neue Abhängigkeiten: **keine**.

---

## 1. Was gebaut wurde, je Datei

Zwei Commits, dazwischen der **Haltepunkt** nach den Punkten 1 und 3.

### `db.js` (+58/−0 Zeilen)

- **Zwei neue Tabellen in der vollständigen DDL:** `papierkorb` (`id`,
  `geloescht_am`, `geloescht_von`, `titel`, `inhalt`) samt
  `idx_papierkorb_am`, und `papierkorb_bytes`
  (`id`, `papierkorb_id`, `nr`, `daten`) mit `UNIQUE(papierkorb_id, nr)` und
  `ON DELETE CASCADE`.
- **Kein Migrationsblock.** Nachgestellt statt geglaubt (Abschnitt 3 A):
  anders als eine **Spalte** legt `CREATE TABLE IF NOT EXISTS` eine fehlende
  **Tabelle** bei jedem Start an. Es bleibt bei `migration083()`,
  `migration0830()`, `migration0831()`, `migration0840()` und
  `migration0850()`.
- **`ordneBestandZu()` bleibt unverändert** und kennt weiterhin genau sechs
  Tabellen. Die Begründung steht als Kommentar an der Spalte `geloescht_von`.

### `server.js` (+1021/−457 Zeilen)

- **Das Austauschformat ist aus den beiden Routen herausgezogen.** Neu als
  benannte Stücke: `AUSTAUSCH_FORMAT` (die Formatnummer, genau eine Stelle),
  `AUSTAUSCH_MAX`, `TRICHTER_DATEI` und `trichterAblage()`, `bytesAus()`,
  `verfasserNamen()`, `paketLage()`, **`eintragAlsPaket()`**,
  `exportUmschlag()`, `exportName()` und `austauschBytes()`. In der
  Gegenrichtung **`spieleEin()`** — der ganze Rumpf des Imports, samt
  `verfasser()`.
- **Der Trichter ist der Kern der Runde.** Die Exportdatei bekommt ihre Bytes
  als Base64 im Feld `<name>_base64`, der Papierkorb als **Nummer** im Feld
  `<name>_ref`; die Bytes liegen daneben in `papierkorb_bytes`. Damit entsteht
  an keiner Stelle ein großer String.
- **Neu: `GET /api/items/:id/export`** — lesend, hinter `nurEigentuemer`, alles
  mit (Fotos, Videos, Dateien, Kommentarbilder). Eine Absage mit **413**, wenn
  die Datei die Stringgrenze sprengen würde.
- **`GET /api/export`** baut die Datei jetzt aus `eintragAlsPaket()` und
  `exportUmschlag()`; die Schalter und ihre Vorgaben sind unverändert.
- **`POST /api/import`** ist auf zwölf Zeilen geschrumpft: Datei prüfen,
  `spieleEin()` rufen, antworten.
- **Die Sicherung schreibt unter einem Arbeitsnamen** (`…sqlite.wird`) und
  benennt erst danach um — die schärfere Form von Stolperstein 8
  (Abschnitt 3 L).
- **Der Papierkorb:** `PAPIERKORB_TAGE = 30`, `raeumePapierkorbAuf()` (zwei
  Aufrufstellen: Start und `GET /api/papierkorb`), `inDenPapierkorb()` —
  serialisieren, ablegen, löschen, **alles in einer `db.transaction()`**.
  Dazu `GET /api/papierkorb` (`nurAdmin`, lesend),
  `POST /api/papierkorb/:id/wiederherstellen` und
  `DELETE /api/papierkorb/:id` (beide `nurEigentuemer`).
- **`DELETE /api/items/:id`** ruft `inDenPapierkorb()` statt eines nackten
  `DELETE`. Der Wächter davor ist unverändert `nurEintragVerfasser`.
- **`GET /api/stats`** bekommt `papierkorbCount` und `papierkorbBytes`; die
  alten Felder bedeuten unverändert dasselbe.
- **`GET /api/settings`** bekommt `papierkorbTage` — der Löschdialog steht
  jedem, die Karte nur dem Admin.
- **Die Sicherung:** `SICHERUNG_DIR` aus der Umgebung (ohne Vorgabewert),
  `SICHERUNG_MS_JE_MB`, `ORT_MUSTER`, `liegtIn()`, `sicherungLage()`,
  `pruefeOrt()`, `letzteSicherung()`. Dazu `GET /api/sicherung`
  (lesend, `nurEigentuemer`), `PUT /api/sicherung/ort` und
  `POST /api/sicherung`. Der Start schreibt den Ort ins Protokoll.

### `public/app.js` (+219/−9 Zeilen)

- **Zwei neue Karten im Systembereich:** „Sicherung" (Eigentümer) und
  „Papierkorb" (Admin sieht, Eigentümer handelt). Beide holen ihren Stand im
  bestehenden `Promise.all` von `renderSystem()` — es sind jetzt **acht**
  Abrufe, jeder hinter der Rolle, hinter der auch seine Karte steht.
- **`drawPapierkorb()` / `papierkorbNeu()`** und **`drawSicherung()`**.
- **Der Löschdialog am Eintrag** behält seine Zahlen und bekommt einen neuen
  Schlusssatz (Abschnitt 2 F).
- **Die Kennzahlenkarte** bekommt eine Zeile „Papierkorb", über der
  Datenbankgröße.
- **Die Exportkarte** bekommt den Satz zur Rollenteilung.
- **`PAPIERKORB_TAGE`** kommt aus `/api/settings`; die 30 im Quelltext ist der
  Rückfall für eine Antwort ohne das Feld, kein zweiter Wert.
- **Ein Text geändert:** „nicht ins selbe Backup legen" →
  „nicht in dieselbe Sicherung legen" (Abschnitt 2 J).

### `public/style.css` (+12/−0 Zeilen)

- `.mrow.pk` und `.mrow.pk .pk-meta`: die Papierkorbzeile bricht um, und ihre
  beiden Knöpfe stehen **dauerhaft** da statt erst beim Überfahren — ein
  Rückweg, den man erst suchen muss, ist keiner.

### `keys.js` (+1/−1 Zeile)

- Ein Text: „ins selbe Backup" → „in dieselbe Sicherung". Der Auftrag
  hatte `keys.js` als unberührt erwartet; die Begründung steht in
  Abschnitt 3 J.

### `docker-compose.yml`, `.env.example`

- **Ein zweites Volume** (`../kriterion-sicherung:/sicherung`) und
  **`SICHERUNG_DIR=/sicherung`**. Beide Hälften stehen in **derselben** Datei:
  ein Pfad ohne Einhängung schriebe in eine Schicht, die beim nächsten
  `--build` verschwindet.
- `.env.example` sagt, dass der Sicherungsort ausdrücklich **nicht** dort
  steht.

### `pruefung.js` (+1688/−15 Zeilen)

Sechs neue Gruppen, dazu Ergänzungen an vier vorhandenen. Einzelheiten in
Abschnitt 6.

---

## 2. Die Fragen aus dem Auftrag, beantwortet

### A. Braucht eine neue Tabelle einen Migrationsblock? **Nein.**

Nachgestellt, nicht geglaubt: eine Anlage wird angelegt, `papierkorb` und
`papierkorb_bytes` werden von Hand entfernt (`DROP TABLE`), der Server startet
einmal — beide sind wieder da, samt Spalten und Index. Die **Gegenlage** steht
daneben: eine von Hand entfernte **Spalte** (`items.description`) kommt
**nicht** von selbst zurück. Damit gilt Stolperstein 13 unverändert, aber er
gilt der Spalte und nicht der Tabelle.

**Folge:** kein sechster Migrationsblock, **kein sechster Migrationsabschnitt
im Prüfstand**, kein neuer Eintrag unter „Vorgemerkt für 1.0", und die Probe
„Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start" wird **nicht**
erweitert. Stattdessen steht die Probe selbst als eigene Gruppe im Prüfstand.

### B. Wie groß darf eine Papierkorbzeile werden? **Die Bytes gehen an der JSON vorbei.**

Von den drei Wegen des Auftrags ist es der zweite. Gemessen, nicht geschätzt:
`MAX_STRING_LENGTH` ist **536.870.888** (512,0 MB); zwanzig Videos zu je 20 MB
sind als Base64 **533 MB**, und `JSON.stringify` antwortet darauf mit
`RangeError: Invalid string length`. **Zippen hilft nicht** — der String
entsteht davor.

Gebaut ist deshalb: `papierkorb.inhalt` ist ein **vollständiger Exportumschlag
mit einem Eintrag**, nur trägt jedes Byte-Blatt statt `data_base64` ein
`data_ref: n`. Die Bytes liegen in `papierkorb_bytes`, eine Zeile je Blob. An
der Prüflage nachgemessen: sechs Blobs, und die Videobytes stehen nachweislich
**nicht** in der JSON.

**Der Preis, und er gehört gesagt:**

1. Eine Papierkorbzeile ist **keine** Exportdatei, die der Import unverändert
   schluckt — der Deserialisierer lernt eine zweite Blattform.
2. Zwei Tabellen statt einer.
3. **Kein `zlib`**, entgegen dem Entwurf im Ideenpapier: JPEG, MP4 und WebM
   sind komprimiert, die verbleibende JSON ist Kilobytes.

**Vorgabe für Teil II des Videopapiers (1.1.0):** Dateien bis 2 GB passen
**nicht** in eine Zelle — SQLite trägt rund 950 MB. Die Spalte `nr` ist dafür
schon da: eine große Datei teilt sich dann auf mehrere Zeilen auf.

### C. Wer darf wiederherstellen? **Sehen der Admin, handeln der Eigentümer.**

Wiederherstellen legt Zeilen unter **fremdem** Namen an — Kommentare,
Bewertungen und Testtage anderer sind über die Kaskade mit hineingewandert. Das
ist näher am **Import** als am Löschen, und der steht hinter `nurEigentuemer`.

**Ob „sehen" harmlos ist, war die schärfere Frage, und sie hat eine prüfbare
Antwort:** „Alles sehen darf jeder" gilt in dieser Anlage für den Bildschirm —
jeder angemeldete Zugang sieht **jeden** Titel in der Übersicht. Der Papierkorb
zeigt einem Admin also nichts, was er vor dem Löschen nicht schon sah. Die
Karte folgt damit dem vorhandenen Muster von „Kategorien", „Tags" und
„Bewertungskriterien": **Liste für jeden Berechtigten, Bedienzeichen nur, wo
gedrückt werden darf.**

### D. Was wird beim Wiederherstellen aus dem Verfasser? **Was der Import schon sagt.**

Nicht neu erfunden, sondern hingeschrieben:

- Ein **genannter Name, den es gibt**, wird zugeordnet.
- **Ein Grabstein wird gefunden.** Ein entfernter Zugang bleibt als Zeile in
  `users` stehen und trägt den Namen `geloescht-<nr>`; sein Beitrag kommt
  **wieder am Grabstein an** und heißt auf dem Bildschirm weiterhin
  „Gelöschter Benutzer 7". Belegt am Rundlauf.
- Erst wenn auch die Grabsteinzeile fort ist, fällt der Beitrag an den
  **Wiederherstellenden** — und wird in der Antwort **genannt**
  (`verfasserUnbekannt`), die Karte sagt es als Meldung.
- Eine **herrenlose** Zeile (`author: null`) fällt ebenso an ihn.

Der Eintrag bekommt eine **neue Nummer**; die alte ist weg, und daran hängt
nichts mehr.

### E. Wann wird aufgeräumt? **Beim Start UND beim Öffnen der Karte.**

Zwei Aufrufstellen einer Funktion, wie bei `ordneBestandZu()`, und der
Prüfstand belegt **jede einzeln**. Eine Anlage, die drei Monate durchläuft,
räumte sonst drei Monate lang nicht auf.

**Eine Unschönheit, und sie ist benannt:** damit schreibt eine **lesende**
Route. Sie steht deshalb nicht in `F_ROUTEN` — die Liste ist für schreibende
Routen —, und das Aufräumen ist Hauswirtschaft, keine Benutzerhandlung. Die
Alternative wäre eine Karte, die abgelaufene Zeilen anzeigt, und die ist
schlechter.

### F. Der Löschdialog: **er bleibt, sein Schlusssatz nicht.**

Die Zahlen sind die eigentliche Auskunft — was hier verlorengeht, gehört
anderen — und stehen unverändert da, getrennt nach eigen und fremd. Der
Schlusssatz lautet jetzt:

> „«Titel» wird gelöscht. Dabei gehen 1 Foto, 1 Video mit. Dazu … von mir. Und
> von anderen: … . **Alles davon liegt danach 30 Tage im Papierkorb;
> zurückholen kann es der Eigentümer der Anlage.**"

„Unwiderruflich" wäre jetzt falsch, und **wer zurückholen darf, steht dabei**:
es ist nicht der, der hier klickt.

### G. Der Zielort: **Wurzel aus der Umgebung, Unterverzeichnis aus der Oberfläche.**

Die erste Stelle im Projekt, an der der Server an einen Ort schreibt, den
jemand angeben darf. Zweistufig:

- Die **Wurzel** kommt aus `SICHERUNG_DIR` und ist über die Oberfläche nicht zu
  erreichen. **Kein Vorgabewert** — ein Pfad, den es nur im Container gibt,
  verschwände beim nächsten `--build`.
- Der **Ort** ist ein Unterverzeichnis darunter, und mehr nicht.

**Woran die Prüfung hängt: am aufgelösten realen Pfad, nicht am String.** Erst
eine **Positivliste** (`^[A-Za-z0-9][A-Za-z0-9 ._-]*(/…)*$` — jedes Segment
beginnt mit Buchstabe oder Ziffer), dann `fs.realpathSync`, dann die Frage, ob
der aufgelöste Pfad noch **innerhalb** der Wurzel und **außerhalb** des
Datenverzeichnisses liegt. Damit sind `..`, ein führender Schrägstrich, ein
Laufwerksbuchstabe und ein Gegenschrägstrich **nicht verboten, sondern nicht
ausdrückbar** — und ein **Symlink**, der aus der Wurzel herausführt, fällt am
aufgelösten Pfad auf. Ein Verzeichnis, das es nicht gibt, ist eine **Absage mit
Begründung**, kein stilles Anlegen.

Zusätzlich beim Start: liegt `SICHERUNG_DIR` selbst im Datenverzeichnis (oder
umgekehrt), bleibt die Karte **aus** und sagt, warum.

### H. Wie lange dauert `VACUUM INTO`? **Gemessen.**

| Datenbank | 51 MB | 204 MB | 511 MB | 1021 MB | 2043 MB |
|---|---|---|---|---|---|
| Dauer | 0,5 s | 2,0 s | 6,0 s | 13,5 s | 26,5 s |

Rund **10 ms je MB**, linear. Auf einem N100 ist mit dem Zwei- bis Dreifachen
zu rechnen; die Karte rechnet deshalb mit **20 ms je MB** und nennt die
erwartete Dauer **vorher**, samt dem Satz, dass die Anlage währenddessen
stillsteht.

**Einen zweiten Weg gibt es nicht** (Abschnitt 3 B).

### I. Die vorhandene Zieldatei und „letzte Sicherung vor N Tagen"

- **Der Name trägt Datum und Uhrzeit** (`kriterion-2026-08-23-19-56-01.sqlite`).
  Dass `VACUUM INTO` an einer vorhandenen Datei ohnehin scheitert
  („output file already exists"), ist nachgestellt und geprüft — aber der Name
  verlässt sich nicht darauf. Zwei Sicherungen in **derselben Sekunde** sind
  eine 409.
- **„Letzte Sicherung" kommt aus dem Dateisystem**, nicht aus einem Schlüssel
  in `settings` — dieselbe Entscheidung wie beim Merker gegen den Index in
  0.6.2: die Sache schlägt die Behauptung. **Der Preis steht daneben und ist
  geprüft:** ein unerreichbarer Zielort liefert **keine Zahl**, und die Karte
  sagt genau das statt einer zu behaupten.

### J. Der Einzelexport: **`nurEigentuemer`, Formatnummer 10.**

Eine Datei mit einem Eintrag nennt genauso die Namen ihrer Verfasser und kann
beim Einspielen genauso unter fremdem Namen schreiben. Die Frage „was kann
jemand mit dieser Datei tun" hat dieselbe Antwort wie beim vollen Export, und
sie hängt nicht an der Zahl der Einträge.

Die Formatnummer bleibt bei **10**: eine Datei mit einem Eintrag ist dieselbe
Form wie eine mit hundert. Das `data_ref` des Papierkorbs steht in **keiner**
Datei, die das Haus verlässt.

### K. Sicherung oder Backup? **Sicherung.**

Das Projekt sagt es längst überall so — Einspielweg, Stufenplan, Ideenpapier,
der Titel dieser Runde. Die drei verbliebenen Stellen in ausgelieferten Dateien
sind nachgezogen. **Nicht** in die Wortliste des Sprachwächters: die soll kurz
bleiben, und „Backup" ist kein übersetztes Lehnwort, sondern die andere von
zwei gebräuchlichen deutschen Wendungen. Stattdessen ein **enger eigener
Wächter** über die acht ausgelieferten Dateien, der das großgeschriebene
Substantiv sucht und den Bezeichner `db.backup()` ausdrücklich in Ruhe lässt.

---

## 3. Abweichungen und Befunde

### A. Das Ideenpapier sagt „gezippt" — gebaut ist TEXT plus Nebentabelle

Der Entwurf in 4.5 nennt `inhalt BLOB NOT NULL -- der ganze Eintrag im
Exportformat, gezippt`. Begründung für die Abweichung in Abschnitt 2 B.

### B. `db.backup()` ist kein zweiter Weg — nachgestellt

`better-sqlite3-multiple-ciphers` bringt `db.backup()` mit; es liefe
**schrittweise** und blockierte den Server nicht. An einer SQLCipher-Datenbank
antwortet es mit

```
backup is not supported with incompatible source and target databases
```

weil die Zieldatenbank keinen Schlüssel trägt. **`VACUUM INTO` ist der Weg**,
und dass er synchron läuft, ist keine Nachlässigkeit, sondern der Preis.
Das ist **Stolperstein 117**.

### C. Das Ideenpapier sagt „kein neuer Code für die Datenstruktur" — das stimmt so nicht

4.5 schreibt: „Der Serialisierer existiert bereits (Export), der
Deserialisierer auch (Import). Es entsteht **kein neuer Code für die
Datenstruktur**, nur der Aufruf an zwei Stellen." Beide standen **mitten in
ihren Routen** und waren von außen gar nicht zu rufen. Das Herausziehen ist
genau Punkt 3 des Auftrags — und in der Gegenrichtung (der Import) ein Stück,
das der Auftrag nicht verlangt hat und das die halbe Runde ausmacht.

### D. Der Auftrag verlangt nur die Abbildung — gebaut sind beide Richtungen

Punkt 3 nennt ausdrücklich nur `GET /api/export`. Das Wiederherstellen braucht
aber den Deserialisierer, und ein zweiter, frisch geschriebener wäre derselbe
Fehler, nur spiegelverkehrt. `spieleEin()` ist deshalb ebenfalls
herausgezogen, und ein Wächter über den Quelltext hält beide Richtungen fest.

### E. Zwei Löschwege füllen den Papierkorb ausdrücklich **nicht**

- **„Zugang entfernen" mit dem Häkchen *Einträge mitnehmen*.** Das steckt in
  `auth.js`, und `auth.js` darf von der Abbildung in `server.js` nichts wissen
  — die Abhängigkeit läuft andersherum.
- **Der ersetzende Import.** Er legte sonst die ganze bisherige Anlage als
  Pakete daneben und verdoppelte sie in derselben Datei. Wer ersetzt, hat die
  Datei in der Hand, aus der er ersetzt; das ist der Rückweg, und er ist ein
  anderer.

Beides steht als Kommentar an der jeweiligen Stelle.

### F. Zwei Verluste im Rundlauf, und beide stammen aus dem Austauschformat

- **Die Favoriten anderer kommen nicht zurück.** `favorite` heißt „habe **ich**
  markiert" — so steht es seit jeher im Export, und die Begründung („eine Liste
  fremder Favoriten in der Datei wäre Ablage, kein Bestand") trägt weiter. Beim
  Wiederherstellen landet der Favorit beim **Wiederherstellenden**. Belegt und
  benannt statt verschwiegen.
- **Der Eingriffsvermerk am Kommentar** (`comments.images_removed`) steht in
  **keiner** Exportdatei und fehlt deshalb nach dem Wiederherstellen.

Beides ließe sich nur mit einem neuen Feld im Austauschformat retten — also mit
**Formatnummer 11**. Der Auftrag stellt das Austauschformat unter Rückfrage;
entschieden ist: **hinnehmen und benennen**.

### G. Der Einzelexport braucht eine Größengrenze

Er nimmt alles mit, ohne Schalter — und eine Datei ist **ein** String. Ein
Eintrag mit zwanzig Videos risse ihn. Deshalb rechnet `austauschBytes()` die
erwartete Größe **vor** dem Bau und antwortet mit **413** samt sprechender
Begründung, wenn sie über 90 % der Stringgrenze liegt. Der volle Export hat
dieselbe latente Grenze; dort halten die Schalter mit ihren Vorgaben dagegen.

### H. Die Karten holen ihren Stand im vorhandenen `Promise.all`

Der erste Bau ließ `drawPapierkorb()` selbst nachladen. Das **riss den Prüflauf
ab**: eine Zusage, die nach `w.close()` eines jsdom-Fensters weiterläuft, findet
`document` nicht mehr. Beide neuen Karten hängen jetzt im vorhandenen
`Promise.all` — dieselbe Bauform wie die Kennzahlen, jede hinter der Rolle,
hinter der auch ihre Karte steht. **Das ist Stolperstein 118.**

### I. `datetime()` nimmt seine Modifikatoren einzeln

`datetime('now', '-30 days +1 seconds')` ergibt **NULL**, nicht den erwarteten
Zeitpunkt — und die Spalte ist `NOT NULL`. Der Prüflauf riss beim ersten Anlauf
genau daran ab. Richtig ist `datetime('now', '-30 days', '+1 seconds')`.
**Das ist Stolperstein 119.**

### J. `keys.js` und `.env.example` sind doch angefasst worden

Der Auftrag erwartete `anhaenge.js`, `auth.js` und `keys.js` als unberührt. In
`keys.js` steht das Wort „Backup" in der Warnung, die beim ersten Start auf dem
Bildschirm erscheint; es dort stehen zu lassen hieße, die Entscheidung aus
Abschnitt 2 K an der sichtbarsten Stelle nicht durchzuhalten. Geändert ist
**ein Text**, kein Code. `anhaenge.js` und `auth.js` sind unberührt.

### K. Der Mock hat zwei Felder nicht gekannt, die die Oberfläche liest

Beim Ergänzen von `papierkorbCount` ist aufgefallen, dass `/api/stats` im Mock
`videoCount` und `videoBytes` **nicht** mitbrachte, obwohl die Exportkarte die
erwartete Größe daraus rechnet. Ein Befund aus 0.8.50, der bis hierher stumm
geblieben ist — Stolperstein 90 in Reinform. Beide Felder sind nachgetragen.

### L. Eine Gegenprobe blieb stumm — und hat einen Fehler gefunden

Der Rückbau **„eine halbfertige Zieldatei wird nach einem Fehlschlag nicht
entfernt"** blieb **vollständig grün**. Die Regel aus Stolperstein 8 stand im
Code und war von **keiner** Prüfung gedeckt — und beim Nachsehen war sie
außerdem gefährlich: `if (fs.existsSync(datei)) fs.unlinkSync(datei)` im
Fehlerweg hätte eine **fremde, fertige** Sicherung entfernt, wenn der 409-Halt
davor je wegfiele.

Gebaut ist jetzt die schärfere Form: **geschrieben wird unter einem
Arbeitsnamen** (`…sqlite.wird`), **umbenannt wird erst danach**. Eine
halbfertige Kopie trägt nie den endgültigen Namen und fällt aus
`SICHERUNG_MUSTER` heraus — sie kann also gar nicht als fertige Sicherung
gelesen werden, auch dann nicht, wenn das Aufräumen scheitert. Entfernt wird
ausschließlich der Arbeitsname.

Und damit ist die Regel **prüfbar** geworden, was sie vorher nicht war: eine
liegengebliebene Arbeitsdatei zählt nachweislich nicht mit und wird
nachweislich nicht angefasst, nach einem geglückten Lauf bleibt keine zurück,
und ein Wächter über den Quelltext hält fest, dass der Fehlerweg nur den
Arbeitsnamen entfernt.

### M. Der Gegenprobentreiber hat sich selbst überführt

Zwei Gegenproben lieferten widersprüchliche Punkte: Zeilen, die nachweislich in
der Datenbank standen, waren über die Schnittstelle nicht da. Der Grund war
nicht der Rückbau, sondern der **Treiber**: ein abgerissener Prüflauf lässt
seine Serverprozesse weiterlaufen, und die Bereitschaftsprüfung des nächsten
Laufs bekam ihre Antwort von einem **fremden** Server auf demselben Port. Zu
sehen war es erst, als zwölf verwaiste Prozesse nebeneinander standen. Der
Treiber räumt jetzt die ganze Prozessgruppe ab; danach lief kein Rückbau mehr
widersprüchlich. **Das ist Stolperstein 122.**

*Dazu ein Fehler im Vorgehen, der hierher gehört:* der erste Durchgang der
Gegenproben zog seine Kopien aus dem Arbeitsbaum, **während daran noch
geschrieben wurde**. Die Ergebnisse waren wertlos und sind verworfen worden.
Seitdem läuft jeder Durchgang gegen einen **eingefrorenen** Stand, der vorher
gegen den Arbeitsbaum verglichen wird.

---

## 4. Neue Stolpersteine

Die Zählung setzt bei **117** fort.

117. **`db.backup()` geht an einer verschlüsselten Datenbank nicht.** Der
     schrittweise Weg der SQLite-Backup-API braucht eine Zieldatenbank mit
     demselben Schlüssel und antwortet sonst mit „backup is not supported with
     incompatible source and target databases". *Wer einen nicht blockierenden
     Weg sucht, misst zuerst nach, ob es ihn an dieser Datenbank gibt.*

118. **Eine Zusage, die nach dem Schließen ihres Fensters ankommt, reißt den
     Lauf ab.** Eine Karte, die ihre Liste selbst nachlädt, läuft weiter, wenn
     das jsdom-Fenster längst geschlossen ist — `document` ist dann `undefined`,
     und der Zugriff beendet den ganzen Prüflauf, statt eine Prüfung rot zu
     färben. *Was eine Ansicht beim Aufbau braucht, wird beim Aufbau geholt.*
     Verwandt mit 103, aber eigenständig: dort ist die Prüfung zu unvorsichtig,
     hier die Ansicht.

119. **`datetime()` nimmt seine Modifikatoren EINZELN.**
     `datetime('now', '-30 days +1 seconds')` ergibt **NULL**, nicht den
     gemeinten Zeitpunkt; zwei Modifikatoren sind zwei Argumente. *Eine
     Prüflage, die einen Zeitpunkt von Hand setzt, sieht nach, ob wirklich
     einer dasteht.* Verwandt mit 60 — dort ist die Auflösung zu grob, hier
     fehlt der Wert ganz.

120. **Eine Positivliste am Dateipfad ist stärker als jede Verbotsliste — aber
     sie ersetzt den aufgelösten Pfad nicht.** `..` und ein absoluter Pfad sind
     nicht ausdrückbar, wenn jedes Segment mit Buchstabe oder Ziffer beginnen
     muss. **Ein Symlink ist es sehr wohl**, und am String sieht er harmlos aus.
     *Wer prüft, wohin geschrieben wird, prüft `realpathSync` und nicht die
     Eingabe.*

121. **Ein Dateiname mit Sekundenauflösung kollidiert in derselben Sekunde.**
     Zwei Sicherungen kurz hintereinander tragen denselben Namen; `VACUUM INTO`
     scheitert dann mit „output file already exists". Das ist die richtige
     Antwort — aber eine Prüflage, die zweimal hintereinander sichert, muss
     eine Sekunde warten, sonst prüft sie die Kollision statt der Sache.

122. **Ein abgerissener Prüflauf hinterlässt seine Server.** Die
     Bereitschaftsprüfung des nächsten Laufs kann dann von einem **fremden**
     Server auf demselben Port beantwortet werden, und der Lauf prüft danach
     eine andere Anlage — Zeilen, die in der Datenbank stehen, sind über die
     Schnittstelle nicht da. *Wer Gegenproben in Serie fährt, räumt die ganze
     Prozessgruppe ab und nicht nur das Wegwerfverzeichnis.*

---

## 5. Gegenprobentabelle

**38 Rückbauten, jeder in einer eigenen KOPIE des Arbeitsbaums**
(Stolperstein 100) und gegen einen **eingefrorenen** Stand, der vorher gegen
den Arbeitsbaum verglichen wurde. Gemessen wird an den **Namen** der roten
Prüfungen, nicht an ihrer Zahl (Stolperstein 49).

| Rückbau | Ergebnis |
|---|---|
| Die Abbildung je Eintrag wird kopiert (zweite Feldliste daneben) | **1 rot** — „Die Abbildung je Eintrag kommt genau einmal im Quelltext vor" |
| Der Einzelexport verliert nurEigentuemer | 3 rot — „Ein gewoehnlicher Benutzer zieht keinen Einzelexport" · „Ein Admin ohne Eigentuemerrolle auch nicht" · „Die Absage nennt den Eigentuemer" |
| Die Formatnummer faellt auf 9 zurueck | 3 rot — „Die Formatnummer steht auf 10" · „Die Formatnummer der Datei steht auf 10" · „Die Formatnummer bleibt bei 10" |
| Der Umschlag laesst criteria und criteriaGewichte weg | 6 rot — „Export nennt die Kriterienreihenfolge" · „Und die Exportdatei traegt sie" · „criteria bleibt eine Liste von Namen" · … (3 weitere) |
| inDenPapierkorb laeuft ohne Transaktion | 4 rot — „UND es bleibt KEINE Papierkorbzeile zurueck" · „Und die Zeile liegt jetzt im Papierkorb" · „Vier Zeilen liegen bereit" · … (1 weitere) |
| Das Loeschen fuellt den Papierkorb gar nicht | 39 rot — „Genau EINE Zeile liegt im Papierkorb" · „Sie traegt den Titel als eigene Spalte" · „Und den Loeschenden" · … (36 weitere)  **(Lauf danach abgerissen — grober Rückbau, enge Zweitproben daneben)** |
| Der Papierkorb packt die Bytes doch als Base64 in die JSON | 7 rot — „Die Bytes liegen daneben, eine Zeile je Blob" · „Ihre Nummern sind lueckenlos ab null" · „Die Videobytes stehen nicht in der JSON" · … (4 weitere) |
| Das Auffangnetz kennt eine Tabelle weniger (enge Zweitprobe: papierkorb selbst eintragen reisst den Start ab) | 4 rot — „Es kennt weiterhin genau die sechs Traeger mit user_id" · „Was die Migration nicht fuellen kann, faengt das Auffangnetz auf" · „Danach steht keine Datei mehr ohne Benutzer" · … (1 weitere) |
| raeumePapierkorbAuf() faellt beim Start weg | 2 rot — „Schon der Start raeumt sie weg" · „Und sagt es im Protokoll" |
| raeumePapierkorbAuf() faellt am Oeffnen der Karte weg | 3 rot — „Beim Oeffnen der Karte faellt heraus, was aelter als dreissig Tage ist" · „Und auf der anderen: eine Sekunde danach faellt heraus" · „Die Bytes der herausgefallenen Zeile fallen mit" |
| Die Frist steht auf 29 statt 30 Tagen | 7 rot — „Die Frist steht in den Einstellungen und nicht nur in der Karte" · „Die Liste nennt die Frist" · „Sie nennt die verbleibenden Tage" · … (4 weitere) |
| GET /api/papierkorb verliert nurAdmin | 2 rot — „Ein gewoehnlicher Benutzer sieht den Papierkorb nicht" · „Die Absage nennt den Grund" |
| Wiederherstellen steht hinter nurAdmin statt nurEigentuemer | 6 rot — „Auch der Admin ohne Eigentuemerrolle nicht" · „Die Absage nennt den Eigentuemer" · „Und wieder ist kein Eintrag entstanden" · … (3 weitere) |
| Die Papierkorbzeile wird beim Wiederherstellen nicht entfernt | 9 rot — „Die Papierkorbzeile ist danach weg" · „Und ihre Bytes mit ihr" · „Und im Papierkorb liegt nichts" · … (6 weitere) |
| papierkorbCount faellt aus /api/stats | 2 rot — „Die Kennzahlen nennen den Papierkorb" · „Mit seiner Groesse" |
| items bekommt doch eine Spalte geloescht | **1 rot** — „items traegt unveraendert genau seine zehn Spalten" |
| Der Loeschdialog behaelt seinen alten Schlusssatz | **1 rot** — „Das Wort unwiderruflich steht nicht mehr darin" |
| Die Papierkorbknoepfe stehen auch beim Admin | **1 rot** — „Aber an ihnen steht kein einziger Knopf" |
| Der Mock aendert seinen Papierkorb beim Zurueckholen nicht (Stolperstein 90) | 2 rot — „Die Karte zeigt danach eine Zeile weniger" · „Und die zurueckgeholte Zeile ist es, die fehlt" |
| Die Tabelle papierkorb faellt aus der DDL | **Abriss** — **der Start bricht ab**, der Server laesst sich ohne die Tabelle gar nicht mehr starten |
| Der Zielort wird am String statt am aufgeloesten Pfad geprueft | 3 rot — „Abgewiesen: ein Symlink aus der Wurzel heraus" · „Und die Begruendung spricht: ein Symlink aus der Wurzel heraus" · „Und der eingestellte Ort steht nach allen Absagen unveraendert leer" |
| Die Positivliste am Zielort faellt weg | 5 rot — „Und die Begruendung spricht: ein Pfad nach oben" · „Und die Begruendung spricht: ein absoluter Pfad" · „Und die Begruendung spricht: ein Punktpunkt mitten im Pfad" · … (2 weitere) |
| Ein fehlendes Verzeichnis wird still angelegt | 7 rot — „Abgewiesen: ein Verzeichnis, das es nicht gibt" · „Und die Begruendung spricht: ein Verzeichnis, das es nicht gibt" · „Ein nicht angelegtes Verzeichnis wird auch NICHT angelegt" · … (4 weitere) |
| Die letzte Sicherung kommt aus settings statt aus dem Dateisystem | **1 rot** — „Ein Schluessel in settings bewegt die Zahl NICHT" |
| Der Dateiname traegt kein Datum, sondern steht fest | 7 rot — „Der Name traegt Datum und Uhrzeit" · „Ein zweiter Griff legt eine zweite Datei an" · „Und die erste liegt unveraendert daneben" · … (4 weitere) |
| POST /api/sicherung verliert nurEigentuemer | 3 rot — „Ein gewoehnlicher Benutzer sichert nicht" · „Ein Admin ohne Eigentuemerrolle sichert nicht" · „Jede Route mit benanntem Waechter traegt ihn in der Routenzeile" |
| PUT /api/sicherung/ort steht hinter nurAdmin statt nurEigentuemer | 4 rot — „Ein Admin ohne Eigentuemerrolle stellt den Zielort nicht um" · „Der eingestellte Ort steht danach unveraendert auf taeglich" · „Und hinterlaesst keine brauchbare Kopie" · … (1 weitere) |
| Ein Sicherungsort im Datenverzeichnis wird nicht mehr abgewiesen | 4 rot — „Ein Sicherungsort IM Datenverzeichnis bleibt aus" · „Und sagt, warum" · „Der Knopf sagt dort ebenfalls ab" · … (1 weitere) |
| Die Rollenteilung faellt aus der Exportkarte | 2 rot — „Sie nennt sich den Austauschweg" · „Und verweist auf die Sicherung" |
| Der Hinweis auf den Schluessel faellt aus der Sicherungskarte | 2 rot — „Der Hinweis auf den Schluessel steht in der Karte" · „Und er nennt die .env" |
| Die Karte sagt die Dauer nicht mehr vorher | 2 rot — „Die Karte sagt vorher, dass die Anlage stillsteht" · „Und nennt die erwartete Dauer aus der Antwort" |
| Die Sicherung schreibt direkt auf den endgueltigen Namen statt unter einem Arbeitsnamen | **1 rot** — „Sie schreibt unter einem Arbeitsnamen und benennt erst danach um" |
| Der Index auf papierkorb.geloescht_am faellt weg | **1 rot** — „Und den Index auf das Datum, ebenfalls ohne Migration" |
| Der Einzelexport laesst die Videos weg | 3 rot — „Der Eintrag selbst ist Zeichen fuer Zeichen derselbe wie im vollen Export" · „Mit Fotos, Video, Dateien und Kommentaren" · „Seine Fotos sind bytegleich mit denen des Originals" |
| papierkorbTage faellt aus /api/settings | **1 rot** — „Die Frist steht in den Einstellungen und nicht nur in der Karte" |
| Die Papierkorbkarte schreibt Eintraege statt des Vokabulars | **1 rot** — „Die Karte benutzt das Vokabular" |
| Der Fehlerweg raeumt die ZIELDATEI statt des Arbeitsnamens weg | **1 rot** — „Und entfernt im Fehlerfall NUR den Arbeitsnamen" |
| letzteSicherung() zaehlt auch liegengebliebene Arbeitsdateien | **1 rot** — „Eine liegengebliebene Arbeitsdatei zaehlt nicht als Sicherung" |

**Zwei Rückbauten haben den Lauf abgerissen, und beide aus demselben Grund:
sie nehmen der Prüflage ihren Gegenstand.** „Das Löschen füllt den Papierkorb
gar nicht" ist der **grobe** Rückbau, der die **Tragweite** zeigt (39 rot); den
**Ort** zeigen die engen daneben — die Transaktion, die stehengebliebene Zeile,
die Bytes an der JSON vorbei. „Die Tabelle fällt aus der DDL" bringt den Server
gar nicht mehr zum Starten (`SQLITE_ERROR` beim Laden von `db.js`) und ist
damit selbst eine Auskunft: **die DDL ist beim Start tragend, nicht bloß beim
ersten Anlegen.** Die enge Zweitprobe dazu ist der Index (Stolperstein 76).

**Eine Gegenprobe blieb stumm — und war der wertvollste Fund der Runde**
(Abschnitt 3 L). Sie steht in dieser Tabelle jetzt mit **1 rot**, weil die
Regel danach so gebaut wurde, dass sie prüfbar ist.

**Drei Paare tragen mehr als ihre Zahl:**

- **Positivliste und aufgelöster Pfad sind zwei Schichten.** Fällt die
  Positivliste weg, bleibt jede **Abweisung** grün — nur die **Begründung**
  wird falsch, weil `realpathSync` die Fälle ohnehin auffängt. Fällt umgekehrt
  der aufgelöste Pfad weg, geht der **Symlink** durch, den die Positivliste
  nicht sehen kann. Jede Schicht hat ihre eigenen Namen (Stolperstein 53).
- **Die Herkunft von „letzte Sicherung" braucht beide Richtungen.** Der Rückbau
  auf einen Schlüssel in `settings` färbt genau **eine** Prüfung rot — und zwar
  die, die es meint: „Ein Schlüssel in settings bewegt die Zahl NICHT". Die
  Zeile daneben, die dem Datum der Datei folgt, bliebe für sich allein grün.
- **Der Mock, der nicht mitzieht** (Stolperstein 90): zwei rote Namen, und
  beide betreffen das Neuzeichnen — ohne ihn wäre „die Karte zeichnet sich neu"
  von „die Karte blieb stehen" nicht zu unterscheiden.

---

## 6. Prüfungszahlen

**Vorher 2087, nachher 2381 — 294 neue Prüfungen,
38 Gegenproben.**

Neun neue Gruppen:

- **„Der Papierkorb: die Tabelle legt sich selbst an"** — die Probe aus
  Abschnitt 2 A samt Gegenlage an einer Spalte, und die Zusicherung, dass
  `items` unverändert genau seine zehn Spalten trägt.
- **„Der Papierkorb: der Rundlauf"** — die tragende Prüfung der Runde. Ein
  Eintrag mit Foto, echtem Video, zwei Dateien, zwei Links, zwei Tags,
  Kommentaren aller vier Arten (darunter einer mit Bild, einer von einem
  Grabstein und einer herrenlosen), Bewertungen zweier Bewerter samt einer
  zurückgesetzten und Testtagen zweier Verfasser am selben Tag. Gelöscht,
  wiederhergestellt, **Feld für Feld** gegen die echte Serverantwort gehalten —
  Fotos und Video **bytegleich**.
- **„Der Papierkorb: dieselbe Transaktion"** — ein Auslöser in der Datenbank
  erzwingt den Fehlschlag beim Einfügen; danach steht der Eintrag
  **unverändert** da, und im Papierkorb liegt nichts. Daneben der Beleg, dass
  derselbe Griff ohne die Bremse durchgeht.
- **„Der Papierkorb: die dreißig Tage"** — die Grenze an **beiden** Seiten
  (−30 Tage ± 1 Sekunde, von Hand gesetzt), und **jede** der beiden
  Aufräumstellen einzeln.
- **„Der Papierkorb: die Rechte"** — drei Wege, drei Rollen, zu jeder
  Verweigerung der Erfolgsfall daneben und die Nachschau in der Datenbank.
- **„Ein einzelner Eintrag als Datei"** — dieselbe Form wie der volle Export,
  geprüft an einer Datei, die durch den **Import** wieder hereinkommt.
- **„Die Sicherung auf Knopfdruck"** — `VACUUM INTO` an einer echten Anlage,
  sieben Absagen am Zielort mit der Nachschau „danach liegt keine Datei da",
  die vorhandene Zieldatei, die Herkunft von „letzte Sicherung" in **beiden**
  Richtungen, der unerreichbare Ort, der Ort im Datenverzeichnis, die fehlende
  Einrichtung und die Probe an `db.backup()`.
- **„Der Papierkorb in der Oberfläche"** und **„Die Sicherung in der
  Oberfläche"** — beide Karten in allen ihren Zuständen, jeder Knopf über ein
  **wirklich zugestelltes** Ereignis, und der Mock ändert seinen Bestand bei
  jedem Schreibweg wirklich.

Ergänzt wurden „Der Wächter über den Quelltext" (die Abbildung genau einmal,
der Deserialisierer genau einmal, keine Bestandsabfrage nennt den Papierkorb,
fünf Migrationsfunktionen, das Auffangnetz unverändert, die Frist an einer
Stelle, das Wort „Backup"), „Der Systembereich nach Rolle" (fünfzehn Karten),
„Kommentare in der Oberflaeche" (der neue Schlusssatz des Löschdialogs) und der
Mock in `baueDom` (Papierkorb, Sicherung, `videoCount`/`videoBytes`).

---

## 7. Was ausdrücklich nicht passiert ist

- **Keine neue Abhängigkeit.** Nicht eine. `zlib` wäre eingebaut gewesen und
  wird trotzdem nicht benutzt.
- **Keine bestehende Abfrage geändert.** `items` trägt unverändert zehn
  Spalten, kein `WHERE` hat einen Zusatz bekommen, und ein Wächter über den
  Quelltext hält es fest.
- **Kein sechster Migrationsblock**, kein sechster Migrationsabschnitt im
  Prüfstand, kein neuer Eintrag unter „Vorgemerkt für 1.0".
- **Keine neue Formatnummer.** Die Exportdatei bleibt bei 10.
- **Kein zwölfter Vokabeleintrag.** „Papierkorb" und „Sicherung" sind Wörter
  über den Gegenstand, so wie „Foto" und „Video". Die elf bleiben elf.
- **Die Sortierung der Übersicht, das Farbschema, die Anmeldebremse, das
  Verschlüsselungsmodell, `katalog.sqlite`, `HINTER_PROXY` und die
  Content-Security-Policy sind unberührt.**
- **`anhaenge.js` und `auth.js` sind unberührt.**

---

## 8. Offen geblieben

- **Die Favoriten anderer und der Eingriffsvermerk** kommen im Rundlauf nicht
  zurück (Abschnitt 3 F). Wer sie retten will, hebt die Formatnummer auf 11.
- **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird weiterhin bei jedem
  Seitenaufbau geholt; die Frage bleibt für eine eigene Runde vorgemerkt.
- **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 weiterhin unbelegt.
- **Der Sprachwächter sieht die Namen von Prüfungen nicht an** (Befund aus
  0.8.60) — sie stehen in Strings, nicht in Kommentaren.
- **Die Vorschau der Rangfolge im Systembereich** (0.8.40), **4.2 „Abgelehnt
  mit Datum und Begründung"**, **eine Trusted-Proxy-Adressliste** (0.8.20) und
  **die Tastaturbedienung beim Sortieren** bleiben vorgemerkt.
