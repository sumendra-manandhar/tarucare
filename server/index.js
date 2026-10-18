import cookieParser from 'cookie-parser'
import express from 'express'
import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { benefitChoices, defaultHeroSlides, filters } from '../src/data.js'
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
  const image = str(body.image, 200)
  if (image && !image.startsWith('/uploads/')) throw new BadRequest('Invalid image')

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
    image,
    price,
    published: body.published !== false,
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : existing.order ?? db.products.length + 1,
  }
}

const sorted = (list) => [...list].sort((a, b) => a.order - b.order)

async function removeUpload(url) {
  if (!url?.startsWith('/uploads/')) return
  if (db.products.some((p) => p.image === url)) return // still referenced elsewhere
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
  if (prev.image && prev.image !== db.products[i].image) await removeUpload(prev.image)
  await save()
  res.json(db.products[i])
})

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const i = db.products.findIndex((p) => p.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Product not found' })
  const [removed] = db.products.splice(i, 1)
  await removeUpload(removed.image)
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
