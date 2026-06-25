/**
 * eslint.config.mjs — Islam.wiki Astro 5 ESLint config
 * Replaces eslint-config-next (removed — D-P2-STACK-CANON).
 * Type-aware checks live in `astro check` / `tsc --noEmit`; this config carries
 * the project guard rules (Next.js ban, brand contrast, Anthropic SDK gate).
 */

import astroPlugin from 'eslint-plugin-astro'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
// Vendored from ummat/apps/brand/src — keeps islamwiki CI self-contained.
const noBrandLightOnLight = require('./lib/eslint-rule-no-brand-light-on-light.cjs')

// Migration guard: Next.js is removed (D-P2-STACK-CANON).
const noNextImports = {
  paths: [
    { name: 'next', message: 'Next.js is removed — use Astro or React 19.' },
    { name: 'next/navigation', message: 'Next.js is removed — use Astro routing.' },
    { name: 'next/link', message: 'Next.js is removed — use <a> or Astro <a>.' },
    { name: 'next/image', message: 'Next.js is removed — use <img> with Astro asset pipeline.' },
    { name: 'next-intl', message: 'next-intl is removed — use @ummat/i18n.' },
    {
      name: '@anthropic-ai/sdk',
      message: 'Direct Anthropic SDK usage is banned (D-P3-44). Use lib/ai/service.ts instead.',
    },
  ],
  patterns: [{ group: ['next/*'], message: 'Next.js is removed (D-P2-STACK-CANON).' }],
}

const eslintConfig = [
  ...astroPlugin.configs['flat/recommended'],
  {
    ignores: [
      'scripts/**',
      'data/**',
      'coverage/**',
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'node_modules/**',
      // Build output of the embedded Vite editor surface — not linted here.
      'vite/dist/**',
      'astro/dist/**',
      // Lighthouse/Playwright config helpers run under their own toolchains.
      'lighthouserc.js',
      'playwright.config.ts',
      // Next.js compatibility shim — removed once all islands are migrated.
      'lib/compat/**',
      // Vendored sub-packages (file: deps) ship their own dist/ and lint pipelines.
      'vendor/**',
    ],
  },
  // TypeScript-parsed files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-restricted-imports': ['error', noNextImports],
      // TS handles undefined-var detection; disable core rule to avoid false positives
      // on type-only globals and ambient types.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  // Astro files
  {
    files: ['**/*.astro'],
    rules: {
      'no-restricted-imports': ['error', noNextImports],
    },
  },
  // C-09a-FIX-01: brand contrast guard — block text-brand-light / text-brand-mid in JSX/TSX.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { ummat: { rules: { 'no-brand-light-on-light': noBrandLightOnLight } } },
    rules: {
      'ummat/no-brand-light-on-light': 'error',
    },
  },
  // Transitional allowlist — these files use the Anthropic SDK directly until Track A6 deploys.
  {
    files: ['lib/ai/service.ts', 'lib/ai/nself-ai-client.ts', 'src/pages/api/tafsir.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]

export default eslintConfig
