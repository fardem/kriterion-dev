# Anlage zum Konzept „Die Oberfläche wird ruhiger" — die Textstellen

**Arbeitsliste für den Auftrag 0.22.0.** Jede Zeile ist eine Stelle in `public/app.js` oder in
einer Serverdatei, mit dem Text von heute, dem Befund und einem Vorschlag.

> **DIE ZEILENANGABEN SIND AUF DEN STAND 0.21.1 NACHGEZOGEN** *(Fingerprint `2295870b`, im Feld
> seit dem 4. September 2026)*. Erhoben wurden sie an 0.21.0; 0.21.1 hat `public/app.js` um
> **184 Zeilen** wachsen lassen, und alles hinter `drawFilters()` ist damit gerückt.
> **Nachgezogen wurde in zwei Durchgängen:** erst über die Zuordnung aus dem Diff, dann über
> den Wortlaut selbst — jede Zeile nennt ihren heutigen Text, und der steht im Quelltext.
> **Wo der Wortlaut sich nicht eindeutig wiederfand, steht die gerechnete Zahl; sie kann um
> wenige Zeilen danebenliegen.** *Die Angaben bleiben, was sie immer waren: Orientierung, kein
> Vertrag — der Text ist der Anker, nicht die Zahl.* *Der Vorschlag ist ein Vorschlag — das Wörterbuch im
Konzept (Abschnitt 4.3) entscheidet das Wort, der Auftrag den Satz.* Die Spalte „Rolle" sagt,
wer den Text sieht: **B** jeder Benutzer, **A** Admin und Eigentümer, **E** nur Eigentümer,
**vor** = vor der Anmeldung.

Kategorien: *Kunstdeutsch* (ein Wort, das so niemand sagt) · *Bauprozess* (erklärt, warum es so
gebaut ist) · *Insider* (ein Wort aus Quelltext oder Papieren) · *zu lang* · *unklar* · *Ton*
(Kumpelton, Floskel) · *uneinheitlich* (zwei Wörter für eine Sache) · *Vokabel* (hart
geschriebenes Vokabelwort) · *Rolle* (der Falsche sieht es) · *falsch* (sagt etwas, das nicht
stimmt).

**Gezählt:** rund 1 000 sichtbare Texte in `app.js`, davon 229 in dieser Liste; dazu rund 175
Servermeldungen, davon 22 hier. *Nicht in der Liste steht, was in Ordnung ist — und das ist
die Mehrheit: Knöpfe, Feldbeschriftungen, Platzhalter und die meisten Toasts sind kurz und
richtig.*

---

## A. Vor der Anmeldung (`app.js` 1–830)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 57 | B | „Fehler (500)" | unklar | „Der Server meldet einen Fehler (500)." |
| 55 / 787 | B | „Sitzung abgelaufen" ↔ „alle bestehenden Anmeldungen … werden beendet" | uneinheitlich | überall „Sitzung"; Z. 787: „Danach wirst du auf allen anderen Geräten abgemeldet." |
| 196 | B | „Meine Sterne hier entfernen" | Füllwort | „Meine Sterne entfernen" |
| 291 | A | „Das trifft die ganze Anwendung — deshalb bestätigst du es mit deinem Passwort." | Kunstdeutsch, Ton | „Diese Änderung betrifft die ganze Anwendung. Bitte mit deinem Passwort bestätigen." |
| 346–347 | A | „Weil in deinem Profil ein zweiter Faktor eingeschaltet ist, gehört sein Code dazu. Hast du ihn nicht zur Hand, trägt auch ein Wiederherstellungscode." | Kunstdeutsch, zu lang | „Dein zweiter Faktor ist eingeschaltet — bitte auch den Zwei-Faktor-Code eingeben. Ein Wiederherstellungscode geht ebenfalls." |
| 318, 545 | B | „Code des zweiten Faktors" | steif | „Zwei-Faktor-Code" |
| 432–433 | vor | „Mindestens 10 Zeichen. Über die Oberfläche gibt es keine Wiederherstellung." | unklar | „Mindestens 10 Zeichen. Gut aufbewahren — ein vergessenes Passwort lässt sich hier nicht zurücksetzen." |
| 490–491, 598 | vor | „Noch keinen Zugang?" / „Zugang anfragen" | Kunstdeutsch (leicht) | „Zugang beantragen" |
| 540 | vor | „Noch der zweite Faktor." | unklar, Ton | „Fast geschafft — jetzt den Zwei-Faktor-Code eingeben." |
| 549–550 | vor | „Telefon nicht zur Hand? Hier trägt auch einer deiner Wiederherstellungscodes — jeder von ihnen genau einmal." | Kunstdeutsch | „Handy nicht zur Hand? Du kannst auch einen Wiederherstellungscode eingeben — jeder gilt nur einmal." |
| 573 | vor | „Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn." | Ton | „Die Anmeldung ist abgelaufen. Bitte melde dich noch einmal an." |
| 598–599 | vor | „Zugang anfragen. Ein Admin entscheidet darüber — und vorher bestätigst du per E-Mail, dass die Adresse dir gehört." | Reihenfolge verdreht | „Zugang beantragen. Du bestätigst zuerst deine E-Mail-Adresse, danach entscheidet ein Admin." |
| 601 | vor | „Wunsch-Benutzername" | uneinheitlich | „Gewünschter Benutzername" |
| 642 (aus `server.js` 794–797) | vor | „Danke. Konnte zu diesen Angaben eine Anfrage entstehen, liegt jetzt eine E-Mail in deinem Postfach — …" | Kunstdeutsch, zu lang | „Danke. Wenn zu diesen Angaben eine Anfrage möglich war, hast du jetzt eine E-Mail bekommen — bitte bestätige darin deine Adresse. Danach entscheidet ein Admin." |
| 694 | vor | „Zur Anmeldung" | uneinheitlich (sonst „Zurück zur Anmeldung") | „Zurück zur Anmeldung" |
| 748 | vor | „Der Server hat den Link gerade nicht geprüft." | unklar | „Der Link konnte gerade nicht geprüft werden." |
| 786–790 | vor | „Mindestens 10 Zeichen. Dieser Link gilt danach nicht mehr, und alle bestehenden Anmeldungen dieses Zugangs werden beendet. Du hast jetzt N Minuten Zeit — neu laden darfst du darin beliebig oft. Danach brauchst du einen neuen Link vom Admin." | zu lang, Bauprozess | „Mindestens 10 Zeichen. Der Link gilt noch N Minuten — danach brauchst du einen neuen vom Admin. Nach dem Setzen wirst du auf allen anderen Geräten abgemeldet." |

## B. Blöcke, Glocke, gespeicherte Ansichten (`app.js` 828–2231)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 2258 | B | „7 seit deinem letzten Blick — Klick zeigt, wo" | Kunstdeutsch, unklar | „7 Neuigkeiten von anderen" |
| 2259 | B | „Nichts Neues seit deinem letzten Blick" | Kunstdeutsch | „Keine Neuigkeiten" |
| 2280, 2383–2384 | B | „Neu seit deinem letzten Blick" (Fenstertitel, Knopf, aria-label) | Kunstdeutsch | „Neuigkeiten" |
| 2281–2282 | B | „Was seit deinem letzten Blick in diese Tafel dazugekommen ist — Kommentare und Bewertungen von den anderen." | Kunstdeutsch, Ton | „Neue Kommentare und Bewertungen anderer Benutzer, seit du diese Liste zuletzt geöffnet hast." |
| 2249 | B | „1 offene Aufgabe" / „3 offene Aufgaben" | Vokabel (Beiwort vor V-Wort) | „1 Aufgabe offen" / „3 Aufgaben offen" |
| 1928 | B | „Mehr als 8 Ansichten gibt es nicht." | Ton | „Höchstens 8 Ansichten. Bitte erst eine löschen." |
| 1930 | B | „… werden unter diesem Namen gemerkt." | uneinheitlich (Knopf „Speichern") | „… gespeichert." |
| 1935 | B | „„Bosch" gibt es schon." | unklar | „Eine Ansicht „Bosch" gibt es schon." |
| 1103 | B | „Fehlgeschlagen" | unklar | „Upload fehlgeschlagen" |
| 923 / 931 | B | „Bewertung (keine Wertung)" ↔ „Potenzial (keine Sterne)" | uneinheitlich | beide „(noch nicht bewertet)" bzw. „(noch nicht eingeschätzt)" |
| 883 | B | „5 Aufgaben (3 offen, 2 Erledigt)" | Groß/Klein-Bruch durch V-Wort | „5 Aufgaben, 3 davon offen" |
| 1073 | B | Fußzeile „Kriterion 0.21.0" | Hinweis, keine Änderung | bleibt (Entscheidung 0.12.3) |

