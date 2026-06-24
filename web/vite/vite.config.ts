/**
 * FILE: vite.config.ts
 * PURPOSE: Vite 7 config for islamwiki/editor SPA.
 *   React 19 + TypeScript + Tailwind + Sentry source maps.
 *   Base path '/' — served from root of its own Vercel domain (editor.islam.wiki).
 * REF: P2-E3-W02-S02-T01 · p2-islamwiki-astro-vite-spec.md §3.3
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // Sentry source maps — only active during CI/Vercel builds
    sentryVitePlugin({
      org: process.env.SENTRY_ORG ?? 'ummeco',
      project: process.env.SENTRY_PROJECT ?? 'islamwiki-editor',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large deps into separate chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          tiptap: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit'],
          urql: ['urql'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
  server: {
    port: 3042,
    proxy: {
      // In dev: proxy GraphQL to local nSelf instance (port 8543)
      '/api/graphql': {
        target: 'https://api.islamwiki.local.nself.org:8543',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
