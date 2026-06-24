/**
 * FILE: src/App.tsx
 * PURPOSE: Root router for islamwiki/editor SPA.
 *   Routes /edit/*, /review/*, /admin/* — all protected by AuthGuard.
 *   Implements all 7 UI states via DataState wrapper and Sentry ErrorBoundary.
 * REF: P2-E3-W02-S02-T01 · spec §3.2 surface map
 */

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AuthGuard from './components/shared/AuthGuard.tsx';

// Lazy-loaded page components to reduce initial bundle
const EditPage = lazy(() => import('./pages/editor/EditPage.tsx'));
const NewArticlePage = lazy(() => import('./pages/editor/NewArticlePage.tsx'));
const ReviewQueuePage = lazy(() => import('./pages/review/ReviewQueuePage.tsx'));
const ReviewArticlePage = lazy(() => import('./pages/review/ReviewArticlePage.tsx'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage.tsx'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" role="status" aria-live="polite">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-mid border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-gray-600 text-sm">Loading editor…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Redirect bare / to /edit */}
        <Route path="/" element={<Navigate to="/edit" replace />} />

        {/* Editor routes — contributor role required */}
        <Route
          path="/edit"
          element={
            <AuthGuard requiredRole="contributor">
              <EditPage slug={undefined} />
            </AuthGuard>
          }
        />
        <Route
          path="/edit/new"
          element={
            <AuthGuard requiredRole="contributor">
              <NewArticlePage />
            </AuthGuard>
          }
        />
        <Route
          path="/edit/:slug"
          element={
            <AuthGuard requiredRole="contributor">
              <EditPageWrapper />
            </AuthGuard>
          }
        />

        {/* Review routes — moderator role required */}
        <Route
          path="/review"
          element={
            <AuthGuard requiredRole="moderator">
              <ReviewQueuePage />
            </AuthGuard>
          }
        />
        <Route
          path="/review/:slug"
          element={
            <AuthGuard requiredRole="moderator">
              <ReviewArticleWrapper />
            </AuthGuard>
          }
        />

        {/* Admin routes — admin role required */}
        <Route
          path="/admin/*"
          element={
            <AuthGuard requiredRole="admin">
              <AdminPage />
            </AuthGuard>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/edit" replace />} />
      </Routes>
    </Suspense>
  );
}

// Wrapper to extract slug param for EditPage
function EditPageWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return <EditPage slug={slug} />;
}

// Wrapper to extract slug param for ReviewArticlePage
function ReviewArticleWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return <ReviewArticlePage slug={slug ?? ''} />;
}
