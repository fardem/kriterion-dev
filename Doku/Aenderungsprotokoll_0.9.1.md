# Änderungsprotokoll 0.9.1 — „Stufe I₂: die Selbstanmeldung"

**Version 0.9.1 · gebaut am 25. August 2026 · nachgezogen am 26. August 2026 ·
zweite Hälfte von Stufe I des Mehrbenutzerbetriebs · Datenbankstufe, ohne
Migrationsblock**

> **DIESES PAPIER TRÄGT ZWEI STÄNDE.** Der eine ist der eingespielte:
> Fingerprint `d629e78d`, 3432 Prüfungen, 49 Gegenproben, Stolpersteine bis
> 155. Der andere ist der Stand nach der **Nacharbeit an der Anmeldeseite**,
> die aus dem Betrieb zurückkam und ohne neue Versionsnummer gebaut wurde:
> Fingerprint `3cf1b093`, 3451 Prüfungen, 58 Gegenproben, Stolpersteine bis
> 158. **Die Befunde M bis V tragen sie**, und wo eine Zahl sich bewegt hat,
> stehen beide da. **Der zweite Stand ist im Feld bestätigt** — die laufende
> Anlage meldet `3cf1b093`, nachdem eine liegengebliebene Datei entfernt war
> (Befund V).

**Mit dieser Runde ist der Stufenplan abgearbeitet.** Teil II des
Konzeptpapiers ist vollständig; es gibt keine offene Stufe mehr. Was von jenem
Papier ab jetzt gilt, sind die **Entscheidungen**, nicht die Stufen.

**Der Satz, unter dem alles steht: niemand kommt durch die Selbstanmeldung
herein, ohne dass ein Admin ihn hereinlässt.** Es gibt keine Betriebsart, in
der ein geklickter Link allein freischaltet — das wäre ein anderes Produkt und
zugleich die zweite Wahrheit, die Abschnitt 1 des Konzeptpapiers ausschließt.

**Und der zweite Satz trägt genauso: die Anlage läuft ohne all das
vollständig.** Der Schalter steht ab Werk auf aus; dann legt nur der Admin an,
wie seit 0.8.0. Es fehlt keine Funktion.

**Drei Entscheidungen gehen über den Auftrag hinaus**, alle vor dem Bau
besprochen und bestätigt. Sie stehen in Abschnitt 2.

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

### `db.js`

**Eine neue Tabelle, `anfragen`** — die Warteschlange der Selbstanmeldung:

```sql
CREATE TABLE IF NOT EXISTS anfragen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  bestaetigt_am TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Kein Migrationsblock.** Anders als eine Spalte legt `CREATE TABLE IF NOT
EXISTS` eine fehlende **Tabelle** bei jedem Start an (Stolperstein 13 gilt der
Spalte). Zum vierten Mal nachgestellt statt abgeschrieben — der Prüfstand
entfernt sie von Hand aus einer bestehenden Anlage, startet einmal und sieht
nach, samt der Gegenlage an einer Spalte. **Es bleibt bei fünf markierten
Blöcken.**

**`hash` ist NICHT Primärschlüssel**, anders als bei `tokens`, und das ist
entschieden: die Adminrouten sprechen eine Zeile über eine **Nummer** an, und
ein Geheimnis hat in keinem Pfad etwas verloren — dort stünde es im
Zugriffsprotokoll, in der Verlaufsliste und womöglich im Referrer. `UNIQUE`
trägt den Nachschlageweg genauso.

**Kein Fremdschlüssel:** es gibt niemanden, auf den er zeigen könnte. Eine
Anfrage ist noch kein Zugang — genau das ist die tragende Grenze der Tabelle.
Deshalb steht darin auch kein `password_hash` und keine Rolle: was es nicht
gibt, kann kein Weg hereinlassen.

**`bestaetigt_am IS NULL` heißt „noch nicht bestätigt".** Ein zweites Feld für
den Zustand wäre eine zweite Wahrheit neben dem Zeitpunkt.

### `auth.js`

**Der Anfragenteil**, direkt hinter dem Tokenteil und mit derselben Bauform:

* `ANFRAGE_STUNDEN = 24`, `ANFRAGE_DECKEL = 20`, dazu `ANFRAGE_NAME_MAX = 64`
  und `ANFRAGE_MAIL_MAX = 254` — die Längengrenze gilt **nur hier**, denn dies
  ist die einzige Stelle im Projekt, an der ein Fremder in die Datenbank
  schreibt. Sie ist keine zweite Wahrheit über Benutzernamen: `pruefeName`
  bleibt unverändert, begrenzt wird die **Eingabe von außen**.
* `legeAnfrageAn(name, adresse)` — liefert den Klartext des
  Bestätigungsschlüssels **oder `null`**. `null` ist kein Fehler und keine
  Absage, sondern die **stille Verwerfung**: der Aufrufer schreibt in jedem Fall
  dieselbe Antwort. Würde hier geworfen, müsste die Route den Fall
  unterscheiden — und genau das ist die Auskunft, die das Formular nicht geben
  darf.
* `bestaetigeAnfrage(klartext)` — liefert ja/nein und **nichts über die Zeile**.
  Zweimal klicken ist unschädlich: `bestaetigt_am` wird nur gesetzt, wo es noch
  leer ist, und der zweite Aufruf meldet ebenfalls Erfolg.
* `raeumeAnfragenAuf()` — dieselbe Bauform wie `raeumeTokensAuf()`, aber mit
  **drei** Aufrufstellen statt zweier: Start, Karte und **`legeAnfrageAn` selbst,
  vor der Deckelprüfung**. Die dritte ist keine Hauswirtschaft, sondern Teil der
  Entscheidung. **Geräumt wird nur das Unbestätigte.**
* `listeAnfragen()` — **ausschließlich die bestätigten**, und ohne den Hash.
* `holeAnfrage(id)`, `entferneAnfrage(id)`, `zaehleAnfragen()`.

**`tokenHash()` wird wiederverwendet und nicht ein zweites Mal geschrieben** —
zwei Ausfertigungen derselben Rechnung liefen beim nächsten Griff auseinander.

**`VORGAENGE` geht von fünfzehn auf siebzehn:** `anfrage.frei` und
`anfrage.ab`. **`MERKMALE` bleibt bei dreizehn** — keiner der beiden trägt
eines.

### `mail.js`

**`textBestaetigung()` — der dritte Mailanlass.** Reiner Text wie die anderen
beiden. Er ist der einzige Text der Anlage, der an jemanden gehen kann, der
nichts angefordert hat, und danach ist er gebaut: der Satz *„warst du das
nicht, ist nichts zu tun"* steht **weit oben** und nicht am Ende, der Text sagt
ausdrücklich, dass der Link **keinen Zugang öffnet und kein Passwort setzt**,
und er nennt, was danach kommt — ein Mensch entscheidet.

**Die beiden vorhandenen Texte sind gekürzt** — ein Satz weniger, nicht eine
Auskunft weniger. Aus vier Zeilen werden drei; die Frist, die Unschädlichkeit
des Neuladens und der Weg danach stehen alle drei weiter darin.

### `server.js`

* **`mailtestStand(roh)`** — der Vergleich der Testmarke gegen den Hash über den
  Zugang ist aus `mailKarte()` herausgezogen. Er hat seit dieser Runde **zwei**
  Leser: die Karte und den Schalter. **Zwei Mechanismen für eine Zusage wären
  einer zu viel** (Stolperstein 145) — eine Rechnung, zwei Rufer.
* **`versandBereit()`** — die drei Voraussetzungen des Versands mit ihrem Grund
  daneben.
* **`versendeBestaetigung()`** — gerufen **nachdem** die Antwort geschrieben ist,
  mit Auffangnetz.
* **`anfragenKarte()`** — was die Karte sieht.
* **`GET /api/config`** trägt jetzt `registrierung`. Die Liste bleibt
  abgeschlossen; der Prüfstand nagelt die fünf Namen fest.
* **Fünf neue schreibende Routen**, `F_ROUTEN` 59 → 64:

| Route | Art | |
|---|---|---|
| `POST /api/registrierung` | `offen` | die Anfrage; vor der Anmeldung |
| `POST /api/registrierung/bestaetigen` | `offen` | die Bestätigung; POST, damit der Schlüssel im Rumpf bleibt |
| `PUT /api/registrierung/schalter` | `nurAdmin` | ein/aus |
| `POST /api/anfragen/:id/frei` | `nurAdmin` | Freischalten |
| `DELETE /api/anfragen/:id` | `nurAdmin` | Ablehnen |

  `GET /api/anfragen` ist **lesend** und steht wie immer nicht in `F_ROUTEN`.
* **Die Anmeldebremse greift an beiden offenen Routen**, mit unangetasteten
  Kennwerten und ohne Namenshälfte — über dasselbe `tokenBremseFrei()` wie an
  den Tokenrouten.

### `public/app.js`

* **`showAnfrage()` / `showAnfrageDank()`** — das Formular auf der Anmeldeseite,
  zwei Felder und **kein Passwortfeld**. Der Verweis darauf steht nur da, wenn
  `/api/config` sagt, dass die Selbstanmeldung an ist. **Die Meldung kommt vom
  Server** und wird hier nicht erfunden.
* **`showBestaetigung()`** — die Seite hinter `#/bestaetigung/…`. Sie setzt kein
  Passwort, meldet niemanden an, und danach steht man wieder auf der
  Anmeldeseite.
