# Wikipedia Link Cleaner

[![CI](https://github.com/YakupEmreYerli/Wiki-Cleaner/actions/workflows/ci.yml/badge.svg)](https://github.com/YakupEmreYerli/Wiki-Cleaner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-%E2%89%A5%20142.0-FF7139?logo=firefoxbrowser&logoColor=white)](manifest.json)
[![Manifest](https://img.shields.io/badge/manifest-v2-informational)](manifest.json)
[![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-success)](package.json)

A Firefox add-on that turns internal Wikipedia links into unclickable plain text
and hides citation markers, so reading an article stops feeling like resisting
"just one more tab".

> 🇹🇷 Türkçe sürüm: [README.md](README.md)

## What it does

| Behaviour | Implementation |
| --- | --- |
| Neutralises internal links | For `a[href^="/wiki/"]` inside `#mw-content-text`, the `href` attribute is removed and preserved in `data-original-href` |
| Makes them look like text | The link gets `color: inherit`, `text-decoration: none`, `cursor: text` and the `wp-link-cleaned` class |
| Blocks clicks | An `onclick` handler calling `preventDefault` is attached |
| Hides citation markers | A `<style id="wp-link-cleaner-styles">` is injected with `.reference { display: none !important; }` |
| Catches late content | A `MutationObserver` watches `#mw-content-text` with `childList` + `subtree` |
| Remembers the preference | State lives in the `enabled` boolean in `chrome.storage.local`, defaulting to `true` |
| Restores cleanly | `href`, the page's own inline style, the class and `onclick` are all reverted |

### What it leaves alone

Cleaning is scoped to `#mw-content-text`, so the sidebar, top navigation and page
footer are out of range by construction. Inside the article body, links under any
of these selectors are skipped:

`.reference` · `.mw-editsection` · `.infobox` · `sup` · `table`

That keeps footnote links, "edit" links, infoboxes and navigation tables
(including `table.navbox`) working. External links and in-page anchors (`#section`)
are never considered, because they do not start with `/wiki/`.

## Architecture

```mermaid
flowchart LR
    subgraph UI["User controls"]
        P["popup.html + popup.js<br/>toolbar switch"]
        M["background.js<br/>context menu"]
    end

    S[("chrome.storage.local<br/>enabled: boolean")]

    subgraph CS["content.js — wikipedia.org/wiki/*"]
        C["cleanAllLinks() /<br/>restoreAllLinks()"]
        O["MutationObserver<br/>#mw-content-text"]
    end

    P -->|"storage.local.set"| S
    M -->|"storage.local.set"| S
    P -->|"tabs.sendMessage<br/>action: toggleLinks"| C
    M -->|"tabs.sendMessage<br/>action: toggleLinks"| C
    S -.->|"read on page load"| C
    C --> O
    O -->|"new nodes"| C
```

Three moving parts:

1. **`content.js`** reads `enabled` from `chrome.storage.local` on page load. If the
   value is not `false`, it cleans the article and starts the observer.
2. **`popup.js`** writes the switch state to storage, then sends a `toggleLinks`
   message to the *active* tab.
3. **`background.js`** creates the context menu on install, seeds the default
   state, and on click flips the state and messages the *clicked* tab.

## Installation

The add-on is not on AMO yet, so load it as a temporary extension:

1. Open `about:debugging` in Firefox.
2. Choose **This Firefox** in the left menu.
3. Click **Load Temporary Add-on…**.
4. Pick the `manifest.json` file in the project directory.

Temporary add-ons are removed when Firefox restarts. Run `npm run build` to
produce a packaged `.zip` under `web-ext-artifacts/`.

## Development

```bash
npm install
```

| Command | What it does |
| --- | --- |
| `npm test` | Runs the unit tests with `node:test` + `jsdom` (33 tests) |
| `npm run lint` | Validates the add-on with `web-ext lint`, treating warnings as errors |
| `npm run build` | Produces a distributable `.zip` in `web-ext-artifacts/` |
| `npm audit --audit-level=critical` | Audits the development dependencies |

The tests back the `chrome.*` APIs with a narrow stub in `test/helpers.js` and load
the real `popup.html`, which also verifies the `toggle-status` contract between the
markup and the script. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

CI runs the tests on Node 22/24 for every push and pull request, then runs
`web-ext lint` and the dependency audit; if both pass it builds the package and
uploads it as an artifact.

## Known limits

- **Firefox only.** The package is Manifest V2 (`background.scripts`,
  `browser_action`) and targets Firefox 142.0+ via
  `browser_specific_settings.gecko`. Current Chrome releases will not load it.
- **Toggling reaches one tab.** Both the panel and the context menu message a
  single tab. Other open Wikipedia tabs keep their previous state until reloaded,
  even though the stored preference updates immediately.
- **Citation hiding is broad.** The injected style hides every `.reference` element
  on the page, including the back-links in the "References" section.

## Privacy

The add-on makes no network requests, collects no data and loads no remote code.
The only thing it stores is the `enabled` preference, and it never leaves the
device. See [SECURITY.md](SECURITY.md).

## Project layout

```
manifest.json      Add-on definition, permissions and Firefox target
content.js         DOM work: neutralise/restore plus the MutationObserver
background.js      Context menu and default-state setup
popup.html         Markup and styling for the toolbar panel
popup.js           State handling for the panel switch
icons/48.png       48×48 add-on icon
test/              node:test + jsdom unit tests
```

## License

[MIT](LICENSE) © Yakup Emre Yerli
