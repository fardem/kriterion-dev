# Roadmap nach 0.8.6

Verteilt die Punkte aus `Ideen_und_Vorschlaege.md` und
`Konzept_Gewichtung_Bewertungskriterien.md` auf Versionen, ergänzt um
Sicherheitspunkte und Funktionsideen, die dort noch nicht standen.

Sprache wie in den beiden anderen Papieren: gewöhnliches IT-Deutsch.

**Das hier ist ein Vorschlag, kein Beschluss.** Der verbindliche Stufenplan
steht in `Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_6.md`, Teil III. Was hier
übernommen wird, wandert dorthin.

---

## 1. Was die Verteilung leitet

Fünf Regeln, aus denen sich die Reihenfolge unten ergibt:

1. **Werkzeug vor Sicherheit vor Funktion.** Erst das, was jede spätere Runde
   absichert (Prüflauf bei jedem Push, festgenagelte Abhängigkeiten), dann die
   Löcher, dann Neues.
2. **Was kein Schema anfasst, darf dazwischen.** Eine Runde ohne
   Datenbankänderung lässt sich einspielen und im Zweifel zurücknehmen, ohne
   dass jemand seinen Bestand sichern muss. Solche Runden sind billig und
   gehören nach vorn.
3. **Formatnummern bündeln.** Jede Erhöhung kostet einen Migrationsblock und
   eine Runde Import-Prüfungen. Zwei Vorhaben, die beide das Exportformat
   anfassen, gehören entweder zusammen — oder sauber getrennt, aber nie
   halb.
4. **Jede Stufe muss in einem Durchgang abzuarbeiten sein.** Die vorhandene
   Regel, und sie schlägt Regel 3.
5. **Sicherheit wird nicht angekündigt und dann verschoben.** Ein bekannter,
   reproduzierter Befund, der drei Versionen hinter einer Funktionsstufe
   wartet, ist eine Entscheidung — dann soll sie ausdrücklich getroffen
   werden.

---

## 2. Der Vorschlag

Drei Bänder laufen nebeneinander:

- **Band W — Werkzeug und Sicherheit** (neu, aus dem Ideenpapier)
- **Band U — der laufende Umbau** (G4, H, I — unverändert aus dem Konzept)
- **Band F — Funktion** (Gewichtung und die Vorschläge aus Abschnitt 4)

Und so würde ich sie verschränken:

| Version | Name | Band | Inhalt | Schema | Format |
|---|---|---|---|---|---|
| **0.8.7** | Werkzeug | W | Lockfile, `npm ci`, `sharp`-Sprung, Versionsabdruck, CI, Prüfstand in Gruppen | — | — |
| **0.8.8** | Die Schotten dicht | W | SVG als Foto, `X-Forwarded-For`, `Secure`-Cookie, CSP und drei weitere Header, Fehler-Handler, SIGTERM, Healthcheck, Index auf `sessions.user_id` | — | — |
| **0.8.9** | G4 — Links bekommen Verfasser | U | wie im Konzept beschrieben | ja | 6 → 7 |
| **0.9.0** | Gewichtung der Kriterien | F | wie im Konzeptpapier dazu | ja | 7 → 8 |
| **0.9.1** | Was ist offen, was ist neu | F | Ansicht „Offen", Filter „Neu seit …" | — | — |
| **0.9.2** | Sicherung und Papierkorb | F | `VACUUM INTO` auf Knopfdruck, Papierkorb, einzelnen Eintrag exportieren | ja | — |
| **0.9.3** | Stufe H — Tokens | U | Einladung und Rücksetzung, dazu „Meine Sitzungen" | ja | — |
| **0.9.4** | Schwere Eingriffe | W | Re-Authentifizierung, Sicherheitsprotokoll, Schlüsselwechsel | ja | — |
| **0.9.5** | Stufe I — Mail und Selbstanmeldung | U | wie im Konzept | ja | — |
| **0.9.6** | Zwei-Faktor | W | TOTP, Wiederherstellungscodes | ja | — |
| **0.9.7** | Suche und Bestand | F | FTS5, gespeicherte Ansichten, Duplikate finden und zusammenführen | ja | — |
| **1.0.0** | Bereinigung und Zusage | — | Umstiegscode raus, Absage an zu alte Datenbanken, Vorgabewerte, Tastaturbedienung, Abwärtskompatibilität wird zugesichert | — | — |

