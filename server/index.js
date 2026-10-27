import cookieParser from 'cookie-parser'
import express from 'express'
import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { benefitChoices, defaultHeroSlides, filters, ORDER_STATUSES } from '../src/data.js'
import { checkPassword, clearSession, isAuthed, issueSession, rateLimit, requireAdmin } from './auth.js'
import { db, newId, save } from './db.js'

const root = dirname(fileURLToPath(import.meta.url))
const UPLOADS = join(root, 'uploads')
const DIST = join(root, '..', 'dist')
mkdirSync(UPLOADS, { recursive: true })

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }))

// ---------- helpers ----------
const CATEGORIES = filters.filter((f) => f !== 'All')
const INGREDIENTS = ['turmeric', 'beetroot', 'sandalwood', 'titepati', 'tulsi', 'honey', 'milk', 'charcoal']
const STATUSES = ['new', 'in_progress', 'resolved']
const MAX_PHOTOS = 12
const HEX = /^#[0-9a-f]{6}$/i

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

class BadRequest extends Error {}

function cleanProduct(body, existing = {}) {
  const name = str(body.name, 80)
  if (!name) throw new BadRequest('Name is required')
  const bar = body.bar ?? existing.bar ?? {}
  for (const k of ['base', 'light', 'dark', 'fleck']) {
    if (!HEX.test(bar[k] ?? '')) throw new BadRequest(`Invalid colour: ${k}`)
  }
  const price = body.price === '' || body.price == null ? null : Number(body.price)
  if (price !== null && (!Number.isFinite(price) || price < 0)) throw new BadRequest('Invalid price')
  // Photos are an ordered gallery; the first one is the cover (kept in `image` for older clients).
  let photos = Array.isArray(body.photos) ? body.photos : body.image ? [{ url: body.image }] : existing.photos ?? []
  photos = photos.slice(0, MAX_PHOTOS).map((ph) => ({ url: str(ph?.url, 200), caption: str(ph?.caption, 140) }))
  if (photos.some((ph) => !ph.url.startsWith('/uploads/'))) throw new BadRequest('Invalid photo')
  const stock = body.stock === '' || body.stock == null ? null : Number(body.stock)
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) throw new BadRequest('Stock must be a whole number')

  return {
    name,
    local: str(body.local, 60),
    tagline: str(body.tagline, 80),
    description: str(body.description, 400),
    benefits: (Array.isArray(body.benefits) ? body.benefits : []).map((b) => str(b, 80)).filter(Boolean).slice(0, 8),
    categories: (Array.isArray(body.categories) ? body.categories : []).filter((c) => CATEGORIES.includes(c)),
    ingredients: (Array.isArray(body.ingredients) ? body.ingredients : []).filter((i) => INGREDIENTS.includes(i)).slice(0, 2),
    skinBenefits: [...new Set((Array.isArray(body.skinBenefits) ? body.skinBenefits : []).filter((b) => benefitChoices.includes(b)))],
    bar: { base: bar.base, light: bar.light, dark: bar.dark, fleck: bar.fleck },
    image: photos[0]?.url ?? '',
    photos,
    price,
    stock,
    published: body.published !== false,
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : existing.order ?? db.products.length + 1,
  }
}

const sorted = (list) => [...list].sort((a, b) => a.order - b.order)

const photoUrls = (p) => (p?.photos ?? []).map((ph) => ph.url)

async function removeUpload(url) {
  if (!url?.startsWith('/uploads/')) return
  if (db.products.some((p) => p.image === url || photoUrls(p).includes(url))) return // still referenced elsewhere
  await unlink(join(UPLOADS, url.slice('/uploads/'.length))).catch(() => {})
}

// ---------- auth ----------
app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60_000, max: 10 }), (req, res) => {
  if (!checkPassword(req.body?.password)) return res.status(401).json({ error: 'Incorrect password' })
  issueSession(res)
  res.json({ ok: true })
})
app.post('/api/auth/logout', (req, res) => {
  clearSession(res)
  res.json({ ok: true })
})
app.get('/api/auth/me', (req, res) => res.json({ authed: isAuthed(req) }))

// ---------- products ----------
app.get('/api/products', (req, res) => {
  const all = req.query.all === '1' && isAuthed(req)
  res.json(sorted(all ? db.products : db.products.filter((p) => p.published)))
})

app.post('/api/products', requireAdmin, async (req, res) => {
  const data = cleanProduct(req.body)
  let id = slug(data.name) || newId()
  if (db.products.some((p) => p.id === id)) id = `${id}-${randomBytes(2).toString('hex')}`
  const now = new Date().toISOString()
  const product = { id, ...data, createdAt: now, updatedAt: now }
  db.products.push(product)
  await save()
  res.status(201).json(product)
})

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  const i = db.products.findIndex((p) => p.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Product not found' })
  const prev = db.products[i]
  db.products[i] = { ...prev, ...cleanProduct(req.body, prev), updatedAt: new Date().toISOString() }
  const kept = new Set(photoUrls(db.products[i]))
  for (const url of new Set([prev.image, ...photoUrls(prev)])) if (url && !kept.has(url)) await removeUpload(url)
  await save()
  res.json(db.products[i])
})

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const i = db.products.findIndex((p) => p.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Product not found' })
  const [removed] = db.products.splice(i, 1)
  for (const url of new Set([removed.image, ...photoUrls(removed)])) await removeUpload(url)
  await save()
  res.json({ ok: true })
})

