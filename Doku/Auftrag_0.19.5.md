# Auftrag 0.19.5 — „Der Ausschnitt wird gebacken, nicht gezogen"

**Vorher: Version 0.19.4 · Fingerprint `03e3b818` (am 3. September 2026 von der
laufenden Installation gemeldet — **im Feld bestätigt**) ·
5207 Prüfungen · 514 Rückbauten (höchste Nummer 522) · 292 Stolpersteine ·
`F_ROUTEN` 70 · acht Zwecke der zweiten Bestätigung · acht Migrationsblöcke ·
Austauschformat 12 · neunzehn Karten im Systembereich · neun ausgelieferte
Module**

---

> **0.19.4 IST IM FELD BESTÄTIGT — die Ableitung tut, was sie soll.** An der
> laufenden Installation nachgesehen (13 Einträge, 89 Fotos, 368,7 MB):
> jede Fotozeile trägt einen `thumb` mit **512 auf der kurzen Kante**, aus dem
> Original gerechnet. *Sky-Watcher: `4032x3024` → `512x683`. Hohem:
> `6192x4128` → `768x512`.* **Der Verdacht, die Ableitung ziehe von einer
> kleineren Variante, ist damit widerlegt.**
>
> **UND TROTZDEM IST EINE KACHEL UNSCHARF — und zwar die, an der jemand den
> Ausschnitt benutzt hat.** Das Hauptbild des Hohem steht auf `zoom = 235`;
> alle zehn anderen Fotos desselben Eintrags stehen auf 100 und sind scharf.
> *Das ist kein neuer Fehler: es ist die Grenze, die 0.19.4 gemessen und im
> Änderungsprotokoll ausdrücklich offen gelassen hat — sie tritt nur früher
> auf, als sie dort behandelt wurde.*

**DIESE RUNDE KEHRT EINE ENTSCHEIDUNG AUS 0.19.4 UM.** Dort steht: *„Die
Ableitung skaliert, sie schneidet nicht"*, mit der Begründung, ein am Server
beschnittenes `thumb` nähme dem Fokuspunkt seine Fläche. **Diese Begründung
fällt genau dann, wenn der Zuschnitt im Browser im selben Zug verschwindet** —
und nur dann. *Wer serverseitig schneidet und den CSS-Zoom stehen lässt,
schneidet zweimal.* **Beides gehört in dieselbe Runde, oder keines von beidem.**

---

## Der Befund, in einer Rechnung

Die Kachel ist **299 CSS-Bildpunkte** breit (gemessen in 0.19.4). Was sie an
Quellpunkten je Anzeigepunkt bekommt:

| | heute (`thumb` + CSS-Zoom) | gebacken aus dem Original |
|---|---|---|
| `zoom` 100 | 1,71× | 1,71× |
| **`zoom` 235** | **0,73× — 1,37fach hochgezogen** | **5,88×** |
| `zoom` 400 | 0,43× — 2,34fach | 5,88× |

**Der gebackene Weg ist von der Weite des Ausschnitts unabhängig** — das ist
der ganze Punkt. *Und er ist dabei billiger: eine 512 × 512-Kachel trägt
weniger Bytes als die heutigen 768 × 512.*

---

## Die Nummer: PATCH

**Der Maßstab ist nicht der Aufwand, sondern die Frage: kann die Installation
danach etwas, was sie vorher nicht konnte?** Nein. Dieselben Knöpfe, derselbe
Ausschnitt, dieselbe Bedienung — die Kachel zeigt ihn nur scharf.

**Kein Schema, keine Migration, kein neuer Zweck, keine neue Route, keine neue
Karte, keine neue ausgelieferte Datei.** Austauschformat **12**, `F_ROUTEN`
**70**, acht Migrationsblöcke, neun Module.

> **`focus_x`, `focus_y` UND `zoom` BLEIBEN, WIE SIE SIND.** Sie hören auf,
> eine Anweisung an den Browser zu sein, und werden das **Rezept** für die
> gebackene Kachel. *Deshalb ist es keine Schemaänderung und deshalb bleibt der
> Ausschnitt jederzeit änderbar: das Original ist unangetastet, und die drei
> Zahlen sagen, wie neu zu backen ist.*

---

## 1. Was zu messen ist, BEVOR gebaut wird

**Zwei Zahlen fehlen, und beide können die Bauform ändern.**

### A. Was der Zuschnitt beim Speichern wirklich kostet

