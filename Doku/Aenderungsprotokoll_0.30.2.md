# Änderungsprotokoll 0.30.2 — „Die Tagzeile bekommt ihre Breite zurück"

**Ein Befund aus dem Rundlauf mit 0.30.1 · 12. September 2026 · gebaut auf
0.30.1.**

> **FINGERPRINT DIESER RUNDE: `3d03be45`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**. *Das ist die Lehre aus 0.30.1,
> wo er zweimal überholt im Papier stand: er hängt an jeder Datei der Liste,
> auch an einem Kommentar.*
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`3d03be45`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`3d03be45`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus — trägt der Betreiber nach* |
>
> **DIESER STAND IST DER NÄCHSTE, DER AN DEN WIRT GEHT.** *Der Betreiber hat
> 0.30.1 zurückgehalten: „ich werde die den nur wieder einspielen wenn wir den
> patch mit dem tagfilter haben."*

---

## Der Befund

**DIE AUFGEKLAPPTE TAGWOLKE SETZTE JEDEN TAG AUF EINE EIGENE ZEILE — sobald ein
Tagfilter griff.**

> **Der Betreiber, 12. September 2026, mit zwei Bildern:** *„Damit tags mehr
> platz haben das ‚mehr' und ‚reset' direkt unter dem tag anzeigen. … das
> bedeutet das ‚und/oder' wandern unter die klappe und sind in der regel wenn
> nicht aufgeklappt ist nicht sichtbar. Und was nicht passieren darf ist wenn es
> aufgeklappt ist das wir so eine platzverschwendung haben."*

**DIE URSACHE IST DIE DRITTE RASTERSPALTE, und sie ist gemessen und nicht
geraten.** *Die Tagzeile ist ein Raster aus `auto minmax(0, 1fr) auto`: Spalte 3
nimmt sich, was ihr Inhalt braucht, und die Wolke bekommt den Rest.* **Sobald
ein Tagfilter greift, tritt der Rücksetzer neben „mehr" — und aus 38 Pixeln
werden 180.**

