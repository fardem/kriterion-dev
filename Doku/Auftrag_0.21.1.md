# Auftrag 0.21.1 — „Die Sortierung sagt, wonach du fragst"

**Vorher: der Stand, auf dem diese Runde aufsetzt.** *Seine Versionsnummer, sein
Fingerprint, die Zahl der Prüfungen, der Rückbauten (samt höchster Nummer), der
Stolpersteine, `F_ROUTEN`, die Zwecke der zweiten Bestätigung, die Migrationsblöcke,
das Austauschformat, die Karten im Systembereich und die ausgelieferten Module stehen
im Änderungsprotokoll 0.21.0* — **und werden von dort übernommen, beim Start des
Chats, nicht beim Schreiben dieses Auftrags.**

> **WAS DIESE RUNDE AN DEN ZAHLEN ÄNDERT:**
>
> | | diese Runde |
> |---|---|
> | Schema | **nein** — keine Spalte, kein Migrationsblock |
> | Austauschformat | **unverändert** (13) |
> | `F_ROUTEN` | **unverändert** — die Einstellung reist auf `PUT /api/settings` mit |
> | Zwecke der zweiten Bestätigung | unverändert |
> | Karten im Systembereich | unverändert |
> | ausgelieferte Module | unverändert |
> | Vokabular | unverändert |
> | Prüfstand, Rückbauten, Stolpersteine | wachsen — **ab der jeweils nächsten freien Nummer** *(Rückbau **606**, Stolperstein **312**, Stand 0.21.0)* |
>
> **Die Zeilenangaben zu `public/app.js` sind Orientierung auf dem Stand 0.21.0,
> keine Zusage.**

---

> **DIE SORTIERUNG BEANTWORTET EINE FRAGE, ABER DIE LISTE ZEIGT NICHT DIE MENGE, IN
> DER DIESE FRAGE SICH STELLT.** *Wer nach **Potenzial** sortiert, fragt: „was mache
> ich als Nächstes?" — und das fragt sich nur an Ideen. Wer nach **Bewertung**
> sortiert, fragt: „was war gut?" — und das haben nur getestete Einträge
> beantwortet.* **Beide Male steht die andere Hälfte des Bestands mit in der Liste.**

**Der Bestand ohne Zahl steht dabei schon heute hinten**, in beiden Richtungen —
`?? -1` beim absteigenden, `?? 99` beim aufsteigenden Vergleich, seit 0.21.0 auch für
das Potenzial. **Das ist nicht der Punkt.** Der Punkt ist, dass sie die Liste
**auffüllen**: bei dreizehn Einträgen fällt es nicht auf, bei zweihundert scrollt man
an allem vorbei, was längst durch ist.

> **DAS IST KEIN FEHLER.** Die Sortierung tut, was sie soll; sie ist nur nicht
> nützlich genug. *Ein Wunsch, der als Fehler abgeheftet wird, drängelt sich in die
> falsche Runde* — und dieser hier drängelt nicht, er klemmt nicht, und er darf
> ausfallen, wenn der Rundlauf etwas Dringenderes bringt.

---

## Der Befund, in einer Tabelle

| | heute | soll |
|---|---|---|
| Sortierung „Bewertung (hoch → niedrig)" | Liste zeigt alles, Ideen füllen das Ende | **Statusfilter steht auf „Getestet"** |
| Sortierung „Bewertung (niedrig → hoch)" | dito | **dito** |
| Sortierung „Potenzial (hoch → niedrig)" | Liste zeigt alles, Getestete füllen das Ende | **Statusfilter steht auf „Ungetestet"** |
| Sortierung „Potenzial (niedrig → hoch)" | dito | **dito** |
| alle übrigen Sortierungen | — | **fassen den Filter nicht an** |
| eine von Hand gewählte Pille | gilt | **gilt weiterhin — und schlägt die Sortierung** |

---

## Die Nummer: PATCH — 0.21.1

**Der Maßstab ist die Frage: kann die Installation danach etwas, was sie vorher nicht
konnte?** Nein. Sie sortiert dieselben Einträge nach denselben Zahlen und filtert nach
demselben Merkmal; **was sich ändert, ist die Bedienform** — zwei Bedienelemente, die
bisher nichts voneinander wussten, wissen ab jetzt voneinander. Also PATCH.

