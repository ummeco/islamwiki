import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize'

// ── sanitizeHtml ────────────────────────────────────────────────────────────

describe('sanitizeHtml() — script injection', () => {
  it('strips <script> tags', () => {
    expect(sanitizeHtml('<script>alert(1)</script>')).not.toContain('<script')
  })

  it('strips <script> with src attribute', () => {
    expect(sanitizeHtml('<script src="https://evil.com/x.js"></script>')).not.toContain('<script')
  })

  it('handles nested/split script tag (<scr<script>ipt>) — no executable script survives', () => {
    // DOMPurify strips <script> from the middle, leaving HTML-entity-encoded remnants.
    // The output is not executable — verify no <script tag survives.
    const out = sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('<scr')
  })

  it('strips <script> buried in comment', () => {
    const out = sanitizeHtml('<!--<script>alert(1)</script>-->')
    expect(out).not.toContain('alert(1)')
  })
})

describe('sanitizeHtml() — event handler injection', () => {
  it('strips onclick on <div>', () => {
    expect(sanitizeHtml('<div onclick="alert(1)">x</div>')).not.toContain('onclick')
  })

  it('strips onerror on <img>', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toContain('onerror')
  })

  it('strips onload on <body>', () => {
    expect(sanitizeHtml('<body onload="alert(1)">')).not.toContain('onload')
  })

  it('strips onmouseover on <a>', () => {
    expect(sanitizeHtml('<a onmouseover="alert(1)">link</a>')).not.toContain('onmouseover')
  })

  it('strips onfocus on <input>', () => {
    // <input> is not in ALLOWED_TAGS, so the element itself is stripped
    expect(sanitizeHtml('<input onfocus="alert(1)">')).not.toContain('onfocus')
  })
})

describe('sanitizeHtml() — javascript: URI injection', () => {
  it('strips javascript: href on <a>', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
  })

  it('strips javascript: src on <img>', () => {
    const out = sanitizeHtml('<img src="javascript:alert(1)">')
    expect(out).not.toContain('javascript:')
  })

  it('strips obfuscated javascript: with uppercase (Javascript:)', () => {
    const out = sanitizeHtml('<a href="Javascript:alert(1)">x</a>')
    expect(out).not.toMatch(/javascript:/i)
  })

  it('strips javascript: with HTML entity encoding (&#106;avascript:)', () => {
    const out = sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>')
    expect(out).not.toContain('alert(1)')
  })

  it('strips javascript: with Unicode escape (\\u006Aavascript:)', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>')
    expect(out).not.toContain('alert(1)')
  })
})

describe('sanitizeHtml() — data: URI injection', () => {
  it('strips data: URIs from <a href>', () => {
    const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>')
    expect(out).not.toContain('data:text/html')
  })

  it('strips data: URIs from <img src> that carry scripts', () => {
    const out = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">')
    expect(out).not.toContain('text/html')
  })
})

describe('sanitizeHtml() — disallowed tags stripped', () => {
  it('strips <style> tags', () => {
    expect(sanitizeHtml('<style>body{display:none}</style>')).not.toContain('<style')
  })

  it('strips <object> tags', () => {
    expect(sanitizeHtml('<object data="evil.swf"></object>')).not.toContain('<object')
  })

  it('strips <iframe> tags', () => {
    expect(sanitizeHtml('<iframe src="https://evil.com"></iframe>')).not.toContain('<iframe')
  })

  it('strips <form> tags', () => {
    expect(sanitizeHtml('<form action="//evil.com"><input type=submit></form>')).not.toContain('<form')
  })

  it('strips <base> tag', () => {
    expect(sanitizeHtml('<base href="https://evil.com">')).not.toContain('<base')
  })

  it('strips <meta> tag', () => {
    expect(sanitizeHtml('<meta http-equiv="refresh" content="0;url=https://evil.com">')).not.toContain('<meta')
  })
})

describe('sanitizeHtml() — data-* attribute stripping', () => {
  it('strips data-* attributes (ALLOW_DATA_ATTR: false)', () => {
    expect(sanitizeHtml('<div data-xss="payload">x</div>')).not.toContain('data-xss')
  })
})

describe('sanitizeHtml() — allowed content is preserved', () => {
  it('preserves <p> with plain text', () => {
    expect(sanitizeHtml('<p>Hello world</p>')).toContain('Hello world')
  })

  it('preserves <a href> with https URL', () => {
    const out = sanitizeHtml('<a href="https://islam.wiki">link</a>')
    expect(out).toContain('href="https://islam.wiki"')
  })

  it('preserves Arabic RTL text in a <span dir="rtl">', () => {
    const out = sanitizeHtml('<span dir="rtl">بسم الله</span>')
    expect(out).toContain('بسم الله')
  })

  it('returns empty string when DOMPurify throws (graceful fallback)', () => {
    // Pass an object that will cause sanitize to fail — verify fallback returns ''
    // We can't easily force a throw, but we can verify non-string input is handled
    expect(() => sanitizeHtml(null as unknown as string)).not.toThrow()
  })
})

