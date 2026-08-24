# Änderungsprotokoll 0.8.71 — „Der Sicherungsort zieht um"

Berichtigungsrunde, keine Stufe des Stufenplans. Sie nimmt eine der neun
freien Nummern zwischen 0.8.70 und 0.8.80 — dieselbe Bauform wie 0.8.1, 0.8.6
und 0.8.31. Vorgänger: 0.8.70, Fingerprint `1aa9266a`, 2381 Prüfungen.

**Fingerprint 0.8.71 — `1b03fabf`**

---

## 1. Was gebaut wurde, je Datei

**`docker-compose.yml`** — der Sicherungsort wandert vom übergeordneten
Verzeichnis ins Projektverzeichnis: `../kriterion-sicherung:/sicherung` wird zu
`./kriterion-sicherung:/app/sicherung`, `SICHERUNG_DIR` entsprechend. Der
Kommentar darüber nennt jetzt drei Dinge: dass das die bequeme und nicht die
sichere Lage ist, wie man auf die sichere umstellt, und dass die Rot-Grün-Anzeige
an der **Spiegelung** hängt — was auf dem Wirt unter `./` liegt, gehört im
Container unter `/app`.

**`server.js`** — ein neues `ANWENDUNG_DIR` (der aufgelöste `__dirname`) und ein
neues Feld `imArbeitsverzeichnis` in `sicherungLage()`, durchgereicht von
`GET /api/sicherung`. Es ist eine **Auskunft, keine Schranke**: der Ort wird
nicht abgewiesen, er wird benannt.

**`public/app.js`** — `drawSicherung()` setzt an erster Stelle einen Kasten mit
der Kennung `sich-lage`: `warn-box` (rot) im Arbeitsverzeichnis, `ok-box` (grün)
außerhalb. Beide nennen den Grund, der rote zusätzlich, wo umgestellt wird.

**`public/style.css`** — unberührt. `warn-box` und `ok-box` gab es beide schon.

**`.gitignore` / `.dockerignore`** — `kriterion-sicherung*/` bzw.
`kriterion-sicherung` aufgenommen: der Ordner liegt jetzt im Projekt und hätte
sonst im Arbeitsbaum und im Image gestanden.

**`.env.example`** — der Verweis auf die Einhängung nachgezogen, dazu der
Hinweis auf die rote Markierung.

**`README.md`** — der Abschnitt „Sichern" trägt die neue Einhängung, einen
eingerückten Block über die Lage samt Umstellanleitung, und der Einspielweg hat
**eine Zeile mehr**: `mv kriterion-alt/kriterion-sicherung kriterion/`. Der
Eintrag zur Karte „Sicherung" im Systembereich nennt die Rot-Grün-Anzeige.

**`pruefung.js`** — 17 neue Prüfungen (2381 → 2398), verteilt auf drei
vorhandene Gruppen. Keine neue Gruppe: die Sache gehört zu dem, was schon
geprüft wird, und eine eigene Gruppe hätte sie davon getrennt.

**`package.json` / `package-lock.json`** — Version `0.8.71`.

---

## 2. Die Fragen, die vorher zu klären waren

**A. „Sicherung einspielen" gegen „eine neue Version einspielen".** Beim ersten
Vorschlag stand die Warnung verkürzt als „beim Einspielen wird umbenannt" da,
und das war missverständlich: eine **Sicherung** einzuspielen benennt gar nichts
um — es ist eine einzelne Datenbankdatei, die an ihren Platz kopiert wird. Das
Umbenennen (`kriterion` → `kriterion-alt`) gehört zum Einspielen einer neuen
**Version**. Beide Texte in Oberfläche und README sagen das jetzt ausdrücklich.

