# Änderungsprotokoll 0.34.1 — „Die Kommentare werden knapp"

Gebaut am 16. September 2026, auf 0.34.0. PATCH.

Die Runde ändert am Programm nichts. Sie ändert, was in den Kommentaren steht
und wie viele es sind.

| | vorher | nachher |
|---|---:|---:|
| Kommentarzeilen über 34 Dateien | 38.366 | **14.170** |
| Anteil am Quelltext | 39,2 % | **19,2 %** |
| höchster Anteil einer Datei | 85 % (`images.js`) | **26 %** (`server.js`) |
| deutsche Bezeichner im Prüfstand | 131 | **13** |
| Prüfungen | 6865 | **6881** |
| Gruppen in der Schlusstafel | 345 | **347** |
| Rückbauten | 998 | **998** |
| `CHANGELOG.md` | 2.303 Zeilen | **1.668** |
| `README.md` | 3.244 Zeilen | **2.500** |

> **FINGERPRINT DIESER RUNDE: `3cc525dc`** — der Stand davor war `af69ce33`.
>
> Nachgerechnet über dieselben 18 Dateien, die der Handgriff in der README
> nennt. Zwölf davon haben sich geändert: elf, weil Kommentarzeilen gefallen
> sind, und `package.json`, weil sie die neue Versionsnummer trägt.
> **Anwendungscode ist nicht angefasst:** die Codeteile jeder geänderten Datei
> stehen vorher und nachher Byte für Byte gleich.

---

## 1. Die Regel

Der Auftrag nennt sie in einem Satz: **ein Kommentar sagt, was die Stelle
tut.** Dazu gehört, was die Runde weggenommen hat:

- **Erzählung.** Wie es dazu kam, wer es gemeldet hat, was vorher dastand.
- **Stolpersteinverweise.** „Stolperstein 81", „derselbe Fall wie 0.19.1" —
  Entscheidung des Betreibers am 16. September 2026: alle weg. Wo die
  Begründung gebraucht wird, steht sie im Änderungsprotokoll der Runde, die
  sie getroffen hat.

  > **BERICHTIGT AM 16. SEPTEMBER 2026, nach 0.34.2.** Hier stand „alle weg",
  > während **367 von 1.061** noch dastanden. Diese Runde hat **694**
  > weggenommen — die, die in einem gekürzten Kommentar standen. Die übrigen
  > 367 fallen mit **0.34.3**, samt einer Prüfung über die Null.
- **Wiederholung des Codes.** Was die Zeile darunter selbst sagt.

Geblieben ist, was der Code nicht sagt: die gemessene Zahl, der Grund für eine
Reihenfolge, die Absage an einen naheliegenden Weg.

**Zwei Kommentarsorten bleiben unangetastet:** die Kopfzeilen der Dateien und
die Texte, die eine Prüfung namentlich sucht (Abschnitt 6).

---

## 2. Die Zielformel — ein Befund vor dem Bauen

Der Auftrag rechnete in seiner zweiten Tabelle mit **0,20 × Gesamtzeilen**.
Das ist die falsche Formel: nimmt man einer Datei mit 100 Zeilen, davon 40
Kommentar, so viel weg, dass 20 Kommentarzeilen übrig bleiben, hat sie danach
80 Zeilen und einen Anteil von **25 %**, nicht 20 %.

Gerechnet wird deshalb mit **0,25 × Codezeilen**. Der Anteil danach ist
25/(100+25) = **20 %**. Über alle 34 Dateien gemessen: 59.657 Codezeilen,
Ziel 14.914, erreicht 14.170 — **19,2 %**.

**Die Zählart ist in derselben Frage festgelegt worden:** eine Zeile zählt als
Kommentarzeile, sobald sie irgendeinen Kommentarteil trägt. `code(); // Hinweis`
ist damit eine Kommentarzeile. Ohne diese Festlegung gab es für `server.js` zwei
Zahlen — 5.128 nach dieser Zählart, 3.826, wenn nur ganze Kommentarzeilen
zählen.

---

## 3. Die Zahlen, Datei für Datei

Gemessen mit `tools/comments.js`, das denselben Zerleger benutzt wie die
Wächter (`tools/segments.js`).

