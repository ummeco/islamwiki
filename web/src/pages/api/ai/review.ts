// FILE: src/pages/api/ai/review.ts
// PURPOSE: POST /api/ai/review — trigger a manual AI content review (Moderator trust>=3),
//   rate-limited 5 requests / 15 min per IP. Astro port of app/api/ai/review/route.ts.
// SECURITY: rate-limited per IP (5/15min); auth required; trustLevel>=3 gate; reviewContent
//   runs server-side (Anthropic key never exposed to the client).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { reviewContent } from '@/lib/ai/review'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // Rate limit: 5 AI review requests per 15 minutes per IP
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`ai-review:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) {
    return json(
      { error: 'Too many requests. Please try again later.' },
      429,
      { 'Retry-After': String(rl.retryAfterSeconds) }
    )
  }

  const user = await getSessionUserFromCookies(cookies)
  if (!user) {
    return json({ error: 'Not authenticated.' }, 401)
  }

  // Only moderators and above can trigger manual AI reviews
  if (user.trustLevel < 3) {
    return json({ error: 'Insufficient permissions.' }, 403)
  }

  try {
    const body = await request.json()
    const { title, content, contentType } = body

    if (!title || !content || !contentType) {
      return json(
        { error: 'Missing required fields: title, content, contentType.' },
        400
      )
    }

    const result = await reviewContent(title, content, contentType)
    return json(result)
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error.' },
      500
    )
  }
}
