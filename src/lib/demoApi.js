// In-browser stand-in for the Express API, used only by static preview builds (VITE_DEMO).
// Everything is kept in this browser's localStorage, so each visitor gets their own sandbox.
// It mirrors the server's rules (server/index.js) closely enough to demo the admin and checkout.
import { benefitChoices, contact, defaultHeroSlides, defaultRoles, filters, ORDER_STATUSES, PERMISSIONS, products as seedProducts, shopDefaults, withSkinBenefits } from '../data'

export const DEMO_PASSWORD = 'taru@123'
const KEY = 'taru-demo:db'
const SESSION = 'taru-demo:session'
const CUSTOMER = 'taru-demo:customer'
const ALL = PERMISSIONS.map((p) => p.key)
export const DEMO_STAFF_PASSWORD = 'demo1234'
const CATEGORIES = filters.filter((f) => f !== 'All')
const INGREDIENTS = ['turmeric', 'beetroot', 'sandalwood', 'titepati', 'tulsi', 'honey', 'milk', 'charcoal']

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const now = () => new Date().toISOString()
const ago = (h) => new Date(Date.now() - h * 3600_000).toISOString()

function seed() {
  const products = seedProducts.map((p, i) => ({ ...withSkinBenefits(p), image: '', photos: [], published: true, order: i + 1, createdAt: now(), updatedAt: now() }))
  const line = (id, qty) => {
    const p = products.find((x) => x.id === id)
    return { id, name: p.name, price: p.price, qty }
  }
  const order = (id, h, status, customer, items, payment, customerId = null) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const delivery = subtotal >= shopDefaults.freeDeliveryOver ? 0 : shopDefaults.deliveryFee
    return { id, status, customerId, customer, payment, notes: '', adminNotes: '', items, subtotal, delivery, total: subtotal + delivery, createdAt: ago(h), updatedAt: ago(h) }
  }
  return {
    products,
    settings: { ...contact, ...shopDefaults, showTeaser: true, teaserText: 'Exciting new herbal blends are coming soon for every skin need.', heroSlides: defaultHeroSlides },
    orders: [
      order('TC-1003', 2, 'pending', { name: 'Prakriti J.', phone: '9800000003', email: 'prakriti@example.com', address: 'Jhamsikhel', city: 'Lalitpur' }, [line('turmeric', 2), line('honey', 1)], 'Cash on Delivery', 'c_prakriti'),
      order('TC-1002', 26, 'confirmed', { name: 'Suman R.', phone: '9800000002', email: '', address: 'Lakeside', city: 'Pokhara' }, [line('charcoal', 1)], 'eSewa'),
      order('TC-1001', 80, 'delivered', { name: 'Anjali M.', phone: '9800000001', email: 'anjali@example.com', address: 'Kirtipur-5', city: 'Kathmandu' }, [line('sandalwood', 2), line('goatmilk-tulsi', 1)], 'Khalti', 'c_anjali'),
    ],
    ...people(),
    inquiries: [
      { id: 'q2', type: 'general', name: 'Rohan G.', email: 'rohan@example.com', phone: '', subject: 'Wholesale for my salon', message: 'Do you offer wholesale pricing for 50+ bars a month?', productId: '', productName: '', quantity: null, status: 'new', notes: '', createdAt: ago(5), updatedAt: ago(5) },
      { id: 'q1', type: 'general', name: 'Sophie L.', email: 'sophie@example.com', phone: '', subject: 'Export to France', message: 'We are a natural products boutique interested in importing your soaps.', productId: '', productName: '', quantity: null, status: 'resolved', notes: '', createdAt: ago(60), updatedAt: ago(60) },
    ],
  }
}

// Sample shoppers and staff so the Customers and Team pages have something to show.
function people() {
  return {
    customers: [
      { id: 'c_prakriti', email: 'prakriti@example.com', name: 'Prakriti J.', picture: '', phone: '9800000003', address: 'Jhamsikhel', city: 'Lalitpur', createdAt: ago(240), lastLoginAt: ago(2) },
      { id: 'c_anjali', email: 'anjali@example.com', name: 'Anjali M.', picture: '', phone: '9800000001', address: 'Kirtipur-5', city: 'Kathmandu', createdAt: ago(400), lastLoginAt: ago(80) },
    ],
    staff: [
      { id: 's_bikash', name: 'Bikash T.', email: 'sales@tarucare.demo', roleId: 'sales', active: true, password: DEMO_STAFF_PASSWORD, createdAt: ago(300), lastLoginAt: ago(20) },
      { id: 's_mira', name: 'Mira K.', email: 'marketing@tarucare.demo', roleId: 'marketing', active: true, password: DEMO_STAFF_PASSWORD, createdAt: ago(300), lastLoginAt: null },
    ],
    roles: structuredClone(defaultRoles),
  }
}

