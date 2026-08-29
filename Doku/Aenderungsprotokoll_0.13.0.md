# Änderungsprotokoll 0.13.0 — „Zwei Netze, ein Zugang"

**Version 0.13.0 · gebaut am 28. August 2026 · Fingerprint `c1d2320d` ·
MINOR · KEINE Datenbankstufe, kein Migrationsblock, keine neue Formatnummer,
keine neue Zeile in der `.env`, keine neue Abhängigkeit**

**Die Anlage ist über zwei Netze zugleich erreichbar** — über HTTPS hinter dem
Proxy **und** über `http://<server-ip>:3100` im Heimnetz, mit derselben
Einstellung und ohne Handgriff dazwischen. Das ist die Fähigkeit, die es vorher
nicht gab, und sie begründet die Nummer.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.0 ist **MINOR**, und die
Frage dahinter ist die übliche: *kann die Anlage nach dieser Runde etwas, was
sie vorher nicht konnte?* **Ja** — über zwei Netze zugleich erreichbar sein.
Das ist keine Fehlerbereinigung, sondern eine Fähigkeit. *Punkt 2 ist gebaut,
und zwar ganz; wäre er ausgefallen, hieße die Runde 0.12.5 und wäre PATCH.*

**SIEBEN PUNKTE STANDEN AUF DER LISTE, SIEBEN SIND GEBAUT.** Dazu vier Befunde,
die beim Bauen aufgefallen sind und mitgehen — drei davon aus 0.12.4, einer
älter. Sie stehen in Abschnitt 9.

---

## Inhalt

