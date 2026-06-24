/**
 * FILE: instrumentation.ts
 * PURPOSE: Sentry server-side initialization for islamwiki/read.
 *   Reads SENTRY_DSN_ISLAMWIKI from environment (vault key per PPI § Infrastructure).
 * CONSTRAINTS:
 *   - DSN must come from vault SENTRY_DSN_ISLAMWIKI — never hardcoded.
 * REF: P2-E3-W02-S02-T01
 */

import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: process.env.SENTRY_DSN_ISLAMWIKI,
  environment: process.env.VERCEL_ENV ?? 'development',
  tracesSampleRate: process.env.VERCEL_ENV === 'production' ? 0.1 : 0,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
