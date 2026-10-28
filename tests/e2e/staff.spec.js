import { adminLogin, adminMenus, createStaff, expect, test } from './fixtures.js'

// Staff members sign in with their own email and only see their role's menus.
test.describe('Staff roles', () => {
  test('Sales sees only the sales menus', async ({ page, owner }) => {
    await createStaff(owner, { name: 'Bikash Thapa', email: 'sales@tarucare.com.np', roleId: 'sales' })
    await adminLogin(page, { email: 'sales@tarucare.com.np', password: 'staff-pass-123' })
    expect(await adminMenus(page)).toEqual(['Dashboard', 'Orders', 'Customers', 'Inquiries'])
    await expect(page.getByText('Sales', { exact: true })).toBeVisible()
  })

  test('Marketing cannot open orders, even by asking the server directly', async ({ page, owner }) => {
    await createStaff(owner, { name: 'Mira Karki', email: 'marketing@tarucare.com.np', roleId: 'marketing' })
    await adminLogin(page, { email: 'marketing@tarucare.com.np', password: 'staff-pass-123' })
    expect(await adminMenus(page)).toEqual(['Dashboard', 'Products', 'Inquiries'])

    const res = await page.request.get('/api/orders')
    expect(res.status()).toBe(403)
    expect((await res.json()).error).toContain('Orders')
  })

  test('a role change applies the next time the page loads', async ({ page, owner }) => {
    await createStaff(owner, { name: 'Mira Karki', email: 'marketing@tarucare.com.np', roleId: 'marketing' })
    await adminLogin(page, { email: 'marketing@tarucare.com.np', password: 'staff-pass-123' })
    expect(await adminMenus(page)).not.toContain('Orders')

    await owner.put('/api/roles/marketing', { data: { permissions: ['dashboard', 'products', 'inquiries', 'orders'] } })
    await page.reload()
    expect(await adminMenus(page)).toContain('Orders')
  })

  test('the owner ticks a menu off in the Team grid', async ({ page, owner, browser }) => {
    await createStaff(owner, { name: 'Bikash Thapa', email: 'sales@tarucare.com.np', roleId: 'sales' })
    await adminLogin(page)
    await page.getByRole('navigation').getByRole('button', { name: /Team/ }).click()
    await page.getByRole('checkbox', { name: 'Sales: Customers' }).click()
    await page.getByRole('row').filter({ has: page.getByRole('checkbox', { name: 'Sales: Customers' }) }).getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Sales updated')).toBeVisible()

    const staffPage = await (await browser.newContext()).newPage()
    await adminLogin(staffPage, { email: 'sales@tarucare.com.np', password: 'staff-pass-123' })
    expect(await adminMenus(staffPage)).toEqual(['Dashboard', 'Orders', 'Inquiries'])
  })

  test('a switched-off account is signed out straight away', async ({ page, owner }) => {
    const member = await createStaff(owner, { name: 'Bikash Thapa', email: 'sales@tarucare.com.np', roleId: 'sales' })
    await adminLogin(page, { email: 'sales@tarucare.com.np', password: 'staff-pass-123' })
    await expect(page.getByRole('heading', { name: /Namaste/ })).toBeVisible()

    await owner.put(`/api/staff/${member.id}`, { data: { ...member, active: false } })
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()
  })

  test('a wrong staff password is rejected', async ({ page, owner }) => {
    await createStaff(owner, { name: 'Bikash Thapa', email: 'sales@tarucare.com.np', roleId: 'sales' })
    await adminLogin(page, { email: 'sales@tarucare.com.np', password: 'wrong-password' })
    await expect(page.getByText('Incorrect email or password')).toBeVisible()
  })
})