1. [Der Teilexport war mit zweitem Faktor unbenutzbar](#1-der-teilexport-war-mit-zweitem-faktor-unbenutzbar)
2. [Zwei Netze, ein Zugang](#2-zwei-netze-ein-zugang)
3. [Das Sicherheitsprotokoll wird durchsuchbar](#3-das-sicherheitsprotokoll-wird-durchsuchbar)
4. [Gelöschte Zugänge, und der Weg zurück](#4-gelöschte-zugänge-und-der-weg-zurück)
5. [Die Filterleiste: 229 px vorher, 154 px nachher](#5-die-filterleiste-229-px-vorher-154-px-nachher)
6. [Die Kategoriezeile lernt die Mehrzahl](#6-die-kategoriezeile-lernt-die-mehrzahl)
7. [Was gebaut wurde, je Datei](#7-was-gebaut-wurde-je-datei)
8. [Der Prüfstand](#8-der-prüfstand)
9. [Vier Befunde, die beim Bauen aufgefallen sind](#9-vier-befunde-die-beim-bauen-aufgefallen-sind)
10. [Gegenproben](#10-gegenproben)
11. [Entscheidungen und Abweichungen](#11-entscheidungen-und-abweichungen)
12. [Neue Stolpersteine](#12-neue-stolpersteine)
13. [Was ausdrücklich nicht passiert ist](#13-was-ausdrücklich-nicht-passiert-ist)
14. [Die Zahlen](#14-die-zahlen)
15. [Offen geblieben](#15-offen-geblieben)

---

## 1. Der Teilexport war mit zweitem Faktor unbenutzbar

**Das war mein Fehler aus 0.12.4, und er stand seit dem Einspielen auf der
laufenden Anlage.**

**WAS PASSIERTE.** Der Knopf „Alle n Teile freigeben" fragte einmal nach
Passwort und Code und schickte dann **denselben Code n-mal** an
`POST /api/bestaetigung`, einmal je Teil:

```
Teil 1: 200  Freigabe erteilt
Teil 2: 403  Der Code stimmt nicht.
Teil 3: 403  Der Code stimmt nicht.
```

**WARUM.** Ein Code des zweiten Faktors gilt **genau einmal** — das ist seine
ganze Zusage, und sie steht in der Bedingung des Schreibvorgangs (`auth.js`,
`verbraucheZaehler`). Der Kommentar an `zweiteBestaetigungMehrfach` sagte *„Der
Mensch tippt einmal, geprüft wird n-mal"* — **das stimmt fürs Passwort, das
gegen einen Hash läuft und sich beliebig oft vergleichen lässt, und für den
zweiten Faktor stimmt es nicht.**

**DIE MELDUNG WAR WAHR UND TROTZDEM IRREFÜHREND:** der Code war richtig, er war
verbraucht. Wer das liest, sucht den Fehler bei sich.

### Was gebaut ist

**(a) `POST /api/bestaetigung` kennt die Mehrzahl.** Eine Anfrage trägt alle
Teilnummern im Feld `ziele`, das Passwort wird einmal geprüft, **der Code
einmal verbraucht**, und alle Freigaben kommen in einer Antwort zurück. Die
Oberfläche schickt eine Anfrage statt n.

**Was dabei geblieben ist: das Laden eines Teils verbraucht genau eine
Freigabe.** Eine Freigabe für Teil 1 lässt Teil 2 nicht durch — der Schlüssel
ist weiterhin Sitzung, Zweck und Ziel. *Zusammengefasst ist die Abfrage und
nicht die Schranke.* **Keine neue Route** (`F_ROUTEN` bleibt bei **69**),
**kein neuer Zweck** (`BESTAETIGUNG_ZWECKE` bleibt bei **sieben**).

**Die Grenzen der Mehrzahl, alle vier geprüft:**

| Lage | Antwort |
|---|---|
| mehr als `AUSTAUSCH_TEIL_MAX` (999) Ziele | **400** |
| eine Nummer steht doppelt | **400** |
| leere Liste, oder gar keine Liste | **400** |
| `ziel` **und** `ziele` zugleich | **400** |

**Alle vier fallen VOR der Passwortprüfung** — eine unbrauchbare Bestellung
soll niemandem seinen Code kosten und keine Zeile in der Anmeldebremse. *Eine
Prüfung fährt genau das nach: erst eine abgewiesene Bestellung, dann dieselbe
Eingabe noch einmal, und die zweite muss durchgehen.*

**Was nebenher weggefallen ist — alles nachgemessen:**

* **Die Fehlalarme im eigenen Sicherheitsprotokoll.** Drei Teile hinterließen
  drei Zeilen `bestaetigung.fehl` über den Eigentümer selbst.
* **Die Treffer in der Anmeldebremse.** Der erste Aufruf gelang und setzte die
  Zähler zurück, danach scheiterten n−1 — **bei elf Teilen griff die harte
  Sperre**, fünf Minuten je Adresse.
* **Der verbrannte Wiederherstellungscode.** Wer statt des Codes einen
  Zettelcode eintrug, verlor ihn beim ersten Aufruf endgültig, und die übrigen
  scheiterten trotzdem.

**(b) Der Knopf sagt, was er tut.** „Alle 3 Teile freigeben" war das Wort aus
dem Maschinenraum; aus dem Betrieb kam die Frage *„was ist mit freigeben
gemeint?"* zurück — derselbe Fehler wie „Code aus deiner App" in 0.12.3: die
Mechanik benannt statt der Handlung.

**Der Wortlaut, und er ist formuliert und nicht abgeschrieben:**

> **Ein Export nimmt den Bestand mit aus dem Haus. Deshalb fragt die Anlage
> einmal nach deinem Passwort und dem Code deines zweiten Faktors — danach
> lädst du jeden Teil selbst.**
>
> [ **Einmal bestätigen, dann alle 3 Teile laden** ]

Nach dem Bestätigen heißt der Knopf **„Bestätigt — jetzt jeden Teil laden"**.
*Der Zusatz zum zweiten Faktor steht nur da, wenn der Zugang einen trägt: ein
Grund für eine Frage, die gar nicht gestellt wird, wäre Verwirrung ohne
Gegenwert.* **Zwei Dinge muss ein Mensch wissen, und beide stehen am Knopf:**
dass **einmal** gefragt wird, und dass er danach **jeden Teil selbst** lädt.

---

## 2. Zwei Netze, ein Zugang

**Das einzige Betriebsrisiko der Liste, und der Punkt, der die Nummer
begründet.**

**WAS WAR.** `HINTER_PROXY` bündelte **fünf** Wirkungen: `X-Forwarded-For`
glauben, `Secure` am Cookie, das Präfix `__Host-`, HSTS und die Startwarnung
bei `http://` in `OEFFENTLICHE_ADRESSE`. Die Einstellung steht seit 0.10.0 auf
`1`, und die Anlage ist inzwischen **aus zwei Netzen zugleich erreichbar**.
Über `http://<server-ip>:3100` kam damit niemand mehr herein: der Server
antwortete mit **200** und setzte den Cookie, **der Browser verwarf ihn
stillschweigend**, und im Serverprotokoll stand davon nichts.

**Was es kostete:** fiel der Proxy aus oder lief ein Zertifikat ab, gab es
**gar keinen Weg mehr in die Oberfläche**. Der Handgriff dagegen stand in der
README — Einstellung abschalten, neu starten — und brauchte **einen Menschen am
Wirt, genau dann, wenn nichts mehr geht.**

### Was gebaut ist

**`X-Forwarded-Proto` wird je Anfrage gelesen, mit ZWEI Cookienamen.**

| | über den Proxy (`X-Forwarded-Proto: https`) | direkt, Port 3100 |
|---|---|---|
| Cookiename | `__Host-kriterion_session` | `kriterion_session` |
| `Secure` | **ja** | **nein** |
| `Strict-Transport-Security` | **ja** | **nein** |
| gelesen wird | **nur** `__Host-…` | **nur** `kriterion_session` |

**GELESEN WIRD JE ANFRAGE GENAU EIN NAME, und das ist die halbe Sache.** Ein
Klartextcookie geht auch an die HTTPS-Seite — er trägt kein `Secure`. Wer ihn
dort gelten ließe, hätte `__Host-` für nichts: wer im eigenen Netz eine
Klartextverbindung verbiegen kann, setzte damit einen Cookie, den die
HTTPS-Seite anschließend **auch annähme**. Genau dagegen gibt es das Präfix.

**Die Frage steht an genau einer Stelle** — `auth.js`, `ueberProxy(req)` —, und
alle drei Wirkungen hängen daran. Sie sieht **ausschließlich in die
Kopfzeilen**, nicht auf `req.socket` und nicht auf `req.protocol`: sie wird
auch aus `requireAuth` heraus gestellt, und dort reicht der Prüfstand ein `req`
herein, das nur `headers` trägt.

**DER LETZTE EINTRAG DER KETTE ZÄHLT**, nicht der erste — dieselbe Überlegung
wie bei der Adresse: was davor steht, kann der Aufrufer selbst hineingeschrieben
haben.

### Die vier Fragen, die vor dem Bau standen — beantwortet

**1. Meldet das Umlegen alle einmalig ab?** **Ja, weiterhin — und das ist ein
Gewinn.** Wer über HTTPS kommt, trägt `__Host-kriterion_session`; steht
`HINTER_PROXY` auf `0`, gilt jede Anfrage als Klartext und dieser Name wird
nicht mehr gelesen. Der ehrliche Schnitt bleibt also genau dort, wo er war.
**Für den Heimnetzweg verschwindet er** — dessen Name ändert sich beim Umlegen
nicht —, und auch das ist richtig: dieser Weg war vorher gar nicht erreichbar.
*Eine Prüfung hält beides fest, in beide Richtungen.*

**2. Gilt HSTS nur auf dem HTTPS-Weg?** **Ja, und die Stelle ist genannt:**
`server.js`, die globale Kopfzeilen-Middleware unmittelbar vor
`express.static`. Die Bedingung heißt jetzt `auth.ueberProxy(req)` statt
`auth.HINTER_PROXY`. **Ginge der Kopf auf dem Heimnetzweg mit, sperrte er genau
den Weg aus, den diese Runde offenhält:** der Browser bestünde danach auf HTTPS
und fände an Port 3100 keines.

**3. Was macht `X-Forwarded-For`, wenn die Anfrage nicht über den Proxy kam?**
**Unverändert das, was es vorher tat** — mit `HINTER_PROXY=1` wird der Kopf
geglaubt, gleich woher die Anfrage kommt. **Das ist bewusst so geblieben, und
es ist die offene Hälfte des Problems:** solange Port 3100 im eigenen Netz
erreichbar ist, kann dort jemand den Kopf selbst setzen und die Anmeldebremse
umgehen. Ein gewöhnlicher Browser tut das nicht, ein absichtlicher Aufruf
schon. **Die Antwort darauf ist die Adressliste, und sie ist nicht gebaut** —
Begründung in Abschnitt 11, Entscheidung 2.

*Der Kopf an die Proto-Entscheidung zu binden hilft nicht: wer den einen
fälschen kann, fälscht auch den anderen. Und es brächte eine echte Gefahr —
ein Proxy, der `X-Forwarded-Proto` nicht setzt (es gibt sie), fiele damit auf
seine eigene Adresse als Bremsenschlüssel zurück, und ein einziger Angreifer
sperrte alle aus.*

**4. Bleibt `HINTER_PROXY` bestehen?** **Ja, mit geschrumpfter Bedeutung — von
fünf Wirkungen auf zwei:**

* ob `X-Forwarded-For` und `X-Forwarded-Proto` **überhaupt angesehen** werden,
* die **Startwarnung** bei `http://` in `OEFFENTLICHE_ADRESSE`.

**Cookiename, `Secure` und HSTS hängen nicht mehr an ihr.** *Die Einstellung
bleibt, weil ihre erste Wirkung nicht wegfallen kann: ein Kopf vom Aufrufer ist
nie eine Feststellung, sondern eine Behauptung, und es braucht eine Stelle, an
der ein Mensch sagt, dass ein Proxy davorsteht.* **Das steht so in der README.**

### Was NICHT gebaut ist

**Ein Name mit bedingtem `Secure`.** Er gäbe Sicherheit auf, statt
Bequemlichkeit zu gewinnen — siehe oben. *Ein Weg, der mit einem Namen
auskommt, ist mir beim Bauen nicht eingefallen, und der Grund ist strukturell:
das Präfix `__Host-` IST der Name, es lässt sich nicht bedingt anhängen, ohne
dass beide Seiten denselben Namen lesen müssten — und genau das ist die Lücke.*

### Was der Betrieb davon merkt

**Der Handgriff „Wenn der Proxy ausfällt" ist gegenstandslos geworden und aus
der README entfernt.** Fällt der Proxy aus, geht `http://<server-ip>:3100` von
selbst — ohne `.env`, ohne Neustart, ohne Mensch am Wirt. *Ein Handgriff, den
niemand mehr braucht, gehört entfernt und nicht stehengelassen.*

**Abmelden räumt beide Namen weg** und beendet beide Sitzungen dieses Browsers.
Seit dieser Runde können zwei Sitzungen desselben Menschen im selben Browser
nebeneinander stehen — eine über HTTPS, eine über das Heimnetz. *Wer sich
abmeldet, meint den Browser und nicht die Verbindungsart.*

---

## 3. Das Sicherheitsprotokoll wird durchsuchbar

**Die Karte holte die hundert jüngsten Zeilen, alle Vorgangsarten gemischt.**
Wer nach gescheiterten Anmeldungen suchte, fand sie darin nicht — sie standen
nur dazwischen.

**Sechs Ansichten, jede mit ihrer Zahl:** Alle · **Gescheitert** ·
Anmeldungen · Zugänge · Zweiter Faktor · Bestand.

**„Gescheitert" heißt nicht „gescheiterte Anmeldungen":** die Ansicht trägt
auch die gescheiterte zweite Bestätigung, und beide sagen dasselbe — jemand
konnte an der Tür nicht belegen, wer er ist. *Ein Name, der nur die Hälfte
nennt, wäre falsch; der Hinweis am Knopf nennt beide.*

**DIE AUSWAHL GEHT AN DEN SERVER und nicht an den Browser.** Das ist der Kern:
mit ihr sind es die hundert jüngsten **dieser Art**. Ein örtlicher Filter
durchsuchte genau die hundert, um die es geht. **Ein unbekannter Schlüssel ist
ein 400** und nicht stillschweigend „alles" — ein Tippfehler sähe sonst aus wie
ein Erfolg.

**Die Zuordnung Vorgang → Gruppe steht in `auth.js` (`PROTOKOLL_GRUPPEN`)**,
neben der geschlossenen Liste der Vorgänge; die deutschen Wörter stehen in der
Oberfläche, wie bei den Vorgängen selbst. **Eine Prüfung rechnet nach, dass
jeder der zwanzig Vorgänge in genau einer Gruppe steht** — ein neuer, der in
keiner stünde, wäre unter keiner Ansicht zu finden.

**Die Zahlen an den Pillen zählen über die ganze Tabelle**, nicht über die
geholten hundert. *Eine Zahl, die nur ihren eigenen Ausschnitt zählt, sagt
genau das nicht, was man von ihr wissen will.* Eine Ansicht ohne Zeilen wird
gedämpft — wie jede Pille in dieser Lage.

**Die Namen sind anklickbar** und springen zur Zeile in der Karte „Zugänge",
die dort kurz aufblinkt. **„unbekannter Name" wird nie ein Knopf** — er ist der
getippte Name eines Versuchs, der an keinen Zugang traf, und es gäbe nichts,
wohin er springen könnte. *Ein Knopf ins Leere ist schlimmer als Text.* „über
zugang.js auf dem Wirt" ebenso wenig.

### (b) und (c): was nicht gebaut ist

**(b) Der getippte Name oder die Adresse in der Protokolltabelle: nicht
gebaut**, wie im Auftrag festgeschrieben. Die Zusage im Kartentext steht
unverändert da: *„Ebenso wenig Adresse oder Browserkennung: die Anlage
speichert beides nicht."*

**(c) Die maschinenlesbare Zeile nach stdout: nicht gebaut — und der Grund ist
mehr als „(d) reicht".**

Der Weg über das Zugriffsprotokoll des Proxys steht seit 0.12.3 in der README
und trägt: `POST /api/login` antwortet unterscheidbar mit 401, 429 und 403.
**Dazu kommt ein Grund, der erst mit Punkt 2 sichtbar wird:** eine Zeile, die
Kriterion selbst schriebe, trüge die Adresse aus `X-Forwarded-For` — und die
ist, solange Port 3100 offen steht und die Adressliste nicht gebaut ist, **eine
Behauptung des Aufrufers**. Das Protokoll des Proxys trägt dagegen die Adresse,
die der Proxy wirklich gesehen hat. **Wir würden eine Zusage über ein
Logformat geben und darin Daten führen, für die wir schlechter einstehen können
als die Stelle, die es schon tut.** *Wenn die Adressliste gebaut ist, ist (c)
neu zu fragen — vorher nicht.*

---

## 4. Gelöschte Zugänge, und der Weg zurück

**(b) DER LÖSCHDIALOG NENNT DEN UMKEHRBAREN WEG.** Der billigste Punkt dieser
Runde mit dem größten Schaden dahinter.

Er sagte *„Das lässt sich nicht rückgängig machen"* und *„der Name wird frei"*
— er sagte **nicht**, dass es daneben einen Weg gibt, der beides nicht tut.
**Die Rückholfrist ist zur Hälfte längst gebaut, sie heißt nur anders:**
sperren weist die Anmeldung ab, die laufende Sitzung fällt, **der Name bleibt,
der Bestand bleibt**, und der Admin kann es jederzeit zurücknehmen.

Ein Satz, und er steht an **beiden** Stellen — in der letzten Rückfrage und im
Passwortfenster dahinter:

> *„Nur vorübergehend aussperren? Dann **sperren** statt entfernen — das ist
> umkehrbar, und der Name bleibt."*

*Zwei aufeinanderfolgende Fenster, die Verschiedenes sagen, sind schlimmer als
eines.* **Dazu der Kartentext**, der jetzt ebenfalls sagt, dass der Name beim
Sperren vergeben bleibt.

**(a) GELÖSCHTE ZUGÄNGE STEHEN IN EINEM EIGENEN FENSTER.** Das Vorbild stand im
Projekt: der Dialog „Wer hat bewertet" — Hintergrund, Fenster, ein erklärender
Satz, eine Liste, ein Knopf zum Schließen, Escape schließt nur den obersten.
**Der Knopf steht nur da, wenn es Grabsteine gibt, und nennt ihre Zahl** — ein
Knopf, der ein leeres Fenster öffnet, ist einer zu viel.

**Reine Oberfläche.** Der Server gibt die Grabsteine weiterhin mit; getrennt
wird beim Zeichnen, an der einen Erkennungsregel `status === 'geloescht'`.

**(c) Der Ursprungsname am Grabstein: nicht gebaut**, wie festgeschrieben. Das
Fenster sagt es ausdrücklich: *„Der ursprüngliche Name steht hier nicht — die
Anlage bewahrt ihn nirgends auf, denn der Grabstein IST das Löschen."*

**(d) Die Rückholfrist von dreißig Tagen: nicht gebaut.** *Mit (b) ist die
Frage beantwortet, die alles davor entscheidet — was genau soll die Frist, was
„sperren" nicht schon kann? Nichts, das den zweiten Zustand rechtfertigte.*

---

## 5. Die Filterleiste: 229 px vorher, 154 px nachher

**GEMESSEN, NICHT GESCHÄTZT — im Browser, bei 1359 px Fensterbreite,
denselben Bestand vorher und nachher.**

| | vorher | nachher |
|---|---|---|
| Höhe der Leiste | **229 px** | **154 px** |
| bis zum ersten Eintrag | **253 px** | **178 px** |
| Zeilen | 5 | 4 |

| Zeile | vorher | frei rechts | nachher | frei rechts |
|---|---|---|---|---|
| Status | 31 px | 733 px | 31 px | 733 px |
| Kategorie | 31 px | 904 px | 31 px | 808 px |
| Tags | **64 px** | 0 px | **30 px** | 0 px |
| Sortieren | 31 px | 930 px | — | — |
| Ansichten | 31 px | 1015 px | — | — |
| Sortieren + Ansichten | — | — | 31 px | 667 px |

**DIE ZAHL IST 154 UND NICHT 147, und die Differenz ist erklärbar.** Der
Auftrag rechnete mit *„jede Zeile kostet 41 px"* zweimal, also 82 px. Gespart
sind **75 px**: das Zusammenlegen von Sortieren und Ansichten kostet wirklich
eine ganze Zeile samt Abstand (41 px), **die zweite Tagzeile aber nur 33 px** —
zwei Zeilen innerhalb *einer* `.frow` trennt der Abstand der Pillen (6 px) und
nicht der Abstand der Filterzeilen (10 px). *Der Rechenweg des Auftrags war um
eine Lücke zu großzügig; die Richtung stimmt.*

**Drei Zeilen wären nur über die Beschriftungsspalte zu haben, und die bleibt**
— so entschieden, siehe Abschnitt 11.

### (a) Die Tagzeile wird eine Zeile

**Der Kern:** `.frow-rechts` trug `margin-left: auto`. **Eine selbsttätige
Außenkante frisst den gesamten freien Platz der Zeile** — die Wolke *kann* dort
nicht danebenstehen, sie rutscht immer darunter.

**Der Weg:** die Wolke wird ein Flex-Element (`flex: 1 1 0`, `min-width: 0`),
die Verweise stehen als gewöhnliche Geschwister **dahinter**, die selbsttätige
Kante entfällt. **Damit ist die Reihenfolge im Aufbau wieder die natürliche**
— „mehr" gehört hinter das, was es aufklappt —, und der lange Kommentar
darüber, warum sie es nicht ist, fällt mit weg. **Auch `.frow-rechts { order: 2 }`
im Tablettteil ist damit gegenstandslos und entfernt.**

**KEINE AUSGERECHNETE BREITE, an keiner Stelle** — Befund A aus 0.12.1
(`right: 92px`), und die Anlage stellt die Schrift von 80 bis 120 Prozent.
*Eine Prüfung sieht die drei angefassten Regeln daraufhin durch.*

**`begrenzeWolke()` ist unangetastet geblieben und nachgeprüft:** es misst die
Höhe **einer** Zeile und fragt `scrollHeight > clientHeight`; beides gilt auch
für eine schmalere Wolke. **Am Browser nachgemessen:** die Wolke verliert
229 px Breite (1252 → 1023 px), von 22 Tags sind statt 17 noch **14** sichtbar,
und **„mehr" steht vorher wie nachher da**. *Der Preis sind drei Tags, der
Gewinn 75 px Höhe.*

### (b) Sortieren und Ansichten teilen sich eine Zeile

Gemessen brauchen sie **322** und **237** px von 1232 — sie passen mit Abstand,
und nachher bleiben 667 px frei. **Der schlimmste Fall ist harmlos:** stehen
einmal acht gespeicherte Ansichten da (`ANSICHTEN_DECKEL`), bricht die Zeile um
und sieht aus wie vorher.

**Die zweite Beschriftung ist das Gegenstück zur ersten und keine
Überschrift:** eigene Klasse `.eyebrow-mit`, **ohne** die Beschriftungsspalte
(`min-width: 0`) und mit einem Abstand davor, der sie vom Auswahlfeld löst. *Im
Tablettteil, wo die Zeile zur Spalte wird, fällt der Abstand weg und ein
kleiner nach oben tritt an seine Stelle.*

### (c) „Neu seit …" mit null Treffern wird gedämpft

Die Pille stand in voller Helligkeit da und führte garantiert auf eine leere
Liste. **Tags in genau derselben Lage wurden gedämpft** — dieselbe Sache mit
zwei Verhalten (Stolperstein 47, im Kleinen).

**Die Regel gilt jetzt für jede Pille:** aus `.pill-tag.leer` wird
`.pill.leer`. Dazu derselbe Hinweis wie am Tag: *„Zusammen mit der aktuellen
Auswahl kein Treffer."* **Nur solange der Filter nicht gesetzt ist** — ist er
an, sagt die Null nicht „hier gibt es nichts zu holen", sondern „genau das
siehst du gerade". **Anklickbar bleibt sie**, wie die Tags.

### (f) Die alte Doppelung — entschieden

Teil II des Sammelblatts trägt seit 0.12.3: *„Dieselbe Tagwolke ist an zwei
Stellen verschieden gebaut."* **(a) ändert genau eine von beiden.**

**Die Eintragsseite zieht NICHT mit, und der Grund ist nachgesehen:** die
beiden Wolken stehen in verschiedenen Lagen.

| | Übersicht | Eintragsseite |
|---|---|---|
| Zeilen der Wolke | **1** | **3** |
| Nachbar in der Zeile | eine kurze Beschriftung („Tags") und Und/Oder | ein ganzer Satz („Vorhandene Tags — Klick vergibt, erneuter Klick nimmt zurück") |
| knapp ist | die **Höhe** | nichts |

**Die Übersicht spart eine Zeile, weil rechts 900 px leer standen. Auf der
Eintragsseite steht dort ein Satz** — die Wolke bekäme neben ihm eine schmale
Spalte und bräche über mehr Zeilen um, nicht über weniger. **Mitziehen machte
sie schlechter.**

**Die gemeinsame Mechanik ist ohnehin geteilt:** `sortiereWolke()` und
`begrenzeWolke()` sind eine Stelle mit zwei Rufern. **Verschieden ist nur die
Anordnung, und sie ist es aus einem genannten Grund.** *Die Zeile im
Sammelblatt ist entsprechend nachgezogen: aus einer Doppelung ohne Grund wird
ein Unterschied mit Grund.*

---

## 6. Die Kategoriezeile lernt die Mehrzahl

**Zwei Wünsche, eine Änderung.** Der Filter trug genau eine Kategorie
(`categoryId` — eine Zahl oder `null`). Künftig trägt er eine **Liste**
(`categoryIds`), und „ohne Kategorie" ist ein Eintrag dieser Liste wie jeder
andere. *Damit sind beide Wünsche dieselbe Änderung und nicht zwei.*

**(a) MEHRERE KATEGORIEN ZUGLEICH — UND ES IST EIN ODER, NIEMALS EIN UND.**
`product_category_id` ist eine einzelne Spalte; ein Eintrag trägt genau eine
Kategorie. „Datenträger UND Produkt" wäre garantiert leer. **Gebaut ist die
Vereinigung. Die Zeile bekommt deshalb ausdrücklich kein Und/Oder** — ein
Umschalter, dessen eine Hälfte garantiert null Treffer liefert, ist schlimmer
als keiner, und er ist auch nicht dadurch zu retten, dass man ihn dämpft.

**(b) „OHNE" ALS PILLE MIT EIGENER ZAHL,** am Ende der Zeile. Der Anlass: der
Kopf sagte 12 Einträge, die Kategorien 1 + 9 = 10 — **zwei Einträge waren über
keine einzelne Kategorie erreichbar.** Die Zahlen verrieten die Lücke, zu sehen
bekam man sie trotzdem nicht.

**Die Zahl rechnet der Browser** aus `state.alle`, wie die an „Neu seit …" —
der Server wird dafür nicht gefragt. Sie zählt über den **ganzen Bestand**, wie
die `usage_count` der Kategorien daneben: *zwei Zahlen in einer Zeile müssen
dasselbe meinen.* **Die Pille steht nur da, wenn es Einträge ohne Kategorie
gibt** — oder wenn sie gewählt ist: sonst verschwände der eigene Filter unter
der Hand.

### Der Haken: die gespeicherten Ansichten

**In ihnen steht ein einzelner Kategoriewert.** Sie liegen als JSON beim
Server, der sie unbesehen durchreicht — keine Schlüsselliste, dort war nichts
nachzuziehen. **Übersetzt wird beim Einlesen, an genau einer Stelle:**
`filterNormal`. *Ein zweiter Weg daneben liefe auseinander.*

**Der gespeicherte Wert wird nicht zurückgeschrieben** — gelesen wird er
übersetzt, in der Ablage bleibt er, wie er ist. Dieselbe Linie wie bei den
Nummern, die es nicht mehr gibt. **Und `categoryId` fällt aus der
zurechtgerückten Stellung heraus:** sie wird Zeichen für Zeichen mit der
aktuellen verglichen (welche Ansicht gerade gilt), und ein mitgeschlepptes Feld
ließe jede alte Ansicht als „nicht aktiv" erscheinen.

**„Ohne" muss die Klemme überleben:** es ist kein Kategoriewert und trotzdem
gültig. Der Wert im JSON ist das Wort `"ohne"` und keine erfundene Nummer —
*eine erfundene (0 oder −1) wäre irgendwann eine echte.*

### Die drei Entscheidungen

* **Drei gewählte Kategorien zählen als EIN Filter**, nicht als drei. Anders
  als bei den Tags, und der Unterschied ist die Verknüpfung: **jeder Tag
  verkleinert die Menge (UND), jede Kategorie vergrößert sie (ODER).** Die
  Filterzahl beantwortet die eine Frage *„warum sehe ich nicht alles?"*; eine
  Drei für etwas, das die Liste gerade weiter macht, gäbe darauf die falsche
  Antwort. *Es bleibt damit auch bei dem, was vorher galt.*
* **„Alle" bleibt eine Pille.** Die Kategorien sind eine kurze, geschlossene,
  immer sichtbare Liste, in der „alles" ein nennbarer Zustand ist und seinen
  festen Platz behält. Die Tagwolke ist offen und lang; ein dauernd
  hervorgehobenes „Alle" an ihrem Anfang läse sich als Tag. **Und
  „zurücksetzen" käme und ginge, während „Alle" immer an derselben Stelle
  steht.** *Die beiden Zeilen verhalten sich jetzt gleich — ein Klick nimmt
  einen Wert dazu oder heraus — und der Unterschied im Zurücksetzen ist
  benannt statt stillschweigend.*
* **Eine Ansicht mit gelöschter Kategorie fällt auf den REST zurück**, nicht
  mehr ganz auf „Alle". *Von drei gewählten Kategorien soll eine gelöschte
  nicht die beiden anderen mitnehmen.* Stand nur die gelöschte darin, ist der
  Rest leer und die Ansicht zeigt alles — wie vorher.

---

## 7. Was gebaut wurde, je Datei

### `auth.js`

* **`ueberProxy(req)`** — die eine Frage, an der Cookiename, `Secure` und HSTS
  hängen. Liest nur Kopfzeilen, nimmt den letzten Eintrag der Kette, gilt nur
  mit `HINTER_PROXY`.
* **`COOKIE_NAME` / `COOKIE_SICHER` / `cookieName(req)`** — zwei Namen, einer
  je Anfrage. Der Klarname entsteht genau einmal als Literal, der sichere wird
  daraus gebaut.
* **`sitzungsToken(req)`** — der eine Leseweg für den Sitzungstoken; ersetzt
  acht Stellen `parseCookies(req)[COOKIE_NAME]` in `server.js`.
* **`sessionCookie(req, t)`** trägt `Secure` am Namen und nicht mehr an der
  Einstellung; **`clearCookie()`** liefert beide Löschzeilen.
* **`MERKMALE`** um `'teil'` ergänzt — **dreizehn → vierzehn**.
* **`PROTOKOLL_GRUPPEN`**, **`protokollZahlen()`** und
  **`leseProtokoll(grenze, gruppe)`**: je Gruppe eine vorbereitete Abfrage,
  beim Laden aus der geschlossenen Liste gebaut; die Werte werden gebunden.
* Der Kopfkommentar „EINE EINSTELLUNG, FÜNF WIRKUNGEN" ist neu geschrieben —
  es sind zwei.

### `server.js`

* **`POST /api/bestaetigung`** kennt `ziele`; vier Absagen vor der
  Passwortprüfung; alle Freigaben in einer Antwort.
* **HSTS** hängt an `auth.ueberProxy(req)` statt an `auth.HINTER_PROXY`.
* **`POST /api/logout`** beendet beide Sitzungen des Browsers und löscht beide
  Namen.
* **`GET /api/sicherheitsprotokoll`** nimmt `?gruppe=` entgegen, prüft gegen
  `PROTOKOLL_GRUPPEN`, 400 bei Unbekanntem. **Lesend — `F_ROUTEN` bleibt 69.**
* **Der Teilexport schreibt `merkmal: 'teil'`** statt `teil n/m`.
* Startmeldung und Startwarnung neu formuliert.

### `public/app.js`

* **`zweiteBestaetigungMehrfach`** schickt eine Anfrage statt n.
* **Knopftext und Satz darüber** an der Exportkarte.
* **`FILTER_VORGABE.categoryIds`**, `KATEGORIE_OHNE`, `filterNormal`
  (Übersetzung + Klemme), `visibleItems`, `filterZahl`, die Kategoriezeile in
  `drawFilters`.
* **Die Tagzeile:** Verweise hinter der Wolke, `insertBefore` → `appendChild`.
* **`zweiteBeschriftung()`** und `r5 = r4` — Sortieren und Ansichten in einer
  Zeile.
* **`.leer` an „Neu seit …"** samt Hinweis.
* **Die Protokollkarte:** Filterleiste, `PROTOKOLL_ANSICHT`,
  `zeichneProtokollFilter`, `protokollNeu`, `springeZuZugang`,
  `protNamensFeld`; `VORGANGSWORT` um fünf Einträge, `MERKMALSWORT` um zwei
  ergänzt und einer richtiggestellt.
* **Die Zugangskarte:** Grabsteine aus der Liste, `zeigeGrabsteine()`,
  `zeichneGrabsteinKnopf()`, der Satz im Löschdialog an beiden Stellen.

### `public/style.css`

* `.frow-rechts` ohne `margin-left: auto`, mit `flex-shrink: 0`.
* `.frow > .pills.cloud { flex: 1 1 0; min-width: 0 }` — und im Tablettteil
  zurück auf `flex: 0 1 auto`, weil dort die Hauptachse die Höhe ist.
* `.frow > .eyebrow-mit` — die zweite Beschriftung.
* `.pill-tag.leer` → `.pill.leer`.
* `.prot-sprung` und `.mrow.mrow-blitz`.
* `.frow-rechts { order: 2 }` entfernt.

### `gegenprobe.js`

* **21 neue Rückbauten** (192–212 sowie 191 neu geschrieben), **drei alte
  nachgezogen** (77, 78, 173).
* **`module.exports = { RUECKBAUTEN }`** und `if (require.main !== module) return;`
  — die Liste ist lesbar, ohne dass ein Server startet.

### `pruefung.js`

Siehe Abschnitt 8.

---

## 8. Der Prüfstand

**Prüfungen vorher: 3992. Nachher: 4115.** Hundertdreiundzwanzig sind
dazugekommen, verteilt auf fünf neue Gruppen und zwei nachgezogene.

| neue Gruppe | Prüfungen |
|---|---|
| Der Teilexport mit zweitem Faktor | 26 |
| Zwei Netze, ein Zugang — 0.13.0 | 9 |
| Die Gegenproben greifen | 6 |
| Die Filterleiste wird kürzer — 0.13.0 | 14 |
| Die Kategoriezeile lernt die Mehrzahl — 0.13.0 | 30 |

### Fünf neue Gruppen

**„Der Teilexport mit zweitem Faktor"** — die Gruppe, die es 0.12.4 nicht gab.
Sie fährt gegen einen Server **mit** eingeschaltetem Faktor und holt **mehr als
eine** Freigabe; eine Lage mit einem einzigen Teil bliebe grün und belegte
nichts. Sie führt den Fehler ausdrücklich vor — derselbe Code ein zweites Mal
trägt nicht — und sieht danach nach, dass **keine** Zeile `bestaetigung.fehl`
dazugekommen ist. *Der Bezugspunkt dafür ist die Zeile, die der vorgeführte
Fehler selbst geschrieben hat.*

> **Die Frage, die an jede neue Gruppe gehört — welcher Schalter bleibt hier
> durchweg aus, und trägt er etwas zur Sache bei?** Für diese Gruppe: der
> Faktor war es, und er trägt alles. **Die 38 Prüfungen auf den Teilexport
> fuhren alle ohne ihn.**

**„Zwei Netze, ein Zugang"** — beide Wege gegen **denselben** Server mit
`HINTER_PROXY=1`, einmal mit `X-Forwarded-Proto: https`, einmal ohne. **Geprüft
wird der NAME und nicht die Absicht:** eine Zeile, die nur sagt, dass ein
Cookie gesetzt wurde, bliebe grün, wenn beide Wege denselben Namen bekämen.
Dazu die Gegenprobe in der Gruppe darüber: **ohne die Einstellung bewirkt der
Kopf gar nichts.**

**„Die Gegenproben greifen"** — liest `RUECKBAUTEN` aus `gegenprobe.js` und
sieht nach, ob jeder Suchtext in seiner Datei **genau einmal** vorkommt, ob
keine Nummer doppelt steht, ob kein Ersatz mit seinem Suchtext wortgleich ist
und ob jeder Eintrag Name und erwartete Gruppe trägt. **Sie ersetzt den vollen
Lauf nicht** — sie sagt nichts darüber, ob ein Rückbau eine Prüfung *rot*
macht. Sie sagt nur, dass er überhaupt noch etwas anfasst, und das kostet
Millisekunden statt Stunden.

**„Die Filterleiste wird kürzer"** und **„Die Kategoriezeile lernt die
Mehrzahl"** — geprüft wird der **Aufbau**, denn jsdom rechnet kein Layout: wie
viele Zeilen es gibt, dass Wolke und Verweise Geschwister *einer* `.frow` sind,
dass im Stilblatt keine ausgerechnete Breite steht, dass die Pille mit null
Treffern ihre Klasse und ihren Hinweis bekommt. **Behauptet wird nichts, was
dieser Lauf nicht messen kann.** Dazu die Lage, die sonst fehlen würde: **eine
gespeicherte Ansicht in der ALTEN Form muss nach dem Einlesen dieselbe Liste
zeigen wie vorher.**

### Berichtigt

**Zwei Zeilen der Gruppe „Ohne Proxy ist der Kopf nur eine Behauptung" konnten
nicht scheitern.** Sie standen **hinter** den zwölf absichtlichen
Fehlversuchen, die die Adresse hart sperren — die Anmeldung danach liefert 429
und gar keinen Cookie —, und trugen ein `gCookieKopf === '' ||` als
Auffangnetz. **Damit waren sie in jedem Lauf wahr, ohne etwas zu belegen.**
Jetzt steht der Gegenstand ausdrücklich davor („Ohne Proxy kommt überhaupt ein
Cookie zurück"), und die Sperre wird erst danach ausgelöst.

### Der Mock zieht mit

`GET /api/sicherheitsprotokoll` **filtert im Mock wirklich** und liefert
`gruppe` und die Zahl dieser Ansicht zurück; **die Gruppenliste liest er aus
`auth.js`** statt sie abzuschreiben. *Ein Mock, der stur dieselbe Liste gäbe,
machte jede Prüfung auf den Filter grün, ohne etwas zu belegen (Stolpersteine
90 und 102).*

### Zahlen im Prüfstand nachgezogen

| | vorher | nachher |
|---|---|---|
| `MERKMALE` | 13 | **14** |
| Portbasen | 55 | **56** |
| Rückbauten | — | **214** (neuer Wächter) |
| `F_ROUTEN` | 69 | **69** |
| `VORGAENGE` | 20 | **20** |
| `BESTAETIGUNG_ZWECKE` | 7 | **7** |

---

## 9. Vier Befunde, die beim Bauen aufgefallen sind

**1. DER TEILEXPORT STAND SEIT 0.12.4 IN KEINER EINZIGEN PROTOKOLLZEILE.**
`server.js` schrieb `merkmal: \`teil ${teil}/${teile}\``. **`merkmal` trägt nur
Werte aus `MERKMALE`**, und `protokolliere()` verwirft bei einem unbekannten
Wert die **ganze Zeile** — nicht bloß das Merkmal. Ein Bestand, der in fünf
Teilen hinausging, hinterließ im Protokoll **nichts**; im Containerprotokoll
stand `Unbekanntes Merkmal: teil 1/5`. *Nachgestellt und bestätigt, bevor
gebaut wurde.* **Die geschlossene Liste hat gehalten, was sie zusagt; falsch
war die Aufrufstelle.** `MERKMALE` bekommt `'teil'` — ohne Nummer, denn die
wäre Freitext, und den gibt es in dieser Spalte nicht. *Sie steht im
Dateinamen.*

**2. DREI GEGENPROBEN GRIFFEN INS LEERE.** 77 und 78 suchten die Markenzeile
mit `MARK(34)`, im Quelltext steht seit einer Weile `MARK(36)`; 173 suchte die
Absage am Export ohne das `!alsTeil`, das 0.12.4 davorgesetzt hat. **Der
Treiber meldet so etwas — aber erst im vollen Lauf, und der steht seit fünf
Runden aus.** Drei Rückbauten haben in dieser Zeit nichts mehr belegt. *Der
neue Wächter im Prüfstand findet das in Millisekunden.*

**3. DIE ZAHL DER RÜCKBAUTEN STAND FALSCH IN DEN PAPIEREN.** Dort standen
**195**; gezählt sind es **193** (184 aus 0.12.3 plus die neun aus 0.12.4 —
184 + 9 = 193). *Der Rechenfehler steht im Änderungsprotokoll 0.12.4,
Abschnitt 7.* **Die neue Zahl ist 214 und wird vom Prüfstand nachgezählt.**

**4. FÜNF VON ZWANZIG VORGÄNGEN HATTEN KEIN DEUTSCHES WORT.**
`anfrage.frei`, `anfrage.ab`, `zweifaktor.an`, `zweifaktor.aus` und
`zweifaktor.wieder` fielen auf den Rückfall `|| z.was` und standen als **roher
Schlüssel** am Bildschirm — seit 0.9.1 beziehungsweise 0.10.0. **Ein Filter
nach Vorgangsart macht das unübersehbar.** Dazu bei den Merkmalen: `'adresse'`
fehlte ebenfalls seit 0.9.1, und `'beides'` hieß *„Name und Passwort"*, obwohl
es am Server ausdrücklich *„mehr als eines"* bedeutet und seit der Adresse auch
Name+Adresse meinen kann. **Alle acht Wörter sind nachgetragen; eine Prüfung
hält fest, dass kein Vorgang als roher Schlüssel dasteht und kein Merkmal
spurlos verschwindet.**

---

## 10. Gegenproben

**Vorher: 193 Rückbauten. Nachher: 214.** Einundzwanzig sind dazugekommen,
einer (191) ist neu geschrieben, drei alte (77, 78, 173) sind nachgezogen.

| Nr | Rückbau | erwartete Gruppe |
|---|---|---|
| 191 | Die Oberfläche fragt wieder je Teil statt einmal für alle | Der Teilexport mit zweitem Faktor |
| 192 | Die Route nimmt wieder nur ein einzelnes Ziel | Der Teilexport mit zweitem Faktor |
| 193 | Doppelte Zielnummern gehen als halbierte Bestellung durch | Der Teilexport mit zweitem Faktor |
| 194 | Eine Anfrage darf beliebig viele Freigaben bestellen | Der Teilexport mit zweitem Faktor |
| 195 | Der Teilexport schreibt wieder „teil 1/5" und fällt aus dem Protokoll | Der Teilexport mit zweitem Faktor |
| 196 | `X-Forwarded-Proto` wird auch ohne `HINTER_PROXY` geglaubt | Ohne Proxy ist der Kopf nur eine Behauptung |
| 197 | Beide Wege bekommen denselben Cookienamen | Zwei Netze, ein Zugang |
| 198 | Auch der Heimnetzcookie trägt `Secure` | Zwei Netze, ein Zugang |
| 199 | HSTS geht wieder auf jedem Weg mit | Zwei Netze, ein Zugang |
| 200 | Die Leseroute übergeht die gewählte Ansicht | Das Sicherheitsprotokoll in der Oberfläche |
| 201 | Die Namen im Protokoll sind wieder nur Text | Das Sicherheitsprotokoll in der Oberfläche |
| 202 | Auch „unbekannter Name" wird ein Knopf | Das Sicherheitsprotokoll in der Oberfläche |
| 203 | Fünf Vorgänge stehen wieder als roher Schlüssel da | Das Sicherheitsprotokoll in der Oberfläche |
| 204 | Der Löschdialog verschweigt den umkehrbaren Weg wieder | Die zweite Bestätigung in der Oberfläche |
| 205 | Grabsteine stehen wieder in der Zugangsliste | Der Einladungslink in der Karte Zugänge |
| 206 | Die selbsttätige Außenkante frisst die Zeile wieder | Die Anzeige zieht nach — 0.12.3 |
| 207 | Sortieren und Ansichten bekommen wieder je eine Zeile | Die Filterleiste wird kürzer — 0.13.0 |
| 208 | Die Pille mit null Treffern wird nicht mehr gedämpft | Die Filterleiste wird kürzer — 0.13.0 |
| 209 | Eine gespeicherte Ansicht in der alten Form verliert ihre Kategorie | Die Kategoriezeile lernt die Mehrzahl — 0.13.0 |
| 210 | Aus der Vereinigung wird ein Schnitt | Die Kategoriezeile lernt die Mehrzahl — 0.13.0 |
| 211 | „Ohne" überlebt das Zurechtrücken nicht | Die Kategoriezeile lernt die Mehrzahl — 0.13.0 |
| 212 | Die Pille „Ohne" wird gar nicht erst gezeichnet | Die Kategoriezeile lernt die Mehrzahl — 0.13.0 |

**Jeder der 214 greift nachweislich** — der Suchtext kommt in seiner Datei
genau einmal vor. **Das ist seit dieser Runde keine Zusage mehr, sondern eine
Prüfung:** die Gruppe „Die Gegenproben greifen" rechnet es bei jedem `npm test`
nach.

> **GEFAHREN SIND SIE IN DIESER RUNDE NICHT.** Jeder Rückbau fährt den vollen
> Prüflauf; bei rund 350 Sekunden und drei Nebenspuren wären 214 davon über
> zwanzig Stunden. **Der volle Lauf steht damit seit sechs Runden aus** — und
> das ist eine Zahl, die nicht besser wird. *Siehe Abschnitt 15.*

---

## 11. Entscheidungen und Abweichungen

**1. Die Nummer: MINOR.** Die Anlage kann danach etwas, was sie vorher nicht
konnte — über zwei Netze zugleich erreichbar sein. *Die Gegenlesart wäre: der
Rest der Runde ist Reparatur und Anzeige. Sie trägt nicht, weil Punkt 2 ganz
gebaut ist und nicht in Teilen.*

**2. Die Adressliste (Punkt 2c) gehört in eine eigene Runde — nicht in diese.**
Drei Gründe, und der dritte gibt den Ausschlag:

* **Sie ist die Antwort auf die zweite Hälfte des Problems** — die offene
  Portfreigabe 3100 —, nicht auf die erste. Punkt 2 löst die erste ganz.
* **Sie braucht eine neue `.env`-Zeile**, und diese Runde kommt sonst ohne aus.
* **Eine falsch gesetzte Liste zieht die Anmeldebremse auf die Adresse des
  Proxys** — dann teilen sich alle Besucher einen Zähler, und ein einziger
  Angreifer sperrt mit zehn Fehlversuchen **alle** für fünf Minuten aus. **In
  eine Runde, deren Zweck es ist, den Zugang offenzuhalten, gehört kein neuer
  Weg, ihn zu verlieren.**

*Sie bleibt damit offen und steht im Projektstand, Abschnitt 8. Ohne sie ist
`X-Forwarded-For` weiterhin eine Behauptung, solange Port 3100 offen steht —
das stand schon vorher so in der README und steht dort weiter.*

**3. Punkt 3 (c), die stdout-Zeile: nicht gebaut.** Begründet in Abschnitt 3 —
und der Grund ist nicht nur, dass (d) reicht, sondern dass wir eine Zusage über
ein Logformat gäben und darin eine Adresse führten, für die wir schlechter
einstehen können als die Stelle, die es schon tut.

**4. Punkt 4 (d), die Rückholfrist: nicht gebaut.** Mit (b) ist die Frage
beantwortet, die alles davor entscheidet.

**5. Die Beschriftungsspalte der Filterleiste bleibt** (Punkt 5d). Sie
wegzunehmen gäbe 86 px je Zeile zurück und wäre der größere Hebel. **Beim Bauen
ist ausdrücklich nachgesehen worden, ob (a) ohne sie einfacher wäre: nein.**
Die Umstellung der Tagzeile ist ein Wechsel von `margin-left: auto` auf
`flex: 1 1 0` und von einer Einfügung auf ein Anhängen — die Beschriftungsspalte
spielt darin keine Rolle. *Gesagt, nicht gebaut.*

**6. Die Antwort von `POST /api/bestaetigung` trägt jetzt IMMER ein Feld
`ziele`** — bei einer Einzelbestätigung `[null]`. *Eine Antwortform, deren
Gestalt von der Zahl der Ziele abhinge, bräuchte auf der Gegenseite zwei
Leseweisen.* Das betrifft alle sieben Zwecke, nicht nur den Export.

**7. Die Zahl 154 statt 147** — nachgemessen und in Abschnitt 5 aufgeschlüsselt.

**8. Die Zahl der Prüfungen in der Gruppe „Der Export in Teilen"** wird im
Projektstand mit **38** geführt, im Änderungsprotokoll 0.12.4 mit **36**.
*Nachgezählt sind es 36 an der Schnittstelle; der Auftrag hat die 38
übernommen. Der Projektstand ist nachgezogen.*

---

## 12. Neue Stolpersteine

**Die Zählung setzt bei 191 fort — 190 ist vergeben.**

191. **Ein Wert außerhalb einer geschlossenen Liste verwirft nicht das Feld,
    sondern die ganze Zeile.** `protokolliere()` prüft `was` und `merkmal`
    gegen ihre Listen und fängt jeden Fehler ab — **also schreibt es bei einem
    unbekannten Merkmal gar nichts.** Der Teilexport schrieb `teil 1/5`,
    stand damit in keiner einzigen Protokollzeile, und der Hinweis darauf lag
    im Containerprotokoll, wo ihn niemand suchte. **WER EINEN AUFRUF UM EIN
    FELD ERGÄNZT, SIEHT NACH, OB DER WERT IN DIE LISTE GEHÖRT** — und wer eine
    geschlossene Liste baut, muss damit rechnen, dass ein Aufruf danebengreift.
    *Ein stiller Verlust ist der schlechtere Ausgang als ein Fehler.*

192. **Ein Rückbau, der ins Leere greift, sieht aus wie einer, der nichts
    bewirkt — und fällt nur im vollen Lauf auf.** Drei Suchtexte waren über
    fünf Runden veraltet, weil der Quelltext daneben sich geändert hatte. Der
    Treiber meldet das zwar, aber erst nach zwanzig Stunden. **DIE FRAGE „GREIFT
    ER ÜBERHAUPT NOCH" IST BILLIG UND GEHÖRT IN DEN PRÜFSTAND**, die Frage
    „macht er etwas rot" ist teuer und gehört in den Lauf. *Zwei verschiedene
    Fragen, und nur eine davon muss Stunden kosten.*

193. **Eine Prüfung, die ihren Gegenstand vorher selbst zerstört, kann nicht
    scheitern.** Zwei Zeilen prüften den Cookienamen **nach** zwölf
    absichtlichen Fehlversuchen, die die Adresse hart sperren — die Anmeldung
    danach liefert 429 und gar keinen Cookie. Ein `wert === '' ||` als
    Auffangnetz machte beide in jedem Lauf wahr. **STOLPERSTEIN 81 HAT EINE
    ZWEITE GESTALT:** nicht der fehlende Gegenstand, sondern der von der
    Prüflage selbst weggenommene. *Reihenfolge ist bei aufeinander aufbauenden
    Lagen ein Teil der Aussage.*

194. **Zwei Codes aus demselben Zeitfenster sind derselbe Code.** Wer eine
    Prüflage baut, die die **Einmaligkeit** eines Codes belegen soll, kann den
    zweiten nicht ausrechnen — er muss auf die Uhr warten, bis der Zähler
    weitergelaufen ist. **EINE PRÜFUNG, DIE ZWEIMAL DENSELBEN CODE SCHICKT UND
    ZWEIMAL 200 ERWARTET, STELLT DEN FEHLER NACH, DEN SIE WIDERLEGEN SOLL.**
    *Deshalb braucht die Gruppe genau zwei tragende Codes und wartet dazwischen
    — Rechnen hilft nicht, nur Warten.*

195. **Ein fehlendes Wort fällt still auf den Schlüssel zurück.**
    `VORGANGSWORT[z.was] || z.was` und `MERKMALSWORT[z.merkmal] || ''` sind
    beide richtig gebaut — und beide machen eine fehlende Übersetzung
    unsichtbar: einmal steht der rohe Schlüssel da, einmal gar nichts. Fünf
    Vorgänge und zwei Merkmale sind so über Runden hinweg unbemerkt geblieben.
    **WER EINE ABBILDUNG ÜBER EINE GESCHLOSSENE LISTE BAUT, PRÜFT DIE
    VOLLSTÄNDIGKEIT GEGEN DIE LISTE** — der Rückfall ist für den Notfall da und
    nicht für den Regelfall.

196. **`flex: 1 1 0` meint in einer Spalte die Höhe.** Dieselbe Regel, die eine
    Zeile teilt, lässt ein Element in `flex-direction: column` auf die
    Grundhöhe null fallen und dann über die ganze Spalte wachsen. **JEDE
    FLEX-ANGABE GILT FÜR DIE HAUPTACHSE, UND DIE DREHT SICH IM TABLETTTEIL** —
    wer dort eine Zeile zur Spalte macht, nimmt die Angabe zurück. *Der Fehler
    ist unauffällig, weil er am breiten Schirm gar nicht auftritt.*

---

## 13. Was ausdrücklich nicht passiert ist

* **Keine Datenbankstufe.** Kein Schema, kein Migrationsblock, keine neue
  Formatnummer. Es bleibt bei **fünf** markierten Migrationsblöcken und
  Formatnummer **10**. *Punkt 6 fasst gespeicherte Daten an — den Filterwert in
  `settings` —, aber kein Schema: der Server reicht das JSON unbesehen durch,
  und übersetzt wird beim Lesen.*
* **Keine neue Zeile in der `.env`.** Die Adressliste hätte eine gebraucht;
  sie ist nicht gebaut.
* **Keine neue Abhängigkeit**, auch keine für den Prüfstand.
* **Keine neue Route.** `F_ROUTEN` bleibt bei **69**; die Auswahl am Protokoll
  ist ein Abfrageparameter an einer lesenden Route.
* **Kein achter Zweck der zweiten Bestätigung.** Es bleibt bei **sieben**.
* **Der Import als Strom** bleibt offen — eine einzelne Datei über 512 MB lässt
  sich weiterhin nicht einspielen.
* **Das Konzeptpapier und das Videopapier sind nicht angefasst.**

---

## 14. Die Zahlen

* **Prüfungen:** vorher **3992**, nachher **4115**.
* **Gegenproben:** vorher **193** (in den Papieren standen 195, siehe
  Abschnitt 9), nachher **214**. *Der volle Lauf ist nicht gefahren.*
* **`F_ROUTEN`:** 69 → **69**.
* **Merkmale im Sicherheitsprotokoll:** 13 → **14**.
* **Vorgänge im Sicherheitsprotokoll:** 20 → **20**.
* **Zwecke der zweiten Bestätigung:** 7 → **7**.
* **Karten im Systembereich:** 19 → **19**.
* **Formatnummer:** 10 → **10**. **Migrationsblöcke:** 5 → **5**.
* **Stolpersteine:** bis 190 → bis **196**.
* **Portbasen im Prüfstand:** 55 → **56**.
* **Filterleiste bei 1359 px:** **229 px → 154 px**; bis zum ersten Eintrag
  **253 px → 178 px**; Zeilen **5 → 4**.
* **Tagwolke:** Breite **1252 px → 1023 px**, sichtbare Tags **17 → 14** bei 22
  vorhandenen; „mehr" steht vorher wie nachher.

### Was am Wirt zu messen bleibt

**Zwei Zahlen kann dieser Branch nicht liefern**, weil sie am laufenden Bestand
entstehen — sie stehen im Chat als Befehle mit erwartetem Ergebnis:

* **Beide Wege, bis zur stehenden Sitzung:** eine Anmeldung über HTTPS und eine
  über `http://<server-ip>:3100`, im selben Browser. *Ohne beide ist Punkt 2
  nicht im Feld belegt.*
* **Der Teilexport mit eingeschaltetem zweitem Faktor:** wie viele Teile, eine
  Eingabe, wie viele geladene Dateien — und **keine** Zeile
  `bestaetigung.fehl` danach. *Ohne diese Zahlen ist Punkt 1 nicht im Feld
  belegt.*
* **Die Nachlese zu 0.12.4:** Zahl der Teile bei 300 MB, Dateigrößen gegen die
  Ansage, und ob ein Teil sich in eine Zweitanlage einspielen ließ.

---

## 15. Offen geblieben

* **Der volle Gegenprobenlauf steht seit sechs Runden aus.** 214 Rückbauten zu
  je einem vollen Prüflauf sind über zwanzig Stunden. **Er ist in dieser Runde
  nicht gelaufen, und das ist keine Zusage mehr.** *Was diese Runde daran
  ändert, ist der billige Teil davon: dass jeder Rückbau überhaupt noch greift,
  wird jetzt bei jedem Lauf nachgerechnet.*
* **Die Adressliste, wer `X-Forwarded-For` setzen darf.** Solange Port 3100 im
  eigenen Netz offen steht, ist der Kopf eine Behauptung des Aufrufers und die
  Anmeldebremse damit umgehbar. **Sie ist die zweite Hälfte von Punkt 2 und
  gehört in eine eigene Runde.**
* **Der Import als Strom.** Eine einzelne Datei über 512 MB lässt sich nicht
  einspielen, gleich woher sie kommt.
* **Der Teilexport ist am echten Bestand noch nicht gesehen.** Er ist an
  Prüflagen gefahren, die größte mit 1000 Einträgen; der echte Bestand trägt
  Videos und Kommentarbilder in anderen Größen.
* **EIN KAPUTTER COOKIEWERT LEGT JEDE ANFRAGE DIESES BROWSERS LAHM — ein
  Befund aus dem Gegenlesen, und er ist ÄLTER als diese Runde.**
  `parseCookies()` (`auth.js`) ruft `decodeURIComponent()` auf jeden Wert, und
  das wirft bei einer unvollständigen Prozentfolge einen `URIError`:

  ```
  Cookie: kriterion_session=%   →   URIError: URI malformed
  ```

  **Die Funktion sieht ALLE Cookies des Hosts an, nicht nur die eigenen** —
  ein fremder Cookie mit einem `%` im Wert genügt. `requireAuth` ruft sie bei
  jeder geschützten Anfrage; der Fehler-Handler macht daraus eine 500, und
  dieser eine Browser kommt nicht mehr herein, bis jemand den Cookie löscht.
  **Die Zeile stammt aus Commit `158b6d9` und ist von 0.13.0 nicht berührt** —
  nachgesehen, nicht vermutet.
  *Nicht in dieser Runde geändert: sie fasst eine ausgelieferte Datei an, und
  der Fingerprint dieser Version steht. Der Weg wäre klein — die Schleife
  überspringt einen Wert, der sich nicht dekodieren lässt, statt abzubrechen.*
* **Die Tags `v0.11.0` bis `v0.13.0` fehlen am Remote.** Der Git-Proxy der
  Arbeitsumgebung weist `POST /git-receive-pack` mit `refs/tags/*` ab; die
  Befehle stehen im Projektstand, Abschnitt 8.
