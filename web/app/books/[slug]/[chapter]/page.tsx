import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBooks, getBookBySlug, getChaptersByBook, getChapter } from '@/lib/data/books'
import { ChapterLangTabs } from '@/components/books/ChapterLangTabs'
import { ChapterTaxonomy } from '@/components/books/ChapterTaxonomy'

interface Props {
  params: Promise<{ slug: string; chapter: string }>
}

export async function generateStaticParams() {
  const params: { slug: string; chapter: string }[] = []
  for (const book of getBooks()) {
    const chapters = getChaptersByBook(book.slug)
    for (const ch of chapters) {
      params.push({ slug: book.slug, chapter: String(ch.number) })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: chNum } = await params
  const book = getBookBySlug(slug)
  if (!book) return {}
  const ch = getChapter(slug, parseInt(chNum, 10))
  return {
    title: ch ? `${ch.title_en} — ${book.title_en}` : book.title_en,
    description: `${parseInt(chNum, 10) === 0 ? `Introduction to` : `Chapter ${chNum} of`} ${book.title_en} by ${book.author_name_en}.`,
  }
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter: chNum } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()

  const chapterNumber = parseInt(chNum, 10)
  const ch = getChapter(slug, chapterNumber)
  if (!ch) notFound()

  const allChapters = getChaptersByBook(slug)
  const idx = allChapters.findIndex((c) => c.number === chapterNumber)
  const prevChapter = idx > 0 ? allChapters[idx - 1] : null
  const nextChapter = idx < allChapters.length - 1 ? allChapters[idx + 1] : null
  const isIntro = chapterNumber === 0
  const nonIntroCount = allChapters.filter((c) => c.number !== 0).length

  function chapterLabel(num: number, title: string) {
    return num === 0 ? title : `${num}. ${title}`
  }

  function estimateReadingTime(html: string | undefined): number {
    if (!html) return 0
    const text = html.replace(/<[^>]+>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 220))
  }
  const readMinutes = estimateReadingTime(ch.content_en)

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/books" className="hover:text-iw-text">Books</Link>
        <span className="mx-2">/</span>
        <Link href={`/books/${slug}`} className="hover:text-iw-text">{book.title_en}</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{isIntro ? 'Introduction' : `Ch. ${chapterNumber}`}</span>
      </nav>

      <div className="flex gap-10 xl:gap-16">
        {/* Sidebar: Chapter list */}
        {allChapters.length > 1 && (
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-28">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-iw-text-muted">
                Chapters
              </p>
              <nav className="max-h-[70vh] space-y-0.5 overflow-y-auto border-l border-iw-border/60 pl-3">
                {allChapters.map((c) => (
                  <Link
                    key={c.number}
                    href={`/books/${slug}/${c.number}`}
                    className={`block py-1 text-[13px] leading-snug transition-colors ${
                      c.number === chapterNumber
                        ? 'font-medium text-iw-accent'
                        : 'text-iw-text-muted hover:text-iw-accent'
                    }`}
                  >
                    {chapterLabel(c.number, c.title_en)}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="mb-8">
            <p className="text-sm text-iw-text-muted">
              {isIntro
                ? 'Editorial Introduction'
                : `Chapter ${chapterNumber} of ${nonIntroCount}`}
              {readMinutes > 0 && (
                <span className="before:mx-2 before:content-['·']">{readMinutes} min read</span>
              )}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">{ch.title_en}</h1>
            {ch.title_ar && (
              <p className="arabic-text mt-2 text-lg text-white/80" dir="rtl" lang="ar">
                {ch.title_ar}
              </p>
            )}
          </header>

          {/* Language tabs: EN / AR / ID */}
          <ChapterLangTabs
            contentEn={ch.content_en}
            contentAr={ch.content_ar}
            contentId={ch.content_id}
          />

          {/* Taxonomy: tags, refs (hidden if empty) */}
          <ChapterTaxonomy
            subjectTags={ch.subject_tags}
            topicTags={ch.topic_tags}
            keywords={ch.keywords}
            peopleRefs={ch.people_refs}
            ayahRefs={ch.ayah_refs}
            hadithRefs={ch.hadith_refs}
          />

          {/* Prev/next */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-iw-border pt-6">
            {prevChapter ? (
              <Link
                href={`/books/${slug}/${prevChapter.number}`}
                className="group rounded-lg border border-iw-border p-4 transition-colors hover:border-iw-text-muted/20"
              >
                <span className="text-xs text-iw-text-muted">Previous</span>
                <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
                  {chapterLabel(prevChapter.number, prevChapter.title_en)}
                </p>
              </Link>
            ) : <div />}
            {nextChapter ? (
              <Link
                href={`/books/${slug}/${nextChapter.number}`}
                className="group rounded-lg border border-iw-border p-4 text-right transition-colors hover:border-iw-text-muted/20"
              >
                <span className="text-xs text-iw-text-muted">Next</span>
                <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
                  {chapterLabel(nextChapter.number, nextChapter.title_en)}
                </p>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  )
}
