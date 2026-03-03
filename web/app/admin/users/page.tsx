import type { Metadata } from 'next'
import { getUsers } from '@/lib/data/users'
import { UserManagement } from './user-management'

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Manage user accounts, trust levels, and roles.',
}

export default function AdminUsersPage() {
  const users = getUsers().map((u) => ({
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    email: u.email,
    role: u.role,
    trust_level: u.trust_level,
    total_edits: u.total_edits,
    approved_edits: u.approved_edits,
    banned: u.banned || false,
    created_at: u.created_at,
  }))

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          Manage trust levels, roles, and account status for all users.
        </p>
      </div>

      <UserManagement users={users} />
    </div>
  )
}
