// docs/brand/banner.html'i başsız Chrome ile docs/banner.<dil>.png olarak çizer
// (1280×640; İngilizcesi GitHub paylaşım görseli). Ek bağımlılık yok: sistemdeki
// Chrome ya da Chromium'un kendi --screenshot seçeneği kullanılır, pencere açılmaz.
//
//   node tools/render-banner.mjs             # en ve tr
//   node tools/render-banner.mjs tr          # yalnız biri
//   node tools/render-banner.mjs --out DIR   # başka bir klasöre
//
// Tarayıcı PATH'te aranır (google-chrome-stable, google-chrome, chromium,
// chromium-browser); başka bir yerdeyse CHROME=/yol/chrome ile verilir. Yazı
// tipleri docs/brand/fonts/ altında, sistemden yazı tipi gerekmez.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DILLER = ['en', 'tr'];

const argumanlar = process.argv.slice(2);
let cikis = join(KOK, 'docs');
const istenen = [];
for (let i = 0; i < argumanlar.length; i++) {
  if (argumanlar[i] === '--out' && argumanlar[i + 1]) {
    cikis = resolve(argumanlar[++i]);
  } else if (DILLER.includes(argumanlar[i])) {
    istenen.push(argumanlar[i]);
  } else {
    console.error(`bilinmeyen argüman: ${argumanlar[i]} (en, tr ya da --out KLASÖR)`);
    process.exit(2);
  }
}

const adaylar = process.env.CHROME
  ? [process.env.CHROME]
  : ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
const chrome = adaylar.find((ad) => !spawnSync(ad, ['--version'], { stdio: 'ignore' }).error);
if (!chrome) {
  console.error('Chrome ya da Chromium bulunamadı; yolunu CHROME=/yol/chrome ile verin.');
  process.exit(1);
}

mkdirSync(cikis, { recursive: true });
// Geçici, ayrı bir profil: açık tarayıcıya ve kullanıcının profiline dokunmaz.
const profil = mkdtempSync(join(tmpdir(), 'wiki-cleaner-banner-'));
try {
  for (const dil of istenen.length ? istenen : DILLER) {
    const png = join(cikis, `banner.${dil}.png`);
    const adres = pathToFileURL(join(KOK, 'docs/brand/banner.html'));
    adres.search = `lang=${dil}`;
    const sonuc = spawnSync(chrome, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--no-default-browser-check', `--user-data-dir=${profil}`,
      '--force-device-scale-factor=1', '--window-size=1280,640',
      // Yazı tiplerinin yüklenmesini bekler; sayfada süren başka iş yok.
      '--virtual-time-budget=5000', `--screenshot=${png}`, adres.href
    ], { encoding: 'utf8' });
    if (sonuc.status !== 0) {
      console.error(sonuc.stderr || sonuc.error);
      process.exitCode = 1;
      break;
    }
    console.log(`${png} üretildi`);
  }
} finally {
  rmSync(profil, { recursive: true, force: true });
}
