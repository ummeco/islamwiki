import 'server-only'

import { getSessionUser, type CookieReader, type SessionData } from '@/lib/auth'

/**
 * Admin guard for islamwiki API route handlers.
 *
 * Enforces that the caller is authenticated and holds the `iw_admin` role
 * (trust level >= 4: admin or owner). The Hasura JWT claims are already
 * verified by middleware.ts — this function re-reads the session cookie
 * and validates server-side to ensure API routes cannot be called directly
 * without passing through authentication.
 *
 * Framework-agnostic: pass the request cookies from the Astro context
 * (`context.cookies` in API routes, `Astro.cookies` in pages). The error
 * branch returns a plain web `Response` ready to return from the handler.
 *
 * Usage in an Astro API route handler:
 *   const guard = await requireAdmin(context.cookies)
 *   if (guard.error) return guard.error
 *   const { session } = guard
 *
 * Roles accepted: 'admin' (trustLevel 4), 'owner' (trustLevel 5).
 * All other roles receive a 403 Forbidden response.
 */

/** Discriminated union returned by requireAdmin. */
export type AdminGuardResult =
  | { ok: true; error: null; session: SessionData }
  | { ok: false; error: Response; session: null }

/** Build a JSON error Response (replaces NextResponse.json). */
function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * Require the caller to have admin-level access (trust level >= 4).
 * Returns the session on success, or a ready-to-return error Response on failure.
 */
export async function requireAdmin(cookies: CookieReader): Promise<AdminGuardResult> {
  const session = await getSessionUser(cookies)

  if (!session || !session.isLoggedIn) {
    return { ok: false, error: jsonError('Unauthorized', 401), session: null }
  }

  if (session.trustLevel < 4) {
    return { ok: false, error: jsonError('Forbidden: iw_admin role required', 403), session: null }
  }

  return { ok: true, error: null, session }
}

/**
 * Require the caller to be the owner (trust level 5).
 * Use for operations that only the site owner should perform.
 */
export async function requireOwner(cookies: CookieReader): Promise<AdminGuardResult> {
  const session = await getSessionUser(cookies)

  if (!session || !session.isLoggedIn) {
    return { ok: false, error: jsonError('Unauthorized', 401), session: null }
  }

  if (session.trustLevel < 5) {
    return { ok: false, error: jsonError('Forbidden: owner role required', 403), session: null }
  }

  return { ok: true, error: null, session }
}

/**
 * Require the caller to have moderator-level access or higher (trust level >= 3).
 */
export async function requireModerator(cookies: CookieReader): Promise<AdminGuardResult> {
  const session = await getSessionUser(cookies)

  if (!session || !session.isLoggedIn) {
    return { ok: false, error: jsonError('Unauthorized', 401), session: null }
  }

  if (session.trustLevel < 3) {
    return { ok: false, error: jsonError('Forbidden: moderator role required', 403), session: null }
  }

  return { ok: true, error: null, session }
}