| Datei | Kommentar vorher | nachher | Anteil |
|---|---:|---:|---:|
| `test/roundtrip.js` | 6.549 | 3.123 | 17 % |
| `public/app.js` | 6.419 | 1.816 | 19 % |
| `server.js` | 5.128 | 1.426 | **26 %** |
| `counterproof.js` | 3.229 | 1.455 | 16 % |
| `test/source.js` | 2.074 | 595 | 25 % |
| `test/ui_style.js` | 1.318 | 566 | 21 % |
| `test/ui_system.js` | 1.245 | 703 | 18 % |
| `test/release_031.js` | 1.208 | 385 | 24 % |
| `test/ui_overview.js` | 1.148 | 490 | 18 % |
| `test/dom.js` | 985 | 330 | 22 % |
| `test/ui_export.js` | 971 | 453 | 23 % |
| `test/ui_entry.js` | 929 | 499 | 15 % |
| `auth.js` | 911 | 269 | 22 % |
| `test/selfcheck.js` | 843 | 110 | 19 % |
| `test/ui_language.js` | 716 | 274 | 21 % |
| `test/frame.js` | 555 | 150 | 22 % |
| `images.js` | 537 | 27 | 22 % |
| `test/ui_inventory.js` | 531 | 241 | 17 % |
| `test/release_030.js` | 471 | 241 | 22 % |
| `db.js` | 467 | 272 | 21 % |
| `batchrun.js` | 349 | 28 | 17 % |
| `test/ui_translator.js` | 250 | 104 | 23 % |
| `test/batchrun.js` | 238 | 88 | 19 % |
| `testbench.js` | 224 | 70 | 24 % |
| `mail.js` | 193 | 40 | 19 % |
| `attachments.js` | 156 | 66 | 24 % |
| `test/keychange.js` | 138 | 70 | 15 % |
| `test/release_029.js` | 133 | 61 | 18 % |
| `keys.js` | 122 | 45 | 23 % |
| `twofactor.js` | 116 | 34 | 24 % |
| `keytool.js` | 70 | 55 | 18 % |
| `usertool.js` | 51 | 51 | 20 % |
| `test/firstlogin.js` | 47 | 30 | 15 % |
| `public/theme.js` | 45 | 3 | 21 % |
| **alle 34** | **38.366** | **14.170** | **19,2 %** |

**Keine Datei liegt über 30 %.** Am höchsten steht `server.js` mit 26 %,
danach `test/source.js` mit 25 %. Die 30-%-Ausnahme des Auftrags war für
`images.js` und `batchrun.js` vorgesehen und ist nicht gebraucht worden: sie
liegen bei 22 % und 17 %.

---

## 4. Der Namenswächter sieht jetzt den Prüfstand

Der Befund aus Abschnitt 3 des Auftrags: die Liste `SHIPPED` in `test/source.js`
enthielt 13 ausgelieferte Dateien. `testbench.js`, `counterproof.js` und alles
unter `test/` standen außerhalb.

Gebaut ist die **zweite Liste** und nicht die Umbenennung der ersten: `SHIPPED`
heißt weiter so und meint weiter die ausgelieferten Dateien; daneben steht
`BENCH` mit den 19 Modulen unter `test/`, `testbench.js` und
`counterproof.js` — **21 Dateien**.

**131 deutsche Bezeichner standen darin. 13 sind übrig**, und die 13 sind keine
Benennungen, sondern Gegenstände von Prüfungen:

| Bezeichner | wofür er dasteht |
|---|---|
| `Abbild`, `Faden` | zwei abgelegte Wörter, die der Wortfilter sucht |
| `absender`, `anbieter`, `benutzer`, `marke`, `passwort`, `vorlage` | die sechs alten Feldnamen im gestellten Bestand |
| `ausschnitt`, `fokus` | zwei Funktionen, deren Fehlen geprüft wird |
| `Haptik` | ein Kriterienname im gestellten Bestand |
| `standbild_base64` | ein Feld des Austauschformats |
| `PORT_VERSATZ` | der alte Name einer Umgebungsvariablen |

**Befund, nicht gebaut:** `standbild_base64` ist ein Feldname des
Austauschformats 17 und wird in `server.js` geschrieben. Ihn umzubenennen wäre
eine Änderung am Austauschformat und damit Anwendungscode — Abschnitt 9 des
Auftrags schließt das aus. Der Name steht deshalb als benannte Ausnahme da.

**Zusage 6a** ist eine eigene Prüfung: ein deutscher Dateiname unter `test/`
macht sie namentlich rot. Sie ist der Fall, an dem 0.34.0 vorbeigelaufen ist —
17 von 19 Dateinamen waren deutsch, und der Lauf blieb grün.

---

## 5. Die Ersatztexte der Rückbauten

Der zweite Befund des Auftrags: `counterproof.js` führt zu jedem Rückbau einen
`search`- und einen `replacement`-Text. Der Suchtext muss im Quelltext stehen,
sonst greift der Rückbau nicht — das prüft der Gegenprobenlauf. **Den
Ersatztext prüfte niemand.** Ein Ersatztext, der auf einen Namen von gestern
zeigt, macht den Rückbau rot, ohne zu prüfen, was sein Name sagt.

