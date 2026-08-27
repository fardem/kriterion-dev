# Umbenennung und Mehrbenutzerbetrieb — das Werkbuch

**Konzeptpapier · geschlossen · gebaut bis Version 0.9.1 · zurückgeschnitten
mit Revision 25 des Projektstands (27. August 2026)**

# DER STUFENPLAN IST ABGEARBEITET

**Mit 0.9.1 ist Stufe I₂ gebaut, und damit ist Teil II dieses Papiers
vollständig.** Es gibt keine offene Stufe mehr. Der Umbau vom Einzelplatzarchiv
zum Mehrbenutzerbetrieb, der mit 0.6.0 begann, ist zu Ende geführt.

> ## WAS HIER NOCH STEHT — UND WAS NICHT MEHR
>
> **Was gilt, steht seit Revision 25 im Projektstand, und nur dort.** Dieses
> Papier hat bis dahin dieselben Regeln ein zweites Mal getragen; drei Orte für
> dieselbe Frage sind zwei zu viel, und beim Nachziehen wird immer einer
> vergessen — genau so ist Stolperstein 137 entstanden.
>
> **Umgezogen sind:**
>
> | war hier | steht jetzt |
> |---|---|
> | Teil II, Abschnitt 3 — die Rechtetabelle | README, „Wer was darf" (vollständiger als hier) |
> | Teil II, Abschnitt 8 — global gegen persönlich | Projektstand, Abschnitt 3 (auf **acht** persönliche Schlüssel nachgezogen) |
> | Teil IV — Nachträge zu Abschnitt 5 | Projektstand, Abschnitt 5 |
> | Teil V — zu erwartende Stolpersteine, die offenen Auflagen | Projektstand, Abschnitt 11 |
> | „Nachprüfen per SSH" | Projektstand, Abschnitt 8 |
> | die offene Frage nach der Eindeutigkeit der Adresse | Projektstand, Abschnitt 10 |
> | der Versanddienst über HTTPS, der angepinnte Block als Wand | Projektstand, Abschnitt 10 |
>
> **Was hier bleibt, ist die Herleitung:** der Entwurf, was beim Bauen anders
> kam, und die Stufentabelle. *Für die Stufen A bis G3 ist dieses Papier der
> **einzige** Ort, an dem die Abweichungen stehen — Änderungsprotokolle gibt es
> erst ab 0.8.6.* **Ab 0.8.6 steht die Herleitung im Änderungsprotokoll der
> jeweiligen Version, und hier nur noch eine Zeile.**
>
> **Die Abschnittsnummern bleiben, wie sie waren** — Quelltext und Prüfstand
> verweisen auf „Abschnitt 1 des Konzeptpapiers", und ein Verweis, der ins Leere
> zeigt, ist schlimmer als eine Zeile zu viel.

**DIE ENTSCHEIDUNGEN GELTEN WEITER, DIE STUFEN NICHT.** Was künftig etwas davon
berührt, ändert **nicht eine Stufe, sondern eine Zusage** — und das gehört
ausdrücklich entschieden, nicht nebenbei. Es sind sechs, und sie stehen
ausgeschrieben im Projektstand:

1. **Die Rollenleiter** `user` < `admin` < `eigentuemer` (Abschnitt 5.2).
2. **„Ein Zustand, keine zweite Wahrheit"** — der Leitgedanke aus Abschnitt 1
   dieses Papiers (Projektstand, Abschnitt 1).
3. **„E-Mail ist eine Bequemlichkeit, keine Voraussetzung"** (Abschnitt 5.3) —
   *und der Satz trägt beim zweiten Faktor ausdrücklich NICHT: TOTP braucht kein
   Netz und darf deshalb nie ausfallen.*
4. **Die EINE Absage am Token** (Abschnitt 5.3).
5. **Die immer gleiche Antwort auf eine Anfrage** (Abschnitt 5.3).
6. **Der Admin schaltet frei, immer** (Abschnitt 5.3).

---

# Teil I — Umbenennung auf „Kriterion" — erledigt in 0.5.10

