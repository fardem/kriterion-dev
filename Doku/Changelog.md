# Änderungen

Kurzfassung für den Betrieb — was eine Version mitbringt und was zu beachten
ist. Die Einzelheiten stehen je Version in
`Doku/Aenderungsprotokoll_<Version>.md`.

---

## 0.8.80 — Einladung, Rücksetzung, Sitzungen

**Das Passwort gehört dem, der es benutzt.** Bisher legte der Admin einen
Zugang mit einem ersten Passwort an und musste es weitersagen — er kannte es
also, und der neue Benutzer musste es hinterher selbst ändern, wenn ihm das
unangenehm war. Jetzt bekommt er stattdessen einen **Link** und wählt sein
Passwort selbst.

### Neu

- **Zugang anlegen mit Link.** In der Karte „Zugänge" steht beim Anlegen ein
  **Auswahlfeld**: *„Er wählt sein Passwort selbst"* (die Vorgabe) oder *„Ich
  vergebe das erste Passwort"*. Bei der ersten Wahl gibt es gar kein
  Passwortfeld — der Zugang entsteht **ohne** Passwort, und du bekommst einen
  Link. Wer ihn öffnet, wählt sein Passwort selbst und ist danach gleich
  angemeldet.
- **Passwort zurücksetzen mit Link.** Dasselbe für einen vorhandenen Zugang:
  das Kettenglied 🔗 an der Zeile erzeugt einen Link. Das bisherige Passwort
  gilt weiter, bis er eingelöst wird.
- **Der Link gilt sieben Tage und genau einmal.** Beim Einlösen werden alle
  bestehenden Anmeldungen dieses Zugangs beendet, und alle anderen noch
  offenen Links dazu verfallen.
- **„Meine Sitzungen".** Eine neue Karte im Systembereich — für **jeden**, auch
  ohne Rolle. Sie zeigt, wo dieser Zugang überall angemeldet ist, markiert die
  aktuelle Anmeldung und hat einen Knopf „alle anderen beenden". Ein Admin
  sieht dort **nur seine eigenen**, nie fremde.

### Was gleich bleibt

- **Der direkte Weg bleibt.** Der Admin kann weiterhin ein Passwort setzen und
  es sagen — der Schlüssel 🔑 steht neben dem Kettenglied. Das ist der kürzere
  Weg, wenn der andere danebensteht.
- **Der Notweg auf dem Server bleibt unverändert:**
  `docker compose exec kriterion node zugang.js passwort <name>`.
- **Es wird nichts verschickt.** Kriterion baut weiterhin **keine** Verbindung
  nach außen auf: den Link kopiert der Admin und gibt ihn weiter. Mailversand
  kommt in einer späteren Version.
- **Es wird nichts zusätzlich gespeichert.** „Meine Sitzungen" kennt **kein
  Gerät** — weder IP-Adresse noch Browserkennung werden erfasst, wie bisher
  auch nicht. Die Karte sagt das offen.
- Export, Import, Papierkorb, Sicherung, Rollen und Rechte arbeiten
  unverändert. Die Exportdatei behält ihr Format.

### Beim Einspielen

- **Die Sicherung des Datenverzeichnisses ist PFLICHT.** Die Datenbank bekommt
  eine neue Tabelle; ein Downgrade auf eine ältere Version ist damit keine
  reine Dateikopie mehr. Seit 0.8.70 geht das auch auf Knopfdruck — **aber die
  Kopie ist verschlüsselt und ohne die `.env` wertlos**, also beides sichern
  und ausdrücklich **nicht** in dieselbe Ablage legen.
- **Sonst nichts.** Keine neue Einstellung, keine Änderung an der
  `docker-compose.yml` oder der `.env`, keine neue Abhängigkeit. Die Tabelle
  legt sich beim ersten Start selbst an.
- **Ein Hinweis für den Fall eines Downgrades:** ein Zugang, der über einen
  Link angelegt und noch **nicht** eingelöst wurde, hat kein Passwort. Eine
  ältere Version kann ihm keinen neuen Link geben — dort hilft nur
  `node zugang.js passwort <name>` auf dem Server.
- **Der Link ist ein Passwortersatz auf Zeit.** Wer ihn weitergibt, gibt für
  sieben Tage den Zugang weiter. Er steht danach in dem Verlauf, über den er
  verschickt wurde — nur dem geben, für den er ist. Die Oberfläche sagt das an
  der Stelle, an der er kopiert wird.

