/**
 * B5-03: islamwiki/web — article loading skeleton
 * Mirrors the layout of an article page: breadcrumb + title + body lines + sidebar.
 * Uses brand token skeleton animation (B6-06).
 */
export default function ArticleLoading() {
  return (
    <div className="section-container py-10">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3 w-16 animate-pulse rounded-full bg-iw-border" />
        <span className="text-iw-border">/</span>
        <div className="h-3 w-24 animate-pulse rounded-full bg-iw-border" />
      </div>

      <div className="flex gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-iw-surface" />
          {/* Meta row */}
          <div className="mb-8 flex gap-4">
            <div className="h-4 w-20 animate-pulse rounded-full bg-iw-border" />
            <div className="h-4 w-28 animate-pulse rounded-full bg-iw-border" />
          </div>
          {/* Body lines */}
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-iw-border"
                style={{ width: i % 3 === 2 ? '70%' : '100%' }}
              />
            ))}
          </div>
          {/* Subheading */}
          <div className="mt-8 mb-3 h-6 w-1/2 animate-pulse rounded bg-iw-surface" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-iw-border"
                style={{ width: i % 4 === 3 ? '60%' : '100%' }}
              />
            ))}
          </div>
        </div>

        {/* Sidebar (hidden below lg) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-iw-border" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 w-full animate-pulse rounded-full bg-iw-border" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
