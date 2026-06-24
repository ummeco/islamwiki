/**
 * FILE: pages/admin/AdminPage.tsx
 * PURPOSE: Admin dashboard — placeholder with basic stats and links.
 *   Full admin functionality is in scope for E-04.
 * REF: P2-E3-W02-S02-T01 · spec §3.2 surface map
 */

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <a href="https://islam.wiki" className="text-brand-dark font-semibold text-sm">
          ← Islam.wiki
        </a>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 font-medium text-sm">Admin</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/review"
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-brand-mid transition-colors"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Review Queue</h2>
            <p className="text-sm text-gray-500">Review articles pending moderation approval.</p>
          </a>

          <a
            href="/edit/new"
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-brand-mid transition-colors"
          >
            <h2 className="font-semibold text-gray-900 mb-1">New Article</h2>
            <p className="text-sm text-gray-500">Create a new article in the wiki.</p>
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Full admin features (user management, theology check settings) are in scope for E-04.
        </p>
      </main>
    </div>
  );
}
