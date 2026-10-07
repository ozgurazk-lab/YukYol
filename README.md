# Sevkio

Yük sahipleri ile şoförleri buluşturan tarayıcı tabanlı lojistik demosu.

## Çalıştırma

Statik sunucuda yayınlayın veya index.html dosyasını açın. Firma ve şoför demo hesapları giriş ekranında bulunur.

## Özellikler

- Yük oluşturma, şehir araması ve araç uyumu
- Müsait araca tekil yük ataması
- Taşıma adımları, evrak ve fotoğrafla teslimat
- Dönüş yükleri ve kazanç ekranı
- Bu tarayıcıda kalıcı demo mesajları
- Normal/Premium demo üyeliği ve yük seçme yetkisi
- Yük kaynağı, KDV, ödeme vadesi, platform bedeli ve bekleme şartları
- Düzenlenebilir mesafe/yakıt varsayımlarıyla gider sonrası kazanç tahmini
- Tamamlanan taşımaya bağlı, taraf başına tek değerlendirme
- Bekleme başlangıç/bitiş kaydı ve tahmini ek bedel
- Kayıt numarasıyla kalıcı yerel destek talepleri
- 10/25/50 değerlendirme için demo üyelik süresi, 100 değerlendirmede hediye talebi
- İsteğe bağlı gün/ay tercihiyle doğum günü demo avantajı
- En az 10 değerlendirmede genel/ödeme puanı 4,5 olan firmaya şoför dostu rozeti ve demo platform bedelinde %10 indirim

## Dosyalar

Arayüz index.html, davranış assets/app.js, stiller assets/app.css ve assets/auth.css dosyalarındadır. SVG logonun açık ve koyu sürümleri assets altında bulunur.

## Sınırlar

Backend, gerçek GPS, ödeme, mesaj gönderimi ve GİB doğrulaması bağlı değildir. Hesaplar ve veriler LocalStorage, medya IndexedDB içinde saklanır; başka cihazlarla paylaşılmaz. Demo şifreleri açık metindir; gerçek kullanıcı bilgileri girmeyin. Üretim için sunucuda kimlik doğrulama, kullanıcı/şirket bazlı yetkilendirme ve veritabanında atomik atama gerekir.

## Kontrol

Node.js ile: node tests/workflows.cjs

Gerçek tarayıcı kontrolleri: `node tests/improvements.cjs` (Playwright ve Microsoft Edge gerekir).

## 7 Ekim 2026 sürümü

Üyelik fiyatı ₺990/ay bir deneme önerisidir. Kart veya ödeme alınmaz. Avantajlar yerel demo süresine eklenir; hediye gönderimi yoktur. Başlangıçtaki örnek profil değerlendirmeleri ödüllere veya şoför dostu rozetine dahil edilmez. Süresi geçen yükler açık yüklerden çıkar; dönüş önerileri mevcut teslim saatinden sonra bir saat boşaltma payı bırakır.

Yakıt fiyatı varsayımdır; kullanıcı günceller. Şehir mesafesi yaklaşık hesaplanır. Vergi, amortisman, sigorta ve üyelik bedeli kazanç hesabının dışındadır. Belirtilmemiş platform bedeli hesapta sıfır kabul edilir ve ekranda açıklanır.

Gerçek ödeme/emanet hesap, canlı GPS, resmi doğrulama, cihazlar arası senkronizasyon, destek ekibine iletim ve sunucuda yetkilendirme üretim entegrasyonu gerektirir. Tarayıcıdaki yetki kontrolleri güvenlik sınırı değildir.

Yayın kontrolü: 14 temel akış kontrolü ve tarayıcıdaki üyelik, kazanç, destek, değerlendirme, ödül, bekleme, ilan süresi ve 390 px mobil kontrolleri geçti. Bu statik demoda üretim izleme/CI altyapısı yoktur. Geri alma: bu sürümün commit değişikliklerini revert ederek önceki `66a35ef` sürümüne dönülür; tarayıcıdaki ek veri alanları korunabilir.

Açık yükler düzenlenebilir veya iptal edilebilir. Atanmış yükler yeniden atanamaz. Dosya başına 20 MB, bir yükleme grubunda toplam 50 MB sınırı vardır.