// ---------- uploads ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) && ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file.originalname).toLowerCase())
    cb(ok ? null : new BadRequest('Only JPG, PNG or WebP images are allowed'), ok)
  },
})
app.post('/api/uploads', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.status(201).json({ url: `/uploads/${req.file.filename}` })
})

// ---------- settings ----------
const SETTING_KEYS = ['phone', 'phoneHref', 'email', 'website', 'facebook', 'instagram', 'teaserText']
app.get('/api/settings', (req, res) => res.json(db.settings))
app.put('/api/settings', requireAdmin, async (req, res) => {
  for (const k of SETTING_KEYS) if (k in req.body) db.settings[k] = str(req.body[k], 200)
  if ('showTeaser' in req.body) db.settings.showTeaser = !!req.body.showTeaser
  if (req.body.heroSlides && typeof req.body.heroSlides === 'object') {
    db.settings.heroSlides = Object.fromEntries(
      Object.keys(defaultHeroSlides).map((need) => {
        const id = str(req.body.heroSlides[need], 80)
        return [need, db.products.some((p) => p.id === id) ? id : db.settings.heroSlides?.[need] ?? defaultHeroSlides[need]]
      }),
    )
  }
  if ('cartEnabled' in req.body) db.settings.cartEnabled = !!req.body.cartEnabled
  for (const k of ['deliveryFee', 'freeDeliveryOver']) {
    if (k in req.body) db.settings[k] = Math.max(0, Math.round(Number(req.body[k]) || 0))
  }
  if ('maxQtyPerItem' in req.body) db.settings.maxQtyPerItem = Math.min(99, Math.max(1, Math.round(Number(req.body.maxQtyPerItem) || 1)))
  if ('deliveryNote' in req.body) db.settings.deliveryNote = str(req.body.deliveryNote, 160)
  if (Array.isArray(req.body.paymentMethods)) {
    const methods = [...new Set(req.body.paymentMethods.map((m) => str(m, 40)).filter(Boolean))].slice(0, 8)
    if (!methods.length) throw new BadRequest('Add at least one payment method')
    db.settings.paymentMethods = methods
  }
  if (db.settings.phone) db.settings.phoneHref = `tel:${db.settings.phone.replace(/[^\d+]/g, '')}`
  await save()
  res.json(db.settings)
})

