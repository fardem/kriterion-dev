# Änderungsprotokoll 0.8.90 — „Schwere Eingriffe"

**Rohstoff für die Dokumentenpflege.** Was gebaut wurde je Datei, die
Abweichungen mit Begründung, die neuen Stolpersteine, die Gegenprobentabelle,
die Prüfungszahlen und was offen geblieben ist.

**0.8.90 ist KEINE Stufe des Mehrbenutzerbetriebs.** Der ist mit Stufe H
(0.8.80) bis auf Stufe I gebaut, und die bleibt bei 0.9.0. Diese Runde liegt
dazwischen und arbeitet ihr an einer Stelle vor: die öffentliche Adresse aus
Punkt 4 wird dort Pflicht.

**Es ist eine Datenbankstufe, aber ohne Migrationsblock** — die dritte dieser
Art nach 0.8.70 und 0.8.80. Es bleibt bei **fünf** markierten Blöcken, und
unter „Vorgemerkt für 1.0" kommt **nichts** dazu.

**Punkt 3 des Auftrags — der Schlüsselwechsel — ist NICHT gebaut.** Er liegt
auf **0.8.91**. Der Haltepunkt ist vor dem Bau angekündigt und bestätigt
worden; die Begründung steht in Abschnitt 3.

| | |
|---|---|
| Vorher | 0.8.80, Fingerprint `a835ac92`, 2661 Prüfungen |
| Nachher | 0.8.90, Fingerprint `FINGERPRINT_0890`, **2903 Prüfungen** |
| Neue Prüfungen | **237** |
| Gegenproben | **24** |
| `F_ROUTEN` | 56 → **57**, neue Art `'zweitbestaetigt'` |
| Karten im Systembereich | 16 → **17** |
| Formatnummer | **10** (unverändert) |
| Migrationsblöcke | **5** (unverändert) |
| Vokabulareinträge | **11** (unverändert) |
| Neue Abhängigkeiten | **keine** |
| Neue Stolpersteine | **128, 129, 130** |

---

## 1. Was gebaut wurde, je Datei

### `db.js` (+61/−0 Zeilen)

Die Tabelle `sicherheitsprotokoll` samt Index `idx_protokoll_am`, in der
vollständigen DDL und **ohne Migrationsblock**:

```sql
CREATE TABLE IF NOT EXISTS sicherheitsprotokoll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  am TEXT NOT NULL DEFAULT (datetime('now')),
  was TEXT NOT NULL,
  wer INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ziel INTEGER REFERENCES users(id) ON DELETE SET NULL,
  merkmal TEXT
);
CREATE INDEX IF NOT EXISTS idx_protokoll_am ON sicherheitsprotokoll(am);
```

Am Schema steht, warum es **keine Namensspalte** gibt, warum `wer` und `ziel`
die Feststellung eines Vorgangs sind und nicht in `ordneBestandZu()` gehören,
und was ein leeres `wer` bedeutet.

### `auth.js` (+295/−8 Zeilen) — die Datei dieser Runde

- **Das Sicherheitsprotokoll:** `VORGAENGE` (vierzehn), `MERKMALE` (die
  geschlossene Liste), `PROTOKOLL_TAGE = 180`, `PROTOKOLL_GRENZE = 100`,
  `protokolliere()`, `raeumeProtokollAuf()`, `leseProtokoll()`.
  `protokolliere()` **wirft nie** — ein Protokoll, das den Vorgang mitreißt,
  über den es berichten soll, wäre schlimmer als keins; ein Fehlschlag geht ins
  Containerprotokoll.
- **`VOM_WIRT` und `handelnder()`:** wer handelt, ist ein **Pflichtargument**.
  Ein vergessenes wäre still eine Falschaussage — die Zeile behauptete dann,
  der Vorgang sei über den Wirt gelaufen.
- **Elf Schreibstellen** in `legeErstenBenutzerAn`, `aendereZugang`,
  `legeZugangAn`, `setzeNeuesPasswort`, `setzeRolle`, `setzeStatus`,
  `entferneZugang`, `legeSitzungAn`, `pruefeAnmeldung`, `erzeugeToken` und
  `loeseTokenEin`. `anmeldung.ok` steht in `legeSitzungAn` und nicht an den
  drei Aufrufstellen einzeln — dieselbe Überlegung wie bei `last_login`.
- **Die Freigabe:** `FREIGABE_MS = 120000`, `BESTAETIGUNG_ZWECKE` (sechs),
  `erzeugeFreigabe()`, `verbraucheFreigabe()`, `verwirfFreigabe()`. Der
  Schlüssel der Map ist die ganze Bindung: `token|zweck|ziel`.
- **`destroySession()`** verwirft die Freigaben der Sitzung mit.
- **Die öffentliche Adresse:** `pruefeOeffentlicheAdresse()` und
  `OEFFENTLICHE_ADRESSE`, neben `HINTER_PROXY` — dieselbe Sorte Einstellung.

### `server.js` (+216/−11 Zeilen)

- `zweiteBestaetigung(req, res, zweck, ziel)` — **die Regel steht genau
  einmal** — und `zweiteBestaetigungNoetig(zweck)` als Wächter für die
  Routenzeile.
- `POST /api/bestaetigung` (Art `'selbstbezug'`) samt Anmeldebremse und
  `bestaetigung.fehl`.
