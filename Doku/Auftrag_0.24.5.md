# Auftrag 0.24.5 — „Die Pille sagt, welche Sprache sie zeigt"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** Seit 0.24.3 tragen
Kategorien und Kriterien einen Namen **je Sprache**, und über jeder der beiden
Verwaltungskarten steht eine Pillenreihe, mit der man zwischen diesen Sprachen
umschaltet. **Sie tut es nicht.** Der Betreiber hat am 8. September 2026 alle
neun Kombinationen aus drei Lesersprachen und drei Pillen an zwei Karten
durchprobiert — **achtzehn Zellen, zwölf davon falsch.** Eine Zelle zeigt
sogar eine Sprache, die weder der Leser liest noch die Pille meint noch die
Installation vorgibt. *Diese Runde stellt alle achtzehn Zellen im Prüfstand
nach und repariert dann.*

> **UND DIE KACHEL „VOKABULAR" TUT ES RICHTIG.** *Vom Betreiber
> ausdrücklich nachgetragen, und es ist die wichtigste Angabe des ganzen
> Befunds:* dieselbe Pillenreihe, derselbe Bildschirm, dieselbe Bauform — **und
> dort stimmt jede Zelle.** Der Unterschied liegt nicht in der Karte, sondern
> in der Klempnerei darunter, und **damit zeigt die funktionierende Karte die
> Antwort für die kaputte.** *Siehe „Die Kachel nebenan" weiter unten.*

**Es ist derselbe Fehlertyp wie B1/B2 der Runde 0.24.4, zwei Karten weiter —
und diesmal am anderen Ende.** Dort lag es am **Schreibweg**: die Kachel legte
für jedes leere Feld eine Vorgabe in die Ablage. Hier liegt es am
**Leseweg**: die Karte fragt den Server nach einer Sprache, und der Server
hört die Frage gar nicht.

Aufsetzend auf **0.24.4, Fingerprint `5c762c71`** — *am 8. September 2026
eingespielt und vom Betreiber aus der laufenden Installation gemeldet.*

> ## DIE FRAGEN WERDEN VOR DEM BAUEN MIT DEM BETREIBER DURCHGEGANGEN
>
> **Das ist die Regel aus 0.24.4, Projektstand Abschnitt 11, und dies ist die
> erste Runde, die sie anwendet.** *In 0.24.4 sind die zehn Antworten aus der
> Vorschlagsspalte in das Papier gewandert und gebaut wurde darauf; drei
> Entscheidungen fielen hinterher anders aus, und alle drei waren ein zweites
> Mal zu bauen.*
>
> **Die Spalte „Vorschlag von Claude" unten ist ein Vorschlag und keine
> Antwort.** Gebaut wird erst, wenn jede Zeile eine Antwort des Betreibers
> trägt und diese hier eingetragen ist.
>
> **STAND: ALLE ACHT BEANTWORTET.** *F1 am 8. September 2026 (die Nummer), F2
> gegenstandslos, und die sechs offenen sind am selben Tag vor der ersten Zeile
> gestellt und beantwortet worden — die Antworten stehen unten in der Tafel.*
> **Damit ist dies die erste Runde, die die Regel wirklich anwendet.**

---

## Zuerst: die Fragen, die vor der ersten Zeile zu klären sind

