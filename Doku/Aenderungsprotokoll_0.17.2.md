# Änderungsprotokoll 0.17.2 — „Der Deckel und die eigene Hand"

**Version 0.17.2 · gebaut am 31. August 2026 · Fingerprint `edbd76b6` ·
4747 Prüfungen · 368 Rückbauten in `gegenprobe.js`**

---

**Sechs Handgriffe aus dem Rundlauf mit 0.17.1.** Gemeldet am 31. August 2026,
unmittelbar nach dem Einspielen — **mit Bildern vom laufenden Betrieb, nicht aus
dem Kopf.** *Der Prüfstand war beim Start grün: 4715 von 4715.* **Zwei der sechs
Punkte sind Nacharbeit an 0.17.1 selbst:** eine Regel, die zu weit ging, und
eine Zeile, die dabei ihren Namen verlor.

> **DIE NUMMER: PATCH.** *Projektstand 5.1: „Dritte Zahl (PATCH) nur für
> abwärtskompatible Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist
> keine PATCH-Runde."* **Diese Runde bringt keine Funktion** — fünf Handgriffe
> an Anordnung und Wortlaut, einer nimmt eine Meldung zurück. **Die Instanz kann
> danach nichts, was sie vorher nicht konnte; sie sagt an zwei Stellen weniger.**

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. Kein einziger der sechs Punkte fasst Daten an.
> **DIE SICHERUNG DES DATENVERZEICHNISSES IST DESHALB EMPFEHLUNG UND NICHT
> PFLICHT.**

**ALLE SECHS PUNKTE SIND GEBAUT.** Keiner ist herausgefallen, keiner ist
verschoben. **Ein Punkt ist während der Runde dazugekommen** — die README —
**und ist in den Auftrag nachgetragen worden, bevor er gebaut wurde**
(Abschnitt 7).

---

## Inhalt

