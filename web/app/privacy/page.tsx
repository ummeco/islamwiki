import type { Metadata } from 'next'
import Link from 'next/link'

// LAST_UPDATED: 2026-04-25
// DRAFT — under legal review. Shipping for development purposes; will be replaced before public launch.

export const metadata: Metadata = {
  title: 'Privacy Policy — Islam.wiki',
  description: 'Islam.wiki privacy policy. How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Draft banner */}
      <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        <strong>DRAFT</strong> — This policy is under legal review (2026-04-25). Published for development purposes; will be replaced before public launch.
      </div>

      <div className="mb-12">
        <Link href="/" className="mb-6 inline-block text-sm text-iw-text-muted hover:text-iw-accent transition-colors">
          ← Back to Islam.wiki
        </Link>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-iw-text-muted">Last updated: April 25, 2026</p>
      </div>

      <div className="space-y-8 text-iw-text-secondary leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">1. Who We Are</h2>
          <p>
            Islam.wiki is operated by <strong className="text-white/90">Ummat</strong>, an Islamic technology organization (501(c)(3) application pending). We operate <a href="https://islam.wiki" className="text-iw-accent underline">islam.wiki</a>, an authoritative Islamic knowledge base covering Quran, Hadith, Seerah, biographies, and classical Islamic scholarship.
          </p>
          <p className="mt-2">
            <strong className="text-white/90">Data controller:</strong> Ummat &mdash; <a href="mailto:privacy@ummat.dev" className="text-iw-accent underline">privacy@ummat.dev</a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">2. What We Collect</h2>
          <p className="mb-2">Data you provide:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Account information:</strong> email address and display name when you create an account.</li>
            <li><strong className="text-white/90">Bookmarks and reading history:</strong> Quran ayahs, hadith, articles, and people pages you save, to sync across your devices.</li>
            <li><strong className="text-white/90">Contributions:</strong> wiki edits, article submissions, and corrections you submit (attributed to your account or anonymously per your choice).</li>
          </ul>
          <p className="mb-2 mt-4">Data collected automatically:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Search queries:</strong> search terms entered, to improve search relevance. Not linked to your identity unless you are signed in.</li>
            <li><strong className="text-white/90">Usage data:</strong> pages visited, features used, session duration.</li>
            <li><strong className="text-white/90">Device information:</strong> device type, OS version, browser type and version.</li>
            <li><strong className="text-white/90">IP address:</strong> used for rate limiting and geographic routing. Not stored beyond 30 days in server logs.</li>
          </ul>
          <p className="mt-4">
            We do <strong className="text-white/90">not</strong> sell your data. We do <strong className="text-white/90">not</strong> build advertising profiles.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">3. How We Use It</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Deliver Quran, Hadith, Seerah, and Islamic reference content.</li>
            <li>Sync bookmarks, reading history, and preferences across your devices.</li>
            <li>Improve search results and content quality.</li>
            <li>Send transactional emails (account verification, password reset).</li>
            <li>Detect and prevent abuse, spam edits, and security incidents.</li>
            <li>Comply with applicable law.</li>
          </ul>
          <p className="mt-3">
            <strong className="text-white/90">GDPR lawful basis:</strong> contract performance, legitimate interests (security, quality improvement), legal obligation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">4. Who We Share With</h2>
          <p className="mb-3">We share data only with these service providers:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-white/50">
                  <th className="pb-2 text-left pr-4">Vendor</th>
                  <th className="pb-2 text-left pr-4">Purpose</th>
                  <th className="pb-2 text-left">Country / Safeguard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr><td className="py-2 pr-4">Hetzner Online GmbH</td><td className="py-2 pr-4">Server hosting</td><td className="py-2">Germany (EU)</td></tr>
                <tr><td className="py-2 pr-4">Vercel Inc.</td><td className="py-2 pr-4">Web hosting</td><td className="py-2">USA/EU — SCCs</td></tr>
                <tr><td className="py-2 pr-4">Cloudflare Inc.</td><td className="py-2 pr-4">CDN, DNS</td><td className="py-2">USA/EU — SCCs</td></tr>
                <tr><td className="py-2 pr-4">Elastic Email Inc.</td><td className="py-2 pr-4">Transactional email</td><td className="py-2">USA/EU — SCCs</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            Full sub-processor list: <a href="https://ummat.pro/legal/sub-processors" className="text-iw-accent underline">ummat.pro/legal/sub-processors</a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">5. Your Rights</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Access</strong> — request a copy of all data we hold about you.</li>
            <li><strong className="text-white/90">Correct</strong> — ask us to fix inaccurate data.</li>
            <li><strong className="text-white/90">Delete</strong> — request deletion of your account and data.</li>
            <li><strong className="text-white/90">Port</strong> — receive your data in a machine-readable format.</li>
            <li><strong className="text-white/90">Restrict / Object</strong> — limit or object to certain processing.</li>
          </ul>
          <p className="mt-3">
            GDPR / UK-GDPR: Articles 15&ndash;22 apply. Response within 30 days. CCPA/CPRA: we do not sell your data.
          </p>
          <p className="mt-2">
            Email: <a href="mailto:privacy@ummat.dev" className="text-iw-accent underline">privacy@ummat.dev</a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">6. Children</h2>
          <p>
            Islam.wiki is not directed at children under 13 (US) or under 16 (EU). We do not knowingly collect data from minors below these ages. Contact <a href="mailto:privacy@ummat.dev" className="text-iw-accent underline">privacy@ummat.dev</a> if you believe a child has provided data.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">7. Retention</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Account and bookmark data: until deletion + 30-day grace period.</li>
            <li>Server logs (incl. IP): 30 days.</li>
            <li>Wiki contribution history: retained indefinitely (part of the public record, associated with username or anonymized).</li>
            <li>Anonymized analytics: up to 24 months.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">8. International Transfers</h2>
          <p>
            Our servers are in <strong className="text-white/90">Falkenstein, Germany (EU)</strong> via Hetzner. Some providers operate in the USA; transfers are covered by Standard Contractual Clauses (EU 2021/914, Module 2).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">9. Security</h2>
          <p>
            TLS 1.3 for all data in transit, encryption at rest for sensitive fields, role-based access control. Security disclosures: <a href="mailto:security@ummat.dev" className="text-iw-accent underline">security@ummat.dev</a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">10. Contact</h2>
          <p>
            Privacy: <a href="mailto:privacy@ummat.dev" className="text-iw-accent underline">privacy@ummat.dev</a><br />
            Security: <a href="mailto:security@ummat.dev" className="text-iw-accent underline">security@ummat.dev</a><br />
            <br />
            <strong className="text-white/90">Ummat</strong> (501(c)(3) application pending) &mdash; United States
          </p>
        </section>

        {/* C-07b: Recent Updates — appended 2026-04-30 */}
        <section className="rounded-lg border border-iw-accent/20 bg-iw-accent/5 px-5 py-4">
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Recent Updates (2026-04-25)</h2>
          <p className="mb-2 text-sm opacity-60">The following changes reflect P3 platform decisions that took effect April 2026:</p>
          <ul className="list-disc space-y-2 pl-6 text-sm">
            <li>
              <strong className="text-white/90">Analytics — PostHog removed:</strong> PostHog is no longer used on any Ummeco product (decision D-P3-21). Islam.wiki uses only self-hosted <strong className="text-white/90">Umami</strong> for privacy-preserving, cookieless analytics. Umami does not fingerprint users or share data with third parties.
            </li>
            <li>
              <strong className="text-white/90">AI features:</strong> Islam.wiki does not currently use AI processing that sends personal data to external AI providers. This policy will be updated if AI features are added.
            </li>
          </ul>
        </section>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-iw-text-muted">
          <Link href="/terms" className="mr-4 hover:text-iw-accent transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-iw-accent transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  )
}
