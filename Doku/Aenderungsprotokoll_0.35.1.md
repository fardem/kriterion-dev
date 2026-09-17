# Änderungsprotokoll 0.35.1 — „Die drei Sicherheitsbefunde aus der Messung"

Gebaut am 17. September 2026, auf 0.35.0. PATCH.

Die Messung zur 0.35.0 vom 16. September 2026 hat fünf Sicherheitsbefunde
gebracht. Zwei sind mit 0.34.4 behoben. Die drei übrigen standen bis zum
17. September 2026 in der Zeile 0.36.0 des Fahrplans und sind dort
herausgenommen worden: sie hängen nicht an der Sicherheitsdurchsicht, sie sind
je wenige Zeilen, und zwei von ihnen können Daten kosten.

| | vorher | nachher |
|---|---:|---:|
| Eine beschädigte `data/encryption.key` geht an SQLCipher | ungeprüft | **abgewiesen** |
| Absagen von `PUT /api/settings`, die hinter Schreibstellen stehen | 11 | **0** |
| Gleichzeitige Wiederherstellungen derselben Papierkorbzeile, die gelingen | 2 | **1** |
| Prüfungen | 6969 | **7007** |
| Gruppen in der Schlusstafel | 360 | **363** |
| Rückbauten | 1032 | **1036** |
| Schlüssel je Sprachdatei | 1211 | **1212** |

> **FINGERPRINT DIESER RUNDE: `10017d45`** — der Stand davor war `5297965e`.
>
> Er ändert sich, weil `keys.js` und `server.js` Zeilen dazubekommen, weil die
> drei Sprachdateien einen Schlüssel mehr tragen und weil `package.json` die
> neue Versionsnummer trägt.

**An `server.js` sind es 75 neue und 54 entfernte Zeilen** — gezählt ohne
Leerraum (`git diff -w`). Der volle Diff nennt 441 Zeilen; die Differenz ist
die Einrückung des Routenrumpfs, der jetzt in einer Transaktion steht.

**Zur Laufzeit wird hier keine Aussage gemacht.** Der Lauf dieser Runde
dauerte 312,8 Sekunden, der zur 0.35.0 299,4 — aber die 299,4 waren der Median
aus fünf Läufen und die 312,8 sind ein einzelner. In demselben Lauf hat eine
unbeteiligte Gruppe 31,0 statt 10,5 Sekunden gebraucht. Was die 38 neuen
Prüfungen wirklich kosten, sagt erst eine Messung mit fünf Läufen, und die
gehört nicht in eine PATCH-Runde.

---

## 1. Der erste Befund — die Schlüsseldatei wird ungeprüft gelesen

**`keys.js`, `loadKey`.** Der Kommentar in Zeile 9 sagt, die Prüfung auf 64
Hex-Zeichen stehe an einer Stelle, weil die Frage an dreien gestellt wird.
`HEX_PATTERN` greift an dreien — beim Lesen von `ENCRYPTION_KEY`, beim
Schreiben der Schlüsseldatei und beim Schreiben der `.env`-Zeile. An der
vierten, dem Lesen der Schlüsseldatei, griff sie nicht:

```js
const hex = fs.readFileSync(keyPath, 'utf8').trim();
warnKeyBesideData();
return { hex: hex.toLowerCase(), fromEnv: false };
```

Der Wert geht von dort als `PRAGMA key="x'…'"` an SQLCipher.

### Was daran der Schaden ist

**Gemessen am 17. September 2026** gegen
`better-sqlite3-multiple-ciphers`, mit einer Datenbank, die unter einem
gültigen Schlüssel angelegt worden ist:

| Inhalt der Datei | was SQLCipher tut |
|---|---|
| 64 Hex-Zeichen | öffnet |
| ein Zeichen zu wenig | `SQLITE_NOTADB file is not a database` |
| leer | `SQLITE_NOTADB file is not a database` |

