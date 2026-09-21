# Änderungsprotokoll 0.34.3 — „Kein Stolpersteinverweis mehr"

Gebaut am 16. September 2026, auf 0.34.2. PATCH.

Die Runde ändert am Programm nichts. Sie nimmt die letzten 367
Stolpersteinverweise aus den Kommentaren und stellt eine Prüfung darüber.

| | vorher | nachher |
|---|---:|---:|
| Stolpersteinverweise in Kommentaren | 367 | **0** |
| Kommentarzeilen über 34 Dateien | 14.188 | **14.151** |
| Anteil am Quelltext | 19,2 % | **19,2 %** |
| Prüfungen | 6888 | **6893** |
| Gruppen in der Schlusstafel | 348 | **349** |

> **FINGERPRINT DIESER RUNDE: `ecbbd5fc`** — der Stand davor war `5ade984f`.
>
> Er ändert sich, weil in fünf ausgelieferten Dateien Kommentarzeilen gefallen
> sind und weil `package.json` die neue Versionsnummer trägt. **Anwendungscode
> ist nicht angefasst:** die Codeteile jeder geänderten Datei stehen vorher und
> nachher Byte für Byte gleich, nachgewiesen für alle 26 Dateien.

---

## 1. Der Befund

Die Entscheidung des Betreibers vom 16. September 2026 lautete **„alle weg"**.
0.34.1 hat sie zur Hälfte umgesetzt, ohne dass es auffiel: **694 von 1.061**
Verweisen fielen — nämlich die, die in einem Kommentar standen, der ohnehin
gekürzt wurde. **367 blieben stehen**, und drei Papiere sagten trotzdem „alle".

Aufgefallen ist es nicht durch eine Prüfung, sondern durch die Frage des
Betreibers, ob die Runde vollständig sei. **Dasselbe Muster wie bei den
Kommentarzahlen vor 0.34.1:** eine Zusage ohne Zähler ist von ihrer Erosion
nicht zu unterscheiden.

---

## 2. Was gefallen ist

| Form | Zahl | wie |
|---|---:|---|
| Klammer mitten im Satz — `… (Stolperstein 81)` | **346** | mit `stolper.js`, das nur COMMENT-Teile anfasst |
| Punkt, der danach allein auf einer Zeile stand | 20 | an das Ende der Zeile darüber gezogen |
| gebrochen oder ohne Klammer | **21** | von Hand, Stelle für Stelle |

Die 21 von Hand sind keine Klammern, sondern tragende Satzteile:
„— Stolperstein 47.", „Stolperstein 102: was die Oberfläche …", „und er ist die
Antwort auf Stolperstein 8". Jeder Satz ist so umgeschrieben, dass er ohne die
Nummer steht und dasselbe sagt.

**Mitgefallen ist eine Metapher**: in `test/roundtrip.js` stand
`JEDE MESSUNG LÄUFT ÜBER EIN EIGENES AUFFANGNETZ`.
Sie steht auf der Liste in `CLAUDE.md`,
Abschnitt 1, und heißt jetzt „JEDE MESSUNG WIRD EINZELN ABGEFANGEN".

---

## 3. Die eine Stelle, die bleibt

`counterproof.js` nennt in seiner Meldung an den Wirt eine Nummer:

```js
console.error(`  PORT ${p}  horcht — …` +
              `horchende(r) Port (Stolperstein 139).`);
```

**Das ist ein Text und kein Kommentar.** Ihn zu ändern hieße, Code zu ändern,
und die Runde ändert keinen. Die Stelle steht als benannte Ausnahme in der
Prüfung — mit ihrer Zahl, damit eine zweite auffällt.

---

## 4. Der Wächter

Neue Gruppe **„Kein Stolpersteinverweis mehr — 0.34.3"** in `test/source.js`,
fünf Prüfungen. Sie lässt sich allein fahren: `node testbench.js Stolperstein`,
0,2 Sekunden.

1. Der Wächter sieht alle **34** Dateien.
2. Und er liest wirklich Kommentarzeilen — über 10.000.
3. **Kein Kommentar nennt mehr einen Stolperstein** — 1.061 waren es vor 0.34.1.
4. Der Leser würde einen Verweis melden (Gegenprobe am Wächter selbst).
5. Außerhalb der Kommentare steht die Nummer noch **genau einmal**.

Punkt 2 und 4 sind die Gegenproben am Wächter: ein Leser, der nichts findet,
macht jede Verneinung darauf wahr.

---

## 5. Die berichtigten Sätze

Drei Stellen sagten „alle weg", während 367 dastanden. Sie sagen jetzt, was
0.34.1 wirklich getan hat, und nennen 0.34.3 für den Rest:

| Papier | wo |
|---|---|
| `Doku/Aenderungsprotokoll_0.34.1.md` | Abschnitt 1, als Berichtigungskasten |
| `Doku/Projektstand_…md` | der Kasten am Planabschnitt |
| `CHANGELOG.md` | der Eintrag 0.34.1, Abschnitt „Intern" |

---

## 6. Nachgeholt aus 0.34.2

**Rückbau 368 ist gegengeprüft.** Er zeigt seit 0.34.2 auf `manual-de.md`; der
billige Beleg stand (sein Suchtext greift genau einmal), der teure nicht.
Gefahren am 16. September 2026: **0 stumm**, 6885 von 6888, rot in „Der
Sprachwaechter" — der Gruppe, die sein Eintrag nennt.

---

## 7. Was ausdrücklich nicht gebaut wurde

- **Keine Zeile Anwendungscode.**
- **Keine Zusage an den Prüfstand ist gefallen.** Fünf `check`-Zeilen sind
  dazugekommen.
- **Die Meldung in `counterproof.js` ist nicht geändert** (Abschnitt 3).