**B. Braucht es einen Schalter, der den Sicherungsordner beim Einspielen
verschiebt?** Nein — und er könnte es auch nicht. Zum Zeitpunkt des Umbenennens
läuft nichts von Kriterion; `docker compose down` ist der erste Befehl des Wegs.
Ein Schalter in der `.env` würde von einem Prozess gelesen, den es gerade nicht
gibt. Automatisch ginge es nur über ein eigenes Skript im Repo — und das stünde
als **zweite Wahrheit** neben dem README-Weg (Stolperstein 47). Der Weg trägt
ohnehin bereits zwei Dinge hinüber (`data/` und `.env`); ein drittes ist **eine
Zeile in derselben Liste**, keine neue Bauform.

**C. Wird der Ort im Arbeitsverzeichnis abgewiesen?** Nein. Der vorhandene
Riegel gegen den Ort **im Datenverzeichnis** bleibt eine Absage — dort läge die
Kopie in dem Verzeichnis, das sie schützen soll. Der Ort im Arbeitsverzeichnis
ist eine Stufe milder und wird **benannt statt verboten**: eine Sicherung am
falschen Ort ist besser als keine, und der Auslieferungszustand ist ab jetzt
genau dieser Fall. Ein Riegel, den die eigene Vorgabe verletzt, wäre absurd.

**D. Woran hängt die Aussage?** Am aufgelösten `__dirname` des Prozesses. Der
Container sieht den Wirt nicht — er kann nicht wissen, ob `/sicherung` draußen
neben oder im Projektverzeichnis liegt. Die Aussage trägt deshalb **nur, solange
die Einhängung die Lage spiegelt**. Das ist eine echte Voraussetzung und keine
Formsache; sie steht im Quelltext, in der `docker-compose.yml`, in der README —
und ein Wächter im Prüfstand hält sie fest.

**E. Wurzel oder Unterverzeichnis?** Die Lage gilt für die **Wurzel**
(`SICHERUNG_DIR`), nicht für das in der Oberfläche gewählte Unterverzeichnis.
Sie ist eine Eigenschaft der Einrichtung und ändert sich nicht, wenn jemand den
Zielort umstellt. Deshalb steht sie auch dann da, wenn der gewählte Zielort
gerade einen Fehler meldet.

**F. Eine neue Farbe im Stylesheet?** Nein. `warn-box` und `ok-box` gab es
beide bereits. Eine dritte Kastenart für denselben Zweck wäre eine zweite
Wahrheit über „rot" und „grün".

---

## 3. Abweichungen

**A. `.gitignore` und `.dockerignore` wurden angefasst** — beide standen nicht
auf der Liste der erwarteten Dateien. Sie mussten: der Sicherungsordner liegt
jetzt im Projekt, und ohne die Einträge stünde er im Arbeitsbaum und würde beim
Bau ins Image kopiert.

**B. Keine neue Prüfgruppe.** Die 17 Prüfungen sind in „Umbenennung auf
Kriterion" (die Wächter über die `docker-compose.yml`), „Die Sicherung auf
Knopfdruck" (serverseitig) und „Die Sicherung in der Oberfläche" (rot/grün)
eingehängt. Eine eigene Gruppe hätte die Sache von dem getrennt, wozu sie
gehört.

**C. Der Auslieferungszustand zeigt rot.** Das ist gewollt und ausdrücklich so
entschieden: die Vorgabe ist die bequeme Lage, und die Karte sagt, was daran
unbequem ist. Wer den grünen Fall will, bekommt in derselben Karte gesagt, wie.

---

## 4. Neue Stolpersteine

**123. Eine Aussage über die Welt draußen trägt nur, solange die Einhängung sie
spiegelt.** Der Prozess im Container kann nicht sehen, wo ein eingehängter Pfad
auf dem Wirt liegt — er sieht `/sicherung` und sonst nichts. Die Karte sagt
trotzdem „im Arbeitsverzeichnis" oder „außerhalb", und das ist zulässig, weil
die `docker-compose.yml` die Lage **spiegelt**: `./` draußen wird `/app`
drinnen. Diese Voraussetzung ist unsichtbar und deshalb gefährlich — sie gehört
an jede der drei Stellen geschrieben und in einen Wächter, der die
`docker-compose.yml` selbst liest. *Wer eine Aussage über etwas trifft, das er
nicht sehen kann, benennt die Brücke, über die sie trägt.*

