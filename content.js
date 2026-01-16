const EXCLUDE_SELECTORS = [
    '.reference',
    '.mw-editsection',
    '.infobox',
    'sup',
    'table'
];

const HIDE_SELECTORS = [
    '.reference'
];

let observer = null;
let customStyle = null;

function injectHideStyle() {
    if (customStyle) return;
    customStyle = document.createElement('style');
    customStyle.id = 'wp-link-cleaner-styles';
    customStyle.innerHTML = `
    .reference { display: none !important; }
  `;
    document.head.appendChild(customStyle);
}

function removeHideStyle() {
    if (customStyle) {
        customStyle.remove();
        customStyle = null;
    }
}

function shouldClean(link) {
    if (!link.getAttribute('href') || !link.getAttribute('href').startsWith('/wiki/')) {
        return false;
    }

    return !EXCLUDE_SELECTORS.some(selector => link.closest(selector));
}

function neutralizeLink(link) {
    if (link.dataset.originalHref) return;

    const href = link.getAttribute('href');
    link.dataset.originalHref = href;
    link.removeAttribute('href');

    link.dataset.originalStyle = link.getAttribute('style') || '';

    link.style.color = 'inherit';
    link.style.textDecoration = 'none';
    link.style.cursor = 'text';
    link.classList.add('wp-link-cleaned');

    link.onclick = (e) => e.preventDefault();
}

function restoreLink(link) {
    if (!link.dataset.originalHref) return;

    link.setAttribute('href', link.dataset.originalHref);

    if (link.dataset.originalStyle) {
        link.setAttribute('style', link.dataset.originalStyle);
    } else {
        link.removeAttribute('style');
    }

    delete link.dataset.originalHref;
    delete link.dataset.originalStyle;
    link.classList.remove('wp-link-cleaned');
    link.onclick = null;
}

function cleanAllLinks() {
    injectHideStyle();
    const contentArea = document.querySelector('#mw-content-text');
    if (!contentArea) return;

    const links = contentArea.querySelectorAll('a[href^="/wiki/"]');
    links.forEach(link => {
        if (shouldClean(link)) {
            neutralizeLink(link);
        }
    });
}

function restoreAllLinks() {
    removeHideStyle();
    const cleanedLinks = document.querySelectorAll('.wp-link-cleaned');
    cleanedLinks.forEach(restoreLink);
}

function startObserving() {
    if (observer) return;

    const contentArea = document.querySelector('#mw-content-text');
    if (!contentArea) return;

    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'A' && shouldClean(node)) {
                        neutralizeLink(node);
                    } else {
                        const nestedLinks = node.querySelectorAll('a[href^="/wiki/"]');
                        nestedLinks.forEach(link => {
                            if (shouldClean(link)) {
                                neutralizeLink(link);
                            }
                        });
                    }
                }
            });
        });
    });

    observer.observe(contentArea, { childList: true, subtree: true });
}

function stopObserving() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled !== false) {
        cleanAllLinks();
        startObserving();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleLinks") {
        if (request.enabled) {
            cleanAllLinks();
            startObserving();
        } else {
            stopObserving();
            restoreAllLinks();
        }
    }
});