**Das sind sieben Versionen mehr als bisher geplant.** Der bisherige Plan
lautete G4 → H → I → Sicherung → 1.0. Er bleibt darin vollständig enthalten;
alles Zusätzliche kommt aus dem Ideenpapier. Wenn das zu viel ist, steht in
Abschnitt 5 ein kürzerer Weg.

### Die eine Abweichung vom bisherigen Plan, die begründet gehört

**G4 rutscht von 0.8.7 auf 0.8.9.** Vor ihm stehen zwei Runden **ohne
Schemaänderung**, die zusammen etwa so viel Arbeit sind wie G4 allein.

Der Grund ist Regel 1 und 2: Die beiden Runden sichern alles ab, was danach
kommt. Nach 0.8.7 läuft der Prüfstand bei jedem Push und `npm audit` meldet
neue Verwundbarkeiten von selbst — G4 wird dadurch sicherer gebaut als heute.
Und beide Runden fassen die Datenbank nicht an, lassen sich also einspielen,
ohne dass vorher jemand `./data` sichern muss.

**Wenn die Anlage schon von außen erreichbar ist, würde ich 0.8.7 und 0.8.8
tauschen.** Dann zuerst die Löcher, dann das Werkzeug. Für eine Anlage im
eigenen Netz ist die Reihenfolge oben die bessere.

### Warum 0.9.0 und nicht 0.8.10

Die Gewichtung ändert eine Zahl, die überall steht. Das ist keine
Nacharbeit an einer Stelle, sondern eine Aussage über den ganzen Bestand —
und der Sprung auf 0.9.0 sagt das. Versionsnummern sind hier ohnehin Aussagen
und keine Kosten.

---

## 3. Sicherheit — über die sieben Befunde hinaus

### 3.0 Was ich geprüft habe und was schon richtig ist

Damit klar ist, worauf die Empfehlungen aufsetzen. Das Folgende habe ich
geöffnet und für **korrekt gebaut** befunden:

- **scrypt mit N=16384, r=8, p=1, keylen=64.** Solide Kennwerte, und die
  Kennwerte stehen **im gespeicherten Wert** — sie lassen sich später anheben,
  ohne alte Einträge unlesbar zu machen. Das ist die Bauform, die die meisten
  Projekte erst nach dem ersten Anheben lernen.
- **`crypto.timingSafeEqual`** beim Vergleich, kein `===`.
- **Ein Blindwert gegen Zeitmessung am Benutzernamen.** Ein unbekannter Name
  wird gegen einen Wegwerf-Hash gerechnet, damit er nicht messbar schneller
  abgewiesen wird als ein falsches Passwort. Daran denkt fast niemand.
- **Sitzungstoken: 32 Zufallsbytes** aus `crypto.randomBytes`, als Hex. Keine
  ableitbare Kennung, keine Zeitkomponente.
- **Die Schlüsseldatei wird mit `mode: 0o600` geschrieben.**
- **Die Einrichtung ist gegen ein Wettrennen dicht.** `legeErstenBenutzerAn()`
  schreibt mit `INSERT … SELECT … WHERE NOT EXISTS (SELECT 1 FROM users)` und
  prüft `r.changes === 0`. Zwei gleichzeitige Aufrufe können also nicht beide
  einen Zugang anlegen — die Prüfung liegt in derselben Anweisung wie das
  Schreiben, nicht davor. Das ist genau der Fehler, den ich gesucht und **nicht
  gefunden** habe.
- **Kein SQL-Einschleusen.** Zwei Stellen bauen SQL per Zeichenkette
  zusammen; beide setzen ausschließlich fest verdrahtete Spaltennamen bzw. eine
  Modulkonstante ein, Werte laufen überall gebunden.