---

## 5. Gegenprobentabelle

| Gegenprobe | Rückbau | rot geworden |
|---|---|---|
| `lage-immer-draussen` | server.js: 2 Zeilen geaendert | 1: „Ein Ort IM Arbeitsverzeichnis meldet sich als solcher" |
| `lage-immer-drinnen` | server.js: 2 Zeilen geaendert | 1: „Ein Ort ausserhalb des Arbeitsverzeichnisses meldet sich als solcher" |
| `kasten-fehlt` | public/app.js: 1 Zeilen geaendert | 7: „Die Karte sagt, wie der Sicherungsort liegt"; „Ausserhalb des Arbeitsverzeichnisses ist der Kasten gruen"; „Und er sagt, was daran gut ist"; „Im Arbeitsverzeichnis ist der Kasten rot"; „Und er sagt, dass es dringend anders empfohlen ist"; „Er nennt den Grund und nicht nur das Urteil"; „Und er sagt, WO es umgestellt wird" |
| `kasten-ohne-grund` | public/app.js: 4 Zeilen geaendert | 1: „Er nennt den Grund und nicht nur das Urteil" |
| `variable-ohne-einhaengung` | docker-compose.yml: 2 Zeilen geaendert | 2: „Und er ist wirklich eingehaengt -- Einhaengung und Variable laufen nicht auseinander"; „Die Einhaengung spiegelt die Lage: ./ draussen heisst /app drinnen" |
| `spiegelung-gebrochen` | docker-compose.yml: 2 Zeilen geaendert | 1: „Die Einhaengung spiegelt die Lage: ./ draussen heisst /app drinnen" |

**Keine Probe blieb stumm.** Jede trifft genau die Prüfungen, die sie treffen
soll, und keine weitere. Der Rückbau ist je Probe per `diff` gegen den
Arbeitsbaum belegt — die Kopien tragen kein `.git`, ein `git diff` darin wäre
immer leer gewesen und hätte wie ein nicht gegriffener Rückbau ausgesehen.
Gefahren wurde in Kopien des Arbeitsbaums (Stolperstein 100); der Treiber
beendet nach jedem Lauf die ganze Prozessgruppe (Stolperstein 122).

---

## 6. Prüfungszahlen

| | |
|---|---|
| Vorher (0.8.70) | 2381 |
| Nachher (0.8.71) | 2398 |
| Neu | 17 |
| Gegenproben | 6 |
| Neue Gruppen | keine |
| `F_ROUTEN` | unverändert 51 |
| Formatnummer | unverändert 10 |
| Migrationsblöcke | unverändert 5 |
| Karten im Systembereich | unverändert 15 |
| Vokabular | unverändert 11 |
| Neue Abhängigkeiten | keine |

---

## 7. Ausdrücklich nicht geändert

`db.js`, `auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`,
`public/style.css`, `Dockerfile`. Kein Schema, keine Route, keine Rechtefrage,
kein Austauschformat. Der Papierkorb und der Sicherungsvorgang selbst sind
unberührt — nur der Ort, an dem er schreibt, und die Auskunft darüber.

---

## 8. Offen geblieben

- **Die Sicherung liegt weiterhin auf derselben Platte wie das Original.** Der
  rote Kasten nennt es, gelöst ist es damit nicht. Eine Sicherung auf ein
  anderes Gerät ist eine eigene Sache und steht in keinem Auftrag.
- **Der Prozess kann die Lage auf dem Wirt nicht prüfen, nur die Spiegelung
  voraussetzen** (Stolperstein 123). Wer den Schnitt in der
  `docker-compose.yml` anders legt, bekommt eine falsche Farbe und keine
  Warnung darüber.
