export default function BooksLoading() {
  return (
    <div className="section-container py-12">
      <div className="mb-8 h-8 w-40 animate-pulse rounded-lg bg-iw-surface" />
      {/* Category tabs skeleton */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-lg bg-iw-surface" />
        ))}
      </div>
      {/* Books grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-iw-border bg-iw-surface p-4 space-y-3">
            <div className="h-5 w-full animate-pulse rounded bg-iw-border" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-iw-border" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-iw-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
