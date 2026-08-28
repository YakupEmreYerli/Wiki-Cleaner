import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readSource } from './helpers.js';

const manifest = JSON.parse(readSource('manifest.json'));
const pkg = JSON.parse(readSource('package.json'));

test('manifest geçerli JSON ve manifest_version 2', () => {
  assert.equal(manifest.manifest_version, 2);
});

test('manifest sürümü package.json ile birebir aynı', () => {
  assert.equal(manifest.version, pkg.version);
});

test('manifestte adı geçen tüm dosyalar mevcut', () => {
  const referenced = [
    ...manifest.background.scripts,
    ...manifest.content_scripts.flatMap((cs) => cs.js),
    manifest.browser_action.default_popup,
    manifest.browser_action.default_icon,
    ...Object.values(manifest.icons)
  ];
  for (const file of referenced) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} bulunamadı`);
  }
});

test('içerik betiği ile sağ tık menüsü aynı alan adı kalıbını kullanır', () => {
  const pattern = '*://*.wikipedia.org/wiki/*';
  assert.deepEqual(manifest.content_scripts[0].matches, [pattern]);
  assert.ok(manifest.permissions.includes(pattern));
  assert.match(readSource('background.js'), /\*:\/\/\*\.wikipedia\.org\/wiki\/\*/);
});

test('yalnızca gerekli izinler isteniyor', () => {
  assert.deepEqual(manifest.permissions.slice().sort(), [
    '*://*.wikipedia.org/wiki/*',
    'contextMenus',
    'storage'
  ]);
});

test('eklenti veri toplamadığını beyan eder', () => {
  const gecko = manifest.browser_specific_settings.gecko;
  assert.deepEqual(gecko.data_collection_permissions.required, ['none']);
  assert.ok(gecko.id);
});

test('popup.html popup.js dosyasını yükler', () => {
  assert.match(readSource('popup.html'), /<script src="popup\.js"><\/script>/);
});
