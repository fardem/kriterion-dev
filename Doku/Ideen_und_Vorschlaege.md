# Ideen und Vorschläge

Stand der Analyse: Version 0.8.6, Zweig `main`, Commit `c1e673e`.
Prüfstand vollständig durchgelaufen: **1429 von 1429 Prüfungen bestanden**.

---

> ## ⚑ Eingearbeitet — dieses Papier ist Quelle, nicht Stand
>
> **Was hieraus gilt, steht seit der Einarbeitung im Projektstand,
> Abschnitt 10 und 11.** Dort ist der Stufenplan, dort werden die Punkte
> gepflegt, und nur dort. Zwei Stellen für dieselbe Angabe halten nur eine
> aktuell (Stolperstein 47) — deshalb ist auch das eigene Roadmap-Papier
> aufgegangen und wieder verschwunden.
>
> **Wozu es trotzdem stehenbleibt:** die Befunde in Abschnitt 2 und die
> Messwerte in Abschnitt 3 stehen sonst nirgends — jeder mit dem Weg, ihn
> nachzustellen, und mit dem, was dabei herauskam. Wer eine der Stufen baut,
> findet hier die Begründung dahinter statt nur ihren Namen.
>
> **Zwei Punkte sind seither umgestoßen worden:**
>
> - **Videos** standen unter „was ich nicht in die Roadmap nehmen würde". Das
>   war falsch — es gilt nur für große Dateien. Kurzvideos bis 20 MB liegen
>   wie ein Foto in der Datenbank, und das Standbild kann der Browser
>   liefern. Ausgearbeitet in `Konzept_Video_und_grosse_Dateien.md`,
>   beschlossen für 0.8.50.
> - **Punkt 4.1, Gewichtung**, ist vollständig ausgearbeitet in
>   `Konzept_Gewichtung_Bewertungskriterien.md` — mit drei Vorschlägen statt
>   sechs festen Stufen und freier Eingabe von 0,2 bis 2.
>
> **Vier Punkte sind mit 0.8.10 gebaut** (Projektstand Abschnitt 9): **2.5**
> (Abhängigkeiten festgenagelt), **5.1** (Versionsabdruck — dort abgeleitet
> über `require.cache` und `public/`, nicht über drei von Hand genannte
> Dateien), **5.4** (Prüflauf bei jedem Push) und **5.5** (Prüfstand
> filterbar). **Zu 5.5 eine Korrektur:** die dortige Begründung, ein Filter
> spare Zeit, stimmt nicht — die Prüflagen bauen aufeinander auf, ein
> gefilterter Lauf dauert genauso lange wie der volle. Der Gewinn ist das
> verschwindende Rauschen beim Deuten roter Punkte, nicht Geschwindigkeit.
>
> Neue Punkte werden **hier nicht mehr nachgetragen.** Was aus dem Betrieb
> kommt, geht in den Projektstand; was ein eigenes Vorhaben ist, bekommt ein
> eigenes Konzeptpapier.

---

## Vorbemerkung

**Zur Sprache.** Dieses Dokument ist bewusst in normalem deutschem
IT-Sprachgebrauch geschrieben — Migration, Session, Header, Endpoint, Backup,
Rate Limiting, Dependency, Lockfile. Das ist ein Bruch mit dem Stil der
übrigen Dokumente im Ordner, und er ist Absicht: hier geht es um technische
Befunde und Vorschläge, die schnell zu erfassen sein sollen. Die
Projektsprache bleibt davon unberührt — wenn ein Vorschlag umgesetzt wird,
wird er selbstverständlich im Duktus des Projekts dokumentiert.

**Zur Methode.** Gelesen wurden README, Konzeptpapier, Projektstand und der
komplette Quelltext. Alle Aussagen über Verhalten und Geschwindigkeit sind
**gemessen**, nicht geschätzt; die Messskripte sind im jeweiligen Abschnitt
beschrieben und reproduzierbar. Wo ich etwas behaupte, das ich nicht
ausprobiert habe, steht es ausdrücklich dabei.

**Zur Abgrenzung.** Das Projekt hat eine ausformulierte Roadmap (G4, H, I) und
eine Liste „Ideen ohne Beschluss". Ich unterscheide durchgehend:

- **[NEU]** — von mir, steht so in keinem Dokument
- **[SCHÄRFT]** — steht schon auf der Liste, ich mache einen konkreten
  Vorschlag daraus
- **[WIDERSPRICHT]** — steht im Widerspruch zu einer getroffenen
  Entscheidung; Begründung dabei

---

## 1. Was ich verstanden habe

Kriterion ist ein selbstgehostetes, vollständig verschlüsseltes Archiv für
Dinge, die man sammelt und **beurteilt**. Der Kern ist nicht die Ablage,
sondern das Urteil: Kriterien mit Sternen, Testtage mit Tagesnoten,
Kommentare in drei Arten, Vergleich mehrerer Einträge nebeneinander.

Die Architektur trägt eine ungewöhnlich klare Doktrin, und die ist der
eigentliche Wert des Projekts. Vier Sätze, die überall wiederkehren:

1. **Eine Wahrheit, nicht zwei.** Kein Zustand, der an zwei Stellen steht.
   Abgeleitet statt geschaltet — die Mehrbenutzeranzeige hängt an der Zahl
   der Zugänge, nicht an einem Schalter.
2. **Löschen ja, umschreiben nein.** Ein Admin räumt auf, aber er verändert
   keine fremde Aussage unter fremdem Namen.
3. **Was nicht angezeigt werden darf, wird nicht geliefert.** Die Regel hängt
   nie daran, dass das Frontend mitspielt.
4. **Bequemlichkeit ist nie Voraussetzung.** E-Mail darf ausfallen, ohne dass
   eine Funktion fehlt.

Diese Doktrin ist konsequenter durchgehalten als in den meisten kommerziellen
Codebasen, die ich kenne. Fast alle meiner Vorschläge unten sind Anwendungen
dieser vier Sätze auf Stellen, an denen sie noch nicht angewandt wurden — nicht
Alternativen dazu.

---

## 2. Befunde aus dem Code

Vier davon halte ich für Sicherheitsbefunde, drei für Betriebsmängel. Alle
sind reproduziert.

### 2.1 SVG kommt als Foto herein und geht mit seinem Typ wieder heraus — **hoch**

**Der Befund.** `anhaenge.js` trägt im Kopf die Sicherheitsregel des Projekts
in acht Punkten. Punkt 1: *„Der gemeldete Typ des Hochladenden wird
gespeichert, aber NIE zum Ausliefern benutzt."* Punkt 8: *„SVG steht bewusst
NICHT auf der Vorschauliste: eine SVG-Datei kann Skript enthalten, und ein
direkt geöffneter Tab ist eine Webseite."*

Der Foto-Endpoint hält sich an keinen von beiden:

```js
// server.js:1439
app.get('/api/photos/:id/raw', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  let blob = p.data, mime = p.mime_type;          // <-- der gemeldete Typ
  if (req.query.size === 'thumb'  && p.thumb)  { blob = p.thumb;  mime = 'image/jpeg'; }
  else if (req.query.size === 'medium' && p.medium) { blob = p.medium; mime = 'image/jpeg'; }
  res.set('Content-Type', mime);                  // <-- und er geht raus
  res.send(blob);
});
```

Der Upload-Filter (`server.js:20`) prüft `/^image\//` — `image/svg+xml`
besteht das. `sharp` liest SVG anstandslos und erzeugt Thumbnail und mittlere
Variante, der Upload sieht also völlig normal aus. Das **Original** wird
laut Doktrin unverändert gespeichert und beim Aufruf ohne `?size=` unverändert
ausgeliefert.

**Reproduziert.** Frischer Server, Setup, Eintrag anlegen, eine SVG-Datei mit
`<script>`-Element als Foto hochladen:

```
Hochladen: 201
gespeicherter mime_type: image/svg+xml
GET /raw               -> Content-Type: image/svg+xml  Disposition: (keine)  CSP: (keine)
GET /raw?size=thumb    -> Content-Type: image/jpeg
GET /raw?size=medium   -> Content-Type: image/jpeg
```

