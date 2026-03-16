export default function QuranLoading() {
  return (
    <div className="section-container py-12">
      {/* Header skeleton */}
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-iw-surface" />
      {/* Surah grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-iw-border bg-iw-surface p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-iw-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-iw-border" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-iw-border" />
            </div>
            <div className="h-6 w-10 animate-pulse rounded bg-iw-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
