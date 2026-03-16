import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMediaBySlug, getMedia } from '@/lib/data/media'
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getMedia('video').map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const video = getMediaBySlug(slug)
  if (!video) return {}
  return {
    title: video.title,
    description: `Watch ${video.title}${video.speaker ? ` by ${video.speaker}` : ''}. Full transcript available.`,
    alternates: { languages: getHreflangAlternates(`/videos/${slug}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: video.title, section: 'Video', subtitle: video.speaker || '' }), width: 1200, height: 630 }],
    },
  }
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params
  const video = getMediaBySlug(slug)
  if (!video || video.type !== 'video') notFound()

  // Related videos by same speaker
  const relatedBySpeaker = video.speaker
    ? getMedia('video')
        .filter((v) => v.speaker === video.speaker && v.slug !== video.slug)
        .slice(0, 6)
    : []

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/videos" className="hover:text-iw-text">
          Videos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{video.title}</span>
      </nav>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-white">{video.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-iw-text-secondary">
          {video.speaker && (
            <span className="text-iw-accent">{video.speaker}</span>
          )}
          {video.duration && <span>{video.duration}</span>}
        </div>

        {/* Video embed */}
        <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-iw-border bg-iw-surface">
          {video.embed_code ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeEmbed(video.embed_code) }} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <svg
                className="h-12 w-12 text-iw-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {video.external_url ? (
                <a
                  href={video.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-iw-accent/15 px-4 py-2 text-sm font-medium text-iw-accent hover:bg-iw-accent/25"
                >
                  Watch video
                </a>
              ) : (
                <p className="text-sm text-iw-text-muted">
                  Video not yet available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
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
          {video.transcript ? (
            <div className="prose prose-invert max-w-none rounded-xl border border-iw-border p-6 text-sm text-iw-text-secondary">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(video.transcript) }} />
            </div>
          ) : (
            <p className="text-sm italic text-iw-text-muted">
              Transcript not yet available.
            </p>
          )}
        </div>

        {/* Related videos by same speaker */}
        {relatedBySpeaker.length > 0 && (
          <div className="mt-10 border-t border-iw-border pt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              More by {video.speaker}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBySpeaker.map((v) => (
                <Link
                  key={v.slug}
                  href={`/videos/${v.slug}`}
                  className="rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                >
                  <p className="text-sm font-medium text-iw-text line-clamp-2">
                    {v.title}
                  </p>
                  <p className="mt-1 text-xs text-iw-text-muted">
                    {v.duration || ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