**DIESE RUNDE IST EIN BÜNDEL, KEIN EINZELPUNKT.** *Sie entsteht aus dem Rundlauf von
Hand nach dem Einspielen von 0.21.0* — dieselbe Herkunft wie 0.20.1 nach 0.20.0 und
0.17.1 nach 0.17.0. **Was der Rundlauf sonst noch bringt, gehört in dieselbe Runde**
und ist beim Start des Chats zu erfragen; dieser Auftrag beschreibt den Punkt, der
beim Schreiben feststand.

> **WENN DER RUNDLAUF NICHTS WEITER BRINGT, IST DIESE RUNDE EINE EINZIGE ÄNDERUNG AN
> `public/app.js`.** *Das ist in Ordnung. Eine kleine Runde ist besser als eine, die
> auf Gesellschaft wartet.*

**Kein Schema. Keine Migration. Keine neue Route. Kein neues Modul. Kein
Bestandslauf.** Der Fahrplan rückt nicht — 0.21.1 ist eine PATCH-Zahl hinter einer
gebauten Runde und nimmt niemandem seinen Platz.

---

## 1. Der Kern: eine Vorgabe, keine Anweisung

**Der Statusfilter bekommt eine zweite Quelle.** Bisher hat er genau eine: was
jemand angeklickt oder in einer Ansicht gespeichert hat. Ab jetzt hat er zwei —
**die Handwahl und die Sortierung** —, und zwischen ihnen gilt eine Rangordnung.

> **DIE SORTIERUNG ENTSCHEIDET DIE VORGABE, DIE HANDWAHL SCHLÄGT SIE.**
>
> Das ist **Stolperstein 303 aus 0.21.0, eine Ansicht weiter** — dort hieß er *„Der
> Zustand entscheidet die Vorgabe, die Einstellung nicht"* und stand über den beiden
> Sternkästen. Dieselbe Bauform, dasselbe Verhältnis: **ein abgeleiteter Zustand und
> eine ausdrückliche Wahl, und die ausdrückliche Wahl gewinnt.**

### Die vier Regeln, und keine davon ist verhandelbar

**(1) Vorgabe statt Befehl.** `rating_desc`, `rating_asc` → Vorgabe `tested`.
`potenzial_desc`, `potenzial_asc` → Vorgabe `untested`. **Jede andere Sortierung
lässt den Filter in Ruhe** — sie hat keine Vorgabe, nicht die Vorgabe „alles".

**(2) Eine Handwahl hält.** Sobald jemand eine der drei Statuspillen anklickt, gilt
seine Wahl — **auch wenn sie der Vorgabe der Sortierung widerspricht**, und auch
über einen Wechsel der Sortierung hinweg. *Wer bei „Potenzial" ausdrücklich „Alles
anzeigen" klickt, bekommt alles angezeigt, und die nächste Sortierung nimmt es ihm
nicht wieder weg.*

**(3) Die Ableitung wird nicht gespeichert.** `saveFilters()` schreibt weiterhin die
**gewählte** Stellung an `PUT /api/settings`, nicht die abgeleitete.

> **DAS IST DIE WICHTIGSTE DER VIER REGELN, UND SIE IST DER GANZE UNTERSCHIED
> ZWISCHEN EINEM BLICK UND EINER EINSTELLUNG.** *Würde die Ableitung mitgespeichert,
> stünde nach dem Neuladen ein Filter da, den niemand gesetzt hat — und wer die
> Sortierung zurückstellt, bliebe auf ihm sitzen, ohne zu wissen, woher er kommt.*
> **Ein gesetztes Feld, das niemand gesetzt hat, ist Stolperstein 304 von der anderen
> Seite gelesen.**

**(4) Es steht dran.** Eine abgeleitete Stellung ist am Bildschirm von einer
gewählten zu unterscheiden, und **daneben steht, woher sie kommt**. *Ein
unsichtbarer Automatismus ist ein Fehler, auch wenn er richtig rät.*

### Wo es gebaut wird

**`public/app.js`, `drawFilters()`** — die Statuszeile (`row('Status')`, die drei
Pillen aus `[['all',…],['tested',…],['untested',…]]`) und die Sortierung
(`sel.id = 'f-sort'`, `sel.onchange`) stehen in derselben Funktion, keine
zwanzig Zeilen auseinander.

**Der abgeleitete Wert gehört NICHT in `state.filters`.** *Dort steht, was gewählt
ist; eine Ableitung, die sich dazwischenschreibt, geht durch `saveFilters()` hinaus
und ist damit gespeichert.* **Vorgeschlagen ist ein zweiter, ungespeicherter Merker
neben `state.filters`** — dieselbe Machart wie `BLICK` aus 0.21.0, das aus demselben
Grund neben den Einstellungen steht und nicht in ihnen.

