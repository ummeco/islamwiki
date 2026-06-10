import nextConfig from 'eslint-config-next'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// Vendored from ummat/apps/brand/src — keeps islamwiki CI self-contained (no sibling repo checkout needed).
const noBrandLightOnLight = require('./lib/eslint-rule-no-brand-light-on-light.cjs')

const eslintConfig = [
  ...nextConfig,
  {
    // vendor/** = third-party code vendored into this repo — not subject to project lint rules.
    ignores: ['scripts/**', 'data/**', 'coverage/**', 'vendor/**'],
  },
  // C-09a-FIX-01: brand contrast guard — block text-brand-light / text-brand-mid in JSX/TSX.
  // These fail WCAG 2.2 AA on white/light surfaces (1.28:1 and 2.18:1 respectively).
  {
    plugins: { ummat: { rules: { 'no-brand-light-on-light': noBrandLightOnLight } } },
    rules: {
      'ummat/no-brand-light-on-light': 'error',
    },
  },
  // D-P3-44: Block direct @anthropic-ai/sdk imports everywhere except the two
  // transitional allowlist files. All new AI calls must go through lib/ai/service.ts,
  // which routes to nself-ai when NSELF_AI_URL is set (Track A6).
  // Remove allowlist entries after Track A6 deploys.
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@anthropic-ai/sdk',
              message:
                'Direct Anthropic SDK usage is banned (D-P3-44). Use lib/ai/service.ts instead.',
            },
          ],
        },
      ],
    },
  },
  // Transitional allowlist — these two files use the SDK directly until Track A6 deploys.
  {
    files: ['lib/ai/service.ts', 'app/api/tafsir/route.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]

export default eslintConfig
