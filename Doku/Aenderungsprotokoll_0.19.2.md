# Änderungsprotokoll 0.19.2 — „Was 0.19.1 nur zur Hälfte getroffen hat"

**Version 0.19.2 · gebaut am 2. September 2026 · Fingerprint `f4f8a479` ·
5104 Prüfungen · 478 Rückbauten in `gegenprobe.js`**

---

**VIER BEFUNDE AUS DEM RUNDLAUF MIT 0.19.1, und zwei davon sind Nacharbeit an
ihr selbst.** *0.19.1 ist im Feld bestätigt — die laufende Installation hat
`b0c4da5b` gemeldet, den gebauten Wert. Beim Durchklicken kam heraus, dass zwei
ihrer drei sichtbaren Punkte nur zur Hälfte trugen.*

> **DIE NUMMER: PATCH.** *Die Installation kann danach nichts, was sie vorher
> nicht konnte.* **KEINE DATENBANKSTUFE:** acht markierte Blöcke,
> Austauschformat **12**, `F_ROUTEN` **70**, neunzehn Karten.
>
> **EIN INDEX KOMMT DAZU, UND ER IST KEINE STUFE.** `idx_photos_art` auf
> `photos(art)` — kein Migrationsblock, keine Spalte, keine neue Formatnummer.
> *Beim ersten Start baut SQLite ihn einmal auf; gemessen 1,4 s bei 312 MB.*
> **Gesichert werden muss vor dem Einspielen nichts.**

---

## 0. Was gemessen wurde

**An einer SQLCipher-Datei mit 400 Zeilen à 512 kB — 312 MB.** *Dieselbe
Größenordnung wie der echte Bestand, und dieselbe **Tabellenform**: das ist der
Unterschied zur Messung, auf der 0.19.1 stand.*

### A. Nicht `length()` war teuer, sondern die Lage der Spalte

Je Abfrage über die ganze Tabelle:

| Abfrage | Zeit |
|---|---|
| `COUNT(*)` | 0,0 ms |
| `mime_type` gruppiert *(Spalte 2, **vor** den Blobs)* | **8,7 ms** |
| `SUM(length(data))` *(Spalte 3), ohne `WHERE`* | **7,2 ms** |
| `SUM(length(thumb))` *(Spalte 4)* | 0,3 ms |
| **`art` gruppiert** *(Spalte 6, **hinter** data, thumb, medium)* | **1338,8 ms** |
| `SUM(length(data))` mit `WHERE art != 'video'` | **1334,1 ms** |
| `length(data)` + `art`, **materialisiert** | **1343,3 ms** |
| `length(data)` + `mime_type`, **materialisiert** | **7,8 ms** |
| `art` gruppiert, **mit Index** auf `photos(art)` | **0,1 ms** |

**SQLite liest einen Satz von vorn.** Wer Spalte 6 will, muss über die Spalten
3, 4 und 5 hinweg — und dort liegen drei Blobs. Das heißt: ihre Overflow-Ketten
lesen und, bei SQLCipher, entschlüsseln. **Das ist von jeder Gruppierung
unabhängig, und `MATERIALIZED` hilft dagegen nichts** — die Zwischenabfrage muss
die Spalte ja lesen, um sie weiterzureichen.

> **DAS IST NICHT DERSELBE BEFUND WIE STOLPERSTEIN 275, SONDERN DER ZWEITE
> DANEBEN.** *275 sagt: `length()` verliert seine Abkürzung im Sortierer einer
> Gruppierung — das stimmt und ist mit `MATERIALIZED` behoben (mime_type
> gruppiert 1417 ms, materialisiert 7,8 ms).* **279 sagt: eine Spalte hinter
> einem Blob kostet den ganzen Satz.** *Zwei Ursachen, zwei Handgriffe. Wer nur
> die erste kennt, baut die Hälfte und hält sie für das Ganze — genau das ist
> in 0.19.1 passiert.*

### B. Und `!=` schlägt den Index aus

**Der Index allein genügt nicht.** Mit `idx_photos_art`:

