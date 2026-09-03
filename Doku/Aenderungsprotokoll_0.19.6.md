# Änderungsprotokoll 0.19.6 — „Die Ansicht kann fort sein"

**PATCH · 3. September 2026 · ein Feldbefund aus 0.19.5 und eine
Sprachentscheidung fürs ganze Projekt.** *Angefasst sind `public/app.js`,
`bilder.js`, `bestandslauf.js`, `server.js`, `db.js`, `public/style.css`,
`pruefung.js`, `gegenprobe.js`, `package.json`, `package-lock.json` und die
Papiere.*

**KEINE DATENBANKSTUFE** — kein Migrationsblock, keine Schemaänderung, kein
neuer Index, keine neue Route, keine neue Karte, keine neue ausgelieferte
Datei, **und diesmal auch kein Lauf, der etwas überschreibt.** Austauschformat
**12**, `F_ROUTEN` **70**, acht Migrationsblöcke, neunzehn Karten, neun
ausgelieferte Module.

> **DIE RUNDE ÄNDERT DREI ZEILEN VERHALTEN UND EIN WORT.** Das Verhalten steht
> in Abschnitt 1 bis 3, das Wort in Abschnitt 4. *Beides kam aus dem Feld, am
> selben Tag, an derselben Runde: 0.19.5 war seit einer Stunde eingespielt.*

---

## Der Befund aus dem Feld — wortgleich

> *„Bild sieht echt gut aus aber ich bekomme eine rote Fehlermeldung unten wenn
> ich auf Overview zurück gehe und zwar: ‚can't access property innerHTML …'.
> Der Fehler kommt aber bisher zumindest immer wenn ich Ausschnitt anwähle
> verändere (400 %) und direkt ins Übersicht gehe. Vielleicht bevor es
> speichern kann. … Oft sehe ich, wenn ich ins Overview springe,
> ‚Bildausschnitt gespeichert'. Wo der Fehler kommt, sehe ich diese Meldung
> vorher nicht."*

**DIE VERMUTUNG IM BEFUND WAR RICHTIG, UND SIE WAR ES GENAUER, ALS SIE
KLINGT.** Es ist ein Wettlauf, und der letzte Satz benennt ihn: **die rote
Meldung steht an der Stelle, an der sonst die grüne steht.** Es sind nicht zwei
Ereignisse — es ist dasselbe, einmal geglückt und einmal falsch gemeldet.

---

## 1. Was wirklich passiert ist

**DER AUSSCHNITT WAR JEDES MAL GESPEICHERT.** Der Fehler lag hinter dem
Speichern, nicht davor:

```
speichere()
  ├─ await api('PUT', …/focus)      ← 494 bis 873 ms (gemessen in 0.19.5)
  │                                    ← hier klickt der Benutzer „Übersicht"
  ├─ drawThumbs()                    ← document.getElementById('thumbs') → null
  │                                    → box.innerHTML wirft
  └─ toast('Bildausschnitt gespeichert')   ← wird nie erreicht
        …
  catch (e) { toast(e.message, true) }     ← und WIRFT DIE ROTE MELDUNG
```

**DER `catch` WAR FÜR DIE ABSAGE DES SERVERS GEDACHT UND HAT EINEN
BROWSERFEHLER GEFANGEN.** Deshalb stand im roten Kasten auch kein Satz der
Instanz, sondern der Wortlaut von Firefox: *„can't access property innerHTML,
box is null."* **Eine Fehlermeldung über einen Vorgang, der geglückt ist** —
und der Grund, warum die Bestätigung genau dann fehlte (Stolperstein 298).

### Warum ausgerechnet 400 Prozent

**WEIL DIESE BEDIENUNG AM LÄNGSTEN WARTET.** Die Route wartet auf die neue
Kachel, und das Erzeugen kostet nach den Messungen aus 0.19.5 157,3 ms im
Median, 247,0 ms im 95. Perzentil, das Zurückschreiben bis 473,7 ms. **Wer den
Schieber loslässt und sofort klickt, hat ein Fenster von einer halben bis einer
ganzen Sekunde.** *Der Befund nennt 400 %, weil man dort am ehesten mehrfach
nachjustiert — je öfter man speichert, desto öfter trifft man das Fenster.*

