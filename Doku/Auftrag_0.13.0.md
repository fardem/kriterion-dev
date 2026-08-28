Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.13.0 — „Zwei Netze, ein Zugang."**
**Eine MINOR-Runde, und sie ist die zweite aus dem Fahrplan** — Projektstand,
Abschnitt 10a, dort stehen die Punkte 2 bis 4 ausgearbeitet. **Punkt 1 steht
dort nicht:** er ist ein Befund aus dem Betrieb vom 28. August 2026 und kam nach
dem Fahrplan dazu.

WORAUF SIE AUFSETZT: 0.12.4 ist gebaut und geschoben, Fingerprint `ca991cf5`,
**3992 Prüfungen**, **195 Rückbauten** in `gegenprobe.js`, `F_ROUTEN` bei
**69**, Formatnummer **10**, **fünf** markierte Migrationsblöcke, Stolpersteine
bis **190**, **neunzehn** Karten im Systembereich, **elf** Vokabulareinträge,
**zwanzig** Vorgänge im Sicherheitsprotokoll, **dreizehn** Merkmale, **sieben**
Zwecke der zweiten Bestätigung. Laufzeitabhängigkeiten:
`better-sqlite3-multiple-ciphers`, `express`, `multer`, `nodemailer`, `sharp`.

WAS SICH ÄNDERT, IN EINEM SATZ: Der Export in Teilen wird wieder benutzbar — mit
eingeschaltetem zweitem Faktor ist er es heute nicht —, die Anlage ist danach
über HTTPS **und** über das Heimnetz erreichbar statt nur über den Weg, den eine
einzige Einstellung gerade offenhält, und drei kleinere Punkte ziehen mit —
zwei am Zugang, einer an der Filterleiste.

**DIESE RUNDE HAT EIN BETRIEBSRISIKO IM KERN, UND DAS UNTERSCHEIDET SIE VON DEN
LETZTEN VIER.** 0.12.1 bis 0.12.4 waren Befunde aus dem Betrieb, alle PATCH —
**einer davon ist noch offen und fährt als Punkt 1 mit.** **In Punkt 2 steht der
einzige Punkt der ganzen Liste, bei dem ein Ausfall bedeutet, dass niemand mehr
hereinkommt** — nicht die Daten sind in Gefahr, sondern der Zugang zu ihnen.
*Der Schnitt, falls einer nötig wird, liegt zwischen Punkt 3 und Punkt 2;
**Punkt 1 wird nie geschnitten**, er repariert Laufendes.*

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST — VIER PUNKTE, UND DREI DAVON SIND
   NACHLESE ZU 0.12.4. **EINER IST BEIM SCHREIBEN DIESES AUFTRAGS SCHON
   BEANTWORTET WORDEN.**

   * **DER FINGERPRINT IST BESTÄTIGT — 28. August 2026.** Die laufende Anlage
     meldet `ca991cf5`, der Branch misst dasselbe. **Damit steht fest, dass auf
     dem Wirt genau der Stand liegt, den dieser Auftrag voraussetzt.** *Bei 0.9.1 hat
     sich dort eine Datei zu viel gezeigt (Stolperstein 158): der Server lief
     einwandfrei, jede Prüfung war grün, und trotzdem stand auf dem Wirt ein
     Stand, den kein Commit hatte.* **0.12.3 ist ohne diese Gegenprobe
     eingespielt worden** — das war eine Ausnahme und soll keine werden.

   * **DER TEILEXPORT IST AM ECHTEN BESTAND NOCH NICHT GESEHEN — UND MIT
     EINGESCHALTETEM ZWEITEM FAKTOR GEHT ER DERZEIT ÜBERHAUPT NICHT.** Er ist an
     drei Prüflagen gefahren, die größte mit 1000 Einträgen, und jedes Mal
     stimmte der Rundlauf Feld für Feld. **Der echte Bestand trägt Videos und
     Kommentarbilder in anderen Größen.** *Warum er derzeit nicht geht, steht als
     Punkt 1 — er wird deshalb zuerst gebaut.*

     **Was JETZT geht, ohne eine Zeile Code:**

     1. Systembereich → Export → **In Teilen exportieren**, 300 MB. *Wie viele
        Teile? Bei 760 MB sollten es drei sein.* **Steht dort ein Eintrag unter
        „passt in keinen Teil", nenn ihn mir.** Der Plan wird gerechnet, ohne
        dass irgendetwas zu bestätigen wäre — dieser Schritt ist vom Fehler
        nicht betroffen.

     **Was ERST NACH PUNKT 1 geht:**

     2. Alle Teile bestätigen, alle laden. *Stimmen die Dateigrößen ungefähr mit
        der Ansage?*
     3. **Und der eine Handgriff, der wirklich zählt:** einen Teil in eine
        Zweitanlage einspielen — nicht in die laufende. *Sag mir, ob dabei
        etwas fehlt.*

     **Bis 2 und 3 gelaufen sind, ist 0.12.4 nicht bestätigt.** *Schritt 1 sag
     mir gleich; die beiden anderen, sobald Punkt 1 steht.*

   * **DIE TAGS SIND JETZT DEINE SACHE, UND DER GRUND IST GEKLÄRT.** Er stand
     fünf Runden lang falsch in den Papieren. **Es ist kein Problem der
     GitHub-Rechte:** `GET /info/refs?service=git-receive-pack` antwortet mit
     200 samt GitHub-Kopfzeilen, ein Branchpush auf denselben Commit geht durch,
     und nur `POST /git-receive-pack` mit `refs/tags/*` bekommt **403 ohne einen
     einzigen GitHub-Header** — GitHub sieht die Anfrage nie. **Der Git-Proxy
     der Arbeitsumgebung weist sie ab, nach der Ref-Art.** Die Befehle für
     `v0.11.0` bis `v0.12.2` stehen im Projektstand, Abschnitt 8; `v0.12.3` und
     `v0.12.4` warten auf den Merge des Arbeitsbranches.
     **Ich lege den Tag `v0.13.0` weiterhin an und versuche den Push** — sollte
     er unerwartet durchgehen, ist das ein Befund und gehört ins Protokoll.

   * **DER VOLLE GEGENPROBENLAUF STEHT SEIT FÜNF RUNDEN AUS.** 195 Rückbauten
     zu je einem vollen Prüflauf sind über zwanzig Stunden; das ist der Grund,
     und er wird nicht besser. **Entscheide zu Beginn dieser Runde, ob er
     einmal ganz läuft** — und wenn ja, dann *vor* dem Bau, damit er nicht am
     Ende die Runde blockiert. *Läuft er nicht, schreib auf, dass er wieder
     nicht gelaufen ist; eine Zahl, die seit fünf Runden steht, ist keine
     Zusage mehr.*

