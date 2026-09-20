# Änderungsprotokoll 0.38.1 — „Sechs Befunde des Betriebs"

Gebaut am 20. September 2026, auf 0.38.0. PATCH.

Der Betreiber hat 0.38.0 eingespielt und binnen einer Stunde sechs Stellen
gemeldet. Zwei sind Fehler, zwei sind Bedienung, zwei sind beides. **Keine
Schemaänderung, keine neue Route, kein neuer Schlüssel in den Sprachdateien.**

| | vorher | nachher |
|---|---:|---:|
| Zeilen in `public/app.js` | 10.282 | **10.372** |
| davon Kommentar | 1.917 | **1.942** |
| Regelzeilen in `public/style.css` | 1.666 | **1.672** |
| Schlüssel je Sprachdatei | 1.229 | **1.229** |
| Auslieferung, gzip | 268.051 | **269.920** |
| Prüfungen | 7.145 | **7.173** |
| Rückbauten | 1.086 | **1.092** |

> **FINGERPRINT DIESER RUNDE: `f86abf3b`** — der Stand davor war `43f6f1be`.

---

## 1. Die Zwischenablage über eine Adresse im Netz

**Ein Klick auf die Kommentarnummer kopierte nicht**, sondern zeigte rot
„Bitte von Hand kopieren."

Die Ursache ist eine Regel des Browsers, kein Fehler im Code: `navigator.clipboard`
wird nur in einem **sicheren Kontext** herausgegeben — https, `localhost`,
`127.0.0.1`. Eine Adresse wie `http://192.168.1.50:3100` zählt nicht dazu, und
das Attribut liegt dort gar nicht erst auf dem Objekt. `README.md` nennt genau
diesen Weg als Normalbetrieb im Heimnetz.

**Ein zweiter Weg war nicht gebaut.** Jetzt geht `copyText()` drei Stufen:

1. `navigator.clipboard.writeText`
2. ein kurzlebiges Feld über `document.execCommand('copy')` — das hängt nicht
   am sicheren Kontext, nur an einem laufenden Klick
3. erst dann die Meldung

**Auswahl und Fokus werden gesichert und zurückgesetzt.** Ohne das nähme der
Rückfall im Lesemodus genau die Markierung weg, die zitiert werden soll. Das
Lesen der Schreibstelle steht in einem `try`: ein Feld vom Typ `email` oder
`number` wirft dabei.

**Alle fünf Kopierstellen laufen jetzt durch denselben Weg** — die
Kommentarnummer, das Menü im Lesemodus, die Knöpfe mit `data-copy`, der
Zwei-Faktor-Schlüssel und der Einladungslink. `navigator.clipboard` steht
danach nur noch an einer Stelle im ganzen Browsercode.

**Und die Meldung nennt den Grund**, statt etwas zu verlangen, das nicht geht:
an der Kommentarnummer steht die Adresse nirgends am Bildschirm, sie entsteht
erst im Klick.

| Schlüssel | vorher | jetzt |
|---|---|---|
| `card.copyByHand` | „Bitte von Hand kopieren." | „Ohne https gibt der Browser die Zwischenablage nicht frei." |
| `card.copyByHandLink` | „…— der Link ist markiert." | „… Der Link ist markiert." |
| `card.typeByHand` | „Bitte von Hand abtippen." | „… Der Schlüssel steht oben." |

*Die drei vorhandenen Werte sind geändert, kein Schlüssel ist dazugekommen.
Ein neuer hätte acht feste Zahlen im Prüfstand bewegt und keinen Satz besser
gemacht.*

---

## 2. Leerraum am Rand der Auswahl

**Wer eine eingerückte Zeile markierte und den Fettdruck drückte, bekam keinen
Fettdruck.** Das Menü legte die Marken unmittelbar um die Auswahl, also
`**  Zeile  **` — und das ist nach der Flankenregel der Spezifikation kein
öffnender Lauf: hinter `*` oder `_` darf kein Leerzeichen stehen.

Gemessen am Leser:

```
"**  Zeile  **"   ->  bleibt Text
"  **Zeile**  "   ->  strong
```

`markupAround()` lässt den Leerraum jetzt **außerhalb** der Marken.

**Der Code-Abschnitt ist ausgenommen.** `markupCode()` benutzt die
Flankenregel nicht; dort ist Leerraum erlaubt und gewollt, `` `  Wort  ` ``
ist heute richtig. Eine Auswahl aus lauter Leerraum bleibt ebenfalls, wie sie
war — dort wird der Leerraum zwischen die Marken gestellt und beim Tippen
ersetzt.

