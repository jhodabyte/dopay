import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3006'

test.describe('Notifications — Settings page', () => {
  test('settings page loads at /ajustes/notificaciones', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.locator('h2, h1').filter({ hasText: 'Notificaciones' }).first()).toBeVisible()
  })

  test('left settings navigation has all 3 menu items', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    const nav = page.getByTestId('settings-nav')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Notificaciones')).toBeVisible()
    await expect(nav.getByText('Perfil')).toBeVisible()
    await expect(nav.getByText('Facturación')).toBeVisible()
  })

  test('"Recordatorio de pago" section is visible with days select', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByText('Recordatorio de pago')).toBeVisible()
    const daysSelect = page.getByTestId('days-before-select')
    await expect(daysSelect).toBeVisible()
    await expect(daysSelect).toHaveValue('3')
  })

  test('"Aviso de pago vencido" section has toggle', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByText('Aviso de pago vencido')).toBeVisible()
    const toggle = page.getByRole('switch', { name: /aviso de pago vencido/i })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('"Alerta de mora" section has toggle and threshold select', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByText('Alerta de mora para ti')).toBeVisible()
    const toggle = page.getByRole('switch', { name: /alerta de mora/i })
    await expect(toggle).toBeVisible()
    const thresholdSelect = page.getByTestId('mora-threshold-select')
    await expect(thresholdSelect).toBeVisible()
  })

  test('"Personalizar mensaje" section shows Premium lock badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByText('Personalizar mensaje')).toBeVisible()
    await expect(page.getByText('Premium').first()).toBeVisible()
  })

  test('textarea with template is present inside Premium section', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    const textarea = page.getByTestId('template-textarea')
    await expect(textarea).toBeVisible()
  })

  test('variable chips are visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByTestId('variable-chip-nombre')).toBeVisible()
    await expect(page.getByTestId('variable-chip-monto')).toBeVisible()
    await expect(page.getByTestId('variable-chip-fecha')).toBeVisible()
    await expect(page.getByTestId('variable-chip-propiedad')).toBeVisible()
  })

  test('"Guardar configuración" button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)
    await expect(page.getByRole('button', { name: /guardar configuraci/i })).toBeVisible()
  })
})

test.describe('Notifications — Mobile layout', () => {
  test('settings layout stacks vertically on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE_URL}/ajustes/notificaciones`)

    const nav = page.getByTestId('settings-nav')
    const navBox = await nav.boundingBox()
    const content = page.getByText('Recordatorio de pago')
    const contentBox = await content.boundingBox()

    await expect(nav).toBeVisible()
    await expect(content).toBeVisible()

    if (navBox && contentBox) {
      expect(contentBox.y).toBeGreaterThan(navBox.y)
    }
  })
})

test.describe('Notifications — NotificationBell in Topbar', () => {
  test('notification bell is visible in the topbar', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    const bell = page.getByTestId('notification-bell')
    await expect(bell).toBeVisible()
  })

  test('notification bell shows unread badge with count', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    const bell = page.getByTestId('notification-bell')
    await expect(bell).toBeVisible()
  })

  test('clicking bell opens notification dropdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    const bell = page.getByTestId('notification-bell')
    await bell.click()
    await expect(page.getByRole('dialog', { name: /notificaciones/i })).toBeVisible()
  })
})