* **Die Karte „Anfragen"** — Schalter, Stand gegen den Deckel, die rote Zeile
  bei kaputtem Versand, die Liste mit Freischalten und Ablehnen. Sie ist nur da,
  wenn der Schalter an ist **oder** Anfragen offen sind, und sie ist die dritte
  **breite** Kachel.
* **`zeigeLink(d, kasten)`** — eine Funktion, zwei Rufer. Der jeweils andere
  Kasten wird geleert; die Kennungen darin sind feste Namen (Stolperstein 153).
* **Die gekürzte Zeile auf der Einladungsseite.**

### `public/marke-dunkel.svg`, `public/favicon.svg` — neu

**Die Marke der Anlage ist seit dieser Runde eine ausgelieferte Datei** und
kein eingebautes SVG mehr. Wer sie austauscht, tauscht eine Datei aus und fasst
keinen Quelltext an. Zwei Fassungen: **durchsichtig** (für die dunklen Flächen
der Oberfläche) und **mit Kachel** (für den Tab des Browsers, ein Lesezeichen,
eine helle Seite). Die Oberfläche nimmt die durchsichtige — eine mitgelieferte
Kachel säße auf dunklem Grund als sichtbares Rechteck darauf.

*Es lagen zunächst drei da:* `marke-hell.svg` war Byte für Byte `favicon.svg`.
**Sie ist entfernt** — Befund R, Stolperstein 157.

**Alle Farben stammen aus der eigenen Palette:** `#838c95` ist `--muted`,
`#16191c` ist `--surface`, **und der hervorgehobene Strich `#ffc531` ist
`--gold`** — die Farbe der Sterne. Die Marke läuft also nicht aus der Farbwelt
heraus; sie nimmt deren zweiten Signalwert statt `--accent` (`#ff7a1a`).

**Offen geblieben und benannt, nicht stillschweigend geändert:** ob der Strich
Gold behält oder auf den Akzent gezogen wird. Auf der Anmeldekarte stehen jetzt
drei warme Werte übereinander — Gold in der Marke, `--accent-dim`/`--accent-line`
am zweiten Weg, voller Akzent am Anmeldeknopf. **Das ist eine Gestaltungsfrage,
keine Berichtigung**; die Zeichnung ist unverändert übernommen, und die
Entscheidung gehört dem, dem die Marke gehört. Sie steht als Arbeit im Auftrag
0.9.10, Punkt 0. Siehe Befund U.

### `pruefung.js`

Achtzehn neue Gruppen, 240 neue Prüfungen; Einzelheiten in Abschnitt 6. Dazu
im DOM-Mock die fünf neuen Endpunkte samt `registrierung` in `/api/config` —
und er **zieht mit**: Freischalten und Ablehnen nehmen die Zeile wirklich aus
der Liste (Stolperstein 90) und bringen nichts selbst mit, was die Prüfung
belegen soll (Stolperstein 102).

### `gegenprobe.js`

**42 neue Rückbauten** (31 bis 72, ohne 45 — siehe Abweichung D), dazu drei
nachgezogene: 07 und 14 zielten auf Zeilen, die diese Runde verschoben hat, 30
auf die gekürzte Zeile.

### `.env.example`, `README.md`, `Doku/`

**Keine neue `.env`-Zeile** — nur ein erklärender Absatz an
`OEFFENTLICHE_ADRESSE`, der sie als Voraussetzung der Selbstanmeldung benennt.
README um das Kapitel „Selbstanmeldung"; Projektstand, Konzeptpapier und
Changelog nachgezogen, beide versionsbenannten Papiere umbenannt.

### `package.json` / `package-lock.json`

Version auf **0.9.1**, Lockfile nachgezogen. **Keine neue Abhängigkeit** —
`npm ls --omit=dev` steht unverändert bei **122** Pfaden.

### Unberührt geblieben

`anhaenge.js`, `keys.js`, `schluessel.js`, `schluessel.sh`, `zugang.js`,
`public/style.css`, `docker-compose.yml`, `Dockerfile`.

---

## 2. Die Abweichungen und Ergänzungen zum Auftrag

### A — Der Schalter verlangt ZWEI Dinge, nicht eines

**Der Auftrag koppelte den Schalter allein an `mailtestOk`.** Das trägt nicht,
und der Grund ist nachgesehen und nicht angenommen: **die Testmail enthält
keinen Link** und geht deshalb auch ohne `OEFFENTLICHE_ADRESSE` anstandslos
durch — sie prüft den SMTP-Weg, nicht die Adresse. Die Marke könnte also grün
sein, während `versendeTokenLink()` bei jeder Bestätigungsmail mit
`versand: 'aus'` abbräche. Dann ginge nie eine Mail hinaus, und die
Selbstanmeldung liefe genau in die Leere, gegen die die Kopplung gebaut ist.

