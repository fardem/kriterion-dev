# Änderungsprotokoll 0.10.0 — „Der zweite Faktor"

**Version 0.10.0 · gebaut am 26. August 2026 · die erste Runde nach dem
Stufenplan und die erste unter Semantic Versioning · Datenbankstufe, ohne
Migrationsblock**

**Wer will, sichert seinen Zugang mit einem zweiten Faktor — einem Code aus
einer App auf seinem Telefon, der ohne Netz entsteht und alle dreißig Sekunden
ein anderer ist.**

Der Satz, unter dem alles steht, kommt aus dem Konzeptpapier, Teil III: *ein
zweiter Faktor über TOTP braucht ausdrücklich kein Netz und darf deshalb nie
ausfallen — „E-Mail ist Bequemlichkeit, nie Voraussetzung" trägt dort NICHT.*
Daraus folgt beides, und beides ist gebaut: **kein Code per Mail, kein Code per
SMS**, die Anlage schickt dafür nichts hinaus — und die
**Wiederherstellungscodes** gehören in dieselbe Runde, denn ohne sie ist ein
verlorenes Telefon ein verlorener Zugang.

**Und der zweite Satz trägt genauso: die Anlage läuft ohne all das
vollständig.** Der zweite Faktor ist freiwillig, steht je Zugang und ist ab
Werk aus. **Wer ihn nicht einschaltet, merkt von dieser Version nichts.**

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.10.0 ist **MINOR**, weil eine
neue Funktion dazukommt und die öffentliche Schnittstelle unangetastet bleibt —
Datenverzeichnis, Austauschformat, die Schlüssel in der `.env` und die Werkzeuge
auf dem Wirt. *Das Schema wächst, aber es bricht nicht: eine Fassung von 0.9.1
öffnet ein Verzeichnis von 0.10.0 weiterhin, die beiden neuen Tabellen stören
sie nicht.* `zugang.js` bekommt einen **zusätzlichen** Unterbefehl; keiner der
vorhandenen ändert sich.

**Zwei Lücken sind beim Bauen aufgefallen und in derselben Runde geschlossen
worden** — Stolpersteine 159 und 160. Sie stehen in Abschnitt 4 als Befunde A
und B, und sie sind der eigentliche Ertrag dieser Runde. **Ein dritter Befund
kam aus der Gegenprobe** (F): eine Zusage, die gebaut war und sich trotzdem
nicht belegen ließ.

**Der QR-Code ist vor dem Bau herausgenommen worden**, mit Begründung und
Zustimmung. Einzelheiten in Abschnitt 2, Abweichung A.

---

## Inhalt

