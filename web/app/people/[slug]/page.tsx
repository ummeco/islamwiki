import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPersonBySlug,
  getPeople,
  getRelationships,
  getPersonPlaces,
} from '@/lib/data/people'
import { getBooksByAuthor } from '@/lib/data/books'
import { WikiLayout } from '@/components/wiki/wiki-layout'
import { ContentTabs } from '@/components/wiki/content-tabs'
import { EditButton } from '@/components/wiki/edit-button'
import { formatIslamicYear } from '@/lib/dates/hijri'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getPeople().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const person = getPersonBySlug(slug)
  if (!person) return {}
  const dates = [
    person.birth_year_ah || person.birth_year_ce
      ? `b. ${formatIslamicYear(person.birth_year_ah, person.birth_year_ce)}`
      : '',
    person.death_year_ah || person.death_year_ce
      ? `d. ${formatIslamicYear(person.death_year_ah, person.death_year_ce)}`
      : '',
  ]
    .filter(Boolean)
    .join(' — ')
  return {
    title: person.name_en,
    description: `Biography of ${person.name_en}${dates ? ` (${dates})` : ''}. ${person.bio_short_en || 'Islamic scholar and historical figure.'}`,
  }
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params
  const person = getPersonBySlug(slug)
  if (!person) notFound()

  const relationships = getRelationships(person.id)
  const places = getPersonPlaces(person.id)
  const authoredBooks = getBooksByAuthor(slug)

  return (
    <WikiLayout
      breadcrumbs={[
        { label: 'People', href: '/people' },
        { label: person.name_en },
      ]}
      showToc={false}
    >
      <ContentTabs
        basePath={`/people/${slug}`}
        activeTab="read"
        canEdit
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {person.name_en}
              </h1>
              {person.name_ar && (
                <p className="arabic-text mt-2 text-2xl text-white/80">
                  {person.name_ar}
                </p>
              )}
              {person.title && (
                <p className="mt-1 text-sm font-medium text-iw-accent">
                  {person.title}
                </p>
              )}
            </div>
            <EditButton editHref={`/people/${slug}/edit`} />
          </div>

          {/* Dates — Hijri primary, CE secondary */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-iw-text-secondary">
            {(person.birth_year_ah || person.birth_year_ce) && (
              <span>
                Born:{' '}
                <span className="text-iw-text">
                  {formatIslamicYear(person.birth_year_ah, person.birth_year_ce, false)}
                </span>
                {person.birth_year_ce && person.birth_year_ah && (
                  <span className="ml-1 text-iw-text-muted/70">
                    ({person.birth_year_ce} CE)
                  </span>
                )}
              </span>
            )}
            {(person.death_year_ah || person.death_year_ce) && (
              <span>
                Died:{' '}
                <span className="text-iw-text">
                  {formatIslamicYear(person.death_year_ah, person.death_year_ce, false)}
                </span>
                {person.death_year_ce && person.death_year_ah && (
                  <span className="ml-1 text-iw-text-muted/70">
                    ({person.death_year_ce} CE)
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Biography */}
          <div className="mt-8">
            <h2
              id="biography"
              className="mb-3 text-lg font-semibold text-white"
            >
              Biography
            </h2>
            <div className="prose prose-invert max-w-none text-iw-text-secondary">
              {person.bio_full_en ? (
                <p>{person.bio_full_en}</p>
              ) : (
                <p className="italic text-iw-text-muted">
                  {person.bio_short_en || 'Biography not yet available.'}
                </p>
              )}
            </div>
          </div>

          {/* Books */}
          <div className="mt-8">
            <h2
              id="books"
              className="mb-3 text-lg font-semibold text-white"
            >
              Books
            </h2>
            {authoredBooks.length > 0 ? (
              <div className="space-y-2">
                {authoredBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-iw-accent/10 text-xs text-iw-accent">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-iw-text">{book.title_en}</p>
                      <p className="text-xs text-iw-text-muted capitalize">
                        {book.subject.replace(/_/g, ' ')}
                        {book.year_written_ce ? ` \u00B7 ${book.year_written_ce} CE` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-iw-text-muted">
                No linked books yet.
              </p>
            )}
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              {person.kunyah && (
                <div>
                  <dt className="text-iw-text-muted">Kunyah</dt>
                  <dd className="text-iw-text">{person.kunyah}</dd>
                </div>
              )}
              {person.laqab && (
                <div>
                  <dt className="text-iw-text-muted">Laqab</dt>
                  <dd className="text-iw-text">{person.laqab}</dd>
                </div>
              )}
              <div>
                <dt className="text-iw-text-muted">Era</dt>
                <dd className="text-iw-text capitalize">
                  {person.era.replace('_', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-iw-text-muted">Category</dt>
                <dd className="text-iw-text capitalize">{person.category}</dd>
              </div>
              {person.birth_place_name && (
                <div>
                  <dt className="text-iw-text-muted">Birth Place</dt>
                  <dd className="text-iw-text">{person.birth_place_name}</dd>
                </div>
              )}
              {person.death_place_name && (
                <div>
                  <dt className="text-iw-text-muted">Death Place</dt>
                  <dd className="text-iw-text">{person.death_place_name}</dd>
                </div>
              )}
            </dl>
          </div>

          {relationships.length > 0 && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Relationships
              </h3>
              <ul className="space-y-2">
                {relationships.map((rel) => (
                  <li key={rel.id} className="text-sm">
                    <span className="text-iw-text-muted capitalize">
                      {rel.relationship_type}:
                    </span>{' '}
                    <Link
                      href={`/people/${rel.related_person_slug}`}
                      className="text-iw-accent hover:text-white"
                    >
                      {rel.related_person_name_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {places.length > 0 && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Places
              </h3>
              <ul className="space-y-2">
                {places.map((pp) => (
                  <li key={pp.id} className="text-sm">
                    <span className="text-iw-text">{pp.place_name_en}</span>
                    {pp.role && (
                      <span className="text-iw-text-muted"> — {pp.role}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </WikiLayout>
  )
}
