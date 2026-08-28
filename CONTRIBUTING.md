# Katkı Rehberi

Teşekkürler! Bu proje küçük ve bağımlılıksız kalmayı hedefliyor; katkıları da bu
çerçevede değerlendiriyoruz.

## Ortamı kurma

Node 20 veya üzeri gerekir (CI 20, 22 ve 24 sürümlerinde çalışır).

```bash
git clone https://github.com/YakupEmreYerli/Wiki-Cleaner.git
cd Wiki-Cleaner
npm install
```

Eklentiyi tarayıcıda denemek için `about:debugging` → **This Firefox** →
**Load Temporary Add-on…** yolunu izleyip `manifest.json` dosyasını seç.

## Doğrulama

Pull request açmadan önce ikisinin de yeşil olması gerekir:

```bash
npm test        # node:test + jsdom birim testleri
npm run lint    # web-ext lint, uyarılar hata sayılır
```

`npm run build` paketlenmiş `.zip` çıktısını `web-ext-artifacts/` altında üretir.

## Test yazma

Testler `test/` altındadır ve `node:test` ile çalışır. Eklenti kodu tarayıcı
API'lerini doğrudan kullandığı için iki yardımcı vardır:

- `createChromeStub()` — `chrome.storage.local`, `chrome.runtime`,
  `chrome.contextMenus` ve `chrome.tabs` için dar bir sahte nesne üretir.
  Geri çağırmalar eşzamanlı çalışır, böylece testler beklemeye gerek kalmadan
  sonucu okuyabilir. Kaydedilen çağrılar `stub.calls`, depo içeriği `stub.state`,
  yakalanan dinleyiciler `stub.listeners` altındadır.
- `loadInWindow(dosya, html, chrome)` — kaynak dosyayı bir jsdom penceresinde
  değerlendirir. jsdom, olay dinleyicisi içinde patlayan istisnaları yuttuğu için
  bunlar toplanıp `dom.errors` üzerinden dışarı verilir; "hata fırlatmamalı"
  türü testler bu diziyi kontrol etmelidir, `assert.doesNotThrow` yeterli değildir.

`MutationObserver` ile ilgili bir davranışı test ediyorsan `await flush()` çağır.

Davranış değiştiren her pull request'e test eşlik etmeli. Bir hata düzeltiyorsan,
testin düzeltmeyi geri aldığında gerçekten kırmızıya döndüğünü doğrula.

## Kod tarzı

- Mevcut dosyaların girinti ve adlandırma alışkanlıklarını sürdür.
- Çalışma zamanı bağımlılığı ekleme; eklenti paketi bağımlılıksız kalmalı.
- Yeni izin talep etmekten kaçın. Gerekiyorsa pull request açıklamasında gerekçesini
  yaz — `manifest.json` izin listesi `test/manifest.test.js` tarafından sabitlenmiştir.
- README ve README.en.md'deki iddialar koddan doğrulanabilir olmalı. Davranışı
  değiştirdiysen iki dosyayı da güncelle.

## Commit mesajları

Commit mesajları **Türkçe ve emir kipinde** yazılır:

```
popup'ta url tanımsızken oluşan TypeError'ı gider
içerik betiği için birim testleri ekle
```

## Hata bildirimi

Hataları [issue şablonları](https://github.com/YakupEmreYerli/Wiki-Cleaner/issues/new/choose)
üzerinden bildir. Güvenlik açıkları için [SECURITY.md](SECURITY.md) dosyasını izle.
