import test from 'node:test';
import assert from 'node:assert/strict';
import { createChromeStub, loadInWindow } from './helpers.js';

const MENU_ID = 'toggle-wikipedia-links';

function boot({ storage = {} } = {}) {
  const stub = createChromeStub({ storage });
  loadInWindow('background.js', '<!DOCTYPE html><html><body></body></html>', stub.chrome);
  return stub;
}

const install = (stub) => stub.listeners.onInstalled.forEach((fn) => fn());
const clickMenu = (stub, info, tab) =>
  stub.listeners.onMenuClicked.forEach((fn) => fn(info, tab));

test('kurulumda sağ tık menüsü kaydedilir', () => {
  const stub = boot();
  install(stub);

  assert.equal(stub.calls.createdMenus.length, 1);
  const menu = stub.calls.createdMenus[0];
  assert.equal(menu.id, MENU_ID);
  assert.deepEqual(menu.contexts, ['page']);
  assert.deepEqual(menu.documentUrlPatterns, ['*://*.wikipedia.org/wiki/*']);
});

test('kurulumda varsayılan durum açık yazılır', () => {
  const stub = boot();
  install(stub);
  assert.equal(stub.state.enabled, true);
});

test('kurulum mevcut kullanıcı tercihini ezmez', () => {
  const stub = boot({ storage: { enabled: false } });
  install(stub);
  assert.equal(stub.state.enabled, false);
  assert.equal(stub.calls.storageWrites.length, 0);
});

test('menü tıklaması durumu tersine çevirip sekmeye bildirir', () => {
  const stub = boot({ storage: { enabled: true } });
  clickMenu(stub, { menuItemId: MENU_ID }, { id: 42 });

  assert.equal(stub.state.enabled, false);
  assert.deepEqual(stub.calls.sentMessages, [
    { tabId: 42, message: { action: 'toggleLinks', enabled: false } }
  ]);
});

test('kapalı durumdan menü tıklaması yeniden açar', () => {
  const stub = boot({ storage: { enabled: false } });
  clickMenu(stub, { menuItemId: MENU_ID }, { id: 42 });

  assert.equal(stub.state.enabled, true);
  assert.equal(stub.calls.sentMessages[0].message.enabled, true);
});

test('başka menü öğeleri yok sayılır', () => {
  const stub = boot({ storage: { enabled: true } });
  clickMenu(stub, { menuItemId: 'baska-menu' }, { id: 42 });

  assert.equal(stub.state.enabled, true);
  assert.equal(stub.calls.sentMessages.length, 0);
});
