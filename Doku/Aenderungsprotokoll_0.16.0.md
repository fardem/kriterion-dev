# Änderungsprotokoll 0.16.0 — „Der Systembereich, die Glocke und die Auskunft"

**Version 0.16.0 · gebaut am 29. August 2026 · Fingerprint `aa76c352` ·
4520 Prüfungen · 300 Rückbauten in `gegenprobe.js`**

---

**Die größte Umbaufläche des ganzen Fahrplans.** Vier Punkte aus dem
Sammelblatt (Nr. 10, Nr. 4, Nr. 11, Nr. 16), vier Zeilen aus dessen Teil II und
ein Befund aus dem Betrieb vom 28. August 2026, der nie im Sammelblatt stand:
**im Vollbild ließ sich nicht löschen.**

Der Systembereich hatte neunzehn Karten in **einer** Liste — auf dem Telefon
seit 0.12.0 in einer einzigen Spalte untereinander. **Eine Adresse gab es nur
für den Bereich als Ganzes**, nicht für die Einstellung darin; verlinken ließ
sich nichts, und die Zurück-Taste sprang aus dem Bereich heraus statt einen
Schritt zurück. **Dahinter stand `renderSystem()` mit 2466 Zeilen** — die
größte Funktion des Hauses und die Stelle, an der jede Änderung teuer war.

> **DIESE RUNDE IST EINE DATENBANKSTUFE — anders als geplant.** Der Auftrag
> sagte *„kein Schema, kein Migrationsblock, Format bleibt 11, sechs Blöcke"*
> und setzte dazu: *„Kommt deine Prüfung zu einem anderen Ergebnis — und bei
> der Glocke ist die Stelle, an der das passieren könnte —, ist das ein Grund
> zum Anhalten und Fragen, kein Grund zum stillen Abweichen."* **Die Prüfung
> kam zu einem anderen Ergebnis:** `ratings` trug bis 0.15.1 **keinen
> Zeitpunkt**. Ohne ihn kann die Glocke über **fremde Bewertungen** nichts
> sagen — sie könnte nur Kommentare melden und würde die halbe Zusage
> stillschweigend fallenlassen. **Gefragt, und ausdrücklich angewiesen: mit
> Schemaschritt.** Es ist der **siebte** markierte Migrationsblock.
> **DIE SICHERUNG DES DATENVERZEICHNISSES IST DESHALB PFLICHT UND NICHT
> EMPFEHLUNG.**
> *Das Austauschformat bleibt trotzdem bei **11**: der Zeitpunkt geht nicht in
> die Exportdatei, und eine eingespielte Bewertung bekommt keinen erfundenen.*
> **Keine neue Zeile in der `.env`, keine neue Abhängigkeit, `F_ROUTEN`
> unverändert bei 69.**

> **DIE ZWEITE ABWEICHUNG IST EIN VERZICHT.** Der Punkt 4b des Auftrags — ein
> Rechner im Systembereich, der zeigt, *was passierte, wenn ich das Gewicht
> änderte* — **ist nicht gebaut.** Er war dort als **erster Kandidat des
> Schnitts** benannt, und er ist der einzige Teil der Runde mit **eigener
> Ansicht und eigenem Endpunkt**. *Der Erklärkasten am Eintrag (4a)
> beantwortet die dringlichere Frage — „wie kommt DIESE Note zustande" — ohne
> beides.* **Er steht weiter im Projektstand, Abschnitt 10.**

> **DER WERKZEUGBEFUND WAR DER ERSTE HANDGRIFF DER RUNDE, VOR JEDEM LAUF.**
> `gegenprobe.js` nahm ein Argument als Nummer **und** als Namensteil:
> `node gegenprobe.js 256` fuhr **zwei** Rückbauten statt einem — neben der 256
> auch die **83**, weil sie *„SHA-256 statt SHA-1"* heißt. **Der Beifang war
> stumm** und verfälschte damit die Gegenprobentabelle. *Ein Werkzeug, das mehr
> tut, als sein Aufruf sagt, wird nicht wieder benutzt — und die Gegenproben
> dieser Runde hängen daran.* **Behoben mit einer Prüfung daneben**, so wie der
> Auftrag es verlangte.

---

## Inhalt

