/**
 * FILE: components/editor/RevisionHistory.tsx
 * PURPOSE: Sidebar showing list of article revisions with diff toggle.
 * INPUTS: articleId (uuid string)
 * REF: P2-E3-W02-S02-T01 · spec §7.2 §11.2
 */

import { useState } from 'react';
import { useQuery } from 'urql';
import RevisionDiff from './RevisionDiff.tsx';

const GET_REVISIONS = `
  query GetRevisions($article_id: uuid!) {
    iw_article_revisions(
      where: { article_id: { _eq: $article_id } }
      order_by: { created_at: desc }
      limit: 20
    ) {
      id content_md created_at
      author { id display_name }
    }
  }
`;

interface Revision {
  id: string;
  content_md: string;
  created_at: string;
  author?: { id: string; display_name: string } | null;
}

interface RevisionHistoryProps {
  articleId: string;
}

export default function RevisionHistory({ articleId }: RevisionHistoryProps) {
  const [diffPair, setDiffPair] = useState<[Revision, Revision] | null>(null);

  const [{ data, fetching }] = useQuery({
    query: GET_REVISIONS,
    variables: { article_id: articleId },
  });

  const revisions: Revision[] =
    (data as { iw_article_revisions: Revision[] } | null)?.iw_article_revisions ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-700 text-sm">Revision History</h2>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {fetching ? (
          <div className="p-4 text-sm text-gray-500">Loading revisions…</div>
        ) : revisions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No revisions yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {revisions.map((revision, i) => {
              const prev = revisions[i + 1];

              return (
                <li key={revision.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {revision.author?.display_name ?? 'Unknown'}
                      </p>
                      <time className="text-xs text-gray-500" dateTime={revision.created_at}>
                        {new Date(revision.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    {prev && (
                      <button
                        type="button"
                        onClick={() =>
                          setDiffPair(diffPair?.[0].id === revision.id ? null : [revision, prev])
                        }
                        className="text-xs text-brand-on-light hover:text-brand-dark shrink-0"
                      >
                        {diffPair?.[0].id === revision.id ? 'Hide diff' : 'Diff'}
                      </button>
                    )}
                  </div>

                  {diffPair?.[0].id === revision.id && prev && (
                    <div className="mt-2">
                      <RevisionDiff revisionA={diffPair[0]} revisionB={diffPair[1]} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
