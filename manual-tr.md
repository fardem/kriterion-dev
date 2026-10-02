# Kriterion — Kılavuz

[English](manual.md) · [Deutsch](manual-de.md) · Türkçe

Kriterion'un kullanımı. Kurulum, anahtar, yedekleme ve güncelleme
[README](README-tr.md) dosyasında anlatılır.

---

**İçindekiler**

- [Giriş](#giriş)
- [Kullanıcılar ve roller](#kullanıcılar-ve-roller)
- [Genel görünüm](#genel-görünüm)
- [Öğe](#öğe)
- [Yorumlar](#yorumlar)
- [Değerlendirme](#değerlendirme)
- [Ayarlar](#ayarlar)
- [Dışa ve içe aktarma](#dışa-ve-içe-aktarma)
- [Telefonda ve tablette](#telefonda-ve-tablette)
- [Dil](#dil)
- [Sözcükler](#sözcükler)
- [Açık ya da koyu](#açık-ya-da-koyu)
- [Yazı boyutu](#yazı-boyutu)

---

## Giriş

Giriş yapmadan yalnızca genel başlık görünür. Oturumlar 30 gün sonra sona
erer.

Birkaç başarısız denemeden sonra giriş gecikmeli yanıt verir. Aynı adresten on
başarısız denemeden sonra giriş birkaç dakika kilitlenir; kilit yeniden
başlatmadan sonra da sürer. Kullanıcı adına göre yalnızca gecikme uygulanır,
kilit hiç uygulanmaz.

Geçersiz bir davet ya da sıfırlama bağlantısı (süresi dolmuş, kullanılmış,
yanlış ya da hesap kilitli) her zaman aynı iletiyi verir: “Bu bağlantı artık
geçerli değil. Yöneticiden yeni bir tane iste.”

### İki adımlı doğrulama

İsteğe bağlıdır, hesap başına ayarlanır, başlangıçta kapalıdır. Kimse onu
başkası için açamaz ya da kapatamaz, sahip yönetici de. Kod telefondaki bir
uygulamadan gelir; Kriterion kod göndermez.

“Hesabım” kartında açmak için:

1. Bir TOTP uygulaması kur, örneğin Google Authenticator, Aegis, 1Password
   ya da iOS'un Parolalar uygulaması.
2. “İki adımlı doğrulamayı aç” düğmesine bas ve parolanı gir. Telefonda
   “Uygulamada aç” uygulamayı doğrudan açar; bilgisayarda anahtar boşluksuz
   yazılır.
3. Altı haneli kodu gir ve “Aç” düğmesine bas.

Bundan sonra giriş parolayı ve kodu sorar. Her kod bir kez geçerlidir; saatler
yarım dakika farklı olabilir. Kod ayrıca dışa aktarma, içe aktarma, rol verme
ve başkasının parolasını belirleme öncesinde ve bir sıfırlama bağlantısı
kullanılırken istenir.

**Kurtarma kodları:** İki adımlı doğrulamayı açarken sekiz kod görünür. Kodlar
yalnızca bir kez gösterilir ve her biri bir kez, uygulama kodunun yerine
geçerlidir. **Onları telefondan ayrı sakla.** Kodlar olmadan telefon kaybolursa
hesap da kaybolur. Yeni kodları “Hesabım” kartında parola ve kodla alırsın;
eski kodlar o zaman geçersiz olur.

Telefon ve kodlar yoksa, sahip yönetici iki adımlı doğrulamayı sunucuda kapatır
(README, “Sunucu komutları”).

### İkinci onay

Dışa aktarma, içe aktarma, rol verme, başkasının parolasını belirleme, bağlantı
oluşturma, kullanıcı silme ve posta hesabını kaydetme öncesinde Kriterion
kendi parolanı bir kez daha sorar. Onay bir kez, yalnızca bu işlem için ve
yalnızca bu oturumda geçerlidir.

Onay istenmeyenler: kilitleme ve kilidi açma, kullanıcı oluşturma, kendi
hesabındaki değişiklikler, test e-postası ve öğedeki her şey.

## Kullanıcılar ve roller

| Rol | yetkiler |
|---|---|
| Kullanıcı | kendi öğeleri, yorumları, değerlendirmeleri, test günleri, favorileri |
| Yönetici | ek olarak ölçütler, etiketler, kategoriler, başlık, sözcükler, arama motorları; başkalarının katkılarını silme (değiştirme değil); kullanıcıları yönetme, ama yöneticileri ve sahip yöneticiyi değil |
| Sahip yönetici | ek olarak dışa aktarma, içe aktarma, yedekleme, posta hesabı, rol verme, anahtar değeri, güvenlik günlüğü |

Kurulumu yapan kişi sahip yöneticidir. Bu rol başka birine devredilebilir.

Yönetim “Kullanıcı” kartında yapılır (Ayarlar › Kullanıcı). Kurallar:

- Bir yönetici başka yöneticileri ve sahip yöneticiyi değiştiremez.
- Son etkin sahip yöneticinin rolü düşürülemez, kendisi kilitlenemez ve
  kaldırılamaz.
- Kimse kendini kilitleyemez ya da kaldıramaz.

Kilitleme hemen etki eder: oturum biter, kullanıcının açık bağlantıları
geçersiz olur.

### Kullanıcı oluşturma

Adın yanındaki seçim alanı yolu belirler:

- **“Parolasını kullanıcı kendi seçer (bağlantıyla)”** (varsayılan):
  “+ Oluştur ve bağlantı üret” kullanıcıyı parolasız oluşturur ve bir bağlantı
  gösterir. Bağlantıyı açan kişi parolasını seçer. O zamana kadar listede
  “henüz parola yok” yazar.
- **“İlk parolayı ben veriyorum”**: parola alanı ve “+ Oluştur”.

Bir bağlantı yedi gün ve yalnızca bir kez geçerlidir. İlk açılıştan sonra 15
dakika kalır. **Bağlantıya sahip olan parolayı belirleyebilir.** Bağlantı
yalnızca bir kez gösterilir.

İsteğe bağlı alana bir e-posta adresi girilirse ve posta gönderimi kuruluysa
bağlantı ayrıca e-postayla gider. Adresi bundan sonra yalnızca kullanıcının
kendisi “Hesabım” kartında değiştirir.

### Parolayı sıfırlama

- **Sıfırlama bağlantısı:** eski parola, bağlantı kullanılana kadar geçerlidir;
  sonra kullanıcının bütün oturumları biter.
- **Parolayı doğrudan belirleme:** bütün oturumlar hemen biter.

Kimse artık giriş yapamıyorsa yalnızca sunucudaki komut işe yarar (README).

### Kullanıcı silme

Ad serbest kalır; katkılar kalır ve “Silinen kullanıcı 7” adını taşır. İki
işaretle istenirse şunlar da silinir:

- kullanıcının öğeleri, bunlara başkalarının eklediği yorumlar,
  değerlendirmeler ve test günleriyle birlikte (pencere sayıları gösterir);
- başkalarının öğelerindeki katkıları, oradaki klasörleri de.

Oturumlar, açık bağlantılar, favoriler ve kişisel ayarlar her zaman silinir.
Yalnızca girişi engellemek için silmek yerine kilitle. Silinen kullanıcılar
“Silinen kullanıcılar (n)” altında durur.

### Kayıt olma

Kayıt olma açıkken biri giriş sayfasında “Erişim başvurusu” ile hesap
isteyebilir. Başlangıçta kapalıdır. Açma düğmesi “Başvurular” kartındadır ve
yalnızca şu durumlarda açılabilir:

- bir test e-postası ulaştıysa (posta hesabındaki her değişiklikten sonra
  yeniden),
- `PUBLIC_ADDRESS`, `.env` dosyasında yazılıysa (README, “Yapılandırma”).

Akış:

1. Kullanıcı adı ve e-posta adresiyle, parolasız başvuru.
2. Kriterion 24 saat geçerli bir onay bağlantısı gönderir. Bu bağlantı hesap
   açmaz.
3. “Başvurular” kartında yalnızca onaylanmış başvuru görünür.
4. Bir yönetici onaylar (rol Kullanıcı, davet bağlantısıyla) ya da reddeder.
5. Kullanıcı parolasını davet bağlantısıyla belirler.

Başvurunun yanıtı, ad boşta olsun ya da olmasın, her zaman aynıdır. Aynı anda
en çok 20 başvuru bekleyebilir. Posta gönderimi sonradan çalışmazsa düğme açık
kalır; kart kırmızı bir satır gösterir.

### Posta gönderimi

İsteğe bağlıdır. Posta hesabı olmadan bütün bağlantılar kopyalanmak üzere
gösterilir. Kriterion yalnızca iki tür e-posta gönderir, ikisi de düz metin:
token bağlantıları ve test e-postası.

Posta hesabını yalnızca sahip yönetici kurar, “Posta gönderimi” kartında
(Ayarlar › Kullanıcı). Pencere sağlayıcıyı (GMX, Web.de, Gmail, Strato, IONOS
ya da “Kendi sunucu”), kullanıcı adını, parolayı ve gönderen adresini sorar.
Hazır sağlayıcılarda sunucu, port ve şifreleme Kriterion'dan gelir. Parola
hiçbir zaman gösterilmez; boş bırakılan alan parolayı değiştirmez.

Sık hatalar:

- Gmail bir uygulama parolası ister.
- GMX ve Web.de, başka programlar üzerinden gönderimin hesapta açılmasını
  ister.
- Gönderen adresi hesaba ait olmalı.
- Hiçbir zaman doğrudan kendi internet bağlantından gönderme, her zaman bir
  sağlayıcının SMTP sunucusu üzerinden gönder.

E-posta spama düşüyorsa, gönderen alan adı için çoğunlukla SPF, DKIM ve DMARC
kayıtları eksiktir. Değerleri posta sağlayıcısı verir. Bunu bir Gmail hesabına
gönderilen test e-postasında “Orijinali göster” ile denetleyebilirsin.

“Bana test e-postası” kendi hesabının adresine gider. Posta sunucusu yanıt
vermezse deneme 20 saniye sonra durur; bağlantı yine de kopyalanmak üzere
gösterilir.

### Oturumlarım

Kart, kendi hesabının nerelerde oturum açtığını gösterir ve “Diğer bütün
oturumları bitir” ile şimdiki oturum dışındaki bütün oturumları bitirir. Cihaz
ve IP adresi saklanmaz. Herkes yalnızca kendi oturumlarını görür.

### Güvenlik günlüğü

Yalnızca sahip yönetici içindir. Girişleri (başarılı ve başarısız),
kullanıcılardaki ve rollerdeki değişiklikleri, belirlenen parolaları,
oluşturulan ve kullanılan bağlantıları, dışa aktarmayı, içe aktarmayı,
yedeklemeyi ve anahtar değişimini kaydeder. İçinde olmayanlar: öğelerin
içerikleri, IP adresleri, tarayıcı kimlikleri.

“Tümü · Başarısız · Girişler · Kullanıcı · İki adımlı doğrulama · Veritabanı”
görünümlerinin her biri en yeni 100 satırı gösterir. Adlar “Kullanıcı” kartına
götürür. Satırlar 180 gün kalır ve bu süreden önce silinemez.

### Kim neyi yapabilir

Tek bir öğedeki yetkiler. “Yazar”, ilgili şeyi oluşturan kişidir.

| | Yazar | diğer herkes | Yönetici |
|---|---|---|---|
| her şeyi görme | ✔ | ✔ | ✔ |
| başlık, açıklama, fotoğraflar, videolar, etiketler, kategori, test edildi, reddedildi | ✔ | — | ✔ |
| ret gerekçesini yeniden yazma | reddeden kişi | — | reddeden kişi |
| ret gerekçesini kaldırma | ✔ | — | ✔ |
| öğeyi silme | ✔ | — | ✔ |
| favori | herkes kendisi için | | |
| kendi değerlendirmesi, kendi test günü | ✔ | ✔ | ✔ |
| bağlantı ekleme, dosya yükleme | ✔ | ✔ | ✔ |
| kendi bağlantısını, kendi dosyasını silme | ✔ | ✔ | ✔ |
| başkasının bağlantısını, başkasının dosyasını silme | — | — | ✔ |
| klasör oluşturma | ✔ | ✔ | ✔ |
| klasörü yeniden adlandırma, klasöre yükleme | ✔ | — | — |
| klasörü silme | ✔ | — | ✔ |
| dosyayı taşıma, yalnızca kendi klasörlerine | ✔ | — | — |
| “Dosyalar” altındaki bir videonun küçük resmini belirleme | ✔ | — | — |
| bağlantıları yeniden sıralama | ✔ | — | ✔ |
| yorum yazma | ✔ | ✔ | ✔ |
| kendi yorumunu değiştirme | ✔ | — | — |
| başkasının yorumunu silme | — | — | ✔ |
| bir yorumun türü ve sabitlenmesi | ✔ | — | ✔ |
| başkasının test gününü ya da değerlendirmesini silme | — | — | ✔ |
| başkasının puanını ya da değerlendirmesini değiştirme | — | — | — |
| kimin nasıl değerlendirdiğini görme | — | — | ✔ |
| yoruma resim ya da video ekleme | ✔ | — | — |
| yorumdaki resmi ya da videoyu silme | ✔ | — | ✔ |

Yönetici başkalarının katkılarını siler, ama değiştirmez. Başkasının yorumundan
bir resmi kaldırırsa orada “Yönetici 2 resim veya video kaldırdı” yazar.

### Yazar

İkinci hesaptan itibaren öğe, yorum ve test günü yazarını gösterir. Bağlantılar
ve dosyalar onları kimin eklediğini gösterir, öğenin yazarı olsa bile; tarih
fareyle üzerine gelince görünür. Değerlendirme yalnızca kendi değerini ve
ortalamayı gösterir; kimin nasıl değerlendirdiğini yalnızca yönetici
“Kim değerlendirdi” ile görür.

## Genel görünüm

### Arama

Arama şu yerlerde metin bulur: başlık, açıklama, kategori, öğedeki etiketler,
test günlerindeki etiketler, bağlantı adresleri ve yorumlar. `/` arama alanına
atlar. Büyük ve küçük harf fark etmez; `ß` ile `ss` farklı sayılır.

Her sonuç döşemesi, başlığın altında arama sözcüğünün nerede geçtiğini
gösterir, örneğin “yorum: …Bellavista'da önerildi…”. Sözcük döşemede, bağlantı
listesinde ve yorumlarda vurgulanır. Açılan bir sonucun adresi sözcüğü taşır
(`#/item/12?q=ella`); sayfa yeniden yüklenince vurgu kalır.

Oluştururken “Benzer başlıklar: …” benzer başlıklı mevcut öğeleri gösterir.

### Filtre ve sıralama

- **Durum:** Tümü, Test edildi, Test edilmedi. Ayrıca “Ret” (Tümü, Reddedildi,
  Reddedilmedi) ve “★ Favoriler”. Hepsi birlikte kullanılabilir.
- **Kategoriler:** birden fazlası seçilebilir, her zaman “ya da” ile.
  “Kategorisiz” kategorisi olmayan öğeleri gösterir.
- **Etiketler:** birden fazlası seçilebilir. Geçiş düğmesi “Ve” (varsayılan)
  ile “Ya da” arasında seçim yapar. Soluk görünen bir etiket eklenirse hiç
  sonuç kalmaz.
- **Potansiyel ve Değerlendirme:** her biri “Tümü”, “Yok” ve “Kısmen”; kendi
  yıldızlarına göre. “Yok”: o kutuda kendi yıldızı yok. “Kısmen”: kendi
  yıldızları eşiğin altında, varsayılan olarak ölçütlerin %80'i.
  “Değerlendirme”de yalnızca test edilmiş öğeler sayılır. Eşiği bir yönetici
  “Değerlendirme: ölçütler” kartında ayarlar. Potansiyel modu kapalıysa ya da
  bir kutunun ölçütü yoksa onun grubu görünmez.
- **“Filtreleri sıfırla (n)”** bir filtre seçildiği anda sıralama satırında
  görünür. Arama sözcüğü, sıralama ve kayıtlı görünümler kalır.
- **Sıralama:** son değişikliğe, değerlendirmeye, potansiyele, başlığa, test
  günü sayısına, ortalamaya ve son günün puanına göre. Yanındaki düğme yönü
  çevirir. Değeri olmayan öğeler her zaman sonda durur.

Filtreler ve sıralama kaydedilir ve her cihazda geçerlidir.

Döşeme, test edilmiş öğelerde değerlendirmeyi (“★ 3,8”), diğerlerinde
potansiyeli (“◆ 4,2”) gösterir.

### Kayıtlı görünümler

“+ Görünümü kaydet” bütün filtre ayarını arama sözcüğüyle birlikte bir düğme
olarak saklar. Düğmedeki çarpı onu kaldırır. Hesap başına en çok sekiz görünüm.

### Zaman çizgisi

Filtrelerle döşemeler arasında: her test günü için bir nokta, yatayda tarih,
dikeyde puan. Bir tıklama öğeyi açar. Beş test gününden itibaren görünür ve
“Görünüm” kartında kapatılabilir.

### Karşılaştırma

Bir döşemedeki işaret öğeyi karşılaştırmaya alır. İki hesaptan itibaren
“Benimkiler / Tümü” kendi değerlerinle herkesin ortalaması arasında geçiş yapar.

### Zil ve “Açık görevler”

Zil, son açılıştan beri başkalarının yeni yorumlarını ve değerlendirmelerini
bildirir. Panel bunları “Bana yönelik” (`@name` ile anılanlar), “Bana ait
Öğeler” ve “Diğer her şey” olarak ayırır. Her satır neyin yeni olduğunu söyler
ve öğeye götürür. Yorumların yazarı gösterilir; değerlendirmeler anonim kalır.

Zilin sınırları:

- Genel görünüm yüklenirken hesaplar, sürekli değil.
- Bildirim başına okundu bilgisi tutmaz: paneli açmak her şeyi görüldü sayar.
- Değişen başlıkları, yeni dosyaları ve yeni test günlerini bildirmez.

“Açık görevler” bütün öğelerin tamamlanmamış görevlerini sayar. Arkasındaki görünüm
bunları son tarihe göre sıralar: gecikmiş, bugün, daha sonra, tarihsiz.
Görevler doğrudan orada tamamlandı olarak işaretlenir.

## Öğe

### Fotoğraflar ve videolar

- Ekleme: dosya seçerek, Ctrl+V ile ya da alana bırakarak.
- Fotoğraflar 30 MB'a, videolar (MP4, WebM, MOV) 20 MB'a kadar. Sınırları
  sahip yönetici ayarlar. Fotoğraf sayısı sınırlı değildir. Bir video çok
  büyükse ama “Dosya” sınırının altındaysa, ileti “Dosyalar” bloğunu gösterir:
  video orada yüklenebilir.
- Sıradaki ilk resim ana resimdir. Sıra, küçük resimler sürüklenerek
  değiştirilir.
- ← → tuşlarıyla ya da ekrandaki oklarla gezinilir. Bir tıklama tam ekranı
  açar, ikincisi özgün boyuta yakınlaştırır, Esc kapatır. Tam ekranda ↓ dosyayı
  indirir. Bir video odaktaysa, örneğin üzerine tıklandıktan sonra, ← ve →
  videoda 5 saniye geri ya da ileri atlar; öğede de tam ekranda da.
- **Bağlantıyı kopyala:** tam ekrandaki zincir simgesi gösterilen fotoğrafın ya
  da videonun adresini kopyalar. Adres öğeyi ve tam ekranı bu noktada açar.
- Videolar kendiliğinden oynamaz ve gezinirken durur.
- **Videodaki yer:** Bir video en son durdurulduğu ya da kapatıldığı yerden
  devam eder; hesap başına ve her cihazda. 10 saniye boyunca videonun üzerinde
  “Devam: 3:12” ve “Baştan” görünür. 10 saniyenin altında ve son bölümde (%5,
  en az 10 saniye) Kriterion hiçbir şey hatırlamaz; video o zaman baştan
  başlar. Bu, “Dosyalar” altındaki ve yorumlardaki videolar için de geçerlidir.
- **Videonun tamamını yükleme:** Tam ekranda bir videonun üstünde “Tamamını
  yükle” yazar; bilgisayarda 2 GB'a, telefonda 500 MB'a kadar. Düğme videoyu
  durdurur ve dosyanın tamamını bir kez yükler; üstte “%45 yüklendi” yazar.
  Sonra video aynı yerden devam eder ve atlamak için yükleme gerekmez. Tekrar
  basmak yüklemeyi durdurur. Kopya, sayfa yeniden yüklenene ya da başka bir
  video tamamen yüklenene kadar kalır. Düğme olmadan tarayıcı videoyu her
  zamanki gibi parça parça yükler. Bu, “Dosyalar” altındaki ve yorumlardaki
  videolar için de geçerlidir.
- **Seçme:** Resim şeridinin üstündeki “Seç” her fotoğrafa ve videoya bir
  kutucuk koyar; tıklama ya da boşluk tuşu seçer. Alttaki çubuk sayıyı gösterir
  ve onay sorusuyla “Sil”, “Tümünü seç” ve “İptal” sunar; Esc seçimi bitirir.
  Yalnızca öğenin yazarı ve yönetici için.
- Panodan yapıştırılan bir resim özgün dosyadan belirgin biçimde büyük olur.
  Dosyanın kendisini yüklemek daha iyidir.

### Kırpma

Resmin üstündeki “Kırpma”, döşemede hangi kare parçanın görüneceğini belirler.
Çerçevenin dışında sürüklemek yeni bir çerçeve çizer, çerçevenin içinde
sürüklemek onu taşır, köşeler ve kenarlar boyutu değiştirir. Kaydırıcı
yakınlaştırmayı ayarlar (telefonda tek boyut ayarı budur). Özgün resim
değişmez.

### Etiketler, dosyalar, bağlantılar

- **Etiketler:** Etiket bulutunda bir tıklama etiketi verir ya da kaldırır. Test
  günleri kendi etiketlerini taşıyabilir.
- **Dosyalar:** “Dosyalar” bloğunda döşeme ya da liste olarak durur. Bloğun
  başlığındaki “Döşeme” ve “Liste” ile geçiş yapılır; seçim bütün öğeler için
  ve her cihazda geçerlidir. Döşeme küçük resmi ya da uzantıyı, altında adı ve
  boyutu gösterir. Liste her dosya için bir satır gösterir: ufak bir küçük
  resim, ad, tür, boyut, yükleme tarihi ve birden fazla hesap varsa yükleyen
  kişi; telefonda boyut ve tarih adın altında durur. Tür şunlardan biridir:
  Video, Görsel, PDF, Word, Excel, PowerPoint, Metin, Arşiv ya da Diğer; bir
  videoda bu sütunda codec ve süre durur, örneğin “H.265 · 3:12”, bir görselde
  gösterildiği gibi biçim ve piksel, örneğin “PNG · 1920 × 1080”. Okunmuş bilgi
  yoksa orada “Görsel” yazar. Kapalıyken bloğun başlığı yalnızca sayıları ve
  boyutu gösterir, örneğin “3 klasör · 12 video · 9 görsel · 4 diğer ·
  1122,2 MB”; dosyası olmayan bir tür görünmez. Sıralama, görünüm ve düğmeler
  yalnızca açık başlıkta durur. Tıklama, menü, önizleme ve klavye iki görünümde
  de aynıdır. Dosya başına 2 GB'a kadar
  (“Dosya” sınırı), öğe başına en çok 100 dosya.
- **Bilgisayarda liste:** Listenin üstünde bir başlık satırı durur. “Ad”, “Tür”,
  “Boyut” ya da “Tarih” üzerine bir tıklama ona göre sıralar, ikinci tıklama
  yönü ters çevirir; sıralanan sütunda ▲ ya da ▼ durur. Her satırın sonunda ✎
  (düzenle; yalnızca düzenleme iznin olan bir dosyada) ve 🔗 (dosyanın
  bağlantısını kopyala) durur; telefonda ikisi de yalnızca menüdedir.
- **Sıralama:** “Döşeme” ve “Liste” yanındaki seçim alanı “Ad”, “Tarih”,
  “Boyut” ya da “Tür” seçeneğine göre sıralar. Yanındaki düğme yönü ters
  çevirir: “A → Z” ve “Z → A”, “eski → yeni” ve “yeni → eski”, “küçük → büyük”
  ve “büyük → küçük”. Seçenek değişince “A → Z”, “eski → yeni” ya da
  “büyük → küçük” geçerli olur; varsayılan, “Tarih” ve “eski → yeni”
  seçenekleridir. “Tür” türleri “Türe göre gruplanmış” düzenindeki gibi, her
  türün içinde de ada göre sıralar; “Z → A” ikisini de ters çevirir. Seçim
  bütün öğeler için ve her cihazda geçerlidir. Tarih, yükleme tarihidir. “Ad”
  büyük ve küçük harf ayrımı yapmaz; “2” sıralamada “10” değerinden önce gelir.
  Klasörsüz dosyalar üstte kalır, her klasör bir grup olarak kalır; klasörler
  aynı seçime uyar: boyuta göre sıralamada dosyalarının toplamıyla, “Tür”
  seçildiğinde ada göre. Süren yüklemeler gruplarının sonunda durur.
- **Gruplama:** İkinci seçim alanındaki “Türe göre gruplanmış” her tür için
  sayıyla birlikte bir ara satır koyar, örneğin “PDF · 3”. Türler ada göre
  sıralanır, “Diğer” en sonda; her türün içinde sıralama geçerlidir. Her klasör
  kendi tür gruplarını alır. Tam ekran aynı sırayla gezinir. Seçim, sıralama
  gibi, bütün öğeler için ve her cihazda geçerlidir.
  Yükleme “+” döşemesiyle, listede “Dosya yükle” ile ya da dosyaları bloğun
  üstüne bırakarak yapılır. Her dosya hemen bir döşeme olarak görünür ve tek tek
  yüklenir, en küçüğü önce. Döşeme “bekliyor”, yüzde olarak ilerlemeyi ya da
  nedeniyle birlikte ⚠ gösterir. Başka bir öğe açıldığında yükleme sürer; sekme
  kapatılırken tarayıcı onay ister. Sunucuyla bağlantı yoksa Kriterion 2, 5 ve
  15 saniye sonra yeniden dener.
- **Klasörler:** Bloğun başlığındaki “Klasör ekle” bir klasör oluşturur; ad
  1 ile 80 karakter arasındadır, aynı adlara izin verilir. Üstte klasörsüz
  dosyalar, altında sıralama düzeninde klasörler durur; her grubun kendi
  çerçevesi vardır, kapalı bir klasör bir çubuktur. Başlığa bir tıklama klasörü
  açar ya da kapatır; Kriterion bunu hesap başına, her cihazda hatırlar. Yeni
  bir klasör açık durur. Bir klasöre atlamak, örneğin test günü satırından, onu
  yalnızca o an için açar. Başlık dosyaların sayısını ve boyutunu, birden fazla
  hesap varsa klasörü kimin oluşturduğunu da gösterir; kapalıyken
  yüklemelerinin durumunu gösterir. Kendi klasörüne onun “+” düğmesiyle ya da
  üstüne bırakarak yüklersin; başkasının klasörüne kimse yükleyemez. Kendi
  dosyanın menüsündeki “Şuraya taşı …” kendi klasörlerini ve “Klasörsüz”
  seçeneğini sunar; dosya adresini, küçük resmini ve “Herkes düzenleyebilir”
  ayarını korur. Klasördeki ⋯ menüsü “Düzenle …”, “Bağlantıyı kopyala” ve
  “Klasörü sil” sunar; silinen bir klasörün dosyaları bundan sonra klasörsüz
  durur. Dosyalar yüklenirken klasör silinirse bekleyen dosyalar
  ⚠ “Bu klasör artık yok.” gösterir. Hâlihazırda süren bir yükleme tamamlanır;
  dosya sonra klasörsüz durur.
- **Test gününe bağlı klasör:** Oluştururken ve “Düzenle …” altında kendi
  klasörüne aynı öğenin kendi test günlerinden biri bağlanabilir; bir test
  gününün en çok bir klasörü olur. Test günü satırı o zaman 📁 gösterir; bir
  tıklama bloğu ve klasörü açar. Klasörün başlığı tarihi ↑ ile gösterir ve test
  günü satırına geri götürür. Test günü silinirse klasör adı ve dosyalarıyla
  kalır.
- **Parça parça yükleme:** Her dosya 8 MB'lık isteklerle yüklenir. İnternet
  bağlantısı koparsa döşeme durumuyla birlikte “kesildi” gösterir; bağlantı
  gelir gelmez yükleme kendiliğinden sürer. Sekme kapatıldıysa menüdeki
  “Sürdür” aynı dosyayla devam eder. Kesilen bir yükleme 24 saat sonra
  geçersiz olur. Her hesabın en çok üç açık yüklemesi olur. Telefonda sayfayı
  açık ve ekranı açık tut.
- **“Ek” sınırının üstünde:** “Ek” sınırını aşan bir dosyanın metin önizlemesi
  ve küçük resmi olmaz ve dosya Document Server'da açılmaz; indirilir. PDF'leri,
  resimleri ve videoları tarayıcı göstermeye devam eder. Hiçbir dışa aktarma bu
  dosyaları içermez; yedeklemede bulunurlar.
- **Diskteki dosyalar:** Kriterion her dosyayı ayrı ayrı şifreleyerek
  veritabanıyla aynı dizinde saklar. Sunucuda bir dosya eksikse döşemesi ⚠
  gösterir.
- **Seçme:** Bloğun başlığındaki “Seç” silme iznin olan her dosyaya bir
  kutucuk koyar; tıklama ya da boşluk tuşu seçer. Bir klasörün başlığındaki
  kutucuk içindeki bütün dosyaları, çubuktaki “Tümünü seç” bütün dosyaları
  seçer. Çubuk sayıyı gösterir ve onay sorusuyla “Sil”, seçilen her dosya
  senin dosyansa “Şuraya taşı …” sunar. “İptal” ya da Esc seçimi bitirir.
- **Dosyaya tıklama:** Bir resim ya da video tam ekranı açar; ← ve → aynı
  gruptaki (klasörsüz ya da aynı klasördeki) resimler ve videolar arasında,
  gösterim sırasıyla gezinir. PDF, metin, Markdown, CSV, log ve `.docx`
  dosyaları önizlemeyi döşemelerin altında, telefonda ayrı sayfada gösterir.
  Yönetici bir Document Server açtıysa bu, Word, Excel ve PowerPoint dosyaları
  ve bunların OpenDocument karşılıkları için de geçerlidir; görüntüleyicinin
  altında dosyayı hangi Document Server'ın gösterdiği yazar. Diğer her dosya
  kendi menüsünü açar. Bir tıklama hiçbir zaman indirme yapmaz.
- **Videolar:** MP4, M4V, WebM ve MOV tam ekranda oynar, iPhone'da da. Döşeme
  bir küçük resim, ▶, süreyi ve sol altta codec'i gösterir, örneğin “H.265”;
  bir görselin döşemesi orada biçimi gösterir, örneğin “JPEG”.
  Kriterion codec'i yükleme bittikten sonra okur; güncellemeden önceki
  videolarda bir sonraki başlatmada. Küçük resim yükleme sırasında tarayıcıda,
  sürenin %10'unda oluşur. Eksikse, örneğin bir içe aktarmadan sonra, videoyu
  yükleyen kişinin tarayıcısı öğe açıldığında onu oluşturur. ⋯ menüsündeki
  “Küçük resmi seç …” tam ekranı açar; orada “Bu kareyi küçük resim yap”
  gösterilen kareyi alır. Bunu yalnızca videoyu yükleyen kişi yapabilir.
  Tarayıcı bir videoyu oynatamazsa, örneğin Firefox'ta HEVC, orada bir cümle ve
  “İndir” durur.
- **Bir belgenin küçük resmi:** Metin, Markdown, CSV ve log dosyaları döşemede
  ilk satırlarını gösterir. Word, Excel ve PowerPoint dosyaları, bunların
  OpenDocument karşılıkları ve PDF, yönetici bir Document Server açtıysa ilk
  sayfayı gösterir. Resim, yükleme bittikten birkaç saniye sonra ve
  düzenleyicide her kaydetmeden sonra yeniden oluşur. Uzantı resmin üstünde
  durur. Document Server bir dosyayı dönüştüremezse uzantı kalır.
- **Önizleme:** blokta en çok bir tane, kendi grubunun döşemelerinin altında;
  başka bir döşemeye tıklamak onu değiştirir, aynı döşemeye tıklamak kapatır,
  klasörünü kapatmak da. Başlıkta ⤢ ayrı sayfayı açar, ↓ indirir, × ya da Esc
  kapatır. Kriterion bir resim dosyasını resim olarak okuyamazsa döşemede
  uzantı durur.
- **⋯ menüsü:** her döşemede durur ve yalnızca izin verilenleri, çizgilerle
  ayrılmış beş grupta sunar: “Aç” ve “Düzenle”; “İndir”,
  “Bu dosyaya bağlantıyı kopyala” ve “Ayrıntılı bilgi” ya da “Bilgi”;
  “Yeniden adlandır …”, “Şuraya taşı …” ve “Küçük resmi seç …”; “Önceki sürümü geri yükle” ve “Herkes düzenleyebilir”;
  “Dosyayı sil”. Üstte ad, birden fazla hesap varsa dosyayı kimin ne zaman
  yüklediği de durur. Telefonda menü alt kenarda açılır. Hâlâ yüklenen bir
  döşemede “İptal”, bir hatadan sonra “Yeniden dene” ve “Kaldır” durur.
- **Ayrıntılı bilgi:** Bir resmin ya da videonun ⋯ menüsündeki
  “Ayrıntılı bilgi” ve tam ekrandaki ⓘ dosyada yazanları gösterir. ⓘ öğenin
  fotoğraflarının ve videolarının tam ekranında da durur. Genel: videolarda
  kapsayıcı, diğerlerinde biçim; ayrıca dosya boyutu, süre, toplam bit hızı,
  kayıt tarihi ve ses parçalarının sayısı. Video: codec, profil, çözünürlük,
  kare hızı, bit hızı, bit derinliği, renk alt örneklemesi ve HDR. H.264 ve
  H.265, MediaInfo'daki adı parantez içinde taşır, örneğin “H.265 (HEVC)”;
  listede ve küçük resimde kısaca “H.265” yazar. Her ses parçası için: codec,
  kanallar, örnekleme hızı, bit hızı ve dil. Görsel: ana resim; biçim,
  gösterildiği gibi çözünürlük, bit derinliği, renk uzayı ve renk alt
  örneklemesi. Dosyadaki küçük resimler, örneğin EXIF bloğundakiler, sayı ve
  boyutlarıyla tek satırda durur. Çekim: EXIF'ten çekim zamanı, kamera,
  objektif, pozlama süresi, diyafram, ISO ve odak uzaklığı; dosya taşıyorsa
  35 mm karşılığıyla. Dosyada bir konum varsa yalnızca “Dosyada konum: evet”
  durur; Kriterion koordinat saklamaz. EXIF'te çekim zamanı varsa görsellerde
  “Genel” altındaki “Kayıt tarihi” görünmez. Güncellemeden önceki görselleri
  Kriterion başlatmadan sonra bir kez yeniden okur. Dosyanın belirtmediği
  bilgiler görünmez.
- **Bilgi:** Bir Word, Excel, PowerPoint ya da PDF dosyasının ve bunların
  OpenDocument karşılıklarının ⋯ menüsündeki “Bilgi” iki grup gösterir.
  “Kriterion'da”: yükleyen ve yükleme tarihi, yüklemeden önce değiştirilme
  (dosyanın bilgisayardaki zamanı, yalnızca güncellemeden sonraki dosyalarda),
  Document Server'da son kaydeden ve son kaydetme tarihi, kaydetme sayısı ve
  önceki sürümün tarihi. “Dosyada”: başlık, oluşturan, oluşturulma, son
  düzenleyen, değiştirilme, sayfalar, sözcükler, slaytlar ve uygulama; PDF'te
  başlık, yazar, oluşturma aracı, üreten, oluşturulma, değiştirilme ve
  sayfalar. Pencere açılınca okunur; bir Office dosyasının 1 MB'ı aşan
  parçaları ve PDF'te ilk ve son MB dışındaki her şey okunmaz. `.doc`, `.xls`,
  `.ppt` ve `.rtf` dosyalarında yalnızca Kriterion'daki bilgiler durur. Eksik
  olan görünmez.
- **Yeniden adlandırma:** Kendi dosyasının ⋯ menüsündeki “Yeniden adlandır …”
  adı uzantısız gösterir; uzantı kalır. Enter kaydeder, Esc iptal eder. Aynı
  klasörde, klasörsüz dosyalarda da, ikinci bir dosya aynı adı taşıyamaz;
  büyük ve küçük harf fark etmez. Yeniden adlandırmayı yalnızca dosyayı
  yükleyen kişi yapabilir, dosya Document Server'da açıkken de. Önceki sürüm
  yeni adı kendi uzantısıyla alır.
- **Klavye:** Tab her döşemeye ve onun ⋯ düğmesine ulaşır. Shift+F10 menüyü
  açar, ↑ ve ↓ seçer, Enter uygular, Esc kapatır.
- **Bağlantıyı kopyala:** dosyanın adresini kopyalar. Bir resmin ya da videonun
  adresi öğeyi ve içinde tam ekranı açar. Diğer her adres dosyayı ayrı sayfada
  açar; önizlemesi olmayan bir dosya orada ↓ ile indirilir.
- **Ayrı sayfa:** dosyayı bütün pencerede gösterir. Sol üstteki ok ve sağ
  üstteki ✕ öğeye, dosyanın döşemesine geri götürür; dosyanın klasörü o zaman
  açık durur. Çubuktaki tam ekran simgesi yalnızca belgeyi bütün ekranda
  gösterir, yatayda da; geri tuşu ya da Esc bunu bitirir. Tarayıcı tam ekranı
  desteklemiyorsa simge görünmez.
- **Düzenleme:** Menüdeki “Düzenle” dosyayı düzenlemek için ayrı sayfada açar;
  yalnızca düzenleme iznin olan dosyalarda durur. “Aç” dosyayı görüntülemek
  için gösterir. Dosyayı yükleyen kişi düzenleyebilir. Dosyada
  “Herkes düzenleyebilir” açıksa her hesap düzenler; değilse yönetici de
  düzenleyemez, dosyayı yalnızca silebilir. Yeni dosyalarda bu ayarın açık
  olup olmayacağını her hesap kendi bölümünde “Belgeler” altında belirler;
  kendi ayarı yoksa yöneticinin başlangıç değeri geçerlidir. Tek bir dosyada
  ayarı, dosyayı yükleyen kişi menüdeki “Herkes düzenleyebilir” ile ya da
  sayfanın çubuğundaki işaretle değiştirir.
  Kaydetme, düzenleyicideki Kaydet ile ve son kişi sayfadan çıktıktan yaklaşık
  10 saniye sonra olur. Bu sırada `.doc`, `.xls` ve `.ppt` dosyaları `.docx`,
  `.xlsx` ve `.pptx` olur; sayfa önce onay ister, OK verilmezse dosya yalnızca
  görüntülenir. Telefonda yalnızca görüntülenir.
- **Önceki sürüm:** Kriterion son düzenlemeden önceki sürümü saklar. Menüdeki
  “Önceki sürümü geri yükle” ya da sayfanın çubuğundaki ↶ onu geri yükler;
  şimdiki sürüm bu sırada önceki sürüm olur, ikinci kez yapmak işlemi geri
  alır. Önceki sürüm yalnızca yedeklemede bulunur, JSON dışa aktarmasında ve
  çöp kutusunda bulunmaz.
- **Bağlantılar:** herkes ekleyebilir. Yeniden sıralamayı öğenin yazarı ya da
  yönetici yapabilir. Adres olmayan bir metin (sözcük, ürün numarası)
  ayarlanmış arama motorunda bir aramaya dönüşür.

### Açıklama

Metne ya da kaleme tıklamak alanı açar, alandan çıkmak kaydeder, Esc
değişiklikleri iptal eder. Biçimlendirme yorumlardakiyle aynıdır.

### Test günleri

Yalnızca “Test edildi” durumunda. Her satır bir gündür ve bir genel puan
taşır. Bir tarih her kullanıcı için bir kez bulunur; aynı tarihi yeniden girmek
puanı değiştirir. Üç günden itibaren bir eğri gidişatı gösterir. Test günleri
olduğu sürece “Test edildi” geri alınamaz. Bir test gününün klasörü varsa
satırında 📁 durur; bir tıklama klasöre atlar.

### Reddetme

“Reddedildi” seçildiğinde gerekçe için bir alan açılır (isteğe bağlı, en çok
200 karakter). Sonra orada örneğin şu yazar: “14.03.2026, 09:12 tarihinde Anna
tarafından reddedildi — teslim süresi 6 aydan uzun.” Gerekçeyi yalnızca
reddeden kişi değiştirebilir; öğeyi değiştirme izni olan herkes gerekçeyi
kaldırabilir (✕). Ret geri alınıp sonra yeniden seçilirse eski gerekçe alanda
öneri olarak durur.

### Bloklar

Bir öğenin blokları tutamaktan sürüklenerek taşınabilir ve başlık satırından
kapatılabilir. Düzen bütün öğeler için geçerlidir ve “Görünüm” kartında
sıfırlanır. Bir atlama kapalı bir bloğu açarsa bu yalnızca o an için geçerlidir;
başlık satırına bir tıklama bloğu yeniden kapatır.

### Silme ve çöp kutusu

Her silme onay ister. Öğede onay sorusu, öğeye bağlı olanları sayar. Silinen
öğeler ve “Dosyalar” altında tek tek silinen dosyalar 30 gün çöp kutusunda
kalır; bunları sahip yönetici geri getirebilir (Ayarlar › Veriler,
“Çöp kutusu” kartı). Klasörler ile bir videonun küçük resmi ve süresi de geri
gelir. Öğenin fotoğrafları ve videoları ile yorumlardaki resimler hemen
silinir.

**Silinen dosyalar …** sahip yönetici için “Dosyalar” bloğunun başlığında durur.
Pencere, öğenin silinen dosyalarını çöp kutusundan ve okunabilen her
yedeklemeden, kaynağı ve klasörüyle birlikte listeler. “Geri al” seçilen
dosyaları eski yazarı ve tarihiyle öğeye geri koyar. Klasörleri yoksa aynı
adla yeniden oluşur. Document Server bir dosyayı yedeklemeden sonra
kaydettiyse, yedeklemedeki sürüm adında “(Backup GG.AA.YYYY)” ile ayrı bir
dosya olarak eklenir. Kopyası yedekleme klasöründe olmayan bir dosya
kutucuksuz durur.

## Yorumlar

Bir yorumun bir **türü** (not, rapor ya da görev) vardır ve yorum
**sabitlenmiş** olabilir. Sıra: sabitlenmişler, sonra açık görevler, raporlar,
notlar; her grubun içinde en eskisi üstte. Tür düğmesi sırayla geçer:
not → görev → tamamlandı → not.

Sol kenar türü gösterir: turuncu rapor, mavi görev, yeşil tamamlandı.
Sabitlenmiş yorumların altın rengi bir çerçevesi olur.

- **Son tarih:** bir görev bir tarih taşıyabilir. Hatırlatma yapılmaz, hiçbir
  şey gönderilmez.
- **Anma:** metindeki `@name` bir kullanıcıyı anar; kullanıcı zilde bir
  bildirim alır. Boşluk içeren adlar anılamaz.
- **Resimler ve videolar:** yorum başına toplam 6 taneye kadar. Resimler
  küçültülerek, videolar değiştirilmeden saklanır (20 MB'a kadar).
- **Biçimlendirme:** `**fett**`, `_kursiv_`, `` `Code` ``, `[Name](Adresse)`,
  `> ` alıntı, `- ` madde işareti, `1. ` numaralandırma. Alanın üstündeki menü
  ve Ctrl+B / Ctrl+I aynı karakterleri koyar. `\` bir karakterin etkisini
  kaldırır.
- `http://`, `https://` ya da `www.` ile başlayan **adresler** bağlantıya
  dönüşür.
- **Numara:** her yorumun bir numarası vardır (`#3`). Numaraya tıklamak yorumun
  adresini kopyalar; bir alana yapıştırılınca adres, öğe başlığıyla bir
  göndermeye dönüşür.
- **Bir dosyaya ya da fotoğrafa gönderme:** “Bağlantıyı kopyala” ile alınan bir
  adres metinde, açıklamada da, bir rozete dönüşür. Document Server dosyası
  (Word, Excel, PowerPoint, OpenDocument) simge ve dosya adı gösterir; bir
  tıklama altında küçük bir görüntüleyici açar, ikinci tıklama onu kapatır, ⤢
  ayrı sayfayı açar. Görüntüleyici ancak tıklanınca yüklenir; telefonda tıklama
  ayrı sayfayı açar. Bir resim dosyası döşemesini gösterir ve öğedeki tam
  ekranı açar, diğer dosyalar simge ve dosya adı gösterir ve ayrı sayfayı açar.
  Bir fotoğraf döşemesini gösterir ve tam ekranı açar.
  Silinmiş bir dosya “silindi” olarak durur.
- **Alıntılama:** başlık satırındaki tırnak işareti yorumu yazma alanına alır.
  Seçili metin “Alıntıla” menüsüyle alınabilir.

Blok başlığı kısaca sayar: **12 · ⚑3 · ☐3 · ☑2** (yorumlar, raporlar, açık ve
tamamlanmış görevler). Tam metin fareyle üzerine gelince görünür.

## Değerlendirme

Bir öğenin, kendi ölçütleri, ağırlıkları ve ortalamaları olan iki yıldız kutusu
vardır:

- **Potansiyel:** denemeden önce.
- **Değerlendirme:** denemeden sonra, yalnızca test edilmiş öğelerde.

Test edilmiş bir öğede değerlendirme açık, potansiyel kapalıdır; diğerlerinde
tersi. Kapalı kutu sayısını başlığında gösterir. Potansiyel modu
“Potansiyel: ölçütler” kartında kapatılabilir (yalnızca sahip yönetici);
yıldızlar bu sırada korunur.

- Yıldızlar kendi değerlendirmendir. İki kullanıcıdan itibaren yanında herkesin
  ortalaması, iki değerlendirmeden itibaren sayısıyla birlikte durur.
- Satır sonundaki yuvarlak düğme bu satırdaki kendi yıldızlarını kaldırır ve
  “Geri al” sunar.
- Ölçütler farklı ağırlıkta olabilir (adın arkasında `×1,5`). Ortalama 1 ile 5
  arasında kalır.
- Başlıktaki sayıya tıklamak hesabı gösterir: ölçüt başına puan, ağırlık ve
  çarpım, toplam, bölen, sonuç. Yalnızca değerlendirilmiş ölçütler sayılır,
  yuvarlama en sonda yapılır.

Ölçütleri yönetici ayarlarda, iki kutu için ayrı ayrı oluşturur. Bir ölçüt
sabit olarak bir kutuya aittir. Silinen bir ölçüt bütün yıldızlarını da siler.

## Ayarlar

Başlık satırındaki dişli çark ayarları açar. Her bölümün kendi adresi vardır.
Görünür kartı olmayan bölümler görünmez.

| Bölüm | Kartlar |
|---|---|
| Kişisel | Hesabım, Oturumlarım, Görünüm, Belgeler |
| Veriler | Kategoriler, Etiketler, Değerlendirme: ölçütler, Potansiyel: ölçütler, Sözcükler, Bağlantılar, Arama motorları, Çöp kutusu |
| Kullanıcı | Kullanıcı, Başvurular, Güvenlik günlüğü, Posta gönderimi |
| Veritabanı | Sayılar, Resim biçimleri, Yükleme sınırları, Yedekleme, Eski yedeklemeler, Dışa ve içe aktarma |
| Kurulum | Başlık, Diller, Belgeler |

Bir kullanıcı kendi kartlarını ve kategori, etiket ve ölçüt listelerini
düzenleyemeden görür. Geri kalan her şeyi yönetici görür; dışa aktarma, içe
aktarma, yedekleme ve güvenlik günlüğünü yalnızca sahip yönetici görür.

| Kart | İçerik |
|---|---|
| Başlık | giriş öncesi başlık (herkese görünür; az bilgi veren bir başlık seç) ve giriş sonrası başlık |
| Belgeler | Document Server üzerinden görüntülemeyi ve düzenlemeyi açma ve kapatma; “Herkes düzenleyebilir”: bir hesap kendi değerini belirlemediği sürece başlangıç değeri; kart bağlantıyı denetler. Adresler ve secret `.env` dosyasında durur, bkz. README |
| Sayılar | verinin kapsamı, veritabanı boyutu, diskteki dosyalar (bunlardan “Ek” sınırını aşanlar ve çöp kutusundakiler), yüklemeler, boş alan, sürüm, parmak izi, şifreleme yöntemleri; sahip yönetici için anahtar değeri. Yalnızca varsa: hâlâ veritabanında olup diske taşınmayı bekleyen dosyalar, eksik dosyalar, silinmeyi bekleyen dosyalar ve başvurusuz dosyalar. Başvurusuz dosyaları sahip yönetici “Sil” ile siler, ama yalnızca yedekleme klasöründe aynı boyutta bir kopya varsa |
| Kategoriler, Etiketler | oluşturma, yeniden adlandırma, silme; bir işaret, herkesin öğede yeni ad oluşturup oluşturamayacağını belirler |
| Değerlendirme: ölçütler, Potansiyel: ölçütler | oluşturma, yeniden adlandırma, sıralama, ağırlık verme (0,2 ile 2 arası, varsayılan 1); “Değerlendirme: ölçütler” kartında genel bakış filtrelerindeki “Kısmen” eşiği (1 ile 100 arası %, varsayılan 80) |
| Arama motorları | altı yerleşik ve en çok üç özel arama motoru (yer tutucu olarak `%s`); biri varsayılandır |
| Bağlantılar | görünür bağlantı satırlarının sayısı, kişisel |
| Görünüm | renk şeması, dil, yazı boyutu, küçük resimlerin boyutu, zaman çizgisi, blokların düzeni; kişisel |
| Belgeler (kişisel) | Document Server'daki görünüm (Kriterion gibi, Modern açık, Modern koyu) ve kendi yeni dosyaların için “Herkes düzenleyebilir” varsayılanı. Yalnızca Document Server açıkken |

### Yükleme sınırları

Onları yalnızca sahip yönetici değiştirir. Bir sonraki yüklemeden itibaren
geçerli olurlar.

| Tür | Varsayılan (MB) | ayarlanabilir (MB) |
|---|---:|---:|
| Fotoğraf | 30 | 1 ile 50 arası |
| Yorumdaki resim | 20 | 1 ile 50 arası |
| Video | 20 | 1 ile 100 arası |
| Yorumdaki video | 20 | 1 ile 100 arası |
| Ek | 50 | 1 ile 100 arası |
| Dosya | 2048 | 1 ile 4096 arası |

“Dosya”, “Dosyalar” altındaki dosya başına sınırdır. “Ek” sınırına kadar dışa
aktarma dosyanın içeriğini taşır ve dosyanın önizlemesi, küçük resmi ve
Document Server desteği olur; bunun üstünde dosya yalnızca indirilebilir, PDF,
resim ve video hariç. “Ek”, “Dosya” sınırından büyükse dosya başına sınır
olarak “Ek” geçerlidir. Dosyalar 8 MB'lık parçalar hâlinde yüklenir; fotoğraf
ve video sınırlarını öndeki reverse proxy geçirmelidir (README).

### Resim biçimleri

“Resim biçimleri” kartının “Saklama yöntemi” kısmı PNG resimlerinin nasıl
saklanacağını belirler:

| Yöntem | Etkisi |
|---|---|
| PNG | değişmeden, en çok yer kaplar |
| WebP kayıpsız | yaklaşık üçte iki daha küçük, varsayılan |
| WebP kayıplı | yalnızca fotoğraflar için anlamlı; metin içeren ekran görüntülerinde daha büyük |

JPEG, GIF ve WebP değişmeden kalır. “Mevcut resimleri dönüştür” yöntemi var
olan resimlere uygular; resimlerin eski hâli bundan sonra kalmaz. Önce bir
yedekleme yap.

### Yedekleme

Yalnızca sahip yönetici için. Eksiksiz, şifrelenmiş bir yedekleme oluşturur.
Kart yeri ve süreyi, son yedeklemeyi ve yedekleme klasörünün konumunu gösterir:
proje klasörünün içindeyse kırmızı, dışındaysa yeşil. Anahtar değişiminden
önceki yedeklemeler kırmızı işaretlidir. Geri yükleme sunucuda
`./backuptool.sh` ile yapılır (README, “Yedeklemeyi geri yükleme”).

Yedekleme, diskteki dosyaları yedekleme klasöründeki `kriterion-files/` içine
kopyalar, her dosyayı yalnızca bir kez. Kopyalama sürerken kart kopyalanan
dosyaların sayısını ve boyutunu gösterir. Diskte eksik dosya varsa kart
sayısını gösterir. Aynı yedekleme klasörüne zaten bir yedekleme yapılıyorsa,
başka bir kurulumdan bile olsa, düğme ikinci bir yedekleme başlatmaz ve bunu
bildirir.

### Eski yedeklemeler

Bütün yedeklemeleri numarası, tarihi, ne kadar eski olduğu ve boyutuyla
listeler. İkinci satır, yedeklemeyi yazan sürümü, dosyalarının sayısını ve
boyutunu ve bunlardan kaçının yalnızca bu yedeklemede bulunduğunu gösterir;
“geri yüklemeden önce”, `backuptool.sh` aracının geri yüklemeden önce
oluşturduğu yedeklemeyi işaretler. Listenin üstünde `kriterion-files/` içindeki
bütün dosyaların sayısı ve boyutu durur. “denetle” bir yedeklemeyi deneme
amaçlı açar ve öğeleri, fotoğrafları, hesapları, en yeni tarihi, listesindeki
dosyalardan kaçının `kriterion-files/` içinde bulunduğunu, sürümü ve şemanın
kurulu sürüme uyup uymadığını gösterir; “Bu anahtarla okunamıyor”, yedeklemenin
başka bir anahtara ait olduğu anlamına gelir.

Listenin başlığındaki “Seç” her yedeklemeye bir kutucuk koyar. Güncel anahtara
uyan en yeni N yedekleme seçilemez; bunlar kuralın koruduğu yedeklemelerle
aynıdır. Çubuktaki “Sil” onay ister, veritabanlarının ve yalnızca bu
yedeklemelerde bulunan dosyaların boyutunu gösterir ve ikinci onayı ister.

Temizleme bir yedeklemeyi yalnızca iki koşul birlikte sağlanırsa siler:
yedekleme en yeni N yedekleme arasında değildir (1 ile 20 arası) **ve** X
günden eskidir (7 ile 365 arası).

- “Her başarılı yedeklemeden sonra temizle” seçeneği başlangıçta kapalıdır.
  Temizleme yalnızca başarılı bir yedeklemeden sonra ya da düğmeyle yapılır.
- Yalnızca ayarlanan klasördeki `kriterion-….sqlite` kalıbına uyan yedeklemeler
  ve bunların `kriterion-….files` listeleri silinir; ayrıca `kriterion-files/`
  içinde, kalan hiçbir listenin anmadığı her kopya. Diğer dosyalar kalır.
  `kriterion-files` yedeklemeler için alt klasör olarak kullanılamaz.
- Anahtar değişiminden önceki yedeklemelere kural dokunmaz; onların kendi
  düğmesi vardır.
- Her silme güvenlik günlüğüne yazılır.

### Çöp kutusu

Yönetici görür, sahip yönetici işlem yapar. Kart son 30 günde silinenleri
listeler: öğeleri ve dosyaları. Bir dosyanın adının önünde öğesi ve klasörü
durur. “Geri yükle” öğeyi bütün içeriğiyle yeniden oluşturur ya da dosyayı
öğesine geri koyar, “Kalıcı olarak sil” siler. Başkalarının favorileri geri
gelmez. Bir kullanıcı silinirken ya da “Değiştir” ile yapılan bir içe aktarmayla
kaybolan öğeler çöp kutusuna düşmez.

## Dışa ve içe aktarma

İkisi de “Dışa ve içe aktarma” kartındadır, yalnızca sahip yönetici içindir ve
parola sorar.

| Yol | ne için |
|---|---|
| Tek dosyaya dışa aktarma | taşıma, arşiv, paylaşma; şifresiz |
| Parçalar hâlinde dışa aktarma | bir yükleme sınırı ya da bir veri taşıyıcısı büyük bir dosyaya engel olduğunda |
| Yedekleme | veritabanının eksiksiz, şifrelenmiş kopyası (README) |

Dışa aktarma dosyası yalnızca öğeleri, yazar adlarıyla birlikte içerir. Dosyalar
için işaret konursa klasörleri test günleriyle ve “Dosyalar” altındaki her
videonun küçük resmini de taşır; daha eski bir dışa aktarma dosyasından
dosyalar klasörsüz gelir. “Ek” sınırını aşan dosyaları hiçbir dışa aktarma
içermez; kart bunları önceden gösterir. İçe aktarma her dosyayı diske yazar.
İçinde olmayanlar:
kullanıcılar, parolalar, oturumlar, iki adımlı doğrulama, posta hesabı, başlık,
sözcükler, arama motorları, ayarlar, güvenlik günlüğü, çöp kutusu.

**Tek dosyaya dışa aktarma:** “Fotoğraflarla” ya da “Fotoğrafsız”; dosyalar ve
videolar için işaretler. Kart beklenen boyutu gösterir. 300 MB'tan itibaren
işlemin süreceğine dair bir uyarı çıkar. Tek bir öğe en çok yaklaşık 345 MB
dosya taşıyabilir.

**Parçalar hâlinde dışa aktarma:** her parça eksiksiz bir dışa aktarma
dosyasıdır. Parça boyutu seçilebilir (50 ile 300 MB arası). İçe aktarma:
parça 1 “Değiştir” ile, diğer bütün parçalar “Birleştir” ile.

**İçe aktarma:**

- **Birleştir** ekler ve var olan veriyi bırakır.
- **Değiştir** önce var olan veriyi siler. Geri alınamaz.

İçe aktarma ya her şeyi değiştirir ya da hiçbir şeyi. Katkılar aynı adlı
kullanıcılara, yoksa içe aktaran kişiye gider; sonraki ileti bu adları
gösterir. Bu yüzden taşımada kullanıcıları önceden aynı adlarla oluştur.

İlerleme göstergesi yoktur; işlem bitene kadar pencere açık kalmalı.

## Telefonda ve tablette

Aynı arayüz, genişliğe ve kullanıma uyarlanmış.

- Telefonda zil, “Açık görevler”, ayarlar ve çıkış menü simgesinin arkasındadır. Arama
  ve “+ Öğe” görünür kalır. Dokunmatik bir tablet de aynı menüyü alır.
- Telefonda filtreler kapalıdır. Düğme etkin filtrelerin sayısını gösterir.
- Bir öğenin altındaki “‹ Önceki” ve “Sonraki ›” genel görünümün sırasıyla
  gezinir.
- Resimde bir kaydırma hareketiyle gezinilir. Silme büyük resimde yapılır,
  önizleme döşemesinde değil.
- Parmakla sürükleyerek sıralamak için kısa bir süre basılı tutmak gerekir.
- Tam ekranda çift dokunma yakınlaştırır.
- Tarayıcıdaki “Ana ekrana ekle” ile Kriterion bir uygulama gibi eklenebilir.
  İnternet olmadan açılmaz.

## Dil

Almanca, İngilizce ve Türkçe. Herkes dilini “Görünüm” kartında seçer;
değişiklik hemen etki eder. Kendi seçimi olmayan için tarayıcının dili, o dil
yoksa kurulumun varsayılan dili geçerlidir. Giriş sayfası varsayılan dili
gösterir.

Sahip yönetici “Ayarlar › Kurulum › Diller” altında varsayılan dili ve
seçilebilir dilleri belirler. Yeni bir kurulum İngilizce başlar.

Kategori ve ölçüt adları her dil için ayrı girilebilir. Bir ad eksikse sırayla
şunlar geçerlidir: varsayılan dil, oluşturma sırasındaki dil, özgün metin.
Başka bir dilden gelen ad soluk ve italik durur, altında dili yazar. Listelerin
üstündeki dil satırı her dil için bir nokta (hepsi girilmiş) ya da eksik
adların sayısını gösterir.

## Sözcükler

Arayüzün on beş sözcüğü yeniden adlandırılabilir, örneğin “Öğe” → “Makine” ya
da “Test günü” → “Seans”; “Potansiyel”, “Değerlendirme” ve “Puan” da. Yalnızca
arayüzdeki yazılar değişir; veritabanı ve dışa aktarma dosyaları aynı kalır.
Alanların altındaki bir örnek, sözcükleri gerçek cümlelerde gösterir. Boş
alanlar varsayılana döner. Sözcükler her dil için ayrıdır.

## Açık ya da koyu

“Görünüm” kartında: Açık, Koyu (varsayılan) ya da Otomatik (işletim sistemini
izler). Ayar hesap başına geçerlidir. Tam ekran iki şemada da koyu kalır.

## Yazı boyutu

“Görünüm” kartında, yüzde 80 ile 120 arasında beş kademe. Aralıklar aynı kalır.
Giriş sayfası varsayılan boyutta kalır.
