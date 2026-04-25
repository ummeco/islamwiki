/**
 * Islam.wiki Donate page — Phase 1 stub.
 * The shared DonatePage component (ummat/shared/donate) is wired in Phase 2
 * once the Stripe checkout API is live. This page provides a minimal working
 * donate surface in the meantime.
 */
import Link from 'next/link'

export const metadata = {
  title: 'Support Islam.wiki — Keep Islamic Knowledge Free',
  description:
    'Help keep Islam.wiki free and growing. Your donation funds content, search, and hosting.',
}

export default function IslamWikiDonatePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Support Islam.wiki</h1>
      <p className="text-lg text-gray-600 mb-8">
        Islam.wiki is free for everyone — no ads, no paywalls. Your donation keeps the knowledge
        base running and growing for the global Muslim community.
      </p>
      <p className="text-gray-500 mb-6">Online donations are coming soon. Jazakallah khayran.</p>
      <Link href="/" className="text-green-700 hover:underline">
        ← Return to Islam.wiki
      </Link>
    </main>
  )
}
