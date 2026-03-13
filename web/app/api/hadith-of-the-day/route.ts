import { NextResponse } from 'next/server'
import { getDailyHadith } from '@/lib/data/daily'

export async function GET() {
  return NextResponse.json(getDailyHadith(), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