1. [Der Systembereich bekommt Abschnitte](#1-der-systembereich-bekommt-abschnitte)
2. [`renderSystem()` — 2466 auf 79 Zeilen](#2-rendersystem--2466-auf-79-zeilen)
3. [Export und Import werden eine Karte](#3-export-und-import-werden-eine-karte)
4. [Die Gewichtung erklärt sich selbst](#4-die-gewichtung-erklärt-sich-selbst)
5. [Die Glocke und der Zähler „Offen"](#5-die-glocke-und-der-zähler-offen)
6. [Der siebte Migrationsblock](#6-der-siebte-migrationsblock)
7. [Die Kennzahlen nennen Version und Verfahren](#7-die-kennzahlen-nennen-version-und-verfahren)
8. [Löschen im Vollbild](#8-löschen-im-vollbild)
9. [Der Werkzeugbefund an `gegenprobe.js`](#9-der-werkzeugbefund-an-gegenprobejs)
10. [Was je Datei geändert wurde](#10-was-je-datei-geändert-wurde)
11. [Der Prüfstand](#11-der-prüfstand)
12. [Gegenproben](#12-gegenproben)
13. [Neue Stolpersteine](#13-neue-stolpersteine)
14. [Die Zahlen](#14-die-zahlen)
15. [Was ausdrücklich nicht passiert ist](#15-was-ausdrücklich-nicht-passiert-ist)
16. [Nachlese: die beiden Feldbelege](#16-nachlese-die-beiden-feldbelege)
17. [Offen geblieben](#17-offen-geblieben)

---

## 1. Der Systembereich bekommt Abschnitte

**Fünf Abschnitte, jeder mit einer eigenen Adresse, in der Reihenfolge der
Rechteleiter:**

| Adresse | Abschnitt | wer sieht ihn |
|---|---|---|
| `#/system/persoenlich` | Persönlich | jeder Angemeldete |
| `#/system/bestand` | Bestand | wer den Bestand pflegen darf |
| `#/system/zugaenge` | Zugänge | Admin |
| `#/system/datenbank` | Datenbank | Admin |
| `#/system/anlage` | Anlage | Admin |

**`#/system` bleibt gültig.** Es löst sich auf den **ersten sichtbaren**
Abschnitt auf, und die Adresszeile wird nachgezogen — über
`history.replaceState`, also **ohne zweiten Eintrag im Verlauf** und **ohne ein
zweites `hashchange`**, das den Bereich noch einmal zeichnete. *Ein
`location.hash = …` täte beides.*

**Ein Abschnitt ohne sichtbare Karte erscheint gar nicht.** Das ist keine
Kosmetik: `sysSichtbareAbschnitte()` fragt für jede der achtzehn Karten
dieselbe Funktion `sichtbar(geholt)`, die auch entscheidet, ob die Karte
gezeichnet wird. **Es gibt keine zweite Liste, die sagt, welche Abschnitte es
gibt** — der Reiter entsteht daraus, dass etwas darin steht (Stolperstein 47:
keine zweite Wahrheit).

**Eine Adresse auf einen Abschnitt, den dieser Benutzer nicht sehen darf, fällt
auf den ersten sichtbaren zurück** — und die Adresszeile wird ebenso
nachgezogen. *Ein Nutzer ohne Adminrechte, der `#/system/datenbank` aus einem
Chat bekommt, landet auf „Persönlich" und sieht in der Adresszeile, wo er ist.*

**Auf dem Telefon wird aus der Reiterreihe eine Liste** — dieselben Knoten,
andere Regeln im Stilblatt: **ein Markup, zwei Gestalten** (die Bauform aus
0.12.0). Es gibt **keine** zweite Baustelle für die schmale Ansicht.

**Der zuletzt offene Abschnitt wird nicht gemerkt.** *Gemerkt wird, was der
Benutzer merken ließ — und das ist hier die Adresse, die er sich notiert oder
verschickt.* Ein Merker daneben wäre eine zweite Wahrheit und stritte beim
nächsten Aufruf mit der Adresse.

---

## 2. `renderSystem()` — 2466 auf 79 Zeilen

**Das war kein eigenes Vorhaben, sondern der Weg.** Die Abschnitte lassen sich
an einer Funktion mit 2466 Zeilen nicht anbauen, ohne dass sie 2600 hat.

**Aus dem Block wurde eine Tabelle.** `SYS_KARTEN` trägt achtzehn Einträge, je
einer nach demselben Muster:

```
{ schluessel, abschnitt, sichtbar(geholt), markup(geholt), ausruesten(geholt) }
```

`markup()` liefert den Text, `ausruesten()` hängt die Ereignisse daran.
**Siebzehn Karten haben beides; die Kennzahlen haben nur Markup**, weil dort
nichts zu klicken ist — und das steht als leere Stelle in der Tabelle, nicht
als leere Funktion.

**Kein Rahmenwerk, keine Bauleitung, keine neue Abhängigkeit.** Es ist dieselbe
Sprache, dieselbe Datei und dieselbe Bauform wie überall sonst im Haus. *Der
Auftrag hat das ausdrücklich ausgeschlossen, und es wäre auch ohne ihn falsch
gewesen: eine Bauleitung ist ein zweites Regelwerk neben dem vorhandenen.*

**Der Prüfstand MISST die Länge der Funktionen.** Bei jedem Lauf steht ein
Block da — je Datei die Zeilenzahl, die Zahl der Funktionen und die **drei
längsten mit Namen**. **Rot wird davon nichts.** Die einzige Zusage ist:
`renderSystem()` bleibt unter 300 Zeilen.

> **WARUM MESSEN UND NICHT GRENZEN:** eine harte Zahl für alle wäre eine Zahl,
> die niemand begründen kann — und sie würde umgangen (zwei Funktionen à 140
> statt einer à 280), nicht eingehalten. *Eine Messung, die bei jedem Lauf
> dasteht, lässt sich nicht übersehen und braucht keine Begründung.*

**Die Messung prüft sich selbst.** An einem gestellten Quelltext mit bekannten
Längen wird nachgesehen, dass sie findet, was darin steht — sonst wäre eine
Messung, die nichts mehr findet, von einer sauberen Datei nicht zu
unterscheiden (Stolperstein 213).

**DAS IST DIE MESSUNG, WIE SIE BEI JEDEM LAUF DASTEHT** — Zeilen je Datei,
Zahl der Funktionen, und die drei längsten mit Namen:

| Datei | Zeilen | Funktionen | die drei längsten |
|---|---|---|---|
| `public/app.js` | 8281 | 128 | renderDetail 1995 · drawFilters 351 · openLightbox 167 |
| `server.js` | 5102 | 76 | spieleEin 357 · detail 97 · eintragAlsPaket 88 |
| `auth.js` | 1677 | 60 | entferneZugang 46 · aendereZugang 41 · setzeStatus 29 |
| `db.js` | 989 | 13 | ordneBestandZu 21 · migration0140 20 · migration0850 17 |
| `anhaenge.js` | 365 | 12 | findeImZip 37 · typAusBytes 30 · rangeAus 27 |
| `zweifaktor.js` | 224 | 6 | base32Dekodiere 14 · pruefeCode 14 · base32Kodiere 13 |
| `zugang.js` | 250 | 10 | hilfe 34 · befehlEntfernen 28 · befehlZweifaktor 21 |
| `schluessel.js` | 325 | 6 | befehlWechseln 160 · hilfe 26 · lage 24 |
| `mail.js` | 364 | 12 | versende 36 · pruefeEingabe 30 · textBestaetigung 20 |
| `keys.js` | 165 | 7 | schreibeEnvZeile 41 · loadKey 24 · warnKeyBesideData 16 |
| `pruefung.js` | 31123 | 28 | pruefeOberflaeche 10931 · baueDom 1105 · pruefeSchluesselwechsel 518 |
| `gegenprobe.js` | 3086 | 10 | schreibeTabelle 57 · fahre 37 · leseLauf 34 |

*Gezählt werden Funktionen, die in Spalte 0 beginnen und an einer Zeile enden,
die genau `}` oder `};` ist — das ist die Hausform dieses Quelltexts. **Was
verschachtelt darin steht, zählt zur äußeren Funktion**, und genau so ist es
gemeint: eine Funktion mit fünf Helfern darin ist so lang, wie sie ist.*

**`renderSystem` steht nicht mehr in dieser Tabelle.** Die drei längsten in
`public/app.js` heißen jetzt `renderDetail` (1995), `drawFilters` (351) und
`openLightbox` (167). **`renderDetail` ist damit die nächste Adresse** — sie ist
in dieser Runde ausdrücklich **nicht** angefasst worden, weil ein zweiter Umbau
derselben Größe in derselben Runde nicht mehr zu gegenprüfen wäre.

*`pruefung.js` und `gegenprobe.js` stehen mit in der Messung, obwohl sie nicht
ausgeliefert werden. **Das ist Absicht:** `pruefeOberflaeche` mit 10931 Zeilen
ist die längste Funktion des Hauses, und eine Messung, die den Prüfstand
ausnimmt, misst dort, wo es bequem ist.*

---

## 3. Export und Import werden eine Karte

**Neunzehn Karten sind achtzehn.** Export und Import gehören zusammen: es ist
dieselbe Datei, einmal hinaus und einmal herein.

**Der Import steht untergeordnet darin** — hinter einer Trennlinie, unter einer
eigenen kleinen Überschrift, mit einem **leiseren** Ablagefeld (`.drop-leise`).
*Wer die Karte öffnet, will in neun von zehn Fällen exportieren; der Import ist
der seltene und der gefährliche Griff.*

**Die zweite Bestätigung bleibt, Wort für Wort.** Die Karte ist zusammengelegt,
nicht entschärft — geprüft wird ausdrücklich, dass der Bestätigungstext und der
zweite Faktor unverändert davorstehen.

---

## 4. Die Gewichtung erklärt sich selbst

**Das Wort „gewichtet" am Kopf des Eintrags ist ein Knopf geworden.** Ein Klick
öffnet einen Kasten, der die Rechnung **dieses** Eintrags zeigt: je Kriterium
der Wert, das Gewicht und das Produkt, darunter Summe, Teiler und Ergebnis.

**DER KASTEN LIEST DIE RECHNUNG. ER RECHNET SIE NICHT NACH.** Der Rechenweg
entsteht in `gesamtSchnitt()` im Server — derselben Funktion, die die Zahl im
Kopf gebildet hat — und reist mit dem Eintrag mit. *Es sind und bleiben genau
zwei Rechenstellen; eine dritte im Browser wäre eine zweite Wahrheit über
dieselbe Zahl und liefe früher oder später auseinander.*

> **DIE PRÜFLAGE BEWEIST DAS, UND ZWAR MIT ABSICHT FALSCH.** Sie liefert einen
> Rechenweg, dessen Ergebnis zu seiner eigenen Summe und seinem eigenen Teiler
> **nicht** passt: 9,2 ÷ 2,5 wäre 3,7, dort steht **3**. **Zeigt der Kasten die
> 3, liest er; zeigt er 3,7, rechnet er.** *Stünden die Zahlen stimmig
> beieinander, wäre die Prüfung auch dann grün, wenn die Oberfläche heimlich
> selbst rechnete* (Stolperstein 217).

**Ohne Gewichtung steht kein Knopf da** — dann ist die Zahl der schlichte
Mittelwert und es gibt nichts zu erklären. **An einem Eintrag ohne Bewertung
ebenso wenig.**

---

## 5. Die Glocke und der Zähler „Offen"

**Zwei Anzeigen in der Kopfzeile, und beide kosten keine einzige Anfrage.**

**Die Glocke** trägt einen Punkt, wenn seit dem letzten Öffnen ihrer Tafel
jemand **anderes** einen Kommentar geschrieben oder eine Bewertung gesetzt hat.
Ein Klick öffnet die Tafel; jede Zeile nennt den Eintrag und führt beim
Anklicken dorthin.

**Der Knopf „Offen"** trägt die Zahl der offenen Aufgaben über den ganzen
Bestand.

**KEINE BENACHRICHTIGUNGSTABELLE.** Beides wird aus vorhandenen Zeitstempeln
gerechnet und **reist mit der Liste mit**, die die Übersicht ohnehin holt.
*Eine Tabelle wäre eine zweite Wahrheit neben den Kommentaren und Bewertungen —
und sie müsste bei jedem Löschen mitgepflegt werden.*

**KEINE NEUE ROUTE.** Der Merker `glockeGesehen` ist ein persönlicher Schlüssel
wie `zuletztGesehen` und fährt über das vorhandene `PUT /api/settings`.
`F_ROUTEN` bleibt bei **69**. *Beim ersten Verlassen der Tafel gehen beide
Merker in **einer** Anfrage hinaus, nicht in zweien.*

**Der Merker wird eine Sekunde zurückdatiert** (`datetime('now','-1 second')`).
*Sonst ginge verloren, was in derselben Sekunde noch hereinkommt — Zeitangaben
in dieser Datenbank haben Sekundenauflösung.* **Genau das hat die Prüflage
gekostet** (Stolperstein 218).

**Was die Glocke NICHT verspricht, steht in der README:** sie ist kein
Postfach. Sie sagt, dass seit dem letzten Blick etwas dazugekommen ist — nicht,
dass nichts übersehen wurde. *Wer die Tafel öffnet und wieder schließt, hat den
Punkt quittiert; die Kommentare bleiben, wo sie sind.*

**Und sie schweigt über alles, was keinen Zeitpunkt trägt.** Bewertungen von
vor 0.16.0 und eingespielte Bewertungen haben keinen — siehe Abschnitt 6.

---

## 6. Der siebte Migrationsblock

**`ratings` bekommt `gesetzt_am TEXT` — ohne Vorgabewert.**

Die Spalte heißt **nicht** `created_at`, und das ist kein Geschmack: die Zeile
entsteht beim ersten Stern und wird danach **überschrieben**
(`ON CONFLICT DO UPDATE`). Was dort steht, ist der Zeitpunkt der **letzten
Setzung** — und genau der ist gemeint, wenn die Glocke fragt, ob seit meinem
letzten Blick jemand bewertet hat.

> **KEIN `DEFAULT`, WEDER IN DER MIGRATION NOCH IN DER DDL.** Ein fester Wert
> ließe den ganzen Altbestand gleich alt aussehen; `datetime('now')` ließe ihn
> **brandneu** aussehen — und die Glocke läutete beim ersten Start für jede
> Bewertung, die je vergeben wurde. **Eine leere Zelle heißt „die Anlage weiß
> nicht, wann das war", und die Glocke übergeht sie.** *Dasselbe gilt für
> eingespielte Bewertungen: die Exportdatei trägt den Zeitpunkt nicht, und ein
> `datetime('now')` beim Einspielen machte daraus die **Behauptung**, sie seien
> eben erst vergeben worden* (Stolperstein 219).

**Der Block sagt im Protokoll, wie viele Bewertungen ohne Zeitpunkt dastehen** —
nicht bloß, dass er etwas getan hat. *Der Betreiber soll die Zahl sehen, für
die die Glocke schweigen wird.*

**Geprüft wird wie an den sechs Blöcken davor** — und zusätzlich an der Stelle,
die hier neu ist: **die DDL einer frischen Anlage gibt der Spalte ebenso wenig
einen Vorgabewert**, sonst sähen frisch und migriert verschieden aus. *Diese
Prüfung schnitt zunächst am falschen Ende und war deshalb halb blind*
(Stolperstein 221).

**Das Austauschformat bleibt 11.** Der Zeitpunkt geht nicht hinaus.

---

## 7. Die Kennzahlen nennen Version und Verfahren

**Oben die Version, darunter der Fingerprint** — bisher stand nur der
Fingerprint da, und der sagt einem Menschen nichts über die Runde.

**Darunter ein eigener Block „Verfahren":**

| Zeile | Inhalt |
|---|---|
| Verschlüsselung | SQLCipher, aus dem lebenden `PRAGMA cipher` |
| Schlüssel | Bitlänge, aus der Länge des Rohschlüssels gerechnet |
| Journal | WAL, aus dem lebenden `PRAGMA journal_mode` |
| Passwörter | scrypt |

**Alles bis auf die letzte Zeile ist aus den lebenden Pragmas gelesen** und
nicht aus einem Text abgeschrieben. *Eine abgeschriebene Angabe ist eine, die
still falsch wird, wenn jemand die Anlage umbaut.*

**Paketversionen stehen dort nicht.** Der Auftrag hat sie ausgeschlossen, und
der Grund trägt: sie sind eine Fremdauskunft, die morgen still falsch ist —
`npm ls` gehört auf die Kommandozeile und nicht in eine Karte.

*Die Zeile hieß im ersten Anlauf „Datenbank" und stand damit zweimal in
derselben Karte — die Größe der Datenbank heißt schon so. Eine Prüfung, die
nach dem Text hinter der Beschriftung sah, las die falsche Zeile.*

---

## 8. Löschen im Vollbild

**Der Befund aus dem Betrieb, 28. August 2026:** im Vollbild ließ sich ein Bild
ansehen, aber nicht wegwerfen — man musste schließen, unten die Kachel suchen
und dort löschen.

**Jetzt steht der Papierkorb in der Werkzeugleiste des Vollbilds** — mit
**derselben Klammer** (wer darf es) und **derselben Rückfrage** wie unten am
Streifen. *Es ist dieselbe Funktion, nicht eine zweite daneben: `renderDetail`
reicht sie an `openLightbox` weiter.*

**Wo nicht gelöscht werden darf, steht der Knopf nicht** — das Vollbild bekommt
die Löschfunktion gar nicht erst gereicht. *An den beiden anderen Aufrufstellen
(Kommentarbilder, Vergleich) gibt es nichts zu löschen.*

**Nach dem Löschen zieht die Ansicht nach:** das Bild verschwindet aus dem
Streifen, die Zählung stimmt wieder, und **beim letzten Bild schließt sich das
Vollbild selbst** — es hätte nichts mehr zu zeigen.

**Streifen und Blätterpfeile stehen nur, wenn es mehr als ein Bild gibt.**

---

## 9. Der Werkzeugbefund an `gegenprobe.js`

**`node gegenprobe.js 256` fuhr zwei Rückbauten.** Der Filter nahm das Argument
als Nummer **und** als Teil des Namens — und Rückbau **83** heißt
*„SHA-256 statt SHA-1"*.

**Der Beifang war stumm**, und das ist das Ärgerliche daran: er lief mit, machte
keine Prüfung rot und stand danach als „STUMM" in der Tabelle. *Eine Zahl in
der Gegenprobentabelle, die einen anderen Umfang hat als ihr Aufruf, ist
schlimmer als keine.*

**Jetzt gilt: eine reine Zahl ist eine Nummer und sonst nichts.** Alles andere
wird weiterhin als Nummer **oder** Namensteil genommen — `node gegenprobe.js
glocke` fährt also weiter alles, was „glocke" im Namen trägt.

```js
const passtRueckbau = (r, argument) => {
  const a = String(argument).toLowerCase();
  if (/^\d+$/.test(a)) return r.nr.toLowerCase() === a;
  return r.nr.toLowerCase() === a || r.name.toLowerCase().includes(a);
};
```

**Die Funktion ist ausgelagert und wird exportiert**, damit der Prüfstand sie
ansehen kann statt eine Kopie ihrer Regel zu beschreiben.

**Behoben vor jedem Gegenprobenlauf dieser Runde**, so wie der Auftrag es
verlangte — sonst hätte jede Zahl in Abschnitt 12 einen anderen Umfang gehabt,
als sie behauptet.

---

## 10. Was je Datei geändert wurde

| Datei | was |
|---|---|
| `public/app.js` | **Der Hauptteil.** `renderSystem()` von 2466 auf 79 Zeilen; neu `SYS_ABSCHNITTE`, `SYS_MUSTER`, `sysAdresse()`, `SYS_KARTEN` (18), `sysSichtbareAbschnitte()` und je Karte `karteX()`/`ruesteXAus()`. `route()` erkennt `#/system/<abschnitt>`. Neu die Glocke (`ICON_GLOCKE`, `glockeNeu()`, `offeneGesamt()`, `zeichneKopfzahlen()`, `zeigeGlockentafel()`), der Erklärkasten (`gewZahl()`, `zeigeRechnung()`) und der Papierkorb im Vollbild (`openLightbox` nimmt eine Löschfunktion, `baueStreifen()`). `amElement` ist auf Modulebene gewandert. |
| `public/style.css` | `.sys-reiter` in beiden Gestalten, `.sys-unter`, `.drop-leise`, `.glocke` samt `.glocke-punkt`, `.offen-zahl`, `.glockentafel`, `.rechnung` samt Zeilen, `.lb-btn.weg`. |
| `server.js` | `glockeGesehen` in `PERSOENLICHE_SCHLUESSEL` (acht → neun) samt Lesen und Setzen über das vorhandene `PUT /api/settings`; `verfahren()` in `/api/stats`; `gesamtSchnitt()` füllt auf Wunsch den Rechenweg, den die Eintragsansicht mitschickt; die Bewertungsroute schreibt `gesetzt_am` beim Anlegen **und** beim Überschreiben; drei gruppierte Abfragen hängen `offeneAufgaben` und — nur bei vorhandenem Bezugspunkt — `neuFremd` an die Liste. |
| `db.js` | `ratings.gesetzt_am` in der DDL (ohne Vorgabewert, mit langer Begründung daneben), `migration0160()` als siebter markierter Block, `verfahren()` aus den lebenden Pragmas. |
| `gegenprobe.js` | `passtRueckbau()` ausgelagert und exportiert; **29 neue Rückbauten (272–300)**; **zwei alte repariert** (63 und 143 zeigten nach dem Umbau ins Leere). |
| `pruefung.js` | Neun neue Gruppen, die Größenmessung samt Selbstprobe, `sysAbschnitt()`/`sysDurchgang()` und rund dreißig angepasste Aufrufstellen, die jetzt den richtigen Abschnitt öffnen; die Mock-Lage kennt `ohneBewertung`, `statsVerfahren`, `rechenweg` und `mitKopfzahlen()`. |
| `README.md` | Der Systembereich mit seiner Adresstabelle, Version und Verfahren, der Erklärkasten, **„Die Glocke und der Zähler ‚Offen'"** samt „was sie nicht verspricht", Export und Import in einer Karte, der Papierkorb im Vollbild. |
| `CHANGELOG.md` | Eintrag `0.16.0` in der Form der Nachbarn, samt „Was du danach von Hand tun musst" (**Sicherung ist Pflicht**). |
| `Doku/Fehler_und_Ideen.md` | Wegweiser auf **GEBAUT** mit beiden Abweichungen; der Werkzeugbefund aus Teil II entfernt; „Erwähnungen im Kommentar" **neu beurteilt** — die Begründung dagegen ist seit dieser Runde eine andere. |

---

## 11. Der Prüfstand

**4520 von 4520 bestanden — 4366 waren es vorher, also
154 neue.** Neun neue Gruppen mit zusammen **115** Prüfungen:

| Gruppe | Prüfungen |
|---|---|
| Die Groesse der Funktionen wird gemessen | 9 |
| Export und Import stehen in einer Karte | 12 |
| Die Rechnung hinter der Kopfzahl | 18 |
| Die Glocke in der Kopfzeile | 22 |
| Der Papierkorb im Vollbild | 10 |
| Der Rechenweg reist mit | 7 |
| Die Bewertung traegt ihren Zeitpunkt | 5 |
| Die Glocke: was mit der Liste mitreist | 17 |
| MIGRATION 0.16.0 — ENTFAELLT MIT 1.0 | 15 |
| **zusammen** | **115** |

**Die übrigen 39 stehen in sechs vorhandenen Gruppen, und keine einzige
Prüfung ist weggefallen:**

| vorhandene Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| Versionsnummer, Linkzeilen, Zeitleiste | 15 | 26 | Version und Verfahren in den Kennzahlen |
| Der Systembereich nach Rolle | 57 | 65 | die fünf Abschnitte, ihre Adressen, der Rückfall |
| Der Papierkorb in der Oberflaeche | 39 | 50 | der Papierkorb im Vollbild an der echten Anlage |
| Die Gegenproben greifen | 9 | 16 | der Nummernfilter und die 300 Rückbauten |
| Offen: der Haken in der Ansicht | 26 | 27 | die Zahl am Knopf „Offen" |
| Neu seit: der Merkzeitpunkt | 11 | 12 | `glockeGesehen` neben `zuletztGesehen` |

*4366 + 115 + 39 = 4520. **Die Rechnung geht auf** — das ist der Grund, warum
sie hier steht: eine Runde, in der eine vorhandene Gruppe stillschweigend
kleiner wird, sieht an der Gesamtzahl genauso aus wie eine, in der alles bleibt.*

**Zahlen in vorhandenen Gruppen sind nachgezogen:** 271 → 300 Rückbauten,
acht → neun persönliche Schlüssel, sechs → sieben Migrationsblöcke und
Migrationsfunktionen, neunzehn → achtzehn Karten.

**Rund dreißig vorhandene Prüfungen mussten den Abschnitt öffnen**, in dem ihre
Karte jetzt steht. *Sie sind nicht gelöscht und nicht umgeschrieben — sie
bekommen einen Handgriff davor, und über den Helfern steht, warum
(Stolperstein 201).*

> **DIE GRÖSSENMESSUNG IST EINE AUSKUNFT UND KEIN URTEIL.** Sie schreibt bei
> jedem Lauf die drei längsten Funktionen je Datei mit ihrer Zeilenzahl hin.
> **Rot wird davon nichts** außer der einen Zusage zu `renderSystem()`.

---

## 12. Gegenproben

**271 → 300 Rückbauten.** Die **29 neuen** (272–300) decken die Zusagen dieser
Runde ab: die Abschnitte und ihre Adressen, den Rückfall bei fehlendem Recht,
`replaceState` statt `location.hash`, die zusammengelegte Exportkarte samt
zweiter Bestätigung, den Erklärkasten und sein **Lesen** statt Rechnen, die
Glocke und ihren Merker, `gesetzt_am` ohne Vorgabewert, den Papierkorb im
Vollbild samt Selbstschließen, die Verfahrenszeilen aus den Pragmas und den
Nummernfilter.

**Zwei alte Rückbauten waren nach dem Umbau stumm und sind repariert:**

| Nr. | war | ist |
|---|---|---|
| **63** | zielte auf eine Zeile in der alten `renderSystem()` | zielt auf die Sichtbarkeitsregel derselben Karte in `SYS_KARTEN` |
| **143** | zählte die persönlichen Schlüssel ohne den neuen | nennt `glockeGesehen` mit |

*Sie sind beim Zählen aufgefallen, nicht beim Lauf — die Selbstprobe „jeder
Suchtext kommt in seiner Datei genau einmal vor" wurde rot* (Stolperstein 192).

**DIE TABELLE DER NEUNUNDZWANZIG NEUEN — aus `gegenprobe.js`, nicht
abgeschrieben:**

| Nr. | Datei | was zurückgebaut wird |
|---|---|---|
| **272** | `public/app.js` | Der Systembereich zeigt wieder alle Karten auf einmal |
| **273** | `public/app.js` | Ein Abschnitt ohne sichtbare Karte erscheint trotzdem |
| **274** | `public/app.js` | Die Adresse wird nicht mehr nachgezogen |
| **275** | `public/app.js` | Eine Adresse auf einen unsichtbaren Abschnitt zeigt ins Leere |
| **276** | `public/app.js` | Die Reiter tragen keine eigene Adresse mehr |
| **277** | `public/app.js` | Der Import steht wieder gleichrangig neben dem Export |
| **278** | `public/app.js` | Das Ablagefeld des Imports wird wieder gleich laut gezeichnet |
| **279** | `public/app.js` | Die Kopfzahl ist wieder blosser Text |
| **280** | `public/app.js` | Der Erklaerkasten rechnet wieder selbst nach |
| **281** | `server.js` | Der Rechenweg faellt aus der Antwort |
| **282** | `server.js` | Der Rechenweg wird auf zwei Stellen gerundet ausgeliefert |
| **283** | `server.js` | Der Bezugspunkt der Glocke ist kein persoenlicher Schluessel mehr |
| **284** | `public/app.js` | Die Glocke steht auch ohne gespeicherten Bezugspunkt |
| **285** | `server.js` | neuFremd steht auch ohne Bezugspunkt an jedem Eintrag |
| **286** | `server.js` | Die Glocke zaehlt die eigenen Kommentare mit |
| **287** | `server.js` | Bewertungen ohne Zeitpunkt gelten wieder als neu |
| **288** | `server.js` | Der Zeitpunkt zieht beim Ueberschreiben nicht mehr mit |
| **289** | `public/app.js` | Der Punkt an der Glocke wird wieder eine Zahl |
| **290** | `public/app.js` | Der Zaehler „Offen" zeigt auch die Null |
| **291** | `public/app.js` | Das Oeffnen der Tafel zieht den Bezugspunkt nicht nach |
| **292** | `public/app.js` | Die Zeilen der Tafel fuehren nicht mehr zum Eintrag |
| **293** | `server.js` | Die Kennzahlen nennen die Verfahren nicht mehr |
| **294** | `server.js` | Die Kennzahlen nennen zusaetzlich die Paketversion |
| **295** | `db.js` | Das Journal wird behauptet statt abgelesen |
| **296** | `public/app.js` | Der Papierkorb loescht wieder ohne Rueckfrage |
| **297** | `public/app.js` | Das Vollbild bekommt seinen Papierkorb nicht |
| **298** | `public/app.js` | Der Vorschaustreifen im Vollbild zieht nach dem Loeschen nicht nach |
| **299** | `pruefung.js` | Die Groessenmessung findet gar nichts mehr |
| **300** | `gegenprobe.js` | Der Nummernfilter der Gegenprobe greift wieder in die Namen |

**Gefahren sind die neuen, einzeln und vollständig — keiner blieb stumm.**
**Der volle Lauf über alle 300 steht weiterhin aus** — die Rechnung dafür steht
in Abschnitt 17.

---

## 13. Neue Stolpersteine

**217 bis 221.** Ausführlich stehen sie im Projektstand, Abschnitt 6; hier je
ein Satz:

* **217 — Eine Prüflage, deren Zahlen zueinander passen, kann nicht zeigen,
  woher eine Zahl kommt.** Der Erklärkasten wird an einem Rechenweg geprüft,
  dessen Ergebnis zu seiner eigenen Summe **nicht** passt.
* **218 — Ein Zeitpunkt auf die Sekunde genau ist eine Grenze, an der zwei
  Dinge im selben Augenblick liegen können.** Die Prüflage muss den Abstand
  herstellen, den die Auflösung nicht hergibt.
* **219 — Eine Spalte ohne Vorgabewert ist eine Aussage und keine
  Bequemlichkeit.** Was die Anlage nicht weiß, behauptet sie nicht.
* **220 — Ein Anker, der zweimal vorkommt, ist kein Anker.** Ein Skript für
  dieses Blatt traf die falsche der beiden gleichlautenden Überschriften und
  löschte 1534 Zeilen; gerettet hat allein, dass die Datei in Git lag. **Vor
  jedem Ersetzen wird gezählt, nicht gesucht.**
* **221 — Ein Ausschnitt, dessen Ende vor seinem Anfang liegt, ist leer — und
  an einem leeren Text ist jede Prüfung auf „kommt nicht vor" grün.**

---

## 14. Die Zahlen

| | vorher (0.15.1) | nachher (0.16.0) |
|---|---|---|
| Prüfungen | 4366 | **4520** |
| Rückbauten | 271 | **300** |
| Karten im Systembereich | 19 | **18** |
| Abschnitte im Systembereich | — | **5** |
| `renderSystem()` | 2466 Zeilen | **79 Zeilen** |
| persönliche Schlüssel | 8 | **9** |
| markierte Migrationsblöcke | 6 | **7** |
| `F_ROUTEN` | 69 | **69** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten (`npm ls --omit=dev`) | 122 Pfade | **122 Pfade** |

---

## 15. Was ausdrücklich nicht passiert ist

**Der Auftrag hat acht Dinge ausgeschlossen. Keines davon ist gebaut:**

* **keine Benachrichtigungstabelle** — Glocke und Zähler rechnen aus
  vorhandenen Zeitstempeln;
* **kein Rahmenwerk und keine Bauleitung** — dieselbe Sprache, dieselbe Datei;
* **keine harte Zeilengrenze** — gemessen wird, geurteilt nicht;
* **kein Fließsatz zur Formel in der README** — sie steht als Rechnung da;
* **keine Paketversionen in den Kennzahlen**;
* **keine Adressliste aus `X-Forwarded-For`**;
* **kein Fließsatz an der Tagwolke**;
* **keine Bildablage.**

**Dazu die zweite Abweichung von oben:** der **Rechner zur Gewichtung** (Punkt
4b) ist nicht gebaut und steht weiter im Projektstand, Abschnitt 10.

**Und was sonst noch nicht angefasst wurde, obwohl es naheliegt:**
`renderDetail()` mit 1995 Zeilen. *Ein zweiter Umbau derselben Größe in
derselben Runde wäre nicht mehr zu gegenprüfen.*

---

## 16. Nachlese: die beiden Feldbelege

**Beide stehen weiterhin aus.** Sie kosten keine Zeile Code und sind nur am
echten Bestand zu haben:

1. **Der Teilexport am echten Bestand** (0.12.4, offen seit dem 28. August).
   Systembereich → **Datenbank** → Export → *In Teilen exportieren*, 300 MB.
   **Wie viele Teile, und stimmen die Dateigrößen ungefähr mit der Ansage?**
   Dann alle Teile bestätigen und laden — **mit eingeschaltetem zweitem
   Faktor** —, und danach nachsehen, dass im Sicherheitsprotokoll **keine**
   Zeile `bestaetigung.fehl` steht. *Und der eine Handgriff, der wirklich
   zählt: einen Teil in eine **Zweitanlage** einspielen, nicht in die
   laufende.*
2. **Beide Netze am echten Wirt** (0.13.0, offen seit dem 28. August). Über
   HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
   `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

**Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**
*Der Weg zum Export hat sich mit dieser Runde geändert — er liegt jetzt im
Abschnitt „Datenbank"; die Prüfung selbst ist dieselbe.*

---

## 17. Offen geblieben

* **Der volle Gegenprobenlauf steht weiterhin aus** — jetzt über **300**
  Rückbauten. *Er ist seit elf Runden nicht ganz gefahren.* **Die Rechnung:**
  300 Rückbauten zu je einem vollen Prüflauf sind bei rund 5 min 20 s je Lauf
  etwa **26,7 Stunden** hintereinander, in vier Nebenspuren rund sieben.
  **Und die Auflage aus 0.14.0 gilt weiter:** er lässt sich **nicht neben dem
  Bauen** fahren — `gegenprobe.js` zieht seine Kopie aus `git archive HEAD`,
  und ein Commit mitten im Lauf verschiebt die Grundlage. *Gefahren sind die
  dieser Runde, einzeln und vollständig (Abschnitt 12).*
* **Die Tags `v0.12.3` bis `v0.16.0` sind nicht geschoben.** Es ist **kein**
  Problem der GitHub-Rechte: der Git-Proxy der Arbeitsumgebung weist
  `POST /git-receive-pack` mit `refs/tags/*` mit **403 ohne einen einzigen
  GitHub-Header** ab — GitHub sieht die Anfrage nie. **Sie warten auf den Merge
  des Arbeitsbranches**; die Befehle stehen im Projektstand, Abschnitt 8.
* **`renderDetail()` mit 1995 Zeilen** ist die nächste große Adresse. Sie steht
  seit dieser Runde bei jedem Lauf schwarz auf weiß da.
* **Der Rechner zur Gewichtung** (Punkt 4b) — Projektstand, Abschnitt 10.
* **Bewertungen von vor 0.16.0 tragen keinen Zeitpunkt** und bleiben für die
  Glocke unsichtbar. *Das ist kein Mangel, sondern die Aussage der leeren
  Zelle; die Zahl steht beim Einspielen im Protokoll.*
