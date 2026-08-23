# Änderungsprotokoll 0.8.31 — „Dateien bekommen Verfasser"

**Rohstoff für die Dokumentenpflege.**

**0.8.31 — Fingerprint `1a801477`**

Eine **Berichtigungsrunde**, keine Stufe — und das ist der Grund für die
Nummer. Die Regel aus G4 galt sachlich immer schon auch für Dateien; sie war
nur nicht gebaut. Statt eine neue Stufe zu nummerieren und alles darüber
zehnerweise zu verschieben, nimmt die Runde eine der neun Nummern, die zwischen
zwei Stufen genau dafür frei stehen (Projektstand, Abschnitt 10).

**Was sie trotzdem ist: eine Datenbankstufe.** `attachments` bekommt eine
Spalte, es gibt einen Migrationsblock, und die Formatnummer geht **7 → 8**. Die
Sicherung des Datenverzeichnisses gehört in den Einspielweg.

Prüfungen: **1624 → 1682** (58 neue), alle grün. **16 Gegenproben**, jede in
einer Kopie des Arbeitsbaums.

`F_ROUTEN` bleibt bei **46** Routen; **eine** wechselt ihre Art
(`POST /api/items/:id/attachments` → `'offen'`).

---

## 1. Was gebaut wurde, je Datei

### `db.js` (+39/−6 Zeilen)

`attachments` trägt `user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`
— dieselbe Form wie an den fünf anderen Trägern. Dazu `migration0831()` mit den
Marken der Bauregel; die Bestandszeilen fallen an den **Verfasser ihres
Eintrags**, aus demselben Grund wie bei den Links: bis 0.8.30 *waren* die
Dateien eines Eintrags die Sache seines Verfassers.

`ordneBestandZu()` läuft jetzt über **sechs** Tabellen.

### `server.js` (+56/−26 Zeilen)

- `qAttachments` holt `user_id`; `detail()` hängt `verfasser` und `mine` an und
  entfernt die nackte Nummer.
- **`POST /api/items/:id/attachments` verliert `nurEintragVerfasser`** und
  schreibt `req.benutzer.id`. Der Wächter stand **vor** multer — er fällt
  vollständig weg, die Grenze von `ANHANG_ZAHL` Dateien je Eintrag gilt
  weiterhin für alle zusammen.
- **`DELETE /api/attachments/:id` klemmt auf `darfAendern(req, a.user_id)`.**
- **Export:** `author` an jedem Anhang, **Formatnummer 7 → 8**.
- **Import:** liest beide Formen.
- `GET /api/items/:id/bestand` nennt `eigenDateien`/`fremdDateien`.

### `auth.js` (+9/−5 Zeilen)

`zaehleBestand()` um beide Richtungen ergänzt, `entferneZugang()` räumt die
Dateien beim zweiten Häkchen mit weg.

### `public/app.js` (+38/−16 Zeilen), `public/style.css` (+12/−3 Zeilen)

`drawAtts()` zeigt den Namen und richtet das ✕ nach dem Recht. Beide
Löschdialoge nennen Dateien getrennt nach eigen und fremd.

### `pruefung.js` (+476/−32 Zeilen)

Zwei neue Gruppen, umgedrehte Prüfungen, der zweite Migrationsabschnitt.

---

## 2. Abweichungen und Entscheidungen

### A. Die Nummer ist 0.8.31, nicht 0.8.40

Sachlich ist es dieselbe Wende wie G4, nur am anderen Träger — deshalb keine
eigene Stufe. Die Zehnerschritte des Stufenplans bleiben unangetastet: 0.8.40
ist weiterhin die Gewichtung. **Das war der Zweck der Zehnerschritte**, und
dies ist der erste Fall, in dem sie sich auszahlen.

### B. Die Formatnummer rückt trotzdem weiter, 7 → 8

Das lässt sich nicht vermeiden: ein neues Feld in der Exportdatei ist eine
Formatänderung, unabhängig davon, wie die Version heißt. **Folge für die
Nachbarpapiere:** die Gewichtung (0.8.40) geht damit **8 → 9**, die Kurzvideos
(0.8.50) **9 → 10**. Beide Papiere sind nachgezogen.

### C. Der Name steht hinter der Größe, nicht hinter dem Dateinamen

Anders als die Linkzeile hat die Dateizeile **keine zweite Zeile** — sie ist
einzeilig: Symbol, Name, Größe, Pfeil, Ladepfeil, ✕. Der Name des Hochladenden
steht deshalb bei den Angaben **zur** Datei, also rechts neben der Größe.

