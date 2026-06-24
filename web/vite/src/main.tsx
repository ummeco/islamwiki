/**
 * FILE: src/main.tsx
 * PURPOSE: Entry point for islamwiki/editor Vite SPA.
 *   Initializes Sentry, urql UrqlProvider, React Router, and mounts App.
 * CONSTRAINTS:
 *   - httpOnly cookie auth only (C1 per ADR-005) — no JWT in localStorage.
 *   - Sentry DSN from import.meta.env.VITE_SENTRY_DSN (vault SENTRY_DSN_ISLAMWIKI).
 * REF: P2-E3-W02-S02-T01
 */

import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';
import { createUrqlClient } from '@ummat/graphql-client';
import App from './App.tsx';
import './index.css';

// Initialize Sentry before rendering
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,
});

const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ?? 'https://api.ummat.dev/v1/graphql';

const urqlClient = createUrqlClient({ url: graphqlUrl });

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p className="p-8 text-red-600">An unexpected error occurred.</p>}>
      <UrqlProvider value={urqlClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UrqlProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
);