---

## 0.8.71 — Der Sicherungsort zieht um

**Eine Berichtigungsrunde, keine Stufe.** Der Sicherungsort lag bisher eine
Ebene über dem Projektverzeichnis und legte dort einen zweiten Ordner an. Das
hielt die Übersicht nicht — und die sichere Lage war es nur solange, wie
niemand sie hinterfragte.

### Neu

- **Der Sicherungsort liegt jetzt im Projektverzeichnis** (`kriterion-sicherung`
  neben `data`). Ein Ordner weniger eine Ebene höher.
- **Die Karte „Sicherung" sagt, wie er liegt.** Ein **roter** Kasten, wenn er
  im Projektverzeichnis liegt, mit dem Grund daneben; ein **grüner**, wenn er
  außerhalb liegt. Abgewiesen wird keine der beiden Lagen — eine Sicherung am
  falschen Ort ist besser als keine.
- **Wer die sichere Lage will, stellt zwei Zeilen in der `docker-compose.yml`
  um.** Wie, steht dort und in der README.

### Was gleich bleibt

- Alles andere. Kein Schema, keine neue Formatnummer, keine neue Route, keine
  neue Abhängigkeit. Der Papierkorb, die Sicherung selbst und ihr Zielort in
  der Oberfläche arbeiten unverändert.

### Beim Einspielen

- **Der Einspielweg hat eine Zeile mehr bekommen** — sie holt vorhandene
  Sicherungen aus dem umbenannten Ordner zurück. Ohne sie bleiben sie in
  `kriterion-alt` liegen. Steht der Sicherungsort außerhalb, ist die Zeile
  wirkungslos und stört nicht.
- **Die neue `docker-compose.yml` muss mit eingespielt werden** — sie trägt die
  geänderte Einhängung und die geänderte Variable. Beide gehören zusammen.
- Kein Pflicht-Sicherungspunkt: die Datenbank wird nicht angefasst.

---

## 0.8.70 — Sicherung und Papierkorb

**Zwei Wege zurück, die es bisher nicht gab.** Ein gelöschter Eintrag war
endgültig weg — samt allem, was andere daran geschrieben hatten. Und eine
Sicherung der Anlage entstand nur von Hand auf dem Server.

### Neu

- **Der Papierkorb.** Ein gelöschter Eintrag liegt **dreißig Tage** dort und
  lässt sich zurückholen — mit Fotos, Videos, Dateien, Kommentaren,
  Bewertungen und Testtagen, jeweils samt Verfasser. Die Karte im Systembereich
  zeigt, was drin liegt, wer gelöscht hat und wie lange es noch bleibt.
- **Sehen darf den Papierkorb der Admin, zurückholen der Eigentümer der
  Anlage.** Zurückholen legt Beiträge unter fremdem Namen wieder an; das ist
  dieselbe Sache wie ein Import und liegt deshalb in derselben Hand.
- **Der Löschdialog sagt es vorher.** Er nennt weiterhin, was am Eintrag hängt
  und was davon anderen gehört — und dazu jetzt, dass alles davon dreißig Tage
  im Papierkorb liegt.
- **Sicherung auf Knopfdruck.** Eine neue Karte im Systembereich erzeugt eine
  vollständige, verschlüsselte Kopie der Datenbank — ohne den Server anhalten
  zu müssen. Sie sagt vorher, wie lange es dauert, und zeigt, wann zuletzt
  gesichert wurde.
- **Der Zielort liegt außerhalb des Projektordners** und wird in der
  `docker-compose.yml` eingehängt; in der Oberfläche lässt sich darunter ein
  Unterverzeichnis wählen. Jede Sicherung bekommt einen eigenen Namen mit Datum
  und Uhrzeit — eine Sicherung überschreibt nie die vorige.
- **Einen einzelnen Eintrag als Datei ziehen.** Dieselbe Form wie der volle
  Export, nur mit einem Eintrag.
- **Die Kennzahlen weisen den Papierkorb getrennt aus** — sonst wundert man
  sich über eine Datenbank, die nach dem Aufräumen größer ist als vorher.

### Was gleich bleibt

