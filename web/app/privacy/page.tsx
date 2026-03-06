import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Islam.wiki privacy policy. How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-iw-text-muted">Last updated: March 6, 2026</p>
      </div>

      <div className="space-y-8 text-iw-text-secondary leading-relaxed">
        <p>
          Islam.wiki (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the islam.wiki website. This page describes how we collect, use, and protect your personal data when you use our services.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Information We Collect</h2>
          <p className="mb-2">We collect information you provide directly:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Account information:</strong> email address, name, and profile details when you create an account.</li>
            <li><strong className="text-white/90">Reading history:</strong> articles, Quran ayahs, and hadith you view, to provide bookmarks and reading history features.</li>
            <li><strong className="text-white/90">Usage data:</strong> pages visited, search queries, and interaction patterns to improve our services.</li>
            <li><strong className="text-white/90">Device information:</strong> device type, operating system, and browser type for compatibility.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Provide and maintain our services, including Quran, Hadith, and Islamic reference content.</li>
            <li>Sync your bookmarks, reading history, and preferences across devices.</li>
            <li>Send transactional emails (account verification, password resets).</li>
            <li>Improve search results and content recommendations.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Data Sharing</h2>
          <p className="mb-2">We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-white/90">Service providers:</strong> hosting (Vercel, Hetzner), email delivery (Elastic Email), and analytics services that help us operate.</li>
            <li><strong className="text-white/90">Legal requirements:</strong> if required by law, subpoena, or legal process.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Third-Party Authentication</h2>
          <p>If you sign in using Google, Apple, Facebook, or X (Twitter), we receive your name and email from that provider. We do not access your contacts, posts, or other social data unless you explicitly grant permission.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Data Storage and Security</h2>
          <p>Your data is stored on servers located in the European Union (Hetzner, Germany). We use encryption in transit (TLS) and at rest. We retain your data for as long as your account is active. You can request deletion at any time.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Delete your account and all associated data.</li>
            <li>Export your data in a portable format.</li>
            <li>Withdraw consent for optional data processing.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use advertising cookies or third-party tracking cookies.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Children&rsquo;s Privacy</h2>
          <p>Our services are not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected data from a child, please contact us.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">Contact Us</h2>
          <p>
            If you have questions about this privacy policy, contact us at{' '}
            <a href="mailto:privacy@islam.wiki" className="text-iw-accent transition-colors hover:text-iw-accent-light">
              privacy@islam.wiki
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 flex justify-center gap-6 text-sm text-iw-text-muted">
        <a href="/terms" className="transition-colors hover:text-iw-accent">Terms of Service</a>
        <a href="/" className="transition-colors hover:text-iw-accent">Back to Islam.wiki</a>
      </div>
    </div>
  )
}