**Vorgemessen ist nur ein synthetischer schlechtester Fall: 305 ms** — an einer
20-MB-Vorlage mit echtem Rauschen, 6192 × 4128, `extract` + `resize` +
`mozjpeg`. *Eine einfarbige Fläche derselben Maße kostete 71 ms; die Wahrheit
liegt dazwischen und hängt am Material.*

**Zu messen am echten Bestand** (die Fotos liegen mit 4,9 bis 11,7 MB da):
die Zeit für `extract` + `resize` + Kodieren je Zeile, über mehrere Fotos,
kalt und warm.

**Daran hängt eine Entscheidung, und nur daran:**

| gemessen | dann |
|---|---|
| **unter ~150 ms** | im Haupt-Thread. Eine einzelne Zeile auf ausdrücklichen Knopfdruck ist eine andere Klasse als 400 Zeilen im Hintergrund |
| **darüber** | über `starteBestandsThread` — es gibt ihn seit 0.19.3, und eine vierte Aufgabe ist eine Zeile |

*19 ms Verbindung und 76 ms `sharp` kostet der Thread; unter 150 ms lohnt er
sich nicht, darüber schon.* **Die Entscheidung fällt an dieser Zahl und nicht
am Geschmack.**

### B. Was die gebackene Kachel an Bytes kostet

**An allen 89 Fotos des echten Bestands**, gegen den heutigen Stand:
`length(thumb)` vorher und nachher, in Summe und im Mittel.

*Erwartet wird eine Abnahme — 512 × 512 sind 262k Bildpunkte gegen 393k bei
768 × 512 —, aber ein enger Ausschnitt zeigt mehr Detail auf derselben Fläche
und kodiert schlechter.* **Erwartet ist nicht gemessen.**

### C. Was NICHT mehr zu messen ist

**Die Falle mit den gedrehten Maßen ist schon gemessen** und steht in
Abschnitt 2 als Befund. *Sie ist der Grund, warum dieser Abschnitt kurz ist:
die teuerste Unbekannte war sie, und sie ist ausgeräumt, bevor die erste Zeile
fällt.*

---

## 2. Die Kachel wird gebacken

### Die Rechnung steht schon da — und das ist die Gefahr

**`masse()` in `public/app.js` rechnet sie seit 0.19.1**, für den Rahmen im
Editor:

```
seite = min(breite, höhe)          eng   = seite · 100 / zoom
links = fx/100 · (breite − eng)    oben  = fy/100 · (höhe − eng)
```

**DER SERVER MUSS DIESELBE RECHNUNG EIN ZWEITES MAL ANWENDEN, und das ist eine
zweite Wahrheit über dieselbe Sache** (Stolperstein 47). *Sie lässt sich nicht
vermeiden: der Browser muss den Rahmen live zeichnen, der Server muss backen,
und zwischen beiden liegt HTTP.* **Also gehört sie ausdrücklich gehalten:**

* **Die Formel steht auf beiden Seiten in EINER Funktion**, nicht verstreut —
  im Browser dort, wo sie steht, im Server in `bilder.js` neben der Ableitung.
* **Der Prüfstand hält sie gegeneinander:** dieselben drei Werte, dieselben
  Maße, beide Rechnungen, ein Vergleich. *Ohne diese Zusage laufen sie beim
  nächsten Anfassen auseinander, und niemand merkt es — die Kachel zeigt ja
  ein Bild, nur das falsche.*

**DIE WERTE SIND MASSSTABSFREI, und das ist der Grund, warum es überhaupt
geht:** `focus_x` und `focus_y` sind Prozent mit einer Nachkommastelle, `zoom`
ist Prozent von 100 bis 400. **Der Server braucht die Größe der Vorschau im
Editor gar nicht zu kennen.**

### DIE FALLE, UND SIE IST GEMESSEN

**`extract()` rechnet in den GEDREHTEN Maßen, `metadata()` meldet die
gespeicherten.** Nachgemessen an einem 4032 × 3024 mit EXIF-Ausrichtung 6:

```
metadata()      : 4032x3024, orientation 6
nach .rotate()  : 3024x4032
Marke, die im gespeicherten Bild oben links lag:
  nach rotate+extract bei (0,0)      → nicht dort
  nach rotate+extract bei (2824,0)   → dort
```

**Wer die Kiste aus `metadata().width/height` baut, schneidet an der falschen
Stelle** — und bei 3024 Breite läge ein `left` von 3500 sogar außerhalb, was
`sharp` mit einem Fehler quittiert. *Das ist Stolperstein 288 an einer zweiten
Stelle, und es trifft den echten Bestand: **die fünfzehn Fotos des Sky-Watcher
liegen genau so** — `4032x3024` in `data`, `1200x1600` als `medium`.*