- **Gelöscht ist gelöscht.** Ein gelöschter Eintrag verschwindet aus Übersicht,
  Suche und Filtern wie bisher; er liegt nur zusätzlich noch als Paket im
  Papierkorb. An der Bedienung ändert sich sonst nichts.
- **Die Exportdatei behält ihr Format.** Eine Datei aus 0.8.50 oder 0.8.60
  lässt sich unverändert einspielen, und eine Datei aus 0.8.70 auch dort wieder.
- **Der Export bleibt, wie er war**, samt seiner Häkchen für Dateien und
  Videos. Er ist der Weg für Umzug und Archiv; die neue Sicherung ist der Weg
  für den Notfall. Ein Satz auf jeder der beiden Karten sagt, welche man will.
- **Zwei Löschwege füllen den Papierkorb nicht:** einen Zugang mitsamt seinen
  Einträgen zu entfernen, und ein Import, der den Bestand *ersetzt*. Beides ist
  eine Ansage über die ganze Anlage, kein einzelner Fehlgriff.
- **Zwei Kleinigkeiten kommen beim Zurückholen nicht mit:** Favoritensterne
  **anderer** Benutzer und der Vermerk über entfernte Kommentarbilder.

### Beim Einspielen

- **Die Sicherung des Verzeichnisses `data` ist wieder Pflicht.** Diese Version
  fasst die Datenbank an; ein Downgrade auf 0.8.60 ist keine reine Dateikopie
  mehr. In 0.8.60 war das anders.
- **Die neue `docker-compose.yml` gehört mit eingespielt.** Sie hängt den
  Sicherungsort ein (`../kriterion-sicherung`) und benennt ihn. Ohne sie bleibt
  die Karte „Sicherung" aus und sagt das — sie schreibt nicht still irgendwohin.
- **Der Sicherungsort gehört nicht dorthin, wo auch die `.env` liegt.** Die
  Kopie ist verschlüsselt; wer den Schlüssel danebenlegt, hebt die
  Verschlüsselung auf.
- **Die Anlage steht still, während eine Sicherung entsteht** — bei einer
  Datenbank von einem Gigabyte etwa eine halbe Minute. Die Karte nennt die
  erwartete Dauer, bevor man drückt.
- Sonst nichts Besonderes: keine neuen Einstellungen, keine geänderte
  Bedienung, kein neues Wort im Vokabular.

---

## 0.8.60 — Was ist offen, was ist neu

**Zwei Dinge, die es längst gibt, werden auffindbar.** Aufgabenkommentare
waren nur zu sehen, wenn man ihren Eintrag öffnete — bei zwanzig Einträgen
hieß das zwanzigmal klicken. Und wer nach ein paar Tagen wiederkam, sah zwar,
dass sich etwas getan hatte, aber nicht mehr, was davon neu war.

### Neu

- **Die Ansicht „Offen"** — ein neuer Knopf in der Kopfzeile, neben dem
  Zahnrad. Sie zeigt alle nicht erledigten Aufgaben aus allen Einträgen auf
  einem Bildschirm, gruppiert nach Eintrag, mit Verfasser und Datum. Ein Klick
  führt in den Eintrag.
- **Abhaken geht direkt dort.** Die Zeile bleibt danach durchgestrichen
  stehen, damit sich der Haken gleich wieder wegnehmen lässt; beim nächsten
  Aufruf ist sie fort. Wer abhaken darf, ist unverändert: der Verfasser des
  Kommentars und der Admin.
- **Ein Umschalter „meine / alle"** ab zwei Zugängen — bei einem einzigen
  Zugang wären beide Stellungen dieselbe Liste.
- **Der Filter „Neu seit …"** in der Filterzeile, neben „★ Favoriten", mit der
  Zahl daneben. Er zeigt, was sich seit dem letzten Besuch getan hat, und
  lässt sich mit Status, Kategorie und Tags frei kombinieren.
- **Der Bezugspunkt ist persönlich** und wird beim Verlassen der Übersicht
  gesetzt — während man hinsieht, bleibt die Liste also stehen. Beim
  allerersten Besuch erscheint der Filter noch nicht: es gibt dann nichts, mit
  dem sich vergleichen ließe.

### Was gleich bleibt

