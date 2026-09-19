# Auftrag 0.38.0 — Auszeichnung in Kommentar und Beschreibung

Geschrieben am 19. September 2026 auf dem gebauten Stand **0.37.0**. Nicht
gebaut.

Die Runde löst **Punkt 44** des Sammelblatts ein: fett, kursiv, Zitat und
Aufzählung im Kommentar und in der Beschreibung, dazu „mit Zitat antworten".
Punkt 44 stellt sieben Fragen und beantwortet keine.

> **DIESER AUFTRAG LÄUFT DURCH.** *Jede Frage ist vor der ersten Zeile
> entschieden — die sieben aus Punkt 44 und die vier, die der Betreiber am
> 19. September 2026 beantwortet hat.* **Abschnitt 10 führt sie alle mit ihrer
> Entscheidung.** *Es gibt keine offene Frage, an der die Runde stehenbleibt.*

## Herkunft

Der Betreiber hat die Sache mit Google Gemini vorgebaut. Das Ergebnis liegt als
ZIP vor, dazu vier Bildschirmfotos. Der Vorbau beruht auf **0.29.0** und ist
gegen jene Fassung verglichen worden, nicht gegen 0.37.0 — sonst stünden acht
Runden Unterschied im Vergleich.

**Der Vorbau wird nicht übernommen, sondern ausgewertet.** Abschnitt 3 nennt,
was daraus bleibt: **neun Funktionen**. Abschnitt 4 nennt, was nicht bleibt:
**zwanzig Befunde und sechs fremde Eingriffe**, jeder mit Beleg.

## Was gebaut wird, und was nicht

**Es wird kein fertiger Editor genommen** — Abschnitt 11, V1. **Und es wird
auch keiner gebaut.**

*Das Wort „Editor" steht in Punkt 44 und im Fahrplan, und es führt in die
Irre.* Das `<textarea>` bleibt, wie es ist: ein Textfeld, in dem Zeichen
stehen. Gebaut werden **zwei Stücke**, und keines davon ist ein Editor:

| | was | Größe |
|---|---|---|
| **Der Leser** | macht aus Text DOM-Knoten. Die teure Hälfte | ~260 Zeilen |
| **Das Menü** | schreibt Zeichen in das Textfeld, über `selectionStart` und `selectionEnd` | ~180 Zeilen |

**Dazwischen liegt nichts.** *Es gibt keinen zweiten Zustand des Textes, keinen
Knotenbaum im Speicher, kein `contenteditable`.* **Was im Feld steht, ist das,
was in der Datenbank steht** — und was gezeichnet wird, entsteht bei jedem
Zeichnen neu aus diesem Text.

*Daran hängt die Sicherheit der Runde: ein Fehler im Leser trennt falsch, er
schleust nichts ein.*

---

## Entscheidungen des Betreibers vom 19. September 2026

| | Frage | Entscheidung |
|---|---|---|
| **A** | Umfang der Runde | **alles in 0.38.0** — Auszeichnung, Verweis und Zitat zusammen |
| **B** | Welche offenen Punkte kommen mit | **die Doppelung in der README** *(Befund aus BA 6 der 0.37.0)*. „Auffangnetz" und „Grundausstattung" bleiben stehen und bekommen eine eigene Umbenennungsrunde |
| **C** | Stabilität der Kommentarnummer | **zeitliche Reihenfolge, keine Schemaänderung** |
| **D** | Umfang der Auszeichnung | **voller Satz mit Schutzregeln**, kursiv eingeschlossen |
| **E** | *Nachfrage vom selben Tag:* muss etwas erfunden werden? | **nein.** Die Auszeichnung ist eine **Teilmenge von CommonMark**; innerhalb der Teilmenge gilt die Spezifikation. Die Schutzregel aus D wird dadurch überflüssig — sie ist eine Frage des Umfangs, nicht der Regel. Abschnitt 5.1 |

---

## 1. Der Bestand

**Gemessen am 19. September 2026 auf dem gebauten Stand 0.37.0.**

### Die Textfelder

| | Leseansicht | Schreibansicht | Spalte |
|---|---|---|---|
| Kommentar | `buildCommentNodes()` *(`public/app.js`:1471)*, gerufen bei 5498 | `#ctext` beim Anlegen, ein Feld im Kommentar beim Ändern | `comments.text` |
| Beschreibung | **gibt es nicht** | `#desc`, dauerhaft offen *(3836)*, speichert beim Verlassen *(4601)* | `items.description` |
| Kurzbeschreibung | gibt es nicht | `#nd` im Anlegen-Dialog *(3070)* | **dieselbe Spalte** `items.description` |
| Ablehnungsgrund | — | `#rej-reason`, einzeiliges `input`, `maxlength=200` *(3779)* | — |

**`#nd` und `#desc` schreiben in dieselbe Spalte.** Punkt 44 nennt nur `#desc`.
Wer im Anlegen-Dialog Marken tippt, hat sie danach in der Beschreibung.

### Was der Knotenbau heute kann

`splitCommentText(raw, term, marks)` *(1423)* zerlegt in Stücke,
`buildCommentNodes()` *(1471)* baut daraus Knoten mit `createElement` und
`textContent`, `pieceNode()` *(1452)* setzt das einzelne Stück. Drei Sorten
kennt die Zerlegung:

1. **Adressen** — `COMMENT_LINK`, mit zweiter Prüfung vor `href` *(1480)*,
2. **Markierungen mit `@`** — `splitAtMention()`,
3. **den Suchbegriff** — `splitAtTerm()`, ein Treffer wird `<mark>`.

Zwei Leser hängen daran: der Kommentar *(5498)* und `raiseHighlight()` *(1501)*
für Titel, Kategorie, Tag und Kontextzeile.

### Die Zahlen, an denen die Runde gemessen wird

| | |
|---|---:|
| `public/app.js` | 9.295 Zeilen, **1.761 Kommentar** (19 %), Ziel 1.884 |
| `public/style.css` | 2.962 Zeilen, **1.638 Regelzeilen**, 443 Blöcke, 8 über drei Zeilen |
| `server.js` | 5.618 Zeilen |
| Auslieferung | **253.736 Bytes gzip** über acht Dateien |
| Prüfungen | **7.070**, Gruppen 373, Rückbauten **1.065** |
| Routen | **102** |
| Schlüssel der Sprachdatei | **1.213** |
| `.innerHTML =` in `public/app.js` | **172**, davon 48 Einsetzungen unter 27 benannten Ausnahmen |
| Formatnummer des Austauschs | **17**, Untergrenze 14 |
| Fingerprint | `144a80c7` über 19 Dateien |

### Die Auslieferung im Einzelnen

| | roh | gzip |
|---|---:|---:|
| `public/app.js` | 446.238 | **131.750** |
| `public/style.css` | 167.501 | **51.694** |
| drei Sprachdateien | 242.958 | 68.538 |
| `index.html`, `theme.js`, `favicon.svg` | 2.997 | 1.754 |
| **zusammen** | | **253.736** |

*0.35.0 hat 268.441 gemessen. Die Differenz von 14.705 Bytes stammt aus 0.37.0:
gefallener Kommentar in `public/app.js` und `public/style.css`.*

---

