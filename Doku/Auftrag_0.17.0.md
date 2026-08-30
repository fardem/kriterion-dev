Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.17.0 — „Was dasteht, und was nicht dasteht"**
**Neun Befunde aus einem einzigen Rundlauf von Hand**, gemeldet am 30. August
2026, unmittelbar nachdem 0.16.0 eingespielt und ihr Fingerprint bestätigt war.
*Einer ist ein Fehler, sieben sind Verbesserungen, einer nimmt etwas weg — und
**kein einziger** von ihnen stand im Fahrplan oder im Sammelblatt, bevor jemand
die Anlage benutzt hat.*

---

> # ⛔ VOR DEM ERSTEN HANDGRIFF: DER FINGERPRINT MUSS BESTÄTIGT SEIN.
>
> **0.16.0 ist gebaut, geschoben und im Feld bestätigt.** Die laufende Anlage
> muss **`aa76c352`** melden — Systembereich → **Datenbank** → Kennzahlen —,
> und dort muss jetzt auch **Version 0.16.0** darüberstehen.
>
> **AM 30. AUGUST 2026 HAT SIE DAS GEMELDET — die Sperre ist eingelöst.**
>
> **UND SIE IST TROTZDEM VOR DEM ERSTEN HANDGRIFF ERNEUT ABZULESEN.** Zwischen
> dieser Meldung und dem Bauen kann ein Einspielen liegen, und ein halb
> eingespielter Dateisatz zeigt einen Wert, der zu keiner Version gehört
> (Stolperstein 158). *Es kostet zehn Sekunden — und der Weg dorthin ist seit
> 0.16.0 ein anderer, das ist der halbe Beleg.*
>
> **DREI HANDGRIFFE BELEGEN 0.16.0 IM FELD, und sie dauern zusammen eine
> Minute:**
>
> 1. **`#/system/datenbank` in die Adresszeile, dann die Zurück-Taste.** Der
>    Abschnitt muss unmittelbar aufgehen, und zurück muss dorthin führen, wo du
>    herkamst — nicht aus dem Systembereich heraus.
> 2. **Auf „gewichtet" am Bewertungsblock klicken.** Der Kasten muss die
>    Rechnung **dieses** Eintrags zeigen, mit deinen Gewichten.
> 3. **Ins Protokoll sehen:** `docker compose logs kriterion | grep gesetzt_am`
>    darf **nichts** mehr liefern — die Zeile kommt genau einmal, beim ersten
>    Start nach dem Einspielen.
>
> **Meldet die Anlage einen anderen Fingerprint, ist das ein Befund und kein
> Grund weiterzumachen.**

---

WORAUF SIE AUFSETZT: 0.16.0 ist gebaut, geschoben und im Feld bestätigt —
Fingerprint `aa76c352`, **4523 Prüfungen**, **300 Rückbauten** in
`gegenprobe.js`, `F_ROUTEN` bei **69**, Formatnummer **11**, **sieben**
markierte Migrationsblöcke (0.8.3, 0.8.30, 0.8.31, 0.8.40, 0.8.50, 0.14.0,
0.16.0), Stolpersteine bis **225**, **achtzehn** Karten im Systembereich in
**fünf** Abschnitten, **neun** persönliche Schlüssel, **elf**
Vokabulareinträge, **zwanzig** Vorgänge im Sicherheitsprotokoll, **vierzehn**
Merkmale, **sieben** Zwecke der zweiten Bestätigung. Ein voller Prüflauf dauert
**rund 5 Minuten 20 Sekunden**. Laufzeitabhängigkeiten:
`better-sqlite3-multiple-ciphers`, `express`, `multer`, `nodemailer`, `sharp`.

WAS SICH ÄNDERT, IN EINEM SATZ: Eine Kriterienliste, die bei **einem** Zugang
zerfällt, wird wieder eine Liste; zwei Erklärtexte verschwinden von der
Oberfläche in die README, wo sie hingehören; die Glocke sagt, **was** neu ist —
**und sie übernimmt die Pille „Neu seit …", die dafür gestrichen wird**; dazu
drei Anzeigefehler, die man nur auf einem echten Gerät sieht.

