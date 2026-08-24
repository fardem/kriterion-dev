# Änderungsprotokoll 0.8.80 — „Einladung, Rücksetzung, Sitzungen"

**Stufe H des Mehrbenutzerbetriebs — Tokens.** Die erste Stufe seit G4
(0.8.30); dazwischen liegen mit 0.8.40 bis 0.8.71 vier Runden, die nicht
dazugehörten. Danach fehlt nur noch **Stufe I** (Mailversand und
Selbstanmeldung, 0.9.0).

Vorgänger: **0.8.71**, Fingerprint `1b03fabf`, **2398 Prüfungen**.
*Der Auftrag nennt als Ausgangswert 2381 und den Fingerprint `1aa9266a` —
beides ist der Stand von 0.8.70. 0.8.71 hat 17 Prüfungen nachgelegt; gerechnet
wird ab 2398.*

**Fingerprint 0.8.80 — `4c046b7c`**

**Was sich ändert, in einem Satz:** Ein neuer Zugang bekommt sein Passwort
**selbst**, über einen Link mit begrenzter Haltbarkeit, statt es vom Admin
gesagt zu bekommen — und jeder sieht, **wo er überall angemeldet ist**.

**Die tragende Frage stand vor dem ersten Punkt, und sie war keine technische:
wie kommt der Link zum Empfänger?** Mailversand ist Stufe I. Also gibt es genau
eine Antwort: der Admin **kopiert den Link und gibt ihn weiter**. Das ist keine
Notlösung, sondern die Bauform — der Link ist damit ein **Passwortersatz auf
Zeit**, er steht nach der Weitergabe in einem fremden Verlauf, und alles, was
diese Runde entschieden hat, folgt daraus. **Es steht in der Oberfläche**, im
Kasten neben dem Feld, aus dem kopiert wird.

**Keine Migration, keine neue Abhängigkeit, Formatnummer unverändert bei 10.**
`F_ROUTEN` geht von **51 auf 56**. Fünfzehn Karten im Systembereich werden
**sechzehn**. Die elf Vokabeleinträge bleiben elf. Es bleibt bei **fünf**
markierten Migrationsblöcken, und unter „Vorgemerkt für 1.0" kommt **nichts**
dazu.

---

## 1. Was gebaut wurde, je Datei

Angefasst sind `db.js`, `auth.js`, `server.js`, `public/app.js`,
`public/style.css`, `pruefung.js`, `package.json` und `package-lock.json`.
**`anhaenge.js`, `keys.js`, `zugang.js`, `docker-compose.yml` und `.env.example`
sind unberührt geblieben** — wie im Auftrag vorgesehen.

### `db.js` (+56/−0 Zeilen)

Eine Tabelle, ein Index, vollständige DDL, **kein Migrationsblock**:

```sql
CREATE TABLE IF NOT EXISTS tokens (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zweck TEXT NOT NULL,
  ablauf TEXT NOT NULL,
  benutzt_am TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);
```

Der Kommentar am Schema trägt die Begründung zu Hash, `zweck`, `benutzt_am`
und `created_at` — siehe Abschnitt 2.

### `auth.js` (+221/−7 Zeilen) — die Datei dieser Runde

**Neu:** `sitzungsKennung()`, `sitzungenVon()`, `beendeSitzung()`,
`beendeAndereSitzungen()`, `tokenHash()`, `raeumeTokensAuf()`,
`erzeugeToken()`, `pruefeToken()`, `loeseTokenEin()`, dazu die Konstanten
`TOKEN_TAGE = 7`, `TOKEN_SPUR_TAGE = 30`, `TOKEN_ZWECKE`.

**Geändert:** `legeZugangAn()` nimmt ein viertes Argument `ohnePasswort`;
`listeZugaenge()` liefert die abgeleitete Frage `ohnePasswort`;
`setzeStatus()` und `entferneZugang()` räumen die offenen Token mit weg.

**Ein Rückbau statt eines Anbaus:** die Zeile
`DELETE FROM sessions WHERE token != ? AND user_id = ?` stand im Rumpf von
`PUT /api/account`. „Alle anderen beenden" hätte sie ein zweites Mal gebraucht
— das wäre Stolperstein 47 gewesen. Sie steht jetzt **einmal**, in
`beendeAndereSitzungen()`, mit zwei Rufern.

### `server.js` (+146/−7 Zeilen)

**Fünf neue schreibende Routen**, `F_ROUTEN` 51 → 56:

| Route | Art | Bemerkung |
|---|---|---|
| `POST /api/token/pruefen` | `offen` | **liest nur** — POST, damit der Schlüssel im Rumpf steht |
| `POST /api/token/einloesen` | `offen` | die fünfte offene schreibende Route |
| `POST /api/users/:id/token` | `nurAdmin, im Rumpf` | über `zielZugangFrei`, Rollenleiter greift |
| `DELETE /api/sessions` | `selbstbezug` | alle anderen beenden |
| `DELETE /api/sessions/:kennung` | `selbstbezug` | feste Route vor der Platzhalterroute |

Dazu **ein lesender Endpunkt** `GET /api/sessions` — er steht wie immer
**nicht** in `F_ROUTEN`, auch nicht die beiden vor der Anmeldung liegenden
schreibenden Ausnahmen davon.

`POST /api/users` nimmt `einladen: true` und gibt den Link im selben Zug
zurück. Der Aufruf ohne Passwort und ohne `einladen` scheitert weiter wie
bisher.

### `public/app.js` (+279/−15 Zeilen)

