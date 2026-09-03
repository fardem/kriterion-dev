# Änderungsprotokoll 0.19.4 — „Die Kachel zeigt, was das Original hergibt"

**Version 0.19.4 · gebaut am 3. September 2026 · Fingerprint `03e3b818` ·
5207 Prüfungen · 514 Rückbauten in `gegenprobe.js`**

---

**DIESE RUNDE BAUT EINEN FEHLER ZURÜCK, DER SEIT DEM ERSTEN TAG DA WAR.**
`thumb` war 400 Bildpunkte auf der **langen** Kante; jede Stelle, die ein
`thumb` zeigt, schneidet es mit `object-fit: cover` zu und braucht deshalb die
**kurze**. Ein 16:9-Bildschirmfoto lag als **400 × 225** in der Tabelle, und
die Kachel zog die 225 auf ihre Breite hoch — **immer, auf jedem Gerät, ohne
dass irgendetwas rot wurde.**

**UND SIE IST DIE ERSTE RUNDE, DIE DEN BESTANDSLAUF AUS 0.19.3 BENUTZT.** Genau
dafür stand 0.19.3 davor.

> **DIE NUMMER: PATCH.** *Dieselben Knöpfe, dieselben Bilder, dieselbe Antwort
> — die Kachel ist nur scharf.* **KEINE DATENBANKSTUFE:** acht markierte
> Blöcke, Austauschformat **12**, `F_ROUTEN` **70**, neunzehn Karten, kein
> neuer Index, **neun ausgelieferte Module — es kommt keine Datei dazu.**
>
> **ABER: DER LAUF ÜBERSCHREIBT JEDE `thumb`-SPALTE.** Die alten Ableitungen
> sind danach weg. *Sie sind aus dem Original wiederherstellbar, und genau
> deshalb ist es keine Stufe.* **Eine Sicherung schadet trotzdem nie.**
>
> **UND DIE DATENBANK WÄCHST.** Wie stark, hängt allein an der Mischung der
> Seitenverhältnisse im Bestand — **und die ist nicht gemessen.** Was gemessen
> ist, steht in Abschnitt 0.

---

## 0. Was gemessen wurde

**DIESE RUNDE HATTE KEINE MESSUNG IM RÜCKEN, und das war der Unterschied zu
0.19.3.** Dort stand jede Zahl vor dem ersten Handgriff fest. Hier standen drei
Fragen offen, und jede einzelne konnte die Bauform ändern. **Alle drei sind vor
dem ersten Handgriff beantwortet worden; was nicht messbar war, steht unten als
ungemessen benannt.**

### A. Was die Kachel wirklich fordert

**Gemessen am echten Bildschirm und nicht am Stylesheet** — Chromium 1194
(headless), `public/style.css` dieses Stands, 40 Kacheln, senkrechter
Rollbalken sichtbar. *Die Breiten 360 bis 430 und 768/820 sind in einem Rahmen
gemessen, die übrigen am echten Fenster; Chromium lässt kein Fenster unter
500 px zu.*

| Fenster | Kachel (CSS-px) | Spalten |
|---|---|---|
| 360 | 156 | 2 |
| 390 | **171** | 2 |
| 412 | 182 | 2 |
| 430 | 191 | 2 |
| 500 | 226 | 2 |
| 620 | 186,66 | 3 |
| 768 | 228 | 3 |
| 820 | 245,33 | 3 |
| 834 | 250 | 3 |
| 1024 | 230,5 | 4 |
| 1280 | 291,5 | 4 |
| 1440 / 1920 / 2560 | **299** | 4 |

**DIE BREITESTE KACHEL IST 299 px UND WÄCHST NICHT WEITER.** `.shell` hat
`max-width: 1300px`, und fünf Spalten passen bei `minmax(240px, 1fr)` und 16 px
Abstand nie hinein (5 · 240 + 4 · 16 = 1264 > 1252). *299 = 301 Spaltenbreite
minus 2 px Kartenrahmen.* **Die 313 px des Auftrags waren zu hoch** — sie
stammten von einem Bildschirm und waren keine Regel; die 171 px bei 390 decken
sich dagegen mit den 173 aus Stolperstein 261.

**Was daraus in Gerätepunkten folgt:**

| Gerät | Kachel | `devicePixelRatio` | fordert |
|---|---|---|---|
| Desktop, breites Fenster | 299 | 1 | 299 |
| Desktop, breites Fenster, HiDPI | 299 | 2 | **598** |
| Telefon, 390 px Fenster | 171 | 3 | 513 |
| Telefon, 430 px Fenster | 191 | 3 | 573 |
| Tablett, 820 px Fenster | 245,33 | 2 | 491 |

**Heute lieferte `thumb` bei 16:9 genau 225.** *Auf jedem dieser Geräte zu
wenig — auf dem HiDPI-Desktop um das 2,66fache.*

**Der engere Ausschnitt vervielfacht das noch einmal** (`zoom` läuft von 100
bis 400 %). **Er ist ausdrücklich NICHT in die Zahl eingerechnet:** bei 400 %
forderte die Kachel 2392 Gerätepunkte, und das ist keine Vorschau mehr, sondern
`medium`. *Ein Zoom, der weiter hineingeht, als die Vorlage hergibt, ist auch
bei jeder Fotoverwaltung unscharf.*

### B. Was es an der Datenbank kostet

**Gemessen an 180 Bildschirmfotos**, in Chromium aus den Papieren und dem
Quelltext dieses Projekts erzeugt — 36 Vorlagen mal fünf Fenstergrößen in drei
Seitenverhältnissen (16:9, 4:3, 1:1). *Kodiert mit demselben Kodierer und
derselben Güte wie in `bilder.js` (`q 78`, mozjpeg); geändert wurde allein die
Geometrie.*

