/**
 * FILE: components/shared/DataState.tsx
 * PURPOSE: Wrapper that renders all 7 required UI states for editor surfaces.
 *   States: loading, empty, error, populated, offline, permission-denied, rate-limited.
 *   Used by all editor and review pages to satisfy the 7-state requirement.
 * INPUTS: state ('loading'|'empty'|'error'|'populated'|'offline'|'permission-denied'|'rate-limited'),
 *   children (rendered when populated), error (Error | null), onRetry (callback)
 * REF: P2-E3-W02-S02-T01 · acceptance criteria
 */

import type { ReactNode } from 'react';

export type UIState =
  | 'loading'
  | 'empty'
  | 'error'
  | 'populated'
  | 'offline'
  | 'permission-denied'
  | 'rate-limited';

interface DataStateProps {
  state: UIState;
  children?: ReactNode;
  error?: Error | null;
  emptyMessage?: string;
  onRetry?: () => void;
  loadingLabel?: string;
}

export default function DataState({
  state,
  children,
  error,
  emptyMessage = 'Nothing here yet.',
  onRetry,
  loadingLabel = 'Loading…',
}: DataStateProps) {
  // UI state #1: Loading
  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-4 border-brand-mid border-t-transparent rounded-full animate-spin mb-3"
            aria-hidden="true"
          />
          <p className="text-gray-600 text-sm">{loadingLabel}</p>
        </div>
      </div>
    );
  }

  // UI state #2: Empty
  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500" role="status">
        <div className="text-4xl mb-4">📄</div>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // UI state #3: Error
  if (state === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6" role="alert" aria-live="assertive">
        <h2 className="font-semibold text-red-700 mb-2">Something went wrong</h2>
        {error && (
          <p className="text-sm text-red-600 mb-4 font-mono break-all">{error.message}</p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // UI state #5: Offline
  if (state === 'offline') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6" role="alert" aria-live="polite">
        <h2 className="font-semibold text-yellow-800 mb-2">You're offline</h2>
        <p className="text-sm text-yellow-700">
          Changes are being saved locally and will sync when you reconnect.
        </p>
      </div>
    );
  }

  // UI state #6: Permission denied
  if (state === 'permission-denied') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500" role="alert">
        <div className="text-4xl mb-4">⛔</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Permission denied</h2>
        <p className="text-sm">You don't have permission to perform this action.</p>
      </div>
    );
  }

  // UI state #7: Rate limited
  if (state === 'rate-limited') {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6" role="alert" aria-live="polite">
        <h2 className="font-semibold text-orange-700 mb-2">Too many requests</h2>
        <p className="text-sm text-orange-600">
          You're making requests too quickly. Please wait a moment before trying again.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // UI state #4: Populated — render children
  return <>{children}</>;
}
