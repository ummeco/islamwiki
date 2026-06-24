export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // T25.09: OTel SDK — init before Sentry so traces are captured from the first request.
    // Gated on OTEL_EXPORTER_OTLP_ENDPOINT being set — safe to omit in local dev.
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      await import('./lib/otel-init')
    }
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// NOTE: Under Astro the @sentry/astro integration captures request errors via its
// middleware automatically, so this hook is not wired into the request path. It is
// retained as a framework-agnostic manual-capture helper (no next/* dependency).
export async function onRequestError(err: unknown, _request?: unknown, _context?: unknown) {
  const Sentry = await import('@sentry/astro')
  Sentry.captureException(err)
}
