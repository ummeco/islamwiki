import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { join } from 'path'
import { readFileSync } from 'fs'
import type { AyahJSON } from '@/types/quran-json'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surah = parseInt(searchParams.get('surah') ?? '1', 10)
  const from = parseInt(searchParams.get('from') ?? '1', 10)
  const rawTo = parseInt(searchParams.get('to') ?? String(from), 10)
  // Cap range to 10 verses to keep responses focused
  const to = Math.min(rawTo, from + 9)

  if (isNaN(surah) || isNaN(from) || surah < 1 || surah > 114 || from < 1) {
    return new Response('Invalid parameters', { status: 400 })
  }

  let allAyahs: AyahJSON[]
  try {
    const pad = String(surah).padStart(3, '0')
    const raw = readFileSync(
      join(process.cwd(), 'data', 'quran', 'ayahs', `${pad}.json`),
      'utf-8'
    )
    allAyahs = JSON.parse(raw)
  } catch {
    return new Response('Surah not found', { status: 404 })
  }

  const ayahs = allAyahs.filter((a) => a.n >= from && a.n <= to)
  if (!ayahs.length) return new Response('Verses not found', { status: 404 })

  // Build context: verse translations + any available ibn-kathir-en data
  const versesBlock = ayahs.map((a) => {
    const en = a.t?.['iwq'] ?? a.t?.['sahih-int'] ?? ''
    const ibnKathir = a.tafsir?.['ibn-kathir-en']
    const lines = [`Verse ${a.n}: "${en}"`]
    if (ibnKathir) lines.push(`[Ibn Kathir source text, v${a.n}]: ${ibnKathir.slice(0, 900)}`)
    return lines.join('\n')
  }).join('\n\n')

  const rangeLabel = from === to ? `verse ${from}` : `verses ${from}–${to}`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('Tafsir service not configured', { status: 503 })
  }

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an Islamic scholar writing accessible tafsir (Quranic commentary) for Surah ${surah}, ${rangeLabel}.

${versesBlock}

Write a scholarly tafsir synthesis of 300–400 words. Requirements:
- Open with the theme or occasion of these verses (asbab al-nuzul if relevant)
- Quote at least 2–3 classical scholars directly: "According to Ibn Kathir…", "Al-Tabari states…", "Al-Qurtubi notes…", "Al-Sa'di explains…", or "Al-Baghawi comments…"
- Explain key Arabic terms in parentheses where helpful
- Close with a practical reflection for a Muslim today

Stay strictly within mainstream Ahl us-Sunnah wal-Jama'ah scholarship. Write in flowing paragraphs (no headers or bullet points). Keep the tone scholarly but accessible.`,
      },
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch {
        controller.error(new Error('Stream failed'))
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Accel-Buffering': 'no',
    },
  })
}
