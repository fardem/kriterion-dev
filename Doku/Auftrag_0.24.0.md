# Auftrag 0.24.0 — „Das Deutsche wandert in eine eigene Datei"

**Stufe 1 der Mehrsprachigkeit.** Aufsetzend auf **0.23.0, Fingerprint
`92f7a142`** — der Stand von `main` am 5. September 2026 (`34da9ea`), dazu die
Papiere aus `8603d0a` (der gerückte Fahrplan und das Konzept). **Derselbe Bau
läuft am Wirt**, der Augenschein am Wirt ist also aussagekräftig — und er ist
in dieser Runde die Abnahme.

**Das Konzept steht und ist vollständig:
`Doku/Konzept_Mehrsprachigkeit_0_24_0.md`.** *Dieser Auftrag entscheidet keine
Bauform. Schlüssel, Platzhalter, Mehrzahl, die beiden Helfer, die Fehlerklasse
und die Sprachdatei stehen dort in den Abschnitten 3 bis 7 — hier steht nur,
in welcher Reihenfolge gebaut wird, was dabei nicht verhandelbar ist und woran
die Abnahme hängt.*

> **DIE NUMMER IST ENTSCHIEDEN: 0.24.0.** Der Betreiber hatte die Runde am
> 5. September 2026 zunächst **0.24.1** genannt. *Abschnitt 5.1 des
> Projektstands sagt für eine Runde, nach der die Installation nichts kann,
> was sie vorher nicht konnte, PATCH — und das trifft hier zu. Eine PATCH-Zahl
> setzt aber ihre MINOR-Zahl voraus, und eine 0.24.0 war noch nicht
> herausgegangen.* **Noch am selben Tag entschieden: diese Runde ist die
> 0.24.0** — die erste der Reihe nimmt die MINOR-Zahl der Mehrsprachigkeit,
> auch wenn sie allein noch keine Funktion bringt. *Die Funktion kommt mit
> Stufe 2; welche Nummer die trägt — die nächste freie MINOR-Zahl oder eine
> PATCH-Zahl hinter 0.24.0 —, entscheidet der Betreiber an ihrem Auftrag.*
> **Gebaut wird davon nichts anders.**

---

## Woher

**Der Fahrplan hat die Mehrsprachigkeit am 5. September 2026 auf 0.24.0
vorgezogen**, und das Konzept ist am selben Tag geschrieben worden. Es
empfiehlt in E12, Stufe 1 und Stufe 2 zusammen herauszugeben. **Der Betreiber
hat anders entschieden, noch am selben Tag: Stufe 1 geht zuerst und allein.**

Der Grund trägt: Stufe 1 ist **die größte Runde des Projekts nach Zeilen und
die unsichtbarste nach Wirkung** (Konzept, Stufe 1). Wer sie allein
herausgibt, hat einen Stand, an dem sich genau eine Sache beweisen lässt —
*nichts sieht anders aus, und kein Text steht mehr im Quelltext* — bevor die
Wahl der Sprache irgendetwas daran verdeckt.

**Was das Konzept mitbringt und dieser Auftrag voraussetzt:**

1. **Die Arbeitsmenge ist gezählt** (Konzept, Abschnitt 2): rund 1.800
   lesbare Bausteine in `app.js`, 125 Meldungen in `server.js`, rund 40 in
   `auth.js`, 55 Zeilen in `mail.js`, 52 Mehrzahlstellen, acht Format-Helfer.
2. **Die Bauform ist entschieden** (E1 bis E4, E9 zur Hälfte, E10, E11):
   JSON unter `public/sprachen/`, deutsche Schlüssel nach der Sache,
   benannte Platzhalter, Mehrzahl als Objekt, `t()`/`tH()` im Browser,
   `t(sprache, …)` im Server, `Meldung` statt `Error` in `auth.js`.
3. **Die Wächter sind benannt** (Konzept, Abschnitt 9): drei lesen um, sieben
   kommen dazu.

---

## Worum es geht, in vier Sätzen

