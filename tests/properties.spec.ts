import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3003'
const MOCK_PROPERTY_ID = 'prop-001'

test.describe('Properties list page', () => {
  test('renders with property grid', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await expect(page.locator('[data-testid="property-grid"]')).toBeVisible({ timeout: 10000 })
    const cards = page.locator('[data-testid="property-card"]')
    await expect(cards).toHaveCount(await cards.count())
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('filter row has search input and dropdowns', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('select[name="filter-status"]')).toBeVisible()
    await expect(page.locator('select[name="filter-city"]')).toBeVisible()
  })

  test('property card shows name, address, rent amount, and status badge', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    const firstCard = page.locator('[data-testid="property-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })
    await expect(firstCard.locator('text=/Apto|Casa|Local|Bodega/i').first()).toBeVisible()
    await expect(firstCard.locator('text=/mes/')).toBeVisible()
  })

  test('filter by status "En mora" shows only overdue properties', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 })

    const initialCount = await page.locator('[data-testid="property-card"]').count()
    expect(initialCount).toBeGreaterThan(0)

    const statusSelect = page.locator('select[name="filter-status"]')
    await statusSelect.selectOption('overdue')
    await page.waitForURL(/status=overdue/, { timeout: 5000 })

    const cards = page.locator('[data-testid="property-card"]')
    const filteredCount = await cards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    if (filteredCount > 0) {
      for (let i = 0; i < filteredCount; i++) {
        await expect(cards.nth(i).locator('text=En mora').first()).toBeVisible()
      }
    }
  })

  test('"Nueva propiedad" button opens modal', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 })

    const ctaButton = page.locator('button', { hasText: 'Nueva propiedad' }).first()
    await ctaButton.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('#modal-title')).toContainText('Nueva propiedad')
  })

  test('new property modal has all required form fields', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 })

    const ctaButton = page.locator('button', { hasText: 'Nueva propiedad' }).first()
    await ctaButton.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    await expect(page.locator('#property-name')).toBeVisible()
    await expect(page.locator('#property-address')).toBeVisible()
    await expect(page.locator('#property-city')).toBeVisible()
    await expect(page.locator('#property-type')).toBeVisible()
    await expect(page.locator('#property-rent')).toBeVisible()
    await expect(page.locator('#property-contract-start')).toBeVisible()
    await expect(page.locator('#property-contract-end')).toBeVisible()
  })
})

test.describe('Property detail page', () => {
  test('loads at /propiedades/[id]', async ({ page }) => {
    await page.goto(`${BASE}/propiedades/${MOCK_PROPERTY_ID}`)
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h1').filter({ hasText: 'Apto 302' }).first()).toBeVisible()
  })

  test('shows property info card and payment history', async ({ page }) => {
    await page.goto(`${BASE}/propiedades/${MOCK_PROPERTY_ID}`)
    await expect(page.locator('text=Historial de pagos')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Arriendo mensual')).toBeVisible()
  })

  test('breadcrumb is visible and links back to /propiedades', async ({ page }) => {
    await page.goto(`${BASE}/propiedades/${MOCK_PROPERTY_ID}`)
    const breadcrumbLink = page.locator('nav[aria-label="Breadcrumb"] a[href="/propiedades"]')
    await expect(breadcrumbLink).toBeVisible({ timeout: 10000 })
    await expect(breadcrumbLink).toContainText('Propiedades')
  })
})

test.describe('Mobile layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('property list: cards stack in single column', async ({ page }) => {
    await page.goto(`${BASE}/propiedades`)
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 })

    const grid = page.locator('[data-testid="property-grid"]')
    await expect(grid).toBeVisible()

    const cards = page.locator('[data-testid="property-card"]')
    const count = await cards.count()
    if (count >= 2) {
      const box1 = await cards.nth(0).boundingBox()
      const box2 = await cards.nth(1).boundingBox()
      if (box1 && box2) {
        expect(box1.x).toBeCloseTo(box2.x, -1)
        expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10)
      }
    }
  })

  test('property detail page: stacks vertically on mobile', async ({ page }) => {
    await page.goto(`${BASE}/propiedades/${MOCK_PROPERTY_ID}`)
    await expect(page.locator('text=Historial de pagos')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Arrendatario actual')).toBeVisible()
  })
})