| # | Frage | Vorschlag von Claude | **Antwort des Betreibers, 8. September 2026** |
|---|---|---|---|
| **F1** ✅ | **Welche Nummer — 0.25.0 oder 0.24.5?** *Der Betreiber: „ich würde gerne das in den 0.25.0 falls Platz ist aufnehmen. Wenn nicht, müssen wir das mit 0.24.5 beheben."* | **BEANTWORTET am 8. September 2026: 0.24.5.** *„Auftrag für 0.24.5."* — **Der Vorschlag lautete ebenso, und die Begründung bleibt stehen:** *Drei Gründe: (1) es ist ein Fehler in dem, was 0.24.3 und 0.24.4 gebaut haben — er gehört in dieselbe Reihe wie die Sache, die er kaputt macht; (2) 0.25.0 ist ausdrücklich die Runde der **kleinen** Fehler (fünf Einzeiler und eine Messung) — dieser Befund ist der größte Einzelposten weit und breit und würde den Zuschnitt der Runde sprengen; (3) 0.25.0 hat eine **Messung** vor sich (die Sekunde in der Übersicht), und eine Runde mit Messung ist keine, auf die ein Feldfehler wartet.* **Eine PATCH-Nummer für eine Reparatur ist gewöhnliches SemVer** — sie öffnet die benannte Abweichung von 5.1 nicht wieder, die mit 0.24.4 endet | **0.24.5** — wie vorgeschlagen |
| **F2** ⛔ | **Oder doch noch in 0.24.4 hinein?** | **GEGENSTANDSLOS seit dem 8. September 2026** — *0.24.4 ist gemergt und am Wirt* (`5c762c71`). **Die Frage hatte genau ein Zeitfenster, und es ist zu.** *Was daraus folgt und im Papier bleiben soll: die Installation läuft bis 0.24.5 mit einer Pillenreihe, die einem angemeldeten Leser nie etwas anderes zeigt als seine eigene Sprache — **das gehört in das CHANGELOG von 0.24.5 als bekannter Stand und nicht nur in die Reparatur*** | **gegenstandslos** |
| **F3** | **Wie kommt eine Karte an eine FREMDE Sprache?** *Heute holt sie sie nach und schickt `Accept-Language: <code>` — und `localeOf(req)` fragt zuerst den **persönlichen Schlüssel**, der den Kopf schlägt. Die Reihenfolge ist für **Meldungen** richtig und darf nicht fallen.* | **Wie die Kachel „Vokabular" es tut: gar nicht nachholen.** *Der Server liefert dem Systembereich die Namen **aller freigegebenen Sprachen auf einmal**, die Pille schaltet **örtlich** um — genau wie `vocabulariesOwn` seit 0.24.4. **Damit fallen D1, D2 und D3 zusammen weg:** kein zweiter Abruf, kein Zwischenspeicher, kein Zustand „wird gerade geholt", und die Karte kann gar nicht mehr etwas anderes zeigen als das, wonach gefragt ist.* **Der kleinere Weg wäre ein ausdrücklicher Parameter** (`?language=tr`), gegen den Vorrat geklemmt — *er repariert D1, lässt D2 und D3 aber stehen und ist damit die halbe Antwort* | ***„Wir müssen die Rollen betrachten. Ein admin und Eigentümer muss ja die Felder pflegen und auch editieren, eintragen etc. Für den kann man alles auf einmal holen. Und beim umschalten entsprechende anzeigen. Der normale User soll nicht mal die Pille über den Kachel sehen können. Er sieht nur die Bezeichnungen der Sprache den er im persönlichen Bereich eingestellt hat"*** — **der Weg der Vokabelkachel, und dazu eine Rollenfrage, die der Vorschlag nicht gestellt hatte: die Tafeln gehen nur an den Admin** |
| **F4** | **Was zeigt die Pille, wenn für ihre Sprache NICHTS eingetragen ist?** *Heute steht der Name der Grundzeile da, und niemand sieht, dass er ein Rückfall ist.* | **Der Rückfall steht da UND sagt, dass er einer ist** — dieselbe Antwort wie bei den vierzehn Vokabelwörtern in 0.24.4 (B2/B4): *ein Feld, in dem der Rückfall wie ein Eintrag aussieht, macht beim nächsten Speichern einen daraus.* **Wie er es sagt, ist die Unterfrage:** gedämpft, mit Vermerk „(Vorgabe: …)", oder als eigene Spalte | ***„Wenn die Felder von defaultsprache gefüllt sind werden sie vorgezogen. Ist da auch nicht wird die Vorgabe genommen. Und gerne gedämpft der Hinweis das dies ein fallback ist und for die ausgewählte Sprache keine Eingabe existiert"*** |
| **F5** | **Der Zwischenspeicher `NAMES_FETCHED`: reparieren oder abschaffen?** *Er wird beim Umbenennen und beim Anlegen geleert — beim **Wechsel der eigenen Sprache** nicht.* | **Abschaffen** — *wenn F3 den Weg der Kachel „Vokabular" nimmt, hat er keinen Zweck mehr: was schon da ist, muss man nicht merken.* **Bleibt es beim Parameter,** dann reparieren und schärfen: leeren bei jedem Wechsel der Lesersprache, und solange der Abruf läuft, **nicht** die Liste des Lesers zeigen — sie sieht aus wie eine Antwort und ist keine | **Abschaffen, samt `fetchNames()`** |
| **F6** | **Bekommt die Karte „Kategorien" dieselbe Dreiteilung wie „Vokabular"?** *(eingetragen · wirksam · Vorgabe)* | **Nein, nicht in dieser Runde.** *Die Liste ist eine Liste und kein Formular mit vierzehn Feldern; drei Tafeln nebeneinander wären hier Aufwand ohne Leser. **Ein Vermerk je Zeile genügt** (F4)* | **Nein, nicht in dieser Runde** |
| **F7** | **Wie viele Zellen hält der Prüfstand?** | **Alle achtzehn**, als Tafel und nicht als Stichprobe — *drei Lesersprachen × drei Pillen × zwei Karten, jede Zelle mit ihrem Sollwert daneben. Der Befund ist als Tafel gemeldet worden; er wird als Tafel nachgestellt.* **Dazu neun weitere an der Kachel „Vokabular" als GEGENSTÜCK** — *sie ist heute richtig, und eine Reparatur nebenan darf sie nicht mitnehmen. Eine Vergleichsgruppe, die vorher grün ist und grün bleibt, ist der billigste Schutz, den diese Runde haben kann* | **Alle — und mit dem Nachtrag des Betreibers sind es 27 statt 18** *(„Kategorien, Bewertungen - Kriterien, potential-kriterien")*, dazu die neun der Kachel „Vokabular" als Vergleichsgruppe |
| **F8** | **Wird der Augenschein noch einmal gefahren?** | **Ja, aber klein** — die zwei Karten in drei Sprachen, sechs Bilder. *Der Fehler ist am Bildschirm gefunden worden und nicht im Prüfstand; er gehört auch am Bildschirm abgenommen* | **Ja, klein: drei Bilder** |