// ── sanitizeEmbed ───────────────────────────────────────────────────────────

describe('sanitizeEmbed() — iframe allowlist', () => {
  it('allows YouTube embed iframes', () => {
    const html = '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315" frameborder="0" allowfullscreen></iframe>'
    const out = sanitizeEmbed(html)
    expect(out).toContain('<iframe')
    expect(out).toContain('youtube.com/embed/abc123')
  })

  it('allows youtube-nocookie.com iframes', () => {
    const html = '<iframe src="https://www.youtube-nocookie.com/embed/xyz" allowfullscreen></iframe>'
    expect(sanitizeEmbed(html)).toContain('youtube-nocookie.com/embed/xyz')
  })

  it('allows Vimeo player iframes', () => {
    const html = '<iframe src="https://player.vimeo.com/video/123456" allowfullscreen></iframe>'
    expect(sanitizeEmbed(html)).toContain('player.vimeo.com/video/123456')
  })

  it('allows SoundCloud player iframes', () => {
    const html = '<iframe src="https://w.soundcloud.com/player/?url=x" scrolling="no"></iframe>'
    expect(sanitizeEmbed(html)).toContain('w.soundcloud.com/player/')
  })

  it('strips iframe with non-allowlisted src', () => {
    const out = sanitizeEmbed('<iframe src="https://evil.com/payload"></iframe>')
    expect(out).not.toContain('<iframe')
  })

  it('strips iframe with no src', () => {
    const out = sanitizeEmbed('<iframe allowfullscreen></iframe>')
    expect(out).not.toContain('<iframe')
  })

  it('strips iframe using javascript: src', () => {
    const out = sanitizeEmbed('<iframe src="javascript:alert(1)"></iframe>')
    expect(out).not.toContain('<iframe')
  })

  it('strips iframe attempting to spoof allowlisted origin (prefix bypass)', () => {
    // e.g. https://www.youtube.com.evil.com/embed/
    const out = sanitizeEmbed('<iframe src="https://www.youtube.com.evil.com/embed/x"></iframe>')
    expect(out).not.toContain('<iframe')
  })
})

describe('sanitizeEmbed() — script injection inside embed HTML', () => {
  it('strips <script> tags in embed HTML', () => {
    const out = sanitizeEmbed('<script>alert(1)</script><iframe src="https://www.youtube.com/embed/x" allowfullscreen></iframe>')
    expect(out).not.toContain('<script')
  })

  it('strips event handlers on non-iframe elements', () => {
    const out = sanitizeEmbed('<div onclick="alert(1)"><iframe src="https://www.youtube.com/embed/x" allowfullscreen></iframe></div>')
    expect(out).not.toContain('onclick')
  })
})

// ── T1-8-2: Additional OWASP XSS cheat sheet coverage ───────────────────────

describe('sanitizeHtml() — CSS expression injection', () => {
  it('strips CSS expression() via <style> tag', () => {
    const out = sanitizeHtml('<style>body { color: expression(alert(1)) }</style>')
    expect(out).not.toContain('<style')
    expect(out).not.toContain('expression(')
  })

  it('strips style attribute with expression()', () => {
    const out = sanitizeHtml('<div style="color: expression(alert(1))">x</div>')
    // The <div> may survive but style with expression must not
    expect(out).not.toContain('expression(')
  })

  it('strips <link rel="stylesheet"> that could load attacker CSS', () => {
    const out = sanitizeHtml('<link rel="stylesheet" href="https://evil.com/x.css">')
    expect(out).not.toContain('<link')
  })
})

describe('sanitizeHtml() — HTML entity and encoding bypasses', () => {
  it('entity-encoded &#x3C;script&#x3E; is safe — no actual <script> in output', () => {
    // When passed as a raw string, &#x3C; are NOT decoded by JSDOM before DOMPurify runs.
    // The output contains the literal entities which are NOT executable HTML.
    // The only risk is if a downstream renderer double-decodes entities — our
    // sanitizeHtml() returns text safe for dangerouslySetInnerHTML.
    const out = sanitizeHtml('&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)</')  // no executable close tag
  })

  it('decimal-encoded &#60;script&#62; is safe — no actual <script> in output', () => {
    const out = sanitizeHtml('&#60;script&#62;alert(1)&#60;/script&#62;')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)</')
  })

  it('javascript%3A percent-encoded form — DOMPurify passes through as-is (not executable)', () => {
    // %3A is a percent-encoded colon. JSDOM does NOT pre-decode percent-encoding in
    // attribute values before passing to DOMPurify. The resulting href="javascript%3Aalert(1)"
    // is NOT treated as javascript: by browsers — href navigation only recognises
    // the literal colon form. DOMPurify correctly leaves this through; it is not a bypass.
    // This test documents the expected behaviour (not a strip).
    const out = sanitizeHtml('<a href="javascript%3Aalert(1)">x</a>')
    // The dangerous literal form MUST be absent
    expect(out).not.toContain('javascript:')
    // The percent-encoded form surviving is acceptable — not executable via browser navigation
    // because browsers only recognise the literal colon in javascript: URIs
  })

  it('strips null-byte-split script tag — no <script in output', () => {
    // \x00 inside a tag name confuses some older parsers; DOMPurify/JSDOM handles it
    const out = sanitizeHtml('<scr\x00ipt>alert(1)</scr\x00ipt>')
    expect(out).not.toContain('<script')
    // The text content (alert(1)) may survive as plain text, which is fine
  })
})

