Genau wie beim Englischen zeigt der direkte Vergleich zwischen der **neuen, fixen `de.json`** und der aktuellen **`tr.json`** gravierende Brüche. 

Türkisch ist eine **agglutinierende Sprache** (Endungen werden angehängt) mit **SOV-Satzbau** (Subjekt-Objekt-Verb; das Verb steht am Ende). Weil der Entwickler im Deutschen Sätze zerstückelt und mit `{word}`-Platzhaltern versehen hat, ist das Türkische an vielen Stellen **grammatikalisch völlig kollabiert**. Dazu kommen die bekannten Denglisch-Übersetzungsunfälle und veralteter Textballast.

Hier sind die **5 konkreten Stolperfallen**, die Claude beim Erstellen der neuen `tr.json` zwingend beachten muss:

---

### Stolperfalle 1: Grammatik-Kollaps durch `{word}`-Platzhalter (HÖCHSTE GEFAHR!)

Im Deutschen wurden Satzteile dynamisch durch `{word}`, `{word2}` ersetzt. Bei einer wörtlichen Übernahme ins Türkische entstehen Sätze, die für türkische Muttersprachler wie Kauderwelsch klingen.

#### Die schlimmsten Grammatik-Unfälle in `tr.json`:

1. **`entry.weightsWhere` (Völlig unbrauchbar!):**
   * DE: `"Die Gewichte stellst du unter Einstellungen › Bestand › {word} ein."`
   * Aktuelles TR: `"Ağırlıkları Ayarlar › Veriler › altında ayarlarsın {word} girer."`
   * *Problem:* Das ist kein verständliches Türkisch mehr. Das Verb steht mitten im Satz, und `{word} girer` hängt zusammenhanglos am Ende.
   * *Korrektur für Claude:* **`"Ağırlıklar, Ayarlar › Veriler › {word} altından ayarlanır."`**

2. **`card.linkListHint` (Doppelt gemoppelt!):**
   * DE: `"Was in der Linkliste keine Adresse ist, wird als {word} behandelt; die Suche startet erst beim Klick."`
   * Aktuelles TR: `"Bağlantı listesinde adres olmayan her şey şu sayılır: {word} sayılır; arama ancak tıklanınca başlar."`
   * *Problem:* *"şu sayılır: {word} sayılır"* – das Wort „sayılır“ steht zweimal drin!
   * *Korrektur für Claude:* **`"Bağlantı listesinde adres olmayan girdiler {word} olarak değerlendirilir; arama tıklanınca başlar."`**

3. **`card.internalTitleHint` & `card.publicTitleHint` (Das hässliche „Şu:“):**
   * DE: `"Der {word} erscheint erst nach der Anmeldung..."`
   * Aktuelles TR: `"Şu: {word} ancak giriş yaptıktan sonra görünür..."`
   * *Problem:* Der Übersetzer wusste nicht, wohin mit dem deutschen Artikel „Der“ und hat überall ein holpriges *„Şu:“* (Dieses da:) davorgesetzt.
   * *Korrektur für Claude:* Das *„Şu:“* komplett streichen! ➔ **`"{word} yalnızca giriş yapıldıktan sonra görünür..."`**

4. **`entry.calcHowAvg`:**
   * DE: `"Wie ⌀ {word} zustande kommt"`
   * Aktuelles TR: `"⌀ nasıl {word} oluştuğu"`
   * *Korrektur für Claude:* **`"⌀ {word} değerinin nasıl hesaplandığı"`**

---

### Stolperfalle 2: Der fatale Plural-Bug in `vocabulary.*` (Zerstört die UI)

In der aktuellen `tr.json` sind Einzahl und Mehrzahl bei fast allen Vokabeln identisch eingetragen.

```json
// AKTUELL IN tr.json (FALSCH!):
"vocabulary.entryMany": "Öğe",        // MUSS "Öğeler" sein!
"vocabulary.dayMany": "Test günü",    // MUSS "Test günleri" sein!
"vocabulary.ratingMany": "Değerlendirme", // MUSS "Değerlendirmeler" sein!
"vocabulary.reportMany": "Rapor",     // MUSS "Raporlar" sein!
"vocabulary.taskMany": "Görev",       // MUSS "Görevler" sein!
```

