import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import type { TrustLevel } from '@/types/content'

// ── Types ──

export interface OAuthProviderRecord {
  provider: string
  provider_id: string
  email?: string
  connected_at: string
}

export interface UserRecord {
  id: string
  email: string
  username: string
  display_name: string
  kunya?: string
  avatar_url?: string
  role: 'user' | 'editor' | 'moderator' | 'admin' | 'owner'
  trust_level: TrustLevel
  total_edits: number
  approved_edits: number
  password_hash: string
  must_change_password?: boolean
  banned?: boolean
  verified: boolean
  oauth_providers?: OAuthProviderRecord[]
  created_at: string
}

export interface CreateUserInput {
  email: string
  username: string
  display_name: string
  password_hash: string
  kunya?: string
  oauth_providers?: OAuthProviderRecord[]
  verified?: boolean
}

// ── File path ──

const USERS_FILE = path.join(process.cwd(), 'data/users/users.json')

// ── Read/Write helpers ──

function readUsers(): UserRecord[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeUsers(users: UserRecord[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

// ── Public API ──

export function getUsers(): UserRecord[] {
  return readUsers()
}

export function getUserById(id: string): UserRecord | undefined {
  return readUsers().find((u) => u.id === id)
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserByUsername(username: string): UserRecord | undefined {
  return readUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  )
}

export function createUser(input: CreateUserInput): UserRecord {
  const users = readUsers()
  const nextNum = users.length + 1
  const newUser: UserRecord = {
    id: `user-${String(nextNum).padStart(3, '0')}`,
    email: input.email,
    username: input.username,
    display_name: input.display_name,
    ...(input.kunya && { kunya: input.kunya }),
    role: 'user',
    trust_level: 0,
    total_edits: 0,
    approved_edits: 0,
    password_hash: input.password_hash,
    verified: input.verified ?? false,
    ...(input.oauth_providers && { oauth_providers: input.oauth_providers }),
    created_at: new Date().toISOString(),
  }
  users.push(newUser)
  writeUsers(users)
  return newUser
}

export function updateUser(
  id: string,
  data: Partial<Omit<UserRecord, 'id'>>
): UserRecord | undefined {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return undefined

  users[index] = { ...users[index], ...data }
  writeUsers(users)
  return users[index]
}
