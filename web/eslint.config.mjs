import nextConfig from 'eslint-config-next'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// Vendored from ummat/apps/brand/src — keeps islamwiki CI self-contained (no sibling repo checkout needed).
const noBrandLightOnLight = require('./lib/eslint-rule-no-brand-light-on-light.cjs')

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['scripts/**', 'data/**', 'coverage/**'],
  },
  // C-09a-FIX-01: brand contrast guard — block text-brand-light / text-brand-mid in JSX/TSX.
  // These fail WCAG 2.2 AA on white/light surfaces (1.28:1 and 2.18:1 respectively).
  {
    plugins: { ummat: { rules: { 'no-brand-light-on-light': noBrandLightOnLight } } },
    rules: {
      'ummat/no-brand-light-on-light': 'error',
    },
  },
]

export default eslintConfig