---

## Der Befund — achtzehn Zellen, gemeldet am 8. September 2026

**Gemessen vom Betreiber am laufenden Programm**, an zwei Karten und mit
je drei Einstellungen „persönlich". *Nicht berichtet, sondern durchprobiert —
und deshalb ist es eine Tafel und kein Satz.*

### Karte 1 — alle drei Sprachen sind eingetragen („Potenzial: Kriterien")

*Eingetragen: `Kriterien` (de), `criteria` (en), `ölçütler` (tr).*

| persönlich | Kopf der Karte | Pille **Deutsch** | Pille **English** | Pille **Türkçe** |
|---|---|---|---|---|
| **Deutsch** | Potenzial: Kriterien | Deutsch ✅ | **Deutsch** ❌ | **englisch** ❌ |
| **englisch** | Potential: criteria | **englisch** ❌ | englisch ✅ | **englisch** ❌ |
| **Türkisch** | Potansiyel: ölçütler | **englisch** ❌ | **Deutsch** ❌ | Türkisch ✅ |

### Karte 2 — Deutsch und Englisch eingetragen, Türkisch NICHT („Kategorien")

| persönlich | Kopf der Karte | Pille **Deutsch** | Pille **English** | Pille **Türkçe** |
|---|---|---|---|---|
| **Deutsch** | Kategorien | Deutsch ✅ | **Deutsch** ❌ | **englisch** ❌ |
| **englisch** | Categories | **englisch** ❌ | englisch ✅ | **englisch** ❌ |
| **Türkisch** | Kategoriler | **englisch** ❌ | **Deutsch** ❌ | Deutsch *(Rückfall)* ✅ |

