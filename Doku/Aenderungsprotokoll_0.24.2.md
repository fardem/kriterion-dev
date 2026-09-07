# Änderungsprotokoll 0.24.2 — „Die gespeicherten Formen ziehen mit"

**PATCH, Datenbankstufe · 7. September 2026 · gebaut auf 0.24.1
(`9988912b`, Stand `4886ae2`) · Fingerprint dieser Runde `ae0084d8`.**

**0.24.1 hat die SCHLÜSSEL in `settings` umbenannt, nicht die Feldnamen IN
den gespeicherten Werten.** Für SQLite ist `settings.value` ein String und
sonst nichts; für den Quelltext ist derselbe String ein Gebilde mit
Feldnamen. Der Block aus 0.24.1 hat `sucheEigene` zu `searchOwn` gemacht und
dort aufgehört — und was in der Zeile lag, blieb deutsch.

*Diese Runde benennt die Feldnamen nach. Sie fasst sonst nichts an: kein
Schema, keine Route, kein Wort am Bildschirm, keine Zeile in `server.js` und
keine in `public/app.js`.*

---

## Der Befund aus dem Betrieb

**Am 7. September 2026 gemeldet, unmittelbar nach dem Einspielen von 0.24.1**
(Fingerprint `9988912b` — genau der Sollwert, nachgerechnet am Baum des
Grundsteins): *„die suchmaschieneneinstellungen hat es nicht mitgenommen,
also die der Eigentümer als Suchalternative selber eintragen kann"*.

Die Nachschau an einem echten 0.24.0er Bestand hat daraus **drei** gemacht:

| | im Bestand | der Quelltext liest | am Bildschirm |
|---|---|---|---|
| `settings['searchOwn']` | `{ name, vorlage }` | `e.template` | die eigenen Suchmaschinen fehlen in der Karte **und** im Vorrat der Suchzeile |
| `settings['mailzugang']` | `{ anbieter, benutzer, passwort, absender }` | `{ provider, user, password, sender }` | der Mailzugang gilt als nicht eingerichtet — **Einladung, Rücksetzung und Bestätigung gehen nicht mehr hinaus**, und die Selbstanmeldung lässt sich nicht mehr einschalten |
| `settings['mailtestOk']` | `{ marke, am }` | `{ mark, at }` | „zuletzt getestet" ist leer |

**Verloren war nichts.** Die Zeilen lagen unverändert da; `writePool()` läuft
nur im Schreibweg, und kein Lesevorgang schreibt zurück. *Das ist der
Unterschied zwischen „unsichtbar" und „weg" — und er entscheidet, ob eine
Runde eine Reparatur ist oder eine Entschuldigung.*

---

## Die Klasse ist geschlossen — dreizehn Schreibstellen, drei Gebilde

**Nachgezählt wurden ALLE Schreibstellen nach `settings` und `user_settings`
in 0.24.0.** Nicht die drei gemeldeten, sondern die dreizehn möglichen —
sonst wäre diese Runde eine Runde für den nächsten Befund derselben Art.

**Betroffen sind drei und kein viertes:**

* **Was als Zahl, Wahrheitswert oder String daliegt, hat keine Feldnamen.**
  `title_app`, `title_public`, `convertImages`, `signup`, `keyChangedAt`,
  `backupCleanup`, `backupKeep`, `backupPlace`, `backupDays` und die sieben
  persönlichen Zahlen in `user_settings`.
* **`searchOn` ist eine flache Liste von Schlüsseln** — die eingebauten
  heißen unverändert `google` bis `ecosia`, und `ownKey()` liefert weiter
  `eigen${i + 1}`.
* **`vocabulary` trägt die vierzehn Vokabelnamen**, und die bleiben deutsch —
  ausdrücklich entschieden am 6. September 2026, sie ziehen mit Stufe 2 um.
* **`blocks` trägt `seite`, `unten`, `zu`** samt den Blockkennungen
  (`kategorie`, `testtage`, `links` …) — in 0.24.1 ebenfalls nicht umgezogen.
* **`views` trägt `{ name, q, filters }`**, und `filters` trägt
  `categoryIds`, `tagIds`, `tagMode`, `tested`, `abgelehnt`, `favorit`,
  `sort` — in beiden Fassungen Zeichen für Zeichen dieselben Namen.