`showEinladung()` als **Zustand der Anmeldeseite**, erreicht über
`#/einladung/<schlüssel>`, eingehängt in `boot()` **vor** der Frage nach einer
laufenden Sitzung. Karte „Zugänge": das Kettenglied 🔗 an der Zeile, der Knopf
„+ Anlegen und Link", der Kasten `zeigeLink()` samt Warnung. Neue Karte
„Meine Sitzungen" beim eigenen Zugang; ihr Stand kommt aus dem vorhandenen
`Promise.all` von `renderSystem()`.

### `public/style.css` (+17/−0 Zeilen)

`.zug-wartet`, `.zug-linkzeile`, `.mrow.sitz`, `.mrow.sitz-ich`, `.sitz-fuss`.
Das Farbschema ist unberührt; der Warnkasten benutzt das vorhandene
`.warn-box`.

### `pruefung.js` (+1558/−16 Zeilen)

Neun neue Gruppen am Server, drei an der Oberfläche, dazu die nachgezogenen
Wächter. Einzelheiten in Abschnitt 5 und 6.

---

## 2. Die Fragen aus dem Auftrag, beantwortet

### A. Welcher Hash? **SHA-256, einmal, ohne Salz — und das ist begründet.**

Das Projekt hasht Passwörter mit **scrypt**, absichtlich langsam. Für einen
Token ist das der falsche Griff, und zwar aus zwei Gründen:

* **scrypt schützt *ratbare* Geheimnisse.** Ein Token trägt 256 Bit aus dem
  Zufallsgenerator; es gibt kein Wörterbuch, gegen das man ihn probieren
  könnte. Die Langsamkeit kauft nichts.
* **Mit Salz je Zeile ist der Hash nicht nachschlagbar.** Der Server müsste
  bei *jedem* Einlöseversuch *jede* Zeile einzeln durchrechnen. Auf einer
  Route, die **vor** der Anmeldung steht, ist das ein Hebel zum Lahmlegen.

Ohne Salz ist der Hash ein **Schlüssel**: `WHERE hash = ?` findet die Zeile
über den Primärschlüssel, statt sie zu suchen.

**Damit die Abweichung im richtigen Licht steht:** `sessions.token` liegt heute
**im Klartext** in der Tabelle. Den Token zu hashen ist strenger als der
Bestand, nicht lockerer.

### B. Tut `safeEqual` hier noch etwas? **Nein — und es steht deshalb nicht da.**

Es wird **nachgeschlagen, nicht verglichen**; `WHERE hash = ?` *ist* der
Vergleich. Ein `safeEqual` dahinter verglich den gefundenen Wert mit sich
selbst. Die Laufzeit des B-Baums verriete nur, ob ein Hash existiert — und wer
den Hash bilden kann, hat den Token bereits.

### C. Braucht es `zweck`? **Ja, aber als Feststellung eines Vorgangs.**

Der Einwand aus dem Auftrag ist berechtigt: eine Spalte ohne Wirkung auf den
Ablauf wäre eine zweite Wahrheit. Gebaut ist deshalb die andere Auflösung:
**der Bildschirmtext leitet sich aus dem ZUSTAND ab** — hat der Zugang
überhaupt schon ein Passwort —, **nicht aus `zweck`**. Damit kann `zweck` nicht
mit dem Zustand auseinanderlaufen, auch nicht, wenn ein Admin einem Zugang mit
Passwort einen „Einladungslink" schickt.

`zweck` bleibt trotzdem stehen, und zwar in derselben Rolle wie
`papierkorb.geloescht_von`: **die Feststellung, welcher Knopf gedrückt wurde.**
Daran hängt kein Recht und kein Filter. Das Sicherheitsprotokoll aus 0.8.90
wird sie brauchen.

**Kein `CHECK` auf der Spalte** — dieselbe Überlegung wie bei `users.status`:
die Liste gültiger Werte steht als `TOKEN_ZWECKE` im Code und lässt sich dort
erweitern, ohne die Tabelle neu zu bauen.

### D. Was wird aus `benutzt_am`? **Stehen lassen, mit Datum.**

Es ist die einzige Spur, dass eine Einladung angenommen wurde. Aufgeräumt wird
nach **einer** Schwelle: `TOKEN_SPUR_TAGE = 30`, gerechnet ab **Ablauf**. Eine
unbenutzte Zeile lebt damit 7 + 30 Tage, eine benutzte ebenso. *Eine Schwelle
statt zweier: ein Wert, eine Regel, eine Gegenprobe.*

### E. Wann wird aufgeräumt? **Beim Start UND beim Öffnen der Karte.**

`raeumeTokensAuf()` ist von `raeumePapierkorbAuf()` abgeschrieben, nicht neu
erfunden: eine Funktion, zwei Aufrufstellen, jede im Prüfstand **einzeln**
belegt (Stolperstein 53). Der Modifikator wird **gebunden** übergeben und ist
**einer** — Stolperstein 119.

### F. Der leere Hash: **er trägt, und es kommt keine Klemme dazu.**

Nachgestellt statt geglaubt, und der Befund ist besser als erwartet: ein Zugang
mit leerem `password_hash` kann sich aus **zwei voneinander unabhängigen**
Gründen nicht anmelden.

1. `pruefeAnmeldung()` fällt bei leerem Hash auf `BLINDWERT` zurück.
2. `pruefePasswort()` weist einen Wert, der nicht nach scrypt aussieht, schon
   **am Format** ab (`t.length !== 6 || t[0] !== 'scrypt'`).

Das hat für die Gegenprobe Folgen — siehe Abschnitt 4 C.

### G. Ein vierter Zustand? **Nein — und die Ableitung ist eine andere als vorgeschlagen.**