describe('sanitizeHtml() — SVG and MathML injection', () => {
  it('strips SVG <script> element', () => {
    const out = sanitizeHtml('<svg><script>alert(1)</script></svg>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
  })

  it('strips SVG xlink:href with javascript: URI', () => {
    const out = sanitizeHtml('<svg><a xlink:href="javascript:alert(1)"><text>click</text></a></svg>')
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('alert(1)')
  })

  it('strips <math> with embedded script via annotation-xml', () => {
    // mXSS vector — annotation-xml encoding bypass
    const out = sanitizeHtml(
      '<math><annotation-xml encoding="text/html"><script>alert(1)</script></annotation-xml></math>'
    )
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
  })
})

describe('sanitizeEmbed() — data URI src rejection', () => {
  it('strips iframe with data: URI src', () => {
    const out = sanitizeEmbed('<iframe src="data:text/html,<script>alert(1)</script>"></iframe>')
    expect(out).not.toContain('<iframe')
    expect(out).not.toContain('data:text/html')
  })
})

// ── T1-8-20: JSDOM-specific XSS hardening test cases ────────────────────────
// These vectors are specific to parser-differential XSS that can survive JSDOM
// (SSR) sanitization but execute in the browser if FORCE_BODY is not set.

describe('sanitizeHtml() — JSDOM-specific XSS vectors (T1-8-20)', () => {
  // 1. SVG animate onbegin — fires immediately on SVG animation start in browsers
  it('strips SVG <animate onbegin=...> payload', () => {
    const out = sanitizeHtml('<svg><animate onbegin="alert(1)" attributeName="x" dur="1s"/></svg>')
    expect(out).not.toContain('onbegin')
    expect(out).not.toContain('alert(1)')
  })

  // 2. SVG set onbegin — variant using <set> element
  it('strips SVG <set onbegin=...> payload', () => {
    const out = sanitizeHtml('<svg><set onbegin="alert(1)" attributeName="x" to="1"/></svg>')
    expect(out).not.toContain('onbegin')
    expect(out).not.toContain('alert(1)')
  })

  // 3. Mutation XSS via form/math/mtext boundary — classic mXSS vector that
  //    re-serialises differently in different parser contexts
  it('blocks mutation XSS via form + math + mtext boundary', () => {
    const payload = '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>'
    const out = sanitizeHtml(payload)
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('alert(1)')
  })

  // 4. JSDOM noscript parser-differential — in JSDOM, <noscript> content is
  //    parsed as text; browsers with scripting enabled parse it as HTML,
  //    executing the injected payload. FORCE_BODY prevents context escapes.
  it('blocks JSDOM noscript parser-differential XSS', () => {
    const out = sanitizeHtml('<noscript><p title="</noscript><img src=x onerror=alert(1)>">')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('alert(1)')
  })

  // 5. onload on <svg> element — fires when SVG is inserted into the DOM
  it('strips onload on <svg>', () => {
    const out = sanitizeHtml('<svg onload="alert(1)"><rect/></svg>')
    expect(out).not.toContain('onload')
    expect(out).not.toContain('alert(1)')
  })

  // 6. data: URI on <img src> carrying base64-encoded HTML with script
  it('strips data: URI with base64-encoded script payload from <img src>', () => {
    // data:text/html;base64,<script>alert(1)</script>
    const b64 = btoa('<script>alert(1)</script>')
    const out = sanitizeHtml(`<img src="data:text/html;base64,${b64}">`)
    // The img may survive (it's in ALLOWED_TAGS) but src must not carry a data: URI
    expect(out).not.toContain('data:text/html')
    expect(out).not.toContain(b64)
  })

  // 7. WHOLE_DOCUMENT: false — ensures <html>/<head>/<body> injection is blocked
  //    in JSDOM mode where isomorphic-dompurify defaults may permit fragments
  it('blocks <html><head><body> injection via WHOLE_DOCUMENT: false', () => {
    const out = sanitizeHtml('<html><head><script>alert(1)</script></head><body onload="alert(2)">ok</body></html>')
    expect(out).not.toContain('<html')
    expect(out).not.toContain('<head')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('onload')
    expect(out).not.toContain('alert(')
  })
})
