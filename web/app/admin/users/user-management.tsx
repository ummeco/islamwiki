'use client'

import { updateTrustLevel, updateRole, toggleBan } from '@/app/actions/admin'

interface UserInfo {
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

const TRUST_LABELS = [
  'New (0)',
  'Trusted (1)',
  'Editor (2)',
  'Moderator (3)',
  'Admin (4)',
  'Owner (5)',
]

const ROLE_OPTIONS = ['user', 'editor', 'moderator', 'admin', 'owner']

export function UserManagement({ users }: Props) {
  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className={`rounded-xl border bg-iw-surface/60 p-4 ${
            user.banned ? 'border-red-500/30' : 'border-iw-border'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-iw-text">
                  {user.display_name}
                </span>
                <span className="text-xs text-iw-text-muted">
                  @{user.username}
                </span>
                {user.banned && (
                  <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-medium text-red-400">
                    banned
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-iw-text-muted">
                {user.email} &middot; Joined{' '}
                {new Date(user.created_at).toLocaleDateString()} &middot;{' '}
                {user.total_edits} edits ({user.approved_edits} approved)
              </div>
            </div>

            {/* Ban toggle */}
            <form action={toggleBan}>
              <input type="hidden" name="user_id" value={user.id} />
              <button
                type="submit"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  user.banned
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-red-600/80 text-white hover:bg-red-500'
                }`}
              >
                {user.banned ? 'Unban' : 'Ban'}
              </button>
            </form>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {/* Trust Level */}
            <form action={updateTrustLevel} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={user.id} />
              <label className="text-xs text-iw-text-secondary">Trust:</label>
              <select
                name="trust_level"
                defaultValue={user.trust_level}
                className="rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text focus:border-iw-accent/40 focus:outline-none"
              >
                {TRUST_LABELS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded bg-iw-accent/15 px-2 py-1 text-xs text-iw-accent hover:bg-iw-accent/25"
              >
                Set
              </button>
            </form>

            {/* Role */}
            <form action={updateRole} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={user.id} />
              <label className="text-xs text-iw-text-secondary">Role:</label>
              <select
                name="role"
                defaultValue={user.role}
                className="rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text focus:border-iw-accent/40 focus:outline-none"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
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
