# Konzept — „Vor dem Test schätzt man, nach dem Test bewertet man"

**Ein zweiter Sternkasten für ungetestete Einträge. Arbeitstitel des Kastens: *Potenzial*
(das Wort steht im Vokabular und ist dort änderbar).**
*Stand: 3. September 2026, geschrieben gegen Kriterion 0.19.5. Der zugehörige Auftrag
liegt daneben: `Doku/Auftrag_0.21.0.md` — eine eingeschobene Runde, siehe dort.*

---

## 1. Worum es geht

Kriterion bewertet Dinge, die man ausprobiert hat: Kriterien, Sterne, gewichteter
Durchschnitt, Sortierung „Bewertung (hoch → niedrig)". Das funktioniert, solange
ein Eintrag etwas beschreibt, das es schon gab — eine Probe, ein Modell, einen Test.

**Aber die Einträge sammeln auch Ideen.** Etwas, das man woanders gesehen hat.
Etwas, das man als Nächstes bauen oder probieren könnte. Diese Einträge stehen
heute mit dem Schalter „Ungetestet" da, und dann ist Schluss: **die Instanz kann
nicht sagen, welche dieser Ideen am ehesten dran ist.** Wer sie trotzdem mit den
vorhandenen Sternen versieht, verdirbt sich die Bewertung — die Zahl, die eigentlich
„wie gut war es" bedeutet, sagt dann bei manchen Einträgen „wie sehr will ich es".
Zwei Fragen in einem Durchschnitt, und keiner sieht es der Zahl an.

**Es sind zwei verschiedene Fragen, und beide verdienen Sterne:**

| | die Frage | wann | woraus |
|---|---|---|---|
| **Potenzial** | *Lohnt es sich, das als Nächstes zu probieren?* | vor dem Test | Bauchgefühl, Wunsch, Machbarkeit |
| **Bewertung** | *Wie gut war es?* | nach dem Test | Erfahrung, Praxis, Ergebnis |

## 2. Die Idee in drei Sätzen

Jeder Eintrag bekommt einen zweiten Sternkasten, **Potenzial**, mit eigenen Kriterien,
eigenen Gewichten und eigenem Durchschnitt. Der Admin legt diese Kriterien genauso an
wie die Bewertungskriterien, nur in einer eigenen Karte. **Die beiden Durchschnitte
kennen sich nicht** — kein Potenzialstern fließt je in die Bewertung ein, und
umgekehrt.

## 3. Was der Benutzer sieht

**Eine neue Idee anlegen.** Titel, Fotos, Kategorie, Beschreibung — wie heute. Dazu ein
offener Kasten *Potenzial* mit zwei, drei Sternzeilen (zum Beispiel *Wunsch*, *Nutzen*,
*Machbarkeit*) und der Kopfzeile „⌀ –". Der Kasten *Bewertung* steht darunter
**zugeklappt**, in seinem Kopf steht „keine Wertung". Man versteht ohne Erklärung:
hier schätze ich ein, dort wird später bewertet.

**„Getestet" einschalten.** Der Kasten *Bewertung* klappt auf, der Kasten *Potenzial*
klappt zu — und behält seine Zahl im Kopf: „Potenzial (⌀ 4,2)". Kein Dialog, keine
Rückfrage, nichts wird gelöscht. Wer nachsehen will, wie er die Sache vor dem Test
eingeschätzt hat, klappt den Kasten auf. So sieht man nach einem halben Jahr, ob das,
was man am meisten wollte, auch das Beste war.

**Die Sternzeile selbst** sieht in beiden Kästen gleich aus: Name, meine fünf Sterne,
dahinter ein kleines × (sobald ich einen Stern habe), rechts der Durchschnitt aller
oder ein Strich, solange ihn niemand erzeugt hat. Im Kopf des Kastens steht nur noch
der Name, die Durchschnittszahl und für den Admin „Stimmen". Kein langer Knopf mehr.

