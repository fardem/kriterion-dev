# Auftrag 0.18.0 — „Die Suche wird nachvollziehbar"

**Der älteste offene Punkt des Sammelblatts, Nr. 1** — aufgefallen am
**27. August 2026** unmittelbar nach dem Einspielen von 0.11.0, und seither
dreimal übersprungen, weil vier Rundläufe von Hand dazwischenkamen.

**Der Befund in einem Satz:** *eine Suche nach „ella" findet auch „eurobella" —
unter anderem in einer Linkadresse.* **Der Treffer ist richtig. Er ist nur nicht
nachvollziehbar:** die Kachel sagt nicht, **wo** das Wort steht. Man sieht einen
Eintrag in der Trefferliste und weiß nicht, warum er dort ist.

> **DAS IST EIN WUNSCH UND KEIN FEHLER.** *Vor 0.11.0 lief `searchText.includes(q)`
> im Browser über genau dieselben Quellen, zusammengeklebt zu einem Feld; „ella"
> fand „eurobella" also auch damals.* **0.11.0 hat das Verhalten absichtlich
> Zeichen für Zeichen erhalten** — sichtbar geworden ist es, weil die Suche
> seither benutzt wird.

---

## 0. Was vor dem ersten Handgriff zu tun ist

> **0.17.5 IST EINGESPIELT, IM FELD BESTÄTIGT UND EINGETRAGEN.** Die laufende
> Instanz meldet **`6a2c264a`** — genau den gebauten Wert (Stolperstein 158),
> und der Befund ist weg. *Die Feldbelege stehen bereits im Änderungsprotokoll
> 0.17.5, im Betriebsstand, in der Fingerprintliste und in Abschnitt 8; diese
> Runde muss sie **nicht** nachtragen.*
>
> **WAS AUS DEN RUNDEN DAVOR NOCH NICHT AM BILDSCHIRM GESEHEN IST**, führt der
> Projektstand in **Abschnitt 8**. *Fällt einer durch, ist das ein Befund für
> die nächste Runde und kein Grund, diese hier zu erweitern.*
>
> **Weiterhin ausstehend, unverändert seit 0.16.0:** der Teilexport ein drittes
> Mal mit Mitschrift — **und ein Teil in eine Zweitinstanz eingespielt, nicht in
> die laufende** —, sowie beide Netze am echten Wirt. *Beides kostet keine Zeile
> Code und ist nur am echten Bestand zu haben.*

**LIES ZUERST, WAS DA IST, BEVOR DU ETWAS ANNIMMST.** Diese Runde fasst die
Suchroute, die Kachel und die Detailansicht an — drei Stellen mit langer
Geschichte. *Die drei Runden davor sind genau daran teuer geworden: eine
Behauptung wurde gebaut, statt sie nachzulesen (Stolpersteine 248, 252, 257).*

---

## Die Nummer: MINOR

**0.18.0.** Abschnitt 5.1 des Projektstands: *„Zweite Zahl (MINOR) für alles,
was die Instanz danach kann und vorher nicht konnte."*

**Diese Runde bringt eine Funktion:** die Übersicht sagt, **warum** ein Eintrag
in der Trefferliste steht. *Das konnte sie vorher nicht.*

> **KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine neue
> Formatnummer: es bleibt bei **sieben** markierten Blöcken und bei
> **Austauschformat 11**. *Die Suche liest, sie schreibt nichts.*

> **ZUR ABGRENZUNG:** die **Bildablage** ist **0.19.0**, die **Optikrunde**
> **0.20.0**, die **Bereinigung** **0.21.0**, der **Kommentarschnitt**
> **0.21.x**. *Nichts davon wird hier hereingezogen — auch nicht „weil man
> gerade dran ist".*

---

## Was schon da ist, und was das billig macht

**`qVolltext` in `server.js` (Zeile ~2432) fragt SIEBEN Quellen in einem
ODER-Ausdruck:**

| # | Quelle | woher |
|---|---|---|
| 1 | **Titel** | `items.title` |
| 2 | **Beschreibung** | `items.description` |
| 3 | **Kategorie** | `product_categories.name` |
| 4 | **Tag am Eintrag** | `item_tags` → `tags.name` |
| 5 | **Tag am Testtag** | `test_days` → `test_day_tags` → `tags.name` |
| 6 | **Linkadresse** | `links.url` |
| 7 | **Kommentartext** | `comments.text` |

