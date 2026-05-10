import * as Sentry from '@sentry/nextjs'
import { scrubPII } from './lib/sentry-scrub'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  // C-08a-FIX-P0: No session replays without explicit consent. Errors always captured.
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true }),
  ],
  // SEC-M6 / T25.15: Full PII scrub — headers, body, user fields, extras, contexts.
  beforeSend: scrubPII,
})
