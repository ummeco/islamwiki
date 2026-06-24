import * as Sentry from '@sentry/nextjs'

// Edge-runtime Sentry initialization for Islam.wiki.
// D3 fix: guard includes !!process.env.SENTRY_DSN — without it, SDK initializes
// "enabled" with an empty DSN in prod and may throw on first event.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
})
