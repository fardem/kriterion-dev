# Das türkische Wörterbuch — Kriterion 0.24.4

**Bauabschnitt 2 des Auftrags 0.24.4, und er steht vor jedem übersetzten
Satz.** *Wer mittendrin merkt, dass „Eintrag" mal `Öğe` und mal `Kayıt` heißt,
hat 1209 Schlüssel zu prüfen statt eine Liste.*

**Die Regel aus 0.22.0 gilt je Sprache: eine Sache, ein Wort** — Regel **S3**
im Projektstand, Abschnitt 5.6. Dieses Papier ist die türkische Fassung
derselben Regel. **Es ist verbindlich für `tr.json`**, und wer ein zweites
Wort für dieselbe Sache braucht, ändert erst dieses Papier und dann alle
Stellen.

> ## DER LESER: DER BETREIBER SELBST (F2, entschieden)
>
> **Die Regel aus dem Konzept lautet: ohne einen Leser, der Türkisch als
> Sprache und nicht als Wörterbuch kennt, geht `tr.json` nicht heraus**
> (S3.4, E14). **Am 8. September 2026 hat der Betreiber die Frage F2 des
> Auftrags beantwortet: *„das bin ich"*.** *Damit steht Türkisch, wie
> Englisch bei 0.24.3 (dort Frage F5), auf demselben Leser — und die Regel
> ist erfüllt, nicht umgangen.*
>
> **Was das für dieses Papier heißt:** die Wörterliste unten ist der
> **Vorschlag**, den der Leser durchgeht, und keine beschlossene Sache. Wo
> unten *„offen"* steht, entscheidet der Betreiber; wo nichts steht, gilt der
> Vorschlag, bis er widerspricht. ***Was Claude leisten kann, ist das
> Wörterbuch und die fünf Regeln; ob ein Satz sich türkisch LIEST, sagt nur
> jemand, der die Sprache spricht.***
>
> **Drei Stellen gehören dabei zuerst angesehen:**
> 1. **`Parola` oder `Şifre`** für „Passwort" *(F3)* — es steht an der
>    Anmeldemaske, und das ist der erste Satz, den ein Mensch liest.
> 2. **`Öğe` für „Eintrag"** — der Zusammenstoß aus S3.2, unten begründet.
> 3. **Der Wortlaut am Telefon** — der Augenschein ist gefahren *(die Bilder
>    liegen der Runde bei)*, aber ob ein Satz sich türkisch **liest**, sagt
>    dieser Blick nicht.
>
> **Eine vierte Stelle stand hier und ist entschieden:** die Mehrzahl hinter
> einer Zahl. *Der Kasten unter TR-S4 trägt die Entscheidung des Betreibers
> vom 8. September 2026 und das, was sie gekostet hat.*

---

## Die vier türkischen Regeln, die es auf Deutsch nicht braucht

*Sie sind die Anwendung der fünf Regeln T1 bis T5 aus dem Konzept (S3.1) auf
das Wörterbuch. T3 — İ und ı — ist keine Sache der Wörter, sondern der
Faltung; sie steht als Befund **B8** im Auftrag und ist in Bauabschnitt 1
repariert.*

- **TR-S1 · Satzanfang groß, sonst klein.** Knöpfe, Titel, Pillen und
  Kartenköpfe schreiben nur das erste Wort groß: **„Varsayılanlara dön"**,
  nicht „Varsayılanlara Dön". *Ausgenommen sind Eigennamen (`Kriterion`,
  `Docker`, `SMTP`) und die Vokabelwörter, wenn sie am Satzanfang stehen.*
  > **UND DAS ERSTE ZEICHEN IST EIN TÜRKISCHES.** Aus `i` wird am Satzanfang
  > **`İ`** und nie `I`; aus `ı` wird **`I`**. *Das ist dieselbe Sache wie
  > T3, nur mit der Hand statt mit der Faltung: „İptal", nicht „Iptal".*
- **TR-S2 · Du bleibst du, und *lütfen* steht nirgends.** Kriterion duzt; auf
  Türkisch ist das die zweite Person Singular, und die Oberfläche benutzt sie
  durchgängig — **„Bir dosya seç."**, nicht „Lütfen bir dosya seçin.".
  > *Gemessen: „Bitte" steht **21-mal** in `de.json`.* **Keine einzige dieser
  > Stellen wird `lütfen`.** Eine Fehlermeldung sagt, was nicht ging, und dann
  > den nächsten Schritt — ohne Höflichkeitsfloskel. *Das ist Regel S2 des
  > Projekts, und sie gilt je Sprache in der Form, die die Sprache dafür hat.*
