import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3040',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    // B7-08: Viewport matrix CI — 375×667, 768×1024, 1280×800
    {
      name: 'mobile-375',
      use: { ...devices['iPhone SE'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'tablet-768',
      use: { viewport: { width: 768, height: 1024 }, isMobile: false },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  // `pnpm start` (= `astro preview`) CANNOT be used here: the @astrojs/vercel
  // adapter does not implement the preview command, so the process exits
  // immediately ("The @astrojs/vercel adapter does not support the preview
  // command") and Playwright times out waiting for the URL. `astro dev` serves
  // SSR routes under any adapter, so it is the only way to exercise these
  // routes locally. Port 3040 matches `pnpm dev`; the previous 3041 came from
  // the abandoned web/astro/ scaffold and never matched this app.
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3040',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
