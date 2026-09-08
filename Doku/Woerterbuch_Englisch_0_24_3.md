# Das englische Wörterbuch — Kriterion 0.24.3

**Bauabschnitt 0 des Auftrags 0.24.3, und er steht vor jedem übersetzten
Satz.** *Wer mittendrin merkt, dass „Eintrag" mal `Entry` und mal `Item`
heißt, hat 1259 Schlüssel zu prüfen statt eine Liste.*

**Die Regel aus 0.22.0 gilt je Sprache: eine Sache, ein Wort** — Regel **S3**
im Projektstand, Abschnitt 5.6. Dieses Papier ist die englische Fassung
derselben Regel. **Es ist verbindlich für `en.json`**, und wer ein zweites
Wort für dieselbe Sache braucht, ändert erst dieses Papier und dann alle
Stellen.

**Gegengelesen wird vom Betreiber** *(F5 des Auftrags)*. Dieses Papier ist
das, wogegen gelesen wird.

---

## Die drei englischen Regeln, die es auf Deutsch nicht braucht

- **E-S1 · Sentence case.** Knöpfe, Titel, Pillen und Kartenköpfe schreiben
  nur das erste Wort groß: **„Reset to defaults"**, nicht „Reset To Defaults".
  *Ausgenommen sind Eigennamen (`Kriterion`, `Docker`, `SMTP`) und die
  Vokabelwörter, wenn sie am Satzanfang stehen.*
- **E-S2 · Du bleibst du, und *please* steht nirgends.** Kriterion duzt; auf
  Englisch gibt es nur ein *you*. **Eine Fehlermeldung sagt, was nicht ging,
  und dann den nächsten Schritt** — ohne Höflichkeitsfloskel.
  > *Gemessen: „Bitte" steht **21-mal** in `de.json`.* **Keine einzige dieser
  > Stellen wird `please`.** „Bitte wähle eine Datei." wird **„Choose a
  > file."** — der Satz sagt dasselbe und ist kürzer.
- **E-S3 · Keine Abkürzungen, die das Deutsche nicht hat.** „e.g." nur dort,
  wo „z. B." stünde; „i.e." gar nicht. **`ID`, `URL`, `API`, `2FA`, `SMTP`,
  `MB`, `px` bleiben** — sie sind die Sache und keine Abkürzung eines Satzes.

**Und eine vierte, die aus S2 folgt:** *IT-Englisch, nicht Duden-Englisch.*
Der Maßstab ist das Wort, das ein englischsprachiger Anwender im Gespräch
sagt — *login, link, tag, upload, backup, reset, screenshot, app, code,
server*. **Die Bilder des Projekts** — Stolperstein, Gegenprobe, Klemme,
Wächter, Deckel, Pille, Kiste, Wirt, Grabstein, Tafel — **stehen auch auf
Englisch nirgends am Bildschirm**; sie bleiben in den Papieren, und die
bleiben deutsch.

---

## 1. Die vierzehn Vokabelwörter

**Sie sind Inhalt und keine Oberfläche.** Was hier steht, ist die **Vorgabe**
in `en.json` unter `vocabulary.` — das, womit eine frische englische
Installation beschriftet ist, bevor jemand etwas eingetragen hat. *Was der
Eigentümer stattdessen einträgt, steht in der Datenbank (Nachtrag zu E9/E11).*

> **DIE SCHLÜSSEL HEISSEN SEIT BAUABSCHNITT 7 ENGLISCH.** Als dieses Blatt
> geschrieben wurde — vor der ersten übersetzten Zeile —, standen dort noch
> `vocabulary.sacheEinzahl` und die dreizehn anderen. **Frage F7 ist am
> 7. September 2026 gegen den Vorschlag des Auftrags entschieden worden**, und
> damit sind auch die vierzehn Vokabelnamen umgezogen; die Tafel unten trägt
> die Namen von heute. *Die alten stehen in der Übersetzungstafel des
> Migrationsblocks in `db.js` — dort und sonst nirgends.*

| Schlüssel | Deutsch | **Englisch** | warum |
|---|---|---|---|
| `vocabulary.entryOne` | Eintrag | **Entry** | *nicht `Item`* — das ist das Wort der Warenkörbe |
| `vocabulary.entryMany` | Einträge | **Entries** | |
| `vocabulary.testedYes` | Getestet | **Tested** | |
| `vocabulary.testedNo` | Ungetestet | **Untested** | *nicht `Not tested`* — ein Wort, wie im Deutschen |
| `vocabulary.dayOne` | Testtag | **Test day** | zwei Wörter; **E-S4** verbietet das Zusammensetzen |
| `vocabulary.dayMany` | Testtage | **Test days** | |
| `vocabulary.reportOne` | Bericht | **Report** | |
| `vocabulary.reportMany` | Berichte | **Reports** | |
| `vocabulary.taskOne` | Aufgabe | **Task** | |
| `vocabulary.taskMany` | Aufgaben | **Tasks** | |
| `vocabulary.taskDone` | Erledigt | **Done** | ein Wort, ein Abzeichen |
| `vocabulary.potential` | Potenzial | **Potential** | |
| `vocabulary.ratingOne` | Bewertung | **Rating** | *nicht `Review`* — das wäre der Bericht |
| `vocabulary.ratingMany` | Bewertungen | **Ratings** | |

