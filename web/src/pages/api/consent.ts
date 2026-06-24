// FILE: src/pages/api/consent.ts
// PURPOSE: GET/POST/DELETE /api/consent — records ALL consent grants/withdrawals into
//   lg_consent_record (insert-only, GDPR Art 7) via the shared @ummat/consent handler.
//   Astro port of app/api/consent/route.ts.
// SECURITY: HASURA_GRAPHQL_ADMIN_SECRET is read server-side only and passed to the handler;
//   it is never returned to the client. userId is derived from the verified Bearer JWT.
import type { APIRoute } from 'astro'
import { handleConsentRequest, type ConsentHandlerInput } from '@ummat/consent/server'

const DOMAIN = 'islam.wiki'

const HASURA_ENDPOINT =
  import.meta.env.HASURA_ADMIN_URL ??
  import.meta.env.NEXT_PUBLIC_HASURA_URL ??
  'https://api.ummat.dev/v1/graphql'
const HASURA_ADMIN_SECRET = import.meta.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

function userIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    const token = authHeader.slice(7)
    const payload = token.split('.')[1]
    if (!payload) return null
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')) as {
      sub?: string
      'https://hasura.io/jwt/claims'?: { 'x-hasura-user-id'?: string }
    }
    const hasuraUid = decoded['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
    return hasuraUid ?? decoded.sub ?? null
  } catch {
    return null
  }
}

async function buildInput(
  req: Request,
  method: ConsentHandlerInput['method']
): Promise<ConsentHandlerInput> {
  const userId = userIdFromJwt(req.headers.get('authorization'))
  const countryCode = req.headers.get('cf-ipcountry') ?? null
  let body: unknown = undefined
  if (method === 'POST') {
    try {
      body = await req.json()
    } catch {
      body = null
    }
  }
  return {
    method,
    headers: req.headers,
    body,
    userId,
    countryCode,
    domain: DOMAIN,
    hasura: { endpoint: HASURA_ENDPOINT, adminSecret: HASURA_ADMIN_SECRET },
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function dispatch(req: Request, method: ConsentHandlerInput['method']): Promise<Response> {
  if (!HASURA_ADMIN_SECRET) {
    return json(
      { error: 'misconfigured: HASURA_GRAPHQL_ADMIN_SECRET missing', code: 'CONFIG' },
      500
    )
  }
  const input = await buildInput(req, method)
  const result = await handleConsentRequest(input)
  return json(result.body, result.status)
}

export const prerender = false

export const POST: APIRoute = ({ request }) => dispatch(request, 'POST')
export const GET: APIRoute = ({ request }) => dispatch(request, 'GET')
export const DELETE: APIRoute = ({ request }) => dispatch(request, 'DELETE')