## 2. Was im Vorbau steckt

Der Vergleich gegen 0.29.0 ergibt **890 neue Zeilen in `public/app.js`**, **585
in `public/style.css`**, 3 in `index.html` und je 10 Schlüssel in den drei
Sprachdateien. Dazu sechs Eingriffe an `server.js`, `db.js`, `auth.js` und
`.env.example`, die mit der Sache nichts zu tun haben — Abschnitt 4.1.

Sieben Funktionen sind erkennbar:

1. **Auszeichnung** — `**fett**`, `*kursiv*`, `> Zitat`, `- Punkt`, `1. Punkt`.
2. **Link mit Namen** — `[Name](Adresse)`, gezeichnet als Marke mit Vektorzeichen.
3. **Schwebendes Menü** — erscheint über einer Auswahl, sechs Schalter, dazu ein
   Eingabefeld für die Linkadresse.
4. **Leseansicht der Beschreibung** — Klick schaltet auf das Feld, Verlassen
   speichert und schaltet zurück.
5. **Kommentarnummer** — `#1`, `#2`, `#3` in der Kopfzeile jedes Kommentars.
6. **Verweis auf einen Kommentar** — ein Rautenschalter kopiert eine Adresse;
   wird sie eingefügt, entsteht eine Marke „Eintrag *Name* · Kommentar #n", und
   ein Klick springt hin und lässt die Zeile aufleuchten.
7. **Zitieren** — ganzer Kommentar über die Kopfzeile, Ausschnitt über das
   schwebende Menü.

---

## 3. Was übernommen wird

| | was | warum |
|---|---|---|
| **Ü1** | **Markdown als Auszeichnung**, nicht eigene Marken | im Rohtext lesbar, vertraut, und die Datenbank bleibt Text. Punkt 44 nennt beides als Möglichkeit; der Vorbau zeigt, dass der Teilsatz reicht |
| **Ü2** | **Das Menü erscheint bei Bedarf statt dauerhaft** | eine feste Leiste über zwei Feldern kostet Platz auf jedem Bildschirm |
| **Ü3** | **Der Link mit Namen**, `[Name](Adresse)` | die rohe Adresse im dritten Bildschirmfoto ist 139 Zeichen lang und bricht über zwei Zeilen |
| **Ü4** | **Die Kommentarnummer in der Kopfzeile** | ohne sie gibt es keinen kurzen Verweis auf eine frühere Aussage |
| **Ü5** | **Der Verweis als Marke statt als Adresse** | „Eintrag *Name* · Kommentar #2" sagt, wohin es geht. Die Adresse sagt es nicht |
| **Ü6** | **Sprung und Aufleuchten am Ziel** | ein Sprung ohne Markierung lässt den Leser suchen, welche der zwölf Zeilen gemeint war |
| **Ü7** | **Zitieren ganz und ausschnittweise** | zwei verschiedene Fälle, und der zweite ist der häufigere |
| **Ü8** | **Klick in die Beschreibung schaltet auf das Feld** | Punkt 44, Frage 7. Der Vorbau beantwortet sie brauchbar |
| **Ü9** | **Ctrl+B und Ctrl+I** | kostet zwölf Zeilen und ist überall sonst so |

---

## 4. Was nicht übernommen wird

### 4.1 Eingriffe außerhalb der Sache

Sechs Änderungen passen eine Instanz an eine fremde Betriebsumgebung an
(`process.env.K_SERVICE`). **Keine davon geht mit.**

| Datei | was | Folge |
|---|---|---|
| `server.js`, `db.js` | `better-sqlite3-multiple-ciphers` → `better-sqlite3` | **die Datenbankverschlüsselung ist damit aus.** Das ist die Zusage, um derentwillen es Kriterion gibt |
| `server.js` | `script-src 'self' 'unsafe-inline'`, `frame-ancestors *`, `base-uri 'self'`, `form-action 'self'` | vier Lockerungen am Content-Security-Policy-Kopf, den 0.36.0 gerade gesetzt hat |
| `auth.js` | Cookie immer `SameSite=None; Secure; Partitioned` | der Weg über `http://<server-ip>:3100` ist damit zu |
| `auth.js` | `sessionToken()` liest beide Cookienamen | hebt die Trennung auf, an der Cookiename, Secure und HSTS je Anfrage hängen |
| `.env.example` | von 144 auf 6 Zeilen gekürzt | die Erklärung zu `ENCRYPTION_KEY` fällt weg |
| `server.js` | `app.listen(PORT, '0.0.0.0')` | Bindung an alle Adressen ohne Schalter |

### 4.2 Was der Prüfstand sofort rot machen würde

| | Befund | Beleg |
|---|---|---|
| **N1** | **`backdrop-filter: blur(12px)` am schwebenden Menü** | Die Gruppe „Kein Milchglas im Stilblatt" prüft `!/backdrop-filter/` über das ganze Stilblatt *(`test/ui_style.js`:2557)*. Zwei Zeilen des Vorbaus, und der Lauf ist rot |
| **N2** | **22 feste deutsche Texte an 25 Stellen** | „Abbrechen", „Übernehmen", „Adresse (URL) eingeben…", „Kopieren", „Listenpunkt", „Erster Punkt", „Zitat", „Link", „Eintrag", „Kommentar ", „Link-Name (z.B. Handbuch)" und elf weitere. Der Bildschirmtext-Wächter *(`test/source.js`:2361)* liest jeden String in `public/app.js` |
| **N3** | **Zehn neue Schlüssel, und die Texte stehen trotzdem fest im Code** | „Jeder Schlüssel der Sprachdatei hat einen Leser" *(3039)* |
| **N4** | **`innerHTML` mit Benutzertext** | `createCommentRefLink()` und `createCustomMarkdownLink()` setzen Markup über `innerHTML` zusammen. „Keine nackte Einsetzung in innerHTML" *(3103)* prüft jede Einsetzung einzeln, mit 27 benannten Ausnahmen |
| **N5** | **Vier feste Farbwerte** | `#f0555c`, `#3fd39a`, `rgba(22,26,32,.95)`, `rgba(255,255,255,.96)`. Die ersten beiden stehen bereits als `--red` und `--green` im Stilblatt *(`public/style.css`:55, 57)* — und dort **je Farbschema getrennt** |
| **N6** | **Zwei neue `[data-theme="light"]`-Blöcke** | Das Stilblatt hat **einen** Tokenblock für das helle Schema und **eine** benannte Ausnahme. Der Vorbau legt zwei weitere Ausnahmen an, statt Tokens zu verwenden |

### 4.3 Fehler im Bauwerk

