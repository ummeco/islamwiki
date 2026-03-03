'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { createRevision, updateRevisionStatus, type Revision } from '@/lib/data/revisions'
import { reviewContent } from '@/lib/ai/review'
import { getAvailableProviderCount } from '@/lib/ai/service'

// ── Submit Edit ──

export async function submitEdit(
  _prevState: { error?: string; success?: boolean; status?: string } | undefined,
  formData: FormData
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect('/signin')
  }

  const contentType = formData.get('content_type') as string
  const contentSlug = formData.get('content_slug') as string
  const contentTitle = formData.get('content_title') as string
  const content = formData.get('content') as string
  const editSummary = formData.get('edit_summary') as string

  if (!contentType || !contentSlug || !content) {
    return { error: 'Missing required fields.' }
  }

  if (!editSummary || editSummary.trim().length < 3) {
    return { error: 'Please provide an edit summary (at least 3 characters).' }
  }

  // Determine auto-approve based on trust level
  let status: 'approved' | 'pending' = 'pending'

  if (session.trustLevel >= 2) {
    // Editors and above: auto-approve
    status = 'approved'
  } else if (session.trustLevel === 1) {
    // Trusted users: auto-approve minor edits (<100 chars change)
    status = 'pending'
  }
  // Level 0: always pending

  const revision = createRevision({
    content_type: contentType,
    content_slug: contentSlug,
    content_title: contentTitle,
    content,
    editor_id: session.userId,
    editor_name: session.username,
    edit_summary: editSummary.trim(),
    status,
  })

  // Trigger AI review for trust level 0-1 edits if providers are available
  if (session.trustLevel <= 1 && getAvailableProviderCount() > 0) {
    triggerAIReview(revision).catch(() => {
      // AI review is best-effort, don't block the edit submission
    })
  }

  // Revalidate the content page
  if (status === 'approved') {
    revalidatePath(`/${contentType === 'article' ? 'articles' : contentType}/${contentSlug}`)
  }

  return {
    success: true,
    status: revision.status,
  }
}

// Fire-and-forget AI review
async function triggerAIReview(revision: Revision): Promise<void> {
  const result = await reviewContent(
    revision.content_title,
    revision.content,
    revision.content_type
  )

  // Update the revision with AI review data using fs
  // This is done through the data layer
  const { updateRevisionAIReview } = await import('@/lib/data/revisions')
  updateRevisionAIReview(
    revision.content_type,
    revision.content_slug,
    revision.id,
    {
      verdict: result.verdict,
      confidence: result.confidence,
      issues: result.issues,
    }
  )
}

// ── Approve Edit ──

export async function approveEdit(formData: FormData) {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 2) {
    return { error: 'Insufficient permissions.' }
  }

  const contentType = formData.get('content_type') as string
  const contentSlug = formData.get('content_slug') as string
  const revisionId = formData.get('revision_id') as string

  const result = updateRevisionStatus(
    contentType,
    contentSlug,
    revisionId,
    'approved',
    session.userId
  )

  if (!result) {
    return { error: 'Revision not found.' }
  }

  revalidatePath(`/${contentType === 'article' ? 'articles' : contentType}/${contentSlug}`)

  return { success: true }
}

// ── Reject Edit ──

export async function rejectEdit(formData: FormData) {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 2) {
    return { error: 'Insufficient permissions.' }
  }

  const contentType = formData.get('content_type') as string
  const contentSlug = formData.get('content_slug') as string
  const revisionId = formData.get('revision_id') as string
  const reason = formData.get('reason') as string

  const result = updateRevisionStatus(
    contentType,
    contentSlug,
    revisionId,
    'rejected',
    session.userId,
    reason
  )

  if (!result) {
    return { error: 'Revision not found.' }
  }

  return { success: true }
}
