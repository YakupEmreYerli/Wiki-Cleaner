# Güvenlik Politikası

## Desteklenen sürümler

| Sürüm | Destek |
| ----- | ------ |
| 1.1.x | ✅ |
| 1.0.x | ❌ |

## Açık bildirimi

Güvenlik açıklarını **herkese açık issue olarak açma**. Bunun yerine
[GitHub Security Advisory](https://github.com/YakupEmreYerli/Wiki-Cleaner/security/advisories/new)
üzerinden özel bildirim aç. İlk yanıt hedefi 7 gündür.

Bildirirken şunları eklemen yeterli: etkilenen dosya, yeniden üretme adımları ve
gözlenen etki.

## Eklentinin saldırı yüzeyi

Bu eklentinin yüzeyi bilinçli olarak dardır ve iddialar `manifest.json` üzerinden
doğrulanabilir:

- **Çalışma alanı:** yalnızca `*://*.wikipedia.org/wiki/*`. Hem `content_scripts`
  hem `host_permissions` bu tek kalıbı beyan eder; başka hiçbir sitede içerik
  betiği çalışmaz.
- **İzinler:** yalnızca `storage` ve `contextMenus`.
- **Manifest:** V3. Chrome tarafında arka plan bir service worker'dır; DOM'a,
  `window`'a veya `localStorage`'a erişmez (`test/background.test.js` bunu
  doğrular).
- **Ağ trafiği:** yok. Kod tabanında `fetch`, `XMLHttpRequest` veya harici bir
  uç nokta çağrısı bulunmaz.
- **Veri toplama:** yok. `browser_specific_settings.gecko.data_collection_permissions.required`
  alanı `["none"]` olarak beyan edilmiştir. Saklanan tek veri, `chrome.storage.local`
  içindeki `enabled` adlı boolean tercihtir ve cihazdan çıkmaz.
- **Uzak kod:** yok. Tüm betikler paketin içindedir; `eval` veya uzaktan betik
  yüklemesi yapılmaz.

## Bağımlılıklar

Yayınlanan eklenti **sıfır çalışma zamanı bağımlılığıyla** gelir; `node_modules`
paketin dışında tutulur (bkz. `npm run build` betiğinin `--ignore-files` listesi).
`jsdom` ve `web-ext` yalnızca geliştirme ve test içindir.

CI, dev bağımlılıkları için `npm audit --audit-level=critical` çalıştırır. Bugün
bilinen ve kırıcı sürüm yükseltmesi olmadan giderilemeyen tek uyarı,
`web-ext` → `addons-linter` → `image-size` zincirindeki yüksek dereceli
advisory'dir. Bu paket son kullanıcıya sevk edilmez ve yalnızca yerel doğrulama
sırasında çalışır.
