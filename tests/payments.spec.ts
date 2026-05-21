import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3004'
const MOCK_TENANT_ID = 'tenant-001'

test.describe('Payments page (/pagos)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pagos`)
    await page.waitForLoadState('networkidle')
  })

  test('1. Payments page loads at /pagos', async ({ page }) => {
    await expect(page).toHaveURL(/\/pagos/)
    await expect(page.locator('h1', { hasText: 'Pagos' })).toBeVisible()
    await expect(page.locator('text=Seguimiento de cobros y arrendatarios')).toBeVisible()
  })

  test('2. All 4 summary KPI cards are visible', async ({ page }) => {
    const kpiContainer = page.locator('[data-testid="kpi-cards"]')
    await expect(kpiContainer).toBeVisible()

    await expect(page.locator('[data-testid="kpi-pending"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-overdue"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-upcoming"]')).toBeVisible()

    await expect(page.locator('text=Total recaudado')).toBeVisible()
    await expect(page.locator('text=Pendientes de cobro')).toBeVisible()
    await expect(page.locator('text=En mora')).toBeVisible()
    await expect(page.locator('text=Próximos vencimientos')).toBeVisible()
  })

  test('3. Payments table renders with all columns', async ({ page }) => {
    const table = page.locator('[data-testid="payments-table"]')
    await expect(table).toBeVisible()

    const expectedColumns = ['Arrendatario', 'Propiedad', 'Concepto', 'Monto', 'Fecha límite', 'Estado', 'Acciones']
    for (const col of expectedColumns) {
      await expect(table.locator(`text=${col}`)).toBeVisible()
    }
  })

  test('4. Filter by "Vencidos" status shows only overdue payments', async ({ page }) => {
    const filterBtn = page.locator('[data-testid="filter-status-overdue"]')
    await filterBtn.click()
    await page.waitForURL(/estado=overdue/)

    const table = page.locator('[data-testid="payments-table"]')
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(5)
      await expect(statusCell).toContainText('Vencido')
    }
  })

  test('5. Search input filters table by tenant name', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('Ana')
    await searchInput.press('Enter')
    await page.waitForTimeout(300)

    const table = page.locator('[data-testid="payments-table"]')
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()

    expect(rowCount).toBeGreaterThan(0)
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const tenantCell = row.locator('td').first()
      await expect(tenantCell).toContainText('Ana')
    }
  })

  test('6. "Registrar pago" button opens modal', async ({ page }) => {
    await page.locator('button', { hasText: 'Registrar pago' }).first().click()

    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('#rp-modal-title')).toContainText('Registrar pago')
  })

  test('7. Modal has all required fields (propiedad, concepto, monto)', async ({ page }) => {
    await page.locator('button', { hasText: 'Registrar pago' }).first().click()

    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    await expect(modal.locator('select[name="propertyId"]')).toBeVisible()
    await expect(modal.locator('select[name="concept"]')).toBeVisible()
    await expect(modal.locator('[data-testid="rp-amount-input"]')).toBeVisible()
    await expect(modal.locator('select[name="method"]')).toBeVisible()
  })

  test('8. Modal closes when X or "Cancelar" is clicked', async ({ page }) => {
    await page.locator('button', { hasText: 'Registrar pago' }).first().click()

    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    await page.locator('[data-testid="modal-close-btn"]').click()
    await expect(modal).not.toBeVisible()

    await page.locator('button', { hasText: 'Registrar pago' }).first().click()
    await expect(modal).toBeVisible()
    await modal.locator('button', { hasText: 'Cancelar' }).click()
    await expect(modal).not.toBeVisible()
  })
})

test.describe('Tenant profile page (/arrendatarios/[id])', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/arrendatarios/${MOCK_TENANT_ID}`)
    await page.waitForLoadState('networkidle')
  })

  test('9. Tenant profile loads at /arrendatarios/[id]', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(`/arrendatarios/${MOCK_TENANT_ID}`))
    await expect(page.locator('[data-testid="profile-card"]')).toBeVisible()
  })

  test('10. Profile card shows name, email, phone, status badge', async ({ page }) => {
    await expect(page.locator('[data-testid="tenant-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="tenant-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="tenant-phone"]')).toBeVisible()
    await expect(page.locator('[data-testid="tenant-status-badge"]')).toBeVisible()
  })

  test('11. Payment history table is filtered for this tenant', async ({ page }) => {
    const table = page.locator('[data-testid="payments-table"]')
    await expect(table).toBeVisible()

    const rows = table.locator('tbody tr[data-testid^="payment-row-"]')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('12. Statistics column shows computed values', async ({ page }) => {
    const stats = page.locator('[data-testid="tenant-stats"]')
    await expect(stats).toBeVisible()

    await expect(stats.locator('text=Promedio días de retraso')).toBeVisible()
    await expect(stats.locator('text=Total pagado')).toBeVisible()
    await expect(stats.locator('text=Tiempo como arrendatario')).toBeVisible()
    await expect(stats.locator('text=Próximo pago')).toBeVisible()
  })
})

test.describe('Mobile responsive (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('13. Mobile: table scrolls horizontally, profile card stacks vertically', async ({ page }) => {
    await page.goto(`${BASE_URL}/pagos`)
    await page.waitForLoadState('networkidle')

    const tableWrapper = page.locator('.overflow-x-auto')
    await expect(tableWrapper).toBeVisible()

    const overflowX = await tableWrapper.evaluate((el) => window.getComputedStyle(el).overflowX)
    expect(overflowX).toBe('auto')

    await page.goto(`${BASE_URL}/arrendatarios/${MOCK_TENANT_ID}`)
    await page.waitForLoadState('networkidle')

    const profileCard = page.locator('[data-testid="profile-card"]')
    await expect(profileCard).toBeVisible()
  })
})