| Seitenverhältnis | Bilder | Faktor Bytes (kurze Kante 400) | Faktor Bildpunkte | (lang/kurz)² |
|---|---|---|---|---|
| 1,00 : 1 | 36 | **1,00** | 1,00 | 1,00 |
| 1,33 : 1 | 36 | **1,78** | 1,78 | 1,77 |
| 1,78 : 1 | 108 | **3,06** | 3,16 | 3,17 |

> **DAS IST DAS EIGENTLICHE ERGEBNIS VON B: DER BYTE-FAKTOR IST DER
> BILDPUNKT-FAKTOR**, auf 3 % genau — und der ist reine Geometrie,
> (lange/kurze Kante)². **Das Wachstum hängt damit an keinem Inhalt, sondern
> allein am Seitenverhältnis.** *Ein quadratisches Bild wächst gar nicht.*

**Die Leiter an den 108 16:9-Bildern:**

| kurze Kante | `thumb` zusammen | Faktor | aus 14,4 MB würden |
|---|---|---|---|
| heute (400 lang) | 0,71 MB | 1,00 | 14,4 MB |
| 400 | 2,17 MB | 3,06 | 44,1 MB |
| **512** | 3,58 MB | **5,05** | **72,8 MB** |
| 640 | 5,50 MB | 7,78 | 112,0 MB |

**NICHT GEMESSEN — UND DAS IST DIE EINE ZAHL, DIE DIESE RUNDE SCHULDIG
BLEIBT:** die Mischung der Seitenverhältnisse im echten Bestand. *Der Lauf
kommt der laufenden Installation nicht bei; die 14,4 MB stammen aus einer
Messung vom 1. September 2026.* **Wäre der Bestand durchweg 16:9, würden aus
14,4 MB rund 72,8 MB — das ist die obere Schranke und keine Vorhersage.**

> **DER BETREIBER KANN SEINEN EIGENEN FAKTOR AUSRECHNEN, OHNE EIN EINZIGES BILD
> ABZULEITEN.** Der alte `thumb` trägt das Seitenverhältnis seines Originals
> bereits; der Faktor je Zeile ist (lange/kurze Kante)². Der Handgriff steht in
> Abschnitt 13.

**UND DIE VERSUCHUNG IST AUSGESCHLAGEN WORDEN:** `q: 78` zu senken, um das
Wachstum aufzufangen, wäre **eine zweite Änderung an derselben Zeile** gewesen
und hätte die Messung unlesbar gemacht. *Erst die Geometrie; wer danach an der
Güte drehen will, misst dafür eigens.*

### C. Ob der Lauf seine Zeilen billig findet

**Gemessen an einer echten, verschlüsselten Instanz** — Schema aus `db.js`,
1032 Fotozeilen, deren `thumb` aus echten Bildschirmfotos nach der **alten**
Regel abgeleitet ist (zusammen 9,9 MB, im Mittel 10.060 Bytes je Zeile).

| | |
|---|---|
| nur die Nummern (`SELECT id … WHERE art != 'video'`) | **0,5 ms** |
| alle 1032 `thumb` lesen | 40–45 ms |
| `sharp` nach den Maßen fragen | 232–274 ms (**0,23–0,27 ms je Zeile**) |
| **zusammen** | **275 bis 314 ms** |

**DARAUS FOLGT DIE BAUFORM, und sie ist eine Abweichung vom Auftrag.** Der
Auftrag stellte die Frage als Alternative: *ist es billig, läuft der Lauf beim
Start; ist es teuer, wird es ein Knopf.* **Die Messung teilt sie in zwei
Hälften:** die billige (0,5 ms) bleibt im Haupt-Thread, die teure (275 ms)
zieht in den Thread. *Im Haupt-Thread wären 275 ms mehr als das Doppelte
dessen, was 0.19.3 gerade weggeräumt hat (133 ms im 95. Perzentil) — und zwar
bei jedem Start.* **Also: kein Knopf, und der Haupt-Thread wählt großzügig
aus.**

**Der Preis davon gehört genannt:** ein Thread entsteht auch dann, wenn nichts
zu tun ist — **19 ms Verbindung und 76 ms `sharp`, einmal je Start**, dazu die
275 ms Lesen im Leerlauf. *Gegen 275 ms im Haupt-Thread ist das der bessere
Handel.*

### D. Der Deckel auf der langen Kante

**Auch seine Zahl ist gemessen**, an breiten Bildschirmfotos bei kurzer Kante
512. *Der Maßstab daneben: ein gewöhnlicher 16:9-`thumb` ist 910 × 512 = **466k
Bildpunkte**.*

| Seitenverhältnis | ohne Deckel | Deckel 1600 | **Deckel 1280** | Deckel 1200 |
|---|---|---|---|---|
| 2,37 : 1 | 1214 × 512 · 622k | = | = | 1200 × 506 · 607k |
| 2,39 : 1 | 1223 × 512 · 626k | = | = | 1200 × 502 · 602k |
| 3,56 : 1 | 1820 × 512 · 932k | 1600 × 450 · 720k | **1280 × 360 · 461k** | 1200 × 338 · 406k |
| 7,11 : 1 | 3641 × 512 · **1864k** | 1600 × 225 · 360k | 1280 × 180 · 230k | 1200 × 169 · 203k |

**BEIDE GRENZEN SIND GEMESSEN.** *Nach unten:* 21:9 ist das breiteste
gewöhnliche Bildschirmformat und ergibt 1214 bzw. 1223 px — **ein Deckel von
1200 schnitte es schon an, 1280 lässt es unberührt.** *Nach oben:* ein
32:9-Bildschirmfoto fällt bei 1280 auf 461k und liegt damit **genau auf dem Maß
eines gewöhnlichen `thumb`**; bei 1600 wäre es mit 720k noch das 1,55fache.
**Ohne Deckel wäre es mit 1864k das Vierfache — und mehr als sein eigenes
`medium`** (1600 × 900 = 1440k). *Aus der Ableitung, die klein sein soll, würde
die größte der Tabelle.*

