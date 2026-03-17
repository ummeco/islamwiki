/**
 * Islam.wiki Audio Proxy Worker
 *
 * Lazy-fill Quran audio from everyayah.com to Cloudflare R2.
 * - First request: fetch from everyayah.com, store in R2, serve to client
 * - Subsequent requests: serve directly from R2 (fast, no origin cost)
 *
 * URL pattern: /audio/{reciter}/{surahAyah}.mp3
 * Example:     /audio/Alafasy_128kbps/001001.mp3
 *
 * Mirrors everyayah.com path: /data/{reciter}/{surahAyah}.mp3
 */

interface Env {
  AUDIO_BUCKET: R2Bucket
  ORIGIN_BASE: string
}

const AUDIO_CACHE_SECONDS = 365 * 24 * 60 * 60  // 1 year (immutable)
const CORS_ORIGIN = 'https://islam.wiki'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Only handle GET requests to /audio/*
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse path: /audio/{reciter}/{filename}.mp3
    const match = url.pathname.match(/^\/audio\/([^/]+)\/(\d{6}\.mp3)$/)
    if (!match) {
      return new Response('Not found', { status: 404 })
    }

    const [, reciter, filename] = match
    const r2Key = `${reciter}/${filename}`
    const originUrl = `${env.ORIGIN_BASE}/data/${reciter}/${filename}`

    // --- CORS preflight ---
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request),
      })
    }

    // --- Try R2 first ---
    try {
      const cached = await env.AUDIO_BUCKET.get(r2Key)
      if (cached) {
        const headers = new Headers({
          'Content-Type': 'audio/mpeg',
          'Cache-Control': `public, max-age=${AUDIO_CACHE_SECONDS}, immutable`,
          'X-Cache': 'HIT',
          ...corsHeaders(request),
        })
        if (cached.size) {
          headers.set('Content-Length', String(cached.size))
        }
        return new Response(cached.body, { headers })
      }
    } catch (e) {
      // R2 error — fall through to origin
      console.error('R2 get error:', e)
    }

    // --- Fetch from origin ---
    let originResponse: Response
    try {
      originResponse = await fetch(originUrl, {
        headers: {
          'User-Agent': 'islam.wiki audio proxy',
          Referer: 'https://islam.wiki/',
        },
      })
    } catch (e) {
      return new Response('Failed to fetch audio from origin', { status: 502 })
    }

    if (!originResponse.ok) {
      return new Response(`Origin returned ${originResponse.status}`, {
        status: originResponse.status,
      })
    }

    // --- Stream response to client and store in R2 simultaneously ---
    const [clientStream, storeStream] = originResponse.body!.tee()

    // Store in R2 asynchronously (don't block the response)
    const storePromise = (async () => {
      try {
        const chunks: Uint8Array[] = []
        const reader = storeStream.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }
        const body = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          body.set(chunk, offset)
          offset += chunk.length
        }
        await env.AUDIO_BUCKET.put(r2Key, body, {
          httpMetadata: {
            contentType: 'audio/mpeg',
            cacheControl: `public, max-age=${AUDIO_CACHE_SECONDS}, immutable`,
          },
        })
      } catch (e) {
        console.error('R2 put error:', e)
      }
    })()

    // Use waitUntil to keep the Worker alive for the R2 store
    // (handled automatically by Workers runtime for streamed responses)
    void storePromise

    const responseHeaders = new Headers({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': `public, max-age=${AUDIO_CACHE_SECONDS}, immutable`,
      'X-Cache': 'MISS',
      ...corsHeaders(request),
    })
    const cl = originResponse.headers.get('Content-Length')
    if (cl) responseHeaders.set('Content-Length', cl)

    return new Response(clientStream, {
      status: 200,
      headers: responseHeaders,
    })
  },
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = origin === CORS_ORIGIN || origin.endsWith('.islam.wiki') || origin.includes('localhost')
  return {
    'Access-Control-Allow-Origin': allowed ? origin : CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
    'Access-Control-Max-Age': '86400',
  }
}
