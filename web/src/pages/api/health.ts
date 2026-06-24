import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