* **Der Papierkorb ist nicht betroffen:** `POST /api/trash/:id/restore` geht
  durch `importInto()`, und der trägt die Übersetzung des Austauschformats
  seit 0.24.1.

*Vier dieser Werte stehen als Gegenlage im Prüfstand: sie MÜSSEN nach der
Migration Zeichen für Zeichen dieselben sein. Ein Block, der alles anfasst,
wäre schlimmer als einer, der nichts tut.*

---

## Der Migrationsblock

`migration0242Shapes()` in `db.js`, **hinter dem Block aus 0.24.1 und vor
`db.exec(SCHEMA)`.** Die Reihenfolge ist keine Geschmacksfrage: gesucht wird
die Zeile unter ihrem NEUEN Schlüssel, und den gibt es erst, nachdem
`migration0241Values()` gelaufen ist. **Ein Bestand aus 0.24.0 durchläuft
beide Blöcke in einem einzigen Start.**

```
const SHAPES_0242 = [
  { key: 'searchOwn',  each: true,  pairs: { vorlage: 'template' } },
  { key: 'mailzugang', each: false, pairs: { anbieter: 'provider', benutzer: 'user',
                                             passwort: 'password', absender: 'sender' } },
  { key: 'mailtestOk', each: false, pairs: { marke: 'mark', am: 'at' } }
];
```

**Drei Zusagen stehen im Block selbst:**

1. **Wiederholbar und im Normalfall stumm.** Gefragt wird die Zeile — trägt
   sie den alten Namen? —, nicht ein Merker. Ein zweiter Start findet nichts
   und sagt nichts.
2. **Eine unlesbare Zeile wird übergangen, nicht verworfen.** Sie ist der
   einzige Ort, an dem der Zugang noch stehen könnte; ein Block, der sie
   wegwirft, weil er sie nicht versteht, richtet den Schaden an, den er
   verhindern soll.
3. **Trägt eine Zeile BEIDE Namen, gewinnt der neue.** Der Quelltext liest
   ihn, also ist er der Wert, der in Kraft ist; der alte fällt weg, damit
   nicht zwei Wahrheiten nebeneinander liegenbleiben. *Der Fall kann nur von
   Hand entstehen — aber ein Migrationsblock trifft im Feld genau das, was er
   für unmöglich hält.*

**`server`, `port` und `sicher` stehen NICHT in der Liste.** Sie hießen schon
in 0.24.0 so; `sicher` steht als benannte Grenze im Wächter und zieht mit
Stufe 2 um. *Stünden sie dabei, wäre die Liste eine Behauptung über 0.24.1,
die nicht stimmt.*

---

## Die Marke des Mailtests bleibt gültig

**Sie wird umbenannt und nicht gelöscht.** Die Marke ist ein Hash über die
WERTE des Zugangs in fester Reihenfolge, nicht über ihre Namen —
`mail.mark()` rechnet nach dem Umbenennen dieselbe Zahl wie `mail.marke()`
davor. *Eine gelöschte Marke hieße „teste noch einmal", und dazu gibt es
keinen Anlass: am Zugang hat sich nichts geändert.*

Der Prüfstand rechnet die Marke wie 0.24.0 sie gerechnet hat, schreibt sie in
den gestellten Bestand und hält danach fest, dass `mail.mark()` sie
wiedererkennt. *Ohne diese Zusage stünde „die Marke bleibt gültig" als
Behauptung da.*

---

## Der Wächter ist eine Datenbank, kein Quelltext

**Geprüft wird an einem echten Bestand.** Ein Wächter, der nachliest, ob
`SHAPES_0242` dasteht, wäre grün, sobald die Liste dasteht — und sagte nichts
darüber, ob sie greift. Die Gruppe legt deshalb eine Datenbank an, setzt sie
von Hand auf den Stand 0.24.0 (ALTE Schlüssel, ALTE Feldnamen darin), fährt
**einen** Start und liest danach mit dem Quelltext selbst: `mail.configured()`,
`mail.mark()`, die Prüfung der Suchvorlage.

**Vier Zusagen, die nicht am Inhalt der Zeile hängen, sondern an der Sache:**