- `GET /api/sicherheitsprotokoll` hinter `nurEigentuemer`, lesend, mit der
  zweiten Aufrufstelle des Aufräumens.
- Die Schranke an **sieben Wegen über sechs Routen**: Wächter in der
  Routenzeile bei `GET /api/export` und `POST /api/import` (dort **vor
  multer**), im Rumpf bei den drei Verwaltungsrouten — **nach** der
  Rechtefrage.
- `wer` an die vier Zugangsvorgänge durchgereicht; `export`, `import` und
  `sicherung` protokolliert.
- `linkAngabe()` und die Startmeldungen zur öffentlichen Adresse.
- Erste Aufrufstelle von `raeumeProtokollAuf()` beim Start.

### `zugang.js` (+9/−3 Zeilen)

Die drei schreibenden Befehle geben `auth.VOM_WIRT` mit. **Keine Rechtefrage,
keine Rückfrage** — Zugriff auf den Wirt *ist* die Berechtigung; das bleibt.

### `public/app.js` (+194/−7 Zeilen)

- `bestaetigungsFeld()` und `zweiteBestaetigung()` — ein eigener Dialog nach
  dem Muster von `confirmBox()`, mit Passwortfeld und dem Satz daneben, warum
  gefragt wird. **Kein `prompt()`:** dort stünde das Passwort im Klartext.
- Die Schranke an sechs Bedienelementen: Rolle, fremdes Passwort, Link,
  Entfernen, Export (beide Knöpfe), Import (beide Betriebsarten).
- Die Karte **„Sicherheitsprotokoll"** samt `zeichneProtokoll()`,
  `VORGANGSWORT`, `MERKMALSWORT`, `protHandelnder()` und `protZiel()`. Sie wird
  im `Promise.all` von `renderSystem()` geholt — neun Abrufe statt acht.
- `linkHerkunft()` und die Zeile im Linkkasten; `zeigeLink()` nimmt den Link des
  Servers, wenn er einen liefert.

### `public/style.css` (+20/−0 Zeilen)

`.zug-linkherkunft` und die Klassen des Protokolls (`.prot-liste`,
`.prot-zeile` und ihre fünf Spalten), samt Umbruch auf schmalem Schirm.

### `.env.example` (+26/−0 Zeilen)

`OEFFENTLICHE_ADRESSE`, auskommentiert und mit der vollständigen Begründung,
warum sie hierher gehört und nicht in den Systembereich.

### `pruefung.js` (+1767/−67 Zeilen)

Elf neue Gruppen, die drei Oberflächengruppen, die Erweiterungen an
`F_ROUTEN`, den Wortwächtern und der Kartenzahl — und `mitFreigabe()` als
**benannter, sichtbarer** Umschlag für die Prüfungen, die etwas anderes prüfen.
Einzelheiten in Abschnitt 5.

---

## 2. Die Fragen aus dem Auftrag, beantwortet

### A. Wie heißt das Ding? **`sicherheitsprotokoll`, nie abgekürzt.**

„Protokoll" ist im Projekt vergeben — so heißt `docker compose logs`, im
Einspielweg, in Abschnitt 8 des Projektstands und in der README. Zwei
verschiedene Dinge unter demselben Wort sind Stolperstein 47 in der Sprache.

Erwogen und verworfen: **„Sicherheitsjournal"** (Journal ist in diesem Projekt
`journal_mode`), **„Vorgangsbuch"** (erkennt niemand wieder),
**„Zugangsprotokoll"** (es hält auch Export und Import fest, die kein Zugang
sind).

Genommen ist der Vorschlag des Auftrags — **und der Wächter daneben zählt die
Zahl** der alleinstehenden Vorkommen von `Protokoll` in den acht ausgelieferten
Dateien. Heute sind es **zwei**, beide meinen den Containerlog (die Meldung
nach einer gescheiterten Sicherung und der Hinweis in der Kennzahlenkarte). Wer
das neue Ding je „Protokoll" nennt, bewegt die Zahl und wird namentlich rot —
dieselbe Bauform wie die Zahl in `F_ROUTEN`. Vier Gegenproben stehen daneben:
er findet ein neues Vorkommen, lässt das lange Wort in Ruhe, lässt den
Bezeichner `raeumeProtokollAuf` in Ruhe und färbt sich nicht am Kommentar.

### B. Welche Vorgänge? **Vierzehn — die zehn des Auftrags und drei dazu.**

| | Vorgang | Merkmal |
|---|---|---|
| 1 | `anmeldung.ok` | — |
| 2 | `anmeldung.fehl` | — |
| 3 | `bestaetigung.fehl` | — |
| 4 | `zugang.neu` | die Rolle |
| 5 | `zugang.rolle` | die neue Rolle |
| 6 | `zugang.status` | `aktiv` / `gesperrt` |
| 7 | `zugang.passwort` | — |
| 8 | `zugang.weg` | — |
| 9 | `zugang.selbst` | `name` / `passwort` / `beides` |
| 10 | `link.neu` | der Anlass |
| 11 | `link.ein` | der Anlass |
| 12 | `export` | — |
| 13 | `import` | `merge` / `replace` |
| 14 | `sicherung` | — |

**Drei stehen über dem Auftrag, und jede ist begründet:**

- **`zugang.neu`** — ohne ihn nennt das Protokoll jeden Entfernten und keinen
  Entstandenen. Ein fremder Zugang, der auftaucht, ist genau das, was man
  hinterher sucht.