> **NICHT VERWECHSELN MIT STOLPERSTEIN 295:** dass der WEITESTE Ausschnitt am
> teuersten ist, gilt für das Erzeugen der Kachel. Für dieses Fenster zählt
> nicht die einzelne Messung, sondern **dass überhaupt gewartet wird.**

---

## 2. Was gebaut wurde

**EINE WACHE JE ZEICHENWEG, AN DER WURZEL UND NICHT AN DER AUFRUFSTELLE.**

| | Datei | Was |
|---|---|---|
| **1** | `public/app.js` — `drawViewer()` | `if (!v) return;` **vor** dem ersten Zugriff auf den Betrachter |
| **2** | `public/app.js` — `drawThumbs()` | `if (!box) return;` **vor** `box.innerHTML` — die Zeile, an der es geworfen hat |
| **3** | `public/app.js` — `speichere()` | Ein Kommentar, der festhält, **dass die Bestätigung mit Absicht auch dann kommt**, wenn die Ansicht schon fort ist |

**WARUM AN DER WURZEL:** die beiden Funktionen werden aus **sechs** Stellen
hinter einem `await` gerufen — Ausschnitt speichern, Foto löschen (zwei Wege),
Hochladen (zwei Wege), Reihenfolge ändern. *Sechs Wachen wären sechs
Gelegenheiten, die siebte zu vergessen.* **Es ist dieselbe Regel wie in
`zeichneZugaenge()`**, nur eine Stufe einfacher: dort wird ein gehaltener
Knoten auf `isConnected` geprüft, hier ein frisch gesuchter auf sein Dasein.

**UND DIE BESTÄTIGUNG BLEIBT STEHEN.** Das ist eine Entscheidung und kein
Nebeneffekt: gespeichert ist gespeichert. *Der Toast hängt am `body` und nicht
an der Ansicht — er überlebt den Wechsel von selbst; nur gezeichnet wird nicht
mehr.*

> **WAS NICHT GEBAUT WURDE, UND WARUM ES BENANNT GEHÖRT:** dieselbe Lücke steht
> an den übrigen Zeichenwegen der Detailansicht — Kommentare, Anhänge, Links,
> Bewertungen, Testtage. **Sie ist dort dieselbe, aber viel schwerer zu
> treffen**: keiner dieser Wege wartet auf eine Bildverarbeitung. *Der saubere
> Weg dafür wäre eine Ansichtsnummer, die `route()` hochzählt — dann bliebe ein
> fehlendes Element bei STEHENDER Ansicht weiterhin laut. Das ist eine eigene
> Runde und steht in Abschnitt 10 des Projektstands.*

---

## 3. Was der Prüfstand dazu sagt

**EINE NEUE GRUPPE, „Die Ansicht kann fort sein — 0.19.6", MIT NEUN ZUSAGEN.**
Geprüft wird **der echte Weg** und kein nachgestelltes DOM — die acht Schritte
darunter tragen sie, die erste Zeile prüft dabei zwei Dinge:

1. Die Prüflage steht überhaupt — Ausschnittschalter und Schieber sind da.
   *Ohne diese beiden Zeilen wäre „keine rote Meldung" trivial wahr, sobald der
   Modus gar nicht aufgeht (Stolperstein 161).*
2. **Der Ruf wird angehalten** — `fetch` auf `…/focus` gibt ein Versprechen
   zurück, das der Prüflauf selbst löst.
3. Der Schieber geht auf **400** und speichert; der Ruf ist unterwegs.
4. **Die Adresse wechselt wirklich** auf `#/`, `route()` zeichnet die
   Übersicht, Betrachter und Streifen sind aus der Seite verschwunden.
5. **Erst jetzt** kommt die Antwort zurück.
6. **Keine rote Meldung.**
7. **Und die Zusage „gespeichert" steht trotzdem da.**
8. **Die Gegenprobe an der stehenden Ansicht:** der Streifen zeichnet seine
   Kacheln wirklich. *Ohne sie wäre die Wache kein Wächter, sondern ein
   Ausschalter — wer `drawThumbs()` leert, bliebe grün.*

Dazu zwei Zusagen am Quelltext, dass **beide** Zeichenwege die Wache tragen —
der Betrachter lässt sich im Prüflauf nicht so leicht in denselben Wettlauf
bringen, er hängt am Löschen und am Hochladen statt am Schieber.