| | Befund | was geschieht |
|---|---|---|
| **N7** | **Die Kommentarnummer ist die Anzeigeposition** *(`idx + 1`)* | Die Reihenfolge ist `pinned DESC`, dann Aufgabe, Bericht, Notiz, dann `id` *(`server.js`:2376)*. **Wer einen Kommentar anpinnt, verschiebt jede Nummer darunter.** Dasselbe beim Umstellen der Art |
| **N8** | **Der Verweis trägt die Nummer mit** *(`&cn=3`)* | Die mitgeschriebene Nummer ist der Stand vom Tag des Kopierens. Nach N7 zeigt die Marke danach eine Zahl, die am Ziel nicht mehr steht |
| **N9** | **Jede fremde Adresse mit `#/item/…?c=…` wird ein Sprung im Haus** | `parseCommentLink()` prüft die Herkunft nicht. `https://fremde.example/#/item/1?c=2` wird zur Marke „Eintrag …" und springt in die eigene Instanz |
| **N10** | **Drei globale Horcher je Zeichnung der Detailansicht** | `mouseup`, `keyup` und `selectionchange` werden in `renderDetail()` an `document` gehängt und nie abgenommen. Nach zehn geöffneten Einträgen laufen dreißig |
| **N11** | **Die Markierung mit `@` fällt weg** | Der Aufruf lautet `renderRichText(c.text, term)`. Das dritte Argument aus `splitCommentText(c.text, term, c.mentions)` ist nicht mehr dabei |
| **N12** | **`3*4 und 5*6` wird kursiv, und es gibt kein Escape** | `\*[^\*\n]+?\*` nimmt jedes Sternpaar einer Zeile. *CommonMark täte hier dasselbe — die Spezifikation erlaubt beim Stern die Auszeichnung mitten im Wort.* **Die Teilmenge aus 5.1 trägt deshalb den Unterstrich**, bei dem die Spezifikation es verbietet |
| **N13** | **Die Platzierung rechnet mit 20 Pixeln Zeilenhöhe** | `lineIdx * 20` und `window.innerWidth - 250`. Die Schriftgröße ist von 80 bis 120 Prozent einstellbar; das Menü steht dann falsch. Das erste Bildschirmfoto zeigt es über der Blocküberschrift |
| **N14** | **Speichern der Beschreibung über `setTimeout(…, 140)`** | Eine geratene Frist. Zwei Speichervorgänge können sich überholen |
| **N15** | **`ta.value = …` bei jeder Formatierung** | Der Rückgängig-Stapel des Browsers ist danach leer. Ctrl+Z nimmt die ganze Eingabe zurück |
| **N16** | **Zwei eigene Wege zur Zwischenablage** | `copyText()` *(`public/app.js`:5781)* tut das bereits, mit Rückfalltext und Übersetzung. Der Vorbau baut ihn zweimal nach, einmal mit `prompt()` |
| **N17** | **`window.item = item`** | Ein globaler Wert neben dem, den die Ansicht ohnehin hält |
| **N18** | **Fünf tote Zweige in `createCommentRefLink()`** | `state.all ?? state.alle ?? window.state.all ?? …` — Reste der Umbenennung. `state.alle` gibt es nicht mehr |
| **N19** | **Der Aufklapp-Zweig der Filterleiste wird umgebaut** | `drawFilters()` lief bisher nur beim Aufklappen. Der Grund steht als Kommentar im Bestand: `limitCloud()` misst an der ersten Marke und steigt bei Höhe null aus. Der Vorbau ruft beides bei jedem Umschalten |
| **N20** | **Kein Zeichen für „führt nach draußen"** | `[Sichere Bank](https://andere.example)` ist von `[Sichere Bank](https://bank.example)` nicht zu unterscheiden. Der Vorbau setzt die Adresse in `title`, mehr nicht |

### 4.4 Was im Vorbau fehlt

| | |
|---|---|
| **L1** | **Die Kachelvorschau** nimmt 40 Zeichen des Rohtexts *(`public/app.js`:985)*. Marken stehen danach sichtbar in der Übersicht |
| **L2** | **Die eingeklappte Blockkopfzeile** zeigt dieselben 40 Zeichen |
| **L3** | **Der Trefferausschnitt der Suche** schneidet auf 56 Zeichen mit 4 Zeichen Vorlauf *(`server.js`:2813)*. Ein halbes `**` steht dann da |
| **L4** | **Die Exportdatei** trägt Formatnummer 17 unverändert |
| **L5** | **`#nd` im Anlegen-Dialog** ist nicht angefasst, schreibt aber in dieselbe Spalte |
| **L6** | **Das Menü ist nur über eine Auswahl erreichbar.** Wer nie Text markiert, erfährt nicht, dass es Auszeichnung gibt |
| **L7** | **Kein Verhalten für Finger.** Auf einem Berührungsbildschirm liegt das Menü über den Anfassern der Auswahl |
| **L8** | **Bestandstext ist nicht gemessen.** Wie viele vorhandene Kommentare nach der Änderung anders aussehen, steht nirgends |

> **Punkt 44 nennt die Mailbenachrichtigung als vierte Stelle, die nur Text
> kann. Das trifft nicht zu.** `mail.js` kennt vier Briefe — Einladung,
> Rücksetzung, Bestätigung, Probe. Keiner trägt Kommentartext. *Die Zahl der
> betroffenen Stellen fällt von vier auf drei:* **Kachelvorschau,
> Trefferausschnitt, Exportdatei.**

---

## 5. Die Entscheidungen

### 5.1 Die Auszeichnung — eine Teilmenge von CommonMark

**Es wird nichts erfunden.** Die Auszeichnung ist eine Teilmenge von CommonMark,
und innerhalb der Teilmenge gilt die Spezifikation und keine eigene Regel.
*Entscheidung D, geschärft durch die Nachfrage des Betreibers vom selben Tag
(Entscheidung E).*

> **DIE EINE REGEL, AUS DER ALLES FOLGT.** *Für jeden Text gilt: Kriterion
> zeichnet entweder das, was CommonMark zeichnet — oder gewöhnlichen Text.*
> **Nie etwas Drittes.**
>
> *Ein Text aus Kriterion liest sich damit in jedem Markdown-Leser richtig. Ein
> Text von anderswo wird hier richtig ausgezeichnet oder gar nicht — aber nie
> falsch.*

#### Was in der Teilmenge liegt

