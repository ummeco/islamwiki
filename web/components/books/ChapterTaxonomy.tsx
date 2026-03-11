'use client'

import Link from 'next/link'

interface ChapterTaxonomyProps {
  subjectTags?: string[]
  topicTags?: string[]
  keywords?: string[]
  peopleRefs?: string[]
  ayahRefs?: string[]
  hadithRefs?: string[]
}

function isEmpty(arr?: string[]): boolean {
  return !arr || arr.length === 0
}

export function ChapterTaxonomy({
  subjectTags,
  topicTags,
  keywords,
  peopleRefs,
  ayahRefs,
  hadithRefs,
}: ChapterTaxonomyProps) {
  if (
    isEmpty(subjectTags) &&
    isEmpty(topicTags) &&
    isEmpty(keywords) &&
    isEmpty(peopleRefs) &&
    isEmpty(ayahRefs) &&
    isEmpty(hadithRefs)
  ) {
    return null
  }

  return (
    <aside className="mt-10 border-t border-iw-border pt-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-iw-text-muted">
        Related
      </p>

      {(!isEmpty(subjectTags) || !isEmpty(topicTags)) && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-iw-text-muted">Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {subjectTags?.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-iw-accent/10 px-2.5 py-0.5 text-xs text-iw-accent hover:bg-iw-accent/20"
              >
                {tag}
              </Link>
            ))}
            {topicTags?.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-iw-surface px-2.5 py-0.5 text-xs text-iw-text-secondary hover:text-iw-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isEmpty(keywords) && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-iw-text-muted">Keywords</p>
          <div className="flex flex-wrap gap-1">
            {keywords?.map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded bg-iw-surface/50 px-2 py-0.5 text-[11px] text-iw-text-muted hover:text-iw-accent"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isEmpty(peopleRefs) && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-iw-text-muted">People Mentioned</p>
          <div className="flex flex-wrap gap-1.5">
            {peopleRefs?.map((slug) => (
              <Link
                key={slug}
                href={`/people/${slug}`}
                className="rounded-full border border-iw-border px-2.5 py-0.5 text-xs text-iw-text-secondary hover:border-iw-accent hover:text-iw-accent"
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isEmpty(ayahRefs) && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-iw-text-muted">Quran References</p>
          <div className="flex flex-wrap gap-1.5">
            {ayahRefs?.map((ref) => (
              <Link
                key={ref}
                href={`/quran/${ref}`}
                className="rounded-full border border-iw-border px-2.5 py-0.5 text-xs font-mono text-iw-text-secondary hover:border-iw-accent hover:text-iw-accent"
              >
                {ref}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isEmpty(hadithRefs) && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-iw-text-muted">Hadith References</p>
          <div className="flex flex-wrap gap-1.5">
            {hadithRefs?.map((ref) => (
              <Link
                key={ref}
                href={`/hadith/${ref}`}
                className="rounded-full border border-iw-border px-2.5 py-0.5 text-xs font-mono text-iw-text-secondary hover:border-iw-accent hover:text-iw-accent"
              >
                {ref}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