---

## 1. Die Ableitungsregel folgt der Anzeigeregel

**NACHGESEHEN IM STYLESHEET — es gibt genau zwei Anzeigearten, und jede fordert
eine andere Kante:**

| Anzeige | wo | fordert |
|---|---|---|
| `object-fit: cover` | Kachel der Übersicht (`.card-img img`), Streifen am Eintrag (`.thumb img`), Kommentarbild (`.cmt-img img`), Streifen im Vollbild (`.lb-thumb img`) | **die kurze Kante** |
| `object-fit: contain` | Betrachter am Eintrag (`.viewer img`), Bühne im Vollbild (`.lb-stage img`) | **die lange Kante** |

**`thumb` wird ausschließlich mit `cover` gezeigt, `medium` ausschließlich mit
`contain`.** *Daraus folgt unmittelbar, dass `medium` bleibt, wie es ist: 1600
auf der langen Kante ist für `contain` genau richtig, und wer beide Ableitungen
„der Ordnung halber" gleich behandelt, macht `medium` schlechter und die
Datenbank deutlich größer.*

### Gebaut ist eine KISTE und keine Zahl

```js
const VARIANTS = {
  thumb:  { kurz: 512,  lang: 1280, q: 78 },
  medium: { kurz: 1600, lang: 1600, q: 84 }
};
```

**`kurz` ist, worauf die kurze Kante gebracht wird, `lang` der Deckel auf der
langen.** Was zuerst greift, gewinnt — `fit: 'inside'` auf dieser Kiste rechnet
genau das aus. *Bei `medium` sind beide Zahlen gleich, und damit greift immer
der Deckel: Bild für Bild dasselbe wie bis 0.19.3.* **Die Tafel trägt die
Unterscheidung und kein `if` in der Schleife.**

> **UND DAS WAR NICHT DER ERSTE ANLAUF.** Naheliegend wäre `fit: 'outside'`
> gewesen — es begrenzt die kurze Kante — mit einem zweiten `.resize()` als
> Deckel darüber. **`sharp` beachtet aber nur das LETZTE `.resize()`**, und
> zwar still: die Kette wirft nicht, sie liefert das Ergebnis des zweiten. *In
> der ersten Fassung der Messung B sind so drei Zahlen entstanden, die
> identisch waren und identisch falsch — die „Ableitungen" waren die
> unveränderten Originale (Stolperstein 289).*

### Welche Kante die kurze ist, sagt der Kopf — und er sagt es nicht allein

**`metadata()` liefert die Maße SO, WIE SIE IN DER DATEI STEHEN; `.rotate()`
dreht danach nach dem EXIF-Vermerk**, und die Ausrichtungen 5 bis 8 vertauschen
dabei Breite und Höhe. *Nachgemessen an einem 600 × 1200 mit Ausrichtung 6:
`metadata()` meldet 600 × 1200, `.rotate()` liefert 1200 × 600.* **Wer den
Vermerk nicht mitzählt, legt die Kiste hochkant an ein Bild, das quer
herauskommt — und bekommt eine Ableitung mit 1280 auf der kurzen Kante.**

**`{ autoOrient: true }` HILFT DAGEGEN NICHT:** sharp 0.35.3 meldet damit
ebenfalls 600 × 1200. *Nachgesehen, nicht angenommen* (Stolperstein 288).

**Der Kopf wird einmal je Bild gelesen und nicht je Ableitung** — 0,23 bis
0,27 ms an einem kleinen JPEG. **Lässt er sich nicht lesen, gilt quer:** die
Kiste ist dann 1280 breit und 512 hoch, und ein hochkantes Bild bekäme darin
512 auf der langen Kante — *also die alte Regel mit der neuen Zahl, und nicht
etwa eine überdimensionierte Ableitung.*

### Und die Ableitung skaliert, sie schneidet nicht

**Serverseitig zuschneiden war ausgeschlossen und ist es geblieben.** Der
Ausschnitt entsteht im Browser über `object-position` und `transform` aus dem
Fokuspunkt (`ausschnitt()` in `public/app.js`); ein am Server beschnittenes
`thumb` nähme dem Fokuspunkt seine Fläche, und der eingestellte Ausschnitt
zeigte danach etwas anderes. **Bei einem Panorama fällt deshalb die KURZE Kante
unter 512** — das Bild wird kleiner, nicht enger. *Der Prüfstand hält das am
Seitenverhältnis fest.*

---

## 2. Der Bestand wird nachgezogen — im Thread aus 0.19.3

**Eine dritte Aufgabe für `bestandslauf.js`**, gerufen wie die beiden anderen
über `starteBestandsThread(aufgabe, zeilen, fertig)`. *Sie ist die erste, die
eine **gültige** Ableitung durch eine bessere ersetzt: das Nachrüsten füllt
leere Spalten, die Umstellung verschiebt ein Format.*

**DIE KETTE BEIM START:** Nachrüsten → Nachziehen → `maintainStorage()`.
**Nacheinander und nicht nebeneinander** — zwei Bestandsthreads schrieben beide
in `photos`, und der Stand für die Karte ist **einer je Aufgabe**; die Karte
zeigte sonst abwechselnd zwei Läufe. *Jedes Glied ruft das nächste selbst, wenn
es für sich nichts zu tun findet.*

### Welche Zeile fällig ist, sagt die Zeile selbst

**Kein Merker in der Datenbank** — das wäre eine Schemaänderung, und diese
Runde ist keine Datenbankstufe. **Gefragt wird die LANGE Kante des gespeicherten
`thumb`:** unter der alten Regel ist sie **exakt 400**, weil `fit: 'inside'`
die begrenzende Kante genau auf ihr Maß legt. *Nachgemessen an 1919 × 1080,
1920 × 1080, 1366 × 768, 3441 × 1440, 1000 × 999, 401 × 400 und 7680 × 1080 —
in jedem Fall genau 400.*