**Warum das fatal ist:**  
Überall dort, wo das System `{entryMany}` oder `{taskMany}` dynamisch in Sätze einsetzt (z. B. bei *„Alle {entryMany} anzeigen“* oder *„Offene {taskMany}“*), steht im Türkischen bisher die Einzahl:
* ❌ *„Bütün Öğe listesini göster“* (Falsch!) ➔ ✅ **„Bütün Öğeleri göster“**
* ❌ *„Açık Görev“* (Falsch!) ➔ ✅ **„Açık Görevler“**
* ❌ *„Yeni yorumlar ve Değerlendirme“* (Falsch!) ➔ ✅ **„Yeni yorumlar ve Değerlendirmeler“**

---

### Stolperfalle 3: Veraltete Romane in `tr.json` (Wo Deutsch längst gekürzt wurde!)

Genau wie im Englischen enthält `tr.json` noch die alten, geschwätzigen Absätze, die im deutschen Original schon radikal gestrafft wurden:

| JSON-Key | Aktuelles TR (Veraltet & viel zu lang) | Neue deutsche Vorlage (Fix) | Was Claude im Türkischen tun muss |
| :--- | :--- | :--- | :--- |
| **`card.storeCaveat`** | Riesiger Absatz über *„panodan gelen fotoğraf... kodlayıcı keskin kenarlarla baş edemez... baytlarından anlaşılmaz...“* | *„Verlustbehaftet: bei Fotos rund zwei Drittel kleiner, bei Bildschirmfotos mit Text dagegen GRÖSSER. Die Wahl gilt für alles, was hereinkommt.“* | **Drastisch straffen!**<br>`"Kayıplı sıkıştırma fotoğraflarda yaklaşık üçte iki yer kazandırır; metin içeren ekran görüntülerinde ise boyutu BÜYÜTÜR. Seçim yeni yüklenen tüm görseller için geçerlidir."` |
| **`card.exportPartsHint`** | *„...evden çıkan {n} dosyaya...“* (Haustür!) | *„...in {n} Dateien — mit allen Fotos, allen Anhängen und den Namen aller Verfasser.“* | Das wörtliche *„das Haus verlassen“* streichen! ➔ `"...tüm verileri {n} dosyaya aktarır — fotoğraflar, ekler ve yazar adlarıyla birlikte."` |
| **`card.catchUpBoth`** | *„Çalışma özgün dosyayı dönüştürür ve her küçük resme bakar...“* (Der „Lauf“ als Person!) | *„Konvertiert {n} PNG-Originale und generiert veraltete JPEG-Vorschaubilder neu.“* | *„Çalışma bakar“* streichen! ➔ `"{n} özgün PNG dosyasını dönüştürür ve eski JPEG küçük resimleri yeniden oluşturur."` |
| **`card.derivativesWebp`** | *„Zaten kayıplıdırlar ve kimse onları arşivlemez.“* (Paternalismus!) | *„Vorschaubilder: in jedem Fall WebP, von dieser Wahl unberührt.“* | Entwickler-Rechtfertigung löschen! ➔ `"Küçük resimler: Bu seçimden etkilenmez, her zaman WebP olarak kaydedilir."` |
| **`server.exportGrew`** | Roman über *„kayda değer bellek gerektirmez“* | *„Die Exportdatei hat die Grenze von {limit} MB überschritten. Nimm die Sicherung...“* | Den alten Text verwerfen und die kurze deutsche Fassung übersetzen! |

---

### Stolperfalle 4: Die strikte Blacklist für Claude (`tr-TR`)

Folgende Begriffe und Formulierungen sind für Claude **streng verboten**:

