# Auftrag 0.17.1 — „Was der Benutzer sieht"

**Sechs Handgriffe aus einem Rundlauf von Hand**, gemeldet am 30. August 2026,
unmittelbar nachdem 0.17.0 gebaut war. **Fünf sind Wortlaut und Anzeige, einer
ist ein echter Fehler** — das Video, das im Vollbild ein zweites Mal anfängt.

**Der größte Posten ist der harmloseste:** aus **Anlage** wird **Instanz**, und
zwar überall. Das ist ein Wort, keine Funktion — aber es steht an über
vierhundert Stellen, und eine davon ist eine **Adresse**.

---

## 0. Was vor dem ersten Handgriff zu tun ist

> **0.17.0 IST GEBAUT UND GESCHOBEN, ABER NOCH NICHT IM FELD BESTÄTIGT.** Die
> laufende Anlage muss nach dem Einspielen **`1b6bb5d2`** melden — Systembereich
> → **Datenbank** → Kennzahlen. **Meldet sie etwas anderes, ist das ein Befund
> und kein Rundungsfehler** (Stolperstein 158): dann liegt auf dem Wirt eine
> Datei, die kein Commit trägt.
>
> **DREI HANDGRIFFE BELEGEN 0.17.0 IM FELD**, und sie stehen noch aus:
> *(a)* einen Eintrag mit **mehreren Kriterien** an einer Instanz mit **einem
> einzigen Zugang** ansehen — Namen und Sternreihen müssen untereinander
> stehen —, und im selben Zug auf die Gesamtnote klicken: der Erklärkasten muss
> auf die Spalte **Note** verweisen, die in ihm selbst steht.
> *(b)* die **Glockentafel** öffnen: dort muss stehen, **was** neu ist, und
> darunter, **von wem**.
> *(c)* die **Anmeldeseite auf dem Telefon** aufrufen, **ohne zu scrollen** —
> die Versionszeile muss dastehen.
>
> **Die Ergebnisse gehören ins Änderungsprotokoll dieser Runde**, sobald sie da
> sind. Fällt einer davon durch, ist das ein Befund für 0.17.1 und kein
> Nebensatz.

**Weiterhin ausstehend, unverändert seit 0.16.0:** der Teilexport ein drittes
Mal mit Mitschrift — **und ein Teil in eine Zweitanlage eingespielt, nicht in
die laufende** —, sowie beide Netze am echten Wirt. *Beides kostet keine Zeile
Code und ist nur am echten Bestand zu haben.*

---

## Die Nummer: PATCH, und diesmal ohne Streit

**0.17.1.** Abschnitt 5.1 des Projektstands: *„Dritte Zahl (PATCH) nur für
abwärtskompatible Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist
keine PATCH-Runde."*

**Diese Runde bringt keine Funktion.** Sechs Handgriffe an Wortlaut, Anordnung
und einem Fehler; die Anlage kann danach nichts, was sie vorher nicht konnte.
**Auch die Umbenennung ist Wortlaut** — und die eine Adresse, die sich dabei
ändert, wird abwärtskompatibel gehalten (Punkt 4).

> **ZUR ABGRENZUNG, damit niemand sie hereinzieht:** der **engere Bildausschnitt**
> und das **wählbare Bildformat** sind besprochen und **gehören nicht in diese
> Runde** — beide brauchen eine gespeicherte Angabe mehr und sind damit MINOR.
> Sie stehen im Fahrplan bei der **Bildablage**. Und die **Optik** bekommt eine
> eigene Runde; was dort entschieden ist, steht am Ende dieses Auftrags.

---

## 1. Der Text im Kachel „Zugang" stimmt nicht und sagt zu viel

**Befund.** Unter den Feldern steht:

> *„Die Adresse ist freiwillig. Sie wird für genau zwei Dinge gebraucht: den
> Einladungs- oder Rücksetzlink per Mail und die Testmail im Mailversand. Ohne
> sie fehlt nichts — der Link steht wie immer zum Kopieren bereit. Mindestens
> 10 Zeichen. Über die Oberfläche gibt es keine Wiederherstellung; vergessen
> heißt `docker compose exec kriterion node zugang.js passwort <name>` auf dem
> Server."*

