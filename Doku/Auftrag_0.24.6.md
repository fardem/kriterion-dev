# Auftrag 0.24.6 — „Der Rückfall sagt, welche Sprache er wirklich zeigt"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** 0.24.5 hat die Sprachpille
über den drei Verwaltungskarten repariert, und der Betreiber hat sie am
9. September 2026 am laufenden Programm abgenommen: **„ja es funktioniert."**
*Mit einem Nachtrag, und der ist ein eigener Befund:* **sobald für eine Zeile
weder die gezeigte noch die Vorgabesprache einen Eintrag hat, zeigt die Karte
den Namen einer dritten Sprache — und behauptet im Vermerk, es sei die
Vorgabesprache.** „Kein Eintrag" stimmt; die genannte Sprache stimmt nicht.

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„Geht es als fallback auf
> deutsch (besser wäre englisch da es ja existiert) aber zeigt an das kein
> eintrag gibt (stimmt) aber sagt das es turkisch (stimmt nicht) anzeigt. Das
> betrifft alle Kacheln dieser drei wofür es keine Eingabe gab. Wenn für alle
> Sprachen Eingaben gab, funktioniert es auch gut."*

**Die Lage, in der es auffällt:** die Vorgabesprache der Installation wird auf
eine Sprache gestellt, **für die es noch nicht überall Einträge gibt** — hier
von Deutsch auf Türkisch. *Deutsch und Englisch sind gepflegt, Türkisch noch
nicht.*

Aufsetzend auf **0.24.5** — *am 9. September 2026 vom Betreiber am laufenden
Programm abgenommen; der Fingerprint steht noch aus.*

> ## DIE FRAGEN WERDEN VOR DEM BAUEN MIT DEM BETREIBER DURCHGEGANGEN
>
> **Regel aus Abschnitt 11 des Projektstands.** 0.24.5 war die erste Runde, die
> sie angewandt hat, und die Antwort auf F3 hat dort eine Frage beantwortet,
> die im Papier gar nicht stand. *Die Spalte „Vorschlag von Claude" ist ein
> Vorschlag und keine Antwort.*
>
> **STAND: SECHS FRAGEN, ALLE OFFEN.**

---

## Zuerst: die Fragen, die vor der ersten Zeile zu klären sind

| # | Frage | Vorschlag von Claude |
|---|---|---|
| **F1** | **Nummer 0.24.6?** *Eine Reparatur an dem, was 0.24.5 gebaut hat — und zugleich an einer Entscheidung aus 0.24.3.* | **Ja, 0.24.6, und nur Reparatur.** *Gewöhnliches SemVer: PATCH. **Der Funktionswunsch „Potenzial abschaltbar" gehört NICHT hierher** — er ist eine Funktion und braucht eine MINOR-Nummer; er steht im Fahrplan unter 0.25.0* |
| **F2** | **Wie lautet die Rückfallkette?** *Heute: eingetragen für die gezeigte Sprache → Name der Grundzeile → was hereinkam. Der dritte Schritt ist der Fehler — er nimmt die Antwort in der LESERsprache und nennt sie trotzdem Vorgabesprache.* | **Drei Schritte, und der dritte wird ausdrücklich:** eingetragen → Vorgabesprache → **irgendeine Sprache, die wirklich einen Eintrag hat**, in der kanonischen Reihenfolge des Vorrats. *„Besser wäre Englisch, da es ja existiert" — genau das.* **Und der Vermerk nennt die Sprache, die WIRKLICH dasteht**, nicht die, die gemeint war |
| **F3** | **Was ist die Grundzeile nach einem Wechsel der Vorgabesprache?** *Gemessen am 9. September 2026: stellt man die Vorgabe von `en` auf `tr`, trägt die Tafel `tr` plötzlich den Text der Grundzeile — den nie jemand auf Türkisch eingegeben hat — und `en` steht leer da, obwohl der Name dort steht.* | **Nichts an der Ablage ändern, aber es nicht mehr behaupten.** *Die Grundzeile trägt keinen Sprachvermerk und kann keinen bekommen, ohne dass eine Datenbankstufe daraus wird (0.24.3, Bauabschnitt 6a). **Der kleinere Weg:** die Tafel der Vorgabesprache wird als das gekennzeichnet, was sie ist — der Name der Grundzeile —, und die Karte sagt es. **Der größere Weg** wäre eine Spalte `language` an der Grundzeile samt Migrationsblock; das ist eine eigene Runde und nicht diese* |
| **F4** | **Werden die Namenstafeln nach einem Wechsel der Vorgabesprache nachgezogen?** *Heute nicht: `sendLanguages()` zieht `LANGUAGES` nach, `NAMES_ALL` nicht — und damit rechnet die Karte mit einer neuen Vorgabesprache auf einer alten Tafel. **Es ist derselbe Fehlertyp wie D2 der Runde 0.24.5**, nur eine Stelle weiter.* | **Ja, und aus derselben Antwort.** `PUT /api/settings` gibt die beiden Tafeln zurück, wenn sich Vorgabe oder Vorrat ändern, und `sendLanguages()` nimmt sie an — dieselbe Zeile wie `takeVocabulary()` beim Sprachwechsel des Lesers. *Kein zweiter Abruf, kein Zwischenspeicher, der gepflegt werden muss* |
| **F5** | **Wie weit geht der Prüfstand?** | **Die Tafel von 0.24.5 bekommt eine zweite Achse: die Vorgabesprache.** *Drei Vorgabesprachen × drei Pillen an einer Zeile ohne Übersetzung — neun Zellen, jede mit dem Namen UND der genannten Sprache als Sollwert.* **Dazu am laufenden Server:** die Tafel nach einem Wechsel der Vorgabesprache, gegen das gemessene Bild von oben |
| **F6** | **Augenschein?** | **Ja, klein: zwei Bilder** — dieselbe Karte vor und nach dem Wechsel der Vorgabesprache. *Der Befund ist am Bildschirm entstanden* |