> **DER KOPF DER KARTE STIMMT IMMER.** „Kategorien", „Categories",
> „Kategoriler" — er kommt aus der Sprachdatei und folgt dem Leser, wie er
> soll. **Falsch ist allein die LISTE darunter**, und die kommt vom Server.
>
> **UND EINE ZELLE IST DER SCHLÜSSEL ZUM GANZEN:** *Karte 1, Leser Deutsch,
> Pille Türkisch → **englisch**.* **Englisch ist dort weder die Sprache des
> Lesers noch die der Pille noch die Vorgabe der Installation** — die ist
> Deutsch, das belegt die letzte Zelle von Karte 2 *(Türkisch nicht
> eingetragen, gezeigt wird Deutsch, und das ist der richtige Rückfall auf die
> Grundzeile)*. ***Eine Liste, die aus keiner dieser drei Sprachen stammen
> kann, stammt nicht aus der Anfrage — sondern aus einem Zwischenspeicher.***

---

## Was am Quelltext schon feststeht — und was ausdrücklich nicht

> **ZWEI BEFUNDE SIND AM QUELLTEXT ABLESBAR UND KEINE VERMUTUNG.** Sie stehen
> hier mit Datei und Zeile, damit die Runde nicht bei null anfängt.
>
> **DIE URSACHE DER ACHTZEHN ZELLEN IST DAMIT NICHT ERKLÄRT.** *In 0.24.4 war
> der Verdacht des Auftrags am Quelltext plausibel und am laufenden Programm
> falsch — die Regel „erst nachstellen, dann reparieren" hat sich in genau
> dieser Lage bezahlt gemacht. Sie gilt hier wieder.*

### D0 · Die Kachel nebenan tut es richtig — und sie zeigt, warum

**Der Betreiber hat es nachgetragen, und es ist der Schlüssel:** *„Vokabular
funktioniert aber so wie erwartet."* **Dieselbe Pillenreihe, derselbe
Bildschirm, dieselbe Bauform — und dort stimmt jede Zelle.**

**Der Unterschied ist die Klempnerei, und er ist in einem Satz gesagt: die
Vokabelkachel holt nichts nach.**

| | Kachel „Vokabular" *(richtig)* | Karten „Kategorien" / „Kriterien" *(falsch)* |
|---|---|---|
| woher die fremde Sprache kommt | **schon da** — `GET /api/settings` liefert `vocabulariesOwn` und `vocabularyDefaults` für **alle** Sprachen auf einmal *(0.24.4)* | **wird nachgeholt** — `fetchNames(code)`, ein zweiter Abruf je Sprache |
| was die Pille tut | schaltet **örtlich** um, aus Daten, die im Browser liegen | stößt einen Abruf an und zeichnet neu |
| was der Server dabei entscheidet | **nichts** — er hat alles schon geliefert | `localeOf(req)`, also die Sprache des **Lesers** |
| Zwischenspeicher | **keiner nötig** | `NAMES_FETCHED`, und er überlebt den Sprachwechsel |

> **DARAUS FOLGT DIE RICHTUNG, UND SIE IST NICHT ERFUNDEN, SONDERN
> ABGESCHAUT.** *Die Kachel „Vokabular" ist in 0.24.4 genau deshalb auf drei
> Tafeln umgebaut worden — eingetragen, wirksam, Vorgabe —, und seither kann
> sie nicht mehr lügen, weil sie nichts mehr zu holen hat.* **Die beiden
> Namenskarten sind bei der Bauform von 0.24.3 stehen geblieben.**
>
> ***Eine Karte, die für die Anzeige einer fremden Sprache einen Server fragen
> muss, hat drei Wege, sich zu irren. Eine, die alles schon hat, hat keinen.***

