# Wikipedia Link Cleaner

Wikipedia makalelerindeki dahili bağlantıları ve atıf işaretlerini temizleyerek odaklanmış bir okuma deneyimi sağlayan Firefox tarayıcı eklentisidir.

## Teknik Özellikler

- **Bağlantı Temizleme:** Makale gövdesindeki tüm dahili Wikipedia linklerini (`/wiki/` ön ekli) analiz eder ve metin yapısını bozmadan tıklanamaz, düz metne dönüştürür.
- **Atıf Gizleme:** Metin içerisinde akıcılığı bozan köşe parantezli dipnot işaretlerini (`.reference` elemanları) tamamen gizler.
- **Korumalı Alanlar:** Bilgi kutuları (infobox), tablolar, düzenleme bağlantıları ve navigasyon menüleri gibi yapısal alanlardaki fonksiyonel linklere dokunulmaz.
- **Dinamik DOM İzleme:** `MutationObserver` teknolojisi sayesinde, sayfa kaydırıldığında veya dinamik içerik yüklendiğinde yeni gelen bağlantıları otomatik olarak tespit eder ve temizler.
- **Durum Yönetimi:** Kullanıcı tercihleri `chrome.storage.local` üzerinde saklanır ve tarayıcı oturumları arasında korunur.

## Kullanım Arayüzü

Eklenti iki farklı kontrol mekanizması sunar:

1. **Ayar Paneli:** Tarayıcı araç çubuğundaki eklenti simgesine tıklandığında açılan arayüz üzerinden eklenti durumu anlık olarak değiştirilebilir.
2. **Kısayol Menüsü:** Wikipedia sayfaları üzerinde sağ tıklayarak açılan menü aracılığıyla temizleme işlemi hızlıca aktif veya pasif hale getirilebilir.

## Kurulum Talimatları

Geliştirici modunda kurulum için aşağıdaki adımları takip ediniz:

1. Firefox tarayıcısında adres çubuğuna `about:debugging` yazınız.
2. Sol menüden "This Firefox" (Bu Firefox) seçeneğine tıklayınız.
3. "Load Temporary Add-on..." (Geçici Eklentiyi Yükle...) butonunu kullanınız.
4. Proje dizininde yer alan `manifest.json` dosyasını seçiniz.

## Dosya Yapısı

- `manifest.json`: Eklenti tanımlamaları ve izin yönetim sistemi.
- `content.js`: DOM manipülasyonu ve link nötralizasyon mantığı.
- `background.js`: Sağ tık menüsü ve arka plan süreç yönetimi.
- `popup.html` / `popup.js`: Kullanıcı ayar paneli arayüzü ve mantığı.
- `icons/48.png`: Yüksek çözünürlüklü uygulama simgesi.
