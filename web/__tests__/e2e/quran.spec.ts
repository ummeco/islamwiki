import { test, expect } from '@playwright/test'
test('surah al-fatiha loads', async ({ page }) => {
  await page.goto('/quran/al-fatiha')
  await expect(page.locator('h1, [class*="surah"]')).toBeVisible()
})
test('surah navigation', async ({ page }) => {
  await page.goto('/quran')
  const firstSurah = page.locator('a[href*="/quran/"]').first()
  await firstSurah.click()
  await expect(page).toHaveURL(/\/quran\//)
})