Umbenannt sind Anzeigename, Paketname, Container- und Imagename und der Cookie
(`kriterion_session`). **Die Datenbankdatei heißt weiterhin `katalog.sqlite`.**
Das Risiko lag wie vorhergesagt im **Betriebsvorgang** (Ordnerwechsel, `.env`,
alter Container am Port), nicht im Code.

# Teil Ia — Mehrere Suchanbieter je Suchzeile — erledigt in 0.5.11

Bis zu **vier** Anbieternamen unter jeder Suchzeile; `sucheAktiv[0]` ist die
**einzige Wahrheit** über den Startanbieter, und die Anbieterliste liegt im
**Server**, nicht in `app.js`. *Alles Weitere im Projektstand, Abschnitt 5.6.*

---

# Teil II — Mehrbenutzerbetrieb: der Entwurf

**Dreizehn Abschnitte, und alle sind gebaut.** Sie stehen hier als Gerüst, damit
ältere Verweise aufgehen — was gilt, steht im Projektstand.

## 1. Leitgedanke

**Ausgeschaltet sieht Kriterion aus wie vorher.** Keine Namen an Kommentaren,
keine Durchschnittsspalte, keine Benutzerverwaltung, kein Registrieren-Knopf —
und das **nicht über einen abgefragten Schalter, sondern aus der Zahl der
aktiven Benutzer abgeleitet**. *Ein Zustand, keine zweite Wahrheit.*

**Der Grund ist nicht Höflichkeit gegenüber dem Einzelbetrieb, sondern die
Bedingung dafür, dass der Umbau die Veröffentlichung nicht verschlechtert.**
„Für eine Person, dafür vollständig verschlüsselt" bleibt ein vollwertiger
Betriebszustand und kein halb ausgebauter.
→ *Projektstand, Abschnitt 1.*

## 2. Rollen

Drei Rollen als **Leiter** seit 0.8.0; der Eigentümer ist ein **vergebbares
Recht, keine Nummer**. Dazu die Startregel, „ein Admin kommt nicht an
seinesgleichen" und „der letzte aktive Eigentümer darf nicht verschwinden".
→ *Projektstand, Abschnitt 5.2.*

## 3. Rechte