**Gebaut wird deshalb gegen die gedrehten Maße**, und `istQuer()` aus 0.19.4
weiß bereits, wie man sie bekommt.

### Gebaut wird

**In `bilder.js`:** `makeVariants()` bekommt einen **optionalen Zuschnitt**.
Ist er gesetzt, wird `thumb` daraus gebacken; ist er es nicht, bleibt alles wie
in 0.19.4. *Ein zweiter Ableitungsweg daneben wäre eine zweite Wahrheit; es ist
dieselbe Funktion mit einem Argument mehr.*

```
sharp(buf).rotate()
  .extract({ left, top, width: eng, height: eng })
  .resize(KANTE, KANTE, { fit: 'inside', withoutEnlargement: true })
```

* **`medium` WIRD NICHT GESCHNITTEN.** Es wird mit `contain` gezeigt, also
  ganz — und der Editor zeichnet den Rahmen darauf. *Ein geschnittenes `medium`
  nähme dem Editor seine Vorlage.*
* **`withoutEnlargement` BLEIBT.** Ist der ausgeschnittene Bereich kleiner als
  die Zielkante — kleines Original, enger Ausschnitt —, wird **nicht**
  hochgerechnet. *Es kostete Bytes und trüge keinen einzigen Bildpunkt mehr;
  der Browser zieht es beim Anzeigen ohnehin auf, und das Ergebnis ist Pixel
  für Pixel dasselbe.*
* **DER DECKEL AUS 0.19.4 ENTFÄLLT FÜR DIE GEBACKENE KACHEL.** Sie ist
  quadratisch, also kann keine Kante davonlaufen. *Die Zahl bleibt in der
  Tafel stehen, solange es Ableitungen ohne Zuschnitt gibt — die
  Kommentarbilder sind genau die.*

**WELCHE ZAHL DIE KANTE HAT: 512, wie in 0.19.4 gemessen.** *Die Messung dort
gilt unverändert — sie hing an der Kachelbreite von 299 und am
`devicePixelRatio`, nicht am Ausschnitt. Was sich ändert, ist allein, dass die
512 jetzt für den **sichtbaren** Bereich gelten und nicht mehr für das ganze
Bild.*

---

## 3. Der Zuschnitt im Browser fällt weg — im selben Zug

**SONST WIRD ZWEIMAL GESCHNITTEN.** Betroffen sind genau zwei Stellen:

| Stelle | heute | danach |
|---|---|---|
| `.card-img img` (Kachel der Übersicht) | `object-fit: cover` + `object-position` + `transform: scale(var(--zoom))` | die gebackene Kachel **ist** das sichtbare Quadrat — `cover` wird zum Leerlauf, `object-position` und `--zoom` fallen weg |
| `.thumb img` (Streifen am Eintrag) | dasselbe | dasselbe |

**`.card:hover .card-img img` MUSS MIT.** Die Regel lautet heute
`scale(calc(var(--zoom, 1) * 1.03))` — ohne `--zoom` wird daraus schlicht
`scale(1.03)`. *Die drei Prozent beim Überfahren bleiben, sie hängen nur nicht
mehr am Ausschnitt.*

### Eine Stelle ändert dabei ihr Verhalten, und das gehört entschieden

**`.lb-thumb img` (der Streifen im Vollbild) zeigt heute KEINEN Ausschnitt** —
er setzt `ausschnitt()` gar nicht und zeigt einen Mittenschnitt. **Mit einer
gebackenen Kachel zeigt er den eingestellten Ausschnitt plötzlich mit.**

> **VORSCHLAG: ja, und es ist eine Verbesserung** — eine Kachel, ein Bild,
> überall dasselbe. **Aber es ist eine Verhaltensänderung und keine
> Nebensache**, und sie gehört mit ihrer Begründung ins Änderungsprotokoll.
> *Wer sie nicht will, braucht eine dritte Ableitung — und das wäre eine
> Schemaänderung und damit eine andere Runde.*

### Und eine Stelle bleibt, wie sie ist

**`.cmt-img img` (das Kommentarbild).** Kommentarbilder haben keinen Fokuspunkt
und keinen Zoom; ihr `thumb` wird weiter ohne Zuschnitt abgeleitet. *Genau
dafür ist der Zuschnitt in `makeVariants()` optional.*

---

## 4. Das Speichern des Ausschnitts rechnet die Kachel neu

