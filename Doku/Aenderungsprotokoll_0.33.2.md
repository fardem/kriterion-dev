# Änderungsprotokoll 0.33.2 — „Elf deutsche Sätze und ein roher Schlüssel"

**Gebaut am 15. September 2026.** PATCH.

> **FINGERPRINT DIESER RUNDE: `d6dbb696`** — *gerechnet am fertigen Stand,
> davor `38949534`.*

| | vorher | nachher |
|---|---|---|
| Prüfungen | 6862 | **6865** |
| Rückbauten | 994 | **998** |
| Deutsche Sätze im Containerprotokoll | 11 | **0** |
| Rohe Schlüssel im Containerprotokoll | 1 | **0** |
| Sprachschlüssel | 1208 | 1208 *(unverändert)* |

---

## Der Befund

Der Betreiber hat 0.33.1 eingespielt und das Protokoll geschickt. Darin stand:

```
[Kriterion] Backup location: off -- server.backupDirNotSet
```

Das ist ein interner Schlüssel und kein Satz. Der Betreiber konnte damit nichts
anfangen — und er hätte gerade genau diese Auskunft gebraucht: sein
`BACKUP_DIR` war beim Umstellen der `.env` auf die neuen Namen verlorengegangen,
die Sicherungen liefen nicht.

Der Satz, den die Zeile schuldig blieb:

> *No backup folder is set up. The docker-compose.yml mounts it and names it as
> BACKUP_DIR — the two belong together.*

---

## Drei Stellen, ein Fall

Nachgesehen wurde nicht nur die gemeldete Zeile, sondern **alle 38
Konsolenaufrufe der sechs ausgelieferten Dateien, die einen Wert einsetzen.**
Drei davon geben Deutsch oder einen Schlüssel aus:

| Stelle | Was herauskam | Anzahl |
|---|---|---|
| `server.js` · Sicherungsort | `situation.reason` — ein Schlüssel | 5 mögliche Gründe |
| `server.js` · PUBLIC_ADDRESS | `PUBLIC.problem` — deutsche Sätze aus `auth.js` | **6 Sätze** |
| `server.js` · `languageSkip` | der Grund, warum eine Sprachdatei übergangen wurde | **5 Sätze** |

**Alle drei sind derselbe Fall wie der Anbietername in 0.33.1: der Rahmen der
Zeile ist englisch, der eingesetzte Wert nicht.**

### Was gebaut wurde

**BA 1 — die Sicherungszeile übersetzt ihren Grund.** Auf Englisch und nicht in
der Sprache des Lesers, aus demselben Grund wie in 0.33.1: das
Containerprotokoll fragt niemanden, welche Sprache eingestellt ist.

```js
`off -- ${t('en', situation.reason, situation.values)}`
```

**Die Werte reisen mit.** Drei der fünf Gründe nennen den Ordner; ohne
`situation.values` stünde dort wörtlich `{folder}`.

**BA 2 — die sechs Sätze der PUBLIC_ADDRESS-Probe** in `auth.js` sind englisch.
Sie bekommen weiterhin **keinen** Sprachschlüssel: einen Text zu übersetzen,
den nur das Containerprotokoll sieht, hieße ihn drei Mal zu pflegen.

**BA 3 — die fünf Gründe an `languageSkip`** ebenso.

---

## Sie waren kein Versehen von 0.33.0

**Das ist der Teil, der aufgeschrieben gehört.** Die elf Sätze standen
namentlich in `SERVER_REST_NAMED` — der Liste des erlaubten deutschen Rests in
den drei Serverdateien. Mit Begründung, in Sorte 2:

> *„Die sechs Sätze der PUBLIC_ADDRESS-Probe landen ausschließlich in
> `console.warn` — `auth.js` sagt es an Ort und Stelle: der Satz darin ist der
> eine Text dieser Datei, der auf dem **Bildschirm des Wirts** landet."*

**Diese Begründung war richtig, solange das Protokoll deutsch sprach.** Seit
0.33.0 spricht der Bildschirm des Wirts englisch — dieselbe Begründung verlangt
seither das Gegenteil.

