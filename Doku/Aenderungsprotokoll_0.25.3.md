# Änderungsprotokoll 0.25.3 — „Zwei Felder in einer Zeile stehen auf einer Linie"

**Ein Befund vom Bildschirm · 10. September 2026 · gebaut auf 0.25.2
(`d1c126ff`).**

> **FINGERPRINT DIESER RUNDE: `a3c561d7`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**.

> **DER BETREIBER IM WORTLAUT, 10. September 2026:** *„es darf keine
> verschiebung innerhalb der zeile durch texte passieren. wenn der eine mehr
> platz braucht, nimmt sich sein nachbar auch diesen platz und sie haben beide
> die selbe höhe. schau dir bei Görev, çoğul [an]. Das darf natürlich in keiner
> sprache passieren. auch nicht bei den anderen."*

---

## Die Versionsnummer

**0.25.3 ist ein PATCH.** Eine Reparatur am Stilblatt, zwei Zeilen. Kein Weg,
keine Spalte, keine Funktion. `F_ROUTES` bleibt bei **72**.

---

## Der Befund

**Die Stelle:** `public/style.css`, `.vocabulary-grid .field`.

Das Raster stellt die vierzehn Vokabelfelder paarweise nebeneinander und
**streckt die Kästen längst auf gleiche Höhe** — das war nie das Problem. Der
**Inhalt** floss von oben nach unten: Beschriftung, darunter das Eingabefeld.
Brauchte eine Beschriftung **zwei** Zeilen und die daneben **eine**, stand das
eine Eingabefeld tiefer als das andere.

| | |
|---|---|
| **Türkisch** | *Görev, tekil (varsayılan: Görev)* — eine Zeile · *Görev, **çoğul** (varsayılan: Görev)* — zwei |
| **Englisch** | *Task, done (default: Done)* — eine Zeile · *Stars before the test (default: Potential)* — zwei |
| **Deutsch** | *Aufgabe, erledigt (Vorgabe: Done)* — eine Zeile · *Sterne vor dem Test (Vorgabe: Potential)* — zwei |

## Es trifft jede Sprache — gemessen, nicht vermutet

**Am echten Browser, ohne die Reparatur, drei Sprachen × sieben Breiten:**

| Breite | Deutsch | English | Türkçe |
|---|---|---|---|
| **1700 px** | schief | schief | schief |
| **1500 px** | schief | schief | schief |
| **1360 px** | schief | schief | schief |
| **1280 px** | *gerade* | **schief** | **schief** |
| 1180 px und schmaler | *(eine Spalte — keine Zeile, in der etwas verrutschen könnte)* | | |

**Der Betreiber hat es im Türkischen gesehen, weil dessen Beschriftungen früher
umbrechen** — ein deutscher Bildschirm derselben Breite war zufällig gerade.
*Das ist der Grund, warum es niemandem vorher auffiel, und kein Grund, es für
ein türkisches Problem zu halten.*

**Mit der Reparatur: 21 von 21 Lagen auf einer Linie.**

---

## Die Reparatur

```css
.vocabulary-grid .field { margin-bottom: 10px; display: flex; flex-direction: column; }
.vocabulary-grid .field .input { margin-top: auto; }
```

**Der Kasten wird eine Spalte, und das Eingabefeld hängt sich an die
Unterkante.** Das Raster macht die Kästen einer Zeile ohnehin gleich hoch; damit
liegen beide Eingabefelder auf derselben Linie, gleichgültig wie viele Zeilen
die Beschriftung darüber braucht.

> **KEINE FESTE HÖHE AN DER BESCHRIFTUNG**, und das ist die eigentliche
> Entscheidung. Eine Mindesthöhe müsste die längste Beschriftung **aller**
> Sprachen kennen — und wäre mit der nächsten Sprache wieder falsch. *Genau die
> Bauform, die dieser Befund verbietet.*

**AN DER ZEILE UND NICHT AN `.field` SCHLECHTHIN.** Dieselbe Klasse trägt jedes
Anmeldefeld, jeden Dialog und jede andere Karte — **36 Stellen im Quelltext**.
Dort stehen die Felder **untereinander**, und eine Unterkante zum Andrücken gibt
es gar nicht. *Das Vokabelraster ist die einzige Stelle, die Felder
nebeneinander stellt; nachgesehen wurde es, nicht angenommen.*

---

## Der Prüfstand

**`npm test` grün: 6348 Zusagen** *(0.25.2: 6343)*.

### Die neue Gruppe: „Zwei Felder in einer Zeile stehen auf einer Linie — 0.25.3"

**Geprüft wird die REGEL und nicht die LAGE.** Der Nachbau hat keine
Layoutrechnung — `getBoundingClientRect()` gibt dort Nullen zurück, und eine
Messung in Pixeln wäre eine Messung an nichts. *Was sich prüfen lässt, ist die
Zeile im Stilblatt, die die Lage erzeugt* — dieselbe Wahl wie bei der Dämpfung
am Rückfall, wo die **Klasse** geprüft wird und nicht die Farbe.

**Fünf Zusagen:** der Aufbau (beide Regeln stehen da), die Spalte, die
Unterkante, **keine feste Höhe an der Beschriftung**, und dass die allgemeine
Feldregel unangetastet bleibt.

**Die Messung selbst steht als Augenschein oben** — sie gehört in dieses Papier
und nicht in den Prüfstand.

---

## Die Gegenproben

**Eine neue: 791.** *Die Liste steht bei 782.*

| # | Rückbau | trifft |
|---|---|---|
| **791** | Die Felder einer Vokabelzeile fließen wieder von oben | der ganze Befund |

**EIN RÜCKBAU FÜR ZWEI ZEILEN, und das ist hier richtig:** sie sind **eine**
Reparatur — ohne die Spalte gibt es keine Unterkante, und ohne die Unterkante
nützt die Spalte nichts. *Zwei Rückbauten wären zwei Hälften derselben Zusage.*

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.3.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_25_3.md` | `git mv`, **Revision 76** |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |

**Der Fahrplan bleibt unangetastet** — ein PATCH schiebt keine Nummer.