---

1. DER EXPORT IN TEILEN IST MIT EINGESCHALTETEM ZWEITEM FAKTOR UNBENUTZBAR —
   EIN BEFUND AUS DEM BETRIEB, GEMELDET AM 28. AUGUST 2026.

   **Das ist mein Fehler aus 0.12.4, und er steht seit dem Einspielen auf der
   laufenden Anlage.** Er kommt zuerst: er ist klein, er ist geschlossen, und
   **die Feldprüfung aus Abschnitt 0 hängt an ihm** — ohne ihn lässt sich der
   Teilexport nicht einmal auslösen.

   **WAS PASSIERT.** Der Knopf „Alle n Teile freigeben" fragt einmal nach
   Passwort und Code und schickt dann **denselben Code n-mal** an
   `POST /api/bestaetigung`, einmal je Teil. An einem laufenden Server
   nachgestellt, drei Teile:

   ```
   Teil 1: 200  Freigabe erteilt
   Teil 2: 403  Der Code stimmt nicht.
   Teil 3: 403  Der Code stimmt nicht.
   ```

   **WARUM.** Ein Code des zweiten Faktors gilt **genau einmal** — das ist seine
   ganze Zusage, und sie steht in der Bedingung des Schreibvorgangs
   (`auth.js`, `verbraucheZaehler`: der Zähler muss echt größer sein als der
   zuletzt verbrauchte). Der Kommentar an `zweiteBestaetigungMehrfach`
   (`public/app.js`) sagt *„Der Mensch tippt einmal, geprüft wird n-mal"* —
   **das stimmt fürs Passwort, das gegen einen Hash läuft und sich beliebig oft
   vergleichen lässt, und für den zweiten Faktor stimmt es nicht.** Der
   Unterschied ist beim Bauen übersehen worden.

   **DIE MELDUNG IST WAHR UND TROTZDEM IRREFÜHREND:** der Code war richtig, er
   war verbraucht. **Wer das liest, sucht den Fehler bei sich** — genau das ist
   aus dem Betrieb zurückgekommen.

   **WAS NEBENHER KAPUTTGEHT — alles nachgemessen und nicht erschlossen:**

   * **Fehlalarme im eigenen Sicherheitsprotokoll.** Jeder Fehlschlag schreibt
     `bestaetigung.fehl`. Drei Teile hinterlassen drei Zeilen über den
     Eigentümer selbst — an genau der Karte, die Punkt 3 durchsuchbar macht.
   * **Die Anmeldebremse zählt mit.** `SOFT_LIMIT` 5, `HARD_LIMIT` 10, Sperre
     fünf Minuten je Adresse. Der erste Aufruf gelingt und setzt die Zähler
     zurück, danach scheitern n−1 — **bei elf Teilen greift die harte Sperre.**
     *Die laufende Sitzung bleibt davon stehen; was fünf Minuten lang nicht mehr
     geht, ist eine Anmeldung oder eine Bestätigung von dieser Adresse.* **Wer
     in diesem Fenster neu anmelden muss, kommt nicht herein.**
   * **Ein Wiederherstellungscode wird verbrannt.** Wer statt des Codes einen
     Zettelcode einträgt, verliert ihn beim ersten Aufruf endgültig, und die
     übrigen scheitern trotzdem. **Ein Code weg, kein Export.**
   * **Eine Freigabe bleibt liegen.** Teil 1 ist erteilt, dann bricht die
     Oberfläche ab. Kein Loch — sie hängt an Sitzung, Zweck und Ziel und läuft
     ab —, aber unsauber.

   **NICHT BETROFFEN:** der einzelne Export. Eine Bestätigung, ein Ziel, ein
   Code. **Und die Sicherung nicht**, sie kennt die zweite Bestätigung gar
   nicht — das ist der Weg, der bis zur Reparatur offensteht.

   **ZU BAUEN IST (a) UND (b):**

   **(a) `POST /api/bestaetigung` LERNT DIE MEHRZAHL.** Eine Anfrage trägt alle
   Teilnummern, das Passwort wird einmal geprüft, **der Code einmal
   verbraucht**, und alle Freigaben kommen in einer Antwort zurück; die
   Oberfläche schickt eine Anfrage statt n.
   **Was dabei bleiben MUSS: das Laden eines Teils verbraucht genau eine
   Freigabe.**
   Das ist die Eigenschaft, auf die es ankommt — sie ist nicht das Problem und
   darf nicht mit weggeräumt werden.
   *Keine neue Route, die vorhandene lernt ein Feld dazu:* **`F_ROUTEN` bleibt
   bei 69**, `BESTAETIGUNG_ZWECKE` bei **sieben**.
   **Die Zahl der Ziele gehört begrenzt** — `AUSTAUSCH_TEIL_MAX` ist 999, und
   eine Anfrage, die zehntausend Freigaben bestellt, darf nicht durchgehen.
   **Doppelte Nummern sind ein 400** und keine stillschweigend halbierte
   Bestellung.

   **(b) DER KNOPF SAGT, WAS ER TUT.** „Alle 3 Teile freigeben" ist mein Wort
   aus dem Maschinenraum; wer davorsitzt, liest daraus nichts — **die Frage
   „was ist mit freigeben gemeint?" kam aus dem Betrieb.** Es ist derselbe
   Fehler wie „Code aus deiner App" in 0.12.3: **die Mechanik benannt statt der
   Handlung.** Gebraucht wird ein Text, der sagt, dass **einmal bestätigt und
   danach jeder Teil einzeln geladen** wird — am Knopf, und ein Satz darüber,
   warum überhaupt gefragt wird. *Formulier ihn und sag mir den Wortlaut; nimm
   ihn nicht als gegeben hin, nur weil hier einer stünde.*

   **WARUM DER PRÜFSTAND ES NICHT GEFANGEN HAT — und das ist der eigentliche
   Befund.** Die Gruppe „Der Export in Teilen" fährt gegen einen Server **ohne
   zweiten Faktor**. Dort ist das wiederholte Passwort harmlos. **Die
   Einmaligkeit gibt es nur mit eingeschaltetem Faktor, und keine einzige der
   38 Prüfungen stellt beides zusammen.** 3992 Prüfungen, und die eine
   Kombination, an der es hängt, fehlt.

   > **DIE NEUE PRÜFLAGE FÄHRT MIT EINGESCHALTETEM ZWEITEM FAKTOR** und holt
   > **mehr als eine** Freigabe — eine Lage mit einem einzigen Teil bliebe grün
   > und belegte nichts. **Und sie sieht nach, dass danach KEINE Zeile
   > `bestaetigung.fehl` im Protokoll steht:** die Fehlalarme sind der Teil des
   > Schadens, den sonst niemand sieht. *Der Rückbau dazu ist der Zusammenzug —
   > fällt er weg und die Oberfläche fragt wieder je Teil, muss die Lage rot
   > werden.*