- **TR-S3 · Keine Endung an einem Platzhalter** *(T1, wörtlich)*. Ein
  Vokabelwort bleibt im Nominativ, in Anführungszeichen, und die Endung trägt
  ein festes Wort daneben:
  > **`„{entryOne}" öğesi silinsin mi?`** — *nicht* `{entryOne}'yi sil?`
  >
  > Die Endung sitzt an **öğe**, nicht am Wort des Admins. *Ob sie -yi, -yı,
  > -yu oder -yü hieße, entschiede dessen letzter Vokal — und den kennt
  > niemand, der den Satz schreibt.* **Die Probe steht im Prüfstand: dasselbe
  > Vokabelwort auf `Model`, `Kutu` und `Kayıt`, drei Vokale, ein Satz.**
- **TR-S4 · Nach einer Zahl steht die Einzahl** *(T2, wörtlich)*. **„3
  yorum", nicht „3 yorumlar".** In `tr.json` tragen die Mehrzahlobjekte
  deshalb **in beiden Formen dasselbe Nomen** — `one` und `other` sind
  wortgleich, und die Datei sagt es, nicht der Code.
  > **BEIDE FORMEN WERDEN GEFÜLLT, und das ist keine Förmlichkeit:**
  > `Intl.PluralRules('tr').select(1)` ist `one`, `select(3)` ist `other`.
  > *Nachgemessen, nicht angenommen.* **Wer nur `other` schriebe, risse ein
  > Loch in die Deckungsprobe** — und bei `n = 1` stünde `⟦…⟧` am Bildschirm.
  >
  > **Die Mehrzahl mit -ler/-lar steht nur in den FESTEN Sätzen der Datei:**
  > „Yorumlar" über der Kommentarliste, „3 yorum" an der Zahl. ***An einem
  > Vokabelwort steht sie gar nicht mehr*** — warum, sagt der Kasten darunter.
  >
  > ## DIE EINE STELLE, DIE DIE REGEL NICHT VON SELBST HÄLT — und wie sie entschieden ist
  > **Die vierzehn Vokabelwörter haben je EINEN Mehrzahlplatz**, und der wird
  > an drei Orten gelesen: **hinter einem Zähler** (`3 {entryMany}`), **als
  > Wort in einem Satz** (`bütün {entryMany} için`) und **als bloße
  > Beschriftung** („TEST GÜNLERİ" als Blocküberschrift). *Türkisch will dort
  > nicht dasselbe Wort — `öğe` nach der Zahl, `öğeler` im Satz.*
  >
  > **Gemessen am 8. September 2026, an der ausgelieferten Fassung:**
  > **30 Stellen** lesen das Wort hinter einer Zahl *(27 über die fünf
  > Zähler-Helfer `vThing`, `vTime`, `vReport`, `vTask`, `vRating`, drei über
  > `countWord`)*, **27 Schlüssel** *(30 Vorkommen)* lesen es in einem Satz,
  > **5 Stellen** im Code als bloße Beschriftung. *Gezählt, nicht geschätzt.*
  >
  > ### DIE ENTSCHEIDUNG DES BETREIBERS, 8. September 2026
  > **Es gibt keinen fünfzehnten Vokabelplatz, und beide Formen tragen
  > dasselbe Wort.** Der Betreiber hat die Frage im Wortlaut entschieden:
  > *„1 Öğe, 4 Öğe, beides geht. Dann ist die Vorgabe für beides halt zwei mal
  > das gleiche."* **`Öğe`, `Test günü`, `Rapor`, `Görev`, `Değerlendirme` —
  > in `one` wie in `other`.**
  >
  > **Damit sind die 30 Zählerstellen richtig** („3 öğe", „15 öğe
  > görünüyor") — und das war die Mehrheit, die vorher falsch stand.
  >
  > **Was es gekostet hat, steht Satz für Satz in der Datei:** von den 27
  > Satzschlüsseln haben **12 einen neuen Wortlaut bekommen**, damit sie sich
  > mit der Einzahl lesen — *„bütün {entryMany} öğelerini göster" wurde
  > „Bütün {entryMany} listesini göster", „kaç {entryMany} öğesinde" wurde
  > „yıldız verilen {entryMany} sayısını"*. **Die übrigen 15 lasen sich mit
  > der Einzahl schon richtig**, weil das Türkische das bloße Nomen ohnehin
  > allgemein gebraucht: „Silinmiş öğe yok.", „Henüz Test günü yok."
  >
  > **Was bleibt, ist benannt:** an den **5 bloßen Beschriftungen** stünde
  > türkisch lieber die Mehrzahl — „TEST GÜNLERİ" über der Liste der Testtage
  > statt „TEST GÜNÜ". *Der Betreiber kennt den Preis und hat so entschieden;
  > die Mehrheit der Stellen wiegt schwerer als fünf Überschriften.*
  >
  > ***Die Alternative wäre kein besseres Wort gewesen, sondern ein
  > fünfzehnter Vokabelplatz*** („Mehrzahl nach einer Zahl") — eine eigene
  > Runde, ein Feld mehr in jeder Sprache, ein Wanderungsschritt für jeden
  > Bestand. **Sie ist abgelehnt, nicht vertagt** *(Fehler und Ideen,
  > Punkt 19)*.
- **TR-S5 · Der Apostroph steht in der Datei, nie im Code** *(T5)*. Endungen
  an Eigennamen, Zahlen und zitierten Wörtern trennt das Türkische mit
  Apostroph: „Kriterion'a", „3'te". **Die Sätze sind so gebaut, dass weder
  der Titel der Installation noch eine Zahl eine Endung braucht** — der Titel
  steht als Beifügung in Anführungszeichen, die Zahl vor einem Nomen
  (TR-S4). *Wo es nicht anders geht, steht der Apostroph im Satz der Datei.*

**Und eine fünfte, die aus TR-S2 folgt:** *Gebrauchstürkisch, nicht
Behördentürkisch.* Der Maßstab ist das Wort, das ein türkischsprachiger
Anwender im Gespräch sagt — *giriş, bağlantı, etiket, yedek, sunucu*. **Die
Bilder des Projekts** — Stolperstein, Gegenprobe, Klemme, Wächter, Deckel,
Pille, Kiste, Wirt, Grabstein, Tafel — **stehen auch auf Türkisch nirgends am
Bildschirm**; sie bleiben in den Papieren, und die bleiben deutsch.

---

## 1. Die vierzehn Vokabelwörter

**Sie sind Inhalt und keine Oberfläche.** Was hier steht, ist die **Vorgabe**
in `tr.json` unter `vocabulary.` — das, womit eine frische türkische
Installation beschriftet ist, bevor jemand etwas eingetragen hat. *Was der
Eigentümer stattdessen einträgt, steht in der Datenbank.*

| Schlüssel | Deutsch | Englisch | **Türkisch** | warum |
|---|---|---|---|---|
| `vocabulary.entryOne` | Eintrag | Entry | **Öğe** | ***nicht `Kayıt`*** — der Zusammenstoß, siehe unten |
| `vocabulary.entryMany` | Einträge | Entries | **Öğe** | ***dasselbe Wort wie die Einzahl*** — TR-S4, entschieden am 8. September 2026 |
| `vocabulary.testedYes` | Getestet | Tested | **Test edildi** | |
| `vocabulary.testedNo` | Ungetestet | Untested | **Test edilmedi** | *die verneinte Form desselben Verbs — wie im Deutschen ein Wort* |
| `vocabulary.dayOne` | Testtag | Test day | **Test günü** | zwei Wörter; **TR-S3** verbietet das Zusammensetzen |
| `vocabulary.dayMany` | Testtage | Test days | **Test günü** | dasselbe Wort wie die Einzahl *(TR-S4)* |
| `vocabulary.reportOne` | Bericht | Report | **Rapor** | |
| `vocabulary.reportMany` | Berichte | Reports | **Rapor** | dasselbe Wort wie die Einzahl *(TR-S4)* |
| `vocabulary.taskOne` | Aufgabe | Task | **Görev** | |
| `vocabulary.taskMany` | Aufgaben | Tasks | **Görev** | dasselbe Wort wie die Einzahl *(TR-S4)* |
| `vocabulary.taskDone` | Erledigt | Done | **Tamamlandı** | ein Wort, ein Abzeichen |
| `vocabulary.potential` | Potenzial | Potential | **Potansiyel** | |
| `vocabulary.ratingOne` | Bewertung | Rating | **Değerlendirme** | *nicht `İnceleme`* — das wäre der Bericht |
| `vocabulary.ratingMany` | Bewertungen | Ratings | **Değerlendirme** | dasselbe Wort wie die Einzahl *(TR-S4)* |

> **DER ZUSAMMENSTOSS, UND ER BELEGT DIE REGEL.** Das nächstliegende Wort für
> „Eintrag" wäre **`Kayıt`** — und `Kayıt` heißt zugleich „Registrierung"
> (*kayıt olma*) und steckt in „speichern" (*kaydet*). **Eine Sache, ein
> Wort** heißt auch: **ein Wort, eine Sache.** Deshalb **`Öğe`** für den
> Eintrag, `Kayıt olma` für die Registrierung und `Kaydet` für das Speichern.
> *Auf Deutsch stellt sich die Frage nicht, auf Englisch auch nicht — und
> genau darum wird das Wörterbuch je Sprache beschlossen und nicht je Sprache
> abgeschrieben.*

> **TR-S6 · Kein Vokabelwort wird in ein zusammengesetztes Wort verbaut** —
> die türkische Fassung von S6, und sie ist hier schärfer als in den beiden
> anderen Sprachen: das Türkische hängt seine Fälle als Endungen an, und eine
> Endung an einem Wort, das der Admin morgen austauscht, ist ein Satz, der
> morgen falsch ist. **„Değerlendirme: ölçütler", nicht „Değerlendirme
> ölçütleri"**, und **„Test günü", nicht „Testgünü"**.

---

## 2. Eine Sache, ein Wort — die türkische S3

**Links steht die deutsche Liste aus Regel S3, Wort für Wort.** Wer sie
ändert, ändert alle drei Sprachen.

### Zugang und Konto

| Deutsch | Englisch | **Türkisch** | Bemerkung |
|---|---|---|---|
| Anmelden / Abmelden | Log in / Log out | **Giriş yap / Çıkış yap** | *als Verb zwei Wörter; das Substantiv „die Anmeldung" ist **giriş*** |
| Mein Konto | My account | **Hesabım** | |
| Benutzer | User | **Kullanıcı** | |
| Sitzung | Session | **Oturum** | |
| Passwort | Password | **Parola** | ***offen (F3)***: `Parola` (Microsoft, Apple) oder `Şifre` (Google) — beide üblich; **der Betreiber entscheidet — er ist der Leser (F2)** |
| Zweiter Faktor · Code | Two-factor · Code | **İki adımlı doğrulama · Kod** | `2FA` bleibt `2FA` |
| Registrierung / Anfrage / beantragen | Registration / Request / request | **Kayıt olma / Başvuru / başvur** | *dieselbe Dreiheit wie im Deutschen: das Verfahren, die einzelne Anfrage, die Handlung* |
| Einladungslink | Invitation link | **Davet bağlantısı** | |
| Link zum Zurücksetzen | Reset link | **Sıfırlama bağlantısı** | |
| Sperren / Entsperren | Lock / Unlock | **Kilitle / Kilidi aç** | |
| Freischalten / Ablehnen | Approve / Reject | **Onayla / Reddet** | *Ablehnen ist auch das Wort am Eintrag (`rejected`) — dieselbe Sache, dasselbe Wort* |
| Eigentümer · Admin · Benutzer | Owner · Admin · User | **Sahip · Yönetici · Kullanıcı** | die drei Rollen, in der Reihenfolge der Rechteleiter |

### Was mit Dingen geschieht

| Deutsch | Englisch | **Türkisch** | Bemerkung |
|---|---|---|---|
| Löschen | Delete | **Sil** | **danach ist es weg** — der Satz sagt, ob endgültig oder in den Papierkorb |
| Entfernen | Remove | **Kaldır** | **aus einer Liste genommen**, der Gegenstand bleibt |
| Wiederherstellen | Restore | **Geri yükle** | |
| Papierkorb | Trash | **Çöp kutusu** | |
| Speichern / Gespeichert | Save / Saved | **Kaydet / Kaydedildi** | |
| Abbrechen | Cancel | **İptal** | **bricht immer ab, ohne Ausnahme** (S7) |
| Umwandeln | Convert | **Dönüştür** | |
| Erneuern | Renew | **Yenile** | |
| Auf Vorgaben zurücksetzen | Reset to defaults | **Varsayılanlara dön** | Satzanfang groß, TR-S1 |
| Vorschau | Preview | **Önizleme** | |
| Alle | All | **Tümü** | |
| Anlegen / Hinzufügen | Create / Add | **Oluştur / Ekle** | *anlegen bringt eine Sache in die Welt, hinzufügen hängt eine vorhandene an* |
| Umbenennen | Rename | **Yeniden adlandır** | |
| Kopieren | Copy | **Kopyala** | |
| Suchen | Search | **Ara** | |
| Filtern | Filter | **Filtrele** | |
| Sortieren | Sort | **Sırala** | |

### Der Eintrag und was an ihm hängt

| Deutsch | Englisch | **Türkisch** | Bemerkung |
|---|---|---|---|
| Titel | Title | **Başlık** | |
| Beschreibung | Description | **Açıklama** | |
| Kategorie | Category | **Kategori** | |
| Tag (Schlagwort) | Tag | **Etiket** | |
| Kommentar | Comment | **Yorum** | |
| Notiz | Note | **Not** | |
| Link | Link | **Bağlantı** | |
| Datei · Anhang | File · Attachment | **Dosya · Ek** | |
| Foto · Video | Photo · Video | **Fotoğraf · Video** | |
| Vorschaubild | Thumbnail | **Küçük resim** | |
| Bildausschnitt | Crop | **Kırpma** | |
| Kriterium / Kriterien | Criterion / Criteria | **Ölçüt / Ölçütler** | |
| Gewicht | Weight | **Ağırlık** | |
| Durchschnitt | Average | **Ortalama** | |
| Note | Score | **Puan** | |
| Stern | Star | **Yıldız** | |
| Favorit | Favourite | **Favori** | |
| Vergleich | Comparison | **Karşılaştırma** | |

### Verwaltung und Instanz

| Deutsch | Englisch | **Türkisch** | Bemerkung |
|---|---|---|---|
| Einstellungen | Settings | **Ayarlar** | |
| Darstellung | Appearance | **Görünüm** | |
| Farbschema | Colour scheme | **Renk şeması** | |
| Schriftgröße | Font size | **Yazı boyutu** | |
| Sprache | Language | **Dil** | |
| Sicherung | Backup | **Yedek** | |
| Export / Import | Export / Import | **Dışa aktar / İçe aktar** | *als Substantiv `dışa aktarma` / `içe aktarma`* |
| Datenbank | Database | **Veritabanı** | |
| Schlüssel | Key | **Anahtar** | |
| Server | Server | **Sunucu** | |
| Instanz · Installation | Instance · Installation | **Örnek · Kurulum** | |
| Neuigkeiten | What's new | **Yenilikler** | |
| Sicherheitsprotokoll | Security log | **Güvenlik günlüğü** | |
| Frist · Aufbewahrung | Retention | **Saklama süresi** | |

---

## 3. Was Türkisch NICHT kostet

*Aus dem Konzept, S3.3 — nachgesehen und unverändert gültig.*

| | Deutsch | **Türkisch** |
|---|---|---|
| Datum | 05.09.2026 | 05.09.2026 — **gleich** |
| Uhrzeit | 24 Stunden | 24 Stunden — **gleich** |
| Dezimalzeichen | Komma | Komma — **gleich** |
| Mehrzahlklassen | `one` / `other` | `one` / `other` — **gleich** |
| Schrift | `system-ui, … Arial, sans-serif` | dieselbe Kette; **ğ, ş, ç, ı, İ liegen in jeder davon** |
| Schreibrichtung | links nach rechts | **gleich** |

**Die Locale ist `tr-TR`, und sonst ändert sich nichts.** *Kein
Rechts-nach-links, keine zweite Schrift, keine eigene Zahlformatierung.*

---

## 4. Was dieses Papier nicht entscheidet

* **`Parola` gegen `Şifre`** *(F3)* — der Vorschlag steht, die Entscheidung
  gehört dem Betreiber, und der ist seit dem 8. September 2026 auch der Leser
  *(F2)*.
* **Die Länge am Telefon** *(T4)* — Wörterbuchfragen sind Wortfragen; ob ein
  Satz in eine Pille passt, sagt der Augenschein.
* **Regionen.** `tr-TR` ist die Locale in der Datei, nicht ein zweiter
  Dateiname. Ein türkischsprachiger Zugang in Zypern bekommt dieselbe Datei.
