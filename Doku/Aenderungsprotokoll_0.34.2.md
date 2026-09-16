# Änderungsprotokoll 0.34.2 — „Die Anleitung bekommt ein eigenes Papier"

Gebaut am 16. September 2026, auf 0.34.1. PATCH.

Die Runde ändert am Programm nichts. Sie teilt die README in zwei Dateien.

| | vorher | nachher |
|---|---:|---:|
| `README.md` | 2.501 Zeilen | **1.091** |
| `manual-de.md` | — | **1.438** |
| zusammen | 2.501 | 2.529 |
| Prüfungen | 6881 | **6888** |
| Gruppen in der Schlusstafel | 347 | **348** |

> **FINGERPRINT DIESER RUNDE: `5ade984f`** — der Stand davor war `3cc525dc`.
>
> Er ändert sich an genau einer Stelle: `package.json` trägt die
> Versionsnummer. **Kein Byte Anwendungscode ist angefasst**, und `README.md`
> steht nicht auf der Liste der 18 Dateien, über die er geht.

---

## 1. Der Befund

Die README trug nach 0.34.1 **2.501 Zeilen**. Gemessen, wofür:

| Teil | Zeilen | Anteil | wer das liest |
|---|---:|---:|---|
| **Bedienung im Browser** | **1.450** | **58 %** | wer damit arbeitet, nach dem Einspielen |
| Betrieb | 725 | 29 % | wer die Installation aufsetzt |
| Innenansicht | 253 | 10 % | wer am Code arbeitet |
| Einstieg | 73 | 3 % | wer überlegt, ob er es nimmt |

**58 % richten sich an einen Leser, der die Installation schon laufen hat.**
Der liest zu einem anderen Zeitpunkt als der, der `docker compose up` tippt.
Auf GitHub ist die README die Landeseite; dort steht dieser Teil im Weg.

---

## 2. Der Schnitt

**Die Linie ist: was außerhalb des Browsers passiert, bleibt in der README.**
Dazu die Innenansicht, weil sie zum Code gehört und nicht zur Bedienung —
„Dateien am Eintrag" sagt das in seinem ersten Satz.

| `README.md` | `manual-de.md` |
|---|---|
| Einstieg, Woraus es gebaut ist | Anmeldung |
| Erstinstallation | Der zweite Faktor |
| Auf dem Server | Rollen und Benutzer |
| Der Schlüssel | Wer was darf · Wer was geschrieben hat |
| Eine neuere Version einspielen | Zwei Titel |
| Verschlüsselung | Bedienung |
| Hinter einem Reverse Proxy | Auf dem Handy und auf dem Tablett |
| Gescheiterte Anmeldungen aussperren | Sprache · Vokabular |
| Dateien am Eintrag · Kurzvideos | Hell oder dunkel · Schriftgröße |
| Speicherbedarf · Sichern · Datenmodell | |
| Prüfen · Den Schlüssel wechseln | |

**Die Datei heißt `manual-de.md`.** Das Suffix nennt die Sprache, in der sie
geschrieben ist — dieselbe Form wie bei den Sprachdateien unter
`public/languages/`. In deutscher Prosa heißt sie weiter „das Handbuch".

**Drei Unterabschnitte sind hochgestuft worden.** „Hinter einem Reverse Proxy",
„Beide Wege zugleich" und „Gescheiterte Anmeldungen aussperren" standen unter
„Anmeldung → Der zweite Faktor". Sie betreffen den Server und bleiben; ihr
Elternabschnitt ist fortgezogen. Aus `####` wird `##` beziehungsweise `###`.

**An der Stelle, an der „Anmeldung" stand, steht jetzt ein Verweis** und keine
zweite Erklärung. Dasselbe oben im Kopf der README und im Kopf des Handbuchs.

---

## 3. Die Naht — und was sie kostet

Der Schnitt trägt nur, solange keine Sache an zwei Stellen steht. Vier
Querverweise laufen über die Naht und sind Verweise geblieben:

| von | nach |
|---|---|
| README, Erstinstallation | Handbuch, „Rollen und Benutzer" |
| README, Tafel „Was danach eingerichtet werden kann" | Handbuch, die einzelnen Karten |
| Handbuch, Bildstreifen | README, „Kurzvideos" |
| Handbuch, Karte „Sicherung" und „Alte Sicherungen" | README, „Sichern" |

**Ein Verweis in der Tafel und nicht eine zweite Tafel:** „Was danach
eingerichtet werden kann" nennt acht Karten mit je einer Zeile. Das ist die
Liste für den ersten Start und keine Beschreibung; was die Karten tun, steht
im Handbuch.

---

## 4. Was am Prüfstand zu tun war

**Der Rahmen liest jetzt zwei Dateien.** Neben `readmeFlat` steht
`handbookFlat` in `test/frame.js`.

**Zwei Prüfungen sind umgezogen**, weil ihr Gegenstand umgezogen ist:

| Prüfung | Datei | liest jetzt |
|---|---|---|
| „Dafuer steht sie in der README" → „… im Handbuch" | `test/ui_style.js` | `handbookFlat` |
| „Die Begruendung steht dafuer in der README" → „… im Handbuch" | `test/ui_system.js` | `handbookFlat` |

**Die Nummernprüfung liest beide Dateien zusammen.** Sie hält fest, dass in der
Anleitung keine Versionsnummer steht, die nichts bestimmt — sechs Nennungen von
drei Nummern. Nach dem Schnitt stehen fünf in der README und eine im Handbuch.
Wer nur eine der beiden läse, sähe eine gekürzte Zahl für eine ungekürzte
Zusage. Die Prüfung heißt deshalb „Die Anleitung nennt …" statt „Die README
nennt …".

**Der Sprachwächter sieht `manual-de.md`.** Er liest `Doku/*.md` und die Dateien
im Wurzelverzeichnis namentlich; das Handbuch steht jetzt neben `README.md` und
`CHANGELOG.md` in derselben Liste.

**Rückbau 368 ist nachgezogen**, nicht gelöscht: sein Suchtext
(„**Über der Liste steht eine Reihe von Ansichten**") ist mit der Bedienung ins
Handbuch gewandert. `file` steht auf `manual-de.md`, der Name heißt jetzt „Die
Anleitung erzaehlt wieder, seit wann etwas gilt". Die Zahl der Rückbauten
bleibt bei **998**.

---

## 5. Der neue Wächter

Gruppe **„Die Anleitung liegt in zwei Dateien — 0.34.2"** in `test/selfcheck.js`,
sieben Prüfungen:

1. Beide Dateien tragen wirklich etwas (über 800 Zeilen je Datei).
2. Und beide haben mehr als fünf Abschnitte.
3. **Kein Abschnitt steht in beiden Dateien.** Eine Überschrift an zwei Stellen
   ist der Anfang zweier Fassungen derselben Sache.
4. Die README nennt das Handbuch beim Namen.
5. Und das Handbuch die README.
6. Die Bedienung steht vollständig im Handbuch — sechs Abschnitte namentlich.
7. Und der Betrieb vollständig in der README — zehn Abschnitte namentlich.

Punkt 3 ist der eigentliche Wächter. Die beiden Listen in 6 und 7 machen einen
zurückgewanderten Abschnitt namentlich rot, statt ihn stillschweigend
hinzunehmen.

---

## 6. Was ausdrücklich nicht gebaut wurde

- **Keine Zeile Anwendungscode.** Keine Route, keine Abfrage, kein Feld, kein
  Schema, kein Austauschformat, keine Schwelle.
- **Kein Satz ist umgeschrieben worden.** Die 1.438 Zeilen des Handbuchs sind
  dieselben Zeilen, die vorher in der README standen — bis auf die vier
  Querverweise aus Abschnitt 3 und den Kopf.
- **Keine Hilfe in der Anwendung.** Ein Knopf, der das Handbuch im Browser
  zeigt, wäre eine neue Route und damit Anwendungscode.
