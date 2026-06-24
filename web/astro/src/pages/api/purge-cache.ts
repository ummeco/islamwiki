/**
 * FILE: pages/api/purge-cache.ts
 * PURPOSE: Server-side API endpoint for purging Vercel CDN cache after article publish.
 *   VERCEL_TOKEN must stay server-side — this endpoint proxies the Vercel purge API.
 *   Called by the editor SPA after ApproveRevision mutation.
 * INPUTS: POST body { paths: string[] }
 * OUTPUTS: 200 OK on success, 500 on failure
 * CONSTRAINTS:
 *   - VERCEL_TOKEN must NEVER be client-exposed.
 *   - Only accepts requests with a valid JWT session cookie from auth.ummat.dev.
 *     JWT signature verified via JWKS — no shared secret (D-P2-AUTH-TRANSPORT).
 *   - paths must be /wiki/ or /ar/wiki/ prefixed (prevent abuse).
 *   - Minimum role: moderator to trigger a purge.
 * REF: P2-E3-W02-S02-T01 · spec §5.2 · D-P2-AUTH-TRANSPORT
 */

import type { APIRoute } from 'astro';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTH_URL = import.meta.env.PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev';
const HASURA_CLAIMS_NS = 'https://hasura.io/jwt/claims' as const;

const ALLOWED_PATH_PREFIXES = ['/wiki/', '/ar/wiki/', '/search'];

const ROLE_LEVEL: Record<string, number> = {
  contributor: 1,
  moderator: 2,
  admin: 3,
  owner: 4,
};

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

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Auth check — verify JWT from httpOnly cookie, require at least moderator role.
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = extractCookie(cookieHeader, 'islamwiki_session');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let role: string;
  try {
    // Cryptographic signature verification + expiry via JWKS (D-P2-AUTH-TRANSPORT).
    const { payload } = await jwtVerify(token, getJwks());
    const hasuraClaims = (payload as Record<string, unknown>)[HASURA_CLAIMS_NS] as
      | { 'x-hasura-default-role': string }
      | undefined;
    role = hasuraClaims?.['x-hasura-default-role'] ?? 'contributor';
  } catch (err) {
    const isJwtError =
      err instanceof Error &&
      (err.message.includes('expired') ||
        err.message.includes('invalid') ||
        err.message.includes('JWT'));
    if (isJwtError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('[/api/purge-cache] JWT verification error:', err);
    return new Response(JSON.stringify({ error: 'Auth check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if ((ROLE_LEVEL[role] ?? 0) < 2) {
    return new Response(JSON.stringify({ error: 'Forbidden — moderator role required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate content type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Expected application/json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse body
  let paths: string[];
  try {
    const body = await request.json() as { paths?: unknown };
    if (!Array.isArray(body.paths)) {
      return new Response(JSON.stringify({ error: 'paths must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    paths = body.paths as string[];
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate paths — prevent arbitrary path purging
  const invalidPaths = paths.filter(
    (p) => !ALLOWED_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))
  );
  if (invalidPaths.length > 0) {
    return new Response(
      JSON.stringify({ error: `Invalid paths: ${invalidPaths.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const vercelToken = import.meta.env.VERCEL_TOKEN;
  if (!vercelToken) {
    console.warn('VERCEL_TOKEN not set — cache purge skipped');
    return new Response(JSON.stringify({ skipped: true, reason: 'VERCEL_TOKEN not set' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const purgeRes = await fetch('https://api.vercel.com/v1/deployments/purge-cache', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths }),
    });

    if (!purgeRes.ok) {
      const errText = await purgeRes.text();
      console.error('Vercel purge failed:', purgeRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Vercel purge failed', status: purgeRes.status }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, paths }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Purge cache error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
