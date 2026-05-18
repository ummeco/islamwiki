import type { Metadata } from 'next'
import Link from 'next/link'

// T04-LEGAL-COUNSEL-PACK: Islam.wiki Open Source Attribution
// Auto-generated from pnpm licenses list on 2026-05-16.
// Regenerate with: cd islamwiki/web && pnpm licenses list --json
// DRAFT — counsel review pending (U-15).
// LAST_UPDATED: 2026-05-16

export const metadata: Metadata = {
  title: 'Open Source Attribution — Islam.wiki',
  description:
    'Open source software licenses and attribution for Islam.wiki.',
  robots: { index: false }, // U-15 gate
}

// License summary generated from pnpm licenses list on 2026-05-16.
const LICENSE_SUMMARY = [
  { type: 'MIT', count: 1698 },
  { type: 'Apache-2.0', count: 246 },
  { type: 'ISC', count: 83 },
  { type: 'BSD-3-Clause', count: 44 },
  { type: 'BSD-2-Clause', count: 23 },
  { type: 'BlueOak-1.0.0', count: 8 },
  { type: 'MPL-2.0', count: 5 },
  { type: 'BSD', count: 2 },
  { type: 'MIT-0', count: 2 },
  { type: 'CC0-1.0', count: 2 },
  { type: '0BSD', count: 2 },
  { type: 'Unlicense', count: 3 },
  { type: 'FSL-1.1-MIT', count: 2 },
  { type: 'CC-BY-4.0', count: 1 },
  { type: 'LGPL-3.0-or-later', count: 1 },
  { type: 'Other / Dual-licensed', count: 9 },
]

// Notable packages with non-permissive or notable licenses
const NOTABLE = [
  {
    name: 'TypeScript',
    license: 'Apache-2.0',
    homepage: 'https://www.typescriptlang.org',
    author: 'Microsoft',
  },
  {
    name: 'React',
    license: 'MIT',
    homepage: 'https://react.dev',
    author: 'Meta Platforms, Inc.',
  },
  {
    name: 'Next.js',
    license: 'MIT',
    homepage: 'https://nextjs.org',
    author: 'Vercel',
  },
  {
    name: 'Tailwind CSS',
    license: 'MIT',
    homepage: 'https://tailwindcss.com',
    author: 'Tailwind Labs',
  },
  {
    name: 'DOMPurify',
    license: 'MPL-2.0 OR Apache-2.0 (dual)',
    homepage: 'https://github.com/cure53/DOMPurify',
    author: 'Cure53',
  },
  {
    name: 'Axe Core',
    license: 'MPL-2.0',
    homepage: 'https://github.com/dequelabs/axe-core',
    author: 'Deque Systems',
  },
  {
    name: 'sharp / @img/sharp-libvips-darwin-arm64',
    license: 'Apache-2.0 / LGPL-3.0-or-later',
    homepage: 'https://sharp.pixelplumbing.com',
    author: 'Lovell Fuller',
  },
  {
    name: 'caniuse-lite',
    license: 'CC-BY-4.0',
    homepage: 'https://github.com/browserslist/caniuse-lite',
    author: 'Ben Briggs',
  },
  {
    name: '@sentry/cli',
    license: 'FSL-1.1-MIT (Functional Source License)',
    homepage: 'https://sentry.io',
    author: 'Sentry',
  },
]

export default function AttributionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Draft gate */}
      <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        <strong>DRAFT — Not yet effective.</strong> Counsel copy pending (U-15). Committed for development review only.
      </div>

      <Link href="/legal" className="mb-8 inline-block text-sm opacity-60 hover:opacity-90 transition-opacity">
        &larr; Legal
      </Link>

      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Open Source Attribution</h1>
      <p className="mt-3 mb-2 text-sm opacity-50">Islam.wiki — Ummeco, LLC</p>
      <p className="mb-10 opacity-70 max-w-2xl text-sm leading-relaxed">
        Islam.wiki is built with open source software. We are grateful to the developers and
        organizations who make their work available under open source licenses.
        Generated from dependency manifest on 2026-05-16.
      </p>

      <div className="space-y-10 text-sm leading-relaxed opacity-80">

        <section>
          <h2 className="text-xl font-semibold mb-4">License Summary</h2>
          <p className="text-sm opacity-60 mb-4">
            Total runtime and development dependencies by license type.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-6 font-medium opacity-60">License</th>
                  <th className="text-left py-2 font-medium opacity-60">Packages</th>
                </tr>
              </thead>
              <tbody>
                {LICENSE_SUMMARY.map(({ type, count }) => (
                  <tr key={type} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-6 font-mono text-xs opacity-80">{type}</td>
                    <td className="py-2 opacity-50">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Notable Packages</h2>
          <p className="mb-4">
            Key dependencies and their applicable licenses.
          </p>
          <div className="space-y-3">
            {NOTABLE.map(({ name, license, homepage, author }) => (
              <div key={name} className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <a
                      href={homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {name}
                    </a>
                    {author && (
                      <span className="text-xs opacity-40 ml-2">by {author}</span>
                    )}
                  </div>
                  <span className="font-mono text-xs opacity-50 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                    {license}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Full Dependency List</h2>
          <p>
            A complete machine-readable list of all dependencies and their licenses is available
            by running the following command from the Islam.wiki web directory:
          </p>
          <pre className="mt-3 text-xs bg-black/5 dark:bg-white/5 rounded-lg p-4 opacity-60 overflow-x-auto">
            pnpm licenses list
          </pre>
          <p className="mt-3">
            License texts for all dependencies are included in their respective{' '}
            <code>node_modules</code> directories and are available in our source repository.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">License Texts</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2 opacity-60">
            {[
              ['MIT License', 'https://opensource.org/licenses/MIT'],
              ['Apache License 2.0', 'https://www.apache.org/licenses/LICENSE-2.0'],
              ['ISC License', 'https://opensource.org/licenses/ISC'],
              ['BSD-3-Clause License', 'https://opensource.org/licenses/BSD-3-Clause'],
              ['BSD-2-Clause License', 'https://opensource.org/licenses/BSD-2-Clause'],
              ['Mozilla Public License 2.0', 'https://www.mozilla.org/en-US/MPL/2.0/'],
              ['GNU Lesser GPL 3.0', 'https://www.gnu.org/licenses/lgpl-3.0.html'],
              ['Creative Commons BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
              ['Blue Oak Model License', 'https://blueoakcouncil.org/license/1.0.0'],
              ['The Unlicense', 'https://unlicense.org'],
            ].map(([label, url]) => (
              <li key={label}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p>
            For open source license inquiries:{' '}
            <a href="mailto:legal@ummat.dev" className="text-emerald-700 dark:text-emerald-400 hover:underline">
              legal@ummat.dev
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