Genau 64 Hex-Zeichen nimmt SQLCipher als Schlüssel, alles andere als Passwort
und rechnet sich daraus einen anderen Schlüssel. **Die Meldung nennt deshalb
die Datenbank und nicht die Schlüsseldatei** — der Betreiber sucht den Fehler
an der falschen Stelle.

**Schlimmer ist der zweite Fall.** Liegt neben der beschädigten Datei noch
keine Datenbank — erste Installation, oder die Datei ist verloren und wird aus
einer Sicherung geholt —, dann legt der Start eine neue Datenbank unter dem
Schlüssel an, der sich aus dem beschädigten Text ergibt. Wird die
Schlüsseldatei danach auf ihren richtigen Wert gebracht, ist diese Datenbank
nicht mehr zu öffnen.

### Die Behebung

Vier Zeilen. Dieselbe Prüfung wie an den drei anderen Stellen, und die Meldung
nennt die Datei und die gezählte Länge:

```js
if (!HEX_PATTERN.test(hex))
  throw new Error(`${keyPath} enthaelt keine 64 Hex-Zeichen, sondern ` +
    `${hex.length} Zeichen. Die Datei ist leer, abgeschnitten oder ` +
    'beschaedigt. Wird sie jetzt ersetzt, ist die vorhandene Datenbank ' +
    'nicht mehr zu oeffnen -- erst die Sicherung der Datei suchen.');
```

Der letzte Halbsatz ist die eigentliche Ansage: wer jetzt eine neue Datei
schreibt, verliert den Bestand.

### Der Beleg

Neue Gruppe in `test/keychange.js`: **„Die Schlüsseldatei: was darin steht,
wird geprüft"**. Vier Formen von Schaden — leer, ein Zeichen zu wenig, ein
Zeichen zu viel, 64 Zeichen ohne Hexzeichen — und zu jeder drei Aussagen:

1. Der Start hält an, und die Meldung nennt die Datei und die gezählte Länge.
2. **Daneben entsteht keine Datenbank.**
3. Die beschädigte Datei steht unverändert da.

Dazu die Gegenprobe: eine Datei mit 64 Hex-Zeichen kommt durch, und die
Datenbank steht daneben. Ohne sie wäre die Gruppe auch dann grün, wenn gar
nichts mehr startete.

---

## 2. Der zweite Befund — `PUT /api/settings` sagt ab, nachdem es geschrieben hat

**`server.js`.** Die Route nimmt zweiunddreißig Schlüssel an, persönliche und
globale. Gezählt am Stand 0.35.0: **13 Absagen — elf mit 400, zwei mit 403 —
und 14 Schreibstellen, ohne Transaktion.**

Ein Rumpf mit `{font: 80, strip: 999}` schrieb `font` und antwortete dann mit
400. Der Aufrufer sah eine Absage und hatte eine Änderung im Bestand.

0.35.0 hatte zwei Stellen vorgezogen: die Ansichten und die Aufräumregel
werden geprüft, bevor die erste Zeile fällt. Die übrigen elf standen noch.

### Die Behebung

Der ganze Rumpf läuft in einer `db.transaction`. Die Absagen werfen, statt zu
antworten:

```js
const refuse = (key, values) => { throw new Message(key, values); };
```

`Message` ist die vorhandene Fehlerklasse aus `auth.js`; sie trägt den
Sprachschlüssel und den Status. Der Wurf verlässt die Transaktion, und die
Transaktion nimmt dabei zurück, was schon geschrieben war. Übersetzt wird erst
im `catch`, über `errorText(req, e)` — denselben Weg, den der Import geht.

**Die beiden Rechteabsagen mit 403 bleiben außerhalb.** Sie stehen vor jeder
Zeile Arbeit und haben nichts zurückzunehmen.

**Die Antwort wird in der Transaktion gebaut und erst danach gesendet.** Sie
liest den Stand, den die Route gerade geschrieben hat; gesendet wird sie, wenn
die Transaktion steht.

