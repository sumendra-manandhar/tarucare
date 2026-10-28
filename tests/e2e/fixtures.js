import { test as base, expect } from '@playwright/test'

export { expect }
export const OWNER_PASSWORD = 'owner-test-pass' // must match tests/e2e/test-server.mjs

export const test = base.extend({
  // Every test starts with a freshly seeded shop.
  resetShop: [
    async ({ request }, use) => {
      await request.post('/test/reset')
      await use()
    },
    { auto: true },
  ],

  // Google's sign-in script is not loaded in tests; sign-in goes through signInAsCustomer().
  page: async ({ page }, use) => {
    await page.route('https://accounts.google.com/**', (route) => route.fulfill({ body: '' }))
    await use(page)
  },

  // An owner session for setting things up or checking results behind the scenes.
  owner: async ({ playwright, baseURL }, use) => {
    const api = await playwright.request.newContext({ baseURL })
    await api.post('/api/auth/login', { data: { password: OWNER_PASSWORD } })
    await use(api)
    await api.dispose()
  },
})

// ---------- shopper helpers ----------

/** The product card in "All our soaps". */
export const productCard = (page, name) =>
  page.locator('#collection').getByRole('listitem').filter({ has: page.getByRole('heading', { name, exact: true }) })

export async function addToCart(page, name) {
  const card = productCard(page, name)
  await card.scrollIntoViewIfNeeded()
  await card.getByRole('button', { name: 'Add to cart' }).click()
  await expect(card.getByText('In cart')).toBeVisible()
  return card
}

export async function openCart(page) {
  await page.getByRole('button', { name: /^Open cart/ }).click()
  const cart = page.getByRole('dialog', { name: 'Your cart' })
  await expect(cart).toBeVisible()
  return cart
}

/** The checkout form inside the cart (scoped so it never matches the contact form's fields). */
export const checkout = (page) => page.getByRole('dialog', { name: 'Your cart' })

export async function fillDelivery(page, { phone = '9812345678', name, address = 'Pulchowk, near Labim Mall', city = 'Lalitpur' } = {}) {
  const form = checkout(page)
  await form.getByLabel('Phone').fill(phone)
  if (name) await form.getByLabel('Full name').fill(name)
  await form.getByLabel('Delivery address').fill(address)
  await form.getByLabel('City').fill(city)
}

/** Signs the browser in as a Google customer (the same server check a real Google sign-in goes through). */
export async function signInAsCustomer(page, { email = 'asha@gmail.com', name = 'Asha Karki' } = {}) {
  const credential = await (await page.request.get('/test/google-token', { params: { email, name } })).text()
  const res = await page.request.post('/api/customer/google', { data: { credential } })
  expect(res.ok()).toBeTruthy()
}

// ---------- admin helpers ----------

export async function adminLogin(page, { email = '', password = OWNER_PASSWORD } = {}) {
  await page.goto('/admin')
  if (email) await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

/** The admin sidebar's menu items, in order. */
export async function adminMenus(page) {
  const items = page.locator('aside').first().getByRole('navigation').getByRole('listitem')
  await expect(items.first()).toBeVisible()
  return (await items.allInnerTexts()).map((t) => t.split('\n')[0].trim())
}

export async function createStaff(owner, { name, email, roleId, password = 'staff-pass-123' }) {
  const res = await owner.post('/api/staff', { data: { name, email, roleId, password } })
  expect(res.ok()).toBeTruthy()
  return res.json()
}
