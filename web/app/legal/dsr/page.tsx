import type { Metadata } from 'next'
import Link from 'next/link'

// T06-LEGAL-COUNSEL-PACK: Islam.wiki GDPR/CCPA Data Subject Rights (DSR) page
// DRAFT — counsel review pending (U-15). Do not publish before review.
// LAST_UPDATED: 2026-05-18

export const metadata: Metadata = {
  title: 'Your Data Rights — Islam.wiki',
  description:
    'Islam.wiki data subject rights: GDPR access, deletion, portability, and correction requests; CCPA opt-out.',
  robots: { index: false }, // U-15 gate
}

export default function DsrPage() {
  return (
    <main className="min-h-screen" id="main-content">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Draft gate */}
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <strong>DRAFT — Not yet effective.</strong> Counsel review pending (U-15).
        </div>

        <Link href="/legal" className="mb-8 inline-block text-sm opacity-60 hover:opacity-90 transition-opacity">
          &larr; Legal
        </Link>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Your Data Rights</h1>
        <p className="mt-3 mb-10 text-sm opacity-50">
          Islam.wiki — Ummeco, LLC · Effective: pending counsel review
        </p>

        <div className="space-y-10 leading-relaxed text-sm opacity-80">

          <section className="rounded-xl border border-[#79C24C]/30 bg-[#1E5E2F]/30 px-6 py-5">
            <p>
              Islam.wiki primarily serves unauthenticated readers and collects minimal personal
              data. We collect standard web server logs (IP address, user agent, referrer) and
              optional account data for registered contributors. This page explains your rights
              under GDPR (EEA/UK) and CCPA (California).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Rights You Have</h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                { right: 'Access', desc: 'Request a copy of personal data we hold about you.' },
                { right: 'Deletion', desc: 'Request deletion of your personal data, including any contributor account.' },
                { right: 'Portability', desc: 'Receive your data in a structured, machine-readable format.' },
                { right: 'Correction', desc: 'Request correction of inaccurate personal data.' },
                { right: 'Opt-out', desc: 'We do not sell personal data. CCPA opt-out available on request.' },
              ].map(({ right, desc }) => (
                <li key={right} className="flex gap-2">
                  <span className="font-semibold text-[#C9F27A] w-24 shrink-0">{right}</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Submit a Request</h2>
            <p>
              Email{' '}
              <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] hover:underline">
                privacy@ummat.dev
              </a>{' '}
              with subject line &ldquo;DSR Request — Islam.wiki — [right type]&rdquo;.
              We will respond within 30 days (GDPR) or 45 days (CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">What Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Server access logs (IP address, pages visited, timestamps) — retained 30 days</li>
              <li>Contributor accounts: email, username, contributions — retained until deletion requested</li>
              <li>Search queries — anonymised, not linked to identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p>
              <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] hover:underline">
                privacy@ummat.dev
              </a>
            </p>
          </section>

          <section className="border-t border-white/10 pt-6">
            <ul className="space-y-1">
              <li><Link href="/privacy" className="text-[#79C24C] hover:underline">Privacy Policy</Link></li>
              <li><Link href="/legal/attribution" className="text-[#79C24C] hover:underline">Open Source Attribution</Link></li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
