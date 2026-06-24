/**
 * FILE: codegen.ts (shared at islamwiki/web/ level)
 * PURPOSE: GraphQL codegen config for both astro/ and vite/ surfaces.
 *   Generates typed hooks and documents from iw_ schema.
 * REF: P2-E3-W02-S02-T01 · spec §6.4
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.PUBLIC_GRAPHQL_URL ?? 'https://api.ummat.dev/v1/graphql',
  generates: {
    // Astro read surface
    'astro/src/graphql/generated/': {
      documents: 'astro/src/graphql/**/*.graphql',
      preset: 'client',
      config: {
        useTypeImports: true,
        dedupeFragments: true,
      },
    },
    // Vite editor surface
    'vite/src/graphql/generated/': {
      documents: ['vite/src/graphql/**/*.graphql'],
      preset: 'client',
      config: {
        useTypeImports: true,
        dedupeFragments: true,
      },
    },
  },
};

export default config;
