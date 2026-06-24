/**
 * FILE: pages/editor/EditPage.tsx
 * PURPOSE: Main article editor page. Loads article by slug, renders TipTap editor,
 *   handles auto-save, submit-for-review, revision history sidebar.
 *   Implements all 7 UI states via DataState.
 * INPUTS: slug (string | undefined — undefined means list of user's drafts)
 * REF: P2-E3-W02-S02-T01 · spec §7.2
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'urql';
import DataState, { type UIState } from '../../components/shared/DataState.tsx';
import RichTextEditor, { type SavePayload } from '../../components/editor/RichTextEditor.tsx';
import RevisionHistory from '../../components/editor/RevisionHistory.tsx';
import { triggerTheologyCheck } from '../../lib/publishArticle.ts';
import type { IwArticle } from '../../types/article.ts';

const GET_ARTICLE = `
  query GetArticleForEdit($slug: String!) {
    iw_articles(where: { slug: { _eq: $slug } }) {
      id slug title status language category_id created_at
      category { id slug name }
      tags { tag { id slug name } }
      revisions: iw_article_revisions(order_by: { created_at: desc }, limit: 20) {
        id content_md content_html created_at
        author { id display_name }
        theology_checks: iw_theology_checks(order_by: { created_at: desc }, limit: 1) {
          id status flags created_at completed_at
        }
      }
    }
  }
`;

const SAVE_DRAFT = `
  mutation SaveDraft($article_id: uuid!, $content_md: String!, $content_html: String!) {
    insert_iw_article_revisions_one(object: {
      article_id: $article_id, content_md: $content_md, content_html: $content_html
    }) { id created_at }
  }
`;

const SUBMIT_FOR_REVIEW = `
  mutation SubmitForReview($article_id: uuid!, $content_md: String!, $content_html: String!) {
    revision: insert_iw_article_revisions_one(object: {
      article_id: $article_id, content_md: $content_md, content_html: $content_html
    }) { id article_id created_at }
    article: update_iw_articles_by_pk(
      pk_columns: { id: $article_id }
      _set: { status: "pending_review" }
    ) { id status }
  }
`;

interface EditPageProps {
  slug?: string;
}

export default function EditPage({ slug }: EditPageProps) {
  const [editorContent, setEditorContent] = useState<SavePayload | null>(null);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_ARTICLE,
    variables: { slug },
    pause: !slug,
  });

  const [, saveDraft] = useMutation(SAVE_DRAFT);
  const [, submitForReview] = useMutation(SUBMIT_FOR_REVIEW);

  const article: IwArticle | undefined = (data as { iw_articles: IwArticle[] } | null)
    ?.iw_articles?.[0];

  const latestRevision = article?.revisions?.[0];

  const handleSaveDraft = useCallback(
    async (payload: SavePayload) => {
      if (!article) return;
      setSaveStatus('saving');
      const result = await saveDraft({
        article_id: article.id,
        content_md: payload.content_md,
        content_html: payload.content_html,
      });
      setSaveStatus(result.error ? 'error' : 'saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    [article, saveDraft]
  );

  const handleSubmitForReview = useCallback(async () => {
    if (!article || !editorContent) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitForReview({
        article_id: article.id,
        content_md: editorContent.content_md,
        content_html: editorContent.content_html,
      });

      if (result.error) throw new Error(result.error.message);

      const revisionId = (result.data as { revision: { id: string } } | null)?.revision?.id;
      if (revisionId) {
        // Trigger async theology check (fire and forget — moderator sees result)
        await triggerTheologyCheck(revisionId);
      }

      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (e) {
      setSubmitError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsSubmitting(false);
    }
  }, [article, editorContent, submitForReview, reexecuteQuery]);

  // Derive UI state
  function deriveState(): UIState {
    if (!navigator.onLine) return 'offline';
    if (fetching) return 'loading';
    if (error?.networkError) return 'error';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'RATE_LIMITED')) return 'rate-limited';
    if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'PERMISSION_DENIED')) return 'permission-denied';
    if (error) return 'error';
    if (!slug || !article) return 'empty';
    return 'populated';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="https://islam.wiki" className="text-brand-dark font-semibold text-sm">
            ← Islam.wiki
          </a>
          {article && (
            <span className="text-gray-400">/</span>
          )}
          {article && (
            <span className="text-gray-700 font-medium text-sm truncate max-w-xs">
              {article.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saveStatus !== 'idle' && (
            <span className={`text-xs ${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save failed'}
            </span>
          )}
          {article?.status === 'draft' && (
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={isSubmitting || !editorContent}
              className="px-4 py-1.5 bg-brand-mid text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          )}
          {article?.status === 'pending_review' && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Pending Review
            </span>
          )}
          {article?.status === 'published' && (
            <a
              href={`https://islam.wiki/wiki/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-mid hover:text-brand-dark"
            >
              View published →
            </a>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DataState
          state={deriveState()}
          error={submitError ?? (error ? new Error(error.message) : null)}
          emptyMessage={slug ? `Article "${slug}" not found.` : 'Select an article to edit.'}
          onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })}
        >
          {article && (
            <div className="flex gap-6">
              {/* Editor column */}
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {article.language === 'ar' ? 'Arabic article' : 'English article'} ·{' '}
                    {article.category?.name ?? 'Uncategorized'}
                  </p>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Submission failed: {submitError.message}
                  </div>
                )}

                <RichTextEditor
                  initialContent={latestRevision?.content_html ?? ''}
                  onSave={handleSaveDraft}
                  onChange={setEditorContent}
                  readOnly={article.status === 'pending_review'}
                  placeholder="Start writing the article content here…"
                />
              </div>

              {/* Sidebar: revision history */}
              <aside className="w-72 shrink-0">
                <RevisionHistory articleId={article.id} />
              </aside>
            </div>
          )}
        </DataState>
      </main>
    </div>
  );
}