Die Datei geht als `image/svg+xml`, inline, ohne Content-Security-Policy, aus
dem eigenen Origin heraus. `X-Content-Type-Options: nosniff` hilft hier
nicht — es hindert den Browser am **Raten**, aber der Typ ist ja ausdrücklich
angegeben.

**Wie schwer wiegt es?** Nicht so schwer wie es klingt, aber schwer genug:

- Hochladen kann nur, wer angemeldet ist und den Eintrag bearbeiten darf.
- In einem `<img>`-Element läuft SVG-Skript nicht. Die Oberfläche selbst ist
  also nicht der Auslöser.
- Gefährlich wird es beim **direkten Öffnen der Adresse** — ein Rechtsklick
  „Grafik in neuem Tab öffnen" genügt. Dann läuft der Code im Origin der
  Anwendung. Der Session-Cookie ist `HttpOnly`, ist damit nicht auslesbar —
  aber Skript im richtigen Origin braucht ihn nicht: es ruft die API einfach
  als das Opfer auf. Ein Benutzer mit Rolle `user` könnte darüber Aktionen
  eines Admins auslösen.

**Der Gegenbeweis, dass es ein Versehen ist und keine Entscheidung:** die
Kommentarbilder machen es richtig. `GET /api/comment-images/:id/raw` ruft
`anh.setzeKopfzeilen(res, 'bild.jpg', { inline: true })` — fester Dateiname,
Typ aus der Positivliste, alle Schichten dran. Der sorgfältige Weg existiert.
Der Foto-Pfad benutzt ihn nur nicht.

**Vorschlag — zwei Schichten, wie überall sonst im Projekt:**

1. **Beim Hochladen ablehnen, was kein Rasterbild ist.** Nicht am gemeldeten
   Typ, sondern am Ergebnis: `sharp(buf).metadata()` liefert `format`; alles
   außerhalb von `jpeg|png|webp|avif|gif|tiff` wird abgewiesen. Das ist
   dieselbe Regel, die Kommentarbilder schon haben („Was `sharp` nicht als
   Bild lesen kann, wird abgewiesen").
2. **Beim Ausliefern den Typ aus den Bytes ableiten, nie aus `mime_type`.**
   Die ersten Bytes sagen eindeutig, was es ist; alles Unbekannte geht als
   `application/octet-stream` mit `Content-Disposition: attachment` raus.
   Damit sind auch **Bestandsdaten** geschützt, ohne Migration — genau das
   Muster, das `anhaenge.js` schon für Anhänge anwendet.

Die Spalte `photos.mime_type` bleibt stehen und wird weiter angezeigt — genau
wie `attachments.mime_type`, mit demselben Kommentar daneben.

### 2.2 `X-Forwarded-For` wird ungeprüft geglaubt — die IP-Bremse läuft ins Leere — **hoch**

**Der Befund.**

```js
// auth.js:346
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress || 'unbekannt';
}
```

Der Header kommt vom Aufrufer. Wer ihn bei jedem Versuch anders setzt, bekommt
bei jedem Versuch einen frischen Zähler.

**Reproduziert.** Zwölf Anmeldeversuche mit falschem Passwort gegen einen
frischen Server:

```
A ohne X-Forwarded-For   -> 401 401 401 401 401 401 401 401 401 401 429 429   (Bremse greift)
B mit wechselndem XFF    -> 401 401 401 401 401 401 401 401 401 401 401 401   (Bremse greift nie)
```

Übrig bleibt allein die Bremse **je Benutzername** — und die verzögert
absichtlich nur, höchstens 4 Sekunden, und sperrt nie. Das ist genau richtig
so entschieden, es war nur nie als alleinige Verteidigung gedacht.

**Warum das im Projekt besonders ärgerlich ist:** die Regel dagegen steht
bereits im Konzeptpapier, nur für ein anderes Feld. Abschnitt 11:

> **Die öffentliche Adresse ist eine Einstellung, niemals der `Host`-Kopf** —
> sonst lässt sich ein Rücksetzlink über einen gefälschten Kopf auf einen
> fremden Server umbiegen.

Derselbe Satz gilt für `X-Forwarded-For`. Der allgemeine Merksatz dahinter,
den ich vorschlagen würde in Abschnitt 5 aufzunehmen:

> **Ein Header vom Aufrufer ist nie eine Feststellung, sondern eine
> Behauptung.** Er darf nur geglaubt werden, wo ausdrücklich eingestellt ist,
> wer ihn setzen darf.

**Vorschlag.** Eine Einstellung `hinterProxy` (Vorgabe: **aus**).

- **Aus:** `req.socket.remoteAddress`, Punkt. `X-Forwarded-For` wird nicht
  gelesen. Das ist der richtige Zustand für den Normalfall „direkt im
  Heimnetz, Port 3100".
- **An:** der Header wird gelesen — aber nur, wenn die tatsächliche
  Verbindung von einer eingetragenen Proxy-Adresse kommt. Und dann der
  **letzte** Eintrag der Kette, nicht der erste: der erste ist der, den der
  Client selbst hineingeschrieben hat.

Dazu ein Satz in der README beim Reverse-Proxy-Hinweis, der ohnehin schon
dort steht.

### 2.3 Der Session-Cookie trägt kein `Secure` — **mittel**

```js
// auth.js:465
`${COOKIE_NAME}=${t}; HttpOnly; Path=/; SameSite=Lax; Max-Age=...`
```

`HttpOnly` und `SameSite=Lax` sind gesetzt und richtig gewählt — `Lax` deckt
den CSRF-Fall für alle schreibenden Routen ab, das ist sauber.

Es fehlt `Secure`. Die README sagt zu Recht „nur über HTTPS", aber der Cookie
selbst sagt es nicht: **ein einziger versehentlicher Aufruf über `http://`
schickt die Session im Klartext durchs Netz** — etwa weil jemand ein altes
Lesezeichen benutzt und der Proxy nicht umleitet.

Unbedingt gesetzt werden darf es nicht: bei direktem Zugriff auf
`http://<server-ip>:3100` — dem dokumentierten Normalfall — würde der Browser
den Cookie verwerfen und niemand käme mehr herein.

**Vorschlag.** `Secure` an dieselbe Einstellung hängen wie 2.2. Wer
`hinterProxy` einschaltet, betreibt Kriterion nach außen und soll HTTPS haben;
wer es aus lässt, ist im eigenen Netz. Eine Einstellung, zwei Wirkungen, kein
zweiter Schalter — das entspricht der Doktrin.

### 2.4 Die Anwendung selbst hat keine Content-Security-Policy — **mittel**

Anhänge bekommen `default-src 'none'; sandbox`. Die eigentliche Seite bekommt
nichts. Sie **braucht** heute auch nichts: es gibt kein `onclick=` in
Zeichenketten (nachgezählt: 0), `esc()` wird durchgängig angewandt, der
Kommentartext geht nachweislich nie über `innerHTML`.

Genau deshalb ist eine CSP hier billig: sie kostet nichts und ist die Schicht,
die bei Befund 2.1 gegriffen hätte.

```js
// server.js:17, neben dem vorhandenen nosniff
res.set('Content-Security-Policy',
  "default-src 'self'; img-src 'self' data: blob:; " +
  "style-src 'self'; script-src 'self'; " +
  "frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
```

Zwei Punkte zum Nachprüfen vor dem Einbau: `frame-src 'self'` wird für die
PDF-Vorschau gebraucht (das `iframe` zeigt auf den eigenen Origin), und ob
irgendwo ein `style="…"`-Attribut gesetzt wird — das erlaubt `style-src`
weiterhin, `unsafe-inline` wäre nur für `<style>`-Elemente nötig. Beides ist
im Prüfstand belegbar.

### 2.5 Die Abhängigkeiten sind nicht festgenagelt — **mittel**

Drei Dinge, die zusammengehören:

**a) `package-lock.json` ist nicht im Repository.** Nicht in `.gitignore`, nur
nie eingecheckt (`git ls-files | grep lock` → 0 Treffer). Damit löst jeder
Build `^11.5.0`, `^4.21.0`, `^2.0.1`, `^0.33.5` neu auf. Zwei Leute, die
dasselbe ZIP bauen, bekommen verschiedene Abhängigkeitsbäume — und derselbe
Mensch bekommt nach drei Monaten einen anderen als heute.