---

2. DER PROXY IST EIN JA/NEIN, DIE ANLAGE IST BEIDES — DAS EINZIGE
   BETRIEBSRISIKO AUF DER LISTE.

   **Die Ausarbeitung steht im Projektstand, Abschnitt 10a, unter 0.13.0, „Der
   Proxy ist ein Ja/Nein, die Anlage ist beides".** Lies sie, bevor du
   anfängst; hier steht nur, was sie nicht sagt.

   **Was heute ist:** `HINTER_PROXY` bündelt **fünf** Wirkungen —
   `X-Forwarded-For` glauben, `Secure` am Cookie, das Präfix `__Host-`, HSTS und
   die Startwarnung bei `http://` in `OEFFENTLICHE_ADRESSE`. Die Einstellung
   steht seit 0.10.0 auf `1`, und die Anlage ist inzwischen **aus zwei Netzen
   zugleich erreichbar**. Über `http://<server-ip>:3100` kommt damit niemand
   mehr herein: der Server antwortet mit 200 und setzt den Cookie, **der
   Browser verwirft ihn stillschweigend**, und im Serverprotokoll steht davon
   nichts. *Gemessen, nicht vermutet.*

   **Was es kostet, wenn es bleibt:** fällt der Proxy aus oder läuft ein
   Zertifikat ab, gibt es **gar keinen Weg mehr in die Oberfläche**. Der
   Handgriff dagegen steht in der README — Einstellung abschalten, neu starten.
   **Er braucht einen Menschen am Wirt, genau dann, wenn nichts mehr geht.**

   **Zu bauen ist (a), und (b) ausdrücklich nicht:**

   **(a) `X-Forwarded-Proto` je Anfrage lesen — mit ZWEI Cookienamen, nicht mit
   einem.** Der Kopf wird bisher **nirgends** gelesen. Der sichere Weg bekommt
   weiterhin `__Host-` samt `Secure`, der Heimnetzweg einen eigenen Namen ohne
   beides.

   **(b) Was NICHT gebaut wird: ein Name mit bedingtem `Secure`.** Das gäbe
   Sicherheit auf, statt Bequemlichkeit zu gewinnen: wer im eigenen Netz eine
   Klartextverbindung verbiegen kann, setzte damit einen Cookie, den die
   HTTPS-Seite anschließend **auch annimmt** — und genau dagegen gibt es
   `__Host-`. *Wenn dir beim Bauen ein Weg einfällt, der mit einem Namen
   auskommt: schreib ihn auf und bau ihn nicht.*

   **(c) Die Adressliste, wer den Kopf setzen darf.** In 0.8.20 ausdrücklich
   nicht gebaut, weil die Einstellung ein Ja/Nein sein sollte. **Sie ist die
   Antwort auf die zweite Hälfte des Problems — die offene Portfreigabe 3100 —
   und nicht auf die erste.** *Entscheide, ob sie in diese Runde gehört oder
   eine eigene ist; beides ist vertretbar, stillschweigend übergehen nicht.*

   **VIER FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Meldet das Umlegen alle einmalig ab?** Heute ja, weil `__Host-` den Namen
     wörtlich verlangt. Bei zwei Namen nebeneinander gilt das nicht mehr — *ist
     das ein Gewinn oder verliert man damit einen ehrlichen Schnitt?*
     **Entscheide und begründe.**
   * **Gilt HSTS dann nur auf dem HTTPS-Weg?** *Es muss*, sonst sperrt der Kopf
     den Heimnetzweg aus, den (a) gerade offenhalten soll. **Nenn die Stelle, an
     der du das festmachst.**
   * **Was macht `X-Forwarded-For`, wenn die Anfrage NICHT über den Proxy kam?**
     Die Adressermittlung hängt an derselben Einstellung. **Ein Kopf, den der
     Aufrufer selbst setzt, darf die Anmeldebremse nicht aushebeln** — und
     genau das ist heute möglich, solange Port 3100 offen steht.
   * **Bleibt `HINTER_PROXY` überhaupt bestehen?** Wenn der Kopf je Anfrage
     entscheidet, ist die Einstellung womöglich nur noch für HSTS und die
     Startwarnung da. *Ich neige zu: behalten, aber ihre Bedeutung schrumpfen
     lassen und das in der README sagen.* **Entscheide.**

   **DER PRÜFSTAND MUSS BEIDE WEGE FAHREN**, nicht einen. Eine Prüflage, die
   nur den HTTPS-Weg kennt, bliebe grün, während der Heimnetzweg zu ist — und
   das ist genau der Fehler, der heute im Betrieb steht.