- **`SameSite=Lax` und `HttpOnly`** am Cookie — Lax deckt die schreibenden
  Routen gegen fremde Herkunft ab.

Die Grundlagen stimmen also. Was folgt, ist die nächste Ebene.

### 3.1 Zwei-Faktor mit TOTP — der größte einzelne Sprung

**Warum gerade hier.** Kriterion schützt heute alles mit einem einzigen
Faktor: einem Passwort von mindestens zehn Zeichen. Wird eine Anlage über
einen Reverse Proxy nach außen gegeben — was die README ausdrücklich vorsieht
—, steht dieses Passwort zwischen dem offenen Netz und dem gesamten,
entschlüsselten Bestand.

**Warum es zur Linie des Projekts passt, und zwar besser als fast alles
andere:** TOTP braucht **kein Netz**. Kein Dienst, kein Konto bei Dritten,
keine SMS. Es ist ein geteiltes Geheimnis und eine Uhr. Die Rechnung ist ein
HMAC-SHA1 über einen Zeitschritt — `crypto.createHmac` kann das, **ohne neue
Abhängigkeit**, genau wie scrypt schon ohne Bibliothek auskommt.

Das ist derselbe Satz, der über der E-Mail-Entscheidung steht, nur andersherum:
E-Mail ist Bequemlichkeit und darf ausfallen — TOTP ist Schutz und **fällt nie
aus**, weil es nichts gibt, das ausfallen könnte.

**Umfang, ehrlich:**

- `users` bekommt `totp_secret` und `totp_bestaetigt`.
- Eine zweite Stufe an der Anmeldung: erst Passwort, dann sechs Ziffern. Die
  Zwischenstufe braucht einen kurzlebigen Zustand — dafür gibt es ab Stufe H
  bereits Tokens.
- **Wiederherstellungscodes sind Pflicht, nicht Beiwerk.** Zehn Stück, nur als
  Hash gespeichert, jeder einmal gültig. Ohne sie sperrt ein verlorenes Handy
  jemanden endgültig aus — und der Notausgang wäre `zugang.js` auf dem Wirt,
  was bei einem gewöhnlichen Benutzer niemand will.
- **Kein QR-Code.** Ein QR-Encoder wäre eine Bibliothek oder 200 Zeilen für
  eine Bequemlichkeit. Stattdessen das Geheimnis als Base32 zum Abtippen und
  daneben die `otpauth://`-Zeile zum Kopieren. Passt zur Haltung „lieber
  abtippen als eine Abhängigkeit".
- Ein Fenster von ±1 Zeitschritt gegen ungenaue Uhren, und ein verbrauchter
  Zeitschritt darf nicht zweimal gelten.

**Deshalb steht es auf 0.9.6, nach H und I** — dort steht die
Token-Infrastruktur schon, und der Weg „Zugang verloren" ist dann gebaut.

### 3.2 Meine Sitzungen sehen und beenden

**Heute kann niemand sehen, wo er angemeldet ist.** `sessions` weiß es —
`created_at`, `last_seen` —, aber es gibt keinen Weg, das anzusehen, und keinen,
eine einzelne Sitzung zu beenden. Wer sein Handy im Zug liegen lässt, kann nur
das Passwort ändern (das beendet alle) oder hoffen.

**Vorschlag.** Die Karte „Zugang" bekommt eine Liste: angelegt am, zuletzt
gesehen, ungefähre Herkunft, dazu die Kennzeichnung, welche davon die
**aktuelle** ist. Je Zeile „beenden", darunter „alle anderen beenden".

`sessions` bekommt dafür zwei Spalten (`ip`, `agent`). Und dazu ein Satz, der
in die Oberfläche gehört: **die Angaben werden zum Wiedererkennen gespeichert,
nicht zum Auswerten** — es gibt keine Statistik darüber und keine Liste
fremder Sitzungen für den Admin. Das ist dieselbe Zurückhaltung, die schon
entschieden hat, dass eine Bewertung nicht sagt, wer sie abgegeben hat.