* *Der gestellte Bestand trägt die alten Feldnamen* — ohne diese Zeile
  belegte alles Weitere nur, dass eine Datenbank dasteht.
* *Der geräumte zweite Platz bleibt `null`* — `null` ist kein Objekt, und ein
  Block, der daraus `{}` machte, ergäbe einen halben Anbieter.
* *Der zweite Start sagt nichts mehr* — gelesen wird dafür die GANZE Ausgabe
  des Kindes und nicht nur ihre letzte Zeile (`shortRunAll()`, neu in dieser
  Runde): ein Migrationsblock meldet sich VOR der Antwort, und eine Probe auf
  „stumm" wäre über die letzte Zeile immer grün.
* *Die Liste nennt nur Ziele, die der Quelltext wirklich liest* — die vier
  Felder in `mail.js`, `e.template` in `searchOwn()`, `test.mark` und
  `test.at` in `server.js`. **Genau daran ist 0.24.1 gescheitert:** ein Ziel,
  das niemand liest, ist ein Umbenennen ins Leere.

---

## Die sechs alten Feldnamen brauchen eine benannte Ausnahme

**Der Namenswächter aus 0.24.1 ist beim ersten Lauf rot geworden** — und er
hatte recht: `absender`, `anbieter`, `benutzer`, `marke`, `passwort` und
`vorlage` stehen als deutsche Bezeichner im ausgelieferten Code.

*Sie sind keine Benennung dieser Fassung, sondern der GEGENSTAND einer
Migration* — dieselbe Lage wie bei den drei alten Adressen in `OLD_ADDRESSES`:
**eine Übersetzungstafel muss sagen dürfen, was sie übersetzt.**

Sie stehen deshalb als dritte benannte Gruppe `OLD_STORED_NAMES` da, neben
den sechs falschen Freunden und den 104 Grenzen — **und daneben steht, WO sie
stehen dürfen:** in `db.js` und dort nur in `SHAPES_0242`. *Ohne diese zweite
Zeile wäre die Ausnahme ein Freibrief — wer morgen eine Veränderliche
`vorlage` nennt, wäre grün, weil der Name schon einmal erlaubt wurde.*

*`am` und `name` stehen nicht dabei: `am` ist im Wörterbuch kein Wort, und
`name` heißt in beiden Sprachen so.*

---

## Warum 0.24.1 es übersehen hat

**Der Hinweis stand da, und er war zu eng gefasst.** Das Änderungsprotokoll
0.24.1 nennt unter „Was zurückgestellt ist" ausdrücklich:

> **`sicher` in der gespeicherten Mail-Einstellung** — sie liegt als JSON in
> `settings` und bräuchte eine eigene Migration.

*Die Datei war richtig benannt, der Grund war richtig, und die Grenze war
falsch:* `sicher` war das einzige Feld dieses Gebildes, das **nicht** umziehen
musste. Die vier daneben sind umgezogen — im Quelltext, nicht im Bestand.

**Und der Bestandslauf hätte es finden müssen.** Er hat 21 Zusagen grün
gemeldet — sechs Tabellen umbenannt, die Spalten mitgezogen, die Werte
übersetzt, die Daten unversehrt, der zweite Lauf stumm. **Die Tabelle
`settings` war dabei leer.** *Was nicht dasteht, kann keine Migration
verlieren.* Die Zahl 21 hat nicht gelogen; sie hat über die eine Klasse, an
der es scheiterte, gar nichts gesagt.

*Beides steht seit dieser Runde als Stolperstein 324 und 325 im Projektstand.*

---

## Was diese Runde NICHT heilen kann

**Wer unter 0.24.1 in der Karte „Suchmaschinen" auf „Übernehmen" gedrückt
hat, trägt seine eigenen Suchmaschinen neu ein.** Die Karte stand mit drei
leeren Zeilen da, das Formular hat drei leere Paare geschickt, und der Server
hat sie ordnungsgemäß gespeichert — `[null, null, null]`. **Dann ist die
Zeile wirklich leer, und keine Migration holt sie zurück.**

*Der Kasten im `CHANGELOG.md` sagt genau das. Wer die Karte nicht angefasst
hat, bekommt alles mit dem ersten Start zurück.*

