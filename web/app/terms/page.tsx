import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Islam.wiki terms of service. Rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-iw-text-muted">Last updated: March 6, 2026</p>
      </div>

      <div className="space-y-8 text-iw-text-secondary leading-relaxed">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Islam.wiki website operated by Islam.wiki (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By using our services, you agree to these terms.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">1. Acceptance of Terms</h2>
          <p>By accessing or using Islam.wiki, you agree to be bound by these Terms. If you do not agree, do not use our services.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">2. Accounts</h2>
          <p>To use certain features (bookmarks, reading history, contributions), you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">3. Acceptable Use</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Use the service for any unlawful purpose.</li>
            <li>Post content that is offensive, hateful, or violates the rights of others.</li>
            <li>Attempt to gain unauthorized access to our systems or other users&rsquo; accounts.</li>
            <li>Use automated tools to scrape or collect data from our services without permission.</li>
            <li>Interfere with the proper operation of the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">4. Islamic Content</h2>
          <p>Islam.wiki provides Islamic content (Quran, Hadith, tafsir, scholarly articles) for informational and educational purposes. While we strive for accuracy by sourcing from established Islamic scholars and institutions, this content should not be considered a substitute for personal scholarly guidance. Consult qualified scholars for specific religious rulings.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">5. User Contributions</h2>
          <p>If you contribute content (edits, annotations, corrections), you grant us a non-exclusive, worldwide license to display and distribute your contributions within the service. All contributions are subject to editorial review. We may remove contributions that violate these terms or our content standards.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">6. Third-Party Services</h2>
          <p>Islam.wiki integrates with third-party services (Google Sign-In, Apple Sign-In). Your use of those services is governed by their respective terms. We are not responsible for third-party service availability or practices.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">7. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these terms. You may delete your account at any time through account settings. Upon deletion, your personal data will be removed in accordance with our{' '}
            <a href="/privacy" className="text-iw-accent transition-colors hover:text-iw-accent-light">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">8. Disclaimers</h2>
          <p>Our services are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">9. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Islam.wiki shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">10. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify you of significant changes.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">11. Governing Law</h2>
          <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the State of Ohio.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-iw-accent">12. Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
            <a href="mailto:legal@islam.wiki" className="text-iw-accent transition-colors hover:text-iw-accent-light">
              legal@islam.wiki
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 flex justify-center gap-6 text-sm text-iw-text-muted">
        <a href="/privacy" className="transition-colors hover:text-iw-accent">Privacy Policy</a>
        <a href="/" className="transition-colors hover:text-iw-accent">Back to Islam.wiki</a>
      </div>
    </div>
  )
}
