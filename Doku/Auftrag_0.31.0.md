# Auftrag 0.31.0 — „Die Sprachdateien werden gegengelesen"

**Geschrieben am 13. September 2026 · gebaut auf 0.30.3 · MINOR, kein
Schemaanteil.**

> **DIE VORLAGE KOMMT NICHT AUS DIESEM HAUS.** *Der Betreiber hat
> `Doku/I18N_CLEANUP_DE.md` von Google Gemini schreiben lassen und sie am 13.
> September 2026 ins Repo gelegt, mit der Ansage: **„gehe bitte zeile für zeile
> durch. und sag mir was davon von google gemini falsch ist und wir nicht
> übernehmen sollten."***
>
> **JEDE ZEILE IST NACHGEPRÜFT — gegen das echte `de.json`, gegen den Quelltext
> und gegen die beiden anderen Sprachdateien.** *Alle 71 genannten Schlüssel
> gibt es, kein Zitat ist falsch. Was nicht übernommen wird, steht unten mit
> Grund — und jede einzelne Ablehnung ist vom Betreiber bestätigt.*

---

## 0. Die acht Leitplanken — vor der ersten Zeile beschlossen

| # | Regel | woher |
|---|---|---|
| **L1** | **Technische Konstanten raus aus den Sprachdateien** — aus **allen drei**, nicht nur aus `de.json` | Gemini, ergänzt |
| **L2** | **Kürzen ja — aber der Grund bleibt, knapp, und der Ausweg immer** | Betreiber |
| **L3** | **Aktives Du bleibt.** *Kein Infinitiv ohne Anrede* | Betreiber |
| **L4** | **Lehnwörter, wo der Fachmann sie spricht:** *konvertieren, Kompression, generieren, Suchtreffer* | Betreiber |
| **L5** | **Hauswörter, die bleiben:** *Knopf, Kasten, Eintrag, Zugang* | Betreiber |
| **L6** | **„Pille" nur im Code.** *Was der Nutzer sieht, heißt Knopf* | Betreiber |
| **L7** | **Keine Metaphern in der Oberfläche.** *„Das Haus verlassen" fällt ersatzlos* | Betreiber |
| **L8** | **Kein erfundener Grund.** *Wo gekürzt wird, bleibt der wahre Grund — oder gar keiner* | Claude, bestätigt |

> **L4 IST EINE BERICHTIGUNG MEINER EIGENEN LINIE.** *Der Betreiber, 13.
> September 2026: „ich kenne keinen Deutschen IT'er der statt konvertieren
> umstellen benutzt. Kompression, komprimieren ist auch das wort keiner sagt
> dazu rechnen. und erzeugen wird auch nicht genutzt. Und Fundstelle wird auch
> nicht genutzt sondern Suchtreffer."* **Er hat recht; ich hatte Hausstil mit
> Sprachpflege verwechselt.**

---

## Die Fragetafel — vor der ersten Zeile beantwortet

