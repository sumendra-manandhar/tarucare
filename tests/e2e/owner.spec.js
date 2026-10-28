import { addToCart, adminLogin, adminMenus, expect, fillDelivery, openCart, test } from './fixtures.js'

// The shop owner, signing in to /admin with ADMIN_PASSWORD.
test.describe('Owner', () => {
  test('signs in and sees every menu', async ({ page }) => {
    await adminLogin(page)
    await expect(page.getByRole('heading', { name: /Namaste/ })).toBeVisible()
    expect(await adminMenus(page)).toEqual(['Dashboard', 'Orders', 'Products', 'Customers', 'Inquiries', 'Settings', 'Team'])
  })

  test('a wrong password is rejected', async ({ page }) => {
    await adminLogin(page, { password: 'not-the-password' })
    await expect(page.getByText('Incorrect password')).toBeVisible()
  })

  test('reaches the admin from the website footer', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').getByRole('link', { name: 'Admin' }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()
  })

  test('moves an order along, and cancelling puts stock back', async ({ page, owner }) => {
    // A guest places an order first.
    await owner.put('/api/settings', { data: { requireLogin: false } })
    await page.goto('/')
    await addToCart(page, 'Turmeric Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await fillDelivery(page, { name: 'Ram Bahadur' })
    await page.getByRole('button', { name: /^Place order/ }).click()
    await expect(page.getByText('TC-1001')).toBeVisible()

    await adminLogin(page)
    await page.getByRole('navigation').getByRole('button', { name: /Orders/ }).click()
    await page.getByRole('button', { name: /TC-1001 · Ram Bahadur/ }).click()
    const order = page.getByRole('dialog', { name: 'Order TC-1001' })
    await order.getByRole('button', { name: 'Mark as confirmed' }).click()
    await expect(order.getByText('Confirmed').first()).toBeVisible()

    await order.getByRole('button', { name: 'Cancel order' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel order' }).click()
    await expect(order.getByText('This order was cancelled')).toBeVisible()
    const products = await (await owner.get('/api/products')).json()
    expect(products.find((p) => p.id === 'turmeric').stock).toBe(60)
  })

  test('changes a price and the shop shows it', async ({ page }) => {
    await adminLogin(page)
    await page.getByRole('navigation').getByRole('button', { name: /Products/ }).click()
    await page.getByRole('listitem').filter({ hasText: 'Honey Soap' }).getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('Price (NPR)').fill('425')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Product saved')).toBeVisible()

    await page.goto('/')
    await expect(page.locator('#collection').getByRole('listitem').filter({ hasText: 'Honey Soap' }).getByText('Rs. 425')).toBeVisible()
  })

  test('adds a staff member who can then sign in', async ({ page, browser }) => {
    await adminLogin(page)
    await page.getByRole('navigation').getByRole('button', { name: /Team/ }).click()
    await page.getByRole('button', { name: 'Add staff member' }).click()
    const form = page.getByRole('dialog', { name: 'Add staff member' })
    await form.getByLabel('Name').fill('Bikash Thapa')
    await form.getByLabel('Email').fill('bikash@tarucare.com.np')
    await form.getByLabel('Role').selectOption({ label: 'Sales' })
    await form.getByLabel('Password').fill('sales-pass-123')
    await form.getByRole('button', { name: 'Add staff member' }).click()
    await expect(page.getByText('Bikash Thapa can now sign in')).toBeVisible()

    const staffPage = await (await browser.newContext()).newPage()
    await adminLogin(staffPage, { email: 'bikash@tarucare.com.np', password: 'sales-pass-123' })
    await expect(staffPage.getByRole('heading', { name: 'Namaste, Bikash 🙏' })).toBeVisible()
  })
})