**Drei Sachen sind daran falsch:**

1. **„Freiwillig" stimmt nicht, wenn die Selbstanmeldung an ist.** Dann ist die
   Adresse **Pflicht** — ohne sie kommt keine Bestätigungsmail an. *Der Satz muss
   sich danach richten, was gerade gilt, und nicht eine Lage behaupten.*
2. **„Mindestens 10 Zeichen" steht am falschen Feld.** Das ist die Vorgabe fürs
   **Passwort**, nicht für die Adresse. **Nachsehen und dorthin schreiben, wo es
   hingehört** — oder streichen, wenn es dort schon steht.
3. **Der Server-Befehl geht die meisten nichts an.** Ein gewöhnlicher Benutzer
   hat keinen Zugriff auf den Wirt; ihm nützt der Befehl nichts und er ist eine
   Auskunft über den Betrieb, die er nicht braucht.

**GEBAUT WIRD:**

* **Der Befehl steht nur beim Eigentümer.** *Er ist der Einzige, der in der
  Regel auch am Server sitzt.* **Für alle anderen steht dort ein Satz, der ihnen
  wirklich hilft:** wer sein Passwort vergessen hat, **wendet sich an den
  Admin.**
* **Der Absatz wird kürzer.** Vorschlag, gern schärfer: *„Wird für den
  Einladungs- oder Rücksetzlink per Mail gebraucht und für die Testmail im
  Mailversand. Ohne sie steht der Link wie immer zum Kopieren bereit."* — und
  bei eingeschalteter Selbstanmeldung stattdessen der Satz, dass sie **gebraucht
  wird**.
* **Die Klemme sitzt an derselben Stelle wie die Karte selbst** und nicht an
  einer zweiten Abfrage daneben (Stolperstein 47).

> **DIE FRAGE FÜR DIESEN PUNKT:** *was hilft dem, der davorsteht — und was
> erzählt ihm nur, wie es gebaut ist?* Abschnitt 5.6 des Projektstands, seit
> 0.17.0: **eine Oberfläche sagt, WAS IST.**

---

## 2. Kacheln nutzen ihre Höhe nicht

**Befund.** „Meine Sitzungen" hat Platz und blendet trotzdem einen Rollbalken
ein; darunter stehen zehn Anmeldungen, sichtbar sind drei. **Dasselbe bei den
Tags** unter „Bestand" — und damit an jeder Liste, die so gebaut ist.

**Ursache.** `.manage-list` trägt eine **feste** Höhe und `overflow-y: auto`.
Die Kachel wird höher, weil ihre Nachbarin höher ist — die Liste darin bleibt,
wo sie war.

**GEBAUT WIRD: die Liste bekommt die Höhe, die die Kachel hergibt**, und rollt
**erst dann**, wenn sie wirklich überläuft. In einer Kachel, die ohnehin eine
Spalte ist, heißt das `flex: 1` und **`min-height: 0`** an der Liste.

> **`min-height: 0` IST DER PUNKT, AN DEM ES SONST SCHEITERT.** Ohne die Zeile
> wächst ein Flex-Kind über seinen Anteil hinaus, statt zu rollen — die Kachel
> wird dann länger als ihre Nachbarn und das Raster verrutscht. *Wer nur
> `max-height` streicht, bekommt genau das.*

**DAS GILT NICHT NUR HIER.** Sitzungen, Tags, Kategorien, Kriterien, Zugänge,
Anfragen — **eine Regel, nicht sechs.** *Wo eine Liste aus einem eigenen Grund
kurz bleiben soll, steht der Grund als Satz daneben.*

**Am Prüfstand:** `jsdom` misst keine Höhe. **Geprüft wird die Regel im
Stilblatt** — dass keine Liste mehr eine feste Höhe trägt und dass die
Zeilen wirklich alle gezeichnet werden. *Das ist keine Prüfung ihrer Wirkung,
und über der Gruppe steht ausdrücklich, dass sie es nicht ist.*

---

## 3. Der Mailversand ordnet sich

**Befund.** Der Kachel ist breit, das Auswahlfeld „Eigener Server" ist es auch —
über die ganze Breite für sechs Einträge. Darunter stehen sechs Felder
untereinander, jedes über die volle Breite. **Der Platz ist da und wird nicht
genutzt.**

