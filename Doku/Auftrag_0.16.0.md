Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.16.0 — „Der Systembereich, die Glocke und die Auskunft"**
**Die größte Umbaufläche des ganzen Fahrplans**, und die erste Runde seit
0.13.0, die wieder aus dem Plan kommt statt aus einem Befund. *Vier Punkte aus
dem Sammelblatt (Nr. 10, 4, 11, 16), vier Zeilen aus dessen Teil II und ein
Punkt aus dem Betrieb, der nie im Sammelblatt stand.*

---

> # ⛔ VOR DEM ERSTEN HANDGRIFF: DER FINGERPRINT MUSS BESTÄTIGT SEIN.
>
> **0.15.0 ist gebaut und geschoben, aber NICHT im Feld bestätigt.** Die
> laufende Anlage muss **`8fa66d7d`** melden — Systembereich → Kennzahlen.
>
> **SOLANGE DORT ETWAS ANDERES STEHT, WIRD AN 0.16.0 KEINE ZEILE GEBAUT.**
> Das ist keine Formsache und keine Vorsichtsmaßnahme auf Vorrat:
>
> * **0.16.0 fasst `renderSystem()` in ganzer Länge an** — 2.466 Zeilen, die
>   längste Funktion der Anlage. Wer sie umbaut, während unklar ist, welcher
>   Stand überhaupt läuft, kann einen Befund aus dem Betrieb nicht mehr
>   zuordnen: er könnte aus 0.15.0 kommen, aus dem Umbau, oder aus einem halb
>   eingespielten Dateisatz.
> * **Der Fingerprint ist genau dafür da.** Er geht über ALLES unter `public/`
>   und über jede Datei, die der Server ausführt — ein halb eingespielter Satz
>   zeigt einen Wert, der zu keiner Version gehört (Stolperstein 158).
> * **Und 0.15.0 hat zwei Befunde aus dem Betrieb behoben, die niemand im
>   Prüfstand gesehen hat.** Ob sie wirklich weg sind, sagt kein Prüflauf,
>   sondern nur die laufende Anlage.
>
> **DREI HANDGRIFFE BELEGEN 0.15.0 IM FELD, und sie dauern zusammen zwei
> Minuten:**
>
> 1. **Nach „Abgelehnt" filtern und mit „Getestet" kombinieren.** Die
>   Statuszeile trägt hinter der Beschriftung „Ablehnung" drei Pillen. Beide
>   Gruppen zugleich müssen greifen, und der eingeklappte Filterbereich muss
>   **„· 2 aktiv"** sagen.
> 2. **Eine Begründung schreiben, das Feld schließen, über das ✎ wieder
>   öffnen.** Nach Enter oder dem Verlassen des Feldes steht die Aussage da und
>   das Feld ist zu. Ein Klick auf den Text oder auf das ✎ holt es zurück.
> 3. **Als Admin eine FREMDE Begründung entfernen** — und danach vergeblich
>   versuchen, eine neue hinzuschreiben. Nach dem ✕ muss „Abgelehnt am … von
>   …" stehen bleiben, und der zweite Versuch muss mit *„Das ändert nur, wer es
>   geschrieben hat."* abgewiesen werden.
>
> **Meldet die Anlage einen anderen Fingerprint, ist das ein Befund und kein
> Grund weiterzumachen** — dann wird zuerst geklärt, welcher Stand läuft.
> **Weicht einer der drei Handgriffe ab, ist 0.15.0 nachzubessern, bevor
> 0.16.0 beginnt.** *Eine Runde auf einem unbestätigten Stand zu bauen heißt,
> zwei Fehlerquellen übereinanderzulegen.*

---

WORAUF SIE AUFSETZT: 0.15.0 ist gebaut und geschoben — Fingerprint `8fa66d7d`,
**4351 Prüfungen**, **267 Rückbauten** in `gegenprobe.js`, `F_ROUTEN` bei
**69**, Formatnummer **11**, **sechs** markierte Migrationsblöcke (0.8.3,
0.8.30, 0.8.31, 0.8.40, 0.8.50, 0.14.0), Stolpersteine bis **213**,
**neunzehn** Karten im Systembereich, **elf** Vokabulareinträge, **zwanzig**
Vorgänge im Sicherheitsprotokoll, **vierzehn** Merkmale, **sieben** Zwecke der
zweiten Bestätigung. Ein voller Prüflauf dauert **rund 5 Minuten 54 Sekunden**.
Laufzeitabhängigkeiten: `better-sqlite3-multiple-ciphers`, `express`, `multer`,
`nodemailer`, `sharp`.