**Nebenbei, und unabhängig davon:** `sessions.user_id` hat **keinen Index**,
obwohl **fünf** Stellen danach suchen — jedes Sperren, jedes Entfernen, jeder
Passwortwechsel und die Kaskade an `users`. Der Primärschlüssel liegt auf
`token` und greift dafür nicht. Das ist wörtlich die Begründung, die an
`idx_item_pins_item` schon im Schema steht:

> Der Index ist keine Zierde: beim Löschen eines Eintrags sucht die Kaskade
> über `item_id`, und der Primärschlüssel greift nur von links.

Praktisch ist es bei einer kleinen Tabelle folgenlos — es ist eine
Konsistenzsache. **Und es kostet keinen Migrationsblock:**
`CREATE INDEX IF NOT EXISTS` wirkt anders als `ALTER TABLE ADD COLUMN` auch
auf eine bestehende Tabelle. Eine Zeile in der DDL, fertig. Deshalb steht es
oben in 0.8.8 und nicht bei 3.2.

### 3.3 Re-Authentifizierung für schwere Eingriffe

**Das Problem in einem Satz:** eine übernommene Sitzung des Eigentümers ist
**ein GET** vom vollständigen Bestand entfernt.

`GET /api/export` liefert alles — Einträge, Kommentare, Bewertungen,
Verfassernamen, auf Wunsch sämtliche Fotos. Keine erneute Abfrage, keine
Bremse, keine Spur.

**Das Projekt glaubt an dieses Prinzip bereits** — es wendet es nur nicht auf
die schweren Fälle an. In `aendereZugang()` steht:

> Das bisherige Passwort ist Pflicht — sonst genügte eine fremde offene
> Sitzung, um den Zugang zu übernehmen.

Genau dieser Satz gilt für Export, Import, Rollenvergabe und das Zurücksetzen
fremder Passwörter. Bei allen vieren genügt heute eine fremde offene Sitzung.

**Vorschlag.** Ein kurzer Zustand „gerade bestätigt" — das Passwort wird
erneut abgefragt, danach sind die schweren Wege fünf Minuten offen. Ein Feld
an der Sitzung, kein neuer Mechanismus.

Dahinter gehören: **Export, Import, Rolle vergeben, fremdes Passwort
zurücksetzen, Zugang entfernen, Schlüssel wechseln.** Ausdrücklich **nicht**:
Einträge löschen, Kommentare löschen, Kriterien verwalten. Die Grenze ist
nicht „gefährlich", sondern **„trifft die Anlage als Ganzes"** — dieselbe
Grenze, an der schon die Eigentümerrolle liegt.

### 3.4 Ein Sicherheitsprotokoll — und warum es kein Änderungsverlauf ist

**Heute hinterlässt ein erfolgreicher Einbruch keine Spur.** Wer sich mit einem
erratenen Passwort anmeldet, exportiert und wieder geht, ist nicht
unterscheidbar von einem normalen Arbeitstag. `last_login` wird überschrieben,
mehr gibt es nicht.

**Der Einwand liegt auf der Hand:** das Projekt hat sich gegen einen
Änderungsverlauf entschieden, und der Eingriffsvermerk am Kommentar ist
ausdrücklich die einzige Ausnahme.

**Der Einwand trifft nicht.** Die Entscheidung gegen den Änderungsverlauf ist
eine über **Inhalte** — sie sagt: eine Aussage soll nicht mit ihrer Geschichte
behaftet sein, und ein Admin soll nicht nachlesen können, wie oft jemand seinen
Kommentar umformuliert hat. Ein Sicherheitsprotokoll hält keine Inhalte fest.
Es hält fest, **wer wann Zugang hatte und wer die Anlage als Ganzes angefasst
hat** — Anmeldung, Fehlversuch, Sperre, Rollenwechsel, Zugang angelegt oder
entfernt, Export, Import, Schlüsselwechsel.

Kein Eintragstitel, kein Kommentartext, keine Bewertung. Die Trennlinie ist
dieselbe wie überall sonst: **was die Anlage betrifft, nicht was jemand
gesagt hat.**