| # | Frage | Antwort |
|---|---|---|
| **F1** | **Welche Sprachdateien verlieren die Code-Lecks?** | **Alle drei.** *Sie haben exakt 1265 Schlüssel, ein Wächter hält das fest — nur `de.json` zu kürzen macht den Lauf rot* |
| **F2** | **`list.px10`/`px20` „ins Stylesheet"?** | **Nein, in eine KLASSE.** *Sie stehen als Inline-Angabe an einer Bedingung: `margin:0 0 ${multipleUsers() ? px10 : px20}`. Eine Konstante im Skript wäre derselbe Fehler an anderer Stelle* |
| **F3** | **`card.likeDevice` — wie heißt die dritte Themawahl?** | **„Auto".** *Betreiber: „es steht neben hell dunkel … jeder weiß was in diesem Kontext das heißt"* |
| **F4** | **Womit wird „das Haus verlassen" ersetzt?** | **Gar nicht — der Halbsatz fällt.** *Betreiber: „wer Export drückt weiß dass es das System verlässt"* |
| **F5** | **Du oder Infinitiv?** | **Aktives Du.** *Geminis Überschrift verspricht „professionelles Du (Linear-/Notion-Stil)" und liefert Infinitive ohne Subjekt — der Bestand hat 67-mal „du"* |
| **F6** | **Knopf oder Schaltfläche?** | **Knopf** |
| **F7** | **Und die Pillen?** | **Im Code `pill`, in der Oberfläche Knopf.** *Betreiber: „Pille ist zu medizinisch … der user sieht eine runde Schaltfläche"* |
| **F8** | **Kasten oder Bereich?** | **Kasten.** *Betreiber: „das ist mir egal. wir können weiterhin unseren nehmen"* |
| **F9** | **„gruppiert" → „sortiert"?** | **NEIN.** *Die Ansicht gruppiert wirklich — `groupsOf()` fasst aufeinanderfolgende Zeilen desselben Eintrags zusammen, und das Bild des Betreibers vom 13. September zeigt es* |
| **F10** | **„Standbild" → „Vorschaubild"?** | **„Video-Vorschaubild".** *Betreiber: „Standbild ist technisch korrekt aber für den user irrelevant."* **Und es trifft die Sache genau:** *das Bild liegt in denselben Spalten `thumb`/`medium` wie ein Vorschaubild, nur mit `kind = 'video'`* |
| **F11** | **`linkUnaffectedWord` „nicht" → „unberührt"?** | **NEIN — „nicht" bleibt.** *Das Wort steht hervorgehoben in **zwei** Trägersätzen; Gemini nennt nur einen. Und die Hervorhebung sitzt auf der Verneinung* |
| **F12** | **`card.itemOne`/`itemMany` — was steht an der Vokabelkarte?** | **„Einzahl" / „Mehrzahl".** *Das Wort davor fällt ganz: „Sache" ist genau das, was der Betreiber dort ersetzen soll* |
| **F13** | **Wie sehen Fehlermeldungen aus?** | **Grund knapp, Ausweg immer.** *Der Betreiber hat `server.exportGrew` selbst formuliert; der Wortlaut unten ist seiner, nur im Satzbau geglättet* |
| **F14** | **`card.fontSizeHint` — „eng" oder „Darstellungsfehler"?** | **Der Satz fällt ganz.** *Betreiber* |
| **F15** | **Warum sind Vorschaubilder immer WebP?** | **Weil sie sich jederzeit neu erzeugen lassen** — *nicht, „weil sie nicht mitgesichert werden": sie liegen als BLOB in der Datenbank und die Sicherung nimmt sie mit. Die erste Fassung des Betreibers ist daran berichtigt worden* |
| **F16** | **`card.adminOnly…` — „Ohne Häkchen" oder „Deaktiviert:"?** | **Umgedreht: „Mit Häkchen …; ohne Häkchen …".** *Betreiber* |
| **F17** | **Die Mailtexte — Banksprache?** | **Nein.** *Der Betreiber hat den Kernsatz selbst geschrieben: „Wer diesen Link hat, kommt in deinen Zugang — gib ihn nicht weiter."* |
| **F18** | **„Zugang" oder „Account"?** | **Zugang.** *Es steht an 30 Stellen so, und zwei Zeilen über dem Satz schon einmal* |
| **F19** | **Anführungszeichen?** | **Durchgehend „…".** *Gemini hat recht: **34 Texte** öffnen mit `„` und schließen mit einem geraden `"`* |
| **F20** | **Was kostet die Runde am Prüfstand?** | **Gemessen: der Prüfstand nennt diese Schlüssel 48-mal, die Gegenproben 20-mal.** *Jede Textänderung zieht eine Zusage nach (Stolperstein 201: umstellen, nicht löschen)* |
| **F21** | **Alle drei Sprachen in EINER Runde?** | **Nein — DREI Runden.** *0.31.0 deutsch, **0.31.1** englisch, **0.31.2** türkisch. Jede mit eigenem Augenschein, eigenem Fingerprint und eigenen Gegenproben; der Betreiber kann Deutsch einspielen und im Feld ansehen, bevor Englisch folgt* |
| **F22** | **Woraus übersetzen die beiden nächsten Runden?** | **Aus der ABSICHT, nicht aus dem deutschen Satz.** *Das Änderungsprotokoll 0.31.0 trägt für jeden Text, bei dem wörtliches Übersetzen schiefgeht, eine Zeile „was der Satz leisten muss" — geschätzt 15 bis 20 der rund 60* |

---

## Der Befund, der die beiden Folgerunden begründet

**ENGLISCH UND TÜRKISCH SIND WORT FÜR WORT AUS DEM DEUTSCHEN ENTSTANDEN —
samt seiner Bilder.** *Nachgesehen am 13. September 2026:*

| Schlüssel | was dort heute steht |
|---|---|
| `list.pillHint` **tr** | „Üç **haptan** birine tıklamak …" — **„hap" ist die Tablette** |
| `card.exportPartsHint` **en** | „… {n} files that **leaves the house** — …" |
| `card.exportPartsHint` **tr** | „… **evden çıkan** {n} dosyaya …" *(„aus dem Haus gehend")* |
| `card.likeDevice` **tr** | „Cihaz gibi" — *„wie das Gerät", wörtlich* |
| `list.hitPlace` **tr** | „Bulunan yer" *(„gefundener Ort")* — **auf Englisch steht sauber „Match"** |
| `card.itemOne` **tr** | „Şey, tekil" — *„Şey" ist eher „Dingsda" als „Sache"* |

> **DIE DEUTSCHE RUNDE TROCKNET DIE QUELLE AUS.** *Sobald „das Haus" und
> „Pille" aus `de.json` verschwunden sind, kann keine Übersetzung sie mehr
> erben.* **Das ist der Grund, warum Deutsch zuerst kommt und nicht alle drei
> zugleich** *(F21)*.
>
> **UND EINE FALLE, DIE ES AUF DEUTSCH NICHT GIBT:** *Türkisch kennt **eine**
> Mehrzahlform. Wo ein Text ein `{one, other}`-Paar trägt, stehen dort heute
> zwei gleiche Sätze — richtig, aber jede Änderung muss beide treffen.*

---

## Phase 1 — Die elf Code-Lecks

**DER BEWEIS STEHT IN DEN ANDEREN ZWEI SPRACHDATEIEN:** *`entry.targetBlank`
heißt auf Deutsch `_blank`, auf Englisch `_blank` und auf Türkisch `_blank`.*
**Ein Text, der in drei Sprachen gleich lautet, ist kein Text.**

| Schlüssel | Wert | wohin |
|---|---|---|
| `entry.targetBlank` | `_blank` | fest ins Skript |
| `entry.linkRel` | `noopener,noreferrer` | fest ins Skript |
| `entry.imagePrefix` | `image/` | fest ins Skript |
| `list.px10` / `list.px20` | `10px` / `20px` | **eine Klasse im Stilblatt** |
| `card.composeFile` | `docker-compose.yml` | fest ins Skript |
| `card.filesQuery` | `&files=1` | fest ins Skript |
| `card.photosQuery` | `photos=1` | fest ins Skript |
| `card.videosQuery` | `&videos=1` | fest ins Skript |
| `list.thumbQuery` | `?size=thumb` | fest ins Skript |
| `card.partQuery` | `&from={from}&to={to}&part={part}&parts={n}` | fest ins Skript |

**1265 Schlüssel werden 1254 — in jeder der drei Dateien.**

---

## Phase 3 — Die Anführungszeichen

**34 Texte öffnen mit `„` und schließen mit `"`.** *Sie bekommen das schließende
`"`.* **Ein Wächter hält es danach fest**, sonst schleicht sich das nächste
gerade Zeichen unbemerkt wieder ein.