### D1 · Die Karte fragt nach einer Sprache, die der Server nicht hört

**`fetchNames(code)`** in `public/app.js` holt die beiden Listen mit
`api('GET', '/api/product-categories', undefined, false, code)` — und der
fünfte Wert von `api()` wird zu **`Accept-Language: <code>`**.

**Beide Wege antworten in `localeOf(req)`** *(`server.js`,
`app.get('/api/criteria', …)` und `app.get('/api/product-categories', …)`)*,
und `localeOf(req)` fragt **zuerst den persönlichen Schlüssel**:

```
const chosen = req.user ? getUserSetting(req.user.id, 'language', null) : null;
if (typeof chosen === 'string' && pool.includes(chosen)) return chosen;
return acceptedLanguage(req, pool) || languageDefault();
```

***Wer eine persönliche Sprache gesetzt hat — und das hat in dieser Karte
jeder —, bekommt auf JEDE Pille die Liste seiner EIGENEN Sprache.*** Der Kopf
wird nie gelesen. **Die Reihenfolge in `localeOf` ist nicht falsch:** für
Meldungen ist sie genau richtig und in 0.24.3 so beschlossen. **Falsch ist,
diesen Kopf als Frage nach einer fremden Sprache zu benutzen** — er ist die
Antwort auf „in welcher Sprache sprichst du mit mir", nicht auf „welche
Namenstafel meinst du".

### D2 · Der Zwischenspeicher überlebt den Sprachwechsel des Lesers

**`NAMES_FETCHED`** in `public/app.js` merkt sich die Listen je Sprachkennung.
Sein Kommentar sagt: *„geleert wird er, sobald sich etwas ändert."* **Das
stimmt für das Umbenennen und das Anlegen** — beide leeren ihn. **Beim
Wechsel der eigenen Sprache wird er nicht geleert:** der Handler der
Sprachpille in „Darstellung" zieht das Vokabular nach *(`takeVocabulary`,
Befund B9 aus 0.24.4)*, die Sprachdatei und die ganze Ansicht — den
Namensspeicher nicht.

**Zusammen mit D1 heißt das:** was unter dem Schlüssel `tr` im Speicher liegt,
ist in Wahrheit die Liste der Sprache, die der Leser las, **als er die Pille
das erste Mal drückte** — und die kann eine ganz andere sein als die, die er
jetzt liest. ***Das erklärt, warum dieselbe Pille für verschiedene Leser
verschiedene Sprachen zeigt, und warum eine Zelle Englisch zeigt.***

### D3 · Und eine dritte Zeile, die dazugehört

**`namesFrom()`** gibt, solange der Abruf läuft, **die Liste des Lesers**
zurück — mit dem Vermerk im Quelltext, eine leere Liste wäre schlechter, weil
sie wie „nichts angelegt" aussähe. *Das ist richtig gedacht und trotzdem
falsch: eine Liste in der falschen Sprache sieht nicht aus wie „wird
geladen", sondern wie eine Antwort.* **Sie ist der dritte Weg, auf dem die
falsche Sprache in die Karte kommt.**

---

## Bauabschnitt 1 — die achtzehn Zellen NACHSTELLEN, bevor eine Zeile fällt

**Die Tafel oben wird zur Prüfgruppe, bevor irgendetwas repariert wird.**

* **Ein Bestand mit zwei Karten und drei Sprachen:** ein Kriterium mit Namen
  in `de`, `en`, `tr`; eine Kategorie mit Namen in `de` und `en` und **ohne**
  `tr`. *Genau der Fall, den der Betreiber gestellt hat — mit und ohne
  Übersetzung, sonst belegt die Gruppe die Hälfte nicht.*
* **Drei Zugänge oder ein Zugang, der die Sprache wechselt?** ***Beides.***
  *D2 hängt an der Reihenfolge innerhalb EINER Sitzung; ein Prüfstand, der
  jede Zelle frisch aufsetzt, sieht ihn nie. **Eine der beiden Gruppen läuft
  deshalb als Folge:** Pille drücken, Sprache wechseln, dieselbe Pille noch
  einmal.*