// ---------- inquiries ----------
app.post('/api/inquiries', rateLimit({ windowMs: 10 * 60_000, max: 8 }), async (req, res) => {
  const b = req.body ?? {}
  if (b.website) return res.status(201).json({ ok: true }) // honeypot: silently drop bots
  const type = b.type === 'order' ? 'order' : 'general'
  const inquiry = {
    id: newId(),
    type,
    name: str(b.name, 80),
    email: str(b.email, 120),
    phone: str(b.phone, 30),
    subject: str(b.subject, 140),
    message: str(b.message, 3000),
    productId: type === 'order' ? str(b.productId, 80) : '',
    productName: '',
    quantity: type === 'order' ? Math.min(Math.max(parseInt(b.quantity, 10) || 1, 1), 10000) : null,
    status: 'new',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  if (!inquiry.name) throw new BadRequest('Name is required')
  if (!/^\S+@\S+\.\S+$/.test(inquiry.email)) throw new BadRequest('A valid email is required')
  if (type === 'order') {
    const p = db.products.find((x) => x.id === inquiry.productId)
    if (!p) throw new BadRequest('Unknown product')
    inquiry.productName = p.name
    inquiry.subject ||= `Order: ${p.name}`
  } else if (inquiry.message.length < 10) {
    throw new BadRequest('Message is too short')
  }
  db.inquiries.unshift(inquiry)
  await save()
  res.status(201).json({ ok: true })
})

app.get('/api/inquiries', requireAdmin, (req, res) => res.json(db.inquiries))

app.patch('/api/inquiries/:id', requireAdmin, async (req, res) => {
  const q = db.inquiries.find((x) => x.id === req.params.id)
  if (!q) return res.status(404).json({ error: 'Inquiry not found' })
  if ('status' in req.body) {
    if (!STATUSES.includes(req.body.status)) throw new BadRequest('Invalid status')
    q.status = req.body.status
  }
  if ('notes' in req.body) q.notes = str(req.body.notes, 3000)
  q.updatedAt = new Date().toISOString()
  await save()
  res.json(q)
})

app.delete('/api/inquiries/:id', requireAdmin, async (req, res) => {
  const i = db.inquiries.findIndex((x) => x.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Inquiry not found' })
  db.inquiries.splice(i, 1)
  await save()
  res.json({ ok: true })
})

// ---------- orders ----------
const deliveryFor = (subtotal) => {
  const { deliveryFee = 0, freeDeliveryOver = 0 } = db.settings
  return freeDeliveryOver && subtotal >= freeDeliveryOver ? 0 : deliveryFee
}

// Applies an order's items to stock: -1 reserves them, +1 returns them.
function moveStock(items, sign) {
  for (const it of items) {
    const p = db.products.find((x) => x.id === it.id)
    if (p && p.stock != null) p.stock = Math.max(0, p.stock + sign * it.qty)
  }
}

app.post('/api/orders', rateLimit({ windowMs: 10 * 60_000, max: 6 }), async (req, res) => {
  const b = req.body ?? {}
  if (b.website) return res.status(201).json({ id: 'TC-0000' }) // honeypot
  if (!db.settings.cartEnabled) throw new BadRequest('Online ordering is paused. Please call or message us to order.')

  const c = b.customer ?? {}
  const customer = { name: str(c.name, 80), phone: str(c.phone, 30), email: str(c.email, 120), address: str(c.address, 200), city: str(c.city, 60) }
  if (!customer.name) throw new BadRequest('Name is required')
  if (!/^[+\d][\d\s-]{6,}$/.test(customer.phone)) throw new BadRequest('A valid phone number is required')
  if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) throw new BadRequest('That email address looks wrong')
  if (!customer.address || !customer.city) throw new BadRequest('Delivery address and city are required')
  const payment = db.settings.paymentMethods.includes(b.payment) ? b.payment : db.settings.paymentMethods[0]

  const lines = Array.isArray(b.items) ? b.items.slice(0, 30) : []
  const items = []
  for (const line of lines) {
    const p = db.products.find((x) => x.id === line?.id && x.published)
    const qty = parseInt(line?.qty, 10)
    if (!p || p.price == null) throw new BadRequest('One of the soaps in your cart is no longer available')
    if (!(qty >= 1 && qty <= db.settings.maxQtyPerItem)) throw new BadRequest(`You can order up to ${db.settings.maxQtyPerItem} of each soap`)
    if (p.stock != null && qty > p.stock) throw new BadRequest(p.stock ? `Only ${p.stock} ${p.name} left in stock` : `${p.name} is sold out`)
    if (items.some((i) => i.id === p.id)) continue
    items.push({ id: p.id, name: p.name, price: p.price, qty })
  }
  if (!items.length) throw new BadRequest('Your cart is empty')

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const delivery = deliveryFor(subtotal)
  const last = Math.max(1000, ...db.orders.map((o) => Number(o.id.slice(3)) || 0))
  const now = new Date().toISOString()
  const order = {
    id: `TC-${last + 1}`, status: 'pending', customer, payment, notes: str(b.notes, 1000), adminNotes: '',
    items, subtotal, delivery, total: subtotal + delivery, createdAt: now, updatedAt: now,
  }
  moveStock(items, -1)
  db.orders.unshift(order)
  await save()
  res.status(201).json({ id: order.id, total: order.total, items, payment })
})

app.get('/api/orders', requireAdmin, (req, res) => res.json(db.orders))

app.patch('/api/orders/:id', requireAdmin, async (req, res) => {
  const o = db.orders.find((x) => x.id === req.params.id)
  if (!o) return res.status(404).json({ error: 'Order not found' })
  if ('status' in req.body && req.body.status !== o.status) {
    if (!ORDER_STATUSES.includes(req.body.status)) throw new BadRequest('Invalid status')
    // Cancelling puts the soaps back on the shelf; restoring a cancelled order takes them again.
    if (req.body.status === 'cancelled') moveStock(o.items, +1)
    else if (o.status === 'cancelled') moveStock(o.items, -1)
    o.status = req.body.status
  }
  if ('adminNotes' in req.body) o.adminNotes = str(req.body.adminNotes, 3000)
  o.updatedAt = new Date().toISOString()
  await save()
  res.json({ order: o, products: db.products })
})

app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
  const i = db.orders.findIndex((x) => x.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Order not found' })
  db.orders.splice(i, 1)
  await save()
  res.json({ ok: true })
})

// ---------- production: serve the built site ----------
if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(join(DIST, 'index.html')))
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Express 4 doesn't catch async rejections on its own, so wrap every route handler.
for (const layer of app._router.stack) {
  for (const l of layer.route?.stack ?? []) {
    const fn = l.handle
    if (fn.length < 4) l.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  }
}

app.use((err, req, res, next) => {
  if (err instanceof BadRequest || err instanceof multer.MulterError) return res.status(400).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`TARU CARE server on http://localhost:${PORT}`))