**Möglich ist das, weil die Route ganz synchron ist** — kein `await`, kein
`async`. Eine `db.transaction` mit einem `await` darin gibt es nicht:
better-sqlite3 führt die Funktion synchron aus.

**Die fünf Stufeneinstellungen** (`font`, `strip`, `theme`, `linkRows`,
`searchNames`) hatten seit 0.35.0 einen gemeinsamen Schreiber, der `true`
zurückgab, wenn abgesagt worden war. Er heißt jetzt `take` und wirft:

```js
const take = (key) => {
  if (req.body[key] === undefined) return;
  const a = PICK_SETTINGS[key];
  const v = a.cast(req.body[key]);
  if (!a.list.includes(v)) refuse(a.wrong);
  putUserSetting(req.user.id, key, JSON.stringify(v));
};
```

### Der Beleg

Neue Gruppe in `test/roundtrip.js`: **„Eine Absage von `PUT /api/settings`
schreibt nichts"**. Geprüft wird entlang der Reihenfolge im Rumpf — geschrieben
wird immer das, was **vor** der Absage steht, sonst belegte die Gruppe nichts:

| Rumpf | steht danach unverändert |
|---|---|
| `{font: 80, strip: 999}` | die Schrift auf 120 |
| `{strip: 120, theme: 'sepia'}` | der Bildstreifen auf 80 |
| `{theme: 'light', language: 'xx'}` | das Schema auf dunkel |
| `{font: 80, searchOn: []}` | die Schrift auf 120 |
| `{vocabulary: {…}, font: 999}` | das Vokabular Wort für Wort |

Die letzte Zeile ist die globale Hälfte: das Vokabular steht in `settings` und
nicht am Zugang. Die vorletzte ist die Absage hinter **allen** persönlichen
Schreibstellen — Schrift, Streifen, Schema, Blöcke, Linkzeilen, Zeitleiste und
Merkzeitpunkt stehen davor.

Dazu die Gegenprobe: `{font: 80, strip: 120}` geht durch und schreibt beide.

---

## 3. Der dritte Befund — eine Papierkorbzeile, zweimal gleichzeitig zurückgeholt

**`server.js`, `POST /api/trash/:id/restore`.** Dasselbe Muster wie der Link,
den 0.34.4 behoben hat. Die Reihenfolge war:

1. `SELECT * FROM trash WHERE id = ?`
2. `await importInto(envelope, req.user.id, 'merge', source)`
3. `DELETE FROM trash WHERE id = ?`

**Schritt 2 gibt den Event Loop frei** — `importPrepare` rechnet je Foto zwei
Varianten. Trifft in dieser Zeit eine zweite Anfrage auf dieselbe Nummer ein,
sieht auch sie in Schritt 1 die Zeile. Beide spielen ein, beide bekommen 200,
und der Eintrag steht danach zweimal in der Liste. Keine der beiden Antworten
sagt es.

### Warum es kein Einzeiler ist

Der Weg von 0.34.4 — die Zeile mit einem `UPDATE … WHERE … IS NULL` in
Anspruch nehmen — steht hier nicht offen:

* **Eine Spalte an `trash`** wäre die Antwort der Datenbank, verlangt aber eine
  Schemaänderung. Ab 0.33.0 wird nicht mehr migriert.
* **Das `DELETE` vorzuziehen** und es als Anspruch zu benutzen, geht nicht:
  `trash_bytes` hängt mit `ON DELETE CASCADE` an `trash`. Die Bytes wären mit
  der Zeile fort, und ein Rücknehmen verlangte, sie alle im Arbeitsspeicher zu
  halten — genau das, wofür die zweite Tabelle da ist.
* **Eine `db.transaction` um den ganzen Vorgang** gibt es nicht: `importInto`
  ist asynchron.

### Die Behebung

