import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders both columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')

    // Left panel with brand text
    await expect(page.getByText('Controla tus arriendos sin perder un solo pago.')).toBeVisible()

    // Right panel with form title
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible()
    await expect(page.getByText('Ingresa a tu cuenta')).toBeVisible()
  })

  test('shows inline error messages on empty submit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')

    await page.getByRole('button', { name: 'Ingresar' }).click()

    await expect(page.getByText('El correo es requerido')).toBeVisible()
    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible()
  })

  test('shows password toggle button', async ({ page }) => {
    await page.goto('/login')

    const passwordInput = page.locator('#password')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click the eye toggle button
    await page.getByRole('button', { name: /mostrar contraseña/i }).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await page.getByRole('button', { name: /ocultar contraseña/i }).click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

test.describe('Registro step 1', () => {
  test('renders with step 1 indicator', async ({ page }) => {
    await page.goto('/registro')

    await expect(page.getByText('Paso 1 de 3')).toBeVisible()
    await expect(page.getByText('Crea tu cuenta')).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/registro')

    await page.getByRole('button', { name: 'Continuar' }).click()

    await expect(page.getByText('El nombre debe tener al menos 2 caracteres')).toBeVisible()
    await expect(page.getByText('El apellido debe tener al menos 2 caracteres')).toBeVisible()
    await expect(page.getByText('El correo es requerido')).toBeVisible()
  })

  test('navigates to paso-2 after valid step 1 data', async ({ page }) => {
    await page.goto('/registro')

    await page.locator('#firstName').fill('Juan')
    await page.locator('#lastName').fill('García')
    await page.locator('#email').fill('juan@example.com')
    await page.locator('#phone').fill('3001234567')
    await page.locator('#password').fill('Password123')

    await page.locator('input[type="checkbox"]').first().check()

    await page.getByRole('button', { name: 'Continuar' }).click()

    await expect(page).toHaveURL(/paso-2/)
  })
})

test.describe('Registro paso 2', () => {
  test('renders with step 2 indicator and 4 radio options', async ({ page }) => {
    await page.goto('/registro/paso-2')

    await expect(page.getByText('Paso 2 de 3')).toBeVisible()

    const radioOptions = page.locator('input[type="radio"]')
    await expect(radioOptions).toHaveCount(4)

    await expect(page.getByText('En papel o cuaderno')).toBeVisible()
    await expect(page.getByText('Hojas de cálculo (Excel, Sheets)')).toBeVisible()
    await expect(page.getByText('Otra aplicación')).toBeVisible()
    await expect(page.getByText('No tengo un sistema definido')).toBeVisible()
  })
})

test.describe('Registro paso 3', () => {
  test('renders all 3 plan cards with "Más popular" badge on Intermedio', async ({ page }) => {
    await page.goto('/registro/paso-3')

    await expect(page.getByText('Paso 3 de 3')).toBeVisible()
    await expect(page.getByText('Elige el plan ideal para tus propiedades')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Básico' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Intermedio' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Premium' })).toBeVisible()

    await expect(page.getByText('Más popular')).toBeVisible()
  })
})

test.describe('Mobile layout', () => {
  test('login shows only form column at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')

    // Form should be visible
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible()

    // Left panel headline should not be visible (hidden on mobile via md:flex)
    await expect(page.getByText('Controla tus arriendos sin perder un solo pago.')).not.toBeVisible()
  })

  test('registro shows only form column at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/registro')

    // Form should be visible
    await expect(page.getByText('Paso 1 de 3')).toBeVisible()
    await expect(page.getByText('Crea tu cuenta')).toBeVisible()

    // Left panel content hidden on mobile
    await expect(page.getByText('Únete a +1.000 propietarios que ya organizan sus arriendos.')).not.toBeVisible()
  })
})
