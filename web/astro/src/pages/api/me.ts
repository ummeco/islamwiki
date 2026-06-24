/**
 * FILE: pages/api/me.ts
 * PURPOSE: Session introspection endpoint for the islamwiki editor SPA.
 *   The editor zone (editor.islam.wiki) passes /api/me requests to this read zone
 *   via Vercel multi-zone rewrite. Validates the httpOnly JWT cookie issued by
 *   auth.ummat.dev via JWKS signature verification and returns the caller's role.
 * INPUTS: GET request with islamwiki_session httpOnly cookie (JWT from auth.ummat.dev)
 * OUTPUTS: 200 { role: string } | 401 {} | 500 {}
 * CONSTRAINTS:
 *   - Never read JWT from Authorization header — httpOnly cookie only (D-P2-AUTH-TRANSPORT).
 *   - Never return raw JWT or claims — role string only.
 *   - CORS: restrict to editor.islam.wiki origin (cross-zone call).
 *   - JWT signature verified via JWKS from auth.ummat.dev — no shared secret needed.
 * REF: P2-E3-W02-S02-T01 · spec §4.2 · D-P2-AUTH-TRANSPORT
 */

import type { APIRoute } from 'astro';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ALLOWED_ORIGIN = 'https://editor.islam.wiki';
const AUTH_URL = import.meta.env.PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev';
const HASURA_CLAIMS_NS = 'https://hasura.io/jwt/claims' as const;

// Lazy singleton — fetched and cached on first use, module-scoped.
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(new URL(`${AUTH_URL}/.well-known/jwks.json`));
  }
  return _jwks;
}

/** Extract a named cookie value from a raw Cookie header string. */
function extractCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k?.trim() === name && v) return decodeURIComponent(v.trim());
  }
  return null;
}

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Credentials': 'true',
  Vary: 'Origin',
};

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = extractCookie(cookieHeader, 'islamwiki_session');

  if (!token) {
    return new Response(JSON.stringify({}), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Cryptographic signature verification + expiry check via JWKS (D-P2-AUTH-TRANSPORT).
    const { payload } = await jwtVerify(token, getJwks());
    const hasuraClaims = (payload as Record<string, unknown>)[HASURA_CLAIMS_NS] as
      | { 'x-hasura-default-role': string }
      | undefined;

    const role = hasuraClaims?.['x-hasura-default-role'] ?? 'contributor';

    return new Response(JSON.stringify({ role }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    // JWT invalid (expired, wrong sig, malformed) → treat as unauthenticated
    const isJwtError =
      err instanceof Error &&
      (err.message.includes('expired') ||
        err.message.includes('invalid') ||
        err.message.includes('JWT'));
    if (isJwtError) {
      return new Response(JSON.stringify({}), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }
    console.error('[/api/me] JWT verification error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
};

// Support CORS preflight via OPTIONS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  });
};
