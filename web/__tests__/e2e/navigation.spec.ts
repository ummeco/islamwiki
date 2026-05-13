import { test, expect } from '@playwright/test'
test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/islam\.wiki/i)
})
test('quran index loads', async ({ page }) => {
  await page.goto('/quran')
  await expect(page.locator('h1')).toBeVisible()
})
test('hadith index loads', async ({ page }) => {
  await page.goto('/hadith')
  await expect(page.locator('h1')).toBeVisible()
})
test('search works', async ({ page }) => {
  await page.goto('/')
  const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first()
  await searchInput.fill('salah')
  // search is client-side, results should appear
  await page.waitForTimeout(500)
})