**Vorschlag.** Eine Tabelle `protokoll`, nur angehängt, nie geändert. Eine
Karte im Systembereich für den Eigentümer. Ein Deckel — die letzten 5.000
Zeilen oder 180 Tage, was zuerst kommt —, damit sie nicht endlos wächst.
Und keine IP-Adresse ohne Not; der Benutzername und der Zeitpunkt reichen für
den Zweck.

### 3.5 Den Schlüssel wechseln können

**Heute gibt es keinen Weg.** Wenn der `ENCRYPTION_KEY` einmal in ein falsches
Backup geraten ist, in einer Chat-Nachricht steht oder auf einem verlorenen
Laptop lag, ist die einzige Antwort: exportieren, Anlage neu aufsetzen,
einspielen. Und der Export ist dabei die unverschlüsselte Zwischenstufe —
also genau der Moment, in dem alles offen liegt.

**Geprüft: es geht.** SQLCipher kann den Schlüssel im laufenden Betrieb
wechseln, und die verwendete Bibliothek gibt es durch:

```
angelegt mit altem Schluessel: Geheimer Bestand
rekey ausgefuehrt.
alter Schluessel oeffnet nicht mehr: file is not a database
neuer Schluessel liest:        Geheimer Bestand
integrity_check:               ok
```

**Vorschlag.** Karte „Schlüssel" im Systembereich, nur für den Eigentümer,
hinter der Re-Authentifizierung aus 3.3:

1. Neuen Schlüssel erzeugen und **zuerst anzeigen** — er muss in die `.env`,
   bevor irgendetwas geschrieben wird.
2. Bestätigen, dass er notiert ist.
3. `PRAGMA rekey`, danach `PRAGMA integrity_check`.
4. Die Anlage sagt anschließend deutlich: **ohne den neuen Wert in der `.env`
   startet der nächste Container nicht mehr.**

Der letzte Punkt ist der gefährliche, und er gehört groß und rot. Ein
Schlüsselwechsel ohne nachgezogene `.env` ist genau die Neustartschleife, die
die README beim falschen Schlüssel beschreibt.

### 3.6 Die übrigen Kopfzeilen — billig, gehören zu 0.8.8

Neben der CSP aus dem Ideenpapier, alle einzeilig:

| Kopfzeile | Wozu |
|---|---|
| `Referrer-Policy: same-origin` | keine internen Adressen an fremde Server, wenn doch einmal ein Verweis nach außen entsteht |
| `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` | schaltet ab, was die Anwendung nie braucht |
| `Cross-Origin-Opener-Policy: same-origin` | trennt das Fenster von allem, was es öffnet |
| `Strict-Transport-Security` | **nur** bei eingeschalteter Proxy-Einstellung — auf `http://<ip>:3100` gesetzt sperrt es die Anlage aus |
| `__Host-`-Präfix am Cookie | ebenfalls nur hinter HTTPS; verhindert, dass eine Nachbardomain den Cookie überschreibt. Der Projektname bleibt darin: `__Host-kriterion_session` |

Die letzten beiden hängen an derselben Einstellung wie `X-Forwarded-For` und
`Secure` — **eine Einstellung, fünf Wirkungen.**

### 3.7 Ein Wächter gegen die Klasse von Befund 2.1

Der Befund war nicht, dass jemand schlampig war — die Regel steht ausformuliert
im Kopf von `anhaenge.js`. Der Befund war, dass sie an einer Stelle nicht
angewandt wurde.

**Dagegen hilft kein Merksatz, sondern ein Wächter.** Der Prüfstand zählt
bereits Vorkommen im Quelltext (die Adminfrage). Dieselbe Bauform:

> Keine Zeile in `server.js` setzt `Content-Type` aus einem Wert, der aus der
> Datenbank kommt. Wer eine Datei ausliefert, ruft `anh.setzeKopfzeilen()`.