let db
function load() {
  if (db) return db
  try {
    db = JSON.parse(localStorage.getItem(KEY))
  } catch {
    db = null
  }
  if (!db?.products) db = seed()
  if (!db.roles) Object.assign(db, people()) // demo data saved before staff & customers existed
  db.settings = { ...shopDefaults, ...db.settings }
  return db
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    throw new ApiError('This browser has run out of space for demo data. Remove a few photos and try again.', 507)
  }
}
const storage = (area, fn) => {
  try {
    return fn(area === 'session' ? sessionStorage : localStorage)
  } catch {
    return null
  }
}
// Signs the visitor straight into the demo admin as the owner (no password needed).
export function startDemoSession() {
  storage('session', (s) => s.setItem(SESSION, 'owner'))
}

// Same shape as the server's adminUser(): the owner, or a staff member with their role's menus.
function currentUser() {
  const who = storage('session', (s) => s.getItem(SESSION))
  if (!who) return null
  if (who === 'owner' || who === '1') return { id: 'owner', name: 'Owner', email: '', owner: true, role: 'Owner', permissions: ALL }
  const m = db.staff.find((x) => x.id === who && x.active)
  if (!m) return null
  const role = db.roles.find((r) => r.id === m.roleId)
  return { id: m.id, name: m.name, email: m.email, owner: false, role: role?.name ?? 'No role', permissions: role?.permissions ?? [] }
}
const authed = () => !!currentUser()
const requireAdmin = (perm) => {
  const u = currentUser()
  if (!u) throw new ApiError('Not signed in', 401)
  if (perm && !u.permissions.includes(perm)) throw new ApiError(`Your role doesn’t include access to ${PERMISSIONS.find((p) => p.key === perm)?.label ?? perm}.`, 403)
  return u
}
const customerId = () => storage('local', (s) => s.getItem(CUSTOMER))
const publicCustomer = (c) => ({ id: c.id, email: c.email, name: c.name, picture: c.picture, phone: c.phone, address: c.address, city: c.city })
const summary = (c) => {
  const mine = db.orders.filter((o) => o.customerId === c.id)
  return { ...publicCustomer(c), createdAt: c.createdAt, lastLoginAt: c.lastLoginAt ?? null, orderCount: mine.length, spent: mine.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0) }
}
const publicStaff = ({ password, ...m }) => m
const cleanPermissions = (list) => ALL.filter((p) => Array.isArray(list) && list.includes(p))
const sorted = (list) => [...list].sort((a, b) => a.order - b.order)
const clone = (v) => JSON.parse(JSON.stringify(v))

function cleanProduct(body, existing = {}) {
  const name = str(body.name, 80)
  if (!name) throw new ApiError('Name is required')
  const price = body.price === '' || body.price == null ? null : Number(body.price)
  if (price !== null && (!Number.isFinite(price) || price < 0)) throw new ApiError('Invalid price')
  const stock = body.stock === '' || body.stock == null ? null : Number(body.stock)
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) throw new ApiError('Stock must be a whole number')
  const photos = (Array.isArray(body.photos) ? body.photos : existing.photos ?? []).slice(0, 12).map((ph) => ({ url: String(ph?.url ?? ''), caption: str(ph?.caption, 140) })).filter((ph) => ph.url)
  return {
    name,
    local: str(body.local, 60),
    tagline: str(body.tagline, 80),
    description: str(body.description, 400),
    benefits: (Array.isArray(body.benefits) ? body.benefits : []).map((b) => str(b, 80)).filter(Boolean).slice(0, 8),
    categories: (Array.isArray(body.categories) ? body.categories : []).filter((c) => CATEGORIES.includes(c)),
    ingredients: (Array.isArray(body.ingredients) ? body.ingredients : []).filter((i) => INGREDIENTS.includes(i)).slice(0, 2),
    skinBenefits: [...new Set((Array.isArray(body.skinBenefits) ? body.skinBenefits : []).filter((b) => benefitChoices.includes(b)))],
    bar: body.bar ?? existing.bar,
    image: photos[0]?.url ?? '',
    photos,
    price,
    stock,
    published: body.published !== false,
    order: Number.isFinite(Number(body.order)) && body.order !== '' ? Number(body.order) : existing.order ?? db.products.length + 1,
  }
}

