// ISR: cache individual hadith pages for 7 days, avoid building all ~70k at once
export const revalidate = 604800

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getCollectionBySlug,
  getBookBySlug,
  getHadithByNumber,
  getBooksByCollection,
  getHadithsByBook,
  getSharhForHadith,
  getSharhSources,
  getHadithRefByIwId,
} from '@/lib/data/hadith'
import { getHreflangAlternates } from '@/components/seo/hreflang'
import { HadithActions } from '@/components/hadith/HadithActions'
import { IsnadChain } from '@/components/hadith/isnad-chain'

interface Props {
  params: Promise<{ collection: string; book: string; number: string }>
}

function gradeColor(grade: string | undefined): string {
  if (!grade) return 'bg-gray-500/20 text-gray-300'
  const g = grade.toLowerCase()
  if (g.includes('sahih')) return 'bg-green-500/20 text-green-300'
  if (g.includes('hasan')) return 'bg-yellow-500/20 text-yellow-300'
  if (g.includes('daif') || g.includes("da'if")) return 'bg-red-500/20 text-red-300'
  return 'bg-gray-500/20 text-gray-300'
}

function gradeDescription(grade: string | undefined): string {
  if (!grade) return 'Grade: Ungraded'
  const g = grade.toLowerCase()
  if (g.includes('sahih')) return 'Grade: Sahih — authentic hadith'
  if (g.includes('hasan sahih')) return 'Grade: Hasan Sahih — good and authentic'
  if (g.includes('hasan')) return 'Grade: Hasan — good hadith'
  if (g.includes('daif') || g.includes("da'if")) return "Grade: Da\u02bfif — weak hadith"
  return `Grade: ${grade}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: colSlug, book: bookSlug, number } = await params
  const col = getCollectionBySlug(colSlug)
  const book = col ? getBookBySlug(col.id, bookSlug) : null
  if (!col || !book) return {}
  const hadith = getHadithByNumber(book.id, parseInt(number, 10))
  const desc = hadith?.text_en
    ? hadith.text_en.slice(0, 160)
    : `${col.name_en}, ${book.name_en}, Hadith ${number}`
  return {
    title: `Hadith #${number} — ${book.name_en} — ${col.name_en}`,
    description: desc,
    alternates: { languages: getHreflangAlternates(`/hadith/${colSlug}/${bookSlug}/${number}`) },
    openGraph: {
      title: `Hadith #${number} — ${col.name_en}`,
      description: desc,
      type: 'article',
      images: [`/api/og/hadith?collection=${colSlug}&book=${bookSlug}&cn=${number}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Hadith #${number} — ${col.name_en}`,
      description: desc,
      images: [`/api/og/hadith?collection=${colSlug}&book=${bookSlug}&cn=${number}`],
    },
  }
}