> **ES SIND SIEBEN UND NICHT SECHS.** *Der Fahrplan zählt in Abschnitt 10a
> „Titel, Beschreibung, Kategorie, Tags, Links, Kommentare" — die Tags kommen
> aber **zweimal** vor: einmal am Eintrag und einmal am Testtag.* **Nachzählen,
> nicht abschreiben.**

**Die Antwort wirft heute weg, welche Quelle getroffen hat:**
`volltextTreffer()` macht aus den Zeilen eine Menge von Nummern. **Genau diese
Auskunft ist der ganze Punkt dieser Runde — und sie fällt in derselben Abfrage
an.** *Der Ausdruck steht schon da; er wird nur nicht ausgelesen.*

**EINE ABFRAGE FÜR DIE GANZE LISTE, NIE EINE JE EINTRAG.** Das ist die Regel
dieses Servers, und sie steht zweimal im Quelltext daneben (`qOffenJeEintrag`,
`verfasserKarte()`): *bei tausend Einträgen wären das zweitausend Abfragen für
zwei Zahlen.* **Was für die Zahlen gilt, gilt für den Trefferkontext.**

---

## 1. Der Trefferkontext an der Kachel

**BEFUND.** Die Kachel zeigt Bild, Kategorie, Titel, bis zu vier Tags, die
Testzeile und die Fußzeile. **Trifft der Begriff in der Beschreibung, in einem
Link oder in einem Kommentar, steht davon nichts auf der Kachel** — der Eintrag
erscheint in der Liste, und niemand kann sehen, warum.

### GEBAUT WIRD

**Eine Zeile an der Kachel, und sie steht nur da, solange eine Suche läuft.**
Sie nennt die **Quelle** und zeigt den **Ausschnitt** mit der Fundstelle darin:

```
Link: …euro‹bella›.de/werkzeug/…
Kommentar: „…hat mir der Händler in ‹Bella›vista empfohlen…"
```

**DIE ANTWORT DER SUCHROUTE TRÄGT JE EINTRAG EIN NEUES FELD.** *Eine Erweiterung
und keine Wegnahme* — was heute in der Antwort steht, bleibt Zeichen für
Zeichen stehen. **Das Feld steht nur da, wenn wirklich gesucht wurde**; ohne
Begriff fällt es aus der Antwort, wie `testDays` es bei ausgeschalteter
Zeitleiste vormacht.

### Die Entscheidungen, und sie sind hier getroffen

**EINE ZEILE JE KACHEL UND NICHT EINE JE QUELLE.** *Die Kachel ist dicht;
sieben mögliche Zeilen machten aus der Übersicht eine Liste von Fundstellen.*
**Getroffen mehrere Quellen, nennt die Zeile die erste in dieser festen Folge**
— und hängt an, wie viele weitere es sind:

> **Beschreibung · Kommentar · Link · Tag am Testtag · Tag · Kategorie · Titel**

**DIE FOLGE IST NICHT WILLKÜRLICH: sie beginnt bei dem, was die Kachel NICHT
zeigt.** *Steht der Begriff im Titel, sieht man ihn ohnehin — die Zeile trüge
dort nichts bei. Steht er in einem Kommentar, ist sie die einzige Auskunft, die
es gibt.* **Trifft nur der Titel, steht trotzdem die Zeile da** — eine Regel und
keine Ausnahme, und die Hervorhebung aus Punkt 2 sagt daneben dasselbe.

**„und 2 weitere Stellen"** hängt an, wenn mehr als eine Quelle getroffen hat.
*Die Zahl ist umsonst zu haben: der ODER-Ausdruck wertet ohnehin alle sieben
aus.*

**DER AUSSCHNITT IST EINE ZEILE UND WIRD NICHT UMGEBROCHEN.** Wo der Text
länger ist, steht `…` davor und dahinter. **Die Länge ist zu MESSEN und nicht zu
schätzen** — sie hängt an der Kachelbreite, und die Kachel ist
`minmax(240px, 1fr)`. *Ein Ausschnitt, der auf der schmalsten Kachel umbricht,
macht die Kachel höher als ihre Nachbarn.*

> **DIE KACHELHÖHE IST DAS THEMA DER DREI RUNDEN DAVOR GEWESEN — fass sie nicht
> versehentlich wieder an.** *Ohne Suchbegriff darf die Kachel keinen Pixel
> anders sein als vorher; das ist zu messen und ins Protokoll zu schreiben.*
> **Mit Suchbegriff sind alle Kacheln um dieselbe Zeile höher** — die Zeile
> steht an jeder Trefferkachel, also verschiebt sich nichts gegeneinander.

