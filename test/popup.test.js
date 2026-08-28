import test from 'node:test';
import assert from 'node:assert/strict';
import { createChromeStub, loadInWindow, readSource } from './helpers.js';

function boot({ storage = {}, tabs = [] } = {}) {
  const stub = createChromeStub({ storage });
  stub.chrome.tabs.queryResult = tabs;
  const dom = loadInWindow('popup.js', readSource('popup.html'), stub.chrome);
  // popup.html yüklendiğinde DOMContentLoaded çoktan geçtiği için elle tetikliyoruz.
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return { dom, doc: dom.window.document, stub, errors: dom.errors };
}

const WIKI_TAB = [{ id: 7, url: 'https://tr.wikipedia.org/wiki/Ankara' }];

test('popup.html betiğin beklediği tüm kimlikleri taşır', () => {
  const { doc } = boot();
  for (const id of ['toggle-status', 'status-container', 'status-state']) {
    assert.ok(doc.getElementById(id), `${id} elemanı yok`);
  }
});

test('panel simgesi manifestte beyan edilen dosyayı gösterir', () => {
  const { doc } = boot();
  assert.equal(doc.querySelector('.header img').getAttribute('src'), 'icons/48.png');
});

test('açık durumda durum metni ve veri özniteliği yazılır', () => {
  const { doc } = boot();
  assert.equal(doc.getElementById('status-state').textContent, 'Açık');
  assert.equal(doc.getElementById('status-container').dataset.state, 'on');
});

test('kapalı durumda durum metni ve veri özniteliği yazılır', () => {
  const { doc } = boot({ storage: { enabled: false } });
  assert.equal(doc.getElementById('status-state').textContent, 'Kapalı');
  assert.equal(doc.getElementById('status-container').dataset.state, 'off');
});

test('anahtar çevrildiğinde durum göstergesi güncellenir', () => {
  const { doc } = boot({ tabs: WIKI_TAB });
  const input = doc.getElementById('toggle-status');
  input.checked = false;
  input.dispatchEvent(new doc.defaultView.Event('change'));

  assert.equal(doc.getElementById('status-state').textContent, 'Kapalı');
  assert.equal(doc.getElementById('status-container').dataset.state, 'off');
});

test('depolama boşken anahtar açık görünür', () => {
  const { doc } = boot();
  assert.equal(doc.getElementById('toggle-status').checked, true);
});

test('enabled=false depolanmışsa anahtar kapalı görünür', () => {
  const { doc } = boot({ storage: { enabled: false } });
  assert.equal(doc.getElementById('toggle-status').checked, false);
});

test('anahtar değişimi durumu kaydeder ve sekmeye mesaj yollar', () => {
  const { doc, stub } = boot({ tabs: WIKI_TAB });
  const input = doc.getElementById('toggle-status');
  input.checked = false;
  input.dispatchEvent(new doc.defaultView.Event('change'));

  assert.deepEqual(stub.calls.storageWrites, [{ enabled: false }]);
  assert.deepEqual(stub.calls.sentMessages, [
    { tabId: 7, message: { action: 'toggleLinks', enabled: false } }
  ]);
});

test('wikipedia dışı sekmeye mesaj gönderilmez', () => {
  const { doc, stub } = boot({ tabs: [{ id: 3, url: 'https://example.com/' }] });
  const input = doc.getElementById('toggle-status');
  input.checked = false;
  input.dispatchEvent(new doc.defaultView.Event('change'));

  assert.deepEqual(stub.calls.storageWrites, [{ enabled: false }]);
  assert.equal(stub.calls.sentMessages.length, 0);
});

test('url okunamayan sekmede hata fırlatılmaz', () => {
  // Ana makine izni eşleşmediğinde tabs.query url alanını hiç döndürmez.
  const { doc, stub, errors } = boot({ tabs: [{ id: 9 }] });
  const input = doc.getElementById('toggle-status');
  input.checked = true;
  input.dispatchEvent(new doc.defaultView.Event('change'));

  assert.deepEqual(errors.map((e) => e.message), []);
  assert.equal(stub.calls.sentMessages.length, 0);
  assert.equal(stub.state.enabled, true);
});

test('açık sekme yokken çökme olmaz', () => {
  const { doc, stub, errors } = boot({ tabs: [] });
  const input = doc.getElementById('toggle-status');
  input.checked = false;
  input.dispatchEvent(new doc.defaultView.Event('change'));

  assert.deepEqual(errors.map((e) => e.message), []);
  assert.equal(stub.calls.sentMessages.length, 0);
});