*Keine Prüfung hat `markupAround()` bis hierher je gerufen. Das ist der Grund,
warum es niemandem aufgefallen ist.*

---

## 3. Der Stift

**Er war nicht markant, und er stand nie im Auftrag.** `Doku/Auftrag_0.38.0.md`
nennt den Stift dreimal, an keiner Stelle eine Farbe. Er hat deshalb die Farbe
bekommen, die dort alle Schalter tragen.

| | Kontrast dunkel | Kontrast hell |
|---|---:|---:|
| `--faint`, wie bisher | 2,95 : 1 | 3,75 : 1 |
| `--accent-text`, jetzt | **6,22 : 1** | **4,97 : 1** |
| beim Überfahren | 7,38 : 1 | 6,56 : 1 |

Der Prüfstand setzt für Schrift 4,5 : 1 an. Der Stift lag darunter.

**Rot war gewünscht und ist nicht gebaut.** `var(--red)` steht 25 Mal im
Stilblatt: 13 Mal am Löschen, 12 Mal an Fehler und Frist, kein einziges Mal an
einer Bearbeitung. Rot hätte 4,76 : 1 gebracht, die Akzentfarbe bringt 6,22.
*Die Entscheidung liegt beim Betreiber; er hat sie nach der Messung getroffen.*

**Eine Regel für alle vier Stifte.** `public/app.js` trägt `mact ed` an vier
Stellen: Kommentar, Beschreibung, Ablehnungsgrund und Kartenname. Der Code
verlangt an der dritten ausdrücklich dieselbe Bauform wie am Kommentar — eine
Regel nur für den Kommentar hätte sie auseinanderlaufen lassen.

---

## 4. Die Nummer nach rechts, ein Abstand vor dem Löschen

Die Nummer stand links vor Verfasser und Datum. **Sie steht jetzt rechts**, wo
sie in jedem Forum steht.

**Aber nicht in der Aktionsgruppe.** Zwei Gründe, beide gemessen:

- `.acts` wird beim Bearbeiten auf `visibility: hidden` geschaltet. In der
  Gruppe verschwände die Nummer mit.
- Eine Prüfung verlangt, dass in `.acts` nur Zeichen stehen, höchstens zwei je
  Knopf. Ab dem zehnten Kommentar wäre `#10` drei Zeichen — die Prüfung bliebe
  nur deshalb grün, weil die Prüflage sechs Kommentare hat.

**Der Abstand vor dem Löschkreuz** ist `.6em` — bei der Monoschrift der
Kopfzeile 6,57 Pixel, die Breite eines Zeichens. Die Schalter standen 8 Pixel
auseinander, jetzt 14,57. **Am Finger sind es 11 Pixel statt 2**: dort ist die
Polsterung größer und der Abstand war enger.

*Das Löschen eines Kommentars fragt nicht nach. Der Abstand ist damit die
einzige Schranke gegen den Fehlgriff, nicht nur eine Bequemlichkeit.*

---

## 5. Der Verweis sprang nur beim ersten Klick

Der Kasten ist ein `<a href="#/item/45?c=157">`. Der erste Klick ändert
`location.hash`, das löst `hashchange` aus, `route()` zeichnet neu und springt.
**Steht die Adresse danach schon so, meldet der Browser keinen Wechsel** — kein
`hashchange`, kein `route()`, nichts.

Der Sprung steht jetzt als `commentJump()` außerhalb des Zeichnens, und der
Kasten ruft ihn selbst, wenn die Adresse schon am Ziel steht. **Strg-,
Umschalt- und Mittelklick bleiben dem Browser**, damit „in neuem Tab öffnen"
weiter trägt.

**Zwei Dinge sind dabei nebenher aufgefallen:**

- Mit einem Suchbegriff in der Adresse trat der Fehler nicht auf: sie heißt
  dann `?q=…&c=63` und ändert sich bei jedem Klick.
- `scrollIntoView` stand ohne `?.`. In jsdom gibt es die Methode nicht, der
  Aufruf warf — **keine Prüfung hat den Sprungblock je erreicht.**

---

## 6. Jede Adresse von hier wird eine Marke

Bis hierher entstand eine Marke nur aus `[Name](Adresse)` **und** nur mit
`?c=`. Zwei Lücken, beide im Code sichtbar: `markupRefScan()` sah nur Stücke
vom Typ `link`, und `markupRefOf()` gab ohne `?c=` immer `0` zurück.