| Zeichen | Wirkung | Abschnitt der Spezifikation |
|---|---|---|
| `**Text**` | `<strong>` | Emphasis and strong emphasis |
| `_Text_` | `<em>` | dieselbe Stelle |
| `[Name](Ziel)` | Link | Inline links |
| `> ` am Zeilenanfang | `<blockquote>` | Block quotes |
| `- ` am Zeilenanfang | `<ul><li>` | List items |
| `1. ` am Zeilenanfang | `<ol><li>` | List items |
| `` `Text` `` | `<code>` | Code spans |
| `\` vor einem ASCII-Satzzeichen | das Zeichen selbst | Backslash escapes |

**Die Flankenregeln der Spezifikation gelten unverändert:** ein öffnendes
Zeichen ist linksflankierend, ein schließendes rechtsflankierend. `** fett **`
ist deshalb kein Fettdruck, und `datei_name_alt` keine Kursive — **das ist
CommonMark und keine Zutat.**

**Der Code-Abschnitt trägt sich selbst:** innerhalb zweier Backticks gilt keine
weitere Auszeichnung. *Wer `**` oder `_` wörtlich schreiben will, braucht damit
keinen Backslash vor jedem Zeichen.* **Er ist zugleich der Grund, ihn
mitzunehmen** — in einem Bewertungsarchiv stehen Fehlercodes, Teilenummern,
Dateinamen und Einstellungen im Fließtext, und `--mono` steht im Stilblatt
schon da *(`public/style.css`:132; vier Regeln nutzen es bereits)*.

#### Was diese Runde nicht mitnimmt

> **EINE TEILMENGE WÄCHST GEFAHRLOS, SIE SCHRUMPFT NICHT.** *Kommt etwas in
> einer späteren Runde dazu, wird aus Text eine Auszeichnung — sichtbar und
> harmlos. Nähme man es später weg, verschwände eine Auszeichnung, die jemand
> gesetzt hat.* **Deshalb beginnt die Teilmenge klein.**

**Das Menü und die Tastenkürzel schreiben `_` für kursiv**, nicht `*`.

| was | warum nicht jetzt | später? |
|---|---|---|
| **`*kursiv*` mit einem Stern** | **`3*4 und 5*6` bliebe dann nicht Text.** *In CommonMark wäre es kursiv: die Spezifikation erlaubt beim Stern die Auszeichnung mitten im Wort, beim Unterstrich nicht.* Genau deshalb trägt die Teilmenge den Unterstrich | *erst, wenn BA 0 eine Null meldet* |
| `* Punkt` und `+ Punkt` als Aufzählung | ein alter Text mit `* ` am Zeilenanfang würde zur Liste | ja, mit derselben Bedingung |
| **Tabellen** *(GFM)* | **die teuerste Bauform von allen:** eine eigene Zeilenebene, eine Ausrichtungszeile, und auf dem Telefon ein Rollbalken je Tabelle. *Für gemessene Werte hat Kriterion Kriterien, Testtage und Potenzial* | **ja, eigene Runde.** Der naheliegendste Zuwachs für ein Bewertungsarchiv |
| **Abhakliste** `- [ ]` *(GFM)* | **sie kollidiert mit dem, was es gibt:** ein Kommentar trägt schon eine Art — Notiz, Bericht, Aufgabe, erledigt. *Und ein Haken, den man setzen kann, müsste in den Text zurückgeschrieben werden* | eigene Runde, und erst nach einer Entscheidung über das Verhältnis zur Kommentarart |
| **Codeblock** in drei Backticks | für einen Protokollauszug plausibel. Kostet eine Zeilenebene und eine Regel gegen den Überlauf | ja, klein |
| **Durchstreichen** `~~Text~~` *(GFM)* | kleiner Nutzen neben der Kommentarart „erledigt" | vielleicht |
| **Überschriften** `# `, Trennlinie `---` | in einem Kommentar sinnlos, in der Beschreibung selten. Der Block trägt seine Überschrift schon | vielleicht, nur für die Beschreibung |
| verschachtelte Listen | verlangen einen Einzugsbegriff und verdreifachen die Fälle | ja, zusammen mit den Tabellen |

#### Was nie dazukommt

| was | warum |
|---|---|
| **Bilder** `![Text](Adresse)` | **der Content-Security-Policy-Kopf verbietet es:** `img-src 'self' data: blob:` *(`server.js`:343)*. Eine fremde Adresse ergäbe ein kaputtes Bild — und wäre sie erlaubt, verriete jedes geöffnete Blatt die Adresse des Lesers an einen fremden Server. *Kriterion hat einen eigenen Weg für Bilder: einfügen mit Strg+V* |
| **Rohes HTML** | CommonMark erlaubt es, Kriterion nicht. **Das ist die einzige Stelle, an der die Teilmengenregel bewusst enger ist als die Spezifikation** — und der Grund ist derselbe, aus dem der Knotenbau keinen `innerHTML` kennt |
| **Adressen in spitzen Klammern** `<https://…>` | die Zerlegung erkennt eine nackte Adresse längst |
| **Verweisdefinitionen** `[Text][1]` | zwei Stellen im Text für einen Link. In einem Kommentar von vier Zeilen ohne Nutzen |

#### Die eine benannte Abweichung

**Ein einzelner Zeilenumbruch bleibt ein Umbruch.** CommonMark macht daraus ein
Leerzeichen.

*Der Grund steht im Bestand:* `.cmt-body` trägt `white-space: pre-wrap`
*(`public/style.css`:1172)*. **Folgte die Runde hier der Spezifikation, sähe
jeder vorhandene Kommentar anders aus** — auch jeder, der gar keine
Auszeichnung trägt. Kommentarfelder verbreiteter Dienste halten es ebenso.

**Es ist die einzige Abweichung, und sie steht hier namentlich.**

### 5.2 Wo geparst wird

**Im Browser.** Der Server speichert und liefert Text. Er bekommt eine einzige
neue Funktion: sie entfernt Marken, für den Trefferausschnitt.

### 5.3 Die Bauform des Lesers

Vier Schichten, und die beiden innersten sind die von heute:

```
Rohtext
  └─ Zeilenebene    Zitat, Aufzählung, Nummerierung, Absatz
      └─ Inline     Escape, Link mit Namen, fett, kursiv
          └─ splitCommentText()   Adresse, @-Markierung, Suchbegriff
              └─ pieceNode()      textContent oder <mark>
```

**`splitCommentText()`, `buildCommentNodes()` und `pieceNode()` werden nicht
verändert.** Die neuen Schichten liegen darüber und reichen `term` und `marks`
durch. Damit bleiben Adressen, Markierungen und Suchtreffer, wie sie sind, und
N11 entsteht nicht.

**Kein `innerHTML` auf diesem Weg**, auch nicht für die Vektorzeichen: ein
Symbol geht über einen Träger, der einmal gebaut und danach geklont wird.

*Die Zeilen- und die Inline-Ebene setzen die Spezifikation um, sie deuten sie
nicht. Wo ein Fall nicht in der Teilmenge liegt, entsteht Text — und nicht ein
eigener Knoten.*

### 5.4 Die Spalte bleibt

**Kein Merkmal an `comments.text` und `items.description`, keine
Schemaänderung.** *Entscheidung C.* Die Regeln aus 5.1 sind so gewählt, dass
Bestandstext sie nicht zufällig trägt. Was ein alter Text an Zeilenanfängen mit
`- ` oder `> ` hat, war schon vorher als Aufzählung oder Zitat gemeint.

### 5.5 Die Kommentarnummer

**Die Nummer ist die Stellung in der zeitlichen Reihenfolge, nach `id`, nicht
nach der Anzeige.** *Entscheidung C.* Anpinnen und das Umstellen der Art bewegen
sie damit nicht.

**Eine gelöschte Zeile verschiebt die Nummern danach.** Das wird hingenommen;
die Alternative wäre eine Spalte `seq`, eine Schemaänderung und ein Eintrag in
`REQUIRED_COLUMNS`, der jeder bestehenden Datenbank einen Warnkasten einträgt.

### 5.6 Der Verweis

**Die Adresse trägt nur die Nummer des Kommentars:**
`#/item/<id>?c=<kommentar>`. **Kein `cn`.** Die Zahl in der Marke wird beim
Zeichnen ermittelt und ist damit immer die, die am Ziel steht.

Der Rautenschalter kopiert die **vollständige Adresse** über `copyText()` — sie
soll auch in einer Mail funktionieren.

**Beim Zeichnen wird die Herkunft geprüft.** Eine Adresse mit fremdem Ursprung
bleibt ein gewöhnlicher Link nach draußen. Damit fällt N9.