Für ein Projekt, das den eigenen Quelltext auf die Zeile genau kontrolliert
und dokumentiert, ist das eine echte Lücke: **der eigene Code ist festgenagelt,
die 158 Pakete darunter sind es nicht.**

**b) Der Dockerfile benutzt `npm install`, nicht `npm ci`.** Selbst mit
Lockfile würde er sie ignorieren — er kopiert sie nicht einmal:

```dockerfile
COPY package.json ./
RUN npm install --omit=dev
```

**Vorschlag:**

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
```

**c) `sharp@0.33.5` hat offene CVEs.** `npm audit` meldet:

```
sharp <0.35.0 — Severity: high
sharp inherited vulnerabilities in libvips:
CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
```

`sharp` verarbeitet **jedes hochgeladene Bild** — Fotos wie Kommentarbilder.
Das ist die Komponente mit dem größten Angriffsfläche-zu-Vertrauen-Verhältnis
im ganzen Projekt: sie bekommt fremde Bytes und parst sie in C.

Angemeldet muss man sein, das begrenzt es. Trotzdem gehört der Sprung auf
`sharp@0.35.x` vor 1.0. Er ist als Breaking Change markiert; erfahrungsgemäß
betrifft das die API-Fläche, die hier benutzt wird (`resize`, `rotate`,
`jpeg`, `metadata`), nicht — aber das ist zu prüfen, nicht zu glauben. Der
Prüfstand deckt die Bildwege ab, der Test dafür existiert also schon.

**Und daraus eine Regel für den Betrieb:** `npm audit` gehört in denselben
Rhythmus wie der Prüfstand. Ein selbstgehostetes System bekommt keine
Sicherheitsupdates geschenkt.

### 2.6 Der Fehler-Handler antwortet auf alles mit 400 — **klein**

```js
// server.js:2369
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unbekannter Fehler' });
});
```

Zwei getrennte Probleme:

- **Ein Serverfehler wird als Clientfehler gemeldet.** Ein SQL-Fehler, ein
  `sharp`-Absturz, ein voller Datenträger — alles kommt als 400 zurück. Für
  den Prüfstand und für `curl` von Hand ist das irreführend: 400 heißt „du
  hast falsch gefragt", nicht „bei mir ist etwas kaputt".
- **`err.message` geht ungefiltert an den Client.** Bei einem SQL-Fehler
  stehen darin Tabellen- und Spaltennamen. Kein Drama hinter der Anmeldung,
  aber es widerspricht „was nicht angezeigt werden soll, wird nicht geliefert".

**Vorschlag.** Absichtlich geworfene Fehler behalten ihre 400 — dafür bekommen
sie eine Markierung (`err.status = 400` bzw. eine eigene Fehlerklasse). Alles
ohne Markierung wird 500 mit festem Text; die Einzelheiten bleiben im
Protokoll. Multer-Fehler („Datei zu groß") sind echte 400 und behalten ihre
Meldung.

### 2.7 Kein sauberes Herunterfahren, kein Healthcheck — **klein**

**a)** Es gibt keinen `SIGTERM`-Handler. `docker compose down` beendet den
Prozess hart; die WAL-Datei bleibt liegen und die Datenbank wird beim nächsten
Start wiederhergestellt. Das ist bei SQLite ungefährlich — aber wer in genau
diesem Moment `./data` sichert, sichert einen Zustand mit offener WAL.

```js
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => {
  try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
  process.exit(0);
});
```

Sechs Zeilen, und die Sicherung des Datenverzeichnisses wird verlässlich.

**b)** `GET /api/health` liegt hinter `app.use('/api', auth.requireAuth)` und
ist damit von außen nicht erreichbar. Der Dockerfile hat kein `HEALTHCHECK`.
Beides zusammen heißt: Docker weiß nie, ob der Container tatsächlich
antwortet — er weiß nur, dass der Prozess läuft. Ein Container, der in einer
Neustartschleife hängt (der Fall, den die README beim falschen Schlüssel
ausdrücklich beschreibt), sieht von außen gesund aus.

`/api/config` antwortet bereits vor der Anmeldung und verrät nichts. Es als
Healthcheck-Ziel zu nehmen kostet nichts:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/config').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

---

## 3. Grenzen, die früher greifen als man denkt

### 3.1 `/api/items` liefert bei jedem Blick in die Übersicht den ganzen Bestand

**Was passiert.** Der Endpoint lädt **alle** Einträge, und je Eintrag: Fotos,
Kategorie, Tags, Links, Anhangzahl, Bewertungsschnitt, Testkennzahlen, alle
Testtage — und baut aus Titel, Beschreibung, Kategorie, Tags, Test-Tags,
Link-Adressen und **sämtlichen Kommentartexten** ein Feld `searchText`.
Gefiltert, gesucht und sortiert wird komplett im Browser.

`renderList()` ruft `loadAll()` — also bei **jeder** Rückkehr aus einem
Eintrag in die Übersicht neu.

**Gemessen.** Synthetischer Bestand, je Eintrag 4 Kommentare (~280 Zeichen),
6 Testtage, 3 Bewertungen; Antwortzeit serverseitig, warmgelaufen:

| Einträge | Antwortzeit | Antwortgröße |
|---:|---:|---:|
| 100 | 17 ms | 0,25 MB |
| 300 | 39 ms | 0,74 MB |
| 1000 | 136 ms | 2,46 MB |

Sauber linear. Auf dem Messrechner ist das unauffällig — auf einem
Raspberry Pi über WLAN sind 2,5 MB je Rückkehr in die Übersicht mehrere
Sekunden, und das bei jedem einzelnen Mal.

**Wo die Grenze wirklich liegt.** Ab etwa **500 Einträgen mit lebhafter
Kommentierung** wird es auf schwacher Hardware spürbar. Das ist für ein
persönliches Archiv weit weg — für ein Archiv, an dem fünf Leute drei Jahre
lang arbeiten, nicht.

Dasselbe gilt für die Zeitleiste, und das steht im Projektstand schon
richtig: „auf rund 50 Punkte über fünf Jahre ausgelegt; bei Hunderten wäre sie
zu überdenken". Bei 1000 Einträgen mit je 6 Testtagen sind es 6000.

**Vorschlag — in drei Stufen, jede für sich nützlich:**

1. **`searchText` aus der Liste nehmen und einen Such-Endpoint bauen.** Das
   Feld ist der größte Brocken der Antwort und wird nur gebraucht, wenn
   tatsächlich jemand tippt. `GET /api/items?q=…` sucht serverseitig und
   liefert die Trefferliste. Die Detailansicht lädt die Kommentare ohnehin
   separat — der Suchindex in der Übersicht ist reine Zugabe.
   **Das allein dürfte die Antwort etwa halbieren.** Keine Schemaänderung.
2. **`testDays` nur mitliefern, wenn die Zeitleiste eingeschaltet ist.** Sie
   ist eine persönliche Einstellung, der Server kennt sie — er liefert die
   Punkte heute auch dem, der sie abgeschaltet hat.
3. **Erst danach über Nachladen nachdenken.** Ich würde ausdrücklich **von**
   Blättern abraten: das Kartenraster mit durchgehender Suche ist eine gute
   Bedienidee und Blättern zerschneidet sie. Wenn es je nötig wird, dann als
   Nachladen beim Scrollen, mit serverseitigem Filter — nicht als Seitenzahlen.

Punkt 1 und 2 sind zusammen vielleicht ein halber Tag Arbeit und verschieben
die Grenze um etwa den Faktor drei.

### 3.2 Export und Import laufen vollständig durch den Arbeitsspeicher

Der Export baut **eine** JSON-Zeichenkette, in der jedes Foto und jeder Anhang
als Base64 steckt (Aufschlag: ein Drittel), und schickt sie mit `res.json()`.
Der Import nimmt Dateien bis **900 MB** über `multer.memoryStorage()`
entgegen.

Bei einem Bestand mit 300 Fotos aus einer Systemkamera (8–12 MB je Stück) sind
das im Export mehrere Gigabyte in einer Zeichenkette. Node bricht dann mit
`Invalid string length` ab — die Grenze für einen einzelnen String liegt bei
etwa 512 MB. Beim Import kommt die Datei zusätzlich als Buffer **und** als
geparstes Objekt in den Speicher, also grob das Zwei- bis Dreifache ihrer
Größe.

Das ist keine Fehlkonstruktion, sondern eine Grenze, die niemand gezogen hat.
Und sie trifft ausgerechnet die Funktion, die als Sicherungsnetz gedacht ist.

**Vorschlag.** Siehe 5.2 — der Ausweg ist nicht ein größerer Puffer, sondern
ein zweiter Sicherungsweg, der schon auf der Liste steht.

Als Sofortmaßnahme, unabhängig davon: die Kennzahlen im Systembereich sollten
neben der Datenbankgröße auch die **erwartete Exportgröße** nennen und ab
einem Schwellwert („Export mit Fotos: rund 2,1 GB — das übersteigt, was in
einem Zug erzeugt werden kann") auf den anderen Weg verweisen. Ein Knopf, der
nach zwei Minuten mit einem Speicherfehler abbricht, ist die schlechteste
Variante.

### 3.3 Zwei Funktionen sind zu groß geworden

| Datei | Zeilen | Auffällig |
|---|---:|---|
| `public/app.js` | 3.857 | `renderDetail()` ≈ **1.310 Zeilen**, `renderSystem()` ≈ **825 Zeilen** |
| `server.js` | 2.416 | eine Datei, 46+ Routen |
| `pruefung.js` | 8.683 | eine Datei, 1.429 Prüfungen |

Der Code selbst ist gut — dicht kommentiert, klare Namen, jede Entscheidung
begründet. Es ist die **Größe der Funktionen**, nicht ihre Qualität.

Bei `renderDetail()` mit 1.310 Zeilen kostet jede Änderung erst einmal
Suchen, und die Doktrin „eine Wahrheit" wird schwerer zu halten: bei dieser
Länge sieht man einer Funktion nicht mehr an, ob ein Zustand schon woanders
in ihr steht.

**Vorschlag — und ausdrücklich nicht als Refactoring-Projekt.** Beim nächsten
Anfassen jeweils einen Block herausziehen: `zeichneBewertung(item)`,
`zeichneKommentare(item)`, `zeichneTesttage(item)`, `zeichneAnhaenge(item)`.
Die Blöcke sind in der Oberfläche ohnehin schon eigenständig — sie lassen sich
einzeln anordnen und einklappen. Die Struktur ist also schon da, sie steht
nur nicht im Code.

Dasselbe für `renderSystem()`: dreizehn Karten, dreizehn Funktionen.

Für `pruefung.js` siehe 5.5.

---

## 4. Konzeptionelle Vorschläge

Hier wird es interessant. Die Reihenfolge ist meine Einschätzung des
Verhältnisses von Nutzen zu Aufwand — der erste Vorschlag ist der, den ich für
den wichtigsten halte.

### 4.1 Gewichtung der Kriterien **[NEU]**

> **Ausgearbeitet in `Konzept_Gewichtung_Bewertungskriterien.md`.** Dort steht
> der vollständige Bauplan samt der Antwort auf „nie über 5, nie unter 1" —
> sie ist beim gewichteten Mittelwert geschenkt und braucht keinen Deckel.

**Das Problem.** Alle Kriterien zählen heute gleich viel. „Optische
Erscheinung" und „Verarbeitungsqualität" gehen mit demselben Gewicht in den
Gesamtschnitt ein — und das ist bei fast jeder realen Beurteilung falsch.

Die Reihenfolge der Kriterien sagt bereits, was zuerst zählt; der Projektstand
formuliert es sogar so:

> **Kriterienreihenfolge wird gepflegt, nicht abgeleitet.** […] die
> Reihenfolge ist eine Aussage darüber, **was zuerst zählt**.

Aber sie zählt eben nur optisch. **Rechnerisch ist die Reihenfolge
bedeutungslos.** Der Gesamtschnitt — die Zahl, nach der die Übersicht
sortieren kann — behandelt das oberste und das unterste Kriterium gleich.

Das ist für ein System, dessen ganzer Zweck das Beurteilen ist, die größte
konzeptionelle Lücke, die ich sehe.

**Der Vorschlag.** Eine Spalte `gewicht` an `rating_criteria`, Vorgabe `1`.
Gepflegt im Systembereich, direkt neben Namen und Sortiergriff, **nur vom
Admin** — das folgt zwingend aus der bestehenden Regel: „Was an allen
Einträgen aller Benutzer erscheint, gehört dem Admin."

Der Gesamtschnitt rechnet weiterhin **erst je Kriterium, dann über die
Kriterien** — nur der zweite Schritt wird gewichtet. Der Unterschied zwischen
den beiden Rechenschritten, den 0.7.0 mit guter Begründung eingeführt hat,
bleibt vollständig erhalten.

**Warum das die Entscheidung „Skala fest 1–5" nicht verletzt.** Der Grund für
die feste Skala war die Vergleichsansicht: sie hebt je Kriterium den besten
Wert hervor, und bei verschiedenen Skalen wäre „am besten" nicht mehr
vergleichbar. Ein Gewicht ändert **keinen einzigen Kriterienwert** — die
Sterne bleiben 1–5, die Hervorhebung im Vergleich bleibt exakt wie sie ist.
Es ändert sich allein die eine Zahl darüber.

**Und der Umstieg ändert keine Zahl.** Mit Gewicht 1 überall ist der
gewichtete Schnitt rechnerisch identisch mit dem heutigen. Das ist dasselbe
Argument, mit dem 0.7.0 seinen Umbau begründet hat („ändert im
Einbenutzerbetrieb keine einzige Zahl") — hier gilt es sogar für jeden
Betriebszustand.

**Der Preis, und er gehört genannt.** Der Projektstand nennt heute schon einen
Rundungspreis:

> wer die angezeigten Zehntel von Hand mittelt, kann um bis zu 0,05
> danebenliegen.

Mit Gewichten wird der Zusammenhang zwischen den angezeigten Zeilenwerten und
der Kopfzahl **grundsätzlich** nicht mehr durch Mitteln nachvollziehbar. Das
ist ein echter Verlust und die Gegenmaßnahme muss mitgebaut werden: **das
Gewicht steht an der Kriterienzeile** — dezent, etwa `×2` hinter dem Namen,
und nur wenn es von 1 abweicht. Dann bleibt die Rechnung sichtbar statt
verborgen. Ohne diese Anzeige würde ich den Vorschlag zurückziehen.

**Was ich ausdrücklich nicht vorschlage:** persönliche Gewichte. Zwei Leute
mit verschiedenen Gewichten hätten zwei verschiedene Gesamtschnitte für
denselben Eintrag — das wäre eine zweite Wahrheit im Reinformat.

**Aufwand:** eine Spalte, ein Migrationsblock, eine Zeile in der Rechnung, ein
Feld im Systembereich, Export-Format. Klein bis mittel.

### 4.2 Der fehlende Abschluss: aus „abgelehnt" wird eine Entscheidung **[NEU]**

**Das Problem.** Kriterion hält den ganzen Weg der Beurteilung fest — Fotos,
Kriterien, Testtage, Kommentare, Aufgaben. Aber es hält **das Ergebnis** nicht
fest. Es gibt `tested` und `rejected`, zwei Merkmale ohne Datum und ohne
Begründung.

In zwei Jahren steht an einem Eintrag ein Häkchen „abgelehnt" — und niemand
weiß mehr, **warum** und **wann**. Die Begründung steckt vielleicht in einem
von zwölf Kommentaren, vielleicht nirgends.

Für ein Archiv, das existiert, um Entscheidungen vorzubereiten, ist das die
Stelle, an der es aufhört, kurz bevor es fertig ist.

**Der Vorschlag — bewusst als Erweiterung von `rejected`, nicht als zweites
Merkmal daneben.** Ein zusätzliches Feld „Ergebnis" neben `rejected` wären
zwei Wahrheiten über dieselbe Sache. Stattdessen bekommt das vorhandene
Merkmal, was ihm fehlt:

- `rejected_at` — wann
- `rejected_grund` — eine Zeile, warum

Angezeigt an der Marke „abgelehnt": *„Abgelehnt am 14.03.2026 — Lieferzeit
über 6 Monate."* Bei mehreren Zugängen dazu, **wer** — das Merkmal wird damit
zu einer Aussage, und Aussagen tragen in diesem System ihren Verfasser.

Und daraus folgt sofort die passende Regel: **umschreiben darf sie nur, wer
sie getroffen hat.** Ein Admin kann das Merkmal zurücknehmen, aber nicht die
Begründung eines anderen umformulieren. Das ist genau die vorhandene Regel
`nurSelbst`, angewandt auf ein neues Feld.

**Die Variante, die ich verworfen habe:** ein dreiwertiger Zustand *offen /
genommen / verworfen*. Klingt vollständiger, ist aber ein Neubau: `rejected`
müsste weg, jeder Filter und der Export müssten mit. Und „genommen" ist bei
einem Bewertungsarchiv gar nicht immer die Gegenfrage zu „abgelehnt" — man
lehnt ab, ohne dass etwas anderes genommen wird.

**Aufwand:** zwei Spalten, ein Migrationsblock, ein Eingabefeld,
Export-Format. Klein.

### 4.3 „Neu seit meinem letzten Besuch" **[NEU]**

**Das Problem.** Die Übersicht sortiert nach `updated_at`, für alle gleich.
Das ist bewusst so und richtig:

> Die Liste zeigt, wo etwas geschieht, nicht wo *ich* zuletzt war. Eine
> persönliche Reihenfolge wäre eine zweite Wahrheit über denselben Bestand.

Dem stimme ich vollständig zu. Aber daraus folgt eine Lücke: bei mehreren
Zugängen **sieht man nicht, was man noch nicht gesehen hat.** Ein Eintrag
rückt nach oben, wenn jemand kommentiert — aber ob dieser Kommentar von
gestern oder von vor drei Monaten ist, ob ich ihn schon gelesen habe oder
nicht, sagt die Liste nicht.

**Der Vorschlag.** Ein Umschalter **„Neu seit …"** in der Filterzeile — genau
dort, wo heute schon **★ Favoriten** steht, und nach demselben Muster:

- Er **sortiert nichts um.** Er filtert.
- Er ist **persönlich**, wie der Favorit.
- Er ist mit allen anderen Filtern kombinierbar.

Der Bezugszeitpunkt ist der vorletzte Besuch der Übersicht, gespeichert als
persönlicher Schlüssel. Daneben die Zahl: *„7 neu seit 19.08."*

**Warum das so gut passt:** `user_settings` ist eine Schlüssel-Wert-Tabelle.
Ein neuer persönlicher Schlüssel `zuletztGesehen` braucht **keine
Schemaänderung und keinen Migrationsblock** — genau das, wofür die Tabelle
2020 in Stufe D gebaut wurde. Serverseitig ist es ein Vergleich zweier
Zeitstempel.

Der Präzedenzfall steht schon im Projektstand: der Favoritenfilter ist
ausdrücklich als „persönlich, aber ohne die gemeinsame Liste umzusortieren"
entschieden worden. Dies ist derselbe Fall.

**Ein Stolperstein, der dazugehört:** Zeitstempel haben Sekundenauflösung
(Stolperstein 15). Wer die Übersicht öffnet und in derselben Sekunde jemand
anderes kommentiert, sieht den Kommentar nie als neu. Die Antwort ist, den
Merkzeitpunkt beim **Verlassen** der Übersicht zu setzen, nicht beim
Betreten — dann ist das Fenster harmlos.

**Aufwand:** klein. Kein Schema, kein Export.

### 4.4 Offene Aufgaben quer über alle Einträge **[NEU]**

**Das Problem.** Kommentare können „Aufgabe" sein und „erledigt" werden — ein
gut durchdachtes Feature, bis hin zur Farbkante und zum Weiterschalt-Knopf
(Notiz → Aufgabe → erledigt → Notiz).

Aber eine Aufgabe ist nur sichtbar, **wenn man ihren Eintrag öffnet.** Es gibt
keine Stelle, an der „was ist eigentlich noch offen?" beantwortet wird. Bei
zwanzig Einträgen heißt das: zwanzigmal klicken.

Damit ist ein gebautes Feature im Alltag halb tot — und das ist die
günstigste Art von Verbesserung, die es gibt: **vorhandene Funktionalität
erreichbar machen.**

**Der Vorschlag.** Eine Ansicht **„Offen"**, erreichbar aus der Kopfzeile,
neben dem Zahnrad. Sie zeigt alle nicht erledigten Aufgabenkommentare,
gruppiert nach Eintrag, mit Verfasser und Datum. Ein Klick springt in den
Eintrag. Der Erledigt-Haken lässt sich direkt dort setzen.

Ein Umschalter „meine / alle" — dasselbe Muster wie im Vergleich, und aus
demselben Grund: bei einem einzigen Zugang erscheint er nicht.

**Was das kostet:** eine Abfrage
(`SELECT … FROM comments WHERE kind = 'todo' … JOIN items`), eine Ansicht,
kein Schema, kein Export, keine Migration. Das ist mit Abstand das beste
Verhältnis von Nutzen zu Aufwand in dieser ganzen Liste.

**Der Zähler in der Kopfzeile** („Offen 7") wäre die naheliegende Ergänzung.
Ich würde ihn **erst in einem zweiten Schritt** bauen: er wird bei jedem
Seitenaufbau gebraucht, und die Frage, wie er nicht ständig neu abgefragt
wird, gehört nicht in dieselbe Runde wie die Ansicht selbst.

### 4.5 Ein Papierkorb, der das Schema nicht anfasst **[NEU]**

**Das Problem.** Einen Eintrag zu löschen nimmt über die Kaskade **fremde**
Kommentare, Bewertungen und Testtage mit. Der Dialog nennt die Zahlen, sauber
getrennt nach eigen und fremd — das ist gut gelöst. Aber es ist
**unwiderruflich**, und ein Admin darf es an jedem Eintrag.

Ein falscher Klick vernichtet die Arbeit von vier Leuten an einem Gegenstand.
Der einzige Rückweg ist ein Export, den jemand gezogen haben muss.

Das Projekt hat für Benutzer bereits die richtige Antwort erfunden: **„Löschen
entwertet, es löscht nicht"** — der Grabstein. Für Einträge gibt es nichts
Vergleichbares.

**Der Vorschlag — und die Form ist hier wichtiger als die Idee.** Kein
`geloescht`-Zustand an `items`. Der würde **jede** Abfrage im ganzen System
anfassen, und jede vergessene Stelle wäre ein stiller Fehler.

Stattdessen: eine eigene Tabelle, die nichts berührt.

```sql
CREATE TABLE papierkorb (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  geloescht_am TEXT NOT NULL DEFAULT (datetime('now')),
  geloescht_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  titel TEXT NOT NULL,              -- damit die Liste lesbar ist, ohne zu entpacken
  inhalt BLOB NOT NULL              -- der ganze Eintrag im Exportformat, gezippt
);
```

Beim Löschen wird der Eintrag **im vorhandenen Exportformat** serialisiert und
als eine Zeile abgelegt — in derselben Transaktion wie das Löschen. Dann
läuft die Kaskade wie heute.

**Warum diese Form:** Der Serialisierer existiert bereits (Export), der
Deserialisierer auch (Import). Es entsteht **kein neuer Code für die
Datenstruktur**, nur der Aufruf an zwei Stellen. Und keine einzige bestehende
Abfrage ändert sich — ein gelöschter Eintrag ist wirklich weg, er liegt nur
zusätzlich noch als Paket daneben.

Im Systembereich eine Karte „Papierkorb" (Eigentümer, wie Export und Import):
Liste mit Titel, Datum, Löschendem; „Wiederherstellen" und „Endgültig
entfernen". Nach 30 Tagen fällt eine Zeile automatisch heraus, beim Start
aufgeräumt.

**Zwei Dinge, die ausdrücklich dazugehören:**

- **Wiederherstellen legt einen neuen Eintrag an, es stellt nicht den alten
  zurück.** Die alte `id` ist weg, und daran hängt nichts mehr. Der Import
  kann das schon.
- **Der Papierkorb steht mit im Datenverzeichnis und damit im Backup.** Die
  Kennzahlen sollten ihn getrennt ausweisen, sonst wundert sich jemand über
  die Datenbankgröße.

**Aufwand:** eine Tabelle, zwei Aufrufe, eine Karte. Mittel — aber der Code
für den schwierigen Teil ist schon geschrieben.

### 4.6 Doppelte Einträge beim Anlegen erkennen **[SCHÄRFT]**

Steht im Projektstand als „Idee ohne Beschluss" (Doppelerkennung). Ich halte
sie für deutlich wichtiger, als diese Einordnung nahelegt — aber nur im
Mehrbenutzerbetrieb.

**Warum.** Bei einem Zugang weiß man, was man eingetragen hat. Bei vier
Zugängen und 300 Einträgen legt der zweite Mensch dieselbe Maschine ein
zweites Mal an — und dann stehen die Bewertungen an zwei Stellen, was genau
das ist, wogegen die ganze Doktrin sonst kämpft: **eine Sache, zwei
Wahrheiten.**

**Der Vorschlag, klein gehalten.** Im Anlegen-Dialog, nach dem Tippen des
Titels: eine unaufdringliche Zeile *„Ähnlich: Bosch GSR 18V (2024), Bosch GSR
18V-60"* mit Sprungmarken. Kein Blockieren, keine Rückfrage — nur der Hinweis.

Als Vergleich reicht ein Titelabgleich, der Groß-/Kleinschreibung und
Sonderzeichen ignoriert und Teilzeichenketten ab 4 Zeichen findet. Für
Trigramme oder Levenshtein sehe ich hier keinen Bedarf: die Titel sind kurz
und Menschen tippen denselben Gegenstand meist ähnlich.

**Aufwand:** klein. Kein Schema.

### 4.7 „Entfällt" am einzelnen Kriterium **[NEU, mit Vorbehalt]**

**Das Problem.** `value = 0` bedeutet heute „nicht bewertet". Es bedeutet aber
auch „gibt es hier nicht" — ein Kriterium „Akkulaufzeit" an einem Gegenstand
ohne Akku. Zwei verschiedene Aussagen, ein Wert. Nach der Doktrin des
Projekts: eine zweite Wahrheit.

Praktisch führt das dazu, dass ein vollständig beurteilter Eintrag
unvollständig aussieht, und im Vergleich steht eine Lücke, die man nicht von
„noch nicht drangewesen" unterscheiden kann.

**Der Vorschlag.** Ein dritter Zustand am Sterne-Widget, erreichbar über
denselben Doppelklick, der heute zurücksetzt: leer → entfällt → leer. In der
Zeile steht dann „—" statt der Sterne, und das Kriterium fällt aus **beiden**
Schnitten heraus (was rechnerisch schon heute passiert — nur sieht man es
nicht).

**Der Vorbehalt, und er ist ernst gemeint.** Das ist der einzige Vorschlag in
dieser Liste, bei dem ich mir unsicher bin, ob der Gewinn den Preis trägt. Er
verkompliziert das am häufigsten benutzte Bedienelement der Anwendung, und die
Frage „ist es nicht bewertet oder gibt es das hier nicht" stellt sich nur bei
gemischten Beständen — also genau dort, wo eigentlich 4.8 die richtige Antwort
wäre.

**Meine Empfehlung:** zurückstellen, bis es im Betrieb tatsächlich vermisst
wird. Ich nenne ihn hier, weil er die logische Lücke ist; nicht, weil ich ihn
bauen würde.

### 4.8 Die offene Grundsatzfrage: eine Anlage = ein Sachgebiet? **[NEU]**

**Das Problem, das noch keins ist.** Bewertungskriterien sind **global**. Sie
erscheinen an jedem Eintrag. Wer Modelle **und** Werkzeuge **und**
Bezugsquellen in derselben Anlage sammelt, hat an jedem Eintrag die Kriterien
aller drei Sachgebiete stehen.

Bei 3 Kriterien fällt das nicht auf. Bei 25 ist die Detailansicht eine Wand
aus Sternenzeilen, von denen zwei Drittel nie ausgefüllt werden — und der
Gesamtschnitt wird über eine Menge gebildet, die für diesen Eintrag gar nicht
zusammengehört.

Das Vokabular sagt es sogar schon: **elf Wörter, global.** Die Anwendung geht
davon aus, dass alles darin dasselbe *ist*.

**Warum ich das jetzt anspreche.** Es ist der einzige Punkt, an dem die
Architektur eine Annahme trifft, die nirgends aufgeschrieben ist. Und es ist
eine, die man nicht mehr billig korrigieren kann, wenn erst Bestand da ist.

**Zwei Wege, und ich empfehle klar den ersten:**

**a) Die Annahme aufschreiben und dabei bleiben.** Eine Anlage ist ein
Sachgebiet. Wer zwei sammelt, betreibt zwei Container mit zwei Datenverzeichnissen
und zwei Schlüsseln — was ohnehin die sauberere Trennung ist und zur Doktrin
„ein Schlüssel, eine Datenbank" passt. **Kosten: ein Absatz in der README.**

**b) Kriteriengruppen je Kategorie.** Kriterien bekommen eine optionale
Kategoriezuordnung; ein Eintrag zeigt die globalen plus die seiner Kategorie.
Das ist ein Umbau: Kriterienverwaltung, Detailansicht, Vergleich (was
vergleicht man bei zwei Einträgen verschiedener Kategorien?), Export,
Gesamtschnitt. **Und es verletzt „Was an allen Einträgen erscheint, gehört dem
Admin" nicht — aber es macht die Regel deutlich komplizierter.**

**Meine Empfehlung: (a), und zwar vor 1.0.** Nicht weil (b) schlecht wäre,
sondern weil (a) heute einen Absatz kostet und (b) später eine ganze Stufe —
und weil eine ausgesprochene Grenze in diesem Projekt mehr wert ist als ein
Feature. Es passt genau zur Linie „Für eine Person, dafür vollständig
verschlüsselt ist ein Merkmal, kein Mangel": **Für ein Sachgebiet, dafür
konsequent** ist derselbe Satz.

---

## 5. Dinge, die ich anders machen würde

Hier geht es um Bestehendes, nicht um Neues.

### 5.1 Ein Versionsnachweis, der wirklich trägt **[NEU]**

**Das Problem steht in der README, ausführlich und ehrlich:**

> Diese Zahl kommt allerdings aus der `package.json` und ist **keine Aussage
> über die übrigen Dateien**: wurden `package.json` und `server.js` ersetzt,
> `public/app.js` aber nicht, zeigt der Footer die neue Version, während die
> Oberfläche sich alt verhält. Belegen lässt sich das nur an einer Textstelle,
> die es allein in der neuen Datei gibt — für 0.8.6 etwa
> `curl -s http://localhost:3100/app.js | grep -c 'Wer hat bewertet'`
> (erwartet: 3).

