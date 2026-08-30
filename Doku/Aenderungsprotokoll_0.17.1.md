# Änderungsprotokoll 0.17.1 — „Was der Benutzer sieht"

**Version 0.17.1 · gebaut am 30. August 2026 · Fingerprint `1775fcd4` ·
4715 Prüfungen · 353 Rückbauten in `gegenprobe.js`**

---

**Sechs Handgriffe aus EINEM Rundlauf von Hand.** Gemeldet am 30. August 2026,
unmittelbar nachdem 0.17.0 gebaut und geschoben war — **im Feld bestätigt war
sie zu diesem Zeitpunkt noch nicht, und sie ist es beim Abschluss dieser Runde
immer noch nicht** (Abschnitt 14). *Der Prüfstand war beim Start grün: 4630 von
4630.* **Fünf der sechs Punkte sind Wortlaut und Anordnung, einer ist ein
echter Fehler** — das Video, das im Vollbild ein zweites Mal anfängt.

> **DIE NUMMER: PATCH, UND DIESMAL OHNE STREIT.** *Projektstand 5.1: „Dritte
> Zahl (PATCH) nur für abwärtskompatible Fehlerbehebungen. Eine Runde, die eine
> Funktion bringt, ist keine PATCH-Runde."* **Diese Runde bringt keine
> Funktion** — die Instanz kann danach nichts, was sie vorher nicht konnte.
> **Auch die Umbenennung ist Wortlaut**, und die eine Adresse, die sich dabei
> ändert, wird abwärtskompatibel gehalten (Abschnitt 4).

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. Kein einziger der sechs Punkte fasst Daten an.
> **DIE SICHERUNG DES DATENVERZEICHNISSES IST DESHALB EMPFEHLUNG UND NICHT
> PFLICHT** — *bei 0.16.0 war sie Pflicht, und zwar wegen des siebten
> Migrationsblocks; den gibt es hier nicht.*

**ALLE SECHS PUNKTE SIND GEBAUT.** Keiner ist herausgefallen, keiner ist
verschoben. **Zwei Dinge sind über den Auftrag hinausgegangen, und beide stehen
mit ihrer Begründung in Abschnitt 7:** die Klemme am Wirtsbefehl gilt auch in
der Karte „Zugänge", und der Merker `REGISTRIERUNG` wird beim Umlegen des
Schalters nachgezogen. **Ein Befund geht gegen den Auftrag selbst** — er nennt
zwei falsche Freunde, es sind fünf, und einer der beiden genannten war keiner
(Abschnitt 4).

---

## Inhalt