- **Die Reihenfolge der Übersicht ändert sich nicht.** Beide Neuerungen sind
  Filter — die Liste zeigt weiter für alle gleich, wo zuletzt etwas geschehen
  ist, und niemand bekommt eine eigene Sortierung.
- **Am Kommentarblock im Eintrag ändert sich nichts.** Farbkante,
  Weiterschaltknopf und Reihenfolge bleiben, wie sie waren; die neue Ansicht
  kann nichts, was der Eintrag nicht auch könnte.
- **Die Datenbank wird nicht angefasst**, und die Exportdatei behält ihr
  Format. Eine Datei aus 0.8.50 lässt sich unverändert einspielen.
- **Wer eigene Wörter eingestellt hat**, liest sie auch hier: heißen die
  Aufgaben „Mängel", steht über der Ansicht „Offene Mängel".

### Beim Einspielen

- **Nichts Besonderes.** Diese Version fasst die Datenbank nicht an; die
  Sicherung des Verzeichnisses `data` ist eine Empfehlung, keine Pflicht — und
  der Weg zurück auf 0.8.50 ist wieder eine reine Dateikopie.
- Der Filter „Neu seit …" erscheint erst beim **zweiten** Besuch der
  Übersicht. Das ist kein Fehler: vorher gibt es keinen Bezugspunkt.
- Intern heißt der `Abdruck` in der Kennzahlenkarte jetzt **Fingerprint** —
  dieselbe Zahl, das gebräuchlichere Wort.

---

## 0.8.50 — Kurzvideos am Fotoplatz

**Ein kurzes Video gehört in dieselbe Reihe wie die Fotos.** Bis dahin blieb
nur der Umweg über einen Anhang, der heruntergeladen statt abgespielt wurde.

### Neu

- **Videos bis 20 MB liegen bei den Fotos.** Dasselbe Feld zum Hinzufügen,
  dieselbe Reihenfolge, dasselbe Ziehen zum Umsortieren. Steht ein Video
  vorn, ist sein Standbild das Hauptbild des Eintrags.
- **MP4, WebM und MOV** — also auch das Format, das jedes iPhone liefert.
  Entschieden wird nach dem Inhalt der Datei, nicht nach ihrem Namen.
- **Das Standbild erzeugt der Browser beim Hochladen.** Es erscheint auf der
  Karte und in der Vorschauleiste, mit einem ▶ in der Ecke und der Länge
  daneben. Wer ein Video nicht abspielen kann, kann es auch nicht hochladen —
  ein Videoplatz, der nicht abspielt, wäre ein kaputter Platz.
- **Abgespielt wird im Eintrag und im Vollbild**, mit der gewohnten Steuerung
  des Browsers und mit Springen im Video. Nichts spielt von selbst los.
- **Der Löschdialog und die Kennzahlen nennen Videos getrennt.** Ein Dialog,
  der „3 Fotos" sagt und dabei ein Video mit wegwirft, verschwiege genau das,
  worum es geht.
- **Export und Import nehmen Videos mit** — über einen eigenen Schalter,
  Vorgabe aus.

### Was gleich bleibt

- **Fotos bleiben in jeder Hinsicht, wie sie waren.** Anzeige, Reihenfolge,
  Bildausschnitt, Auslieferung — kein Handgriff daran.
- **Ein Video liegt wie alles andere in der verschlüsselten Datenbank.** Die
  Sicherung des Verzeichnisses `data` deckt es mit ab, ohne Zutun.
- **Wer den Eintrag ändern darf, darf Videos hinzufügen und entfernen** —
  dieselbe Regel wie beim Foto, kein neues Recht.
- Größere Dateien gehören weiterhin an den Anhang. Für Videos jenseits von
  20 MB ist ein eigener Bauabschnitt vorgesehen.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `photos um art und dauer ergaenzt (Migration auf 0.8.50)`. Danach steht jedes
  vorhandene Foto auf der Art „bild"; an der Anzeige ändert sich nichts.
- **Das Austauschformat steht jetzt auf 10.** Ältere Exportdateien lassen sich
  weiterhin einspielen.
- **Der Videoschalter beim Export ist mit Absicht aus.** Ohne ihn nennt die
  Datei die Videos, enthält sie aber nicht; beim Einspielen sagt die Meldung,
  wie viele gefehlt haben. Wer eine vollständige Sicherung braucht, sichert
  das Verzeichnis `data` — nicht die Exportdatei.

