import Link from 'next/link'

export default function WikiNotFound() {
  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-20">
      <h1 className="mb-2 text-4xl font-bold text-iw-accent">404</h1>
      <h2 className="mb-4 text-xl font-bold text-white">Page not found</h2>
      <p className="mb-8 max-w-md text-center text-iw-text-secondary">
        This wiki page does not exist yet. Want to help build the encyclopedia?
      </p>
      <div className="flex gap-3">
        <Link href="/wiki" className="rounded-lg bg-iw-accent px-6 py-2.5 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light">
          Browse Wiki
        </Link>
        <Link href="/account" className="rounded-lg border border-iw-border px-6 py-2.5 text-sm font-semibold text-iw-text-secondary transition-colors hover:text-white">
          Contribute
        </Link>
      </div>
    </div>
  )
}
