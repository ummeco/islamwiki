import { test, expect } from '@playwright/test'

test.describe('Multilingual / i18n', () => {
  test('default locale (en) loads without prefix', async ({ page }) => {
    await page.goto('/quran/al-fatiha')
    await expect(page).toHaveURL('/quran/al-fatiha')
    // Should not redirect to /en/quran/al-fatiha
    await expect(page).not.toHaveURL(/\/en\/quran/)
  })

  test('/en/ prefix redirects to unprefixed URL', async ({ page }) => {
    await page.goto('/en/quran/al-fatiha')
    // Middleware should redirect /en/ to /
    await expect(page).toHaveURL('/quran/al-fatiha', { timeout: 5000 })
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

  test('locale switcher is visible in header', async ({ page }) => {
    await page.goto('/')
    // LocaleSwitcher renders a locale button or dropdown
    const localeSwitcher = page.locator('[data-testid="locale-switcher"], button[aria-label*="locale"], button[aria-label*="language"], select[name*="locale"]').first()
    // It may not have a testid; check for flag text or locale codes
    const flagOrCode = page.locator('button').filter({ hasText: /EN|AR|ID|English|Arabic|Indonesian/ }).first()
    await expect(flagOrCode.or(localeSwitcher)).toBeVisible({ timeout: 5000 })
  })

  test('RTL layout applied for Arabic locale', async ({ page }) => {
    await page.goto('/ar/quran/al-fatiha')
    await page.waitForLoadState('networkidle')
    const htmlDir = await page.locator('html').getAttribute('dir')
    expect(htmlDir).toBe('rtl')
  })

  test('HTML lang attribute set correctly for Arabic', async ({ page }) => {
    await page.goto('/ar/quran/1')
    await page.waitForLoadState('networkidle')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('ar')
  })

  test('HTML lang attribute is en by default', async ({ page }) => {
    await page.goto('/quran/al-fatiha')
    await page.waitForLoadState('networkidle')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('en')
  })

  test('hreflang tags present on Quran pages', async ({ page }) => {
    await page.goto('/quran/1')
    // Check for hreflang link tags in <head>
    const arHreflang = page.locator('link[hreflang="ar"]')
    const idHreflang = page.locator('link[hreflang="id"]')
    await expect(arHreflang.or(idHreflang).first()).toBeAttached({ timeout: 5000 })
  })

  test('hreflang tags present on People pages', async ({ page }) => {
    await page.goto('/people/abu-huraira')
    const hreflang = page.locator('link[hreflang]')
    await expect(hreflang.first()).toBeAttached({ timeout: 5000 })
  })

  test('invalid locale falls through to English content', async ({ page }) => {
    // Unknown locale like /zz/ should not 404 or error catastrophically
    const response = await page.goto('/zz/quran/1')
    // Should either show content or redirect — just not crash (500)
    expect(response?.status()).not.toBe(500)
  })

  test('Arabic Quran page shows Arabic-primary content', async ({ page }) => {
    await page.goto('/ar/quran/2')
    await page.waitForLoadState('networkidle')
    // Arabic text elements should be visible
    const arabicText = page.locator('.arabic-text, [dir="rtl"] .text-xl, [lang="ar"]').first()
    await expect(arabicText).toBeVisible({ timeout: 8000 })
  })
})