**Jeder Text, den ein Mensch am Bildschirm oder in einer Mail liest, verlässt
`public/app.js`, `server.js`, `auth.js` und `mail.js` und steht als Schlüssel
in `public/sprachen/de.json`.** Der Quelltext ruft `t()` und sonst nichts.
**Die Anwendung sieht danach genauso aus wie vorher** — dasselbe Wort an
derselben Stelle, derselbe Umbruch. **Keine Wahl, keine zweite Sprache, kein
Schema, keine Route, keine Abhängigkeit, kein Bestandslauf** — die Wahl kommt
mit Stufe 2.

---

## Bauabschnitt 1 — der Helfer und die Ladung

**KLEIN, UND ZUERST.** Alles Weitere hängt daran; er wird fertig, bevor der
erste Text umzieht.

### 1.1 Was gebaut wird

* **`public/sprachen/de.json`** mit dem Kopf `"_locale": "de-DE"` und genau
  drei Schlüsseln: der Rückfallsatz von `api()` (*„Der Server meldet einen
  Fehler ({status})."*, `app.js:57`) und die zwei Sätze des Fehler-Handlers
  (`server.js:6677`). *Drei, damit der Weg von der Datei bis zum Bildschirm
  und bis in die Antwort des Servers einmal ganz durchläuft.*
* **Im Browser:** `t()` und `tH()` wie im Konzept, Abschnitt 4.4 — `SPRACHE`,
  `TEXTE`, `LOCALE` (aus `_locale`), der Rückfall auf `⟦schluessel⟧`. **Die
  Ladung in `boot()`** (`app.js:10801`), **parallel zu `/api/config` und vor
  dem ersten Zeichnen.** *Scheitert die Ladung, zeigt `boot()` einen einzigen
  festen Satz — „Die Sprachdatei fehlt." — und hält an. Das ist der eine
  erlaubte Text im Code, und er steht auf der Restliste (Bauabschnitt 5).*
* **Im Server:** alle `public/sprachen/*.json` beim Start gelesen; fehlt
  `de.json`, startet der Server nicht. `t(sprache, schluessel, werte)` mit
  derselben Mehrzahl- und Platzhalterregel wie im Browser. `spracheVon(req)`
  **liefert in dieser Runde immer `de`** — die Funktion steht, damit Stufe 2
  nur ihre Quellen einhängt. **Die Klasse `Meldung`** (Schlüssel, Werte,
  Status) und **der Fehler-Handler, der sie übersetzt** und in `error` legt.
* **`api()`** liest seinen Rückfallsatz über `t()`.

### 1.2 Was dabei nicht verhandelbar ist

* **Ein Text ist ein String oder ein Objekt `{ eins, andere }` — sonst
  nichts.** Kein Feld, das der Helfer nicht kennt.
* **Der Helfer setzt Werte ein und maskiert sie in `tH()`; den Text selbst
  maskiert er nie.** Der Text kommt aus der Datei und enthält kein HTML
  (Konzept 4.2) — **der Prüfstand hält fest, dass kein Wert in `de.json` ein
  `<` oder `>` trägt.**
* **In Attributen wird der ganze Text maskiert:** `title="${esc(t('…'))}"`,
  ebenso `placeholder` und `aria-label`. *Die Texte des Projekts tragen den
  geraden Anführungsstrich am Ende eines Zitats (`„Getestet"`), und der
  sprengt ein Attribut.*
* **Die Mehrzahl wählt `Intl.PluralRules(LOCALE)`**, nicht `n === 1`. Im
  Server dieselbe Klasse, mit der Locale der jeweiligen Sprache.
* **Der Rückfall auf Deutsch ist in dieser Runde leer** — es gibt nur
  Deutsch. Er wird trotzdem jetzt gebaut und mit einer Prüfung belegt, nicht
  in Stufe 2 nachgeholt.

### 1.3 Der Prüfstand kommt in diesem Abschnitt dazu und nicht später

**Eine Gruppe an gestellten Texten:** Platzhalter, Vokabelplatzhalter aus
`V`, Mehrzahl mit `n = 0`, `1`, `2`; `tH()` maskiert einen Wert mit `<`;
ein fehlender Schlüssel liefert `⟦…⟧`; eine `Meldung` läuft durch den
Fehler-Handler und kommt als `error` mit übersetztem Satz und richtigem
Status heraus; `boot()` zeichnet nichts, bevor die Datei da ist. **Je Prüfung
eine Gegenprobe.**

---

## Bauabschnitt 2 — die Serverseite: `server.js`, `auth.js`, `mail.js`

**Die kleinere Hälfte, mit den meisten Mehrzahlformen — und die, die der
Prüfstand heute schon liest.**

### 2.1 Was gebaut wird

* **`server.js`:** jedes Literal hinter `error:` wird `t(spracheVon(req),
  'server.…', {…})`. Die **25 Meldungen mit Vokabelwort** benutzen die
  Platzhalter `{sache}`, `{sacheMehrzahl}`, `{merkmalJa}` … (die vierzehn
  Namen aus `V`); die **sechs Mehrzahlstellen** werden Objekte mit zwei
  ganzen Sätzen — das Beispiel steht im Konzept, 4.3 (`server.js:3594`).
  Dazu die beiden `new Error` mit Status 400 (`:215`, `:3758`) als `Meldung`,
  und `zahl()` (`:2247`) liest die Locale der Sprache statt `replace`.
* **`auth.js`:** die rund vierzig `throw new Error('…')` mit deutschem Satz
  werden `throw new Meldung('anmeldung.…', {…})`; `ZWEITER_FAKTOR_ABSAGE`
  (`:1424`) wird ein Schlüssel; **der Adressprüfer (`:112–120`) gibt
  Schlüssel statt Sätze zurück**, und die Karte, die ihn zeigt, übersetzt.
  *Was `new Error` bleibt, ist ein Programmierfehler ohne Bildschirm — und die
  Liste dieser Stellen steht namentlich im Prüfstand.*
* **`mail.js`:** die vier Briefe bekommen `sprache` als Parameter (in dieser
  Runde immer `de`); jede Zeile ist ein Feld eines Schlüssels je Brief;
  **die vier Betreffzeilen ziehen von `server.js` (`:110`, `:162`, `:1502`)
  in die Datei** und werden in `mail.js` gebaut, der Titel der Installation
  bleibt Platzhalter. Dazu `HINWEISE`, `HINWEIS_IMMER` (`:50–56`) und die drei
  Absagen (`:245`, `:246`, `:255`) — **sie stehen am Bildschirm und ziehen
  mit.**
* **Die Vokabelvorgaben:** `VOKABULAR_VORGABE` (`server.js:1619`) fällt weg,
  `vokabular()` liest die Vorgabe aus `de.json` unter `vokabular.*`. **Der
  gespeicherte Schlüssel `vokabular` bleibt flach** — das Objekt je Sprache
  ist Stufe 2 (E9).
* **Was aus `bilder.js`, `bestandslauf.js` und `anhaenge.js` als Fehler bis
  zum Browser gelangt, wird beim Umzug gezählt und mitgenommen** — das
  Konzept hat dort keinen Bildschirmtext gefunden; ein Fund ist ein Fund.

### 2.2 Was dabei nicht verhandelbar ist

* **Kein Wort ändert sich.** Jeder Satz zieht so um, wie er dasteht — mit
  seinem Komma, seinem Anführungszeichen, seinem Punkt. *Wer beim Umzug einen
  Text verbessern will, schreibt ihn auf die Liste für eine eigene Runde
  (Abschnitt „Was danach offen bleibt").* **Sonst stimmt weder der
  Augenschein noch eine der 312 Zusicherungen mehr.**
* **Kein Satz wird aus Stücken gebaut.** Wo heute `${n === 1 ? 'ist' :
  'sind'}` steht, stehen künftig zwei ganze Sätze in der Datei.
* **`spracheVon(req)` kennt in dieser Runde keine Quelle.** Kein
  `Accept-Language`, kein Benutzerschlüssel, kein Eintrag in `/api/config` —
  **die fünf Felder dort bleiben fünf.**

### 2.3 Der Prüfstand in diesem Abschnitt

**Der Servertext-Wächter (`servertexteVon`, `pruefung.js:24451`) dreht sich
um:** er findet **null** Literale hinter `error:` in `server.js` und
`auth.js` und **null** deutsche Sätze in `throw new Error` in `auth.js`; die
Untergrenze „mehr als hundert Meldungen" (`:15406`) zählt fortan die
`server.*`- und `anmeldung.*`-Schlüssel in `de.json`. **Die Gruppe „Vokabular
in den Servermeldungen" läuft unverändert weiter** — sie liest die Antwort,
nicht den Quelltext.

---

## Bauabschnitt 3 — die Oberfläche: `public/app.js`

**DAS IST DER BROCKEN.** Rund 1.800 Bausteine, 167 `innerHTML`-Vorlagen,
102 `textContent`, 107 Tooltips, 172 Toasts, 25 Dialoge, 46 Mehrzahlstellen.

### 3.1 In dieser Reihenfolge, Ansicht für Ansicht

1. **Anmeldung und Einrichtung** — `showLogin()` (`:621`), die Einrichtung,
   die drei Token-Seiten (`#/einladung`, `#/passwort`, `#/bestaetigung`).
2. **Kopfzeile und Liste** — Filterleiste, Sortierzeile, Kacheln,
   Suchzeile und Trefferkontext, die Glocke.
3. **Der Eintrag** — Blöcke, beide Sternkästen, Fotos und Betrachter,
   Testtage, Aufgaben, Kommentare, Links, Dateien.
4. **Die Dialoge** — `confirmBox`, `nameBox`, `passwortFenster`,
   `neuesPasswortFenster`, `benutzerLoeschenFenster`, samt Titel, Satz und
   Knopf nach S7.
5. **Einstellungen, Karte für Karte** — einundzwanzig Karten, darunter
   „Vokabular" (die Beschriftungen aus `VOK_FELDER`, `:8237`; „Vorgabe: …"
   liest `TEXTE.vokabular`) und „Darstellung" (`THEMA_NAMEN`, `:1775`).
6. **Toasts, Neuigkeiten, relative Zeiten** — *„vor 1 Tag / vor N Tagen"*
   (`:10279`), *„noch N Tage"* (`:8541`), `zaehl()` (`:514`, `:7036`) und die
   fünf Vokabelzähler (`:1522–1526`) als Mehrzahlobjekte.

**Nach jeder Ansicht:** der Prüfstand grün, **und die Ansicht am Wirt neben
dem Stand davor** — dasselbe Wort an derselben Stelle, oder es ist ein Fund.

### 3.2 Was dabei nicht verhandelbar ist

* **Kein Wort ändert sich** (2.2 gilt hier wörtlich).
* **Im Inhalt `tH()`, in Attributen `esc(t())`, in `textContent`, `title =`
  und `placeholder =` das nackte `t()`.** Drei Formen, keine vierte.
* **Die Vokabelwörter kommen aus `V` wie heute** — nur die Vorgabe von `V`
  kommt aus `TEXTE.vokabular` statt aus `VOK_VORGABE` (`:8228`), das wegfällt.
  *Stolperstein 47 wird damit an dieser Stelle eingelöst: eine Vorgabe, ein
  Ort.*
* **Zeichen sind keine Texte:** `⌀`, `·`, `→`, `—`, `%`, Zahlen, Adressen,
  Selektoren und Bezeichner bleiben, wo sie sind, und stehen auf der
  Restliste.
* **Kein Text wird zusammengesetzt, kein Vokabelwort verbaut** (S6). Wo eine
  Vorlage heute `'Foto ' + n` schreibt, steht künftig ein Schlüssel mit `{n}`.

### 3.3 Der Prüfstand in diesem Abschnitt

**Der Bildschirmtext-Wächter (`bildschirmtexteVon`, `pruefung.js:24388`)
liest ab hier `de.json` statt `app.js`:** jeder Wert der Datei gegen
`BILDSCHIRM_VERBOT` (`:24481`), das unverändert bleibt; die Untergrenze „mehr
als achthundert lesbare Texte" (`:15402`) gilt für die Datei. **Und über
`app.js` läuft er weiter — mit einer Obergrenze:** die Restprobe
(Bauabschnitt 5).

---

## Bauabschnitt 4 — die Format-Helfer und `<html lang>`

### 4.1 Was gebaut wird

* **`fmtDate`, `fmtDay`, `weekday`** (`app.js:9`, `:17`, `:20`) lesen
  `LOCALE` statt `'de-DE'`. `today()` (`:28`, `'sv-SE'`) **bleibt** — ein
  Trick für `JJJJ-MM-TT`, kein Datum für Menschen.
* **Ein Helfer `zahl(n, stellen)`** über `Intl.NumberFormat(LOCALE)` ersetzt
  die elf `.replace('.', ',')` in `app.js`; im Server dasselbe für `zahl()`
  (`server.js:2247`). **Mit `useGrouping: false`** — sonst stünde in „1.234"
  plötzlich ein Punkt, und der Augenschein wäre nicht mehr derselbe.
* **`localeCompare(…, 'de')`** (`:1419`, `:2412`, `:2571`) liest `LOCALE`;
  die drei ohne Locale bekommen eine, **wo sie Sprache vergleichen** — der
  Vergleich zweier ISO-Zeitstempel (`:2401`) bleibt ohne.
* **`toLowerCase()`** wird `toLocaleLowerCase(LOCALE)` **nur dort, wo Sprache
  verglichen wird** — Suche und Sortierung. *MIME-Typen (`formatAusMime`,
  `server.js:329`), Schlüssel und Adressen bleiben `toLowerCase()`; wer die
  anfasst, hat T3 aus dem Konzept falsch verstanden.*
* **`document.documentElement.lang`** setzt `boot()` aus `SPRACHE`. Das
  Attribut in `index.html` bleibt `de`.

### 4.2 Was dabei nicht verhandelbar ist

* **Für `de-DE` liefert jeder Helfer Zeichen für Zeichen, was er heute
  liefert.** Der Prüfstand hält es an je drei Werten je Helfer fest —
  gegen den heutigen Ausdruck, nicht gegen eine neue Erwartung.
* **`gewichtAusText`** (`:1503`) nimmt weiter `1,2` und `1.2`.

---

## Bauabschnitt 5 — der Prüfstand, die Rückbauten, die Reste

### 5.1 Was gebaut wird

**Die sieben Wächter aus dem Konzept, Abschnitt 9**, jeder mit seiner
Gegenprobe in `gegenprobe.js`:

| Wächter | hält fest |
|---|---|
| **Deckungsprobe** | jede Datei unter `public/sprachen/` hat exakt die Schlüssel von `de.json` (ohne `_hinweis`, mit `_locale`). *In dieser Runde prüft sie eine Datei gegen sich selbst — sie wird jetzt gebaut, damit Stufe 2 sie vorfindet* |
| **Verwendungsprobe** | jeder Schlüssel aus `de.json` wird im Code gerufen (`t('…'`, `tH('…'`, `t(sprache, '…'`, `new Meldung('…'`); jeder gerufene existiert |
| **Platzhalterprobe** | je Schlüssel dieselbe Menge `{…}` in jeder Datei; Vokabelplatzhalter nur aus den vierzehn Namen |
| **Mehrzahlprobe** | jedes Objekt trägt `eins` und `andere`; im Code steht kein `=== 1 ?` mehr, das zwei Strings wählt |
| **Restprobe** | der Tokenizer findet in `app.js` **weniger als 60** lesbare Texte, und sie stehen **namentlich** in einer Liste im Prüfstand — Zeichen, Bezeichner, der eine Satz aus 1.1. *Die Schwelle ist ein Vorschlag des Konzepts; die Zahl, die beim Bauen herauskommt, wird festgenagelt* |
| **Rückfallprobe** | kein `⟦` im DOM irgendeiner Ansicht — der jsdom-Durchgang über Anmeldung, Liste, Eintrag, Einstellungen (`sysDurchgang`) sucht das Zeichen |
| **Formatprobe** | `_locale` steht in jeder Datei und `Intl.DateTimeFormat.supportedLocalesOf` kennt sie; `fmtDate`, `zahl` und `weekday` liefern für `de-DE` den heutigen Ausdruck |

**Dazu, im Bestand:**

* **Der jsdom-Rahmen** (`baueDom`, `w.fetch` ab `pruefung.js:23523`) liefert
  `/sprachen/de.json` **aus der echten Datei** — die 312 Zusicherungen mit
  deutschem Text bleiben, wie sie sind, und laufen weiter auf Deutsch.
* **Die 28 Rückbauten**, deren `suche` einen deutschen Satz im Quelltext
  trifft, suchen ihn in `public/sprachen/de.json` — **mitgezogen, nicht
  gelöscht** (Stolperstein 201). *`gegenprobe.js` kopiert über `git archive
  HEAD`: die Datei muss eingecheckt sein, bevor ein Rückbau sie sieht.*
* **Die Dateilisten der Wächter über ausgelieferte Dateien** bekommen
  `public/sprachen/de.json` dazu, wo sie Text lesen — der Wächter gegen den
  alten Namen (`GEPRUEFT`, `pruefung.js:668`) zuerst. **`COOKIE_DATEIEN` (7)
  und `SPRACH_QUELLEN` (13) ändern sich nicht** — es kommt keine
  Quelltextdatei dazu; `t()` lebt in `app.js` und `server.js`.
* **Die Zahlen, die festgenagelt werden:** Sprachdateien = **1**; Reste in
  `app.js` **< 60** (die gemessene Zahl daneben); Schlüssel in `de.json`
  (die gemessene Zahl); `PERSOENLICHE_SCHLUESSEL` = **10, unverändert**;
  die Felder von `/api/config` = **5, unverändert**; `F_ROUTEN` = **70,
  unverändert**.

### 5.2 Was dabei nicht verhandelbar ist

* **Keine Prüfung wird gelöscht, weil sie deutschen Text sucht.** Sie sucht
  ihn danach an der richtigen Stelle.
* **Jede neue Prüfung hat ihre Gegenprobe, und die wird gefahren** — eine
  stumme Gegenprobe ist ein Fund (Abschnitt 12 des Projektstands).

---

## Die Entscheidungen

**Die des Konzepts, die diese Runde trägt** — sie stehen dort in Abschnitt 10
mit Begründung; hier nur, welche greifen:

| # | | in dieser Runde |
|---|---|---|
| **E1** | JSON, ISO-639-1, `public/sprachen/de.json` | **ja** |
| **E2** | deutsche Schlüssel nach der Sache, benannte Platzhalter | **ja** |
| **E3** | Mehrzahl als Objekt, `Intl.PluralRules`, der ganze Satz wechselt | **ja** |
| **E4** | keine Bibliothek — `t()`/`tH()` in vierzig Zeilen, beide Seiten | **ja** |
| **E9** | Vokabelvorgaben in der Sprachdatei | **ja — die Überschreibung je Sprache nicht** (Stufe 2) |
| **E10** | `_locale` im Kopf, `Intl` statt `replace`, `toLocaleLowerCase` | **ja** |
| **E11** | was nicht übersetzt wird | **ja** |
| E5 bis E8 | Wahl, Anmeldeseite, Serverquellen, Mails je Empfänger | **nein — Stufe 2**; `spracheVon(req)` liefert `de` |
| E12 | die Nummern der Stufen | **vom Betreiber entschieden: Stufe 1 allein, als 0.24.0** — siehe den Kasten am Kopf; Stufe 2 und 3 offen |
| E13, E14 | Englisch, Leser | **nein — Stufe 2 und 3** |

**Und drei, die erst beim Schreiben dieses Auftrags aufgekommen sind:**

| # | Frage | Entscheidung |
|---|---|---|
| **A1** | Was passiert, wenn `de.json` im Browser nicht lädt? | **Ein fester Satz, und `boot()` hält an.** Der eine erlaubte Text im Code (1.1) |
| **A2** | Text in Attributen? | **Der ganze Text maskiert: `esc(t())`** — wegen des geraden Anführungsstrichs am Zitatende (1.2) |
| **A3** | `Intl.NumberFormat` gruppiert Tausender | **`useGrouping: false`** — der Augenschein bleibt (4.1) |

**Keine davon ist beim Bauen noch offen.** Wer eine aufmacht, macht sie im
Konzept auf und nicht im Quelltext.

---

## Was ausdrücklich NICHT gebaut wird

* **Keine zweite Sprache und keine Wahl.** Kein Schlüssel `sprache`, keine
  Pille in „Darstellung", keine Zeile unter der Anmeldemaske, kein
  `Accept-Language`, kein sechstes Feld in `/api/config`. *Alles Stufe 2.*
* **Kein Wort anders.** Weder verbessert noch gekürzt noch vereinheitlicht.
  *Wer beim Umzug einen Text ändert, hat den Auftrag verlassen — und die
  Abnahme (dasselbe Wort an derselben Stelle) gleich mit.*
* **Kein `_hinweis`** — Übersetzerhinweise kommen mit der ersten Übersetzung,
  nicht vorher.
* **Keine Übersetzung von Kommentaren, Papieren, Konsole, Werkzeugen,
  Prüfstand.** Die Sprache des Projekts bleibt Deutsch.
* **Keine Bibliothek, keine neue Route, kein Schema, kein Bestandslauf, kein
  Migrationsblock, keine neue Quelltextdatei.**
* **Kein Umbau der Karte „Vokabular"** außer der Herkunft der Vorgabe.
* **Keine Änderung an `style.css`, `index.html` (außer nichts) und
  `thema.js`.** *Ein Text ist kein Stil.*

---

## Der Prüfstand — was er halten muss

1. **`de.json` liegt unter `public/sprachen/`, trägt `_locale: "de-DE"`, und
   jeder Wert ist ein String oder ein Objekt `{ eins, andere }`.** Kein Wert
   trägt `<` oder `>`.
2. **Der Tokenizer findet in `app.js` weniger als 60 lesbare Texte, und die
   Liste steht namentlich da** (Restprobe).
3. **Null Literale hinter `error:` in `server.js` und `auth.js`; null deutsche
   Sätze in `throw new Error` in `auth.js`; null Literale in den vier
   Briefen und Betreffzeilen.**
4. **Deckungs-, Verwendungs-, Platzhalter-, Mehrzahl-, Rückfall- und
   Formatprobe grün — und ihre Gegenproben rot.**
5. **`BILDSCHIRM_VERBOT` läuft über `de.json` und findet nichts.**
6. **Die Format-Helfer liefern für `de-DE` den heutigen Ausdruck** — je drei
   Werte je Helfer gegen den Stand `92f7a142`.
7. **Eine `Meldung` aus `auth.js` kommt als `error` mit Satz und Status
   heraus** — an einem Zugang, einer Anmeldung, einem zweiten Faktor.
8. **`PERSOENLICHE_SCHLUESSEL` = 10, `/api/config` = 5 Felder, `F_ROUTEN` =
   70** — unverändert, und der Prüfstand sagt es weiter.
9. **Der Fingerprint deckt `public/sprachen/de.json` ab** — eine Änderung
   an der Datei ändert ihn (die Prüfung ab `pruefung.js:890` bekommt den
   Fall dazu).
10. **Kein `⟦` in irgendeinem DOM des jsdom-Durchgangs.**
11. **`npm test` grün, und jede der neuen Prüfungen hat ihre Gegenprobe in
    `gegenprobe.js` gefahren.**

---

## Bauregeln

* **Die fünf Bauabschnitte in dieser Reihenfolge**, und jeder ein eigener
  Commit („0.24.0 Bauabschnitt n: …"), mit grünem Prüfstand. **Abschnitt 1
  ist fertig, bevor der erste Satz umzieht.**
* **Innerhalb von Abschnitt 3 je Ansicht ein Commit** — ein halb umgezogener
  Stand ist erlaubt, solange der Prüfstand grün ist und die Ansicht am Wirt
  dieselbe; **eine halb umgezogene Ansicht nicht.**
* **Wer einen Text findet, den das Konzept nicht zählt, trägt ihn nach** —
  in das Konzept (Abschnitt 2) und in das Änderungsprotokoll, mit Zahl. *Die
  Zahlen sind gezählt, nicht geschätzt; eine mehr ist ein Fund und kein
  Fehler (Stolperstein 137).*
* **Kein Wort anders.** Die Regel steht dreimal in diesem Auftrag, weil sie
  die Abnahme ist.
* **Deutsch in Kommentar und Oberfläche** (S1 bis S7, Abschnitt 12 des
  Projektstands); die Gestaltungsregeln G1 bis G12 gelten unverändert.
* **Erst nachstellen, dann behaupten** — `Intl.PluralRules('de-DE').select(0)`
  ist `other`, nicht `one`; wer das nicht weiß, schreibt „0 Kommentar".

---

## Die Dokumente

* **`Doku/Konzept_Mehrsprachigkeit_0_24_0.md`** — steht; beim Bauen nur
  ergänzt (Funde nach den Bauregeln, die gemessenen Zahlen), nicht
  umgeschrieben. **E12 trägt seit dem 5. September 2026 die Entscheidung des
  Betreibers.**
* **`Doku/Aenderungsprotokoll_0.24.0.md`** — neu, am Ende: was wirklich
  umgezogen ist, mit den Zahlen, die herauskamen; was auf der Restliste steht
  und warum; welche Texte beim Umzug als Fund aufgefallen sind, ohne geändert
  zu werden.
* **`CHANGELOG.md`** — der Eintrag zur Version. **Kein Kasten darüber:** ein
  Betreiber hat nichts zu tun, und er sieht nichts.
* **`Doku/Projektstand_…`** — `git mv` auf die Nummer; Kopf, Betriebsstand,
  Abschnitt 8 (die Zahlen des Prüfstands), der Fahrplan (Stufe 1 gebaut),
  Abschnitt 10a (der Wegweiser bleibt, Stufe 1 als gebaut vermerkt),
  Versionsgeschichte. **Dazu eine Sprachregel S8 in Abschnitt 5.6:** *Text ist
  Daten — kein Text der Oberfläche steht im Quelltext; wer einen braucht,
  legt einen Schlüssel an.* Der Prüfstand hält sie (Restprobe).
* **`README.md`** — nur, wenn ein Betreiber etwas Neues sieht. *In dieser
  Runde: nichts.* Ein Satz zum Ordner `public/sprachen/` gehört dorthin,
  sobald Stufe 2 die Wahl bringt.
* **`package.json`** — `0.24.0`.
* **Dieser Auftrag fällt mit dem nächsten weg** — es liegt immer nur einer
  im Repo.

---

## Was danach offen bleibt

* **Stufe 2 — Englisch.** Die Wahl je Zugang, die Vorgabe der Installation,
  die Zeile unter der Anmeldemaske, `spracheVon(req)` mit seinen drei
  Quellen, die Mails je Empfänger, das Objekt je Sprache im Schlüssel
  `vokabular`, `_hinweis` — und das englische Wörterbuch, beschlossen vor
  der ersten Zeile (Konzept, S2.1).
* **Stufe 3 — Türkisch.**
* **Die Liste der Texte, die beim Umzug aufgefallen sind** — ein Satz, der
  gegen S1 verstößt, ein Wort, das zweimal vorkommt, ein Tooltip über acht
  Wörtern. **Sie werden in dieser Runde nicht geändert**; sie stehen im
  Änderungsprotokoll und gehen ins Sammelblatt, wenn sie eine Runde
  brauchen.
* **Die Ladezeit der Sprachdatei** — gemessen am Wirt, nicht geschätzt
  (Konzept, Abschnitt 11). *Wenn sie stört, ist sie ein Befund für Stufe 2
  und keine Überraschung.*
* **Die Nummern von Stufe 2 und 3** — am Auftrag zu Stufe 2 zu entscheiden:
  die nächste freie MINOR-Zahl (heute 0.25.0) oder eine PATCH-Zahl hinter
  0.24.0. *Eine zweite Sprache bringt eine Funktion; Abschnitt 5.1 sagt dazu
  MINOR.*