---

## 0.8.40 — Gewichtete Bewertungskriterien

**Nicht jedes Kriterium wiegt gleich.** Bisher zählte „Optische Erscheinung"
genauso viel wie „Verarbeitungsqualität". Ab dieser Version lässt sich das
einstellen.

### Neu

- **Jedes Bewertungskriterium bekommt ein Gewicht.** Im Systembereich, in der
  Karte „Bewertungskriterien", steht neben jedem Kriterium ein Feld:
  **0,2 bis 2**, Vorgabe **1**. Vorgeschlagen werden `0,5 · 0,8 · 1 · 1,2 ·
  1,5`, alles dazwischen lässt sich eintippen. Kommazahlen wie gewohnt mit
  Komma — ein eingefügter Punkt wird ebenfalls gelesen.
- **Der Gesamtschnitt rechnet mit.** Ein Kriterium mit Gewicht 1,5 zieht die
  Zahl am Eintrag anderthalbmal so stark. Das wirkt überall dort, wo die Zahl
  auftaucht: in der Kachel der Übersicht, in der Sortierung „Bewertung", in
  der Detailansicht und im Vergleich.
- **Man sieht, dass gewichtet gerechnet wurde.** Weicht ein Gewicht von 1 ab,
  steht `×1,5` hinter dem Kriteriennamen — am Eintrag und im Vergleich —, und
  im Blockkopf steht das Wort „gewichtet" neben der Zahl. Ohne diese Anzeige
  ließe sich die Kopfzahl nicht mehr nachvollziehen.
- **Export und Import nehmen die Gewichte mit.** Beim Einspielen in eine
  bestehende Anlage bleiben die dort eingestellten Gewichte unangetastet — der
  Import bringt Bestand mit, keine Einstellungen.

### Was gleich bleibt

- **Solange alle Gewichte auf 1 stehen, ist jede angezeigte Zahl exakt die
  von vorher.** Das Einspielen dieser Version verändert keine Bewertung und
  keine Reihenfolge in der Übersicht.
- **Und es ist umkehrbar:** wer alle Gewichte auf 1 zurückstellt, hat wieder
  genau den alten Stand. Es geht dabei nichts verloren.
- **Ein Eintrag bleibt immer zwischen 1 und 5** — bei jeder Kombination von
  Gewichten. Das ergibt sich aus der Rechenart, es ist keine Deckelung.
- Die Skala bleibt 1 bis 5, die Sterne bleiben die eigene Bewertung, und der
  Durchschnitt eines einzelnen Kriteriums bleibt ungewichtet.

### Beim Einspielen

- **Diese Version fasst die Datenbank an.** Vor dem Einspielen das Verzeichnis
  `data` sichern — bei angehaltenem Container. Ohne diese Sicherung gibt es
  keinen Weg zurück auf die vorige Version.
- Beim ersten Start meldet das Protokoll einmalig
  `rating_criteria um gewicht ergaenzt (Migration auf 0.8.40)`. Danach steht
  jedes vorhandene Kriterium auf Gewicht 1.
- **Das Austauschformat steht jetzt auf 9.** Ältere Exportdateien lassen sich
  weiterhin einspielen; eine neue Datei in einer älteren Anlage verliert nur
  die Gewichte, sonst nichts.
- Die Gewichte stellt der **Admin** ein. Sie gelten für alle — eine
  persönliche Einstellung wäre eine zweite Wahrheit über denselben Eintrag.

---

## 0.8.31 — Dateien bekommen einen Verfasser

**Wer eine Datei anhängt, dem gehört sie.** Bis dahin durfte nur der Verfasser
eines Eintrags Dateien anhängen.

- **Hochladen darf jeder.** Löschen darf, wer die Datei hochgeladen hat — oder
  der Admin.
- **Ab zwei Zugängen steht der Name an fremden Dateizeilen**, in Klammern
  hinter der Größe. An den eigenen steht nichts; er stünde nur im Weg.
- Export und Import tragen den Namen mit (**Austauschformat 8**).

**Beim Einspielen:** auch diese Version fasst die Datenbank an — `data`
vorher sichern. Beim ersten Start meldet das Protokoll einmalig
`attachments um user_id ergaenzt`; vorhandene Dateien fallen dabei dem
Verfasser ihres Eintrags zu.
