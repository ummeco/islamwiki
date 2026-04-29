/**
 * Content-type allowlist for the revisions API endpoint.
 *
 * Validates the `contentType` field supplied by clients before it is written to
 * `iw_wiki_revisions`.  Accepting arbitrary strings without validation exposes
 * the endpoint to MIME-type injection: an attacker could store a value such as
 * `text/html; charset=utf-8` with an embedded script payload that a downstream
 * renderer might interpret unsafely (stored-XSS / polyglot attack).
 *
 * The set here is deliberately narrow. Any new content type must be explicitly
 * added by a maintainer — never derived from user input.
 *
 * Security: S9-01 (HIGH — CVE-internal)
 */

export const ALLOWED_CONTENT_TYPES = [
  'text/markdown',
  'text/plain',
  'text/html',         // must be sanitized server-side before storage / rendering
  'application/json',
] as const

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number]

/**
 * Validates that `value` is one of the explicitly allowed content types.
 *
 * Throws a descriptive `Error` on any rejection.  Callers are responsible for
 * converting the error to an appropriate HTTP response (400) — the error
 * message itself is safe to surface to the client (no sensitive data leaked).
 *
 * NOTE: The rejected *value* is intentionally not included in the error message
 * to prevent log-injection attacks via crafted contentType strings.
 */
export function validateContentType(value: unknown): AllowedContentType {
  if (typeof value !== 'string') {
    throw new Error('contentType must be a string')
  }
  if (!(ALLOWED_CONTENT_TYPES as readonly string[]).includes(value)) {
    throw new Error('contentType is not in the allowed list')
  }
  return value as AllowedContentType
}