> **WARUM NICHT NACH DER KURZEN KANTE GEFRAGT WIRD, obwohl das die neue Regel
> ist.** „Kurze Kante unter 512" hätte auch die beiden Fälle gefangen, in denen
> die neue Regel **bewusst** darunter bleibt: das kleine Bild
> (`withoutEnlargement` vergrößert nie) und das Panorama (dort greift der
> Deckel). **Beide kämen unverändert heraus und fielen bei jedem Start aufs
> Neue in die Auswahl** — die Datenbank wüchse bei jedem Neustart.
> **Eine Migrationsabfrage muss ein Festpunkt sein** (Stolperstein 290), und
> der Prüfstand hält genau das fest.

**DER EINE FALL, IN DEM SIE ES NICHT IST, steht im Quelltext und nicht in einer
Fußnote:** ein Original, dessen lange Kante genau 400 ist. Sein `thumb` sieht
aus wie ein alter, ist aber schon der neue — *beide Regeln liefern dafür
dasselbe Bild.* **Der Lauf leitet ihn bei jedem Start erneut ab, stellt fest,
dass sich die Maße nicht geändert haben, und zählt ihn nicht mit.** *Es kostet
ein kleines Bild je Start, und auflösen ließe es sich nur mit genau dem Merker,
der ausgeschlossen ist.*

**EIN UNLESBARER `thumb` GILT ALS ALT und wird ersetzt.** Die Ableitung wird
nicht aus dem `thumb` gerechnet, sondern aus dem **Original** — wer die Frage
nicht beantworten kann, verliert also nichts und gewinnt eine Zeile zurück, die
sonst niemand repariert: *das Nachrüsten sucht `thumb IS NULL` und sieht einen
kaputten `thumb` gar nicht an.*

### Was der Lauf zählt

**Zweimal, und das ist keine Doppelung:** `geprueft` sind die Zeilen, deren Kopf
gelesen wurde, `nachgezogen` die, die wirklich eine neue Ableitung bekommen
haben. *Ein Lauf, der 1032 prüft und 0 nachzieht, ist der Normalfall nach dem
ersten Durchgang — und er sagt das dann auch, statt „1032 erledigt" zu melden.*
**Die Karte zeigt seine Zeile dann gar nicht.**

**`reclaim()` am Ende**, wie bei der Umstellung. **Ein Fehler an einer Zeile
reißt den Lauf nicht ab.** **Und es wird nur geschrieben, wenn wirklich etwas
herauskam:** käme `thumb` leer zurück, stünde danach NULL in einer Spalte, die
vorher ein Bild trug. *Eine Ableitung, die schlechter ist als keine, gibt es
nicht; eine, die schlechter ist als die alte, schon.*

---

## 3. Was ausdrücklich NICHT nachgezogen wurde, mit Begründung

### Die Videozeilen — es gibt keine Vorlage mehr

**Bei `art = 'video'` steht in `data` die Videodatei**; `thumb` und `medium`
sind aus dem **Standbild** entstanden, das der Browser beim Hochladen
mitgeschickt hat. **Es gibt nichts, woraus sich neu ableiten ließe** — und der
Kernsatz gilt weiter: *der Server öffnet nie ein Video.* **Diese Kacheln
behalten die alte Geometrie, bis jemand das Video neu hochlädt.** *Das ist
keine Lücke, sondern eine Folge der Bauform, und sie steht jetzt im
Projektstand.*

**Der Prüfstand fährt eine Videozeile trotzdem durch den Lauf** — obwohl die
Auswahl im Server sie gar nicht erst nimmt. *Belegt wird, dass ihr Standbild
auch dann stehen bleibt, wenn sie es doch täte.*

### Die Kommentarbilder — die Anzeige fordert es nicht

**`.cmt-img` ist 86 × 86 px, fest** — nicht 299 wie die Kachel der Übersicht.
*Bei `devicePixelRatio` 2 fordert sie 172 Gerätepunkte, bei 3 dann 258; der
alte `thumb` lieferte 225.*

| | Übersichtskachel | Kommentarbild |
|---|---|---|
| Anzeige | 299 px, `cover` | **86 px**, `cover` |
| gefordert bei dPR 3 | 513 | **258** |
| geliefert (alt) | 225 | 225 |
| **Fehlbetrag** | **2,66fach** *(bei dPR 2 am breiten Fenster)* | **1,15fach** *(nur bei dPR 3)* |

**DIE ENTSCHEIDUNG: der Bestand an Kommentarbildern wird NICHT nachgezogen.**
*Dafür sprach, dass die Kommentarkachel dieselbe Anzeigeart benutzt und `data`
mit 1600 px für jede erwogene Zahl reichte. Dagegen sprach, dass es eine zweite
Kodierung ist.* **Den Ausschlag gibt die Messung: 1,15fach ist kein Fehler,
den man mit einer zweiten Kodierung bezahlt.** *Die Zahlen zur zweiten
Kodierung — MAE 0,06 nach einer Runde, 0,10 nach sechs — hätten dafür gesprochen;
sie sind nicht der Grund, sondern der Preis, und der Nutzen war zu klein.*

**NEU HEREINKOMMENDE KOMMENTARBILDER TRAGEN DIE NEUE GEOMETRIE TROTZDEM** —
beide Wege rufen dieselbe `makeVariants()`. **Sie sind damit größer, als ihre
86 px fordern**, und das ist die Kehrseite EINER Tafel für beide Bildwege.
*Eine dritte Ableitung wäre die Antwort; sie ist eine eigene Runde mit eigener
Messung und steht als offener Punkt im Projektstand, Abschnitt 8.*

### Und drei Dinge aus dem Auftrag, die gar nicht zur Frage standen