Eine Liste der Nummern, die gerade eingespielt werden, im Prozess:

```js
const trashRestoring = new Set();
```

Die Zeile wird in Anspruch genommen, bevor der Event Loop frei wird — zwischen
`has` und `add` liegt keine Anweisung, die ihn freigibt:

```js
if (trashRestoring.has(z.id))
  return res.status(409).json({ error: t(localeOf(req), 'server.trashRestoring')});
trashRestoring.add(z.id);
claimed = z.id;
```

Freigegeben wird im `finally`, auf jedem Weg. Bliebe die Nummer besetzt, wäre
der Eintrag bis zum Neustart nicht mehr zurückzuholen.

**409 und nicht 404:** die Zeile ist nicht fort, sie ist besetzt. Der Schlüssel
`server.trashRestoring` ist neu — kein vorhandener passt. `server.backupConcurrent`
gilt den Sicherungen, `server.convertRunning` dem Bestandslauf.

**Was die Liste nicht kann:** sie gilt innerhalb dieses Prozesses. Zwei
Serverprozesse auf derselben Datei liefen weiter gegeneinander. Ein Neustart
mitten im Einspielen ist ohnehin ein anderer Fall — dort bleibt die Zeile
liegen, und das ist richtig so.

### Der Beleg

Neue Gruppe in `test/roundtrip.js`: **„Der Papierkorb: zweimal gleichzeitig
zurückholen"**.

1. Für die Probe liegt eine Zeile im Papierkorb. **Der Eintrag trägt zwölf
   Fotos**, und sie sind der Punkt: das Einspielen rechnet je Foto zwei
   Varianten, und erst dieses Rechnen hält den Vorgang lange genug offen, dass
   die zweite Anfrage die Zeile wirklich noch sieht. Mit einem leeren Eintrag
   ist der erste Aufruf fertig, bevor der zweite die Route erreicht — dann
   steht 404 da, und die Probe belegt nichts.
2. **Zwei gleichzeitige Wiederherstellungen: genau eine gelingt.**
3. **Und der Eintrag steht genau einmal da.**
4. Der Verlierer bekommt 409 und nicht 404.
5. Die Papierkorbzeile ist danach fort, ihre Bytes mit.
6. **Die Nummer wird wieder freigegeben** — geprüft auf dem Fehlerweg, denn nur
   dort bleibt die Zeile liegen: eine unlesbare Zeile beantwortet den ersten
   Versuch mit 500 und den zweiten wieder mit 500, nicht mit 409.
7. Und die nächste Zeile lässt sich ohne Weiteres zurückholen.

Punkt 3 fragt nach dem Bestand und nicht nur nach den Antworten. Gelingen
beide, steht der Eintrag zweimal da — das ist der Schaden, und keine der beiden
Antworten nennt ihn.

---

## 4. Der neue Sprachschlüssel

`server.trashRestoring`, in allen drei Dateien:

| | |
|---|---|
| de | Das wird gerade wiederhergestellt. |
| en | That is being restored right now. |
| tr | Bu şu anda geri yükleniyor. |

Damit tragen die drei Dateien **1.212 Schlüssel** statt 1.211. Nachgezogen sind
die neun Wächter, die die Dateien Zeichen für Zeichen gegen ihre
Vergleichsstände halten: `LANG_KEY_COUNT`, `EG_ADDED_AFTER_0312`,
`EG_CHANGED_AFTER_0312_SHARED`, `TR_ADDED_AFTER_0313`, `TR_CHANGED_AFTER_0313`
in `test/release_031.js`, dazu `WORDING_NEW_0351` und die Zahl 1.300 in
`test/source.js`.

---

## 5. Die Rückbauten

Vier neue, **alle vier gefahren, 0 stumm** — je Rückbau ein ganzer Lauf über
7007 Prüfungen, zwei Nebenspuren, rund 300 Sekunden je Spur:

