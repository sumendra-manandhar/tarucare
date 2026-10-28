import { addToCart, checkout, expect, fillDelivery, openCart, signInAsCustomer, test } from './fixtures.js'

// A shopper with a Google account. Sign-in to order is on by default.
test.describe('Signed-in customer', () => {
  test('is asked to sign in with Google before ordering', async ({ page }) => {
    await page.goto('/')
    await addToCart(page, 'Turmeric Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await expect(cart.getByText('Sign in to order')).toBeVisible()
    await expect(checkout(page).getByLabel('Phone')).toBeHidden()
  })

  test('orders with details filled in from Google, then finds the order in My account', async ({ page }) => {
    await signInAsCustomer(page, { email: 'asha@gmail.com', name: 'Asha Karki' })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'My account, Asha Karki' })).toBeVisible()

    await addToCart(page, 'Sandalwood Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await expect(checkout(page).getByLabel('Full name')).toHaveValue('Asha Karki')
    await expect(checkout(page).getByLabel('Email')).toHaveValue('asha@gmail.com')
    await fillDelivery(page)
    await page.getByRole('button', { name: /^Place order/ }).click()
    await expect(page.getByText('Dhanyabad, Asha!')).toBeVisible()

    await page.getByRole('button', { name: 'Track in My account' }).click()
    const account = page.getByRole('dialog', { name: 'My account' })
    await expect(account.getByText('TC-1001')).toBeVisible()
    await expect(account.getByLabel('Status: Received')).toBeVisible()
    await expect(account.getByLabel('Delivery address')).toHaveValue('Pulchowk, near Labim Mall')
  })

  test('saved delivery details fill in the next checkout', async ({ page }) => {
    await signInAsCustomer(page)
    await page.goto('/')
    await page.getByRole('button', { name: /^My account/ }).click()
    const account = page.getByRole('dialog', { name: 'My account' })
    await account.getByLabel('Phone').fill('9800000001')
    await account.getByLabel('City').fill('Pokhara')
    await account.getByLabel('Delivery address').fill('Lakeside Road 6')
    await account.getByRole('button', { name: 'Save details' }).click()
    await expect(account.getByText('Saved')).toBeVisible()
    await page.keyboard.press('Escape')

    await addToCart(page, 'Honey Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await expect(checkout(page).getByLabel('Phone')).toHaveValue('9800000001')
    await expect(checkout(page).getByLabel('City')).toHaveValue('Pokhara')
  })

  test('sees order progress when the shop updates it', async ({ page, owner }) => {
    await signInAsCustomer(page)
    await page.goto('/')
    await addToCart(page, 'Beetroot Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await fillDelivery(page)
    await page.getByRole('button', { name: /^Place order/ }).click()
    await expect(page.getByText('TC-1001')).toBeVisible()

    await owner.patch('/api/orders/TC-1001', { data: { status: 'shipped' } })

    await page.reload()
    await page.getByRole('button', { name: /^My account/ }).click()
    await expect(page.getByRole('dialog', { name: 'My account' }).getByLabel('Status: On the way')).toBeVisible()
  })

  test("cannot see another customer's orders", async ({ page, browser }) => {
    await signInAsCustomer(page, { email: 'asha@gmail.com' })
    await page.goto('/')
    await addToCart(page, 'Turmeric Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await fillDelivery(page)
    await page.getByRole('button', { name: /^Place order/ }).click()
    await expect(page.getByText('TC-1001')).toBeVisible()

    const other = await (await browser.newContext()).newPage()
    await signInAsCustomer(other, { email: 'bikash@gmail.com', name: 'Bikash Thapa' })
    const orders = await (await other.request.get('/api/customer/orders')).json()
    expect(orders).toEqual([])
  })

  test('signs out', async ({ page }) => {
    await signInAsCustomer(page)
    await page.goto('/')
    await page.getByRole('button', { name: /^My account/ }).click()
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('dialog', { name: 'My account' }).getByText('Welcome to TARU CARE')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })
})
