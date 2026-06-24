/**
 * src/pages/api/graphql.ts — Islam.wiki Hasura Remote Schema endpoint (Astro SSR)
 * Port of app/api/graphql/route.ts (S9-31).
 *
 * Powers Ummat App content widgets:
 *   - quranSurah(slug)             → surah metadata
 *   - quranAyah(surahSlug, number) → single ayah with translations
 *   - hadithEntry(collection, book, number) → hadith text + grade
 *
 * SECURITY (preserved exactly): Hasura authenticates every request with
 * x-remote-schema-secret — POST is rejected 401 unless the header matches
 * REMOTE_SCHEMA_SECRET (server-only env). Data is served from static JSON files.
 * REF: ports app/api/graphql/route.ts · Next→Astro migration (D-P2-STACK-CANON)
 */

import type { APIRoute } from 'astro'
import { getSurahs, getAyah } from '@/lib/data/quran'
import { getCollections, getBooksByCollection, getHadithByNumber } from '@/lib/data/hadith'

export const prerender = false

const SECRET = process.env.REMOTE_SCHEMA_SECRET

// ── Introspection response ─────────────────────────────────────────────────

const INTROSPECTION_RESPONSE = buildIntrospectionResponse()

function buildIntrospectionResponse() {
  return {
    data: {
      __schema: {
        queryType: { name: 'Query' },
        mutationType: null,
        subscriptionType: null,
        types: [
          {
            kind: 'OBJECT',
            name: 'Query',
            description: 'Islam.wiki Remote Schema — content widgets for Ummat App',
            fields: [
              {
                name: '_islamwiki',
                description: 'Health check field',
                args: [],
                type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
                isDeprecated: false,
                deprecationReason: null,
              },
              {
                name: 'quranSurah',
                description: 'Fetch a Quran surah by its slug',
                args: [{ name: 'slug', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'String' } }, defaultValue: null }],
                type: { kind: 'OBJECT', name: 'QuranSurah', ofType: null },
                isDeprecated: false,
                deprecationReason: null,
              },
              {
                name: 'quranAyah',
                description: 'Fetch a single ayah by surah slug + ayah number',
                args: [
                  { name: 'surahSlug', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'String' } }, defaultValue: null },
                  { name: 'number', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Int' } }, defaultValue: null },
                ],
                type: { kind: 'OBJECT', name: 'QuranAyah', ofType: null },
                isDeprecated: false,
                deprecationReason: null,
              },
              {
                name: 'hadithEntry',
                description: 'Fetch a single hadith by collection + book + number',
                args: [
                  { name: 'collection', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'String' } }, defaultValue: null },
                  { name: 'book', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'String' } }, defaultValue: null },
                  { name: 'number', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Int' } }, defaultValue: null },
                ],
                type: { kind: 'OBJECT', name: 'HadithEntry', ofType: null },
                isDeprecated: false,
                deprecationReason: null,
              },
            ],
            inputFields: null,
            interfaces: [],
            enumValues: null,
            possibleTypes: null,
          },
          {
            kind: 'OBJECT',
            name: 'QuranSurah',
            description: 'Quran surah metadata',
            fields: ['number', 'slug', 'name_en', 'name_ar', 'name_transliteration', 'revelation_type', 'verses_count'].map((f) => ({
              name: f,
              description: null,
              args: [],
              type: { kind: 'SCALAR', name: f === 'number' || f === 'verses_count' ? 'Int' : 'String', ofType: null },
              isDeprecated: false,
              deprecationReason: null,
            })),
            inputFields: null,
            interfaces: [],
            enumValues: null,
            possibleTypes: null,
          },
          {
            kind: 'OBJECT',
            name: 'QuranAyah',
            description: 'Quran ayah (verse)',
            fields: ['surah_number', 'ayah_number', 'text_ar', 'text_en', 'juz', 'page'].map((f) => ({
              name: f,
              description: null,
              args: [],
              type: { kind: 'SCALAR', name: ['surah_number', 'ayah_number', 'juz', 'page'].includes(f) ? 'Int' : 'String', ofType: null },
              isDeprecated: false,
              deprecationReason: null,
            })),
            inputFields: null,
            interfaces: [],
            enumValues: null,
            possibleTypes: null,
          },
          {
            kind: 'OBJECT',
            name: 'HadithEntry',
            description: 'Hadith entry',
            fields: ['collection_slug', 'book_slug', 'number', 'text_ar', 'text_en', 'grade'].map((f) => ({
              name: f,
              description: null,
              args: [],
              type: { kind: 'SCALAR', name: f === 'number' ? 'Int' : 'String', ofType: null },
              isDeprecated: false,
              deprecationReason: null,
            })),
            inputFields: null,
            interfaces: [],
            enumValues: null,
            possibleTypes: null,
          },
        ],
        directives: [],
      },
    },
  }
}