* **Jede der achtzehn Zellen steht mit ihrem Sollwert da**, und die Gruppe ist
  **rot**, bevor repariert wird. *Wie viele Zellen wirklich rot sind, sagt
  der Lauf und nicht dieses Papier.*

* **Und die Kachel „Vokabular" läuft als VERGLEICHSGRUPPE mit** *(F7)* —
  dieselben neun Kombinationen, **grün vor der Reparatur und grün danach**.
  *Sie ist der Beleg dafür, dass die Prüfgruppe die Wirklichkeit trifft: eine
  Gruppe, die überall rot ist, hat womöglich nur den Prüfstand falsch
  aufgesetzt. Eine, die genau dort rot ist, wo der Betreiber es gemeldet hat,
  und genau dort grün, wo er es für richtig befunden hat, misst die Sache.*

> **WIRD EINE ZELLE GRÜN, DIE DER BETREIBER ALS FALSCH GEMELDET HAT, IST DAS
> EIN BEFUND UND KEIN GRUND ZUM WEITERGEHEN.** *Dann fehlt dem Prüfstand ein
> Stück Wirklichkeit — die Reihenfolge der Klicks, ein zweiter Zugang, der
> Zustand des Speichers — und das ist zu finden, bevor repariert wird.*
> **Dasselbe gilt in die andere Richtung:** wird eine Zelle der Vokabelkachel
> rot, misst der Prüfstand etwas anderes als der Betreiber gesehen hat.

---

## Bauabschnitt 2 — die Reparatur

*Was hier steht, ist die Richtung; die Form entscheiden F3 bis F5.*

1. **Der Systembereich bekommt die Namen aller freigegebenen Sprachen auf
   einmal** *(F3, der Weg der Vokabelkachel)* — dort, wo `vocabulariesOwn`
   schon herkommt. **`F_ROUTES` steigt dabei nicht:** es ist ein Feld mehr in
   einer Antwort, die es längst gibt, und kein neuer Weg.
   *Bleibt es beim kleineren Weg, ist es ein Parameter an den zwei
   vorhandenen Wegen, gegen den Vorrat geklemmt, mit Rückfall auf
   `localeOf(req)` — auch dann steigt `F_ROUTES` nicht.*
2. **`NAMES_FETCHED` fällt weg** *(F5)* — mitsamt `fetchNames()`. *Bleibt es
   beim Parameter: leeren bei jedem Wechsel der Lesersprache, an derselben
   Stelle, an der 0.24.4 das Vokabular nachzieht.*
3. **Während nichts mehr geholt wird, kann auch nichts Falsches dastehen**
   *(D3)*. *Bleibt es beim Parameter: keine fremde Liste, solange der Abruf
   läuft.*
4. **Der Rückfall sagt, dass er einer ist** *(F4)*.

> **REPARIEREN, NICHT UMBAUEN.** Die Bauform — Zustand in einer
> Modulvariablen, Rückfall auf die Sprache des Lesers beim Neuzeichnen — ist
> dieselbe wie bei den vierzehn Vokabelwörtern und in 0.24.3 beschlossen.
> *Es ist ein Fehler in ihr und keine falsche Bauform.*

---

## Bauabschnitt 3 — der Prüfstand

* **Die Tafel aus Bauabschnitt 1** wird grün.
* **Ein Wächter am Quelltext:** kein lesender Weg, der eine Namenstafel
  ausliefert, entscheidet die Sprache allein über `localeOf(req)`.
  *Mit gefahrener Gegenprobe.*
* **Ein Wächter auf den Zwischenspeicher** — *je nachdem, was F3 wird:* er ist
  weg, oder er ist nach einem Wechsel der Lesersprache leer. *Mit gefahrener
  Gegenprobe — ein Rückbau, der ihn wiederbringt beziehungsweise die Leerung
  entfernt, macht genau die Folge-Gruppe rot und sonst nichts.*
