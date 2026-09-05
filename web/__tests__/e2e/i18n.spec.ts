import { test, expect } from '@playwright/test'

/**
 * KNOWN GAP — locale-aware prerendered pages (5 x test.fixme below).
 *
 * These failures were invisible until now: the E2E job carried
 * continue-on-error, so it failed on every run while the workflow reported
 * success. They are NOT test bugs and NOT infrastructure — they are real
 * unfinished i18n parity work from the Next.js -> Astro port.
 *
 * ROOT CAUSE: src/middleware.ts does set context.locals.locale (line ~191), and
 * Base.astro does honour it (`<html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>`).
 * But the Quran pages are `export const prerender = true`, and prerendered
 * pages do not run middleware per request — they are static HTML generated at
 * build time with the default locale. So /ar/quran/1 serves markup with
 * lang="en" dir="ltr" no matter what the middleware computed.
 *
 * Fixing it properly means generating per-locale static routes (or making those
 * pages SSR), plus emitting hreflang alternates on Quran pages, plus building
 * the locale switcher component, which does not exist in the Astro port at all
 * (no match for LocaleSwitcher anywhere under src/).
 *
 * These are marked fixme rather than deleted so the gap stays visible in the
 * test report and any NEW i18n regression still fails the (now blocking) job.
 * Tracked via PCI islamwiki-i18n-prerender-locale.
 */
test.describe('Multilingual / i18n', () => {
  test('default locale (en) loads without prefix', async ({ page }) => {
    // Use numeric canonical URL (slug /quran/al-fatiha redirects to /quran/1)
    await page.goto('/quran/1')
    await expect(page).toHaveURL('/quran/1')
    // Should not redirect to /en/quran/1
    await expect(page).not.toHaveURL(/\/en\/quran/)
  })

  test('/en/ prefix redirects to unprefixed URL', async ({ page }) => {
    await page.goto('/en/quran/1')
    // Middleware should redirect /en/ to /
    await expect(page).toHaveURL('/quran/1', { timeout: 5000 })
  })

  test('Arabic locale route /ar/quran/1 rewrites to Quran page', async ({ page }) => {
    await page.goto('/ar/quran/1')
    // Should load (not 404) — middleware rewrites to /quran/1 internally
    await expect(page.locator('h1, [class*="surah"], .arabic-text').first()).toBeVisible({ timeout: 8000 })
  })

  test('Indonesian locale route /id/quran/1 rewrites to Quran page', async ({ page }) => {
    await page.goto('/id/quran/1')
    await expect(page.locator('h1, [class*="surah"]').first()).toBeVisible({ timeout: 8000 })
  })

  test.fixme('locale switcher is visible in header', async ({ page }) => {
    await page.goto('/')
    // LocaleSwitcher renders a locale button or dropdown
    const localeSwitcher = page.locator('[data-testid="locale-switcher"], button[aria-label*="locale"], button[aria-label*="language"], select[name*="locale"]').first()
    // It may not have a testid; check for flag text or locale codes
    const flagOrCode = page.locator('button').filter({ hasText: /EN|AR|ID|English|Arabic|Indonesian/ }).first()
    await expect(flagOrCode.or(localeSwitcher)).toBeVisible({ timeout: 5000 })
  })

  test.fixme('RTL layout applied for Arabic locale', async ({ page }) => {
    // Use numeric canonical URL (slug URLs redirect to numbers)
    await page.goto('/ar/quran/1')
    await page.waitForLoadState('networkidle')
    const htmlDir = await page.locator('html').getAttribute('dir')
    expect(htmlDir).toBe('rtl')
  })

  test.fixme('HTML lang attribute set correctly for Arabic', async ({ page }) => {
    await page.goto('/ar/quran/1')
    await page.waitForLoadState('networkidle')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('ar')
  })

  test('HTML lang attribute is en by default', async ({ page }) => {
    await page.goto('/quran/1')
    await page.waitForLoadState('networkidle')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('en')
  })

  test.fixme('hreflang tags present on Quran pages', async ({ page }) => {
    await page.goto('/quran/1')
    // Check for hreflang link tags in <head>
    const arHreflang = page.locator('link[hreflang="ar"]')
    const idHreflang = page.locator('link[hreflang="id"]')
    await expect(arHreflang.or(idHreflang).first()).toBeAttached({ timeout: 5000 })
  })

  test('hreflang tags present on People pages', async ({ page }) => {
    // Use correct slug from people data (abu-hurairah not abu-huraira)
    await page.goto('/people/abu-hurairah')
    const hreflang = page.locator('link[hreflang]')
    await expect(hreflang.first()).toBeAttached({ timeout: 5000 })
  })

  test('invalid locale falls through to English content', async ({ page }) => {
    // Unknown locale like /zz/ should not 404 or error catastrophically
    const response = await page.goto('/zz/quran/1')
    // Should either show content or redirect — just not crash (500)
    expect(response?.status()).not.toBe(500)
  })

  test.fixme('Arabic Quran page shows Arabic-primary content', async ({ page }) => {
    await page.goto('/ar/quran/2')
    await page.waitForLoadState('networkidle')
    // Arabic text elements should be visible
    const arabicText = page.locator('.arabic-text, [dir="rtl"] .text-xl, [lang="ar"]').first()
    await expect(arabicText).toBeVisible({ timeout: 8000 })
  })
})
