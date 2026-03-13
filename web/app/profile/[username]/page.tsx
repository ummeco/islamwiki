import type { Metadata } from 'next'
import Link from 'next/link'
import { getUserTrustByUsername } from '@/lib/contributor/user-trust'
import { getRevisionsByEditor } from '@/lib/contributor/revisions'
import { TrustBadge, TrustProgress } from '@/components/contributor/TrustBadge'
import type { TrustLevel } from '@/lib/contributor/trust'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Contributor Profile`,
    description: `Contribution history and trust level for @${username} on Islam.wiki.`,
  }
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400',
  denied: 'bg-red-500/15 text-red-400',
  pending: 'bg-amber-500/15 text-amber-400',
  reverted: 'bg-orange-500/15 text-orange-400',
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  const [trust, revisions] = await Promise.all([
    getUserTrustByUsername(username).catch(() => null),
    getRevisionsByEditor(username, 20).catch(() => []),
  ])

  const trustLevel = (trust?.trust_level ?? 0) as TrustLevel
  const trustScore = trust?.trust_score ?? 0
  const totalEdits = (trust?.edits_approved ?? 0) + (trust?.edits_rejected ?? 0) + (trust?.edits_pending ?? 0)

  return (
    <div className="section-container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-iw-accent/15 text-2xl font-bold text-iw-accent">
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">@{username}</h1>
            <div className="mt-1 flex items-center gap-2">
              <TrustBadge level={trustLevel} score={trustScore} showScore />
            </div>
            {trust && (
              <div className="mt-2 max-w-xs">
                <TrustProgress level={trustLevel} score={trustScore} />
              </div>
            )}
          </div>
        </div>

        {trust?.is_banned && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2">
            <p className="text-sm text-red-400">This account has been suspended.</p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-iw-accent">{trustScore}</p>
            <p className="text-sm text-iw-text-secondary">Reputation</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">{totalEdits}</p>
            <p className="text-sm text-iw-text-secondary">Total Edits</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-emerald-400">{trust?.edits_approved ?? 0}</p>
            <p className="text-sm text-iw-text-secondary">Approved</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-400">{trust?.edits_rejected ?? 0}</p>
            <p className="text-sm text-iw-text-secondary">Rejected</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Contributions</h2>
          {revisions.length === 0 ? (
            <p className="text-sm italic text-iw-text-muted">
              No contributions yet.{' '}
              <Link href="/wiki/contribute" className="text-iw-accent hover:text-white">
                Start contributing
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-start gap-3 rounded-lg border border-iw-border bg-iw-surface/60 px-4 py-3"
                >
                  <span className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[rev.status] ?? ''}`}>
                    {rev.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-iw-text truncate">
                      {rev.content_type} / {rev.content_slug}
                    </div>
                    {rev.change_summary && (
                      <p className="mt-0.5 text-xs text-iw-text-secondary">{rev.change_summary}</p>
                    )}
                    <p className="mt-0.5 text-xs text-iw-text-muted">
                      {new Date(rev.created_at).toLocaleDateString()}
                      {rev.is_minor && ' · minor'}
                      {rev.auto_approved && ' · auto-approved'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
