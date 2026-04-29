# Islam.wiki Web — API Reference

**Base path:** `/api` — Next.js App Router `route.ts` handlers.
**Auth:** Most content reads are public. Editing and moderation require a Hasura Auth JWT. Trust levels gate certain endpoints (level 3+ for AI review).

---

## Authentication

### `GET /api/auth/magic-link`

**Auth:** Public.
**Purpose:** Exchange a magic-link ticket (from email) for session cookies. Redirects on success/failure.

| Param | Type | Required |
|---|---|---|
| `ticket` | string | yes |

**Response:** Redirect to `/account` on success or `/account?error=...` on failure.
**Sets cookies:** `iw_at` (access token, httpOnly), `iw_rt` (refresh token, httpOnly).

### `POST /api/auth/reset-password`

**Auth:** Public.
**Purpose:** Initiate a password reset flow via Hasura Auth.
**Request body:** `{ email: string }`
**Response:** `{ ok: true }`
**Errors:** `400` missing email.

### `POST /api/auth/logout`

**Auth:** User JWT (cookie).
**Purpose:** Invalidate session and clear auth cookies.
**Response:** `{ ok: true }`

### `GET /api/auth/me`

**Auth:** User JWT (cookie).
**Purpose:** Return the authenticated user's profile and trust level.
**Response:** `{ id, email, username, trustLevel, roles }`
**Errors:** `401` no valid session.

### `GET /api/auth/oauth/callback`

**Auth:** Public — OAuth provider callback.
**Purpose:** Handle OAuth provider callback (Google/Apple), exchange code for session, set cookies.

| Param | Type | Required |
|---|---|---|
| `code` | string | yes |
| `state` | string | yes |

**Response:** Redirect to `/` or error page.

---

## Content

### `GET /api/search`

**Auth:** Public — rate-limited.
**Purpose:** Full-text search across wiki articles, hadiths, and scholars.

| Param | Type | Required |
|---|---|---|
| `q` | string | yes |
| `type` | `article \| hadith \| scholar` | no |
| `limit` | number | no (default 20) |

**Response:** `{ results: Array<{ id, type, title, excerpt, slug }> }`
**Errors:** `429` rate exceeded.

### `GET /api/tafsir`

**Auth:** Public.
**Purpose:** Fetch tafsir (Quranic commentary) for a specific verse.

| Param | Type | Required |
|---|---|---|
| `surah` | number | yes |
| `ayah` | number | yes |
| `source` | string | no |

**Response:** `{ tafsir: { text, source, scholar } }`

### `GET /api/verse-of-the-day`

**Auth:** Public.
**Purpose:** Return the current day's featured Quranic verse.
**Response:** `{ surah: number, ayah: number, arabic: string, translation: string, tafsir?: string }`

### `GET /api/hadith-of-the-day`

**Auth:** Public.
**Purpose:** Return the current day's featured hadith.
**Response:** `{ id, collection, number, arabic, translation, grade, source }`

### `GET /api/seerah/[slug]/content`

**Auth:** Public.
**Purpose:** Fetch the body content of a Seerah (Prophet's biography) article by slug.
**Response:** `{ slug, title, content: string (markdown), updatedAt }`
**Errors:** `404` article not found.

---

## GraphQL

### `POST /api/graphql`

**Auth:** User JWT (forwarded to Hasura). Public reads allowed per Hasura anonymous role.
**Purpose:** Hasura GraphQL proxy for all island.wiki data operations.
**Request:** Standard GraphQL `{ query, variables, operationName }`.
**Response:** Standard GraphQL response.

---

## Editing & Revisions

### `GET /api/revisions`

**Auth:** User JWT (trust level 1+).
**Purpose:** List pending content revisions awaiting review.

| Param | Type | Required |
|---|---|---|
| `articleId` | string | no — filter by article |
| `status` | `pending \| approved \| rejected` | no |

**Response:** `{ revisions: Array<{ id, articleId, authorId, diff, status, createdAt }> }`

### `POST /api/revisions/review`

**Auth:** User JWT (trust level 3+).
**Purpose:** Approve or reject a content revision.
**Request body:** `{ revisionId: string, action: 'approve' | 'reject', reason?: string }`
**Response:** `{ ok: true, revision: { id, status } }`
**Errors:** `401` unauthenticated, `403` insufficient trust level, `404` revision not found.

### `POST /api/revisions/revert`

**Auth:** User JWT (trust level 3+).
**Purpose:** Revert an article to a specific prior revision.
**Request body:** `{ articleId: string, revisionId: string }`
**Response:** `{ ok: true, newRevisionId: string }`
**Errors:** `403` insufficient trust level, `404` article/revision not found.

### `POST /api/content-lock`

**Auth:** User JWT (trust level 1+).
**Purpose:** Acquire an optimistic edit lock on an article to prevent concurrent edits.
**Request body:** `{ articleId: string, action: 'acquire' | 'release' }`
**Response:** `{ locked: boolean, lockedBy?: string, expiresAt?: string }`
**Errors:** `409` already locked by another user.

---

## Trust & Moderation

### `POST /api/trust`

**Auth:** User JWT (trust level 3+ or moderator role).
**Purpose:** Update a user's trust level.
**Request body:** `{ userId: string, trustLevel: number, reason: string }`
**Response:** `{ ok: true }`
**Errors:** `403` cannot set level higher than own level.

### `POST /api/ai/review`

**Auth:** User JWT (trust level 3+). IP rate-limited (5 req/15 min).
**Purpose:** Trigger an AI-assisted content review for an article or revision.
**Request body:** `{ title: string, content: string, contentType: string }`
**Response:** `{ score: number, issues: string[], suggestions: string[], verdict: 'approve' | 'review' | 'reject' }`
**Errors:** `401` unauthenticated, `403` trust level too low, `429` rate exceeded.

---

## Admin

### `POST /api/admin/block-ip`

**Auth:** User JWT (super_admin role required).
**Purpose:** Block an IP address from editing/contributing.
**Request body:** `{ ip: string, reason: string, durationHours?: number }`
**Response:** `{ ok: true, blockedUntil?: string }`
**Errors:** `403` not super_admin.