function moveStock(items, sign) {
  for (const it of items) {
    const p = db.products.find((x) => x.id === it.id)
    if (p && p.stock != null) p.stock = Math.max(0, p.stock + sign * it.qty)
  }
}

function placeOrder(b) {
  const s = db.settings
  if (!s.cartEnabled) throw new ApiError('Online ordering is paused. Please call or message us to order.')
  const account = db.customers.find((c) => c.id === customerId())
  if (s.requireLogin && !account) throw new ApiError('Please sign in to place your order.', 401)
  const c = b.customer ?? {}
  const customer = { name: str(c.name, 80), phone: str(c.phone, 30), email: str(c.email, 120), address: str(c.address, 200), city: str(c.city, 60) }
  if (!customer.name) throw new ApiError('Name is required')
  if (!/^[+\d][\d\s-]{6,}$/.test(customer.phone)) throw new ApiError('A valid phone number is required')
  if (!customer.address || !customer.city) throw new ApiError('Delivery address and city are required')
  if (account) customer.email = account.email
  const items = []
  for (const line of Array.isArray(b.items) ? b.items : []) {
    const p = db.products.find((x) => x.id === line?.id && x.published)
    const qty = parseInt(line?.qty, 10)
    if (!p || p.price == null) throw new ApiError('One of the soaps in your cart is no longer available')
    if (!(qty >= 1 && qty <= s.maxQtyPerItem)) throw new ApiError(`You can order up to ${s.maxQtyPerItem} of each soap`)
    if (p.stock != null && qty > p.stock) throw new ApiError(p.stock ? `Only ${p.stock} ${p.name} left in stock` : `${p.name} is sold out`)
    items.push({ id: p.id, name: p.name, price: p.price, qty })
  }
  if (!items.length) throw new ApiError('Your cart is empty')
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
  const delivery = s.freeDeliveryOver && subtotal >= s.freeDeliveryOver ? 0 : s.deliveryFee
  const last = Math.max(1000, ...db.orders.map((o) => Number(o.id.slice(3)) || 0))
  const payment = s.paymentMethods.includes(b.payment) ? b.payment : s.paymentMethods[0]
  const order = { id: `TC-${last + 1}`, status: 'pending', customerId: account?.id ?? null, customer, payment, notes: str(b.notes, 1000), adminNotes: '', items, subtotal, delivery, total: subtotal + delivery, createdAt: now(), updatedAt: now() }
  moveStock(items, -1)
  db.orders.unshift(order)
  if (account) Object.assign(account, { phone: customer.phone, address: customer.address, city: customer.city })
  return { id: order.id, total: order.total, items, payment }
}

function updateSettings(body) {
  const s = db.settings
  for (const k of ['phone', 'email', 'website', 'facebook', 'instagram', 'teaserText', 'deliveryNote']) if (k in body) s[k] = str(body[k], 200)
  if ('showTeaser' in body) s.showTeaser = !!body.showTeaser
  if ('cartEnabled' in body) s.cartEnabled = !!body.cartEnabled
  if ('requireLogin' in body) s.requireLogin = !!body.requireLogin
  for (const k of ['deliveryFee', 'freeDeliveryOver']) if (k in body) s[k] = Math.max(0, Math.round(Number(body[k]) || 0))
  if ('maxQtyPerItem' in body) s.maxQtyPerItem = Math.min(99, Math.max(1, Math.round(Number(body.maxQtyPerItem) || 1)))
  if (Array.isArray(body.paymentMethods)) {
    const m = [...new Set(body.paymentMethods.map((x) => str(x, 40)).filter(Boolean))]
    if (!m.length) throw new ApiError('Add at least one payment method')
    s.paymentMethods = m
  }
  if (body.heroSlides) s.heroSlides = { ...defaultHeroSlides, ...body.heroSlides }
  if (s.phone) s.phoneHref = `tel:${s.phone.replace(/[^\d+]/g, '')}`
  return s
}

