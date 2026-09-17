# Changelog

All notable changes to Wiki Cleaner. Versions match `manifest.json` and the
[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/wiki-cleaner/) listing.

## 1.3.0

### Changed

- New identity: the "Ink W" logo, drawn from a Newsreader W with a link underline
  that fades out. Icons are rendered from `icons/icon.svg` and `icons/icon-small.svg`.
- The popup now uses Wikipedia's own ink, rule and link colours, with the title set
  in Wikipedia's heading typeface stack. Dark mode follows the same palette.

### Added

- Store screenshots in English and Turkish (`docs/store/`), a brand kit
  (`docs/brand/`) and a GitHub social preview image.

## 1.2.0

### Fixed

- Links were no longer cleaned on live Wikipedia pages. Wikipedia now serves most
  article links as absolute URLs (`https://en.wikipedia.org/wiki/…`); links are now
  resolved and cleaned when they point to a `/wiki/` page on the same host.
  Links to other language editions and non-article pages are left alone.

### Added

- English and Turkish interface, following the browser language.
- Releases are published from a tag: tests, lint, signed submission to Firefox
  Add-ons and a GitHub release with the signed `.xpi`.

### Changed

- The extension is named Wiki Cleaner everywhere.

## 1.1.0

### Changed

- Moved to Manifest V3, with a redesigned toolbar popup and icon.

## 1.0

- First release on Firefox Add-ons.