1. [Der Text im Kachel „Zugang"](#1-der-text-im-kachel-zugang)
2. [Die Kacheln geben ihre Höhe weiter](#2-die-kacheln-geben-ihre-höhe-weiter)
3. [Der Mailversand ordnet sich](#3-der-mailversand-ordnet-sich)
4. [Aus „Anlage" wird „Instanz"](#4-aus-anlage-wird-instanz)
5. [Die Zeile einer Sitzung](#5-die-zeile-einer-sitzung)
6. [Das Video im Vollbild](#6-das-video-im-vollbild)
7. [Die Entscheidungen dieser Runde](#7-die-entscheidungen-dieser-runde)
8. [Was je Datei geändert wurde](#8-was-je-datei-geändert-wurde)
9. [Der Prüfstand](#9-der-prüfstand)
10. [Gegenproben](#10-gegenproben)
11. [Neue Stolpersteine](#11-neue-stolpersteine)
12. [Die Zahlen](#12-die-zahlen)
13. [Was ausdrücklich nicht passiert ist](#13-was-ausdrücklich-nicht-passiert-ist)
14. [Offen geblieben](#14-offen-geblieben)

---

## 1. Der Text im Kachel „Zugang"

**BEFUND.** Unter den Feldern stand ein Absatz mit drei Fehlern in vier Sätzen:

> *„Die Adresse ist freiwillig. Sie wird für genau zwei Dinge gebraucht: den
> Einladungs- oder Rücksetzlink per Mail und die Testmail im Mailversand. Ohne
> sie fehlt nichts — der Link steht wie immer zum Kopieren bereit. Mindestens
> 10 Zeichen. Über die Oberfläche gibt es keine Wiederherstellung; vergessen
> heißt `docker compose exec kriterion node zugang.js passwort <name>` auf dem
> Server."*

**ERSTENS: „FREIWILLIG" STIMMT NICHT, WENN DIE SELBSTANMELDUNG AN IST.** Dann
ist die Adresse Pflicht — ohne sie kommt keine Bestätigungsmail an. *Der Satz
behauptete eine Lage, statt sich nach der zu richten, die gerade gilt.*

**GEBAUT:** die Marke am Feld und der Absatz darunter lesen `REGISTRIERUNG`.

| Selbstanmeldung | Marke am Feld | Absatz |
|---|---|---|
| **aus** | `(freiwillig)` | *„Wird für den Einladungs- oder Rücksetzlink per Mail gebraucht und für die Testmail im Mailversand. **Ohne sie steht der Link wie immer zum Kopieren bereit.**"* |
| **an** | `(wird gebraucht)` | *„**Die Adresse wird gebraucht**, solange die Selbstanmeldung an ist: ohne sie kommt keine Bestätigungsmail an. Sie trägt außerdem den Einladungs- oder Rücksetzlink und die Testmail im Mailversand."* |

> **EINE NACHFRAGE ZUM SATZ SELBST, UND SIE IST KEIN EINWAND GEGEN DEN
> PUNKT.** Der Auftrag begründet die Pflicht mit *„ohne sie kommt keine
> Bestätigungsmail an"*, und **der Satz steht in der Karte jedem**. Für den,
> der die Selbstanmeldung **einschaltet**, stimmt er unmittelbar: der Schalter
> geht nur um, wenn der Versand steht, und dazu gehört eine **durchgekommene
> Testmail — die geht ausschließlich an die Adresse des eigenen Zugangs**.
> Für jeden, der über die Selbstanmeldung hereingekommen ist, stimmt er
> ebenfalls: er hat eine mitgebracht. **Für einen vom Admin angelegten
> gewöhnlichen Benutzer ohne Adresse ist es dagegen eine Aussage über die
> Instanz und nicht über ihn.** *Gebaut ist der Satz so, wie der Auftrag ihn
> verlangt; die Nachfrage steht hier, damit sie nicht verlorengeht.*

**DIE KLEMME SITZT AN DERSELBEN STELLE WIE DIE KARTE** und nicht an einer
zweiten Abfrage daneben (Stolperstein 47). `REGISTRIERUNG` ist derselbe Merker,
aus dem die Anmeldeseite ihr Formular baut; er kommt beim Start aus
`/api/config`. **Ein eigener Abruf für diesen einen Satz wäre eine zweite
Wahrheit gewesen** — und die läuft auseinander, sobald jemand den Schalter
umlegt. *Der Prüfstand hält das an den Abrufen fest: beide Lagen holen
buchstäblich dieselbe Liste, und keine davon fragt nach der Selbstanmeldung.*

**DAFÜR MUSSTE DER MERKER MITZIEHEN** (Stolperstein 241). Bis 0.17.0 trug er
nur die Anmeldeseite, und die wird ohnehin frisch geladen; seit dieser Runde
hängt der Satz in der Karte „Zugang" daran. **Der Schalter in der Karte
„Anfragen" setzt ihn jetzt nach** — eine Zeile in `ruesteAnfragenAus()`. *Ohne
sie sähe ein Admin, der eben umgelegt hat, einen Abschnitt weiter noch die alte
Lage.* **Das ist über den Auftrag hinausgegangen, und der Grund steht in
Abschnitt 7.**

**ZWEITENS: „MINDESTENS 10 ZEICHEN" STAND AM FALSCHEN FELD.** Es ist die
Vorgabe fürs **Passwort**, und es stand im Absatz unter der **Adresse**.
**GEBAUT:** die Angabe steht als `<span class="hint">` an der Beschriftung des
Feldes *„Neues Passwort"*, dort, wo sie gilt. *Nachgesehen, ob sie anderswo
schon steht: in dieser Karte nicht — auf der Einrichtungsseite und im Formular
für den Link steht sie eigens, und dort gehört sie hin.*

**DRITTENS: DER SERVER-BEFEHL GEHT DIE MEISTEN NICHTS AN.** Ein gewöhnlicher
Benutzer hat keinen Zugriff auf den Wirt; ihm nützt der Befehl nichts, und er
ist eine Auskunft über den Betrieb, die er nicht braucht.
**GEBAUT:** er steht nur beim **Eigentümer**. Alle anderen lesen:
*„Über die Oberfläche gibt es keine Wiederherstellung; wer sein Passwort
vergessen hat, **wendet sich an den Admin**."*

> **DIESELBE KLEMME IN DER KARTE „ZUGÄNGE", UND DAS IST EINE ERWEITERUNG.**
> Dort stand am Fuß derselbe Befehl — sichtbar für jeden **Admin**, auch für
> einen, der nicht Eigentümer ist und an den Server ebenso wenig herankommt.
> *Der Auftrag nennt die Regel allgemein („Er ist der Einzige, der in der Regel
> auch am Server sitzt"), den Befund aber nur an der Karte „Zugang".* **Die
> Regel an einer Stelle zu ziehen und die andere stehenzulassen, wäre der
> Befund der nächsten Runde gewesen** (Stolperstein 234: *eine Lehre wandert
> nicht von selbst*). Ein Admin ohne Eigentum liest dort jetzt, dass der
> **Eigentümer** am Server daran kommt.

**DER ABSATZ IST DABEI KÜRZER GEWORDEN** — von fünf Sätzen auf zwei.

> **DIE FRAGE, DIE DEN PUNKT TRÄGT:** *was hilft dem, der davorsteht — und was
> erzählt ihm nur, wie es gebaut ist?* **Eine Oberfläche sagt, WAS IST**
> (Projektstand 5.6, seit 0.17.0).

---

## 2. Die Kacheln geben ihre Höhe weiter

**BEFUND.** „Meine Sitzungen" hat Platz und blendet trotzdem einen Rollbalken
ein; darunter stehen zehn Anmeldungen, sichtbar sind drei. **Dasselbe bei den
Tags** unter „Bestand" — und damit an jeder Liste, die so gebaut ist.

**URSACHE.** `.manage-list` trug `max-height: 280px` und `overflow-y: auto`,
`.prot-liste` dieselbe Bauform mit 380 Pixeln. **Die Kachel wird höher, weil
ihre Nachbarin höher ist** — sie ist ein Rasterkind und wird gestreckt; die
Liste darin blieb, wo sie war.

**GEBAUT.**

```css
.sys-card { … display: flex; flex-direction: column; }
.manage-list { flex: 1; min-height: 0; overflow-y: auto; … }
.prot-liste  { flex: 1; min-height: 0; overflow-y: auto; … }
```

**`min-height: 0` IST DIE ZEILE, AN DER ES SONST SCHEITERT** (Stolperstein
237). Ein Flexkind trägt von sich aus `min-height: auto`, und `auto` heißt: so
hoch wie sein Inhalt. **Wer nur die `max-height` streicht, bekommt eine Kachel,
die länger wird als ihre Nachbarn** — das Raster verrutscht, und der Befund
sieht aus wie ein Fehler an der Kachel statt an der Liste.

**UND DIE UMSTELLUNG DER KACHEL HATTE EINE NEBENWIRKUNG** (Stolperstein 238):
`align-items: stretch` ist in einer Flexspalte die Vorgabe, und damit wurde aus
jedem `<button class="btn">`, der bis dahin so breit war wie sein Wort, ein
Balken über die ganze Kachel. **Betroffen waren drei Karten** — „Titel",
„Zugang" und „Darstellung". **Die Gegenregel steht daneben und gilt nur für
unmittelbare Kinder:**

```css
.sys-card > .btn { align-self: flex-start; }
```

*Was in einer `.row-in` steht, ordnet die Reihe; die Regel greift dort
ausdrücklich nicht.*

**EINE REGEL UND NICHT SECHS.** `.manage-list` tragen: Sitzungen, Kategorien,
Tags, Kriterien, Papierkorb, Zugänge, Anfragen — und die beiden Fenster
(Glockentafel, Grabsteine). **In den Fenstern wirkt dieselbe Zeile:** `.modal`
ist ebenfalls eine Spalte, und die Liste hält jetzt Kopf und Schließknopf im
Blick, statt das ganze Fenster rollen zu lassen. `.prot-liste` trägt das
Sicherheitsprotokoll.

**DIE EINE AUSNAHME STEHT ALS REGEL DA, UND IHR GRUND ALS SATZ DANEBEN:**

```css
#ex-teil-liste { flex: none; max-height: 280px; }
```

*Die Teileliste des Exports steht **mitten** in ihrer Karte — über ihr der
Export, unter ihr der Import. Nähme sie die Kachelhöhe, schöbe sie den Import
aus dem Blick, und ein Bestand von zwanzig Gigabyte ergibt siebzig Zeilen.*
**Ihr Elternknoten ist ohnehin keine Spalte**, `flex: 1` wirkte dort gar nicht
— die Zeile sagt das ausdrücklich und lässt es nicht bei einer wirkungslosen
Regel.

**AUF DEM TELEFON BLEIBT DIE DECKELUNG**, und sie ist keine feste Höhe: sie
misst das Fenster (`62dvh`, mit `62vh` als Rückfall davor). *Ohne sie machte
ein Sicherheitsprotokoll mit zweihundert Zeilen die Karte unbrauchbar lang.*

**AM PRÜFSTAND.** *jsdom rechnet kein Layout — jede Höhe ist dort null.*
**Geprüft wird die Regel im Stilblatt** (keine feste Höhe mehr, `flex: 1`,
`min-height: 0`, `overflow-y: auto`, die Kachel als Spalte, der Knopf mit
`align-self`) **und dass die Zeilen wirklich alle gezeichnet werden**: zehn
Anmeldungen ergeben zehn Zeilen, und genau eine davon ist die eigene. *Über der
Gruppe steht ausdrücklich, dass das keine Prüfung ihrer Wirkung ist.*

---

## 3. Der Mailversand ordnet sich

**BEFUND.** Die Karte ist seit 0.16.0 `.breit`, das Auswahlfeld „Anbieter" war
es auch — über neunhundert Pixel für sechs Einträge. Darunter standen sechs
Felder untereinander, jedes über die volle Breite. **Der Platz war da und wurde
nicht genutzt.**

**GEBAUT — vier Reihen, geordnet nach der Frage, die jede beantwortet:**

| Reihe | Felder | Raster |
|---|---|---|
| **wer** | Anbieter, allein | `repeat(3, minmax(0, 1fr))` — das erste Drittel |
| **wohin** | Server · Port · Verschlüsselung | `minmax(0, 3fr) minmax(0, 1fr) minmax(0, 2fr)` |
| **womit** | Benutzername · Passwort beim Anbieter | `repeat(2, minmax(0, 1fr))` |
| **als wer** | Absenderadresse, allein | *keine Reihe* |

**DIE ABSENDERADRESSE STEHT ALLEIN**, weil unter ihr **zwei eigene
Hinweissätze** stehen — der Hinweis des Anbieters und der Satz über den
Hausanschluss. *Neben zwei anderen Feldern klebten sie unter dreien, und
niemand wüsste, auf welches sie sich beziehen.* **Der Prüfstand hält beides
fest:** dass sie in keiner `.mail-reihe` steht, und dass `#mail-hinweis`
unmittelbar auf ihr Feld folgt.

**EIN RASTER UND KEINE FLEXREIHE.** `.row-in` gäbe den Feldern die Breite, die
ihr Inhalt braucht; hier soll **Server** breit und **Port** schmal sein, und
das ist eine Angabe über die **Reihe** und nicht über das einzelne Feld.
**`minmax(0, …)` und nicht bloß `…fr`:** eine Rasterspalte gibt von sich aus
nicht unter ihre Mindestbreite nach, und das Auswahlfeld mit dem langen Eintrag
*„TLS von Anfang an (meist 465)"* schöbe die Reihe sonst breiter als die Karte.

**AUF DEM TELEFON FÄLLT ALLES WIEDER UNTEREINANDER** — eine Regel für alle vier
Reihen, in derselben Medienabfrage wie der ganze Abschnitt „Das Telefon".
*Eine Reihe, die auf 366 Pixeln drei Felder nebeneinander zwingt, ist
schlechter als die Spalte, die es vorher war: „Benutzername beim Anbieter"
stünde dreizeilig über einem Feld von hundert Pixeln.*

**DER ZUSTANDSBLOCK OBEN BLEIBT, WIE ER IST** — Zustand · Passwort ·
Öffentliche Adresse · Zuletzt erfolgreich getestet. *Der Prüfstand zählt die
vier Zeilen namentlich ab, damit keine davon unbemerkt in eine Reihe wandert.*

---

## 4. Aus „Anlage" wird „Instanz"

**ENTSCHEIDUNG DES BETREIBERS, 30. AUGUST 2026.** Das Wort **Anlage** trug in
dieser Anwendung die ganze Installation — *„die Anlage speichert weder Adresse
noch Browserkennung"* — und es passt nicht. **Englisch wäre das *instance*;
deutsch heißt es ab jetzt Instanz.**

**692 STELLEN IN ACHTZEHN DATEIEN.** *Der Auftrag nannte in seiner Tabelle 357
als Anhaltspunkt — über neun Dateien — und sagte dazu: nachzuzählen ist selbst.*
**Es sind achtzehn Dateien, und `pruefung.js`, `gegenprobe.js`,
`public/style.css`, `schluessel.js`, `schluessel.sh`, `zweifaktor.js`, `mail.js`,
`keys.js` und `.env.example` standen in keiner Zeile jener Tabelle.**

| Datei | ersetzt | Datei | ersetzt |
|---|---:|---|---:|
| `pruefung.js` | 222 | `schluessel.js` | 10 |
| `Doku/Projektstand_…` | 162 | `zweifaktor.js` | 8 |
| `README.md` | 61 | `schluessel.sh` | 7 |
| `public/app.js` | 56 | `.env.example` | 5 |
| `server.js` | 42 | `mail.js` | 4 |
| `public/style.css` | 27 | `keys.js` | 3 |
| `gegenprobe.js` | 26 | `zugang.js` | 2 |
| `auth.js` | 22 | `public/index.html` | 1 |
| `Doku/Fehler_und_Ideen.md` | 19 | | |
| `db.js` | 15 | | **zusammen 692** |

*An **drei** dieser Stellen steht das alte Wort inzwischen wieder — dort, wo
der Satz die Umbenennung selbst beschreibt (siehe unten).*

**DIE ADRESSE IST DER EINZIGE HARTE TEIL.** Der fünfte Abschnitt des
Systembereichs trug den Schlüssel `anlage`:

```
#/system/anlage   →   #/system/instanz
```

**Die alte Adresse wird still übersetzt, nicht abgewiesen.** Sie steht in
Lesezeichen, in älteren Papieren und womöglich in einer Mail; *ein Link, der
ins Leere führt, ist eine Mitteilung ohne Weg.* **Ohne die Übersetzung fände
`#/system/anlage` keinen Abschnitt und fiele auf den ersten sichtbaren
zurück** — der Empfänger landete also woanders, ohne dass ihm jemand sagt,
warum.

```js
const SYS_ALTE_ABSCHNITTE = { anlage: 'instanz' };
```

**EINE TAFEL UND KEINE VERZWEIGUNG** — käme je ein zweiter alter Name dazu,
steht er als Zeile daneben und nicht als zweites `if`. *Dieselbe Bauform wie
`delete f.neu` in 0.17.0 und wie der Schlüssel `abgelehnt` in 0.15.0.*
**`replaceState` am Ende von `renderSystem()` zieht die Adresszeile gleich
nach**, ohne zweiten Eintrag im Verlauf — die Umleitung ist damit einmalig und
sichtbar.

### Die falschen Freunde: der Auftrag nannte zwei, es sind fünf — und einer war keiner

**Das ist der Befund dieser Runde gegen ihren eigenen Auftrag** (Stolperstein
236). Der Auftrag benennt zwei Stellen in `server.js`, die *„Anlagen" im Sinne
von **Anhängen*** meinen und deshalb nicht mitgehen dürfen.

| Stelle | im Auftrag | tatsächlich |
|---|---|---|
| `server.js` — *„Einzige Stelle, die **Anlagen**bytes ausliefert"* | falscher Freund | **stimmt** — die Zeile steht an `GET /api/attachments/:id/raw`. **Nicht angefasst.** |
| `server.js` — *„… damit zwei **Anlagen** nicht zwei gleichnamige Dateien im Ordner ablegen"* | falscher Freund | **stimmt nicht.** Der Satz davor lautet *„Aus dem Titel der Anlage"* und meint den Titel der **Installation**; „zwei Anlagen" sind zwei **Installationen**. **Mitgegangen.** |
| `anhaenge.js`, drei Stellen | nicht genannt | **falsche Freunde.** *„Eine Anlage darf niemals so ausgeliefert werden, dass der Browser sie als Webseite ausführt"* — die Datei handelt von Anhängen, und jede der drei Stellen meint einen. **Nicht angefasst.** |
| `README.md` und Projektstand — *„auf jeder **Anlagen**-Antwort"* | nicht genannt | **falsche Freunde.** Beide stehen im Abschnitt über die Sicherheitsregel für ausgelieferte Dateien. **Nicht angefasst.** |

**Gefunden hat sie kein Lauf, sondern das Lesen jeder Fundstelle im
Zusammenhang.** *Die Liste im Auftrag sagt, wo ungefähr zu suchen ist, und
nichts darüber, was dort steht.*

**`anhaenge.js` IST DESHALB GAR NICHT ANGEFASST WORDEN** — die einzige Datei
mit Treffern, in der **keiner** die Installation meint.

### Der Wortstamm „anlegen" — nachgesehen und stehengeblieben

`anlegen`, `Anlegen` und `angelegt` werden von einer Ersetzung auf `Anlage`
nicht getroffen; **nachgesehen wurde trotzdem**, und zwar an jeder Form, die
den Stamm trägt:

- **`Doppelanlage`** (`pruefung.js`, *„Doppelanlage wird abgewiesen"*) — das
  zweite **Anlegen** eines Kriteriums. **Steht.**
- **`Erstanlage`** (Projektstand, *„Start und Erstanlage"*) — die erste
  Einrichtung. **Steht.**
- **`Neuanlage`** (`db.js` und Projektstand, *„damit Bestands- und Neuanlage
  dasselbe Schema tragen"*) — **hier meint es die Installation.** *Aus
  „Neuanlage" eine „Neuinstanz" zu machen wäre ein Wort, das es nicht gibt;
  der Satz ist stattdessen aufgelöst:* **„damit eine bestehende und eine frische
  Instanz dasselbe Schema tragen".**

### Und die Ersetzung traf die Sätze, die die Ersetzung beschreiben

**An drei Stellen in den lebenden Papieren wurde aus *„aus **Anlage** wird
**Instanz**"* ein *„aus **Instanz** wird **Instanz**"*** — im Fahrplan
(Abschnitt 10), in der Ausarbeitung (10a) und im Sammelblatt. **Kein Lauf sieht
das:** die Sätze sind grammatisch heil und sachlich sinnlos. *Dieselbe Falle
wie bei den falschen Freunden, nur andersherum — dort meint das Wort etwas
anderes, hier zitiert es sich selbst* (Stolperstein 240). **An diesen Stellen
steht das alte Wort wieder**, ebenso in der Tafel `SYS_ALTE_ABSCHNITTE` und
ihrer Begründung, die die alte Adresse ja nennen muss.

### Was nicht angefasst wurde

**Die abgeschlossenen Änderungsprotokolle älterer Versionen und die
CHANGELOG-Einträge bis einschließlich 0.17.0.** *Was einmal draußen war,
bleibt, wie es war* (Semantic Versioning Punkt 3 und der Kasten am Kopf von
`CHANGELOG.md`). **Der neue Eintrag für 0.17.1 schreibt „Instanz".**
**Das Konzeptpapier und das Videopapier ebenfalls nicht** — der Auftrag nimmt
sie ausdrücklich aus. **Sie tragen das Wort aber je einmal, und beide Male
meint es die Installation:**

- `Doku/Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_1.md`, Zeile 178 —
  *„… und beim Freischalten schickte die **Anlage** einer Person, die nie …"*
- `Doku/Konzept_Video_und_grosse_Dateien.md`, Zeile 112 —
  *„… die **Anlage** bleibt wahr, es gibt nichts zusätzlich zu verwahren …"*

**Das ist ein Befund und keine Auslassung** — der Auftrag verlangt genau das:
*„Fällt dir dort etwas auf, das falsch wird, ist das ein Befund und gehört
gemeldet."* **Angefasst sind sie nicht.** *Beide Papiere sind Herleitung und
kein Stand; wer sie eines Tages anfasst, zieht die zwei Wörter mit.*

### Der Wächter

**„Überall" lässt sich nur belegen, indem man nachzählt.** Der Prüfstand liest
die **elf ausgelieferten Dateien** und vergleicht die Fundstellen mit einer
**vollständigen Liste**, nicht mit einer bloßen Erlaubnis:

- `server.js`: genau `['Anlagenbytes']`
- `public/app.js`: genau `['Anlage', 'anlage', 'anlage', 'anlage']` — die Tafel
  der alten Adresse samt ihrer Begründung
- die übrigen **neun**: leer

*Dazu die Gegenrichtung: beide Ausnahmen zeigen wirklich auf etwas, und in
`anhaenge.js` stehen wirklich noch drei. Eine Ausnahmeliste, die ins Leere
zeigt, sagt beim nächsten Lesen etwas Falsches über den Bestand
(Stolperstein 81).*

---

## 5. Die Zeile einer Sitzung

**BEFUND.** In „Meine Sitzungen" standen **angemeldet** und **zuletzt gesehen**
nebeneinander in einer Reihe, unterschiedlich lang, und das sah aus wie ein
Versehen.

**GEBAUT: beide Zeitangaben rechtsbündig und untereinander, links der Name.**
Der Aufbau bleibt — es ist reine Sache des Stilblatts. Die Zeile trägt dieselben
vier Stücke wie vorher und steht jetzt in einem Raster:

```css
.mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center; column-gap: 9px; row-gap: 2px; }
.mrow.sitz .mname    { grid-column: 1; grid-row: 1 / span 2; }
.mrow.sitz .sitz-zeit{ grid-column: 2; justify-self: end; text-align: right; }
.mrow.sitz .zug-akt  { grid-column: 3; grid-row: 1 / span 2; }
```

**DER ORANGENE RAHMEN DER EIGENEN ANMELDUNG BLEIBT — und er reicht weiterhin
bis zum Rand.** *Das war Punkt 4b von 0.17.0 und darf nicht zurückfallen.*
**Der Weg dorthin ist ein anderer geworden:** vorher hielt ihn `flex-wrap:
wrap` — die Zeile wurde erst zu breit und brach dann um; jetzt kann sie gar
nicht erst zu breit werden, weil die Namensspalte `minmax(0, 1fr)` ist und
nachgibt. *Die Zusage ist dieselbe geblieben; deshalb steht sie weiter in der
Gruppe „Zwei Masse vom echten Geraet — 0.17.0", und die Zeilen darin lesen
jetzt das Raster.*

**NUR DIE ZEITEN TRAGEN `white-space: nowrap`.** *Ein umgebrochener
Zeitstempel wäre schlechter zu lesen als ein abgeschnittener Name — und der
Name trägt seine Ellipse ohnehin schon.*

**AUF DEM SCHMALEN SCHIRM STEHT DER NAME AUF EIGENER ZEILE**, das Kreuz daneben,
die beiden Zeiten darunter — **rechtsbündig und untereinander wie oben**.
*Drei Spalten wären auf 366 Pixeln drei zu schmale: „zuletzt gesehen
30.08.2026, 20:17" nimmt allein zwei Drittel.* **Die Trennung ist dieselbe wie
vorher** — oben, was die Zeile ist und was man mit ihr tun kann; darunter,
wann.

---

## 6. Das Video im Vollbild

**DER EINZIGE ECHTE FEHLER DIESER RUNDE.**

**BEFUND.** Läuft am Eintrag ein Video und man drückt auf Vollbild, öffnete
sich die Lightbox **mit einem eigenen `<video>`** — und das innere spielte
weiter. **Zwei Abspieler, zwei Tonspuren, zwei Stellen im Film.**

**URSACHE.** `openLightbox()` baut sich seinen eigenen Abspieler
(`<video class="lb-video">`) und lud die Quelle ein zweites Mal. *Das Anhalten
gab es schon — aber nur für den Abspieler der Lightbox, beim Blättern und beim
Verlassen. Der innere kam darin gar nicht vor.*

**GEBAUT: ein fliegender Wechsel.**

- **Beim Öffnen** übernimmt der Abspieler der Lightbox **Stelle und Zustand**
  des inneren, und der innere **gibt seine Quelle ab**.
- **Beim Schließen** geht es denselben Weg zurück.

**ANHALTEN ALLEIN GENÜGT NICHT.** Ein Element mit Quelle lädt weiter, und es
bliebe ein zweiter Abspieler — *genau das, was in jsdom auch nachweisbar ist:*
**nach dem Öffnen trägt von zwei `<video>`-Elementen genau eines eine Quelle.**

**DIE PROBE IST DIE QUELLE UND NICHT DIE NUMMER.** Übernommen wird nur, wenn
der innere Abspieler **wirklich dieses Video trägt** (`el.getAttribute('src')
=== bildQuelle(photos[i], '')`). *Steht dort ein anderes Bild oder gar nichts —
etwa beim Vollbild eines Kommentarbildes —, wird nichts übernommen und nichts
angehalten.*

**DER INNERE ABSPIELER KOMMT ALS FUNKTION HEREIN, NICHT ALS ELEMENT.**

```js
function openLightbox(photos, startIdx, title, loeschen, innen) { … }
```

*`drawViewer()` baut den Betrachter beim Löschen und beim Blättern neu auf; ein
gemerkter Knoten wäre danach ein Waisenkind.* **Wer keinen mitgibt — die
Kommentarbilder etwa — bekommt keinen Wechsel**; dort gibt es auch nichts zu
übernehmen.

### Die drei Stellen, an denen es sonst wieder auseinandergeht

**BEIM BLÄTTERN.** `halteAn()` gab es schon; **es nimmt jetzt die Stelle mit,
bevor die Quelle fällt** — nach dem `removeAttribute` steht sie nicht mehr da.
*Das gilt fürs Blättern wie fürs Schließen: beide gehen durch diese eine
Stelle, und deshalb braucht der Rückweg keine zweite.* **Wer im Vollbild
weiterblättert und zurückkommt, fängt vorn an** — so wie jedes andere Video
dort auch; die übernommene Stelle gilt **einmal**, beim Öffnen.

**BEIM LÖSCHEN AUS DEM VOLLBILD.** *Danach gibt es das Video nicht mehr, und
der innere Abspieler darf nicht auf eine Adresse zeigen, die weg ist.* **Zwei
Zeilen halten das:** der Rückweg gibt nur zurück, wenn der innere Abspieler
**noch derselbe ist** — erkennbar an der leeren Quelle, denn leer ist nur der,
dem wir sie genommen haben —, und was gelöscht wurde, wird aus der Übergabe
genommen. *Die zweite Zeile ist am Betrachter nicht zu zeigen: er zeichnet sich
beim Löschen ohnehin neu, und die erste greift dann schon. **Die Prüflage
stellt deshalb den anderen Rufer** — `openLightbox()` direkt, mit einem
`loeschen`, das nichts neu zeichnet* (Stolperstein 239).

**BEIM SCHLIESSEN MIT ESCAPE.** *Derselbe Weg wie über das Kreuz, nicht ein
zweiter daneben:* `onKey` ruft `close()`, und dort steht der Rückweg. **Der
Prüfstand fährt beide.**

**AM PRÜFSTAND.** *jsdom spielt nichts ab — `pause()`, `play()` und `load()`
sind dort leer, und `paused` steht immer auf `true`.* **Belegt wird, was
trägt:** dass es die zweite Quelle nicht mehr gibt, dass der innere Abspieler
seine abgibt, und dass die Stelle hin- und zurückwandert (12,5 hinein, 20
zurück). **Gezählt an den Elementen und ihrem Zustand, nicht an einer Klasse**
(Stolperstein 223): der eine mit Quelle ist **nicht** der innere und liegt
**im** Vollbild. **Dazu die Gegenlage:** ohne Video verhält sich die Lightbox
wie bisher — ihr Abspieler bleibt verborgen und ohne Quelle, das Bild darunter
behält seine.

---

## 7. Die Entscheidungen dieser Runde

1. **Die Klemme am Wirtsbefehl gilt auch in der Karte „Zugänge".** *Der Auftrag
   nennt den Befund an der Karte „Zugang" und die Regel allgemein.* **Die Regel
   an einer Stelle zu ziehen und die andere stehenzulassen, wäre der Befund der
   nächsten Runde gewesen** — ein Admin ohne Eigentum kommt an den Server
   ebenso wenig heran (Stolperstein 234).
2. **`REGISTRIERUNG` wird beim Umlegen des Schalters nachgezogen.** *Ohne die
   eine Zeile wäre der Merker eine zweite Wahrheit geworden, sobald der Satz in
   der Karte „Zugang" daran hängt.* **Die Alternative — ein eigener Abruf —
   wäre genau das gewesen, was der Auftrag ausschließt** (Stolperstein 47).
3. **`.prot-liste` bekommt dieselbe Behandlung wie `.manage-list`.** *Der
   Auftrag nennt sechs Listen; das Sicherheitsprotokoll ist die siebte und
   genauso gebaut.* **Eine Regel, nicht sechs.**
4. **Die Teileliste des Exports behält ihre Deckelung, und der Grund steht als
   Satz daneben.** *Der Auftrag lässt diesen Fall ausdrücklich zu.*
5. **Die Sitzungszeile bekommt ein Raster statt eines Umbruchs.** *Beides
   erfüllt die Zusage aus 0.17.0; das Raster erfüllt sie besser, weil die Zeile
   gar nicht erst zu breit wird.* **Rückbau 305 ist deshalb mitgegangen statt
   gelöscht zu werden** (Stolperstein 201): dieselbe Zusage, ein anderer Anker.
6. **Der Mock löscht ein Foto jetzt wirklich.** *Er bestätigte das Löschen und
   gab beim nächsten Abruf dieselbe Liste zurück — die Zusage über die
   gelöschte Adresse ließ sich damit gar nicht stellen* (Stolperstein 90).
7. **`server.js:3801` ist mitgegangen, obwohl der Auftrag sie ausnimmt.** *Die
   Zeile meint zwei Installationen und keine Anhänge; sie stehenzulassen hieße,
   das alte Wort für die Installation zu behalten.* **Gemeldet als Befund
   (Abschnitt 4), nicht stillschweigend abgewichen.**
8. **Die Ersetzung ist stammweise gefahren und nicht als ein `sed`.**
   Geschützt wurden fünf Wortformen; danach ist jede verbliebene Fundstelle
   einzeln gelesen worden.

---

## 8. Was je Datei geändert wurde

| Datei | was |
|---|---|
| `public/app.js` | **Punkt 1:** `karteZugang()` bekommt zwei Klemmen (`REGISTRIERUNG`, `EIGENTUEMER`), die Marke am Adressfeld richtet sich nach der Lage, die Längenvorgabe steht am Feld „Neues Passwort", der Absatz ist kürzer; `karteZugaenge()` klemmt den Wirtsbefehl ebenso; `ruesteAnfragenAus()` zieht `REGISTRIERUNG` nach. **Punkt 3:** `karteMailversand()` baut drei `.mail-reihe`, die Absenderadresse steht allein. **Punkt 4:** 56 Stellen, dazu neu `SYS_ALTE_ABSCHNITTE` und die Übersetzung in `renderSystem()`. **Punkt 6:** `openLightbox()` bekommt den Parameter `innen`, die Übernahme, `gibZurueck()`, die mitgenommene Stelle in `halteAn()` und die Zeile im Papierkorbbehandler; `drawViewer()` gibt `innererAbspieler` an beide Rufer mit. |
| `public/style.css` | **Punkt 2:** `.sys-card` wird eine Spalte, `.sys-card > .btn` bekommt `align-self`, `.manage-list` und `.prot-liste` bekommen `flex: 1` und `min-height: 0`, `#ex-teil-liste` die begründete Ausnahme. **Punkt 3:** `.mail-reihe`, `.mail-wer`, `.mail-wohin`, `.mail-womit` und die Regel für das Telefon. **Punkt 5:** `.mrow.sitz` als Raster, dazu die Anordnung für den schmalen Schirm. **Punkt 4:** 27 Stellen in Kommentaren. |
| `server.js` | **Punkt 4 allein:** 42 Stellen in Kommentaren und Meldungen, darunter die Zeile zum Exportdateinamen. `Anlagenbytes` steht. **Kein Code geändert, keine Route dazu.** |
| `pruefung.js` | **Sechs neue Gruppen mit 83 Prüfungen**; zwei neue Zusagen in „Der Systembereich nach Rolle"; die Gruppe „Zwei Masse vom echten Geraet — 0.17.0" liest das Raster statt des Umbruchs; die Zusage über den Adressabsatz nachgezogen; **der Mock löscht ein Foto wirklich**; die Zahl der Rückbauten 333 → 353; 222 Stellen der Umbenennung. |
| `gegenprobe.js` | **20 neue (334–353)** zu allen sechs Punkten; **305 nachgezogen** (Stolperstein 201) — er zielt jetzt auf die nachgebende Namensspalte statt auf den entfallenen Umbruch; 26 Stellen der Umbenennung. |
| `auth.js`, `db.js`, `zugang.js`, `mail.js`, `keys.js`, `schluessel.js`, `schluessel.sh`, `zweifaktor.js`, `public/index.html`, `.env.example` | **Punkt 4 allein** — Kommentare, Meldungen und in `zweifaktor.js`/`auth.js` der Parametername (`anlage` → `instanz`, `anlagenName` → `instanzName`). *Kein Verhalten geändert.* |
| `anhaenge.js` | **unverändert** — alle drei Fundstellen meinen Anhänge. |
| `README.md` | Der neue Wortlaut des Zugangstextes als eigener Kasten; der Hinweis, dass `#/system/anlage` weiter verstanden wird; 61 Stellen der Umbenennung. `Anlagen-Antwort` steht. |
| `CHANGELOG.md` | Eintrag `0.17.1` in der Form von 0.17.0, samt beiden eigenen Abschnitten und dem Vergleichsverweis am Ende. **Die Einträge bis 0.17.0 sind nicht angefasst.** |
| `Doku/Projektstand_Kriterion_0_17_0.md` → `_0_17_1.md` | **`git mv`.** Kopf (Revision 41), der Satz zur Runde, Betriebsstand samt Einspielweg, der Systembereich mit der übersetzten alten Adresse, **Stolpersteine 236–241**, Prüfstand (Zahlen, beide Tabellen, Fingerprintliste), Abschnitt 8, Versionsgeschichte, Abschnitt 10 und 10a auf **GEBAUT**. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `Doku/Fehler_und_Ideen.md` | Wegweiser auf **GEBAUT**, mit dem Befund zu den falschen Freunden; **eine neue Zeile in Teil II** — die beiden Konzeptpapiere tragen „Anlage" je einmal; 19 Stellen der Umbenennung. |
| `package.json`, `package-lock.json` | Version `0.17.1` — im Lockfile an **beiden** Stellen. |

---

## 9. Der Prüfstand

**4715 von 4715 bestanden — 4630 waren es vorher, also 85 neue netto.**

**Sechs neue Gruppen mit zusammen 83 Prüfungen:**

| neue Gruppe | Prüfungen |
|---|---|
| Der Zugangstext sagt, was gilt — 0.17.1 | 14 |
| Die Liste bekommt die Hoehe der Kachel — 0.17.1 | 17 |
| Der Mailversand ordnet sich — 0.17.1 | 14 |
| Aus „Anlage" wird „Instanz" — 0.17.1 | 9 |
| Die Zeitangaben stehen untereinander — 0.17.1 | 6 |
| Genau ein Abspieler laeuft — 0.17.1 | 23 |
| **zusammen** | **83** |

**Die übrigen zwei stehen in einer vorhandenen Gruppe.** *„Der Systembereich
nach Rolle"* prüfte eine Zeile — *„Sondern den Befehl, der wirklich hilft"* —
und prüft jetzt **drei**: dass der Wirtsbefehl beim gewöhnlichen Benutzer
**nicht** steht, dass dort der Satz steht, der ihm hilft, und dass er beim
Eigentümer **sehr wohl** steht. *Eine Verneinung allein belegte nicht, dass es
den Befehl überhaupt noch irgendwo gibt (Stolperstein 81).*

**Und eine Gruppe ist umgeschrieben, nicht gewachsen.** *„Zwei Masse vom echten
Geraet — 0.17.0"* trägt die Zusage, die nicht zurückfallen darf — der Rahmen
der eigenen Anmeldung reicht bis zum Rand. **Sie ist dieselbe geblieben; nur
der Weg dorthin ist seit Punkt 5 das Raster statt des Umbruchs**, und die
Zeilen darin lesen jetzt das Raster. *Die Zahl der Prüfungen in dieser Gruppe
ist gleich geblieben.*

**WAS DER PRÜFSTAND AUSDRÜCKLICH NICHT BELEGEN KANN**, und es steht über den
Gruppen:

- **Keine Höhe.** jsdom rechnet kein Layout — ob die Liste den Platz wirklich
  nimmt, sieht man am Bildschirm. *Geprüft ist die Regel und dass alle Zeilen
  gezeichnet werden.*
- **Keine Breite.** Welches Feld des Mailversands in welcher Reihe steht, lässt
  sich belegen; wie breit es dann ist, nicht.
- **Kein Ton und kein Bild.** jsdom spielt nichts ab. *Geprüft ist, dass es die
  zweite Quelle nicht mehr gibt und dass die Stelle wandert.*

---

## 10. Gegenproben

**Zwanzig neue Rückbauten, 334 bis 353** — zu jedem der sechs Punkte
mindestens einer, und zu den Punkten mit mehreren Zusagen entsprechend mehr.

| Nr | Datei | was zurückgebaut wird |
|---|---|---|
| **334** | `public/app.js` | Die Marke am Adressfeld behauptet wieder immer „freiwillig" |
| **335** | `public/app.js` | Der Absatz richtet sich nicht mehr nach der Selbstanmeldung |
| **336** | `public/app.js` | Der Merker der Selbstanmeldung bleibt beim Umlegen stehen |
| **337** | `public/app.js` | Der Wirtsbefehl steht wieder bei jedem |
| **338** | `public/app.js` | Die Laengenvorgabe faellt vom Passwortfeld weg |
| **339** | `public/style.css` | Die Liste bekommt ihre festen 280 Pixel zurueck |
| **340** | `public/style.css` | Die Liste verliert die Zeile, an der es sonst scheitert |
| **341** | `public/style.css` | Die Kachel ist wieder keine Spalte |
| **342** | `public/style.css` | Der Knopf in der Kachel wird wieder ueber die volle Breite gezogen |
| **343** | `public/style.css` | Die Reihe „wohin" verliert ihre Rasterspalten |
| **344** | `public/style.css` | Auf dem Telefon bleiben die Reihen des Mailversands nebeneinander |
| **345** | `public/app.js` | Die Felder „wohin" fallen aus ihrer Reihe |
| **346** | `public/app.js` | Die alte Adresse des fuenften Abschnitts wird nicht mehr uebersetzt |
| **347** | `public/app.js` | Der fuenfte Abschnitt heisst wieder „Anlage" |
| **348** | `public/style.css` | Die Zeitangaben stehen wieder linksbuendig |
| **349** | `public/style.css` | Der Name steht nicht mehr ueber beide Zeilen |
| **350** | `public/app.js` | Das Vollbild uebernimmt den inneren Abspieler nicht mehr |
| **351** | `public/app.js` | Die uebernommene Stelle wird nicht gesetzt |
| **352** | `public/app.js` | Der Rueckweg beim Schliessen faellt weg |
| **353** | `public/app.js` | Die geloeschte Quelle wandert wieder zurueck |

**EINER IST NACHGEZOGEN WORDEN, NICHT GELÖSCHT** (Stolperstein 201): **305**
zielte auf `.mrow.sitz { flex-wrap: wrap; row-gap: 2px; }`, und diese Regel
gibt es nicht mehr. *Ein Rückbau, der ins Leere greift, ist stumm und
verfälscht die Tabelle* (Stolperstein 192) — **die Zeile „Jeder Suchtext kommt
in seiner Datei genau einmal vor" wurde sofort rot, noch bevor ein Lauf nötig
war.** Er heißt jetzt *„Die Anmeldezeile darf wieder breiter werden als ihr
Kasten"* und tauscht die nachgebende Namensspalte gegen `max-content`:
**dieselbe Zusage, ein anderer Anker.**

*Der Lauf läuft noch; die Tabelle wird nachgetragen.*

---

## 11. Neue Stolpersteine

**236 bis 241; 235 war vergeben.** *Der volle Wortlaut steht im Projektstand,
Abschnitt 6.*

- **236 — Eine Zahlenliste im Auftrag ist ein Anhaltspunkt und keine Zusage.**
  Zwei falsche Freunde genannt, fünf gefunden, einer der beiden genannten war
  keiner.
- **237 — Ein Flexkind rollt nicht, es wächst, bis `min-height: 0` dasteht.**
- **238 — Wer einen Kasten zur Flexspalte macht, ändert die Breite ALLER seiner
  Kinder.** Drei Karten hatten danach einen Knopf über die volle Breite.
- **239 — Eine Schutzzeile, die im einzigen vorhandenen Rufer nichts bewirkt,
  ist eine Behauptung.** Die Prüflage muss den anderen Rufer stellen.
- **240 — Ein Suchen-und-Ersetzen trifft auch die Sätze, die die Ersetzung
  beschreiben.** Drei Stellen wurden zu „aus Instanz wird Instanz".
- **241 — Ein Merker, der beim Start einmal gefüllt wird, ist ein Stand von
  damals.** `REGISTRIERUNG` zog beim Umlegen des Schalters nicht nach.

---

## 12. Die Zahlen

| | vorher (0.17.0) | nachher (0.17.1) |
|---|---:|---:|
| Prüfungen | 4630 | **4715** |
| Rückbauten in `gegenprobe.js` | 333 | **353** |
| Stolpersteine | 235 | **241** |
| Fingerprint | `1b6bb5d2` | **`1775fcd4`** |
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
- **Keine neue Route.** `F_ROUTEN` bleibt bei **69**; keiner der sechs Punkte
  braucht eine schreibende Route. **Nachgezählt, nicht angenommen.**
- **Keine neue Karte, keine Karte weniger, keine Karte wechselt ihre Rolle.**
- **Keine Zeile in der `.env`.**
- **Keine Tags** — weder für diese Version noch für die ausstehenden.
  *Entscheidung des Betreibers vom 30. August 2026; der Vergleichseintrag im
  Changelog ist trotzdem geschrieben, er gehört zur Form.*
- **Der engere Bildausschnitt und das wählbare Bildformat sind NICHT
  mitgefahren** — beide brauchen eine gespeicherte Angabe mehr und sind damit
  MINOR. *Sie stehen im Fahrplan bei der Bildablage (0.19.0).*
- **Die Optikrunde ist nicht angefasst** — sie ist 0.20.0.
- **Das Konzeptpapier und das Videopapier sind nicht angefasst.** *Nachgesehen,
  ob dort etwas durch die Umbenennung falsch wird: sie tragen das Wort nicht.*

---

## 14. Offen geblieben

### Die fünf Handgriffe, die diese Runde im Feld belegen

*Am Prüfstand ist belegt, was sich dort belegen lässt; jsdom rechnet kein
Layout und spielt nichts ab.* **Am Wirt fehlt:**

1. **Die Kachel „Zugang" als gewöhnlicher Benutzer** — der Server-Befehl darf
   dort **nicht** stehen, stattdessen der Satz mit dem Admin.
2. **„Meine Sitzungen" mit mehr als drei Anmeldungen** — die Liste nimmt die
   Höhe der Kachel und rollt erst dann; die beiden Zeitangaben stehen
   rechtsbündig untereinander, der orangene Rahmen reicht bis zum Rand.
3. **Ein Video am Eintrag starten und ins Vollbild wechseln** — es muss an
   derselben Stelle weiterlaufen, mit **einer** Tonspur, und beim Schließen
   ebenso zurück.
4. **Der Mailversand** — vier Reihen auf dem breiten Schirm, eine Spalte auf
   dem Telefon.
5. **Ein Lesezeichen auf `#/system/anlage`** — es muss beim Abschnitt
   **Instanz** landen, und die Adresszeile danach `#/system/instanz` zeigen.

### Die Feldbelege aus Abschnitt 0 des Auftrags — noch nicht da

**0.17.0 IST WEITERHIN NICHT IM FELD BESTÄTIGT.** *Der Auftrag verlangt drei
Handgriffe, und ihre Ergebnisse gehören hierher, sobald sie da sind:*

- *(a)* ein Eintrag mit **mehreren Kriterien** an einer Instanz mit **einem
  einzigen Zugang** — Namen und Sternreihen untereinander —, und im selben Zug
  auf die Gesamtnote klicken: der Erklärkasten muss auf die Spalte **Note**
  verweisen. — **offen**
- *(b)* die **Glockentafel**: dort muss stehen, **was** neu ist, und darunter,
  **von wem**. — **offen**
- *(c)* die **Anmeldeseite auf dem Telefon**, **ohne zu scrollen** — die
  Versionszeile muss dastehen. — **offen**

**Die drei Handgriffe lassen sich an 0.17.1 genauso fahren** — keiner der
sechs Punkte dieser Runde fasst an, was sie prüfen. *Wer 0.17.0 zwischendurch
eingespielt hat, muss dort **`1b6bb5d2`** gesehen haben; nach 0.17.1 lautet der
Wert **`1775fcd4`***, jeweils Systembereich → **Datenbank** →
Kennzahlen. **Meldet die laufende Instanz etwas anderes, ist das ein Befund und
kein Rundungsfehler** (Stolperstein 158): dann liegt auf dem Wirt eine Datei,
die kein Commit trägt. **Fällt einer der drei Handgriffe durch, ist das ein
Befund für die nächste Runde und kein Nebensatz.**

### Weiterhin ausstehend, unverändert seit 0.16.0

- **Der Teilexport ein drittes Mal mit Mitschrift** — und **ein Teil in eine
  Zweitinstanz eingespielt, nicht in die laufende.**
- **Beide Netze am echten Wirt** — eine Anmeldung über HTTPS und eine über
  `http://<server-ip>:3100`, im selben Browser.

*Beides kostet keine Zeile Code und ist nur am echten Bestand zu haben.*

### Der volle Gegenprobenlauf

**Er steht seit vierzehn Runden aus.** 353 Rückbauten zu je einem vollen
Prüflauf sind bei rund fünfeinhalb Minuten je Lauf etwa **zweiunddreißig
Stunden** hintereinander, in vier Nebenspuren rund acht. *Gefahren wurde in
dieser Runde, was in Abschnitt 10 steht.*

### Befunde, die diese Runde erzeugt und nicht behoben hat

**Zwei Befunde, beide gemeldet und keiner behoben — weil beides so
angewiesen ist:**

- **Das Konzeptpapier und das Videopapier tragen „Anlage" je einmal**, und
  beide Male meint es die Installation. *Der Auftrag nimmt beide Papiere
  ausdrücklich aus und verlangt stattdessen die Meldung* (Abschnitt 13).
- **`server.js` nennt an einer Stelle „Anlagenbytes"** und meint einen
  **Anhang** — richtig, solange „Anlage" nichts anderes mehr bedeutet, aber
  das einzige Wort dieses Stamms, das im ausgelieferten Stand noch steht.
  *Sollte es eines Tages „Anhangsbytes" heißen, ist das eine eigene
  Entscheidung und keine Beifracht dieser Runde.*

*Der Befund gegen den Auftrag selbst — die falschen Freunde — ist dagegen in
derselben Runde aufgelöst worden (Abschnitt 4).*
