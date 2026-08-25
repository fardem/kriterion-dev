# Änderungsprotokoll 0.9.0 — „Der Server verschickt selbst"

**Version 0.9.0 · gebaut am 25. August 2026 · erste Hälfte von Stufe I des
Mehrbenutzerbetriebs · keine Datenbankstufe**

**Bis 0.8.91 hat die Anlage nur auf Anfragen geantwortet. Ab dieser Version
baut sie von sich aus eine Verbindung zu einem fremden Server auf.** Das ist
eine Änderung der Betriebsart und nicht eine weitere Funktion — jede
Entscheidung dieser Runde steht unter dieser Überschrift.

**Und der Satz, der über allem steht, ist unverändert wahr geblieben:** wer
keinen Mailzugang einträgt, verliert nichts. Die Links stehen weiter im
Verwaltungsbereich zum Kopieren, und eine Anlage ohne Mail läuft nach dem
Einspielen genau so vollständig wie vorher.

**Der Abbruchpunkt ist gezogen worden.** Das Konzeptpapier nennt ihn für Stufe I
seit Langem — *„nach dem Versand, vor der Selbstregistrierung"*. Er ist nicht
als Notausgang gemeint, sondern als Bauform, und er ist gebraucht worden: mit
dem Mailversand, dem fehlenden Schreibweg für `users.email` und der Frist ab
dem ersten Öffnen wurde die Runde zu breit für einen Durchgang. **Die
Selbstanmeldung ist 0.9.1.**

**Drei Entscheidungen weichen vom Auftrag ab**, alle vor dem Bau besprochen und
bestätigt. Sie stehen in Abschnitt 2.

---

## Inhalt

