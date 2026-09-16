# Änderungsprotokoll 0.34.4 — „Zwei Funde aus der Messung"

Gebaut am 16. September 2026, auf 0.34.3. PATCH.

Die Messung zur 0.35.0 hat am 16. September 2026 fünf Sicherheitsbefunde
gebracht. Drei gehen nach 0.36.0. Die beiden hier sind je wenige Zeilen, und
einer davon betrifft den Prüfstand selbst — deshalb stehen sie vor der
0.35.0 und nicht dahinter.

| | vorher | nachher |
|---|---:|---:|
| Gleichzeitige Einlösungen desselben Links, die gelingen | 2 | **1** |
| Ein Modul stirbt nach seiner Meldung — der Lauf gilt als | bestanden | **gescheitert** |
| Prüfungen | 6893 | **6903** |
| Gruppen in der Schlusstafel | 349 | **350** |
| Rückbauten | 998 | **1000** |

> **FINGERPRINT DIESER RUNDE: `1f76adac`** — der Stand davor war `ecbbd5fc`.
>
> Er ändert sich, weil `auth.js` drei Zeilen mehr trägt und weil `package.json`
> die neue Versionsnummer trägt. Der zweite Fund liegt in `testbench.js` und
> geht nicht in den Fingerprint ein: der Prüfstand wird nicht ausgeliefert.

---

## 1. Wie die beiden gefunden wurden

**Nicht, weil etwas rot war.** Beide sind beim Lesen gefunden worden, in der
Messung zur 0.35.0: siebzehn Leser über den ganzen Quelltext, 101 Befunde, 75
nach der Widerlegung. Fünf davon waren Sicherheitsbefunde.

Das ist der Punkt, den beide gemeinsam haben. Der Prüfstand fuhr grün, während
beide Lücken offen standen — die erste, weil keine Prüfung zwei Anfragen
gleichzeitig stellte; die zweite, weil der Prüfstand sich an dieser Stelle
selbst nicht prüfte.

---

## 2. Der erste Fund — ein Link, zweimal gleichzeitig eingelöst

**`auth.js`, `redeemToken`.** Ein Einladungs- oder Zurücksetzungslink gilt
einmal. Die Reihenfolge war:

1. `checkToken` fragt: steht der Link noch auf `used_at IS NULL`?
2. `await hashPassword(newPassword)` — scrypt, absichtlich langsam.
3. `UPDATE tokens SET used_at = … WHERE hash = ?` — ohne Bedingung.
4. Das neue Passwort wird geschrieben.

**Schritt 2 gibt den Event Loop frei.** Trifft in dieser Zeit eine zweite
Anfrage mit demselben Link ein, sieht auch sie in Schritt 1 einen freien Link.
Beide laufen durch. Am Ende steht das Passwort der zweiten Anfrage in der
Datenbank, `used_at` ist einmal gesetzt, und der Absender der ersten kommt mit
dem Passwort, das er gerade gesetzt hat, nicht herein.

Nachgestellt worden ist der Fall in der Messung auf einer Kopie der Datenbank:
**zwei gleichzeitige Aufrufe von `POST /api/token/redeem` gelangen beide.**

### Die Behebung

Die Zeile nimmt den Link jetzt in Anspruch, statt ihn nur zu stempeln:

```js
const taken = db.prepare(
  "UPDATE tokens SET used_at = datetime('now') WHERE hash = ? AND used_at IS NULL"
).run(token.hash);
if (!taken.changes) throw new Message('server.linkExpired');
```

`changes` ist 1 für den, der zuerst da war, und 0 für jeden weiteren. Die Zeile
steht in der Transaktion, also nimmt der `throw` alles zurück, was der Verlierer
schon geschrieben hätte. Er bekommt dieselbe Antwort wie bei einem abgelaufenen
Link — **`server.linkExpired`, ein vorhandener Schlüssel, keine neue Meldung.**

Die teure Rechnung bleibt außerhalb der Transaktion. Der Verlierer hat sein
Passwort umsonst gehasht; das ist der Preis dafür, dass die Transaktion nicht
über eine scrypt-Rechnung offen steht.

### Der Beleg

Vier neue Prüfungen in `test/roundtrip.js`, Gruppe **„Der Token: der
Rundlauf"** — Abschnitt 7, hinter der Probe, die denselben Link *nacheinander*
zweimal einlöst. Die alte Probe fängt den Fall nicht: sie prüft eine andere
Lage.

1. Für die gleichzeitige Probe steht ein frischer Link bereit.
2. **Zwei gleichzeitige Einlösungen desselben Links: genau eine gelingt.**
3. **Und es trägt das Passwort dessen, dem sie zugesagt wurde.**
4. Der Link ist danach verbraucht.

Punkt 3 fragt ausdrücklich nach dem **Gewinner** und nicht danach, ob
irgendeines der beiden Passwörter trägt — das wäre in beiden Fällen wahr.
Gelingen beide Einlösungen, steht am Ende das Passwort des Zweiten da, und der,
dem die 200 zugesagt wurde, kommt nicht herein.

**Gegengeprüft am 16. September 2026, zweimal gefahren:** mit der Fassung von
0.34.3 werden Punkt 2 und Punkt 3 rot — **20 von 22** in der Gruppe, beide Male
dieselben zwei.

---

## 3. Der zweite Fund — der Treiber las nur die Meldung

**`testbench.js`, `runModule`.** Seit 0.34.0 fährt jedes Prüfmodul als eigener
Prozess. Es schreibt seine Zahlen in eine Datei, der Treiber liest sie und zählt
sie zusammen. Das Ende eines Moduls sieht so aus (`test/frame.js`):

