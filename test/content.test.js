import test from 'node:test';
import assert from 'node:assert/strict';
import { createChromeStub, loadInWindow, flush } from './helpers.js';
import { ARTICLE_HTML } from './fixtures.js';

function boot({ enabled } = {}) {
  const stub = createChromeStub({ storage: enabled === undefined ? {} : { enabled } });
  const dom = loadInWindow('content.js', ARTICLE_HTML, stub.chrome);
  return { dom, doc: dom.window.document, stub };
}

const toggle = (stub, enabled) => {
  for (const fn of stub.listeners.onMessage) {
    fn({ action: 'toggleLinks', enabled }, {}, () => {});
  }
};

test('depolama boşken temizleme varsayılan olarak açılır', () => {
  const { doc } = boot();
  assert.equal(doc.getElementById('body-link').hasAttribute('href'), false);
});

test('makale gövdesindeki /wiki/ bağlantıları tıklanamaz hale gelir', () => {
  const { doc } = boot();
  const link = doc.getElementById('body-link');
  assert.equal(link.hasAttribute('href'), false);
  assert.equal(link.dataset.originalHref, '/wiki/Ankara');
  assert.ok(link.classList.contains('wp-link-cleaned'));
  assert.equal(link.style.textDecoration, 'none');
});

test('dış bağlantılar ve çapa bağlantıları korunur', () => {
  const { doc } = boot();
  assert.equal(doc.getElementById('external-link').getAttribute('href'), 'https://example.com/x');
  assert.equal(doc.getElementById('anchor-link').getAttribute('href'), '#kaynakca');
});

test('#mw-content-text dışındaki bağlantılara dokunulmaz', () => {
  const { doc } = boot();
  assert.equal(doc.getElementById('sidebar-link').getAttribute('href'), '/wiki/Anasayfa');
});

test('korumalı alanlardaki bağlantılar bozulmaz', () => {
  const { doc } = boot();
  for (const id of ['ref-link', 'sup-link', 'edit-link', 'infobox-link', 'table-link']) {
    assert.ok(doc.getElementById(id).hasAttribute('href'), `${id} href kaybetti`);
  }
});

test('atıf işaretlerini gizleyen stil enjekte edilir', () => {
  const { doc } = boot();
  const style = doc.getElementById('wp-link-cleaner-styles');
  assert.ok(style);
  assert.match(style.textContent, /\.reference\s*\{\s*display:\s*none/);
});

test('depolamada enabled=false ise hiçbir şey temizlenmez', () => {
  const { doc } = boot({ enabled: false });
  assert.equal(doc.getElementById('body-link').getAttribute('href'), '/wiki/Ankara');
  assert.equal(doc.getElementById('wp-link-cleaner-styles'), null);
});

test('kapatma mesajı bağlantıları ve stilleri geri yükler', () => {
  const { doc, stub } = boot();
  toggle(stub, false);

  assert.equal(doc.getElementById('body-link').getAttribute('href'), '/wiki/Ankara');
  assert.equal(doc.getElementById('body-link').hasAttribute('style'), false);
  assert.equal(doc.getElementById('body-link').dataset.originalHref, undefined);
  assert.equal(doc.querySelectorAll('.wp-link-cleaned').length, 0);
  assert.equal(doc.getElementById('wp-link-cleaner-styles'), null);
});

test('geri yükleme sayfanın kendi satır içi stilini kaybetmez', () => {
  const { doc, stub } = boot();
  toggle(stub, false);
  assert.equal(doc.getElementById('styled-link').getAttribute('style'), 'color: rgb(255, 0, 0);');
});

test('kapat/aç döngüsü tekrar temizler', () => {
  const { doc, stub } = boot();
  toggle(stub, false);
  toggle(stub, true);
  assert.equal(doc.getElementById('body-link').hasAttribute('href'), false);
  assert.ok(doc.getElementById('wp-link-cleaner-styles'));
});

test('sonradan eklenen bağlantılar MutationObserver ile temizlenir', async () => {
  const { doc } = boot();
  const holder = doc.getElementById('lazy');
  holder.innerHTML = '<p><a id="late-link" href="/wiki/Bursa">Bursa</a></p>';
  await flush();
  assert.equal(doc.getElementById('late-link').hasAttribute('href'), false);
});

test('doğrudan eklenen <a> düğümü de temizlenir', async () => {
  const { doc } = boot();
  const link = doc.createElement('a');
  link.id = 'direct-link';
  link.setAttribute('href', '/wiki/Konya');
  doc.getElementById('lazy').appendChild(link);
  await flush();
  assert.equal(link.hasAttribute('href'), false);
});

test('kapalıyken eklenen bağlantılar izlenmez', async () => {
  const { doc, stub } = boot();
  toggle(stub, false);
  doc.getElementById('lazy').innerHTML = '<a id="off-link" href="/wiki/Sivas">Sivas</a>';
  await flush();
  assert.equal(doc.getElementById('off-link').getAttribute('href'), '/wiki/Sivas');
});
