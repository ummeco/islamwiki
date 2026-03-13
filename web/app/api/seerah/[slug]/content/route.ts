import { NextResponse } from 'next/server'
import { getSeerahContent } from '@/lib/data/seerah-content'
import { getSeerahEventBySlug } from '@/lib/data/seerah'
import { getAllHistoryEvents } from '@/lib/data/history'

interface Props {
  params: Promise<{ slug: string }>
}

// Allow static pre-rendering of this route for known slugs
export async function generateStaticParams() {
  const { getSeerahEvents } = await import('@/lib/data/seerah')
  return getSeerahEvents().map((e) => ({ slug: e.slug }))
}

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params

  // Validate slug exists in seerah or history events
  const seerahEvent = getSeerahEventBySlug(slug)
  const historyEvents = getAllHistoryEvents()
  const historyEvent = historyEvents.find((e) => e.slug === slug)

  if (!seerahEvent && !historyEvent) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const content = getSeerahContent(slug)
  if (!content) {
    return NextResponse.json({ content: null }, { status: 200 })
  }

  return NextResponse.json(
    { content },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    }
  )
}