---

3. GESCHEITERTE ANMELDUNGEN: SICHTBAR MACHEN.

   **Ausgearbeitet im Projektstand, Abschnitt 10a.** *Zwei Teile dieses Punktes
   sind mit 0.12.3 schon gebaut und fallen hier weg:* das CrowdSec-Beispiel über
   das Zugriffsprotokoll des Proxys **(d)** und die Protokollrotation über
   Docker **(e)** stehen in der README.

   **Was bleibt:**

   **(a) Ein Filter an der Karte, und die Namen anklickbar.** Nach Vorgangsart
   filtern, „gescheiterte Anmeldungen" als eigene Ansicht, und ein Klick auf den
   Zugang springt zu ihm. *Klein, ändert kein Schema, nimmt niemandem etwas
   weg.* **Die Karte holt heute die hundert jüngsten Zeilen — man findet die
   gescheiterten Anmeldungen darin nicht, sie stehen nur dazwischen.**

   **(b) Was AUSDRÜCKLICH NICHT gebaut wird: der getippte Name oder die Adresse
   in der Protokolltabelle.** Das steht gegen zwei festgeschriebene
   Entscheidungen, von denen eine als **Zusage im Kartentext** steht: *„Ebenso
   wenig Adresse oder Browserkennung: die Anlage speichert beides nicht."* Und
   der Grund für „kein Freitext" steht wörtlich am Schema in `db.js`: *„sonst
   landete früher oder später ein ins falsche Feld getipptes Passwort darin."*
   **Das ist keine Vorsicht auf Verdacht** — Facebook, Twitter und GitHub haben
   genau so Klartextpasswörter in ihren Protokollen gefunden.
   **Auch „gleich ob ausgebremst" ist keine Lücke, sondern der Deckel:** der
   ausgebremste Fall schreibt absichtlich nichts, denn die Bremse ist das
   Einzige, was verhindert, dass ein Fremder die Tabelle vollschreibt.

   **(c) Eine maschinenlesbare Zeile nach stdout — und die Frage, ob sie
   überhaupt noch gebraucht wird.** Sie hängt unmittelbar an Punkt 2: **ohne die
   richtige Adressermittlung sperrte CrowdSec den Proxy statt den Angreifer.**
   *Seit 0.12.3 steht der Weg ohne eine Zeile Code in der README, und er
   könnte (c) ganz ersparen.* **Prüf zuerst, ob er reicht** — und bau (c) nur,
   wenn du sagen kannst, warum nicht.

   > **UND WENN DU SIE BAUST, IST SIE EINE ZUSAGE.** Ein Logformat, das jemand
   > parst, bricht fremde Einrichtungen, sobald es sich ändert. **Das gehört
   > entschieden, bevor die erste Zeile geschrieben wird**, und es gehört in
   > Abschnitt 5 des Projektstands, nicht nur ins Änderungsprotokoll.

---

