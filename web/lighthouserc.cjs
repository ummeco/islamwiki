// Lighthouse CI config — Sprint B9 DR-B9-PERF-01 + DR-B9-A11Y-01
// Project: Islam.wiki (islam.wiki)
module.exports = {
  ci: {
    // WHY staticDistDir and not startServerCommand:
    //   This app is `output: 'server'` on the @astrojs/vercel adapter, which does
    //   NOT implement `astro preview`. The old `startServerCommand: 'pnpm start'`
    //   therefore exited immediately and lhci reported CHROME_INTERSTITIAL_ERROR
    //   against a port nothing was listening on (3041 was also the wrong port —
    //   it belonged to the abandoned web/astro/ scaffold, not this app).
    //   staticDistDir makes lhci serve the built output itself, deterministically,
    //   with no server to race against. LHCI picks its own port, so URLs are paths.
    //
    // WHY these routes: staticDistDir can only audit PRERENDERED pages, since
    //   SSR routes emit no HTML at build time. `/quran/` and `/hadith/` are the
    //   two `export const prerender = true` index pages and are representative
    //   content pages. The home page is deliberately NOT audited here — it calls
    //   getDailyVerse()/getDailyHadith() at request time, so prerendering it would
    //   freeze "daily" content until the next deploy. Home-page accessibility is
    //   covered instead by the axe job, which runs against a real dev server.
    collect: {
      staticDistDir: './.vercel/output/static',
      url: ['http://localhost/quran/', 'http://localhost/hadith/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // CI runners are slower than production — performance thresholds relaxed to
        // avoid flaky failures on resource-constrained GitHub Actions workers.
        // Production perf is validated by Vercel analytics + manual runs.
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
