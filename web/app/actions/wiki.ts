'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { submitRevision, reviewRevision, saveAIReviewResult } from '@/lib/contributor/revisions'
import { reviewContent } from '@/lib/ai/review'
import { getAvailableProviderCount } from '@/lib/ai/service'

// ── Submit Edit ──

export async function submitEdit(
  _prevState: { error?: string; success?: boolean; status?: string } | undefined,
  formData: FormData
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect('/account')
  }

  const contentType = formData.get('content_type') as string
  const contentSlug = formData.get('content_slug') as string
  const contentTitle = formData.get('content_title') as string
  const newContent = formData.get('content') as string
  const previousContent = formData.get('previous_content') as string | null
  const editSummary = formData.get('edit_summary') as string

  if (!contentType || !contentSlug || !newContent) {
    return { error: 'Missing required fields.' }
  }

  if (!editSummary || editSummary.trim().length < 3) {
    return { error: 'Please provide an edit summary (at least 3 characters).' }
  }

  try {
    const revision = await submitRevision({
      contentType,
      contentSlug,
      editorId: session.userId,
      editorUsername: session.username || session.email || 'Anonymous',
      previousContent: previousContent ?? null,
      newContent,
      changeSummary: editSummary.trim(),
      editorTrustScore: ({ 0: 0, 1: 10, 2: 50, 3: 150, 4: 500, 5: 500 } as Record<number, number>)[session.trustLevel] ?? 0,
    })

    // Trigger AI review for trust level 0–1 edits if providers are available
    if (revision.status === 'pending' && getAvailableProviderCount() > 0) {
      triggerAIReview(revision.id, contentTitle, newContent, contentType).catch(() => {
        // AI review is best-effort — don't block submission
      })
    }

    // Revalidate the content page if auto-approved
    if (revision.status === 'approved') {
      const pathType = contentType === 'article' ? 'articles' : contentType
      revalidatePath(`/${pathType}/${contentSlug}`)
    }

    return { success: true, status: revision.status }
  } catch (err) {
    console.error('submitEdit error:', err)
    return { error: 'Failed to submit edit. Please try again.' }
  }
}

// Fire-and-forget AI review — saves result to DB, auto-rejects on 'reject' verdict
async function triggerAIReview(
  revisionId: string,
  contentTitle: string,
  content: string,
  contentType: string
): Promise<void> {
  const result = await reviewContent(contentTitle, content, contentType)
  const score = Math.round(result.confidence * 100)
  await saveAIReviewResult(revisionId, score, result.summary, result.verdict === 'reject')
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

  try {
    await reviewRevision(revisionId, session.userId, 'approved')
    const pathType = contentType === 'article' ? 'articles' : contentType
    revalidatePath(`/${pathType}/${contentSlug}`)
    return { success: true }
  } catch {
    return { error: 'Revision not found or update failed.' }
  }
}

// ── Reject Edit ──

export async function rejectEdit(formData: FormData) {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 2) {
    return { error: 'Insufficient permissions.' }
  }

  const revisionId = formData.get('revision_id') as string

  try {
    await reviewRevision(revisionId, session.userId, 'denied')
    return { success: true }
  } catch {
    return { error: 'Revision not found or update failed.' }
  }
}
