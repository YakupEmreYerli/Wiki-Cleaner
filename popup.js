document.addEventListener('DOMContentLoaded', () => {
    const toggleInput = document.getElementById('toggle-status');

    chrome.storage.local.get(['enabled'], (result) => {
        toggleInput.checked = result.enabled !== false;
    });

    toggleInput.addEventListener('change', () => {
        const isEnabled = toggleInput.checked;

        chrome.storage.local.set({ enabled: isEnabled }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].url.includes('wikipedia.org')) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleLinks", enabled: isEnabled });
                }
            });
        });
    });
});
