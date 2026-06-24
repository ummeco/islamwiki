import type { APIRoute } from 'astro'
import { getDailyHadith } from '@/lib/data/daily'

export const prerender = false

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(getDailyHadith()), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
