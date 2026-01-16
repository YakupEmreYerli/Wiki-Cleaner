const MENU_ID = "toggle-wikipedia-links";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Wikipedia Linklerini Temizle/Geri Al",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.wikipedia.org/wiki/*"]
  });

  chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.local.set({ enabled: true });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) {
    chrome.storage.local.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        chrome.tabs.sendMessage(tab.id, { action: "toggleLinks", enabled: newState });
      });
    });
  }
});
