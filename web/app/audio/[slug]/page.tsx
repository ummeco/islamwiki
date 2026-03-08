import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMediaBySlug, getMedia } from '@/lib/data/media'
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getMedia('audio').map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const audio = getMediaBySlug(slug)
  if (!audio) return {}
  return {
    title: audio.title,
    description: `Listen to ${audio.title}${audio.speaker ? ` by ${audio.speaker}` : ''}. Full transcript available.`,
  }
}

export default async function AudioPage({ params }: Props) {
  const { slug } = await params
  const audio = getMediaBySlug(slug)
  if (!audio || audio.type !== 'audio') notFound()

  // Related audio by same speaker
  const relatedBySpeaker = audio.speaker
    ? getMedia('audio')
        .filter((a) => a.speaker === audio.speaker && a.slug !== audio.slug)
        .slice(0, 6)
    : []

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/audio" className="hover:text-iw-text">
          Audio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{audio.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-white">{audio.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-iw-text-secondary">
          {audio.speaker && (
            <span className="text-iw-accent">{audio.speaker}</span>
          )}
          {audio.duration && <span>{audio.duration}</span>}
        </div>

        {/* Audio player */}
        <div className="mt-6 rounded-xl border border-iw-border bg-iw-surface p-6">
          {audio.embed_code ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeEmbed(audio.embed_code) }} />
          ) : (
            <div className="flex items-center gap-4">
              <svg
                className="h-10 w-10 text-iw-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              {audio.external_url ? (
                <a
                  href={audio.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-iw-accent/15 px-4 py-2 text-sm font-medium text-iw-accent hover:bg-iw-accent/25"
                >
                  Listen
                </a>
              ) : (
                <p className="text-sm text-iw-text-muted">
                  Audio not yet available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {audio.tags && audio.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {audio.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-iw-border px-3 py-1 text-xs text-iw-text-secondary hover:border-iw-text-muted"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Transcript */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Transcript</h2>
          {audio.transcript ? (
            <div className="prose prose-invert max-w-none rounded-xl border border-iw-border p-6 text-sm text-iw-text-secondary">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(audio.transcript) }} />
            </div>
          ) : (
            <p className="text-sm italic text-iw-text-muted">
              Transcript not yet available.
            </p>
          )}
        </div>

        {/* Related audio by same speaker */}
        {relatedBySpeaker.length > 0 && (
          <div className="mt-10 border-t border-iw-border pt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              More by {audio.speaker}
            </h2>
            <div className="space-y-2">
              {relatedBySpeaker.map((a) => (
                <Link
                  key={a.slug}
                  href={`/audio/${a.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-iw-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-iw-text truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-iw-text-muted">
                      {a.duration || ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
