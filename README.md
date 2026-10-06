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

## Dosyalar

Arayüz index.html, davranış assets/app.js, stiller assets/app.css ve assets/auth.css dosyalarındadır. SVG logonun açık ve koyu sürümleri assets altında bulunur.

## Sınırlar

Backend, gerçek GPS, ödeme, mesaj gönderimi ve GİB doğrulaması bağlı değildir. Hesaplar ve veriler LocalStorage, medya IndexedDB içinde saklanır; başka cihazlarla paylaşılmaz. Demo şifreleri açık metindir; gerçek kullanıcı bilgileri girmeyin. Üretim için sunucuda kimlik doğrulama, kullanıcı/şirket bazlı yetkilendirme ve veritabanında atomik atama gerekir.

## Kontrol

Node.js ile: node tests/workflows.cjs

Açık yükler düzenlenebilir veya iptal edilebilir. Atanmış yükler yeniden atanamaz. Dosya başına 20 MB, bir yükleme grubunda toplam 50 MB sınırı vardır.