1. Die Meldung wird geschrieben.
2. Der Hauptserver und die Nebeninstanzen werden beendet.
3. Das Wegwerfverzeichnis wird entfernt.
4. `process.exit(abort ? 1 : (failed ? 1 : 0))`.

**Stirbt das Modul zwischen 1 und 4**, liegt eine vollständige und grüne Meldung
da, und der Rückgabewert ist trotzdem nicht 0. Der Treiber las bis 0.34.3 nur
die Meldung. Ein solcher Lauf zählte als bestanden.

Der Treiber sah den Rückgabewert genau einmal an — dann nämlich, wenn *gar
keine* Meldung dastand. Die Lage „Meldung da, Rückgabewert schlecht" fiel
zwischen die beiden Fälle.

### Die Behebung

```js
if (!report.abort && !report.failed && r.status !== 0) {
  console.log(`\n  ✗ Das Modul ${name} meldet keinen Fehler, endete aber mit` +
    ` Rueckgabewert ${r.status}, Signal ${r.signal}`);
  H.addCounters({ passedCount: 0, failed: 1, … });
}
```

Eine rote Zeile mit Zahl und Signal, und eine gezählte gescheiterte Prüfung —
damit der Lauf auch rot *endet* und nicht nur rot *aussieht*.

### Der Beleg

Eine Probe in `test/frame.js`, unmittelbar hinter dem Schreiben der Meldung und
vor dem Aufräumen:

```js
if (process.env.TESTBENCH_DIE_AFTER_REPORT === name) process.exit(9);
```

Sie greift nur, wenn die Umgebungsvariable den Modulnamen trägt. Ein gewöhnlicher
Lauf merkt nichts davon.

Darauf eine neue Gruppe **„Der Treiber sieht den Rueckgabewert — 0.34.4"** in
`test/selfcheck.js`, sechs Prüfungen. Sie fährt einen Teillauf des Treibers als
eigenen Prozess — gefiltert auf eine Gruppe, die nur `test/source.js` trägt,
weil dieses Modul keinen Server startet: **4,1 Sekunden und keine Portnummer.**

1. Die Probe liegt zwischen Meldung und Aufräumen (gelesen aus `test/frame.js`).
2. Der Teillauf läuft überhaupt.
3. **Das Modul meldet seine Zahlen noch** — „5 von 6 Prüfungen bestanden".
4. **Und der Treiber nennt den Rückgabewert beim Wert** — „endete aber mit
   Rueckgabewert 9".
5. Und es ist die einzige rote Zeile.
6. Der Lauf endet rot.

Punkt 2 ist die Gegenprobe am Leser: käme aus dem Kindprozess gar nichts, wäre
jede Verneinung darunter wahr. Punkt 3 und 5 zusammen sind der Kern — die fünf
Zahlen des Moduls sind angekommen, und die sechste Prüfung ist die des Treibers.

**Gegengeprüft am 16. September 2026:** mit der Fassung von 0.34.3 sind vier der
sechs rot, und der Treiber meldet für einen Lauf, dessen Modul mit Rückgabewert
9 gestorben ist, **„5 von 5 Prüfungen bestanden — alles in Ordnung"**.

---

## 4. Die Rückbauten

Zwei neue, **1000 sind es jetzt**, davon **20** auf Dateien des Prüfstands.

| Nr. | Datei | was zurückgebaut wird | erwartete Gruppe |
|---|---|---|---|
| 1061 | `auth.js` | `AND used_at IS NULL` fällt weg | Der Token: der Rundlauf |
| 1062 | `testbench.js` | die Bedingung wird `false` | Der Treiber sieht den Rueckgabewert — 0.34.4 |

Beide Zahlen stehen ausdrücklich im Prüfstand: `test/selfcheck.js` zählt die
Rückbauten und die Teilmenge auf Prüfstandsdateien.

**Gefahren am 16. September 2026, zwei Nebenspuren, je 312 Sekunden: 0 stumm.**
Jede ist rot in genau der Gruppe, die ihr Eintrag nennt — 1061 mit 6900 von
6903, 1062 mit 6898 von 6903.

---

## 5. Eine Meldung, die den Bericht verfälscht hat

Die Prüfung „Das Modul meldet seine Zahlen noch" nannte im Fehlerfall die Zeile
des Teillaufs im Wortlaut: **„5 von 5 Pruefungen bestanden — alles in
Ordnung"**. `counterproof.js` liest mit `readRun` genau dieses Muster
(`\d+ von \d+ Pruefungen bestanden`) als Gesamtzahl des Laufs und nimmt den
**ersten** Treffer im Protokoll.

Folge: im ersten Gegenprobenlauf stand für 1062 **„5 von 5 bestanden"** statt
6898 von 6903. Die roten Punkte und das Urteil „0 stumm" waren richtig, die Zahl
daneben nicht.

Die Meldung nennt jetzt nur noch die Zahlen (`bestanden 5 von 5`) und nicht den
Satz, in dem sie stehen. Derselbe Lauf meldet danach 6898 von 6903.

---

## 6. Was ausdrücklich nicht gebaut wurde

- **Die drei übrigen Sicherheitsbefunde** aus der Messung bleiben bei 0.36.0:
  dasselbe Muster beim Wiederherstellen aus dem Papierkorb (`server.js:4780`),
  die ungeprüft gelesene Schlüsseldatei (`keys.js:86`) und `PUT /api/settings`,
  das neunmal absagt, nachdem es schon geschrieben hat (`server.js:1655`).
  Sie sind größer als wenige Zeilen.
- **Keine Schemaänderung.** Die Spalte `used_at` gab es schon; sie wird nur
  jetzt auch als Bedingung gelesen.
- **Keine neue Meldung an den Benutzer.** Der Verlierer bekommt
  `server.linkExpired`, den es schon gab.
- **Nichts an der Oberfläche.**
