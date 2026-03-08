import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-20">
      <h1 className="mb-2 text-6xl font-bold text-iw-accent">404</h1>
      <h2 className="mb-4 text-2xl font-bold text-white">Page not found</h2>
      <p className="mb-8 max-w-md text-center text-iw-text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-iw-accent px-6 py-2.5 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-iw-border px-6 py-2.5 text-sm font-semibold text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:text-white"
        >
          Search
        </Link>
      </div>
    </div>
  )
}
