export default function Loading() {
  return (
    <div className="section-container flex min-h-[60vh] items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-iw-accent/30 border-t-iw-accent" />
        <p className="text-sm text-iw-text-secondary">Loading...</p>
      </div>
    </div>
  )
}
