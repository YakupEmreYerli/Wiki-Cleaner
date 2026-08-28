import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

/** jsdom kendi realm'inde nesne üretir; deepStrictEqual için düz kopya alıyoruz. */
const plain = (value) => JSON.parse(JSON.stringify(value));

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function readSource(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

/**
 * Minimal `chrome` stub covering only the APIs the extension actually calls.
 * Callbacks fire synchronously so tests stay deterministic.
 */
export function createChromeStub({ storage = {} } = {}) {
  const state = { ...storage };
  const calls = {
    sentMessages: [],
    createdMenus: [],
    storageWrites: []
  };
  const listeners = {
    onMessage: [],
    onInstalled: [],
    onMenuClicked: []
  };

  const chrome = {
    storage: {
      local: {
        get(keys, cb) {
          const out = {};
          for (const key of [].concat(keys)) {
            if (key in state) out[key] = state[key];
          }
          cb(out);
        },
        set(items, cb) {
          Object.assign(state, plain(items));
          calls.storageWrites.push(plain(items));
          if (cb) cb();
        }
      }
    },
    runtime: {
      onMessage: { addListener: (fn) => listeners.onMessage.push(fn) },
      onInstalled: { addListener: (fn) => listeners.onInstalled.push(fn) }
    },
    contextMenus: {
      create: (menu) => calls.createdMenus.push(plain(menu)),
      onClicked: { addListener: (fn) => listeners.onMenuClicked.push(fn) }
    },
    tabs: {
      queryResult: [],
      query(_info, cb) {
        cb(chrome.tabs.queryResult);
      },
      sendMessage(tabId, message) {
        calls.sentMessages.push({ tabId, message: plain(message) });
      }
    }
  };

  return { chrome, state, calls, listeners };
}

/** Loads a source file inside a jsdom window with the chrome stub attached. */
export function loadInWindow(sourceFile, html, chromeStub) {
  // jsdom olay dinleyicisi içinde patlayan istisnaları yutar; testin görebilmesi
  // için sanal konsoldan toplayıp dom.errors üzerinden dışarı veriyoruz.
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => errors.push(err));

  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'https://tr.wikipedia.org/wiki/Test',
    virtualConsole
  });
  dom.errors = errors;
  dom.window.chrome = chromeStub;
  dom.window.eval(readSource(sourceFile));
  return dom;
}

/** Lets queued MutationObserver microtasks flush. */
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
