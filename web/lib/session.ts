// FILE: lib/session.ts
// PURPOSE: Astro-compatible session resolver. Bridges Astro's cookie API to the
//   framework-independent JWT verification in lib/auth.ts (decodeToken), replacing
//   the Next.js getSessionUser() which relied on next/headers cookies().
//
// SECURITY (preserved exactly):
//   - The access token is read from the httpOnly `iw_at` cookie only.
//   - decodeToken() cryptographically verifies the JWT signature + expiry via JWKS
//     (createRemoteJWKSet against auth.ummat.dev). Unsigned/forged claims are rejected.
//   - Returns the SAME SessionData shape (userId/username/email/role/trustLevel) used by
//     every ported API route, so all auth/trust gates remain byte-for-byte equivalent.
// REF: ports getSessionUser() for Astro · P2 islamwiki Next→Astro migration

import type { AstroCookies } from 'astro'
import { decodeToken, type SessionData } from '@/lib/auth'

/**
 * Resolve the authenticated session user from Astro request cookies.
 * Mirrors lib/auth.ts getSessionUser(): returns null when no valid token.
 *
 * @param cookies - context.cookies / Astro.cookies (server-only)
 * @returns verified SessionData, or null when unauthenticated / token invalid
 */
export async function getSessionUserFromCookies(
  cookies: AstroCookies
): Promise<SessionData | null> {
  const token = cookies.get('iw_at')?.value
  if (!token) return null
  const user = await decodeToken(token)
  if (!user || !user.isLoggedIn) return null
  return user
}