Für einen Verweis auf einen **anderen** Eintrag kennt der Browser den Titel aus
`state`, die Nummer aber nicht. Dafür **eine Route**:

```
GET /api/comment-refs?ids=12,47,93
→ [{ id, itemId, itemTitle, number }, …]
```

Ein Aufruf je Zeichnung, gesammelt über alle Kommentare und die Beschreibung,
das Ergebnis in einer Map. Die Route achtet auf dieselbe Leseschranke wie
`GET /api/items/:id`. Ein Verweis auf etwas, das der Leser nicht sehen darf,
bleibt ein einfacher Link ohne Titel.

### 5.7 Die drei Stellen, die nur Text können

**Eine Aufgabe, zwei Fassungen, eine gemeinsame Falltabelle.**

| Stelle | Datei | was sie bekommt |
|---|---|---|
| Kachelvorschau, 40 Zeichen | `public/app.js`:985 | Text ohne Marken |
| Eingeklappte Blockkopfzeile | `public/app.js`:985 | Text ohne Marken |
| Trefferausschnitt, 56 Zeichen | `server.js`:2813 | **Marken vor dem Schneiden heraus** |

Die Fassung im Browser und die im Server werden gegen **dieselbe Tabelle von
Fällen** geprüft. Läuft eine auseinander, ist der Prüfstand rot.

### 5.8 Der Export

**Formatnummer 17 → 18.** Die Untergrenze bleibt 14. **Die Nummer ist ein
Hinweis, keine Schranke:** eine 0.38.0-Datei kommt in eine ältere Fassung
herein und zeigt die Marken dort als Text. Die Nummer sagt dem Leser, woran es
liegt.

### 5.9 Das Menü

**Es hängt über der oberen Kante des Feldes, nicht am Schreibzeiger.** Es
erscheint, sobald ein Feld den Fokus hat, und verschwindet beim Verlassen.

Das löst fünf Dinge auf einmal:

- **N13 fällt weg** — es wird nichts geraten und nichts an der Zeilenhöhe
  gerechnet.
- **L6 fällt weg** — wer schreibt, sieht die Schalter, ohne erst zu markieren.
- **L7 fällt weg** — es liegt nie über den Anfassern einer Auswahl.
- **Ü2 bleibt** — es kostet keinen Platz, solange niemand schreibt.
- Auf schmalen Bildschirmen umbricht es in zwei Zeilen, statt aus dem Bild zu
  laufen.

**Im Lesemodus gibt es keinen Fokus und damit keine Kante.** Dort — Auswahl in
einem Kommentar oder in der Beschreibungsvorschau — erscheint es an der Auswahl
mit den zwei Schaltern „Zitieren" und „Kopieren".

**Die Horcher werden einmal gesetzt, nicht je Zeichnung** (N10).

### 5.10 Die Beschreibung

**Zwei Wege in den Schreibmodus:**

1. Ein Stift in der Blockkopfzeile — dasselbe Zeichen, das der Kommentar schon
   hat (`.mact.ed`).
2. Ein Klick in den Text, außerhalb eines Links.

Die Vorschau ist ein Bereich und **kein `role="button"`** — sie enthält Links,
und ein Schalter mit Links darin ist für ein Vorleseprogramm nicht auflösbar.

**Escape verwirft und stellt den zuletzt gespeicherten Text her.** Verlassen
speichert, wie heute. Statt der Frist aus N14 entscheidet `relatedTarget` des
`focusout`: liegt das Ziel im Menü, wird nicht gespeichert.

### 5.11 Rückgängig

**`document.execCommand('insertText')`**, mit Rückfall auf `ta.value` dort, wo
es nicht trägt. Damit bleibt Ctrl+Z brauchbar (N15).

---

## 6. Die Wächter, die 0.37.0 aufgestellt hat

**0.37.0 hat mehrere Zahlen festgenagelt, und drei davon treffen diese Runde
unmittelbar.** *Ein Wächter mit einer festen Zahl ist eine Zusage; sie
nachzuziehen ist Arbeit dieser Runde und kein Umgehen.*

| Wächter | Zahl heute | was 0.38.0 damit tut |
|---|---|---|
| **`test/source.js`:2814** — „Und es stehen genau 1638 Regelzeilen da" | **genau** 1.638 | **die Zahl steigt.** ~370 neue Regelzeilen; die neue Zahl wird am fertigen Stand gemessen und eingetragen. *Sie steigt, weil Regeln dazukommen, nicht weil Regeln verschwinden* |
| **`test/source.js`:2814** — „Genau acht Blöcke gehen über drei Zeilen" | **genau** 8 | **bleibt 8.** Jeder neue Kommentarblock hält die Drei-Zeilen-Regel ein |
| **`test/source.js`:2580** — „Der Wächter sieht beide Seiten", `rrRoutes.length === 102` | **102** | **wird 103.** Die Route aus 5.6 |
| **`test/source.js`:2814** — Datei höchstens 200.000 Bytes | 167.501 | **bleibt darunter.** ~12.000 Bytes kommen dazu, macht ~180.000 |
| **`test/source.js`:2814** — höchstens 110.000 Bytes in Kommentarblöcken | 78.771 | bleibt darunter |
| **`test/source.js`:2026** — Nummernlatte `public/app.js` | **3**, zusammen **5** | **bleibt.** *Die Falle sind die neuen Vektorzeichen: eine SVG-Pfadangabe wie `-1.8.3l` zählt der Wächter als Versionsnummer.* Jeder neue Pfad wird daraufhin gelesen |
| **`test/source.js`:2677** — kein Papierverweis geht mit hinaus | 0 | bleibt 0 |
| **`test/source.js`:957** — der Quelltext spricht Englisch | 1.000+ Wortpaare | **jeder neue Bezeichner ist englisch.** Der Wächter zerlegt jeden Namen und schlägt jedes Stück nach |

### Der Wächter über die Abfrageparameter — und seine Lücke

**`test/source.js`:2534 verlangt: jeder Parameter, den der Browser baut, wird
am Server gelesen.** Der Leser greift auf `[?&]name=` im ganzen Quelltext von
`public/app.js` — **auch in einer Adresse, die nur im Browser lebt.**

**Dass `?q=` aus `entryAddress()` heute durchgeht, ist Zufall:** der Server
liest `req.query.q` in der Volltextsuche *(`server.js`:2886)*, und derselbe
Name steht in der Kacheladresse.

**`?c=` aus 5.6 hätte diesen Zufall nicht** und machte den Wächter rot. **Die
Antwort ist nicht eine zweite Ausnahme neben `v`, sondern eine Trennung:** eine
Adresse, die mit `#/` beginnt, gehört dem Browser und wird gegen die Leser des
Browsers geprüft; alles andere weiter gegen `req.query`.

> **Damit schließt diese Runde die Lücke, durch die `?q=` seit 0.35.0 nur durch
> Zufall grün ist.** *Der Wächter steht danach schärfer da als vorher.*

---

## 7. Der Aufwand

### Geschätzte Zeilen

*Neue und geänderte Zeilen ohne Leerraum, abgeleitet aus dem Vorbau (890 Zeilen
`public/app.js`, 585 `public/style.css`) zuzüglich dessen, was dort fehlt —
Übersetzung, Route, Marken-Entferner, Wächter.*