Der Grund ist der Platz und die Rangfolge: der **Dateiname** ist die Hauptsache
der Zeile, er steht links und darf nicht schrumpfen, um einer Nebenangabe Platz
zu machen. `flex-shrink: 0` am Namen des Hochladenden, wie an der Linkzeile.

Die Form ist dieselbe wie dort: **`(chefin)`**, in Klammern, ohne Trennzeichen.

### D. Der Wächter fiel *vor* multer weg — und das ist mehr, als es aussieht

An der Linkroute stand der Wächter vor einem gewöhnlichen Rumpf. An der
Dateiroute stand er **vor `anhangUpload.array(...)`**, mit dem ausdrücklichen
Zweck, „die Datei eines Fremden gar nicht erst einzulesen". Diese Begründung
ist mit dieser Runde gegenstandslos: ein Fremder *darf* hochladen.

Was **bleibt**, ist die Mengengrenze: `ANHANG_ZAHL` Dateien je Eintrag, für
alle zusammen und nicht je Benutzer. Sie steht im Rumpf, hinter multer, und
war nie die Rechtefrage.

### E. Die Unterscheidung „Feld fehlt" gegen „author ist null"

Beim Link genügte `'author' in eintrag`, weil der Link selbst entweder eine
String oder ein Objekt ist. Beim Anhang ist es **immer** ein Objekt — die
Bytes müssen ja irgendwo stehen. Die Unterscheidung läuft deshalb allein über
das Vorhandensein des Feldes:

| in der Datei | wem sie gehört |
|---|---|
| kein Feld `author` (Format bis 7) | dem **Verfasser des Eintrags** |
| `author: "carla"`, Zugang vorhanden | **carla** |
| `author: "dora"`, Zugang unbekannt | dem **Einspielenden**, laut gemeldet |
| `author: null` | dem **Einspielenden** |

Die letzten beiden Zeilen sind der Grund, warum es `hatAutor` gibt und nicht
nur eine Prüfung auf Wahrheitswert: `null` heißt „ausdrücklich niemand
genannt" und ist etwas anderes als „diese Datei kennt das Feld nicht".

---

## 3. Neue Stolpersteine

**Keine.** Diese Runde ist die zweite Anwendung eines Musters, das in 0.8.30
entstanden ist — und alle fünf Stolpersteine von dort haben getragen:

- **104** (jede von Hand angelegte Prüfzeile trägt ihren Verfasser) hat sich
  sofort bezahlt gemacht: die Prüflage der Rechtegruppe legte ihre Datei ohne
  `user_id` an, und „der Admin löscht eine **fremde** Datei" hätte eine eigene
  gelöscht. Diesmal war es vorher klar und nicht erst nach einer Gegenprobe.
- **101** (die Gegenrichtung an beiden Orten prüfen) hat den Rückbau „Wächter
  zurück vor `POST …/attachments`" namentlich rot gemacht — die Prüfung, die
  es in 0.8.30 noch nicht gab.
- **102** (der Mock deckt die Serverseite zu) hat verhindert, dass die
  Verfasserangabe an der Dateizeile nur im Mock existiert.

---

## 4. Gegenprobentabelle

**16 Rückbauten, jeder in einer Kopie des Arbeitsbaums** (Stolperstein 100),
und vor jedem Deuten per `diff` belegt (Stolperstein 75).

| Rückbau | Ergebnis |
|---|---|
| `user_id` aus der `attachments`-DDL | **1 rot** — nur „Eine frische Anlage trägt die Spalte ohne Migration". *Stolperstein 81 in Reinform* |
| die Migration ordnet niemanden zu | 4 rot — darunter der Lauf, der **beide** Migrationen hintereinander fährt |
| `attachments` aus `ordneBestandZu()` | 3 rot |
| `nurEintragVerfasser` wieder vor `POST …/attachments` | 5 rot, darunter „Und erst recht kein Wächter in der Routenzeile" (Stolperstein 101) |
| `POST` schreibt keine `user_id` | 6 rot, darunter „attachments: keine der 3 Zeilen ist ohne Benutzer" |
| `DELETE /api/attachments/:id` fragt wieder `eintragFrei` | 3 rot |
| Export ohne `author` am Anhang | **1 rot** |
| Formatnummer bleibt 7 | **1 rot** |
| Dateien ohne `author`-Feld fallen an den Einspielenden | **1 rot** |
| `bestand` nennt Dateien wieder als **eine** Zahl | 2 rot |
| `zaehleBestand()` ohne Dateien | **1 rot** |
| `entferneZugang()` räumt die Dateien nicht mit | **1 rot** |
| Name ohne die Schwelle `mehrereBenutzer()` | 2 rot |
| Name an **jeder** Datei | 2 rot — **andere** Namen als darüber |
| ✕ an jeder Datei | 2 rot |
| `flex-shrink: 0` am Namen entfernt | **1 rot** |