| Abfrage | Zeit |
|---|---|
| `SUM(length(data))` mit `WHERE art != 'video'` | **1331,6 ms** |
| `SUM(length(data))` mit `WHERE art IS 'photo'` | **7,1 ms** |
| `SUM(length(data))` mit `WHERE art IS 'video'` | **0,3 ms** |

*Eine Ungleichheit lässt sich nicht über einen B-Baum aufsuchen; SQLite fällt
auf den vollen Durchgang zurück und liest `art` wieder aus dem Satz.* **Wer den
Index anlegt und die Ungleichheit stehen lässt, misst keinen Unterschied.**

### C. Die ganze Route, gegen den echten Code gefahren

| | `GET /api/stats` |
|---|---|
| 0.19.1 *(zwei materialisierte Abfragen)* | **4698 ms** |
| **0.19.2, kalt** | **28,6 ms** |
| **0.19.2, warm** | **4,4 ms** |

*Gemessen am laufenden Server gegen dieselbe 312-MB-Datei, mit gleichem
Ergebnis in jedem Feld.*

> **UND DESHALB WIRD NICHTS ZWISCHENGESPEICHERT.** *Die Frage lag nahe: muss
> die Karte bei jedem Klick den ganzen Bestand neu zählen? Kann man nicht eine
> Zählertabelle mitführen?* **Bei 4,4 ms gibt es dafür keinen Gegenwert — und
> der Preis wäre hoch:** eine mitgeführte Tabelle ist eine zweite Wahrheit über
> denselben Bestand (Stolperstein 47). Sie müsste beim Hochladen, Löschen,
> Einspielen, beim Papierkorb und beim Umstellungslauf nachgezogen werden, und
> **der erste vergessene Weg ließe die Karte still falsche Zahlen zeigen** —
> ohne dass irgendetwas rot würde. *Nicht die Menge der Daten war das Problem,
> sondern die Form der Frage.*

### D. Der Ausschnitt: der Betrachter ließ gar keinen anderen Wert zu

**Der Befund aus dem Feld:** *„Verhält sich genauso wie vorher; nach links und
rechts kann man gar nicht verschieben."*

`transform-origin` an der Kachel war richtig gerechnet — **und blieb
wirkungslos, weil `focus_x` nie etwas anderes als 50 werden konnte.** Der
Spielraum im Betrachter war:

```
spielX = breite − seite          seite = min(breite, hoehe)
```

also allein die **Überlänge der längeren Seite**. Bei einem Bild von
542 × 568 Bildpunkten sind das **0 waagerecht und 26 senkrecht** — und
`ausPunkt()` setzt `fx = 50`, sobald der Spielraum null ist.

**Der Zoom kam darin nicht vor**, und genau er macht den sichtbaren Ausschnitt
kleiner und damit den Spielraum größer:

```
eng    = seite / zoom            was die Kachel beim eingestellten Zoom zeigt
spielX = breite − eng            und so weit kann sie wandern
```

**Nachgerechnet gegen die Kachel:** `object-position: X%` legt das
cover-Fenster auf `(cw − S)·X/100`; `transform: scale(z)` mit
`transform-origin: X%` verschiebt zusätzlich um `S·(X/100)·(1 − 1/z)`. Zusammen
beginnt der sichtbare Bereich bei **`(X/100)·(cw − S/z)`** und ist `S/z` breit.
*Das ist Zeichen für Zeichen die Formel oben.* **Bei `zoom = 100` ist
`eng === seite`, und die Rechnung ist die alte** — diese Runde nimmt nichts weg,
sie ergänzt den Zoom.

> **BEIDE HÄLFTEN GEHÖREN ZUSAMMEN.** *0.19.1 hat die eine gebaut (die Kachel
> verankert am eingestellten Punkt) und die andere für gegeben gehalten (der
> Betrachter kann diesen Punkt setzen). Das ist Stolperstein 274, nur
> andersherum: dort schrieb jemand einen Wert, den niemand las; hier las jemand
> einen Wert, den niemand schreiben konnte.*

---

## 1. Die Bestandskarte fragt wirklich schnell

### GEBAUT