`ZUSTAENDE` bleibt bei drei. **Widersprochen wurde der Ableitung aus
`last_login IS NULL`:** die beantwortet „hat sich noch nie angemeldet", und das
ist *nicht* dasselbe wie „kann sich nicht anmelden". Die Karte braucht das
Zweite. Abgeleitet wird deshalb aus **`password_hash = ''`** — genau dem Wert,
über den auch `pruefeAnmeldung()` entscheidet. Kein Schema, keine zweite
Wahrheit.

**Der Rücksetzfall zerbricht daran nicht**, und das war die Sorge im Auftrag:
beim Zurücksetzen bleibt das alte Passwort gültig, **bis** der Link eingelöst
wird. Wer zurückgesetzt wurde und sich seitdem nicht gemeldet hat, hat also
sowohl ein `last_login` als auch ein gültiges Passwort. Beide Fragen sind
richtig beantwortet, jede aus ihrer eigenen Quelle.

**Der Grabstein trägt denselben leeren Hash** — er ist über `status`
unterschieden, und die Karte zeigt „noch kein Passwort" ausdrücklich nur an
einer nicht-gelöschten Zeile. Der Prüfstand hält beide Fälle nebeneinander.

### H. Bleibt „Passwort zurücksetzen"? **Ja, beide Wege, und die Karte bevorzugt den Link.**

**Kein Fall von Stolperstein 47.** Der Link übergibt das **Recht, ein Passwort
zu setzen**; der Schlüssel übergibt ein **Passwort**. Das ist nicht dasselbe in
Grün: der direkte Weg kommt ohne den Browser des anderen aus und ist für
jemanden, der danebensteht, der kürzere. Das 🔗 steht **vor** dem 🔑, und der
Prüfstand hält die Reihenfolge fest.

### I. Greift die Anmeldebremse? **Ja, ohne einen einzigen Umbau.**

Nachgesehen und nachgestellt: `checkThrottle(ip, null)` arbeitet unverändert.
Die IP-Hälfte greift, die Namenshälfte fällt **von selbst** weg — `noteFailure`
legt bei leerem Namen gar keinen Zähler an. **Die Kennwerte sind unangetastet.**

### J. Sieht die Absage immer gleich aus? **Ja — eine für alle Fälle.**

Hier wurde der Neigung des Auftrags widersprochen, und der Grund ist nicht bloß
Verschwiegenheit: **das Heilmittel ist in jedem dieser Fälle dasselbe** —
abgelaufen, schon benutzt, erfunden, Zugang gesperrt, Grabstein. In allen fünf
lautet der nächste Schritt „beim Admin einen neuen Link holen". Drei Meldungen
brächten dem Ehrlichen nichts und dem Ratenden etwas.

Der Wortlaut nennt das Heilmittel mit:
> Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.

**Was das kostet, ehrlich benannt:** wer sich in der Adresse vertippt hat,
unterscheidet das nicht von „abgelaufen". Beide Male ist der nächste Schritt
derselbe. Geprüft wird an **Wortlaut und Statuscode** — ein unterschiedlicher
Code wäre dieselbe Auskunft in anderer Form.

### K. Was steht auf der Seite, bevor geprüft ist? **Nichts über den Zugang.**

Der Server nennt den Benutzernamen erst, wenn der Link trägt. Das Formular
selbst ist damit schon die Bestätigung.

### L. Wie kommt die Seite zustande? **Als Zustand der Anmeldeseite.**

Eine zweite ausgelieferte Datei hieße eine zweite Stelle für Kopfzeilen, für
die Content-Security-Policy und für die Sicherheitsregel aus Abschnitt 5a.

**Und die Bauform trägt eine eigene Zusicherung:** der Schlüssel steht im
**Fragment** der Adresse (`#/einladung/…`). Ein Fragment geht **nie** an den
Server — es steht in keinem Zugriffsprotokoll, in keinem Referrer. Der Browser
schickt ihn von dort im **Rumpf** eines POST. Der Prüfstand hält beides fest:
dass er im Rumpf ankommt, *und* dass er in keiner Adresse auftaucht.

### M. Wie wird eine Sitzung adressiert? **Über eine gerechnete Kennung — den vollen SHA-256.**

Genommen ist der erste der drei Wege aus dem Auftrag, aber schärfer: **nicht
die ersten Stellen, sondern der volle Hash.** Kein Schema, **kein sechster
Migrationsblock**, nicht rückwärts auflösbar — und die Frage nach der
Eindeutigkeit stellt sich beim vollen Wert **gar nicht erst**, statt beim Lesen
geprüft werden zu müssen.

SQLite kann SHA-256 nicht rechnen; die Kennung entsteht deshalb in JavaScript
über die Zeilen **eines** Benutzers. Das trägt, weil dort eine Handvoll Zeilen
steht.

### N. Taugt die Karte etwas? **Ja — aber nicht wegen der Zeilen.**