**`medium`** — siehe Abschnitt 1. **`q: 78`** — eine zweite Änderung an
derselben Zeile hätte die Messung unlesbar gemacht. **Die Ableitungen auf
WebP** — sie fahren in der Runde mit, in der ohnehin über Verfahren entschieden
wird; *die Geometrie hängt an keinem Verfahren, genau deshalb stand sie hier.*

---

## 4. Der Stand steht je Aufgabe

**Bis 0.19.3 gab es genau einen Lauf, der einen Stand meldete, und der stand in
`umstellung`.** Seit dieser Runde sind es zwei. **In einer gemeinsamen Variablen
wäre daraus eine Lüge geworden:**

* die Karte zeigte bei **jedem Start** „Umstellung läuft — 5 von 1032 …",
* der Umstellungsknopf wäre so lange tot,
* und `POST /api/bilder/umstellen` antwortete mit **409 „Die Umstellung läuft
  schon."** — für einen Lauf, der etwas ganz anderes tut.

**Gebaut ist eine Abbildung `bestandsStaende` mit einem Stand je Aufgabe**, und
der Schlüssel ist **dieselbe Zeichenfolge, mit der der Thread erzeugt wird**.
*Eine zweite Liste der Aufgabennamen liefe auseinander.* **`/api/stats` trägt
beide Felder nebeneinander** (Stolperstein 292).