**Gelesen wird die Ableitung an genau einer Stelle:** dort, wo `visibleItems()` heute
`f.tested` auswertet (`public/app.js`, bei `if (f.tested === 'tested')`). **Eine
zweite Lesestelle liefe auseinander** (Stolperstein 47).

---

## 2. Was am Bildschirm zu sehen ist

**Die Pille, die aus der Sortierung kommt, sieht anders aus als eine angeklickte.**
Wie genau, entscheidet der Bau — *aber sie darf nicht so aussehen wie eine gewählte,
und sie darf auch nicht wie ein toter Knopf aussehen: ein Klick darauf ist weiterhin
eine Handwahl und beendet die Ableitung.*

**Daneben steht ein Wort.** Das Bauteil dafür gibt es: `zweiteBeschriftung()` setzt in
derselben Zeile eine zweite Beschriftung ohne eigene Spalte — heute trägt sie die
Ablehnung ab. *Ein Wort wie „· folgt der Sortierung" reicht; der Auftrag legt den
Wortlaut nicht fest, aber er legt fest, dass dort einer steht.*

**Der Filterschalter zählt sie NICHT mit.** `filterZahl()` beantwortet die Frage
*„warum sehe ich nicht alles?"* — und darauf ist die Ableitung eine richtige Antwort.

> **DAS IST EINE ECHTE ENTSCHEIDUNG UND KEINE FORMALIE.** *Dafür spricht: die Zahl
> sagt, wie viele Filter greifen, und die Ableitung greift.* **Dagegen spricht: sie
> steht auch für „wie viel habe ich eingestellt", und eingestellt hat das niemand.**
> Der Bau entscheidet und **schreibt die Begründung an die Zeile** — beides ist
> vertretbar, aber nicht beides zugleich.

---

## 3. Die gespeicherten Ansichten

**Eine gespeicherte Ansicht trägt `sort` und `tested` zusammen** (`ansichtAusZustand()`
schreibt beides, `ansichtAnwenden()` gibt beides durch `filterNormal()`).

> **EINE GESPEICHERTE ANSICHT IST EINE AUSDRÜCKLICHE WAHL UND SCHLÄGT DIE
> ABLEITUNG** — wie eine Handwahl, und aus demselben Grund. *Sonst änderte sich das
> Verhalten vorhandener Ansichten still, und das ist genau das, was ein PATCH nicht
> tun darf.*

**Wer eine Ansicht mit „Potenzial" und „alles anzeigen" gespeichert hat, bekommt sie
unverändert zurück.** Das ist zu prüfen, und zwar an einer Ansicht, die vor dieser
Runde gespeichert worden wäre.

---

## 4. Der Weg zurück

**Wie kommt man aus der Handwahl wieder in die Automatik?**

Den Rücksetzer gibt es: `#filter-zurueck` setzt auf `filterNormal({ sort: … })` und
lässt die Sortierung stehen. **Vorgeschlagen: er setzt auch die Handwahl zurück** —
danach folgt der Statusfilter wieder der Sortierung. *Das ist folgerichtig: er heißt
„Filter zurücksetzen", und die Handwahl ist eine Filterstellung.*