Die Rechtetabelle stand hier; **sie steht jetzt vollständig in der README**
(„Wer was darf"). Der Satz dahinter ist **löschen ja, umschreiben nein**, und
die Regel, aus der sich die Zuständigkeiten ergeben, lautet: *was an allen
Einträgen aller Benutzer erscheint, gehört dem Admin; was nur dort erscheint, wo
man es hinsetzt, gehört jedem.*
**Linkzeile und Datei haben die Seite gewechselt** (0.8.30 und 0.8.31); **Fotos
bleiben ausdrücklich, wo sie sind** — das erste Foto ist das Gesicht des
Eintrags. **Das Umsortieren ist nicht mitgewandert.**
→ *README, „Wer was darf"; Projektstand, Abschnitt 5.2.*

## 4. Datenmodell

**Das Schema in `db.js` ist die Wahrheit, nicht mehr dieses Papier.** Die
tragenden Entscheidungen: `sessions.user_id` mit `ON DELETE CASCADE` als Wurzel;
`user_id` an sechs Trägern mit **`ON DELETE SET NULL`** als Auffangnetz; `UNIQUE`
um `user_id` erweitert bei `ratings` und `test_days`; `item_pins` für den
Favoriten; `user_settings` mit `PRIMARY KEY (user_id, key)`.
**Nachgestellt dabei: eine Fremdschlüsselspalte lässt sich nur nullbar
nachrüsten** (Stolperstein 105).
→ *README, „Datenmodell"; Projektstand, Abschnitt 5.4.*

## 5. Die Bewertung — erledigt in 0.7.0

Die Sterne zeigen die **eigene** Bewertung, daneben der Schnitt aller und die
**Zahl der Bewerter**. Gesamtschnitt: erst je Kriterium über alle, dann über die
Kriterien, gerundet **einmal** am Ende. Rücksetzen trifft ausschließlich die
eigenen Werte.
*Die Stimmenliste kam in 0.8.2 dazu und ist in 0.8.6 in eine Adminansicht
gewandert — der Schnitt und die eigene Zahl reichen.*
→ *Projektstand, Abschnitt 5.5.*

## 6. Testtage, Zeitleiste, „Getestet" — erledigt in 0.7.0

Zwei Leute am selben Datum sind **zwei Testtage**. `testAvg`, `testCount`,
`testLast` und die drei Testsortierungen laufen über alle Benutzer; **„`null`,
nicht `0`"** bleibt, und **ein Testtag hat keine Null**. **„Getestet" bleibt eine
Eigenschaft des Eintrags** — damit können **fremde Testtage den eigenen Schalter
blockieren**, und die Meldung muss das sagen.
→ *Projektstand, Abschnitt 5.5.*

## 7. Wer darf was anlegen

> **Was an allen Einträgen aller Benutzer erscheint, gehört dem Admin. Was nur
> dort erscheint, wo man es hinsetzt, gehört jedem.**

**Kriterien beim Admin** (0.7.0), **Tags und Kategorien bei allen — abschaltbar**
(0.8.4). *Der Unterschied: ein neuer Tag erscheint nur dort, wo man ihn hinsetzt;
ein neues Kriterium erscheint überall.* **Deshalb ist es ein Schalter und keine
feste Regel** — der Nutzen kommt erst mit dem dritten Zugang, wenn einer „Alu"
und der nächste „Aluminium" tippt.
→ *Projektstand, Abschnitt 5.2 und 5.6.*

## 8. Einstellungen: global gegen persönlich — erledigt in 0.6.5

Die Tabelle stand hier; **sie steht jetzt im Projektstand, Abschnitt 3**, und
zwar auf dem heutigen Stand: **acht** persönliche Schlüssel statt sechs.
**`mailzugang` ist die eine Zeile in `settings`, die nicht dem Admin gehört.**
**Das Vokabular bleibt global** — es ist die Sprache der Anwendung, keine
Ansichtssache.

## 9. Verwaltung

Gebaut in **0.8.0** (Karte „Zugänge", Sperren, **Löschen entwertet**,
Anmeldebremse, `zugang.js` statt `AUTH_RESET`) und **0.8.80** (anlegen **ohne
Passwort** samt Link, „Meine Sitzungen").
**„Sperren" ist wichtiger als Löschen** — Anmeldung blockiert, Inhalte bleiben.
→ *Projektstand, Abschnitt 3 und Abschnitt 5.2.*

## 10. Registrierung und Tokens — erledigt in 0.8.80, 0.9.0 und 0.9.1

**Auf einen Schalter gekürzt, entschieden vor 0.8.0:** der Schalter
„Mehrbenutzerbetrieb ein" widersprach Abschnitt 1 („ein Zustand, keine zweite
Wahrheit", Stolperstein 47 in Reinform) und ist gestrichen. **Es bleibt allein
`registrierung`.**

**Ein Schritt mehr als hier entworfen: eine Bestätigungsmail VOR der
Freischaltung** (Double Opt-in). Sie schließt eine Lücke, die der Entwurf offen
ließ: **ohne sie kann jeder eine fremde Adresse in die Liste des Admins
schreiben**, und beim Freischalten schickte die Anlage einer Person, die nie
gefragt hat, eine Mail mit Passwortkraft.

**Zwei Betriebsarten wird es NICHT geben.** Eine Lage, in der der geklickte
Token allein freischaltet und kein Admin zusieht, wäre ein anderes Produkt.

**Sechs Stellen wurden anders gebaut als hier beschrieben**, fünf aus Stufe H
und eine aus 0.9.0 — sie stehen im Projektstand, Abschnitt 5.3:
SHA-256 **ohne Salz** statt scrypt; beim Einlösen fallen **alle übrigen offenen
Links**; der Server gibt den fertigen Link erst heraus, seit es eine öffentliche
Adresse gibt; die Absage vor der Anmeldung ist **eine**; `created_at` steht
zusätzlich in der Tabelle; und der Token bekam eine **zweite Frist ab dem ersten
Öffnen**.
→ *Projektstand, Abschnitt 3 und Abschnitt 5.3.*

## 11. E-Mail — erledigt in 0.9.0 und 0.9.1

`nodemailer` — ohne Laufzeitabhängigkeiten, MIT-0, passend zur Linie von scrypt.
**Nur ausgehend, kein offener Port.** *Klarstellung zur Begrifflichkeit: GMX,
Google und Strato sind keine Alternativen zu nodemailer, sondern das, was man
**mit** nodemailer einträgt.* **Zustellbarkeit:** direkt vom Hausanschluss zu
versenden scheitert an fehlender rDNS und SPF/DKIM — deshalb immer über den
SMTP-Zugang eines Anbieters.

**Drei Abweichungen vom Entwurf, alle in 0.9.0 entschieden:**

1. **Der Mailzugang liegt in der Oberfläche, nicht in der `.env`** — aber beim
   **Eigentümer**, nicht beim Admin. *Die Begründung des Entwurfs trägt, sie
   trifft nur den Admin: über dem Eigentümer steht niemand.*
2. **Die öffentliche Adresse ist Pflicht FÜR DEN VERSAND, nicht für den Start.**
   *Wörtlich gelesen bräche der Start jede vorhandene Installation beim
   Einspielen — und genau das darf der Einspielweg nie tun.*
3. **Der Token bekommt eine zweite Frist** (siehe Abschnitt 10).

**Der Punkt, der das Offline-Prinzip erhält:** jeder Link, der verschickt wird,
ist im Verwaltungsbereich **zusätzlich zum Kopieren sichtbar**. *Damit läuft
Kriterion mit abgeschaltetem Mailversand vollständig, rein offline, ohne dass
eine Funktion fehlt. **Das ist die wichtigste Entwurfsentscheidung des ganzen
Vorhabens** — sie ist der Grund, warum der Umbau die Veröffentlichung nicht
verschlechtert.*
→ *Projektstand, Abschnitt 3.*

## 12. Export und Import — erledigt in 0.7.1 und 0.7.2

Der Export nennt zu jedem Träger den **Verfassernamen**, nie die Id; ein
unbekannter Name **legt keinen Zugang an**; die Anpinnung wandert nicht mit;
ältere Dateien bleiben lesbar. **Export und jeder Import gehören dem
Eigentümer.** **Der ersetzende Import rührt `users`, `sessions` und `tokens`
nicht an** — täte er es, würde er im schlimmsten Fall alle aussperren.
→ *Projektstand, Abschnitt 5.4.*

## 13. Was dabei aufgegeben wird

**Ein Schlüssel, eine Datenbank.** Jeder Benutzer vertraut dem Betreiber mit
allem, was er einträgt — lesbar ist alles, Rechtetabelle hin oder her. *Bei
einer selbstgehosteten Sache ist das normal, gehört aber in die README, sobald
Fremde mitmachen.* **Verschlüsselung je Benutzer wäre ein Neubau, kein Anbau.**

**Abschalten:** Der Mehrbenutzerbetrieb lässt sich nur zurücknehmen, solange kein
zweiter aktiver Benutzer existiert. Sonst würden fremde Inhalte herrenlos.
→ *Projektstand, Abschnitt 5.2 und Abschnitt 10.*

---

# Teil III — Die Stufen, und was beim Bauen anders kam

**Geschnitten nach Arbeitsmenge je Thread, nicht nach Sichtbarkeit.** *Jede
Stufe muss in einem Chat abzuarbeiten sein* — diese Regel hat den ganzen Plan
getragen und ist einmal ausdrücklich gegen eine gesparte Formatnummer
abgewogen worden (Projektstand, Abschnitt 10).

| | Version | Was |
|---|---|---|
| **A** | 0.6.0 | `users` um `role`/`email`/`status`/`last_login`, `sessions.user_id`, `req.benutzer` |
| **B** | 0.6.1 | `user_id` an `items`, `comments`, `test_days` |
| **C** | 0.6.2 | Tabellenneubau: `ratings` und `test_days` mit neuem UNIQUE |
| **C2** | 0.6.3 | `item_pins` statt `items.favorite` |
| — | 0.6.4 | *Keine Stufe.* Berichtigung am Favoriten-Knopf |
| **D** | 0.6.5 | `user_settings`: sechs Schlüssel werden persönlich |
| — | 0.6.6 | *Keine Stufe.* Am Eintrag heißt es **Favorit**, sortiert nicht mehr vor, eigener Filter |
| **E** | 0.7.0 | Bewertungsanzeige, Testtage, Zeitleiste, Kriterien in den Systembereich |
| **E2** | 0.7.1 | Export und Import mit Verfassernamen |
| **F** | 0.7.2 | Rechteschicht serverseitig, Endpunkt für Endpunkt; dazu der Selbstbezug |
| **G1** | 0.8.0 | Verwaltungskarte, Rollen, Sperren, Namensbremse, `zugang.js` |
| — | 0.8.1 | *Keine Stufe.* **Bereinigung:** `legacy.js` und aller Migrationscode entfernt, Schema als DDL |
| **G2a** | 0.8.2 | Verfassernamen an vier Trägern, Stimmenliste, Löschdialog am Eintrag |
| **G2b** | 0.8.3 | Eingriffsvermerk am Kommentar, `mine` am Kommentar, blaue Aufgabenmarke |
| **G2c** | 0.8.4 | Rest von G2: die beiden Anlegen-Schalter, die Vergleichsansicht, die Rolle im Vermerk |
| **G3** | 0.8.5 | „Der Systembereich lernt die Rechte": Karten nach Rolle, `GET /api/stats` hinter den Admin |
| — | 0.8.6 | *Keine Stufe.* Berichtigungen aus dem Betrieb |
| — | 0.8.10 | *Keine Stufe.* **Werkzeug** — den Umbau nicht berührt |
| — | 0.8.20 | *Keine Stufe.* **„Die Schotten dicht"** — den Umbau nicht berührt |
| **G4** | 0.8.30 | „Die Linkliste bekommt Verfasser" — **Stufe G vollständig** |
| — | 0.8.31 | *Keine Stufe.* Dieselbe Wende an den Dateien |
| — | 0.8.40 bis 0.8.71 | *Keine Stufen.* Gewichtung, Kurzvideos, „Offen/Neu", Sicherung und Papierkorb, Sicherungsort |
| **H** | 0.8.80 | Tokens für Einladung und Rücksetzung, dazu „Meine Sitzungen" |
| — | 0.8.90, 0.8.91 | *Keine Stufen.* Schwere Eingriffe, Schlüsselwechsel |
| **I₁** | 0.9.0 | Mailversand. **Der Abbruchpunkt ist gezogen worden** — er stand hier seit Langem |
| **I₂** | 0.9.1 | Selbstanmeldung. **Damit ist der Stufenplan abgearbeitet.** |

**Die Stufen des Umbaus standen nie allein:** der Gesamtplan im Projektstand
schiebt Runden dazwischen, die nicht dazugehören. **Die Nummern gingen bis 0.9.1
in Zehnerschritten**, damit zwischen zwei Stufen neun Nummern für
Berichtigungsrunden frei bleiben — *0.8.1 und 0.8.6 mussten sich noch in eine
geplante Nummer drängen, mit 0.8.31 hat es sich zum ersten Mal ausgezahlt.*
**Ab 0.10.0 gilt SemVer und löst dasselbe Problem besser.**

## Was beim Bauen anders kam — Stufe A bis G3

**Für diese Stufen ist dieses Papier der einzige Ort.** *Änderungsprotokolle gibt
es erst ab 0.8.6; ab dort steht die Herleitung dort, und hier nur noch eine
Zeile.*

**A (0.6.0).** Bestehende Sitzungen wurden **nachgezogen statt gelöscht**; „gibt
es keinen Admin, wird es der Eigentümer" schloss die Lücke, wer der erste Admin
wird; die Durchsetzung von `status` wurde bewusst nach Stufe G verschoben; und
**`email` bekam kein `UNIQUE`** — ein `ALTER TABLE` kann keines nachrüsten, die
gewanderte und die frische Datenbank wären damit verschieden gebaut. *Die Frage
ist bis heute offen (Projektstand, Abschnitt 10).*

**B (0.6.1).** Die Migration brauchte **drei** Aufrufstellen statt einer;
`test_day_tags` bekam **keine** eigene Spalte (der Verfasser folgt dem Testtag);
der Verfasser wandert beim Ersetzen eines Testtags mit. **Seitdem kann der
Prüfstand zwei echte Rufer nebeneinanderstellen** — das Muster jeder
Rechteprüfung (Stolperstein 56).

**C (0.6.2).** Der Tabellenneubau lief in **einer** Transaktion, Reihenfolge
`PRAGMA foreign_keys=OFF` → `BEGIN` → Umbau → `COMMIT` → `ON`. **Zwei Fallen,
nachgestellt vor dem Bauen:** ein `DROP TABLE` ist bei scharfen Fremdschlüsseln
ein `DELETE` (die Kaskade hätte die Tags lautlos mitgenommen), und
`PRAGMA foreign_keys` ist **in einer Transaktion ein stiller No-op**. Dazu:
`item_pins` wurde herausgelöst (→ C2), das `ON CONFLICT`-Ziel musste mitwandern,
die Migration konnte am neuen UNIQUE scheitern (`UPDATE OR IGNORE`,
Stolperstein 57), und **der Umbau erkannte seinen Bedarf am UNIQUE-Index, nicht
an einer Marke.**

**C2 (0.6.3).** **Anpinnen rührt `updated_at` nicht an** — eine Merkhilfe ist
keine Änderung am Eintrag. „Ohne Vorgabewert" erwies sich als **leere
Zusicherung** (Klemme nötig, Stolperstein 59); der Zeitstempelvergleich brauchte
ein festes altes Datum (Stolperstein 60). **Nicht gebaut, ausdrücklich:** eine
Anzeige, wer außer mir angepinnt hat.

**D (0.6.5).** Die fehlende `ON DELETE`-Angabe im Entwurf war genau die Lücke aus
Stolperstein 54. **`PERSOENLICHE_SCHLUESSEL` wurde von der Dokumentation zur
Laufzeit-Schranke** in `putSetting`. *Teil V sagte neue Bedienelemente voraus —
es gab keine, aber die vorhandenen Schalter schrieben in eine andere Tabelle,
und genau das war der Anlass für die `dispatchEvent`-Prüfungen.*

**E (0.7.0/0.7.1).** **Die Doppel-JOIN-Warnung traf zu — an einer anderen Stelle
als vorhergesagt** (`usage_count`, Stolperstein 67). Gerundet wird **einmal am
Ende**; die Schwelle für die Durchschnittsspalte liegt **in der Oberfläche**;
fremde Testtage werden in der Liste nicht gekennzeichnet, nur in der Zeitleiste.
*Zwei Sätze in Abschnitt 5 des Projektstands wurden dabei widerrufen.*

**E2 (0.7.1).** **Vier** Träger statt drei — der Eintrag kam dazu. Dabei
gefunden, älter als die Stufe: **`INSERT OR REPLACE` ist ein `DELETE` mit
Nachspiel** (Stolperstein 70).

**F (0.7.2).** Neun Abweichungen, die wichtigsten: **„Leitung" heißt seitdem
Admin**, daneben steht der Eigentümer; **Export und Import gehören dem
Eigentümer**, nicht dem Admin; zwei Endpunkte tragen zwei Rechteklassen in einem
Rumpf; **die Note eines fremden Testtags ändert niemand**; bei den Bewertungen
steht **ausdrücklich kein Wächter**; `aendereZugang()` behielt seinen Namen
(Klemme statt Umbenennung). **Neu entstanden: der Wächter über den Quelltext** —
`F_ROUTEN`, *die einzige Prüfung, die eine fehlende Entscheidung findet.*

**G1 (0.8.0).** Fünf Abweichungen: der Eigentümer ist ein **dritter Rollenwert**;
**Löschen entwertet** (Grabstein, Name freigegeben); **`AUTH_RESET` ist durch
`zugang.js` ersetzt** (der Einmalcode aus Stufe H entfällt ersatzlos); die
**Namensbremse verzögert nur**; der Schalter „Mehrbenutzerbetrieb ein" ist
gestrichen. Dazu die Regel, die beim Besprechen entstand: **ein Admin kommt nicht
an seinesgleichen.**
*Und eine Berichtigung aus 0.8.2:* der Ergebnisblock behauptete, für „Gelöschter
Benutzer 7" liege in der Oberfläche alles bereit. **Das galt nur für die Karte
„Zugänge"** — `GET /api/users` steht hinter `nurAdmin`, und für die Beiträge im
Eintrag lag nichts bereit.

**G2 (0.8.2 bis 0.8.4).** Das Feld heißt **`verfasser`, nicht `author`** — der
Export-`author` ist ein blanker String, hier steht ein Objekt. *Verworfen: ein
Endpunkt `GET /api/verfasser` — er legte die vollständige Zugangsliste jedem
offen.* Der **Grabsteinname verlässt den Server nicht**; beim Bauen war das
zuerst falsch. Die **Stimmenliste** stand nicht im Entwurf und war trotzdem
nötig: ohne sie hätte der Löschweg für fremde Bewertungen keine Bedienung.
**Der Satz „kein Migrationscode nötig" war falsch** — er galt für die Zeilen,
nicht für die Spalte; 0.8.3 hat deshalb `migration083()` bekommen, und daraus
wurde der Merksatz: **DDL und Migrationsblock, nicht eines von beidem.**
`findOrCreateTag()` musste in `findeTag()` und `legeTagAn()` zerlegt werden —
*ein gemeinsamer Helfer trüge die Klemme in seinem eigenen Rumpf, und der Wächter
über den Quelltext fände sie dort nicht.*

**G3 (0.8.5).** Es waren **nicht neun Karten, sondern zwölf** — und nach dem Bau
dreizehn. **Die Karte „Links" ist in zwei geschnitten** worden, im Entwurf nicht
bedacht: sie mischte als einzige Persönliches mit Adminsachen.
**Die konkreteste Falle der Stufe ist eingetreten:** `renderSystem()` hängt seine
Abrufe in **ein** `Promise.all` und verlässt den Rumpf, sobald einer scheitert —
stünden die Kennzahlen hinter dem Admin und würden trotzdem abgerufen, bliebe
der Systembereich für einen gewöhnlichen Benutzer **vollständig leer**. *Der
Rückbau macht 19 Prüfungen rot.* **Was ausdrücklich nicht gebaut wurde:**
„Ansicht für Vokabular und Titel gar nicht" — das Vokabular **ist** jede
Beschriftung; **was verschwindet, sind die Karten, nicht die Daten.**

## Ab 0.8.6 — je eine Zeile

| Version | Wo die Herleitung steht |
|---|---|
| 0.8.6 · 0.8.10 · 0.8.20 | `Doku/Aenderungsprotokoll_<Version>.md` — **keine dieser Runden hat den Umbau berührt** |
| **G4** 0.8.30 · 0.8.31 | `Doku/Aenderungsprotokoll_0.8.30.md` bzw. `_0.8.31.md`; *nur EINE Art wechselt in `F_ROUTEN`, nicht zwei — die Art `'im Rumpf'` sagt nicht, WELCHE Klemme dasteht* |
| 0.8.40 bis 0.8.71 | die jeweiligen Änderungsprotokolle — keine Stufen |
| **H** 0.8.80 | `Doku/Aenderungsprotokoll_0.8.80.md`; die fünf Abweichungen stehen in Abschnitt 10 dieses Papiers |
| 0.8.90 · 0.8.91 | die jeweiligen Änderungsprotokolle — keine Stufen, aber 0.8.90 arbeitete Stufe I mit der **öffentlichen Adresse** vor |
| **I₁** 0.9.0 · **I₂** 0.9.1 | `Doku/Aenderungsprotokoll_0.9.0.md` bzw. `_0.9.1.md` |

---

# Was dieses Papier über sich selbst sagt

**Es wird nicht mehr fortgeschrieben und nicht umbenannt.** Sein Kopf sagt
„gebaut bis Version 0.9.1", und das bleibt wahr: er beschreibt den Stand, bis zu
dem das Papier trägt. **Der zweite Faktor, die Suche und alles danach sind keine
Stufen daraus.**

*Angefasst worden ist es seither genau einmal — mit Revision 25 des
Projektstands, und zwar um es zu **kürzen**: was gebaut ist, steht dort. Das ist
kein Widerspruch zu „wird nicht mehr angefasst", sondern dessen Einlösung — ein
Papier, aus dem nichts mehr nachzuziehen ist, muss auch nicht mehr angefasst
werden.*
