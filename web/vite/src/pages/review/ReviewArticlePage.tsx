/**
 * FILE: pages/review/ReviewArticlePage.tsx
 * PURPOSE: Review a single article — article preview, revision diff, theology check,
 *   approve/reject controls.
 *   Hard rule: approve is BLOCKED if theology_check.status === 'failed'.
 * INPUTS: slug (string)
 * REF: P2-E3-W02-S02-T01 · spec §7.3 §8
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import { useNavigate } from 'react-router-dom';
import DataState, { type UIState } from '../../components/shared/DataState.tsx';
import ModerationPanel from '../../components/review/ModerationPanel.tsx';
import ArticlePreview from '../../components/shared/ArticlePreview.tsx';
import type { IwArticle } from '../../types/article.ts';
import { approveAndPurgeCache } from '../../lib/publishArticle.ts';

const GET_ARTICLE_FOR_REVIEW = `
  query GetArticleForReview($slug: String!) {
    iw_articles(where: { slug: { _eq: $slug }, status: { _eq: "pending_review" } }) {
      id slug title status language created_at
      category { id slug name }
      published_revision {
        id content_html content_md created_at
      }
      revisions: iw_article_revisions(order_by: { created_at: desc }, limit: 1) {
        id content_html content_md created_at
        author { id display_name }
        theology_checks: iw_theology_checks(order_by: { created_at: desc }, limit: 1) {
          id status flags created_at completed_at
        }
      }
    }
  }
`;

const REJECT_MUTATION = `
  mutation RejectRevision($revision_id: uuid!, $article_id: uuid!, $review_note: String!) {
    update_iw_article_revisions_by_pk(pk_columns: { id: $revision_id }, _set: { review_note: $review_note }) { id }
    update_iw_articles_by_pk(pk_columns: { id: $article_id }, _set: { status: "rejected" }) { id status }
  }
`;

interface ReviewArticlePageProps {
  slug: string;
}

export default function ReviewArticlePage({ slug }: ReviewArticlePageProps) {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<Error | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_ARTICLE_FOR_REVIEW,
    variables: { slug },
  });

  const [, rejectMutation] = useMutation(REJECT_MUTATION);

  const article: IwArticle | undefined = (data as { iw_articles: IwArticle[] } | null)
    ?.iw_articles?.[0];

  const latestRevision = article?.revisions?.[0] as
    | (typeof article.revisions extends (infer R)[] | undefined ? R : never)
    | undefined;

  const theologyCheck = (latestRevision as { theology_checks?: { id: string; status: string; flags?: string[] }[] } | undefined)
    ?.theology_checks?.[0];

  const theologyFailed = theologyCheck?.status === 'failed';

  async function handleApprove() {
    if (!article || !latestRevision) return;
    if (theologyFailed) {
      setActionError(new Error('Cannot approve — theology check failed. The contributor must revise and resubmit.'));
      return;
    }

    setIsActioning(true);
    setActionError(null);

    try {
      await approveAndPurgeCache({
        revision_id: latestRevision.id,
        article_id: article.id,
        slug: article.slug,
      });
      navigate('/review');
    } catch (e) {
      setActionError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsActioning(false);
    }
  }

  async function handleReject(reviewNote: string) {
    if (!article || !latestRevision) return;

    setIsActioning(true);
    setActionError(null);

    try {
      const result = await rejectMutation({
        revision_id: latestRevision.id,
        article_id: article.id,
        review_note: reviewNote,
      });

      if (result.error) throw new Error(result.error.message);
      navigate('/review');
    } catch (e) {
      setActionError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsActioning(false);
    }
  }

  function deriveState(): UIState {
    if (!navigator.onLine) return 'offline';
    if (fetching) return 'loading';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'RATE_LIMITED')) return 'rate-limited';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'PERMISSION_DENIED')) return 'permission-denied';
    if (error) return 'error';
    if (!article) return 'empty';
    return 'populated';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <a href="/review" className="text-brand-dark font-semibold text-sm">
          ← Review Queue
        </a>
        {article && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium text-sm truncate max-w-xs">
              {article.title}
            </span>
          </>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <DataState
          state={deriveState()}
          error={actionError ?? (error ? new Error(error.message) : null)}
          emptyMessage="Article not found or not pending review."
          onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })}
        >
          {article && latestRevision && (
            <div className="flex gap-6">
              {/* Article preview */}
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by {(latestRevision as { author?: { display_name: string } }).author?.display_name ?? 'Unknown'} ·{' '}
                    {new Date(latestRevision.created_at).toLocaleDateString()}
                  </p>
                </div>

                {actionError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700" role="alert">
                    {actionError.message}
                  </div>
                )}

                <ArticlePreview
                  contentHtml={latestRevision.content_html}
                  language={article.language}
                />
              </div>

              {/* Moderation sidebar */}
              <aside className="w-80 shrink-0">
                <ModerationPanel
                  revisionId={latestRevision.id}
                  theologyCheck={theologyCheck ?? null}
                  theologyFailed={theologyFailed}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isActioning={isActioning}
                />
              </aside>
            </div>
          )}
        </DataState>
      </main>
    </div>
  );
}