---

## Phase 2 — Die Worttafel

**JEDE ZEILE IST ENTSCHIEDEN.** *Spalte „woher" sagt, wessen Fassung gebaut
wird: **G** = Gemini unverändert, **B** = der Betreiber im Wortlaut, **C** =
mein Vorschlag, **G+C** = Geminis Kürzung mit unserem Wort.*

### A · Oberfläche

| Schlüssel | wird | woher |
|---|---|---|
| `list.pillHint` | „Ein Klick auf einen der drei Knöpfe setzt den Filter." | **B** |
| `entry.jumpToInput` | „Zum Eingabefeld springen" | **G** |
| `card.fontSizeHint` | „Schriftgröße der gesamten Oberfläche. Wirkt sofort und gilt auf jedem Gerät." *(der dritte Satz fällt)* | **B** |
| `card.likeDevice` | „Auto" | **B** |
| `list.hitPlace` | „Suchtreffer" | **G** |
| `card.calculating` | „Berechnung läuft …" | **G** |
| `server.criteriaConflict` | **bleibt** — „Kasten" ist Hauswort *(L5)* | **B** |
| `list.openGroupedBy` | **bleibt** — die Ansicht gruppiert wirklich *(F9)* | **B** |
| `entry.tagInputHint` | **bleibt** — Geminis Fassung ist LÄNGER und bricht seine eigene Regel | **C** |
| `card.exportWritesHint` | **bleibt** — „Knöpfen" ist beschlossen *(F6)* | **B** |

