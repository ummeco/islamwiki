import type { Metadata } from 'next'
import Link from 'next/link'
import { getSurahs } from '@/lib/data/quran'
import { surahTranslit } from '@/lib/quran-utils'

export const metadata: Metadata = {
  title: 'Quran Statistics',
  description:
    'Detailed statistics about the Holy Quran — 114 surahs, 6,236 verses, Meccan and Medinan breakdown, juz distribution, and more.',
  robots: { index: false },
}

export default function QuranStatsPage() {
  const surahs = getSurahs()

  const totalVerses = surahs.reduce((s, q) => s + q.verses_count, 0)
  const totalWords = surahs.reduce((s, q) => s + (q.word_count ?? 0), 0)
  const meccan = surahs.filter((s) => s.revelation_type === 'meccan')
  const medinan = surahs.filter((s) => s.revelation_type === 'medinan')
  const meccanVerses = meccan.reduce((s, q) => s + q.verses_count, 0)
  const medinanVerses = medinan.reduce((s, q) => s + q.verses_count, 0)

  // Top 10 longest surahs by verse count
  const top10 = [...surahs].sort((a, b) => b.verses_count - a.verses_count).slice(0, 10)

  // Juz → surahs starting in that juz
  const juzesByNumber: Record<number, typeof surahs> = {}
  for (let j = 1; j <= 30; j++) juzesByNumber[j] = []
  for (const s of surahs) {
    juzesByNumber[s.juz_start].push(s)
  }

  const statCards = [
    { label: 'Surahs (Chapters)', value: '114', sub: '86 Meccan · 28 Medinan' },
    { label: 'Ayahs (Verses)', value: totalVerses.toLocaleString(), sub: `${meccanVerses.toLocaleString()} Meccan · ${medinanVerses.toLocaleString()} Medinan` },
    { label: 'Words', value: totalWords.toLocaleString(), sub: 'Approximate (Uthmani script)' },
    { label: 'Juz (Parts)', value: '30', sub: '604 Mushaf pages' },
    { label: 'Meccan Surahs', value: `${meccan.length}`, sub: `${((meccan.length / 114) * 100).toFixed(1)}% of all chapters` },
    { label: 'Medinan Surahs', value: `${medinan.length}`, sub: `${((medinan.length / 114) * 100).toFixed(1)}% of all chapters` },
  ]

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">Statistics</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Quran Statistics</h1>
        <p className="mt-2 text-iw-text-secondary">
          Numerical overview of the Holy Quran — surahs, verses, revelation type, and structure.
        </p>
      </div>

      {/* 6 stat cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-iw-border bg-iw-surface p-5"
          >
            <div className="text-3xl font-bold text-iw-accent">{card.value}</div>
            <div className="mt-1 text-sm font-medium text-white">{card.label}</div>
            <div className="mt-0.5 text-xs text-iw-text-muted">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Meccan / Medinan breakdown */}
      <div className="mb-10 rounded-xl border border-iw-border bg-iw-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Revelation Type</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-iw-text-muted">
              <span>Meccan</span>
              <span>{((meccan.length / 114) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-iw-border">
              <div
                className="h-full rounded-full bg-iw-accent"
                style={{ width: `${(meccan.length / 114) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-iw-text-secondary">
              {meccan.length} surahs · {meccanVerses.toLocaleString()} verses
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-iw-text-muted">
              <span>Medinan</span>
              <span>{((medinan.length / 114) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-iw-border">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(medinan.length / 114) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-iw-text-secondary">
              {medinan.length} surahs · {medinanVerses.toLocaleString()} verses
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 longest surahs */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Top 10 Longest Surahs</h2>
        <div className="overflow-hidden rounded-xl border border-iw-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-iw-border bg-iw-surface">
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">#</th>
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">Surah</th>
                <th className="px-4 py-3 text-right font-medium text-iw-text-muted">Verses</th>
                <th className="hidden px-4 py-3 text-right font-medium text-iw-text-muted sm:table-cell">Words</th>
                <th className="hidden px-4 py-3 text-center font-medium text-iw-text-muted sm:table-cell">Type</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((s) => (
                <tr key={s.number} className="border-b border-iw-border/50 transition-colors hover:bg-iw-surface/60">
                  <td className="px-4 py-3 text-iw-text-muted">{s.number}</td>
                  <td className="px-4 py-3">
                    <Link href={`/quran/${s.number}`} className="font-medium text-white hover:text-iw-accent">
                      {surahTranslit(s.name_transliteration)}
                    </Link>
                    <span className="ml-2 text-xs text-iw-text-secondary">({s.name_en})</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-iw-text">{s.verses_count}</td>
                  <td className="hidden px-4 py-3 text-right font-mono text-iw-text-secondary sm:table-cell">
                    {s.word_count?.toLocaleString() ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${s.revelation_type === 'meccan' ? 'bg-iw-accent/15 text-iw-accent' : 'bg-blue-500/15 text-blue-400'}`}>
                      {s.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Juz table — 30 rows */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Juz (Parts) Overview</h2>
        <div className="overflow-hidden rounded-xl border border-iw-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-iw-border bg-iw-surface">
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">Juz</th>
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">Starts in</th>
                <th className="hidden px-4 py-3 text-right font-medium text-iw-text-muted sm:table-cell">Surahs starting here</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                const startingSurahs = juzesByNumber[juz]
                const firstSurah = surahs.find((s) => s.juz_start === juz)
                return (
                  <tr key={juz} className="border-b border-iw-border/50 transition-colors hover:bg-iw-surface/60">
                    <td className="px-4 py-3">
                      <Link href={`/quran/juz/${juz}`} className="font-medium text-iw-accent hover:underline">
                        Juz {juz}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-iw-text-secondary">
                      {firstSurah ? `${surahTranslit(firstSurah.name_transliteration)} (${firstSurah.name_en})` : '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-iw-text-muted sm:table-cell">
                      {startingSurahs.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All surahs table — 114 rows */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">All Surahs</h2>
        <div className="overflow-hidden rounded-xl border border-iw-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-iw-border bg-iw-surface">
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">#</th>
                <th className="px-4 py-3 text-start font-medium text-iw-text-muted">Name</th>
                <th className="px-4 py-3 text-right font-medium text-iw-text-muted">Verses</th>
                <th className="hidden px-4 py-3 text-right font-medium text-iw-text-muted sm:table-cell">Juz</th>
                <th className="hidden px-4 py-3 text-right font-medium text-iw-text-muted sm:table-cell">Page</th>
                <th className="hidden px-4 py-3 text-center font-medium text-iw-text-muted sm:table-cell">Type</th>
              </tr>
            </thead>
            <tbody>
              {surahs.map((s) => (
                <tr key={s.number} className="border-b border-iw-border/50 transition-colors hover:bg-iw-surface/60">
                  <td className="px-4 py-2.5 text-iw-text-muted">{s.number}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/quran/${s.number}`} className="font-medium text-white hover:text-iw-accent">
                      {surahTranslit(s.name_transliteration)}
                    </Link>
                    <span className="ml-1.5 text-xs text-iw-text-muted">{s.name_en}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-iw-text">{s.verses_count}</td>
                  <td className="hidden px-4 py-2.5 text-right text-iw-text-secondary sm:table-cell">{s.juz_start}</td>
                  <td className="hidden px-4 py-2.5 text-right text-iw-text-secondary sm:table-cell">{s.page_start}</td>
                  <td className="hidden px-4 py-2.5 text-center sm:table-cell">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${s.revelation_type === 'meccan' ? 'bg-iw-accent/15 text-iw-accent' : 'bg-blue-500/15 text-blue-400'}`}>
                      {s.revelation_type === 'meccan' ? 'M' : 'MD'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