| Verboten in Türkisch (Blacklist) | Warum verboten? | Was Claude stattdessen nutzen MUSS |
| :--- | :--- | :--- |
| ❌ **`hap`** (für Buttons/Chips) | Bedeutet medizinische Kopfschmerztablette | ✅ **`filtre butonu`**, **`filtre seçeneği`** oder **`buton`** |
| ❌ **`evden çıkan`** (für Exporte) | Bedeutet wörtlich: das Haus verlassend | ✅ **`dışa aktarılan`**, **`dışa aktarım için`** |
| ❌ **`sabit resim`** (für Video-Thumbnails) | Bedeutet Standbild / eingefrorenes Bild | ✅ **`video kapak resmi`** oder **`küçük resim`** |
| ❌ **`Şey, tekil / çoğul`** | *„Şey“* (Zeug/Ding) ist Slang für Code-Variable `$thing` | ✅ **`Tekil`** / **`Çoğul`** (passend zum neuen deutschen `"Einzahl"` / `"Mehrzahl"`) |
| ❌ **`Cihaz gibi`** (Theme) | Klingt wie eine Geräteeigenschaft | ✅ **`Otomatik`** (passend zum neuen deutschen `"Auto"`) |
| ❌ **`Çalışma bakar / görür`** | Der deutsche Entwickler-„Lauf“ als Person | ✅ Sachliche Passiv-Konstruktion (*„Dönüştürülür / yenilenir“*) |
| ❌ **`kilit devreye girer`** (`emailsDoubledHint`) | Wörtlich aus *greift das Schloss* | ✅ **`benzersizlik denetimi bir sonraki başlatmada zorunlu kılınır`** |
| ❌ **`yanında duruyor`** (`keyBesideDb`) | Dateien „stehen“ nicht nebeneinander | ✅ **`veritabanıyla aynı dizinde bulunur`** |
| ❌ **`„...“` (Deutsche Anführungszeichen)** | Gibt es in der türkischen Typografie nicht! | ✅ Immer Standard-Anführungszeichen: **`"..."`** oder **`“...”`** |
| ❌ **`Kimse okumaz / içeri girer`** (Mail-Slang) | Kneipentonfall | ✅ **`Bu iletiye yanıt vermeyiniz`** / **`Hesabınıza erişim sağlar`** |

---

### Stolperfalle 5: Falsche oder unnatürliche UI-Begriffe

1. **`card.likeDevice`:**
   * In `de.json` steht jetzt schlicht: `"Auto"`
   * In `tr.json` steht noch das unnatürliche: `"Cihaz gibi"`
   * ➔ **Muss im Türkischen heißen:** **`"Otomatik"`** (Standard in allen modernen Apps).
2. **`card.backup` & Buttons:**
   * In `tr.json` steht fast überall das Substantiv *„Yedekleme“* (Backup-Vorgang).
   * Bei `card.backupNow`: *"Şimdi yedekleme yap"* klingt holprig. Besser: **`"Şimdi yedekle"`** (Aufforderung).
   * Bei `card.backup`: Als Substantiv für die Backup-Datei selbst ist **`"Yedek"`** natürlicher als *"Yedekleme"*.
3. **`card.lastSeen`:**
   * DE steht jetzt auf: `"zuletzt aktiv {lastSeen}"`
   * TR steht noch auf: `"son görülme {lastSeen}"` (wörtlich aus *last seen*).
   * ➔ **Muss im Türkischen heißen:** **`"Son etkinlik: {lastSeen}"`** oder **`"Son aktif: {lastSeen}"`**.

---

### Fazit für den nächsten Schritt

Türkisch verzeiht keine wörtliche Übersetzung aus dem Deutschen. Claude muss:
1. **Die Pluralformen in `vocabulary.*` zwingend mit `-ler / -lar` ausstatten.**
2. **Die Sätze rund um `{word}` nach türkischer Grammatik (Verb ans Ende!) umstellen**, statt das deutsche Satzgerüst zu kopieren.
3. **Alle deutschen Entwickler-Metaphern (*hap, evden çıkan, sabit resim, Şey, Çalışma bakar*) radikal verbannen.**

Sobald du bereit bist, erstelle ich dir daraus die fertige Auftragsdatei **`Doku/Auftrag_Türkce.0.31.x.md`** für Claude Code!