> **E-S4 · Kein Vokabelwort wird in ein zusammengesetztes Wort verbaut** —
> die englische Fassung von S6. **„Rating: criteria", nicht „Rating
> criteria"**, und **„Test day", nicht „Testday"**. *Der Grund ist derselbe
> wie auf Deutsch: der Eigentümer darf das Wort austauschen, und ein
> zusammengesetztes bräche dabei.*

---

## 2. Eine Sache, ein Wort — die englische S3

**Links steht die deutsche Liste aus Regel S3, Wort für Wort.** Wer sie
ändert, ändert beide.

### Zugang und Konto

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Anmelden / Abmelden | **Log in / Log out** | *als Verb zwei Wörter; das Substantiv „die Anmeldung" ist **login*** |
| Mein Konto | **My account** | |
| Benutzer | **User** | |
| Sitzung | **Session** | |
| Passwort | **Password** | |
| Zweiter Faktor · Code | **Two-factor · Code** | `2FA` bleibt `2FA` |
| Registrierung / Anfrage / beantragen | **Registration / Request / request** | *dieselbe Dreiheit wie im Deutschen: das Verfahren, die einzelne Anfrage, die Handlung* |
| Einladungslink | **Invitation link** | *nicht `Invite link`* |
| Link zum Zurücksetzen | **Reset link** | |
| Sperren / Entsperren | **Lock / Unlock** | |
| Freischalten / Ablehnen | **Approve / Reject** | *Ablehnen ist auch das Wort am Eintrag (`rejected`) — dieselbe Sache, dasselbe Wort* |
| Eigentümer · Admin · Benutzer | **Owner · Admin · User** | die drei Rollen, in der Reihenfolge der Rechteleiter |

### Was mit Dingen geschieht

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Löschen | **Delete** | **danach ist es weg** — der Satz sagt, ob endgültig oder in den Papierkorb |
| Entfernen | **Remove** | **aus einer Liste genommen**, der Gegenstand bleibt |
| Wiederherstellen | **Restore** | |
| Papierkorb | **Trash** | *nicht `Recycle bin`* |
| Speichern / Gespeichert | **Save / Saved** | |
| Abbrechen | **Cancel** | **bricht immer ab, ohne Ausnahme** (S7) |
| Umwandeln | **Convert** | |
| Erneuern | **Renew** | |
| Auf Vorgaben zurücksetzen | **Reset to defaults** | Sentence case, E-S1 |
| Vorschau | **Preview** | |
| Alle | **All** | |
| (erforderlich) / (optional) | **(required) / (optional)** | klein, in Klammern, wie im Deutschen |

### Der Bestand

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Kriterium / Kriterien | **Criterion / Criteria** | *die lateinische Mehrzahl, nicht `Criterions`* |
| Note | **Score** | *nicht `Grade`, nicht `Mark`* |
| Durchschnitt | **Average** | ⌀ steht nur vor der Zahl, wie im Deutschen |
| Gewicht / Gewichtung | **Weight / Weighting** | |
| Kategorie | **Category** | |
| Tag / Tags | **Tag / Tags** | |
| Kommentar | **Comment** | |
| Titel | **Title** | |
| Beschreibung | **Description** | |
| Sterne | **Stars** | |
| Bestand | **Inventory** | *der Abschnitt im Systembereich; im Fließtext „the entries"* |
| Neuigkeiten | **What's new** | |

### Bilder und Dateien

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Foto | **Photo** | |
| Video | **Video** | |
| Vorschaubild | **Thumbnail** | |
| Bildausschnitt | **Crop** | |
| Zoom | **Zoom** | |
| Anhang / Anhänge | **Attachment / Attachments** | |
| Datei | **File** | |
| Ordner | **Folder** | |
| Adresse | **URL** | *wo eine Webadresse gemeint ist;* **Address** *nur bei einer Mailadresse* |
| Mailadresse | **Email address** | *ein Wort `email`, kein Bindestrich* |