export default async function HadithPage({ params }: Props) {
  const { collection: colSlug, book: bookSlug, number } = await params
  const col = getCollectionBySlug(colSlug)
  if (!col) notFound()
  const book = getBookBySlug(col.id, bookSlug)
  if (!book) notFound()

  const num = parseInt(number, 10)
  const hadith = getHadithByNumber(book.id, num)
  if (!hadith) notFound()

  // Navigation: find actual prev/next from the loaded data
  const allHadiths = getHadithsByBook(book.id)
  const currentIdx = allHadiths.findIndex((h) => h.n === num)
  const prevHadith = currentIdx > 0 ? allHadiths[currentIdx - 1] : null
  const nextHadith = currentIdx < allHadiths.length - 1 ? allHadiths[currentIdx + 1] : null

  // Sharh (commentary) data
  const sharhEntries = getSharhForHadith(col.slug, book.number, num)
  const sharhSources = sharhEntries.length > 0 ? getSharhSources() : []

  const booksInCollection = getBooksByCollection(col.id)
  const currentBookIdx = booksInCollection.findIndex((b) => b.id === book.id)
  const prevBook = currentBookIdx > 0 ? booksInCollection[currentBookIdx - 1] : null
  const nextBook = currentBookIdx < booksInCollection.length - 1 ? booksInCollection[currentBookIdx + 1] : null

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/hadith" className="hover:text-iw-text">Hadith</Link>
        <span className="mx-2">/</span>
        <Link href={`/hadith/${colSlug}`} className="hover:text-iw-text">{col.name_en}</Link>
        <span className="mx-2">/</span>
        <Link href={`/hadith/${colSlug}/${bookSlug}`} className="hover:text-iw-text">{book.name_en}</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">#{number}</span>
      </nav>

      {/* Top navigation */}
      <div className="mb-6 flex items-center justify-between">
        {prevHadith ? (
          <Link
            href={`/hadith/${colSlug}/${bookSlug}/${prevHadith.n}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Hadith #{prevHadith.n}
          </Link>
        ) : prevBook ? (
          <Link href={`/hadith/${colSlug}/${prevBook.slug}`} className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevBook.name_en}
          </Link>
        ) : <div />}
        <span className="text-xs text-iw-text-muted">{currentIdx + 1} of {allHadiths.length}</span>
        {nextHadith ? (
          <Link
            href={`/hadith/${colSlug}/${bookSlug}/${nextHadith.n}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            Hadith #{nextHadith.n}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : nextBook ? (
          <Link href={`/hadith/${colSlug}/${nextBook.slug}`} className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent">
            {nextBook.name_en}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Hadith #{hadith.n}</h1>
          <div className="flex items-center gap-2">
            {hadith.muttafaq_alayhi && (
              <span
                className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300"
                title="Muttafaq 'Alayhi — agreed upon by both Bukhari and Muslim"
              >
                Muttafaq &#x2018;Alayhi
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${gradeColor(hadith.grade)}`}
              title={gradeDescription(hadith.grade)}
              aria-label={gradeDescription(hadith.grade)}
            >
              {hadith.grade_display || hadith.grade || 'Ungraded'}
            </span>
          </div>
        </div>

        {/* Chapter */}
        {hadith.chapter_en && (
          <div className="mb-4 rounded-lg border border-iw-border/50 bg-iw-bg/50 px-4 py-2">
            <p className="text-sm text-iw-text-secondary">
              <span className="font-medium text-iw-accent">Chapter:</span> {hadith.chapter_en}
            </p>
            {hadith.chapter_ar && (
              <p className="arabic-text mt-0.5 text-sm text-white/60" lang="ar" dir="rtl">{hadith.chapter_ar}</p>
            )}
          </div>
        )}

        {/* Arabic text — with isnad/matn separation if available */}
        {hadith.ar && (
          <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-6">
            <h2 className="mb-3 text-sm font-medium text-iw-accent">Arabic Text</h2>
            {hadith.isnad_ar && hadith.matn_ar ? (
              <div className="space-y-3">
                <div>
                  <span className="mb-1 block text-xs font-medium text-iw-text-muted">Chain of Narration (Isnad)</span>
                  <p className="quran-text text-base leading-loose text-white/70" lang="ar" dir="rtl">{hadith.isnad_ar}</p>
                </div>
                <div className="border-t border-iw-border/50 pt-3">
                  <span className="mb-1 block text-xs font-medium text-iw-text-muted">Body (Matn)</span>
                  <p className="quran-text text-lg leading-loose text-white" lang="ar" dir="rtl">{hadith.matn_ar}</p>
                </div>
              </div>
            ) : (
              <p className="quran-text text-lg leading-loose text-white" lang="ar" dir="rtl">{hadith.ar}</p>
            )}
          </div>
        )}

        {/* Isnad chain visualization */}
        {hadith.isnad_chain && hadith.isnad_chain.length > 0 && (
          <div className="mb-6">
            <IsnadChain
              chain={hadith.isnad_chain}
              chainTextAr={hadith.isnad_ar}
            />
          </div>
        )}

        {/* English translation */}
        {hadith.text_en && (
          <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-6">
            <h2 className="mb-3 text-sm font-medium text-iw-accent">English Translation</h2>
            <p className="leading-relaxed text-iw-text">{hadith.text_en}</p>
          </div>
        )}

        {/* Grade details */}
        {hadith.grades && hadith.grades.length > 0 && (
          <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-6">
            <h2 className="mb-3 text-sm font-medium text-iw-accent">Grading</h2>
            <div className="space-y-2">
              {hadith.grades.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-iw-text-secondary">{g.graded_by}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gradeColor(g.grade)}`}>
                    {g.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {hadith.topics && hadith.topics.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-iw-accent">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {hadith.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="rounded-full bg-iw-accent/10 px-3 py-1 text-xs text-iw-accent transition-colors hover:bg-iw-accent/20"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quran References */}
        {hadith.quran_refs && hadith.quran_refs.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-iw-accent">Quran References</h2>
            <div className="flex flex-wrap gap-2">
              {hadith.quran_refs.map((ref) => {
                const [surah, ayah] = ref.split(':')
                return (
                  <Link
                    key={ref}
                    href={`/quran/${surah}${ayah ? `/${ayah}` : ''}`}
                    className="rounded-full bg-iw-accent/10 px-3 py-1 text-xs text-iw-accent hover:bg-iw-accent/20"
                  >
                    {ref}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Also Narrated In (duplicates) */}
        {hadith.duplicates && hadith.duplicates.length > 0 && (() => {
          const refs = hadith.duplicates!
            .map((iwId) => ({ iwId, ref: getHadithRefByIwId(iwId) }))
            .filter((x) => x.ref !== null)
          if (refs.length === 0) return null
          return (
            <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface/50 p-4">
              <h2 className="mb-3 text-sm font-medium text-iw-accent">Also Narrated In</h2>
              <div className="space-y-2">
                {refs.map(({ iwId, ref }) => (
                  <Link
                    key={iwId}
                    href={`/hadith/${ref!.collectionSlug}/${ref!.bookSlug}/${ref!.n}`}
                    className="flex items-center gap-2 text-sm text-iw-text-secondary hover:text-iw-accent"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-iw-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {ref!.collectionName} — Hadith #{ref!.n}
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Similar Narrations (variants) */}
        {hadith.variants && hadith.variants.length > 0 && (() => {
          const refs = hadith.variants!
            .map((iwId) => ({ iwId, ref: getHadithRefByIwId(iwId) }))
            .filter((x) => x.ref !== null)
          if (refs.length === 0) return null
          return (
            <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface/50 p-4">
              <h2 className="mb-3 text-sm font-medium text-iw-accent">Similar Narrations</h2>
              <p className="mb-3 text-xs text-iw-text-muted">Hadiths with similar wording or meaning, narrated in other collections.</p>
              <div className="space-y-2">
                {refs.map(({ iwId, ref }) => (
                  <Link
                    key={iwId}
                    href={`/hadith/${ref!.collectionSlug}/${ref!.bookSlug}/${ref!.n}`}
                    className="flex items-center gap-2 text-sm text-iw-text-secondary hover:text-iw-accent"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-iw-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {ref!.collectionName} — Hadith #{ref!.n}
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Sharh (Commentary) */}
        {sharhEntries.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Commentary (Sharh)</h3>
            <div className="space-y-4">
              {sharhEntries.map((entry) => {
                const source = sharhSources.find((s) => s.id === entry.source_id)
                return (
                  <div key={entry.id} className="rounded-xl border border-iw-border bg-iw-surface/50 p-4">
                    {source && (
                      <p className="mb-2 text-xs font-medium text-iw-accent">
                        {source.name_en} — {source.author}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-iw-text-secondary">
                      {entry.text_en}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reference block */}
        <div className="rounded-xl border border-iw-border bg-iw-surface/50 p-4 text-xs text-iw-text-secondary">
          <p>
            <span className="font-medium text-iw-text">Reference:</span>{' '}
            {col.name_en}, {book.name_en}, Hadith {hadith.n}
          </p>
          {hadith.ref && (
            <p className="mt-1">
              <span className="font-medium text-iw-text">Sunnah.com ref:</span> {hadith.ref}
            </p>
          )}
          {hadith.iw_id && (
            <p className="mt-1">
              <span className="font-medium text-iw-text">Islam.wiki ID:</span> {hadith.iw_id}
            </p>
          )}
        </div>

        {/* Copy/Share */}
        <HadithActions
          textEn={hadith.text_en ?? ''}
          textAr={hadith.ar}
          reference={`${col.name_en} ${hadith.n}`}
          shareUrl={`https://islam.wiki/hadith/${colSlug}/${bookSlug}/${num}`}
        />

        {/* Bottom navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-iw-border pt-6">
          {prevHadith ? (
            <Link href={`/hadith/${colSlug}/${bookSlug}/${prevHadith.n}`} className="group flex flex-col items-start">
              <span className="text-xs text-iw-text-muted">Previous</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">Hadith #{prevHadith.n}</span>
            </Link>
          ) : <div />}
          <Link href={`/hadith/${colSlug}/${bookSlug}`} className="text-xs text-iw-text-muted hover:text-iw-accent">
            Back to {book.name_en}
          </Link>
          {nextHadith ? (
            <Link href={`/hadith/${colSlug}/${bookSlug}/${nextHadith.n}`} className="group flex flex-col items-end">
              <span className="text-xs text-iw-text-muted">Next</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">Hadith #{nextHadith.n}</span>
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}
