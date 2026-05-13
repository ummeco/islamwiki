import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('search input is visible in header', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('typing a query shows dropdown results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('prayer')
    // Wait for debounce + API response
    await page.waitForTimeout(500)
    // Dropdown should appear with results
    const dropdown = page.locator('[class*="absolute"]').filter({ hasText: /Quran|Hadith|Seerah|People|Books|Articles/ }).first()
    await expect(dropdown).toBeVisible({ timeout: 5000 })
  })

  test('search dropdown shows group headers', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('Allah')
    await page.waitForTimeout(500)
    // Should see at least one group header (Quran, Hadith, etc.)
    const groupHeader = page.locator('[class*="uppercase"]').filter({ hasText: /Quran|Hadith|Seerah|People|Books|Articles|Sects/ }).first()
    await expect(groupHeader).toBeVisible({ timeout: 5000 })
  })

  test('pressing Enter navigates to search results page', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('Bukhari')
    await searchInput.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=Bukhari/i, { timeout: 5000 })
  })

  test('clear button removes query', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('quran')
    await page.waitForTimeout(300)
    // Clear button should appear
    const clearBtn = page.locator('button[aria-label="Clear search"]').first()
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    await expect(searchInput).toHaveValue('')
  })

  test('empty query shows no dropdown', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('test')
    await page.waitForTimeout(300)
    await searchInput.fill('')
    await page.waitForTimeout(300)
    // Dropdown should be gone
    const dropdown = page.locator('[class*="min-h-\\[50vh\\]"]')
    await expect(dropdown).not.toBeVisible()
  })

  test('search results page renders for a query', async ({ page }) => {
    await page.goto('/search?q=prayer')
    await expect(page.locator('h1, [class*="search"]').first()).toBeVisible({ timeout: 8000 })
    // Should have results or empty state
    const content = page.locator('body')
    await expect(content).toContainText(/result|prayer/i)
  })

  test('search results page with type filter', async ({ page }) => {
    await page.goto('/search?q=prayer&type=hadith')
    await expect(page.locator('body')).toContainText(/hadith|prayer/i, { timeout: 8000 })
  })

  test('Escape key closes dropdown', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('quran')
    await page.waitForTimeout(500)
    await searchInput.press('Escape')
    const dropdown = page.locator('[class*="min-h-\\[50vh\\]"]')
    await expect(dropdown).not.toBeVisible()
  })

  test('arrow keys navigate results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('Allah')
    await page.waitForTimeout(600)
    // Press down arrow — first result should be highlighted
    await searchInput.press('ArrowDown')
    const highlighted = page.locator('[class*="bg-iw-accent/10"]').first()
    await expect(highlighted).toBeVisible({ timeout: 3000 })
  })
})