**GEBAUT WIRD — geordnet nach der Frage, die jede Reihe beantwortet:**

| Reihe | Felder |
|---|---|
| **wer** | **Anbieter**, allein und **etwa ein Drittel breit** |
| **wohin** | **Server** *(breit)* · **Port** *(schmal)* · **Verschlüsselung** |
| **womit** | **Benutzername** · **Passwort beim Anbieter** |
| **als wer** | **Absenderadresse**, allein |

**Die Absenderadresse steht allein**, weil unter ihr **zwei eigene Hinweissätze**
stehen — sie klebten sonst unter drei Feldern und niemand wüsste, auf welches
sie sich beziehen.

**Auf dem Telefon fällt alles wieder untereinander.** *Eine Reihe, die auf 366
Pixeln drei Felder nebeneinander zwingt, ist schlechter als die Spalte, die es
vorher war.*

**Der Zustandsblock oben** (Zustand · Passwort · Öffentliche Adresse · Zuletzt
erfolgreich getestet) **bleibt, wie er ist.**

---

## 4. Aus „Anlage" wird „Instanz"

**Entscheidung des Betreibers, 30. August 2026.** Das Wort **Anlage** trägt in
dieser Anwendung die ganze Installation — *„die Anlage speichert weder Adresse
noch Browserkennung"* —, und es passt nicht. **Englisch wäre das *instance*;
deutsch heißt es ab jetzt Instanz.**

**ÜBERALL, und das ist der Punkt.** Nicht nur der Reiter im Systembereich,
sondern jede sichtbare und jede kommentierte Stelle.

**Zum Umfang, als Anhaltspunkt und nicht als Zusage — nachzuzählen ist selbst:**

| Datei | Vorkommen |
|---|---:|
| `public/app.js` | 53 |
| `server.js` | 40 |
| `auth.js` | 18 |
| `db.js` | 13 |
| `zugang.js` | 2 |
| `public/index.html` | 1 |
| `README.md` | 59 |
| `Doku/Projektstand_…` | 153 |
| `Doku/Fehler_und_Ideen.md` | 18 |

> **WAS NICHT ANGEFASST WIRD — und das ist keine Bequemlichkeit, sondern die
> Regel:** die **abgeschlossenen Änderungsprotokolle** älterer Versionen und die
> **CHANGELOG-Einträge bis einschließlich 0.17.0**. *Was einmal draußen war,
> bleibt, wie es war* (Semantic Versioning, Punkt 3, und der Kasten am Kopf von
> `CHANGELOG.md`). **Der neue Eintrag für 0.17.1 schreibt „Instanz".**

> **ZWEI FALSCHE FREUNDE, beide in `server.js`, beide meinen ANHÄNGE und nicht
> die Installation:**
> * Zeile 3013: *„Einzige Stelle, die **Anlagen**bytes ausliefert."*
> * Zeile 3801: *„… **Anlagen** nicht zwei gleichnamige Dateien im Ordner
>   ablegen."*
>
> **Ein Suchen-und-Ersetzen über das ganze Repo macht daraus Unsinn.**
> *`anlegen`, `Anlegen` und `angelegt` sind ein anderer Wortstamm und werden von
> einer Ersetzung auf `Anlage` nicht getroffen — nachgesehen wird trotzdem.*

**DIE ADRESSE IST DER EINZIGE HARTE TEIL.** Der fünfte Abschnitt des
Systembereichs trägt den Schlüssel `anlage`, und daraus wird eine Adresse:

```
#/system/anlage   →   #/system/instanz
```

**Die alte Adresse muss weiter verstanden werden.** Sie steht in Lesezeichen,
in älteren Papieren und womöglich in einer Mail. **Sie wird still übersetzt,
nicht abgewiesen** — dieselbe Bauform wie `delete f.neu` in 0.17.0 und wie der
Schlüssel `abgelehnt` in 0.15.0. *Ein Link, der ins Leere führt, ist eine
Mitteilung ohne Weg.*

**Und die Beschriftung des Reiters** heißt dann **„Instanz"**.

*Der Sprachwächter hat gegen „Instanz" nichts einzuwenden — das Wort steht auf
keiner seiner Listen.*

