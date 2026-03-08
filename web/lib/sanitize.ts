import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML for safe rendering via dangerouslySetInnerHTML.
 * Allows standard content tags but strips scripts, event handlers, etc.
 */
export function sanitizeHtml(dirty: string): string {
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
}

/**
 * Sanitize HTML for embed codes (iframes allowed for video embeds).
 * More permissive — use only for trusted embed sources.
 */
export function sanitizeEmbed(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
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
}