---

## Der Befund — gemeldet am 9. September 2026, mit vier Bildern

**Am Bildschirm:** Karte „Kategorien", Pille **Türkçe**, drei Zeilen — und unter
jedem Namen steht *„(nicht eingetragen — es steht Türkçe)"*, während der Name
selbst deutsch ist (`1_Datenträger_de`, `KI_de`, `Product_de`). **Dasselbe an
beiden Kriterienkarten.** *An einer Karte, für die alle drei Sprachen gepflegt
sind, stimmt weiterhin jede Zelle — der Betreiber hat es mit Bild belegt.*

**Drei Teile, und sie hängen zusammen:**

### E1 · Die Tafel folgt der Vorgabesprache, die Ablage nicht

**Gemessen am laufenden Server, 9. September 2026.** Eine Kategorie mit dem
Namen `Product_en` in der Grundzeile und `Product_de` als deutscher
Übersetzung; die Vorgabe der Installation ist `en`:

```
VORHER  (Vorgabe en):  {"de":{"1":"Product_de"},"en":{"1":"Product_en"},"tr":{}}
NACHHER (Vorgabe tr):  {"de":{"1":"Product_de"},"en":{},              "tr":{"1":"Product_en"}}
```

***Türkisch trägt danach einen Eintrag, den nie jemand auf Türkisch eingegeben
hat, und Englisch steht leer da, obwohl der Name dort steht.*** Der Grund ist
kein Fehler von 0.24.5, sondern die Bauform von 0.24.3: **die Grundzeile trägt
keinen Sprachvermerk**, und `baseLanguage()` schreibt sie derjenigen Sprache
zu, die *gerade* Vorgabe ist. **Neu ist nur, dass man es jetzt sieht** — bis
0.24.4 hat niemand die Tafel je zu Gesicht bekommen.

### E2 · Der Vermerk nennt die Sprache, die er zeigen wollte

**Am Quelltext ablesbar**, `namesFrom()` in `public/app.js`:

```
const back = fallback[z.id];
return { ...z, name: back !== undefined ? back : z.name, nameFallback: base };
```

**Ist auch für die Vorgabesprache nichts eingetragen, fällt der NAME auf
`z.name` zurück** — das ist die Antwort des Servers in der Sprache des
**Lesers** — **und der VERMERK sagt trotzdem `base`.** *Zwei Angaben in
derselben Zeile, aus zwei verschiedenen Quellen, und sie widersprechen sich.*

### E3 · Die Tafel wird nach einem Wechsel der Vorgabesprache nicht nachgezogen

`sendLanguages()` in `public/app.js` nimmt `LANGUAGES` aus der Antwort an und
zeichnet neu — **`NAMES_ALL` bleibt, wie es war.** Danach rechnet die Karte mit
der **neuen** Vorgabesprache auf der **alten** Tafel, und in dieser Lage ist
E2 nicht die Ausnahme, sondern der Normalfall.

> **DAS IST DERSELBE FEHLERTYP WIE D2 DER RUNDE 0.24.5** — ein Zustand im
> Browser, den jemand nachziehen muss, und eine Stelle, an der es niemand tut.
> *0.24.5 hat den Zwischenspeicher abgeschafft und die Tafel an zwei Stellen
> nachgezogen (Start und `adminNew`). **Die dritte Stelle ist übersehen
> worden.***

---

## Was ausdrücklich NICHT gebaut wird

* **Keine Datenbankstufe.** Eine Spalte `language` an den Grundzeilen wäre der
  saubere Weg für E1 und ist eine eigene Runde *(F3)*.
* **`localeOf(req)` bleibt unangetastet** — wie in 0.24.5.
* **Nichts am Vokabular.** Es ist von allen dreien nicht betroffen: seine Tafeln
  tragen je Sprache nur Eingetragenes und kennen keine Grundzeile.
* **Der Funktionswunsch „Potenzial abschaltbar" gehört nicht in diese Runde**
  *(F1)* — er steht im Fahrplan unter 0.25.0.

---

## Der Prüfstand — was er halten muss

1. **`npm test` grün**, jede neue Prüfung mit **gefahrener** Gegenprobe.
2. **Die neun Zellen der zweiten Achse sind nachgestellt, bevor repariert
   wird** — rot, und durch die Reparatur grün.
3. **Der Vermerk nennt die Sprache, deren Name wirklich dasteht** — geprüft an
   einer Zeile, für die weder die gezeigte noch die Vorgabesprache etwas trägt.
4. **Nach einem Wechsel der Vorgabesprache stimmt die Karte ohne Neuladen.**
5. **Die 27 Zellen und die neun der Kachel „Vokabular" bleiben grün.**

---

## Die Dokumente

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.24.6.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_6.md` | `git mv`, Revision 72 |
| `Doku/Fahrplan.md` | die Runde |
| `CHANGELOG.md` · `package.json` · `README.md` | die Nummer aus **F1** |
