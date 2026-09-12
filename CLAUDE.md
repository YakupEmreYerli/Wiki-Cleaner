# Wiki-Cleaner

> İkiz dosya: bu dosyanın eşi `AGENTS.md`. Birini değiştirirsen diğerini de değiştir.

Wikipedia makalelerindeki dahili bağlantıları tıklanamaz düz metne çeviren ve atıf
işaretlerini gizleyen tarayıcı eklentisi. Manifest V3; tek paket Firefox ≥ 142 ve
Chrome ≥ 120 (`manifest.json`). Firefox'ta AMO'da yayında, Chrome Web Store'da değil.
Davranış, mimari ve bilinen sınırlar: `README.md` (İngilizcesi `README.en.md`).

## Komutlar

Node ≥ 22 gerekir (`package.json` engines; `jsdom` 30 bunu şart koşuyor).

```bash
npm install
npm test        # node --test test/*.test.js (node:test + jsdom), 2026-09-12'de 44 test geçti
npm run lint    # tools/lint-extension.mjs → web-ext lint; beyaz listede olmayan her uyarı hata
npm run build   # web-ext build → web-ext-artifacts/*.zip (gitignore'da)
npm run icons   # icons/*.svg → PNG; librsvg (rsvg-convert) gerekir
```

Pull request öncesi `npm test` ve `npm run lint` yeşil olmalı (`CONTRIBUTING.md`).
CI (`.github/workflows/ci.yml`): Node 22 ve 24'te test; ayrı işte lint +
`npm audit --audit-level=critical`; ikisi geçerse paket üretilip artefakt yüklenir.
README'deki "33 test" sayısı eskimiş, güncel sayı test çıktısındadır.

Eklentiyi elle denemek: Firefox `about:debugging` → This Firefox → Load Temporary
Add-on → `manifest.json`.

## Kurallar

Kaynak: `CONTRIBUTING.md`, aksi belirtilmedikçe.

- **Çalışma zamanı bağımlılığı eklenmez.** Paket bağımlılıksız kalır; `devDependencies`
  yalnızca `jsdom` ve `web-ext`.
- **`background.js` hem Chrome service worker'ı hem Firefox event page'idir:**
  `window`, `document`, `localStorage` kullanma.
- **Yeni izin isteme.** İzin listesi `test/manifest.test.js` tarafından sabitlenmiştir;
  gerçekten gerekiyorsa gerekçesini PR açıklamasına yaz.
- **Davranış değiştiren her değişikliğe test.** Hata düzeltirken, düzeltmeyi geri
  aldığında testin gerçekten kırmızıya döndüğünü doğrula.
- **"Hata fırlatmamalı" testleri `dom.errors` dizisini kontrol eder,**
  `assert.doesNotThrow` yetmez: jsdom olay dinleyicisindeki istisnaları yutar,
  `loadInWindow()` bunları `dom.errors` üzerinden verir. `MutationObserver`
  davranışı test ederken `await flush()` çağır.
- **PNG simgeleri elle düzenlenmez.** `icons/icon.svg` (≥ 32 px) ya da
  `icons/icon-small.svg` (16 px) değişir, sonra `npm run icons`.
- **README.md ve README.en.md birlikte güncellenir;** içlerindeki iddialar koddan
  doğrulanabilir olmalı.
- **Lint beyaz listesi bilinçli karardır.** `tools/lint-extension.mjs` içindeki
  `IZIN_VERILEN_UYARILAR` şu an yalnızca `BACKGROUND_SERVICE_WORKER_IGNORED` içerir
  (manifest'teki çift `background` tanımının beklenen uyarısı). Yeni giriş eklemek
  için gerekçe yaz (dosyanın kendi yorumu).
- **Paketten dışlanacak dosyalar `web-ext-config.mjs` `ignoreFiles` listesindedir;**
  hem lint hem build bu listeyi kullanır. Kök dizine geliştirme dosyası eklersen
  oraya da ekle, yoksa AMO paketine girer.
- **Mevcut dosyaların girinti ve adlandırma alışkanlığını sürdür.**
- **Commit mesajları Türkçe ve emir kipinde:** `popup'ta url tanımsızken oluşan
  TypeError'ı gider` (CONTRIBUTING, git geçmişi).

## Nerede ne

```
manifest.json        Eklenti tanımı, izinler, Firefox/Chrome hedefleri
content.js           DOM temizleme/geri alma, MutationObserver (#mw-content-text)
background.js        Sağ tık menüsü, varsayılan `enabled` durumu
popup.html, popup.js Araç çubuğu anahtarı (`toggle-status` sözleşmesi)
test/helpers.js      createChromeStub(), loadInWindow() — chrome.* sahtesi, jsdom yükleyici
test/fixtures.js     Test HTML'leri
tools/               lint sarmalayıcısı, simge üretme betiği
web-ext-config.mjs   Paket dışı dosya listesi
icons/               SVG kaynaklar + üretilmiş PNG'ler
```

Durum `chrome.storage.local` içindeki `enabled` boolean'ında tutulur (varsayılan `true`).