**Kein Rückbau blieb stumm, keiner riss den Lauf ab.** Das letzte Paar der
Anzeigeregel färbt wieder je eigene Namen rot — dieselbe Bauform wie an der
Linkzeile, und sie trägt auch hier.

---

## 5. Prüfungszahlen

**1624 → 1682, alle grün.** 58 neue Prüfungen, zwei neue Gruppen.

| Gruppe | Prüfungen | |
|---|---|---|
| `MIGRATION 0.8.31 — ENTFAELLT MIT 1.0` | 13 | neu |
| `Der Name an der Dateizeile` | 17 | neu |
| `Verfasser in Export und Import` | +11 | erweitert |
| `Rechte am Eintrag` | +6 | erweitert |
| `Der Waechter ueber den Quelltext` | +4 | erweitert |
| `Loeschen entwertet, es loescht nicht` | +4 | erweitert |
| `Der Loeschdialog am Eintrag` | +2 | erweitert |
| `Keine Zeile ohne Benutzer` | +1 | erweitert |

**Zwei Dinge im Migrationsabschnitt sind neu gegenüber 0.8.30:**

- **Der Erfolgsfall läuft über einen echten Multipart-Upload.** Der Wächter
  stand vor multer; ein nachgereichter `INSERT` liefe an beidem vorbei und
  bewiese nichts über die Route. Dafür gibt es eine eigene Upload-Hilfe gegen
  den Rechteserver, mit dem Cookie des jeweiligen Rufers.
- **Ein Lauf fährt BEIDE Migrationen hintereinander** — die Lage, die im Betrieb
  wirklich vorkommt: wer von 0.8.20 auf 0.8.31 geht, bekommt `migration0830()`
  und `migration0831()` in einem Start. Belegt wird, dass beide Protokollzeilen
  erscheinen und beide Zeilen beim Verfasser ihres Eintrags landen.

Und die Prüfgruppe „Keine Zeile ohne Benutzer" hat sich beim Bau selbst
bewährt: sie stand zuerst auf **0 Dateien** und blieb grün — „keine der 0
Zeilen ist ohne Benutzer" ist wahr und belegt nichts. Rot wurde die Zeile
daneben, die den Bestand auf eine Schwelle prüft. Genau dafür steht sie da.

---

## 6. Vorgemerkt für 1.0

*Zum Übernehmen in Projektstand Abschnitt 10 — der **dritte** markierte Block
im Projekt.*

> - **`db.js`, `migration0831()` — 27 Zeilen samt Marken, 13 Prüfungen** (seit
>   0.8.31). Ergänzt `user_id` an `attachments` in einer Datenbank aus 0.8.0
>   bis 0.8.30 und ordnet die Bestandszeilen dem **Verfasser ihres Eintrags**
>   zu. Zu 1.0 fällt der Block weg, **die Spalte in der DDL bleibt**. Die
>   zugehörigen Prüfungen stehen im Abschnitt „MIGRATION 0.8.31 — ENTFAELLT MIT
>   1.0" in `pruefung.js`; der Export von `migration0831` in `module.exports`
>   trägt dieselbe Marke und fällt mit.
>   **Was NICHT mitfällt:** `attachments` in der Tabellenliste von
>   `ordneBestandZu()` — das Auffangnetz ist keine Migration.
>   **Und was mit beiden Blöcken zugleich fällt:** die Prüfung „Ein Sprung von
>   0.8.20 fährt BEIDE Migrationen in einem Start". Sie gehört keinem der beiden
>   allein.

---

## 7. Offen geblieben

- **Der Docker-Bau ist für diese Runde nicht wiederholt worden.** Der Beleg
  aus 0.8.30 gilt unverändert für Image, Fassungen und Übersetzerfreiheit;
  diese Runde fasst keine Abhängigkeit an. Der **Migration** ist im Prüfstand
  belegt, nicht im Container — anders als bei 0.8.30.
- **Der Wortlaut des Löschdialogs am Zugang bleibt oberflächenungeprüft.**
  Unverändert aus 0.8.30; die Zahlen dahinter sind geprüft, der Satz nicht.
- **Fotos sind weiterhin kein Träger.** Sie hängen am Eintrag und gehören
  seinem Verfasser — anders als Links und Dateien erscheinen sie nicht „nur
  dort, wo man sie hinsetzt", sondern sind der Eintrag selbst. Das ist eine
  Entscheidung, keine Auslassung: das erste Foto ist das Hauptbild, und die
  Reihenfolge ist Sache dessen, dem der Eintrag gehört.
