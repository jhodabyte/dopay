import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3005'

test.describe('Plans page (/planes)', () => {
  test('page loads at /planes', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    await expect(page).toHaveURL(/\/planes/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('header badge, title and subtitle are visible', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    await expect(page.getByTestId('header-badge')).toBeVisible()
    await expect(page.getByTestId('header-badge')).toContainText('Planes diseñados para tu cartera')
    await expect(page.getByTestId('header-title')).toBeVisible()
    await expect(page.getByTestId('header-title')).toContainText('Elige el plan ideal')
    await expect(page.getByTestId('header-subtitle')).toBeVisible()
    await expect(page.getByTestId('header-subtitle')).toContainText('Sin contratos forzosos')
  })

  test('billing toggle has Mensual and Anual options', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    const toggle = page.locator('[data-testid="price-header"]')
    await expect(toggle).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mensual' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Anual/ })).toBeVisible()
  })

  test('all 3 plan cards are visible (Básico, Intermedio, Premium)', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    await expect(page.getByTestId('plan-card-basic')).toBeVisible()
    await expect(page.getByTestId('plan-card-intermediate')).toBeVisible()
    await expect(page.getByTestId('plan-card-premium')).toBeVisible()

    await expect(page.getByTestId('plan-card-basic')).toContainText('Básico')
    await expect(page.getByTestId('plan-card-intermediate')).toContainText('Intermedio')
    await expect(page.getByTestId('plan-card-premium')).toContainText('Premium')
  })

  test('"Más popular" badge appears on the Intermedio card', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    const intermediateCard = page.getByTestId('plan-card-intermediate')
    await expect(intermediateCard.getByTestId('popular-badge')).toBeVisible()
    await expect(intermediateCard.getByTestId('popular-badge')).toContainText('Más popular')
  })

  test('toggling to Anual updates price display', async ({ page }) => {
    await page.goto(`${BASE}/planes`)

    const basicCard = page.getByTestId('plan-card-basic')
    await expect(basicCard).not.toContainText('20% de descuento')

    await page.getByRole('button', { name: /Anual/ }).click()

    await expect(basicCard).toContainText('20% de descuento')
    await expect(basicCard).toContainText('Ahorras')
  })

  test('Intermedio card has white text (visual distinction)', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    const intermediateCard = page.getByTestId('plan-card-intermediate')
    const cardEl = intermediateCard

    const bgColor = await cardEl.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    expect(bgColor).toBe('rgb(0, 98, 255)')
  })

  test('trust signals section shows all 3 icons and text', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    const footer = page.getByTestId('price-footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('Datos protegidos')
    await expect(footer).toContainText('Ley 1581 de 2012')
    await expect(footer).toContainText('Pasarela de pagos PCI DSS')
    await expect(footer).toContainText('Soporte 100% en español')
  })

  test('CTA buttons are clickable', async ({ page }) => {
    await page.goto(`${BASE}/planes`)
    await expect(page.getByTestId('cta-btn-basic')).toBeEnabled()
    await expect(page.getByTestId('cta-btn-intermediate')).toBeEnabled()
    await expect(page.getByTestId('cta-btn-premium')).toBeEnabled()
  })

  test('mobile (375px): plan cards stack vertically, toggle works, trust signals stack', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}/planes`)

    await expect(page.getByTestId('plan-card-basic')).toBeVisible()
    await expect(page.getByTestId('plan-card-intermediate')).toBeVisible()
    await expect(page.getByTestId('plan-card-premium')).toBeVisible()

    const cardsRow = page.getByTestId('price-cards-row')
    const flexDir = await cardsRow.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection
    })
    expect(flexDir).toBe('column')

    await page.getByRole('button', { name: /Anual/ }).click()
    await expect(page.getByTestId('plan-card-basic')).toContainText('20% de descuento')

    const footer = page.getByTestId('price-footer')
    const footerFlexDir = await footer.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection
    })
    expect(footerFlexDir).toBe('column')
  })
})
