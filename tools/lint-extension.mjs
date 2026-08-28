// `web-ext lint`i çalıştırır ve sonucu sıkı biçimde değerlendirir:
// hata varsa ya da beyaz listede olmayan bir uyarı çıkarsa süreç düşer.
//
// Uyarıları doğrudan hataya çevirmek (--warnings-as-errors) yerine bu sarmalayıcı
// kullanılıyor, çünkü çapraz tarayıcı MV3 kurulumu kaçınılmaz olarak tek bir
// bilinen uyarı üretiyor ve onu körü körüne susturmak yerine adıyla tanımak
// istiyoruz.
import { spawnSync } from 'node:child_process';

// Kod -> neden kabul edildiği. Buraya ekleme yapmak bilinçli bir karar olmalı.
const IZIN_VERILEN_UYARILAR = {
  // MDN'in önerdiği çapraz tarayıcı kurulumu: Chrome "service_worker",
  // Firefox "scripts" anahtarını kullanır. Firefox yok saydığını bildiriyor.
  // https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background
  BACKGROUND_SERVICE_WORKER_IGNORED:
    'Chrome için gerekli; Firefox background.scripts kullanır'
};

const sonuc = spawnSync(
  'web-ext',
  ['lint', '--source-dir', '.', '-o', 'json'],
  { encoding: 'utf8', shell: false, env: process.env }
);

if (sonuc.error) {
  console.error('web-ext çalıştırılamadı:', sonuc.error.message);
  process.exit(1);
}

let rapor;
try {
  rapor = JSON.parse(sonuc.stdout);
} catch {
  console.error('web-ext lint çıktısı okunamadı:\n', sonuc.stdout, sonuc.stderr);
  process.exit(1);
}

const hatalar = rapor.errors ?? [];
const uyarilar = rapor.warnings ?? [];
const beklenmeyen = uyarilar.filter((u) => !(u.code in IZIN_VERILEN_UYARILAR));

for (const h of hatalar) {
  console.error(`HATA  ${h.code} · ${h.file ?? '-'} · ${h.message}`);
}
for (const u of beklenmeyen) {
  console.error(`UYARI ${u.code} · ${u.file ?? '-'} · ${u.message}`);
}
for (const u of uyarilar.filter((u) => u.code in IZIN_VERILEN_UYARILAR)) {
  console.log(`beklenen uyarı: ${u.code} — ${IZIN_VERILEN_UYARILAR[u.code]}`);
}

if (hatalar.length || beklenmeyen.length) {
  console.error(
    `\nweb-ext lint başarısız: ${hatalar.length} hata, ${beklenmeyen.length} beklenmeyen uyarı.`
  );
  process.exit(1);
}

console.log(
  `web-ext lint temiz: 0 hata, ${uyarilar.length} beklenen uyarı, ${(rapor.notices ?? []).length} bildirim.`
);