| Datei | Zeilen | wovon |
|---|---:|---|
| `public/app.js` | **~980** | Leser 280, Menü 180, Verweis 200, Link 110, Beschreibung 90, Zitieren 80, Rest 40 |
| `public/style.css` | **~375** | Menü 160, Verweis- und Linkmarke 120, Vorschau 70, Zitat, Liste und Code 25 |
| `server.js` | ~65 | Route 35, Marken heraus 30 |
| drei Sprachdateien | ~84 | 28 Schlüssel je Datei |
| **ausgeliefert zusammen** | **~1.500** | |
| `test/ui_entry.js`, `test/ui_style.js`, `test/source.js` | ~740 | davon ~140 die Falltabelle aus der Spezifikation und ~40 die nachgezogenen Zahlen aus Abschnitt 6 |
| `counterproof.js` | ~120 | 15 Rückbauten |
| `tools/` | ~120 | das Messwerkzeug aus BA 0 |
| Papiere | ~380 | Änderungsprotokoll, CHANGELOG, Fahrplan, README, Handbuch |
| **insgesamt** | **~2.830** | |

### Im Vergleich zu den letzten Runden

| | ausgeliefert | insgesamt |
|---|---|---|
| 0.35.2 | 277 neu, 186 entfernt | 1.129 / 463 |
| 0.36.0 | 293 neu, 123 entfernt | 1.128 / 365 |
| 0.37.0 | 1.647 neu, 2.801 entfernt | — |
| **0.38.0, geschätzt** | **~1.500 neu, ~40 entfernt** | **~2.830** |

**0.37.0 war größer, hat aber fast nur Kommentar bewegt.** *Diese Runde ist die
größte Runde an neuem Code seit 0.34.0.*

### Was sie an Größe kostet

| | gzip |
|---|---:|
| `public/app.js` | +13,9 KB *(14,2 Bytes je Zeile)* |
| `public/style.css` | +6,6 KB *(17,5 Bytes je Zeile)* |
| drei Sprachdateien | +1,8 KB |
| **zusammen** | **+22,3 KB**, also **+8,8 Prozent** auf 253.736 |

**Zum Vergleich: Quill kostet 62.732 Bytes, also 24,7 Prozent.** `marked`
allein kostet 13.891 Bytes und erledigt davon ein Drittel: den Leser, aber
weder das Menü noch die Leseansicht der Beschreibung noch den Verweis.

*Nach der Runde liegt die Auslieferung bei rund 276.000 Bytes — etwa dort, wo
sie vor 0.37.0 stand.*

### Was sie an Zeit kostet

**Zwölf Bauabschnitte, je ein voller Lauf: rund 62 Minuten reine
Prüfstandszeit**, bei 308 bis 324 Sekunden je Lauf. Dazu der Gegenprobenlauf.

**Die Zahl der Prüfungen steigt von 7.070 auf geschätzt 7.140 bis 7.170.**

### Wo der Aufwand sitzt

| | |
|---|---|
| **BA 1** | der Leser. Die Spezifikation ist an den Flankenregeln genauer, als sie aussieht. Er ist ohne Oberfläche prüfbar, und das hält ihn beherrschbar |
| **BA 10** | die Wächter. Der zweitgrößte Posten, weil jede Regel einen Fall und einen Gegenfall braucht |
| **BA 5** | der einzige Abschnitt, der eine Route anlegt |
| **BA 9** | klein, aber leicht zu vergessen: drei feste Zahlen aus 0.37.0 sind nachzuziehen |

---

## 8. Bauabschnitte

### BA 0 — Messen, bevor etwas gebaut wird

Ein Werkzeug in `tools/` liest eine Datenbank und zählt, wie viele Kommentare
und Beschreibungen nach den Regeln aus 5.1 anders aussehen würden — je Regel
getrennt, mit der Nummer des Eintrags.

**Die Zahl ändert die Entscheidung nicht** *(Entscheidung D steht)*. **Sie geht
in das Änderungsprotokoll**, damit der Betreiber die betroffenen Texte ansehen
kann. *Findet das Werkzeug nichts, steht die Null da und belegt 5.4.*

### BA 1 — Die Auszeichnung und ihr Leser

`public/app.js`: die Zeilenebene, die Inline-Ebene, der Code-Abschnitt, das
Escape und die Flankenregeln der Spezifikation. `splitCommentText()`, `buildCommentNodes()`
und `pieceNode()` bleiben unverändert.

**Gebaut wird gegen die Spezifikation und nicht gegen eine Beschreibung
davon.** *Der Abschnitt endet, wenn die Fälle aus BA 10 stehen.*

**Der Kommentar bekommt den neuen Leser, die Beschreibung noch nicht** — die hat
bis BA 2 keine Leseansicht.

### BA 2 — Die Leseansicht der Beschreibung

Vorschau, Stift in der Blockkopfzeile, Klick in den Text, Escape, Speichern
über `focusout`. `#nd` im Anlegen-Dialog bleibt ein einfaches Feld; was dort
getippt wird, zeigt die Beschreibung danach ausgezeichnet.

### BA 3 — Das Menü

Eines im Dokument, Horcher einmal gesetzt. Über der Feldkante im Schreibmodus,
an der Auswahl im Lesemodus. Ctrl+B und Ctrl+I. Kein `backdrop-filter`, alle
Farben über Tokens, kein neuer `[data-theme="light"]`-Block.

### BA 4 — Der Link mit Namen

`[Name](Ziel)` als vierte Inline-Sorte. Das Eingabefeld im Menü: ist eine
Adresse markiert, wird nach dem Namen gefragt, sonst nach der Adresse. Ein Ziel
nach draußen bekommt ein Zeichen, das es als solches ausweist (N20), und
`rel="noopener noreferrer"` wie heute.

### BA 5 — Die Nummer und der Verweis

Nummer nach 5.5. Rautenschalter über `copyText()`. Die Route
`GET /api/comment-refs`. Herkunftsprüfung. Der Parameter `?c=` in
`renderDetail()`, Sprung und Aufleuchten am Ziel.

**Dazu die Trennung im Wächter über die Abfrageparameter** — Abschnitt 6.

### BA 6 — Zitieren

Ganzer Kommentar über die Kopfzeile, Ausschnitt über das Menü im Lesemodus. Die
Verfasserzeile über einen Schlüssel, nicht über einen festen Text.

### BA 7 — Die drei Textstellen und der Export

Marken heraus bei Kachelvorschau, Blockkopfzeile und Trefferausschnitt.
Formatnummer 17 → 18.

### BA 8 — Die Sprachdateien

Alle Beschriftungen, Platzhalter und Meldungen in `de.json`, `en.json`,
`tr.json`. **Kein fester Text in `public/app.js`** (N2, N3).

*Geschätzt 26 bis 30 Schlüssel. Die genaue Zahl steht am Ende im
Änderungsprotokoll.*

### BA 9 — Die festen Zahlen aus 0.37.0 nachziehen

Die Regelzeilen des Stilblatts, die Routenzahl, und was der Lauf sonst an
festen Zahlen meldet. **Jede neue Zahl steht mit ihrem Grund im Kommentar
daneben** — so, wie 0.37.0 es für die Gleichlautsummen getan hat.