**`PUT /api/photos/:id/focus`** (`server.js:3615`) schreibt heute drei Zahlen
und ist damit fertig. **Danach muss es die Kachel neu backen**, sonst zeigt die
Übersicht den alten Schnitt, bis irgendwann etwas anderes die Zeile anfasst.

* **Die Antwort kommt erst, wenn die Kachel steht.** *Anders als beim
  Umstellungslauf ist hier kein 202 angebracht: es ist eine Zeile, der
  Benutzer wartet davor, und eine Kachel, die „gleich" richtig wird, ist
  schlechter als eine, die es beim Zurückkommen ist.*
* **Wo gerechnet wird, entscheidet Messung A.**
* **Schlägt das Backen fehl, wird der Ausschnitt trotzdem gespeichert** — und
  die Zeile behält ihre alte Kachel. *Dieselbe Regel wie überall: eine
  Ableitung, die schlechter ist als die alte, gibt es nicht.*

---

## 5. Die Adresse ändert sich mit dem Inhalt

**DAS IST KEINE KÜR, SONDERN VORAUSSETZUNG.** Die Auslieferung setzt
`Cache-Control: private, max-age=86400` (`anhaenge.js:234`, gerufen mit
`maxAge: 86400` in `server.js:3552`). **Solange der Eintrag frisch ist, fragt
der Browser gar nicht erst nach** — der schwache ETag von Express wird erst
geprüft, wenn er abgelaufen ist.

**Heute fällt das nicht auf**, weil der Ausschnitt im Browser gerechnet wird:
die Kachel ändert sich sofort. **Gebacken ändert sich der INHALT unter
DERSELBEN Adresse** — und der Betreiber sähe seinen neuen Ausschnitt bis zu
24 Stunden lang nicht.

**Gebaut wird ein Merkmal an der Bildadresse**, das sich mit dem Inhalt ändert.

> **VORSCHLAG: `?v=` mit `length(thumb)`.** Es kostet nichts — `length()` auf
> einem Blob hat in SQLite seine Abkürzung (im Gegensatz zu `substr()`, siehe
> 0.19.1) —, es ändert sich mit jeder neuen Ableitung, und es braucht keine
> Spalte. *Dass zwei verschiedene Kacheln zufällig gleich lang sind, ist
> möglich; dass dieselbe Zeile nach einem Neuschnitt exakt dieselbe Länge hat,
> ist unwahrscheinlich genug für einen Cache-Schlüssel und für nichts sonst.*

**Der Wert muss dorthin, wo die Fotoliste herkommt** — `PHOTO_SPALTEN` in
`server.js` und die Stellen, die `mainPhoto` bauen. *Er ist keine Angabe über
das Bild, sondern über seine Fassung.*

---

## 6. Der Bestandslauf backt mit

**Sonst tragen die alten Zeilen einen ungeschnittenen `thumb` — und der CSS-Zoom,
der ihn zurechtgezogen hat, ist weg.** Jede Zeile mit `zoom > 100` zeigte danach
den falschen Ausschnitt, und zwar sofort nach dem Einspielen.

* **Die Aufgabe `geometrie` aus 0.19.4 wird erweitert**, nicht verdoppelt.
* **`traegtAlteGeometrie()` REICHT NICHT MEHR ALS FRAGE.** Eine Zeile mit
  `zoom = 100` und einer 512er kurzen Kante trägt die neue Geometrie *und*
  braucht trotzdem keinen neuen Schnitt — bei `zoom = 100` ist der gebackene
  Schnitt derselbe wie der ungeschnittene. **Eine Zeile mit `zoom > 100` und
  512er Kante braucht ihn dagegen.** *Die Frage lautet ab jetzt: ist die Kachel
  quadratisch und hat sie die Zielkante?* **Und sie muss wieder ein Festpunkt
  sein** (Stolperstein 290) — was der Lauf erzeugt, darf nicht zurückfallen.
* **Der Lauf läuft weiter bei jedem Start und endet nach einem Durchgang.**

---

## 7. Was ausdrücklich NICHT gebaut wird

**a) `medium` WIRD NICHT GESCHNITTEN.** Siehe Abschnitt 2 — `contain` zeigt das
ganze Bild, und der Editor braucht es.

**b) KEINE DRITTE ABLEITUNG.** Weder eine Spalte noch eine Tabelle. Wenn die
gebackene Kachel für eine der vier Anzeigestellen falsch wäre, ist das eine
Entscheidung in Abschnitt 3 — keine neue Spalte.