Das ist eine gut dokumentierte Notlösung — und trotzdem eine Notlösung. Sie
braucht bei **jeder** Version eine neu erfundene Textstelle, sie muss von Hand
in die Dokumentation, und die erwartete Trefferzahl ändert sich mit jedem
Umbau. Nach meinem Verständnis der Projektdoktrin ist das eine zweite Wahrheit
über dieselbe Sache: die Versionsnummer sagt das eine, der grep das andere.

**Der Vorschlag.** Der Server bildet beim Start einen kurzen Hash über die
Dateien, die tatsächlich ausgeliefert werden:

```js
const crypto = require('crypto');
const ABDRUCK = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'server.js')))
  .update(fs.readFileSync(path.join(__dirname, 'public/app.js')))
  .update(fs.readFileSync(path.join(__dirname, 'public/style.css')))
  .digest('hex').slice(0, 8);
```

`GET /api/config` liefert ihn mit, die Fußzeile zeigt ihn hinter der Version:
`0.8.6 · a3f91c02`. Der Systembereich zeigt ihn groß.

**Was das löst:** Der Abdruck ändert sich, sobald **irgendeine** der drei
Dateien anders ist. Ein halb eingespielter Dateisatz zeigt einen Abdruck, der
zu keiner Version gehört. Und die Prüfung nach dem Einspielen ist immer
dieselbe, für jede Version:

