document.addEventListener('DOMContentLoaded', () => {
    const t = (key) => chrome.i18n.getMessage(key);
    document.documentElement.lang = t('@@ui_locale').split('_')[0] || 'en';
    for (const el of document.querySelectorAll('[data-i18n]')) {
        el.textContent = t(el.dataset.i18n);
    }

    const toggleInput = document.getElementById('toggle-status');
    const statusContainer = document.getElementById('status-container');
    const statusState = document.getElementById('status-state');

    const renderState = (isEnabled) => {
        statusState.textContent = t(isEnabled ? 'stateOn' : 'stateOff');
        statusContainer.dataset.state = isEnabled ? 'on' : 'off';
    };

    chrome.storage.local.get(['enabled'], (result) => {
        const isEnabled = result.enabled !== false;
        toggleInput.checked = isEnabled;
        renderState(isEnabled);
    });

    toggleInput.addEventListener('change', () => {
        const isEnabled = toggleInput.checked;
        renderState(isEnabled);

        chrome.storage.local.set({ enabled: isEnabled }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('wikipedia.org')) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleLinks", enabled: isEnabled });
                }
            });
        });
    });
});