* **Ein Wächter auf die Vergleichsgruppe:** die neun Zellen der Vokabelkachel
  stehen im Prüfstand, und zwar **namentlich als Vergleich** und nicht als
  weitere Prüfung. *Wer sie später löscht, weil sie „immer grün" ist, nimmt
  der Gruppe daneben ihren Maßstab.*
* **Jede neue Prüfung hat ihre Gegenprobe, und sie wird GEFAHREN.**

---

## Was ausdrücklich NICHT gebaut wird

* **`localeOf(req)` wird nicht angefasst.** Die Reihenfolge der drei Quellen
  ist 0.24.3 und gilt für Meldungen; wer sie für die Namen umdreht, dreht sie
  für alles um.
* **Keine zweite Wahrheit in der Adresse.** Die gezeigte Sprache bleibt
  Zustand der Karte, nicht Teil von `#/system/…` *(0.24.3 hat das ausdrücklich
  verworfen)*.
* **Keine Dreiteilung der Kategorienkarte** *(F6)*.
* **An der Kachel „Vokabular" wird nichts geändert.** *Sie ist richtig, der
  Betreiber hat es geprüft, und sie ist in dieser Runde der Maßstab. Wer den
  Maßstab mitrepariert, hat hinterher zwei Karten und keinen Vergleich.*
* **Keine Datenbankstufe.** Die Namenstabellen stehen seit 0.24.3 und reichen.
* **Nichts an den Tags** — sie tragen bewusst keinen Namen je Sprache.

---

## Der Prüfstand — was er halten muss

1. **`npm test` grün**, jede neue Prüfung mit **gefahrener** Gegenprobe.
2. **Die achtzehn Zellen sind NACHGESTELLT, bevor repariert wird** — rot, und
   durch die Reparatur grün.
3. **Eine Folge in EINER Sitzung:** Pille, Sprachwechsel, dieselbe Pille — und
   die Liste ist beim zweiten Mal dieselbe wie beim ersten.
4. **Die Kachel „Vokabular" bleibt grün** — neun Zellen, vorher wie nachher.
5. **Der Rückfall ist als Rückfall erkennbar**, wo für eine Sprache nichts
   eingetragen ist.
6. **Der Augenschein**, sechs Bilder: zwei Karten in drei Sprachen *(F8)*.

---

## Bauregeln

* **Zuerst die sechs offenen Fragen (F3 bis F8) — mit dem Betreiber
  durchgegangen, nicht aus der Vorschlagsspalte übernommen** *(Projektstand,
  Abschnitt 11)*. *F1 ist beantwortet, F2 gegenstandslos.*
* **Nachstellen vor Reparieren**, und zwar alle achtzehn Zellen.
* **Die Bauabschnitte in dieser Reihenfolge**, jeder ein eigener Commit mit
  grünem Prüfstand.
* **Die Gegenprobe wird gefahren, nicht nur geschrieben.**

---

## Die Dokumente

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.24.5.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_5.md` | `git mv`, Revision 71 — der Nachtrag zu **S11** |
| `Doku/Fahrplan.md` | die Runde, und was sie an 0.25.0 ändert |
| `Doku/Fehler_und_Ideen.md` | falls beim Bauen etwas übrig bleibt |
| `CHANGELOG.md` · `package.json` · `README.md` | die Nummer aus **F1** |

---

## Was danach offen bleibt

* **Die Detailansicht im Papierkorb** *(Schritt 2 aus 0.24.4 F7)*.
* **Das Gegenlesen der türkischen Wörterliste** — `Parola` gegen `Şifre`
  zuerst.
* **Rechts-nach-links** und **die Region je Sprache** (`de-AT` neben
  `de-DE`).
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und
  `gegenprobe.js` nennen** — Papierarbeit aus 0.24.1.