**DAS RISIKO DIESER RUNDE IST IHRE HARMLOSIGKEIT — bis auf einen Punkt.** Acht
kleine Sachen an acht Stellen verführen dazu, sie einzeln zu erledigen und keine
davon zu gegenprüfen; *genau so entsteht die nächste Runde mit stummen
Rückbauten.* **Der neunte ist nicht klein: Punkt 6 NIMMT etwas WEG**, und
Wegnehmen ist die Richtung, in der man nicht zurückkann, ohne dass es jemand
merkt.

> **DIE NUMMER WAR DIE ERSTE ENTSCHEIDUNG DER RUNDE, UND SIE IST GEFALLEN:
> 0.17.0, ALSO MINOR.** Der Auftrag ging als `0.16.1` in die Besprechung, weil
> sieben der acht Punkte Anzeige und Wortlaut betreffen. **Punkt 3 kippt es:**
> wenn die Glockentafel „3 Kommentare · 4 Bewertungen" sagt statt „7 neue
> Beiträge", **kann die Anlage danach etwas, was sie vorher nicht konnte** —
> sie sagt, WAS auf einen wartet. Abschnitt 5.1 des Projektstands ist an dieser
> Stelle unmissverständlich: *„Dritte Zahl (PATCH) nur für abwärtskompatible
> Fehlerbehebungen. Eine Runde, die eine Funktion bringt, ist keine
> PATCH-Runde — auch dann nicht, wenn sie klein ist."*
>
> **DAS IST DIE ZWEITE RUNDE, IN DER DIESE ENTSCHEIDUNG FÄLLIG WAR, und beide
> Male ist sie gleich ausgefallen** — 0.15.0 ging als `0.14.1` heraus und wurde
> gehoben. *Eine Regel, die man beim zweiten Mal wieder anwendet, ist eine
> Regel; eine, die man beim zweiten Mal umgeht, war nie eine.*
>
> **DER FAHRPLAN RÜCKT ENTSPRECHEND, und das ist bereits geschehen:** die Suche
> steht jetzt auf **0.18.0**, die Bereinigung auf **0.19.0**. *Die Zahlen sind
> im Projektstand nachgezogen, bevor dieser Auftrag ausgegeben wurde — ein
> Fahrplan, der etwas anderes sagt als der Auftrag daneben, ist eine zweite
> Wahrheit* (Stolperstein 47).

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST.

   * **DER FINGERPRINT UND DIE DREI HANDGRIFFE — siehe der Kasten ganz oben.**

   * **DER TEILEXPORT IST ZWEIMAL GEFAHREN UND IMMER NOCH NICHT BELEGT.**
     Der erste Lauf machte Probleme, der zweite lief gut — **und offen ist, ob
     beim ersten der Weg eingehalten war**: Teil 1 mit „Ersetzen", **alle
     übrigen mit „Zusammenführen"**. *Ein geglückter zweiter Lauf ist kein
     Freispruch für den ersten.* **Er wird eigens noch einmal gefahren**, und
     dabei wird mitgeschrieben: wie viele Teile bei 300 MB, **eine** Eingabe
     des zweiten Faktors, wie viele geladene Dateien, welcher Teil mit welchem
     Verfahren eingespielt wurde — und danach, dass **keine** Zeile
     `bestaetigung.fehl` im Sicherheitsprotokoll steht. *Der Weg dorthin heißt
     seit 0.16.0: Systembereich → **Datenbank** → Export.*
     **Und der eine Handgriff, der wirklich zählt: einen Teil in eine
     Zweitanlage einspielen, nicht in die laufende.**

   * **BEIDE NETZE AM ECHTEN WIRT (0.13.0) STEHEN WEITERHIN AUS.** Über HTTPS
     anmelden und angemeldet bleiben; **im selben Browser** über
     `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

     **Beides gehört ins Änderungsprotokoll dieser Runde als Nachlese.**

   * **TAGS WERDEN NICHT MEHR GESETZT — WEDER JETZT NOCH KÜNFTIG.** Das ist
     seit dem 30. August 2026 entschieden und steht so im Projektstand,
     Abschnitt 8. **Leg keinen an und versuch keinen Push.** *Die einzige
     Wirkung bleibt, dass die Vergleichsverweise am Ende von `CHANGELOG.md`
     ins Leere zeigen; an der Anlage ändert es nichts.* **Der Eintrag am Ende
     der Datei wird trotzdem geschrieben** — er ist Teil der Form.

   * **DER VOLLE GEGENPROBENLAUF STEHT SEIT ZWÖLF RUNDEN AUS.** Jetzt 300
     Rückbauten zu je einem vollen Prüflauf: bei 5 min 20 s je Lauf rund
     **26,7 Stunden** hintereinander, in vier Nebenspuren rund sieben.
     **Entscheide zu Beginn, ob er einmal ganz läuft.** *Läuft er nicht,
     schreib auf, dass er wieder aussteht.* **Er lässt sich nicht neben dem
     Bauen fahren** — `gegenprobe.js` zieht seine Kopie aus `git archive HEAD`,
     und ein Commit mitten im Lauf verschiebt die Grundlage. **Und keine
     Prozessliste per Muster abräumen, solange er läuft.**

---

1. **DIE KRITERIENLISTE ZERFÄLLT BEI GENAU EINEM ZUGANG. DAS IST DER EINZIGE
   FEHLER DIESER RUNDE UND DER EINZIGE PUNKT, DER NICHT FALLEN DARF.**

   **Befund aus dem Betrieb, 30. August 2026.** An einem Eintrag mit drei
   Kriterien stehen Namen und Sternreihen nicht mehr untereinander, sondern
   versetzt: *Name · Sterne · nächster Name / Sterne · übernächster Name ·
   Sterne.*

   **DIE URSACHE IST BEKANNT UND VOLLSTÄNDIG:** `.rlist` ist ein Raster mit
   **drei** Spalten (`1fr auto auto`), `.rrow` ist `display: contents`. Die
   Durchschnittsspalte hängt `drawRatings()` aber nur an, **wenn
   `mehrereBenutzer()` gilt**. Bei einem einzigen Zugang liefert jede Zeile
   damit **zwei** Zellen in ein Dreispaltenraster, und die Selbstanordnung
   schiebt alles um eine Spalte weiter.

   **SIE IST ÄLTER ALS 0.16.0.** Das Raster kam mit 0.14.0, die bedingte Spalte
   gibt es seit 0.8.91. **Sichtbar geworden ist sie erst, als die
   Gewichtsmarken `×1,25` die Namensspalte breiter machten.** *Schreib das so
   hin — eine falsche Zuordnung kostet mehr als der Fehler selbst
   (Stolperstein 216).*

   **WAS ZU BAUEN IST:** die Spaltenzahl folgt dem Zustand. Eine Klasse am
   `.rlist`, die bei einem Zugang auf `1fr auto` geht — **abgeleitet aus
   derselben Bedingung, die über die Zelle entscheidet, und nicht aus einer
   zweiten** (Stolperstein 47).

   > **DER EIGENTLICHE BEFUND IST, DASS KEINE PRÜFUNG IHN SEHEN KONNTE.** Die
   > Prüflagen fahren mit mehreren Zugängen — genau der Fall, in dem die dritte
   > Zelle da ist und das Raster aufgeht. **Der Auftrag zu 0.16.0 hat diese
   > Falle sogar benannt** (*„eine Lage mit einem einzigen Zugang kann über die
   > Glocke nichts belegen"*) — und niemand hat sie auf die Kriterienliste
   > angewandt.
   >
   > **DESHALB GEHÖRT ZU DIESEM PUNKT EINE PRÜFUNG, DIE MEHR PRÜFT ALS IHN:**
   > sie zählt die Zellen je Zeile und die Spalten des Rasters und hält fest,
   > **dass beide Zahlen zusammenpassen — in BEIDEN Lagen**, mit einem Zugang
   > und mit mehreren. *Eine Prüfung, die nur den einen Fall ansieht, wäre
   > dieselbe Blindheit mit umgekehrtem Vorzeichen.*

---

2. **ZWEI ERKLÄRTEXTE VERLASSEN DIE OBERFLÄCHE.**

   **Befund aus dem Betrieb, 30. August 2026 — und es ist zweimal derselbe
   Fehler:** eine Begründung, die in ein Papier gehört, ist in die Anlage
   gerutscht.

   * **In den Kennzahlen, unter „Verfahren":** *„Welche Fassung welcher
     Bibliothek das rechnet, steht hier nicht: das wäre die Angabe, nach der
     jemand sucht, der eine Lücke ausnutzen will."*
   * **In der Glockentafel, unter der Liste:** *„Was die Glocke nicht
     verspricht"* — vier Sätze über den Zeitpunkt der Berechnung, den fehlenden
     Lesestand je Meldung und Bewertungen von **vor der Umstellung auf
     0.16.0**.

   **BEIDE WERDEN ERSATZLOS GESTRICHEN.** Sie stehen in der README bereits,
   Wort für Wort.

   > **DIE REGEL DAHINTER GEHÖRT IN DEN PROJEKTSTAND, ABSCHNITT 5.6, weil sie
   > über diese zwei Stellen hinausreicht: eine Oberfläche sagt, WAS IST — nicht,
   > warum es so gebaut wurde.** *Eine Versionsnummer in einem Dialog ist der
   > deutlichste Fall: sie ist für den, der davorsteht, ohne Bedeutung, und in
   > einem Jahr ist sie falsch.*
   >
   > **UND EINE FRAGE GEHÖRT DAZU, DIE ÜBER DEN AUFTRAG HINAUSGEHT:** steht
   > dieselbe Art Satz noch woanders in der Anlage? *Sieh nach und schreib auf,
   > was du findest — beheben musst du es in dieser Runde nicht.*

---

3. **DIE GLOCKENTAFEL SAGT NICHT, WAS NEU IST.**

   **Befund aus dem Betrieb, 30. August 2026.** In der Tafel steht je Eintrag
   „**7 neue Beiträge**" — und offen bleibt, ob das Kommentare sind,
   Bewertungen oder offene Aufgaben. *„Beitrag" ist ein Sammelwort, das die
   Anlage sonst nirgends benutzt.*

   **DIE AUSKUNFT LIEGT BEREITS VOR UND WIRD WEGGEWORFEN.** `server.js` fragt
   `qNeueKommentare` und `qNeueBewertungen` **getrennt** ab und addiert beide
   in derselben Schleife zu einer Zahl. **Die Aufteilung kostet keine
   zusätzliche Abfrage** — nur eine zweite Zahl an der Antwort.

   **Dann steht dort „3 Kommentare · 4 Bewertungen".** *Bei nur einer Art steht
   auch nur eine Angabe da; „0 Bewertungen" wäre eine Auskunft über nichts.*

   **DIE ZAHL AM KNOPF „OFFEN" BLEIBT EINE ZAHL** — sie zählt eine Sache, nicht
   zwei.

   > **DIESER PUNKT IST DER GRUND, WARUM DIE RUNDE MINOR HEISST** (siehe der
   > Kasten oben). *Fällt er, fällt die Begründung mit — dann ist die Nummer
   > neu zu entscheiden und nicht stillschweigend zu behalten.*

---

4. **DREI ANZEIGEFEHLER, DIE MAN NUR AUF EINEM ECHTEN GERÄT SIEHT.**

   * **Die Versionszeile steht auf dem Telefon unter der Falz** *(Samsung
     S21 5G)*. **Die Ursache ist die Einheit, nicht der Abstand:**
     `body.anmeldung` trägt `min-height: 100vh`, und **`vh` ist auf dem Telefon
     die GROSSE Anzeigefläche — die ohne Browserleisten**, also die, die man
     nicht sieht. *Der Abstand ist seit 0.15.x zweimal verkleinert worden und
     war nie die Ursache.* **Der Weg: `100dvh`, mit `100vh` als Rückfall
     darüber für alte Browser.** *Der Verdacht „zu viel Abstand nach oben"
     trifft es nicht — die Karte ist mittig gesetzt, einen festen oberen
     Abstand gibt es gar nicht.* **Die Marke mit durchsichtigem Grund steht
     bereits dort** (`marke-dunkel.svg`, nicht das Favicon mit seiner Kachel).

   * **Der orangene Rahmen der eigenen Sitzung reicht nicht bis zum Rand.**
     `.manage-list` trägt `overflow-y: auto` — **und damit steht `overflow-x`
     nach der CSS-Regel ebenfalls auf `auto`**, ohne dass es jemand
     hingeschrieben hätte. Die Zeile ist breiter als der Kasten (`.sitz-zeit`
     trägt `flex-shrink: 0` an zwei Zeitangaben), also entsteht ein Bildlauf
     zur Seite; die Zeile ist aber nur so breit wie der **sichtbare**
     Ausschnitt, und ihr Rahmen endet dort. **Gebaut wird das Umbrechen** — die
     Regel `.mrow.sitz { flex-wrap: wrap }` steht schon da, aber nur unterhalb
     eines Umbruchpunkts; sie gilt künftig immer. *Der andere Weg
     (`min-width: max-content`) beließe den seitlichen Bildlauf, und der ist
     auf dem Telefon schwer zu treffen.*

   * **Die Karte „Mailversand" steht schmal unter drei breiten.** Seit 0.16.0
     stehen „Zugänge", „Anfragen", „Sicherheitsprotokoll" und „Mailversand" im
     selben Abschnitt; die ersten drei tragen `.breit`, die vierte wirkt wie
     ein Rest. **Entschieden ist: „Mailversand" bekommt ebenfalls `.breit`.**
     *Vier gleich breite Kacheln sind einfacher zu begründen als drei plus ein
     Rest, und die Karte trägt die Breite mit ihren Feldern gut.*

---

5. **DER ERKLÄRKASTEN SAGT, WIE GERECHNET WIRD — ABER NICHT, WAS DIE GEWICHTUNG
   ÄNDERT.**

   **Befund aus dem Betrieb, 30. August 2026.** Die Formel steht Zeile für
   Zeile da, und trotzdem bleibt offen, wofür die Gewichte gut sind.
   **Es fehlt die Vergleichszahl: was käme heraus, wenn alle Kriterien gleich
   zählten?** *Erst der Unterschied macht die Gewichtung sichtbar.*

   **SIE WIRD GERECHNET, WO DIE ANDERE GERECHNET WIRD** — in `gesamtSchnitt()`,
   und sie reist im Rechenweg mit. **Der Kasten LIEST sie, er rechnet sie
   nicht** (Stolperstein 217). *Eine zweite Rechenstelle im Browser wäre genau
   das, was diese Runde in 0.16.0 vermieden hat.*

   **Ohne Gewichtung steht der Kasten gar nicht offen** — dort gibt es nichts
   zu vergleichen. **Und wenn beide Zahlen gleich sind, sagt der Kasten das**,
   statt zweimal dasselbe hinzuschreiben.

   > **DIE PRÜFLAGE MUSS DEN UNTERSCHIED HERSTELLEN KÖNNEN** (Stolperstein 189
   > und 224): Gewichte, bei denen gewichtet und ungewichtet **verschiedene**
   > Zahlen ergeben — sonst belegt die Prüfung nichts. *Und wie in 0.16.0
   > gehört eine Zeile dazu, die das an der Lage selbst festhält.*

---

6. **DIE GLOCKE ERSETZT DIE PILLE „NEU SEIT …". DIE PILLE WIRD GESTRICHEN.**

   **Entscheidung des Betreibers, 30. August 2026.** Zwei Anzeigen für dieselbe
   Frage — *was hat sich getan, seit ich zuletzt hier war* — sind eine zu viel.
   **Die Auskunft wandert in die Glocke, die Pille fällt weg.**

   **UND DAS ZWEITE ARGUMENT IST EINE HAUSREGEL, DIE HIER VERLETZT IST:** die
   Pille steht auch dann da, wenn ihre Zahl **null** ist — gedämpft, aber da.
   *Am Knopf „Offen" steht seit 0.16.0 das Gegenteil, und zwar wörtlich:*
   **„Ohne offene Aufgaben steht dort keine Null: ‚Offen 0' wäre eine Auskunft
   über nichts."** *Dieselbe Sache darf nicht zwei Verhalten haben*
   (Stolperstein 47, im Kleinen). **Die Glocke hält die Regel bereits ein — sie
   zeigt ihren Punkt nur, wenn es etwas gibt.**

   > **DIESER PUNKT IST DER GRÖSSTE DER RUNDE, und er ist der einzige, der
   > etwas WEGNIMMT.** Alles andere hier fügt hinzu oder rückt zurecht.
   > *Wegnehmen ist die Richtung, in der man nicht zurückkann, ohne dass es
   > jemand merkt.* **Er ist deshalb vollständig entschieden, bevor die Runde
   > beginnt** — bis hin zu dem, was dabei verlorengeht.

   **WAS DIE PILLE HEUTE KANN UND DIE GLOCKE HEUTE NICHT — vier Punkte, und
   jeder einzelne ist vor dem Streichen zu beantworten:**

   1. **Sie ist ein FILTER auf der Liste**, kombinierbar mit Kategorie, Tags,
      Status und Ablehnung, mit einer Trefferzahl daneben, die die übrigen
      Filter schon einrechnet. **Die Glocke ist eine Tafel, die man wieder
      verlässt.** *Wandert die Auskunft in die Glocke, wandert der Filter mit —
      oder er fällt weg. Beides ist vertretbar, aber es muss dastehen, welches
      von beidem gilt.*
   2. **Sie zeigt JEDE Änderung** (`updated_at`), also auch einen geänderten
      Titel, eine neue Datei, einen neuen Testtag. **Die Glocke meldet
      ausschließlich fremde Kommentare und fremde Bewertungen.** *Der Wegfall
      wäre also nicht „dieselbe Auskunft an anderer Stelle", sondern eine
      engere Auskunft.*
   3. **Sie hat einen ANDEREN Bezugspunkt.** Die Pille misst an
      `zuletztGesehen` — wann du die Übersicht zuletzt verlassen hast —, die
      Glocke an `glockeGesehen`, wann du ihre Tafel zuletzt geöffnet hast.
      **Zwei Merker, zwei Bedeutungen.** *Werden sie zu einem, ändert sich für
      beide, wann etwas als gesehen gilt; bleiben es zwei, muss die Glocke
      sagen, welchen sie meint. Und wird `zuletztGesehen` nirgends mehr
      gebraucht, sinken die persönlichen Schlüssel von neun auf acht —*
      **nachzählen, nicht annehmen.**
   4. **SIE ARBEITET BEI EINEM EINZIGEN ZUGANG, UND DIE GLOCKE TUT DAS NICHT.**
      Im Quelltext steht der Grund seit jeher daneben: *„Bei EINEM Zugang
      erscheint er trotzdem — anders als ‚meine / alle' ist er keine Aussage
      über andere: auch allein vergisst man, was man zuletzt gesehen hat."*
      **Die Glocke meldet nur FREMDE Beiträge — bei einem Zugang meldet sie
      nie etwas.**

   > **PUNKT 4 WAR DER EINZIGE OFFENE, UND ER IST ENTSCHIEDEN — am 30. August
   > 2026, vor Beginn der Runde.** Ersatzlos gestrichen, verlöre ein Betreiber,
   > der allein arbeitet, die Auskunft vollständig: die Glocke bliebe für ihn
   > leer. *Derselbe blinde Fleck wie bei Punkt 1 dieser Runde, nur andersherum
   > — dort hat die Lage mit einem Zugang einen Fehler versteckt, hier nähme sie
   > eine Funktion weg.*
   >
   > **DIE PILLE WIRD NICHT STEHENGELASSEN, SONDERN DIE GLOCKE WIRD
   > VOLLSTÄNDIG:** sie meldet künftig **Kommentare und Bewertungen von ALLEN
   > seit dem letzten Blick** und sagt bei jeder Zeile dazu, **von wem**.
   > *Eine Regel statt zwei — keine Sonderbehandlung für den Fall „ein Zugang",
   > denn die wäre selbst wieder eine zweite Wahrheit.* **Damit meldet sie auch
   > dem, der allein arbeitet, etwas**, und der Satz aus 0.16.0 — *„Eigene
   > Beiträge stehen nie hier"* — **wird zurückgenommen. Der Vermerk daneben
   > gehört dazu, denn eine zurückgenommene Entscheidung kommt sonst wieder**
   > (Stolperstein 201).

   **UND DIESE FOLGE GEHÖRT AUSDRÜCKLICH HINGESCHRIEBEN, WEIL SIE EIN VERLUST
   IST:** die Pille zeigte **jede** Änderung an einem Eintrag — auch einen
   geänderten Titel, eine neue Datei, einen neuen Testtag. **Die Glocke tut das
   auch künftig nicht;** sie bleibt bei Kommentaren und Bewertungen.

   *Warum das trotzdem vertretbar ist: eine Titeländerung ist etwas, das jemand
   **am** Eintrag getan hat, kein Beitrag, der **für** dich daliegt. Und die
   Übersicht ordnet ohnehin nach `updated_at` — was sich zuletzt getan hat,
   steht oben, ohne dass ein Filter dafür nötig wäre.* **Wäre der Verlust doch
   spürbar, ist das ein Befund für eine spätere Runde und kein Grund, die Pille
   zurückzuholen.**

   **WAS IN JEDEM FALL GILT:**

   * **Die Filterzeile wird um eine Pille kürzer** — die Fortsetzung von
     0.13.0, wo sie 75 px flacher wurde.
   * **Der Zustand `f.neu` verschwindet aus der Filterwahl.** *Eine
     gespeicherte Ansicht aus 0.11.0 kann ihn tragen; sie muss ihn übergehen
     statt daran zu scheitern* — dieselbe Regel wie beim Schlüssel `abgelehnt`
     in 0.15.0.
   * **Die Prüfungen zur Pille werden nicht gelöscht, sondern mitgenommen**
     (Stolperstein 201): über jeder steht, warum sie sich geändert hat.
   * **Und die Rückbauten dazu ebenso** — ein Rückbau, der auf eine gestrichene
     Zeile zeigt, ist stumm und verfälscht die Tabelle (Stolperstein 192).

---

AUFLAGEN — sie gelten unverändert und sind keine Formsache:

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; „Desktop" statt „Schreibtisch";
  die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein —
  **außer dort, wo eine zurückgenommene Entscheidung sonst wiederkäme.**
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **VIER NEUE AUS 0.16.0, UND SIE SIND DER GRUND, WARUM DIESE RUNDE ANDERS
  GEPRÜFT WIRD ALS DIE LETZTE:**
  * **Stolperstein 222** — *es gibt kein `feld?.value = wert`.* Wo die Sprache
    das Fragezeichen nicht hergibt, gehört ein Helfer hin und kein Weglassen.
    `setzeFeld()` steht bereit und wird benutzt.
  * **Stolperstein 223** — *eine Prüfung, die ein ATTRIBUT liest, prüft nicht
    den Gegenstand.* **Bei einer Runde, die an drei Stellen Klassen und
    Attribute umstellt, ist das die wahrscheinlichste Art, sich selbst zu
    blenden.**
  * **Stolperstein 224** — *eine Prüflage, die eine Unterscheidung nicht
    herstellen kann, muss das SELBST prüfen.* **Trifft Punkt 5 unmittelbar.**
  * **Stolperstein 225** — *eine Zusage über einen Lauf gehört geschrieben,
    nachdem er gefahren ist, und nicht davor.* **In 0.16.0 stand „keiner blieb
    stumm" in den Papieren, bevor der Lauf lief — und es war falsch.**
* **UND DIE AUFLAGE, DIE AUS PUNKT 1 FOLGT:** *eine Prüflage mit einem einzigen
  Zugang ist keine Schwundstufe der Lage mit mehreren, sondern ein eigener
  Zustand mit eigenen Zusagen.* **Die Frage an jede Gruppe dieser Runde: was
  sieht ein Betreiber, der allein arbeitet?** *Genau dort lag der Fehler, den
  niemand gefunden hat.*
* **Wer eine Entscheidung zurücknimmt, sucht die Prüfungen, die sie festhalten,
  und nimmt sie mit** (Stolperstein 201). **Punkt 2 streicht zwei Texte — jede
  Prüfung, die nach ihrem Wortlaut sucht, ist zu finden und mitzunehmen.**
* **Und der Zwilling dazu** (Stolperstein 199): *was du in einen Kommentar
  schreibst, schreibst du im selben Zug in eine Prüfung.*
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Zuerst fällt **Punkt 5**, dann **Punkt 3**, dann die
  Kartenbreite aus **Punkt 4**. **Punkt 1 fällt nicht** — er ist der einzige
  Fehler der Runde. **Und Punkt 6 fällt als ganzer oder gar nicht:** eine halb
  gestrichene Pille wäre schlimmer als beide Anzeigen nebeneinander.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde lautet
  die Antwort ausdrücklich NEIN: KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE
  FORMATNUMMER.** *Punkt 3 und Punkt 5 lesen beide nur, was schon dasteht —
  wenn deine Durchsicht zu einem anderen Ergebnis kommt, ist das ein Grund
  anzuhalten und zu fragen, nicht stillschweigend abzuweichen.*
* **Es bleibt bei sieben markierten Migrationsblöcken und bei Formatnummer 11.**
* **Die Sicherung des Datenverzeichnisses ist bei dieser Runde Empfehlung und
  nicht Pflicht** — sag das im Einspielweg deutlich, und sag auch, warum: es
  ist keine Datenbankstufe. *Bei 0.16.0 war sie Pflicht; der Unterschied gehört
  benannt, sonst liest ein Betreiber über beides hinweg.*
* **`F_ROUTEN` bleibt bei 69.** *Keiner der acht Punkte braucht eine schreibende
  Route.* **Die Zahl ist nachzuzählen und nicht anzunehmen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
  **Und danach kein Prüflauf mehr, den du abbrichst** — abgebrochene Läufe
  hinterlassen Server mit `ppid=1` auf den festen Portbasen, und der nächste
  Lauf wird davon rot, ohne dass am Code etwas falsch wäre. *Brichst du doch
  einen ab, räum die Server auf und sag es.*
* `Doku/Aenderungsprotokoll_0.17.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, **die Entscheidungen mit ihrer
  Begründung** — darunter die über die Nummer —, neue Stolpersteine (**die
  Zählung setzt bei 226 fort** — 225 ist vergeben), die Gegenprobentabelle
  **aus `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **4523**),
  Rückbauten vorher/nachher (vorher: **300**), Offengebliebenes — **und die
  Ergebnisse der Feldbelege aus Abschnitt 0, sobald sie da sind.**
* Die Zeile „0.17.0 — Fingerprint `…`" gehört ins Änderungsprotokoll,
  **ZULETZT gebildet**, nach der letzten Änderung an einer ausgelieferten Datei
  — die Versionsnummer in `package.json` eingeschlossen, **und
  `package-lock.json` trägt sie ein zweites Mal.** *Rechne ihn am Schluss noch
  einmal nach.* **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich**, mit dem Satz,
  dass die Sicherung Empfehlung bleibt und die Formatnummer bei 11 steht.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die drei, die diese Runde belegen:** einen
  Eintrag mit mehreren Kriterien ansehen und nachzählen, dass Namen und
  Sternreihen untereinander stehen; die Glockentafel öffnen und lesen, **was**
  neu ist; und die Anmeldeseite auf dem Telefon aufrufen, ohne zu scrollen.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 5.6, Stolpersteine,
  Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**). Der Projektstand
  trägt die Version im Dateinamen und wird umbenannt (`git mv`); alle Verweise
  sind nachzuziehen.
* **Das Sammelblatt wird an einer Stelle angefasst:** die **acht Zeilen vom
  30. August 2026** in Teil II wandern mit, so weit sie gebaut werden. *Ein
  Punkt wandert vom Sammelblatt in den Fahrplan und von dort in ein
  Änderungsprotokoll — nie zurück.* **Was nicht gebaut wird, bleibt stehen und
  bekommt einen Satz dazu, warum.**
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir etwas auf, das dort falsch wird, ist das ein
  Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.**
* **Die README bekommt zwei Dinge:** die Vergleichszahl im Erklärkasten
  (Punkt 5) und die neue Form der Glockentafel (Punkt 3). **Die beiden
  gestrichenen Texte aus Punkt 2 stehen dort bereits** — prüf nach, dass sie
  wirklich dastehen, bevor du sie aus der Anlage nimmst.
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.16.0**, mit beiden
  eigenen Abschnitten am Ende.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
