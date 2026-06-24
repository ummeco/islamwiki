/**
 * render-markdown.ts — server-side markdown → sanitized HTML for Astro content pages.
 *
 * PURPOSE: Bridges the framework-independent markdown renderer (lib/render-content.tsx,
 *   which returns React nodes) into Astro's `set:html` rendering path while preserving the
 *   security boundary. Wiki/seerah/history markdown is community-editable, so every render
 *   MUST pass through lib/sanitize.ts sanitizeHtml() before it reaches the DOM.
 * INPUTS:  content — raw markdown string from lib/data/** readers.
 * OUTPUTS: sanitized HTML string safe to inject via Astro `set:html`.
 * CONSTRAINTS:
 *   - Server-only (uses react-dom/server). Never import into a client island.
 *   - REUSES lib/render-content.renderContent VERBATIM (no markdown logic duplicated here).
 *   - Output ALWAYS passes through sanitizeHtml() — this is the XSS release gate. Do not
 *     bypass or set:html the raw renderContent output directly.
 * REF: P2 islam.wiki Astro migration · people-history group · ports the inline
 *   `<div className="prose"> {renderContent(...)} </div>` blocks from the Next pages.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderContent } from '@/lib/render-content'
import { sanitizeHtml } from '@/lib/sanitize'

/**
 * Render markdown to a sanitized HTML string.
 * @param content raw markdown (already resolved for locale by the caller)
 * @returns sanitized HTML; empty string when content is null/empty
 */
export function renderMarkdownSafe(content: string | null | undefined): string {
  if (!content) return ''
  const nodes = renderContent(content)
  const html = renderToStaticMarkup(createElement('div', null, ...nodes))
  // Strip the wrapper <div> so the page controls the prose container, then sanitize.
  const inner = html.replace(/^<div>/, '').replace(/<\/div>$/, '')
  return sanitizeHtml(inner)
}