**Die Übersicht.** Die Kachel zeigt bei einem ungetesteten Eintrag „◆ 4,2" (das
Potenzial), bei einem getesteten „★ 3,8" (die Bewertung). Ein anderes Zeichen, damit
niemand 4,2 Potenzial für 4,2 Qualität hält. In der Sortierung stehen neben
„Bewertung (hoch → niedrig)" und „(niedrig → hoch)" zwei neue Einträge:
**„Potenzial (hoch → niedrig)"** und **„(niedrig → hoch)"**. Filter „Ungetestet" +
Filter „nicht abgelehnt" + Sortierung „Potenzial (hoch → niedrig)" — oben steht der
Kandidat. Wer das einmal als Ansicht speichert („Als Nächstes"), hat es fortan mit
einem Klick.

**Der Vergleich.** Wer mehrere Einträge nebeneinanderlegt, sieht zwei Gruppen von
Zeilen — erst die Potenzialkriterien mit ihrer Kopfzahl, dann die Bewertungskriterien
mit ihrer. Ein Eintrag ohne Sterne in einer Gruppe zeigt dort einen Strich.

**Der Systembereich (Admin).** Neben der Karte *Bewertungskriterien* steht eine zweite
Karte *Potenzial: Kriterien*. Gleiche Bedienung: anlegen, umbenennen, löschen, per
Ziehen sortieren, Gewicht setzen. Darunter ein Satz, der zu wenigen Kriterien rät.
Und in der Karte *Vokabular* ein neues Feld: das Wort *Potenzial* selbst.

## 4. Die Regeln

### 4.1 Die Trennung ist baulich, nicht per Absprache

Ein Kriterium weiß, zu welchem Kasten es gehört — *vorher* oder *nachher*. Der
Durchschnitt eines Kastens entsteht ausschließlich aus den Kriterien dieses Kastens.
Es gibt keinen Schalter, keine Ausnahme und keinen Sonderfall, in dem ein Stern des
einen Kastens in den anderen zählt. *Wer die Trennung aufheben wollte, müsste das
Kriterium löschen und neu anlegen — und dabei gehen seine Sterne sichtbar mit.*

### 4.2 Zuklappen nach Zustand — eine Regel, keine Einstellung

Heute merkt sich Kriterion je Benutzer, welche Blöcke zugeklappt sind, und das gilt
für alle Einträge zugleich. **Für die beiden Sternkästen gilt das ab jetzt nicht
mehr.** Der Zustand des Eintrags entscheidet beim Öffnen: ungetestet → Potenzial
offen, Bewertung zu; getestet → umgekehrt. Ein Klick auf die Kopfzeile ist ein Blick,
kein Befehl: er gilt, bis man den Eintrag verlässt. **Sonst hieße „ich klappe an
Eintrag 12 den Potenzialkasten auf" plötzlich „an allen Einträgen offen"** — und beim
nächsten Eintrag stünde der falsche Kasten offen, ohne dass jemand wüsste, warum.

*Das ist eine Verhaltensänderung für den Kasten Bewertung: wer ihn heute dauerhaft
zugeklappt hat, sieht ihn an getesteten Einträgen wieder offen.* Sie ist gewollt und
steht im Änderungsprotokoll.

Eine Ausnahme aus Rücksicht auf den Bestand: **trägt ein ungetesteter Eintrag aus
alten Zeiten schon Bewertungssterne, steht der Bewertungskasten offen.** Vorhandene
Daten schlagen die Regel; nichts wird versteckt, was jemand eingetragen hat.

### 4.3 Nichts geht verloren

Der Wechsel auf „Getestet" löscht keinen Stern. Der Wechsel zurück auch nicht. Die
Potenzialzahl bleibt im Kopf des zugeklappten Kastens stehen, solange der Eintrag lebt.

### 4.4 Der Name kommt aus dem Vokabular

Kriterion kennt schon änderbare Wörter — *Eintrag*, *Testtag*, *Bericht*, *Aufgabe*,
*Getestet*. **Potenzial** wird das nächste. Der Name steht damit nicht im Quelltext,
und wer lieber *Erwartung* oder *Einschätzung* sagt, stellt es in der Vokabularkarte
um.

**Warum Potenzial als Vorgabe.** Es beantwortet wörtlich die Frage, um die es geht:
*welcher Kandidat hat das meiste Potenzial?* Wunsch, Nutzen und Machbarkeit zahlen
alle darauf ein. Es ist ein Wort, es passt auf die Kachel, und es kollidiert mit
nichts, was Kriterion schon benutzt. Die Alternativen: *Erwartung* (reimt auf
Bewertung, und „Erwartung 4,5 — Bewertung 2,0" liest sich von selbst; klingt aber nach
„wie gut wird es", weniger nach „wie sehr will ich es") und *Einschätzung* (das
sauberste Deutsch für ein Urteil ohne Beleg, etwas amtlich).

**Eine Regel für alle Stellen, an denen das Wort steht:** es wird nie zu einem
zusammengesetzten Wort verbaut. „Potenzialkriterien" ginge, „Erwartungkriterien"
nicht — das Fugen-s kennt der Quelltext nicht. Also immer getrennt: *„Potenzial:
Kriterien"*, *„Potenzial (hoch → niedrig)"*, und der Admin-Knopf im Kopf heißt in
beiden Kästen schlicht *„Stimmen"*.

### 4.5 Die Sternzeile: × statt Knopf, Strich statt Leere, kein Sprung

Drei Dinge an derselben Zeile, und sie gelten in beiden Kästen.

**Das × ersetzt den langen Knopf.** Heute steht im Kopf „Meine Bewertung
zurücksetzen" — drei Zeilen auf dem Telefon — und daneben gibt es einen versteckten
zweiten Weg: Doppelklick auf die Sterne setzt ein einzelnes Kriterium zurück, mit
einem Hinweis, der nur beim Überfahren mit der Maus erscheint. Beides fällt weg.
Stattdessen steht hinter meinen fünf Sternen ein kleines **×**, sobald ich in dieser
Zeile einen Stern habe. Ein Tipp, und mein Stern in dieser Zeile ist weg. Dass es
*meiner* ist, sagt der Platz: das × sitzt an meinen Sternen, die Durchschnittszahl
daneben bleibt unberührt. Alle Kriterien auf einmal zu leeren kostet drei bis fünf
Tipps — bei einer Handlung, die selten ist und die sich durch erneutes Setzen ohnehin
heilt.

**Ein Strich, solange niemand bewertet hat.** Rechts neben den Sternen steht bei
mehreren Benutzern der Durchschnitt aller. Solange ihn niemand erzeugt hat, steht
dort „–". Das ist kein Text, sondern der Platz, der der Zahl gehört — und er sagt
„noch niemand".

**Kein Sprung mehr.** Heute ist diese Spalte null Pixel breit, solange niemand
bewertet hat; der erste Stern lässt sie aufgehen, und alle Sternzeilen rutschen nach
links, ausgerechnet unter dem Finger. Ab jetzt hat die Spalte von Anfang an die
Breite der üblichen Anzeige „⌀ 4,2 (9)", und das × hat seinen Platz, auch wenn es
gerade unsichtbar ist. Nichts bewegt sich mehr beim ersten Stern und nichts beim
zweiten Bewerter. Erst ab zehn Bewertern wächst die Spalte einmal — das ist bekannt
und hingenommen.

**Auf dem Telefon** steht der Kriterienname über den Sternen, in einer eigenen
Zeile; darunter links die Sterne mit ×, rechts der Durchschnitt. So bleibt für lange
Namen Platz, auch bei großer Schrift. Auf dem breiten Bildschirm bleibt alles
nebeneinander wie heute.

### 4.6 Wenige Kriterien

Zwei oder drei Kriterien im Potenzialkasten reichen — *Wunsch* als Schwergewicht
(Gewicht 1,5), dazu *Nutzen* und *Machbarkeit*. Mehr macht die Einschätzung
langsamer, nicht besser: sie soll in zehn Sekunden gehen. **Das ist ein Rat und kein
Verbot** — der Admin darf so viele anlegen, wie er will; die Karte sagt ihm nur, was
zu erwarten ist.

## 5. Was andere machen

Kurz nachgesehen, wie Werkzeuge für dieselbe Frage — *was als Nächstes?* — von ihren
Benutzern angenommen werden.

* **Sammlerseiten (BoardGameGeek).** Jedes Spiel, das man nicht besitzt, bekommt eine
  Wunschstufe mit Worten — *Must have, Love to have, Like to have, Thinking about it* —
  getrennt von der Note, die man nach dem Spielen vergibt. Man filtert auf „nicht
  besessen" und sortiert die Kandidaten durch. Der häufigste Wunsch der Benutzer
  danach: innerhalb einer Stufe noch einmal feiner ordnen können. *Ein einzelner Stern
  reicht vielen auf Dauer nicht — das spricht für zwei, drei Kriterien statt einem.*
* **Produktteams (ICE).** Drei schnelle Fragen je Idee — Wirkung, Sicherheit, Aufwand
  — und daraus eine Zahl, absteigend sortiert. Gilt als schnell und grob, gut für lange
  Listen kleiner Kandidaten. Die Kritik: die Werte sind subjektiv, und kleine
  Verschiebungen kippen die Reihenfolge. Der Satz, der hängen bleibt: *das beste
  Verfahren ist das, das man dauerhaft benutzt; aufwendige Modelle werden nicht
  benutzt.* Daher Regel 4.6.
* **Handreihenfolge (Steam).** Man schiebt Einträge per Hand auf Platz 1, 2, 3. Sobald
  ein Filter aktiv ist, verschwinden die Rangnummern; bei langen Listen wird das
  Umsortieren zur Qual. *Deshalb keine manuelle Reihenfolge — eine Zahl sortiert sich
  selbst und übersteht jeden Filter.*

**Lehre:** getrennte Skala ja, wenige Fragen ja, Handreihenfolge nein.

## 6. Verworfen — und warum

* **„Prioritätsliste" als Name.** Eine Liste ist ein Ort, kein Urteil. Der Name sagte
  nicht, *was* dort steht.
* **„Wunschgewichtung" als Name.** *Gewicht* ist in Kriterion belegt — es ist die Zahl
  0,2 bis 2 am Kriterium. Ein Kasten „Wunschgewichtung" mit Kriterien, die je ein
  Gewicht tragen, ergäbe „die Gewichtung der Wunschgewichtung". Dazu drei Begriffe in
  einem Wort.
* **Ein einzelner Stern statt eines Kastens.** In einer Runde fertig, berührt nichts —
  aber „will ich unbedingt, ist aber kaum machbar" lässt sich damit nicht sagen. Nach
  der Recherche (BoardGameGeek) wäre es in vier Wochen ohnehin zum Kasten ausgebaut
  worden. Dann lieber gleich.
* **Der Kopfknopf zum Zurücksetzen, nur kürzer** — als Zeichen mit Bestätigungsdialog
  oder als Textlink unter den Zeilen. Beides behielte zwei Wege für eine Sache; das ×
  an der Zeile ist der eine sichtbare Weg, und „meine" steht darin ohne Wort.
* **Manuelle Reihenfolge per Ziehen.** Eindeutig, aber je Benutzer, ohne Begründung,
  bricht an Filtern, und jeder neue Eintrag zwingt zum Nachsortieren.
* **Gewicht 0 als „zählt nicht mit".** Die billigste Lösung — ein Kriterium mit Gewicht
  0 fiele aus dem Durchschnitt. Aber die Absicht steckte dann in einer Zahl statt in
  einem Merkmal, und der Kasten mischte Potenzial- und Bewertungszeilen.
* **Worte an den Sternen** (5 = „sofort", 1 = „irgendwann"). Klang gut, passt aber nur
  zu *Wunsch*. „Machbarkeit: sofort" ist Unsinn. Worte je Kriterium wären der nächste
  Schritt — und der ist zu viel. Die Kriteriennamen tragen die Bedeutung.
* **Sterne mit Gedächtnis** — jeder Stern merkt sich, ob er vor oder nach dem Test
  vergeben wurde, bei denselben Kriterien. Elegant für einen späteren Vergleich
  „Erwartung gegen Ergebnis", aber es erlaubte keine eigenen Kriterien vor dem Test.
  Genau die sind gewollt.
* **Vorgefertigte Kriterien oder eine vorgefertigte Ansicht „Als Nächstes".**
  Kriterion legt keine erfundenen Daten an — Bewertungskriterien legt der Admin an,
  Ansichten speichert der Benutzer. Beides bleibt so; die Karte schlägt *Wunsch,
  Nutzen, Machbarkeit* nur vor.
* **Verstecken statt Zuklappen.** Der jeweils andere Kasten bleibt erreichbar. Was
  jemand eingetragen hat, ist immer einen Klick entfernt.

## 7. Grenzen und Offenes

* **Ein Name, ein Kasten.** *Wunsch* kann nicht in beiden Kästen stehen; die
  Kriteriennamen sind über beide hinweg eindeutig — wie heute.
* **Der Kasten eines Kriteriums steht mit dem Anlegen fest.** Ein späterer Wechsel
  trüge vergebene Sterne von einem Durchschnitt in den anderen. Wer ihn braucht,
  löscht und legt neu an.
* **Die Glocke zählt beide Kästen als „Bewertungen".** Sie beantwortet die Frage
  *hat jemand etwas beigetragen?*, nicht *in welchem Kasten*. Wenn das stört, ist es
  eine eigene Runde.
* **Die Kachel zeigt eine Zahl**, nicht zwei — die andere steht im Kopf des
  zugeklappten Kastens.
* **Der Vergleich „Erwartung gegen Ergebnis"** als eigene Sicht — welche Einträge
  haben ihr Potenzial eingelöst — ist mit den beiden Zahlen möglich, aber nicht Teil
  dieser Runde.

## 8. Für den, der es baut

Alles in einem Satz: **eine Spalte am Kriterium** (zu welchem Kasten es gehört), **ein
zweiter Block** im Eintrag mit demselben Zeichner, **zwei Sortiereinträge**, **eine
Karte** im Systembereich mit derselben Maschine, **ein Wort** im Vokabular, das
Austauschformat um ein Feld, **ein × an der Sternzeile** statt des Kopfknopfs und
der Route dahinter — und die Rechnung für den Durchschnitt läuft zweimal über
dieselbe Funktion, mit zwei getrennten Mengen. Kein neues Konzept; das vorhandene
zweimal. Die Einzelheiten stehen im Auftrag.

## Quellen

* BoardGameGeek, Wishlist (Wiki und Nutzerforen zur Wunschstufe):
  https://boardgamegeek.com/wiki/page/Wishlist
* ICE-Bewertung, Beschreibung und Kritik:
  https://www.productlift.dev/blog/prioritizing-with-ice-model/ ·
  https://www.kaizenko.com/scoring-frameworks-ice-rice-and-weighted-scoring-for-product-prioritization/
* Steam-Wunschliste, Nutzerforum zur Handreihenfolge:
  https://steamcommunity.com/discussions/forum/10/640179446900386592/