### B · Medien

| Schlüssel | wird | woher |
|---|---|---|
| `card.storeCaveat` | „Verlustbehaftete Kompression spart bei Fotos rund zwei Drittel. Bei Bildschirmfotos mit Text wird die Datei dagegen GRÖSSER — der Kodierer kann mit harten Kanten nichts anfangen. Die Wahl gilt für alles, was hereinkommt." | **G+C** |
| `card.derivativesWebp` | „Die Vorschaubilder sind in jedem Fall WebP. Sie sind bereits verlustbehaftet und lassen sich jederzeit neu erzeugen." | **B** *(Begründung berichtigt, F15)* |
| `card.catchUpAsk` | „{n} PNG-Fotos ({bytes}) werden konvertiert, die Originale ersetzt (danach etwa {after}). Veraltete JPEG-Vorschaubilder werden dabei neu generiert. Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden." | **G+C** |
| `card.catchUpBoth` | „Konvertiert {n} PNG-Originale und generiert veraltete JPEG-Vorschaubilder neu." | **G** |
| `card.catchUpDerivatives` | „Generiert veraltete JPEG-Vorschaubilder neu. Die Originale bleiben unberührt." | **G** |
| `card.convertCounts` | „{converted} von {total} Originalen konvertiert, {derived} Vorschaubilder neu generiert" | **G** |
| `card.convertProgress` | „Konvertierung läuft — {done} von {total} bearbeitet …" | **G+C** |
| `card.storePngHint` | „keine Konvertierung — keine Rechenzeit, größte Ablage" | **G** |
| `card.storeLosslessHint` | „Vorgabe — verlustfrei, gemessen rund zwei Drittel kleiner" | **G** |
| `card.nothingToDo` | „, {stayed} bereits aktuell" | **G** |
| `server.videoNeedsStill` | „Nur ein Video mit Video-Vorschaubild ist erlaubt" | **B** *(F10)* |
| `server.videoStill` | „Video und Video-Vorschaubild gehören zusammen" | **B** |
| `server.stillNoPreview` | „Aus dem Video-Vorschaubild ließ sich nichts erzeugen" | **B+C** |
| `server.stillNotImage` | „Das Video-Vorschaubild ist keine Bilddatei" | **B** |

> **`card.catchUpAsk` OHNE „Erfordert vorherige Sicherung".** *Gemini schreibt
> das; wahr ist „rückgängig nur mit einer vorher angelegten Sicherung". Eine
> Sicherung wird nicht **verlangt** — sie fehlt nur, wenn man zurück will.*