```bash
curl -s http://localhost:3100/api/config
```

Zum Vergleich gehört ein Wert, der zur Version veröffentlicht wird — eine
Zeile im Änderungsprotokoll: *„0.8.10 — Abdruck `a3f91c02`"*.

**Aufwand: etwa zwanzig Zeilen.** Und der ganze Absatz in der README, der die
grep-Prozedur erklärt, wird durch drei Sätze ersetzt. Von allen Vorschlägen
hier ist das der mit dem besten Verhältnis von Zeilen zu gespartem Ärger.

### 5.2 Backup: `VACUUM INTO` wird der Hauptweg, der Export der Austauschweg **[SCHÄRFT]**

Steht im Projektstand als Punkt 8 („Sicherungskopie auf Knopfdruck", noch
nicht beschlossen, bereits geprüft dass die Kopie verschlüsselt ist). Ich
schlage vor, es nicht nur zu beschließen, sondern die **Rollen der beiden
Wege ausdrücklich zu trennen** — das ist der Teil, der noch nirgends steht:

| | `VACUUM INTO` | JSON-Export |
|---|---|---|
| **Zweck** | Sicherung | Austausch, Umzug, Archiv |
| **Größe** | wie die Datenbank | plus ~⅓ durch Base64 |
| **Speicherbedarf** | konstant | ganze Datei im RAM (siehe 3.2) |
| **Braucht den Schlüssel** | ja | nein |
| **Überlebt einen Formatwechsel** | nein | ja |
| **Vollständig** | ja, inklusive Sessions und Einstellungen | nein: Blockanordnung fehlt |