**GEMESSEN AM 12. SEPTEMBER 2026** *(echtes Chromium, 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`, dreißig Tags, in **allen drei
Sprachen**)*:

| Sprache | Lage | Zeilenende | Wolke | Reihen | Tagzeile | Filterkasten |
|---|---|---|---|---|---|---|
| **de** | zu, ohne Filter | 38 | 234 | 11 | 46 | 267 |
| **de** | zu, **mit** Filter | **164** | 108 | 26 | 46 | 307 |
| **de** | offen, ohne Filter | 54 | 218 | 11 | 354 | 575 |
| **de** | **offen, mit Filter** | **180** | **92** | **26** | **845** | **1106** |
| **tr** | offen, mit Filter | 159 | 109 | 25 | 812 | 1073 |
| **en** | offen, mit Filter | 109 | 175 | 16 | 518 | 779 |

> **DEUTSCH IST DER SCHLECHTESTE FALL:** *„weniger" (54) plus „Tags
> zurücksetzen" (116) machen **180 Pixel** Zeilenende, und der Wolke bleiben
> **92** von 366.* **Der breiteste Tag misst 126** — es passt kein einziger mehr
> neben einen zweiten, und die Reihen fallen auf einen Tag zusammen.
>
> **UND GENAU DESHALB WAR DER BEFUND IM ERSTEN MESSDURCHGANG NICHT ZU SEHEN:**
> *der Messstand stand auf Englisch, und dort misst dasselbe Zeilenende 109.*
> **Eine Messung in einer Sprache ist keine Messung.**

---

## Was gebaut ist

### Zwei Zeichen statt zweier Wörter

| | vorher | nachher |
|---|---|---|
| **„mehr"/„weniger"** | Wort, 38 bzw. 54 px | **ein Haken nach unten bzw. oben**, 30 px |
| **„Tags zurücksetzen"** | Wort, 116 px | **der Kreispfeil**, 30 px |

**KEINE NEUE FORM.** *`ICON_STEP_BACK` und `ICON_STEP_FWD` sind derselbe Haken,
nur gedreht; der neue entsteht aus demselben Helfer `char()` und trägt dieselbe
Strichstärke.* **Ein Zeichen, das die Instanz schon zweimal zeigt, muss niemand
neu lernen.**

**UND KEIN NEUES ZEICHEN, WO ES EINES GIBT.** *`ICON_RESET` steht seit jeher an
`.rreset`, dem Rücksetzer der Sternzeile, und heißt dort „zurücksetzen".*

> **EIN KREUZ WÄRE FALSCH GEWESEN, und das war der Vorschlag des Betreibers.**
> *Im Haus heißt × **„weg"** — eine Zeile löschen, einen Tag vom Testtag nehmen,
> eine Ansicht entfernen.* **„Zurücksetzen" ist etwas anderes, und das Haus
> unterscheidet die beiden schon mit zwei Zeichen.**
>
> **UND EINE OFFENE TÜR WÄRE DER ZWEITE FALSCHE GRIFF GEWESEN** *(sein anderer
> Vorschlag)*: *„Das Haus verlassen" ist die Wendung dieses Projekts für das,
> was hinausgeht.* **An einer Tagwolke sagte eine Tür „hinaus"** — das Gegenteil
> von „mehr zeigen".

**DAS WORT IST NICHT GEFALLEN, SONDERN UMGEZOGEN.** *Die drei Schlüssel
`list.more`, `list.less` und `list.resetTags` stehen unverändert in allen drei
Sprachdateien und wechseln nur den Ort: sie stehen jetzt im **Titel**.* **Und
beide Zeichen sagen ihr Wort auch dem Vorleseprogramm** — *ein Zeichen allein
liest keines vor.*

### Die dritte Spalte fällt weg

**BEIDE VERWEISE STEHEN IN SPALTE EINS, UNTER DER BESCHRIFTUNG** — so hat der
Betreiber es bestellt. **Die Zeile trägt damit drei Rasterzeilen:**
Beschriftung · die beiden Zeichen · der Umschalter.

**SPALTE EINS WÄCHST DABEI NICHT:** *sie maß 74 Pixel (de), 63 (en), 78 (tr) —
zwei Zeichen brauchen rund 70.*

### Der Umschalter geht unter die Klappe

**VERBORGEN, SOLANGE DIE WOLKE ZUGEKLAPPT IST** — *„in der Regel wenn nicht
aufgeklappt ist nicht sichtbar".*

> **MIT EINER AUSNAHME, UND DIE HAT EINEN GRUND AUS DIESEM HAUS:** *greifen
> **zwei oder mehr** Tags, dann entscheidet der Umschalter über das Ergebnis.*
> **Ein Filter, der greift und nicht zu sehen ist, ist genau der Befund, wegen
> dessen bis 0.30.0 „Tags (2)" am alten Umschalter stand.** *Sein Wort „in der
> Regel" trägt die Ausnahme.*

---

## Was die Runde eingebracht hat

| Sprache | Lage | Wolke | Reihen | Tagzeile | Filterkasten |
|---|---|---|---|---|---|
| **de** | **offen, mit Filter** | 92 → **272** | 26 → **10** | 845 → **321** | 1106 → **582** |
| **tr** | offen, mit Filter | 109 → **268** | 25 → **10** | 812 → **321** | 1073 → **582** |
| **en** | offen, mit Filter | 175 → **282** | 16 → **9** | 518 → **289** | 779 → **550** |
| **de** | zu, mit Filter | 108 → **282** | — | 46 → **62** | 307 → **323** |

> **UND EIN PREIS STEHT DABEI, DEN DER AUFTRAG NICHT GENANNT HAT:** *die
> **zugeklappte** Zeile wächst von 46 auf **62 Pixel**.* **Die zwei Zeichen
> brauchen unter der Beschriftung eine eigene Rasterzeile.** *Dafür stehen dort
> jetzt **vier statt drei** Tags, und mit gesetztem Filter vier statt zwei.*
>
> **ZWEI ANDERE WEGE SIND GERECHNET UND NICHT GEBAUT:** *die Zeichen **neben**
> die Beschriftung — dann bleibt die Zeile bei 46 px, die Wolke bekommt aber nur
> 253 statt 282 —, oder der zugeklappten Wolke **zwei** Reihen geben, weil
> Spalte 1 die Höhe ohnehin verlangt.* **Beide stehen dem Betreiber offen; die
> gebaute Fassung ist die, die er bestellt hat.**

---

## Der Prüfstand

**6801 von 6801 grün, 344 Gruppen.**

**EINE NEUE GRUPPE MIT SIEBZEHN ZUSAGEN** — und **sechs umgestellte Zusagen
älterer Runden** *(Stolperstein 201: umgestellt und nicht gelöscht)*:

| | was sich geändert hat |
|---|---|
| **„Der Verweis sitzt in seinem Kasten"** | fragt jetzt den **Titel** statt des Textes |
| **„Der Rückweg heißt ‚Tags zurücksetzen'"** | ebenso — *und sie hält damit fest, dass das Wort umgezogen und nicht gefallen ist* |
| **„Und die Wolke spannt über alle Rasterzeilen"** | nennt nicht mehr die **Zahl** der Zeilen, sondern **alle** |
| **„Die ersten Rasterzeilen sind so hoch wie ihr Inhalt"** | drei Zeilen statt zweier |
| **„In den Kommentaren stehen 36 Vorkommen"** | eines mehr — *der Absatz zu den Zeichen nennt die Instanz* |

**GEFAHREN WIRD, WAS SICH FAHREN LÄSST:** *der Umschalter in drei Lagen — ohne
Auswahl, mit einem Tag, mit zweien —, und der Haken, der sich dreht.*

> **EINE LAGE WAR IN JSDOM NICHT VON SELBST ZU ERREICHEN:** *der Griff zum
> Aufklappen erscheint nur, wenn `limitCloud()` meldet, dass etwas abgeschnitten
> ist — und das kann sie dort nicht, weil jsdom keine Höhen rechnet.* **Sie wird
> deshalb gegen eine getauscht, die „abgeschnitten" sagt** — dieselbe Bauform,
> die 0.30.1 für ihren eigenen Befund gebraucht hat.

---

## Die Gegenproben — zehn gefahren, und eine hat eine Lücke gefunden

**NEUN NEUE RÜCKBAUTEN** *(935 bis 942)* **UND EINER NACHGEZOGEN** *(916 — sein
Suchtext stand nach dieser Runde nicht mehr da)*.

> **941 WAR STUMM, und das ist ein Fund.** *Er macht den Umschalter „und/Oder"
> wieder immer sichtbar — und **keine einzige Prüfung wurde rot**.*
>
> **DIE ZUSAGEN DARÜBER FRAGTEN DIE KLASSE** *(`tags-live`)* **UND DIE
> RASTERZEILE — aber nie die Regel, die tatsächlich verbirgt.** *Ein Wächter
> über nichts ist grün* *(Stolperstein 81)*.
>
> **DIE NACHGETRAGENE ZUSAGE FRAGT DIE VERNEINUNG und nicht bloß das Vorkommen
> der Klasse:** *eine Regel `.frow-tags.tags-live > .tagmode { display:
> inline-flex; }` nennt beide Namen und verbirgt trotzdem nichts — genau das ist
> der Rückbau.* **Nachgefahren: 941 macht jetzt seine eigene Gruppe rot.**

**DAMIT SIND ES ZEHN GEFAHRENE RÜCKBAUTEN IN ZWEI LÄUFEN, 0 STUMM** — *neun im
ersten, einer im Nachlauf.*

> **ZWEI RUNDEN, ZWEI FUNDE, UND BEIDE DERSELBEN SORTE.** *0.30.1 hatte eine
> Zusage, die ihren eigenen Gegenstand nicht abdeckte (die Begrenzung war
> belegt, ihr **Ruf** nicht); 0.30.2 hatte eine, die den Träger prüfte und nicht
> die **Wirkung**.* **Beide Male hat es nur die Gegenprobe gezeigt.**

---

## Der Augenschein

**Gefahren am 12. September 2026 am laufenden Server**, in echtem Chromium bei
390 × 844 — **in zwei Sprachen und drei Lagen.**

| Sprache | Lage | Spalten | Wolke | Griffe | Umschalter | erste Reihe | Zeile |
|---|---|---|---|---|---|---|---|
| **de** | zu, ohne Filter | 35 / 311 / **0** | 311 | „mehr" 30 × 30 | **verborgen** | **4 Tags** | 62 |
| **de** | zu, mit Filter | 64 / 282 / **0** | 282 | „mehr", „Tags zurücksetzen" | **verborgen** | **4 Tags** | 62 |
| **de** | offen, mit Filter | 74 / 272 / **0** | 272 | „weniger", „Tags zurücksetzen" | **sichtbar** | 4 Tags | 321 |
| **tr** | zu, mit Filter | 78 / 268 / **0** | 268 | „daha fazla", „Etiketleri sıfırla" | **verborgen** | 4 Tags | 62 |
| **tr** | offen, mit Filter | 78 / 268 / **0** | 268 | „daha az", „Etiketleri sıfırla" | **sichtbar** | 4 Tags | 321 |

**DREI SACHEN STEHEN DAMIT AM LAUFENDEN SERVER FEST:**

| | |
|---|---|
| **1** | **Die dritte Spalte misst in JEDER Lage null** — sie ist weg, nicht nur schmal |
| **2** | **Jeder Griff misst 30 × 30 Pixel und trägt sein Wort im Titel** — in beiden Sprachen, und das türkische ist ein anderes als das deutsche |
| **3** | **Der Umschalter ist verborgen, wenn zugeklappt, und steht da, wenn offen** — und **nichts rollt seitlich**, in keiner Lage |

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.**

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.30.2.md`** | ein Befund, sechs Fragen, ein Bauabschnitt |
| **`Doku/Aenderungsprotokoll_0.30.2.md`** | dieses Papier |
| **`Doku/Projektstand_Kriterion_0_30_2.md`** | `git mv`, **Revision 85** |
| **`Doku/Fahrplan.md`** | eine Zeile in der Tafel; **die geplanten Runden rücken nicht** |
| **`CHANGELOG.md`** | ein Eintrag 0.30.2 |
| **`package.json`, `package-lock.json`** | 0.30.2 |