Diese eine Prüfung hätte Befund 2.1 nie entstehen lassen — und sie fängt den
nächsten dieser Art, den heute noch niemand gebaut hat. Sie gehört mit in
0.8.8, in dieselbe Runde wie die Berichtigung selbst.

---

## 4. Weitere Funktionsideen

Sechs, die im Ideenpapier noch nicht standen.

### 4.1 Volltextsuche mit FTS5 *(0.9.7)*

Im Ideenpapier stand nur „`searchText` raus, Such-Endpoint rein". Der saubere
Weg dafür heißt **FTS5** und steckt bereits in SQLite — keine neue
Abhängigkeit, kein zweiter Dienst.

Was es zusätzlich bringt: Wortstamm statt Teilzeichenkette (`Bohrer` findet
`Bohrers`), Wortgruppen in Anführungszeichen, `UND`/`ODER`, und eine
**Sortierung nach Trefferqualität** statt nach Änderungsdatum. Bei 500
Einträgen ist das der Unterschied zwischen „findet etwas" und „findet das
Richtige zuerst".

Die Tabelle wird aus den Inhalten befüllt und ist damit eine **Ableitung**,
keine zweite Wahrheit — sie lässt sich jederzeit verwerfen und neu aufbauen.
Genau die Bauform, die das Projekt an anderer Stelle schon bevorzugt.

### 4.2 Gespeicherte Ansichten *(0.9.7)*

Filter, Tags, Sortierung und Suchbegriff unter einem Namen ablegen:
„Ungetestet, Kategorie Werkzeug, nach Bewertung". Ein Klick stellt sie
wieder her.

**Persönlich, in `user_settings`, ohne Schemaänderung** — die Tabelle ist
Schlüssel/Wert, ein weiterer Schlüssel genügt. Und sie sortiert die gemeinsame
Liste nicht um, sondern setzt nur die Filter, die es ohnehin gibt. Dieselbe
Einordnung wie beim Favoritenfilter.

### 4.3 Fälligkeitsdatum an Aufgaben *(mit 0.9.2, wo ohnehin Schema angefasst wird)*

Eine Aufgabe hat heute zwei Zustände und keinen Zeitpunkt. Mit der Ansicht
„Offen" aus 0.9.1 wird ein Datum erst interessant: die Liste sortiert danach,
und Überfälliges steht oben.

Eine Spalte an `comments`, optional. **Keine Erinnerung, keine Nachricht** —
das Datum steht da und wird sortiert, mehr nicht. Alles andere setzte
Mailversand voraus und bräche „Bequemlichkeit ist nie Voraussetzung".

### 4.4 Einen einzelnen Eintrag exportieren *(0.9.2)*

Um eine Beurteilung weiterzugeben, ohne den ganzen Bestand aus der Hand zu
geben. Und um sie in eine andere Anlage zu übernehmen.

**Der Grund, warum es ausgerechnet in 0.9.2 gehört:** der Papierkorb braucht
sowieso eine Serialisierung *eines* Eintrags. Wer den Papierkorb baut, hat
diese Funktion fast fertig — sie danach separat zu bauen, hieße denselben Code
zweimal zu schreiben.

**Rechte:** anders als der vollständige Export darf das **jeder**. Ein
einzelner Eintrag ist kein Bestand, und sichtbar ist er für alle ohnehin.

### 4.5 Zwei Einträge zusammenführen *(0.9.7, zusammen mit der Duplikaterkennung)*

Die Duplikaterkennung findet, dass zwei Leute dieselbe Maschine angelegt
haben. Und dann? Heute: einen löschen und die Arbeit daran verlieren.

Zusammenführen heißt: Fotos, Dateien, Links, Kommentare, Testtage und
Bewertungen des einen wandern an den anderen, der leere bleibt als Grabstein
zurück oder verschwindet. **Nicht trivial** — bei den Bewertungen kollidiert
das `UNIQUE(item_id, criterion_id, user_id)`, wenn beide Einträge vom selben
Menschen bewertet wurden.