Die ehrliche Antwort auf „lässt sich eine fremde Sitzung von einer eigenen
unterscheiden" ist **nein**. Was die Karte trägt, ist etwas anderes: **die
Zahl** („2 weitere Anmeldungen") und **ein Knopf**. Wer eine Anmeldung erwartet
und vier sieht, weiß genug, und das Heilmittel steht daneben.

**Kein Browserkopf, keine IP.** Die Anlage speichert beides heute nicht; das
ist eine Eigenschaft und kein Mangel und passt zu „läuft offline im Heimnetz".
**Die Karte sagt das offen** — eine Karte, die mehr behauptet, als sie weiß,
wäre schlimmer als keine.

### O. Wo steht die Karte, und sieht ein Admin fremde? **Beim eigenen Zugang. Nein.**

„Meine Sitzungen" steht neben „Zugang" und gehört **jedem**, auch ohne Rolle —
fünfzehn Karten werden sechzehn. Ein Admin sieht **keine** fremden Sitzungen:
für den Ernstfall gibt es das Sperren, und `setzeStatus` löscht sie bereits
mit. Ein zweiter Weg dorthin wäre wieder Stolperstein 47.

### P. Token oder Einladungslink? **„Token" im Quelltext, „Link" am Bildschirm.**

Dieselbe Form wie „Sicherung oder Backup" in 0.8.70: **nicht** in die Wortliste
des Sprachwächters — die soll kurz bleiben, und „Token" ist kein übersetztes
Lehnwort, sondern der Fachbegriff. Stattdessen ein **enger eigener Wächter**
über `public/app.js`, denn diese Datei *ist* der Bildschirm. Er sucht das
großgeschriebene Substantiv und lässt den Bezeichner `token` in Ruhe.

Am Bildschirm heißt es **„Einladungslink"** bzw. **„Link zum Zurücksetzen"**.
Die Karte heißt **„Meine Sitzungen"** — „Sitzung" ist das Wort des Projekts
seit 0.8.0 und **kein zwölfter Vokabeleintrag**.

### Q. Die Formatnummer? **Bleibt bei 10 — die Frage ist gestellt und beantwortet.**

Token stehen nicht im Austauschformat, Sitzungen auch nicht. Beide sind
Betriebszustand, kein Bestand.

### R. Ein Migrationsabschnitt? **Nein — stattdessen die Probe selbst.**

Es gibt keinen Migrationsblock, also gibt es auch keinen Abschnitt dafür.
An seiner Stelle steht die Gruppe „Der Token: die Tabelle legt sich selbst an":
Tabelle von Hand entfernen, Server starten, sie ist wieder da — samt der
Gegenlage, dass eine **Spalte** nicht nachwächst. **Die Probe „Ein Sprung von
0.8.20 fährt ALLE Migrationen in einem Start" ist NICHT erweitert worden**, weil
keine dazugekommen ist.

---

## 3. Über den Auftrag hinaus — eine Entscheidung, die im Konzeptpapier fehlt

**Beim Einlösen fallen auch alle ÜBRIGEN offenen Links desselben Zugangs.**

Das Konzeptpapier sagt „einmal gültig" und meint damit den einen Link. Läge
noch ein älterer in einem fremden Verlauf, setzte er hinterher **ein zweites
Mal** ein Passwort — „einmal gültig" wäre dann nur für je einen Link wahr, nicht
für den Vorgang. Gebaut ist deshalb: das Einlösen verbraucht den einen und
**löscht** alle anderen offenen desselben Benutzers, in derselben Transaktion.

**Dieselbe Frage am Sperren und am Entfernen**, und dieselbe Antwort: ein
offener Link, der eine frische Sperre überlebte, wäre ein Weg an ihr vorbei.
`setzeStatus()` und `entferneZugang()` räumen sie deshalb ausdrücklich mit weg
— die Kaskade an `tokens.user_id` greift dort nie, weil die Zeile als Grabstein
stehen bleibt.

**Und die öffentliche Adresse wird gar nicht gebraucht.** Das Konzeptpapier
(Abschnitt 11) verlangt für Stufe I eine Einstellung dafür und verbietet
ausdrücklich, sie aus dem `Host`-Kopf abzuleiten. In dieser Stufe stellt sich
die Frage **nicht**: der Server gibt nur den Token heraus, die vollständige
Adresse baut der Browser des Admins aus `location` — er steht ja bereits an der
richtigen.

---

## 4. Befunde beim Bauen

### A. Der Prüfstand hat sich zweimal geirrt, nicht der Code

Zwei Prüfungen sind beim ersten Lauf rot geworden, und **beide Male lag es an
der Prüfung**:

* **„beim Einlösen fallen alle Sitzungen"** — erwartet waren null, geblieben
  ist **eine**. Das ist richtig so: erst fallen alle, dann entsteht die des
  Einlösenden, denn das Einlösen meldet gleich mit an. Die Prüfung zählt jetzt
  nicht mehr die Zeilen, sondern sieht nach, dass die **beiden vorbereiteten**
  weg sind und eine **neue** dasteht. *An der Zahl allein wäre „die alten sind
  weg und eine neue steht da" von „eine alte ist stehengeblieben" nicht zu
  unterscheiden.*
* **Die Schwelle der Bremse** — erwartet war die Sperre ab dem zehnten
  Versuch, sie kommt ab dem **elften**. `checkThrottle` liest den Zähler,
  **bevor** `noteFailure` ihn hochzählt; erreicht ist die harte Schwelle also
  erst *nach* dem zehnten. Genau so verhält sich die Anmelderoute seit 0.8.0
  auch. Neuer Stolperstein, siehe unten.

### B. Ein Rückbau, der die ganze Tabelle nimmt, reißt den Lauf ab

`DROP` der Tabelle in der DDL lässt schon `require('./auth')` scheitern: die
`DELETE`-Anweisung für das Aufräumen wird beim Laden des Moduls vorbereitet.
Der Lauf nennt dann **keinen einzigen Namen**. Das ist genau der Fall aus
**Stolperstein 76** — er steht als **Tragweite**-Probe in der Tabelle, und
daneben stehen zwei **enge** Proben, die den Ort belegen: der Index und eine
einzelne Spalte.

### C. Eine Gegenprobe blieb stumm — und das war der Beleg, nicht der Fehler

Der Rückbau „der Rückfall auf `BLINDWERT` fällt weg" hat **nichts** rot
gemacht. Der Grund ist keiner zum Ärgern: `pruefePasswort()` weist einen leeren
Hash schon **am Format** ab. Die Sperre steht also an **zwei** unabhängigen
Stellen, und **Stolperstein 51 und 53 verlangen dann, dass die Gegenprobe beide
zugleich zurückbaut**. Genau das ist die zweite Probe daneben (`GP15b`) — und
die macht die Reihe namentlich rot. *Die stumme Probe ist deshalb in der
Tabelle geblieben: sie belegt, dass es zwei Stellen sind.*

### D. Die Art `selbstbezug` musste verallgemeinert werden

Der Wächter über den Quelltext prüfte bei dieser Art bisher auf den **Namen
einer Funktion** (`aendereZugang(req.benutzer.id`) — es gab genau eine solche
Route. Jetzt sind es drei, und die gemeinsame Regel ist eine andere: **der
Benutzer kommt aus `req.benutzer` und nie aus der Adresse.** Geprüft werden
seitdem **beide Hälften** — dass `req.benutzer.id` dasteht *und* dass die
Nummer nicht aus `req.params` kommt; `req.params.kennung` ist ausgenommen, das
ist die Kennung der Sitzung und wird gegen die eigenen Zeilen aufgelöst. Drei
eigene Gegenproben stehen daneben.

Das ist die Form von **Stolperstein 74**: wird ein Endpunkt erweitert, sind die
Prüfungen der Vorgängerversion die ersten Betroffenen.

### E. Die Gegenproben haben vier Fehler im Prüfstand gefunden

**Das ist ihr eigentlicher Zweck, und diesmal hat er sich vierfach ausgezahlt.**
Keiner der vier lag im gebauten Code — alle vier lagen in den Prüfungen, und
ohne die Gegenproben wären alle vier grün geblieben.

**1. Eine Prüfung prüfte die Funktion statt der Aufrufstelle.** „Der Start
räumt sie weg" rief `raeumeTokensAuf()` in einem kurzen Lauf **selbst** auf.
Der Rückbau, der den Aufruf aus `server.js` entfernte, blieb deshalb
**vollständig stumm**. Jetzt läuft die Prüfung gegen einen **echten
Serverstart**, mit einer uralten und einer frischen Zeile daneben — sonst
belegte sie nur, dass überhaupt gelöscht wird, nicht dass die Schwelle greift.
*Zwei Aufrufstellen sind zwei Stellen; wer die gerufene Funktion prüft, prüft
keine von beiden.*

**2. Eine Lage war über die Schnittstelle gar nicht herstellbar.** Der Rückbau
der Statusfrage in `pruefeToken` machte **nichts** rot. Der Grund: das Sperren
räumt die offenen Links selbst mit weg, und `erzeugeToken()` legt an einem
nicht-aktiven Zugang keinen an — die Klemme ist eine **zweite Schicht**, und
die Prüflage erreichte sie nie. Jetzt werden die beiden Zeilen (gesperrt und
Grabstein) **von Hand** in die Tabelle gesetzt, samt der Nachschau, dass sie
wirklich dort liegen. Aus fünf Absagen sind damit **sechs** geworden.

**3. Eine Prüfzeile riss den Lauf ab, statt rot zu werden.** Beim Rückbau von
„alle anderen beenden" fiel die eigene Sitzung mit; `GET /api/sessions`
antwortete mit 401, und der Zugriff auf `.sitzungen.length` beendete den
**ganzen Lauf** — Stolperstein 103 in Reinform. Jede Lesestelle der beiden
Sitzungsgruppen geht jetzt durch einen Abfänger.

**4. Eine Portbasis lag auf einem gesperrten Port.** Der Server der
Token-Gruppe stand auf Basis 5960, und eine Basis deckt sechzig Nummern —
**5960 bis 6019 enthält die 6000**, und die wählt `fetch()` gar nicht erst an
(X11, Sperrliste der Fetch-Spezifikation). Der Server lief und meldete es auch;
die Bereitschaftsprüfung kam nur nicht an ihn heran. Die beiden Basen dieser
Runde liegen jetzt bei **4680** und **4740**, und die Portversätze des
Gegenprobentreibers sind **ausgerechnet** statt gewählt. Stolperstein 64 hat
den Fall vorhergesagt; er stand nur nicht in der Rechnung.

**Und ein fünfter Fund daneben, in den Dokumenten:** der Sprachwächter hat in
`Doku/Changelog.md` und `README.md` dreimal `Rückschritt` gefunden, wo
`Downgrade` stehen muss — geschrieben in dieser Runde, gefunden noch in
derselben. *Der Wächter greift auch an den Papieren, die zur Runde gehören.*

**Und gleich noch einmal an diesem Absatz:** in seiner ersten Fassung stand das
Wort hier ohne Backticks — und der Wächter hat den **Bericht über den Fund**
gefunden. Er steht jetzt zitiert, denn genau dafür überspringt der Wächter
Backticks: *ein zitiertes Wort ist keine Prosa.* Dieselbe Überlegung, aus der
`Auftrag_*`-Dateien ganz ausgenommen sind — ein Wächter, der seine eigene
Vorschrift anmeckert, wird abgeschaltet.

### F. Ein Befund in den Dokumenten, nicht im Code

**`Doku/Projektstand_Kriterion_0_8_71.md` war beschädigt.** Eine globale
Ersetzung `undefined` → `1b03fabf` (der Fingerprint von 0.8.71) hatte **vier
Stolpersteine** getroffen — **63**, **81**, **103** und **118** —, in denen das
Wort `undefined` fachlich vorkommt („sonst ist sie `undefined`", „`liste[0]` ist
`undefined`", „`document` ist dann `undefined`"). Das Wort stand im ganzen
Papier nicht mehr. **Berichtigt in dieser Runde.** Konzeptpapier und
Änderungsprotokoll 0.8.71 waren nicht betroffen.

---

## 5. Neue Stolpersteine

**Befund vorweg: der Auftrag nennt 123 als nächste Nummer — die ist mit
0.8.71 bereits vergeben** („Eine Aussage über die Welt draußen trägt nur,
solange die Einhängung sie spiegelt“). Die Zählung setzt deshalb bei
**124** fort.

124. **Eine Schwelle wird gelesen, bevor sie erhöht wird.** `checkThrottle`
     fragt den Zählerstand ab, `noteFailure` zählt danach hoch — die harte
     Schwelle von zehn ist deshalb erst **nach** dem zehnten Fehlversuch
     erreicht, und gesperrt wird ab dem **elften**. Eine Grenzprüfung, die den
     Übergang beim zehnten erwartet, ist rot, ohne dass am Code etwas falsch
     wäre. *Wer eine Schwelle prüft, prüft den Übergang und zählt vorher nach,
     an welcher Stelle der Zähler steht.*

125. **Eine Regel, die Zeilen räumt, und eine Handlung, die eine anlegt,
     hinterlassen genau eine.** „Beim Einlösen fallen ALLE Sitzungen dieses
     Benutzers" und „wer einlöst, ist damit angemeldet" gelten beide — was
     danach dasteht, ist **eine** Zeile, nicht keine. Eine Prüfung auf die
     **Zahl** kann „die alten sind weg und eine neue steht da" nicht von „eine
     alte ist stehengeblieben" unterscheiden. *Wo geräumt und angelegt wird,
     prüft man die IDENTITÄT der Zeilen, nicht ihre Anzahl.* Verwandt mit 90,
     aber eigenständig: dort erstarrt der Mock, hier zählt die Prüfung das
     Falsche.

126. **Eine Prüfung, die die gerufene Funktion aufruft, prüft keine ihrer
     Aufrufstellen.** „Beim Start wird aufgeräumt" lief als kurzer Lauf, der
     `raeumeTokensAuf()` **selbst** rief — und blieb grün, als der Aufruf aus
     `server.js` verschwand. *Wo eine Funktion an zwei Stellen gerufen wird,
     läuft die Prüfung über den Weg, den auch der Betrieb nimmt.* Verwandt mit
     53, aber eigenständig: dort deckt eine Stelle die andere zu, hier wird gar
     keine von beiden angesehen.

127. **Eine Portbasis deckt sechzig Nummern, und einige davon wählt `fetch()`
     nicht an.** 5960 deckt 5960 bis 6019 — und **6000 ist X11** und steht auf
     der Sperrliste der Fetch-Spezifikation; ebenso 6665–6669 und 6697. Der
     Server läuft und meldet es auch, nur die Bereitschaftsprüfung kommt nie an
     ihn heran, und der Lauf reißt ab. *Der Abstand zu den gesperrten Nummern
     wird ausgerechnet, nicht geschätzt.*

---

## 6. Gegenprobentabelle

**34 Gegenproben, jede in einer KOPIE des Arbeitsbaums** (Stolperstein 100);
der Treiber beendet nach jedem Lauf die ganze **Prozessgruppe** (Stolperstein
122) und belegt vor jedem Deuten per `diff`, dass der Quelltext wirklich der
zurückgebaute ist. Gefahren wurden sie in **vier Spuren nebeneinander**, jede
mit eigenem Portversatz — die Versätze sind ausgerechnet und nicht gewählt,
siehe Stolperstein 127.

**Zwei Namen sind aus der Tabelle genommen, und beide gehören genannt statt
verschwiegen** — sie sind Rauschen des Treibers, nicht Wirkung eines Rückbaus:

* `Die Dokumente ebenso` (der Sprachwächter) stand in sechzehn Läufen. Die
  Kopien entstanden, bevor das zitierte Wort in diesem Protokoll berichtigt
  war — siehe Abschnitt 4 E. Der Lauf am Arbeitsbaum ist grün.
* `Eine Änderung an public/app.js ändert ihn` (der Fingerprint) stand in zwei
  von vierunddreißig Läufen. Unter **vier** gleichzeitigen Prüfständen wird die
  Bereitschaftsprüfung eines der vielen Kindserver knapp; am Arbeitsbaum und in
  jedem Einzellauf ist die Prüfung grün.

| # | Rückbau | Rot geworden |
|---|---|---|
| GP01 | Tragweite: die Tabelle tokens ganz weg | **Lauf abgerissen** — kein einziger Name (Stolperstein 76) |
| GP02 | Ort: der Index auf tokens.user_id weg | `Und den Index auf den Benutzer, ebenfalls ohne Migration` |
| GP03 | Ort: die Spalte created_at weg | `Sie traegt alle sechs Spalten` |
| GP04 | die Frist ist nicht mehr sieben Tage | `Und sie nennt die Frist von sieben Tagen`<br>`Und er liegt rund sieben Tage voraus` |
| GP05 | der Ablauf wird beim Nachschlagen nicht geprueft | `Eine Sekunde nach Ablauf traegt er nicht mehr`<br>`Und einloesen laesst er sich erst recht nicht`<br>`doras Passwort steht danach unveraendert`<br>`Das Oeffnen der Karte raeumt sie weg -- zweite Aufrufstelle`<br>… und 7 weitere |
| GP06 | einmal gueltig faellt weg | `Derselbe Link ein zweites Mal gelingt NICHT`<br>`Und das erste Passwort steht unveraendert`<br>`Auch das Pruefen weist ihn danach ab` |
| GP07 | gespeichert wird der Klartext statt des Hashes | `Der Link fuehrt zum Formular`<br>`Und das Formular weiss, dass noch kein Passwort dasteht`<br>`Der Mindestwert kommt vom Server, nicht aus der Oberflaeche`<br>`Ein zu kurzes Passwort wird auch ueber den Link abgewiesen`<br>… und 37 weitere |
| GP08 | die uebrigen offenen Token fallen nicht mit | `Der ANDERE offene Link faellt mit`<br>`Und er steht auch nicht mehr in der Tabelle` |
| GP09 | die Sitzungen fallen beim Einloesen nicht | `Ernas erste Sitzung wird danach WIRKLICH abgewiesen`<br>`Und ihre zweite ebenso`<br>`In der Tabelle steht genau eine Sitzung von erna -- die frische` |
| GP10 | ein gesperrter Zugang kommt ueber den Link doch herein | `Abgewiesen wird: zu einem gesperrten Zugang`<br>`Abgewiesen wird: zu einem Grabstein`<br>`Und alle sechs Absagen sind WORTGLEICH`<br>`Auch der Statuscode ist derselbe` |
| GP11 | die Absage verraet den Grund | `Und alle sechs Absagen sind WORTGLEICH` |
| GP12 | die Bremse steht nicht vor dem Pruefen | `Ab dem elften schlaegt die Bremse zu -- 429 statt 400`<br>`Und der GUELTIGE Link kommt jetzt auch nicht mehr durch`<br>`Und die Sperre nennt die verbleibende Zeit` |
| GP13 | die Rechteklemme am Einladen faellt weg | `Ein Admin kommt nicht an seinesgleichen`<br>`Und dabei wurde nichts geschrieben: Ein Admin kommt nicht an seinesgleichen`<br>`Und erst recht nicht an die Eigentuemerin`<br>`Und dabei wurde nichts geschrieben: Und erst recht nicht an die Eigentuemerin`<br>… und 3 weitere |
| GP14 | ohne Passwort wird nicht mehr ausdruecklich verlangt | `Leerer Benutzername wird abgewiesen`<br>`Passwort unter zehn Zeichen wird abgewiesen`<br>`Die Begruendung nennt die Mindestlaenge`<br>`Ein abgewiesener Versuch legt nichts an`<br>… und 5 weitere |
| GP15a | nur der Rueckfall auf BLINDWERT weg (STUMM erwartet) | **stumm** — siehe Abschnitt 4 |
| GP15b | BEIDE Stellen zugleich zurueckgebaut | `Die Anmeldung scheitert mit dem leeren Passwort`<br>`Die Anmeldung scheitert mit einem Leerzeichen Passwort`<br>`Die Anmeldung scheitert mit irgendeinem Passwort`<br>`Die Anmeldung scheitert mit dem Wert aus dem Feld Passwort`<br>… und 2 weitere |
| GP16 | Sperren nimmt die offenen Token nicht mit | `Sperren nimmt den offenen Link mit` |
| GP17 | Entfernen nimmt die offenen Token nicht mit | `Entfernen nimmt den offenen Link mit` |
| GP18 | die zweite Aufrufstelle des Aufraeumens weg | `Das Oeffnen der Karte raeumt sie weg -- zweite Aufrufstelle` |
| GP19 | die erste Aufrufstelle des Aufraeumens weg | `Der Start raeumt die uralte weg -- erste Aufrufstelle` |
| GP20 | die Sitzungsliste ist nicht auf den eigenen begrenzt | `Es sind genau die zwei eigenen`<br>`Keine fremde Kennung kommt durch`<br>`Und carla sieht ihrerseits nur ihre beiden`<br>`Die Liste zeigt danach nur noch die eine` |
| GP21 | jede Sitzung gilt als die eigene | `Genau eine der beiden ist als die eigene markiert`<br>`Aus der anderen Sitzung gefragt, ist die andere markiert` |
| GP22 | eine fremde Sitzung laesst sich beenden | `Eine fremde Anmeldung laesst sich nicht beenden`<br>`Und carlas Sitzung traegt weiter`<br>`Und carlas beide stehen unveraendert da` |
| GP23 | alle anderen beenden nimmt die eigene mit | `Ihre andere Sitzung faellt`<br>`Ein schon vergebener Name wird verstaendlich abgewiesen`<br>`Alle anderen lassen sich in einem Zug beenden`<br>`Die eigene faellt dabei NICHT mit`<br>… und 6 weitere |
| GP24 | die Kennung ist der Token selbst | `Eine Änderung an pruefung.js lässt ihn unberührt`<br>`Und es sind wirklich annas beide`<br>`Und carla sieht ihrerseits nur ihre beiden`<br>`Der Sitzungstoken steht in keiner Antwort`<br>… und 3 weitere |
| GP25 | die Karte Meine Sitzungen heisst anders | `Die Eigentuemerin sieht alle sechzehn Karten`<br>`Ein gewoehnlicher Benutzer sieht sieben -- vier persoenliche, drei zum Nachsehen`<br>`Die Karte "Meine Sitzungen" steht jedem, auch ohne Rolle`<br>`Die Karte steht bei der Eigentuemerin`<br>… und 22 weitere |
| GP26 | der Grabstein traegt noch kein Passwort | `Aber sie traegt es NICHT` |
| GP27 | die Warnung am Link faellt weg | `Die Warnung steht daneben, nicht nur im Dokument` |
| GP28 | der Schluessel steht vor dem Link | `Der Link steht VOR dem Schluessel` |
| GP29 | der Schluessel wandert in die Adresse | `Der Aufruf mit einem Link fragt den Server nach ihm`<br>`Und zwar im Rumpf, nicht in der Adresse`<br>`Sie begruesst mit dem Namen aus der Antwort`<br>`Und sie sagt, dass ein Passwort zu waehlen ist`<br>… und 6 weitere |
| GP30 | eine Route fehlt in F_ROUTEN | `Der Pruefstand kennt jede schreibende Route`<br>`Und es sind jetzt genau 56 schreibende Routen` |
| GP31 | der Cookiename steht abgeschrieben in server.js | `Der Cookiename steht in keiner davon abgeschrieben` |
| GP32 | am Bildschirm steht das Wort Token | `Eine Änderung an pruefung.js lässt ihn unberührt`<br>`Am Bildschirm heisst es Link und nicht anders` |
| GP33 | die eigene Sitzung laesst sich ueber die Kennung beenden | `Die eigene geht ueber Abmelden, nicht ueber diesen Weg`<br>`Und sie traegt danach weiter`<br>`Alle anderen lassen sich in einem Zug beenden`<br>`Die eigene faellt dabei NICHT mit`<br>… und 2 weitere |

**Zwei Sonderfälle, beide erwartet und beide erklärt:**

* **GP01 reißt den Lauf ab**, statt Namen zu nennen. Der Rückbau nimmt die
  ganze Tabelle, und `auth.js` bereitet seine `DELETE`-Anweisung beim Laden des
  Moduls vor — `require` scheitert, bevor die erste Prüfung läuft. Das ist
  genau **Stolperstein 76**: ist ein Rückbau so grundlegend, gehört eine
  zweite, engere Gegenprobe daneben. Das sind **GP02** und **GP03** — die eine
  belegt die Tragweite, die anderen den Ort.
* **GP15a bleibt stumm**, und das ist der Beleg, nicht der Fehler: der leere
  Hash wird an **zwei** unabhängigen Stellen abgewiesen. Stolperstein 51 und 53
  verlangen dann eine Gegenprobe, die **beide zugleich** zurückbaut — das ist
  **GP15b**, und die macht die ganze Reihe namentlich rot.

---

## 7. Prüfungszahlen

| | |
|---|---|
| Vorher (0.8.71) | 2398 |
| Nachher (0.8.80) | 2650 |
| Neu | 252 |
| Gegenproben | 34 |

**Vierzehn neue Gruppen, 239 Prüfungen darin; die übrigen 13 sind
Erweiterungen vorhandener Gruppen** (`F_ROUTEN` samt Zahl und Arten, die drei
Gegenproben zur Art `selbstbezug`, der Cookiewächter, der Wortwächter, die
Kartenzahl im Systembereich, die Versionsnummer).

| Gruppe | Prüfungen |
|---|---|
| Der Token: die Tabelle legt sich selbst an | 9 |
| Der Token: der Rundlauf | 18 |
| Der Token: gespeichert ist der Hash, nicht der Schlüssel | 6 |
| Der Token: die sieben Tage an beiden Seiten | 14 |
| Der Token: die Absage sieht immer gleich aus | 15 |
| Der Token: beim Einlösen fällt alles Offene | 17 |
| Der Zugang ohne Passwort kann sich nicht anmelden | 14 |
| Der Token: die Rechte am Einladen | 27 |
| Der Token: die Bremse greift vor der Anmeldung | 8 |
| Meine Sitzungen: nur die eigenen | 11 |
| Meine Sitzungen: die eigene ist markiert | 17 |
| Die Einladungsseite in der Oberfläche | 26 |
| Meine Sitzungen in der Oberfläche | 30 |
| Der Einladungslink in der Karte Zugänge | 27 |

**Ein Migrationsabschnitt ist NICHT dazugekommen** — es gibt keinen
Migrationsblock. An seiner Stelle steht die Probe selbst (Gruppe 1). Die Probe
„Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start" ist
**unverändert**.

---

## 8. Was ausdrücklich nicht passiert ist

* **Kein Mailversand.** Kein `nodemailer`, keine Absenderadresse, kein Port,
  keine Einstellung dafür.
* **Keine Selbstanmeldung.** Der Schalter `registrierung` ist nicht angefasst.
* **Kein Deckel auf offene Anfragen, keine eigene Zeitsperre für Anfragen** —
  beides ist Missbrauchsschutz für die Selbstanmeldung.
* **Kein `UNIQUE` auf `users.email`.** Die Adresse wird in dieser Runde nicht
  gebraucht; der Link geht von Hand.
* **Papierkorb und Sicherung sind unberührt.** Auch nicht „bei der
  Gelegenheit".
* **`zugang.js` ist unberührt.** Es ist der Notweg, wenn niemand mehr
  hereinkommt, und hat in 0.8.0 ausdrücklich den Einmalcode dieser Stufe
  ersetzt.
* **Kein Migrationsblock, kein sechster.** Es bleibt bei fünf.
* **Keine neue Abhängigkeit.** `crypto` ist in Node eingebaut.
* **Kein neuer Vokabeleintrag.** Die elf bleiben elf.
* **Die Formatnummer bleibt bei 10.**
* **Die Kennwerte der Anmeldebremse sind unangetastet** — angewandt ist sie auf
  eine neue Route, heruntergeschraubt ist nichts.
* **Farbschema, Verschlüsselungsmodell, `katalog.sqlite`, `HINTER_PROXY`, die
  Content-Security-Policy, die Sortierung der Übersicht und das Austauschformat
  sind nicht angefasst.**

---

## 9. Offen geblieben

* **Die Karte „Meine Sitzungen" kann kein Gerät nennen.** Bewusst getragen und
  offen beschriftet. Käme je eine Spalte für den Browserkopf dazu, wäre das
  eine Datenschutzentscheidung und gehört in eine eigene Runde.
* **`tokens.created_at` wird heute von keinem Code gelesen.** Sie ist der
  Eintrag, den das Sicherheitsprotokoll aus 0.8.90 führen will — und aus
  `ablauf` minus sieben Tage zurückzurechnen wäre ab dem Tag falsch, an dem die
  Frist wechselt.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird weiterhin bei jedem
  Seitenaufbau abgefragt.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 bleibt offen.
* **„Abgelehnt mit Datum und Begründung"** (Ideenpapier 4.2) bleibt offen.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben.
