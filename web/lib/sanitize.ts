import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML for safe rendering via dangerouslySetInnerHTML.
 * Allows standard content tags but strips scripts, event handlers, etc.
 */
export function sanitizeHtml(dirty: string): string {
  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr', 'blockquote', 'pre', 'code',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'a', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
        'span', 'div', 'section', 'article',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'img', 'figure', 'figcaption',
        'ruby', 'rt', 'rp',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'dir', 'lang', 'colspan', 'rowspan',
        'width', 'height', 'loading',
        'target', 'rel',
      ],
      ALLOW_DATA_ATTR: false,
    })
  } catch {
    return ''
  }
}

// Allowlisted embed origins — iframes with any other src are stripped
const ALLOWED_EMBED_ORIGINS = [
  'https://www.youtube.com/embed/',
  'https://youtube.com/embed/',
  'https://www.youtube-nocookie.com/embed/',
  'https://player.vimeo.com/video/',
  'https://w.soundcloud.com/player/',
]

/**
 * Sanitize HTML for embed codes (iframes allowed for video embeds).
 * Enforces src allowlist post-purify — only known video platforms permitted.
 */
export function sanitizeEmbed(dirty: string): string {
  try {
    const purified = DOMPurify.sanitize(dirty, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      ALLOWED_TAGS: [
        'iframe', 'div', 'p', 'br', 'span', 'a',
        'strong', 'em', 'b', 'i',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class',
        'width', 'height', 'frameborder',
        'allow', 'allowfullscreen', 'scrolling',
        'target', 'rel',
      ],
      ALLOW_DATA_ATTR: false,
    })
    // Post-process: strip any iframes with non-allowlisted src
    return purified.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (match) => {
      const srcMatch = /\bsrc=["']([^"']*?)["']/i.exec(match)
      if (!srcMatch) return ''
      const src = srcMatch[1]
      return ALLOWED_EMBED_ORIGINS.some((origin) => src.startsWith(origin)) ? match : ''
    })
  } catch {
    return ''
  }
}