| Nr | was zurückgebaut wird | bestanden | rot |
|---|---|---:|---|
| 1095 | `keys.js` liest die Schlüsseldatei wieder ungeprüft | 6998 | **8 Prüfungen der neuen Gruppe** — alle vier Schadensformen und zu jeder „Und daneben entsteht keine Datenbank" |
| 1096 | Die Einstellungsroute schreibt wieder ohne Transaktion | 7001 | **5 Prüfungen der neuen Gruppe** — jede der fünf Lagen aus der Tafel in Abschnitt 2 |
| 1097 | Das Wiederherstellen nimmt die Zeile nicht in Anspruch | 6999 | **4 Prüfungen der neuen Gruppe**, darunter „genau eine gelingt" und „der Eintrag steht genau einmal da" — dazu drei weitere, siehe unten |
| 1098 | Die Nummer bleibt nach dem Fehlerweg besetzt | 7003 | **1 Prüfung der neuen Gruppe:** „Und den zweiten wieder mit 500 und nicht mit 409 — die Nummer ist frei" |

**Zu jedem der vier kommt „Jeder Suchtext kommt in seiner Datei genau einmal
vor" rot dazu** — der Rückbau ersetzt den Text, den er sucht. Das ist bei jedem
Rückbau so und steht deshalb nicht in der Tafel.

**1097 macht außerdem die beiden Wächter über die Sprachdatei rot** — „Kein
Schlüssel der Sprachdatei steht ohne Leser da" und „Verwendungsprobe: jeder
Schlüssel der Datei wird gerufen". Die zurückgebaute Zeile ist der einzige
Leser von `server.trashRestoring`; fällt sie, steht der Schlüssel ohne Rufer
da. **Der Wächter hätte den fehlenden Anspruch also auch von der Sprachseite
her gefunden.** Der vierte Rote, „Und die Zahl über alles steht ebenso", folgt
daraus, dass der Rückbau zwei Codezeilen entfernt.

**Bei 1098 sind zwei Rote übrig, die nicht zum Rückbau gehören:** „Der
Prüfstand räumt beim Start auf — 0.30.0" und „Und er sagt, was er angefasst
hat". Die Gruppe fragt, ob der Treiber einen liegengebliebenen Server findet,
und sie ist unter Last empfindlich — der Lauf fuhr zwei Spuren gleichzeitig,
also zwei volle Prüfläufe auf derselben Maschine. **Nachgegangen worden ist dem
nicht:** die benannte Gruppe des Rückbaus wird rot, und das ist, wonach der
Rückbau fragt. *Im Lauf ohne Rückbau ist die Gruppe grün.*

---

**Drei vorhandene sind nachgezogen worden** — 147, 757 und 1069. Ihr Suchtext
lag im Rumpf von `PUT /api/settings` und steht dort jetzt vier Spalten weiter
oder gar nicht mehr. Gefunden hat sie nicht der Lauf, sondern ein Abgleich
jedes `search` gegen seine Datei: ein Rückbau, dessen Suchtext nicht mehr
greift, ist stumm und meldet nichts.

---

## 6. Was diese Runde nicht tut

**Sie ändert kein Verhalten, das jemand bestellt hat.** Was sich ändert, sind
drei Antworten, die vorher falsch waren:

* Ein Start mit beschädigter Schlüsseldatei hält jetzt an, statt eine
  unbrauchbare Datenbank anzulegen.
* Eine abgewiesene Einstellungsanfrage lässt den Bestand, wie er war.
* Der zweite von zwei gleichzeitigen Wiederherstellungsversuchen bekommt 409.

**Sie fasst das Schema nicht an.** Der Weg über eine Spalte an `trash` ist
ausdrücklich verworfen (Abschnitt 3).

**Sie rührt `public/style.css` nicht an.** Die Datei gehört zu den achtzehn des
Fingerprints; der eine tote Verweis darin ist Punkt 43 des Sammelblatts.