**Sein Beschriftungstext nennt heute, was er tut** (*„Alle Filter auf ‚alles zeigen'
— Suchbegriff und Sortierung bleiben stehen"*). **Er muss es weiter tun.**

---

## 5. Was ausdrücklich NICHT gebaut wird

* **Keine Kopplung an den Verlaufs-Sortierungen** (`tests_*`, `testavg_*`,
  `testlast_*`). *Sie setzen „getestet" logisch genauso voraus — aber sie sind eine
  eigene Gruppe im Auswahlfeld, und diese Runde fasst zwei Gruppen an, nicht drei.*
  **Wenn der Bau sie mitnehmen will, gehört es in den Chat und nicht in einen
  stillen Zusatz.**
* **Keine Kopplung an `title_asc`.** Ein Titel sagt nichts über den Teststatus.
* **Keine Kopplung in die andere Richtung.** *Ein Klick auf „Ungetestet" stellt die
  Sortierung nicht auf Potenzial um.* Zwei Bedienelemente, die sich gegenseitig
  verstellen, sind ein Kreis — und man kommt aus ihm nicht mehr heraus.
* **Kein zweiter Filter wird angefasst.** Ablehnung, Favorit, Kategorien, Tags:
  unberührt.
* **Keine Ableitung am Server.** `visibleItems()` filtert im Browser, und das bleibt
  so. *Der Server weiß nichts von dieser Runde.*
* **Keine Einstellung, mit der man die Kopplung abschaltet.** *Sie ist eine Vorgabe,
  die jede Handwahl schlägt — wer sie nicht will, klickt einmal eine Pille. Ein
  Schalter dafür wäre eine Einstellung für etwas, das schon nachgibt.*

---

## 6. Der Prüfstand — was er halten muss

**Die vorhandenen Gruppen für Filter und Sortierung bleiben, wie sie sind** — unter
anderem „Favoriten: Sortierung und Filter", „Tagfilter: Und / Oder", „Gespeicherte
Ansichten", „Filterwahl bleibt beim Wechsel der Ansicht". *Wo eine von ihnen durch
diese Runde eine andere Menge sieht, wird die Zusage **umgedreht und nicht gelöscht***
(Stolperstein 74).

Neu zu belegen ist mindestens:

1. **Die Vorgabe greift.** Sortierung auf `potenzial_desc` → nur ungetestete Einträge
   stehen in der Liste. Auf `rating_desc` → nur getestete. **An einem Bestand mit
   beidem**, sonst belegt die Zeile nichts (Stolperstein 81).
2. **Und die Gegenlage:** `updated_desc` und `title_asc` lassen die Menge, wie sie ist.
3. **Die Handwahl schlägt sie.** Bei `potenzial_desc` auf „Alles anzeigen" klicken →
   die Liste zeigt alles. **Danach die Sortierung wechseln → sie zeigt weiter alles.**
   *Das ist die Zeile, an der die ganze Runde hängt.*
4. **Die Ableitung wird nicht gespeichert.** Nach einem Wechsel der Sortierung trägt
   das gesendete `PUT /api/settings` **den gewählten und nicht den abgeleiteten
   Wert.** *Am gesendeten Rumpf zu prüfen, nicht an der Liste.*
5. **Und sie überlebt kein Neuladen.** Ein frisch gebautes Fenster mit derselben
   gespeicherten Stellung zeigt dieselbe Menge wie vorher.
6. **Eine gespeicherte Ansicht schlägt sie** — auch eine, die „Potenzial" und
   „alles" zusammen trägt.
7. **Der Rücksetzer stellt die Automatik wieder her.**
8. **Das Wort steht dran**, und die abgeleitete Pille ist von einer gewählten zu
   unterscheiden.
9. **Was `filterZahl()` zählt** — die getroffene Entscheidung aus Abschnitt 2, in
   beide Richtungen geprüft.

**Rückbauten ab 606**, für jeden dieser Punkte mindestens einer. **Und mindestens
einer, der die Ableitung IN `state.filters` schreibt** — er muss rot werden, sonst
ist Regel 3 nicht baulich, sondern behauptet.

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der Sprachwächter
  läuft mit, und seine Dateiliste ist gepflegt.
* **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
* **Neue Stolpersteine ab der nächsten freien Nummer** (312 auf dem Stand 0.21.0).
  Kandidat aus dem Befund:
  - *Zwei Bedienelemente, die sich gegenseitig verstellen, sind ein Kreis.* Die
    Ableitung geht in eine Richtung, und die Handwahl beendet sie — sonst kommt
    niemand mehr heraus.
* **Neue Rückbauten ab der nächsten freien Nummer** (606). **Ein Rückbau, der den
  Lauf abreißt, belegt nichts** (Stolperstein 161) — *erst das Objekt, dann sein
  Inhalt* (Stolperstein 311, aus dem Gegenprobenlauf von 0.21.0).
* **Rückbauten mitgehen lassen, nicht löschen** (Stolperstein 201), wo ihr Suchtext
  sich verschiebt — *betroffen sind mindestens die, die auf `drawFilters()`, auf die
  Statuspillen und auf `sel.onchange` zeigen.*
* **VOR DEM GEGENPROBENLAUF: kein fremder Server.** Der Treiber sieht seit 0.21.0
  selbst nach und bricht ab (`fremdeServer()`), *aber er findet nur, was `node
  server.js` oder `node pruefung.js` heißt* — wer anders startet, räumt selbst auf
  (Stolperstein 310).
* **Der Prüfstand und die Rückbauliste wachsen vom Stand 0.21.0** — die Zahlen vorher
  und nachher stehen im Protokoll dieser Runde, nicht hier.
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll geschnittene
  Commits mit deutschen Meldungen** — *bei einer Runde dieser Größe sind zwei bis drei
  Schnitte richtig: der Bau, der Prüfstand samt Rückbauten, die Papiere.*
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft ein
  letztes Mal gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.21.1.md`** liegt im Branch: was gebaut wurde je Datei,
  **die vier Regeln mit ihrer Begründung**, die Entscheidung zu `filterZahl()`, die
  Entscheidung zu den Verlaufs-Sortierungen, **was umgedreht statt gelöscht wurde**,
  neue Stolpersteine, die Gegenprobentabelle, Prüfungszahlen vorher/nachher,
  Rückbauten vorher/nachher *(vorher jeweils aus dem Protokoll 0.21.0)*,
  Offengebliebenes.
* Die Zeile „0.21.1 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json` trägt sie
  an zwei Stellen ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** *Kein
  Migrationsblock, keine Spalte, kein Bestandslauf. Der Rückweg ist offen und
  folgenlos: eine ältere Fassung kennt die Kopplung nicht und filtert wie bisher.*
  **Eine Sicherung schadet nie, ist hier aber nicht nötig.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat, nicht
  in den Dokumenten.** Darunter: **nach Potenzial sortieren** *(die Liste zeigt nur
  noch Ideen, und daneben steht, woher der Filter kommt)*, **auf „Alles anzeigen"
  klicken und die Sortierung wechseln** *(die Wahl hält)*, **neu laden** *(die
  Ableitung ist weg, die Wahl ist da)*, **eine gespeicherte Ansicht anwenden** *(sie
  schlägt die Ableitung)*, **den Rücksetzer drücken** *(die Automatik ist zurück)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_21_1`), und **alle Verweise
  sind nachzuziehen.** Kopf, Betriebsstand, **der Abschnitt zur Übersicht und ihren
  Filtern**, Stolpersteine, Prüfstand, Versionsgeschichte, offene Betriebspunkte.
* **Der Fahrplan rückt NICHT.** *0.21.1 ist eine PATCH-Zahl hinter einer gebauten
  Runde; 0.22.0 und alles dahinter bleiben, wo sie stehen.* **Die Tafel bekommt eine
  Zeile für diese Runde, und mehr nicht.**
* **Abschnitt 8 des Projektstands:** der Feldbeleg zu 0.21.0 ist zur Hälfte da
  (Fingerprint `85f4348b` und die Migrationszeile mit sieben Kriterien); **was der
  Rundlauf von Hand ergeben hat, gehört dorthin** — auch die Punkte, die nichts
  ergeben haben.
* **Das Sammelblatt bekommt den Punkt NICHT.** *Er ist nie dort gewesen: er kam am
  4. September 2026 aus dem Betrieb und ist unmittelbar in diesen Auftrag gegangen.*
  **Die Tabelle „Was eine Nummer bekommen hat" nennt ihn trotzdem** — sie ist der
  Wegweiser, und ein Punkt, der den Umweg nicht genommen hat, gehört mit diesem
  Vermerk hinein.
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2 — **ohne Kasten**, es
  ist keine Datenbankstufe. *Aber mit einem Satz zu der einen Verhaltensänderung:
  wer nach Bewertung oder Potenzial sortiert, sieht ab jetzt eine andere Menge als
  vorher.*
* **DIE README WIRD ANGEFASST.** Der Abschnitt „Die Filter" beschreibt die Sortierung
  und die Statuspillen — **er bekommt die Kopplung, die Rangordnung und den Weg
  zurück.** *Keine neue Datei, also keine Änderung an der Dateiliste.*
* **Der vorige Auftrag fällt mit diesem Auftrag weg** — *es liegt immer nur einer im
  Repo.* **Dieser hier fällt weg, wenn der nächste geschrieben wird.**

---

## Was danach offen bleibt

- **Die Verlaufs-Sortierungen** (Testtage, Note ⌀, letzte Note). *Sie setzen
  „getestet" genauso voraus; ob sie mitkommen, ist in Abschnitt 5 bewusst offen
  gelassen.*
- **Punkt 10 des Sammelblatts — der Bildstreifen im Eintrag.** *Eingetragen als
  0.22.0; Teil (a) wäre auch hier mitgegangen, gehört aber in die Runde, die das
  Stilblatt ohnehin anfasst.*
- **Der Augenschein zu 0.21.0** — soweit der Rundlauf ihn nicht schon erbracht hat.
- **Die beiden Handgriffe aus 0.20.0** — eine eigene Datei in den Sicherungsordner
  legen, und die Zeile im Sicherheitsprotokoll je entfernter Kopie. *Sie stehen seit
  0.20.1 in dieser Liste.*
- **Der volle Gegenprobenlauf** über alle Rückbauten — weiter ausstehend.