4. GELÖSCHTE ZUGÄNGE, UND DER WEG ZURÜCK — EIN SATZ GEGEN EINE UNUMKEHRBARE
   FEHLBEDIENUNG.

   **Ausgearbeitet im Projektstand, Abschnitt 10a.**

   **(b) DER LÖSCHDIALOG NENNT DEN UMKEHRBAREN WEG. Das ist der billigste Punkt
   dieser Runde mit dem größten Schaden dahinter, und deshalb steht er über
   allen anderen.** Heute sagt er „unwiderruflich" und „der Name wird frei" —
   er sagt **nicht**, dass es daneben einen Weg gibt, der beides nicht tut. Ein
   Satz:

   > *„Nur vorübergehend aussperren? Dann **sperren** statt entfernen — das ist
   > umkehrbar, und der Name bleibt."*

   **Die Rückholfrist ist damit zur Hälfte schon gebaut, sie heißt nur anders.**
   Sperren weist die Anmeldung ab, die laufende Sitzung fällt, **der Name bleibt,
   der Bestand bleibt**, und der Admin kann es jederzeit zurücknehmen. *Was
   fehlt, ist nicht der Mechanismus — es ist der Satz, der ihn nennt.*

   **(a) Gelöschte Zugänge raus aus der Liste, in ein eigenes Fenster.** Das
   Vorbild steht im Projekt: der Dialog **„Wer hat bewertet"**. *Reine
   Oberfläche.*

   **(c) Was NICHT gebaut wird: der Ursprungsname am Grabstein.** Zwei harte
   Gründe, und beide sind nicht wegzudiskutieren: **der Name wird zur Neuvergabe
   frei** und kollidiert irgendwann mit einem lebenden Zugang, der ihn
   inzwischen trägt — und **der Grabstein IST die Anonymisierung**, genau das,
   was Artikel 17 DSGVO verlangt. *Wer den Namen aufbewahrt, hat nicht
   gelöscht.* Am Schema in `db.js` steht wörtlich, warum das
   Sicherheitsprotokoll keine Namensspalte hat: *„eine Kopie hier wäre die eine
   Stelle im Projekt, die den Grabstein rückgängig macht."*

   **(d) Die Rückholfrist von dreißig Tagen: NICHT in dieser Runde.** Sie ist
   ein eigener Zustand zwischen „aktiv" und „gelöscht", mit eigenem Aufräumer,
   und sie überschneidet sich mit „gesperrt". *Wenn (b) steht, ist die Frage
   womöglich beantwortet. Bau sie nicht ungefragt.*

---