**Am Mailzugang ist derselbe Weg ungefährlich:** ein leeres Passwortfeld
heißt „unverändert" und fällt auf den alten Wert zurück — der war unter
0.24.1 nicht lesbar, also wirft `checkInput()` „Passwort fehlt", statt still
etwas Falsches zu speichern.

---

## Die acht Rückbauten sind gefahren — keiner ist stumm

**702 bis 709, drei Nebenspuren, alle acht namentlich rot.** Jeder nimmt der
Migration ein Stück weg: einen Schlüssel, ein Paar, die Klammer um die Liste,
die Regel bei zwei Namen, die Stille des zweiten Laufs — und einer legt ihr
einen Wert unter, den sie NICHT anfassen darf.

*Drei von ihnen haben nebenbei etwas gezeigt, womit nicht zu rechnen war:*
**702, 704 und 705 machen auch die Namensprobe rot.** Wer der Liste ein Paar
wegnimmt, nimmt damit einen deutschen Namen aus dem Quelltext — und dann steht
er als benannte Ausnahme da, ohne noch irgendwo vorzukommen („keine
Karteileiche"). *Die Ausnahme und die Migration halten sich damit gegenseitig
fest, von beiden Seiten.*

---

## Was diese Runde an den Zahlen ändert

| | 0.24.1 | 0.24.2 |
|---|---|---|
| Prüfungen | 5890 | **5920** (+30) |
| Rückbauten | 693 | **701** *(acht neue, 702 bis 709)* |
| Umbenannte Feldnamen je Bestand | — | **7** *(1 · 4 · 2)* |
| Deutsche Bezeichner im ausgelieferten Code | 110, alle benannt | **116, alle benannt** *(sechs alte Feldnamen dazu)* |
| Zeilen `db.js` | 1414 | **1509** *(der zweite Migrationsblock)* |
| Zeilen `testbench.js` | 43662 | **43943** |
| Zeilen `counterproof.js` | 7149 | **7213** |
| Zeilen `server.js` · `public/app.js` | 7055 · 11018 | **unverändert** |

---

## Die Dateien

* **`db.js`** — der Block `MIGRATION 0.24.2`, die Liste `SHAPES_0242` und
  `migration0242Shapes()`.
* **`testbench.js`** — die Gruppe „Die gespeicherten Formen ziehen mit —
  0.24.2", der Helfer `shortRunAll()`, und im Namenswächter die dritte
  benannte Gruppe `OLD_STORED_NAMES` samt Ortsangabe.
* **`counterproof.js`** — acht Rückbauten, 702 bis 709.
* **`package.json`, `package-lock.json`** — 0.24.2.
* **`CHANGELOG.md`** — der Eintrag mit zwei Kästen.
* **`Doku/Projektstand_Kriterion_0_24_2.md`** — umbenannt aus `_0_24_1`,
  Revision 68: der Fahrplan gerückt, die Stolpersteine 324 und 325, die
  Regel S9 um die Feldnamen erweitert, der Fingerprint `9988912b` als im
  Feld bestätigt eingetragen.

*`server.js`, `public/app.js`, `mail.js`, `public/style.css` und
`public/languages/de.json` sind nicht angefasst.*

---

## Was diese Runde ausdrücklich NICHT tut

* **Kein Wort am Bildschirm ändert sich.** Dieselbe Abnahme wie in 0.24.1.
* **Kein Schema.** Keine Tabelle, keine Spalte, kein Index.
* **Keine Route, kein Austauschformat.** Eine Exportdatei aus 0.24.0 spielt
  sich unverändert ein — die Übersetzung dafür steht seit 0.24.1 im Import.
* **Die vierzehn Vokabelnamen, `sicher`, die Blocknamen und die
  Filterschlüssel bleiben deutsch.** Sie ziehen mit Stufe 2 um, und die
  Gegenlage im Prüfstand hält fest, dass diese Runde sie nicht anfasst.
* **Der Fahrplan rückt, die Sprachstufen bleiben, wie sie sind.** Stufe 2 ist
  jetzt 0.24.3, Stufe 3 ist 0.24.4; an ihrem Inhalt ändert sich kein Wort.