function route(method, path, body) {
  load()
  const [p, query = ''] = path.split('?')
  const [, res, id] = p.split('/')
  const find = (list, what) => {
    const x = list.find((i) => i.id === id)
    if (!x) throw new ApiError(`${what} not found`, 404)
    return x
  }

  if (res === 'auth') {
    if (id === 'me') return { authed: authed(), user: currentUser() }
    if (id === 'login') {
      const email = str(body?.email, 120).toLowerCase()
      if (!email) {
        if (body?.password !== DEMO_PASSWORD) throw new ApiError('Incorrect password', 401)
        storage('session', (s) => s.setItem(SESSION, 'owner'))
        return { ok: true }
      }
      const m = db.staff.find((x) => x.email === email)
      if (!m || !m.active || m.password !== body?.password) throw new ApiError('Incorrect email or password', 401)
      m.lastLoginAt = now()
      storage('session', (s) => s.setItem(SESSION, m.id))
      return { ok: true }
    }
    if (id === 'logout') {
      storage('session', (s) => s.removeItem(SESSION))
      return { ok: true }
    }
  }

  if (res === 'config') return { googleClientId: null, demo: true }

  if (res === 'customer') {
    if (id === 'demo') {
      // Stands in for "Sign in with Google" so the checkout and account flow can be tried.
      let c = db.customers.find((x) => x.id === 'c_demo')
      if (!c) {
        c = { id: 'c_demo', email: 'you@example.com', name: 'Demo Shopper', picture: '', phone: '', address: '', city: '', createdAt: now() }
        db.customers.push(c)
      }
      c.lastLoginAt = now()
      storage('local', (s) => s.setItem(CUSTOMER, c.id))
      return publicCustomer(c)
    }
    if (id === 'logout') {
      storage('local', (s) => s.removeItem(CUSTOMER))
      return { ok: true }
    }
    const c = db.customers.find((x) => x.id === customerId())
    if (id === 'me' && method === 'GET') return c ? publicCustomer(c) : null
    if (!c) throw new ApiError('Please sign in first.', 401)
    if (id === 'me' && method === 'PUT') {
      if ('name' in body) {
        if (!str(body.name, 80)) throw new ApiError('Name is required')
        c.name = str(body.name, 80)
      }
      if ('phone' in body) {
        if (body.phone && !/^[+\d][\d\s-]{6,}$/.test(str(body.phone, 30))) throw new ApiError('That phone number looks wrong')
        c.phone = str(body.phone, 30)
      }
      if ('address' in body) c.address = str(body.address, 200)
      if ('city' in body) c.city = str(body.city, 60)
      return publicCustomer(c)
    }
    if (id === 'orders') return db.orders.filter((o) => o.customerId === c.id).map(({ adminNotes, ...o }) => o)
  }

  if (res === 'customers') {
    requireAdmin('customers')
    if (!id) return db.customers.map(summary)
    const c = find(db.customers, 'Customer')
    return { ...summary(c), orders: db.orders.filter((o) => o.customerId === c.id) }
  }

  if (res === 'staff') {
    const me = requireAdmin('team')
    if (method === 'GET') return db.staff.map(publicStaff)
    const clean = (b, existing) => {
      const name = str(b.name, 80)
      const email = str(b.email, 120).toLowerCase()
      if (!name) throw new ApiError('Name is required')
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError('Enter a valid email')
      if (db.staff.some((x) => x.email === email && x.id !== existing?.id)) throw new ApiError('Someone already uses that email')
      if (!db.roles.some((r) => r.id === b.roleId)) throw new ApiError('Pick a role')
      if ((b.password || !existing) && String(b.password ?? '').length < 8) throw new ApiError('Password must be at least 8 characters')
      return { name, email, roleId: b.roleId, active: b.active !== false, ...(b.password ? { password: b.password } : {}) }
    }
    if (method === 'POST') {
      const m = { id: `s_${Date.now().toString(36)}`, ...clean(body ?? {}), createdAt: now(), lastLoginAt: null }
      db.staff.push(m)
      return publicStaff(m)
    }
    const m = find(db.staff, 'Staff member')
    if (method === 'PUT') return publicStaff(Object.assign(m, clean(body ?? {}, m)))
    if (method === 'DELETE') {
      if (m.id === me.id) throw new ApiError('You can’t delete your own account')
      db.staff = db.staff.filter((x) => x !== m)
      return { ok: true }
    }
  }

  if (res === 'roles') {
    if (method === 'GET') {
      requireAdmin()
      return db.roles
    }
    requireAdmin('team')
    const nameOf = (v, r) => {
      const name = str(v, 40)
      if (!name) throw new ApiError('Role name is required')
      if (db.roles.some((x) => x !== r && x.name.toLowerCase() === name.toLowerCase())) throw new ApiError('A role with that name already exists')
      return name
    }
    if (method === 'POST') {
      const name = nameOf(body?.name)
      const r = { id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-4)}`, name, permissions: cleanPermissions(body?.permissions) }
      db.roles.push(r)
      return r
    }
    const r = find(db.roles, 'Role')
    if (method === 'PUT') {
      if ('name' in body) r.name = nameOf(body.name, r)
      if ('permissions' in body) r.permissions = cleanPermissions(body.permissions)
      return r
    }
    if (method === 'DELETE') {
      const users = db.staff.filter((m) => m.roleId === r.id).length
      if (users) throw new ApiError(`${users} staff member${users > 1 ? 's use' : ' uses'} this role. Move them to another role first.`)
      db.roles = db.roles.filter((x) => x !== r)
      return { ok: true }
    }
  }

  if (res === 'products') {
    if (method === 'GET') return sorted(query.includes('all=1') && authed() ? db.products : db.products.filter((x) => x.published))
    requireAdmin('products')
    if (method === 'POST') {
      const data = cleanProduct(body)
      let pid = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `p${Date.now()}`
      if (db.products.some((x) => x.id === pid)) pid += `-${Date.now().toString(36).slice(-4)}`
      const product = { id: pid, ...data, createdAt: now(), updatedAt: now() }
      db.products.push(product)
      return product
    }
    const prod = find(db.products, 'Product')
    if (method === 'PUT') return Object.assign(prod, cleanProduct(body, prod), { updatedAt: now() })
    if (method === 'DELETE') {
      db.products = db.products.filter((x) => x.id !== id)
      return { ok: true }
    }
  }

  if (res === 'settings') {
    if (method === 'GET') return db.settings
    requireAdmin('settings')
    return updateSettings(body ?? {})
  }

  if (res === 'orders') {
    if (method === 'POST') return placeOrder(body ?? {})
    requireAdmin('orders')
    if (method === 'GET') return db.orders
    const o = find(db.orders, 'Order')
    if (method === 'PATCH') {
      if ('status' in body && body.status !== o.status) {
        if (!ORDER_STATUSES.includes(body.status)) throw new ApiError('Invalid status')
        if (body.status === 'cancelled') moveStock(o.items, +1)
        else if (o.status === 'cancelled') moveStock(o.items, -1)
        o.status = body.status
      }
      if ('adminNotes' in body) o.adminNotes = str(body.adminNotes, 3000)
      o.updatedAt = now()
      return { order: o, products: db.products }
    }
    if (method === 'DELETE') {
      db.orders = db.orders.filter((x) => x.id !== id)
      return { ok: true }
    }
  }

  if (res === 'inquiries') {
    if (method === 'POST') {
      const b = body ?? {}
      const type = b.type === 'order' ? 'order' : 'general'
      const product = db.products.find((x) => x.id === b.productId)
      const q = {
        id: `q${Date.now()}`, type, name: str(b.name, 80), email: str(b.email, 120), phone: str(b.phone, 30),
        subject: str(b.subject, 140) || (type === 'order' && product ? `Order: ${product.name}` : ''), message: str(b.message, 3000),
        productId: product?.id ?? '', productName: product?.name ?? '', quantity: type === 'order' ? Math.max(parseInt(b.quantity, 10) || 1, 1) : null,
        status: 'new', notes: '', createdAt: now(), updatedAt: now(),
      }
      if (!q.name) throw new ApiError('Name is required')
      if (!/^\S+@\S+\.\S+$/.test(q.email)) throw new ApiError('A valid email is required')
      db.inquiries.unshift(q)
      return { ok: true }
    }
    requireAdmin('inquiries')
    if (method === 'GET') return db.inquiries
    const q = find(db.inquiries, 'Inquiry')
    if (method === 'PATCH') {
      if ('status' in body) q.status = body.status
      if ('notes' in body) q.notes = str(body.notes, 3000)
      q.updatedAt = now()
      return q
    }
    if (method === 'DELETE') {
      db.inquiries = db.inquiries.filter((x) => x.id !== id)
      return { ok: true }
    }
  }

  throw new ApiError('Not found', 404)
}

// Photos become small data URLs so they fit in localStorage.
function toDataUrl(file, max = 1100) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * scale), height: Math.round(img.height * scale) })
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.78))
    }
    img.onerror = () => reject(new ApiError('That file is not a readable image'))
    img.src = url
  })
}

async function call(method, path, body) {
  const before = JSON.stringify(load())
  try {
    const result = route(method, path, body)
    if (method !== 'GET') save()
    return clone(result)
  } catch (err) {
    if (before) db = JSON.parse(before) // undo a half-applied change
    throw err
  }
}

export const demoApi = {
  get: (p) => call('GET', p),
  post: (p, body) => call('POST', p, body),
  put: (p, body) => call('PUT', p, body),
  patch: (p, body) => call('PATCH', p, body),
  del: (p) => call('DELETE', p),
  upload: async (file) => {
    load()
    requireAdmin('products')
    return { url: await toDataUrl(file) }
  },
}