5. DIE FILTERLEISTE KOSTET ZWEI ZEILEN ZU VIEL — NACHGEMESSEN, NICHT GESCHÄTZT.

   **Aus dem Betrieb, 28. August 2026, mit einem Bild dazu.** *Reine
   Oberfläche, hängt an keinem anderen Punkt und lässt sich jederzeit
   herausnehmen.*

   **DER BEFUND.** Bei 1359 px Fenster (1232 px Inhalt) ist die Leiste
   **229 px** hoch — fünf Zeilen, und rechts bleibt frei:

   | Zeile | Höhe | frei rechts |
   |---|---|---|
   | Status | 31 px | 713 px |
   | Kategorie | 31 px | 884 px |
   | Tags | 64 px | 0 px |
   | Sortieren | 31 px | 910 px |
   | Ansichten | 31 px | 995 px |

   **Vier von fünf Zeilen sind zu mehr als der Hälfte leer**, nur die Tagwolke
   füllt die Breite. Die Leiste ist als *eine Steuergruppe = eine Zeile* gebaut,
   und jede Zeile kostet 41 px — ob vier Pillen darin stehen oder ein einzelnes
   Auswahlfeld. **Ziel sind 147 px**, also 82 px weniger; mit dem Abstand
   darunter fällt der Weg bis zum ersten Eintrag von 253 auf 171 px.

   **ZU BAUEN IST (a), (b) UND (c):**

   **(a) DIE TAGZEILE WIRD EINE ZEILE:** Beschriftung, Und/Oder, Wolke, und am
   Ende „mehr" und „zurücksetzen".
   **Warum das heute nicht geht, und das ist der Kern:** `.frow-rechts` trägt
   `margin-left: auto`. Eine selbsttätige Außenkante frisst den gesamten freien
   Platz der ersten Zeile — **die Wolke KANN dort nicht danebenstehen**, sie
   rutscht immer darunter. Sie steht im Aufbau absichtlich hinter den Verweisen,
   damit „mehr" nicht eine ganze Tagreihe kostet: *der Grund ist richtig, nur
   die Lösung ist zu teuer.*
   **Der Weg:** die Wolke wird ein Flex-Element (`flex: 1 1 0`, `min-width: 0`),
   die Verweise stehen als gewöhnliche Geschwister **dahinter**, die
   selbsttätige Kante entfällt. Damit wird die Reihenfolge im Aufbau wieder die
   natürliche — und der lange Kommentar darüber, warum sie es nicht ist, fällt
   mit weg.
   **KEINE AUSGERECHNETE BREITE, an keiner Stelle.** Das war Befund A aus
   0.12.1 (`right: 92px`), und die Anlage stellt die Schrift von 80 bis 120
   Prozent — jede feste Zahl kann dabei nur falsch werden.
   `begrenzeWolke()` bleibt unangetastet: es misst die Höhe **einer** Zeile und
   fragt `scrollHeight > clientHeight`. Beides gilt auch für eine schmalere
   Wolke. *Prüf es trotzdem nach, statt es zu glauben.*
   **DER PREIS IST BEKANNT UND ANGENOMMEN:** die Wolke verliert rund 230 px,
   das sind etwa **drei sichtbare Tags**; „mehr" fängt sie. *Die erste Zeile ist
   heute zu 73 Prozent leer — der Tausch geht klar zugunsten der Höhe aus.*

   **(b) SORTIEREN UND ANSICHTEN TEILEN SICH EINE ZEILE.** Gemessen brauchen sie
   **322** und **237** px von 1232 — sie passen mit Abstand.
   **Der schlimmste Fall ist harmlos:** stehen einmal acht gespeicherte Ansichten
   da (`ANSICHTEN_DECKEL`), bricht die Zeile um und sieht aus wie heute. Nichts
   wird abgeschnitten, nichts geht verloren.
   *Zwei Beschriftungen in einer Zeile — sieh zu, dass die zweite nicht wie eine
   Überschrift über den Ansichten aussieht, sondern wie das Gegenstück zur
   ersten.*

   **(c) „NEU SEIT …" MIT NULL TREFFERN WIRD GEDÄMPFT.** Heute steht die Pille in
   voller Helligkeit da und führt garantiert auf eine leere Liste. **Tags in
   genau derselben Lage werden gedämpft** — `.pill-tag.leer`, `opacity: .34`,
   dazu der Hinweis „Zusammen mit der aktuellen Auswahl kein Treffer".
   **Dieselbe Sache, zwei Verhalten** (Stolperstein 47, im Kleinen). *Die Zahl
   steht schon da und wird schon gerechnet; es fehlt die Klasse und der
   Hinweis.*

   **WAS AUSDRÜCKLICH NICHT GEBAUT WIRD:**

   **(d) Die Beschriftungsspalte bleibt.** Sie wegzunehmen gäbe 86 px je Zeile
   zurück und wäre der größere Hebel — **entschieden dagegen:** die Leiste wird
   ohne sie schwerer zu überfliegen, und es ist ein anderer Eingriff als zwei
   Zusammenlegungen. *Fällt dir beim Bauen auf, dass (a) ohne sie viel einfacher
   wäre: sag es, bau es nicht.*

   **(e) „Ohne Kategorie" als Filter — NICHT in dieser Runde.** Der Befund steht
   und ist echt: der Kopf sagt 12 Einträge, die Kategorien sagen 1 + 9 = 10.
   **Zwei Einträge sind über die Kategoriezeile nicht erreichbar** — „Alle" zeigt
   sie, keine Kategorie zeigt sie. Das ist Filterlogik und Serverarbeit und keine
   Zeilenersparnis; *es steht als Zeile in Teil II des Sammelblatts und wartet
   dort.*

   **(f) UND DIE ALTE DOPPELUNG WIRD DAMIT ZUR ENTSCHEIDUNG — das ist der Teil,
   den man beim Bauen übersieht.** Teil II des Sammelblatts trägt seit 0.12.3 die
   Zeile *„Dieselbe Tagwolke ist an zwei Stellen verschieden gebaut"*:
   Eintragsseite `.wolke-kopf` mit `space-between`, Übersicht als Kind der
   Filterzeile mit `margin-left: auto`. Dort steht wörtlich: **„Solange beide
   dasselbe tun, ist es eine Doppelung und kein Fehler; sobald eine von beiden
   sich ändert, ist es einer."** *(a) ändert genau eine von beiden.*
   **Also gehört entschieden und begründet:** zieht die Eintragsseite mit, oder
   bleibt sie stehen? Bleibt sie, steht der Grund im Änderungsprotokoll und die
   Zeile im Sammelblatt wird nachgezogen. **Stillschweigend auseinanderlaufen
   lassen ist der eine Ausgang, den es nicht gibt.**

   **NACHHER WIRD WIEDER GEMESSEN**, mit demselben Fenster: 229 px vorher, rund
   147 px nachher. **Sag die Zahl, statt zu sagen, es sehe besser aus.**

   **DER PRÜFSTAND KANN DIESE ZEILEN NICHT SEHEN.** `jsdom` rechnet kein Layout —
   das steht seit 0.12.3 als offener Punkt im Sammelblatt und trifft hier zum
   zweiten Mal zu. **Was sich prüfen lässt, ist der Aufbau:** dass Wolke und
   Verweise Geschwister in EINER `.frow` sind, dass im Stilblatt keine
   ausgerechnete Breite steht, und dass die Pille mit null Treffern ihre Klasse
   und ihren Hinweis bekommt. *Prüf, was da ist; behaupte nicht, was du nicht
   messen kannst.*

---

