import type { Metadata } from 'next'
import Link from 'next/link'

// LAST_UPDATED: 2026-04-25
// DRAFT — under legal review. Shipping for development purposes; will be replaced before public launch.

export const metadata: Metadata = {
  title: 'Cookie Policy — Islam.wiki',
  description: 'Islam.wiki cookie policy. What cookies we use and how to control them.',
}

export default function CookiesPage() {
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
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Cookie Policy</h1>
        <p className="mt-3 text-sm text-iw-text-muted">Last updated: April 25, 2026</p>
      </div>

      <div className="space-y-8 text-iw-text-secondary leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">What Are Cookies</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. We use them to keep you signed in, remember your reading preferences, and understand how visitors use the site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Cookies We Use</h2>

          <h3 className="mb-2 mt-4 font-semibold text-white/80">Essential cookies (always active)</h3>
          <p className="mb-3 text-sm">Required for Islam.wiki to function. You cannot opt out.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-white/50">
                  <th className="pb-2 text-left pr-4">Name</th>
                  <th className="pb-2 text-left pr-4">Purpose</th>
                  <th className="pb-2 text-left">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr><td className="py-2 pr-4 font-mono text-xs">um_session</td><td className="py-2 pr-4">Keeps you signed in</td><td className="py-2">Session / 30 days</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-xs">um_csrf</td><td className="py-2 pr-4">Cross-site request forgery protection</td><td className="py-2">Session</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-xs">um_consent</td><td className="py-2 pr-4">Stores your cookie preference</td><td className="py-2">1 year</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-xs">iw_reading</td><td className="py-2 pr-4">Reading preferences (font size, translation)</td><td className="py-2">1 year</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 mt-6 font-semibold text-white/80">Analytics cookies (opt-in only)</h3>
          <p className="text-sm">
            Privacy-respecting analytics to understand how visitors use Islam.wiki — which sections are most read, what searches are common. Only fires after your consent. We do not use Google Analytics or advertising-network trackers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Third-Party Cookies</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Cloudflare</strong> may set <code className="text-xs bg-white/10 px-1 rounded">__cf_bm</code> for bot detection (strictly necessary).</li>
          </ul>
          <p className="mt-3">We do not allow advertising networks to set cookies on Islam.wiki.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Your Choices</h2>
          <p>
            On your first visit we show a consent banner. Choose &ldquo;Accept all&rdquo; or &ldquo;Essential only&rdquo;. Change your preference at any time via cookie settings in the footer. Clearing your browser cookies will reset your choice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Contact</h2>
          <p>
            Questions: <a href="mailto:privacy@ummat.dev" className="text-iw-accent underline">privacy@ummat.dev</a>
          </p>
        </section>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-iw-text-muted">
          <Link href="/privacy" className="mr-4 hover:text-iw-accent transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-iw-accent transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
