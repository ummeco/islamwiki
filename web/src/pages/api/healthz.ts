// Was a Next.js edge runtime route; Astro/Vercel adapter runs this as a
// standard Node serverless function (edge runtime not used).
import type { APIRoute } from 'astro'

export const prerender = false

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