Beide werden gebraucht, und zwar für **verschiedene** Dinge. Heute muss der
Export beides sein und ist für das eine davon zu schwer.

**Konkret:**

- Karte „Sicherung" im Systembereich (Eigentümer): Knopf, Zielort einstellbar,
  „letzte Sicherung vor N Tagen".
- Der Zielort ist **außerhalb von `./data`** vorbelegt — eine Sicherung neben
  dem Original ist keine.
- **Der Hinweis auf den Schlüssel gehört an den Knopf**, nicht in die
  Dokumentation: die Kopie ist verschlüsselt und ohne `.env` wertlos. Das ist
  dieselbe Falle, die die README beim Backup ausführlich beschreibt — hier
  steht sie an der Stelle, an der jemand sie tatsächlich tappt.
- Der Export bleibt unverändert und bekommt bei großem Bestand die Warnung aus
  3.2.

### 5.3 Alles, was gezogen wird, braucht einen zweiten Weg **[NEU]**

**Der Befund.** Umsortiert wird an fünf Stellen: Fotos, Links, Kriterien,
Blöcke, Testtag-Tags. Alle über Pointer-Events. Im Frontend: **0 Vorkommen von
`tabindex`, 2 `aria-`-Attribute** auf 3.857 Zeilen.

Das heißt: **Was nur gezogen werden kann, ist mit der Tastatur nicht
erreichbar.** Wer keine Maus benutzen kann, kann die Reihenfolge der Fotos
nicht ändern — und das erste Foto ist das Hauptbild, also ist das keine
Kleinigkeit.