WAS SICH ÄNDERT, IN EINEM SATZ: Aus neunzehn Karten in einer Reihe werden
**Abschnitte mit eigener Adresse**, `renderSystem()` zerfällt dabei in
Funktionen, die Kopfzeile bekommt eine **Glocke** samt dem Zähler „Offen 7",
und das Wort **„gewichtet"** erklärt sich endlich selbst.

**DAS RISIKO DIESER RUNDE IST IHRE GRÖSSE, NICHT IHRE TIEFE.** Kein Schema,
keine neue Formatnummer, keine Rechteänderung — aber die längste Funktion der
Anlage wird auseinandergenommen, und daran hängen neunzehn Karten mit ihren
Klemmen. *Der Schnitt, falls einer nötig wird, beginnt bei **Punkt 5**, dann
**Punkt 4**, dann **Punkt 3**. **Punkt 1 und Punkt 2 gehören zusammen** und
werden nicht getrennt: wer die Abschnitte baut, zerlegt die Funktion dabei
ohnehin, und die Arbeit fällt einmal an statt zweimal.*

**WIRD ES ZU VIEL FÜR EINEN DURCHGANG, SAG ES, SOBALD DU ES KOMMEN SIEHST —
NICHT HINTERHER.** *Diese Runde ist die erste seit langem, bei der das
wahrscheinlich ist.*

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST.

   * **DER FINGERPRINT UND DIE DREI HANDGRIFFE — siehe der Kasten ganz oben.
     Das ist die Bedingung, nicht der erste Punkt einer Liste.**

   * **ZWEI FELDBELEGE STEHEN SEIT VIER RUNDEN AUS.** Sie kosten keine Zeile
     Code und sind ohne mich zu haben:

     1. **Der Teilexport am echten Bestand (0.12.4, offen seit dem
        28. August).** Systembereich → Export → *In Teilen exportieren*,
        300 MB. **Wie viele Teile, und stimmen die Dateigrößen ungefähr mit der
        Ansage?** Dann alle Teile bestätigen und laden — **mit eingeschaltetem
        zweitem Faktor** —, und danach nachsehen, dass im Sicherheitsprotokoll
        **keine** Zeile `bestaetigung.fehl` steht. *Und der eine Handgriff, der
        wirklich zählt: einen Teil in eine **Zweitanlage** einspielen, nicht in
        die laufende.*
     2. **Beide Netze am echten Wirt (0.13.0, offen seit dem 28. August).**
        Über HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
        `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

     **Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**
     Sie gehören ins Änderungsprotokoll dieser Runde als Nachlese.

   * **DIE TAGS BLEIBEN DEINE SACHE, UND DER GRUND IST GEKLÄRT.** Es ist **kein**
     Problem der GitHub-Rechte: der Git-Proxy der Arbeitsumgebung weist
     `POST /git-receive-pack` mit `refs/tags/*` mit **403 ohne einen einzigen
     GitHub-Header** ab — GitHub sieht die Anfrage nie. **`v0.12.3` bis
     `v0.15.0` warten auf den Merge des Arbeitsbranches.** Die Befehle stehen im
     Projektstand, Abschnitt 8. *Der Tag dieser Runde wird angelegt und der Push
     versucht; geht er unerwartet durch, ist das ein Befund.*

   * **DER VOLLE GEGENPROBENLAUF STEHT SEIT ZEHN RUNDEN AUS.** 267 Rückbauten zu
     je einem vollen Prüflauf sind bei 5 min 54 s je Lauf rund **26,3 Stunden**
     hintereinander, in vier Nebenspuren rund sieben. **Entscheide zu Beginn, ob er einmal ganz läuft.**
     *Läuft er nicht, schreib auf, dass er wieder aussteht.*
     **Und die Auflage aus 0.15.0 gilt verschärft:** er lässt sich **nicht neben
     dem Bauen** fahren — `gegenprobe.js` zieht seine Kopie aus
     `git archive HEAD`, und ein Commit mitten im Lauf verschiebt die
     Grundlage. *In 0.15.0 ist genau das passiert, und der Lauf musste ganz
     wiederholt werden.* **Und keine Prozessliste per Muster abräumen, solange
     er läuft:** ein `pkill -f "node server.js"` trifft seine Prüfserver mit.

   * **EIN BEFUND AM WERKZEUG LIEGT VOR UND IST NICHT BEHOBEN** (Sammelblatt,
     Teil II): `node gegenprobe.js 256` fährt auch Rückbau **83** mit
     („SHA-256 statt SHA-1"), weil der Filter `nr === Argument` **oder**
     `name.includes(Argument)` prüft. **Er ist stumm und verfälscht die
     Gegenprobentabelle.** *Die Antwort wäre eine Zeile: greift ein Argument
     als Nummer, gilt nur die Nummer. Sie darf in dieser Runde mitfahren — dann
     aber VOR dem ersten Gegenprobenlauf und mit einer Prüfung daneben.*

---

1. **DER SYSTEMBEREICH BEKOMMT ABSCHNITTE — MIT EIGENER ADRESSE.**

   **Befund aus dem Betrieb, 28. August 2026**, verschärft seit 0.12.0: die
   **neunzehn** Karten stehen auf dem Telefon alle untereinander in **einer**
   Spalte, und der Weg von „Titel" bis „Vokabular" ist entsprechend lang.

   **ZU BAUEN IST DIE AUFTEILUNG, UND SIE FOLGT DER RECHTELEITER, NICHT DEM
   ZUFALL.** Der Vorschlag aus dem Fahrplan:

   | Abschnitt | Karten |
   |---|---|
   | **Persönlich** | Zugang, Meine Sitzungen, Darstellung |
   | **Bestand** | Kategorien, Tags, Bewertungskriterien, Vokabular, Links, Suchanbieter, Papierkorb |
   | **Zugänge** | Zugänge, Anfragen, Sicherheitsprotokoll, Mailversand |
   | **Datenbank** | Kennzahlen, Sicherung, Export und Import |
   | **Anlage** | Titel |

   *Die Zuordnung ist ein Vorschlag und keine Vorschrift — wer beim Bauen
   merkt, dass eine Karte woanders hingehört, verschiebt sie und schreibt auf,
   warum.* **Die Zahl neunzehn bleibt**; es kommt keine Karte dazu und keine
   fällt weg (außer Punkt 3, der zwei zu einer macht).

   **EINE ADRESSE JE ABSCHNITT** — `#/system/datenbank`. **Die Anlage hat die
   Adressform bereits** (`#/item/12`), und die Falle, in die draußen alle
   einmal getreten sind, ist genau die fehlende Adresse: ohne sie lässt sich
   keine Einstellung verlinken und die Zurück-Taste bricht.

   **WAS ZU ENTSCHEIDEN IST — DREI FRAGEN, ALLE MIT VORSCHLAG:**

   * **Ein Abschnitt, der für eine Rolle leer bleibt?** Die Karten hängen an
     `ADMIN ?` und `EIGENTUEMER ?`. **Ein leerer Reiter wäre schlechter als
     keiner.** *Vorschlag: ein Abschnitt ohne sichtbare Karte erscheint nicht —
     und die Adresse dorthin fällt dann auf den ersten sichtbaren zurück, statt
     ins Leere zu zeigen.*
   * **Reiter oder Leiste an der Seite?** Auf dem Telefon trägt eine seitliche
     Leiste nicht; dort wäre es eine Liste, die in den Abschnitt hinein führt.
     *Vorschlag: eine Bauform für beide Breiten, wie in 0.12.0 — ein Markup,
     zwei Gestalten. Eine Weiche nach Gerät hat 0.12.0 ausdrücklich vermieden.*
   * **Merkt sich die Anlage den zuletzt offenen Abschnitt?** *Vorschlag: nein
     — die Adresse tut es schon, und ein gemerkter Zustand wäre eine zweite
     Wahrheit daneben.*

   **WAS ES ANFASST:** `renderSystem()` samt seinen neunzehn Blöcken, die
   Adressauflösung, das Stylesheet, Prüfungen. **Kein Schema, keine Route,
   keine Rechteänderung** — die Karten behalten ihre Klemmen, sie stehen nur
   woanders. *Und genau das ist zu prüfen und nicht anzunehmen: **jede** Karte,
   die heute hinter `ADMIN` oder `EIGENTUEMER` steht, muss danach an derselben
   Klemme hängen.*

---

2. **`renderSystem()` ZERFÄLLT DABEI — UND ZWAR AUF DEM WEG, NICHT ALS
   VORHABEN.**

   **Sie ist mit 2.466 Zeilen die längste Funktion der Anlage** und seit der
   ersten Messung auf das Dreifache gewachsen:

   | Funktion in `public/app.js` | 0.8.6 | 0.11.0 | 0.12.2 | **0.15.0** |
   |---|---:|---:|---:|---:|
   | `renderSystem()` | 825 | 2.030 | 2.022 | **2.466** |
   | `renderDetail()` | 1.310 | 1.499 | 1.586 | **1.857** |

   | Datei | 0.11.0 | 0.12.2 | **0.15.0** |
   |---|---:|---:|---:|
   | `public/app.js` | 6.493 | 6.671 | **7.673** |
   | `public/style.css` | 1.337 | 2.334 | **2.587** |
   | `server.js` | 4.998 | 4.434 | **4.983** |
   | `pruefung.js` | 25.591 | 25.873 | **29.576** |

   **DER PUNKT IST AUSDRÜCKLICH KEIN UMBAUPROJEKT.** Er steht seit der
   Durchsicht zu 0.8.6 mit der Auflage da: *„beim nächsten Anfassen je einen
   Block herausziehen — nicht als eigenes Vorhaben."* **Punkt 1 ist dieses
   Anfassen.** Neunzehn Karten, neunzehn Funktionen.

   **ES IST KEIN QUALITÄTSMANGEL**, und das gehört gesagt: der Quelltext ist
   dicht kommentiert, die Namen sind klar, jede Entscheidung ist begründet. *Es
   ist die **Größe** der Funktionen, nicht ihre Güte — und die Gefahr ist eine
   für die Doktrin „eine Wahrheit": bei 2.400 Zeilen sieht man einer Funktion
   nicht mehr an, ob ein Zustand schon weiter oben in ihr steht.*

   **UND AUSDRÜCKLICH KEIN FALL FÜR EIN FRAMEWORK.** Kein Framework heißt:
   keine Build-Kette, keine 400 Pakete, kein Ablaufdatum. **Die Antwort sind
   kleinere Funktionen, nicht React.**

   **EINE PRÜFUNG, DIE DIE ZAHL FESTHÄLT — und sie MISST, sie WEIST NICHT AB.**
   Eine harte Grenze („keine Funktion über 500 Zeilen") wäre eine Zusicherung,
   die bei der ersten ehrlichen Ausnahme abgeschaltet wird. *Vorschlag: die
   längste Funktion je Datei wird gemessen und im Prüflauf genannt; rot wird
   sie nicht.* **Was rot werden darf, ist eine Zahl, die jemand behauptet und
   die nicht mehr stimmt** — dieselbe Linie wie bei `F_ROUTEN`.

   **WAS OFFEN IST:** *Werden die Teilfunktionen im Modul belassen oder in
   eigene Dateien gezogen?* Eigene Dateien heißen Ladereihenfolge im Browser,
   und die Anlage hat bewusst keine Build-Kette. **Vorschlag: eine Datei,
   kleinere Funktionen.**

---

3. **EXPORT UND IMPORT WERDEN EINE KARTE — MIT EINEM VORBEHALT, DER TRÄGT.**

   Sie stehen ohnehin nebeneinander (Karte 6 und 7), und in einem Abschnitt
   „Datenbank" gehören sie zusammen.

   **DER VORBEHALT IST DIE GANZE SACHE: der Export liest, der Import ERSETZT
   BESTAND.** Zusammengelegt darf der Import **nicht einen Klick näher
   rücken**. *Die zweite Bestätigung bleibt, und der Importknopf gehört optisch
   untergeordnet — draußen wird die zerstörende Hälfte durchweg als sekundär
   gezeichnet.*

   **DIE ZAHL DER KARTEN GEHT DAMIT VON NEUNZEHN AUF ACHTZEHN**, und das ist
   die einzige Stelle dieser Runde, an der sie sich ändert. *Der Prüfstand
   zählt sie nach; die Zahl ist an mehreren Stellen in den Papieren zu
   berichtigen.*

---

4. **DIE GEWICHTUNG ERKLÄRT SICH SELBST.**

   Am Eintrag steht **„⌀ 4,2 gewichtet"**, an einer Kriterienzeile **„×1,5"**.
   **Beides ist richtig und beides erklärt sich nicht** — auch nicht in der
   Karte, in der die Gewichte eingestellt werden.

   * **a) Klick auf „gewichtet" öffnet einen Kasten mit DIESER Rechnung.**
     Nicht mit einem erfundenen Beispiel, sondern mit den echten Werten dieses
     Eintrags: Kriterium, Note, Gewicht, Produkt, Summe, Teiler, Ergebnis.
     *Draußen ist genau das die Form, die sich hält — Stripes
     Gebührenaufschlüsselung, Grafanas Query Inspector, jede Steuersoftware.
     Ein allgemeines Rechenbeispiel liest niemand zweimal; die eigene Rechnung
     schon.* **Das ist der beste Erklärungsgewinn je Zeile auf der ganzen
     Liste.**
   * **b) Ein Rechner im Systembereich, und er ist nicht neu:** die „Vorschau
     der Rangfolge" aus 0.8.40 und der aus dem Betrieb gewünschte Rechner sind
     **dieselbe Ansicht** — Werte eingeben oder Sterne anklicken, Rechenweg mit
     und ohne Gewichtung daneben, und sehen, wie sich die Spitze verschiebt.
     *Sie gehört einmal gebaut und nicht zweimal nebeneinander.* **Das ist der
     Teil mit eigener Ansicht und eigenem Endpunkt — und damit der erste
     Kandidat für den Schnitt.**
   * **c) NICHT gebaut wird eine Formel in Prosa in der README.** Sie stünde
     dort, wo niemand sie sucht, und liefe mit der Rechnung auseinander.

   **DIE RECHNUNG SELBST WIRD NICHT ANGEFASST.** Sie ist da, sauber und an
   **einer** Stelle. *Ein zweiter Rechenweg für die Anzeige wäre genau die
   zweite Wahrheit, die diese Anlage nirgends duldet — der Kasten liest die
   vorhandene Rechnung, er rechnet nicht nach.*

---

5. **DIE GLOCKE — UND DER ZÄHLER „OFFEN 7" DANEBEN.**

   **Befund aus dem Betrieb, 28. August 2026.** Seit es fremde Kommentare und
   fremde Bewertungen gibt, erfährt man von ihnen nur durch Nachsehen. **Die
   Anlage kennt heute nur eine Richtung: hinsehen.**

   **DER PLATZ IST DA UND PASST.** In `.mast-rest` stehen bereits zwei
   Zeichenknöpfe derselben Bauart — „Offene Aufgaben" und „Systembereich" —,
   und das Menü auf dem Telefon nimmt sie ohne Zutun mit auf: *ein Markup, zwei
   Gestalten* (0.12.0). **Eine dritte Glocke daneben kostet keine eigene
   Telefonfassung.**

   **DIE SCHLANKE FASSUNG, UND NUR DIE:**

   * **Ein Zeitstempel, keine Benachrichtigungstabelle.** `glockeGesehen` in
     `PERSOENLICHE_SCHLUESSEL`, wie `zuletztGesehen` auch. **Kein Schema, keine
     neue Tabelle, kein Migrationsblock.** *Draußen führen Instagram und GitHub
     eine Tabelle mit Lesestand je Zeile — weil sie müssen. Bei einer Handvoll
     Zugänge ist die kleine Fassung nicht die ärmere, sondern die richtige.*
   * **Die Zahl reist mit einer Antwort mit, die es ohnehin gibt** — kein
     eigener Weg, der bei jedem Seitenaufbau gefragt wird. **Genau das war der
     Grund, warum der Zähler „Offen 7" in 0.8.60 nicht gebaut wurde**, und
     genau das beantwortet dieser Punkt.
   * **Die Glocke trägt den PUNKT, der Knopf „Offen" die ZAHL.** Sie ersetzt
     ihn nicht, sie steht neben ihm. *Eine Zahl für einen Zustand, ein Punkt
     für ein Ereignis — die beiden Zeichen werden nirgends vertauscht.*
   * **Sie gilt für Telefon und Desktop.** Der Wunsch nennt den Desktop; die
     Kopfzeile ist aber **eine**, und was in `.mast-rest` steht, wandert von
     selbst ins Menü. *Eine Glocke nur am Desktop wäre eine Weiche nach Gerät.*
   * **Ohne gespeicherten Bezugspunkt gibt es keine Glocke** — dieselbe Lage
     und dieselbe Antwort wie bei „Neu seit meinem letzten Besuch".
   * **Ein Klick in der Tafel führt zum Eintrag.** *Das ist der halbe Gewinn;
     eine Meldung, die man nicht anspringen kann, ist eine Mitteilung ohne
     Weg.*

   **DREI DINGE SPRECHEN DAGEGEN, UND SIE GEHÖREN INS PROTOKOLL:**

   1. **Es ist eine Fähigkeit, die die Anlage bewusst nicht hatte.** Im
      Sammelblatt, Teil II, steht an „Erwähnungen im Kommentar" die Absage *„die
      Anlage hat keine Benachrichtigungen"*. **Wird die Glocke gebaut, verliert
      diese Absage ihre Grundlage** — die Zeile ist im selben Zug neu zu
      beurteilen und nicht stehenzulassen.
   2. **Eine Glocke ist ein Versprechen.** Wer sie sieht, verlässt sich darauf,
      und eine Glocke, die nur beim Betreten der Übersicht nachrechnet, hält es
      nur ungefähr. *Das ist tragbar — aber es gehört an die Tafel geschrieben
      und nicht verschwiegen.*
   3. **Der Nutzen ist an die Zahl der Zugänge gebunden.** Bei zwei Menschen,
      die miteinander reden, meldet sie, was man ohnehin weiß.

   **DER LESESTAND JE MELDUNG IST AUSDRÜCKLICH NICHT TEIL DIESER RUNDE.** Er
   bräuchte doch eine Tabelle; bei einem Zeitstempel löscht das Öffnen der
   Tafel alles auf einmal, und das ist die bewusste Grenze der schlanken
   Fassung.

---

6. **DIE KENNZAHLEN NENNEN DIE VERSION — UND DAS VERFAHREN.**

   `/api/stats` **liefert `version` bereits**; die Karte zeigt es nur nicht.
   Dazu, was der Betrieb „Nerd-Angaben" nennt und was im Quelltext längst
   feststeht: **SQLCipher** über `better-sqlite3-multiple-ciphers`, Schlüssel
   **256 Bit roh** (`PRAGMA key = x'…'`, also ohne Schlüsselableitung), Journal
   **WAL**, Passwörter **scrypt**.

   **EIN VORBEHALT GEHÖRT DAZU, UND ER IST HART:** Verfahrensnamen sind
   unbedenklich, **Paketversionen weniger** — sie sagen, welche Lücke passt.
   ***Verfahren nennen, Version der Bibliothek nicht.*** *Der Fingerprint und
   die Version der Anlage stehen dort schon heute und bleiben; sie sagen nichts
   über eine fremde Bibliothek.*

---

7. **LÖSCHEN IN DER ZOOMANSICHT.**

   **Aus dem Betrieb, 28. August 2026** — klein im Umfang, aber sie gibt einer
   reinen Anzeige zum ersten Mal einen Schreibweg. *Draußen trägt die
   Vollbildansicht dieselben Werkzeuge wie die Ansicht darunter: wer ein Bild
   groß betrachtet, erwartet dort auch den Papierkorb.*

   **DIE KLEMME IST DIESELBE WIE DARUNTER** und wird nicht neu erfunden — und
   die Rückfrage bleibt. *Ein Papierkorb im Vollbild, der ohne Frage löscht,
   wäre der gefährlichste Knopf der Anlage.*

---

8. **WAS AUSDRÜCKLICH NICHT GEBAUT WIRD.**

   * **KEINE Benachrichtigungstabelle und kein Lesestand je Meldung.** Punkt 5,
     schlanke Fassung — der Rest ist die Fassung danach.
   * **KEIN Framework, keine Build-Kette.** Punkt 2 beantwortet die Größe mit
     kleineren Funktionen.
   * **KEINE harte Zeilengrenze im Prüfstand.** Gemessen wird, abgewiesen
     nicht.
   * **KEINE Formel in Prosa in der README.**
   * **KEINE Paketversionen in den Kennzahlen.**
   * **KEIN Schema, keine neue Formatnummer, kein Migrationsblock.** Es bleibt
     bei **sechs** Blöcken und bei **Format 11**.
   * **KEINE Adressliste für `X-Forwarded-For`.** Zweite Hälfte von Punkt 2 aus
     0.13.0, eigene Runde.
   * **KEIN Fließsatz an der Tagwolke.** Zurückgestellt in 0.13.1, mit
     Rechnung, im Sammelblatt.
   * **KEINE Bildablage.** Die steht in 0.18.0.

---

DIE ENTSCHEIDUNGEN — **alle mit Vorschlag, alle im Änderungsprotokoll zu
begründen:**

* **Die Zuordnung der Karten zu den Abschnitten** (Punkt 1).
* **Was mit einem Abschnitt geschieht, der für eine Rolle leer bleibt.**
* **Reiter oder Liste — und ob es eine Bauform für beide Breiten ist.**
* **Ob der zuletzt offene Abschnitt gemerkt wird.**
* **Ob die Teilfunktionen in `public/app.js` bleiben.**
* **Wie die Größenmessung meldet, ohne abzuweisen.**
* **Ob Punkt 4b (der Rechner) in dieser Runde mitfährt oder fällt.**

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
* **Eine Probe, die ihren Maßstab vom Prüfling bezieht, kann nicht scheitern**
  (Befund B aus 0.12.0).
* **Eine Prüflage, die die Eigenschaft gar nicht tragen KANN, ebenso wenig**
  (Stolperstein 189) — hier heißt das: **eine Lage mit einem einzigen Zugang
  kann über die Glocke nichts belegen**, und eine Lage, in der jeder Abschnitt
  Karten hat, nichts über den leeren.
* **Eine Prüfgruppe, die einen Schalter nie einschaltet, belegt nichts über den
  Zustand mit Schalter.** *Diese Frage gehört an jede neue Gruppe: welcher
  Schalter bleibt hier durchweg aus, und trägt er etwas zur Sache bei?* **In
  dieser Runde sind es mindestens `ADMIN`, `EIGENTUEMER` und
  `mehrereBenutzer()`.**
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90), **und er
  liefert nicht selbst, was die Prüfung belegen soll** (Stolperstein 102).
* **Wer eine Entscheidung zurücknimmt, sucht die Prüfungen, die sie festhalten,
  und nimmt sie mit** (Stolperstein 201). **Punkt 1 verschiebt neunzehn Karten
  — jede Prüfung, die eine Karte an ihrem alten Platz sucht, ist zu finden und
  mitzunehmen.**
* **Und der Zwilling dazu** (Stolperstein 199): *was du in einen Kommentar
  schreibst, schreibst du im selben Zug in eine Prüfung.*
* **DREI NEUE AUS 0.15.0, UND ALLE DREI TREFFEN DIESE RUNDE:**
  * **Stolperstein 211** — *eine Prüfung, die nach einem Element greift, das ihr
    eigener Rückbau wegnimmt, reißt den ganzen Lauf ab statt rot zu werden.*
    **Bei einer Runde, die neunzehn Karten verschiebt, ist das die
    wahrscheinlichste Art, sich selbst zu blenden** — jeder
    `querySelector(...)`, dessen Ziel verschwinden kann, wird abgesichert.
  * **Stolperstein 212** — *jsdom führt Folgewirkungen nicht aus.* Ein
    verstecktes Element behält dort den Zeiger, und `blur` bleibt aus. **Was
    der Browser von selbst tut, wird in der Prüflage ausdrücklich ausgelöst** —
    sonst belegt sie die halbe Kette und liest sich wie das Ganze. *Bei einer
    Runde mit Abschnitten, die auf- und zugehen, ist das die zweite
    wahrscheinliche Falle.*
  * **Stolperstein 213** — *ein Werkzeug, dessen Erfolgsmeldung den eigenen Fund
    nicht sehen kann, ist schlimmer als keines.* **Die Frage an jede
    Erfolgsmeldung, die du in dieser Runde baust: gibt es einen Zustand, in dem
    sie gar nicht anschlagen KANN?**
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Zuerst fällt **Punkt 5**, dann **Punkt 4**, dann
  **Punkt 3**. **Punkt 1 und 2 gehören zusammen und werden nicht getrennt.**

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde lautet
  die Antwort ausdrücklich NEIN: KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE
  FORMATNUMMER.** *Wenn deine Durchsicht zu einem anderen Ergebnis kommt — und
  bei der Glocke ist das die Stelle, an der es passieren könnte —, ist das ein
  Grund anzuhalten und zu fragen, nicht stillschweigend abzuweichen.*
* **Es bleibt bei sechs markierten Migrationsblöcken und bei Formatnummer 11.**
* **Die Sicherung des Datenverzeichnisses ist bei dieser Runde Empfehlung und
  nicht Pflicht** — sag das im Einspielweg deutlich, und sag auch, warum: es
  ist keine Datenbankstufe.
* **`F_ROUTEN` wächst nur, wenn eine schreibende Route dazukommt.** *Bei der
  Glocke kommt eine dazu, wenn der Zeitstempel über einen eigenen Weg gesetzt
  wird — läuft er über `PUT /api/settings`, kommt keine dazu.* **Die Zahl ist
  nachzuzählen und nicht anzunehmen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
  **Und danach kein Prüflauf mehr, den du abbrichst** — abgebrochene Läufe
  hinterlassen Server mit `ppid=1` auf den festen Portbasen, und der nächste
  Lauf wird davon rot, ohne dass am Code etwas falsch wäre.
* `Doku/Aenderungsprotokoll_0.16.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, **die Entscheidungen mit ihrer
  Begründung**, neue Stolpersteine (**die Zählung setzt bei 214 fort** — 213 ist
  vergeben), die Gegenprobentabelle **aus `gegenprobe.js`**, Prüfungszahlen
  vorher/nachher (vorher: **4351**), Rückbauten vorher/nachher (vorher: **267**),
  **die neu gemessenen Funktions- und Dateigrößen** (Punkt 2), Offengebliebenes
  — **und die Ergebnisse der Feldbelege aus Abschnitt 0, sobald sie da sind.**
* Die Zeile „0.16.0 — Fingerprint `…`" gehört ins Änderungsprotokoll,
  **ZULETZT gebildet**, nach der letzten Änderung an einer ausgelieferten Datei
  — die Versionsnummer in `package.json` eingeschlossen, **und
  `package-lock.json` trägt sie ein zweites Mal.** *Rechne ihn am Schluss noch
  einmal nach; in 0.14.0 ist er einmal zu früh gebildet worden.* **`public/`
  gehört dazu**: der Fingerprint geht über ALLES darin und nicht über eine
  Liste erwarteter Namen (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich**, mit dem Satz,
  dass die Sicherung Empfehlung bleibt und die Formatnummer bei 11 steht.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die vier, die diese Runde belegen:** einen
  Abschnitt des Systembereichs direkt über seine Adresse aufrufen und die
  Zurück-Taste benutzen; als gewöhnlicher Benutzer nachsehen, dass kein leerer
  Abschnitt dasteht; auf „gewichtet" klicken und die eigene Rechnung lesen; und
  von einem zweiten Zugang aus einen Kommentar schreiben, damit die Glocke beim
  ersten ihren Punkt bekommt.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 4, Abschnitt 5.2 und 5.6,
  Stolpersteine, Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**). Der
  Projektstand trägt die Version im Dateinamen und wird umbenannt (`git mv`);
  alle Verweise sind nachzuziehen.
* **DIE ZAHL DER KARTEN ÄNDERT SICH** (Punkt 3): neunzehn → achtzehn. *Sie
  steht an mehreren Stellen in den Papieren und im Prüfstand — alle finden,
  keine raten.*
* **Das Sammelblatt wird an drei Stellen angefasst:** die Wegweisertabelle am
  Anfang von Teil I bekommt den Vermerk zu dieser Runde; die vier Zeilen aus
  Teil II, die hier gebaut werden, wandern mit; **und die Zeile „Erwähnungen im
  Kommentar" ist neu zu beurteilen**, weil die Glocke ihrer Absage die
  Grundlage nimmt (Punkt 5). *Ein Punkt wandert vom Sammelblatt in den Fahrplan
  und von dort in ein Änderungsprotokoll — nie zurück.*
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir etwas auf, das dort falsch wird, ist das ein
  Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.**
* **Die README bekommt vier Dinge:** den Systembereich mit seinen Abschnitten
  und deren Adressen, die Glocke samt dem, was sie NICHT verspricht, die
  Erklärung der Gewichtung, und die Kennzahlen mit Version und Verfahren.
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.15.0**, mit beiden
  eigenen Abschnitten am Ende.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
