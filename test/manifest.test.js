import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readSource } from './helpers.js';

const manifest = JSON.parse(readSource('manifest.json'));
const pkg = JSON.parse(readSource('package.json'));

test('manifest geçerli JSON ve manifest_version 3', () => {
  assert.equal(manifest.manifest_version, 3);
});

test('arka plan hem Chrome hem Firefox için tanımlanmış', () => {
  // MDN'in çapraz tarayıcı önerisi: Chrome service_worker'ı, Firefox
  // scripts'i kullanır. İkisi de aynı dosyayı göstermeli.
  assert.deepEqual(manifest.background.scripts, ['background.js']);
  assert.equal(manifest.background.service_worker, 'background.js');
});

test('her iki mağaza için asgari tarayıcı sürümü beyan edilmiş', () => {
  assert.ok(manifest.minimum_chrome_version);
  assert.ok(manifest.browser_specific_settings.gecko.strict_min_version);
});

test('manifest sürümü package.json ile birebir aynı', () => {
  assert.equal(manifest.version, pkg.version);
});

test('manifestte adı geçen tüm dosyalar mevcut', () => {
  const referenced = [
    ...manifest.background.scripts,
    ...manifest.content_scripts.flatMap((cs) => cs.js),
    manifest.action.default_popup,
    ...Object.values(manifest.action.default_icon),
    ...Object.values(manifest.icons)
  ];
  for (const file of referenced) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} bulunamadı`);
  }
});

test('simge seti Firefox\'un istediği tüm ölçekleri kapsar', () => {
  assert.deepEqual(Object.keys(manifest.icons), ['16', '32', '48', '96', '128']);
  assert.deepEqual(Object.keys(manifest.action.default_icon), ['16', '32', '48']);
});

test('her PNG simge beyan edilen ölçekte üretilmiş', () => {
  // PNG başlığı: 8 bayt imza + 4 bayt uzunluk + "IHDR" + 4 bayt en + 4 bayt boy
  for (const [size, file] of Object.entries(manifest.icons)) {
    const header = fs.readFileSync(path.join(ROOT, file)).subarray(16, 24);
    assert.equal(header.readUInt32BE(0), Number(size), `${file} eni yanlış`);
    assert.equal(header.readUInt32BE(4), Number(size), `${file} boyu yanlış`);
  }
});

test('PNG simgelerin SVG kaynakları depoda duruyor', () => {
  for (const svg of ['icons/icon.svg', 'icons/icon-small.svg']) {
    assert.ok(fs.existsSync(path.join(ROOT, svg)), `${svg} bulunamadı`);
  }
});

test('içerik betiği, host izni ve sağ tık menüsü aynı alan adı kalıbını kullanır', () => {
  const pattern = '*://*.wikipedia.org/wiki/*';
  assert.deepEqual(manifest.content_scripts[0].matches, [pattern]);
  assert.deepEqual(manifest.host_permissions, [pattern]);
  assert.match(readSource('background.js'), /\*:\/\/\*\.wikipedia\.org\/wiki\/\*/);
});

test('yalnızca gerekli izinler isteniyor', () => {
  assert.deepEqual(manifest.permissions.slice().sort(), ['contextMenus', 'storage']);
});

test('yayındaki AMO sürümünden ileri bir sürüm numarası taşınıyor', () => {
  // AMO 1.0 sürümünü yayımladı ve sürüm karşılaştırıcısı sondaki sıfırları
  // yok sayar; bu yüzden 1.0.0 güncelleme olarak kabul edilmez.
  const [major, minor] = manifest.version.split('.').map(Number);
  assert.ok(major > 1 || (major === 1 && minor >= 1),
    `${manifest.version} AMO'daki 1.0 sürümünün ilerisinde değil`);
});

test('eklenti veri toplamadığını beyan eder', () => {
  const gecko = manifest.browser_specific_settings.gecko;
  assert.deepEqual(gecko.data_collection_permissions.required, ['none']);
  assert.ok(gecko.id);
});

test('popup.html popup.js dosyasını yükler', () => {
  assert.match(readSource('popup.html'), /<script src="popup\.js"><\/script>/);
});
