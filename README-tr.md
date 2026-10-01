# Kriterion

[English](README.md) · [Deutsch](README-de.md) · Türkçe

![Node](https://img.shields.io/badge/Node-22-informational)
![Docker](https://img.shields.io/badge/Docker-Compose-informational)
![Lisans](https://img.shields.io/badge/Lisans-MIT-informational)

Toplanan ve değerlendirilen şeyler için kendi sunucunda barındırılan bir arşiv:
cihazlar, malzemeler, modeller, prototipler, tedarik kaynakları.

Her öğede fotoğraflar ve kısa videolar, kendi ölçütlerine göre bir
değerlendirme, yorumlar, test günleri, bağlantılar ve dosyalar bulunur. Öğeler
karşılaştırılabilir, filtrelenebilir ve aranabilir.

Her şey kendi sunucunda kalır: üçüncü taraflarda hesap yok, telemetri yok,
harici yazı tipi yok, CDN yok. Veritabanı bir bütün olarak şifrelidir
(SQLCipher, AES-256); fotoğraflar ve videolar onun içindedir. “Dosyalar”
altındaki her dosya tek tek şifrelenmiş (AES-256-GCM) olarak `data/files/`
altında durur, anahtarı veritabanındadır. Bir
[Document Server](#document-server) kullanılırsa her Office dosyası ve her PDF
ayrıca şifresiz olarak onun önbelleğinde de durur.

Node.js, Express, SQLCipher (`better-sqlite3-multiple-ciphers`), `sharp`,
`nodemailer`, `mediainfo.js` ve `exif-reader` ile geliştirildi. Ön yüz hiçbir
framework kullanmaz.

Bu dosya kurulumu ve işletimi anlatır. Kullanımı
[Kılavuz](manual-tr.md) anlatır.

---

**İçindekiler**

- [Özellikler](#özellikler)
- [Kimin için](#kimin-için)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Anahtar](#anahtar)
- [Yedekleme](#yedekleme)
- [Güncelleme](#güncelleme)
- [Reverse proxy arkasında](#reverse-proxy-arkasında)
- [Document Server](#document-server)
- [Sunucu komutları](#sunucu-komutları)
- [Sorun giderme](#sorun-giderme)
- [Kendi betiklerle programlama arayüzü](#kendi-betiklerle-programlama-arayüzü)
- [Bu kod nasıl yazıldı](#bu-kod-nasıl-yazıldı)
- [Lisans](#lisans)

---

## Özellikler

| | |
|---|---|
| Öğeler | başlık, açıklama, kategori, etiketler, fotoğraflar, kısa videolar, dosyalar, bağlantılar |
| Dosyalar | dosya başına 2 GB'a kadar, parçalar halinde yüklenir, yarıda kalırsa kaldığı yerden sürer; döşeme ya da liste olarak, ada, tarihe, boyuta ya da türe göre sıralı, türe göre gruplu, metin, Office ve PDF için de küçük resimli; klasörlerde; birden çok dosya bir kerede silinir ya da taşınır; silinen dosyalar 30 gün çöp kutusunda kalır ve yedeklemelerden tek tek geri alınabilir; resimler ve videolar için MediaInfo'daki gibi “Ayrıntılı bilgi”, öğenin fotoğrafları ve videoları için de; videolar en son izlenen yerden devam eder ve oynatılırken tamamen yüklenir |
| Değerlendirme | 1 ile 5 arası yıldız verilen kendi ölçütlerin, ölçüt başına bir ağırlık, bunlardan ağırlıklı bir ortalama |
| Yorumlar | not, rapor ya da son tarihli görev, yanında resimler ve videolar |
| Test günleri | puan ve etiket taşıyan tarihli girdiler |
| Karşılaştırma | birden çok öğe yan yana, ölçüt ölçüt |
| Arama ve filtreleme | başlık, açıklama, kategori, etiketler, bağlantılar ve yorumlarda tam metin arama; filtreler görünüm olarak kaydedilebilir |
| Birden çok kullanıcı | üç rol, her katkı yazarıyla |
| Yedekleme | tek tıkla şifreli yedekleme, `data/files/` altındaki dosyalar dahil, sunucuda tek komutla geri yüklenir; ayrıca anahtarsız bir JSON dışa aktarma |

## Kimin için

Bir kişi ya da birbirini tanıyan küçük bir grup için, Docker çalışan bir sunucu
ya da NAS ile. Birbirini tanımayan çok sayıda kullanıcı için değil.

Karar vermeden önce:

- Ölçütler bir kurulumdaki bütün öğeler için geçerlidir. Birden çok konu
  alanında toplayan kişi birden çok kurulum çalıştırır.
- Şifreleme dosyayı korur, kullanıcıları birbirinden korumaz. Kurulumu işleten
  kişi her şeyi okuyabilir.
- Anahtar olmadan veriler kaybolur. Kurtarma yolu yoktur.
- E-posta isteğe bağlıdır. Posta hesabı olmadan davet ve sıfırlama
  bağlantıları elle iletilir.

## Kurulum

Gereksinim: Docker ve Docker Compose. Node.js ve geri kalan her şey image'ın
içindedir.

**1. Projeyi indir**

```bash
git clone https://github.com/fardem/kriterion.git
cd kriterion
```

`git` olmadan: <https://github.com/fardem/kriterion> adresinde “Code” →
“Download ZIP”, sonra:

```bash
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion
cd kriterion
chmod +x keytool.sh backuptool.sh
```

`python3 -m zipfile -e` çalıştırma iznini ayarlamaz; `chmod` bunu sonradan
yapar. `unzip` ve `git clone` ile bu satır gerekmez.

**2. `.env` oluştur**

```bash
cp .env.example .env
```

Bütün değerler boş kalsa bile dosya var olmalıdır. Yoksa `docker compose`
hatayla durur.

**3. `docker-compose.yml` oluştur**

```bash
cp docker-compose.example.yml docker-compose.yml
```

**`cp docker-compose.example.yml docker-compose.yml` adımı zorunludur.**
Dosya olmadan `docker compose up` “no configuration file provided: not found”
iletisiyle durur. Bu çalışma kopyası depoda yer almaz; kendi değişikliklerin
bir güncellemede korunur.

**4. Başlat**

```bash
docker compose up -d --build
```

Kaynak kod image'ın içinde olduğu için `--build` gereklidir. Ardından
Kriterion `http://<server-ip>:3100` adresinden erişilebilir.

Tarayıcıdaki ilk açılışta kullanıcı adı ve parola belirlenir (en az on
karakter). Bu hesap sahip yöneticidir. Ölçütler, başka kullanıcılar ve posta
gönderimi arayüzde ayarlanır; bkz. [Kılavuz](manual-tr.md).

## Yapılandırma

| Dosya | Ayar | boş ya da değiştirilmemişse |
|---|---|---|
| `.env` | `ENCRYPTION_KEY`: veritabanının anahtarı | anahtar `data/encryption.key` içinde durur, bkz. [Anahtar](#anahtar) |
| `.env` | `BEHIND_PROXY=1`: önünde HTTPS kullanan bir reverse proxy | doğrudan erişim, bkz. [Reverse proxy arkasında](#reverse-proxy-arkasında) |
| `.env` | `PUBLIC_ADDRESS`: dışarıdan erişilen adres, örneğin `https://kriterion.beispiel.de` | bağlantıları tarayıcı kendi adresinden kurar; e-postayla bağlantı yok, kayıt olma yok |
| `.env` | `DOCUMENT_SERVER_ADDRESS`: Euro-Office ya da OnlyOffice, tarayıcının eriştiği adresle | Document Server üzerinden gösterim yok, bkz. [Document Server](#document-server) |
| `.env` | `DOCUMENT_SERVER_SECRET`: Document Server'daki `JWT_SECRET` ile aynı değer | Document Server üzerinden gösterim yok |
| `.env` | `DOCUMENT_SERVER_INTERNAL_ADDRESS`: Document Server, Kriterion'un ona eriştiği adresle | `DOCUMENT_SERVER_ADDRESS` |
| `.env` | `INTERNAL_ADDRESS`: Kriterion, Document Server'ın ona eriştiği adresle | `PUBLIC_ADDRESS` |
| `docker-compose.yml` | port, `"3100:3000"` içindeki soldaki değer | 3100 |
| `docker-compose.yml` | yedekleme klasörü: bağlama ve `BACKUP_DIR` | `./kriterion-backup`, bkz. [Yedekleme](#yedekleme) |
| `docker-compose.yml` | `TZ`: günlüğün saat dilimi | `Europe/Berlin` |

`PUBLIC_ADDRESS` şema ve ana makine adı ister; yol olabilir, `?` ve `#`
olamaz. Geçersiz bir değer günlükte uyarı olarak görünür; başlatma devam eder.

Geri kalan her şey, posta hesabı da, arayüzde ayarlanır ve veritabanında
saklanır.

Container günlüğünü Docker döndürür. Bunun için `docker-compose.yml` içinde:

```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
```

## Anahtar

`ENCRYPTION_KEY` yoksa ilk başlatma bir anahtar üretir ve onu
`data/encryption.key` olarak veritabanının yanına koyar. Bu durumda `data/`
klasörünü kopyalayan kişi, verileri ve anahtarı birlikte kopyalamış olur.

**Anahtarı `.env` dosyasına taşı:**

1. Arayüzde “Sayılar” kartındaki değeri kopyala (yalnızca sahip yönetici
   görür).
2. `ENCRYPTION_KEY=<Wert>` satırını `.env` dosyasına yaz.
3. `docker compose up -d`
4. Günlükte denetle: `Key loaded from ENCRYPTION_KEY.`
5. Ancak ondan sonra `data/encryption.key` dosyasını sil.

Veri varken yeni anahtar üretme: veriler ondan sonra okunamaz. Yalnızca boş bir
kurulum için anahtar elle üretilebilir: `openssl rand -hex 32`.

`.env` her başlatmada okunur ve yerinde kalmalıdır. **`.env` ve `data/` aynı
yedeklemeye konmamalıdır.** Anahtarı ayrıca parola yöneticisinde sakla.

### Anahtarı değiştirme

Anahtar başkalarının eline geçmiş olabilirse gerekir; örneğin `data/` klasörü,
`data/encryption.key` yanındayken kopyalandıysa. Anahtar dosyasını silmek
yalnızca sonraki kopyalara karşı korur.

Diskteki dosyaların anahtarı değişmez. Veritabanının eski bir kopyasına ve
eski anahtara sahip olan kişi bu dosyaları okumaya devam eder, sonraki
yedeklemelerden de. Koruma: dosyayı sil ve yeniden yükle.

```bash
./keytool.sh show
./keytool.sh change
```

`keytool.sh show` durumu gösterir ve hiçbir şeyi değiştirmez.
`keytool.sh change`, `.env` dosyasının (`.env.before-key-change-…`) ve
`data/` klasörünün `data/files/` dışındaki kısmının
(`../kriterion-data-before-key-change-…`) yedeklemesini oluşturur, kurulumu
durdurur, anahtarı geçici bir container'da değiştirir, yeni değeri ancak
başarıdan sonra yazar ve yeniden başlatır.

Yarıda kesilme (elektrik kesintisi, `kill -9`) zarar vermez: rollback journal
eski durumu geri getirir. Journal için yer yetmezse betik işe başlamadan durur.

Değişiklikten sonra:

- Eski yedeklemeler yalnızca eski anahtarla açılır. Eski anahtar `.env`
  içinde yorum satırı olarak kalır; onu parola yöneticisine de koy.
- Hemen yeni bir yedekleme oluştur.
- Parolalar ve oturumlar geçerli kalır.

**Değişikliği önce bir kopya üzerinde dene.** Bir hata bütün verileri
kaybettirebilir. Kopya gerçek verileri ve gerçek `.env` dosyasını ister,
`data/files/` klasörünü istemez ve kendi yedekleme klasörüne ihtiyaç duyar.
İlk komut proje klasöründen bir üst klasöre geçer:

```bash
cd ..
docker compose -f kriterion/docker-compose.yml stop
mkdir -p kriterion-check/data
find kriterion -mindepth 1 -maxdepth 1 ! -name data ! -name kriterion-backup ! -name .git \
  -exec cp -a {} kriterion-check/ \;
find kriterion/data -mindepth 1 -maxdepth 1 ! -name files -exec cp -a {} kriterion-check/data/ \;
docker compose -f kriterion/docker-compose.yml start

cd kriterion-check
rm -rf .env.before-*
sed -i 's/^    container_name: kriterion$/    container_name: kriterion-check/' docker-compose.yml
sed -i 's/"3100:3000"/"3199:3000"/' docker-compose.yml
sed -i 's#kriterion-backup:#kriterion-check-backup:#' docker-compose.yml
docker compose up -d --build
./keytool.sh change
docker compose logs --tail 30 kriterion
```

Deneme şu durumda geçerlidir: değişiklikten önceki bildirim gerçek boyutu
gösterir, ardından `integrity_check: ok` yazar, günlük `owner: <Name>` bildirir
ve veriler `http://<server>:3199` adresinde eksiksizdir. Diskteki dosyalar
kopyada yoktur; bu dosyalarda ⚠ görünür. Ardından kopyayı kaldır:

```bash
cd .. && docker compose -f kriterion-check/docker-compose.yml down
rm -rf kriterion-check kriterion-check-backup
```

Denemenin `.env` dosyasını asla gerçek kuruluma kopyalama.

## Yedekleme

| | Yedekleme (düğme) | `data/` kopyası | JSON dışa aktarma |
|---|---|---|---|
| ne için | acil durum, sistem çalışırken | acil durum, sunucu durdurulmuşken | taşıma, arşiv, paylaşma |
| eksiksiz | evet | evet | hayır, yalnızca öğeler |
| anahtar gerekir | evet | evet | hayır |
| sonraki sürümlerle okunabilir | hayır | hayır | evet |

Yedekleme ve JSON dışa aktarma arayüzden başlatılır; bkz. Kılavuz, “Ayarlar”.
Veritabanının yedeklemesi oluşturulurken kurulum duraklar (MB başına yaklaşık
10 ile 20 ms).

Yedekleme, `data/files/` altındaki dosyaları yedekleme klasöründeki
`kriterion-files/` klasörüne kopyalar, her birini yalnızca bir kez: bu dosyalar
hiç değişmez. Her yedeklemenin yanında `kriterion-<zeitpunkt>.files` adlı bir
liste bulunur: ilk satırda yedeklemeyi yazan sürüm, ardından yedeklemenin
andığı dosyalar. **Yedekleme klasöründe veritabanı ve diskteki bütün dosyalar
için yer olmalıdır.**

**Yedekleme klasörü.** `docker-compose.yml` klasörü bağlar ve sunucuya
bildirir. İki satır birlikte gerekir; `BACKUP_DIR` olmadan “Yedekleme” kartı
görünmez.

```yaml
    volumes:
      - ./kriterion-backup:/app/backup
    environment:
      - BACKUP_DIR=/app/backup
```

Klasörün proje klasörünün dışında olması daha iyidir. Proje klasörü
güncellemede yeniden adlandırılır; ayrıca klasör içerideyse proje klasöründeki
bir hata verileri ve yedeklemeleri aynı anda etkiler:

```yaml
      - ../kriterion-backup:/backup
    environment:
      - BACKUP_DIR=/backup
```

Göreli yollar `docker-compose.yml` dosyasının bulunduğu yerden hesaplanır.

**`data/` kopyası.** Önce `docker compose down`, sonra `data/files/` dahil
kopyala. `.env` dosyasını ayrı sakla.

### Yedeklemeyi geri yükleme

Geri yükleme proje klasöründe `backuptool.sh` ile yapılır. Betik, kurulumun
image'ıyla tek kullanımlık bir container başlatır.

```bash
./backuptool.sh list
./backuptool.sh show 2
./backuptool.sh restore 2
```

`list` bütün yedeklemeleri zaman, sürüm, dosyalar, anahtar ve şemayla
listeler. `show` içeriği ve çalışan durumla farkı gösterir. `restore` denetler,
durdurur, önce bir yedekleme oluşturur, geri yükler ve yeniden başlatır.

Seçim, `list` çıktısındaki numara (1 en yenisidir), addaki zaman
(`JJJJ-MM-TT-hh-mm-ss`, tarihe kadar kısaltılabilir) ya da “Eski yedeklemeler”
kartındaki gibi yerel saattir (`TT.MM.JJJJ` veya `TT.MM.JJJJ hh:mm`). Yerel
saati `TZ` belirler; bu değer `docker-compose.yml` içinde durur.

`restore`, Kriterion örneği çalışırken şunları denetler: anahtar, kurulu
sürümün şeması, listedeki her dosyanın yedekleme klasöründe bulunması, boş
yer. Ancak bundan sonra onay sorar, örneği durdurur, güncel durumun
yedeklemesini oluşturur ve seçileni geri yükler. Ardından `data/files/` tam
olarak seçilen durumun dosyalarını içerir; orada yalnızca yedekleme
klasöründeki bir yedeklemenin içerdiği dosyalar silinir. Çıktının son satırı
geri dönüş yoludur:

```
Rückweg:        ./backuptool.sh restore 2026-10-30-07-15-40
```

### Dosyaları tek tek geri alma

“Dosyalar” altında silinmiş bir dosyayı sahip yönetici, öğedeki
“Silinen dosyalar …” ile geri alır: 30 gün boyunca çöp kutusundan ya da güncel
anahtarla açılabilen her yedeklemeden. Bu sırada örnek çalışmaya devam eder;
geri kalan durum değişmez. Yedekleme klasöründeki bir kopya değiştirilmeden
`data/files/` klasörüne konur. Dosya daha eski bir yedeklemede hâlâ o
yedeklemenin veritabanında duruyorsa, geri alınırken yeniden şifrelenir.

`restore` yarıda kesilirse örnek durdurulmuş kalır ve ileti durumu bildirir.
Aynı seçimle ikinci bir çağrı işi tamamlar. Ondan sonraki ilk başlatma, geri
yüklenen durumun saklama süresini ve silme listesini uygular.

Bir yedekleme yalnızca oluşturulduğu anahtarla açılır. Bir anahtar
değişikliğinden önceye aitse, önce eski değeri `ENCRYPTION_KEY` olarak yaz.

**Elle**, image oluşturulamıyorsa. Önce arayüzde bir yedekleme oluştur: geri
dönüş yolu odur.

```bash
docker compose down
mkdir data-before-restore
mv data/katalog.sqlite* data-before-restore/
cp kriterion-backup/kriterion-<zeitpunkt>.sqlite data/katalog.sqlite
mkdir -p data/files
while read -r n len rest; do
  case "$n" in *[!0-9a-f]*|'') continue ;; esac; [ ${#n} -eq 32 ] || continue
  [ "$rest" = fehlt ] && continue
  [ -f "data/files/$n" ] && [ "$(wc -c < "data/files/$n")" -eq "$len" ] && continue
  cp "kriterion-backup/kriterion-files/$n" "data/files/$n.part" &&
    mv "data/files/$n.part" "data/files/$n"
done < kriterion-backup/kriterion-<zeitpunkt>.files
docker compose up -d
```

Döngü, yedeklemenin listesinde adı geçen dosyaları getirir ve listenin başlık
satırlarını atlar. Hiçbir dosyayı silmez; daha yeni durumun dosyaları yerinde
kalır ve “Sayılar” onları “başvurusuz” dosyalar olarak gösterir.

## Güncelleme

Önce bir yedekleme oluştur. Her sürümde neyin değiştiği `CHANGELOG.md`
içinde yazar (biçim [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
sürüm numaraları [Semantic Versioning](https://semver.org/) kurallarına
göre).

`git` ile:

```bash
git pull
docker compose up -d --build
```

ZIP ile proje dizini yenisiyle değiştirilir. `data/`, `.env`,
`docker-compose.yml` ve projedeki bir yedekleme klasörü aktarılır. Güvenlik
kopyası `data/files/` klasörünü dışarıda bırakır: bu dosyalar hiç değişmez ve
yedeklemede bulunur.

```bash
cd .../kriterion && docker compose down
cd .. && mkdir data-before-update-$(date +%F)
find kriterion/data -mindepth 1 -maxdepth 1 ! -name files -exec cp -a {} data-before-update-$(date +%F)/ \;
mv kriterion kriterion-old
python3 -m zipfile -e kriterion-main.zip .
mv kriterion-main kriterion
mv kriterion-old/data kriterion/data
cp kriterion-old/.env kriterion/.env
cp kriterion-old/docker-compose.yml kriterion/
mv kriterion-old/kriterion-backup kriterion/ 2>/dev/null
chmod +x kriterion/keytool.sh kriterion/backuptool.sh
cd kriterion && docker compose up -d --build
```

Ardından günlükte (`docker compose logs kriterion`) anahtarın yüklenip
yüklenmediğini denetle. `ENCRYPTION_KEY` ayarlı olduğu halde orada verilerin
yanındaki bir anahtar dosyası hakkında uyarı varsa, `.env` okunmamıştır: hemen
durdur.

Veritabanında hâlâ dosya varsa, Kriterion başlatmadan sonra bunları arka
planda `data/files/` altına koyar; “Sayılar” kaç dosyanın beklediğini gösterir.
**Boş yer bu dosyalara ve ayrıca 1 GB'a yetmezse Kriterion başlamaz.** Günlük
gereken ve boş yeri gösterir.

`docker-compose.example.yml` değiştiyse kendi dosyanı onunla karşılaştır:
`diff docker-compose.example.yml docker-compose.yml`.

### Yeni sürümün çalıştığını doğrulama

Sürüm numarası (`curl -s http://localhost:3100/api/config`) yalnızca hangi
`package.json` dosyasının çalıştığını söyler. Bütün dosyaların buna uyup
uymadığını parmak izi gösterir: sunucunun yüklediği ve sunduğu her şeyin
sağlaması. Parmak izi “Sayılar” kartında durur; beklenen değer
`CHANGELOG.md` içinde o sürümün girdisinde yazar.

Parmak izi farklıysa bu döngü dosyayı bulur, proje klasöründe ya da
container'da (`docker compose exec kriterion sh`):

```bash
for f in attachments.js auth.js backup.js batchrun.js docserver.js images.js db.js keys.js \
         log.js mail.js package.json schema.js server.js twofactor.js public/*; do
  printf "%-26s %s\n" "$f" "$(sha256sum "$f" | cut -c1-8)"
done
```

Aynı listeyi “Sayılar” kartı “Dosyaları göster” altında gösterir. Farklı bir
dosyayı doğrusuyla değiştir, fazladan bir dosyayı sil, sonra
`docker compose up -d --build`.

## Reverse proxy arkasında

Dışarıya yalnızca HTTPS üzerinden açılır; bu durumda `BEHIND_PROXY=1` değeri
`.env` dosyasına yazılır.

| | `BEHIND_PROXY` boş | `BEHIND_PROXY=1` |
|---|---|---|
| `X-Forwarded-For`, `X-Forwarded-Proto` | yok sayılır | okunur |
| istemcinin adresi | bağlantının adresi | `X-Forwarded-For` içindeki son değer |
| `http://` ile başlayan `PUBLIC_ADDRESS` | izin verilir | başlatmada uyarı |

Başlatma durumu günlüğe yazar: `Behind proxy: on` ya da `off`.

- `http://<server-ip>:3100` üzerinden doğrudan erişim proxy'nin yanında
  kullanılabilir kalır. Proxy çökerse erişim buradan sürer.
- **Container'ın portu ağda erişilebilirse, oradan herkes `X-Forwarded-For`
  ayarlayıp giriş deneme sınırını aşabilir.** Bunu önlemek için portu yalnızca
  proxy'ye aç.
- `BEHIND_PROXY` değiştirilince HTTPS üzerinden giriş yapmış herkesin oturumu
  bir kez kapanır.
- Kriterion sıkıştırmayı kendisi yapar. Proxy'de sıkıştırmayı kapat: nginx'te
  `gzip off;`, Caddy'de `encode` satırını çıkar.
- Proxy, en yüksek yükleme sınırı büyüklüğündeki istekleri geçirmelidir
  (100 MB'a kadar). nginx: `client_max_body_size 100m;` (varsayılan 1 MB).
  Cloudflare, Free ve Pro planlarında 100 MB geçirir.
- CrowdSec'in WAF'ı (AppSec) varsayılan olarak bir isteğin en çok 10 MB'ını
  okur ve daha büyüklerini 403 ile reddeder. NPMplus'ta “Custom Locations”
  altında `~` ve
  `^/api/(import|uploads/[0-9a-f]+|(items|comments)/[0-9]+/(photos|videos|comments|images))$`
  yoluyla, hedefi host'takiyle aynı bir location oluştur ve orada
  “Disable Crowdsec Appsec” ile “Disable Request Buffering” seçeneklerini aç.
  Yolda süslü parantez kullanma: NPMplus yolu tırnaksız yazar, nginx `{`
  karakterini bir bloğun başı olarak okur ve host çevrim dışı kalır.
- `~` ve `^/api/attachments/[0-9]+/raw$` yoluyla, hedefi host'takiyle aynı
  ikinci bir location “Disable Response Buffering” alır; AppSec orada açık
  kalır. Yoksa nginx dosyaları ve videoları şifresiz olarak ara dosyalara
  yazar. NPMplus olmadan nginx'te: `proxy_request_buffering off;`
  (`/api/uploads/` için) ve `proxy_buffering off;` (`/api/attachments/` için).

CrowdSec ya da fail2ban için `POST /api/login` ayırt edilebilir yanıtlar
verir: 401 (ad ya da parola yanlış), 429 (çok fazla deneme), 403 (hesap
kilitli).

## Document Server

Kriterion, Euro-Office ya da OnlyOffice ile şu dosyaları gösterir ve düzenler:
`docx`, `doc`, `odt`, `rtf`, `xlsx`, `xls`, `ods`, `pptx`, `ppt`, `odp`, “Ek”
sınırına kadar; daha büyük dosyalar yalnızca indirilebilir. Resimleri, PDF'yi
ve metni Kriterion yine kendisi gösterir. Bu dosyaların ve PDF'lerin ilk
sayfasının küçük resmini Document Server hesaplar. Kimin düzenleyebileceği
Kılavuz'da “Etiketler, dosyalar, bağlantılar” altında yazar. Document Server'ın
kendi kurulumu için:
[Euro-Office belgeleri](https://github.com/Euro-Office/documentation).

**Document Server'da:**

- En az 32 karakterlik `JWT_SECRET`. Aynı değer Kriterion'un `.env`
  dosyasında `DOCUMENT_SERVER_SECRET` olarak durur.
- `JWT_ENABLED` ve `JWT_HEADER` varsayılan değerlerinde kalır: `true` ve
  `Authorization`.
- Kriterion ile aynı Docker ağındaysa: `ALLOW_PRIVATE_IP_ADDRESS=true`. Bu
  satır olmadan Document Server Docker ağından hiçbir dosya almaz.

**Kriterion'un `.env` dosyasında**, iki container aynı Docker ağındayken
örnek:

```sh
DOCUMENT_SERVER_ADDRESS=https://office.beispiel.de
DOCUMENT_SERVER_SECRET=<derselbe Wert wie JWT_SECRET>
DOCUMENT_SERVER_INTERNAL_ADDRESS=http://euro-office:80
INTERNAL_ADDRESS=http://kriterion:3000
```

- İki container aynı `docker-compose.yml` içindeyse ağı paylaşırlar. İki
  Compose dosyasında ikisinin de ortak bir ağa ihtiyacı vardır (`networks:`
  altında `external: true`).
- Yeniden başlatmadan sonra Ayarlar → Kurulum altındaki “Belgeler” kartını
  aç. Kart iki yönü de denetler ve eksik olanı söyler. Gösterim orada açılır.
- Düzenleme sırasında Document Server, Kriterion'u `INTERNAL_ADDRESS`
  üzerinden çağırır ve kaydedilen hâli bildirir; Kriterion onu
  `DOCUMENT_SERVER_INTERNAL_ADDRESS` üzerinden alır. Başka ayar gerekmez.

**Her Office dosyası ve her PDF, Document Server'ın önbelleğinde şifresiz
durur**, önbellek boşaltılana kadar, kimse onlara bakmasa bile: küçük resim için
Document Server bu dosyaların her birini bir kez alır. Veritabanının
şifrelemesi bu kopya için geçerli değildir.

## Sunucu komutları

Bu komutlar proje klasöründe çalıştırılır. Her değişiklikten önce onay sorarlar
ve güvenlik günlüğünde “sunucuda komut satırıyla” olarak görünürler.

| Komut | Etkisi |
|---|---|
| `docker compose exec kriterion node usertool.js list` | kullanıcı, rol, iki adımlı doğrulama |
| `docker compose exec kriterion node usertool.js password <name>` | yeni parola belirle; kullanıcının bütün oturumları biter |
| `docker compose exec kriterion node usertool.js twofactor <name>` | iki adımlı doğrulamayı kapat (açmak yalnızca arayüzde mümkün) |
| `docker compose exec kriterion node usertool.js remove <name>` | hesabı devre dışı bırak |
| `docker compose exec kriterion node usertool.js owner <name>` | önceki sahip yönetici artık giriş yapamıyorsa yeni sahip yöneticiyi belirle |
| `./keytool.sh show`, `./keytool.sh change` | anahtarı göster ya da değiştir |
| `./backuptool.sh list`, `show`, `check`, `restore` | yedeklemeleri görüntüle ve geri yükle, bkz. [Yedeklemeyi geri yükleme](#yedeklemeyi-geri-yükleme) |

Container çalışmıyorsa aynısı
`docker compose run --rm kriterion node usertool.js …` ile yapılır.

Kullanıcılar ve parolalar ortam değişkenleriyle ayarlanamaz.

## Sorun giderme

| Durum | Çözüm |
|---|---|
| Kimse giriş yapamıyor | `usertool.js password <name>`, bkz. [Sunucu komutları](#sunucu-komutları) |
| Telefon ve kurtarma kodları kayıp | `usertool.js twofactor <name>` |
| `./keytool.sh` ya da `./backuptool.sh` “Erişim engellendi” bildiriyor | `chmod +x keytool.sh backuptool.sh` ya da `bash keytool.sh show` |
| `ENCRYPTION_KEY` ayarlı olduğu halde bir anahtar dosyası uyarısı | `.env` okunmadı; durdur ve denetle |
| Başlatma eksik bir sütun bildiriyor | uygulama başlar, bu sütunu kullanan sayfalar hata verir; yedeklemeyi geri yükle ya da uygun sürümü kur |
| Parmak izi farklı | bütün dosyaları yeniden yerleştir, bkz. [Güncelleme](#güncelleme) |
| Yükleme “öndeki reverse proxy'nin geçirdiğinden büyük” iletisiyle başarısız oluyor | proxy'deki sınırı yükselt |
| Yükleme “Öndeki reverse proxy isteği reddetti (403)” iletisiyle başarısız oluyor | proxy'nin günlüğünde hangi modülün reddettiğine bak; CrowdSec için bkz. [Reverse proxy arkasında](#reverse-proxy-arkasında) |
| Günlükte `TEST SWITCH ACTIVE` yazıyor | `KRITERION_TESTBENCH` satırını `.env` dosyasından kaldır |
| Tarayıcı bir güncellemeden sonra hâlâ eski simgeyi gösteriyor | Ctrl+Shift+R |

## Kendi betiklerle programlama arayüzü

Yazma istekleri bir CSRF token'ı gerektirir. Sunucu onu girişte
`kriterion_csrf` cookie'si olarak ayarlar (proxy arkasında HTTPS üzerinden:
`__Host-kriterion_csrf`). Değeri `x-csrf-token` header'ına yazılır:

```bash
curl -c cookies.txt -X POST http://<server>:3100/api/login \
  -H 'content-type: application/json' \
  -d '{"user":"anna","password":"…"}'

TOKEN=$(awk '/kriterion_csrf/ { print $7 }' cookies.txt)

curl -b cookies.txt -X POST http://<server>:3100/api/items \
  -H 'content-type: application/json' -H "x-csrf-token: $TOKEN" \
  -d '{"title":"Ein Eintrag"}'
```

Bu header olmadan her yazma rotası 403 ile yanıt verir. Okuma istekleri ve
girişten önceki rotalar onu gerektirmez.

Dosyalar parçalar halinde yüklenir. `POST /api/items/<id>/uploads` isteği
`filename`, `size`, `modified` ve `folderId` (ya da `null`) ile gönderilir ve
`id` ile `received` döndürür. Ardından her 8 MB için bir
`PUT /api/uploads/<id>` gönderilir. Header'ları: `content-type:
application/octet-stream` ve `upload-offset: <received>`. Son parçanın yanıtı
öğenin kendisidir.

`GET /api/attachments/<id>/info` ve `GET /api/photos/<id>/info`, bir resmin ya
da videonun “Ayrıntılı bilgi” verisini JSON olarak döndürür: `general`,
`video`, `audio`, `image`, `orientation` ve `exif`. Sunucu bu bilgiyi
`mediainfo.js`, `sharp` ve `exif-reader` ile okur ve `attachment_media` ile
`photo_media` tablolarına yazar; JSON dışa aktarmada yer almaz. Office,
OpenDocument ve PDF dosyaları için aynı yol “Bilgi” verisini `document: true`,
`kriterion` ve `file` ile döndürür; her çağrıda yeniden okunur. Document
Server'daki son kaydetmenin zamanı ve hesabı ile dosyanın yüklemedeki
değiştirilme zamanı `attachment_changes` tablosunda durur; bunlar da JSON dışa
aktarmada yer almaz.

`PUT /api/attachments/<id>`, `filename` ile bir dosyayı yeniden adlandırır;
uzantı kalır. Yalnızca dosyayı yükleyen kişi yeniden adlandırabilir (aksi
halde 403). Aynı klasörde bu adda bir dosya zaten varsa sunucu 409 döndürür.

`GET /api/items/<id>/deleted-files`, sahip yöneticiye bir öğenin çöp kutusundaki
ve yedeklemelerdeki silinmiş dosyalarını listeler. Aynı adrese yapılan bir
`POST`, `trash` (çöp kutusundaki numaralar) ve `backup` (yedeklemenin `name`
değeri ve listedeki `file`) ile onları geri alır.

## Bu kod nasıl yazıldı

Ağustos ile Eylül 2026 arasında
[Claude Code](https://claude.com/claude-code) ile yazıldı. Fikir, konsept ve
tasarım: [Faruk Demirtaş](https://github.com/fardem).

## Lisans

MIT. Metin `LICENSE` dosyasında.

Kriterion kullanılabilir, değiştirilebilir, dağıtılabilir ve satılabilir; daha
büyük bir projenin parçası olarak da. Koşul: lisans metni ve telif hakkı
bildirimi birlikte verilir. Garanti yok, sorumluluk yok.

### Bağımlılıkların lisansları

`npm install` komutunun kurduğu 173 paket üzerinden ölçüldü: 137 MIT, 12 ISC,
6 Apache-2.0, 4 BSD-3-Clause, 3 MIT-0, 3 BSD-2-Clause, 2 LGPL-3.0-or-later,
geri kalanı CC0, 0BSD, BlueOak ve lisans seçimi sunan paketler.

**İki LGPL paketi şunlardır: `@img/sharp-libvips-linux-x64` ve
`@img/sharp-libvips-linuxmusl-x64`**, yani `sharp` paketinin önceden derlenmiş
libvips'i. Hazır bir image dağıtan kişi libvips'i de dağıtır: o zaman LGPL
metni de verilmeli ve kütüphane değiştirilebilir kalmalıdır. Depodan derleyen
kişi `sharp` paketini npm üzerinden kendisi indirir.