**WOHIN DIE ZEILE KOMMT:** unter den Titel und über die Tags. *Dort steht sie
bei dem, was sie erklärt, und nicht am Fuß bei den Zahlen.*

---

## 2. Die Hervorhebung — und die Falle, die dazugehört

**GEBAUT WIRD: der gefundene Begriff wird hervorgehoben**, in der Kachel
(Titel, Kategorie, Tags, Kontextzeile) und in der Detailansicht (Titel,
Beschreibung, Linkliste, Kommentare).

### DIE FALLE STEHT HIER, WEIL SIE SONST GEBAUT WIRD

**Hervorheben heißt, fremden Text mit Markup zu durchsetzen. Kommentartexte
kommen von Menschen.**

> **PROJEKTSTAND, ABSCHNITT 5.6: „Kommentartext kommt nie über `innerHTML` in
> die Seite" (seit 0.5.4).** `.cmt-body` wird mit **echten Knoten** gefüllt:
> `createTextNode()` für Text, `createElement('a')` mit `textContent` und `href`
> für Links. **Damit ist Maskierung nicht „nicht vergessen worden", sondern
> baulich unmöglich.**

**DIE HERVORHEBUNG IM KOMMENTAR WIRD GENAUSO GEBAUT** — `createElement('mark')`
mit `textContent`, eingehängt zwischen zwei `createTextNode()`. **Kein
`innerHTML`, kein `replace()` auf einer Zeichenkette, kein „ich maskiere ja
vorher".** *Wer den Rohtext maskiert und danach `<mark>` hineinschreibt, hat den
Weg wieder aufgemacht, den 0.5.4 zugemacht hat.*

**DER ORT DAFÜR STEHT SCHON DA UND HEISST `baueKommentarknoten()`**
(`public/app.js`, Zeile ~1239). Er bekommt seine Stücke aus
`zerlegeKommentartext()` und macht daraus echte Knoten. **Die Hervorhebung
gehört in dieselbe Zerlegung** — ein drittes Stück neben „Text" und „Link" —
und **nicht in eine Schleife, die hinterher über das Ergebnis geht.** *Wer das
fertige Ergebnis nachbearbeitet, muss dafür wieder in Zeichenketten denken, und
genau dort entsteht der Fehler.*

**DAS BRAUCHT EINE EIGENE PRÜFUNG UND EINE EIGENE GEGENPROBE**, und die Prüfung
gehört mit einem echten Angriffstext gefahren — ein Kommentar, der
`<img src=x onerror=…>` enthält, und der Begriff trifft **mitten darin**.
**Die Lage dafür gibt es schon:** *„Auch der Knotenbauer erzeugt aus Markup
niemals Markup" fährt genau diesen Text durch `baueKommentarknoten()`.* **Sie
ist zu erweitern und nicht zu ersetzen** — dieselbe Zeile, jetzt mit Begriff.

### Die Entscheidungen, und sie sind hier getroffen

**DIE HERVORHEBUNG GEHÖRT DER SUCHE UND NICHT DEM EINTRAG.** Daraus folgt
alles Weitere:

* Sie lebt **genau so lange wie der Begriff** — Feld geleert, Begriff geändert,
  Ansicht ohne Begriff gewählt: **weg**.
* Sie wird **nicht gespeichert**. *Ansichtszustand, wie „meine / alle" im
  Vergleich.*
* Sie gilt **überall dort, wo der Begriff gesucht wurde** — also in allen sieben
  Quellen und nirgends sonst.

**IN DER LINKLISTE WIRD DIE ADRESSE HERVORGEHOBEN UND NICHT DER ANZEIGENAME.**
*Gesucht wurde in `links.url`; ein hervorgehobener Name, in dem der Begriff gar
nicht steht, wäre eine Falschaussage.*

---

## 3. Der Suchbegriff wandert in die Adresse

**BEFUND.** Heute lebt der Begriff nur in `state.search`. **Wer einen Treffer
öffnet und neu lädt, verliert ihn** — und mit ihm die Hervorhebung. *Ein Eintrag,
der beim ersten Blick markierte Stellen hat und nach F5 keine mehr, sieht aus
wie ein Fehler.*

### GEBAUT WIRD

**`#/item/12?q=ella`.** Der Begriff steht in der Adresse, die Detailansicht
liest ihn dort, und die Hervorhebung übersteht ein Neuladen.