- **`zugang.selbst`** — der erste Griff einer übernommenen Sitzung ist der
  eigene Zugang; er sperrt den Richtigen aus. Ein Aufruf, der nichts bewegt,
  schreibt allerdings keine Zeile: ein Vorgang, der nichts tut, ist keiner.
- **`sicherung`** — eine vollständige Kopie, die das Haus verlässt. Dieselbe
  Zeile wie der Export.

Dazu **`bestaetigung.fehl`**, das im Auftrag nicht vorkam: wer daran scheitert,
sitzt an einer angemeldeten Sitzung und kennt das Passwort nicht — genau der
Fall, gegen den die Runde gebaut ist.

**Weggelassen, mit Begründung:** *Abmeldung* (sagt nichts über die Anlage und
verdoppelt das Volumen; „Meine Sitzungen" zeigt es ohnehin live), *Sitzung
beendet* (selbstbezüglich, dieselbe Karte), *Papierkorb wiederherstellen und
leeren* (betrifft **Inhalte** — das wäre der Änderungsverlauf, gegen den die
Entscheidung steht), *Titel, Vokabular, Kriterien, Tags, Kategorien,
Suchanbieter* (dieselbe Linie), *Sicherungsort geändert* (eine Einstellung,
kein Griff an den Bestand).

### C. Gehört die gescheiterte Anmeldung hinein? **Ja — und ihr Deckel ist die Bremse.**

Sie ist die einzige Zeile, die ein Fremder auslösen kann, und damit die
einzige, mit der sich die Tabelle von außen vollschreiben ließe. Geschrieben
wird deshalb **nur, wenn die Anfrage die Passwortprüfung wirklich erreicht
hat** — der gesperrte Fall (429) schreibt nichts. Damit sind es höchstens
`HARD_LIMIT` Zeilen je Adresse und `BLOCK_MS`, also **zehn je Adresse und fünf
Minuten**, rund 170 kB am Tag bei ununterbrochenem Raten.

*Die Obergrenze ist keine zweite Regel, sondern die Bremse, die es schon gibt —
ein Deckel, den es nicht gibt, kann nicht vergessen werden.* Dieselbe Bauform
wie beim gewichteten Mittel aus 0.8.40.

Der Preis, ehrlich benannt: verteiltes Raten aus vielen Adressen schreibt
weiterhin viele Zeilen. Die Frist trägt es, und die ersten zehn je Adresse sind
die Spur, auf die es ankommt.

### D. Was steht in einer Zeile? **Sechs Spalten — und ausdrücklich kein Name.**

Zeitpunkt, was, wer, an wem, ein kurzes Merkmal. **Keine IP-Adresse, kein
Browserkopf** — die Entscheidung aus 0.8.80 wird nicht nebenbei aufgegeben. Ein
Protokoll ohne Adresse ist in einer Anlage im Heimnetz nicht wertlos: die
Einheit ist hier der **Zugang**, nicht das Gerät.

**Keine Namensspalte, obwohl sie verlockt.** `entferneZugang()` überschreibt
`username`; eine hier aufbewahrte Kopie wäre die eine Stelle im Projekt, die
den Grabstein rückgängig macht. Aufgelöst wird beim Anzeigen über einen JOIN,
und ein Grabstein liefert dabei `null` — daraus macht die Oberfläche
„Gelöschter Benutzer 7", wie an jedem Beitrag im Eintrag.

**Der getippte Name einer gescheiterten Anmeldung wird nie gespeichert.**
`ziel` trägt eine Nummer nur, wenn der Name einen vorhandenen Zugang traf.
Sonst landete früher oder später ein ins falsche Feld getipptes Passwort in der
Tabelle.

**`merkmal` trägt ausschließlich Werte aus einer geschlossenen Liste** im
Quelltext. Damit ist „kein Freitext von außen" baulich wahr statt beabsichtigt
— und „kein Geheimnis in einer Zeile" lässt sich über **alle Spalten aller
Zeilen** prüfen statt an einem Feld.

### E. Wie lange bleibt es stehen? **180 Tage.**

Länger als die dreißig von Papierkorb und Tokenspur, wie vorgeschlagen: ein
Protokoll, das den Vorfall vergisst, bevor jemand aus dem Urlaub zurück ist,
ist keins. Ein halbes Jahr deckt auch eine lange Abwesenheit ab.

Die Bauform ist abgeschrieben, nicht neu erfunden: **eine** Konstante, **eine**
Funktion `raeumeProtokollAuf()`, **zwei** Aufrufstellen (Start und Öffnen der
Karte), **ein** gebundener Modifikator (Stolperstein 119). Geprüft an beiden
Seiten mit von Hand gesetztem Ausgangswert und der Nachschau, dass wirklich
einer dasteht (Stolperstein 60) — und **beide Aufrufstellen einzeln**, die für
den Start gegen einen **echten Serverstart** (Stolperstein 126).

### F. Wer darf es sehen? **Der Eigentümer allein.**

Der Grund steht schon im Projekt, an `keyHex`: *„Ein Admin verwaltet den
Bestand, er öffnet nicht die Datei."* Das Protokoll nennt die
Verwaltungsvorgänge des Eigentümers über Admins; eine Liste mit zwei Antworten
wäre eine zweite Wahrheit. Geprüft mit zwei vorbereiteten Sitzungen und **einem
Admin ohne Eigentümerrolle**, in beide Richtungen.

### G. Kann man es löschen? **Nein. Die Frist ist der einzige Weg hinaus.**

Es gibt keine Löschroute, und **das wird geprüft** — an den Routen, nicht an
der Absicht. Der Satz steht auch an der Karte.

### H. Die Schemafrage. **Kein sechster Migrationsblock — zum dritten Mal nachgestellt.**

Die Probe von 0.8.70 und 0.8.80 an dieser Tabelle wiederholt: von Hand
entfernt, ein Start, sie ist wieder da — samt Spalten und Index. Und die
Gegenlage: eine von Hand entfernte **Spalte** (`users.email`) kommt nicht von
selbst zurück. Dazu die feste Liste der Spalten von `users` und `sessions`:
**keine von beiden bekommt etwas dazu.**

### I. Die Form der zweiten Bestätigung. **Eine Freigabe im Arbeitsspeicher — Abweichung vom Auftrag.**

Der Auftrag neigte zu „das Passwort reist im Rumpf der Handlung selbst mit".
Das ist die schönere Form, und sie geht an **zwei der sieben Wege nicht auf**:

- **`GET /api/export` ist eine Browsernavigation** (`window.location`), damit
  die Datei an der Platte vorbeiläuft statt vollständig im Speicher zu stehen.
  Ein Rumpf ist dort baulich unmöglich; in die Adresse gehört ein Passwort nie.
  Sie auf `fetch` + Blob umzubauen hieße, eine Exportdatei von mehreren hundert
  MB vollständig in den Speicher des Browsers zu legen — das wäre schlechter
  als der heutige Weg, nicht besser.
- **`POST /api/import` trägt seinen Wächter ausdrücklich vor multer**
  (Abschnitt 11 des Projektstands: „Ein Wächter kann mehr sein als eine
  Rechtefrage"). Ein Passwort im Multipart-Rumpf wäre erst **nach** dem
  Einlesen der bis zu 900 MB großen Datei lesbar.

Genommen ist deshalb **eine Freigabe**: `POST /api/bestaetigung` prüft das
Passwort und legt sie an; die Handlung verbraucht sie.

| | |
|---|---|
| Wo sie liegt | im Arbeitsspeicher, neben `attempts` |
| Gebunden an | Sitzungstoken **+** Zweck **+** Ziel |
| Haltbarkeit | 120 Sekunden |
| Gültigkeit | genau einmal |
| Beim Abmelden | fällt sie mit |

**Sie braucht kein Schema und ist deshalb kein sechster Migrationsblock.** Die
Frage aus dem Auftrag ist damit gestellt und mit Nein beantwortet: eine Spalte
an `sessions` wäre der sechste gewesen, und es gibt sie nicht.

Der Preis, ehrlich: es **ist** Zustand, und es gibt eine Frist. Er wiegt
weniger als ein Export im Speicher des Browsers und ein Wächter, der hinter
multer rutscht. Und die Zusicherung des Auftrags bleibt: wer drei Zugänge
nacheinander entfernt, tippt dreimal.

**Ein Befund beim Bauen** hat die Form noch einmal geschärft: ein einziger
Platz je Sitzung wäre eine stille Falle — eine Anfrage, die zwei Zwecke braucht
(Rolle **und** Passwort in einem Rumpf), verlöre mit dem ersten Verbrauch den
zweiten und schiene an der Schranke zu scheitern, obwohl beide bestätigt waren.
Der Schlüssel der Map trägt deshalb alle drei Teile.

### J. Welche Wege genau? **Sieben über sechs Routen.**

Die sechs aus Abschnitt 11 minus dem Schlüsselwechsel (0.8.91), plus der Link:

| Weg | Route | Art in `F_ROUTEN` |
|---|---|---|
| Export | `GET /api/export` | *lesend — eigene Quelltextprüfung* |
| Import | `POST /api/import` | `nurEigentuemer, zweitbestaetigt` |
| Rolle vergeben | `PUT /api/users/:id` | `nurAdmin, im Rumpf, zweitbestaetigt` |
| Fremdes Passwort | `PUT /api/users/:id` | dieselbe |
| Link erzeugen | `POST /api/users/:id/token` | `nurAdmin, im Rumpf, zweitbestaetigt` |
| Zugang entfernen | `DELETE /api/users/:id` | `nurAdmin, im Rumpf, zweitbestaetigt` |

**Ja beim Link, nein beim Anlegen** — wie vorgeschlagen: der Link trifft einen
**bestehenden** Zugang, das Anlegen erzeugt einen neuen und nimmt niemandem
etwas. **Nein beim Sperren und Freigeben:** es ist umkehrbar und übergibt
nichts; ein gesperrter Zugang ist nicht die Anlage. **Nein bei
`POST /api/setup`** — es gibt kein bisheriges Passwort, und das ist geprüft.

**Der Export steht nicht in `F_ROUTEN`**, weil die Liste die Stelle für
**schreibende** Routen ist. Seine Klemme bekommt deshalb eine eigene
Quelltextprüfung daneben — sonst wäre sie die einzige der sieben, die niemand
zählt. Das ist die Bauform aus 0.8.30.

### K. Braucht die Liste eine neue Art? **Ja: `'zweitbestaetigt'`.**

Als **Zusatz** wie `'im Rumpf'`, nicht anstelle der anderen: `'nurEigentuemer'`
sagt, **wer** darf, der Zusatz sagt, dass es damit noch nicht getan ist. Das
ist der Befund aus 0.8.30 zu Ende gedacht — die Art sagte bis dahin nur, *dass*
eine Klemme dasteht, nicht *welche*.

Geprüft in **beide** Richtungen: wo die Art steht, steht der Aufruf; wo sie
nicht steht, steht er nicht. **Der Aufruf steht ausdrücklich nicht in
`RUMPF_WOERTER`** — er ist keine Rechtefrage; stünde er dort, erfüllte er die
Klemme, die `'im Rumpf'` verlangt, und eine Route, die ihre Rollenklemme
verloren hat und nur noch das Passwort fragt, bliebe grün.

### L. Das Passwort im Rumpf und das Zugriffsprotokoll. **Nachgesehen, nicht angenommen.**

Kriterion führt **kein eigenes Zugriffsprotokoll** — kein `morgan`, keine
Middleware, die Anfragen mitschreibt. Ein Reverse Proxy protokolliert die
Anfragezeile, nicht den Rumpf. Was bleibt, ist die eine Gefahr, gegen die ein
Wächter hilft: eine Zeile, die `req.body` ins Containerprotokoll schreibt. Der
Wächter steht jetzt da, samt Gegenprobe.

### M. Greift die Anmeldebremse? **Ja, dieselbe wie überall.**

Je Adresse **und** je Name; der Name steht hier fest, es ist der des
Angemeldeten. Ohne sie wäre die Bestätigungsroute ein Weg, ein Passwort
ungebremst durchzuprobieren — und zwar **hinter** der Anmeldung, wo niemand
hinsieht. Die Kennwerte sind unangetastet. Belegt am **Übergang**: der zehnte
Versuch wird beantwortet, der elfte ist der erste gesperrte (Stolperstein 124).

### N. Wie sieht die Absage aus? **„Das Passwort stimmt nicht.", mit 403.**

Klar und deutlich, wie vorgeschlagen — und der Unterschied zu 0.8.80 gehört
benannt: dort wusste der Server nicht, wer fragt, und die eine verschleierte
Absage schützte vor dem Durchprobieren. Hier ist der Fragende **angemeldet und
namentlich bekannt**; eine verschleierte Absage schützte niemanden und
verwirrte nur.

**403 und nicht 401**, und das ist keine Kleinigkeit: `api()` in `public/app.js`
behandelt 401 als „Sitzung abgelaufen" und wirft die Oberfläche auf die
Anmeldeseite. Ein 401 ließe den Bildschirm mitten in einer Handlung
verschwinden. Geprüft.

### O. Was steht am Bildschirm? **Ein eigener Dialog, mit dem Grund daneben.**

Nach dem Muster von `confirmBox()` — dasselbe `.backdrop`/`.modal` wie überall.
**Kein `prompt()`:** dort stünde das Passwort im Klartext auf dem Bildschirm.
Daneben der Satz: *„Das trifft die Anlage als Ganzes. Damit eine fremde offene
Anmeldung das nicht kann, bestätigst du es mit deinem Passwort."* Ein
Passwortfeld ohne Begründung sieht aus wie eine Schikane.

### P. Das Wort für das zweite Passwortfragen. **`zweiteBestaetigung` — ein Wort für beides.**

Dieselbe Frage wie „Token oder Link" in 0.8.80, aber mit einer einfacheren
Antwort: **ein** Wort im Quelltext wie am Bildschirm kann gar nicht
auseinanderlaufen. „Re-Authentifizierung" ist der Fachbegriff und bleibt das
Wort der Papiere; ein Wächter hält es aus den ausgelieferten Dateien heraus.

### Q. Was ist mit `zugang.js`? **Es bleibt der Notweg — und schreibt ins Protokoll.**

Keine Rechtefrage, keine Rückfrage: Zugriff auf den Wirt **ist** die
Berechtigung, und eine Rechtefrage dort wäre eine Kulisse. Aber seine drei
schreibenden Befehle hinterlassen eine Spur — sonst hätte ausgerechnet der Weg,
den man hinterher nachlesen möchte, als einziger keine. Geprüft als **echter
Prozess**, wie in den Runden zuvor.

### R. Die Prüfung der öffentlichen Adresse. **`new URL`, vierzehn Fälle einzeln.**

Schema (nur `http`/`https`) und Rechnername sind Pflicht, ein Pfad ist erlaubt,
abschließende Schrägstriche fallen, Leerraum fällt — abgewiesen werden
Zugangsdaten in der Adresse, `?` und `#`.

**`http://` bei gesetztem `HINTER_PROXY`: eine Warnung, keine Absage.** Der
Widerspruch kann nichts zerstören — ein falscher Link ist ein toter Link, kein
Verlust. Eine Absage wäre härter als der Schaden.

**Ein unbrauchbarer Wert bricht den Start nicht ab**, sondern meldet sich laut
und fällt auf den Browserweg zurück — dieselbe Form wie bei `AUTH_RESET` und
beim fehlenden Sicherungsort.

**Sie steht nicht in `GET /api/config`**, und das ist geprüft — in beiden
Zuständen, und mit der Gegenprobe, dass `/api/config` überhaupt antwortet.

### S. Die Zeile im Linkkasten. **Zwei Formen, jede mit der Gegenlage.**

*„Dieser Link zeigt auf `…` — **aus deinem Browser**"* bzw. *„— **aus der
Einstellung `OEFFENTLICHE_ADRESSE`**"*. Zu jeder Form wird geprüft, dass die
**andere** gerade nicht dasteht: sonst bliebe eine Zeile, die beide nennt, in
beiden Lagen grün.

### T. Die Formatnummer? **Bleibt bei 10 — die Frage ist gestellt und beantwortet.**

Weder das Sicherheitsprotokoll noch die Freigabe stehen im Austauschformat. Das
Protokoll ist eine Aussage über **diese** Anlage; es in eine Datei zu schreiben,
die das Haus verlässt, wäre das Gegenteil seines Zwecks.

### U. Ein Migrationsabschnitt im Prüfstand? **Nein — stattdessen die Probe selbst.**

Es gibt keinen Migrationsblock, also auch keinen sechsten Prüfabschnitt. An
seiner Stelle steht die Gruppe „Das Sicherheitsprotokoll: die Tabelle legt sich
selbst an". Die Probe „Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem
Start" ist **unverändert**.

---

## 3. Der Haltepunkt — warum Punkt 3 nicht in dieser Runde steht

Der Auftrag bot ihn an („Haltepunkt nach Punkt 2 … **Punkt 3 allein wäre eine
legitime eigene Runde**, und das ist keine Niederlage"). Er ist **vor dem Bau**
angekündigt und bestätigt worden. Drei Gründe:

1. **Er ist der einzige Knopf im ganzen Projekt, der bei falscher Handhabung
   alles verliert.** Er verdient einen eigenen ruhigen Durchgang, einen eigenen
   Einspielweg und einen eigenen Changelog-Absatz.
2. **Er hat beim Nachstellen seine Form geändert** — Stolperstein 128, siehe
   Abschnitt 4. Der Auftrag ging davon aus, dass `PRAGMA rekey` „durchläuft";
   im WAL-Modus tut er das nicht.
3. **Die Runde war ohne ihn schon so breit wie 0.8.80** — elf neue Prüfgruppen,
   237 Prüfungen, zwei neue Karten, ein neuer Dialog, eine neue Tabelle mit elf
   Schreibstellen.

**Was 0.8.90 ihm vorgearbeitet hat:** die zweite Bestätigung steht bereit — der
Schlüsselwechsel wird ihr **achter** Weg und bekommt keine neue Form. Das
Sicherheitsprotokoll bekommt seinen **fünfzehnten** Vorgang. *Eine
Protokollzeile nennt, DASS gewechselt wurde, nie WOHIN* — die Nachschau darauf
steht schon jetzt im Prüfstand.

Punkt 4 hing an keinem der drei und ist mitgelaufen, wie der Auftrag es
vorsah.

---

## 4. Befunde beim Bauen

### A. `PRAGMA rekey` läuft im WAL-Modus nicht — Stolperstein 128

Der Auftrag hielt fest: *„Eines ist schon nachgestellt und muss nicht mehr
geprüft werden: `PRAGMA rekey` läuft in `better-sqlite3-multiple-ciphers`
durch."* An einer Anlage, wie Kriterion sie öffnet, tut er das nicht:

```
SqliteError: Rekeying is not supported in WAL journal mode.
```

`db.js` setzt `journal_mode = WAL` in jedem `open()`. Der Wechsel muss also
`journal_mode = DELETE` setzen, wechseln und danach zurückschalten. **So läuft
er durch** — an 20 000 und an 200 000 Zeilen nachgestellt, `integrity_check`
danach `ok`, Bestand feldgleich, die Datei mit dem neuen Schlüssel lesbar und
mit dem alten nicht mehr.

**Zwei weitere Messungen aus derselben Probe, für 0.8.91:**

- **Der Abbruch mittendrin ist folgenlos**, solange das Rollback-Journal
  überlebt: zweimal mit `kill -9` an einer 273-MB-Anlage (bei 2,5 s und bei
  4,8 s von 5,2 s) — danach öffnet der **alte** Schlüssel, `integrity_check`
  ist `ok`, Zeilen und Summen sind identisch, das Journal ist geräumt, und der
  neue Schlüssel wird abgewiesen. **Es entsteht kein halber Zustand.** Wird das
  Journal entfernt, ist alles verloren („database disk image is malformed") —
  **das** ist der Grund für die Sicherung davor, nicht der Abbruch selbst.
- **Der Wechsel dauert rund 20 ms je MB** (5189 ms für 261 MB) und braucht
  **freien Platz in Höhe der Datenbank** (das Journal wächst auf ihre Größe).
  20 ms je MB ist genau `SICHERUNG_MS_JE_MB` — die Schätzung kann denselben
  Rechenweg nehmen.

### B. Eine liegengebliebene Freigabe trägt zwei Minuten lang — Stolperstein 129

Die Gruppe „die Freigabe selbst" holte eine Bestätigung für den Export und
verbrauchte sie nicht. Die nächste Gruppe lief mit derselben Sitzung gegen den
Export — und „ohne Bestätigung abgewiesen" war rot, ohne dass am Code etwas
falsch war. *Wo eine Prüflage kurzlebigen Zustand im Arbeitsspeicher
hinterlässt, beginnt die nächste mit einer frischen Sitzung.*

### C. Ein Rückbau, der die Tabelle aus der DDL nimmt, reißt den Start ab — Stolperstein 130

`auth.js` bereitet seine Anweisungen beim Laden vor; fehlt die Tabelle, startet
die Anlage gar nicht — der Prüflauf bricht mit „Server beendet (Code 1)" ab
statt eine Prüfung namentlich rot zu färben. Die Gegenprobe läuft deshalb über
den **Index**. Der Befund gehört daneben: **die Anlage startet ohne die Tabelle
überhaupt nicht** — das ist schärfer als die Prüfung, aber es ist eine andere
Aussage.

### D. Die Reihenfolge Rechtefrage → Bestätigungsfrage ist beim Bauen gedreht worden

Der erste Bau setzte den Wächter `zweiteBestaetigungNoetig` in die Routenzeile
**aller** sechs Routen. An den drei Verwaltungsrouten steht er damit **vor**
`zielZugangFrei` — und ein Benutzer ohne Recht bekam die Bestätigungsfrage
statt der Absage aus der Rollenleiter. Zwölf vorhandene Rechteprüfungen wurden
davon rot, und sie hatten recht: *wer ohnehin nicht darf, soll erfahren, dass
er nicht darf — und nicht erst nach seinem Passwort gefragt werden.* Die
umgekehrte Reihenfolge wäre außerdem ein Weg, an einer fremden Rolle zu prüfen,
ob ein Passwort stimmt.

### E. Die Unstimmigkeit im Projektstand, die vor dem Bau gemeldet wurde

Abschnitt 2 sagte, die Sicherung auf Knopfdruck laufe *„ohne die Anlage
anzuhalten"*. Abschnitt 4 desselben Papiers, die README und die Karte selbst
sagen das Gegenteil — und `VACUUM INTO` läuft synchron auf der einen
Verbindung. **Abschnitt 2 war falsch** und ist berichtigt; die Berichtigung
steht als solche dort.

Zwei kleinere Stellen dazu: Abschnitt 3 nannte die harte Schwelle der
Anmeldebremse „ab zehn" (gesperrt wird ab dem **elften**, Stolperstein 124 sagt
es), und der Auftrag sprach von „vier Dingen", die `zugang.js` tut — es sind
**drei** schreibende Befehle plus `liste`, das nur liest.

---

## 5. Der Prüfstand

### Neue Gruppen

| Gruppe | Prüfungen |
|---|---|
| Das Sicherheitsprotokoll: die Tabelle legt sich selbst an | 9 |
| Das Sicherheitsprotokoll: eine Zeile je Vorgang | 23 |
| Das Sicherheitsprotokoll: kein Geheimnis in einer Zeile | 8 |
| Das Sicherheitsprotokoll: die Frist an beiden Seiten | 6 |
| Das Sicherheitsprotokoll: das Aufräumen an beiden Aufrufstellen | 4 |
| Das Sicherheitsprotokoll: wer es sehen darf | 9 |
| Die zweite Bestätigung: die Freigabe selbst | 20 |
| Die zweite Bestätigung: jeder schwere Weg einzeln | 32 |
| Die zweite Bestätigung: was NICHT dahinter liegt | 7 |
| Die zweite Bestätigung: die Bremse greift auch dahinter | 6 |
| Die öffentliche Adresse: die Prüfung des Werts | 17 |
| Die öffentliche Adresse: beide Zustände am Server | 12 |
| Das Sicherheitsprotokoll in der Oberfläche | 22 |
| Die zweite Bestätigung in der Oberfläche | 20 |
| Die öffentliche Adresse im Linkkasten | 10 |
| zugang.js schreibt ins Sicherheitsprotokoll | 6 |

Dazu die Erweiterungen vorhandener Gruppen: `F_ROUTEN` samt Zahl (57) und der
neuen Art in beiden Richtungen, der Wortwächter über „Protokoll" mit seinen
vier Gegenproben, der Wächter gegen „Re-Authentifizierung", der Wächter gegen
die Ausgabe des Anfragerumpfs, die Kartenzahl im Systembereich (siebzehn) und
die beiden breiten Kacheln namentlich.

### `mitFreigabe()` — der benannte Umschlag

Seit dieser Runde verlangen sieben Wege eine Freigabe. Die Prüfungen, die etwas
**anderes** prüfen — das Vokabular in der Exportdatei, die Rollenleiter, den
Grabstein —, sollen weiterhin ihren Gegenstand prüfen und nicht an der neuen
Schranke hängenbleiben. Dafür steht `mitFreigabe()`: er sieht am Weg, ob eine
Freigabe nötig ist, holt sie mit dem bekannten Passwort und ruft dann erst.

**Er ist sichtbar und benannt und steht ausdrücklich nicht in `ruf()`.** Die
Schranke selbst wird in eigenen Gruppen geprüft, und dort wird mit dem **rohen**
Rufer gearbeitet. Ein Umschlag, der die Schranke unsichtbar macht, wäre
Stolperstein 52 in Reinform.

**Folge davon:** sieben Prüflagen brauchen jetzt echte Passwörter statt
`password_hash = 'x'`. Dafür steht `setzePasswortImBestand()` — es hasht über
`auth.hashePasswort` und **nicht** über eine zweite Ausfertigung des Formats,
und es geht ausdrücklich nicht über `setzeNeuesPasswort()`: das räumt die
Sitzungen mit weg, und die Prüflagen setzen ihre von Hand.

### Was mindestens hineingehört — und wo es steht

| Forderung des Auftrags | Wo |
|---|---|
| Die Tabellenprobe zum dritten Mal, samt Gegenlage zur Spalte | Gruppe 1 |
| Jeder schwere Weg einzeln, in beide Richtungen, mit Nachschau in der Datenbank | „jeder schwere Weg einzeln" |
| Die Anmeldebremse greift auch dahinter, Schwelle nachgerechnet | „die Bremse greift auch dahinter" |
| `zugang.js` als echter Prozess, weiterhin ohne Rückfrage | „zugang.js schreibt ins Sicherheitsprotokoll" |
| Genau eine Zeile je Vorgang; ein gescheiterter schreibt keine | „eine Zeile je Vorgang" |
| Kein Geheimnis in einer Zeile, über alle Spalten aller Zeilen | „kein Geheimnis in einer Zeile" |
| Die Frist an beiden Seiten, Ausgangswert von Hand, Nachschau darauf | „die Frist an beiden Seiten" |
| Das Aufräumen an beiden Aufrufstellen, Start gegen echten Serverstart | „das Aufräumen an beiden Aufrufstellen" |
| Wer es sehen darf, in beide Richtungen, mit Admin ohne Eigentümerrolle | „wer es sehen darf" |
| Die öffentliche Adresse in beiden Zuständen, nicht in `/api/config`, Zeile im Linkkasten in beiden Formen | drei Gruppen |
| `F_ROUTEN` trägt jede neue Route mit Art, die Zahl ausdrücklich | „Der Waechter ueber den Quelltext" |
| Ein Wortwächter über den Quelltext samt Gegenprobe, dass er Code liest | ebenda |
| Der Sprachwächter bleibt grün, auch über die Papiere dieser Runde | „Der Sprachwaechter" |

Der Rundlauf des Schlüsselwechsels, der `.env`-Fall und der Dateifall gehören
zu 0.8.91.

---

## 6. Gegenprobentabelle

**GEGENPROBENTABELLE**

---

## 7. Prüfungszahlen

| | |
|---|---|
| Vorher (0.8.80) | 2661 |
| Nachher (0.8.90) | **2903** |
| Neu | **237** |
| Gegenproben | **24** |

Der Zuwachs von 242 gegenüber 237 erklärt sich aus fünf Prüfungen, die in
vorhandene Gruppen eingefügt wurden (die beiden breiten Kacheln namentlich, die
drei Gegenproben zum Wortwächter).

---

## 8. Was ausdrücklich nicht passiert ist

* **Kein Schlüsselwechsel.** Punkt 3 des Auftrags liegt auf 0.8.91. `keys.js`
  ist unberührt geblieben.
* **Kein Mailversand, keine Selbstanmeldung.** Beides ist Stufe I.
* **Kein Änderungsverlauf an Inhalten.** Die Entscheidung dagegen steht und
  gilt; das Sicherheitsprotokoll ist ausdrücklich etwas anderes.
* **Keine IP-Adresse, kein Browserkopf.** Seit 0.8.80 eine benannte
  Eigenschaft der Anlage.
* **Kein zweiter Faktor.** Gefragt wird **dasselbe** Passwort noch einmal.
* **Der Papierkorb, die Sicherung und die Token sind nicht umgebaut** — die
  Token haben eine Protokollzeile bekommen, mehr nicht.
* **`zugang.js` hat keine Rechtefrage bekommen**, nur die Protokollzeilen.
* **Die Formatnummer bleibt bei 10.**
* **Kein Migrationsblock, kein sechster.** Es bleibt bei fünf.
* **Keine neue Abhängigkeit.** `crypto` und `URL` sind in Node eingebaut.
* **Kein neuer Vokabeleintrag.** Die elf bleiben elf.
* **Die Kennwerte der Anmeldebremse sind unangetastet** — angewandt ist sie auf
  eine neue Route, heruntergeschraubt ist nichts.
* **Farbschema, Verschlüsselungsmodell, `katalog.sqlite`, `HINTER_PROXY`, die
  Content-Security-Policy, die Sortierung der Übersicht und das Austauschformat
  sind nicht angefasst.** Die `docker-compose.yml` ebenfalls nicht.

---

## 9. Offen geblieben

* **Der Schlüsselwechsel** — 0.8.91, mit den drei Messungen aus Abschnitt 4 als
  Vorarbeit.
* **Der Import hat keine Oberflächenprüfung für die Bestätigung.** Sein Weg
  läuft über eine echte Datei und einen `FileReader`; ein gestellter
  Dateiwähler prüfte den Dateiwähler, nicht die Schranke. Serverseitig ist der
  Weg belegt.
* **`tokens.created_at` wird weiterhin von keinem Code gelesen.** Das
  Sicherheitsprotokoll führt seine eigene Zeitangabe; die Spalte bleibt für den
  Fall, dass die Frist einmal wechselt.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird weiterhin bei jedem
  Seitenaufbau abgefragt.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 bleibt offen.
* **„Abgelehnt mit Datum und Begründung"** (Ideenpapier 4.2) bleibt offen.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben.

---

**0.8.90 — Fingerprint `FINGERPRINT_0890`**