**Jetzt gilt:**

| eingefügt | gezeigt |
|---|---|
| nackte Adresse von hier, mit `?c=` | Marke **Titel #n** |
| nackte Adresse von hier, ohne `?c=` | Marke **Titel** |
| `[siehe dort](…?c=157)` | Marke **siehe dort #n** |
| `[siehe dort](…/item/87)` | Marke **siehe dort** |
| jede fremde Adresse | bleibt, wie sie dasteht |

**Der selbst gesetzte Name gewinnt.** Das kehrt den Stand von 0.38.0 um, wo
der Kasten immer den Eintragstitel zeigte. *Entscheidung des Betreibers: wer
einen Namen schreibt, sieht seinen Namen; wer nur eine Adresse einfügt,
bekommt den Titel des Ziels.*

`markupRefOf()` liefert dafür einen Schlüssel statt einer Zahl — `c<n>` für
einen Kommentar, `i<n>` für einen Eintrag, leer für alles andere. Die Route
`GET /api/comment-refs` nimmt zusätzlich `items=` entgegen und deckelt **je
Art** bei zweihundert; sonst verdrängten die Kommentare die Einträge.

**Die Rechtefrage ist geprüft und ergibt nichts.** Die Tabelle `items` hat
keine Spalte für Sichtbarkeit, `GET /api/items` liest ohne Filter nach Zugang
oder Rolle, und die Route steht hinter derselben Schranke wie der Eintrag
selbst. Jeder angemeldete Zugang sieht ohnehin jeden Titel.

### Zwei Befunde nebenher, beide behoben

- **Keine Prüfung hat `GET /api/comment-refs` je gerufen.** Die Route war seit
  ihrem Bau unbelegt.
- **Ein gescheiterter Ruf machte jeden Verweis der Seite zu einem einfachen
  Link, bis die Seite neu geladen wurde.** Die gefragten Nummern wurden vor
  dem Ruf auf „nicht vorhanden" gesetzt und im Fehlerfall nicht zurückgenommen;
  `markupRefMissing()` fragte sie nie wieder. Jetzt werden sie im `catch`
  wieder entfernt.

---

## 7. Was die Runde an Größe kostet

| | vorher | nachher | Unterschied |
|---|---:|---:|---:|
| `public/app.js` gzip | 144.714 | **146.155** | +1.441 |
| `public/style.css` gzip | 52.557 | **52.898** | +341 |
| drei Sprachdateien gzip | 69.026 | **69.113** | +87 |
| **Auslieferung zusammen** | **268.051** | **269.920** | **+1.869** |

**+0,7 Prozent.**

---

## 8. Wie gearbeitet wurde

Jeder Befund ist von einem Leser im Bestand untersucht und danach von einem
**Skeptiker** geprüft worden, dessen Auftrag lautete, den Vorschlag zu
widerlegen. **Alle sechs Vorschläge sind beim ersten Anlauf widerlegt worden**,
und die Fehler waren real:

- Der erste Vorschlag zur Zwischenablage hätte im Lesemodus die Auswahl
  zerstört und bei `type="email"` geworfen.
- Der erste Vorschlag zum Leerraum hätte den Code-Abschnitt verschlechtert:
  63 Auswahlen, die heute einen Knoten liefern, hätten keinen mehr geliefert.
- Der erste Vorschlag zur Kopfzeile hätte die Nummer beim Bearbeiten versteckt
  und eine Prüfung ab dem zehnten Kommentar rot gemacht.
- Der erste Vorschlag zu den Marken hätte den Zeichenzweig vergessen, an dem
  die heutige Marke überhaupt entsteht.

*Zwei Leser haben trotz richtigem Auftrag das falsche Thema bearbeitet und
mussten wiederholt werden. Und einer hat entgegen der Anweisung in
`public/style.css` und `public/app.js` geschrieben; beides ist zurückgenommen
und von Hand neu gebaut worden.*

---

## 9. Was offen bleibt

- **Der Kasten ohne Nummer springt nicht**, wenn er auf den Eintrag zeigt, in
  dem er selbst steht. Er verhält sich dort wie ein Link auf die eigene Seite.
- **Die Strichstärke des Löschkreuzes** ist unverändert 1.8. Der Betreiber
  hatte einmal eine dickere gewünscht; sie stand in keinem Auftrag und ist
  auch hier nicht gebaut.
- **Der Trefferausschnitt zeigt den Suchbegriff nicht**, wenn er allein im Ziel
  eines Links steht — unverändert seit 0.38.0.