6. WAS DIESE RUNDE NICHT ANFASST — UND DAS IST DER GRÖSSERE TEIL DER LISTE.

   Der Fahrplan hat noch vier Runden. **Drei davon sind nicht diese.**

   | Nicht jetzt | Wann | Warum nicht hier |
   |---|---|---|
   | `rejected_at`, `rejected_grund`, `rejected_von` | **0.14.0** | **Schema und Formatnummer** — eine Schema-Runde verträgt keine Beifracht |
   | Systembereich in Abschnitte, `renderSystem()` zerlegen, Glocke, Gewichtung | **0.15.0** | die größte Umbaufläche des Plans |
   | Trefferkontext in der Suche | **0.16.0** | eigene Prüflage gegen `innerHTML` |
   | Migrationscode raus, Absage an alte Datenbanken | **0.17.0** | **muss NACH 0.14.0**, sonst überlebt deren Block den Rückbau |

   **Und ausdrücklich nicht: der Import als Strom.** Er steht seit 0.12.4 als
   offener Punkt — eine einzelne Datei über 512 MB lässt sich weiterhin nicht
   einspielen, gleich woher sie kommt. *Der Weg dahin wäre ein zeilenweiser
   Leser für JSON auf dem Pfad, der fremde Dateien annimmt und unter fremden
   Namen schreibt. Eine eigene Runde mit eigener Prüflage, und keine Beifracht —
   schon gar nicht in einer Runde, die an `auth.js` arbeitet.*

   **Die drei Punkte im Sammelblatt haben weiterhin keine Nummer**, weil keiner
   gebaut werden soll: „Entfällt am einzelnen Kriterium" und „Der QR-Encoder"
   sind `nicht empfohlen`, „Zwei Einträge zu einem machen" ist `später`. **Dazu
   die doppelt gebaute Tagwolke** aus 0.12.3 — sie steht in Teil II und bleibt
   dort.

---

7. DIE ZAHLEN AM ENDE.

   * **Beide Wege, gemessen und nicht behauptet:** eine Anmeldung über HTTPS
     **und** eine über `http://<server-ip>:3100`, jeweils bis zur stehenden
     Sitzung. *Ohne beide ist Punkt 2 nicht belegt.*
   * **Der Teilexport mit eingeschaltetem zweitem Faktor:** wie viele Teile,
     **eine** Eingabe, wie viele geladene Dateien — und **keine** Zeile
     `bestaetigung.fehl` im Protokoll danach. *Ohne diese Zahlen ist Punkt 1
     nicht belegt.*
   * **Die Nachlese zu 0.12.4** aus Abschnitt 0: Zahl der Teile, Dateigrößen
     gegen die Ansage, und ob ein Teil sich einspielen ließ.
   * **Die Filterleiste bei 1359 px Fenster, vorher und nachher.** Vorher:
     **229 px** in fünf Zeilen. *Erwartet werden rund 147 px in drei.*
   * **Prüfungszahlen vorher/nachher.** Vorher: **3992**.
   * **Gegenproben.** Vorher: **195 Rückbauten.** *Der volle Lauf steht seit
     fünf Runden aus; wenn er in dieser Runde läuft, schreib es auf.*

---

DIE NUMMER:

* **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.0 ist **MINOR**, und die
  Begründung ist dieselbe Frage wie immer: *kann die Anlage nach dieser Runde
  etwas, was sie vorher nicht konnte?* **Ja** — über zwei Netze zugleich
  erreichbar sein. Das ist keine Fehlerbereinigung, sondern eine Fähigkeit, die
  es vorher nicht gab.
  **Sieh trotzdem genau hin:** *wenn am Ende nur die Reparatur, der Satz im
  Löschdialog, der Filter an der Karte und die Filterleiste übrig sind, weil
  Punkt 2 zu groß wurde, dann heißt die Runde 0.12.5 und ist PATCH.* **Sag es
  mit Begründung.**
* **NICHTS WIRD UNTER EINER SCHON HERAUSGEGEBENEN NUMMER NACHGESCHOBEN.** Kommt
  nach 0.13.0 etwas nach, heißt es 0.13.1.
* **`CHANGELOG.md` bekommt den Eintrag `## [0.13.0] - <JJJJ-MM-TT>`**, Datum
  nach ISO 8601, neueste Version oben, darunter die zutreffenden von **`Added` ·
  `Changed` · `Deprecated` · `Removed` · `Fixed` · `Security`** — englisch, leere
  weggelassen. **Dahinter die beiden eigenen Abschnitte**: „Was du danach von
  Hand tun musst" und „Was gleich bleibt".
  **Zwei Sätze, die dort nicht fehlen dürfen:** dass das Umlegen alle einmalig
  abmeldet — oder eben nicht, und warum; und unter `Fixed` der Teilexport, **mit
  dem Hinweis, dass er mit eingeschaltetem zweitem Faktor seit 0.12.4 gar nicht
  ging.** *Wer 0.12.4 im Einsatz hat, muss das lesen können, ohne den Fehler
  selbst getroffen zu haben.*
* **DER ABSCHNITT `## [Unreleased]` WIRD MITGESCHRIEBEN, WÄHREND GEBAUT WIRD** —
  nicht am Schluss aus dem Gedächtnis gefüllt.
* **DIE VERSION BEKOMMT EINEN GIT-TAG**, `v0.13.0` auf den Commit, der
  herausgeht, und die Vergleichsverweise unten in `CHANGELOG.md`.

---

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** `Tag`, `Token`, `Index`,
  `String` und `Cookie` sind Fachbegriffe und bleiben. *Die sechs
  Abschnittsnamen im Changelog bleiben englisch.* **Am Bildschirm heißt es
  `Link` und nicht `Token`** — ein Wächter hält das fest.
