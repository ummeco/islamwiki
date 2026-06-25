/**
 * FILE: pages/review/ReviewQueuePage.tsx
 * PURPOSE: Moderation queue — lists articles with status=pending_review.
 *   Moderators see theology check status, author, and time pending.
 *   Implements all 7 UI states.
 * REF: P2-E3-W02-S02-T01 · spec §7.3
 */

import { useQuery } from 'urql';
import { Link } from 'react-router-dom';
import DataState, { type UIState } from '../../components/shared/DataState.tsx';
import type { IwArticle } from '../../types/article.ts';

const GET_QUEUE = `
  query GetModerationQueue {
    iw_articles(where: { status: { _eq: "pending_review" } }, order_by: { created_at: asc }) {
      id slug title status language created_at
      category { id slug name }
      revisions: iw_article_revisions(order_by: { created_at: desc }, limit: 1) {
        id created_at
        author { id display_name }
        theology_checks: iw_theology_checks(order_by: { created_at: desc }, limit: 1) {
          id status flags completed_at
        }
      }
    }
  }
`;

type TheologyStatus = 'pending' | 'passed' | 'failed' | 'needs_review';

const THEOLOGY_BADGE: Record<TheologyStatus, { label: string; class: string }> = {
  pending: { label: 'Checking…', class: 'bg-yellow-50 text-yellow-700' },
  passed: { label: '✓ Passed', class: 'bg-green-50 text-green-700' },
  failed: { label: '✗ Failed', class: 'bg-red-50 text-red-700' },
  needs_review: { label: '⚠ Needs Review', class: 'bg-orange-50 text-orange-700' },
};

export default function ReviewQueuePage() {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_QUEUE });

  const articles: IwArticle[] =
    (data as { iw_articles: IwArticle[] } | null)?.iw_articles ?? [];

  function deriveState(): UIState {
    if (!navigator.onLine) return 'offline';
    if (fetching) return 'loading';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'RATE_LIMITED')) return 'rate-limited';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'PERMISSION_DENIED')) return 'permission-denied';
    if (error) return 'error';
    if (articles.length === 0) return 'empty';
    return 'populated';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="https://islam.wiki" className="text-brand-dark font-semibold text-sm">
            ← Islam.wiki
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium text-sm">Review Queue</span>
        </div>
        <button
          type="button"
          onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
          className="text-sm text-brand-on-light hover:text-brand-dark"
        >
          Refresh
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderation Queue</h1>

        <DataState
          state={deriveState()}
          error={error ? new Error(error.message) : null}
          emptyMessage="No articles pending review. 🎉"
          onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })}
          loadingLabel="Loading review queue…"
        >
          <div className="space-y-3">
            {articles.map((article) => {
              const latestRevision = article.revisions?.[0];
              const theologyCheck = (latestRevision as { theology_checks?: { status: TheologyStatus }[] } | undefined)
                ?.theology_checks?.[0];
              const theologyStatus = (theologyCheck?.status ?? 'pending') as TheologyStatus;
              const badge = THEOLOGY_BADGE[theologyStatus];

              return (
                <Link
                  key={article.id}
                  to={`/review/${article.slug}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-mid transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate">{article.title}</h2>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {article.category && <span>{article.category.name}</span>}
                        {article.language === 'ar' && (
                          <span className="font-arabic">عربي</span>
                        )}
                        {latestRevision?.author && (
                          <span>by {latestRevision.author.display_name}</span>
                        )}
                        <span>
                          {new Date(article.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </DataState>
      </main>
    </div>
  );
}