1. [Was gebaut wurde, je Datei](#1-was-gebaut-wurde-je-datei)
2. [Die Abweichungen vom Auftrag](#2-die-abweichungen-vom-auftrag)
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

### `mail.js` — neu

Das erste neue serverseitige Modul seit `schluessel.js`. Es bewegt den
Fingerprint, und das ist beabsichtigt.

* **`ANBIETER`** — sechs Vorlagen (GMX, Web.de, Gmail, Strato, IONOS und
  „eigener Server") nach dem Muster der Suchanbieter: eine gepflegte Liste im
  Quelltext, kein Freitext. `'eigen'` steht **mit in der Liste** und ist doch
  keine Vorlage; es als *Fehlen* eines Eintrags zu bauen wäre eine zweite
  Wahrheit daneben.
* **`HINWEISE` und `HINWEIS_IMMER`** — die drei Anbieterhinweise stehen hier
  und nicht in `app.js`: sie hängen am Anbieter, und der Server kennt die
  Liste. Zwei Ausfertigungen liefen auseinander, sobald ein Anbieter dazukommt.
* **`loeseAuf()`** — die Vorlage gewinnt über das Gespeicherte, außer bei
  `'eigen'`. Wechselt ein Anbieter morgen den Port, kommt der neue aus dem
  Quelltext; eine Kopie in der Datenbank wäre eingefroren.
* **`zustand()`** — was die Karte sieht. **Das Passwort kommt hier nie heraus**,
  nur `passwortGesetzt`.
* **`pruefeEingabe()`** — wirft mit Klartext; der Aufrufer gibt die Meldung
  unverändert weiter. Ein **leeres** Passwortfeld heißt „unverändert".
* **`marke()`** — ein Hash über den ganzen Zugang, mit dem sich „seit dem Test
  hat sich nichts geändert" belegen lässt. Trägt das Passwort weder im Klartext
  noch als Länge.
* **`versende()`** — **liefert ein Ergebnis, wirft nie.** Das ist die bauliche
  Form des Satzes „E-Mail ist eine Bequemlichkeit": ein Aufrufer, der ein
  `try` vergisst, könnte sonst den Tokenweg mitreißen.
* **Die Frist:** `VERSAND_MS` = 20 s als **äußerer Wettlauf** über dem ganzen
  Versand, dazu `connectionTimeout` und `greetingTimeout` bei 7 s und
  `socketTimeout` bei 20 s. **Die äußere Schranke ist die tragende**, und der
  Unterschied ist nachgestellt: die drei darunter sind Fristen je Abschnitt und
  eine auf **Untätigkeit** — jedes zugestellte Byte setzt `socketTimeout`
  zurück. Die drei bleiben trotzdem stehen; sie sind der schnellere Weg.
* **Die drei Mailtexte** — Einladung, Rücksetzung, Testmail. Reiner Text.

### `auth.js`

* **`legeZugangAn()`** nimmt eine Adresse entgegen und schreibt sie in
  `users.email`. Geprüft **vor** dem Anlegen.
* **`aendereZugang()`** nimmt die eigene Adresse entgegen — hinter dem
  bisherigen Passwort, wie Name und Passwort daneben. `undefined` heißt „nicht
  angefasst", der leere String „löschen".
* **`MERKMALE`** bekommt `'adresse'` (zwölf → dreizehn). Die Ableitung des
  Merkmals in `aendereZugang` wird **gezählt** statt verschachtelt: drei
  ineinandergeschobene Fragezeichen wären beim vierten Feld unlesbar;
  `'beides'` heißt weiterhin „mehr als eines".
* **`BESTAETIGUNG_ZWECKE`** bekommt `'mail'` (sechs → sieben).
* **`TOKEN_FRIST_MINUTEN` und `beginneTokenFrist()`** — die Frist ab dem ersten
  Öffnen. Schreibt `tokens.ablauf` **ausschließlich herunter**, nie hinauf; die
  Klemme steht im `WHERE` und nicht im Aufrufer.
* **Berichtigt:** der Kommentar zur zweiten Bestätigung sprach von „zwei der
  sechs Wege" — es sind jetzt sieben.

### `server.js`

* **`versendeTokenLink()`** — der Versand eines Tokenlinks, mit den drei
  Zuständen `'ok'` / `'fehlgeschlagen'` / `'aus'` und dem Grund daneben. Die
  Reihenfolge der drei Absagen ist die Reihenfolge, in der der Admin sie
  beheben würde: kein Mailzugang, keine öffentliche Adresse, keine Adresse am
  Zugang.
* **`GET /api/mail`** (`nurEigentuemer`, lesend — **nicht** in `F_ROUTEN`),
  **`PUT /api/mail`** (`nurEigentuemer`, zweitbestätigt) und
  **`POST /api/mail/test`** (`nurEigentuemer`). `F_ROUTEN` 57 → 59.
* **`POST /api/users`** nimmt `email` entgegen und verschickt die Einladung.
* **`POST /api/users/:id/token`** verschickt ebenso; beide Antworten tragen
  `link`, `linkQuelle`, `minuten`, `versand` und `versandGrund`.
* **`GET /api/account`** liefert die eigene Adresse, **`PUT /api/account`**
  setzt sie.
* **`POST /api/token/pruefen`** startet die Frist — und **nur hier**:
  `auth.pruefeToken` wird auch von `loeseTokenEin` gerufen, und das Einlösen
  darf sie nicht noch einmal anfassen.
* **Die Startzeile** nennt Anbieter, Server, Port, Verschlüsselung und
  Absender — **nie das Passwort**, auch nicht seine Länge.
* **Berichtigt:** zwei Kommentare sprachen von „sieben Wegen über sechs
  Routen", obwohl es sechs über fünf waren (Stolperstein 137, in Revision 20
  der Papiere berichtigt, im Quelltext übersehen). Mit `'mail'` stimmt die Zahl
  jetzt wieder — diesmal aus dem richtigen Grund.

### `public/app.js`

* **Die Karte „Mailversand"** — die achtzehnte, beim **Eigentümer**. Anbieter,
  Server, Port, Verschlüsselung, Benutzer, Passwort, Absender, die drei
  Hinweise, der Zustand der öffentlichen Adresse, die letzte erfolgreiche Probe
  und der Testmail-Knopf. Bei einer Vorlage sind Server, Port und
  Verschlüsselung **gesperrt statt versteckt**: wer GMX gewählt hat, soll
  *sehen*, wohin geschickt wird.
* **Das Adressfeld in der Karte „Zugang"** — für jeden, denn die Adresse gehört
  dem, der sie hat.
* **Das Adressfeld beim Anlegen** in der Karte „Zugänge".
* **`versandZeile()`** — der Versandzustand **neben** dem Link, nie anstelle
  von ihm. Die Adresse des Empfängers steht dabei ausdrücklich **nicht** da.
* **Der Linkkasten** nennt die Frist ab dem ersten Öffnen.
* **Die Einladungsseite** nennt die Frist — und unterscheidet seit dieser Runde
  die **endgültige** Absage (400, Adresse wird geleert) von der
  **vorübergehenden** (alles andere, Schlüssel bleibt stehen, zweiter Anlauf
  als Knopf). Das ist Befund G, siehe Abschnitt 4.

### `public/style.css`

Regeln für den Versandzustand (`.zug-versand`, grün/rot/grau) und die Karte
(`.mail-gut`, `.mail-aus`, `.mail-erfolg`).

### `.env.example`

**Kein neuer Wert.** Zwei erklärende Abschnitte: dass `OEFFENTLICHE_ADRESSE`
seit 0.9.0 den Versand trägt, und dass der Mailzugang **nicht** hier steht,
sondern im Systembereich beim Eigentümer — samt der Begründung.

### `package.json` / `package-lock.json`

Version auf `0.9.0`, `nodemailer` als Laufzeitabhängigkeit aufgenommen und über
das Lockfile festgenagelt.

### `pruefung.js`

Der SMTP-Empfänger aus `net` (fünf Betriebsarten, dekodiert
`quoted-printable`), elf neue Gruppen, die Erweiterung der vorhandenen, und die
beiden Wächter über den Prüfstand selbst um die neue Portbasis erweitert.
Einzelheiten in Abschnitt 6.

### `gegenprobe.js`

Die Liste der Rückbauten ist auf diese Runde umgestellt: **33 statt 18**.

### `db.js`

**Unberührt.** 0.9.0 ist keine Datenbankstufe.

### `schluessel.js`, `schluessel.sh`, `zugang.js`, `anhaenge.js`, `keys.js`

**Unberührt**, wie der Auftrag es verlangt.

---

## 2. Die Abweichungen vom Auftrag

### A — Der Mailzugang liegt in der Oberfläche, nicht in der `.env`

**Der Auftrag sah die `.env` vor**, mit einer Begründung, die schärfer ist als
die für die öffentliche Adresse: der SMTP-Server sieht **jede** Mail, und jede
trägt einen Link, der ein Passwort setzt. Dürfte ein Admin den Server
eintragen, liefe die Rücksetzmail des Eigentümers über einen Server seiner
Wahl.

**Die Begründung trägt — sie trifft aber den Admin, nicht den Eigentümer.**
Über dem Eigentümer steht niemand: wer ohnehin den ganzen Bestand exportieren
und den Schlüsselwert sehen darf, gewinnt durch einen umgebogenen Mailserver
nichts dazu. Gebaut ist deshalb: **die Felder trägt nur der Eigentümer ein,
hinter der zweiten Bestätigung; ein Admin sieht die Karte gar nicht.**

**Zwei Dinge sprechen sogar dafür, und beide sind nachgesehen statt
angenommen:**

* Das Mailpasswort liegt damit in der **verschlüsselten Datenbank** statt
  unverschlüsselt in der `.env` auf dem Wirt.
* Die **Exportdatei trägt es nicht** — nachgesehen in `GET /api/export`: der
  Export packt `items` samt Anhängen, keine Einstellungen.

**Was der Admin stattdessen bekommt, und es ist genug:** das Feld `versand`
samt Grund neben dem Link, in genau dem Augenblick, in dem es ihn angeht. Eine
Karte, die ihm dasselbe schon vorher sagte, wäre bequemer und könnte ihm
Anbieter, Server und Benutzernamen des Eigentümers nennen; das ist der Tausch,
der hier nicht gemacht wird.

**Zwei Folgen:** `BESTAETIGUNG_ZWECKE` geht von sechs auf sieben, und **die
Ausnahme von der `.env`-Regel entfällt** — der Auftrag verlangte, sie
ausdrücklich als Ausnahme hinzuschreiben; sie wird nicht gebraucht.

**Und eine dritte, die dem Konzeptpapier guttut:** damit kommen wir auf seinen
**Wortlaut** zurück (*„Auswahlliste mit Vorlagen plus eigener Server, nach dem
Muster der Suchanbieter"*). Die Abweichung, die der Auftrag an dieser Stelle
selbst benannt hatte, fällt weg.

**Was ausdrücklich NICHT gebaut ist: beides nebeneinander.** „`.env` gewinnt,
sonst die Oberfläche" wären zwei Wahrheiten über dieselbe Sache
(Stolperstein 47).

### B — Die öffentliche Adresse ist Pflicht für den Versand, nicht für den Start

Das Konzeptpapier sagt „ab Stufe I ist sie **Pflicht**". Wörtlich gelesen hieße
das: ohne sie startet die Anlage nicht. **Gebaut ist die engere Auslegung**, und
der Auftrag neigte selbst dazu: ein Startabbruch bräche **jede vorhandene
Installation** beim Einspielen dieser Version — genau das, was der Einspielweg
nie tun darf.

Ohne sie wird **nicht verschickt**, die Karte sagt warum, und der Link steht wie
immer daneben. Die Abweichung ist im Konzeptpapier nachgezogen.

### C — Der Token bekommt eine zweite Frist

Der Auftrag ist deutlich: *„Der Tokenweg aus 0.8.80 wird geerbt, nicht
umgebaut. Wer daran etwas ändern will, hält an und fragt."* **Es ist angehalten
und gefragt worden**, und die Ergänzung ist bestätigt.

**Ab dem ersten Öffnen bleiben fünfzehn Minuten.** Die Begründung ist die
Trennung zweier Fragen, die bis dahin zusammenfielen: **die sieben Tage sind die
Frist fürs Lesen der Mail, nicht fürs Liegen des Links.** Solange niemand
geöffnet hat, ist nichts geschehen. Ab dem ersten Öffnen ist erwiesen, dass der
Link angekommen ist — und dann hat er in einem fremden Postfach nichts mehr
verloren, wo er sechs Tage lang ein Passwortersatz wäre.

**Warum das hier trägt und anderswo nicht:** der übliche Killer kurzer Fristen
sind Vorschaudienste, die Links im Postfach vorab abrufen und sie verbrennen,
bevor ein Mensch sie sieht. **Der Schlüssel steht im Fragment
(`#/einladung/…`) und geht nie an den Server** — ein Vorschaudienst holt nur
die Seite und löst die Frist damit gerade **nicht** aus. Sie beginnt erst, wenn
ein echter Browser ihn im Rumpf schickt. Das ist ein Vorteil, den die Bauform
aus 0.8.80 verschenkt hat, ohne es zu wissen.

**Was sie nicht leistet, und das gehört dazu:** sie schützt nicht gegen den, der
das Postfach mitliest — der klickt zuerst. Sie macht seinen Zugriff
**sichtbar**, weil der echte Empfänger vor einem toten Link steht.

**Fünfzehn statt der zuerst genannten fünf**, und der Grund ist banal: einen
Eintrag im Passwortspeicher anzulegen dauert öfter länger als fünf Minuten.

**Drei Punkte, an denen die Sache kippen würde, und sie sind gebaut:**

* **Innerhalb der Frist darf beliebig oft geöffnet und neu geladen werden** —
  nur der **erste** Aufruf schreibt herunter. Der zweite sieht einen Ablauf, der
  näher liegt als die Frist, und rührt ihn nicht an.
* **Die Absage bleibt die eine** aus 0.8.80 und nennt die Frist nicht. Eine
  eigene Meldung wäre eine Auskunft an den, der rät.
* **Der Zugang bleibt stehen**, wenn die Frist verstreicht. Einen vom Admin
  bereits angelegten Zugang wegen eines abgelaufenen Zeitgebers zu entfernen
  wäre die härtere und überraschendere Wahl.

**Gebaut ohne neue Spalte und damit ohne sechsten Migrationsblock:** geschrieben
wird `tokens.ablauf`, die es längst gibt. Der Preis, ehrlich benannt —
hinterher ist nicht mehr zu sehen, **ob** ein Link schon einmal geöffnet wurde,
nur noch, wann er abläuft. Eine eigene Spalte dafür wäre ein Block gewesen, und
der Gewinn hätte ihn nicht getragen.

### D — Ein Schreibweg für `users.email`, den der Auftrag nicht vorsah

Das ist keine Geschmacksfrage, sondern der Befund, ohne den die Runde
stillgestanden hätte — er steht als Befund A in Abschnitt 4.

---

## 3. Die Fragen aus dem Auftrag, beantwortet

**Punkt 0 — eine Runde oder zwei?** Eine Runde mit dem Abbruchpunkt als
Rückfallposition, und **der Abbruchpunkt ist gezogen worden**. Er ist vorher
angekündigt worden, wie verlangt.

**Punkt 0 — braucht die Runde einen Werkzeugpunkt?** Nein. Der SMTP-Empfänger
gehört zu Punkt 1 und kommt aus `net`.

**Punkt 0 — wo endet die erste Hälfte?** Sie endet, wenn eine Einladung aus
0.8.80 als Mail beim Empfänger ankommt und der Link daneben trotzdem zum
Kopieren dasteht. **Beides ist geprüft**, am echten SMTP-Gespräch.

**Punkt 1 — die neue Abhängigkeit, nachgemessen statt geglaubt.**
`nodemailer@9.0.5`: `npm ls --omit=dev` liefert **+1 Paket, keinen Unterbaum**
(121 → 122 Pfade), `node_modules/nodemailer` = **776 KB**, Lizenz `"MIT-0"` aus
dem `package.json` des Pakets selbst. **Der Baum ist flach** — kein Anhalten,
und `net` plus SMTP von Hand ist nicht nötig geworden. Die Zahl steht im
Prüfstand fest.

**Punkt 1 — wo liegen die Zugangsdaten?** Abweichung A.

**Punkt 1 — und wo bleibt die Auswahlliste?** In der Oberfläche, wie das
Konzeptpapier es ursprünglich beschrieb. Die vom Auftrag vorgeschlagene
Zwischenform (`MAIL_ANBIETER=gmx` in der `.env`) wird nicht gebraucht.

**Punkt 1 — was zeigt die Oberfläche, und für wen?** Eine neue Karte
„Mailversand", siebzehn werden achtzehn. **Für den Eigentümer**, nicht für den
Admin — siehe Abweichung A.

**Punkt 1 — wohin geht die Testmail?** An die eigene Adresse des Anfordernden
und nirgendwo sonst. **Es gibt kein Adressfeld**, und der Rumpf wird gar nicht
angesehen; ein mitgegebenes Feld ändert deshalb nichts — geprüft in Rumpf,
Abfrage und Kopf. Hat der Zugang keine Adresse, wird abgesagt, mit dem Weg
dorthin.

**Punkt 1 — die öffentliche Adresse: Pflicht wofür?** Abweichung B.

**Punkt 1 — was steht in der Mail?** Reiner Text, kein HTML, keine Bilder,
keine Zählpixel, keine Anhänge. Wer die Anlage ist, wozu der Link dient, sieben
Tage, einmal einlösbar, **fünfzehn Minuten ab dem ersten Öffnen**. Der Link
steht im Fragment.

**Punkt 1 — was, wenn der Versand hängt? Die Frist als Zahl.**
**Zwanzig Sekunden.** Hergeleitet: ein vollständiges SMTP-Gespräch über TLS
sind rund acht Umläufe (Verbindung, TLS, Gruß, EHLO, AUTH, MAIL FROM, RCPT TO,
DATA/QUIT); bei schlechten 300 ms Umlaufzeit ist das unter drei Sekunden.
Zwanzig gibt dem den achtfachen Abstand und bleibt weit unter dem, was Browser
und Proxy von sich aus abbrechen.

**Warum eine äußere Schranke und nicht nodemailers eigene Fristen — nachgestellt
statt geglaubt.** Dessen Vorgaben sind ohnehin unbrauchbar (zwei Minuten für die
Verbindung, dreißig Sekunden für den Gruß, **zehn Minuten** für den Socket) und
sind deshalb auf 7 / 7 / 20 Sekunden gesetzt. **Aber sie sind Fristen je
Abschnitt und eine auf Untätigkeit:** `socketTimeout` läuft ab, wenn der Socket
still liegt, und **jedes zugestellte Byte setzt es zurück**. Ein Empfänger, der
alle drei Sekunden ein Byte schickt und nie antwortet, hält es damit ewig am
Leben — **gemessen: nach 45 Sekunden hängt der Versand immer noch.** Nur ein
Wettlauf über dem **ganzen** Versand ist eine Frist auf die Gesamtdauer.
*Die drei darunter bleiben trotzdem stehen: sie sind der schnellere Weg — ein
toter Rechner scheitert nach sieben Sekunden statt nach zwanzig.*
Der Prüfstand **misst** die Schranke an genau diesem tröpfelnden Empfänger.

**Punkt 1 — was gehört ins Sicherheitsprotokoll?** Der Versand **nicht**. Eine
Zeile „Mail an X verschickt" wäre ein Zustellprotokoll, und die Adresse wäre
Freitext von außen. Der Anlass steht schon drin (`link.neu`). **Die Vorgänge
bleiben fünfzehn.**

**Punkt 3 — die Formatnummer.** Bleibt bei **10**. Der Mailzugang steht nicht
im Austauschformat, und die Exportdatei trägt überhaupt keine Einstellungen.
**Ausdrücklich gesagt, damit klar ist, dass die Frage gestellt wurde.**

**Punkt 3 — die Migrationsblöcke.** Es bleibt bei **fünf**. **0.9.0 ist keine
Datenbankstufe:** keine Tabelle, keine Spalte. Der Mailzugang liegt in
`settings`, `users.email` gibt es seit 0.6.0. **Ausdrücklich gesagt.**

**Punkt 3 — kein neuer Vokabeleintrag.** Die elf bleiben elf.

**Punkt 3 — `F_ROUTEN`.** Der Auftrag erwartete vier neue schreibende Routen
und 57 → 61. **Es sind zwei geworden: 57 → 59.** Die beiden anderen (die
Registrierungsanfrage und die Freischaltung) gehören zur zweiten Hälfte und
kommen mit 0.9.1. Die Ablehnung ebenso.

| Route | Art |
|---|---|
| `PUT /api/mail` | `'nurEigentuemer, zweitbestaetigt'` |
| `POST /api/mail/test` | `'nurEigentuemer'` |

`GET /api/mail` ist lesend und steht wie immer **nicht** in der Liste, obwohl
es einen Wächter trägt. **Und zwei Routen bewegen die Zahl ausdrücklich nicht,
obwohl sie etwas Neues tun:** `POST /api/users` nimmt eine Adresse entgegen und
`PUT /api/account` setzt die eigene — beide gibt es längst, und ihre
Rechtezeile hat sich nicht verschoben.

**Punkt 5 — die Portbasis des SMTP-Empfängers, ausgerechnet statt geschätzt.**
**6110**, Fenster 6110–6129. 5960 fiele aus (deckt 6000, X11), 6100–6109 gehört
der Fingerprintlage. Mit den drei Versätzen: 9110, 12110, 15110 — keine trifft
eine Sperrnummer, und die höchste bleibt unter 32768. **Die Basis geht über
dieselbe vermerkte Liste wie jede andere**, obwohl der Empfänger kein Kind ist:
eine Basis, die nicht über die Liste läuft, wird von keinem Wächter gesehen
(Stolperstein 139).

---

## 4. Befunde beim Bauen

### Befund A — `users.email` wurde von KEINER Stelle im Projekt geschrieben

**Die Spalte stand seit 0.6.0 im Schema und war tot.** Gelesen wird sie in
`holeZugang`, auf `NULL` gesetzt in `entferneZugang` — mehr nicht. Weder
`POST /api/users` noch `PUT /api/account` noch `zugang.js` noch der Import
füllten sie. Der Prüfstand hielt es sogar fest: *„Eine Adresse hat er nicht"*.

**Damit hätte die erste Hälfte ohne einen weiteren Griff stillgestanden:** die
Einladungsmail hätte keinen Empfänger gehabt, und die Testmail wäre für **jeden**
Zugang abgesagt worden. Der Auftrag sagt *„Hat der Zugang keine Adresse
hinterlegt, wird abgesagt, mit Begründung und dem Weg dorthin"* — **den Weg
dorthin gab es nicht.**

Gebaut sind **zwei** Wege und ausdrücklich kein dritter, und die Grenze zwischen
ihnen ist die Rollenleiter:

* **Beim Anlegen** (`POST /api/users`) darf der Admin eine Adresse mitgeben —
  den Zugang gibt es in diesem Augenblick noch nicht, also kann sie niemand
  selbst eintragen, und ohne sie hätte die Einladung keinen Empfänger.
* **Danach ändert sie allein der Betroffene** (`PUT /api/account`, hinter dem
  bisherigen Passwort).
* **`PUT /api/users/:id` bekommt sie nicht.** Ein Admin, der eine *bestehende*
  fremde Adresse umschreiben dürfte, böge den nächsten Rücksetzlink des
  Betroffenen auf ein Postfach seiner Wahl.
* **`GET /api/users` liefert sie nicht mit.** Ein Admin braucht für seine Arbeit
  die Zugänge, nicht die Postfächer — und deshalb steht die Adresse auch nicht
  in der Erfolgsmeldung neben dem Link.

**Keine neue Route.** `F_ROUTEN` bleibt davon unberührt.

### Befund B — „sieben Wege über sechs Routen" stand noch dreimal im Quelltext

Revision 20 der Papiere hat die Zahl berichtigt (Stolperstein 137). **Im
Quelltext stand sie weiter falsch** — `server.js:406`, `server.js:573` und ein
Kommentar in `pruefung.js`. `BESTAETIGUNG_ZWECKE` hatte sechs Einträge, und die
Aufrufstellen lagen auf fünf Routen. Berichtigt; mit `'mail'` stimmt die Zahl
jetzt wieder, diesmal aus dem richtigen Grund.

### Befund C — der Projektstand sagte „aktuell 56 Routen"

Abschnitt 11 nannte die Zahl der Routen mit **56**, obwohl `F_ROUTEN` seit
0.8.90 bei **57** liegt. Derselbe Stolperstein 137: ein Papier war beim
Nachziehen übersehen worden. Berichtigt, und der Absatz führt die Bewegung
jetzt bis 0.9.0 fort.

### Befund D — der Auftrag zitierte den falschen Stolperstein

Für „eine neue Tabelle braucht keinen Migrationsblock" nennt der Auftrag
**Stolperstein 20**; 20 ist „CSS-Längen werden beim Zurücklesen normalisiert".
Gemeint ist **13**, und `db.js` zitiert ihn an genau dieser Stelle richtig.
Ohne Folgen für den Bau — die Runde legt ohnehin keine Tabelle an.

### Befund E — 139 und 140 standen in Abschnitt 6 vertauscht

Reine Reihenfolge, keine Sache. Der Vollständigkeit halber genannt.

### Befund F — `require` in einer Funktion, vom Prüfstand gefunden

`mail.marke()` holte `crypto` per `require` **innerhalb** der Funktion. Der
Wächter „Kein Modul des Servers wird erst innerhalb einer Funktion geladen"
wurde sofort rot — zu Recht: ein solches `require` machte den Fingerprint
unvollständig. Nach oben gezogen. **Der Wächter hat genau getan, wofür er
gebaut ist**, und zwar beim ersten Lauf.

### Befund G — eine vorübergehende Absage warf den Schlüssel aus der Adresse

**Ein Befund aus dem Betrieb, nicht aus dem Prüfstand**, und er ist der Anlass
für Abweichung C gewesen: *„ich klicke drauf, gebe noch nichts ein, lade neu —
und der Link ist tot, ich muss neu generieren."*

**Serverseitig war alles in Ordnung.** Nachgestellt an einem echten Server:
dreimal `POST /api/token/pruefen` hintereinander → dreimal `200`; der Token
stirbt erst beim Einlösen.

**Der Fehler saß in der Oberfläche.** `showEinladung` machte bei **jedem**
`!res.ok` ein `location.hash = '#/'` — auch bei der `429` der Anmeldebremse.
Nachgestellt: zehn vertippte Anmeldungen von derselben Adresse, danach ein
Klick auf den **gültigen** Einladungslink →

```
Klick auf den gueltigen Link -> 429 {"error":"Zu viele Fehlversuche. Bitte in 300 Sekunden erneut versuchen."}
```

→ Fehlermeldung, Schlüssel aus der Adresse geworfen, Neuladen landet auf der
Anmeldeseite. **Der Link war nie tot — die Adresse war weg.**

**Behoben:** nur die **endgültige** Absage (`400` — die eine aus 0.8.80:
abgelaufen, verbraucht, erfunden, Zugang gesperrt, Frist verstrichen) leert die
Adresse. Bei allem anderen bleibt der Schlüssel stehen, und die Seite bietet
einen zweiten Anlauf als Knopf an; ein Neuladen trägt dann ebenfalls wieder.
**Bewusst kein Zeitgeber, der von selbst wiederholt:** die Bremse antwortet mit
einer Wartezeit, und ein Browser, der im Sekundentakt nachfragt, hält sie am
Leben statt sie ablaufen zu lassen. Stolperstein **141**.

### Befund H — der SMTP-Empfänger ließ sich nicht beenden

Beim ersten vollständigen Lauf mit den neuen Gruppen **blieb der Prüflauf
stehen** — ohne CPU, ohne Meldung, an genau der Stelle, an der die Empfänger
abgeräumt werden. `server.close()` hört nur auf zu **horchen** und wartet
danach auf das Ende aller offenen Verbindungen; die Betriebsarten „schweigt"
und „stumm" halten ihre Verbindung absichtlich offen.

**Behoben:** die offenen Verbindungen werden vermerkt und **vor** dem
`close()` abgeräumt. Dazu ein eigener Wächter am Ende des Laufs — der
vorhandene sieht nur **Kinder**, und der Empfänger ist keins. Stolperstein
**142**.

### Befund I — der Link stand im rohen Brief nicht

Die erste Probe suchte den Schlüssel im rohen Brief und fand ihn nicht. **Der
Code war richtig:** der Rumpf geht als `quoted-printable` hinaus, und eine
Adresse mit 64 Hexzeichen ist länger als die 76 Zeichen einer Zeile — sie
bekommt einen **weichen** Umbruch. Nachgestellt, dass die Dekodierung den
Schlüssel vollständig zurückgibt. **Der Prüfstand dekodiert seitdem wie ein
Empfänger**, und eine Gegenlage belegt, dass die Dekodierung überhaupt etwas
tut. Stolperstein **143**.

### Befund J — die Startzeile ließ sich am laufenden Server nicht prüfen

Die Prüfung „die Startzeile nennt Anbieter, Server und Absender" war rot,
obwohl die Zeile stimmte: der Server war **vor** dem Eintragen des Zugangs
hochgekommen und sagte zu Recht „nicht eingerichtet". **Geprüft wird sie
seitdem an einem Neustart** — dort steht sie im Betrieb schließlich auch.
Stolperstein **144**.

### Befund K — eine Portbasis lag auf der Sperrliste, gefunden vom Wächter

Die erste gewählte Basis für die Mailprüflagen war **5010** — und ihr Fenster
5010–5069 deckt **5060 und 5061** (SIP), beide auf der Sperrliste von `fetch()`.
Der Wächter aus 0.8.91 hat es beim ersten Lauf namentlich gemeldet, bevor eine
einzige Prüflage unerreichbar wurde. Umgerechnet auf **6430**. *Genau der Fall,
für den der Wächter gebaut wurde, und er ist beim ersten Gebrauch eingetreten.*

### Befund L — drei stumm gebliebene Gegenproben, und sie sagen Verschiedenes

**Rückbau 02** („der Link fällt aus der Antwort, wenn der Versand trägt") blieb
an `POST /api/users/:id/token` **vollständig stumm**. Der Grund ist
Stolperstein 102 zum dritten Mal: geprüft war der Link nur am **Anlegen**; die
Oberfläche liest ihn zwar auch an der Tokenroute, aber gegen den Mock — und der
bringt das Feld selbst mit. **Zwei Routen sind zwei Stellen, und die eine deckt
die andere nicht.** Nachgezogen: die Tokenroute wird jetzt am echten Server auf
`versand`, `link`, `linkQuelle` und `minuten` geprüft, samt der zweiten Mail
beim Empfänger.

**Rückbau 05** („die äußere Schranke über dem Versand fällt weg") blieb
ebenfalls stumm — und der Fund war **mein Rückbau**, nicht die Prüfung: er hängte
nur einen zusätzlichen, nie erfüllten Verlierer in den Wettlauf, statt die Frist
zu entfernen. Am Verhalten änderte das nichts. Berichtigt.

**Und dabei ist ein echter Mangel am BELEG herausgekommen.** Die Fristgruppe
maß bis dahin an einem Empfänger, der grüßt und danach schweigt — dort greift
aber **nodemailers eigenes `socketTimeout`** bei fast derselben Millisekunde,
und über die äußere Schranke war damit nichts bewiesen. Nachgestellt: ein
Empfänger, der alle drei Sekunden **ein Byte** schickt und nie antwortet, setzt
`socketTimeout` mit jedem Byte zurück — **nach 45 Sekunden hängt der Versand
immer noch.** Der Prüfstand hat seitdem eine sechste Betriebsart
(`'troepfelt'`), und *sie* ist die Lage, an der die äußere Schranke ihren Beleg
bekommt.

**Rückbau 06** („nodemailers Fristen stehen wieder auf ihren Vorgaben") bleibt
stumm, und das ist **entschieden, nicht übersehen**: die Zusage trägt die äußere
Schranke allein. Die drei Fristen darunter sind der schnellere Weg — ein toter
Rechner scheitert nach sieben Sekunden statt nach zwanzig —, aber sie tragen
nichts, was sonst fiele. Der Rückbau steht mit dieser Notiz in der Tabelle.

---

## 5. Neue Stolpersteine

Die Zählung setzt bei **141** fort; 134 bis 140 waren vergeben.

* **141** — Eine vorübergehende Absage darf den Schlüssel nicht wegwerfen.
* **142** — Ein `net`-Server, der absichtlich schweigt, lässt sich nicht mit
  `close()` beenden.
* **143** — Ein langer Link steht im rohen Brief umbrochen, und das ist richtig
  so.
* **144** — Eine Zeile, die beim Start geschrieben wird, lässt sich nicht an
  einem Server prüfen, der vor der Einstellung hochgekommen ist.

Die ausführlichen Fassungen stehen im Projektstand, Abschnitt 6.

---

## 6. Der Prüfstand

**Elf neue Gruppen:**

1. „Der Mailversand: das echte SMTP-Gespräch"
2. „Der Mailversand: das Offline-Prinzip in beide Richtungen"
3. „Der Mailversand: die Frist wird gemessen, nicht behauptet"
4. „Der Mailversand: die öffentliche Adresse ist Pflicht"
5. „Der Mailversand: das Passwort steht nirgends"
6. „Der Mailversand: die Testmail geht an die eigene Adresse"
7. „Der Mailzugang: wer ihn setzen darf"
8. „Der Token: die Frist ab dem ersten Öffnen"
9. „Der Versandzustand neben dem Link"
10. „Die eigene Adresse in der Karte ‚Zugang'"
11. „Die Karte ‚Mailversand'"

**Der SMTP-Empfänger kommt aus `net`, nicht aus dem Netz** — wenige Dutzend
Zeilen, keine zweite Entwicklungsabhängigkeit. **Er kann scheitern**, und das
ist der Punkt (Stolperstein 90): fünf Betriebsarten — annehmen, mit 550
ablehnen, gar nicht grüßen, grüßen und danach schweigen, sofort auflegen. Ein
Empfänger, der nur „ok" sagt, machte die Hälfte dieser Runde unprüfbar.

**Die Frist wird gemessen, mit einer Untergrenze.** Der Empfänger, der grüßt
und dann schweigt, muss **über 7,5 Sekunden** brauchen — bliebe er darunter,
hätte ihn eine von nodemailers eigenen Fristen gefangen, und über die äußere
Schranke wäre nichts bewiesen. Gemessen: rund 20 s, mit der äußeren Meldung.

**Das Passwort wird an vier Orten gesucht:** in **jeder Spalte jeder Zeile
jeder Tabelle** (mit `settings.mailzugang` als benannter Ausnahme), im
Containerprotokoll des Starts, in dem des Versands und in jedem Antwortkörper.
Dazu die Gegenlage, dass die Suche überhaupt etwas findet, wo etwas stehen muss.

**Kein Migrationsabschnitt — es gibt keinen Block.** **Ausdrücklich gesagt:**
0.9.0 ist keine Datenbankstufe. Die vorhandene Probe („eine Spalte wächst nicht
nach") bleibt unverändert stehen.

**Die Zahl der Abhängigkeiten steht fest.** Wächst der Baum später still, wird
es namentlich rot.

**Der Sprachwächter bleibt grün** und sieht auch die Papiere dieser Runde an.

---

## 7. Gegenprobentabelle

*Wird nach dem Lauf eingetragen.*

---

## 8. Prüfungszahlen

| | |
|---|---|
| Vorher (0.8.91) | 3010 |
| Nachher (0.9.0) | **3180** |
| Neu | **170** |
| Gegenproben | **33** |

---

## 9. Was ausdrücklich nicht passiert ist

* **Kein Mailempfang.** Kein offener Port, kein IMAP, kein Abholen. Nur
  ausgehend.
* **Keine Benachrichtigungsmails.** Es gibt genau **zwei** Anlässe für eine
  Mail — den Tokenlink und die Testmail.
* **Kein Versanddienst über HTTPS.** Brevo, Mailjet und Postmark bleiben
  vorgemerkt für den Fall, dass SMTP am Anschluss nachweislich nicht durchkommt.
* **Kein Zwei-Faktor.** TOTP bleibt 0.9.10, und der Satz „E-Mail ist
  Bequemlichkeit, nie Voraussetzung" gilt dort **nicht**.
* **Keine Selbstanmeldung.** Sie ist 0.9.1.
* **Die Formatnummer bleibt bei 10.**
* **Kein neuer Vokabeleintrag.** Die elf bleiben elf.
* **Es bleibt bei fünf markierten Migrationsblöcken.**
* **Die Vorgänge im Sicherheitsprotokoll bleiben fünfzehn.**
* **`schluessel.js`, `schluessel.sh` und `db.js#wechsleSchluessel` sind
  unberührt**, wie der Auftrag es verlangt.
* **Keine neue `.env`-Zeile.** `OEFFENTLICHE_ADRESSE` gibt es seit 0.8.90; die
  `docker-compose.yml` ist unberührt.
* **Farbschema, Anmeldebremse in ihren Kennwerten, `katalog.sqlite`,
  `HINTER_PROXY`, die Content-Security-Policy, die Sortierung der Übersicht,
  das Austauschformat, der Papierkorb, die Sicherung, `ordneBestandZu()` und
  die Rollenleiter sind unangetastet.**

---

## 10. Offen geblieben

* **Die Selbstanmeldung — 0.9.1.** Formular vor der Anmeldung,
  **Bestätigungsmail (Double Opt-in)**, Warteschlange beim Admin, Freischaltung
  und Ablehnung. Die neue Tabelle `registrierungen` kommt dort, ohne
  Migrationsblock; `F_ROUTEN` geht auf 63. **Und ein dritter Mailanlass** — die
  Bestätigungsmail, die belegt, dass die Adresse dem Anfragenden gehört. Ohne
  sie könnte jeder eine **fremde** Adresse in die Liste des Admins schreiben.
* **Der Schalter `registrierung` wird an den funktionierenden Versand
  gekoppelt.** Ohne Mail läuft die Selbstanmeldung ins Leere — der Anfragende
  bekäme nie einen Link. Einschalten geht nur, wenn seit der letzten Änderung
  am Mailzugang eine Testmail durchgekommen ist; die Marke dafür ist in dieser
  Runde schon gebaut.
* **Der Wechseltest auf der echten Anlage steht weiter aus** (aus 0.8.91).
  `./schluessel.sh zeigen` ist gelaufen, `wechseln` noch nicht. Kommt das
  Ergebnis, gehört es in den Projektstand, Abschnitt 2.
* **Der erste echte Versand ist noch nicht gefahren.** Dafür ist der
  Testmail-Knopf da; die Befehle stehen im Chat.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.

---

**0.9.0 — Fingerprint `FINGERPRINT_0_9_0`**
