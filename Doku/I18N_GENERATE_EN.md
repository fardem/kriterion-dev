Claude muss bei der englischen Übersetzung auf **vier ganz konkrete Stolperfallen** achten.

---

### Stolperfalle 1: Die neuen Platzhalter `{word}`, `{word2}` und `{extra}` (Größtes Risiko!)

Im deutschen Text wurden an vielen Stellen Satzfragmente durch Platzhalter wie `{word}`, `{word2}` oder `{extra}` ersetzt, die vom Frontend dynamisch befüllt werden. 

**Das Problem:**  
Wenn Claude den englischen Satzbau nicht exakt auf diese Platzhalter ausrichtet, entsteht grammatikalischer Unfug („Yoda-Englisch“), sobald die App das Wort einsetzt.

#### Konkrete Beispiele, auf die Claude achten muss:

1. **`login.linkUnaffected` & `login.linkUnaffectedWord`:**
   * DE: `"Dein Link ist davon {word} betroffen — er gilt weiter."` (mit `{word}` = `"nicht"`)
   * Aktuelles EN: `"Your link is {word} affected — it stays valid."` (mit `{word}` = `"not"`)
   * *Achtung:* Das funktioniert im Englischen (`"Your link is not affected..."`). Claude darf die Satzstellung hier **nicht** umstellen (z. B. nicht *„This does not affect your link“*), sonst passt das `{word}` nicht mehr hinein!

2. **`card.addressRequiredHint`:**
   * DE: `"{word}, solange die Registrierung erlaubt ist."` (Hier setzt die App z. B. „Erforderlich“ ein).
   * EN muss so gebaut sein, dass ein vorangestelltes Adjektiv passt: `"{word}, as long as registration is open."`

3. **`card.internalTitleHint` & `card.publicTitleHint`:**
   * DE: `"Der {word} erscheint erst nach der Anmeldung..."`
   * EN: Im aktuellen EN steht `"The {word} appears only..."`. Wenn `{word}` hier z. B. `"internal title"` ist, ergibt das `"The internal title appears only..."`. Das ist korrekt und muss im Satzbau genau so bleiben!

4. **`entry.calcIfEqual`:**
   * DE: `"Zählte jedes Kriterium {word}, stünde hier {word2} statt {word3}."`
   * EN: `"If every criterion counted {word}, this would be {word2} instead of {word3}."`

---

### Stolperfalle 2: Veralteter Ballast in `en.json` (Wo Deutsch gestrafft wurde!)

Die deutsche Datei wurde an vielen Stellen um 50 % gekürzt. Die englische Datei enthält noch die **alten, langen Entwickler-Romane**. Claude darf diese alten englischen Texte **nicht übernehmen**, sondern muss sich strikt an die neue, kurze deutsche Vorlage halten!

| JSON-Key | Aktuelles (altes) EN – **SO NICHT MEHR!** | Neue deutsche Vorlage (Fix) | Was Claude im Englischen tun muss |
| :--- | :--- | :--- | :--- |
| **`card.storeCaveat`** | Riesiger Roman über *"lossy pays off for photos only... encoder cannot do anything with hard edges... bytes cannot be told..."* | *„Verlustbehaftet: bei Fotos rund zwei Drittel kleiner, bei Bildschirmfotos mit Text dagegen GRÖSSER. Die Wahl gilt für alles, was hereinkommt.“* | **Drastisch kürzen!**<br>`"Lossy: roughly two-thirds smaller for photos, but LARGER for screenshots with text. Applies to all incoming uploads."` |
| **`card.exportPartsHint`** | *„...files that leave the house...“* | *„...in {n} Dateien — mit allen Fotos, allen Anhängen und den Namen aller Verfasser.“* | Das *„leaves the house“* wurde auf Deutsch gelöscht! Im Englischen schlicht: `"...into {n} files — with all photos, attachments, and author names."` |
| **`card.catchUpBoth`** | *„The run converts {n} PNG original and looks at every thumbnail...“* | *„Konvertiert {n} PNG-Originale und generiert veraltete JPEG-Vorschaubilder neu.“* | Der „Lauf“ (*The run*) wurde auf Deutsch gelöscht! Claude muss übersetzen: `"Converts {n} PNG originals and regenerates outdated JPEG thumbnails."` |
| **`server.exportGrew`** | Alter Text über *„single piece of text... needs no appreciable memory...“* | *„Die Exportdatei hat die Grenze von {limit} MB überschritten. Nimm die Sicherung — sie schreibt den ganzen Bestand und kennt diese Grenze nicht.“* | Den alten Text komplett verwerfen und die neue deutsche Version übersetzen! |
| **`card.derivativesWebp`** | *„They are lossy anyway, and nobody archives them.“* | *„Vorschaubilder: in jedem Fall WebP, von dieser Wahl unberührt.“* | Paternalismus löschen: `"Thumbnails: always WebP, unaffected by this choice."` |

---

### Stolperfalle 3: Alte Metaphern, die in `en.json` noch überlebt haben

Im Deutschen wurden einige Begriffe bereits modernisiert, im Englischen stehen aber noch die alten Denglisch-Begriffe:

