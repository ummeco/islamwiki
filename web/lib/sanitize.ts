// isomorphic-dompurify alignment note (T1-8-4):
// SSR uses JSDOM; browser uses native DOM. Both must agree on parser behavior.
// NEVER downgrade isomorphic-dompurify without running the full sanitize test
// suite (tests/unit/sanitize.test.ts) against BOTH server and client outputs.
// Bump in lockstep only — test server + client outputs match after every upgrade.
import DOMPurify from 'isomorphic-dompurify'

/**
 * Strip data: URIs from src and href attributes post-DOMPurify.
 * DOMPurify in JSDOM mode allows data: URIs on <img src> by default when img
 * is in ALLOWED_TAGS. This post-processor removes them unconditionally.
 * Regex targets: src="data:..." and href="data:..." (case-insensitive).
 */
function stripDataUris(html: string): string {
  // Replace data: URIs in src and href attributes with the empty string
  return html.replace(/\b(src|href)=["']data:[^"']*["']/gi, '$1=""')
}

/**
 * Sanitize HTML for safe rendering via dangerouslySetInnerHTML.
 * Allows standard content tags but strips scripts, event handlers, etc.
 *
 * Hardening notes (T1-8-20):
 * - FORCE_BODY: true  — normalises both JSDOM (SSR) and browser DOMPurify to a
 *   <body> fragment context, preventing parser-differential XSS payloads that
 *   survive the server pass and execute client-side.
 * - WHOLE_DOCUMENT: false — blocks <html>/<head>/<body> injection in JSDOM mode.
 * - RETURN_DOM_FRAGMENT: false — ensures string output; prevents JSDOM fragment-
 *   context escapes that occur when callers receive a DocumentFragment.
 * - stripDataUris() post-processor — JSDOM allows data: URIs on img[src];
 *   this removes them unconditionally after DOMPurify runs.
 */
export function sanitizeHtml(dirty: string): string {
  try {
    const purified = DOMPurify.sanitize(dirty, {
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
      // JSDOM / SSR hardening — must not be removed without updating tests
      FORCE_BODY: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM_FRAGMENT: false,
    }) as string
    return stripDataUris(purified)
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
 *
 * Hardening notes (T1-8-20):
 * - Same FORCE_BODY / WHOLE_DOCUMENT / RETURN_DOM_FRAGMENT hardening as
 *   sanitizeHtml to prevent JSDOM parser-differential bypasses.
 * - Post-processing allowlist regex is evaluated AFTER DOMPurify strips event
 *   handlers, ensuring JSDOM src-attribute encoding mutations don't bypass the
 *   origin check (JSDOM normalises percent-encoding; startsWith still matches).
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
      // JSDOM / SSR hardening
      FORCE_BODY: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM_FRAGMENT: false,
    }) as string
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
