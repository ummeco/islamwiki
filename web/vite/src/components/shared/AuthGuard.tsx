/**
 * FILE: components/shared/AuthGuard.tsx
 * PURPOSE: Route guard that checks for a valid session via httpOnly cookie.
 *   If unauthenticated: stores returnTo in sessionStorage, redirects to auth.ummat.dev.
 *   If authenticated but insufficient role: shows permission-denied state (UI state #6).
 * INPUTS: requiredRole ('contributor'|'moderator'|'admin'), children
 * OUTPUTS: children if authorized; redirect or error state otherwise
 * CONSTRAINTS:
 *   - NEVER read JWT from localStorage — httpOnly cookie only (D-P2-AUTH-TRANSPORT).
 *   - NEVER embed JWT or claims in DOM — check session via a /api/me endpoint only.
 *   - returnTo stored in sessionStorage only (not localStorage).
 * REF: P2-E3-W02-S02-T01 · spec §4.2 §4.3 · D-P2-AUTH-TRANSPORT
 */

import { useState, useEffect, type ReactNode } from 'react';

type RequiredRole = 'contributor' | 'moderator' | 'admin';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: RequiredRole;
}

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'permission_denied'; role: string }
  | { status: 'authenticated'; role: string };

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'https://auth.ummat.dev';
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://islam.wiki';

const ROLE_HIERARCHY: Record<RequiredRole, number> = {
  contributor: 1,
  moderator: 2,
  admin: 3,
};

function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as RequiredRole] ?? 0;
}

async function fetchSession(): Promise<{ authenticated: boolean; role?: string } | null> {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (res.status === 401) return { authenticated: false };
    if (!res.ok) return null;
    const data = await res.json() as { role?: string };
    return { authenticated: true, role: data.role ?? 'contributor' };
  } catch {
    return null;
  }
}

export default function AuthGuard({ children, requiredRole = 'contributor' }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetchSession().then((session) => {
      if (cancelled) return;

      if (!session || !session.authenticated) {
        // Store return URL for post-login redirect
        const returnTo = window.location.pathname + window.location.search;
        sessionStorage.setItem('islamwiki_returnTo', returnTo);
        setAuthState({ status: 'unauthenticated' });
        return;
      }

      const userLevel = getRoleLevel(session.role ?? 'contributor');
      const requiredLevel = getRoleLevel(requiredRole);

      if (userLevel < requiredLevel) {
        setAuthState({ status: 'permission_denied', role: session.role ?? 'contributor' });
        return;
      }

      setAuthState({ status: 'authenticated', role: session.role ?? 'contributor' });
    });

    return () => { cancelled = true; };
  }, [requiredRole]);

  // UI state #1: Loading
  if (authState.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-mid border-t-transparent rounded-full animate-spin mb-3" aria-hidden="true" />
          <p className="text-gray-600 text-sm">Checking authentication…</p>
        </div>
      </div>
    );
  }

  // UI state #6: Unauthenticated → redirect to auth
  if (authState.status === 'unauthenticated') {
    const returnTo = window.location.pathname + window.location.search;
    const redirectUri = encodeURIComponent(`${SITE_URL}${returnTo}`);
    const loginUrl = `${AUTH_URL}/login?redirect_uri=${redirectUri}&app=islamwiki`;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access the Islam.wiki editor.
          </p>
          <a
            href={loginUrl}
            className="inline-block px-6 py-3 bg-brand-mid text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
          >
            Sign in to continue
          </a>
        </div>
      </div>
    );
  }

  // UI state #6: Permission denied (authenticated but wrong role)
  if (authState.status === 'permission_denied') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600 mb-4">
            Your account ({authState.role}) does not have the {requiredRole} role
            required to access this page.
          </p>
          <a href="/" className="text-brand-mid hover:text-brand-dark underline">
            Return to Islam.wiki
          </a>
        </div>
      </div>
    );
  }

  // UI state: Authenticated — render children
  return <>{children}</>;
}
