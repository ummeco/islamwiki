import Link from 'next/link'

const sections = [
  {
    title: 'Content',
    links: [
      { label: 'Quran', href: '/quran' },
      { label: 'Hadith', href: '/hadith' },
      { label: 'Seerah', href: '/seerah' },
      { label: 'People', href: '/people' },
      { label: 'Books', href: '/books' },
      { label: 'Articles', href: '/articles' },
    ],
  },
  {
    title: 'Media',
    links: [
      { label: 'Videos', href: '/videos' },
      { label: 'Audio', href: '/audio' },
      { label: 'Sects', href: '/sects' },
      { label: 'Wiki', href: '/wiki' },
    ],
  },
  {
    title: 'Ummat Ecosystem',
    links: [
      { label: 'Ummat App', href: 'https://ummat.app' },
      { label: 'ChatIslam', href: 'https://chatislam.org' },
      { label: 'PrayCalc', href: 'https://praycalc.com' },
      { label: 'Ummat Dev', href: 'https://ummat.dev' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Contribute', href: '/wiki/contribute' },
      { label: 'Guidelines', href: '/wiki/guidelines' },
      { label: 'About', href: '/wiki/about' },
      { label: 'Contact', href: '/wiki/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-iw-border bg-iw-surface">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-iw-text">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-iw-text-muted transition-colors hover:text-iw-text-secondary"
                      {...(link.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-iw-border pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-white">Islam</span>
              <span className="text-iw-text-muted">.</span>
              <span className="text-iw-accent">wiki</span>
            </span>
            <span className="text-sm text-iw-text-muted">
              The Islamic Reference
            </span>
          </div>
          <p className="text-xs text-iw-text-muted">
            Free forever. Scholar-verified. Community-driven. Part of the{' '}
            <Link
              href="https://ummat.app"
              className="text-iw-text-secondary hover:text-iw-text"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ummat
            </Link>{' '}
            ecosystem.
          </p>
        </div>
      </div>
    </footer>
  )
}
