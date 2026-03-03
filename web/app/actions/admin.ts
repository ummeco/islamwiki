'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { getUserById, updateUser } from '@/lib/data/users'
import { updateRevisionStatus } from '@/lib/data/revisions'

// ── Update Trust Level ──

export async function updateTrustLevel(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 4) return

  const userId = formData.get('user_id') as string
  const trustLevel = Number(formData.get('trust_level'))

  if (!userId || isNaN(trustLevel) || trustLevel < 0 || trustLevel > 5) return

  if (trustLevel === 5 && session.trustLevel < 5) return

  const target = getUserById(userId)
  if (!target) return
  if (target.trust_level >= session.trustLevel && session.trustLevel < 5) return

  updateUser(userId, { trust_level: trustLevel as 0 | 1 | 2 | 3 | 4 | 5 })
  revalidatePath('/admin/users')
}

// ── Update Role ──

export async function updateRole(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 4) return

  const userId = formData.get('user_id') as string
  const role = formData.get('role') as string

  const validRoles = ['user', 'editor', 'moderator', 'admin', 'owner']
  if (!userId || !validRoles.includes(role)) return

  if (role === 'owner' && session.trustLevel < 5) return

  const target = getUserById(userId)
  if (!target) return

  updateUser(userId, { role: role as 'user' | 'editor' | 'moderator' | 'admin' | 'owner' })
  revalidatePath('/admin/users')
}

// ── Ban/Unban User ──

export async function toggleBan(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 3) return

  const userId = formData.get('user_id') as string
  const target = getUserById(userId)
  if (!target) return

  if (target.trust_level >= session.trustLevel) return

  updateUser(userId, { banned: !target.banned })
  revalidatePath('/admin/users')
}

// ── Admin Approve Edit ──

export async function adminApproveEdit(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 2) return

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

  if (!result) return

  revalidatePath(`/${contentType === 'article' ? 'articles' : contentType}/${contentSlug}`)
  revalidatePath('/admin/edits')
}

// ── Admin Reject Edit ──

export async function adminRejectEdit(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || session.trustLevel < 2) return

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
    reason || 'Rejected by moderator'
  )

  if (!result) return

  revalidatePath('/admin/edits')
}