### BA 10 — Prüfstand und Gegenproben

Neue Gruppen in `test/ui_entry.js` und `test/ui_style.js`:

- **die Beispiele der Spezifikation zu den sieben Bauformen** — jedes muss
  entweder so gezeichnet werden wie dort oder als gewöhnlicher Text, nie
  anders. *Die Fälle stehen als Tabelle im Prüfmodul, mit der Nummer des
  Beispiels und der Fassung der Spezifikation daneben;* **geschätzt 140 Fälle,
  und keiner davon ist ausgedacht.**
- die Zeichen, die nicht in der Teilmenge liegen, bleiben Text —
  `*kursiv*`, `* Punkt`, `# Überschrift`, `---`,
- die eine benannte Abweichung: ein einzelner Zeilenumbruch bleibt ein Umbruch,
- der Bestandstext aus BA 0 bleibt unverändert,
- Adresse, `@`-Markierung und Suchtreffer überstehen die neuen Schichten,
- die Nummer bewegt sich nicht beim Anpinnen und beim Umstellen der Art,
- eine fremde Adresse wird kein Sprung im Haus,
- die beiden Fassungen von „Marken heraus" liefern dasselbe,
- das Menü steht auf 360 Pixeln Breite im Bild,
- kein neuer Kommentarblock geht über drei Zeilen.

Gegenproben über die Herkunftsprüfung, über die Nummer, über die
Übereinstimmung der beiden Marken-Entferner und über die Teilmengenregel aus
5.1 — ein gestellter Fall, der weder die Zeichnung der Spezifikation noch
gewöhnlichen Text liefert, muss den Lauf rot machen.

### BA 11 — Papiere, und die Doppelung in der README

Änderungsprotokoll 0.38.0, CHANGELOG, Fahrplanzeile auf GEBAUT, Handbuch um die
Auszeichnung ergänzt, **Punkt 44 zu**.

**Dazu die Doppelung in der README** *(Entscheidung B)*: `README.md`:255–272
„Eine neuere Version über eine bestehende einspielen" und `README.md`:341–350
„Wenn eine Version die Datenbank anfasst" tragen dieselben drei Sachverhalte.
*0.37.0 hat den Befund gestellt und die Umstellung ausdrücklich nicht gemacht
(F4: Urteil ja, Umstellung nein). Diese Runde fasst die README ohnehin an.*

---

## 9. Zusagen an den Prüfstand

1. **Kein bestehender Bildschirmtext ändert sich**, außer den neuen
   Beschriftungen.
2. **Kriterion zeichnet, was CommonMark zeichnet — oder gewöhnlichen Text.**
   *Nie etwas Drittes.* Belegt an den Beispielen der Spezifikation, mit der
   einen benannten Abweichung aus 5.1.
3. **Adresse, `@`-Markierung und Suchtreffer arbeiten wie vorher.** Die drei
   Sorten der Zerlegung sind unverändert.
4. **Kein `backdrop-filter`.** Die Gruppe „Kein Milchglas im Stilblatt" bleibt
   grün.
5. **Kein fester deutscher Text in `public/app.js`.** Der Bildschirmtext-Wächter
   bleibt grün.
6. **Kein Benutzertext über `innerHTML`.** Die Zahl 172 steigt nicht, und die
   Ausnahmeliste der 27 Namen wächst nicht.
7. **Keine neue Versionsnummer und kein Papierverweis** in einer ausgelieferten
   Datei. Die drei Latten aus 0.37.0 bleiben stehen — **auch gegen die
   Pfadangaben der neuen Vektorzeichen.**
8. **Kein neuer Kommentarblock geht über drei Zeilen**, weder in
   `public/app.js` noch in `public/style.css`.
9. **Jeder neue Bezeichner ist englisch.**
10. **Keine Schemaänderung.** `REQUIRED_COLUMNS` bleibt unberührt.
11. **Alle drei Sprachdateien tragen jeden neuen Schlüssel.**
12. **Der Wächter über die Abfrageparameter steht danach schärfer da**, nicht
    mit einer Ausnahme mehr.
13. Gegenprobenlauf über die neuen Wächter, **0 stumm**.
14. Der Fingerprint ändert sich — erwartet, an `public/app.js`,
    `public/style.css`, `server.js` und den drei Sprachdateien.

---

## 10. Die Fragetafel — vor der ersten Zeile entschieden

| | Frage | Entscheidung | Herkunft |
|---|---|---|---|
| **F1** | Welche Auszeichnung? | **eine Teilmenge von CommonMark**, dazu ein Menü, das die Marken schreibt. Innerhalb der Teilmenge gilt die Spezifikation | Punkt 44, Frage 1 · Entscheidung E |
| **F2** | Wo wird geparst? | im Browser. Der Server bekommt nur den Marken-Entferner | Punkt 44, Frage 2 |
| **F3** | Braucht die Spalte ein Merkmal? | **nein.** Vier Regeln halten Bestandstext heraus | Punkt 44, Frage 3 · Entscheidung C |
| **F4** | Was trägt die Exportdatei? | Formatnummer **17 → 18**, Untergrenze bleibt 14 | Punkt 44, Frage 4 |
| **F5** | Was sieht die Suche? | unverändert, sie liest den Rohtext. Der Trefferausschnitt bekommt die Marken vorher heraus | Punkt 44, Frage 5 |
| **F6** | Was sehen die Stellen, die nur Text können? | **drei, nicht vier.** Die Mailbenachrichtigung trägt keinen Kommentartext | Punkt 44, Frage 6 |
| **F7** | Wie schaltet die Beschreibung um? | Stift in der Blockkopfzeile **und** Klick in den Text. Escape verwirft, Verlassen speichert | Punkt 44, Frage 7 |
| **F8** | Kursiv mit `*` oder `_`? | **`_`.** Bei ihm verbietet die Spezifikation selbst die Auszeichnung mitten im Wort, beim Stern erlaubt sie sie. Damit bleibt `3*4 und 5*6` Text, **ohne dass eine eigene Regel nötig wäre** | Entscheidung E |
| **F9** | Wie stabil ist die Kommentarnummer? | **zeitliche Reihenfolge nach `id`**, keine Schemaänderung | Entscheidung C |
| **F10** | Bekommt der Verweis auf einen fremden Eintrag eine eigene Route? | **ja**, `GET /api/comment-refs`. Ohne sie steht in der Marke eine veraltete Zahl oder gar keine | 5.6 |
| **F11** | Wie kommt `?c=` am Wächter über die Abfrageparameter vorbei? | **gar nicht** — der Wächter bekommt eine Trennung zwischen Browseradresse und Anfrage | Abschnitt 6 |
| **F12** | Trägt `#nd` im Anlegen-Dialog auch das Menü? | **nein.** Ein Dialogfeld für zwei Sätze. Was dort an Marken getippt wird, wirkt in der Beschreibung trotzdem | 5.10 |
| **F13** | Vollständige oder kurze Adresse im Rautenschalter? | **die vollständige.** Sie funktioniert auch in einer Mail; beim Einfügen in ein Feld wird sie ohnehin zur Marke | 5.6 |
| **F14** | Verschachtelte Listen? | **nein**, nicht in der Teilmenge. Sie verlangen einen Einzugsbegriff auf der Zeilenebene und verdreifachen die Fälle | 5.1 |
| **F17** | Was ist mit dem einzelnen Zeilenumbruch? | **er bleibt ein Umbruch.** Die einzige benannte Abweichung von der Spezifikation; der Grund ist `white-space: pre-wrap` im Bestand | 5.1 |
| **F18** | Woher kommen die Prüffälle? | **aus der Spezifikation.** Ihre Beispiele zu den acht Bauformen, mit Nummer und Fassung daneben. Geschätzt 140, und keiner davon ist ausgedacht | BA 10 |
| **F19** | Kommt Code in Backticks mit? | **ja.** Er kostet wenig, `--mono` steht im Stilblatt schon, und er ist der bequeme Ausweg für jeden, der `**` wörtlich schreiben will | 5.1 |
| **F20** | Was ist mit Tabellen, Abhaklisten, Codeblöcken? | **nicht in dieser Runde**, und jede mit ihrem Grund in 5.1. Die Tabelle ist der naheliegendste Zuwachs und bekommt eine eigene Runde | 5.1 |
| **F21** | Kommen Bilder über `![…](…)` dazu? | **nie.** `img-src 'self' data: blob:` verbietet die fremde Adresse, und eine erlaubte verriete die Adresse jedes Lesers an einen fremden Server | 5.1 |
| **F15** | Was, wenn BA 0 viele betroffene Bestandstexte findet? | **die Zahl geht ins Protokoll, die Runde läuft weiter.** Die Teilmenge aus 5.1 nimmt den einzigen realistischen Fall ohnehin heraus | Entscheidung E |
| **F16** | Bleibt der Umbau der Filterleiste aus dem Vorbau draußen? | **ja** (N19). Er gehört nicht zur Sache, und der Grund für die heutige Form steht als Kommentar im Bestand | 4.3 |