Gebaut sind zwei Prüfungen in `test/selfcheck.js`:

- **Die schwache Form** über alle 998 Rückbauten: jedes Wort jedes Ersatztextes
  muss irgendwo in den 45 JS- und HTML-Dateien des Projekts vorkommen.
- **Die strenge Form** über die 19 Rückbauten auf Dateien des Prüfstands: dort
  wird nur gegen die Zieldatei, die beiden Rahmen, den Suchtext und die
  eingebauten Namen geprüft.

---

## 6. Was beim Kürzen aufgefallen ist

**Fünf Rückbauten hingen an einem Kommentar**, der gefallen ist — 291, 479,
515, 541 und 747. Zusage 3 des Auftrags sagt, was dann zu tun ist: nachziehen,
nicht löschen. Alle fünf zeigen jetzt auf die neue Kommentarzeile derselben
Stelle, und die Zahl der Rückbauten bleibt bei 998.

**Alle fünf sind am fertigen Stand nachgefahren worden — 0 STUMM.** Jeder trifft
die Gruppe, die sein Eintrag nennt:

| # | Datei | rote Prüfungen | erwartete Gruppe getroffen |
|---|---|---:|---|
| 291 | `public/app.js` | 6 | Die Glocke in der Kopfzeile |
| 479 | `server.js` | 2 | Die berichtigten Behauptungen stehen nirgends mehr |
| 515 | `batchrun.js` | 15 | Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3 |
| 541 | `public/app.js` | 9 | Die Ansicht kann fort sein — 0.19.6 |
| 747 | `public/app.js` | 8 | Die Sprachpillen der Namenskarten — 0.24.5 |

*Jeder von ihnen macht daneben „Jeder Suchtext kommt in seiner Datei genau
einmal vor" rot — der Ersatztext steht dann zweimal da. Das ist der erwartete
Nebenbefund und keine zweite Meldung.*

**Sechs Kommentartexte sucht der Prüfstand namentlich.** Sie sind beim ersten
Durchgang mitgefallen und wieder eingesetzt:

- `server.js`: „os.cpus() IST IM CONTAINER NICHT DIE WAHRHEIT"
- `server.js`: „substr() AUF EINEM BLOB LIEST DAS BLOB" samt dem Block darum
- `server.js`: „400 ZEILEN A 512 kB (312 MB)" und „1338,8 ms"
- `db.js`: „WAS BEIM OEFFNEN LAEUFT — UND DASS ES ZWEIMAL DARF"
- `attachments.js`: das dritte Vorkommen von „Anlage"

Sie stehen seither in einer Vorprüfung, die nach jedem Kürzen läuft.

**Drei Prüfungsnamen in `test/ui_style.js` nennen eine Zahl, die über
Kommentare geht**, und mussten mit — benannte Ausnahme zu Zusage 2, die sonst
sagt, dass kein Prüfungsname sich ändert. Der Grund ist derselbe: das Wort
„Anlage" stand in `public/app.js` nur noch in Kommentaren, und die sind
gefallen.

| vorher | nachher |
|---|---|
| „In den Kommentaren derselben Datei stehen unveraendert 39 Vorkommen" | „… 8 Vorkommen" |
| „Und neun der elf ausgelieferten Dateien kennen es gar nicht mehr" | „Und zehn …" |
| „Und beide Ausnahmen zeigen wirklich auf etwas" | „Und die eine Ausnahme zeigt wirklich auf etwas" |

**Die Ausnahmeliste `ALLOWED` führt `public/app.js` nicht mehr.** Eine
Erlaubnis über eine leere Liste ist keine Erlaubnis; übrig ist die eine Stelle
in `server.js`, an der das Wort Teil eines Bezeichners ist.

---

## 7. Der Beleg, dass nur Kommentar gefallen ist

Nach jedem Kürzen läuft `codesame.js`: es nimmt den Stand vor und nach dem
Schnitt, entfernt aus beiden die Kommentarteile und vergleicht den Rest **Byte
für Byte**. Für jede der zwölf ausgelieferten Dateien und für jede Datei des
Prüfstands ist er gleich geblieben.

Das ist die Zusage aus Abschnitt 9 des Auftrags: keine Zeile Anwendungscode.
Der Fingerprint ändert sich trotzdem, weil er über die ganzen Dateien geht und
nicht über ihre Codeteile.

---

## 8. CHANGELOG und README

**`CHANGELOG.md`: 2.303 → 1.668 Zeilen**, den Eintrag dieser Runde
eingerechnet. Die sechzehn Einträge von 0.9.1 bis
0.8.6 standen in der Form ihrer Zeit — Fließtext mit Begründung, Abschnitte
„Was gleich bleibt" und „Beim Einspielen". Sie stehen jetzt als Liste aus
hinzugefügt, geändert und entfernt, mit einem Kasten nur dort, wo etwas zu tun
ist. Gelöscht ist dabei nichts.

