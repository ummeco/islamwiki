/**
 * FILE: lib/publishArticle.ts
 * PURPOSE: Approve an article revision and purge Vercel CDN cache for the article path.
 *   Called by the moderator's ApproveRejectBar after ApproveRevision mutation succeeds.
 *   Cache purge ensures the Astro SSR read surface serves fresh content within ~1s.
 * INPUTS: slug, revision_id, article_id
 * OUTPUTS: void (throws on failure)
 * CONSTRAINTS:
 *   - Cache purge via /api/purge-cache server endpoint (never expose VERCEL_TOKEN client-side).
 *   - Both /wiki/[slug] and /ar/wiki/[slug] paths purged for bilingual articles.
 * REF: P2-E3-W02-S02-T01 · spec §5.2 §7.3
 */

import { createUrqlClient } from '@ummat/graphql-client';

const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ?? 'https://api.ummat.dev/v1/graphql';

const client = createUrqlClient({ url: graphqlUrl });

const APPROVE_MUTATION = `
  mutation ApproveRevision($revision_id: uuid!, $article_id: uuid!) {
    update_iw_articles_by_pk(
      pk_columns: { id: $article_id }
      _set: { status: "published", published_revision_id: $revision_id }
    ) { id status published_revision_id slug }
  }
`;

interface ApproveResult {
  update_iw_articles_by_pk: {
    id: string;
    status: string;
    published_revision_id: string;
    slug: string;
  };
}

/**
 * Approve a revision and purge the Astro SSR cache for the article.
 * Hard rule: caller must verify theology_check.status !== 'failed' before calling.
 */
export async function approveAndPurgeCache(params: {
  revision_id: string;
  article_id: string;
  slug: string;
}): Promise<void> {
  const { revision_id, article_id, slug } = params;

  // 1. Approve revision via GraphQL mutation
  const result = await client.mutation(APPROVE_MUTATION, { revision_id, article_id });

  if (result.error) {
    throw new Error(`Approve mutation failed: ${result.error.message}`);
  }

  // 2. Purge Vercel edge cache via server-side endpoint
  //    The actual VERCEL_TOKEN lives server-side in an Astro/Worker endpoint —
  //    never exposed client-side.
  const purgeResponse = await fetch('/api/purge-cache', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paths: [`/wiki/${slug}`, `/ar/wiki/${slug}`],
    }),
  });

  if (!purgeResponse.ok) {
    // Cache purge failure is non-fatal — the 5-minute TTL will expire naturally.
    console.warn(`Cache purge failed for /wiki/${slug} — will expire via TTL`);
  }
}

/**
 * Trigger theology check for a revision after submission.
 * Called immediately after PublishRevision mutation.
 */
export async function triggerTheologyCheck(revisionId: string): Promise<string | null> {
  const TRIGGER_MUTATION = `
    mutation TriggerTheologyCheck($revision_id: uuid!) {
      iw_trigger_theology_check(args: { revision_id: $revision_id }) { check_id }
    }
  `;

  const result = await client.mutation(TRIGGER_MUTATION, { revision_id: revisionId });

  if (result.error) {
    console.error('Theology check trigger failed:', result.error.message);
    return null;
  }

  const data = result.data as { iw_trigger_theology_check: { check_id: string } } | null;
  return data?.iw_trigger_theology_check.check_id ?? null;
}