**c) KEIN HOCHRECHNEN AUF DIE ZIELKANTE.** Siehe Abschnitt 2.

**d) KEIN NEUER SCHWELLWERT, ab dem die Kachel `medium` nimmt.** Das war der
Vorschlag vor diesem Auftrag und ist mit ihm hinfällig — die gebackene Kachel
ist bei jedem Ausschnitt scharf, ein Schwellwert wäre eine zweite Antwort auf
dieselbe Frage.

**e) KEINE ÄNDERUNG AN `focus_x`, `focus_y`, `zoom` — weder an ihrer Spanne
noch an ihrer Genauigkeit.** *Die Prozentwerte haben eine Nachkommastelle, und
das bleibt so: an einem 6192er Original ist ein Zehntelprozent rund 4 Bildpunkte
Versatz. Wer das ändern will, misst dafür eigens.*

**f) KEINE ZEITSTEUERUNG UND KEIN KNOPF.** Das Backen hängt am Speichern des
Ausschnitts und am Bestandslauf, sonst an nichts.

**g) KEINE DYNAMISCHE ZOOM-KAPPE je Bild.** *Der Gedanke lag nahe und ist
durchgerechnet worden: die Weite so zu begrenzen, dass der Ausschnitt nie unter
die Zielkante fällt.* **Er wird nicht gebaut, aus drei Gründen — und der erste
ist eine Rechnung:**

| Vorlage | kurze Kante | max. `zoom` für 512 px | für 299 (dPR 1) | für 598 (dPR 2) |
|---|---|---|---|---|
| Hohem, im Bestand | 4128 | *über der Kappe* | *über der Kappe* | *über der Kappe* |
| Sky-Watcher, im Bestand | 3024 | *über der Kappe* | *über der Kappe* | *über der Kappe* |
| 4K-Bildschirmfoto | 2160 | *über der Kappe* | *über der Kappe* | 361 % |
| 1440p-Bildschirmfoto | 1440 | 281 % | *über der Kappe* | 241 % |
| 1080p-Bildschirmfoto | 1080 | 211 % | 361 % | 181 % |

**Die feste Kappe von 400 % liegt für jede Vorlage mit einer kurzen Kante ab
2048 px ohnehin unter der Grenze** — im echten Bestand greift eine dynamische
Kappe also kein einziges Mal.

**ZWEITENS: was danach noch weich ist, ist PHYSIKALISCH weich.** Heute ist die
Unschärfe ein Artefakt — die Bildpunkte sind im Original vorhanden und werden
nur nicht benutzt. Nach dem Backen sind sie schlicht nicht da. *Gegen Physik
hilft keine Kappe; sie verbietet nur die Wahl.*

**DRITTENS: es kostet die Maße des Originals.** `PHOTO_SPALTEN` führt weder
Breite noch Höhe — der Editor müsste sie bekommen, also über eine Spalte
(Schemaänderung) oder über ein Kopf-Lesen je Foto (die 275-ms-Klasse aus
0.19.4). **Unverhältnismäßig für einen Fall, der im Bestand nicht auftritt.**

*Wenn dort je geholfen werden soll, ist ein **Hinweis** der bessere Weg als ein
Verbot: der Server kennt nach dem Backen die Größe des Ausschnitts und kann
sagen, dass er enger ist, als das Bild hergibt. Das ist eine eigene Runde.*

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der
  Sprachwächter läuft mit, und seine Dateiliste ist gepflegt.
* **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
* **Neue Stolpersteine ab 293.** Kandidaten aus dem Befund:
  - *Eine Regel, die auf beiden Seiten der Leitung gebraucht wird, steht
    zweimal — und muss deshalb gegeneinander geprüft werden.* Der Browser
    zeichnet den Rahmen, der Server backt ihn; zwischen beiden liegt HTTP, und
    eine Abweichung zeigt sich als ein Bild, das falsch ist statt fehlt.
  - *`extract()` rechnet in den gedrehten Maßen.* Stolperstein 288 an einer
    zweiten Stelle — und diesmal wirft es nicht einmal, sondern schneidet
    daneben.
* **Neue Rückbauten ab 523**, für jeden gebauten Punkt mindestens einer. **Ein
  Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein 161).
* **Rückbauten mitgehen lassen, nicht löschen** (Stolperstein 201), wo ihr
  Suchtext sich verschiebt. *Betroffen sind mindestens 506 bis 515 — sie
  zeigen auf die Tafel und die Schleife, die diese Runde anfasst.*
