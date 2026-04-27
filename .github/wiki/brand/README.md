# Islam.wiki Brand Assets

Public repo brand documentation. See Ummeco PPI for multi-repo context.

## Colors

Islam.wiki uses near-black backgrounds for long-form reading comfort.
Green is used as an accent only — not as the primary background or text color.

| Token | Hex | Use |
|---|---|---|
| Accent | `#79C24C` | Links, headings, highlights |
| Accent Light | `#C9F27A` | Hover states |
| Background | `#0a0a0a` | Page background (near-black for reading) |
| Surface | `#141414` | Card backgrounds |
| Foreground | `#f7f7f7` | Body text |

## Theme File

`islamwiki/web/app/theme.css` — import in `layout.tsx`.

## Required Asset Sizes

| Asset | Size | Location |
|---|---|---|
| favicon.ico | multi-size | `web/public/favicon.ico` |
| apple-touch-icon.png | 180x180 | `web/public/apple-touch-icon.png` |
| android-chrome-192.png | 192x192 | `web/public/android-chrome-192x192.png` |
| android-chrome-512.png | 512x512 | `web/public/android-chrome-512x512.png` |
| og-image.png | 1200x630 | `web/public/og-image.png` |

## Typography

- Latin: Inter (Google Fonts, Variable)
- Arabic: Noto Naskh Arabic (Google Fonts, MIT) — primary script for content
- Urdu: Noto Nastaliq Urdu (Google Fonts, MIT) — load only on Urdu routes

RTL: most Islam.wiki content is Arabic-primary. Ensure `dir="rtl"` on Arabic content containers.

## Source

Master icon and logo source files are maintained in the private `ummeco/ummat` repo under `.docs/brand/source/`.