Das ist kein Vorwurf: das Projekt hat sich mit Maus **und** Finger sehr
gründlich beschäftigt (0,4 s Haltezeit, Impuls beim Greifen, kein
Bildlauf in Listen). Die Tastatur ist der dritte Fall, und der ist übersehen
worden.

**Der Vorschlag — klein, nicht als Barrierefreiheitsprojekt.** Jede sortierbare
Zeile bekommt `tabindex="0"` und reagiert im Fokus auf `Alt+↑` / `Alt+↓`. Der
Griff `⣿` bekommt ein `aria-label`. Der Rest der Anwendung ist ohnehin schon
weitgehend tastaturbedienbar — es gibt `:focus-visible` mit sichtbarem Rahmen,
und die Suche hat `/` als Sprungmarke. Es fehlt genau dieser eine Baustein.

**Und ein Satz für die Doktrin**, den ich in Abschnitt 5 aufnehmen würde:

> **Was sich ziehen lässt, muss sich auch mit der Tastatur bewegen lassen.**
> Maus, Finger und Tastatur sind drei Fälle, nicht zwei.

### 5.4 Der Prüfstand gehört in eine Pipeline **[NEU]**

**Der Befund.** 1.429 Prüfungen, alle grün, gegen echte Server mit echten
verschlüsselten Datenbanken, mit drei Sitzungen nebeneinander und einem Admin
ohne Eigentümerrolle. Der Exit-Code stimmt (`process.exit(gescheitert ? 1 : 0)`).
Das ist ein außergewöhnlich guter Prüfstand.

Und er läuft nur, wenn jemand daran denkt. **Es gibt kein `.github/`.**

**Der Vorschlag.** Eine Datei, etwa dreißig Zeilen:

```yaml
# .github/workflows/pruefstand.yml
name: Prüfstand
on: [push, pull_request]
jobs:
  pruefen:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npm audit --audit-level=high
```

Was das bringt: Jeder Push wird geprüft, ohne dass jemand daran denken muss.
Der `npm audit`-Schritt macht einen Befund wie 2.5c sichtbar, sobald er
entsteht, statt Monate später. Und Node 20 ist die Version aus dem Dockerfile
— **heute wird lokal gegen Node 22 geprüft und im Container läuft 20.**

Beides kostet nichts und ist im Rahmen von GitHub Actions für öffentliche
Repositories kostenfrei.

### 5.5 Der Prüfstand sollte sich in Teilen aufrufen lassen **[NEU]**

8.683 Zeilen, ein Durchlauf, alles oder nichts. Wer eine Zeile in der
Rechteschicht ändert, wartet auf 1.429 Prüfungen inklusive aller
Serverstarts.

**Der Vorschlag, minimal:** `gruppe()` merkt sich den aktuellen Namen, und ein
Argument filtert:

```bash
node pruefung.js                 # alles, wie heute
node pruefung.js Rechte          # nur Gruppen, deren Name "Rechte" enthält
```

