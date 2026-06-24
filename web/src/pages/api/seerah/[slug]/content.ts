// GET /api/seerah/[slug]/content — returns long-form seerah/history content
// for a known event slug. Read-only, public. Data sourced from framework-
// independent lib readers (no DB). The Next.js version declared
// generateStaticParams to pre-render this API route; under Astro this is a
// plain SSR endpoint, so static-params generation is dropped (pages, not the
// API, own getStaticPaths).
import type { APIRoute } from 'astro'
import { getSeerahContent } from '@/lib/data/seerah-content'
import { getSeerahEventBySlug } from '@/lib/data/seerah'
import { getAllHistoryEvents } from '@/lib/data/history'

export const prerender = false

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? ''

  // Validate slug exists in seerah or history events
  const seerahEvent = getSeerahEventBySlug(slug)
  const historyEvents = getAllHistoryEvents()
  const historyEvent = historyEvents.find((e) => e.slug === slug)

  if (!seerahEvent && !historyEvent) {
    return jsonResponse({ error: 'Not found' }, 404)
  }

  const content = getSeerahContent(slug)
  if (!content) {
    return jsonResponse({ content: null }, 200)
  }

  return jsonResponse({ content }, 200, {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
  })
}
