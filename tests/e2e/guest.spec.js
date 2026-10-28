import { addToCart, checkout, expect, fillDelivery, openCart, productCard, test } from './fixtures.js'

// A shopper who has not signed in. The shop allows guest checkout in these tests.
test.describe('Guest shopper', () => {
  test.beforeEach(async ({ owner, page }) => {
    await owner.put('/api/settings', { data: { requireLogin: false } })
    await page.goto('/')
  })

  test('browses soaps and filters by skin need', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const shop = page.locator('#shop')
    await shop.scrollIntoViewIfNeeded()
    await shop.getByRole('radio', { name: /Deep/ }).click()
    // Deep cleansing has three soaps: Beetroot, Titepati and Active Charcoal.
    await expect(shop.getByText(/0?1 \/ 0?3/)).toBeVisible()
    await expect(page.locator('#collection').getByRole('heading', { name: 'Turmeric Soap' })).toBeVisible()
  })

  test('opens a soap and sees its price and benefits', async ({ page }) => {
    await productCard(page, 'Sandalwood Soap').getByRole('button', { name: 'Details' }).click()
    const popup = page.getByRole('dialog', { name: 'Sandalwood Soap' })
    await expect(popup).toBeVisible()
    await expect(popup.getByText('Rs. 450').first()).toBeVisible()
    await expect(popup.getByText('Key Benefits')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(popup).toBeHidden()
  })

  test('adds to cart and changes quantity from the product card', async ({ page }) => {
    const card = await addToCart(page, 'Turmeric Soap')
    await expect(page.getByRole('button', { name: 'Open cart, 1 item' })).toBeVisible()
    await card.getByRole('button', { name: 'Increase Turmeric Soap quantity' }).click()
    await expect(page.getByRole('button', { name: 'Open cart, 2 items' })).toBeVisible()
    await card.getByRole('button', { name: 'Decrease Turmeric Soap quantity' }).click()
    await card.getByRole('button', { name: 'Decrease Turmeric Soap quantity' }).click()
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible()
  })

  test('cannot order more than 10 of one soap', async ({ page }) => {
    const card = await addToCart(page, 'Honey Soap')
    const plus = card.getByRole('button', { name: 'Increase Honey Soap quantity' })
    for (let i = 0; i < 9; i++) await plus.click()
    await expect(plus).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Open cart, 10 items' })).toBeVisible()
  })

  test('cart shows correct totals and delivery fee', async ({ page }) => {
    await addToCart(page, 'Turmeric Soap') // Rs. 350
    let cart = await openCart(page)
    await expect(cart.getByText('Rs. 650 away from free delivery', { exact: false })).toBeVisible()
    await expect(cart.getByText('Rs. 100', { exact: true })).toBeVisible() // delivery fee
    await expect(cart.getByRole('button', { name: 'Checkout · Rs. 450' })).toBeVisible()

    await cart.getByRole('button', { name: 'Increase Turmeric Soap quantity' }).click()
    await cart.getByRole('button', { name: 'Increase Turmeric Soap quantity' }).click()
    // 3 × 350 = 1,050, which is over the Rs. 1,000 free-delivery threshold.
    await expect(cart.getByText('You’ve unlocked free delivery')).toBeVisible()
    await expect(cart.getByRole('button', { name: 'Checkout · Rs. 1,050' })).toBeVisible()
  })

  test('cart is still there after reloading the page', async ({ page }) => {
    await addToCart(page, 'Beetroot Soap')
    await page.reload()
    await expect(page.getByRole('button', { name: 'Open cart, 1 item' })).toBeVisible()
  })

  test('checkout catches missing or wrong details', async ({ page }) => {
    await addToCart(page, 'Titepati Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await checkout(page).getByLabel('Phone').fill('12')
    await page.getByRole('button', { name: /^Place order/ }).click()
    await expect(page.getByText('Enter a phone number we can call')).toBeVisible()
    await expect(page.getByText('Enter your name')).toBeVisible()
    await expect(page.getByText('Where should we deliver?')).toBeVisible()
  })

  test('places an order as a guest', async ({ page, owner }) => {
    await addToCart(page, 'Turmeric Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await fillDelivery(page, { name: 'Ram Bahadur', city: 'Bhaktapur' })
    await page.getByRole('radio', { name: 'eSewa' }).click()
    await page.getByRole('button', { name: /^Place order/ }).click()

    await expect(page.getByText('Dhanyabad, Ram!')).toBeVisible()
    await expect(page.getByText('TC-1001')).toBeVisible()

    // Behind the scenes: the order exists and stock went down.
    const [order] = await (await owner.get('/api/orders')).json()
    expect(order).toMatchObject({ id: 'TC-1001', payment: 'eSewa', total: 450, status: 'pending' })
    const products = await (await owner.get('/api/products')).json()
    expect(products.find((p) => p.id === 'turmeric').stock).toBe(59)
  })

  test('double-clicking "Place order" creates only one order', async ({ page, owner }) => {
    await addToCart(page, 'Honey Soap')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^Checkout/ }).click()
    await fillDelivery(page, { name: 'Sita Rai' })
    await page.getByRole('button', { name: /^Place order/ }).dblclick()
    await expect(page.getByText('Dhanyabad, Sita!')).toBeVisible()
    expect(await (await owner.get('/api/orders')).json()).toHaveLength(1)
  })

  test('sends a message through the contact form', async ({ page, owner }) => {
    const contact = page.locator('#contact')
    await contact.scrollIntoViewIfNeeded()
    await contact.getByLabel('Name').fill('Asha Karki')
    await contact.getByLabel('Email').fill('asha@gmail.com')
    await contact.getByLabel('Subject').fill('Gift boxes')
    await contact.getByLabel('Message').fill('Do you make gift boxes for Tihar? I need 20.')
    await contact.getByRole('button', { name: /send/i }).click()
    await expect(contact.getByText(/thank|received|sent/i).first()).toBeVisible()
    const [inquiry] = await (await owner.get('/api/inquiries')).json()
    expect(inquiry).toMatchObject({ name: 'Asha Karki', email: 'asha@gmail.com' })
  })

  test('phone: bottom bar shows the running total and opens the cart', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Only shown on phones')
    await addToCart(page, 'Honey Soap')
    const bar = page.getByRole('button', { name: /1 item · Rs\. 500/ }) // Rs. 400 + Rs. 100 delivery
    await expect(bar).toBeVisible()
    await bar.click()
    await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible()
  })
})