1. **`card.likeDevice`:**
   * DE steht jetzt auf: `"Auto"`
   * EN steht fälschlicherweise noch auf: `"Like the device"`
   * ➔ **Muss im Englischen heißen:** `"Auto"` (oder `"System default"`, passend zum deutschen `"Auto"`).
2. **`card.backupWritten` / `backupWrittenFile`:**
   * DE steht jetzt auf: `"Sicherung erstellt"`
   * EN steht noch auf: `"Backup written"`
   * ➔ **Muss im Englischen heißen:** `"Backup created"` (Backups werden nicht *geschrieben*).
3. **`card.keyBesideDb` / `card.keyStillBeside`:**
   * DE steht jetzt auf: `"Der Schlüssel liegt im selben Verzeichnis wie die Datenbank"`
   * EN steht noch auf: `"The key sits next to the database"`
   * ➔ **Muss im Englischen heißen:** `"The key is located in the database directory"`
4. **`card.itemOne` / `card.itemMany`:**
   * DE steht jetzt auf: `"Einzahl"` / `"Mehrzahl"`
   * EN steht noch auf: `"Thing, singular"` / `"Thing, plural"`
   * ➔ **Muss im Englischen heißen:** `"Singular"` / `"Plural"` (Das peinliche *„Thing“* muss weg).
5. **`list.pillHint`:**
   * DE steht jetzt auf: `"Ein Klick auf einen der drei Knöpfe setzt den Filter."`
   * EN steht noch auf: `"A click on one of the three pills sets the filter itself."`
   * ➔ **Muss im Englischen heißen:** `"Clicking one of the three buttons applies the filter."` (Keine *pills*!).
6. **`server.videoNeedsStill` / `server.videoStill`:**
   * DE steht jetzt auf: `"Video-Vorschaubild"`
   * EN steht noch auf: `"still image"`
   * ➔ **Muss im Englischen heißen:** `"video thumbnail"` oder `"preview image"`.

---

### Stolperfalle 4: Die strikte Blacklist für Claude (`en-GB`)

Hier ist die Verbotsliste, die Claude bei der Übersetzung **unter keinen Umständen** verwenden darf:

| Verboten in Englisch (Blacklist) | Warum verboten? | Was Claude stattdessen nutzen MUSS |
| :--- | :--- | :--- |
| ❌ **`leaves the house`** | Deutsches Idiom (*das Haus verlassen*) | ✅ **`exported`**, **`for external use`** (oder ganz weglassen, da in DE gelöscht) |
| ❌ **`The run converts / looks at`** | Deutsches Entwickler-Denken (*Der Lauf*) | ✅ **`Converts...`**, **`Process converts...`** |
| ❌ **`Backup written`** | Denglisch für Festplatten-Schreiben | ✅ **`Backup created`**, **`Backup saved`** |
| ❌ **`sits next to / sits inside`** | Dateien/Ordner „sitzen“ nicht | ✅ **`is located in`**, **`is stored in`** |
| ❌ **`Thing`** | Slang für Code-Variable `$thing` | ✅ **`Item`**, **`Entry`** (bzw. **`Singular/Plural`** bei `itemOne/Many`) |
| ❌ **`pills`** (für Buttons) | Unüblicher CSS-Jargon für Endnutzer | ✅ **`buttons`**, **`filter buttons`** |
| ❌ **`still image`** | TV-/Schnittbegriff | ✅ **`video thumbnail`**, **`preview image`** |
| ❌ **`by hand`** (für Links/Tasten) | Wörtlich aus *von Hand* | ✅ **`manually`** |
| ❌ **`Like the device`** | Wörtlich aus *Wie das Gerät* | ✅ **`Auto`** oder **`System default`** |
| ❌ **`their posts stay`** | Kriterion ist kein Forum | ✅ **`their contributions remain`** oder **`entries remain`** |
| ❌ **`Nobody reads replies`** | Zu flapsig für Transaktionsmails | ✅ **`This inbox is not monitored`** |
| ❌ **`Whoever has this link gets in`** | Wörtlich aus *wer den Link hat, kommt rein* | ✅ **`Anyone with this link can access...`** |
| ❌ **`already current`** (`stayedCurrent`) | Holpriges Englisch | ✅ **`already up to date`** |
| ❌ **US-Spelling** (*color, favorite*) | Falsches Locale (`en-GB` vorgegeben) | ✅ **UK-Spelling:** **`colour`**, **`favourite`**, **`optimise`** |

---

### Zusammenfassung für deinen Auftrag an Claude Code:
1. **Deutsch ist Gesetz:** Wo Deutsch gekürzt wurde (z. B. bei den Bild-Optionen), **muss** Englisch genauso kurz sein.
2. **Platzhalter schützen:** `{word}`, `{word2}`, `{extra}` usw. müssen exakt so heißen und an grammatikalisch passender Stelle stehen.
3. **Blacklist einhalten:** Alle veralteten Denglisch-Metaphern (*leaves the house, written, still image, the run, pills*) müssen endgültig getilgt werden.