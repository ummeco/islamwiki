import { NextRequest, NextResponse } from 'next/server'
import { searchGrouped } from '@/lib/search'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '3', 10)

  const results = searchGrouped(q, limit)

  return NextResponse.json(results)
}