1. [Was gebaut wurde, je Datei](#1-was-gebaut-wurde-je-datei)
2. [Die Abweichungen und Ergänzungen zum Auftrag](#2-die-abweichungen-und-ergänzungen-zum-auftrag)
3. [Die Fragen aus dem Auftrag, beantwortet](#3-die-fragen-aus-dem-auftrag-beantwortet)
4. [Befunde beim Bauen](#4-befunde-beim-bauen)
5. [Neue Stolpersteine](#5-neue-stolpersteine)
6. [Der Prüfstand](#6-der-prüfstand)
7. [Gegenprobentabelle](#7-gegenprobentabelle)
8. [Prüfungszahlen](#8-prüfungszahlen)
9. [Was ausdrücklich nicht passiert ist](#9-was-ausdrücklich-nicht-passiert-ist)
10. [Offen geblieben](#10-offen-geblieben)

---

## 1. Was gebaut wurde, je Datei

### `zweifaktor.js` — neu

**Die reine Rechnung, ohne Datenbank.** Base32 hin und zurück (RFC 4648), HMAC
über den Zähler, der Vergleich über das Fenster, die `otpauth://`-Zeile und die
Wiederherstellungscodes. **Dieselbe Teilung wie `mail.js` neben `auth.js`: der
Vorgang hier, die Zeile dort.** Alles, was eine Zeile hat — das Geheimnis, der
verbrauchte Zähler, die Codes —, steht in `auth.js`, wo die übrigen
Zugangstabellen stehen.

**Keine neue Abhängigkeit.** TOTP ist HMAC-SHA1 über einen Zähler, und `crypto`
kann das seit jeher.

**Die vier Kennwerte stehen als Konstanten da, mit dem Grund daneben:**
`VERFAHREN = 'sha1'`, `ZIFFERN = 6`, `SCHRITT_SEKUNDEN = 30`, `FENSTER = 1`.
Dazu `GEHEIM_BYTES = 20` — RFC 4226 verlangt mindestens 16 und empfiehlt 20,
und zwanzig Bytes gehen glatt in 32 Base32-Zeichen auf: **kein Füllzeichen**,
also keine Frage, ob das Gleichheitszeichen mitgetippt werden muss.

`pruefeCode()` liefert **den Zähler**, der getragen hat, und nicht ja/nein —
das ist die ganze Bauform gegen Wiederverwendung: der Aufrufer schreibt ihn weg
und nimmt beim nächsten Mal nur noch etwas Größeres an. Ein bloßes ja/nein
zwänge ihn, den Schritt selbst nachzurechnen, und das wäre eine zweite Rechnung
daneben. **Verglichen wird zeitunabhängig** (`timingSafeEqual`), anders als
beim Token: dort ist der Hash ein Primärschlüssel und wird *nachgeschlagen*,
hier wird wirklich verglichen, und sechs Ziffern sind kurz genug, dass eine
Laufzeit über Stellen etwas sagen könnte.

**Die Uhr wird übergeben und nicht hier geholt** — sonst ließe sich das
Zeitfenster nur mit echtem Warten prüfen, und eine Prüfung, die eine Minute
schläft, wird irgendwann herausgenommen.

**Die Wiederherstellungscodes** bekommen ein **eigenes Alphabet** und nicht
Base32: hier wird nichts dekodiert, nur verglichen, also fällt alles heraus,
was sich beim Abschreiben verwechseln lässt — `0/O`, `1/I/l`. Gezogen wird über
`crypto.randomInt` und **nicht über einen Rest**: `zufall % 31` gäbe den ersten
Zeichen rund vier Prozent mehr Gewicht.

**Zwei Formen, ein Feld:** `istCodeform` (sechs Ziffern) und `istWiederform`
(zehn Zeichen aus dem Alphabet) halten Code und Wiederherstellungscode
auseinander, und keine Eingabe kann beides zugleich sein. Ein Umschalter am
Bildschirm wäre eine Frage, die sich aus dem Getippten schon beantwortet.

### `db.js`

**Zwei Tabellen dazu, keine Spalte — es bleibt bei fünf markierten
Migrationsblöcken.**

```
zweifaktor        user_id PK → users ON DELETE CASCADE, geheim TEXT NOT NULL,
                  bestaetigt_am TEXT, letzter_zaehler INTEGER, created_at
zweifaktor_codes  hash TEXT PK, user_id NOT NULL → users, benutzt_am, created_at
                  + idx_zweifaktor_codes_user
```

`user_id` ist **Primärschlüssel** und nicht eine Spalte daneben: ein Zugang hat
einen zweiten Faktor oder keinen. Eine eigene Nummer erlaubte zwei Zeilen an
einem Zugang und damit zwei Wahrheiten darüber, welches Geheimnis gilt.

`bestaetigt_am NULL` heißt „angefangen, noch nicht bestätigt" — der Zustand
zwischen „Geheimnis erzeugt" und „die App rechnet nachweislich dasselbe".
**Solange er leer ist, verlangt die Anmeldung nichts**, sonst sperrte ein
abgebrochenes Einschalten den Zugang aus.

`letzter_zaehler` trägt die Regel „ein Code gilt genau einmal": angenommen wird
nur ein Zeitschritt, der **echt größer** ist als der zuletzt verbrauchte.

**Die lange Begründung zum Klartext steht am Schema**, samt dem, was daraus für
Export, Sicherung und Kontrollausgaben folgt.

### `auth.js`

* `require('./zweifaktor')` als `zf` — nur wegen der Rechnung.
* **Drei neue Vorgänge**: `zweifaktor.an`, `zweifaktor.aus`,
  `zweifaktor.wieder`. `VORGAENGE` geht von 17 auf **20**; die Begründung
  daneben nennt ausdrücklich, warum es keinen vierten für den falschen Code
  gibt. **`MERKMALE` bleibt bei dreizehn.**
* **Der ganze Bereich „Der zweite Faktor"**: `holeZweifaktor`, `zweifaktorAn`,
  `zweifaktorStand`, `beginneZweifaktor`, `legeWiederCodesAn`,
  `schalteZweifaktorEin`, `pruefeZweitenFaktor`, `erneuereWiederCodes`,
  `schalteZweifaktorAus` — dazu die eine Absage `ZWEITER_FAKTOR_ABSAGE`.
* **„Genau einmal" steht in der `WHERE`-Klausel des `UPDATE`** und nicht in
  einer Prüfung davor: zwischen Lesen und Schreiben läge sonst Platz für einen
  zweiten Aufruf mit demselben Code — und genau darauf zielt, wer über die
  Schulter sieht. Dasselbe für den Wiederherstellungscode.
* **Der Ausweis zwischen den beiden Anmeldeschritten**:
  `ANMELDE_AUSWEIS_MS = FREIGABE_MS`, `ausweise`, `erzeugeAnmeldeAusweis`,
  `verbraucheAnmeldeAusweis` — die Bauform der Freigabe aus 0.8.90, im
  Arbeitsspeicher, kein Schema. **Beim Anlegen wird einmal durchgesehen**, sonst
  wüchse die Karte mit jeder abgebrochenen Anmeldung.
* `entferneZugang` räumt beide neuen Tabellen mit; **`setzeStatus`
  ausdrücklich nicht** — mit einem Kommentar, der sagt, warum die Zeile dort
  fehlt und nicht vergessen wurde.
* `tokenHash()` wird für die Wiederherstellungscodes **wiederverwendet** und
  nicht ein zweites Mal geschrieben.

### `server.js`

* **`POST /api/login`**: nach der Passwortprüfung und nach der Statusprüfung die
  Verzweigung — bei eingeschaltetem Faktor **kein Cookie**, sondern
  `{ zweifaktor: true, ausweis, sekunden }`. **`noteSuccess` steht seit dieser
  Runde HINTER der Verzweigung** (Befund B).
* **`POST /api/login/zwei`** — neu, Art `offen`. Ausweis verbrauchen, Bremse,
  zweite Nachschau auf den Status, Code prüfen, Sitzung anlegen. Bei falschem
  Code: `noteFailure`, `anmeldung.fehl` und ein **frischer Ausweis** in der
  Absage.
* **`POST /api/token/einloesen`**: dieselbe Verzweigung (Befund A).
* **`POST /api/bestaetigung`**: nimmt zusätzlich `code` und verlangt ihn, wenn
  der Zugang einen Faktor hat — **nach** der Passwortprüfung.
* **Vier neue Routen** `POST /api/zweifaktor/start`, `.../an`, `.../codes`,
  `DELETE /api/zweifaktor`, alle Art `selbstbezug`, alle hinter dem bisherigen
  Passwort über den gemeinsamen Helfer `eigenesPasswortStimmt`.
* **`GET /api/account`** trägt `zweifaktor: zweifaktorStand(...)` mit —
  deshalb kommt **keine lesende Route** dazu.
* **`GET /api/settings`** trägt das Ja/Nein `zweifaktor` mit, damit das
  Bestätigungsfenster weiß, ob es ein Codefeld zeigen muss.

### `public/app.js`

* `showZweiterFaktor(ausweis, errMsg)` — die Seite des zweiten Schritts. **Ein
  Feld für beide Formen**, der Hinweis auf die Wiederherstellungscodes steht
  ohne Klick daneben. Sie entscheidet an einem **Feld** und nicht an einem
  Statuscode, ob es weitergeht: liegt der Absage ein frischer Ausweis bei, war
  der Code falsch; liegt keiner bei, geht es zurück an den Anfang.
* `showLogin` und `showEinladung` verzweigen dorthin.
* `passwortFenster(titel, was, grund, mitCode)` ersetzt `bestaetigungsFeld` als
  Rumpf; `bestaetigungsFeld` und das neue `bestaetigungsFeldFrei` sitzen darauf.
  **Zwei Namen und kein Schalter**, weil das Codefeld einmal an `ZWEIFAKTOR`
  hängt und einmal am Weg.
* Der Block **`zf-block`** in der Karte „Zugang": `zeichneZweifaktor`,
  `zeigeGeheimnis`, `zeigeWiederCodes`. **Keine neue Karte** — es bleibt bei
  neunzehn.
* `ZWEIFAKTOR` als abgeleiteter Zustand aus `/api/settings`.

### `public/style.css`

`.zf-block`, `.zf-zustand`, `.zf-an`, `.zf-aus`, `.zf-codestand`,
`.zf-schluessel`, `.zf-einrichten a.btn`, `.zf-codeliste`. **Grün für an, grau
für aus, kein Rot** — ein ausgeschalteter zweiter Faktor ist kein Fehler,
sondern die Vorgabe. Schlüssel und Codes in fester Schrift; beide dürfen
umbrechen, sonst laufen sie auf schmalem Schirm seitlich hinaus. **Keine neue
Farbvariable.**

### `zugang.js`

Der vierte schreibende Befehl: **`zweifaktor <name>`**, und er schaltet **nur
aus**. Er nennt vorher den Stand samt Zahl der übrigen Codes und fragt nach.
`liste` bekommt eine Spalte **2FA**, die „an" oder „aus" sagt und nie mehr. Der
Kopfkommentar und die Hilfe sind nachgezogen — aus „den drei schreibenden
Befehlen" werden vier.

### `pruefung.js`

**225 neue Prüfungen in sechzehn neuen Gruppen**, dazu die Erweiterungen an
`F_ROUTEN` (Zahl **69**, fünf neue Zeilen samt Art), an den geschlossenen
Listen aus `auth.js` (zwanzig Vorgänge, dreizehn Merkmale, sieben Zwecke), am
Wächter über die Portbasen (**53**) und am Sprachwächter (**elf**
Quelltextdateien statt zehn — `zweifaktor.js` kommt dazu). Der DOM-Mock bekommt
die sechs neuen Endpunkte und **zieht wirklich mit**.

### `gegenprobe.js`

**42 neue Rückbauten**, Nummern 82 bis 123.

### `CHANGELOG.md`, `README.md`, `Doku/`

Der erste Eintrag nach **Keep a Changelog 1.1.0** — `## [0.10.0] - 2026-08-26`,
die zutreffenden der sechs englischen Abschnitte, dahinter die beiden eigenen.
Die README bekommt den Abschnitt **„Der zweite Faktor"** und den Notweg an
derselben Stelle wie das vergessene Passwort. Der Projektstand ist auf
**Revision 23** nachgezogen und heißt jetzt `Projektstand_Kriterion_0_10_0.md`.

### `package.json` / `package-lock.json`

Version **0.10.0**, Lockfile über `npm install --package-lock-only`
nachgezogen. *Nachgeprüft: `0.10.0` sortiert über `0.9.1` — drei Zahlen, nicht
vier.* **Keine neue Abhängigkeit.**

### Unberührt geblieben

`mail.js`, `anhaenge.js`, `keys.js`, `schluessel.js`, `schluessel.sh`,
`.env.example`, `docker-compose.yml`, `Dockerfile`, `public/index.html`,
`public/marke-dunkel.svg`, `public/favicon.svg` und **das Konzeptpapier**.

---

## 2. Die Abweichungen und Ergänzungen zum Auftrag

### A — Der QR-Code fällt heraus und bekommt eine eigene Runde

**Der Auftrag führte ihn unter „drei Vorgaben, die nicht mehr zur Wahl
stehen"** — und erlaubte im selben Atemzug ausdrücklich, ihn herauszunehmen,
wenn er die Runde zu breit macht — ausdrücklich, ohne dass darin ein
Zurückgehen läge. **Vor dem Bau gesagt, nicht hinterher**,
und so entschieden.

**Der Grund ist nicht das Bauen, sondern der Beweis.** Reed-Solomon über
GF(256), Kapazitäts- und Blocktabellen je Version und Fehlerkorrekturstufe,
Findemuster, Taktlinien, Alignment, Format- und Versionsbits, acht Masken mit
Bewertung — das sind mehrere hundert Zeilen, und sie sind schreibbar. **Die
Zusage „dieselbe Zeichenfolge ergibt weltweit dieselbe Matrix" braucht ohne
Bibliothek aber einen eigenen Dekoder im Prüfstand**, also die doppelte Arbeit
mit offenem Ende. Er war damit der einzige Teil dieser Runde ohne begrenzten
Prüfaufwand.

**Was stattdessen gebaut ist**, und es trägt den Weg: der Base32-Schlüssel in
**Vierergruppen** — zweiunddreißig Zeichen am Stück sind der Weg, an dem
Menschen aufgeben — und die **`otpauth://`-Zeile als anklickbarer Verweis**
daneben. Auf einem Telefon öffnet der die App unmittelbar; am Rechner ist er
die Zeichenfolge, die ein QR-Code ohnehin nur zeichnen würde. *Der abtippbare
Schlüssel ist die Zusage, der QR-Code wäre die Bequemlichkeit.*

**Gemessen statt geschätzt, für die eigene Runde:** die Zeile ist **100
Zeichen** bei `Kriterion/faruk`, **117** bei `Bewertungskatalog/chefin` und
**203** bei einem langen Anlagen- und Zugangsnamen. Im Bytemodus heißt das
Version 5 bis 8. Vorgemerkt im Projektstand, Abschnitt 10.

### B — Zwei Tabellen statt einer

**Der Auftrag neigte zu „eine eigene Tabelle".** Gebaut sind **zwei**:
`zweifaktor` und `zweifaktor_codes`.

**Der Grund ist baulich.** „Jeder Code genau einmal" ist eine Eigenschaft der
**Zeile** — dieselbe Bauform wie bei `tokens`, wo sie seit 0.8.80 trägt. Eine
Liste in einer Spalte neben dem Geheimnis wäre kürzer und brächte den Zustand
„verbraucht" in eine zweite Form: entweder als gelöschten Listeneintrag (dann
ist nicht mehr zu sehen, wie viele es einmal waren, und die Karte könnte nicht
„noch 6 von 8" sagen) oder als Marke im Text (dann steht ein Zustand in einem
Feld, das keinen tragen soll).

**An der Zusage des Auftrags ändert das nichts:** es bleibt bei **fünf**
markierten Migrationsblöcken, denn `CREATE TABLE IF NOT EXISTS` legt eine
fehlende Tabelle bei jedem Start an — für zwei genauso wie für eine.

### C — `zugang.js` bekommt seinen vierten schreibenden Befehl

Der Auftrag verlangte, dass `zugang.js` einen zweiten Faktor abnehmen kann.
Damit stimmt der Satz „die **drei** schreibenden Befehle stehen im
Sicherheitsprotokoll" nicht mehr — es sind **vier**. Kopfkommentar, Hilfe und
Projektstand sind entsprechend nachgezogen; die Eigenschaft selbst bleibt: alle
vier stehen im Protokoll, alle vier mit dem leeren `wer` des Wirts.

### D — Der Ausweis wird bei falschem Code erneuert

**Der Vorschlag sagte „genau einmal", und das gilt wörtlich weiter** — der alte
Ausweis ist nach jedem Versuch verbraucht. **Neu ist, dass der Absage ein
frischer beiliegt.**

*Aufgefallen ist es beim Bauen der Oberfläche:* ohne ihn stünde ein Mensch nach
**einem** Tippfehler wieder vor dem Passwortfeld — und das trifft ausgerechnet
den, der einen zehnstelligen Wiederherstellungscode vom Zettel abschreibt.
**Nachgerechnet nimmt es der Sicherheit nichts:** wer das Passwort kennt und
Ziffern rät, käme ohne ihn genauso weit, er tippte das Passwort eben noch
einmal — und die Bremse zählt beides gleich. **Was den Versuch begrenzt, ist die
Bremse und nicht die Frist**, und die Bremse ist mit Befund B schärfer geworden,
nicht lockerer.

### E — `GET /api/settings` trägt ein Ja/Nein mit

**Nicht im Vorschlag, beim Bauen gebraucht.** Das Bestätigungsfenster steht
auch vor Export und Import, also außerhalb des Systembereichs, wo
`GET /api/account` nicht gelaufen ist. Ohne die Angabe müsste es den ersten
Versuch **absichtlich scheitern lassen**, um zu erfahren, dass ein Code fehlt —
und schriebe dabei bei **jedem** schweren Vorgang eine Zeile
`bestaetigung.fehl` ins Sicherheitsprotokoll.

**Es ist keine zweite Wahrheit:** beide Antworten lesen denselben Zugang, wie
schon `name` seit 0.9.0 in beiden steht. Und es ist **nur ein Ja/Nein** — weder
das Geheimnis noch der Zeitpunkt noch die Zahl der Codes.

---

## 3. Die Fragen aus dem Auftrag, beantwortet

**1 · Wo liegt das Geheimnis, und in welcher Form?** Zwei eigene Tabellen (siehe
Abweichung B), `geheim` als Base32 **im Klartext**. Das ist unvermeidlich: ein
Passwort wird *geprüft*, ein TOTP-Geheimnis wird *nachgerechnet*. **Für Export,
Sicherung und Kontrollausgaben** folgt daraus: der JSON-Export trägt es
**nicht** (er packt Einträge samt Anhängen, keine Zugangstabellen — eine
Exportdatei ist kein Weg daran vorbei, und ein Import bringt keinen Faktor
herein; Formatnummer bleibt **10**); die Sicherung über `VACUUM INTO` trägt es
**sehr wohl**, verschlüsselt wie Passwörter, Sitzungen und Mailpasswort; in eine
**Kontrollausgabe kommt es nie**, und der Prüfstand sucht es an vier Orten.

**2 · Wie kommt das Geheimnis auf das Telefon?** Vierergruppen und die
`otpauth://`-Zeile als Verweis; der Encoder bekommt eine eigene Runde (siehe
Abweichung A). Die Kennwerte stehen ausgeschrieben in der Zeile, obwohl sie die
Vorgabe sind — ein Prüfgerät, das sie anders vorbelegt, läge sonst still daneben.

**3 · Wie wird die Anmeldung zweistufig, ohne einen zweiten Zustand zu
erzeugen?** Ein Ausweis im Arbeitsspeicher, 120 Sekunden (dasselbe
`FREIGABE_MS`), genau einmal gültig, an die Benutzernummer gebunden. **Kein
Schema, keine Zeile, keine halbe Sitzung** — und das ist nicht behauptet: der
Prüfstand zählt die Zeilen in `sessions` vor und zwischen den Schritten und
sieht nach, dass der Ausweis in keiner Tabelle steht. **Die Auskunft kommt erst
nach richtigem Passwort**, und das ist baulich wahr statt beabsichtigt: die
Frage steht unterhalb von `pruefeAnmeldung`. Verglichen wird der **rohe
Antwortkörper** dreier Lagen, nicht ein Feld daraus.

**4 · Was ist mit dem Tokenweg aus 0.8.80?** Er fragt ebenfalls — **und das war
keine Vorsicht, sondern das Schließen einer Lücke** (Befund A). Der
**Sonderfall** löst sich baulich: ein Zugang ohne Passwort kann keinen
bestätigten Faktor haben, weil Einschalten eine Anmeldung voraussetzt.
**Nachgestellt statt behauptet.**

**5 · Wer darf ihn abschalten — und gibt es einen Weg daneben?** Allein der
Betroffene, hinter Passwort **und** gültigem Code. **Und ja, es gab einen Weg
daneben: den Rücksetzlink** (Befund A). Geprüft sind alle drei Verdächtigen:
`PUT /api/users/:id` mit `passwort` lässt die Zeile stehen (der Admin käme mit
dem selbst gesetzten Passwort trotzdem nicht herein), `setzeStatus` lässt sie
ausdrücklich stehen (sonst wäre „sperren und freigeben" der Weg an der
Rollenleiter vorbei), `entferneZugang` nimmt sie mit (den Zugang gibt es dann
nicht mehr). **Und es gibt gar keine Adresse dafür:** `DELETE /api/zweifaktor/:id`
gibt es nicht, der Prüfstand hält das an einer 404 fest.

**6 · Die Wiederherstellungscodes.** Acht Stück, je **zehn** Zeichen aus einem
Alphabet ohne `0/O/1/I/l`, angezeigt in zwei Fünferblöcken, gespeichert als
SHA-256 ohne Salz, **jeder genau einmal**, gezeigt genau einmal. **Ist der
letzte verbraucht**, gibt die Karte hinter Passwort und gültigem Code acht neue
aus und verbraucht die alten in derselben Transaktion — ein
Wiederherstellungscode zählt dabei als Beleg, genau dafür ist er da. **Sind
Telefon UND Codes weg**, bleibt `zugang.js` auf dem Wirt. Die Karte warnt
vorher: ab zwei übrigen sagt sie deutlich, dass es knapp wird.

**7 · Fragt die zweite Bestätigung zusätzlich den Code?** Ja, und nur bei
Zugängen, die ihn eingeschaltet haben. **`BESTAETIGUNG_ZWECKE` bleibt bei
sieben** — nachgeprüft und im Prüfstand festgehalten: die Liste führt *Zwecke*,
und es kommt keiner dazu. Der Prüfstand fährt ausdrücklich beide Lagen: ein
Zugang ohne Faktor bestätigt weiterhin mit dem Passwort allein.

**8 · Zeitfenster, Drift und Wiederverwendung.** **±1 Fenster**, ein Code gilt
genau einmal, gebaut als `letzter_zaehler` mit „echt größer". Das ist schärfer
als „derselbe Code nicht zweimal" — nach einer Anmeldung ist auch das Fenster
davor tot —, dafür ist es **eine** Regel statt einer Liste. **`F_ROUTEN` geht
von 64 auf 69**, und die Zahl wird ausdrücklich geprüft.

---

## 4. Befunde beim Bauen

### Befund A — der Rücksetzlink war der Weg am zweiten Faktor vorbei

**Nach dem ersten Bau stand der zweite Faktor vor `POST /api/login` und sonst
nirgends.** `POST /api/token/einloesen` meldete unverändert gleich an.

**Die Lage, ausgeschrieben:** ein Admin darf für einen fremden Zugang einen
Rücksetzlink erzeugen (`POST /api/users/:id/token`, hinter der zweiten
Bestätigung, aber innerhalb seiner Rechte). Er öffnet ihn **selbst**, setzt ein
Passwort — und wäre angemeldet gewesen, **ohne je einen Code zu brauchen**. Die
Schranke hätte gegen jeden gehalten außer gegen den, der sie am leichtesten
umgeht.

**Behoben in derselben Runde:** der Tokenweg verlangt den Faktor ebenfalls. Das
Passwort wird weiterhin gesetzt und der Link verbraucht sich — was er nicht mehr
tut, ist anmelden.

**Die Lehre steht als Stolperstein 159:** *wer eine Anmeldung verschärft, zählt
die Stellen, an denen eine SITZUNG entsteht, und nicht die, an denen ein
Passwort geprüft wird.* Es sind drei, und `legeSitzungAn` nennt sie alle.

### Befund B — `noteSuccess` hätte die Bremse am zweiten Schritt ausgehebelt

**Die Prüfung dafür war eigens gebaut, und sie wurde beim ersten Lauf rot:**
zwölf falsche Codes hintereinander ergaben **zwölfmal 401 und kein einziges
429**.

**Die Ursache lag nicht am zweiten Schritt, sondern am ersten.**
`POST /api/login` rief `noteSuccess` unmittelbar hinter der Passwortprüfung —
richtig, solange die Anmeldung mit dem Passwort fertig war. Mit einem zweiten
Schritt dahinter löschte genau dieser Ruf den Zähler, den der zweite Schritt
gerade aufgebaut hatte: wer das Passwort kennt und Ziffern rät, holt sich vor
jedem Versuch einen frischen Ausweis. **Sechs Ziffern wären eine Million
ungebremste Versuche gewesen.**

**`noteSuccess` steht jetzt hinter der Verzweigung** — einmal für den
einstufigen Weg, einmal im zweiten Schritt. **Eine halb gelungene Anmeldung ist
kein Erfolg.** Stolperstein 160; Rückbau 99 färbt die Stelle rot.

*Der Auftrag hatte danach ausdrücklich gefragt: „Prüf ausdrücklich, ob der
zweite Schritt überhaupt in die Bremse fällt — er hat einen anderen Weg als
`POST /api/login`." Er tut es nicht von selbst, und er tat es auch nicht, als
die Zeilen dafür schon dastanden.*

### Befund C — die Reihenfolge im Objektliteral gab die falsche Zahl aus

`POST /api/zweifaktor/codes` antwortete mit
`{ ...zweifaktorStand(id), codes: erneuereWiederCodes(id) }`. **In einem
Objektliteral wird von links nach rechts ausgewertet** — der Stand wurde
gebildet, **bevor** die neuen Codes entstanden. Die Antwort meldete „noch 4 von
8" neben acht frischen Codes.

Aufgefallen an der Prüfung „Mit beidem entstehen acht frische Codes", die
`codesOffen === 8` verlangte und `4` bekam. Behoben: erst die Codes, dann der
Stand.

### Befund D — zwei Rückbauten rissen den Lauf ab, statt ihn rot zu machen

**Rückbau 89** („der verbrauchte Zähler wird nicht mehr geprüft") strich die
Bedingung `letzter_zaehler < ?` **samt ihrem Platzhalter**. Die vorbereitete
Anweisung bekam danach drei Werte für zwei Stellen, better-sqlite3 warf, der
Server starb — und der Lauf war nach 166 Sekunden **abgerissen**, ohne eine
einzige rote Prüfung.

**Derselbe Fall traf den Versuch, eine der beiden Tabellen aus der DDL zu
nehmen:** `auth.js` bereitet seine Anweisungen beim Laden vor, und „no such
table" beendet den Prozess, bevor irgendetwas geprüft ist.

**Ein Rückbau macht die Sache wirkungslos, er entfernt sie nicht.** Die
Bedingung steht jetzt als `(letzter_zaehler IS NULL OR ? IS NOT NULL)` da —
dieselbe Form, dieselbe Zahl der Stellen, nur immer wahr. Und statt der Tabellen
wird der **Index** daneben zurückgenommen, der dieselbe Aussage über
`CREATE … IF NOT EXISTS` trägt. Stolperstein 161, Fortschreibung von 138.

### Befund E — der Testvektor erreichte die obere Zählerhälfte gar nicht

Im Quelltext stand neben der geteilten Schreibweise des achtbytigen Zählers
(`writeUInt32BE` zweimal) als Begründung: *„der Testvektor T = 20 000 000 000
aus RFC 6238 läuft genau über diese Stelle."* **Nachgerechnet ist der Zähler
dort 666 666 666 und liegt weit unter 2³².**

**Die obere Hälfte war damit von keinem einzigen Vektor berührt**, und der
Rückbau darauf blieb folgerichtig ohne Wirkung. *Gefunden über die Gegenprobe,
nicht über die Prüfung* — genau dafür sind Gegenproben da.

**Gehalten wird sie jetzt gegen eine zweite Bauform statt gegen ein Papier:**
`writeBigUInt64BE` schreibt dieselben acht Bytes in einem Zug, und beide Wege
müssen für Zähler über 2³² dasselbe ergeben — samt der Gegenlage, dass
verschiedene Zähler auch verschiedene Codes ergeben. Der Kommentar im Quelltext
ist berichtigt. Stolperstein 162.

### Befund F — die Bremse am zweiten Schritt war gebaut und trotzdem unbeweisbar

**Rückbau 97 („die Bremse fehlt am zweiten Schritt") blieb vollständig
STUMM** — und der Code war dabei richtig.

**Die Ursache liegt in der Reihenfolge.** Die Route hatte die Bremse **hinter**
dem Verbrauch des Ausweises: erst Ausweis prüfen, dann Bremse fragen. Fachlich
vertretbar — aber sobald die Sperre steht, fällt schon **Schritt 1** mit 429
aus, und eine Prüfschleife über beide Schritte sieht dieselbe 429 mit und ohne
die Zeilen im zweiten. **Die Prüfung prüfte das schwächste Glied der Kette,
nicht das gemeinte.** Und weil ein gesperrter Aufrufer mit erfundenem Ausweis
eine 401 über den Ausweis bekam, war die Sperre am zweiten Schritt von außen
überhaupt nicht mehr zu sehen.

**Zwei Änderungen zusammen haben es behoben.** Die Bremse steht jetzt **ganz
vorn** in der Route — dieselbe Reihenfolge wie an `POST /api/login` und
`POST /api/bestaetigung`, und ein gesperrter Aufrufer bekommt überall dieselbe
429. Gezählt wird dort mit der **IP-Hälfte**: der Name ist vor dem Ausweis nicht
bekannt, und ihn aus dem Rumpf zu nehmen wäre genau die Nummer aus dem Rumpf,
die es hier nicht geben darf. *Die harte Sperre hängt ohnehin allein an der
Adresse; die verzögernde Namenshälfte hat der Aufrufer in Schritt 1 bereits
bezahlt, und gefüttert werden unten weiterhin beide.*

**Und die Prüfung fragt den zweiten Schritt jetzt unmittelbar**, mit einem
erfundenen Ausweis: trägt die Bremse, kommt 429, bevor der Ausweis angesehen
wird; trägt sie nicht, kommt die 401. **Dazu die Gegenlage vorher** —
ungesperrt antwortet derselbe Ruf mit 401 (Stolperstein 81) — und ein zweiter
Rückbau (123), der allein die **Reihenfolge** zurückdreht.

**Die Zahl der Durchgänge ist dabei ausgerechnet, nicht geraten:** der Ruf der
Gegenlage zählt bereits einen Fehlversuch, neun weitere machen zehn, und beim
zehnten fällt die Sperre. Ein Durchgang mehr liefe schon in Schritt 1 hinein
und prüfte etwas anderes, als die Zeile sagt.

*Das ist der zweite Fund dieser Runde, der an der Bremse hängt — und der
lehrreichere: bei Befund B war die Zusage gebrochen, hier war sie erfüllt und
nur nicht belegbar.* Stolperstein 163.

### Befund G — der Auftrag nennt für einen Schnitt eine Nummer aus dem alten Schema

Der Auftrag sagt unter „Wird es zu viel für einen Durchgang": *„der Rest würde
0.9.11."* **Unter Semantic Versioning ist der Rest eine neue Funktion und damit
MINOR**, nicht PATCH — er hieße 0.11.0 und schöbe „Suche und Bestand" weiter.
Gegenstandslos, weil kein Schnitt gefahren wurde; hier festgehalten, damit die
Zahl nicht später als Vorbild dient.

### Befund H — der alte Fahrplan steht weiterhin im Änderungsprotokoll 0.9.1

`Doku/Aenderungsprotokoll_0.9.1.md`, Abschnitt 10, trägt noch die Nummern
0.9.10, 0.9.20, 0.9.30, 0.9.60 und 0.9.90. **Das ist richtig so und bleibt:**
was einmal draußen war, wird nicht umgeschrieben (Semantic Versioning, Punkt 3).
**Hier festgehalten, damit es niemand später „berichtigt".** Der geltende
Fahrplan steht im Projektstand, Abschnitt 10.

### Befund I — `CHANGELOG.md` war aus dem Blick des Sprachwächters gefallen

Der Sprachwächter sieht `Doku/*.md` und `README.md` an. **Als die Datei mit
dieser Runde von `Doku/Changelog.md` ins Wurzelverzeichnis zog, fiel sie damit
still heraus** — genau die Datei, in der von nun an bei jeder Version deutsche
Prosa für den Betreiber entsteht.

Aufgefallen ist es beim Nachziehen der Wortliste, nicht an einer roten Prüfung:
die Zahl der angesehenen Dokumente stand auf „mindestens zehn", und die war
weiter erfüllt. **Eine Zahl allein sieht nicht, WELCHE Datei fehlt.** Neben ihr
steht deshalb jetzt eine Zeile, die **README.md und CHANGELOG.md namentlich**
verlangt — zwei Zeilen sagen zusammen, was eine nicht sagen kann
(Stolperstein 156).

*Verwandt mit Stolperstein 113 und mit der Zahl in `F_ROUTEN`: wer eine Liste
prüft, prüft ihre Länge UND ihre Ränder.*

### Befund J — am Konzeptpapier wird nichts falsch

**Nachgesehen, wie der Auftrag es verlangt.** Der eine bindende Satz aus Teil
III trägt unverändert; der Kopf sagt „gebaut bis Version 0.9.1", und das bleibt
wahr — er beschreibt den Stand, bis zu dem das Papier trägt, und der zweite
Faktor ist keine Stufe daraus. **Das Papier ist nicht angefasst und nicht
umbenannt worden.**

---

## 5. Neue Stolpersteine

**Die Zählung setzt bei 159 fort; 149 bis 158 sind vergeben.**

* **159** — Wer eine zweite Schranke vor die Anmeldung setzt, sucht ALLE Wege
  dahinter, und einer davon ist der Rücksetzlink. *(Befund A)*
* **160** — Ein Erfolg, der noch keiner ist, darf den Zähler der Bremse nicht
  löschen. *(Befund B)*
* **161** — Ein Rückbau, der die Zahl der Platzhalter ändert, reißt den Lauf ab
  statt ihn rot zu machen. *(Befund D, Fortschreibung von 138)*
* **162** — Ein Testvektor belegt nur, was er wirklich durchläuft, auch wenn
  seine Zahl groß aussieht. *(Befund E)*
* **163** — Eine Schranke, die erst hinter einer anderen Absage steht, lässt
  sich von außen nicht mehr belegen. *(Befund F)*

Der Wortlaut steht im Projektstand, Abschnitt 6.

---

## 6. Der Prüfstand

**Sechzehn neue Gruppen**, davon vierzehn am Server und zwei an der Oberfläche.

**Die Codes werden gegen die Testvektoren aus RFC 6238 geprüft, nicht gegen die
eigene Rechnung** — sonst prüfte die Anlage sich selbst. Alle sechs, sechs- und
achtstellig; dazu der Base32-Rundlauf gegen den Vektor aus RFC 4648 und die
Nachschau, dass ein Zeichen außerhalb des Alphabets `null` ergibt und keine
Ausnahme. **Jeder der vier Kennwerte wird einzeln festgenagelt.**

**Jede Lage bekommt ihren eigenen Zugang.** Der verbrauchte Zähler steht je
Zugang, und zwei Lagen an einem Zugang verdeckten einander (Stolperstein 154).
Das Zeitfenster läuft deshalb über **vier** Zugänge — davor, laufend, danach,
übernächstes.

**Der Prüfstand wartet auf ein ruhiges Fenster, statt fest zu schlafen.** Er
rechnet Codes aus und schickt sie an einen Server, der SEINE Uhr liest; fiele
die Grenze der dreißig Sekunden dazwischen, würde aus einem Code fürs
übernächste Fenster einer fürs nächste, und eine Prüfung würde **zufällig rot**
(Stolperstein 151).

**Die Bremsprobe läuft zuletzt an ihrem Server** — die harte Sperre gilt fünf
Minuten je Adresse, und alles danach liefe in sie hinein. Dieselbe Überlegung
wie bei der Bremsprobe von 0.9.1.

**Die neue Portbasis ist 6600 und ausgerechnet, nicht geschätzt.** Bei 52
vorhandenen Basen war sie das einzige freie Fenster ohne gesperrte Nummer: die
Lücke 6550–6699 trägt 6566 darunter und 6665 darüber, **6600–6659 liegt sauber
dazwischen**. Sie liegt **innerhalb** der bestehenden Spanne, die deshalb bei
2980 bleibt (`VERSATZ_STUFE` ist 3000). Alle vier Nebenspuren nachgerechnet:
9600, 12600, 15600 — frei, und die höchste Nummer bleibt unter 32768. **Es sind
jetzt 53 Basen**, und der Wächter am Ende des Laufs kennt die Zahl.

**Kein Migrationsabschnitt — es gibt keinen Block.** Beide Tabellen werden von
Hand aus einer bestehenden Anlage entfernt, der Server startet einmal, und
beide sind wieder da — samt Index, samt gleichem Schema wie in einer frischen
Anlage, samt der Gegenlage, dass eine **Spalte** nicht nachwächst. Dazu die
Zählung der markierten Blöcke: **fünf**, über die verschiedenen Marken und
nicht über ihre Vorkommen (jede steht zweimal in `db.js`).

**Das Geheimnis wird an vier Orten gesucht**, die Wiederherstellungscodes an
denselben — samt der Gegenlage, dass die Suche findet, was dort stehen muss.

**`zugang.js zweifaktor` läuft als echter Prozess**, mit geröhrter Eingabe und
beantworteter Rückfrage, danach die Nachschau in der Datenbank.

**Der DOM-Mock zieht wirklich mit** (Stolperstein 90): einschalten macht „an",
ausschalten macht „aus", die Zahl der Codes ändert sich, ein falscher Code wird
abgewiesen, und der zweite Anmeldeschritt gibt bei falschem Code einen frischen
Ausweis heraus — genau wie der Server. **Und er bringt nicht selbst mit, was die
Prüfung belegen soll** (Stolperstein 102): die Zusagen an der echten
Serverantwort stehen in den vierzehn Servergruppen.

**Der Handgriff im README wird jetzt geprüft statt gepflegt.** Er zählt die
Dateien auf, über die der Fingerprint geht, und ist der einzige Weg, eine
abweichende Datei beim **Namen** zu nennen (Stolperstein 158) — wer ihn
braucht, braucht ihn im Ernstfall. **Mit `zweifaktor.js` hätte er eine Datei zu
wenig genannt.** Der Wächter hält ihn gegen den **abgeleiteten** Modulgraphen
und nicht gegen eine zweite gepflegte Liste, in beide Richtungen: keine fehlt,
keine steht zu viel da, und `package.json` samt `public/*` sind eigens
verlangt.

**Gedrückt wird per `dispatchEvent` samt Durchlauf des Event Loops**
(Stolperstein 61) — für den Anmeldeknopf, den zweiten Schritt und jeden der
fünf Knöpfe in der Karte.

---

## 7. Gegenprobentabelle

GEGENPROBENTABELLE_PLATZHALTER

---

## 8. Prüfungszahlen

| | |
|---|---|
| Vorher (0.9.1) | 3451 |
| Nachher (0.10.0) | **3676** |
| Neu | **225** |
| Gegenproben | **42** |

---

## 9. Was ausdrücklich nicht passiert ist

* **Kein Code geht hinaus.** Kein zweiter Faktor per Mail, keiner per SMS — die
  Anlage verschickt dafür nichts.
* **Kein Migrationsblock.** Es bleibt bei fünf markierten.
* **Keine neue `.env`-Zeile**, und die `docker-compose.yml` ist unberührt.
* **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
  `npm ls --omit=dev` steht unverändert bei 122 Pfaden.
* **Keine neue Karte.** Es bleibt bei neunzehn im Systembereich.
* **Kein neues Merkmal im Sicherheitsprotokoll.** `MERKMALE` bleibt dreizehn.
* **Kein achter Zweck der zweiten Bestätigung.** `BESTAETIGUNG_ZWECKE` bleibt
  sieben — es ist eine zweite Frage an derselben Stelle, kein neuer Weg.
* **Kein vierter Vorgang für den falschen Code.** Eine gescheiterte zweite Stufe
  *ist* eine gescheiterte Anmeldung und schreibt `anmeldung.fehl`.
* **Die Formatnummer bleibt bei 10**, das Vokabular bei elf.
* **Die Anmeldebremse behält ihre Kennwerte** — fünf, zehn, fünf Minuten.
* **Der Tokenweg aus 0.8.80 behält seine Fristen** — sieben Tage, fünfzehn
  Minuten ab dem ersten Öffnen, dieselbe eine Absage.
* **Kein Admin schaltet einen fremden zweiten Faktor ein oder aus**, und es gibt
  gar keine Adresse dafür.
* **`mail.js`, `anhaenge.js`, `keys.js`, `schluessel.js` und `schluessel.sh`
  sind unberührt.**
* **Das Konzeptpapier ist nicht angefasst und nicht umbenannt worden.**
* **Farbschema, `katalog.sqlite`, `HINTER_PROXY`, die Content-Security-Policy,
  das Austauschformat, der Papierkorb, die Sicherung, `ordneBestandZu()` und die
  Rollenleiter sind unangetastet.** Auch die beiden SVG-Dateien: **die Marke
  behält ihr Gold**, und das steht jetzt als Entscheidung im Projektstand,
  Abschnitt 5.

---

## 10. Offen geblieben

* **Ob 0.10.0 im Feld läuft.** Eingespielt ist noch nichts. Der Rundlauf, der
  die Runde belegt — einschalten, abmelden, mit Code anmelden, einmal mit einem
  Wiederherstellungscode —, gehört danach in den Projektstand, Abschnitt 2.
* **Der QR-Encoder als eigene Runde.** Begründung und Maße stehen in
  Abschnitt 2, Abweichung A, und im Projektstand, Abschnitt 10.
* **Ob ein Admin den zweiten Faktor VERLANGEN kann.** Der Auftrag hat die Frage
  ausdrücklich nicht gestellt; sie ist offen und nicht entschieden.
* **Der Schlüsselwechsel auf der echten Anlage.** Geprobt, gefahren noch nicht.
  Er braucht keine Runde und keinen Auftrag.
* **Eine Zeile in der Karte „Anlage", die die abweichende Datei beim Namen
  nennt.** Vorgemerkt für die nächste Nacharbeitsrunde.
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB.**
* **Die Eindeutigkeit der Adresse** ist weiterhin nicht erzwungen.

---

**0.10.0 — Fingerprint `FINGERPRINT_0100`**
