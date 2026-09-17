// Chrome Web Mağazası ve Edge Eklentileri için paket üretir.
//
// Tek manifest iki tarayıcıya yazılı; Chromium mağazaları Firefox'a özel
// `browser_specific_settings` ve `background.scripts` alanları için uyarı veriyor.
// Bu betik yalnızca paketlenecek dosyaları geçici bir dizine kopyalar, o iki alanı
// çıkarır ve `web-ext build` ile web-ext-artifacts/ altına zip üretir.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOSYALAR = ['manifest.json', 'background.js', 'content.js', 'popup.html', 'popup.js', 'LICENSE', '_locales', 'icons'];

const manifest = JSON.parse(fs.readFileSync(path.join(KOK, 'manifest.json'), 'utf8'));
delete manifest.browser_specific_settings;
manifest.background = { service_worker: manifest.background.service_worker };

const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-cleaner-chromium-'));
try {
  for (const ad of DOSYALAR) {
    fs.cpSync(path.join(KOK, ad), path.join(gecici, ad), {
      recursive: true,
      filter: (kaynak) => !kaynak.endsWith('.svg')
    });
  }
  fs.writeFileSync(path.join(gecici, 'manifest.json'), JSON.stringify(manifest, null, 4) + '\n');

  const cikti = path.join(KOK, 'web-ext-artifacts');
  const ad = `wiki_cleaner-chromium-${manifest.version}.zip`;
  const sonuc = spawnSync(
    'web-ext',
    ['build', '--source-dir', gecici, '--artifacts-dir', cikti, '--filename', ad, '--overwrite-dest', '--no-config-discovery'],
    { stdio: 'inherit', shell: false, env: process.env }
  );
  if (sonuc.status !== 0) process.exit(sonuc.status ?? 1);
  console.log(`Chromium paketi: web-ext-artifacts/${ad}`);
} finally {
  fs.rmSync(gecici, { recursive: true, force: true });
}
