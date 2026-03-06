import Link from 'next/link'
import { SearchInput } from '@/components/search/search-input'
import { iconMap } from '@/components/ui/icons'

const collections = [
  {
    title: 'Quran',
    description: '114 surahs with translations, tafsir by Ibn Kathir and Al-Jalalayn',
    href: '/quran',
    stat: '6,236 verses',
    icon: 'quran',
  },
  {
    title: 'Hadith',
    description: '8 major collections with full isnad chains and grading',
    href: '/hadith',
    stat: '50,000+ hadith',
    icon: 'hadith',
  },
  {
    title: 'Seerah',
    description: 'Interactive timeline and maps of the Prophet\u2019s life',
    href: '/seerah',
    stat: 'Full timeline',
    icon: 'seerah',
  },
  {
    title: 'People',
    description: 'Scholars, companions, and narrators with biographies',
    href: '/people',
    stat: '450+ scholars',
    icon: 'people',
  },
  {
    title: 'Books',
    description: 'Classical Islamic texts in multiple languages',
    href: '/books',
    stat: '400+ books',
    icon: 'books',
  },
  {
    title: 'Articles',
    description: 'Encyclopedic articles on all aspects of Islam',
    href: '/articles',
    stat: '400+ articles',
    icon: 'articles',
  },
  {
    title: 'Video',
    description: 'Lectures and series with searchable transcripts',
    href: '/videos',
    stat: 'Transcribed',
    icon: 'videos',
  },
  {
    title: 'Audio',
    description: 'Recitations, lectures, and podcasts',
    href: '/audio',
    stat: 'Transcribed',
    icon: 'audio',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Search */}
      <section className="relative pt-20 pb-10">
        <div className="section-container relative">
          <div className="mx-auto max-w-2xl">
            <SearchInput placeholder="Search Quran, Hadith, scholars, topics..." />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {['Wudhu', 'Salah', 'Fasting', 'Zakat', 'Hajj', 'Tawheed', 'Sunnah', 'Dua', 'Jannah', 'Nikah'].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-iw-border px-3 py-1 text-xs text-iw-text-muted transition-colors hover:border-iw-text-muted hover:text-iw-text-secondary"
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Start Here — for new visitors */}
      <section className="py-8">
        <div className="section-container">
          <h2 className="mb-4 text-lg font-semibold text-iw-text-muted">New here? Start with</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'The Quran',
                description: 'The word of God, revealed to Prophet Muhammad ﷺ. Start with Al-Fatiha — the opening chapter.',
                href: '/quran/al-fatiha',
                label: 'Read Al-Fatiha',
                external: false,
              },
              {
                title: 'Hadith',
                description: "The Prophet's sayings and actions. Start with Sahih al-Bukhari — the most authentic collection.",
                href: '/hadith/bukhari',
                label: 'Browse Bukhari',
                external: false,
              },
              {
                title: 'Who was Muhammad ﷺ?',
                description: 'The biography of the Prophet — his life, character, and mission over 23 years.',
                href: '/seerah',
                label: 'Our Interactive Seerah',
                external: false,
              },
              {
                title: 'Ask a Question',
                description: 'Have a question about Islam? Get a thoughtful, scholarly answer from ChatIslam.',
                href: 'https://chatislam.org',
                label: 'Ask ChatIslam',
                external: true,
              },
            ].map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-xl border border-iw-accent/20 bg-iw-accent/5 p-4 transition-colors hover:border-iw-accent/40 hover:bg-iw-accent/10"
                >
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-iw-text-muted">{item.description}</p>
                  <span className="mt-auto self-end pt-2 text-xs font-medium text-iw-accent">{item.label} →</span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col rounded-xl border border-iw-accent/20 bg-iw-accent/5 p-4 transition-colors hover:border-iw-accent/40 hover:bg-iw-accent/10"
                >
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-iw-text-muted">{item.description}</p>
                  <span className="mt-auto self-end pt-2 text-xs font-medium text-iw-accent">{item.label} →</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Collections grid */}
      <section className="py-12">
        <div className="section-container">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Explore
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((item) => {
              const IconComponent = iconMap[item.icon]
              return (
                <Link key={item.href} href={item.href} className="card group h-full">
                  {IconComponent && <IconComponent size={28} className="mb-3 text-iw-accent" />}
                  <h3 className="text-lg font-semibold text-iw-text group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-iw-text-muted">{item.description}</p>
                  <p className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent">
                    {item.stat} →
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Wiki */}
      <section className="py-12">
        <div className="section-container">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Wiki</h2>
                <p className="mt-1 text-sm text-iw-text-muted">
                  Community-edited encyclopedia of Islamic concepts, terminology, and encyclopedic topics.
                </p>
              </div>
              <Link
                href="/wiki"
                className="shrink-0 rounded-lg border border-iw-border px-4 py-2 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-white"
              >
                Browse all
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Fiqh', 'Aqeedah', 'Tawheed', 'Seerah', 'Dawah', 'Hajj', 'Ramadan', 'Jihad', 'Sharia', 'Madhab', 'Sufism', 'Salafiyyah'].map(
                (topic) => (
                  <Link
                    key={topic}
                    href={`/wiki/${topic.toLowerCase()}`}
                    className="rounded-md border border-iw-border bg-iw-surface px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-white"
                  >
                    {topic}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-iw-border bg-iw-surface py-10">
        <div className="section-container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {[
              { label: 'Surahs', value: '114' },
              { label: 'Verses', value: '6,236' },
              { label: 'Hadith', value: '50,000+' },
              { label: 'Scholars', value: '450+' },
              { label: 'Books', value: '400+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-iw-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verse of the Day + Hadith of the Day */}
      <section className="py-12">
        <div className="section-container">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-iw-accent">Verse of the Day</p>
              <p className="font-arabic text-right text-2xl leading-loose text-white" dir="rtl" lang="ar">
                أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ
              </p>
              <p className="mt-3 text-sm text-iw-text-secondary">
                &ldquo;Verily, in the remembrance of Allah do hearts find rest.&rdquo;
              </p>
              <p className="mt-2 text-xs text-iw-text-muted">Ar-Ra&apos;d 13:28</p>
              <Link href="/quran/ar-rad" className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent hover:text-iw-accent-light">
                Read in context →
              </Link>
            </div>
            <div className="card p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-iw-accent">Hadith of the Day</p>
              <p className="text-sm leading-relaxed text-white">
                &ldquo;None of you truly believes until he loves for his brother what he loves for himself.&rdquo;
              </p>
              <p className="mt-3 text-xs text-iw-text-muted">Sahih Muslim 2564 · Narrated by Anas ibn Malik · Sahih</p>
              <Link href="/hadith/muslim" className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent hover:text-iw-accent-light">
                Browse Sahih Muslim →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer / API */}
      <section className="border-t border-iw-border py-10">
        <div className="section-container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Use Our API</h2>
              <p className="mt-1 text-sm text-iw-text-muted">
                Free access to Quran, Hadith, and Islamic content for your app or website. No API key required for basic use.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/api-docs"
                className="rounded-lg border border-iw-border px-4 py-2 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-white"
              >
                API Docs
              </Link>
              <Link
                href="/widgets"
                className="rounded-lg bg-iw-accent px-4 py-2 text-sm font-medium text-iw-bg transition-colors hover:bg-iw-accent/80"
              >
                Get Widget
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
