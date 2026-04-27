import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser, type SessionData } from '@/lib/auth'

/**
 * Admin guard for islamwiki API route handlers.
 *
 * Enforces that the caller is authenticated and holds the `iw_admin` role
 * (trust level >= 4: admin or owner). The Hasura JWT claims are already
 * verified by middleware.ts — this function re-reads the session cookie
 * and validates server-side to ensure API routes cannot be called directly
 * without passing through authentication.
 *
 * Usage in a route handler:
 *   const guard = await requireAdmin(request)
 *   if (guard.error) return guard.error
 *   const { session } = guard
 *
 * Roles accepted: 'admin' (trustLevel 4), 'owner' (trustLevel 5).
 * All other roles receive a 403 Forbidden response.
 */

/** Discriminated union returned by requireAdmin. */
export type AdminGuardResult =
  | { ok: true; error: null; session: SessionData }
  | { ok: false; error: NextResponse; session: null }

/**
 * Require the caller to have admin-level access (trust level >= 4).
 * Returns the session on success, or a ready-to-return error Response on failure.
 */
export async function requireAdmin(_request?: NextRequest): Promise<AdminGuardResult> {
  const session = await getSessionUser()

  if (!session || !session.isLoggedIn) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  if (session.trustLevel < 4) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Forbidden: iw_admin role required' }, { status: 403 }),
      session: null,
    }
  }

  return { ok: true, error: null, session }
}

/**
 * Require the caller to be the owner (trust level 5).
 * Use for operations that only the site owner should perform.
 */
export async function requireOwner(_request?: NextRequest): Promise<AdminGuardResult> {
  const session = await getSessionUser()

  if (!session || !session.isLoggedIn) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  if (session.trustLevel < 5) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Forbidden: owner role required' }, { status: 403 }),
      session: null,
    }
  }

  return { ok: true, error: null, session }
}

/**
 * Require the caller to have moderator-level access or higher (trust level >= 3).
 */
export async function requireModerator(_request?: NextRequest): Promise<AdminGuardResult> {
  const session = await getSessionUser()

  if (!session || !session.isLoggedIn) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  if (session.trustLevel < 3) {
    return {
      ok: false,
      error: NextResponse.json({ error: 'Forbidden: moderator role required' }, { status: 403 }),
      session: null,
    }
  }

  return { ok: true, error: null, session }
}
