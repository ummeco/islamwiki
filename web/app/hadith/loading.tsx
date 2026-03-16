export default function HadithLoading() {
  return (
    <div className="section-container py-12">
      <div className="mb-8 h-8 w-56 animate-pulse rounded-lg bg-iw-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-iw-border bg-iw-surface p-5 space-y-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-iw-border" />
            <div className="h-4 w-full animate-pulse rounded bg-iw-border" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-iw-border" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 animate-pulse rounded-full bg-iw-border" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-iw-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
