export default function SeerahLoading() {
  return (
    <div className="section-container py-12">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-iw-surface" />
      {/* Map placeholder */}
      <div className="mb-8 h-64 w-full animate-pulse rounded-xl bg-iw-surface border border-iw-border" />
      {/* Event list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-iw-border bg-iw-surface p-4">
            <div className="mt-1 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-iw-accent/30" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-iw-border" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-iw-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