**DREI NEUE RÜCKBAUTEN — 541, 542, 543.** Der dritte ist der wichtigste: er
nimmt nicht die Wache weg, sondern das, was sie bewacht.

| Nr. | Rückbau | erwartet rot in |
|---|---|---|
| **541** | Der Bilderstreifen fragt nicht, ob seine Ansicht noch steht | Die Ansicht kann fort sein — 0.19.6 |
| **542** | Der Betrachter fragt nicht, ob seine Ansicht noch steht | dieselbe |
| **543** | Der Bilderstreifen zeichnet überhaupt keine Kacheln mehr | dieselbe |

### Der Gegenprobenlauf — drei gefahren, keiner stumm

**JEDER DER DREI MACHT NAMENTLICH DIE RICHTIGEN ZUSAGEN ROT.** *Gefahren gegen
den Stand im Kopf des Zweiges, zwei Nebenspuren, je rund sieben Minuten.*

| Nr. | bestanden | rot geworden |
|---|---|---|
| **541** — Streifen ohne Wache | 5242 / 5246 | **„Keine rote Meldung, wenn die Antwort in eine fortgegangene Ansicht fällt"**, „Und die Zusage ‚gespeichert' steht trotzdem da", „Und der Bilderstreifen ebenso" |
| **542** — Betrachter ohne Wache | 5244 / 5246 | „Der Betrachter fragt erst, ob seine Ansicht noch steht" |
| **543** — Streifen zeichnet nichts | 5238 / 5246 | „Bei stehender Ansicht zeichnet der Streifen seine Kacheln" **und sechs Zusagen der Gruppe „Videos am Bildschirm"** — *der Beleg, dass die Wache kein Ausschalter ist* |

> **RÜCKBAU 541 IST DER EIGENTLICHE BELEG DIESER RUNDE:** er stellt genau den
> gemeldeten Fehler wieder her, und die neue Gruppe meldet ihn namentlich —
> *„Keine rote Meldung …" wird rot, und die Bestätigung fällt mit ihm aus.*
> **Beides zusammen ist der Befund aus dem Feld, Zeile für Zeile.**

---

## 4. Das Wort — „gebacken" ist raus

**AUS DEM FELD, IM SELBEN ATEMZUG:** *„‚Vorschaubilder gebacken: 960 von 1063
geprüften — 9,9 MB weniger.' Gebacken … was ist das für eine Sprache? Erstellt,
generiert, konvertiert — such dir etwas aus, aber bitte nicht gebacken."*

**DAS WORT IST AUS DEM GANZEN PROJEKT VERSCHWUNDEN** — nicht nur aus der einen
Meldung. *Ein Wort, das in der Oberfläche falsch ist, ist im Quelltext daneben
nicht richtiger; und zwei Wörter für dieselbe Sache sind zwei Wahrheiten
(Stolperstein 47).*

**GEWÄHLT WURDE NICHT EIN ERSATZWORT, SONDERN DREI — je nachdem, wovon die Rede
ist.** *„Generiert" und „konvertiert" sind in dieser Instanz sonst nirgends
gebraucht; „Zuschnitt" und „Ableitung" dagegen schon, seit 0.19.0.*

| Wovon die Rede ist | bis 0.19.5 | ab 0.19.6 | Beispiel |
|---|---|---|---|
| **Der Lauf über den Bestand** | backen | **erneuern** | „Vorschaubilder **erneuert**: 960 von 1063 geprüften" |
| **Das Herstellen einer Ableitung** | backen | **erzeugen** | „Das **Erzeugen** kostet 157,3 ms im Median" |
| **Der Ausschnitt sitzt im Bild** | gebacken | **eingerechnet** | „Der Ausschnitt wird **eingerechnet**, nicht gezogen" |
| **Die fertige Kachel** | gebackene Kachel | **zugeschnittene Kachel** | „Eine **zugeschnittene** Kachel ist quadratisch" |

**WAS SICH DADURCH IN DER OBERFLÄCHE ÄNDERT** — zwei Zeilen in der Karte
„Bildablage" und sonst nichts:

| | bis 0.19.5 | ab 0.19.6 |
|---|---|---|
| während des Laufs | „Vorschaubilder werden **gebacken** — 12 von 89 …" | „Vorschaubilder werden **erneuert** — 12 von 89 …" |
| danach | „Vorschaubilder **gebacken**: 960 von 1063 geprüften" | „Vorschaubilder **erneuert**: 960 von 1063 geprüften" |

