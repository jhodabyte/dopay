import { test, expect } from '@playwright/test'

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 })
  })

  test('loads at /dashboard without auth redirect in MOCK_MODE', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('renders all 4 KPI cards with values', async ({ page }) => {
    const kpiRow = page.locator('[data-testid="kpi-row"]')
    await expect(kpiRow).toBeVisible()

    const cards = kpiRow.locator('.bg-white')
    await expect(cards).toHaveCount(4)

    await expect(page.getByText('Propiedades activas')).toBeVisible()
    await expect(page.getByText('Pagos recibidos este mes')).toBeVisible()
    await expect(page.getByText('Pagos pendientes')).toBeVisible()
    await expect(page.getByText('Ingresos del mes')).toBeVisible()
  })

  test('renders activity feed section with items', async ({ page }) => {
    const contentRow = page.locator('[data-testid="content-row"]')
    await expect(contentRow).toBeVisible()
    await expect(page.getByText('Actividad reciente')).toBeVisible()
    await expect(page.getByText('Ver todo')).toBeVisible()
  })

  test('renders pending payments section', async ({ page }) => {
    await expect(page.getByText('Cobros pendientes')).toBeVisible()
  })

  test('renders income bar chart', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const chartContainer = page.locator('[data-testid="income-chart"]')
    await expect(chartContainer).toBeVisible({ timeout: 20000 })
    await expect(page.getByText('Ingresos mensuales')).toBeVisible()
    await expect(page.getByText('Últimos 6 meses')).toBeVisible()
    const svgElement = chartContainer.locator('svg').first()
    await expect(svgElement).toBeVisible({ timeout: 20000 })
  })

  test('renders property distribution chart', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const chartContainer = page.locator('[data-testid="property-distribution-chart"]')
    await expect(chartContainer).toBeVisible({ timeout: 20000 })
    await expect(page.getByText('Estado de propiedades')).toBeVisible()
    const svgElement = chartContainer.locator('svg').first()
    await expect(svgElement).toBeVisible({ timeout: 20000 })
  })

  test('"Registrar pago" CTA button opens the modal', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const ctaButton = page.getByRole('button', { name: 'Registrar pago' })
    await expect(ctaButton).toBeVisible({ timeout: 20000 })
    await ctaButton.click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(page.getByText('Registrar pago').nth(1)).toBeVisible()
  })

  test('modal has all required form fields', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Registrar pago' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await expect(page.getByLabel('Propiedad')).toBeVisible()
    await expect(page.getByLabel('Concepto')).toBeVisible()
    await expect(page.getByLabel('Monto')).toBeVisible()
    await expect(page.getByLabel('Método de pago')).toBeVisible()
    await expect(page.getByLabel('Notas')).toBeVisible()
    await expect(page.getByText('Notificar al arrendatario')).toBeVisible()
    await expect(page.getByRole('switch')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar pago' })).toBeVisible()
  })

  test('modal closes when "Cancelar" is clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Registrar pago' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})

test.describe('Dashboard mobile layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 })
  })

  test('KPI cards stack vertically on mobile', async ({ page }) => {
    const kpiRow = page.locator('[data-testid="kpi-row"]')
    await expect(kpiRow).toBeVisible()
    const cards = kpiRow.locator('.bg-white')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThanOrEqual(4)

    const firstCard = cards.nth(0)
    const secondCard = cards.nth(1)
    const firstBox = await firstCard.boundingBox()
    const secondBox = await secondCard.boundingBox()

    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10)
    }
  })

  test('content columns stack vertically on mobile', async ({ page }) => {
    const contentRow = page.locator('[data-testid="content-row"]')
    await expect(contentRow).toBeVisible()

    const columns = contentRow.locator('.bg-white')
    const columnCount = await columns.count()
    expect(columnCount).toBeGreaterThanOrEqual(2)

    const firstCol = columns.nth(0)
    const secondCol = columns.nth(1)
    const firstBox = await firstCol.boundingBox()
    const secondBox = await secondCol.boundingBox()

    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10)
    }
  })
})