**In der Oberfläche:** eine zweite Fortschrittszeile in der Karte „Bildablage",
die **nur dasteht, wenn es etwas zu sagen gab** *(der Lauf fährt bei jedem
Start; eine Zeile „0 nachgezogen" stünde von da an für immer da)*, und **eine**
Uhr für beide Läufe — sie können sich überschneiden, und eine zweite fragte
`/api/stats` ein zweites Mal ab. *Gemeldet wird nur das Ende eines Laufs, den
diese Uhr auch hat laufen sehen.*

**Und die Beschreibung der Karte ist berichtigt:** sie sagte „Die beiden
Ableitungen (400 px und 1600 px)" — **jetzt sagt sie, welche KANTE die Zahl
trägt.** *Genau darin steckte der Fehler.*

---

## 5. BEFUND BEIM BAUEN: `art IS 'bild'` verschweigt Zeilen

**Die erste Fassung der Auswahl las `WHERE art IS 'bild'`** — die Form, die
`idx_photos_art` nimmt und die `db.js` daneben ausdrücklich empfiehlt. **Sie
fand vier Zeilen statt zehn.**

**Der Grund:** `art` trägt laut Schema `'bild'` oder `'video'` — **aber der
Import schreibt den Wert aus der Austauschdatei ungeprüft durch**, und der
Prüfstand legt seit 0.19.3 Fotozeilen mit `art = 'foto'` an, an einer Stelle,
an der es niemandem aufgefallen ist.

**Gebaut ist `WHERE art != 'video'`**, und die Entscheidung steht auf drei
Beinen: *gemessen* kosten beide Formen an 1052 Zeilen und 669 MB dasselbe (0,4
bis 0,5 ms — gelesen werden nur Nummern, der Index bringt ihnen nichts);
**eine Migration, die Zeilen still ausläßt, ist schlechter als eine, die 0,1 ms
länger braucht**; und `qOffenePNG` wie das Nachrüsten fragen beide so — *drei
Abfragen über dieselbe Menge sollen nicht drei verschiedene Mengen meinen*
(Stolperstein 291).

**Der Prüfstand hält den Befund als eigene Zusage fest**, und die Zeilen mit
`art = 'foto'` bleiben stehen: *sie sind jetzt der Regressionsfall.*

---

## 6. Zwei Zahlen des Auftrags haben nicht getragen

| behauptet | gemessen | wo es stand |
|---|---|---|
| die Kachel ist **313 px** breit | **299 px** *(die 313 stammten von einem Bildschirm und waren keine Regel — der Auftrag sagt das selbst)* | Auftrag 0.19.4, Abschnitt 1A |
| **1034** Vorschaubilder | **1032** *(Projektstand, Abschnitt 10a, Messung vom 1. September 2026)* | Sammelblatt Punkt 7 und die Fahrplanzeile |

*Die zweite ist die vierte berichtigte Zahl dieser Kette; der Auftrag hat sie
selbst angekündigt und die Berichtigung gleich mitgeliefert.* **Beide stehen
jetzt richtig in den Papieren, und die alte Zahl ist mit ihrem Grund daneben
vermerkt statt gelöscht** (Stolperstein 201).

---

## 7. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `bilder.js` | **Die Tafel `VARIANTS` trägt Kisten statt Zahlen** (`thumb` 512/1280, `medium` 1600/1600). Neu: `istQuer()` *(zählt den EXIF-Vermerk mit)*, `traegtAlteGeometrie()` und `istAlteAbleitung()` — dieselbe Regel einmal ohne und einmal mit `sharp`. `makeVariants()` liest den Kopf **einmal** je Bild und wählt die Kiste ohne Verzweigung. |
| `bestandslauf.js` | **Die dritte Aufgabe `geometrie`** (`zieheVorschaubilderNach()`): Stand je Zeile mit `geprueft`/`nachgezogen`/`uebersprungen`/`zugenommen`, `reclaim()` am Ende, ein Fehler kostet die Zeile und nicht den Lauf, geschrieben wird nur, wenn die Ableitung wirklich da ist. Kopf und Abschluss nennen jetzt drei Schleifen statt zwei. |
| `server.js` | `qBildZeilen` *(mit der Begründung für `art != 'video'` und gegen `thumb IS NOT NULL`)*, `zieheGeometrieNach()` und die **Kette** beim Start, `bestandsStaende` **je Aufgabe** statt der einen Variablen `umstellung`, `/api/stats` trägt `geometrie` daneben. |
| `public/app.js` | `geometrieZeile()` *(steht nur da, wenn es etwas zu sagen gab)*, die Tafel `BESTANDSLAEUFE` und **eine** Uhr für beide Läufe statt `verfolgeUmstellung()`, die berichtigte Beschreibung der Karte „Bildablage". |
| `pruefung.js` | **Neue Gruppe „Die Ableitung folgt der Anzeige — 0.19.4" (15).** Im Bestandslauf **16 neue** für die dritte Aufgabe, in der Oberfläche **6 neue** für die zweite Fortschrittszeile. Drei Zusagen aus 0.19.3 sind auf die neue Form gezogen. **5170 → 5207.** |
| `gegenprobe.js` | **Siebzehn neue ab 506**, fünf mitgezogene (439, 440, 491, 492, 495). **497 → 514.** |
| `package.json` / `package-lock.json` | Version **0.19.4** *(zweimal in der Lockfile)*. |
| `CHANGELOG.md` | Eintrag **mit Kasten** — wegen des Laufs über den Bestand und wegen der wachsenden Datenbank. |
| `Doku/Projektstand_Kriterion_0_19_4.md` | **`git mv`** aus `_0_19_3`. Kopf (Revision 52), Betriebsstand, **Abschnitt 5** wegen der Ableitungsregel, **Stolpersteine 287 bis 292**, Prüfstand, Versionsgeschichte, offene Betriebspunkte, **Fahrplan samt Abschnitt 10a**. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo; die Nennungen in älteren Änderungsprotokollen meinen ihre eigene Version und bleiben.* |
| `Doku/Fehler_und_Ideen.md` | **Punkt 7 ist gebaut und Punkt 8 hat eine Nummer** — beide sind fort. Die Zuordnungstabelle und die beiden Übersichten sind nachgezogen. |

**KEINE NEUE ABHÄNGIGKEIT, KEINE NEUE AUSGELIEFERTE DATEI, KEINE BINÄRDATEI,
KEIN TAG.** *Die README ist unangetastet: es kommt keine Datei dazu.*

---

## 8. Der Fahrplan rückt — und zwar wegen Punkt 8

**Die Zeile 0.19.4 stand schon da und behält ihre Nummer und ihren Namen.**
*Was in ihr zu ersetzen war — die Zahl 1034 —, steht in Abschnitt 6.*

**IN DERSELBEN SITZUNG HAT PUNKT 8 DES SAMMELBLATTS EINE NUMMER BEKOMMEN**,
und das ist eine Entscheidung des Betreibers und keine Folge dieser Runde.
„Alte Sicherungen aufräumen — ohne Shell" wird **0.20.0**, **und alles dahinter
rückt um eine Stelle:**

| bisher | jetzt | |
|---|---|---|
| — | **0.20.0** | Alte Sicherungen aufräumen — ohne Shell *(neu)* |
| 0.20.0 | **0.21.0** | Die Oberfläche wird ruhiger |
| 0.21.0 | **0.22.0** | Die wählbare Bildablage |
| 0.22.0 | **0.23.0** | Bereinigung — der Bruch |
| 0.22.x | **0.23.x** | Die Kommentare werden knapp |
| 0.23.0 | **0.24.0** | Mehrsprachigkeit |
| 0.30.0 | 0.30.0 | Code-Effizienz — *ausdrücklich nicht gerückt: sie ist keine Zahl in der Folge, sondern eine bewusst ferne* |

**WARUM MINOR UND WARUM VORN.** Der Maßstab aus Abschnitt 5.1: *kann die
Installation danach etwas, was sie vorher nicht konnte?* **Sie kann — alte
Sicherungen entfernen, ohne dass jemand eine Shell öffnet**; dazu eine neue
Route (`F_ROUTEN` 70 → 71) und ein neunter Zweck der zweiten Bestätigung.
*Dieselbe Rechnung wie bei 0.15.0, 0.17.0 und 0.21.0.* **Vorn steht er, weil er
an nichts hängt und weil er klemmt:** jede Sicherung ist so groß wie die ganze
Datenbank — *und die ist mit dieser Runde gerade gewachsen.*

> **„DIE OBERFLÄCHE WIRD RUHIGER" IST DAMIT ZUM ERSTEN MAL GERÜCKT.** Sechsmal
> in Folge stand im Fahrplan ausdrücklich, dass sie es **nicht** ist. *Der Satz
> bleibt dort stehen, mit dem Datum, ab dem er nicht mehr gilt (Stolperstein
> 201): eine Nummer ohne Grund zu rücken macht den Fahrplan unlesbar — eine
> Nummer MIT Grund nicht zu rücken macht ihn falsch.*

**UND EINE ALTE UNSTIMMIGKEIT IST DABEI AUFGEFALLEN:** die Überschrift in
Abschnitt 10a hieß **0.21.x**, während die Tabelle in Abschnitt 10 schon
**0.22.x** trug — *das Rücken der Bereinigung am 2. September ist dort nicht
mitgezogen worden* (Stolperstein 47). **Beide stehen jetzt auf 0.23.x.**

---

## 9. Neue Stolpersteine

**287 bis 292**, und sie stehen vollständig im Projektstand, Abschnitt 6.

| # | in einem Satz |
|---|---|
| **287** | **Die Ableitungsregel folgt der Anzeigeregel.** Wer mit `cover` anzeigt, braucht die kurze Kante; wer mit `contain` anzeigt, die lange — und eine Ableitung, die beide gleich behandelt, ist für eine von beiden falsch, ohne dass etwas rot wird |
| **288** | **`metadata()` meldet die Maße der Datei, `.rotate()` liefert sie gedreht** — und `{ autoOrient: true }` ändert daran nichts |
| **289** | **`sharp` beachtet nur das letzte `.resize()`** — zwei hintereinander sind kein Deckel, sondern eine stille Ersetzung |
| **290** | **Eine Migrationsabfrage muss ein Festpunkt sein:** was sie erzeugt, darf nicht wieder in ihre Auswahl fallen |
| **291** | **`art IS 'bild'` verschweigt jede Zeile mit einem dritten Wort** — und der Import schreibt den Wert ungeprüft durch |
| **292** | **Ein Stand je Lauf, nicht je Anwendung** — mit dem zweiten Lauf wird eine gemeinsame Variable zur Lüge |

---

## 10. Die Zahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen | 5170 | **5207** *(+37, keine weggefallen)* |
| Rückbauten | 497 *(höchste Nummer 505)* | **514** *(höchste Nummer 522)* |
| Stolpersteine | 286 | **292** |
| `F_ROUTEN` | 70 | 70 |
| Migrationsblöcke | acht | acht |
| Austauschformat | 12 | 12 |
| Karten im Systembereich | neunzehn | neunzehn |
| ausgelieferte Module | neun | neun |
| Zwecke der zweiten Bestätigung | acht | acht |

**Die 37 neuen Prüfungen je Gruppe:** die neue Gruppe „Die Ableitung folgt der
Anzeige — 0.19.4" bringt **15**, der Bestandslauf wächst von 29 auf **45**
(+16), die Bildablage in der Oberfläche von 33 auf **39** (+6).

---

## 11. Die Gegenprobentabelle

**Gefahren wurden die siebzehn neuen Rückbauten und die fünf mitgegangenen** —
nicht der volle Lauf über alle 514. *Jeder einzelne ist ein vollständiger
Prüflauf: rund sechs Minuten, in vier Nebenspuren nebeneinander.*

> **ZWEIUNDZWANZIG GEFAHREN, EINER STUMM — und der eine war vorhergesagt.**
> **Rückbau 516** nimmt dem Nachziehen sein `reclaim()`, und er steht mit
> genau dieser Erwartung in der Liste: *seine Wirkung ist eine Dateigröße, und
> in dieser Runde wächst die Datei ohnehin — die freigegebenen Seiten werden
> von den größeren Ableitungen sofort wieder belegt.* **Nachgesehen und nicht
> vermutet:** die WAL-Datei ist nach dem Lauf in beiden Fällen weg, weil
> `db.close()` ebenfalls einen Punkt setzt. *Ein stummer Rückbau ist ein Fund
> und keine Formalie — dieser hier ist als offener Punkt aufgeschrieben und
> nicht wegerklärt; dieselbe Lücke besteht seit 0.19.3 an der Umstellung.*
>
> **UND DER LAUF IST VOR DEM SCHREIBEN DER PAPIERE GEFAHREN, nicht danach.**
> *In 0.19.3 hat er drei Dinge gefunden, die sonst niemand gefunden hätte.*
> Diesmal hat er nichts gefunden, was nicht schon dagestanden hätte — **und
> auch das ist ein Ergebnis: die fünf mitgezogenen Rückbauten (439, 440, 491,
> 492, 495) greifen nach dem Umbau des Standes genauso wie vorher.**

**Die Zeilen sind die des Treibers.** *Eine Zeile ist in jeder von ihnen
ausgelassen und steht hier einmal:* **„Jeder Suchtext kommt in seiner Datei
genau einmal vor"** *— die Selbstprobe. Sie wird bei **jedem** gefahrenen
Rückbau rot, weil er gerade seine eigene Zeile ersetzt hat; der Treiber zählt
sie deshalb selbst nicht zu den inhaltlichen Punkten.*

| # | Rückbau | Namentlich rot |
|---|---|---|
| **439** | Zweimal druecken startet zwei Laeufe | „Ein zweiter Druck startet keinen zweiten Lauf" |
| **440** | Der Fortschritt steht nicht mehr in den Kennzahlen | 8 Prüfungen, darunter „Und nennt dabei, wie viele Bilder sie vorhat" (2 Gruppen) |
| **491** | Der Thread meldet seinen Stand erst am Ende | „Und meldet je Zeile einmal, dazu einmal am Ende", „Und der Stand zaehlt hoch, bis alle Zeilen erledigt sind" |
| **492** | Der Haupt-Thread hoert die Meldungen des Threads nicht mehr | 7 Prüfungen, darunter „Der Fortschritt steht in den Kennzahlen und läuft aus" (2 Gruppen) |
| **495** | Ein Fehler im Thread laesst den Lauf auf „laeuft" stehen | „Ein Fehler im Thread setzt den Lauf auf beendet und laesst den Rest stehen" |
| **506** | Die kurze Kante des thumb steht wieder auf 400 | 8 Prüfungen, darunter „Ein 16:9-Bild bekommt seine KURZE Kante auf 512" (3 Gruppen) |
| **507** | Der Deckel auf der langen Kante faellt weg | „Ein 32:9-Bild stoesst an den Deckel von 1280 auf der langen Kante", „Die Tafel nennt jeder Ableitung ihre Kiste aus kurzer und langer Kante" |
| **508** | medium bekommt dieselbe Kiste wie thumb | 4 Prüfungen, darunter „Und `medium` bleibt bei 1600 auf der LANGEN Kante" (3 Gruppen) |
| **509** | Der EXIF-Vermerk zaehlt bei der Kante nicht mehr mit | „Der EXIF-Vermerk zählt mit: ein gedrehtes Bild bekommt die richtige Kiste" |
| **510** | Der Kopf wird nicht gelesen -- die Kiste liegt immer quer | „Ein hochkantes Bild bekommt seine kurze Kante ebenso" |
| **511** | Die alte Geometrie wird an der kurzen Kante erkannt | 6 Prüfungen, darunter „Die Regel trennt alte von neuer Geometrie an allen sieben Fällen" (3 Gruppen) |
| **512** | Ein unlesbarer thumb bleibt liegen | „Ein unlesbarer thumb wird aus dem Original ersetzt" |
| **513** | Der Lauf zieht jede Zeile nach, nicht nur die faelligen | 4 Prüfungen, darunter „Und zieht genau die vier nach, die die alte Geometrie tragen" (2 Gruppen) |
| **514** | Der Lauf schreibt auch, wenn die Ableitung leer zurueckkommt | 5 Prüfungen, darunter „Und zieht genau die vier nach, die die alte Geometrie tragen" (2 Gruppen) |
| **515** | Das Nachziehen meldet seinen Stand erst am Ende | „Und meldet je Zeile einmal, dazu einmal am Ende" |
| **516** | Das Nachziehen gibt seine Seiten nicht frei | **STUMM — das ist ein FUND** |
| **517** | Das Nachziehen wird beim Start nicht mehr gerufen | „Und jedes Glied ruft das naechste selbst, wenn es nichts zu tun gibt" |
| **518** | Die Auswahl des Nachziehens verengt sich auf ein Wort | „Und der Server waehlt seine Zeilen mit genau dieser Abfrage" |
| **519** | Die Fortschrittszeile des Nachziehens faellt aus der Karte | „Waehrend des Nachziehens zeigt die Karte seinen Fortschritt", „Nach dem Nachziehen sagt die Zeile, was herauskam" |
| **520** | Die Zeile des Nachziehens steht auch ohne Fund da | „Ein Lauf ohne Fund hinterlaesst keine Zeile" |
| **521** | Die Uhr verfolgt nur noch die Umstellung | „Die Uhr verfolgt beide Läufe und nicht nur die Umstellung" |
| **522** | Die Karte nennt wieder 400 px, ohne die Kante zu sagen | „Die Karte nennt die kurze Kante der kleinen Ableitung" |

---



## 12. Offen geblieben

- **DER FELDBELEG ZU 0.19.4 STEHT AUS.** *Vier Handgriffe, und sie stehen im
  Projektstand, Abschnitt 8.*
- **WIE VIEL DIE DATENBANK WIRKLICH WÄCHST, IST NICHT GEMESSEN** — nur der
  Faktor je Bild. *Er hängt allein am Seitenverhältnis; die Mischung im echten
  Bestand kennt nur die laufende Installation.* **Der Handgriff dafür steht in
  Abschnitt 13.**
- **DIE KOMMENTARBILDER SIND JETZT GRÖSSER, ALS IHRE ANZEIGE FORDERT** — für
  neu Hereinkommendes. *Eine dritte Ableitung wäre die Antwort und ist eine
  eigene Runde mit eigener Messung.*
- **`reclaim()` AM ENDE DES NACHZIEHENS HAT KEINE GEGENPROBE, DIE GREIFT.**
  Seine Wirkung ist eine Dateigröße, und in dieser Runde wächst die Datei
  ohnehin. *Nachgesehen und nicht vermutet: die WAL-Datei ist nach dem Lauf in
  beiden Fällen weg, weil `db.close()` ebenfalls einen Punkt setzt.* **Rückbau
  516 steht mit dieser Angabe als erwartet stumm in der Liste**; dieselbe Lücke
  besteht seit 0.19.3 an der Umstellung.
- **DER VOLLE GEGENPROBENLAUF** über alle 514 Rückbauten — rund vierzig
  Stunden, seit dreiundzwanzig Runden ausstehend. *Diese Runde hat die
  zweiundzwanzig gefahren, die sie anfasste; der Rest steht aus.*
- **DIE ZEITPROBE MIT DEM ZU ENGEN FENSTER** *(„Eine Sekunde vor Ablauf trägt
  der Link noch")* wird unter Last rot, ohne dass an ihr etwas falsch wäre.
  *Der Weg wäre klein: ein Fenster, das nicht an einer Sekunde hängt.*
- **OB `medium` EBENFALLS `nearLossless` WERDEN SOLLTE**, ist nicht gemessen —
  eigener Lauf, berührt die Auslieferung.
- **DIE `effort`-LEITER AM ECHTEN BESTAND** *(Stolperstein 270)*.

---

## 13. Der Handgriff, mit dem der Betreiber sein eigenes Wachstum ausrechnet

**Ohne ein einziges Bild abzuleiten.** Der alte `thumb` trägt das
Seitenverhältnis seines Originals bereits; der Faktor je Zeile ist
(lange/kurze Kante)². *Zu fahren VOR dem Einspielen, gegen eine Kopie der
Datenbank — die laufende Instanz wird dabei nicht angefasst.*

```
node -e "
const Database = require('better-sqlite3-multiple-ciphers');
const sharp = require('sharp');
const d = new Database(process.argv[1]);
d.pragma(\"cipher='sqlcipher'\"); d.pragma('key=\"x\'' + process.argv[2] + '\'\"');
(async () => {
  const z = d.prepare(\"SELECT thumb FROM photos WHERE art != 'video' AND thumb IS NOT NULL\").all();
  let alt = 0, neu = 0, n = 0;
  for (const r of z) {
    const m = await sharp(r.thumb).metadata();
    const kurz = Math.min(m.width, m.height), lang = Math.max(m.width, m.height);
    if (lang !== 400) continue;                      // traegt schon die neue Geometrie
    const f = Math.min(512 / kurz, 1280 / lang) ** 2;
    alt += r.thumb.length; neu += r.thumb.length * f; n++;
  }
  console.log(n + ' Zeilen: ' + (alt/1048576).toFixed(1) + ' MB werden rund ' +
              (neu/1048576).toFixed(1) + ' MB — Faktor ' + (neu/alt).toFixed(2));
})();
" /pfad/zur/katalog.sqlite <SCHLUESSEL_HEX>
```

**Die Zahl ist eine Schätzung nach oben:** sie rechnet mit dem
Bildpunkt-Faktor, und der liegt gemessen **3 % über** dem Byte-Faktor.