* **Der Prüfstand wächst von 5207**, die Rückbauliste von 514 (höchste Nummer
  522).
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft
  ein letztes Mal gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.19.5.md`** liegt im Branch: was gebaut wurde je
  Datei, die Messungen aus Abschnitt 1 mit ihrem Aufbau, die **zurückgenommene
  Entscheidung aus 0.19.4** mit ihrer Begründung, die Entscheidung zu
  `.lb-thumb`, neue Stolpersteine (**ab 293**), die Gegenprobentabelle,
  Prüfungszahlen vorher/nachher (**vorher: 5207**), Rückbauten vorher/nachher
  (**vorher: 514, höchste Nummer 522**), Offengebliebenes.
* Die Zeile „0.19.5 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** **ABER: der
  Lauf überschreibt jede `thumb`-Spalte ein zweites Mal.** *Wiederherstellbar
  aus dem Original und den drei Zahlen, und genau deshalb keine Stufe.*
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: **das Hauptbild des Hohem
  ansehen** *(zoom 235 — es muss scharf sein)*, **den Ausschnitt verstellen und
  speichern** *(die Kachel zeigt den neuen Schnitt sofort, ohne hartes
  Neuladen)*, **den Streifen am Eintrag** *(derselbe Schnitt)* und **den
  Betrachter daneben** *(unverändert das ganze Bild)*.
* **UND DER FELDBELEG ZU 0.19.4 IST DABEI SCHON GEFÜHRT** — er gehört ins
  Änderungsprotokoll 0.19.5 und in den Projektstand: *die Ableitung zieht am
  echten Bestand vom Original, 512 auf der kurzen Kante, an 89 Fotos.*

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_19_5`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, offene Betriebspunkte, Fahrplan.
* **ABSCHNITT 5 TRÄGT DIE UMKEHR.** Dort steht seit 0.19.4 *„Die Ableitung
  skaliert, sie schneidet nicht"* mit ihrer Begründung. **Der Satz wird nicht
  gelöscht, sondern umgedreht — mit dem Datum, ab dem er nicht mehr gilt, und
  mit dem Grund** (Stolperstein 201). *Eine zurückgenommene Entscheidung ohne
  aufgeschriebenen Grund kommt in einem halben Jahr als neue zurück.*
* **DIE DREI OFFENEN PUNKTE AUS 0.19.4 WERDEN GESCHLOSSEN** — der Feldbeleg,
  der Ausschnitt als Grenze der Kachel und der Cache. *Der vierte —
  `reclaim()` ohne greifende Gegenprobe — bleibt offen.*
* **Der Fahrplan rückt NICHT.** 0.19.5 ist eine PATCH-Zahl und steht vor
  0.20.0; nichts dahinter verschiebt sich.
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2 — **mit
  Kasten**, wegen des zweiten Laufs über den Bestand.
* **DIE README WIRD NUR ANGEFASST, WENN EINE DATEI DAZUKOMMT.** *Nach heutigem
  Plan kommt keine dazu.*
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**
* **`Doku/Auftrag_0.19.4.md` fällt mit diesem Auftrag weg** — *es liegt immer
  nur einer im Repo.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

---

## Was danach offen bleibt

- **`reclaim()` am Ende des Nachziehens hat keine Gegenprobe, die greift**
  (Rückbau 516, erwartet stumm). *Dieselbe Lücke besteht seit 0.19.3 an der
  Umstellung.*
- **Der volle Gegenprobenlauf** über alle Rückbauten — rund vierzig Stunden.
- **Die Zeitprobe mit dem zu engen Fenster** wird unter Last rot.
- **Ob `medium` ebenfalls `nearLossless` werden sollte**, ist nicht gemessen.
- **Die `effort`-Leiter am echten Bestand** (Stolperstein 270).
- **Der Rest der Kacheln bleibt am 2×-Bildschirm bei `zoom` 100 um 1,17fach
  hochgezogen.** *Daran ändert diese Runde nichts — sie behebt nur den Anteil,
  den der Ausschnitt beisteuert. Die Antwort darauf wäre eine größere Zahl als
  512, und die kostet Bytes; gemessen ist sie in 0.19.4.*
- **EIN HINWEIS IM EDITOR, wenn der Ausschnitt enger gezogen wird, als die
  Vorlage hergibt.** *Verworfen für diese Runde mit Zahlen (Abschnitt 7g);
  wenn überhaupt, dann als Hinweis und nicht als Kappe — und er braucht die
  Maße des Originals, die heute in keiner Antwort stehen.*
