/**
 * FILE: tailwind.config.ts
 * PURPOSE: Tailwind CSS config for islamwiki/editor Vite SPA.
 * REF: P2-E3-W02-S02-T01
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    // @tailwindcss/typography for prose styles in editor
    require('@tailwindcss/typography'),
  ],
};

export default config;
