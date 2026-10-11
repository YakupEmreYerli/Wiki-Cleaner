# Wiki Cleaner marka kiti

Kimlik, Wikipedia'nın kendi okuma dünyasından gelir: mürekkep siyahı metin, bağlantı
mavisi ve kitap harfi. Tek vurgu rengi bağlantı mavisidir; o da yalnızca "bağlantı"
anlamı taşıdığı yerde kullanılır.

## Logo

| Dosya | Kullanım |
| --- | --- |
| `logo.svg` | 32 px ve üstü; eklenti simgelerinin kaynağı `icons/icon.svg` ile aynı |
| `logo-16.svg` | Yalnızca 16 px; noktalar bu ölçekte kaybolduğu için tek kalın çizgi |
| `logo-512.png`, `logo-1024.png` | Mağaza, sunum, sosyal medya |

- **Mürekkep W:** beyaz karo, siyah Newsreader W (wght 600, opsz 72, yola çevrilmiş),
  altında sağa doğru silinen mavi bağlantı çizgisi. Harf ve çizgi yeniden renklendirilmez.
- Karo koyu zeminde de beyaz kalır. Çevresinde logonun sekizde biri kadar boşluk bırakılır.
- Logo döndürülmez, esnetilmez, gölge ya da degrade eklenmez.

## Renkler

| Ad | Değer | Rol |
| --- | --- | --- |
| Mürekkep | `#202122` | Metin, logo harfi, koyu tema zemini |
| Bağlantı mavisi | `#3366CC` | Tek vurgu: bağlantı, açık anahtar, logo çizgisi |
| Kâğıt | `#FFFFFF` | Zemin, logo karosu |
| Sayfa | `#F8F9FA` | İkincil yüzey |
| Çizgi | `#EAECF0` | Ayraçlar |
| Kenar | `#C8CCD1` | Logo karosu kenarı, belirgin kenarlar |
| Soluk metin | `#54595D` | Açıklamalar |
| Mavi zemin | `#EAF3FF` | "Wiki Cleaner ile" vurgusu |
| Gece mavisi | `#88A3E8` | Koyu temada bağlantı mavisi |

## Yazı

- **Başlık:** [Newsreader](https://fonts.google.com/specimen/Newsreader) 400/500, sıkı
  satır aralığı (1.04), hafif negatif harf aralığı.
- **Metin:** [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) 400–600.
- **Eklenti içinde** yazı tipi taşınmaz: başlık `'Linux Libertine', Georgia, Times, serif`
  (Wikipedia'nın kendi başlık yığını), metin `system-ui`.
- İkisi de SIL Open Font License 1.1. Banner için `fonts/` altında, google/fonts deposundaki
  hâlleriyle (`ofl/newsreader/Newsreader[opsz,wght].ttf`, `ofl/hankengrotesk/HankenGrotesk[wght].ttf`)
  ve lisans metinleriyle (`OFL-Newsreader.txt`, `OFL-HankenGrotesk.txt`) duruyor.

## Dil

Kısa, somut, okurun tarafından. Ana cümle: **"Every blue word is another tab." /
"Her mavi kelime yeni bir sekme."** Başlıkta vurgulanan kelime bağlantı mavisiyle ve alt
çizgiyle yazılır; bu, logonun anlattığı şeyin aynısıdır.

## Görseller

`docs/store/` mağaza setini (1280×800, TR ve EN) tutar. `docs/banner.en.png` GitHub
paylaşım görseli ve İngilizce README'nin başındaki görsel, `docs/banner.tr.png` Türkçe
README'ninki (1280×640).

İki banner'ın kaynağı `banner.html`: iki dilin metni sayfanın içinde, dil `?lang=en` ya da
`?lang=tr` ile seçilir. PNG'leri elle düzenleme; sayfayı değiştirip yeniden üret:

```bash
npm run banner   # tools/render-banner.mjs; başsız Chrome/Chromium, CHROME=/yol/chrome ile başkası
```

Yazı tipleri `fonts/` altından gelir, sistemde kurulu olmaları gerekmez.