> **UND DIE AUSNAHME IST TROTZDEM STEHENGEBLIEBEN, weil eine benannte Ausnahme
> aussieht wie eine entschiedene.** *Wer beim Bauen von 0.33.0 die Liste las,
> fand zu jedem Eintrag einen Grund und ging weiter. Der Grund war aber an eine
> Voraussetzung geknüpft, die dieselbe Runde gerade umgestoßen hatte.*
>
> **Die Regel daraus: wer eine Voraussetzung ändert, liest die Ausnahmen noch
> einmal, die auf ihr stehen.** Eine Liste benannter Ausnahmen ist keine
> Abnahme; sie ist eine Sammlung von Behauptungen mit Datum.

Die Liste ist um die elf erleichtert. Die Kommentare an Sorte 1 und Sorte 2
sagen, was war und warum es nicht mehr gilt. Der Wächter prüft in beide
Richtungen — kein unbenannter Rest, **und kein benannter, den es nicht mehr
gibt** —, also hätte eine stehengelassene Zeile die Runde rot gemacht.

---

## Warum keine Prüfung es gesehen hat

Zum zweiten Mal dieselbe Antwort, und sie ist jetzt belegt statt vermutet:

- **Die Restprobe 5d** liest die Konsolenaufrufe. Dort steht an allen drei
  Stellen eine **Einsetzung** — `${situation.reason}`, `${PUBLIC.problem}`,
  `${why}`. Kein deutsches Wort im Quelltext.
- **Die Restprobe 5c** schneidet die Konsolenaufrufe weg und fragt, was übrig
  bleibt. Sie **sah** die elf Sätze — und ließ sie durch, weil sie namentlich
  erlaubt waren.

Beide Proben haben getan, was sie sollen. Die Lücke lag zwischen ihnen.

---

## Die Prüfungen

**Die Zusage „Der Start sagt es im Protokoll" hat den Fehler festgenagelt.** Sie
fragte:

```
/Backup location: off -- .*backupInDataDir/
```

— also nach genau dem rohen Schlüssel, der der Befund ist. **Umgedreht und
nicht gelöscht** (Stolperstein 201): sie fragt jetzt nach dem Satz, den ein
Mensch lesen kann.

**Drei neue Zusagen stehen daneben:**

| Prüfung | wogegen sie steht |
|---|---|
| Und kein roher Schlüssel steht mehr in seiner Ausgabe | eine Zeile, die beides nebeneinander schreibt (Stolperstein 81) |
| Und ein fehlender Ordner steht mit seinem Namen im Protokoll | der Ruf verliert `situation.values` |
| Und keine Platzhalterklammer bleibt darin stehen | dasselbe, von der anderen Seite gefragt |

> **DIE PRÜFLAGE FÜR DIE WERTE LÄUFT AUF DER PORTBASIS 4360**, die der Server
> davor nach seinem Stopp freigibt. Sie ist im ganzen Lauf sonst nirgends
> vergeben. **Eine eigene Basis wäre die falsche Antwort gewesen** — der
> Wächter über die Spanne aller Basen sagt warum, und 0.33.1 ist genau daran
> einmal hängengeblieben.

---

## Die Gegenproben

**Vier neue (1057 bis 1060), 0 STUMM.**

| Nr | Rückbau | namentlich rot geworden |
|---|---|---|
| **1057** | Die Sicherungszeile schreibt den Schlüssel wieder roh hin | 6 Prüfungen in 3 Gruppen, darunter „Der Start sagt es im Protokoll" |
| **1058** | Der Grund der Sicherungszeile reist ohne seine Werte | „Und ein fehlender Ordner steht mit seinem Namen im Protokoll", „Und keine Platzhalterklammer bleibt darin stehen" |
| **1059** | Die PUBLIC_ADDRESS-Probe antwortet wieder auf Deutsch | „Restprobe server.js: kein fester deutscher Satz erreicht mehr den Bildschirm" |
| **1060** | Der Grund einer übergangenen Sprachdatei wird wieder deutsch | dieselbe |

Dazu zwei vorhandene Rückbauten nachgezogen: **710 und 711** suchten die
deutschen `languageSkip`-Zeilen und zeigen jetzt auf die englischen
(Stolperstein 201 — nachziehen, nicht löschen).

---

## Was diese Runde NICHT tut

- **Sie ändert am Bildschirm kein Wort.** Keiner der elf Sätze erreicht ihn.
- **Sie legt keinen Sprachschlüssel an.** Die elf Sätze bleiben schlüssellos;
  sie gehen nur ins Containerprotokoll.
- **Sie berührt keine Datenbank** und ändert das Austauschformat nicht.