### C · Sicherung und Ablage

| Schlüssel | wird | woher |
|---|---|---|
| `card.exportPartsHint` | „Der Export schreibt den gesamten Bestand in {n} Dateien — mit allen Fotos, allen Anhängen und den Namen aller Verfasser." | **B** *(F4)* |
| `card.backupWritten` | „Sicherung erstellt" | **G** |
| `card.backupWrittenFile` | „Sicherung erstellt: {file} ({bytes})" | **G** |
| `card.keyBesideDb` | „Der Schlüssel liegt im selben Verzeichnis wie die Datenbank" | **G** |
| `card.keyStillBeside` | „Der Schlüssel liegt weiterhin im Datenbankverzeichnis" | **G** |
| `server.backupInDataDir` | „Der Sicherungsordner darf nicht im Datenverzeichnis liegen — sonst schützt die Sicherung vor nichts." | **G+C** |
| `card.backupDirAdvice` | „Empfohlen ist ein Ordner außerhalb, am besten auf einer anderen Platte — sonst trifft ein Fehler am Projektordner Original und Sicherung zugleich. Einstellung:" | **C** |
| `card.itemOne` / `card.itemMany` | „Einzahl" / „Mehrzahl" | **B** *(F12)* |
| `card.cleanupAfterBackup` | „Nach erfolgreicher Sicherung aufräumen" | **G** |
| `card.backupUnopenableHint` | „lässt sie sich nicht öffnen — beides darf nicht am selben Ort liegen." | **G** |
| `card.autoDeleteHint` | „automatisch gelöscht; von Hand geht es nicht." | **G+C** |
| `card.backupHint` | **bleibt** — Gemini streicht **„verschlüsselte"** und „was der Export nicht enthält" | **C** |
| `server.backupGone` | **bleibt** — „gibt es nicht mehr" sagt, dass sie DA WAR; „nicht gefunden" lässt offen, ob man sich vertippt hat | **C** |

### D · Server-Meldungen

| Schlüssel | wird | woher |
|---|---|---|
| `server.exportGrew` | „Die Exportdatei würde {limit} MB überschreiten, da sie im Arbeitsspeicher erzeugt wird. Nimm die Sicherung — die ist durch kein Limit eingeschränkt." | **B** *(F13, Satzbau geglättet)* |
| `server.backupDirGone` | „Den Sicherungsordner {folder} gibt es nicht. Häng ihn auf dem Server ein — angelegt wird er nicht." | **C** *(L3)* |
| `server.backupDirNotSet` | „Es ist kein Sicherungsordner eingerichtet. Er wird in der docker-compose.yml eingehängt und dort als BACKUP_DIR benannt — beides gehört zusammen." | **C** |
| `server.backupConcurrent` | „Dort wird gerade schon eine Sicherung angelegt — bitte noch einmal." | **C** |
| `card.languagesFileAfter` | „… ohne Neustart. Der vordere Teil des Dateinamens ist die Sprachkennung nach BCP 47 (z. B. de-DE)." | **G** |
| `card.emailsDoubledHint` | „… beim nächsten Start gilt die Eindeutigkeit wieder." | **G+C** |
| `server.targetNotNumber` | „Jedes Ziel muss eine Zahl sein." | **G** |
| `server.nameOriginalStays` | „Der Originaltext lässt sich nicht entfernen — er ist der Name des Eintrags." | **C** |
| `server.subDirOutside` | **bleibt** — Gemini streicht den Ordnernamen aus der Meldung | **C** |
| `server.subDirForm` | **bleibt** — die Liste der erlaubten Zeichen ist die Auskunft | **C** |
| `server.partExportIncomplete` | **bleibt** — „Parameter unvollständig" sagt nicht, WELCHE fehlen | **C** |

### E · Zugänge und Mails

