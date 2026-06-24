/// <reference path=".astro/types.d.ts" />
/// <reference types="astro/client" />

// App.Locals — request-scoped values set by src/middleware.ts.
// Ported from the Next.js middleware that forwarded these via request headers
// (x-nonce, x-islamwiki-role, x-islamwiki-user-id) into RSCs / route handlers.
declare namespace App {
  interface Locals {
    /** Per-request CSP nonce (base64 of crypto.randomUUID). */
    nonce: string
    /** Detected locale: 'en' | 'ar' | 'id'. */
    locale: string
    /** Canonical islamwiki role (owner|admin|moderator|curator|editor|trusted|user|public). */
    role: string
    /** Trust level 0-5 derived from role. */
    trustLevel: number
    /** Authenticated user id (JWT sub), or null when unauthenticated. */
    userId: string | null
  }
}

interface ImportMetaEnv {
  // Hasura GraphQL endpoint (per-app CORS-restricted)
  readonly PUBLIC_HASURA_URL: string
  // Auth endpoint (shared SSO)
  readonly PUBLIC_AUTH_URL: string
  // App base URL
  readonly PUBLIC_BASE_URL: string
  // Umami analytics (D-P3-21)
  readonly PUBLIC_UMAMI_WEBSITE_ID: string

  // Server-side only (never expose to browser)
  readonly NEXT_PUBLIC_AUTH_URL: string
  readonly HASURA_GRAPHQL_ADMIN_SECRET: string
  readonly HASURA_ADMIN_URL: string
  readonly REMOTE_SCHEMA_SECRET: string
  readonly REDIS_URL: string
  readonly SENTRY_DSN: string
  readonly SENTRY_DSN_ISLAMWIKI: string
  readonly SENTRY_AUTH_TOKEN: string
  readonly SENTRY_ORG: string
  readonly SENTRY_PROJECT: string
  readonly ANTHROPIC_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