* **`db.js`:** `CREATE INDEX IF NOT EXISTS idx_photos_art ON photos(art)` — mit
  der Messung als Kommentar daneben.
* **`server.js`:** die Aufteilung holt erst die vorhandenen Arten
  (`SELECT art FROM photos GROUP BY 1`, aus dem Index) und fragt dann **je Art
  mit `IS ?`**. Es sind zwei ('photo' und 'video'); was dort steht, gilt für
  jede weitere von selbst.
* **Die Formatzeile bleibt materialisiert** — dort ist die Gruppierung über eine
  Blob-Länge der Kostenpunkt, und `MATERIALIZED` behebt ihn.
* **Die Exportgröße der Bilder kommt aus derselben Schleife.** Bis 0.19.1 rief
  `/api/stats` dafür `austauschTeile(null, …)`, und das stellte dieselbe teure
  Frage nach `art != 'video'` **ein zweites und drittes Mal** — gemessen 1363
  und 1310 ms zusätzlich. *Es ist dieselbe Summe; sie weiterzureichen ist die
  Abschaffung eines zweiten Rechenwegs und nicht die Einführung eines.*

**Die vier Abfragen stehen als vorbereitete Anweisungen neben `qOffenePNG`** und
werden nicht je Anfrage gebaut — sie laufen bei jedem Zeichnen des
Systembereichs.

### Was ausdrücklich NICHT gebaut wurde

**Kein Zwischenspeicher und keine Zählertabelle** (Abschnitt C).

**`qOffenePNG` bleibt, wie es ist.** *Es sucht weiter am Inhalt und darf
`art != 'video'` tragen: es läuft nur auf Knopfdruck, liest ohnehin die ersten
Bytes jedes Blobs, und der Index brächte ihm nichts — gemessen 1424 ms, und das
ist der Preis des Lesens, nicht der der Spaltenlage.*

---

## 2. Der engere Ausschnitt erreicht die Ränder wirklich

### GEBAUT

`ruesteAusschnittAus()` in `public/app.js` bekommt **`masse()`** — eine Stelle,
die den sichtbaren Ausschnitt und den Spielraum liefert. `zeichne()` und
`ausPunkt()` lesen beide daraus.

*Vorher rechnete jede der beiden ihren eigenen Spielraum, und beide ließen den
Zoom aus. Zwei Rechenwege für dieselbe Größe laufen früher oder später
auseinander — hier waren sie von Anfang an dieselbe halbe Wahrheit.*

**Und der Zeiger landet jetzt in der Mitte des Rahmens, den er zieht:**
`ausPunkt()` rechnet mit `eng` statt mit `seite`. *Der Sprung war umso größer,
je enger der Ausschnitt — also genau dort, wo man genau zielt.*

---

## 3. Die beiden Dialoge werden kurz

**Der Befund:** *„Dieser Text ist wieder zu viel."*

### Vorher und nachher

