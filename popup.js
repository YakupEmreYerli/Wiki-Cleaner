document.addEventListener('DOMContentLoaded', () => {
    const toggleInput = document.getElementById('toggle-status');
    const statusContainer = document.getElementById('status-container');
    const statusState = document.getElementById('status-state');

    const renderState = (isEnabled) => {
        statusState.textContent = isEnabled ? 'Açık' : 'Kapalı';
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