### Sicherung, Export, Server

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Sicherung / Sicherungen | **Backup / Backups** | |
| Sicherungsordner | **Backup folder** | |
| Export / Import | **Export / Import** | |
| Exportdatei | **Export file** | |
| In Teilen | **In parts** | |
| Schlüssel | **Key** | der Datenbankschlüssel |
| Server-Log | **Server log** | |
| Server-Einstellung `NAME` | **Server setting `NAME`** | der Name selbst bleibt, wie er ist |
| Sicherheitsprotokoll | **Security log** | |
| Instanz / Installation | **Installation** | *eine Sache, ein Wort — im Deutschen seit 0.19.1 auch* |

### Suche und Ansicht

| Deutsch | **Englisch** | Bemerkung |
|---|---|---|
| Suchmaschine | **Search engine** | |
| Standard | **Default** | *auch dort, wo im deutschen Text „Standard" steht* |
| Such-URL | **Search URL** | |
| Ansicht (gespeichert) | **View** | |
| Filter · Sortierung | **Filter · Sort order** | |
| Darstellung | **Appearance** | |
| Farbschema | **Colour scheme** | **`en-GB`**, F4 — mit `u` |
| Schriftgröße | **Font size** | |
| Sprache | **Language** | |
| Einstellungen | **Settings** | |
| Zeitleiste | **Timeline** | |
| Bildstreifen | **Image strip** | |

---

## 3. `en-GB` — was daran hängt

**F4 ist auf `en-GB` entschieden**, und das ist mehr als `_locale`:

- **`Colour`, nicht `Color`** — und ebenso `behaviour`, `organise`,
  `licence` (Substantiv) / `license` (Verb).
- **Das Datum steht Tag zuerst:** `07/09/2026`, wie `de-DE` und `tr-TR`.
  *Das kommt aus `Intl` und nicht aus einem Satz — aber wo ein Text ein
  Beispieldatum nennt, folgt es dieser Reihenfolge.*
- **Die Uhr geht 24 Stunden:** `14:30`, nie `2:30 PM`.
- **Kein Oxford-Komma.** *„entries, comments and tags", nicht „entries,
  comments, and tags."*

---

## 4. Die Sätze — was die Übersetzung anders macht als das Deutsche

*Jede dieser Stellen ist ein Beleg dafür, dass die Trennung aus 0.24.0 trägt.*

- **Der Genitiv wird eine Fügung.** „Die Namen der Kriterien" wird **„The
  names of the criteria"** und nicht „The criteria's names".
- **Die Höflichkeitsform fällt weg** *(E-S2)*. „Bitte gib ein Passwort ein."
  wird **„Enter a password."**
- **Zusammengesetzte Wörter fallen auseinander.** „Sicherungsordner" wird
  **„Backup folder"**, „Bewertungskriterien" wird **„Rating: criteria"**
  *(E-S4)*.
- **Der Konjunktiv wird ein Indikativ.** „Das ließe sich nicht rückgängig
  machen." wird **„This cannot be undone."**
- **Die Mehrzahl ist eine andere Regel, aber dieselbe Maschine.** Beide
  Sprachen haben `one` und `other`, und `Intl.PluralRules` wählt — *im Code
  steht kein `n === 1`.*

---

## 5. Was NICHT übersetzt wird

**Auch nicht, wenn es deutsch aussieht:**

- **Der Inhalt** — Einträge, Kommentare, Tags, der Titel der Installation.
  *Kriterien, Kategorien und das Vokabular bekommen je Sprache eine eigene
  Fassung, die der Eigentümer einträgt; übersetzt wird auch dort nichts
  automatisch (F8, F8a, F8b).*
- **Technische Namen** — `ENCRYPTION_KEY`, `.env`, MIME-Typen, `docker
  compose`, Dateinamen, Adressen unter `/api/`.
- **Server-Befehle** — sie stehen im Kasten „Auf dem Server" und sind in
  jeder Sprache dieselben.
- **`Kriterion`** — der Name des Programms.
- **Die sechs Abschnittsnamen des CHANGELOG** (`Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed`, `Security`) — sie stehen ohnehin englisch
  und nicht am Bildschirm.

---

## 6. Die Probe

**`en.json` hat exakt die 1259 Schlüssel von `de.json`** — nicht einen mehr,
nicht einen weniger, **und in derselben Reihenfolge** *(F5: damit beim
Gegenlesen daneben steht, wo der Satz am Bildschirm auftaucht)*.

**Vier Wächter lesen dieses Papier mit** *(Bauabschnitt 8)*: die
Deckungsprobe, die Platzhalterprobe, die Mehrzahlprobe und die Formatprobe.
**Was sie nicht sehen können, ist das Wort** — *dafür ist die Durchsicht da,
und die ist nicht verhandelbar (S2.2).*