> **DER ROUTER IST HEUTE VERANKERT UND WÜRDE DURCHFALLEN.**
> `route()` prüft `/^#\/item\/(\d+)$/` — mit einem `?q=…` dahinter trifft das
> Muster **nicht**, und die Adresse fiele auf die Übersicht zurück. **Das Muster
> ist zu erweitern**, und es gibt dafür eine Bauform im Haus: `SYS_MUSTER`
> (`/^#\/system(?:\/([a-z]+))?$/`) macht seit 0.16.0 genau das für den
> Systembereich. *Dieselbe Verankerung, dieselbe Vorsicht: `#/item/12x` darf
> nicht treffen.*

**EINE ADRESSE OHNE `?q=` BLEIBT GÜLTIG** und heißt „keine Suche". *Jedes
Lesezeichen von gestern führt dorthin, wohin es immer führte.*

**GESETZT WIRD SIE ÜBER `history.replaceState` UND NICHT ÜBER `location.hash`**,
wenn sich nur der Begriff ändert — *ein neuer Eintrag im Verlauf je getipptem
Buchstaben machte die Zurück-Taste unbrauchbar.* **Dieselbe Entscheidung wie im
Systembereich, und der Grund steht dort im Quelltext.**

**DIE ÜBERSICHT BEKOMMT DEN BEGRIFF NICHT IN DIE ADRESSE.** *Dort steht er im
Feld, und das Feld ist sichtbar.* **Nur die Detailansicht braucht ihn**, weil sie
das Feld nicht zeigt.

---

## 4. Was ausdrücklich NICHT gebaut wird

**a) DER SUCHBEREICH ALS HÄKCHEN** — Titel, Beschreibung, Kategorie, Tags,
Links, Kommentare einzeln an- und abwählbar.

> **Der Fahrplan führt ihn als Teil (b), und er bleibt liegen.** *Er ist eine
> **zweite Bedienfläche** neben einer Suche, die heute ein Feld ist: wer sie
> überfrachtet, macht den einfachen Fall teurer, um den seltenen billiger zu
> machen.* **Und er ist erst zu beurteilen, wenn der Trefferkontext steht:**
> vielleicht beantwortet die Zeile „Link: …" die Frage schon, und dann braucht
> niemand mehr ein Häkchen, um Links auszuschließen.
> **Das ist eine Entscheidung mit Begründung und keine Verschiebung aus
> Zeitmangel** — sie gehört so ins Änderungsprotokoll.

**b) WORTGRENZEN STATT TEILSTRING.** *In einem Katalog voller Typnummern
(„GSR 18V-60") ist Teilstring das richtige Verhalten: wer „18v" tippt, will es
finden. Eine Wortgrenzensuche verschwiege still Treffer, und das ist die
schlechtere Seite des Fehlers.* **Der Fahrplan sagt das seit dem 27. August,
und diese Runde ändert daran nichts.**

**c) EINE SORTIERUNG NACH TREFFERGÜTE.** *Sortiert wird weiter über `sort` in
der Filterleiste — eine zweite, unsichtbare Ordnung wäre eine zweite Wahrheit.*

**d) EIN ZWEITER ABRUF FÜR DEN KONTEXT.** *Was die Liste ohnehin holt, trägt
ihn mit.*

---

## Bauregeln

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; **„Desktop"** und nicht
  „Schreibtisch"; die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch nicht für den Prüfstand.
* **Keine Zugangsdaten im Gespräch.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
  **Und keine echten Adressen in Papieren oder Beispielen.** *Diese Runde fasst
  Linkadressen an; die Beispiele im Papier sind erfunden zu halten.*
* **KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE FORMATNUMMER.** Es bleibt bei
  **sieben** markierten Blöcken und bei **Austauschformat 11**. *Kommt deine
  Durchsicht zu einem anderen Ergebnis, ist das ein Grund anzuhalten und zu
  fragen, nicht stillschweigend abzuweichen.*
* **Die Sicherung des Datenverzeichnisses ist Empfehlung und nicht Pflicht** —
  keine Datenbankstufe. **Im Changelog steht dann kein Kasten über den
  Änderungen**, und das ist die ganze Aussage.
* **`F_ROUTEN` bleibt bei 69.** *Ein neues Feld in einer Antwort ist keine neue
  Route, und ein Suchbegriff in der Adresse erst recht nicht.* **`BESTAETIGUNG_ZWECKE`
  bei sieben**, **achtzehn Karten in fünf Abschnitten**, **acht persönliche
  Schlüssel**. **Nachzählen, nicht annehmen.**
* **Kommentare sind zeitlos.** Eine fachliche Warnung ja, eine Entstehungs-
  geschichte nein — **außer dort, wo eine zurückgenommene Entscheidung sonst
  wiederkäme** (Stolperstein 201).
