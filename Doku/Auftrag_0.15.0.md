Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.15.0 — „Der Filter und der Stift"**
**Zwei Befunde aus dem Betrieb vom 29. August 2026, gemeldet nach dem
Einspielen von 0.14.0, beide an derselben Stelle: der Ablehnung.** *Der eine ist
eine alte Lücke, der andere ist eine Nachbesserung an dem, was 0.14.0 gerade
gebaut hat.* **Keiner von beiden steht im Fahrplan.**

WORAUF SIE AUFSETZT: 0.14.0 ist gebaut, geschoben und **im Feld bestätigt** —
Fingerprint `ca8bcf31`, **4262 Prüfungen**, **249 Rückbauten** in
`gegenprobe.js`, `F_ROUTEN` bei **69**, Formatnummer **11**, **sechs** markierte
Migrationsblöcke (0.8.3, 0.8.30, 0.8.31, 0.8.40, 0.8.50, 0.14.0), Stolpersteine
bis **207**, **neunzehn** Karten im Systembereich, **elf** Vokabulareinträge,
**zwanzig** Vorgänge im Sicherheitsprotokoll, **vierzehn** Merkmale, **sieben**
Zwecke der zweiten Bestätigung. Ein voller Prüflauf dauert **rund 5 Minuten
45 Sekunden**. Laufzeitabhängigkeiten: `better-sqlite3-multiple-ciphers`,
`express`, `multer`, `nodemailer`, `sharp`.

WAS SICH ÄNDERT, IN EINEM SATZ: Die Übersicht bekommt einen Filter für
„abgelehnt" — **kombinierbar mit dem Teststatus, denn man lehnt ab, ohne zu
testen, und man lehnt nach dem Test ab** —, und die Begründung kommt zur Ruhe:
sie steht als **Aussage** da statt in einem dauernd offenen Feld, und **Stift
und Papierkorb** stehen daneben.