Und genau dort lauert **Stolperstein 18**: ein `INSERT OR REPLACE` würde die
verdrängte Zeile löschen und über die Kaskade mitnehmen, was daran hängt.
Richtig ist, den Fall zu **benennen** statt ihn aufzulösen: „Beide tragen eine
Bewertung von dir für ‚Verarbeitung'. Welche gilt?"

Deshalb: ein eigener Punkt, nicht ein Anhängsel der Duplikaterkennung.

### 4.6 Druckstylesheet *(jederzeit, kein Schema)*

Steht als „Ideen ohne Beschluss" im Projektstand, und ich halte es für
unterschätzt. Ein Bewertungsarchiv, aus dem man ein Blatt Papier ziehen kann —
Titel, Foto, Kriterien mit Werten, Testtage, Fazit — ist in einer Besprechung
etwas anderes wert als ein Bildschirm.

`@media print` in `style.css`: Kopfzeile weg, Bedienelemente weg, Blöcke
untereinander, Farben in Graustufen tragfähig. **Kein Server, kein Schema,
keine Route.** Die günstigste Funktion auf dieser ganzen Liste, und sie
passt in jede Runde, in der noch Platz ist.

---

## 5. Wenn das zu viel ist — der kurze Weg

Zwölf Versionen sind ein Programm für ein Jahr. Wer es kürzer will, hier die
Punkte, die ich **vor 1.0 nicht weglassen** würde:

| | Warum unverzichtbar |
|---|---|
| **0.8.7 Werkzeug** | ohne Lockfile ist jeder Build ein anderer; ohne CI läuft der Prüfstand nur, wenn jemand daran denkt |
| **0.8.8 Sicherheit** | zwei reproduzierte Löcher, beide klein zu schließen |
| **0.9.2 Sicherung** | ohne Sicherung auf Knopfdruck ist der einzige Rückweg ein Export, der bei Fotos am Speicher scheitert |
| **1.0.0 Bereinigung** | Umstiegscode raus und die Absage an zu alte Datenbanken — sonst läuft ein alter Bestand weiterhin wortlos in SQL-Fehler |

Alles andere ließe sich hinter 1.0 schieben, **ohne dass die Veröffentlichung
darunter leidet.** Das gilt ausdrücklich auch für die Gewichtung, so gern ich
sie sähe: „Für ein Sachgebiet, für eine Person, dafür vollständig
verschlüsselt" ist ein fertiges Produkt.

Umgekehrt gilt: **1.0 ohne 0.8.7 und 0.8.8 würde ich nicht veröffentlichen.**
Eine Veröffentlichung heißt fremde Installationen, und fremde Installationen
heißt, dass die Befunde 2.1 und 2.2 dann nicht mehr in einer Anlage stehen,
sondern in allen.

---

## 6. Was ich nicht in die Roadmap nehmen würde

- **Videos** — richtig zurückgestellt. Über einem Gigabyte scheidet die
  Datenbank aus, und der Export könnte sie nie enthalten.
- **Verschlüsselung je Benutzer** — ein Neubau, kein Anbau, und für ein
  selbstgehostetes System die falsche Abwägung.
- **PWA-Manifest** — im eigenen Netz, ohne Offline-Anspruch, bleibt davon das
  Icon auf dem Startbildschirm.
- **Kriteriengruppen je Kategorie** — die Antwort ist der Absatz in der README
  („eine Anlage ist ein Sachgebiet"), nicht eine Stufe. Siehe Ideenpapier 4.8.
- **Ein Framework im Frontend** — die Antwort auf zu lange Funktionen sind
  kürzere Funktionen.
- **Benachrichtigungen jeder Art** — sie setzen Mailversand voraus und würden
  aus einer Bequemlichkeit eine Voraussetzung machen.

---

## 7. Nächster Schritt

Wenn die Verteilung passt, wandert sie in die Stufentabelle des
Konzeptpapiers (Teil III) und die offenen Punkte in Abschnitt 10 und 11 des
Projektstands. Die drei Papiere im Ordner `Doku` bleiben dann wieder das,
was sie sein sollen: **eines für den Plan, eines für den Stand, eines je
Vorhaben.**
