# End-to-end tests (Playwright)

Tests are written from each user's point of view:

| File | Who | What it checks |
| --- | --- | --- |
| `guest.spec.js` | Shopper who hasn't signed in (desktop **and** phone) | Browsing, filters, product popup, cart, quantity limits, delivery fee, checkout errors, guest order, contact form |
| `customer.spec.js` | Shopper signed in with Google | Sign-in required to order, details pre-filled, My account history and progress, saved details, privacy between customers, sign out |
| `owner.spec.js` | Shop owner | Admin sign-in, footer Admin link, order status and stock, price changes, adding staff |
| `staff.spec.js` | Sales / Marketing staff | Menus per role, server blocks hidden menus, role changes, switched-off accounts |

## Run

```bash
npx playwright install chromium   # first time only, on your own computer
npm run test:e2e                  # build the site, start a test shop, run every test
npm run test:e2e:ui               # same, in Playwright's visual runner (watch each step)
npx playwright test staff         # only files whose name contains "staff"
npx playwright test -g "guest order"   # only tests whose title matches
npx playwright test --project=mobile   # only the phone run
npx playwright show-report        # open the HTML report from the last run
```

The test shop (`test-server.mjs`) uses the real server code with a throwaway database that is reset before each test. Google sign-in is checked against a key made by the test server instead of Google, so tests run offline. None of this is used by the live site.

## Writing a test

```js
import { addToCart, expect, openCart, signInAsCustomer, test } from './fixtures.js'

test.describe('Signed-in customer', () => {
  test('buys two bars of Honey Soap', async ({ page, owner }) => {
    await signInAsCustomer(page, { email: 'asha@gmail.com', name: 'Asha Karki' })
    await page.goto('/')

    const card = await addToCart(page, 'Honey Soap')
    await card.getByRole('button', { name: 'Increase Honey Soap quantity' }).click()

    const cart = await openCart(page)
    await expect(cart.getByText('Rs. 800').first()).toBeVisible()

    // Check results behind the scenes with the owner's API session.
    const products = await (await owner.get('/api/products')).json()
    expect(products.find((p) => p.id === 'honey').stock).toBe(40)
  })
})
```

Guidelines:

- **Find things the way a person does**: `getByRole('button', { name: 'Add to cart' })`, `getByLabel('Phone')`, `getByText('Dhanyabad')`. Avoid CSS classes; they change with the design.
- **Scope to the area** when a word appears twice: `checkout(page).getByLabel('Email')`, `productCard(page, 'Honey Soap')`.
- **Use `expect(...)` for anything that appears or changes**; it waits automatically. Don't use fixed waits.
- **Fixtures** (from `fixtures.js`): `page` (Google script blocked), `owner` (an API session signed in as the owner), and a fresh shop before every test.
- **Helpers**: `addToCart`, `openCart`, `checkout`, `fillDelivery`, `signInAsCustomer`, `adminLogin`, `adminMenus`, `createStaff`, `productCard`.
