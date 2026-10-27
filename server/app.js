import cookieParser from 'cookie-parser'
import express from 'express'
import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { benefitChoices, defaultHeroSlides, filters, ORDER_STATUSES } from '../src/data.js'
import { adminConfigured, checkPassword, clearSession, isAuthed, issueSession, rateLimit, requireAdmin } from './auth.js'
import { newId } from './seed.js'

// ---------- helpers ----------
const CATEGORIES = filters.filter((f) => f !== 'All')
const INGREDIENTS = ['turmeric', 'beetroot', 'sandalwood', 'titepati', 'tulsi', 'honey', 'milk', 'charcoal']
const STATUSES = ['new', 'in_progress', 'resolved']
const MAX_PHOTOS = 12
const HEX = /^#[0-9a-f]{6}$/i
const UPLOAD_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
const sorted = (list) => [...list].sort((a, b) => a.order - b.order)
const photoUrls = (p) => (p?.photos ?? []).map((ph) => ph.url)
const uploadName = (url) => (url?.startsWith('/uploads/') ? url.slice('/uploads/'.length) : null)

class BadRequest extends Error {}
class NotFound extends Error {}

function cleanProduct(db, body, existing = {}) {
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
  if (photos.some((ph) => !uploadName(ph.url))) throw new BadRequest('Invalid photo')
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
    order: Number.isFinite(Number(body.order)) && body.order !== '' ? Number(body.order) : existing.order ?? db.products.length + 1,
  }
}

const find = (list, id, what) => {
  const x = list.find((i) => i.id === id)
  if (!x) throw new NotFound(`${what} not found`)
  return x
}

const deliveryFor = (settings, subtotal) => {
  const { deliveryFee = 0, freeDeliveryOver = 0 } = settings
  return freeDeliveryOver && subtotal >= freeDeliveryOver ? 0 : deliveryFee
}

// Applies an order's items to stock: -1 reserves them, +1 returns them.
function moveStock(db, items, sign) {
  for (const it of items) {
    const p = db.products.find((x) => x.id === it.id)
    if (p && p.stock != null) p.stock = Math.max(0, p.stock + sign * it.qty)
  }
}

