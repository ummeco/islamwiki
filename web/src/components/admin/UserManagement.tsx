/**
 * UserManagement.tsx — Astro island port of app/admin/users/user-management.tsx
 *
 * PURPOSE: Admin user table — set trust level, set role, ban/unban. Hydrated via client:load
 *   on /admin/users (the user list is rendered server-side and passed in as a prop).
 *
 * CONVERSION (Next → Astro):
 *   - Server actions (updateTrustLevel / updateRole / toggleBan, called via <form action={...}>)
 *     → fetch() POST /api/admin/users with an `action` discriminator
 *     (set_trust_level | set_role | toggle_ban). The route re-verifies the caller's session and
 *     enforces the same rank guards before mutating via lib/data/users.
 * SECURITY: every authorization gate (trustLevel>=4 for trust/role, >=5 for owner, >=3 for ban,
 *   rank guard) is enforced server-side in the route — this island only sends intent. The Hasura
 *   admin secret never reaches the client. On a failed mutation the row is reloaded so the UI
 *   cannot drift from the server's authoritative state.
 * REF: ports app/admin/users/user-management.tsx (auth-interactive migration group)
 */
'use client'

import { useState } from 'react'

export interface UserInfo {
  id: string
  username: string
  display_name: string
  email: string
  role: string
  trust_level: number
  total_edits: number
  approved_edits: number
  banned: boolean
  created_at: string
}

interface Props {
  users: UserInfo[]
}

const TRUST_LABELS = ['New (0)', 'Trusted (1)', 'Editor (2)', 'Moderator (3)', 'Admin (4)', 'Owner (5)']
const ROLE_OPTIONS = ['user', 'editor', 'moderator', 'admin', 'owner']

async function postAction(fields: Record<string, string>): Promise<boolean> {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  try {
    const res = await fetch('/api/admin/users', { method: 'POST', body: fd })
    return res.ok
  } catch {
    return false
  }
}

export function UserManagement({ users }: Props) {
  const [error, setError] = useState<string | null>(null)

  async function run(fields: Record<string, string>) {
    setError(null)
    const ok = await postAction(fields)
    if (ok) {
      // Server is authoritative — reload so the table reflects the committed state.
      window.location.reload()
    } else {
      setError('Action failed. You may not have permission, or the change was rejected.')
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      {users.map((user) => (
        <div
          key={user.id}
          className={`rounded-xl border bg-iw-surface/60 p-4 ${user.banned ? 'border-red-500/30' : 'border-iw-border'}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-iw-text">{user.display_name}</span>
                <span className="text-xs text-iw-text-muted">@{user.username}</span>
                {user.banned && (
                  <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-medium text-red-400">banned</span>
                )}
              </div>
              <div className="mt-1 text-xs text-iw-text-muted">
                {user.email} &middot; Joined {new Date(user.created_at).toLocaleDateString()} &middot;{' '}
                {user.total_edits} edits ({user.approved_edits} approved)
              </div>
            </div>

            {/* Ban toggle */}
            <button
              aria-label="Submit"
              type="button"
              onClick={() => run({ action: 'toggle_ban', user_id: user.id })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                user.banned ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600/80 text-white hover:bg-red-500'
              }`}
            >
              {user.banned ? 'Unban' : 'Ban'}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {/* Trust Level */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const value = (e.currentTarget.elements.namedItem('trust_level') as HTMLSelectElement).value
                run({ action: 'set_trust_level', user_id: user.id, trust_level: value })
              }}
              className="flex items-center gap-2"
            >
              <label className="text-xs text-iw-text-secondary">Trust:</label>
              <select
                name="trust_level"
                defaultValue={user.trust_level}
                aria-label="Trust level"
                className="rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text focus:border-iw-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60"
              >
                {TRUST_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
              <button
                aria-label="Submit"
                type="submit"
                className="rounded bg-iw-accent/15 px-2 py-1 text-xs text-iw-accent hover:bg-iw-accent/25"
              >
                Set
              </button>
            </form>

            {/* Role */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const value = (e.currentTarget.elements.namedItem('role') as HTMLSelectElement).value
                run({ action: 'set_role', user_id: user.id, role: value })
              }}
              className="flex items-center gap-2"
            >
              <label className="text-xs text-iw-text-secondary">Role:</label>
              <select
                name="role"
                defaultValue={user.role}
                aria-label="Role"
                className="rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text focus:border-iw-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                aria-label="Submit"
                type="submit"
                className="rounded bg-iw-accent/15 px-2 py-1 text-xs text-iw-accent hover:bg-iw-accent/25"
              >
                Set
              </button>
            </form>
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="rounded-xl border border-iw-border bg-iw-surface p-8 text-center">
          <p className="text-sm text-iw-text-secondary">No users registered yet.</p>
        </div>
      )}
    </div>
  )
}
