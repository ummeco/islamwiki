import 'server-only'
import { hasuraAdmin } from '@/lib/hasura-admin'
import { canAutoApprove, calcDiffSizePct, getTrustLevel } from './trust'

export interface Revision {
  id: string
  content_type: string
  content_slug: string
  content_id: string | null
  editor_id: string
  editor_username: string
  previous_content: string | null
  new_content: string
  change_summary: string | null
  status: 'pending' | 'approved' | 'denied' | 'reverted'
  auto_approved: boolean
  reviewed_by: string | null
  reviewed_at: string | null
  ai_review_score: number | null
  ai_review_summary: string | null
  is_minor: boolean
  diff_size_pct: number | null
  created_at: string
  updated_at: string
}

export async function submitRevision(params: {
  contentType: string
  contentSlug: string
  contentId?: string
  editorId: string
  editorUsername: string
  previousContent: string | null
  newContent: string
  changeSummary?: string
  isMinor?: boolean
  editorTrustScore?: number
}): Promise<Revision> {
  const isMinor = params.isMinor ?? false
  const diffSizePct = calcDiffSizePct(params.previousContent, params.newContent)
  const editorLevel = getTrustLevel(params.editorTrustScore ?? 0)
  const autoApproved = canAutoApprove(editorLevel, isMinor, diffSizePct)
  const status = autoApproved ? 'approved' : 'pending'

  const mutation = `
    mutation SubmitRevision($obj: iw_wiki_revisions_insert_input!) {
      insert_iw_wiki_revisions_one(object: $obj) {
        id content_type content_slug editor_id editor_username
        status auto_approved is_minor diff_size_pct created_at updated_at
        previous_content new_content change_summary reviewed_by reviewed_at
        ai_review_score ai_review_summary content_id
      }
    }
  `
  const data = await hasuraAdmin<{ insert_iw_wiki_revisions_one: Revision }>(mutation, {
    obj: {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_id: params.contentId ?? null,
      editor_id: params.editorId,
      editor_username: params.editorUsername,
      previous_content: params.previousContent,
      new_content: params.newContent,
      change_summary: params.changeSummary ?? null,
      is_minor: isMinor,
      diff_size_pct: diffSizePct,
      status,
      auto_approved: autoApproved,
    },
  })
  return data.insert_iw_wiki_revisions_one
}

export async function getRevisionsByContent(
  contentType: string,
  contentSlug: string,
  limit = 20
): Promise<Revision[]> {
  const query = `
    query GetRevisions($type: String!, $slug: String!, $limit: Int!) {
      iw_wiki_revisions(
        where: { content_type: { _eq: $type }, content_slug: { _eq: $slug } }
        order_by: { created_at: desc }
        limit: $limit
      ) {
        id content_type content_slug editor_id editor_username status
        auto_approved is_minor diff_size_pct created_at updated_at
        previous_content new_content change_summary reviewed_by reviewed_at
        ai_review_score ai_review_summary content_id
      }
    }
  `
  const data = await hasuraAdmin<{ iw_wiki_revisions: Revision[] }>(query, {
    type: contentType,
    slug: contentSlug,
    limit,
  })
  return data.iw_wiki_revisions
}

export async function getPendingRevisions(limit = 50): Promise<Revision[]> {
  const query = `
    query GetPending($limit: Int!) {
      iw_wiki_revisions(
        where: { status: { _eq: "pending" } }
        order_by: { created_at: asc }
        limit: $limit
      ) {
        id content_type content_slug editor_id editor_username status
        auto_approved is_minor diff_size_pct created_at updated_at
        previous_content new_content change_summary reviewed_by reviewed_at
        ai_review_score ai_review_summary content_id
      }
    }
  `
  const data = await hasuraAdmin<{ iw_wiki_revisions: Revision[] }>(query, { limit })
  return data.iw_wiki_revisions
}

export async function reviewRevision(
  revisionId: string,
  reviewerId: string,
  action: 'approved' | 'denied'
): Promise<Revision> {
  const mutation = `
    mutation ReviewRevision($id: bigint!, $status: String!, $reviewer: String!, $now: timestamptz!) {
      update_iw_wiki_revisions_by_pk(
        pk_columns: { id: $id }
        _set: { status: $status, reviewed_by: $reviewer, reviewed_at: $now, updated_at: $now }
      ) {
        id status reviewed_by reviewed_at content_type content_slug
        editor_id new_content previous_content
      }
    }
  `
  const data = await hasuraAdmin<{ update_iw_wiki_revisions_by_pk: Revision }>(mutation, {
    id: revisionId,
    status: action,
    reviewer: reviewerId,
    now: new Date().toISOString(),
  })
  return data.update_iw_wiki_revisions_by_pk
}

export async function getRevisionsByEditor(editorUsername: string, limit = 20): Promise<Revision[]> {
  const query = `
    query GetRevisionsByEditor($username: String!, $limit: Int!) {
      iw_wiki_revisions(
        where: { editor_username: { _eq: $username } }
        order_by: { created_at: desc }
        limit: $limit
      ) {
        id content_type content_slug editor_username status is_minor
        change_summary created_at auto_approved diff_size_pct
      }
    }
  `
  const data = await hasuraAdmin<{ iw_wiki_revisions: Revision[] }>(query, { username: editorUsername, limit })
  return data.iw_wiki_revisions
}

export async function getRecentReviewedRevisions(limit = 50): Promise<Revision[]> {
  const query = `
    query GetRecentReviewed($limit: Int!) {
      iw_wiki_revisions(
        where: { status: { _neq: "pending" } }
        order_by: { reviewed_at: desc }
        limit: $limit
      ) {
        id content_type content_slug editor_id editor_username status
        auto_approved is_minor diff_size_pct created_at updated_at reviewed_at reviewed_by
        change_summary content_id
      }
    }
  `
  const data = await hasuraAdmin<{ iw_wiki_revisions: Revision[] }>(query, { limit })
  return data.iw_wiki_revisions
}

export async function saveAIReviewResult(
  revisionId: string,
  score: number,
  summary: string,
  autoReject: boolean
): Promise<void> {
  const mutation = `
    mutation SaveAIReview($id: bigint!, $set: iw_wiki_revisions_set_input!) {
      update_iw_wiki_revisions_by_pk(pk_columns: { id: $id }, _set: $set) {
        id status
      }
    }
  `
  await hasuraAdmin(mutation, {
    id: revisionId,
    set: {
      ai_review_score: score,
      ai_review_summary: summary,
      ...(autoReject ? { status: 'denied' } : {}),
      updated_at: new Date().toISOString(),
    },
  })
}

export async function getRevisionById(id: string): Promise<Revision | null> {
  const query = `
    query GetRevision($id: bigint!) {
      iw_wiki_revisions_by_pk(id: $id) {
        id content_type content_slug editor_id editor_username status
        auto_approved is_minor diff_size_pct created_at updated_at
        previous_content new_content change_summary reviewed_by reviewed_at
        ai_review_score ai_review_summary content_id
      }
    }
  `
  const data = await hasuraAdmin<{ iw_wiki_revisions_by_pk: Revision | null }>(query, { id })
  return data.iw_wiki_revisions_by_pk
}