**UND IM PROTOKOLL DES SERVERS:** `Kacheln gebacken:` → `Kacheln erneuert:`,
`Kachel N nicht gebacken:` → `Kachel N nicht erneuert:`.

### Was dabei mitgezogen werden musste

**EIN WORT ZU TAUSCHEN IST IN DIESEM PROJEKT KEINE SUCHEN-UND-ERSETZEN-ARBEIT**
— es hängen Zusagen daran:

| Was | Zahl | Warum es mitmuss |
|---|---|---|
| Bezeichner im Quelltext | 5 | `backeKacheln` → `erneuereKacheln`, `backeZeile` → `erneuereZeile`, `backeEineKachel` → `erneuereEineKachel`, `backeKachelNeu` → `erneuereKachel`, `BACKFRIST_MS` → `ERNEUERUNGSFRIST_MS` |
| Nachricht zwischen Thread und Server | 1 | `{ art: 'gebacken' }` → `{ art: 'erneuert' }` — beide Seiten |
| Lokale Größe in `makeVariants()` | 1 | `const gebacken` → `const geschnitten` — **der Prüfstand liest diese Zeile im Quelltext** |
| Suchtexte der Gegenprobe | 6 | Rückbauten 516, 517, 532, 533, 534, 535 — ein Suchtext, der ins Leere greift, prüft nichts mehr |
| Verweise auf den Gruppennamen | 22 | die Gruppe heißt jetzt **„Der Ausschnitt steckt in der Kachel — 0.19.5"** |
| Zusagen im Prüfstand | 49 | Namen, Kommentare **und** vier Zusagen, die am Wortlaut selbst hängen |

> **DER PRÜFSTAND HAT DABEI FÜR SICH SELBST GESORGT.** Seine Selbstprobe
> *„Jeder Suchtext kommt in seiner Datei genau einmal vor"* ist genau die
> Zusage, die eine solche Umbenennung braucht — sie hätte jeden der sechs
> abgehängten Rückbauten gemeldet. *Nachgesehen wurde vorab trotzdem, an allen
> 531 Suchtexten auf einmal: es waren genau diese sechs.*

**WAS NICHT ANGEFASST WURDE: `Doku/Auftrag_0.19.5.md`.** Das ist das Papier des
Auftraggebers und kein Papier der Instanz. *Das Änderungsprotokoll 0.19.5 und
der Projektstand dagegen sind mitgezogen — sie werden weitergelesen, und der
Rundentitel 0.19.5 heißt seither „Der Ausschnitt wird eingerechnet, nicht
gezogen".*

---

## 5. Neuer Stolperstein — 298

**298. EINE ANTWORT, DIE NACH DEM ANSICHTSWECHSEL EINTRIFFT, ZEICHNET IN EINE
SEITE, DIE ES NICHT MEHR GIBT — UND DER WURF WIRD ZUR FALSCHEN
FEHLERMELDUNG.** Der volle Wortlaut steht in Abschnitt 6 des Projektstands.
*Der Kern in einem Satz: ein `catch`, der für die Absage des Servers gedacht
ist, fängt auch einen Fehler des Browsers — und meldet dann rot, was in
Wahrheit geglückt ist.*

---

## 6. Was offen geblieben ist

- **Die übrigen Zeichenwege der Detailansicht** tragen die Wache nicht
  (Abschnitt 2, Kasten). *Dieselbe Lücke, viel schwerer zu treffen; der saubere
  Weg ist eine Ansichtsnummer.*
- **Die Übersicht kann nach demselben Wettlauf eine Fassung zu alt sein.** Wer
  vor dem Ende des Speicherns wechselt, holt die Liste mit dem `?v=` von
  vorher; die Karte zeigt dann die alte Kachel, bis die Liste das nächste Mal
  geholt wird. *Kein Fehler, keine Meldung — aber ein sichtbarer Rest desselben
  Fensters, und er gehört benannt.*
- **Der volle Gegenprobenlauf** über alle 535 Rückbauten (~40 Stunden) steht
  weiter aus; gefahren sind in dieser Runde die drei neuen.
- `reclaim()` hat weiterhin keine greifende Gegenprobe (aus 0.19.5).
