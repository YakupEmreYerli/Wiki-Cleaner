#!/usr/bin/env bash
# icons/*.svg kaynaklarından manifest'in beklediği PNG'leri üretir.
#
# Gereksinim: librsvg (rsvg-convert). Debian/Ubuntu: apt install librsvg2-bin
#             Arch: pacman -S librsvg   ·   macOS: brew install librsvg
#
# 16 piksel, alt çizgi bu ölçekte W'yi sıkıştırdığı için
# sadeleştirilmiş icon-small.svg kaynağından üretilir.
set -euo pipefail

cd "$(dirname "$0")/.."

command -v rsvg-convert >/dev/null || {
  echo "rsvg-convert bulunamadı; librsvg kurulu değil." >&2
  exit 1
}

for size in 16; do
  rsvg-convert -w "$size" -h "$size" icons/icon-small.svg -o "icons/$size.png"
  echo "icons/$size.png üretildi (icon-small.svg)"
done

for size in 32 48 96 128; do
  rsvg-convert -w "$size" -h "$size" icons/icon.svg -o "icons/$size.png"
  echo "icons/$size.png üretildi (icon.svg)"
done