**Umstellungsdialog** — er sagte „nahezu verlustfrei" nicht und dafür zweimal
dasselbe (*„Die Bilder selbst bleiben, wie sie aussehen"*), und er erklärte
nebenher, **woher** die fehlende Zeitangabe kommt:

> *„… werden nach WebP umgeschrieben — erwartet rund 22,0 KB. Die PNG-Fassung
> ist danach nicht mehr da; zurück führt nur eine Sicherung des
> Datenverzeichnisses. Die Bilder selbst bleiben, wie sie aussehen. Wie lange
> das dauert, hängt an dieser Maschine und ist hier nicht gemessen — rechne mit
> Minuten bis Stunden. Der Lauf stört den Betrieb, solange er läuft."*

Jetzt:

> *„1 PNG-Original (59,5 KB) wird nahezu verlustfrei zu WebP umgewandelt und
> ersetzt — erwartet rund 22,0 KB. Zurück führt nur eine Sicherung des
> Datenverzeichnisses, die vorher angelegt wurde. Wie lange das dauert, lässt
> sich nicht vorhersagen — plane ein Zeitfenster ein, das den Betrieb am
> wenigsten stört (je nach Größe des Bestands bis zu Stunden)."*

**Und die Einzahl stimmt jetzt:** „1 PNG-Original **wird**" statt „werden".

**Die Rückfrage nach dem Passwort** verlor den Nebensatz über die fremde offene
Anmeldung und nennt den zweiten Faktor dort, wo er herkommt:

> *„Das trifft die ganze Anwendung — deshalb bestätigst du es mit deinem
> Passwort. Weil in deinem Profil ein zweiter Faktor eingeschaltet ist, gehört
> sein Code dazu. Hast du ihn nicht zur Hand, trägt auch ein
> Wiederherstellungscode."*

> **DIE BEGRÜNDUNG FÜR DIE FEHLENDE ZAHL BLEIBT — sie steht nur nicht mehr im
> Dialog.** *Gemessen 394 ms je Bild an der nachgefahrenen Maschine gegen 5,3 s
> im Feld, Faktor dreizehn (Stolperstein 252). Ein Dialog wird gelesen, bevor
> jemand etwas Unwiderrufliches tut; jeder Satz, den er zu viel trägt, kostet
> die Aufmerksamkeit für die übrigen.*

---

## 4. Die Übersetzung alter Abschnittsadressen ist abgebaut

**Der Befund kam vom Betreiber:** *„Was nicht nötig ist, ist dass so etwas
hart gecodet wird und dann Dinge abgefangen werden, die es nicht geben wird.
Verschwendete Ressourcen."*

### Was hier stand

`SYS_ALTE_ABSCHNITTE` übersetzte `#/system/anlage` (bis 0.17.0) und
`#/system/instanz` (bis 0.19.1) still auf `installation` — **damit ein
Lesezeichen oder ein Link aus einer Mail nicht ins Leere führt.**

### Warum es weg ist

**Der Fall tritt an dieser Anlage nicht ein.** Sie hat **einen** Zugang; es gibt
keine fremden Lesezeichen und keine verschickten Links auf einen Abschnitt des
Systembereichs. *Eine Tafel, die einen Fall abfängt, den es nicht gibt, ist
Aufwand ohne Gegenwert — sie will gepflegt, geprüft und bei jeder weiteren
Umbenennung nachgezogen werden.*

**Was stattdessen geschieht:** eine unbekannte Adresse fällt auf den ersten
sichtbaren Abschnitt zurück — **derselbe Weg, den `#/system/scheune` schon immer
nimmt.** *Kein Fehler, keine leere Seite, nur ein anderer Ort.*

> **DIE FOLGE, DIE MAN KENNEN SOLLTE:** ein eigenes Lesezeichen auf
> `#/system/instanz` landet danach bei „Persönlich" statt bei „Installation".
> *Das ist der Preis, und er ist bei einem Zugang klein.*

### Was bleibt

**Der Grund steht im Quelltext, nicht der Code** (Stolperstein 201) — samt der
Bauform, die es bräuchte, wenn der Fall je einträte: *eine Tafel, einmal
nachgeschlagen und nicht verkettet.* **Das war die Falle, die 0.19.1 beinahe
gestellt hätte:** `{ anlage: 'instanz', instanz: 'installation' }` hätte den
ältesten Link auf einen Schlüssel geschickt, den es nicht mehr gibt.

**Zwei Rückbauten sind dabei weggefallen und nicht mitgegangen** — 346 und 459
bauten genau diese Tafel zurück. *Ein Rückbau auf etwas, das es nicht mehr gibt,
lässt sich nicht mitnehmen: er hat keinen Ort mehr* (dieselbe Lage wie bei den
acht Rückbauten in 0.17.3). **An ihre Stelle tritt 487, der die Tafel WIEDER
EINBAUT** — dieselbe Sache, andersherum.

**Und die Prüfung ist umgedreht worden statt gelöscht** (Stolperstein 74): sie
belegt jetzt, dass es die Tafel nicht mehr gibt und dass `anlage`, `instanz` und
ein erfundener Abschnitt **denselben** Weg nehmen. *Die drei stehen in einer
Schleife — ohne den erfundenen bliebe offen, ob der Rückfall der Regelweg ist
oder eine dritte Sonderbehandlung.*

---

## 5. Zwei Zahlen aus 0.19.1 sind berichtigt

**In `Doku/Aenderungsprotokoll_0.19.1.md`, Abschnitt 0.A, stehen „0,1 ms" und
„0,2 ms" für die materialisierten Zwischenabfragen.** Beide Zahlen sind echt —
aber an einer Tabelle gemessen, in der die gelesene Spalte **vor** den Blobs
steht. **An `photos` kostet dieselbe Form 1343 ms.**

**Die Runde hat sie aus dem Auftrag übernommen und nicht am eigenen Gegenstand
nachgefahren.** *Das ist dieselbe Sorte Fehler wie die beiden, die 0.19.1
gerade gestrichen hatte — nur eine Stufe subtiler: die Zahl war nicht erfunden,
sie war übertragen.* **Die Lehre steht als Stolperstein 280.**

*Die übrigen Zahlen jenes Abschnitts halten:* `length()` verliert seine
Abkürzung im Sortierer einer Gruppierung, und `substr()` liest das Blob. **Was
fehlte, war die zweite Ursache — nicht die erste.**

---

## 6. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `db.js` | **Der Index `idx_photos_art`** samt der Messung, die ihn begründet. |
| `server.js` | **Punkt 1:** vier vorbereitete Anweisungen neben `qOffenePNG`; `/api/stats` holt die Arten aus dem Index und fragt je Art mit `IS ?`; die Exportgröße der Bilder kommt aus derselben Schleife. **Punkt 4:** die Berichtigung zu `substr()` steht wieder im Kommentar, jetzt neben der zweiten Ursache. |
| `public/app.js` | **Punkt 2:** `masse()` als eine Stelle für Ausschnitt und Spielraum; `zeichne()` und `ausPunkt()` lesen daraus. **Punkt 3:** beide Dialogtexte. **Punkt 4:** `SYS_ALTE_ABSCHNITTE` abgebaut, der Grund steht an seiner Stelle. |
| `pruefung.js` | Die Zusagen zur Abfrageform neu — Index, Gleichheit, blobfreie Artenabfrage, materialisierte Formatzeile, keine zweite Exportfrage. Die vier Zusagen am Dialogtext. |
| `gegenprobe.js` | **Acht neue** (480 bis 487). **Sechs mitgegangen** (455, 460, 461, 472, 473, 479). **Zwei weggefallen** (346, 459 — die Tafel, die sie zurückbauten, gibt es nicht mehr). |
| `CHANGELOG.md` | Abschnitt **0.19.2**, mit Kasten wegen des Indexaufbaus. |
| `Doku/Aenderungsprotokoll_0.19.1.md` | Der Feldbeleg (`b0c4da5b`), die drei Befunde des Rundlaufs und die Berichtigung der beiden übernommenen Zahlen. |
| `Doku/Aenderungsprotokoll_0.19.2.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_19_2.md` | **`git mv`** aus `_0_19_1`. Kopf (Revision 50), Betriebsstand, **Stolpersteine 279 und 280**, Prüfstand, Versionsgeschichte, Fahrplan. |
| `package.json`, `package-lock.json` | Version **0.19.2**. |

---

## 7. Der Fahrplan rückt

**Die 0.19er hinter dieser Runde rücken um eine Stelle:**

| war | ist | Name |
|---|---|---|
| — | **0.19.2** | Was 0.19.1 nur zur Hälfte getroffen hat *(diese Runde)* |
| 0.19.2 | **0.19.3** | Bestandsläufe verlassen den Anfrageweg |
| 0.19.3 | **0.19.4** | Die Kachel zeigt, was das Original hergibt |

*Die Begründungen der Reihenfolge sind mitgezogen: 0.19.3 steht weiterhin vor
jeder Runde mit einem Bestandslauf, und 0.19.4 bleibt trotzdem früh.*

---

## 8. Neue Stolpersteine

**Drei, und sie zählen bei 279 weiter** — 278 war vergeben. *Der dritte kam
beim Bauen dazu: der Prüfstand hat ihn gefunden.*

| Nr. | Kernsatz |
|---|---|
| **279** | **Eine Spalte hinter einem Blob kostet den ganzen Satz** — ganz unabhängig davon, wie die Abfrage geschrieben ist. `MATERIALIZED` hilft dagegen nicht; ein Index über die kleine Spalte schon. *Und er wirkt nur mit einer **Gleichheit** — `!=` schlägt ihn aus.* **Was oft gefragt wird, gehört vor die Blobs oder in einen Index.** |
| **280** | **Eine Zahl, die an einem anderen Gegenstand gemessen wurde, ist für diesen Gegenstand keine Messung.** Die „0,1 ms" aus dem Auftrag zu 0.19.1 sind echt — an einer Tabelle, in der die gelesene Spalte vor den Blobs steht. *Die billige Probe: fährt die Zahl den Fall, um den es geht?* **Übernommene Zahlen gehören am eigenen Gegenstand nachgefahren — oder als übernommen benannt** (Stolperstein 252). |
| **281** | **Ein Index auf einer nachgerüsteten Spalte gehört hinter ihre Migration, nicht in die DDL daneben.** `photos.art` kommt erst mit `migration0850()`; ein `CREATE INDEX` im DDL-Block scheitert an einer Datenbank aus 0.8.40 mit „no such column: art" — **beim Öffnen der Datei, also bevor der Server startet.** *Gefunden hat es der Prüfstand beim ersten Lauf. Die Regel gilt für jede Zeile, die eine nachgerüstete Spalte nennt.* |

---

## 9. Die Zahlen

| | vorher (0.19.1) | nachher (0.19.2) |
|---|---|---|
| Prüfungen | 5104 | **5104** *(vier neu, vier weggefallen)* |
| Rückbauten in `gegenprobe.js` | 472 | **478** |
| höchste Rückbaunummer | 479 | **487** |
| Stolpersteine | 278 | **281** |
| Routen (`F_ROUTEN`) | 70 | **70** |
| Karten im Systembereich | 19 | **19** |
| markierte Migrationsblöcke | 8 | **8** |
| Austauschformat | 12 | **12** |
| Indizes auf `photos` | 1 | **2** |
| `GET /api/stats` an 312 MB | 4698 ms | **28,6 ms kalt · 4,4 ms warm** |
| Fingerprint | `b0c4da5b` | **`f4f8a479`** |

---

## 10. Offen geblieben

**IM FELD NOCH NICHT BESTÄTIGT.** *Nach dem Einspielen gehört ein Blick in
Systembereich → Datenbank → Kennzahlen: steht dort ein anderer Wert als der
Fingerprint oben, liegt auf dem Wirt eine Datei, die kein Commit trägt
(Stolperstein 158).* **Ein hartes Neuladen gehört davor.**

**Nachzuprüfen sind die drei Befunde:**

- **Der Systembereich** — die Abschnitte kommen sofort, nicht nach Sekunden.
  *Beim allerersten Start dauert es einmalig länger: dann baut SQLite den
  Index.*
- **Der Ausschnitt** — mit Zoom auf 250 % lässt sich der Rahmen jetzt über das
  ganze Bild ziehen, auch waagerecht, und die gewählte Ecke steht danach in der
  Kachel.
- **Die beiden Dialoge** — kürzer, und der Umstellungsdialog sagt „nahezu
  verlustfrei".

**Weiter offen, unverändert:**

- **Der volle Gegenprobenlauf** über alle 478 Rückbauten — rund vierzig Stunden,
  seit zwanzig Runden ausstehend.
- **Die Aussetzer während eines Bestandslaufs.** *Nach dieser Runde ist die
  Erklärung aus 0.19.1 noch besser belegt: die Abfrage, die alle 1500 ms lief,
  kostete nicht 2,7 s, sondern an einer 606-MB-Datei entsprechend mehr. Sie
  kostet jetzt Millisekunden.* **Der Nachweis am Wirt steht weiter aus:** einen
  Umstellungslauf fahren und dabei im Systembereich klicken.
- **Weitere Vorkommen von „Instanz" im Bildschirmtext** — acht Stellen in
  `public/app.js`, unverändert aus 0.19.1 offen.
