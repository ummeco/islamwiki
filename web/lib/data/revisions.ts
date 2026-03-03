import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

// ── Types ──

export interface Revision {
  id: string
  content_type: string
  content_slug: string
  content_title: string
  content: string
  editor_id: string
  editor_name: string
  edit_summary: string
  status: 'approved' | 'pending' | 'rejected'
  reviewed_by?: string
  rejection_reason?: string
  ai_review?: {
    verdict: 'pass' | 'flag' | 'reject'
    confidence: number
    issues: string[]
  }
  created_at: string
}

export interface CreateRevisionInput {
  content_type: string
  content_slug: string
  content_title: string
  content: string
  editor_id: string
  editor_name: string
  edit_summary: string
  status: 'approved' | 'pending'
}

// ── Paths ──

const REVISIONS_DIR = path.join(process.cwd(), 'data/revisions')

function revisionDir(contentType: string, slug: string): string {
  return path.join(REVISIONS_DIR, contentType, slug)
}

// ── Helpers ──

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function readRevisionFile(filePath: string): Revision | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Public API ──

export function getRevisions(
  contentType: string,
  slug: string
): Revision[] {
  const dir = revisionDir(contentType, slug)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  const revisions: Revision[] = []

  for (const file of files) {
    const rev = readRevisionFile(path.join(dir, file))
    if (rev) revisions.push(rev)
  }

  return revisions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getRevisionByTimestamp(
  contentType: string,
  slug: string,
  timestamp: string
): Revision | null {
  const filePath = path.join(
    revisionDir(contentType, slug),
    `${timestamp}.json`
  )
  return readRevisionFile(filePath)
}

export function createRevision(input: CreateRevisionInput): Revision {
  const dir = revisionDir(input.content_type, input.content_slug)
  ensureDir(dir)

  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-')
  const id = `rev-${timestamp}`

  const revision: Revision = {
    id,
    content_type: input.content_type,
    content_slug: input.content_slug,
    content_title: input.content_title,
    content: input.content,
    editor_id: input.editor_id,
    editor_name: input.editor_name,
    edit_summary: input.edit_summary,
    status: input.status,
    created_at: now.toISOString(),
  }

  const filePath = path.join(dir, `${timestamp}.json`)
  fs.writeFileSync(filePath, JSON.stringify(revision, null, 2), 'utf-8')

  return revision
}

export function updateRevisionStatus(
  contentType: string,
  slug: string,
  revisionId: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  rejectionReason?: string
): Revision | null {
  const dir = revisionDir(contentType, slug)
  if (!fs.existsSync(dir)) return null

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(dir, file)
    const rev = readRevisionFile(filePath)
    if (rev && rev.id === revisionId) {
      rev.status = status
      rev.reviewed_by = reviewerId
      if (rejectionReason) rev.rejection_reason = rejectionReason
      fs.writeFileSync(filePath, JSON.stringify(rev, null, 2), 'utf-8')
      return rev
    }
  }

  return null
}

export function getRecentRevisions(limit: number = 50): Revision[] {
  const all: Revision[] = []

  if (!fs.existsSync(REVISIONS_DIR)) return all

  const types = fs.readdirSync(REVISIONS_DIR)
  for (const type of types) {
    const typePath = path.join(REVISIONS_DIR, type)
    if (!fs.statSync(typePath).isDirectory()) continue

    const slugs = fs.readdirSync(typePath)
    for (const slug of slugs) {
      const slugPath = path.join(typePath, slug)
      if (!fs.statSync(slugPath).isDirectory()) continue

      const files = fs.readdirSync(slugPath).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        const rev = readRevisionFile(path.join(slugPath, file))
        if (rev) all.push(rev)
      }
    }
  }

  return all
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit)
}

export function getPendingRevisions(): Revision[] {
  return getRecentRevisions(500).filter((r) => r.status === 'pending')
}

export function updateRevisionAIReview(
  contentType: string,
  slug: string,
  revisionId: string,
  aiReview: { verdict: 'pass' | 'flag' | 'reject'; confidence: number; issues: string[] }
): Revision | null {
  const dir = revisionDir(contentType, slug)
  if (!fs.existsSync(dir)) return null

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(dir, file)
    const rev = readRevisionFile(filePath)
    if (rev && rev.id === revisionId) {
      rev.ai_review = aiReview
      fs.writeFileSync(filePath, JSON.stringify(rev, null, 2), 'utf-8')
      return rev
    }
  }

  return null
}
