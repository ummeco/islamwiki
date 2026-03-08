import Link from 'next/link'

export default function VideoNotFound() {
  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-20">
      <h1 className="mb-2 text-4xl font-bold text-iw-accent">404</h1>
      <h2 className="mb-4 text-xl font-bold text-white">Video not found</h2>
      <p className="mb-8 max-w-md text-center text-iw-text-secondary">
        The video you requested was not found or has been removed.
      </p>
      <Link href="/videos" className="rounded-lg bg-iw-accent px-6 py-2.5 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light">
        Browse Videos
      </Link>
    </div>
  )
}
