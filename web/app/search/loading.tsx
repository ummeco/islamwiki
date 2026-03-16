export default function SearchLoading() {
  return (
    <div className="section-container py-12">
      <div className="mx-auto max-w-2xl">
        {/* Search bar skeleton */}
        <div className="mb-8 h-12 w-full animate-pulse rounded-xl bg-iw-surface border border-iw-border" />
        {/* Results skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-iw-border bg-iw-surface p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 animate-pulse rounded-full bg-iw-border" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-iw-border" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-iw-border" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-iw-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