**DIESE RUNDE HAT IHR RISIKO IN DER RECHTEZEILE, NICHT IN DER ANZEIGE.** Punkt 3
nimmt eine Entscheidung aus 0.14.0 zurück: an `rejected_grund` gilt heute
`nurSelbst` für **jedes** Schreiben — auch für das Leeren. **Damit kann ein
Admin eine fremde Begründung weder umschreiben noch entfernen, und das
widerspricht der Hausregel „Löschen ja, umschreiben nein".** *Der Schnitt, falls
einer nötig wird, beginnt bei **Punkt 3**; **Punkt 2 wird nie geschnitten** — er
ist die Nachbesserung an dem, was 0.14.0 gebaut hat, und **Punkt 1 hängt an
nichts**.*

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST — FÜNF PUNKTE. **DER ERSTE IST DIE
   NUMMER SELBST, UND ER FÄLLT VOR DEM BAUEN.**

   * **DIE NUMMER IST ENTSCHIEDEN: 0.15.0, UND DER FAHRPLAN RÜCKT.**
     Der Auftrag ging als `0.14.1` heraus; die Regel in Abschnitt 5.1 sagt
     etwas anderes:

     > *„Dritte Zahl (PATCH) nur für abwärtskompatible Fehlerbehebungen. Eine
     > Runde, die eine Funktion bringt, ist keine PATCH-Runde — auch dann
     > nicht, wenn sie klein ist."*

     **Punkt 1 bringt eine Funktion** — nach dem Einspielen kann die Anlage
     nach „abgelehnt" filtern, was sie vorher nicht konnte. **Punkt 3 bringt
     ebenfalls eine:** eine Begründung lässt sich danach entfernen. *Nur
     Punkt 2 allein wäre PATCH.* **Also MINOR.**

     **WAS DAS FÜR DEN FAHRPLAN HEISST, und es wird hingeschrieben statt still
     vollzogen:**

     | bisher | künftig | Runde |
     |---|---|---|
     | — | **0.15.0** | **Der Filter und der Stift** *(diese Runde)* |
     | 0.15.0 | **0.16.0** | Der Systembereich, die Glocke und die Auskunft |
     | 0.16.0 | **0.17.0** | Die Suche wird nachvollziehbar |
     | 0.17.0 | **0.18.0** | Bereinigung — der Bruch |

     *Der Projektstand sagt dazu selbst: „Eine vorgemerkte Zahl bindet nicht;
     was eine Runde enthält, entscheidet ihre Nummer." Die Bereinigung ist aus
     genau diesem Grund schon zweimal umnummeriert worden — dies ist das
     dritte Mal, und es steht in Abschnitt 10a so da.*
     **Die harte Bindung des Fahrplans bleibt eingelöst:** der sechste
     Migrationsblock existiert seit 0.14.0, die Bereinigung kann ihn wegräumen,
     gleich unter welcher Nummer sie läuft.

   * **DER FINGERPRINT IST ZU BESTÄTIGEN.** Die laufende Anlage muss
     `ca8bcf31` melden — Systembereich → Kennzahlen. *Er war es bei der Meldung
     der beiden Befunde; er ist vor dem ersten Handgriff erneut abzulesen, weil
     zwischen Meldung und Bau ein Einspielen liegen kann (Stolperstein 158).*

   * **ZWEI FELDBELEGE STEHEN SEIT DREI RUNDEN AUS.** Sie kosten keine Zeile
     Code und sind ohne mich zu haben:

     1. **Der Teilexport am echten Bestand (0.12.4, offen seit dem 28. August).**
        Systembereich → Export → *In Teilen exportieren*, 300 MB. **Wie viele
        Teile, und stimmen die Dateigrößen ungefähr mit der Ansage?** Dann alle
        Teile bestätigen und laden — **mit eingeschaltetem zweitem Faktor** —,
        und danach nachsehen, dass im Sicherheitsprotokoll **keine** Zeile
        `bestaetigung.fehl` steht. *Und der eine Handgriff, der wirklich zählt:
        einen Teil in eine **Zweitanlage** einspielen, nicht in die laufende.*
     2. **Beide Netze am echten Wirt (0.13.0, offen seit dem 28. August).**
        Über HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
        `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

     **Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**
     Sie gehören ins Änderungsprotokoll dieser Runde als Nachlese.

   * **DIE TAGS BLEIBEN DEINE SACHE, UND DER GRUND IST GEKLÄRT.** Es ist **kein**
     Problem der GitHub-Rechte: der Git-Proxy der Arbeitsumgebung weist
     `POST /git-receive-pack` mit `refs/tags/*` mit **403 ohne einen einzigen
     GitHub-Header** ab — GitHub sieht die Anfrage nie. **`v0.12.3` bis
     `v0.14.0` warten auf den Merge des Arbeitsbranches.** Die Befehle stehen im
     Projektstand, Abschnitt 8. *Der Tag dieser Runde wird angelegt und der Push
     versucht; geht er unerwartet durch, ist das ein Befund.*

   * **DER VOLLE GEGENPROBENLAUF STEHT SEIT NEUN RUNDEN AUS.** 249 Rückbauten zu
     je einem vollen Prüflauf sind rund **24 Stunden** hintereinander, in vier
     Nebenspuren rund sechs. **Entscheide zu Beginn, ob er einmal ganz läuft.**
     *Läuft er nicht, schreib auf, dass er wieder aussteht.*
     **Und eine Auflage aus 0.14.0 gilt dabei:** er lässt sich **nicht neben dem
     Bauen** fahren — `gegenprobe.js` zieht seine Kopie aus `git archive HEAD`,
     und ein Commit mitten im Lauf verschiebt die Grundlage.

---

1. **DER FILTER FÜR „ABGELEHNT" — UND ER IST KOMBINIERBAR.**

   **Befund aus dem Betrieb.** Die Filterleiste trägt in der Zeile **STATUS**:
   *Alles anzeigen · Getestet · Ungetestet · ★ Favoriten · Neu seit 29.08.*
   **Ein Filter für „abgelehnt" fehlt** — und das Merkmal gibt es seit jeher.
   *Es ist also keine Lücke von 0.14.0, sondern eine alte, die erst jetzt
   auffällt, weil die Ablehnung seit 0.14.0 etwas zu sagen hat.*

   **ENTSCHIEDEN IST DIE BAUFORM: DREI ZUSTÄNDE IN EINER EIGENEN GRUPPE.**
   *Alle · Abgelehnt · Nicht abgelehnt* — **und ausdrücklich nicht als vierter
   Wert der Reihe davor.** Der Grund steht im Quelltext schon beim Favoriten:
   *„Eigener Umschalter, kein vierter Wert der Reihe davor: die drei oben sind
   drei Zustände EINES Merkmals."* **Teststatus und Ablehnung sind zwei
   Merkmale**, und *„getestet UND abgelehnt"* muss möglich bleiben — **man lehnt
   ab, ohne zu testen, und man lehnt nach dem Test ab.**

   **WARUM DREI ZUSTÄNDE UND NICHT EIN UMSCHALTER wie ★ Favoriten:** ein
   Umschalter kann nur *„zeig mir die abgelehnten"*. Gebraucht wird auch die
   Gegenrichtung — *„zeig mir alles außer den verworfenen"* —, und die ist
   vermutlich der häufigere Griff.

   **WO DER CODE STEHT:** `FILTER_VORGABE` (`public/app.js:1295`),
   `visibleItems()` (`:1655`), `filterZahl()` (`:1923`) und die Statuszeile
   (`:1984`). **Ein Filter, der in `FILTER_VORGABE` steht, wird von
   `filterNormal()` automatisch richtig behandelt** — eine gespeicherte Ansicht
   aus 0.14.0 kennt den Schlüssel nicht und fällt auf die Vorgabe zurück. *Das
   ist die Zusage, und sie ist zu prüfen, nicht zu glauben.*

   **DER FILTER IST REINE OBERFLÄCHE.** `GET /api/items` liefert `rejected`
   bereits an jeder Zeile, und der Server sieht `filters` als undurchschautes
   Objekt (`server.js:1706`). **Keine Route, keine Spalte, kein `F_ROUTEN`.**

   **WAS ZU ENTSCHEIDEN IST — DER PLATZ.** 0.13.0 hat die Filterleiste von
   229 auf 154 px gebracht; eine neue **Zeile** gäbe einen Teil davon zurück.
   Zwei Wege:

   * **(a) Zweite Gruppe in der Zeile STATUS**, mit `zweiteBeschriftung()`
     abgesetzt — das Werkzeug gibt es (`public/app.js`, in der Zeile
     „Ansichten" benutzt). **Kostet keine Zeile.** *Der Preis: die Zeile trägt
     dann acht Pillen und zwei Beschriftungen und kann bei großer Schrift
     umbrechen — was sie darf, aber sie wird voll.*
   * **(b) Eine eigene Zeile mit eigener Beschriftung.** Ruhiger zu lesen.
     *Der Preis: eine Zeile mehr, gegen die Richtung von 0.13.0.*

   **ENTSCHIEDEN IST (a)** — die Zeile heißt „Status", und die Ablehnung ist
   einer. *Bricht die Zeile bei 120 Prozent Schrift um, ist das erlaubt: sie
   trägt `flex-wrap: wrap` seit 0.13.1.*

   **DIE PRÜFUNG BRAUCHT EINE LAGE, DIE DIE SACHE TRAGEN KANN** (Stolperstein
   189). Vier Einträge, und die vier Kombinationen müssen alle vorkommen:
   **getestet+abgelehnt, getestet+nicht, ungetestet+abgelehnt, ungetestet+nicht.**
   *Eine Lage, in der jeder abgelehnte auch getestet ist, kann „kombinierbar"
   gar nicht belegen — beide Filter lieferten dieselbe Menge.* Dazu:

   * **Jeder der drei Zustände einzeln**, gegen die erwartete Menge.
   * **Die Kombination mit dem Teststatus**, in beiden Richtungen.
   * **`filterZahl()` zählt ihn mit** — sonst sagt der eingeklappte
     Filterbereich die Unwahrheit über die Frage „warum sehe ich nicht alles?".
   * **Eine gespeicherte Ansicht in der Form von 0.14.0** — ohne den neuen
     Schlüssel — bleibt lesbar und fällt auf „Alle" zurück.

---

2. **DIE BEGRÜNDUNG KOMMT ZUR RUHE — DIESER PUNKT WIRD NIE GESCHNITTEN.**

   **Befund aus dem Betrieb, und er trifft, was 0.14.0 gebaut hat.** Am Eintrag
   steht heute:

   ```
   ● Getestet    ● Abgelehnt
   Abgelehnt am 29.08.2026, 13:17 — Zu ruhig :)
   ┌──────────────────────────────────────────┐
   │ Zu ruhig :)                              │
   └──────────────────────────────────────────┘
   ```

   **Das ist dieselbe Aussage zweimal**, und das Eingabefeld steht dauerhaft
   offen. *Der Auftrag zu 0.14.0 verlangte „offen im Dialog und nicht hinter
   einem Aufklappen" — das galt der **Eingabe**, und im Ruhezustand ist es eine
   Doppelung. Der Fehler liegt bei der Umsetzung, nicht beim Auftrag.*

   **UND DIE AUSSAGE IST NICHT HERVORGEHOBEN.** Sie steht in `.hint hint-sm
   verfasser-zeile` — gedämpftes Grau, dieselbe Farbe wie „Angelegt von … am …".
   **Die Marke daneben ist rot.** *Eine Entscheidung, die den Eintrag verwirft,
   liest sich wie eine Randnotiz.*

   **ZU BAUEN IST DER RUHEZUSTAND:**

   * **Das Feld verschwindet nach der Eingabe.** Was bleibt, ist die Aussage.
   * **Es kommt zurück auf Klick — auf den Text oder auf ein ✎** —, und **nur
     für den, der die Begründung getroffen hat.**
   * **Ein ✕ daneben entfernt die Begründung** (Punkt 3).
   * **Beim EINSCHALTEN des Merkmals steht das Feld sofort offen.** *Das war der
     Sinn der Zusage aus 0.14.0 und bleibt: ein Feld, das man erst suchen muss,
     bleibt leer.* Danach schließt es sich.
   * **Ohne Begründung gibt es keinen Text zum Anklicken** — dann muss das ✎
     dastehen, sonst gibt es keinen Weg mehr hinein.

   **DAS MUSTER GIBT ES SCHON, UND ES WIRD NICHT NEU ERFUNDEN:** der Kommentar
   trägt `.acts` mit `.mact ed` (✎, nur beim eigenen) und `.mact rm` (✕, eigen
   **oder** Admin), und der Bearbeitenmodus hängt am ✎. **Dieselbe Bauform,
   dieselben Klassen, dieselben Zeichen.** *Eine zweite Bauform für dasselbe
   wäre eine zweite Wahrheit.*

   **DIE OBERFLÄCHE KANN HEUTE NICHT WISSEN, OB SIE SCHREIBEN DARF.** Sie kennt
   ihren **Namen** (`NAME`), nicht ihre **Nummer** — und aus einem Grabstein
   ließe sich gar nichts zurückrechnen, er hat keinen Namen mehr. Der Kommentar
   löst das seit jeher mit `mine` vom Server. **Hier fehlt das Gegenstück, und
   es ist zu entscheiden:**

   * **(a) Zwei Angaben nach Hausmuster:** `rejectedMine` an der Begründung
     **und** `mine` am Eintrag. Die Oberfläche rechnet daraus wie am Kommentar
     (`meins`, `verwalten`). *Der Preis: zwei neue Felder in der Antwort.*
   * **(b) Eine Angabe, die die Klemme beantwortet** — „darf ich die Begründung
     schreiben?". *Der Preis: eine Rechteauskunft in der Antwort ist eine
     zweite Wahrheit über eine Klemme, die im Server schon steht — und läuft
     mit ihr auseinander, sobald jemand nur eine Seite ändert.*

   **ENTSCHIEDEN IST (a):** zwei Angaben nach Hausmuster.

   **DIE HERVORHEBUNG ENTSCHEIDE ICH UND BEGRÜNDE SIE IM PROTOKOLL.** Die
   Aussage soll sichtbar zur roten Marke gehören. **Keine neue Farbe:**
   `--red`, `--red-dim` und `rgba(240,85,92,.42)` gibt es längst am Schalter.

   **DIE PRÜFUNG BRAUCHT BEIDE STELLUNGEN JEDES SCHALTERS.** *Welcher Schalter
   bleibt hier durchweg aus, und trägt er etwas zur Sache bei?* Hier sind es
   **zwei**: `rejectedMine` und `ADMIN`. **Vier Lagen:** der Ablehnende, ein
   fremder Admin, ein fremder Benutzer — und der Fall **ohne** Begründung.
   *Eine Gruppe, die nur den Ablehnenden fährt, belegt nichts über die anderen
   drei.* Und der Mock muss `rejectedMine` liefern wie der echte Server
   (Stolpersteine 90 und 102).

---

3. **DER PAPIERKORB — UND DIE KLEMME, DIE DAFÜR FEHLT.**

   **Hier liegt eine Lücke in 0.14.0, und sie ist gegen die eigene Hausregel.**
   *„Löschen ja, umschreiben nein"* heißt am Kommentar: den **Text** ändert nur
   der Verfasser, **entfernen** darf auch der Admin. **An `rejected_grund` gilt
   heute `nurSelbst` für jedes Schreiben** (`server.js:2501` ff.) — **damit kann
   ein Admin eine fremde Begründung weder umschreiben noch entfernen.** *Das
   ist strenger als überall sonst, und zwar ohne dass es je entschieden worden
   wäre; 0.14.0 hat die Regel nur zur Hälfte umgesetzt.*

   **ENTSCHIEDEN IST: ENTFERNEN DARF DER ABLEHNENDE UND DER ADMIN.**
   Umschreiben bleibt bei `nurSelbst`.

   **ZU BAUEN IST DIE UNTERSCHEIDUNG IM RUMPF:** ein `rejectedGrund`, der nach
   `grundText()` **leer** ist, ist ein **Entfernen** und läuft über
   `darfAendern`; alles andere ist ein **Umschreiben** und läuft über
   `nurSelbst`. *Die Klemme steht schon da (`server.js:2501`) und bekommt eine
   Fallunterscheidung, keine zweite Klemme daneben.*

   **BEIM ENTFERNEN BLEIBEN DATUM UND VERFASSER STEHEN — entschieden.** „Abgelehnt am 14.03.2026 von Anna"
   ist weiterhin wahr; nur der Grund fehlt. **Und es hat eine Folge, die
   genannt gehört:** bleibt `rejected_von` stehen, darf Anna danach eine neue
   Begründung schreiben — der Admin, der gelöscht hat, dagegen nicht. *Das ist
   „Löschen ja, umschreiben nein" in Reinform und kein Versehen.*

   **DIE PRÜFUNG BRAUCHT DREI ZUGÄNGE UND DIE NACHSCHAU IN DER DATENBANK:** der
   Ablehnende entfernt, ein fremder Admin entfernt, ein fremder Benutzer wird
   abgewiesen — **und danach steht in der Zeile wirklich, was dastehen soll.**
   *Ein 403, nach dem der Text trotzdem weg ist, wäre das Schlimmste; ein 200,
   nach dem er noch dasteht, das Zweitschlimmste.*

   **STOLPERSTEIN 201 GILT:** *wer eine Entscheidung zurücknimmt, sucht die
   Prüfungen, die sie festhalten, und nimmt sie mit.* **Sieh die Gruppe „Die
   Entscheidung wird mitgeschrieben — 0.14.0" durch:** welche Zeile hält fest,
   dass an `rejected_grund` **jedes** Schreiben über `nurSelbst` läuft? *Die
   vorhandenen Absagen schicken Text und bleiben gültig — aber das ist
   nachzusehen und nicht anzunehmen.*

---

4. **WAS AUSDRÜCKLICH NICHT GEBAUT WIRD.**

   * **KEIN Eingriffsvermerk an der Begründung.** Der Kommentar trägt
     *„2 Bilder vom Admin entfernt"*; das Gegenstück hier wäre eine **Spalte**,
     also Schema, also eine Datenbankstufe für eine Randnotiz. *Wer wissen will,
     ob eine Begründung dastand, sieht in seine Exportdatei.*
   * **KEIN Vokabulareintrag für „abgelehnt".** Es bleibt bei **elf**. „Getestet"
     hat einen, weil das Wort je Anlage ein anderes ist — *ein Ablehnen ist ein
     Ablehnen*, und ein zwölfter Eintrag kostet rund 45 Textstellen für nichts.
   * **KEIN Filter für „hat eine Begründung".** Er klingt naheliegend und wäre
     ein vierter Zustand in einer Gruppe, die drei hat.
   * **KEINE Änderung an der Kachelansicht.** Sie trägt die Marke „abgelehnt"
     und keinen Grund — *ein Grund gehört an den Eintrag und nicht in eine
     Kachelreihe.*
   * **KEIN `tested_at` und kein Grund an „getestet".** Unverändert aus 0.14.0:
     *„getestet" ist ein Zustand und keine Entscheidung.*
   * **KEINE Adressliste für `X-Forwarded-For`.** Zweite Hälfte von Punkt 2 aus
     0.13.0, eigene Runde.
   * **KEIN Fließsatz an der Tagwolke.** Zurückgestellt in 0.13.1, mit Rechnung,
     in `Doku/Fehler_und_Ideen.md`, Teil II.

---

DIE FÜNF ENTSCHEIDUNGEN — **vier sind getroffen, eine liegt bei mir; alle fünf
gehören mit ihrer Begründung ins Änderungsprotokoll:**

* **Die Nummer: 0.15.0**, und der Fahrplan rückt (Abschnitt 0).
* **Der Platz des neuen Filters: zweite Gruppe in der Statuszeile**, mit
  `zweiteBeschriftung()` abgesetzt.
* **Wie die Oberfläche erfährt, ob sie schreiben darf: zwei Angaben nach
  Hausmuster** — `mine` am Eintrag und `rejectedMine` an der Begründung.
* **Datum und Verfasser bleiben stehen**, wenn die Begründung entfernt wird.
* **Die Hervorhebung der Aussage** — meine Entscheidung, aus den vorhandenen
  Rotwerten, mit Begründung im Protokoll.

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
  (Stolperstein 189) — hier heißt das: **eine Lage, in der jeder abgelehnte
  Eintrag auch getestet ist, belegt nichts über „kombinierbar".**
* **Eine Prüfgruppe, die einen Schalter nie einschaltet, belegt nichts über den
  Zustand mit Schalter.** *Diese Frage gehört an jede neue Gruppe: welcher
  Schalter bleibt hier durchweg aus, und trägt er etwas zur Sache bei?* **In
  dieser Runde sind es zwei — `rejectedMine` und `ADMIN`.**
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90), **und er
  liefert nicht selbst, was die Prüfung belegen soll** (Stolperstein 102).
* **Wer eine Entscheidung zurücknimmt, sucht die Prüfungen, die sie festhalten,
  und nimmt sie mit** (Stolperstein 201). **Punkt 3 nimmt eine zurück.**
* **Und der Zwilling dazu** (Stolperstein 199): *was du in einen Kommentar
  schreibst, schreibst du im selben Zug in eine Prüfung.*
* **NEU AUS 0.14.0 UND FÜR DIESE RUNDE WICHTIG** (Stolperstein 206): *ein
  Rückbau kann eine Prüfung nicht röter machen, als sie schon ist.* Die
  Gegenprobe meldet, WAS rot wird, nicht seit wann. **Nur der volle Lauf gegen
  den fertigen Stand findet eine Prüflage, die von Anfang an rot war** — in
  0.14.0 ist genau das passiert.
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Zuerst fällt **Punkt 3**, dann **Punkt 1**. **Punkt 2 wird
  nie geschnitten.**

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde lautet
  die Antwort ausdrücklich NEIN: KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE NEUE
  FORMATNUMMER.** Die drei Spalten stehen seit 0.14.0; diese Runde liest sie
  und schreibt in eine davon. *Wenn deine Durchsicht zu einem anderen Ergebnis
  kommt, ist das ein Grund anzuhalten und zu fragen, nicht stillschweigend
  abzuweichen.*
* **Es bleibt bei sechs markierten Migrationsblöcken und bei Formatnummer 11.**
* **Die Sicherung des Datenverzeichnisses ist bei dieser Runde Empfehlung und
  nicht Pflicht** — sag das im Einspielweg deutlich, und sag auch, warum: es
  ist keine Datenbankstufe.
* **`F_ROUTEN` bleibt bei 69**, solange keine schreibende Route dazukommt.
  *Prüf es, statt es anzunehmen.*

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
  **Und danach kein Prüflauf mehr, den du abbrichst** — abgebrochene Läufe
  hinterlassen Server mit `ppid=1` auf den festen Portbasen, und der nächste
  Lauf wird davon rot, ohne dass am Code etwas falsch wäre.
* `Doku/Aenderungsprotokoll_0.15.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, **die fünf Entscheidungen mit ihrer
  Begründung**, neue Stolpersteine (**die Zählung setzt bei 208 fort** — 207 ist
  vergeben), die Gegenprobentabelle **aus `gegenprobe.js`**, Prüfungszahlen
  vorher/nachher (vorher: **4262**), Rückbauten vorher/nachher (vorher: **249**),
  Offengebliebenes — **und die Ergebnisse der beiden Feldbelege aus Abschnitt 0,
  sobald sie da sind.**
* Die Zeile „0.15.0 — Fingerprint `…`" gehört ins Änderungsprotokoll,
  **ZULETZT gebildet**, nach der letzten Änderung an einer ausgelieferten Datei
  — die Versionsnummer in `package.json` eingeschlossen, **und
  `package-lock.json` trägt sie ein zweites Mal.** *In 0.14.0 ist der
  Fingerprint einmal zu früh gebildet worden und musste berichtigt werden;
  aufgefallen ist es nur, weil er am Schluss noch einmal nachgerechnet wurde —
  tu das auch.* **`public/` gehört dazu**: der Fingerprint geht über ALLES darin
  und nicht über eine Liste erwarteter Namen (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich**, mit dem Satz,
  dass die Sicherung Empfehlung bleibt und die Formatnummer bei 11 steht.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die drei, die diese Runde belegen:** nach
  „Abgelehnt" filtern und die Menge mit „Getestet" kombinieren; eine Begründung
  schreiben, das Feld schließen, über das Stiftsymbol wieder öffnen; und als
  Admin eine fremde Begründung **entfernen** — und danach vergeblich versuchen,
  eine neue hinzuschreiben.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 4, Abschnitt 5.2 und 5.6,
  Stolpersteine, Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**). Der
  Projektstand trägt die Version im Dateinamen und wird umbenannt (`git mv`);
  alle Verweise sind nachzuziehen.
* **DER FAHRPLAN RÜCKT.** Abschnitt 10 und 10a sind umzunummerieren — und
  **die Umnummerierung wird ausdrücklich hingeschrieben, nicht still
  vollzogen**, genau wie beim bisherigen Rücken der Bereinigung.
  *Ein Punkt wandert vom Sammelblatt in den Fahrplan und von dort in ein
  Änderungsprotokoll — nie zurück.*
* **Das Sammelblatt wird an genau einer Stelle angefasst:** die
  Wegweisertabelle am Anfang von Teil I bekommt den Vermerk zu dieser Runde.
  Sonst nichts — **es sei denn, beim Bauen fällt etwas an, das dort hingehört**;
  dann kommt es als Zeile in Teil II.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir etwas auf, das dort falsch wird, ist das ein
  Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.**
* **Die README bekommt zwei Dinge:** den neuen Filter in der Beschreibung der
  Filterleiste, und **wer eine Begründung ändern und wer sie entfernen darf** —
  die Rechtetabelle am Eintrag trägt seit 0.14.0 eine Zeile dazu und wird
  genauer.
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.14.0** — der letzten
  MINOR-Runde —, mit beiden eigenen Abschnitten am Ende.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
