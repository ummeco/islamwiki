# Multilingual

Islam.wiki supports multiple languages for both the UI and content. Arabic is always present as the primary language for Quran and Hadith text. English is the default display language.

## Current languages

| Language | Code | UI | Quran translations | Hadith |
| --- | --- | --- | --- | --- |
| English | `en` | Full | Multiple | Full |
| Arabic | `ar` | Partial | Primary text | Primary text |
| Indonesian | `id` | Partial | 1 translation | Partial |

## Planned languages (roadmap)

| Language | Code | Priority |
| --- | --- | --- |
| French | `fr` | High |
| Turkish | `tr` | High |
| Urdu | `ur` | High |
| Malay | `ms` | Medium |
| Somali | `so` | Medium |
| Bengali | `bn` | Medium |

Languages will be added as translations are sourced and verified. Community contributions are welcome — see [[Contributors]].

## URL structure

Language is indicated by URL prefix for non-default locales:

```
/en/quran/al-fatiha     (explicit English — same as /quran/al-fatiha)
/ar/quran/al-fatiha     (Arabic UI + Arabic-primary display)
/id/quran/al-fatiha     (Indonesian)
```

The default locale (`en`) requires no prefix. All pages are accessible without a language prefix and default to English.

## Arabic text rendering

All Arabic text uses the Amiri Quran font for Quran display and the Amiri font for other Arabic text. Pages with Arabic content automatically set `dir="rtl"` for the relevant element, not the entire page, so mixed RTL/LTR layouts render correctly.

## Quran translations

Multiple English translations are available on every ayah page. The user's preferred translation is stored locally and applied across the site. Available translations:

| Key | Name | Translator |
| --- | --- | --- |
| `en.saheeh` | Saheeh International | Saheeh International |
| `en.pickthall` | Pickthall | Mohammed Marmaduke Pickthall |
| `en.yusufali` | Yusuf Ali | Abdullah Yusuf Ali |
| `en.hilali` | Hilali-Khan | Muhammad Muhsin Khan |
| `ar.muyassar` | Al-Tafsir al-Muyassar | Arabic simplified tafsir |
| `id.indonesian` | Kemenag | Indonesian Ministry of Religious Affairs |

## Hadith translations

Hadith translations are currently available in English for all major collections. Indonesian translations are available for Bukhari and Muslim. Additional translations will be added over time.

## Hreflang SEO

All content pages include `hreflang` alternate link tags for available translations. This ensures search engines index the correct language variant for each user's locale.

## See Also

- [[Content-Sources]] -- what content is available per language
- [[Contributors]] -- how to contribute translations