* **„Desktop" und nicht „Schreibtisch".**
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.13.0` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`).
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
  *Express bringt `trust proxy` mit; das ist keine neue Abhängigkeit.*
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token, kein
  TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Eine Probe, die ihren Maßstab vom Prüfling bezieht, kann nicht scheitern**
  (Befund B aus 0.12.0).
* **Und eine Prüflage, die die Eigenschaft gar nicht tragen KANN, ebenso wenig**
  (Stolperstein 189, aus 0.12.4): dort fehlte nicht der Gegenstand, sondern
  seine Größe. **Hier heißt das: eine Lage, die nur einen Weg kennt, belegt
  nichts über zwei.**
* **Und eine Prüfgruppe, die einen Schalter nie einschaltet, belegt nichts über
  den Zustand mit Schalter** (Punkt 1 dieser Runde): 38 Prüfungen auf den
  Teilexport, alle ohne zweiten Faktor — **die Eigenschaft, an der er scheitert,
  gibt es nur mit ihm.** *Diese Frage gehört an jede neue Gruppe: welcher
  Schalter bleibt hier durchweg aus, und trägt er etwas zur Sache bei?*
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90), **und er
  liefert nicht selbst, was die Prüfung belegen soll** (Stolperstein 102).
* **Der Cookiename ist die Prüfung, nicht die Absicht.** Eine Zeile, die nur
  sagt, dass ein Cookie gesetzt wurde, bliebe grün, wenn beide Wege denselben
  Namen bekämen — und genau das wäre der Fehler aus (b).
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Der Schnitt liegt zwischen Punkt 3 und Punkt 2 — die
  Punkte 3 bis 5 sind die billigen, **Punkt 1 steht außerhalb**: er repariert
  Laufendes und wird nie geschnitten.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht
  die Antwort vorbehaltlich da: KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE
  FORMATNUMMER.** Punkt 1 fasst eine vorhandene Route und die Oberfläche an,
  Punkt 2 Cookies und Kopfzeilen, Punkt 3 die Karte und die Leseroute, Punkt 4
  einen Dialogtext und ein Fenster, Punkt 5 das Stilblatt und den Aufbau der
  Filterleiste. **Wenn das nach
  deiner Durchsicht nicht stimmt, ist das ein Grund anzuhalten und zu fragen.**
* Das Schema bleibt vollständige DDL in `db.js`.
* **`F_ROUTEN` bleibt bei 69**, solange keine schreibende Route dazukommt.
  *Prüf, ob das stimmt* — und wenn eine dazukommt, sag es mit Begründung.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.13.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt
  bei 191 fort** — 190 ist vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **3992**),
  Offengebliebenes. **Und die Messwerte aus Abschnitt 7.**
* Die Zeile „0.13.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. **Und `public/` gehört dazu**:
  er geht über ALLES darin und nicht über eine Liste erwarteter Namen; eine
  Datei zu viel bewegt ihn genauso wie eine geänderte (Stolperstein 158).
* **Diese Runde ist KEINE Datenbankstufe** — sag es ausdrücklich, statt es
  offenzulassen. **Ob es neue Zeilen in der `.env` gibt, hängt an deiner Antwort
  auf die vierte Frage in Punkt 2** — sag es so oder so.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die zwei, die diese Runde belegen:** sich
  über HTTPS anmelden und angemeldet bleiben; und **im selben Browser** über
  `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 3 — dort steht
  `HINTER_PROXY` mit seinen fünf Wirkungen und muss nachgezogen werden —,
  Abschnitt 4, Abschnitt 5, Stolpersteine, Prüfstand, Versionsgeschichte,
  **Abschnitt 10 und 10a**). Der Projektstand trägt die Version im Dateinamen
  und wird umbenannt (`git mv` auf `Projektstand_Kriterion_0_13_0.md`); alle
  Verweise sind nachzuziehen.
* **ABSCHNITT 10a WIRD GELEERT, SOWEIT ER DIESE RUNDE BETRIFFT.** Was gebaut
  ist, steht danach im Änderungsprotokoll und im Stand — **nicht mehr im
  Fahrplan.** *Ein Punkt wandert vom Sammelblatt in den Fahrplan und von dort in
  ein Änderungsprotokoll — nie zurück.* **Die drei übrigen Runden bleiben
  unangetastet.**
* **Das Sammelblatt wird angefasst, und zwar genau an einer Stelle:** die
  Wegweisertabelle am Anfang von Teil I bekommt den Vermerk, dass 0.13.0 gebaut
  ist. Sonst nichts — **es sei denn, beim Bauen fällt etwas an, das dort
  hingehört**; dann kommt es als Zeile in Teil II.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir beim Bauen etwas auf, das dort falsch wird, ist
  das ein Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.**
* **Die README bekommt den neuen Weg**: dass die Anlage über beide Netze
  erreichbar ist, was `HINTER_PROXY` danach noch bedeutet, und **was der
  Handgriff „Wenn der Proxy ausfällt" danach noch soll** — steht er weiterhin
  richtig da, oder ist er gegenstandslos geworden? *Ein Handgriff, den niemand
  mehr braucht, gehört entfernt und nicht stehengelassen.*
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.12.4.**
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
