/**
 * B5-03: islamwiki/web — wiki page loading skeleton
 */
export default function WikiLoading() {
  return (
    <div className="section-container py-10">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3 w-12 animate-pulse rounded-full bg-iw-border" />
        <span className="text-iw-border">/</span>
        <div className="h-3 w-20 animate-pulse rounded-full bg-iw-border" />
      </div>
      {/* Title */}
      <div className="mb-4 h-9 w-2/3 animate-pulse rounded bg-iw-surface" />
      {/* Body */}
      <div className="space-y-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-iw-border"
            style={{ width: i % 4 === 3 ? '65%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}