Wichtig ist dabei eine Regel, sonst wird daraus eine Falle: **ein gefilterter
Lauf sagt am Ende ausdrücklich, dass er gefiltert war** und wie viele Gruppen
er übersprungen hat. Sonst liest sich „alles in Ordnung" nach einem Teillauf
wie ein vollständiger Beleg — und das wäre genau die Sorte stiller
Fehlschluss, gegen die die Stolpersteinliste sonst so gründlich anschreibt
(vgl. Stolperstein 21: „Eine Prüfung, die bei fehlendem Gegenstand grün
bleibt, kann gar nicht scheitern").

Aufteilen in mehrere Dateien würde ich **nicht** vorschlagen: die gemeinsame
Umgebung (Serverstart, Cookie-Verwaltung, Doppelgänger) ist der Wert dieser
Datei.

### 5.6 Die Vorgabewerte **[SCHÄRFT]**

Steht als Punkt 7 im Projektstand und ist richtig erkannt: `title_app` hat die
Vorgabe „Model Bewertungen" — ein persönlicher Wert in einer frischen
Installation —, und `title_public` liegt zweimal (Server: „Bewertungskatalog",
`public/app.js`: „Kriterion").

Ich ergänze nur die Empfehlung, wie herum aufgelöst wird: **die Vorgabe steht
im Server, das Frontend hat gar keine.** Wenn `/api/config` nicht antwortet,
zeigt die Anmeldeseite nichts statt etwas Falsches — das ist der ehrlichere
Zustand und spart die zweite Wahrheit ganz, statt sie zu synchronisieren.

Für `title_app` schlage ich „Bewertungen" vor: neutral, und es passt zur
Vorgabe des Vokabulars.

---

## 6. Was ich geprüft und bewusst **nicht** vorgeschlagen habe

Das gehört mit dazu, sonst liest sich die Liste oben wie eine Mängelanzeige.

- **Verlauf der Kriterienbewertung.** Naheliegend („wie hat sich mein Urteil
  über die Jahre verändert?") — und falsch. Die Trennung ist bereits richtig
  gebaut: der **Testtag** ist die Zeitreihe, die **Kriterienbewertung** ist
  das gegenwärtige Urteil. Zwei Zeitreihen über dieselbe Sache wären zwei
  Wahrheiten. Die Entscheidung „Testtage und Kriterienbewertung sind getrennt"
  ist gut begründet und sollte bleiben.

- **Bericht an einen Testtag binden.** Ebenfalls naheliegend, und ebenfalls
  schon entschieden: *„Ein Bericht ist an keinen Testtag gebunden; er fasst
  meist mehrere zusammen."* Das ist richtig beobachtet und würde durch eine
  Verknüpfung nur eingeengt.

- **Blättern in der Übersicht.** Siehe 3.1 — es würde die Suche zerschneiden.
  Nachladen beim Scrollen, falls überhaupt.

- **Verschlüsselung je Benutzer.** Das Konzeptpapier nennt es korrekt „ein
  Neubau, kein Anbau" und dokumentiert die Folge offen („Jeder Benutzer
  vertraut dem Betreiber mit allem"). Für ein selbstgehostetes System ist das
  die richtige Abwägung.

- **Ein Framework im Frontend.** 3.857 Zeilen ohne Framework sind viel — aber
  kein Framework heißt: keine Build-Kette, keine 400 Pakete, kein Ablaufdatum.
  Bei einer Anwendung, die zehn Jahre laufen soll, ist das die richtige Wahl.
  Die Antwort auf 3.3 sind kleinere Funktionen, nicht React.

- **Tags in Mengen bearbeiten / Vorlagen für Einträge** (beide auf der Liste
  „Ideen ohne Beschluss"). Nützlich, aber deutlich hinter 4.4 und 4.6. Ich
  würde sie dort lassen, wo sie sind.

- **PWA-Manifest** (ebenfalls auf der Liste). Für ein System im eigenen Netz
  ohne Offline-Anspruch sehe ich wenig Gewinn — außer dem Icon auf dem
  Startbildschirm. Niedrige Priorität.

- **Die Sortierung nach `updated_at` für alle.** Siehe 4.3 — die Entscheidung
  ist richtig, sie hat nur eine Lücke, die sich **daneben** schließen lässt
  statt durch Umbau.

---

## 7. Was ich zuerst machen würde

| # | Was | Aufwand | Warum jetzt |
|---|---|---|---|
| 1 | **2.1** SVG als Foto | klein | Sicherheit, und die Regel dagegen steht schon im Projekt |
| 2 | **2.2** `X-Forwarded-For` + **2.3** `Secure` | klein | eine Einstellung, zwei Sicherheitsbefunde |
| 3 | **2.5** Lockfile, `npm ci`, `sharp` | klein | jeder Build ist heute ein anderer |
| 4 | **5.4** Prüfstand in CI | klein | ab dann laufen 1–3 automatisch nach |
| 5 | **5.1** Versionsabdruck | klein | löst ein dokumentiertes Betriebsproblem endgültig |
| 6 | **4.4** Ansicht „Offen" | klein | macht ein gebautes Feature erst brauchbar |
| 7 | **2.4** CSP + **2.6** Fehler-Handler + **2.7** SIGTERM/Healthcheck | klein | Betriebshärte, alles am selben Nachmittag |
| 8 | **4.3** „Neu seit …" | klein | keine Migration, großer Gewinn im Mehrbenutzerbetrieb |
| 9 | **G4** (Roadmap: Links bekommen Verfasser) | mittel | steht an, siehe Anmerkung unten |
| 10 | **4.1** Gewichtung der Kriterien | mittel | inhaltlich der wichtigste Punkt der Liste |
| 11 | **4.2** Abgelehnt mit Datum und Begründung | klein | zusammen mit 10, gleiche Baustelle |
| 12 | **3.1** `searchText` aus der Liste | mittel | wenn der Bestand wächst |
| 13 | **5.2** Sicherung auf Knopfdruck | mittel | vor 1.0, steht schon auf der Liste |
| 14 | **4.5** Papierkorb | mittel | vor der ersten fremden Installation |
| 15 | **4.8** README-Absatz zum Sachgebiet | winzig | vor 1.0, kostet einen Absatz |
| 16 | **5.3** Tastatur beim Sortieren | klein | vor 1.0 |

**Eine Anmerkung zur Reihenfolge, die Arbeit spart:** Stufe G4 hebt das
Exportformat ohnehin von 6 auf 7. **Die Punkte 10 und 11 brauchen ebenfalls
eine Formaterhöhung.** Wenn sie in dieselbe Version wandern — oder G4 kurz
wartet —, ist es **eine** Formaterhöhung statt drei, ein Migrationsblock statt
drei, und eine Runde Import-Prüfungen statt drei.

Das gilt allerdings nur, wenn die Stufe dadurch nicht zu groß wird für einen
Durchgang — die Regel „jede Stufe muss in einem Chat abzuarbeiten sein" wiegt
schwerer als die gesparte Formaterhöhung. Ich würde deshalb **G4 und 4.2**
zusammenlegen (beide klein, beide am Eintrag) und **4.1** als eigene Stufe
direkt danach mit Format 8 fahren — der Verlust ist eine Formatnummer, der
Gewinn ist eine Stufe, die man am Stück durchdenken kann.

---

## 8. Zum Schluss

Der Code ist in einem Zustand, den man selten sieht: 1.429 Prüfungen, alle
grün, jede Entscheidung begründet, jeder Stolperstein nummeriert und mit
Merksatz versehen. Die Stolpersteinliste ist für sich genommen ein Dokument,
aus dem andere Projekte lernen könnten.

Die Befunde in Abschnitt 2 widersprechen dem nicht — sie bestätigen es eher:
**es sind fast alles Stellen, an denen eine bereits formulierte Regel nur noch
nicht angewandt wurde.** Die Regel gegen 2.1 steht im Kopf von `anhaenge.js`.
Die Regel gegen 2.2 steht im Konzeptpapier, für ein anderes Feld. Kein
einziger Befund verlangt, dass etwas anders gedacht wird — nur, dass das
bereits Gedachte an eine weitere Stelle wandert.

Und deshalb wäre mein wichtigster einzelner Rat nicht einer aus der Liste
oben, sondern dieser: **wenn ein Merksatz aufgeschrieben wird, gehört die
Frage dazu, an welchen anderen Stellen er auch schon gilt.** Der Prüfstand
zählt bereits Vorkommen im Quelltext (der Wächter auf die Adminfrage) — das
ist genau das richtige Werkzeug dafür. Ein Wächter, der prüft, dass kein
Endpoint einen gespeicherten `mime_type` ausliefert, hätte 2.1 nie entstehen
lassen.
