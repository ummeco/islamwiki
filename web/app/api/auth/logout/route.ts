import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signOut } from '@/lib/auth-client'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('iw_rt')?.value

  if (refreshToken) {
    // Best-effort: invalidate refresh token server-side
    await signOut(refreshToken).catch(() => undefined)
  }

  cookieStore.delete('iw_at')
  cookieStore.delete('iw_rt')

  return NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}