## C. Übersicht, Filter, Offen, Vergleich, Vollbild (`app.js` 2231–3983)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 2386 | B | Knopf „Systembereich" | unklar für Benutzer | „Einstellungen" *(E1)* |
| 2594 | B | „Filter zeigen" / „Filter einklappen" | kein Gegensatzpaar | „Filter anzeigen" / „Filter ausblenden" |
| 2631 / 2701 / 2745 | B | „Alles anzeigen" ↔ „Alle" ↔ „Alle" | uneinheitlich | überall „Alle" |
| 2658 | B | „Alle Einträge zeigen" / „Nur Favoriten zeigen" | Vokabel | `Alle ${V.sacheMehrzahl} zeigen` |
| 2698–2701 | B | Gruppe „Ablehnung: Alle · Abgelehnt · Nicht abgelehnt" | Zeile überladen | Wortlaut bleibt; Beschriftung „Abgelehnt?" *(E8: Gruppe hinter „Weitere Filter")* |
| 2766 | B | „Einträge, die keiner Kategorie zugeordnet sind" | Vokabel | `${V.sacheMehrzahl} ohne Kategorie` |
| 2783–2784 | B | „Nur Einträge, die alle gewählten Tags tragen" / „… mindestens einen der gewählten Tags tragen" | Vokabel, Kunstdeutsch (tragen) | `Nur ${V.sacheMehrzahl} mit allen gewählten Tags` / `… mit mindestens einem der gewählten Tags` |
| 2798 | B | „noch keine Tags" | Kleinschreibung | „Noch keine Tags" |
| 2814 | B | „Zusammen mit der aktuellen Auswahl kein Treffer" | umständlich | „Mit der aktuellen Auswahl keine Treffer" |
| 2857 | B | „zurücksetzen" (Tagzeile) | unklar neben „Filter zurücksetzen" | „Tags zurücksetzen" |
| 2893–2915 | B | Sortiergruppen „Änderung / Bewertung / Verlauf", darin „Titel (A → Z)" unter Bewertung, „Note ⌀ (hoch → niedrig)" | uneinheitlich, unklar | Gruppen „Allgemein / Bewertung / Potenzial / Testverlauf"; „Durchschnittsnote (hoch → niedrig)" |
| 2947 | B | „Filter und Suchbegriff unter einem Namen merken" | Ton | „Aktuelle Filter und Suche als Ansicht speichern" |
| 2963 | B | „8 sind das Höchste — eine löschen, dann geht die nächste." | Ton | „Höchstens 8 Ansichten. Für eine neue erst eine löschen." |
| 2986 | B | „Alle Filter auf „alles zeigen" — Suchbegriff und Sortierung bleiben stehen" | Ton | „Alle Filter zurücksetzen. Suchbegriff und Sortierung bleiben erhalten." |
| 3028 | B | „· Suche nicht erreichbar, gezeigt wird der letzte Stand" | zu lang für die Zählzeile | „· Suche nicht erreichbar — letzter Stand" |
| 3039 | B | „Oben rechts anlegen — Fotos, Kategorie, Bewertung und Testtage folgen danach." | unklar (Ort stimmt am Telefon nicht) | `Mit „+ ${V.sacheEinzahl}" anlegen. Fotos, Kategorie, Bewertung und Testtage kommen danach dazu.` |
| 3044 | B | „Nichts passt zu dieser Filter- und Suchkombination." | steif | „Zu Filter und Suche passt nichts." |
| 3215 | B | „Tag am Testtag: …" | unklar (Tag/Testtag) | `${V.zeitpunktEinzahl} (Tag): …` |
| 3252 | B | „3 Testtage · ⌀ 4,2 · zuletzt 4" | unklar | „… · letzte Note 4" |
| 3297 | B | „1 Links" | falsch (Einzahl) | „1 Link" / „2 Links" |
| 3297 | B | Tooltip „Zum Vergleich auswählen" auch bei Abwahl | falsch | ausgewählt: „Aus dem Vergleich nehmen" |
| 3337 | B | „keine Sterne" / „keine Wertung" | unklar (liest sich wie 0 Sterne) | „noch nicht eingeschätzt" / „noch nicht bewertet" |
| 3420 | B | „Ähnlich: Bosch GSR, Bosch GSB" | unklar (Zweck) | „Schon vorhanden? Ähnliche Titel: …" |
| 3487, 3696 | B | Pillen „meine" / „alle" | uneinheitlich (Kleinschreibung) | „Meine" / „Alle" |
| 3524 | B | „Nichts offen — es warten keine Aufgaben." | Ton, doppelt | „Nichts offen." |
| 3709 | B | „Gezeigt wird der Schnitt über alle." | unklar | „Gezeigt wird der Durchschnitt aller Benutzer." |
| 3737 | B | Tooltip „Gewicht im Gesamtschnitt" | uneinheitlich | „Gewicht im Durchschnitt" |
| 2885, 3343, 3620 | B | „Bewertung" hart geschrieben, „Potenzial" aus `V` | Vokabel (Hinweis) | bleibt; Abschnitt 9 des Konzepts |

## C1. Neu aus 0.21.1 — die Sortierung gibt den Statusfilter vor

*Diese Texte gab es beim Schreiben dieses Papiers noch nicht; sie sind am 4. September 2026 mit
0.21.1 dazugekommen und hier nachgeprüft. **Die Runde hat sauber gearbeitet: von fünf neuen
Texten sind drei ohne Befund.***

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 2589, 2682 | B | „folgt der Sortierung" (zweite Beschriftung der Statuszeile und am eingeklappten Filterschalter) | **ohne Befund** — kurz, deutsch, sagt genau, was ist | bleibt |
| 2591 | B | Filterschalter: „· 3 aktiv · folgt der Sortierung" | **ohne Befund** — „3 aktiv" ist deutlicher als das frühere „(3)" | bleibt |
| 2643–2644 | B | Tooltip der abgeleiteten Pille: „Diese Stellung kommt aus der Sortierung — ein Klick macht daraus deine eigene Wahl." | Kunstdeutsch (leicht): „Stellung" ist Schaltertechnik; 14 Wörter für einen Tooltip | „Vorgabe der Sortierung — ein Klick macht daraus deine eigene Wahl." |
| 2684–2685 | B | Tooltip der zweiten Beschriftung: „Die Sortierung gibt diesen Filter vor — ein Klick auf eine der drei Pillen setzt ihn selbst, „Filter zurücksetzen" gibt die Vorgabe zurück." | zu lang (22 Wörter, Regel S4 sagt acht) und Anführungszeichen im Anführungszeichen | „Ein Klick auf eine der drei Pillen setzt den Filter selbst." — *den Rest trägt der Rücksetzer an seinem eigenen Tooltip* |
| 2986 | B | Rücksetzer: „Alle Filter auf „alles zeigen" — Suchbegriff und Sortierung bleiben stehen" | **seit 0.21.1 unvollständig**, nicht nur im Ton: der Rücksetzer beendet jetzt auch die Handwahl (`STATUS_VON_HAND = false`), danach folgt der Status wieder der Sortierung — das sagt der Text nicht | „Alle Filter zurücksetzen. Suchbegriff und Sortierung bleiben erhalten." *Was danach gilt, sagt der Bildschirm selbst: die Beschriftung „folgt der Sortierung" steht sofort wieder da.* |

> **EINE STELLE IST DAMIT ZWEIMAL IN DIESER LISTE** — der Rücksetzer steht auch in Abschnitt C
> (Ton). **Der Befund von dort bleibt und bekommt hier seinen sachlichen Teil dazu.**

## D. Eintrag, erste Hälfte (`app.js` 3983–5150)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 4217–4222 | B | Absatz unter dem Bildfeld, 5 Sätze, 46 Wörter („… das Standbild erzeugt der Browser") | zu lang, Bauprozess | Absatz streichen; die Knöpfe tragen ihre Tooltips. Ein Satz bleibt: „Das erste Foto ist das Hauptbild — Reihenfolge per Ziehen." |
| 4220, 4771 | B | „Das erste Element ist das Hauptbild" / „1 Element hinzugefügt" | unklar | „Foto"; „1 Foto hinzugefügt" / „1 Video hinzugefügt" / „3 Dateien hinzugefügt" |
| 4478, 4480 | B | Schieber „Näher", aria „Wie eng der Ausschnitt sitzt" | Kunstdeutsch | „Zoom", aria „Zoom des Bildausschnitts" |
| 4737 | B | „Aus diesem Video ließ sich kein Standbild ziehen" | Ton | „Aus diesem Video konnte kein Vorschaubild erzeugt werden." |
| 4368 | B | Platzhalter „Notiz hinterlassen — Bilder mit Strg+V einfügen …" | uneinheitlich (Block „Kommentare") | „Kommentar schreiben — Bilder mit Strg+V einfügen …" |
| 4275–4276 | A | Platzhalter „+ neue Kategorie", Knopf „Anlegen" | uneinheitlich zur Tagzeile | Platzhalter „Neue Kategorie, Enter bestätigt", Knopf „+ Anlegen" |
| 4290, 5203, 5230 | B | „Klick vergibt, erneuter Klick nimmt zurück" / „Entfernen" / „Tag wieder entfernen" | uneinheitlich (drei Verben) | „Klick setzt, erneuter Klick entfernt"; Tooltips „Tag setzen" / „Tag entfernen" |
| 5199, 5225 | B | „Noch keine Tags." direkt über „Noch keine Tags angelegt." | doppelt | Chip-Hinweis weglassen, solange die Wolke leer ist |
| 5311 | B/A | „Noch keine Kriterien. Angelegt werden sie im Systembereich." | Rolle (Benutzer kommt nicht hin) | Benutzer: „Noch keine Kriterien." — Admin: „Noch keine Kriterien — anlegen unter Einstellungen › Bestand." |
| 4310, 4317 | A | Knopf „Stimmen" | unklar | „Wer hat bewertet" *(E5)* |
| 4349 | B | „bis 50 MB je Datei, höchstens 20 Stück" | Ton | „bis 50 MB je Datei, höchstens 20 Dateien" |
| 4862 | B | „Solange Testtage eingetragen sind, lässt sich das nicht zurücknehmen." | zu lang | „Nicht änderbar, solange Testtage eingetragen sind." |
| 4988, 5001 ↔ 4904, 4954, 4961, 4440, 4514 | B | „Kategorie gesetzt" ↔ „Gespeichert" ↔ „Bildausschnitt gespeichert" ↔ Stille | uneinheitlich | ein Muster: „Gespeichert" |
| 4018 ↔ 4026 | B | „← Zurück" ↔ „← Zurück zur Übersicht" | uneinheitlich | beide „← Zurück zur Übersicht" |
| 4194 | B | „lädt …" | Kleinschreibung | „Lädt …" |

## E. Eintrag, zweite Hälfte (`app.js` 5150–6290)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 5368 | B | „Gewicht im Gesamtschnitt" | uneinheitlich | „Gewicht im Durchschnitt" |
| 5443 | B | Tooltip „noch niemand" | unklar | „Noch nicht bewertet" |
| 5503 | B | „Für diesen Eintrag gibt es noch keine Rechnung." | unklar (Rechnung = Beleg), Vokabel | „Noch nichts bewertet — es gibt noch nichts zu berechnen." |
| 5539–5544 | B | Rechnungsdialog, Absatz 1 (41 Wörter, „gemittelt", „Schnitt") | zu lang, Fachton | „Zwei Schritte: erst der Durchschnitt je Kriterium (Spalte „Note"), dann der Durchschnitt darüber — jedes Kriterium mit seinem Gewicht." |
| 5539, 5545, 5547 | B | Spalten „Note · Gewicht · Produkt", Zeilen „Summe der Produkte", „Teiler" | unklar (Schulmathematik) | „Note × Gewicht", „Summe", „Geteilt durch (Summe der Gewichte)" |
| 5593–5598 | B | Absatz 2 (53 Wörter) mit „Die Gewichte stellt der Admin im Systembereich … ein." | zu lang, Rolle | „Kriterien ohne Sterne zählen nicht mit. Gerundet wird nur das Endergebnis." — der Admin-Satz nur bei `ADMIN` |
| 5604–5608 | B | Absatz 3 („… die Gewichte wirken, das Ergebnis fällt nach dem Runden trotzdem gleich aus.") | Bauprozess | „An dieser Zahl ändert die Gewichtung nichts: ohne Gewichte käme nach dem Runden ebenfalls ⌀ 3,7 heraus." |
| 5620 | A | „Stimmen — Bewertung" | uneinheitlich (Stimme/Bewertung/Note im selben Dialog) | „Wer hat bewertet — Bewertung" |
| 5624–5625 | A | „Diese Liste sieht nur der Admin. Eine fremde Bewertung lässt sich hier entfernen — die Note ändert niemand." | unklar | „Nur für Admins sichtbar. Fremde Bewertungen lassen sich hier entfernen, aber nicht ändern." |
| 5674–5676 | A | Dialog „Fremde Bewertung entfernen? … Die Note lässt sich nicht ändern, nur löschen." / Knopf „Entfernen" | uneinheitlich (entfernen/löschen) | „Fremde Bewertung entfernen? / Die Bewertung von X für „Y" wird entfernt. / Entfernen" |
| 5735 | B | „Noch keine Testtage. Jede Zeile ist ein Datum mit einer Gesamtnote." | zu lang, uneinheitlich | „Noch keine Testtage — unten Datum und Note eintragen." |
| 5751 | B | „Testtag löschen? / Das Datum … wird entfernt. / Löschen" | uneinheitlich | „… wird gelöscht." |
| 5764, 5772 | B | „Tag entfernen" / „Tag hinzufügen" am Testtag | unklar (Tag ↔ Testtag) | „Tag „schnell" entfernen" |
| 5831 / 6034 / 913 | B | Zähler „3 gespeichert" / „3 · 1,2 MB" / „3 Kommentare, davon …" | uneinheitlich | „3 Links" / „3 Dateien · 1,2 MB" / „3 Kommentare" |
| 5834 | B | „Noch keine Links. Adressen unten einfügen — ein Wort ohne Adresse wird zur Suche. Die Liste wird bei vielen Zeilen scrollbar." | falsch (wird abgeschnitten, nicht scrollbar), unklar | „Noch keine Links. Unten eine Adresse einfügen — oder einen Suchbegriff, dann wird danach gesucht." |
| 5902, 5949 | B | „Sucheintrag entfernen(?)" | uneinheitlich (kollidiert mit V-Wort „Eintrag") | „Suchbegriff entfernen(?)" |
| 5950 | B | „… wird aus der Liste gelöscht." / Knopf „Entfernen" | uneinheitlich | „… wird aus der Liste entfernt." |
| 5960 | B | „Kein gültiger Suchanbieter eingestellt" | unklar (Benutzer kann nichts tun) | „Keine Suchmaschine eingestellt — das kann nur der Admin ändern." |
| 6077 | B | „Datei entfernen? / „name" wird unwiderruflich gelöscht. / Löschen" | uneinheitlich | „Datei löschen? / „name" wird endgültig gelöscht. / Löschen" |
| 6116 | B | „… zeigt der Browser PDF nicht eingebettet an." | Fachton | „… kann der Browser das PDF hier nicht anzeigen." |
| 6131 | B | „Vorschau gekürzt — die vollständige Datei über „laden"." | falsch (Knopf „laden" gibt es nicht) | „Vorschau gekürzt — die ganze Datei mit ↓ herunterladen." |
| 6150 | B | „Fehlgeschlagen" | unklar | „Upload fehlgeschlagen" |
| 6199 | B | Tooltip „Anpinnen — steht dann ganz oben" auch am angepinnten Kommentar | unklar (Rückweg fehlt) | angepinnt: „Nicht mehr anpinnen" |
| 6199, 6330 | B | „Als Bericht markieren" auch am Bericht | unklar | gesetzt: „Markierung „Bericht" aufheben" |
| 6202, 6347 | B | „Zustand zurücksetzen" | Insider | „Markierung aufheben" |
| 6253 | B | „Bild entfernen? / … unwiderruflich gelöscht. / Löschen" | uneinheitlich | „Bild löschen? / Das Bild wird endgültig gelöscht. / Löschen" |
| 6262–6263 | B | „Kommentar löschen? / Dieser Kommentar wird unwiderruflich entfernt. Die angehängten Bilder gehen mit." | uneinheitlich, zwei Sätze | „Kommentar löschen? / Der Kommentar wird endgültig gelöscht — mit allen Bildern." |
| 6308, 6405 | B | „Text fehlt" | Ton (Telegramm) | „Bitte einen Text eingeben." |
| 6452 | B | „Dazu 2 Links, 1 Kommentar von mir." | Ton (ohne Verb) | „Außerdem von mir: 2 Links, 1 Kommentar." |
| 6454–6455 | B | „Alles davon liegt danach 30 Tage im Papierkorb; zurückholen kann es der Eigentümer dieser Installation." | zu lang | „Alles landet für 30 Tage im Papierkorb; wiederherstellen kann es nur der Eigentümer." |
| 4383 / 6425 | B | Knopf „Eintrag löschen" steht für jede Rolle, der Server lässt nur Verfasser und Admin durch | Rolle | Knopf nur zeigen, wenn `it.mine || ADMIN` *(E10)* |

## F. Einstellungen — Persönlich, Bestand, Zugänge (`app.js` 6290–8136)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 6704 | B | „Alles, was den Bestand als Ganzes betrifft." | unklar (Persönlich betrifft nicht den Bestand) | „Einstellungen für dein Konto und den Bestand." (Admin: „… und die Installation.") |
| 6515 / 6777 / 7887 | B / A | Karte „Zugang" (eigenes Konto) neben Reiter und Karte „Zugänge" (alle anderen) | uneinheitlich, unklar | „Mein Konto" / „Benutzer" *(E2)* |
| 6778–6780 | B | „Benutzername und Passwort für die Anmeldung. … Das Passwortfeld leer lassen ändert nur den Namen. Danach fallen alle anderen Anmeldungen — diese hier bleibt bestehen." | Kunstdeutsch, unklar | „Benutzername, E-Mail-Adresse und Passwort. Zum Speichern ist das aktuelle Passwort nötig. Nach einem Passwortwechsel werden alle anderen Sitzungen abgemeldet." |
| 6798–6799, 7919 | B / A | „(wird gebraucht)" / „(freiwillig)" | Kunstdeutsch | „(erforderlich)" / „(optional)" |
| 6818–6822 | B | „… Sie trägt außerdem den Einladungs- oder Rücksetzlink und die Testmail im Mailversand." / „Ohne sie steht der Link wie immer zum Kopieren bereit." | Insider (Mailversand), Kunstdeutsch, Ton („wie immer") | „An diese Adresse kann ein Link zum Zurücksetzen des Passworts geschickt werden. Ohne Adresse gibt der Admin den Link persönlich weiter." |
| 6819–6823 | E | „Über die Oberfläche gibt es keine Wiederherstellung; vergessen heißt `docker compose exec kriterion node zugang.js passwort <name>` auf dem Server." | Bauprozess, Insider | Kasten „Auf dem Server" (nur E) mit dem Befehl; Fließtext: „Passwort vergessen? Der Eigentümer setzt es auf dem Server zurück." |
| 6824, 6853 | B | Knopf „Zugang ändern"; Toasts „Zugang geändert" / „Zugang gespeichert" | uneinheitlich | Knopf „Speichern"; Toast „Gespeichert" (bei neuem Passwort: „Passwort geändert") |
| 6884 | B | „Zweiter Faktor: an — seit 2026-09-04." | uneinheitlich (ISO-Datum) | `fmtDate` |
| 6885, 6893, 6957, 7034, 8280 | B | „… fragt die Installation zusätzlich …", „gibt ihn die Installation nie wieder heraus", „Die Installation speichert …" | Kunstdeutsch (Installation als Handelnde) | Passiv oder „Kriterion" |
| 6888 | B | „— das wird knapp. Hol dir neue, solange du noch hereinkommst." | Ton | „— bitte rechtzeitig neue erzeugen." |
| 6893–6898 | B | 2. Faktor „aus", 50 Wörter („Der Code entsteht ohne Netz …") | zu lang, Kunstdeutsch | „Mit zweitem Faktor wird beim Anmelden zusätzlich ein sechsstelliger Code aus einer Authenticator-App abgefragt (z. B. Google Authenticator, Aegis, 1Password). Die App braucht dafür kein Internet." |
| 6912 | B | „Zum Anfangen brauchst du dein bisheriges Passwort." | Ton | „Bitte gib dein Passwort ein." |
| 6926 | B | Toast „Neue Wiederherstellungscodes" (= Knopftext) | unklar | „Neue Wiederherstellungscodes erzeugt" |
| 6931–6932 | B | „Die Wiederherstellungscodes fallen mit weg." | Kunstdeutsch | „… werden ungültig." |
| 6965–6967 | B | „Am Telefon führt der Knopf rechts unmittelbar in die App. Am Rechner trägst du den Schlüssel von Hand ein …" | unklar (Lage hängt vom Umbruch ab) | „Auf dem Handy öffnet „In der App öffnen" die App direkt. Am Rechner tippst du den Schlüssel ohne die Leerzeichen ein." |
| 6970–6971 | B | „Erst damit ist der zweite Faktor eingeschaltet — so ist belegt, dass deine App wirklich dasselbe rechnet." | Bauprozess | „Erst damit ist der zweite Faktor aktiv — so wird geprüft, dass die App richtig eingerichtet ist." |
| 7016–7018 | B | „Schreib sie auf und leg sie dorthin, wo dein Telefon nicht liegt. Jeder von ihnen trägt genau einmal …" | Kunstdeutsch | „Bewahre sie getrennt vom Handy auf. Jeder Code gilt einmal und ersetzt den Code aus der App." |
| **6836–6838** | **B** | „Sind sie alle verbraucht und das Telefon weg, hilft nur noch `docker compose exec kriterion node zugang.js zweifaktor <name>` auf dem Server." | **Insider, Rolle — jeder Benutzer sieht einen Server-Befehl** | „Sind alle Codes verbraucht und das Handy weg, kann der Admin den zweiten Faktor für dich zurücksetzen." (E: zusätzlich Kasten „Auf dem Server") |
| 7037–7099 | B | „Meine Sitzungen" — Zeilen „Diese Anmeldung (hier)", „Andere Anmeldung", Toast „Anmeldung beendet", „Neben dieser steht eine weitere Anmeldung." | uneinheitlich (Sitzung/Anmeldung), Kunstdeutsch („steht") | durchgehend „Sitzung": „Diese Sitzung (hier)", „Andere Sitzung", „Sitzung beendet", „Außer dieser gibt es eine weitere Sitzung." |
| 7033–7037 | B | „… speichert weder Adresse noch Browserkennung — das ist so gewollt und bleibt so. Sie kann deshalb diese Anmeldung von allen anderen trennen, und mehr braucht der Knopf darunter nicht." | Bauprozess, Ton | „Alle Browser und Geräte, in denen dein Konto angemeldet ist. Gerät und Ort werden nicht gespeichert." |
| 7117–7127 | B | „Die Layoutmaße bleiben unverändert …", „… über dem Kartenraster …", „Anordnung und Einklappzustand der Blöcke …" | Insider, holprig | „Bei sehr großer Schrift wird es an manchen Stellen eng." / „Zeitleiste der Testtage in der Übersicht." / „Reihenfolge und Auf-/Zuklappen der Blöcke gelten für alle Einträge." |
| 7167–7168, 7185–7186 | **B** | Kategorien/Tags: „Umbenennen oder löschen. …" | Rolle (Benutzer darf beides nicht) | Benutzer: „Alle Kategorien. Ändern kann sie der Admin." / „Alle Tags. Ändern kann sie der Admin." |
| 7184–7187 | A | „Wer eine neue Kategorie anlegen darf. Ohne Häkchen bleibt die Auswahl aus dem Vorhandenen für jeden bestehen — nur die Zeile „+ neue Kategorie" am Eintrag verschwindet. Der Admin legt weiterhin an." | zu lang | „Ohne Häkchen legen nur Admins neue Kategorien an; vorhandene kann weiterhin jeder auswählen." |
| 7189–7193 | A | „… Am Testtag bleibt sie stehen, weil es dort keine Wolke gibt; ein unbekannter Name wird dann abgewiesen." | Bauprozess, Insider („Wolke") | „Ohne Häkchen legen nur Admins neue Tags an; vorhandene kann weiterhin jeder vergeben." |
| 7243–7252 | B/A | Potenzial: Kriterien, 75 Wörter („… wie nebenan.", „Das ist ein Rat und kein Verbot; angelegt wird hier nichts von selbst.") | zu lang, Ton | „Sterne vor dem Test: Welche Idee ist als Nächstes dran? Eigener Durchschnitt, getrennt von der Bewertung." + Mehr: „Tipp: Zwei oder drei Kriterien reichen, z. B. Wunsch (Gewicht 1,5), Nutzen, Machbarkeit." |
| 7230–7235 | A | Bewertungskriterien, 45 Wörter | zu lang | „Anlegen, umbenennen, löschen, per Ziehen sortieren. Löschen entfernt auch alle vergebenen Sterne." + Mehr: „Die Reihenfolge gilt in Detailansicht und Vergleich. Die Zahl: an wie vielen Einträgen Sterne vergeben sind." |
| 7483–7485 | A | „… Datenbank und Exportdateien bleiben unberührt, ältere Exportdateien lassen sich weiterhin einspielen." | Bauprozess | „Wie die Dinge in der Oberfläche heißen. Es ändert sich nur die Beschriftung; Daten und Exporte bleiben gleich." |
| 7488–7518 | A | Feldnamen „Sache, Einzahl", „Merkmal erfüllt", „Zeitpunkt, Mehrzahl", „Sterne vor dem Test" | unklar (Vorgabe fehlt) | „Sache, Einzahl — Vorgabe: Eintrag" usw. |
| 7563 | A | Überschrift „Probe" | Kunstdeutsch | „Vorschau" |
| 7527 | A | Knopf „Vorgaben" | unklar | „Auf Vorgaben zurücksetzen" |
| 7624–7630 | B | Links: „… Gespeichert bleibt der Rohtext — ein Anbieterwechsel gilt deshalb rückwirkend … Kriterion selbst ruft niemanden." / „Gezählt wird der Startanbieter mit …" | Bauprozess, Ton, Insider | „Was in der Linkliste keine Adresse ist, wird als Suche behandelt; die Suche startet erst beim Klick." / „Wie viele Suchmaschinen unter einer Suchzeile angeboten werden." |
| 7670–7685 | A | Suchanbieter, drei Absätze (135 Wörter), „Ziel des Zeilenklicks", „Vorlage", „Foreneigene Suchen sind oft schlecht …" | holprig, unklar, Ton | „Häkchen: steht zur Auswahl. Standard: öffnet sich beim Klick auf die Suchzeile." / „Bis zu drei eigene: Name (max. 20 Zeichen) und Such-URL mit %s für den Suchtext (http:// oder https://)." / Mehr: „Tipp: eine Suchmaschine auf die Domain einschränken: `…search?q=site%3Aforum.beispiel.de+%s`." |
| 7735 | A | Tooltip „Ziel des Zeilenklicks" | holprig | „Beim Klick auf die Suchzeile öffnen" |
| 7810–7814 | A | „… danach fallen sie heraus. Zurück kommt eine neue Nummer mit demselben Inhalt …" | Kunstdeutsch, Insider | „Gelöschte Einträge bleiben hier 30 Tage und lassen sich wiederherstellen; danach werden sie endgültig gelöscht." |
| 7841–7842 | E | Knopf „↩ Zurückholen", Tooltip „Wiederherstellen" | uneinheitlich | beide „Wiederherstellen" |
| 7873–7874 | E | „„X" ist wieder da. Unbekannte Verfasser mir zugeordnet: a, b." | Ton, unklar | „„X" wiederhergestellt. Beiträge ohne bekannten Verfasser wurden dir zugeordnet: a, b." |
| 7880–7882 | E | „… Danach gibt es keinen Rückweg mehr." | uneinheitlich | „… Das lässt sich nicht rückgängig machen." |
| 7876–7881 | A | Zugänge-Einleitung, 50 Wörter („Sperren ist in den meisten Fällen das, was man eigentlich will", „kommst auch an andere Admins") | Ton | „Alle Benutzer dieser Installation." + Mehr: „Sperren statt löschen: Ein gesperrter Benutzer kann sich nicht anmelden, seine Beiträge bleiben. Rollen ändern und Admins bearbeiten kann nur der Eigentümer." |
| 7903–7906 | A | „Woher der neue Zugang sein Passwort bekommt, steht als Wahl im Formular — das Feld daneben erscheint nur, wenn es auch gilt. …" | Bauprozess | „Neuen Benutzer anlegen. Empfohlen: Der Benutzer wählt sein Passwort selbst über einen Einladungslink (7 Tage gültig, einmal nutzbar)." |
| 7903–7904 | A | „Er wählt sein Passwort selbst" / „Ich vergebe das erste Passwort" | unklar („Er") | „Benutzer wählt Passwort selbst (per Link)" / „Ich vergebe das erste Passwort" |
| 7913, 7959 | A | Knopf „+ Anlegen und Link" | unklar (abgebrochen) | „+ Anlegen und Link erzeugen" |
| 7929–7935 | E / A | „Passwort vergessen und niemand kommt mehr herein? Auf dem Server hilft `docker compose exec …`." / „Der Eigentümer kommt am Server daran; …" | Insider, Ton | E: Kasten „Auf dem Server". A: „Kommt niemand mehr herein, kann der Eigentümer das Passwort auf dem Server zurücksetzen." |
| 8015–8017 | A | „aus der Einstellung `OEFFENTLICHE_ADRESSE`" | Insider (vertretbar) | „aus der Server-Einstellung `OEFFENTLICHE_ADRESSE`" |
| 8065–8071 | A | Einladungslink-Kasten, 65 Wörter („Er ist bis dahin ein Passwortersatz", „steht er in einem fremden Verlauf") | zu lang, unklar | „Einladungslink für „x" — wird nur einmal angezeigt. Wer den Link hat, kann das Passwort setzen: 7 Tage gültig, einmal nutzbar, nach dem Öffnen 15 Minuten Zeit. Nur an die richtige Person weitergeben." |
| 8153–8154, 8178 | A | „Sperren" / „Freigeben", Toasts „Gesperrt" / „Freigegeben" | uneinheitlich | „Sperren" / „Entsperren", „Entsperrt" |
| 8146 | A | Tooltip „Passwort direkt setzen" | unklar | „Passwort vorgeben" |
| 8173–8175 | A | „„x" sperren? Die Anmeldung wird abgewiesen und die laufende Sitzung fällt. Alle Beiträge bleiben stehen." | Kunstdeutsch | „„x" sperren? Der Benutzer wird abgemeldet und kann sich nicht mehr anmelden. Alle Beiträge bleiben erhalten." |
| **8015–8019** | **A** | `prompt()` „Neues Passwort für „x" (mindestens 10 Zeichen) — der direkte Weg ohne Link. Alle Sitzungen dieses Zugangs fallen dabei."; Dialog „Fremdes Passwort setzen" | **Klartext im Browserfenster**, Kunstdeutsch, Bauprozess | eigenes Fenster mit Passwortfeld: „Passwort für „x" setzen / Mindestens 10 Zeichen. Alle Sitzungen dieses Benutzers werden beendet." |
| **8026–8044** | **A** | drei `confirm()` hintereinander: „OK = seine 5 Einträge MITLÖSCHEN … Abbrechen = stehen lassen", „Und seine Beiträge in fremden Einträgen? … OK = mitlöschen. Abbrechen = stehen lassen", dann „„x" jetzt entfernen? … Nur vorübergehend aussperren?", dann Passwortfenster mit fast gleichem Text | **falsch („Abbrechen" bricht nicht ab)**, zu lang, Ton (Großbuchstaben) | ein Fenster: Titel „Benutzer „x" löschen?", zwei Häkchen („Seine 5 Einträge mitlöschen — samt 3 fremden Kommentaren daran", „Seine Beiträge in fremden Einträgen mitlöschen"), ein Satz zum Sperren als Alternative, Knöpfe „Abbrechen" / „Benutzer löschen"; danach das Passwortfenster |
| 8233–8234, 8253, 8301 | A | „Zugang entfernen" / „Zugang entfernt" / „Gelöschte Zugänge" / „stillgelegt" | uneinheitlich | „Benutzer löschen" / „Benutzer gelöscht" / „Gelöschte Benutzer" |
| 8268 | A | Tooltip „Die Grabsteine der entfernten Zugänge ansehen" | Insider | „Gelöschte Benutzer ansehen" |
| 8277–8282 | A | „Ein entfernter Zugang wird zum Grabstein: … denn der Grabstein IST das Löschen. Zurückholen lässt sich ein Zugang nicht; sperren ist der umkehrbare Weg." (60 Wörter) | Insider, Bauprozess | „Gelöschte Benutzer. Der Name ist wieder frei und wird nicht gespeichert; ihre Beiträge tragen „Gelöschter Benutzer <Nummer>". Ein gelöschter Benutzer lässt sich nicht wiederherstellen — wer nur aussperren will, sperrt." |
| 8246 | A | Leerhinweis „Kein Zugang." | unklar (klingt wie „kein Zutritt") | „Noch keine Benutzer." |

## G. Einstellungen — Anfragen, Protokoll, Mail, Datenbank (`app.js` 8136–9990)

| Zeile | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| 8330–8337 | A | Anfragen-Einleitung, 65 Wörter („Niemand kommt hier herein, ohne dass ein Admin ihn hereinlässt …", „und es fehlt nichts") | zu lang, Ton | „Registrierung: Wer sich auf der Anmeldeseite mit Name und E-Mail meldet und die Adresse bestätigt, erscheint hier. Ein Admin schaltet frei oder lehnt ab." + Mehr: „Unbestätigte Anfragen verfallen nach N Stunden." |
| 8342–8347 | A | „Der Versand trägt gerade nicht — …", „… er steht so, wie ihr ihn gestellt habt.", „Einschalten geht erst, wenn der Versand steht." | Kunstdeutsch, Bauprozess, Anrede „ihr" | „Der Mailversand funktioniert gerade nicht — die Registrierung bleibt eingeschaltet, aber niemand kann eine Anfrage stellen." / „Einschalten ist erst möglich, wenn der Mailversand eingerichtet ist." |
| 8351–8355 | A | „Freischalten legt einen Zugang mit der Rolle Benutzer an — nie mit einer anderen — und erzeugt den Einladungslink, über den der Betreffende …" | zu lang, Ton | „Freischalten legt einen Benutzer an und erzeugt den Einladungslink. Ablehnen entfernt die Anfrage; es geht keine Nachricht hinaus." |
| 8420 | A | „gefragt 12.03.2026" | unklar | „angefragt 12.03.2026" |
| 8410, 8426 | A | Rückfragen über `confirm()` | uneinheitlich | `confirmBox` mit Knopf „Freischalten" / „Ablehnen" |
| 8458–8464 | E | „Wer Zugang hatte und wer diese Installation als Ganzes angefasst hat. …, und das bleibt so. … Einen anderen Weg hinaus gibt es nicht — ein Sicherheitsprotokoll, das sich wegräumen lässt, wäre keins." | Bauprozess, Ton | „Anmeldungen, Benutzer und Eingriffe an der Installation. Nicht enthalten: Inhalte, Bewertungen, IP-Adresse, Browser." / „Einträge werden nach N Tagen automatisch gelöscht; ein Löschen von Hand gibt es nicht." |
| 8501, 8517–8519 | E | „Anfrage freigegeben" neben „Zugang freigegeben" (= entsperrt) | uneinheitlich | „Anfrage freigeschaltet" / „Benutzer entsperrt" |
| 8506 | E | „Export gezogen" | Ton | „Export erstellt" |
| 8545 | E | Merkmal „mehreres" | unklar | „mehrere Angaben" |
| 8554 | E | „über zugang.js auf dem Wirt" | Insider, Kunstdeutsch | „per Kommandozeile am Server" |
| 8575 | E | Filterknopf „Bestand" (Export, Import, Sicherung, Schlüsselwechsel) | uneinheitlich (Reiter „Datenbank") | „Datenbank" |
| 8581 | E | Tooltip „Angelegt, gesperrt, entfernt, Rollen, Links und Anfragen" | unklar | „Benutzer angelegt, gesperrt, gelöscht; Rollen, Links, Anfragen" |
| 8742–8746 | E | „E-Mail ist eine Bequemlichkeit, keine Voraussetzung. … stehen dann wie bisher im Verwaltungsbereich zum Kopieren." | Bauprozess („wie bisher"), uneinheitlich („Verwaltungsbereich") | „E-Mail ist optional. Ohne Mailzugang zeigt Kriterion Einladungs- und Reset-Links zum Kopieren an; mit Mailzugang werden sie zusätzlich verschickt." |
| 8775–8779 | E | „Ohne OEFFENTLICHE_ADRESSE in der .env wird nichts verschickt. Der Server wüsste sonst nicht, worauf der Link zeigen soll — und aus dem Host-Kopf darf er es nicht ableiten: …" | Bauprozess, Kunstdeutsch („Host-Kopf") | „Ohne die Server-Einstellung `OEFFENTLICHE_ADRESSE` wird nichts verschickt: Der Server braucht sie, um gültige Links zu erzeugen." (Warum: README) |
| 8868, 8926, 8964 | E | „TLS von Anfang an (meist 465)" | Kunstdeutsch | „SSL/TLS (meist 465)" |
| 8870–8872 | E | „… nie unmittelbar vom Hausanschluss: dort fehlen rDNS und SPF/DKIM, und die Mail landet im besten Fall im Spam." | Kunstdeutsch, Insider | „Immer über den SMTP-Server eines Anbieters, nicht direkt vom eigenen Internetanschluss — sonst landet die Mail im Spam." |
| 8944–8946 | E | Titel „Mailzugang setzen"; „… läuft künftig JEDE Mail dieser Installation …" | uneinheitlich, Ton | „Mailzugang speichern"; „Über diesen Server laufen künftig alle Mails dieser Installation — auch die Links zum Passwort-Setzen." |
| 8987 | E | „Die Testmail ist an X hinausgegangen. Kommt sie an, steht der Versand." | Kunstdeutsch | „Testmail an X gesendet. Kommt sie an, funktioniert der Versand." |
| 9061–9062 | A | „… Version und Fingerprint der laufenden Dateien — und ganz unten die Verfahren, mit denen gearbeitet wird." | unklar, Insider | „Umfang des Bestands, Größe der Datenbank, Version — unten die eingesetzten Verschlüsselungsverfahren." |
| 9092 | A | „Export, alles" | unklar | „Exportgröße (alles)" |
| 9103 | A | „Fingerprint" | Insider (Grenzfall, echte Auskunft) | „Prüfsumme (Fingerprint)" |
| 9106 | A | „Der Schlüssel kommt aus der Umgebung. Denk daran: …" | Kunstdeutsch | „Der Schlüssel kommt aus der Server-Einstellung `ENCRYPTION_KEY`. `.env` und `data/` nie in dieselbe Sicherung legen — ohne Schlüssel sind die Daten verloren." |
| **8923–8926** | **A** | Warnkasten mit dem Klartextschlüssel `ENCRYPTION_KEY=…` und `docker compose up -d`, 55 Wörter; „Protokoll" meint hier das Server-Log | **Rolle (jeder Admin sieht den Schlüssel)**, zu lang, uneinheitlich | Kasten nur für den Eigentümer; „… im Server-Log „Schlüssel aus ENCRYPTION_KEY geladen" prüfen, erst dann `data/encryption.key` löschen." Der Befehl im Kasten „Auf dem Server". |
| 9136, 9139, 9140 | A | „Verfahren", „256 Bit roh", „Journal" | unklar, Insider | „Technische Verfahren", „256 Bit (Zufallsschlüssel)", „Journal (SQLite)" |
| 9142–9144 | A | „Der Schlüssel geht roh in die Datenbank (PRAGMA key = x'…') — ohne Ableitung, weil er kein Passwort ist, sondern schon 256 Zufallsbits trägt." | Bauprozess, Insider | streichen (steht in der README) |
| 9181, 9186–9190 | A | Karte „Bildablage"; „Die beiden Ableitungen sind immer JPEG … die kleine ist 512 × 512 und trägt den eingestellten Bildausschnitt …" | Kunstdeutsch, zu lang | Karte „Bildformate"; „Original-Fotos nach Format. Die automatisch erzeugten Vorschaubilder (JPEG) sind nicht mitgezählt." *(E6)* |
| 9005–9008 | A | „PNG — werden umgestellt" (auch bei ausgeschaltetem Schalter), „WebP — liegen schon so", „bleiben unangetastet" | unklar, Kunstdeutsch | „PNG — wird bei eingeschalteter Umwandlung zu WebP" (nur wenn an), „WebP — Zielformat", „bleiben unverändert" |
| 9200–9210 | E | Schalter „PNG-Originale beim Hereinkommen umwandeln"; Absatz 45 Wörter („… byte-genau so liegen, wie es ankam."); Knopf „Alle PNG nach WebP umstellen" | Kunstdeutsch, zu lang, uneinheitlich (umwandeln/umstellen) | „PNG-Fotos beim Upload in WebP umwandeln"; „Eingefügte Screenshots (PNG) werden als WebP gespeichert — etwa zwei Drittel kleiner, ohne sichtbaren Verlust. JPEG, GIF und WebP bleiben unverändert."; „Alle PNG in WebP umwandeln" |
| 9230–9257, 9440–9443 | E | „Umstellung läuft …", „Bildumstellung", „Vorschaubilder werden nachgezogen — N von M", „nachgezogen" / „erneuert" im Wechsel | uneinheitlich, Kunstdeutsch | „Umwandlung läuft — N von M …", „Vorschaubilder werden erneuert — N von M …", „Vorschaubilder erneuert" |
| 9311–9318 | E | Bestätigung „Bildablage umstellen", 60 Wörter („… plane ein Zeitfenster ein, das den Betrieb am wenigsten stört") | zu lang, unklar | „PNG in WebP umwandeln / N PNG-Fotos (X) werden umgewandelt, die Originale ersetzt (danach etwa Y). Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden." |
| 9343–9345 | E | „Der Sicherungsweg — eine vollständige, verschlüsselte Kopie … braucht beim Schreiben keinen nennenswerten Arbeitsspeicher, überlebt aber keinen Formatwechsel." | Kunstdeutsch, Bauprozess | „Sicherung (Backup): vollständige, verschlüsselte Kopie der Datenbank — auch mit dem, was der Export nicht enthält. Lässt sich nur in dieselbe Programmversion zurückspielen." |
| 9418–9436 | E | drei Schlüsselwechsel-Kästen („Sicher jetzt neu", „Heb ihn auf", „heutigen Schlüssel", „Passwortspeicher") | zu lang, Ton, Kunstdeutsch | „Keine Sicherung passt zum aktuellen Schlüssel (gewechselt am D). Ältere Sicherungen öffnen sich nur mit dem alten Schlüssel — bewahre ihn in einem Passwort-Manager auf. Bitte jetzt neu sichern." |
| 9436–9446 | E | zwei Lage-Kästen (65 / 30 Wörter): „Arbeitsverzeichnis", „Projektverzeichnis", „Projektordner", „der Weg in der README holt sie eigens zurück" | zu lang, Bauprozess, uneinheitlich | „Der Sicherungsordner liegt im Projektordner von Kriterion. Empfohlen ist ein Ordner außerhalb, am besten auf einer anderen Platte — sonst trifft ein Fehler am Projektordner Original und Sicherung zugleich. Einstellung: `docker-compose.yml`." / „Der Sicherungsordner liegt außerhalb des Projektordners — so bleibt er bei Updates unberührt." |
| 9454–9459 | E | „Zielort"; „… es muss dort schon liegen — angelegt wird keines."; Platzhalter „(der eingerichtete Ort selbst)" | uneinheitlich, unklar | „Sicherungsordner"; „Optional ein vorhandener Unterordner:"; Platzhalter „(kein Unterordner)" |
| 9460–9462 | E | „Während die Kopie entsteht, steht die Installation still — bei X sind das etwa N Sekunden." | uneinheitlich | „Während der Sicherung ist Kriterion kurz nicht erreichbar — bei X etwa N Sekunden." |
| 9535–9537, 9577, 9645 | E | „… dem Namensschema der Installation entspricht.", „… die Karte Sicherung darüber sagt, wie er eingehängt wird.", „Die Regel lässt sie liegen." | Insider, unklar | „Gelöscht werden nur Sicherungen, die Kriterion selbst angelegt hat.", „Es ist kein Sicherungsordner eingerichtet (siehe Karte Sicherung).", „Das automatische Aufräumen löscht sie nicht." |
| 9779–9799 | E | Toast „… — K nicht"; Dialoge „Zurück führt nichts. Welche es sind, rechnet der Server im Augenblick des Löschens noch einmal aus …", „hast du ihn noch, dann jetzt nicht löschen" | unklar, Bauprozess, Ton | „… — K nicht gelöscht"; „N Sicherungen (X) werden endgültig gelöscht."; „Sie lassen sich nur mit dem alten Schlüssel öffnen. Das Löschen ist endgültig." |
| 9792–9797 | E | „Der Austauschweg — … die Datei überlebt einen Formatwechsel …", „… weil Bilder als Text kodiert werden müssen — rechne mit rund einem Drittel Aufschlag" | Kunstdeutsch, Bauprozess | „Export: für Umzug, Archiv und Weitergabe — unverschlüsselt, auch mit späteren Versionen lesbar. Für den Notfall: Karte Sicherung." / „Schreibt den gesamten Bestand in eine Datei; die erwartete Größe steht an den Knöpfen." |
| 9818 | E | „Ohne Häkchen bleiben die Videos zurück; die Einträge nennen sie, die Dateien fehlen." | unklar | „Ohne Häkchen werden Videos nicht mitgenommen; im Eintrag bleibt nur der Verweis." |
| 9935–9946 | E | Warnkasten Exportgröße, 80 Wörter („Eine Exportdatei ist ein einziger Text …", „Der Knopf oben bleibt trotzdem — … wer weiß, was er tut, soll es versuchen dürfen.") | zu lang, Bauprozess, Ton | „Export mit Fotos: rund X — mehr als die Höchstgröße von Y je Datei (ohne Fotos: rund Z). Nutze „In Teilen exportieren"; jeder Teil ist eine vollständige Exportdatei. Für ein Backup ist die Karte Sicherung einfacher." |
| 9904–9913, 9814, 9929 | E | „geschnitten wird zwischen Einträgen, nie mitten hinein", „Ein Export nimmt den Bestand mit aus dem Haus.", „eine Datei, die das Haus verlässt" | Ton, Metapher | „Jeder Teil ist eine vollständige Exportdatei."; „Vor dem Export wird einmal dein Passwort abgefragt; danach lädst du jeden Teil einzeln."; „… unverschlüsselt in eine Datei — mit allen Fotos, Anhängen und Verfassernamen." |
| 9865–9868 | E | „Der Export liest, der Import schreibt — je nach Betriebsart …" | Ton, Kunstdeutsch | „Spielt eine Exportdatei ein — entweder zusammenführen oder den vorhandenen Bestand ersetzen. Vorher wird nachgefragt und das Passwort verlangt." |
| 10053–10057 | E | „Zum Einspielen wird sie als ein einziger Text gelesen, und der kann nicht größer als Y werden …" | Bauprozess | „Dateien über Y kann der Import nicht verarbeiten — er bricht ab, ohne etwas zu ändern. Für eine vollständige Wiederherstellung ist die Sicherung der richtige Weg." |
| 10111–10112 | E | „Der Import legt Einträge, Kommentare und Bewertungen unter fremden Namen an." | unklar | „… mit den Verfassernamen aus der Datei an." |
| 10129–10130 | E | „N Videos fehlte in der Datei und wurde übergangen — steht ein Eintrag jetzt anders da, ist das der Grund." | Grammatik, unklar | „N Videos fehlten in der Datei und wurden übersprungen." |

## H. Servermeldungen (`server.js`, `auth.js`, `mail.js`)

*Rund 175 Meldungen; die meisten sind kurze, richtige Sätze („Das Passwort stimmt nicht.",
„Dieses Kriterium gibt es bereits.", „Das Datum kann nicht in der Zukunft liegen."). Hier die
auffälligen.*

| Stelle | Rolle | heute | Befund | Vorschlag |
|---|---|---|---|---|
| `server.js` 972, 3430, 3462, 3642 … (20 Stellen) | B | „Nicht gefunden" | unklar (was?) | je Route benennen: „Dieser Eintrag ist nicht mehr da.", „Diese Datei gibt es nicht mehr." — mit `V` für das Vokabelwort |
| 2219, 2251, 2299, 2316, 2343, 3436, 4298, 4334 | B | „Name fehlt", „Titel fehlt", „Text fehlt" | Ton (Telegramm) | „Bitte einen Namen eingeben." usw. |
| 2378, 4146 | B | „Tag-Name fehlt" | Ton | „Bitte einen Tag eingeben." |
| 4049 | B | „Adresse oder Suchbegriff fehlt" | Ton | „Bitte eine Adresse oder einen Suchbegriff eingeben." |
| **2228, 2262** | A | „Der Kasten muss „vorher" oder „nachher" sein.", „Der Kasten eines Kriteriums lässt sich nicht ändern." | **Kunstdeutsch, Insider (Spaltenwerte)** | „Ein Kriterium gehört entweder zu „Potenzial" oder zu „Bewertung"." / „Ob ein Kriterium zu Potenzial oder Bewertung gehört, lässt sich später nicht ändern." (mit `V.potenzial`) |
| 3889, 3901 | B | „Ungültiger Fokuspunkt", „Ungültiger Bildausschnitt" | Insider | „Dieser Bildausschnitt ist ungültig." |
| 3933, 4361 | B | „Mehr als N Dateien je Eintrag sind nicht vorgesehen.", „Mehr als N Bilder je Kommentar sind nicht vorgesehen." | Ton („nicht vorgesehen") | „Höchstens N Dateien je Eintrag." / „Höchstens N Bilder je Kommentar." |
| 630 | vor | „Dieser Zugang ist gesperrt. Der Admin kann ihn wieder freigeben." | uneinheitlich (freigeben) | „Dieser Zugang ist gesperrt. Der Admin kann ihn entsperren." |
| 621 | vor | „Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn." | Ton | „Die Anmeldung ist abgelaufen. Bitte melde dich noch einmal an." |
| 1061 | B | „Die eigene Anmeldung wird über „Abmelden" beendet." | uneinheitlich (Sitzung) | „Diese Sitzung beendest du über „Abmelden"." |
| 1064 | B | „Diese Anmeldung gibt es nicht mehr." | uneinheitlich | „Diese Sitzung gibt es nicht mehr." |
| 1184, 1198–1217 | A/E | „Diesen Zweck gibt es nicht.", „Entweder ein Ziel oder mehrere, nicht beides.", „Jedes Ziel ist eine Nummer.", „Ein Ziel steht doppelt in der Liste." | Insider (Innenwerte der zweiten Bestätigung) | dürfen bleiben — sie erreichen die Oberfläche nur, wenn der Browser etwas Falsches schickt; dann aber als „Die Bestätigung konnte nicht verarbeitet werden." |
| 1980 | B | „Mehr als N gespeicherte Ansichten gibt es nicht." | Ton | „Höchstens N gespeicherte Ansichten." |
| 5254 | E | „Dieser Eintrag ist als Datei zu groß …" | Vokabel (kommt über `vokabular()` — in Ordnung) | — |
| 5869 | E | „Das Paket lässt sich nicht lesen." | Insider („Paket" = Papierkorbeintrag) | „Dieser Papierkorbeintrag lässt sich nicht lesen." |
| 6415 | E | „In dieser Sekunde liegt dort schon eine Sicherung." | Kunstdeutsch („liegt") | „In dieser Sekunde wurde dort schon eine Sicherung angelegt — bitte noch einmal." |
| 6541 | E | „Es gibt keinen Schlüsselwechsel — damit auch keine veralteten Kopien." | uneinheitlich (Kopien) | „Der Schlüssel wurde nie gewechselt — es gibt keine veralteten Sicherungen." |
| 6593 | B | „Im Server ist etwas schiefgegangen." | Ton | „Auf dem Server ist ein Fehler aufgetreten." |
| `auth.js` 220 | A | „Dieser Name ist für gelöschte Zugänge vorgesehen und nicht frei wählbar." | Insider | „Dieser Name ist reserviert." |
| `auth.js` 397, 411, 476 | E | „Das ist der letzte Eigentümer dieser Installation — vorher einen zweiten bestimmen." | in Ordnung, nur Wortwahl | „Das ist der letzte Eigentümer — bitte vorher einen zweiten bestimmen." |
| `auth.js` 901 | vor | „Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern." | **Vorbild**: Ursache plus nächster Schritt | — |
| `mail.js` 189–200 | E | „Der Benutzername beim Anbieter fehlt.", „Beim eigenen Server fehlt der Servername." | in Ordnung | — |

*Innere Fehler wie „`qComments()` ohne Benutzer aufgerufen" oder „Ein Ausweis braucht einen
Zugang." erreichen den Bildschirm nicht — sie sind Prüfungen im Quelltext und bleiben, wie sie
sind.*