Berichtigt: die Zeile zu 0.30.0 nannte `TESTBENCH_ZEIT=1`. Der Schalter heißt
seit 0.34.1 `TESTBENCH_TIME`; der alte Name steht daneben.

**`README.md`: 3.244 → 2.500 Zeilen.** Entscheidung des Betreibers am
16. September 2026: das Handbuch bleibt vollständig, gekürzt wird die
Begründung im Satz. Jede Funktion ist weiter beschrieben.

Zwei Abschnitte sind ganz entfallen, weil sie begründen statt zu beschreiben:
„Warum jede Zeile so dasteht" (48 Zeilen) und „Ein Papier ist Prüfstoff" (46).
Gekürzt sind unter anderem Bedienung, Rollen und Benutzer, Einstellungen, Auf
dem Handy, Sichern, Datenmodell, Den Schlüssel wechseln, Erstinstallation,
Vokabular und Dateien am Eintrag.

Zwei Titel nennen die Sache: „Die Kästen der Übersicht" statt „Die Kästen —
Kaffeesatz und Kartenstapel", „Der Prüfschalter" statt „Der Prüfschalter — und
warum er in einer benutzten Installation nichts zu suchen hat".

Vier Metaphern sind heraus (`CLAUDE.md`, Abschnitt 1): „ein Griff statt n",
„von Haus aus", `das Auffangnetz für ein DELETE von Hand`, „Eine unbrauchbare
Datei bringt Kriterion nicht um".

**Eine Auslassung ist dabei berichtigt worden.** Beim Kürzen des Abschnitts
„Wenn eine Version die Datenbank anfasst" fiel der Satz „er braucht den
Zwischenschritt über 0.8.0, die letzte Version, die ihn noch lesen konnte" mit
weg. Die Prüfung „Es sind genau sechs Nennungen und keine mehr" in
`test/source.js` hat es gefunden — sie zählt die Versionsnummern in der README,
und jede einzelne steht da, weil sie eine Handlung bestimmt. Der Satz ist
wieder drin.

---

## 9. Das Werkzeug

**`tools/segments.js` spricht englisch.** Der Zerleger, der eine Datei in
CODE-, TEXT-, COMMENT- und REGEX-Teile schneidet, trug deutsche Namen:
`zerlege`, `zerlegeJs`, `zusammen`, `texte`, `KOMMENTAR`, das Feld `wert`. Sie
heißen jetzt `segment`, `segmentJs`, `joined`, `texts`, `COMMENT`, `value`.
Umbenannt mit `tools/rename.js`, dem sicheren Umbenenner aus 0.24.1, der nur
CODE-Teile anfasst; 20 Proben bestanden.

**`tools/comments.js` ist neu.** Es zählt, schreibt die Tabelle und trägt die
Zahlen in `test/selfcheck.js` ein:

```
node tools/comments.js            # Tabelle
node tools/comments.js --write    # Zahlen in test/selfcheck.js eintragen
```

`--write` prüft vor dem Schreiben, dass Zeilenzahl und Gruppenzahl der Datei
danach unverändert sind, und bricht sonst ab. Der Grund ist ein Fehler beim
Bauen: der erste Ausdruck fasste die Zeilenumbrüche falsch und hat drei Gruppen
in `test/selfcheck.js` überschrieben.

---

## 10. Die drei neuen Wächter

| Gruppe | Datei | was sie hält |
|---|---|---|
| „Der Pruefstand spricht Englisch — 0.34.1" | `test/source.js` | 21 Dateien, 13 benannte Ausnahmen, kein deutscher Dateiname |
| „Die Ersatztexte der Rueckbauten — 0.34.1" | `test/selfcheck.js` | jedes Wort jedes Ersatztextes kommt im Projekt vor |
| „Die Kommentare je Datei — 0.34.1" | `test/selfcheck.js` | 34 Zahlen, die Summe, ≤ 20 % über alles, keine Datei über 30 % |

Die letzte Gruppe trägt die beiden bindenden Grenzen des Auftrags als `check`
(Zusagen 4 und 5).

---

## 11. Was ausdrücklich nicht gebaut wurde

- **Keine Zeile Anwendungscode.** Keine Route, keine Abfrage, kein Feld, kein
  Schema, kein Austauschformat, keine Schwelle.
- **Keine Zusage an den Prüfstand ist gefallen** — auch keine Begründung einer
  Zusage. Neue `check`-Zeilen sind ausdrücklich erlaubt, und es sind 16
  dazugekommen.
- **`standbild_base64` ist nicht umbenannt** (Abschnitt 4).