---

## 11. Was verworfen wird

| | was | warum |
|---|---|---|
| **V1** | **Quill, Trix, EasyMDE, `marked`** — *und jeder andere fertige Editor* | Punkt 44 hat es gemessen: die ersten drei erzeugen HTML und setzen es über `innerHTML` ein. Das ist genau der Weg, den der Kommentarbereich nicht geht. `marked` ist nur ein Parser, erzeugt ebenfalls HTML und kostet 13.891 Bytes gezippt für ein Drittel der Arbeit |
| **V2** | **HTML in der Datenbank** | Dann müsste jede lesende Stelle es wieder entfernen — Suche, Trefferausschnitt, Kachelvorschau, Export |
| **V3** | **Parsen auf dem Server** | Der Server müsste Knoten oder Markup liefern. Heute liefert er Text, und das ist die billigere Hälfte |
| **V4** | **Eine Spalte `format` oder `seq`** | Eine Schemaänderung trägt einen Eintrag in `REQUIRED_COLUMNS` und damit einen Warnkasten in jede bestehende Datenbank. Entscheidung C |
| **V5** | **Der Parameter `cn` in der Verweisadresse** | Er schreibt eine Zahl fest, die sich bewegt (N7, N8) |
| **V6** | **Eine zweite Ausnahme neben `v` im Parameterwächter** | Eine Ausnahme schwächt den Wächter. Die Trennung aus Abschnitt 6 stärkt ihn |
| **V7** | **Das Menü am Schreibzeiger** | Verlangt eine gemessene Zeilenhöhe bei einstellbarer Schriftgröße, liegt auf Berührungsbildschirmen über den Anfassern der Auswahl und ist ohne Markierung nicht auffindbar |
| **V8** | **Eine feste Leiste über jedem Feld** | Kostet Platz auf jedem Bildschirm, auch wenn niemand schreibt. 5.9 hat beide Vorteile |
| **V9** | **Die Anpassungen an eine fremde Betriebsumgebung** | Abschnitt 4.1. Die erste davon schaltet die Datenbankverschlüsselung ab |
| **V10** | **Auszeichnung im Ablehnungsgrund** | `#rej-reason` ist ein einzeiliges Feld mit 200 Zeichen. Eine Zeilenebene hat dort keinen Sinn |
| **V11** | **Eigene Auszeichnungsregeln** | *Der erste Entwurf dieses Auftrags trug vier selbst geschriebene Regeln, darunter „ein Stern zählt nicht, wenn links und rechts ein Buchstabe oder eine Ziffer steht".* **Sie hätten dasselbe geleistet und wären erfunden gewesen.** Die Teilmenge aus 5.1 kommt ohne sie aus: was schützen sollte, leistet die Wahl des Zeichens |
| **V12** | **Die ganze Spezifikation** | Überschriften, Tabellen, Bilder, Code in Backticks und verschachtelte Listen kosten Fälle und lösen keine Frage aus Punkt 44. Die Teilmenge wächst später gefahrlos |

---

## 12. Was die Runde ausdrücklich nicht anfasst

| | was | wohin es gehört |
|---|---|---|
| **1** | **„Auffangnetz" und „Grundausstattung"** stehen in `CLAUDE.md` unter „nicht verwenden", sind aber Abschnittsnamen in `db.js` und stecken in Dutzenden Prüf- und Rückbaunamen | **eine eigene Umbenennungsrunde.** *Entscheidung B.* Sie hier zu ersetzen hieße, den Prüfstand umzubenennen |
| **2** | **Punkt 42** — ob die gemessenen Zahlen aus den Kommentaren des Stilblatts in ein eigenes Papier wandern | Entscheidung des Betreibers, offen. *0.38.0 legt ~370 neue Regelzeilen an und ändert den Anteil; die Frage bleibt dieselbe* |
| **3** | **Punkt 38** — die Kachel zählt in Worten, der Blockkopf in Zeichen | eigene Runde. *Die Kachelvorschau wird in BA 7 angefasst, aber an der Beschreibung und nicht an der Zählzeile* |
| **4** | **Punkt 27** — der Aufräumer des Prüfstands wird auf mehreren Spuren unruhig | eigene Runde |
| **5** | **Vorgabewerte und Tastaturbedienung beim Sortieren** | eigene Zeile im Fahrplan, ohne Nummer |

---

## 13. Wie die Runde gefahren wird

| Phase | Form |
|---|---|
| **BA 0** | zuerst und allein. Die Zahl geht ins Protokoll |
| **BA 1 bis BA 8** | je ein Schreiber, je ein voller Lauf, je ein Commit |
| **BA 9** | nach BA 8 — erst bauen, dann die festen Zahlen nachziehen |
| **BA 10** | zuletzt, damit die neuen Wächter gegen den fertigen Stand stehen |
| **Gegenproben** | nach BA 10, **nie gleichzeitig mit dem Prüfstand** |
| **Vor dem Push** | `npm test` vollständig, und die Größe der Auslieferung gegen die 253.736 Bytes vom 19. September 2026 |

**Die Runde fasst `server.js` an zwei Stellen an** — den Trefferausschnitt und
die neue Route. Der Schwerpunkt liegt in `public/app.js`, `public/style.css`
und den drei Sprachdateien.
