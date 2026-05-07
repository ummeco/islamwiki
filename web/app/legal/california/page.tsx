import type { Metadata } from 'next'
import Link from 'next/link'

// S05-10: CCPA disclosure page — islam.wiki
// Islam.wiki-specific: no user accounts = minimal data collection.
// TODO(U-15): Replace placeholder copy with counsel-reviewed text before publishing.
// DO NOT publish to prod until U-15 is resolved (TRAP-P6 do-not-publish rule).
// LAST_UPDATED: 2026-05-06

export const metadata: Metadata = {
  title: 'California Privacy Rights — Islam.wiki',
  description: 'California Consumer Privacy Act (CCPA/CPRA) disclosure for Islam.wiki.',
  robots: { index: false }, // U-15: unpublished until counsel review
}

export default function CaliforniaPrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Draft — do not publish until U-15 resolved */}
      <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        <strong>DRAFT — Not yet effective.</strong> Counsel copy pending (U-15). Committed for development review only. Do not link from production footers until U-15 is resolved.
      </div>

      <Link href="/privacy" className="mb-8 inline-block text-sm text-iw-text-muted hover:text-iw-accent transition-colors">
        &larr; Back to Privacy Policy
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">California Privacy Rights</h1>
      <p className="mt-3 mb-4 text-sm text-iw-text-muted">
        California Consumer Privacy Rights Act (CPRA/CCPA) — Last updated: May 6, 2026
      </p>
      <p className="mb-10 text-iw-text-secondary max-w-2xl text-sm leading-relaxed">
        Islam.wiki is a free, public Islamic knowledge base. <strong className="text-white/80">No account is required to use Islam.wiki</strong>, and we collect minimal personal information.
        {/* TODO(U-15): Insert full legal entity details. */}
      </p>

      {/* Do Not Sell — prominent */}
      <div className="mb-10 rounded-xl border border-iw-border bg-iw-surface px-6 py-6">
        <h2 className="text-base font-semibold text-white mb-2">Do Not Sell or Share My Personal Information</h2>
        <p className="text-sm text-iw-text-muted mb-4">
          {/* TODO(U-15): Confirm with counsel. */}
          Ummeco, LLC does not sell personal information to third parties.
        </p>
        <a
          href="mailto:privacy@ummat.dev?subject=CPRA%20Opt-Out%20Request&body=Full%20name%3A%0AEmail%3A%0ARequest%3A%20Do%20not%20sell%20or%20share%20my%20personal%20information."
          className="inline-flex items-center gap-2 rounded-lg bg-iw-accent px-5 py-2.5 text-sm font-medium text-[#0D2F17] hover:opacity-90 transition-opacity"
        >
          Submit Opt-Out Request — privacy@ummat.dev
        </a>
      </div>

      <div className="space-y-10 text-iw-text-secondary leading-relaxed text-sm">

        <section>
          <h2 className="text-xl font-semibold text-iw-accent mb-3">Categories of Personal Information We Collect</h2>
          {/* TODO(U-15): Verify with counsel. Islam.wiki minimal-data posture simplifies this table. */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-iw-text-muted font-medium">Category</th>
                  <th className="text-left py-2 pr-4 text-iw-text-muted font-medium">Examples</th>
                  <th className="text-left py-2 text-iw-text-muted font-medium">Collected?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Identifiers', 'IP address (server logs), session ID', 'Yes — server logs only'],
                  ['Internet activity', 'Pages viewed, search queries (aggregated)', 'Yes — aggregated'],
                  ['Account information', 'None — no accounts required', 'No'],
                  ['Geolocation', 'Country/region via IP (coarse, not GPS)', 'Yes'],
                  ['Commercial information', 'None — free service, no payments', 'No'],
                  ['Sensitive personal information', 'None collected', 'No'],
                  ['Inferences', 'No user profiles drawn', 'No'],
                ].map(([cat, ex, col]) => (
                  <tr key={cat} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-white/80">{cat}</td>
                    <td className="py-2 pr-4 text-iw-text-muted">{ex}</td>
                    <td className={`py-2 font-medium text-xs ${col.startsWith('Yes') ? 'text-iw-accent' : 'text-white/30'}`}>{col}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-iw-accent mb-3">Your California Rights</h2>
          <h3 className="text-base font-semibold text-white mt-4">Right to Know</h3>
          <p>You may request disclosure of the categories and specific pieces of personal information we have collected about you.</p>
          <h3 className="text-base font-semibold text-white mt-4">Right to Delete</h3>
          <p>You may request deletion of server log data that includes your IP address, subject to security and legal obligations.</p>
          <h3 className="text-base font-semibold text-white mt-4">Right to Opt-Out of Sale or Sharing</h3>
          <p>We do not sell personal information. The opt-out link above is provided for completeness.</p>
          <h3 className="text-base font-semibold text-white mt-4">Right to Non-Discrimination</h3>
          <p>We will not discriminate against you for exercising your CPRA rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-iw-accent mb-3">How to Submit a Request</h2>
          <p>Email <a href="mailto:privacy@ummat.dev" className="text-iw-accent hover:underline">privacy@ummat.dev</a> with subject &quot;CPRA Request&quot;.</p>
          <p className="mt-2">We respond within 45 days. Up to two free requests per 12-month period.</p>
        </section>

        <section className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white mb-3">Related</h2>
          <ul className="space-y-1">
            <li><Link href="/privacy" className="text-iw-accent hover:underline">Privacy Policy</Link></li>
            <li><Link href="/preferences" className="text-iw-accent hover:underline">Manage Cookie Preferences</Link></li>
          </ul>
        </section>
      </div>
    </div>
  )
}