1. [Die Zeile einer Anmeldung](#1-die-zeile-einer-anmeldung)
2. [Der Deckel, der mitgeht](#2-der-deckel-der-mitgeht)
3. [Der Mailversand zu Ende geordnet](#3-der-mailversand-zu-ende-geordnet)
4. [Die Klammer erst ab zwei Stimmen](#4-die-klammer-erst-ab-zwei-stimmen)
5. [Die Glocke und die eigene Hand](#5-die-glocke-und-die-eigene-hand)
6. [Die README spricht mit dem Erstleser](#6-die-readme-spricht-mit-dem-erstleser)
7. [Die Entscheidungen dieser Runde](#7-die-entscheidungen-dieser-runde)
8. [Was je Datei geändert wurde](#8-was-je-datei-geändert-wurde)
9. [Der Prüfstand](#9-der-prüfstand)
10. [Gegenproben](#10-gegenproben)
11. [Neue Stolpersteine](#11-neue-stolpersteine)
12. [Die Zahlen](#12-die-zahlen)
13. [Was ausdrücklich nicht passiert ist](#13-was-ausdrücklich-nicht-passiert-ist)
14. [Offen geblieben](#14-offen-geblieben)

---

## 1. Die Zeile einer Anmeldung

**BEFUND.** Am Telefon stand in der Karte „Meine Sitzungen" *„Diese Anmeldung
(…"* — der Name war abgeschnitten. **0.17.1 hatte die beiden Zeitangaben
untereinandergestellt und den Namen daneben gelassen**, in derselben
Rasterzeile; auf 366 Pixeln blieb für ihn nichts übrig.

**ENTSCHIEDEN GEGEN DIE ELLIPSE MIT ÜBERFAHREN.** *Ein Text, den man erst
herbeiführen muss, ist auf einem Berührungsbildschirm keiner* — dort gibt es
kein Überfahren, und ein `title` bleibt unsichtbar. **Zwei Reihen statt einer:**

```css
.mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; column-gap: 9px; row-gap: 2px; }
.mrow.sitz .mname   { grid-column: 1; grid-row: 1; }
.mrow.sitz .zug-akt { grid-column: 2; grid-row: 1; }
.mrow.sitz .sitz-zeit { grid-column: 1 / -1; justify-self: end; text-align: right; }
```

**Oben der Name mit dem Kreuz daneben, darunter die beiden Zeiten** — beide über
die ganze Breite, rechtsbündig, wie seit 0.17.1. **Das Raster trägt dafür nur
noch zwei Spalten**: eine dritte gäbe es nur, wenn die Zeiten wieder daneben
stünden.

**DIE REGEL GILT JETZT AUF JEDEM SCHIRM** und nicht mehr nur in der
Medienabfrage. *Die Zeile ist auf einem breiten Schirm nicht anders gebaut als
auf einem schmalen — sie hat nur mehr Platz.* **Und der orangene Rahmen der
eigenen Anmeldung reicht weiterhin bis zum Rand**: er hängt seit 0.17.1 an der
nachgebenden Namensspalte, und die ist geblieben.

---

## 2. Der Deckel, der mitgeht

**BEFUND — und er ist Nacharbeit an 0.17.1.** Punkt 2 jener Runde hatte den
Listen die feste Höhe genommen, **ohne etwas an ihre Stelle zu setzen**. Im
Abschnitt „Bestand" zog die Tagliste die Seite auf rund **fünfzig Zeilen**
auseinander; daneben standen vier Kacheln mit drei Zeilen und viel Weiß.

> **DIE AUFLAGE WAR NICHT „EIN DECKEL", SONDERN „EIN DECKEL, DER MITGEHT".**
> *Wörtlich: „Deckel ist dynamisch — wenn dieser durch andere Kachel, wenn die
> neben dem sind wie zum Beispiel ‚Vokabular', der ja mehr Platz braucht, bei
> denen kann er auch mit länger werden. Aber steht neben ihm kein anderer, der
> das benötigt, ist es maximal 12 Einträge."*

**DAS IST DER GRUND, WARUM DER DECKEL NICHT IN `max-height` STEHT.** Eine feste
Zahl dort klemmt **beides**: was die Liste **fordert** und wie hoch sie werden
**darf**. Der Platz einer höheren Nachbarkachel bliebe dann leer — genau der
Fall, den 0.17.1 hatte lösen sollen.

```css
.manage-list { flex: 1 1 33.5rem; min-height: 0; max-height: max-content;
  overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
.prot-liste  { flex: 1 1 28rem;   min-height: 0; max-height: max-content;
  overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
```

**DREI ZEILEN, DREI AUFGABEN:**

| Zeile | was sie tut |
|---|---|
| `flex: 1 1 <12 Zeilen>` | die **Forderung**: so hoch hätte die Liste es gern. `flex-grow: 1` nimmt zusätzlich, was in der Reihe übrig ist |
| `min-height: 0` | die Zeile, an der es sonst scheitert: **ohne sie wächst ein Flexkind über seinen Anteil hinaus, statt zu rollen** (Stolperstein 237) |
| `max-height: max-content` | die Zeile, **die den Leerraum nimmt**: sie klemmt auf das, was wirklich dasteht — nie auf weniger |

**OHNE DIE DRITTE ZEILE FORDERTE AUCH EINE LISTE MIT ZWEI ZEILEN IHRE ZWÖLF**,
und die Kachel „Kategorien" wäre so hoch wie die mit fünfzig Tags.

**NACHGEMESSEN IN CHROMIUM UND NICHT GEGLAUBT** (Stolperstein 140). *jsdom
rechnet kein Layout; jede Höhe ist dort null.* Gemessen am echten Stilblatt,
mit `--headless --virtual-time-budget=2000 --dump-dom`:

| Lage | gemessen |
|---|---|
| 50 Einträge, allein in der Reihe | **503 px = 12,0 Zeilen**, rollt |
| 50 Einträge, daneben eine 700 px hohe Nachbarin | **700 px = 16,7 Zeilen** — sie nimmt die Höhe mit |
| 2 Einträge, allein | **84 px = 2 Zeilen**, rollt nicht |
| 12 Einträge | **genau zwölf**, rollt nicht |

**`33.5rem` SIND ZWÖLF ZEILEN, UND DIE ZAHL STEHT IN `rem` UND NICHT IN
PIXELN.** *Eine `.mrow` misst mit Innenabstand und Abstand zur nächsten
41,92 px, die Wurzelschrift steht auf 15.* **Die Oberfläche stellt ihre Schrift
von 80 bis 120 Prozent** — eine feste Pixelzahl fasste dort mal neun und mal
fünfzehn Zeilen. *`.prot-liste` steht bei `28rem`: eine `.prot-zeile` misst in
der breiten Karte 35 px, sie trägt keinen Abstand zur nächsten, sondern eine
Linie.*

**AUF DEM TELEFON IST DER DECKEL WIEDER EINE GRENZE UND KEINE FORDERUNG:**

```css
.manage-list, .prot-liste, .test-scroll, .atext, #ex-teil-liste {
  flex: 0 1 auto; max-height: 62vh; max-height: 62dvh; }
```

*Dort steht jede Kachel **allein** in ihrer Zeile — es gibt keine Nachbarin,
deren Höhe eine Liste mitnehmen könnte.* **`flex: 0 1 auto` lässt sie ihren
Inhalt fordern, und das Fenstermaß deckelt ihn**; die Forderung von zwölf Zeilen
machte eine Karte mit zwei Einträgen sonst so hoch wie eine mit fünfzig.

**DIE EINE AUSNAHME BLEIBT UND STEHT ALS SATZ DA:** `#ex-teil-liste` deckelt
fest bei 280 px. *Die Teileliste des Exports steht **mitten** in ihrer Karte —
über ihr der Export, unter ihr der Import; nähme sie die Kachelhöhe, schöbe sie
den Import aus dem Blick, und ein Bestand von zwanzig Gigabyte ergibt siebzig
Zeilen.*

---

## 3. Der Mailversand zu Ende geordnet

**BEFUND.** 0.17.1 hatte die sechs Felder in vier Reihen gebracht — *wer ·
wohin · womit · als wer* —, die **erklärenden Sätze** aber als eigene Zeilen
darunter stehen lassen: quer durch die Karte, die halbe Breite leer.

**GEBAUT: der Satz steht NEBEN seiner Sache.**

```css
.mail-alswer, .mail-tun { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
.mail-satz { margin: 0; align-self: end; padding-bottom: 10px; }
```

**Ein Drittel links, zwei Drittel rechts** — dieselbe Breite links wie der
Anbieter in der ersten Reihe. *Eine Adresse und zwei Knöpfe brauchen sie nicht
ganz, und der Satz daneben liest sich als das, was er ist: eine Erläuterung zu
genau dieser Sache und nicht zur ganzen Karte.*

**DER SATZ SITZT AN DER GRUNDLINIE DES FELDES DANEBEN** und nicht an dessen
Oberkante: *links steht über dem Feld noch eine Beschriftung, und ein Satz, der
auf ihrer Höhe begänne, sähe aus wie eine zweite Beschriftung.*

**AUF DEM TELEFON STEHT ER WIEDER UNTER SEINER SACHE** — und dann gehört er an
ihren Anfang und nicht an ihr Ende (`align-self: start`, `margin: 0 0 14px`).

**UND EIN SATZ IST GESTRICHEN.** Unter der Testmail stand:

> *„— es gibt kein Adressfeld daneben, und zwar mit Absicht: ein Knopf, der an
> eine beliebige Adresse schickt, wäre ein offener Mailverteiler hinter einer
> Anmeldung."*

**Er ist richtig und war ein Gedanke vom Bauen.** *Eine Oberfläche sagt, WAS IST
— nicht, warum sie so gebaut ist (Projektstand 5.6).* **Er steht in der README**,
und der Prüfstand hält **beide** Seiten fest: hier weg, dort da
(Stolperstein 81). **Was die Testmail TUT, steht weiterhin in der Karte** — sie
geht ausschließlich an die Adresse des eigenen Zugangs.

---

## 4. Die Klammer erst ab zwei Stimmen

**BEFUND.** An einem Kriterium, das genau einer bewertet hatte, stand
`⌀ 4,0 (1)`.

**DIE KLAMMER BEANTWORTET DIE FRAGE, WIE SCHWER DER SCHNITT WIEGT** — *„aus wie
vielen?"* **Bei einer einzigen Stimme gibt es diese Frage nicht**, und *dass*
jemand bewertet hat, sagt schon der Schnitt daneben. *Dieselbe Regel wie die
fehlende Null am Knopf „Offen" und in der Glockentafel: keine Angabe über
nichts.*

```js
a.textContent = r.count > 1 ? `⌀ ${schnitt} (${r.count})` : `⌀ ${schnitt}`;
a.title = `Durchschnitt ${schnitt} aus ${stimmen}`;
```

**DER KLARTEXT BLEIBT VOLLSTÄNDIG.** *Er ist die Auskunft für den, der sie
braucht: ein Vorleseprogramm liest kein ⌀, und beim Überfahren ist „aus 1
Stimme" die Antwort auf eine wirklich gestellte Frage.* **Was wegfällt, ist die
Zahl auf dem Bildschirm und nicht die Auskunft** — und die Einzahl steht
weiterhin in der Einzahl.

---

## 5. Die Glocke und die eigene Hand

**BEFUND.** *Wörtlich: „Wenn ein User/Admin Bewertungen und Kommentare
schreibt, braucht man ihm nicht Bescheid geben, dass er was gemacht hat. Über
die eigenen Aktionen braucht man einen selbst nicht als Neuigkeit melden."*

**DAS IST DIE ZWEITE WENDE AN DIESER ENTSCHEIDUNG, UND BEIDE VERMERKE BLEIBEN
STEHEN** (Stolperstein 201):

| Runde | Zusage | Begründung |
|---|---|---|
| **0.16.0** | die eigenen Beiträge **nicht** | eine Glocke ist eine Nachricht von jemand anderem |
| **0.17.0** | die eigenen Beiträge **mit** | einer Betreiberin, die allein arbeitet, meldet eine Glocke, die nur Fremdes zeigt, nie etwas — und die Pille „Neu seit …" fiel in derselben Runde weg |
| **0.17.2** | die eigenen Beiträge **nicht** | die Antwort von 0.17.0 war die falsche: wer allein arbeitet, hat nichts, wovon ihm jemand berichten müsste |

```sql
SELECT item_id, user_id, COUNT(*) AS n FROM comments
  WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id
```

**`IS NOT ?` UND NICHT `!= ?` — und das ist kein Geschmack.** *Eine herrenlose
Zeile trägt `user_id` NULL, und `NULL != 1` ist in SQL **nicht wahr, sondern
NULL**.* **Mit `!=` fielen genau die Zeilen still aus dem Ergebnis, deren
Verfasser entfernt wurde** — ein Kommentar eines gelöschten Zugangs wäre
unsichtbar geworden, ohne jede Fehlermeldung (Stolperstein 242).

**DIE FOLGE IST GEWOLLT UND GEHÖRT AUSGESPROCHEN: bei genau einem Zugang bleibt
die Glocke still.** *Der Bezugspunkt wird trotzdem weiter gesetzt — sonst staute
sich beim ersten fremden Beitrag alles seit Wochen auf.*

**UND DIE TAFEL SAGT ES AUCH.** Aus *„Kommentare und Bewertungen, **von
allen**. Die eigenen stehen mit da"* wird *„Kommentare und Bewertungen **von den
anderen**"*. **Der Name des Knopfes bleibt „Neu seit deinem letzten Blick"** —
er sagt, **worauf** sich die Auskunft bezieht, und nicht, wer geschrieben hat.

---

## 6. Die README spricht mit dem Erstleser

**BEFUND — dazugekommen während der Runde.** *Wörtlich: „Ein Readme spricht mit
einem User, der Kriterion zum ersten Mal sieht … Der Hinweis, dass sich das seit
xy verändert hat, ist auch Quatsch. Zu viel Infos, die keinen interessieren."*

**DIE DATEI TRUG SIEBENUNDVIERZIG VERSIONSNUMMERN**, und die meisten erzählten
nur, **wann** etwas entstanden ist: *„Beide Wege zugleich — seit 0.13.0", „Bis
0.12.4 stand hier ein Handgriff", „Die Pille ist mit 0.17.0 weggefallen".*
**Wer Kriterion zum ersten Mal aufmacht, kannte 0.12.4 nie.**

> **DIE REGEL: die Nummer bleibt, wo sie eine HANDLUNG bestimmt — und geht, wo
> sie nur erzählt.** *Dieselbe Regel wie Abschnitt 5.6 für die Oberfläche, eine
> Ebene höher: **ein Handbuch sagt, WAS IST — nicht, seit wann.***

**SECHS NENNUNGEN BLEIBEN**, und jede von ihnen bestimmt etwas:

| Nummer | warum sie bleibt |
|---|---|
| **0.14.0** (3×) | die **Sicherungspflicht** beim Sprung über diese Datenbankstufe — und die Zeile, die dabei **wörtlich** im Protokoll steht |
| **0.8.30** | eine zweite **wörtlich zitierte** Protokollzeile, als Beispiel dafür, wie so eine Zeile aussieht |
| **0.8.0** (2×) | die **älteste Datenbank**, die noch übernommen wird |

**EIN WÄCHTER HÄLT DIE ZAHL FEST**, dieselbe Bauform wie `F_ROUTEN`: *eine Menge
bliebe grün, wenn jemand zwanzig neue „seit 0.14.0" ergänzte* (Stolperstein
243).

**DIE VERSIONSGESCHICHTE IST NICHT GESTRICHEN, SONDERN STEHT DORT, WO SIE
HINGEHÖRT:** im Projektstand, Abschnitt 9, und in den Änderungsprotokollen.
*Beides gibt es, beides ist vollständig, und beides liest, wer es wissen will.*

**MITGEGANGEN SIND DABEI DREI SÄTZE, DIE FALSCH GEWORDEN WÄREN:**

- *„Keine Liste scrollt in sich selbst"* — das gilt für die Listen **am
  Eintrag**, nicht mehr für die Karten im Systembereich. **Die Ausnahme steht
  jetzt als Satz daneben.**
- **Die Glocke** — die README versprach noch *„von allen, die eigenen
  eingeschlossen"*.
- **Der Deckel bei zwölf Zeilen** steht neu im Abschnitt „Systembereich", und
  **die Klammer ab zwei Stimmen** bei der Bewertung.

*Der Einspielweg und die Erstinstallation waren bereits am 31. August
entschlackt worden: `git clone` steht seither vorn, und die Behauptung, das ZIP
bringe das Ausführungsrecht nicht mit, ist berichtigt — es ist der Auspacker
und nicht das ZIP.*

---

### Ein Lauf über alle Texte, die einen Betreiber ansprechen

**NACHGETRAGEN AM 31. AUGUST 2026.** *Punkt 6 hatte nur nach **Versionsnummern**
gesucht. Nach der Berichtigung am Changelog ist derselbe Maßstab auf alle Texte
gelegt worden, die kein Entwicklerpapier sind:* README, Changelog, der Text der
Oberfläche und die Meldungen des Servers. **Achtzig Stellen gemeldet, sechzehn
haben eine strenge Gegenprobe überstanden.**

> **DER SCHWERSTE BEFUND WAR EINE REGRESSION AUS DERSELBEN RUNDE.** Die README
> verwies an **drei** Stellen auf `CHANGELOG.md` *„unter ‚Was du danach von Hand
> tun musst'"* — **einen Abschnitt, den es seit dem Umbau nur noch unter den
> Einträgen bis 0.9.1 gibt.** *Und er steht genau an der Stelle, an der jemand
> entscheidet, ob er vor dem Einspielen sichert: wer die Rubrik nicht findet,
> liest nach dem Wortlaut des Satzes „Sicherung nur Empfehlung" — bei 0.10.0,
> 0.14.0 und 0.16.0 wäre das der Bestand.* **Alle drei zeigen jetzt auf den
> Kasten über den Änderungen.**

**WAS SONST GEHALTEN HAT — und alles davon ist berichtigt:**

| Stelle | was daran nicht ging |
|---|---|
| README, „Auf dem Telefon" | *„dasselbe Markup in zwei Gestalten … kein Verschieben von Knoten, keine Weiche nach Gerät"* — drei Wörter aus dem Quelltext in einem Satz |
| README, „Berühren, halten, wischen" | *„Die Pfeile hängen an der Lightbox … Kinder davon wandern mit dem Bild aus dem Bild"* |
| README, „Schriftgröße" | *„Sämtliche Schriftgrößen im Stylesheet sind relativ (`rem`) und hängen an einem Grundmaß am Wurzelelement"* — der Abschnitt sagte zuerst, wie es gebaut ist, statt was man einstellen kann |
| README, „Prüfen" | `searchText` und `testDays` — Feldnamen, die kein Leser je sieht |
| README, Zugänge | *„— wie bisher"*: eine frühere Fassung, die der Erstleser nie gesehen hat |
| README, Suche | *„sucht der Server und nicht mehr der Browser … dasselbe wie vorher"* — derselbe Vergleich |
| Changelog, fünf Zeilen | *„32 Pixel zu tief"*, *„75 Pixel flacher"*, *„auf einer ausgerechneten Textbreite"*, *„zwei Abspieler mit derselben Quelle"*, *„vierzehn Anzeigefehler"* — Werte aus dem Stilblatt und Bauursachen statt der Sache |

**VIER BEFUNDE LIEGEN IM AUSGELIEFERTEN TEXT UND SIND NICHT MITGEMACHT** — drei
Sätze in der Oberfläche und zwei Meldungen des Servers. *Sie stehen namentlich
im Sammelblatt.* **Der Grund ist ausdrücklich kein inhaltlicher:** jede dieser
Dateien geht in den Fingerprint, und die Papiere dieser Runde waren schon
geschrieben. *Drei von ihnen stehen ohnehin seit 0.17.0 auf der Liste der
zwölf, die „gefunden, benannt und stehengeblieben" sind.*

**UND EINER IST NACH DER GEGENPROBE VERWORFEN WORDEN, zu Recht:** die Zeile
*„`node gegenprobe.js 2 256` fuhr neben Rückbau 256 auch die 83 mit"* war als
Entwicklernachricht gemeldet. **`gegenprobe.js` liegt beim Betreiber im
Projektverzeichnis** — nur nicht im Image —, **und die README erklärt sie mit
lauffähigem Aufruf.** *Der Name ist damit einer, den der Leser selbst sieht,
und die Zeile bleibt.*

---

## 7. Die Entscheidungen dieser Runde

**ERSTENS: DER DECKEL STEHT IN `flex-basis` UND NICHT IN `max-height`.** *Das
ist die eine echte Entscheidung der Runde.* Ein schlichtes `max-height: 33.5rem`
hätte die Seite ebenso beruhigt — **und Punkt 2 von 0.17.1 im selben Zug wieder
zurückgenommen**, denn es klemmt die Forderung mit. **Der Auftrag verlangte
ausdrücklich beides**, und beides zusammen geht nur so.

**ZWEITENS: EIN SIEBTER PUNKT IST DAZUGEKOMMEN UND IN DEN AUFTRAG NACHGETRAGEN
WORDEN, BEVOR ER GEBAUT WURDE.** Die README war als Berichtigung am
Einspielweg gemeldet und wurde beim Lesen zu einem eigenen Punkt. *Ein Punkt,
der nur im Chat steht, ist beim nächsten Lesen nicht mehr da* — er steht jetzt
als Punkt 6 im Auftrag, mit seiner Regel und seiner Tabelle.

**DRITTENS: DIE PRÜFLAGEN DER GLOCKE SIND UMGEDREHT UND NICHT GELÖSCHT WORDEN**
— und das ist beim Nachlesen aufgefallen, nicht beim Laufen. **Die
Oberflächengruppen prüften gegen einen gestellten Server:** dort stand der
eigene Name in der Tafel, weil die Prüflage ihn hineinschrieb. *Der Umbau am
Server allein macht so eine Gruppe nicht rot — sie blieb grün und behauptete
weiter das Gegenteil der neuen Zusage* (Stolperstein 244). **Der eigene Name
bleibt in der Tabelle stehen und belegt seither seine Abwesenheit.**

**VIERTENS: DER CHANGELOG IST AUF EINE ZEILE JE ÄNDERUNG GEBRACHT WORDEN —
rückwirkend bis 0.10.0, und in zwei Anläufen.** *Der erste hat die Absätze
weggenommen und die beiden eigenen Abschnitte behalten, mit der Begründung, sie
seien „für einen Betreiber das Wertvollste am ganzen Papier". **Das stimmte zur
Hälfte.*** Wertvoll war *„die Sicherung ist Pflicht"*; daneben standen
`F_ROUTEN` 69, „siebter Migrationsblock", „Karten 19 → 18" — **jede Zahl
richtig, jede aus dem Bauen, und keine beantwortet die Frage, die ein Betreiber
vor dem Einspielen hat.** *Die richtige Hälfte hat die falsche gedeckt, weil
beide in derselben Zeile standen* (Stolperstein 245).
**Jetzt gilt: über den Änderungen steht ein Kasten, und nur dann, wenn wirklich
etwas zu tun ist.** Von achtzehn Einträgen tragen ihn **vier** — 0.10.0, 0.13.0,
0.14.0 und 0.16.0. *Auch „danach von Hand: nichts" ist weg: eine Zeile, die
sagt, dass nichts zu tun ist, ist eine Auskunft über nichts.* **2619 → 1168
Zeilen**, davon 197 für die achtzehn Einträge ab 0.10.0. **Die Einträge bis
0.9.1 bleiben in der Form ihrer Zeit.**

**FÜNFTENS: DIE ANORDNUNG DER ANMELDEZEILE GILT JETZT AUF JEDEM SCHIRM.** Sie
stand bis 0.17.1 in der Medienabfrage. *Eine Zeile, die auf einem breiten Schirm
anders gebaut ist als auf einem schmalen, ist zwei Zeilen — und eine davon wird
irgendwann vergessen.*

---

## 8. Was je Datei geändert wurde

| Datei | was |
|---|---|
| `public/style.css` | der Deckel an `.manage-list` und `.prot-liste` samt Telefonregel; die Anmeldezeile als globales Raster mit zwei Spalten; `.mail-alswer`/`.mail-tun` und `.mail-satz` |
| `public/app.js` | die Karte „Mailversand" in fünf Reihen, der gestrichene Satz; die Klammer ab zwei Stimmen; der Text der Glockentafel; drei Kommentare zur gewendeten Zusage |
| `server.js` | `user_id IS NOT ?` in beiden Glockenabfragen, dazu der Vermerk zur zweiten Wende und zu `IS NOT` gegen `!=` |
| `README.md` | siebenundvierzig Versionsnummern auf sechs; die Glocke, der Deckel und die Klammer nachgezogen; drei Sätze berichtigt |
| `pruefung.js` | eine neue Gruppe, ein neuer Wächter, die Stellschraube `stimmspalten`, die umgedrehten Glockenlagen |
| `gegenprobe.js` | fünfzehn neue Rückbauten (354–368), sieben vorhandene mitgezogen |
| `package.json`, `package-lock.json` | Version **0.17.2**, an allen drei Stellen |
| `Doku/Projektstand_Kriterion_0_17_1.md` → `_0_17_2.md` | **`git mv`.** Kopf (Revision 42), der Satz zur Runde, Betriebsstand, **Stolpersteine 242–244**, Prüfstand (Zahlen, Tabellen, Fingerprintliste), Abschnitt 8, Versionsgeschichte, Abschnitt 10 und 10a auf **GEBAUT**. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `CHANGELOG.md` | der Eintrag `[0.17.2] - 2026-08-31` |
| `Doku/Aenderungsprotokoll_0.17.2.md` | dieses Papier |
| `Doku/Auftrag_0.17.2.md` | Punkt 6 nachgetragen, bevor er gebaut wurde |
| `Doku/Fehler_und_Ideen.md` | die Zeile der Runde auf **GEBAUT** |

---

## 9. Der Prüfstand

**4747 von 4747 bestanden — 4715 waren es vorher, also 32 neue netto.**

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Die Klammer steht erst ab zwei Stimmen — 0.17.2** *(neu)* | — | **8** | die Klammer ab zwei Stimmen, die Verneinung über **alle** Zeilen, der Klartext in Ein- und Mehrzahl |
| Der Sprachwaechter | 16 | **24** | der Wächter über die Versionsnummern in der README — die drei, die bleiben, die Verneinung über alle anderen, die Zahl selbst und zwei Gegenproben am Wächter |
| Der Mailversand ordnet sich — 0.17.1 | 14 | **20** | fünf Reihen, „als wer" und „tun" mit ihrem Satz **daneben**, die drei Regeln im Stilblatt, der gestrichene Satz |
| Die Liste bekommt die Hoehe der Kachel — 0.17.1 | 17 | **21** | der Deckel als **Forderung** in `flex-basis`, `max-height: max-content`, die Telefonregel als Grenze |
| Die Glocke in der Kopfzeile | 51 | **53** | der Einleitungssatz der Tafel, die **stille** Glocke bei einem einzigen Zugang, der eigene Name in keiner Zeile |
| Die Glocke: was mit der Liste mitreist | 25 | **27** | die eigene **Bewertung** zählt nicht mit — und für einen anderen Zugang sehr wohl |
| Die Zeitangaben stehen untereinander — 0.17.1 | 6 | **7** | der Name in seiner eigenen Reihe, das Raster mit nur noch zwei Spalten |
| Zwei Masse vom echten Geraet — 0.17.0 | 16 | **17** | die Zusage zum Rahmen der eigenen Anmeldung liest jetzt das **globale** Raster |
| **zusammen** | | | **+32** |

> **KEINE EINZIGE GRUPPE IST GESCHRUMPFT.** *Die Zusagen der Glocke sind
> **umgedreht** und nicht gelöscht worden (Stolperstein 201): der eigene Name
> steht weiter in der Prüftabelle — er belegt seit dieser Runde seine
> **Abwesenheit** statt seines Daseins.*

**WAS DER PRÜFSTAND AUSDRÜCKLICH NICHT BELEGEN KANN**, und es steht über den
Gruppen:

- **Keine Höhe.** jsdom rechnet kein Layout — **ob der Deckel wirklich mitgeht,
  ist nur am Bildschirm zu sehen.** *Geprüft ist die Regel im Stilblatt, Zeile
  für Zeile, und dass alle Einträge gezeichnet werden; gemessen wurde in
  Chromium, und die Zahlen stehen in Abschnitt 2.*
- **Keine Breite.** Welches Feld des Mailversands in welcher Reihe steht, lässt
  sich belegen; wie breit es dann ist, nicht.

---

## 10. Gegenproben

**Fünfzehn neue Rückbauten, 354 bis 368** — zu jedem der sechs Punkte
mindestens einer.

| Nr | Datei | was zurückgebaut wird |
|---|---|---|
| **354** | `public/style.css` | Das Raster der Sitzungszeile bekommt seine dritte Spalte zurueck |
| **355** | `public/style.css` | Die Liste fordert wieder so viele Zeilen, wie sie hat |
| **356** | `public/style.css` | Das Sicherheitsprotokoll fordert wieder alle seine Zeilen |
| **357** | `public/style.css` | Auf dem Telefon deckelt nichts mehr am Fenster |
| **358** | `public/style.css` | Die beiden letzten Reihen des Mailversands teilen wieder gleich |
| **359** | `public/style.css` | Der Satz sitzt wieder an der Oberkante seines Feldes |
| **360** | `public/style.css` | Auf dem Telefon bleibt der Satz an der Grundlinie haengen |
| **361** | `public/app.js` | Die Absenderadresse faellt aus ihrer Reihe |
| **362** | `public/app.js` | Die beiden Knoepfe fallen aus ihrer Reihe |
| **363** | `public/app.js` | Die Begruendung zum fehlenden Adressfeld steht wieder in der Karte |
| **364** | `public/app.js` | Die Klammer steht wieder auch bei einer einzigen Stimme |
| **365** | `server.js` | Die Glocke meldet wieder die eigenen Kommentare |
| **366** | `server.js` | Die Glocke meldet wieder die eigenen Bewertungen |
| **367** | `public/app.js` | Die Tafel verspricht wieder die eigenen Beitraege |
| **368** | `README.md` | Die README erzaehlt wieder, seit wann etwas gilt |

**DREI VON IHNEN SIND BEIM ERSTEN LAUF STUMM GEBLIEBEN — und jeder davon war
ein Fund.** *Ein Rückbau, der keine einzige Prüfung rot macht, ist kein Erfolg,
sondern eine Lücke im Prüfstand.* **Alle drei sind geschlossen, und die
Rückbauten bleiben, wo sie sind:**

| Nr | warum er stumm blieb | was ergänzt wurde |
|---|---|---|
| **363** | die Verneinung war **weißraumempfindlich**: der Rückbau schreibt den Satz über drei Quelltextzeilen, `textContent` trägt den Umbruch mit, und *„offener Mailverteiler"* stand als `offener\n            Mailverteiler` da | der Weißraum wird eingeebnet — dieselbe Behandlung wie an der Zeile darunter |
| **366** | die **eigene Bewertung** war nirgends gestellt: geprüft war nur die Abfrage der Kommentare, und die Zusage gilt für **beide** (Stolperstein 81) | die Fragende bewertet selbst, die Zahl darf sich nicht bewegen — dazu die Gegenlage am zweiten Zugang, für den dieselbe Bewertung fremd ist |
| **367** | der **Einleitungssatz der Glockentafel** war an keiner Stelle als Zusage geprüft | erst das Vorhandensein von *„von den anderen"*, dann die Verneinung gegen die alte Fassung |

**Das sind vier Prüfungen mehr: 4743 → 4747.** *Sie stehen in diesem Papier,
weil die Gegenprobe genau dafür da ist — und weil ein stummer Rückbau beim
nächsten Lesen sonst wie ein bestandener aussieht.*

**SIEBEN SIND MITGEGANGEN, NICHT GELÖSCHT** (Stolperstein 201) — sie zeigten auf
Zeilen, die diese Runde umgebaut hat. *Ein Rückbau, der ins Leere greift, ist
stumm und verfälscht die Tabelle* (Stolperstein 192); **die Zeile „Jeder
Suchtext kommt in seiner Datei genau einmal vor" wird dabei sofort rot, noch
bevor ein Lauf nötig ist.**

| Nr | vorher | jetzt |
|---|---|---|
| **286** | zum **zweiten** Mal umgedreht — er zielte auf die Zusage der Glocke, und die ist zurückgenommen | er belegt, dass die eigene Hand **nicht** mitzählt |
| **305** | zielte auf die Anmeldezeile, deren Anker sich schon wieder verschoben hat | dieselbe Zusage, der neue Anker |
| **321** | zielte auf einen Satz der Glockentafel, den es so nicht mehr gibt | derselbe Gegenstand, der neue Wortlaut |
| **339**, **340** | zielten auf die feste Höhe der Listen | sie zielen auf den Deckel und auf `min-height: 0` |
| **348**, **349** | zielten auf die Zeitangaben in der Medienabfrage | sie zielen auf dieselbe Regel, jetzt global |

### Der Lauf — 31. August 2026, alle fünfzehn in vier Nebenspuren

**15 gefahren · 0 STUMM · rund 25 Minuten** *(zweiter Lauf, gegen den
endgültigen Kopf; der erste hatte drei stumme aufgedeckt — siehe oben).*
*Jeder Rückbau ist ein voller Prüflauf in einer eigenen Kopie aus
`git archive HEAD`; der Arbeitsbaum wird nicht angefasst.* **Die Zeile „Jeder
Suchtext kommt in seiner Datei genau einmal vor" wird bei JEDEM gefahrenen
Rückbau rot** — sein Suchtext ist ja gerade ersetzt worden; sie zählt deshalb
nicht als Wirkung.

**GEFAHREN WURDEN DIE FÜNFZEHN NEUEN**, nicht die ganze Liste. *Der volle Lauf
über alle 368 steht weiter aus (Abschnitt 14).*

| # | Rückbau | Namentlich rot |
|---|---|---|
| 354 | Das Raster der Sitzungszeile bekommt seine dritte Spalte zurueck | „Und das Raster traegt nur noch zwei Spalten" |
| 355 | Die Liste fordert wieder so viele Zeilen, wie sie hat | „.manage-list fordert hoechstens zwoelf Zeilen -- in rem und nicht in Pixeln" |
| 356 | Das Sicherheitsprotokoll fordert wieder alle seine Zeilen | „.prot-liste fordert hoechstens zwoelf Zeilen -- in rem und nicht in Pixeln" |
| 357 | Auf dem Telefon deckelt nichts mehr am Fenster | „Auf dem Telefon bleibt die Deckelung am Fenster haengen" |
| 358 | Die beiden letzten Reihen des Mailversands teilen wieder gleich | „ALS WER und TUN geben der Sache ein Drittel und dem Satz zwei" |
| 359 | Der Satz sitzt wieder an der Oberkante seines Feldes | „Und der Satz daneben sitzt an der Grundlinie seines Feldes" |
| 360 | Auf dem Telefon bleibt der Satz an der Grundlinie haengen | „Auf dem Telefon steht der Satz wieder oben an seiner Sache" |
| 361 | Die Absenderadresse faellt aus ihrer Reihe | 4 Prüfungen, darunter „Sie traegt fuenf Reihen" (2 Gruppen) |
| 362 | Die beiden Knoepfe fallen aus ihrer Reihe | „Sie traegt fuenf Reihen" |
| 363 | Die Begruendung zum fehlenden Adressfeld steht wieder in der Karte | „Die Begruendung zum fehlenden Adressfeld steht nicht mehr in der Karte" |
| 364 | Die Klammer steht wieder auch bei einer einzigen Stimme | „Bei einer einzigen Stimme steht dort keine Klammer", „Und in keiner Zeile steht eine Klammer um eine Eins" |
| 365 | Die Glocke meldet wieder die eigenen Kommentare | 6 Prüfungen, darunter „Der eigene zaehlt seit 0.17.2 wieder nicht mit" (2 Gruppen) |
| 366 | Die Glocke meldet wieder die eigenen Bewertungen | „Und die eigene Bewertung zaehlt ebenso wenig mit" |
| 367 | Die Tafel verspricht wieder die eigenen Beitraege | „Sie sagt, dass sie die Beitraege der ANDEREN meldet", „Und sie verspricht nicht mehr die eigenen mit" |
| 368 | Die README erzaehlt wieder, seit wann etwas gilt | „Und keine andere Nummer steht mehr darin", „Es sind genau sechs Nennungen und keine mehr" |

*Die Zeile „Jeder Suchtext kommt in seiner Datei genau einmal vor" steht in
jeder dieser Reihen mit und ist der Vollständigkeit halber weggelassen.*

**365 IST DIE SCHÄRFSTE ZEILE DER RUNDE.** Er nimmt die Ausnahme aus der
Abfrage der Kommentare — und **sechs** Prüfungen werden rot, in zwei Gruppen:
nicht nur die Zahl, sondern auch der Name bei den Verfassern, die Trennung von
Kommentaren und Bewertungen und die Lage, in der derselbe Beitrag für den einen
fremd und für den anderen eigen ist. *Eine Zusage, die an sechs Stellen hängt,
ist eine, die wirklich getragen wird.*

---

## 11. Neue Stolpersteine

**242 bis 245; 241 war vergeben.** *Der volle Wortlaut steht im Projektstand,
Abschnitt 6.*

- **242 — `!=` und `IS NOT` sind in SQL nicht dasselbe, und der Unterschied
  fällt genau an den Zeilen auf, die niemandem mehr gehören.** `NULL != 1` ist
  nicht wahr, sondern NULL; ein Kommentar eines entfernten Zugangs wäre still
  aus der Glocke gefallen.
- **243 — Ein Handbuch sagt, WAS IST — nicht, seit wann.** Siebenundvierzig
  Versionsnummern in der README, und die meisten sagten nur, wann etwas
  entstanden ist. **Die Trennlinie ist nicht „keine Nummer", sondern: sie
  bleibt, wo sie eine Handlung bestimmt.**
- **244 — Eine Zusage, die eine spätere Runde umdreht, muss auch in der
  PRÜFLAGE umgedreht werden.** Sonst hält der Prüfstand die zurückgenommene
  Entscheidung am Leben — **grün und trotzdem falsch.**
- **245 — Wer ein Papier kürzt, muss zuerst fragen, für WEN die Zahlen darin
  stehen — nicht, ob sie stimmen.** Unter jedem Changelog-Eintrag standen
  `F_ROUTEN`, die Zahl der Migrationsblöcke und die Kartenzahl: jede Zahl
  richtig, jede aus dem Bauen, und keine beantwortet die Frage, die ein
  Betreiber vor dem Einspielen hat. **Die richtige Hälfte hat die falsche
  gedeckt** — sie stand in derselben Zeile wie die Sicherungspflicht.

---

## 12. Die Zahlen

| | vorher (0.17.1) | nachher (0.17.2) |
|---|---:|---:|
| Prüfungen | 4715 | **4747** |
| Rückbauten in `gegenprobe.js` | 353 | **368** |
| Stolpersteine | 241 | **244** |
| Fingerprint | `1775fcd4` | **`edbd76b6`** |
| Versionsnummern in der README | 47 | **6** |
| Karten im Systembereich | 18 in 5 Abschnitten | **unverändert** |
| `F_ROUTEN` | 69 | **unverändert** |
| Persönliche Schlüssel | 8 | **unverändert** |
| Migrationsblöcke | 7 | **unverändert** |
| Austauschformat | 11 | **unverändert** |
| Abhängigkeiten | 5 + 1 dev | **unverändert** |

---

## 13. Was ausdrücklich nicht passiert ist

- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.** *Die
  Durchsicht kam zu keinem anderen Ergebnis.*
- **Keine neue Abhängigkeit** — auch nicht für den Prüfstand.
- **Keine neue Route.** `F_ROUTEN` bleibt bei **69**. **Nachgezählt, nicht
  angenommen.**
- **Keine neue Karte, keine Karte weniger, keine Karte wechselt ihre Rolle.**
- **Keine Zeile in der `.env`.**
- **Keine Tags** — weder für diese Version noch für die ausstehenden.
- **Keine Ellipse mit Überfahren an der Anmeldezeile.** *Der Auftrag nannte sie
  als Möglichkeit; sie ist ausdrücklich verworfen worden.*
- **Kein Lesestand je Meldung an der Glocke.** *Die Grenze der schlanken Fassung
  gilt unverändert.*
- **Das Konzeptpapier und das Videopapier sind nicht angefasst.**

---

## 14. Offen geblieben

**DIESE RUNDE IST IM FELD NOCH NICHT BESTÄTIGT.** *Der Fingerprint steht —
`edbd76b6` —, die Instanz hat ihn noch nicht gemeldet.* **Nach dem Einspielen
gehört ein Blick in Systembereich → Datenbank → Kennzahlen:** steht dort ein
anderer Wert, liegt auf dem Wirt eine Datei, die kein Commit trägt
(Stolperstein 158).

> **EINE PRÜFUNG IST BEIM SCHREIBEN DIESER PAPIERE EINMAL ROT GEWESEN, und das
> gehört hierher.** *„Eine Sekunde vor Ablauf trägt der Link noch"* aus der
> Gruppe „Der Token: die sieben Tage an beiden Seiten" setzt den Ablauf auf
> `+1 seconds` und ruft dann. **Auf einer Maschine, die nebenher fünfzehn
> Gegenproben fährt, reicht diese eine Sekunde nicht**, und die Prüfung war rot,
> ohne dass an ihr etwas falsch wäre. *Allein gefahren ist sie grün; der
> vollständige Lauf auf ruhiger Maschine ebenso — 4747 von 4747.* **Die Zeile
> ist damit eine Zeitprobe mit einem zu engen Fenster**, und sie steht hier,
> damit sie beim nächsten Mal nicht wie ein neuer Fehler aussieht. *Angefasst
> ist sie nicht: das gehört in eine Runde, die sich das vornimmt, und nicht in
> eine, die gerade etwas anderes baut.*

### Die fünf Handgriffe, die diese Runde im Feld belegen

1. **Der Abschnitt „Bestand" auf einem breiten Schirm.** Die Tagliste deckelt
   bei **zwölf** Zeilen und rollt; **steht daneben eine höhere Kachel
   („Vokabular"), wächst sie mit ihr**, und „Kategorien" mit zwei Einträgen
   bleibt zwei Zeilen hoch. *Das ist der eigentliche Punkt und in jsdom nicht zu
   sehen.*
2. **Die Karte „Meine Sitzungen" auf dem Telefon.** Der Name steht ganz da,
   darunter rechtsbündig die beiden Zeiten.
3. **Die Karte „Mailversand".** Der GMX-Satz steht **neben** der
   Absenderadresse, der Testmail-Satz **neben** den beiden Knöpfen, und die
   Begründung zum fehlenden Adressfeld steht **nicht mehr** da.
4. **Ein Eintrag, den genau einer bewertet hat.** Hinter dem Schnitt steht
   **keine Klammer**; beim Überfahren nennt der Klartext trotzdem *„aus 1
   Stimme"*.
5. **Die Glocke.** Einen eigenen Kommentar schreiben, neu laden — **die Glocke
   bleibt still.** *Erst ein fremder Beitrag bringt den Punkt zurück.*

### Was aus den Runden davor weiterhin aussteht

- **Die drei Handgriffe zu 0.17.1** (Kachel „Zugang" als gewöhnlicher Benutzer,
  das Video im Vollbild, das Lesezeichen auf `#/system/anlage`).
- **Die drei Handgriffe zu 0.17.0** (Kriterienliste bei einem einzigen Zugang,
  Glockentafel, Versionszeile auf dem Telefon).
- **Der volle Gegenprobenlauf** über alle 368 Rückbauten — bei rund fünfeinhalb
  Minuten je Lauf etwa vierunddreißig Stunden, in vier Nebenspuren rund neun.
- **Die Migrationsblöcke 0.14.0 und 0.16.0** am echten Bestand.

*Alles Weitere steht im Projektstand, Abschnitt 8.*