// ── Resolvers ─────────────────────────────────────────────────────────────

function resolveQuranSurah(args: Record<string, unknown>) {
  const slug = String(args.slug ?? '')
  const surahs = getSurahs()
  const s = surahs.find((x) => x.slug === slug || x.slug === slug.toLowerCase())
  if (!s) return null
  return {
    number: s.number,
    slug: s.slug,
    name_en: s.name_en,
    name_ar: s.name_ar,
    name_transliteration: s.name_transliteration ?? null,
    revelation_type: s.revelation_type,
    verses_count: s.verses_count,
  }
}

function resolveQuranAyah(args: Record<string, unknown>) {
  const surahSlug = String(args.surahSlug ?? '')
  const number = Number(args.number ?? 0)
  const surahs = getSurahs()
  const surah = surahs.find((s) => s.slug === surahSlug)
  if (!surah) return null

  // getAyah may not exist in all builds — graceful fallback
  try {
    const ayah = getAyah?.(surah.number, number)
    if (!ayah) return null
    return {
      surah_number: surah.number,
      ayah_number: number,
      text_ar: ayah.text_ar,
      text_en: ayah.translations?.en ?? ayah.translations?.['en-sahih'] ?? null,
      juz: ayah.juz,
      page: ayah.page,
    }
  } catch {
    return null
  }
}

function resolveHadithEntry(args: Record<string, unknown>) {
  const collectionSlug = String(args.collection ?? '')
  const bookSlug = String(args.book ?? '')
  const number = Number(args.number ?? 0)

  try {
    const collections = getCollections()
    const coll = collections.find((c) => c.slug === collectionSlug)
    if (!coll) return null

    const books = getBooksByCollection(coll.id)
    const book = books.find((b) => b.slug === bookSlug)
    if (!book) return null

    const entry = getHadithByNumber?.(book.id, number)
    if (!entry) return null

    return {
      collection_slug: collectionSlug,
      book_slug: bookSlug,
      number,
      text_ar: entry.text_ar ?? null,
      text_en: entry.text_en ?? null,
      grade: entry.grade ?? null,
    }
  } catch {
    return null
  }
}

// ── Request field extraction ───────────────────────────────────────────────

function extractField(query: string): string {
  const m = query.match(/\b(quranSurah|quranAyah|hadithEntry)\b/)
  return m?.[1] ?? '_islamwiki'
}

function extractArgs(query: string): Record<string, unknown> {
  const argsMatch = query.match(/\(([^)]+)\)/)
  if (!argsMatch) return {}
  const argsStr = argsMatch[1]
  const result: Record<string, unknown> = {}
  for (const part of argsStr.split(',')) {
    const [k, v] = part.split(':').map((s) => s.trim())
    if (!k) continue
    const clean = v?.replace(/^["']|["']$/g, '')
    result[k] = /^\d+$/.test(clean ?? '') ? parseInt(clean!, 10) : clean
  }
  return result
}

// ── Route handlers ──────────────────────────────────────────────────────────

function unauthorized() {
  return new Response(JSON.stringify({ errors: [{ message: 'Unauthorized' }] }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  if (!SECRET || request.headers.get('x-remote-schema-secret') !== SECRET) {
    return unauthorized()
  }

  const body = await request.json()

  // Introspection
  if (
    typeof body.query === 'string' &&
    (body.query.includes('__schema') || body.query.includes('IntrospectionQuery'))
  ) {
    return new Response(JSON.stringify(INTROSPECTION_RESPONSE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Resolve field
  const field = extractField(body.query ?? '')
  const args = body.variables ?? extractArgs(body.query ?? '')

  let result: unknown = null
  switch (field) {
    case 'quranSurah':
      result = resolveQuranSurah(args)
      break
    case 'quranAyah':
      result = resolveQuranAyah(args)
      break
    case 'hadithEntry':
      result = resolveHadithEntry(args)
      break
    default:
      result = true
  }

  return new Response(JSON.stringify({ data: { [field]: result } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Only Hasura and local dev call this Remote Schema endpoint
const REMOTE_SCHEMA_ORIGINS = [
  'https://api.ummat.dev',
  'https://api.islamwiki.local.nself.org:8543',
]

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('Origin') ?? ''
  const corsOrigin = REMOTE_SCHEMA_ORIGINS.includes(origin) ? origin : null

  return new Response(null, {
    status: 204,
    headers: {
      ...(corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin } : {}),
      'Access-Control-Allow-Headers': 'Content-Type, x-remote-schema-secret',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