export function createApp(store) {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())

  // Deletes photos no product uses any more.
  async function dropUnused(db, urls) {
    const used = new Set(db.products.flatMap((p) => [p.image, ...photoUrls(p)]))
    for (const url of new Set(urls)) {
      const name = uploadName(url)
      if (name && !used.has(url)) await store.deletePhoto(name).catch(() => {})
    }
  }

  // ---------- auth ----------
  app.post('/api/auth/login', rateLimit(store, { name: 'login', windowMs: 15 * 60_000, max: 10 }), (req, res) => {
    if (!adminConfigured()) return res.status(503).json({ error: 'The admin password has not been set. Add ADMIN_PASSWORD to the server’s environment variables.' })
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
  app.get('/api/products', async (req, res) => {
    const db = await store.read()
    const all = req.query.all === '1' && isAuthed(req)
    res.json(sorted(all ? db.products : db.products.filter((p) => p.published)))
  })

  app.post('/api/products', requireAdmin, async (req, res) => {
    const product = await store.write((db) => {
      const data = cleanProduct(db, req.body)
      let id = slug(data.name) || newId()
      if (db.products.some((p) => p.id === id)) id = `${id}-${randomBytes(2).toString('hex')}`
      const now = new Date().toISOString()
      const p = { id, ...data, createdAt: now, updatedAt: now }
      db.products.push(p)
      return p
    })
    res.status(201).json(product)
  })

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const saved = await store.write(async (db) => {
      const prev = find(db.products, req.params.id, 'Product')
      const next = { ...prev, ...cleanProduct(db, req.body, prev), updatedAt: new Date().toISOString() }
      db.products[db.products.indexOf(prev)] = next
      await dropUnused(db, [prev.image, ...photoUrls(prev)])
      return next
    })
    res.json(saved)
  })

  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    await store.write(async (db) => {
      const prev = find(db.products, req.params.id, 'Product')
      db.products = db.products.filter((p) => p !== prev)
      await dropUnused(db, [prev.image, ...photoUrls(prev)])
    })
    res.json({ ok: true })
  })

  // ---------- photos ----------
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = file.mimetype in UPLOAD_TYPES && ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file.originalname).toLowerCase())
      cb(ok ? null : new BadRequest('Only JPG, PNG or WebP images are allowed'), ok)
    },
  })
  app.post('/api/uploads', requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}${UPLOAD_TYPES[req.file.mimetype]}`
    await store.putPhoto(name, req.file.buffer, req.file.mimetype)
    res.status(201).json({ url: `/uploads/${name}` })
  })

  app.get('/uploads/:name', async (req, res) => {
    const photo = /^[\w.-]+$/.test(req.params.name) ? await store.getPhoto(req.params.name) : null
    if (!photo) return res.status(404).end()
    // Names are unique per upload, so browsers and the CDN can keep them forever.
    res.set({ 'Content-Type': photo.type, 'Cache-Control': 'public, max-age=31536000, immutable' }).send(photo.body)
  })

  // ---------- settings ----------
  const SETTING_KEYS = ['phone', 'phoneHref', 'email', 'website', 'facebook', 'instagram', 'teaserText']
  app.get('/api/settings', async (req, res) => res.json((await store.read()).settings))
  app.put('/api/settings', requireAdmin, async (req, res) => {
    const settings = await store.write((db) => {
      const s = db.settings
      const b = req.body ?? {}
      for (const k of SETTING_KEYS) if (k in b) s[k] = str(b[k], 200)
      if ('showTeaser' in b) s.showTeaser = !!b.showTeaser
      if (b.heroSlides && typeof b.heroSlides === 'object') {
        s.heroSlides = Object.fromEntries(
          Object.keys(defaultHeroSlides).map((need) => {
            const id = str(b.heroSlides[need], 80)
            return [need, db.products.some((p) => p.id === id) ? id : s.heroSlides?.[need] ?? defaultHeroSlides[need]]
          }),
        )
      }
      if ('cartEnabled' in b) s.cartEnabled = !!b.cartEnabled
      for (const k of ['deliveryFee', 'freeDeliveryOver']) if (k in b) s[k] = Math.max(0, Math.round(Number(b[k]) || 0))
      if ('maxQtyPerItem' in b) s.maxQtyPerItem = Math.min(99, Math.max(1, Math.round(Number(b.maxQtyPerItem) || 1)))
      if ('deliveryNote' in b) s.deliveryNote = str(b.deliveryNote, 160)
      if (Array.isArray(b.paymentMethods)) {
        const methods = [...new Set(b.paymentMethods.map((m) => str(m, 40)).filter(Boolean))].slice(0, 8)
        if (!methods.length) throw new BadRequest('Add at least one payment method')
        s.paymentMethods = methods
      }
      if (s.phone) s.phoneHref = `tel:${s.phone.replace(/[^\d+]/g, '')}`
      return s
    })
    res.json(settings)
  })

  // ---------- inquiries ----------
  app.post('/api/inquiries', rateLimit(store, { name: 'inquiry', windowMs: 10 * 60_000, max: 8 }), async (req, res) => {
    const b = req.body ?? {}
    if (b.website) return res.status(201).json({ ok: true }) // honeypot: silently drop bots
    await store.write((db) => {
      const type = b.type === 'order' ? 'order' : 'general'
      const now = new Date().toISOString()
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
        createdAt: now,
        updatedAt: now,
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
    })
    res.status(201).json({ ok: true })
  })

  app.get('/api/inquiries', requireAdmin, async (req, res) => res.json((await store.read()).inquiries))

  app.patch('/api/inquiries/:id', requireAdmin, async (req, res) => {
    const q = await store.write((db) => {
      const q = find(db.inquiries, req.params.id, 'Inquiry')
      if ('status' in req.body) {
        if (!STATUSES.includes(req.body.status)) throw new BadRequest('Invalid status')
        q.status = req.body.status
      }
      if ('notes' in req.body) q.notes = str(req.body.notes, 3000)
      q.updatedAt = new Date().toISOString()
      return q
    })
    res.json(q)
  })

  app.delete('/api/inquiries/:id', requireAdmin, async (req, res) => {
    await store.write((db) => {
      const q = find(db.inquiries, req.params.id, 'Inquiry')
      db.inquiries = db.inquiries.filter((x) => x !== q)
    })
    res.json({ ok: true })
  })

  // ---------- orders ----------
  app.post('/api/orders', rateLimit(store, { name: 'order', windowMs: 10 * 60_000, max: 6 }), async (req, res) => {
    const b = req.body ?? {}
    if (b.website) return res.status(201).json({ id: 'TC-0000' }) // honeypot
    const placed = await store.write((db) => {
      const s = db.settings
      if (!s.cartEnabled) throw new BadRequest('Online ordering is paused. Please call or message us to order.')
      const c = b.customer ?? {}
      const customer = { name: str(c.name, 80), phone: str(c.phone, 30), email: str(c.email, 120), address: str(c.address, 200), city: str(c.city, 60) }
      if (!customer.name) throw new BadRequest('Name is required')
      if (!/^[+\d][\d\s-]{6,}$/.test(customer.phone)) throw new BadRequest('A valid phone number is required')
      if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) throw new BadRequest('That email address looks wrong')
      if (!customer.address || !customer.city) throw new BadRequest('Delivery address and city are required')
      const payment = s.paymentMethods.includes(b.payment) ? b.payment : s.paymentMethods[0]

      const items = []
      for (const line of Array.isArray(b.items) ? b.items.slice(0, 30) : []) {
        const p = db.products.find((x) => x.id === line?.id && x.published)
        const qty = parseInt(line?.qty, 10)
        if (!p || p.price == null) throw new BadRequest('One of the soaps in your cart is no longer available')
        if (!(qty >= 1 && qty <= s.maxQtyPerItem)) throw new BadRequest(`You can order up to ${s.maxQtyPerItem} of each soap`)
        if (p.stock != null && qty > p.stock) throw new BadRequest(p.stock ? `Only ${p.stock} ${p.name} left in stock` : `${p.name} is sold out`)
        if (items.some((i) => i.id === p.id)) continue
        items.push({ id: p.id, name: p.name, price: p.price, qty })
      }
      if (!items.length) throw new BadRequest('Your cart is empty')

      const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
      const delivery = deliveryFor(s, subtotal)
      const last = Math.max(1000, ...db.orders.map((o) => Number(o.id.slice(3)) || 0))
      const now = new Date().toISOString()
      const order = {
        id: `TC-${last + 1}`, status: 'pending', customer, payment, notes: str(b.notes, 1000), adminNotes: '',
        items, subtotal, delivery, total: subtotal + delivery, createdAt: now, updatedAt: now,
      }
      moveStock(db, items, -1)
      db.orders.unshift(order)
      return { id: order.id, total: order.total, items, payment }
    })
    res.status(201).json(placed)
  })

  app.get('/api/orders', requireAdmin, async (req, res) => res.json((await store.read()).orders))

  app.patch('/api/orders/:id', requireAdmin, async (req, res) => {
    const result = await store.write((db) => {
      const o = find(db.orders, req.params.id, 'Order')
      if ('status' in req.body && req.body.status !== o.status) {
        if (!ORDER_STATUSES.includes(req.body.status)) throw new BadRequest('Invalid status')
        // Cancelling puts the soaps back on the shelf; restoring a cancelled order takes them again.
        if (req.body.status === 'cancelled') moveStock(db, o.items, +1)
        else if (o.status === 'cancelled') moveStock(db, o.items, -1)
        o.status = req.body.status
      }
      if ('adminNotes' in req.body) o.adminNotes = str(req.body.adminNotes, 3000)
      o.updatedAt = new Date().toISOString()
      return { order: o, products: db.products }
    })
    res.json(result)
  })

  app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
    await store.write((db) => {
      const o = find(db.orders, req.params.id, 'Order')
      db.orders = db.orders.filter((x) => x !== o)
    })
    res.json({ ok: true })
  })

  // Express 4 doesn't catch async rejections on its own, so wrap every route handler.
  for (const layer of app._router.stack) {
    for (const l of layer.route?.stack ?? []) {
      const fn = l.handle
      if (fn.length < 4) l.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
    }
  }

  return app
}

// Call after any extra routes (like the built site) so it can turn errors into JSON.
export function finishApp(app) {
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
  app.use((err, req, res, next) => {
    if (err instanceof BadRequest || err instanceof multer.MulterError) return res.status(400).json({ error: err.message })
    if (err instanceof NotFound) return res.status(404).json({ error: err.message })
    console.error(err)
    res.status(500).json({ error: err.message?.startsWith('The shop is busy') ? err.message : 'Something went wrong' })
  })
  return app
}
