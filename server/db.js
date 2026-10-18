import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { contact, defaultHeroSlides, products as seedProducts, withSkinBenefits } from '../src/data.js'

const DB_FILE = process.env.DB_FILE || join(dirname(fileURLToPath(import.meta.url)), 'db.json')

function seed() {
  const now = new Date().toISOString()
  return {
    products: seedProducts.map((p, i) => ({
      ...withSkinBenefits(p),
      image: '',
      price: null,
      published: true,
      order: i + 1,
      createdAt: now,
      updatedAt: now,
    })),
    inquiries: [],
    settings: {
      ...contact,
      showTeaser: true,
      teaserText: 'Exciting new herbal blends are coming soon for every skin need.',
      heroSlides: defaultHeroSlides,
    },
  }
}

// In-memory state, flushed to disk after every change. Writes are chained so
// concurrent requests can't interleave, and go through a temp file + rename so
// a crash mid-write never leaves a half-written database.
export const db = existsSync(DB_FILE) ? JSON.parse(readFileSync(DB_FILE, 'utf8')) : seed()

// Migrate databases created before products had skin benefits / settings had hero slides.
let migrated = false
db.products = db.products.map((p) => {
  if (Array.isArray(p.skinBenefits)) return p
  migrated = true
  return withSkinBenefits(p)
})
if (!db.settings.heroSlides) {
  db.settings.heroSlides = defaultHeroSlides
  migrated = true
}

let queue = Promise.resolve()
export function save() {
  queue = queue.then(async () => {
    const tmp = `${DB_FILE}.tmp`
    await writeFile(tmp, JSON.stringify(db, null, 2))
    await rename(tmp, DB_FILE)
  })
  return queue
}

if (!existsSync(DB_FILE) || migrated) await save()

export const newId = () => randomUUID()