* **Neue Stolpersteine zählen bei 260 weiter.** 259 ist vergeben.
* **TAGS WERDEN NICHT MEHR GESETZT** — kein Tag, kein Tag-Push.
* **Die Frage an jede Gruppe bleibt:** *was sieht jemand, der das Projekt nicht
  gebaut hat?* — **und für diese Runde besonders: erklärt die Zeile den Treffer
  wirklich, oder wiederholt sie nur, was schon dasteht?**

### Was aus den letzten drei Runden mitzunehmen ist

1. **Eine Behauptung aus einem Papier gehört nachgelesen, bevor sie gebaut
   wird** (Stolperstein 248) — *auch aus diesem hier.* **Der Fahrplan zählt
   sechs Quellen; es sind sieben.**
2. **Eine Zahl, die nicht selbst gemessen wurde, ist keine Messung**
   (Stolperstein 252). *Steht „nachgemessen" im Protokoll, muss es gemessen
   sein.*
3. **Ein Befund, den man nicht nachstellen kann, ist unerklärt und nicht
   erledigt** (Stolperstein 257). *Der Unterschied zwischen Meldung und Messung
   IST der Fund.*
4. **Eine Regel, die nur in einem Browser gemessen wird, ist nicht belegt**
   (Stolperstein 256). *Wo eine einfache Bauform reicht, ist sie die richtige.*

### Zu den Agenten — rationell und nicht ängstlich

1. **Nie gegen einen wandernden Arbeitsbaum.** Ein Nachlauf gehört gegen einen
   festgeschriebenen Commit.
2. **Nie neben einem laufenden Prüflauf oder einer Gegenprobe.** Spur 0 der
   Gegenprobe fährt **ohne Portversatz**, also auf denselben Portbasen wie
   `npm test`.
3. **Einer mit einer scharfen Frage schlägt sechzehn mit einer weichen.**

**Und aufgeräumt wird nach Prozessnummer, nie nach Namen.**

### Wenn in Chromium gemessen wird

**Das Fenster gehört mit angegeben** — `--window-size` setzen und die Größe in
die Notiz schreiben. *Gemessen wird über das DevTools-Protokoll an einer echten
Instanz; das Werkzeug dazu ist in 0.17.4 entstanden und braucht keine
Abhängigkeit (Fehler_und_Ideen, Teil II, „Am Prüfstand").* **Und was gemessen
wird, gehört ins Änderungsprotokoll und nicht in eine jsdom-Prüfung, die es
nicht messen kann** (Stolperstein 223).

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst.**
* **`Doku/Aenderungsprotokoll_0.18.0.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 260**), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (**vorher: 4813**),
  Rückbauten vorher/nachher (**vorher: 389**), Offengebliebenes.
* Die Zeile „0.18.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat,
  nicht in den Dokumenten.** Darunter: **nach einem Wort suchen, das nur in
  einem Kommentar steht** *(die Kachel sagt „Kommentar: …")*, **nach einem Wort
  suchen, das nur in einer Linkadresse steht** *(die Kachel sagt „Link: …")*,
  **einen Treffer öffnen und neu laden** *(die Hervorhebung bleibt)* und **das
  Suchfeld leeren** *(alle Hervorhebungen und alle Kontextzeilen sind weg)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_18_0`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Abschnitt 10 und 10a** — und **Abschnitt 5.6**, in dem
  die Entscheidungen zur Suche und zum Kommentartext stehen. *Die Zeile
  „Kommentartext kommt nie über `innerHTML` in die Seite" wird durch diese Runde
  nicht schwächer, sondern schärfer: sie bekommt einen Satz zur Hervorhebung.*
* **Sammelblatt:** Punkt 1 verlässt Teil I und geht in den Wegweiser. *Was von
  ihm liegen bleibt — der Suchbereich als Häkchen —, bekommt eine eigene Zeile
  mit dem Grund, warum er liegen bleibt.*
* **Die README** bekommt den Trefferkontext und die Hervorhebung. *Und weiterhin
  gilt: die Nummer bleibt nur, wo sie eine Handlung bestimmt — es sind sechs, und
  ein Wächter hält die Zahl fest.*
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile, **und keinen Kasten darüber** —
  diese Runde verlangt vor dem Einspielen nichts.
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**
* **`Doku/Auftrag_0.17.3.md` ist mit diesem Auftrag weggefallen** — *es liegt
  immer nur einer im Repo, und was 0.17.3 gebracht hat, steht in seinem
  Änderungsprotokoll.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg. **Trag 0.18.0 dort ein, wenn
> die Runde steht.**