**Gebaut ist deshalb `versandBereit()` mit drei Bedingungen** — Mailzugang
eingerichtet, Marke gültig, öffentliche Adresse gesetzt —, und jede nennt ihren
Grund. Das ist zugleich die bauliche Form von Punkt 0 des Auftrags
(*„`OEFFENTLICHE_ADRESSE` ist die Voraussetzung dieser Runde, nicht nur eine
Empfehlung"*). Stolperstein **149**.

### B — „Schalter aus" gibt dieselbe Antwort, keinen eigenen Statuscode

**Punkt 1 des Auftrags zählt „Schalter aus" ausdrücklich unter den fünf Lagen
auf, die Byte für Byte gleich antworten; Punkt 6 sagt „die Route weist ab".**
Beides zusammen geht nicht. Gebaut ist Punkt 1: **gleicher Statuscode, gleicher
Rumpf — „abweisen" heißt hier, dass nichts entsteht.** Keine Zeile, keine Mail.

Der Grund: eine eigene Absage wäre die eine Lage, an der sich die Antwort doch
unterscheidet, und die Route wäre damit ein zweiter Weg, den Schalterzustand
abzufragen. Dass er über `GET /api/config` ohnehin öffentlich ist, ist eine
**Entscheidung** — die Anmeldeseite muss wissen, ob sie das Formular zeigen
soll — und kein Grund, daneben eine zweite Auskunftsstelle entstehen zu lassen.

### C — Je Adresse höchstens eine offene Anfrage

**Der Auftrag nennt den Deckel; er begrenzt die Tabelle, nicht den Versand.**
Ohne eine zweite Schranke wäre das Formular ein Weg, einer **fremden** Adresse
beliebig viele Bestätigungsmails zu schicken: jede Anfrage für dieselbe Adresse
erzeugte eine neue Zeile und eine neue Mail, und der Deckel griffe erst bei
zwanzig **verschiedenen** Anfragen.

Gebaut ist: eine Wiederholung für eine Adresse, zu der bereits eine offene
Anfrage liegt, wird **still verworfen** — ohne neue Zeile **und ohne zweite
Mail**. *Der Preis, ehrlich benannt:* geht die eine Mail verloren, wartet der
Anfragende bis zum Verfall. Eine andere Adresse trägt sofort.

### D — Rückbau 45 ist entfallen, 14 deckt ihn mit ab

Der Markenvergleich ist in dieser Runde in `mailtestStand()` gezogen worden.
Der geplante Rückbau 45 („die Marke wird nicht gegen den Zugang gerechnet")
hätte damit **dieselbe Zeile** getroffen wie der vorhandene Rückbau 14. Zwei
gleiche Rückbauten sind einer zu viel; 14 ist nachgezogen worden und färbt jetzt
**beide** Seiten rot — die Karte und den Schalter. Aus 36 geplanten neuen
Rückbauten werden damit 35, aus 39 gefahrenen 38 in der Tabelle.

---

## 3. Die Fragen aus dem Auftrag, beantwortet

**1 · Woran hängt der Bestätigungslink?** An einem **eigenen Hash in der neuen
Tabelle**, nach dem Muster von `tokens`. `tokens` um einen Zweck zu erweitern,
der auf nichts zeigt, wäre nicht nur die schlechtere Wahl, sondern die teurere:
`tokens.user_id` ist `NOT NULL REFERENCES users(id)`, und die Spalte
nachträglich zu öffnen wäre ein `ALTER TABLE` auf einer bestehenden Spalte —
also genau der Migrationsblock, den diese Runde nicht haben sollte. Dazu bekäme
`pruefeToken()` einen zweiten Zweig neben seinem JOIN auf `users`, und die eine
Absage müsste zwei Sachen zugleich bedeuten.

**2 · Wie lange lebt eine unbestätigte Anfrage?** **24 Stunden** — deutlich
kürzer als die sieben Tage des Einladungslinks, denn dort hat ein Admin den
Zugang angelegt, hier steht die Zeile auf nichts als der Behauptung eines
Fremden. **Nur die unbestätigte verfällt**; eine bestätigte wartet auf den
Admin, so lange es dauert — sie still verfallen zu lassen hieße, jemanden ohne
Antwort stehen zu lassen, der alles getan hat, was von ihm verlangt war.
**Aufgeräumt wird an drei Stellen:** Start, Karte und **vor der
Deckelprüfung**. Die dritte ist die besondere und keine Hauswirtschaft: ohne sie
blockierten zwanzig längst verfallene Zeilen die Selbstanmeldung noch einen
weiteren Tag.

**3 · Wogegen zählt der Deckel?** Gegen die **bestätigten und die
unbestätigten zusammen**, nach dem Aufräumen. Bei Erreichen: **still verworfen**,
Antwort unverändert. Dazu die Schranke aus Abweichung C.

**4 · Was sieht der Admin?** Eine **eigene Karte „Anfragen"** (achtzehn werden
neunzehn) statt eines Anbaus an „Zugänge": die beiden Listen beantworten
verschiedene Fragen — „wer darf sich anmelden" und „wer möchte es". Name,
Adresse, Zeitpunkt der Anfrage, Zeitpunkt der Bestätigung, dazu Freischalten und
Ablehnen.

**Sie steht dem Admin IMMER — und das ist gegen die Neigung des Auftrags
entschieden, nachdem sie im Betrieb aufgefallen ist.** Der Auftrag schlug vor:
*„die Karte ist nur da, wenn der Schalter an ist oder Anfragen offen sind"*, und
so war sie zuerst gebaut. **Das ist eine Sackgasse:** der Schalter steht **in**
dieser Karte, also gibt es, solange sie fehlt, keinen Weg, die Selbstanmeldung je
einzuschalten. Sie bleibt in dieser Lage **kurz** — Überschrift, ein Satz, der
Zustand und der Schalter; die Liste erscheint erst, wenn eine Anfrage vorliegt.
Einzelheiten in Befund M.

**5 · Wer darf freischalten?** **Jeder Admin.** Die Rollenleiter wird dabei
nicht berührt, und das ist **baulich nachgeprüft** und nicht nur beabsichtigt:
die Route ruft `legeZugangAn(a.username, null, 'user', true, …)` mit fest
verdrahteter Rolle und liest an **keiner** Stelle eine Rolle aus der Anfrage.
Eine mitgeschickte Rolle in Rumpf, Abfrage oder Kopf kann deshalb nichts
bewirken — geprüft in allen drei Formen. Es gibt außerdem keinen bestehenden
Zugang, an den hier jemand herankäme. **Keine zweite Bestätigung**, dieselbe
Überlegung wie bei `POST /api/users`.

**Ein Fall gehört genannt:** wird der Wunschname zwischen Anfrage und
Freischaltung anderweitig vergeben, scheitert `legeZugangAn`. Die Reihenfolge im
Code ist darauf gebaut — erst der Zugang, dann der Token, dann die Zeile weg —,
also **bleibt die Anfrage stehen** und der Admin bekommt die Meldung.

**6 · Was steht in den Protokollzeilen?** **Zwei neue Vorgänge**,
`anfrage.frei` und `anfrage.ab`. Geprüft, ob sie doppelt sind, und sie sind es
nicht: `zugang.neu` und `link.neu` sagen, *dass* ein Zugang samt Link entstand,
aber keiner von beiden sagt, dass er aus einer **Selbstanmeldung** kam — und das
ist genau die Frage, die diese Runde aufwirft. Die Ablehnung hinterlässt ohne
ihre Zeile **gar keine** Spur, denn die Zeile in `anfragen` wird gelöscht.
**Beide ohne Namen und ohne Adresse.** `anfrage.frei` trägt den neuen Zugang als
Ziel, `anfrage.ab` gar keines.

**Und ausdrücklich keine Zeile für Anfrage und Bestätigung:** sie wären die
einzigen neben der gescheiterten Anmeldung, die ein Fremder auslösen kann, und
anders als dort gäbe es keinen Deckel darüber.

**7 · Wie viele Routen, welche Art?** Fünf, `F_ROUTEN` **59 → 64** — die Zahl
wird ausdrücklich geprüft. Zwei stehen vor der Anmeldung und tragen weder
Wächter noch Klemme, und das ist entschieden: es *darf* sie jeder. Was sie
begrenzt, ist der Schalter, der Deckel, die Bremse und die immer gleiche
Antwort. `GET /api/anfragen` steht wie immer nicht in der Liste.

**Zum Schalter (Punkt 2 des Auftrags):** **Admin genügt.** Der Mailzugang
dahinter bleibt beim Eigentümer; was der Admin über ihn erfährt, ist der Grund
aus `versandBereit()` — und den erfährt er heute schon neben jedem Link. Der
vorhandene Mechanismus wird genommen und kein zweiter gebaut.

**Zur Missbrauchsseite (Punkt 3):** die drei Dinge sind gebaut und einzeln
geprüft. Die Laufzeiten sind **gemessen**, nicht behauptet — siehe Befund A.

---

## 4. Befunde beim Bauen

### Befund A — die Laufzeit verrät, was der Rumpf verschweigt

**Die immer gleiche Antwort ist keine Zusage über den Rumpf allein.** Ein Weg,
der eine Mail verschickt, dauert Sekunden; einer, der still verwirft, dauert
Millisekunden. Wäre der Versand vor der Antwort, ließe sich aus der Uhr ablesen,
welcher gelaufen ist — und das Formular wäre wieder ein Werkzeug zum
Durchprobieren, nur eben über die Zeit statt über den Text.

**Gebaut ist die Trennung:** Zeile schreiben, antworten, dann verschicken. Der
Anfragende verliert dabei nichts, denn über den Versand erfährt er ohnehin
nichts. **Gemessen wird es am tröpfelnden Empfänger aus 0.9.0**, der den Versand
zwanzig Sekunden festhält: keine der fünf Lagen darf darauf warten. **Samt der
Gegenlage zur Messung selbst** — hätte der Empfänger sofort abgesagt, wäre
„keine wartet" wahr, ohne etwas zu belegen. Stolperstein **150**.

### Befund B — die Testmail belegt die öffentliche Adresse nicht

Siehe Abweichung A. Der Auftrag hätte an dieser Stelle eine Anlage erlaubt, in
der der Schalter an ist und trotzdem nie eine Mail hinausgeht. Stolperstein
**149**.

### Befund C — der Wächter über die Portbasen hat zugeschlagen

Vier neue Prüflagen schoben die Spanne aller Portbasen auf **3040** — und
`VERSATZ_STUFE` steht bei **3000**. Damit läge die erste Nebenspur von
`gegenprobe.js` auf der letzten Basis der Hauptspur, und zwei Rückbauten kämen
sich ins Gehege. **Der Wächter aus 0.8.91 hat es beim ersten Lauf gefunden**,
namentlich und mit beiden Zahlen (*„Versatz 3000, Spanne 3040 (3900–6939)"*).

**Behoben ohne die Zahl zu ändern:** die Bremsprobe braucht keinen eigenen
Server. Sie läuft als **letztes** auf der Anlage der Gruppe davor — die ist dort
fertig, ihr Schalter ist aus, und es darf ohnehin nichts entstehen. Damit
bleiben drei neue Basen (6700, 6760, 6820) und die Spanne unter 3000.
Stolperstein **152**.

### Befund D — zwei Kästen, dieselben Kennungen

`zeigeLink()` zeichnet den Einladungslink; seit dieser Runde wird sie von zwei
Stellen gerufen — beim Anlegen in „Zugänge" und beim Freischalten in
„Anfragen". Die Kennungen im Kasten (`zug-link-feld`, `zug-link-kopie`) sind
**feste Namen**: stünden beide Kästen gleichzeitig da, nähme `getElementById`
den ersten, und der Knopf „Kopieren" kopierte den falschen Link.

**Gebaut ist die einfachste Form:** der jeweils andere Kasten wird geleert. Es
steht immer höchstens **ein** Link am Bildschirm — was ohnehin richtig ist.
Stolperstein **153**.

### Befund E — eine Prüfung, die auf die Uhr wartete statt auf die Sache

Die erste Fassung der Freischaltungsgruppe schlief 800 ms und nahm dann den
**letzten** Brief des Empfängers. Das war in beide Richtungen falsch: sie wurde
rot, wenn die Mail langsamer kam, und sie nahm den falschen Brief, wenn eine
Bestätigungsmail aus einer früheren Gruppe dazwischenfiel — beides ist möglich,
weil der Versand seit dieser Runde **nach** der Antwort läuft.

**Gesucht wird jetzt nach Empfänger, und gewartet wird, bis der Brief da ist**
(`regWarteAufBrief`). Ebenso beim Zählen: statt „genau zwei neue Briefe" wird
der Brief gesucht, der **diesen** Link trägt. Stolperstein **151**.

### Befund F — der Auftrag zitierte den falschen Stolperstein

Punkt 6 des Auftrags nennt bei „die neue Tabelle wächst bei jedem Start nach"
den *Stolperstein 20*; 20 ist „CSS-Längen werden beim Zurücklesen
normalisiert". Gemeint ist **13** — und die Bauregel weiter unten im selben
Auftrag nennt ihn richtig. Gebaut und geschrieben ist nach 13. *Derselbe Befund
wie in 0.9.0 (dort Befund D); die Nummer im Fließtext eines Auftrags ist eine
Behauptung wie jede andere.*

### Befund G — der Auftrag erwartete die Tabelle unter anderem Namen

Das Änderungsprotokoll 0.9.0 nannte unter „Offen geblieben" die Tabelle
`registrierungen` und `F_ROUTEN` bei **63**. Gebaut sind **`anfragen`** und
**64**. Der Name ist kürzer und passt zur Karte, die er benennt; die Zahl ist
gewachsen, weil der Schalter eine eigene Route bekommen hat statt über
`PUT /api/settings` zu laufen — jene Route leitet ihre Rechte aus
`PERSOENLICHE_SCHLUESSEL` ab, und der Schalter ist nicht persönlich. *Eine Zahl
in einem Papier ist eine Behauptung* (Stolperstein 137); beide sind hier
ausdrücklich nachgezogen.

### Befund H — eine stumme Gegenprobe: die Adressschranke war ungeprüft

**Rückbau 36 („eine zweite Anfrage je Adresse geht durch") blieb beim ersten
Lauf vollständig grün.** Der Grund lag in der Prüfung, nicht im Code: die Lage
„schon offene Anfrage" schickte **Name und Adresse** noch einmal — sie fällt
damit bereits an der **Namensschranke**, und die Adressschranke daneben wurde
nie erreicht.

**Das ist genau die Lücke, gegen die die Adressschranke gebaut ist:** ein
Angreifer, der eine fremde Adresse mit Bestätigungsmails überziehen will, ändert
ja gerade den Namen. Nachgezogen sind **zwei** Lagen — dieselbe Adresse unter
anderem Namen, derselbe Name unter anderer Adresse — samt der Gegenlage, dass
neuer Name **und** neue Adresse durchgehen. Dazu kommt **Rückbau 67** für die
zweite Hälfte, die vorher gar keinen hatte.

*Die Lehre in einem Satz:* **eine Lage, die zwei Schranken zugleich reißt, prüft
keine von beiden.**

### Befund I — die Längengrenze hatte keine Prüfung

**Rückbau 39 („Name und Adresse von außen sind wieder unbegrenzt lang") blieb
ebenfalls stumm** — und hier fehlte die Prüfung schlicht. Die Grenze war beim
Bauen als Nebensache dazugekommen (siehe Abschnitt 1, `auth.js`) und deshalb
nirgends festgehalten.

Nachgezogen: ein zu langer Name und eine zu lange Adresse bekommen **dieselbe**
Antwort und legen **keine** Zeile an, und ein Name von genau 64 Zeichen geht
durch — die Gegenlage, ohne die nur belegt wäre, dass überhaupt etwas
abgewiesen wird.

### Befund J — eine dritte stumme: die bestätigte Zeile war zu jung

**Rückbau 41 („auch die BESTÄTIGTEN verfallen") blieb stumm** — und wieder lag
es an der Prüflage. Sie machte nur die **unbestätigte** Zeile künstlich alt; die
bestätigte war Sekunden alt und fiel deshalb unter gar keine Frist. Ein Rückbau,
der `bestaetigt_am IS NULL` aus dem Aufräumen nimmt, konnte an ihr nichts
anrichten.

Nachgezogen: die bestätigte Zeile wird auf **72 Stunden** gealtert und muss
danach **stehen bleiben** — und der Admin muss sie weiterhin sehen. *Eine
Prüfung, deren Gegenstand die Bedingung gar nicht erreicht, kann nicht
scheitern* — Stolperstein 81 an einer Zeitgrenze statt an einem fehlenden Wert.

### Befund K — eine vierte stumme: der gekürzte Mailtext war nur am Bildschirm geprüft

**Rückbau 66 („die gekürzte Zeile im Mailtext verliert eine Auskunft") blieb
stumm.** Punkt 0 des Auftrags verlangt die Kürzung an **beiden** Stellen — auf
der Einladungsseite und im Mailtext —, und geprüft war nur die erste. Der
Brief wurde zwar auf „7 Tage" und „15 Minuten" angesehen, nicht aber auf den
dritten Satz.

Nachgezogen: der Brief muss alle **drei** Auskünfte tragen, und der Satz, der
dasselbe ein zweites Mal sagte, darf **nicht** mehr darin stehen — dieselbe
Doppelprüfung wie am Bildschirm.

### Befund L — drei Läufe rissen ab, statt rot zu werden

**Die Rückbauten 48, 56 und 58 nahmen den ganzen Lauf mit** (*„Cannot read
properties of undefined"*). Der Grund ist derselbe in allen drei Fällen: die
neuen Gruppen lasen an einzelnen Stellen `zeile[0].feld`, ohne dass die Zeile
vorhanden sein musste — und ein Rückbau, der genau diese Zeile wegnimmt, lässt
den Lauf dort abreißen.

**Eine Gegenprobe, die den Lauf mitnimmt, sagt nichts darüber, welche Prüfung
den Rückbau bemerkt hätte** — Stolperstein 138, und diesmal an der eigenen
Arbeit. Jede Lesestelle in den neuen Gruppen läuft jetzt über ein Auffangnetz.

**Beim zweiten Lauf riss Rückbau 36 immer noch ab**, und die Ursache war eine
andere und lehrreichere: er ist der einzige Rückbau, der **zusätzliche
Bestätigungsmails an den tröpfelnden Empfänger** entstehen lässt — jede davon
hält eine Verbindung zwanzig Sekunden fest. Unter vier Nebenspuren reichten die
vier Sekunden nicht mehr, die die Prüfung auf den Brief wartete. **Ein Rückbau
kann also die Bedingungen verschieben, unter denen die Prüfung läuft.**
Nachgezogen: die Wartezeit ist großzügig, und die Prüfung sucht **den Brief an
diese Adresse** statt „einen mehr als vorher" — kein Delta mehr, das von der Uhr
abhängt (Stolperstein 151, zum zweiten Mal in dieser Runde). *Nebenbei
aufgefallen:* das Muster für die Empfängerzeile maskierte nur den **ersten**
Punkt der Adresse — `String.replace` mit einem String ersetzt genau ein
Vorkommen.

*Alle sechs Befunde sind das, wofür die Gegenproben da sind:* **ein Rückbau, der
keine Prüfung rot macht — oder den Lauf mitnimmt —, ist ein Fund und kein
Erfolg.** *In der Nacharbeit kam ein siebter dazu — Rückbau 80, siehe Abschnitt
7.*

### Befund M — die Karte verdeckte ihren eigenen Schalter (aus dem Betrieb)

**Nach dem Einspielen war die Karte „Anfragen" nicht zu finden — und sie konnte
es auch nicht sein.** Sie war an die Bedingung aus dem Auftrag geknüpft (*„nur
da, wenn der Schalter an ist oder Anfragen offen sind"*), und **der Schalter
steht in ihr**. Bei einer frisch eingespielten Anlage ist die Selbstanmeldung
aus und es liegt keine Anfrage vor: die Karte fehlt, also fehlt der Schalter,
also bleibt die Selbstanmeldung aus. **Eine Bedingung, die ihren eigenen Ausweg
verdeckt.**

**Der Prüfstand hat es nicht gefunden, und er konnte es auch nicht** — er prüfte
genau das, was gebaut war: *„ist die Selbstanmeldung aus und nichts offen, fehlt
die Karte"*. Die Prüfung war grün, die Gegenprobe färbte sie rot, und beides war
richtig. **Was fehlte, war die Frage, ob der Zustand von dort aus überhaupt
verlassen werden kann.**

**Gebaut ist jetzt: die Karte steht dem Admin immer.** Ist die Selbstanmeldung
aus und nichts offen, bleibt sie **kurz** — Überschrift, ein Satz, der Zustand
und der Schalter; die Liste erscheint erst mit der ersten Anfrage. Die Prüfung
der Vorgängerfassung ist **umgedreht statt gelöscht** (Stolperstein 74), und
daneben steht die, die den Befund festhält: **der Schalter muss in genau dieser
Lage erreichbar sein.** Rückbau 63 zielt jetzt auf die alte Bedingung.
Stolperstein **155**.

### Befund O — `.mark` gab es zweimal, und die Marke trug es mit

**Beim Einbau der neuen Marke ist aufgefallen, dass `.mark` in `style.css`
zwei verschiedene Dinge benennt:** die Marke der Anlage (`color: var(--accent)`)
und die kleinen Knöpfe am Kommentar — Anpinnen, Bericht, Aufgabe — mit Rahmen,
rundem Füllgrund und kleiner Schrift.

**Die Marke hat die zweite Regel stillschweigend mitgetragen.** Deshalb saß sie
in einem Kästchen mit Rahmen, das niemand entworfen hat; auf dem Bildschirm der
Anmeldeseite war es zu sehen, und es ist über Monate niemandem als Fehler
aufgefallen — es sah nach Absicht aus.

**Zwei Dinge mit demselben Namen sind eines zu viel.** Die Marke heißt jetzt
`marke`, trägt nichts Fremdes mehr mit, und der Prüfstand hält beide Regeln
getrennt fest. *Nebenbei:* die Umstellung von einem eingebauten SVG auf eine
Datei hat den Fehler nicht verursacht — sie hat ihn sichtbar gemacht.

### Befund N — der Weg zur Anfrage war zu leise (aus dem Betrieb)

**Der Weg zur Selbstanmeldung stand als Verweis in der Fußzeile der
Anmeldekarte** — *„Noch keinen Zugang? Zugang anfragen"* — und wurde übersehen.
Er ist der **zweite Weg von dieser Seite** und sieht jetzt auch danach aus: ein
**Knopf** unter „Anmelden", in derselben Größe, mit der Frage „Noch keinen
Zugang?" darüber und einer Trennlinie dazwischen.

**Nicht in der Betonung des Anmeldeknopfs**, und das ist entschieden: zwei
gleich laute Knöpfe nebeneinander sagen nicht mehr, welcher der gewöhnliche Weg
ist. Der Anmeldeknopf bleibt der einzige `btn-accent`.

**Gedämpft, aber erkennbar ein Knopf — und die Grenze zwischen beidem ist der
Punkt.** Der Füllgrund fällt weg, **die Umrandung bleibt**; beim Überfahren
nimmt er die gewöhnliche Knopffarbe an. Ein `btn-ghost` wäre zu weit gegangen:
ohne Rand sieht er im Ruhezustand wieder wie ein Verweis aus, und genau daran
ist die erste Fassung gescheitert.

Geprüft wird die **Art** des Elements, nicht sein Aussehen — `BUTTON` statt
`A`, die Klasse `btn` und ausdrücklich **nicht** `btn-accent`, die Frage
**vor** dem Knopf und der Knopf **hinter** dem Anmeldeknopf. Am Stylesheet wird
**beides** festgehalten: dass ihm der Füllgrund genommen wird **und** dass ihm
die Umrandung bleibt — samt der Gegenlage, dass die Grundklasse überhaupt eine
trägt (Stolperstein 81). Rückbau **68** macht wieder einen Verweis daraus,
Rückbau **69** nimmt ihm die Umrandung.

### Befund P — die Marke stand über dem Namen statt daneben (aus dem Betrieb)

**Auf jeder Anmeldeseite stand die Marke gestapelt über „Kriterion".** Das Paar
las sich damit als **Bild mit einer Überschrift darunter** — zwei Dinge, wo eines
gemeint ist. Im angemeldeten Bereich stand es die ganze Zeit richtig: `.brand`
in der Kopfzeile setzt Zeichen und Wort **nebeneinander**, mit 11 px dazwischen.
Die Anmeldeseite tat es als einzige anders.

**Gebaut ist jetzt eine Markenzeile:** erst das Zeichen, dann das Wort, dieselbe
Anordnung und dieselbe Lücke wie in der Kopfzeile. Die Anlage zeigt sich vor und
nach der Anmeldung gleich.

**Und sie steht an EINER Stelle.** Die neun Anmeldeseiten — Einrichtung,
Anmeldung, Anfrage, Dank, Bestätigung zweimal, Einladung dreimal — trugen
`${MARK(40)}` und `<h1>` neunmal ausgeschrieben nebeneinander. Sie rufen jetzt
`MARKENZEILE()`; wer die Anordnung ändert, ändert eine Stelle und nicht neun
(Stolperstein 145). *Die Größe ist dabei von 40 auf 34 gegangen: nebeneinander
misst sich die Marke am Wort und nicht mehr an der leeren Fläche darüber.*

Geprüft wird **beides** — die Quelle (der Helfer legt den Kasten an, das Paar
steht **genau einmal** in `app.js`) und der gebaute Baum (in der Zeile stehen
genau zwei Dinge, `IMG` vor `H1`, und außerhalb der Zeile steht keine zweite
Marke). Dazu das Stylesheet: `display: flex`, `align-items: center`, eine Lücke,
und die Überschrift ohne eigenen Unterrand — mit einem säße sie bei
`align-items: center` um die halbe Höhe zu hoch und die Marke stünde schief
daneben. Rückbauten **77** bis **80**.

### Befund Q — der Strich teilte die Anmeldekarte in zwei (aus dem Betrieb)

**Die Trennlinie aus Befund N lag quer durch eine Karte, die sonst keine Linie
kennt.** Sie hat den zweiten Weg abgesetzt und dabei mehr getan als das: die
Anmeldung sah danach aus wie **zwei Karten in einer**.

**Der Strich ist weg; getrennt wird mit Abstand** — 28 px, mehr als jede andere
Lücke in der Karte (24 px zwischen Unterzeile und Feldern). Der Abstand trennt
genauso und schneidet nicht.

**Damit stand aber der Knopf ohne Halt da.** Solange die Linie über ihm lag, trug
**sie** die Trennung; ohne sie muss der Knopf selbst zeigen, dass er einer ist
und wohin er gehört — und Grau auf Dunkelgrau tut das nicht. **Er trägt jetzt
dieselbe Farbe wie „Anmelden", nur ganz leise:** `--accent-dim` im Füllgrund
(13 % Deckung), `--accent-line` in der Umrandung (42 %). Beides sind die Werte,
mit denen die Anlage überall sonst schon andeutet statt zu rufen; der Füllgrund
ist derselbe, den ein Feld im Fokus als Schein bekommt.

**Die Schrift bleibt `--muted` und nicht `--accent`** — bei voller Deckung
stünden zwei gleich laute Knöpfe übereinander, und die Seite sagte nicht mehr,
welcher der gewöhnliche Weg ist. Beim Überfahren zieht **nur die Umrandung** auf
den vollen Akzent an; der Füllgrund bleibt, wo er ist, damit die Fläche nicht
springt.

Geprüft wird in beide Richtungen: dass überhaupt Farbe da ist, **und** dass es
die leise bleibt — die Deckung beider Werte wird **gemessen** und muss unter 0,5
liegen, statt ein Muster abzugleichen. Dazu, dass die Regel für die Trennung
keinen Rand mehr trägt **und** dass ihr Abstand größer ist als jede Lücke davor.
Rückbauten **73** bis **76**; **69** zielt auf die neue Fassung.

### Befund R — dieselbe Datei lag unter zwei Namen

**`favicon.svg` und `marke-hell.svg` waren Byte für Byte gleich.** Der Punkt
stand als offene Arbeit im Auftrag 0.9.10; entschieden ist: **eine Datei, und
zwar `favicon.svg`.** `marke-hell.svg` ist entfernt, in der Oberfläche war sie
nie geladen.

**Der Prüfstand hält jetzt mehr fest als den einen Fall.** Neben der Zeile, die
die entfernte Datei entfernt hält, steht die allgemeine: **in `public/` liegt
keine Datei zweimal unter zwei Namen** — verglichen wird der **Inhalt** und
nicht der Name, denn der Name war ja gerade das Täuschende daran. Stolperstein
**157**.

**Der Gegenprobentreiber konnte das zunächst nicht zurückbauen.** Eine
entfernte Datei lässt sich nicht über eine Textersetzung zurückholen — es geht
um die Datei selbst und nicht um ihren Inhalt. Er kennt deshalb jetzt einen
zweiten Rückbauweg: `kopie` legt `datei` in der Kopie ein zweites Mal unter dem
angegebenen Namen ab. Er liegt **im** Treiber und nicht daneben, damit er unter
dieselbe Kopie, dieselbe Nachschau und dasselbe Aufräumen fällt wie jeder
andere — der Arbeitsbaum wird auch hier nie angefasst. Rückbau **81**.

### Befund S — eine Verneinung über die eigene Quelle traf den Helfer mit

**Die erste Fassung der Prüfung „keine Anmeldeseite stapelt die beiden noch von
Hand" war rot, und zu Recht.** Sie las `app.js` und verneinte das Muster
`${MARK(…)}<h1>` — **und genau dieses Muster steht im Helfer, der die Sache
richtig macht.** Eine Verneinung über die eigene Quelle trifft die eine Stelle
mit, an der der Text richtig stehen darf.

**Zu zählen ist, nicht zu verneinen:** das Paar muss **genau einmal** in der
Quelle stehen, und die Zeile darüber hält fest, dass diese eine Stelle der
Helfer ist. Zusammen sagen die beiden genau das, was gemeint war. Stolperstein
**156**.

### Befund T — ein Lauf riss ab und ließ sich nicht wiederholen

**Von sieben Läufen dieser Nacharbeit ist einer abgerissen** — in der **ersten**
Gruppe, an drei Zeilen: *„Genau ein Zugang in der Datenbank"*, *„Und er ist
Eigentümer"*, *„Passwort liegt als scrypt-Hash"*. Die Zeile davor —
*„Die Einrichtung legt den ersten Zugang an"* — war **grün**, ebenso
*„Vor der Einrichtung meldet /api/config Einrichtungsbedarf"*.

**Das schließt den naheliegenden Verdacht aus.** Ein übriggebliebener Server aus
einem früheren Lauf hätte auf `/api/config` **keinen** Einrichtungsbedarf
gemeldet — seine Datenbank wäre nicht leer gewesen. Nachgesehen wurde
außerdem: es lief kein fremder `server.js` mehr. Der Hauptport wird je Lauf
zufällig aus 90 Nummern gezogen, das Datenverzeichnis ist ein frisches
`mkdtemp`.

**Wiederholen ließ es sich nicht:** sechs volle Läufe danach waren grün, alle
sieben mit **3451 von 3451**. Der betroffene Weg — Einrichtung, `users`,
`scrypt` — ist von dieser Nacharbeit **nicht angefasst**; geändert wurden
`public/`, `pruefung.js` und `gegenprobe.js`.

**Was fehlt, ist die Auskunftszeile des Laufs, und das ist mein Fehler:** die
Ausgabe war beim ersten Durchgang gefiltert, und die Zeile unter dem roten
Punkt hätte gesagt, ob die Tabelle **null** oder **zwei** Zeilen trug. Die
späteren Läufe sind vollständig mitgeschrieben worden. **Der Befund bleibt
offen und steht im Projektstand, Abschnitt 8** — er ist nicht wegerklärt,
sondern nicht reproduziert.

### Befund U — die Marke läuft nicht aus der Farbwelt, sie trägt Gold

**Der Auftrag 0.9.10 nennt unter Punkt 0 einen Farbabgleich als Arbeit:** der
hervorgehobene Strich der Marke sei `#ffc531`, `--accent` der Anlage
`#ff7a1a`. **Beim Nachsehen ist `#ffc531` genau `--gold`** — die Farbe der
Sterne, seit jeher der zweite Signalwert der Anlage neben Orange.

**Damit ist die Frage eine andere als gestellt.** Die Marke läuft nicht aus der
Farbwelt heraus; sie nimmt den zweiten Wert daraus. Die Wahl zwischen Gold und
Akzent ist eine Gestaltungsfrage und keine Berichtigung — **entschieden wird
sie in 0.9.10**, und der Auftrag ist entsprechend nachgezogen. Geändert wurde
in dieser Nacharbeit **nichts** daran.

### Befund V — der Fingerprint hat im Feld etwas gefunden, das kein Test sehen kann

**Nach dem Einspielen der Nacharbeit meldete die laufende Anlage `fad3e5ed`** —
und das war der Stand keines einzigen Commits. Nachgemessen wurde nicht
gerechnet: je ein echter Server aus einem sauberen `git archive`-Export, gefragt
über `GET /api/stats`.

| Stand | Fingerprint |
|---|---|
| Branchspitze mit der Nacharbeit | `3cf1b093` |
| davor, Marke eingebaut | `d629e78d` |
| `main` mit den hochgeladenen SVGs | `cb73399d` |
| `main` davor | `46af7459` |
| Knopf „Zugang anfragen" | `63b6bb59` |
| Karte berichtigt | `8f226ddc` |
| Selbstanmeldung gebaut | `1b538f1f` |
| 0.9.0 | `82dc8550` |

**Keiner davon war es.** Der Fingerprint deckt genau zwölf Dateien ab — sieben
geladene Module samt `package.json` und alles unter `public/` —, und zwischen
allen Ständen oben unterscheiden sich nur drei: `public/app.js`,
`public/index.html`, `public/style.css`. Die Abweichung musste also in `public/`
liegen.

**Sie lag an einer Datei ZU VIEL.** `public/marke-hell.svg` war in dieser Runde
entfernt worden und auf dem Wirt liegen geblieben. Nachgestellt: derselbe Export
der Branchspitze, dieselbe Datei wieder hineingelegt — **`fad3e5ed`**, Zeichen
für Zeichen. Nach dem Löschen auf dem Wirt meldete die Anlage `3cf1b093`.

**Das ist der erste Fall, in dem der Fingerprint im Betrieb etwas gefunden hat,
und er ist genau der Fall, für den es sonst nichts gibt.** Der Server lief
einwandfrei, die Oberfläche war die neue, jede Prüfung im Prüfstand war grün —
**der Prüfstand kann eine Datei zu viel auf einem fremden Wirt nicht sehen.**
Der Fingerprint geht über **alles**, was unter `public/` liegt, und nicht über
eine Liste erwarteter Namen; deshalb schlägt er in beide Richtungen aus. *Wäre
er eine Liste, hätte er hier geschwiegen.*

**Zwei Dinge sind daraus nachgezogen worden.** Im README stand bisher, ein
abweichender Fingerprint heiße „der Dateisatz ist **unvollständig**
eingespielt" — das deckt nur die eine Hälfte. Dort steht jetzt beides, samt
dem Handgriff, der die Ursache in einem Zug nennt: die Prüfsummen der zwölf
Dateien nebeneinander; **eine Zeile zu viel wiegt genauso schwer wie eine
falsche.** Und Stolperstein **158** hält die allgemeine Form fest.

*Was der Fingerprint weiterhin nicht sagt, ist WELCHE Datei abweicht.* Er sagt
nur, dass etwas abweicht. Eine Zeile in der Karte „Anlage", die die abweichende
Datei beim Namen nennt, ist als Arbeit für 0.9.30 vorgemerkt.

---

## 5. Neue Stolpersteine

Die Zählung setzt bei **149** fort; 141 bis 148 sind vergeben. **154 kommt aus
einer stummen Gegenprobe** und ist damit der beste Beleg dafür, wozu sie da sind;
**158 kommt aus dem Betrieb** und ist der erste, den der Fingerprint gefunden
hat. Der Wortlaut steht im Projektstand, Abschnitt 6.

| Nr | Kern |
|---|---|
| **149** | Eine Marke belegt nur, was sie wirklich durchlaufen hat — die Testmail enthält keinen Link. |
| **150** | Eine Antwort, die überall gleich **aussehen** muss, muss überall gleich lange **dauern**. |
| **151** | Wer eine Wirkung prüft, die NACH der Antwort eintritt, wartet auf die Sache, nicht auf die Uhr. |
| **152** | Eine neue Portbasis kann den **Versatz** zu klein machen, nicht nur eine gesperrte Nummer treffen. |
| **153** | Zwei Kästen mit denselben festen Kennungen sind einer zu viel. |
| **154** | Eine Lage, die zwei Schranken zugleich reißt, prüft keine von beiden. |
| **155** | Ein Bedienelement, das seinen eigenen Zustand ein- und ausschaltet, darf nicht an diesem Zustand hängen. |
| **156** | Eine Verneinung über die eigene Quelle trifft auch die Stelle mit, die die Sache richtig macht — gezählt wird, nicht verneint. |
| **157** | Zwei Namen für dieselbe Datei sind eine Stelle, die auseinanderläuft; verglichen wird der Inhalt, nicht der Name. |
| **158** | Ein Einspielweg, der Dateien kopiert, entfernt keine — eine gelöschte Datei bleibt auf dem Wirt liegen und läuft mit. |

---

## 6. Der Prüfstand

**3451 von 3451 bestanden** — 259 neue Prüfungen, **neunzehn** neue Gruppen.
*(Beim Einspielen waren es 3432 und achtzehn; die Nacharbeit an der
Anmeldeseite — Befunde P bis S — hat neunzehn Prüfungen und die Gruppe „Die
Markenzeile der Anmeldeseiten" gebracht.)*

| Gruppe | Was sie festhält |
|---|---|
| Die Selbstanmeldung: die immer gleiche Antwort | fünf Lagen, Statuscode und Rumpf **Byte für Byte**, dazu die **Laufzeiten** am tröpfelnden Empfänger |
| … der Schalter aus | dieselbe Antwort, keine Zeile, `GET /api/config` sagt es, und die Schlüsselliste bleibt abgeschlossen |
| … der Schalter braucht drei Dinge | ohne Mailzugang, ohne Testmail, ohne öffentliche Adresse — jedes einzeln |
| … die Bestätigungsmail | echtes SMTP-Gespräch, Empfänger, Absender, Link im Fragment, der Text und sein Warnsatz |
| … der Bestätigungslink hat keine Passwortkraft | kein Zugang, kein Token, keine Sitzung, kein Cookie — geprüft am Zustand danach |
| … die unbestätigte Anfrage | erscheint nicht, lässt sich weder freischalten noch ablehnen |
| … das Verfallen und das Aufräumen | 23 Stunden bleiben, 25 fallen, die bestätigte bleibt, und die dritte Aufrufstelle trägt |
| … der Deckel | die einundzwanzigste wird still verworfen, die Liste bleibt bei zwanzig, darunter geht es wieder |
| … die Freischaltung | Zugang **mit** Token, Zeile weg, Protokollzeilen, und der Tokenweg aus 0.8.80 **unverändert** bis zum gesetzten Passwort |
| … die Rolle ist immer user | Rumpf, Abfrage und Kopf — alle drei ohne Wirkung |
| … die Ablehnung | Zeile weg, **kein** Zugang, keine Mail, Protokollzeile ohne Namen |
| … keine Zeile, die ein Fremder auslösen kann | Anfrage, Bestätigung und geratene Bestätigung schreiben zusammen nichts |
| … die Bremse greift an beiden Routen | Übergang zwischen zehn und elf, nachgerechnet |
| … die Tabelle legt sich selbst an | von Hand entfernt, ein Start legt sie wieder an; **eine Spalte wächst nicht nach** |
| Die Anmeldeseite: das Anfrageformular | steht nur bei eingeschaltetem Schalter, kein Passwortfeld, der Rumpf trägt nur Name und Adresse |
| Die Bestätigungsseite in der Oberfläche | Schlüssel im Rumpf, kein Passwortfeld, niemand ist angemeldet, die eine Absage |
| Die Karte „Anfragen" | Liste, Freischalten und Ablehnen über **zugestellte** Ereignisse, die rote Zeile und ihre Gegenlage |
| Die Markenzeile der Anmeldeseiten | *(aus der Nacharbeit)* im gebauten Baum: die Zeile, genau zwei Kinder, `IMG` vor `H1`, keine zweite Marke daneben, das Zeichen stumm |

**Erweitert:** `F_ROUTEN` samt Zahl **64**; die geschlossenen Listen aus
`auth.js` samt ihren Zahlen (siebzehn Vorgänge, dreizehn Merkmale, sieben
Zwecke); die Schlüsselliste von `GET /api/config` (fünf Namen); die Kartenzahl
**neunzehn** in beiden Lagen; die dritte breite Kachel; die gekürzten Zeilen auf
der Einladungsseite.

**Aus der Nacharbeit dazu, in „Die Marke der Anlage" und „Die Anmeldeseite:
das Anfrageformular":** die Markenzeile in der **Quelle** (der Helfer legt sie
an, das Paar steht genau **einmal** in `app.js`) und im **Stylesheet**
(`display: flex`, `align-items: center`, eine Lücke, kein eigener Unterrand am
h1); die Trennung **ohne Strich** samt gemessenem Abstand; die Färbung des
zweiten Wegs **in beide Richtungen** — dass Farbe da ist und dass sie leise
bleibt, wobei die Deckung beider Palettenwerte **gemessen** wird und unter 0,5
liegen muss; und die allgemeine Zeile, dass in `public/` **keine Datei zweimal
unter zwei Namen** liegt, samt ihrer Gegenlage, dass überhaupt Dateien darin
liegen.

**Kein Migrationsabschnitt — es gibt keinen Block.** Stattdessen die Probe
selbst, und sie wird ausdrücklich gesagt: **das Schema einer gewachsenen Anlage
ist nach dem Start dasselbe wie das einer frischen.** Verglichen werden alle
Tabellen, nicht nur die neue.

**Drei neue Portbasen — ausgerechnet, nicht geschätzt** (Stolpersteine 64 und
127): **6700**, **6760**, **6820**. 6550 fiel aus, weil sein Fenster die
gesperrte 6566 deckte, 6610 wegen 6665–6669 und 6670 wegen 6679 und 6697. Mit
den Versätzen 3000/6000/9000/12000 trifft keine der drei eine Sperrnummer, und
die höchste bleibt unter 32768. **Der SMTP-Empfänger aus 0.9.0 ist
wiederverwendet**, seine Basis 6110 bleibt.

**Die Abhängigkeitszahl bleibt, wo sie ist:** `npm ls --omit=dev` liefert
unverändert **122** Pfade.

---

## 7. Gegenprobentabelle

**58 Gegenproben, jede in einer eigenen Kopie aus `git archive HEAD`**,
gefahren über `gegenprobe.js` mit vier Nebenspuren. **51 sind neu** (31 bis 81,
ohne 45 — siehe Abweichung D), drei sind nachgezogen (07, 14 und 30 zielten auf
Zeilen, die diese Runde verschoben hat), zwei sind die Wächter über den
Prüfstand selbst. *Neun davon — 73 bis 81 — kommen aus der Nacharbeit an der
Anmeldeseite; 69 und 70 sind dabei neu gezielt worden, weil die Zeilen, auf die
sie zeigten, sich verschoben haben.*

**Rückbau 63 ist nach der Berichtigung aus Befund M neu gezielt** und in einem
eigenen Lauf gefahren: er stellt die alte, verdeckende Bedingung wieder her.

**Sieben Läufe waren beim ersten Mal stumm oder rissen ab, und jeder einzelne
hat etwas gesagt** — vier echte Lücken in der Prüfung (36, 39, 41, 66) und drei
Läufe, die abrissen statt rot zu werden (48, 56, 58). **Rückbau 36 riss danach
ein zweites Mal ab, aus einem anderen Grund** (Befund L). Alles steht in den
Befunden H bis L und ist abgearbeitet.

**In der Nacharbeit kam eine achte stumme dazu: Rückbau 80.** Er gibt der
Überschrift in der Markenzeile ihren Unterrand zurück (`margin: 0 0 5px`), und
kein einziger Punkt wurde rot. **Die Prüfung las nur den Anfang des Wertes** —
`margin: *0` passte auf die Null davor und sah den Unterrand dahinter nicht.
Gemessen wird jetzt der ganze Wert. *Das ist der achte Beleg dafür, wozu die
Gegenproben da sind, und der erste, der eine Prüfung aus derselben Sitzung
getroffen hat.*

**Die Tabelle unten ist der Stand DANACH: null stumm, null abgerissen.**

| # | Rückbau | Namentlich rot |
|---|---|---|
| 07 | Ohne oeffentliche Adresse wird trotzdem verschickt | „Ohne oeffentliche Adresse wird NICHT verschickt", „Und der Grund nennt die Einstellung", „Der Empfaenger hat wirklich nichts bekommen" |
| 14 | Die Marke gilt auch nach einer Aenderung am Zugang weiter | 6 Prüfungen, darunter „Und die Marke ist danach weg" (3 Gruppen) |
| 30 | Die Frist steht nicht mehr auf der Einladungsseite | „Die Einladungsseite nennt die Frist ab dem ersten Oeffnen", „Und sagt, dass Neuladen in dieser Zeit erlaubt ist", „Und was danach zu tun ist" |
| 31 | Die Antwort verraet, dass still verworfen wurde | 4 Prüfungen, darunter „Und mit demselben Rumpf -- Byte fuer Byte" (3 Gruppen) |
| 32 | Die Antwort wartet wieder auf den Mailserver | „Keine der fuenf Lagen wartet auf den Mailserver", „Es geht keine Absagemail hinaus -- Benachrichtigungen gibt es nicht" |
| 33 | Der Schalter aus fuehrt zu einer eigenen Absage | „Die Anfrage bei ausgeschaltetem Schalter bekommt DIESELBE Antwort" |
| 34 | Der Deckel faellt ganz weg | „Und sie wird still verworfen -- die Liste bleibt bei zwanzig", „Ihr Name steht in keiner Zeile", „Die Karte nennt den Stand gegen den Deckel" |
| 35 | Der Deckel zaehlt nur die BESTAETIGTEN | „Und sie wird still verworfen -- die Liste bleibt bei zwanzig", „Ihr Name steht in keiner Zeile", „Die Karte nennt den Stand gegen den Deckel" |
| 36 | Eine zweite Anfrage je Adresse geht durch | „Und wird still verworfen -- es entsteht keine zweite Zeile", „Und auch dabei bleibt es bei der einen Zeile", „Und keine von beiden hat eine Zeile angelegt" |
| 37 | Ein vergebener Benutzername kommt in die Warteschlange | „Die Anfrage steht trotzdem in der Tabelle", „Und keine der vier stillen Lagen hat eine zweite angelegt" |
| 38 | Eine vergebene Adresse ebenso | „Die Anfrage steht trotzdem in der Tabelle", „Und keine der vier stillen Lagen hat eine zweite angelegt" |
| 39 | Name und Adresse von aussen sind wieder unbegrenzt lang | „Und keine von beiden hat eine Zeile angelegt" |
| 40 | Unbestaetigte Anfragen verfallen nicht mehr | 4 Prüfungen, darunter „Eine von 25 Stunden faellt -- zweite Aufrufstelle, die Karte" (Gruppe „Die Selbstanmeldung: das Verfallen und das Aufraeumen") |
| 41 | Auch die BESTAETIGTEN verfallen | 4 Prüfungen, darunter „Und sie bleibt trotzdem stehen -- eine bestaetigte Anfrage verfaellt NICHT" (Gruppe „Die Selbstanmeldung: das Verfallen und das Aufraeumen") |
| 42 | Die Anfrageroute raeumt nicht mehr vor der Deckelpruefung auf | „Und sie geht durch, weil die Anfrageroute selbst aufgeraeumt hat", „Die neunzehn alten sind dabei gefallen" |
| 43 | Der Schalter laesst sich ohne durchgekommene Testmail einschalten | 5 Prüfungen, darunter „Und die Karte sagt, dass der Versand nicht mehr traegt" (3 Gruppen) |
| 44 | Der Schalter laesst sich ohne oeffentliche Adresse einschalten | „Und trotzdem laesst sich der Schalter nicht einschalten", „Denn ohne OEFFENTLICHE_ADRESSE traegt der Link in der Mail nicht", „Er bleibt danach aus" |
| 46 | Ausschalten wird an dieselbe Bedingung gehaengt wie Einschalten | 4 Prüfungen, darunter „Ausschalten geht immer -- auch mit kaputtem Versand" (Gruppe „Die Selbstanmeldung: der Schalter aus") |
| 47 | Der Schalter legt sich bei kaputtem Versand selbst um | „Der Schalter bleibt an, wenn der Versand kaputtgeht" |
| 48 | Der Bestaetigungsschluessel steht im Klartext in der Tabelle | 46 Prüfungen, darunter „In der Tabelle steht nur der Hash, nie der Schluessel" (8 Gruppen) |
| 49 | Die Bestaetigung nimmt jeden Schluessel an | 7 Prüfungen, darunter „Ein erfundener Schluessel wird abgewiesen" (2 Gruppen) |
| 50 | Die Karte gibt den Hash der Anfrage mit heraus | „Der Bestaetigungsschluessel steht in der Antwort nicht" |
| 51 | Die unbestaetigte Anfrage erscheint beim Admin | „Der Admin sieht davon nur die bestaetigte" |
| 52 | Die unbestaetigte Anfrage laesst sich freischalten | 6 Prüfungen, darunter „Und sie laesst sich auch ueber ihre Nummer nicht freischalten" (3 Gruppen) |
| 53 | Die Rolle kommt aus dem Rumpf der Anfrage | „Eine Rolle im Rumpf aendert nichts", „Alle drei stehen in der Datenbank als user", „Die Zahl der Eigentuemer und Admins hat sich nicht bewegt" |
| 54 | Die Zeile bleibt nach der Freischaltung stehen | „Die Zeile in der Warteschlange ist weg", „Und die Antwort traegt die neue, leere Liste gleich mit" |
| 55 | Die Freischaltung erzeugt keinen Token | 8 Prüfungen, darunter „Ein Einladungstoken kommt mit" (Gruppe „Die Selbstanmeldung: die Freischaltung") |
| 56 | Die Protokollzeile der Freischaltung faellt weg | „Eine Zeile anfrage.frei steht im Sicherheitsprotokoll", „Sie nennt den handelnden Admin und den neuen Zugang als Nummern", „Und sie traegt kein Merkmal" |
| 57 | Die Ablehnung entfernt die Zeile nicht | „Die Zeile ist weg", „Und die Antwort traegt die neue Liste gleich mit" |
| 58 | Der Name des Abgewiesenen soll ins Protokoll | 4 Prüfungen, darunter „Die Protokollzeile anfrage.ab steht" (2 Gruppen) |
| 59 | Die Anfrage selbst schreibt eine Protokollzeile | 4 Prüfungen, darunter „Eine Zeile anfrage.frei steht im Sicherheitsprotokoll" (2 Gruppen) |
| 60 | Die Bremse fehlt an der Anfrageroute | „Die Anfrageroute ist damit ebenfalls gesperrt", „Und die Absage nennt die Wartezeit" |
| 61 | Die Bremse fehlt an der Bestaetigungsroute | „Der elfte ist der erste gesperrte", „Der Uebergang liegt genau zwischen zehn und elf" |
| 62 | Das Anfrageformular steht auch bei ausgeschaltetem Schalter da | „Ist die Selbstanmeldung aus, steht auf der Anmeldeseite kein Formular", „Und auch die Frage darueber nicht" |
| 63 | Die Karte „Anfragen“ verschwindet, solange der Schalter aus ist | 4 Prüfungen, darunter „Ist die Selbstanmeldung aus und nichts offen, steht die Karte ‚Anfragen' trotzdem" (Gruppe „Der Systembereich nach Rolle") |
| 64 | Die rote Zeile bei kaputtem Versand faellt weg | „Ist der Versand kaputt, steht die rote Zeile da", „Sie nennt den Grund des Servers", „Und sagt, dass der Schalter trotzdem an bleibt" |
| 65 | Die Bestaetigungsseite meldet gleich an | 6 Prüfungen, darunter „Der Aufruf mit einem Bestaetigungslink fragt den Server nach ihm" (Gruppe „Die Bestaetigungsseite in der Oberflaeche") |
| 66 | Die gekuerzte Zeile im Mailtext verliert eine Auskunft | „Und was danach zu tun ist" |
| 67 | Derselbe Wunschname darf zweimal in der Warteschlange stehen | „Und auch dabei bleibt es bei der einen Zeile", „Und keine von beiden hat eine Zeile angelegt" |
| 68 | Der Weg zur Anfrage wird wieder ein Verweis statt eines Knopfes | „Und zwar als KNOPF, nicht als Verweis in einer Fusszeile", „Er traegt dieselbe Knopfklasse wie "Anmelden"" |
| 69 | Der gedaempfte Knopf verliert auch seine Umrandung | „Und zieht die Umrandung in dieselbe Farbe", „Aber NICHT ohne Umrandung -- sonst waere er wieder ein Verweis" |
| 70 | Die Oberflaeche nimmt die Marke MIT Kachel | „Die Oberflaeche laedt die Marke als Datei", „Und zwar die durchsichtige, nicht die mit Kachel" |
| 71 | Die Marke heisst wieder wie die Kommentarknoepfe | 4 Prüfungen in 2 Gruppen, darunter „Die Marke traegt NICHT die Klasse der Kommentarknoepfe" |
| 72 | Der Tab bekommt kein Favicon mehr | „Der Tab bekommt die Marke als Favicon" |
| 73 | Der Strich ueber dem Anfrageknopf kommt zurueck | „Und sie tut das OHNE Strich", „Sondern mit einem Abstand, der groesser ist als jede Luecke davor" |
| 74 | Und der Abstand, der ihn ersetzt, schrumpft auf nichts | „Sondern mit einem Abstand, der groesser ist als jede Luecke davor" |
| 75 | Der Anfrageknopf verliert seine leichte Faerbung | „Sie faerbt ihn leicht ein statt ihn leer zu lassen", „Und zieht die Umrandung in dieselbe Farbe" |
| 76 | Der Anfrageknopf wird so laut wie „Anmelden" | 3 Prüfungen, darunter „Er traegt NICHT den vollen Akzent des Anmeldeknopfs" |
| 77 | Marke und Name stapeln sich wieder uebereinander | 7 Prüfungen in 2 Gruppen, darunter „Die Anmeldeseite traegt eine Markenzeile" |
| 78 | Erst das Wort, dann das Zeichen | 6 Prüfungen in 2 Gruppen, darunter „Erst das Zeichen", „Dann das Wort" |
| 79 | Die Markenzeile ist keine Zeile mehr | „Und das Stylesheet stellt sie wirklich nebeneinander", „Mit einer Luecke dazwischen" |
| 80 | Die Ueberschrift in der Zeile traegt wieder einen Unterrand | „Und die Ueberschrift traegt darin keinen eigenen Unterrand" *(war beim ersten Lauf **stumm** — siehe oben)* |
| 81 | Dieselbe Datei liegt wieder unter zwei Namen in public/ | „Und eine dritte Fassung liegt nicht mehr daneben", „In public/ liegt keine Datei zweimal unter zwei Namen" |
| W2 | Eine Portbasis liegt wieder auf der gesperrten 4045 | „Keine Portbasis deckt eine Nummer, die fetch() nicht anwaehlt" |

---

## 8. Prüfungszahlen

| | |
|---|---|
| Vorher (0.9.0) | 3192 |
| Nachher (0.9.1, eingespielt) | 3432 |
| Nachher (0.9.1 samt Nacharbeit) | **3451** |
| Neu | **259** |
| Gegenproben | **58** |

---

## 9. Was ausdrücklich nicht passiert ist

* **Keine zweite Betriebsart.** Es gibt keine Lage, in der der geklickte Link
  allein freischaltet.
* **Keine Absagemail.** Wer abgelehnt wird, bekommt nichts — das wäre eine
  Benachrichtigung, und die gibt es hier nicht; sie wäre außerdem ein Weg,
  jemandem auf Zuruf Post zu schicken.
* **Kein Migrationsblock.** Es bleibt bei fünf markierten.
* **Keine neue `.env`-Zeile**, und die `docker-compose.yml` ist unberührt.
* **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
* **Kein neues Merkmal im Sicherheitsprotokoll.** `MERKMALE` bleibt dreizehn.
* **Keine zweite Bestätigung an der Freischaltung.** `BESTAETIGUNG_ZWECKE`
  bleibt sieben.
* **Die Formatnummer bleibt bei 10**, das Vokabular bei elf.
* **Der Tokenweg aus 0.8.80 ist unangetastet** — dieselben sieben Tage,
  dieselbe eine Absage, dieselbe Frist ab dem ersten Öffnen.
* **Die Anmeldebremse behält ihre Kennwerte.**
* **`users.email` bekommt keinen dritten Schreibweg.** Die Adresse einer
  freigeschalteten Anfrage geht über `legeZugangAn`, also über den vorhandenen
  Weg beim Anlegen.
* **`schluessel.js`, `schluessel.sh`, `zugang.js`, `anhaenge.js` und `keys.js`
  sind unberührt.**
* **Farbschema, `katalog.sqlite`, `HINTER_PROXY`, die Content-Security-Policy,
  die Sortierung der Übersicht, das Austauschformat, der Papierkorb, die
  Sicherung, `ordneBestandZu()` und die Rollenleiter sind unangetastet.**

---

## 10. Offen geblieben

* **Der Schlüsselwechsel auf der echten Anlage.** Geprobt (elf Sekunden
  Stillstand an 662,5 MB), gefahren noch nicht. Er läuft über
  `./schluessel.sh wechseln` auf dem Wirt und braucht keine Runde und keinen
  Auftrag; das Ergebnis gehört in den Projektstand, Abschnitt 2.
* **0.9.10 — Zwei-Faktor.** TOTP und Wiederherstellungscodes. Die zweite
  Bestätigung aus 0.8.90 ist die Stelle, an der er zusätzlich gefragt würde.
  **Der Satz „E-Mail ist Bequemlichkeit, nie Voraussetzung" trägt dort nicht:**
  ein zweiter Faktor braucht kein Netz und darf nie ausfallen.
* **Eine Runde für Fehlerbehebung und Nacharbeit — sie hat jetzt eine Nummer:
  0.9.30.** *In diesem Papier stand zunächst „etwa auf 0.9.20"; dort liegt aber
  schon „Suche und Bestand".* Der Fahrplan bis zur Veröffentlichung ist nach
  dieser Runde festgelegt worden und steht im Projektstand, Abschnitt 10:
  **0.9.20 Suche und Bestand, 0.9.30 Fehlerbereinigung, vermutlich 0.9.60 die
  Bereinigung von Code und Datenbankstruktur — ab dort ohne Rückweg auf ältere
  Fassungen —, und 0.9.90 die Veröffentlichung statt 1.0.0.**
* **Die Farbe der Marke.** `#ffc531` ist `--gold` und nicht `--accent`; ob das
  so bleibt, ist eine Gestaltungsfrage und steht als Arbeit im Auftrag 0.9.10,
  Punkt 0. Siehe Befund U.
* **Der abgerissene Prüflauf aus der Nacharbeit** (Befund T). Nicht
  reproduziert in sechs Läufen danach, nicht wegerklärt; er steht im
  Projektstand, Abschnitt 8.
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt. Zweiter Weg im Code, ohne Bibliothek, mit `fetch`.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für 1.1.0.
* **Die Eindeutigkeit der Adresse** ist weiterhin nicht erzwungen. Die
  Selbstanmeldung weist eine Adresse ab, die schon an einem Zugang hängt — das
  ist eine Prüfung im Code, kein `UNIQUE` in der Tabelle. Der Weg dorthin steht
  im Konzeptpapier, Abschnitt 10: ein **partieller Index**, wenn er gebraucht
  wird, nicht vorher.

---

**0.9.1 — Fingerprint `3cf1b093`**
*(beim Einspielen `d629e78d`; die Nacharbeit an der Anmeldeseite hat ihn
weitergedreht, ohne die Versionsnummer zu bewegen)*
