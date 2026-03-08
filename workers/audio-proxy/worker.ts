/**
 * Islam.wiki Audio Proxy Worker
 *
 * Serves Quran recitation audio from Cloudflare R2 with lazy-fill from everyayah.com.
 *
 * URL pattern: GET /data/{reciter}/{surah3digit}{ayah3digit}.mp3
 * Example:     GET /data/Alafasy_128kbps/002255.mp3
 *
 * Flow:
 *   1. Check R2 bucket for cached file
 *   2. If not found, fetch from everyayah.com
 *   3. Store in R2 (background, via ctx.waitUntil)
 *   4. Return audio stream with correct headers
 *
 * Deploy: wrangler deploy
 * Domain: audio.islam.wiki (add CNAME in Cloudflare DNS → worker)
 */

export interface Env {
  AUDIO_BUCKET: R2Bucket
}

const EVERYAYAH_BASE = 'https://everyayah.com/data'

// Allowed reciter directory names (whitelist to prevent SSRF)
const ALLOWED_RECITERS = new Set([
  'Alafasy_128kbps',
  'Abdurrahmaan_As-Sudais_192kbps',
  'Saood_ash-Shuraym_128kbps',
  'Abu_Bakr_Ash-Shaatree_128kbps',
  'Abdul_Basit_Murattal_192kbps',
  'Abdul_Basit_Murattal_64kbps',
  'Husary_128kbps',
  'Muhammad_Ayyoub_128kbps',
  'Minshawy_Murattal_128kbps',
  'Ghamadi_40kbps',
])

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const path = url.pathname // e.g. /data/Alafasy_128kbps/002255.mp3

    // Only handle /data/{reciter}/{file}.mp3
    const match = path.match(/^\/data\/([^/]+)\/(\d{6}\.mp3)$/)
    if (!match) {
      return new Response('Not Found', { status: 404 })
    }

    const [, reciter, file] = match

    // Validate reciter to prevent SSRF
    if (!ALLOWED_RECITERS.has(reciter)) {
      return new Response('Not Found', { status: 404 })
    }

    const r2Key = `${reciter}/${file}`

    // 1. Try R2 cache first
    const cached = await env.AUDIO_BUCKET.get(r2Key)
    if (cached) {
      const headers = new Headers()
      headers.set('Content-Type', 'audio/mpeg')
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      headers.set('X-Cache', 'HIT')
      headers.set('Access-Control-Allow-Origin', '*')
      if (cached.size) {
        headers.set('Content-Length', String(cached.size))
      }
      if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers })
      }
      return new Response(cached.body, { status: 200, headers })
    }

    // 2. Fetch from everyayah.com
    const upstream = `${EVERYAYAH_BASE}/${reciter}/${file}`
    let upstreamRes: Response
    try {
      upstreamRes = await fetch(upstream, {
        headers: {
          'User-Agent': 'islam.wiki audio proxy',
          Referer: 'https://everyayah.com/',
        },
      })
    } catch {
      return new Response('Bad Gateway', { status: 502 })
    }

    if (!upstreamRes.ok) {
      return new Response('Not Found', { status: 404 })
    }

    // 3. Clone body: one for response, one for R2 write
    const [bodyForResponse, bodyForR2] = upstreamRes.body!.tee()

    // Write to R2 in background (don't block the response)
    ctx.waitUntil(
      env.AUDIO_BUCKET.put(r2Key, bodyForR2, {
        httpMetadata: {
          contentType: 'audio/mpeg',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      }).catch(() => {
        // R2 write failure is non-fatal — user still gets audio
      })
    )

    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'MISS',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response(bodyForResponse, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
        'Access-Control-Allow-Origin': '*',
      },
    })
  },
}
