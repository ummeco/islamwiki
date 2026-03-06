# Brand Assets — Islam.wiki

Last updated: 2026-03-05

## Location

`.github/wiki/brand/` (public repo — git-tracked, excluded from wiki sync)

## Root Assets

| File | Dimensions | Size | Notes |
| --- | --- | --- | --- |
| `icon.png` | 512×512 | 39K | Master icon (pngquant optimized) |
| `icon-maskable.png` | 512×512 | 27K | PWA maskable (74% canvas, rounded-dark bg) |
| `favicon.ico` | 64/48/32/16 | 8.6K | Multi-layer browser favicon |
| `manifest.webmanifest` | — | 541B | PWA web manifest |

## icons/ (16 sizes)

| File | Pixels | Size |
| --- | --- | --- |
| `icon-2k.png` | 2048×2048 | 496K |
| `icon-1k.png` | 1024×1024 | 142K |
| `icon-512.png` | 512×512 | 39K |
| `icon-256.png` | 256×256 | 13K |
| `icon-192.png` | 192×192 | 8.4K |
| `icon-180.png` | 180×180 | 7.8K |
| `icon-167.png` | 167×167 | 6.9K |
| `icon-152.png` | 152×152 | 6.2K |
| `icon-144.png` | 144×144 | 5.7K |
| `icon-128.png` | 128×128 | 4.9K |
| `icon-96.png` | 96×96 | 3.4K |
| `icon-72.png` | 72×72 | 2.5K |
| `icon-64.png` | 64×64 | 2.3K |
| `icon-48.png` | 48×48 | 1.9K |
| `icon-32.png` | 32×32 | 1.1K |
| `icon-16.png` | 16×16 | 484B |

## icon-variants/ (7 folders, 5 sizes each: 1k/512/256/192/128)

| Folder | Background | Shape | Use |
| --- | --- | --- | --- |
| `circle-pad/` | Transparent | None | Platforms that apply their own circle crop |
| `circle-white/` | White `#FFFFFF` | None | Light surface app icons |
| `circle-black/` | Black `#000000` | None | Dark surface app icons |
| `rounded-light/` | `#C9F27A` | Rounded square r=22% | Brand light bg variant |
| `rounded-dark/` | `#1E5E2F` | Rounded square r=22% | Android adaptive, store listings |
| `circle-light/` | `#C9F27A` | Circle | Social avatars on light bg |
| `circle-dark/` | `#1E5E2F` | Circle | Social avatars on dark bg |

## source/

| Path | Type | Notes |
| --- | --- | --- |
| `canonical/icon.png` | PNG 1024×1024 | Original source |
| `canonical/icon.svg` | SVG | Vectorizer.ai test (watermarked) — run `~/bin/svg-batch.py` for production |

## web/public/ (deployed)

| File | Notes |
| --- | --- |
| `icon.png` | 512×512, pngquant optimized |
| `icon-192.png` | Android home screen |
| `icon-512.png` | Splash / app stores |
| `icon-maskable.png` | Android adaptive icon |
| `apple-touch-icon.png` | iOS Safari bookmark (180px) |
| `favicon.ico` | Multi-layer (64/48/32/16) |
| `manifest.webmanifest` | PWA manifest |

## SVG Queue

`source/canonical/icon.svg` was generated via Vectorizer.ai test mode (watermarked placeholder).
Run `~/bin/svg-batch.py` with an active Vectorizer.ai subscription to upgrade to production quality.
See `~/.claude/svg-queue.md` for the queue entry.