---

## 5. Die Zeile einer Sitzung steht schief

**Befund.** In „Meine Sitzungen" stehen **angemeldet** und **zuletzt gesehen**
nebeneinander in einer Reihe, unterschiedlich lang, und das sieht aus wie ein
Versehen.

**GEBAUT WIRD:** beide Zeitangaben **rechtsbündig und untereinander**, links
der Name der Anmeldung. *Reine Sache des Stilblatts; der Aufbau bleibt.*

**Der orangene Rahmen der eigenen Anmeldung bleibt**, und er muss weiterhin bis
zum Rand reichen — das war Punkt 4b von 0.17.0 und darf nicht zurückfallen.

---

## 6. Das Video fängt im Vollbild ein zweites Mal an

**DER EINZIGE ECHTE FEHLER DIESER RUNDE.**

**Befund.** Läuft am Eintrag ein Video und man drückt auf Vollbild, öffnet sich
die Lightbox **mit einem eigenen `<video>`** — und das innere spielt weiter.
Zwei Abspieler, zwei Tonspuren, zwei Stellen im Film.

**Die Ursache steht in `openLightbox()`:** die Lightbox baut sich ihren eigenen
Abspieler (`<video class="lb-video">`) und lädt die Quelle noch einmal.

**GEBAUT WIRD: ein fliegender Wechsel.** Beim Öffnen übernimmt der Abspieler der
Lightbox **Stelle und Zustand** des inneren, der innere wird **angehalten**;
beim Schließen geht es denselben Weg zurück. *Für den, der davorsteht, ist es
dasselbe Video, nur größer.*

> **DREI STELLEN, AN DENEN ES SONST WIEDER AUSEINANDERGEHT:**
> * **Beim Blättern** in der Lightbox — das Anhalten gibt es schon, der Wechsel
>   muss dazu passen.
> * **Beim Löschen aus dem Vollbild** — danach gibt es das Video nicht mehr,
>   und der innere Abspieler darf nicht auf eine Adresse zeigen, die weg ist.
> * **Beim Schließen mit Escape** — derselbe Weg wie über das Kreuz, nicht ein
>   zweiter daneben.

**Am Prüfstand:** eine Lage, die belegt, dass **genau ein** Abspieler läuft —
gezählt an den Elementen und an ihrem Zustand, nicht an einer Klasse
(Stolperstein 223). **Dazu die Gegenlage:** ohne Video verhält sich die
Lightbox wie bisher.

*`jsdom` spielt nichts ab. Was sich dort belegen lässt: dass es die zweite
Quelle nicht mehr gibt und dass der innere Abspieler angehalten wird.*

---

## Bauregeln

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; **„Desktop"** und nicht
  „Schreibtisch"; die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch nicht für den Prüfstand.
* **Keine Zugangsdaten im Gespräch.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
* **KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE FORMATNUMMER.** Es bleibt bei
  **sieben** markierten Blöcken und bei **Austauschformat 11**. *Kommt deine
  Durchsicht zu einem anderen Ergebnis, ist das ein Grund anzuhalten und zu
  fragen, nicht stillschweigend abzuweichen.*
* **Die Sicherung des Datenverzeichnisses ist Empfehlung und nicht Pflicht** —
  keine Datenbankstufe. **Sag es im Einspielweg deutlich.**
* **`F_ROUTEN` bleibt bei 69.** *Keiner der sechs Punkte braucht eine
  schreibende Route.* **Nachzählen, nicht annehmen.**
* **Achtzehn Karten in fünf Abschnitten**, acht persönliche Schlüssel — beides
  unverändert.
* **Kommentare sind zeitlos.** Eine fachliche Warnung ja, eine Entstehungs-
  geschichte nein — **außer dort, wo eine zurückgenommene Entscheidung sonst
  wiederkäme** (Stolperstein 201).
* **Neue Stolpersteine zählen bei 236 weiter.** 235 ist vergeben.
* **TAGS WERDEN NICHT MEHR GESETZT** — kein Tag, kein Tag-Push. Der
  Vergleichseintrag im Changelog wird trotzdem geschrieben; er gehört zur Form.
* **Die Frage an jede Gruppe bleibt:** *was sieht ein Betreiber, der allein
  arbeitet?*

