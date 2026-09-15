# Änderungsprotokoll 0.33.1 — „Der Anbietername im Containerprotokoll"

**Gebaut am 15. September 2026.** PATCH.

> **FINGERPRINT DIESER RUNDE: `38949534`** — *gerechnet am fertigen Stand,
> davor `9083d8c7`.*

| | vorher | nachher |
|---|---|---|
| Prüfungen | 6858 | **6862** |
| Rückbauten | 990 | **994** |
| Dateien im Sprachwächter | 13 | **14** |
| Schwachstellen laut `npm audit` | 2 mittelschwer | **0** |
| Sprachschlüssel | 1208 | 1208 *(unverändert)* |
| Austauschformat | 17 | 17 *(unverändert)* |

---

## Der Befund

Der Betreiber hat 0.33.0 eingespielt und das Containerprotokoll geschickt.
Darin stand:

```
[Kriterion] Mail delivery: Eigener Server via smtp.strato.de:587 (STARTTLS), sender kriterion@dmrts.de.
```

Die Zeile ist seit 0.33.0 englisch. Der Anbietername ist es nicht.

**Ursache.** `mail.js` führt zu jedem Anbieter einen Namen und, wo es einen
gibt, einen Schlüssel dazu:

| Anbieter | Name | Schlüssel |
|---|---|---|
| `gmx`, `web`, `gmail`, `strato`, `ionos` | GMX, Web.de, Gmail, Strato, IONOS | *(keiner)* |
| `eigen` | Eigener Server | `mail.ownServer` |

Marken heißen in jeder Sprache so und brauchen keinen Schlüssel. „Eigener
Server" ist eine Beschreibung. Die Karte setzt den Schlüssel seit 0.32.0 in
der Sprache des Lesers ein. Die Protokollzeile in `server.js` nahm dagegen
`z.providerName` direkt, also den deutschen Rohwert.

**Behoben** mit zwei Zeilen: die Protokollzeile setzt den Schlüssel jetzt auf
**Englisch** ein — nicht in der Sprache des Lesers, denn das Containerprotokoll
fragt niemanden, welche Sprache eingestellt ist.

```js
const providerShown = z.providerNameKey
  ? t('en', z.providerNameKey) : z.providerName;
```

Am Bildschirm ändert sich nichts. Die Zusage der Karte aus 0.32.0 nennt alle
drei Sprachen einzeln und ist unberührt.

---

## Der eigentliche Fund: warum keine Prüfung ihn gesehen hat

0.33.0 hat eigens eine Restprobe für das Containerprotokoll gebaut
(Abschnitt 5d im Prüfstand). Sie liest die Konsolenaufrufe der sechs
ausgelieferten Dateien und fragt, ob ein deutsches Wortstück darin steht. Sie
hat diesen Satz nicht gefunden, und das war kein Versehen:

> **Sie liest den Quelltext. Dort stand an jener Stelle `${z.providerName}` —
> eine Einsetzung und kein deutsches Wort. Das Deutsche kam erst zur Laufzeit
> herein.**

Ein Wächter, der Text liest, sieht durch eine Einsetzung nicht hindurch. Der
Kommentar von 5d sagt das jetzt und zeigt auf die Stelle, die es kann.

**Was das für künftige Runden heißt:** eine Textprobe deckt ab, was im
Quelltext steht. Was aus einer anderen Datei hereinkommt, muss **gebaut und
gelesen** werden.

---

## Die Prüfungen

**Die vorhandene Zusage ist umgedreht und nicht gelöscht** (Stolperstein 201).
Sie stand in „Der Mailversand: das Passwort steht nirgends" und prüfte:

```
Mail delivery: Eigener Server via 127.0.0.1:   →   Mail delivery: Own server via 127.0.0.1:
```

Diese Zusage startet bereits seit 0.32.0 einen **echten Server** mit
eingerichtetem Zugang auf `eigen` und liest dessen Startausgabe. Sie ist damit
genau die Laufzeitprobe, die der Befund verlangt.

> **EIN ZWEITER SERVER EIGENS DAFÜR WÄRE FALSCH GEWESEN, und der Prüfstand hat
> es vorhergesagt.** Der erste Entwurf stellte eine eigene Gruppe mit eigenem
> Server daneben und nahm dafür die Portbasis **7360** — die nächste freie nach
> oben. Der Lauf wurde an zwei Stellen rot, und der Kommentar an der Portregel
> nannte den Grund wörtlich: *„7360 hätte die Spanne aller Basen auf 3520
> gebracht und damit über den Versatz von 3500."* Die Lage bestand schon; sie
> noch einmal aufzubauen war der Fehler, nicht die Portnummer.

**Drei neue Prüfungen kommen dazu**, und keine braucht einen Server:

| Prüfung | wogegen sie steht |
|---|---|
| „Eigener Server" trägt einen Schlüssel | eine Änderung an `mail.js`, die ihn wegnimmt |
| Eine Marke trägt keinen Schlüssel und behält ihren Namen | ein Fix, der **jeden** Namen durch den Schlüssel jagte — „Strato" würde zum leeren String, und die Laufzeitprobe fände es nicht, sie fährt auf `eigen` |
| Der Schlüssel steht auf Englisch in der Sprachdatei | `mail.ownServer` fällt aus `en.json`, der Server gäbe den Schlüssel selbst aus |

**Eine vierte** steht neben der umgedrehten: „Und «Eigener Server» steht
nirgends in seiner Ausgabe". Die Zeile darüber fragt nach einem Treffer, nicht
nach der Abwesenheit des anderen (Stolperstein 81).

---

## `mail.js` stand außerhalb jeder Sprachprüfung

Beim Nachsehen, welche Wächter die Datei überhaupt ansehen, war die Antwort:
der Sprachwächter nicht. `LANGUAGE_SOURCES` führte 13 Dateien, `mail.js` war
keine davon — bei 181 deutschen Kommentarzeilen.

Die Datei ist jetzt aufgenommen (13 → 14). **Beim Aufnehmen war sie sauber:
null Treffer.** Das ist dieselbe Lücke, die 0.19.3 bei `images.js` und
`batchrun.js` geschlossen hat, und der Kommentar dort hatte sie
vorweggenommen: *„ohne diese Zeile stünden sie außerhalb jeder Sprachprüfung."*

---

## Die Abhängigkeiten

`npm audit` meldete zwei mittelschwere Schwachstellen in `qs`, eingeschleppt
über `express`. `npm audit fix`:

| Paket | vorher | nachher |
|---|---|---|
| `express` | 4.22.2 | **4.22.3** |
| `qs` | 6.15.3 | **6.16.0** |
| `qs` *(zweite, verschachtelte Fassung)* | 6.16.0 | **entfernt** |

Danach: **0 Schwachstellen.** Die Bereiche in `package.json` sind unberührt;
bewegt hat sich nur das Lockfile.

*Dieser Punkt stammt aus der Sicherheitsdurchsicht vom 15. September 2026 und
stand dort ausdrücklich als „gehört in den nächsten Patch und nicht in die
Runde 0.36.0".*

---

## Die Gegenproben

**Vier neue (1053 bis 1056), 0 STUMM.**

| Nr | Rückbau | namentlich rot geworden |
|---|---|---|
| **1053** | Die Protokollzeile nimmt wieder den rohen Anbieternamen | „Nach einem Neustart nennt die Startzeile Anbieter, Server und Absender", „Und «Eigener Server» steht nirgends in seiner Ausgabe" |
| **1054** | Die Protokollzeile jagt auch Marken durch den Schlüssel | „Eine Marke trägt keinen Schlüssel und behält ihren Namen", „Und die fünf Marken heißen in jeder Sprache gleich" |
| **1055** | Der englische Name des eigenen Servers fällt weg | 8 Prüfungen in 5 Gruppen, darunter „Und der Schlüssel steht auf Englisch in der Sprachdatei" |
| **1056** | Der Sprachwächter verliert `mail.js` wieder | „Der Sprachwächter sieht alle vierzehn Quelltextdateien an" |

> **ZWEI VON IHNEN HABEN BEIM ERSTEN LAUF INS LEERE GEGRIFFEN**, und der Grund
> gehört aufgeschrieben: **der Treiber patcht eine Kopie aus
> `git archive HEAD` und nicht den Arbeitsstand.** 1053 und 1056 zeigten auf
> Zeilen, die noch nicht committet waren, und meldeten „RÜCKBAU GESCHEITERT"
> statt eines Fundes. **Wer einen Rückbau auf eine frische Zeile setzt,
> committet zuerst.** Der Hinweis steht jetzt im Prüfstand neben der Zahl der
> Rückbauten.

### Eine Beobachtung, die nicht zu dieser Runde gehört

Rückbau **1055** macht in beiden Läufen zusätzlich zwei Prüfungen in „Der
Prüfstand räumt beim Start auf — 0.30.0" rot. Ein Zusammenhang mit der
geänderten Zeile ist nicht zu sehen; der Rückbau fasst nur `en.json` an. Beide
Läufe fuhren auf zwei Spuren. **Der Prüfstand allein gefahren ist grün
(6862 von 6862).** Die Ursache ist nicht untersucht worden — sie gehört nicht
in einen Patch, der eine Protokollzeile berichtigt. **Beim nächsten
Gegenprobenlauf ist darauf zu achten.**

---

## Was diese Runde NICHT tut

- **Sie ändert am Bildschirm kein Wort.** Die Anbieternamen in der Karte
  stehen weiter in der Sprache des Lesers.
- **Sie fasst `mail.js` nicht an** — außer, dass der Prüfstand die Datei jetzt
  ansieht.
- **Sie ändert das Austauschformat nicht.** Es bleibt 17.
- **Sie berührt keine Datenbank.** Kein Schema, keine Migration, keine neue
  Zeile in den Einstellungen.
