import type { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Contributor Profile`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  return (
    <div className="section-container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-iw-accent/15 text-2xl font-bold text-iw-accent">
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">@{username}</h1>
            <p className="text-sm text-iw-text-secondary">Trust Level 0 · Joined recently</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-iw-text-secondary">Edits</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-iw-text-secondary">Approved</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-iw-text-secondary">Articles</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
          <p className="text-sm italic text-iw-text-muted">
            No activity yet. <Link href="/wiki/contribute" className="text-iw-accent hover:text-white">Start contributing</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