### Zu den Agenten — rationell und nicht ängstlich

**0.17.0 hat daran zwei Stunden und ein paar Millionen Token verloren.** Die
Lehre ist nicht „keine Agenten", sondern:

1. **Nie gegen einen wandernden Arbeitsbaum.** Fast jeder Agent meldete als
   Erstes *„der Befund ist überholt"* — er las einen Stand, den es nicht mehr
   gab. **Ein Nachlauf gehört gegen einen festgeschriebenen Commit.**
2. **Nie neben einem laufenden Prüflauf oder einer Gegenprobe.** Spur 0 der
   Gegenprobe fährt **ohne Portversatz**, also auf denselben Portbasen wie
   `npm test`. Ein Agent, der daneben einen Prüflauf startet, reißt sie ab —
   und der Bericht meldet „ABGERISSEN", was wie ein Befund über den Rückbau
   aussieht (Stolperstein 231).
3. **Einer mit einer scharfen Frage schlägt sechzehn mit einer weichen.**

**Und aufgeräumt wird nach Prozessnummer, nie nach Namen** — ein
`pkill -f "node pruefung.js"` trifft die Läufe aller Spuren.

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst** — abgebrochene Läufe
  hinterlassen Server mit `ppid=1` auf den festen Portbasen, und der nächste
  Lauf wird davon rot, ohne dass am Code etwas falsch wäre. *Brichst du doch
  einen ab, räum die Server auf und sag es.*
* **`Doku/Aenderungsprotokoll_0.17.1.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 236**), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (**vorher: 4630**),
  Rückbauten vorher/nachher (**vorher: 333**), Offengebliebenes — **und die
  Ergebnisse der Feldbelege aus Abschnitt 0, sobald sie da sind.**
* Die Zeile „0.17.1 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
  *Rechne ihn am Schluss noch einmal nach.*
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: die Kachel „Zugang" **als
  gewöhnlicher Benutzer** ansehen (der Server-Befehl darf dort nicht stehen),
  „Meine Sitzungen" mit mehr als drei Anmeldungen öffnen, und ein Video am
  Eintrag starten und ins Vollbild wechseln.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_17_1`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand samt Einspielweg,
  Stolpersteine, Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**.
* **Die README** bekommt den neuen Wortlaut des Zugangstextes und durchgehend
  „Instanz".
* **`CHANGELOG.md`** bekommt den Eintrag nach der Form von 0.17.0, mit beiden
  eigenen Abschnitten am Ende.
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.** Fällt dir
  dort etwas auf, das falsch wird, ist das ein Befund und gehört gemeldet.

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Das
> Sammelblatt führt dazu einen **Wegweiser** und keinen zweiten Eintrag. **Ein
> Auftrag ist kein Ort für den Fahrplan:** er wird beim Schreiben des nächsten
> entfernt, und was nur hier stünde, wäre danach weg.

**Am 30. August 2026 ist der Fahrplan bereits nachgezogen worden**, samt einem
Widerspruch, der beim Rücken der Nummern in 0.17.0 entstanden war: *Abschnitt
10a trug die Überschrift „0.19.0 — Bereinigung", der Inhalt war die
Bildablage.* **Aufgelöst — die Bildablage behält 0.19.0, die Bereinigung rückt
auf 0.21.0, und dazwischen steht die Optikrunde als 0.20.0.**

**Diese Runde hat damit am Fahrplan nur eines zu tun:** ihre eigene Zeile in
Abschnitt 10 und ihren Abschnitt in 10a von **BEAUFTRAGT** auf **GEBAUT**
setzen, wenn sie fertig ist.

> **WAS FÜR 0.19.0 UND 0.20.0 SCHON ENTSCHIEDEN IST, STEHT IN 10a** — der
> engere Bildausschnitt und das wählbare Bildformat bei der Bildablage, die
> Optik samt der Liste dessen, was ausdrücklich **nicht** mitkommt.
> **Nichts davon wird in dieser Runde gebaut.** *Wer es hier hereinzieht,
> macht aus einer PATCH-Runde eine andere.*

---

**Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet ist.
**Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird dabei
entfernt** — es liegt immer nur einer im Repo.
