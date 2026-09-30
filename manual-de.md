# Kriterion — Handbuch

[English](manual.md) · Deutsch · [Türkçe](manual-tr.md)

Die Bedienung von Kriterion. Installation, Schlüssel, Backup und Update stehen
in der [README](README-de.md).

---

**Inhalt**

- [Anmeldung](#anmeldung)
- [Benutzer und Rollen](#benutzer-und-rollen)
- [Übersicht](#übersicht)
- [Eintrag](#eintrag)
- [Kommentare](#kommentare)
- [Bewertung](#bewertung)
- [Einstellungen](#einstellungen)
- [Export und Import](#export-und-import)
- [Auf dem Handy und auf dem Tablett](#auf-dem-handy-und-auf-dem-tablett)
- [Sprache](#sprache)
- [Vokabular](#vokabular)
- [Hell oder dunkel](#hell-oder-dunkel)
- [Schriftgröße](#schriftgröße)

---

## Anmeldung

Ohne Anmeldung ist nur der öffentliche Titel zu sehen. Sitzungen laufen nach
30 Tagen ab.

Nach mehreren Fehlversuchen antwortet die Anmeldung verzögert. Nach zehn
Fehlversuchen von derselben Adresse ist sie für einige Minuten gesperrt, auch
über einen Neustart hinweg. Je Benutzername wird nur verzögert, nie gesperrt.

Ein ungültiger Einladungs- oder Rücksetzlink (abgelaufen, eingelöst, falsch
oder Account gesperrt) ergibt immer dieselbe Meldung: „Dieser Link gilt nicht
mehr. Bitte beim Admin einen neuen anfordern."

### Zweiter Faktor

Freiwillig, je Account, ab Werk aus. Niemand kann ihn für einen anderen ein-
oder ausschalten, auch der Eigentümer-Admin nicht. Der Code kommt aus einer App auf
dem Telefon; Kriterion verschickt keine Codes.

Einschalten in der Karte „Mein Account":

1. Eine TOTP-App installieren, etwa Google Authenticator, Aegis, 1Password
   oder die Passwörter-App von iOS.
2. „Zweiten Faktor einschalten" wählen und das Passwort eingeben. Am Telefon
   öffnet „In der App öffnen" die App direkt, am Rechner wird der Schlüssel
   ohne Leerzeichen abgetippt.
3. Den sechsstelligen Code eingeben und „Einschalten" wählen.

Danach fragt die Anmeldung Passwort und Code. Jeder Code gilt einmal; die Uhren
dürfen eine halbe Minute abweichen. Der Code wird auch vor Export, Import,
Rollenvergabe, fremden Passwörtern und beim Einlösen eines Rücksetzlinks
verlangt.

**Wiederherstellungscodes:** Beim Einschalten erscheinen acht Codes. Sie werden
nur einmal angezeigt und gelten je einmal anstelle eines App-Codes. **Getrennt
vom Telefon aufbewahren.** Ohne sie ist ein verlorenes Telefon ein verlorener
Account. Neue Codes gibt es in „Mein Account" gegen Passwort und Code; die alten
verfallen dann.

Sind Telefon und Codes weg, schaltet der Eigentümer-Admin den zweiten Faktor auf dem
Server aus (README, „Befehle auf dem Server").

### Zweite Bestätigung

Vor Export, Import, Rollenvergabe, dem Setzen eines fremden Passworts, dem
Erzeugen eines Links, dem Löschen eines Benutzers und dem Speichern des
Mailzugangs fragt Kriterion noch einmal nach dem eigenen Passwort. Die
Bestätigung gilt einmal, nur für diese Handlung und nur in dieser Sitzung.

Nicht bestätigt werden: Sperren und Entsperren, Anlegen eines Benutzers,
Änderungen am eigenen Account, die Testmail und alles am Eintrag.

## Benutzer und Rollen

| Rolle | darf |
|---|---|
| Benutzer | eigene Einträge, Kommentare, Bewertungen, Testtage, Favoriten |
| Admin | zusätzlich Kriterien, Tags, Kategorien, Titel, Vokabular, Suchmaschinen; fremde Beiträge löschen (nicht ändern); Benutzer verwalten, aber keine Admins und nicht den Eigentümer-Admin |
| Eigentümer-Admin | zusätzlich Export, Import, Backup, Mailzugang, Rollenvergabe, Schlüsselwert, Sicherheitsprotokoll |

Wer die Installation einrichtet, ist Eigentümer-Admin. Die Rolle lässt sich
weitergeben.

Verwaltet wird in der Karte „Benutzer" (Einstellungen › Benutzer). Es gilt:

- Ein Admin ändert keine anderen Admins und nicht den Eigentümer-Admin.
- Der letzte aktive Eigentümer-Admin lässt sich nicht herabstufen, sperren oder
  entfernen.
- Niemand sperrt oder entfernt sich selbst.

Sperren wirkt sofort: die Sitzung endet, offene Links des Benutzers verfallen.

### Benutzer anlegen

Das Auswahlfeld neben dem Namen bestimmt den Weg:

- **„Benutzer wählt Passwort selbst (per Link)"** (Vorgabe): „+ Anlegen und
  Link erzeugen" legt den Benutzer ohne Passwort an und zeigt einen Link. Wer
  ihn öffnet, wählt sein Passwort. Bis dahin steht in der Liste „noch kein
  Passwort".
- **„Ich vergebe das erste Passwort"**: Passwortfeld und „+ Anlegen".

Ein Link gilt sieben Tage und einmal. Ab dem ersten Öffnen bleiben 15 Minuten.
**Wer den Link hat, kann das Passwort setzen.** Er wird nur einmal angezeigt.

Mit einer E-Mail-Adresse im optionalen Feld geht der Link zusätzlich per Mail
hinaus, sofern der Mailversand eingerichtet ist. Die Adresse ändert danach nur
der Benutzer selbst in „Mein Account".

### Passwort zurücksetzen

- **Link zum Zurücksetzen:** das alte Passwort gilt, bis der Link eingelöst
  ist; danach enden alle Sitzungen des Benutzers.
- **Passwort direkt setzen:** alle Sitzungen enden sofort.

Kommt niemand mehr herein, hilft nur der Befehl auf dem Server (README).

### Benutzer löschen

Der Name wird frei, die Beiträge bleiben und tragen „Gelöschter Benutzer 7".
Zwei Häkchen löschen auf Wunsch mit:

- die Einträge des Benutzers, samt fremder Kommentare, Bewertungen und
  Testtage daran (das Fenster nennt die Zahlen);
- seine Beiträge in Einträgen anderer, auch seine Ordner dort.

Sitzungen, offene Links, Favoriten und persönliche Einstellungen gehen immer
mit. Wer nur die Anmeldung unterbinden will, sperrt statt zu löschen. Gelöschte
Benutzer stehen hinter „Gelöschte Benutzer (n)".

### Registrierung

Mit eingeschalteter Registrierung kann jemand auf der Anmeldeseite über
„Account anfragen" einen Account erbitten. Ab Werk ist sie aus. Der Schalter
steht in der Karte „Anfragen" und lässt sich nur einschalten, wenn:

- eine Testmail durchgekommen ist (nach jeder Änderung am Mailzugang erneut),
- `PUBLIC_ADDRESS` in der `.env` steht (README, „Konfiguration").

Ablauf:

1. Anfrage mit Benutzername und E-Mail-Adresse, ohne Passwort.
2. Kriterion schickt einen Bestätigungslink, 24 Stunden gültig. Er öffnet
   keinen Account.
3. Erst die bestätigte Anfrage erscheint in der Karte „Anfragen".
4. Ein Admin schaltet frei (Rolle Benutzer, mit Einladungslink) oder lehnt ab.
5. Der Benutzer setzt sein Passwort über den Einladungslink.

Die Antwort auf eine Anfrage ist immer gleich, ob der Name frei ist oder
nicht. Höchstens 20 Anfragen warten gleichzeitig. Fällt der Mailversand
später aus, bleibt der Schalter an; die Karte zeigt eine rote Zeile.

### Mailversand

Optional. Ohne Mailzugang stehen alle Links zum Kopieren da. Kriterion
verschickt nur zwei Arten von E-Mails, beide als reiner Text: Tokenlinks und
die Testmail.

Den Mailzugang richtet nur der Eigentümer-Admin ein, in der Karte „Mailversand"
(Einstellungen › Benutzer). Der Dialog fragt Anbieter (GMX, Web.de, Gmail,
Strato, IONOS oder „Eigener Server"), Benutzername, Passwort und
Absenderadresse. Server, Port und Verschlüsselung kommen bei den Vorlagen aus
Kriterion. Das Passwort wird nie angezeigt; ein leeres Feld lässt es
unverändert.

Häufige Fehler:

- Gmail verlangt ein App-Passwort.
- GMX und Web.de verlangen, den Versand über fremde Programme im Konto
  freizuschalten.
- Die Absenderadresse muss zum Konto gehören.
- Nie direkt vom eigenen Internetanschluss senden, immer über den SMTP-Server
  eines Anbieters.

Landet die E-Mail im Spam, fehlen für die Absenderdomain meist die Einträge SPF,
DKIM und DMARC. Die Werte liefert der Mailanbieter. Prüfen lässt es sich an
einer Testmail an ein Gmail-Konto unter „Original anzeigen".

„Testmail an mich" geht an die Adresse des eigenen Accounts. Antwortet der
Mailserver nicht, bricht der Versuch nach 20 Sekunden ab; der Link steht
trotzdem zum Kopieren da.

### Meine Sitzungen

Die Karte zeigt, wo der eigene Account angemeldet ist, und beendet mit „Alle
anderen Sitzungen beenden" alle außer der aktuellen. Gerät und IP-Adresse
werden nicht gespeichert. Jeder sieht nur seine eigenen Sitzungen.

### Sicherheitsprotokoll

Nur für den Eigentümer-Admin. Es verzeichnet Anmeldungen (gelungen und
gescheitert), Änderungen an Benutzern und Rollen, gesetzte Passwörter,
erzeugte und eingelöste Links, Export, Import, Backup und Schlüsselwechsel.
Nicht darin: Inhalte von Einträgen, IP-Adressen, Browserkennungen.

Die Ansichten „Alle · Gescheitert · Anmeldungen · Benutzer · Zweiter Faktor ·
Datenbank" zeigen je die 100 jüngsten Zeilen. Namen führen zur Karte
„Benutzer". Zeilen bleiben 180 Tage und lassen sich nicht vorher löschen.

### Wer was darf

Am einzelnen Eintrag. „Verfasser" ist, wer die jeweilige Sache angelegt hat.

| | Verfasser | jeder andere | Admin |
|---|---|---|---|
| alles sehen | ✔ | ✔ | ✔ |
| Titel, Beschreibung, Fotos, Videos, Tags, Kategorie, getestet, abgelehnt | ✔ | — | ✔ |
| Begründung einer Ablehnung umschreiben | wer sie getroffen hat | — | wer sie getroffen hat |
| Begründung einer Ablehnung entfernen | ✔ | — | ✔ |
| Eintrag löschen | ✔ | — | ✔ |
| Favorit | jeder für sich | | |
| eigene Bewertung, eigener Testtag | ✔ | ✔ | ✔ |
| Link eintragen, Datei hochladen | ✔ | ✔ | ✔ |
| eigenen Link, eigene Datei löschen | ✔ | ✔ | ✔ |
| fremden Link, fremde Datei löschen | — | — | ✔ |
| Ordner anlegen | ✔ | ✔ | ✔ |
| Ordner umbenennen, in einen Ordner hochladen | ✔ | — | — |
| Ordner löschen | ✔ | — | ✔ |
| Datei verschieben, nur in eigene Ordner | ✔ | — | — |
| Vorschaubild eines Videos unter „Dateien“ setzen | ✔ | — | — |
| Links umsortieren | ✔ | — | ✔ |
| Kommentar schreiben | ✔ | ✔ | ✔ |
| eigenen Kommentar ändern | ✔ | — | — |
| fremden Kommentar löschen | — | — | ✔ |
| Art und Anpinnung eines Kommentars | ✔ | — | ✔ |
| fremden Testtag oder fremde Bewertung löschen | — | — | ✔ |
| fremde Note oder Bewertung ändern | — | — | — |
| sehen, wer wie bewertet hat | — | — | ✔ |
| Bild oder Video an einen Kommentar hängen | ✔ | — | — |
| Bild oder Video aus einem Kommentar löschen | ✔ | — | ✔ |

Ein Admin löscht fremde Beiträge, ändert sie aber nicht. Entfernt er ein Bild
aus einem fremden Kommentar, steht dort „2 Bilder oder Videos vom Admin
entfernt".

### Verfasser

Ab dem zweiten Account nennen Eintrag, Kommentar und Testtag ihren Verfasser.
Links und Dateien nennen, wer sie eingetragen hat, auch den Verfasser des
Eintrags; das Datum steht am Mauszeiger. Die Bewertung zeigt nur den eigenen Wert
und den Schnitt; wer wie bewertet hat, sieht nur der Admin über „Wer hat
bewertet".

## Übersicht

### Suche

Die Suche findet Text in Titel, Beschreibung, Kategorie, Tags am Eintrag, Tags
an Testtagen, Link-Adressen und Kommentaren. `/` springt ins Suchfeld. Groß-
und Kleinschreibung zählt nicht; `ß` und `ss` gelten als verschieden.

Jede Trefferkachel nennt unter dem Titel, wo der Begriff steht, etwa
„Kommentar: …in Bellavista empfohlen…". Der Begriff ist in Kachel, Linkliste
und Kommentaren hervorgehoben. Die Adresse eines geöffneten Treffers trägt den
Begriff (`#/item/12?q=ella`); Neuladen behält die Hervorhebung.

Beim Anlegen zeigt „Ähnlich: …" vorhandene Einträge mit ähnlichem Titel.

### Filter und Sortierung

- **Status:** Alles, Getestet, Ungetestet. Dazu „Ablehnung" (Alle, Abgelehnt,
  Nicht abgelehnt) und „★ Favoriten". Alle lassen sich kombinieren.
- **Kategorien:** mehrere wählbar, immer als Oder. „Ohne" zeigt Einträge ohne
  Kategorie.
- **Tags:** mehrere wählbar. Der Umschalter legt Und (Vorgabe) oder Oder fest.
  Gedämpfte Tags ergäben keinen Treffer mehr.
- **„Filter zurücksetzen (n)"** steht in der Sortierzeile, sobald ein Filter
  gesetzt ist. Suchbegriff, Sortierung und gespeicherte Ansichten bleiben.
- **Sortierung:** nach Änderung, Bewertung, Potenzial, Titel, Zahl der
  Testtage, Durchschnitt und letzter Tagesnote. Der Knopf daneben dreht die
  Richtung. Einträge ohne Wert stehen immer hinten.

Filter und Sortierung werden gespeichert und gelten auf jedem Gerät.

Die Kachel zeigt bei getesteten Einträgen die Bewertung („★ 3,8"), sonst das
Potenzial („◆ 4,2").

### Gespeicherte Ansichten

„+ Ansicht speichern" merkt die ganze Filterstellung samt Suchbegriff als
Knopf. Das Kreuz am Knopf entfernt sie. Bis zu acht Ansichten je Account.

### Zeitleiste

Zwischen Filtern und Kacheln: ein Punkt je Testtag, waagerecht das Datum,
senkrecht die Note. Ein Klick öffnet den Eintrag. Sie erscheint ab fünf
Testtagen und lässt sich in „Darstellung" abschalten.

### Vergleich

Das Häkchen auf einer Kachel nimmt den Eintrag in den Vergleich. Ab zwei
Accounts schaltet „meine / alle" zwischen eigenen Werten und dem Schnitt
aller.

### Glocke und „Offen"

Die Glocke meldet neue Kommentare und Bewertungen anderer seit dem letzten
Öffnen. Die Tafel teilt sie in „An mich gerichtet" (mit `@name` markiert),
„Meine Einträge" und „Alles andere". Jede Zeile nennt, was neu ist, und führt
zum Eintrag. Wer Kommentare geschrieben hat, steht dabei; Bewertungen bleiben
anonym.

Grenzen der Glocke:

- Sie rechnet beim Laden der Übersicht, nicht laufend.
- Sie führt keinen Lesestand je Meldung: das Öffnen der Tafel setzt alles auf
  gesehen.
- Geänderte Titel, neue Dateien und neue Testtage meldet sie nicht.

„Offen" zählt die unerledigten Aufgaben aller Einträge. Die Ansicht dahinter
ordnet sie nach Fälligkeit: überfällig, heute, später, ohne Datum. Abhaken
geht direkt dort.

## Eintrag

### Fotos und Videos

- Hinzufügen per Dateiauswahl, Strg+V oder Ablegen auf dem Feld.
- Fotos bis 30 MB, Videos (MP4, WebM, MOV) bis 20 MB. Die Grenzen stellt der
  Eigentümer-Admin ein. Die Zahl der Fotos ist nicht begrenzt. Ist ein Video
  zu groß, passt aber unter die Grenze „Datei“, nennt die Meldung den Block
  „Dateien“: dort lässt es sich hochladen.
- Das erste Element ist das Hauptbild. Reihenfolge durch Ziehen der
  Vorschaubilder.
- Blättern mit ← → oder den Pfeilen. Ein Klick öffnet das Vollbild, ein
  weiterer zoomt auf Originalgröße, Esc schließt. ↓ im Vollbild lädt die Datei
  herunter. Hat ein Video den Fokus, etwa nach einem Klick darauf, springen ←
  und → darin 5 Sekunden zurück oder vor, im Eintrag wie im Vollbild.
- **Link kopieren:** das Zeichen der Kette im Vollbild kopiert die Adresse des
  gezeigten Fotos oder Videos. Die Adresse öffnet den Eintrag und das Vollbild
  an dieser Stelle.
- Videos spielen nicht von selbst und halten beim Blättern an.
- **Stelle im Video:** Ein Video spielt dort weiter, wo man es zuletzt
  angehalten oder geschlossen hat, je Account und auf jedem Gerät. 10
  Sekunden steht „ab 3:12“ mit „Von vorn“ darüber. Unter 10 Sekunden und im
  letzten Stück (5 %, mindestens 10 Sekunden) merkt sich Kriterion nichts; das
  Video beginnt dann von vorn. Das gilt auch für Videos unter „Dateien“ und in
  Kommentaren.
- **Video ganz laden:** Spielt ein Video im Vollbild, lädt der Browser die ganze
  Datei, am Rechner bis 2 GB, am Telefon bis 500 MB. Oben steht „geladen 45 %“.
  Danach stockt das Video nicht mehr, und Springen braucht kein Laden. Größere
  Videos und Videos bei eingeschaltetem Datensparen lädt der Browser wie bisher
  stückweise. Nach dem Schließen bleibt nichts auf dem Gerät. Das gilt auch für
  Videos unter „Dateien“ und in Kommentaren.
- **Auswählen:** „Auswählen“ über der Bildleiste setzt ein Kästchen an jedes
  Foto und Video; Klick oder Leertaste wählt. Die Leiste darunter nennt die
  Zahl und bietet „Löschen“ mit einer Rückfrage, „Alle auswählen“ und
  „Abbrechen“; Esc beendet die Auswahl. Nur für den Verfasser des Eintrags und
  den Admin.
- Ein Bild aus der Zwischenablage wird deutlich größer als die Originaldatei.
  Besser die Datei hochladen.

### Bildausschnitt

„Ausschnitt" über dem Bild legt fest, welcher quadratische Teil auf der Kachel
erscheint. Ziehen außerhalb des Rahmens zieht einen neuen auf, Ziehen im
Rahmen verschiebt ihn, Ecken und Kanten ändern die Größe. Der Schieber stellt
den Zoom (auf dem Telefon die einzige Größeneinstellung). Das Original bleibt
unverändert.

### Tags, Dateien, Links

- **Tags:** Klick in der Tagwolke vergibt oder entfernt. Testtage können eigene
  Tags tragen.
- **Dateien:** stehen im Block „Dateien“ als Kacheln oder als Liste.
  Umgeschaltet wird im Kopf des Blocks mit „Kacheln“ und „Liste“; die Wahl
  gilt für alle Einträge und auf jedem Gerät. Die Kachel zeigt Vorschaubild
  oder Endung, darunter Name und Größe. Die Liste zeigt je Datei eine Zeile:
  kleines Vorschaubild, Name, Art, Größe, Datum des Uploads und bei mehreren
  Accounts, wer hochgeladen hat; auf dem Telefon stehen Größe und Datum unter
  dem Namen. Die Art ist Video, Bild, PDF, Word, Excel, PowerPoint, Text,
  Archiv oder Sonstige; bei einem Video stehen dort Codec und Länge, etwa
  „H.265 · 3:12“. Klick, Menü, Vorschau und Tastatur sind in beiden Ansichten
  gleich. Bis 2 GB je Datei (Grenze „Datei“), höchstens 100 je Eintrag.
- **Liste am Rechner:** Über der Liste steht eine Kopfzeile. Ein Klick auf
  „Name“, „Typ“, „Größe“ oder „Datum“ sortiert danach, ein zweiter kehrt die Richtung
  um; ▲ oder ▼ steht an der sortierten Spalte. Am Ende jeder Zeile stehen ✎
  (Bearbeiten, nur an einer Datei, die man bearbeiten darf) und 🔗 (Link auf
  die Datei kopieren); auf dem Telefon beides nur im Menü.
- **Sortieren:** die Auswahl neben „Kacheln“ und „Liste“ ordnet nach „Name“,
  „Datum“, „Größe“ oder „Typ“. Der Knopf daneben kehrt die Richtung um: „A → Z“
  und „Z → A“, „alt → neu“ und „neu → alt“, „klein → groß“ und „groß → klein“.
  Nach dem Wechsel gilt „A → Z“, „alt → neu“ oder „groß → klein“; Vorgabe ist
  „Datum“ mit „alt → neu“. „Typ“ ordnet die Arten wie „Nach Typ gruppiert“ und
  in jeder Art nach Name; „Z → A“ kehrt beides um. Die Wahl gilt für alle Einträge und auf jedem
  Gerät. Das Datum ist das des Uploads. „Name“ unterscheidet nicht nach Groß-
  und Kleinschreibung und stellt „2“ vor „10“. Die Dateien ohne Ordner bleiben
  oben, jeder Ordner bleibt eine Gruppe; die Ordner folgen derselben Wahl, nach
  Größe mit der Summe ihrer Dateien, nach „Typ“ nach Name. Laufende Uploads stehen am Ende ihrer
  Gruppe.
- **Gruppieren:** „Nach Typ gruppiert“ in der zweiten Auswahl setzt je Art eine
  Zwischenzeile mit der Zahl, etwa „PDF · 3“. Die Arten stehen nach Name,
  „Sonstige“ zuletzt; in jeder Art gilt die Sortierung. Jeder Ordner bekommt
  eigene Typgruppen. Das Vollbild blättert in derselben Folge. Die Wahl gilt
  wie die Sortierung für alle Einträge und auf jedem Gerät.
  Hochgeladen wird mit der Kachel „+“, in der Liste „Dateien hochladen“, oder
  durch Ablegen von Dateien auf dem Block. Jede Datei steht sofort als Kachel da und
  geht einzeln hoch, die kleinste zuerst. Die Kachel zeigt „wartet“, den
  Fortschritt in Prozent oder ⚠ mit dem Grund. Ein Upload läuft weiter, wenn
  man einen anderen Eintrag öffnet; beim Schließen des Tabs fragt der Browser
  nach. Fehlt die Verbindung, versucht Kriterion es nach 2, 5 und 15 Sekunden
  erneut.
- **Ordner:** „Ordner hinzufügen“ im Kopf des Blocks legt einen an; der Name
  hat 1 bis 80 Zeichen, gleiche Namen sind erlaubt. Oben stehen die Dateien
  ohne Ordner, darunter die Ordner in der Folge der Sortierung; jede Gruppe hat einen
  eigenen Rahmen, ein zugeklappter Ordner ist eine Leiste. Ein Klick auf den
  Kopf klappt einen Ordner auf oder zu; Kriterion merkt sich das je Account, auf
  jedem Gerät. Ein neuer Ordner steht offen. Ein Sprung zu einem Ordner, etwa
  von der Testtagzeile, öffnet ihn nur für diese Ansicht. Der
  Kopf nennt Zahl und Größe der Dateien, bei mehreren Accounts auch, wer den
  Ordner angelegt hat; zugeklappt zeigt er den Stand seiner Uploads. In einen
  eigenen Ordner lädt man über sein „+“ oder durch Ablegen auf ihm; in einen
  fremden lädt niemand hoch. „Verschieben nach …“ im Menü einer eigenen Datei
  bietet die eigenen Ordner und „Ohne Ordner“; die Datei behält Adresse,
  Vorschaubild und „Bearbeiten durch alle“. Das Menü ⋯ am Ordner bietet
  „Bearbeiten …“, „Link kopieren“ und „Ordner löschen“; die Dateien eines
  gelöschten Ordners stehen danach ohne Ordner. Wird ein Ordner gelöscht,
  während Dateien in ihn hochgehen, zeigen die wartenden ⚠ „Diesen Ordner gibt
  es nicht mehr.“ Ein Upload, der schon läuft, geht zu Ende; die Datei steht
  danach ohne Ordner.
- **Ordner mit Testtag:** Beim Anlegen und unter „Bearbeiten …“ bekommt ein
  eigener Ordner einen eigenen Testtag desselben Eintrags; ein Testtag hat
  höchstens einen Ordner. Die Testtagzeile zeigt dann 📁; ein Klick öffnet den
  Block und den Ordner. Der Kopf des Ordners zeigt das Datum mit ↑ und führt
  zur Testtagzeile zurück. Wird der Testtag gelöscht, bleibt der Ordner mit
  Namen und Dateien.
- **Upload in Stücken:** Jede Datei geht in Anfragen zu 8 MB hoch. Reißt die Verbindung ab, zeigt die Kachel
  „unterbrochen“ mit dem Stand; es geht von selbst weiter, sobald die
  Verbindung steht. Nach dem Schließen des Tabs setzt „Fortsetzen“ im Menü mit
  derselben Datei fort. Ein unterbrochener Upload verfällt nach 24 Stunden.
  Jeder Account hat höchstens drei offene Uploads. Auf dem Telefon die Seite
  offen und den Bildschirm an lassen.
- **Über „Anhang“:** Eine Datei über der Grenze „Anhang“ hat keine
  Textvorschau und kein Vorschaubild und öffnet nicht im Document Server; man
  lädt sie herunter. PDF, Bilder und Videos zeigt der Browser weiter. Kein
  Export enthält sie; sie stehen im Backup.
- **Dateien auf der Platte:** Jede Datei speichert Kriterion einzeln
  verschlüsselt neben der Datenbank. Fehlt eine Datei auf dem Server, zeigt
  ihre Kachel ⚠.
- **Auswählen:** „Auswählen“ im Kopf des Blocks setzt ein Kästchen an jede
  Datei, die man löschen darf; Klick oder Leertaste wählt. Das Kästchen im Kopf
  eines Ordners wählt alle darin, „Alle auswählen“ in der Leiste alle. Die
  Leiste nennt die Zahl und bietet „Löschen“ mit einer Rückfrage und, wenn
  jede gewählte Datei eine eigene ist, „Verschieben nach …“. „Abbrechen“ oder
  Esc beendet die Auswahl.
- **Klick auf eine Datei:** Ein Bild oder Video öffnet das Vollbild; ← und →
  blättern durch Bilder und Videos derselben Gruppe, ohne Ordner oder im
  selben Ordner, in der Folge der Anzeige. PDF, Text, Markdown, CSV,
  Log und `.docx` zeigen die Vorschau unter den Kacheln, auf dem Telefon die
  eigene Ansicht. Hat der Admin einen Document Server eingeschaltet, gilt das
  auch für Word-, Excel- und PowerPoint-Dateien und ihre
  OpenDocument-Gegenstücke; unter dem Betrachter steht, welcher Document
  Server die Datei anzeigt. Jede andere Datei öffnet ihr Menü. Ein Klick lädt
  nie herunter.
- **Videos:** MP4, M4V, WebM und MOV spielen im Vollbild, auch auf dem
  iPhone. Die Kachel zeigt ein Vorschaubild, ▶, die Dauer und links unten den
  Codec, etwa „HEVC“. Den Codec liest Kriterion nach dem Upload; bei Videos von
  vor dem Update beim nächsten Start. Das Vorschaubild entsteht beim Hochladen
  im Browser, bei 10 % der Länge. Fehlt es, etwa nach einem Import, erzeugt es
  der Browser dessen, der das Video hochgeladen hat, beim Öffnen des Eintrags.
  „Vorschaubild wählen …“ im Menü ⋯ öffnet das Vollbild; dort nimmt „Dieses
  Bild als Vorschaubild“ das gezeigte Bild. Das darf nur, wer das Video
  hochgeladen hat. Kann der Browser ein Video nicht abspielen, etwa
  HEVC in Firefox, stehen dort ein Satz und „Herunterladen“.
- **Vorschaubild eines Dokuments:** Text, Markdown, CSV und Log zeigen auf der
  Kachel ihre ersten Zeilen. Word-, Excel- und PowerPoint-Dateien, ihre
  OpenDocument-Gegenstücke und PDF zeigen die erste Seite, wenn der Admin
  einen Document Server eingeschaltet hat. Das Bild erscheint wenige Sekunden
  nach dem Hochladen und nach jedem Speichern im Editor neu. Die Endung steht
  darüber. Kann der Document Server eine Datei nicht umwandeln, bleibt die
  Endung.
- **Vorschau:** höchstens eine im Block, unter den Kacheln ihrer Gruppe; ein
  Klick auf eine andere Kachel wechselt sie, ein Klick auf dieselbe schließt
  sie, ebenso das Zuklappen ihres Ordners. Im Kopf öffnet ⤢ die
  eigene Ansicht, ↓ lädt herunter, × oder Esc schließt. Kann Kriterion eine
  Bilddatei nicht als Bild lesen, steht auf der Kachel die Endung.
- **Menü ⋯:** steht an jeder Kachel und bietet nur an, was man darf, in fünf
  Gruppen, getrennt durch Linien: „Öffnen“ und „Bearbeiten“; „Herunterladen“,
  „Link auf diese Datei kopieren“ und „Erweiterte Infos“; „Verschieben nach …“
  und „Vorschaubild wählen …“; „Vorige Fassung wiederherstellen“ und
  „Bearbeiten durch alle“; „Datei löschen“. Oben steht der Name, bei
  mehreren Accounts auch, wer die Datei wann hochgeladen hat. Auf dem Telefon öffnet das Menü am unteren Rand. An
  einer Kachel, die noch hochgeht, steht „Abbrechen“, nach einem Fehler
  „Erneut versuchen“ und „Entfernen“.
- **Erweiterte Infos:** „Erweiterte Infos“ im Menü ⋯ eines Bildes oder Videos
  und ⓘ im Vollbild zeigen, was in der Datei steht. ⓘ steht auch im Vollbild
  der Fotos und Videos des Eintrags. Allgemein: bei Videos der Container, sonst
  das Format, dazu Dateigröße, Dauer, Gesamtbitrate, Aufnahmedatum und die Zahl
  der Audiospuren. Video: Codec, Profil, Auflösung, Bildrate, Bitrate,
  Bittiefe, Farbunterabtastung und HDR. H.264 und H.265 tragen den Namen von
  MediaInfo in Klammern, etwa „H.265 (HEVC)“; in der Liste und am Vorschaubild
  steht kurz „H.265“. Je Audiospur: Codec, Kanäle, Abtastrate, Bitrate und
  Sprache. Bild: Format, Auflösung, Bittiefe, Farbraum und
  Farbunterabtastung. Was die Datei nicht angibt, fehlt.
- **Tastatur:** Tab erreicht jede Kachel und ihr ⋯. Umschalt+F10 öffnet das
  Menü, ↑ und ↓ wählen, Enter führt aus, Esc schließt.
- **Link kopieren:** kopiert die Adresse der Datei. Die Adresse eines Bildes
  oder Videos öffnet den Eintrag und darin das Vollbild. Jede andere öffnet die
  Datei in der eigenen Ansicht; eine Datei ohne Vorschau lädt man dort mit ↓
  herunter.
- **Eigene Ansicht:** zeigt die Datei über das ganze Fenster. Der Pfeil oben
  links und ✕ oben rechts führen zurück zum Eintrag, zur Kachel der Datei;
  ihr Ordner steht dann offen. Das Zeichen für
  Vollbild in der Leiste zeigt nur das Dokument über den ganzen Bildschirm,
  auch quer; Zurück oder Esc beendet es. Kann der Browser kein Vollbild, fehlt
  das Zeichen.
- **Bearbeiten:** „Bearbeiten“ im Menü öffnet die Datei in der eigenen Ansicht
  zum Bearbeiten; es steht nur an Dateien, die man bearbeiten darf. „Öffnen“
  zeigt sie zum Ansehen. Bearbeiten darf, wer die Datei hochgeladen hat. Trägt
  die Datei „Bearbeiten durch alle“, bearbeitet jeder Account; sonst auch der
  Admin nicht, er darf die Datei nur löschen. Ob neue Dateien es tragen, gibt
  jeder Account im eigenen Bereich unter „Dokumente“ vor; ohne eigene Vorgabe
  gilt der Startwert des Admins. Eine einzelne Datei stellt, wer sie
  hochgeladen hat, mit „Bearbeiten durch alle“ im Menü um oder mit dem Haken
  in der Leiste der Ansicht.
  Gespeichert wird mit Speichern im Editor und etwa 10 Sekunden, nachdem der
  Letzte die Ansicht verlassen hat. `.doc`, `.xls` und `.ppt` werden dabei zu
  `.docx`, `.xlsx` und `.pptx`; vorher fragt die Ansicht nach, ohne OK wird
  nur angesehen. Auf dem Telefon wird nur angesehen.
- **Vorige Fassung:** Kriterion hebt die Fassung vor der letzten Bearbeitung
  auf. „Vorige Fassung wiederherstellen“ im Menü oder ↶ in der Leiste der
  Ansicht stellt sie wieder her; die aktuelle wird dabei zur vorigen, ein
  zweites Mal macht es rückgängig. Die vorige Fassung
  steht nur im Backup, nicht im JSON-Export und nicht im Papierkorb.
- **Links:** jeder darf eintragen. Umsortieren darf der Verfasser des Eintrags
  oder der Admin. Ein Text ohne Adresse (Wort, Artikelnummer) wird zur Suche
  bei der eingestellten Suchmaschine.

### Beschreibung

Klick in den Text oder auf den Stift öffnet das Feld, Verlassen speichert, Esc
verwirft. Die Formatierung ist dieselbe wie bei Kommentaren.

### Testtage

Nur bei „Getestet". Jede Zeile ist ein Tag mit einer Gesamtnote. Ein Datum
kommt je Benutzer einmal vor; ein erneuter Eintrag ersetzt die Note. Ab drei
Tagen zeigt eine Kurve den Verlauf. Solange Testtage bestehen, lässt sich
„Getestet" nicht zurücknehmen. Hat ein Testtag einen Ordner, steht in seiner
Zeile 📁; ein Klick springt zum Ordner.

### Ablehnen

Beim Setzen von „Abgelehnt" öffnet sich ein Feld für den Grund (freiwillig,
bis 200 Zeichen). Danach steht dort etwa: „Abgelehnt am 14.03.2026, 09:12 von
Anna — Lieferzeit über 6 Monate." Den Grund ändern darf nur, wer abgelehnt
hat; entfernen (✕) darf jeder, der den Eintrag ändern darf. Wird die Ablehnung
zurückgenommen und später erneut gesetzt, steht der alte Grund als Vorschlag
im Feld.

### Blöcke

Die Blöcke eines Eintrags lassen sich am Griff verschieben und über die
Kopfzeile einklappen. Die Anordnung gilt für alle Einträge und wird in
„Darstellung" zurückgesetzt. Öffnet ein Sprung einen eingeklappten Block, gilt
das nur für diese Ansicht; ein Klick auf die Kopfzeile klappt ihn wieder zu.

### Löschen und Papierkorb

Jedes Löschen fragt nach. Beim Eintrag nennt die Rückfrage, was daran hängt.
Gelöschte Einträge und einzeln gelöschte Dateien unter „Dateien“ liegen 30
Tage im Papierkorb; zurückholen kann sie der Eigentümer-Admin (Einstellungen ›
Bestand, Karte „Papierkorb"). Ordner sowie Vorschaubild und Dauer eines Videos
kommen mit zurück. Fotos und Videos des Eintrags und Bilder in Kommentaren
werden sofort gelöscht.

**Gelöschte Dateien …** steht für den Eigentümer-Admin im Kopf von „Dateien“.
Der Dialog nennt die gelöschten Dateien des Eintrags aus dem Papierkorb und
aus jedem Backup, das sich lesen lässt, mit Herkunft und Ordner.
„Zurückholen“ legt die gewählten Dateien wieder in den Eintrag, mit Verfasser
und Datum von vorher. Fehlt ihr Ordner, entsteht er neu mit demselben Namen.
Hat der Document Server eine Datei seit dem Backup gespeichert, kommt die
Fassung aus dem Backup als eigene Datei dazu, mit „(Backup TT.MM.JJJJ)“ im
Namen. Eine Datei, deren Kopie im Backup-Ordner fehlt, steht ohne Kästchen
da.

### Eintrag exportieren

Nur für den Eigentümer-Admin: „Eintrag exportieren" am Fuß des Eintrags schreibt eine
Exportdatei mit diesem einen Eintrag samt Dateien.

## Kommentare

Ein Kommentar hat eine **Art** (Notiz, Bericht oder Aufgabe) und kann
**angepinnt** sein. Reihenfolge: angepinnte, dann offene Aufgaben, Berichte,
Notizen; innerhalb jeder Gruppe das Älteste oben. Der Knopf für die Art
schaltet weiter: Notiz → Aufgabe → erledigt → Notiz.

Die linke Kante zeigt die Art: orange Bericht, blau Aufgabe, grün erledigt.
Angepinnte Kommentare tragen einen goldenen Rahmen.

- **Fälligkeit:** eine Aufgabe kann ein Datum tragen. Es wird nicht erinnert
  und nichts verschickt.
- **Markieren:** `@name` im Text markiert einen Benutzer; er bekommt eine
  Meldung in der Glocke. Namen mit Leerzeichen lassen sich nicht markieren.
- **Bilder und Videos:** zusammen bis 6 je Kommentar. Bilder werden
  verkleinert gespeichert, Videos unverändert (bis 20 MB).
- **Formatierung:** `**fett**`, `_kursiv_`, `` `Code` ``, `[Name](Adresse)`,
  `> ` Zitat, `- ` Aufzählung, `1. ` Nummerierung. Das Menü über dem Feld und
  Strg+B / Strg+I setzen dieselben Zeichen. `\` hebt die Wirkung eines Zeichens
  auf.
- **Adressen** mit `http://`, `https://` oder `www.` werden zu Links.
- **Nummer:** jeder Kommentar trägt eine Nummer (`#3`). Ein Klick darauf
  kopiert seine Adresse; eingefügt in ein Feld wird daraus ein Verweis mit
  Eintragstitel.
- **Verweis auf eine Datei oder ein Foto:** eine Adresse aus „Link kopieren“
  wird im Text zur Marke, auch in der Beschreibung. Eine Datei für den
  Document Server (Word, Excel, PowerPoint, OpenDocument) zeigt Zeichen und
  Dateinamen; ein Klick klappt darunter einen kleinen Betrachter auf, ein
  zweiter schließt ihn, ⤢ öffnet die eigene Ansicht. Erst der Klick lädt den
  Betrachter; auf dem Telefon öffnet er die eigene Ansicht. Eine Bilddatei
  zeigt ihre Kachel und öffnet das Vollbild im Eintrag, andere Dateien zeigen
  Zeichen und Dateinamen und öffnen die eigene Ansicht. Ein Foto zeigt seine
  Kachel und öffnet das Vollbild.
  Eine gelöschte Datei steht als „gelöscht“ da.
- **Zitieren:** das Anführungszeichen in der Kopfzeile übernimmt den
  Kommentar ins Schreibfeld. Markierter Text lässt sich über das Menü
  „Zitieren" übernehmen.

Der Blockkopf zählt kurz: **12 · ⚑3 · ☐3 · ☑2** (Kommentare, Berichte, offene
und erledigte Aufgaben). Der volle Text steht am Mauszeiger.

## Bewertung

Ein Eintrag hat zwei Sternkästen mit eigenen Kriterien, Gewichten und
Durchschnitten:

- **Potenzial:** vor dem Ausprobieren.
- **Bewertung:** danach, nur an getesteten Einträgen.

An einem getesteten Eintrag ist die Bewertung offen und das Potenzial
zugeklappt, sonst umgekehrt. Der zugeklappte Kasten zeigt seine Zahl im Kopf.
Der Potenzialmodus lässt sich in der Karte „Potenzial: Kriterien" abschalten
(nur Eigentümer-Admin); die Sterne bleiben dabei erhalten.

- Die Sterne sind die eigene Bewertung. Ab zwei Benutzern steht daneben der
  Schnitt aller, ab zwei Bewertungen mit Anzahl.
- Der runde Knopf am Zeilenende entfernt die eigenen Sterne dieser Zeile, mit
  „Rückgängig".
- Kriterien können verschieden gewichtet sein (`×1,5` hinter dem Namen). Der
  Schnitt bleibt zwischen 1 und 5.
- Ein Klick auf die Zahl im Kopf zeigt die Rechnung: Note, Gewicht und
  Produkt je Kriterium, Summe, Teiler, Ergebnis. Gezählt werden nur bewertete
  Kriterien, gerundet wird am Ende.

Kriterien legt der Admin in den Einstellungen an, getrennt für beide Kästen.
Ein Kriterium gehört fest zu einem Kasten. Ein gelöschtes Kriterium nimmt alle
Sterne mit.

## Einstellungen

Das Zahnrad in der Kopfzeile öffnet die Einstellungen. Jeder Abschnitt hat eine
eigene Adresse. Abschnitte ohne sichtbare Karte erscheinen nicht.

| Abschnitt | Karten |
|---|---|
| Persönlich | Mein Account, Meine Sitzungen, Darstellung, Dokumente |
| Bestand | Kategorien, Tags, Bewertung: Kriterien, Potenzial: Kriterien, Vokabular, Links, Suchmaschinen, Papierkorb |
| Benutzer | Benutzer, Anfragen, Sicherheitsprotokoll, Mailversand |
| Datenbank | Kennzahlen, Bildformate, Grenzen beim Hochladen, Backup, Alte Backups, Export und Import |
| Installation | Titel, Sprachen, Dokumente |

Ein Benutzer sieht seine eigenen Karten und die Listen der Kategorien, Tags
und Kriterien ohne Bearbeitung. Alles Weitere sieht der Admin; Export, Import,
Backup und Sicherheitsprotokoll nur der Eigentümer-Admin.

| Karte | Inhalt |
|---|---|
| Titel | Titel vor der Anmeldung (für jeden sichtbar, zurückhaltend wählen) und Titel nach der Anmeldung |
| Dokumente | Anzeige und Bearbeiten über einen Document Server ein- und ausschalten; „Bearbeiten durch alle“: Startwert, solange ein Account keinen eigenen gesetzt hat; die Karte prüft die Verbindung. Adressen und Secret stehen in der `.env`, siehe README |
| Kennzahlen | Umfang des Bestands, Datenbankgröße, Dateien auf der Platte (davon über „Anhang“ und im Papierkorb), Uploads, freier Platz, Version, Fingerprint, Verschlüsselungsverfahren; für den Eigentümer-Admin der Schlüsselwert. Nur wenn es welche gibt: Dateien, die noch in der Datenbank auf die Umlagerung warten, fehlende Dateien, Dateien, die auf das Löschen warten, und Dateien ohne Verweis. Diese löscht der Eigentümer-Admin mit „Löschen“, aber nur, wenn im Backup-Ordner eine Kopie gleicher Länge liegt |
| Kategorien, Tags | anlegen, umbenennen, löschen; ein Häkchen legt fest, ob jeder neue Namen am Eintrag anlegen darf |
| Bewertung: Kriterien, Potenzial: Kriterien | anlegen, umbenennen, sortieren, gewichten (0,2 bis 2, Vorgabe 1) |
| Suchmaschinen | sechs eingebaute und bis zu drei eigene (`%s` als Platzhalter); eine ist Standard |
| Links | Zahl der sichtbaren Linkzeilen, persönlich |
| Darstellung | Farbschema, Sprache, Schriftgröße, Größe der Vorschaubilder, Zeitleiste, Anordnung der Blöcke; persönlich |
| Dokumente (persönlich) | Darstellung im Document Server (Wie Kriterion, Modern Hell, Modern Dunkel) und die Vorgabe „Bearbeiten durch alle“ für die eigenen neuen Dateien. Nur mit eingeschaltetem Document Server |

### Grenzen beim Hochladen

Nur der Eigentümer-Admin ändert sie. Sie gelten ab dem nächsten Hochladen.

| Art | Vorgabe (MB) | einstellbar (MB) |
|---|---:|---:|
| Foto | 30 | 1 bis 50 |
| Bild im Kommentar | 20 | 1 bis 50 |
| Video | 20 | 1 bis 100 |
| Video im Kommentar | 20 | 1 bis 100 |
| Anhang | 50 | 1 bis 100 |
| Datei | 2048 | 1 bis 4096 |

„Datei“ ist die Grenze je Datei unter „Dateien“. Bis „Anhang“ trägt der Export
den Inhalt einer Datei, und sie hat Vorschau, Vorschaubild und Document Server;
darüber gibt es sie nur zum Herunterladen, außer PDF, Bild und Video. Liegt
„Anhang“ über „Datei“, gilt „Anhang“ als Grenze je Datei. Dateien gehen in
Stücken zu 8 MB; die Grenzen für Fotos und Videos muss ein Reverse Proxy davor
durchlassen (README).

### Bildformate

Die Karte „Verfahren der Ablage" legt fest, wie PNG-Bilder gespeichert werden:

| Verfahren | Wirkung |
|---|---|
| PNG | unverändert, größte Ablage |
| WebP verlustfrei | etwa zwei Drittel kleiner, Vorgabe |
| WebP verlustbehaftet | nur für Fotos sinnvoll; bei Bildschirmfotos mit Text größer |

JPEG, GIF und WebP bleiben unverändert. „Vorhandene Bilder konvertieren"
wendet das Verfahren auf den Bestand an; die alte Fassung ist danach weg.
Vorher ein Backup anlegen.

### Backup

Nur für den Eigentümer-Admin. Legt ein vollständiges, verschlüsseltes Backup an. Die Karte
zeigt Ort und Dauer, das letzte Backup und die Lage des Backup-Ordners: rot im
Projektordner, grün außerhalb. Backups von vor einem Schlüsselwechsel sind rot
markiert. Zurückgespielt wird auf dem Server mit `./backuptool.sh` (README,
„Backup zurückspielen").

Dateien auf der Platte kopiert das Backup nach `kriterion-files/` im
Backup-Ordner, jede nur einmal. Solange es kopiert, nennt die Karte Zahl und
Größe der kopierten Dateien. Fehlte eine Datei auf der Platte, nennt die Karte
die Zahl. Läuft schon ein Backup in denselben Backup-Ordner, auch aus einer
anderen Installation, legt der Knopf kein zweites an und meldet das.

### Alte Backups

Listet alle Backups mit Nummer, Datum, Alter und Größe. Die zweite Zeile nennt
die Version, die das Backup geschrieben hat, Zahl und Größe seiner Dateien und
wie viele davon nur in diesem Backup stehen; „vor dem Zurückspielen" markiert
das Backup, das `backuptool.sh` vor dem Zurückspielen anlegt. Über der Liste
stehen Zahl und Größe aller Dateien in `kriterion-files/`. „prüfen" öffnet ein
Backup probeweise und nennt Einträge, Fotos, Accounts, das jüngste Datum, wie
viele der Dateien aus seiner Liste in `kriterion-files/` liegen, die Version
und ob das Schema zur installierten Version passt; „Mit diesem Schlüssel nicht
lesbar" heißt, es gehört zu einem anderen Schlüssel.

„Auswählen" im Kopf der Liste setzt ein Kästchen an jedes Backup. Gesperrt sind
die jüngsten N, die zum aktuellen Schlüssel passen; es sind dieselben, die die
Regel schützt. „Löschen" in der Leiste fragt nach, nennt die Größe der
Datenbanken und der Dateien, die nur in diesen Backups stehen, und verlangt die
zweite Bestätigung.

Aufräumen löscht ein Backup nur, wenn beides zutrifft: es gehört nicht zu den
jüngsten N (1 bis 20) **und** ist älter als X Tage (7 bis 365).

- Der Schalter „Nach erfolgreichem Backup aufräumen" steht ab Werk auf aus.
  Aufgeräumt wird nur nach einem gelungenen Backup oder per Knopf.
- Gelöscht werden nur Backups nach dem Muster `kriterion-….sqlite` und ihre
  Listen `kriterion-….files` im eingestellten Ordner, dazu in
  `kriterion-files/` jede Kopie, die keine verbliebene Liste nennt. Andere
  Dateien bleiben. `kriterion-files` ist als Unterordner für Backups nicht
  erlaubt.
- Backups von vor einem Schlüsselwechsel fasst die Regel nicht an; sie haben
  einen eigenen Knopf.
- Jede Löschung steht im Sicherheitsprotokoll.

### Papierkorb

Der Admin sieht, der Eigentümer-Admin handelt. Die Karte listet die Löschungen der
letzten 30 Tage, Einträge und Dateien. Eine Datei steht mit Eintrag und Ordner
vor ihrem Namen. „Wiederherstellen" legt den Eintrag mit allen Inhalten neu an
oder die Datei zurück in ihren Eintrag, „Endgültig löschen" löscht. Nicht zurück kommen Favoriten anderer.
Einträge, die beim Löschen eines Benutzers oder durch einen ersetzenden Import
wegfallen, landen nicht im Papierkorb.

## Export und Import

Beides in der Karte „Export und Import", nur für den Eigentümer-Admin, mit
Passwortabfrage.

| Weg | wofür |
|---|---|
| Export in einer Datei | Umzug, Archiv, Weitergabe; unverschlüsselt |
| Export in Teilen | wenn eine Upload-Grenze oder ein Datenträger gegen eine große Datei spricht |
| Backup | vollständige, verschlüsselte Sicherung der Datenbank (README) |

Die Exportdatei enthält nur Einträge mit Verfassernamen. Mit dem Häkchen für
Dateien trägt sie auch die Ordner mit ihrem Testtag und das Vorschaubild jedes
Videos unter „Dateien“; aus einer älteren Exportdatei kommen die Dateien ohne
Ordner. Dateien über „Anhang“ enthält kein Export; die Karte nennt sie
vorher. Der Import legt jede Datei auf die Platte.
Nicht darin:
Benutzer, Passwörter, Sitzungen, zweiter Faktor, Mailzugang, Titel,
Vokabular, Suchmaschinen, Einstellungen, Sicherheitsprotokoll, Papierkorb.

**Export in einer Datei:** „mit Fotos" oder „ohne Fotos"; Häkchen für Dateien
und Videos. Die Karte nennt die erwartete Größe. Ab 300 MB erscheint ein
Hinweis, dass es dauert. Ein einzelner Eintrag darf höchstens rund 345 MB an
Dateien tragen.

**Export in Teilen:** jeder Teil ist eine vollständige Exportdatei. Die
Teilgröße ist wählbar (50 bis 300 MB). Einspielen: Teil 1 mit „Ersetzen", alle
weiteren mit „Zusammenführen".

**Import:**

- **Zusammenführen** fügt hinzu und lässt den Bestand stehen.
- **Ersetzen** löscht den Bestand vorher. Nicht umkehrbar.

Der Import ändert alles oder nichts. Beiträge gehen an Benutzer mit demselben
Namen, sonst an den Einspielenden; die Meldung danach nennt diese Namen. Beim
Umzug deshalb die Benutzer vorher mit denselben Namen anlegen.

Es gibt keine Fortschrittsanzeige; das Fenster muss offen bleiben, bis der
Vorgang fertig ist.

## Auf dem Handy und auf dem Tablett

Dieselbe Oberfläche, an Breite und Bedienung angepasst.

- Auf dem Telefon liegen Glocke, „Offen", Einstellungen und Abmelden hinter
  dem Menüzeichen. Suche und „+ Eintrag" bleiben sichtbar. Ein Tablett mit
  Touch bekommt dasselbe Menü.
- Die Filter sind auf dem Telefon eingeklappt. Der Schalter nennt die Zahl der
  aktiven Filter.
- „‹ Voriger" und „Nächster ›" am Fuß eines Eintrags blättern in der
  Reihenfolge der Übersicht.
- Am Bild blättert ein Wisch. Gelöscht wird am großen Bild, nicht an der
  Vorschaukachel.
- Sortieren per Ziehen braucht mit dem Finger ein kurzes Halten.
- Im Vollbild zoomt ein doppeltes Tippen.
- Über „Zum Startbildschirm hinzufügen" im Browser lässt sich Kriterion wie
  eine App ablegen. Ohne Netz öffnet es sich nicht.

## Sprache

Deutsch, Englisch und Türkisch. Jeder wählt seine Sprache in „Darstellung";
der Wechsel wirkt sofort. Ohne eigene Wahl gilt die Sprache des Browsers, sonst
die Vorgabesprache der Installation. Die Anmeldeseite zeigt die Vorgabesprache.

Der Eigentümer-Admin legt in „Einstellungen › Installation › Sprachen" die
Vorgabesprache und die wählbaren Sprachen fest. Eine neue Installation startet
auf Englisch.

Namen von Kategorien und Kriterien lassen sich je Sprache eintragen. Fehlt ein
Name, gilt der Reihe nach: Vorgabesprache, Sprache beim Anlegen, Originaltext.
Ein Name aus einer anderen Sprache steht blass und kursiv da, darunter die
Sprache. Die Sprachzeile über den Listen zeigt je Sprache einen Punkt (alles
eingetragen) oder die Zahl der fehlenden Namen.

## Vokabular

Fünfzehn Wörter der Oberfläche lassen sich umbenennen, etwa „Eintrag" →
„Maschine" oder „Testtag" → „Sitzung", auch „Potenzial", „Bewertung" und
„Note". Nur die Beschriftung ändert sich; Datenbank und Exportdateien bleiben
gleich. Eine Probe unter den Feldern zeigt die Wörter in echten Sätzen. Leere
Felder fallen auf die Vorgabe zurück. Das Vokabular gibt es je Sprache.

## Hell oder dunkel

In „Darstellung": Hell, Dunkel (Vorgabe) oder Auto (folgt dem
Betriebssystem). Die Einstellung gilt je Account. Das Vollbild bleibt in beiden
Schemata dunkel.

## Schriftgröße

In „Darstellung", fünf Stufen von 80 bis 120 Prozent. Abstände bleiben gleich.
Die Anmeldeseite bleibt bei der Vorgabegröße.
