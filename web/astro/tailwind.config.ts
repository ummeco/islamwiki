/**
 * FILE: tailwind.config.ts
 * PURPOSE: Tailwind CSS config for islamwiki/read Astro surface.
 *   Extends @ummat/brand design tokens.
 * REF: P2-E3-W02-S02-T01
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#C9F27A',
          mid: '#79C24C',
          dark: '#1E5E2F',
          deep: '#0D2F17',
        },
      },
      fontFamily: {
        arabic: ['Noto Naskh Arabic', 'Amiri', 'serif'],
        latin: ['Geist', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