| Schlüssel | wird | woher |
|---|---|---|
| `mail.invite.body` | „Wer diesen Link hat, kommt in deinen Zugang — gib ihn nicht weiter." | **B** *(F17, F18)* |
| `mail.confirm.body` | „… Er öffnet keinen Zugang und setzt kein Passwort — er bestätigt nur, dass die Adresse dir gehört." | **C** |
| `mail.test.body` | „… gehen ab jetzt automatisch hinaus." | **G+C** |
| `card.adminOnlyCategory` | „Mit Häkchen legt jeder neue Kategorien an; ohne Häkchen nur Admins. Vorhandene kann weiterhin jeder auswählen." | **B** *(F16)* |
| `card.adminOnlyTag` | „Mit Häkchen vergibt jeder neue Tags; ohne Häkchen nur Admins. Vorhandene kann weiterhin jeder vergeben." | **B** |
| `card.lastSeen` | „zuletzt aktiv {lastSeen}" | **G** |
| `card.linkUsed` | „Link bereits verwendet" | **G** |
| `card.allCodesUsed` | „Sind alle Codes verbraucht und das Handy nicht zur Hand, kann der Eigentümer den zweiten Faktor auf dem Server zurücksetzen." | **C** |
| `card.openAppHint` | **bleibt** — „tippst du" ist das aktive Du *(L3)* | **B** |
| `card.titleAfterHint` | **bleibt** — Geminis Fassung wiederholt nur den ersten Halbsatz | **C** |
| `login.linkUnaffectedWord` | **bleibt** — „nicht" *(F11)* | **B** |

---

## Die Bauabschnitte

| | |
|---|---|
| **BA 1** | **Die elf Code-Lecks** — Werte fest ins Skript, `px10`/`px20` als Klasse, Schlüssel aus allen drei Dateien |
| **BA 2** | **Die Worttafel A bis E** in `de.json` |
| **BA 3** | **Die Anführungszeichen** — 34 Texte, und ein Wächter darüber |
| **BA 4** | **Der Prüfstand** — die umgestellten Zusagen und die neuen |
| **BA 5** | **Die Gegenproben** |
| **BA 6** | **Die Absichtszeilen** — für jeden Text, bei dem wörtliches Übersetzen schiefgeht, eine Zeile ins Änderungsprotokoll |
| **BA 7** | **Papiere, Augenschein, Fingerprint** *(als letztes gerechnet)* |

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Keine der elf Konstanten steht mehr in einer Sprachdatei** — in keiner der drei |
| **2** | **Und jede steht als fester Wert im Skript** — mit ihrem alten Inhalt |
| **3** | **Die drei Dateien tragen gleich viele Schlüssel** — 1254 |
| **4** | **Kein Text der drei Dateien mischt `„` mit `"`** |
| **5** | **Die vier Video-Meldungen sagen „Video-Vorschaubild"** — und keine sagt „Standbild" |
| **6** | **„gruppiert nach" steht weiter da** — die Ansicht gruppiert wirklich |
| **7** | **`login.linkUnaffectedWord` ist „nicht"** — und beide Trägersätze tragen es |
| **8** | **Kein Text sagt „das Haus"** |
| **9** | **Kein Text sagt „Pille"** — die Klasse `pill` bleibt |
| **10** | **Die Vokabelkarte beschriftet ihre Felder mit „Einzahl" und „Mehrzahl"** |
| **11** | **Die Zahl der Texte im aktiven Du sinkt nicht** |

---

## Was ausdrücklich NICHT gebaut wird

| | |
|---|---|
| **`en.json` und `tr.json` bekommen keine neuen Texte** | *nur die elf Streichungen. Die Übersetzung ist **0.31.1** (englisch) und **0.31.2** (türkisch)* |
| **Kein Schemaanteil** | *Austauschformat bleibt 16, `F_ROUTES` bleibt 73* |
| **Keine Oberfläche wird umgebaut** | *diese Runde fasst Wörter an, keine Anordnung* |
