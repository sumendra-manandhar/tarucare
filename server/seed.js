import { randomUUID } from 'node:crypto'
import { contact, defaultHeroSlides, defaultRoles, products as seedProducts, shopDefaults, withSkinBenefits } from '../src/data.js'

export const newId = () => randomUUID().slice(0, 8)

export function seed() {
  const now = new Date().toISOString()
  return {
    products: seedProducts.map((p, i) => ({
      ...withSkinBenefits(p),
      image: '',
      photos: [],
      price: p.price ?? null,
      stock: p.stock ?? null,
      published: true,
      order: i + 1,
      createdAt: now,
      updatedAt: now,
    })),
    inquiries: [],
    orders: [],
    customers: [],
    staff: [],
    roles: structuredClone(defaultRoles),
    settings: {
      ...contact,
      ...shopDefaults,
      showTeaser: true,
      teaserText: 'Exciting new herbal blends are coming soon for every skin need.',
      heroSlides: defaultHeroSlides,
    },
  }
}

// Brings databases created by older versions up to date. Returns true if anything changed.
export function migrate(db) {
  let changed = false
  db.products = db.products.map((p) => {
    let next = p
    if (!Array.isArray(next.skinBenefits)) next = withSkinBenefits(next)
    if (!Array.isArray(next.photos)) next = { ...next, photos: next.image ? [{ url: next.image, caption: '' }] : [], stock: next.stock ?? null }
    if (next !== p) changed = true
    return next
  })
  if (!db.settings.heroSlides) {
    db.settings.heroSlides = defaultHeroSlides
    changed = true
  }
  if (!Array.isArray(db.roles)) {
    db.roles = structuredClone(defaultRoles)
    changed = true
  }
  for (const key of ['orders', 'inquiries', 'customers', 'staff']) {
    if (!Array.isArray(db[key])) {
      db[key] = []
      changed = true
    }
  }
  for (const [k, v] of Object.entries(shopDefaults)) {
    if (!(k in db.settings)) {
      db.settings[k] = v
      changed = true
    }
  }
  return changed
}
